---
type: design-study
status: CLOSED
wave: 2
part: 1
legacy_sections: "10-10.5"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 2 — Questions 1-5

<!-- BEGIN VERBATIM MIGRATION: original lines 3406-5246 -->

## 10. Wave 2 running record - Room Roster, Repetition, Spice, and Dungeon Ecology

**Status:** IN PROGRESS. Wave 1 closed explicitly on 2026-07-19. Wave 2 inherits every ruling and
future-question assignment above. It uses the same closure gate: initial questions alone do not close
the wave, generated follow-ups remain in this section until exhausted, and Adam must explicitly accept
the final closure audit before Wave 3 opens.

### 10.1 Question 1 - what does the roster allocate before it creates rooms?

In plain English: when Genesis knows that a site is a prison, temple, mine, natural cavern, creature
den, or impossible living structure, what should it decide **before** it starts naming rooms? Wave 1
established that a purposeful institution receives a complete operating model rather than a rigid room
checklist. Wave 2 must now define the authorable unit that turns that principle into a roster.

The current `Dungeon Area Type` d200 cannot own this job as written. It mixes connection topology,
footprint/shape, structural features, dominant functions, attached subrooms, hazards, vertical movement,
secret possibilities, and high-Spice anomalies in one flat result space. That mixture creates excellent
composite inspiration but cannot prove that a prison contains custody/control, a mine moves ore and
waste, or a self-sustaining lair can feed its occupants.

The indexed technical research points toward a semantic intermediate layer:

- semantic scene descriptions express types, attributes, relationships, counts/ranges, mandatory and
  optional elements, and hierarchy before a solver chooses layout;
- hierarchical blocks let repeated children such as cells, beds, shelves, niches, or workstations exist
  stably without pretending each is an unrelated top-level room;
- dungeon-wide playability constraints work over a graph and budgets rather than trusting isolated
  local rolls;
- the DMG/DBG purpose procedures remain useful authored evidence for what coherent wholes tend to need,
  but their frequencies should teach purpose profiles rather than become an isolated-room runtime.

There are three useful mechanisms here, but they are not equal candidates for sole authority:

1. **Flat room-name distributions** are excellent human-readable roller content. A prison table can say
   cellblock, intake, evidence store, infirmary, chapel, kitchen, yard, and so on. Used alone, however,
   even good weights can omit necessities, clone too many rooms, and conceal supply dependencies.
2. **Authored roster packages** are useful recipes and test fixtures: hamlet jail, city prison wing,
   monastic prison, mage-colony portal block. Used as the entire system, they create visible templates
   and require an authored package for every purpose x size x culture x realm combination.
3. **A typed obligation-and-flow program** can make the first two mechanisms work together. The purpose
   profile declares what must happen and what moves through the site; human-readable rollers choose
   among legal realizations; recipe packages provide particularly strong arrangements without becoming
   mandatory blueprints.

The recommended universal sequence is:

```text
purpose family and context
  -> required roles, capabilities, flows, and dependencies
  -> scale/occupancy/history-adjusted quantities and coverage
  -> compatible room, zone, assembly, procedure, and external-service realizations
  -> protected discretionary/Spice allocation
  -> compiler reconciliation and diagnostics
```

A **capability** says what the site must accomplish; a **flow** says what enters, moves, waits, changes,
or leaves. Neither assumes one room:

- a hamlet jail's `custody` capability might realize as one barred room divided into cells, while
  `oversight + records` share the sheriff's office, food arrives from the tavern, waste leaves by bucket,
  and one likely discretionary space adds local identity;
- a city prison's same capabilities can realize as intake, classification, repeated cellblock
  assemblies, guard control, kitchens, sanitation, infirmary, visitation, evidence, yards, and several
  supply/service routes;
- a mine moves workers, air, supports, water, ore, spoil, tools, and carts through extraction,
  maintenance, processing, storage, and exit functions;
- a temple moves congregants, clergy, offerings, ritual materials, teaching, purification, remains, and
  waste according to doctrine rather than automatically demanding the same chapel blueprint.

Natural and biological sites need the same planning discipline but must not be anthropomorphized into
bad institutions. The proposed **purpose-family grammars** include at least:

- constructed institution/workflow;
- infrastructure/throughput network;
- monument, burial, or ceremonial sequence;
- natural formation and environmental flow;
- habitat, nest, den, or living ecology;
- anomaly, containment, or realm-physics system.

A natural cavern program may therefore require geological continuity, drainage, airflow, access,
sediment/mineral zones, and habitat opportunities without inventing an operator, kitchen, or guardroom.
Current inhabitants add their own occupation/ecology overlay afterward. A living hive can have
circulation, feeding, incubation, defense, waste, and renewal as biological functions rather than
human room nouns.

Each authored obligation should eventually expose modder-readable fields such as importance,
quantity/coverage curve, dependencies, inputs/outputs, repeat policy, combinability, externalizability,
eligible realization families, context modifiers, failure/degradation forms, and Spice-band hooks.
Wave 2 should decide these concepts and their interactions; exact schema syntax and compiler code wait
for specification/build work.

**Recommendation:** make the obligation-and-flow program the authoritative roster layer. Preserve flat
room rollers as the friendly D&D authoring surface and authored packages as strong recipes, but compile
both through semantic obligations so the engine can guarantee identity, support natural/ecological
sites, avoid Cartesian template explosion, and still roll surprising realizations.

**Open decision:** should every site first generate a purpose-family program of capabilities, flows,
and dependencies, with named rooms/assemblies/procedures/external services rolled afterward as their
realizations—and should natural formations and living habitats receive their own grammars rather than
being forced through an institutional template?

#### 10.1.1 Ruling and follow-up - mechanical cost of the obligation layer

Adam accepts the obligation-and-flow architecture as beautiful design and asks what it costs
mechanically. The honest answer separates runtime, persistence, implementation, content, verification,
DM context, and long-term maintenance.

##### Runtime cost - low if the planner stays factored and bounded

The current `rollDungeonWalk()` already builds a topology graph, runs breadth-first depth, assigns a
whole-site loot budget, and then maps across every room to perform many independent table rolls. The
future spatial pass performs room separation, rasterization, connection carving, and eventually bounded
room-layout search. Against those costs, a roster planner operates on small structured lists:

```text
expand purpose-family obligations
-> resolve quantities/dependencies/context modifiers
-> select legal realization families
-> combine or externalize compatible obligations
-> assign the resulting room/assembly demand to graph capacity
```

For an ordinary site this is likely tens of obligation/flow records, not thousands. A fifty-five-room
prison can hold its repeated cellblock demand as several assembly records with counts rather than
expanding every cell into a heavyweight planning node. A reasonable constructive implementation is
approximately linear in obligation/dependency count plus a bounded scan of eligible realizations and
room slots. Bounded backtracking may reconsider a few conflicting assignments, but no pass is allowed
to search the Cartesian product of every purpose, size, culture, realm, and room combination.

No honest millisecond promise can be made before a prototype benchmark. The design target is that
roster planning remains a small one-time generation cost—normally cheaper than spatializing and
dressing the resulting rooms, invisible during ordinary turn play, and subject to a strict work budget
with deterministic degradation or diagnostics when exceeded.

##### Save and memory cost - low

The added canonical data is compact: purpose/profile ids, obligation ids, quantities, selected
realizations, dependency links, provenance, stable seeds, and external-service records. This should be
kilobytes for ordinary sites and modest even for large ones. Stable repeated assemblies and latent
children prevent a hundred-cell prison from requiring a hundred fully populated NPC/item/scene records
at creation. Persisting the compiled roster costs far less than eagerly generating all of those details.

##### DM/token cost - lower than the current conceptual model

The AI DM does not receive the whole obligation graph each turn. The engine uses it to compile the site
and exposes only the active room's purpose/current use, nearby dependencies, relevant failures,
discoveries, and due cards. This removes from the DM the expensive job of remembering whether the prison
ever received food, sanitation, oversight, or secure circulation. It is more engine structure but less
prompt burden and less AI improvisational drift.

##### Implementation cost - medium to high, but concentrated

Genesis needs:

- a versioned purpose-family/obligation schema and Markdown-table compiler support;
- dependency, quantity, combination, externalization, and realization-selection passes;
- a reconciliation/diagnostic layer between roster demand, site profiles, and graph capacity;
- stable provenance and persistence for chosen plans;
- compatibility projections while the old room-driven consumers still exist;
- tests for minimum operating models, allowed variation, impossible sets, deterministic replay, and
  cross-realm extension.

This is a real new planning layer and should be treated as several coherent build units, not a tiny
patch to `rollDungeonWalk()`. It also changes the future generation order: purpose/context and roster
demand help establish graph requirements before final room assignment, instead of rolling a finished
topology and then independently asking what every room happens to be.

##### Content and writing cost - the largest near-term cost

The system needs authored purpose profiles, flow vocabularies, realization families, dependencies,
repeat policies, fallbacks, context modifiers, Spice bands, and a flavor pass. That is substantially
more work than adding another column to the current d200. It is nevertheless reusable work:

- `custody`, `oversight`, `water`, `waste`, `storage`, `procession`, `airflow`, `incubation`, and similar
  concepts can serve many purposes;
- a kitchen, camp cookfire, ration issue desk, external caterer, fungal feeding bed, and conjured-meal
  ward can be different realizations of related supply needs;
- size bands alter quantities/coverage instead of requiring complete duplicate templates;
- cultures and realms modify shared profiles through data rather than cloning every purpose package;
- strong authored packages remain optional recipes and test fixtures.

The alternative's content cost looks smaller only at first. Complete templates multiply across purpose
x size x doctrine x occupancy x history x realm, while flat tables require endless exception rules and
manual repairs. The factored model pays a higher foundational authoring cost and a much lower expansion
and maintenance cost.

##### Primary complexity risk and guardrails

The danger is not CPU use; it is accidentally building a universal economic simulator. The roster
needs enough ecology to create spaces, dependencies, vulnerabilities, evidence, and play—not continuous
per-ration logistics for every unseen prisoner.

Recommended cost guardrails:

1. Store typed obligations and coarse flows, not continuous material simulation.
2. Resolve the roster once at creation; update it only after meaningful world events.
3. Represent repeated children compactly with counts, stable ids/seeds, and deterministic expansion.
4. Use constructive priority order and bounded backtracking; never exhaustive combination search.
5. Factor universal concepts from purpose, culture, realm, and history modifiers.
6. Compile human-readable rollers into indexed runtime records so eligibility checks are cheap.
7. Give every pass a deterministic work budget, degradation ladder, and plain-language diagnostic.
8. Benchmark ordinary, extra-large, mixed-scale, multi-occupation, and Breach-linked fixtures before
   locking numeric performance budgets.

**Cost judgment:** low runtime, low save growth, lower DM-context cost, medium-to-high engine work, high
initial content/writing work, and lower long-term maintenance than template multiplication. The feature
is affordable for a browser game if it remains a compile-once semantic planner rather than a live
simulation.

**Recommendation:** keep the accepted architecture and adopt the guardrails above. Its cost is spent in
the correct place—authorable deterministic structure—while the player's turn loop stays light and realm
expansion remains additive.

**Open follow-up:** does this cost profile remain acceptable, with the hard boundary that roster ecology
models coarse capabilities, flows, dependencies, and state changes but does not continuously simulate an
institution's economy?

#### 10.1.2 Follow-up - strategic simulation, not domestic accounting

Adam confirms that the high writing cost is welcome—writing and flavor passes are a favorite part of
development with AI assistance—and accepts the cost balance. He wants **some real simulation**, not a
static dressing fiction, while agreeing that continuous per-person institutional accounting is beyond
the useful boundary.

The recommended middle is an **event-driven aggregate stock-and-flow model**:

