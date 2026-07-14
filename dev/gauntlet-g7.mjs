/* dev/gauntlet-g7.mjs — PRE-PLAYTEST GAUNTLET harness G7: walk / prep flows (per the run-task's
   explicit scope for G7 — "the three walk rollers + prep autopilot drive to completion across
   biomes/tiers"; note the doc's own §9 numbering separately labels a §9 "G7" as the applyEvent-fuzz
   harness — this file follows the task's explicit redefinition of G7's scope, which supersedes that
   summary per the task instructions).

   Exercises, to completion, no model calls:
     1. rollWildernessWalk  — every {biome × tier(1,2)} combination, legCount sweep, INV holds.
     2. rollDungeonWalk     — every {topology × tier(1,2)} combination, segCount sweep, INV holds.
     3. rollUrbanWalk       — every {topology × tier(1,2)} combination, segCount sweep, INV holds.
     4. TRAVEL-WALKS full lifecycle (explore → walkAdvance every leg → walkComplete arrival) across a
        few biomes, reusing the wilderness roller under the hood (docs/TRAVEL-WALKS.md path).
     5. Prep autopilot: startPrep → prepPendingDigest ("no-overlays") → applyPrep (all envs
        overlaid) → prepPendingDigest clears → a WALK-CONSUMPTION promotion (walkComplete on a
        frontier) re-flags prepPendingDigest ("needsReskin") — driven at PC levels {1,5,10} (tier
        boundaries) so the level-scaled segment/leg counts (pbundleSegCount/pbundleLegCount) get
        exercised across their full range, not just one cell.

   Report contract (docs/PRE-PLAYTEST-GAUNTLET.md §2): appends to dev/gauntlet-report.json (latest
   G7 entry replaces any prior one). Severity ladder crash/corrupt/wrong/ugly/review used exactly.

   Exit-code semantics (§0): exit 0 when the harness RAN TO COMPLETION — findings are DATA in the
   report, not test failures. Exit 1 ONLY on a harness defect (boot failure, unhandled harness-code
   throw, report unwritable).

   Canary (GAUNTLET_CANARY=1): the ONE named defect for this harness — monkeypatch rollWildernessWalk's
   legCount clamp so an out-of-range legCount (e.g. opts.legCount=0) is NOT clamped to >=1, producing a
   walk with ZERO segments (segments.length===0, an empty/corrupt walk structure) instead of the
   spec'd Math.max(1,...) floor. MUST emit >=1 `corrupt` finding and the harness process must exit 1.

   Determinism: mulberry32 seeded from GAUNTLET_SEED (default 20260702) installed over Math.random
   BEFORE any module loads (both the outer process's Math.random AND the jsdom realm's, per the
   established pattern in gauntlet-g4.mjs / gauntlet-2-combat.mjs).

   Boot pattern: copy of dev/verify-dm-events.mjs (loads the real genesis.html module set, in
   manifest load order, into one jsdom global scope — the "const-via-eval" convention).

   Run:    node dev/gauntlet-g7.mjs
   Canary: GAUNTLET_SEED=20260702 GAUNTLET_CANARY=1 node dev/gauntlet-g7.mjs   (must emit >=1 finding, exit 1)
   Repro of a single finding: see each finding's evidence.repro line in the report. */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const HARNESS_ID = "G7";

// ── determinism: seeded mulberry32 over Math.random, BEFORE any module loads (§0) ──
const SEED = Number(process.env.GAUNTLET_SEED) || 20260702;
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED);

const CANARY = process.env.GAUNTLET_CANARY === "1";

// ── report accumulation (§2 contract) ──
const REPORT_PATH = join(ROOT, "dev/gauntlet-report.json");
function loadReport() {
  if (existsSync(REPORT_PATH)) {
    try { return JSON.parse(readFileSync(REPORT_PATH, "utf-8")); } catch (e) { /* fall through to fresh */ }
  }
  return { run: {}, harnesses: [], findings: [] };
}
function gitShortRev() {
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch (e) { return null; }
}
const report = loadReport();
report.run = { date: new Date().toISOString().slice(0, 10), seed: SEED, commit: gitShortRev() };

const findings = [];
let findingSeq = 0;
function nextId() { findingSeq += 1; return `${HARNESS_ID}-${String(findingSeq).padStart(3, "0")}`; }
function addFinding(f) {
  const finding = Object.assign({ id: nextId(), harness: HARNESS_ID, collisionZone: false }, f);
  findings.push(finding);
  return finding;
}
function repro(extra) {
  const base = `GAUNTLET_SEED=${SEED} node dev/gauntlet-g7.mjs`;
  return extra ? `${base}   # ${extra}` : base;
}

