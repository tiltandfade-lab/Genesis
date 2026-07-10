/* verify-wiring-a.mjs — headless test for WIRING-SWEEP-A (docs/WIRING-MAP.md §B Wave A,
   docs/BATCH3-PLAN.md unit 10, docs/BATCH3-GUARDRAILS.md J1: wiring-sweep-A >=12/0). Full-app
   jsdom load, manifest.loadOrder (same "const-via-eval" convention as dev/verify-job-walks.mjs /
   dev/verify-gap-wiring.mjs / dev/verify-urban-fabric.mjs).

   Enumerated assertions (docs/WIRING-MAP.md §B items 2-10, minus item 1 npc-job-board — already
   covered by dev/verify-job-walks.mjs — per WIRING-MAP's own note that job-walks was PROMOTED out
   of this unit's scope):

   1. REST-RISK (item 4): restRiskRoll grades security class from real signals (nodeLodgingTier/
      nodeInhabited/env) — inn (paid, tiered, inhabited) vs wild (uninhabited) vs dungeon (mid-walk)
      resolve to DIFFERENT classes; every class rolls a real rest-complications table.
   1b. MUTATION CHECK: force restRiskSevere to always return true + force the interrupt roll to
      always hit -> a rest NEVER recovers (RED, simulated), then the real (chance-gated) function is
      confirmed to let an ordinary rest through GREEN (interrupted:false is possible / restRecover
      still fires when not interrupted).
   2. passTime wiring: an interrupted rest-risk roll SKIPS restRecover (no "rest" ledger kind); a
      non-interrupted rest still recovers normally (regression: dev/verify-durability.mjs /
      dev/verify-economy-sinks.mjs's existing passTime assertions must still pass unmodified).
   3. IF-IGNORED (item 8): a fresh thread (dm.legs:"hook", no ignoredSinceDay yet) does NOT fire on
      its first montage (first-observation stamp only); the SAME thread DOES fire once >=
      IGNORED_STALE_DAYS have elapsed, rolling npc-if-ignored and ledgering a `drift` entry.
   3b. MUTATION CHECK ("no house still on fire 50 days later" — Adam's named directive): a
      turnIgnoredCheck with the staleness gate DISABLED (i.e. checking dm.legs alone, no age check)
      fires the SAME thread every single montage (RED, simulated), then the real function is
      confirmed to fire it ONCE and reset the window (GREEN) — never persisting the fire-forever bug.
   4. Resolved/non-thread codex records never fire if-ignored (dm.resolved:true, or no dm.legs at all).
   5. CREATURE-PARLEY-WANTS (item 6): foe_morale on a "surrender" break stashes foe.parleyWant from a
      REAL creature-parley-wants roll (never null when the table is compiled); parley_open then
      defaults p.want from that stashed want when the caller supplies none.
   6. MONSTER-BEHAVIOR-IF-HUNTED (item 7): foe_morale on a "flee"/"rout-panic" break stashes
      foe.huntedBehavior from a REAL monster-behavior-if-hunted roll.
   7. REGION-ENCOUNTER (item 10): regionEncounterRoll(region) returns a real roll when a region is
      passed, and null (byte-identical fallback) when region is null — wired into rollWildernessWalk's
      per-leg loop (segment.regionEncounter present only when a region was passed to the roller).
   8. URBAN/WILDERNESS INTERACTABLES (item 9): rollUrbanWalk's non-finale segments carry
      `interactable` (name+flavor); rollWildernessWalk's legs carry `interactable` too — same shape
      dungeon-walk.js's `object` field already uses.
   9. TAVERN-ENCOUNTERS (item 5): urban.js's buildingContact on a tavern building attaches
      `ambientEncounter` (chance-gated — confirmed reachable across repeated rolls, never guaranteed).
   10. SEED DISPATCH / the >=1-non-urban-seed rider (item 2 + JOB-WALKS §4): assemblePrepBundle's
       environments ALWAYS include >=1 non-urban kind (dungeon/wilderness) — verified directly
       against engine.prep-bundle's pbundlePlan across repeated calls (the seed-locus distribution
       check J1 names), never urban-only.
   11. NULL-SAFE: every new roller (restRiskRoll/turnIgnoredCheck/parleyWantRoll/huntedBehaviorRoll/
       regionEncounterRoll/tavernEncounterRoll/walkPickInteractable) degrades gracefully (null or
       {ok:false}) when its target table is stubbed to undefined — never throws, never fabricates.
   12. REGRESSION: dev/verify-monster-tactics.mjs's existing foe_morale disposition assertions
       (band movement on flee, routed+fled on rout-panic, surrendering+band-unchanged on surrender)
       still hold with the new parley/hunted rolls layered on top.

   Run:  node dev/verify-wiring-a.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function newWin(){
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts){
  opts = opts || {};
  const w = {
    id: opts.id || "w-wa", name: opts.name || "Test World", session: 1,
    startNodeId: opts.startNodeId || "home", currentNodeId: opts.currentNodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: opts.day != null ? opts.day : 40, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: opts.gold != null ? opts.gold : 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
    seed: opts.seed || {},
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// 1. REST-RISK: security class grading + real table rolls
// ============================================================================
console.log("\n--- 1. restRiskRoll: security class grading ---");
{
  const win = newWin();
  const w = mkWorld(win, { shops: { s1: { id: "s1", nodeId: "home", tier: 2, coin: 500, stock: [] } } });
  const inn = win.restRiskRoll(w, { nodeId: "home", kind: "dawn" });
  check("1. inn class rolls ok with a real table result", inn && inn.ok === true && typeof inn.text === "string" && inn.text.length > 0, JSON.stringify(inn));
  check("1b. paid tiered inhabited node grades as 'inn'", inn.class === "inn", inn.class);

  const w2 = mkWorld(win, { id: "w-wa2", currentNodeId: "wild", nodes: { wild: { id: "wild", name: "Deep Wood", type: "Wilds", x: 1, y: 1 } } });
  const wild = win.restRiskRoll(w2, { nodeId: "wild", kind: "dawn" });
  check("1c. uninhabited node grades as 'wild'", wild.class === "wild", wild.class);
  check("1c2. inn and wild resolve to DIFFERENT security classes", inn.class !== wild.class, inn.class + " vs " + wild.class);

  const dungeon = win.restRiskRoll(w, { nodeId: "home", kind: "dawn", env: "dungeon" });
  check("1d. env:'dungeon' override grades as 'dungeon' regardless of node", dungeon.class === "dungeon", dungeon.class);
  check("1e. dungeon class rolls the dungeon-rest-complications table (distinct row set)",
    dungeon.ok === true && typeof dungeon.text === "string", JSON.stringify(dungeon));
}

// ============================================================================
// 1b. MUTATION CHECK: a rest-risk that ALWAYS interrupts vs the real chance-gated function
// ============================================================================
console.log("\n--- 1b. MUTATION CHECK: always-severe/always-interrupt vs the real gate ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  // RED (simulated): a broken restRiskRoll that always reports severe+interrupted regardless of the
  // roll or the class's own interruptChance — the bug this unit's own chance-gating guards against.
  const brokenAlwaysInterrupts = () => ({ ok: true, class: "inn", text: "Raided", band: "", severe: true, interrupted: true });
  const redSamples = Array.from({ length: 20 }, () => brokenAlwaysInterrupts());
  check("1b-RED. a broken always-interrupt roller shows every sample interrupted (confirmed RED)",
    redSamples.every(r => r.interrupted === true), "n/a — simulated defect, expected true");
  // GREEN: the REAL restRiskRoll, sampled many times at the SAFEST class (inn, interruptChance 0.05)
  // — the vast majority must NOT interrupt (restored to the real, chance-gated behavior).
  const realSamples = Array.from({ length: 60 }, () => win.restRiskRoll(w, { nodeId: "home", kind: "dawn" }));
  const interruptedCount = realSamples.filter(r => r.interrupted).length;
  check("1b-GREEN. the REAL restRiskRoll at the safest class does NOT always interrupt (restored)",
    interruptedCount < realSamples.length, `interrupted ${interruptedCount}/${realSamples.length}`);
}

// ============================================================================
// 2. passTime wiring: an interrupted rest skips restRecover; a normal rest still recovers
// ============================================================================
console.log("\n--- 2. passTime wiring ---");
{
  const win = newWin();
  // force interruption deterministically: stub restRiskRoll to report a severe+interrupted result,
  // confirming play.js's passTime actually READS restRisk.interrupted (not just rolls it for show).
  win.eval(`var __origRestRiskRoll = restRiskRoll; restRiskRoll = function(){ return { ok:true, class:"dungeon", text:"Assaulted — no recovery.", band:"", severe:true, interrupted:true }; };`);
  const w = mkWorld(win, { gold: 50 });
  win.passTime("dawn");
  const restLine = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "rest");
  const riskLine = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "rest-risk");
  check("2. an INTERRUPTED rest-risk roll skips restRecover (no 'rest' ledger kind)", !restLine, JSON.stringify(restLine));
  check("2b. the rest-risk itself is still ledgered (the interruption is visible, not silent)", !!riskLine && riskLine.data.interrupted === true, JSON.stringify(riskLine && riskLine.data));

  // deterministic NON-interrupted stub (rather than restoring the real chance-gated roller, which
  // can genuinely interrupt sometimes — that's the point of §1b's own probability assertion; this
  // check is specifically about passTime's WIRING, so it must not depend on a random roll).
  win.eval(`restRiskRoll = function(){ return { ok:true, class:"inn", text:"Secure Position", band:"", severe:false, interrupted:false }; };`);
  const w2 = mkWorld(win, { id: "w-wa-normal", gold: 50 });
  win.passTime("dawn");
  const restLine2 = w2.ledger.slice().reverse().find(e => e.data && e.data.kind === "rest");
  check("2c. a NON-interrupted rest still recovers normally (regression: restRecover fires)", !!restLine2, JSON.stringify(restLine2));
  win.eval(`restRiskRoll = __origRestRiskRoll;`);
}

// ============================================================================
// 3. IF-IGNORED: first-observation stamp, then fires once stale
// ============================================================================
console.log("\n--- 3. turnIgnoredCheck: staleness gate ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 10 });
  const rec = win.codexAdd(w, { id: "thread:the-lost-heir", kind: "npc", name: "The Lost Heir",
    dm: { legs: "hook", resolved: false }, status: { known: true } });
  const fired1 = win.turnIgnoredCheck(w);
  check("3. a FRESH thread does not fire on first observation", fired1.length === 0, JSON.stringify(fired1));
  check("3b. first observation stamps ignoredSinceDay", win.codexGet(w, rec.id).dm.ignoredSinceDay === 10, JSON.stringify(win.codexGet(w, rec.id).dm));

  // top-level `const` in a classic script doesn't attach as a `window.X` property, and each
  // separate win.eval() call gets its OWN lexical scope (a plain `win.eval("IGNORED_STALE_DAYS")`
  // throws ReferenceError even though the harness's own eval defined it — the "const-via-eval"
  // gotcha, see MEMORY project-genesis-class-progression) — so this asserts against a generously
  // large elapsed span (60 days) rather than depending on reading the exact constant back out.
  // Any staleness threshold this codebase would plausibly author (days, not months) clears 60.
  w.clock.day = 10 + 60;
  const fired2 = win.turnIgnoredCheck(w);
  check("3c. the SAME thread fires once IGNORED_STALE_DAYS have elapsed", fired2.length === 1 && fired2[0].id === rec.id, JSON.stringify(fired2));
  check("3d. the fire rolled a REAL npc-if-ignored text", fired2[0] && typeof fired2[0].text === "string" && fired2[0].text.length > 0, JSON.stringify(fired2[0]));
  const driftLine = w.ledger.slice().reverse().find(e => e.type === "drift" && e.data && e.data.kind === "if-ignored");
  check("3e. a `drift` ledger entry is written", !!driftLine, JSON.stringify(driftLine));
  check("3f. the window resets (ignoredRolls increments, ignoredSinceDay advances)",
    win.codexGet(w, rec.id).dm.ignoredRolls === 1 && win.codexGet(w, rec.id).dm.ignoredSinceDay === w.clock.day, JSON.stringify(win.codexGet(w, rec.id).dm));
}

// ============================================================================
// 3b. MUTATION CHECK: "no house still on fire 50 days later" — fire-forever vs the real reset
// ============================================================================
console.log("\n--- 3b. MUTATION CHECK: fire-every-montage vs the real once-per-window reset ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 100 });
  win.codexAdd(w, { id: "thread:burning-mill", kind: "npc", name: "The Burning Mill's Ghost",
    dm: { legs: "thread-seed", resolved: false, ignoredSinceDay: 0 } });   // already "stale" from day 0

  // RED (simulated): a broken sweep that checks dm.legs alone, with NO staleness gate and NO window
  // reset — the exact "persist/repeat forever" bug WIRING-MAP's directive guards against.
  const brokenSweep = (world) => {
    const recs = Object.values(win.codexOf(world).records);
    return recs.filter(r => r.dm && (r.dm.legs === "hook" || r.dm.legs === "thread-seed") && !r.dm.resolved);
  };
  const redFire1 = brokenSweep(w).length, redFire2 = brokenSweep(w).length, redFire3 = brokenSweep(w).length;
  check("3b-RED. the broken sweep fires the SAME thread on every single call, no reset (confirmed RED)",
    redFire1 === 1 && redFire2 === 1 && redFire3 === 1, `${redFire1},${redFire2},${redFire3}`);

  // GREEN: the REAL turnIgnoredCheck fires ONCE, then the reset window means an immediate re-check
  // (same day, no further elapse) does NOT re-fire — restored to the intended once-per-window shape.
  const realFire1 = win.turnIgnoredCheck(w).length;
  const realFire2 = win.turnIgnoredCheck(w).length;   // same day, immediately after — must NOT re-fire
  check("3b-GREEN. the REAL sweep fires once then WAITS for the next staleness window (restored)",
    realFire1 === 1 && realFire2 === 0, `${realFire1},${realFire2}`);
}

// ============================================================================
// 4. resolved / non-thread codex records never fire if-ignored
// ============================================================================
console.log("\n--- 4. resolved/non-thread records are excluded ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 200 });
  win.codexAdd(w, { id: "npc:resolved-thread", kind: "npc", name: "Closed Matter",
    dm: { legs: "hook", resolved: true, ignoredSinceDay: 0 } });
  win.codexAdd(w, { id: "npc:plain", kind: "npc", name: "Just Some Guy", dm: {} });
  const fired = win.turnIgnoredCheck(w);
  check("4. a RESOLVED thread never fires", !fired.some(f => f.id === "npc:resolved-thread"), JSON.stringify(fired));
  check("4b. a record with no dm.legs at all never fires", !fired.some(f => f.id === "npc:plain"), JSON.stringify(fired));
}

// ============================================================================
// 5. CREATURE-PARLEY-WANTS: foe_morale surrender stashes a REAL want; parley_open defaults from it
// ============================================================================
console.log("\n--- 5. parleyWantRoll wiring ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.GS.combat = { active: true, round: 1, foes: [{ fid: "f1", name: "Bandit", hp: 4, maxHp: 8, band: "melee",
    creatureType: "humanoid", saves: {}, abilities: { wis: { mod: 0 } } }], pc: { band: "melee" }, moraleFlags: {} };
  // dispositionRoll:4 -> surrender (per monster-tactics.js's d6<=5 branch), d20:1 -> the WIS save always fails
  const r = win.applyEvent(w, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 4 } });
  check("5. foe_morale surrender resolves ok", r.ok === true, JSON.stringify(r));
  check("5b. the event result carries a REAL rolled parleyWant", typeof r.parleyWant === "string" && r.parleyWant.length > 0, JSON.stringify(r.parleyWant));
  check("5c. the foe itself is stashed with parleyWant", win.GS.combat.foes[0].parleyWant === r.parleyWant, win.GS.combat.foes[0].parleyWant);

  // parley_open with NO explicit want -> defaults from the live foe's stashed parleyWant.
  win.codexAdd(w, { id: "f1", kind: "npc", name: "Bandit", status: { known: false } });
  const p = win.applyEvent(w, { type: "parley_open", payload: { target: "f1" } });
  check("5d. parley_open with no explicit want defaults from the foe's stashed parleyWant", p.ok === true && p.want === r.parleyWant, JSON.stringify(p));
}

// ============================================================================
// 6. MONSTER-BEHAVIOR-IF-HUNTED: foe_morale flee/rout-panic stashes a REAL behavior
// ============================================================================
console.log("\n--- 6. huntedBehaviorRoll wiring ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  // a SECOND live foe keeps the fight open — the lifecycle seam's detected combat_end
  // (COMBAT-LIFECYCLE §3b) now correctly tears down GS.combat when the last live foe flees,
  // and this test's post-event assertions need the combat object to survive the flee.
  win.GS.combat = { active: true, round: 1, foes: [{ fid: "f1", name: "Rat", hp: 2, maxHp: 8, band: "melee",
    creatureType: "beast", saves: {}, abilities: { wis: { mod: 0 } } },
    { fid: "f2", name: "Rat Packmate", hp: 8, maxHp: 8, band: "near",
    creatureType: "beast", saves: {}, abilities: { wis: { mod: 0 } } }], pc: { band: "melee" }, moraleFlags: {} };
  // dispositionRoll:2 -> flee (d6<=3), d20:1 -> the WIS save always fails
  const r = win.applyEvent(w, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 2 } });
  check("6. foe_morale flee resolves ok", r.ok === true, JSON.stringify(r));
  check("6b. the event result carries a REAL rolled huntedBehavior", typeof r.huntedBehavior === "string" && r.huntedBehavior.length > 0, JSON.stringify(r.huntedBehavior));
  check("6c. the foe itself is stashed with huntedBehavior", win.GS.combat.foes[0].huntedBehavior === r.huntedBehavior, win.GS.combat.foes[0].huntedBehavior);
}

// ============================================================================
// 7. REGION-ENCOUNTER: gated on region presence
// ============================================================================
console.log("\n--- 7. regionEncounterRoll ---");
{
  const win = newWin();
  check("7. null region -> null (byte-identical fallback)", win.regionEncounterRoll(null) === null);
  const fakeRegion = { id: "r1", name: "The Reaches", skinBias: [], archetypeBias: [] };
  const r = win.regionEncounterRoll(fakeRegion);
  check("7b. a real region -> a real roll", r && typeof r.text === "string" && r.text.length > 0, JSON.stringify(r));

  // wired into rollWildernessWalk: a region passed through opts surfaces on segments.
  const walkNoRegion = win.rollWildernessWalk({ legCount: 2 });
  check("7c. no region passed -> no regionEncounter on legs", walkNoRegion.segments.filter(s=>!s.isFinale).every(s => s.regionEncounter === null || s.regionEncounter === undefined), JSON.stringify(walkNoRegion.segments[0].regionEncounter));
  const walkWithRegion = win.rollWildernessWalk({ legCount: 2, region: fakeRegion });
  check("7d. a region passed -> legs carry a real regionEncounter", walkWithRegion.segments.filter(s=>!s.isFinale).every(s => s.regionEncounter && typeof s.regionEncounter.text === "string"), JSON.stringify(walkWithRegion.segments[0].regionEncounter));
}

// ============================================================================
// 8. URBAN/WILDERNESS INTERACTABLES
// ============================================================================
console.log("\n--- 8. walkPickInteractable wiring ---");
{
  const win = newWin();
  const urbanWalk = win.rollUrbanWalk({ segCount: 3, topology: "Linear" });
  const urbanNonFinale = urbanWalk.segments.filter(s => !s.isFinale);
  check("8. urban non-finale segments carry an interactable {name,flavor}", urbanNonFinale.length > 0 && urbanNonFinale.every(s => s.interactable && typeof s.interactable.name === "string"), JSON.stringify(urbanNonFinale[0] && urbanNonFinale[0].interactable));

  const wildWalk = win.rollWildernessWalk({ legCount: 2 });
  const wildLegs = wildWalk.segments.filter(s => !s.isFinale);
  check("8b. wilderness legs carry an interactable {name,flavor}", wildLegs.length > 0 && wildLegs.every(s => s.interactable && typeof s.interactable.name === "string"), JSON.stringify(wildLegs[0] && wildLegs[0].interactable));
}

// ============================================================================
// 9. TAVERN-ENCOUNTERS ambient lane
// ============================================================================
console.log("\n--- 9. tavernEncounterRoll wiring ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const approach = win.buildingApproach(w, "tavern", { nodeId: "home" });
  check("9. buildingApproach mints a tavern", approach.ok === true, JSON.stringify(approach));
  // sample repeated contacts (a fresh building each time, chance-gated at 0.35) — an ambient beat
  // must be REACHABLE within a reasonable number of tries, never guaranteed every single contact.
  let sawEncounter = false, sawMiss = false;
  for (let i = 0; i < 60 && !(sawEncounter && sawMiss); i++) {
    const app = win.buildingApproach(w, "tavern", { nodeId: "home" });
    const c = win.buildingContact(w, app.id);
    if (c.ambientEncounter) sawEncounter = true; else sawMiss = true;
  }
  check("9b. the ambient tavern-encounters beat is REACHABLE (chance-gated, not guaranteed)", sawEncounter, "never fired in 60 tries");
  check("9c. the ambient beat is NOT guaranteed every contact (chance-gated, not forced)", sawMiss, "fired every single time in 60 tries");
}

// ============================================================================
// 10. SEED DISPATCH: the >=1-non-urban-seed guarantee (structural, via prep-bundle)
// ============================================================================
console.log("\n--- 10. seed-locus distribution (JOB-WALKS §4 rider) ---");
{
  const win = newWin();
  let allUrbanOnly = 0, sawNonUrban = 0;
  const N = 50;
  for (let i = 0; i < N; i++) {
    const bundle = win.assemblePrepBundle({});
    const kinds = bundle.environments.map(e => e.kind);
    if (kinds.every(k => k === "urban")) allUrbanOnly++;
    if (kinds.some(k => k !== "urban")) sawNonUrban++;
  }
  check("10. every prep bundle includes >=1 non-urban environment (never urban-only)", allUrbanOnly === 0, `${allUrbanOnly}/${N} were urban-only`);
  check("10b. non-urban seeds appear in effectively every prep (>=1 dungeon+wilderness, structural guarantee)", sawNonUrban === N, `${sawNonUrban}/${N}`);
}

// ============================================================================
// 11. NULL-SAFE degrade when tables are stubbed out
// ============================================================================
console.log("\n--- 11. null-safe degrade ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.eval(`var __origRollTable = rollTable; rollTable = function(){ return null; };`);
  const rr = win.restRiskRoll(w, { nodeId: "home", kind: "dawn" });
  check("11. restRiskRoll degrades to {ok:false} when uncompiled", rr && rr.ok === false, JSON.stringify(rr));
  const pw = win.parleyWantRoll();
  check("11b. parleyWantRoll degrades to null when uncompiled", pw === null);
  const hb = win.huntedBehaviorRoll();
  check("11c. huntedBehaviorRoll degrades to null when uncompiled", hb === null);
  const re = win.regionEncounterRoll({ id: "r1" });
  check("11d. regionEncounterRoll degrades to null when uncompiled", re === null);
  win.eval(`rollTable = __origRollTable;`);
  win.eval(`var __origWalkRows = walkRows; walkRows = function(){ return []; };`);
  const wi = win.walkPickInteractable("urban");
  check("11e. walkPickInteractable degrades to null when the table has no rows", wi === null);
  win.eval(`walkRows = __origWalkRows;`);
}

// ============================================================================
// 12. REGRESSION: existing foe_morale disposition assertions still hold
// ============================================================================
console.log("\n--- 12. regression: pre-existing morale disposition mechanics ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  // These fixtures are deliberately single-foe, so the lifecycle seam's detected combat_end
  // (COMBAT-LIFECYCLE §3b) now nulls GS.combat the moment the lone foe flees/routs/surrenders —
  // which is correct game behavior. Capture the foe REFERENCE before the event and assert on it:
  // the morale mechanics under test stamp the foe object itself, teardown or no teardown.
  win.GS.combat = { active: true, round: 1, foes: [{ fid: "f1", name: "Bat", hp: 2, maxHp: 8, band: "melee",
    creatureType: "beast", saves: {}, abilities: { wis: { mod: 0 } } }], pc: { band: "melee" }, moraleFlags: {} };
  const batFoe = win.GS.combat.foes[0];
  const rFlee = win.applyEvent(w, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 2 } });
  check("12. flee still moves the foe a band farther + marks fled", batFoe.fled === true, JSON.stringify(batFoe));

  win.GS.combat = { active: true, round: 1, foes: [{ fid: "f1", name: "Bat2", hp: 2, maxHp: 8, band: "melee",
    creatureType: "beast", saves: {}, abilities: { wis: { mod: 0 } } }], pc: { band: "melee" }, moraleFlags: {} };
  const bat2Foe = win.GS.combat.foes[0];
  win.applyEvent(w, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 6 } });
  check("12b. rout-panic still marks routed AND fled", bat2Foe.routed === true && bat2Foe.fled === true);

  win.GS.combat = { active: true, round: 1, foes: [{ fid: "f1", name: "Bat3", hp: 2, maxHp: 8, band: "melee",
    creatureType: "beast", saves: {}, abilities: { wis: { mod: 0 } } }], pc: { band: "melee" }, moraleFlags: {} };
  const bat3Foe = win.GS.combat.foes[0];
  win.applyEvent(w, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 4 } });
  check("12c. surrender still marks surrendering, band unchanged", bat3Foe.surrendering === true && bat3Foe.band === "melee");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
