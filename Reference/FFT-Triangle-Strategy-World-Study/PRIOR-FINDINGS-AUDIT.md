# Prior-findings audit

The brief (§3) names four prior claim families and warns: *existing findings are priors, not
answers.* This file disposes each prior as `VERIFIED`, `NARROWED`, `UNTESTED`, or `OVERTURNED`
against the new controlled corpus (121-map FFT measurement set + 12-packet matched cohort +
Triangle Strategy/Ivalice Chronicles evidence + current Genesis captures). Dispositions cite
the evidence class per §12.

## A. Prior: "FFT uses compact rotational dioramas and a strict small-board discipline"
(source: `Reference/FFT-Guard-Post-Study/` + ART-DIRECTION-CANON vignette ruling)

**Disposition: VERIFIED — and now quantified for the first time.**
Measured over all 117 clean battle-flagged maps in the five-angle corpus (28 px/tile, exact):
- envelope area: min 45 cells (9×5) · **median 120 cells** · max 225 cells (15×15 Public Cemetery)
- longest side: min 8 · median 12 · max 18 (Zeklaus Desert 10×18)
- the twelve cohort maps span 56–180 cells; every one fits inside Genesis's 12×16 center target.
Adam's 2026-07-28 instinct ("even the biggest FFT battlemaps are pretty small") is measured
true. Evidence class: direct frame (measured). Confidence: high.
The rotational-diorama half is also verified: five views per map exist for all 121, edges are
composed (corner void bites, undercut skirts), and several maps read radically differently by
bearing (Zirekile nearly vanishes at one yaw) — rotation was a *reading aid* the player owned.

**NARROWED detail:** the folklore ceiling "FFT maps are 16×16" is wrong in both directions —
no map reaches 16×16=256 cells in area, while one dimension does reach 18. The honest bound:
**area ≤ 225, longest side ≤ 18, median 120.**

## B. Prior: "lit sprites, tilt-shift DoF, selective bloom, realm grade, and atmospheric
coupling are important HD-2D integration techniques"
(source: `docs/BEAUTY-WAVE-3.md`, `docs/SPRITE-BILLBOARD-RESEARCH.md`)

**Disposition: VERIFIED WITH LIMITS.**
- The Ivalice Chronicles Enhanced frames already committed in-repo (`Reference/FFT Battle
  Maps/`: the 4K waterway frame, the Zeirchele Falls frame, the © Square Enix Agrias gameplay
  frame — all visually inspected this study) show a modern pass over *unchanged tile
  geometry*: tilt-shift DoF, fog-graded far field, vignetted corners, real-time water,
  softened palette — and the map reads as the same board. This is direct-frame proof that the
  presentation stack alone moves a 1997 map most of the way to the modern register (supports
  H6's "the effects matter").
- LIMIT 1: in both IC and Triangle Strategy frames, the *base art* (redrawn albedo, material
  variety, painterly texture) carries at least as much of the upgrade as the post stack; DoF
  and grade on top of clay would not produce the effect (post is not carrying weak base art —
  see lane 3/4).
- LIMIT 2: the documented shipped-HD-2D sprite treatment is *not* full dynamic relighting —
  the Octopath II team's own "flat sheets of paper" framing stands (SPRITE-BILLBOARD-RESEARCH
  already flagged this; nothing in the new corpus contradicts it). Genesis's Lambert-lit
  sprites are *ahead of* the documented shipped baseline, not behind it.
Evidence class: direct frame + developer statement. Confidence: high.

## C. Prior: "Triangle Strategy's camera and sprite-direction needs carried material
production cost"
(source: `docs/SPRITE-BILLBOARD-RESEARCH.md` via Octopath II interview; TS producer interview)

**Disposition: VERIFIED (documented), mechanism sharpened — final wording pending the
interview-fetch ledger.**
The prior rests on the Octopath II Unreal interview (already cited verbatim in
SPRITE-BILLBOARD-RESEARCH: rotation pushed "nearly 90 degrees in some battle effects" and was
*managed*, not solved) plus the TS producer interview named in the brief. TS documentedly
ships 90°-step rotation + a top-down tactical view + zoom, so every asset must survive four
bearings and two elevations — the exact cost Genesis's fixed-camera ruling (W3 §12.13)
declines to pay. Direct quotes from the Destructoid/ndw.jp fetches are recorded in
SOURCE-LEDGER.md as acquired; production-scale numbers remain undocumented (no staffing
inference made — §5.9 rule). Evidence class: developer statement + documented gameplay.
Confidence: high.

