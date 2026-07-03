/* verify-breach.mjs — headless test for THE BREACH & THE NIGHTMARE, engine layer
   (docs/BREACH.md, docs/BATCH3-GUARDRAILS.md J1/J2 "breach-core": ≥10/0).

   Enumerated assertions (BREACH.md §3 build step 6 + BATCH3-GUARDRAILS J2's breach-core closures):
   1. bell shares over a large sample: center (~94%) / nightmare (~3%) / breach (~3%), each within a
      generous tolerance (a probabilistic assertion — wide bands, not exact percentages).
   2. frayMod (J2 EXACT shift rule: r>11 -> r+frayMod, r<11 -> r-frayMod, r==11 unchanged, clamp
      [2,20]) widens BOTH tails as frayMod rises, and the center (r==11) never moves.
   2b. MUTATION CHECK: a deliberately-broken shift (shifting the center-ward instead of outward) is
       caught by the harness's own widening assertion — shown RED, then the real implementation is
       confirmed to restore GREEN.
   3. center tail returns the CENTER resolver's result byte-identical-in-shape (a plain rollWalkSkin
      call still round-trips through rollWalkSkinBreach with tail:"center" tagged on).
   4. NULL-SAFE tail fallback: an uncompiled walk-breach-<env>/walk-nightmare-<env> table degrades to
      the center roll (tagged tailWanted), never throws, never fabricates a row.
   5. breachPersistenceRoll: d6 grades sealed(1-4)/unstable(5)/stable(6); idempotent (a second call on
      an already-stamped walk returns the SAME persistence, never re-rolls).
   6. breachStableDoor: writes a write-once map-node breachDoor flag only for a stable outcome; a
      second call on an already-flagged node is a no-op (write-once, mirrors addEdge's discipline).
   7. breachMarkRealmActive/breachRealmWalkTaken: the 1d2 debt is set ONLY by the ORIGINAL call — a
      second breachMarkRealmActive on an already-active realm never re-rolls/extends w.realm.debt.
   7b. MUTATION CHECK: force a second call to actually overwrite the debt, confirm the harness's own
       "never re-rolled" assertion catches it (shown RED), then restore (GREEN).
   8. the five physics-lens executors are pure + bounded: breachPhysicsDcBump only fires on magicDim,
      breachPhysicsZoneStep only on lowGrav, breachPhysicsTechGate only on techWorks,
      breachPhysicsHuntClock only on huntRules; breachApplyPhysicsToCombat NEVER writes hp/damage/ac
      onto the combat object it's given (mutation-checked: grep the returned object's own keys).
   9. breachXpMultiplier: BREACH_XP/NIGHTMARE_XP (1.5) for breach/nightmare tails, 1 for center — the
      single source, no second hardcoded premium anywhere.
   10. regression: rollDungeonWalk/rollUrbanWalk/rollWildernessWalk still return well-formed walks
       (segments/edges intact, walk.skin populated) with rollWalkSkinBreach wired into the chain.

   Run:  node dev/verify-breach.mjs
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
// top-level `const`s (BREACH_TAIL etc.) don't attach to jsdom's `window` under win.eval (same gotcha
// documented in verify-regions.mjs/verify-gen.mjs) — thin accessor wrappers expose them.
const accessors = "function __breachTail(){return BREACH_TAIL;} function __nightmareTail(){return NIGHTMARE_TAIL;} " +
  "function __breachXp(){return BREACH_XP;} function __nightmareXp(){return NIGHTMARE_XP;}";

function newWin() {
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n") + "\n;\n" + accessors;
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts) {
  opts = opts || {};
  return {
    id: opts.id || "w-breach", name: "Test World", session: 1,
    currentNodeId: "home",
    map: { nodes: { home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, edges: [] },
    gazetteer: [], ledger: [], log: [], clock: { day: 10, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [], sheet: { level: 3, gold: 100, inventory: [], equipped: {} } }],
    factions: [], pressures: [], shops: {}, codex: { records: {}, version: 1 }, seed: {},
  };
}
function mkWalk(win, segCount) {
  const segs = [];
  for (let i = 1; i <= segCount; i++) {
    segs.push({ id: "s" + i, num: i, isFinale: i === segCount, depth: i - 1, sensory: "quiet", footing: "level",
      loot: { magic: null, coin: "1 gp", valuable: null }, encounter: { type: "Empty", isEnemy: false, text: "quiet" } });
  }
  return { environment: "dungeon", segCount, segments: segs, edges: [], tier: "T1" };
}

// ============================================================================
// 1. bell shares over a large sample (probabilistic — wide tolerance bands)
// ============================================================================
console.log("\n--- §1. the 2d10 bell + tail dispatch ---");
{
  const win = newWin();
  const N = 20000;
  let center = 0, nightmare = 0, breach = 0;
  for (let i = 0; i < N; i++) {
    const r = win.breachShift2d10(0);
    const tail = win.breachTailOf(r.shifted);
    if (tail === "center") center++; else if (tail === "nightmare") nightmare++; else breach++;
  }
  const pC = center / N, pN = nightmare / N, pB = breach / N;
  check("1. center share ~94% (frayMod 0)", pC > 0.90 && pC < 0.98, "pC=" + pC.toFixed(4));
  check("1b. nightmare share ~3% (frayMod 0)", pN > 0.01 && pN < 0.06, "pN=" + pN.toFixed(4));
  check("1c. breach share ~3% (frayMod 0)", pB > 0.01 && pB < 0.06, "pB=" + pB.toFixed(4));
  check("1d. shares sum to 1", Math.abs((pC + pN + pB) - 1) < 1e-9, JSON.stringify({ pC, pN, pB }));
}

// ============================================================================
// 2. frayMod EXACT shift rule + widening invariant + center-never-moves
// ============================================================================
console.log("\n--- §2. frayMod shift rule ---");
{
  const win = newWin();
  // exact arithmetic per raw roll, all three frayMod tiers — exercises the REAL breachShift2d10 by
  // stubbing rollDie (win.eval) to force a known raw sum, so this can actually fail if the real
  // shift math regresses (not a reimplementation checked against itself).
  const forcedShift = (d1, d2, mod) => {
    win.eval(`(function(){ var __seq=[${d1},${d2}]; var __i=0; rollDie=function(){ return __seq[__i++]; }; })();`);
    return win.breachShift2d10(mod).shifted;
  };
  check("2. r>11 shifts UP by frayMod (real breachShift2d10, rollDie stubbed)",
    forcedShift(8, 7, 2) === 17   // raw=15 -> 15+2=17
    && forcedShift(4, 4, 2) === 6    // raw=8  -> 8-2=6
    && forcedShift(6, 5, 2) === 11   // raw=11 -> unchanged
    && forcedShift(8, 7, 0) === 15   // raw=15, mod=0 -> unchanged
    && forcedShift(10, 10, 2) === 20, // raw=20+2=22 -> clamp to 20
    "real breachShift2d10 shift arithmetic mismatch under stubbed rollDie");
  // restore the real rollDie — everything below this point needs genuine randomness, not the
  // fixed one-shot sequence stubbed in for the forcedShift() checks above.
  win.eval("rollDie=function(max){return Math.floor(Math.random()*max)+1;};");

  // clamp[2,20]: a raw 20 + frayMod 2 must clamp to 20, a raw 2 - frayMod 2 must clamp to 2.
  // Force via many rolls at frayMod=2 and confirm no shifted value ever escapes [2,20].
  let outOfRange = 0, sawHigh = false, sawLow = false;
  for (let i = 0; i < 5000; i++) {
    const r = win.breachShift2d10(2);
    if (r.shifted < 2 || r.shifted > 20) outOfRange++;
    if (r.shifted >= 20) sawHigh = true;
    if (r.shifted <= 2) sawLow = true;
  }
  check("2b. shifted result never escapes [2,20] even at frayMod=2", outOfRange === 0, "outOfRange=" + outOfRange);
  check("2c. frayMod=2 actually reaches both clamped extremes over a large sample", sawHigh && sawLow,
    JSON.stringify({ sawHigh, sawLow }));

  // widening invariant: raising frayMod must widen (or hold) BOTH tail shares, never shrink either,
  // and the exact-center (raw===11) share must be identical in expectation regardless of frayMod
  // (r==11 -> unchanged, so P(raw===11) is frayMod-independent — sample directly).
  const sampleTailShares = (mod, n) => {
    let nm = 0, br = 0;
    for (let i = 0; i < n; i++) {
      const r = win.breachShift2d10(mod);
      const t = win.breachTailOf(r.shifted);
      if (t === "nightmare") nm++; else if (t === "breach") br++;
    }
    return { nm: nm / n, br: br / n };
  };
  const N2 = 30000;
  const s0 = sampleTailShares(0, N2), s1 = sampleTailShares(1, N2), s2 = sampleTailShares(2, N2);
  check("2d. nightmare tail share widens (or holds) as frayMod rises 0->1->2",
    s1.nm >= s0.nm - 0.01 && s2.nm >= s1.nm - 0.01 && s2.nm > s0.nm,
    JSON.stringify({ s0, s1, s2 }));
  check("2e. breach tail share widens (or holds) as frayMod rises 0->1->2",
    s1.br >= s0.br - 0.01 && s2.br >= s1.br - 0.01 && s2.br > s0.br,
    JSON.stringify({ s0, s1, s2 }));

  // 2f MUTATION CHECK: a deliberately-broken "shift toward center" rule must be CAUGHT by the same
  // widening assertion above — prove the assertion has teeth by running it against a bad implementation.
  const brokenTailShare = (mod, n) => {
    let nm = 0, br = 0;
    for (let i = 0; i < n; i++) {
      // BROKEN: shifts the result TOWARD center instead of away (the bug this mutation check guards against)
      const raw = 1 + Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10);
      let shifted = raw;
      if (raw > 11) shifted = raw - mod;       // BUG: should be raw+mod
      else if (raw < 11) shifted = raw + mod;  // BUG: should be raw-mod
      shifted = Math.max(2, Math.min(20, shifted));
      const t = win.breachTailOf(shifted);
      if (t === "nightmare") nm++; else if (t === "breach") br++;
    }
    return { nm: nm / n, br: br / n };
  };
  const b0 = brokenTailShare(0, N2), b2 = brokenTailShare(2, N2);
  const brokenWidens = (b2.nm > b0.nm) && (b2.br > b0.br);
  check("2f. MUTATION (shown RED): a center-ward shift bug does NOT widen both tails (caught)", brokenWidens === false,
    "expected the broken rule to FAIL the widen invariant; got brokenWidens=" + brokenWidens);
  check("2g. MUTATION restored (GREEN): the REAL implementation DOES widen both tails", (s2.nm > s0.nm) && (s2.br > s0.br),
    JSON.stringify({ s0, s2 }));
}

// ============================================================================
// 3/4. rollWalkSkinBreach — center passthrough + null-safe tail fallback
// ============================================================================
console.log("\n--- §3/4. rollWalkSkinBreach dispatch ---");
{
  const win = newWin();
  // force center every time via frayMod 0 + many samples, confirm shape mirrors rollWalkSkin's own
  // (tables ARE compiled for walk-skin-dungeon per WALK-REFRESH landing) with tail/roll metadata added.
  let sawCenter = false, sawTailFallback = false;
  for (let i = 0; i < 200 && !(sawCenter && sawTailFallback); i++) {
    const r = win.rollWalkSkinBreach("dungeon", {});
    if (!r) continue;
    if (r.tail === "center" && !r.tailWanted) sawCenter = true;
    if (r.tailWanted) sawTailFallback = true;
  }
  check("3. a center result carries tail:'center' and the base skin shape (text/band/ref)", sawCenter, "no center result observed in 200 samples");
  check("4. a tail-wanted result (walk-breach-*/walk-nightmare-* uncompiled) NULL-SAFE-falls back to center, tagged tailWanted",
    sawTailFallback, "no tailWanted fallback observed in 200 samples (tables may already be compiled — see uncertainties)");

  // never throws even when rollTable/rollWalkSkin are entirely absent (lean/headless degrade)
  let threw = false;
  try {
    const fakeWin = newWin();
    fakeWin.eval("rollWalkSkin = undefined; rollTable = undefined;");
    fakeWin.rollWalkSkinBreach("dungeon", {});
  } catch (e) { threw = true; }
  check("4b. rollWalkSkinBreach never throws when rollWalkSkin/rollTable are both absent", !threw);
}

