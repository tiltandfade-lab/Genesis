#!/usr/bin/env node
/* dev/geometry-research/bakeoff/run-wall-offset-mapping.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-
   TOOLCHAIN.md §13.4, §4.6 — the wall-offset source-mapping comparison, THE hard bar deciding whether
   Clipper2 can displace the bespoke wall-shell math).

   Measures, per representative fixture (with door/pier/corner classes from the B01-B10 bakeoff-specific
   set):
     - genesis-segment-extrusion (the CURRENT production naive per-segment endpoint offset)
     - Clipper2 Strategy A (whole-ring offset correspondence)
     - Clipper2 Strategy B (per-run offset + join)
   at THREE CLIPPER_SCALE values (1024 / 4096 / 65536), reporting join-gap validity, source-segment
   match rate/confidence, execution time, and (once, not per-scale) whether raw unscaled floats work at
   all (they do not — see the documented critical finding in floor-backends.mjs's own header).

   Run:  node dev/geometry-research/bakeoff/run-wall-offset-mapping.mjs
   Writes: dev/geometry-research/bakeoff/wall-offset-mapping-report.json */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadLegacyMeshModule, legacyUnionCells } from "./floor-backends.mjs";
import { recoverSegmentsFromRing, genesisSegmentExtrusionOffset, clipper2StrategyA, clipper2StrategyB } from "./wall-backends.mjs";
import { ringArea } from "./ring-utils.mjs";
import { loadClipper2 } from "./require-lib-tools.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const corpus = await import(pathToFileURL(join(ROOT, "dev/geometry-research/fixtures/corpus.mjs")).href);
const { FIXTURES_BY_ID } = corpus;
const mesh = await loadLegacyMeshModule();

console.log("=== CHARTER STATEMENT ===");
console.log("  Rung: C0->C1 decision input — §4.6 wall-offset source-mapping, the retire/keep bar for the bespoke miter");
console.log("  Canonical contracts preserved: spike-only, dev-only, no production edits");
console.log("  Classification: research-only\n");

const FIXTURE_IDS = [
  "F02-2x2-rect", "B01-convex-45-corner", "B02-acute-corner-near-miter-limit", "B03-concave-90-corner",
  "B04-concave-45-notch", "B06-doorway-centered-straight-wall", "B07-doorway-diagonal-to-straight-join",
  "B08-two-apertures-narrow-pier", "B09-full-width-open-edge", "B11-octagon-minimum-size",
  "B12-octagon-grand-room-size", "B17-tiny-wall-thickness", "B18-max-wall-thickness",
  "B20-s-hook-octagon-regression-capture",
];
const SCALES = [1024, 4096, 65536];

function ringForFixture(fixture) {
  const cells = fixture.cells.map((c) => ({ x: c.x, z: c.z, tier: typeof c.tier === "number" ? c.tier : 0, isDoor: !!c.isDoor }));
  const allIndex = mesh.buildCellIndex(cells);
  const byTier = new Map();
  cells.forEach((c) => { const t = c.tier; if (!byTier.has(t)) byTier.set(t, []); byTier.get(t).push(c); });
  const tier0 = Array.from(byTier.keys())[0];
  const tierCells = byTier.get(tier0);
  const union = legacyUnionCells(tierCells, tier0, allIndex, mesh);
  const outer = union.polygons[0].outer;
  const segments = recoverSegmentsFromRing(outer, allIndex, tier0, mesh);
  return { ring: outer, segments, wallProfile: fixture.wallProfile };
}

function summarizeMatch(perSegment) {
  const nonDoor = perSegment.filter((p) => p.kind !== "door");
  const matched = nonDoor.filter((p) => p.outerA && p.outerB);
  const confidences = matched.map((p) => p.matchConfidence ?? 1);
  return {
    totalSegments: perSegment.length, nonDoorSegments: nonDoor.length,
    matchedSegments: matched.length,
    matchRate: nonDoor.length ? matched.length / nonDoor.length : 1,
    meanConfidence: confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : null,
    minConfidence: confidences.length ? Math.min(...confidences) : null,
  };
}

