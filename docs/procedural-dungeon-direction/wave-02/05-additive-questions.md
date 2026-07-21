---
type: design-study
status: CLOSED
wave: 2
part: 5
legacy_sections: "10.G2.1-10.G2.2"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 2 — Additive Questions

<!-- BEGIN VERBATIM MIGRATION: original lines 12181-14428 -->

### 10.G2.1 Additive question - SceneFactGraph promotion (opened; awaiting Adam)

The preserved original questionnaire remains unchanged. This is the additive `G2.1` question placed before
original Wave 2 Question 12 by section 10.11.57.

In plain English: when play makes an ordinary generated thing or circumstance matter, what exact sliver of it
becomes reliable engine truth, and what may that truth legally enable later? The design must make the Gemini
reference's causal generosity reproducible without continuously simulating every bottle, chain link, straw
pile, patch of snow, or descriptive noun in a room.

#### Research sift for G2.1

The nine downloaded primary papers in `Reference/Procedural-Dungeon-Research/papers/` were rescanned before
opening this question. They do not directly solve persistent improvisational causality, but their strongest
representation lessons apply:

- Tutenel et al. (2009) make object classes, tagged features, legal regions, hierarchical blocks, ordered
  plans, and backtracking explicit. A tabletop affords supported objects because it exposes a typed feature,
  not because prose happens to mention a table. The same paper warns that a flat accumulation of features
  approaches quadratic work and uses hierarchical subproblems to keep the active solve bounded.
- Tutenel et al. (2010) separate designer-readable semantic scene descriptions from the ordered procedures
  compiled from them. Objects carry attributes, predicates, services, materials, relationships, and context;
  a dependency graph determines placement order. This supports authored semantic capability types and
  source-owned relationships rather than downstream keyword inference.
- Yu et al. (2011) and Merrell et al. (2011) show that accessibility, visibility, circulation, pairwise
  relations, clearance, and composition are distinct terms. Their ablation examples demonstrate that
  dropping one relation creates a specific failure even when the rest of the scene remains plausible. For
  Genesis, a promoted fact should therefore expose only proved relationships and affordances, not inherit an
  undifferentiated bundle of imagined properties.
- Horswill and Foged (2012) obtain fast playability guarantees by propagating small numeric and finite-domain
  summaries over a graph and by stating which paths count. This favors derived summaries over copying whole
  simulations into a scene record, and explicit scope over a claim that a fact applies everywhere.
- Nepozitek and Gemrot (2018) preserve a designer-owned connectivity graph while using configuration spaces,
  chains, hard/soft constraints, and backtracking to realize it. This reinforces the rule that a consequential
  change must preserve its canonical graph owner and pass a typed legality boundary.
- Green et al. (2019) separate architecture from furnishing and show through expressivity and procedural-
  persona evaluation that combinations of independent stages materially change play. Promotion must cross
  owning adapters transactionally; the SceneFactGraph should not become a second architecture, furnishing,
  population, or rules engine.
- Henderson et al. (2019) make constraints highly flexible through rejection sampling, but measure the
  multiplicative runtime cost of simultaneous constraints and identify a weakness in editing an already
  sampled layout. That is a direct warning against validating arbitrary late mutations by repeatedly
  regenerating the scene; promotion needs narrow state transitions on the existing canonical plan.
- Whitehead (2020) demonstrates declarative room constraints and honest unsatisfiability, while also showing
  longer solve-time tails and sampling bias as constraints accumulate. A future general solver may be an
  escalation path, but it should not sit on every turn or replace explicit effect adapters.

The combined lesson is not “put every noun in one universal ontology.” It is: keep a small semantic contract,
name its dependencies and owner, distinguish hard permission from soft narrative fit, mutate an existing plan
through a receipt, and bound the active graph.

#### Viable promotion policies

**Option A - closed interactable whitelist.** Only objects and conditions that an authored room recipe marked
as interactable in advance may become mechanical truth. A jail's portcullis, restraint chain, lamp-oil barrel,
and lock could participate; incidental straw, spilled soup, or an improvised snowbank could not unless their
exact types were pre-authored. This has the smallest runtime and clearest tests, but it loses the Gemini game's
defining ability to make an ordinary touched noun matter. Its low initial implementation cost becomes a high
permanent content-authoring cost, and every omitted capability feels like the engine refusing a reasonable
idea.

**Option B - promote any mentioned noun into a generic fact/tag bag.** Player attention or DM narration may
create a record and attach free-form tags such as `flammable`, `wedged`, `anchor`, or `route`. The brandy,
snow, embedded mace, leaking fuel, and solid-light path are easy to express, as is nearly any dungeon stunt.
Initial implementation and authoring are deceptively cheap. Long-term validation, migration, rendering,
prompt projection, exploit prevention, and combination testing become unbounded; synonym drift and
retroactively invented properties recreate Gemini's prose-only continuity problem under a database-shaped
surface.

**Option C - typed lazy promotion through resolution receipts (recommended).** All seven relevant source
families are eligible - site, room, assembly, prop/material, condition, position, and relationship - but a
whole descriptive object is not eagerly simulated. A stable referent and only the consequential facets are
promoted when play targets or relies on them, a validated result changes them, or a later legal action needs
them as an input. The promotion receipt must bind the new fact to an existing canonical owner, or atomically
create a bounded DM-invented referent through the already accepted invention-validation seam.

The minimum promoted contract should contain:

```text
identity/type and source event/roll
canonical subject, target, holder, and owning adapter
location/zone and current typed state
evidence plus observer/knowledge boundary
offered capability interfaces or affordance tokens
causal parents and dependencies
duration, expiry, consumption, exhaustion, or restoration rule
protected-canon hardness and reconciliation trace
salience plus DM/visual projection needs
```

Later actions may consume or transform the fact only through an authored typed reaction/effect recipe, an
existing rules adapter, or a validated arbitrary-intent `CheckContract` that commits a new receipt. Prose
adjacency is never sufficient. An afforded action is a permission surface, not a forced action menu and not a
promise of success.

Concrete dungeon example: a generated jail storeroom contains one lamp-oil cask because the site's lighting
flow owns it. The player punctures it. A receipt promotes the cask referent only as far as needed and creates
`leaking_oil` at that room location with remaining supply, slippery/flammable capability interfaces, visible
evidence, and a consumption/cleanup rule. A later torch can ignite it only through the fire-material reaction
adapter; the result consumes oil and creates an owned fire condition. The engine does not simulate every
container in the storeroom. When the scene cools, resolved temporary facts compact into the cask's state, room
damage/evidence, resource-flow loss, and Ledger history rather than remaining forever in the active scene
graph.

Concrete Gemini-reference example: the mace already has item identity and the vehicle has hull/position
state. The hit receipt may create an `embedded_in` relationship and hull damage. A fuel leak follows only if
a pre-existing fuel-line fact or a same-turn validated invention establishes that dependency. The leak may
later supply a luminous trail, but a traversable solid-light route still requires a legal spell, combo, crit, or
novel-action receipt. Once committed, the route is real for movement, pursuit, lighting, evidence, expiry, and
projection. The system neither denies the ridiculous idea nor grants it because two colorful sentences were
near each other.

#### Cost assessment and recommendation

Option C has a **medium-high concentrated implementation cost**: a type registry, promotion/transition
receipts, adapter boundaries, bounded active-graph service, compaction/reconciliation, DM projection, and
trace fixtures. Its **content cost is medium and ongoing** because materials, conditions, positions, and
relationships need reusable capability/reaction recipes. Its **maintenance cost is lower than Option B's**
because the combinatorial surface is factorized by type and unsupported transformations fail honestly. The
largest risks are an overgrown universal ontology, duplicated authority between the graph and existing
systems, digest bloat, and adapters whose cross-products are nominally type-safe but untested.

The recommended guardrail is that `SceneFactGraph` is an active causal index and transaction surface, not a
new owner of everything. Items stay item-owned, conditions condition-owned, positions spatial-owned,
relationships relationship-owned, and site flows site-owned. The graph holds typed references/edges and the
minimum live facets needed to compose the present scene, then projects durable outcomes back to their
canonical owners.

**Question for Adam:** choose or amend the promotion policy. The recommendation is Option C: every relevant
source family is eligible, but only player-relied-on or mechanically changed facets are promoted through typed
receipts; later affordances require typed recipes/adapters or another validated arbitrary-intent receipt; and
resolved facts compact back into their true canonical owners. Follow-ups must still decide the exact promotion
trigger, the granularity and expiry/compaction rules, how unknown-but-plausible properties are proposed, and
the minimum authored capability grammar before `G2.1` can close.

#### 10.G2.1.1 Ruling and follow-up - typed lazy promotion accepted; what exactly triggers it?

Adam chooses **Option C, as always**. All relevant source families may participate, but only the consequential
referent and facets become active truth through typed receipts. `SceneFactGraph` is an active causal index and
transaction surface, never a duplicate owner of the world's items, conditions, positions, relationships, rooms,
or site flows. Later affordances require a typed adapter/recipe or another validated arbitrary-intent receipt, and
resolved durable outcomes return to their canonical owners.

The first material follow-up is the promotion threshold. “When the player relies on it” is directionally right but
not mechanically exact. It could mean first narration, first question, first declared use, first roll, first changed
state, or first need to survive beyond the scene. Those boundaries have different costs and different failure
modes.

##### Trigger options

**Option 1 - full promotion on narration.** Every concrete noun the DM or renderer introduces immediately gets
stable identity, state, capabilities, dependencies, and persistence rules. This makes every described shelf,
bottle, snowbank, chain, stool, crack, and corpse maximally reliable before the player asks about it. It also
creates the exact eager-simulation burden G2.1 exists to avoid: high save and digest growth, constant adapter
work, noisy visuals, and large reconciliation/migration surfaces for nouns that never matter.

**Option 2 - full promotion on player attention.** A noun is fully promoted when the player names, examines,
points at, or asks about it. This is cheaper and more reciprocal than narration-time promotion, but curiosity can
still explode the active graph. It also risks turning questions into creation: “Is there lamp oil in those jars?”
must not manufacture lamp oil merely because the player found useful words, and asking what a mural depicts
should not require the mural to acquire every physical capability it might someday have.

**Option 3 - staged reference pinning, mechanical activation, and durable projection (recommended).** Use four
distinct states rather than one magic promotion moment:

```text
T0 ambient projection
  generated/narrated from an existing source; no new SceneFact record

T1 pinned referent
  player or validated DM proposal singles it out; lightweight stable identity,
  source, owner, location, observed description, and knowledge provenance only

T2 active fact
  an action, rule, threat, or receipt depends on or changes it; before consequential
  resolution, validate and materialize only the required typed facets and affordances

T3 durable projection
  the fact gains an external dependency, survives the active scene, changes a canonical
  resource/place/entity/item/relationship, or supplies evidence/history; compact it into
  the true owner plus Ledger/Codex history and retain a graph reference if still live
```

Player attention may pin a referent and request validation; it may not create a favorable property. A question
about whether a cask contains oil resolves from its assembly/material-flow source, established evidence, an
engine-owned roll, or a bounded DM-invention proposal. If the property remains unknown, the knowledge record
may advance while the object's hidden mechanical truth remains protected.

Promotion to T2 occurs at the **pre-resolution contract boundary**, not after the prose. If a player declares a
consequential use, the planner must identify the target/tool/support/path, validate the needed capability facets,
and construct the `CheckContract` before dice. A no-roll deterministic manipulation still receives a typed
commit receipt if it changes state. If the DM needs one plausible connective detail, proposal, validation,
referent/facet creation, and consequence commit remain atomic in the same turn; narration follows the accepted
receipt.

##### Concrete traces

**Dungeon lamp-oil cask:** the storeroom assembly projects casks at T0. “Which cask feeds the lamps?” pins one
at T1 and may reveal its site-flow relationship without creating a leak. “I puncture it and spread the oil across
the threshold” forces T2 before the attack/tool check: cask identity, material, remaining supply, threshold
location, tool interaction, and stakes become explicit. The receipt creates the leak/spread if earned. If the oil
is cleaned before leaving, temporary active facts expire or become a small evidence record. If it burns the room,
depletes the site's lighting supply, blocks a route, or remains for a returning patrol, T3 projects those durable
effects to the room, flow, portal/path, witnesses, and history.

**Gemini snow and mace:** mentioning snow outside is T0. Choosing to roll a soaked character in it pins the
relevant snow zone and activates only the material/position interaction needed to dilute flammability and perhaps
add `chilled`; it does not instantiate or simulate every snowflake. The mace and vehicle already have item/entity
identity, so an embedding strike jumps directly through T2: the hit contract and receipt create the exact
`embedded_in` edge and hull state. A fuel line is neither discovered nor created after the roll merely because a
leak would be exciting; it must be pre-established or included in the pre-resolution validated invention. Any
later route, pursuit, or aftermath dependency makes the necessary outcomes T3.

##### Research and cost filter

This staged trigger follows the research more closely than a single promotion event. Tutenel's semantic objects
expose only typed features and compile relationships in dependency order; the dependent object does not gain
every imagined property. Hierarchical subproblems bound feature growth. Horswill and Foged preserve small
graph summaries at the scope where a guarantee matters. Green et al. keep architecture and furnishing stages
separate, while Henderson et al.'s a-posteriori-editing limitation warns against regenerating an already sampled
scene to honor a late mutation. The Genesis equivalent is a narrow, receipt-driven transition on the existing
owner.

T1 adds a low-cost reference/knowledge layer but needs per-scene caps, deduplication, and expiry so adversarial
inspection cannot pin thousands of nouns. T2 bears the medium validation and adapter cost only for active play.
T3 bears the expensive persistence, migration, digest, and reconciliation cost only when an actual dependency
or lasting consequence justifies it. The main maintenance risk is blurred thresholds: if adapters silently jump
from T0 to T3 or if “attention” manufactures properties, the staged model becomes nominal rather than real.

**Question for Adam:** choose or amend the trigger policy. The recommendation is Option 3: narration remains
T0; explicit attention pins only identity/source/location/knowledge at T1; any consequential dependency or
change must activate required facets at T2 before resolution; and only external dependencies or lasting canonical
effects reach T3. If accepted, the next follow-up is how T1/T2 facts expire, compact, or remain addressable after
the active scene without losing a later callback.

#### 10.G2.1.2 Ruling and follow-up - staged T0-T3 triggers accepted; how does cooled truth survive?

Adam chooses **Option 3, most definitely**. The trigger ladder is locked:

- T0 is ambient source-backed projection without a new SceneFact record;
- T1 pins identity, source, owner, location, observed description, and knowledge provenance when explicit
  attention singles out a referent;
- T2 validates and activates only the facets required by a consequential action, rule, threat, or receipt, before
  resolution;
- T3 projects any externally depended-on or lasting consequence into its canonical owners and durable history.

Attention may request validation but never manufacture a useful property. No-roll state changes still commit
through receipts. Same-turn connective DM invention is proposed and validated before consequential narration.

The next question is what “expiry” means. Ending a scene may remove a fact from the hot working set, but it
cannot make spilled oil unspill, return an embedded weapon, erase something the player learned, or destroy the
causal source of a later keepsake. Conversely, keeping every pin, temporary condition, and intermediate edge at
full active fidelity forever would eventually make the campaign its own performance and migration hazard.

##### Lifecycle options

**Option 1 - hard TTL and scene reset.** T1 pins disappear after an attention window; T2 facts disappear when
their declared duration or the current scene ends unless manually promoted to T3. This is cheap and easy to
project, but a generic scene boundary is not a physical cause. It would recreate game-world amnesia: an oil
spill vanishes when combat ends, a previously examined cask loses identity, and a player cannot later refer to
“the chain I wedged under the gate” unless a designer anticipated the callback.

**Option 2 - retain every promoted fact forever at full fidelity.** Every T1 identity and T2 intermediate remains
queryable as a live graph node with all facets and edges. This maximizes forensic continuity, but active lookup,
save size, migration, reconciliation, DM projection, and QA grow with every examined shelf and resolved stunt.
It confuses “the world remembers” with “every past detail stays in working memory.”

**Option 3 - typed lifecycle, owner fold, and dormant callback stub (recommended).** Active SceneFacts move
through an explicit lifecycle rather than generic deletion:

```text
live
  currently served to rules/DM/rendering and participating in dependencies

cooled
  no longer in the active scene slice, but awaiting typed expiry, reconciliation,
  owner-fold, or an already scheduled consequence

folded
  authoritative current state projected into the canonical item/place/entity/
  condition/relationship/resource owner; detailed intermediate graph edges closed

dormant
  compact callback stub preserves addressability and unresolved causal obligations

reactivated
  rebuilt deterministically from owner state + receipts/stub when an activation key fires

terminal
  consumed/restored/expired/resolved by its typed rule; active mechanics close while
  protected evidence, knowledge, history, and downstream provenance remain where required
```

Facts expire by typed cause, never merely because narration moved on:

1. **terminal transition** - consumed, removed, cleaned, repaired, extinguished, extracted, discharged, or
   otherwise resolved;
2. **clock/duration** - a declared time or cadence expires and commits its terminal state;
3. **dependency completion** - the last rule, promise, pursuit, route, evidence chain, or scheduled consequence
   that requires the live edge resolves;
4. **scope exit** - only facts whose contract explicitly says “scene/turn/encounter scoped” terminate here;
5. **owner fold** - a physical or social state that continues outside the active slice becomes cold canonical
   state on its true owner rather than remaining a hot SceneFact.

A dormant callback stub is not a prose summary alone. At minimum it retains:

```text
stable fact/referent id and type
canonical owner plus last authoritative location/state/time
source receipt and protected causal parents
unresolved dependencies, obligations, clocks, and terminal rule
observer knowledge/evidence boundary
activation keys and last projection summary
hardness/version reference needed for deterministic reactivation
```

High-volume intermediate details may compact into typed deltas or an event digest once no future rule depends
on them. Stable identity, current authoritative state, unresolved dependencies, player-earned knowledge,
promissory commitments, and provenance needed by evidence/rewards may not be summarized away. Reactivation
is triggered by returning to the owner/location, targeting the stable id, bringing a dependent entity into the
active slice, a due clock/front, or a scheduler/card whose prerequisites cite the stub. The engine rebuilds the
active facts from owner state and receipts; the DM does not reconstruct them from conversation memory.

##### Concrete traces

**Jail oil:** if the party cleans the spill before leaving, `leaking_oil` reaches a terminal state; the cask's
remaining volume and any witnessed/evidentiary consequence fold to their owners, while disposable puddle
geometry closes. If the oil remains, its quantity, location, affected threshold, cleanup/evaporation clock, and
flammable/slippery capabilities fold into the room/cask owners and a dormant stub. Returning to the room or a
guard patrol entering it reactivates the fact. If it burns, the temporary flame may expire while structural damage,
lost lighting supply, smoke evidence, witnesses, and history remain independently authoritative.

**Gemini mace and route:** if the mace is extracted during the same scene, the `embedded_in` edge terminates,
but item condition, hull puncture, fuel loss, and event provenance fold as earned. If the mace remains behind,
the item and vehicle share a durable relationship edge addressable from either owner. A solid-light route keeps
its endpoints, load/access rules, dependencies, and exact duration while live. When it expires, movement access
closes; any stranded positions, pursuit changes, witnesses, relationship payoff, or keepsake provenance remain.
The later reward can cite a compact causal digest without keeping the entire chase graph hot forever.

##### Research and cost filter

Tutenel et al. (2009) explicitly cite generating only visible rooms while tracking changes and reapplying them
when a room regenerates; their own hierarchical blocks likewise bound the active solve. Horswill and Foged show
that small graph summaries can preserve the guarantee relevant to a scope. Henderson et al.'s difficulty with
a-posteriori editing argues for storing narrow canonical deltas rather than resampling an old scene, while
Whitehead's growing solve-time tails warn against feeding accumulated cold constraints into every turn. The
existing Genesis versioned-commitment ruling supplies the deterministic reactivation precedent.

Option 3 has a **medium implementation cost** for lifecycle transitions, owner-fold adapters, dormant indexes,
activation routing, and traceable compaction. It has an ongoing **medium-low authoring cost** because every
temporary type needs a terminal/duration rule and every durable type needs an owner-fold mapping. It greatly
reduces hot-runtime and digest cost relative to Option 2 while preserving far more continuity than Option 1.
The maintenance danger is lossy compaction: if a future affordance, evidence chain, observer boundary, or reward
needs a field that was discarded, the callback becomes prose invention again. Acceptance traces must therefore
prove reactivation after many turns and save/load, not merely immediate reuse.

**Question for Adam:** choose or amend the lifecycle policy. The recommendation is Option 3: typed expiry,
canonical owner-fold, and a small dormant callback stub that preserves addressability and unresolved causality
without keeping cold facts in the active scene graph. If accepted, the next G2.1 follow-up is how the engine may
validate an unknown-but-plausible property - such as a fuel line behind the struck panel - without either denying
ordinary improvisation or allowing attention and DM convenience to create favorable facts retroactively.

#### 10.G2.1.3 Ruling and redirected follow-up - callback stubs feed a selective DM hand

Adam accepts Option 3 with an explicit strengthening: moving on may cool or fold a fact, but may not erase it
from the world. Some callback stubs should become cards in the DM's story hand so the originating noun or its
consequences can recur with greater significance. The DM should also be able to use eligible stubs to propose
related people, objects, evidence, consequences, or situations, building throughlines and cohesion rather than
resetting to unrelated content. Adam also identifies the necessary limit: **not every noun is viable**. This
eligibility boundary needs its own discussion before the previously queued unknown-property question.

The first clarification is architectural:

```text
world-memory stub
  cold canonical addressability; preserves what is true even when not in the DM's hand

callback card
  a relevance-filtered projection from an eligible stub into the existing narrative scheduler
```

These must not become synonyms. Every player-established T1+ referent remains reproducible through its source,
canonical owner, or persistence stub; every durable T2/T3 consequence receives the owner-fold/history needed to
prevent erasure. T0 ambient nouns remain reproducible from their seeded source without receiving individual
records unless attention or consequence promotes them. Only a qualified subset of the cold index becomes a
playable callback card. The card should preferably be a temporary projection/view over the stub, not a second
permanent copy of its truth.

##### Callback-eligibility options

**Option 1 - every persistence stub becomes a DM card.** This guarantees recurrence opportunities, but the hand
would fill with every examined spoon, door hinge, intact cask, incidental footprint, and answered question. The
DM digest would become a campaign database query rather than a dramatic hand; repeated callbacks would feel
compulsive and contrived, and the existing saturation/priority laws would be defeated.

**Option 2 - only hand-authored callback flags become cards.** Authors mark nouns or fact types as callback-worthy
in advance. This keeps the hand clean and gives precise tone control, but cannot recognize the core Gemini
pattern: an ordinary prop became important because of what the players did with it. It makes player-authored
significance subordinate to pre-authored significance.

**Option 3 - broad memory, rule-qualified callback candidacy, opportunity-time card projection (recommended).**
The world remembers every promoted referent/fact at the fidelity its tier requires. A stub becomes eligible for
the DM hand only when it passes hard legality gates and earns sufficient contextual salience. Even then, the
engine projects a card only when a current or approaching opportunity can play it legally.

Hard candidacy gates:

1. **canonical source** - the stub/owner and its current or terminal state are authoritative, not a discarded
   adjective or unsourced DM recollection;
2. **callback substance** - recurrence can expose a real state, consequence, relationship, evidence trail,
   unresolved dependency, earned reward root, or meaningfully distinctive history;
3. **typed connection path** - the proposed opportunity connects through the same object, actor, place, group,
   witness, material/resource flow, lineage, dependency, causal descendant, or separately governed motif;
   free semantic association is insufficient;
4. **scope and knowledge legality** - geography, time, access, observer knowledge, ownership, and current
   terminal disposition permit the callback form;
5. **available recurrence budget** - the stub is not exhausted, on cooldown, superseded, or already paid off in
   the same way;
6. **projection fit** - the callback can create a handle, reaction, payoff, pressure, evidence beat, or coherent
   texture without displacing a higher-priority player action, due consequence, or service obligation.

Salience rises when the player named, selected, reused, carried, sacrificed, repaired, or deliberately returned
to the referent; when it changed a roll, resource, position, outcome, relationship, or route; when it generated
cost, risk, witness, evidence, a promise, or an unresolved clock; when a crit or rare transformation made it
distinctive; and when later player attention confirms that it remains meaningful. Salience falls when the noun
was generic, merely observed, indistinguishable from its family, fully resolved without evidence or relationship,
repeatedly declined, recently paid off, or would require a conspicuous coincidence to reintroduce.

Callback candidacy is not one permanent boolean. A stub can remain history-only, enter `RESERVE`, rise to
`PLAY IF FIT`, become `PLAY SOON` through renewed player engagement, or become `MUST PLAY` when an unresolved
clock, contract, direct consequence, or player demand makes it due. This reuses the accepted priority hand:

```text
MUST PLAY    due dependency/consequence or player-demanded return
PLAY SOON    fresh high-salience callback with a legal near-term opportunity
PLAY IF FIT  qualified throughline whose relation matches the present scene
RESERVE      meaningful but currently cold callback candidate
HISTORY ONLY addressable world truth, not currently a narrative card
```

The existing causal-bundle and saturation laws still apply. Several manifestations of one stub or consequence
bundle count as one situation, and the DM sees a thin hand rather than every eligible candidate. Per-stub mode
budgets, cooldowns, diminishing priority after payoff, and player-attention refresh prevent a beloved object from
becoming a narrative black hole. A callback may be significant without being mechanically stronger; recurrence,
recognition, evidence, inconvenience, relationship, or transformation can carry meaning without escalating loot
or danger.

##### Concrete viability traces

**Ordinary spoon:** the player asks about a spoon, so its identity/knowledge can remain addressable. If they put
it down and nothing depends on it, the stub is history-only. If they use it to expose poison, improvise a key,
save an NPC, name it, or keep carrying it, the resulting evidence, relationship, item history, or repeated use can
qualify it for `RESERVE` or `PLAY IF FIT`. The ontology does not declare “spoons are callback-worthy”; play does.

**Jail oil:** merely seeing an intact interchangeable cask produces no DM card. Depleting the lighting supply,
burning a threshold, leaving identifying soot, alerting guards, or creating an owed repair produces callback
substance and typed connection paths. A future darkened cellblock, suspicious quartermaster, patrol reaction,
supplier record, or scarred doorway could become a legal opportunity, subject to the next follow-up's exact
related-generation authority.

**Gemini mace:** the embedded mace qualifies strongly because a player-owned item changed position, damaged a
vehicle, caused a leak, enabled later cooperation, attracted witnesses, and helped produce the escape and
relationship payoff. Possible cards can recall the same item, its hull scar, an NPC nickname/story, later
recognition, repair consequences, or provenance-driven keepsake. The engine still cannot revive an expired
solid-light route or relocate a witness merely to force the callback.

##### Research, implementation, and maintenance filter

The procedural papers support the representation boundary more than the narrative scheduler. Tutenel's
semantic classes, services, materials, features, and explicit relationships support typed connection paths and
context-specific reuse; they do not license arbitrary association between nouns. Hierarchical blocks and
dependency ordering support projecting a small relevant subproblem instead of serving the full index. Green et
al.'s staged generator reinforces that the callback layer should consume canonical owners rather than rewrite
architecture or furnishing. No scanned paper establishes a dramatic callback-deck policy; the existing Genesis
priority hand, promissory-card ladder, causal-situation bundling, and saturation laws are the direct authorities
for that portion of the recommendation.

Option 3 adds a **medium implementation cost** for candidacy gates, salience events, opportunity matching,
cooldowns/budgets, and card projection into the existing scheduler. Its content cost is **medium-low at the
eligibility layer** if connection types and salience events are factorized rather than authored noun by noun.
Related-generation recipes will add a separate content and QA cost in the next decision. The chief maintenance
risks are false negatives that bury player-created meaning, false positives that make every touched prop recur,
and feedback loops in which a callback gains salience merely because the DM played it. Player engagement and
real consequences may refresh salience; DM repetition alone may not.

**Question for Adam:** choose or amend the eligibility policy. The recommendation is Option 3: preserve every
promoted truth through its owner/stub, but place only rule-qualified, contextually legal, sufficiently salient
stubs into the DM's existing priority hand at opportunity time. Is the proposed viability test the right boundary,
especially the rule that player-created significance can qualify an otherwise ordinary noun while mere DM
repetition cannot? If accepted, the next follow-up will decide exactly what a callback card may authorize the DM
to create *related to* its source stub, and which connections remain texture, proposals, engine-owned rolls, or
forbidden retcons.

#### 10.G2.1.4 Ruling and follow-up - selective callback eligibility accepted; what related growth may a card license?

Adam accepts Option 3 and its viability boundary. World memory remains broad; the DM's playable hand remains
selective. Player-created consequence can qualify an ordinary noun, while mere repetition by the DM cannot make
the DM's own callback increasingly salient. Callback cards are opportunity-time projections over canonical
owners/stubs and use the existing priority/saturation scheduler.

The next decision is the creative authority inside one of those cards. Adam wants the DM to use viable stubs not
only to replay the original noun, but also to create related material that produces throughlines and greater world
cohesion. The danger is that “related” ranges from a deterministic consequence to a loose aesthetic association;
if those share one permission, a callback card becomes authority to retcon anything into relevance.

##### Related-growth options

**Option 1 - recall only.** A callback card may reproject the same object, scar, witness, fact, or unresolved clock,
but may not generate a new related person, object, place, consequence, clue, relationship, or reward. This is
maximally safe and cheap. It preserves continuity but produces a small-feeling world: the burned door can recur,
yet the lighting shortage cannot affect new scenes and nobody may react unless they were fully generated earlier.

**Option 2 - free associative DM expansion.** The card gives the DM authority to invent any semantically or
thematically related material. Oil may produce a supplier, investigator, fire cult, scorched map, family history,
or convenient new cask whenever the DM sees a narrative opportunity. This maximizes spontaneity but collapses
the engine-owned-nouns law, permits retroactive convenience, confuses metaphor with causality, and creates
recursive state growth whose provenance, scope, knowledge, and power cannot be tested reliably.

**Option 3 - typed relation-growth envelope with four authority lanes (recommended).** A callback card does not
itself mint arbitrary canon. It licenses a bounded generation request rooted in the source stub. The card declares
which relation modes are legal, which canonical owner must receive the result, how much new canon/mechanical
impact is available, which lane resolves it, and what must not be retconned.

The four authority lanes are:

```text
REPLAY
  project existing owner/stub truth; create no new canon

DERIVE
  apply an authored deterministic consequence/reaction from current state;
  commit the resulting owner deltas and receipts

ROLL
  invoke an engine-owned table/generator/cast/flow/reward adapter inside the
  card's typed relation and scope budget; the engine owns the new nouns

PROPOSE
  DM supplies a bounded low-impact connective candidate where no authored
  result covers the situation; validator accepts/rejects/amends it and commits
  before consequential narration
```

`PROPOSE` is not a bypass. A proposal cannot create a high-impact resource, NPC, route, hidden property,
mechanical advantage, secret truth, terminal outcome, or campaign-scale relationship without moving through
an appropriate engine-owned roll/adapter. The DM may choose the dramatic role - “let the burned threshold create
a social reaction now” - while the engine determines which existing or newly rolled witness, guard, claimant,
or institutional role legally fills it.

##### Typed relation modes

A viable stub may expose some subset of these modes:

1. **direct recurrence** - the same object, actor, place, scar, condition, or relationship returns;
2. **causal consequence** - resource loss, obstruction, repair, contamination, pursuit, operational strain,
   institutional response, or another effect follows from current state;
3. **evidence and knowledge** - witness testimony, tracks, residue, records, recognition, rumor, mistaken belief,
   investigation, or revelation grows while preserving observer boundaries;
4. **provenance and network** - maker, supplier, prior owner, maintainer, claimant, destination, sibling object,
   contractual link, or regional dependency expands through an existing/latent network owner;
5. **social reaction and cast** - a roster role or connected population supplies someone who remembers, wants,
   fears, repairs, imitates, condemns, or bargains over the source fact;
6. **transformation and descendant affordance** - a scar, adaptation, copied technique, repaired form, derivative
   tool, new route, or changed operating practice follows through a typed transformation recipe;
7. **pressure/front continuation** - an unresolved consequence becomes or advances a clock, pursuit, shortage,
   dispute, obligation, or retaliatory response;
8. **reward/keepsake payoff** - a bounded reward envelope consumes event, participant, relationship, and motif
   provenance to mint an item, title, contact, technique, map, or story tool;
