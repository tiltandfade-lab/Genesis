# SPRITE-FIRST-MATERIAL-V001

Purpose: test Adam's binding order—surface sprite first, Material Maker depth second—with three
different material subjects and a controlled before/after render.

## Pair set

| Pair | Source sprite | MM additions |
|---|---|---|
| Plank siding | warm oak horizontal boards | blurred structural height, normal, AO, roughness 0.66 |
| Timber shingles | split-timber overlapping courses | blurred structural height, normal, AO, roughness 0.76 |
| Clay tiles | handmade terracotta courses | blurred structural height, normal, AO, roughness 0.70 |

In every graph the imported sprite is connected directly to Material Maker's albedo input. The
graph does not repaint or procedurally replace it. All three graphs use the same luma → 32-step
height → sigma-2 low-pass → normal/AO method; only roughness changes by subject.

## Evidence

- Three source sprites generated independently with built-in ImageGen.
- Three MM 1.3 graphs exported twice at 512² to Godot 4 ORM.
- Twelve maps (albedo, height, normal, ORM × 3) were byte-identical between runs.
- Albedo/source pixel correlation: 0.9984 plank, 0.9967 shingles, 0.9991 clay.
- Valid non-metallic ORM and measurable derived depth signal for all three.
- Fixed-rig cards compare the sprite-only render to the sprite + MM normal/AO render.

## Finding

The method passes: the sprite supplies visibly richer authored character and MM can add tactile
separation without replacing it.

The first unblurred trial also showed the central risk: naïve luma-to-normal conversion embosses
ink, grain, and painted shading as geometry. The retained graphs reduce that error with a low-pass
structural height stage and lower normal/AO strength. Production graphs should go further where
needed with subject-aware masks—for example, board joints should carry more depth than drawn wood
grain.

The pair set is evidence, not a shipping batch. All three source sprites fail at least one numerical
edge-seam threshold (RMS ≤10): plank 5.07/28.94, shingles 25.71/24.62, clay 15.83/19.13
(left-right/top-bottom). Repair the source sprite seams, regenerate the derived maps, and rerun the
same cards before admitting any tile.

Receipts:

- `manifests/sprite-first-material-experiment-v001.source.json`
- `receipts/sprite-first-material-v001-export-receipt.json`
- `receipts/sprite-first-material-v001-verification.json`
- `../material-cards/sprite-first-material-card-receipt.json`
