---
type: design-study
status: CLOSED
wave: 2
part: 6
legacy_sections: "10.SWEEP-10.SWEEP.8"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 2 — Sweep and Closure

<!-- BEGIN VERBATIM MIGRATION: original lines 14429-15645 -->

### 10.SWEEP Wave 2 full-question rapid sweep - awaiting Adam's batch dispositions

Adam asks to see the whole active wave at once with concise recommendations so obvious agreements can be accepted
in a batch and attention can concentrate on genuine disagreements. This is a discussion accelerator, not a weaker
closure rule. A batch acceptance locks the stated baseline; it does not erase a material consequence discovered by
the follow-up audit. Flagged questions receive the full plain-English/options/examples/research/cost treatment until
their follow-ups are exhausted. Silence accepts nothing.

Suggested response form:

```text
ACCEPT: G2.1-CERT, P2.12-P2.15, P2.17-P2.20
DEEP DIVE: G2.2, P2.16
AMEND: P2.14 - <change>
```

`ACCEPT REMAINING DEFAULTS` is also valid, but the ensuing consequence audit may still surface a real follow-up.

#### Research shorthand used in the sweep

| Tag | Paper contribution used as a filter |
|---|---|
| `T09` | Tutenel et al. 2009 - class/rule plans, hierarchical subproblems, hard placement legality |
| `T10` | Tutenel et al. 2010 - high-level semantic intent, attributes/relationships/services compiled into procedures |
| `Y11` | Yu et al. 2011 - distinct weighted functional/spatial relations and learned priors |
| `M11` | Merrell et al. 2011 - mixed initiative: preserve fixed meaningful choices, suggest legal alternatives around them |
| `H12` | Horswill/Foged 2012 - bounded graph summaries and global path/playability constraints |
| `N18` | Nepozitek/Gemrot 2018 - preserve the designer connectivity graph while realizing geometry with constraints/backtracking |
| `G19` | Green et al. 2019 - separate architecture from furnishing; combinations of stages materially change play |
| `H19` | Henderson et al. 2019 - flexible constraint composition has multiplicative runtime/edit costs |
| `W20` | Whitehead 2020 - declarative hard constraints, explicit satisfiability, honest unsatisfied results |

The papers support representation and solving techniques; none of them answers Genesis's narrative, AI-DM,
world-persistence, item-economy, or certification policy by itself.

#### Settled O2.1-O2.11 - confirmation sweep, not automatic reopening

| ID | Question already answered | Accepted baseline | Research filter / reopen only if |
|---|---|---|---|
| `O2.1` | What does the roster allocate before rooms? | Allocate typed functional obligations/capabilities, scale, operating demand, protected random/Spice capacity, and possible realizations before choosing room count. | `T09/T10/G19`; reopen only if later tray/compiler rules cannot consume the program. |
| `O2.2` | Which systems deserve light simulation? | Simulate causal, player-facing stocks/flows/conditions/clocks; aggregate descriptive multiplicity and cold state through deterministic summaries. | `H12/H19`; reopen if an accepted player action cannot be resolved honestly from the sparse owners. |
| `O2.3` | When does an obligation become a room? | Give it a room when independent access, persistent spatial work, capacity, privacy/security, or repeated play requires one; otherwise realize it as a zone, assembly, embedded feature, prop, route, relationship, or external dependency. | `T09/T10`; reopen if a realization routinely destroys function or produces room inflation. |
| `O2.4` | How do repeats vary? | Use correlated families: shared institutional grammar plus per-instance layout, condition, use, ownership, evidence, and exception—not independent rerolls or clones. | `Y11/M11/G19`; reopen if variation erases readable identity or becomes cosmetic only. |
| `O2.5` | How is functional/Spice capacity protected? | Budget functional, spatial, embedded, and coordinated Spice separately across site/room/assembly; high Spice needs causal authority and cannot consume core operating obligations. | `T10/G19`; reopen if budgets cannot prevent either sterile normality or incoherent anomaly stacking. |
| `O2.6` | How does demand become quantity? | Capacity, population, cadence, supply model, risk, and reserve policy derive bounded exact quantities; no prose-only abundance or arbitrary precision. | `H12/H19`; reopen if quantities cannot drive play without commodity-sim overhead. |
| `O2.7` | How does population become present people? | Keep bounded population/group pools and roles; schedules/state select active presence; player contact/importance promotes stable individuals through proper rollers rather than bespoke-fit invention. | `T09/H12`; reopen on identity loss, crowd cost, or insufficient social handles. |
| `O2.8` | How do multiple populations share a site? | Groups own claims, roles, territory, access, resources, attitudes, knowledge, and conflicts over one shared site model; do not generate parallel incompatible dungeons. | `T10/N18`; reopen if overlap cannot express contest, coexistence, infiltration, or layered control. |
| `O2.9` | How do operating states differ? | Operating, strained, dormant, failing, and transformed states alter obligation fulfillment, staffing, flow, maintenance, evidence, danger, and recovery—not merely prose tone. | `T10/H12`; reopen if state does not create different player handles. |
| `O2.10` | How does time affect a site? | Use explicit cadences, events, clocks, active updates, and deterministic lazy catch-up; never continuously tick every noun or erase due consequences while cold. | `H12/H19`; reopen on long-time jumps, schedule contradictions, or unacceptable latency. |
| `O2.11` | How do flows become player handles? | Project flows through sources, routes, storage, users, waste, evidence, failure points, leverage, and consequences; avoid full commodity markets unless another owner explicitly needs them. | `T10/H12`; reopen if players cannot investigate, exploit, protect, or disrupt operation. |

#### Active additive decisions

| ID | Plain-English question | Baseline recommendation | Cost/risk and likely deep-dive trigger |
|---|---|---|---|
| `G2.1-CERT` | How quickly may a successful DM-invented mechanic become reusable outside its originating world? | Accept the best-case semantic platform and P0-P4 lifecycle. Allow fully automated certification earlier for **profile-local P3**, where nothing leaves the player's device/profile. Keep **product/shared P3** behind stronger provenance, consent/privacy, adversarial, migration, rollback, and initially human/hybrid review; graduate individual low-risk domains to automation only after executable gates earn trust. | High platform cost, but off the live-turn path. Deep-dive if profile-local cross-world learning itself feels wrong, product sharing should never occur, or the desired end state is immediate no-human global promotion. `T10/M11/W20` support intent/constraint boundaries, not promotion policy. |
| `G2.1-CLOSE` | Is SceneFactGraph promotion sufficiently settled to stop expanding this branch? | After disposing `G2.1-CERT`, close G2.1's design baseline: typed lazy promotion, T0-T3, non-erasing memory, selective callback hand, typed relation growth, creative `SYNTHESIZE`, C0-C4 envelopes, valence symmetry, causal hostile invention, graduated counters, transactional compilation, P0-P4 learning, and best-case/production-slice separation. Assign exact schemas, thresholds, weights, and certification metrics to later specs/workbench/implementation planning. | Reopen only for a contradiction, a missing authority owner, or a player-facing behavior not covered—not to continue speculative implementation design. |
| `G2.2` | How should several actors, props, hazards, clocks, and actions cooperate in one crisis without becoming one progress bar? | Make `CrisisChain` a thin orchestration graph over existing owners. It stores objective/stakes, phase or front topology, eligible contribution types, actor roles, clocks, dependencies, branch/terminal conditions, and receipts; it references roster/props/conditions/resources rather than copying them. Contributions resolve through ordinary actions/checks/events. Failure changes concrete state or branches the crisis; it never merely subtracts abstract progress. The DM authors presentation and legal connective meaning. | Medium-high architecture and UX cost. Likely deep dive: graph versus phase structure, simultaneous contribution credit, partial success/failure, initiative integration, offscreen actors, UI, and when a crisis deserves this owner. `T09/T10/H12/N18/W20`. |

#### Prospective P2.12-P2.20 sweep

