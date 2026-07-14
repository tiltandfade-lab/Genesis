# PACKET-04 — REALM TEXTURES (the 9 non-flagship realms; finish the surface pass)

type: codex-packet
status: PARKED — EXPANSION BACKLOG (Fable, 2026-07-11; Adam's ruling: the 9 non-flagship realms are
shelved as future expansion packs — prove the engine on the CORE 3 (fantasy/gloom/chrome) first.
This packet is SPEC-COMPLETE and paste-ready, but DO NOT run the full 9 yet. Execute only the
cross-usable subset below (sheets that read as an in-register variant for a core realm). The core-3
gap-fill lives in `PACKET-07-CORE-VARIANTS.md`. Un-park this whole packet when a realm ships.)

## Cross-usable into the core 3 (render these now; the rest stay parked)

Judgment call — a parked-realm sheet may be rendered NOW only if it reads as a clean variant for a
core realm's own register:
- **lost-world `Temple Flagstone` + `Moss-Stone Terrace`** → **fantasy** floor/wall variants (same
  warm-stone-with-moss register — good pool-wideners for fantasy dungeons). Save under the fantasy
  slugs (`fantasy-floor-2`, `fantasy-wall-2`) per PACKET-07, not the lost-world slug.
- **lost-world `Vaulted Ash-Char`** + **cosmic `Wrong-Angle Flags`** → **gloom** variants (charnel /
  cursed-abandoned register). Save under gloom slugs.
- **chrome** gains nothing clean from the 9 (its grated-deck is already authored) — its variety comes
  from `PACKET-07`, not here.
Everything else in this packet stays parked. Original spec (all 9 realms) preserved below for the
expansion un-park.

Original rationale: PACKET-02 authored textures for the 3 flagships (fantasy/gloom/chrome); the
other 9 canonical realms fall back to the procedural painter. This packet authors real tiles for all
9 so `interiorTextureVariantFor` resolves generated-first across the whole roster. Codex has repo
access — read `src/ui/theater-interior.js` REALM_MATERIALS + `data/realm-surfaces.js` + the
palette/style-ref attach files for ground truth.

## Delivery rules (every sheet — same as PACKET-02)

- **TILEABLE (seamless) on both axes** — state it in every prompt; the fold gate wrap-shifts and
  diffs edges mechanically.
- **OPAQUE** (no chroma key — surface textures, not cutouts). Flat ambient lighting baked LOW —
  the engine's real lights + per-realm grade do the lighting. No baked sun direction, no baked
  shadows except subtle grout/crevice occlusion (the SUBTLE-TEXTURE law: value jitter capped,
  never busy under sprites; contrast cap 0.62).
- **512×512**, one texture per generation (fold downsizes to engine texel via integer-ratio
  resample). `trim` sheets are **512×128**; `crate-faces` are **512×512 six-face sheets**.
- Pixel-art finish per the realm (SPRITE-GEN-V2 per-realm finish law); colors from the realm
  master palette. Save `ui-sketches/textures/<realm>-<surface>-<n>.png`, **additive law** (`-take2`
  for retries, never overwrite).
- **UV LAW the art must serve:** FLOOR = 1 tile : 1 grid cell (5 ft), so the grout grid ALIGNS
  with the combat grid — keep one clear cell module per 512. WALL ≈ 14 courses per 512.

## Standing prompt header (paste atop every prompt)

> Generate a SEAMLESS TILEABLE pixel-art surface texture for a Wildermyth-style diorama dungeon
> game, 512×512, flat ambient lighting only (no directional shadows — the engine lights it),
> subtle low-contrast detail that reads as material at glance distance without fighting character
> sprites standing in front of it. PS1 RETIRED — full-res, crisp, no dither/vertex-snap; detail
> lives in the texture. It must tile perfectly on both axes. Colors from the attached realm
> palette; finish matched to the attached style-ref.

## The sheets (9 realms × 5 surfaces = 45 generations)

Net-new materials (no procedural fallback exists — these are the priority sheets, marked ⚑) are
slotted into each realm's `floor-alt`/`grate` where the surfaces draft flags one.

### frontier — Western  ·  Attach: `realm-palettes/frontier.json` · `regen-v3/style-refs/frontier-style-ref.png`
- **frontier-wall-1** — sun-split clapboard siding over adobe-brick courses, dry grain, iron nailheads, whitewash gone chalky. ~14 courses.
- **frontier-floor-1** — Saloon Boards: warped amber floorboards, whiskey-stained dark rings, boot-scuff sheen; seams = grid.
- **frontier-floor-alt-1** — Desert Flats: wind-rippled tan sand shifting to rust-red mineral streaks (exterior ground).
- **frontier-trim-1** (512×128) — painted saloon dado stripe over pine baseboard, faded and boot-kicked.
- **frontier-crate-faces-1** (512×512, 6 faces) — dry-goods crate side · barrel top · gun-cabinet door · stenciled ammo-box panel · whiskey-case front · plain plank side.