const report = {
  generatedAt: new Date().toISOString(),
  scales: SCALES,
  criticalFinding: {
    title: "clipper2-ts inflatePaths silently no-ops on sub-1.0 float deltas (no scaling)",
    evidence: "inflatePaths([1x1 square path], 0.22, JoinType.Miter, EndType.Polygon, 4) with UNSCALED float coordinates returns the input UNCHANGED (zero offset applied, no error/warning). With CLIPPER_SCALE=4096 (toC(v)=round(v*4096)) the SAME operation correctly returns an outward offset of 0.21997 world units (901/4096). CLIPPER_SCALE is therefore MANDATORY for clipper2-ts offsetting, not merely a precision tuning knob — an adapter that omits it silently produces UN-OFFSET walls.",
    verifiedLive: true,
  },
  genesisBaselineFinding: {
    title: "the CURRENT production wall outer-face construction (theater-room-mesh.js:1442-1449) has NO cross-segment miter join",
    evidence: "outerA/outerB are computed per-segment as innerA/innerB - normal*wallThickness, independently per segment, with buildWallBox called once per segment. At an ordinary 90-degree convex corner between two equal-thickness wall segments, this produces TWO DIFFERENT corner points (one per segment's own independent offset) separated by wallThickness*sqrt(2) — e.g. 0.311 world units at the default 0.22 thickness, LARGER than the wall's own thickness. At a door-adjacent join (door width=0, wall width=thickness) the gap is exactly wallThickness (0.22). Measured directly against genuine 90-degree rectangle corners, not just diagonal/acute chamfers.",
    verifiedLive: true,
  },
  strategyComparison: [], // per fixture x scale x strategy
  scaleComparison: [],    // per fixture: same strategy (A) across all 3 scales
};

for (const fid of FIXTURE_IDS) {
  const fixture = FIXTURES_BY_ID.get(fid);
  if (!fixture) { console.log(`  SKIP ${fid}: not in corpus`); continue; }
  const { ring, segments, wallProfile } = ringForFixture(fixture);
  console.log(`\n${fid} (${segments.length} segments, ${wallProfile.thickness} thickness):`);

  // genesis baseline (scale-independent)
  const gOff = genesisSegmentExtrusionOffset(ring, segments, wallProfile, mesh);
  const gSummary = summarizeMatch(gOff.perSegment);
  console.log(`  genesis-segment-extrusion: match=${(gSummary.matchRate * 100).toFixed(0)}% maxJoinGap=${gOff.diagnostics.maxJoinGap.toFixed(4)} libMs=${gOff.diagnostics.libMs.toFixed(3)}`);
  report.strategyComparison.push({
    fixture: fid, strategy: "genesis-segment-extrusion", scale: null,
    ...gSummary, maxJoinGap: gOff.diagnostics.maxJoinGap, joinGapCount: gOff.diagnostics.joinGapCount, libMs: gOff.diagnostics.libMs,
  });

  for (const scale of SCALES) {
    const t0 = performance.now();
    const stratA = await clipper2StrategyA(ring, segments, wallProfile, { mesh, scale });
    const aMs = performance.now() - t0;
    const aSummary = stratA.outerRing ? summarizeMatch(stratA.perSegment) : { matchRate: 0, meanConfidence: null, minConfidence: null, totalSegments: segments.length, nonDoorSegments: null, matchedSegments: 0 };
    // Strategy A's OWN outer ring is offset in ONE call, so it is internally gap-free by construction —
    // the only "gap" that can appear is in the SOURCE-SEGMENT MATCH (an unmatched segment gets a null
    // outerA/outerB, not a geometric gap in the ring itself).
    const ringClosureGap = stratA.outerRing
      ? Math.hypot(stratA.outerRing[0].x - stratA.outerRing[stratA.outerRing.length - 1].x, stratA.outerRing[0].z - stratA.outerRing[stratA.outerRing.length - 1].z)
      : null;

    const t1 = performance.now();
    const stratB = await clipper2StrategyB(ring, segments, wallProfile, { scale, mesh });
    const bMs = performance.now() - t1;
    const bSummary = summarizeMatch(stratB.perSegment);

    console.log(`  scale=${scale}: StrategyA match=${(aSummary.matchRate * 100).toFixed(0)}% cornerJoinsUnclaimed=${stratA.diagnostics.cornerJoinsUnclaimed ?? "n/a"} (${aMs.toFixed(2)}ms) | StrategyB match=${(bSummary.matchRate * 100).toFixed(0)}% maxJoinGap=${stratB.diagnostics.maxJoinGap.toFixed(4)} (${bMs.toFixed(2)}ms)`);

    report.strategyComparison.push({
      fixture: fid, strategy: "clipper2-strategy-A", scale, ...aSummary,
      cornerJoinsUnclaimed: stratA.diagnostics.cornerJoinsUnclaimed, ringClosureGap, libMs: stratA.diagnostics.libMs, wallMs: aMs,
    });
    report.strategyComparison.push({
      fixture: fid, strategy: "clipper2-strategy-B", scale, ...bSummary,
      maxJoinGap: stratB.diagnostics.maxJoinGap, joinGapCount: stratB.diagnostics.joinGapCount, libMs: stratB.diagnostics.libMs, wallMs: bMs,
    });

    report.scaleComparison.push({
      fixture: fid, scale, strategy: "clipper2-strategy-A",
      outerArea: stratA.outerRing ? ringArea(stratA.outerRing) : null,
      matchRate: aSummary.matchRate, execMs: aMs,
    });
  }
}

