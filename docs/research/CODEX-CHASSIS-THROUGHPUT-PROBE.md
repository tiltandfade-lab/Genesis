---
type: research-probe-brief
project: Genesis
status: DRAFT — awaiting Adam's go before any Codex lane runs
created: 2026-07-31
owner: spatial-compiler research program (R4)
serves: GOLDEN-SITE-SPATIAL-COMPILER-PLAN.md §5 (module ownership), the P3 method decision
---

# CODEX CHASSIS THROUGHPUT PROBE (R4)

## The question this answers

WFC's main justification is combinatorial variety from a SMALL hand-authored module set —
worth the solver complexity only while authoring is the expensive thing. Codex has proven
handy at in-engine three.js construction when the setup, prompts, and constraints are
tight. If Codex can mass-author *chassis* (taste-reviewable parameterized building
assemblies) that pass our mechanical gates, authored variety becomes cheap, and the
assembly solver's job shrinks to composition + completion — grammar territory, not WFC.

This probe MEASURES that, one overnight lane, before any P3 method commitment.

## Setup (what Codex receives)

1. **The socket contract** — the six-face socket registry (`feat/socket-algebra`, A1) and
   the `ConstructionSocketV2` sketch from the plan §5.2, stated as data-shape requirements.
2. **One exemplar chassis** — the current guard watchhouse translated by hand into the
   target declarative form: footprint envelope, storey stack, opening obligations, roof
   family, deck/lookout attachment, foundation modes, parameter ranges with legal bounds.
3. **The validator harness** (build first, ~a day: `dev/verify-chassis-gate.mjs`) — red-first
   mechanical gates, no taste: closed wall loops; roof covers every storey top; every
   opening on a reachable face; exactly the declared program obligations (one operating
   threshold, lookout when declared); stair/vertical access reaches every storey;
   support: no cantilever beyond declared class; parameter sweep at min/mid/max stays legal.
4. **The ask** — ten NEW chassis across three named families (compact watch structures,
   road-service structures, retained/embedded structures), each with 3+ meaningful
   parameters, each declaring its program obligations in data.

## What we measure (all MEASURED, no eyeballing)

| metric | how |
|---|---|
| mechanical pass rate | N of 10 passing `verify-chassis-gate.mjs` untouched, first submission |
| repair distance | for failures: lines changed to reach green, and by whom |
| parameter honesty | sweep min/mid/max per parameter; count illegal geometry escapes |
| taste survival | Adam reviews neutral-clay renders of the passers; keep / kill / revise |
| wall-clock + cost | lane hours and spend for the ten |

## Decision rule

- **≥5/10 mechanical pass AND ≥half of passers survive Adam's taste pass** → library
  economics PROVEN; P3 gets rewritten around grammar + Codex-authored chassis library;
  WFC demoted to optional surface tiling.
- **<3/10 pass or systematic parameter dishonesty** → authored-library path is expensive;
  the solver-heavy path regains weight; rerun probe once with improved exemplar/prompt
  before concluding (prompt quality is a confound — one retry is part of the protocol).
- In between → judgment call, taken to Adam with the failure ledger.

## Boundaries

- Runtime determinism is not at stake: Codex authors DATA offline; the engine assembles
  with seeds. No model call enters any mechanical loop (SPEED doctrine).
- The probe does not touch master: its harness + chassis data land in this research lane.
- No Meshy/asset spend; neutral clay only; renders per the plan §11 budget law
  (one production bearing per candidate, four bearings only for taste-pass survivors).
- The validator harness is a keeper regardless of outcome — it is the same gate any
  method's output (WFC, grammar, hand-authored) must eventually pass.

## Open before launch (Adam)

1. Go / no-go on the lane itself, and which model seat runs it (Codex vs Sonnet executor).
2. Are the three families above the right first three, or swap one?
3. Does taste review happen on this probe's clay renders, or fold into the next
   golden-wave visual session?
