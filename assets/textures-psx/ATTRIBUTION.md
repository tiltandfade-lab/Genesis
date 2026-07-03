# assets/textures-psx — Attribution

CC0 tiling textures acquired for the PS1-style (Vagrant Story) battle board. All sources are
public-domain/CC0; diffuse (color) maps only — no normal/roughness/displacement maps kept.
Downloaded and vetted 2026-07-03. Total footprint: ~12MB (budget was ~20MB).

All images verified by magic-byte check (`file <name>`) to be genuine JPEG/PNG, not HTML error
pages or placeholders.

---

## 1. Screaming Brain Studios — Tiny Texture Pack 1 & 2

- Source: https://screamingbrainstudios.com/downloads/
- Pack pages: https://screamingbrainstudios.com/dl-tiny-texture-pack-1/ ,
  https://screamingbrainstudios.com/dl-tiny-texture-pack-2/
- Direct zips (resolved via redirect, confirmed 200 OK):
  - https://screamingbrainstudios.com/wp-content/uploads/2023/01/SBS_-_Tiny_Texture_Pack_1_-_128x128.zip
  - https://screamingbrainstudios.com/wp-content/uploads/2023/01/SBS_-_Tiny_Texture_Pack_2_-_128x128.zip
- License: CC0 / Public Domain, per site-wide statement and the `License.txt` bundled in the zip
  ("All Screaming Brain Studios assets have been released under the CC0/Public Domain License...
  can be released with or without credit."). `License.txt` is kept in this folder as proof.
- Date acquired: 2026-07-03
- Files kept (only the picks below were extracted from the 128x128 zips; the rest of each
  ~5-10MB pack was discarded after selection to stay in budget):
  - `sbs_dirt_01.png` — Dirt_01 (Pack 2) — rich brown dirt/mud
  - `sbs_stone_05.png` — Stone_05 (Pack 2) — rough tan/gray rock
  - `sbs_metal-rust_11.png` — Metal_11 (Pack 2) — orange rust plate
  - `sbs_wood_08.png` — Wood_08 (Pack 2) — weathered gray planks
  - `sbs_grass-moss_06.png` — Grass_06 (Pack 1) — dark patchy moss/turf
  - `sbs_elements-water_16.png` — Elements_16 (Pack 2) — mottled teal, used as shallow-water stand-in
- Skipped: Tiny Texture Pack 3 — only available via itch.io's interactive purchase widget
  (https://screamingbrainstudios.itch.io/tiny-texture-pack-3/purchase), no direct zip on the
  studio's own site. Per instructions, itch-only packs were skipped.

## 2. Poly Haven

- Source: https://polyhaven.com (all assets CC0)
- Pulled via the public API (`api.polyhaven.com/assets`, `api.polyhaven.com/files/<slug>`),
  1K JPG diffuse map only, for 10 materials:

| File | Poly Haven slug | Page |
|---|---|---|
| `bicolour_gravel_diff_1k.jpg` | bicolour_gravel | https://polyhaven.com/a/bicolour_gravel |
| `brown_mud_diff_1k.jpg` | brown_mud | https://polyhaven.com/a/brown_mud |
| `brown_planks_09_diff_1k.jpg` | brown_planks_09 | https://polyhaven.com/a/brown_planks_09 |
| `burned_ground_01_diff_1k.jpg` | burned_ground_01 | https://polyhaven.com/a/burned_ground_01 |
| `cobblestone_02_diff_1k.jpg` | cobblestone_02 | https://polyhaven.com/a/cobblestone_02 |
| `forest_ground_04_diff_1k.jpg` | forest_ground_04 | https://polyhaven.com/a/forest_ground_04 |
| `mossy_brick_floor_diff_1k.jpg` | mossy_brick_floor | https://polyhaven.com/a/mossy_brick_floor |
| `rock_06_diff_1k.jpg` | rock_06 | https://polyhaven.com/a/rock_06 |
| `rustic_stone_wall_02_diff_1k.jpg` | rustic_stone_wall_02 | https://polyhaven.com/a/rustic_stone_wall_02 |
| `rusty_metal_diff_1k.jpg` | rusty_metal | https://polyhaven.com/a/rusty_metal |

- License: CC0 1.0 (Poly Haven's blanket site license — https://polyhaven.com/license).
- Date acquired: 2026-07-03
- All 10 files verified as valid 1024x1024 baseline JPEGs via `file`.

## 3. ambientCG

- Source: https://ambientcg.com (all assets CC0)
- Pulled via the public API (`ambientcg.com/api/v2/full_json`) and the documented direct
  download pattern `https://ambientcg.com/get?file=<AssetId>_1K-JPG.zip`. Each zip is a full PBR
  bundle; only the `_Color.jpg` (diffuse) file was extracted and kept — normal, roughness,
  displacement, AO, and the .blend/.usdc/.mtlx/.tres files were discarded.

| File | ambientCG asset | Page |
|---|---|---|
| `ambientcg_moss002_diff_1k.jpg` | Moss002 | https://ambientcg.com/a/Moss002 |
| `ambientcg_rock064-mossyrock_diff_1k.jpg` | Rock064 | https://ambientcg.com/a/Rock064 |

- License: CC0 1.0 Universal (ambientCG's blanket site license — https://ambientcg.com/faq —
  "You can do whatever you want with the assets... no attribution required").
- Date acquired: 2026-07-03
- Both files verified as valid 1024x1024 baseline JPEGs via `file`.

---

## Gaps (honest notes)

- **No "bone/ash" material found on any of the three sources.** Searched ambientCG (`bone`,
  `ash`, `scorched`, `burnt`, `charred`, `skull`) and Poly Haven's asset tag index — the only
  "bone" hits were warning-sign decals (Sign003/Sign022/Sign025 on ambientCG), not tileable
  ground/prop textures. Screaming Brain Studios' Tiny Texture Packs 1/2 have no bone category
  either. The `manifest.json` intentionally leaves the `bone` key unset rather than force a bad
  fit — recommend a dedicated stylized paint-over or a different source (e.g. a hand-painted
  PS1-style bone/ossuary tile) later.
- **No true "shallow water" diffuse map found on Poly Haven or ambientCG** — both libraries treat
  water as a procedural/normal-map surface, not a photographed diffuse tile. `sbs_elements-water_16.png`
  (Screaming Brain Studios) is a mottled teal texture used as the closest stand-in; treat the
  `water` manifest entry as a placeholder pending a better source or a hand-authored tile.
- Tiny Texture Pack 3 skipped (itch.io-only, no direct site zip) — see above.
