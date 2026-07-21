---
type: design-study
status: REVIEW
wave: 2
created: 2026-07-21
updated: 2026-07-21
---

# Wave 2 Prototype/MVP Phasing Audit

This first-pass audit separates the minimum persistent simulation contract from the richer ecology and Gemini-DM
orchestration goals accepted in closed Wave 2. The cut remains under review. Terms follow the global
[phasing framework](../PHASING-FRAMEWORK.md).

## Pre-alpha-critical foundation

| Decision family | Minimum critical form | Why it cannot wait |
|---|---|---|
| Canonical ownership across activation tiers | Every actor, unique item, group, stock, clock, and committed fact has one owner across active/site/cold forms; handoffs are atomic and idempotent | Duplicate citizens/items or replayed changes would invalidate a persistent world. |
| Rooted versus provisional identity | Candidate actors remain provisional until a legal contact, evidence, action, relationship, or other rooting event commits identity | Gemini cannot be allowed to turn every private candidate into hidden canon. |
| Consequential custody and conservation | Unique items have exact identity/location/custody; fungible resources use conserved bounded envelopes | Later simulation cannot repair already duplicated or vanished consequential property. |
| Player-caused operational change | Validated typed receipts alter obligations, clocks, stocks, groups, topology, or use; prose cannot mutate them directly | The world must remember what the player did before simulation depth matters. |
| Truth and proposal authority | Engine-owned canon validates Gemini proposals and private deliberation; rejected candidates leave no canonical residue | This is the boundary between AI narration and a legal persistent game. |
| Versioned persistence basics | Stored semantic results, owner/version fields, idempotent event ids, and a safe load/reconcile boundary for the implemented slice | A later schema cannot reliably infer omitted historical authority. |
| Honest failure | Impossible or under-specified transitions stop, degrade conservatively, or surface diagnostics | Silent invention would undermine every richer system built later. |

## Proof/MVP scaffold -> feature goal

The `Pre-alpha form` column means playable MVP. A smaller proof fixture may precede it, but the MVP must make
persistence and offscreen operation **felt**, not merely store fields that no session exercises.

| Decision family | Pre-alpha form | Accepted feature goal | Seam retained now | Promotion trigger |
|---|---|---|---|---|
| Site simulation | A few named operating states, owned clocks/due events, deterministic lazy catch-up, and at least one leave/return cycle whose changed operation is visible to the player | Typed multi-family site simulation with richer dependencies and state transitions | State/clock owner, last-advanced boundary, transition receipt, idempotent catch-up | A second site family or longer absence exposes hand-authored transition gaps. |
| Roster quantities and ecology | Bounded integer summaries for the few roles and needs used by the MVP site configurations | Demand equations, renewal/depletion, staffing pressure, and broader ecological flows | Typed quantity, source/sink, cadence, and capacity fields | Resource pressure is not creating meaningful different decisions or produces contradictions. |
| NPC casting | Small pooled role cards; root only the candidate actually contacted or causally established | Rich reserve pools, reusable casting precedents, relationships, and identity management | Provisional candidate id, role eligibility, rooting cause, canonical actor id | Repeated encounters feel samey or Gemini cannot preserve a growing social cast. |
| Multiple groups | At least two groups may own, occupy, contest, aid, or oppose within the small typed relation set, and one legal relationship/control change is exercised | Contested operation, dynamic politics, and multi-domain occupation | Stable group ids and typed place/resource relationships | A vertical slice requires three-way conflict or richer changing institutional control. |
| External dependencies | At least one exercised typed boundary contract for an imported/exported obligation; no continuously simulated region | Regional reconciliation and deeper dependency networks | Contract id, provider/consumer, cadence, failure effect | Offsite consequences repeatedly require ad hoc invention. |
| Resources | A short named stock catalog with bounded cadence and explicit owner | Broad material, labor, access, and renewal/depletion ecology | Resource type/version and conserved mutation receipts | The initial catalog cannot distinguish site operation or player interventions. |
| CrisisChain | A minimal acyclic graph over existing clocks/actions with at least one bounded branch and convergence | Branching multi-actor orchestration without duplicate simulation or action economy | Node ids, legal transitions, owner, terminal state, links to canonical actions | The DM needs parallel, nested, or longer conditional crises that the small graph cannot express. |
| SceneFact promotion | A small approved set of typed candidate-to-canon paths covering every actor, item, relationship, discovery, and operational candidate family the MVP actually uses; unsupported families remain prohibited | Reusable certified precedents and shared semantic recipes | Candidate provenance, validator, promotion cause, resulting canonical id | Repeated valid inventions cannot be represented without one-off code/content. |
| Private DM deliberation | Bounded compare/discard scratchpad with no direct canon writes | Tiered candidate search, A/B comparison, and richer planning support | Private/canonical namespace separation and explicit commit API | Model quality or long-horizon orchestration suffers despite adequate context. |
| Critical magnitude breadth | The full accepted magnitude ladder, including rare Mythic/Worldbreaker results, for the representative mechanics present in pre-alpha | Full outcome-profile breadth across every supported domain and interaction | Magnitude id, resolved semantic effects, proof that prose follows stored result | The vertical slice adds systems whose extreme outcomes lack a certified profile. |
| Proof corpus breadth | A small deterministic ownership/custody/catch-up/AI-authority corpus for the vertical slice | Broad long-session matrices, property tests, and adversarial model cases | Golden event traces and stable fixtures from day one | Each added family expands the matrix; save/schema milestones require migration cases. |

## Recommended Wave 2 pre-alpha slice

Keep simulation narrow but durable: a small actor pool, a few roles/stocks/clocks, exact unique-item custody, typed
player-caused changes, cold catch-up, and a hard engine/Gemini authority boundary. The playable MVP exercises an
active-to-cold-to-active return with a visible operational change; roots at least one provisional NPC; changes one
group relationship/control fact; exercises one external boundary contract; runs one bounded CrisisChain fork; and
certifies rare magnitude outcomes for its representative mechanics. It does not need to continuously simulate
individuals, model a region, support a broad resource catalog, or run a large multi-actor crisis graph. Sleep/return,
save/load, candidate rejection, and item transfer still cannot duplicate or erase canon.
