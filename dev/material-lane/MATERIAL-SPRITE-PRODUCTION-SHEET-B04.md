---
type: material-source-sprite-production-sheet
status: B04-TECHNICAL-COMPLETE-TASTE-PENDING
batch: B04-masonry-interior
workflow: sprite-first-mm-second
generation: built-in-imagegen
---

# Batch 4 — Remaining Masonry + Interior Floors

This batch fills five remaining masonry slots and four interior-floor slots. The four live
`GP-MM-STONE-V001` candidates remain untouched: they are two coursed-stone and two fitted-rubble
possibilities, not substitutes for the five masonry subjects below. Dressed ashlar explicitly
reuses the approved B02 sprite-first source as parentage; the other eight sources were generated
one asset per built-in ImageGen call.

## Non-negotiable production law

Adam's authority is:

> "sprites first, materials layered on those sprites second. i like the richness of character
> that the sprites give us."

ImageGen produces complete albedo authority. The source must pass the seam gate before MM.
Material Maker may derive restrained height, normal, AO, and ORM, but may not replace, recolor,
or squash the sprite.

## Shared ImageGen contracts

Every wall prompt required a square, full-frame, front-on orthographic surface with no top cap,
side face, wall object, perspective, vignette, directional light, cast shadow, AO, condition
story, or special boundary treatment. Every floor prompt used the same exclusions but required a
strict top-down orthographic surface. All prompts required perfect X/Y repetition and an ordinary
boundary when viewed 3x3.

Genesis rendering language was: painterly pixel-art / hand-painted sprite aesthetic; broad
readable construction shapes; restrained local-color variation; rich character without
photographic noise. All depth was explicitly deferred to MM.

Periodic retries add an exact phase contract:

- rough-hewn: six equal-height courses; top/bottom cut at the same midpoint phase; boundary stones
  wrap; staggered vertical joints;
- brick: sixteen equal-height courses; top/bottom cut inside the same course; two stable
  running-bond offsets; every horizontal and vertical crevice survives a 3x3 repeat.

## Subject blocks and selected sources

| ID | Explicit subject | Selected 512px authority | Route | Final X/Y ratio |
|---|---|---|---|---|
| `wall-ashlar-dressed` | Pale measured dressed blocks, staggered courses, fine joints, restrained cream/warm-grey variation. | `source-sprites/b04-masonry-interior-v001/wall-ashlar-dressed-selected-v001.png` | approved B02 sprite-first parent + normalization | 0.357 / 0.435 |
| `wall-rough-hewn-block` | Large rectangular rugged blocks, broad chisel facets, coherent courses, narrow mortar. | `source-sprites/b04-masonry-interior-v001/wall-rough-hewn-block-selected-v001.png` | period retry v002 + 32px X-only color lock + normalization | 0.047 / 0.373 |
| `wall-dry-stack-fieldstone` | Medium/large irregular fitted fieldstones, tight dark dry joints, no mortar, no pebble confetti. | `source-sprites/b04-masonry-interior-v001/wall-dry-stack-fieldstone-selected-v001.png` | raw ImageGen v001 + normalization | 0.508 / 0.295 |
| `wall-brick` | Handmade fired-clay bricks, narrow mortar, stable running bond, restrained terracotta/russet/ochre variation. | `source-sprites/b04-masonry-interior-v001/wall-brick-selected-v001.png` | period retry v002 + normalization | 0.337 / 0.196 |
| `wall-plastered-rubble` | Maintained warm off-white lime plaster, broad hand-trowelled undulation, substrate suggested only by subtle broad unevenness. | `source-sprites/b04-masonry-interior-v001/wall-plastered-rubble-selected-v001.png` | raw ImageGen v001 + normalization | 0.982 / 0.879 |
| `floor-flagstone` | Large irregular flat polygonal slabs, narrow mineral joints, warm-grey/taupe/slate variation. | `source-sprites/b04-masonry-interior-v001/floor-flagstone-selected-v001.png` | raw ImageGen v001 + normalization | 0.408 / 0.417 |
| `floor-plank` | Broad horizontal oak boards, complete crevice at every course, staggered end joints, contained directional grain. | `source-sprites/b04-masonry-interior-v001/floor-plank-selected-v001.png` | raw ImageGen v001 + normalization | 0.521 / 0.250 |
| `floor-packed-earth` | Firm dry compacted clay, broad compression patches, sparse grit, no tracks or focal patch. | `source-sprites/b04-masonry-interior-v001/floor-packed-earth-selected-v001.png` | ImageGen v001 + 24px continuous-field lock + normalization | 0.112 / 0.108 |
| `floor-cobble` | Hand-set rounded cobbles smaller than flagstone, narrow dark gaps, restrained mineral variation. | `source-sprites/b04-masonry-interior-v001/floor-cobble-selected-v001.png` | raw ImageGen v001 + normalization | 0.713 / 0.772 |

