---
type: design-study
status: CLOSED
wave: 2
part: 3
legacy_sections: "10.11-10.11.24"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 2 — Question 11, Part A

<!-- BEGIN VERBATIM MIGRATION: original lines 7270-9801 -->

### 10.11 Question 11 - how do operational flows become real player handles without becoming a commodity simulator?

In plain English: a functioning jail needs food, water, custody, sanitation, records, staffing, and
outside relationships; a mine needs air, drainage, supports, tools, workers, haulage, and waste removal;
a living habitat needs nutrients, shelter, renewal, defense, and byproduct handling. Should those facts
remain atmospheric prose, should Genesis simulate every ration and bucket, or should it store a smaller
causal network that tells the DM what players can observe, influence, protect, exploit, repair, replace,
or negotiate?

Questions 2, 6, 9, and 10 established typed resources/services, capacity and demand, operational state,
and cadence. The unresolved issue is their **playable site-level expression**. A resource total alone
does not tell the DM where food comes from, who controls it, how it enters, what buffer exists, what
depends on it, or what changes if the party interferes. A beautifully narrated kitchen alone does not
prove the prison can feed anyone.

Three approaches have distinct costs:

1. **Dressing implication:** a kitchen, cistern, storeroom, ledger, pump, or mine cart merely suggests
   that the system works. This is cheap, but breaks as soon as a player asks where supplies originate,
   blocks a route, bribes a provider, damages the pump, frees a worker, or follows the waste channel.
   The DM must then invent both the dependency and its retroactive consequences.
2. **Unit commodity simulation:** count every meal, bucket, tool, prisoner ration, cartload, barrel,
   gallon, shift, and minute. This can answer narrow questions precisely, but creates huge authoring,
   persistence, tuning, and bug surfaces. False precision also makes ordinary shortages ubiquitous when
   one rate or catch-up rule drifts.
3. **Typed material dependency graph with graded realization:** store only the providers, transfers,
   buffers, consumers, control points, byproducts, and thresholds that explain site operation or predict
   play. Keep stable low-attention flows aggregate; give important, pressured, external, contested, or
   Spice-bearing flows concrete evidence and interaction handles.

#### Recommended material-flow contract

Each material operational flow may identify:

```text
need / service / payload type
  -> source or provider
  -> transfer method, route, cadence, and access
  -> storage, reserve, redundancy, or other buffer
  -> process or capability served
  -> consumers/dependents and current demand
  -> byproduct, waste, output, or onward destination
  -> capacity, reliability, current state, and thresholds
  -> controller/claimant and responsible operator
  -> evidence, interaction handles, and legal player operations
  -> response, adaptation, recovery, and downstream consequences
```

This is a sparse capability/dependency graph, not another room graph and not a universal market
simulation. Nodes can be site capabilities, assemblies, local groups, external providers, routes,
buffers, or regional aggregates. Exact objects and quantities materialize only when inventory,
transaction, tactical position, evidence, or a threshold makes them actionable.

Flows can be physical resources, environmental conditions, services, throughput, or information and
authority channels where the semantics genuinely predict operation. They should remain typed rather
than collapsing food, air, legal permission, rumor, and magical containment into one interchangeable
“resource point.”

#### Which flows deserve concrete handles?

Not every edge receives a bespoke minigame. A flow earns stronger realization when at least one is true:

- it is required for a core capability or current population's viability;
- it is external, scarce, strained, unreliable, capacity-limiting, or schedule-bound;
- a group claims, contests, monopolizes, steals, rations, protects, or depends upon it;
- a current operational state or historical transformation altered it;
- it supports a secret, promise, contract, hazard, opportunity, or protected Spice root;
- player abilities can meaningfully trace, divert, secure, repair, substitute, expose, negotiate, or
  otherwise change it;
- its physical route or control point affects topology, access, tactics, or discovery.

Low-attention stable flows can remain aggregate and expose only a legible ambient manifestation. A
working city water service need not generate every pipe and cup. But if the prison's water is rationed,
the controlling valve, cistern, provider, schedule, claimant, or substitute must become knowable enough
for play.

#### Concrete examples

- **Hamlet jail:** meals come from the tavern on a known cadence; a small reserve of cold provisions
  buffers missed delivery; the sheriff controls distribution; waste leaves by a mundane local process.
  Players can question the provider, intercept a message, deliver food during a disruption, notice a
  changed ration, exploit delivery access, or arrange a substitute. Genesis does not count every bite.
- **City prison:** kitchens, water, laundry, medicine, records, waste, guard relief, and prisoner transfer
  form several shared systems. Cellblocks depend on them at different load. A blocked service corridor,
  corrupted contractor, closed visitation process, or seized valve changes only the connected coverage
  until thresholds propagate further.
- **Residential college:** heat, meals, teaching, tuition/patronage, books, messages, cleaning, and room
  assignment have different providers and calendars. A dormant house can lend space while its shared
  boiler and archive relationships remain real.
- **Inn:** food and drink arrive through suppliers, beds turn over through labor and laundry, stabling
  consumes fodder, and local information travels through guests and staff. A festival pressures rooms
  and food differently and creates overflow providers rather than one generic “busy” modifier.
- **Mine:** airflow, drainage, supports, tools, labor, ore haulage, spoil removal, and lift capacity create
  a compact causal system. Damaging or repairing the pump affects deep access according to water level,
  buffers, alternate drainage, and crew response—not whatever consequence the DM invents in the moment.
- **Contested grove:** refugees and druids may depend on the same gate, spring, stores, healers, or ritual
  ground while holding different physical, customary, and doctrinal claims. Resource leverage can create
  cooperation, negotiation, resentment, or exclusion without automatically creating combat.
- **Living habitat:** prey/nutrient access, temperature, waste exchange, symbionts, brood care, migration,
  and defense use ecological flow types. Cutting a nutrient route can produce migration, dormancy,
  aggression, adaptation, or die-off according to the species/site program rather than a human economy
  template.

#### Player operations and consequences

The semantic flow gives the interaction/action systems a lawful set of possibilities—observe, trace,
ask, negotiate, purchase, deliver, guard, divert, ration, repair, replace, expose, steal, block, restore,
or create a substitute—subject to knowledge, skill, access, ownership, ethics, physics, and context. It
does not guarantee every verb is legal on every flow.

A consequential operation produces a typed event against the affected provider, route, buffer,
capability, claimant, or threshold. Question 9 recalculates operational coverage; Question 10 adjusts
cadence/coverage; groups respond according to their claims and knowledge; physical and narrative
evidence persists. Competent occupants use known buffers and responses. This is how the engine gives
the DM causal truth without deciding how every actor must feel or narrating the outcome in advance.

#### Guardrails

- no per-unit simulation unless exact units are already actionable inventory, treasure, tactical
  objects, or threshold evidence;
- no all-pairs dependency graph; purpose/ecology profiles author sparse meaningful edges;
- no cascading failure without capacity/buffer thresholds and a causal event;
- no hidden dependency may produce player-facing consequences without fair manifestations or discovery
  paths appropriate to the characters' knowledge;
- no generic “resource” abstraction may erase materially different behavior;
- no flow receives detailed realization solely because it can be modeled; it must explain operation,
  constrain a decision, support an interaction, or deliver evidence;
- player intervention creates a real advantage, liability, relationship change, or world consequence;
  the engine does not secretly rebalance away the result;
- DM projection stays local: current handles, nearby dependencies, due consequences, competent responses,
  and relevant unknowns—not the entire site's or region's economy graph.

#### Recommendation

Adopt the typed material-dependency model with graded realization. Store enough causal structure to
answer where an important flow comes from, how it moves, who controls it, what buffers it, what depends
on it, how players can affect it, and what lawful consequences follow. Aggregate everything else until
attention, pressure, or consequence justifies detail. This preserves the world-interaction payoff Adam
wants without building a fragile per-ration economy simulator.

**Open decision:** should material operational flows use this sparse dependency-and-handle contract,
with concrete realization concentrated on core, pressured, external, contested, Spice-bearing, or
player-actionable flows and exact quantities deferred until they become materially relevant?

#### 10.11.1 Follow-up - preserve DM dressing improvisation through bounded canonization

Adam likes the dependency model but also wants the DM to freestyle with dressing when players interact
with it. That freedom is important. A causal engine that refuses to recognize an ordinary stool, rag,
bucket, loose board, desk drawer, lamp, chain, curtain, or piece of crockery unless it was eagerly stored
would be less flexible than a tabletop session and would punish exactly the environmental creativity the
new ecology is meant to support.

The dependency graph and dressing improvisation should therefore have different authority:

- **operational flow truth** fixes consequential providers, routes, buffers, capabilities, states,
  claims, thresholds, and known absences before the DM narrates them;
- **dressing grammar** defines a bounded envelope of ordinary plausible local details from room
  function, fixtures, occupants, culture, materials, condition, history, current activity, and realm;
- **DM improvisation** may select, combine, phrase, or roll an ordinary candidate inside that envelope
  when a player asks a concrete question or attempts an environmental action;
- **canonization** stores whatever the DM actually asserts at the lightest sufficient persistence tier,
  then promotes it if the player observes, moves, consumes, damages, takes, relies upon, or attaches a
  consequential fact to it.

This gives three useful commitment levels:

```text
projection wording
  expressive phrasing of already-licensed truth; no new mechanical noun is required

observed dressing fact
  a lightweight persistent assertion such as “a three-legged stool stands by the desk”

promoted interactable / event participant
  stable identity, affordances, state, ownership, location, and consequences because play now depends on it
```

Anything explicitly narrated to the player is canon at least as an observed dressing fact. It cannot
vanish on revisit. The system need not immediately allocate a heavyweight inventory/entity record for
every described cup; it can retain a compact assertion under the room/fixture and promote only the cups
that become relevant.

##### Example - hamlet jail

The room program fixes one barred holding room, its legal exits, custody function, present condition,
occupants, and any material supply or sanitation dependency. The dressing grammar may license a bench,
stool, water bucket, chamber pot, blanket, writing tools, wall hooks, lantern, key peg, ordinary papers,
or patched local construction according to the actual state.

If the player asks, “Can I wedge the stool under the door?” the DM can establish a plausible stool,
canonize it, and let the action system judge its shape, strength, access, and the door mechanics. The
engine did not need to pre-simulate the stool.

If the player asks, “Is that floor drain large enough to crawl through?” the DM cannot invent a new
escape edge merely because drains are plausible in prisons. Traversable topology was fixed before
exploration. The answer must come from the canonical room/portal plan: perhaps there is no drain, only a
small waste channel, or a preexisting hidden maintenance route with its own reveal requirements.

If the player searches the desk for “the prisoner-transfer ledger,” an ordinary blank ledger or routine
record may be improvised if licensed. A specific incriminating record, secret clue, named transfer, or
contract evidence must attach to an existing fact/root/promise or create a lawful promoted discovery;
the DM cannot manufacture high-consequence canon merely because a desk has drawers.

##### Improvisation boundaries

The DM may freely establish a detail when it:

- fits the effective room/fixture/occupant dressing grammar and current operational state;
- is ordinary at the relevant context and Spice band;
- does not contradict an observed absence, previous description, known inventory, current damage, or
  access condition;
- does not create or delete a traversable connection, required capability, major buffer, controlling
  resource, named person, strategic asset, clue, threat, or high-band cause;
- remains within a bounded local clutter/affordance budget where quantity or repeated invocation matters.

The DM must consult fixed truth or request a seeded oracle/table result when the answer would:

- change topology, access, capacity, operational state, or a dependency threshold;
- create valuable/scarce inventory, a major tactical advantage, or material treasure;
- establish hidden knowledge, named evidence, a secret, a promise, or another person's private fact;
- introduce Strange/Volatile/Mythic content beyond an already licensed causal root;
- contradict something the party already observed or reasonably exhausted through an earlier search;
- produce a persistent consequence outside the local dressing authority.

An oracle result does not mean the DM loses its voice. It supplies bounded authority—present/absent,
quantity band, condition, ownership, or attachment—and the DM still performs the result in context.

##### Avoiding player exploit loops

Creative engagement should be rewarded, but repeated generic questions must not mint unlimited gear or
new search chances. The same stable search/opportunity rules still apply:

- a systematic sweep establishes routine dressing and absences within its method;
- identical retries do not refill the room or reroll previously exhausted surfaces;
- interchangeable clutter can be grouped under one surface or reserve instead of listing every object;
- once a local reserve is consumed or an absence is established, later improvisation respects it;
- improvised ordinary tools provide their honest affordances; the engine does not secretly weaken them
  merely because the player found an unexpected use;
- consequential improvisations enter the same event, ownership, inventory, evidence, and persistence
  paths as pre-generated objects.

##### Recommendation

Add **bounded DM improvisation with progressive canonization** to the sparse dependency model. Pre-fix
semantic structure and consequential operations; author generous contextual dressing grammars; let the
DM instantiate ordinary plausible details in response to player attention; persist every asserted fact
lightly; and promote only interacted-with or consequential details into full records. This preserves
tabletop freedom while preventing improvisation from retconning topology, minting treasure, leaking
secrets, or bypassing causal systems.

**Open follow-up:** should the DM receive this bounded dressing authority, with ordinary plausible
details freely instantiated and canonized on demand, while topology, scarce resources, operational
dependencies, secrets, named evidence, and higher-Spice facts require preexisting authority or a seeded
oracle/promotion path?

#### 10.11.2 Adversarial audit - holes, weaknesses, and hidden expenses in bounded improvisation

Adam agrees with the direction and asks for an adversarial review before closing the follow-up. The
model survives, but the initial phrase “ordinary plausible details freely instantiated” is too loose.
The review exposes one conceptual correction, several current-engine gaps, and a genuinely expensive
cross-system implementation surface.

##### Central conceptual hole - there is no reliable “purely cosmetic noun” once players can act freely

A stool is cosmetic until the player wedges a door with it. A curtain becomes rope, concealment, fuel,
or evidence. Flour becomes a way to reveal invisible movement. A cup becomes a listening tool. A broken
board becomes a lever or weapon. The player's creativity—not the table author's category—determines
mechanical relevance.

Therefore the system cannot safely let the DM name arbitrary physical objects as projection-only prose
and decide later whether they were real. The moment a manipulable noun is narrated, at least these facts
may already be committed:

- existence and approximate location;
- quantity or singular/plural extent;
- material, scale, portability, and apparent condition;
- ownership/access and who can see it;
- compatibility with room capacity, circulation, sockets, and current state;
- enough latent physical identity to answer later use without retroactive convenience or sabotage.

Sensory wording and non-object phrasing can remain presentational. A named manipulable object cannot.
This narrows but does not remove DM freedom: the DM may select and perform a **prevalidated latent
affordance**; it should not become the sole authority that the affordance exists.

##### Research sift - the indexed papers strengthen the constraint side, not the AI-improvisation side

The procedural-dungeon research does not provide a solved AI canonization mechanism. Its strongest
applicable result is the shared semantic legality model:

- semantic scene descriptions declare types, relationships, counts, mandatory/optional elements, and
  constraints before layout;
- hierarchical assemblies and typed sockets give objects legal support and bounded capacity;
- hard reservations protect portals, circulation, access faces, and required affordances;
- deterministic candidate generation, scoring, fallback, and provenance make results reproducible;
- the room compiler supplies the DM a licensed scene; the report explicitly says the DM should not add
  a convenient table because generation failed or repair missing structure through narration.

Our model can extend those ideas only if a compiled room keeps **unused but typed latent capacity**:
available small-floor, furniture, wall, tabletop, container, textile, debris, tool-like, or other
contextual affordance slots plus legal candidate families. The DM may choose/phrase within that reserve;
the engine validates the slot and instantiates the fact. An improvised mechanically meaningful object
cannot bypass the same footprint, socket, circulation, support, and ownership rules as a precompiled one.

This reconciliation is a Genesis design extension, not a result proven by the papers. It needs its own
acceptance evidence.

##### Current production-path gaps - this cannot ride existing dressing unchanged

The present repository makes the hidden expense concrete:

1. `place-dressing.js` produces pure, deterministically re-derived visual dressing. It does not persist
   player-created/interacted-with objects, and its catalog mostly carries slug, category, size, and
   render strategy rather than general gameplay affordances.
2. `walk-interactables.js` explicitly documents a persistence split: the projected
   `plan.interactables[]` is re-derived while `state_transition` looks for a persisted prep-node array.
   A mutation to only the projection can disappear on recompute.
3. The current room pipeline does not yet share one authoritative occupancy, footprint, clearance,
   socket, and reservation context across dressing, interactables, grammar, projection, and renderer.
   An on-demand stool cannot honestly claim a legal location until that missing middle exists.
4. `fact_canonized` records a generic ledger fact and grants XP. It is not a scoped room-assertion store,
   object identity, ownership record, spatial binding, or promotion mechanism; using it for every cup or
   stool would also create an XP exploit.
5. The DM turn contract has no dressing-assertion/proposal event. `applyResponse` can reject an event
   while still displaying narration that claimed the rejected outcome. That narration/event atomicity
   gap is unacceptable if the DM says an object exists or an action succeeded before engine validation.
6. The current digest exposes selected current dressing prose, not a compact room-local latent
   affordance reserve, closed search domains, improvised assertions, or legal candidate properties.
7. Promoted improvised objects have no guaranteed projection path back into the room view. Narration
   could say the stool is wedged under the door while the visual scene continues to show neither stool
   nor changed door state.