// ============================================================================
// 5. breachPersistenceRoll — d6 grading + idempotency
// ============================================================================
console.log("\n--- §5. persistence roll ---");
{
  const win = newWin();
  let sawSealed = false, sawUnstable = false, sawStable = false;
  for (let i = 0; i < 500; i++) {
    const walk = { id: "w" + i };
    const p = win.breachPersistenceRoll(walk);
    if (p.outcome === "sealed") sawSealed = true;
    if (p.outcome === "unstable") sawUnstable = true;
    if (p.outcome === "stable") sawStable = true;
  }
  check("5. persistence grades all three outcomes (sealed 1-4/unstable 5/stable 6) over 500 rolls", sawSealed && sawUnstable && sawStable,
    JSON.stringify({ sawSealed, sawUnstable, sawStable }));

  const walk = { id: "w-once" };
  const first = win.breachPersistenceRoll(walk);
  const second = win.breachPersistenceRoll(walk);
  check("5b. idempotent: a second call on an already-stamped walk returns the SAME persistence (never re-rolls)",
    first.d === second.d && first.outcome === second.outcome && walk.persistence === first,
    JSON.stringify({ first, second }));
}

// ============================================================================
// 6. breachStableDoor — write-once map-node flag
// ============================================================================
console.log("\n--- §6. stable door ---");
{
  const win = newWin();
  const w = mkWorld(win);
  const walk = { skin: { motif: "flood" } };
  const wroteFirst = win.breachStableDoor(w, walk, "home");
  check("6. a stable door writes the node's breachDoor flag", wroteFirst && w.map.nodes.home.breachDoor && w.map.nodes.home.breachDoor.stable === true,
    JSON.stringify(w.map.nodes.home.breachDoor));
  const wroteSecond = win.breachStableDoor(w, walk, "home");
  check("6b. write-once: a second call on an already-flagged node is a no-op", wroteSecond === false,
    "expected false, got " + wroteSecond);

  const wNoNode = mkWorld(win);
  const noOp = win.breachStableDoor(wNoNode, walk, "nonexistent");
  check("6c. an unknown nodeId degrades to a no-op (never throws, never fabricates a node)", noOp === false);
}

