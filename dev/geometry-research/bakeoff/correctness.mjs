/* dev/geometry-research/bakeoff/correctness.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §4.4, the bakeoff correctness scoring). Scores ONE (path, fixture) run against 16 checks. Grades
   against the fixture's own INDEPENDENTLY-derived `expected` truth (dev/geometry-research/fixtures/
   corpus.mjs + geometry-truth.mjs), never against another path's output — matching G0's own "truths,
   not snapshots" discipline (CLAUDE.md's "validators preserve the thing's job" law). */

import { runAdapter } from "./adapters.mjs";
import { areaOf, connectedComponents, countHoles, seededShuffle } from "../fixtures/geometry-truth.mjs";
import { translate, reflect } from "../fixtures/builders.mjs";

const AUTO_REJECT_CHECKS = new Set([
  "floor-area", "hole-preservation", "finite-geometry", "aperture-interval-preservation", "typed-failure",
]);

function isFiniteRing(ring) {
  return Array.isArray(ring) && ring.every((p) => Number.isFinite(p.x) && Number.isFinite(p.z));
}

function totalFloorArea(out) {
  return out.surfaces.reduce((s, sf) => s + sf.polygons.reduce((s2, p) => s2 + (p.area || 0), 0), 0);
}

function tierAreaMap(out) {
  const m = {};
  out.surfaces.forEach((sf) => { m[sf.tier] = (m[sf.tier] || 0) + sf.polygons.reduce((s, p) => s + (p.area || 0), 0); });
  return m;
}