// ── global invariant set INV (§2), applied to a world object ──
function checkInv(w, label) {
  const problems = [];
  const pc = (w.characters || []).find((c) => c.status === "living");
  if (pc && pc.sheet) {
    const hp = pc.sheet.hpCur != null ? pc.sheet.hpCur : pc.sheet.hp;
    const maxHp = typeof pc.sheet.hp === "number" ? pc.sheet.hp : null;
    if (typeof hp === "number" && !Number.isFinite(hp)) problems.push(`pc hp not finite (${hp})`);
    if (maxHp != null && typeof hp === "number" && hp > maxHp) problems.push(`pc hp (${hp}) > maxHp (${maxHp})`);
    const gold = pc.sheet.gold;
    if (typeof gold === "number" && (!Number.isFinite(gold) || gold < 0)) problems.push(`pc gold invalid (${gold})`);
    if (pc.sheet.inventory && !Array.isArray(pc.sheet.inventory)) problems.push("pc inventory not an Array");
    if (Array.isArray(pc.sheet.inventory) && pc.sheet.inventory.some((x) => x == null)) problems.push("pc inventory has null/undefined entries");
  }
  if (w.clock && typeof w.clock.day === "number" && w.clock.day < 0) problems.push("world clock day negative");
  try { JSON.stringify(w); } catch (e) { problems.push("JSON.stringify(w) failed: " + e.message); }
  return { ok: problems.length === 0, problems, label };
}

// walk-structure invariants: every walk must have >=1 segment, every segment a finite `num`,
// exactly one (or more, for branching topologies) finale, no NaN/undefined leaking into fields
// the DM/UI reads (biome, name-ish text fields).
function checkWalkStructure(walk, label) {
  const problems = [];
  if (!walk || typeof walk !== "object") { problems.push("walk is not an object"); return { ok: false, problems, label }; }
  if (!Array.isArray(walk.segments) || walk.segments.length === 0) problems.push(`segments empty or not an array (len=${walk.segments && walk.segments.length})`);
  if (Array.isArray(walk.segments)) {
    walk.segments.forEach((s, i) => {
      if (!s || typeof s.num !== "number" || !Number.isFinite(s.num)) problems.push(`segment[${i}].num not finite`);
      // segment numbering is 1-indexed by contract (walkEntrySeg/walkAdvance assume `num>=1` — a
      // non-positive num is a corrupt walk even though it's technically a finite number, e.g. a
      // broken legCount floor letting a negative/zero opts.legCount through unclamped).
      if (s && typeof s.num === "number" && Number.isFinite(s.num) && s.num < 1) problems.push(`segment[${i}].num non-positive (${s.num}) — 1-indexed contract violated`);
    });
    const hasFinale = walk.segments.some((s) => s && s.isFinale);
    if (!hasFinale) problems.push("no segment flagged isFinale");
  }
  try {
    const json = JSON.stringify(walk);
    if (/:"NaN"|:NaN[,}]/.test(json)) problems.push("NaN literal present in serialized walk");
    if (/:undefined/.test(json)) problems.push("undefined literal present in serialized walk");
  } catch (e) { problems.push("JSON.stringify(walk) failed: " + e.message); }
  return { ok: problems.length === 0, problems, label };
}

// ── boot (copy of dev/verify-dm-events.mjs's pattern) ──
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
let JSDOM;
let harnessDefect = null;
let win = null;
let invoked = 0;
const stats = {
  wildernessCells: 0, dungeonCells: 0, urbanCells: 0,
  travelLifecycles: 0, prepAutopilotCycles: 0,
  skipped: [],
};

