# PACKET-09 — CORE-3 EFFECT SPRITES (shared actions + realm accents)

type: codex-packet
status: DRAFT (Fable, 2026-07-11 — follows GRAPHICS-ENGINE §B and SPRITE-GEN-V2)

## Rationale

The standee verb system can already animate whole sprites, but it needs readable effect cards:
impact flashes, cast rings, dust, sparks, heal motes, and realm-specific energy. This packet gives
the graphics engine reusable 2-4 frame effect sprites without inventing a particle system.

## Delivery Rules

Generate pixel-art effect sprite sheets on a solid chroma background, 512x512 unless noted. Effects
are camera-facing cards, not character sprites, so additive glow is allowed. No floor plane, no cast
shadow, no labels. Save to `ui-sketches/sprite-sheets/effects/`, additive law.

Default key: `#FF00FF`; use green only if the sheet is magenta-heavy.

## Sheets

1. `effects-core-impact-1.png` — 4x4 grid: slash arcs, blunt impact stars, pierce glints, shield
   pings; include faint/medium/heavy variants and two short motion streaks.
2. `effects-core-magic-1.png` — 4x4 grid: cast circles, burst rings, bolt heads, ward sigils,
   dispel shimmer; neutral blue-white/gold so realm tinting works.
3. `effects-core-environment-1.png` — 4x4 grid: dust puffs, splash rings, smoke curls, ember drift,
   falling ash flecks, tiny debris hits.
4. `effects-fantasy-accent-1.png` — 3x3 grid: warm-gold spell motes, green fae sparks, leaf swirl,
   candle flare, holy ring, rune glint.
5. `effects-gloom-accent-1.png` — 3x3 grid: cold-white seam tear, ichor splash, VHS static slash,
   grave-mist pulse, black-red curse ring.
6. `effects-chrome-accent-1.png` — 3x3 grid: cyan arc flash, magenta scanline tear, orange reactor
   spark, hologram glitch, shield hex burst.

## Prompt Header

Create a pixel-art EFFECT SPRITE sheet on a solid chroma-key background. Each cell contains one
self-contained effect card with transparent-ready edges, no floor plane, no object base, no text.
Style: crisp full-res pixel art, clean value shapes first, dithering only at glow/smoke edges.
Effects may be bright and emissive; they are rendered above standees and can use additive blending.

## Return Handling

Arrivals are sliced chroma-to-alpha into `assets/sprites/effects/`. Register effects by
`effectKind`, `realm`, `frameCount`, and `blendMode`. `STANDEE_VERBS` selects core effects by event
type and realm accents by scene realm.
