# Guard Post Material Maker 1.3 Batch — GP-MM-STONE-V001

This is the first compiled Guard Post base-construction material batch. It advances the offline
Material Maker foundry only; it does not wire materials into runtime structures or alter the wider
approved material roster.

## Parent semantics

- `GP-MM-M01` is old operational coursed stone. Its construction truth is a coherent horizontal
  course datum with bounded split widths.
- `GP-MM-M02` is old operational local rubble. Its construction truth is a bounded fitted
  rectilinear interlock in two axes. It is deliberately not Voronoi and not M01 with more noise.
- Both parents describe maintained, structurally sound construction. Moss, dampness, leaks,
  damage, cracks, abandonment, and other condition responses remain separate downstream layers.

> Base construction parents only. Maintained overgrowth is a separate condition-response layer and is intentionally absent from this review.

## Candidate taste differences

- `frontier-broad-cool`: calmest and most monumental M01; five broad cool-grey courses with
  low-count split-face planes and visible granular stone.
- `patrol-tempered-earth`: tighter M01 coursing with a warmer mineral family, finer grain, and
  slightly stronger hewn-face response.
- `upland-heavy-fitted`: lowest-count M02 interlock; broad heavy local units, deepest fracture
  planes, and strongest joint-edge irregularity.
- `upland-close-set`: denser M02 fit and warmer mineral family with smaller split planes, still
  bounded above the small-stone/confetti threshold.

The two M01 instances share seed `180041`; the two M02 instances share seed `180042`. Same-family
seed reuse makes the configuration comparison about scale, fit, palette, joint, and response
rather than a lucky random draw.

Stone faces carry three seed-locked response scales: a broad geological field, low-count angular
split-face planes, and subordinate granular pits/ridges. The fracture and grain fields are remapped
into each detected block's own seeded coordinates so adjacent stones do not read as one noisy
sheet. Together they break the perfectly smooth CG plane without turning the wall into crystalline
cells, stucco, scratches, or damage. A separate periodic edge warp introduces small changes in
block outline and joint width while preserving the M01 course datum and the M02 fitted interlock.
These are construction qualities, not weathering.

## Reproduction

```sh
node dev/material-lane/build-guard-post-candidates.mjs
node dev/material-lane/compile-guard-post-materials.mjs
node dev/material-cards/capture-guard-post-material-cards.mjs
```

Material Maker is pinned to version 1.3 with binary SHA-256
`597b199fae597c4f7af27c894018e444e1ba5c1ccb399f1e738e2552ebbe5feb`. The compile script exports
all four sources twice inside one invisible Material Maker process and fails if any albedo, normal,
or ORM file differs byte-for-byte.

## Limitations and next gate

- These are wall-slab base-parent candidates, not trim sheets, terrain floors, or condition layers.
- Three.js review uses the production channel interpretation and fixed camera/light contract but is
  a foundry harness, not live runtime integration.
- Candidate approval should select one M01 and one M02 taste before Stage B runtime experiments.
- Negative controls were not added; the four bounded candidates already make construction logic,
  unit count, course rhythm, palette family, and relief strength independently reviewable.