9. **motif/analogy echo** - the DM may reuse imagery, phrasing, humor, fear, or aesthetic shape as texture through
   the separate `Motif/CallbackDeck`; this creates no causal or mechanical relationship by implication.

The distinction between **causal**, **provenance**, **social**, **evidentiary**, and **motif** edges is mandatory.
Two things may rhyme without sharing an origin. A related image may be free narrative texture; a shared supplier,
witness, bloodline, material flow, or mechanical capability must be validated canon.

Each projected card should minimally contain:

```text
source stub/owner and current or terminal state
why it qualified and current priority
allowed relation modes and required destination owners
eligible scopes, actors, opportunities, and knowledge boundaries
authority lane per mode (REPLAY/DERIVE/ROLL/PROPOSE)
new-canon count/band and mechanical-impact ceiling
required table, adapter, recipe, or validation contract
must-preserve invariants and forbidden retcons
recurrence/mode budgets, cooldown, expiry, and payoff state
result receipt plus descendant eligibility rule
```

##### Growth and anti-contrivance laws

1. A card authorizes **a relation request**, not a predetermined favorable result.
2. Every new fact receives its own canonical owner and a typed provenance edge back to the source stub.
3. New related nouns do not automatically inherit the source's salience, callback budget, or priority. They must
   earn viability through player engagement, consequence, or an unresolved hard dependency.
4. A callback cannot create a property after seeing the roll whose stakes depended on that property. The queued
   unknown-property follow-up still owns that pre-resolution boundary.
5. Terminal facts recur only through legal residue, evidence, history, relationship, motif, restoration, or
   transformation. The DM cannot physically replay a consumed object or expired route without a real return path.
6. Geography, time, access, cast position, observer knowledge, resource quantities, and site/room legality remain
   authoritative. A witness cannot appear where they never were; a supplier does not imply stock at the next site.
7. Related growth enters the existing causal-bundle and saturation vector. A chain may deepen one situation but
   may not bypass projection capacity or due higher-priority cards.
8. Per-card and per-root growth budgets prevent recursive callback fractals. Player pursuit may deliberately
   deepen the root; DM enthusiasm alone may not.
9. Related generation may increase meaning without increasing mechanical power, threat scale, rarity, or Spice.
10. No callback decides a player action, feeling, attachment, or interpretation. It offers a real handle and lets
    the player decide whether the throughline matters.

##### Concrete relation traces

**Jail oil:** `REPLAY` can show the same scorched threshold or depleted cask. `DERIVE` can propagate an already
owned lighting shortage into darker cells or a repair task. `ROLL` can ask the population/cast owner for the legal
staff role who notices, the flow/network owner for a supplier or delivery record, or the evidence owner for how
the oil/fire was traced. `PROPOSE` may contribute a low-impact detail such as the quartermaster's distinctive
counting marks if validated and captured. Provenance may generate a supplier relationship; it does not place a
convenient oil cask in the next boss room. A guard accusation requires knowledge/evidence; the DM cannot choose
an unrelated rival as culprit for dramatic convenience.

**Gemini mace:** direct recurrence can show the same mace, hull puncture, or repaired scar. A causal descendant
may be a reinforcement plate or altered piloting practice; a social reaction may come from a tracked passenger,
pursuer, owner, or repair crew; evidence may let someone recognize the vehicle; a keepsake envelope may recall
the cooperation and escape. A motif echo may reuse the visual idea of an anchor without claiming that every
vehicle shares the same fuel-line vulnerability. The mace cannot teleport between owners, and an expired route
cannot return as physical access merely because its imagery is satisfying.

**Ordinary spoon:** if the spoon exposed poison, an evidence card may lead to residue analysis, a witness who saw
the serving, or a provenance roll for the kitchen/cutlery owner. A motif echo might let a later NPC jokingly call
another improvised tool “the royal spoon.” None of those permissions automatically create a poison conspiracy,
the culprit, or a magic spoon; those require the appropriate secret, cast, item, and resolution owners.

##### Research, implementation, and maintenance filter

The scanned procedural papers again support the relation contract rather than the dramatic policy itself.
Tutenel et al. (2009/2010) attach materials, services, features, class relationships, scene-specific overrides,
context, and dependency ordering to explicit semantic owners; this is a strong model for typed relation modes and
compiled authority lanes, not for free association. Horswill and Foged require an explicit graph and declared
scope before propagating a guarantee. Green et al. show why independent stages should consume previous output
rather than rewrite it. Henderson and Whitehead warn that accumulating simultaneous late constraints increases
runtime and can produce difficult tails; relation growth must therefore be budgeted and projected into bounded
active slices. None of these papers proves a narrative throughline generator, so Genesis's accepted engine-owned
nouns, card scheduler, causal bundles, promotion receipts, and saturation laws remain controlling authority.

Option 3 has a **medium-high implementation cost** for a relation registry, card envelopes, authority-lane
routing, owner adapters, budgets, and transactional receipts. Its **content cost is medium to high** because each
site/prop/material/relationship family needs reusable relation recipes and honest negative cases. Runtime remains
bounded because only cards in the thin opportunity-time hand invoke growth. The largest long-term cost is not
storage but interaction QA: factorized types avoid Cartesian code, yet important combinations still need authored
expectations and golden traces. Tests must prove both cohesion and restraint - meaningful descendants recur,
while unrelated convenience, recursive salience inheritance, witness teleportation, motif-as-causality, and
post-roll property invention fail loudly.

**Question for Adam:** choose or amend the related-growth policy. The recommendation is Option 3: callback
cards license typed, budgeted relation requests through `REPLAY`, `DERIVE`, `ROLL`, or validated `PROPOSE`, with
the nine relation modes above and no automatic salience inheritance for descendants. Does this give the DM enough
creative authority to build surprising throughlines, or should the DM have more direct authority over any lane or
relation type? If accepted, the next follow-up will decide whether related growth may ever establish a new root
with its own independent future, and exactly what event makes that descendant stop being “part of the callback”
and become a first-class story thread.

#### 10.G2.1.5 Foundational authority challenge - mechanize commitments, not imagination

Adam provisionally likes the typed relation-growth direction but raises the decisive product question: how much
room remains for the actual DM seat? Mechanizing facts, items, effects, cards, relations, and receipts is useful and
necessary, but if the engine also chooses every noun, connection, consequence, and reward, the AI DM eventually
becomes a prose renderer for a procedural story machine. That would discard one of Genesis's central advantages:
an AI DM can invent an exact, surprising answer that no static item database or prewritten callback recipe contains.

The paired communication keepsakes from the Gemini reference are the concrete test. Their identity, form, and
relationship meaning were invented because they served what the players and NPCs had just accomplished. They
did not need to pre-exist as a catalog row. Once invented, however, they needed exact holders, item identity,
capabilities, limits, provenance, persistence, visual representation, and callback hooks. Adam wants that creative
DM move retained and made real, not replaced with a generic rolled trinket.

This concern is already constitutional. `DM-CHARTER.md` section 8.5 says that interpreting anti-drift as “the AI
must never invent” is wrong and wastes the best thing about an AI DM. Its law is **invention is licensed, but
captured**: mechanize first where the script has objective authority; when the DM invents, immediately enter the
result into Codex/events/Ledger/other owners so it becomes durable canon. `ITEMS.md` already specifies that a
bespoke DM-invented enchantment may be captured as a per-instance overlay. The recent callback wording therefore
needs clarification, not a retreat from mechanization.

##### The key correction to “the engine owns the nouns”

“The engine owns the nouns” must mean:

> No consequential noun may exist only in prose. The engine owns its canonical instantiation, identity,
> objective mechanics, authority, custody, state, persistence, and reconciliation.

It must **not** mean:

> Every noun idea must originate in a static table or be selected by deterministic code before the DM may
> imagine it.

The June 30 ruling remains valuable for nouns whose independence creates play. A newly encountered NPC should
normally be rolled because flaw, bond, fear, leverage, want, and motive prevent the DM from inventing a bespoke
helper whose psychology conveniently serves the current scene. A room, hidden property, stock level, clue, or
ordinary treasure likewise needs independent source authority. But an earned keepsake, exact consequence form,
title, technique, relationship token, callback transformation, or connective explanation has a different job:
its bespoke fit to established play is the point.

A useful source test is:

```text
resistance-bearing noun
  should surprise or constrain the DM independently -> roll/derive the substrate first

expression-bearing noun
  embodies earned play, interpretation, relationship, or consequence -> DM may synthesize

hybrid noun
  engine supplies envelope/substrate; DM authors exact identity, form, meaning, and proposed function;
  engine compiles and validates the final instance
```

##### DM-seat options

**Option 1 - catalog director/narrator.** The engine rolls or selects every NPC, place, item, callback descendant,
effect, and reward. The DM chooses presentation, pacing, dialogue, and perhaps which optional card to play. This
maximizes determinism and simple testing, but the DM seat is not genuinely creative. The paired comms can exist
only if a table author anticipated them or a generic result happens to approximate them. Over time the DM becomes
replaceable by templates plus a scheduler.

**Option 2 - sovereign DM with post-hoc capture.** The DM freely invents nouns and mechanics, narrates them, then
the engine records whatever it can. This preserves inventiveness but recreates Gemini's failures: mechanics may
be impossible to encode, power may exceed the earned envelope, state may contradict canon, and the player may
read a successful invention before validation rejects it. Post-hoc capture is too late for consequential truth.

**Option 3 - transactional creative DM with a semantic compiler (recommended).** The DM may originate exact
creative content through a new explicit `SYNTHESIZE` lane. The engine provides current truth, due obligations,
available envelopes, mechanics vocabulary, and visual library; the DM authors what the invention *is for*, what
it means, its exact form/identity, and proposed capabilities. The engine then compiles, constrains, and commits it
before consequential narration. Validation harnesses invention; it does not substitute a random noun for the DM's
idea merely because the idea was not in a database.

The callback authority lanes become:

```text
REPLAY       project existing truth
DERIVE       apply an authored consequence from current state
ROLL         let the world supply an independently generated noun/result
PROPOSE      offer a bounded connective fact/detail for validation
SYNTHESIZE   DM authors a novel expression-bearing noun or structured effect inside a creation envelope;
             engine compiles mechanics/ownership/persistence/visual binding and commits it
```

`SYNTHESIZE` is not limited to callback cards, although callbacks are a major source of its authority. It may also
be licensed by an earned reward, Crit mandate, relationship payoff, transformation, quest resolution, adjudicated
creative action, connective-weirdness budget, or another typed creation envelope. It is not a general permission
to fill hidden rooms, convenient inventories, NPC motives, or unknown properties with whatever best serves the
DM's immediate plan.

##### What the creative DM seat still owns

Even in a deeply mechanized Genesis, the DM remains responsible for:

- deciding what established facts mean together and which surprising throughline is worth proposing;
- selecting among optional cards, deferring them within service laws, and composing compatible facts into one
  dramatic situation;
- inventing names, forms, symbolism, voices, motives-in-action, misunderstandings, relationship expressions,
  exact reward concepts, and connective explanations where licensed;
- choosing NPC strategy and performance from canonical motives rather than following a fixed plot;
- proposing complication/payoff forms inside receipts and creation envelopes;
- interpreting rolls, pacing revelation, honoring quiet, escalating or releasing pressure, and deciding how
  consequences feel without changing what the dice/state established;
- creating expression-bearing nouns, artifacts, techniques, titles, scars, rituals, rumors, and callbacks whose
  specific fit to play gives them value;
- narrating the resulting world with taste, humor, emotional judgment, sensory intelligence, and responsiveness
  no procedural scheduler can reduce to a complete table.

The engine owns whether the proposal is licensed, what it may mechanically do, whether it contradicts truth,
which objective owners change, and whether it was actually committed. The DM remains the author/director; the
engine is world physics, rules referee, semantic compiler, and perfect ledger.

##### Novel-item synthesis contract

A DM-authored item need not exist in the static item database. The database should contain reliable base types,
effect primitives, power bands, materials, conditions, presentation tags, and visual assets - a vocabulary and
library, not the complete set of possible final artifacts.

A proposed `InventionProposal` may contain:

```text
creation authority and source receipts
story function, intended emotional payoff, and relation/callback root
proposed name, form, motif, material, realm skin, and appearance
intended holders/custody and whether instances are linked as a set
desired capabilities/effects expressed in semantic terms
proposed limits: range, duration, charges, action use, targets, stacking, recovery
visual search/generation tags and required readable states
future reaction/callback hooks
```

The engine supplies a `CreationEnvelope`:

```text
tier/rarity/power and mechanical-impact ceilings
allowed effect primitives and combination budget
base type/story-tool category or legal custom-instance form
resource/action/attunement/charge/range/duration constraints
ownership, knowledge, provenance, and item-group requirements
asset-library domain, fallback strategy, and future exact-generation permission
forbidden contradictions, unsupported effects, and IP/shipping boundary
```

The accepted `CreationReceipt` mints stable instance ids, a linked-set/group id where needed, base/custom
mechanics, enchantment/effect overlays, codex provenance, custody, relationship hooks, visual binding, and
reconciliation rules. If a desired mechanic exceeds the vocabulary or budget, the engine should preserve the
DM's concept while negotiating the closest honest supported expression or invoking the rare novel/high-impact
ruling path. It should not silently turn the invention into a different generic item.

##### Paired-comms trace

After the cooperative escape, the DM decides that the relationship payoff should be a pair of communicators whose
form commemorates the allies and whose function rewards staying coordinated. That exact concept is DM-authored;
no `paired-comms` catalog row is required.

The engine verifies the earned reward envelope and existing participants, then compiles:

- two stable item instances plus one linked-set relationship;
- exact holders/custody and provenance to the shared escape;
- a bounded communication capability and any coordinated benefit allowed by the power envelope;
- range, duration, charges/recovery, action requirements, stacking, transfer, loss, breakage, and attunement if
  relevant;
- Codex text hooks and future callback/reaction handles;
- a sprite selected by semantic tags from the available item-art library, with a deterministic fallback;
- later, an exact no-human asset-generation request conforming to the slot's silhouette, dimensions, palette,
  state variants, background/transparency, and art-direction contract.

The DM may propose the mechanics as well as the fiction. The engine does not have to accept an unbounded benefit,
but it should preserve the intended play pattern - paired communication and coordination - while fitting it into
the earned envelope. A static database supplies components and comparable baselines; it does not define the outer
limit of what the DM can create.

##### Research and cost filter

This correction is unusually well aligned with the downloaded procedural corpus. Tutenel et al. (2010) begin from
the observation that designers think about **what a scene is**, not the algorithm for placing it, and compile that
semantic description into a valid procedure. Tutenel et al. (2009) leave control of plans and class knowledge with
the designer while the solver realizes legal placement. Merrell et al.'s mixed-initiative system lets the human fix
meaningful furniture decisions while the optimizer proposes arrangements around them. Whitehead lets designers
declare intent and requires the solver to satisfy it or report impossibility. These papers do not prove an AI-DM
invention protocol or novel-item mechanic compiler, but they strongly support the division: preserve creative
intent at the high-level semantic boundary; mechanize legality and realization beneath it.

Option 3 carries a **high implementation cost**: creation-envelope schemas, a compositional effect vocabulary,
power/stacking validators, custom item instances, linked-item sets, Codex/event/persistence integration, visual
asset search, fallbacks, and a later governed image-generation pipeline. Content maintenance shifts from trying to
pre-author every artifact to maintaining reusable primitives, examples, and incompatibilities. That is still a
large job, but it scales with the grammar rather than the number of imaginable final items. The dominant QA risk
is a mechanically legal composite that is situationally broken; tier fixtures, adversarial combinations, and long
callback traces remain necessary.

The alternative cost is product-level: if Genesis mechanizes away the AI's ability to originate exact artifacts,
consequences, and connective inventions, it may become consistent but cease to be the game the Gemini reference
proved was worth building.

**Question for Adam:** choose or amend the DM-seat policy. The recommendation is Option 3 and the new
`SYNTHESIZE` lane: the engine owns canonical instantiation and enforcement, not exclusive ideation. In particular,
may the DM originate the exact identity, form, story purpose, and proposed mechanics of a novel item such as the
paired comms, with the engine required to compile/validate/persist that concept inside an earned envelope rather
than replace it with a rolled catalog item? If accepted, the next follow-up should define the creation-envelope
bands - what the DM may synthesize freely as connective canon, what requires an earned reward/crit/relationship
authority, and what must still begin from an independent engine roll because resistance rather than expression is
the noun's job.

