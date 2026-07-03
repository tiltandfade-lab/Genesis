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

---

## 2026-07-03 gap-fill pass (branch `feat/psx-texture-pass`)

**Placeholder-tier, per DESIGN-GUIDE §II.0b.** Read `docs/DIRECTION.md` §4/§8 before extending
this further — the renderer is under a fidelity freeze dated the same day this pass ran ("no new
parts, verbs, FX, lighting features, or stage modes... next theater investment only post-soak, by
friction evidence"). This pass was scoped as a **data-only gap-fill**, not a new feature, on that
basis: it adds 2 new small image files + 3 manifest keys (one of which — `prop` — closes a real
dead wire in already-shipped code) and touches zero `.js`. Nothing here adds a rendering feature;
it fills semantic-key gaps in a manifest a prior session already built and wired.

Before downloading anything, the existing 18-file set (sections 1-3 above) was audited against the
task's 8 requested categories (rough stone/flagstone, packed dirt/mud, wood planks, mossy rock,
cliff rock, gravel/sand, marsh/wet ground, coarse fabric/banner weave). **5 of 8 already had solid
coverage** (`stone`, `dirt`, `wood`, `moss`, `rock` — re-downloading these would have been pure
duplication) and **1 existed only as a buried alternate** (`gravel`, promoted to a top-level key
below, no new file needed). Only 2 were genuine zero-coverage gaps — those two were downloaded.

### ambientCG (new files)

- Source: https://ambientcg.com (all assets CC0)
- Pulled via the same documented direct download pattern as section 3 above
  (`https://ambientcg.com/get?file=<AssetId>_1K-JPG.zip`), `_Color.jpg` diffuse map only kept.
- **Unlike the original 18-file set, both files below were PSX-ified before landing in this repo**
  — downscaled to 256x256 and desaturated to 72% of original saturation (texel-dirty per the PSX
  brief, not the original pass's "keep at 1K, downres at use time" approach). Total added weight:
  **19.6KB** (budget was ~1.5MB).

| File | ambientCG asset | Page | Treatment |
|---|---|---|---|
| `ambientcg_ground025-wetmud_diff_256.jpg` | Ground025 | https://ambientcg.com/a/Ground025 | 1K Color.jpg -> `sips -Z 256` -> Pillow `ImageEnhance.Color(0.72)` -> re-saved at JPEG q55. Wet mud/marsh ground stand-in (tags: mud, wet, clay, dirt) — the manifest's `wetground` key had zero prior entries. |
| `ambientcg_fabric066-weave_diff_256.jpg` | Fabric066 | https://ambientcg.com/a/Fabric066 | Same treatment. Coarse irregular canvas weave, picked over `Fabric030`/`Fabric061`/`Fabric062` (too flat, too fine/upholstery-like, and too regular/pin-dot respectively) for a banner/tent-cloth read at low res. The manifest's `fabric` key had zero prior entries. |

- License: CC0 1.0 Universal (ambientCG's blanket site license — https://ambientcg.com/faq).
- Date acquired: 2026-07-03.
- Both verified as genuine 256x256 baseline JPEGs via `file` (not HTML error pages).
- **Tooling note:** the task brief specified `sips` for the whole PSX-ify step, and `sips` did the
  resize + JPEG-quality step exactly as asked. `sips` has **no saturation/desaturation verb at all**
  (checked `sips --help` — only ICC profile matching, geometry ops, and format/quality; no HSL/gray
  blend option). Pillow (already present in this environment, `pip` not invoked) closed that one
  gap; `sips` remained the tool of record for the resize/quality step per the brief.

### Manifest changes (data-only, `manifest.json`)

- `gravel` promoted from `alternates`-only to a top-level key (value: the same
  `polyhaven/bicolour_gravel_diff_1k.jpg` already in this folder — no new download).
- `wetground` and `fabric` added as new top-level keys pointing at the two new files above.
- `prop` added, value: `polyhaven/cobblestone_02_diff_1k.jpg` (an already-loaded, already-vetted
  file — reused rather than adding a new one for a generic neutral prop surface). **This closes a
  real gap in shipped code**: `src/ui/theater-boot.js`'s generic prop-box fallback path reads
  `S.textures.prop` (search the file for `const propTex = S.textures.prop;`), but no manifest key
  named `prop` existed before this pass — every fallback prop box rendered flat-color only, with
  the texture branch permanently dead. No `.js` was touched; the fix is the manifest entry itself,
  consumed by a `loadTextureManifest`/`setTextures` code path that already existed and already
  silently degrades to palette-only on a missing key (so this was safe-by-construction to add).
- **`gravel`, `wetground`, and `fabric` are NOT wired into `TILE_KIND_TEXTURE_KEY`** (the
  `{floor, elevated, hazard, water}` map in `theater-boot.js` that decides which manifest key a
  given tile *kind* uses). That map is a closed, hardcoded 4-entry object with no biome/walk-aware
  keying layer today (confirmed by reading `src/engine/theater-data.js`, where tile `kind` is
  computed once, at line ~463, from exactly 4 literal values — there is no 5th kind for "muddy
  ground" or "gravel path" to hang off of). Building that keying layer would be a new theater
  FEATURE (a biome-to-texture-kind resolver that doesn't exist yet), which is explicitly what
  DIRECTION.md's fidelity freeze forbids today. These 3 keys are deliberately left as **loadable,
  inert data** — present in the manifest, fetched by the existing best-effort loader, sitting in
  `S.textures` ready for a future `kind` (or an explicit `setTextures()` caller) to reference, but
  consumed by nothing yet. This is the documented "swap-cheap seam" contract working as intended:
  the data landed ahead of the wiring, at zero risk, because the loader already no-ops safely on
  an unconsumed key.
