# PACKET-07 — CORE-3 SURFACE VARIANTS (fill the fantasy/gloom/chrome gaps)

type: codex-packet
status: READY (Fable, 2026-07-11 — BW5 SEAM 3 / MC-3, CORE-3 SCOPE. The 3 focus realms
(fantasy/gloom/chrome) each carry only ONE authored tile per surface (`REALM_TEXTURES` arrays are
length-1) and only ~5 of their ~8 declared surfaces are authored — so their dungeons repeat the
same tile and fall back to procedural for the rest. This packet WIDENS the core-3 pools and covers
their un-authored surfaces. This is the real "fill the core-3 gaps" work; the 9-realm expansion is
parked in `PACKET-04`.)

## Delivery rules

Same as PACKET-02/04: **TILEABLE both axes · OPAQUE · 512×512 · flat ambient light · subtle
low-contrast (contrast cap 0.62) · PS1 retired · UV LAW (floor 1 tile : 1 grid cell; wall ≈14
courses)**. Save `ui-sketches/textures/<realm>-<surface>-<n>.png`, additive law. These APPEND to the
existing variant arrays — the seeded variant roll (`interiorTextureVariantFor`) picks among them per
room, zero code change beyond adding the array entries. Attach each realm's palette + style-ref.

## Standing prompt header

> Generate a SEAMLESS TILEABLE pixel-art surface texture, 512×512, flat ambient light only (the
> engine lights + grades it), subtle low-contrast detail that reads as material at glance distance
> without fighting sprites in front of it. PS1 RETIRED — crisp full-res, detail in the texture, no
> dither except in the material grain. Tiles perfectly on both axes. This is a VARIANT of an
> existing realm surface — same register/palette as the attached style-ref, different weathering/
> pattern so rooms don't repeat one tile.

## fantasy — variants + un-authored surfaces  ·  Attach: `regen-v3/style-refs/fantasy-style-ref.png`
- **fantasy-floor-2** — mossy cracked flagstone: warm limestone flags, deep green-black moss in the
  seams, lichen veining (renders the lost-world `Temple Flagstone` register into fantasy).
- **fantasy-wall-2** — carved relief stone: weathered grey-green ashlar with a worn low-relief
  border/glyph and creeping moss (the lost-world `Moss-Stone` register; a wall pool-widener).
- **fantasy-floor-alt-2** — dungeon cobble: rounded fieldstone cobbles, dark grout, a path worn
  smooth through the middle.
- **fantasy-floor-3** — cave-rock floor: rough natural damp stone for cave-adjacent rooms (serves
  the material-inheritance "rough" flag so a cave doesn't get a cut-flag floor).

## gloom — variants + un-authored surfaces  ·  Attach: `regen-v3/style-refs/gloom-style-ref.png`
- **gloom-floor-2** — Undercroft Stone: cold wet slate, mildew-pale at the edges, sweating-damp sheen.
- **gloom-floor-3** — Consecrated Flags: ash-grey flagstones stained rust-brown, old blood ground
  into the seams (chapel/altar rooms).
- **gloom-wall-2** — Web-Shrouded stone: dust-pale grey masonry under a grimy cobweb haze, neglect
  bloom (the long-abandoned register; pairs with the PACKET-05 cobweb decal).
- **gloom-floor-alt-2** — Charnel Ash: powdery bone-white-to-sooty-black ash drift, brittle, scorched
  patches.
- **gloom-floor-4** (cross-usable, from PACKET-04) — Vaulted Ash-Char: soot-grey char over blackened
  stone, faint ember-orange in the cracks.
- **gloom-floor-5** (cross-usable, from PACKET-04) — Wrong-Angle Flags: paving whose grout doesn't
  meet at corners, faint cold-white seam glow (cursed/uncanny rooms).

## chrome — variants + un-authored surfaces  ·  Attach: `regen-v3/style-refs/chrome-style-ref.png`
- **chrome-floor-2** — Server Tile: raised anti-static grey-white floor tile, faint cyan status-light
  wash, cable-port seams.
- **chrome-wall-2** — Hull Plate: riveted dark-steel armor plating, dented, dried-blood rust streaks
  (breached-bulkhead register).
- **chrome-floor-3** — Reactor Grate: scorched charcoal grating with a molten-orange heat-glow
  undertone — author the glow EMISSIVE-bright (it should trip the bloom gate).
- **chrome-floor-alt-2** — Coolant Sludge: toxic teal-green pooled chemical with an oily sheen, cracked
  containment channels (leak bays).

## Return handling (orchestrator)

Arrivals → `ui-sketches/textures/` → same fold gate as PACKET-04 → `assets/textures/<realm>-<surface>-<n>.png`.
**APPEND** each to its `REALM_TEXTURES[realm][surface]` variant array in `src/ui/theater-interior.js`
as `{file,wrap}` — no new realm entries needed (the core 3 already exist), just widened arrays. The
emissive chrome-floor-3 routes through the BW3 bloom gate. For un-authored surfaces that map to a
distinct `REALM_SURFACES` entry (e.g. gloom `Consecrated Flags`), point that surface's `base` at the
new tile so the rolled surface resolves generated-first.
