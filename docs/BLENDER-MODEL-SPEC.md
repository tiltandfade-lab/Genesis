# BLENDER-MODEL-SPEC — the Genesis model-authoring contract (Blender kitbash pipeline)

type: system-spec · status: **LOCKED by the noir pilot 2026-07-08** · owner: the Blender MCP pipeline
(`~/Desktop/Work/projects/genesis-blender-mcp/`, OUTSIDE the game manifest)

Every figure authored in Blender for Genesis follows this contract. It is extracted from the
shipped engine (file:line anchors below), not invented — where this spec and the engine disagree,
the engine wins and this spec gets fixed.

---

## §1 SCALE — the one law that kills "everything is one square unit"

**Engine ground truth** (all anchors verified 2026-07-08):

| constant | value | where |
|---|---|---|
| `TILE_SIZE` | **1 world unit = 1 tile = 5 ft** | `src/ui/theater-boot.js:139` |
| `WHOLE_OBJECT_SCALE` | **1.2** (mount-time multiply, one constant) | `src/ui/theater-boot.js:156` |
| Medium authored height | **≈1.45 model units** (humanoid head-top 1.475) | `dev/model-qa/creatures/humanoid.js:20`, size law `dev/model-qa/sheets/INDEX.md` |

**The size-law ladder** (authored model units, pre-`WHOLE_OBJECT_SCALE`; disc radii from
`docs/P1-WIRING.md` §1 + the live registry `src/ui/theater-figures.js` discR values):

| band | authored height | disc r |
|---|---|---|
| Small | ~0.95 u | 0.32 |
| Medium | ~1.45 u | 0.42 |
| big-Medium | ~1.6 u | 0.48 |
| Large | ~2.1 u | 0.55 |
| dragon-Large | ~2.3 u | 0.62 |
| Huge | ~2.7 u | 0.68 |

**The mapping.** A Medium 6-ft human = 1.45 authored u = 1.74 wu mounted, standing on a 1-wu
(5-ft) tile. That is the deliberate **heroic-miniature overscale of ×1.45** versus ground scale
(0.29 wu/ft figure vs 0.20 wu/ft terrain) — the 28mm-mini convention, uniform across every piece.

> **THE FIGURE SCALE LAW: authored model units = real-world feet × 0.2417** (= 1.45 u per 6 ft),
> applied to ALL THREE AXES of every piece that stands on the board — creature, vehicle, mount,
> centerpiece. Never normalize a piece to the tile.

Worked example — the Sherman-tank truth: M4 Sherman ≈ 19 ft long × 8.6 ft wide × 9 ft tall →
authored **4.6 × 2.1 × 2.2 u**. Next to the 1.45-u human: the tank is 1.5× his height and 3.2
humans long — proportionally TRUE. Its footprint overhangs tiles the way a big mini overhangs
squares; gameplay footprint stays the disc/occupancy the engine assigns, geometry does not care.

**Blender convention:** 1 Blender unit (meter) = 1 authored model unit. Author at MODEL scale —
the engine applies ×1.2 at mount; never bake `WHOLE_OBJECT_SCALE` into geometry.

### §1b PROPS — the scale contract is the pre-modeling checklist

**`dev/model-qa/prop-scale-contract.js` is THE authoritative single source for prop sizes**
(feat/prop-scale-framework, 2026-07-08). Every `prop:*` / `light:*` / `blank:*` registry key has a
row: `key → { targetFt: { h:[min,max], w?:[..], d?:[..] }, rationale }` — staged FEET under the
human=6ft yardstick (`FEET_PER_UNIT = 6.0/(1.475×1.2) ≈ 3.39` per staged unit).

**Before modeling ANY new prop** (probe-lib band-stack or Blender/GLB), in this order:

1. **Add its contract row FIRST** — decide what the noun really measures in the world (h always;
   claim w/d only where the noun makes a footprint claim: a gate spans, a coffin holds a body).
2. **Derive authored units from targetFt:** `authored u = target ft ÷ (4.07 × Size multiplier)`
   (sizeless props: multiplier 1.0; a realm-bespoke prop staged by exactly one
   `data/realm-props.js` entry inherits that entry's Size — Small 0.55 / Medium 0.80 / Large 1.00 /
   Huge 1.60 — so hit the target THROUGH it).
3. **Build to those units**, then confirm on `dev/model-qa/prop-sheet.html` — it imports the
   contract and red-flags any staged cell outside its row.