| ID | Plain-English question | Baseline recommendation | Cost/risk and likely deep-dive trigger |
|---|---|---|---|
| `P2.12` | How do active rooms, site summaries, and cold state exchange truth? | Every fact has one canonical owner and explicit projections. Activate a bounded slice with versioned handoff receipts; aggregate only information the site owner can preserve; catch up from elapsed events/cadences deterministically; reconcile atomically and idempotently so resources, actors, threats, and promises are never double-counted. | Medium architecture; critical risks are ownership ambiguity, stale reactivation, and long catch-up tails. `T09/H12/H19/W20`. |
| `P2.13` | How does a site depend on roads, towns, factions, trade, migration, portals, and raids without simulating the whole region? | Use typed boundary edges/contracts: source/destination, commodity/service/population class, capacity, cadence, travel/risk, owner, current disruption, reserve, evidence, and next due delivery. Neighbor systems provide summaries; site resolution expands a shipment/group/event only when contacted or consequential. | Medium content/integration cost. Deep dive if regional politics/economy needs more than edge contracts or if exterior routes must be spatially exact early. `H12/N18/G19`. |
| `P2.14` | What renews, spoils, reproduces, migrates, transforms, or permanently runs out? | Give consequential stocks a typed renewal/depletion law with source, capacity, cadence, conditions, sinks, evidence, and terminal floor. Use deterministic lazy catch-up and never spontaneous restock. Aggregate insignificant multiplicity; promote exact instances only on contact/importance. | Medium authoring and balance cost; danger is runaway feedback or fake precision. Deep dive on ecology reproduction, crafting chains, or seasonal systems. `T10/H12/H19`. |
| `P2.15` | How do hunger, crowding, morale, labor, habitat, doctrine, and predation create site change? | Convert pressure summaries into bounded clocks/threshold events owned by populations/ecology/factions. They can move pools, alter roles/claims, cause conflict, dormancy, adaptation, flight, or collapse through causal receipts. Independent actors still come from population/roster owners; pressure cannot invent a perfectly useful NPC. | Medium-high content/interaction cost. Deep dive if emergent ecology needs continuous agents or if thresholds feel too board-game-like. `T09/H12/H19`. |
| `P2.16` | How do loot, supplies, crafting outputs, containers, ownership, and player pickup stay surprising but real? | Use one custody chain: site holdings/process outputs -> typed reserves/containers/latent committed contents -> discovered exact instances -> claim/transfer events. Catalog availability never creates world inventory. Generation may commit hidden contents or a bounded latent roll before discovery; player knowledge stays separate. Pricing/rarity and operational use share existing item/economy owners. | High cross-system cost and likely deep dive: when hidden contents must be rolled, anti-save-scumming, theft/faction response, crafting recipes, treasure surprise, and DM-authored rewards. `T10/H12/W20`; papers do not solve loot economy. |
| `P2.17` | How do sabotage, repair, liberation, occupation, theft, gifts, contamination, and route closure change operation? | Resolve typed operations against the site program: affected obligation/flow/group/stock/state, magnitude, duration, evidence, dependencies, recovery path, and downstream clocks. Wave 2 owns operating consequences; Wave 8 later owns detailed physical propagation/topology. Commit changes permanently and use lazy catch-up. | Medium-high adapter cost. Deep dive on site capture/governance, partial repair, competing operators, or C3-C4 reach. `T10/H12/G19`. |
| `P2.18` | What happens when purpose, inhabitants, resources, space, and history cannot all fit? | Classify hard invariants, soft preferences, degradable obligations, and crisis-generating failures. Use ordered backtracking/relaxation; if no legal result survives, emit an explicit unsatisfied diagnostic or intentionally failing site state. Never hide contradiction through convenient prose or deleted obligations. | Medium solver/authoring cost; deep dive on the exact relaxation order or whether some impossible sites should generate as playable catastrophes. `T09/H19/W20`. |
| `P2.19` | What should the DM and player actually see about site operation? | DM receives a bounded active projection: current owners/groups, due changes, relevant stocks/flows, legal handles, active/latent facts, risks, and reasons, with filtered peeks available. Players receive sensory evidence, NPC behavior, maps/records, visible shortages/abundance, and discoverable causal tells—not hidden dashboards or unexplained numbers. Wave 10 consumes this contract in the shared SceneTray. | Medium UI/context cost; deep dive on exact information tiers, player-facing meters, or DM context budgets. `T10/M11`. |
| `P2.20` | What proves Wave 2 works before it closes? | Require a matrix across site family/size, supply model, operating state, group conflict, Spice, resource stress, intervention, long cold interval, activation boundary, and dense active slice. Evidence includes deterministic golden traces, property/constraint tests, unsatisfied cases, performance tails, DM projections, player-facing tells, and representative dungeon/town/wilderness examples. | Medium-high QA design cost now, large risk reduction later. Deep dive on quantitative budgets and corpus size may defer to Wave 11/12, but representative cases and pass/fail semantics must be settled here. All nine papers inform this gate. |

#### Wave 2 batch-closure audit after dispositions

After Adam returns batch dispositions:

1. record each accepted baseline as a ruling without rewriting its original/prospective question;
2. deep-dive only flagged ids and their material follow-ups;
3. run a contradiction pass across Wave 1, O2.1-O2.11, G2.1/G2.2, P2.12-P2.20, the shared SceneTray handoff,
   the semantic invention system, and the research constraints;
4. name every exact schema/weight/threshold/content table/implementation concern deliberately deferred to a later
   owner rather than treating it as an unanswered design principle;
5. present one Wave 2 closure summary and require Adam's explicit agreement;
6. only then open promoted Wave 10.

### 10.SWEEP.1 Batch dispositions and deep dives - P2.16, P2.18, and P2.20 open

Adam responds to the first rapid sweep with selective acceptance and three requests for explanation. Silence on
other ids is not acceptance.

#### Recorded dispositions

- **G2.2 - mechanical direction provisionally accepted; UI deferred.** The thin orchestration-graph baseline may
  guide the eventual CrisisChain discussion, but its player-facing UI must not be chosen before the promoted shared
  SceneTray/graphics-engine revision. G2.2 owns objective/stakes/topology/contributions/receipts and the projection
  requirements; promoted Wave 10 P10.9-P10.10 owns how a crisis appears and is controlled in the release tray.
- **P2.13 - accepted for now.** The sketched regional politics/economy simulation remains controlling; typed
  boundary edges/contracts are sufficient for site dependencies unless later evidence shows a missing regional
  owner. Do not expand Wave 2 into a second regional simulator.
- **P2.14 - accepted.** Consequential stocks receive renewal/depletion rules with source, capacity, cadence,
  conditions, sinks, evidence, and terminal floor; no spontaneous restocking.
- **P2.15 - accepted with explicit expansion deferral.** Use population/ecology pressure summaries, clocks, and
  threshold events rather than continuously simulating individuals. Deeper continuous ecology is a far-future
  expansion candidate only after the bounded system proves itself; it is not a current closure or build blocker.
- **P2.17 - accepted.** Typed player-caused changes update the site's obligations, flows, groups, stocks, and
  operating state; Wave 8 later owns detailed physical/topological propagation.
- **P2.19 - accepted and sharpened.** The ongoing simulation exists for engine truth and the DM's bounded
  projection. Players should not manage statistical dashboards. They understand the world through DM description,
  sensory evidence, NPC behavior, records/maps, visible abundance/shortage/failure, and actionable handles. Any
  later UI supports those diegetic interactions rather than exposing the simulator as a management screen.
- **P2.16 - OPEN:** Adam does not yet understand the proposed holdings/reserve/custody solution and requests a
  plain explanation.
- **P2.18 - OPEN:** the constraint terminology was not understandable and must be restated in ordinary language.
- **P2.20 - OPEN:** Adam requests a more detailed acceptance plan.
- **G2.1-CERT, G2.1-CLOSE, and P2.12 remain pending** because Adam did not disposition them in this batch.

#### P2.16 deep dive - when does loot become an exact item?

##### Plain-English problem

Genesis needs treasure and supplies to be both surprising and real. Three bad outcomes must be avoided:

1. generating every spoon, arrow, bottle, sack, and drawer as an exact saved object when the site is created;
2. waiting until the player opens a container, then inventing whatever would be convenient or dramatic at that
   moment (“quantum loot”);
3. assuming that because an item exists in the SRD/custom catalog, this dungeon, shop, enemy, or chest owns one.

The recommendation is **commit the available kind/amount/source early, resolve exact interchangeable instances
late**. Important unique items are committed exactly early; ordinary fungible supplies can remain a bounded reserve
until someone touches, uses, steals, equips, or discovers them.

##### Options

**Option A - eager exact inventory.** At site creation, roll and save the exact contents of every container,
storeroom, rack, corpse, and pocket. This is maximally deterministic but creates enormous state/content work and
spends generation time on objects the player may never approach.

**Option B - unconstrained discovery-time loot.** Roll or let the DM invent contents only when opened. This is
cheap, but unless an earlier envelope constrains the result it allows the world to adapt its loot to current player
need, repeated reloads, or dramatic convenience.

**Option C - committed holding/envelope, late exact instantiation (recommended).** The site first commits what its
operation and treasure budget actually support. A container/location binds to some part of that holding before
discovery. Exact common instances may be deterministically resolved later from the committed envelope/seed. Unique,
plot-bearing, key/lock, magic, relationship, and otherwise consequential items are committed exactly before reveal.

The custody chain is:

```text
site holding or process output
  -> bounded reserve: kind, amount/value, quality, owner, source, allowed item family
  -> container/location/actor allocation committed before reveal
  -> deterministic exact resolution when exact identity matters
  -> stable item instances when discovered/equipped/used/claimed
  -> custody/quantity/condition changes remove the same value from the prior owner
```

##### Concrete examples

**Fortress weapon rack:** the site has already committed seven shabby garrison-weapon equivalents because its
staffing and armory support them. One rack owns four of those equivalents. When the player searches it, the seeded
envelope may resolve two spears, a light crossbow, and bolts. Reloading does not change them. If guards armed
themselves first, the rack reserve shrank and those exact equipped instances now belong to the guards; nothing is
duplicated.

**Monastery infirmary:** operation commits six ordinary medicine uses plus herb ingredients. That does not entitle
the room to six magic healing potions. A potion appears only if a treasure/reward/crafting source separately
licensed it. Using two medicine doses while the room is cold reduces the reserve; later discovery sees four.

**Dragon hoard:** the hoard's value/rarity budget, major valuables, key/plot objects, and magic items are committed
before discovery because exact identity affects power, callbacks, theft, faction knowledge, and save-scumming.
Individual coins or interchangeable gems may remain aggregated until counted or transferred.

**Turtle comms:** these never arise because “communication item” exists in a catalog. They are synthesized from an
earned C2 relationship/reward envelope, committed as exact linked instances, then enter the same custody chain.

##### Cost and research filter

Option C has **medium-high implementation/content cost**: holdings/reserves, deterministic latent seeds, container
binding, exact-instance promotion, item/currency conservation, custody/claim/transfer events, cold-state use, theft
response, and anti-duplication fixtures. It saves large amounts of eager state and preserves surprise. Tutenel's
semantic classes support holding families before exact instances; Horswill supports bounded summaries; Whitehead
supports committing constraints before revealing a solution. The papers do not supply a loot economy or custody
model; that policy is Genesis-specific.

**Recommendation to accept:** Option C, with this threshold: commit unique/plot/key/magic/limited/relationship items
exactly before reveal; commit ordinary fungible supplies as owned bounded envelopes and instantiate exact copies
only when interaction requires them. Every container allocation is fixed before the player resolves its contents.

#### P2.18 deep dive - what if the generated site cannot possibly work as requested?

##### Plain-English problem

Sometimes the generator's accepted facts do not fit together:

- forty soldiers are assigned to six tiny rooms with no external camp or supply;
- a full-sized dragon supposedly lives behind corridors it cannot traverse;
- an “operating, self-sustaining monastery” has no water source or external supply;
- a prison has cells but no lawful way for guards, food, waste, or prisoners to move;
- a forge is required to operate but has no fuel, ventilation, workspace, or external service.

