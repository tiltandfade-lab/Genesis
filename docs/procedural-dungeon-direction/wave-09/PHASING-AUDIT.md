---
type: design-study
status: CONFIRMED — accepted at Wave 9 closure (2026-07-22, record §18.7)
wave: 9
created: 2026-07-22
---

# Wave 9 phasing audit (proposed)

Applies the [phasing framework](../PHASING-FRAMEWORK.md) to the proposed Wave 9 dispositions.
Ledger rows stay UNAUDITED; nothing claims implementation.

## Pre-alpha-critical (narrow contract must exist)

| Family | Minimum critical form | Why it cannot wait |
|---|---|---|
| Card registry shape (P9.1/P9.2) | Cards as typed projections of owner receipts with stored legality predicates; no ownerless card | A card store that owns facts is a second world authority — the core drift failure |
| DM turn digest schema (P9.10/G9.2) | Hand + cast validity + viewpoint facts + due obligations + legal-action families + posture flags | The digest is what every provider eats; retrofitting its shape breaks seat neutrality and saves |
| Hand-state recovery (F9.1) | Hand rebuilt deterministically from receipts on load/provider swap | Divergent re-derivation = consequence duplication or loss |
| Player-direction floors (P9.11) | Reserved headroom + refusal/silence always legal | Anti-railroad is a trust invariant, not polish |

## Proof → playable MVP → feature goal

| Family | Proof | Playable MVP | Feature goal | Seam retained | Promotion evidence |
|---|---|---|---|---|---|
| Hand assembly/scoring (P9.3) | one promise served via hand in C2B | small capped hand, plain scoring | tuned weights, dense campaigns | score-input fields | soak measurements via STATE-HYGIENE-EVAL |
| Deferral/expiry (P9.4) | one deferred-then-forced delivery trace | expiry classes live; hook-walk delivery | rich messenger/consequence delivery breadth | expiry class field | soak horizon tuning |
| MotifDeck (P9.5/G9.1) | one motif minted/spent/cooled in soak | deck live, small k, world-local | rich transformation vocabulary; profile-local opt-in | motif schema + budget receipts | callbacks feel earned, not nagging |
| Cadence controller (P9.6, Q9-A) | controller output logged over one soak session | escalate/sustain/pivot/release/ordinary live at chosen posture | campaign-style profiles | posture as versioned control surface | soak dryness/steering evidence |
| Strategy draws (P9.8) | one faction two-step plan trace (C4A/C4C) | single-front draws | multi-front politics | plan schema + reserve commitments | contested-operation corpus |
| Assist posture (Q9-B) | posture flags in C1G digest | reactive affordance help default | tutorial register (later onboarding pass) | per-player posture setting | onboarding playtests |
| Corpus (P9.12) | first two soak traces | MVP trace set | full list incl. adversarial stacks | seeds + receipts + eval harness | P10.12 process |

## Exclusions (owned elsewhere)

Canon/invention authority (W2 G2.1 — closed); action resolution (W7); environmental mutation
(W8); narrator voice/agency laws (DM-CHARTER — living, but its pacing provisional is surfaced
as Q9-A, not edited); digest transport/provider dialects (SEAT-ADAPTER); persistence codec
(W12); presentation (closed W10).

## Ledger reconciliation (proposed)

Refines "Discovery and DM obligations" (hand/scheduling MVP obligations now concrete) and
"SceneFact promotion and private deliberation" (motif budgets + deliberation stay beneath it);
adds one row: **DM strategic hand, motif memory, and cadence** (MVP obligation: card registry +
capped hand + digest schema + expiry classes + floors; proof C2B/C4C + soak traces; gate C4C;
goal: tuned dense-campaign scheduling + MotifDeck breadth; trigger: soak/eval evidence). Ledger
edits applied at Wave 9 closure (2026-07-22, record §18.7); the closure's riders bind the
hand floor (never-empty hand) and performance-layer freedom into the MVP obligation.