```text
source -> route -> storage -> conversion/distribution -> consumers/use -> waste or export
                     |                 |
                  capacity          failure state
```

The roster establishes the nodes and dependencies. Simulation tracks only the resources and processes
whose changing state can alter play. Population is normally aggregated by cohort, zone, function, or
occupation group rather than simulated as one ration ledger per NPC.

Examples:

- a prison may track food reserve, water access, guard coverage, waste state, infirmary capacity, and
  containment integrity. Destroying the cistern or freeing a cellblock changes demand, patrols, morale,
  negotiations, escape pressure, and occupation fronts;
- a mine may track airflow, drainage, supports, access to tools, cart throughput, and spoil blockage.
  Opening a floodgate or collapsing a support changes accessible zones and worker behavior;
- a living hive may track food input, incubation, brood density, territorial alarms, and waste/decay.
  Killing one creature is local; destroying a feeding route changes the colony;
- a magical prison may track ward charge, anchor integrity, operator attention, and Breach pressure.
  Missed maintenance can advance a containment clock without simulating every rune continuously.

Use the cheapest representation that preserves the strategic consequence:

- exact small quantities when the number is legible and actionable, such as three days of water, two
  functioning pumps, or four ward charges;
- ordinal state when precision adds no play, such as stable -> strained -> critical -> failed;
- clocks/thresholds for accumulating consequences such as hunger, flooding, disease, revolt, collapse,
  pursuit, or containment failure;
- boolean capability state for a simple on/off service;
- flow/rate only when time and throughput materially affect player choices.

Updates occur on meaningful triggers: player actions, rests or elapsed travel intervals, supply arrival
or disruption, occupation-front events, major casualties/population changes, environmental damage,
repair, or a scheduled threshold. Unvisited sites do not run high-frequency background loops. When a
site becomes relevant again, deterministic **lazy catch-up** applies elapsed time and recorded events to
the next meaningful thresholds, preserving world persistence without burning browser work continuously.

This simulation must remain causal and inspectable. The player can discover the source, route, reserve,
failure, and consequence; the DM receives the resulting pressure and legal strategic cards. The engine
does not secretly subtract abstract supply merely to force a desired scene.

**Recommendation:** adopt strategic, event-driven, aggregate simulation. Permit quantities, ordinal
states, clocks, booleans, and rates per resource family, choosing the lowest precision that creates
meaningful decisions. Ban per-NPC domestic accounting and continuous background ticking unless a future
system proves a specific player-facing need.

**Open follow-up:** is this the correct meaning of "some simulation"—aggregated causal resources and
services, updated on meaningful events or lazy elapsed-time catch-up, with exact numbers only when the
player can understand and act on them?

#### 10.1.3 Final ruling - authoritative roster plus light strategic simulation

Adam confirms the boundary. Question 1 is resolved:

- every site begins from a purpose-family program of capabilities, flows, and dependencies;
- named rooms, assemblies, procedures, and external services are rollable realizations of that program;
- flat human-readable tables remain the friendly D&D/modding surface and strong authored packages
  remain reusable recipes, but neither replaces semantic obligations as the authority;
- constructed institutions, infrastructure, monuments/ceremonial sites, natural formations, living
  habitats, and anomalies use suitable family grammars rather than forcing every site through a human
  institutional template;
- site ecology receives real but light simulation through aggregate resources/services, quantities when
  useful, ordinal states, booleans, rates, clocks, meaningful event updates, and deterministic lazy
  catch-up;
- the engine does not continuously simulate every person's domestic activity or run every unvisited
  site at high frequency;
- the large writing/flavor pass is a desired part of development with AI assistance, not a reason to
  flatten the design.

The intended product distinction is important: Genesis should narrate consequences from persistent
causal world state, not invent a plausible consequence only after the player asks. This can distinguish
it from AI-dungeon experiences whose prose is responsive but whose places lack a durable systemic model.

#### 10.1.4 Future-question assignments seeded by question 1

| Inherited ruling | Future owner |
|---|---|
| Purpose-family programs author capabilities, flows, dependencies, quantities, and realization families | Remaining **Wave 2** questions define the vocabulary, simulation eligibility, roster allocation, repetition, ecology, Spice, and writing inventories |
| Roster ecology uses aggregate event-driven state, exact quantities only when actionable, and lazy catch-up rather than continuous per-NPC simulation | **Wave 2** defines which systems qualify; **Wave 8** owns destructive/state-changing events; **Wave 12** owns persistence and catch-up verification |
| Markdown rollers and recipe packages compile through semantic obligations | **Wave 11** owns authoring/modding/workbench experience; **Wave 12** owns compiler validation and migration gates |
| Purpose/roster demand informs graph requirements before final room assignment | **Waves 3 and 4** own topology and structural realization without reopening the semantic authority |
| The DM receives consequences and the active local slice, not the entire simulation graph | **Wave 9** owns strategic-card/digest projection and must preserve this context bound |

### 10.2 Question 2 - which site systems deserve light simulation?

In plain English: the roster can describe hundreds of facts, but which of them should receive mutable
state, clocks, quantities, and causal updates? If everything becomes a system, Genesis recreates a
colony simulator and buries the DM in state. If almost nothing becomes a system, the operating model is
decorative lore and the game loses the distinction Adam wants.

Three mechanisms have value, but again are not equal standalone answers:

- A **universal checklist**—food, water, air, waste, staffing, security, morale everywhere—is easy to
  understand but nonsensical for many sites. A sealed tomb does not need food simulation; an ooze colony
  may not have morale; a magical archive may care more about humidity and ward stability than air.
- **Activate only after player attention** keeps state cheap but makes the world retroactive. The engine
  might decide that the besieged prison has no food problem until the player asks, losing preexisting
  consequences and fair clues.
- A **purpose-authored system registry with graded activation** can establish latent causal truth at site
  creation while spending active simulation only where state, events, elapsed time, or player attention
  make it relevant.

The recommended admission test is:

1. **Mutable state:** the candidate has at least two meaningfully different states, quantities, or
   thresholds.
2. **Causal structure:** it has a source, dependency, route, capacity, process, consumer, sink, failure,
   or comparable relationship—not merely an atmospheric label.
3. **Change driver:** player action, occupant action, damage, supply, time, weather, fronts, or another
   recorded event can change it.
4. **Player-facing consequence:** its state can affect access, danger, reward, inhabitants, services,
   tactics, information, topology, contracts, or persistent world conditions.
5. **Legibility and agency:** the system can produce tells and at least one way to investigate, exploit,
   protect, repair, redirect, endure, negotiate around, or otherwise answer it.
6. **Affordable abstraction:** the consequence survives aggregation; it does not require per-object or
   per-person continuous simulation to remain honest.

A fact that fails those tests remains canonical description, history, or discovery content. It does not
receive a fake meter merely to look systemic.

Candidate systems enter through authored layers:

- **site-family foundations:** environmental continuity, access/circulation, stability, or another law
  intrinsic to the kind of place;
- **purpose-core systems:** custody in a prison, extraction/drainage in a mine, preservation/access in an
  archive, procession/offerings in a ceremonial site;
- **occupancy/resource systems:** supplies, shelter, renewal, security, waste, morale, or maintenance
  required by the actual population and operating state;
- **active context/front systems:** siege, overcrowding, plague, flooding, fire, labor conflict,
  contested control, structural failure, or similar current pressure;
- **anomaly/Spice systems:** Breach pressure, curse propagation, impossible geometry, living
  architecture, or another causal event whose behavior changes over time.

Not every canonical system must remain equally active. Use a graded lifecycle:

```text
latent invariant/fact
-> monitored state
-> active light simulation
-> foreground pressure/card source
-> resolved, stabilized, transformed, or scarred
```

Promotion is caused by the initial site state, approaching a threshold, a world event, dependency
failure, player attention/action, or narrative commitment. Demotion stops active ticking but preserves
the last state and future catch-up rules. The active-system budget scales with site complexity and
current pressure; no universal magic count is assumed.

Concrete distinctions:

- A hamlet jail may actively track custody/security while external meals remain a stable dependency.
  If a blizzard or siege cuts delivery, food reserve promotes into an active clock. The sheriff's
  demonic soap remains a discoverable object unless its dreams, confessions, or realm influence begin
  changing people or events.
- A city prison may begin with active staffing, food/water, sanitation, overcrowding/unrest, medical
  capacity, and ward integrity because failures already interact at institutional scale.
- A natural cavern may track drainage/flood level and structural stability while mineral color remains
  descriptive. A predator's arrival can promote prey movement or territorial control into active
  ecology.
- An alchemist shop may track stock and ordinary heat only coarsely, while volatile reagents,
  ventilation, and the concealed necromancy lab's containment form an interacting active system.

Genesis already has compatible small precedents: deterministic character resource pools, stamped
scene-risk pressure clocks, and persistent lazy codex state. The new layer should reuse their principle
of typed state plus explicit events. It should not delegate site truth to an autonomous AI simulator.

**Recommendation:** use the purpose-authored registry and admission test, seed qualifying systems as
canonical latent state, and promote only relevant/pressured systems into active simulation. After this
architecture is accepted, later Wave 2 questions can perform the deep writing pass family by family and
decide which systems are foundational, optional, or context-activated for each purpose.

**Open decision:** should light-sim eligibility follow this causal/player-facing admission test and
graded lifecycle, with every purpose family authoring its own candidate systems instead of applying one
universal checklist?

#### 10.2.1 Correction and follow-up - universal needs, hierarchical supply networks

Adam identifies an important flaw in the phrase "no universal food/water/morale system." A regional
event must propagate into dependent settlements and sites even if each local purpose profile did not
independently activate a food meter. If fires sweep the farmland supplying a large city, Genesis needs a
canonical answer to how the city changes.

Correct the ruling:

> There is no universal checklist of **local active meters**, but there is a universal typed vocabulary
> for needs, resources, services, flows, dependencies, shocks, buffers, and consequences across world
> scales.

The distinction is **where the authoritative state lives**. Shared production and supply should not be
duplicated in every tavern, prison, manor, and barracks. A regional or settlement supply system owns the
aggregate fact; dependent sites reference it and add local reserves, priority, alternatives, or failure
behavior only when those differences matter.

The simulation graph spans:

```text
realm/physics
  -> region and resource basin
  -> settlement and distribution network
  -> district/faction/institution
  -> bounded site
  -> zone/assembly
  -> individual actor or object only when exceptional
```

Edges may carry `produces`, `extracts`, `stores`, `imports`, `exports`, `routes`, `distributes`,
`consumes`, `maintains`, `protects`, `substitutes-for`, `depends-on`, and `disposes-to` relationships.
Resource families may include food, potable water, breathable air/ventilation, heat/fuel/energy,
shelter, health/care, labor, transport, security/containment, waste capacity, population renewal,
materials, and realm-specific equivalents. Applicability remains contextual: a sealed tomb may have no
living food demand, while preservation atmosphere and ward charge are critical. **Morale is usually a
derived cohort condition**, influenced by supply, safety, losses, legitimacy, faction pressure, and
events—not a commodity stored like grain.

##### Farmland-fire example

The causal chain should be recorded, not improvised:

1. A typed fire event affects one or more agricultural production areas, with scope, severity,
   duration, timing in the growing/storage cycle, and provenance.
2. Those areas lose some current stock, future production capacity, labor, infrastructure, routes, or
   several of these. The event need not simulate each acre; an agricultural basin can be the aggregate
   production node unless a named farm matters independently.
3. The nearby city already has a food-demand profile, stored reserves, import routes, distribution
   capacity, factional control, and substitutes. The lost production changes its projected balance.