Genesis must decide what may change, what becomes an intentional crisis, and when it must admit that generation
failed. It cannot patch the contradiction with a sentence claiming everything somehow works.

##### Options

**Option A - always force a fit.** Reduce, move, externalize, or reinterpret whatever is necessary until a site is
produced. This rarely fails generation, but it silently changes canon and makes rules unreliable.

**Option B - reject every mismatch.** If any requested feature conflicts, discard the site and reroll. This keeps
results clean but throws away interesting strained/ruined situations and can create long generation tails.

**Option C - ordered preservation, honest failure state, then explicit refusal (recommended).** Preserve the facts
that are truly fixed, try legal alternate layouts/realizations, allow flexible preferences to change, convert a
support shortfall into an explicit strained/failing site only when that state makes causal sense, and refuse the
result if physical/canonical requirements still cannot coexist.

In ordinary words, the order is:

```text
1. Do not change established lore, player-promised facts, original purpose, or other declared hard truth.
2. Try a different room/assembly/layout/route realization.
3. Change preferences that were never promises: exact adjacency, decorative form, optional capacity, etc.
4. Use an allowed external dependency, schedule, crowding condition, or support method if the site model permits it.
5. If the shortfall is interesting and credible, make the site explicitly strained, failing, dormant, or transformed.
6. If it is still physically or canonically impossible, stop and report exactly why instead of inventing an excuse.
```

##### Concrete examples

**Forty soldiers, six rooms:** try bunks, shifts, adjacent camp, external lodging, or reduced active garrison only if
those were flexible/authorized. Otherwise the fortress is explicitly overcrowded and strained, with sleep,
sanitation, morale, and readiness consequences. It cannot be labeled comfortably operating.

**Dragon in a tiny crypt:** a previously established dragon may have a legal guise, external lair, breached access,
or servants if those facts are supported. If none applies, the placement fails. The engine cannot claim the dragon
regularly walks through five-foot corridors.

**Self-sustaining monastery with no water:** add a legal well/cistern/collection process if geometry and substrate
allow it; otherwise change the supply model to external, or mark the monastery failing/abandoned. If “currently
self-sustaining” was established canon and no water solution can exist, reject the generated layout.

##### Cost and research filter

Option C has **medium solver and content cost**: every profile needs fixed versus flexible facts, allowed alternate
realizations, credible degradation/failure states, ordered diagnostics, and negative fixtures. Tutenel supports hard
versus soft rules and backtracking; Henderson warns against piling on late constraints; Whitehead most directly
supports saying “unsatisfied” when declared intent cannot be solved. This is one of the clearest places where the
papers support the recommendation.

**Recommendation to accept:** Option C. Interesting shortages become honest strained/failing sites; physical or
canonical impossibility fails loudly. The engine never fixes contradiction by silently changing established truth.

#### P2.20 deep dive - what evidence is enough to close Wave 2?

##### Plain-English problem

Wave 2 defines a large causal site model. A few attractive generated rooms cannot prove it. An exhaustive Cartesian
test across every purpose, size, state, group, Spice band, resource, intervention, and time interval is also
impossible. Genesis needs a deliberately chosen evidence portfolio that proves representative behavior, important
cross-system transitions, honest failures, and bounded performance.

##### Options

**Option A - prose review plus a few examples.** Cheap and useful for early design, but it misses conservation,
identity, catch-up, constraint, and interaction failures.

**Option B - exhaustive combination matrix.** Theoretically thorough and practically unbounded; it would delay the
project while still failing to judge whether individual sites feel coherent.

**Option C - layered representative corpus (recommended).** Combine named golden sites, adversarial transition
traces, later statistical/property batches, DM/player information reviews, and performance-tail measurement. Hard
truth is executable where possible; coherence and legibility retain human/play review.

##### Recommended minimum Wave 2 design corpus

**Twelve named golden sites** should cover at least:

1. small operating externally supplied guard post;
2. small transient camp or service site;
3. small dormant/abandoned place;
4. medium self-sustaining monastery/commune;
5. medium strained mine/workshop;
6. medium failing prison or institution;
7. medium predatory natural lair;
8. medium infiltrated or layered-control site;
9. large contested fortress with at least two populations;
10. large settlement/urban institution with aggregated cold population;
11. large mixed-scale or dragon-domain site;
12. anomalous, living, or mobile bounded place proving non-institutional ownership.

The set must span Grounded through Mythic where appropriate, every major supply model, operating/strained/dormant/
failing states, single and multiple groups, ordinary and repeated room families, and both internal and external
flows. One site may cover several dimensions, but no dimension may exist only as an unlabeled random sample.

**Eight adversarial transition traces** should explicitly attempt:

1. active room -> site aggregate -> long cold interval -> reactivation without double count;
2. external delivery blocked, delayed, stolen, restored, and evidenced;
3. stock renewal, use, spoilage/depletion, exact-item claim, transfer, and no duplication;
4. population schedule/group conflict promoting stable individuals without identity drift;
5. player sabotage followed by repair, occupation, or operator change;
6. high-Spice exception pressure without loss of core function or illegal scope growth;
7. impossible constraints producing credible failure state or an explicit unsatisfied diagnostic;
8. SceneFact/callback/CrisisChain consumption of an early prop/resource/condition many turns later.

**Three proof layers** then evaluate them:

- **Deterministic/golden:** exact owners, quantities, receipts, transitions, identities, positions where relevant,
  evidence, and outcomes match expected traces across save/load and repeated seeds.
- **Batch/property:** later Wave 11/12 harnesses sample many seeds for obligation coverage, conservation, valid
  dependencies, family variation, no impossible self-locks, bounded active slices, and solve/catch-up latency tails.
- **Human/play readability:** the DM projection explains what matters; player-facing narration/tells expose useful
  handles without dashboards; sites feel distinct, functional, surprising, and causally understandable.

##### Proposed Wave 2 pass semantics

- zero loss/duplication of consequential people, items, resources, obligations, promises, or ownership;
- every hard invariant either passes or produces an explicit expected unsatisfied result;
- every operating model exposes at least one lawful player-facing evidence/interaction handle for consequential
  flows and failures;
- cold-state reactivation is deterministic and preserves all due hard consequences;
- repeated families remain recognizable without cloned instances;
- Spice exceptions retain causal source and do not consume protected core obligations;
- accepted interventions produce persistent operational consequences and recovery paths where applicable;
- DM projections remain bounded and sufficient; player presentation remains diegetic and dashboard-free;
- common-path and worst-tail budget categories are named here, while exact milliseconds/token/instance limits may be
  calibrated in promoted Wave 10 and Waves 11-12 rather than invented without a prototype.

##### Research and cost filter

This corpus is a **high QA-authoring investment with low live-runtime cost**. Horswill motivates executable global
playability/conservation constraints; Green's staged/persona evaluation warns that pipeline combinations matter;
Henderson and Whitehead require solve-tail and unsatisfied-case evidence; Tutenel requires semantic/rule coverage;
Yu/Merrell support judging functional relations and author-perceived quality in addition to raw validity; Nepozitek
supports preservation of the high-level graph across realization. No paper justifies replacing representative human
judgment with aggregate green counts.

**Recommendation to accept:** Option C with twelve golden sites, eight adversarial transition traces, and three
proof layers. Wave 2 locks the scenarios and pass semantics; Waves 10-12 later calibrate renderer, performance,
automation, and final release thresholds against them.

#### Questions now before Adam

1. **P2.16:** accept Option C's split - exact early commitment for unique/plot/key/magic/limited/relationship items;
   bounded owned envelopes with deterministic late instance resolution for ordinary fungible supplies?
2. **P2.18:** accept Option C's ordered preservation - alternate realization, lawful flexible change, credible
   strained/failing state, then loud refusal if physical/canonical truth still cannot coexist?
3. **P2.20:** accept Option C's initial acceptance portfolio - twelve named golden sites, eight adversarial traces,
   and deterministic + batch/property + human/play proof layers?

### 10.SWEEP.2 Rulings - P2.16, P2.18, and P2.20 accepted; final pending sweep

Adam accepts all three deep-dive recommendations:

- **P2.16 - Option C accepted.** Commit exact unique/plot/key/magic/limited/relationship items before reveal.
  Commit ordinary fungible supplies as owned bounded holdings/envelopes, allocate containers/locations before the
  player resolves them, and instantiate exact stable copies deterministically only when interaction requires them.
  Custody and quantity changes conserve the same holding; catalog presence never creates world inventory.
- **P2.18 - Option C accepted.** Preserve hard truth, try lawful alternate realizations, adjust only genuine
  preferences, use allowed external support/schedules/capacity responses, turn credible shortages into explicit
  strained/failing/dormant/transformed state, and refuse the result with a useful diagnostic if physical or
  canonical facts still cannot coexist. No prose patch may pretend an impossible site works.
- **P2.20 - Option C accepted.** Wave 2's initial acceptance portfolio is twelve named golden sites, eight
  adversarial transition traces, and three proof layers: deterministic/golden, batch/property, and human/play
  readability. Wave 2 locks the cases and pass semantics; promoted Wave 10 and Waves 11-12 later calibrate final
  renderer, performance, automation, corpus-scale, and release thresholds.

#### Future-owner assignments

- P2.16's holding/custody truth constrains Wave 5 containers/interactables, the item/economy system, P2.12
  activation/compaction, and Wave 12 persistence/migration. Exact item-family reserve schemas wait for a build spec.
- P2.18's preservation/degradation/refusal order constrains Wave 3's spatial solver, Wave 4 dependency solvability,
  every later domain adapter, and Wave 11 unsatisfied-case fixtures.
- P2.20's golden sites become inherited clay/golden inputs for promoted Wave 10 and Wave 11; Wave 12 owns final
  numeric release gates and build authorization.

#### Final pending Wave 2 sweep

