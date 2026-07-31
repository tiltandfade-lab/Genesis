# Guard Post ground v017

Built-in ImageGen edit of
`v011/ground-upland-turf-albedo.png`.

Use case: `precise-object-edit`

This second 32 px/ft candidate treats v011's composition, palette balance, broad moss masses,
soil-channel scale, stone density, and quiet/detail rhythm as strict invariants. The edit request
allows only removal of upright/fan-shaped tufts and added pixel articulation inside the existing
large forms. It explicitly rejects beige desaturation, redistributed micro-clumps, uniform
checkerboard/crosshatch/dither screens, directional lighting, perspective, paths, props, text, and
camera-specific marks.

The generated source remains immutable under `source/`. The shared v016/v017 packager performs
exact 960×960 physical resampling, palette control, seam locking, and synchronized normal/ORM
derivation. This remains a technical candidate until in-context family review.
