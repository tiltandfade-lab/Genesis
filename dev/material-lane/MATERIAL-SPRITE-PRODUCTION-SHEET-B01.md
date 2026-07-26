---
type: material-source-sprite-production-sheet
status: B01-TECHNICAL-COMPLETE-TASTE-PENDING
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

## Autonomous production checkpoint P1 — 2026-07-24

New source inputs for `roof-plank-batten` and `roof-slate` passed their applicable autonomous seam
gates at the required 512px delivery size. The accepted source sprites, native 3x3 repeats,
join-marked proof board, and machine receipt are in `proofs/b01-autonomous-v001/`; generation
prompts and hashes are in `manifests/b01-autonomous-p1-v001.source.json`.

These two entries are **TECHNICAL-SOURCE-PASS / TASTE-APPROVED / MM-PASS**. Their conservative
MM 1.3 graphs, deterministic two-run export receipt, and verification report are respectively in
`graphs/b01-autonomous-p1-v001/`, `receipts/b01-autonomous-p1-mm-v001-export-receipt.json`, and
`receipts/b01-autonomous-p1-mm-v001-verification.json`. The review card is
`../material-cards/b01-autonomous-p1-mm-v001.html`. Albedo remains the approved source sprite;
MM derives broad height, normal, AO, roughness, and zero metallic only. The other Batch 1 families
remain pending their adapter/source pass.

## Timber-shingle checkpoint — 2026-07-24

`roof-timber-shingle` is **TECHNICAL-SOURCE-PASS / TASTE-APPROVED / MM-PASS**. Sixteen upright
ImageGen components are assembled by the directional modular-course adapter on a seeded 12 x 8
toroidal field. Identical variants never touch orthogonally; every exposed split edge faces down;
the delivered source is 512px. Source and assembly records are
`manifests/b01-timber-shingle-v001.source.json` and
`proofs/b01-autonomous-p2-v003/b01-autonomous-p2-v003-timber-shingle-receipt.json`.

The conservative MM graph is `graphs/b01-timber-shingle-mm-v001/`; deterministic export and
verification receipts are `receipts/b01-timber-shingle-mm-v001-export-receipt.json` and
`receipts/b01-timber-shingle-mm-v001-verification.json`. The approved sprite is unchanged as
albedo; MM adds broad course relief, roughness 0.72, and zero metallic.

## Clay-tile checkpoint — 2026-07-24

`roof-clay-tile` is **TECHNICAL-SOURCE-PASS / TASTE-APPROVED / MM-PASS**. Sixteen upright fired-
clay pantile components form a balanced 12 x 8 toroidal course field. The albedo remains free of
directional cast shadow; MM derives clay-specific curvature and under-lip separation with normal
strength 0.40, AO 0.36, roughness 0.68, and zero metallic. Records and review:

- `manifests/b01-clay-tile-v001.source.json`
- `graphs/b01-clay-tile-mm-v001/`
- `receipts/b01-clay-tile-mm-v001-export-receipt.json`
- `receipts/b01-clay-tile-mm-v001-verification.json`
- `../material-cards/b01-clay-tile-mm-v001.html`

## Slate replacement checkpoint — 2026-07-24

The original six-component slate was rejected after review because its course read could appear
inverted and its rigid component order produced an artificial color pattern. The replacement uses
a sixteen-component ImageGen library with every authored rounded edge facing down. A seeded,
balanced toroidal variant grid closes on both axes, never rotates or flips a component, and forbids
identical horizontal or vertical neighbours.

The user-approved appearance was normalized from its 576px topology workspace to the truthful
512px delivery asset `proofs/b01-autonomous-v006/b01-autonomous-v006-slate.png`. Its source record
is `manifests/b01-autonomous-slate-v006.source.json`. The replacement MM graph and two-run receipts
are `graphs/b01-autonomous-slate-mm-v002/`,
`receipts/b01-autonomous-slate-mm-v002-export-receipt.json`, and
`receipts/b01-autonomous-slate-mm-v002-verification.json`. The replacement is
**TECHNICAL-SOURCE-PASS / TASTE-APPROVED / MM-PASS** and supersedes the v001 slate material.

