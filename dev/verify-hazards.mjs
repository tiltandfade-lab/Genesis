/* Verify EXHAUSTION + ENVIRONMENTAL HAZARDS (docs/SRD-MECHANIZATION.md §5). Pure Node (vm) for the
   engine math; a jsdom section for the applyEvent wiring (condition_add exhaustion / hazard_tick / rest
   decrementing exhaustion). Covers:
     - exhaustion add/remove, clamped [0,6]
     - the -2/level check penalty (exhaustionCheckPenalty) folds into engine.checks' resolveCheck as `bonus`
     - the -5ft/level speed penalty
     - level 6 = death (routed to Death & Rebirth)
     - fall-damage formula (1d6/10ft, capped at 20d6) + the cap boundary
     - on-fire hazardTick reuses the ITEMS.md §D Burning rate (1d4 fire)
     - suffocation/drowning hold-breath-then-drop timer
     - integration: condition_add{condition:"exhaustion"} increments; a long rest decrements 1;
       hazard_tick{kind:"fall"} applies damage via hp_changed; on-fire hazard_tick applies damage

   Run:  node dev/verify-hazards.mjs */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// engine.check's file is src/engine/check.js in this build (src/engine/checks.js in some others) —
// resolve whichever exists so the exhaustionCheckPenalty→resolveCheck composition test works regardless.
const CHECK_PATH = existsSync(join(ROOT, "src/engine/check.js")) ? "src/engine/check.js" : "src/engine/checks.js";

// a deterministic rollDie so fall/on-fire damage is assertable exactly (mirrors other verifiers' pattern
// of stubbing the d-roller rather than asserting ranges) — always rolls the MAX face.
const DETERMINISTIC_ROLLDIE = "function rollDie(sides){ return sides; }";
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(DETERMINISTIC_ROLLDIE + "\n" + read("src/engine/combat.js") + "\n" + read(CHECK_PATH) +
  "\n" + read("src/engine/hazards.js") +
  "\n;globalThis.__api={exhaustionLevel,addExhaustion,removeExhaustion,exhaustionSpeedPenalty," +
  "exhaustionCheckPenalty,resolveFall,hazardTick,HAZARDS,resolveCheck};", ctx);
const A = ctx.__api;

// ── A. exhaustion add/remove, clamped [0,6] ─────────────────────────────────────
{
  const sh = {};
  check("exhaustionLevel: untracked → 0", A.exhaustionLevel(sh) === 0);
  check("addExhaustion: 0→1", A.addExhaustion(sh) === 1);
  A.addExhaustion(sh, 4);
  check("addExhaustion(n=4): 1→5", A.exhaustionLevel(sh) === 5);
  check("addExhaustion: clamps at 6 (not 7+)", A.addExhaustion(sh, 5) === 6);
  check("removeExhaustion: 6→5", A.removeExhaustion(sh) === 5);
  A.removeExhaustion(sh, 10);
  check("removeExhaustion: floors at 0 (not negative)", A.exhaustionLevel(sh) === 0);
}

// ── B. -2/level check penalty + -5ft/level speed penalty ────────────────────────
{
  const sh = { exhaustion: 3 };
  check("exhaustionCheckPenalty: -2 × level (3 → -6)", A.exhaustionCheckPenalty(sh) === -6);
  check("exhaustionSpeedPenalty: -5ft × level (3 → -15)", A.exhaustionSpeedPenalty(sh) === 15);
  check("exhaustionCheckPenalty: level 0 → 0 (no penalty)", A.exhaustionCheckPenalty({ exhaustion: 0 }) === 0);
}
// composition: exhaustionCheckPenalty feeds resolveCheck's `bonus` term
{
  const sh = { exhaustion: 2 };
  const penalty = A.exhaustionCheckPenalty(sh);   // -4
  const r = A.resolveCheck({ d20: 15, abilityMod: 3, dc: 12, bonus: penalty });
  check("exhaustion folds into resolveCheck as `bonus` (15+3-4=14 vs dc12 → success, margin 2)", r.total === 14 && r.margin === 2, JSON.stringify(r));
}

// ── C. fall damage — formula + cap ──────────────────────────────────────────────
check("resolveFall: 0 feet → no damage", A.resolveFall(0).total === 0);
check("resolveFall: 5 feet (< 10) → no damage (floor to 0 dice)", A.resolveFall(5).total === 0);
{
  // deterministic rollDie always returns the max face (6) — so Nd6 = N*6
  const r10 = A.resolveFall(10);   // 1d6
  check("resolveFall: 10 feet → 1d6 (deterministic max: 6)", r10.dice.n === 1 && r10.total === 6, JSON.stringify(r10));
  const r55 = A.resolveFall(55);   // floor(55/10)=5 → 5d6
  check("resolveFall: 55 feet → 5d6 (deterministic max: 30)", r55.dice.n === 5 && r55.total === 30);
  const r200 = A.resolveFall(200); // floor(200/10)=20 → cap exactly at 20d6
  check("resolveFall: 200 feet → 20d6 (the cap boundary, not yet exceeded)", r200.dice.n === 20 && r200.total === 120);
  const r500 = A.resolveFall(500); // would be 50d6 uncapped — capped at 20d6
  check("resolveFall: 500 feet → STILL capped at 20d6 (doesn't get worse past 200ft)", r500.dice.n === 20 && r500.total === 120);
}