Four baseline dispositions remain before the contradiction/follow-up audit.

##### G2.1-CERT - local learning versus shared product learning

**Recommendation:** profile-local P3 patterns may earn automatic promotion after executable gates because the
recipe and evidence remain on one player's device/profile. Product/shared P3 promotion additionally requires
canon/provenance stripping, opt-in data policy where information leaves the device, privacy/IP checks, stronger
adversarial/migration/rollback evidence, and initially human/hybrid review. Individual low-risk domains may later
graduate to reversible no-human product promotion after the harness proves trustworthy; C3-C4 and new-primitive
cases retain stronger review.

##### G2.1-CLOSE - stop expanding the invention branch

**Recommendation:** after G2.1-CERT is ruled, close G2.1's design baseline. The branch has settled promotion,
memory/callbacks, typed related growth, creative authority, envelopes, hostile symmetry/fairness, item routing,
semantic compilation, failure negotiation, precedents, and best-case production slices. Exact fields, thresholds,
weights, certification metrics, and implementation sequence belong to later specs/Waves 11-12. Reopen only for a
real contradiction or uncovered player-facing authority gap.

##### P2.12 - active room, site summary, and cold state

The same fact must not live as three copies that later disagree. The recommendation is one canonical owner plus
bounded projections and explicit handoffs:

```text
ACTIVE ROOM
  exact currently relevant actors, items, props, conditions, positions, interactions, and due events

SITE AGGREGATE
  group/population summaries, holdings, flows, operating state, inactive rooms, clocks, obligations,
  promoted facts, promises, and consequences

COLD RECORD
  last resolved time/version plus the compact owner state and event/cadence inputs needed for
  deterministic catch-up; not a second approximate world
```

Entering/activating expands only the relevant slice from canonical site/room/roster state and committed seeds; it
does not reroll established facts. Actions write through to the actual owners immediately. Leaving compacts only
safe multiplicity; touched, promised, named, unique, consequential, damaged, transferred, or callback-eligible facts
remain exact. Reactivation applies due events/cadences in legal order and reconciles atomically/idempotently so
people, supplies, threats, and obligations neither duplicate nor vanish.

**Recommendation:** accept this owner/projection/handoff model. Exact storage schemas and performance limits defer
to architecture and Wave 12; the ownership and no-loss/no-duplication laws close here.

##### G2.2-MECH - implementation-neutral CrisisChain closure bundle

The UI remains deferred to promoted Wave 10. The mechanical baseline can still be settled:

- use a CrisisChain only for a sustained multi-actor/multi-system situation where several contributions and state
  changes matter across more than one beat; ordinary checks, combats, and clocks do not automatically become chains;
- represent the crisis as a small directed graph of objectives/fronts/dependencies/terminal states, not one scalar
  progress bar or a copied simulation;
- reference canonical actors, roles, positions, props, resources, conditions, hazards, clocks, and owners; never
  copy them into crisis-owned shadow state;
- ordinary actions/checks/events resolve first, then issue typed contribution/consequence receipts to eligible
  objectives; fictional contribution cannot counterfeit action economy or a die result;
- success, failure, delay, sacrifice, abandonment, and partial resolution change concrete world state, unlock/block
  graph nodes, advance threats, consume resources, move actors, or create obligations rather than merely adding or
  subtracting progress points;
- simultaneous/helping/offscreen contributions require canonical availability, communication, timing, position,
  and resources. Group aggregation is permitted only when individual identity is not consequential;
- the DM authors connective meaning and pacing inside validated outcomes. The engine owns eligibility, rolls,
  clocks, resources, receipts, terminal state, and persistence;
- expose a renderer-neutral projection contract: active objectives/fronts, known stakes/tells, participants,
  available handles, pressures, and recent consequences. Promoted Wave 10 decides whether those appear as tray
  elements, cards, tracks, highlights, narration, or another controlled combination.

**Recommendation:** accept this mechanical bundle and defer all player-facing CrisisChain presentation to promoted
Wave 10. Exact graph size, UI layout, animations, and display density are not Wave 2 blockers.

#### Final batch response requested

```text
ACCEPT: G2.1-CERT, G2.1-CLOSE, P2.12, G2.2-MECH
```

Any id may instead be amended or sent to deep dive. After these dispositions, run the Wave 2 contradiction and
material-follow-up audit; do not declare closure automatically.

### 10.SWEEP.3 Rulings and plain-language G2.1 deep dive

Adam accepts P2.12 and the G2.2 mechanical baseline, while finding the G2.1 certification and closure language too
abstract. Those two questions remain open and are restated here without the P-level shorthand as the primary
explanation.

#### Recorded rulings

- **P2.12 - accepted.** A fact has one canonical owner. Active rooms, site summaries, and cold records are bounded
  projections/handoffs rather than three approximate worlds. Activation never rerolls established truth; safe
  multiplicity may compact; touched/named/unique/damaged/promised/transferred/callback-eligible facts remain exact;
  deterministic catch-up preserves due consequences without duplication or loss.
- **G2.2-MECH - accepted for now.** A CrisisChain is a small directed objective/front/dependency graph over
  existing owners, not a progress bar or copied simulation. Ordinary resolved actions create contribution and
  consequence receipts; outcomes change concrete world state. Exact graph parameters may refine during its owning
  design/spec work. All player-facing UI/presentation remains assigned to promoted Wave 10.

#### G2.1-CERT in plain English - can the game reuse a good rule the DM invented?

##### The real question

Suppose the DM invents the turtle comms during one world, the engine successfully turns them into balanced,
trackable mechanics, and play proves they work. What is allowed to remember and reuse that *mechanical idea*?

There are four increasingly broad scopes:

```text
1. THIS EXACT THING IN THIS WORLD
   The two turtle comms, their holders, history, art, damage, and callbacks remain permanent here.

2. OTHER COPIES OR DESCENDANTS IN THIS WORLD
   An artificer studies them, a faction steals the technique, or a later callback creates a related device.
   Reuse requires an in-world reason; engine knowledge does not give NPCs knowledge.

3. THIS PLAYER'S PRIVATE LOCAL TOOLBOX
   The story-free mechanical pattern may be offered in another world belonging to the same player.
   It stays on that player's device/profile and carries none of the original names, holders, or story.

4. THE OFFICIAL/SHARED GENESIS TOOLBOX
   The story-free pattern becomes available to other players or ships as part of the game/service.
   This is a product rule, not merely one world's canon.
```

Scopes 1 and 2 are already accepted. The unresolved decision is how cautious Genesis should be about scopes 3 and
4.

##### Concrete turtle-comms example

The exact turtle comms never leave their world. In another world, a reusable mechanic might become whispering
coins, paired beetle pins, bone flutes, mirrored badges, or something newly meaningful there. What travels is only
a generic recipe such as:

```text
two linked holders
bounded communication cadence/range
transfer, breakage, interception, and recovery rules
C2 power and counterplay limits
```

The original turtles, shared escape, relationships, names, private jokes, and visuals do not travel.

##### Why a private local toolbox is safer

If an automatically tested recipe enters only this player's local toolbox:

- no world/story data must leave the device;
- a mistake affects only that profile and can be removed or rolled back;
- the player can opt out or delete the pattern;
- Genesis can test whether automatic reuse is useful before operating a shared rules service;
- another player cannot receive a broken, private, infringing, or context-dependent invention.

It still needs mechanical tests, story stripping, versioning, and rollback, but the trust boundary is small.

##### Why an official/shared toolbox needs more caution

Making a recipe available to everyone risks:

- promoting an item that only appeared balanced in one unusual party/world;
- leaking proper nouns, private jokes, user text, personal information, or licensed/copyrighted references;
- spreading an exploit, infinite resource loop, impossible migration, or hostile no-counterplay mechanic;
- flooding the library with near-duplicates and low-quality model improvisations;
- changing other players' games because one model call was persuasive rather than proven.

Early shared promotion therefore needs stronger automated tests plus human/hybrid review and explicit policy/consent
if evidence ever leaves the device. In the best-case future, a narrow low-risk recipe family may earn automatic
shared promotion after its test/rollback system proves reliable. High-impact world-changing rules and genuinely new
mechanical primitives remain more tightly governed.

##### Options without shorthand

**Option A - world only.** Inventions persist and may spread causally inside their world, but never enter a local
cross-world or shared toolbox. Safest and simplest; the system never learns reusable patterns across worlds.

**Option B - private local learning first; official sharing later and more carefully (recommended).** The player's
private local toolbox may automatically accept story-stripped recipes after strong mechanical tests. The
official/shared toolbox initially requires stricter testing, privacy/IP/provenance checks, and human/hybrid review;
automation expands only where it earns trust. Shared learning may remain a later production feature rather than a
launch requirement.

**Option C - automatically share every tested recipe.** Fastest global learning and the strongest no-human ideal,
but one automated test suite becomes the only barrier between a single improvisation and product-wide rules. This
is too risky as the starting posture.

##### Cost and recommendation

Option B has medium cost for a private local library and very high eventual cost for a shared service: recipe
stripping, testing, versioning, deduplication, migrations, consent/privacy/IP rules, rollback, and library quality.
The shared layer can be deferred without shrinking the core in-world invention system.

**Recommendation:** choose Option B. Always preserve exact inventions in their world. Permit causal copying within
that world. Design for an optional private local cross-world toolbox that can learn automatically after tests. Treat
official/shared learning as a later, separately scheduled product capability with stronger safeguards.

#### G2.1-CLOSE in plain English - what exactly are we agreeing to stop discussing here?

##### Closing does not mean building or finishing

Closing G2.1 would mean:

> We have settled the governing rules for how an ordinary scene fact becomes important, persists, creates
> callbacks, and supports DM-authored inventions. We can move on because remaining detail has an explicit later
> owner.

It would **not** mean:

- the system is implemented;
- schemas, thresholds, weights, UI, or performance budgets are finished;
- the best-case platform must ship all at once;
- future evidence is forbidden from reopening the ruling;
- G2.2, the SceneTray, items/containers, workbench, migration, or build order are somehow answered.

