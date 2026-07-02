/* Verify the combat engine (docs/COMBAT.md) — full-app jsdom load (real modules in manifest order).
   Asserts: the bestiary index is wired (resolveCreature returns real stats); the threat→stat-block
   resolver (exact name → CR-band fallback → quick-stats); standardized CR→XP + objective-gated pricing;
   side-based initiative; attack/save/damage math (pre-rolled d20 honored, nat-1 miss / nat-20 crit /
   cover / crit-doubles-dice / resist-immune-vuln); range-band movement; combatStart / combatFromEncounter /
   combatOutcomeEvents; and the integration surface through applyEvent — kill{factionId} → faction-clock
   escalation, encounter_resolved → CR-priced XP, a monster kill → no escalation.

   Run:  node dev/verify-combat.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── globals present ────────────────────────────────────────────────────────────
for (const f of ["resolveCreature","rollInitiative","resolveAttack","resolveSave","applyDamage","moveBand",
                 "combatStart","combatFromEncounter","combatOutcomeEvents","crXp"])
  check(`global ${f}`, typeof win[f] === "function");

// ── A. the bestiary index is WIRED (creature ≠ dead string) ─────────────────────
const bat = win.resolveCreature("Bat");
check("resolveCreature('Bat') → real stats (AC 12, HP 1, CR 0)", bat && bat.ac === 12 && bat.maxHp === 1 && bat.cr === 0, JSON.stringify(bat && {ac:bat.ac,hp:bat.maxHp,cr:bat.cr}));
const bas = win.resolveCreature("Basilisk");
check("resolveCreature('Basilisk') → AC 15, HP 52, CR 3, statId set", bas && bas.ac === 15 && bas.maxHp === 52 && bas.cr === 3 && bas.statId === "basilisk");
const bite = (bas.actions || []).find((a) => /bite/i.test(a.name || ""));
check("Basilisk Bite parsed: +5 to hit, piercing+poison damage", bite && bite.atk === 5 && (bite.dmg || []).length === 2 && bite.dmg.some((d) => d.type === "poison"), JSON.stringify(bite && {atk:bite.atk,dmg:bite.dmg}));
check("Basilisk carries its custom d-tables (sacred, verbatim)", (bas.customTables || []).length >= 1 && /\|/.test((bas.customTables[0].rows || [])[0] || ""));

// ── B. threat→stat-block resolution: exact → CR-band fallback → quick-stats ──────
const byBand = win.resolveCreature("Some Made-Up Warlord", { cr: 1, role: "leader" });
check("unknown name + cr → CR-band fallback yields a REAL stat block", byBand && byBand.statId && byBand.cr === 1, JSON.stringify(byBand && {id:byBand.statId,cr:byBand.cr}));
const quick = win.resolveCreature("Nameless Sellsword Xyzzy", {});      // no cr, no match → quick-stats
check("unknown name + no cr → quick-stats fallback (statId null, flagged)", quick && quick.statId === null && quick.quickStats === true && quick.ac > 0 && quick.maxHp > 0);

// ── C. standardized CR→XP + objective-gated pricing ─────────────────────────────
check("crXp: 0→10, 1/4→50, 3→700, 5→1800, 12→8400",
  win.crXp(0) === 10 && win.crXp("1/4") === 50 && win.crXp(3) === 700 && win.crXp(5) === 1800 && win.crXp(12) === 8400);
// ADVANCEMENT-RETUNE.md §0/§1 (2026-07-02): encounter_resolved is UN-GATED (every real fight pays);
// the old objective GATE is now a ×XP_TUNE.objBonus (1.25) BONUS on top of the real foe CR-XP.
check("encounter_resolved prices from real foe CR, objective-tied applies the ×1.25 bonus (3+1 → 900×1.25 → 1125)",
  win.xpForEvent("encounter_resolved", { objectiveRef: "front-x", foes: [{ cr: 3 }, { cr: 1 }] }, 5) === 1125);
check("encounter_resolved with NO objective still pays the real foe CR-XP (un-gated, anti-grind is now the decay guard)",
  win.xpForEvent("encounter_resolved", { foes: [{ cr: 3 }] }, 5) === 700);

// ── D. side-based initiative (ties → PC) ────────────────────────────────────────
check("initiative: PC side wins (15 vs 3)", win.rollInitiative(5, 0, 10, 1).first === "pc");
check("initiative: enemy side wins (3 vs 15)", win.rollInitiative(0, 5, 1, 10).first === "enemy");
check("initiative: tie → PC (solo bias)", win.rollInitiative(0, 0, 10, 10).first === "pc");

// ── E. attack math (supplied d20 → deterministic) ───────────────────────────────
check("attack: nat 1 auto-misses even with a huge bonus",
  win.resolveAttack({ d20: 1, atkBonus: 100, targetAC: 5 }).hit === false);
const crit = win.resolveAttack({ d20: 20, atkBonus: -100, targetAC: 99, dmg: [{ n: 0, die: 0, bonus: 4 }] });
check("attack: nat 20 crits + hits past any AC", crit.crit === true && crit.hit === true && crit.damage === 4);
check("attack: threshold — total 15 vs AC 15 hits (flat 7 dmg)",
  (() => { const r = win.resolveAttack({ d20: 10, atkBonus: 5, targetAC: 15, dmg: [{ n: 0, die: 0, bonus: 7 }] }); return r.hit && r.damage === 7; })());
check("attack: total 14 vs AC 15 misses", win.resolveAttack({ d20: 9, atkBonus: 5, targetAC: 15 }).hit === false);
check("attack: half cover adds +2 AC (15 vs 14+2 → miss)",
  win.resolveAttack({ d20: 13, atkBonus: 2, targetAC: 14, cover: "half" }).hit === false);
check("attack: full cover can't be targeted", win.resolveAttack({ d20: 20, cover: "full" }).fullCover === true);
// crit doubles the DICE (not the flat bonus) — proven deterministically with d1 dice (rollDie(1)≡1)
const ncrit = win.resolveAttack({ d20: 19, atkBonus: 50, targetAC: 5, dmg: [{ n: 4, die: 1, bonus: 2 }] });
const ycrit = win.resolveAttack({ d20: 20, atkBonus: 0, targetAC: 5, dmg: [{ n: 4, die: 1, bonus: 2 }] });
check("attack: crit doubles dice (4d1+2=6 → 8d1+2=10), flat bonus unchanged", ncrit.damage === 6 && ycrit.damage === 10, `${ncrit.damage}/${ycrit.damage}`);

// ── F. saves ────────────────────────────────────────────────────────────────────
check("save: 10+3 ≥ DC 12 succeeds", win.resolveSave({ d20: 10, saveMod: 3, dc: 12 }).success === true);
check("save: 2+0 < DC 12 fails", win.resolveSave({ d20: 2, saveMod: 0, dc: 12 }).success === false);

// ── G. applyDamage: resist halves, immune zeroes, vuln doubles, 0 HP → down ─────
const dummy = { hp: 10, maxHp: 10, resist: ["fire"], immune: ["poison"], vuln: ["cold"] };
check("damage: resist halves (6 fire → 3, hp 7)", win.applyDamage(dummy, 6, "fire").applied === 3 && dummy.hp === 7);
check("damage: immune zeroes (10 poison → 0, hp 7)", win.applyDamage(dummy, 10, "poison").applied === 0 && dummy.hp === 7);
check("damage: vuln doubles (2 cold → 4, hp 3)", win.applyDamage(dummy, 2, "cold").applied === 4 && dummy.hp === 3);
const killd = win.applyDamage(dummy, 5, "slashing");
check("damage: HP clamps to 0 and sets down", dummy.hp === 0 && killd.down === true);

// ── H. range-band movement (clamped Melee↔Out) ──────────────────────────────────
const mover = { band: "near" };
check("move: closer → melee", win.moveBand(mover, "closer") === "melee");
check("move: farther → near", win.moveBand(mover, "farther") === "near");
mover.band = "far";
check("move: dash closer moves two bands (far → melee)", win.moveBand(mover, "closer", true) === "melee");
mover.band = "near";
check("move: dash farther + clamp at 'out'", win.moveBand(mover, "farther", true) === "out" && win.moveBand(mover, "farther") === "out");

// ── I. combatStart builds the fight ─────────────────────────────────────────────
const fight = win.combatStart({ pc: { init: 5 }, foes: ["Bat", { name: "Basilisk" }], objectiveRef: "front-x", pcRoll: 10, foeRoll: 1 });
check("combatStart: active, round 1, 2 resolved foes, objective carried",
  fight.active && fight.round === 1 && fight.foes.length === 2 && fight.objectiveRef === "front-x");
check("combatStart: foes get fids + real HP (Basilisk 52)", fight.foes[0].fid === "f1" && fight.foes[1].name === "Basilisk" && fight.foes[1].hp === 52);
check("combatStart: side-based initiative resolved", fight.first === "pc" && fight.foes.every((f) => f.victimClass === "monster"));

// ── J. combatFromEncounter: walk encounter → resolved foes ───────────────────────
const enc = { isEnemy: true, creatures: [{ slot: "Low CR", creature: "Bat" }, { slot: "Boss CR", creature: "Basilisk" }] };
const efoes = win.combatFromEncounter(enc, { factionId: "raiders", victimClass: "hostile" });
check("combatFromEncounter: 2 foes, tagged faction + victimClass",
  efoes.length === 2 && efoes.every((f) => f.victimClass === "hostile" && f.factionId === "raiders") && efoes[1].ac === 15);

// ── K. combatOutcomeEvents: derive the EVENT-CONTRACT payloads ───────────────────
const finished = { objectiveRef: "front-x", method: "combat",
  foes: [{ cr: 3, victimClass: "monster", down: true, factionId: null }, { cr: 1, victimClass: "hostile", down: false, factionId: "raiders" }] };
const ev = win.combatOutcomeEvents(finished, { outcome: "won" });
check("outcomeEvents: encounter_resolved prices only DEFEATED foes (1 of 2 down) + objectiveRef",
  ev.encounter.type === "encounter_resolved" && ev.encounter.payload.foes.length === 1 && ev.encounter.payload.foes[0].cr === 3 && ev.encounter.payload.objectiveRef === "front-x");
check("outcomeEvents: one kill per DOWNED foe (1 of 2)", ev.kills.length === 1 && ev.kills[0].payload.victimClass === "monster");
// the surviving foe (down:false) banks NO XP — fleeing after one kill doesn't pay for foes that walked away
check("outcomeEvents: a surviving (fled) foe is NOT priced", ev.encounter.payload.foes.every((f) => f.cr !== 1));

// ── L. INTEGRATION through applyEvent (the real world surface) ───────────────────
const world = {
  id: "w-combat", name: "Combat Test", gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 360 },
  map: { nodes: {}, edges: [] }, currentNodeId: null, revealed: {}, dmlog: [], pressures: [],
  characters: [{ status: "living", name: "Hero", sheet: { class: "Fighter", level: 5, xp: 0, mods: {} } }],
  factions: [{ name: "Town Watch", clock: { filled: 0, size: 6 } }],
};
win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
win.applyEvent(world, { type: "kill", payload: { victimClass: "authority", factionId: "Town Watch" }, source: "declared" });
check("integration: kill{factionId} advances that faction's clock (0→1)", world.factions[0].clock.filled === 1, `now ${world.factions[0].clock.filled}`);
win.applyEvent(world, { type: "encounter_resolved", payload: { objectiveRef: "front-x", foes: [{ cr: 3, victimClass: "monster" }] }, source: "declared" });
// ADVANCEMENT-RETUNE.md §0: objectiveRef is now a ×1.25 BONUS on the real foe CR-XP (700 × 1.25 = 875)
check("integration: objective-tied encounter prices CR-XP × the objective bonus (CR3=700 × 1.25 → 875)", world.characters[0].sheet.xp === 875, `xp ${world.characters[0].sheet.xp}`);
const before = world.factions[0].clock.filled;
win.applyEvent(world, { type: "kill", payload: { victimClass: "monster" }, source: "declared" });
check("integration: a monster kill (no factionId) does NOT escalate", world.factions[0].clock.filled === before);
// a kill that FILLS the clock promotes to clock_fired ONCE (the agenda comes due); further kills don't re-fire
world.factions[0].clock.filled = world.factions[0].clock.size - 1;
const firedBefore = win.ledgerOf(world).filter((x) => x.type === "clock" && x.data && x.data.fired && x.data.factionId === "Town Watch").length;
win.applyEvent(world, { type: "kill", payload: { victimClass: "authority", factionId: "Town Watch" }, source: "declared" });
const firedAfter = win.ledgerOf(world).filter((x) => x.type === "clock" && x.data && x.data.fired && x.data.factionId === "Town Watch").length;
check("integration: kill that fills the clock emits clock_fired once (agenda due)", world.factions[0].clock.filled === world.factions[0].clock.size && firedAfter === firedBefore + 1);
win.applyEvent(world, { type: "kill", payload: { victimClass: "authority", factionId: "Town Watch" }, source: "declared" });
const firedAgain = win.ledgerOf(world).filter((x) => x.type === "clock" && x.data && x.data.fired && x.data.factionId === "Town Watch").length;
check("integration: a kill on an ALREADY-full clock does NOT re-fire clock_fired", firedAgain === firedAfter);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
