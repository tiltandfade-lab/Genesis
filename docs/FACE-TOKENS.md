---
type: system-spec
status: ACTIVE — tooling proven on the 31-sprite SRD TD set 2026-07-30 (four iterations to converge; lessons below are the point of this doc)
created: 2026-07-30
related:
  - "[[SPRITE-SHEETS]]"
  - "[[ART-DEPARTMENT]]"
---

# Face Tokens — cropping heads out of the sprite register

`build/gen-face-tokens.py` turns full-body register sprites into circular
face tokens (dark disc, gold ring, pixel crunch preserved). Annotations live
in `build/face-token-overrides.json`. First consumer: SRD TD
(`~/Desktop/Work/projects/srd-td/assets/tokens/`); the same output serves
Genesis HUD portraits, bestiary dashboards, battle trays.

## The core problem — and the answer

**Heads are not in any uniform location.** The register does not deliver the
consistency its style spec implies: facing direction varies per sprite
(wolves face right, the red dragon faces left, harpies face forward), heads
sit anywhere from top-center (humanoids) to bottom-right (a diving bat), and
the largest visual masses — wings, manes, raised weapons, shields — are
decoys that sit exactly where naive math expects a head.

**The answer that survived four iterations: stop estimating, start
annotating.** Geometry gets a first pass; a human-graded (or vision-model)
bounding box gets the final word. Every attempt to make the pure heuristic
smarter (facing assumptions, leftmost-mass, zone tuning) failed on some body
plan. The annotation loop converged in one pass per sprite once the protocol
below was followed.

## Failure taxonomy (each of these was actually hit)

| # | Failure | What it looked like | Fix |
|---|---|---|---|
| 1 | **Centroid ≠ head.** Alpha centroid of a "head zone" lands on hair, shoulder fur, or armor mass | Wolf tokens of pure shoulder fur | Don't ship centroid crops for non-uprights; annotate |
| 2 | **Facing is not uniform.** "Sprites face left" was assumed from the style spec; quadrupeds face right | Leftmost-mass "fix" cropped paws | Never assume facing — LOOK at the sprite |
| 3 | **Wings/manes are decoys.** The topmost/biggest mass on winged creatures is wing, on lions is mane | Imp/stirge/dragon tokens of pure wing; manticore token of mane fibers | Annotate; the head is often the SMALLER mass |
| 4 | **Feature-center ≠ head-center.** Annotating "the face" (eyes/mouth) with a zoom factor gives nose-filling-frame close-ups that amputate ears/crest | v1–v2 giant-rat, kobold | Box the WHOLE head — outermost pixels of ears, horns, hood, hat, mane — never a center point |
| 5 | **Eyeballed coordinates drift.** Unaided estimates were off by 0.05–0.25 normalized; manticore's face was guessed at x 0.57, actually at 0.83 | Two wasted nudge cycles | Grid overlay (below) before annotating; no naked-eye coordinates |
| 6 | **Circle clips box corners.** A circular mask over a square crop cuts anything in the corners — plume tips, hat points, ear tips | v3 partial heads even with correct boxes | Circle side = box **diagonal** × margin (`hypot(w,h) * 1.06`), never `max(w,h)` |
| 7 | **Source-edge truncation.** A head drawn to the sprite's own image edge can never be uncut | Knight's plume tip | Unfixable downstream; note and accept, or fix the source art |
| 8 | **A box can enclose air.** Even a grid-annotated box can span the empty gap between decoys (wings) or carry dead margin on one side — the token then renders the head off-center | Harpy box half-full of inter-wing air; gargoyle box with dead left margin | DEBUG-RENDER the box + circle back onto the sprite before regenerating; the box must HUG head pixels on all four sides |

## The annotation protocol (follow exactly)

1. **Bulk pass:** run the heuristic over the batch, `--montage`.
2. **Review the montage at native resolution** — split it into halves/
   quadrants if the review surface downscales. Downscaled review misses
   rim-clips (lesson 6 was invisible until high-res inspection).
3. For every wrong or partial token: **render a grid overlay** (2× upscale,
   gridlines every 0.1 with axis labels) and read the head's true extent
   off the grid. The overlay snippet lives in this doc's history and takes
   ~10 lines of PIL.
4. **Record a bounding box, not a center**: `{x0, y0, x1, y1}` normalized
   0–1 over the full image, enclosing the outermost head pixels — ears,
   horns, crest, hood, hat brim, mane. When torn between tight and loose,
   go loose on head features, but the box must still HUG the head on all
   four sides — dead margin or enclosed air shifts the center (lesson 8).
5. **Debug-render before regenerating**: draw the box and its token circle
   onto the gridded sprite and look at it. Empty box regions and off-center
   heads are unmissable in that view and invisible in the numbers.
6. Regenerate **only the changed slugs**, re-review, repeat. One grid-aided
   pass per sprite converges; estimate-and-nudge does not.
7. `report.csv` flags `low` confidence heuristic crops — those are the
   review queue for unannotated sprites.

## Division of labor

Deterministic script does all rolling/cropping/masking (engine does the
mechanical work); vision — human or model — does only the interpretive job
of saying where the head is, once, into a permanent overrides file (the AI
interprets; the file is canon). Overrides never expire: annotate once,
regenerate forever. For a full-register (~896) rollout: heuristic bulk pass →
montage triage → grid-annotate the failures, expecting most uprights to pass
and most quadrupeds/winged/weird to need boxes.

## Invocation

```
python3 build/gen-face-tokens.py <out_dir> [--size 160] [--montage] \
    --overrides build/face-token-overrides.json  <slug ...| --all>
```
