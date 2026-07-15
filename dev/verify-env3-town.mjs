/* Verify ENV-3 (docs/ENV-EXTERIOR-WAVE.md "The town tray — first compositional settlement") — the
   settlement-kind node routes to theaterSettlementBoardBuild (a compositional street scene) instead of
   the blank idle table. jsdom, real genesis.html modules in document order (same convention as
   dev/verify-place-tray.mjs). window.Theater is not needed — this harness only exercises the pure data
   layer (theaterSettlementBoardBuild/trayFrom) and the null-safe render.js source read
   (theaterHereSourceFor/nodeIsSettlementKind).

   Checks:
     (a) RED FIRST: with nodeIsSettlementKind stubbed to always return false (simulating the code as it
         stood before this unit — theaterNodeSourceFor finds nothing at the origin town, so
         theaterHereSourceFor degrades straight to {kind:"idle"}), the resulting board is BARE (zero
         tiles, zero buildings) — the exact "settlement tray shows zero town" defect the ledger measured.
     (b) GREEN: the real (unstubbed) routing yields kind:"settlement" at the origin town with no active
         walk, and the resulting board carries >=4 building masses, a street (cobble-materialed floor
         tiles on the grid's center lane), and >=2 NPC/prop dressing mounts.
     (c) determinism: two theaterSettlementBoardBuild calls on the identical (nodeInfo,realms,env)
         snapshot are byte-identical (§9.1 purity — no RNG outside the seeded chain).
     (d) footprint: no two buildings share a tile, and no building tile coincides with a street-lane
         tile (buildings never overlap the street lane or each other).
     (e) single-site place trays untouched: the SAME Watering-hole fixture verify-place-tray.mjs uses,
         run through trayFrom({kind:"node",...}), still yields the exact pre-ENV-3 12-tile/4x3 shape —
         the diner-class path never routes through the new settlement branch.
     (f) render-source law: an urban prep-frontier node with NO bound place record routes to
         kind:"settlement" too; a node WITH a bound archetyped place record does NOT (node wins,
         byte-identical to pre-ENV-3); a non-settlement, non-bound node still degrades to kind:"idle".
     (g) PC in frame: castFrom's PC unit, re-centered via theaterBoardCenterFor (the SAME seam
         theaterStageSync/render.js uses), lands within the board's own tile bounding box (+1 pad,
         mirroring theater-boot.js's setBoard boardHalfX/Z formula) — "PC + buildings inside the camera
         fit" without re-deriving GL camera math.

   Run:  node dev/verify-env3-town.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const CLASSIC_FILES = man.loadOrder.filter((p) => p.endsWith(".js"));
const moduleSrc = CLASSIC_FILES.map(read).join("\n;\n");
const TABLES_SRC = read("tables.js");
const srcText = TABLES_SRC + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin() {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// fixture world: an origin town (w.startNodeId === w.currentNodeId), no active walk, no bound place
// record at that node — the exact shape mintOriginPlaceThread leaves the origin in (docs/PLACE-GEN.md
// ADDENDUM §7D item 9's own "never a single spine archetype" scope fence).
// ============================================================================
function fixtureTownWorld(win) {
  const w = {
    startNodeId: "n-town", currentNodeId: "n-town",
    map: { nodes: { "n-town": { id: "n-town", name: "Rivergate", type: "Setting" } }, edges: [] },
    characters: [{ status: "living", name: "Capture Bot", sheet: { class: "Fighter", mods: {}, ac: 15, hp: 12, hpCur: 12 } }],
  };
  return w;
}

// ============================================================================
// (a) RED FIRST — stub nodeIsSettlementKind to always return false, simulating pre-ENV-3 behavior:
// theaterNodeSourceFor finds nothing bound at the origin town -> theaterHereSourceFor has nowhere else
// to route -> {kind:"idle"} -> a BARE board (zero tiles/buildings). This is the exact ledger #9 defect.
// ============================================================================
{
  const win = freshWin();
  const w = fixtureTownWorld(win);
  const realNodeIsSettlementKind = win.nodeIsSettlementKind;
  win.nodeIsSettlementKind = () => false; // simulate the code as it stood before this unit
  const hereSource = win.theaterHereSourceFor(w);
  const board = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  check("RED: pre-fix routing degrades to kind:\"idle\" at the origin town", hereSource.kind === "idle", JSON.stringify(hereSource));
  check("RED: pre-fix board is BARE — zero tiles", (board.tiles || []).length === 0, (board.tiles || []).length);
  check("RED: pre-fix board carries no buildings field at all", board.buildings === undefined, JSON.stringify(board.buildings));
  win.nodeIsSettlementKind = realNodeIsSettlementKind; // restore — every check below uses the REAL fix
}

// ============================================================================
// (b) GREEN — the real routing composes a street scene: kind:"settlement", >=4 buildings, a street,
// >=2 NPC/prop dressing mounts.
// ============================================================================
let GREEN_BOARD = null;
{
  const win = freshWin();
  const w = fixtureTownWorld(win);
  const hereSource = win.theaterHereSourceFor(w);
  check("GREEN: origin town, no active walk -> kind:\"settlement\"", hereSource.kind === "settlement", JSON.stringify(hereSource));
  const board = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  GREEN_BOARD = board;
  const buildings = board.buildings || [];
  const streetTiles = (board.tiles || []).filter(t => t.kind === "floor" && t.material === "cobble");
  const dressingProps = (board.props || []).filter(p => p.kind === "dressing");
  check("GREEN: >=4 building masses (SETTLEMENT_BUILDING_MIN)", buildings.length >= 4, buildings.length);
  check("GREEN: <=8 building masses (SETTLEMENT_BUILDING_MAX)", buildings.length <= 8, buildings.length);
  check("GREEN: a street exists (cobble-materialed floor tiles)", streetTiles.length > 0, streetTiles.length);
  check("GREEN: >=2 NPC/market dressing mounts", dressingProps.length >= 2, dressingProps.length);
  check("GREEN: every building tile carries a raised height (a real mass, not a flat lot)",
    (board.tiles || []).filter(t => t.kind === "building").every(t => t.h > 0),
    JSON.stringify((board.tiles || []).filter(t => t.kind === "building").slice(0, 3)));
}

// ============================================================================
// (c) determinism — the SAME node id always yields a byte-identical board.
// ============================================================================
{
  const win = freshWin();
  const w = fixtureTownWorld(win);
  const hereSource = win.theaterHereSourceFor(w);
  const b1 = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  const b2 = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  check("determinism: two calls on the identical snapshot are byte-identical JSON", JSON.stringify(b1) === JSON.stringify(b2));
}

// ============================================================================
// (d) footprint — no two buildings share a tile; no building tile sits on the street lane.
// ============================================================================
{
  const board = GREEN_BOARD;
  const buildingTilesByBuilding = {};
  (board.tiles || []).forEach(t => {
    if (t.kind !== "building") return;
    (buildingTilesByBuilding[t.buildingId] = buildingTilesByBuilding[t.buildingId] || []).push(t.x + "," + t.z);
  });
  const allBuildingCoords = new Set();
  let overlap = false;
  Object.values(buildingTilesByBuilding).forEach(coords => {
    coords.forEach(c => { if (allBuildingCoords.has(c)) overlap = true; allBuildingCoords.add(c); });
  });
  check("footprint: no two buildings share a tile coordinate", !overlap);
  const streetCoords = new Set((board.tiles || []).filter(t => t.kind === "floor" && t.material === "cobble").map(t => t.x + "," + t.z));
  const buildingOnStreet = [...allBuildingCoords].some(c => streetCoords.has(c));
  check("footprint: no building tile coincides with a street-lane tile", !buildingOnStreet);
}

// ============================================================================
// (e) single-site place trays untouched — the SAME Watering-hole fixture dev/verify-place-tray.mjs
// exercises, still 12 tiles in a 4x3 arrangement (byte-unchanged shape law).
// ============================================================================
{
  const win = freshWin();
  const FIXTURE_RECORD = {
    id: "loc:fixture-watering-hole",
    kind: "location", name: "The Drowned Lamp", provenance: "rolled",
    rolled: { archetypeKey: "1", archetypeLabel: "Watering-hole", space: "roomy",
      dims: { w: 4, d: 3 }, staff: { min: 1, max: 2 }, cast: { anchorCls: "service", ambientCls: ["labor"] } },
    fields: { desc: "a sunken tavern", type: "Watering-hole" },
    dm: { itemsPool: "realm-items-gloom", dressing: { props: "gloom", surfaces: "gloom" } },
    status: { soft: true, at: "n1" }
  };
  const board = win.trayFrom({ kind: "node", record: FIXTURE_RECORD, realms: ["gloom"], env: "urban" }, null, {});
  check("untouched: single-site diner-class board is still exactly 12 tiles", (board.tiles || []).length === 12, board.tiles.length);
  const xs = new Set(board.tiles.map(t => t.x)), zs = new Set(board.tiles.map(t => t.z));
  check("untouched: still a 4x3 arrangement (x in [0,4), z in [0,3))",
    [...xs].every(x => x >= 0 && x < 4) && [...zs].every(z => z >= 0 && z < 3));
  check("untouched: no `buildings` field on a single-site board (that field is settlement-only)", board.buildings === undefined);
}

// ============================================================================
// (f) render-source law — the three-way split theaterHereSourceFor now makes.
// ============================================================================
{
  const win = freshWin();
  // f1: an urban prep-frontier node, no bound place record -> settlement.
  {
    const w = { startNodeId: "n-home", currentNodeId: "n-frontier-1",
      map: { nodes: { "n-frontier-1": { id: "n-frontier-1", name: "The Docks (rumored)", type: "Frontier" } }, edges: [] },
      prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], activeWalkId: null, walkLog: [],
        nodes: { "n-frontier-1": { env: "urban", idx: 0, soft: true, locked: false, hook: null } } } };
    const hereSource = win.theaterHereSourceFor(w);
    check("f1: an urban prep-frontier with no bound place record -> kind:\"settlement\"", hereSource.kind === "settlement", JSON.stringify(hereSource));
  }
  // f2: an urban prep-frontier node WITH a bound archetyped place record -> node wins (untouched).
  {
    const w = { startNodeId: "n-home", currentNodeId: "n-frontier-2",
      map: { nodes: { "n-frontier-2": { id: "n-frontier-2", name: "The Docks (rumored)", type: "Frontier", codexId: "loc:bound" } }, edges: [] },
      prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], activeWalkId: null, walkLog: [],
        nodes: { "n-frontier-2": { env: "urban", idx: 0, soft: true, locked: false, hook: null } } } };
    win.codexGet = (world, id) => id === "loc:bound"
      ? { id: "loc:bound", kind: "location", rolled: { archetypeKey: "1", dims: { w: 2, d: 2 } } } : null;
    const hereSource = win.theaterHereSourceFor(w);
    check("f2: an urban prep-frontier WITH a bound place record -> kind:\"node\" (diner path wins, untouched)",
      hereSource.kind === "node", JSON.stringify(hereSource));
  }
  // f3: a non-settlement, non-bound node (wilderness/dungeon-band frontier) -> still idle.
  {
    const w = { startNodeId: "n-home", currentNodeId: "n-frontier-3",
      map: { nodes: { "n-frontier-3": { id: "n-frontier-3", name: "The far reaches (rumored)", type: "Frontier" } }, edges: [] },
      prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], activeWalkId: null, walkLog: [],
        nodes: { "n-frontier-3": { env: "wilderness", idx: 0, soft: true, locked: false, hook: null } } } };
    const hereSource = win.theaterHereSourceFor(w);
    check("f3: a wilderness-band frontier, no bound record -> still kind:\"idle\" (no regression)", hereSource.kind === "idle", JSON.stringify(hereSource));
  }
}

// ============================================================================
// (g) PC in frame — castFrom's PC unit, re-centered via theaterBoardCenterFor (the SAME seam
// theaterStageSync uses), lands inside the board's own tile bounding box (+1 pad).
// ============================================================================
{
  const win = freshWin();
  const w = fixtureTownWorld(win);
  const hereSource = win.theaterHereSourceFor(w);
  const board = win.trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms });
  const castSource = win.theaterCastSourceFor(w, hereSource);
  castSource.boardCenter = win.theaterBoardCenterFor(board);
  const units = win.castFrom(w, castSource);
  const pcUnit = units.find(u => u.kind === "pc");
  check("PC-in-frame: castFrom stages a PC unit on the settlement tray", !!pcUnit, JSON.stringify(units.map(u => u.kind)));
  if (pcUnit) {
    const tiles = board.tiles || [];
    const minX = Math.min(...tiles.map(t => t.x)), maxX = Math.max(...tiles.map(t => t.x));
    const minZ = Math.min(...tiles.map(t => t.z)), maxZ = Math.max(...tiles.map(t => t.z));
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    const halfX = (maxX - minX) / 2 + 1, halfZ = (maxZ - minZ) / 2 + 1; // mirrors setBoard's own boardHalfX/Z formula
    const localX = pcUnit.x - cx, localZ = pcUnit.z - cz; // setBoard positions every mesh at coord-cx/coord-cz
    check("PC-in-frame: the PC's re-centered position sits within the board's own tile bounds (+1 pad)",
      Math.abs(localX) <= halfX && Math.abs(localZ) <= halfZ,
      `pc=(${pcUnit.x},${pcUnit.z}) local=(${localX},${localZ}) halfX=${halfX} halfZ=${halfZ}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