## Direct-sprite fast-lane checkpoint — 2026-07-24

The remaining four families were run through the lower-cost default path: generate one complete
full-field ImageGen sprite, measure its two wrapped boundaries, inspect a truthful locked-aspect
3x3 repeat, retry the prompt only when the failure was prompt-addressable, and reserve
deterministic repair for a continuous field with a mild miss. Component reconstruction was not
used.

| Material | Selected source | Source route | X/Y boundary ratio |
|---|---|---|---|
| `timber-structural-grain` | `source-sprites/b01-fast-lane-v001/timber-structural-grain-seamlocked-v001.png` | ImageGen v001 + 48px continuous-field toroidal lock | 0.000 / 0.000 |
| `roof-thatch` | `source-sprites/b01-fast-lane-v001/roof-thatch-source-v002.png` | targeted ImageGen retry: exactly eight courses; boundary inside equivalent inter-course phase | 0.860 / 0.713 |
| `roof-turf-sod` | `source-sprites/b01-fast-lane-v001/roof-turf-sod-source-v001.png` | raw ImageGen pass | 0.953 / 0.827 |
| `roof-hide-canvas-tarp` | `source-sprites/b01-fast-lane-v001/roof-hide-canvas-tarp-source-v001.png` | raw ImageGen pass | 0.337 / 0.563 |

The shared full-field prompt contract was:

- complete direct albedo sprite, not a component sheet;
- square, front-on, orthographic, edge-to-edge field with no frame, perspective, scene, unique
  center, border band, edge lighting, or vignette;
- opposite edges explicitly continue the same construction phase;
- flat neutral local albedo; no cast shadow, AO, bevel highlight, or directional light;
- construction-specific broad masses remain readable at 50% zoom;
- rich restrained color variation remains in the source sprite; MM may not redraw it.

Prompt deltas were subject-specific: broad vertical grain and sparse knots for timber; maintained
bundled straw in periodic horizontal courses for thatch; overlapping low-noise living sod masses
for turf; and offset warm hide/canvas panels with sparse stitches and lashes for tarp. The first
thatch failed its top/bottom phase at 2.411x internal p95; the explicit eight-course retry passed
at 0.713x. A boundary-neutral timber retry worsened its X seam, so the richer v001 sprite was
retained and repaired by the declared continuous-field adapter instead of burning another
generation or invoking component reconstruction.

Source proof and repair provenance:

- `proofs/b01-fast-lane-v001/b01-fast-lane-source-triage-v001.{png,json}`
- `proofs/b01-fast-lane-v001/b01-fast-lane-selected-candidates-v002.{png,json}`
- `proofs/b01-fast-lane-v001/timber-structural-grain-seamlocked-v001.json`
- `triage-fast-lane-sources.py`
- `repair-fast-lane-timber.py`

All four selected sources are **TECHNICAL-SOURCE-PASS / MM-PASS / TASTE-PENDING**. Their MM
graphs use construction-aware grayscale guides: broad shallow luminance for timber and turf,
course-scale luminance for thatch, and a dark-seam residual for hide/canvas so panel color does
not become panel elevation. Two MM 1.3 compiles produced sixteen byte-identical output maps;
source identity and ORM verification passed. Records and review:

- `manifests/b01-fast-lane-mm-v001.source.json`
- `graphs/b01-fast-lane-mm-v001/`
- `receipts/b01-fast-lane-mm-v001-export-receipt.json`
- `receipts/b01-fast-lane-mm-v001-verification.json`
- `../material-cards/b01-fast-lane-mm-v001.html`

This checkpoint does not claim user taste approval. It packages the four technical passes into one
batch review so approval or revision can happen once.
