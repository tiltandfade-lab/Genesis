---
type: design-study
status: CONFIRMED — accepted at Wave 12 closure (2026-07-23, record §20.7; no build authorized — Q12-B reserved)
wave: 12
created: 2026-07-22
---

# Wave 12 phasing audit (proposed)

Applies the [phasing framework](../PHASING-FRAMEWORK.md) to the proposed Wave 12 dispositions.
Ledger rows stay UNAUDITED. Wave 12's own law is restated: discovery is not build
authorization; this audit makes the eventual authorization *readable*, nothing more.

## Pre-alpha-critical (narrow contract must exist)

| Family | Minimum critical form | Why it cannot wait |
|---|---|---|
| Save boundary (P12.1) | The exact/derived/separate/never-store lists versioned with the schema | Everything C1F/C2D/C3B prove depends on knowing what truth is |
| Chunked receipts + two-phase cross-chunk commit (P12.2) | Atomic per-chunk writes; deterministic crash reconciliation | Retrofit = save-format rewrite; partial writes corrupt canon |
| Migration registry from schema v1 (P12.3) | Every version bump ships migrator + expansion fixture | The W2 old-save proof mandate is unmeetable retroactively |
| Repair ladder (P12.7) | Ordered recovery; destructive reset never automated | Player-trust invariant (forever-persistence promise) |
| Gate matrix discipline (P12.9) | Block-vs-warn typing per Clay Pass gate | Prevents polish gates blocking truth work and truth gates being warned away |

## Proof → playable MVP → feature goal

| Family | Proof | Playable MVP | Feature goal | Seam retained | Promotion evidence |
|---|---|---|---|---|---|
| Storage/codec (F12.1) | synthetic long-world bakeoff fixture on the Mac | pinned codec via ADR; chunked persistence live | archive/search policy, cross-device export breadth | fixture + envelope budgets | bakeoff measurements (vetoes → comparison) |
| Reconciliation (P12.2) | C1F interruption + one cross-chunk crash trace | crash-safe saves across MVP surface | long-world compaction cadence tuning | receipt-cursor law | soak/corruption drills |
| Migration (P12.3) | one schema bump with expansion fixture | registry enforced | full W2 proof list as standing gates | registry + fixtures | each version bump |
| Flagship golden session (P12.9/G12.2) | first bounded cooperative-crisis trace w/ continuity assertions | trace grows with soak corpus | full IP-clean long-session spine | harness + assertion format | soak accumulation |
| Privacy/sharing (P12.8, Q12-A) | — (posture choice) | chosen defaults enforced | sharing/mod product surface (W11 deferral trigger) | consent seams (P10.10/G2.1-CERT) | product evidence |
| Build-order visibility (P12.10) | this consolidation | — | authorized slice 1 at Q12-B | ladder/ledger | Q12-B checklist green |
| Legacy disposition (P12.11) | — | disposition rows in the first build plan | executed retirements w/ proofs | golden-beat classes | per-cutover proofs |

## Exclusions (owned elsewhere)

Semantic content (Waves 1-11); evidence method and release selection (P10.12 — Adam's reserved
call); asset admission (P10.11); the authorization itself (Q12-B, Adam at the gate).

## Ledger reconciliation (proposed)

Refines "Canonical active/site/cold ownership" and "Sparse three-tier semantic growth"
(their Wave-12-owned codec/migration cells now have a named instrument, F12.1); refines
"Twelve-site/eight-trace portfolio" (gate matrix + flagship trace). Adds one row:
**Persistence, migration, and acceptance machinery** (MVP obligation: save boundary + chunked
receipts + migration registry + repair ladder + gate matrix; proof: F12.1 + C1F/C3B traces;
gate: C3B + first schema-bump fixture; goal: full W2 proof list + flagship golden session;
trigger: bakeoff + soak evidence). Ledger edits applied at Wave 12 closure (2026-07-23,
record §20.7).

## Consolidated dependency view (visibility, not authorization)

Recovery package → C1A-D spine (+C1E-G) → F8.1 → C1H/C1I/C1J/C1K → C2A-D → modules
(C2G/C2H-L/C2M/C2N/C2O) → C3A-C → C4A-C (→C4D+ goals) → C5 portfolio; W11 tooling alongside
from stage 1; W9 registry shape consumed from C2B onward; storage bakeoff beside C3B. The first
felt-player-value slices remain the C1D room fight, the C2D handoff, and the C2M town loop.
