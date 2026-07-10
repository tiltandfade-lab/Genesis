/* Verify PLACE-GEN.md ADDENDUM §A / §7 UNIT 11 — GRID-LAW combat derivation. jsdom over the real
   genesis.html modules in manifest order (same convention as dev/verify-combat-lifecycle.mjs /
   dev/verify-place-tray.mjs). When a fight starts at a node bound to a typed place record, combat's
   zone grid derives from the record's `rolled.dims` (exact cell geometry) instead of parsing feet
   text out of an authored segment — src/engine/combat.js's cmGridFromCells + combatStart's cellDims
   priority, wired at the call boundary in src/world/dm.js's combat_start case.

   Checks:
     (e) cmGridFromCells unit rows — the pure counts function in isolation:
         {w:4,d:5}->1x1, {w:5,d:6}->2x2, {w:8,d:10}->2x2, {w:12,d:15}->3x3.
     (a) typed place fixture, dims {w:24,d:20} (vast-plus, clamps bind) -> combat_start on the bound
         node -> GS.combat.grid 4 bands x 3 lanes.
     (b) typed place fixture, dims {w:4,d:3} (a small diner) -> 1 band x 1 lane — NOT padded up to a
         bigger grid; the clamps' floor of 1 is the only floor.
     (c) no-record fight (an untyped node, no codex mint at all) -> grid byte-identical to the
         text-parse golden captured against segment.dims BEFORE this unit's wiring existed.
     (d) MUTATION: stub theaterNodeSourceFor off (simulate "the lookup is unavailable") -> (a) and (b)
         both fall back to the text-parse defaults (full 4x3, or whatever segment.dims would produce)
         instead of the cell-derived grid — proves the record lookup, not a hardcoded fixture
         coincidence, is what drives the cell path.

   RED-FIRST: (a) and (b) were run against the pre-wiring tree (cellDims never threaded through
   dm.js's combat_start case) and captured failing — GS.combat.grid came back 4x3 (the segment-less
   default) for BOTH the 24x20 and the 4x3 fixtures, since neither ever reached the cell path. See the
   inline RED_CAPTURE comments below for the exact captured values.

   Run:  node dev/verify-combat-cells.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

function makeWorld(win) {
  const world = {
    id: "w-cellgrid", name: "The Cell Grid Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the derivation" },
            smell:{name:"smoke"}, sound:{name:"wind"}, arch:{name:"stone"},
            taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: {
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16, dex: 12 }, mods: { str: 4, con: 3, dex: 1 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [], equipped: { mainHand:null, offHand:null, armor:null }, pools: {},
      } }],
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
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// binds world.currentNodeId's node to a typed place record via mapOf/codexGet — the same shape
// theaterNodeSourceFor/dmDigestLocationLine already read (mirrors dev/verify-place-tray.mjs's fixture).
function bindPlaceRecord(win, world, dims) {
  const recId = "loc:fixture-cellgrid";
  world.codex = { records: { [recId]: {
    id: recId, kind: "location", name: "Test Room", provenance: "rolled",
    rolled: { archetypeKey: "1", archetypeLabel: "Test Room", space: "roomy", dims,
      staff: { min: 1, max: 2 }, cast: { anchorCls: "service", ambientCls: [] } },
    fields: { desc: "a test space", type: "Test Room" },
    dm: { itemsPool: "realm-items-frontier", dressing: { props: "frontier", surfaces: "frontier" } },
    status: { soft: true, at: world.currentNodeId },
  } }, version: 1 };
  world.map.nodes[world.currentNodeId].codexId = recId;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// (e) cmGridFromCells — the pure counts function, in isolation
// ============================================================================
{
  const win = freshWin();
  const rows = [
    [{ w: 4, d: 5 }, 1, 1],
    [{ w: 5, d: 6 }, 2, 2],
    [{ w: 8, d: 10 }, 2, 2],
    [{ w: 12, d: 15 }, 3, 3],
  ];
  rows.forEach(([dims, bands, lanes]) => {
    const g = win.cmGridFromCells(dims);
    check(`e. cmGridFromCells(${JSON.stringify(dims)}) -> ${bands}x${lanes}`,
      g && g.bands === bands && g.lanes === lanes, JSON.stringify(g));
  });
}

// ============================================================================
// (a) vast-plus fixture (24x20 cells) -> clamps bind -> 4 bands x 3 lanes
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  bindPlaceRecord(win, world, { w: 24, d: 20 });
  // RED_CAPTURE (pre-wiring): before combat_start threaded cellDims through, this returned
  // {bandCount:4,laneCount:3} too by coincidence (the no-segment default is also 4x3) — so this
  // fixture alone doesn't prove the wiring; (b) below is the discriminating case. Captured anyway
  // for completeness per the task's red-first ask.
  const r = win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  check("a1. combat_start ok", r && r.ok === true, JSON.stringify(r));
  check("a2. 24x20 cells clamps to 4 bands x 3 lanes",
    win.GS.combat.grid.bandCount === 4 && win.GS.combat.grid.laneCount === 3,
    JSON.stringify(win.GS.combat.grid));
}

// ============================================================================
// (b) small-room fixture (4x3 cells, a diner) -> 1 band x 1 lane, NOT padded up
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  bindPlaceRecord(win, world, { w: 4, d: 3 });
  // RED_CAPTURE (pre-wiring, captured against the tree before dm.js threaded cellDims into
  // combatStart): GS.combat.grid came back {bandCount:4,laneCount:3} — the segment-less "no dims at
  // all" default — because the typed record's dims were never read at the combat_start call site.
  // Post-wiring this MUST come back 1x1: the honest small-room grid, per ADDENDUM §A.
  const r = win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  check("b1. combat_start ok", r && r.ok === true, JSON.stringify(r));
  check("b2. 4x3 cells (a diner) -> 1 band x 1 lane, everyone in melee — not padded to a bigger grid",
    win.GS.combat.grid.bandCount === 1 && win.GS.combat.grid.laneCount === 1,
    JSON.stringify(win.GS.combat.grid));
}

// ============================================================================
// (c) no-record fight — byte-identical to the pre-unit text-parse golden
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  // no bindPlaceRecord call: the node carries no codexId at all (an ordinary walk-segment fight, or
  // an ambush with no typed place behind it) — theaterNodeSourceFor degrades to null, cellDims stays
  // undefined, and combatStart's untouched text-parse path runs exactly as it did before this unit.
  const r = win.applyEvent(world, { type: "combat_start", payload: {
    foes: [{ name: "Goblin", cr: 0.25 }],
    segment: { id: "s1", dims: "40' x 60'" },
  } });
  check("c1. combat_start ok", r && r.ok === true, JSON.stringify(r));
  // golden: "40' x 60'" -> depth 40 -> ceil(40/25)=2 bands, width 60 -> ceil(60/20)=3 lanes (clamped 3)
  // — this is cmDimsToGrid's pre-existing text-parse output, unchanged by this unit (BATTLEMAP.md's
  // own verify-battlemap.mjs asserts this exact pairing already; reasserted here as the byte-gate).
  check("c2. no-record fight (segment.dims text) -> unchanged 2 bands x 3 lanes golden",
    win.GS.combat.grid.bandCount === 2 && win.GS.combat.grid.laneCount === 3,
    JSON.stringify(win.GS.combat.grid));
}

// ============================================================================
// (d) MUTATION — stub the record lookup off -> (a)/(b) fall back to text-parse values and FAIL
// ============================================================================
{
  const win = freshWin();
  // stub theaterNodeSourceFor to always return null, simulating "the lookup is unavailable" — this
  // is exactly the degrade path dm.js's combat_start case already handles (typeof guard), so the
  // fight still starts; it just can't see the typed record any more.
  win.eval(`theaterNodeSourceFor = function(){ return null; };`);
  const world = makeWorld(win);
  bindPlaceRecord(win, world, { w: 24, d: 20 });
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  const gridA = win.GS.combat.grid;
  check("d1. MUTATION: lookup stubped off -> 24x20 fixture falls back to the no-segment default (4x3), NOT the cell-derived grid (also 4x3 here — see d3 for the discriminating case)",
    gridA.bandCount === 4 && gridA.laneCount === 3, JSON.stringify(gridA));

  win.GS.combat = null;
  const world2 = makeWorld(win);
  bindPlaceRecord(win, world2, { w: 4, d: 3 });
  win.applyEvent(world2, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  const gridB = win.GS.combat.grid;
  check("d2. MUTATION: lookup stubbed off -> 4x3-cell diner fixture does NOT get the honest 1x1 grid any more (falls back to the no-segment 4x3 default) — the discriminating case: this WOULD be 1x1 if the lookup still worked",
    gridB.bandCount === 4 && gridB.laneCount === 3, JSON.stringify(gridB));
  check("d3. mutation proves the wiring: d2's fallback (4x3) differs from (b2)'s wired result (1x1) for the SAME fixture dims",
    gridB.bandCount !== 1 || gridB.laneCount !== 1, JSON.stringify(gridB));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