#### 10.G2.1.6 Ruling and follow-up - transactional creative DM accepted; where do creation envelopes begin?

Adam accepts Option 3 and the `SYNTHESIZE` lane. The DM may originate the exact identity, form, story purpose,
and proposed mechanics of a novel expression-bearing noun such as the paired comms. The engine must compile,
validate, bind, and persist that concept inside an earned envelope rather than replacing it with a random catalog
result. Mechanization owns commitments and enforcement, not imagination.

The next question is how authority is granted. A single ceiling such as “the DM may invent Minor items but not
Major ones” is insufficient: an apparently ordinary forged letter may create more campaign leverage than a magic
trinket, while an emotionally important paired communicator may have modest mechanics. Likewise, “items yes,
NPCs no” misses hybrid cases such as an existing population supplying an independently rolled quartermaster whose
exact reaction and relationship token are DM-authored.

##### Envelope-allocation options

**Option 1 - one universal invention-impact ceiling.** Give the DM a single current budget and allow any invented
noun/effect below it. This is easy to explain but treats mechanical power, canonical reach, hidden knowledge,
social leverage, topology, scarcity, and narrative obligation as interchangeable. It encourages arguments over
one score and lets low-stat facts cause high-story consequences without the proper owner.

**Option 2 - hard permission by noun category.** For example: the DM may invent items, titles, and sensory details;
NPCs, places, clues, secrets, and routes must be rolled. This is safer, but too rigid. A DM-authored item can still
break the economy; a DM-authored title may transform law; a rolled keepsake may lose its earned meaning; and most
good throughlines combine several noun families.

**Option 3 - two-axis creation matrix: source posture x impact band (recommended).** First decide whether the
noun's job is expression, resistance, or a hybrid. Then apply the impact band licensed by the source event. This
preserves DM authorship where bespoke fit is valuable while keeping independent world facts genuinely
independent.

##### Axis A - source posture

```text
EXPRESSIVE
  Exact identity/form/meaning is the creative payoff. DM may originate the concept;
  engine validates and instantiates it.

RESISTANT
  The noun must surprise, constrain, or exist independently of the DM's immediate need.
  Engine roll/seed/owner resolution comes first; DM connects, interprets, names where permitted,
  performs, and may synthesize downstream expression.

HYBRID
  Engine supplies substrate, truth, power envelope, or independent actor; DM authors exact
  expression, relationship form, consequence shape, and proposed supported mechanics.
```

Ordinary population, NPC motives/levers, undiscovered rooms, hidden properties, stock/resource quantities,
treasure availability, secret truth, hostile plans, and random world opportunities are normally `RESISTANT`.
Keepsakes, earned titles, exact scars, relationship tokens, commemorative techniques, consequence metaphors,
callback transformations, and connective explanations are normally `EXPRESSIVE` or `HYBRID`. Classification is
by the noun's current job, not an eternal class rule: a rolled mundane mace can later become the expressive root
of a synthesized technique or keepsake.

##### Axis B - impact bands and their licenses

**C0 - performance and noncanonical presentation.** No new consequential noun or world assertion. Voice,
sentence rhythm, metaphor, sensory emphasis already licensed by canonical state, NPC performance, camera focus,
and temporary wording live here. No receipt is required unless the wording asserts a persistent fact. C0 cannot
smuggle in manipulable objects, hidden information, ownership, conditions, or mechanics.

**C1 - local connective capture.** Context alone licenses a small synthesized detail inside an existing owner or
prevalidated latent reserve. It may add an exact appearance, harmless inscription, nickname, ordinary local
custom, minor relationship expression, low-impact prop form, or state-consistent connective explanation. It must
not create scarce inventory, strategic leverage, a clue/secret, a new independent actor, topology, resource
capacity, or a mechanical benefit. Persistent C1 facts are still captured. If a tally mark on a cask implies fraud
or becomes evidence, it no longer fits C1 and must seek C2 authority.

**C2 - earned expression and bounded story tool.** Requires a callback, relationship payoff, quest/contract beat,
meaningful consequence, ordinary reward envelope, resolved discovery, or comparable source receipt. The DM may
synthesize a new keepsake, paired/set item, title, contact form, rumor vehicle, bounded technique, evidence
presentation, scar/adaptation, or other expression-bearing noun with modest typed mechanics and limited canonical
reach. Paired comms live here in ordinary play. The exact concept is DM-authored; the engine supplies and enforces
the tier/power, effect, custody, knowledge, persistence, and visual constraints.

**C3 - major structural or mechanical creation.** Requires explicit Major reward, finale/quest transformation,
high Crit mandate, major relationship or faction change, licensed topology/event authority, or another named
creation source. It may create a significant magic item, durable route, institutional doctrine, settlement-scale
resource change, new active front, powerful technique, or relationship/network structure. Appropriate world
owners and independent rolls still supply resistance-bearing actors, hidden truth, and quantities. C3 is not
available merely because a callback would be dramatic.

**C4 - Mythic/Worldbreaker creation.** Requires the exact Crit Magnitude reach profile and effect/lens authority
already accepted for campaign-changing creation. It may establish artifacts, formulas, offices, routes, regional
laws/effects, or other permanent change at the licensed reach. Conservative Mythic and opt-in Worldbreaker remain
distinct; the DM cannot voluntarily promote an ordinary beat to C4. Typed terminal disposition, continuity, and
aftermath rules still bind the result.

The bands are not a ladder the DM climbs through persuasive prose. Each comes from a source receipt/envelope.
Within an authorized band, the DM has broad semantic authorship; the engine may constrain mechanics and illegal
reach but should preserve the concept's intended play pattern and meaning.

##### Worked authority comparisons

**Paired comms after the cooperative escape:** `EXPRESSIVE/HYBRID + C2`. The relationship/reward receipt licenses
a paired story tool. The DM authors the exact identity, commemorative form, intended communication/coordination
play pattern, and proposed mechanics. The engine sets power, range, action/charge/stacking limits, mints linked
instances, binds holders/provenance, and selects or later generates visuals. No prior item-database row is needed.

**A quartermaster reacts to the burned jail:** the person is `RESISTANT`; the population/roster owner selects or
rolls who occupies the relevant role and supplies independent motives/levers. The reaction form is `HYBRID C1/C2`
depending on consequence: the DM may perform irritation and invent a state-consistent counting habit at C1; an
accusation, debt, investigation, or relationship change requires C2 evidence/consequence authority. The DM may not
invent an ideally corrupt quartermaster because that best serves the callback.

**Supplier records connect the oil to a regional network:** the existence and contents of records, supplier,
quantities, and culpability are `RESISTANT` and use flow/network/evidence owners. The callback card may request the
connection and the DM may synthesize presentation, name/form where allowed, and connective meaning around the
rolled truth. It cannot choose the guilty party first and backfill records.

**The scorched doorway becomes “the Black Gate”:** a nickname and local story may begin as `EXPRESSIVE C1` if it
only records how people refer to the existing scar. If the title becomes a rallying symbol, changes faction
identity, creates reputation, or licenses mechanical/social leverage, it requires C2 or C3 authority as the reach
grows. One wording does not silently acquire institutional power.

**A Mythic antidote or world-changing key:** `EXPRESSIVE/HYBRID + C4` only when an eligible magnitude receipt
licenses those creation lenses. The DM may author the astonishing exact form and meaning; the engine commits the
reproducible formula, access law, affected scopes, evidence, owners, and campaign consequences. Worldbreaker
configuration cannot be bypassed through ordinary `SYNTHESIZE`.

##### How this keeps the DM seat large

The matrix constrains *where authority comes from*, not the number of ideas the DM may have. A normal turn can
contain unlimited C0 performance, a small amount of C1 capture where context permits, and any due/earned C2-C4
envelopes. The DM can propose beyond the current envelope; the engine must route the proposal to a roll,
clarification, deferred promise, progress path, or honest refusal rather than treating “not currently licensed” as
“never imaginable.”

The DM may also decide not to spend an optional expressive envelope immediately. It can hold a reward form,
callback synthesis, or relationship token until a better legal beat within the service horizon. The engine tracks
the obligation and budget without selecting the final creative answer in advance. This preserves actual direction
and taste rather than turning envelopes into vending-machine outputs.

##### Visual-library and generation implications

Every accepted C1-C4 physical/item synthesis emits semantic visual requirements alongside mechanics: object
family, silhouette, scale, mount/held/carried role, material, realm skin, palette, readable state variants,
orientation, slot dimensions, background/transparency, and provenance motifs. The resolver first searches the
large approved sprite/item library, may compose compatible approved parts where legal, and uses a deterministic
fallback that preserves mechanics. A future exact-generation lane may create the missing bespoke slot image from
the same receipt and art-direction contract. Visual absence cannot block canon or let the renderer substitute a
mechanically different object.

##### Research, implementation, and maintenance filter

Tutenel et al. (2010) separate high-level `what` from compiled `how` and allow context-specific changes to
semantic descriptions; this supports source posture plus impact constraints. Tutenel et al. (2009), Yu et al.,
and Merrell et al. distinguish hard legality from weighted/designer-controlled composition. Mixed initiative lets
the creative author fix meaningful choices while the solver handles validity around them. Whitehead's declarative
solver shows the need to report unsatisfiability honestly rather than silently changing intent. Henderson et al.'s
constraint-cost results warn that many simultaneous envelope dimensions can multiply runtime; common C1/C2
combinations need compiled fast paths while rare C3/C4 synthesis may tolerate preflight.

Option 3 has a **high architecture cost** but a manageable authoring shape: maintain envelope sources, semantic
effect/relationship primitives, incompatibilities, representative fixtures, and visual tags rather than every final
noun. Runtime cost should be low for C0/C1, bounded for compiled C2 patterns, and explicitly higher for rare C3/C4
preflight. The main maintenance risks are impact laundering across several “small” C1 facts, misclassifying a
resistance-bearing noun as expressive, and engine corrections that technically validate an item while destroying
the DM's intended play pattern. Receipts must record the requested intent and any negotiated change so QA can
detect that failure.

**Question for Adam:** choose or amend the envelope policy. The recommendation is Option 3: source posture
(`EXPRESSIVE`, `RESISTANT`, `HYBRID`) crossed with impact bands C0-C4, where paired comms ordinarily use an
earned C2 envelope and independent NPC/place/secret/resource facts remain resistance-first. Does this leave the
right amount of ordinary C1 connective freedom and earned C2 artifact freedom, or should either band be broader?
If accepted, the next follow-up is what happens when the engine cannot compile the DM's proposed mechanics without
materially changing the concept - reject, negotiate, abstract, defer, or create a new runtime precedent.

#### 10.G2.1.7 Ruling and follow-up - creation authority is valence-neutral; how does hostile synthesis stay fair?

Adam accepts the recommended two-axis creation matrix and its current C1/C2 boundary, with one important
clarification: the DM's synthesis authority is not a player-reward dispenser. The DM may invent things that help
the player, oppose the player, burden the player, tempt the player, complicate an existing situation, or mix those
valences, provided every creation uses the same source-posture, impact-band, provenance, persistence, knowledge,
and reach constraints. An AI DM that can invent turtle comms but cannot invent an unforgettable enemy tool,
dungeon adaptation, curse form, faction response, or consequential complication has lost half of the DM seat.

An envelope therefore has no inherent `beneficial` flag. It has an authority source, impact/reach budget, eligible
owners and targets, effect/lens permissions, causal and knowledge basis, and perhaps a dramatic orientation such
as reward, opposition, cost, temptation, adaptation, or mixed consequence. The orientation guides composition; it
does not change the legality test. A hostile C2 noun is just as canonical, lootable where physically appropriate,
transferable where its rules permit, visually bound, and callback-eligible as a beneficial C2 noun. It cannot
disappear when the encounter ends merely because it was invented to oppose the player.

##### Concrete examples

**The turtle comms acquire an enemy throughline:** after an antagonist has observed or learned about the paired
communicators and has time, capability, and an opposition/adaptation receipt, the DM may synthesize a shell-shaped
listening lure, a counter-signal ritual, or an NPC's distinctive attempt to impersonate one holder. The engine
must compile the exact proposal within the authorized effect and impact band. The DM may not decide retroactively
that the original communicators were always bugged unless that latent property was committed by their creation
receipt or later installed through a trackable action. A counter should normally pressure the item's use, create a
choice, or open a counterplay path rather than silently nullify the prized invention.

**A dungeon learns from repeated fire:** an existing caretaker, ecology, curse, faction, or adaptive-dungeon owner
may earn a response after the player repeatedly burns obstacles. Within a C2 adaptation envelope the DM might
invent soot-sensing blind sentries, firebreak doors that redirect smoke, or an ash-fed hazard with an exploitable
cooling weakness. The response begins now and persists. The DM cannot reveal that every previously cleared room
always contained fireproof ambushers just because the player's tactic is working too well.

**An enemy bears a bespoke suppression chain:** an enemy/front preparation receipt plus suitable resources may
license a C2 or C3 item intended to interfere with teleportation. If the item is physical and the player defeats
its holder, it remains in the world and may be captured, destroyed through its established rules, studied, sold,
or used by another viable noun. Encounter balance does not authorize post-defeat deletion. If player ownership
would be dangerous, that danger must be handled by the chain's precommitted costs, attunement, dependencies,
custody pressures, or terminal disposition - not by declaring that it was only an enemy effect after the fact.

**A failed delve creates a cruel opportunity:** a complication or consequence receipt may let the DM synthesize a
new debt marker, predatory offer, curse expression, hostile rumor vehicle, or pursuer's tool even if no enemy had
planned that exact form in advance. This is fair because the resolved failure licenses a new downstream fact. It
does not license changing the room the player already searched, the contents of a letter already read, or what an
NPC knew before the failure.

##### Adversarial-timing options

**Option 1 - exact authority symmetry with no additional timing rule.** Any envelope can point for or against the
player, and ordinary validation is deemed sufficient. This is simple and maximizes improvisation, but it allows
quantum traps and perfect reactive counters: the DM can wait for the player's choice and then synthesize whatever
would punish it while claiming the impact budget was legal.

**Option 2 - strict hostile precommit.** Anything opposing the player must be fully instantiated before the player
enters the affected place, begins the scene, or selects the relevant tactic. This provides strong procedural
fairness and easy replay auditing. It also makes an AI DM strangely inert: factions cannot respond creatively,
dungeons cannot adapt, and consequences must be anticipated as an enormous combinatorial catalog.

**Option 3 - causal commitment windows with counterplay (recommended).** Hostile synthesis is legal whenever a
canonical owner or resolved event has current authority to cause a new fact. The creation must record when it
became true, what caused it, what the responsible actor/system knew, which resources/time/reserve it used, its
impact band, and how the player may perceive or answer it. It may respond to prior player behavior but cannot
rewrite already resolved facts. This preserves live invention and makes opposition feel intelligent without
letting the DM cheat.

The recommended policy divides commitment into four practical windows:

1. **Latent world content** must be committed before reveal or selected from a prevalidated latent reserve owned
   by the dungeon/place/front. A hidden door, occupant, stockpile, secret property, or trap cannot be created after
   the player's successful observation should have resolved it.
2. **Prepared actor response** may be synthesized after an actor plausibly learns the relevant information and
   receives enough time, access, and resources. Its receipt records the knowledge and preparation path. The DM may
   author the exact clever response; the engine owns capacity and elapsed opportunity.
3. **Immediate consequence** may be synthesized during resolution when a roll, cost, bargain, complication, or
   triggered rule explicitly grants that envelope. It becomes true at that moment and cannot imply an unsupported
   earlier history.
4. **Ongoing systemic adaptation** may be synthesized by a licensed ecology, curse, faction, nemesis, or dungeon
   director as its clocks/evidence/reserves permit. Adaptation should expose signals and counterplay proportional
   to impact, and ordinarily pressure a successful player pattern rather than hard-nullify it.

`Counterplay` need not mean advance warning of every surprise. It means the invention participates in the game's
causal grammar: it leaves evidence, has limits, admits discovery or response, and does not exist solely as an
unanswerable veto. A C1 hostile detail cannot be accumulated into leverage; C2-C4 hostile creations consume their
proper envelopes and world resources. Repeated opposition aimed at the same player capability also needs pressure
accounting so several individually legal creations do not quietly erase that capability from play.

