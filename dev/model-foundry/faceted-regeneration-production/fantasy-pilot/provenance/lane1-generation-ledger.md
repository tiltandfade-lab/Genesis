---
type: generation-ledger
project: Genesis
packet: PACKET-F1
lane: 1
created: 2026-07-13
runtimeAdmitted: false
---

# Fantasy Faceted Figure Factory - Lane 1 Anchor Candidates

Source packet: `dev/model-qa/faceted/PACKET-F1.md`

Execution mode: built-in `image_gen` tool, one identity per generation call, two candidates per
identity. All files are raw candidates only; none are admitted to runtime.

## Candidate Ledger

| slug | candidate | file | generation call id | runtimeAdmitted | notes |
| --- | --- | --- | --- | --- | --- |
| spr-fantasy-bandit-enforcer | 001 | `raw-figures/spr-fantasy-bandit-enforcer-candidate-001.png` | `call_gNiMRwp809pl0BkPy8zLaKXR` | false | Strong identity landmarks; mature large-facet style; full-body framing is usable. |
| spr-fantasy-bandit-enforcer | 002 | `raw-figures/spr-fantasy-bandit-enforcer-candidate-002.png` | `call_wbbWRHPUNx2bgUCcc49AYuSD` | false | Stronger shared-language anchor than 001; full-body framing is usable. |
| spr-fantasy-scarred-feral-guard-dog | 001 | `raw-figures/spr-fantasy-scarred-feral-guard-dog-candidate-001.png` | `call_A4AyuB91o5UBCvHKIU5BCjKm` | false | Reads feral and non-anthropomorphic; visible ribs/torn ear/collar present. |
| spr-fantasy-scarred-feral-guard-dog | 002 | `raw-figures/spr-fantasy-scarred-feral-guard-dog-candidate-002.png` | `call_ben3vGHWZrnopsurhtGv9bHH` | false | Best dog candidate; compact stalk pose and clear support region. |
| spr-fantasy-undead-knight | 001 | `raw-figures/spr-fantasy-undead-knight-candidate-001.png` | `call_bXf5XUvicVb0PfULQL1Nk17e` | false | Excellent identity/style; sword tip is close to frame edge, so check crop tolerance in QA. |
| spr-fantasy-undead-knight | 002 | `raw-figures/spr-fantasy-undead-knight-candidate-002.png` | `call_9WhaMwahRinHUv5X4vN6jNMP` | false | Similar to 001; strong shield and tabard, sword also runs close to edge. |
| spr-fantasy-adult-black-dragon | 001 | `raw-figures/spr-fantasy-adult-black-dragon-candidate-001.png` | `call_TEbdowiTDX2oVf4gfiO07EO1` | false | Strong boss-language anchor; wing tips are tight but not visibly cropped. |
| spr-fantasy-adult-black-dragon | 002 | `raw-figures/spr-fantasy-adult-black-dragon-candidate-002.png` | `call_bILxMZzNtoGEAzkCP9YCu9bp` | false | Strong silhouette; green acid detail at jaw may be too effect-like for source-art purity. |
| spr-fantasy-ornate-heraldic-shield | 001 | `raw-figures/spr-fantasy-ornate-heraldic-shield-candidate-001.png` | `call_hbJocTI3ntos6iSN3uqyaNHa` | false | Good high-tier read; has visible thickness/perspective cues, so not a perfect strict front-elevation source. |
| spr-fantasy-ornate-heraldic-shield | 002 | `raw-figures/spr-fantasy-ornate-heraldic-shield-candidate-002.png` | `call_q2mjpR7Ne29YODkP4Mi0wCf8` | false | Best shield candidate; still has mild bevel-lighting/thickness cues, but reads centered and ceremonial. |

Contact sheet: `contact-sheets/lane1-anchor-candidates.png`

## Two-Minute Anchor Verdict

Verdict: PASS FOR LANGUAGE, WITH QA CAVEATS.

The five anchors read as one mature, restrained, large-faceted fantasy language. The creature and
humanoid candidates avoid toy/chibi/MMO drift and hold serious material weight. Lane 1 therefore
does not call for master-prompt recalibration on style alone.

Caveats to carry into QA:

- Undead knight candidates need crop/framing scrutiny around the sword.
- Dragon candidate 002 may be too effect-forward at the jaw for source-art purity.
- Shield candidates are attractive, but both drift from the strict "flat front identity layer only"
  rule by implying bevel/side thickness and lighting. Treat the shield pair as style evidence, not
  automatic prop-contract admission.
- Quick border-variance check found all candidates mechanically close to flat-key backgrounds
  (`max_border_std` roughly 1.3-3.3 across the set), but final chroma QA should still happen after
  cutout tooling because anti-aliased subject edges touch the sampled border in some crops.
