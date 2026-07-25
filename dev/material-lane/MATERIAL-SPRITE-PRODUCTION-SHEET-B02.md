---
type: material-source-sprite-production-sheet
status: B02-TECHNICAL-COMPLETE-TASTE-PENDING
batch: B02-deck-edge-culture-candidates
workflow: sprite-first-mm-second
generation: built-in-imagegen
---

# Batch 2 — Deck-Edge Culture Candidates

This batch compares construction languages for a single gameplay promise: **flat deck plus a
cover-granting edge**. Every candidate binds to the same cover class and the same fixture
geometry. The sprite owns surface construction character. Geometry owns the cover silhouette,
crenels, rails, caps, openings, thickness, endpoints, collision, and gameplay height.

No winning culture treatment is selected by this sheet. Adam taste-passes the two Institutional
and three Upland candidates together.

## Locked production order

1. Generate one complete surface sprite with built-in ImageGen.
2. Prove or repair its two-axis repeat.
3. Preserve the accepted sprite as albedo authority.
4. Add construction-aware Material Maker depth and PBR channels.
5. Review sprite-only and sprite-plus-MM on identical cover geometry.

The art-direction authority included in every generation call is:

> "sprites first, materials layered on those sprites second. i like the richness of character
> that the sprites give us."

## Shared ImageGen prompt contract

Use one ImageGen call per candidate unless a measured failure needs one targeted retry.

```text
Create one complete square material source sprite for Genesis. This is a direct full-field
albedo sprite, not a component sheet, object, wall section, diorama, or scene.

"sprites first, materials layered on those sprites second. i like the richness of character
that the sprites give us."

Front-on orthographic surface view; square canvas; construction fills the image edge to edge.
No perspective, camera tilt, horizon, floor, top cap, side face, frame, border, vignette,
directional lighting, cast shadow, ambient occlusion, bevel highlight, labels, props, moss,
damage story, or unique central feature. Flat neutral local albedo only.

The image must tile seamlessly on both axes. Left and right edges continue the same construction
phase; top and bottom edges continue the same construction phase. Do not place a boundary strip,
quiet border band, cropped terminal piece, or special edge treatment. The wrapped joins must be
indistinguishable from ordinary internal joins.

Pixel-art sprite rendering: visible pixel-scale texture and painterly dithered shading, grounded
traditional Monster Manual fantasy proportions, warm parchment-adjacent palette, medium value
contrast, clean broad value shapes first and grit only as seasoning. It must remain legible and
quiet behind a character at 50% zoom. Material Maker will add controlled depth later and must not
replace this sprite's color character.

SUBJECT:
[insert exactly one subject block below]
```

## Subject blocks and selected sources

| ID | Culture | Subject block | Selected source | Route | X/Y boundary ratio |
|---|---|---|---|---|---|
| `institutional-dressed-ashlar` | Institutional | Pale dressed limestone ashlar; measured staggered courses; regular fine mortar; subtle warm-grey and cream replacement-block variation; restrained tooling; no arches or ornament. | `source-sprites/b02-deck-edge-v001/institutional-dressed-ashlar-source-v001.png` | raw ImageGen v001 | 0.733 / 0.738 |
| `institutional-frontier-coursed` | Institutional | Darker practical frontier stone coursing; larger rectangular grey-brown blocks; deliberate but less courtly sizing; narrow dark mortar; modest stone-face variation; no arches or ornament. | `source-sprites/b02-deck-edge-v001/institutional-frontier-coursed-source-v003.png` | targeted phase retry v003 | 0.197 / 0.527 |
| `upland-fitted-rubble-upstand` | Upland | Closely fitted irregular fieldstone rubble; varied broad stone silhouettes and restrained cool/warm greys; narrow recessed joints; no regular brick courses and no huge mortar gaps. | `source-sprites/b02-deck-edge-v001/upland-fitted-rubble-upstand-seamlocked-v001.png` | ImageGen v001 plus declared 32px continuous-field edge lock | 0.000 / 0.000 |
| `upland-heavy-timber-edge` | Upland | Close-set upright split oak boards held by two horizontal hewn rails, sparse pegs and short rope bindings; maintained practical construction; broad grain; no circular log ends and no palisade spikes. | `source-sprites/b02-deck-edge-v001/upland-heavy-timber-edge-source-v002.png` | targeted periodic retry v002 | 0.168 / 0.970 |
| `upland-timber-cribbed-rubble` | Upland | Heavy hewn timber crib grid packed with fitted small fieldstone; clear posts and rails around irregular stone infill; restrained pegs; practical maintained construction; no plaster and no story damage. | `source-sprites/b02-deck-edge-v001/upland-timber-cribbed-rubble-source-v001.png` | raw ImageGen v001 | 0.969 / 0.700 |

