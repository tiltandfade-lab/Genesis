---
type: design-study
status: CONFIRMED — accepted at Wave 11 closure (2026-07-22, record §19.7)
wave: 11
created: 2026-07-22
---

# Wave 11 phasing audit (proposed)

Applies the [phasing framework](../PHASING-FRAMEWORK.md) to the proposed Wave 11 dispositions.
Ledger rows stay UNAUDITED; nothing claims implementation.

## Pre-alpha-critical (narrow contract must exist)

| Family | Minimum critical form | Why it cannot wait |
|---|---|---|
| Power classes + generated-surface refusal (P11.1/P11.2) | READ/PREVIEW/COMMIT-SOURCE/DANGEROUS flags; no edit affordance on compiled artifacts | An agent or tool that edits generated truth once corrupts the source-of-truth law everywhere |
| Preview sandbox flag (P11.4) | Previewed material watermarked, cannot reach live worlds | Leaked previews are silent canon writes |
| Machine-readable diagnostics retention (P11.5 seam) | Every mandated trace (solver/reservation/receipt/compile) stays structured, not prose-only | The Explain panel and G11.2 debugger are unbuildable retroactively if diagnostics ship as prose |
| Autonomy graduation contract (P11.11) | Staged outputs, audit sampling, rollback, revocation on existing lanes | Ungoverned autonomous lanes are the executor-scar class at pipeline scale |

## Proof → playable MVP → feature goal

| Family | Proof | Playable MVP | Feature goal | Seam retained | Promotion evidence |
|---|---|---|---|---|---|
| Declarative vocabulary authoring (P11.3/G11.1) | AffordanceTags authored→compiled→consumed | program core vocabularies on the shared validator | full G11.1 breadth incl. motif hooks | validator + registry emitter | each wave's content demand |
| Explain panel (P11.5) | Explain over C1A compile + one receipt chain | supported artifact kinds | G11.2 full causal debugger | structured diagnostics | authoring friction evidence |
| Teaching loop (P11.9/F11.1) | WHY-records in one session; one delta-replay | ledger + explicit promotion lanes | curated context corpus + motif hooks | WHY-record schema; constraint-delta storage | teaching actually improves outputs (sampled) |
| Continuity assertions (P11.7/G11.2) | assertions on one golden trace | assertions across soak corpus | flagship G12.2 IP-clean long trace | assertion fixture format | drift catches in soak |
| Batch sampling law (P11.8) | one batch with sample review + worst-K tails | law enforced on all batch gates | full matrix breadth | sample-emit hook | gate integrity audits |
| Corpus tooling (P11.6/P11.12) | batch runner + capture reuse on existing fixtures | tooling for the accumulated corpus | twelve-site production support | fixture/seed/capture formats | corpus growth |
| Creator surface (Q11-A) | — | — (internal-only v1) | player-facing creator (if B/C chosen) | P11.1 power classes + sandbox | product evidence post-MVP |

## Exclusions (owned elsewhere)

Game semantics (Waves 1-10); certification policy content (G2.1-CERT); asset admission criteria
(P10.11); evidence method (P10.12); persistence/migration machinery (W12); mod/sharing product
depth (DEFERRED to Wave 12/product trigger, carried in canon OPEN-QUESTIONS batch 2).

## Ledger reconciliation (proposed)

Refines "Twelve-site/eight-trace portfolio" (Wave 11 named corpus-production owner becomes
concrete tooling obligations) and "SceneFact promotion and private deliberation" (certification
harness tooling). Adds one row: **Workbench, teaching, and autonomy governance** (MVP
obligation: power classes + sandbox + Explain + WHY-ledger + graduation contract on existing
lanes; proof: first workbench pass over C1A artifacts; gate: authoring round-trip + teaching
trace; goal: G11.1/G11.2 breadth + creator tier per Q11-A; trigger: authoring friction + corpus
production demand). Ledger edits applied at Wave 11 closure (2026-07-22, record §19.7).