4. Buffers absorb the first shock. As thresholds are crossed, typed consequences become eligible:
   reduced market stock, price increases, substitution, rationing, hoarding, smuggling, theft, relief
   efforts, faction leverage, migration, malnutrition, disease pressure, unrest, or institutional
   failure. Severity and order depend on the city's actual buffers and response, not a universal famine
   script.
5. Dependent sites inherit the settlement condition through their supply links. A well-connected noble
   estate, an army granary, a corrupt merchant, a temple soup line, a prison with three days of local
   stores, and a poor district can experience different timing and consequences without each owning a
   duplicate regional agriculture simulation.
6. Player actions can alter the graph: protect an import convoy, expose hoarding, negotiate grain,
   repair irrigation, open a magical food source, raid a reserve, redirect distribution, or help a
   faction weaponize the shortage. The resulting state persists.

This is still light simulation. Recalculate or advance affected components on the fire event, meaningful
time thresholds, player intervention, and lazy revisit catch-up—not every browser frame. Use exact
quantities where legible and useful; otherwise use production capacity, reserve, demand, and pressure
bands. A consequence roll may decide how institutions respond, but it may not invent or erase the
underlying shortage.

##### Existing Genesis seam

The current engine has only a coarse regional `econTilt`; its drift wiring explicitly cannot infer even
the direction of a price/stock change from prose, and `ECONOMY.md` deliberately defers dynamic
supply/demand and regional prices. `WORLD-TURN.md` already supplies the correct operational precedent:
script-owned events mutate persistent state, elapsed change resolves lazily on revisit, established
clocks override generic drift, and the DM narrates from the mutation. The future supply network should
extend that pattern rather than asking the AI to simulate markets freehand.

**Revised recommendation:** adopt a hierarchical world dependency graph with universal resource/service
types and scope ownership. Purpose families declare what they demand, produce, store, route, or depend
upon; region/settlement/site systems instantiate only the nodes that exist; active tracking occurs at
the highest shared scope plus meaningful local exceptions. Keep the causal/player-facing admission test
for deciding which nodes receive detailed active state, not for deciding whether universal dependencies
exist at all.

**Open follow-up:** should this hierarchical supply model replace the misleading "no universal
checklist" wording—universal need/resource vocabulary and cross-scale dependencies, but active meters
owned at the regional, settlement, site, or local scope where they are actually meaningful?

#### 10.2.2 Follow-up - how a systemic shortage changes NPCs

Adam provisionally accepts the hierarchical model and asks the decisive rabbit-hole question: how does
a system-wide shortage affect NPCs? A resource simulation that changes only a market number is not a
living world. Simulating every citizen independently would be both expensive and less coherent than
letting shared conditions propagate through actual social structure.

The recommended cascade is:

```text
resource shock
-> settlement policy, buffers, distribution, and faction response
-> cohort/zone exposure
-> salient NPC impact
-> NPC choice and action
-> feedback into the resource/faction/world state
```

##### 1. The city owns a pressure, not one identical outcome

When supply crosses a meaningful threshold, create or advance a typed settlement pressure carrying:

- affected resource/service and originating event;
- current severity, trajectory, expected threshold, and uncertainty;
- affected districts, institutions, routes, and population groups;
- public policy and faction responses such as rationing, requisition, relief, hoarding, price control,
  border restrictions, or import efforts;
- observable tells and actionable intervention points;
- links back to the damaged farms, stores, routes, and responsible events.

This pressure establishes conditions. It does not decide that every hungry person riots or every
merchant profiteers.

##### 2. Cohorts absorb the broad simulation

Aggregate people by causal exposure rather than by one universal social class list. Relevant cohort
dimensions can include district, institution, occupation, faction, wealth/access, household/dependents,
legal status, species needs, and supply priority. The same grain shortage may therefore reach:

- granary workers and food merchants through stock and livelihood;
- bakers and taverns through input scarcity;
- poor districts through price/access pressure;
- prisoners, patients, refugees, soldiers, or temple dependents through institutional ration policy;
- farmers through destroyed property, lost work, injury, and displacement;
- nobles or faction leaders through reserves, legitimacy, security, and political leverage;
- smugglers, thieves, transporters, and importers through new opportunities and risks.

The city can track an exposure/pressure state for these groups without minting every resident. Cohort
responses affect ambient encounters, labor availability, services, crime, migration, disease, public
order, faction recruitment, rumors, and the pool from which future NPCs emerge.

##### 3. Named and salient NPCs personalize the pressure

Known, contacted, contract-bound, faction-leading, thread-linked, or locally important NPCs receive an
individual impact when the pressure reaches them. Filter inherited cohort exposure through stable
facts already on or linked to the NPC:

- home/current location and occupation;
- employer, institution, faction, and access privileges;
- wealth, stores, tools, property, transport, and alternate suppliers;
- health, species requirements, injuries, and dependents;
- want, bond, fear, motivation, leverage, honesty, and other canonical character levers;
- prior relationship to the cause, affected people, factions, and player;
- elapsed time and previous responses.

The shortage may add a **situational need, pressure, or changed circumstance**; it does not overwrite the
NPC's foundational want, personality, bond, or identity. A baker can still be proud, grieving, devout,
or deceitful while urgently needing flour. Those combined facts produce the interesting response.

Valid response families include conserving, substituting, sharing, organizing relief, seeking work,
asking for help, bargaining, migrating, protecting dependents, enforcing policy, profiteering, hoarding,
smuggling, stealing, protesting, joining a faction, exposing corruption, becoming ill, or escalating to
violence. The selection is biased and constrained by the NPC's actual levers and opportunities; social
class or profession never dictates moral behavior by itself.

##### 4. Mechanical consequences land on existing kinds of state

An NPC impact can legitimately change:

- `status.condition` through hunger, illness, injury, exhaustion, or recovery;
- `status.at` through displacement, work reassignment, migration, arrest, recruitment, or refuge;
- services, stock, schedule, access, prices, available assistance, and contract terms;
- a situational need/pressure reference and associated clock;
- faction membership, standing, agenda clocks, leadership pressure, and occupation fronts;
- relationships, debts, dependents, promises, rumors, and new story cards;
- life-event eligibility and the consequences resolved by lazy World Turn catch-up.

Do **not** automatically lower every NPC's attitude toward the player. Genesis attitude is a persistent
stance toward this specific PC. It changes only when the NPC connects the player to the shortage,
relief, profiteering, policy, faction, broken promise, or a relevant interaction. Likewise, cohort
stability, combat morale, personal fear, and PC attitude remain related but distinct mechanics.

##### 5. Salience controls detail, not whether the consequence exists

- Unnamed ambient citizens remain represented by cohort state and changed encounter/population pools.
- Untouched soft NPCs need not receive daily records; when materialized, their stable seed and cohort
  history produce a response consistent with what happened.
- Known/hard NPCs retain identity and receive deterministic lazy catch-up when revisited.
- Highly salient NPCs and leaders may receive immediate event rolls or choices because their actions
  materially feed back into the city.

This composes with existing Genesis seams: codex identity and `status.condition`/`status.at`; persistent
per-PC attitude; NPC wants and motivations; soft-versus-hard salience; faction clocks; and World Turn's
lazy life events. The new work is to add typed pressure links and cohort propagation rather than create a
second NPC system.

##### Example lives under the same shortage

- The baker loses ordinary flour, substitutes an unpopular grain, and offers the party a contract to
  escort an importer. Their attitude toward the PC is unchanged until the party helps, exploits, or
  obstructs them.
- A rationed guard still eats, but their children do not. They enforce policy publicly while becoming
  vulnerable to a relief promise, bribe, faction appeal, or moral break consistent with their bond and
  honesty.
- A wealthy merchant has reserves and no hunger condition, but gains commercial and political pressure:
  sell fairly, hoard, import, donate, manipulate prices, or protect warehouses according to their
  character and faction interests.
- Prisoners receive reduced rations because the institution has low distribution priority. Health and
  unrest clocks advance; a particular prisoner may organize mutual aid, collaborate with guards, plan a
  break, or prey on others according to established traits and relationships.
- A priest turns the temple into a food line, consuming temple reserves and creating new volunteers,
  dependents, faction attention, and protection needs.

**Recommendation:** adopt cohort-first, individual-on-salience propagation. System pressures alter an
NPC's circumstances, needs, options, and consequences; canonical identity determines how the NPC
responds. Named NPC actions feed back into the supply network and faction state. Preserve the hard rule
that a systemic pressure never overwrites personality or silently changes PC attitude without a causal
relationship.

**Open follow-up:** is this the right NPC model for systemic shocks—cohort simulation for the population,
personalized lazy or immediate impacts for salient NPCs, and two-way feedback from their choices into the
city's shortage?

#### 10.2.3 Follow-up - healthy by construction; crisis requires provenance

Adam provisionally likes the systemic/NPC model but identifies the primary failure risk: a bugged resource
count, missing source, incorrect lazy catch-up, or unstable feedback loop could make every generated town
starve or suffer contaminated water. Genuine local crises should occur occasionally and become memorable,
not appear every campaign because the simulator silently trends toward collapse.

The design must separate two authorities:

1. **Incident/content authority decides whether a new problem exists.** Authored settlement/region
   pressures, Spice-aware problem rolls, recorded world events, player actions, faction outcomes, and
   existing failing canon introduce shocks.
2. **Simulation authority propagates and resolves an established cause.** It calculates buffers,
   thresholds, exposure, responses, recovery, and downstream consequences. It may not manufacture an
   initiating catastrophe from ordinary rounding drift or absent data.

This yields the governing law:

> Ordinary settlements are healthy by construction. Severe shortage, contamination, or systemic
> failure requires traceable provenance.

##### Viable baseline before play

Every settlement/site operating model must pass a viability check under its declared ordinary state:

- required demand is served by local production, stored reserves, imports, substitutes, or an explicit
  accepted dependency;
- supply routes and services are connected to real sources or are identified as external abstractions;
- reserves/resilience can absorb normal variance appropriate to the settlement;
- missing optional detail cannot be interpreted as zero supply;
- a deliberately precarious or failing settlement records that condition, cause, tells, thresholds,
  and consequence budget at generation.

A healthy town may still contain poverty, crime, unequal distribution, hard work, ordinary illness, and
specific households in distress. "Viable" prevents accidental universal catastrophe; it does not force
utopia or blandness.

##### Crisis provenance gate

A system may enter a severe failure state only if the mutation cites at least one valid causal source:

- an authored/rolled locale pressure with roll provenance;
- a recorded environmental, historical, faction, occupation-front, or World Turn event;
- a player-caused or player-enabled state change;
- an elapsed threshold on an already canonical strained/failing dependency;
- an inherited pressure from a linked region/settlement/site with its own valid provenance;
- a deterministic downstream consequence of one of the above.

The record preserves the root event and every propagation edge. "Food reserve became negative" is not
provenance. "The Greenfield fires destroyed the summer grain stores, imports were blockaded, and the
city exhausted its reserve after twelve days" is.

If a calculation produces NaN, a negative impossible stock, an unknown unit, a missing source, an
unversioned schema, a duplicate event application, or an impossible state transition, production code
must preserve the last valid state, quarantine/reject the mutation, and emit a loud diagnostic. It must
**fail closed against catastrophe** rather than treating corrupt or absent data as zero food or poisoned
water. The DM may never narratively paper over an invalid transition.

##### Buffers, competence, and recovery prevent death spirals

The world contains dampening responses as well as escalation:

- reserves, imports, substitutes, rationing, repair, mutual aid, migration, price response, relief,
  seasonal renewal, faction intervention, magic/technology, and player action can stabilize a system;
- pressures advance through legible stages rather than leaping from stable to mass starvation because
  one rate missed by a fraction;
- inhabitants and institutions act with context-appropriate competence instead of passively waiting to
  die;
