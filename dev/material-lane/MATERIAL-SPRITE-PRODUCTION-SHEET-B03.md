---
type: material-source-sprite-production-sheet
status: B03-TECHNICAL-COMPLETE-TASTE-PENDING
batch: B03-exterior-ground
workflow: sprite-first-mm-second
generation: built-in-imagegen
---

# Batch 3 — Exterior Ground Set

Five top-down ground fields were produced through the direct-sprite fast lane: grass/meadow, worn
path, mud, gravel/scree, and marsh/bog. They are material fields, not terrain chunks or scenes.
The approved 512px sprite remains exact MM albedo authority.

## Shared ImageGen prompt contract

Every built-in ImageGen call included Adam's authority:

> "sprites first, materials layered on those sprites second. i like the richness of character
> that the sprites give us."

The shared production block was:

```text
Create one complete square seamless albedo source sprite for a Genesis exterior-ground material.
Strict top-down orthographic surface view; square canvas; ground fills the image edge to edge.
This is a direct full-field material sprite, not a component sheet, landscape, terrain chunk,
diorama, map, object, or scene.

The surface must tile seamlessly on both axes. Left/right and top/bottom boundaries continue the
same ordinary density, feature scale, color distribution, and visual phase. No border band, quiet
edge, vignette, cropped terminal feature, large feature at an edge, or special boundary treatment.
Wrapped joins must be indistinguishable from ordinary internal transitions.

Genesis default-fantasy pixel-art sprite rendering: visible pixel-scale texture, painterly dither
only at shadow edges, warm parchment-adjacent traditional Monster Manual palette, grounded and
subtle, broad clean value shapes first, grit only as seasoning, never photographic or noisy.
The field must remain quiet behind a standee at 50% zoom.

Flat neutral local albedo only. No directional light, cast shadow, ambient occlusion, bevel
highlight, glossy reflection, gradient, horizon, perspective, frame, labels, props, damage story,
condition overlay, or watermark. Material Maker adds controlled depth later and may not replace
the sprite's color character.

SUBJECT:
[one subject block below]
```

## Subject blocks and selected sources

| ID | Subject block | Selected 512px authority | Route | Final X/Y ratio |
|---|---|---|---|---|
| `grass-meadow` | Short meadow grass in broad interlocking moss, olive, and straw-green masses; restrained tiny leaves; no flowers, stones, bare patches, tracks, or focal clump. | `source-sprites/b03-exterior-ground-v001/grass-meadow-selected-v001.png` | ImageGen v001 + 48px continuous-field lock + normalization | 0.024 / 0.027 |
| `worn-path` | The whole field is compacted warm ochre earth with broad wear patches, restrained grit, and flattened straw traces; no bordered road, directional lane, ruts, prints, or puddles. | `source-sprites/b03-exterior-ground-v001/worn-path-selected-v001.png` | raw ImageGen v001 + normalization | 0.771 / 0.648 |
| `mud` | Cool umber and brown-grey mud in broad interlocking clods and compressed patches; restrained damp seams; no prints, ruts, puddle rims, grass, or focal object. | `source-sprites/b03-exterior-ground-v001/mud-selected-v001.png` | ImageGen v001 + 32px continuous-field lock + normalization | 0.059 / 0.053 |
| `gravel-scree` | Tightly packed small angular gravel and fine scree in warm-grey, blue-grey, muted brown, and sparse pale variation; no boulders, paving, grass, or hero stones. | `source-sprites/b03-exterior-ground-v001/gravel-scree-selected-v001.png` | ImageGen v001 + 32px continuous-field lock + normalization | 0.014 / 0.013 |
| `marsh-bog` | Dark peat with broad moss-green and olive vegetation mats, sparse flattened reeds, and small integrated dull blue-grey wet pockets; no pond, shore, lilies, side-view reeds, or reflected sky. | `source-sprites/b03-exterior-ground-v001/marsh-bog-selected-v001.png` | ImageGen v001 + 40px continuous-field lock + normalization | 0.040 / 0.038 |

The untouched ImageGen gate accepted worn path directly. The other four missed the 1.10
boundary/internal threshold only mildly (worst ratio 1.190), so the declared narrow
continuous-field adapter was used. No prompt retries or component reconstruction were needed.
Originals, seam-lock receipts, and full-resolution repeats remain under
`proofs/b03-exterior-ground-v001/`.

All selected sources were normalized from the 1254px ImageGen workspace to the pinned 512px
delivery size before MM. The normalization receipt records both source and output hashes.

## MM v003 treatment

Every graph uses a broad-luminance height guide. High-frequency grass blades, grit, stone chips,
and illustration dither remain albedo character.

| Material | Radius / contrast | Normal | AO | Roughness | Depth |
|---|---|---:|---:|---:|---:|
| Grass / meadow | 7 / 0.52 | 0.17 | 0.12 | 0.88 | 0.012 |
| Worn path | 11 / 0.38 | 0.20 | 0.10 | 0.84 | 0.008 |
| Mud | 5 / 0.34 | 0.16 | 0.12 | 0.66 | 0.015 |
| Gravel / scree | 4 / 0.28 | 0.15 | 0.11 | 0.82 | 0.011 |
| Marsh / bog | 9 / 0.46 | 0.15 | 0.11 | 0.70 | 0.011 |

The v001 MM attempt was rejected because gravel exceeded the albedo resampling tolerance and its
relief was too aggressive. The v002 pass normalized all albedos to exact identity and broadened
mud/gravel relief, but worn-path normal signal remained below the minimum measurable threshold.
V003 changed only worn-path normal strength from 0.15 to 0.20. V003 passes every gate.

## Evidence and handoff

- Selected 512px source board:
  `proofs/b03-exterior-ground-v001/b03-exterior-ground-selected-source-board-v003.png`
- Selected source receipt:
  `proofs/b03-exterior-ground-v001/b03-exterior-ground-selected-source-receipt-v003.json`
- Normalization receipt:
  `proofs/b03-exterior-ground-v001/b03-source-normalization-v001.json`
- MM manifest: `manifests/b03-exterior-ground-mm-v003.source.json`
- Graphs: `graphs/b03-exterior-ground-mm-v003/`
- Two-run receipt: `receipts/b03-exterior-ground-mm-v003-export-receipt.json`
- Verification: `receipts/b03-exterior-ground-mm-v003-verification.json`
- Review card: `../material-cards/b03-exterior-ground-mm-v003.html`

The review fixture is a square 5.2-by-5.2 plane with a uniform 3-by-3 repeat on both axes. Its
X/Y texel scale is exactly 1.000. Sprite-only, MM-depth, gameplay, and clay comparisons share the
same camera and fixture.

## Taste questions

1. Is the grass too yellow-green, or does it read as the desired warm default-fantasy meadow?
2. Does worn path need more visible grit at play distance?
3. Does mud read wet enough without a separate condition layer?
4. Is gravel/scree too visually busy behind a standee?
5. Does marsh/bog retain enough green in the lit gameplay preview?