##### Callback and persistence consequences

Hostile inventions enter the same noun/callback system already accepted for all viable canon. An enemy's named
chain may become loot, evidence, a faction symbol, a later countermeasure, or the root of a related derivative.
An adaptive ash sentry may survive, migrate, be copied, teach the player something, or leave a callback stub after
destruction. The DM can later draw those stubs to create related allies, enemies, methods, materials, rumors, or
institutions. Valence may change over time; provenance and identity do not.

This symmetry is important to world cohesion. If only player-facing gifts persist while hostile inventions vanish
after serving an encounter, the world reveals its scaffolding. If both persist, the DM's antagonism manufactures
future handles rather than disposable difficulty.

##### Research, implementation, and maintenance filter

The procedural research supports constrained live response rather than either unconstrained fiat or exhaustive
preauthoring. Tutenel's separation of semantic `what` from compiled `how` lets the DM author an exact hostile form
while the engine verifies capacity and placement. Mixed-initiative work preserves authored high-value choices
inside generated structure. Declarative constraint work, especially Whitehead's unsatisfiable-request handling,
argues for explicit refusal or renegotiation when a desired counter has no legal knowledge, time, resource, or
effect path. Plan- and graph-based approaches make causal ordering and already-resolved facts first-class rather
than treating the current dramatic need as sufficient evidence.

Option 3 adds **moderate-to-high implementation cost** beyond the creation matrix: causal and knowledge receipts,
commitment timestamps/windows, actor resource/preparation checks, latent-reserve boundaries, telegraph/counterplay
metadata, repeated-pressure accounting, and replay fixtures that attempt common forms of retroactive cheating.
Maintenance must test both directions - an invention should not exceed its envelope merely because it hurts the
player, and the engine should not sand down every hostile concept until opposition becomes generic. Option 1 is
cheaper but cannot establish trust; Option 2 is auditable but carries an unbounded authoring/catalog cost and
throws away one of an AI DM's strongest capabilities.

**Question for Adam:** should hostile and mixed-valence synthesis use Option 3: causal commitment windows with
counterplay? In plain English, the DM may invent against the player whenever a real actor, system, or resolved
consequence has earned the right to cause something *now*; it may not invent something that must secretly have
been true *before* the player's already-resolved choice. The recommendation also makes physical hostile inventions
fully persistent and recoverable under their precommitted rules. If accepted, the next follow-up is whether an
adaptive counter should normally create pressure and choices, with hard nullification allowed only by an explicit
higher-band authority; after that, G2.1 still must decide what happens when the engine cannot compile the DM's
exact proposed mechanics without materially changing the concept.

#### 10.G2.1.8 Ruling and generated follow-up - hostile causal windows accepted; when should the DM invent instead of retrieve?

Adam accepts Option 3 for hostile and mixed-valence synthesis: causal commitment windows with counterplay,
including full persistence/recoverability for physical hostile inventions under their precommitted rules. Before
answering the next queued question about counter pressure versus hard nullification, Adam raises a necessary
generated follow-up: how should the DM prioritize an invention over using an available SRD item or an existing
Genesis-custom item?

The choice cannot be “always invent” or “always retrieve.” The item catalog contains mechanically reliable types;
it does not contain the complete set of meaningful identities the DM might create, and catalog presence does not
establish fictional availability. Conversely, an AI DM should not create a mechanically unique rules object every
time it imagines a distinctive shape. That would produce novelty noise, balance drift, an unreadable inventory,
and an ever-growing QA surface.

The existing `ITEMS.md` type/instance split already supplies the answer's foundation:

```text
type/base reference   reusable objective mechanics, often SRD or approved Genesis custom
enchantment overlay   per-instance mechanical differences
instance              stable copy, condition, custody, quantity, charges, attunement
Codex link             unique identity, name, history, meaning, relationships, callbacks
visual binding         exact readable appearance, library asset, composition, or governed generation
```

Invention and reuse are therefore not mutually exclusive. The DM can invent an entirely new *artifact identity*
while the engine reuses an existing *mechanical type*. The useful priority question is not “new item or database
item?” but “which layers must be new for this intended play pattern and meaning to survive?”

##### Routing options

**Option 1 - strict catalog-first.** Search existing world nouns, SRD items, and Genesis-custom items; use the
closest legal match, permitting invention only when no item shares the requested effect category. This is cheap,
balanced, and easy to render. It also flattens expressive rewards: a unique relationship payoff becomes ordinary
Sending Stones merely because the catalog contains them, and “closest effect” may import the wrong limits, lore,
form, or play pattern.

**Option 2 - DM invention-first.** Let the DM create the exact item and mechanics whenever a synthesis envelope
exists; consult the catalog only if the DM independently asks for a standard object. This preserves maximum
spontaneity, but duplicates mechanics, creates incoherent synonyms, increases balance and maintenance debt, and
turns an item library with hundreds of validated definitions into dead weight.

**Option 3 - intent-first semantic fit, realized by the least-new-mechanics ladder (recommended).** The DM first
states what the object means and how it should change play without being anchored to a catalog answer. The engine
then retrieves existing world instances, SRD types, approved Genesis-custom types, and compatible overlays. It
chooses or offers the lowest-complexity realization that preserves every declared semantic invariant. Fictional
identity may remain fully novel even when mechanics are reused exactly. Full mechanical synthesis occurs only
when retrieval or composition would materially damage the intended identity or play pattern.

The core law is:

> Reuse mechanics aggressively; never reuse them so aggressively that the DM's licensed creative point is lost.
> Charge novelty by new rules complexity, not by new names, forms, histories, or symbolism.

##### The least-new-mechanics ladder

The resolver should walk these routes in order, but stop at the first route that honestly preserves the proposal's
semantic invariants. “Earlier” is a complexity preference, not authority to overwrite the DM's concept.

1. **Return an existing world instance.** If a viable established noun naturally serves the moment, reusing it can
   create the strongest callback and costs no new object. This receives a cohesion bonus, not a mandate: the DM
   must not drag back an unrelated item merely because it exists.
2. **Mint an exact catalog instance.** Use an SRD or Genesis-custom item unchanged when its standard identity and
   mechanics are actually the point or when the noun is routine. A guard needs a Spear; an ordinary cache contains
   Rope; a random magic reward legitimately resolves to the catalog item rolled.
3. **Invent identity over a catalog type.** Keep tested mechanics, but create a new name, form, material, visual,
   provenance, ownership relationship, Codex record, and callback hooks. This is a real DM invention, not a mere
   prose reskin, because its identity persists independently while its objective rules cite a known base.
4. **Compose a bounded overlay.** Use a catalog base/type or effect pattern, then apply only the mechanical deltas
   needed to preserve the intended play pattern: paired ownership, altered range, charges, trigger, target, cost,
   drawback, condition interaction, or other supported primitive. The creation receipt records every delta.
5. **Synthesize a custom instance from existing primitives.** No catalog item provides a suitable base, but the
   desired function compiles from validated effects and limits. The result has no false catalog identity; it is a
   first-class custom type/instance shape with bounded mechanics.
6. **Request a new mechanical precedent.** The concept depends on a behavior outside the supported vocabulary.
   This invokes the still-open compilation-failure/precedent question. The engine must negotiate, abstract, defer,
   reject, or enter a governed precedent lane; it must not disguise unsupported mechanics as a familiar item.

Routes 1-2 carry almost no novelty debt. Route 3 carries semantic/state/art debt but little rules debt. Route 4
carries bounded combination and balance debt. Route 5 carries larger balance, interaction, documentation, and QA
debt. Route 6 is exceptional. This makes the common creative move - a bespoke storied object using known rules -
cheap enough for the DM to use confidently without making the world mechanically incoherent.

##### Intent and fit contract

Before retrieval, a C2+ `InventionProposal` should name a compact set of semantic invariants:

```text
story purpose and emotional/strategic role
required play pattern: what choices or interactions should recur?
required relationship/callback structure
must-have capability; acceptable limits/costs
form, motif, or provenance that carries meaning
valence and intended pressure/payoff
features that must not be imported
```

The engine retrieves candidates only after these are known and evaluates them on separate dimensions:

- **authority and availability:** does the source envelope permit the item, and can the proposed owner/world source
  actually produce it? A catalog row never conjures inventory by itself;
- **play-pattern fit:** would the candidate create the same decisions, cadence, and counterplay?
- **power/reach fit:** does it remain inside the current C-band, rarity, effect, and target limits?
- **meaning/form fit:** can the exact relationship, antagonist signature, realm motif, or consequence survive?
- **world-cohesion fit:** would reusing an established instance create a genuine throughline, or merely force a
  callback because the database found a keyword?
- **rules debt:** how many new primitives, exceptions, and interactions would the candidate require?
- **saturation:** has this item/type/effect appeared so often that a different lawful expression would materially
  improve discovery and world texture?

Hard authority, contradiction, and power limits remain gates. The remaining scores guide a choice; they must not
be collapsed into one opaque similarity number. The receipt should store the considered route, selected base or
primitives, rejected near matches and material deltas, and a short `noveltyReason`. This lets later QA determine
whether retrieval preserved intent or merely chose a convenient keyword match.

##### When invention should win

The DM should prefer a new identity or deeper synthesis when at least one material condition holds:

- the exact form, symbolism, relationship, consequence, or antagonist signature is the earned payoff;
- a catalog candidate shares an effect label but changes the intended recurring choice or emotional function;
- existing items import inappropriate lore, custody, rarity, limitations, side effects, or visual meaning;
- a custom form creates a strong lawful throughline among established facts that a generic result would lose;
- a responsive enemy/dungeon invention expresses trackable knowledge and strategy rather than generic scaling;
- repetition/saturation would make the catalog choice feel interchangeable, and the current envelope licenses
  a meaningfully different expression;
- the invention explores a supported combination of mechanics whose interaction is itself the point.

The DM should prefer retrieval or a thin identity overlay when the object is routine, the catalog candidate is an
honest exact fit, independent loot generation selected that type, mechanical novelty contributes nothing, or a
returning world noun provides stronger cohesion than another new object.

##### Paired-comms trace against the real catalog

Genesis's SRD data already contains **Sending Stones**: a recognized pair whose known mechanics send to the other
bearer and refresh at the next dawn. Under Option 3, the DM still begins with the desired turtle-shaped
relationship keepsakes, their shared-escape provenance, exact holders, and intended coordination play pattern.
The engine then presents the relevant mechanical fit without replacing the concept:

- If Sending Stones' cadence and function preserve the intended play, use Route 3: two turtle communicators with
  their own stable identity, Codex records, provenance, visuals, and callback hooks, mechanically grounded on the
  validated Sending Stones definition.
- If the intended play is short-range, frequent whispered coordination rather than one long-form use per dawn,
  the catalog match is mechanically misleading. Use Route 4: retain a validated communication pattern but compile
  different range, charge/recovery, action, interception, and pairing limits inside the C2 envelope.
- If the communicators are meant to do something no supported communication/relationship primitive can express,
  Route 6 is honest. Do not silently claim that ordinary Sending Stones implement it.

The same rule works against the player. A bespoke suppression chain may ground its mechanical core in an existing
condition, spell effect, or approved custom item while keeping a novel antagonist-specific identity. If its point
is a new tactical interaction rather than another casting of an existing effect, the delta must be explicit and
pay the higher route's complexity cost.

##### DM discretion and novelty budgets

The engine should not automatically choose the first database hit. It should return a compact candidate/delta
comparison to the DM-side compiler: `reuse`, `identity-over-base`, `bounded-overlay`, or `full-synthesis`, including
what each route preserves and loses. When more than one route is legal, the DM chooses because taste and dramatic
specificity remain part of the seat.

That discretion is bounded by **mechanical novelty debt**, not a crude count of invented nouns. A session can
support many newly named, meaningful, mechanically familiar objects more safely than one poorly specified new
rules primitive. C0/C1 identity does not consume a C2 envelope merely because it is original; consequential reach
still does. C2-C4 authority controls impact, while the realization route controls implementation/maintenance debt.
These are orthogonal ledgers.

##### Research, implementation, and maintenance filter

This ladder closely matches the procedural papers' semantic-compilation posture. Tutenel et al. separate the
designer's high-level account of what a scene is from the solver's realization method; preserving invariants before
retrieval prevents the available library from defining the design question. Mixed-initiative systems support
showing high-value candidate choices and letting the creative seat fix what matters. Semantic classes and reusable
plans support Route 3-5 composition without enumerating every final artifact. Whitehead's declarative approach
supports reporting when no catalog or composition satisfies the proposal instead of silently substituting the
nearest result. These papers support the pattern, not the exact Genesis item-routing policy.

Option 3 has **medium implementation cost** on top of the already-accepted synthesis compiler: semantic tags and
effect/play-pattern annotations for SRD and Genesis-custom items, candidate retrieval across catalog plus world
instances, invariant/delta comparison, saturation and cohesion signals, route receipts, and UI/prompt context that
shows only a few useful candidates. Its **maintenance advantage is large**: most novel artifacts reuse validated
mechanics, while new primitives remain rare and visible. The main risks are semantic retrieval that anchors the DM
too early, false similarity by shared keywords, a hidden bias that always selects cheap reuse, and unbounded
overlays that are effectively full custom mechanics without admitting their cost.

**Question for Adam:** should Genesis adopt Option 3 and the law “least-new mechanics, not least-new fiction”?
The DM declares the invention's meaning and intended play first; the engine then checks existing world items, SRD
items, Genesis-custom items, overlays, and supported primitives in that order, stopping only when a route preserves
the declared invariants. In the turtle-comms example, the DM may keep the bespoke turtle identity and use Sending
Stones as the mechanical base if its one-use-per-dawn play is right; if that cadence is wrong, the engine escalates
to a bounded custom overlay rather than forcing the catalog match. If accepted, G2.1 returns to the queued question
of pressure-versus-hard-nullification for adaptive hostile inventions, followed by the compilation-failure and
new-precedent policy.

#### 10.G2.1.9 Scope challenge - the item-routing proposal enters new territory

Adam flags that the recommended intent-first/least-new-mechanics ladder sounds like new territory. That is
correct, and the prior section remains a proposal rather than an accepted ruling. The discussion began with how
the DM should choose invention versus an available SRD or Genesis-custom item, but the proposed answer expanded
into semantic-invariant declaration, cross-catalog candidate retrieval, fit comparison, saturation scoring,
novelty debt, rejected-candidate receipts, and automatic route escalation. Those pieces amount to a new runtime
creative-assistance and mechanics-compilation subsystem. They are not implied merely by accepting DM synthesis.

Several foundations are already established:

- the item type/instance split and `base`/`ench`/`codexId` layers exist in `ITEMS.md` and built item data;
- SRD and Genesis-authored item definitions can provide reliable mechanics;
- the DM Charter licenses invention but requires capture;
- the accepted G2.1 decisions allow the DM to author expression-bearing nouns inside typed creation envelopes;
- an invented item must receive stable identity, mechanics, custody, provenance, persistence, visuals/fallbacks,
  and callback eligibility.

What is new and not yet authorized is an engine that decides or formally ranks whether creativity should use an
existing item, a reskinned type, an overlay, a composite, or a wholly new precedent. The phrase “least-new
mechanics, not least-new fiction” may still be a useful design principle, but implementing it as a mandatory
scored resolver is a separate design problem with uncertain consequences for the DM seat.

##### The actual branch now exposed

**Option 1 - specify the full creative resolver now.** Continue the new territory and design the semantic intent
schema, catalog/world retrieval, fit dimensions, ranking/choice protocol, novelty and saturation budgets,
mechanical compiler, and precedent path as part of G2.1. This could eventually make invention scalable and
auditable, but it substantially expands both the question and the implied implementation architecture before live
evidence shows which decisions the DM actually needs help making.

**Option 2 - lock a minimal DM-choice policy; defer the resolver (recommended).** The engine exposes relevant
catalog mechanics when asked or when an obvious exact match exists, but it does not automatically prioritize a
catalog result over invention. The DM chooses among `USE`, `ADAPT`, and `INVENT` inside the current envelope. The
engine then validates and captures the chosen route. A lightweight rule encourages reuse when it loses nothing
material and encourages invention when exact meaning, form, or play is the point. No fit score, novelty currency,
saturation ledger, or rejected-candidate audit is required yet. The elaborate ladder remains preserved as a
future research/design bank if play demonstrates repeated drift or duplication.

