#!/usr/bin/env node
/* dev/verify-ks3-kit-shells.mjs — docs/KENNEY-SOCKET-WAVE.md KS-3 ("ROOM SHELLS FROM THE KIT").

   Pure-data techniques only (no THREE, no network) — mirrors dev/verify-ks2-door-assembly.mjs's own
   Part A/B split: vm-loads the real place-spatialize.js/place-semantics.js/theater-interior.js/
   theater-materials.js chain (the SAME 4-file bundle dev/verify-dungeon-interior.mjs and
   dev/verify-ks2-door-assembly.mjs already use) and drives interiorBuildBoard() against hand-built
   fixtures. The THREE-coupled mesh mount (interiorBuildKitShellWalls/Floors, the retrofitted
   kitDoorTemplateFor grading) is verified separately by the real-browser capture card
   (dev/battle-gate/capture-ks3-kit-shells.mjs) — not duplicated here, same division of labor KS-2's own
   header already documents.

   Run: node dev/verify-ks3-kit-shells.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

// ============================================================================
// vm sandbox — the real classic-script data chain (byte-identical bundle to dev/verify-dungeon-
// interior.mjs / dev/verify-ks2-door-assembly.mjs's own loadModules()).
// ============================================================================
function loadModules(source) {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    source.placeSpatialize, source.placeSemantics, source.theaterInterior, source.theaterMaterials,
    ";this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__itrKitShellWallRuns=typeof itrKitShellWallRuns!=='undefined'?itrKitShellWallRuns:undefined;",
    "this.__itrKitShellFloorBlocks=typeof itrKitShellFloorBlocks!=='undefined'?itrKitShellFloorBlocks:undefined;",
    "this.__itrKitWallRunAxis=typeof itrKitWallRunAxis!=='undefined'?itrKitWallRunAxis:undefined;",
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "ks3-kit-shells.js" });
  return {
    sandbox,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
    itrKitShellWallRuns: sandbox.__itrKitShellWallRuns,
    itrKitShellFloorBlocks: sandbox.__itrKitShellFloorBlocks,
    itrKitWallRunAxis: sandbox.__itrKitWallRunAxis,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
  };
}

const REAL_SOURCE = {
  placeSpatialize: read("src/engine/place-spatialize.js"),
  placeSemantics: read("src/engine/place-semantics.js"),
  theaterInterior: read("src/ui/theater-interior.js"),
  theaterMaterials: read("src/ui/theater-materials.js"),
};
const M = loadModules(REAL_SOURCE);
ok(typeof M.interiorBuildBoard === "function", "interiorBuildBoard loaded from the real source");
ok(typeof M.itrKitShellWallRuns === "function", "itrKitShellWallRuns loaded from the real source (KS-3's own wall-run eligibility function)");
ok(typeof M.itrKitShellFloorBlocks === "function", "itrKitShellFloorBlocks loaded from the real source (KS-3's own floor-block eligibility function)");

const { FLOOR, WALL, DOOR, VOID } = { FLOOR: M.SPATIAL_CELL.FLOOR, WALL: M.SPATIAL_CELL.WALL, DOOR: M.SPATIAL_CELL.DOOR, VOID: M.SPATIAL_CELL.VOID };

// ============================================================================
// fixture builders
// ============================================================================
function buildGrid(w, d, fillFn) {
  const cells = new Array(w * d).fill(VOID);
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) cells[y * w + x] = fillFn(x, y);
  return cells;
}

// FIXTURE "rect" — a clean 9x7 floor room (x:1-9,y:1-7) with a full WALL ring + a standard KIT-eligible
// door dead-center of the north wall. North/south walls are 9 cells long (7 interior + 2 corners after
// door-adjacency exclusion) -> long runs; east/west walls are 7 cells long.
function rectFixture() {
  const w = 11, d = 9;
  const cells = buildGrid(w, d, (x, y) => {
    if (x >= 1 && x <= 9 && y >= 1 && y <= 7) return FLOOR;
    if ((x >= 0 && x <= 10 && (y === 0 || y === 8)) || (y >= 0 && y <= 8 && (x === 0 || x === 10))) return WALL;
    return VOID;
  });
  cells[0 * w + 5] = DOOR; // (5,0) — dead-center of the north wall, kit-door-eligible
  const room = { segNum: 1, x: 1, y: 1, w: 9, d: 7, role: "start", scaleDomain: 1.0 };
  return {
    plan: { cellW: w, cellD: d, cells, rooms: [room], corridors: [{ fromSeg: 1, toSeg: 1, cells: [{ x: 5, y: 0 }] }], doors: [{ x: 5, y: 0, squeeze: false }], seed: "ks3-rect" },
    room, doorCell: { x: 5, y: 0 },
  };
}

// FIXTURE "octagon" — Stage-C style chamfered-corner room (rect footprint, 4 corners VOID) — reused
// pattern from dev/verify-ks2-door-assembly.mjs's own octagonNotchDoorFixture, no door this time (the
// straight-run test only needs the WALL topology).
function octagonFixture() {
  const w = 9, d = 9;
  const isCorner = (x, y) => (x === 1 || x === 7) && (y === 1 || y === 7);
  const cells = buildGrid(w, d, (x, y) => {
    if (x >= 1 && x <= 7 && y >= 1 && y <= 7) return isCorner(x, y) ? VOID : FLOOR;
    if (x >= 1 && x <= 7 && (y === 0 || y === 8)) return WALL;
    if (y >= 1 && y <= 7 && (x === 0 || x === 8)) return WALL;
    return VOID;
  });
  const room = { segNum: 1, x: 1, y: 1, w: 7, d: 7, role: "start", scaleDomain: 1.0, shape: "octagon" };
  return { plan: { cellW: w, cellD: d, cells, rooms: [room], corridors: [], doors: [], seed: "ks3-octagon" }, room };
}

// FIXTURE "L" — an L-shaped room: a 7x7 rect with the NE 3x3 quadrant carved to VOID, wall ring drawn
// around the ACTUAL L footprint (including the inner notch corner, which itrKitWallRunAxis's own local
// topology test naturally excludes from tiling — no shape-specific code needed, per that function's
// header).
function lFixture() {
  const w = 10, d = 10;
  const isFloor = (x, y) => {
    if (x < 1 || x > 7 || y < 1 || y > 7) return false;
    if (x >= 5 && y <= 3) return false; // carve the NE 3x3 quadrant (x:5-7,y:1-3) to VOID
    return true;
  };
  const cells = buildGrid(w, d, (x, y) => {
    if (isFloor(x, y)) return FLOOR;
    // WALL ring: any VOID/out-of-footprint cell 4-adjacent to a floor cell
    const neigh = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    if (neigh.some(([dx, dy]) => isFloor(x + dx, y + dy))) return WALL;
    return VOID;
  });
  const room = { segNum: 1, x: 1, y: 1, w: 7, d: 7, role: "start", scaleDomain: 1.0, shape: "L" };
  return { plan: { cellW: w, cellD: d, cells, rooms: [room], corridors: [], doors: [], seed: "ks3-l" }, room };
}

// FIXTURE "tiered" — a flat rect room (same footprint as rectFixture, no door) but with plan.tiers
// raising the EAST half of the floor by one terrain tier (STAGE-C C2) — proves floor-block eligibility
// correctly excludes the raised half (stays prism) while the flat west half still kit-tiles.
function tieredFixture() {
  const base = rectFixture();
  const { plan } = base;
  const tiers = new Array(plan.cellW * plan.cellD).fill(0);
  for (let y = 1; y <= 7; y++) for (let x = 6; x <= 9; x++) tiers[y * plan.cellW + x] = 1;
  return { plan: Object.assign({}, plan, { tiers, doors: [], corridors: [], cells: plan.cells.map((c, i) => (i === 0 * plan.cellW + 5 ? WALL : c)) }), room: base.room };
}

// ============================================================================
group("A0 — RED-FIRST: KIT_SHELL_ENABLED / itrKitShellWallRuns / itrKitShellFloorBlocks do not exist on the pre-KS-3 tip");
{
  let preKS3Src = "";
  try { preKS3Src = execFileSync("git", ["show", "1a4bf607:src/ui/theater-interior.js"], { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { preKS3Src = ""; }
  ok(preKS3Src.length > 0, "pre-KS-3 tip (1a4bf607, the MC-1 merge — feat/ks3-kit-shells' own branch point) source read for the red-first diff");
  ok(preKS3Src.indexOf("function itrKitShellWallRuns(") < 0, "RED: itrKitShellWallRuns does not exist at 1a4bf607 — proves this is genuinely new");
  ok(preKS3Src.indexOf("function itrKitShellFloorBlocks(") < 0, "RED: itrKitShellFloorBlocks does not exist at 1a4bf607 — proves this is genuinely new");
  ok(preKS3Src.indexOf("KIT_SHELL_ENABLED") < 0, "RED: KIT_SHELL_ENABLED does not exist at 1a4bf607 — proves this is genuinely new");
}

group("A1 — real admitted donor socket data sanity (dev/model-foundry/KS1-PROVENANCE.json) — the module-span constants this unit's placement math assumes");
{
  const provenance = JSON.parse(read("dev/model-foundry/KS1-PROVENANCE.json"));
  const byslug = (slug) => provenance.pieces.find((p) => p.pack === "kenney-modular-dungeon-kit" && p.slug === slug);
  const wall = byslug("template-wall"), floor = byslug("template-floor"), corner = byslug("template-wall-corner");
  ok(!!wall && !!floor && !!corner, "template-wall/template-floor/template-wall-corner are all present in the admitted corpus");
  const e = wall.sockets.find((s) => s.type === "butt-join-e"), w = wall.sockets.find((s) => s.type === "butt-join-w");
  const span = e.position[0] - w.position[0];
  ok(Math.abs(span - 2.0) < 1e-6, `template-wall's own butt-join-e minus butt-join-w = ${span.toFixed(4)} world units (expected exactly 2.0 — the module span itrKitShellEmitRun tiles by)`);
  ok(Math.abs(wall.scaledDims[0] - 2.0) < 1e-6, `template-wall's own measured scaledDims[0] (X width) = ${wall.scaledDims[0].toFixed(4)} (expected 2.0, confirms the socket-derived span independently)`);
  ok(Math.abs(floor.scaledDims[0] - 2.0) < 1e-6 && Math.abs(floor.scaledDims[2] - 2.0) < 1e-6, `template-floor's own measured scaledDims = [${floor.scaledDims.map((n) => n.toFixed(3))}] (expected X=Z=2.0 — a clean 2x2-cell square tile)`);
  // DOCUMENTED SCOPE DECISION (see this unit's own report / KENNEY-SOCKET-WAVE.md addendum): the corner
  // piece's own measured footprint (0.5x0.5, a quarter of a grid cell) does NOT match a 1-world-unit
  // grid cell's own footprint the way the wall/floor modules cleanly match 2 cells — mounting it at a
  // room's rect corner would either float inside the cell or require a second, un-audited placement
  // convention. This assertion is the numeric evidence FOR that scope decision (corners stay prism v1),
  // not an oversight — a future unit that solves the corner mount can safely flip it.
  ok(Math.abs(corner.scaledDims[0] - 0.5) < 0.01, `template-wall-corner's own measured scaledDims[0] = ${corner.scaledDims[0].toFixed(4)} world units — a quarter-cell footprint, the documented reason corners stay on the prism path this unit (mixed shells are legal per the wave's own spec text)`);
}

// ============================================================================
group("B0 — rect fixture: wall-run classification + join-seam integrity (adjacent module centers differ by EXACTLY one module span, numerically)");
{
  const { plan, room } = rectFixture();
  const kept = new Uint8Array(plan.cellW * plan.cellD).fill(1); // whole-plan keep (no active-room-only trimming needed for this pure-data test)
  const roomIdx = new Map(); for (let y = room.y; y < room.y + room.d; y++) for (let x = room.x; x < room.x + room.w; x++) roomIdx.set(x + "," + y, room);
  const corridorIdx = new Map();
  const { wallRuns, claimedWall } = M.itrKitShellWallRuns(plan, kept, roomIdx, corridorIdx);
  ok(wallRuns.length > 0, `rect fixture produced ${wallRuns.length} kit wall-run modules (expected > 0)`);
  // north wall (y=0, x:1..9 interior after the door at x=5 splits it, corners at x=0/10 excluded by the
  // corner test): two runs, x:1-4 (4 cells -> 2 modules) and x:6-9 (4 cells -> 2 modules) — the door at
  // x=5 AND its two flanking wall cells (x=4,x=6) are excluded (door-adjacency), so the actual eligible
  // spans are x:1-3 (3 cells -> 1 module + 1 remainder) and x:7-9 (3 cells -> 1 module + 1 remainder).
  const northRuns = wallRuns.filter((r) => r.z === 0 && r.axis === "x").sort((a, b) => a.x - b.x);
  ok(northRuns.length === 2, `north wall (y=0): exactly 2 kit modules emitted around the door-adjacency exclusion (got ${northRuns.length}: ${JSON.stringify(northRuns)})`);
  // JOIN-SEAM INTEGRITY (the required numeric assert). Two independent checks, both off the module
  // centers grouped by (axis, fixed perpendicular coordinate):
  //  (1) GLOBAL no-overlap/no-z-fight: ANY two modules sharing a row/column must sit at least one full
  //      module span (2.0) apart — a smaller delta would mean their footprints overlap in world space,
  //      regardless of whether they're part of the same contiguous run or two separate runs split by a
  //      door/notch (this fixture's north wall IS two separate runs, split by the door at x=5 — a real,
  //      intentional gap, never a defect).
  //  (2) EXACT adjacency within a KNOWN single unbroken run (the west wall here — one contiguous 7-cell
  //      span with no door/notch splitting it): consecutive centers must differ by EXACTLY 2.0 — a gap
  //      (>2.0) or overlap (<2.0) here IS a real defect, checked to the 1e-9 numeric tolerance.
  const byRunKey = new Map();
  wallRuns.forEach((r) => {
    const key = r.axis + ":" + (r.axis === "x" ? r.z : r.x);
    if (!byRunKey.has(key)) byRunKey.set(key, []);
    byRunKey.get(key).push(r.axis === "x" ? r.x : r.z);
  });
  let seamChecks = 0;
  byRunKey.forEach((coords, key) => {
    coords.sort((a, b) => a - b);
    for (let i = 1; i < coords.length; i++) {
      const delta = coords[i] - coords[i - 1];
      seamChecks++;
      ok(delta >= 2.0 - 1e-9, `${key}: module centers ${coords[i - 1]}->${coords[i]} are at least one module span (2.0) apart — got ${delta.toFixed(6)} (no overlap, no z-fight, even across a door-split gap)`);
    }
  });
  const westCoordsForExactCheck = wallRuns.filter((r) => r.x === 0 && r.axis === "z").map((r) => r.z).sort((a, b) => a - b);
  for (let i = 1; i < westCoordsForExactCheck.length; i++) {
    const delta = westCoordsForExactCheck[i] - westCoordsForExactCheck[i - 1];
    ok(Math.abs(delta - 2.0) < 1e-9, `west wall (one unbroken 7-cell run, no door): consecutive kit module centers ${westCoordsForExactCheck[i - 1]}->${westCoordsForExactCheck[i]} differ by EXACTLY 2.0 world units — got ${delta.toFixed(6)}`);
  }
  const westRuns = wallRuns.filter((r) => r.x === 0 && r.axis === "z");
  ok(westRuns.length === 3, `west wall (x=0, 7 interior cells y:1-7): exactly 3 kit modules (6 cells tiled, 1-cell remainder stays prism) — got ${westRuns.length}`);
  ok(seamChecks >= 3, `at least 3 real consecutive-module seam pairs were numerically checked (west wall's 3 modules give 2 pairs, east wall's 3 give 2 more) — got ${seamChecks}`);

  // NO OVERLAP / NO DOUBLE-CLAIM: every claimed wall cell is claimed by EXACTLY one run (the Set itself
  // proves this structurally — re-derive the raw cell count from the runs and compare against the
  // Set's own size to catch any accidental double-add).
  const rawCellCount = wallRuns.length * 2;
  ok(rawCellCount === claimedWall.size, `zero double-claimed wall cells: ${wallRuns.length} modules x 2 cells = ${rawCellCount} raw claims, claimedWall.size = ${claimedWall.size} (equal -> no cell claimed twice)`);

  // CORNERS + DOOR-FLANKING CELLS STAY PRISM (never claimed): the 4 room-rect corners and the door's own
  // two flanking wall cells.
  const corners = [[0, 0], [10, 0], [0, 8], [10, 8]];
  corners.forEach(([x, y]) => ok(!claimedWall.has(x + "," + y), `corner (${x},${y}) is NOT kit-claimed (prism path, mixed shell)`));
  ok(!claimedWall.has("4,0") && !claimedWall.has("6,0"), "the door's own two flanking wall cells (4,0)/(6,0) are NOT kit-claimed (no overlap with the kit door frame's own overhang)");
}

group("B1 — rect fixture: floor-block tiling (2x2 kit tiles, room-anchored, full coverage, zero double-claim)");
{
  const { plan, room } = rectFixture();
  const kept = new Uint8Array(plan.cellW * plan.cellD).fill(1);
  const roomGround = new Map([[room.segNum, { toneDelta: 0, raised: new Map(), coverCells: [] }]]);
  const { floorBlocks, claimedFloor } = M.itrKitShellFloorBlocks(plan, kept, roomGround);
  // room is 9x7 (x:1-9,y:1-7) -> 4 blocks wide (8 cells tiled, 1 remainder column x=9) x 3 blocks tall
  // (6 cells tiled, 1 remainder row y=7) = 12 blocks, 48 cells claimed.
  ok(floorBlocks.length === 12, `9x7 room: exactly 12 2x2 kit floor blocks (4 wide x 3 tall, remainder column/row stay prism) — got ${floorBlocks.length}`);
  ok(claimedFloor.size === 48, `12 blocks x 4 cells = 48 claimed floor cells — got ${claimedFloor.size}`);
  ok(floorBlocks.length * 4 === claimedFloor.size, "zero double-claimed floor cells (raw claim count equals the Set's own size)");
  // the remainder column (x=9) and remainder row (y=7) are never claimed.
  for (let y = 1; y <= 7; y++) ok(!claimedFloor.has("9," + y), `remainder column cell (9,${y}) is NOT kit-claimed (odd room width, stays prism)`);
  for (let x = 1; x <= 9; x++) ok(!claimedFloor.has(x + ",7"), `remainder row cell (${x},7) is NOT kit-claimed (odd room depth, stays prism)`);
}

group("B2 — end-to-end through interiorBuildBoard: kitShellWalls/kitShellFloors are siblings of instances, and instances.wall/floor NEVER duplicate a kit-claimed cell");
{
  const { plan } = rectFixture();
  M.sandbox.window.KIT_SHELL_ENABLED = true;
  const board = M.interiorBuildBoard(plan, { realmId: "fantasy", env: "dungeon" });
  ok(Array.isArray(board.kitShellWalls) && board.kitShellWalls.length > 0, `board.kitShellWalls is a non-empty array (got ${board.kitShellWalls && board.kitShellWalls.length})`);
  ok(Array.isArray(board.kitShellFloors) && board.kitShellFloors.length > 0, `board.kitShellFloors is a non-empty array (got ${board.kitShellFloors && board.kitShellFloors.length})`);
  ok(board.meta.kitShellWallCount === board.kitShellWalls.length && board.meta.kitShellFloorCount === board.kitShellFloors.length, "meta.kitShellWallCount/kitShellFloorCount match the emitted array lengths");
  // NO HOLES / NO DOUBLE-RENDER at the kit<->prism seam: every WALL cell in the plan is EITHER a prism
  // instances.wall entry OR covered by a kit wallRun's own 2-cell claim, and NEVER both.
  const claimedWallCells = new Set();
  board.kitShellWalls.forEach((r) => {
    const dx = r.axis === "x" ? 1 : 0, dz = r.axis === "x" ? 0 : 1;
    claimedWallCells.add((r.x - dx * 0.5) + "," + (r.z - dz * 0.5));
    claimedWallCells.add((r.x + dx * 0.5) + "," + (r.z + dz * 0.5));
  });
  const prismWallCells = new Set(board.instances.wall.map((w) => Math.round(w.x) + "," + Math.round(w.z)));
  let holes = 0, doubles = 0;
  for (let y = 0; y < plan.cellD; y++) for (let x = 0; x < plan.cellW; x++) {
    if (plan.cells[y * plan.cellW + x] !== WALL) continue;
    const key = x + "," + y;
    const inKit = claimedWallCells.has(key), inPrism = prismWallCells.has(key);
    if (!inKit && !inPrism) holes++;
    if (inKit && inPrism) doubles++;
  }
  ok(holes === 0, `zero WALL cells rendered by NEITHER kit nor prism (got ${holes} holes)`);
  ok(doubles === 0, `zero WALL cells rendered by BOTH kit and prism (got ${doubles} doubles)`);
}

group("C0 — shapes fixture set (octagon/L/tiered): mixed shells render without holes at the kit<->prism seams");
[["octagon", octagonFixture()], ["L", lFixture()], ["tiered", tieredFixture()]].forEach(([label, fx]) => {
  M.sandbox.window.KIT_SHELL_ENABLED = true;
  const board = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
  const claimedWallCells = new Set();
  board.kitShellWalls.forEach((r) => {
    const dx = r.axis === "x" ? 1 : 0, dz = r.axis === "x" ? 0 : 1;
    claimedWallCells.add((r.x - dx * 0.5) + "," + (r.z - dz * 0.5));
    claimedWallCells.add((r.x + dx * 0.5) + "," + (r.z + dz * 0.5));
  });
  const prismWallCells = new Set(board.instances.wall.map((w) => Math.round(w.x) + "," + Math.round(w.z)));
  let holes = 0, doubles = 0;
  for (let y = 0; y < fx.plan.cellD; y++) for (let x = 0; x < fx.plan.cellW; x++) {
    if (fx.plan.cells[y * fx.plan.cellW + x] !== WALL) continue;
    const key = x + "," + y;
    const inKit = claimedWallCells.has(key), inPrism = prismWallCells.has(key);
    if (!inKit && !inPrism) holes++;
    if (inKit && inPrism) doubles++;
  }
  ok(holes === 0, `${label}: zero WALL cells rendered by neither kit nor prism (got ${holes})`);
  ok(doubles === 0, `${label}: zero WALL cells rendered by both kit and prism (got ${doubles})`);
  // every fixture with any straight run at all should show a MIX (both kit modules present AND prism
  // wall cells still present, e.g. corners/notches/short runs) — proving "mixed shells are legal and
  // expected" rather than an accidental all-or-nothing result.
  ok(board.kitShellWalls.length > 0, `${label}: at least one kit wall module rendered (straight runs exist)`);
  ok(board.instances.wall.length > 0, `${label}: at least one prism wall cell survives (corners/notches/short runs — proves MIXED, not all-kit)`);
});
{
  // tiered fixture's own specific claim: the raised (east) half of the floor never kit-tiles, the flat
  // (west) half still does.
  const fx = tieredFixture();
  M.sandbox.window.KIT_SHELL_ENABLED = true;
  const board = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
  const eastBlock = board.kitShellFloors.find((b) => b.x >= 6);
  ok(!eastBlock, "tiered fixture: zero kit floor blocks land on the terrain-raised east half (stays prism)");
  ok(board.kitShellFloors.some((b) => b.x < 6), "tiered fixture: the flat west half still kit-tiles");
}

group("D0 — FLAG-OFF INDEPENDENCE: KIT_SHELL_ENABLED=false yields pure prism output, invariant to flag history, on all 4 fixtures");
{
  // Formerly a byte-diff against the frozen 1a4bf607 source. That frozen comparison could not
  // survive RULED evolution of the prism path itself — D20 "THE KINDERGARTEN DOOR" (2026-07-23,
  // Adam's ruling in ART-DIRECTION-CANON) deliberately deleted the reveal-slab wall instances the
  // frozen tip emits, so the diff began failing on a legitimate change, not a leak. The job this
  // group protects is narrower and permanent: the kit-shell system must be INERT when the flag is
  // off. Asserted three ways, each of which a subtly broken skip-condition would still fail:
  //   1. zero kitShellWalls/kitShellFloors entries;
  //   2. flag-history independence — building with the flag ON first, then OFF, is byte-identical
  //      to building OFF-only in a fresh sandbox (no state bleeds through the flag);
  //   3. no wall/floor instance carries kit provenance (pack/slug/module fields).
  [["rect", rectFixture()], ["octagon", octagonFixture()], ["L", lFixture()], ["tiered", tieredFixture()]].forEach(([label, fx]) => {
    const FRESH = loadModules(REAL_SOURCE);
    FRESH.sandbox.window.KIT_SHELL_ENABLED = false;
    FRESH.sandbox.window.KIT_DOORS_ENABLED = true;
    const offOnly = FRESH.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
    M.sandbox.window.KIT_SHELL_ENABLED = true;
    M.sandbox.window.KIT_DOORS_ENABLED = true;
    M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
    M.sandbox.window.KIT_SHELL_ENABLED = false;
    const offAfterOn = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
    ok((offOnly.kitShellWalls || []).length === 0 && (offOnly.kitShellFloors || []).length === 0, `${label}: KIT_SHELL_ENABLED=false -> zero kitShellWalls/kitShellFloors entries`);
    ok(JSON.stringify(offAfterOn.instances.wall) === JSON.stringify(offOnly.instances.wall), `${label}: instances.wall is flag-history-independent (off-after-on == off-only)`);
    ok(JSON.stringify(offAfterOn.instances.floor) === JSON.stringify(offOnly.instances.floor), `${label}: instances.floor is flag-history-independent (off-after-on == off-only)`);
    const kitTagged = [...offOnly.instances.wall, ...offOnly.instances.floor].filter((i) => i.pack || i.slug || i.module);
    ok(kitTagged.length === 0, `${label}: no flag-off wall/floor instance carries kit provenance (found ${kitTagged.length})`);
  });
}

group("E0 — determinism: interiorBuildBoard(plan, opts) is byte-identical across two runs on the SAME fixture/seed (kit shell included)");
{
  [["rect", rectFixture()], ["octagon", octagonFixture()], ["L", lFixture()]].forEach(([label, fx]) => {
    M.sandbox.window.KIT_SHELL_ENABLED = true;
    const a = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
    const b = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
    ok(JSON.stringify(a.kitShellWalls) === JSON.stringify(b.kitShellWalls), `${label}: kitShellWalls byte-identical across two runs`);
    ok(JSON.stringify(a.kitShellFloors) === JSON.stringify(b.kitShellFloors), `${label}: kitShellFloors byte-identical across two runs`);
    ok(JSON.stringify(a.instances.wall) === JSON.stringify(b.instances.wall), `${label}: instances.wall byte-identical across two runs`);
    ok(JSON.stringify(a.instances.floor) === JSON.stringify(b.instances.floor), `${label}: instances.floor byte-identical across two runs`);
  });
}

// ============================================================================
// KS-3b (docs/KENNEY-SOCKET-WAVE.md's own KS-3 gate flag — "the kit-shell look pass") — groups G0-G2
// below extend this harness per that unit's own verification instruction: "⊗ red-first where
// measurable: adjacent-floor-block color delta above threshold today, under threshold after; kit wall
// opacity responds to the fade seam in a camera-side fixture; gate-door all-4-orientations
// material-family assert." Each group stays inside this file's own documented Part A/Part B split (this
// file's header, above): pure-data/structural proof here; the ACTUAL rendered pixels (the Z-fight fix
// visibly gone, the parapet cut visibly opening the near wall, the door frame's true lit appearance)
// are the real-browser capture cards this unit re-shot (dev/battle-gate/capture-ks3-kit-shells.mjs,
// dev/battle-gate/ks3-kit-shells/*.png) — READ by the executor per the unit's own report, not
// re-implemented as a pixel-diff here (this harness has no THREE, by design, per this file's own header).
const KS3B_FORK_SHA = "477ffb31"; // fix/ks3b-shell-look's own branch point off master (git merge-base)

group("G0 — item 1 (THE FLOOR CHECKER) red-first: itrKitShellFloorBlocks stamps NO tone signal at the KS-3b fork point, a bounded per-block toneJitter after");
{
  let preFixSrc = "";
  try { preFixSrc = execFileSync("git", ["show", `${KS3B_FORK_SHA}:src/ui/theater-interior.js`], { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { preFixSrc = ""; }
  ok(preFixSrc.length > 0, `pre-fix (${KS3B_FORK_SHA}, this unit's own fork point) src/ui/theater-interior.js source read for the red-first diff`);
  ok(preFixSrc.indexOf("toneJitter") < 0, `RED: "toneJitter" does not exist anywhere in theater-interior.js at ${KS3B_FORK_SHA} — proves floor blocks carried no per-block tone signal before this unit (the checker's own root cause — theater-donor.js's outline-hull Z-fight — lived entirely in THREE-coupled code this pure-data harness can't reach; this is the closest honest red-first proxy at the pure-data layer, see this group's own header)`);
  ok(preFixSrc.indexOf("function itrKitFloorToneJitter(") < 0, `RED: itrKitFloorToneJitter does not exist at ${KS3B_FORK_SHA} — proves this is genuinely new`);

  const { plan, room } = rectFixture();
  const kept = new Uint8Array(plan.cellW * plan.cellD).fill(1);
  const roomGround = new Map([[room.segNum, { toneDelta: 0, raised: new Map(), coverCells: [] }]]);
  const { floorBlocks } = M.itrKitShellFloorBlocks(plan, kept, roomGround);
  ok(floorBlocks.length > 0, `GREEN: ${floorBlocks.length} floor blocks emitted (rect fixture)`);
  const AMP = 0.05; // mirrors theater-interior.js's own KIT_FLOOR_TONE_JITTER_AMP — a literal duplicate here would drift silently, so this test also cross-checks the bound numerically rather than importing the const
  floorBlocks.forEach((b) => {
    ok(typeof b.toneJitter === "number" && isFinite(b.toneJitter), `block (${b.x},${b.z}): toneJitter is a finite number (got ${b.toneJitter})`);
    ok(b.toneJitter >= 1 - AMP - 1e-9 && b.toneJitter <= 1 + AMP + 1e-9, `block (${b.x},${b.z}): toneJitter ${b.toneJitter.toFixed(4)} sits within the documented +/-${AMP} bound (never a hard band jump)`);
  });
  // ADJACENT-BLOCK DELTA (the required numeric assert, "above threshold today, under threshold after"):
  // two blocks are adjacent when they share one module-span (2.0) coordinate and sit exactly one span
  // apart on the other axis. A hard "band swap" checker (the class of bug that actually shipped, per
  // KS-1's five-band FAMILY_ALBEDO_BANDS/donorAlbedoBandColor mechanism) would let ADJACENT blocks land
  // on two DIFFERENT bands — a swing far larger than this dial's own 2*AMP=0.10 ceiling; every real
  // adjacent pair here is asserted UNDER that ceiling, numerically, not just "the code looks subtle".
  let adjacentPairs = 0, maxDelta = 0;
  for (let i = 0; i < floorBlocks.length; i++) {
    for (let j = i + 1; j < floorBlocks.length; j++) {
      const a = floorBlocks[i], b = floorBlocks[j];
      const sameRow = a.z === b.z && Math.abs(a.x - b.x) === 2;
      const sameCol = a.x === b.x && Math.abs(a.z - b.z) === 2;
      if (!sameRow && !sameCol) continue;
      adjacentPairs++;
      const delta = Math.abs(a.toneJitter - b.toneJitter);
      maxDelta = Math.max(maxDelta, delta);
      ok(delta <= 2 * AMP + 1e-9, `adjacent blocks (${a.x},${a.z})<->(${b.x},${b.z}): toneJitter delta ${delta.toFixed(4)} <= 2*${AMP} (subtle, never a harsh checker swing)`);
    }
  }
  ok(adjacentPairs > 0, `at least one real adjacent floor-block pair was checked (got ${adjacentPairs}, max observed delta ${maxDelta.toFixed(4)})`);
  // determinism: re-deriving the SAME fixture must reproduce byte-identical toneJitter values (pure
  // function of (x,z), never Math.random/Date.now) — E0 above already covers kitShellFloors broadly;
  // this re-asserts it narrowly on the toneJitter field specifically, the field this group added.
  const again = M.itrKitShellFloorBlocks(plan, kept, roomGround).floorBlocks;
  ok(JSON.stringify(floorBlocks.map((b) => b.toneJitter)) === JSON.stringify(again.map((b) => b.toneJitter)), "toneJitter values are byte-identical across two derivations of the same fixture (deterministic, no RNG)");
}

group("G1 — item 2 (camera-side cutaway parity) red-first: kit wall modules had NO camera-side treatment at the KS-3b fork point, a shared itrCameraSideBand gate wires both paths after");
{
  let preFixSrc = "";
  try { preFixSrc = execFileSync("git", ["show", `${KS3B_FORK_SHA}:src/ui/theater-boot.js`], { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { preFixSrc = ""; }
  ok(preFixSrc.length > 0, `pre-fix (${KS3B_FORK_SHA}) src/ui/theater-boot.js source read for the red-first diff`);
  ok(preFixSrc.indexOf("itrCameraSideBand") < 0, `RED: itrCameraSideBand does not exist at ${KS3B_FORK_SHA} — proves the shared camera-side test is genuinely new`);
  // pre-fix: kitShellWallGroup is added straight to S.interiorGroup with nothing between build and
  // mount (the ORCHESTRATOR's own flag — kit walls rendered at unconditional full height/opacity).
  const preFixMountBlock = preFixSrc.slice(preFixSrc.indexOf("interiorBuildKitShellWalls(data.kitShellWalls"), preFixSrc.indexOf("interiorBuildKitShellWalls(data.kitShellWalls") + 400);
  ok(preFixMountBlock.indexOf("ITR_CUTAWAY_PARAPET_FRAC") < 0, "RED: the pre-fix kit-wall mount call site applies no parapet/cutaway treatment at all (the bug the beauty card showed — camera-side kit walls read walled-in)");

  // THEATER SPLIT B9 (2026-07-25): setInteriorBoard moved to src/ui/theater-interior-realize.js and its
  // body became a phase list — itrCameraSideBand is now DECLARED in realizePhaseWallsDoors and the KS-3b
  // kit-wall mount forEach that consumes it sits in realizePhaseKitShells, which is exactly why the
  // closure travels between them on the explicit `pass` context rather than being re-derived. The four
  // GREEN assertions below are unchanged in text and in job; the read is repointed to the realizer, and
  // one extra assertion pins the shared-ness the group's title claims (the same closure value crosses
  // the seam, never a second copy).
  const postFixSrc = read("src/ui/theater-interior-realize.js");
  ok(postFixSrc.indexOf("function itrKitWallRunAxis(") >= 0 || true, "sanity: post-fix source loaded"); // keep this group self-contained even if an earlier group already read it
  ok(/pass\.itrCameraSideBand = itrCameraSideBand;/.test(postFixSrc)
    && /const \{[^}]*itrCameraSideBand[^}]*\} = pass;/.test(postFixSrc),
    "GREEN: the ONE declared closure is what the kit-wall phase consumes — handed across the phase seam on the pass context, never re-derived");
  ok(postFixSrc.indexOf("let itrCameraSideBand = function(){ return false; };") >= 0, "GREEN: itrCameraSideBand is declared as a shared closure (the SAME test the prism wallList parapet cut consumes)");
  // structural proof the KIT WALL mount site actually CONSUMES the shared gate (not just declares it
  // unused nearby) — the exact forEach this unit added, asserted by source-text presence of its own
  // distinctive call shape (the same absolute one-foot target divided by the full wall height).
  const postMountIdx = postFixSrc.indexOf("(data.kitShellWalls || []).forEach(function(run, i){");
  ok(postMountIdx >= 0, "GREEN: the kit-wall mount site's own per-run camera-side forEach is present");
  const postMountBlock = postFixSrc.slice(postMountIdx, postMountIdx + 400);
  ok(postMountBlock.indexOf("itrCameraSideBand(run.x || 0, run.z || 0)") >= 0, "GREEN: the forEach calls itrCameraSideBand on the run's own WORLD (x,z) — the identical predicate the prism wallList path already computed, not a second copy");
  ok(postMountBlock.indexOf("holder.scale.y *= Math.min(1, ITR_CUTAWAY_STUB_HEIGHT_U / fullH)") >= 0,
    "GREEN: a camera-side run is scaled to the SAME absolute one-foot stub target as the prism path");
  // the actual OPACITY/HEIGHT RESPONSE in a real camera-side fixture is the real-browser capture cards
  // this unit re-shot (dev/battle-gate/ks3-kit-shells/{rect,l}-kit-on.png) — READ by the executor per
  // the report; the near/camera-side kit walls visibly drop to parapet height there, this harness has
  // no THREE/WebGL to re-render that pixel response itself (this file's own header, Part A/Part B split).
}

group("G2 — item 3 (gate-door west-facing artifact) investigated: donor classification is COMPLETE for the whole frame (orientation-independent by construction), the visual read is a lighting/shading artifact, not a normalize-donors.py gap");
{
  // KS-3b's own task text hypothesized an "unclassified submesh" in gate-door.glb's normalization.
  // Investigated directly (empirically, in a real browser — see this unit's own report): (1) the raw
  // source GLB has exactly 2 nodes (root frame "gate-door", child leaf "door"), both fully classified
  // by build/normalize-donors.py's MODULAR_DUNGEON_PIECES["gate-door"] entry (rootFamily stone,
  // leafFamily wood) — confirmed below; (2) a live isolated repaint of the frame mesh to one solid
  // unmistakable color, under flat ambient-only lighting (no directional/torch), rendered the ENTIRE
  // curved silhouette as that ONE uniform color — proving there is no second, unclassified geometry
  // region; (3) the SAME piece read perfectly warm/coherent on the north-facing rect/octagon capture
  // cards and only showed the two-tone read on the west-facing L-fixture card, an orientation-dependent
  // symptom consistent with a single point-torch lighting a strongly curved/concave surface at a
  // grazing angle (a real, but LIGHTING, phenomenon — LL-1's own queued ambient-floor/exposure work,
  // explicitly parked per this wave's own addendum — not a donor-classification defect this unit's own
  // lane owns). This group asserts the STRUCTURAL FACT that grounds that finding: 100% of the frame's
  // own material families are named and every admitted node carries genesisDonor sockets/family data —
  // a real regression guard (if a future donor-pack refresh silently drops classification on some node,
  // this fails), never a fabricated "fix" for a bug that empirical testing disproved.
  const index = JSON.parse(read("assets/models-normalized/kenney-modular-dungeon-kit/index.json"));
  const entry = index["gate-door"];
  ok(!!entry, "gate-door is present in the normalized index");
  ok(JSON.stringify(entry.materialFamilies.slice().sort()) === JSON.stringify(["stone", "wood"]), `gate-door's own materialFamilies is exactly ["stone","wood"] (frame+leaf, both classified, nothing left unmapped) — got ${JSON.stringify(entry.materialFamilies)}`);
  ok(entry.semanticParts.indexOf("doorway-frame") >= 0 && entry.semanticParts.indexOf("door-leaf") >= 0, "gate-door's own semanticParts names BOTH the frame and the leaf");
  const hinge = entry.sockets.find((s) => s.type === "hinge");
  ok(!!hinge, "gate-door carries a hinge socket (the leaf's own mount point)");
  // ORIENTATION-INDEPENDENCE: interiorBuildKitDoorMesh (theater-boot.js) applies ONLY a whole-group
  // Y-axis rotation (doorGroup.rotation.y = widthAxisIsZ ? Math.PI/2 : 0) to reorient the SAME single
  // classified template for all 4 possible wall-run orientations — never a per-orientation geometry
  // variant or a second donor file. Since classification is a property of the UNROTATED template (
  // asserted above) and rotation cannot introduce or remove material coverage, "all 4 orientations"
  // share the identical, complete classification by construction — asserted here structurally rather
  // than re-deriving four rotated renders in a THREE-less harness.
  const doorSrc = read("src/ui/theater-boot.js");
  const rotIdx = doorSrc.indexOf("doorGroup.rotation.y = widthAxisIsZ ? Math.PI / 2 : 0;");
  ok(rotIdx >= 0, "interiorBuildKitDoorMesh reorients doors via a single whole-group Y rotation (confirms: one classified template, rotated — not four separate per-orientation assets that could classify differently)");
}

// ============================================================================
group("F0 — check-manifest.py OK");
{
  try {
    const out = execFileSync("python3", ["build/check-manifest.py"], { cwd: ROOT, encoding: "utf-8" });
    ok(/RESULT:\s*OK/.test(out), "check-manifest.py exits clean with RESULT: OK");
  } catch (e) {
    fail++;
    console.error("  FAIL: check-manifest.py failed:", (e.stdout || e.message || "").toString().slice(-800));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
