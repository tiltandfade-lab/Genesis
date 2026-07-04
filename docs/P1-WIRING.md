# P1-WIRING — P1′: Whole-Object Figures into the Live Engine Renderer

```
type: system-spec
project: Genesis
status: SPECCED (drafted by the Plan seat 2026-07-04; open questions RESOLVED and locked by the
orchestrator same day under Adam's standing greenlight — "the step that puts all 82 pieces into
actual play - yes". Taste-flagged items Q4/Q5 ride the evening Adam ledger.)
governing rulings: dev/model-qa/REFERENCE-DIRECTION.md §P1′ (2026-07-03 late-night wave) — LOCKED
related: BATTLE-THEATER.md · MODEL-GRAMMAR.md · POLISH-WAVE-1.md · REFERENCE-DIRECTION.md
```

## §0 What this is, and the rulings that bind it

Wire the whole-object figure/prop roster (verified in the current tree as **73 modules exporting
77 builders** in `dev/model-qa/creatures/`, rostered by the `SETS` table in
`dev/model-qa/ps1-sheet.html:36-134`; "82 pieces" is the INDEX.md accounting) into the live
theater renderer (`src/ui/theater-boot.js`), demoting the composed-cuboid figures to fallback.

The locked rulings, verbatim from `dev/model-qa/REFERENCE-DIRECTION.md` §P1′ (L248-283):

> "The class-roster wave supersedes the cuboid-parts figures for the ROSTER (PCs + named/key
> monsters); **cuboid-parts demotes to auto-fallback + nearest-sub for the bestiary tail**."

> "**RULED — individual bespoke models** (board-piece mentality); an anomalous game creature
> subs in the nearest existing model, 'like we do in real life.' Modular parts (`parts.js`)
> stay as an authoring accelerant, never a runtime assembly."

> "**RULED — textures are GENERATED, never painted assets** (Adam: 'a. yes b. yes'): (a) The
> TEXEL GRAIN pass is default-on … (b) P1′ engine wiring carries **MATERIAL CHANNELS on
> whole-object quads**: palette keys tag cloth/metal/skin/leather/bone regions at author time,
> and theater-boot's existing per-material pixel-skin texel programs (L18…) paint each region
> when figures flow through `figureMaterialFor`."

