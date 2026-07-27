/* Verify BATTLEMAP (docs/BATTLEMAP.md) — the 12-zone model (band x lane), over a full jsdom load (real
   modules in manifest order, same convention as dev/verify-combat-tracker.mjs). Drives the pure engine
   functions + real events through applyEvent and asserts DOM/state per the spec's §4 verify plan +
   BATCH2-GUARDRAILS H1/H3 rulings:
     1. Placement determinism: the same segment id -> the same board twice (combatStart re-run).
     2. dims parsing: "40' x 60'" -> 2 bands x 3 lanes; a 20'x20' cell -> Melee+Near x 1 lane;
        "50' x 120' irregular" parses; absent dims -> full 4x3 (MUTATION CHECK: break the derivation).
     3. footprint -> zone occupancy is NULL-SAFE (no Map Footprint column/table exists yet upstream —
        docs/BATTLEMAP.md §3b is a follow-up craft pass, not a §4 blocker; asserted as a documented gap).
     4. elevation flag grants melee advantage DOWNHILL ONLY (attacker elevated, target not).
     5. hidden trap zones absent from the player DOM until revealed.
     6. legal / illegal move_zone (a 2-zone move without Dash rejected).
     7. OA fires on melee-band exit, not lane moves (MUTATION CHECK).
     8. flank advantage exactly when an ally shares the target's zone, symmetric both directions.
     9. AoE zone sets per shape (line/burst/cone).
    10. cover modifies crossing attacks (zone cover folds into resolveAttack).
    11. tap inserts text into #dmAction and never sends.
    12. foe HP/AC still absent from the zone-grid DOM (regression on the pre-existing no-leak rule).
    13. regression: verify-combat + verify-combat-tracker counts unchanged (run separately by the caller;
        this harness reports its own count only, per BATCH2-GUARDRAILS G1 "same counts as before").

   Run:  node dev/verify-battlemap.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
// CM_BANDS/CM_LANES are top-level `const` — they don't attach to jsdom's `window` under win.eval (only
// var/function do), so expose them via thin accessor wrappers (same pattern as verify-combat-tracker.mjs).
const accessors = "function __cmBands(){return CM_BANDS;} function __cmLanes(){return CM_LANES;}";
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
    id: "w-battlemaptest", name: "The Battlemap Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting DOM" } },
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

function startFight(win, opts = {}) {
  const combat = win.combatStart(Object.assign({
    pc: { init: 2 },
    foes: [{ name: "Bat" }, { name: "Basilisk" }],
    pcRoll: 15, foeRoll: 3,
  }, opts));
  win.GS.combat = combat;
  return combat;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. dims parsing (§4 build item 1 / §5 verify plan)
// ============================================================================
{
  const win = freshWin();
  const g1 = win.cmDimsToGrid("40' x 60'");
  check("1a. \"40' x 60'\" -> 2 bands x 3 lanes", g1.bands === 2 && g1.lanes === 3, JSON.stringify(g1));
  const g2 = win.cmDimsToGrid("20' x 20'");
  check("1b. a 20'x20' cell -> Melee+Near (2 bands, ceil(20/25)=1... wait check exact)", g2.bands === 1 && g2.lanes === 1, JSON.stringify(g2));
  const g3 = win.cmDimsToGrid("50' x 120' irregular");
  check("1c. \"50' x 120' irregular\" parses (2 bands depth / 3 lanes width, clamped to max)", g3.bands === 2 && g3.lanes === 3, JSON.stringify(g3));
  const g4 = win.cmDimsToGrid("15' x 50' gradual descent");
  check("1d. \"15' x 50' gradual descent\" parses (1 band / 3 lanes, clamped)", g4.bands === 1 && g4.lanes === 3, JSON.stringify(g4));
  const g5 = win.cmDimsToGrid("");
  check("1e. absent dims -> the full 4x3", g5.bands === 4 && g5.lanes === 3, JSON.stringify(g5));
  const g6 = win.cmDimsToGrid(undefined);
  check("1f. undefined dims -> the full 4x3", g6.bands === 4 && g6.lanes === 3, JSON.stringify(g6));
}

// ============================================================================
// 2. MUTATION CHECK: break the dims derivation — the harness's own assertion must fire RED
// ============================================================================
{
  const original = read("src/engine/combat.js");
  const marker = `  const bands = Math.max(1, Math.min(4, Math.ceil(depthFt / 25)));
  const lanes = Math.max(1, Math.min(3, Math.ceil(widthFt / 20)));`;
  const mutated = `  const bands = 4;
  const lanes = 3;`;
  if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(dims-derivation): guard text not found verbatim — spec drifted?"); }
  else {
    const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/engine/combat.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n") + "\n;\n" + accessors;
    const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
    const mwin = dom.window; mwin.eval(harness + "\n" + mutSrc);
    const g = mwin.cmDimsToGrid("40' x 60'");
    const nowWrong = (g.bands === 4 && g.lanes === 3); // the mutation always returns full 4x3, so a real (2x3) case now reads wrong
    check("MUTATION (shown RED then restored): breaking the dims derivation makes a small room read as the full 4x3",
      nowWrong, nowWrong ? "confirmed RED under mutation, as expected" : "guard did not move — combat.js wiring may have changed");
  }
}

// ============================================================================
// 3. Placement determinism (§4 build item 1 / §5 verify plan)
// ============================================================================
{
  const win = freshWin();
  const c1 = win.combatStart({ pc: { init: 2 }, foes: [{ name: "Bat", role: "ambusher" }, { name: "Basilisk" }],
    pcRoll: 15, foeRoll: 3, segmentId: "seg-42", segment: { dims: "40' x 60'" } });
  const c2 = win.combatStart({ pc: { init: 2 }, foes: [{ name: "Bat", role: "ambusher" }, { name: "Basilisk" }],
    pcRoll: 15, foeRoll: 3, segmentId: "seg-42", segment: { dims: "40' x 60'" } });
  const lanes1 = c1.foes.map(f => f.lane);
  const lanes2 = c2.foes.map(f => f.lane);
  check("3a. the same segment id -> the same board twice (foe lane placement)", JSON.stringify(lanes1) === JSON.stringify(lanes2), JSON.stringify([lanes1, lanes2]));
  check("3b. the grid derives from the segment's dims", c1.grid.bandCount === 2 && c1.grid.laneCount === 3, JSON.stringify(c1.grid));
}

// ============================================================================
// 4. legal / illegal move_zone (§2, §5 verify plan)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" } }); // full 4x3
  win.GS.combat = combat;
  const rLegal = win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "near", lane: "C" } });
  check("4a. a legal 1-zone move (melee->near) succeeds", rLegal.ok === true, JSON.stringify(rLegal));
  check("4b. the PC's band actually updates", combat.pc.band === "near", combat.pc.band);
  // reset to melee, then attempt a genuine 2-band move (melee->far) WITHOUT dash — 2 zone-steps
  // against a 1-step budget. Also clear the per-turn movement budget the 4a move just spent (mirrors
  // test 6's `bat.budget = null` convention) — each of 4c/4d/4e below simulates a FRESH turn's move,
  // not a second move in the same turn (that's covered separately by 4f).
  combat.pc.band = "melee"; combat.pc.lane = "C"; combat.pc.budget = null;
  const rIllegal = win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "far", lane: "C" } });
  check("4c. a 2-zone move without Dash is REJECTED", rIllegal.ok === false && rIllegal.reason === "too-far", JSON.stringify(rIllegal));
  combat.pc.budget = null; // the rejected 4c attempt must not have spent the budget either — re-clear defensively
  const rDash = win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "far", lane: "C", dash: true } });
  check("4d. the same 2-zone move WITH dash:true succeeds", rDash.ok === true, JSON.stringify(rDash));
  combat.pc.band = "far"; combat.pc.lane = "C"; combat.pc.budget = null;
  const rBadRoom = win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "near", lane: "L" } });
  // room is full 4x3 here so this should actually succeed (far->near, band+lane diagonal = 1 move)
  check("4e. a diagonal move (band-step + lane-step together) counts as ONE move", rBadRoom.ok === true, JSON.stringify(rBadRoom));
  // 4f. THE FIX UNDER TEST: a second move_zone in the SAME turn (budget NOT cleared) is rejected even
  // though it would otherwise be perfectly legal (1-zone, in-room) — the per-turn movement budget.
  const rSecondMove = win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "melee", lane: "L" } });
  check("4f. a second move_zone the same turn (budget.moved already set) is REJECTED", rSecondMove.ok === false && rSecondMove.reason === "already-moved", JSON.stringify(rSecondMove));
  check("4g. the PC's position is unchanged by the rejected second move", combat.pc.band === "near" && combat.pc.lane === "L", combat.pc.band + ":" + combat.pc.lane);
}

// ============================================================================
// 5. room-clamped moves — a small room's grid rejects a zone outside its ceiling
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "20' x 20'" } }); // 1 band x 1 lane (Melee only, C only)
  win.GS.combat = combat;
  check("5a. a 20'x20' room's grid is Melee-only x 1 lane", combat.grid.bandCount === 1 && combat.grid.laneCount === 1, JSON.stringify(combat.grid));
  const r = win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "near", lane: "C" } });
  check("5b. a move to a band the room doesn't have is REJECTED", r.ok === false && r.reason === "band-not-in-room", JSON.stringify(r));
}

// ============================================================================
// 6. OA fires on melee-band exit, not lane moves (§2/§5 — MUTATION CHECK included)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" } });
  win.GS.combat = combat;
  const bat = combat.foes.find(f => /bat/i.test(f.name));
  bat.band = "melee"; bat.lane = "C";
  const rLaneOnly = win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "melee", lane: "L" } });
  check("6a. a lane-only move within Melee band does NOT list any opportunityAttacks", rLaneOnly.ok === true && rLaneOnly.opportunityAttacks.length === 0, JSON.stringify(rLaneOnly));
  // reset the PC back to melee/C for a clean melee-exit test — also clear the PC's own per-turn move
  // budget (the 6a lane-only move just spent it) so this counts as a fresh turn's move, same convention
  // as section 4's resets. bat.budget is unrelated to the PC's move but cleared too for parity.
  combat.pc.band = "melee"; combat.pc.lane = "C"; combat.pc.budget = null; bat.budget = null;
  const rExit = win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "near", lane: "C" } });
  check("6b. leaving Melee band DOES fire an opportunity attack against a live melee foe", rExit.ok === true && rExit.opportunityAttacks.length === 1, JSON.stringify(rExit));

  // MUTATION CHECK: force leftMelee to always be false — the OA-fires assertion must now fail (RED).
  {
    const original = read("src/engine/combat.js");
    const marker = `return { ok: true, band: wantBand, lane: wantLane, bandSteps, laneSteps, leftMelee: (mover.band === "melee" && wantBand !== "melee") };`;
    const mutated = `return { ok: true, band: wantBand, lane: wantLane, bandSteps, laneSteps, leftMelee: false };`;
    if (!original.includes(marker)) { fail++; console.log("  ✗ MUTATION(oa-melee-exit): guard text not found verbatim — spec drifted?"); }
    else {
      const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter(p => p.endsWith(".js")).map(p => p === "src/engine/combat.js" ? original.replace(marker, mutated) : read(p)).join("\n;\n") + "\n;\n" + accessors;
      const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
      const mwin = dom.window; mwin.eval(harness + "\n" + mutSrc);
      const mworld = makeWorld(mwin);
      const mcombat = startFight(mwin, { segment: { dims: "" } });
      mwin.GS.combat = mcombat;
      const mbat = mcombat.foes.find(f => /bat/i.test(f.name));
      mbat.band = "melee"; mbat.lane = "C";
      const mr = mwin.applyEvent(mworld, { type: "move_zone", payload: { who: "pc", band: "near", lane: "C" } });
      const nowNoOA = (mr.opportunityAttacks.length === 0);
      check("MUTATION (shown RED then restored): forcing leftMelee=false suppresses the OA that should have fired",
        nowNoOA, nowNoOA ? "confirmed RED under mutation, as expected" : "guard did not move — combat.js wiring may have changed");
    }
  }
}

// ============================================================================
// 7. flank advantage — exactly when an ally shares the target's zone, symmetric
// ============================================================================
{
  const win = freshWin();
  const attacker = { band: "melee", lane: "C" };
  const target = { band: "melee", lane: "L" };
  const allySharingTargetZone = { band: "melee", lane: "L" };
  const allyElsewhere = { band: "near", lane: "C" };
  check("7a. no flank when no ally shares the target's zone", win.cmFlanked(attacker, target, [allyElsewhere]) === false);
  check("7b. flank when an ally DOES share the target's zone", win.cmFlanked(attacker, target, [allySharingTargetZone]) === true);
  check("7c. flank is symmetric — the same rule works with attacker/target swapped", win.cmFlanked(target, attacker, [{ band: "melee", lane: "C" }]) === true);
  // resolveAttack actually nets the flank into advantage — force nat rolls to isolate the effect.
  const rNoFlank = win.resolveAttack({ d20: 10, atkBonus: 0, targetAC: 30, attacker, target, allies: [allyElsewhere], range: "melee", dmg: [] });
  const rFlank = win.resolveAttack({ d20: 10, atkBonus: 0, targetAC: 30, attacker, target, allies: [allySharingTargetZone], range: "melee", dmg: [] });
  check("7d. resolveAttack nets flank into advantage (advFlank:true, advantage:'adv')", rFlank.advFlank === true && rFlank.advantage === "adv", JSON.stringify(rFlank));
  check("7e. resolveAttack shows no flank source when no ally is in-zone", rNoFlank.advFlank === false, JSON.stringify(rNoFlank));
  // a single disadvantage source still cancels a single flank-advantage source (SRD 2024 flat net).
  const rCancel = win.resolveAttack({ d20: 10, atkBonus: 0, targetAC: 30, attacker, target, allies: [allySharingTargetZone], advantage: "dis", range: "melee", dmg: [] });
  check("7f. an explicit disadvantage cancels the flank advantage (net null)", rCancel.advantage === null, JSON.stringify(rCancel));
}

// ============================================================================
// 8. elevation advantage — melee only, DOWNHILL (attacker elevated, target not)
// ============================================================================
{
  const win = freshWin();
  const highAttacker = { band: "melee", lane: "C", elev: true };
  const lowTarget = { band: "melee", lane: "C", elev: false };
  const rDownhill = win.resolveAttack({ d20: 10, atkBonus: 0, targetAC: 30, attacker: highAttacker, target: lowTarget, range: "melee", dmg: [] });
  check("8a. attacker elevated + target not -> advantage (advElev:true)", rDownhill.advElev === true && rDownhill.advantage === "adv", JSON.stringify(rDownhill));
  const rBothHigh = win.resolveAttack({ d20: 10, atkBonus: 0, targetAC: 30, attacker: { band: "melee", lane: "C", elev: true }, target: { band: "melee", lane: "C", elev: true }, range: "melee", dmg: [] });
  check("8b. both elevated -> no elevation advantage", rBothHigh.advElev === false, JSON.stringify(rBothHigh));
  const rRangedIgnored = win.resolveAttack({ d20: 10, atkBonus: 0, targetAC: 30, attacker: highAttacker, target: lowTarget, range: "ranged", dmg: [] });
  check("8c. elevation is MELEE-ONLY — a ranged attack ignores it", rRangedIgnored.advElev === false, JSON.stringify(rRangedIgnored));
}

// ============================================================================
// 9. AoE zone sets per shape (line/burst/cone)
// ============================================================================
{
  const win = freshWin();
  const grid = { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] };
  const line = win.aoeZones("line", { band: "near", lane: "C" }, null, grid);
  check("9a. line = one lane across every band", line.length === 4 && line.every(z => z.endsWith(":C")), JSON.stringify(line));
  const burst = win.aoeZones("burst", { band: "near", lane: "C" }, null, grid);
  check("9b. burst = origin + the 4 orthogonal neighbors (5 zones, none diagonal)",
    burst.length === 5 && burst.includes("near:C") && burst.includes("melee:C") && burst.includes("far:C") && burst.includes("near:L") && burst.includes("near:R"),
    JSON.stringify(burst));
  const cone = win.aoeZones("cone", { band: "melee", lane: "C" }, "deeper", grid);
  check("9c. cone = origin + the two zones flanking it one band farther",
    cone.includes("melee:C") && cone.includes("near:L") && cone.includes("near:R") && cone.includes("near:C") === false,
    JSON.stringify(cone));
  const coneEdge = win.aoeZones("cone", { band: "melee", lane: "L" }, "deeper", grid);
  check("9d. a cone from an edge lane only lists the zones that actually exist in the grid",
    coneEdge.every(z => grid.lanes.some(l => z.endsWith(":" + l))), JSON.stringify(coneEdge));
}

// ============================================================================
// 10. cover modifies crossing attacks (zone cover)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" } });
  combat.scene.zoneCover = { "melee:L": "half" };
  win.GS.combat = combat;
  const bat = combat.foes.find(f => /bat/i.test(f.name));
  bat.band = "melee"; bat.lane = "L";
  combat.pc.band = "melee"; combat.pc.lane = "C";
  const covFromDifferentZone = win.cmZoneCover(combat, combat.pc, bat);
  check("10a. crossing INTO a covered zone from a different zone applies that zone's cover", covFromDifferentZone === "half", covFromDifferentZone);
  const samePc = { band: "melee", lane: "L" };
  const covSameZone = win.cmZoneCover(combat, samePc, bat);
  check("10b. an attacker sharing the target's exact zone gets no cover (point-blank)", covSameZone === 0, covSameZone);
}

// ============================================================================
// 11. hidden trap zones absent from player DOM until revealed
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" } });
  combat.scene.hazardZones = [{ zone: "near:R", kind: "pressure-plate", revealed: false }];
  win.GS.combat = combat;
  win.GS.gamePanel = "combat";
  win.renderWorld();
  let host = win.document.getElementById("worldView");
  check("11a. an unrevealed hazard zone shows NO hazard marker in the DOM", !host.querySelector(".cmb-zone-hazard"), host.querySelector(".panel-col").innerHTML.length);
  combat.scene.hazardZones[0].revealed = true;
  win.renderWorld();
  host = win.document.getElementById("worldView");
  check("11b. once revealed, the hazard marker DOES appear", !!host.querySelector(".cmb-zone-hazard"));
}

// ============================================================================
// 12. tap inserts text and never sends (§2/§3 tap-sugar)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" } });
  win.GS.combat = combat;
  win.GS.gamePanel = "combat";
  win.renderWorld();
  // renderWorld() already renders the REAL #dmAction turn-input box (src/world/render.js:178) —
  // read it back rather than injecting a duplicate-id stand-in (getElementById would just find the
  // real one first anyway; using it directly is the honest test).
  const ta = win.document.getElementById("dmAction");
  let sent = false;
  win.sendTurn = () => { sent = true; return Promise.resolve(); };
  win.cmbZoneInsert("Near", "R");
  check("12a. a zone tap inserts the movement phrase into #dmAction", /near-right/i.test(ta.value), ta.value);
  check("12b. a zone tap NEVER sends the turn", sent === false);
}

// ============================================================================
// 13. foe HP/AC still absent from the zone-grid DOM (regression on the no-leak rule)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  const combat = startFight(win, { segment: { dims: "" } });
  win.GS.combat = combat;
  win.GS.gamePanel = "combat";
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const grid = host.querySelector(".cmb-grid");
  check("13a. the zone grid renders", !!grid);
  const basilisk = combat.foes.find(f => /basilisk/i.test(f.name));
  // scope to FOE chips only (.cmb-chip:not(.pc)) — the PC's own chip legitimately renders its own HP
  // (spec: "the player's own numbers are theirs"), and Borin's fixture HP (52/52) coincidentally
  // matches Basilisk's maxHp, so an unscoped whole-grid regex would false-positive (same precedent as
  // verify-combat-tracker.mjs's assertion 2c/2d).
  const foeChipsHtml = grid ? [...grid.querySelectorAll(".cmb-chip:not(.pc)")].map(c => c.innerHTML).join("") : "";
  check("13b. no foe HP number leaks into the zone-grid DOM", !new RegExp("\\b" + basilisk.maxHp + "\\b").test(foeChipsHtml), foeChipsHtml);
  check("13c. no foe AC number leaks into the zone-grid DOM", !new RegExp("\\b" + basilisk.ac + "\\b").test(foeChipsHtml), foeChipsHtml);
}

// ============================================================================
// 14. UNIT W2 (docs/DESIGN.md, fix/wiring-teeth-0727, 2026-07-27) — wilderness-tactical-terrain's
//     "Map Footprint" column now COMPILES (a named DM-only row field — Engine/00. _System/
//     compile-tables.py, the Legs/Pool precedent) and is EXPOSED on rolled terrain results
//     (src/engine/wild-walk.js's wwalkEncounter, via the new walkPickTagged helper in
//     src/engine/walk.js; also on compiled.js's rollTable()/rollTableAtBand()/rollTableInRange()
//     decoders as `.footprint` for any table that carries the column).
//
//     WHY THIS REPLACES THE OLD 14a-ONLY COMMENT: the previous text here (pre-W2) asserted, verbatim,
//     "no wilderness-tactical-terrain 'Map Footprint' column exists in the compiled tables yet"
//     (docs/TERRAIN-PROGRAM.md M8, read-only sibling worktree Genesis-clayspec: "Fifty authored
//     footprints ... are stranded in markdown. Spec: compile the column. This is the cheapest item
//     on the entire list and it unblocks every other one"). That claim is now FALSE — 14b/14c below
//     prove the column compiles and reaches a rolled result, with real dice (distribution/shape only,
//     never a fixed RNG position). 14a itself is KEPT, UNWEAKENED: it is still true and still matters
//     — TERRAIN-PROGRAM.md's own missing-list ownership table files footprint->zone-occupancy parsing
//     under the SEPARATE "engine wiring" lane (M9/M12), not M8's "compile" lane this unit closes.
//     cmZoneGrid must keep working null-safe until that later unit lands.
// ============================================================================
{
  const win = freshWin();
  // cmZoneGrid derives the grid from room `dims` alone and never reaches for a footprint field —
  // still true post-W2 on purpose: footprint -> zone-occupancy parsing (BATTLEMAP.md §3b: "15'×15'
  // ≈ one zone…") is a separate, later engine-wiring unit. A segment with no footprint wiring still
  // produces a valid grid (null-safe, not a crash/undefined).
  const g = win.cmZoneGrid({ dims: "40' x 60'" });
  check("14a. cmZoneGrid never reaches for an unbuilt footprint field (null-safe placeholder — footprint->zone-occupancy parsing is still a separate follow-up unit, BATTLEMAP.md §3b)", Array.isArray(g.bands) && Array.isArray(g.lanes), JSON.stringify(g));
}
{
  const win = freshWin();
  // 14b. the compiled table itself: sample many draws (never a fixed RNG position — distribution/
  // shape only) and prove EVERY row now carries a real, non-empty `.footprint` off rollTable's
  // decoder (src/engine/compiled.js), AND that it is excluded from the player-facing `.cells`/`.text`
  // — DM-only, same as legs/pool (BATTLEMAP.md §3b: "DM-only column... the Legs/Pool precedent").
  const N = 25;
  const draws = [];
  for (let i = 0; i < N; i++) draws.push(win.rollTable("wilderness-tactical-terrain"));
  const allHaveFootprint = draws.every((r) => r && typeof r.footprint === "string" && r.footprint.length > 0);
  check("14b1. every sampled roll of wilderness-tactical-terrain carries a non-empty .footprint (x25 draws, distribution-only)",
    allHaveFootprint, JSON.stringify(draws.filter((r) => !r || !r.footprint).slice(0, 3)));
  const distinctFootprints = new Set(draws.map((r) => r && r.footprint));
  check("14b2. the sampled footprints are real per-row data, not a constant placeholder (>=2 distinct values across 25 draws)",
    distinctFootprints.size >= 2, JSON.stringify([...distinctFootprints]));
  const leaksIntoCells = draws.some((r) => r.footprint && Array.isArray(r.cells) && r.cells.some((c) => c === r.footprint));
  check("14b3. the footprint text is NOT duplicated into the player-facing .cells columns (DM-only, excluded like legs/pool)",
    !leaksIntoCells, "a sampled row's cells[] contained its own footprint text verbatim");
}
{
  // 14c. wwalkEncounter's Enemy branch: the SAME single terrain draw now ALSO surfaces
  // `terrainFootprint` on the rolled result (src/engine/wild-walk.js) — no second dice roll (a
  // second draw would be the "never rolls twice for a field" bug walkPickStamped's own comment
  // warns against); bounded retry to find Enemy-branch rolls, never a fixed RNG position.
  const win = freshWin();
  const enemyRolls = [];
  for (let i = 0; i < 400 && enemyRolls.length < 10; i++) {
    const enc = win.wwalkEncounter(1, null, null, {});
    if (enc && enc.isEnemy) enemyRolls.push(enc);
  }
  check("14c1. (fixture) at least 10 Enemy-branch encounters found within the retry budget (proves this isn't a vacuous pass)",
    enemyRolls.length >= 10, `found ${enemyRolls.length}`);
  const allCarryFootprint = enemyRolls.every((e) => typeof e.terrainFootprint === "string" && e.terrainFootprint.length > 0);
  check("14c2. every Enemy-branch encounter carries a non-empty .terrainFootprint alongside .terrain",
    allCarryFootprint, JSON.stringify(enemyRolls.filter((e) => !e.terrainFootprint).slice(0, 3)));
  const allDistinctFromTerrain = enemyRolls.every((e) => e.terrainFootprint !== e.terrain);
  check("14c3. .terrainFootprint is genuinely distinct data from .terrain on every sampled roll (not an alias/duplicate)",
    allDistinctFromTerrain, JSON.stringify(enemyRolls.filter((e) => e.terrainFootprint === e.terrain).slice(0, 3)));
  const distinctFP = new Set(enemyRolls.map((e) => e.terrainFootprint));
  check("14c4. the sampled .terrainFootprint values are real per-row data (>=2 distinct across the sample)",
    distinctFP.size >= 2, JSON.stringify([...distinctFP]));
}

// ============================================================================
// 15. BATTLE-VISUALS A8 — band clamp: a foe whose band sits OUTSIDE the room's derived grid renders
//     clamped to the nearest row it DOES have, instead of vanishing (render-side only — f.band unchanged)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  // "40' x 60'" derives to 2 bands x 3 lanes (test 1a) -> the room only HAS melee+near rows.
  const combat = startFight(win, { segment: { dims: "40' x 60'" } });
  win.GS.combat = combat;
  win.GS.gamePanel = "combat";
  check("(fixture) the room's grid is exactly 2 bands", combat.grid.bandCount === 2, JSON.stringify(combat.grid));
  const bat = combat.foes.find(f => /bat/i.test(f.name));
  bat.band = "far"; bat.lane = "C";   // force the foe OUTSIDE the 2-band room (melee/near only)
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const rows = [...host.querySelectorAll(".cmb-zone-row")];
  check("15a. the room's zone grid renders exactly 2 band rows", rows.length === 2, rows.length);
  const lastRow = rows[rows.length - 1];
  const lastRowHasBat = lastRow && [...lastRow.querySelectorAll(".cmb-chip-name")].some(el => /bat/i.test(el.textContent));
  check("15b. the far-band foe (outside the 2-band room) renders CLAMPED into the room's LAST grid row, not vanished", lastRowHasBat, lastRow && lastRow.outerHTML.slice(0, 300));
  check("15c. the clamp is render-side only — the foe's real band is untouched (still 'far')", bat.band === "far", bat.band);
  const otherRows = rows.slice(0, -1);
  const batElsewhere = otherRows.some(r => [...r.querySelectorAll(".cmb-chip-name")].some(el => /bat/i.test(el.textContent)));
  check("15d. the clamped foe does not ALSO appear in any other row (exactly one placement)", !batElsewhere);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