8. Current `saveU` still serializes the whole universe into synchronous `localStorage`; the repository's
   own storage measurements already identify main-thread and roughly 5 MB quota walls. Thousands of
   small permanent assertions worsen an existing storage requirement unless incremental IndexedDB,
   cold prose, compaction, and bounded hot projection are genuinely on the production path.

This means the feature is not “one new table plus a prompt rule.” It crosses the room compiler, object
catalog, action resolver, event contract, canonical storage, knowledge, inventory, renderer projection,
DM digest, authoring tools, migrations, and verification.

##### Failure mode 1 - leading questions become a loot/solution oracle

If “is there a rope?” and “is there cord?”, “twine?”, “straps?”, “curtain?”, or “wire?” are independent
queries, a patient player can synonym-walk until the DM creates the desired affordance. The same problem
applies to containers, flammables, acids, ladders, cover, writing tools, valuables, and evidence.

**Required mitigation:** queries and reserves operate on controlled semantic/affordance classes, not raw
noun strings. Equivalent requests consume or inspect the same stable room reserve. A deterministic key
such as site/room + affordance class + established method/state produces the same answer across retries,
reloads, model phrasing, and aliases. Systematic search can close a finite class/surface without claiming
omniscient absence of every noun imaginable.

This creates a nontrivial controlled-vocabulary and synonym-normalization authoring cost, especially for
mods and realms.

##### Failure mode 2 - negative facts can grow without bound

“No rope,” “no twine,” “no straps,” and every other failed query cannot each become a permanent global
fact. Nor can one systematic sweep honestly prove the absence of every possible object or use.

**Required mitigation:** store method-aware closure over finite semantic surfaces/classes:

```text
desk drawers systematically searched for ordinary papers and small valuables
cell portable-tool reserve exhausted
north-wall mounted-fixture slots observed
hidden structural routes not resolved by this mundane visual sweep
```

Later queries reuse those closures. Different magic, tools, knowledge, access, or physical change may
open another method without rerolling the same opportunity. This is more compact and honest than an
infinite absence list, but it requires search-domain definitions and method compatibility rules.

##### Failure mode 3 - impact is contextual, not an intrinsic item tier

An ordinary stool may be a major tactical advantage if the only puzzle is holding a pressure plate. A
mundane iron spike can defeat a door challenge; oil can transform a fire scene; chalk can defeat a maze.
The catalog cannot classify all stools as “low consequence.”

**Required mitigation:** validate both the object class and the **requested use** against current
topology, reservations, challenge commitments, known mechanisms, inventory, and action physics. Ordinary
objects remain honest tools—the engine must not secretly weaken them to preserve authored difficulty—but
critical obstacles cannot be designed around the assumed absence of ubiquitous mundane affordances.
Exact success remains an action-resolution question, not a DM gift or veto.

##### Failure mode 4 - narration and engine truth can diverge in one turn

The AI may narrate “you seize the lantern and jam it into the gears,” then emit an assertion or mutation
the engine rejects for no reserve, wrong room, invalid state, ownership, or missing target. Showing the
narration anyway has already lied to the player.

**Required mitigation:** use two resolution paths:

- **one-turn prevalidated path:** the current DM digest carries a small room-local reserve of already
  legal affordance classes/slots and ids. The DM may spend/select one and narrate it while emitting an
  assertion whose acceptance is mechanically guaranteed if the token is unused and the turn base
  version matches;
- **preflight path for ambiguous/high-impact requests:** the DM proposes an affordance/query or the
  engine resolves the player's request before final narration. Only the accepted result enters the
  narration turn. This may use the existing ask/roll continuation pattern conceptually, but final
  protocol design belongs to specification.

Every assertion/mutation needs atomic or version-checked application. Rejected consequential events
must trigger a correction/resolution turn before player-facing success prose, not become a quiet
`applied.ok:false` buried under contradictory narration.

The hidden expense is latency: an extra AI round trip for every spoon would be intolerable. That is why
the prevalidated local reserve is necessary and why two-step resolution must be limited to genuinely
ambiguous or high-impact cases.

##### Failure mode 5 - promotion can reveal missing properties retroactively

If the DM stores only “stool,” later play may need material, weight, size, condition, ownership,
flammability, break threshold, value, exact position, or whether it was nailed down. Inventing each
property at the moment it becomes convenient produces drift.

**Required mitigation:** the first assertion gets a stable id, seed, semantic class, licensed candidate
family, owner/location/scope, and enough contextual invariants to derive later properties
deterministically. Promotion expands from that seed inside the original envelope. It does not reroll a
better stool because the player found a use for it.

##### Failure mode 6 - “ordinary” changes across culture, condition, creature scale, and realm

A rope, chair, written ledger, open flame, or lock may be commonplace, nonsensical, sacred, illegal, or
physically incompatible depending on inhabitants and realm laws. Generic medieval clutter would erase
the very context system the redesign is building.

**Required mitigation:** use shared semantic affordance classes with context-specific realization and
hard exclusions. Realm/culture/purpose/occupant/condition packages extend registered catalogs rather than
forking the resolver. Accommodation domains and current state filter candidates before the DM sees
them. This preserves scalability but creates a large writing/catalog-validation pass.

##### Failure mode 7 - ownership, law, witness, and reaction are not optional metadata

Taking a stool from an abandoned cell, a staffed tavern, a shrine, a refugee camp, and a noble's office
are different acts. Free local object minting without inherited ownership and witness context becomes an
economy, stealth, and social exploit.

**Required mitigation:** improvised objects inherit owner/claimant, access, witness, ordinary value, and
disposition defaults from their room/fixture/group unless overridden causally. Promotion into inventory
atomically removes or changes the room assertion and triggers relevant theft, permission, relationship,
or evidence events. One object cannot exist simultaneously in the room and the character sheet.

##### Failure mode 8 - visual and semantic space can disagree

The research correctly insists that mechanically meaningful things require legal footprints/sockets and
access. On-demand physical nouns can overlap a doorway, occupy nonexistent wall support, block an aisle,
or fail to appear in the renderer.

**Required mitigation:** compile latent typed capacity and legal candidate positions with the room;
instantiate against that capacity; reserve/update it transactionally; project promoted objects with a
generic marker/model/icon/text fallback if bespoke art is absent. Later art can refine presentation, but
the player must never have contradictory visual and canonical state.

This is cheaper under the planned graph/grid/representational direction than BG3-grade geometry, but it
is not free.

##### Failure mode 9 - save, ledger, and prompt growth can defeat the graded model

Persisting every narrated adjective would drown storage and the DM digest; persisting nothing destroys
continuity. Duplicating the same assertion in room state, event ledger, DM prose, Codex, and renderer
overlay multiplies cost.

**Required mitigation:**

- store one compact canonical room assertion with references from ledger/prose rather than copying the
  full payload everywhere;
- distinguish unobserved latent reserve, observed lightweight assertion, promoted object, and cold
  historical event;
- keep only the active room/nearby assertions in the DM digest; distant rooms expose counts/version and
  pull-by-id summaries;
- archive old narration separately from mechanical canon;
- compact resolved/removed assertions without deleting their consequential history;
- measure save bytes, digest bytes, synchronous work, assertion count, and promotion rate over long
  seeded campaigns before setting caps.

Even compact records matter because Genesis promises years-long browser worlds. A soak fixture should
include thousands of visited rooms and repeated inquisitive play, not only a clean ten-room dungeon.

##### Failure mode 10 - authoring and testing costs are larger than runtime costs

Runtime lookup against a small reserve should be cheap. The expensive parts are:

- authoring semantic affordance families, properties, exclusions, context substitutions, ownership
  inheritance, reserve curves, search classes, method coverage, and fallbacks;
- giving modders human-readable roller/recipe access without allowing uncontrolled tags to acquire
  system authority;
- defining generic manipulation/action rules for movable, breakable, combustible, containable,
  wearable, climbable, wedge-like, cover-like, tool-like, and consumable objects;
- verifying determinism, alias resistance, spatial legality, no duplication, inventory transfer,
  ownership reactions, knowledge boundaries, event/narration atomicity, save migration, visual parity,
  and performance;
- tuning the boundary so the DM rarely refuses intuitive objects without becoming a wish machine.

Genesis currently has eight principal interactable archetypes plus partial state primitives, not a
universal environmental action ontology. The improvisation promise therefore depends on a substantial
generic-affordance and event system. Without that build, the DM can name more things than the game can
reliably resolve—the exact “promise versus implementation” gap Adam warned about.

##### Relative cost assessment

| Surface | Cost/risk | Why |
|---|---:|---|
| Sparse operational dependency graph itself | Moderate | Small typed graphs, aggregate state, event-driven updates |
| Contextual dressing tables/grammars | High content cost | Purpose x culture x condition x realm expression, even when factored |
| Lightweight assertion/promotion store | Moderate-high | Stable ids, seeds, room ownership, closure, migrations, compaction |
| Shared spatial legality and latent sockets | High but already required | Also solves current dressing/interactable/portal composition gaps |
| Generic environmental affordance/action resolver | High | Turns arbitrary ordinary nouns into honest mechanical play |
| DM proposal/preflight and narration atomicity | High protocol risk | Crosses AI response, validation, latency, correction, and player trust |
| Renderer parity for promoted objects | Moderate | Representational fallback contains art cost; state sync still required |
| Long-campaign persistence/digest containment | High existing dependency | Current localStorage/full-save behavior is already a known wall |
| Verification and mod safety | High ongoing cost | Infinite player phrasing and open-ended content require semantic property tests |

The model is mechanically scalable **only** if most ordinary rooms use a small prevalidated latent
reserve, assertions are compact, promoted objects are rare relative to narration, and the engine
resolves classes rather than asking the AI or a heavy solver for each query. It is not cheap in
architecture or authoring.

##### Revised recommendation

Keep bounded improvisation, but revise the authority contract:

> The DM freely interprets and phrases the room, and may select/propose ordinary dressing from a
> prevalidated contextual latent reserve. The engine owns whether a manipulable noun can exist, its
> stable seed/identity, spatial and semantic legality, exhaustion, ownership, and consequential
> promotion. Ambiguous or high-impact inventions resolve before final success narration.

This is less permissive than “the DM can freely create any plausible ordinary object,” but much more
reliable. It preserves tabletop responsiveness because the engine prepares flexible unused capacity
instead of a closed object list. It also honors the research boundary: the DM performs a licensed world;
it does not repair a missing room program or invent physical truth the engine cannot preserve.

##### Required acceptance gates seeded by this audit

- equivalent noun/affordance queries return one stable result and cannot refill a reserve;
- a systematic sweep closes only declared classes/methods and never an infinite noun universe;
- same room, seed, state, and query produce the same assertion across reload/model variation;
- every narrated manipulable noun has an accepted assertion or preexisting canonical id;
- a rejected consequential proposal cannot be displayed as successful narration;
- promotion preserves seed/properties and cannot reroll a more useful variant under attention;
- pickup/movement/state change updates room, inventory, ownership, witnesses, and visuals exactly once;
- no assertion can create topology, Major treasure, named evidence, a secret, or high Spice without its
  proper authority path;
- every instantiated object occupies a legal reserve/socket or uses an explicit abstract/nonspatial
  representation that cannot claim spatial affordances;
- thousand-room/inquisitive-player soaks stay within save, digest, generation, and active-context budgets;
- the hamlet jail stool, mine pump tool, college-dorm textile, contested-grove supply object, and
  realm-incompatible ordinary-object cases all trace from query through canonization, use, mutation,
  revisit, and DM/visual projection.

**Open follow-up:** should Question 11 adopt this stricter revision—DM freedom as contextual selection,
proposal, and performance over a prevalidated latent affordance reserve, with the engine owning
existence/legality/persistence and preflight required for ambiguous or high-impact physical claims—while
accepting that the generic-affordance resolver, narration atomicity, and long-campaign persistence work
are major implementation expenses rather than small extensions?

#### 10.11.3 Ruling and cross-wave skeptical pass - every accepted ruling through Wave 2 Question 11

Adam accepts the stricter improvisation boundary as more realistic and requests the same skeptical pass
against every other ruling made so far. This section attacks—not merely summarizes—all twenty closed
Wave 1 questions and Wave 2 Questions 1-11 against one another, the indexed research, the current
production seams, realm expansion, long-campaign persistence, modding, player behavior, authoring cost,
and the known “verify-green does not prove wired” failure class.

The classifications used below are:

- **CLARIFY BEFORE SPEC:** the principle can survive, but current language would create an incorrect
  schema or authority boundary;
- **DESIGN FOLLOW-UP:** a material decision remains and must be answered before its owning wave closes;
- **MAJOR EXPENSE:** the theory is coherent but implementation/content/verification cost was easy to
  underestimate;
- **TUNING/ACCEPTANCE RISK:** exact distributions or experience gates determine whether the ruling is
  good in play;
- **VALID LATER-WAVE OWNER:** deliberately unresolved work is acceptable, but the eventual owner must
  prove it rather than treating the prose as already built.

These labels are not rejection votes. The question is whether each ruling has a lawful, affordable path
to production and whether its interactions preserve the intended game.

##### Executive verdict

No accepted ruling should be discarded wholesale. The overall ontology remains unusually coherent.
However, the pass finds:

1. **one direct vocabulary collision:** mandatory original “purpose/builder/operator/doctrine” is
   teleological and cannot describe an unbuilt cavern, emergent ecosystem, or uncreated anomaly without
   inventing intent;
2. **three schema traps:** operational condition cannot be one enum, deterministic latent data cannot
   be seed-only across generator versions, and effective access depth cannot use one value for both
   design-time placement and current post-shortcut accessibility;
3. **four saturation threats:** discoveries/promises, independent Spice roots, latent regional
   commitments, and active player handles can each remain bounded alone while overflowing together;
4. **five major integration expenses:** generic environmental affordances, narration/event atomicity,
   knowledge-safe DM projection, long-campaign storage/materialization, and the shared spatial legality
   compiler;
5. **a cumulative-complexity risk larger than any single ruling:** many sparse, event-driven, lazy,
   “low-runtime” systems can still create a large schema, authoring, migration, validation, and
   integration burden when combined.

Wave 1 need not be silently reopened. Any accepted correction to a closed Wave 1 statement must name
the affected ruling and be recorded as a clarification or supersession. The first such candidate is the
intentional-versus-emergent lineage distinction at the end of this audit.

##### Cross-cutting finding A - the total machine needs a budget, not only each subsystem

Nearly every subsystem is individually bounded:

- a small purpose program;
- a sparse dependency graph;
- a few groups and claims;
- aggregate cohorts;
- latent repeated children;
- a thin DM hand;
- active-room rendering;
- event-driven cadence and state;
- lightweight assertions and knowledge records.

That does not prove their composition is bounded. One active city-prison scene could require purpose,
population, capacity, operational flow, cadence, groups, claims, knowledge, discoveries, cards,
affordances, topology, challenge, inventory, rendering, and event reconciliation simultaneously.
Runtime may still be acceptable while integration becomes brittle and DM context becomes illegible.

**Required correction:** every eventual architecture/spec pass needs a **total active-slice envelope**:
record counts, dependency edges, mutable systems, projected handles, DM digest bytes, materialized
objects, solver work, event applications, save growth, and fallback rates measured together on the same
fixtures. “Each subsystem is cheap” is not acceptance evidence.

The production path should be proven through a thin vertical slice before broad content expansion:

```text
one purpose program
-> one complete roster and dependency chain
-> one population/group/cadence realization
-> one discovery/Spice root
-> one legal room/affordance projection
-> one player mutation
-> persistence, revisit, DM truth, and visual truth
```

This is an architecture and acceptance requirement, not build authorization or a premature unit queue.

##### Cross-cutting finding B - factoring avoids Cartesian code, not interaction writing or QA

Purpose, culture, doctrine, realm, history, state, scale, occupants, cadence, and Spice are factored so
Genesis does not author every full combination. That is correct. But important pairwise and triple-wise
interactions still require content, exclusions, substitutions, and tests. AI assistance lowers drafting
cost; it does not automatically lower taste, duplication, contradiction, IP, probability, or regression
review cost.

Every “large writing pass is welcome” ruling therefore inherits:

- coverage reports over meaningful factor pairs rather than the full theoretical cross-product;
- fallback-quality review when a specific combination lacks custom prose;
- semantic duplication/contradiction lint;
- realm and creature-scale incompatibility fixtures;
- Adam's craft/taste gate for voice-critical content;
- proof that generated variety is actually perceptible in play, not only different in JSON.

##### Cross-cutting finding C - engine authority and AI performance require transactional seams

The redesign repeatedly says the engine owns truth and the DM performs it. The current turn protocol can
still display narration whose typed event failed. Knowledge, object existence, operational changes,
contracts, schedule commitments, and discovery promotions all need the same correction exposed by the
dressing audit: accepted state first or guaranteed prevalidated token, then final player-facing claim.

This is not only a Question 11 expense. It affects every ruling that lets the DM bind, promote, defer,
reveal, schedule, or mutate engine-owned facts.

##### Cross-cutting finding D - permanence is more expensive than generation

The design intentionally accumulates observed rooms, people, groups, private facts, relationships,
promises, objects, state changes, and causal roots over years. Active generation can remain fast while
save migration, storage, replay, compaction, indexes, and prompt retrieval become the dominant cost.
Seed-only latent records also stop being deterministic when algorithms or tables change unless generator
versions and source snapshots/migrations preserve their meaning.