### noir — Noir/crime  ·  Attach: `realm-palettes/noir.json` · `regen-v3/style-refs/noir-style-ref.png`
- **noir-wall-1** — soot-dark brick, rain-streaked, hairline mortar, faint painted-ad ghost. ~14 courses.
- **noir-floor-1** — Precinct Linoleum: waxed institutional pea-green scuffed to grey under tube light; grid seams.
- **noir-floor-alt-1** ⚑ — Wet Asphalt Crossing (net-new): fine rolled asphalt, faded ghost-white crosswalk striping, rain-dark sheen.
- **noir-grate-1** ⚑ — Fire-Escape Grating (net-new): riveted diamond-punch steel lattice, rust-streaked, real see-through negative space.
- **noir-trim-1** (512×128) — tile wainscot over cast-iron conduit + skirting, grime-dark.
- **noir-crate-faces-1** (512×512, 6 faces) — filing-cabinet drawer · evidence crate side · safe door · ventilated locker · liquor-case front · riveted panel.

*(noir runs 6 sheets — the second net-new grate is worth its own cell.)*

### ash — Post-apocalyptic  ·  Attach: `realm-palettes/ash.json` · `regen-v3/style-refs/ash-style-ref.png`
- **ash-wall-1** — cracked poured concrete, exposed rebar, spalled edges, faded stencil ghost. ~14 courses.
- **ash-floor-1** — Bunker Slab: raw pitted concrete, cold damp dark pits, hairline cracks; grid seams.
- **ash-floor-alt-1** ⚑ — Grating Walk (net-new): oxidized rust-orange steel grate over dull gunmetal, loose-bolted, see-through.
- **ash-trim-1** (512×128) — cracked concrete curb with bent rebar and rust-water bleed.
- **ash-crate-faces-1** (512×512, 6 faces) — scrap-metal crate side · oil-drum top · rusted locker door · jury-rigged patch panel · ammo-can face · patched-board side.

### suburb — Suburbia  ·  Attach: `realm-palettes/suburb.json` · `regen-v3/style-refs/suburb-style-ref.png`
- **suburb-wall-1** — painted drywall with a too-cheerful floral wallpaper band, faint water-stain wrongness. ~flat courses.
- **suburb-floor-1** — Kitchen Linoleum: jaundiced beige checkerboard tile, grout gone grease-dark, wax-shine dull; grid = tile.
- **suburb-floor-alt-1** — Wall-to-Wall Carpet: matted mauve-beige shag, dark foot-worn traffic paths and old stains.
- **suburb-trim-1** (512×128) — white vinyl baseboard under a wallpaper border stripe, mildew-freckled.
- **suburb-crate-faces-1** (512×512, 6 faces) — cardboard moving-box side · appliance panel · kitchen-cabinet door · HVAC vent register · toy-chest front · particleboard side.

### cosmic — Cosmic/weird  ·  Attach: `realm-palettes/cosmic.json` · `regen-v3/style-refs/cosmic-style-ref.png`
- **cosmic-wall-1** — bruised violet-grey non-euclidean ashlar, mortar lines glowing faint cold-white, corners that don't quite meet. ~14 courses.
- **cosmic-floor-1** — Wrong-Angle Flags: paving whose grout doesn't meet at corners, faint cold-white seam glow; grid warps subtly.
- **cosmic-floor-alt-1** ⚑ — Star-Flecked Void-Floor (net-new): near-black translucent field, irregular bright pinprick starfield, faint slow nebula mottle beneath — standing on open night sky.
- **cosmic-trim-1** (512×128) — inlaid sacred-geometry glyph border, faint blue-violet inner glow.
- **cosmic-crate-faces-1** (512×512, 6 faces) — reliquary-chest side · star-metal case top · glyph-cabinet door · void-vent panel · geometry-box face · wrong-angle plain side.