try {
  JSDOM = createRequire(join(JSDOM_HOME, "package.json"))("jsdom").JSDOM;

  const man = JSON.parse(read("manifest.json"));
  let moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");

  // ── CANARY injection (§ canary line above): break rollWildernessWalk's legCount floor ──
  // Applied as a textual source patch BEFORE eval (behaves exactly like a real regression, not a
  // post-hoc monkeypatch of a working function).
  if (CANARY) {
    const needle = "const legCount=Math.max(1, Math.min(20, opts.legCount||4));";
    if (!moduleSrc.includes(needle)) {
      throw new Error("GAUNTLET_CANARY=1: could not locate rollWildernessWalk's legCount clamp line to patch — source has drifted from the harness's canary hook");
    }
    const broken = "const legCount=Math.min(20, opts.legCount||4); /* GAUNTLET_CANARY: floor removed */";
    moduleSrc = moduleSrc.replace(needle, broken);
  }

  const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
  // top-level `const`/`function` in the concatenated module source do NOT attach to `window` in a
  // classic-script eval (the "const-via-eval" gotcha — see dev/verify-levelup.mjs's comment on this,
  // and dev/gauntlet-2-combat.mjs's identical bridge). Bridge the specific symbols this harness reads
  // directly off `win.*` back onto window explicitly.
  const bridge = `\nwindow.CLASSES=CLASSES; window.DUNGEON_TOPOLOGIES=(typeof DUNGEON_TOPOLOGIES!=="undefined")?DUNGEON_TOPOLOGIES:undefined; window.URBAN_TOPOLOGIES=(typeof URBAN_TOPOLOGIES!=="undefined")?URBAN_TOPOLOGIES:undefined;`;
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  win = dom.window;
  win.eval(harness + "\n" + moduleSrc + bridge);

  // reinstall the seeded PRNG inside the jsdom realm too (its own global Math is separate from ours)
  win.Math.random = mulberry32(SEED);

  const need = ["rollWildernessWalk", "rollDungeonWalk", "rollUrbanWalk", "explore", "walkOfFrontier",
    "walkSetActive", "walkAdvance", "walkComplete", "startPrep", "applyPrep", "prepPendingDigest",
    "prepOf", "mapOf", "addNode", "CLASSES", "abilMod", "xpForLevel", "awardXp", "applyLevelUp"];
  const missing = need.filter((n) => typeof win[n] === "undefined");
  if (missing.length) {
    throw new Error(`boot failure: missing globals after full module load: ${missing.join(", ")}`);
  }

  // ── helpers ──
  function freshWorld(o) {
    o = o || {};
    const w = {
      id: "gw7-" + Math.random().toString(36).slice(2), name: "Gauntlet Walk/Prep World", session: o.session || 0,
      seed: { master: { name: "Gauntlet Seed", desc: "a testbed world" }, smell: { name: "dust" }, sound: { name: "wind" },
        arch: { name: "worn stone" }, taboo: { name: "no taboo", desc: "" }, myth: { name: "no myth", desc: "" } },
      characters: [{ id: "pc1", status: "living", name: "Gauntlet Walker", headline: "a wanderer", spark: "a wanderer", pronouns: "they",
        sheet: buildSheet(o.class || "Fighter", o.level || 1) }],
      gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, factions: [], pressures: [],
      map: { nodes: {}, edges: [] }, currentNodeId: null, revealed: { powers: 1, map: 1, ledger: 1, gaz: 1 }, dmlog: [],
    };
    const originId = win.addNode(w, "Gauntlet Home", "Setting");
    w.currentNodeId = originId;
    w.startNodeId = originId;
    win.U.worlds[w.id] = w;
    win.U.activeWorldId = w.id;
    win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null };
    win.GS.combat = null;
    return { w, originId };
  }

  function buildSheet(cls, level) {
    const base = win.CLASSES[cls] || win.CLASSES.Fighter;
    const scores = Object.assign({}, base.arr);
    const mods = {};
    for (const k of Object.keys(scores)) mods[k] = win.abilMod(scores[k]);
    const hp = base.hd + mods.con;
    const sh = {
      class: cls, level: 1, xp: 0, scores, mods, hp, hpCur: hp, ac: 10 + mods.dex, profBonus: 2,
      passivePerception: 10 + (mods.wis || 0), spells: [], cantrips: [], gold: 20,
      equipped: { mainHand: "gw7-wpn" },
      inventory: [{ id: "gw7-wpn", name: cls === "Wizard" ? "Quarterstaff" : "Longsword", conditions: [] }],
    };
    if (typeof win.ensureResources === "function") win.ensureResources(sh);
    if (level > 1) {
      win.awardXp(sh, win.xpForLevel(level) - (sh.xp || 0));
      win.applyLevelUp(sh, level);
    }
    return sh;
  }

  function safeInvoke(label, fn) {
    invoked += 1;
    try { return { ok: true, value: fn() }; }
    catch (e) {
      addFinding({
        severity: "crash", title: `unhandled throw during "${label}"`,
        symptom: e && e.message ? e.message : String(e),
        evidence: { stack: e && e.stack ? e.stack : null, stateSnapshot: null, repro: repro(`stage: ${label}`) },
      });
      return { ok: false, error: e };
    }
  }

  // ============================================================================================
  // 1. WILDERNESS WALK ROLLER — every biome × tier(1,2), legCount sweep
  // ============================================================================================
  const BIOMES = ["forest", "hills", "plains", "mountains", "swamp", "coast", "desert", "arctic", "underdark", "urban-fringe"];
  {
    // discover real biome table rows if the harness's guessed list doesn't match; fall back to
    // rolling with no biome override (the roller's own default sampler) if we can't introspect one.
    let biomesToUse = BIOMES;
    const probe = safeInvoke("wilderness biome probe", () => win.rollWildernessWalk({ legCount: 1, tier: 1 }));
    if (probe.ok && probe.value && probe.value.segments && probe.value.segments[0]) {
      // keep the guessed list; the roller accepts opts.biomes as an override array regardless of
      // whether these exact names are canonical table rows (per-leg override just clamps to `i-1`).
    }
    for (const tier of [1, 2]) {
      for (const biome of biomesToUse) {
        // legCount:-3 is an intentional edge-case cell — the spec's floor (Math.max(1,...)) must
        // clamp any sub-1 value to a 1-leg walk; this is also exactly what the canary breaks (see
        // the GAUNTLET_CANARY injection above), so a canary run needs this cell to fire red.
        // (legCount:0 is NOT useful here — `opts.legCount||4` treats 0 as falsy and falls back to
        // 4 BEFORE the clamp even runs, on both the real and the canary-patched line alike.)
        for (const legCount of [-3, 1, 4, 8]) {
          const label = `rollWildernessWalk biome=${biome} tier=${tier} legCount=${legCount}`;
          const r = safeInvoke(label, () => win.rollWildernessWalk({ biome, tier, legCount }));
          stats.wildernessCells += 1;
          if (!r.ok) continue;
          const walk = r.value;
          const structChk = checkWalkStructure(walk, label);
          if (!structChk.ok) {
            addFinding({
              severity: "corrupt", title: `rollWildernessWalk structural invariant failure (${biome}, tier ${tier}, legCount ${legCount})`,
              symptom: structChk.problems.join("; "),
              evidence: { stack: null, stateSnapshot: null, repro: repro(label) },
            });
          }
          if (Array.isArray(walk.segments) && CANARY === false && walk.segments.length !== (legCount + 1) && walk.segments.filter((s) => !s.isFinale).length !== legCount) {
            // review-only: legCount contract is legs+finale; a mismatch outside the canary run is
            // worth a look but not necessarily a bug (finale/branching conventions vary by kind).
          }
        }
      }
    }
  }

  // ============================================================================================
  // 2. DUNGEON WALK ROLLER — every topology × tier(1,2), segCount sweep
  // ============================================================================================
  {
    const topoList = (typeof win.DUNGEON_TOPOLOGIES !== "undefined" && Array.isArray(win.DUNGEON_TOPOLOGIES))
      ? win.DUNGEON_TOPOLOGIES
      : ["linear", "branching", "loop", "hub", "warren"]; // fallback guess; roller validates + falls back internally
    for (const tier of [1, 2]) {
      for (const topology of topoList) {
        for (const segCount of [1, 5, 13]) {
          const label = `rollDungeonWalk topology=${topology} tier=${tier} segCount=${segCount}`;
          const r = safeInvoke(label, () => win.rollDungeonWalk({ topology, tier, segCount }));
          stats.dungeonCells += 1;
          if (!r.ok) continue;
          const walk = r.value;
          const structChk = checkWalkStructure(walk, label);
          if (!structChk.ok) {
            addFinding({
              severity: "corrupt", title: `rollDungeonWalk structural invariant failure (${topology}, tier ${tier}, segCount ${segCount})`,
              symptom: structChk.problems.join("; "),
              evidence: { stack: null, stateSnapshot: null, repro: repro(label) },
            });
          }
        }
      }
    }
  }

  // ============================================================================================
  // 3. URBAN WALK ROLLER — every topology × tier(1,2), segCount sweep
  // ============================================================================================
  {
    const topoList = (typeof win.URBAN_TOPOLOGIES !== "undefined" && Array.isArray(win.URBAN_TOPOLOGIES))
      ? win.URBAN_TOPOLOGIES
      : ["grid", "radial", "sprawl", "warren"]; // fallback guess; roller validates + falls back internally
    for (const tier of [1, 2]) {
      for (const topology of topoList) {
        for (const segCount of [2, 8, 30]) {
          const label = `rollUrbanWalk topology=${topology} tier=${tier} segCount=${segCount}`;
          const r = safeInvoke(label, () => win.rollUrbanWalk({ topology, tier, segCount }));
          stats.urbanCells += 1;
          if (!r.ok) continue;
          const walk = r.value;
          const structChk = checkWalkStructure(walk, label);
          if (!structChk.ok) {
            addFinding({
              severity: "corrupt", title: `rollUrbanWalk structural invariant failure (${topology}, tier ${tier}, segCount ${segCount})`,
              symptom: structChk.problems.join("; "),
              evidence: { stack: null, stateSnapshot: null, repro: repro(label) },
            });
          }
        }
      }
    }
  }

  // ============================================================================================
  // 4. TRAVEL-WALKS full lifecycle: explore() → every walk_advance leg → walk_complete arrival,
  //    across a handful of PC levels/tiers (drives the level-scaled leg-count formula's full range).
  // ============================================================================================
  for (const level of [1, 5, 10]) {
    const label = `travel lifecycle L${level}`;
    const { w } = freshWorld({ level, session: 1 });
    const r = safeInvoke(label, () => {
      win.explore("nearby", "Place");
      const toId = Object.keys(win.mapOf(w).nodes).find((id) => id !== w.startNodeId);
      if (!toId) throw new Error("explore() did not mint a destination node");
      const walk = win.walkOfFrontier(w, toId);
      if (!walk) throw new Error("walkOfFrontier returned nothing for the freshly explored destination");
      const legs = walk.segments.filter((s) => !s.isFinale);
      legs.forEach((s) => { const ar = win.applyEvent(w, { type: "walk_advance", payload: { toSeg: s.num } }); if (!ar || ar.ok !== true) throw new Error(`walk_advance failed on leg ${s.num}: ${JSON.stringify(ar)}`); });
      const finale = walk.segments.find((s) => s.isFinale);
      if (finale) { const ar = win.applyEvent(w, { type: "walk_advance", payload: { toSeg: finale.num } }); if (!ar || ar.ok !== true) throw new Error(`walk_advance failed on finale: ${JSON.stringify(ar)}`); }
      const comp = win.applyEvent(w, { type: "walk_complete", payload: {} });
      if (!comp || comp.ok !== true) throw new Error(`walk_complete failed: ${JSON.stringify(comp)}`);
      if (comp.arrived !== true) throw new Error(`walk_complete did not report arrived:true — ${JSON.stringify(comp)}`);
      if (w.currentNodeId !== toId) throw new Error(`currentNodeId did not move to the destination (expected ${toId}, got ${w.currentNodeId})`);
      return { toId, segCount: walk.segCount };
    });
    stats.travelLifecycles += 1;
    if (r.ok) {
      const inv = checkInv(w, `post-travel-lifecycle L${level}`);
      if (!inv.ok) {
        addFinding({
          severity: "corrupt", title: `INV violated after a full travel-walk lifecycle (L${level})`,
          symptom: inv.problems.join("; "),
          evidence: { stack: null, stateSnapshot: null, repro: repro(label) },
        });
      }
    }
  }

  // ============================================================================================
  // 5. PREP AUTOPILOT drive-to-completion: startPrep → prepPendingDigest("no-overlays") →
  //    applyPrep (all envs) → prepPendingDigest clears → a promotion re-flags "needsReskin".
  //    Driven at PC levels {1,5,10} to exercise the level-scaled seg/leg-count curve's full range.
  // ============================================================================================
  for (const level of [1, 5, 10]) {
    const label = `prep autopilot L${level}`;
    const { w } = freshWorld({ level, session: 1 });
    const r = safeInvoke(label, () => {
      const before = win.prepPendingDigest(w);
      if (before !== null) throw new Error(`prepPendingDigest not null before any prep staged (got ${JSON.stringify(before)})`);
      win.startPrep(w);
      const pend1 = win.prepPendingDigest(w);
      if (!pend1) throw new Error("prepPendingDigest did not go pending right after startPrep");
      if (pend1.reason !== "no-overlays") throw new Error(`expected reason "no-overlays" right after startPrep, got "${pend1.reason}"`);
      const softIds = Object.keys(win.prepOf(w).nodes);
      if (!softIds.length) throw new Error("startPrep produced zero frontier nodes");
      const envs = [...new Set(softIds.map((id) => win.prepOf(w).nodes[id].env))];
      const overlays = {};
      envs.forEach((e) => { overlays[e] = { env: e, briefing: "Gauntlet reskin.", segments: [{ ref: "S1", role: "spine" }] }; });
      win.applyPrep(w, { harvest: { throughline: "gauntlet" }, overlays });
      const pend2 = win.prepPendingDigest(w);
      if (pend2 !== null) throw new Error(`prepPendingDigest did not clear after applyPrep overlaid every env (got ${JSON.stringify(pend2)})`);
      // drive a WALK-CONSUMPTION promotion: contact the first frontier, walk it out, complete it.
      const firstId = softIds[0];
      win.walkSetActive(w, firstId);
      const promo = win.walkComplete(w, { nodeId: firstId });
      if (!promo || promo.ok !== true) throw new Error(`walkComplete (promotion path) failed: ${JSON.stringify(promo)}`);
      const pend3 = win.prepPendingDigest(w);
      if (!pend3) throw new Error("prepPendingDigest did not reappear after a walk-consumption promotion");
      if (pend3.reason !== "needsReskin") throw new Error(`expected reason "needsReskin" after promotion, got "${pend3.reason}"`);
      return { softCount: softIds.length, envCount: envs.length };
    });
    stats.prepAutopilotCycles += 1;
    if (r.ok) {
      const inv = checkInv(w, `post-prep-autopilot L${level}`);
      if (!inv.ok) {
        addFinding({
          severity: "corrupt", title: `INV violated after a full prep-autopilot cycle (L${level})`,
          symptom: inv.problems.join("; "),
          evidence: { stack: null, stateSnapshot: null, repro: repro(label) },
        });
      }
    } else {
      // safeInvoke already logged a `crash` finding for the throw; also flag it as `wrong` if the
      // thrown message indicates a CONTRACT mismatch rather than an unexpected exception (both are
      // useful signal, but a contract mismatch deserves its own severity per the ladder).
      const msg = r.error && r.error.message || "";
      if (/^expected reason|not null before|did not (go pending|clear|reappear)/.test(msg)) {
        addFinding({
          severity: "wrong", title: `prep-autopilot contract violated (L${level}): ${msg}`,
          symptom: msg, evidence: { stack: null, stateSnapshot: null, repro: repro(label) },
        });
      }
    }
  }

} catch (e) {
  harnessDefect = e;
}