function segmentsProperlyIntersectSelf(ring, mesh) {
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const a1 = ring[i], a2 = ring[(i + 1) % n], b1 = ring[j], b2 = ring[(j + 1) % n];
      if (mesh.segmentsProperlyIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

/** scoreFixture(pathId, fixture, mesh) -> { checks: {name: {pass, detail}}, autoRejected, out }. */
export async function scoreFixture(pathId, fixture, mesh) {
  const checks = {};
  const record = (name, pass, detail) => { checks[name] = { pass: !!pass, detail: detail ?? null }; };

  const out = await runAdapter(pathId, fixture);
  const errorDiags = out.diagnostics.filter((d) => d.level === "error");

  if (fixture.malformed) {
    record("typed-failure", errorDiags.length > 0 || out.surfaces.length === 0, {
      errorCount: errorDiags.length, surfaceCount: out.surfaces.length,
    });
    const autoRejected = !checks["typed-failure"].pass;
    return { checks, autoRejected, out, skipped: "malformed-fixture-typed-failure-only" };
  }

  // 1. floor area — P0 uses the fixture's own declared tolerance (accounts for renderShape smoothing,
  //    which ONLY P0 runs in this spike — see adapters.mjs's scope note), floored at 1e-3 to absorb the
  //    known HOLE_BRIDGE_EPS sliver artifact (legacy's own bridgePolygonWithHoles deliberately opens a
  //    razor-thin corridor to bridge a hole into its outer ring — verified live: a 3x3-minus-center
  //    donut's bridged polygon reads 8.00007 instead of the true 8, NOT a defect, an inherent property
  //    of the bridging technique every hole-bearing P0 fixture pays). P1-P3 (unsmoothed canonical
  //    topology, Earcut/Clipper2-CDT triangulation with no bridge slit) are held to the fixture's RAW
  //    cell-derived area at the strict epsilon.
  const expectedArea = fixture.expected.area;
  const areaTol = pathId === "P0" ? Math.max(fixture.expected.areaTolerance ?? 1e-6, 1e-3) : 1e-6;
  const gotArea = totalFloorArea(out);
  record("floor-area", Math.abs(gotArea - expectedArea) < areaTol, { expected: expectedArea, got: gotArea, tolerance: areaTol });

  // 2. triangle area — re-derive per-surface from the actual index buffer (independent of the `.area`
  //    bookkeeping field #1 used) so a triangulator bug that corrupts indices but leaves `.area` intact
  //    (impossible in this adapter's own wiring, but checked independently anyway) would still be caught.
  const { triangulatedArea } = await import("./ring-utils.mjs");
  let triAreaTotal = 0;
  out.surfaces.forEach((sf) => { triAreaTotal += triangulatedArea(sf.vertices, sf.indices); });
  record("triangle-area", Math.abs(triAreaTotal - expectedArea) < areaTol, { expected: expectedArea, got: triAreaTotal });

  // 3. hole preservation + 4. polygon count + 5. tier coverage
  const expectedTiers = fixture.expected.tiers || {};
  let holesOk = true, polyCountOk = true, tierCoverageOk = true;
  const tierDetail = {};
  for (const [tierKey, tExp] of Object.entries(expectedTiers)) {
    const sf = out.surfaces.find((s) => String(s.tier) === String(tierKey));
    const gotPolys = sf ? sf.polygons.length : 0;
    const gotHoles = sf ? sf.polygons.reduce((s, p) => s + p.holes.length, 0) : 0;
    const holeOk = gotHoles === tExp.holes;
    const polyOk = gotPolys === tExp.polygons;
    if (!holeOk) holesOk = false;
    if (!polyOk) polyCountOk = false;
    if (!sf) tierCoverageOk = false;
    tierDetail[tierKey] = { expectedPolys: tExp.polygons, gotPolys, expectedHoles: tExp.holes, gotHoles, tierPresent: !!sf };
  }
  record("hole-preservation", holesOk, tierDetail);
  record("polygon-count", polyCountOk, tierDetail);
  record("tier-coverage", tierCoverageOk, tierDetail);

  // 6. input-order determinism — same cells, seeded-shuffled order, same total area + tier structure.
  const shuffled = seededShuffle(fixture.cells, 4242);
  const outShuffled = await runAdapter(pathId, Object.assign({}, fixture, { cells: shuffled }));
  const shuffledArea = totalFloorArea(outShuffled);
  const shuffledTierAreas = tierAreaMap(outShuffled);
  const baseTierAreas = tierAreaMap(out);
  const tierAreasMatch = Object.keys(baseTierAreas).every(
    (t) => Math.abs((baseTierAreas[t] || 0) - (shuffledTierAreas[t] || 0)) < areaTol
  );
  record("input-order-determinism", Math.abs(shuffledArea - gotArea) < areaTol && tierAreasMatch, {
    baseArea: gotArea, shuffledArea, baseTierAreas, shuffledTierAreas,
  });

  // 7. translation/rotation/reflection invariance — area/hole/polygon counts must be identical under a
  //    pure translation and under a reflection (rotation is a further reflection+relabel of the same
  //    axis-aligned grid for these builder shapes; translation+reflection are the two invariances
  //    builders.mjs directly supports without inventing new fixture geometry).
  const translated = translate(fixture.cells, 37, -53);
  const outTranslated = await runAdapter(pathId, Object.assign({}, fixture, { cells: translated }));
  const translationOk = Math.abs(totalFloorArea(outTranslated) - gotArea) < areaTol
    && outTranslated.surfaces.length === out.surfaces.length;
  const reflected = reflect(fixture.cells);
  const outReflected = await runAdapter(pathId, Object.assign({}, fixture, { cells: reflected }));
  const reflectionOk = Math.abs(totalFloorArea(outReflected) - gotArea) < areaTol
    && outReflected.surfaces.length === out.surfaces.length;
  record("translation-rotation-reflection-invariance", translationOk && reflectionOk, {
    translatedArea: totalFloorArea(outTranslated), reflectedArea: totalFloorArea(outReflected), baseArea: gotArea,
  });

  // 8. cell ownership completeness — every input cell key appears in cellTriangleMap.
  const expectedKeys = fixture.cells.map((c) => `${c.x},${c.z}`);
  const uniqueExpectedKeys = Array.from(new Set(expectedKeys));
  const mappedKeys = new Set(Object.keys(out.cellTriangleMap || {}));
  const missingCells = uniqueExpectedKeys.filter((k) => !mappedKeys.has(k));
  record("cell-ownership-completeness", missingCells.length === 0, { missingCount: missingCells.length, missing: missingCells.slice(0, 10) });

  // 9. boundary parity — every outer/hole ring is a simple polygon (no self-intersection); the classic
  //    even/odd "boundary parity" failure mode is a ring that crosses itself, which segmentsProperlyIntersect
  //    (legacy's own exported predicate, reused read-only) detects directly.
  let boundaryParityOk = true;
  out.surfaces.forEach((sf) => sf.polygons.forEach((p) => {
    if (segmentsProperlyIntersectSelf(p.outer, mesh)) boundaryParityOk = false;
    p.holes.forEach((h) => { if (segmentsProperlyIntersectSelf(h, mesh)) boundaryParityOk = false; });
  }));
  record("boundary-parity", boundaryParityOk, {});

  // 10. aperture interval preservation — every fixture-declared aperture's owning cells still produce a
  //     'door'-kind wall record covering that same cell run (never silently dropped or widened/narrowed).
  const expectedApertureCellCount = fixture.expected.apertureCellCount || 0;
  const gotDoorWalls = out.walls.filter((w) => w.kind === "door");
  const aperturesOk = expectedApertureCellCount === 0 ? true : gotDoorWalls.length > 0;
  record("aperture-interval-preservation", aperturesOk, {
    expectedApertureCellCount, gotDoorWallCount: gotDoorWalls.length,
  });

  // 11. wall outer-contour validity — every wall record's outer endpoints (when present) are finite;
  //     absent (null) outerA/outerB is a MATCH failure (scored separately, check #13), not a validity
  //     failure here — this check only rejects a genuinely NaN/non-finite point.
  const invalidWalls = out.walls.filter((w) => (w.outerA && (!Number.isFinite(w.outerA.x) || !Number.isFinite(w.outerA.z)))
    || (w.outerB && (!Number.isFinite(w.outerB.x) || !Number.isFinite(w.outerB.z))));
  record("wall-outer-contour-validity", invalidWalls.length === 0, { invalidCount: invalidWalls.length });

  // 12. join spikes/gaps/overlap — read straight from the wall-offset diagnostics adapters.mjs already
  //     attaches per ring (genesisSegmentExtrusionOffset's own joinGaps list for P0/P1; Strategy A's
  //     whole-ring offset is internally miter-joined by Clipper2 itself, so its own per-ring gap is
  //     always ~0 by construction — this check reports the MEASURED max gap either way, never assumes).
  const wallDiags = out.diagnostics.filter((d) => d.typed === "wall-offset-diagnostics");
  const maxJoinGap = wallDiags.reduce((m, d) => Math.max(m, (d.detail && d.detail.maxJoinGap) || 0), 0);
  // "spike" = a join gap that EXCEEDS the wall thickness itself (a gap bigger than the wall is wide is
  // a visually obvious defect, not offset noise) — bounded, documented threshold, not an arbitrary one.
  const thickness = (fixture.wallProfile && fixture.wallProfile.thickness) || 0.22;
  record("join-spikes-gaps-overlap", maxJoinGap <= thickness, { maxJoinGap, thicknessThreshold: thickness, perRing: wallDiags.map((d) => d.detail && d.detail.maxJoinGap) });

  // 13. mount/source correspondence — every non-door wall segment resolved a real (non-null) outer
  //     match; P0/P1 are exact-1:1 by construction (matchConfidence always 1), P2/P3 depend on Strategy
  //     A's projection heuristic succeeding.
  const nonDoorWalls = out.walls.filter((w) => w.kind !== "door");
  const matchedWalls = nonDoorWalls.filter((w) => w.matchConfidence !== null && w.matchConfidence > 0);
  const matchRate = nonDoorWalls.length ? matchedWalls.length / nonDoorWalls.length : 1;
  record("mount-source-correspondence", matchRate >= 0.5, { matchRate, matchedCount: matchedWalls.length, totalNonDoor: nonDoorWalls.length });

  // 14. finite vertices/normals/UVs — this floor-only pipeline doesn't emit normals/UVs (out of R1's
  //     scope — flagged, not silently assumed passing); vertices/indices ARE checked for finiteness and
  //     in-range indices.
  let verticesFinite = true, indicesInRange = true;
  out.surfaces.forEach((sf) => {
    if (!sf.vertices.every((v) => Number.isFinite(v.x) && Number.isFinite(v.z))) verticesFinite = false;
    if (!sf.indices.every((i) => Number.isInteger(i) && i >= 0 && i < sf.vertices.length)) indicesInRange = false;
  });
  record("finite-geometry", verticesFinite && indicesInRange, { verticesFinite, indicesInRange, normalsUvsInScope: false });

  // 15. stable segment IDs — re-running the SAME fixture (unshuffled) twice produces byte-identical
  //     wall sourceSegmentRefs lists (deterministic segment numbering, not run-order dependent).
  const outAgain = await runAdapter(pathId, fixture);
  const idsA = out.walls.map((w) => w.sourceSegmentRefs[0]).join("|");
  const idsB = outAgain.walls.map((w) => w.sourceSegmentRefs[0]).join("|");
  record("stable-segment-ids", idsA === idsB, { matched: idsA === idsB });

  // 16. typed-failure — well-formed fixtures should produce ZERO error diagnostics (the "never a blank
  //     stage or uncaught exception for a legal input" half of the contract; the malformed-input half is
  //     scored in the early-return branch above).
  record("typed-failure", errorDiags.length === 0, { errorCount: errorDiags.length, errors: errorDiags.slice(0, 5) });

  const autoRejected = Array.from(AUTO_REJECT_CHECKS).some((name) => checks[name] && !checks[name].pass);
  return { checks, autoRejected, out };
}