### theater — War  ·  Attach: `realm-palettes/theater.json` · `regen-v3/style-refs/theater-style-ref.png`
- **theater-wall-1** — sandbagged concrete revetment / corrugated bunker steel, shell-scarred, drab olive-grey. ~courses.
- **theater-floor-1** — Duckboards: split weathered grey-brown trench planking laid over mud, algae-stained seams; grid = slats.
- **theater-floor-alt-1** ⚑ — Grated Decking (net-new): riveted gunmetal bunker grating, rust-orange seam bleed, bolt-head studs, battle-scuffed.
- **theater-trim-1** (512×128) — sandbag course over a duckboard edge, torn burlap and grit.
- **theater-crate-faces-1** (512×512, 6 faces) — ammo-crate side · sandbag face · footlocker top · ventilated bunker panel · ration-box front · riveted steel side.

### high-seas — Age of sail  ·  Attach: `realm-palettes/high-seas.json` · `regen-v3/style-refs/high-seas-style-ref.png`
- **high-seas-wall-1** — tarred hull planking with brass fittings, oakum-caulked seams, salt-crust bloom. ~14 courses.
- **high-seas-floor-1** — Weather Deck Planking: sun-scoured grey-blond boards, tar-black caulk seams, salt-crust grain; grid = planks.
- **high-seas-floor-alt-1** ⚑ — Wet Rope Matting (net-new): woven salt-stiffened cordage matting over gaps, hemp-brown with salt-whitened high spots.
- **high-seas-trim-1** (512×128) — brass rail over rope-fender molding, verdigris and brine.
- **high-seas-crate-faces-1** (512×512, 6 faces) — sea-chest side · cargo-barrel top · captain's-cabinet door · gun-port panel · powder-keg face · planked hull side.

### lost-world — Antiquity/dino  ·  Attach: `realm-palettes/lost-world.json` · `regen-v3/style-refs/lost-world-style-ref.png`
- **lost-world-wall-1** — carved temple stone, moss-veined seams, half-worn glyph relief, sun-bleached limestone. ~14 courses.
- **lost-world-floor-1** — Temple Flagstone: cut ceremonial stone, deep green-black moss in the seams, lichen veining; grid = flags.
- **lost-world-floor-alt-1** — Glyph Mosaic: shattered terracotta/ochre/verdigris inlay over dust-grey grout tracing worn glyphs.
- **lost-world-trim-1** (512×128) — carved glyph frieze band, moss-choked and chipped.
- **lost-world-crate-faces-1** (512×512, 6 faces) — stone-reliquary side · clay-urn top · glyph-cabinet door · temple-vent grille · offering-box front · carved-stone side.

### bright-kingdom — Toybox  ·  Attach: `realm-palettes/bright-kingdom.json` · `regen-v3/style-refs/bright-kingdom-style-ref.png`
- **bright-kingdom-wall-1** — candy-brick / gingerbread courses, piped-frosting mortar, hard-lacquer gloss with a grime-dulled clear coat (teeth under the candy). ~14 courses.
- **bright-kingdom-floor-1** — Sugar-Tile Checkerboard: glossy bone-white and cherry-red squares, grout gone tacky syrup-brown; grid = tile.
- **bright-kingdom-floor-alt-1** ⚑ — Grated Gumdrop Decking (net-new): raised interlocking hex panels, jewel-tone gumdrop reds/greens/purples under grimed lacquer.
- **bright-kingdom-trim-1** (512×128) — piped-frosting cornice studded with gumdrops, cracked and dust-greyed.
- **bright-kingdom-crate-faces-1** (512×512, 6 faces) — toy-chest side · candy-barrel top · cupboard door · gumdrop-vent panel · present-box front · building-block side.

## Return handling (orchestrator)

Arrivals → `ui-sketches/textures/` → mechanical gate (wrap-shift tileability · loose palette-ΔE ·
contrast-cap 0.62 · integer-ratio resample) → fold to `assets/textures/<realm>-<surface>-<n>.png`.
**CODE TOUCH (one-time, before folding):** extend `FLAGSHIPS` in `build/fold-textures.py` to the
full roster (or add a `REALMS` list) so the 9 new realms fold; then add a `REALM_TEXTURES` entry
per realm in `src/ui/theater-interior.js:285` (`wall`/`floor`/`floor-alt`/`trim` variant arrays of
`{file,wrap}`) — `interiorTextureVariantFor` returns generated-first, procedural stays as fallback.
The net-new ⚑ surfaces additionally want a `FLOOR_MATERIAL_RECIPES` alias OR a direct
`REALM_SURFACES.base` retarget so the rolled surface (e.g. cosmic "Star-Flecked Void-Floor") points
at the authored tile instead of a procedural stand-in. Furniture faces feed BW2-5's furniture-class
blocker volumes via `textureFaceFor`.