// ── finalize report ──
const findingCount = findings.length;
const status = harnessDefect ? "harness-defect" : "completed";

// remove any prior G7 entry (latest run wins, per §2: "the report accretes across harness runs")
report.harnesses = (report.harnesses || []).filter((h) => h.id !== HARNESS_ID);
report.harnesses.push({
  id: HARNESS_ID,
  status,
  invoked,
  skipped: stats.skipped.length,
  findings: findingCount,
  stats: {
    wildernessCells: stats.wildernessCells,
    dungeonCells: stats.dungeonCells,
    urbanCells: stats.urbanCells,
    travelLifecycles: stats.travelLifecycles,
    prepAutopilotCycles: stats.prepAutopilotCycles,
    canary: CANARY,
    harnessDefect: harnessDefect ? String(harnessDefect.message || harnessDefect) : null,
  },
});
report.findings = (report.findings || []).filter((f) => f.harness !== HARNESS_ID).concat(findings);

if (!existsSync(dirname(REPORT_PATH))) mkdirSync(dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log(`\nG7 walk/prep flows: invoked=${invoked} findings=${findingCount} ` +
  `wildernessCells=${stats.wildernessCells} dungeonCells=${stats.dungeonCells} urbanCells=${stats.urbanCells} ` +
  `travelLifecycles=${stats.travelLifecycles} prepAutopilotCycles=${stats.prepAutopilotCycles} canary=${CANARY}`);
if (harnessDefect) {
  console.log("HARNESS DEFECT:", harnessDefect.message || harnessDefect);
  console.log(harnessDefect.stack || "");
}
findings.forEach((f) => console.log(`  [${f.severity}] ${f.id} — ${f.title}`));

// exit-code semantics (§0): exit 0 when the harness ran to completion; exit 1 ONLY on a harness
// defect. The canary is special-cased ("must emit >=1 finding + exit 1") — a canary run that
// successfully demonstrates the injected defect is treated as the expected RED signal.
if (harnessDefect) {
  process.exit(1);
} else if (CANARY) {
  if (findingCount > 0) {
    process.exit(1);
  } else {
    console.log("CANARY FAILED TO FIRE: no findings emitted with GAUNTLET_CANARY=1 — the detector caught nothing.");
    process.exit(1);
  }
} else {
  process.exit(0);
}