Wave 12 is a valid owner, but every earlier record proposal must already identify:

- the minimum commitment stored before contact;
- generator/table/schema version and provenance;
- what hardens on observation;
- what can compact and what must remain replayable;
- how later code versions materialize the same promised fact;
- the active projection and pull-by-id path;
- corruption/last-known-good behavior.

##### Wave 1 Question-by-question audit

| Q | Accepted ruling under attack | Skeptical finding | Classification and required response |
|---:|---|---|---|
| 1 | Original purpose is permanent engine truth with lore-first authority | Correct for intentionally created sites, but false language for natural caverns, emergent habitats, weather-carved networks, and uncreated anomalies. Forcing a “purpose” invents teleology; forcing a creator invents canon. | **CLARIFY BEFORE SPEC.** Use a broader origin/formation lineage with an intentional-purpose variant. Preserve definite original purpose for constructed sites. |
| 2 | Commissioner, operator, doctrine, tradition, occupants, substrate, era, and consequential workforce define construction identity | A single construction identity does not cover accretion, several building campaigns, mixed natural/constructed sites, or living growth. Mandatory fields would produce null clutter or fabricated builders. | **CLARIFY BEFORE SPEC / MAJOR CONTENT.** Make identity family-typed and layer/episode-specific; only intentional construction episodes require commissioner/operator/doctrine. |
| 3 | Every site has resource ecology filtered by occupancy relationship | The occupancy labels are not mutually exclusive: a predator can be transient and externally dependent; a ruin can be dormant while squatters are self-sustaining. Activating all possible needs everywhere recreates the universal-meter problem. | **DESIGN FOLLOW-UP largely answered by Wave 2 Q2.** Treat relationships as composable facets and admit mutable systems only when causal/player-facing. Historical ecology may remain evidence without active meters. |
| 4 | Age + instability generate zero to three consequential sequential transformations, each with evidence and a handle | “Zero to three” can be misread as all history rather than compressed play-relevant layers. Ancient sites may need more canon; giving every layer an unresolved future handle can create promise debt. | **CLARIFY/TUNING.** The bound applies to generated consequential layers, not total historical events. A handle may be self-contained evidence or closed local leverage, not automatically a campaign card. Stress primordial and heavily rebuilt sites. |
| 5 | Current occupants continue/restore/adapt/squat/exploit/deface/overgrow/contest and may misunderstand inherited function | These verbs overlap. Occupants may restore one system, exploit another, and misunderstand a third. One site/zone enum will flatten the best cases. | **CLARIFY BEFORE SCHEMA.** Store a dominant relationship only for summary; material functions/zones carry sparse facets/claims with provenance. Wave 2 Q8 supplies the stronger model. |
| 6 | The semantic core may become a bounded-place compiler for many site types | This is the largest scope-expansion risk. A ship moves, a sewer is a distributed network, a manor is embedded in urban law, and a living structure may change topology. One universal compiler can become a god-object. | **MAJOR ARCHITECTURE RISK.** Define bounded-site admission criteria and family adapters. Share authority/hierarchy/legality contracts, not necessarily one generation pipeline or one spatial solver. |
| 7 | Every purposeful site receives a complete operating model plus protected variation | “Complete” is only as good as authored purpose profiles and can become an impossible completeness claim for mods. External services can become a loophole that hides missing functions. Core + protected variation can exceed a fixed shell. | **MAJOR CONTENT/VALIDATION.** Each purpose family needs an authored minimum viability contract, honest unknown-profile fallback, explicit external provider requirements, and diagnostic reconciliation. Never imply arbitrary mod purposes are complete because they compiled. |
| 8 | Time-indexed context cascade separates construction context, history, and current use | Construction context may itself be ungenerated, creating circular world-generation demand. A site may have several construction campaigns with different contexts. A strict one-pass cascade can become brittle when later canon hardens. | **CLARIFY BEFORE SPEC.** Store the minimum contextual snapshot/promises needed per construction/transformation episode; do not eagerly generate the whole surrounding world. Reconcile later detail against promises by authority. |
| 9 | Every room/child has a discovery opportunity; major secrets coordinate at site scale; nothing leads nowhere | Across hundreds of repeated children, “reward attention” can still become content, save, prompt, and search bloat. “Must lead somewhere” can accidentally promote every fragment into campaign debt. Critical truths can also become inaccessible if their only holder/evidence route disappears. | **DESIGN/TUNING RISK.** Assembly sweeps may satisfy many child opportunities through shared patterns; quiet confirmation/negative evidence can close locally; only genuinely promissory claims create future obligations; progression-critical truths require fair redundant evidence. |
| 10 | Negotiation/acceptance raises contract priority; a thin hand and service horizons force timely progress | A service guarantee can become narrative teleportation or railroad pressure. “Earliest legal opportunity” may still feel formulaic. Contracts can become impossible through death, destruction, travel, or player neglect. | **MAJOR WAVE 9 EXPENSE.** Horizons must be opportunity/time/context-aware and allow diegetic failure, expiry, renegotiation, substitution, or consequence—never forced success. Scheduler acceptance needs player-agency and repetition tests. |
| 11 | Social places allow several beats; resources/danger/rest plan jointly; inventory is BG-like; preserve golden beats | This question bundled crowd projection, difficulty economy, inventory UX, research process, and migration law. Each is coherent but they should not become one implementation unit. Multi-beat rooms can overload attention; joint supply can become hidden rubber-banding; “golden beat” can freeze accidental legacy behavior. | **VALID SEPARATE OWNERS / TUNING.** Bound foreground beats, generate supplies from site/difficulty plans rather than current HP, keep inventory independently specced, and maintain a finite approved golden corpus rather than preserving every quirk. |
| 12 | Structural scope, operational load, spatial envelope, accommodation, and orthogonal profiles replace master size; rollers remain human-readable | Many first-class profiles can recreate a monolith as an implicit dependency web. Cycles such as capacity -> rooms -> envelope -> capacity may make generation order unstable. Controlled contracts can make “beginner-editable tables” intimidating. | **CLARIFY BEFORE SPEC / MAJOR TOOLING.** Every profile needs one owner, inputs, consumers, legal feedback/reconciliation, cycle diagnostics, and admission rule. Authoring must offer simple defaults plus advanced fields and actionable compiler errors. |
| 13 | Repeated spaces are stable hierarchical children with sparse variation; search uses read/focus/sweep | Stable ids plus opportunities for every cell/bed/room can still grow saves. Coverage/anti-repeat algorithms can falsify dice if they silently override streaks. Sweep closure has the same synonym/negative-domain problem as dressing. | **MAJOR PERSISTENCE/TUNING.** Store indexed child seeds/invariants compactly, persist only contacted deltas, record every coverage correction, allow plausible streaks, and define finite method-sensitive search surfaces. |
| 14 | Decompose the d200 into typed parts and preserved composites; controlled contracts + flavor; recovery proof | This is an enormous subjective migration. Decomposition can destroy the authored relationships that made rows memorable; the semantic registry can become tag bureaucracy and mods can break on vocabulary versions. | **MAJOR CONTENT/MIGRATION.** Retain original row ids/prose, legacy composite fixtures, row-by-row disposition, replacement proof, registry aliases/deprecations, simple authoring presets, and an expressivity comparison against the old d200. |
| 15 | Canon/observations/beliefs separate; knowledge is source-attributed with private scopes and dramatic irony | Per-character confidence/evidence graphs can explode; LLM leakage can occur through any output; dramatic irony invites intentional metagaming. Not every ordinary fact merits a knowledge record. | **MAJOR PERSISTENCE/DM GATE.** Party-shared is the cheap default, private/specialist/contested facts are sparse exceptions, knowledge views are generated before prompting, and all output channels receive leakage tests. Progress cannot depend solely on one permanently lost private fact. |
| 16 | Support, subordinate purpose, occupation, and secrecy are distinct; zero-to-two direct subordinate purposes is a default | Independence can be subjective, and recursive child purposes can reintroduce purpose soup despite a direct-child limit. Large castles/cities may legitimately exceed the default. | **TUNING/SCHEMA.** Require a mini-operating model, distinct goal/operator/beneficiary, and real allocation before promotion to purpose. Add hierarchy-depth/complexity budgets and stress large composites; do not turn every themed cluster into a purpose. |
| 17 | Spice belongs to scoped causal roots; descendants retain independent rolls; no downward ceiling or upward recoloring | Independent NPC, loot, detail, and discovery authority can still saturate a grounded site with unrelated strong roots. Root/manifestation/accent distinctions can be judgment-heavy. | **MAJOR TUNING/VALIDATION.** Keep no tonal ceiling, but enforce independent-root opportunity budgets, active-attention limits, promotion accounting, causal inheritance, and statistical saturation reports across all layers combined. |
| 18 | Occupants claim coherent zones through typed overlapping claims and event-driven fronts | Claim dimensions can multiply into a de facto all-pairs territorial sim; room inheritance may hide meaningful local exceptions. “Contest” can be over-read as combat. | **MAJOR SCHEMA/CONTENT, later tightened by Wave 2 Q8.** Materialize only play-predictive claims/edges, inherit defaults, record sparse exceptions, keep nonviolent outcomes, and measure active projection rather than total theoretical relations. |
| 19 | Reconcile operating model, fixed shell, and likely added variation through combination/externality/annex/causal domains or honest failure | Honest failure is correct for authoring, but a rare legal seed that simply fails can strand generation. Repeatedly adding hidden pockets/annexes to save small sites can make every tiny place feel procedurally suspicious. | **DESIGN/TUNING.** Distinguish invalid authored program, retryable low-authority seed, and genuinely impossible premise; bound retries; preserve diagnostics; measure small-site extra-space frequency/size/repetition and allow embedded juicy handles when spatial addition is not licensed. |
| 20 | Seed semantic topology before play; materialize detail deterministically; separate flexible narrative scheduling from effective-access risk/reward | Dynamic/living/non-Euclidean sites need initial topology plus mutation law, not an immutable future graph. Seed-only latent detail drifts across compiler versions. Effective access changes after shortcuts, faction shifts, or player-created routes; moving rewards/enemies afterward would become reactive scaling. | **CLARIFY BEFORE SPEC.** Fix initial topology and legal mutation rules; store generator/table versions and enough commitments for stable future expansion; separate design-time/planned access depth from current accessibility and never retroactively relocate committed rewards/opposition merely because a shortcut opened. |

##### Wave 2 Question-by-question audit

| Q | Accepted ruling under attack | Skeptical finding | Classification and required response |
|---:|---|---|---|
| 1 | Purpose-family obligation/flow programs author the roster; aggregate event-driven simulation supplies real consequences | A universal obligation shape may re-anthropomorphize natural/living sites or become so generic it says nothing. “Low runtime” hides purpose-family writing, fallback, and reconciliation cost. | **CLARIFY/MAJOR CONTENT.** Share a minimal interface—requirements, flows, dependencies, realization families, provenance—while allowing family-specific semantics. Prove at least one constructed, natural, living, and anomalous vertical trace. |
| 2 | Typed hierarchical light simulation, healthy baselines, provenance-gated crises, buffers/recovery, and soak gates | “Healthy by construction” can sterilize ordinary emergent scarcity or hide arithmetic defects by freezing last-known-good forever. Highest-shared-scope state can create enormous eager fan-out. Units/rates across realms remain difficult. | **DESIGN FOLLOW-UP / MAJOR QA.** Canonical seasonal variance and threshold crossings may initiate pressure when they have modeled provenance; fail-closed needs visible diagnostics/recovery, not silent stasis; dependents update lazily through dirty frontiers; unit/type registries need conversion laws. |
| 3 | Obligations realize through typed rooms/assemblies/shared uses/distributed systems/procedures/external services; cities use bounded hierarchy | Candidate combinations and backtracking can become solver explosion. A city is not a pure tree: utilities, routes, factions, and services cross district/site boundaries. Externalization can defer every hard problem. | **MAJOR ARCHITECTURE.** Use one ownership/materialization hierarchy plus sparse cross-links; commit constrained needs first; cap constructive search; declare degradation; require external service truth; report impossible programs. |
| 4 | Repeated families share truth and vary through factored authority/signature layers across a plural stress corpus | The many variation knobs can become another overfit profile and AI-written signatures may converge to the same generic “personal detail.” Anti-repeat logic can suppress meaningful uniformity or plausible streaks. | **TUNING/CONTENT.** Measure perceptible diversity, repetition, correlation, and quiet rates; preserve authorial dice/provenance; keep invariant-heavy profiles genuinely uniform; use curated expression banks and real counterexamples beyond prisons. |
| 5 | Four allocation layers are Spice-capable; every spicy result is root/manifestation/accent/escalation with mechanized promotion | The same event can be charged to multiple budgets; promotion can turn micro-detail into excessive root debt; classification may depend on interpretation. All-layer Spice plus no downward ceiling creates combined saturation risk. | **CLARIFY/TUNING.** One causal ledger must own cross-layer accounting; define deterministic promotion tests and bounded overflow behavior; report total independent roots/active manifestations, not each layer separately. |
| 6 | Population/demand rolls derive quantities; envelopes are permeable; unrolled neighbors exert hard minimal relational promises | One population estimate risks becoming another master-size variable. Residents, households, workers, visitors, students, prisoners, catchment, and seasonal populations can overlap/double-count. Inbound promises from many generated neighbors can make a future city impossible before it rolls. | **DESIGN FOLLOW-UP / MAJOR RECONCILIATION.** Use a canonical population bundle with non-overlapping count owners and typed overlays/drivers, not one scalar; define reciprocal promise merging, conflict diagnostics, saturation, authority, and counterpart splitting before latent regional contracts freeze. |
| 7 | Preserve NPC core; separate occupation, membership, assignment, presence, and cast reason; cast existing population before minting | Aggressive reuse can create “small world” repetition, deterministic first-match bias, or teleporting NPCs. Keeping legacy `role` can freeze a lossy field. One population owner can imply false belonging for migrants/diaspora/mobile people. | **DESIGN/TUNING.** Availability/travel/commitment are hard filters; candidate selection needs fair novelty/fit weights; `countOwner` is accounting, not identity; migration transfers counts explicitly; legacy role is compatibility display, not permanent schema authority. |
| 8 | Cohorts/groups/factions/actors are distinct; claims/relationships are sparse; plural hidden memberships and event-driven fronts are first-class | “Create a group only when collective state matters” is partly hindsight: an unnoticed cult can matter before the party knows. Hidden memberships can leak through summaries. Group formation/split history and count conservation are complex migrations. | **MAJOR IMPLEMENTATION/KNOWLEDGE.** Store deterministic latent group candidates when causally licensed, activate on consequence/attention, partition canon from party knowledge, and prove headcount/membership transitions through formation/split/merge/dissolution fixtures. |
| 9 | Operational state is tracked per capability/flow with partial, dormant, substituted, blocked, failed, repurposed, and destroyed distinctions | These labels are not mutually exclusive. A capability may be partly blocked, strained, substituted for one cohort, and physically intact at once. Encoding the vocabulary as one enum would immediately lose truth. | **CLARIFY BEFORE SPEC.** Factor operational condition into availability/coverage, performance, mode, access/claim, physical integrity, demand/load, scope, cause, and recovery; derive friendly labels and site summaries from those dimensions. |
| 10 | Layered cadence and coverage slots create temporal life while most populations stay aggregate | Perfect schedules make people clockwork and invite metagame waiting. Lazy projection can spawn an actor despite travel time or a conflicting commitment. Realm cycles and calendars can become a time-standard problem. | **DESIGN/TUNING.** Store cadence windows, commitments, travel/availability constraints, bounded variance, and knowledge confidence rather than omniscient exact whereabouts; named conflicts reconcile before casting; realm cycles map through typed local calendars. |
| 11 | Sparse dependency/handle flows plus prevalidated latent affordances let the DM support environmental creativity | The adversarial audit already found the central hole: every manipulable noun is potentially mechanical. Current dressing, event, persistence, inventory, and renderer paths cannot satisfy the promise as-is. | **MAJOR CROSS-SYSTEM EXPENSE; stricter ruling accepted.** DM selects/proposes/performs; engine validates existence, identity, legality, ownership, exhaustion, promotion, action consequences, and transactional narration. |

##### Direct ruling interactions that need explicit combined gates

1. **Purpose truth x natural/living grammars:** intentional purpose must become one lineage variant, not
   a universal teleology.
2. **Every-room discovery x stable repeated children x years-long saves:** child opportunities need
   compact assembly representation, aggregated sweep, and sparse contacted deltas.
3. **No downward Spice ceiling x all-layer Spice x spicy-small-site preference:** preserve surprising
   children while measuring total unrelated roots and active attention load.
4. **Healthy-by-construction x “spicy restaurant”:** juicy variation is not synonymous with crisis.
   Stable places can be strange, personal, secretive, contested, or opportunity-rich without every
   resource system failing.
5. **Human-readable modding x controlled semantic contracts:** simple edits need defaults/presets;
   advanced authority needs validated namespaced fields. Mod friendliness cannot mean unvalidated tags.
6. **Fixed topology x living/realm-changing sites:** initial graph truth and legal mutation grammar must
   coexist; mutation never licenses the DM to invent a retroactive edge.
7. **Deterministic latent detail x evolving tables/code:** store generator/table version and sufficient
   commitments; a bare seed is not forever determinism.
8. **Effective access depth x shortcuts/state changes:** design-time placement and current accessibility
   are separate. Earned shortcuts change play, not the historical location/value of already committed
   content.