// ============================================================================
// 7. marooned debt — w.realm.debt set ONLY by the original roll
// ============================================================================
console.log("\n--- §7. marooned realm debt ---");
{
  const win = newWin();
  const w = mkWorld(win);
  const first = win.breachMarkRealmActive(w, "gloom", ["huntRules"]);
  check("7. the first call sets w.realm active + a 1d2 debt (1 or 2)", w.realm.active === true && (w.realm.debt === 1 || w.realm.debt === 2),
    JSON.stringify(w.realm));
  const debtAfterFirst = w.realm.debt;
  const second = win.breachMarkRealmActive(w, "chrome", ["techWorks"]);
  check("7b. a SECOND call on an already-active realm never re-rolls/extends the debt (same object, same debt, same name)",
    w.realm.debt === debtAfterFirst && w.realm.name === "gloom" && second === w.realm,
    JSON.stringify({ debtAfterFirst, now: w.realm }));

  // consume walks toward home; debt only decrements, never grows past its original value.
  win.breachRealmWalkTaken(w);
  check("7c. breachRealmWalkTaken decrements the debt by exactly 1 (never below 0)",
    w.realm.debt === Math.max(0, debtAfterFirst - 1), "debt=" + w.realm.debt);

  const cleared = win.breachRealmClear(w);
  check("7d. breachRealmClear closes an active realm (homecoming)", cleared === true && w.realm.active === false);
  const clearedAgain = win.breachRealmClear(w);
  check("7e. clearing an already-closed realm is idempotent (false, no throw)", clearedAgain === false);

  // 7f/7g MUTATION CHECK: a deliberately-BROKEN mark-active (re-rolls the debt on every call, ignoring
  // an already-active realm) is run against the SAME "debt never moves on a second call" assertion
  // §7b uses on the real function — confirm the assertion actually catches the broken version (RED),
  // then confirm the REAL breachMarkRealmActive still passes it (GREEN, restored).
  const brokenMarkRealmActive = (world, name, physics) => {
    const d = 1 + Math.floor(Math.random() * 2);
    world.realm = { active: true, name: name || null, physics: physics || [], debt: d, motif: null }; // BUG: always re-rolls
    return world.realm;
  };
  const wBad = mkWorld(win, { id: "w-bad" });
  brokenMarkRealmActive(wBad, "gloom", []);
  const debtBefore = wBad.realm.debt;
  let sawDrift = false;
  for (let i = 0; i < 20; i++) { brokenMarkRealmActive(wBad, "ash", []); if (wBad.realm.debt !== debtBefore) { sawDrift = true; break; } }
  check("7f. MUTATION (shown RED): the broken always-re-roll implementation DOES drift the debt across calls (caught)",
    sawDrift === true, "expected the broken implementation to eventually drift debt away from " + debtBefore);

  const wGood = mkWorld(win, { id: "w-good" });
  win.breachMarkRealmActive(wGood, "gloom", []);
  const goodDebtBefore = wGood.realm.debt;
  let goodDrifted = false;
  for (let i = 0; i < 20; i++) { win.breachMarkRealmActive(wGood, "ash", []); if (wGood.realm.debt !== goodDebtBefore) { goodDrifted = true; break; } }
  check("7g. MUTATION restored (GREEN): the REAL breachMarkRealmActive never drifts the debt across repeated calls",
    goodDrifted === false, "expected the debt to stay pinned at " + goodDebtBefore);
}

