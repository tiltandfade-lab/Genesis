# Genesis uneven-ground proof V001

This proof tests three deterministic exterior ground profiles under the same
governed SceneTray camera:

- `meadow-road`: gentle swells, a shallow swale, and a worn travel lane;
- `upland-ruin`: a raised knoll, eroded gully, approach route, and level ruin pad;
- `shore-margin`: submerged shelf, wet shoreline transition, dry bank, and camp pad.

The generator uses two broad seeded fields and then applies semantic masks.
Those masks reserve an approach lane and nearly level staging pad before
dressing. The slope-audit mode exposes routes, pads, water, guarded slopes, and
the generated triangle grid.

## Run the proof

```sh
node dev/uneven-ground-proof/capture-uneven-ground-proof.mjs
node dev/uneven-ground-proof/verify-uneven-ground-proof.mjs
```

Serve the repository root and open
`dev/uneven-ground-proof/uneven-ground-proof.html` to switch live between the
material and slope-audit views.

## Scope boundary

This is a generator and acceptance proof, not runtime terrain wiring. A future
scene adapter should derive route, footing, water, landmark, staging, and
transition masks from canonical rolled facts, then feed those facts into this
kind of bounded height compiler. The graphics layer must not invent them.
