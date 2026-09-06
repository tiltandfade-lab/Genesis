#!/usr/bin/env node
/* dev/state-eval/run.mjs — STATE-HYGIENE-EVAL §2 replay runner + §3 scorer.
   Spec: docs/STATE-HYGIENE-EVAL.md (SPEC-LOCKED 2026-07-06).

   Replays golden turn fixtures through the REAL engine (the bridgeless jsdom seam,
   dev/playtest-bridgeless.mjs) against a candidate DM provider — or against recorded
   responses with zero model calls — and scores the STATE HYGIENE (not the prose): did the
   events land, did the values move, did the clock tick, did the codex remember, were the dice
   honored, was the danger telegraphed, did rewards/losses land on the right owner.

   CLI (complete — these 11 flags, no others exist):
     node dev/state-eval/run.mjs [--provider recorded|seat] [--fixtures <glob-dir>] [--only hx-03]
                                 [--base http://127.0.0.1:5175] [--model glm-5.2] [--system docs/SEAT-PROMPT.md]
                                 [--selftest] [--write] [--write-budgets] [--rubric]
                                 [--merge-rubric <answers.json>] [--json]

   Deterministic dims (D1-D9) are the gate; rubric (M1-M2) NEVER touches them
   (BATCH3-GUARDRAILS J2). Zero model calls except --provider seat (dev-only, never CI).
*/
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HERE = dirname(fileURLToPath(import.meta.url));
const BRIDGELESS = join(ROOT, "dev/playtest-bridgeless.mjs");

// ---- dm-eval import (D6's voice adapter — read-only; scoreFixture is imported, never re-implemented) ----
import { scoreFixture as scoreVoiceFixture } from "../dm-eval/score.mjs";

// ---- arg parsing -------------------------------------------------------------
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--provider") a.provider = argv[++i];
    else if (t === "--fixtures") a.fixtures = argv[++i];
    else if (t === "--only") a.only = argv[++i];
    else if (t === "--base") a.base = argv[++i];
    else if (t === "--model") a.model = argv[++i];
    else if (t === "--system") a.system = argv[++i];
    else if (t === "--selftest") a.selftest = true;
    else if (t === "--write") a.write = true;
    else if (t === "--write-budgets") a.writeBudgets = true;
    else if (t === "--rubric") a.rubric = true;
    else if (t === "--merge-rubric") a.mergeRubric = argv[++i];
    else if (t === "--json") a.json = true;
  }
  return a;
}

function fail(code, msg) {
  process.stderr.write(msg + "\n");
  process.exit(code);
}

// ---- fixture loading ----------------------------------------------------------
function loadFixtures(dir, only, selftest) {
  const files = readdirSync(dir).filter(f => f.endsWith(".json")).sort();
  let names = files;
  if (selftest) names = names.filter(f => f.startsWith("nc-"));
  else if (!only) names = names.filter(f => f.startsWith("hx-"));
  if (only) names = names.filter(f => f.startsWith(only));
  return names.map(f => JSON.parse(readFileSync(join(dir, f), "utf-8")));
}

// ---- state-diff helpers (§2 "State-diff helpers (exact semantics)") ----------
function livingChar(state) {
  const w = state.U.worlds[state.U.activeWorldId];
  return (w.characters || []).filter(c => c.status === "living").slice(-1)[0] || null;
}

