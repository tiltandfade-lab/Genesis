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
  try { preKS3Src = execFileSync("git", ["show", "c6ed1fcb:src/ui/theater-interior.js"], { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { preKS3Src = ""; }
  ok(preKS3Src.length > 0, "pre-KS-3 tip (c6ed1fcb, the MC-1 merge — feat/ks3-kit-shells' own branch point) source read for the red-first diff");
  ok(preKS3Src.indexOf("function itrKitShellWallRuns(") < 0, "RED: itrKitShellWallRuns does not exist at c6ed1fcb — proves this is genuinely new");
  ok(preKS3Src.indexOf("function itrKitShellFloorBlocks(") < 0, "RED: itrKitShellFloorBlocks does not exist at c6ed1fcb — proves this is genuinely new");
  ok(preKS3Src.indexOf("KIT_SHELL_ENABLED") < 0, "RED: KIT_SHELL_ENABLED does not exist at c6ed1fcb — proves this is genuinely new");
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

group("D0 — FLAG-OFF BYTE-IDENTITY: KIT_SHELL_ENABLED=false reproduces the PRE-KS-3 (c6ed1fcb) prism-only output exactly, on all 4 fixtures");
{
  // load a SECOND, independent sandbox off the pre-KS-3 tip's own theater-interior.js — the strongest
  // form of this check: not just "kitShellWalls/Floors are empty" (which could pass even with a subtly
  // broken skip-condition) but a real structural diff of instances.wall/instances.floor against the
  // ACTUAL prior source, on every fixture this file defines.
  let preKS3Interior;
  try { preKS3Interior = execFileSync("git", ["show", "c6ed1fcb:src/ui/theater-interior.js"], { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { preKS3Interior = null; }
  ok(!!preKS3Interior, "pre-KS-3 theater-interior.js source read for the flag-off comparison");
  if (preKS3Interior) {
    const PRE = loadModules(Object.assign({}, REAL_SOURCE, { theaterInterior: preKS3Interior }));
    [["rect", rectFixture()], ["octagon", octagonFixture()], ["L", lFixture()], ["tiered", tieredFixture()]].forEach(([label, fx]) => {
      M.sandbox.window.KIT_SHELL_ENABLED = false;
      M.sandbox.window.KIT_DOORS_ENABLED = true;
      const post = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
      PRE.sandbox.window.KIT_DOORS_ENABLED = true;
      const pre = PRE.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
      ok(JSON.stringify(post.instances.wall) === JSON.stringify(pre.instances.wall), `${label}: KIT_SHELL_ENABLED=false -> instances.wall byte-identical to the pre-KS-3 (c6ed1fcb) output`);
      ok(JSON.stringify(post.instances.floor) === JSON.stringify(pre.instances.floor), `${label}: KIT_SHELL_ENABLED=false -> instances.floor byte-identical to the pre-KS-3 (c6ed1fcb) output`);
      ok((post.kitShellWalls || []).length === 0 && (post.kitShellFloors || []).length === 0, `${label}: KIT_SHELL_ENABLED=false -> zero kitShellWalls/kitShellFloors entries`);
    });
  }
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
