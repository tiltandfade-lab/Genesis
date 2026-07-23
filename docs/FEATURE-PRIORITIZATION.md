---
type: build-plan
status: ACTIVE — derived prioritization view (2026-07-23, from the closed twelve-wave program);
  authority stays with the wave records, CLAY-PROOF-LADDER, FEATURE-PROMOTION-LEDGER, and
  canon/MODULE-PHASING. THIS DOCUMENT AUTHORIZES NO BUILD — Q12-B (wave-12 P12.12) is the gate.
created: 2026-07-23
owner: Adam (priority rulings) / Fable (keeps it reconciled with the registries)
related:
  - "[[procedural-dungeon-direction/CLAY-PROOF-LADDER]]"
  - "[[procedural-dungeon-direction/FEATURE-PROMOTION-LEDGER]]"
  - "[[canon/MODULE-PHASING]]"
  - "[[canon/OPEN-QUESTIONS]]"
---

# Genesis — Feature Prioritization (order · prototype · MVP · tests · arrival)

One readable answer to four questions: **what do we build, in what order, how is each level
tested, and when is a feature declared "arrived" at prototype and at MVP.** Everything here
is consolidated from the closed wave records (all twelve waves design-closed 2026-07-22/23),
their phasing audits, and the ledger — with Adam's founder priority woven in: *"the visual
engine hasn't proven itself at all … we will clayroom for a while before moving to the
guard's post"* (wave-11 §19.6). Sources win over this file if they ever disagree.

## 0. How to read this (the arrival law)

Three levels per feature, never blurred (PHASING-FRAMEWORK law):

- **Prototype (proof).** The smallest retained clay fixture that proves the architecture:
  deliberately ugly, deterministic, seeded, one primary risk. Its test is the fixture
  itself — receipts + captures, re-runnable forever.
- **MVP.** The playable obligation: the feature working inside the *integrated slice*, not in
  isolation, at narrow-but-honest breadth.
- **Goal.** The accepted destination, deferred behind a named trigger. Goals are listed here
  only where they shape ordering; the ledger owns the full list.

**Declared ARRIVED at prototype when, all four:**
1. Its retained fixture runs green on a *fresh* deterministic run (seeds + receipts +
   fixed-camera captures archived);
2. It was **personally re-gated** — never a subagent's self-reported green (standing law);
3. A human looked at the actual output (captures/trace), not just the pass count
   (P2.20/P11.8 — aggregate green never suffices);
4. The ledger row flips to **PROVED** with evidence attached (ledger law 4).

**Declared ARRIVED at MVP when, all five:**
1. The playable obligation passes **in the integrated slice** (the same play session that
   exercises its neighbors), at its MVP gate pass;
2. Every **BLOCK** gate green (truth, recovery, legality, privacy-leak — P12.9 matrix);
   **WARN** gates (polish, beauty, perf-targets) recorded, not hidden;
3. Batch features: the mandatory eyes-on sample review happened (P11.8);
4. Adam has *played or eyeballed* the felt-value milestone it belongs to (his taste ruling is
   the cap on every arrival);
5. The ledger row flips to **MVP** with the integrated-trace evidence.

Nothing below carries dates: order is dependency order; pace is Adam's. **Stage 0 and Q12-B
precede everything.**

## 1. The order at a glance

