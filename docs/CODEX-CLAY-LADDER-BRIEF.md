# CODEX-CLAY-LADDER-BRIEF — climb CL-R1 → CL-R3 (the guard-house building process, foundation courses)

type: agent-brief
status: COMPLETE 2026-07-25 — CL-R1 / CL-R2 / CL-R3 engineering and capture packets built;
  founder visual verdicts and Fable re-gate/landing remain
consumer: Codex. Adam hands this to a fresh Codex session.
owning spec: `docs/CLAYROOM-RESET-LADDER.md` — read it FIRST, fully. This brief sequences and
scopes; the ladder doc owns every rung's contract. Standing gate (NEXT-STEPS, Adam's ruling):
**Guard Post 1 may not start until CL-R0…CL-R6 pass.** R0 and R3a are built; the door is done
(D18–D23). You are climbing the rest, in order.

## Your task

Climb **CL-R1 → CL-R2 → CL-R3**, one rung per checkpoint, stopping to report after each:

1. **CL-R1 — colour, light, and tone-response truth.** Generalize the tunable light recipe to a
   bounded `lights[]`; admit the warm/cool pair as a NAMED test recipe through the same registry
   as the Lighting Lab (it currently bypasses `applyLightProfile`/`LIGHT_TUNABLES` — CR-2); split
   diagnostic studio lights from rolled practicals; fix the `bracket-generic` mount-socket degrade
   (CR-3). Diagnose the washed-out sprite **causally** — colour-space tagging, texture sampling,
   tone mapping, light energy, material response, compositing — tested separately, with causal
   A/B captures and measurements. **No saturation slider** (Adam's words). Lighting Lab 2.0
   authoring per the ladder doc's tool contract.
2. **CL-R2 — complete sprite citizenship** (the CL-F03 bench): representative sprites across
   size/alpha/value bands — sRGB, footX/footY, world height, thin side shell, plinth,
   contact/cast shadow, light response, cutaway — all pass on the reset fixture. The Sprite
   Editor crosshair delta (bounded; extend `dev/sprite-review.py`, never a new editor) rides
   here, AFTER lighting causality is stable.
3. **CL-R3 — basic construction grammar** (the CL-F01 structure-bench): runs, corners, ends,
   openings, tiers, risers, connectors, blockers, in neutral clay. **This bench consumes
   `docs/STRUCTURE-KIT-CATALOG.md`** — grid law §2 (5-ft cell, h=2.5 ft, storey 4h, ≤30°
   walkable), socket schema §4 (CL-S08 base + the catalog extensions: `walk-surface`, `catch`,
   `terrain-join`, `roof-pitch-join`), piece families §9 (elevation mass, retaining face, stair
   connector, parapet base are the guard house's skeleton — prove them generic here), access
   classes §6 (tag every face `walk`/`climb-cost`/`climb-dc`/`none` as DATA; build no climb
   mechanics). Negative controls per the admission gate (a wrong-axis socket must visibly fail).

CL-R4 (material bench) is NOT yours this wave — it waits on material brief #2's outputs.
Guard Post rung A (the open-top guard room) is not yours either; it opens after the ladder.

## Your lane

Worktree `../worktrees/Genesis-clay-ladder`, branch `clay/cl-r1-r3`
(`GIT_LFS_SKIP_SMUDGE=1 git worktree add ../worktrees/Genesis-clay-ladder -b clay/cl-r1-r3`).
Touch: `src/engine/clay-room.js`, `src/ui/theater-boot.js` lighting/sprite paths the ladder doc
names, `dev/clay-captures/`, `dev/sprite-review.py` (crosshair delta only), the ladder doc's own
status lines, `manifest.json` if a module is added. Never: canon docs, `Engine/`, other lanes'
files. Never push; never merge; Fable re-gates and lands your branch.

## The bar

- Every rung ships with its harness green, capture packets + receipts per the clay capture law,
  and its ladder-doc status updated in the same commit. `python3 build/check-manifest.py` OK
  after any module edit.
- **Validators preserve the thing's job** — an honest red beats a green that lies. If a rung's
  contract and reality conflict, STOP and report; do not bend the harness.
- **The front/back gate split stands:** your greens prove the measurable back end; Adam rules
  every visual from your capture packets. Never declare a visual "fixed" — hand the packet.
- Mark `FULL CI PENDING` in HANDOFF at each checkpoint; the Fable close owns the full gate.

## Report format (raw data, per rung)

Branch + SHAs · harness counts (n/n) · capture packet paths · what changed causally (for CL-R1:
the named root cause per symptom, with the A/B evidence paths) · anything you could not make
deterministic · open taste questions for Adam (batched, plain English).
