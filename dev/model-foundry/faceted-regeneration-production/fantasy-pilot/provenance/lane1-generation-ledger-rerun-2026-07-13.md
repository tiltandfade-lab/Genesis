---
type: generation-ledger
project: Genesis
packet: PACKET-F1
lane: 1
created: 2026-07-13
runtimeAdmitted: false
supersedes: generation-ledger.md candidates 001-002
---

# Fantasy Faceted Figure Factory - Lane 1 Rerun

Source packet: `dev/model-qa/faceted/PACKET-F1.md`, updated with Adam's 2026-07-13
§0 art-direction rulings.

Execution mode: built-in `image_gen` tool, one identity per generation call, two rerun candidates
per identity. All files are raw candidates only; none are admitted to runtime.

Contact sheet: `contact-sheets/lane1-anchor-candidates-rerun-2026-07-13.png`

## Candidate Ledger

| slug | candidate | file | generation call id | runtimeAdmitted | notes |
| --- | --- | --- | --- | --- | --- |
| spr-fantasy-bandit-enforcer | 003 | `raw-figures/spr-fantasy-bandit-enforcer-candidate-003.png` | `call_OuH7TP3Cu5Pw9jF8vtjAjaQi` | false | Corrects old heavy-body drift; tall, rangy, mean read; full-body vertical frame. |
| spr-fantasy-bandit-enforcer | 004 | `raw-figures/spr-fantasy-bandit-enforcer-candidate-004.png` | `call_gHT2klcCSVTD67Lnx6jeTpez` | false | Best bandit rerun; lanky silhouette and compact support region; slightly cleaner than 003. |
| spr-fantasy-scarred-feral-guard-dog | 003 | `raw-figures/spr-fantasy-scarred-feral-guard-dog-candidate-003.png` | `call_JM82RBzUxOnRxNOhUdLB5GjH` | false | Strong feral/front-facing read; close crop around head, but full figure visible. |
| spr-fantasy-scarred-feral-guard-dog | 004 | `raw-figures/spr-fantasy-scarred-feral-guard-dog-candidate-004.png` | `call_Sh2hEZCF84AN2k04m4pqDfrT` | false | Best dog rerun; compact stalk pose, vertical frame, no anthropomorphic drift. |
| spr-fantasy-undead-knight | 003 | `raw-figures/spr-fantasy-undead-knight-candidate-003.png` | `call_Z6e600w4BV7JNjfmApOBZbBD` | false | Strong identity/style; sword remains close to edge and should be crop-checked. |
| spr-fantasy-undead-knight | 004 | `raw-figures/spr-fantasy-undead-knight-candidate-004.png` | `call_wEHrbWjVv1FiPVmHX52JQDnF` | false | Best knight rerun; cleaner full-body crop and compact stance, with slightly plainer pose. |
| spr-fantasy-adult-black-dragon | 003 | `raw-figures/spr-fantasy-adult-black-dragon-candidate-003.png` | `call_KW7tU91o7qpA31ndJAnmH9vE` | false | Strong compact boss anchor; no green acid/effect spill; excellent support-region read. |
| spr-fantasy-adult-black-dragon | 004 | `raw-figures/spr-fantasy-adult-black-dragon-candidate-004.png` | `call_xXqtbhnLBnSqZPoGlnaoCXQK` | false | Best dragon rerun; compact coil and clean skull-face read; no effect plume. |
| spr-fantasy-ornate-heraldic-shield | 003 | `raw-figures/spr-fantasy-ornate-heraldic-shield-candidate-003.png` | `call_Uj7Cnk6kFNiTnkWzxU3REzAm` | false | Hole defect fixed: empty socket is backed. Still implies some bevel/light depth, so prop-contract QA remains needed. |
| spr-fantasy-ornate-heraldic-shield | 004 | `raw-figures/spr-fantasy-ornate-heraldic-shield-candidate-004.png` | `call_orRi5peMviSz1302JqfmLRxd` | false | Best shield rerun; backed empty socket, centered ceremonial read, no chroma showing inside damage. |

## Rerun Verdict

Verdict: PASS FOR LANGUAGE AND PASS THE SHIELD-HOLE CORRECTION, WITH QA CAVEATS.

The rerun set better matches the updated §0 rulings than the first pass:

- Bandit enforcer is now lanky/rawboned rather than a default bulky bruiser.
- Dog candidates are vertical, compact, forward-facing standee sources instead of wide side sheets.
- Dragon candidates keep the boss silhouette compact with no green acid effect.
- Shield candidates no longer expose the green chroma background through the empty socket.

Caveats to carry into QA:

- Knight candidate 003 still needs crop scrutiny at the sword; 004 is safer.
- Shield candidates still imply some raised/beveled lighting and are not pure flat identity layers.
- Border-variance check over candidates 003-004 found mechanically low background variation
  (`max_border_std` roughly 1.3-3.3), but final chroma/cutout QA still belongs to the admission pass.