## D. Prior: "Wolffort Streets uses elevation, rooftops, pre-battle interaction, removable
stalls, and staged environmental consequences"
(source: `Reference/Urban-Study/lane-6-touchstones.md` — documentation-only lane)

**Disposition: VERIFIED — structure now observed in frames; mechanics remain documented.**
The prior lane was documentation-only (no images). The acquired TS corpus contains six
Wolffort Streets frames (full-map deploy render, terrace/street views, wildfire-trap and
scorch views — `local-captures/triangle-strategy/wolffort-streets/`), personally inspected:
the tiered anatomy (street ground → mid level → walkable gabled roofs → curtain wall),
the central stall ground, and deploy adjacency are **observed**. The mechanics (shopkeeper
stall packing, statuette trap unlock, Golden-Route cost, Jens's buildable ladders,
flier-only roofs) remain documented-gameplay class (Game8/TheGamer/Neoseeker) — labeled as
such wherever cited. Bonus corroboration: Wolffort ships as three sibling boards of one
place (streets / great hall / tourney court) — direct shipped precedent for the
linked-window law. Confidence: high (structure), medium (mechanic details).

## E. The ten shape-grammar rules from the Guard-Post study
(source: `analysis/FFT-TO-GENESIS-RELATIONAL-SHAPE-GRAMMAR-STUDY.md`)

Re-tested against the twelve-packet cohort (different maps than the guard-post ten, except
Grog Hill and Mandalia which recur):

| grammar rule | disposition | note |
|---|---|---|
| 1. One primary spatial sentence | **VERIFIED** | every cohort map summarizes in one relation; Windmill Shed proves it at 7×8 |
| 2. Broad masses before cells | **VERIFIED** | 2–4 coherent masses per cohort map; cell-rich variety rides on surfaces, not geometry |
| 3. Architecture occupies a transition | **VERIFIED** | Igros/Zeakden/Orbonne/Dorter all place mass across/above route constraints |
| 4. Elevation has hierarchy | **VERIFIED** | one dominant + one supporting mass everywhere; Bervenia stacks but still ranks |
| 5. Roads are regions, not centerlines | **VERIFIED** | Grog/Igros/Dorter roads change width, apron, narrow at thresholds |
| 6. Rocks are relational clusters | **VERIFIED** | Mandalia/Grog/Zirekile clusters cap tiers, frame routes, close edges |
| 7. Quiet ground is active composition | **VERIFIED** | Mandalia fields, Igros forecourt, Zeakden snowfield |
| 8. Composed edges imply a larger world | **VERIFIED + NARROWED** | edges are composed, but FFT implies *almost nothing* beyond the board — black void, no far field; worldfulness beyond the edge is TS's contribution, not FFT's (lane 6) |
| 9. Sparse objects, rich surface hierarchy | **VERIFIED** | prop counts stay single-digit outside cities; texture carries richness |
| 10. Camera visibility is grammatical | **UNTESTED (this pass)** | MAP098's view-dependent suppression was not re-examined; the fixed-camera translation makes it moot for Genesis (compile-time omission already ruled + clay-proven) |

## F. Corpus-identity caveat discovered during this audit

The five-angle archive's numeric ids match libFFT GNS ids for every map this study verified
visually (1, 25, 31, 35, 37, 38, 44, 49, 56, 61, 73, 74, 81, 83, 85, 90) **except the 28–30
range**, where the renders show snow maps while libFFT names them "Colliery Underground."
Selection therefore never trusted filenames alone — every cohort map was verified by eye
(the brief's terrain-image gate, applied). The mismatch is recorded here and in
CORPUS-INVENTORY.md; the Colliery interiors were simply not used.

## G. Stale-pointer confirmation

The checked-in `current-terrain-engine-two-tray-reference.png` (the brief's named starting
pointer) is confirmed **stale as "current engine"**: it predates the responsive-surface
default committed 2026-07-29 18:36 (`cl-f10-natural-surface-review-v002`), which adds
connected folded landform + route-band + causal-break language the pointer lacks. Graded
accordingly in GENESIS-CAPTURE-INVENTORY.md.