- every systemic problem authors mitigation and recovery pathways alongside escalation;
- resolved pressures close or leave scars rather than continuing to tick forever;
- positive feedback loops are bounded, while negative feedback and recovery are deliberately present.

Challenge severity and Spice remain separate. A Grounded crop fire can become a severe humanitarian
crisis; a Mythic food source can solve one. Spice/content tables control the frequency and character of
new initiating problems, while resource thresholds control their material consequences.

##### Rarity and correlation live at the root-event level

New ambient systemic problems consume authored region/settlement pressure capacity and obey repetition,
cooldown, context, and distribution rules. Exact incidence is a later writing/soak decision rather than
an invented percentage in this discussion. The acceptance target is qualitative but firm: a starving
town is unusual enough to be notable across play, not an expected feature of every campaign.

One regional fire may causally pressure several linked settlements; this is one geographically coherent
root crisis with several manifestations, not several towns independently rolling starvation. The causal
event should create variety in response—one town imports, another rations, another is captured by
hoarders—without multiplying unrelated root failures.

##### Verification must test population behavior, not only single fixtures

Before this simulation can ship, its acceptance gate needs:

- unit/invariant tests for nonnegative stocks, typed units, connected dependencies, bounded rates,
  legal transitions, and valid provenance;
- idempotence tests: the same event cannot apply twice, and the same elapsed interval cannot be charged
  twice;
- equivalence tests: incremental daily/threshold updates and one lazy catch-up over the same elapsed
  time produce the same state;
- mutation/canary tests for reversed signs, removed sources, missing fields, NaN, duplicate ticks,
  broken recovery, and corrupt saves;
- deterministic seed corpora and long-horizon no-player soak runs measuring settlement states, crisis
  incidence, cause diversity, duration, recovery, and clustering;
- statistical acceptance bounds derived from Adam-approved content distributions: most ordinary
  settlements remain viable, severe crises track authored root-event frequency, and no unexplained
  upward failure drift appears over simulated years;
- adversarial fixtures for fire, drought, contamination, siege, blocked trade, population surges,
  magical supply, multi-settlement dependency, and Breach-linked resources;
- a workbench trace that answers: what changed, from which event, through which dependency, at what
  threshold, who responded, and why the current state is legal.

If a large seed/soak sweep produces "every town is starving," the build is red even if each individual
calculation can be rationalized. Distribution is a product contract, not merely a playtest impression.

**Recommendation:** adopt healthy-by-construction baselines, provenance-gated crises, last-known-good
transactional updates, authored buffers/recovery, root-event rarity budgets, and statistical soak gates.
The roller authors genuine locale problems; deterministic simulation gives those problems honest reach
and consequence. Arithmetic defects are diagnostics, never story prompts.

**Open follow-up:** does this sufficiently protect the experience—especially the laws that a severe
failure needs causal provenance, missing/corrupt data preserves the last valid state rather than becoming
zero supply, and release gates measure crisis incidence across large world/time corpora?

#### 10.2.4 Final ruling - hierarchical light simulation with crisis safety

Adam confirms the protection. Question 2 is resolved in its corrected form:

- Genesis maintains a universal typed vocabulary for needs, resources, services, flows, dependencies,
  buffers, shocks, and consequences, but does not duplicate a universal set of active local meters in
  every place;
- authoritative state lives at the highest shared meaningful scope—region, resource basin, settlement,
  district/institution, site, zone, assembly, or exceptional individual—with downstream sites linking to
  it and adding only meaningful local reserves, priorities, alternatives, or failure behavior;
- purpose families author qualifying candidate systems; the causal/player-facing admission test decides
  which receive mutable detail, while graded activation moves canonical latent facts into monitored,
  active, foreground, and resolved/scarred states;
- systemic shocks propagate through settlement policy/distribution into cohorts, then personalize for
  salient NPCs through their stable location, role, access, relationships, resources, dependents, and
  character levers;
- circumstances and situational needs may change; foundational identity and per-PC attitude are never
  silently overwritten. NPC choices feed back into supply networks, factions, occupation fronts, and
  world state;
- ordinary settlements are healthy by construction. Severe crisis requires causal provenance from an
  authored/rolled pressure, recorded event, player action, established failing threshold, inherited
  pressure, or deterministic consequence;
- missing/corrupt data preserves the last valid state and raises diagnostics rather than becoming zero
  supply or contamination;
- buffers, competent responses, mitigation, recovery, and closed/scarred end states are authored
  alongside escalation;
- root-event rarity/distribution controls how often genuine local problems begin; simulation controls
  their reach and consequence;
- deterministic seed corpora, long-horizon soak metrics, incremental-versus-lazy equivalence,
  idempotence, corruption canaries, and statistical crisis-incidence bounds are release gates. If every
  town starves in a sweep, the build is red.

#### 10.2.5 Future-question assignments seeded by question 2

| Inherited ruling | Future owner |
|---|---|
| Universal cross-scale resource/service vocabulary with state owned at the highest shared meaningful scope | Remaining **Wave 2** ecology/profile writing defines candidate systems and dependencies; future **regions, settlements, economy, and World Turn** design owns the world-scale graph |
| Purpose-authored eligibility and graded latent -> active -> foreground -> resolved lifecycle | Remaining **Wave 2** questions inventory and budget site systems; **Wave 9** owns strategic-card projection and active-hand pressure |
| Cohort-first population effects and personalized impacts for salient NPCs without identity/attitude overwrite | Future **NPC/social/faction/World Turn** design owns pressure links, response rolls, catch-up, and feedback events |
| Healthy-by-construction baseline, crisis provenance gate, last-known-good corruption behavior, and authored mitigation/recovery | **Wave 12** owns schema validation, transactionality, migrations, diagnostics, fuzz/mutation tests, and release gates |
| Destruction, repair, supply interruption, occupation changes, and other events mutate the dependency graph explicitly | **Wave 8** owns environment/topology-changing event contracts; the world event system owns cross-scale propagation |
| Exact locale-crisis incidence, cooldown, repetition, resilience, threshold, and recovery distributions remain taste/tuning work | Later **Wave 2** writing passes establish authored targets; statistical soak and playtest evidence tune them without weakening the provenance law |

### 10.3 Question 3 - when does an obligation become its own room?

In plain English: the roster knows that a site needs custody, oversight, food supply, sanitation,
records, worship, drainage, processing, preservation, incubation, or another capability. How does it
decide whether that need becomes a dedicated room, shares a room, lives as a fixture/assembly, spreads
across a zone, happens through a scheduled procedure, or is supplied from outside the site?

The system must avoid two opposite failures:

- **one obligation = one room** bloats small sites and turns an operating model into an architectural
  checklist—a hamlet jail receives separate intake, records, evidence, guard, meal, sanitation, and
  visitation rooms whether or not its capacity supports them;
- **combine/externalize everything possible** creates magic multipurpose rooms and hollow sites—a desk,
  cupboard, bucket, tavern delivery, and one barred corner allegedly satisfy an entire prison while all
  graph capacity is handed to unrelated Spice.

The useful realization forms are:

- dedicated room or chamber;
- repeated room/child assembly such as cells, niches, bays, stalls, beds, or workstations;
- combined multifunction room with compatible concurrent or scheduled uses;
- attached subroom, alcove, closet, fixture, or furniture assembly;
- distributed zone/system such as drainage, ventilation, watch coverage, shelving, wards, or procession;
- topology/threshold feature such as checkpoint, sally port, sluice, ritual boundary, or controlled
  transition;
- procedure or scheduled transformation of a space;
- external service/dependency with a real provider, route, reliability, access, and failure behavior;
- subordinate site, annex, inherited pocket, or Breach-linked domain when causally licensed.

The research supports describing semantic requirements, relationships, counts/ranges, and hierarchical
blocks before spatial realization. The current room grammar already contains a useful relationship
vocabulary; this question decides the upstream allocation contract it will eventually consume.

The recommended model is an authored **realization contract** on every obligation. It declares:

- allowed and preferred realization forms;
- minimum capacity/throughput and the scale curve that increases quantity;
- whether the use can be concurrent, scheduled, shared, or combined;
- privacy, security, contamination, acoustic, ritual, visibility, and access constraints;
- required adjacency, separation, route, operator, support, storage, or disposal relationships;
- conditions under which dedicated space becomes mandatory;
- whether and how the obligation may be externalized;
- acceptable degraded/failing forms;
- eligible room/assembly recipe families and contextual modifiers.

The planner then applies **dedication pressure**. Higher load, simultaneous demand, privacy/security,
special equipment, contamination, long dwell time, restricted access, doctrinal importance, or dangerous
failure push a capability toward its own room or zone. Low load, compatible schedules, shared operators,
ordinary equipment, and acceptable external reliability permit combination or external service.

Concrete examples:

- In a hamlet jail, oversight and records may share the sheriff's office; one barred room may contain
  several stable cell children; meals come from a named tavern/cook route; sanitation may be a yard
  privy; evidence might be a locked cabinet until caseload/security demands a dedicated store.
- In a city prison, intake and public visitation conflict with secure circulation; food throughput,
  sanitation, medical isolation, records volume, staff shifts, evidence security, and repeated custody
  demand push several functions into rooms, suites, and cellblock assemblies.
- A temple's purification might be a font at the threshold, an attached washing room, a river
  procession, or an entire bathing court depending on doctrine, throughput, privacy, climate, and scale.
- A cavern's drainage is a distributed flow across slopes, channels, pools, and exits—not a room called
  "Drainage." A predator den may express feeding and waste through spatially separated habitat zones.
- An alchemist's ventilation may be a distributed system, reagent storage a secure subroom, ordinary
  sales and records a shared front room, and necromantic containment a dedicated hidden subordinate
  domain because its hazard and secrecy demand separation.

Externalization must be honest. "Meals come from town" requires a provider or abstract service node,
route, cadence/reliability, access, and failure consequence; it cannot be a free deletion of the kitchen
obligation. Combination must likewise preserve capacity, concurrency, privacy, circulation, and every
player-facing function. The compiler may optimize realization but not erase obligations.

Guaranteed operating-model capacity and protected discretionary/Spice capacity are reserved before
this reconciliation. The system cannot compress the prison dishonestly to make more random rooms, nor
consume every juicy slot because each capability demanded its own noun-room.

**Recommendation:** give every obligation a typed menu of legal realization forms and dedication
triggers. Let context and operational load decide shared versus dedicated space, with auditable reasons,
while requiring external services and distributed systems to exist as real dependencies in the graph.

**Open decision:** should this realization-contract and dedication-pressure model govern whether an
obligation becomes a room, assembly, shared use, distributed system, procedure, external dependency, or
causally licensed child site?

#### 10.3.1 Clarification - how realization works mechanically

Adam asks for the question in simpler terms and for the actual mechanical path. The core decision is:

> When is prison evidence a locked cabinet in the sheriff's office, when is it an attached closet, and
> when is it a dedicated evidence room?

An **obligation** is something the site must be able to do. A **realization** is the concrete way the
site does it. The roster does not roll a room first and then invent a justification; it rolls or derives
the required capability, evaluates its legal manifestations, and emits a space/service demand for the
graph and room compiler.

##### Mechanical input

For each obligation instance, the planner knows:

- purpose family and importance class;
- designed load/capacity, throughput, and concurrent use;
- original operators/users and their scale/access domains;
- construction context, doctrine, resources, technology/magic, and spatial envelope;
- privacy, security, hazard, contamination, acoustic, visibility, ritual, and support needs;
- dependencies and relationships to other obligations;
- external providers/routes already present in the surrounding settlement/region;
- current state/history only after the original viable realization is solved.

A human-readable source entry might conceptually say:

```text
Obligation: evidence custody
Required for: prison/jail
Quantity driver: case volume + security level
Legal forms:
  locked cabinet in oversight office     low volume; ordinary evidence; shared access acceptable
  attached secure closet                 modest volume; restricted access
  dedicated evidence room                high volume/security or hazardous items
  external civic evidence store          real provider + guarded route + reliable access required
Forbidden combinations:
  food preparation; public waiting; sanitation; prisoner-controlled space
Dedicated triggers:
  hazardous evidence; high secrecy; high throughput; incompatible access schedules
```

The authored Markdown remains a roller/table. The compiler normalizes it into indexed fields so it can
perform cheap eligibility checks rather than asking the AI to interpret prose.

##### Mechanical pass

The recommended constructive pass is:

1. **Instantiate obligations.** Purpose, scale, occupancy, doctrine, and ecology produce concrete demand:
   `custody:4`, `oversight:1`, `evidence:low`, `meals:external-eligible`, and so forth.
2. **Expand hard dependencies.** Custody may require controlled access and observation; meal service may
   require delivery, storage, distribution, and waste even when cooking is external.
3. **Enumerate legal realization candidates.** Read the obligation's editable roller and filter by
   capacity, context, envelope, provider availability, and hard compatibility.
4. **Commit hard-dedicated needs first.** A hazardous alchemical process, secure vault, ritual sanctum,
   or high-throughput cellblock cannot be squeezed into an incompatible multipurpose room.
5. **Create repeated assemblies.** Quantities become compact assemblies—four cells in one cell room,
   several cellblocks in a large prison—rather than unrelated top-level room rolls.
6. **Test legal combinations.** Compatible obligations may share a room/assembly only if capacity,
   concurrency, access, privacy, circulation, support, and contamination rules all survive.
7. **Test external service candidates.** Externalization is legal only when a provider/service node,
   route, cadence/reliability, access, and failure consequence exist.
8. **Choose among remaining legal candidates.** Editable dice weights, context modifiers, variation
   control, and soft composition scores select a result; hard truth is never traded for a higher score.
9. **Emit a semantic space/service graph.** The output names room/assembly demands and relationships—
   intake near public entry, cells behind control, evidence accessible to staff but not prisoners,
   delivery route to storage—without choosing coordinates.
10. **Validate the complete operating model and protected variation.** Every obligation has an honest
    home/service; no room is overloaded; external links resolve; required capacity and protected
    discretionary/Spice capacity remain. A small bounded backtrack revisits recent soft choices if the
    set fails; impossible inputs produce diagnostics rather than deletion.

The later topology/room compiler receives something like:

```text
space sheriff-office
  satisfies: oversight, records
  contains: evidence-cabinet
  access: staff

assembly cell-room
  satisfies: custody capacity 4
  children: cell-1, cell-2, cell-3, cell-4
  requires: controlled-threshold, observation

service meals
  provider: tavern-red-lantern
  route: rear-street -> jail-service-door
  cadence: twice daily
  local-buffer: one missed delivery
  failure: ration pressure

space discretionary-1
  protected: true
  requires: at least one juicy player handle
```

##### Hard rules versus weighted choice

"Dedication pressure" should not be one mysterious number that can override reality. It is a readable
summary of several factors:

- **hard triggers** make a form mandatory or illegal: incompatible security zones, dangerous
  contamination, required simultaneous use, physical capacity, unique machinery, canonical doctrine;
- **soft pressures** alter weights among otherwise legal forms: prestige, convenience, privacy
  preference, ordinary noise, desired redundancy, likely future growth, tradition, and aesthetic
  composition.

Thus hard constraints filter; dice and scores choose within the surviving set. The decision trace can
say: `dedicated evidence room rejected: low case volume`; `external store rejected: no provider`;
`cabinet accepted: capacity 4/6, staff access compatible`; `closet remained legal but lost the weighted
roll`. Modders see tables and modifiers, not a black-box optimization verdict.

##### Hamlet-jail example, end to end

Assume a four-prisoner jail with a sheriff and deputy in a small town:

- `custody` cannot externalize and requires secure separation -> one cell-room assembly with four stable
  cell children;
- `oversight + records` share staff, access, schedule, and equipment -> legally combined sheriff office;
- `evidence` is low-volume and nonhazardous -> cabinet/closet/dedicated/store are considered; cabinet wins;
- `meals` finds a tavern provider and safe delivery route -> external service plus minimal local buffer;
- `sanitation` finds a secure yard route -> privy assembly; chamber pots remain a degraded/failing form;
- `staff rest` may be external lodging or a bunk alcove depending schedule and distance;
- protected variation still creates likely additional spatial flavor, and every realized room/assembly
  receives discovery/Spice opportunities under the accepted rules.

Raise capacity, case volume, visitor throughput, staff shifts, disease control, or evidence hazard and
the same contracts begin rejecting combination: intake separates from public visitation, records and
evidence split, sanitation gains dedicated infrastructure, kitchens internalize, and cell rooms repeat
as blocks.

##### Distributed systems do not disappear

Some obligations output graph-wide structures rather than room nodes. Ventilation creates intake,
route, outlet, maintenance access, and affected-zone links. Drainage creates slopes/channels, collection,
outflow, and blockage points. Patrol coverage maps posts, routes, sightlines, response times, and gaps.
These systems may still require dedicated control or maintenance spaces, but the obligation itself is
not mislabeled as one room.

##### Cost/solver boundary

This is a bounded constructive allocator, not a general-purpose optimal-building theorem prover. It
orders the most constrained obligations first, scans indexed legal candidates, combines only declared
compatibilities, and backtracks over a small recent choice set. The expensive geometric work still
belongs to later waves. Runtime should remain small; the main cost is authoring honest contracts and
tests.

**Recommendation:** hard constraints first, compact repeated assemblies second, then roller-weighted
choice among legal combined/dedicated/external/distributed realizations. Emit a semantic graph plus a
plain-language decision trace before any coordinate solver runs.

**Open follow-up:** does this concrete allocation pipeline match the intended design, especially the
boundary that hard rules filter candidates while editable dice weights choose among the legal results?

#### 10.3.2 Ruling and follow-up - large cities use a bounded active working set

Adam accepts the allocation pipeline as a way to bring places to life, then asks how the same systemic
depth avoids bloating or destroying the engine when a party enters a large city.

The governing answer is:

> A city is a hierarchy of aggregate systems and deterministic latent places, never one fully
> instantiated dungeon graph, population, renderer scene, or DM context.

This reinforces existing Genesis laws rather than adding a competing architecture:

- `PLACE-GEN.md` already says settlements remain compositional while the Place Spine describes sites;
- region identities generate deterministically on first touch;
- World Turn resolves elapsed offscreen change lazily rather than ticking the whole world continuously;
- the codex already distinguishes bounded soft entities from contacted hard canon and bounds its
  recyclable soft pool;
- the accepted digest is full-detail here-and-now plus a thin name-only wider roster;
- the renderer shows one active room/site projection rather than the whole place graph.

##### Canonical hierarchy

```text
city root
  citywide identity, population/load bands, law, economy/resource networks
  factions, major institutions, active pressures, transport/access spine
  district summaries and stable latent ids/seeds

district
  dominant functions, cohorts, local supply shares, fronts, routes
  important sites + weighted latent site opportunities

bounded site
  purpose/roster, topology, occupants, local systems, latent rooms/assemblies

active room/assembly
  full current geometry, cast, objects, opportunities, cards, and presentation
```

The city can canonically contain thousands of buildings and many thousands of people without minting a
record for each. Counts, distributions, cohorts, service capacity, and stable generation seeds preserve
the larger truth. A named building, NPC, street, supplier, or institution receives a stable stub when
promised and expands only when required by arrival, attention, causality, a contract, or a due event.

No expansion recursively generates every relationship. If a baker names a flour supplier, the supplier
can begin as a stable promissory reference with invariants; their family, employees, warehouse rooms,
and trade network do not all materialize until play needs them.

##### Bounded active working set

At any turn, the engine actively evaluates only:

- the current district/site/room and its immediate connection context;
- the active cast and contacted entities relevant to the scene;
- due contracts, fronts, pressures, hazards, and world events;
- directly affected dependencies whose thresholds may change;
- a small near-term reserve/prefetch set of meaning-soft assets, never speculative narration.

Everything else remains canonical but cold. A scheduler promotes records into the active set and demotes
them after they stabilize or leave relevance. Demotion stops active work; it does not erase last state,
identity, events, or deterministic catch-up rules.

The cost target is therefore:

> `work per turn = active local slice + due events + changed dependency frontier`, not total city
> population, total building count, or total campaign canon.

##### Shared systems update once

A citywide grain shortage updates the authoritative city food network once. It then changes affected
district/cohort summaries and queues only thresholds or salient NPC impacts that actually fire. The
engine does not visit every tavern, household, prisoner, and market stall.

Sites reference shared city state:

```text
city food pressure: strained
district southbank exposure: high
prison supply priority: low
prison local reserve: three days
```

The prison becomes actively food-strained when its own threshold arrives. Until then, it carries the
link and projected deadline, not a per-turn duplicate food calculation. A graph update propagates along
dirty/affected dependency edges only; unchanged branches are not recomputed.

##### Population remains cohort-first

A large city may have aggregate cohorts for districts, institutions, occupations, factions, legal
status, supply access, or species needs. Only scene anchors, contacted people, leaders, contract parties,
thread-linked NPCs, and other salient individuals receive full records and personalized state. Ambient
citizens are drawn consistently from the current cohort conditions when needed.

Soft uncontacted NPCs remain bounded and recyclable under existing codex principles. Hard/known NPCs are
never discarded; their individual catch-up resolves only when due or relevant. Long campaigns may grow
the cold hard-canon store, but DM context and active simulation remain bounded.

##### Navigation and rendering remain layered

Urban movement stays an urban walk through districts, routes, thresholds, and institutions. Entering a
manor, prison, temple, sewer access, or other bounded site opens that site's compiled graph. Entering a
room materializes/renders the local room plan. Genesis never rasterizes an entire large city into one
five-foot-cell map merely because the player arrived at its gate.

Renderer and combat state receive only the active local plan. A controlled threshold may show a limited
glimpse, but neighboring districts/buildings/rooms do not all become live geometry.

##### Four independent budgets prevent four kinds of bloat

1. **Materialization budget:** limits how many latent sites, rooms, NPCs, and networks expand in one
   operation. Overflow remains stable queued stubs; required player-facing answers take priority.
2. **Simulation budget:** limits active systems and dirty dependency propagation. Due hard consequences
   cannot vanish; work queues deterministically across safe boundaries or uses authored aggregate forms.
3. **Context budget:** the DM receives full local records plus thin references and due pressures, never
   the city index or full supply graph.
4. **Render budget:** only active geometry, cast, lights, and interactables mount; representation does not
   define or force canon expansion.

These budgets must never silently delete obligations, contacts, or consequences. They control
resolution/materialization timing and representation, not truth. If immediate player action requires a
record, it outranks speculative prefetch and low-priority background work.

##### Persistence and maintenance

Persist compact aggregate snapshots, hard/known records, event provenance, system thresholds, and
materialized plans. Stable latent content stores ids/seeds/invariants rather than full payloads. Event
logs can be compacted into validated snapshots while preserving important provenance; schema migration,
cold-record compaction, storage ceilings, and deterministic replay belong to Wave 12.

Acceptance tests should include large-city arrival, repeated district traversal, long campaign return,
mass shortage propagation, thousands of latent site/NPC stubs, growing hard canon, and adversarial
player attention. Metrics must separately report generation time, turn time, memory/save growth, digest
size, mounted render objects, active systems, dirty edges, and fallback/queue rates.

**Recommendation:** adopt hierarchical canon plus a bounded active working set. The city root owns shared
systems; districts own aggregates; bounded sites compile on relevance; rooms and individuals expand on
contact/attention; offscreen change catches up through events and thresholds. Every work surface remains
bounded even while the persistent world grows.