The numerical gate is `boundary / applicable internal p95 <= 1.10` on each axis. Dimensions,
absolute RMS values, selection methods, and the locked-aspect repeat board are recorded in
`proofs/b02-deck-edge-selected-v001/b02-deck-edge-selected-source-receipt-v001.json`.

## Targeted retry language

Only append the applicable correction; keep the shared contract unchanged.

- **Construction-phase retry:** "Make the two wrapped boundaries land inside the same ordinary
  course/joint phase. Do not solve this with a blank boundary strip, faded edge, border band, or
  edge blur."
- **Frontier v003 correction:** "Use a quiet boundary crop through ordinary coursed stone on all
  four sides. Keep the larger block variation in the field, but place no long terminal stone or
  exceptional mortar seam at an edge."
- **Heavy-timber v002 correction:** "Use a periodic board-and-rail module that crosses each edge
  naturally. All visible boards are front faces; remove circular log ends, projecting stakes,
  angled rails, and any perspective cue."

## Rejected alternatives

- Frontier coursing v001 and v002 failed at least one measured boundary ratio. They remain in the
  source directory for provenance and are not MM inputs.
- Fitted rubble ImageGen v002 and v003 did not improve both boundaries.
- A sixteen-component chroma extraction and two modular toroidal rubble assemblies passed
  topology but failed visual taste: oversized mortar gaps made them read like a specimen rack.
  They remain under `proofs/b02-deck-edge-v001/` and `proofs/b02-deck-edge-v002/` as rejected
  evidence. Component reconstruction is therefore a rescue lane, not an automatic escalation.

## Material Maker treatment

All five accepted sprites are the byte-preserved albedo authority. MM 1.3 receives a
construction-aware **dark-seam residual** height guide so block color does not become elevation.
The graphs use shallow normals, restrained AO, zero metallic, and family-specific roughness.

| Material | Roughness | Normal | AO | Depth |
|---|---:|---:|---:|---:|
| Dressed ashlar | 0.76 | 0.22 | 0.20 | 0.018 |
| Frontier coursing | 0.82 | 0.24 | 0.22 | 0.020 |
| Fitted rubble upstand | 0.86 | 0.28 | 0.24 | 0.022 |
| Heavy timber edge | 0.72 | 0.25 | 0.20 | 0.018 |
| Timber-cribbed rubble | 0.78 | 0.27 | 0.23 | 0.021 |

Two independent MM compiles produced twenty byte-identical maps. Source identity, inherited
seams, depth presence, ORM packing, and determinism all pass.

## Evidence and handoff

- Selected source board:
  `proofs/b02-deck-edge-selected-v001/b02-deck-edge-selected-source-board-v001.png`
- Source gate:
  `proofs/b02-deck-edge-selected-v001/b02-deck-edge-selected-source-receipt-v001.json`
- MM source manifest: `manifests/b02-deck-edge-mm-v001.source.json`
- MM graphs: `graphs/b02-deck-edge-mm-v001/`
- Two-run export receipt: `receipts/b02-deck-edge-mm-v001-export-receipt.json`
- Verification receipt: `receipts/b02-deck-edge-mm-v001-verification.json`
- Review card: `../material-cards/b02-deck-edge-culture-mm-v001.html`

The card must show 20 comparison renders: sprite-only, sprite-plus-MM, gameplay goblin scale, and
neutral clay control for each candidate. All repeat panels use a truthful locked square ratio and
an unstretched 3x3 background repeat.

## Taste questions

1. Should Institutional lean toward pale dressed ashlar or darker frontier coursing?
2. Should Upland lean toward fitted rubble, heavy timber, or timber-cribbed rubble?
3. Does the heavy timber read as a deck edge, or too much like a full palisade wall?
4. Is the fitted rubble's stronger MM relief useful at gameplay scale or too busy?
5. Is timber-cribbed rubble pleasantly distinctive or too elaborate for the common edge family?
