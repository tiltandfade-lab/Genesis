/* GAUNTLET APPLYEVENT FUZZ (docs/PRE-PLAYTEST-GAUNTLET.md §9's "G7 — applyEvent fuzz" harness, item 3
   of the Layer-0 coverage-debt batch — see the calling task).

   Fuzzes the EVENT-CONTRACT runtime (src/world/dm.js applyEvent) with seeded malformed/boundary
   payloads for EVERY event type. Types are ENUMERATED AT RUNTIME by regexing src/world/dm.js for
   `case "([a-z_]+)"` inside applyEvent — never hardcoded, so this harness auto-picks up new event
   types (batch-3's chase_start/chase_round/chase_yield/downtime/distant_word/shrine_omen are already
   live per docs/EVENT-CONTRACT.md's gap-wiring-caller section; the enumeration finds them without any
   list-editing here).

   For each type, fires applyEvent(w, e) with 5 hostile payload families (spec §9):
     1. {type} only — an empty payload
     2. every field null
     3. every numeric field a string ("abc")
     4. ids that reference nothing ("no-such-id")
     5. extremes (1e9, -5, NaN, a 10k-char string)
   Snapshots `w` (deep clone) before each call. Also fires 20 fully-random events (seeded) with
   unknown `type` values, asserting the forward-compatible no-op path.

   The contract (spec §9 ruling): a malformed event may no-op, clamp, or log — it must NEVER throw
   and NEVER leave corruption behind. After each call: no uncaught throw (`crash`); INV holds (spec
   §2); no NaN/undefined newly persisted anywhere in `w` (diff vs the snapshot); gold/hp still finite.

   Exit-code semantics (spec §0): exit 0 when the harness RAN TO COMPLETION — findings are DATA in
   the report, not test failures. Exit 1 ONLY on a harness defect OR the canary run.

   Canary (GAUNTLET_CANARY=1, per spec §9's own canary spec): monkeypatches the hp_changed case to
   skip its number coercion — feeding {amount:"abc"} must yield a `corrupt` finding, and the harness
   exits 1. Since hp_changed's real field name is `delta` (not `amount` — the spec text names the
   generic field, this app's payload shape is `{delta}`), the canary targets `delta` to match the
   ACTUAL contract while preserving the spec's intent (skip the numeric coercion, feed a non-numeric
   value, expect corruption to surface).

   Run:    node dev/gauntlet-fuzz-events.mjs
   Canary: GAUNTLET_CANARY=1 node dev/gauntlet-fuzz-events.mjs
   Repro one type only: node dev/gauntlet-fuzz-events.mjs --only=hp_changed
   (jsdom lives in ~/.genesis-jsdom per-environment; JSDOM_HOME overrides the dir.) */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const HARNESS_ID = "FUZZ";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const SEED = Number(process.env.GAUNTLET_SEED || 20260702);
const CANARY = process.env.GAUNTLET_CANARY === "1";
const ONLY = (() => { const a = process.argv.find((x) => x.startsWith("--only=")); return a ? a.slice(7) : null; })();

