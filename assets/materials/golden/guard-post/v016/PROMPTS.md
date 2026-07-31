# Guard Post ground v016

Built-in ImageGen edit of
`v011/ground-upland-turf-albedo.png`.

Use case: `precise-object-edit`

The source prompt preserved the olive moss, muted soil, embedded pebbles, broad organic patch
scale, visible pixel clusters, and quiet tactical-ground value range. It requested a square,
top-down, seamless, reusable 30-ft material field at 32 px/ft, removed upright/fan-shaped grass
tufts, and replaced them with camera-neutral moss cushions, low groundcover, soil, and pebble
clusters. It prohibited directional light, cast shadows, perspective, paths, tracks, props,
photorealism, text, borders, and fine uniform noise.

The generated source remains immutable under `source/`. The v016 packager performs exact physical
resampling, palette control, seam locking, and synchronized normal/ORM derivation. Neither the
ImageGen source nor packaged maps are approved merely because they pass technical checks.