**The base disc is a BASE, not a size law.** The 2026-07-08 scale audit found most base props
authored to fill the 0.84u disc regardless of noun (well = crate = statue = grate ≈ 3.4×3.4 ft).
Size the GEOMETRY to the contract; pick `discR` (registry + the baked module disc, kept equal)
to seat the footprint — geometry may overhang the disc exactly like a big mini overhangs its base.
**Never widen a contract range to green a cell** — fix the model, or leave the cell honest-red
(CLAUDE.md: validators preserve the thing's job).

## §2 TRI BUDGET

Hard gate: **[120, 2600] tris per figure** — the verify harness rejects outside this
(`dev/verify-theater-figures.mjs:157`: `triCount >= 120 && triCount <= 2600`). Per-piece targets:

| tier | tris |
|---|---|
| mook / kit-assembled NPC | 300–600 |
| elite / named figure | 600–1200 |
| centerpiece (boss, vehicle, set-piece) | 1200–2600 |

Floor discipline: 120 is a REAL floor — a figure under it reads as untextured geometry soup at
1/3-res; add silhouette detail (hat brim, coat tails, prop), not smoothing.

## §3 STYLE — gritty PS1 / Vagrant Story

The engine re-renders everything through the PSX pass (`PSX_DITHER_AMPLITUDE 48`,
`PSX_VERTEX_SNAP_GRID 96`, `PSX_RES_SCALE 1/3`, `theater-boot.js:104-110` /
`dev/model-qa/ps1-sheet.html:143`). Author FOR that pass:

- **Faceted only.** Every polygon flat-shaded (`use_smooth = False`); no smooth shading, no
  normal tricks. The facet IS the surface language.
- **No textures.** Flat per-face material/vertex colors only — no UV image maps. The engine
  applies its own texel-grain atlas + per-material pixel-skin programs at runtime
  (`figureMaterialFor`, `theater-boot.js:535`). The Blender addon's in-hue noise-ramp dirt
  (`apply_ps1_material`) is acceptable for probe renders because it mimics that grain; the
  authored truth is the flat palette color.
- **Chunky silhouettes.** The read must survive 1/3-res + dither: exaggerate the one identifying
  shape (fedora brim, coat tails, drum magazine) ~20% past realistic. If two figures blur
  together in a squinted 128-px thumbnail, one of them is wrong.
- **Desaturated VS surface.** Author in the realm's own key (§4); no candy saturation outside
  bright-kingdom; specular near-zero except metal reads (engine buckets metal/glass itself,
  `matBucket`, `ps1-sheet.html:247`).

## §4 PER-REALM COLOR KEYS

The engine grades every authored color at runtime through `gradeColor(hex, realmRenderProfile(...))`
(`data/realms.js:137-207`): (1) lerp toward/past Rec.601 grey by `sat`, (2) lerp toward `tint` by
`tintAmt`, (3) scale distance from mid-grey by `contrast`. **So author in the realm's own key and
let the grade unify** — and author accents HOT, because sub-1 `sat` halves chroma before the tint
mutes it further.

Engine grade profiles (verbatim from `data/realms.js`):

| realm | sat | tint | tintAmt | contrast |
|---|---|---|---|---|
| frontier | 0.75 | `#c88a3c` | 0.20 | 1.05 |
| chrome | 0.85 | `#3ec8c0` | 0.18 | 1.15 |
| **noir** | **0.45** | **`#4a5878`** | **0.28** | **1.35** |
| ash | 0.60 | `#c9b27a` | 0.22 | 1.10 |
| suburb | 0.90 | `#d8a868` | 0.15 | 0.85 |
| cosmic | 1.25 | `#8a3ce0` | 0.30 | 0.90 |
| theater | 0.65 | `#6e6238` | 0.22 | 1.10 |
| high-seas | 0.85 | `#3c7888` | 0.20 | 1.10 |
| lost-world | 1.00 | `#c89a3c` | 0.15 | 1.05 |
| gloom | 0.55 | `#3a5c3e` | 0.26 | 1.25 |
| bright-kingdom | 1.25 | `#ffb0e0` | 0.24 | 0.92 |
| realm-neutral | 1 | — | 0 | 1 (byte-identical passthrough) |

### §4.1 NOIR — the pilot key (full detail)

Near-monochrome: charcoal / ivory / smoke on a slate-blue field, ONE hot accent per figure
maximum. Graded values computed with the engine's actual `gradeColor` math (2026-07-08):

| swatch | authored | graded under noir | use |
|---|---|---|---|
| ink-black | `#17171c` | `#060b1a` | shoes, gun furniture, deepest shadow mass |
| charcoal-suit | `#2b2b30` | `#191f2d` | the default suit body |
| slate-hat | `#3d4048` | `#2c3342` | fedora, waistcoat |
| gunmetal | `#5a616b` | `#4a5263` | tommy gun, hardware |
| smoke-grey | `#6e7076` | `#5b6270` | trousers, mid-value break |
| ash-trench | `#8a8578` | `#73767c` | civilian overcoat, worn cloth |
| pale-skin | `#c2a488` | `#9f9797` | skin (grades to grey-flesh — correct noir) |
| ivory-shirt | `#d8d4c8` | `#bfc3c9` | shirt front, cuffs, the light mass |
| blood-accent | `#b02218` | ~`#65302f` | tie / pocket square / wound — max ONE per figure |
| neon-accent | `#d94f8e` | `#925b83` | the one neon-sign note (signage, boutonniere) — alternative accent, never alongside blood |

Value discipline: every figure carries one LIGHT mass (ivory), one DARK mass (charcoal/ink), one
MID (smoke/ash) — contrast 1.35 crushes anything mushier into mud.

### §4.2 The other ten keys (author-ready 6–8 hex palettes, tuned under each grade)

- **frontier** — dust tan `#b89968`, saddle leather `#7a5836`, faded duster `#9c8a70`, bleached
  wood `#a08a64`, denim `#4e5a6e`, gunmetal `#6b6f74`, bone `#d8cdb4`, blood `#a3241e`.
- **chrome** — hull white `#ccd4d8`, panel grey `#7e878e`, carbon `#23262a`, chrome steel
  `#9aa4ac`, cable black `#17181c`, teal glow `#3ec8c0`, visor cyan `#7ee0da`, amber warning `#d89a2c`.
- **ash** — scorched asphalt `#3a3835`, rust `#8a4a2c`, oxide orange `#b06a30`, dust khaki
  `#a89468`, tarp olive `#5c5a40`, dead steel `#74716a`, bone `#cfc4a6`, warning yellow `#c2a02c`.
- **suburb** — lawn green `#6a9a52`, siding pastel `#d8cfc0`, brick `#9a5a44`, mailbox blue
  `#5a7ab0`, asphalt `#55534e`, sunset amber `#d8a868`, curtain rose `#c88a92`, skin `#c2a488`.
- **cosmic** — abyss `#1c1430`, void violet `#4a2c78`, deep indigo `#2c2a5e`, sickly teal
  `#3e8a80`, flesh-that-isn't `#9a7a9c`, star ivory `#d8d0e0`, glow magenta `#c04ad0`, bone
  chartreuse `#a0a848`.
- **theater** — mud brown `#5c4a34`, field grey `#6e6d60`, olive drab `#5a5c3c`, webbing khaki
  `#9a8a64`, rust wire `#7a4a2c`, gunmetal `#62666a`, bandage `#cfc4a6`, brass `#b08d46`.
- **high-seas** — tar hull `#2c2a26`, sailcloth `#d0c6a8`, brine oak `#7a5f3e`, navy coat
  `#2e3a56`, sea teal `#3c7888`, rope hemp `#a89060`, brass `#b08d46`, blood `#a3241e`.
- **lost-world** — sandstone `#c2a068`, terracotta `#a05a34`, ivory ruin `#d8cdb4`, jade
  `#3c8a5e`, lapis `#2c4a8a`, gold leaf `#d8b03c`, vine `#6a8a3c`, obsidian `#201e22`.
- **gloom** — grave soil `#3a322a`, black lacquer `#1a181a`, mould green `#56683e`, dried blood
  `#6e2820`, iron `#55575a`, shroud grey `#8a877c`, candle tallow `#d0c090`, sallow skin `#b09a74`.
- **bright-kingdom** — candy red `#d83c48`, sky cyan `#58c8e0`, coin gold `#e8c23c`, pipe green
  `#48a858`, grape `#8a4ac0`, cotton pink `#e890c0`, mushroom cream `#e8dcc0`, licorice `#2c2830`.

## §5 CONNECTION LANGUAGE — how a piece meets the board

- **Ground plane:** feet/tread at Blender z=0 (engine y=0 after export).
- **Facing:** author the figure facing **−Y in Blender**. The glTF exporter's default +Y-up
  conversion maps Blender −Y → glTF +Z, landing the engine's front-=+z law
  (`docs/P1-WIRING.md` §2.1: "front = +z for every family").
- **Base disc:** every figure seats on a cylinder disc — radius from the §1 ladder (Medium
  0.42), **height 0.055** with the figure's feet on the disc top (engine bake:
  `creatures/humanoid.js:157-163`, disc top y≈0.055). Neutral disc colors `#4a4038` side /
  `#585047` top. Addon verb: `seat_on_base` (pick `margin` so the produced radius lands on the
  ladder value; override radius via `execute_code` when the bbox-derived radius drifts).
