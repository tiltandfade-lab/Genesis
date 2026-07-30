---
type: visual-proof-note
status: TECHNICAL-PASS-VISUAL-REVIEW-REQUIRED
date: 2026-07-27
job: emote-spr-fantasy-goblin-warrior-v001
---

# Sprite-emote pilot — Goblin Warrior v001

## Outcome

The first real ImageGen return passed all ten v1 mechanical gates and remains a quarantined
candidate. It is not runtime-admitted. This pilot predates Adam's same-session ruling that changed
the canonical pack to `neutral`, `angry`, `happy`, `near-death`, `resting`, and `rear-view`; v001 is
preserved as provenance and compiler evidence, not as the canonical state roster.

Inputs and provenance:

- live identity source: `assets/sprites/spr-fantasy-goblin-warrior.png`;
- source SHA-256: `d49935c34ebe4a3e3e97994c328754cfb0d20e7e1a805a3877d9d0399c819086`;
- exact generation packet: `jobs/emote-spr-fantasy-goblin-warrior-v001.prompt.md`;
- exact submitted prompt: `jobs/emote-spr-fantasy-goblin-warrior-v001.imagegen-call.prompt.md`;
- provider: OpenAI built-in `image_gen`;
- model id: unreported by the built-in tool;
- generation call id: `call_J0Mvbf47dJGqNnmpIUQhaDQE`;
- returned-sheet SHA-256:
  `c5945b71e478f0fa3fa4698bf6247a2a1f0b8f275d9a81efa999fbba83b0d505`.

Mechanical result:

- actual canvas `1536 x 1024`; derived cells `512 x 512`;
- six of six required cells populated;
- all cell borders clear;
- zero measured magenta edge residue after key/defringe;
- maximum normalized baseline delta `0.034246` against limit `0.05`;
- maximum relative content-height delta `0.058111` against limit `0.25`;
- atlas, UV metadata, individual state hashes, and proof-board hashes agree;
- `technicalStatus: PASS`;
- `visualIdentity: REVIEW_REQUIRED`;
- `runtimeAdmission: CANDIDATE`.

## Visual read

The source identity, long ears, green skin, cap/helmet, armor family, sword, bow, and general
three-quarter silhouette survive across the historical set. Furious, wounded, triumphant, and afraid are
visibly distinct at proof-board size. The reduced 64-pixel row is the honest pressure test: broad
states remain readable, while idle versus grim is a subtler distinction and needs an art-director
ruling.

The generated sheet is more internally uniform than the source sprite and changes fine facial and
equipment pixels. More importantly, this source is already redlined by Adam for its contradictory
simultaneous sword-and-bow read (`docs/ART-DEPARTMENT.md`); preserving both items proves the
compiler's source lock but cannot make the underlying art admissible. That is why the receipt does
not claim visual identity from palette/baseline metrics. Mechanical `PASS` is necessary evidence,
not an approval.

Review these artifacts:

- returned source: `returns/emote-spr-fantasy-goblin-warrior-v001-imagegen.png`;
- proof board: `pilots/emote-spr-fantasy-goblin-warrior-v001/proof-board.png`;
- receipt: `pilots/emote-spr-fantasy-goblin-warrior-v001/receipt.json`;
- runtime-ready candidate metadata:
  `pilots/emote-spr-fantasy-goblin-warrior-v001/atlas.json`.

## Next pilot correction if requested

If idle/grim separation is judged weak at play scale, regenerate once with this targeted correction
only:

> Keep IDLE characteristic and watchful with an asymmetric ready-snarl. Make GRIM closed-mouth,
> heavy-eyed, and visibly burdened through lowered ears and compressed shoulders. Preserve every
> identity and equipment lock; do not change any other state.

Do not silently edit the accepted cells or promote this sheet without the visual ruling.
