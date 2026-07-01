/* Verify the CONDITIONS engine (docs/SRD-MECHANIZATION.md §3) — pure Node (the module is a table +
   plain-object logic; no DOM). Covers:
     - each condition's derived adv/dis on attack (+ the prone melee-vs-ranged asymmetry)
     - the incapacitated COMPOSITION (stunned/paralyzed/unconscious → incapacitated, without a literal tag)
     - auto-fail Str/Dex saves under paralysis; adv+dis cancels to a straight roll (RAW)
     - ttl expiry for every duration shape: {rounds} countdown, {endOfNextTurn}, {untilSave} lift,
       {concentration} + {indefinite} never bare-tick

   Run:  node dev/verify-conditions.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(read("src/engine/conditions.js") +
  "\n;globalThis.__api={CONDITIONS,conditionEffects,conditionAdvDis,hasCondition,isIncapacitated," +
  "addCondition,removeCondition,tickConditions,tickUntilSaveResult,conditionAutoFail};", ctx);
const A = ctx.__api;

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));
const withConds = (...names) => ({ conditions: names.slice() });

// ── A. attacker-side adv/dis ─────────────────────────────────────────────────────
check("blinded attacker → attacks at disadvantage",
  A.conditionAdvDis({ actor: withConds("blinded"), target: {}, kind: "attack" }).advantage === "dis");
check("poisoned attacker → attacks at disadvantage",
  A.conditionAdvDis({ actor: withConds("poisoned"), target: {}, kind: "attack" }).advantage === "dis");
check("invisible attacker → attacks with advantage",
  A.conditionAdvDis({ actor: withConds("invisible"), target: {}, kind: "attack" }).advantage === "adv");
check("frightened actor → checks at disadvantage",
  A.conditionAdvDis({ actor: withConds("frightened"), target: {}, kind: "check" }).advantage === "dis");

// ── B. target-side adv/dis ───────────────────────────────────────────────────────
check("blinded target → attacked with advantage",
  A.conditionAdvDis({ actor: {}, target: withConds("blinded"), kind: "attack" }).advantage === "adv");
check("restrained target → attacked with advantage",
  A.conditionAdvDis({ actor: {}, target: withConds("restrained"), kind: "attack" }).advantage === "adv");
check("invisible target → attacked at disadvantage",
  A.conditionAdvDis({ actor: {}, target: withConds("invisible"), kind: "attack" }).advantage === "dis");
check("paralyzed target → attacked with advantage",
  A.conditionAdvDis({ actor: {}, target: withConds("paralyzed"), kind: "attack" }).advantage === "adv");

// ── C. prone melee-vs-ranged asymmetry ───────────────────────────────────────────
check("prone target in MELEE → attacked with advantage",
  A.conditionAdvDis({ actor: {}, target: withConds("prone"), kind: "attack", range: "melee" }).advantage === "adv");
check("prone target at RANGE → attacked at disadvantage",
  A.conditionAdvDis({ actor: {}, target: withConds("prone"), kind: "attack", range: "ranged" }).advantage === "dis");

// ── D. adv + dis cancels (RAW — one of each → straight roll) ──────────────────────
// blinded attacker (dis) attacking a prone target in melee (adv) → cancels
check("adv + dis cancel to a straight roll",
  A.conditionAdvDis({ actor: withConds("blinded"), target: withConds("prone"), kind: "attack", range: "melee" }).advantage === null);

// ── E. incapacitated composition ─────────────────────────────────────────────────
check("stunned → isIncapacitated (no literal tag)", A.isIncapacitated(withConds("stunned")) === true);
check("paralyzed → isIncapacitated", A.isIncapacitated(withConds("paralyzed")) === true);
check("unconscious → isIncapacitated", A.isIncapacitated(withConds("unconscious")) === true);
check("poisoned → NOT incapacitated", A.isIncapacitated(withConds("poisoned")) === false);
check("literal incapacitated tag → isIncapacitated", A.isIncapacitated(withConds("incapacitated")) === true);

// ── F. auto-fail Str/Dex saves under paralysis/stun/unconscious ──────────────────
check("paralyzed auto-fails a STR save", A.conditionAutoFail(withConds("paralyzed"), "str") === true);
check("paralyzed auto-fails a DEX save", A.conditionAutoFail(withConds("paralyzed"), "dex") === true);
check("paralyzed does NOT auto-fail a WIS save", A.conditionAutoFail(withConds("paralyzed"), "wis") === false);
check("poisoned does NOT auto-fail a STR save", A.conditionAutoFail(withConds("poisoned"), "str") === false);

// ── G. add / remove / has ────────────────────────────────────────────────────────
const h = {};
A.addCondition(h, "restrained", { rounds: 3 }, 1);
check("addCondition: restrained present", A.hasCondition(h, "restrained") === true);
check("addCondition: unknown condition no-ops (returns null)", A.addCondition(h, "notacondition", { rounds: 1 }, 1) === null);
A.addCondition(h, "restrained", { rounds: 5 }, 1);   // re-add refreshes, doesn't duplicate
check("addCondition: re-add refreshes (no duplicate)", h.conditions.filter(e => (e.condition || e) === "restrained").length === 1 && h.conditions.find(e => e.condition === "restrained").ttl.rounds === 5);
check("removeCondition: lifts it", A.removeCondition(h, "restrained") === true && A.hasCondition(h, "restrained") === false);

// ── H. ttl expiry — {rounds} countdown ───────────────────────────────────────────
const r = {}; A.addCondition(r, "stunned", { rounds: 2 }, 1);   // applied round 1, lasts 2 rounds
check("rounds: no expiry on the SAME end-of-turn it was applied", A.tickConditions(r, 1, "end").length === 0 && A.hasCondition(r, "stunned"));
check("rounds: no expiry at round 2 end (1 of 2 elapsed)", A.tickConditions(r, 2, "end").length === 0 && A.hasCondition(r, "stunned"));
const exp = A.tickConditions(r, 3, "end");   // round 3: 2 elapsed → expires
check("rounds: expires at round 3 end (2 elapsed) → condition_expired list", exp.length === 1 && exp[0] === "stunned" && A.hasCondition(r, "stunned") === false);

// ── I. ttl expiry — {endOfNextTurn} ──────────────────────────────────────────────
const en = {}; A.addCondition(en, "prone", { endOfNextTurn: true }, 1);
check("endOfNextTurn: survives the turn it landed", A.tickConditions(en, 1, "end").length === 0 && A.hasCondition(en, "prone"));
check("endOfNextTurn: lifts at the end of the NEXT turn", A.tickConditions(en, 2, "end")[0] === "prone" && A.hasCondition(en, "prone") === false);

// ── J. ttl expiry — {untilSave} lifts only on a save success ─────────────────────
const us = {}; A.addCondition(us, "frightened", { untilSave: { ability: "wis", dc: 13 } }, 1);
check("untilSave: does NOT bare-tick away (needs a save)", A.tickConditions(us, 5, "end").length === 0 && A.hasCondition(us, "frightened"));
check("untilSave: a FAILED save leaves it", A.tickUntilSaveResult(us, "frightened", false) === false && A.hasCondition(us, "frightened"));
check("untilSave: a SUCCESSFUL save lifts it", A.tickUntilSaveResult(us, "frightened", true) === true && A.hasCondition(us, "frightened") === false);

// ── K. {concentration} + {indefinite} never bare-tick ────────────────────────────
const cc = {}; A.addCondition(cc, "charmed", { concentration: "caster-1" }, 1);
check("concentration-linked: never bare-ticks (lifts via breakConcentration)", A.tickConditions(cc, 9, "end").length === 0 && A.hasCondition(cc, "charmed"));
const ind = {}; A.addCondition(ind, "poisoned", { indefinite: true }, 1);
check("indefinite: never bare-ticks", A.tickConditions(ind, 99, "end").length === 0 && A.hasCondition(ind, "poisoned"));

// ── L. INTEGRATION through applyEvent (widened condition_add/remove/expired) — jsdom full load ──
import { createRequire } from "node:module";
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const man = JSON.parse(read("manifest.json"));
const srcAll = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
dom.window.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcAll);
const win = dom.window;
const world = {
  id: "w-cond", name: "Cond Test", gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 360 },
  map: { nodes: {}, edges: [] }, currentNodeId: null, revealed: {}, dmlog: [], pressures: [], factions: [],
  characters: [{ status: "living", name: "Hero", conditions: [], sheet: { class: "Fighter", level: 5, xp: 0, mods: {} } }],
};
win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
win.GS.combat = { active: true, round: 1, foes: [{ fid: "f1", name: "Goblin", conditions: [] }] };

// condition_add on the PC (target:"pc") with a structured ttl
win.applyEvent(world, { type: "condition_add", payload: { target: "pc", condition: "restrained", ttl: { rounds: 2 } }, source: "declared" });
check("integration: condition_add{target:pc} tags the CHARACTER (not an item)", world.characters[0].conditions.some((e) => (e.condition || e) === "restrained"));
// condition_add on a foe (target: fid)
win.applyEvent(world, { type: "condition_add", payload: { target: "f1", condition: "prone" }, source: "declared" });
check("integration: condition_add{target:f1} tags the foe", win.GS.combat.foes[0].conditions.some((e) => (e.condition || e) === "prone"));
// unknown condition no-ops on the creature path
const badRes = win.applyEvent(world, { type: "condition_add", payload: { target: "pc", condition: "notreal" }, source: "declared" });
check("integration: unknown creature condition → ok:false (engine invents no ontology)", badRes.ok === false && badRes.reason === "unknown-condition");
// condition_remove on the PC
win.applyEvent(world, { type: "condition_remove", payload: { target: "pc", condition: "restrained" }, source: "declared" });
check("integration: condition_remove{target:pc} lifts it", !world.characters[0].conditions.some((e) => (e.condition || e) === "restrained"));
// condition_expired on the foe
win.applyEvent(world, { type: "condition_expired", payload: { target: "f1", condition: "prone" }, source: "declared" });
check("integration: condition_expired{target:f1} clears + logs", !win.GS.combat.foes[0].conditions.some((e) => (e.condition || e) === "prone"));
// the ORIGINAL item-instance path still works (p.itemId) — back-compat
const it = { id: "i1", name: "Torch", conditions: [] };
world.characters[0].sheet.inventory = [it];
win.applyEvent(world, { type: "condition_add", payload: { itemId: "i1", condition: "on-fire" }, source: "declared" });
check("integration: condition_add{itemId} STILL tags the item instance (widening didn't break it)", it.conditions.indexOf("on-fire") >= 0);

// round_tick — advances every live holder's condition counters and AUTO-emits condition_expired
world.characters[0].conditions = [];
win.applyEvent(world, { type: "condition_add", payload: { target: "pc", condition: "restrained", ttl: { rounds: 1 } }, source: "declared" });
win.GS.combat.foes[0].conditions = [];
win.applyEvent(world, { type: "condition_add", payload: { target: "f1", condition: "prone", ttl: { rounds: 1 } }, source: "declared" });
win.GS.combat.round = 2;   // one round has passed since appliedRound:1
const tickRes = win.applyEvent(world, { type: "round_tick", payload: { round: 2, phase: "end" }, source: "detected" });
check("integration: round_tick expires both the PC's and the foe's 1-round conditions", tickRes.ok === true && tickRes.expired.length === 2, JSON.stringify(tickRes));
check("integration: round_tick actually cleared the PC's condition", !world.characters[0].conditions.some((e) => (e.condition || e) === "restrained"));
check("integration: round_tick actually cleared the foe's condition", !win.GS.combat.foes[0].conditions.some((e) => (e.condition || e) === "prone"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
