# GRAPHICS-ENGINE — the Wildermyth grammar (Adam's north star, 2026-07-10 evening)

type: system-spec
status: PROVISIONAL (Adam named the analog; recipe captured same-session; build units await red-pen)

## The ruling

**Wildermyth is the technical analog.** Not the art to copy — the *construction* to match:
2D cutout characters standing in a 3D diorama world; clean blocky architecture; surfaces
subtly textured (enough to say "wood/stone/metal", never busy); foliage and props as flat
painted cards in 3D space; soft real lighting with cast shadows; theatrical floating-stage
framing. Genesis renders ITS art (the pixel-sprite corpus, the realm palettes, PS1 grit on
the WORLD only) through Wildermyth's machine.

## Why this fits (what today already proved)

The 2026-07-10 dungeon-graph build converged on this grammar independently:

| Wildermyth technique | Genesis state |
|---|---|
| flat character cutouts, camera-tilted, real shadows | ✅ BUILT — standee billboards (camera-pitch tilt, zero PSX distortion, alpha-tested shadow casting) |
| blocky 3D architecture with real volume | ✅ BUILT — InstancedMesh prism tile kits (walls/floors/pillars/doorframes, 1 draw call per kind) |
| scene light sources + shadow maps | ✅ BUILT — per-room torches/lamps, capped shadow casters, interiors only |
| stage/diorama framing | ✅ BUILT — focus-room camera fit + cutaway walls; the standing table IS a floating stage |
| deterministic set dressing | ✅ pattern exists (seeded per-room lights; extend to props/foliage) |
| subtle painted surface texture | ⬜ GAP 1 |
| foliage/prop cards | ⬜ GAP 2 |
| soft global light rig + per-scene grading | ⬜ GAP 3 |
| ground/terrain treatment + stage skirt | ⬜ GAP 4 |

## The recipe (technical laws, per Wildermyth's construction)

1. **CUTOUT LAW.** Characters are always flat art in 3D space — never 3D-modeled figures.
   Billboards face the camera (yaw + elevation tilt), cast alpha-tested shadows, receive
   none. No shader effects touch character pixels (SPRITE PURITY, ruled today).
2. **BLOCK LAW.** Architecture is clean prism volumes — few faces, sharp silhouettes.
   Detail lives in the TEXTURE, not the mesh. PS1 grammar (low poly, quantized light,
   dither) applies to WORLD surfaces only.
3. **SUBTLE-TEXTURE LAW (gap 1).** Every block face carries a low-contrast material
   texture — enough to read wood grain / stone course / brushed metal at glance distance,
   never noisy, never photographic. Implementation: procedural CanvasTextures generated
   at boot per realm kit (the threejs-procedural-dungeon pattern), nearest-filtered,
   one texel density across a kit. Realm kits extend from {floorColor, wallColor} to
   {material: stone|wood|metal|flesh…, grain intensity, accent trim}.
4. **CARD LAW (gap 2).** Foliage, clutter, and small props are flat painted cards
   (single quads or cross-pairs), alpha-cut, shadow-casting, seeded per room role —
   the sprite pipeline can GENERATE these (a "props+foliage" sheet family: mushrooms,
   roots, rubble, banners, moss hangs — per realm). Big props stay 3D prisms.
5. **STAGE LAW.** Every scene floats — diorama edges visible, skirt faces darkened
   (gap 4: bevel/skirt treatment on the board edge so the floating slab reads finished),
   void-tinted backdrop per realm.
6. **LIGHT RIG LAW (gap 3).** One soft key (hemisphere or low-intensity directional,
   subtle warm/cool split) + scene sources (torches/lamps, the real shadow casters) +
   per-realm color grade (fog tint kept at a whisper). No baked AO by default — real
   shadows carry contact darkness (today's finding); the parameterized baseAO knob stays
   available for bright rooms.
7. **DETERMINISM LAW.** All dressing (texture variation, card placement, light positions)
   seeds from the walk/place id — same room forever renders the same.

## Build units (PROVISIONAL — await Adam's red-pen; each Sonnet-executable)

- **GR1 — material textures.** Procedural per-realm CanvasTextures (stone/wood/metal
  grain, low contrast) for the interior kits; texel-density discipline; screenshot gate.
- **GR2 — props+foliage cards.** Card-mesh channel (quad/cross, alpha, shadows) + seeded
  per-room placement by room role; art from a new sprite-sheet family (codex packet:
  "dressing" sheets per realm — flat icon law does NOT apply; these are eye-level cards).
- **GR3 — light rig + grade.** Hemisphere key + per-realm grade values in the kits;
  tabletop parity pass (the flat standing table adopts the same rig so both channels match).
- **GR4 — stage skirt + edge trim.** Board-edge bevel/skirt treatment, void backdrop tint.
- **GR5 — Wildermyth parity card.** One capture: a fantasy forest-edge room + a gloom
  crypt, all laws on, judged against the analog's *construction* (not its art).

## Sources of truth

- Today's render laws: docs/DUNGEON-GRAPH.md (§Laws, U3) — this spec extends, never
  contradicts; TRUE-SCALE and VOLUMETRIC WALL laws stand.
- Sprite side: docs/SPRITE-GEN-V2.md + SPRITE-TAGS.md (corpus feeds the cutouts; the
  dressing-card family will need its own §8-style manifest law).
- The study rig (dev/battle-gate/capture-interior-study.mjs) is the standing screenshot
  gate for every GR unit.