> "P1′ build order: (1) whole-object path in theater-boot (`landmark builder → BufferGeometry
> + uv/channel attrs → figureMaterialFor → applyPsxShaderTweaks`), gated, cuboids fallback;
> (2) `creatureId → builder` registry (the recipe seam); (3) races as RIG variants …;
> (4) monster waves by CR, deduped by silhouette family, sized … T2 GLTFLoader seam stays."

This spec covers build-order items **(1)** and **(2)**, plus the **lighting-prop anchoring**
that `dev/model-qa/creatures/prop-light.js:5-9` explicitly reserves for P1′ ("ENGINE NOTE: …
At P1′ wiring, the scene's point lights should SOURCE at these props"). Items (3) and (4) are
out of scope (§6).

## §0.1 Orchestrator resolutions (LOCKED 2026-07-04 — do not re-litigate)

- **R1 (module home):** import IN PLACE from `dev/model-qa/creatures/` (§3-D6). The ruling
  fixes the authoring home; the `src → dev` runtime dependency is accepted; relocation to
  `src/ui/figures/` is an OPTIONAL post-soak chore, not this unit.
- **R2 (scale):** `WHOLE_OBJECT_SCALE = 1.3` is the default (legacy-parity presence, Medium
  ≈1.89 world units). The capture-gate sheet must include ONE comparison pair at 1.5 so the
  director can flip the single constant if he wants the bigger read.
- **R3 (roster count):** the registry-completeness check asserts against the REAL 77 exported
  builders (SETS cells), with a comment reconciling the "82" INDEX accounting. No phantom 5.
- **R4 (NEAREST_SUB):** executor hand-drafts the starter table; orchestrator gates it at
  capture review; the full alias table goes on Adam's evening ledger for taste amendments.
- **R5 (D10 side-read):** proceed disc-only side signal for pc/ally whole-object figures;
  explicitly listed on Adam's evening ledger + a dedicated read-check frame in the capture
  gate sheet. If the gold read is missed at the gate, the fix is a rim-intensity bump on the
  pc disc, not figure tinting.

---

## §1 Ground truth — the current tree, verified anchors

**The builder contract** (`dev/model-qa/probe-lib.js`):
- Quad-soup accumulator buffers: `let POS = [], COL = []` (L22), `resetGeom()` (L23),
  `getBuffers() → {POS, COL}` (L24).
- `quad(a,b,c,d,hex,jitter)` (L28-31) pushes 2 tris; color constant per tri, deterministic
  jitter (`resetJitter` L18, reset by `resetGeom`).
- Primitives: `ring` (L38), `stitch` (L50), `capFan` (L60), `stack` (L68), `tube` (L77),
  `blob` (L87). Node-safe by construction (header L10-13: relative three import, no WebGL
  until `mountSheet` L101).
- A creature module is one ES module exporting one or more `export function buildX()`
  functions that call these primitives between the caller's `resetGeom()`/`getBuffers()`
  (e.g. `buildHumanoid` in `creatures/humanoid.js:8`, `buildWolf` in
  `creatures/mon-wolf.js:11`). Prop builders take an optional `ox = 0` x-offset
  (`prop-light.js:64`); the engine always calls with no args.

**The in-engine QA gate** (`dev/model-qa/ps1-sheet.html`) — the byte-faithful copy of
theater-boot's PSX pass:
- Engine tunables mirrored at L143: `PSX_DITHER_AMPLITUDE = 48.0, PSX_VERTEX_SNAP_GRID = 96,
  PSX_RES_SCALE = 1/3` (now `?res=`-overridable, default literal 1/3 — chore/grit-compare),
  `VOID_BG 0x0a0908`; `DITHER_GLSL`/`VERTEX_SNAP_GLSL`/`applyPsxShaderTweaks` at L145-174.
- The texel-grain atlas `grainTexture()` (L197-225, seeded 128px canvas, NearestFilter, no
  mipmaps, `?grain=0` toggle) + per-quad UV windows `quadUVs()` (L226-239, tri pairs share a
  14×14-grid window).
- The specular bucketing `matBucket(r,g,b)` (L247-253): coarse color read → 0 matte / 1 metal
  / 2 glass; `figureScene()` (L254-307) rebuilds tris bucket-contiguous, `addGroup`s ranges,
  and uses three materials: Lambert matte, Phong(shininess 46, specular 0x8a8f94) metal,
  Phong(95, 0xbfdbe8) glass — all `{vertexColors:true, flatShading:true, map: grain}` + PSX
  tweaks. Lights: key 0.72 @ (5,9,7) / fill 0.22 / ambient 0.32 (L294-296) — matching
  theater-boot's mount lights (`theater-boot.js:2412-2421`).

**The engine seams** (`src/ui/theater-boot.js`, 2961 lines):
- `ARCHETYPE_BUILDERS` L597-607; `figureFor(archetype, seed, tint, silhouette, weapon,
  recipeSlug, pcRecipe, kind)` L1665-1694 — precedence today: `pcRecipe > recipeFor(recipeSlug)
  > archetype builder`. `recipeFor` L1658-1663 (overrides → generated → null).
- `figureMaterialFor(color, opacity, skinKey, glossy)` L535-570 — the material funnel (albedo
  floor L289-304, pixel-skin canvas path, Phong glossy branch); `addBox` L866-878;
  `renderPartInto` L924-954; `buildFigureFromRecipe` L1522-1648.
- `applyPsxShaderTweaks` L2342-2365 (DITHER_GLSL L2310, VERTEX_SNAP_GLSL L2331; constants
  L104-110; `PSX_RES_SCALE` L575).
- `setUnits` L2719-2873: clearGroup sweep, per-unit `figureFor` L2810, `FIGURE_SCALE(1.5) ×
  sizeScaleFor(recipe.size)` L2821-2823 (SIZE_SCALE table L182-188), down-topple +
  `desaturateGroup` L2824-2830, condition mods L2840, hostility base disc L2857-2861 (radius
  `0.34 * figScale`, `baseDiscMatFor` L1749-1758), grounding blob L2868 (radius ×1.15).
- `setBoard` L2467-2621: props L2572-2617 (`p.part → Parts.PARTS[part]` via renderPartInto,
  `partParams.scale` honored at group level L2603-2604, generic box fallback L2609-2616);
  `applyLightProfile((data.light && data.light.profile) || "dark")` L2546; `LIGHT_PROFILES`
  L2037-2099 (point positions are fractions of board half-extents, `applyLightProfile`
  L2121-2153, flicker L2166-2180).
- `clearGroup` L1974-1984 — **disposes geometry+materials of every child** (matters for
  caching, §3-D7).
- Orientation law machinery: `BASE_ORIENT_YAW` L656-660 (torso-quad/thorax-abdomen −90°,
  serpent-coil +90°), applied in `buildFigureFromRecipe` L1534 and `figureFor` L1692.
- Public surface `window.Theater` L2945-2948 + `pixelSkin` accessor L2957-2961 (the toggle
  pattern to copy).

**The data seams** (`src/engine/theater-data.js`):
- `theaterUnitsFrom(combat)` L1048-1155: PC unit L1089-1115 (carries `silhouette`, `weapon`,
  `pcRecipe` — but **not the class name**); allies L1117-1135 (`recipeSlug: a.statId`); foes
  L1136-1152 (`recipeSlug: f.statId || null` — the bestiary id `cmFoeFrom` stamps,
  `src/engine/combat.js:74`).
- `theaterArchetypeFor` L579-596; `theaterPropForText` L369-383 over
  `THEATER_PROP_KEYWORD_RULES` L248-366; light: `THEATER_LIGHT_TABLE` L101,
  `theaterRollLightProfile` L137, `theaterRollLight` L183, stamped as `board.light.profile`
  inside `theaterBoardFrom` L405 (light block L506-531).
- Recipes: `data/model-recipes.js` (generated, 510 slugs keyed by bestiary id) +
  `data/model-recipe-overrides.js` (hand-authored, wins by slug — mutation-proof fixture
  `goblin-warrior` at L62-73).
- Script order: `genesis.html:1119-1120` (recipe data) … `genesis.html:1219`
  (`<script type="module" src="src/ui/theater-boot.js">`).

**Size law as shipped** (`dev/model-qa/sheets/INDEX.md`): Small ~0.95u / disc r0.32 · Medium
~1.45u / r0.42 · big-Medium r0.48 · Large ~2.1u / r0.55 · dragon r0.62 · Huge ~2.7u / r0.68.
Modules bake **absolute** size and their own neutral base disc (humanoid disc r0.42 at
`creatures/humanoid.js:163-169`; hill giant r0.68, `creatures/mon-giant.js:256-261`).

---

## §2 Data shapes (exact — the contract this unit is built and verified against)

### §2.1 Builder output (existing, unchanged semantics; one additive buffer)

```
caller protocol:  resetGeom(); buildFn(); const { POS, COL, CHAN } = getBuffers();
POS  : number[]  length = triCount*9   — x,y,z per vertex, 3 verts/tri, CCW outward
COL  : number[]  length = triCount*9   — linear r,g,b in [0,1], constant per tri
CHAN : Uint8Array length = triCount    — NEW (P1′): material-channel code per tri,
                                         0 = untagged (classifier decides)
