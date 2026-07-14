---
type: generation-ledger
project: Genesis
packet: PACKET-F1
lane: 3
created: 2026-07-13
runtimeAdmitted: false
note: >
  Reconstructed during F1 consolidation. Lane 3 did not author a standalone provenance
  file; it appended its records to the shared `AUDIT.md` (base-inherited doc). Call ids
  below are lifted verbatim from that AUDIT.md addition (lane3 worktree,
  branch codex/faceted-f1-lane3). Source of truth for the prose audit notes remains that
  AUDIT.md section.
---

# Fantasy Faceted Figure Factory — Lane 3 goblinoid + kobold wave

Source packet: `dev/model-qa/faceted/PACKET-F1.md`. Built-in image generation, one call per
SHEET, sheet-economy per §0 (Small = 4/sheet, Medium = 2/sheet). All raw candidates only;
`runtimeAdmitted:false`.

| sheet | saved candidate | source call id | cells |
| --- | --- | --- | --- |
| S1 (2×2 smalls) | `raw-figures/fantasy-goblin-warrior-minion-hexer-cutter-candidate-020.png` | `call_2e7R5ZS30m44Rz11vspyygAg` | `spr-fantasy-goblin-warrior`; `spr-fantasy-goblin-minion`; `spr-fantasy-goblin-hexer`; `spr-fantasy-goblin-cutter-minion` |
| S2 (3-cell remainder + empty chroma cell) | `raw-figures/fantasy-goblin-boss-kobold-urd-candidate-021.png` | `call_qd8RzgBSd3jZwQU6rL81Li9f` | `spr-fantasy-goblin-boss`; `spr-fantasy-kobold`; `spr-fantasy-winged-kobold-urd` |
| S3 | `raw-figures/fantasy-hobgoblin-soldier-captain-candidate-022.png` | `call_dTsEcgMUV1NCLD4WdZWgmNIK` | `spr-fantasy-hobgoblin-soldier`; `spr-fantasy-hobgoblin-captain` |
| S4 (odd Medium, solo) | `raw-figures/fantasy-hobgoblin-iron-shadow-candidate-023.png` | `call_xxB6JsZ8pGdMqvYAJjpAiUHb` | `spr-fantasy-hobgoblin-iron-shadow` |

Naming note: lane 3 filenames use the `fantasy-` prefix (not the packet's `spr-fantasy-`
slug convention) and a lane-local candidate sequence 020–023 that collides numerically with
lanes 4 and 5. Preserved verbatim here to keep call-id ↔ filename mapping intact; see
`CONSOLIDATION-LEDGER.md` for the reconciliation flags.