The initial rough-hewn and brick passes failed top/bottom construction phase at 4.928 and 2.248
times ordinary p95. They remain preserved as rejected sources. Period-contract retries were used
instead of blending their structural joints. Brick then passed raw. Rough-hewn aligned its courses
but retained an X-only color jump inside boundary-cut stones; a declared 32px X-only cosine color
lock corrected that without moving joints. Packed earth missed by only 0.7% and used the existing
continuous-field lock. No other accepted source was repaired.

## MM v003 treatment

Dark-seam residual guides are used for ashlar, rough-hewn, dry-stack, brick, flagstone, plank, and
cobble. Broad-luminance guides are used for plaster and packed earth. The plank guide isolates
board crevices and intentionally leaves painted grain unembossed.

V001 was rejected because plaster and packed-earth relief fell below the measurable signal gate.
V002 strengthened only those broad guides; plaster passed, packed earth did not. V003 changed only
packed-earth guide contrast and normal strength. V003 passes exact albedo identity, source seam,
depth, ORM, and dual-run byte-determinism gates for all nine materials.

## Native-aspect proof contract

- walls: 5.2 × 1.65 plane, UV repeat 3.1515 × 1, X/Y texel scale 1.000;
- floors: 5.2 × 5.2 plane, UV repeat 3 × 3, X/Y texel scale 1.000;
- each card shows selected sprite, square 3x3 repeat, height, normal, ORM, exact MM albedo,
  sprite-only fixture, sprite+MM fixture, gameplay standee, and clay control.

Browser QA confirmed `ready`, nine cards, 36 renders, five wall fixtures, four floor fixtures,
square map frames, and zero page errors.

## Evidence

- Source board: `proofs/b04-masonry-interior-v001/b04-masonry-interior-selected-source-board-v002.png`
- Source receipt: `proofs/b04-masonry-interior-v001/b04-masonry-interior-selected-source-receipt-v002.json`
- Normalization receipt: `proofs/b04-masonry-interior-v001/b04-source-normalization-v001.json`
- MM manifest: `manifests/b04-masonry-interior-mm-v003.source.json`
- Dual-run receipt: `receipts/b04-masonry-interior-mm-v003-export-receipt.json`
- Verification: `receipts/b04-masonry-interior-mm-v003-verification.json`
- Review card: `../material-cards/b04-masonry-interior-mm-v003.html`

## Taste questions

1. Is rough-hewn sufficiently distinct from the existing coursed-stone family?
2. Is dry-stack fieldstone too rounded, or does it read as convincingly hand-fitted?
3. Is brick too saturated beside the stone families?
4. Does plaster retain enough hand-made character without reading damaged?
5. Are flagstone units large enough at gameplay distance?
6. Is the plank floor too warm?
7. Does packed earth remain legible beside exterior worn path?
8. Is cobble too busy behind the goblin standee?