- **Origin:** at base-disc center, z=0.
- **One object per export:** figure joined to a single mesh + its `<name>_base` disc; export the
  pair. No parenting hierarchies, no armatures in v1.
- **Naming:** kit parts `,<realm>-kit-<part>-<variant>` (e.g. `noir-kit-torso-tuxedo`,
  `noir-kit-head-fedora`); assembled figures `<realm>-fig-<name>` (e.g. `noir-fig-brute`); the
  disc `<figure>_base`. GLB file = figure name: `out/<realm>/<name>.glb`.
- **GLB export:** `export_format='GLB'`, selection-only (figure + base), exporter defaults
  otherwise (+Y up ON, apply modifiers). No cameras/lights in the export.

## §6 KITBASH GRAMMAR — how a realm kit becomes figures

**The kit** = the realm's shared part library, authored ONCE at canonical landmark positions
(the humanoid landmark table, `creatures/humanoid.js:17-21`, stocky 4.5-head proportions):
hip 0.72 / waist 0.80 / chest 1.02 / shoulder 1.10 / jaw 1.175 / head-top ~1.45.

- **Parts:** one torso per costume family (`-torso-tuxedo`, `-torso-trench`), 2+ head variants
  (`-head-fedora`, `-head-bare`), arm blocks, leg blocks, prop blocks (weapon/tool). Each part is
  its own named object with its palette materials already applied.
