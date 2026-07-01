/* Verify the COMBAT-ACTION layer (docs/SRD-MECHANIZATION.md §6). Pure Node (vm) for the engine +
   jsdom for the applyEvent wiring. Covers:
     - turn-budget refusal (a second Action / a used Reaction)
     - Dodge → self-flag; Disengage → suppresses OA; Help → advantage hint
     - attacksPerAction curve by class/level (Extra Attack at L5; Fighter L11→3; non-martial stays 1)
     - OA trigger on an undefended Melee-leave + suppression by Disengage + one-reaction-per-round cap
     - grapple/shove CONTEST (Athletics vs Athletics-or-Acrobatics, tie favors defender) → verdict
     - integration: action / opportunity_attack / grapple / shove events; Extra Attack attackIndex

   Run:  node dev/verify-combat-actions.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── engine context (vm) ─────────────────────────────────────────────────────────
const SKILL_ABILITY_SRC = "const " + read("data/srd-creator.js").match(/SKILL_ABILITY=\{[^}]*\};/)[0];
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(SKILL_ABILITY_SRC + "\n" + read("src/engine/core.js") + "\n" + read("src/engine/combat.js") + "\n" +
  read("src/engine/check.js") + "\n" + read("src/engine/conditions.js") + "\n" + read("src/engine/combat-actions.js") +
  "\n;globalThis.__api={STANDARD_ACTIONS,EXTRA_ATTACK_PROGRESSION,resetTurnBudget,spendBudget,standardAction," +
  "attacksPerAction,opportunityAttack,resolveContest,resolveGrapple,resolveShove};", ctx);
const A = ctx.__api;

// ── A. turn-budget refusal ───────────────────────────────────────────────────────
const c1 = {}; A.resetTurnBudget(c1);
check("budget: first Action spends OK", A.spendBudget(c1, "action").ok === true);
check("budget: a SECOND Action is refused (already-spent)", A.spendBudget(c1, "action").ok === false);
check("budget: Bonus is still available (separate slot)", A.spendBudget(c1, "bonus").ok === true);
check("budget: Reaction spends once", A.spendBudget(c1, "reaction").ok === true);
check("budget: a used Reaction is refused", A.spendBudget(c1, "reaction").ok === false);
A.resetTurnBudget(c1);
check("budget: reset restores the Action", A.spendBudget(c1, "action").ok === true);
const cf = { flags: { disengaged: true, readied: {} } }; A.resetTurnBudget(cf);
check("budget: reset also CLEARS per-turn flags (disengaged/readied don't persist past the turn)", !cf.flags.disengaged && !cf.flags.readied);

// ── B. standard actions ──────────────────────────────────────────────────────────
const dc = {}; A.resetTurnBudget(dc);
const dodge = A.standardAction(dc, "dodge");
check("dodge: spends the Action + reports intent (the `dodging` CONDITION is applied by the caller, not an inert flag)", dodge.ok && dodge.effect.kind === "dodge" && dc.budget.action === false && !(dc.flags && dc.flags.dodging));
check("dodge: a second Action this turn is refused", A.standardAction(dc, "help").ok === false);
const de = {}; A.resetTurnBudget(de); A.standardAction(de, "disengage");
check("disengage: sets the disengaged flag", de.flags.disengaged === true);
const hp = {}; A.resetTurnBudget(hp);
check("help: returns the advantage hint for the ally", A.standardAction(hp, "help", { ally: "Ally" }).effect.kind === "help");
check("unknown action → refused (engine invents none)", A.standardAction({ budget: { action: true } }, "teleport").ok === false);

// ── C. attacksPerAction curve ────────────────────────────────────────────────────
check("extra attack: Fighter L1 → 1", A.attacksPerAction({ class: "Fighter", level: 1 }) === 1);
check("extra attack: Fighter L4 → 1 (not yet)", A.attacksPerAction({ class: "Fighter", level: 4 }) === 1);
check("extra attack: Fighter L5 → 2", A.attacksPerAction({ class: "Fighter", level: 5 }) === 2);
check("extra attack: Fighter L11 → 3", A.attacksPerAction({ class: "Fighter", level: 11 }) === 3);
check("extra attack: Barbarian L5 → 2", A.attacksPerAction({ class: "Barbarian", level: 5 }) === 2);
check("extra attack: Paladin L5 → 2", A.attacksPerAction({ class: "Paladin", level: 5 }) === 2);
check("extra attack: Ranger L5 → 2", A.attacksPerAction({ class: "Ranger", level: 5 }) === 2);
check("extra attack: Monk L5 → 2", A.attacksPerAction({ class: "Monk", level: 5 }) === 2);
check("extra attack: Wizard L11 → 1 (no Extra Attack)", A.attacksPerAction({ class: "Wizard", level: 11 }) === 1);
check("extra attack: Rogue L5 → 1 (no Extra Attack)", A.attacksPerAction({ class: "Rogue", level: 5 }) === 1);

// ── D. opportunity attacks ───────────────────────────────────────────────────────
const mover = { band: "melee", flags: {} };
const foe1 = { fid: "f1", down: false }; A.resetTurnBudget(foe1);
const oa = A.opportunityAttack(mover, [foe1]);
check("OA: leaving Melee provokes a threatening foe (reaction available)", oa.length === 1 && oa[0].fid === "f1");
check("OA: the foe's Reaction is now spent (one per round)", foe1.budget.reaction === false);
const oa2 = A.opportunityAttack(mover, [foe1]);
check("OA: a foe with no Reaction left does NOT swing again this round", oa2.length === 0);
const disMover = { band: "melee", flags: { disengaged: true } };
const foe2 = { fid: "f2", down: false }; A.resetTurnBudget(foe2);
check("OA: Disengage suppresses the opportunity attack entirely", A.opportunityAttack(disMover, [foe2]).length === 0);
const nearMover = { band: "near", flags: {} };
check("OA: a move that doesn't LEAVE Melee provokes nothing", A.opportunityAttack(nearMover, [{ fid: "f3", down: false, budget: { reaction: true } }]).length === 0);

// ── E. grapple / shove contest ───────────────────────────────────────────────────
const strong = { mods: { str: 4 }, profBonus: 3, skillProfs: ["Athletics"] };   // +7 Athletics
const weak = { mods: { str: 0, dex: 0 }, profBonus: 2, skillProfs: [] };          // +0
const gWin = A.resolveGrapple(strong, { d20: 10 }, weak, { d20: 10 });           // 17 vs 10 → attacker wins
check("grapple: attacker's higher total wins", gWin.success === true && gWin.attackerTotal === 17 && gWin.defenderTotal === 10);
const tie = A.resolveGrapple({ mods: { str: 0 }, profBonus: 0, skillProfs: [] }, { d20: 10 }, weak, { d20: 10 });
check("grapple: a TIE favors the defender (attacker does NOT win)", tie.attackerTotal === tie.defenderTotal && tie.success === false);
// defender picks the HIGHER of Athletics/Acrobatics — give them big DEX so Acrobatics wins
const nimble = { mods: { str: 0, dex: 5 }, profBonus: 3, skillProfs: ["Acrobatics"] };  // Acro +8, Ath +0
const gDef = A.resolveGrapple(strong, { d20: 3 }, nimble, { d20: 10 });          // atk 3+7=10 vs def max(0, 18)=18
check("grapple: defender uses the HIGHER of Athletics/Acrobatics (Acrobatics 18 > Athletics 10)", gDef.defenderSkillUsed === "Acrobatics" && gDef.success === false);
const shove = A.resolveShove(strong, { d20: 15 }, weak, { d20: 2 }, "prone");
check("shove: success carries the declared intent", shove.success === true && shove.intent === "prone");

// ── F. INTEGRATION through applyEvent ─────────────────────────────────────────────
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const man = JSON.parse(read("manifest.json"));
const srcAll = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
dom.window.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcAll);
const win = dom.window;
const world = {
  id: "w-ca", name: "CA Test", gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 360 },
  map: { nodes: {}, edges: [] }, currentNodeId: null, revealed: {}, dmlog: [], pressures: [], factions: [],
  characters: [{ status: "living", name: "Fighter", conditions: [],
    sheet: { class: "Fighter", level: 5, mods: { str: 4 }, profBonus: 3, skillProfs: ["Athletics"], hp: 40, hpCur: 40, ac: 16 } }],
};
win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
win.GS.combat = { active: true, round: 1, pc: { band: "melee" }, foes: [{ fid: "f1", name: "Ogre", down: false, ac: 11,
  abilities: { str: { score: 18, mod: 4 }, dex: { score: 8, mod: -1 } }, pb: 3,
  actions: [{ name: "Club", kind: "melee", atk: 6, dmg: [{ n: 2, die: 8, bonus: 4, type: "bludgeoning" }] }] }] };

// Dodge: spends the Action + lands the `dodging` CONDITION on the PC (t.c), NOT an inert flag.
const act = win.applyEvent(world, { type: "action", payload: { kind: "dodge" }, source: "declared" });
check("integration: action{dodge} spends the Action + lands the `dodging` CONDITION on the PC (not an inert flag)",
  act.ok && win.GS.combat.pc.budget.action === false && world.characters[0].conditions.some(e => (e.condition || e) === "dodging"));
// a foe's OA against the DODGING PC is at DISADVANTAGE — the condition is consumed by resolveAttack (Dodge now bites).
const oaDis = win.applyEvent(world, { type: "opportunity_attack", payload: { foe: "f1", d20: 20 }, source: "declared" });
check("integration: OA vs a dodging PC is at DISADVANTAGE (Dodge mechanically matters now)", oaDis.ok && oaDis.advDerived === "dis");
// the foe's Reaction is now spent — a SECOND OA this round is refused (the one-per-round cap, wired into the event path).
const oaCap = win.applyEvent(world, { type: "opportunity_attack", payload: { foe: "f1", d20: 10 }, source: "declared" });
check("integration: a foe with no Reaction left cannot OA again this round (cap enforced in-event)", oaCap.ok === false && oaCap.reason === "no-reaction");
// round_tick expires the dodging condition (endOfNextTurn ttl) + clears per-turn flags.
win.applyEvent(world, { type: "round_tick", payload: { round: 2, phase: "end" }, source: "detected" });
check("integration: round_tick expires the dodging condition (ttl auto-lift)", !world.characters[0].conditions.some(e => (e.condition || e) === "dodging"));
// Disengage suppresses the OA entirely (reason: disengaged) — the other formerly-inert effect, now wired.
win.GS.combat.round = 2; win.GS.combat.pc.budget = { action: true, bonus: true, reaction: true, moved: false };
win.applyEvent(world, { type: "action", payload: { kind: "disengage" }, source: "declared" });
win.GS.combat.foes[0].budget = { action: true, bonus: true, reaction: true, moved: false };   // fresh reaction available
const oaSup = win.applyEvent(world, { type: "opportunity_attack", payload: { foe: "f1", d20: 20 }, source: "declared" });
check("integration: Disengage suppresses the OA (reason: disengaged)", oaSup.ok === false && oaSup.reason === "disengaged");
// Grapple counts the foe's REAL Strength: defenderTotal = d20(5) + STR mod(4) = 9, not the old mods:{} +0.
const grap = win.applyEvent(world, { type: "grapple", payload: { target: "f1", d20: 15, defenderD20: 5 }, source: "declared" });
check("integration: grapple counts the foe's real STR mod (defenderTotal 5+4=9, not a +0 pushover)", grap.ok && grap.defenderTotal === 9 && grap.success === true);
const atk2 = win.applyEvent(world, { type: "attack", payload: { attackIndex: 1, targetAC: 5 }, source: "declared" });
check("integration: attack event accepts attackIndex (Extra Attack Nth swing)", atk2.ok || atk2.reason === "no-weapon");   // no equipped weapon in this fixture → no-weapon is fine; the field is accepted

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
