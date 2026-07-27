# Structural Planarity Pass — 2026-07-26

## Result

Twenty-three accepted structural donors were inspected. Twenty-one received conservative planar
correction and were promoted as `clean-v2`; the compact field forge and wall flame sconce had no
qualifying accidental folds and remain on `clean-v1`.

The pass corrected 3,586 intended quad-like triangle pairs and moved 7,785 shared vertices. It did
not add or remove triangles, join parts, remesh silhouettes, decimate geometry, fill holes, or add
materials and textures.

Proof:
`intake-previews/planarity-pass-2026-07-26/planarity-before-after-contact-sheet.png`

## Method

Meshy Smart Topology emits triangles. The recurring construction defect was two triangles that
clearly formed one rectangular or parallelogram-like board, plate, masonry face, roof panel, or
frame surface but met at a shallow unintended angle.

`scripts/model-foundry/blender-flatten-structural-quad-pairs.py`:

1. considers only adjacent triangle pairs sharing a plausible hidden diagonal;
2. requires a rectangular or parallelogram-like projected outline;
3. rejects intentional creases above the configured angle;
4. rejects corrections requiring more than the allowed local displacement;
5. solves shared corner constraints without changing topology;
6. omits exported normals so GLB preserves connected vertices rather than splitting every flat
   face into an unrelated island.

The first broad audit candidate was rejected because it also recognized intentional low-poly
facets. A stricter construction-face test and hard movement limit were added before any canonical
asset was replaced.

## Promoted runtime donors

- `M019-A` wagon chassis
- `M049-D` public notice and signal board
- `M052-A` bell or gong yoke
- `M053-A` archive lectern and scribe station
- `M054-A` chevaux-de-frise
- `M055-A` movable timber barricade
- `M058-A` holding cage or animal pen
- `M062-B` timber repair brace
- `M064-B` camp kitchen and stores

`runtime-citizenship.json` now points to these nine `clean-v2` sources. The complete runtime pack
was rebuilt after promotion.

## Promoted connective donors

- `CP001` timber wall end cap
- `CP002` timber inline joint
- `CP003` timber outer corner
- `CP004` timber inner corner
- `CP006` timber cross junction
- `CP008` timber window frame
- `CP009` level foundation plinth
- `CP011` wall-top cutaway cap
- `CP012` structural corner post or pier
- `CP013` shed eave assembly
- `CP015` roof bearing plate
- `CP016` gable ridge segment

## Deliberate exclusions

Natural and intentionally irregular donors were not flattened:

- boulders;
- root tunnel ribs;
- ridge-tent cloth;
- woven wattle;
- gabion stone packs and variants.

These assets depend on controlled irregularity, sag, faceting, or geological form. A structural
flattening rule would erase useful authorship.

## Validation

- all 21 promoted files contain zero embedded materials and images;
- all 21 preserve their source triangle counts;
- all 21 contain zero non-manifold edges;
- all 12 promoted connective donors remain closed;
- the runtime verification passes with 15 citizens and 45 GLBs;
- the wagon chassis retains 23 pre-existing open boundary edges; a conservative automatic fill
  could not close them safely, so no speculative repair was promoted;
- `git diff --check` passes.

The wagon boundary condition is a separate repair task. It was not created or worsened by this
planarity pass.