// ---------- mulberry32, determinism (spec §0) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const fuzzRand = mulberry32(SEED + 0xf022); // this harness's OWN random stream (random-event-type fuzz), separate from the app's Math.random

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
let JSDOM;
try {
  ({ JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom"));
} catch (e) {
  harnessDefect(`jsdom not found at ${JSDOM_HOME} — npm i jsdom there first (CLAUDE.md "headless test"). ${e.message}`);
}

// ---------- ENUMERATE EVENT TYPES AT RUNTIME (spec §9: never hardcode) ----------
const dmSrc = read("src/world/dm.js");
function enumerateEventTypes(src) {
  const re = /case "([a-z_]+)"/g;
  const types = new Set();
  let m;
  while ((m = re.exec(src))) types.add(m[1]);
  return [...types].sort();
}
const ALL_EVENT_TYPES = enumerateEventTypes(dmSrc);
const TYPES_TO_RUN = ONLY ? ALL_EVENT_TYPES.filter((t) => t === ONLY) : ALL_EVENT_TYPES;

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harnessGlobals = `var U={worlds:{},activeWorldId:null,revealed:{},souls:[]}; var SEED=null;`;
// CANARY (spec §9): skip hp_changed's numeric coercion — patch applyEvent's delta read to pass
// through whatever was given, unclamped, instead of `(typeof p.delta==="number")?p.delta:0`.
const canaryPatch = `
  var __origApplyEvent = applyEvent;
  applyEvent = function(w, e) {
    if (e && e.type === "hp_changed") {
      var t = livingSheet(w);
      if (t) {
        var delta = e.payload ? e.payload.delta : undefined; // CANARY: no Number coercion, no NaN guard
        t.sh.hpCur = (t.sh.hpCur == null ? t.sh.hp : t.sh.hpCur) + delta;
        return { ok: true, hp: t.sh.hpCur + "/" + t.sh.hp, canary: true };
      }
    }
    return __origApplyEvent(w, e);
  };
`;

let commit = "unknown";
try { commit = execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); } catch {}

// ---------- report accumulation (spec §2) ----------
const findings = [];
let findingSeq = 0;
function addFinding({ severity, title, symptom, evidenceExtra, stack, collisionZone, type, family }) {
  findingSeq += 1;
  const id = `${HARNESS_ID}-${String(findingSeq).padStart(3, "0")}`;
  findings.push({
    id, harness: HARNESS_ID, severity, title, symptom,
    evidence: Object.assign({
      stack: stack || null,
      stateSnapshot: null,
      repro: `GAUNTLET_SEED=${SEED} node dev/gauntlet-fuzz-events.mjs${type ? ` --only=${type}` : ""}`,
    }, evidenceExtra || {}),
    ...(collisionZone ? { collisionZone: true } : {}),
  });
  return id;
}
function harnessDefect(msg) {
  console.error(`[FUZZ HARNESS DEFECT] ${msg}`);
  writeReport({ status: "harness-defect", error: msg, invoked: 0, skipped: 0 });
  process.exit(1);
}
const COLLISION_FILES = ["src/world/gap-wiring.js", "src/engine/combat.js", "manifest.json"];
function isCollisionZone(stack) { return COLLISION_FILES.some((f) => (stack || "").includes(f)); }

// ---------- report writer (spec §2, accretes across harness runs) ----------
const REPORT_PATH = join(ROOT, "dev/gauntlet-report.json");
function writeReport(extra = {}) {
  let report = { run: { date: new Date().toISOString().slice(0, 10), seed: SEED, commit }, harnesses: [], findings: [] };
  if (existsSync(REPORT_PATH)) {
    try { report = JSON.parse(readFileSync(REPORT_PATH, "utf-8")); } catch { /* start fresh if corrupt */ }
  }
  report.run = { date: new Date().toISOString().slice(0, 10), seed: SEED, commit };
  report.harnesses = (report.harnesses || []).filter((h) => h.id !== HARNESS_ID);
  report.findings = (report.findings || []).filter((f) => f.harness !== HARNESS_ID);
  report.harnesses.push({
    id: HARNESS_ID,
    status: extra.status || "completed",
    invoked: extra.invoked ?? 0,
    skipped: extra.skipped ?? 0,
    findings: findings.length,
    stats: extra.stats || {},
    canary: CANARY ? { injected: true, fired: findings.length > 0 } : undefined,
    ...(extra.error ? { error: extra.error } : {}),
  });
  report.findings.push(...findings);
  const dir = dirname(REPORT_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  writeFindingsMd(report);
}
function writeFindingsMd(report) {
  const bySeverity = { crash: [], corrupt: [], wrong: [], ugly: [], review: [] };
  for (const f of report.findings) (bySeverity[f.severity] || (bySeverity[f.severity] = [])).push(f);
  const lines = [`# GAUNTLET-FINDINGS.md`, ``, `Auto-generated from dev/gauntlet-report.json. Do not hand-edit.`, ``,
    `Run: ${report.run.date} · seed ${report.run.seed} · commit ${report.run.commit}`, ``];
  for (const sev of ["crash", "corrupt", "wrong", "ugly", "review"]) {
    const items = bySeverity[sev] || [];
    lines.push(`## ${sev} (${items.length})`, "");
    for (const f of items) {
      lines.push(`- **${f.id}** [${f.harness}] ${f.title}${f.collisionZone ? " ⚠ collisionZone" : ""}`);
      if (f.symptom) lines.push(`  - ${f.symptom}`);
      if (f.evidence && f.evidence.repro) lines.push(`  - repro: \`${f.evidence.repro}\``);
    }
    lines.push("");
  }
  writeFileSync(join(ROOT, "dev/GAUNTLET-FINDINGS.md"), lines.join("\n"));
}

// ---------- jsdom boot ----------
function freshWin() {
  // include the bardo/level modals (not just #worldView): a death-routing event (death_save,
  // hp_changed at 0, exhaustion level 6, …) can reach killCharacter -> openBardo, which touches
  // #bardoModal/#bardoBody directly — omitting them would make every death-routing fuzz cell
  // surface a FALSE "crash" that's really this harness's own DOM-fixture gap, not an app defect
  // (confirmed via dev/gauntlet-1-clicks.mjs's G1 extension hitting the identical gap first).
  const dom = new JSDOM(`<!doctype html><html><body>
    <div id="worldView"></div>
    <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
    <div class="modal-bg" id="levelModal"><div class="modal bardo-modal"><div id="levelBody"></div></div></div>
  </body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.Math.random = mulberry32(SEED); // the app's own dice stream
  win.eval(harnessGlobals + "\n" + src + (CANARY ? canaryPatch : ""));
  win.confirm = () => true;
  win.prompt = () => null;
  win.alert = () => {};
  win.fetch = () => Promise.reject(new Error("gauntlet: fetch stubbed"));
  if (!win.navigator.clipboard) {
    Object.defineProperty(win.navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("stub")) }, configurable: true });
  }
  if (typeof win.requestAnimationFrame !== "function") win.requestAnimationFrame = (cb) => win.setTimeout(cb, 0);
  if (typeof win.matchMedia !== "function") win.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  return win;
}

// ---------- fixture world: a living PC, a companion, an active combat, a shop, a chase clock —
// deliberately RICH so as many event types as possible find real state to act on (a richer fixture
// surfaces more genuine mutation paths for the fuzzer to corrupt, vs a bare world where most events
// bail out at their very first `if(!t)return` guard). ----------
function makeFuzzWorld(win) {
  const world = {
    id: "w-fuzz", name: "The Fuzzing Ground",
    seed: {
      master: { name: "Fuzz Shrine", desc: "a place for breaking things" },
      smell: { name: "ozone" }, sound: { name: "static" }, arch: { name: "corroded stone" },
      taboo: { name: "None", desc: "none" }, myth: { name: "The Malformed Payload", desc: "a legend of bad data" },
      pressure: { name: "Fuzz Pressure", desc: "a looming test deadline" },
      faction: { name: "Fuzz Faction", desc: "a faction that exists for assertions" },
    },
    characters: [{ id: "c1", status: "living", name: "Fuzz Test PC", headline: "a test soul", spark: "a test soul", pronouns: "they",
      sheet: {
        species: "Human", class: "Fighter", background: "Soldier", level: 5, xp: 6500,
        hp: 44, hpCur: 30, ac: 16, tempHp: 5,
        profBonus: 3, scores: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
        mods: { str: 3, dex: 1, con: 2, int: 0, wis: 0, cha: 0 },
        saveProfs: ["str", "con"], skillProfs: ["Athletics", "Perception"],
        passivePerception: 12, hitDie: "d10", gold: 150,
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [], concentration: null, deathSaves: null,
        inventory: [
          { id: "i1", name: "Longsword", conditions: [] },
          { id: "i2", name: "Shield", conditions: [] },
          { id: "i3", name: "Potion of Healing", qty: 2, conditions: [] },
          { id: "i4", name: "Ring of Protection", conditions: [], ench: { charges: { cur: 2, max: 3 } } },
        ],
        equipped: { mainHand: "i1", offHand: "i2" },
      },
    }],
    gazetteer: [{ name: "A rumor", desc: "something heard" }], log: [], ledger: [], clock: { day: 5, min: 480 }, session: 2,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name: "Fuzz Faction", dominant: true, agenda: "break things", method: "fuzzing", tags: [], clock: { filled: 2, size: 6 } }],
    pressures: [{ kind: "external", danger: "malformed payloads", impersonal: "entropy", clock: { filled: 1, size: 4 },
                  real: { text: "a fuzz gap" }, doom: "corruption reaches the save file" }],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [], companions: [],
  };
  const originId = win.addNode(world, "Fuzz Shrine", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = "sheet"; win.GS.actionsTab = "actions";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  // an ACTIVE combat (so attack/opportunity_attack/move_zone/grapple/shove/foe_action/foe_morale find a live GS.combat)
  win.GS.combat = {
    active: true, round: 2, side: "pc", first: "pc",
    pc: { band: "melee" },
    foes: [{ fid: "f1", id: "f1", name: "Fuzz Foe", band: "melee", hp: 12, maxHp: 20, ac: 13, actions: [{ atk: 3, dmg: [{ n: 1, die: 6, bonus: 1 }] }] }],
    scene: { cover: {}, hazards: [], exits: [] },
    grid: { bands: ["melee", "near", "far", "distant"], lanes: ["L", "C", "R"] },
  };
  // a companion (for companion_update/dismiss/hire fuzzing)
  world.companions.push({ id: "comp1", name: "Fuzz Hireling", kind: "hireling", hp: 8, maxHp: 8, loyaltyWord: "steadfast", wage: 2 });
  // a shop (for open_shop-adjacent state; the event itself mints its own if absent)
  world.shops = {};
  return world;
}

// ---------- INV assertion (spec §2 global invariant set) ----------
function assertInv(w, type, family) {
  const problems = [];
  const c = (w.characters || []).filter((x) => x.status === "living").slice(-1)[0];
  if (c && c.sheet) {
    const sh = c.sheet;
    if (sh.hpCur != null && !Number.isFinite(sh.hpCur)) problems.push(`hpCur not finite (${sh.hpCur})`);
    if (sh.gold != null && !Number.isFinite(sh.gold)) problems.push(`gold not finite (${sh.gold})`);
    if (sh.gold != null && Number.isFinite(sh.gold) && sh.gold < 0) problems.push(`gold negative (${sh.gold})`);
    if (sh.inventory != null && !Array.isArray(sh.inventory)) problems.push(`inventory is not an Array`);
    if (Array.isArray(sh.inventory) && sh.inventory.some((it) => it == null)) problems.push(`inventory contains a null/undefined entry`);
  }
  try { JSON.stringify(w); } catch (e) { problems.push(`JSON.stringify(w) failed (cycle?): ${e.message}`); }
  if (problems.length) {
    addFinding({ severity: "corrupt", title: `INV violated after ${type} (family: ${family})`, symptom: problems.join("; "), type, family });
  }
  return problems.length === 0;
}

// walk a snapshot vs the live object looking for NEWLY introduced NaN/undefined-as-string leaves
// (spec §9: "no NaN/undefined newly persisted anywhere in w — walk the diff vs the snapshot").
// Compares JSON-safe values only (JSON.stringify already drops function/undefined-valued keys, so
// "undefined newly persisted" is caught via the explicit typeof check below, not JSON's own elision).
function findNewBadLeaves(before, after, path, out) {
  path = path || ""; out = out || [];
  const isNaNLeaf = (v) => typeof v === "number" && Number.isNaN(v);
  const beforeBad = before && typeof before === "object" ? null : (isNaNLeaf(before) ? "NaN" : (before === undefined ? "undefined" : null));
  const afterBad = after && typeof after === "object" ? null : (isNaNLeaf(after) ? "NaN" : (after === undefined ? "undefined" : null));
  if (afterBad && !beforeBad) { out.push({ path, kind: afterBad, value: after }); return out; }
  const aObj = after && typeof after === "object", bObj = before && typeof before === "object";
  if (aObj && bObj) {
    // ARRAY SHRINK GUARD: a legitimate removal (e.g. condition_expired filtering an entry out of
    // holder.conditions) makes a LATER index vanish entirely — Object.keys(before) on an array still
    // enumerates that index, so a naive per-key walk reads after[i] as `undefined` and misreports a
    // shrink as "newly persisted undefined". Only walk indices that exist in BOTH when either side is
    // an array shorter than the other; only flag genuinely NEW bad values within the surviving range,
    // never a trailing index that the array itself no longer has.
    if (Array.isArray(before) || Array.isArray(after)) {
      const minLen = Math.min(Array.isArray(before) ? before.length : 0, Array.isArray(after) ? after.length : 0);
      for (let i = 0; i < minLen; i++) findNewBadLeaves(before[i], after[i], path ? `${path}.${i}` : String(i), out);
      // non-index keys an array might still carry (rare, but Object.keys covers them) — walk those too.
      const extraKeys = new Set([...Object.keys(before), ...Object.keys(after)].filter((k) => !/^\d+$/.test(k)));
      for (const k of extraKeys) findNewBadLeaves(before[k], after[k], path ? `${path}.${k}` : k, out);
    } else {
      const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
      for (const k of keys) findNewBadLeaves(before[k], after[k], path ? `${path}.${k}` : k, out);
    }
  } else if (aObj && !bObj) {
    // a scalar became an object (or vice versa) — walk the new object for bad leaves too, nothing to
    // diff against on the "before" side beyond what's already handled by beforeBad/afterBad above.
    for (const k of Object.keys(after)) findNewBadLeaves(undefined, after[k], path ? `${path}.${k}` : k, out);
  }
  return out;
}

// ---------- the 5 hostile payload families (spec §9) ----------
function buildPayloadFamilies(win, w) {
  const c = w.characters[0], sh = c.sheet;
  // representative "real" field names per event type, so family (2)/(3)/(4)/(5) have something to
  // corrupt — the exact field set doesn't need to be exhaustive per type (the switch's own `p.field`
  // reads simply see `undefined` for anything not listed, which is itself a valid, already-covered
  // fuzz case via family 1's empty payload).
  const realFieldsByType = {
    hp_changed: { delta: -5 }, death_save: { d20: 12 }, temp_hp: { n: 5 },
    action: { kind: "dodge" }, opportunity_attack: { foe: "f1", d20: 10 },
    move_zone: { who: "pc", band: "near", lane: "C" },
    grapple: { target: "f1", d20: 14, bonus: 2 }, shove: { target: "f1", d20: 14, bonus: 2, intent: "prone" },
    hazard_tick: { kind: "fall", feet: 20 }, slot_spent: { level: 1 }, cast: { spell: "Fire Bolt", level: 0 },
    concentration_start: { spell: "Bless" }, concentration_broken: { cause: "0-hp" },
    resource_spent: { key: "rage", n: 1 }, rest: { kind: "short" },
    item_changed: { add: [{ name: "Dagger" }], gold: 5 }, item_split: { itemId: "i3", qty: 1 },
    item_use: { itemId: "i3" }, charge_spend: { itemId: "i4", n: 1 }, charge_restore: { itemId: "i4", n: 1 },
    condition_add: { target: "pc", condition: "prone" }, condition_remove: { target: "pc", condition: "prone" },
    condition_expired: { target: "pc", condition: "prone" }, round_tick: { round: 3, phase: "start" },
    foe_morale: { foe: "f1" }, foe_action: { foe: "f1" },
    equip: { itemId: "i1", slot: "mainHand" }, unequip: { slot: "offHand" },
    set_grip: { grip: "2h" }, attune: { itemId: "i4" }, unattune: { itemId: "i4" },
    fact_canonized: { factId: "fuzz-fact" }, codex_add: { kind: "npc", name: "Fuzz NPC", fields: {} },
    codex_link: { fromId: "npc:fuzz", rel: "knows", toId: "npc:fuzz2" }, codex_update: { id: "npc:fuzz", patch: {} },
    codex_reveal: { id: "npc:fuzz" }, codex_contact: { id: "npc:fuzz" },
    social_check: { targetId: "npc:fuzz", d20: 15 }, attitude_shift: { targetId: "npc:fuzz", value: 1 },
    morale_check: { foe: "f1", d20: 10 }, parley_open: { targetId: "npc:fuzz" }, insight_read: { targetId: "npc:fuzz", d20: 15 },
    discovery: { what: "a fuzz fact" }, clock_advanced: { clockId: "Fuzz Faction", delta: 1 },
    clock_fired: { clockId: "Fuzz Faction", factionId: "Fuzz Faction", forPlayer: true },
    front_closed: { ledgerId: "fuzz-front", how: "resolved" },
    encounter_resolved: { foes: [{ cr: 1, victimClass: "monster" }], method: "combat", outcome: "won" },
    kill: { victimClass: "monster" }, claim_deed: { deedId: "fuzz-deed" }, gift: { itemName: "a token" },
    epithet_grant: { text: "the Fuzzer" }, hire: { npcId: "npc:fuzz" }, dismiss: { companionId: "comp1" },
    companion_update: { companionId: "comp1", kind: "loyalty", delta: 1 },
    choice_logged: { weight: "minor", forecloses: [] }, inspiration_granted: { pc: "c1", reason: "fuzzing" },
    inspiration_spend: { on: "check", o: 15, d20b: 18 }, check: { kind: "skill", key: "Athletics", dc: 12, d20: 14 },
    crit_outcome: { natural: 20, magnitude: 3, tier: "amplified", scope: "local", lenses: [], cascade: false, placeHandoff: null },
    adjudication: { situation: "a fuzz edge case", ruling: "no-op", precedentId: "fuzz-precedent" },
    level_applied: { pc: "c1", from: 5, to: 6 }, attack: { d20: 15, targetAC: 13 },
    walk_advance: { toSeg: 1 }, walk_update: { segId: 1, effectDie: 4 }, walk_complete: {},
    capture: {}, chase_start: { targetFid: "f1", terrain: "forest" }, chase_round: { pursuerWon: true },
    chase_yield: { side: "pursuer" }, downtime: { intent: "work", tier: 1 }, distant_word: {},
    shrine_omen: {}, xp_granted: { n: 10 }, open_shop: { name: "Fuzz Market", tier: 1 },
    district_mint: {}, building_approach: { kind: "tavern" }, building_contact: { kind: "tavern" },
    job_board_read: {}, job_accept: { postingId: "fuzz-posting" },
    item_rust_exposure: { itemId: "i1", kind: "rain-combat" }, prep_applied: {}, prep_contact: { nodeId: "fuzz-node" },
  };
  const real = realFieldsByType || {};

  const families = {};
  families["1-empty"] = (type) => ({});
  families["2-all-null"] = (type) => {
    const fields = real[type] || {};
    const out = {};
    for (const k of Object.keys(fields)) out[k] = null;
    return out;
  };
  families["3-numeric-as-string"] = (type) => {
    const fields = real[type] || {};
    const out = {};
    for (const k of Object.keys(fields)) out[k] = (typeof fields[k] === "number") ? "abc" : fields[k];
    return out;
  };
  families["4-nonexistent-ids"] = (type) => {
    const fields = real[type] || {};
    const out = Object.assign({}, fields);
    for (const k of Object.keys(out)) {
      if (/id$/i.test(k) || k === "target" || k === "foe" || k === "who") out[k] = "no-such-id";
      if (Array.isArray(out[k])) out[k] = out[k].map(() => ({ id: "no-such-id" }));
    }
    return out;
  };
  const HUGE_STRING = "x".repeat(10000);
  families["5-extremes"] = (type) => {
    const fields = real[type] || {};
    const out = {};
    for (const k of Object.keys(fields)) {
      const v = fields[k];
      if (typeof v === "number") out[k] = [1e9, -5, NaN][Math.floor(fuzzRand() * 3)];
      else if (typeof v === "string") out[k] = HUGE_STRING;
      else out[k] = v;
    }
    return out;
  };
  return families;
}

// ---------- run one (type, family) cell ----------
function fuzzOne(win, w, type, familyName, payload, stats) {
  const before = JSON.parse(JSON.stringify(w));
  let threw = null, result = null;
  try {
    result = win.applyEvent(w, { type, payload, source: "declared" });
  } catch (e) {
    threw = e;
  }
  stats.invoked += 1;
  if (threw) {
    addFinding({
      severity: "crash",
      title: `applyEvent({type:"${type}"}) THREW with family ${familyName}`,
      symptom: `${threw.message} — payload: ${JSON.stringify(payload).slice(0, 300)}`,
      stack: threw.stack, type, family: familyName,
      collisionZone: isCollisionZone(threw.stack),
    });
    return;
  }
  // spec §9 contract: must never throw — no-op/clamp/log all fine. If the event returned an object
  // shaped like a rejection (ok:false), that's the no-op path working correctly, not a finding.
  const invOk = assertInv(w, type, familyName);
  if (!invOk) return; // assertInv already logged the corrupt finding
  const after = JSON.parse(JSON.stringify(w));
  const badLeaves = findNewBadLeaves(before, after, "", []);
  if (badLeaves.length) {
    addFinding({
      severity: "corrupt",
      title: `applyEvent({type:"${type}"}) persisted new NaN/undefined with family ${familyName}`,
      symptom: badLeaves.slice(0, 5).map((b) => `${b.path}: ${b.kind} (${JSON.stringify(b.value)})`).join("; ") + ` — payload: ${JSON.stringify(payload).slice(0, 200)}`,
      type, family: familyName,
    });
  }
}

// ---------- 20 fully-random unknown-type events (spec §9) ----------
function fuzzUnknownTypes(win, w, stats) {
  const junkTypeChars = "abcdefghijklmnopqrstuvwxyz_";
  for (let i = 0; i < 20; i++) {
    let junkType = "";
    const len = 4 + Math.floor(fuzzRand() * 12);
    for (let k = 0; k < len; k++) junkType += junkTypeChars[Math.floor(fuzzRand() * junkTypeChars.length)];
    // guard against an astronomically unlikely collision with a real event type
    if (ALL_EVENT_TYPES.includes(junkType)) junkType = "zzz_" + junkType;
    const before = JSON.parse(JSON.stringify(w));
    let threw = null, result = null;
    try {
      result = win.applyEvent(w, { type: junkType, payload: { junk: fuzzRand() }, source: "declared" });
    } catch (e) { threw = e; }
    stats.invoked += 1;
    stats.unknownTypesFired += 1;
    if (threw) {
      addFinding({ severity: "crash", title: `applyEvent threw on unknown type "${junkType}"`, symptom: threw.message, stack: threw.stack, type: junkType, family: "unknown-type" });
      continue;
    }
    if (!result || result.ok !== false) {
      addFinding({ severity: "wrong", title: `unknown event type "${junkType}" did not hit the forward-compatible no-op path`, symptom: `expected {ok:false, reason:"unknown-type:..."} — got ${JSON.stringify(result)}`, type: junkType, family: "unknown-type" });
    }
    const after = JSON.parse(JSON.stringify(w));
    const badLeaves = findNewBadLeaves(before, after, "", []);
    if (badLeaves.length) {
      addFinding({ severity: "corrupt", title: `unknown event type "${junkType}" mutated state`, symptom: badLeaves.slice(0, 5).map((b) => `${b.path}: ${b.kind}`).join("; "), type: junkType, family: "unknown-type" });
    }
    assertInv(w, junkType, "unknown-type");
  }
}

// ---------- run ----------
try {
  const win = freshWin();
  const w = makeFuzzWorld(win);
  const families = buildPayloadFamilies(win, w);
  const familyNames = Object.keys(families);

  const stats = { invoked: 0, unknownTypesFired: 0, typesEnumerated: ALL_EVENT_TYPES.length, typesRun: TYPES_TO_RUN.length, familyNames };
  const grid = [];

  // Snapshot the fixture ONCE, restore it before EACH TYPE (not each family): the 5 families of one
  // type stay cumulative against each other (spec intent — malformed variations of the SAME event in
  // sequence), but a type that legitimately routes to death/a terminal state (death_save's 3-fail
  // "dead" outcome, exhaustion level 6, massive-damage instant-death) no longer silently masks every
  // ALPHABETICALLY-LATER type's coverage for the rest of the run — restoring "living" + a clean
  // inventory/gold/conditions baseline between types is what makes 82 types' worth of fuzzing
  // independently trustworthy rather than a lottery on enumeration order.
  const fixtureSnapshot = JSON.parse(JSON.stringify(w));
  function restoreFixture() {
    for (const k of Object.keys(w)) delete w[k];
    Object.assign(w, JSON.parse(JSON.stringify(fixtureSnapshot)));
    win.U.worlds[w.id] = w; // reattach — the delete/reassign above breaks the U.worlds[id] === w identity
    win.GS.combat = JSON.parse(JSON.stringify(fixtureSnapshot.__gsCombat || null));
  }
  fixtureSnapshot.__gsCombat = win.GS.combat;

  for (const type of TYPES_TO_RUN) {
    restoreFixture();
    const row = { type, families: {} };
    for (const familyName of familyNames) {
      const payload = families[familyName](type);
      const before = findings.length;
      fuzzOne(win, w, type, familyName, payload, stats);
      row.families[familyName] = findings.length === before ? "clean" : "finding";
    }
    grid.push(row);
  }

  fuzzUnknownTypes(win, w, stats);

  writeReport({
    status: "completed",
    invoked: stats.invoked,
    skipped: ALL_EVENT_TYPES.length - TYPES_TO_RUN.length,
    stats: Object.assign(stats, { grid }),
  });

  console.log(`\nFUZZ: ${ALL_EVENT_TYPES.length} event types enumerated, ${TYPES_TO_RUN.length} run × ${familyNames.length} families + 20 unknown-type randoms = ${stats.invoked} calls.`);
  console.log(`Findings: ${findings.length} (${findings.map((f) => f.severity).join(", ") || "none"})`);
  if (CANARY) {
    if (findings.length > 0) {
      console.log("CANARY FIRED — ≥1 finding emitted as expected. Exiting 1 (canary run).");
      process.exit(1);
    } else {
      harnessDefect("CANARY DID NOT FIRE — the hp_changed coercion-skip patch feeding a non-numeric delta should have produced ≥1 corrupt finding. Detector is not trustworthy.");
    }
  } else {
    process.exit(0);
  }
} catch (e) {
  harnessDefect(`Unhandled throw in harness code: ${e && e.stack || e}`);
}