function pathGet(state, path) {
  const w = state.U.worlds[state.U.activeWorldId];
  if (path.startsWith("pc.")) {
    const c = livingChar(state);
    const rest = path.slice(3);
    if (rest === "status") return c ? c.status : null;
    if (rest === "name") return c ? c.name : null;
    if (!c) return null;
    return getIn(c.sheet, rest);
  }
  if (path.startsWith("clock.")) return getIn(w.clock, path.slice(6));
  if (path.startsWith("world.")) return getIn(w, path.slice(6));
  if (path.startsWith("codex:")) {
    const rest = path.slice(6);
    const dot = rest.indexOf(".");
    const id = dot >= 0 ? rest.slice(0, dot) : rest;
    const sub = dot >= 0 ? rest.slice(dot + 1) : "";
    const rec = w.codex && w.codex.records ? w.codex.records[id] : null;
    if (!rec) return null;
    return sub ? getIn(rec, sub) : rec;
  }
  if (path.startsWith("faction:")) {
    const rest = path.slice(8);
    const dot = rest.indexOf(".");
    const name = dot >= 0 ? rest.slice(0, dot) : rest;
    const sub = dot >= 0 ? rest.slice(dot + 1) : "";
    const fac = (w.factions || []).find(f => f.name === name);
    if (!fac) return null;
    return sub ? getIn(fac, sub) : fac;
  }
  if (path.startsWith("gs.")) {
    const rest = path.slice(3);
    const dot = rest.indexOf(".");
    const top = dot >= 0 ? rest.slice(0, dot) : rest;
    const sub = dot >= 0 ? rest.slice(dot + 1) : "";
    const val = state.gs ? state.gs[top] : undefined;
    if (val == null) return null;   // §2: a gs.-rooted path that hits a null key returns null, never throws
    return sub ? getIn(val, sub) : val;
  }
  if (path === "ledger") return w.ledger;
  return null;
}

function getIn(obj, dotted) {
  if (!dotted) return obj;
  let cur = obj;
  for (const key of dotted.split(".")) {
    if (cur == null) return null;
    cur = cur[key];
  }
  return cur == null ? null : cur;
}

function lengthOf(v) {
  if (v == null) return 0;
  if (Array.isArray(v)) return v.length;
  if (typeof v === "object") return Object.keys(v).length;
  return 0;
}

// Ops (complete enum): equals, movedFrom, increasedBy, decreasedBy, containsText, lengthGrewBy.
// Every op reports {before, after} — the assertion is always that the VALUE MOVED (BUG-01 law).
function evalOp(op, before, after, value) {
  switch (op) {
    case "equals":
      return { pass: JSON.stringify(after) === JSON.stringify(value), before, after };
    case "movedFrom":
      return { pass: JSON.stringify(before) !== JSON.stringify(after), before, after };
    case "increasedBy": {
      const b = Number(before) || 0, a = Number(after) || 0;
      return { pass: (a - b) >= value, before: b, after: a };
    }
    case "decreasedBy": {
      const b = Number(before) || 0, a = Number(after) || 0;
      return { pass: (b - a) >= value, before: b, after: a };
    }
    case "containsText": {
      const s = JSON.stringify(after);
      return { pass: typeof s === "string" && s.indexOf(value) >= 0, before, after };
    }
    case "lengthGrewBy": {
      const b = lengthOf(before), a = lengthOf(after);
      return { pass: (a - b) >= value, before: b, after: a };
    }
    default:
      return { pass: false, before, after };
  }
}

function assertMoved(before, after, assertSpec) {
  const b = pathGet(before, assertSpec.path);
  const a = pathGet(after, assertSpec.path);
  const r = evalOp(assertSpec.op, b, a, assertSpec.value);
  return { path: assertSpec.path, op: assertSpec.op, before: r.before, after: r.after, pass: r.pass };
}

// ---- digest section byte measurement (D9) -------------------------------------
// Ordinary turns now carry beat-digest/v1, not the complete bootstrap/debug dmDigest. Keep this
// declaration in lock-step with DM_BEAT_DIGEST_KEYS; verify-state-eval locks the resulting 28-section
// budget shape so a projection change cannot silently keep the old accounting.
const DM_DIGEST_KEYS = ["schema","view","slices","worldId","worldName","clock","location","setting","pc","powers","fronts","recentLedger","gazetteer","codex","minted","revealed","sessionLean","tarot","activeWalk","ambientPresence","combat","prepPending","levelUp","arrivalBrief","itemLegacy","itemCustody","bastion","pendingSituation","retrieval"];

function byteLen(v) {
  if (v === undefined) return 4;
  try { return Buffer.byteLength(JSON.stringify(v)); } catch (_) { return 4; }
}

function sectionBytes(digest) {
  const out = {};
  // worldId + worldName collapse into one "worldMeta" section so the 29-key vocabulary has 28
  // independently budgeted sections.
  out.worldMeta = byteLen({ worldId: digest.worldId, worldName: digest.worldName });
  for (const key of DM_DIGEST_KEYS) {
    if (key === "worldId" || key === "worldName") continue;
    out[key] = byteLen(digest[key] === undefined ? null : digest[key]);
  }
  return out;
}

