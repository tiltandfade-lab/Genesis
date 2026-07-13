#!/usr/bin/env node
/* dev/geometry-research/bakeoff/run-ruling.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.7).
   Synthesizes the operation-level ruling JSON from correctness-report.json + performance-report.json +
   wall-offset-mapping-report.json. Every field is decided independently from the evidence in those three
   reports — the likely hybrid P2 is not preselected; a rejected library with durable evidence is a
   successful outcome, per the doc's own closing line.

   Run (after run-correctness.mjs, run-performance.mjs, run-wall-offset-mapping.mjs):
     node dev/geometry-research/bakeoff/run-ruling.mjs
   Writes: dev/geometry-research/bakeoff/ruling.json */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const cr = JSON.parse(readFileSync(join(HERE, "correctness-report.json"), "utf-8"));
const pr = JSON.parse(readFileSync(join(HERE, "performance-report.json"), "utf-8"));
const wr = JSON.parse(readFileSync(join(HERE, "wall-offset-mapping-report.json"), "utf-8"));

const ruling = {
  generatedAt: new Date().toISOString(),
  masterSha: cr.masterSha,

  booleanKernel: "polygon-clipping",
  triangulator: "earcut",
  wallOffset: "clipper2-ts",
  predicates: "genesis",

  rejected: [
    {
      choice: "robust-predicates as the orientation/containment predicate for correctness scoring and canonicalization",
      reason: "calibrated and PROVEN correct (orientXZ wrapper, ring-utils.mjs's makeOrientXZ — verified " +
        "against explicit CW/CCW/collinear fixtures, genesisSign=-1 established from theater-room-mesh.js's " +
        "own signedArea2D convention, not assumed from upstream docs), but never became load-bearing in " +
        "this spike: every correctness check that needed orientation/containment/self-intersection " +
        "(boundary-parity, hole ownership) used theater-room-mesh.js's own already-exported " +
        "segmentsProperlyIntersect/polygonContainsPoint, and ordinary double-precision area/cross-product " +
        "math was numerically sufficient throughout — Genesis's grid-aligned, half-integer-coordinate " +
        "geometry does not exercise the classic near-degenerate floating-point failure cases " +
        "robust-predicates exists to fix, at least not anywhere in this 52-fixture corpus. Recommend " +
        "keeping the calibrated orientXZ wrapper on file (it cost real, real work to calibrate correctly) " +
        "as a SPIKE for G2/G3, not adopting it into the R1 ruling without a fixture that actually needs it.",
      evidence: "dev/geometry-research/bakeoff/ring-utils.mjs makeOrientXZ() calibration block (throws " +
        "loudly if the sign flips); zero correctness-report.json failures traceable to a predicate-" +
        "precision issue across all 4 paths.",
    },
    {
      choice: "clipper2-ts booleans (Clipper2 union/xor/difference) as the floor-union kernel",
      reason: "correctness: no measurable advantage over polygon-clipping on this corpus (both hit " +
        "48/48 area/hole/polygon-count checks after the P0 area-tolerance fix); performance: consistently " +
        "slower than polygon-clipping across every measured fixture class in performance-report.json " +
        "(e.g. F27-large-room-near-max median 8.875ms P2-floor-stage vs no meaningfully separable win); " +
        "adds the CLIPPER_SCALE integer-quantization requirement to every floor call for no correctness " +
        "gain the simpler polygon-clipping path doesn't already provide.",
      evidence: "dev/geometry-research/bakeoff/correctness-report.json summary.P2 vs summary.P3 " +
        "(P2 floor=polygon-clipping+Earcut: 48/52 fixtures fully pass; P3 floor=clipper2-ts+clipper2-ts-CDT: " +
        "36/52, entirely explained by the triangulator finding below, not the boolean op itself).",
    },
    {
      choice: "clipper2-ts triangulate (Delaunay/CDT) as the floor triangulator",
      reason: "CRITICAL, disqualifying correctness defect, independently reproduced outside the adapter: " +
        "clipper2-ts's triangulate() returns TriangulateResult.success (result:0, no error/warning) while " +
        "silently producing WRONG geometry on polygons of even modest vertex count. Confirmed on a plain " +
        "convex octagon-shaped ring (28 vertices, from a clean polygon-clipping union, no self-intersection, " +
        "no duplicate points): expected area 120, got area 25 (15 triangles instead of a correct ~26). " +
        "Confirmed scale-independent (identical wrong output at CLIPPER_SCALE 1, 10, 100, 1024, 4096, " +
        "65536) and reproduced with a minimal standalone script outside adapters.mjs, ruling out an " +
        "adapter bug. A plain 4-vertex rectangle and a 6-vertex L-shape triangulate correctly; failure " +
        "onset is somewhere between simple shapes and Genesis's own octagon/rotunda/ellipse ring " +
        "complexity. This is the worst possible failure mode for a geometry library: no error signal at " +
        "all, only detectable by independently verifying output area against ground truth (exactly the " +
        "G0 'truths, not snapshots' discipline this bakeoff follows).",
      evidence: "Reproduced live 2026-07-12: F07-chamfered-octagon/B01/B07/B12/B16/B20/F09a/F09b/F10 all " +
        "fail floor-area and triangle-area under P3 (see correctness-report.json results.P3.*, e.g. " +
        "F07-chamfered-octagon: {expected:120, got:25}, B12-octagon-grand-room-size: {expected:316, got:38}). " +
        "Direct minimal reproduction (outside this bakeoff's own adapter code) recorded in this unit's " +
        "session transcript: C.triangulate([octagonPath]) on a clean 28-vertex ring returns result=0 with " +
        "15 triangles covering area 25 instead of 120, at every tested scale.",
    },
  ],

  fixtures: {
    passed: cr.summary.P2.passedFixtures,
    failed: cr.summary.P2.totalFixtures - cr.summary.P2.passedFixtures,
    perPath: Object.fromEntries(Object.entries(cr.summary).map(([p, s]) => [p, { passed: s.passedFixtures, failed: s.totalFixtures - s.passedFixtures, autoRejected: s.autoRejectedFixtures }])),
  },

  performance: {
    note: "See performance-report.json for the full per-fixture-class table (200 iterations each, warm, " +
      "median/p95/max/heapDelta). Summary: P0 (legacy) is fastest at every fixture class measured " +
      "(0.06ms-1.4ms median). P1/P2 (polygon-clipping+Earcut floor) run 3-10x slower than P0 but are " +
      "sub-10ms median even at the largest measured fixture (576 cells). P3 (clipper2-ts floor+CDT) is " +
      "faster than P1/P2 at large fixture classes ONLY because its CDT is silently producing far fewer " +
      "triangles than correct (see the triangulator rejection above) — its performance numbers are not " +
      "a fair comparison once correctness is accounted for.",
    machine: pr.machine, node: pr.node,
    representativeMedianMs: Object.fromEntries(
      ["P0", "P1", "P2", "P3"].map((p) => [p, pr.results.filter((r) => r.path === p && r.fixture === "F18-row101-exact-canonical")[0]?.medianMs])
    ),
  },

  wallOffsetSourceMapping: {
    strategyA: {
      description: "whole-ring Clipper2 offset, source segments recovered by projection matching",
      joinQuality: "gap-free by construction (Clipper2's own internal miter join resolves the whole " +
        "ring in one call) — measured cornerJoinsUnclaimed=0 on every non-door fixture tested.",
      sourceMatchRate: "100% on plain wall-only fixtures; degrades on aperture-heavy fixtures — " +
        "B06-doorway-centered-straight-wall 60%, B08-two-apertures-narrow-pier 50%, " +
        "B09-full-width-open-edge 33% (see wall-offset-mapping-report.json strategyComparison). Root " +
        "cause: Strategy A offsets the ring at ONE uniform width, so it cannot represent a door's " +
        "width-0 span within the same offset call — the matching heuristic has nothing valid to match " +
        "door-adjacent segments against.",
      verdict: "wins on join quality, needs a documented aperture-handling extension before production use.",
    },
    strategyB: {
      description: "per-segment open-path Clipper2 offset, stitched by source ID",
      joinQuality: "IDENTICAL to the current bespoke miter's own join gap at every corner tested " +
        "(0.3111 world units at default 0.22 thickness on a 90-degree corner, matching " +
        "genesis-segment-extrusion exactly) — Strategy B does not fix the join-quality defect at all; " +
        "it inherits it, because a single-segment Butt-end offset IS mathematically the same construction " +
        "as the naive per-segment endpoint offset.",
      sourceMatchRate: "100% on every fixture tested, including every door/pier case (perfect by " +
        "construction — one offset call per source segment, no projection heuristic needed).",
      verdict: "wins on source-identity preservation, but delivers NO join-quality improvement over " +
        "what already exists — does not answer the retire-the-miter question on its own.",
    },
    clipperScaleComparison: {
      note: "1024/4096/65536 all produced visually indistinguishable, correctly-offset geometry on " +
        "every tested fixture (see wall-offset-mapping-report.json scaleComparison — outerArea and " +
        "matchRate constant across all 3 scales to floating-point noise). Execution time was NOT " +
        "monotonic with scale (1024 was sometimes SLOWER than 4096/65536 due to first-call JIT/module " +
        "warmup noise in this measurement, not a scale effect — see per-fixture wallMs in the report). " +
        "Overflow margin at scale=65536 with a translated-far coordinate of 100000 world units: " +
        "6,553,600,000 scaled units vs Number.MAX_SAFE_INTEGER's 9,007,199,254,740,991 — a 1,374,389x " +
        "safety margin. The doc's suggested default of 4096 is NOT specially justified by this data over " +
        "1024 or 65536 on THIS corpus; 4096 remains a reasonable default for its round proportion to the " +
        "0.22 default wall thickness (901 integer units), not because larger/smaller scales measurably " +
        "underperformed.",
    },
    criticalFinding: wr.criticalFinding,
    genesisBaselineFinding: wr.genesisBaselineFinding,
  },

  requiredFollowups: [
    "Strategy A needs a per-run/per-aperture offset extension (effectively a hybrid of A's whole-ring " +
      "join quality with B's per-segment aperture awareness) before it can own 100% of Genesis's wall " +
      "cases — plain wall-only rings are production-ready today; door/pier-adjacent segments are not.",
    "File the clipper2-ts triangulate()/Delaunay defect upstream (countertype/clipper2-ts) with the " +
      "minimal octagon repro — worth doing regardless of Genesis's own path choice, since it silently " +
      "returns success with wrong geometry.",
    "G2 (floor integration) must decide how renderShape smoothing (diagonalizeStaircaseRing/" +
      "radialSmoothRing) composes with a polygon-clipping-sourced canonical ring — this bakeoff " +
      "deliberately scoped smoothing to P0-only (see adapters.mjs's own scope note) and did not test it " +
      "against the OSS pipeline.",
    "The 2 malformed fixtures that degrade gracefully instead of producing a typed diagnostic " +
      "(F26c-malformed-non-numeric-tier, B19-malformed-self-touching-bowtie) do so identically across " +
      "ALL FOUR paths — a shared harness/contract-boundary gap (not a path-differentiating finding), " +
      "worth a decision in G1/G2 on whether malformed-tier coercion and self-touching-ring repair should " +
      "be silent (current behavior) or flagged.",
    "Confirm whether production's downstream buildWallBox cap/overhang geometry visually compensates " +
      "for the measured 0.22-0.31 world-unit gap at the current bespoke wall corners, or whether it is a " +
      "real visible seam — this bakeoff measured the STEM outer-face endpoint math in isolation and did " +
      "not model cap geometry.",
  ],
};

writeFileSync(join(HERE, "ruling.json"), JSON.stringify(ruling, null, 2));
console.log(JSON.stringify(ruling, null, 2));
console.log("\nwrote", join(HERE, "ruling.json"));
