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

- `frontier-broad-cool`: calmest and most monumental M01; five broad cool-grey courses, shallow
  edge response, strongest institutional read.
- `patrol-tempered-earth`: tighter M01 coursing with a warmer mineral family and slightly stronger
  normal response.
- `upland-heavy-fitted`: lowest-count M02 interlock; broad heavy local units and the quietest
  rubble palette.
- `upland-close-set`: denser M02 fit and warmer mineral family, still bounded above the
  small-stone/confetti threshold.

The two M01 instances share seed `180041`; the two M02 instances share seed `180042`. Same-family
seed reuse makes the configuration comparison about scale, fit, palette, joint, and response
rather than a lucky random draw.

Stone faces also carry a separate, seed-locked surface field. It modulates shallow face height and
roughness while the construction-cell mask preserves joints and bevels. The field is broad and
low-amplitude by design: it removes the perfectly smooth CG plane without introducing scratches,
cracks, damage, or high-frequency rock chatter.

## Reproduction

```sh
node dev/material-lane/build-guard-post-candidates.mjs
node dev/material-lane/compile-guard-post-materials.mjs
node dev/material-cards/capture-guard-post-material-cards.mjs
```

Material Maker is pinned to version 1.3 with binary SHA-256
`597b199fae597c4f7af27c894018e444e1ba5c1ccb399f1e738e2552ebbe5feb`. The compile script exports
all four sources twice and fails if any albedo, normal, or ORM file differs byte-for-byte.

## Limitations and next gate

- These are wall-slab base-parent candidates, not trim sheets, terrain floors, or condition layers.
- Three.js review uses the production channel interpretation and fixed camera/light contract but is
  a foundry harness, not live runtime integration.
- Candidate approval should select one M01 and one M02 taste before Stage B runtime experiments.
- Negative controls were not added; the four bounded candidates already make construction logic,
  unit count, course rhythm, palette family, and relief strength independently reviewable.