```
Conventions every module already holds (verified against `humanoid.js`, `mon-wolf.js`,
`mon-rat.js`, `mon-giant.js`, `spider.js`, `prop-light.js`): y-up; ground plane y=0 (base
disc top ~y=0.055); **front = +z** for every family; authored absolute size per the size law;
baked neutral base disc; the house eye standard baked in geometry (`humanoid.js:65-72`).

### §2.2 The material-channel key vocabulary (closed)

```
CHANNEL_KEYS = ["", "skin", "cloth", "leather", "bone", "metal",
                "scale", "fur", "wood", "stone", "glass", "glow"]
// index = the CHAN byte. "" (0) = untagged → coarse-color classifier.
```
Render mapping (one table, `WHOLE_CHANNEL_RENDER` in theater-boot):

| channel | material class | L18 texel program (atlas window family) |
|---|---|---|
| "" / skin / wood / stone | Lambert | generic (grain only) |
| cloth | Lambert | cloth (weave banding) |
| leather | Lambert | leather (mottle) |
| bone | Lambert | bone (joint cracks) |
| scale | Lambert | scale (offset rows) |
| fur | Lambert | fur (directional streaks) |
| metal | Phong (shininess 46, specular 0x8a8f94) | plate (bands + rim) |
| glass | Phong (shininess 95, specular 0xbfdbe8) | generic |
| glow | Lambert (v1 = matte; real emissive deferred) | generic |

Author-time tagging API (additive to probe-lib; zero-touch back-compat):
```
setChannels({ 0x9aa1a6:"metal", 0x66744e:"cloth", 0xc49a72:"skin", ... })
   // module calls once with its own P-map hexes; quad() records CHAN per tri
   // by hex lookup; resetGeom() clears the map.