9. **Thin DM context x abundant player handles:** active projection must rank handles and unknowns
   without deleting canon; total digest/attention budgets need fixture evidence.
10. **DM freedom x engine-owned decoration:** reactive description remains rich, but physical nouns and
    consequential claims must consume prevalidated authority and persist transactionally.
11. **Latent neighboring places x permanent authority:** inbound promises need reciprocal aggregation and
    conflict resolution before later materialization; first writer cannot reserve an unlimited future
    city.
12. **All facts persistent x browser longevity:** canonical storage, hot projection, cold prose,
    migrations, and compaction are part of the product promise, not Wave 12 cleanup.

##### Expenses most likely to be underestimated

| Expense | Why it hides during design discussion |
|---|---|
| Controlled semantic vocabulary and compiler | Each individual tag looks small; inheritance, aliases, conflicts, versions, mod namespaces, diagnostics, and migrations are the real system |
| Purpose/ecology content | Factoring avoids full combinations but still requires minima, variants, pairwise interactions, context exclusions, substitutes, and authored fallbacks |
| Generic environmental action model | “Let players use dressing” implies physics/affordances, ownership, inventory transfer, state, evidence, tactical effects, and renderer parity |
| AI/engine transactional protocol | Typed events exist, but guaranteed event acceptance, preflight, correction turns, latency, and narration consistency are not solved by validation alone |
| Knowledge-safe projection | Hidden canon, private holders, false beliefs, cards, maps, objectives, prompts, and visual tells create many leakage channels |
| Deterministic lazy persistence | Stable ids/seeds are easy; cross-version expansion, snapshotting, compaction, replay, and migrations over years are hard |
| Statistical taste gates | “Spicy but not saturated,” “varied but coherent,” “healthy but not bland,” and “alive but not busywork” require distributions and play evidence, not unit tests |
| Integrated acceptance rigs | Every subsystem can pass alone while the city-prison vertical path is slow, contradictory, overfull, or absent from the production route |
| Human review | AI makes writing plentiful; Adam still owns taste, and more generated content increases—not eliminates—the selection and regression burden |

##### What this audit does not recommend

It does **not** recommend flattening the game into static prose, discarding light simulation, reducing
Spice to a global tone dial, eliminating free environmental interaction, returning to independent room
rolls, or delaying all architecture thinking until every questionnaire answer exists. Those moves would
remove the intended product advantage rather than solve the engineering problem.

It recommends a stricter discipline:

- one canonical owner per kind of truth;
- factored variants instead of anthropomorphic universal fields;
- total active-slice and persistence budgets across systems;
- transactional DM/engine claims;
- versioned deterministic latent commitments;
- vertical production-path evidence before corpus expansion;
- explicit acceptance of content/QA cost rather than repeatedly calling every sparse subsystem cheap.

##### Material follow-up queue generated by the skeptical pass

These questions must be exhausted one at a time before Wave 2 can close; findings that touch closed Wave
1 must be recorded as explicit clarifications if Adam accepts them:

1. **Intentional versus emergent site lineage:** replace universal purpose/builder language for natural,
   living, and anomalous sites without weakening constructed-site purpose truth.
2. **Total complexity envelope:** decide the end-to-end active-site budgets and vertical-slice proof
   required before any broad implementation spec claims affordability.
3. **Discovery scaling:** clarify what “one opportunity per room/child” means across huge repeated
   assemblies, systematic sweeps, quiet results, and promise debt.
4. **Operational-state factorization:** reject a single state enum and determine the minimal independent
   dimensions from which summaries derive.
5. **Latent determinism across versions:** decide what must be stored beyond a seed and how table/compiler
   changes preserve unobserved promises.
6. **Planned versus current access depth:** protect committed reward/challenge truth while shortcuts,
   occupation, destruction, and knowledge change current reachability.
7. **Latent regional-promise reconciliation:** prevent many already-generated places from overconstraining
   an unmaterialized neighbor.
8. **Integrated saturation:** measure discoveries, roots, groups, states, cards, and handles together,
   not only in their separate budgets.
9. **Transactional DM claims:** generalize the accepted dressing correction to contracts, discoveries,
   knowledge, schedules, and environment mutations.

The remaining question 11 flow ruling and its bounded-improvisation follow-up are accepted in principle,
but Question 11 does not close until this generated queue has been worked through or assigned without an
unresolved material consequence.

##### First skeptical follow-up - intentional purpose versus emergent origin

The current Wave 1 language should remain exact for built institutions:

```text
constructed site
  -> commissioner / creator
  -> intended purpose and beneficiaries
  -> original operator and doctrine
  -> design tradition, intended users, substrate, era, workforce where consequential
```

But other purpose families need equally definite non-teleological lineage:

```text
natural formation
  -> formation processes, substrate, age, environmental flows, sustaining/altering forces

living site or colony
  -> organism/collective lineage, biological imperatives, ecological role,
     growth/renewal process, symbioses and pressures

emergent anomaly
  -> originating event/condition/law, affected domain, persistence mechanism,
     attractor/behavior, containment or relationship where one exists
```

A living structure may have an intentional creator; a cavern may have been deliberately expanded; an
anomaly may have been engineered. Those facts add construction/transformation episodes rather than being
assumed by family. Likewise, “ecological function” describes what a formation does in a system, not what
someone intended it to do.

The broader canonical record can be thought of provisionally as **site lineage**:

- family and origin/formation mode;
- intentional purpose only when intent exists;
- origin agent/process/event and provenance;
- formation/construction episodes in time order;
- original ecological/operational role where meaningful;
- later transformations, current uses, and occupant beliefs kept separate.

This preserves the strongest Wave 1 principle—Genesis knows how the site came to be and does not let
present occupants overwrite it—without forcing every cave to have a builder or every organism to have a
commissioner.

**Recommendation:** explicitly clarify Wave 1 Questions 1, 2, 7, and 8 so **definite site lineage** is
universal, while **definite original purpose and construction identity** are mandatory only for
intentional construction episodes. Natural, living, and anomalous families receive definite origin,
formation, ecology/imperative, and persistence records instead of fabricated teleology.

**Open skeptical follow-up:** should this intentional-versus-emergent lineage distinction amend the
closed Wave 1 vocabulary while preserving all existing purpose authority for constructed sites?

#### 10.11.4 Follow-up - exceptions to the four-family lineage sketch

Adam accepts the intentional-versus-emergent distinction and asks whether the proposed constructed,
natural, living, and anomalous families overlook other cases. They do. Those four remain useful
**authoring grammars**, but they are not a complete ontology of how places come into existence.

The mistake would be replacing one universal “purpose/builder” template with a different closed enum.
Many strong fantasy and ordinary-world sites cross families, lack a single creator, or inherit identity
through copying, relocation, merger, designation, or recurring formation.

##### Exception 1 - collective and vernacular construction without one commissioner

A refugee camp, shantytown, bazaar, pilgrim settlement, frontier stockade, informal college quarter, or
generations-old village may be intentional in aggregate without one commissioner, plan, operator, or
construction date. Households and groups add structures incrementally in response to shared needs.

The site can still have purposes and operating practices, but its origin agency is **distributed and
accretive**. Inventing one founder or doctrine would erase meaningful social history. A later authority
may formalize, regulate, wall, tax, or rename it without becoming its original creator.

##### Exception 2 - anthropogenic but unintended places

People or machines can cause a navigable site without intending to create that site:

- a mine collapse opens a connected underworld;
- abandoned extraction voids become a settlement;
- quarrying exposes an older complex;
- siege damage joins cellars and drains;
- waste, spoil, wreckage, or repeated traffic forms usable terrain;
- a magical experiment leaves a persistent folded space.

These have causal agents and evidence but no original site purpose. The initiating activity had a
purpose; the resulting place was a byproduct or accident. `agent != commissioner` and
`cause != intended purpose` must remain legal.

##### Exception 3 - self-building, automated, and inherited-intent sites

A site may grow or assemble according to a program, instinct, artifact, dead creator's instruction, or
realm law:

- an ancient machine extends a facility after its makers vanish;
- a living fortress grows rooms in response to occupants;
- constructs replicate a forgotten template;
- a colony's local behavior produces architecture without central intention;
- a wish, divine decree, or ritual manifests a complete place without workforce or design tradition.

Intent may exist at a distant source while current formation is automated or self-organizing. Record
the program/imperative and its provenance; do not invent a present operator. “Constructed” and “living”
can both be true.

##### Exception 4 - socially designated places without architectural creation

A sacred grove, market square, execution field, border, meeting stone, customary refuge, temporary
court, or prison camp can become a meaningful bounded site because people **designate, claim, ritualize,
or repeatedly use** an existing place. The institution has purpose, law, schedule, and social function,
but the ground itself may be natural and largely unbuilt.

The lineage needs a designation/institution episode layered over formation. Social purpose does not
retroactively become the land's physical origin.

##### Exception 5 - composite, grafted, and palimpsest sites

Some sites are not one lineage with several later states. They combine components with distinct origins:

- a cathedral built through a giant's ribcage;
- a prison inserted into a natural cavern and linked to a pocket-realm cell bank;
- a manor assembled around an older watchtower over an even older crypt;
- a town occupying the deck and interior of a stranded planar vessel;
- a living colony grafted onto machinery;
- several buildings joined by siege tunnels into one explorable complex.

Each component/domain retains its own lineage. A later **join/graft/integration episode** explains why
the engine now treats them as one bounded navigable site. A single flat construction record would force
one component's origin onto the others.

##### Exception 6 - copied, echoed, mirrored, and relocated sites

A place may inherit from another without sharing its location or full history:

- a fortress is physically moved stone by stone;
- a ship, walking castle, caravan, or migrating habitat changes location while retaining identity;
- a realm produces an echo or corrupted copy of a town;
- a dream, memory, illusion, simulation, or ritual reconstruction reproduces a known place;
- a demiplane snapshots a prison wing and later diverges;
- a Breach grafts part of one domain into another.

The model must say whether identity is **continued, relocated, copied, echoed, projected, or forked**.
A copy inherits source relationships and selected facts but gains its own id, subsequent events, and
divergence. Relocation changes location, not origin. A convincing projection may be physically
actionable and persistent without being ordinary matter.

##### Exception 7 - mobile, temporary, seasonal, and dissolving sites

Not every bounded site is stationary or permanent:

- a caravan, fleet, marching camp, siegeworks, festival grounds, migrating hive, or walking fortress;
- an ice palace that melts, a tidal complex accessible only at low water, or a fungal city that fruits
  seasonally;
- a dream site that exists only during a recurring condition;
- a pocket realm sustained while a ritual, creature, or artifact remains active.

These still need stable identity and lineage while location, footprint, availability, or material form
changes through cadence/events. “Temporary” is a lifecycle, not permission to regenerate the site from
nothing on every visit.

##### Exception 8 - ongoing formation rather than a finished origin

Caves erode, deltas deposit, coral grows, cities accrete, hives renew, and impossible geometries may
continuously rewrite themselves. The origin is not only a past event. Formation can remain an active
process with rate, conditions, boundaries, and evidence.

Ordinary gradual change should update through coarse events/thresholds, not continuous geometry
simulation. Material topology changes still require Wave 8's explicit mutation authority. The lineage
record identifies the ongoing process that can lawfully generate those events.

##### Exception 9 - split, merge, and disputed site identity

One site can divide into independently operating sites; several can merge under one circulation or
institutional boundary. Occupants, law, cartography, and the engine may disagree about whether a
gatehouse, annex, Breach domain, or inhabited wreck is “part of” the same place.

The engine needs a stable canonical hierarchy/relationship while allowing in-world classifications and
beliefs to differ. Site identity is not determined solely by what inhabitants call it. A split/merge
event preserves former ids and relationships rather than deleting history.

##### Exception 10 - recursive, acausal, plural, or canonically indeterminate origins

High-Spice sites may deliberately violate ordinary origin assumptions:

- a time-looped archive was built from plans recovered from its own future ruins;
- each realm contains an equally original version;
- the site has no first construction event inside ordinary time;
- several mutually incompatible origins are simultaneously true under a realm law;
- the site changes origin when a defined ritual, observer, or timeline condition changes;
- the canonically correct fact is that no single origin exists.

This must not become an excuse for missing data or AI contradiction. **Canonically indeterminate** is a
positive, licensed rule with a scope, behavior, evidence, constraints, and Spice authority. The engine
may know that the origin is plural/recursive/observer-dependent even when it cannot store one ordinary
first event. Grounded sites do not receive this escape hatch because their author forgot to decide.

##### Exception 11 - player-created and campaign-transformed sites

Players may build a bastion, join rooms, redirect a mine, establish a shrine, settle a ruin, grow a
living refuge, move a camp, or create a portal network. The lineage model cannot be generation-only.
Typed construction/designation/growth/join/split/relocation events must append campaign-created episodes
with player agency and evidence while preserving the prior site.

##### A simpler underlying model - lineage episodes rather than more top-level families

Do not create eleven new mutually exclusive site families. Keep purpose-family grammars for authoring
and use a composable lineage record beneath them. A provisional `LineageEpisode` needs concepts like:

```text
episode id and time/order
mechanism: construct / excavate / grow / erode / deposit / manifest / designate /
           transform / integrate / graft / copy / echo / relocate / split / merge / dissolve
agency: none / individual / collective / institution / organism / automated program /
        realm law / plural or canonically indeterminate
intent: intended site / intended process with site as byproduct / accidental /
        instinctive or self-organizing / recursive or not applicable
source domains or parent lineages
resulting domains/site relationship
purpose, imperative, ecological role, or behavior only where each genuinely exists
duration: instantaneous / phased / accretive / ongoing / cyclic
continuity: new identity / continuation / relocation / copy / fork / graft / merge / split
evidence, surviving constraints, provenance, and Spice license
```

These labels are conceptual, not a final schema or giant set of mandatory fields. Ordinary sites use a
short linear sequence and compact defaults. Only copied, merged, grafted, split, or acausal sites need a
small lineage graph. The representation should therefore be **linear by default, graph-capable by
exception**, preventing every hamlet jail from paying for cosmic genealogy.

This also sharpens existing distinctions:

- **purpose** is intended function;
- **imperative** is organism/program behavior without assuming reflective intent;
- **ecological role** is what the site does in a system, not why it was created;
- **current use** is what present actors do there;
- **designation** is a social/legal/ritual episode that may add purpose without rebuilding the place;
- **belief** is what an actor thinks the lineage/function is;
- **origin uncertainty known by characters** is knowledge state;
- **canonical plural/recursive origin** is a rare ontology fact, not uncertainty or missing data.

##### Cost and guardrails

This is mostly a semantic correction, not permission for an elaborate ancestry simulator. The hidden
cost appears only if every site eagerly stores a general graph or every mechanism becomes a custom
engine branch.

Guardrails:

- one or a few episodes for ordinary generated sites;
- graph edges only for actual copy/graft/merge/split/source relationships;
- stable shared mechanism vocabulary with realm extensions, not per-realm lineage engines;
- optional fields selected by mechanism/agency, avoiding universal null-filled records;
- no canonically indeterminate origin without explicit high-authority/Spice license and behavior rules;
- ongoing processes update through coarse events and thresholds rather than continuous shape ticks;
- movement/temporary availability changes site location/state without rerolling identity;
- current-use overlays and beliefs never rewrite lineage;
- player-created episodes use the same event/provenance path as generated ones;
- compact summaries reach the DM; full lineage stays pull-by-id unless currently relevant.

##### Revised recommendation

Accept **definite, composable site lineage** as the universal Wave 1 truth. Keep constructed, natural,
living, and anomalous purpose-family grammars as useful ordinary authoring routes, but do not treat them
as an exhaustive exclusive origin enum. Represent ordinary lineage as a short ordered episode list and
permit source/join/copy/split/recursive relationships only when causally licensed.

This catches collective/vernacular, accidental/byproduct, designated, self-building, composite,
relocated, copied, mobile, temporary, ongoing, player-created, and canonically plural sites without
weakening the original-purpose law for actual intentional construction.

**Open follow-up:** should the Wave 1 clarification use this linear-by-default, graph-capable-by-exception
lineage-episode model, including explicit support for collective intent, unintended byproducts,
designation, copying/relocation, composite sites, ongoing formation, and rare canonically
plural/recursive origins?

#### 10.11.5 Ruling and further exception - lineage is not boundary, institution, or compile scope

Adam accepts the expanded lineage model as a useful clarification and asks whether any other exception
remains. One deeper category does: lineage explains **how something came to be**, but does not by itself
decide what counts as one site, which physical/ontological space it occupies, which institutions use it,
or how much of it the engine can finitely compile.

Conflating those concerns would break several important cases.

##### Overlapping sites and institutions can share one substrate without merging identity

The same grove can simultaneously be:

- a natural ecosystem;
- a druidic sacred site with ritual authority;
- a refugee settlement with residential and supply needs;
- a legal preserve recognized by a city;
- a contested military approach.

These are not merely five “current functions” on one flat site record, nor must they become one blended
purpose. They may have different lineages, boundaries, operators, beneficiaries, schedules, knowledge,
and claims while sharing physical ground. Likewise, a market operates in a civic square, a college
occupies several older buildings, and a prison institution may span a fortress wing plus leased
Breach-cell domains.

Current occupation, subordinate purpose, and typed claims cover much of the play, but the architecture
must not force every institution or place identity sharing geometry into one lineage.