// ---- advance_clock contract-dependency probe (D3) -----------------------------
let _advanceClockPresent = null;
function advanceClockInVocab() {
  if (_advanceClockPresent != null) return _advanceClockPresent;
  const src = readFileSync(join(ROOT, "src/world/dm.js"), "utf-8");
  const m = src.match(/const DM_EVENT_TYPES\s*=\s*(\[[^\]]*\])/);
  _advanceClockPresent = !!(m && m[1].includes("advance_clock"));
  return _advanceClockPresent;
}

// ---- bridgeless subprocess invocation ----------------------------------------
function runBridgeless(args) {
  const out = execFileSync("node", [BRIDGELESS, ...args], { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out);
}

function writeTempState(dir, state) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "state.json"), JSON.stringify(state));
}

function readTempState(dir) {
  return JSON.parse(readFileSync(join(dir, "state.json"), "utf-8"));
}

// ---- D6 seat/recorded response shape helper -----------------------------------
async function callSeat(base, model, systemPath, turn) {
  const systemText = readFileSync(systemPath, "utf-8");
  const body = {
    turnId: turn.turnId, lane: turn.lane, model, stream: true,
    messages: [
      { role: "system", content: systemText },
      { role: "user", content: JSON.stringify(turn) },
    ],
  };
  let res;
  try {
    res = await fetch(base + "/seat", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    });
  } catch (_) {
    fail(3, "seat unreachable — is the bridge running? (python3 dev/dm-bridge.py)");
  }
  if (res.status === 503) fail(3, "seat not configured");
  if (!res.ok) fail(3, "seat request failed: " + res.status);
  const text = await res.text();
  // SSE stream: concatenate delta text across `data: {...}` lines (tolerate a plain JSON body too).
  let full = "";
  const lines = text.split("\n").filter(l => l.startsWith("data:"));
  if (lines.length) {
    for (const l of lines) {
      const payload = l.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const obj = JSON.parse(payload);
        const delta = obj.choices && obj.choices[0] && (obj.choices[0].delta?.content || obj.choices[0].text);
        if (delta) full += delta;
      } catch (_) {}
    }
  } else {
    full = text;
  }
  return full;
}

function extractJsonBlock(text) {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") { depth--; if (depth === 0) {
      try { return JSON.parse(text.slice(start, i + 1)); } catch (_) { return null; }
    } }
  }
  return null;
}