```
Untagged tris fall to the **classifier**: `matBucket` (`ps1-sheet.html:247-253`) generalized
to the vocabulary above. The existing modules ship untagged and render correctly through the
classifier on day one; tagging is the go-forward authoring requirement and the spot-fix lever.

### §2.3 The registry entry shape (`src/ui/theater-figures.js`, NEW)

```js
// PURE data + loader. NO bare "three" import (Node-importable for the harness);
// creature modules are reached by dynamic import(), each individually caught.
const WHOLE_OBJECT_REGISTRY = {
  // -------- PCs: keyed "class:<lowercase class>" --------
  "class:fighter":  { module: "creatures/humanoid.js",     fn: "buildHumanoid", discR: 0.42 },
  "class:wizard":   { module: "creatures/mage.js",         fn: "buildMage",     discR: 0.42 },
  "class:cleric":   { module: "creatures/cleric_fable.js", fn: "buildCleric",   discR: 0.42 },
  // … all 12, per ps1-sheet SETS.classes (L38-50)
  // -------- bestiary: keyed by the EXACT bestiary id (== statId == recipe slug) --------
  "wolf":        { module: "creatures/mon-wolf.js",   fn: "buildWolf",      discR: 0.42 },
  "hill-giant":  { module: "creatures/mon-giant.js",  fn: "buildHillGiant", discR: 0.68 },
  "wraith":      { module: "creatures/mon-wraith.js", fn: "buildWraith",    discR: 0.42, opacity: 0.45 },
  "shadow":      { module: "creatures/mon-shadow.js", fn: "buildShadow",    discR: 0.42, opacity: 0.45 },
  // … every mon-/npc-/var- builder whose bestiary slug exists (validated by harness)
  // -------- props: keyed "prop:<theater-data part name>" --------
  "prop:statue-figure": { module: "creatures/prop-statue.js", fn: "buildStatue",   discR: 0.42 },
  "prop:pillar-intact": { module: "creatures/prop-pillar.js", fn: "buildPillar",   discR: 0.42 },
  "prop:pillar-broken": { module: "creatures/prop-pillar.js", fn: "buildPillarBroken", discR: 0.42 },
  "prop:table-slab":    { module: "creatures/prop-table.js",  fn: "buildTable",    discR: 0.42 },
  // … throne-seat→buildThrone, arch-frame→buildArchway, web-mass→buildWebMass,
  //   well-shaft→buildWell, crate→buildContainers, cart→buildCart, altar/shrine→buildAltar
  // -------- lighting props: keyed "light:<LIGHT_PROFILES key>" --------
  "light:torchlit": { module: "creatures/prop-light.js", fn: "buildTorch",       discR: 0.42, flameY: 1.22 },
  "light:lamplit":  { module: "creatures/prop-light.js", fn: "buildLanternPost", discR: 0.42, flameY: 1.35 },
};
// nearest-sub for the bestiary tail. STARTER table only (R4) — hand-drafted by the executor,
// orchestrator gates, full table to Adam's ledger; the CR-wave dedupe is build-order item (4).
const NEAREST_SUB = {
  "mastiff": "wolf", "jackal": "wolf", "hyena": "wolf",
  /* … authored at build time, every value validated by harness;
     a slug absent here AND above → cuboid fallback */
};
export function resolveWholeObject(key)  // exact → NEAREST_SUB → null
export function loadWholeObjectBuilders(onSettled)
  // dynamic-imports every registry module ONCE (deduped by module path), each import wrapped
  // in catch → a broken module leaves its entries unresolved (fallback renders) and NEVER
  // rejects the batch; calls onSettled() when done.
