---
type: material-source-sprite-production-sheet
status: READY-FOR-AUTONOMOUS-RERUN
batch: B01-timber-and-roof-fields
workflow: sprite-first-mm-second
---

# Batch 1 — Timber Set and Roof Fields

One source sprite per ImageGen call. These are **surface sprites**, not character sheets: each is
a square, orthographic, edge-to-edge material tile. The source sprite is the albedo authority; MM
may derive controlled depth and PBR channels afterwards, but may not replace its visual identity.

## Shared style block

Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly
illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel
scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-
adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is
Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

## Shared mechanical instructions

One distinct square material source sprite per call; front-on orthographic surface view; edge to
edge; no frame or scene. Neutral albedo with no cast shadow, directional lighting, vignette,
ambient scene color, labels, props, damage story, moss, soot, or decorative border. The surface
must repeat seamlessly on both axes. CLEAN-SHAPES: clean value shapes first, grit as seasoning;
dither only in shadows and edges, never across middle values; large flat value planes must carry
the construction read at 50% zoom.

## Source roster

1. `timber-structural-grain` — shared door, lintel, post, and beam grain; stout warm oak, broad
   grain, restrained knot count, no joinery or hardware.
2. `roof-timber-shingle` — coherent overlapping split-timber courses; readable units, restrained
   edge variation.
3. `roof-plank-batten` — vertical weatherboards with narrow raised battens over seams; no nails as
   focal points.
4. `roof-slate` — dark blue-grey hand-cut slates in staggered courses; modest tonal variation.
5. `roof-clay-tile` — warm terracotta interlocking curved tiles; regular rhythm with restrained
   handmade variation.
6. `roof-thatch` — bundled straw or reed courses, directionally coherent and low-noise.
7. `roof-turf-sod` — dense clipped turf over a packed earthen roof layer; grass clumps read as
   broad masses, not individual noisy blades.
8. `roof-hide-canvas-tarp` — taut warm hide/canvas panels with broad seams and sparse rope-lash
   lines; makeshift but maintained, no tears or story damage.

## Per-sprite acceptance gate

- 1× read: construction type is unmistakable.
- 3×3 repeat: no visible left/right or top/bottom seam.
- The final tile and 3×3 repeat are shown at an asserted 1:1 display ratio; join ticks identify
  the exact boundaries under review.
- Boundary, cadence, and modular-period checks use the applicable adapter contract in
  `AUTONOMOUS-SEAM-MACHINERY.md`; a generic edge blend may not erase structural features.
- 50% read: large value groups remain quiet behind a standee.
- MM preview: structural joints may receive relief; painted grain, dither, and edge accents may
  not become noisy embossing.

## Batch status — 2026-07-24

The first source pass and a dedicated edge-only repair pass were generated for all eight entries.
Each repair candidate failed the numerical two-axis repeat proof (`edge RMS <= 10` per axis), so
this sheet is deliberately held at **SOURCE-GATE-FAILED**. No Batch 1 candidate may enter MM
until it passes the source gate. See
`manifests/b01-timber-roof-source-sprites-v001.json` for prompts, candidate paths, hashes, and
measurements.

The autonomous seam machinery was subsequently proven for period-aware plank-and-batten and
modular slate. That proof does not promote the rejected v001–v003 Batch 1 candidates, but it moves
this sheet to **READY-FOR-AUTONOMOUS-RERUN**. Production must use the routing table, gates, and
Terra handoff in `AUTONOMOUS-SEAM-MACHINERY.md`. Unproven material adapters stop and report before
MM; they do not receive a visual-only waiver.