##### What G2.1 has actually settled

The proposed closure would lock these principles:

1. incidental facts are promoted lazily when play relies on them, not eagerly simulated forever;
2. promotion has typed stages, owners, evidence, location/state, legal affordances, dependencies, and disposition;
3. moving on never erases consequential canon; cooled facts retain history and viable callback stubs;
4. the DM receives a selective callback hand and may create related throughlines without treating every noun as
   reusable or inventing retroactive evidence;
5. the DM remains genuinely inventive: it may synthesize exact helpful, hostile, or mixed-valence nouns/effects
   inside earned C0-C4 authority;
6. the engine validates mechanics, power, causality, custody, knowledge, persistence, visuals, and callbacks before
   narration; it does not own exclusive ideation;
7. use/adapt/compose/invent decisions preserve semantic intent and reuse established mechanics where honest;
8. impossible proposals negotiate hard versus soft intent, may abstract/defer honestly, and may create only safe
   declarative precedents - never AI-authored executable code;
9. precedents remain exact world canon and widen their reuse only through explicit world and product gates;
10. the best-case platform is documented, while implementation scope is reweighed later against production value,
    schedule, latency, reliability, privacy, and infrastructure.

##### What remains open, and who owns it

| Remaining detail | Later owner |
|---|---|
| Exact SceneFact/receipt fields and storage layout | eventual SceneFact/semantic-compiler spec |
| Exact thresholds, card counts, service horizons, salience weights, and callback budgets | Wave 9 DM cards plus implementation tuning |
| Crisis objective/contribution mechanics | G2.2 and later spec |
| Crisis/invention/player-facing presentation | promoted Wave 10 shared SceneTray |
| Containers, exact loot instances, object interaction | P2.16 ruling plus Wave 5/items spec |
| Declarative recipe editor, diagnostics, corpus, and certification harness | Wave 11 workbench |
| Save migration, recipe versions, privacy/sharing, release gates | Wave 12 |
| Which best-case slice actually ships and when | Wave 12 production/build authorization |

Assigning a detail later is not forgetting it. The master questionnaire carries the obligation and the later wave
must inherit the accepted G2.1 constraints.

##### Options without shorthand

**Option A - keep G2.1 open until schemas, UI, tests, performance numbers, and build schedule are all specified.**
This sounds thorough but would swallow Waves 5, 9-12 and recreate the exact “lost the main renderer plot” concern.

**Option B - close the governing design now, with explicit assignments and a reopen rule (recommended).** Finish
the certification choice, run the contradiction/material-follow-up audit, then close G2.1 if no uncovered authority
gap remains. Later waves specify their own pieces without asking Adam to re-decide the principles.

**Option C - remove the invention/precedent work from G2.1 and leave only basic SceneFact promotion.** This would
discard a system Adam identified as core vision and separate inventions from the persistence/callback rules that
make them real.

##### Recommendation

Choose Option B. G2.1 has become deep enough to govern later work and deep enough that continuing implementation
design here would delay the shared SceneTray and the main procedural compiler. Closure preserves every accepted
rule, every later assignment, and an explicit right to reopen on contradiction.

#### Questions now before Adam

1. **G2.1-CERT:** choose Option B - exact/world inventions always persist; optional private local learning may
   automate after tests; official/shared learning is a later, more strongly governed product capability?
2. **G2.1-CLOSE:** choose Option B - after certification and contradiction audit, close the governing design and
   route detailed schemas/UI/tests/build choices to their named later waves rather than keeping G2.1 open forever?

### 10.SWEEP.4 Ruling and material G2.1 follow-up - bounded reusable NPC casting cards

Adam accepts G2.1-CERT's tiered invention-reuse recommendation: exact inventions persist in their world; causal
in-world copying remains world truth; optional private local cross-world learning may automate after tests; an
official/shared toolbox is a later, more strongly governed product capability.

Before agreeing to close G2.1, Adam identifies a necessary memory/casting distinction. A strong NPC may be generated
for a room the player never visits. If that NPC was not woven into the place, mentioned, used by simulation, or
given committed lore, the candidate should be portable: it returns to the DM's casting hand and may be placed in a
later legal scene. Genesis should not accumulate tens of thousands of permanent NPC stubs merely because prep or a
candidate solve considered them. This is analogous to the programming lesson Adam heard about generating every
bullet as a fresh long-lived object: lifecycle and reuse must be explicit or memory fills with objects that no
longer serve play.

#### The critical distinction - candidate card, role slot, casting, and canonical NPC

```text
ROLE SLOT
  A site-owned need such as quartermaster, night guard, pilgrim, witness, prisoner, or merchant.
  The role may be canonical before any exact individual fills it.

ACTOR CARD
  A compact portable candidate: stable card/seed, rolled identity kernel, personality handles,
  compatibility tags, presentation hooks, and perhaps a DM reserve/pin. It has no world location,
  custody, relationships, or history merely because it was generated.

PROVISIONAL CASTING
  A card is tentatively matched to a role/scene/place. The match may be scored, staged in hidden prep,
  or offered to the DM. Until a rooting event commits it, no world entity exists and the card can return.

CANONICAL NPC
  A rooting event mints the stable codex entity and commits location/role/relationships/knowledge/
  equipment/history/provenance. The card leaves the portable casting deck. The NPC can later move
  only through world events, never by being silently recast elsewhere.
```

This preserves both simulation and portability. A fortress may canonically require a quartermaster role while the
exact actor remains uncast. If the quartermaster's individual decisions affect stores, orders, rumors, or other
people before player contact, the system must cast/root the individual at that point. If group/site owners can
resolve the operation without individual psychology, the role may stay abstract until contact.

#### Options

**Option A - every generated NPC is immediately canon.** This matches the current broad `soft:true` codex-pool
direction but scales poorly if generation becomes prolific. Unvisited scenes create permanent identities, locations,
and stubs; the DM loses strong unused candidates to rooms that never mattered.

**Option B - discard every unused NPC.** This keeps memory bounded but throws away unusually strong generated cast
and forces the system to repeatedly pay generation/selection cost.

**Option C - bounded reusable casting deck with two-phase binding (recommended).** Generate compact ActorCards,
tentatively cast them without creating world truth, return untouched/unrooted cards to the deck, let the DM reserve
especially good candidates, evict or seed-compact noncanonical overflow, and mint full NPC entities only on a
rooting event.

#### What roots a card into world canon?

A card becomes a permanent NPC when any of the following commits:

1. **Player contact or distinguishing evidence:** the player sees/interacts with the individual, hears a sufficiently
   identifying voice, sees their distinctive action/evidence, or otherwise gains a continuity-bearing referent.
2. **Canonical mention or record:** another NPC, document, map/roster, rumor, promise, quest, or known fact names or
   distinctly describes this individual rather than only an anonymous role/group.
3. **Individual action or consequence:** their motive, choice, knowledge, equipment, movement, order, crime, aid,
   resource use, or other action changes canonical state even if the player has not met them.
4. **Committed relationship or obligation:** the individual becomes an owner/target/member of a relationship,
   contract, callback, clock, faction role, custody chain, service promise, or other durable edge.
5. **Place/lore binding:** generated history, office, secret, residence, responsibility, ownership, or unique
   compatibility makes this exact person part of a particular place/world fact.

Generation, scoring, a hidden candidate gallery, an unused role hint, tentative placement in an unrevealed room,
asset preview, or an uncommitted DM proposal does **not** root the card.

An anonymous but causal person cannot be recycled merely because the player lacks their name. If the party hears a
distinctive unseen prisoner, is shot by an unknown sentry, or finds evidence created by one specific actor, Genesis
may root an anonymous stable NPC id and reveal the identity later. Player knowledge and engine identity remain
separate.

#### Return, reserve, eviction, and bounded memory

- If a room is never entered and no action/lore/reference/relationship binds the tentative NPC, its casting expires
  and the ActorCard returns to the eligible deck/hand.
- A strong candidate may be marked `RESERVE` by the DM/selector and retained compactly for later casting. Reserve is
  not canon and grants no current location or world knowledge.
- The active hand remains thin and relevance-filtered. A somewhat larger bench/deck may store compact cards or only
  deterministic seeds plus irreducible rolled traits. Exact capacities and replacement weights belong to Wave 9.
- Noncanonical, unreserved overflow may be evicted because it is unrealized possibility, not erased world truth.
  A deterministic seed may optionally permit rehydration without retaining full prose/state.
- Compatibility tags filter legal casting by realm, population, role, scale, faction possibility, species, tone,
  and other established constraints. The engine cannot rewrite an ActorCard's fixed identity merely to force a fit.
- A rooted NPC never returns to the generic casting deck. Later reuse occurs through movement, faction strategy,
  contracts, or callback cards referencing the same entity, not by duplicating or recasting them.

This produces two different card systems that must not be confused:

```text
CASTING DECK
  unrealized portable actor candidates; one card may eventually mint one canonical NPC

CALLBACK / STRATEGIC DECK
  references to existing canonical people/facts; replay moves or develops the same noun
```

#### Concrete examples

**Unvisited jail:** prep tentatively casts a memorable scarred goblin negotiator as a prisoner. The player never
enters the jail; no guard mentions the prisoner; the site simulation never uses their choices; no record or
relationship binds them. The casting expires and the goblin card returns to the DM's reserve. A later caravan scene
may legally cast that person as a captive, guide, or traveler if compatibility permits. There was no teleportation
because the person did not yet exist in world canon.

**Mentioned prisoner:** a guard says, “Varka in the third cell knows the old aqueduct,” creating a named person,
location, knowledge, and clue edge. Varka roots immediately even if the player never visits. Varka cannot later be
recast as a merchant elsewhere; any movement requires a real event.

**Anonymous unseen sniper:** an arrow with a distinctive maker's mark hits the party from a roof, and the engine
attributes the attack to one specific card. That actor roots anonymously because action, position, equipment, and
evidence now require continuity. The name can remain unknown.