**Open follow-up:** is this the correct scale boundary—no monolithic city simulation or geometry, with
cost tied to the active district/site/room and changed dependency frontier while the rest of the city
remains compact deterministic canon?

#### 10.3.3 Final ruling - typed realizations and bounded hierarchical expansion

Adam confirms the scale boundary. Question 3 is resolved:

- obligations emit typed realization candidates—dedicated room, repeated assembly, legal shared use,
  attached fixture/subroom, distributed system, topology feature, procedure, external service, or
  causally licensed subordinate domain;
- hard capacity, concurrency, access, security, privacy, contamination, support, doctrine, and physical
  rules filter candidates before editable dice weights and soft scores choose among the legal results;
- externalization requires a real provider/service abstraction, route, reliability/cadence, access,
  buffer where appropriate, and failure consequence;
- distributed systems emit network/zone/edge demands rather than being mislabeled as rooms;
- the allocator commits constrained needs first, represents repetition compactly, performs bounded
  constructive combination/backtracking, preserves protected variation, validates the operating model,
  and emits a semantic graph plus plain-language decision trace before coordinates;
- cities remain hierarchical aggregate canon with deterministic latent districts/sites/populations;
  runtime work is bounded to the active local slice, due events, and changed dependency frontier;
- materialization, simulation, DM-context, and renderer budgets control work/presentation without
  deleting canon, obligations, or due consequences.

#### 10.3.4 Future-question assignments seeded by question 3

| Inherited ruling | Future owner |
|---|---|
| Obligation realization contracts define legal forms, hard filters, soft weights, dedicated triggers, externalization, and degradation | Remaining **Wave 2** questions define roster/repetition content; **Waves 3-5** consume the contracts in topology, rooms, assemblies, and dressing |
| Semantic space/service graph is emitted before coordinates, with constrained obligations committed first and protected variation preserved | **Waves 3 and 4** own graph/topology realization and diagnostics without reopening semantic allocation authority |
| External services and distributed systems remain real dependency structures | Remaining **Wave 2** ecology work and future **region/settlement/economy** systems own providers/flows; **Waves 3-5** own their spatial manifestations |
| Settlements use aggregate city -> district -> site -> room hierarchy and a bounded active working set | Future **place/codex/World Turn** architecture owns materialization scheduling; **Wave 12** owns persistence, cold-state compaction, save growth, and stress gates |
| Materialization, simulation, context, and render budgets never erase truth or due consequences | **Waves 9-12** own hand/context projection, visual scope, workbench metrics, and acceptance tests |

### 10.4 Question 4 - how should repeated functions gain variation without losing identity?

In plain English: a city prison may contain twelve cells, several guard posts, repeated bunk rooms, and
rows of storage bays. How does Genesis make them feel like parts of one institution without producing
twelve identical copies—or rolling each independently until every cell contains an unrelated demon,
treasure cache, murder mystery, and architectural anomaly?

Wave 1 already locked several constraints:

- repeated spaces are hierarchical assemblies with stable child identities;
- most cells may be visibly ordinary while some contain treasure, people, refusals, clues, or other
  opportunities;
- every realized room/child space retains a meaningful discovery opportunity;
- scoped causal Spice permits independent child rolls but manifestations of one root event inherit
  rather than rerolling;
- major secrets and narrative revelations are budgeted/coordinated at site or zone scale rather than
  multiplying once per child.

The remaining Wave 2 problem is the **quantity and variation program**.

Two sole-authority models fail:

- **Exact cloning** is cheap and architecturally coherent, but turns exploration into checking twelve
  interchangeable boxes. Local people, history, damage, use, and discovery disappear.
- **Full independent rerolling** maximizes novelty but destroys shared construction and probability. A
  cellblock stops feeling like one designed unit and high-band outcomes multiply with child count.

The recommended model is a **correlated repeat family with controlled variation**.

##### 1. Quantity is caused, not filler

Repeat count comes from operational load, throughput, staffing, accommodation, duty cycle, redundancy,
and history—not merely how many graph nodes remain. A prison's inmate capacity drives cell/bed count;
guard coverage drives posts; a mine's extraction/transport load drives work faces, cart bays, and
storage; a crypt's lineage/doctrine drives niches and tomb groups.

The obligation contract may express exact count, dice range, capacity-per-unit, minimum/maximum, bay
size, block size, phased growth, and degraded/lost capacity. Human-readable dice remain the source.

##### 2. Generate the family before the children

An assembly first rolls shared facts:

- builder/design tradition, dimensions/scale, material, portal/fixture pattern, circulation, and
  service/support system;
- original purpose and capacity policy;
- block/wing doctrine, security/access, occupancy, condition, and current-use overlay;
- any site/zone causal event whose manifestations repeat through the family;
- a variation budget and protected exceptions.

Children inherit those facts. A twelve-cell block therefore shares bar design, wall rhythm, sightlines,
sanitation method, ward system, and construction era unless an explicit alteration explains divergence.

##### 3. Vary children across separate channels

Each child may vary through eligible channels rather than rerolling its whole identity:

- **position/role:** entrance-facing, observed, corner, deep, near service, blind spot, disciplinary,
  accessible, prestigious, marginal;
- **capacity/form:** single/shared, intact/partitioned, larger/smaller licensed variant;
- **occupancy/current use:** occupied, vacant, reserved, storage overflow, quarantine, shrine, work,
  abandoned, repurposed;
- **condition/history:** repaired, scorched, damp, damaged, recently cleaned, escaped-from, inherited;
- **person/network:** occupant, guard relationship, refusal, routine, claimant, social tie;
- **local discovery:** note, mark, cache, tool, evidence, acoustic clue, route tell, practical resource;
- **independent Spice opportunity:** eligible local event within table-class and site/zone budgets;
- **root manifestation:** a tell/consequence of an already-rolled block/site event, inheriting its band
  and causal identity rather than rolling again.

No child needs to vary on every channel. An ordinary child can differ only by occupancy, wear, a name
scratched in the wall, or what can be heard through it and still reward attention.

##### 4. Use coverage and anti-repeat controls without hiding the dice

Editable rollers define variant outcomes and weights. The compiler may use deterministic shuffle bags,
weighted no-immediate-repeat rules, coverage reservations, or bounded rerolls to avoid implausible
streaks and guarantee required roles. This is a compilation technique over human-readable dice, not a
replacement for them.

Examples:

- if a twelve-cell block requires one observation cell and one sanitation access point, reserve those
  roles before ordinary child variation;
- a current occupancy target may establish seven occupied, three vacant, one quarantine, and one
  storage-overflow cell, then deterministically assign them to legal positions;
- a discovery family can ensure several quiet/local results, a few stronger clues/resources, and only
  the site-budgeted number of coordinated major manifestations;
- repeated identical rolls can sometimes remain—three empty clean cells in a row may be truthful rhythm—
  but accidental long monotony or implausible streaks become measurable rather than invisible.

##### 5. Variation has scope and cost

The assembly records shared data once. Children store stable ids/seeds plus overrides, occupancy,
discovery promises, and hard observed state. Latent children do not need full geometry, NPC networks, or
item records until approached. This preserves distinct spaces without multiplying engine/context cost.

##### Prison example

A city prison rolls one twelve-cell block:

```text
shared: old civic masonry; iron grille fronts; central guard sightline; bucket collection at dawn
current block state: overcrowded; one deputy faction skims supplies
root event: a prior escape compromised the north service wall

children:
  1-5 ordinary occupied cells with different people/routines/local tells
  6 shared overcrowded cell; disease pressure
  7 empty observation cell; unusually clean
  8 quarantine cell; food passed through a secondary hatch
  9 storage-overflow cell; confiscated bedding and one practical cache
  10 occupied cell; child-note promissory thread
  11 vacant cell; root-event manifestation, mortar recently replaced
  12 disciplinary cell; service-wall blind spot and concealed route evidence
```

The block reads as one designed institution. Its human stories and opportunities vary. The escape event
has several correlated manifestations rather than independently rerolling a new major secret in every
cell.

**Recommendation:** derive repeat quantities from operational demand, roll one shared family/assembly,
then apply bounded child variation through typed channels, protected roles, coverage/anti-repeat tools,
and scoped causal Spice. Store shared facts once and child overrides sparsely.

**Open decision:** should repeated spaces use this correlated-family model—causal quantity, shared
assembly identity, sparse typed child variation, and deterministic coverage/repetition controls over
editable rollers?

#### 10.4.1 Correction and follow-up - countercases and scoped variation authority

Adam identifies a design-monoculture risk: prison is a strong test for operating models, security,
capacity, repeated sleeping/holding units, institutional support, and controlled circulation, but it
naturally rewards standardization and restricted occupant expression. A system tuned only against
prisons may incorrectly make dormitories, residential blocks, workshops, markets, studios, or other
lived-in places feel like cellblocks.

Adam accepts mild or even no visible variation as tolerable for mundane prison cells because occupants
are allowed little property or expression. The same result is unacceptable for a college dormitory or
residential block, where people shape private space. Ordinary hotels may remain mildly variant; a
boutique hotel with themed rooms requires strong operator-authored variation. Variation needs scope and
an honest engine-cost budget.

##### Primary countercase - the residential college

Add a **residential college/university hall** as the primary opposite-spectrum fixture alongside the
frontier/city prison family.

| Dimension | Prison | Residential college |
|---|---|---|
| Control | centralized, coercive, restricted | institutional but negotiated and semi-autonomous |
| Repeated unit | cells designed to suppress difference | dorm rooms designed to support private life |
| Occupant agency | low | high |
| Property/expression | tightly limited | clothing, books, art, tools, hobbies, faith, culture, relationships |
| Movement | controlled thresholds and schedules | porous circulation, class/social schedules, visitors |
| Tenure | involuntary and administratively tracked | seasonal/term-based with turnover and accumulation |
| Shared services | guard/control, rationing, sanitation | dining, study, bathing, recreation, teaching, administration |
| Social graph | custody, hierarchy, contraband, solidarity/conflict | roommates, friends, rivals, mentors, clubs, romances, factions |
| Failure modes | escape, abuse, unrest, containment failure | overcrowding, exclusion, academic conflict, supply/service failure, magical accident |

A residential college also scales naturally into Genesis's realm future: mundane dorms, monastic
schools, wizard colleges, martial academies, bardic conservatories, Breach-research institutes, or
nonhuman communal education can share the semantic spine without sharing exact rooms or expression.

##### Non-institutional sentinel - living habitat/cavern

Keep at least one **living hive, fungal cavern, predator nesting complex, or comparable habitat** in the
stress corpus. Its repeated chambers vary through biological stage, moisture, heat, food access,
damage, brood state, predator pressure, symbiosis, and realm physics—not personal decoration. This
prevents the prison/college comparison from silently assuming that all variation comes from human
operators and residents.

##### Small Wave 2 stress corpus

Do not fully author every building type now. Use a compact orthogonal corpus to reject bad abstractions:

1. **Hamlet jail** - tiny, highly combined, externally supplied, likely added spicy space.
2. **City prison** - large controlled repetition, layered security, institutional ecology.
3. **Residential college hall** - repeated private units with high occupant expression, schedules, and
   social networks.
4. **Ordinary inn versus boutique inn pair** - similar hospitality function; low structural variation
   and turnover traces versus strong operator-curated themes.
5. **Living habitat/cavern** - distributed nonhuman ecology and non-personal repeat variation.

These are semantic fixtures and writing probes, not five finished content products or geometry builds.
Other purposes must eventually pass the same contracts, but this corpus is sufficient to expose many
assumptions without turning the discovery wave into complete game authoring.

##### Variation is a profile, not one percentage

Replace any implied universal "variation amount" with a factored **variation-authority profile**. Useful
independent inputs include:

- **construction standardization:** how strongly shells, fixtures, and layouts repeat;
- **operator curation:** whether the institution deliberately differentiates units—boutique themes,
  ranks, houses, disciplines, luxury tiers, ceremonial identities;
- **occupant expression license:** what residents are permitted and physically able to alter/display;
- **tenure and turnover:** how long identity can accumulate versus how often rooms reset;
- **privacy and control:** whether personal traces can persist unseen or are inspected/removed;
- **material access/wealth:** what occupants can acquire, make, store, or maintain;
- **occupancy individuality:** household, roommate, solitary, transient, mass cohort, brood, machinery;
- **history/condition:** repairs, prior occupants, layered use, damage, inheritance, neglect;
- **current pressure:** overcrowding, shortage, festival, mobilization, quarantine, exams, siege;
- **causal Spice/discovery:** local independent opportunities and inherited manifestations under the
  already accepted scope rules.

These profiles interact but do not form an authored Cartesian matrix. Each layer contributes typed
shared facts or sparse overrides through the channels it owns.

##### What varies in different repeated-room families

- **Mundane prison cell:** shell and fixtures nearly identical; variation may be only occupancy,
  condition, confiscation/contraband, marks, sound, relationship, and discovery. Some cells can be
  genuinely bare.
- **Chain/ordinary hotel room:** standardized shell/furniture; mild wear, view, current guest trace,
  service condition, prior incident, and occasional upgraded unit.
- **Boutique hotel room:** shared hospitality obligations, but operator curation assigns stable room
  themes, signature assemblies, names, sensory identities, and different guest affordances.
- **College dorm room:** shared shell/service grid; occupant-linked bedding, wall/desk displays, books,
  tools, hobbies, faith/culture, roommate relationships, prohibited items, routines, and discoveries.
- **Residential block household:** stronger persistent household identity, multigenerational history,
  economic adaptation, shared/private boundaries, neighbors, and local services.
- **Brood chamber/hive cell:** shared biological construction; variation from development stage,
  nutrition, caste/function, temperature, disease, damage, parasitism, and defense.

No high-expression room requires a fully simulated inventory. The room receives a bounded set of
**signature expressions** selected from the occupant/household/operator records plus lightweight ambient
fill. Those signatures should reveal character or play opportunities; the renderer does not mount every
sock, page, and spoon.

##### Mechanical cost and scope control

The correlated-family model remains cheap if variation is stored as sparse layers:

```text
shared assembly/base recipe
+ operator variant kit (optional)
+ occupant/household expression seed and references (optional)
+ condition/history overrides
+ current pressure/use
+ discovery/Spice opportunities
```

- **Latent child cost:** stable id/seed, profile refs, occupant/household ref, state, and sparse overrides;
  no full object list, geometry, or NPC network until relevance.
- **Materialization cost:** only the approached/active room resolves signature props and local detail.
- **Render/context cost:** existing active-room and digest budgets still bind; high semantic variation
  does not put the whole dormitory on screen or in the DM prompt.
- **Runtime cost:** low, proportional to active materialized expression slots rather than total rooms.
- **Save cost:** low-to-moderate over long play as contacted rooms harden; Wave 12 owns snapshot/compaction
  stress gates.
- **Authoring cost:** meaningful—the favorite writing work—but shared expression banks and typed kits
  prevent unique hand-authored recipes for every room.
- **QA cost:** higher but bounded by the small orthogonal fixture corpus and distribution/variety metrics.

Wave 2 should decide variation authority, channels, budgets, inheritance, and fixture expectations.
Wave 5 owns detailed furniture/dressing catalogs, expression kits, socket allocation, and visual density;
Wave 10 owns how the renderer presents them. This prevents the current question from expanding into the
full dressing build.

##### College-dorm example

A twelve-room dormitory can share structure, doors, beds/desks, plumbing, and institutional rules while
carrying high sparse expression:

```text
shared: old college stone; two beds/desks per room; house colors at thresholds; communal washroom
operator curation: floor belongs to the astronomy house; pinboards and lens-safe shutters
current pressure: final examinations; one wing's warded heating is failing

room A: meticulous roommates; star charts; repaired telescope; quiet-study agreement
room B: one resident withdrew; half the room stripped; unopened letters remain
room C: loud study society; improvised soundproofing; contraband stimulant cache
room D: visiting Breach scholar; unfamiliar gravity anchors; neighbors resent the noise
```

The dorm remains one repeated family, but its rooms express people rather than only condition variants.

**Revised recommendation:** keep the correlated-family model, add the variation-authority profile, and
judge it against the small orthogonal corpus above. Use residential college as the primary human
countercase and a living habitat as the non-institutional sentinel. High expression materializes as
bounded signature layers, not exhaustive inventories.

**Open follow-up:** approve this expanded test scope and factored variation profile—particularly the
residential college countercase, living-habitat sentinel, and rule that semantic expression can be high
while runtime/render detail remains bounded to active signature slots?

#### 10.4.2 Final ruling - correlated repetition with plural stress cases

Adam confirms the expanded scope. Question 4 is resolved:

- repeated quantities arise from operational/ecological demand and compile as stable hierarchical
  assemblies rather than filler or unrelated room rolls;
- assemblies roll shared construction, function, support, access, state, and causal events before child
  variation;
- children vary sparsely through eligible position, capacity, occupancy, condition/history,
  person/network, discovery, independent local Spice, and inherited-root manifestation channels;
- editable dice retain authority while deterministic coverage, anti-repeat, and reserved-role techniques
  prevent accidental monotony or implausible streaks;
- variation authority is factored across construction standardization, operator curation, occupant
  expression, tenure/turnover, privacy/control, material access, occupancy individuality,
  history/condition, current pressure, and causal discovery/Spice;
- mundane prison cells and ordinary hotel rooms may remain nearly uniform; college dormitories,
  residential households, and boutique themes receive stronger occupant/operator expression;
- semantic expression materializes through bounded signature layers rather than exhaustive inventories;
- shared data is stored once, latent children remain sparse, and active-room/context/render budgets keep
  runtime cost tied to current play;
- Wave 2 uses a compact stress corpus: hamlet jail, city prison, residential college, ordinary-versus-
  boutique inn, and living habitat/cavern. Prison is no longer the universal design proxy.

#### 10.4.3 Future-question assignments seeded by question 4

| Inherited ruling | Future owner |
|---|---|
| Repeated units are correlated families with shared assembly truth and sparse typed child variation | Remaining **Wave 2** questions define quantity/distribution/Spice budgets; **Waves 3-5** realize assemblies, spaces, and dressing |
| Variation authority is factored rather than one global percentage | **Wave 5** owns expression kits, furniture/dressing channels, signatures, and density; purpose/occupant systems supply the semantic inputs |
| Hamlet jail, city prison, residential college, ordinary/boutique inn, and living habitat form the minimum orthogonal semantic corpus | Every later wave must exercise relevant fixtures; **Wave 12** turns them into regression, distribution, performance, and migration gates |
| High-expression rooms use bounded signature layers and local materialization rather than exhaustive inventories | **Waves 5, 10, and 12** own dressing, presentation, save growth, and active-slice performance |
| Living habitats vary through biological/ecological state rather than personal expression | Remaining **Wave 2** ecology writing and future creature/habitat systems own the content; realm expansion must preserve the distinction |

### 10.5 Question 5 - how should functional and spicy capacity be budgeted across scopes?

In plain English: after the operating model and repeat demand are known, how much room/opportunity is
reserved for required function, supporting ecology, discretionary spaces, local discoveries, secret
networks, and Spice—and at which scope does each budget live?

One universal "random-room percentage" is inadequate:

- in a four-room jail, twenty percent rounds ambiguously and can erase the likely added-space ruling;
- in a fifty-five-room prison, twenty percent may create eleven unrelated random rooms but still fail to
  coordinate one strong site secret;
- a natural cavern's variation lives partly in flows, pockets, ecology, strata, and routes rather than a
  count of purpose-free rooms;
- every room has a local discovery opportunity, but that does not mean every room consumes a major
  narrative or high-Spice budget;
- the Spice band distribution and the number/scope of eligible opportunities are independent controls.

Two simpler sole-authority models also fail:

- **fixed counts by headline size** are readable but make size a magic master variable and ignore
  purpose load, exploration scope, temporal depth, ecology, and narrative density;
- **fill obligations first, then use leftovers** makes variation disappear in demanding institutions
  and contradicts the locked rule that protected random/Spice capacity is bread and butter, not filler.

The recommended architecture uses **scope-specific protected budgets**.

##### 1. Operating-model demand establishes a minimum, not the whole site

Core/support obligations, repeated capacity, circulation, external-service manifestations, and legal
degradation establish the minimum semantic demand. The generator may combine or externalize legally,
but it cannot compress this demand dishonestly merely to make room for Spice.

Protected variation is then part of the site's required exploration scope—not whatever remains after
function. If the chosen envelope cannot legally hold both, the reconciliation ladder may enlarge the
ordinary scope, add a causal annex/pocket/child site, use embedded variation where valid, or reject the
profile as infeasible. It may not silently delete either side.

##### 2. Separate budgets by causal scope

```text
site scope
  root causal events, subordinate purposes, major secret networks, defining anomalies

zone/assembly scope
  occupation conflicts, shared transformations, repeated-family exceptions, resource failures

room scope
  discretionary rooms/functions, current-use twists, tactical/social/resource handles

child/inspection scope
  local notes, marks, caches, tells, objects, people, routines, practical discoveries
```

These budgets coordinate rather than stack blindly. A site-level escape history may reserve several
cell-level manifestations; those cells inherit one event and do not each spend a new major-secret roll.

##### 3. Preserve four distinct allocation channels

- **Operational channel:** core/support capabilities, repetitions, and distributed systems needed for a
  viable designed/current model.
- **Discretionary spatial channel:** added rooms, annexes, pockets, alternate functions, inherited
  spaces, subordinate domains, and other exploration surfaces not guaranteed by operation.
- **Embedded/local channel:** discoveries, people, objects, state, history, tactical handles, and
  expression inside otherwise ordinary rooms/children.
- **Coordinated site/zone channel:** multi-room secrets, histories, factions, resource crises, routes,
  Breaches, and major causal Spice whose manifestations span several spaces.

The smallest site retains embedded opportunity and the locked **clear-majority target** for at least one
added spatial variation. Larger exploration scopes increase both the expected number and possible size
of discretionary spaces while keeping a meaningful proportional share rather than merely adding one
token random room to a huge institution.

##### 4. Opportunity frequency and Spice intensity remain orthogonal

The site/profile determines how many opportunities exist and their scopes. Each eligible root/local
event then uses the honest table class and adopted band-first Spice distribution. A small site does not
dampen the Spice curve; a large site does not receive more Mythic roots simply because it has more cells.

Controls against saturation include:

- table-class ceilings;
- root-event/site/zone opportunity budgets;
- causal inheritance for manifestations;
- bounded Commitment-class opportunities;
- eligibility and context;
- coordinated chains rather than independent rerolls;
- mixed intensity, including concrete Grounded results for contrast.

##### 5. Use allocation curves and authored dice, not one hidden optimizer

Purpose-family/profile tables can expose human-readable quantities such as:

- minimum and rolled discretionary spatial opportunities;
- embedded opportunity cadence/coverage;
- zone/root-event eligibility and count curves;
- subordinate-complex chances and caps;
- scale/load/history/context modifiers;
- conversion/fallback rules when an ordinary dedicated space cannot fit.

The compiler normalizes these into budgets, reserves them before assignment, and provides a trace. Exact
numbers should be tuned through the orthogonal fixture corpus and seed/distribution reports rather than
locked from intuition now.

##### Example comparison

