#!/usr/bin/env node
/* dev/verify-wall-runs-oss-fuzz.mjs — broader UNIT G3 stabilization review.

   This supplements the five named wall-run fixtures with connected, production-shaped cell sets.
   Each generated case is compiled through the real compileRoomShellData(..., {roomShellPolygonKernel:
   "oss"}) boundary, including the same diagonalize/radial-smooth transforms and aperture derivation
   used by the renderer. The property requires finite output, total canonical cell coverage, and no
   degraded/unintended wall join. A fixed seed makes failures reproducible and fast-check's normal
   shrink path produces a small room when the property fails.

   A truly acute hand-authored contour is retained as a dedicated fixture. G3's contract calls for a
   bevel at acute/unstable corners; polygon-kernel.js's offsetOneRun now KEEPS that Clipper2-injected
   bevel (ring-adjacency detection distinguishes a legitimate bevel edge from a genuine discontinuity —
   docs/STAGE-G3-WALL-RUNS.md's own "bevel for acute/unstable" branch) instead of discarding the whole
   run to the legacy per-segment offset. The acute check below now asserts the GREEN condition (bevel
   kept, zero degrade, classified `bevel`) — see the negative control immediately after it, which proves
   this harness still DETECTS the old defect shape: calling PolygonKernel.wallOffset with the explicit
   `miterOnly` escape hatch (offsetOneRun's own negative-control-only parameter, never set by production
   code) reproduces the PRE-FIX behavior on the identical fixture and must still show red.

   Run: node dev/verify-wall-runs-oss-fuzz.mjs */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadFastCheck } from "./geometry-research/fuzz/require-tools.mjs";
import { connectedCellSetArbitrary } from "./geometry-research/fuzz/arbitraries.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { fc, version } = await loadFastCheck();
const mesh = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
const PK = await import(pathToFileURL(join(ROOT, "src/ui/geometry/polygon-kernel.js")).href);
const { compileRoomShellData, computeOssWallOuterOffsets, DEFAULT_WALL_THICKNESS,
  DEFAULT_WALL_CAP_OVERHANG, DEFAULT_WALL_FOOTING } = mesh;

const SEED = Number(process.env.G3_FUZZ_SEED || 730031);
const NUM_RUNS = Number(process.env.G3_FUZZ_RUNS || 5000);
let pass = 0, fail = 0;
const check = (name, cond, detail = "") => cond
  ? (pass++, console.log("  ✓", name))
  : (fail++, console.log("  ✗", name, "—", typeof detail === "string" ? detail : JSON.stringify(detail)));

