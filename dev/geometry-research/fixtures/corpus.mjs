/* dev/geometry-research/fixtures/corpus.mjs — UNIT G0 (docs/GEOMETRY-OSS-INTEGRATION.md §17.3).

   The golden fixture corpus: GEOMETRY-OSS-INTEGRATION.md §11's 28-fixture minimum corpus (F01-F28)
   PLUS GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.3's 20 bakeoff-specific fixture classes (B01-B20).

   Every fixture is plain data shaped to the shared input contract (GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §4.1):
     { fixtureId, roomId, cells:[{x,z,tier,isDoor,sourceRef}], terrain, apertures, renderShape,
       wallProfile }
   plus a G0-added `expected` block of INDEPENDENTLY computed geometric truths (geometry-truth.mjs —
   pure grid combinatorics, no polygon library, no theater-room-mesh.js) and bookkeeping (`mergeBlocker`,
   `notes`, `knownRed`).

   These are TRUTHS, not snapshots of legacy behavior. Where a fixture's expected truth is known to
   disagree with the CURRENT production path (the row-101 sunken-arena collapse — see
   ROW101_SUNKEN_COLLAPSE_NOTE below), the fixture still declares the correct truth; `knownRed` names
   the adapter that is expected to fail it today. Never edit a fixture's `expected` block to make an
   adapter pass — see CLAUDE.md's "validators preserve the thing's job" discipline.

   wallProfile numbers below are the reference defaults mirrored (as of 2026-07-12) from
   src/ui/theater-room-mesh.js's own DEFAULT_WALL_* constants — copied as literal numbers, NOT imported,
   so this module stays free of any adapter-module dependency (a fixture is plain data; only the harness
   imports theater-room-mesh.js). If those defaults drift, this copy goes stale — that's a harness-owned
   drift risk, flagged in the G0 report, not a fixture-purity violation. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  rectangle, oneCell, corridor, lShape, tShape, crossShape, octagon, ellipse, rotunda, cave, neck,
  cornerTouch, islands, annulus, twoHoles, nestedRing, dais, pitAtWall, addDoor, translate, reflect,
} from "./builders.mjs";
import { areaOf, tierTruth, seededShuffle } from "./geometry-truth.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const REFERENCE_WALL_PROFILE = Object.freeze({
  thickness: 0.22,
  stemHeight: 0.28,
  capHeight: 0.06,
  capOverhang: 0.035,
  footing: 0.06,
  miterLimit: 4, // conservative default pending G1's own miter-limit calibration; not a theater-room-mesh.js constant today (chamferRunCorners/diagonalizeStaircaseRing have their own internal clamps) — flagged in the G0 report.
});

let _autoId = 0;
function makeFixture(spec) {
  const cells = spec.cells;
  const apertureCellCount = cells.filter((c) => c.isDoor).length;
  // areaTolerance: GEOMETRY-OSS-INTEGRATION.md §7.3 requires every render transform to "preserve...
  // area drift beyond its declared tolerance" — a diagonal chamfer or radial smoothing LEGITIMATELY
  // shaves/adds boundary area vs the raw cell count (measured live during this unit's own authoring:
  // octagon(12,12) smoothShape:"octagon" -> 119.5 vs 120.0 raw cell area, a real ~0.4% miter-cut, not a
  // defect). An identity (unsmoothed) renderShape has NO excuse for area drift — its tolerance stays at
  // floating-point epsilon. A smoothed renderShape gets a generous declared 5% band; anything drifting
  // past that in the baseline report is a genuine finding, not smoothing noise.
  const renderShape = spec.renderShape || "identity";
  const areaTolerance = renderShape === "identity" ? 1e-6 : Math.max(1e-6, areaOf(cells) * 0.05);
  const expected = spec.expected || {
    area: areaOf(cells),
    areaTolerance,
    tiers: tierTruth(cells),
    apertureCellCount,
    apertureRecordCount: (spec.apertures || []).length,
  };
  if (spec.expected && expected.areaTolerance === undefined) expected.areaTolerance = areaTolerance;
  return {
    fixtureId: spec.fixtureId,
    roomId: spec.roomId || spec.fixtureId,
    cells,
    terrain: spec.terrain || [],
    apertures: spec.apertures || [],
    renderShape: spec.renderShape || "identity",
    wallProfile: spec.wallProfile || REFERENCE_WALL_PROFILE,
    expected,
    mergeBlocker: !!spec.mergeBlocker,
    knownRed: spec.knownRed || null, // { adapter: "...", reason: "..." } | null
    malformed: !!spec.malformed,
    notes: spec.notes || "",
  };
}

// ─── row-101 exact canonical fixture (F18, MERGE BLOCKER) ───────────────────────────────────────
// Captured LIVE from the real production engine 2026-07-12 (src/engine/place-spatialize.js's
// spatializePlan, via the SAME vm-sandbox technique dev/verify-stage-c-terrain.mjs uses) into
// dev/geometry-research/fixtures/row101-live-dump.json, and loaded here VERBATIM (never hand-
// transcribed — a first hand-transcription attempt during this unit's own authoring silently
// dropped/misplaced 4 ring cells; reading the captured JSON directly removes that whole error
// class). Engine table row 101 "Grand Octagon", real "Dungeon Area Type" table roll:
//   dims: "60' x 60'"
//   side: "30' x 30' sunken central arena (5 ft below the surrounding level); 10' wide raised ring
//          walkway with iron railing."
// spatializePlan resolved this to a 12x12 octagon-rasterized room (room.shape==='octagon',
// room.w===12, room.d===12, 120 real floor cells after the 4-corner chamfer), a 36-cell (6x6)
// centered arena patch at logical tier -5 (kind:'pit'), and a 60-cell perimeter-ring patch at
// logical tier +1 (kind:'dais', footprint:'ring'). The remaining 24 cells are the untouched
// baseline floor (tier 0). Coordinates are re-based LOCAL to the room's own (0,0) origin
// (room.x/room.y subtracted) so this fixture is portable/pure — no engine re-invocation at import
// time, no THREE, no DOM.
const ROW101_DUMP = JSON.parse(readFileSync(join(HERE, "row101-live-dump.json"), "utf-8"));
function buildRow101() {
  const rx = ROW101_DUMP.x, ry = ROW101_DUMP.y;
  const arenaPatch = ROW101_DUMP.terrain.find((t) => t.tier === -5);
  const ringPatch = ROW101_DUMP.terrain.find((t) => t.footprint === "ring");
  const arenaKeys = new Set(arenaPatch.cells.map((c) => `${c.x - rx},${c.y - ry}`));
  const ringKeys = new Set(ringPatch.cells.map((c) => `${c.x - rx},${c.y - ry}`));
  return ROW101_DUMP.cells.map((c) => {
    const x = c.x - rx, z = c.y - ry, k = `${x},${z}`;
    if (arenaKeys.has(k)) return { x, z, tier: -4, isDoor: false, sourceRef: { table: "row101", patch: "arena", rawTierSteps: -5, rawSy: -0.8 } };
    if (ringKeys.has(k)) return { x, z, tier: 2, isDoor: false, sourceRef: { table: "row101", patch: "ring", rawTierSteps: 1, rawSy: 0.4 } };
    return { x, z, tier: 1, isDoor: false, sourceRef: { table: "row101", patch: "baseline", rawTierSteps: 0, rawSy: 0.2 } };
  });
}
const ROW101_CELLS = buildRow101();
// sanity-checked at module load (not a silent trust of the dump/transform):
if (ROW101_CELLS.length !== 120) throw new Error(`row-101 fixture: expected 120 cells, got ${ROW101_CELLS.length}`);
{
  const byTier = new Map();
  ROW101_CELLS.forEach((c) => byTier.set(c.tier, (byTier.get(c.tier) || 0) + 1));
  const arenaCount = byTier.get(-4) || 0, ringCount = byTier.get(2) || 0, baseCount = byTier.get(1) || 0;
  if (arenaCount !== 36 || ringCount !== 60 || baseCount !== 24) {
    throw new Error(`row-101 fixture: expected arena=36/ring=60/baseline=24, got arena=${arenaCount}/ring=${ringCount}/baseline=${baseCount}`);
  }
}

export const ROW101_SUNKEN_COLLAPSE_NOTE =
  "row-101 RED-FIRST: theater-boot.js:8888 `const sy = (typeof f.sy === 'number' && f.sy > 0) ? f.sy " +
  ": ITR_FLOOR_HEIGHT_FALLBACK;` discards any NEGATIVE f.sy (a legitimately sunken tile) and falls back " +
  "to the flat floor height — the arena patch's real sy=-0.8 never survives this guard, so the production " +
  "shellCells builder emits the arena at the SAME quantized tier as the baseline floor (tier=1, not the " +
  "true tier=-4), collapsing the sunken arena into the surrounding floor. See " +
  "dev/verify-geometry-fixtures.mjs's productionShellCellsAdapter for the live reproduction.";

// ─── FIXTURE ASSEMBLY ────────────────────────────────────────────────────────────────────────────
export const FIXTURES = [];

// F01-F06: primitive footprints
FIXTURES.push(makeFixture({ fixtureId: "F01-one-cell", cells: oneCell(), notes: "single cell — minimum legal floor." }));
FIXTURES.push(makeFixture({ fixtureId: "F02-2x2-rect", cells: rectangle(2, 2) }));
FIXTURES.push(makeFixture({ fixtureId: "F03-long-corridor", cells: corridor(20, { axis: "x" }), notes: "20-cell 1-wide corridor." }));
FIXTURES.push(makeFixture({ fixtureId: "F04-concave-L", cells: lShape(8, 8), renderShape: "identity" }));
FIXTURES.push(makeFixture({ fixtureId: "F05-T-room", cells: tShape(9, 9) }));
FIXTURES.push(makeFixture({ fixtureId: "F06-cross-room", cells: crossShape(9, 9) }));

// F07/F08: octagon — MERGE BLOCKERS
FIXTURES.push(makeFixture({
  fixtureId: "F07-chamfered-octagon", cells: octagon(12, 12), renderShape: "octagon", mergeBlocker: true,
  notes: "canonical chamfered octagon (k=floor(12*0.3)=3), the S-hook regression's own footprint (see B20).",
}));
{
  const octCells = octagon(12, 12);
  // pick a chamfer-edge cell on the diagonal-adjacent boundary run near the top-left corner for the door.
  const doorCell = octCells.find((c) => c.x + c.z === 3 && c.x > 0 && c.x < 3); // one of the true diagonal-run cells
  const withDoor = doorCell ? addDoor(octCells, doorCell.x, doorCell.z) : octCells;
  FIXTURES.push(makeFixture({
    fixtureId: "F08-octagon-diagonal-doorway", cells: withDoor, renderShape: "octagon", mergeBlocker: true,
    apertures: doorCell ? [{ id: "f08-door", sourceEdgeRefs: [`${doorCell.x},${doorCell.z}`], width: 1, state: "open", sourceRef: "F08" }] : [],
    notes: "doorway on a chamfered diagonal run, not an axis-aligned wall.",
  }));
}

// F09: raster rotunda before/after render smoothing (2 fixtures sharing one cell set)
{
  const rot = rotunda(10);
  FIXTURES.push(makeFixture({ fixtureId: "F09a-rotunda-raw", cells: rot, renderShape: "identity", notes: "raster rotunda, canonical (pre-smooth) contour." }));
  FIXTURES.push(makeFixture({ fixtureId: "F09b-rotunda-smoothed", cells: rot, renderShape: "radial", notes: "SAME cell set, render-smoothed contour requested — canonical truths (area/tier/hole) must stay byte-identical to F09a; only the render transform differs." }));
}

FIXTURES.push(makeFixture({ fixtureId: "F10-ellipse-unequal-axes", cells: ellipse(16, 8), renderShape: "radial" }));
FIXTURES.push(makeFixture({ fixtureId: "F11-cave-noisy-boundary", cells: cave(14, 14, 1), renderShape: "identity" }));
FIXTURES.push(makeFixture({ fixtureId: "F12-neck-two-lobes", cells: neck(4, 4, 3), notes: "1-cell-wide neck joining two 4x4 lobes." }));
FIXTURES.push(makeFixture({ fixtureId: "F13-corner-touch", cells: cornerTouch(3), notes: "two 3x3 squares touching only at one corner — MUST resolve to 2 polygons (no diagonal bridge)." }));
FIXTURES.push(makeFixture({ fixtureId: "F14-two-islands", cells: islands(3, 4), notes: "two fully disconnected 3x3 islands." }));
FIXTURES.push(makeFixture({ fixtureId: "F15-donut-one-hole", cells: annulus(9, 3), mergeBlocker: true }));
FIXTURES.push(makeFixture({ fixtureId: "F16-outer-two-holes", cells: twoHoles(13, 3) }));
FIXTURES.push(makeFixture({
  fixtureId: "F17-nested-ring-sunken-arena", cells: nestedRing(10, 2, 1, -3), mergeBlocker: true,
  terrain: [
    { id: "f17-ring", tier: 1, cells: nestedRing(10, 2, 1, -3).filter((c) => c.tier === 1).map((c) => ({ x: c.x, z: c.z })), sourceRef: "F17" },
    { id: "f17-arena", tier: -3, cells: nestedRing(10, 2, 1, -3).filter((c) => c.tier === -3).map((c) => ({ x: c.x, z: c.z })), sourceRef: "F17" },
  ],
  notes: "raised ring around a sunken arena, generic (non-row-101) synthetic case.",
}));
FIXTURES.push(makeFixture({
  fixtureId: "F18-row101-exact-canonical", cells: ROW101_CELLS, renderShape: "octagon", mergeBlocker: true,
  terrain: [
    // narrative tier STEPS as spatializePlan rolled them (rooms[].terrain[].tier — before
    // ROOM_SHELL_TIER_QUANTUM quantization; the corresponding quantized floor `tier` values live on
    // `cells[].tier` above, -4/2/1, per `sourceRef.rawTierSteps`).
    { id: "row101-arena", tier: -5, cells: ROW101_CELLS.filter((c) => c.sourceRef.patch === "arena").map((c) => ({ x: c.x, z: c.z })), sourceRef: "Dungeon Area Type row 101, arena clause" },
    { id: "row101-ring", tier: 1, cells: ROW101_CELLS.filter((c) => c.sourceRef.patch === "ring").map((c) => ({ x: c.x, z: c.z })), sourceRef: "Dungeon Area Type row 101, ring clause" },
  ],
  knownRed: { adapter: "productionShellCells", reason: ROW101_SUNKEN_COLLAPSE_NOTE },
  notes: "THE NEGATIVE CONTROL. Real engine-captured row-101 Grand Octagon: 120-cell octagon room, " +
    "36-cell sunken arena (canonical tier -4 after ROOM_SHELL_TIER_QUANTUM quantization), 60-cell raised " +
    "ring (canonical tier 2), 24-cell baseline floor (canonical tier 1). Passes through compileRoomShellData " +
    "directly (legacy adapter); FAILS through productionShellCellsAdapter, which replicates theater-boot.js's " +
    "real f.sy>0 guard bug.",
}));
FIXTURES.push(makeFixture({ fixtureId: "F19-dais-two-levels", cells: dais(8, 8, 4, 4, 2) }));
FIXTURES.push(makeFixture({ fixtureId: "F20-pit-at-wall", cells: pitAtWall(8, 8, 3, 3, -2), notes: "sunken patch flush against an outer wall, not centered." }));

// F21: duplicate cell input
{
  const base = rectangle(3, 3);
  const withDupes = base.concat(base.slice(0, 3)); // repeat the first row of input rows
  FIXTURES.push(makeFixture({ fixtureId: "F21-duplicate-cell-input", cells: withDupes, notes: "input array literally repeats 3 of its own 9 cells — expected area must still read 9, not 12." }));
}

// F22: shuffled cell order x100 seeded permutations — MERGE BLOCKER
{
  const base = rectangle(6, 6);
  const permutations = [];
  for (let seed = 1; seed <= 100; seed++) permutations.push(seededShuffle(base, seed));
  FIXTURES.push(makeFixture({
    fixtureId: "F22-shuffled-order-x100", cells: base, mergeBlocker: true,
    notes: "base 6x6 fixture; `permutations` (100 seeded deterministic shuffles of the SAME cell set) " +
      "carried as fixture metadata below — every permutation must normalize to byte-identical output.",
    expected: { area: areaOf(base), tiers: tierTruth(base), apertureCellCount: 0, apertureRecordCount: 0, permutationCount: permutations.length },
  }));
  FIXTURES[FIXTURES.length - 1].permutations = permutations;
}

// F23: adjacent door cells forming a wide aperture
{
  let cells = rectangle(6, 4);
  cells = addDoor(cells, 2, 0);
  cells = addDoor(cells, 3, 0);
  FIXTURES.push(makeFixture({
    fixtureId: "F23-wide-aperture-adjacent-doors", cells,
    apertures: [{ id: "f23-wide-door", sourceEdgeRefs: ["2,0", "3,0"], width: 2, state: "open", sourceRef: "F23" }],
    notes: "two edge-adjacent door cells on the same straight wall — one wide 2-cell aperture, not two narrow ones.",
  }));
}

// F24: door at a concave corner
{
  let cells = lShape(8, 8);
  const splitX = Math.round(8 / 2), splitZ = Math.round(8 / 2);
  const concaveCorner = { x: splitX - 1, z: splitZ - 1 }; // the cell at the L's own inner (concave) elbow
  cells = addDoor(cells, concaveCorner.x, concaveCorner.z);
  FIXTURES.push(makeFixture({
    fixtureId: "F24-door-at-concave-corner", cells,
    apertures: [{ id: "f24-door", sourceEdgeRefs: [`${concaveCorner.x},${concaveCorner.z}`], width: 1, state: "open", sourceRef: "F24" }],
    notes: "door cell sits at the L-room's own concave (inner) elbow.",
  }));
}

FIXTURES.push(makeFixture({ fixtureId: "F25-tiny-room-canonical-minimum", cells: rectangle(4, 4), notes: "SPATIAL_MIN_CELL=4 floor — the smallest room the sizing clamp ever produces; must render at true size, never silently enlarged." }));

// F26: malformed inputs — must return diagnostics, never throw
FIXTURES.push(makeFixture({
  fixtureId: "F26a-malformed-empty", cells: [], malformed: true,
  expected: { area: 0, tiers: {}, apertureCellCount: 0, apertureRecordCount: 0, diagnosticExpected: true },
  notes: "empty cells array — legacy must return a typed empty/diagnostic result, never throw.",
}));
FIXTURES.push(makeFixture({
  fixtureId: "F26b-malformed-nan-coord", cells: [{ x: NaN, z: 0, tier: 0, isDoor: false }, { x: 0, z: 0, tier: 0, isDoor: false }], malformed: true,
  expected: { area: 1, tiers: { 0: { area: 1, polygons: 1, holes: 0 } }, apertureCellCount: 0, apertureRecordCount: 0, diagnosticExpected: true },
  notes: "one cell carries a NaN x — legacy must diagnose/skip it, never throw or silently corrupt the other cell's geometry.",
}));
FIXTURES.push(makeFixture({
  fixtureId: "F26c-malformed-non-numeric-tier", cells: [{ x: 0, z: 0, tier: "roof", isDoor: false }], malformed: true,
  expected: { area: 1, tiers: {}, apertureCellCount: 0, apertureRecordCount: 0, diagnosticExpected: true },
  notes: "non-numeric tier field — theater-room-mesh.js's own tierOf() coerces any non-number tier to 0 (documented fallback, not a throw); truth intentionally tracks that coercion rather than the literal 'roof' bucket.",
}));

FIXTURES.push(makeFixture({ fixtureId: "F27-large-room-near-max", cells: rectangle(24, 24), notes: "SPATIAL_MAX_CELL=24 — largest room the sizing clamp ever produces (Massive Cavern row 145, 120'/5=24)." }));
FIXTURES.push(makeFixture({
  fixtureId: "F28-overloaded-scene-geometry-unchanged", cells: rectangle(10, 10),
  notes: "an 'overloaded visual scene' fixture is a CARD-DEALING/composition concern (docs/WALK-CARD-DEALING.md), not a geometry concern — this fixture's geometric truth is byte-identical to a bare 10x10 rectangle; G0 asserts overload declarations never perturb floor/wall geometry. Card placement is out of scope for the pure geometry harness.",
}));

// ─── B01-B20: GEOMETRY-ACCELERATION-TOOLCHAIN §4.3 bakeoff-specific additions ───────────────────
FIXTURES.push(makeFixture({ fixtureId: "B01-convex-45-corner", cells: octagon(8, 8), notes: "convex 45-degree corner at normal wall thickness (octagon chamfer at small scale)." }));
{
  // acute corner near the miter-limit threshold: chamfer TWO cells deep on only the top-left corner of
  // a rectangle (a sharper cut than octagon()'s uniform 4-corner 0.3 ratio), leaving the other 3 corners
  // square — isolates ONE acute join for miter-limit testing.
  const w = 10, d = 10, k = 4; // sharper than octagon()'s own k for this size (would be floor(10*0.3)=3)
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) { if (x + z < k) continue; cells.push({ x, z, tier: 0, isDoor: false, sourceRef: { builder: "acute-corner" } }); }
  FIXTURES.push(makeFixture({ fixtureId: "B02-acute-corner-near-miter-limit", cells, notes: "one sharp single-corner chamfer (k=4 on a 10x10), the other 3 corners stay square." }));
}
FIXTURES.push(makeFixture({ fixtureId: "B03-concave-90-corner", cells: lShape(6, 6) }));
{
  // concave 45-degree notch: an 8x8 square with a single diagonal notch cut from the middle of one edge.
  const w = 8, d = 8;
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
    const notch = (x - 4) + (z - 0) < -1 && z < 2 && x < 5; // small diagonal nick near the top edge
    if (notch) continue;
    cells.push({ x, z, tier: 0, isDoor: false, sourceRef: { builder: "concave-notch" } });
  }
  FIXTURES.push(makeFixture({ fixtureId: "B04-concave-45-notch", cells }));
}
FIXTURES.push(makeFixture({ fixtureId: "B05-alternating-cave-boundary", cells: cave(16, 16, 2), notes: "second cave seed for a more irregular convex/concave-alternating boundary than F11." }));
{
  let cells = rectangle(8, 4);
  cells = addDoor(cells, 4, 0);
  FIXTURES.push(makeFixture({ fixtureId: "B06-doorway-centered-straight-wall", cells, apertures: [{ id: "b06-door", sourceEdgeRefs: ["4,0"], width: 1, state: "open", sourceRef: "B06" }] }));
}
{
  const octCells = octagon(12, 12);
  // find a straight-wall cell immediately adjacent to a diagonal-run cell (the join, not the diagonal itself).
  const diagCell = octCells.find((c) => c.x + c.z === 2); // deep in the chamfer run
  const straightNeighbor = diagCell ? octCells.find((c) => c.x === diagCell.x + 1 && c.z === diagCell.z && c.x + c.z >= 3) : null;
  const target = straightNeighbor || diagCell;
  const withDoor = target ? addDoor(octCells, target.x, target.z) : octCells;
  FIXTURES.push(makeFixture({ fixtureId: "B07-doorway-diagonal-to-straight-join", cells: withDoor, renderShape: "octagon", apertures: target ? [{ id: "b07-door", sourceEdgeRefs: [`${target.x},${target.z}`], width: 1, state: "open", sourceRef: "B07" }] : [] }));
}
{
  let cells = rectangle(8, 4);
  cells = addDoor(cells, 1, 0);
  cells = addDoor(cells, 2, 0);
  // cell (3,0) stays solid — the "narrow pier" — then another aperture pair
  cells = addDoor(cells, 4, 0);
  cells = addDoor(cells, 5, 0);
  FIXTURES.push(makeFixture({
    fixtureId: "B08-two-apertures-narrow-pier", cells,
    apertures: [
      { id: "b08-door-a", sourceEdgeRefs: ["1,0", "2,0"], width: 2, state: "open", sourceRef: "B08" },
      { id: "b08-door-b", sourceEdgeRefs: ["4,0", "5,0"], width: 2, state: "open", sourceRef: "B08" },
    ],
    notes: "two 2-cell apertures on the same wall separated by exactly one solid pier cell (3,0).",
  }));
}
{
  let cells = rectangle(6, 4);
  for (let x = 0; x < 6; x++) cells = addDoor(cells, x, 0); // the ENTIRE z=0 wall is open
  FIXTURES.push(makeFixture({ fixtureId: "B09-full-width-open-edge", cells, apertures: [{ id: "b09-open-edge", sourceEdgeRefs: cells.filter((c) => c.z === 0).map((c) => `${c.x},0`), width: 6, state: "open", sourceRef: "B09" }] }));
}
{
  let cells = rectangle(8, 4);
  cells = addDoor(cells, 3, 0);
  FIXTURES.push(makeFixture({ fixtureId: "B10-sconce-beside-aperture", cells, apertures: [{ id: "b10-door", sourceEdgeRefs: ["3,0"], width: 1, state: "open", sourceRef: "B10" }], notes: "prop (sconce) placement is a mount-slot/material concern, out of G0's pure-geometry scope — this fixture only proves the wall segment ADJACENT to a door still exists and is a legal mount host; sconce instancing itself belongs to a later graphics unit." }));
}
FIXTURES.push(makeFixture({ fixtureId: "B11-octagon-minimum-size", cells: octagon(6, 6), renderShape: "octagon", notes: "smallest octagon before rasterizeShape's own k-clamp collapses the chamfer." }));
FIXTURES.push(makeFixture({ fixtureId: "B12-octagon-grand-room-size", cells: octagon(20, 20), renderShape: "octagon", notes: "representative 'grand room' scale octagon (row-101's own 12x12 is mid-size by comparison)." }));
FIXTURES.push(makeFixture({
  fixtureId: "B13-annular-railing-around-pit", cells: nestedRing(12, 1, 1, -2),
  terrain: [
    { id: "b13-railing", tier: 1, cells: nestedRing(12, 1, 1, -2).filter((c) => c.tier === 1).map((c) => ({ x: c.x, z: c.z })), sourceRef: "B13" },
    { id: "b13-pit", tier: -2, cells: nestedRing(12, 1, 1, -2).filter((c) => c.tier === -2).map((c) => ({ x: c.x, z: c.z })), sourceRef: "B13" },
  ],
  notes: "a THIN (1-cell) annular railing band, distinct from F17's 2-cell ring — tests the minimum legal riser band width.",
}));
{
  // multiple disconnected tier islands: 3 separate 3x3 islands, each at a DIFFERENT elevation tier.
  const a = rectangle(3, 3).map((c) => ({ ...c, tier: 1, sourceRef: { builder: "tier-island-a" } }));
  const b = rectangle(3, 3).map((c) => ({ x: c.x + 6, z: c.z, tier: -1, isDoor: false, sourceRef: { builder: "tier-island-b" } }));
  const cIsland = rectangle(3, 3).map((c) => ({ x: c.x, z: c.z + 6, tier: 2, isDoor: false, sourceRef: { builder: "tier-island-c" } }));
  FIXTURES.push(makeFixture({ fixtureId: "B14-multiple-disconnected-tier-islands", cells: [...a, ...b, ...cIsland], notes: "3 fully disconnected 3x3 islands at 3 distinct tiers (+1,-1,+2)." }));
}
{
  const base = rectangle(4, 4);
  const farPos = translate(base, 100000, 100000);
  const farNeg = translate(base, -100000, -100000);
  FIXTURES.push(makeFixture({ fixtureId: "B15a-translated-far-positive", cells: farPos, notes: "same 4x4 fixture translated to (+100000,+100000) — canonical truths must be translation-invariant." }));
  FIXTURES.push(makeFixture({ fixtureId: "B15b-translated-far-negative", cells: farNeg, notes: "same 4x4 fixture translated to (-100000,-100000)." }));
}
{
  const base = octagon(8, 8);
  const permutations = [];
  for (let seed = 1; seed <= 100; seed++) permutations.push(seededShuffle(base, seed));
  FIXTURES.push(makeFixture({
    fixtureId: "B16-shuffled-octagon-x100", cells: base,
    notes: "octagon(8,8) under 100 seeded shuffles — a second, shaped (non-rectangular) determinism fixture distinct from F22's plain rectangle.",
  }));
  FIXTURES[FIXTURES.length - 1].permutations = permutations;
}
FIXTURES.push(makeFixture({
  fixtureId: "B17-tiny-wall-thickness", cells: rectangle(6, 6),
  wallProfile: Object.assign({}, REFERENCE_WALL_PROFILE, { thickness: 0.05 }),
  notes: "minimum legal wall thickness (0.05) on an otherwise plain room — geometry truths (floor area/tiers) are UNCHANGED by wallProfile; only wall-derivation checks (G3) consume this field.",
}));
FIXTURES.push(makeFixture({
  fixtureId: "B18-max-wall-thickness", cells: rectangle(6, 6),
  wallProfile: Object.assign({}, REFERENCE_WALL_PROFILE, { thickness: 1.5 }),
  notes: "maximum supported wall thickness (1.5) — same floor cell set as B17, thickness is the only variable.",
}));
{
  // intentionally malformed self-touching contour: two 3x3 blocks that share exactly ONE cell (a true
  // grid "bowtie" — one connected component under 4-adjacency via that single shared cell, but its
  // TRACED BOUNDARY touches itself at that cell's own corners, a real self-intersection risk for any
  // ring-based triangulator).
  const a = rectangle(3, 3);
  const b = rectangle(3, 3).map((c) => ({ x: c.x + 2, z: c.z + 2, tier: 0, isDoor: false, sourceRef: { builder: "bowtie-b" } }));
  const cells = [...a, ...b]; // shared cell (2,2) appears in both blocks' own local footprints
  FIXTURES.push(makeFixture({
    fixtureId: "B19-malformed-self-touching-bowtie", cells, malformed: true,
    notes: "two 3x3 blocks pinched through exactly one shared cell (2,2) — a legal single connected " +
      "component whose traced boundary ring self-touches at that cell's corners. Must return diagnostics " +
      "or a validated fallback, never a self-intersecting triangulation.",
  }));
}
FIXTURES.push(makeFixture({
  fixtureId: "B20-s-hook-octagon-regression-capture", cells: octagon(12, 12), renderShape: "octagon",
  notes: "the SAME footprint as F07, captured explicitly as the historical S-hook chamfer regression " +
    "(GEOMETRY-OSS-INTEGRATION.md §8's own acceptance-test fixture). C4.1a (2026-07-12, commit range " +
    "around 3573aadf..HEAD) already landed diagonalizeStaircaseRing's miter fix — dev/verify-octagon-miter.mjs " +
    "proves this GREEN against the current tree. Per this unit's own instructions, the row-101 sunken-arena " +
    "collapse (F18) is used as G0's negative control instead; this fixture is kept as a non-merge-blocker " +
    "regression tripwire, not the RED-FIRST proof.",
}));

export const MERGE_BLOCKER_IDS = FIXTURES.filter((f) => f.mergeBlocker).map((f) => f.fixtureId);
export const FIXTURES_BY_ID = new Map(FIXTURES.map((f) => [f.fixtureId, f]));
