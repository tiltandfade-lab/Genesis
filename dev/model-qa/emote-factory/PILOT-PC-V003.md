---
type: visual-proof-note
status: TECHNICAL-PASS-VISUAL-REVIEW-REQUIRED
date: 2026-07-27
job: emote-spr-pc-human-fighter-male-v003
---

# Human Fighter canonical emote pilot v003

## State set

V003 implements Adam's canonical six:

1. `neutral`
2. `angry`
3. `happy`
4. `near-death`
5. `resting` — quiet seated field-rest
6. `rear-view` — genuine back construction, not a mirrored front

## Correction history

- V001 proved the state order and rear view but made resting a standing idle. Adam rejected it.
- V002 edited resting into a seated field-rest. Its mechanical gates passed, including seated
  compression at `0.756322` of standard state height.
- Adam rejected V002's rear-view sword hand as malformed. Its filled visual checklist compiles to
  `visualIdentity: FAIL` and `runtimeAdmission: REJECTED`.
- V003 edits only the rear-view state. The sword-side arm now resolves through a visible wrist and
  hand into a downward hilt grip; the shield-side attachment and true back construction remain
  explicit.

## V003 technical result

- six of six required cells populated;
- all borders clear and no measured magenta edge residue;
- maximum normalized baseline delta `0.045988` against limit `0.05`;
- maximum standard-state relative-height delta `0.082949` against limit `0.25`;
- seated compression ratio `0.755761` inside licensed range `0.4..1.05`;
- source-palette coverage about `0.98–0.99` per state;
- atlas, UV metadata, state hashes, proof board, and visual-review template emitted;
- `mechanicalIdentity: PASS` (11/11);
- `visualIdentity: REVIEW_REQUIRED`;
- `runtimeAdmission: CANDIDATE`.

The machine result does not overrule visual review. Inspect:

- `returns/emote-spr-pc-human-fighter-male-v003-imagegen.png`;
- `pilots/emote-spr-pc-human-fighter-male-v003/proof-board.png`;
- `pilots/emote-spr-pc-human-fighter-male-v003/visual-review.json`.

Only a fully completed, all-pass review compiled by `assetforge.py emote review` may advance the
visual identity status. Runtime admission remains a separate Dev Portal action.