function boundaryCells(cells) {
  const keys = new Set(cells.map((c) => `${c.x},${c.z}`));
  return cells.filter((c) => [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .some(([dx, dz]) => !keys.has(`${c.x + dx},${c.z + dz}`)));
}

function scenarioArbitrary() {
  return connectedCellSetArbitrary(fc, { minMoves: 2, maxMoves: 110 }).chain((rawCells) => {
    const boundary = boundaryCells(rawCells);
    return fc.record({
      doorMode: fc.integer({ min: 0, max: 3 }),
      doorPick: fc.nat({ max: Math.max(0, boundary.length - 1) }),
      secondPick: fc.nat({ max: Math.max(0, boundary.length - 1) }),
      tier: fc.integer({ min: -4, max: 4 }),
    }).map(({ doorMode, doorPick, secondPick, tier }) => {
      const doorKeys = new Set();
      if (doorMode > 0 && boundary.length) doorKeys.add(`${boundary[doorPick % boundary.length].x},${boundary[doorPick % boundary.length].z}`);
      if (doorMode > 2 && boundary.length) doorKeys.add(`${boundary[secondPick % boundary.length].x},${boundary[secondPick % boundary.length].z}`);
      return rawCells.map((c) => ({ ...c, tier, isDoor: doorKeys.has(`${c.x},${c.z}`) }));
    });
  });
}

function finiteBundle(bundle) {
  const buffers = [bundle.floor, bundle.wallStem, bundle.wallUpper, bundle.wallTrim, bundle.floorDetail];
  return buffers.every((buf) => !buf || (buf.positions || []).every(Number.isFinite));
}

console.log(`fast-check ${version}; seed=${SEED}; cases=${NUM_RUNS}`);
let fuzzFailure = null;
try {
  fc.assert(fc.property(scenarioArbitrary(), (cells) => {
    const bundle = compileRoomShellData(cells, { roomShellPolygonKernel: "oss" });
    const wallDiags = (bundle.ossDiagnostics || []).filter((d) => d.typed === "wall-run-offset");
    const bad = wallDiags.filter((d) => d.degraded || d.joinGapCount > 0 || d.matchedSegments !== d.segmentCount);
    const coverage = Object.keys(bundle.cellTriangleMap || {}).length === new Set(cells.map((c) => `${c.x},${c.z}`)).size;
    if (!finiteBundle(bundle) || !coverage || bad.length) {
      throw new Error(JSON.stringify({ cells, finite: finiteBundle(bundle), coverage, bad }));
    }
    return true;
  }), { seed: SEED, numRuns: NUM_RUNS, endOnFailure: true });
} catch (error) {
  fuzzFailure = error;
}
check(`production-shaped fuzz: ${NUM_RUNS} connected rooms remain finite, covered, and non-degraded`, !fuzzFailure,
  fuzzFailure && fuzzFailure.message);

const acute = [
  { a: { x: 0, z: 0 }, b: { x: 6, z: 0 }, kind: "wall", tier: 0 },
  { a: { x: 6, z: 0 }, b: { x: 0.2, z: 0.2 }, kind: "wall", tier: 0 },
  { a: { x: 0.2, z: 0.2 }, b: { x: 0, z: 0 }, kind: "wall", tier: 0 },
];
const acuteResult = computeOssWallOuterOffsets(acute, DEFAULT_WALL_THICKNESS,
  DEFAULT_WALL_CAP_OVERHANG, DEFAULT_WALL_FOOTING, PK);
const acuteWallDiags = acuteResult.diagnostics.filter((d) => d.typed === "wall-run-offset");
const acuteGreen = acuteWallDiags.length > 0 && acuteWallDiags.every((d) => !d.degraded && d.joinGapCount === 0)
  && acuteWallDiags.some((d) => d.bevelCount > 0) && (acuteResult.bevels || []).length > 0;
check("GREEN: a truly acute corner keeps its Clipper2 bevel (no degrade to the legacy fallback)", acuteGreen,
  { diagnostics: acuteResult.diagnostics, bevels: acuteResult.bevels });

// NEGATIVE CONTROL — reproduce the PRE-FIX behavior on the IDENTICAL fixture via offsetOneRun's own
// `miterOnly` escape hatch (never set by production code — computeOssWallOuterOffsets/theater-room-
// mesh.js never pass it) and confirm the harness still recognizes that shape as broken. This is what
// proves the GREEN check above is measuring a real fix, not a harness that stopped looking.
const acutePoints = acute.map((s) => ({ x: s.a.x, z: s.a.z }));
const preFixResult = PK.wallOffset({ points: acutePoints, closed: true },
  { thickness: DEFAULT_WALL_THICKNESS, miterOnly: true });
const acuteRedControl = preFixResult.diagnostics.degraded && preFixResult.diagnostics.joinGapCount > 0 &&
  /miter-limit bevel/.test(preFixResult.diagnostics.reason || "");
check("RED-FIRST negative control: miterOnly reproduces the OLD bevel-to-legacy fallback on the same fixture",
  acuteRedControl, preFixResult.diagnostics);

console.log(`\n${pass} passed, ${fail} failed`);
console.log(acuteGreen
  ? "DEFAULT FLIP: acute-corner bevel contract implemented (kept, not discarded) — production-shaped rooms stay stabilized; reassess the legacy->oss default after a controlled visual capture."
  : "DEFAULT FLIP: HOLD — production-shaped rooms are stabilized, but G3's acute-corner bevel contract is not implemented.");
if (fail) process.exitCode = 1;