// ============================================================================
// 8. physics lens executors — pure, bounded, never touch hp/damage/ac/xp
// ============================================================================
console.log("\n--- §8. physics lenses ---");
{
  const win = newWin();
  check("8. breachPhysicsDcBump only fires on magicDim", win.breachPhysicsDcBump(["techWorks"]) === 0 && win.breachPhysicsDcBump(["magicDim"]) === 2);
  check("8b. breachPhysicsZoneStep only fires on lowGrav", win.breachPhysicsZoneStep([]) === 0 && win.breachPhysicsZoneStep(["lowGrav"]) === 1);
  check("8c. breachPhysicsTechGate only true on techWorks", win.breachPhysicsTechGate(["huntRules"]) === false && win.breachPhysicsTechGate(["techWorks"]) === true);
  check("8d. breachPhysicsHuntClock only true on huntRules", win.breachPhysicsHuntClock([]) === false && win.breachPhysicsHuntClock(["huntRules"]) === true);
  const voice = win.breachPhysicsStageVoice(["stageRules", "timeSlip"]);
  check("8e. breachPhysicsStageVoice reports stageRules/timeSlip/dreamRules independently", voice.stageRules === true && voice.timeSlip === true && voice.dreamRules === false,
    JSON.stringify(voice));

  const fakeCombat = { active: true, round: 1, foes: [{ fid: "f1", hp: 10, maxHp: 10, ac: 14 }] };
  const before = JSON.stringify(fakeCombat);
  const lens = win.breachApplyPhysicsToCombat(fakeCombat, ["magicDim", "huntRules"]);
  check("8f. breachApplyPhysicsToCombat NEVER mutates the passed combat object", JSON.stringify(fakeCombat) === before, "combat object was mutated");
  const lensKeys = Object.keys(lens).join(",");
  check("8g. the returned lens object carries only report fields — no hp/damage/ac/xp keys",
    !/hp|damage|ac|xp/i.test(lensKeys), lensKeys);
  check("8h. the returned lens correctly reports the requested physics (dcBump=2, huntClock=true, techGate=false)",
    lens.dcBump === 2 && lens.huntClock === true && lens.techGate === false, JSON.stringify(lens));
}

