# Checkpoint 0 — root-cause notes (one per diagnosed problem)

Commit `a3dd41dd`, branch `clay/cl-r1-r3`. Every claim below was reproduced live through the
production renderer and is quantified in `before/capture-receipt.json`. Nothing here is a fix;
this is the diagnosis the later checkpoints correct.

## 1. The room does not describe its own forms

- **No environment AO exists anywhere in the pipeline.** The post chain is exactly
  `[RenderPass, DoF, Bloom, Grade, OutputPass]` (`src/ui/theater-boot.js:6180-6184`). Nothing
  depth-aware runs; seam/corner/contact definition depends entirely on direct shadow maps.
- **Neutral is authored as pure ambient.** `clay-neutral-truth` =
  `ambient 0.62 white, lights: []` (`data/light-profile-locks.json:409`). Ambient light is
  orientation-independent, so every face of the cube/stairs/sphere renders the identical value —
  the forms cannot read, by construction. With no AO/contact term there is nothing else to
  separate them.
- **Day/moon flatness:** one directional + flat ambient; vertical faces at low N·L fall to
  charcoal while tops go uniform pale. The only counter-terms are hemi 0.06–0.08 and ambient —
  both orientation-blind (receipt: `lighting.daylit`, `lighting.moonlit`).
- **Fire/magic/lava crush:** small-range point sources (magic live distance 6; lava's glow does
  not even register as a practical) over a near-zero ambient floor — everything outside the pool
  is black, and adding AO without an environment-form fill would deepen exactly that.
- **The persistent brown void:** the interior channel's background/fog =
  kit-authored fog color, else `voidTintFor(env)` — keyed ONLY by `env`, never by light recipe
  (`src/ui/theater-boot.js:11551-11569`). Measured: scene background `0x301e15` under all seven
  recipes (receipt: every `lighting.*.sceneBackgroundHex`).
- **Figure-base darkening is not environment AO.** The CL-R2 contact pools are per-standee, and
  the 0.06 hemisphere is a diagnostic-mode value floor; neither touches wall/floor seams, stair
  corners, or the structure fixture's geometry.

## 2. Warm/cool tests empty floor instead of the subjects

- **One line kills the authored reach:** `authoredRange: lightRecipe.id === "torchlit"`
  (`src/engine/clay-room.js:956`). Every non-torch recipe light is clamped by
  `ITR_LIGHT_DISTANCE_CAP = 7` (`src/ui/theater-boot.js:1540`, applied at `:9335`).
  Authored `rangeM 18.288` (12 world units) → live `PointLight.distance = 7`.
- **The mount path destroys the authored opposition.** Wall mounts snap to the nearest available
  mount slot (`interiorNearestWallMountSlot`, `:9254`). Measured result: warm mounts on the west
  wall at `(-7.38, 1.13, 0)`; cool re-resolves to the **north** wall at `(3.5, 1.13, -7.38)`.
  The authored opposing pair (±0.8 normalized, y 1.7) does not exist in the frame.
- **The subjects are mathematically outside both lights.** Distance from warm to the subject
  cluster at room center ≈ 7.40 u > 7; from cool ≈ 8.19 u > 7. With `decay 0` each pool is a
  flat disc with a hard cliff at 7 u. The central sphere/cube/stairs/sprite receive **zero**
  direct light — only ambient 0.18 + hemi 0.06.
- **The readout reports the authored values** (±0.8 positions, 18.288 m range, y 1.7), not the
  mounted truth. The range rings draw from the live capped distance, so the overlay and the
  readout disagree with each other as well as with the frame.

## 3. Lore-native recipes are not staged around what they must reveal

- **Sun/moon/lava never enter the readout registry.** Environmental sources
  (`visibleEmitterRequired: false`) build THREE lights directly (`theater-boot.js:9342+`) and are
  never registered where the Lights readout and lighting proof read
  (`lighting.daylit.liveMountedLights.practicals = []` under a strong visible sun). The panel is
  structurally unable to describe the dominant light of five of seven recipes.
- **Magic and lava have no source geometry.** The fixture vocabulary contains only
  `bracket-generic` and the torch; magic renders as a bare violet point (live distance 6), lava
  as an unregistered red glow at floor level. There is no crystal/rune/fissure emitter to stage.
- **The torch lights empty floor** because recipe light positions are room-normalized and the
  bench subjects sit at room center, outside its west-wall pool; nothing composes source and
  subject together.
- **The background/fog cannot respond to the recipe** (see §1, env-keyed void).

## 4. The structure bench is a specimen pile, not an intelligible construction proof

- The fixture record scatters the eight specimen atoms around the 32-cell host shell with no
  composed construction example, no in-scene label projection, and no framing hierarchy — the
  shell dominates while the atoms read as debris (before frames `f01-assembled-*`).
- The human witness occupies well under 1% of the default frame; it cannot do its scale job.
- Layout: at a 760-px window the docked inspector (250 px) plus the left rails (170 px) squeeze
  the renderer to a **340-px portrait strip** (receipt: `structure.narrowLayout`,
  `panelFractionOfWindow 0.313`).

## 5. Some geometry and overlays lie visually

- **Ramp:** `clayStructureRampGeometry` (`theater-boot.js:16666`) builds 6 shared vertices,
  indexed, then `computeVertexNormals()` — which averages normals across the walk surface,
  underside, high face, and side triangles. The wedge shades like an inflated pillow.
- **Access overlay:** `clayStructureAddAccessOverlay` draws one colored strip rectangle around
  each object's top. The record carries per-face data (`access.top/sides/underside/treads`), but
  the overlay never projects it per face.
- **Sockets overlay:** cyan strips and X marks only; the record's socket `type` and `axis` are
  not projected, so a connection cannot be understood from the frame.
- **ALL WALLS:** the fixed 72° strategic camera does not fit-to-viewport; the room crops at
  1280×720 and worse when narrow (before frames `f01-strategic-*`).
- **Reporting contradiction (measured):** in strategic mode the shell reports
  `built 11 / omitted 0 / total 11` and `wallOmission.active: false`, while the
  `cameraSideOmission` projection still reports `active: true` with 2 omitted segments
  (receipt: `structure.strategic`). Two reporting authorities answer one state differently.
  The latch mechanics themselves are correct (receipt: `structure.latchSequence`).

## Review conditions (recorded per the checkpoint contract)

1280×720 @ dpr 2 headless Chrome (ANGLE GL) plus a live 960×540 @ dpr 2 interactive session;
shadow maps ON; tone map AgX strength 1; post chain `[render, dof, bloom, grade, output]`
(AO: none); background `0x301e15` all recipes; measured 60 FPS (median frame 16.7 ms) under both
daylit-static and torchlit-flame paths. Full per-recipe mounted-light values:
`before/capture-receipt.json`.
