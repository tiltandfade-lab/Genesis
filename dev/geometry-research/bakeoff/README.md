# Geometry bakeoff (R1)

`docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md` §13.4 — the four-path geometry bakeoff. Decides, on
evidence, which of the current legacy pipeline / polygon-clipping / clipper2-ts should own floor
booleans, floor triangulation, and wall-outer-face offsetting. Research-only, dev-only, spike-only —
nothing here is imported by `genesis.html`, `manifest.json`, or any production `src/` module.
`src/ui/theater-room-mesh.js` is read-only input (its pure exported functions are imported for P0's
own baseline and for shared ring-canonicalization helpers — never edited).

## Charter statement (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7)

- **Rung:** C0→C1 decision input — decides the geometry stack that makes topology+architecture reliable.
- **Canonical contracts preserved:** spike-only, dev-only, no production room-shell integration, walk/
  cells never mutated (fixtures are frozen plain data; `dev/verify-geometry-fixtures.mjs`'s own G0
  corpus is imported read-only, never edited).
- **Classification:** research-only.
- **Negative control:** B20 (the known S-hook octagon regression capture) + the B01-B04 corner classes
  (acute/concave/45-notch) — see the correctness report's own "Negative controls" section for pass/fail
  per path.

## Files

| File | Job |
| --- | --- |
| `require-lib-tools.mjs` | resolves polygon-clipping/earcut/clipper2-ts/robust-predicates from `GEOMETRY_TOOLS_HOME` (mirrors R2's `require-tools.mjs` pattern) |
| `ring-utils.mjs` | shared coordinate/winding/epsilon canonicalization law (OSS-INTEGRATION §5) + the calibrated `orientXZ` robust-predicates wrapper |
| `floor-backends.mjs` | per-tier floor union + triangulation, one function pair per library (legacy / polygon-clipping / clipper2-ts / Earcut) |
| `wall-backends.mjs` | wall-offset backends: `recoverSegmentsFromRing` (re-derives legacy-shaped door/wall/riser segments from ANY canonicalized ring), `genesisSegmentExtrusionOffset` (the real production naive per-segment offset, theater-room-mesh.js:1442-1449), `clipper2StrategyA`/`clipper2StrategyB` (§4.6's two source-mapping strategies) |
| `adapters.mjs` | P0-P3 behind one `runAdapter(pathId, fixture)` signature, shared output contract (§4.2) |
| `correctness.mjs` | the 16 §4.4 checks, scored against G0's own independently-derived `expected` truths |
| `run-correctness.mjs` | driver — all 52 corpus fixtures × 4 paths → `correctness-report.json` |
| `run-performance.mjs` | driver — 200-iteration warm timing per fixture class × 4 paths → `performance-report.json` |
| `run-wall-offset-mapping.mjs` | driver — Strategy A vs B, CLIPPER_SCALE 1024/4096/65536 → `wall-offset-mapping-report.json` |
| `run-ruling.mjs` | synthesizes the §4.7 ruling JSON from the three reports above → `ruling.json` |

## Running it

```sh
# once, into the R0 scratch tool home (pins.json's geometryCandidates block):
cd ~/.genesis-geometry-tools && npm install --save-exact --ignore-scripts \
  polygon-clipping@0.15.7 earcut@3.2.3 clipper2-ts@2.0.1-18 robust-predicates@3.0.3

cd <repo>
node dev/geometry-research/bakeoff/run-correctness.mjs
node --expose-gc dev/geometry-research/bakeoff/run-performance.mjs
node dev/geometry-research/bakeoff/run-wall-offset-mapping.mjs
node dev/geometry-research/bakeoff/run-ruling.mjs
```

## The four paths

```
P0  legacy contour tracer + legacy ear-clip triangulation + naive per-segment wall-outer-face offset (CURRENT production)
P1  polygon-clipping floor union + Earcut triangulation + SAME naive per-segment wall offset as P0
P2  P1's floor, wall offset swapped to Clipper2 Strategy A (whole-ring offset correspondence)
P3  clipper2-ts booleans + clipper2-ts CDT triangulation + Clipper2 Strategy A wall offset
```

## Scope note: renderShape smoothing is P0-only in this spike

`diagonalizeStaircaseRing`/`radialSmoothRing` (STAGE-C3b's render-transform pass) is exercised only by
P0 in this spike. P1-P3 test the underlying boolean/triangulation/offset PRIMITIVES against canonical
(grid-faithful, unsmoothed) ring topology. Whether/how smoothing composes with a polygon-clipping- or
clipper2-ts-sourced ring is explicitly deferred to G2/G3 (Phase 2) — see `ruling.json`'s
`requiredFollowups`.

## Headline findings (see `ruling.json` for the full evidence)

1. **clipper2-ts's `triangulate()` (Delaunay/CDT) silently returns wrong geometry with a `success` result
   code** on polygons past trivial complexity (confirmed on a clean 28-vertex convex octagon ring:
   expected area 120, got 25) — reproduced independently of this bakeoff's own adapter code, at every
   tested `CLIPPER_SCALE`. Disqualifying for P3's own CDT candidacy.
2. **clipper2-ts's `inflatePaths()` silently no-ops on sub-1.0 float deltas** fed without integer
   scaling — `CLIPPER_SCALE` is mandatory for offsetting, not a tuning knob.
3. **The current production wall-outer-face math has no cross-segment miter join** — independently
   offset per segment, it leaves a real gap (`wallThickness*sqrt(2)`, ≈0.31 world units at the 0.22
   default) at every ordinary 90-degree corner, not just diagonal/acute chamfers.
4. **Clipper2 Strategy A (whole-ring offset) is gap-free by construction** and beats the current
   production math on every corner-join measurement, but its segment/aperture source-matching degrades
   badly near doors (as low as 33% match on a full-width open edge).
5. **Clipper2 Strategy B (per-run offset) preserves source identity perfectly (100%)** but does NOT fix
   the join-quality defect — a single-segment Butt offset is mathematically the same construction as the
   current naive endpoint offset, inheriting its exact gap.