##### One site can be spatially distributed or discontinuous

A mage prison may consist of an intake building, a remote administrative archive, and many portal-linked
cell domains. A monastery may own isolated hermitages. A sewer authority, mine, canal system, caravan,
or fortress network may function as one institution across separated spaces and routes.

The operational whole can be one site/institution for purpose and simulation while its navigable domains
are geographically or physically disjoint. Connections remain explicit typed routes/portals; “one site”
does not imply one contiguous polygon or one renderer plan.

##### A place can also be an entity

A living fortress, colossal corpse, walking castle, sentient ship, world-tree, mimic colony, or
slumbering god may be both:

- an actor/entity with identity, state, motives, injury, knowledge, and relationships; and
- a navigable domain containing rooms, occupants, flows, topology, and discoveries.

Duplicating it as an unrelated NPC/creature and site creates drift. One canonical identity should link
entity and place facets. Death, awakening, movement, injury, growth, or transformation may affect both
through typed events. The corpse of a creature may become a new site lineage episode without pretending
it was always architecture.

##### Site identity can outlive or diverge from its physical fabric

A fortress can be rebuilt completely and still be regarded canonically as the same fortress; an
institution can move to another building while the old shell retains a separate place identity; a ship
can replace every plank; a copied town can fork from the original; ruins may remain historically real
after no navigable structure survives.

Therefore continuity cannot be inferred only from shared coordinates or materials. Construction,
relocation, copy, institutional succession, destruction, abandonment, and social recognition provide
evidence, but a typed continuity/split/merge event must decide whether the canonical id persists, forks,
or leaves a predecessor/successor relationship.

Destroyed/former sites should retain lineage and evidence even when they no longer qualify for active
bounded-site compilation.

##### Canonically unbounded sites cannot have a fully seeded finite topology

Wave 1 Question 20 correctly requires the complete topology of a **bounded site** before exploration.
But realm expansion creates places whose canon is infinite, indefinite, recursively generated, or larger
than any finite graph:

- an endless archive or maze;
- a realm-spanning root network;
- a dream city that always has another district;
- a procedural afterlife with no final outer wall;
- a fractal Breach domain;
- a wilderness-like underworld containing many bounded complexes.

Pretending to pre-generate its entire topology is impossible. Quietly rolling arbitrary new doors on
entry would violate the coherence law.

There are two legal representations:

1. **Realm/journey representation:** the unbounded domain remains a realm, region, wilderness/urban
   walk, or network that contains discoverable bounded sites. Question 20's full-topology rule applies
   to each bounded site, not the entire realm.
2. **Stable frontier representation:** if the unbounded domain itself is locally navigated room by room,
   seed its topology grammar, invariants, recurrence/branch laws, origin/physics, stable explored graph,
   and deterministic frontier commitments. Every materialized edge/node becomes permanent canon; the
   unbounded frontier remains a lawful generative process rather than an already finite hidden graph.

The second case is a true exception to “all topology exists before exploration” and requires explicit
Wave 3/4/12 design. It must not become the default dungeon generator or an excuse to improvise finite
sites door by door.

##### Compilation scope is not canonical extent

Even a finite city prison may be too large to render or fully materialize at once. Conversely, one room
inside an infinite archive may be compiled in precise detail. The active plan is a **materialization
window**, not the truth about how much site exists.

This reinforces the already accepted distinction between canonical scope and realization resolution,
but extends it to unbounded domains:

- canonical domain says finite, indefinite, recurring, or unbounded and stores its laws;
- stable materialized topology records everything already generated/observed/promised;
- active compilation selects a bounded local slice with legal interfaces to latent or unbounded
  frontiers;
- renderer/DM context receives only that slice;
- leaving the active window does not delete, reroll, or contract canonical extent.

##### Recommended conceptual separation

Use four provisional concepts, without freezing names or schemas:

```text
domain / substrate
  owns space, topology, physics, extent, mobility, and material form

site identity / lineage
  owns canonical place identity, origin episodes, continuity, predecessors/successors,
  and relationships among one or more domains

institution / ecology / occupation
  owns purpose or imperative, operators/populations, operating model, use, claims,
  and may overlap other institutions on shared domains

materialization window
  owns the finite semantic/spatial/render/DM slice currently expanded;
  never decides canonical extent or identity
```

Most ordinary places collapse these cleanly in practice: one jail identity, one building domain, one
jail institution, one active local plan. The separation costs little until an exception needs it.

##### Guardrails

- do not mint a separate site for every claim, faction, or temporary use; an independent identity needs
  persistent lineage/boundary/institutional meaning that predicts play;
- do not force overlapping institutions to share one purpose lineage merely because they share cells;
- distributed sites use explicit route/domain relationships rather than fake continuous geometry;
- entity/site dual citizenship uses linked facets over one canonical identity, not duplicated nouns;
- continuity/fork/merge is event-owned and provenance-preserving, never inferred from a name match;
- former/destroyed sites keep lineage but need no active site program when nothing navigable remains;
- unboundedness requires explicit canonical license and topology/frontier laws. Missing scope data is not
  “infinite”;
- ordinary bounded sites retain complete seeded topology before play;
- stable-frontier generation stores versioned invariants and every committed edge/node; it cannot reroll
  explored space;
- materialization windows stay bounded and must expose honest frontier/route interfaces without
  pretending the unseen extent is already rendered.

##### Revised recommendation

Lock the lineage-episode clarification together with this separation of **domain, site identity,
institution/occupation, and materialization window**. Add a narrowly licensed unbounded/stable-frontier
exception to Question 20 while preserving full pre-entry topology for ordinary finite bounded sites.

This covers overlapping sacred/social/ecological places, distributed portal institutions, living
entity-sites, destroyed/predecessor sites, Ship-of-Theseus continuity, and infinite realm domains without
turning the ordinary hamlet jail into a four-record bureaucracy. Ordinary cases may compile these
concepts into one compact bundle; exceptions keep them distinct.

**Open follow-up:** should this final boundary/identity clarification accompany the accepted lineage
model—especially the rules that overlapping institutions may share a domain, entity-sites use linked
facets, canonical identity can outlive material fabric, and truly unbounded domains use realm/journey or
versioned stable-frontier generation rather than pretending their complete topology is finite?

#### 10.11.6 Final skeptical clarification — definite lineage, separate boundaries, narrow unbounded exception

Adam accepted the revised recommendation and guardrails.

The universal requirement is now **definite site lineage**, not an assumption that every site was
intentionally designed and built. Original purpose, commissioner, builder, operator, and doctrine are
mandatory only for lineage episodes involving intentional construction. Other legal origin episodes
include natural formation, living growth, emergent anomaly, collective or vernacular accretion,
unintended anthropogenic byproduct, automated or self-building formation, later social designation,
composite/graft formation, copy/echo/relocation, mobile or temporary embodiment, split/merge continuity,
player creation, and rare canonically plural or recursive origins.

Lineage is linear by default. It becomes a small provenance graph only when the canonical facts require
sources, copies, grafts, splits, merges, or recursive formation. The engine keeps **intended purpose**,
**behavioral imperative**, **ecological role**, **social designation**, **current use**, and **belief**
separate so one cannot silently rewrite another.

Four concepts are therefore distinct even when an ordinary jail compiles them into one compact bundle:

```text
domain / substrate
  owns space, topology, physics, extent, mobility, and material form

site identity / lineage
  owns canonical identity, origin episodes, continuity, and predecessor/successor relationships

institution / ecology / occupation
  owns purpose or imperative, operators/populations, operating model, current use, and claims

materialization window
  owns the finite active semantic/spatial/render/DM slice, never canonical extent or identity
```

Consequences:

- two or more institutions may overlap one domain without merging their identities or lineages, as with
  the druids and refugees sharing and contesting the Grove;
- a distributed institution may span discontiguous domains through explicit typed routes or links;
- a living fortress, ship, world tree, or similar entity-site uses linked entity and site facets over one
  canonical identity rather than duplicated nouns;
- canonical identity may survive replacement or destruction of material fabric; split, merge, copy, and
  continuity are explicit provenance-preserving events rather than name-based guesses;
- destroyed or former sites retain lineage without requiring an active navigable program;
- ordinary finite bounded sites still receive complete mathematical connection topology before entry;
- a canonically unbounded domain uses either the realm/journey representation containing bounded sites,
  or a narrowly licensed **stable-frontier** process that fixes topology grammar, laws, and invariants,
  permanently canonizes every generated node and edge, and never improvises away explored space;
- a materialization window is only the finite active slice, not a claim about the site's total extent.

This explicitly clarifies Wave 1 Questions 1, 2, 6, 7, and 8 wherever their language assumed an
intentional construction episode, and Question 20 wherever “complete topology before entry” was read as
applying to canonically unbounded domains. It does **not** weaken Question 20 for ordinary finite sites.

Future ownership is assigned as follows:

- Wave 2 supplies family-specific purpose, imperative, ecology, occupation, and operating-model profiles;
- Waves 3–4 own domain boundaries, topology, discontiguous links, entity-site spatial interfaces, and the
  narrow stable-frontier realization contract;
- Wave 8 owns formation, movement, destruction, restoration, copy, split, merge, and continuity events;
- Wave 12 owns lineage/domain schemas, deterministic persistence, versioning, migration, and replay;
- later place/NPC work owns entity-site dual citizenship and identity-safe projection.

The intentional-versus-emergent lineage skeptical follow-up is exhausted.

#### 10.11.7 Skeptical follow-up 2 — how much total machinery may be active at once?

The next integration risk is cumulative cost. Each accepted subsystem may be individually lightweight,
yet a crowded city prison could simultaneously activate repeated cells, shift staffing, several groups,
a resource shortage, multiple secrets, a due contract, object improvisation, persistence, DM projection,
and rendering. Per-system caps alone do not prevent their sum from overloading the browser, the AI DM,
the save, or the player's attention.

##### Option 1 — independent cap for every subsystem

Each system stays under its own local maximum. This is easy to implement locally, but ten systems at
their safe local maximum may still be unsafe together. No owner can answer whether the current active
slice as a whole is affordable. **Not recommended.**

##### Option 2 — one universal complexity-points number

Everything spends from one scalar pool. This is superficially simple, but one renderer object, one save
record, one DM token, one graph edge, and one player-facing decision are not interchangeable costs. A
single number also hides hard ceilings and encourages tuning by folklore. **Not recommended.**

##### Option 3 — typed total envelopes with priorities and graceful work shedding

Keep canonical truth distinct from currently active work. A shared active-slice planner composes bounded
work reported by owning subsystems across several measured envelopes:

- generation/planning wall time;
- active mutable records, graph edges, and scheduled events;
- persistence bytes and save/write work;
- DM digest size, model round trips, and latency;
- renderer objects, geometry, lights, and projection work;
- player-facing salient handles and unresolved cognitive load;
- developer/QA complexity as a separate admission gate for adding a new persistent mechanism.

The exact thresholds should not be invented during questionnaire design. They should be set from
production-path profiling, including p50, p95, and worst-case traces.

Work receives a service priority, not a claim to equal simulation time:

```text
P0  immediate player action, observed hard truth, or a required answer
P1  due consequence, accepted contract, or visibly changing state
P2  nearby supporting dependency or plausible next interaction
P3  optional local detail and prefetch
P4  distant speculative expansion
```

When an envelope is tight, the system may aggregate cohorts, share operating-system records, send compact
DM summaries with pull-by-id detail, delay optional materialization, select signature manifestations,
reduce decorative projection, schedule not-yet-due cards, or evict cold detail from active memory while
preserving it in canonical storage. It may never drop an observed fact, a core obligation, a due event,
critical evidence, or a player's immediate legal action. An immediate P0 action may temporarily borrow
capacity by evicting or delaying lower-priority work, then compact afterward.

The planner must not become a god object. Subsystems retain ownership of their truth and expose bounded
work items with a cost class, priority, legal degradation, fallback, and persistence rule. The shared
planner only composes the active slice and records why work was deferred or degraded.

Before large corpus expansion, one adversarial production-path fixture should combine a crowded city
prison shift change, food pressure, multiple groups, a due contract, a secret, an object the player
manipulates, rendering, saving, and revisiting. It should measure turn/generation latency, digest and save
growth, active records/edges/objects, player-facing handles, event backlog, and fallback/defer rates. The
hamlet jail and Leilon dependency cases provide smaller and regional comparisons.

**Recommendation:** adopt Option 3 as an architecture acceptance law, while leaving exact numerical
budgets to measured profiling. Also require any proposed new persistent system to change at least two
meaningful decisions, resist reliable derivation from existing truth, identify its owner/projection/
mutation/persistence/fallback/gate, and demonstrate that it fits the typed total envelope.

**Open follow-up:** should this typed total-envelope rule become binding architecture, including the
principle that canonical truth is preserved while optional active work is aggregated, deferred,
compacted, or evicted by priority?

#### 10.11.8 Challenge — are we treating an ordinary prison workload as an engine crisis?

Adam challenged the premise: a purpose-built simulation such as *Prison Architect* handles substantially
more agents and activity smoothly, so the city-prison fixture does not sound inherently expensive.

That challenge is correct. The example is useful as an **integration fixture**, but it should not be
treated as an expected breaking point or used to justify a small simulation. Hundreds of lightweight
records, room assignments, schedules, group memberships, needs, and event checks are not inherently
large work for a competently structured browser engine. A few thousand compact records and graph edges
are also not, by themselves, an alarming scale. Exact production targets still require profiling rather
than intuition.

The meaningful distinction is not simply **how many people exist**. It is which kind of work the engine
performs for each of them, at what frequency, and which surface receives the result:

```text
light simulation
  compact location, schedule, role, group, need/pressure, condition, and intent state
  updated in batches, on relevant ticks, or in response to events

narrative materialization
  individual history, voice, relationships, secrets, evidence, and interaction affordances
  expanded under contact, attention, or causal relevance

AI-DM projection
  a bounded summary plus ids the DM may request
  never a raw serialization of every actor and unresolved record

visual projection
  nearby visible actors and state, using batching/instancing/culling appropriate to the final engine

persistence
  stable canonical records plus deltas/events
  not a full rewritten snapshot of every unchanged detail on every turn
```

For example, a major prison might keep 400 prisoners as individually stable lightweight actors with
locations, schedules, conditions, affiliations, and current pressures. Twenty nearby or causally salient
people may have fully active interaction models. Five may currently matter to the conversation. The DM
receives a concise description of the visible crowd, relevant groups, named contacts, live pressures, and
available pull-by-id details—not 400 biographies. If the player singles out prisoner 317, that actor's
stable facts and seed materialize into richer detail without creating a replacement person.

This is the already accepted graded-attention model applied to computational work. It preserves real
individuals and a meaningful light simulation rather than replacing the prison with a decorative crowd.

The actual risk is **unbounded heterogeneous work**, such as updating every distant city's population at
full local frequency, pathfinding every actor every render frame, expanding every latent relationship and
secret, rewriting every record into the save, and sending the entire result to the AI DM. A specialized
management game keeps its hot simulation narrow and regular. Genesis has additional narrative,
provenance, persistence, knowledge, discovery, and model-context surfaces, but those costs should be
architecturally isolated rather than answered by shrinking the world.

##### Revised recommendation — capacity-first envelopes, not scarcity-first caps

Retain typed measurement and graceful fallback, but change their design posture:

1. Set ambitious production-path capacity targets first. A dense major institution with several hundred
   lightweight stable actors, multiple groups, operating pressures, events, and visible activity should
   run normally without narrative degradation.
2. Use compact data, batch/event-driven updates, spatial locality, deltas, renderer batching, and graded
   narrative attention to meet those targets.
3. Instrument each typed surface and reserve headroom. Do not spend a fictional universal complexity
   currency during ordinary generation.
4. Aggregate, defer, compact, or evict active work only when measured thresholds or distance/relevance
   policies justify it. Preserve every canonical identity and consequence.
5. Treat visible fallback activation in the normal city-prison fixture as an architecture or
   implementation failure to investigate, not the intended steady state.
6. Keep a pathological combined-load fixture above the target so graceful degradation is still proven.

The city-prison fixture therefore changes role: it is the **minimum dense-simulation acceptance case**,
not the maximum capacity case. The total-envelope rule remains valuable as observability, admission
control for new systems, and a last-resort safety mechanism; it must not become a content rationing system
or a reason to turn hundreds of viable actors into ten.

**Revised open follow-up:** should the binding rule be **capacity-first typed envelopes**—requiring the
ordinary dense-prison case to run at full intended fidelity, measuring each cost surface independently,
and permitting graceful work shedding only beyond proven production targets or for genuinely cold/distant
detail?

#### 10.11.9 Latency challenge — Genesis must never develop a late-game turn barrier

Adam accepted the capacity-first posture with an important qualification: limits are still necessary,
especially in dense cities, where the limited active-stack model is appropriate. His concern was the
actual processing cost and whether Genesis turns could degrade into a late-*Civilization* wait. The
required experience is that the game begins responding almost as soon as the player submits an action.

The prison workload should not create a late-game strategy-game pause. That failure happens only if the
architecture creates a global synchronous turn barrier—for example, scanning or advancing every NPC,
institution, dependency, route, clock, and distant settlement before the current action may resolve.
Genesis must explicitly forbid that model.

Compact state is cheap relative to the other surfaces. Hundreds of nearby actors with small records and
sparse event-driven changes should not dominate a turn. The more plausible latency risks are:

- unbounded per-turn graph scans or per-agent pathfinding regardless of relevance;
- rebuilding large projections or saves instead of applying deltas;
- expanding latent narrative records unnecessarily;
- constructing an oversized DM digest;
- requiring extra AI-model round trips;
- waiting for model inference before streaming any visible response.

The present development bridge documents a strict two-shell-call loop because each agent/tool cycle has
historically cost roughly 10–15 seconds. That is a development harness limitation, not an acceptable
player-facing architecture. The specced API-direct DM seat instead targets one streamed model call per
normal turn. The existing launch law of routine turns within 15 seconds is now only an outer legacy
ceiling; it does not satisfy this redesign's desired response feel.

##### Proposed no-global-turn-barrier law

Submitting an action synchronously advances only its **causal service frontier**:

```text
the player's action and direct targets
  -> current room/view and immediately affected actors
  -> required mechanical resolution and directly touched dependencies
  -> already-due consequences whose trigger is now reached
  -> minimal knowledge-safe DM digest
  -> one streamed narration call on the normal path
```

It does not synchronously advance the entire city or world. Other work uses four mechanisms:

1. **Event queues:** due time/trigger indexes wake only records whose conditions can currently fire.
2. **Coarse regional advancement:** cold settlements and institutions advance through aggregate pressure
   changes and scheduled events rather than resident-by-resident ticks.
3. **Lazy deterministic catch-up:** when a cold place becomes relevant, elapsed time is reconciled from
   its last canonical state, seed, rates, and intervening events without replaying every missed tick.
4. **Bounded between-turn work:** safe prefetch, compaction, and projection may run outside the response
   critical path, but state-changing results enter through versioned events and may not race or retcon the
   active turn.

Dense cities use a limited stack, not a reduced canon:

```text
hot     current action, room/view, direct actors, due consequences
warm    current institution/block, nearby groups, likely next interactions
cool    district aggregates, scheduled pressures, named promises
cold    rest of city and world as persistent cohorts, indexes, and future events
```

Promotion and demotion among these layers changes update frequency and projection detail, never identity
or already established fact.

##### Provisional response-service targets

The targets must separate Genesis's own work from provider/network inference so a slow model cannot hide
an engine regression:

| Milestone | Provisional acceptance target on the supported reference device/network |
|---|---:|
| Input acknowledged and immediate UI feedback | within 50 ms |
| Local action resolution, event application, and digest dispatch — ordinary turn | p95 within 100 ms |
| Local action resolution and dispatch — dense-city acceptance fixture | p95 within 250 ms |
| First streamed narration token, end to end under normal provider conditions | target p95 within 1.5 s |
| Complete routine narrated response | target p95 within 5 s while streaming throughout |

These are ambitious product targets, not claimed current measurements. Model/provider variance needs its
own telemetry and offline/error fallback. Deep, exceptional turns may finish later, but they should still
acknowledge immediately and begin streaming within the same first-response target whenever possible.
Routine turns may not spend an extra AI round trip. High-impact ambiguous actions may use a rarer
preflight path, but the engine should resolve common actions, rolls, and prevalidated environmental
affordances before the single narration request.

Meeting the first-token target likely requires the API-direct seat, a low-latency model tier for routine
beats, prompt-prefix caching, a compact digest, bounded output, immediate streaming, and no synchronous
full-save or world-maintenance work. The player can begin reading while the rest of the response streams;
there should be no silent “processing the world turn” interval.

##### Revised recommendation

Adopt capacity-first typed envelopes together with the no-global-turn-barrier and response-service laws.
The dense prison remains a full-fidelity baseline. Dense cities activate the limited stack only to bound
frequency and projection outside the causal frontier. Treat a p95 local dispatch above 250 ms in that
fixture, or a routine extra model round trip, as a failed architecture gate rather than ordinary pacing.

**Open follow-up:** are these the right experiential and architectural commitments—near-instant local
acknowledgement, sub-quarter-second dense-city engine work, one streamed model call on routine turns, no
full-world synchronous update, and approximately 1.5-second p95 first narration under normal provider
conditions—with exact targets remaining provisional until real API-direct traces can test them?

#### 10.11.10 Ruling — capacity-first limits and near-immediate response

Adam accepts the proposed targets as beautiful. The following are now binding architecture acceptance
commitments, with numerical thresholds provisional until measured API-direct traces either validate them
or justify an explicit revision:

- capacity limits exist, but are measured per cost surface and protect headroom rather than rationing
  ordinary content;
- a dense major institution with several hundred stable lightweight actors, multiple groups, operational
  pressures, events, and visible activity is a normal full-fidelity baseline;
- dense cities use the hot/warm/cool/cold limited stack to bound update frequency and projection, never
  to erase identities, facts, or consequences;
- no player action waits for a full-city or full-world synchronous turn sweep;
- synchronous work follows only the current action's causal service frontier, while indexes, coarse
  advancement, deterministic catch-up, and safe bounded between-turn work handle the rest;
- the normal turn uses one streamed model call; additional model round trips are exceptional and require
  a genuinely ambiguous or high-impact preflight need;
- immediate UI acknowledgement targets 50 ms, ordinary local resolution and dispatch 100 ms p95,
  dense-city resolution and dispatch 250 ms p95, first streamed narration 1.5 seconds p95 under normal
  provider conditions, and full routine narration 5 seconds p95 while streaming;
- engine time and provider/model time are measured independently, so neither can hide the other's
  regression;
- the older 15-second routine launch ceiling remains only an outer legacy failure bound and is not an
  acceptable target experience for this redesign.

The total-complexity-envelope skeptical follow-up is exhausted.

#### 10.11.11 Skeptical follow-up 3 — does one discovery opportunity per room scale?

Wave 1 Question 9 protects one discovery opportunity for every enterable room or repeated child, while
Question 13 makes repeated rooms stable children and permits automatic read, focused inspection, and
systematic sweep. The skeptical audit found a remaining collision: a 400-cell prison should reward
attention in every cell without requiring 400 heavyweight secret packets, 400 future quests, or 400
nearly identical searches.

In plain language, what exactly does “one discovery opportunity per room” promise when a site contains
hundreds of similar rooms?

##### Option 1 — one unique heavyweight discovery packet per room or child

Every cell receives its own independently authored clue, treasure, secret, or story seed. This maximizes
raw uniqueness but makes exhaustive inspection optimal, accumulates save and promise debt, dilutes strong
discoveries, and creates an enormous writing burden. It also turns “nothing leads nowhere” into “every
scratch mark begins a quest.” **Not recommended.**

##### Option 2 — discoveries exist only at assembly, zone, or site scale

The prison-cell block owns a few meaningful discoveries and ordinary individual cells are interchangeable
facades. This is cheap, but it breaks the accepted promise that entering or attending to an individual
room can matter. It would erase the child's-note style of emergence and make repeated spaces feel false.
**Not recommended.**

##### Option 3 — hierarchical discovery ecology with stable child opportunities

Every enterable room or child retains a stable discovery opportunity, but **opportunity is not synonymous
with unique hidden payload, independent secret, or future promise**. The assembly, zone, and site
coordinate shared questions, patterns, causal roots, density, and exceptional outliers. A child may offer:

- an automatic functional or sensory read;
- local history, personal trace, confirmation, useful negative evidence, or pattern evidence;
- a tactical, social, access, safety, or resource fact;
- a small consumable or cache;
- a manifestation or clue fragment attached to a larger root;
- a genuinely unique secret, promise, or exceptional payoff when its allocation and tells justify one.

Many routine child opportunities can be represented compactly as an assembly grammar plus stable child
seed and sparse contacted deltas. They need not exist as 400 expanded prose records in the save or DM
digest. Entering a child still produces its individual read; focused inspection can expand its licensed
opportunity; a systematic sweep may resolve routine interchangeable surfaces in aggregate while
preserving individually telegraphed or exceptional outliers.

For example, a 400-cell prison block could carry the shared question, “Why did twelve prisoners disappear
without transfer records?” Most cells provide quiet local value: occupancy traces, evidence about guard
timing, confirmation that a hiding method is absent, a usable sightline, or an individual's marks. A sweep
can assemble the common pattern without 400 separate commands. Cell 31 has the structurally licensed
passage manifestation, cell 117 contains the child's note attached to a stable person/event, and cell 204
contains a hidden potion. Those outliers remain individually real and discoverable; the other cells are
not meaningless simply because their payoffs are quieter or shared.

“No discovery leads nowhere” therefore means that pursuit produces a stable, applicable payoff or updates a
canonical question. A terminal local answer, useful negative result, safe route, history fact, or confirmed
pattern is a valid destination. Only an unresolved actionable claim whose fulfillment is deferred becomes
a `StoryPromise` and consumes scheduler attention. Progression-critical truths require redundant fair
evidence routes rather than one fragile child, container, or private knower.

Player attention stays bounded separately from canonical opportunity count. The automatic read exposes
salient information and tells; the DM presents only the most relevant current handles; focused and sweep
actions reveal more by method. The design does not reward saying “I inspect every brick” 400 times, and it
does not punish a player for declining to clear every repeated child.

**Recommendation:** adopt Option 3 as the scaling interpretation of Wave 1 Questions 9 and 13. Preserve
one stable opportunity per child, coordinate meaning and exceptional density hierarchically, allow routine
opportunities to close locally or aggregate through a systematic sweep, and reserve story promises for
genuinely deferred actionable obligations.

**Open follow-up:** does this preserve the spirit of “every room rewards attention” without turning a large
repeated site into exhaustive-search labor—and, specifically, are quiet confirmation, negative evidence,
local utility, and pattern contribution sufficient payoffs when the assembly still contains individually
telegraphed spicy outliers?

#### 10.11.12 Ruling — hierarchical discoveries preserve room-level meaning

Adam accepts the Option 3 model as functional. This clarifies Wave 1 Questions 9 and 13:

- every enterable room or repeated child retains a stable discovery opportunity;
- an opportunity is not necessarily concealed, unique, treasure-bearing, independently authored, or a
  deferred narrative obligation;
- automatic reads, local utility, quiet confirmation, useful negative evidence, personal or historical
  traces, pattern contribution, and locally closed answers are valid payoffs;
- assembly, zone, and site scopes coordinate shared questions, causal roots, pattern grammars,
  exceptional density, and spicy outliers;
- routine repeated-child opportunities may remain compact as assembly grammar plus stable child seed and
  sparse contacted deltas;
- systematic sweep may aggregate routine interchangeable surfaces without erasing individually
  telegraphed, method-gated, spicy, or otherwise exceptional children;
- occasional optional untelegraphed rewards may still reward exhaustive attention, but mandatory
  progression and ordinary comprehension never require clearing every repeated child;
- only a genuinely deferred actionable claim becomes a `StoryPromise` and consumes scheduler attention;
- progression-critical truths retain redundant fair evidence routes.

The discovery-scaling skeptical follow-up is exhausted.

#### 10.11.13 Skeptical follow-up 4 — one operational label cannot describe a mixed system

Wave 2 Question 9 already rejected one universal site-health roll and accepted state per material
capability or flow. Its provisional vocabulary—normal, strained, degraded, substituted, dormant,
blocked, failed, repurposed, destroyed—still contains a schema trap: these words are not mutually
exclusive states.

A city-prison kitchen can be physically intact, overloaded, performing at reduced quality, closed to one
cellblock, supplied through an emergency contractor for another, and expected to recover after a road
reopens. No single enum value can preserve that truth. Creating a combined enum such as
`strained_substituted_partially_blocked` merely produces a combinatorial vocabulary.

##### Option 1 — one primary state plus miscellaneous flags

Choose `degraded` as the authoritative state and add flags such as `blocked`, `substituted`, and
`damaged`. This looks simple initially, but the primary label arbitrarily wins, flags accumulate without
clear ownership, and two systems may interpret the same combination differently. **Not recommended.**

##### Option 2 — fully numeric continuous simulation for every capability

Track exact supply, demand, throughput, quality, damage, access, and recovery values everywhere. This can
support rich management play, but creates false precision, realm-unit problems, eager update pressure,
and an authoring surface far removed from readable D&D rollers. **Not recommended as the universal
model.** Exact quantities remain legal where a mechanic genuinely needs them.

##### Option 3 — a small factored state with derived friendly labels

Store a few independent facets for each **material exception** to the healthy inherited baseline:

```text
scope
  which capability, flow, zone, cohort, route, or provider this record affects

availability / coverage
  how much of the intended need can currently be served, preferably as an honest band/range

performance / quality
  how well the available service is working

operating mode
  normal, substitute, emergency, intentionally dormant/seasonal, or serving a different current use

access / control
  open, restricted, denied, blocked, contested, and by whom

physical integrity
  intact, worn, damaged, disabled, destroyed, or absent where physical integrity is applicable

demand / load
  current demand relative to designed/available capacity, with exact numbers only when useful
```

Cause/provenance, onset or schedule, evidence, affected dependencies, buffers, thresholds, and recovery
are required metadata on non-normal records rather than additional competing status values. Designed
capability and capacity remain upstream truth, not current-state facets.

The familiar vocabulary becomes a projection:

- **strained**: load approaches or exceeds effective capacity while service still covers most demand;
- **degraded**: performance/quality or coverage has materially fallen;
- **substituted**: operating mode uses an alternate provider or process;
- **dormant**: intentionally or seasonally offline under a licensed schedule/mode;
- **blocked**: the relevant cohort cannot access an otherwise potentially available capability;
- **failed**: required coverage has fallen below the functional threshold;
- **repurposed**: current operating mode serves another use; permanent semantic change still requires an
  event rather than a label;
- **destroyed**: physical integrity prevents service without rebuilding.

Several labels may truthfully appear in one summary because they are derived, not mutually exclusive
canon. The DM might say, “The kitchen is intact but badly strained; Block C is on cold substitute meals
while the contested service corridor remains closed.”

Healthy default state is inherited and need not create a full record for every capability. Store sparse
exceptions and shared state at the highest honest scope, then derive dependent views lazily through dirty
frontiers. A zone or cohort gets a child exception only when its state actually differs. This preserves
the limited-stack and response-time laws.

Human-readable rollers author causes and facet changes in bands, not giant Cartesian combinations. A row
may say “Festival overcrowding: demand/load +2 bands for lodging and sanitation; performance unchanged
until buffers cross,” while the compiler produces the structured delta and preserves provenance.

**Recommendation:** adopt Option 3. Treat the old status words as derived DM/UI labels over the seven
facets above; store only causally licensed exceptions to inherited healthy state; require cause, evidence,
thresholds, and recovery metadata; and allow exact quantities only for mechanics that need them.

**Open follow-up:** do these seven facets capture the necessary truth without becoming excessive—and is
it acceptable that a capability may simultaneously project several friendly labels, such as intact,
strained, partially blocked, and substituted, rather than being forced into one state?

#### 10.11.14 Cross-domain stress pass — the prison model needs two generalizations

Adam agrees that the factored model works for a prison kitchen and asks whether it holds everywhere
else. A skeptical trace across constructed, natural, living, social, distributed, mobile, and realm
systems finds that the model largely holds **within its proper scope**, but the literal seven-field form
would still smuggle in constructed-site assumptions.

##### What the model is for

Use operational state only for a material capability or flow that:

1. provides, transports, transforms, regulates, contains, protects, permits, communicates, or renews
   something;
2. can be available/effective for a defined scope against some reference envelope; and
3. changes a dependent decision or consequence when its state changes.

Do not force identity, history, ownership, belief, mood, relationship, aesthetic description, or every
ordinary object's condition into this schema. Those truths keep their own owners.

##### Correction 1 — replace designed capacity with a typed reference envelope

`Designed capacity` is correct for a prison kitchen but teleological for an aquifer, living hive, wild
ecosystem, or spontaneous Breach. Compare demand or pressure against the appropriate reference:

| Family | Reference envelope example |
|---|---|
| Constructed service | intended throughput, occupancy, duty cycle, or engineered tolerance |
| Natural system | sustainable range, recharge rate, seasonal norm, channel capacity, or observed equilibrium |
| Living system | metabolic tolerance, renewal rate, life-cycle phase, or organism-scale capacity |
| Magical/realm system | coherence range, traversal stability, charge/recovery cycle, or governing realm law |
| Social/institutional system | mandate, customary coverage, staffed throughput, jurisdiction, or promised service level |

The envelope records its authority and uncertainty. It may be an exact value where mechanics need one,
but a band, estimate, or range is the ordinary roller-friendly form. “Healthy” means coherent relative to
that envelope, not morally good, beneficial to the player, or intentionally designed.

##### Correction 2 — physical integrity becomes an optional typed support condition

Not every capability has a physical body. Replace the universal `physical integrity` facet with
`support condition`, whose registered family may be:

- constructed/material integrity;
- biological vitality;
- magical or planar coherence;
- network continuity for a distributed route/service;
- institutional support or authorization where that is a real causal substrate;
- not applicable when availability and effectiveness already express the whole truth.

These families do not become interchangeable numbers. Each defines its own human-readable bands,
legal causes, evidence, transitions, and recovery. The shared engine asks only how the typed condition
constrains availability/effectiveness and what event may change it.

##### Revised universal core

```text
scope
availability / coverage
performance / effectiveness relative to a named obligation and standard
operating mode
access / control
pressure / load relative to a typed reference envelope
optional typed support condition

+ cause/provenance, time/schedule, evidence, buffers/substitutes,
  dependency thresholds, and recovery/terminal metadata for non-normal state
```