**Quartermaster role:** the fortress program requires a quartermaster, but cold-state stock changes are owned by
the garrison/group and no individual action matters yet. The role slot persists while the exact card remains
portable. When the player meets the quartermaster or individual corruption/competence changes stores, one card is
cast and rooted.

#### Current-engine and research implications

The existing prep system mints small `soft:true` NPC pools into `w.codex`. This new ruling does not authorize code
change now, but it identifies a future redesign seam: truly unbound candidates should live as compact ActorCards
outside canonical Codex; `soft` location assignment should not masquerade as world existence. A later spec must
crosswalk/migrate the useful current pool behavior rather than deleting it blindly.

Tutenel's distinction between class/plan candidates and placed instances supports separating ActorCard from
canonical entity. Merrell's mixed initiative supports letting the DM pin a valuable candidate. Horswill's bounded
summaries and Henderson's constraint-cost findings support thin active hands and compact inactive pools. None of the
papers specifies NPC identity/canon commitment; the rooting law is Genesis-specific.

Option C has **medium architecture cost**: ActorCard/RoleSlot/CastingBinding records, two-phase commit/rollback,
rooting-event detection, reference integrity, bounded deck/hand policy, seed compaction/rehydration, compatibility
filtering, and tests proving that unrooted candidates neither leak into world truth nor disappear after commitment.
It substantially reduces long-session memory/state growth while preserving the best generated cast.

#### Recommendation and closing follow-up

Accept Option C and the rooting rules above. This amends “no erasure” precisely:

> Canon is never erased merely because play moved on. Unrealized candidates are not canon; they may return to a
> bounded casting deck or be evicted. Once contact, evidence, action, relationship, obligation, or lore roots a
> candidate, the resulting NPC is permanent world identity and may only move/change through canonical events.

If accepted, exact deck/hand capacities, replacement scores, UI, and generation budgets route to Wave 9, promoted
Wave 10, and implementation specs. Then G2.1 can enter its contradiction/material-follow-up audit before closure.

**Question for Adam:** accept the bounded ActorCard -> provisional casting -> rooted canonical NPC lifecycle,
including return-to-hand for untouched/unwoven candidates, compact DM reserve for exceptional candidates, eviction
of noncanonical overflow, and permanent identity at the first continuity-bearing contact/evidence/action/lore edge?

### 10.SWEEP.5 Clarification and acceptance - pooled casting capacity, not cleanup after accumulation

Adam completes the bullet-programming analogy and confirms that section 10.SWEEP.4 understood the intended NPC
lifecycle. The important optimization is stronger than periodically purging dead objects. A weapon can allocate a
bounded bullet pool once, reuse an inactive bullet slot for the next shot, and derive the required capacity from
its maximum fire rate and the maximum time/distance for which any bullet can remain live. Total bullets ever fired
then does not determine memory use.

Genesis should apply the same capacity-first law to **provisional casting**, while preserving the extra identity
semantics that NPCs require:

```text
REUSABLE ACTOR SLOT POOL
  fixed/bounded runtime capacity for candidates currently being generated, scored, or provisionally cast
  an expired unrooted casting releases its slot for immediate reuse

BOUNDED DM HAND / RESERVE
  compact identities judged worth keeping for later legal casting
  a returned card can remain the same promising person rather than being regenerated
  retention is explicit and capped; generic candidates do not all enter the reserve

CANONICAL NPC STORE
  persistent world identities created only by rooting events
  never recycled as anonymous runtime slots and never deleted merely because they are offscreen
```

The runtime ceiling is therefore based on **maximum simultaneous unresolved casting demand**, not on total NPCs
ever considered. Its later budget should account for the maximum active SceneTrays, bounded procedural lookahead,
the greatest number of provisionally staffed role slots inside that horizon, concurrent DM comparisons, and a
small explicit reserve allowance. In rough capacity terms:

```text
required provisional slots
  = peak concurrently staged unresolved roles
  + peak comparison/selection workspace
  + bounded safety margin

retained identity cards
  = active DM hand
  + explicitly capped reserve
```

This is analogous to `fire rate x maximum bullet lifetime`, but the later implementation should measure actual
peak concurrency rather than mistake the analogy for a final numeric formula. Exact values remain Wave 9/10 and
implementation-spec work.

#### Concrete dungeon/Gemini-game behavior

A site solver may provisionally staff eight nearby roles while evaluating the player's reachable route. If five
rooms fall outside the valid/relevant horizon without any rooting event, those five castings release their runtime
slots immediately. The next site solve reuses the same slots; it does not allocate five more permanent NPC stubs.
If one discarded-room candidate is the unusually strong scarred goblin negotiator, the DM may promote that compact
card into the bounded reserve before releasing the provisional casting. The slot is free, while the promising
identity remains available for a compatible later role. If the guard already mentioned that goblin as Varka, the
rooting event instead creates canonical Varka; neither the slot nor a duplicate card may later masquerade as Varka.

The same principle applies when the DM evaluates several possible allies, rivals, victims, or hostile specialists
for an improvised Gemini-game response. The candidate workspace is reusable. Only the chosen/rooted participant
enters world state; a particularly useful unused concept may be pinned in the finite hand/reserve. Helpfulness does
not affect the lifecycle rule.

#### Implementation and maintenance implications

This refinement keeps the earlier **medium architecture cost** but makes the intended performance contract more
testable. A later implementation needs:

- an explicit fixed/bounded slot allocator or equivalent reuse discipline rather than unbounded append-only
  candidate objects;
- hard reset/rebind rules so names, motives, visual selections, knowledge, faction tags, and provenance cannot leak
  from one recycled slot into another;
- distinct ids for a reusable runtime slot, a retained ActorCard identity, a provisional casting attempt, and a
  rooted canonical NPC;
- deterministic save/load behavior for the bounded hand/reserve without serializing empty or disposable workspace;
- capacity telemetry and stress tests proving memory follows peak concurrency rather than cumulative generation;
- reference-integrity tests proving a rooted NPC can never be reclaimed by the provisional pool.

The chief maintenance risk is stale-state leakage during slot reset; the chief design risk is accidentally treating
the bounded reserve as a second unbounded Codex. Both require executable invariants. Tutenel's plan/instance split,
Merrell's candidate pinning, Horswill's bounded summaries, and the reviewed constraint-based generation work remain
consistent with this division. The exact three-store pooling policy is a Genesis-specific synthesis prompted by
Adam's completed bullet analogy, not a rule claimed verbatim from those papers.

#### Accepted ruling and final narrow follow-up

Adam accepts the section 10.SWEEP.4 interpretation: an untouched, unwoven provisional NPC can return to the DM
casting system, while a continuity-bearing NPC roots permanently. The completed analogy further establishes a
capacity-first target: recycle provisional runtime slots continuously instead of creating then later purging an
ever-growing history of candidate objects.

One material boundary remains to confirm before this NPC follow-up is exhausted:

**G2.1-NPC-POOL:** should ordinary expired candidates release/reset their reusable slot, while only candidates the
DM/selector explicitly promotes retain their exact identity in a bounded hand/reserve? This is the recommended
rule. Keeping every expired candidate's identity, even in compact form, would recreate the cumulative-growth
problem at a different layer.

### 10.SWEEP.6 Final NPC-pool ruling and material G2.1 follow-up - private DM deliberation sandbox

Adam accepts G2.1-NPC-POOL. Ordinary expired candidates and incoherent/scrambled candidates with no useful
continuity handles release and reset their reusable runtime slots. Only candidates explicitly promoted because
they have worthwhile coherence, identity, relationship, motif, role, or callback handles retain their exact
identity in the bounded DM hand/reserve. Rooted NPCs remain in the separate permanent canonical store. The NPC
pool follow-up is exhausted; later numeric capacities and replacement weights retain their assigned owners.

Adam also records an unrelated but directly relevant AI-DM research recollection: Hidden Door reportedly found
that giving its DM/narrative agent a sandbox scratchpad—a place to think outside the system's action constraints—
produced higher-quality, more consistent in-system actions. The exact source for that finding is not present in
Genesis's downloaded nine-paper procedural-layout corpus, and a July 20 public-source check found descriptions of
Hidden Door's decomposed narrative/game-state architecture but not the exact scratchpad experiment. Preserve the
attribution as Adam's research recollection until the original video/paper/talk is identified; do not convert it
into a falsely sourced empirical claim.

The architectural insight is nevertheless strong and testable on its own. The DM needs somewhere to **consider**
ideas that are not yet legal world actions. Otherwise, forcing every intermediate thought directly into the final
event schema can make the model optimize for schema compliance before it has discovered the best dramatic or
causal interpretation.

#### Plain-English distinction

The DM may privately ask itself questions such as:

- What surprising connection would make these facts feel intentional rather than random?
- Which existing NPC would care about this, and why?
- What would a clever enemy attempt against the player with the resources it actually has?
- Is the obvious SRD item less expressive than a licensed invention?
- Could the turtle communicators become a relationship payoff, a liability, or an enemy interception vector?
- Which candidate interpretation preserves the roll while making the room more memorable?

Those are **thoughts and hypotheses**, not world facts. The DM can temporarily imagine impossible, contradictory,
overpowered, or unsupported versions while comparing ideas. It receives canonical context, but every intermediate
candidate does not have to satisfy the action/event grammar. Nothing in the sandbox can spend a resource, move an
NPC, mint an item, reveal a secret, reserve a card, change a clock, or tell the player that something happened.

The selected idea must then leave the sandbox through the same constrained proposal/validation boundary already
accepted for creative invention and player action:

```text
read-only canonical snapshot + current dramatic/operational obligations
  -> PRIVATE DELIBERATION SANDBOX
       diverge: associate, hypothesize, compare, anticipate, reject, combine
       converge: select an intended story/action meaning and identify assumptions
  -> typed InventionProposal / ActionPlan / StrategyProposal / commit-header choice
  -> engine resolves authority, targets, resources, knowledge, mechanics, versions, and consequences
  -> accepted ResolutionReceipt / CreationReceipt or honest rejection/repair
  -> player-visible narration from committed truth
```