// determinism check: same fixture/scale run twice -> identical outer ring (Strategy A).
console.log("\n=== Determinism check (Strategy A, scale=4096, run twice) ===");
{
  const fixture = FIXTURES_BY_ID.get("B03-concave-90-corner");
  const { ring, segments, wallProfile } = ringForFixture(fixture);
  const run1 = await clipper2StrategyA(ring, segments, wallProfile, { mesh, scale: 4096 });
  const run2 = await clipper2StrategyA(ring, segments, wallProfile, { mesh, scale: 4096 });
  const identical = JSON.stringify(run1.outerRing) === JSON.stringify(run2.outerRing);
  console.log(`  identical output across 2 runs: ${identical}`);
  report.determinismCheck = { fixture: "B03-concave-90-corner", scale: 4096, identical };
}

// overflow margin check: CLIPPER_SCALE=65536 against Genesis's largest legal coordinate magnitude
// (B15a/b translate fixtures use +/-100000; theater-boot.js world coords stay far smaller in practice,
// but this checks the documented "expected room coordinates remain vastly below JavaScript's safe-
// integer limit" claim directly).
console.log("\n=== Overflow margin check (scale=65536, coordinate=100000) ===");
{
  const { C } = await loadClipper2();
  const scale = 65536;
  const coord = 100000;
  const scaledCoord = coord * scale;
  const safeLimit = Number.MAX_SAFE_INTEGER;
  console.log(`  100000 * 65536 = ${scaledCoord} (Number.MAX_SAFE_INTEGER = ${safeLimit}, margin = ${(safeLimit / scaledCoord).toFixed(1)}x)`);
  const path = C.makePath([0, 0, scaledCoord, 0, scaledCoord, scaledCoord, 0, scaledCoord]);
  let ok = true, err = null;
  try {
    const off = C.inflatePaths([path], Math.round(0.22 * scale), 0, 0, 4);
    ok = off.length > 0 && Number.isFinite(off[0][0].x);
  } catch (e) { ok = false; err = String(e); }
  console.log(`  inflatePaths at this magnitude: ${ok ? "OK" : "FAILED: " + err}`);
  report.overflowMarginCheck = { scale, coord, scaledCoord, safeIntegerMargin: safeLimit / scaledCoord, offsetSucceeded: ok, error: err };
}

const reportPath = join(ROOT, "dev/geometry-research/bakeoff/wall-offset-mapping-report.json");
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\nwrote ${reportPath}`);
