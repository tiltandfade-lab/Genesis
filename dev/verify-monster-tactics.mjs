/* Verify MONSTER TACTICS (docs/MONSTER-TACTICS.md) — full-app jsdom load (real modules in manifest
   order, same convention as dev/verify-combat.mjs / dev/verify-combat-tracker.mjs). Asserts the spec's
   §4 build-plan verification list + BATCH2-GUARDRAILS H1 gate (≥6/0):

     1. a custom-d10-table creature ALWAYS uses its table for proposeTactic (the anti-drift ladder's
        step 1 wins over the state-machine fallback) — MUTATION CHECK: break the ladder (skip step 1),
        run, confirm the harness's own assertion fails, restore.
     2. morale fires ONCE per trigger per foe (GS.combat.moraleFlags gates a re-fire); undead auto-pass
        (no roll, no disposition — §2, foe.creatureType via engine.combat cmFoeFrom's tags.type read).
     3. a FAILED morale check mechanically moves the foe's band/state (flee/rout-panic → moveBand
        toward "out" + foe.fled/foe.routed; surrender → foe.surrendering) — mechanical fact, not narration.
     4. autoplay refuses: a boss (CR > AUTOPLAY_CR_MAX), a custom-table creature (even at low CR), and a
        foe flagged dm.noAutoplay — accepts a plain CR<=1 foe with no custom table.
     5. proposals never render in the player-facing combat-panel DOM (structural: render.js never
        references proposeTactic/combatProposals; behavioral: attaching proposals to GS.combat and
        rendering the panel never leaks their rationale text into the DOM).
     6. regression: dev/verify-combat.mjs still passes 0 failed (the combat.js cmFoeFrom/cmResolveFoe/
        combatFromEncounter edits — creatureType + behavior threading — don't break the resolver).

   Run:  node dev/verify-monster-tactics.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
// top-level `const` (AUTOPLAY_CR_MAX/MORALE_DC/MORALE_MODS, CM_BANDS) doesn't land on window under
// win.eval — expose via thin accessor wrappers DEFINED IN THE SAME eval call (verify-combat-tracker.mjs's
// established pattern), so this harness can read them from Node without a second, disconnected eval.
const accessors = `
function __mtConsts(){ return {AUTOPLAY_CR_MAX:AUTOPLAY_CR_MAX, MORALE_DC:MORALE_DC, MORALE_MODS:MORALE_MODS}; }
function __mtFoe(id, over){ var e=BESTIARY[id]; var f=cmFoeFrom(e); return Object.assign(f, over||{}); }
function __mtHasCustom(id){ var e=BESTIARY[id]; return !!(e.customTables && e.customTables.length); }
// BESTIARY is a top-level const — invisible to a SEPARATE win.eval() call (jsdom scoping gotcha, per
// verify-combat-tracker.mjs's __cmBands precedent). Route every by-type/by-name bestiary lookup this
// harness needs through helpers defined HERE (in the same eval as the source), so later per-section
// win.eval() calls never touch BESTIARY directly.
function __mtFoeByType(type, noCustomOnly, over){
  var e=Object.values(BESTIARY).find(function(x){ return x.tags && x.tags.type===type && (!noCustomOnly || !x.customTables || !x.customTables.length); });
  if(!e) return null;
  var f=cmFoeFrom(e); return Object.assign(f, over||{});
}
function __mtBestiaryName(type, noCustomOnly){
  var e=Object.values(BESTIARY).find(function(x){ return x.tags && x.tags.type===type && (!noCustomOnly || !x.customTables || !x.customTables.length); });
  return e ? e.name : null;
}
`;
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

function makeWorld(win, sheetOverrides = {}) {
  const world = {
    id: "w-mttest", name: "The Monster Tactics Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting tactics" } },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: Object.assign({
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16 }, mods: { str: 4, con: 3 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [], equipped: {}, pools: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined;
  return world;
}

function startFight(win, world, foeSpecs, opts = {}) {
  const combat = win.combatStart(Object.assign({ pc: { init: 2 }, foes: foeSpecs, pcRoll: 15, foeRoll: 3 }, opts));
  win.GS.combat = combat;
  return combat;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 0. globals present
// ============================================================================
{
  const win = freshWin();
  for (const f of ["proposeTactic","combatProposals","moraleTrigger","rollMorale","moraleAlreadyFired",
                   "markMoraleFired","moraleDCFor","autoplayEligible","resolveFoeTurn"])
    check(`global ${f}`, typeof win[f] === "function");
  const consts = win.__mtConsts();
  check("AUTOPLAY_CR_MAX is 1 (spec §3 init)", consts.AUTOPLAY_CR_MAX === 1, consts.AUTOPLAY_CR_MAX);
  check("MORALE_DC is 10 (spec §2 init)", consts.MORALE_DC === 10, consts.MORALE_DC);
}

// ============================================================================
// 1. §1 ladder — custom-d10 table ALWAYS wins, even with behavior/state-machine context present
// ============================================================================
{
  const win = freshWin();
  check("Animated Armor carries a custom table (fixture sanity)", win.__mtHasCustom("animated-armor"));
  win.eval(`var foe1=__mtFoe("animated-armor",{behavior:"a rolled wilderness behavior hook"}); var combat1={foes:[foe1]}; var prop1=proposeTactic(foe1, combat1);`);
  const prop1 = JSON.parse(win.eval("JSON.stringify(prop1)"));
  check("1a. a custom-table creature's proposeTactic source is 'custom-table'", prop1.source === "custom-table", JSON.stringify(prop1));
  check("1b. the rationale IS the rolled row text (non-empty, not the behavior hook)", !!prop1.rationale && prop1.rationale !== "a rolled wilderness behavior hook", prop1.rationale);
  check("1c. step 1 wins over step 2 (foe.behavior present but ignored)", prop1.source !== "behavior");

  // step 2: a foe with NO custom table but a behavior hook uses it.
  win.eval(`var foe2=__mtFoe("bandit",{behavior:"circles at range, feints"}); var combat2={foes:[foe2]}; var prop2=proposeTactic(foe2, combat2);`);
  const prop2 = JSON.parse(win.eval("JSON.stringify(prop2)"));
  check("1d. no custom table + a behavior hook -> source 'behavior', rationale = the hook text",
    prop2.source === "behavior" && prop2.rationale === "circles at range, feints", JSON.stringify(prop2));

  // step 3: neither custom table nor behavior -> the state-machine fallback (default: press).
  win.eval(`var foe3=__mtFoe("bandit"); var combat3={foes:[foe3]}; var prop3=proposeTactic(foe3, combat3);`);
  const prop3 = JSON.parse(win.eval("JSON.stringify(prop3)"));
  check("1e. neither table nor behavior -> source 'state-machine'", prop3.source === "state-machine", JSON.stringify(prop3));
  check("1f. an undamaged solo foe with no special role presses the attack (state-machine default)", prop3.action === "press", JSON.stringify(prop3));

  // combatProposals maps every LIVE foe -> its proposal, skips a downed foe.
  win.eval(`var foeA=__mtFoe("bandit"); var foeB=__mtFoe("bat",{down:true}); foeA.fid="f1"; foeB.fid="f2"; var combatAB={foes:[foeA,foeB]}; var proposals=combatProposals(combatAB);`);
  const proposals = JSON.parse(win.eval("JSON.stringify(proposals)"));
  check("1g. combatProposals returns one entry per LIVE foe (down foe excluded)", proposals.length === 1 && proposals[0].fid === "f1", JSON.stringify(proposals));

  // MUTATION CHECK: break the ladder (comment out step 1) — the harness's OWN assertion must fire RED.
  {
    const original = read("src/engine/monster-tactics.js");
    const marker = `  // 1. the creature's own custom d10 table — the row IS the tactic.
  const custom = ctRollCustomTable(foe);
  if(custom) return {`;
    const mutated = `  // 1. the creature's own custom d10 table — the row IS the tactic.
  const custom = null; // MUTATION: ladder step 1 disabled
  if(custom) return {`;
    if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(ladder-step1): guard text not found verbatim — spec drifted?"); }
    else {
      const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/engine/monster-tactics.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n") + "\n;\n" + accessors;
      const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
      const mwin = dom.window; mwin.eval(harness + "\n" + mutSrc);
      mwin.eval(`var mfoe=__mtFoe("animated-armor"); var mcombat={foes:[mfoe]}; var mprop=proposeTactic(mfoe, mcombat);`);
      const mprop = JSON.parse(mwin.eval("JSON.stringify(mprop)"));
      const nowFails = mprop.source !== "custom-table";
      check("MUTATION (shown RED then restored): disabling ladder step 1 makes a custom-table creature NOT use its table",
        nowFails, nowFails ? "confirmed RED under mutation, as expected — proposeTactic fell through to: " + mprop.source : "guard did not move — monster-tactics.js wiring may have changed");
    }
  }
}

// ============================================================================
// 2. §2 morale — fires ONCE per trigger per foe; undead auto-pass
// ============================================================================
{
  const win = freshWin();
  win.eval(`var foeU=__mtFoeByType("undead",false); foeU.fid="f1"; var combatU={foes:[foeU]};`);
  const undeadName = win.__mtBestiaryName("undead", false);
  check("2a. fixture: an undead creature is found in the bestiary", !!undeadName, undeadName);
  win.eval(`var moraleU=rollMorale(foeU, {});`);
  const moraleU = JSON.parse(win.eval("JSON.stringify(moraleU)"));
  check("2b. an undead foe auto-passes morale (no roll, held=true)", moraleU.autoPass === true && moraleU.held === true, JSON.stringify(moraleU));
  check("2c. auto-pass never rolls a d20 (natural is null)", moraleU.natural === null, JSON.stringify(moraleU));

  // once-per-fight-per-trigger memory
  win.eval(`var flags={}; var t1=moraleAlreadyFired(flags,"f1","leader-down"); flags=markMoraleFired(flags,"f1","leader-down"); var t2=moraleAlreadyFired(flags,"f1","leader-down"); var t3=moraleAlreadyFired(flags,"f1","side-bloodied");`);
  check("2d. a trigger not yet fired reads false", win.eval("t1") === false);
  check("2e. the SAME trigger for the SAME foe reads true after marking (once-per-fight)", win.eval("t2") === true);
  check("2f. a DIFFERENT trigger for the same foe is independent (not fired)", win.eval("t3") === false);

  // integration: the foe_morale event refuses a re-fire of the same trigger via GS.combat.moraleFlags
  const world = makeWorld(win);
  win.eval(`var bat1=__mtFoeByType("beast",true); bat1.fid="f1"; bat1.hp=Math.floor(bat1.maxHp/2)||1;`);
  win.GS.combat = { active: true, round: 1, foes: [win.eval("bat1")], pc: { band: "melee" }, moraleFlags: {} };
  const r1 = win.applyEvent(world, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 1 } });
  check("2g. foe_morale (first fire) resolves ok", r1.ok === true, JSON.stringify(r1));
  const r2 = win.applyEvent(world, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered" } });
  check("2h. foe_morale (SAME trigger, same foe, second call) refuses — already-fired", r2.ok === false && r2.reason === "already-fired", JSON.stringify(r2));
}

// ============================================================================
// 3. a FAILED morale check mechanically moves the foe band/state
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.eval(`var bat2=__mtFoeByType("beast",true); bat2.fid="f1"; bat2.band="melee";`);
  win.GS.combat = { active: true, round: 1, foes: [win.eval("bat2")], pc: { band: "melee" }, moraleFlags: {} };
  const before = win.GS.combat.foes[0].band;
  const r = win.applyEvent(world, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 2 } });   // d20=1 always fails; d6=2 -> flee
  check("3a. a forced-fail (d20=1) morale check breaks (held=false)", r.ok === true && r.held === false, JSON.stringify(r));
  check("3b. disposition 'flee' (d6=2) is reported", r.disposition === "flee", JSON.stringify(r));
  const after = win.GS.combat.foes[0].band;
  check("3c. a flee disposition MECHANICALLY moves the foe's band farther from melee", before === "melee" && after !== "melee", `${before} -> ${after}`);
  check("3d. the foe is marked fled (mechanical fact, not just narration)", win.GS.combat.foes[0].fled === true);

  // rout-panic (d6=6) also disengages + marks routed
  const win2 = freshWin(); const world2 = makeWorld(win2);
  win2.eval(`var bat3=__mtFoeByType("beast",true); bat3.fid="f1"; bat3.band="melee";`);
  win2.GS.combat = { active: true, round: 1, foes: [win2.eval("bat3")], pc: { band: "melee" }, moraleFlags: {} };
  win2.applyEvent(world2, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 6 } });
  check("3e. rout-panic (d6=6) marks the foe routed AND fled", win2.GS.combat.foes[0].routed === true && win2.GS.combat.foes[0].fled === true);

  // surrender (d6=4) does NOT move the band but marks surrendering (opens the parley door, doesn't auto-parley)
  const win3 = freshWin(); const world3 = makeWorld(win3);
  win3.eval(`var bat4=__mtFoeByType("beast",true); bat4.fid="f1"; bat4.band="melee";`);
  win3.GS.combat = { active: true, round: 1, foes: [win3.eval("bat4")], pc: { band: "melee" }, moraleFlags: {} };
  win3.applyEvent(world3, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 4 } });
  check("3f. surrender (d6=4) marks surrendering, band unchanged", win3.GS.combat.foes[0].surrendering === true && win3.GS.combat.foes[0].band === "melee");
}

// ============================================================================
// 4. §3 autoplay eligibility — refuses bosses/custom-table/noAutoplay; accepts plain trash
// ============================================================================
{
  const win = freshWin();
  win.eval(`
    var plain = __mtFoe("bandit");                                   // CR 0.125, no custom table, not leader
    var boss  = __mtFoe("basilisk");                                  // CR 3 > AUTOPLAY_CR_MAX
    var customLow = __mtFoe("animated-armor");                        // CR 1 (<=max) BUT carries a custom table
    var flagged = __mtFoe("bandit"); flagged.dm = {noAutoplay:true};  // DM escape hatch
    var leaderTagged = __mtFoe("bandit"); leaderTagged.isLeader = true;
  `);
  check("4a. a plain low-CR foe with no custom table is autoplay-eligible", win.autoplayEligible(win.eval("plain")) === true);
  check("4b. a boss (CR > AUTOPLAY_CR_MAX) is refused", win.autoplayEligible(win.eval("boss")) === false);
  check("4c. a custom-table creature is refused EVEN AT low CR (custom table always wins)", win.autoplayEligible(win.eval("customLow")) === false);
  check("4d. dm.noAutoplay refuses an otherwise-eligible foe", win.autoplayEligible(win.eval("flagged")) === false);
  check("4e. the encounter's named leader (isLeader) is refused", win.autoplayEligible(win.eval("leaderTagged")) === false);
  // a SEPARATE fixture for the downed check — win.eval("plain") returns a live reference into jsdom's
  // object graph, not a copy, so mutating it here would bleed `down:true` into the later foe_action
  // integration checks (4g-4i) that reuse the SAME `plain` var.
  win.eval(`var downedPlain = __mtFoe("bandit"); downedPlain.down = true;`);
  check("4f. a downed foe is never autoplay-eligible", win.autoplayEligible(win.eval("downedPlain")) === false);

  // integration: the foe_action event actually refuses a non-eligible foe and resolves an eligible one
  const world = makeWorld(win);
  win.eval(`plain.fid="f1"; boss.fid="f2";`);
  win.GS.combat = { active: true, round: 1, foes: [win.eval("plain"), win.eval("boss")], pc: { band: "melee" } };
  const rBoss = win.applyEvent(world, { type: "foe_action", payload: { foe: "f2" } });
  check("4g. foe_action on a non-eligible foe (boss) refuses", rBoss.ok === false && rBoss.reason === "not-autoplay-eligible", JSON.stringify(rBoss));
  const rPlain = win.applyEvent(world, { type: "foe_action", payload: { foe: "f1" } });
  check("4h. foe_action on an eligible foe resolves an open-rolled attack", rPlain.ok === true && !!rPlain.attack, JSON.stringify(rPlain));
  check("4i. the resolved attack carries the SAME shape as a player-facing resolveAttack result (natural/total/hit)", rPlain.attack && typeof rPlain.attack.natural === "number" && typeof rPlain.attack.hit === "boolean", JSON.stringify(rPlain.attack));
}

// ============================================================================
// 5. proposals NEVER render in the player-facing combat-panel DOM
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.eval(`var pFoe=__mtFoe("bandit",{behavior:"a very distinctive unmistakable rationale string XYZZY-PROPOSAL"}); pFoe.fid="f1";`);
  const combat = win.combatStart({ pc: { init: 2 }, foes: [], pcRoll: 15, foeRoll: 3 });
  combat.foes = [win.eval("pFoe")];
  combat.proposals = win.combatProposals(combat);   // exactly the shape a future digest.combat.proposals[] would carry
  win.GS.combat = combat;
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const panelHtml = host.innerHTML;
  check("5a. structural: render.js never references proposeTactic/combatProposals",
    !/proposeTactic|combatProposals/.test(read("src/world/render.js")));
  check("5b. behavioral: the proposal's rationale text does not appear anywhere in the rendered DOM",
    !panelHtml.includes("XYZZY-PROPOSAL"), panelHtml.includes("XYZZY-PROPOSAL") ? "LEAKED" : "clean");
  check("5c. sanity: the combat panel DID render (auto-open, so this isn't a vacuous pass)",
    win.GS.gamePanel === "combat" && /cmb-lane-lbl|cmb-chip/.test(panelHtml), panelHtml.slice(0, 200));
}

// ============================================================================
// 6. regression — dev/verify-combat.mjs still passes 0 failed
// ============================================================================
{
  try {
    const out = execFileSync("node", [join(ROOT, "dev/verify-combat.mjs")], { encoding: "utf-8" });
    const m = /(\d+) passed, (\d+) failed/.exec(out);
    check("6a. dev/verify-combat.mjs passes 0 failed (creatureType/behavior threading is non-breaking)",
      !!m && m[2] === "0", m ? `${m[1]} passed, ${m[2]} failed` : "no summary line found");
  } catch (e) {
    check("6a. dev/verify-combat.mjs passes 0 failed", false, String(e).slice(0, 300));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