The freedom is therefore **outside the final action schema**, not outside consequence, canon, or safety. The DM is
free to think of flooding the prison, bribing the guard, inventing turtle communicators, or connecting a discarded
saint's medal to an old vow. It is not free to assert any of those things happened until the engine finds or creates
the required authority and commits the result.

#### Options

**Option A - direct constrained output only.** Require the DM to produce a valid action/header immediately from the
active digest. This is cheapest and fastest, and remains appropriate for routine receipt narration, but can collapse
creative search into the first schema-shaped answer and encourage locally compliant yet narratively dull choices.

**Option B - sovereign scratchpad whose conclusions can directly become truth.** Let the DM reason freely and then
trust its conclusion. This preserves creativity but erases the engine/DM boundary: unsupported assumptions in the
scratchpad can become invented inventories, teleported NPCs, false knowledge, free resources, or narration the
validator cannot honor. **Rejected.**

**Option C - private, non-authoritative, tiered deliberation sandbox (recommended).** Let the DM explore freely in an
ephemeral private workspace, require its chosen conclusion to compile into a typed proposal, and permit only the
validated receipt to affect canon or visible narration.

Use deliberation proportionally:

```text
ROUTINE
  pre-resolved movement, attack, inventory, ordinary inspection, receipt narration
  -> no separate scratchpad or only the model's minimal hidden reasoning

CONTEXTUAL
  callback choice, NPC tactic, scene composition, consequence form, clue connection
  -> bounded private candidate comparison inside the normal turn budget where possible

SYNTHESIS / HIGH IMPACT
  new invention, major hostile plan, topology change, irreversible consequence, contradictory canon repair
  -> larger deliberation budget and, when necessary, the already accepted preflight/second-call lane
```

This keeps a good routine turn from paying the latency/token cost of a miniature writers' room while giving the
creative DM seat genuine room to operate when judgment matters.

#### Concrete Genesis examples

**Turtle communicators:** the sandbox may consider an SRD sending item, matching brass turtle shells, a one-way
whisper token, a linked pair that warms near its partner, or a hostile interception weakness. It compares those
against the relationship payoff and earned power envelope. The final `InventionProposal` selects the paired turtle
concept and states its assumptions; the engine, not the scratchpad, establishes range, charges, custody, linked ids,
and interception rules.

**Enemy invention against the player:** an enemy strategist privately considers collapsing a stair, bribing a guide,
poisoning a cistern, impersonating an ally, or jamming the turtle communicators. The sandbox can explore all five.
The final `StrategyProposal` must use only the enemy's knowledge, time, access, resources, doctrine, and mechanical
authority. A vivid thought is not a free hostile asset.

**Dungeon throughline:** the DM sees a plague bell, an unpaid ferryman, and an unrooted scarred-goblin card. It may
privately test several connections. If it selects the goblin as the ferryman's estranged former partner, casting,
relationship, and lore proposals still require validation/rooting. Rejected private connections never become
Codex debris.

#### Persistence, privacy, and model portability

Genesis should not require access to or storage of a provider's verbatim chain of thought. The capability may be
implemented through provider-hidden reasoning, an ephemeral candidate blackboard, a compact plan/critic pass, or a
separate bounded preflight. The contract is behavioral: the DM gets non-authoritative deliberation capacity before
committing a typed proposal.

By default, raw scratchpad material is ephemeral, noncanonical, absent from player saves/journals/Codex, and never
projected to the player. Store the selected proposal, declared assumptions, compact reason/provenance tags,
validation result, receipt, model/protocol version, and performance metrics needed for replay and QA. Development
fixtures may capture fuller traces under explicit privacy/debug policy; production correctness must not depend on
exposing private reasoning.

The proposal validates against the current versioned snapshot at commit time. If state changes while the DM thinks,
the proposal rebases, repairs, or fails without showing consequential prose. Scratchpad freedom is not a stale-write
exception.

#### Research and cost filter

The downloaded procedural papers do **not** test LLM scratchpads. They support only adjacent divisions: Tutenel's
semantic plans remain distinct from solver realization; Merrell permits candidate exploration and human pinning;
constraint-based systems generate/evaluate several candidates before committing placement. That evidence supports
separating ideation from legal realization, but it cannot establish that an AI-DM scratchpad improves story quality.
Genesis must test that claim directly.

Public Hidden Door descriptions found during the source check say that player language maps into structured game
state, story threads/tropes provide controllable building blocks, and specialized models decompose the larger
narrative task. Hidden Door's own demo commentary also describes AI transforming player words into intent and
seeking interesting story paths while constraints fuel creative thinking. These are directionally compatible with
Option C, but none of the located pages documents the recalled scratchpad comparison.

Option C has **medium runtime/protocol and QA cost**. It consumes extra inference tokens and possibly latency on
non-routine turns; requires read-only snapshot discipline, proposal/receipt separation, stale-version handling,
scratchpad-leak tests, bounded budgets, privacy/retention policy, and A/B evaluation. Maintenance must prevent prompt
changes from making the sandbox verbose but useless. Acceptance should compare direct-constrained versus tiered-
deliberation turns on mechanical validity, contradiction rate, callback use, novelty without noun leakage, hostile
fairness, human preference, latency, and cost.

#### Recommendation and question

Accept Option C as the best-case DM cognition boundary: private divergent/convergent thought may range beyond the
final action grammar, but it is read-only and non-authoritative; only a typed, freshly validated proposal can alter
the world or license player-visible consequences. Use no/minimal deliberation for routine receipts, bounded
deliberation for contextual choices, and deeper preflight for synthesis/high-impact decisions. Preserve selected
proposals and receipts, not raw private chain of thought, as the normal canonical/audit record.

**G2.1-DM-SCRATCH:** accept that tiered private-deliberation model, subject to later A/B proof rather than treating
the recalled Hidden Door result as sufficient evidence by itself?

### 10.SWEEP.7 Acceptance, G2.1/G2.2 closure, and Wave 2 final contradiction audit

Adam accepts G2.1-DM-SCRATCH. The DM receives tiered private deliberation that is read-only and non-authoritative:
routine receipt narration pays little or no extra reasoning cost, contextual choices may compare a bounded set of
candidates, and synthesis/high-impact decisions may receive deeper preflight. The sandbox may explore beyond the
final action grammar, but only a freshly validated typed proposal may change canon or license consequential prose.
Normal persistence keeps the selected proposal, assumptions/reason tags, validation, and receipt rather than raw
private chain of thought. Genesis will A/B test the benefit instead of treating the unlocated Hidden Door source as
proof.

The promised contradiction/material-follow-up audit now covers G2.1, G2.2, the return to prospective Question 12,
and the full accepted Wave 2 sweep. This does not declare Wave 2 closed; only Adam's explicit closure agreement can
do that.

#### G2.1 contradiction audit - no material follow-up remains

The following apparent tensions resolve without changing an accepted principle:

| Boundary checked | Resolution |
|---|---|
| SceneFact non-erasure versus pooled NPC reuse | A provisional ActorCard is unrealized possibility, not canonical SceneFact. Player contact, identifying evidence, individual causal action, committed relationship/obligation, or generated canonical lore roots it; after rooting, the stable NPC is never recycled. |
| Broad world memory versus bounded DM hand | Canonical owners and history preserve what happened. Only viable, due callbacks enter the thin strategic hand. A separate bounded casting hand contains unrooted candidates; neither hand is the world database. |
| Returned exceptional NPC versus generic slot reset | A reusable runtime slot is allocation capacity. An explicitly promoted reserve card is compact candidate identity. Most expired/scrambled candidates release both; a strong candidate may retain identity while its provisional placement releases the slot. |
| Private deliberation versus transactional truth | Sandbox hypotheses have no authority. `InventionProposal`, `ActionPlan`, `StrategyProposal`, and commit-header choices still pass current-version validation before receipts or visible consequences. |
| Omniscient DM direction versus actor/player knowledge | Existing knowledge scopes remain authoritative. A director-level sandbox may consider hidden canon, but an actor's strategy must validate against that actor's knowledge and a player-facing narration receives only the player-safe projection. Private thought grants no knowledge edge. |
| Scratchpad freedom versus least-new-mechanics routing | Deliberation may consider novel forms, but the chosen proposal still traverses retrieve/use/adapt/compose/invent routing. “Least-new mechanics, not least-new fiction” remains the compilation law. |
| Scratchpad candidates versus precedent learning | Rejected or merely imagined candidates are not evidence. Only committed, exercised, canon-stripped, tested, versioned recipes may enter P2/P3 certification. Raw deliberation never trains the local/shared toolbox by itself. |
| Helpful invention versus hostile invention | Valence changes neither authority nor lifecycle. Enemy synthesis additionally requires causal knowledge, time, access, resources, tells, graduated counter strength, and counterplay. |
| Best-case system versus production schedule | The north-star platform remains documented. Slices, providers, token budgets, latency, exact schemas, and ship scope are reweighed before implementation; this is an explicit later assignment, not a smaller design ruling. |
| Downloaded-paper authority versus Genesis invention policy | The nine papers support semantic/constraint/candidate/solver boundaries but do not prove AI-DM invention, scratchpad quality, NPC identity rooting, or cross-world certification. Those remain Genesis-specific rules with dedicated tests. |

No missing canonical owner or unresolved player-facing behavior remains inside G2.1's governing scope. Exact schemas,
card limits, salience/selection weights, deliberation budgets, domain adapters, certification metrics, privacy policy,
UI, and build order already have explicit Wave 9-12/spec/implementation owners. **G2.1's governing design baseline is
closed**, with the standing right to reopen on contradictory evidence rather than speculative implementation detail.

#### G2.2 mechanical follow-up audit - no material follow-up remains