- **A figure = assembled duplicates + per-figure mutations**, in this order:
  1. duplicate the needed kit parts (kit originals stay pristine at a parking offset);
  2. **mutate** — scale a region (brute chest ×1.25), swap a variant (bare ↔ fedora), recolor
     within the realm palette (civilian: charcoal → ash-trench), add ONE prop (tommy gun, baton);
  3. join to one mesh, name `<realm>-fig-<name>`, facet, seat on the ladder disc, export.
- **Mutation depth law:** a mook differs from the kit by 1–2 mutations, an elite by 2–3 + a prop,
  a centerpiece may add bespoke geometry — but silhouette-first: the mutation must survive the
  128-px squint test (§3).
- **The next realm kit follows this same recipe**: new torso/head/prop vocabulary in that realm's
  §4 key, same landmark table, same ladder, same naming. The kit is the unit of authoring; the
  figure is the unit of export.

## §7 Pipeline verbs (the Blender addon, `genesis_blender_addon.py`)

Socket 127.0.0.1:9876, one JSON `{type, params}` per request. Canonical figure flow:
`clear_scene` → build (`add_primitive` / `execute_code`) → per-part `apply_ps1_material`
(authored hex, `desaturate` 0–0.15 — the palette is already in key) → `join_objects` →
`set_faceted` → `decimate` if over budget → `seat_on_base` → `export_glb` → `render_probe`.
Verify tri counts via `get_scene_info` — report actuals, never assume.

Known verb friction (noir pilot, 2026-07-08): `seat_on_base` derives disc radius AND center from
the figure's full bbox — a held prop (tommy gun) balloons the disc and shifts it off the stance.
Workaround: seat, then correct radius/center to the §1 ladder via `execute_code`. Proposed fix:
optional `radius` + `center` overrides on the verb.

## §8 Pilot record — NOIR (2026-07-08, built live through the socket)

Driver: `genesis-blender-mcp/noir_pilot.py`. Outputs in `genesis-blender-mcp/out/noir/`:

| figure | tris | disc r | GLB | probe |
|---|---|---|---|---|
| noir-fig-brute | 264 | 0.48 (big-Medium) | `brute.glb` | `brute.png` |
| noir-fig-gangster | 438 | 0.42 | `gangster.glb` | `gangster.png` |
| noir-fig-maestro | 332 | 0.42 | `maestro.glb` | `maestro.png` |
| noir-fig-civilian | 312 | 0.42 | `civilian.glb` | `civilian.png` |

Plus the kit (`noir-kit.glb`: torso-tuxedo / head-fedora / head-bare / arm-block / leg-block)
and the group shot `lineup.png` (900px, front). All four figures inside [120, 2600]; every one is
kit parts + ≤3 mutations + ≤1 prop per the §6 grammar (brute = torso×1.35 w + shirt-sleeve recolor
+ big fists; gangster = fedora + blood tie + tommy gun; maestro = ink tailcoat + bowtie + neon
boutonniere + baton; civilian = ash recolor + flat cap).
