---
type: system-spec
status: specced 2026-07-01 night — build-ready (rides BATTLEMAP; fully procedural = Sonnet-buildable end to end; NO art assets)
created: 2026-07-01
related:
  - "[[BATTLEMAP]]"
  - "[[COMBAT-TRACKER]]"
  - "[[REGIONS-NAMES]]"
  - "[[STYLE-PROBES]]"
  - "[[DESIGN-GUIDE]]"
---

# Blockwright — the procedural visual layer (blocky, untextured, fast)

## §0. Adam's constraints (2026-07-01, verbatim intent)

- **A handful of GENERIC models by size class — never per-enemy models.** We don't craft every
  thing in the game.
- **Environments: geometric, blocky, NO textures, simple shaders only.** His machine is slow —
  **the simpler the better** is a hard requirement, not an aesthetic preference.

**The consequence (the night's best trade):** flat-shaded untextured geometry is CODE, not art.
The whole diorama layer is procedural — buildable by Sonnet, testable in jsdom, zero asset
pipeline, zero image generation. The STYLE-PROBES question narrows accordingly (§5).

## §1. The renderer — CSS-3D cuboids, zero dependencies

- **Tech: CSS 3D transforms.** A cuboid = 6 absolutely-positioned faces in a
  `transform-style: preserve-3d` group. No WebGL, no three.js, no canvas, no vendored libs —
  DOM-native, classic-script compatible, inline-handler friendly, and CHEAP on a slow machine
  (static transforms are composited once; nothing repaints per frame).
- **"Simple shaders" = precomputed face shades:** each cuboid gets ONE base color; top face
  = base ×1.15, the two camera-facing sides = ×1.0 and ×0.82, rest unrendered (culled — the
  fixed camera never sees them). Three shades, flat, done. No gradients, no shadows, no filters,
  no lighting math at runtime.
- **Camera: fixed isometric** (one `rotateX/rotateZ` on the stage). Stretch goal (not v1): four
  90° rotation snaps, FFT-style — pure transform swap, still cheap.
- **The API (`src/ui/blockwright.js`, new module):**
  `bwBox({x,y,z,w,d,h,color,rotY})` · `bwFrustum({...box, taper:0..0.6})` (top face inset —
  clip-path trapezoid sides) · `bwPrism({...box, ridge:"x"|"z"})` (wedge/gable) ·
  `bwGroup(children,{x,y,z,rotY})` · `bwStage(rootEl,{gridW,gridD})`. Everything composes from
  these four primitives.
- **THE ANTI-MINECRAFT RULES (Adam's P3 probe verdict, 2026-07-01: pure cubes read as
  Minecraft — de-voxel it):** (1) **taper by default** — organic forms (trees, boulders,
  torsos, heads) use frustums, never straight boxes; (2) **free Y-rotation** — every PROP gets
  a deterministic ±15° scatter (seeded by zone, never random per render); tiles stay aligned,
  props never are; (3) **muted palettes** — low saturation, deep-value grounds, ONE warm accent
  (the P1/P2 probe palette: deep blues + ember), never saturated voxel greens; (4) varied
  proportions — no two adjacent props share exact dimensions (a small jitter table). Target
  read: *painted wooden miniatures on a tabletop diorama*, not voxels.
- **Performance budget (hard, verify-enforced):** ≤ **180 face divs** per diorama (≈30 cuboids);
  animations are transform/opacity ONLY; `prefers-reduced-motion` disables movement entirely;
  the panel renders nothing while hidden.

## §2. The generic figure roster (procedural, parameterized — no files)

`bwFigure({size, silhouette, palette, label})` assembles 3–7 cuboids:
- **Sizes (5):** Tiny (0.4u) · Small (0.7u) · Medium (1u) · Large (2u wide) · Huge (3u) —
  from the bestiary `size` tag (WALK-REFRESH tagging).
- **Silhouettes (4):** `biped` (legs/torso/head) · `quadruped` (body/head, low) · `serpent`
  (low segmented run) · `mass` (single mound — oozes, swarms, blobs) — mapped from the bestiary
  TYPE tag (humanoid/undead→biped, beast→quadruped, ooze/swarm→mass, dragon/snake→serpent;
  one small `BW_SILHOUETTE` map, unknown→biped).
- **Palette by creature type** (one flat color + shade math): undead=bone, beast=umber,
  humanoid=slate, fiend=oxblood, construct=iron, elemental=by-element, etc. — a
  `BW_TYPE_COLORS` map, ~10 entries.
- **The PC + sidekick** get one extra cuboid (a weapon/staff block) + class-hue; hirelings a
  neutral hue. **Nobody gets a face.** Labels are the existing chip/nameplate DOM floating
  above, not geometry.
- Total roster: 5 × 4 = **20 procedural assemblies from ONE function** — Adam's "handful of
  generic models," delivered as ~60 lines of parameterization.

## §3. Environments — blocky by construction

- **Zone tiles:** flat platforms (1 cuboid each, near-zero height); elevation = literally taller
  cuboids (the BATTLEMAP `elev` flag becomes geometry). Cramped rooms read as walls: out-of-grid
  space fills with wall-height cuboids at the room's rolled bounds.
- **Feature kit (`bwFeature`)** — the rolled footprints (BATTLEMAP §1) map to ~10 blocky
  primitives: tree/copse = stacked green boxes · boulder/monolith = gray box cluster · trench =
  a recessed tile · fog = one translucent cuboid (the single allowed opacity) · dais/perch =
  raised platform · choke = two wall blocks with a gap · brush = low green slabs. Unknown
  feature → a neutral marker block + label (never invisible, never invented geometry).
- **Palette from the world:** the REGIONS-NAMES flavor vector supplies the diorama's 4-color
  scheme (ground/wall/accent/prop) per region; dungeon lighting rows darken it. Slow-machine
  rule: palette changes are color swaps, never new geometry.

## §4. Wiring + build plan

1. `src/ui/blockwright.js` (the §1 engine + §2 figures + §3 kit) — new module, manifest +
   script-tag registered.
2. BATTLEMAP's panel renders through it (the CSS-grid v1 in BATTLEMAP §3 UPGRADES to this —
   same zone model, same tap-sugar, same invariants: **no foe HP/AC anywhere in the DOM**).
3. Region palette hookup + lighting darkening.
4. `dev/verify-blockwright.mjs` (≥10/0): face-count budget respected on a max fixture (mutation
   check: exceed it, harness fails) · silhouette/size mapping per bestiary tags (unknown→biped
   Medium) · shade math (top>side>dark, one base color) · **anti-Minecraft invariants: organic
   props are frustums not boxes; every prop carries a nonzero deterministic rotY (same seed →
   same scatter twice; mutation check: zero the scatter, harness fails)** · zero `<img>`/
   `background-image`/`filter`/`box-shadow` in the diorama subtree (grep-enforced) · fog is the
   only sub-1 opacity · reduced-motion kills animation · hidden panel renders nothing ·
   regression: tracker/battlemap suites unchanged.

## §5. What this settles (STYLE-PROBES amendment)

The DIORAMA's style is now decided by fiat: geometric flat-shaded procedural — no probe needed
for it, no image-gen dependency, and either §II.0a verdict is compatible (the diorama IS the
"low-poly scene art" of the hybrid, in its purest form). The style probe narrows to the CHROME
question only: engraved frames/plaques vs how they sit AROUND blockwright scenes — one screen,
one session, whenever Adam feels like it.