Adam already accepted the renderer-neutral CrisisChain bundle in section 10.SWEEP.3. The likely follow-ups from the
rapid sweep resolve as follows:

- **Graph versus phases:** a small directed graph is the general representation; an ordinary linear phase sequence
  is simply a graph with one forward path. Branches/fronts appear only when the crisis actually needs them.
- **When to create one:** only a sustained multi-actor or multi-system situation with several meaningful
  contributions and state changes across more than one beat earns a CrisisChain. Ordinary checks, combats, and
  clocks keep their existing owners.
- **Contribution and partial outcomes:** ordinary actions resolve first. Typed receipts may satisfy, advance,
  unlock, block, branch, damage, abandon, or terminate objectives through concrete state; no abstract contribution
  can counterfeit a roll, resource, action, position, or consequence.
- **Initiative and simultaneity:** combat/scene/world-time owners determine who can act and when. CrisisChain reads
  their receipts; it does not create a second action economy. Helping or simultaneous actions require legal timing,
  communication, position, capability, and cost.
- **Offscreen actors:** a named individual contributes only when canonical availability, knowledge, access, timing,
  and resources permit. Group summaries may act only where individual identity is not consequential.
- **Ownership:** the chain references actors, props, hazards, conditions, flows, clocks, and resources at their real
  owners. It stores orchestration topology and receipts, never copied shadow inventories or duplicate simulation.
- **DM authority:** the DM chooses connective presentation, tactics, and licensed meaning; the engine owns
  eligibility, action resolution, contribution receipts, terminal state, and persistence.
- **UI:** Wave 2 supplies a renderer-neutral projection of known objectives/fronts, stakes/tells, participants,
  handles, pressure, and consequences. Whether this appears as cards, tracks, tray regions, highlights, prose, or a
  different grammar remains intentionally unresolved until the promoted Wave 10 graphics-engine revision.

Exact node caps, projection density, display grammar, and animation are later tuning/renderer questions. They do
not change the mechanical ownership law. **G2.2's Wave 2 mechanical baseline is closed.**

#### Return to the Wave 2 numbering sequence - P2.12 through P2.20

The live sequence returns exactly as promised to newly formulated prospective `P2.12`; there was no hidden
prewritten original Question 12. The rapid sweep already obtained Adam's answers, so this pass checks consequences
rather than asking him to repeat those choices.

| Question | Accepted ruling | Final material-follow-up result |
|---|---|---|
| **P2.12 active/site/cold ownership** | One canonical owner, bounded active/site/cold projections, versioned atomic/idempotent handoffs, deterministic catch-up, no reroll/loss/duplication. | NPC pooling clarifies—not contradicts—the boundary: only rooted actors are canonical. Touched, named, unique, damaged, promised, transferred, or callback-eligible truth stays exact; safe anonymous multiplicity may compact. Long-tail budgets/schema migrate to architecture/Wave 12. No further principle question. |
| **P2.13 external dependencies** | Typed regional boundary contracts carry source/destination, class, capacity, cadence, travel/risk, ownership, disruption, reserve, evidence, and due delivery. | The accepted regional politics/economy sketch can supply these summaries. Exact route geometry expands only when contacted/consequential and remains a Wave 3/10 integration concern. No continuous regional room-resolution simulation is implied. No further principle question. |
| **P2.14 renewal/depletion** | Consequential stocks have explicit source, capacity, cadence, conditions, sinks, evidence, transformation, and terminal floor; no spontaneous restock. | Every renewal law must name its owner and conservation/creation authority. Exact rates and authored stock catalogs are later content/balance work. No further principle question. |
| **P2.15 ecology/population pressure** | Bounded summaries, clocks, and threshold events cause movement, conflict, adaptation, dormancy, or collapse; no continuous individual ecology now. | Pooling prevents threshold events from minting bespoke-fit NPC history. A future deeper ecology remains an explicit post-proof expansion, not a current gap. No further principle question. |
| **P2.16 loot/holdings/custody** | Consequential unique items commit exactly before reveal; fungible supplies use owned envelopes with deterministic late instantiation and conserved custody. | DM `SYNTHESIZE` can create exact expression-bearing rewards only through an earned envelope and receipt; catalog lookup never creates availability. Exact container UI, anti-save-scumming mechanisms, recipes, prices, and theft responses keep their named item/economy/Wave 5/10 owners. No further principle question. |
| **P2.17 player-caused operation** | Typed receipts alter obligations, flows, groups, stocks, state, evidence, dependencies, duration, and recovery; durable changes survive cold catch-up. | G2.1 supplies promotion/invention and Wave 8 later supplies detailed physical propagation. Neither may duplicate site ownership. No further principle question. |
| **P2.18 impossible sites** | Preserve hard canon, try alternate legal realization, emit a credible failing/crisis state, then explicitly refuse when no honest result exists. | The semantic compiler uses the same hard/soft/negotiation law. An impossible-site result may be playable only when its failure itself is causal and does not silently satisfy the impossible obligation. Exact relaxation tables belong to the solver/spec. No further principle question. |
| **P2.19 DM/player projection** | Simulation feeds bounded DM context; players receive diegetic evidence, behavior, records, shortages, handles, and causal tells rather than statistical dashboards. | The private scratchpad is never a player projection. CrisisChain and operating-state UI remain governed by promoted Wave 10; player questions still receive truthful diegetic access to consequential state. No further principle question. |
| **P2.20 proof** | Twelve golden sites, eight adversarial transition traces, and deterministic + batch/property + human/play proof layers. | Add NPC pool peak-concurrency/reset-leak/rooting fixtures and direct-constrained-versus-tiered-deliberation A/B cases to that corpus. Exact numeric pass thresholds remain Wave 11/12/spec work; required evidence classes and representative cases are settled. No further principle question. |

#### Full Wave 2 contradiction/coverage result

- O2.1-O2.11 remain answered and unchanged; the sweep's confirmation/reopen conditions found no violation.
- G2.1 and every generated follow-up through certification, NPC pooling, and DM deliberation are answered and
  closed at the governing-design level.
- G2.2 and its mechanical follow-ups are answered; player-facing presentation is intentionally deferred to the
  graphics-engine decision in promoted Wave 10.
- P2.12-P2.20 are answered, their requested deep dives are settled, and the table above finds no remaining material
  follow-up inside Wave 2 scope.
- All exact schemas, weights, capacities, thresholds, content catalogs, UI forms, migrations, and production cuts
  have named later owners. Deferral changes no accepted world/DM/player behavior.
- No code, CI, worktree, LFS, merge, push, or implementation authorization is created by this audit.

Wave 2 is therefore **ready for**, but has not received, its explicit closure ruling.

**W2-CLOSE:** Adam, do you explicitly agree to close Wave 2 at this audited baseline and open promoted Wave 10's
shared SceneTray/graphics-engine revision next—without opening Wave 3?

### 10.SWEEP.8 Explicit Wave 2 closure and Fable-readiness gate

Adam explicitly agrees to **close Wave 2** at the audited section 10.SWEEP.7 baseline and to open promoted Wave 10
next without opening Wave 3. This is the closure gate required by the questionnaire protocol, not an inference from
batch acceptance.

Wave 2 closes with:

- all preserved original Wave 2 Questions 1-11 and their generated follow-ups answered;
- additive G2.1-G2.2 and every generated invention, callback, NPC-pooling, private-deliberation, and CrisisChain
  follow-up answered at governing-design level;
- newly formulated prospective P2.12-P2.20 answered without misrepresenting them as a hidden original list;
- the full contradiction, authority-owner, research-claim, implementation-deferral, and player-facing-behavior
  audit complete;
- no open material follow-up inside Wave 2 scope;
- no code, CI, worktree, LFS, merge, push, or implementation authorization.

The next design position is **promoted Wave 10 - Interim Visual Engine and Release Scope**. It opens before Wave 3
because the shared SceneTray representation, adapter, precision, continuity, beauty, performance, asset, and
acceptance contracts constrain how Waves 3-9 should expose their truth. Following Adam's rapid-sweep preference,
P10.0-P10.12 and G10.1-G10.2 should first be surfaced together with concise recommendations; only flagged or
material consequence questions receive full depth before Wave 10's explicit closure gate.

#### When it is safe to hand the design to Fable

“Safe” has three materially different meanings:

```text
SAFE NOW - READ-ONLY REVIEW
  Fable may independently summarize, challenge, cross-reference, or find gaps in CLOSED Waves 1-2
  and may help prepare the promoted Wave 10 discussion.
  It may not rewrite questionnaire provenance, reopen accepted rules by omission, create a build spec,
  or treat unresolved renderer choices as settled.

FIRST SAFE DESIGN-TO-SPEC GATE - AFTER PROMOTED WAVE 10 CLOSES
  Fable may translate the closed semantic foundation plus the closed shared SceneTray/graphics contract
  into candidate visual/projection architecture, scoped production slices, acceptance fixtures, and
  implementation questions. This is the first useful “take it to the next step” gate for the renderer lane.
  Any execution still requires Adam's separate authorization.

FULL PROCEDURAL DESIGN-TO-BUILD GATE - AFTER ALL WAVES AND THE CROSS-WAVE AUDIT CLOSE
  Fable may transform the complete design into implementation-grade specs, dependency-ordered units,
  migration strategy, QA gates, and production alternatives without guessing unresolved Waves 3-9/11-12.
```

Therefore the document is **safe to send to Fable now only as a read-only critic/synthesist**. It is not yet safe
to ask Fable to produce the authoritative whole-system build plan. The first strong handoff for downstream visual
specification is promoted Wave 10 closure; the full procedural-engine handoff waits for all waves and the final
cross-wave audit. Codex must explicitly notify Adam when each of those readiness gates is reached.

This readiness rule protects the purpose of promoting Wave 10: Fable should not fossilize the current expensive
renderer, assume a false top-down replacement, or make Waves 3-9 target a scene contract Adam has not chosen.


<!-- END VERBATIM MIGRATION: original lines 14429-15645 -->