**Option 3 - leave routing entirely to DM discretion.** Give the DM access to item lookup and let it use or ignore
the catalog without any stated preference. The engine validates only the final proposal. This maximizes the seat
and has the lowest immediate implementation cost, but provides no guidance against duplicate mechanics or
catalog neglect and makes model behavior harder to evaluate consistently.

##### Recommended minimal policy

Under Option 2, the engine's role is assistance and validation, not creative ranking:

```text
USE    instantiate an existing world item or catalog definition;
       source authority still determines whether it exists here.

ADAPT  retain an existing mechanical base/effect but give this instance a new identity,
       provenance, appearance, relationship, or bounded validated overlay.

INVENT create a custom item inside the earned envelope when its exact identity or play pattern
       materially serves the situation; compile what is currently supported and use the later
       failure/precedent policy for what is not.
```

The DM can request a catalog search or receive a very small nonbinding suggestion such as “Sending Stones are an
available mechanical analogue.” It is not forced to inspect or reject a ranked list before inventing. The DM can
answer:

- `USE`: “These are Sending Stones.”
- `ADAPT`: “Use that communication cadence, but these are the turtle keepsakes from the escape, with their own
  identities, holders, art, history, and callbacks.”
- `INVENT`: “That cadence defeats the intended frequent short-range coordination; compile this bounded paired
  communicator instead.”

All three are legitimate. The engine checks authority, power, contradiction, mechanics, persistence, and custody
after the DM chooses a route. It does not decide that similarity is creative sufficiency.

The same applies to hostile invention. A warden's suppression chain may use an existing condition/effect, adapt
one into a storied physical tool, or propose a novel tactical interaction. The adversary does not gain an item
merely because its type exists in the catalog, and the DM does not need to invent a new rules primitive merely to
make the warden distinctive.

##### Costs and research posture

Option 1 has **high and poorly bounded architecture/content cost**: semantic annotations across the item corpus,
retrieval quality, model anchoring, explainable fit, compositional balance, novelty/saturation policy, and QA for
cases where the resolver's cheapest answer destroys the creative point. The procedural papers support high-level
semantic intent compiled into legal realization, but they do not prove that Genesis needs an automated item-choice
resolver or tell it when an AI DM should prefer originality.

Option 2 has **low-to-medium incremental cost**: make item lookup available to the DM/compiler, support explicit
`USE`/`ADAPT`/`INVENT` intent, reuse the existing item layers, and log the chosen route in the creation receipt.
It produces direct playtest evidence about catalog reuse and invention frequency without prematurely constructing
a ranking system. Option 3 is cheapest, but its absence of a policy makes undesirable behavior difficult to call a
bug rather than taste.

The preserved ladder in the preceding section remains valuable as a research bank, not a locked requirement. If
play shows endless redundant custom mechanics, catalog blindness, or generic catalog substitution, Genesis can
promote only the machinery needed to correct the observed failure.

**Question for Adam:** is the new territory itself something to explore now, or should G2.1 take Option 2 and stop
at a minimal `USE`/`ADAPT`/`INVENT` choice owned by the DM, with catalog suggestions nonbinding and the automatic
semantic resolver deferred? The recommendation is Option 2 because it preserves the newly protected creative DM
seat and gathers evidence before mechanizing this choice. If accepted, the prior “least-new mechanics” language
becomes guidance rather than an engine priority law, and G2.1 returns to hostile-counter pressure versus hard
nullification before the still-open compile-failure/precedent question.

#### 10.G2.1.10 Clarification and ruling - the full creative resolver is core vision; how strong may adaptive counters be?

Adam clarifies that “this sounds like new territory” was enthusiastic recognition, not a scope warning. He really
likes the full intent-first semantic resolver and considers it core to his vision for Genesis: the prior proposal
expressed a system he wanted but had not been able to articulate. Section 10.G2.1.9 therefore remains preserved as
an accurate inventory of what is genuinely new, but its recommendation to defer that territory is rejected and
superseded. Adam accepts Option 1 from 10.G2.1.9 and Option 3 from 10.G2.1.8 as the architectural direction. No
implementation is authorized during this design discussion.

The accepted core is:

> The DM authors meaning, intended play, identity, and semantic invariants first. The resolver searches existing
> world nouns, SRD and Genesis-custom definitions, overlays, and supported primitives; compares what each route
> preserves or changes; and realizes the invention with the least new mechanical complexity that does not destroy
> the creative point. The engine validates and persists the result. Catalog similarity never overrules intent,
> and catalog presence never creates fictional availability.

This is a creative compiler, not merely item lookup and not merely a narrator constraint. `USE`, `ADAPT`,
`COMPOSE`, `SYNTHESIZE`, and eventually governed `PRECEDENT` are realization depths under one intent-first
conversation. Fictional originality is cheap and encouraged when licensed; new mechanical primitives carry
proportionally higher authority, validation, maintenance, and QA cost. When several legal realizations differ in
meaning or play, the DM retains the creative choice; the resolver exposes consequences and legality rather than
silently selecting the cheapest database match.

The item system is the clearest first example because Genesis already has `base`/`ench`/`codexId`, but the vision
is broader. The same semantic boundary can eventually serve licensed hostile tools, hazards, relationship tokens,
techniques, rituals, scars/adaptations, titles, rumors, environmental responses, and other expression-bearing or
hybrid inventions through domain owners. It does not erase the source-posture rule: resistance-bearing actors,
hidden truths, inventories, topology, quantities, and independent opportunities still require their proper rolls
or owners before the DM authors their expression.

The previous minimal `USE`/`ADAPT`/`INVENT` policy survives as an early implementation slice of the accepted
vision, not as its final boundary. Likewise, the detailed ladder, intent contract, candidate/delta comparison,
mechanical novelty debt, saturation/cohesion signals, and honest precedent lane remain live design commitments
whose exact schemas and weights need later specification and play evidence. “Core vision” authorizes preserving
the architecture in planning; it does not authorize pretending every unresolved detail is already known.

##### Return to the queued adversarial follow-up

With causal commitment windows accepted, the next question is how strongly a synthesized adaptation may counter
a player capability. This is separate from whether the invention is legal. An enemy may have knowledge, time,
resources, and a valid C2 response envelope, yet a perfectly tailored answer can still make the player's earned
tool or tactic irrelevant. Conversely, forbidding real counters can make intelligent enemies feel ceremonial.

##### Counter-strength options

**Option 1 - same-band hard counters.** Once a hostile invention has legal causal authority, it may partially or
completely nullify the target capability within the same C-band as any other effect. A C2 adaptation may therefore
shut off a C2 item or tactic if power arithmetic balances. This is simple and lets enemies feel ruthless, but it
turns legal observation into automatic permission for perfect counters and invites reactive difficulty scaling.

**Option 2 - pressure only.** Synthesized adaptations may increase cost, risk, noise, delay, exposure, or
positioning demands, but may never disable, suppress, immunize against, or destroy the target capability. This
strongly protects player expression and keeps every tool usable. It also makes some enemy preparation implausibly
weak, prevents meaningful local wards and immunities, and denies the DM dramatic temporary reversals even when
the world has clearly earned them.

**Option 3 - graduated counter authority (recommended).** Most adaptive synthesis creates friction and new
choices. Temporary or local denial requires a stronger explicit envelope plus tells and a real workaround. Hard
nullification or permanent severance requires either preexisting canonical mechanics or higher-band authority
that names the affected capability and consequence. No counter tier may be assembled through a stack of smaller
effects whose combined result would require the higher tier.

The graduated ladder is:

```text
FRICTION / CONTEST       ordinary C2 response
  raise cost; introduce risk, interception, resistance, delay, position, limited charges,
  or a meaningful opposing check; preserve a usable choice

LOCAL / TEMPORARY DENIAL explicit strong C2 or C3 response, depending reach and duration
  suppress in a bounded place/window/target set; require proportionate tell and a practical
  bypass, disable-source, alternate route, or other counterplay

HARD / DURABLE NULL      normally C3-C4, or already-established rules truth
  immunity, permanent severance, destruction, broad suppression, or removal of the play pattern;
  require named authority, causal preparation, strong evidence/tells, and full persistence/aftermath
```

An existing creature's independently established fire immunity or an already committed antimagic property is not
a new adaptive invention; its ordinary encounter and reveal rules govern it. The DM may not select or spawn that
answer retroactively because the player's fire tactic is succeeding. Novel adaptation begins from a world actor
or system spending legal knowledge, time, resources, and an envelope - never from an invisible “player is too
effective” signal. This preserves the already locked rule that optional discoveries do not trigger reactive enemy
scaling.

##### Concrete examples

**Turtle comms:** a C2 enemy adaptation might introduce intermittent static, a chance of interception, a false
reply that requires recognition, or a signal that exposes approximate location. A prepared lead-lined cell or
breakable jamming shrine could temporarily deny them in one bounded place if strongly telegraphed and physically
answerable. Retroactively declaring the pair useless everywhere, or permanently severing it through an ordinary
C2 response, would be illegal. Permanent severance would need an established destruction rule or explicit C3+
authority, and the severed objects/history would still persist.

**Repeated fire tactics:** soot-sensing enemies, spreading smoke, firebreaks, volatile fuel risks, or partial fire
resistance create friction and different choices. A preexisting fire elemental can be immune because that is
independent creature truth. An adaptive dungeon may create a local suppression chamber or prepared guardian only
through the proper owner, commitment window, band, and tells. It cannot make every later enemy immune because fire
has become the player's best tactic.

**Suppression chain:** a warden with justified knowledge and preparation may wield a chain that contests or
locally suppresses teleportation while the prisoner remains in its bounded reach. The chain is a targetable,
stealable, persistent source with defined limits. A cheap invisible effect that simply says “you can never
teleport again” is a durable null and requires much higher authority, direct consequence law, and aftermath.

The player does not need advance knowledge of every exact mechanic. Proportionate tell means the world communicates
that unusual opposition exists at a time when observation, inference, retreat, sacrifice, or counteraction can
matter. Surprise remains possible; unanswerable post-choice negation does not.

##### Implementation and maintenance cost

Option 3 adds **medium mechanical architecture cost** to the hostile-synthesis system: typed counter strength,
scope/duration and target-reach validation, suppression-versus-destruction semantics, stacking/effective-null
detection, causal knowledge/preparation receipts, telegraph/counterplay fields, and tests distinguishing ordinary
resistance from functional denial. It also needs pressure accounting across several enemies or rooms so repeated
friction does not become an undeclared global null.

The content burden is manageable because domains can reuse counter primitives - contest, surcharge, intercept,
delay, reveal, resist, local suppress, disable source, sever - rather than authoring a special answer to every
ability. The maintenance danger on one side is a solver that technically leaves a capability usable but makes it
practically worthless; on the other, overprotection can prevent the world from ever threatening a beloved tool.
Golden traces must test the experienced play pattern, not only whether an enabled flag remained `true`.

The research corpus supports typed hard constraints, semantic plans, and bounded mixed-initiative realization,
but the exact fairness ladder is a Genesis game-design ruling rather than a result proved by the papers. It follows
the same general discipline: author the desired pressure at a semantic level, compile it through explicit reach
and legality, and fail honestly when the proposed counter cannot be supported.

**Question for Adam:** should adaptive hostile inventions use Option 3's graduated authority: ordinary responses
create friction and choices; local/temporary denial requires stronger explicit authority plus tells and real
counterplay; hard or durable nullification requires preexisting canonical mechanics or C3-C4 authority? The
recommendation permits intelligent, frightening counters without letting the DM erase an earned player tool in
response to success. If accepted, the next G2.1 follow-up returns to what the creative resolver does when it cannot
compile the DM's intended mechanics without materially changing the concept, including when a proposed solution
may become a reusable precedent.

#### 10.G2.1.11 Ruling and follow-up - graduated counters accepted; what happens when creative intent will not compile?

Adam accepts Option 3's graduated hostile-counter authority. Ordinary adaptive responses create friction, contest,
risk, or new choices; local/temporary denial requires stronger explicit authority plus proportionate tells and
real counterplay; hard or durable nullification requires preexisting canonical mechanics or C3-C4 authority.
Individually smaller effects may not stack into an undeclared higher tier, and the world may not reactively scale
merely because the player's tool or tactic succeeds.

The next question reaches the failure boundary of the newly accepted semantic creative resolver. The DM may
propose an exact artifact, hazard, technique, ritual, relationship effect, or hostile adaptation whose intended
play cannot be expressed by the current effect vocabulary, whose requested power exceeds the envelope, or whose
mechanics conflict with canonical truth. Replacing it silently with the nearest catalog item destroys the DM seat;
narrating an uncommitted mechanic destroys engine authority. Genesis needs an explicit transaction for the space
between those failures.

##### Compile-failure options

**Option 1 - reject-only.** If the proposal cannot compile exactly inside the current envelope and mechanics
vocabulary, reject it and ask the DM to invent something else. This is mechanically clean and inexpensive. It
also trains the DM toward safe catalog-shaped ideas, wastes strong concepts over small implementation gaps, and
makes the breadth of AI invention mostly theoretical.

**Option 2 - automatic nearest safe substitute.** The engine changes range, trigger, effect, item type, or play
pattern until some legal implementation exists, then commits it without a second creative decision. This gives
fast turns and few outright failures, but it is the precise semantic-drift failure the resolver exists to prevent.
A relationship communicator may become a generic one-use spell token; a clever suppression chain may become an
ordinary restrained condition; the mechanics validate while the invention's point disappears.

**Option 3 - bounded transactional negotiation with honest abstraction and a governed precedent lane
(recommended).** The proposal declares hard invariants and soft preferences. The compiler may adjust soft
parameters within predeclared tolerance, but a material change to an invariant returns a structured failure before
narration. The DM and compiler then choose among a small set of legal revisions, an explicitly provisional
abstraction, deferral as a tracked obligation, a declarative runtime precedent when the generic evaluator can
safely host it, or final rejection. Nothing consequential becomes canon until one route commits.

##### Intent-preservation transaction

The recommended transaction has these terminal states:

```text
COMPILED
  Exact intent and mechanics compile inside the envelope.

CONSTRAINED
  Only declared soft preferences change inside accepted tolerance; invariants and play pattern survive.

NEGOTIATION_REQUIRED
  A hard invariant, authority limit, or canonical fact conflicts. Return the smallest useful reason
  plus two or three materially distinct legal routes; the DM chooses, revises, or declines.

ABSTRACTED
  The fiction can be honored through an honest generic mechanical interface without pretending the
  missing fine-grained behavior exists. The abstraction is visible in the receipt and has an exit path.

DEFERRED
  The concept remains an explicit unfulfilled creation/design obligation. The world may contain a
  prototype, damaged component, research path, or promised reward only if that fictional state is itself
  honest; the engine cannot narrate the unavailable completed capability.

PRECEDENT_COMMITTED
  A new declarative recipe is created from supported triggers, effects, scopes, costs, and owners.
  It is data interpreted by a bounded evaluator, never AI-written executable code.

REJECTED
  No legal realization preserves enough intent and no honest abstraction/defer path is appropriate.
  No item/effect is minted and narration must acknowledge nothing as completed canon.
```

The DM should distinguish **hard invariants** from **soft preferences** before compilation. For turtle comms,
“two linked physical keepsakes held by these allies” and “enable recurring coordination” may be hard; exact range,
number of uses, activation action, and recharge cadence may be soft within the C2 envelope. The engine can tune a
soft range without another exchange. It cannot replace the pair with one generic consumable or remove recurring
coordination and claim success.

##### Failure reasons and negotiation shape

The compiler should return compact typed reasons rather than a vague refusal:

- `AUTHORITY_EXCEEDED` - the requested impact, reach, permanence, or valence exceeds the source envelope;
- `CANON_CONFLICT` - the proposal contradicts established identity, custody, knowledge, topology, or other truth;
- `MISSING_PRIMITIVE` - no supported trigger/effect/state operation expresses a hard invariant;
- `ILLEGAL_COMBINATION` - supported primitives interact in a forbidden or unbounded way;
- `POWER_OR_STACKING` - the composite exceeds rarity/tier/action/stacking limits;
- `OWNER_OR_TARGET_GAP` - no canonical owner, eligible target, or persistence path can host the change;
- `COUNTERPLAY_FAILURE` - a hostile proposal creates denial beyond its tell, scope, or response authority;
- `REALIZATION_ONLY_GAP` - art/animation/presentation is missing but mechanics and canon can still commit through
  a deterministic fallback; visual absence alone must not reject the invention.