- **Hamlet jail:** viable custody/oversight/storage/external services; embedded discovery in every
  realized room; clear-majority target for one added spatial variation; occasional larger hidden domain;
  few site-level root opportunities but no downward Spice ceiling.
- **City prison:** full operational suites and repeated blocks; multiple discretionary spaces/annexes
  proportional to exploration scope; zone-level occupation/resource/history events; bounded coordinated
  secret networks; many local discoveries without fifty-five unrelated major secrets.
- **Residential college:** operating/teaching/residential services plus protected clubs, forgotten rooms,
  workshops, traditions, student spaces, inherited foundations, and high expression; site-level academic
  or magical pressures coordinate manifestations across dorms/classrooms.
- **Living habitat:** required ecological flows/niches plus protected unusual pockets, symbioses,
  mutations, prey remains, environmental transitions, and hidden routes; variation need not be a room.

**Recommendation:** replace a single random-room percentage with protected, scope-specific operational,
discretionary-spatial, embedded-local, and coordinated site/zone budgets. Reserve them before
realization, keep opportunity count separate from Spice intensity, and tune visible dice curves through
fixture/seed reports.

**Open decision:** should this multi-scope protected-budget model govern how much function, spatial
variation, local discovery, and coordinated Spice a site receives, with exact numeric curves deliberately
deferred to fixture-based writing and distribution tests?

#### 10.5.1 Ruling and follow-up - every budget is Spice-capable

Adam accepts the protected multi-scope budget model provided that Spice can roll **within** those
budgets. Spice is not confined to discretionary rooms or a separate anomaly pass. The remaining
follow-up is how each layer expresses it without flattening all tables into the same kind of weirdness or
stacking unrelated high-band events.

The governing distinction is:

> Budget/layer answers **where and what kind of truth may change**. Spice band answers **how far that
> eligible truth departs from ordinary expectation and how much consequence it can carry**.

Every channel therefore receives Spice-aware authoring, but each owns different nouns and consequences.

##### Operational budget - Spice changes how the place functions

Eligible expressions include:

- unusual provider, operator, procedure, staffing, schedule, doctrine, or access rule;
- magical/technological/biological production, storage, distribution, waste, renewal, or containment;
- strange dependency, substitute, resource ecology, service failure, or institutional bargain;
- a function whose ordinary local context changes the classification—a Breach-cell bank may be expected
  mage-colony infrastructure and Mythic in a hamlet jail.

Examples:

- a prison's locks open only after the jailer recites each prisoner's true charge;
- college heating comes from a small captive summer whose mood follows examinations;
- a hive's food distribution carries ancestral memory through shared fungus;
- a temple's purification font literally transfers confessed guilt into a sealed waste reliquary.

Spice may not silently erase the capability. A Strange kitchen still feeds people unless it is
canonically failing; a Mythic containment method still satisfies custody according to its stated law.
Its unusual method creates handles, dependencies, evidence, and failure consequences.

##### Discretionary spatial budget - Spice changes what extra space exists or how it connects

Eligible expressions include:

- hidden/forgotten room, annex, pocket, alternate route, vertical domain, inherited substrate;
- impossible adjacency, conditional room, moving boundary, living chamber, secret connection;
- subordinate purpose, forgotten expansion, contested pocket, Breach-linked child site;
- ordinary added room containing a spicy current use, object, claimant, or history.

Examples range from the sheriff's bathroom with a demonic bar of soap, through a college clubroom erased
from official plans, to an alchemist's necromancy laboratory or a prison wing whose cells open into
different realms.

##### Embedded/local budget - Spice changes the immediate person, object, tell, state, or opportunity

Eligible expressions include:

- note, mark, possession, tool, cache, consumable, contraband, evidence, refusal, routine, relationship;
- sensory wrongness, small mechanism, tactical affordance, local resource, occupant condition;
- signature expression in a dorm/household, biological sign in a habitat, practical anomaly;
- clue or manifestation tied to a larger root.

Most local tables should be Spark/Fork-shaped and may stop below Mythic. Their hottest rows can still be
powerful and memorable. A local result becomes Commitment-class only through an explicitly licensed
table/result that creates or promotes a root event rather than smuggling campaign-scale canon through a
micro-detail slot.

Examples:

- a prisoner's scratched tally includes days that have not happened;
- a dorm-room star chart changes to show whoever sleeps beneath it;
- shed chitin bears a route map of tunnels the party has not entered;
- hidden healing supplies, a child's note, or the demonic soap create practical or narrative handles.

##### Coordinated site/zone budget - Spice changes shared causes, patterns, systems, and laws

Eligible expressions include:

- root history, active front, resource crisis, faction relationship, site-wide secret, repeated law;
- coordinated transformation, multi-room ritual, occupation-zone behavior, escalation clock;
- Breach/realm connection, impossible physics, institutional curse, sentient system;
- revelations and payoffs whose evidence/manifests reserve homes in several rooms or children.

Examples:

- the prison's inmates share one recurring dream that maps an outer realm;
- a college house is unknowingly educating a star-bound intelligence through its students' work;
- the hive treats injuries to any brood chamber as memories carried to every defender;
- a mine's drainage network is slowly redirecting water toward a buried claimant.

##### Four causal roles prevent stacking

Every spicy result should declare one causal role:

1. **Root:** creates a new scoped cause/event/law and consumes an eligible root opportunity.
2. **Manifestation:** expresses an existing root through space, operation, person, object, or evidence;
   inherits its band/cause and consumes manifestation capacity, not another root roll.
3. **Accent:** an independent bounded local variation whose own table class limits consequence.
4. **Escalation:** changes an existing root's state through a recorded trigger, clock, action, or event.

This lets Spice run through every layer without independent multiplication. One Mythic prison-root may
license a portal-control procedure, impossible cell adjacency, prisoners' matching drawings, and a
soap-shaped clue. Those are coordinated manifestations of one event, not four Mythic roots.

##### Mechanical roll sequence

```text
1. allocate opportunity at a scope/channel
2. determine causal role: new root, manifestation, accent, or escalation
3. select the owning table/recipe and enforce its honest table-class ceiling
4. roll Spice band using the adopted context/tier distribution among supported bands
5. roll an expression form/row appropriate to the channel and context
6. bind or create causal provenance
7. reserve required operational/spatial/local manifestations and player handles
8. validate capability, capacity, compatibility, saturation, and persistence
```

Context can reclassify the same expression and change weights/eligibility. It cannot make a table exceed
its honest authority. Opportunity frequency remains owned by scope budgets; band frequency remains owned
by Spice distributions; expression remains owned by layer-specific tables.

##### Stress-corpus comparison

- **Prison:** operational Spice alters custody/control/resource methods; spatial Spice alters
  cells/annexes/routes; local Spice appears in inmates, guards, evidence, contraband, fixtures; coordinated
  Spice owns institutional histories, zone conflicts, and Breach/secret networks.
- **Residential college:** operational Spice alters teaching, grading, housing, heat, libraries, or
  discipline; spatial Spice creates clubrooms/labs/conditional halls; local Spice rides student work,
  expression, relationships, and experiments; coordinated Spice owns houses, academic fronts, and shared
  magical laws.
- **Boutique inn:** operator curation can itself be Textured/Strange; local guests add accents; a themed
  suite is not automatically a new root; a coordinated curse or sentient hospitality system is.
- **Living habitat:** operational/ecological Spice changes feeding, renewal, waste, brood, or defense;
  spatial Spice changes niches/tunnels; local Spice changes organisms/signs/resources; coordinated Spice
  owns colony memory, realm law, or ecosystem transformation.

**Recommendation:** make all four allocation channels Spice-capable through their own expression
grammars and table classes. Require every spicy result to be a root, manifestation, accent, or escalation.
This preserves abundant layered weirdness while keeping causality, authority, and high-band counts
legible.

**Open follow-up:** should Spice expression follow this per-layer grammar and four-role causal model,
with operational Spice explicitly allowed and local high-band results required to promote/bind a scoped
root rather than appearing as untracked micro-table explosions?

#### 10.5.2 Final ruling - mechanized causal promotion across every allocation layer

Adam accepts the per-layer grammar and four causal roles. This connection was previously left to the
AI DM: the DM might notice that a spicy object, procedure, room, and NPC fact belonged together and
develop them into a coherent story. Genesis should mechanize that opportunity so coherence and eventual
payoff do not depend on prompt memory or improvisational luck.

Question 5 is resolved:

- operational, discretionary-spatial, embedded-local, and coordinated site/zone allocations are all
  Spice-capable;
- each layer uses its own expression grammar and honest table classes rather than drawing every kind of
  variation from one interchangeable anomaly table;
- every spicy result records a causal role: root, manifestation, accent, or escalation;
- every result records band, scope, owning layer/table, provenance, affected records, player handles,
  persistence, and any required manifestations or future service obligation;
- a result whose claims exceed its current slot's authority is not left as an orphan fact. The planner
  binds it to a compatible existing root or promotes it into a new explicitly scoped root record;
- promotion honors the rolled outcome. It may consume a protected root opportunity or create a tracked
  overflow root that reduces later independent-root pressure; it may not silently reroll, erase, or
  downgrade an already licensed result merely because an earlier allocation filled the ordinary curve;
- band and scope remain orthogonal. A Mythic object can remain physically local, but it still receives a
  tracked causal root if its implications, persistence, or promised payoff require one;
- manifestations inherit their root's causal identity instead of multiplying the site's independent
  high-band count. Saturation checks govern simultaneous unrelated roots, not the number of coherent
  clues, symptoms, rooms, or procedures through which one root can become legible;
- the DM receives an already-linked strategic/story mechanism with legal homes, reveal handles, and
  escalation opportunities. The DM still decides how and when to play or develop movable material, but
  is no longer solely responsible for inventing causal connections or remembering orphaned promises.

A compiler trace for the demonic-soap example could therefore read:

```text
embedded/local opportunity -> Mythic result: soap houses a speaking infernal claimant
authority check -> persistent agency and future consequence exceed disposable accent authority
compatible root search -> none
promotion -> local/site root `infernal-claimant-under-custody`
reserved manifestations -> sheriff's cleansing routine; heatless washroom; scratched inmate warning
DM card -> claimant may bargain, escape, reveal provenance, or alter custody through recorded events
```

The same mechanism can instead bind a scratched future-date tally, impossible cell adjacency, and
portal-control procedure to an already existing outer-realm prison root. The engine supplies causal
unity; the DM supplies performance, timing, adjudication, and adaptive development.

#### 10.5.3 Future-question assignments seeded by question 5

| Inherited ruling | Future owner |
|---|---|
| Operational, discretionary-spatial, embedded-local, and coordinated site/zone allocations have separate protected budgets and Spice-aware expression grammars | Remaining **Wave 2** questions define authoring inventories and distributions; **Waves 3-5** realize their spatial, portal, discovery, and dressing expressions |
| Every spicy result is a root, manifestation, accent, or escalation with explicit provenance and scope | **Wave 9** owns strategic/story-card scheduling and DM presentation; **Wave 12** owns the persistent causal schema, replay, migration, and orphan-promise diagnostics |
| Out-of-authority local results bind or promote without silently losing the rolled outcome | Remaining **Wave 2** table design owns eligibility and table-class declarations; **Wave 12** owns compiler invariants and overflow-root/saturation tests |
| One root may license many coherent manifestations without those manifestations counting as independent high-band events | **Waves 4-5** own clue/secret/dressing reservation; **Wave 9** owns reveal and escalation cadence |
| Exact allocation and Spice curves remain fixture-tuned rather than intuition-locked | Remaining **Wave 2** writing and distribution work uses the five-site stress corpus; **Wave 12** owns seeded statistical acceptance gates |


<!-- END VERBATIM MIGRATION: original lines 3406-5246 -->