`Quality` is not a free-floating moral or aesthetic score. When used, it names the beneficiary, output,
and standard. An efficient torture system can be operationally effective while being morally monstrous;
player/faction evaluation remains separate. A temple's ritual may be canonically effective under realm
law while its priests falsely believe it has failed, or canon may be uncertain while rival beliefs remain
separate knowledge records.

##### Stress traces

| Case | Factored state | Why one label fails |
|---|---|---|
| Drought-struck hamlet well | source coverage low; water quality normal; access open; casing intact; demand high; recharge envelope seasonal | `degraded` cannot distinguish clean scarcity from contamination or breakage |
| Flooded mine | pump coverage zero; pump effectiveness failed; material condition damaged; demand above remaining capacity; lower workings inaccessible | `failing mine` erases still-working processing/storage and the causal pump dependency |
| Residential college in summer | teaching/dormitory mode seasonally dormant; buildings intact; demand low; guest housing substituted into vacant rooms | `closed` or `failed` mislabels healthy cadence and adaptive use |
| Contested temple | ritual service effective; access restricted by claimant; institutional authorization disputed; physical shrine intact; beliefs conflict | operational canon, claims, and belief cannot share one state enum |
| Living hive | nutrient coverage reduced; adaptive emergency mode; biological vitality wounded; brood demand deliberately suppressed | `damaged` misses a living compensatory response |
| Breach portal | traversal availability intermittent; effectiveness unstable; access requires attunement; planar coherence falling; current demand light | physical integrity is the wrong substrate, while `unstable` alone omits access and load |
| Distributed fire watch | network coverage partial; local towers intact; one signal route blocked; substitute runners active; storm demand high | site-wide state needs shared scope plus sparse node/route exceptions |
| Mobile caravan | trade service available only inside location/time windows; load varies by route; wagons intact; border access denied | availability depends on commitments and travel, not a permanent place label |

##### Remaining edge protections and expenses

- **multi-output processes:** split state by material output/obligation when one process can succeed at one
  product and fail another; do not average them into one performance score;
- **scope overlap:** inherit the highest honest shared state and store sparse cohort/zone exceptions;
  contradictory overlaps need authority and reconciliation, not last-write-wins;
- **stocks versus flows:** depletion, reserves, and irreversible loss remain resource facts feeding the
  operational state; a status facet does not replace inventory or ecology;
- **value neutrality:** operational effectiveness never implies player benefit or moral approval;
- **belief separation:** observed/reported state may differ from canon without changing it;
- **realm adapters:** registered condition/reference families extend the shared contract; free-form tags or
  scattered realm conditionals do not;
- **authoring and QA:** conversion laws, derived-label precedence, mixed-scope summaries, and mod fallbacks
  remain a real Wave 12/schema expense.

##### Revised recommendation

Adopt **six universal operational facets plus one optional typed support-condition adapter**, all scoped
to admitted material capabilities/flows. Replace designed capacity with the family-appropriate reference
envelope. Keep cause, time, evidence, dependency, and recovery as required exception metadata. Derive
friendly summaries without making them canon, and allow a system to carry several labels at once.

This remains compact because healthy state is inherited, optional facets may be absent, shared conditions
live at their highest honest scope, and only material exceptions create stored deltas.

**Open follow-up:** should this corrected cross-domain form replace the literal seven-prison-facet model—
especially the rules that natural/living/realm systems use typed reference envelopes, support condition is
family-specific and optional, and the entire operational schema applies only to admitted capabilities and
flows rather than every kind of world fact?

#### 10.11.15 Ruling — factored operational state uses family-typed reference and support

Adam accepts the corrected cross-domain form as sound. This explicitly clarifies Wave 2 Question 9:

- operational state applies only to admitted material capabilities and flows that provide, transport,
  transform, regulate, contain, protect, permit, communicate, or renew something and whose changed state
  predicts dependent play;
- it does not become a universal schema for identity, history, ownership, belief, mood, relationship,
  aesthetics, or every ordinary object's condition;
- the universal facets are scope, availability/coverage, performance/effectiveness, operating mode,
  access/control, and pressure/load;
- pressure/load is evaluated against a typed reference envelope: engineered capacity, natural sustainable
  range, living tolerance/renewal, magical/realm coherence law, or social/institutional mandate and
  throughput as appropriate;
- support condition is an optional registered family—material integrity, biological vitality,
  magical/planar coherence, network continuity, institutional support, or not applicable—rather than one
  universal physical-health number;
- effectiveness and quality name their obligation, beneficiary/output, and standard; they never imply
  moral approval or player benefit;
- cause/provenance, time/schedule, evidence, buffers/substitutes, dependency thresholds, and
  recovery/terminal state remain required metadata for material non-normal exceptions;
- familiar labels such as strained, degraded, substituted, dormant, blocked, failed, repurposed, and
  destroyed are derived summaries, and several may apply simultaneously;
- healthy/default truth is inherited at the highest honest scope; store sparse exceptions and derive
  dependent views lazily;
- realm and mod extensions register reference/support families through shared contracts rather than
  free-form tags or scattered conditional code.

The operational-state-factorization skeptical follow-up is exhausted.

#### 10.11.16 Skeptical follow-up 5 — can a seed preserve latent truth across game versions?

Wave 1 fixes semantic topology and important commitments before exploration while allowing fine detail to
materialize later. A bare seed reproduces the same result only while the algorithm, table contents, row
order, compiler, mod set, and random-stream discipline remain unchanged. After an update, the same seed
may select a different room, object, NPC trait, or clue. That would silently retcon an old persistent
world precisely when the player finally reaches its latent content.

In plain language: how can an old world keep its promises after Genesis or a mod changes, without saving
every unvisited detail up front or permanently shipping every historical engine implementation?

##### Option 1 — seed plus whatever code and tables are current

This is compact and lets old worlds receive new generation improvements automatically. It is not durable
determinism: inserting one table row, fixing an algorithm, or changing RNG consumption can alter latent
canon. A hash detects the mismatch but cannot reconstruct the missing result. **Rejected.**

##### Option 2 — eagerly generate and store every eventual detail, or bundle every old generator forever

This preserves exact results, but recreates the save/generation bloat that latency and graded
materialization are meant to avoid. Retaining executable historical generators and mod code forever also
creates maintenance, security, and migration liabilities. **Not recommended as the universal answer.**

##### Option 3 — versioned commitment capsules with tiered hardness

Store enough immutable semantic commitment to preserve the promised fact, while leaving legal
presentation detail latent. The record or deduplicated world manifest retains:

```text
stable record id and independent seed
generator family + semantic-contract version
table/mod/source id + revision/content hash
selected result/recipe id
normalized compiled semantic fragment required to reproduce the commitment
explicit hard invariants, legal variation envelope, authority, and provenance
observation/contact hardness
```

A hash is verification, not recovery. The small normalized semantic fragment—or a referenced immutable
base-game compatibility capsule—is what survives when the authored source changes. Repeated instances
share one content-addressed capsule by hash rather than copying the same row or recipe into every room.

Use three commitment tiers:

1. **Explicit canonical fact:** topology, adjacency, room function, identity, promise invariant, causal
   root, selected recipe, or observed detail is stored as value and never regenerated from seed.
2. **Latent semantic commitment:** store the selected normalized recipe/row fragment, constraints,
   independent seed, and version. A later compiler may realize it only inside that immutable envelope.
3. **Uncommitted presentation:** wording, camera, render implementation, and truly unselected decorative
   variation may use newer code until observed, provided it cannot alter semantic truth. Observation
   hardens any consequential presentation fact that play relies upon.

For example, an unopened latent prison cell need not store every scratch and dust pile. It does store
that child 117 owns the attached-note opportunity, the note's canonical relationship/event invariants,
the applicable recipe capsule and seed, and its legal inspection methods. A future renderer may stage the
cell better, but a table update cannot turn the note into a potion or assign it to another prisoner.

##### Update and migration rules

- New generators and tables apply automatically to new commitments, not silently to old semantic
  commitments.
- A migration may replace an old capsule only through an explicit versioned, deterministic, idempotent
  mapping that proves invariant preservation and records provenance.
- Pure presentation improvements may project old truth through new code without semantic migration.
- Per-record/component independent random streams prevent inserting one result from cascading through
  every later latent record.
- Once observed, mapped, acted upon, or promised, consequential values are stored explicitly.
- Missing or corrupt content uses a last-known-good normalized capsule or an honest deterministic
  placeholder preserving hard invariants; it never silently rerolls a different truth.

##### Mod handling

A save records mod id, version, content hash, namespaces, and the normalized data-only fragments already
referenced by commitments. It does not execute arbitrary snapshotted mod code. If a mod disappears, old
committed facts continue through their safe compiled fragments where possible; new expansion requiring
missing executable behavior fails diagnostically or uses a declared compatibility fallback. A mod update
may supply aliases/migrations, but cannot seize old ids or rewrite observed canon.

##### Cost and proof

This costs more than seed-only saves but far less than eager full materialization when capsules are
normalized, content-addressed, deduplicated, and stored once per referenced recipe/version. Wave 12 must
measure capsule/save growth over years, old-save load time, compatibility-pack size, migration chains,
missing-mod behavior, and exact latent expansion after table/compiler updates.

**Recommendation:** adopt Option 3. Treat seed-only determinism as valid only inside an immutable
versioned commitment envelope; store semantic values/capsules rather than old executable code; let new
code improve uncommitted presentation; and require explicit migrations for semantic upgrades.

**Open follow-up:** is this the right persistence bargain—old worlds keep their selected semantic facts
and promises exactly, new presentation code may improve how unobserved detail is expressed, and save
growth is controlled by deduplicated data-only commitment capsules rather than full eager generation or
permanent bundles of every old engine?

#### 10.11.17 Ruling — versioned commitment capsules preserve latent canon

Adam accepts the recommendation as a necessary persistence protection he would not otherwise have
considered. This explicitly clarifies Wave 1 Questions 9, 13, and 20 wherever a stable seed alone might
have been read as durable cross-version determinism:

- a bare seed is deterministic only inside the exact algorithm/table/mod environment that consumed it
  and is never sufficient evidence of a permanent latent promise;
- explicit canonical facts—including topology, adjacency, identities, selected functions, causal roots,
  promise invariants, selected recipes, and observed consequential detail—are stored as values;
- latent semantic commitments store stable id, independent seed, generator/contract version, source and
  content hash, selected result/recipe id, normalized data-only semantic fragment, hard invariants, legal
  variation envelope, authority/provenance, and observation hardness;
- truly uncommitted presentation may use newer renderer, wording, camera, lighting, and decorative code
  until observation, provided it cannot alter semantic truth;
- content hashes verify identity but do not replace recoverable semantic data;
- normalized capsules are content-addressed and deduplicated so repeated instances reference one
  immutable recipe/version fragment rather than copying or eagerly expanding it;
- new generator/table behavior applies to new commitments; semantic changes to old commitments require
  explicit deterministic, idempotent, provenance-preserving migration;
- per-record/component random streams prevent unrelated source insertions from cascading through latent
  records;
- missing/corrupt sources use last-known-good capsules or honest invariant-preserving fallbacks and never
  silently reroll another fact;
- saves retain mod id/version/hash/namespaces and referenced compiled data-only fragments, but never
  execute snapshotted historical mod code;
- Wave 12 must prove old-save expansion across table/compiler updates, migration chains, mod removal,
  save/capsule growth, and corruption recovery.

The latent-determinism-across-versions skeptical follow-up is exhausted.

#### 10.11.18 Skeptical follow-up 6 — committed depth is not current accessibility

Wave 1 Question 20 says challenge and reward should rise noisily with effective access depth rather than
raw room order. The skeptical audit found that one `depth` value cannot remain authoritative after the
party opens a shortcut, earns faction permission, destroys a barrier, repairs a lift, learns a secret
route, changes size/form, or uses a Breach.

Suppose a vault was allocated as difficult because reaching it normally required crossing three guarded
zones and opening a master lock. The party later befriends the guards and repairs a freight lift directly
to it. The vault is now easy for this party to reach. Its already committed guardian and treasure should
not be moved, weakened, or devalued merely because the party earned a better route.

##### Option 1 — one live effective-depth value

Continuously recompute depth and let challenge/reward follow it. Navigation remains current, but opening a
shortcut can trigger reactive enemy/reward relocation or scaling. It punishes player ingenuity and turns
the world into an obvious adaptive treadmill. **Rejected.**

##### Option 2 — one frozen original-depth value

Keep the allocation depth forever and use it for everything. Committed placement is protected, but the
engine, DM, pursuit, travel, reinforcements, and route UI now pretend the repaired lift does not exist.
**Rejected.**

##### Option 3 — three access views with separate authority

Track three related but non-interchangeable views:

```text
commitment access profile
  the route/barrier/risk/resource assumptions used when challenge, reward, and obligations were allocated
  stored with the committed content as provenance; never rewritten by later convenience

canonical current access profile
  what routes actually exist and are usable now under current topology, barriers, permissions,
  accommodation, hazards, and world state

observer-known usable access
  the routes a particular party, faction, or actor knows about and can actually exploit
  derived from canonical access + knowledge + capabilities + permissions
```

Each profile is a typed route-cost vector rather than only a room number:

- travel/time and path length;
- barriers, keys, skill gates, permissions, and required methods;
- expected exposure, attrition, and resource consumption;
- accommodation/form constraints and party-splitting requirements;
- reliability, timing windows, one-way risk, and escape options;
- uncertainty where the observer's knowledge is incomplete.

A friendly depth band may be derived for allocation, DM summaries, or UI, but the vector and its authority
remain inspectable.

##### What changes and what does not

- Opening the freight lift changes canonical and known current access. It does not rewrite the vault's
  commitment profile or relocate its treasure/guardian.
- Discovering a secret passage changes the discovering party's known view. The passage may already have
  existed in canonical access while remaining absent from other observers' views.
- A collapse changes canonical current access through an event. It may strand committed content; the
  engine does not teleport that content elsewhere to maintain a curve.
- A key, spell, alliance, disguise, or transformation can make a route cheaper for one party. That is an
  earned advantage, not a signal to restore difficulty through scaling.
- Guards, factions, predators, and operations may react causally to a newly opened route through events,
  schedules, fronts, and knowledge. Reinforcing a breached corridor because guards observed it is world
  response; spawning stronger guards because the player's shortcut lowered a number is reactive scaling.
- New event-created content may use the then-current world state as its own commitment context. Existing
  content keeps the context under which it was committed.

##### Concrete examples

- **Prison:** a smuggler reveals a laundry chute past intake. The party bypasses two checkpoints. The
  warden does not level-scale, but guards who discover the breach may seal or watch it.
- **Mine:** repairing a lift makes the deep pump chamber quick to revisit. Its committed water pressure,
  hazards, and repair cache stay put; travel and evacuation calculations use the lift.
- **Contested grove:** druid permission makes a guarded route socially cheap for the party while refugees
  still cannot use it. Canonical geometry is shared; observer-usable access differs by claim and identity.
- **Breach prison:** a one-way planar edge may be fast inward but dangerous or impossible outward. A
  scalar BFS depth cannot represent that asymmetry.
- **Giant site:** a human tunnel is shallow for human squatters but unusable to the dragon. Accommodation
  domains create actor-specific current access without rewriting the vault's allocation history.

##### Recommendation

Adopt Option 3. Use the commitment access profile only to justify and preserve allocated challenge,
reward, and obligation placement. Use canonical current access for world mechanics. Derive observer-known
usable access for the party and other actors. Changes happen through topology, knowledge, permission,
capability, or state events; committed content never moves or scales merely to restore its former depth.

**Open follow-up:** should these three views replace a single effective-depth authority—and do you agree
that an earned shortcut is allowed to make committed content genuinely easier, while only causally aware
world actors may respond rather than the engine secretly rebalancing it?

#### 10.11.19 Ruling — commitment, current, and observer access remain separate

Adam accepts the recommendation. This explicitly clarifies Wave 1 Question 20:

- one live or frozen `depth` value never owns allocation, current world mechanics, and actor knowledge;
- the **commitment access profile** stores the typed route/barrier/risk/resource assumptions under which
  challenge, reward, and obligations were allocated and remains attached as provenance;
- **canonical current access** stores the routes and constraints that actually exist now after topology,
  barrier, permission, hazard, accommodation, and world-state events;
- **observer-known usable access** derives which current routes a particular party/faction/actor knows and
  can exploit given knowledge, permissions, capabilities, form, and uncertainty;
- access is a typed cost vector—time/path, gates/methods/permissions, exposure/attrition/resources,
  accommodation/party split, reliability/timing/one-way escape, and uncertainty—not merely BFS room order;
- earned keys, spells, alliances, transformations, discoveries, repairs, and shortcuts may make committed
  content genuinely easier without moving, weakening, devaluing, or replacing it;
- collapses and closures may make committed content harder or unreachable without teleporting it to
  preserve a curve;
- actors may respond only through causal observation/knowledge and ordinary events, schedules, fronts,
  and operations; a hidden rebalance triggered by a lower depth score is prohibited;
- new event-created content may use the then-current world as its own commitment context while existing
  content retains its original allocation provenance.

The planned-versus-current-access-depth skeptical follow-up is exhausted.

#### 10.11.20 Skeptical follow-up 7 — many places may not reserve one latent neighbor independently