```
Entry fields — all of them, no others: `module`, `fn`, `discR`, optional `opacity` (engine
precedent `TRANSLUCENT_OPACITY = 0.45`, theater-boot L1458), optional `flameY`, populated
`build` (the resolved function, post-load).

### §2.4 Unit-side key (one additive theater-data field)

`theaterUnitsFrom` stamps `className` (lowercased `pcRef.class` / `a.class`, or null) on
pc/ally units, next to the existing `silhouette` stamp (theater-data.js L1100-1115 /
L1117-1135). Foes already carry the key (`recipeSlug = statId`, L1150). Resolution order per
unit in theater-boot:

```
key = (u.kind === "pc" || u.kind === "ally") && u.className ? "class:" + u.className
    : u.recipeSlug || null
entry = key && WHOLE_OBJECT_ENABLED && resolveWholeObject(key)   // may be null
```

---

## §3 Divergences (module conventions vs theater-boot) — each resolved

- **D1 — Unit scale.** Modules bake ABSOLUTE size; the engine applies `FIGURE_SCALE(1.5) ×
  sizeScaleFor(recipe.size)` (L2821-2823) — applying either double-scales. **Resolution:**
  whole-object figures scale by ONE constant `WHOLE_OBJECT_SCALE = 1.3` (R2: default; capture
  gate carries a 1.5 comparison pair); `sizeScaleFor` is NEVER applied on this path. Tuned by
  CAPTURE, never box-math.
- **D2 — Double base discs.** Keep the baked neutral disc as the physical base; the engine
  hostility disc renders BENEATH it, widened to `discR × WHOLE_OBJECT_SCALE × 1.12` (kind
  tint reads as a rim ring); grounding blob 1.15× that. The disc stays the ONLY side signal
  (D8/D10).
- **D3 — Orientation.** All whole-object modules face **+z** (verified). The whole-object
  path sets `figure.rotation.y = 0` unconditionally — `BASE_ORIENT_YAW` never applies. If
  capture review wants quadruped broadside, that is ONE new constant (`WHOLE_OBJECT_YAW`,
  group-level), never per-module edits.
- **D4 — Palette keys.** §2.2's CHAN buffer + `setChannels` registration, generalized
  `matBucket` classifier as the untagged default (the sheet's own sanctioned idiom,
  ps1-sheet L245).
- **D5 — Material path.** A sibling funnel `wholeObjectMaterialsFor(entry)` builds the 3-slot
  material array (Lambert / Phong-metal / Phong-glass per §2.2), each `{vertexColors:true,
  flatShading:true, map: grainAtlas, color:0xffffff}` → `applyPsxShaderTweaks` — the exact
  `figureScene` construction from ps1-sheet L285-291, ported byte-for-byte. It does NOT route
  through `pixelSkinTextureFor` (no double eyes — house eyes are geometry).
- **D6 — Module home.** R1: import in place — `src/ui/theater-figures.js` dynamic-imports
  `../../dev/model-qa/creatures/*.js`; `probe-lib.js` stays the single geometry source both
  the sheet and the engine consume. Relocation = optional post-soak chore.
- **D7 — Cache vs `clearGroup` dispose.** Cache `BufferGeometry` by registry key; cached
  meshes set `mesh.userData.shared = true`; `clearGroup` (L1974-1984) skips `.dispose()`
  (still detaches) for tagged children. `retire()` gains an explicit cache-dispose sweep.
- **D8 — Corpse desaturation.** `desaturateGroup` would contaminate shared materials.
  **Resolution:** a cached grayscale geometry variant per key (`key + "|gray"`, COL → Rec.601
  luma at build time); `u.down` whole-object units mount the gray variant + existing topple
  rotation. Deeper tipped-figure polish stays queued behind P1′.
- **D9 — Loadout mirror precedence.** The class module outranks `pcRecipe` (the roster
  supersession clause) — the mini's weapon is the AUTHORED class weapon until the queued
  weapon-swap re-mint sweep. `pcRecipeFrom`/theater-data derivation untouched
  (verify-loadout-mirror stays green).
- **D10 — PC/ally side tint.** R5: disc-only side signal on the whole-object path; explicit
  read-check frame at the capture gate + Adam's ledger; the fallback fix is a pc-disc rim
  bump, not figure tinting.

---

## §4 Behavior — ordered steps, guards, fallback chain

### Unit A — `feat/theater-whole-object` (build-order items 1+2)

1. **probe-lib CHAN buffer** (`dev/model-qa/probe-lib.js`): add `CHAN` + `setChannels(map)`;
   `quad()` appends one channel byte per tri (hex lookup, default 0); `resetGeom()` clears
   both. `getBuffers()` returns `{POS, COL, CHAN}`. Guard: existing callers destructure only
   POS/COL — untouched.
2. **Registry module** (`src/ui/theater-figures.js`, NEW — §2.3): registry + `resolveWholeObject`
   + `loadWholeObjectBuilders`. No bare `"three"` import. Register in `manifest.json`; its own
   `<script type="module">` tag in `genesis.html` before theater-boot's (genesis.html:1219);
   `python3 build/check-manifest.py` after.
3. **theater-boot: geometry factory.** `wholeObjectGeometryFor(key, gray)` — cache-checked;
   else `resetGeom(); entry.build(); getBuffers()` → bucket tris by channel (classifier for 0)
   → rebuild bucket-contiguous `position`/`color`/`uv` (the `figureScene` rebuild, ps1-sheet
   L260-281, ported verbatim) → `addGroup` per material slot → `computeVertexNormals` → cache.
   Guard: an entry whose `build` threw at load never reaches here.
4. **theater-boot: material funnel.** `wholeObjectMaterialsFor(entry)` per D5; grain atlas
   ported from `grainTexture()` with the L18 program marks painted into each channel's window
   family (§2.2); memoized; `entry.opacity` clones the array with `transparent +
   depthWrite:false` (precedent L1453-1461).
5. **`figureFor` precedence** (insert at L1665, before the `pcRecipe` branch): resolve the
   unit key (§2.4) → `resolveWholeObject` → if the builder is LOADED, return the whole-object
   group (`rotation.y = 0`). Guards, in order: gate off → skip; entry null → skip; builder
   not loaded / failed import → skip; geometry build throws → catch, evict cache entry, skip.
   Every skip falls through to the EXISTING chain — `pcRecipe → recipe → archetype cuboid` —
   the cuboid path is never removed, it IS the auto-fallback.
6. **`setUnits` scale/disc split** (L2810-2870): whole-object units use `figScale =
   WHOLE_OBJECT_SCALE` (D1), disc radius `entry.discR × WHOLE_OBJECT_SCALE × 1.12` (D2),
   down-units mount the gray variant (D8). Cuboid-path units keep the existing math
   byte-identical. Store `S.lastUnits = data` so step 8's post-load re-render can replay.
7. **`setBoard` props** (L2572-2617): before the `Parts.PARTS` lookup, try
   `resolveWholeObject("prop:" + p.part)` (with `pillar-broken` routing on
   `partParams.intact`, and the candelabra/brazier keyword rule retargeted from its
   `pillar-broken {scale:0.3}` stand-in to the real builders). Honor `partParams.scale` at
   group level (existing pattern L2603). Miss → existing renderPartInto/generic-box path.
8. **Async load + re-render:** theater-boot calls `loadWholeObjectBuilders(() => {
   if(S.mounted){ if(S.lastBoard) setBoard(S.lastBoard); if(S.lastUnits) setUnits(S.lastUnits); }
   })` once at module scope. Pre-completion renders show cuboids (correct, never blank).
   jsdom/headless never loads theater-boot (ES module, excluded from harness concat) so
   degrade is structurally unchanged.
9. **Gate:** `window.Theater.wholeObject` accessor (get/set → `WHOLE_OBJECT_ENABLED`, default
   **true**), the exact `pixelSkin` pattern (L2957-2961) — the A/B lever and kill switch.
10. **`clearGroup`/`retire`** edits per D7.

### Unit B — `feat/theater-light-props` (branched off Unit A's tip; small)

1. In `setBoard`, after `applyLightProfile` (L2546): if the profile key resolves a
   `"light:<profile>"` registry entry and the gate is on, mount that prop at the point
   light's resolved board position (`profile.points[0].pos` fractions × `S.boardHalfX/Z` —
   the same math `applyLightProfile` L2141-2148 uses), snapped to the nearest tile center not
   occupied by a unit spawn zone; deterministic.
2. Move the live `THREE.PointLight` position to `(propX, entry.flameY × WHOLE_OBJECT_SCALE,
   propZ)` — the light SOURCES at the flame head (prop-light.js:5-9). Flicker untouched
   (L2166-2180).
3. Guards: profile with no registry mapping → no prop, light behavior byte-identical; builders
   not yet loaded → skip prop, keep today's light position (never a dark board).

## §5 Files touched

`src/ui/theater-boot.js` (A3-A10, B1-B3) · `src/ui/theater-figures.js` (NEW) ·
`dev/model-qa/probe-lib.js` (A1) · `src/engine/theater-data.js` (§2.4 className stamp) ·
`dev/model-qa/ps1-sheet.html` (consume CHAN when present; nothing else) · `genesis.html` +
`manifest.json` · `dev/verify-theater-figures.mjs` (NEW) · docs coherence in the same change:
`docs/BATTLE-THEATER.md` §3 pointer, `docs/NEXT-STEPS.md`, `docs/DESIGN.md` registry row.

## §6 Out of scope (explicit)

1. T2 GLTFLoader seam stays dormant. 2. Races as rig variants (POLISH-WAVE-1 F4's problem;
the 6 `race-*.js` modules get registry entries ONLY if their bestiary slugs exist; PC race is
ignored in key resolution — class only). 3. Monster tail waves (only the NEAREST_SUB seam +
starter table ship here). 4. Weapon-swap re-mint (D9), pose wave (F3), down-state polish,
micro-props, env waves, PSX res change — all queued elsewhere. 5. No swarm whole-object path
(L17 swarmScatter stays authoritative).

## §7 Verification (numbered; RED-FIRST marked)

All in `dev/verify-theater-figures.mjs` (Node; imports theater-figures.js + creature modules
directly — probe-lib is Node-safe) unless noted.

1. **[RED-FIRST] Registry integrity:** every bestiary-keyed entry and every NEAREST_SUB value
   resolves to a real `data/bestiary.js` id and a real exported builder. Written before the
   registry is populated → red on the empty table, green when authored. Completeness asserts
   against the real 77 builders (R3).
2. **[RED-FIRST] Builder contract:** per entry — `resetGeom(); build(); getBuffers()` yields
   POS.length % 9 === 0, POS.length === COL.length, CHAN.length === POS.length/9, tri count
   120–2600, bbox min.y ∈ [−0.08, 0.08] (recalibrated from −0.01 by orchestrator ruling
   2026-07-04 — the draft bound was sampled narrow; 10 shipped QA'd builders legitimately sink a
   foot/claw wedge to −0.0745, and the check's job — floaters/buried — survives at −0.08), CHAN
   bytes < CHANNEL_KEYS.length. Red until CHAN
   exists in probe-lib.
3. **[RED-FIRST] Resolution chain:** exact → NEAREST_SUB → null, all three asserted.
4. **PSX parity (byte-level):** text-scan theater-boot + ps1-sheet and assert the shared
   tunables are IDENTICAL — dither amplitude, snap grid, res scale default, Bayer table, both
   GLSL bodies, Phong pairs, grain seed constants. Any drift = red.
5. **PSX parity (pixel-level, browser gate):** matched-framing captures of (a)
   `ps1-sheet.html?set=classes` cell 1 and (b) a theater fixture (dev/theater-preview.html
   gains a whole-object fixture: 1-tile board, 1 fighter, `dark` profile, zoom pinned); diff
   tolerance ≤2% differing pixels. RED-FIRST by construction (pre-wiring the fixture renders
   a cuboid → diff fails).
6. **Fallback graceful:** §7.1 mutations.
7. **Existing harnesses stay green (run every one on the branch):** verify-battle-stage ·
   verify-theater-data · verify-theater-lighting · verify-theater-verbs · verify-model-grammar
   · verify-model-parts · verify-pixel-skin · verify-tri-budget · verify-loadout-mirror ·
   verify-combat-lifecycle · verify-combat-tracker · verify-capture — plus
   `python3 build/check-manifest.py` after every module edit.
8. **`node dev/gauntlet-monkey.mjs`** — zero new findings (className is the only
   classic-script change it can see; additive field).
9. **[RED-FIRST] theater-data addition:** extend verify-theater-data — pc/ally units carry
   lowercased `className`; foes don't; absent class → null (no throw).
10. **Lighting-prop anchoring (Unit B):** browser fixture — `torchlit` board shows the torch
    prop with the point light at flame height; `dark` board shows no prop and byte-identical
    light state to master. Capture pair for the gate sheet.
11. **The capture gate (director check):** one sheet — pilot-16 equivalents in-engine + 2
    scene shots under torchlit/dark + the R2 scale pair (1.3 vs 1.5) + the R5/D10 side-read
    frame. Orchestrator gates before merge; Adam's taste pass rides the evening ledger.

### §7.1 Mutation-test regression checks (all shown RED then restored)

- **M1 — registry entry removed** ("wolf" deleted in-memory): wolf-statId unit → null →
  fall-through → a cuboid figure STILL renders (never a crash/blank).
- **M2 — creature module broken** (entry `fn` → non-existent export): `loadWholeObjectBuilders`
  settles without rejecting; that entry unresolved; every OTHER entry loads.
- **M3 — overrides seam intact:** re-run verify-model-grammar's existing override mutation
  (`goblin-warrior` removed → generated recipe wins) proving the cuboid chain underneath P1′
  is untouched.
- **M4 — gate load-bearing:** `Theater.wholeObject = false` → next setUnits renders cuboids
  only; flip back → whole-object returns without remount.
- **M5 — prop entry removed:** `prop:statue-figure` deleted → statue text renders the legacy
  part path, not a blank zone.

## §8 Decisions recorded (grounds cited)

1. Cuboids demote to auto-fallback + nearest-sub, never deleted — ruling verbatim; "never
   worse than today" (MODEL-GRAMMAR §9 D6) survives by fall-through construction.
2. Channels ride a CHAN buffer with a classifier default — ruling (b) + the sheet's sanctioned
   idiom (ps1-sheet L245 names P1′ as the handoff point).
3. Grain default-on, generated, seeded — ruling (a); `Theater.wholeObject` + `?grain=0` are
   the toggles.
4. Class module outranks pcRecipe — the roster supersession clause; weapon re-mint queued.
5. Authored absolute size, one WHOLE_OBJECT_SCALE, no sizeScaleFor — the size law ships in
   the modules; double-scaling is the D1 failure.
6. Lighting props anchor rolled light profiles in this wave — prop-light.js ENGINE NOTE
   reserves it for P1′ by name.
7. Eyes are geometry; pixel-skin eye/L19 path never touches whole-object figures — the house
   eye standard ruling.
8. Import-in-place from dev/model-qa/creatures/ — R1; the ruling fixes the authoring home; a
   copy step would violate edit-source→compile-artifact with no compiler.
