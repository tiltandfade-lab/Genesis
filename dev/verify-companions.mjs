/* verify-companions.mjs — headless test for COMPANIONS (docs/COMPANIONS.md,
   BATCH2-GUARDRAILS H1: companions ≥10/0):

   Enumerated assertions (spec §5 + BATCH2-GUARDRAILS H3 "companions"):
   1. hire requires a ROLLED codex NPC — a freehand (authored-provenance) hire is refused.
      MUTATION check: patch codexIsMechanical to always return true, harness fails, then RESTORE.
   2. a rolled hire succeeds and mints w.companions.hirelings[].
   3. wages charge on the montage/downtime rest path; unpaid compounds loyalty (a second
      consecutive unpaid charge costs an extra point, not just one).
   4. loyalty 0 fires desertion: an npc-life ledger entry + a grievance codex thread; the
      hireling leaves the roster.
   5. loyalty modifies morale (companionMoraleRoll folds loyalty-3 into the WIS-save bonus).
   6. loyalty 6 grants ONE heroic-stand auto-pass, then it's gone until loyalty dips and climbs
      back to 6.
   7. the sidekick slot is SINGULAR — promoting a second sidekick while one is held is refused.
   8. promotion refuses a codex NPC above CR 1/2 (SIDEKICK_CR_MAX).
   9. the sidekick levels with the PC (companionSidekickLevelWith), clamped to LEVEL_CEILING.
   10. sidekick death mints a grief thread and clears the slot — no rebirth (no bardo entry).
   11. ally chips (combatPanel / cmAllyChip): the sidekick's HP renders, a hireling's raw loyalty
       NUMBER never does (only the coarse word) — greps the rendered HTML.
   12. regression: full existing sweep stays green (asserted by the orchestrator's separate run;
       this file only asserts its own scope, per convention — see gateSummary in the final report).

   Loads EVERY module in manifest load order into one jsdom global scope — the "const-via-eval"
   pattern (CLAUDE.md "headless test").
   Run: node dev/verify-companions.mjs   (from repo root) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshDom(){
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + moduleSrc);
  return dom.window;
}

let win = freshDom();

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function freshWorld(win, opts={}){
  const w = {
    id: "w-comp", name: "Test World",
    characters: [{ id:"pc1", status: "living", name: "Ren", headline: "a wanderer", spark: "a wanderer", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: opts.level||3,
               gold: opts.gold!=null?opts.gold:100, hp: 20, hpCur: 20, ac: 15,
               profBonus: 2, scores: {}, mods: {}, saveProfs: [], skillProfs: [], inventory: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 10, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null, factions: [],
    revealed: { powers: 1, map: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(w, "Camp", "Place");
  w.currentNodeId = originId;
  w.startNodeId = originId;
  win.U.worlds[w.id] = w;
  win.U.activeWorldId = w.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null };
  win.GS.combat = null;
  return { w, originId };
}

function mintNpc(win, w, name, provenance){
  return win.codexAdd(w, { kind: "npc", name, provenance: provenance||"rolled", status: { at: w.currentNodeId } });
}

// ── module presence ──────────────────────────────────────────────────────────
const need = ["companionsOf","hireCompanion","dismissCompanion","companionChargeWages",
  "companionAdjustLoyalty","companionDesert","companionHeroicStandAvailable","companionConsumeHeroicStand",
  "companionMoraleRoll","promoteSidekick","companionSidekickLevelWith","companionSidekickDies",
  "companionSidekickLeaves","companionPartyStrip"];
for(const n of need) check(`global ${n}`, typeof win[n] !== "undefined");
// top-level `const`s (SIDEKICK_CR_MAX, SIDEKICK_CLASSES) don't attach to `window` in classic-script
// jsdom eval, and a SECOND win.eval(...) call opens a fresh top-level scope that can't see them
// either (the same gotcha CLASS_PROGRESSION hits — dev/verify-levelup.mjs's convention) — assert
// them THROUGH the functions (defined inside the ORIGINAL eval block) that close over them.
check("data.sidekick-classes loaded for all 3 classes (via sidekickClassRow)",
  ["Expert","Spellcaster","Warrior"].every(cls => { const row = win.sidekickClassRow({ className: cls, level: 1 }); return !!row && typeof row.pb === "number"; }));

// ── 1. hire requires a ROLLED codex NPC — freehand refused ──
{
  const { w } = freshWorld(win);
  const freehand = mintNpc(win, w, "Freehand Guy", "authored");
  const r = win.hireCompanion(w, { codexId: freehand.id, role: "porter" });
  check("freehand (authored) NPC refused as a hireling", r.ok === false && r.reason === "not-rolled", JSON.stringify(r));
}

// ── MUTATION: patch codexIsMechanical to always pass — must let the freehand hire through, then RESTORE ──
{
  const { w } = freshWorld(win);
  const freehand = mintNpc(win, w, "Freehand Guy Two", "authored");
  const original = win.codexIsMechanical;
  win.codexIsMechanical = function(){ return true; };
  const r = win.hireCompanion(w, { codexId: freehand.id, role: "porter" });
  const mutatedBroke = r.ok === true;
  console.log("  [MUTATION shown RED]", mutatedBroke ? "✓ removing the rolled-NPC gate DOES let a freehand hire through (as expected of the broken build)" : "✗ mutation had no effect — test is not exercising the gate");
  check("MUTATION CONFIRMED: bypassing codexIsMechanical lets a freehand hire succeed", mutatedBroke);
  win.codexIsMechanical = original;   // restore
}
win = freshDom();   // clean slate — the eval-level mutation above only touched a window property, but stay safe

// ── 2. a rolled hire succeeds and mints w.companions.hirelings[] ──
{
  const { w } = freshWorld(win);
  const rolled = mintNpc(win, w, "Rolled Guy", "rolled");
  const r = win.hireCompanion(w, { codexId: rolled.id, role: "blade" });
  check("rolled hire succeeds", r.ok === true, JSON.stringify(r));
  check("hireling minted with the SRD wage for its role (blade = 2gp/day)", r.hireling && r.hireling.wage === 2);
  check("hireling starts at loyalty 3 (LOYALTY_START, no renown bias in this fixture)", r.hireling && r.hireling.loyalty === 3);
  check("w.companions.hirelings holds exactly one entry", win.companionsOf(w).hirelings.length === 1);
}

// ── 3. wages charge on the rest path; unpaid compounds loyalty ──
{
  const { w } = freshWorld(win, { gold: 0 });
  const rolled = mintNpc(win, w, "Wage Earner", "rolled");
  win.hireCompanion(w, { codexId: rolled.id, role: "skilled" });   // 2gp/day, PC has 0 gold
  const pc = w.characters[0];
  win.companionChargeWages(w, 1, pc);
  const h1 = win.companionsOf(w).hirelings[0];
  check("first unpaid charge drops loyalty by 1 (3 -> 2)", h1 && h1.loyalty === 2, JSON.stringify(h1));
  win.companionChargeWages(w, 1, pc);
  // second consecutive unpaid charge compounds: -1 base + -1 compounding = -2 (2 -> 0) -> desertion fires
  check("second consecutive unpaid charge compounds to desertion (loyalty hits 0)", win.companionsOf(w).hirelings.length === 0);
}

// ── 4. desertion mints an npc-life ledger entry + a grievance codex thread ──
{
  const { w } = freshWorld(win);
  const rolled = mintNpc(win, w, "Deserter", "rolled");
  const hireR = win.hireCompanion(w, { codexId: rolled.id, role: "porter" });
  const h = win.companionsOf(w).hirelings[0];
  win.companionAdjustLoyalty(w, h, -3, "led into three separate disasters");
  check("loyalty 0 removes the hireling from the roster", win.companionsOf(w).hirelings.length === 0);
  check("desertion logs an npc-life ledger entry", w.ledger.some(e => e.type === "npc-life" && e.data && e.data.kind === "desertion"));
  const grievance = Object.values(win.codexOf(w).records).find(r => r.kind === "thread" && /grievance/.test(r.name));
  check("a grievance codex thread is minted, linked to the deserter", !!grievance && win.codexLinksOf(w, grievance.id).some(l => l.to === rolled.id || l.from === rolled.id));
}

// ── 5. loyalty modifies morale ──
{
  const { w } = freshWorld(win);
  const rolled = mintNpc(win, w, "Nervy Guard", "rolled");
  win.hireCompanion(w, { codexId: rolled.id, role: "blade" });
  const h = win.companionsOf(w).hirelings[0];
  const statBase = { abilities: { wis: { mod: 0 } }, saves: {}, creatureType: null };
  h.loyalty = 0;
  const lowLoyaltyRoll = win.companionMoraleRoll(w, h, statBase, { d20: 10 });
  h.loyalty = 6; win.companionRearmHeroicStand ? null : null;
  h.heroicStandUsed = true;   // isolate the DC-shift test from the heroic-stand short-circuit
  const highLoyaltyRoll = win.companionMoraleRoll(w, h, statBase, { d20: 10 });
  check("low loyalty (0) fails a morale check that high loyalty (6) would pass, same d20",
    lowLoyaltyRoll.held === false && highLoyaltyRoll.held === true,
    JSON.stringify({ lowLoyaltyRoll, highLoyaltyRoll }));
}

// ── 6. loyalty 6 grants ONE heroic-stand pass, then it's gone ──
{
  const { w } = freshWorld(win);
  const rolled = mintNpc(win, w, "Steady Hand", "rolled");
  win.hireCompanion(w, { codexId: rolled.id, role: "blade" });
  const h = win.companionsOf(w).hirelings[0];
  h.loyalty = 6;
  check("heroic stand available at loyalty 6", win.companionHeroicStandAvailable(h) === true);
  const consumed = win.companionConsumeHeroicStand(h);
  check("consuming it succeeds once", consumed === true);
  check("it is NOT available again immediately after consuming", win.companionHeroicStandAvailable(h) === false);
  h.loyalty = 3; win.companionRearmHeroicStand(h);
  h.loyalty = 6;
  check("dropping below 6 then climbing back re-arms the pass", win.companionHeroicStandAvailable(h) === true);
}

// ── 7. the sidekick slot is SINGULAR ──
{
  const { w } = freshWorld(win);
  const first = mintNpc(win, w, "First Sidekick", "rolled");
  const r1 = win.promoteSidekick(w, { codexId: first.id, className: "Warrior", cr: 0.25 });
  check("first promotion succeeds", r1.ok === true, JSON.stringify(r1));
  const second = mintNpc(win, w, "Second Sidekick", "rolled");
  const r2 = win.promoteSidekick(w, { codexId: second.id, className: "Expert", cr: 0.25 });
  check("a second promotion is refused while the slot is held", r2.ok === false && r2.reason === "slot-occupied", JSON.stringify(r2));
}

// ── 8. promotion refuses CR above 1/2 ──
{
  const { w } = freshWorld(win);
  const tooBig = mintNpc(win, w, "Too Big", "rolled");
  const r = win.promoteSidekick(w, { codexId: tooBig.id, className: "Warrior", cr: 2 });
  check("a CR-2 npc is refused promotion (SIDEKICK_CR_MAX=0.5)", r.ok === false && r.reason === "cr-too-high", JSON.stringify(r));
}

// ── 9. the sidekick levels with the PC, clamped to LEVEL_CEILING ──
{
  const { w } = freshWorld(win, { level: 3 });
  const npc = mintNpc(win, w, "Growing Sidekick", "rolled");
  win.promoteSidekick(w, { codexId: npc.id, className: "Expert", cr: 0.25 });
  check("sidekick starts at the PC's level (3)", win.companionsOf(w).sidekick.level === 3);
  win.companionSidekickLevelWith(w, 7);
  check("sidekick levels up to 7 with the PC", win.companionsOf(w).sidekick.level === 7);
  win.companionSidekickLevelWith(w, 99);
  check("sidekick level clamps at LEVEL_CEILING even if asked to exceed it",
    win.companionsOf(w).sidekick.level === win.LEVEL_CEILING ||
    win.eval("(function(){return typeof LEVEL_CEILING!=='undefined'?LEVEL_CEILING:10;})()") === win.companionsOf(w).sidekick.level);
}

// ── 10. sidekick death mints a grief thread, clears the slot, no rebirth ──
{
  const { w } = freshWorld(win);
  const npc = mintNpc(win, w, "Doomed Sidekick", "rolled");
  win.promoteSidekick(w, { codexId: npc.id, className: "Warrior", cr: 0.25 });
  const codexId = win.companionsOf(w).sidekickId;
  win.companionSidekickDies(w, "a bad roll in the dark");
  check("the sidekick slot clears on death", win.companionsOf(w).sidekickId === null);
  check("the codex record persists with condition:dead (no deletion)", win.codexGet(w, codexId).status.condition === "dead");
  const grief = Object.values(win.codexOf(w).records).find(r => r.kind === "thread" && /grief/.test(r.name));
  check("a grief thread is minted, linked to the deceased", !!grief && win.codexLinksOf(w, grief.id).some(l => l.to === codexId || l.from === codexId));
  check("no bardo/rebirth entry exists for the sidekick (PC-only rebirth)", !w.bardo || !JSON.stringify(w.bardo).includes(codexId));
}

// ── 11. ally chips: sidekick HP renders, hireling loyalty NUMBER never does ──
{
  const { w } = freshWorld(win);
  const skNpc = mintNpc(win, w, "Chip Sidekick", "rolled");
  win.promoteSidekick(w, { codexId: skNpc.id, className: "Warrior", cr: 0.25 });
  const hireNpc = mintNpc(win, w, "Chip Hireling", "rolled");
  win.hireCompanion(w, { codexId: hireNpc.id, role: "blade" });
  const h = win.companionsOf(w).hirelings[0];
  h.loyalty = 5;   // a distinctive, greppable number that must NEVER appear in the rendered chip
  win.GS.combat = { active: true, round: 1, side: "pc", first: "pc",
    pc: { band: "melee" }, foes: [], scene: {} };
  const html = win.combatPanel(w, w.characters[0]);
  check("the sidekick's ally chip renders", /Chip Sidekick/.test(html));
  check("the sidekick's HP numbers render (player-side numbers are open)", /ss-hp-val/.test(html) && /\d+<\/b>\s*\/\s*\d+/.test(html.split("ally sidekick")[1] || ""));
  check("the hireling's ally chip renders", /Chip Hireling/.test(html));
  // FLAKE FIX (2026-07-03): the old check swept the WHOLE panel for \b5\b, but the sidekick's
  // OPEN HP numbers legitimately render digits — a rolled HP of 5 false-failed ~1 in 5 runs.
  // The leak this guards against would appear inside the HIRELING'S OWN chip, so scope there.
  const hirelingChip = (html.split("Chip Hireling")[1] || "").split("cmb-chip")[0];
  check("the hireling's raw loyalty NUMBER (5) never appears in its own chip", hirelingChip.length > 0 && !new RegExp("\\b5\\b").test(hirelingChip));
  check("the hireling shows the coarse loyalty WORD instead", /steady|true|low/.test(html));
}

console.log(`\ncompanions: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