| Stage | What | Felt milestone |
|---:|---|---|
| 0 | Recovery package (the gate before any code) | — |
| 1 | The connected spine, one clay room: rules kernel → battle board → DM seat → save/recovery (+ workbench floor) | **The C1D room fight** |
| 2 | Visual proof (Adam's priority): geometry pass → texture pass → furnishing → **golden site 1 "the guard's post"** rolling procedurally | The guard's post, decent + unbroken |
| 3 | The world changes: breakable door → materials → propagation → atomic topology | Fire actually spreads; the door stays broken |
| 4 | Multi-room story: card hand, promises, handoffs | **The C2D site handoff** |
| 5 | Modules, separately gated: travel · town · party separation · secrets | **The C2M town loop** |
| 6 | Site & faction simulation: strategy draws, motif deck, stealth, crisis ledger | A faction executes a plan you can trace |
| 7 | Scale & proof: storage bakeoff, flagship golden session, portfolio growth | The twelve-site road begins |

Workbench tooling (Stage 1's floor) grows **alongside every stage** — it is never its own
blocking stage after the floor exists. The tactical-archetype corpus accumulates from Stage 1
on (one new fight type per uncovered risk).

## 2. Stage 0 — the recovery package (gate, not a feature)

Tagged, verified, LFS-complete recovery point + git bundle + Drive archive (W1 §8.14.1).
**Test:** an actual restore drill into a scratch directory. **Arrived:** the restored tree
opens and runs. This is the first checklist box of Q12-B; nothing else starts before it.

## 3. Stage 1 — the connected spine (one clay room)

The four pre-alpha-critical contract families of W7/W9/W11/W12 land here because retrofit =
rewrite. Order within the stage is the ladder's: C1A → C1B → C1C → C1D, then C1E-C1G
hardening.

| # | Feature | Prototype (test → arrived) | MVP (test → arrived) |
|---:|---|---|---|
| 1 | **Rules & dice kernel** — one ActionIntent/ActionReceipt contract; CheckContract with pre-declared failure licenses; DC reveal-at-commit (W7 P7.5/P7.8) | C1A/C1B seeded roll + intent→receipt fixtures; one licensed-failure trace per family → fixtures green, illegal intents refused | Full SRD action economy through the one contract in the C1D fight; typed + declared inputs land identically → the fight completes with zero prose-committed outcomes |
| 2 | **Spatial truth kernel** — one query brain (reach/path/LOS/cover/fit); no facing (W7 P7.1/P7.2) | Golden ray/path fixtures on the clay room (C1B) → every consumer (UI, enemy AI, digest) returns identical fixture answers | Kernel serves the whole C1D fight (cover grades, elevation, mixed scale) → runtime assert + code sweep prove no consumer computes its own answer |
| 3 | **BattleMat + EngagementLens** — exact-cell board; receipt-driven staging (W10, refined W7) | C1B/C1D render with fixed-camera captures → capture review, every beat receipt-driven | C1E staging breadth (one bespoke family, rest generically truthful) → capture set + Adam's eyes-on pass |
| 4 | **DM seat + turn digest** — provider-neutral seat; digest = hand, valid cast, viewpoint facts, obligations, posture flags; no menus, no coaching (W9 P9.10) | C1G digest fixture consumed by seat *and* fallback → provider-swap test: same facts, same refusals | Seat runs the room fight + one social scene → charter-conformance checks green; transcript review shows no coaching/menu violations |
| 5 | **Save & recovery** — exact save boundary; world tiers (live/test/experimental); chunked receipts, two-phase writes; hand rebuilds from receipts (W12 P12.1/P12.2, F9.1) | C1F save/load/interrupt fixture; crash mid-write → deterministic reconciliation; hand rebuilt identical | The whole slice survives save/remount (C2D gate); migration registry live from schema v1 with its first old-save fixture → remount + expansion fixtures green |
| 6 | **Workbench floor** — permission classes; generated-file edit refusal; preview sandbox; machine-readable diagnostics; Explain panel v0 (W11 pre-alpha four) | Explain over the C1A compile + one receipt chain; edit-refusal + preview-leak checks → all refusals fire | WHY-record teaching ledger + batch sample-review law enforced on the first real batches → one teaching round-trip trace (redline → WHY-record → promoted fixture) |

**Stage-1 arrival (the milestone):** Adam plays the C1D room fight — real rules, real board,
real DM, then saves, quits, reloads, and it is all still true.

## 4. Stage 2 — visual proof (the founder priority)

Runs beside Stage-1 hardening; this is the geometry pass + texture pass Adam named. Clay
first, beauty second, guard's post third.

| # | Feature | Prototype (test → arrived) | MVP (test → arrived) |
|---:|---|---|---|
| 7 | **Room composition** — semantic plan → geometry; real room shapes (C1H) | Composition diagnostics + captures on the clay room → eyes-on pass | Guard's-post composition rolling across seeded procedural configurations → N-seed batch, all legal, sample review + Adam's taste pass |
| 8 | **Trim-sheet materials** — the texture pass (C1I) | One indexed material/motif family on clay geometry → capture review + Mac budget measurement | Guard's post textured; culture arrivals indexed → capture review "looks decent" (Adam's words are the gate) within budget |
| 9 | **Furnishing assemblies** — recipes, density, protected circulation (C1J/C1K) | One guard-room assembly (the ledger's named cell) → assembly compiles with roles/clearances honest | Representative recipes + contrasting density/history on guard's-post variants → no broken circulation across seeds; eyes-on |

**Stage-2 arrival (the milestone, Adam's own words):** *golden site 1 — the guard's post —
"looking decent … and roll[ing] in various procedural configurations and still not broken."*
Declared by a seeded batch + sample review + Adam's taste pass. This is also where the
visual engine graduates from "unproven organ" to proven.

## 5. Stage 3 — the world changes (mutation spine)

| # | Feature | Prototype (test → arrived) | MVP (test → arrived) |
|---:|---|---|---|
| 10 | **The breakable door** — MutationOp registry, DMG-sourced material profiles, condition states, debris (F8.1) | The F8.1 pass: one wood door + one stone column, action → op → profile → states → map delta → debris → save/remount → honest refusal on an unregistered target → full-spine trace green | Registry + profiles across supported noun families (C2C gate) → representative interactions in the integrated slice; refusals stay honest |
| 11 | **Propagation & atomic topology** — room-graph fronts (fire/smoke/flood/alarm/collapse), cell-resolution when mounted, heated-metal state; all-or-nothing topology transactions (P8.3/P8.4) | One fire front, two rooms, one barrier (C2C); one collapse-with-occupants transaction → propagation + occupant-resolution fixtures green | Fire/smoke/flood/alarm/collapse live on supported graphs, capacity-capped; offscreen catch-up + crisis threshold (C3B) → cold-interval fixture w/ one crisis-line breach; save/remount of every family |

## 6. Stage 4 — multi-room story

| # | Feature | Prototype (test → arrived) | MVP (test → arrived) |
|---:|---|---|---|
| 12 | **The DM's hand** — card registry (no ownerless card), hand floor (never empty), expiry classes ("no cold leads"), player-direction floors (W9) | C2B: one promise deferred, pressured, then served through the hand → trace green; hand never empty in fixture | Cadence controller at the forward-leaning posture + full expiry/floor behavior (C4C + soaks) → soak traces green AND the four pitfalls measured: steered-feel, nagging, dryness, simultaneity; digest A/B when ready |
| 13 | **Site handoff & compaction at scale** — active/site/cold projections, promotion, remount (C2A-C2D) | Ladder fixtures per pass → deterministic handoff traces | **The C2D milestone:** leave a mutated site, come back, everything true (or owner-changed) → integrated remount trace + Adam plays it |

## 7. Stage 5 — modules (each separately gated, any order after Stage 4)

Travel (C2H-C2L) · **Town (C2M — the third felt milestone)** · Party separation (C2G/C2N) ·
Secrets (C2O). Each module: **prototype** = its ladder pass green; **MVP** = its loop playable
in the integrated world; **arrived** = pass + a real play session touching it. Ship travel is
*not* here — it is deferred to the expansion window with its prototype→ideal sketch already
written (canon/MODULE-PHASING; "we do want it").

## 8. Stage 6 — site & faction simulation

| # | Feature | Prototype (test → arrived) | MVP (test → arrived) |
|---:|---|---|---|
| 14 | **Enemy tactics at the table** — doctrine/INT-tiered scoring (Q7-A B) | One archetype family fights believably in the retained room (C1D variant) → golden tactic fixtures | Representative bestiary archetypes at the chosen tier → playtest fairness/comprehension evidence |
| 15 | **Stealth & detection** — passive floor, search-as-action, alarm states (F7.1) | Stealth-open variant of C1D → detection-state receipts green | Detection wired to alarm clocks across the slice → suspicion *feel* calibrated in playtest |
| 16 | **Faction strategy draws** — plans only from real goals/knowledge/resources (P9.8) | One faction executes a two-step plan in a soak (C4A/C4C) → plan trace fully receipt-sourced | Single-front draws live in campaign play → contested-operation traces |
| 17 | **Motif/callback deck** — budgets, cooldowns, privacy (P9.5) | One motif minted → spent → cooled in a soak → lifecycle trace green | Deck live with small k, world-local, consent-gated → soak evidence callbacks feel earned, never nagging |
| 18 | **Style & cooperation receipts** — spend-side only (P9.9/W7 P7.9) | One setup/payoff trace (C1D) → receipt minted + spent through Inspiration | Receipts + sinks live; "cool" measurement instrument defined before any richer rewards (Adam's rider) |

## 9. Stage 7 — scale & proof

| # | Feature | Prototype (test → arrived) | MVP (test → arrived) |
|---:|---|---|---|
| 19 | **Storage bakeoff** — codec/chunking/compression measured, not debated (F12.1) | Synthetic long-world fixture (10k/1k/100 records) on the Mac, beside C3B → vetoes then comparison table | Winner pinned by ADR; chunked persistence live → measurements attached to the ADR |
| 20 | **Flagship golden session** — the IP-clean long cooperative crisis with continuity assertions (G12.2 + P11.7) | First bounded trace with assertions (turn-N custody, callback legality) → drift fails loudly, incl. narration-only drift | The trace grows with the soak corpus into the standing regression spine → every later change runs against it |
| 21 | **Portfolio growth** — toward the twelve golden sites + eight adversarial traces (C5) | Each new site admitted only for an uncovered risk → admission record | Accumulated portfolio + P10.12 evidence process → release-tray selection stays Adam's reserved call |

## 10. Later features — parked with named triggers (never hidden cuts)

| Feature | Level it waits at | Trigger |
|---|---|---|
| Player-rolled physical dice mode (F7.3) | Seam only (dice-source field on roll receipts, from Stage 1) | Adam schedules post-MVP — "it's fun to roll your own dice" |
| DM rule-bend-and-reconcile (F7.2) | Rulings-as-receipts seam only | Proof the DM "reliably makes sound decisions outside of the bounds and knows how to reconcile" |
| Cozy/peaceful register (F9.3) | Campaign-profile surface (built with the cadence controller) | Research window (peace-forward TTRPG survey) + Adam's word |
| Harness-off DM experiments | Instrument, dev-side only | Any time after Stage 4 soaks exist; findings reopen laws explicitly, never silently |
| Tutorial DM voice (Q9-B option C) | Tracked register | A future onboarding pass |
| Ship travel | Prototype→ideal sketch written (MODULE-PHASING) | Expansion window; promotion act = Adam's SHIP-TRAVEL spec review |
| Creator-facing workbench (Q11-A) | Power-class seams retained | Post-MVP product evidence |
| Mod/sharing product | Fences built, product deferred | First real external-sharing intent or release planning |
| Playable DM seat / multiplayer (F9.2) | The carded seat itself is the seam | Post-1.0 explicit product decision |
| Second realm — **Lost World leaning** | Content planning | Expansion planning; criterion = asset-transition economics (wave-12 §20.7) |
| Clay-pass consolidated enumeration (F8.2) | Chore, not feature | The Wave 12 gate window (or Adam's earlier word) |

## 11. Bookkeeping (so "arrived" is never vibes)

Every declaration writes: the ledger row flip (MAPPED → PROVED → MVP) with evidence links ·
the fixture into the retained corpus (never discarded) · a CHANGELOG line. The gate matrix
(P12.9) types every gate BLOCK or WARN before the pass runs, so polish can never block truth
work and truth can never be warned away. Instruments, by name: retained clay fixtures
(seeds/receipts/captures) · the jsdom CI sweep · STATE-HYGIENE-EVAL · soak sessions · the
batch + eyes-on-sample law · the bakeoff fixture · bridge-rig playtests · Adam's taste pass,
which caps everything.