// ── D. HAZARDS vocabulary + hazardTick ───────────────────────────────────────────
check("HAZARDS: on-fire reuses ITEMS.md §D Burning rate (1d4 fire)", A.HAZARDS["on-fire"].type === "fire" && A.HAZARDS["on-fire"].dice.n === 1 && A.HAZARDS["on-fire"].dice.die === 4);
{
  const r = A.hazardTick("on-fire", {});
  check("hazardTick(on-fire): rolls 1d4 fire (deterministic max: 4)", r.ok === true && r.type === "fire" && r.damage === 4, JSON.stringify(r));
}
check("hazardTick: unknown hazard → ok:false", A.hazardTick("nonsense", {}).ok === false);
{
  // suffocation: within the grace period → still breathing
  const r1 = A.hazardTick("suffocating", { holdRounds: 2, roundsHeld: 0 });
  check("hazardTick(suffocating): within grace period → breathing:true", r1.ok === true && r1.breathing === true && r1.roundsHeld === 1);
  const r2 = A.hazardTick("suffocating", { holdRounds: 2, roundsHeld: 1 });
  check("hazardTick(suffocating): still within grace (2nd round of 2) → breathing:true", r2.breathing === true && r2.roundsHeld === 2);
  const r3 = A.hazardTick("suffocating", { holdRounds: 2, roundsHeld: 2 });
  check("hazardTick(suffocating): past grace period → breathing:false, dropTo0:true", r3.breathing === false && r3.dropTo0 === true);
}
{
  const r = A.hazardTick("drowning", { holdRounds: 1, roundsHeld: 1 });
  check("hazardTick(drowning): shares the same timer shape as suffocating", r.dropTo0 === true);
}

// ── E. INTEGRATION through applyEvent (jsdom full load) ──────────────────────────
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const man = JSON.parse(read("manifest.json"));
const srcAll = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
dom.window.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcAll);
const win = dom.window;
const world = {
  id: "w-hazard", name: "Hazard Test", gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 360 },
  map: { nodes: {}, edges: [] }, currentNodeId: null, revealed: {}, dmlog: [], pressures: [], factions: [],
  characters: [{ id: "hero1", status: "living", name: "Hero", conditions: [],
    sheet: { class: "Fighter", level: 5, xp: 0, mods: { con: 1 }, hp: 40, hpCur: 40 } }],
};
win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
const sheet = world.characters[0].sheet;

// condition_add{condition:"exhaustion"} increments the sheet's counter (routes AROUND the §3 CONDITIONS
// table, since exhaustion is its own numeric field, not a flat effect row)
win.applyEvent(world, { type: "condition_add", payload: { target: "pc", condition: "exhaustion" }, source: "declared" });
check("integration: condition_add{exhaustion} increments sh.exhaustion (0→1)", sheet.exhaustion === 1);
win.applyEvent(world, { type: "condition_add", payload: { target: "pc", condition: "exhaustion", n: 2 }, source: "declared" });
check("integration: condition_add{exhaustion, n:2} adds 2 more (1→3)", sheet.exhaustion === 3);

// a COMPLETED long rest decrements exhaustion by 1. restRisk can legitimately interrupt a rest
// (restRiders skips recovery when it does), and the interruption roll's stream position shifts
// whenever upstream code changes — asserting on one fixed attempt is the seeded-stream flake class
// the 2026-07-19 CI lesson bans (loop-until-crossed, never fixed-position). Retry until a rest
// completes; an interrupted attempt grants no recovery and sets no once-per-24h stamp, so retries
// stay valid. 12 straight interruptions would itself be a real bug worth failing on.
let longRestRes = null;
for (let attempt = 0; attempt < 12; attempt++) {
  longRestRes = win.applyEvent(world, { type: "rest", payload: { kind: "long" }, source: "declared" });
  if (!(longRestRes && longRestRes.interrupted)) break;
}
check("integration: a COMPLETED long rest decrements exhaustion by 1 (3→2)",
  !(longRestRes && longRestRes.interrupted) && sheet.exhaustion === 2,
  JSON.stringify({ interrupted: longRestRes && longRestRes.interrupted, exhaustion: sheet.exhaustion }));
// a SHORT rest does NOT touch exhaustion (true whether or not the short rest is interrupted —
// completed short rests grant no exhaustion recovery, interrupted ones grant no recovery at all)
win.applyEvent(world, { type: "rest", payload: { kind: "short" }, source: "declared" });
check("integration: a short rest does NOT decrement exhaustion (stays 2)", sheet.exhaustion === 2);

// hazard_tick{kind:"fall"} applies fall damage via hp_changed
const hpBefore = sheet.hpCur;
const fallRes = win.applyEvent(world, { type: "hazard_tick", payload: { kind: "fall", feet: 30 }, source: "declared" });
check("integration: hazard_tick(fall, 30ft) → 3d6 damage applied to HP", fallRes.ok === true && fallRes.damage > 0 && sheet.hpCur === hpBefore - fallRes.damage, JSON.stringify({fallRes, hpCur: sheet.hpCur}));

// hazard_tick{kind:"on-fire"} applies burning damage
const hpBefore2 = sheet.hpCur;
const fireRes = win.applyEvent(world, { type: "hazard_tick", payload: { kind: "on-fire" }, source: "declared" });
check("integration: hazard_tick(on-fire) → 1d4 fire damage applied to HP", fireRes.ok === true && fireRes.damage > 0 && sheet.hpCur === hpBefore2 - fireRes.damage);

// exhaustion level 6 → death
sheet.exhaustion = 5;
const deathRes = win.applyEvent(world, { type: "condition_add", payload: { target: "pc", condition: "exhaustion" }, source: "declared" });
check("integration: exhaustion reaching level 6 → dead, routes to Death & Rebirth", deathRes.dead === true && deathRes.level === 6);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