// ---- per-fixture replay --------------------------------------------------------
async function replayFixture(fixture, provider, opts) {
  const tmp = mkdtempSync(join(tmpdir(), "state-eval-"));
  try {
    writeTempState(tmp, fixture.state);

    // Step 2: digest
    const digestArgs = ["digest", "--dir", tmp, "--seed", String(fixture.seed), "--action", fixture.turn.action];
    if (fixture.turn.rolls && fixture.turn.rolls.length) digestArgs.push("--rolls", JSON.stringify(fixture.turn.rolls));
    if (fixture.turn.opts) digestArgs.push("--opts", JSON.stringify(fixture.turn.opts));
    const digestOut = runBridgeless(digestArgs);

    // Step 3: response
    let response;
    let parseInfo = { ok: true, retries: 0 };
    if (provider === "recorded") {
      response = fixture.response;
    } else {
      const systemPath = opts.system || join(ROOT, "docs/SEAT-PROMPT.md");
      if (!existsSync(systemPath)) fail(3, "--system required (SEAT-PROMPT.md not yet authored)");
      let raw = await callSeat(opts.base, opts.model, systemPath, digestOut.turn);
      let parsed = extractJsonBlock(raw);
      if (!parsed) {
        parseInfo.retries = 1;
        const retryTurn = Object.assign({}, digestOut.turn, {
          action: digestOut.turn.action + "\n\nReply with ONLY the TurnResponse JSON."
        });
        raw = await callSeat(opts.base, opts.model, systemPath, retryTurn);
        parsed = extractJsonBlock(raw);
      }
      if (!parsed) { parseInfo.ok = false; response = { narration: "", events: [] }; }
      else response = parsed;
    }

    // Step 4: before-snapshot (post-digest — the player line is logged, nothing else mutated)
    const before = readTempState(tmp);

    // Step 5: apply
    let applyOut;
    if (parseInfo.ok) {
      applyOut = runBridgeless(["apply", "--dir", tmp, "--seed", String(fixture.seed), "--response", JSON.stringify(response)]);
    } else {
      applyOut = { ok: false, contractErrors: ["parse-fail"], appliedEvents: [], appliedResults: [], rollRequest: null };
    }

    // Step 6: after-snapshot
    const after = readTempState(tmp);

    return { fixture, digest: digestOut.digest, digestBytes: digestOut.digestBytes, lane: digestOut.lane || "unknown",
      route: digestOut.route, receipt: digestOut.receipt, turn: digestOut.turn,
      response, before, after, applyOut, parseInfo };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ---- §3 dimension scorers ------------------------------------------------------
function scoreD1(ctx) {
  const expect = ctx.fixture.expect && ctx.fixture.expect.requiredEvents;
  if (!expect || !expect.length) return { status: "skip", why: null, moved: [] };
  const moved = [];
  let allPass = true, why = null;
  for (const req of expect) {
    const evIdx = (ctx.response.events || []).findIndex(e => e.type === req.type);
    if (evIdx < 0) { allPass = false; why = "required event missing: " + req.type; continue; }
    const res = (ctx.applyOut.appliedResults || [])[evIdx];
    if (!res || res.res == null || res.res.ok !== true || res.res.untracked) {
      allPass = false; why = "event " + req.type + " did not apply cleanly (untracked or ok:false)"; continue;
    }
    const m = assertMoved(ctx.before, ctx.after, req.assert);
    moved.push(m);
    if (!m.pass) { allPass = false; why = "label-without-mutation — BUG-01 class (" + req.type + ")"; }
  }
  return { status: allPass ? "pass" : "fail", why, moved };
}

function scoreD2(ctx) {
  const errors = ctx.applyOut.contractErrors || [];
  if (errors.length) return { status: "fail", why: "contractErrors: " + errors.join("; "), moved: [] };
  const results = ctx.applyOut.appliedResults || [];
  const unknownTypes = [];
  for (const r of results) {
    if (r.res && r.res.ok === false) return { status: "fail", why: "engine refusal on " + r.type + ": " + (r.res.reason || "unknown"), moved: [] };
    if (r.res && r.res.untracked) return { status: "fail", why: "untracked event: " + r.type, moved: [] };
  }
  const forbidden = ctx.fixture.expect && ctx.fixture.expect.forbiddenEvents;
  const moved = [];
  if (forbidden && forbidden.length) {
    const present = (ctx.response.events || []).filter(e => forbidden.includes(e.type));
    if (present.length) return { status: "fail", why: "forbidden event present: " + present.map(e => e.type).join(","), moved: [] };
  }
  return { status: "pass", why: null, moved, unknownTypes };
}

function scoreD3(ctx) {
  const expect = ctx.fixture.expect && ctx.fixture.expect.clock;
  if (!expect) return { status: "skip", why: null, moved: [] };
  if (ctx.response.rollRequest) return { status: "skip", why: "mid-beat (rollRequest present)", moved: [] };
  if (expect.requiresAdvanceClock && !advanceClockInVocab()) {
    return { status: "pending-contract", why: "advance_clock not yet in DM_EVENT_TYPES", moved: [] };
  }
  const bw = ctx.before.U.worlds[ctx.before.U.activeWorldId].clock;
  const aw = ctx.after.U.worlds[ctx.after.U.activeWorldId].clock;
  const delta = (aw.day * 1440 + aw.min) - (bw.day * 1440 + bw.min);
  const pass = delta >= expect.minMinutes && delta <= expect.maxMinutes;
  return { status: pass ? "pass" : "fail", why: pass ? null : `clock moved ${delta}m, expected ${expect.minMinutes}-${expect.maxMinutes}m`,
    moved: [{ path: "clock", before: bw, after: aw }] };
}

function scoreD4(ctx) {
  const expect = ctx.fixture.expect && ctx.fixture.expect.location;
  const bw = ctx.before.U.worlds[ctx.before.U.activeWorldId];
  const aw = ctx.after.U.worlds[ctx.after.U.activeWorldId];
  // These typed events own legitimate currentNodeId transitions in production. The list names
  // public event seams, not low-level helpers: discovery/prep/start/move route through pcMoveTo;
  // walk_complete owns arrival/turnback; capture owns forced relocation; travel_start may use its
  // legacy instant-arrival fallback when the walk engine is unavailable.
  const teleportMovables = ["discovery","prep_contact","start_walk","move_node","walk_complete","capture","travel_start"];
  const nodeChanged = bw.currentNodeId !== aw.currentNodeId;
  if (nodeChanged) {
    const movementEvents = (ctx.applyOut.appliedResults || []).filter(r =>
      teleportMovables.includes(r.type) && (!r.res || r.res.ok !== false));
    if (!movementEvents.length) {
      return { status: "fail", why: "teleport — location moved with no movement event", moved: [{ path: "world.currentNodeId", before: bw.currentNodeId, after: aw.currentNodeId }] };
    }
  }
  if (!expect || ctx.response.rollRequest) return { status: "skip", why: null, moved: [] };
  const node = aw.map.nodes[aw.currentNodeId];
  const pass = node && node.name === expect.endNodeName;
  return { status: pass ? "pass" : "fail", why: pass ? null : `location is "${node ? node.name : null}", expected "${expect.endNodeName}"`, moved: [] };
}

function scoreD5(ctx) {
  const expect = ctx.fixture.expect && ctx.fixture.expect.codex;
  if (!expect || !expect.length) return { status: "skip", why: null, moved: [] };
  const moved = [];
  let allPass = true, why = null;
  for (const e of expect) {
    const b = ctx.before.U.worlds[ctx.before.U.activeWorldId].codex.records[e.id];
    const a = ctx.after.U.worlds[ctx.after.U.activeWorldId].codex.records[e.id];
    const bv = e.path ? getIn(b, e.path) : b;
    const av = e.path ? getIn(a, e.path) : a;
    const r = evalOp(e.op, bv, av, e.value);
    moved.push({ path: "codex:" + e.id + "." + e.path, before: r.before, after: r.after, pass: r.pass });
    if (!r.pass) { allPass = false; why = "codex:" + e.id + "." + e.path + " did not move as declared"; }
  }
  return { status: allPass ? "pass" : "fail", why, moved };
}

function scoreD6(ctx) {
  const rolls = ctx.fixture.turn.rolls || [];
  const reAskExpect = ctx.fixture.expect && ctx.fixture.expect.rolls && ctx.fixture.expect.rolls.reAskForbidden;
  let reAskFail = null;
  if (reAskExpect && reAskExpect.length && ctx.response.rollRequest) {
    const skill = ctx.response.rollRequest.skill;
    if (skill && reAskExpect.includes(skill)) reAskFail = "re-asked forbidden skill: " + skill;
  }
  const voice = scoreVoiceFixture({
    id: ctx.fixture.id, kind: ctx.fixture.kind, turn: { rolls },
    response: { narration: ctx.response.narration }, resolvedBranch: ctx.fixture.resolvedBranch,
  });
  const narratesFromRollsClean = voice.results.narratesFromRolls.clean;
  const neverRollsClean = voice.results.neverRollsPlayerDice.clean;
  let branchStatus = "skip";
  let branchWhy = null;
  if (ctx.fixture.resolvedBranch != null) {
    branchStatus = voice.results.honorsBindingMechanics.clean ? "pass" : "fail";
    branchWhy = voice.results.honorsBindingMechanics.why;
  }
  const allClean = narratesFromRollsClean && neverRollsClean && !reAskFail && (branchStatus !== "fail");
  if (!rolls.length && !reAskExpect) return { status: "skip", why: null, moved: [] };
  const why = reAskFail || voice.results.narratesFromRolls.why || voice.results.neverRollsPlayerDice.why || branchWhy;
  return { status: allClean ? "pass" : "fail", why, moved: [],
    detail: { narratesFromRolls: narratesFromRollsClean, neverRollsPlayerDice: neverRollsClean, branch: branchStatus } };
}

function scoreD7(ctx) {
  const expect = ctx.fixture.expect && ctx.fixture.expect.telegraph;
  if (!expect || !expect.lethal) return { status: "skip", why: null, moved: [] };
  const re = new RegExp(expect.evidenceRegex, "i");
  const bw = ctx.before.U.worlds[ctx.before.U.activeWorldId];
  const dmLines = (bw.dmlog || []).filter(l => l.role === "dm").map(l => l.text || "").join(" ");
  const digestText = JSON.stringify(ctx.digest);
  const pass = re.test(dmLines) || re.test(digestText);
  return { status: pass ? "pass" : "fail",
    why: pass ? null : "lethal commitment without a prior telegraph — CAL-1 requires the warning BEFORE the save, not narration after it",
    moved: [] };
}

function scoreD8(ctx) {
  const expect = ctx.fixture.expect && ctx.fixture.expect.owner;
  if (!expect || !expect.length) return { status: "skip", why: null, moved: [] };
  const moved = [];
  let allPass = true, why = null;
  for (const e of expect) {
    const b = pathGet(ctx.before, e.path);
    const a = pathGet(ctx.after, e.path);
    const r = evalOp(e.op, b, a, e.value);
    moved.push({ path: e.path, op: e.op, before: r.before, after: r.after, pass: r.pass });
    if (!r.pass) { allPass = false; why = `vanished reward — narrated but not persisted to any owner (${e.path} ${b}→${a}, expected ${e.op} ${e.value})`; }
  }
  return { status: allPass ? "pass" : "fail", why, moved };
}

function scoreD9(ctx, budgets) {
  const sb = sectionBytes(ctx.digest);
  const worst = { section: null, bytes: 0, ceiling: Infinity };
  let ok = true;
  for (const [key, bytes] of Object.entries(sb)) {
    const ceiling = budgets.sections[key];
    if (ceiling != null && bytes > ceiling) { ok = false; }
    if (ceiling != null && bytes / ceiling > worst.bytes / (worst.ceiling || 1)) worst.section = key, worst.bytes = bytes, worst.ceiling = ceiling;
  }
  const total = byteLen(ctx.digest);
  const totalCeiling = ctx.fixture.kind === "founding" ? budgets.totalFounding : budgets.totalSteady;
  if (total > totalCeiling) ok = false;
  return { ok, sections: sb, total, totalCeiling, worst };
}

// ---- run one fixture end to end ------------------------------------------------
async function scoreOneFixture(fixture, provider, opts, budgets) {
  const ctx = await replayFixture(fixture, provider, opts);
  const dims = {};
  dims.D1 = scoreD1(ctx);
  dims.D2 = scoreD2(ctx);
  dims.D3 = scoreD3(ctx);
  dims.D4 = scoreD4(ctx);
  dims.D5 = scoreD5(ctx);
  dims.D6 = scoreD6(ctx);
  dims.D7 = scoreD7(ctx);
  dims.D8 = scoreD8(ctx);
  const d9 = scoreD9(ctx, budgets);

  if (!ctx.parseInfo.ok) {
    for (const k of ["D1","D2","D3","D4","D5","D6","D7","D8"]) dims[k] = { status: "fail", why: "parse-fail", moved: [] };
  }

  return {
    id: fixture.id, kind: fixture.kind, lane: ctx.lane,
    parse: ctx.parseInfo,
    dims,
    unknownTypes: dims.D2.unknownTypes || [],
    digestBytes: ctx.digestBytes,
    _d9: d9,
  };
}

// ---- budgets --------------------------------------------------------------------
function roundUpTo128(n) { return Math.max(256, Math.ceil(n / 128) * 128); }

function generateBudgets(scoredFixtures) {
  const sections = {};
  for (const sf of scoredFixtures) {
    for (const [key, bytes] of Object.entries(sf._d9.sections)) {
      sections[key] = Math.max(sections[key] || 0, bytes);
    }
  }
  const out = { sections: {}, totalFounding: 6144, totalSteady: 3072 };
  for (const [key, maxBytes] of Object.entries(sections)) {
    out.sections[key] = roundUpTo128(maxBytes * 1.25);
  }
  return out;
}

function loadBudgets() {
  const p = join(HERE, "budgets.json");
  if (!existsSync(p)) fail(4, "budgets.json missing — run --write-budgets first");
  return JSON.parse(readFileSync(p, "utf-8"));
}

// ---- selftest (§2 --selftest: run ONLY nc-* fixtures, assert every negative control CAUGHT) ----
const NC_DIM = { "nc-13-impossible": "D2", "nc-14-label-only": "D1", "nc-15-roll-defied": "D6", "nc-16-vanished-reward": "D8" };

async function runSelftest(fixturesDir, budgets) {
  const fixtures = loadFixtures(fixturesDir, null, true);
  let caught = 0;
  const results = [];
  for (const fx of fixtures) {
    const scored = await scoreOneFixture(fx, "recorded", {}, budgets);
    const dim = NC_DIM[fx.id];
    const isCaught = scored.dims[dim] && scored.dims[dim].status === "fail";
    if (isCaught) caught++;
    results.push({ id: fx.id, dim, caught: isCaught, why: scored.dims[dim] && scored.dims[dim].why });
  }
  console.log("negative controls: " + caught + "/" + fixtures.length + " caught");
  for (const r of results) console.log(`  [${r.caught ? "CAUGHT" : "MISSED"}] ${r.id}.${r.dim}: ${r.why || ""}`);
  return caught === fixtures.length;
}

// ---- merge-rubric (§2 --merge-rubric; R6: must not touch fixtures[].dims / summary.deterministic*) ----
function findNewestScorecard(dir, provider) {
  const files = readdirSync(dir).filter(f => f.startsWith("scorecard-") && f.endsWith(".json"));
  if (!files.length) return null;
  // §8.4's "-n" suffix is an UNPADDED integer (scorecard-recorded-20260707-10.json sorts before
  // -9.json lexicographically) — mtime is the only reliable "newest" signal across many same-day
  // reruns, so sort by modification time, not the filename string.
  const withMtime = files.map(f => ({ f, mtime: statSync(join(dir, f)).mtimeMs }));
  withMtime.sort((a, b) => a.mtime - b.mtime);
  return join(dir, withMtime[withMtime.length - 1].f);
}

function mergeRubric(answersPath, scorecardDir) {
  if (!answersPath || !existsSync(answersPath)) fail(2, "--merge-rubric requires a readable answers.json");
  const answers = JSON.parse(readFileSync(answersPath, "utf-8"));
  const target = findNewestScorecard(scorecardDir);
  if (!target) fail(2, "no scorecard found to merge into");
  const scorecard = JSON.parse(readFileSync(target, "utf-8"));
  scorecard.rubric = answers;   // additive top-level key only — never touches fixtures[].dims or summary.deterministic*
  writeFileSync(target, JSON.stringify(scorecard, null, 2) + "\n");
  console.log("merged rubric into " + target);
}

// ---- main -----------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const provider = args.provider || "recorded";
  const fixturesDir = args.fixtures ? args.fixtures : join(HERE, "fixtures");
  const outDir = join(HERE, "out");
  mkdirSync(outDir, { recursive: true });

  if (args.mergeRubric && args.provider === "seat") fail(2, "--merge-rubric is mutually exclusive with --provider seat");
  if (args.mergeRubric) { mergeRubric(args.mergeRubric, outDir); return; }

  if (args.writeBudgets) {
    const fixtures = loadFixtures(fixturesDir, null, false);
    const scored = [];
    for (const fx of fixtures) scored.push(await scoreOneFixture(fx, "recorded", {}, { sections: {}, totalFounding: 6144, totalSteady: 3072 }));
    const budgets = generateBudgets(scored);
    writeFileSync(join(HERE, "budgets.json"), JSON.stringify(budgets, null, 2) + "\n");
    console.log("wrote budgets.json — " + Object.keys(budgets.sections).length + " sections");
    return;
  }

  const budgets = loadBudgets();

  if (args.selftest) {
    const ok = await runSelftest(fixturesDir, budgets);
    // same flush-before-exit discipline as the main scorecard path below (small output here, but
    // consistent — a race is a race regardless of payload size).
    process.stdout.write("", () => process.exit(ok ? 0 : 1));
    return;
  }

  if (provider === "seat") {
    if (!args.system && !existsSync(join(ROOT, "docs/SEAT-PROMPT.md"))) {
      fail(3, "--system required (SEAT-PROMPT.md not yet authored)");
    }
  }

  const fixtures = loadFixtures(fixturesDir, args.only, false);
  const scoredFixtures = [];
  for (const fx of fixtures) {
    scoredFixtures.push(await scoreOneFixture(fx, provider, { base: args.base || "http://127.0.0.1:5175", model: args.model, system: args.system }, budgets));
  }

  // summary
  let deterministicPass = 0, deterministicFail = 0, skipped = 0, pendingContract = 0;
  let unknownTypeCount = 0;
  let worstBudget = { section: null, bytes: 0, ceiling: Infinity };
  let budgetOk = true;
  const fixturesOut = [];
  for (const sf of scoredFixtures) {
    const dimEntries = Object.entries(sf.dims);
    let fixturePass = true;
    for (const [name, d] of dimEntries) {
      if (d.status === "pass") deterministicPass++;
      else if (d.status === "fail") { deterministicFail++; fixturePass = false; }
      else if (d.status === "skip") skipped++;
      else if (d.status === "pending-contract") pendingContract++;
    }
    unknownTypeCount += (sf.unknownTypes || []).length;
    if (!sf._d9.ok) budgetOk = false;
    if (sf._d9.worst && sf._d9.worst.bytes > worstBudget.bytes) worstBudget = sf._d9.worst;
    fixturesOut.push({ id: sf.id, kind: sf.kind, lane: sf.lane, parse: sf.parse, dims: sf.dims, unknownTypes: sf.unknownTypes, digestBytes: sf.digestBytes });
  }
  const vocabDrift = fixtures.length > 0 && (unknownTypeCount / fixtures.length) > 1;

  const summary = {
    deterministicPass, deterministicFail, skipped, pendingContract,
    vocabDrift, negativeControlsCaught: null,
    budget: { ok: budgetOk, worst: worstBudget },
    cost: { usd: 0, estimated: provider !== "recorded" },
  };

  const scorecard = {
    provider: provider === "seat" ? "seat:" + (args.model || "unknown") : "recorded",
    generatedAt: new Date().toISOString(),
    fixtures: fixturesOut,
    summary,
    rubric: null,
  };

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  let n = 0;
  let jsonPath, mdPath;
  do {
    n++;
    const suffix = n === 1 ? "" : "-" + n;
    jsonPath = join(outDir, `scorecard-${provider}-${stamp}${suffix}.json`);
    mdPath = join(outDir, `scorecard-${provider}-${stamp}${suffix}.md`);
  } while (existsSync(jsonPath));
  writeFileSync(jsonPath, JSON.stringify(scorecard, null, 2) + "\n");

  const mdLines = [`# state-hygiene scorecard — ${scorecard.provider} — ${scorecard.generatedAt}`, ""];
  for (const f of fixturesOut) {
    mdLines.push(`## ${f.id} (${f.kind})`);
    for (const [name, d] of Object.entries(f.dims)) {
      if (d.status === "skip") continue;
      mdLines.push(`- ${name}: ${d.status}${d.why ? " — " + d.why : ""}`);
      for (const m of (d.moved || [])) mdLines.push(`    ${m.path}: ${JSON.stringify(m.before)} → ${JSON.stringify(m.after)}`);
    }
    mdLines.push("");
  }
  writeFileSync(mdPath, mdLines.join("\n") + "\n");

  if (args.write && provider === "recorded") {
    const { generatedAt, ...persisted } = scorecard;
    writeFileSync(join(HERE, "baseline-recorded.json"), JSON.stringify(persisted, null, 2) + "\n");
  }

  // write, then exit ONLY after stdout has flushed (dev/playtest-bridgeless.mjs's `out()` idiom —
  // a bare process.exit() races a large payload's write and truncates it at the pipe buffer size).
  const exitCode = deterministicFail === 0 ? 0 : 1;
  const text = args.json
    ? JSON.stringify(scorecard, null, 2) + "\n"
    : `state-hygiene: ${fixtures.length}/${fixtures.length} fixtures scored · deterministic ${deterministicPass} pass / ${deterministicFail} fail · pending-contract ${pendingContract} · negative controls not run (use --selftest) · budget ${budgetOk ? "OK" : "FAIL"}\n`;
  process.stdout.write(text, () => process.exit(exitCode));
}

main().catch(e => { process.stderr.write("[state-eval error] " + (e && e.stack ? e.stack : e) + "\n"); process.exit(1); });