A useful failure response names the violated invariant and offers genuinely different paths, not three cosmetic
versions of the same engine preference. For example:

```text
Requested: turtle comms work continuously across the entire realm with no cost (C2 reward).
Failure: AUTHORITY_EXCEEDED — reach and permanence exceed C2.

Route A: short range, several uses per rest; preserves frequent coordination.
Route B: any distance, one message per dawn; preserves separation-spanning contact.
Route C: begin a quest/progress path toward a C3 network; preserve the larger concept as an earned future.
```

The negotiation happens inside the DM/compiler turn and should ordinarily be invisible to the player. It receives
a strict attempt/time budget so one brilliant but impossible proposal does not stall play. If no result commits,
the DM narrates a different legal beat or an honest in-fiction incompleteness, never a system apology disguised as
world lore.

##### Honest abstraction

Abstraction is not a license to fake unsupported simulation. It is appropriate when the intended player-facing
choice can be represented by an existing generic owner even though detailed internals are absent. Examples:

- a novel tracking charm may grant a bounded, source-specific bonus or opportunity on an established check rather
  than pretending Genesis simulates a new scent network;
- a ritualized relationship technique may mint a once-per-rest coordinated reaction through supported action and
  condition primitives while its richer fiction remains Codex truth;
- a complex enemy listening device may create a typed interception risk and evidence trail without simulating
  radio propagation room by room.

The receipt records `abstracts`, the promised semantic behavior, actual mechanical projection, limitations, and
an optional upgrade/migration hook. The DM may not narrate reliable behaviors outside that projection. A later
mechanic can migrate the instance without erasing its identity or history.

##### Governed runtime precedents

A runtime precedent is permitted only when the proposal is novel as a *recipe*, not when it requires arbitrary
new engine behavior. It may compose registered triggers, scopes, costs, contests, resources, conditions, effects,
owners, persistence operations, and termination rules into a new declarative pattern. It must pass the same band,
stacking, counterplay, determinism, serialization, and replay validation as a catalog definition. The accepted
recipe receives a stable id, version, source world, creation receipt, and explicit reuse scope.

The runtime may never execute AI-authored JavaScript, formulas outside a bounded expression grammar, unregistered
state mutation, or prose-as-rules. If the concept truly needs a new primitive, that is an engine/design gap. The
resolver can abstract or defer it and capture the missing primitive for later authoring; it cannot manufacture a
hidden code path during play.

Whether a successful precedent remains unique to its instance, becomes a reusable pattern inside the current
world, or graduates into the cross-world Genesis custom library is deliberately the next follow-up. Automatic
global promotion would turn one model improvisation into product law without adequate evidence.

##### Concrete traces

**Turtle comms:** if paired identity, recurring coordination, and relationship provenance are hard invariants,
the compiler can negotiate range/charges/recovery as soft parameters. If a supported communication trigger plus
linked-set owner expresses the result, commit a declarative recipe. If “the shells understand emotional subtext
and alter future NPC decisions” needs unavailable belief simulation, abstract the immediate player choice or defer
that extension; do not claim an ordinary communication primitive implements it.

**Adaptive suppression chain:** if the DM asks for “teleportation fails everywhere forever after one touch,” a C2
envelope returns `AUTHORITY_EXCEEDED` and `COUNTERPLAY_FAILURE`. Legal routes might contest teleportation while
the chain is attached, suppress it inside the holder's reach with a break/steal path, or escalate the concept into
a C3 project. The engine must not silently turn it into generic movement reduction while retaining the dramatic
description of total magical imprisonment.

**Novel dungeon bargain:** the DM proposes that a door opens only when a traveler gives up a personally meaningful
memory, and the loss should influence future dialogue. If Genesis can store a named memory/callback relation and
apply a bounded social/knowledge condition, it may become a declarative precedent. If memory semantics are not
supported, an honest abstraction might spend an established bond/resource and mint a visible callback obligation.
The DM cannot narrate forgotten facts while the engine still supplies those facts normally to every future NPC
and digest.

##### Research, implementation, and maintenance filter

Whitehead's declarative approach is especially relevant here: a constraint system must expose unsatisfiable intent
rather than silently corrupt it. Tutenel's semantic `what` versus procedural `how` supports treating the DM's hard
invariants as compiler inputs and realizing them through reusable classes/plans. Mixed-initiative systems support
returning a small legal alternative set to the author rather than taking the creative choice away. The research
does not establish safe runtime rules evolution; Genesis's no-executable-code boundary, replay determinism, and
promotion governance are necessary product rulings.

Option 3 has **high architecture cost**: invariant/tolerance schemas, typed diagnostic reasons, bounded internal
negotiation, a generic trigger-effect evaluator, safe declarative expressions, receipt/version/migration support,
honest abstractions, deferred obligations, and replay/stacking/counterplay validation. It also imposes a latency
budget and needs failure fixtures for attractive concepts the engine cannot support. Its long-term payoff is the
core vision Adam identified: inventive AI direction can grow beyond the prewritten catalog without turning world
physics into untracked prose or forcing every surprise through a human-coded special case.

Option 1 is far cheaper but shrinks invention toward the existing vocabulary. Option 2 hides failure but destroys
trust. Option 3 makes unsupported creativity a structured conversation and preserves strong ideas as abstractions,
future obligations, or safe data-driven precedents without pretending the engine can do what it cannot.

**Question for Adam:** should compile failure use Option 3's bounded transaction: preserve hard invariants, tune
only declared soft preferences automatically, negotiate material changes before narration, allow explicitly honest
abstraction or deferral, and permit new runtime precedents only as validated declarative recipes over registered
primitives - never AI-authored executable code? If accepted, the next G2.1 follow-up decides precedent scope and
promotion: unique instance, reusable within one world, or eligible for the reviewed cross-world custom library.

#### 10.G2.1.12 Ruling and follow-up - transactional compilation accepted; how does a precedent earn wider reuse?

Adam accepts Option 3's bounded transactional negotiation as necessary to make the core creative-resolver concept
work correctly. Hard invariants must be preserved unless the DM explicitly revises them; soft preferences may be
tuned within declared tolerances; material conflicts produce typed diagnostics and a bounded internal negotiation
before narration. Honest abstraction, tracked deferral, declarative runtime precedents over registered primitives,
and final rejection are legitimate outcomes. AI-authored executable code and prose-as-rules are forbidden.

The next question is what happens after a declarative precedent works. The new artifact/effect must persist in its
world, but persistence is not the same as general availability. Automatically putting every successful improvisation
into the global catalog would let one context-specific model answer become default Genesis rules. Keeping every
recipe permanently isolated would force the compiler to rediscover useful patterns and prevent the system from
growing. Narrative canon, mechanical recipe, and product library therefore need separate promotion laws.

##### Precedent-scope options

**Option 1 - immediate global reuse.** Any `PRECEDENT_COMMITTED` recipe enters the Genesis-custom catalog and may
be retrieved in every world. This makes the system learn quickly and amortizes invention cost immediately. It also
promotes a recipe after almost no balance evidence, leaks world-specific motifs and assumptions, creates library
spam, and allows a single strange edge case to become product law.

**Option 2 - permanent world isolation.** A precedent remains attached to its originating instance/world forever.
It may support that item's own callbacks but can never become a general candidate elsewhere. This strongly
protects setting identity, privacy, balance, and shipping stability. It also wastes proven recipes, repeats
negotiation/validation work, and prevents the resolver's mechanical vocabulary from learning over time.

**Option 3 - layered precedent lifecycle with explicit promotion gates (recommended).** Every successful invention
begins as instance/world canon. Its mechanics may become a reusable pattern inside the same world only through
both mechanical validation and an in-world availability path. A canon-stripped recipe may separately enter a
cross-world candidate pool after adequate traces and adversarial certification. Only a reviewed/certified version
enters the durable Genesis-custom library. Fiction never crosses worlds merely because mechanics do.

##### Recommended lifecycle

```text
P0 INSTANCE PRECEDENT
  The exact committed invention. Its name, form, holders, history, visuals, relations, and mechanics
  belong to this world and this instance/set. Always persistent; always callback-eligible where viable.

P1 WORLD PATTERN
  A reusable mechanical/crafting/ritual/tactical pattern inside the same world. Requires an in-world
  transmission basis such as study, copying, teaching, faction research, manufacture, mutation,
  observation, or independent rediscovery. Validation alone does not make NPCs know it.

P2 PORTABLE CANDIDATE
  A canon-stripped recipe graph plus evidence. Contains triggers/effects/costs/scopes/bands/counterplay,
  never the originating world's proper nouns, custody, secrets, relationships, or assumed lore.
  It is quarantined from ordinary retrieval while certification runs.

P3 CERTIFIED CUSTOM PATTERN
  A versioned, compatibility-tested Genesis-custom recipe eligible for cross-world retrieval.
  It remains a candidate, not automatic fictional availability or a mandated answer.

P4 CORE PRIMITIVE / STANDARD
  Rare authored product promotion when repeated recipes expose a genuinely general mechanic that
  belongs in the resolver vocabulary itself. Requires migration and backward-compatibility policy.
```

Promotion is not a single ladder every invention must climb. Many excellent inventions should remain P0 because
their unrepeatable specificity is the point. A villain's one-off soul chain can be permanent, mechanically real,
and richly callback-connected without becoming a craft recipe. P1 is world simulation: can someone here reproduce
or teach this? P2-P4 are system learning: is the mechanic safe and general enough to offer elsewhere? Those are
different questions and neither implies the other.

##### Turtle-comms trace

The original turtle comms are P0: their forms, pair identity, holders, shared-escape provenance, damage/loss state,
visuals, and callbacks remain unique world canon.

They become P1 only if the world earns replication. An artificer studies them, one holder teaches a bonding ritual,
a faction steals their pattern, or a callback transformation produces a related paired device. The DM may use the
P0 callback stubs to propose descendants, but no shop suddenly stocks turtle comms because the compiler knows their
recipe.

A portable candidate might strip that history into something like:

```text
paired-holder communicator
bounded range or cadence
linked-set break/loss behavior
transfer and interception rules
C2 power/counterplay profile
```

Another world could later realize that certified mechanic as whispering coins, mirrored beetle pins, bone flutes,
or another locally meaningful invention. It would not inherit turtles, the escape, the original holders, or their
relationships. Mechanical learning must not flatten world identity.

##### Hostile-precedent trace

A warden's suppression chain remains P0 and recoverable after defeat. If a faction studies or manufactures it,
P1 makes reproduction a world event with material, knowledge, time, custody, and opposition consequences. The
portable candidate may preserve only the safe mechanic: a targetable physical tether that locally contests one
movement mode and provides a break/steal path. The originating villain's name, prison doctrine, victims, and secret
methods remain local canon.

An especially abusive P0 recipe may remain legal for its already-committed narrow circumstances yet fail P2
certification. Certification failure does not retcon the original world. It blocks broader reuse, records the
reason, and may constrain future copies through world consequences or recipe-version repair rather than erasure.

##### Promotion evidence and certification

A portable candidate needs more than “the compiler accepted it once.” Its evidence packet should include:

- normalized declarative recipe and exact primitive/version dependencies;
- originating C-band, intended play pattern, hard invariants, and abstraction status;
- deterministic serialization/replay traces and migration data;
- observed uses across materially different targets/situations where available;
- stacking, recursion, resource-loop, ownership-transfer, destruction, and terminal-state adversarial probes;
- hostile-counter and player-ownership traces where applicable;
- power/reach comparisons against relevant SRD and Genesis-custom baselines;
- known failure modes, counterplay obligations, saturation/frequency guidance, and forbidden combinations;
- a provenance-scrub report proving no world secrets, personal data, or protected narrative identity travels with
  the candidate.

The exact certification owner - mandatory human review, fully automated gates, or a staged hybrid that can become
no-human after the harness proves itself - is the next material follow-up if Option 3 is accepted. At minimum,
cross-world/product promotion cannot occur through opaque model confidence alone.

##### Versioning, repair, and retirement

Every P0-P3 recipe keeps a stable identity and version. A later correction creates a new version and a migration
or compatibility projection; it does not silently rewrite past outcomes. Existing instances retain provenance to
the version that governed their history. Dangerous candidates can be quarantined from new use while old world
state receives an explicit safe migration, limitation, or grandfathered local behavior according to severity.

Duplicate candidates should be merged by mechanic graph and semantic invariants, not by name similarity. Two
worlds may independently invent differently named paired communicators that reveal one reusable recipe; the P0
identities stay separate. Conversely, two objects with similar names may encode different play patterns and must
not be collapsed.

##### Callback and DM-deck implications

P0 callback stubs remain available to the DM in their originating world regardless of promotion. P1 adds lawful
related-growth options: copies, schools, counterfeit versions, defensive responses, improved descendants, supply
chains, cultural customs, and opposition built from the known pattern. The DM's callback deck uses those stubs to
create cohesion, but every descendant still needs source posture, authority, causality, and impact validation.

P2/P3 retrieval does not make a callback. A cross-world mechanical template has no relationship to a current
world until the DM or engine earns and instantiates a locally meaningful identity. This prevents the global library
from posing as memory.

##### Research, implementation, and maintenance filter

Semantic classes and reusable plans in the downloaded procedural research support separating an abstract reusable
pattern from its contextual realization. Mixed-initiative and declarative systems support versioned reusable
constraints and authored fixation of important meaning. The papers do not establish an automatically self-growing
cross-world rules catalog or solve its safety, privacy, balance, and product-governance problems; the P0-P4
lifecycle is a Genesis-specific extension.

Option 3 has **high platform and maintenance cost**: recipe identity/versioning, world-local knowledge and
replication events, canon stripping, evidence capture, quarantine, certification harnesses, duplicate detection,
migrations, deprecation, and separate storage/retrieval boundaries for local versus portable patterns. Its benefit
is equally structural: the creative compiler can learn without treating improvisation as disposable or allowing
one world's fiction to contaminate another.

Option 1 is initially cheap but creates an increasingly untrustworthy global corpus. Option 2 is safe but prevents
the accepted core system from improving its reusable grammar. Option 3 lets permanence, world dissemination, and
product learning proceed independently and visibly.

**Question for Adam:** should successful precedents use Option 3's P0-P4 lifecycle: exact inventions persist as
world-specific P0 canon; in-world reuse requires a causal P1 transmission path; only canon-stripped, evidence-backed
P2 candidates may seek certification into the cross-world P3 custom library; and rare repeated patterns may later
become P4 core primitives? If accepted, the next follow-up chooses the P2-to-P3 certification owner: human review,
automated gates, or a staged hybrid designed to graduate toward a trustworthy no-human pipeline.

#### 10.G2.1.13 Ruling and best-case target - the semantic invention platform

Adam enthusiastically accepts Option 3's P0-P4 direction and asks Genesis to document the best-case version of
this newly articulated core system now. Implementation timing, depth, and production cuts will be reconsidered
against the actual schedule when a build is proposed. The purpose of the present sketch is to preserve the full
vision so later scope decisions are explicit tradeoffs rather than accidental reductions. This remains design-only;
no implementation, worktree, CI, asset checkout, merge, or push is authorized.

##### Best-case product promise

Genesis should let an AI DM originate an exact new artifact, tool, hazard, technique, ritual, relationship token,
adaptation, consequence form, or other licensed invention during play without requiring that final noun to have
been anticipated by a static catalog. The engine should help the DM discover relevant existing mechanics, preserve
the invention's semantic point, compile the least novel honest implementation, negotiate real conflicts, commit
all affected state atomically, render a coherent visual, retain callback handles, observe how the invention behaves,
and cautiously learn reusable patterns from proven results.

The system succeeds only if all of these remain true together:

- **The DM remains an author.** It chooses meaning, identity, intended play, and acceptable compromise; it does not
  merely decorate a solver-selected catalog result.
- **The world remains resistant.** Independent people, hidden truth, inventory, topology, quantities, and opportunity
  still come from their proper owners; creative synthesis cannot manufacture convenience.
- **Mechanics become real before narration.** Consequential claims commit through typed owners and receipts; no
  prose-only item, condition, ability, route, or exception exists.
- **Invention is valence-neutral.** Rewards, threats, temptations, costs, enemy tools, adaptive defenses, and mixed
  consequences use the same authority, fairness, persistence, and counterplay laws.