Wave 2 Question 6 lets a generated settlement harden the minimum relational promise it needs from an
unmaterialized neighbor. This protects connected worlds such as Leilon's dependence on Waterdeep and
Neverwinter. The skeptical audit found the inverse danger: ten generated towns may independently demand
facts from “the regional city” before that city rolls. Blindly adding those demands can force an impossible
population, geography, economy, history, or collection of institutions.

For example:

- Leilon requires a much larger northern/southern maritime trade partner and food/manufacture flows;
- six farming settlements export grain to a regional wholesale market;
- a monastery refers patients to a specialist city hospital;
- a fort receives orders and weapons from a regional capital;
- three NPC histories name a dock fire, plague year, and deposed guild in what may be the same city;
- a modded settlement says its neighboring city forbids magic while another established edge assumes a
  legal mage college there.

The future city should feel shaped by its region, not generated in isolation. It also cannot become an
unlimited promise bucket whose every inbound statement hardens independently.

##### Option 1 — first writer reserves hard counterpart facts directly

The first generated town can establish a city role, institution, capacity, and relationship; later
places add more. This preserves local continuity but creates first-writer bias and unbounded accretion.
The latent city may become contradictory before it exists. **Rejected.**

##### Option 2 — keep every external reference soft until the neighbor generates

The city rolls freely, then previous settlements reinterpret their dependencies to fit it. This avoids
constraint pressure but permits retroactive changes to visited places and makes their trade, supply, and
history feel fake. **Rejected.**

##### Option 3 — one reciprocal inbound-promise ledger per anchor/network

Every latent counterpart or aggregate outside network owns a small ledger. Each promise records only the
minimum play-predictive constraint:

```text
promise id + source place/fact
candidate counterpart anchor or aggregate network
relationship/flow/history type and direction
magnitude/range, season/era, reliability, and dependency asymmetry
required identity/location/scale/role envelope
counterpart cardinality: must be this one / one compatible node / several legal nodes / aggregate network
merge key, splittability, legal alternate fulfillments, and exclusions
authority, hardness, observation/knowledge state, and provenance
```

Internal districts, streets, businesses, NPCs, and exact counterpart institutions remain unpromised
unless a source truly requires and establishes them.

Before the neighbor materializes, a reconciliation pass processes the whole inbound ledger in authority
order:

1. **Unify duplicates:** several sources describing the same trade edge or historical event add
   provenance/evidence rather than multiplying capacity.
2. **Aggregate compatible demand:** grain flows, travelers, referrals, and orders combine into typed
   ranges without adding overlapping estimates twice.
3. **Bind to an established compatible anchor:** canonical Waterdeep satisfies Leilon's Waterdeep edge;
   a generic “larger city north” may bind to an existing suitable anchor.
4. **Split when plurality is legal:** grain wholesale, naval supply, specialist medicine, and military
   command need not all belong to one city if the original promises permitted several counterparties.
5. **Use aggregate networks or satellite nodes:** a regional market, suburban warehouse belt, diocesan
   system, port authority, or branch institution may satisfy a network-scale promise without bloating one
   urban core.
6. **Reconcile time:** former trade, a closed hospital, a deposed guild, and present service can coexist
   when their eras differ and the history is causal.
7. **Separate belief from canon:** an NPC report or local assumption may remain mistaken/contested when it
   was never established as hard world truth.
8. **Promote deliberate residual contradiction:** a licensed unresolved hard mismatch may become one
   causal regional root with manifestations rather than several accidental inconsistencies.
9. **Fail diagnostically on incompatible hard canon:** never drop, average, or last-write-wins two truly
   incompatible established facts.

The reconciled bundle constrains only the facts it actually entails. The city planner consumes identity,
location, population/throughput envelopes, required reciprocal edges, minimum role/institution
capabilities, and historical commitments first, then rolls its unconstrained details. Every source edge
receives a reciprocal binding and reconciliation provenance.

##### Leilon and grain-market example

Leilon's named canonical Waterdeep and Neverwinter edges remain individually hard. If six farms also say
they sell grain to “the coast city,” the ledger first determines whether those are reports of one shared
wholesale flow, independent exports, or an aggregate market. It does not automatically create six giant
warehouses in Waterdeep. Their combined magnitude may justify one wholesale district, several private
buyers, a port-market network, or different counterpart cities within the original cardinality promises.

If the aggregate flow exceeds Waterdeep's already hard envelope, the system first checks double-counting,
season/era, and splittability. It may distribute soft/generic demand across Neverwinter, satellite ports,
or an aggregate network. It may not redirect Leilon's observed named Waterdeep relationship. A genuinely
hard excess becomes a diagnostic or an explicitly licensed causal mismatch, not silent population
inflation.

##### Saturation and generation boundaries

- Hard established facts have no arbitrary discard budget, but each new generated source is allowed to
  harden only its minimum necessary counterpart constraint.
- Low-authority optional rolls preferentially reuse compatible edges/anchors, remain aggregate, or create
  local flavor rather than reserving new counterpart institutions.
- Ledger reports expose hard constraints, merged duplicates, aggregate demand, unresolved conflicts,
  source concentration, and projected counterpart load before materialization.
- A latent anchor that becomes saturated stops accepting optional specificity; new soft promises split,
  aggregate, or bind elsewhere. Observed hard facts still enter and force explicit reconciliation.
- Reconciliation is deterministic, provenance-preserving, and versioned so generation order cannot make
  a different city merely because the player visited towns in another sequence.

##### Recommendation

Adopt Option 3. Preserve each visited place's minimum relational truth, but route every promise through a
reciprocal ledger that deduplicates, aggregates, binds, splits, historicizes, or diagnoses before the
counterpart rolls. Use counterpart cardinality and legal alternate fulfillments so a generic regional
dependency does not reserve one specific city unnecessarily. Let hard residual contradictions become
explicit story roots only when licensed, never as automatic garbage disposal.

**Open follow-up:** should this reciprocal inbound-ledger and reconciliation ladder govern latent regional
contracts—including the rule that generation order cannot give the first visited settlement unlimited
authority over an unrolled neighbor, while genuinely observed named relationships such as Leilon–Waterdeep
remain protected?

#### 10.11.21 Ruling — latent regional promises reconcile reciprocally

Adam accepts the reciprocal-ledger model as solving the problem well. This clarifies Wave 2 Question 6:

- each latent counterpart anchor or aggregate outside network owns one versioned inbound-promise ledger;
- generated sources harden only the minimum play-predictive relationship, flow, role, location, scale,
  capacity, or historical constraint they genuinely require;
- every promise records source/provenance, authority/hardness, time/season, magnitude/range, direction,
  asymmetry, counterpart cardinality, merge key, splittability, legal alternate fulfillments, exclusions,
  and observation/knowledge state;
- reconciliation is deterministic and generation-order independent: duplicates unify, compatible demand
  aggregates without double counting, established anchors bind, generic promises may split among legal
  nodes, aggregate/satellite networks may fulfill network-scale need, eras reconcile historically, and
  beliefs remain separate from canon;
- an observed named relationship such as Leilon–Waterdeep cannot be redirected, while a generic
  “regional grain market” does not reserve Waterdeep specifically unless its source established that fact;
- a saturated latent anchor stops accepting optional specificity; new soft promises reuse compatible
  edges, remain aggregate, split, or bind elsewhere;
- genuinely incompatible hard facts fail diagnostically or become one explicitly licensed causal root;
  they are never dropped, averaged, or repaired by last-writer-wins;
- the counterpart planner consumes the reconciled constraint bundle before rolling unconstrained detail
  and records reciprocal bindings back to every source;
- ledger and distribution gates report duplicate merging, aggregate load, unresolved conflicts, source
  concentration, counterpart saturation, and generation-order equivalence.

The latent-regional-promise-reconciliation skeptical follow-up is exhausted.

#### 10.11.22 Skeptical follow-up 8 — spicy layers can saturate together

Genesis now allows meaningful content at many independently valid layers: site history, capability state,
groups/claims, NPC deviations, room discoveries, repeated-child outliers, loot, environmental
affordances, story promises, contracts, fronts, and scoped Spice roots. Each system may remain within its
own distribution while their combination makes one scene noisy, incoherent, or cognitively exhausting.

The problem is not that a prison contains a food crisis, a missing-daughter thread, a necromancy lab,
contraband, a demonic bar of soap, faction tension, and valuable supplies. That is the desired spicy
restaurant. The problem is presenting all seven as unrelated foreground emergencies in the same room and
turn.

##### Option 1 — trust each subsystem's independent cap

Discoveries, roots, groups, cards, states, and handles each pass their own incidence rules. Their sum can
still produce confetti, an overloaded DM digest, too many introduced nouns, and no clear player choice.
**Rejected.**

##### Option 2 — one global site complexity or Spice ceiling

Count everything as points and stop generation at a site-wide maximum. This is easy to reason about but
would flatten large sites, punish descendant independence, make a demonic soap consume the same kind of
space as a prison-wide food crisis, and contradict the accepted no-downward-ceiling law. **Rejected.**

##### Option 3 — causal situation bundles plus a typed saturation vector and salience stack

First coalesce related facts into one **active situation** rather than counting every manifestation as an
independent beat. Then measure canonical abundance separately from what is active and what is projected:

```text
canonical layer
  all stable roots, discoveries, groups, states, promises, and handles that really exist

active-situation layer
  causal bundles currently changing, due, pursued, observed, or capable of near-term consequence

projection layer
  foreground beats, visible background pressures, and retrievable latent handles shown now
```

For example, one blocked food route may produce a strained kitchen, cold substitute meals, a contractor,
guard rationing, prisoner anger, a black-market opportunity, and a faction demand. Those are seven useful
manifestations of **one causal situation**, not seven unrelated roots or seven mandatory introductions.
The missing-daughter note and concealed necromancy lab remain independent situations. The demonic soap may
remain a local accent until attention or consequence promotes it.

The saturation report remains a vector, not one exchangeable points number:

- independent causal roots by Spice band and scope;
- active situations/fronts and their causal overlap;
- due contracts/promises and service horizons;
- current operational exceptions and affected dependencies;
- relevant groups, claims, named actors, and relationship edges;
- available discovery/affordance handles and unresolved player questions;
- foreground beats, new proper nouns, visible background pressures, and DM digest bytes;
- quiet/contrast rate, promotion rate, deferral rate, player uptake, and stale-card churn.

Exact healthy ranges are authored by scene/site family and measured rather than collapsed into one magic
limit. A tavern, market, battlefield, council, and quiet cell support different simultaneous social and
narrative loads. Licensed crises and climaxes may deliberately exceed ordinary projection ranges, but the
override is explicit, temporary, and tested for comprehensibility.

##### Salience behavior under pressure

When the projection layer is crowded:

1. immediate player action, observed danger, and due obligations remain foreground;
2. causally related manifestations are narrated together as one situation;
3. a social hub may foreground several compatible beats using its larger authored scene capacity;
4. secondary situations remain perceptible as concise background tells rather than disappearing;
5. optional cards wait within their service horizons; stable discoveries and promises remain canonical;
6. player attention promotes the selected handle immediately and the stack rearranges around that choice;
7. no committed fact, contract, critical evidence, or legal action is deleted, moved, recolored, or
   rerolled to satisfy presentation capacity.

“Quiet” therefore means **not presently competing for foreground narration**, not bland or meaningless.
A quiet cell still has its stable opportunity. A quiet site interval still carries sensory identity,
local utility, background pressure, and potential spicy outliers.

##### City-prison trace

In the kitchen during a shortage:

- foreground: the cold-meal conflict and the people actively contesting it;
- visible background: an officer watching the laundry door and an inmate concealing something;
- retrievable handles: the child's-note trail, a suspicious soap dish, contractor records, and the
  necromancy clue network;
- active situations: food-route failure, missing daughter, hidden lab, plus any due contract;
- manifestations of the food failure remain bundled rather than consuming separate root slots.

If the player picks up the soap, questions the officer, or demands the contractor's records, that choice
promotes the selected handle. Genesis does not decide that the soap is unimportant forever; it simply
does not introduce every noun and mystery in the first paragraph.

##### Acceptance evidence

Seeded corpora and live traces must report the combined vector at room, assembly, zone, site, settlement,
and active-DM-slice scopes. Gates should catch:

- too many unrelated high-band roots co-active in ordinary scenes;
- low manifestations-per-root, indicating confetti rather than causal depth;
- excessive new proper nouns or foreground handles per turn;
- repeated service-horizon deferral or final-room card dumping;
- long stretches with no meaningful handles;
- sites whose every room presents crisis urgency;
- quiet rates that become blandness rather than contrast;
- player-selected handles repeatedly losing priority to scheduler preferences.

##### Recommendation

Adopt Option 3. Preserve abundant layered canon and independent descendant Spice, but coalesce related
facts into causal situations, measure integrated saturation as a typed vector, and bound simultaneous
projection through scene-specific salience capacity. Tune sequencing and foreground competition, not the
world's total capacity for secrets and weirdness.

**Open follow-up:** does this preserve the spicy-restaurant mandate—lots of real juicy content remains in
the place—while letting the DM serve it in comprehensible courses, with player attention able to pull any
visible dish forward?

#### 10.11.23 Ruling and follow-up — no backlog dump; coherent exposition bursts are licensed

Adam accepts the causal-bundle and salience-stack direction. Genesis should avoid a mega-dump almost
everywhere, with plausible exceptions at the very beginning or in a scene whose fiction genuinely calls
for dense revelation—for example, meeting a long-lost mother who has much to explain about the character's
childhood.

This exposes a useful distinction:

```text
saturation dump
  unrelated roots/cards/groups/problems all demand foreground because their queues are full

coherent exposition burst
  one source delivers many causally connected facts under a scene the player invited or the premise earned
```

A mother may reveal the father's identity, the cause of separation, the origin of an heirloom, a false
family story, an old enemy, and why she disappeared. That is high information density but may still be one
family-history situation with a natural causal order. It should not also force the prison contract,
regional food shortage, demonic soap, and three unrelated NPC introductions into the same beat.

##### Provisional exposition-burst license

Temporarily raise the ordinary projection capacity only when all of the following are true:

- the scene has an information-delivery purpose: opening orientation, requested briefing or history,
  confession, reunion, testimony, debrief, will, archive, prophecy, formal judgment, or comparable event;
- one speaker/source, topic, event, or tightly connected causal bundle explains the density;
- the player explicitly asked, chose to listen/read, or entered a strongly telegraphed premise scene;
- immediate danger or unresolved player action does not make the monologue absurd;
- facts remain source-attributed canon, observation, belief, lie, uncertainty, or interpretation rather
  than becoming omniscient truth merely because they were delivered together;
- delivery has ordered beats and an interruption/resumption bookmark, so the player may ask, object,
  leave, or return without losing the remaining packet;
- actionable consequences and important names receive a compact journal/recap projection rather than
  depending on perfect memory of a long passage;
- unrelated due cards and scheduler backlog do not enter merely because the projection budget is
  temporarily larger.

The beginning of the game may receive a special orientation license because premise, immediate stakes,
controls, and the first actionable context must be established. Even there, the engine should distinguish
necessary orientation from a glossary recital: essential names and decisions enter the opening beat;
deeper optional lore remains available through questions, Codex, play, and later revelation.

Mechanically, an exposition packet may hold:

```text
source/speaker and witness/knowledge boundary
topic/root and ordered fact dependencies
truth/belief/lie/uncertainty attribution per fact
trigger/consent and scene safety requirements
interruption point and remaining/resumable facts
new handles/promises created or resolved
journal/recap summary
```

This does not require one uninterrupted wall of prose. The DM may stream the packet in coherent
paragraphs, pause for reaction at natural hinges, and resume if the player wants more. The “burst” refers
to how much connected truth the scene is licensed to transfer, not permission to seize player agency.

##### Recommendation

Keep Option 3's normal saturation law and add this narrow exposition-burst license. Treat a large but
coherent player-invited revelation as one high-capacity scene. Never treat an overfull scheduler, too many
active systems, or a final-room card backlog as an exposition justification.

**Open follow-up:** does this capture the exception you mean—the opening and earned/requested revelation
scenes may deliver substantially more connected information, but remain source-bound, interruptible,
resumable, and protected from unrelated queue dumping?

#### 10.11.24 Final ruling — integrated saturation with coherent exposition license

Adam accepts the clarification. The integrated-saturation skeptical follow-up is resolved:

- abundant layered canon and independent descendant Spice remain protected;
- related manifestations coalesce into causal situations before saturation is assessed;
- canonical abundance, active situations, and current projection are measured separately;
- integrated saturation uses a typed vector and scene-family-specific ranges, never one global
  complexity/Spice ceiling;
- ordinary projection uses foreground beats, visible background pressures, and retrievable latent
  handles; player attention immediately reprioritizes the selected handle;
- scheduler backlog, final-room card pressure, and too many active systems never justify a mega-dump;
- licensed openings and earned/requested information-delivery scenes may temporarily carry substantially
  more connected information when one source/topic/causal bundle explains it;
- exposition bursts remain source/knowledge-bound, truth/belief/lie-aware, interruptible, resumable,
  journal-supported, and protected from unrelated queue insertion;
- quiet means noncompeting salience, not absent meaning or reduced spicy potential;
- Wave 9 and Wave 12 must prove combined-root/situation/handle/card/state/group saturation, exposition
  comprehensibility, service-horizon behavior, proper-noun load, player-uptake priority, and absence of
  final-room dumping.


<!-- END VERBATIM MIGRATION: original lines 7270-9801 -->
