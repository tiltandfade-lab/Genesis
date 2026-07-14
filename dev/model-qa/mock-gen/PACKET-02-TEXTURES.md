# PACKET-02 — TEXTURE-GEN (tileable surfaces + furniture faces; the rich-surface pass)

type: codex-packet
status: READY (paste-ready; Adam's codex window — his ruling 2026-07-10 night: the chrome +
shop mocks are the target look, "all the rich textures on every surface"; generate them via
codex instead of procedural. Codex has repo access — it may read src/ui/theater-interior.js
REALM_MATERIALS + dev/model-qa/realm-palettes/*.json for ground truth.)

## Delivery rules (every sheet)

- **TILEABLE (seamless) on both axes** — state it in every prompt; verify by eye before saving
  (the fold gate will wrap-shift and diff edges mechanically).
- OPAQUE (no chroma key — these are surface textures, not cutouts). Flat lighting baked LOW
  (ambient only — the engine's real lights do the lighting; no baked sun direction, no baked
  shadows except subtle grout/crevice occlusion).
- Pixel-art finish per the realm (SPRITE-GEN-V2 per-realm finish law); colors from the realm's
  master palette (dev/model-qa/realm-palettes/<realm>.json).
- One texture per generation at 512×512 (the fold downsizes to engine texel; big source = clean
  downsample). Save as `ui-sketches/textures/<realm>-<surface>-<n>.png`, additive law (-take2
  for retries, never overwrite).
- FLAGSHIP REALMS FIRST: fantasy, gloom, chrome. Reference the two target mocks for register:
  ui-sketches/mock-frames/mock-01-chrome-combat.png + mock-01-shop.png.

## Standing prompt header (paste atop every prompt)

> Generate a SEAMLESS TILEABLE pixel-art surface texture for a Wildermyth-style diorama
> dungeon game, 512×512, flat ambient lighting only (no directional shadows — the game engine
> lights it), subtle low-contrast detail that reads as material at glance distance without
> fighting character sprites standing in front of it. It must tile perfectly on both axes.

## The sheets (3 realms × 5 surfaces + shared = 18 generations)

Per flagship realm {fantasy, gloom, chrome}:
1. **wall** — block/brick courses (fantasy: warm sandstone ashlar · gloom: cold cracked
   purple-grey stone, occasional carved skull relief · chrome: dark blue-steel panel blocks
   with hairline seams + rare glow-seam accent). ~14 courses per 512px.
2. **floor** — large tiles (fantasy: worn stone flags, grout, occasional crack/moss ·
   gloom: cracked slabs, dark grout, faint bloodstain ghosts · chrome: big reflective tiles,
   wet-sheen highlights, grout grid, subtle cyan reflection hints).
3. **floor-alt** — the realm's second ground (fantasy: wood planks w/ grain + nail heads ·
   gloom: rotted planks, gaps · chrome: grated deck panels).
4. **trim** — a 512×128 horizontal strip: baseboard/cornice course (fantasy: carved border ·
   gloom: bone inlay · chrome: conduit run with junction boxes).
5. **crate-faces** — a 512×512 sheet of SIX 170px square furniture face tiles (NOT tileable
   across faces; each face self-contained): crate side, crate top, cabinet door, panel with
   vents, panel with glow seam, plain reinforced side — realm-true (fantasy: ironbound wood ·
   gloom: coffin-wood + verdigris · chrome: server-cabinet panels per the chrome mock's crates).

Shared (3 generations):
6. **dais-steps stone** (gloom-leaning neutral), **rug/carpet** (the shop mock's green rug
   register, tileable center + a matching 512×128 border strip), **wet-stain decal set**
   (opaque-on-dark overlay tiles for chrome's floor sheen variation).

## Return handling (orchestrator)

Arrivals → `ui-sketches/textures/` → mechanical gate: wrap-shift edge diff (tileability),
palette-subset vs realm palette (loose ΔE bound), contrast cap (subtle-texture law) → fold to
`assets/textures/<realm>-<surface>-<n>.png` at engine texel via integer-ratio resample →
REALM_MATERIALS entries point at texture files (generated-first; the procedural painter stays
as the fallback for the 9 non-flagship realms until their packets run) → BW2-3's unit consumes
these instead of authoring procedural courses. Furniture faces feed BW2-5's furniture-class
blocker volumes.