- **Worlds remain distinct.** A useful mechanic may travel through certification; proper nouns, relationships,
  custody, secrets, history, and local visual identity never leak merely because a recipe is reusable.
- **Learning is reversible and versioned.** Promotion never rewrites the past, and unsafe patterns can be quarantined,
  repaired, migrated, or retired without erasing canonical history.

##### Best-case turn experience

The player should experience one coherent act of DM invention, not a visible configuration wizard. Most of the
protocol runs inside the DM/compiler turn:

```text
1. AUTHORITY
   A reward, consequence, actor preparation, callback, relationship, Crit, or other event grants
   a typed C1-C4 creation envelope.

2. INTENT
   The DM proposes exact meaning, identity, intended recurring play, hard invariants, soft
   preferences, valence, holders/targets, motif, and desired capabilities.

3. RETRIEVAL
   The resolver searches viable world instances, SRD/Genesis catalog definitions, certified custom
   patterns, effect primitives, visual assets, and relevant callback stubs. Results are candidates,
   never authority or mandatory answers.

4. REALIZATION
   The compiler tests USE -> ADAPT -> COMPOSE -> SYNTHESIZE -> PRECEDENT and finds the least-new
   mechanics that preserve the hard invariants and intended play.

5. NEGOTIATION
   Soft parameters tune automatically within tolerance. Material conflicts return compact typed
   diagnostics and a few genuinely different legal routes to the DM. The player sees none of this
   plumbing unless a real player decision is required.

6. COMMIT
   One atomic transaction mints ids/recipes, mechanics, custody, knowledge, codex facts, relationships,
   costs, resources, clocks, callbacks, visual binding, terminal rules, and provenance. Only then may
   the DM narrate the completed invention.

7. PLAY AND MEMORY
   Use, transfer, damage, study, loss, destruction, ownership, counters, descendants, and callbacks
   produce ordinary typed events. The noun remains in the world after its immediate dramatic job.

8. EVIDENCE AND PROMOTION
   Off the critical turn path, the system gathers deterministic traces, probes interactions, strips
   canon, and may advance a recipe through P0-P4 under explicit certification gates.
```

The fast path should dominate ordinary play. Exact catalog use, identity-over-base, and common validated overlays
should require little or no internal negotiation. Novel recipe compilation is rarer and bounded. Certification,
corpus deduplication, adversarial simulation, and cross-world promotion occur asynchronously or between turns and
must never make the player wait for product-library governance.

##### Conceptual records

The best-case design needs a small family of typed records rather than one overloaded invention blob. Names are
provisional; responsibilities are the target:

| Record | Owns |
|---|---|
| `CreationAuthority` | source receipt, C-band, valence/orientation, reach, owners/targets, effect/lens budget, expiration/service horizon |
| `CreativeIntent` | story purpose, intended play pattern, hard invariants, soft preferences/tolerances, motif/form, forbidden substitutions |
| `CandidateComparison` | viable world/catalog/pattern/primitive routes, preserved/lost invariants, mechanical deltas, authority and complexity findings |
| `MechanicRecipe` | declarative triggers, scopes, costs, resources, contests, effects, conditions, stacking, recovery, termination, version dependencies |
| `CompileDiagnostic` | typed unsatisfied reason, affected invariant, minimal conflict explanation, legal alternatives, attempt budget |
| `CreationReceipt` | atomic committed ids, chosen route, recipe/version, custody, Codex/state mutations, provenance, visuals, callbacks, reconciliation |
| `PrecedentRecord` | P0-P4 scope, source world/instance, reuse boundaries, transmission state, version lineage, quarantine/retirement status |
| `EvidenceBundle` | deterministic play traces, adversarial probes, power comparisons, counterplay, transfers, terminal states, known failures |
| `CertificationRecord` | canon-strip result, gate versions/results, reviewer/automation provenance, allowed domains/bands, rollback and migration plan |

Every record has a bounded DM projection. The DM sees creative-relevant constraints and candidate deltas; it does
not receive an unreadable dump of the item corpus, full state, or test harness. The engine retains the full audit
trail outside the narration context.

##### Conceptual owners

The best-case platform can be understood as cooperating owners rather than one omniscient model call:

- **Authority broker:** resolves whether invention is licensed now and which C-band, owners, targets, reach, valence,
  resources, and effect families are available.
- **Semantic retriever:** searches world memory/callbacks, SRD and Genesis catalogs, custom patterns, and effect
  primitives after intent is declared; produces a small diverse candidate set with provenance.
- **Intent compiler:** maps hard/soft semantics onto legal mechanics, detects unsupported primitives and effective
  impact, and compares realization routes without changing the creative point silently.
- **Negotiator:** gives the DM bounded, explainable alternative routes and tracks explicit invariant revisions.
- **Commit coordinator:** validates current versions and applies all owner mutations atomically or none at all.
- **Memory/callback owner:** creates viable stubs, related-growth handles, salience/service obligations, and later
  promotion from mention to first-class thread.
- **Visual resolver:** binds approved library art, composes legal parts, uses deterministic fallback, and may later
  request an exact governed asset from the committed semantic/slot specification.
- **Evidence and certification owner:** observes behavior off-turn, probes recipes, strips canon, versions results,
  promotes or quarantines candidates, and produces migration/rollback instructions.

These are authority seams, not a required file/module decomposition. Production may combine early owners as long
as their records and trust boundaries remain explicit.

##### Best-case mechanical language

The declarative recipe grammar should be deliberately smaller than arbitrary game code but broad enough to
compose meaningful new play. It should cover registered families such as:

```text
TRIGGERS     action, reaction, event, threshold, enter/leave, time, damage, check/save,
             possession/transfer, relation change, use/charge, destruction, callback

SUBJECTS     actor, item, linked set, place/zone, faction, relation, condition, resource,
             route/edge, evidence, clock, bounded collection

SCOPES       self, holder, linked counterpart, target, radius/zone, current scene/site,
             named network, bounded reach profile

COSTS        action/reaction, charge, resource, HP/damage, condition, exposure, time,
             risk/contest, item state, relationship/faction cost

EFFECTS      modify check/save/damage/AC/movement/resource, communicate, reveal/obscure,
             contest, intercept, transfer, spawn owned consequence, add/remove condition,
             advance/retard clock, suppress locally, transform state, mint callback/evidence

LIMITS       duration, cadence, range, target cap, stacking, recharge, attunement,
             break/repair/destruction, termination, immunity/resistance, counterplay source
```

Recipes can introduce new combinations and identities, not unregistered mutation verbs. When recurring creative
failures reveal a missing general operation, P4 promotion may add a new primitive through the ordinary product
design/build/test process. Runtime invention never expands its own executable authority.

##### Domain adapters in the best case

One semantic spine should serve multiple domains, but each domain keeps objective ownership and specialist gates:

- **Items and linked sets:** base/enchantment/custom recipe, rarity/value, charges, attunement, custody, transfer,
  condition, damage/destruction, Codex, visuals, loot/recovery.
- **Hazards, traps, and environmental adaptations:** place/zone ownership, triggers, tells, avoidance/disarm,
  reset/exhaustion, path playability, resource and damage severity, topology boundaries.
- **Techniques, rituals, and relationship abilities:** learner/holder eligibility, action economy, teaching and
  progression, rest/resource cadence, social/knowledge consequences, loss or transformation.
- **Enemy/faction responses:** knowledge, time, preparation, material capacity, strategic owner, counter-strength
  ladder, target scope, evidence, counterplay, recoverable physical nouns.
- **Titles, rumors, evidence forms, scars, customs, and institutions:** identity/relationship owners, canonical
  reach, audience knowledge, legal/social leverage, propagation, mutation, correction, callback growth.
- **Place changes, routes, and structural inventions:** C3-C4 topology/event authority, graph and spatial owners,
  access, traversability, destruction/repair, maps/knowledge, and existing-site history.
- **Visual realization:** construction/slot class, silhouette, scale, state variants, material/realm skin, approved
  asset provenance, fallback, and exact-generation specification after canon commits.

The shared compiler handles intent, negotiation, recipes, receipts, precedent, and evidence. Domain adapters decide
what effects mean in their systems and prohibit plausible-sounding cross-owner shortcuts. A custom item cannot
rewrite topology; a rumor cannot create inventory; a visual cannot grant a mechanic.

##### Best-case certification: staged hybrid graduating by trust domain

The recommended best-case certification posture is neither permanent human bottleneck nor immediate autonomous
global learning. It is a **staged hybrid designed to earn no-human operation separately for each recipe domain and
impact band**:

1. Every P2 candidate runs automated schema, authority, determinism, serialization, primitive-version, stacking,
   recursion, resource-loop, terminal-state, counterplay, and canon-strip gates.
2. Property/fuzz and adversarial scenario generation exercise transfers, destruction, repeated use, opposing use,
   multiple owners, nested triggers, old saves, and interaction with representative SRD/custom baselines. Generated
   probes only count when deterministic assertions evaluate them; model confidence is not a pass condition.
3. Candidates first run in **shadow certification**: test replays and optional noncanonical simulations may measure
   behavior, but the pattern is not offered to ordinary cross-world retrieval.
4. Early P3 product promotion receives human review. Review captures reasons and new executable fixtures so human
   judgment teaches the gate rather than becoming permanent invisible labor.
5. A narrow domain/band may graduate to automatic P3 promotion only after coverage, false-promotion/rollback,
   migration, and audit thresholds are met. High-risk C3-C4, new primitive combinations, privacy/provenance
   ambiguity, and gate disagreements retain review.
6. Autonomous lanes remain sampled, observable, reversible, versioned, and instantly quarantinable. Graduation can
   be revoked when evidence changes.

Cross-world scope should itself be typed. A **profile-local P3** may be reusable across one player's locally owned
worlds without sending data anywhere. A **product/shared P3** requires canon stripping, provenance/IP/privacy
clearance, explicit data-sharing policy/consent where user-world evidence leaves the device, and the stronger
certification track. Neither scope imports originating fiction.

This is the best-case route to the no-human content pipeline Adam wants: automation earns trust through executable
evidence and narrow authority, then expands. “No human” is an achieved property of a certified lane, not an
assumption made on day one.

##### Best-case QA gates

A release-quality harness should prove at least:

1. **Intent preservation:** committed mechanics retain hard invariants and intended play; no nearest-match drift.
2. **Authority and valence symmetry:** beneficial and hostile recipes obey the same bands, owners, reach, resources,
   and persistence laws.
3. **Fair counters:** friction, local denial, and durable nullification cannot be laundered across tiers or stacks.
4. **Atomicity:** failed/stale transactions mint nothing; successful commits update every required owner once.
5. **Persistence/custody:** transfer, loss, theft, damage, destruction, bardo/terminal state, and recovery cannot erase
   nouns for scene convenience.
6. **Callback continuity:** viable inventions produce playable stubs; descendants never inherit salience or authority
   automatically and cannot invent retroactive causality.
7. **Mechanical safety:** action/resource loops, recursion, stacking, unbounded collections, invalid targets, and
   cross-owner mutation fail closed with useful diagnostics.
8. **Replay/migration:** recipe versions serialize deterministically; corrections preserve history and migrate or
   quarantine explicitly.
9. **World isolation:** portable candidates contain no proper nouns, secret facts, holders, relationships, local
   history, personal data, or assumed world availability.
10. **Visual honesty:** missing bespoke art degrades to a deterministic representation without changing mechanics;
    later generation binds to the same identity and state variants.
11. **Experienced-play checks:** an ability left technically enabled but made practically worthless is detected as
    effective nullification; a legal recipe that produces dull or incoherent play remains a certification failure.
12. **Latency/budget:** ordinary USE/ADAPT/COMPOSE fast paths stay bounded; negotiation and rare C3-C4 preflight have
    explicit attempt/time limits; certification never blocks the live turn.

##### Best-case observability and player trust

The player should not see compiler traces during ordinary narration, but the product needs inspectable provenance.
An item/detail surface can explain in world-facing language what an invention does, its limits, holders, provenance,
damage state, and known counters. Developer/QA views can show authority source, intent invariants, selected route,
recipe graph/version, diagnostics, receipt mutations, callback stubs, and promotion status.

Seeded/replay modes should reproduce both the world inputs and compiled result when model-authored semantics are
recorded. Debugging must answer “why did this exist, why could it do that, when did it become true, who knew it,
which rule version governed it, and why was this candidate reused?” without reconstructing truth from prose.

##### Production-realization cuts - revisit at implementation time

The best-case target does not require an all-or-nothing build. Production may choose among conforming slices:

**Slice A - assistive authored identity.** Item lookup plus explicit `USE`/`ADAPT`/`INVENT`, hard/soft intent,
existing base/overlay mechanics, atomic receipts, persistence, callbacks, and deterministic visual fallback. No
runtime precedent beyond already supported overlays.

**Slice B - world-local declarative compiler.** Generic registered trigger/effect recipes, typed diagnostics,
bounded negotiation, honest abstraction/defer, P0/P1 precedent, and item plus one adversarial/hazard adapter.

**Slice C - evidence and local learning.** P2 evidence bundles, shadow certification, version/migration/quarantine,
canon stripping, deduplication, and profile-local certified patterns.

**Slice D - broad semantic platform.** Domain adapters across items, hazards, techniques, factions, relationships,
and place change; product/shared P3 catalog with staged review; governed exact visual generation.

**Slice E - graduated autonomous ecosystem.** Certified low-risk domains auto-promote P2->P3 under reversible gates;
recurring patterns propose P4 primitives; human work shifts to red-team fixtures, sampled audits, novel domains, and
high-impact exceptions.

Each slice should use compatible ids, intent/receipt shapes, and version boundaries so later depth extends rather
than replaces earlier canon. At implementation planning, Genesis should compare player value, latency, authoring
load, infrastructure cost, model reliability, security/privacy, and schedule. It may ship an earlier slice while
retaining later slices as explicit target gaps. Production triage can defer features; it cannot silently redefine
the accepted creative relationship between DM and engine.

##### Research filter

The best-case architecture uses the downloaded corpus as support, not proof. Tutenel et al. (2009/2010) support
designer-authored plans/classes and high-level semantic scene intent realized by a generic solver. Merrell et al.
support mixed initiative in which the creative user fixes meaningful choices and the generator proposes legal
arrangements. Yu et al. support learned/weighted priors around hard functional relationships, which maps to candidate
ranking so long as weights never override invariants. Whitehead supports declarative intent with honest
satisfiability failure. Horswill supports executable global playability constraints rather than local plausibility
alone. Nepozitek et al. and Green et al. reinforce separating high-level structure from a later realization step.
Henderson et al. warn that increasing constraints and object counts have real runtime costs, supporting fast paths,
bounded active sets, and off-turn certification.

None of the papers supplies a self-evolving AI-DM mechanics language, precedent lifecycle, safety certification,
or cross-world canon boundary. Those are Genesis-specific inventions built from the research's strongest common
pattern: preserve high-level intent, make constraints explicit, separate structure from realization, keep authorship
mixed-initiative, validate executable outcomes, and admit unsatisfied requests honestly.

##### End-state cost and value

The full target is a **very-high-cost platform capability**, not a feature checkbox. It needs semantic/effect
authoring, catalog annotation, safe evaluators, authority adapters, transactionality, versioning/migrations,
adversarial/property testing, world/profile/product storage boundaries, model-context design, observability,
privacy/IP policy, visual generation governance, and long-duration play traces. The hardest maintenance problem is
interaction growth: compositional primitives reduce authoring but do not remove the need to test important
combinations and experienced play.

Its value is equally foundational. It makes the AI DM's best inventions first-class game objects; lets mechanics
grow without surrendering world physics; turns hostile improvisation into fair persistent opposition; converts
callback stubs into real evolving culture and technology; reuses SRD/custom strength without letting the catalog
dictate imagination; and gives Genesis a path from a static rules corpus toward a versioned, auditable, world-aware
creative system.

**Question for Adam:** does this best-case target capture the system you mean, including the staged
hybrid-to-automation certification posture and the promise to revisit Slices A-E against the production schedule
before any build? If accepted, the next narrow follow-up is whether profile-local P3 promotion may eventually be
fully automatic sooner than product/shared P3 promotion, which would retain stronger review, consent, provenance,
and privacy gates.


<!-- END VERBATIM MIGRATION: original lines 12181-14428 -->