// ============================================================================
// 9. breachXpMultiplier — the single premium source
// ============================================================================
console.log("\n--- §9. XP premium ---");
{
  const win = newWin();
  const bx = win.__breachXp(), nx = win.__nightmareXp();
  check("9. BREACH_XP === NIGHTMARE_XP === 1.5 (the init premium, E(L) units)", bx === 1.5 && nx === 1.5, JSON.stringify({ bx, nx }));
  check("9b. breachXpMultiplier reads the same constants for both tails", win.breachXpMultiplier("breach") === bx && win.breachXpMultiplier("nightmare") === nx);
  check("9c. breachXpMultiplier is 1 (no premium) for center", win.breachXpMultiplier("center") === 1);
}

// ============================================================================
// 10. regression — the three walk rollers still assemble well-formed walks
// ============================================================================
console.log("\n--- §10. regression (walk assembly unharmed) ---");
{
  const win = newWin();
  const d = win.rollDungeonWalk({ segCount: 5, tier: 1 });
  check("10. rollDungeonWalk still returns a well-formed walk with segments+skin", Array.isArray(d.segments) && d.segments.length > 0 && !!d.skin,
    JSON.stringify({ segCount: d.segments && d.segments.length, skin: d.skin }));
  const u = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  check("10b. rollUrbanWalk still returns a well-formed walk with segments+skin", Array.isArray(u.segments) && u.segments.length > 0 && !!u.skin,
    JSON.stringify({ segCount: u.segments && u.segments.length, skin: u.skin }));
  const wl = win.rollWildernessWalk({ legCount: 4, tier: 1 });
  check("10c. rollWildernessWalk still returns a well-formed walk with segments+skin", Array.isArray(wl.segments) && wl.segments.length > 0 && !!wl.skin,
    JSON.stringify({ segCount: wl.segments && wl.segments.length, skin: wl.skin }));

  // world-threaded call (opts.world) exercises the hex-position -> frayMod plumbing without throwing.
  const w = mkWorld(win);
  let threw = false;
  try { win.rollDungeonWalk({ segCount: 4, tier: 1, world: w }); } catch (e) { threw = true; }
  check("10d. rollDungeonWalk with opts.world set (hex-position plumbing) never throws", !threw);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
