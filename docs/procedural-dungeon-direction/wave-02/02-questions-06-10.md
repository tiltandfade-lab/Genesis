---
type: design-study
status: CLOSED
wave: 2
part: 2
legacy_sections: "10.6-10.10"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 2 — Questions 6-10

<!-- BEGIN VERBATIM MIGRATION: original lines 5247-7269 -->

### 10.6 Question 6 - how should operational demand become exact quantities?

In plain English: what makes a jail receive three cells rather than one or fourteen, a college receive
six residential houses rather than a flat list of bedrooms, or a hive receive four brood clusters
rather than one chamber per creature? The engine needs exact stable spaces before play, but it should
not derive them from a single crude size label or simulate every unseen resident.

This is where structural scope, operational load, spatial envelope, occupancy/accommodation, and
repeated assemblies must meet. Three broad mechanisms are available:

1. **Fixed size packages** can say that a small jail always has two cells and a large prison always has
   forty. They are readable and cheap, but become recognizable templates, handle current load poorly,
   and multiply across cultures, doctrines, realms, and conditions.
2. **Exact headcount arithmetic** can derive one bed per resident, one privy per fixed number, and one
   guard per shift. This supplies causal quantities but creates false precision, sterile uniformity,
   unnecessary population simulation, and huge graphs when the actual realization is communal,
   scheduled, magical, biological, or external.
3. **Demand, coverage, and assembly curves** can preserve authored dice while keeping the quantities
   causal. This is the recommended foundation.

#### Recommended quantity pipeline

```text
purpose/context/history
  -> operational-load profile (normal, current, peak, throughput, duration)
  -> capability-specific coverage standard and doctrine
  -> rolled capacity, redundancy, privacy, segregation, and service ratios
  -> assembly partition and realization family
  -> exact canonical parent/child quantities and stable ids
  -> reconcile capacity, envelope, and current state
```

The stages remain distinct controls:

- **Demand** asks how many people, items, rituals, carts, bodies, worshippers, offspring, meals, or units
  the function normally and currently serves.
- **Coverage** asks how much capacity is required, including reserve, redundancy, privacy, security,
  segregation, turnover, shift sharing, peak load, and accepted failure risk.
- **Partition** asks whether the result becomes individual rooms, communal rooms, wings, houses,
  clustered niches, scheduled/shared facilities, distributed systems, or external capacity.
- **Materialization** asks how much detail is expanded now. It never changes the already canonical
  counts, child identities, connections, or capacity.

Purpose families should author human-readable quantity rollers and ratios, not hide everything in an
optimizer. A jail profile might expose `1d4 cells`, an occupancy/crowding roll, segregation eligibility,
and external-transfer reliability. A residence profile might roll single/double/communal mixes and
house sizes. A habitat profile might roll brood-cluster capacity and renewal cadence. The compiler turns
those rolls into exact stable records and emits the arithmetic/provenance in its trace.

#### Concrete comparisons

- **Hamlet jail:** the settlement and enforcement load imply a handful of ordinary prisoners plus an
  occasional surge. It may roll three cells, one of them double-capacity, with food externalized to the
  tavern. If five prisoners are currently held, the jail is honestly overcrowded; the engine does not
  secretly add a fourth cell or delete a prisoner. That mismatch can produce guard procedure, conflict,
  transfer pressure, or a discretionary-space adaptation.
- **City prison:** a population/justice profile creates a much larger custody load, then doctrine rolls
  security classes, isolation, dormitory versus cell ratios, reserve, staffing coverage, and service
  standards. The result partitions into cellblock assemblies and specialist wings. Each cell remains a
  stable child space, but the planner and save can store shared block truth once and materialize only the
  relevant slice.
- **Residential college:** enrollment, residential fraction, tenure, wealth, and house doctrine produce
  a bed demand; single/double/communal ratios and shared-service coverage partition it into several
  houses and floors. A current enrollment decline leaves meaningful vacancies or repurposed rooms
  rather than causing architecture to disappear.
- **Boutique inn:** market demand constrains viable capacity, but operator curation and wealth may favor
  fewer large individually themed suites over many standardized rooms. An ordinary inn at the same load
  might make the opposite trade.
- **Living habitat:** ecological throughput produces brood, feeding, waste, renewal, and defense
  capacity. Hundreds of organisms can remain cohorts served by several stable chamber assemblies; the
  engine does not create one room or heavyweight record per larva.

#### Capacity mismatch is state, not generator failure

Designed capacity and current demand should be allowed to diverge when history or present pressure
causes it. That gap is often the most interesting truth in the site:

- demand above capacity -> crowding, queues, rationing, unsafe substitution, shifts, annexes, external
  transfers, or an explicit failing capability;
- demand below capacity -> vacancy, mothballing, repurposing, territorial occupation, decay, or protected
  discretionary use;
- spatial envelope below legitimate program -> combine, schedule, externalize, build vertically, use an
  annex/child site, record a degraded function, or revise the still-unobserved envelope through the
  Wave 1 reconciliation ladder;
- impossible residual mismatch -> a plain-language diagnostic, never silent truncation or overlap.

This does not authorize the engine to manufacture crisis from bad arithmetic. The healthy-by-construction
and crisis-provenance laws from Question 2 still apply. Ordinary capacity ratios should usually produce
functional places; overcrowding, vacancy, and failure arise from licensed history/current-state rolls or
real world events and come with mitigation/recovery possibilities.

**Recommendation:** use authored demand, coverage, and assembly curves to produce exact canonical
quantities. Treat size bands as readable modifiers and table selectors, not sole causes. Keep latent
population/ecology in cohorts where appropriate, but make spatial children, capacities, and actionable
occupants stable and exact. Preserve capacity mismatch as causal state rather than automatically resizing
the site to erase it.

**Open decision:** should Wave 2 adopt this demand -> coverage -> assembly -> exact-count pipeline, with
designed capacity and current load recorded separately so licensed overcrowding, vacancy, communal use,
shifts, and external service remain possible?

#### 10.6.1 Follow-up - rolls choose the causal inputs; arithmetic preserves their relationships

Adam likes the model and asks whether demand, coverage, assembly, capacity, and current-load values are
calculated by rolls. **Yes, primarily—but not as independent rolls for every final number.** Genesis
should expose the meaningful choices as editable human-readable rollers, then use transparent arithmetic
and constraints to derive dependent quantities.

The recommended authority order is:

```text
established canon and world facts
  -> context selects eligible purpose/profile tables
  -> authored dice roll uncertain demand, doctrine, coverage, and partition inputs
  -> transparent formulas derive dependent counts and capacities
  -> bounded reconciliation resolves envelope and compatibility
  -> exact result + every roll/formula/provenance become persistent canon
```

##### 1. Never reroll a known fact

If lore or world state already establishes a college enrollment, prison population, active company,
number of royal tombs, or known clutch, that value enters as an input. The site generator does not roll
a contradictory replacement. If the value is unknown, it rolls from the narrowest eligible contextual
table.

Context chooses or weights the roller; it does not replace dice with a black-box optimizer. A frontier
settlement, regional city, mage colony, wartime occupation, declining college, and recovering hive use
different eligible rows/modifiers because they imply different demand and doctrine.

##### 2. Roll the independent design choices

Purpose-family profiles expose authorable tables for values such as:

- ordinary and peak operational-load bands;
- service doctrine: austere, ordinary, generous, redundant, segregated, ceremonial, emergency, and
  purpose-specific equivalents;
- capacity reserve or tolerated utilization;
- privacy/communal mix, security classes, turnover, shift-sharing, and redundancy;
- assembly size and partition: cells per block, students per house, beds per room, brood per chamber,
  shelves per bay, workstations per shop, niches per burial cluster;
- external-service reliance and reliability;
- current occupancy/throughput state when it is not already established;
- licensed history or pressure that can create a mismatch.

These may be ordinary dice expressions, range tables, weighted d100 rows, or dice-plus-modifier tables in
Markdown. The compiler can normalize them for speed, but the authoring face remains readable and
modifiable.

##### 3. Derive dependent counts rather than rerolling them independently

Once the independent rolls are known, ordinary arithmetic preserves causality. Examples include:

```text
required beds = ceil(design load x reserve factor)
ordinary shared cells = ceil(non-isolation custody capacity / beds per shared cell)
residential beds = ceil(enrollment x residential fraction)
houses = ceil(residential beds / rolled house capacity)
brood chambers = ceil(brood capacity demand / rolled chamber capacity)
service stations = ceil(peak throughput / rolled station throughput)
```

Exact formulas are purpose-specific authoring and later tuning, not universal ratios imposed on every
realm. A fungal feeding bed, conjured meal ward, tavern delivery, prison kitchen, and communal cookfire
can satisfy related supply demand through different quantities and cadence.

Independent final-number rolls would allow contradictions such as rolling 180 prisoners, four total
beds, twelve cellblocks, and no overcrowding state. The hybrid keeps dice in charge of uncertainty and
math in charge of implications.

##### Hamlet-jail worked example

Suppose established context selects the `hamlet_jail` fixture and no lore fixes its capacity:

```text
ordinary concurrent custody roll: 1d4 - 1 -> 2 prisoners
surge reserve roll:                1d3     -> 2 additional places
custody-doctrine roll:             d6 = 5  -> one isolation-capable cell; others may hold two
external-food roll:                tavern contract, ordinary reliability

derived design demand:             4 places
derived realization:               1 isolation cell + 2 shared cells = 3 cells / 5 maximum places

ordinary current-load roll:        1d3     -> 2 current prisoners
current condition:                 functional, below capacity
```

If an established bandit roundup instead supplies six current prisoners, that canon overrides the
ordinary current-load roll. The three-cell design persists and the one-person excess creates a licensed
overcrowding state, response options, and evidence. The building does not resize itself after the fact.

##### Large-site and living-site examples

- A city prison can roll a custody-load band, reserve standard, custody mix, cell/dorm ratio, block
  capacity, and specialist coverage. Arithmetic derives exact cells and blocks; one roll does not occur
  per cell. Shared assembly truth keeps the result compact.
- A college can use known or rolled enrollment, then roll residential fraction, room mix, house size,
  and shared-service coverage. Arithmetic derives stable beds, rooms, houses, washrooms, and commons.
- A hive can roll colony/load tier, lifecycle pressure, brood-cluster capacity, renewal cadence, and
  redundancy. Arithmetic derives chambers and flow capacity while individual larvae remain cohorts
  unless they become actionable.

##### 4. Reconciliation is visible and bounded

After calculation, the planner validates the exact demand against envelope, topology requirements, and
legal realization families. It may use the already accepted reconciliation ladder—combine, share,
schedule, externalize, partition, add an annex/child domain, preserve a licensed degraded state, or
revise an unobserved envelope—but it records every change. It may not repeatedly reroll until it gets a
convenient answer or silently truncate the demand.

##### 5. Rolls happen once and remain inspectable

The engine may auto-roll this plumbing instantly during generation; player-facing presentation can be
reserved for rolls that create a meaningful discovery or choice. Regardless of who sees the animation,
the workbench and provenance trace should show the original dice expression, result, modifiers, formula,
derived value, reconciliation, and final stored canon. Modders continue editing rollers; the compiler
does not become the only comprehensible authoring surface.

**Recommendation:** use a hybrid **roll inputs, derive consequences** model. Dice determine uncertain
load, doctrine, ratios, mixes, and assembly sizes; simple transparent formulas calculate the quantities
that logically follow. Existing canon always outranks a roll, and every calculation is persisted and
inspectable.

**Open follow-up:** should this roll-plus-arithmetic model govern quantity generation, with independent
inputs exposed as editable rollers, derived counts calculated transparently, and no hidden rerolling to
force a fit?

#### 10.6.2 Follow-up - why the earlier frontier-jail label was insufficient

Adam asks where the earlier `frontier_jail` label in the worked example came from. It should **not** come
from the jail independently rolling a broad flavor label after its purpose is known. It should be the
readable shorthand for a factored parent-context and service-role profile.

The current repository cannot yet make that determination robustly:

- world nodes still carry a free-text type rather than a complete place taxonomy;
- settlement fabric has the useful existing `PLACE_TIERS` hamlet/village/town/city scale;
- region identity already provides economic and thematic bias vectors;
- `frontier` is overloaded across the current game as a default realm/skin, a rumored prep-map frontier,
  and the weird-west register. None of those facts alone means that a particular jail is a small local
  frontier lockup.

The redesign must not equate `realm: frontier` with `institutional profile: small local jail`. A mage
colony can be geographically frontier while possessing sophisticated custody infrastructure; a large
city can contain a tiny district watch lockup; a frontier railhead can host a regional prison much
larger than its resident population suggests.

##### Recommended authority cascade

```text
explicit canon / authored premise
  -> containing region, settlement, district, fort, route, or organization
  -> settlement scale and development/logistics context
  -> site's service catchment and institutional role
  -> operator, doctrine, wealth, technology/magic norm, and history
  -> contextual rolls fill only facts still unknown
  -> purpose profile receives the resulting modifier stack
```

The important inputs are orthogonal rather than one master `frontier` enum:

- **containing-place scale/population:** hamlet, village, town, city, metropolis, or an extensible
  continuous/banded equivalent;
- **development/settlement role:** camp, outpost, frontier/boom settlement, established center,
  declining settlement, occupied settlement, and other authored states;
- **service catchment:** one building, neighborhood, settlement, district, route, fort, region, nation,
  realm network, or another explicit constituency;
- **institutional tier/centrality:** local holding facility, district facility, regional institution,
  central/specialist institution, satellite/annex, and purpose-family equivalents;
- **connectivity and supply:** remoteness, route quality, external-provider access, reliability, buffers;
- **operator and administrative capacity:** sheriff, watch, military, temple, guild, crown, private
  contractor, magical order, occupying faction, or another operator;
- **doctrine and norms:** detention practice, privacy, security, punishment, rehabilitation, magical or
  technological expectation;
- **history/current pressure:** original role, later growth/decline, war, migration, catastrophe,
  occupation, or a recent event that changes load without rewriting the building's origin.

The earlier `frontier jail` wording was intended as a fixture/display label for a common conjunction such
as:

```text
purpose: jail / local custody
containing place: small frontier or boom settlement
service catchment: local settlement and nearby route
institutional tier: local lockup
administrative complexity: low
external-service reliance: high
```

The quantity and realization planner consumes the underlying facts, not the label. The label can select
a strong authorable recipe, test fixture, or default table bundle, but it does not become a sealed
template.

##### Worked example

Suppose world/settlement generation establishes:

```text
settlement scale: small town
settlement role: mining boomtown on the governed edge
route access: one seasonal road
administrative centrality: local
magic norm: uncommon
```

The town then generates or reveals a `jail` site. Its service-role roll is context-weighted toward a
local sheriff's lockup, so the jail inherits the frontier/local modifier stack and receives the small
load/coverage rollers described above.

That result is probable, not mandatory. The same boomtown may roll or inherit `regional circuit seat`
because it is the only rail/portal hub for a large catchment. Its jail then receives regional throughput,
records, transfer, staffing, and custody coverage despite the settlement's modest resident population.
Conversely, a city watch house may contain only a two-cell satellite lockup because the central prison
exists elsewhere.

A mage colony keeps local scale but raises magical/technological norms and changes eligible custody
realizations. Portal cells become more plausible without the system pretending the jail serves a city's
population. This is the already accepted context cascade applied quantitatively.

##### Standalone sites

If a jail is generated without an established settlement, the planner must first attach it to a minimal
context anchor—fort, road post, mining camp, district, isolated institution, ruined settlement, or other
service constituency. The site may roll that missing parent context from readable tables. It may not
derive `hamlet jail` merely from a frontier realm/development tag without the population, operator, and
catchment facts that make the hamlet-scale description true.

##### Scope boundary

Wave 2 does not need to finish the future settlement/region generator. It must define the required
context interface and fallback rollers so dungeon quantities are not based on a nonexistent fact. The
future bounded-place/settlement system owns full generation of those parent profiles, while compatibility
adapters may initially translate the existing `PLACE_TIERS`, region vector, realm, node, and authored
premise into the new fields.

**Recommendation:** treat settlement/site labels and `city prison` as human-readable composite fixtures,
never primitive types. Parent context and service catchment establish the facts; contextual dice fill
gaps; the jail's obligation/quantity tables consume the resulting modifier stack. This avoids both
isolated nonsense rolls and a Cartesian catalog of jail templates.

**Open follow-up:** should site profiles inherit this factored parent-context/service-role cascade, with
the current overloaded `frontier` realm/prep terms explicitly forbidden from deciding institutional
scale by themselves?

#### 10.6.3 Ruling and follow-up - population is the ordinary demand gate

Adam accepts the parent-context/service-role cascade and corrects the example's naming. The small-site
fixture is now **hamlet jail**, not frontier jail. Every earlier use in this running direction has been
updated. `Frontier` remains a realm/geographic/development descriptor where appropriate, but it is not a
population category or institutional-capacity tier.

This exposes a larger upstream requirement: every inhabited settlement or other population-bearing
place needs one definite, persistent **population roll/profile**. It need not claim an exact census, but
it must be concrete enough to gate downstream demand for jails, inns, markets, temples, sanitation,
schools, workshops, processing sites, and other purposeful places.

This reinforces Adam's already locked 2026-07-09 ruling that settlement population estimates should
drive urban/rural presentation, `nodeEnvBand`, place-tier stock, and town-map composition. The dungeon
redesign adds institutional demand and capacity to the same canonical population input; it must not
create a parallel dungeon-only settlement scale.

##### Recommended population record

A single exact inhabitant count would imply a census the engine does not simulate and would fluctuate
too sharply at service thresholds. A bare label such as `hamlet` is too vague for capacity arithmetic.
The recommended middle is a stable rolled **estimate plus credible range and band**:

```text
populationProfile:
  band: hamlet
  estimate: about 180
  credibleRange: 140-230
  residentPopulation: about 180
  routineTransientPopulation: 10-30
  seasonalOrEventPopulation: none
  currentPressure: ordinary
  provenance: rolled from regional density + settlement role
  confidence: estimated
```

The numbers above illustrate shape, not locked bands. Wave 2 must author and test the actual
isolated/camp, hamlet, village, town, city, great-city/metropolis or other needed bands and dice. An
explicit premise such as “a hamlet” selects the eligible population band; otherwise regional density,
settlement role, access, terrain, history, realm conditions, and authored settlement-frequency dice
choose it. A band-specific roller then creates the stable estimate/range.

Population stays aggregate. Genesis does not mint 180 NPC records to justify a hamlet of about 180
people. Cohorts, households, role coverage, and salient individuals represent it until play makes a
specific person actionable.

##### Population strongly gates ordinary capacity, but purpose declares its demand driver

Resident population should completely or nearly completely gate the **ordinary local-service envelope**.
A hamlet should not casually roll a city-sized local jail, bathhouse, school, market, or water system.
However, not every purpose serves residents directly. Each purpose profile must name its primary demand
driver:

- **resident/household demand:** wells, ordinary local worship, household services, neighborhood shops;
- **justice/service catchment:** jail, courthouse, records office, fire/watch coverage;
- **traveler/route throughput:** inn, stable, customs post, caravan yard, port warehouse;
- **regional constituency:** college, cathedral, specialist hospital, central prison, pilgrimage site;
- **production/input throughput:** mine, mill, slaughterhouse, refinery, shipyard, granary;
- **strategic mandate:** fort, arsenal, signal station, realm gate, disaster reserve;
- **institutional population:** monastery, barracks, prison, boarding school, hospital;
- **ecological load:** hive, den, spawning ground, fungal network, migratory refuge.

Population remains the baseline gravitational constraint, while catchment and throughput explain legal
departures. A city district can support a small satellite lockup because its site role is local holding;
a hamlet can support a large inn at a major caravan crossing because travelers, not residents, are the
primary demand base.

##### Ordinary envelope and exceptional mismatch

For each purpose, the relevant demand base plus doctrine/context produces an ordinary capacity envelope:

```text
population/catchment/throughput facts
  -> purpose-specific demand driver
  -> ordinary capacity envelope
  -> rolled capacity within that envelope
  -> compare against designed and current realized capacity
```

Most generation should stay inside that envelope. A result outside it is not merely “rare” and is not
silently accepted. It creates a **capacity-contradiction obligation** that must resolve through a causal
bridge such as:

- nonlocal catchment, export market, pilgrimage, route traffic, or strategic mandate;
- a much larger historical population, boom, war, occupation, or later decline;
- planned expansion, failed megaproject, subsidy, vanity, corruption, or speculative construction;
- hidden population, hidden resource/input, covert consumer, or concealed institution;
- magical/technological production, storage, transport, or Breach-linked market;
- explicit current failure, abandonment, partial operation, or repurposing.

The bridge may be Grounded, Textured, Strange, Volatile, or Mythic. A former regional slaughterhouse in
a declining hamlet is grounded history; a subterranean kobold-breeding operation is a much hotter hidden
input. Scale mismatch creates an opportunity for Spice but does not automatically require supernatural
content.

##### Kobold-sausage example - absence becomes evidence

A hamlet's resident population and surrounding ranch profile cannot license the rolled meat processor's
capacity. The compiler must not shrug or reroll the building smaller. It records:

```text
observed plant capacity: regional
ordinary local meat input: insufficient
ordinary local consumers: insufficient
capacity contradiction: source + labor + waste + distribution unexplained
promoted root: concealed kobold-breeding and regional sausage operation
required manifestations: hidden pens, feed flow, workers/complicity, waste route,
                        packaging/records, outbound buyers or caravan route
player handles: missing ranch supply, night deliveries, unusual bones, payroll discrepancy,
                branded sausage distributed well beyond the hamlet
```

The juicy premise is not left as a clever sentence for the DM to remember. The same causal-promotion
mechanism accepted in Question 5 creates the root and reserves enough operational, spatial, local, and
network manifestations for investigation and payoff. The missing ranches are mechanically meaningful
negative evidence.

The inverse also matters. A settlement whose population exceeds an ordinary service's capacity must
explain how the need is met or why it is failing: external/informal providers, rationing, queues,
scheduled sharing, exclusion, recent growth, disaster, corruption, or a licensed systemic shortage.
Healthy-by-construction still prevents unexplained universal misery.

##### Recommendation

Adopt one canonical population profile for every inhabited settlement/population-bearing place. Store a
stable estimate, credible range, band, provenance, and relevant transient/seasonal overlays rather than
an exact census. Purpose profiles declare which population, catchment, throughput, or ecological measure
drives their demand. Population tightly gates ordinary local capacity; any material over- or under-scale
result must acquire a causal bridge, dependency flows, manifestations, and player handles rather than
surviving as unexplained generator noise.

**Open follow-up:** should population be represented by this stable **band + estimate + credible range**
profile—with transient/seasonal overlays kept separate—and should material service-capacity mismatches
automatically become tracked causal obligations exactly as in the kobold-sausage example?

#### 10.6.4 Ruling and follow-up - permeable envelopes and latent regional contracts

Adam accepts the stable population band + estimate + credible range, with transient and seasonal
population rolled separately. He corrects the capacity language: results outside the ordinary envelope
are often the interesting story generators, so the envelope must not become a hard exclusion wall. The
design problem is controlling the rate and coherence of **slippage**, not eliminating it.

The corrected law is:

> The ordinary capacity envelope is a probability basin and causal alarm, not a blacklist. Results may
> slip beyond it at an authored rate. What may never slip through is an unexplained contradiction.

This supersedes the “hard gate” phrasing in section 10.6.3 while preserving its causal intent.
Population strongly predicts ordinary local capacity; it does not veto exceptional capacity.

##### Two kinds of apparent mismatch

The planner must distinguish:

1. **Known extended demand.** A site's local population looks too small, but an already established
   route, regional catchment, pilgrimage, export market, strategic mandate, historical population, or
   institutional constituency explains the scale. The purpose-specific envelope expands before the
   capacity roll. This is coherent world structure, not necessarily a secret or Spice root.
2. **Unexplained slippage.** Capacity rolls materially outside every established demand driver. The
   result is admitted, then creates the capacity-contradiction obligation/root described above. The
   causal bridge may be mundane, historical, criminal, magical, ecological, or realm-scale.

Leilon's maritime warehouses, inns, docks, chandlers, customs functions, and trade-facing services need
not be treated as anomalies merely because its resident population is small. Its halfway-point role and
trade with much larger neighboring cities enlarge the relevant throughput and transient-demand
envelopes. A regional-scale meat processor with no ranches, imports, export route, known history, or
large consumers remains unexplained and therefore becomes a story generator.

##### Slippage should be rolled deliberately

Do not rely on accidental arithmetic tails. Each purpose/settlement-role pairing should author a
capacity-relation table or modifier stack such as:

```text
compressed / underprovided
ordinary within-envelope
expanded but locally plausible
exceptional mismatch requiring a causal bridge
```

The exact weights remain a Wave 2 writing/distribution decision. They should vary by purpose and
context:

- wells and ordinary household services remain tightly population-coupled;
- inns, markets, docks, warehouses, courts, colleges, prisons, temples, and hospitals more readily
  inherit route/catchment demand;
- mines, processors, granaries, shipyards, and other production sites key strongly off inputs and export
  networks rather than resident consumers;
- ancient, declining, occupied, post-catastrophe, speculative, subsidized, magical, and Breach-linked
  places have wider capacity variance;
- settlement-level deviation/root budgets prevent every independent site from rolling an unrelated
  major mismatch, while frequent smaller expansions, deficits, and peculiarities remain welcome.

The target is a spicy world with meaningful contrast: most individual capacity relationships are
legible, settlements receive recurring opportunities for notable deviation, and major unexplained
mismatches are common enough to drive adventures without turning every building into an unrelated
conspiracy. Exact incidence must be tuned through seeded settlement/site corpora and reported as visible
distributions rather than chosen as a magic percentage now.

##### Unrolled settlements still exert bounded influence

“Not yet rolled” must mean **unmaterialized detail**, not nonexistent world. A generated settlement can
depend on a neighbor without forcing that neighbor's streets, NPCs, shops, dungeons, and full simulation
to be generated immediately.

The regional graph needs three degrees of existence:

1. **Canonical anchor.** Lore or the campaign premise already establishes a place's name, relative
   location, broad scale, role, or relationship. Those facts are hard inputs even if nothing else about
   the place has been generated.
2. **Relational stub.** A generated place requires an external counterparty not yet detailed. Genesis
   stores only the minimum typed constraints: `larger city to the north`, `regional grain market`,
   `pilgrimage center`, `naval supplier`, or a named canonical place when available.
3. **Aggregate outside network.** The relationship only requires an external market/provider at present.
   The region can hold that aggregate influence until play or generation has reason to resolve it into
   one or more concrete nodes.

This extends Genesis's existing soft-canon and lock-on-contact direction, but requires finer hardness.
Once a hard/generated Leilon depends on trade with Waterdeep, the minimal facts “Waterdeep is a much
larger trade partner in this direction” and the connecting trade edge cannot be recycled merely because
Waterdeep itself is unvisited. The **relationship constraint is hard**; Waterdeep's unpromised internal
details remain latent or soft.

##### Typed regional relationship edge

A small durable edge can carry the useful truth:

```text
relationship: trade corridor / halfway port
counterparties: Leilon <-> Waterdeep; Leilon <-> Neverwinter
mode: coastal shipping + road
volume band: regionally important
directional flows: food, manufactures, passengers, mail, marine goods, rumors
travel friction: distance + weather + route safety
reliability/seasonality: rolled or canon-established
dependency asymmetry: Leilon strongly dependent; large cities weakly dependent
provenance/hardness: campaign lore / locked relational constraint
unresolved promises: exact merchants, docks, guild agents, and shipments remain latent
```

The edge is not a continuously simulated caravan manifest. It is an event-driven dependency and content
source. It can answer which service capacities are justified, what shortages follow a blockade, which
outside factions care, and what kinds of news or people plausibly arrive.

##### Leilon example

Using Adam's campaign description, Leilon's eventual population profile might establish a small seaside
town with modest resident population, then separately roll or inherit substantial transient and marine
throughput because it sits between Waterdeep and Neverwinter. Purpose systems consume different slices:

- housing, wells, ordinary neighborhood services -> resident estimate/range;
- inns, stables, taverns, temporary holding, markets -> residents + routine transients + route traffic;
- docks, warehouses, chandlers, customs, ship repair -> marine throughput and trade edges;
- jail/watch -> resident justice demand + travelers + route risk + external transfer arrangements;
- elite goods and specialist services -> partner-city market access and delivery reliability;
- NPC origins, accents, fashions, rumors, factions, prices, shortages, and adventure hooks -> weighted
  influence from both trade partners without cloning either city into Leilon.

If Waterdeep and Neverwinter have not yet been fully rolled, their anchor/stub records still constrain
Leilon. When either city is later generated, its planner reads every inbound relational promise first,
then rolls only unconstrained facts. It must include a legal reciprocal connection to Leilon; it need not
generate the exact merchant, quay, or political attitude until those details become relevant.

Multiple inbound promises reconcile by authority and scope rather than last-writer-wins. If a later fact
appears to conflict, Genesis preserves established observations and explains the change through route
failure, history, faction policy, mistaken belief, or another explicit event. It never rerolls a visited
Leilon to fit a newly materialized neighbor.

##### Cost and simulation boundary

This is cheap compared with generating neighboring settlements. Population profiles, relationship
edges, coarse flow bands, reliability, provenance, and a few deferred obligations are small records.
Ordinary turns update only due events and changed dependency frontiers. A storm closing the coastal route
can affect Leilon's stock and pressure immediately while Waterdeep remains an aggregate supplier; no
per-ship, per-merchant, or whole-city tick is required.

**Recommendation:** adopt permeable capacity envelopes with explicit context-sensitive slippage rolls.
Known regional relationships widen the legitimate demand envelope before capacity is rolled; unexplained
departures become tracked causal roots. Let unrolled settlements exert influence through hard minimal
anchors and typed relationship edges while their unpromised interiors, institutions, and people remain
latent/soft.

**Open follow-up:** should Genesis use this latent regional-contract model—hardening only the minimum
population/role/route/relationship facts required by already generated places—and should known extended
demand widen the normal envelope while only genuinely unexplained slippage creates a contradiction root?

#### 10.6.5 Final ruling - rolled populations, permeable capacity, connected latent places

Adam confirms that the direction feels right: the place generator is becoming connected, living, and
meaningfully simulated. Question 6 is resolved:

- the small jail fixture is **hamlet jail**; `frontier` never substitutes for a population or
  institutional-capacity tier;
- one canonical population profile serves settlement presentation, economic tiering, ambient cohorts,
  site demand, institutional capacity, and future simulation rather than each system inventing its own
  scale;
- population is stored as a stable rolled band, approximate estimate, credible range, provenance, and
  confidence, with routine transient and seasonal/event populations represented separately;
- established canon outranks rolls. Context selects eligible tables; editable dice choose independent
  demand/doctrine/coverage/partition inputs; transparent arithmetic derives dependent quantities; every
  result and reconciliation is persisted and inspectable;
- purpose profiles declare the relevant demand driver—residents/households, justice catchment,
  travelers/routes, regional constituency, production/input throughput, strategic mandate,
  institutional population, or ecological load—rather than adding every population-like number into one
  meaningless total;
- designed capacity, current load, and current operating condition remain separate. Licensed mismatch
  produces crowding, vacancy, repurposing, external service, shifts, failure, or another causal state;
- ordinary capacity envelopes are permeable probability basins and causal alarms, not blacklists.
  Purpose/context-specific relation rolls admit compressed, ordinary, expanded, and exceptional results;
- known routes, catchments, markets, history, or mandates widen the legal envelope before rolling.
  Genuinely unexplained slippage creates a tracked capacity-contradiction root with required flows,
  manifestations, negative evidence, and player handles;
- unrolled settlements can exert bounded influence through canonical anchors, relational stubs, aggregate
  external networks, and typed population/route/trade/dependency edges;
- once a generated place relies upon a relationship, the minimum counterpart and edge promises become
  hard canon while unpromised neighbor districts, sites, NPCs, and internal details remain latent/soft;
- later neighbor generation consumes inbound promises before rolling unconstrained facts. It cannot
  retroactively reroll a visited place;
- regional flows update through events and changed dependency frontiers, not per-person, per-merchant,
  or per-shipment simulation.

The simulation north star is now explicit: **engine-owned causal structure, aggregate state, and
consequences; DM-owned performance, interpretation, and adaptive play.** A town can depend on an
unmaterialized city because the relationship is real even while the city's details are not. The world
feels simulated because dependencies constrain what happens, not because every background object ticks.

Exact population-band ranges, settlement-frequency curves, purpose-specific demand ratios, and
capacity-slippage weights remain authored/tuned Wave 2 work. Their acceptance evidence will be seed and
distribution reports across settlement roles, purpose families, history states, realms, and the stress
corpus; no single percentage is locked by intuition here.

#### 10.6.6 Future-question assignments seeded by question 6

| Inherited ruling | Future owner |
|---|---|
| One canonical population profile drives presentation, economy, cohorts, site demand, and institutional capacity | Remaining **Wave 2** defines the profile interface and quantity consumers; future **place/settlement generation** owns the complete population and settlement-role rollers |
| Purpose-specific drivers turn population/catchment/throughput into exact stable site quantities | Remaining **Wave 2** authors purpose ratios, assembly curves, role coverage, and ecology; **Waves 3-5** realize the resulting spatial program |
| Capacity envelopes are permeable; contextual slippage is rolled; unexplained mismatch promotes a root | Remaining **Wave 2** owns deviation tables and incidence targets; **Wave 9** owns promoted-card scheduling; **Wave 12** owns saturation, provenance, and distribution gates |
| Minimal counterpart/relationship promises harden while unrolled neighbor detail remains latent | Future **region/settlement/world-graph** design owns typed edges, anchor/stub materialization, and reciprocal reconciliation; **Wave 12** owns persistence and migration |
| Regional dependencies run as aggregate event-driven state | Future **economy, factions, travel, and World Turn** design owns propagation; **Wave 8** owns destructive route/service changes; **Wave 12** owns lazy-vs-incremental equivalence tests |
| Proximity supplies weighted goods, NPC-origin, cultural, faction, rumor, and service influences without cloning the neighbor | Future **place, NPC, culture, faction, and economy** writing owns influence packets and anti-homogenization tests |

### 10.7 Question 7 - how should a site's population become operators, occupants, and present people?

In plain English: once Genesis knows a hamlet has about 180 residents and its jail has five designed
places, who actually operates the jail, who is held there, who supplies it, and who is physically present
when the party enters? The same question scales to a city prison, residential college, inn, monastery,
mine, or living hive.

Question 2 already locked cohort-first population effects with individualization on salience. Question 4
locked sparse stable child variation. Question 6 now supplies population, demand, capacity, current load,
and regional/transient inputs. The remaining decision is how those facts compile into a **role-complete
site population** without eagerly generating every person or leaving the DM to invent whoever makes the
place function.

Two failure modes are already dominated:

- **eager named cast:** generate every guard, prisoner, student, guest, worker, child, animal, and
  relationship at site creation. This offers detail but explodes saves, DM context, simulation, writing,
  and large-city generation;
- **anonymous totals only:** store `2 guards, 3 prisoners` and let the DM invent identities and
  relationships on demand. This is cheap but recreates the current freehand drift, weakens persistence,
  and makes clues/contracts depend on prompt memory.

#### Recommended role-coverage and salience model

Compile population in layers:

```text
site operating model + current state
  -> required actor/provider roles and coverage
  -> stable cohorts, shifts, households, assemblies, and external links
  -> small guaranteed anchor cast
  -> deterministic latent individual seeds/slots where interaction is plausible
  -> materialize/promote individuals when attention, discovery, contract, conflict, or story requires
  -> preserve identity and relationships permanently after contact
```

##### 1. Roles are obligations, not automatically one NPC each

A functional role declares what agency must exist:

- operator/authority;
- labor/service/maintenance;
- resident, client, captive, patient, student, worshipper, guest, or consumer;
- supplier/carrier/external provider;
- dependent/family/household;
- defender/enforcer;
- claimant, dissident, infiltrator, trespasser, predator, parasite, or contested occupant;
- ecological equivalents such as queen, brood, worker caste, feeder, symbiont, prey, decomposer, or
  environmental process.

One actor may satisfy several compatible roles; one role may require a cohort or shifts; automation,
ritual, summoned labor, biological process, or external service may satisfy a role without an onsite
person. The selected realization records who/what is responsible, schedule/availability, dependency,
and failure behavior.

##### 2. Stable cohorts carry background truth

A city prison need not mint 180 prisoner biographies. It can store cellblock cohorts with count/range,
composition, current condition, faction/zone alignment, routine, shared pressure, and stable seed. A
college can store students by house/floor/program; an inn can store routine staff plus a transient guest
cohort; a hive can store castes and brood stages.

Cohorts are not interchangeable fog. They carry stable membership slots and causal state so later
individualization is deterministic and cannot rewrite observations. A player who speaks to “the limping
prisoner in block C” causes that slot to materialize as one persistent NPC drawn from the block's already
fixed context.

##### 3. A small anchor cast makes the place immediately playable

Every socially actionable site should materialize a bounded set of people who define operation and
immediate play:

- authority or accessible representative;
- current point-of-contact/gatekeeper;
- any person required by an active contract, clue, conflict, or root;
- one or more role/pressure anchors when the site would otherwise feel anonymous;
- individuals already established by lore, relationships, or prior contact.

This is not a fixed “three NPCs per site” rule. A one-person shrine may need one keeper; a market can
surface several anchors; an abandoned ruin may have none; a contested social hall may carry multiple
simultaneous beats under the already accepted social-space rule.

##### 4. Presence is separate from membership

The site roster records who belongs, works, resides, visits, or is supplied there. A schedule/state pass
determines who is present in the active slice:

- sheriff at the jail, deputy on patrol, tavern runner delivering meals;
- prison night shift, cellblock lockdown, visitors waiting, kitchen crew active;
- college residents in class, studying, asleep, absent, or gathered for a house event;
- inn staff onsite, booked rooms occupied, travelers delayed by weather;
- hive workers foraging outside while brood defenders remain.

Time, current events, alarm state, occupation fronts, player actions, route failures, and contracts can
change presence. Membership and identity do not reroll merely because the scene changed.

##### 5. Attention promotes detail in grades

Use the established attention ladder:

- **cohort:** aggregate count/state only;
- **latent slot:** stable seed plus inherited facts, not yet a full NPC record;
- **anchor:** named/role-bearing and available to DM context;
- **foreground:** full NPC mechanics, relationships, inventory/knowledge, and active needs as required;
- **resolved/away/dead/transformed:** persistent outcome retained without occupying the live hand.

A direct conversation, focused inspection, combat target, rescue, recruitment, contract, clue ownership,
or strong player interest can promote a slot. Mere existence in a city does not.

##### Stress-corpus examples

- **Hamlet jail:** sheriff is likely the authority anchor; deputy may be a second anchor or stable offsite
  role; two current prisoners can be latent slots until approached, unless one owns a clue/root; the
  tavern meal provider is a hard external relationship, not an invented tray of food.
- **City prison:** warden/shift command and root-relevant actors anchor the site; guards and inmates remain
  block/shift cohorts with deterministic individual slots; only the active block and due cross-site
  relationships enter DM context.
- **Residential college:** master/porter and current-pressure anchors materialize; houses/floors hold
  student cohorts; dorm-room occupants gain sparse signature seeds and promote when visited or discussed.
- **Ordinary/boutique inn:** recurring staff are stable anchors; guest turnover uses transient cohorts and
  stay records; a story-relevant guest promotes and persists after departure.
- **Living habitat:** ecological roles and cohorts replace human job titles; a singular queen, wounded
  beast, bonded symbiont, or intelligent negotiator becomes an anchor only when biologically or
  narratively justified.

##### Recommendation

Use role-complete cohorts plus a bounded anchor cast and deterministic salience promotion. Guarantee that
every operational role has a real actor, cohort, process, or external provider link, but do not require a
named NPC for every slot. Keep membership, presence, attention grade, and current condition separate.
This makes places operational and socially alive while keeping work proportional to the active slice.

**Open decision:** should this role-coverage/cohort/anchor model govern site populations, including stable
latent individual slots and the rule that role membership does not imply current physical presence?

#### 10.7.1 Follow-up - current NPC reconstruction and the rural population

Adam likes the model and asks whether the current NPC system mainly needs its role assignment replaced
by casting, how broad public-place casts should be, and where farmers and people living outside
settlements are counted.

The repository audit shows a **medium population/casting reconstruction around a largely reusable NPC
core**, not a wholesale NPC rewrite.

##### What the current engine already has and should keep

- `rollNPC()` already creates a useful individual identity: species/name, realm-skinned occupational
  role archetype/label/note/class, coherence tier, visible behavior, want, and optional secret, bond,
  fear, leverage, and immediate motivation.
- The 35-archetype NPC Role Spine and eleven realm skins already separate universal play-angle from
  realm-specific labels, drops, additions, and weights. Land-worker, wild-provider, hauler, host,
  enforcer, and other reusable shapes are valuable population vocabulary.
- `roleClass` can already filter a draw toward broad classes such as labor, service, authority, care,
  faith, or trade.
- Codex records already distinguish rolled atoms, player-safe fields, DM-only levers, typed links, place,
  condition, known/unknown, and soft/hard lifecycle.
- `codexRecontextualize()` already allows an untouched soft person to be reassigned without rewriting a
  contacted person, and `codexContact()` canon-locks identity on interaction.
- The coherence/attention/hook systems already support cheap archetype NPCs that deepen only through
  interaction; children and animals already have lightweight partial records.
- Region-aware names, realm role skins, Breach leakage, attitudes, relationships, NPC life events, and
  renderer presence are all reusable surfaces.

The existing `fields.role` can remain a compatibility/display field. Old saves need not have their NPCs
rerolled.

##### The current gaps are real but concentrated

- `role` currently conflates occupation/social archetype with the job an NPC performs at a particular
  institution or scene.
- `roleHint` is recorded for the DM but, as `rollNPC()` itself documents, does not currently bias the
  role roll. `buildingApproach()` asks for a proprietor through `roleHint`, but this does not prove that
  the rolled person can operate that building.
- generic inhabited nodes mint a fixed ambient pool of three soft NPCs;
- typed scenes independently roll shrine/shop/tavern/market counts and mint fresh NPCs from broad realm
  roles. Their useful `d2`, `d3`, `2d4`, and `3d6` counts currently express scene density, but do not
  draw from a settlement population, site staff, household, visitor pool, shift, or schedule;
- scene temperature controls density, but site capacity, current load, resident/transient population,
  time of day, route traffic, and current event are not the population source;
- a wilderness social encounter can produce encounter prose without binding the person to a persistent
  farm, household, community, route, or regional cohort.

Therefore the personality/lever roller needs additive fields and filters; the ambient/presence system
needs the meaningful rewire.

##### Casting does not replace occupation

At least four facts currently called “role” must be kept distinct:

```text
occupation/archetype: what kind of work and social position shapes this person
membership/home: what household, faction, settlement, institution, or mobile cohort they belong to
site assignment/relation: sheriff, deputy, proprietor, prisoner, student, guest, supplier, visitor
scene function/presence: why they are in this scene now—staffing, drinking, delivering, testifying
```

**Casting** chooses or promotes an NPC to satisfy an assignment or scene-presence need. It does not
erase the occupation roll.

Examples:

- an `Enforcer`-archetype local may be assigned as the hamlet sheriff;
- a `Land-worker` may own the tavern as a second livelihood, serve there seasonally, or simply be a
  patron after work;
- a prisoner's underlying occupation may be sailor, farmer, thief, healer, noble, or mage—`detainee`
  is a current institutional relation/condition, not their entire identity;
- a `Host` may operate the inn, while a spouse with a different occupation manages accounts;
- a summoned clerk, sentient building, ritual rotation, or external provider may satisfy an
  institutional assignment without forcing a conventional occupational label.

The cast resolver should use this order:

```text
1. established actor required by canon/relationship/contract
2. compatible known or soft local NPC who is available
3. promote a deterministic latent slot from the appropriate household/cohort
4. mint a new NPC from the correct context only if no legal candidate exists
```

It writes assignment, membership, schedule/presence, and cast provenance. It never rerolls a hard NPC's
occupation to make them fit. An unusual but legal assignment becomes character texture or a causal
handle; an impossible assignment triggers reconciliation.

##### Public places use mixed cast lanes, not an unrestricted grab bag

Taverns, markets, docks, festivals, temples, courts, and social halls can contain many occupations, but
“any role” should mean **broad contextual eligibility**, not uniform selection from every NPC in the
world.

A public-scene cast combines:

- **required staff/anchors:** proprietor, servers, guards, officiants, clerks, performers;
- **local attendees:** drawn from resident households/cohorts according to schedule, custom, wealth,
  access, and current pressure;
- **transients:** travelers, sailors, merchants, pilgrims, messengers, or migrants licensed by the
  population/route profile;
- **purpose-specific visitors:** prisoners' families, advocates, suppliers, witnesses, patients,
  students, worshippers, buyers, and sellers;
- **event/root actors:** anyone whose contract, faction front, secret, or promoted story card requires
  presence.

Scene-count dice can survive as presentation/density rolls, but the resulting slots draw from these
pools and are capped/modified by site capacity and active population. A farmer can absolutely be met in
a tavern; a remote fisher can appear at market day; a city magnate can pass through a hamlet inn when a
trade relationship licenses it. They are not duplicated simply because a new room is entered.

A jail is mixed but not generally open-cast: staff assignments are constrained; detainees may come from
many occupations; visitors/deliveries come from purpose-specific and route pools; someone with no
custody, work, supply, legal, family, religious, or story reason to be inside needs an explicit cause.

##### Rural and dispersed people need their own population scopes

The settlement population record should not ambiguously swallow every nearby farmer, nor pretend the
town walls contain everyone the town serves. The connected place system needs separable but linked
population scopes:

```text
settlement-core residents
attached hinterland / rural households
independent nearby hamlets or communities
dispersed wildland households and small groups
mobile/ranging populations
routine transients
seasonal/event populations
```

Each person or latent slot has one population/home owner to prevent double-counting. Relationships and
service catchments can connect that person to several places without counting them several times.

- **Farms** are household/holding or farm-cluster child sites with aggregate residents, workers,
  dependents, land/livestock/production, seasonal labor, market route, and service links. Genesis does
  not generate every farmhand at region creation; it stores a cohort and promotes individuals when a
  farm, road, market, contract, or event needs them.
- **Rural residents** may belong to a town's attached hinterland and use its market, jail, temple,
  healer, school, mill, and protection. They enlarge those service catchments without inflating the
  town-core housing or well demand.
- **Independent communities** retain their own population profile and relationships rather than being
  treated as anonymous town hinterland.
- **Dispersed wildland residents**—hermits, foresters, hunters, fishers, shepherds, prospectors,
  wardens, hidden households, or realm-specific equivalents—belong to stable home/range cohorts.
- **Mobile populations**—caravans, nomadic groups, migratory workers, patrols, bands, fleets, seasonal
  camps—have a home affiliation where appropriate plus current route/range and seasonal counts.

“Wilderness” is a spatial/environmental classification, not a claim that no people live there. Realm,
culture, sovereignty, and established lore decide whether a group is attached to a settlement,
independent, mobile, contested, hidden, or merely passing through. The engine must not collapse distinct
peoples into a city's anonymous rural supply pool.

##### Rural casting in play

When a wilderness walk rolls a human/social contact, the cast resolver should first search:

```text
nearby farm/holding/community cohorts
-> known mobile groups and route travelers
-> people temporarily working/foraging/patrolling in this range
-> regional transient/outsider pool
-> new context-legal mint only when needed
```

The resulting person receives a stable home/range or route relationship. If the party later meets the
same farmer at market or in the tavern, the engine can cast that existing NPC rather than rolling a
duplicate. Conversely, a random traveler need not be falsely assigned to the nearest farm.

##### Reconstruction cost

| Surface | Expected change |
|---|---|
| NPC atom tables, coherence, wants/levers, names, realm role spine/skins | **Keep**; add contextual weights/filters only where useful |
| Codex NPC identity, links, soft/hard contact, attitudes, hooks | **Keep and extend** with population owner, memberships, assignments, availability, cast provenance, and attention grade |
| `fields.role` and old saves | **Keep as compatibility occupation/display**; missing new fields degrade safely |
| `roleHint` / `roleClass` | **Refactor** into honest cast/assignment constraints; stop implying that a recorded hint proves staffing |
| Generic and scene ambient minting | **Meaningful rewire**: counts become presence/density demand; source people from cohorts/cast resolver instead of always minting fresh NPCs |
| Rural/wilderness people | **New aggregate layer**: household/community/mobile cohorts and home/range relationships, consumed by the same cast resolver |
| Runtime | **Low**: filter small candidate pools, promote one slot, and materialize only active people |
| Implementation/content | **Medium**: new population/cohort/casting records, adapters, migration, purpose staffing tables, rural profiles, and cross-scene tests |

The result is closer to “replace how NPCs are selected and placed” than “replace what an NPC is.”

**Recommendation:** retain the NPC role spine as **occupation/archetype**, then add membership, site
assignment/relation, presence/schedule, and scene function as distinct fields. Replace independent
ambient minting with a cast resolver over canonical settlement, hinterland, rural, mobile, and transient
cohorts. Let public places draw broadly but contextually; let operational staff remain role-complete.

**Open follow-up:** should this occupation + membership + assignment + presence split govern the NPC
model, with farmers and wildland residents owned by explicit rural/household/mobile population scopes
and with current ambient-count dice retained only as scene-density demand rather than fresh-NPC counts?

#### 10.7.2 Final ruling - cast from one connected population; preserve the NPC core

Adam confirms that the model feels right. Question 7 is resolved:

- the current NPC atom stack, coherence tiers, wants/levers, hooks, attitudes, realm-skinned role spine,
  Codex identity/links, and soft-to-hard contact lifecycle remain the individual-NPC foundation;
- `role` is retained and clarified as occupation/social archetype rather than being replaced by casting;
- population ownership/home, memberships, institutional assignment/relation, schedule/availability,
  physical presence, attention grade, and scene/cast reason become separately represented facts;
- casting first uses established required actors, then compatible available locals, then deterministic
  latent cohort slots, and mints a new context-legal NPC only when none exists;
- hard NPC identity/occupation never rerolls to fit a scene. Unusual legal assignments become texture or
  causal handles; impossible assignments enter reconciliation;
- every required operational role receives a real actor, cohort, process, automation, ritual, or
  external provider, but not every role or population slot requires an eager named NPC;
- public places combine constrained staff, context-weighted locals, licensed transients, purpose-specific
  visitors, and event/root actors. They are broad social casts, not uniform global role draws;
- a detainee, patient, guest, student, worshipper, customer, or visitor retains an underlying occupation
  and identity. The current institutional relation does not replace the whole person;
- existing scene-count dice remain useful as density/presence demand, modified by population, capacity,
  time, route traffic, temperature, and current state. They no longer authorize independent fresh-NPC
  populations for every entered scene;
- settlement-core, attached-rural, independent-community, dispersed-wildland, mobile/ranging,
  transient, and seasonal populations remain distinct but related scopes;
- farms/holdings, rural households, communities, and mobile groups use aggregate cohorts with stable
  home/range/route relationships and promote individuals on attention;
- each person or latent slot has one population owner for counting purposes while relationships and
  service catchments may connect them to many places;
- wilderness social encounters cast from nearby households/communities, mobile groups, working ranges,
  and regional transients before minting a new outsider. Wilderness never means unpeopled by default;
- the expected build is a medium casting/population reconstruction around a reusable NPC core, with low
  runtime cost and backward-compatible `fields.role` fallback for old records.

#### 10.7.3 Future-question assignments seeded by question 7

| Inherited ruling | Future owner |
|---|---|
| NPC occupation, membership, assignment, presence, and cast reason are separate | Remaining **Wave 2** owns occupant-group/role coverage; future **NPC/social/Codex** specs own final schema, migration, schedules, and cast resolver |
| Casting draws existing/local/latent candidates before minting | Future **NPC casting and on-demand generation** work owns candidate scoring, availability, promotion, duplication guards, and instrumentation |
| Ambient scene dice express density rather than independent population creation | Future **NPC presence** reconstruction owns compatibility with current shrine/shop/tavern/market dice; **Wave 10** owns crowd presentation budgets |
| Rural households, farms, communities, wildland residents, and mobile groups are explicit population scopes | Future **place/settlement/region/wilderness** design owns household/holding/mobile profiles and range/route materialization |
| One population owner prevents double-counting while service/relationship edges may be plural | **Wave 12** owns persistence, identity, migration, and duplicate-person/slot invariants |
| The current NPC core is preserved; `roleHint` cannot masquerade as proven assignment | Future implementation specs must audit every roleHint/roleClass/proprietor/ambient caller and retain old-save fallbacks |

### 10.8 Question 8 - how should multiple populations share and contest one site?

In plain English: a prison may contain guards, prisoners, a prisoner gang, visitors, contractors, vermin,
and something living in an abandoned wing. A college may contain faculty, several houses, servants,
visitors, a secret society, and a magical system with its own interests. How does Genesis preserve those
distinct groups, decide where each belongs, and let their relationships change without assigning every
room an unrelated random occupant?

Wave 1 already chose **occupation zones** and event-driven fronts. It also established that claims can be
physical, social, legal, political, religious, resource-based, influential, or aspirational. Question 8
must turn that ontology into an authorable site-ecology program.

The rejected extremes are:

- **one master occupant/faction per site:** coherent and cheap, but it erases the living contested
  dungeons Adam valued in Skyrim and the refugee/druid relationship that made BG3's grove compelling;
- **independent occupant roll per room:** varied, but produces faction confetti, duplicated leaders,
  impossible supply, no fronts, and no meaningful reason why adjoining rooms differ.

#### Recommended occupant-group and typed-claim model

Each current population enters the site as a group/cohort profile:

```text
identity and population source
reason for being here
goal and current pressure
operator/leader or decision process
home/base and mobility
required resources and providers
relationships to other groups
typed claims over zones, functions, routes, and objects
current front/state and event triggers
```

Groups need not be factions in the political sense. Prisoners, patients, students, pilgrims, refugees,
predator families, prey herds, parasites, maintenance crews, and a bound intelligence can all be
occupant groups when shared behavior and claims matter. Incidental individuals remain individuals.

##### Typed claims produce zones

For each relevant site zone/function, a group may hold:

- **physical control:** can occupy, patrol, defend, or exclude;
- **legal/title claim:** recognized owner/operator or lawful user;
- **social/customary access:** belongs there by convention even without force or title;
- **resource claim:** depends on or controls food, water, heat, tools, records, routes, ritual power;
- **religious/doctrinal claim:** declares sacred authority, taboo, stewardship, or custodianship;
- **political/influence claim:** can make others act there without direct occupation;
- **aspirational claim:** wants control but does not yet possess it;
- **hidden claim:** secretly uses, watches, feeds from, or manipulates the zone.

The resulting zone relationship can be core-held, shared, scheduled, tolerated, dependent, contested,
besieged, excluded, abandoned, infiltrated, or hidden. A room inherits its zone defaults; deviations need
a stored cause such as an outpost, truce, secret route, local relationship, resource pocket, or event.

##### Sharing is not automatically conflict

Two populations may cooperate, depend on one another, coexist uneasily, hold a hierarchy, avoid each
other, negotiate schedules, compete without violence, or be openly hostile. A relationship record should
include attitude/posture, dependency, grievance, leverage, boundary rules, and escalation/de-escalation
triggers rather than one universal hostility score.

Examples:

- prison guards physically control gates and legally operate the prison; inmates customarily control
  parts of cellblocks and socially control information; a gang influences the kitchen through debt; a
  chaplain has scheduled access across zones; a hidden claimant uses the drains;
- college administration legally owns the buildings, houses socially control their dorms, faculty
  control teaching spaces, servants control practical access, and a secret society claims a forgotten
  observatory without anyone acknowledging it;
- druids control the sacred inner grove, refugees occupy permitted outer ground and depend on the gate,
  both require food/water/defense, and paranoid leadership converts shared pressure into a front without
  making every individual personally hostile;
- a cavern colony controls nesting chambers, predators range across hunting corridors, symbionts share
  feeding zones, and parasites hold hidden biological claims rather than political territory.

##### Functions and flows create leverage

The site program already knows who supplies food, water, heat, sanitation, access, records, medicine,
defense, and waste removal. Occupant claims attach to those functions. This produces usable leverage:

- prisoners depend on guard-controlled doors but may control labor or information;
- refugees depend on druid water access while supplying external trade or defense;
- a college house controls an experimental heat source used by another house;
- predators avoid a brood zone because the symbiont there controls a painful toxin;
- the group holding a hidden route can bypass the nominal gatekeeper.

Resource asymmetry creates choices and clues without requiring a crisis. It becomes a front only when a
licensed pressure or action destabilizes the relationship.

##### Event-driven fronts change coarse state

No per-NPC territorial simulation is needed. Groups and zones update when meaningful events occur:

```text
player opens/closes a route
leader or anchor changes
resource/service fails or recovers
contract/truce is made or broken
casualties or reinforcements cross a threshold
secret becomes known
occupation succeeds or retreats
external faction or regional event intervenes
```

An event changes claim strength, posture, allowed routes, presence schedule, resource access, front
clock, or zone state. The engine then recomputes only affected groups/zones and deterministically catches
up latent areas. Observed room truth changes through recorded events, never rerolls.

##### Anchor individuals personalize group truth

Each important group may have a bounded anchor cast—leader, representative, dissident, gatekeeper,
victim, negotiator, or story owner—generated through Question 7's casting model. Individuals can differ
from their group's current posture. A sympathetic druid remains a druid; a frightened guard remains part
of the guard cohort; their personal attitudes and choices can feed back into the front without every
member becoming a full simulation record.

##### Recommendation

Represent every material occupant population as a cohort/group with purpose, home, needs, relationships,
and typed claims. Compile coherent occupation zones from those claims; allow shared and scheduled use;
create fronts only from actual pressure; update through events. Use anchor individuals to make group
state personal without replacing cohorts with a fully simulated crowd.

**Open decision:** should this occupant-group + typed-claim + event-driven-front model govern contested
sites, with room occupancy inherited from coherent zones and with shared resource dependencies treated
as leverage rather than automatic hostility?

#### 10.8.1 Follow-up - what constitutes a group and how many are generated?

Adam finds the typed-claim/zone/front model solid and asks whether groups are merely faction rolls,
whether meeting any independently motivated entity creates a group, how rogue actors and double agents
survive group abstraction, and how the number of occupant populations is determined.

The answer requires separating four structures:

```text
population cohort: non-overlapping home/count partition; prevents double-counting bodies
operational/social group: people who share behavior, identity, routine, decision, or claim
faction/organization: a persistent power with agenda, membership, and reach beyond one scene
singular actor: one entity with personal motives and claims; may belong to zero, one, or many groups
```

A faction may project a local group/branch into a site, but most occupant groups are not new world
factions. A cellblock cohort, work shift, household, class, refugee camp, patient ward, brood, predator
family, or temporary coalition may matter collectively without receiving a world-level faction agenda
and clock.

The current engine makes this distinction especially necessary. World creation presently rolls a
dominant faction plus `1d3` rivals with global agendas/clocks; factions have no authoritative node-bound
population/branch model, and the current reputation helper chooses the first `member-of`/`serves`/`leads`
faction link it finds. Those systems remain useful for great powers but cannot honestly represent
overlapping local affiliation or double agency without extension.

##### When does a group record exist?

A group is warranted when collective tracking predicts play better than unrelated individuals. One or
more of these normally applies:

- shared leadership, decision procedure, command, vote, instinct, or coordinated behavior;
- persistent collective identity, membership, household, caste, crew, class, order, or affiliation;
- shared goal, grievance, claim, boundary, secret, doctrine, or opposition;
- shared routine, schedule, resource dependency, supply arrangement, habitat, or response pattern;
- a collective state change would matter: morale, strike, migration, lockdown, panic, schism, retreat,
  recruitment, starvation, recovery, or territorial shift.

Several strangers drinking in the same tavern are not automatically a group. Two prisoners in adjacent
cells are not automatically a prisoner faction. They may remain separate actors within a shared
detainee cohort until a common grievance, escape plan, gang, mutual defense, identity, or other
collective behavior makes group state useful.

A group can temporarily have one visible member when that actor represents a larger latent/external
organization, is the last survivor, or is building/rebuilding membership. Otherwise a truly singular
entity uses the same claim/relationship vocabulary directly on its actor record without pretending to
be a population.

##### An entity's own motives do not automatically create a group

Encountering a motivated person, dragon, spirit, sentient door, prisoner, or monster creates or promotes
an **actor**, not a faction. The actor may:

- hold individual claims and goals;
- belong to an already established group/faction;
- reveal a latent group already promised by cohort/site/root state;
- roll a licensed relationship that implies associates or an external organization, thereby creating a
  promissory group/organization obligation;
- recruit, persuade, summon, reproduce, organize, or ally during play, causing a new group to emerge
  through an explicit event.

A lone dragon occupying a vault is a singular claimant. Its cult, brood, servants, tribute network, or
army—if actually present or causally promised—are groups. “The dragon has motives” alone does not mint
followers.

##### Group types are authored, not one generic faction die

The minimum useful group types include:

- household/kin/holding;
- staff, shift, crew, team, class, ward, block, or operational cohort;
- institution/order/guild/company and local branch;
- faction, gang, cult, political current, or secret society;
- constituency/condition cohort such as prisoners, refugees, patients, pilgrims, or guests;
- ecological caste, colony, pack, herd, brood, symbiont, parasite, or predator population;
- expedition, caravan, patrol, fleet, seasonal camp, or other mobile group;
- temporary coalition, truce, protest, mutiny, escape party, or emergent front.

Purpose-family, population, site-history, occupation, ecology, faction, route, and Spice tables decide
which types are eligible. Human-readable dice still choose conditional and optional groups; the engine
does not call one universal `roll faction count` function.

##### How the number of populations/groups is determined

The count should emerge through causal channels:

```text
1. purpose/current operation supplies required actor and population channels
2. current load partitions people into non-overlapping population-owner cohorts
3. operator doctrine/scale partitions shifts, blocks, houses, classes, wards, castes, or crews
4. regional factions/institutions project only branches with a reason and claim here
5. history/current occupation adds conquerors, refugees, contractors, squatters, infestations, etc.
6. ecology adds eligible predators, prey, symbionts, parasites, and resource competitors
7. protected optional/Spice opportunities can add hidden, aspirational, or exceptional claimants
8. collective-meaning test merges trivial distinctions or splits a persistent consequential subgroup
9. capacity/resource/zone reconciliation validates that every onsite group can exist or records why not
```

This distinguishes **headcount partition** from **overlapping affiliation**:

- population-owner cohorts are exhaustive/non-overlapping for count;
- memberships, organizations, gangs, factions, religions, secret societies, and coalitions may overlap
  and do not add bodies merely because a person has another allegiance;
- one person is counted once at their home/current population scope but may carry several memberships,
  assignments, claims, and relationships.

Group count therefore grows sublinearly with site population. A prison with 180 inmates does not need
180 groups; it may have several stable cellblock cohorts and a small number of overlapping gangs,
religious circles, work details, dissident networks, or secret roots. A hamlet jail with two unrelated
prisoners may have no prisoner group at all.

Required channels are not random: an operating prison needs operators and detainees/current custody
load; an operating college needs institutional staff and students; a living hive needs its actual
ecological functions. Optional splits, factions, visitors, infiltrators, secondary occupations, and
hidden groups use contextual rollers and site/root budgets. Exact count curves remain writing/tuning,
tested by scale and purpose rather than one universal cap.

##### Hamlet-jail example

```text
population-owner cohorts:
  local justice staff: sheriff + deputy
  current detainees: two individuals

operational/social groups:
  sheriff's office / local watch: one small institutional group
  detainees: no group unless they share a plan, identity, or collective state

other possible records:
  meal provider: external tavern relationship, not an onsite group
  rat colony: ecological group only if rolled/material
  infernal soap claimant: singular actor/root, not automatically a cult
```

If one detainee is secretly an agent of a regional faction, that creates a membership/assignment on the
actor and perhaps a latent external branch promise. It does not create a second body or require the
other prisoner to join.

##### City-prison example

```text
non-overlapping count cohorts:
  administration; guard shifts; contractor staff; inmate blocks; current visitors

operational groups:
  command staff; night shift; kitchen work detail; medical staff

overlapping affiliations:
  two inmate gangs; a guard association; a prison ministry; corrupt procurement ring;
  possible secret cult spanning one guard, several inmates, and an external visitor
```

The cult's members remain counted in their guard/inmate/visitor population cohorts. The cult is a
cross-cutting organization/claim group, not another population total.

##### Rogue actors, dissidents, infiltrators, and double agents

Group defaults are predictions, never mind control. Each materialized individual retains:

- personal want, fear, bond, secret, attitude, and current pressure;
- zero or more memberships with role/rank, loyalty/commitment, public/hidden visibility, and provenance;
- assignment and access, which may differ from allegiance;
- an individual stance toward each relevant group/front when it matters;
- triggers that may produce dissent, defection, betrayal, reform, whistleblowing, or reconciliation.

Important groups reserve sparse anchor/deviation roles such as leader, representative, loyalist,
dissident, opportunist, victim, infiltrator, defector, or double agent. These are casting opportunities,
not mandatory stereotypes in every group. When an ordinary latent member becomes salient, their
person-to-group stance is rolled/materialized once and persists.

A double agent is represented explicitly:

```text
population owner: prison guard shift (counted once)
public membership/assignment: city prison guard
hidden membership or obligation: inmate gang / rival faction / crown investigator
access: guard routes, keys, schedules
personal motive: money, coercion, loyalty, revenge, reform, or another rolled lever
```

Their public institution and hidden allegiance can pull different fronts. No single `factionId` field
may overwrite that plurality, and group posture may not overwrite their per-PC attitude or foundational
identity. Current first-faction reputation readers will need a compatibility extension when this system
is specified; they are not authority for the redesigned model.

##### Groups can form, split, merge, and dissolve through events

Collective structure is not creation-only. Explicit events can:

- create a coalition, escape party, mutual-aid group, cult, gang, council, or resistance;
- promote a recurring informal cluster into a tracked group;
- split a group when a subgroup develops a persistent consequential claim/posture;
- merge groups under conquest, alliance, marriage, institutional reform, or ecological integration;
- dissolve a group while retaining its history, former members, claims, and consequences.

These state changes require provenance and update only affected relationships/zones/fronts. The player
can therefore cause group formation rather than merely discover prewritten factions.

**Recommendation:** derive group count from required population channels plus context-rolled occupation,
history, ecology, faction-branch, and Spice overlays. Keep non-overlapping cohorts for headcount and
allow overlapping memberships/claim groups for social truth. Create a group only when collective state
matters; otherwise preserve the actor as singular. Guarantee sparse individual deviation so rogue actors
and double agents remain first-class.

**Open follow-up:** should Wave 2 adopt this cohort/group/faction/actor distinction, including causal
group-count generation, overlapping public/hidden memberships, and the rule that an independently
motivated entity remains singular unless collective behavior or a wider organization is actually
licensed?

#### 10.8.2 Follow-up - keeping the theory affordable and playable

Adam accepts that the design sounds powerful **in theory**. The qualification is important: the model
fails if implementation turns it into an all-to-all social graph, continuous territorial simulation,
or a full individual membership ledger for unseen populations.

The main risk is schema/content/integration complexity, not browser runtime. A bounded implementation
can be cheap because the system reasons over a handful of group/cohort/zone records rather than every
person and room.

##### Hard anti-bloat laws

1. **Population counts live only on non-overlapping owner cohorts.** Affiliations and memberships are
   links, never duplicate population records.
2. **Relationships are sparse and causal.** Store a group-to-group edge only when there is a claim,
   dependency, active posture, history, front, contract, or other play-relevant reason. Never construct
   an all-pairs matrix.
3. **Claims attach first to functions/zones/routes/resources.** Rooms inherit zone state. Do not store
   repeated copies of the same claim on every room or member.
4. **Cohorts hold aggregate membership.** Exact member lists exist only for already materialized people
   or when a mechanical promise requires a stable slot. A 100-person cellblock does not receive 100
   membership edges at creation.
5. **Group defaults apply until individual salience.** Latent members do not each roll loyalty, attitude,
   secrets, and relationships. Promotion rolls/materializes the person's deviation once and persists it.
6. **Event-driven updates only.** No group takes a turn merely because time passes. Due clocks, resource
   threshold crossings, player actions, external events, and explicit fronts update the affected
   dependency frontier.
7. **Active-slice projection.** The DM sees only groups, fronts, anchors, and claims relevant to the
   current site/zone/action. Stored world truth does not equal prompt content.
8. **Hierarchy instead of flat expansion.** A regional faction may own a local branch; a prison owns
   blocks; a college owns houses; a hive owns castes/niches. Parent defaults are stored once.
9. **Not every group gets a clock or story card.** Stable staff, ordinary cohorts, and background
   ecological populations can remain state records. A clock/card appears only when a live pressure,
   promise, or change process exists.
10. **Saturation is diagnostic, not erasure.** When too many consequential groups compete for a tiny
    site, the planner nests branches, externalizes visitors/providers, merges distinctions that do not
    affect play, or records the crowding/occupation cause. It does not silently discard a licensed root.

##### Expected scale

The design should be judged by meaningful records rather than one universal numeric cap:

- a hamlet jail commonly has one operational group plus a few singular actors and external links;
- a contested small dungeon may have two or three occupant groups, an ecological cohort, and one hidden
  claimant;
- a city prison may have several owner cohorts/operational subgroups and a bounded handful of
  cross-cutting organizations, while hundreds of people remain aggregate;
- a large city can contain many groups globally, but only the current district/site slice and directly
  affected regional dependencies become active.

Group count is therefore closer to the number of consequential collective distinctions than to
population size. If a generated hamlet jail routinely produces nine organizations, the distributions or
partition logic are wrong.

##### Mechanical cost

| Cost surface | Expected cost if bounded |
|---|---|
| Runtime generation | Low: expand required/conditional channels, partition a few cohorts, build sparse claims/edges |
| Turn updates | Low: process due events and changed dependency frontier only |
| Save size | Low-to-moderate: group/cohort records and sparse links; individual expansion dominates only after contact |
| DM context | Lower than freehand memory: active summaries replace repeated reinvention; global records remain out of prompt |
| Engine implementation | Medium-to-high: new group/cohort/claim/front schemas, casting integration, plural membership, migration, diagnostics |
| Content/writing | Medium-to-high: purpose/ecology group channels, claim/relationship/deviation tables, realm/culture skins |
| Long-term expansion | Favorable: new realms and purposes add data/profile rows rather than parallel NPC/faction engines |

The model should be built coarse-first when its implementation wave arrives:

```text
1. population-owner cohorts + group/actor distinction
2. plural memberships + sparse relationships
3. typed zone/function/resource claims
4. event-driven fronts and changed-frontier updates
5. individual deviation/double-agent realization
```

This is a staging recommendation, not build authorization. Every stage must preserve the final ontology
so later layers are additive rather than a second rewrite.

##### Acceptance fixtures

The existing stress corpus should add explicit group tests:

- **hamlet jail:** staff + two detainees + external food, proving detainees need not become a faction;
- **city prison:** non-overlapping count cohorts plus overlapping gangs/ministry/corrupt ring, proving no
  headcount multiplication;
- **grove-like contested refuge:** two dependent populations sharing resources and defense with
  individual dissidents on both sides;
- **college:** houses/faculty/staff plus a cross-cutting secret society and one double agent;
- **living habitat:** caste/population owners plus symbiont, predator, and parasite claims without human
  faction assumptions;
- **singular claimant:** dragon or infernal intelligence remains one actor until followers are licensed.

Required gates include headcount conservation, single population ownership, deterministic replay,
bounded active projection, no all-pairs edge growth, latent-versus-eager equivalence, no hard-identity
overwrite, plural-membership correctness, and event locality.

**Cost judgment:** low runtime and save cost when sparse; medium-to-high implementation and authoring
work; substantially less long-term fragility than asking the AI DM to remember every local faction,
claim, double allegiance, and population count in prose.

**Recommendation:** keep the accepted model, but make these anti-bloat laws part of its definition—not
optional optimization. The game's simulation should be deep in consequence and shallow in update
frequency.

**Open follow-up:** do these coarse, sparse, event-driven boundaries make the group model practical
enough to lock, particularly the bans on all-pairs relationships, eager member lists, per-group turns,
and automatic clocks/cards for every cohort?

#### 10.8.3 Follow-up - when to translate theory into architecture and specs

Adam has confidence in the theoretical design but not yet in implementation. That concern is grounded in
repository evidence: several prior promises have exceeded their production wiring, including the
`roleHint`/proprietor gap found during this discussion, the current lack of node-bound faction population,
and the repository's own recorded **verify-green != wired** failure class. The deeper design work improves
the odds, but prose depth alone cannot close the implementation gap.

The best process is neither “finish all theory before drawing any architecture” nor “write build-ready
specs after every questionnaire answer.” Use a staged artifact ladder:

```text
living direction / decision record             <- current file; discussion authority
living architecture sketch (DISCOVERY)         <- start now; provisional flows, owners, records, seams
wave-closure architecture reconciliation       <- challenge sketch against every ruling/fixture
system specs (SPECCED)                          <- only for interfaces whose owning questions/waves closed
build-unit queue + executable gates             <- only after spec lock and explicit build authorization
implementation + production-path acceptance    <- proves promises reach the actual game
```

##### Start the architecture sketch now—but keep it visibly provisional

A compact `PROCEDURAL-DUNGEON-ARCHITECTURE-SKETCH.md` would be valuable now because it forces each
accepted idea to answer:

- what record owns the truth;
- which stage produces it;
- which facts are rolled, derived, inherited, promoted, or event-mutated;
- which current module/data surface it extends or replaces;
- what remains latent versus materialized;
- which systems consume it;
- what is canonical, soft, provisional, or display-only;
- what degradation/reconciliation happens when inputs conflict;
- what runtime/save/DM-context budget contains it;
- which later wave owns unresolved structure.

Its current top-level flow might be sketched—not frozen—as:

```text
World/Region/Settlement Context
  -> Population Profiles + Relationship/Dependency Edges
  -> Purpose-Family Program + Demand Drivers
  -> Service/Capacity Envelopes + Permeable Slippage
  -> Site Obligations/Flows + Realization Contracts
  -> Cohorts/Actors/Groups/Memberships/Claims/Fronts
  -> Operational + Spatial + Local + Coordinated Spice Allocations
  -> Semantic Assemblies/Children + Fixed Topology Requirements
  -> later waves: geometry, portals, dressing, tactics, rendering
```

Candidate record names such as `PopulationProfile`, `DependencyEdge`, `SiteProgram`, `Cohort`, `Group`,
`Membership`, `Claim`, and `Front` are useful handles in the sketch. Their final fields, JSON shapes, and
module names must remain provisional until their questions and downstream constraints close.

The sketch should update at **question closures or meaningful architecture corrections**, not duplicate
every conversational paragraph. This running direction remains the complete discussion/provenance
record; the sketch is the compact map.

##### What should not be frozen yet

While Wave 2 is only through Question 8 and generated follow-ups remain active, do not lock:

- final schemas or version numbers;
- exact population bands, demand ratios, group/slippage distributions, or performance thresholds;
- module/function/API names;
- final migration transforms;
- downstream room/portal/geometry/dressing structures owned by later waves;
- a build-unit queue or implementation order that assumes unanswered systems;
- `SPECCED` status or build authorization.

Otherwise later ideas will require either dishonest “spec compliance” around an obsolete architecture or
constant retrofit churn that makes the spec cease to be authoritative.

##### Use wave closure as the freeze gate

At Wave 2 closure:

1. reconcile every Wave 2 decision and future assignment into the architecture sketch;
2. run contradiction cases across hamlet jail, city prison, residential college, ordinary/boutique inn,
   living habitat, Leilon-like trade town, kobold processor, contested grove, singular claimant, and
   double agent;
3. audit current-code seams and label each `keep`, `extend`, `adapt`, `replace`, or `retire`;
4. estimate data volume, generation work, update frontier, save growth, and prompt projection;
5. identify which interfaces are truly Wave-2-owned versus dependent on Waves 3-12;
6. freeze only the stable semantic interfaces into system specs; leave downstream consumers provisional;
7. do not implement until the relevant build gate is explicitly authorized.

Later waves amend the architecture sketch openly. They may supersede an earlier interface only through a
recorded reconciliation, never by quietly retrofitting code or erasing the old decision.

##### The promise-to-production trace is mandatory

Every eventual spec requirement should carry a trace like:

| Question | Required proof |
|---|---|
| Who produces the fact? | Real production entry point, not a helper called only by tests |
| Where is it stored? | Canonical record/schema and migration behavior |
| Who consumes it? | Actual planner/simulation/DM/render/gameplay call sites |
| How does it change? | Typed event, authority, provenance, and reconciliation |
| What does the player/DM see? | Bounded projection with knowledge/attention rules |
| What happens when absent/corrupt/over budget? | Deterministic fallback, last-known-good behavior, diagnostic |
| How is it proven? | Unit invariant + production-path integration + fixture/distribution/performance evidence |

A helper-level green test is insufficient. A feature is not `BUILT` until a production path creates the
fact, persists it, projects it to the intended consumer, responds to its mutation, and survives a real
fixture. Visual or experiential promises still require captures/playtest evidence where appropriate.

##### Recommendation

Create the living architecture sketch now as a **contradiction detector and traceability map**, not a
premature spec. Continue and close Wave 2's theoretical questions before freezing Wave 2 schemas or
writing executable unit specs. At closure, reconcile the sketch, then spec only the stable interfaces
whose dependencies are actually settled. This gains the insight of architectural thinking without
mistaking a moving diagram for an implementation contract.

**Open process decision:** should we adopt this artifact ladder and, after Adam confirms, create the
provisional architecture-sketch document now while continuing Question 8/Wave 2—explicitly withholding
all `SPECCED` status and build authorization until the relevant closure/reconciliation gates?

#### 10.8.4 Process ruling - sketch closed Wave 1 in the background

Adam asks to begin the architecture work with closed Wave 1 while the live questionnaire continues.
This accepts the artifact ladder with a narrower, safer first slice:

- create `docs/PROCEDURAL-DUNGEON-ARCHITECTURE-SKETCH.md` as a living `DISCOVERY` document;
- sketch **closed Wave 1 only** first, because its ontology and closure audit are stable enough to map;
- preserve Wave 2 and later systems as named future consumers/owners rather than importing unsettled
  answers into the Wave 1 architecture;
- perform the drafting in the background on the existing design branch while the primary discussion
  continues;
- review/reconcile the draft before treating it as accepted architecture;
- do not mark it `SPECCED`, authorize a build, edit code, run CI, change handoff/next steps, or commit it
  independently;
- later append/reconcile each wave only after its closure, except for explicitly provisional interface
  placeholders needed to show a Wave 1 handoff.

This is the first practical use of the architecture sketch as a contradiction detector rather than a
premature implementation contract.

#### 10.8.5 Final ruling - sparse plural groups, claims, and fronts

Adam has confidence in the theoretical design while reserving confidence in implementation. With the
anti-bloat laws and architecture-to-production process made explicit, Question 8 is resolved at the
design level:

- population cohorts, operational/social groups, factions/organizations, and singular actors are
  distinct structures;
- non-overlapping population-owner cohorts count bodies; overlapping membership and claim structures do
  not mint duplicate people;
- a group exists only when collective identity, decision, behavior, routine, resource dependency, claim,
  or state change predicts play better than unrelated actors;
- an independently motivated entity remains singular unless followers, associates, a wider organization,
  or collective behavior are actually licensed or created through events;
- groups arise causally from required operation/load partitions, doctrine, regional branches, history,
  current occupation, ecology, optional allocations, and Spice—not one generic faction-count roll;
- purpose/context-specific dice remain the authorable surface for optional groups, partition, branches,
  deviation roles, and exceptional claimants;
- material occupant groups carry purpose, population source, home/mobility, needs/providers,
  relationships, typed claims, current pressure/front, and relevant event triggers;
- physical, legal, customary/social, resource, religious/doctrinal, political/influence, aspirational,
  and hidden claims compile coherent core/shared/scheduled/tolerated/contested/excluded/infiltrated zones;
- sharing and dependency create leverage, not automatic hostility. Fronts require actual pressure;
- rooms inherit zone defaults; deviations require cause. Events—not rerolls—change claims, posture,
  routes, resources, and zones;
- group posture does not overwrite individual identity, motive, per-PC attitude, or capacity for dissent;
- individuals may hold plural public/hidden memberships, assignment/access, personal loyalties, and
  group-specific stances. Rogue actors, dissidents, infiltrators, defectors, and double agents are
  first-class sparse deviations;
- groups may form, split, merge, or dissolve through explicit events while preserving provenance and
  former relationships;
- relationships remain sparse/causal; claims attach to functions/zones/resources; cohorts remain
  aggregate; updates are event-driven; hierarchy stores shared defaults once; active projection stays
  local; stable groups do not automatically receive clocks/cards;
- implementation confidence remains to be earned through the architecture sketch, production-path trace,
  staged specs, fixtures, and real gates. The theoretical ruling is not evidence that the system is
  already built or cheap to implement.

#### 10.8.6 Future-question assignments seeded by question 8

| Inherited ruling | Future owner |
|---|---|
| Cohort/group/faction/actor distinction with one population owner and plural memberships | Future **NPC, faction, Codex, and population** specs own schemas, candidate/member promotion, migration, reputation semantics, and duplicate-count guards |
| Typed claims compile occupation zones; rooms inherit defaults and deviations need cause | Remaining **Wave 2** owns ecology/profile content; **Waves 3-5** own spatial zone/function realization and evidence; **Wave 8** owns topology/environment mutations |
| Group relations are sparse, causal, non-binary, and resource-aware | Future **faction/social/resource/World Turn** design owns edge vocabularies, event propagation, diplomacy, and catch-up |
| Rogue actors and double agents use plural public/hidden membership plus personal stance | Future **NPC/social/knowledge** design owns reveal, access, loyalty, betrayal, attitude, and false-belief handling; current first-faction readers require compatibility work |
| Group count emerges from causal channels and optional rollers rather than one faction die | Remaining **Wave 2** owns purpose/ecology group distributions and stress reports; **Wave 12** owns headcount conservation, incidence, saturation, and performance gates |
| Stable cohorts do not automatically gain a clock/card; fronts require pressure | **Wave 9** owns strategic-card/front scheduling and active-hand projection; event systems own lifecycle |
| Sparse/event-driven/active-slice laws are definitional | Every future spec/build inherits them; **Wave 12** proves bounded edge growth, event locality, latent/eager equivalence, save growth, and prompt budgets |

### 10.9 Question 9 - how should operating, strained, dormant, and failing sites differ?

In plain English: the room roster describes what a jail, college, inn, mine, temple, or hive is capable of
doing. What changes when it is operating normally, overcrowded, understaffed, seasonal, partly shut down,
starved of supplies, occupied, abandoned, or actively failing—and how do we avoid making every generated
place dysfunctional just to create stories?

Questions 1-8 now provide purpose obligations, flows, light simulation, realization forms, repeated
assemblies, protected Spice, population/capacity, cast/occupant groups, claims, and regional dependency.
The remaining ecology question is how **current operational state** modifies those stable structures.

Three distinctions must survive:

```text
designed capability: what the architecture/institution/ecology was made and equipped to do
current availability/performance: whether and how well the capability works now
current demand/load: how much pressure is being placed upon it
```

A kitchen can exist and be usable but currently closed; work but be overloaded; lack fuel; be occupied
by another group; operate through a substitute process; or have been permanently repurposed. Those are
different truths with different evidence and recovery.

##### Rejected extremes

- **one universal site-health roll:** fast but incoherent. “Failing” does not say whether custody,
  heat, food, sanitation, teaching, defense, drainage, or brood renewal failed, nor what caused it;
- **independent condition roll for every room/function:** detailed but makes every large site a heap of
  unrelated failures, manufactures constant crises, and breaks the healthy-by-construction law;
- **all operating or all abandoned:** legible but erases partial use, seasonal dormancy, adaptive
  substitutes, occupation, and the rich middle where play lives.

#### Recommended capability-state and dependency-cause model

Each material capability/flow can occupy a typed current state:

```text
available / normal
strained / near threshold
degraded / reduced coverage or quality
substituted / supplied by another method
dormant / seasonal / intentionally offline
blocked / denied by access, claim, or occupation
failed / not performing its obligation
repurposed / no longer serving the original capability
destroyed / physically incapable without rebuilding
```

These are an authoring vocabulary, not necessarily the final enum. A site-level summary is derived from
the states of important capabilities; it does not overwrite them.

Every non-normal state records:

- affected capability/flow and scope;
- cause/root/event and provenance;
- onset/duration or seasonal schedule;
- remaining capacity/coverage;
- substitute, buffer, external provider, or competent response;
- dependent groups/functions/zones;
- sensory/operational evidence and player handles;
- consequences at thresholds;
- repair, recovery, adaptation, or terminal condition.

##### State propagates through dependencies, not random neighboring failures

```text
cause/event
  -> directly affected provider/route/storage/process
  -> reduced availability/capacity
  -> dependents compare demand against buffers/substitutes
  -> only crossed thresholds change state or create consequences
  -> response/recovery can arrest or reverse propagation
```

A blocked food shipment does not instantly make every prisoner starving. Stores, rationing, alternate
suppliers, reduced menus, gardens, magic, theft, policy, and current population determine whether and
when thresholds are crossed. The current Question 2 protections—provenance, buffers, competent response,
last-known-good data, and authored recovery—remain mandatory.

##### Examples

- **Hamlet jail:** tavern meals are temporarily unavailable. The sheriff buys cold provisions, reducing
  quality but maintaining custody. Only a longer interruption or surge load creates hunger, conflict, or
  transfer pressure.
- **City prison:** kitchen capacity remains normal but one cellblock exceeds design load; sanitation is
  strained there, visitation is suspended, and a contractor offers a substitute. The entire prison is
  not labeled simply “failing.”
- **Residential college:** dorms are sound, enrollment is low, one house is dormant, and its rooms have
  been loaned to visiting scholars. Current low demand creates vacancy/repurposing rather than failure.
- **Inn:** ordinary rooms operate, a damaged wing is blocked, and festival transients exceed capacity;
  locals rent spare rooms through an informal provider network.
- **Mine:** pumping fails, making deeper extraction dormant while upper processing and storage continue;
  water rises on an event clock and creates a recoverable strategic problem.
- **Living habitat:** food flow is seasonally low and brood production intentionally slows; this is
  healthy dormancy. A severed symbiotic nutrient route is degradation with a causal response.

##### State should be generated causally

Ordinary sites begin healthy/viable according to purpose and context. Non-normal states enter through:

- established lore or premise;
- current history/transformation/occupation rolls;
- population-capacity mismatch admitted in Question 6;
- regional dependency or route state;
- group claim/front effects;
- ecological season/lifecycle;
- protected problem/Spice/root opportunities;
- player action or later world events.

A site may still be abandoned, ruined, occupied, or catastrophically failing when that is its rolled or
authored premise. “Healthy by construction” means no unexplained systemic failure and no ubiquitous
crisis bug; it does not mean every place is pleasant or currently successful.

##### Roster and space remain stable

Current state changes use, availability, staffing, access, evidence, and consequence. It does not erase
the stable semantic room/assembly/topology plan. A shut kitchen remains a kitchen; a flooded mine level
remains connected; an abandoned dorm retains its child identities. Permanent rebuilding/repurposing
changes canonical function through explicit events and migrations rather than a status flag silently
rewriting history.

##### Recommendation

Track current state per material capability/flow with explicit cause, remaining coverage, buffers,
dependents, evidence, thresholds, and recovery. Derive site summaries; never roll one global health label
as authority. Generate non-normal states from history, pressure, season, occupation, dependency, Spice,
or events, and preserve normal competent operation as the common baseline.

**Open decision:** should this capability-level state model govern operational condition, including the
rules that site-wide health is derived, partial/dormant/substituted operation is first-class, and every
failure must have cause, evidence, consequences, and a recovery or terminal path?

#### 10.9.1 Final ruling - capability-level operational state

Adam accepts the recommendation. Question 9 is resolved at the design level:

- designed capability, current availability/performance, and current demand/load are separate truths;
- material capabilities and flows carry their own current states; a site-wide condition is a derived
  summary and may not erase a mixed operating picture;
- normal, strained, degraded, substituted, dormant/seasonal/offline, blocked/denied, failed,
  repurposed, and destroyed form the provisional authoring vocabulary. Later schema work may refine the
  names without collapsing their semantic differences;
- partial operation, intentional dormancy, and substitute provision are first-class states rather than
  being mislabeled as generic failure;
- ordinary generated sites begin viable and competently operated for their context. Non-normal states
  require causal license from premise, history, transformation, occupation, capacity mismatch,
  dependency, group pressure, ecology/season, protected Spice, player action, or a later world event;
- every non-normal state identifies its affected scope, cause/provenance, remaining coverage, buffers or
  substitutes, dependents, evidence/player handles, threshold consequences, and recovery/adaptation or
  terminal path;
- dependency effects propagate only when demand crosses remaining capacity, buffer, or substitute
  thresholds. One outage does not randomly make adjacent functions fail;
- current state changes use, access, staffing, performance, evidence, and consequences without silently
  deleting the stable roster, semantic rooms, assemblies, topology, or history;
- permanent repurposing, destruction, rebuilding, and restoration occur through explicit events and
  preserve provenance.

#### 10.9.2 Future-question assignments seeded by question 9

| Inherited ruling | Future owner |
|---|---|
| Capability state is distinct from designed capacity and current load | Remaining **Wave 2** owns purpose/ecology state recipes and incidence; future settlement/resource simulation owns cross-site pressure |
| Site health is derived from material capability states | Future **DM/Codex/UI** work owns bounded summaries; **Wave 12** owns schema, persistence, migration, and mixed-state invariants |
| Partial, substituted, dormant, blocked, failed, repurposed, and destroyed states remain distinct | **Waves 3-5** own their spatial/material evidence; **Wave 8** owns state-changing events and physical consequences |
| Failure needs causal provenance, thresholds, evidence, and recovery or terminal path | **Wave 9** owns strategic pressure/card projection; **Wave 12** owns provenance, last-known-good behavior, soak tests, and crisis-incidence gates |
| Ordinary sites are healthy by construction and dependency failures propagate through buffers and thresholds | Remaining **Wave 2** authors buffers/substitutes and stress cases; future **World Turn/economy** work owns aggregate propagation and catch-up |

No implementation claim follows from this ruling. Exact enums, formulas, thresholds, incidence rates,
and persistence shapes wait for the architecture/specification and statistical acceptance passes.

### 10.10 Question 10 - how should places live through hours, shifts, seasons, and cycles?

In plain English: should a jail, college, inn, mine, temple, contested grove, or living hive appear frozen
in one arrangement whenever the party arrives, or should its people and functions follow recognizable
rhythms? If they do, how can Genesis produce the feeling of a lived-in schedule without continuously
simulating the exact location and calendar of every person in a city?

Question 9 says a capability can be available, strained, dormant, substituted, or failed. Time now has
to matter: a kitchen that is closed between meals is not dormant in the same sense as a college house
closed for the season, and an absent night deputy is different from a destroyed guard post.

Three models are available:

1. **Static occupancy:** populate the site once and leave everybody in their assigned rooms. This is
   cheap and predictable, but produces innkeepers who never sleep, miners who never change shifts,
   prisoners who never leave cells, and habitats with no feeding or resting cycle.
2. **Continuous individual schedules:** give every person exact work, travel, meal, leisure, and sleep
   appointments and simulate their movement at all times. This can look impressive at small scale but
   becomes expensive and brittle in cities, mints unnecessary detail, makes catch-up difficult, and
   turns minor scheduling errors into empty institutions.
3. **Layered cadence, coverage slots, and active projection:** author the site's meaningful rhythms at
   group/function scale, then cast and localize only the people and movements relevant to the active
   place and time. Named individuals receive exact schedule commitments only when their identity or a
   player promise makes that precision matter.

#### Recommended cadence model

Each purpose/ecology profile can declare a small number of meaningful temporal patterns:

- open/service windows and off-hours behavior;
- work, watch, teaching, worship, meal, intake, visitation, rest, migration, or maintenance cycles;
- shift or coverage requirements for critical capabilities;
- weekday/market-day/festival distinctions where the setting supports them;
- seasonal, tidal, lunar, weather, breeding, feeding, bloom, molt, or realm-specific cycles;
- transition periods such as shift change, closing, muster, evacuation, or communal meals;
- exceptions created by Question 9 operational states, group fronts, alarms, emergencies, or events.

The canonical schedule is therefore mostly a pattern of **activity and coverage demand**, not a giant
calendar full of pre-minted NPC appointments:

```text
site/group cadence
  -> current time/season/event window
  -> required active capabilities and role/coverage slots
  -> expected occupied zones, routes, and transition activity
  -> cast established/local/latent people into relevant slots
  -> project only active named movements and player-facing evidence
```

A coverage slot might say “one custody authority reachable overnight,” “two active mine crews below,”
or “one healer on call.” It does not require the engine to invent and pathfind every deputy, miner, or
novice while the party is elsewhere. When the party observes or interacts with the holder, the casting
rules from Question 7 bind the slot to an existing appropriate person where possible and harden the
result. Important named NPCs can carry sparse commitments—meeting the party at dawn, teaching every
third day, guarding the east gate tonight—without upgrading the entire population into a calendar sim.

#### Concrete examples

- **Hamlet jail:** the sheriff handles daytime business; a deputy or reachable authority covers nights;
  tavern meals arrive at established times; prisoners may have a yard or cleaning period. At 2 a.m. the
  office can be dark without custody ceasing to exist. An alarm temporarily replaces the normal rhythm.
- **City prison:** cellblocks use staggered watches, meals, exercise, visitation, hearings, laundry, and
  maintenance. Genesis projects the relevant block and transition rather than moving every prisoner and
  guard in the facility.
- **Residential college:** classes, meals, study, worship, society meetings, dormitory activity, and
  vacations create different populations by hour and season. A student established in the library is
  still the same person when later cast into their dormitory context.
- **Inn:** arrivals build toward evening, food service peaks around meals, rooms turn over after
  departures, and a reduced night watch remains. A festival changes the load and adds overflow providers
  without rewriting the ordinary schedule.
- **Mine:** crews overlap at shift change, lifts and sorting peak around haul windows, maintenance may
  occupy planned downtime, and a pump failure reroutes labor toward emergency coverage.
- **Contested grove:** refugees and druids can share space while keeping different meal, worship,
  patrol, council, and watch rhythms. Their overlap creates natural meetings or friction without a
  universal hostility clock.
- **Living habitat:** inhabitants follow feeding, rest, hunting, incubation, migration, or defensive
  cycles. The grammar describes biological/ecological cadence rather than pretending the nest keeps
  office hours.

#### Guardrails against schedule bloat and player frustration

- simulate stable distant cadence by lazy catch-up, not per-minute updates;
- keep aggregate cohorts and coverage slots until observation or consequence requires named people;
- compute candidate zones/routes at meaningful transitions, not continuous exact walking;
- persist observed identities, promises, absences, and consequential movements; regenerate no hardened
  fact merely because the party re-enters;
- let operational problems modify the pattern causally instead of independently deleting scheduled
  workers;
- provide waiting, alternate contacts, emergency access, messages, forced entry, or other contextual
  options where off-hours would otherwise create a meaningless hard lock;
- use schedule changes as information and opportunity—quiet corridors, crowded meals, a missing guard,
  a ritual underway—not as constant bookkeeping demanded from the player;
- preserve uncertainty: the player/DM can know the usual pattern without receiving omniscient exact
  coordinates for every person.

#### Recommendation

Adopt the layered cadence model: author meaningful site/group/activity rhythms and coverage needs, derive
the current operating window from time/season/events, and project/cast exact people only inside the
active slice. Give named NPCs sparse persistent commitments when story, contract, observation, or
individual routine justifies them. This should deliver the lived-world value of scheduling at a small
fraction of a full-agent simulation's runtime, save, authoring, and failure cost.

**Open decision:** should Wave 2 adopt layered cadence and coverage slots as the authority for temporal
ecology, keeping most populations aggregate until active projection while preserving sparse exact
schedules for important named people and commitments?

#### 10.10.1 Final ruling - layered cadence must produce usable handles

Adam accepts the recommendation and emphasizes the experiential payoff: if the gears can turn without
breaking, the DM no longer has to improvise false continuity and the players gain many real handles for
interacting with the world. Question 10 is resolved at the design level:

- purpose/ecology profiles author meaningful rhythms, transition periods, and capability-coverage
  requirements rather than continuous schedules for every person;
- current time, season, realm cycle, operational state, group pressure, alarms, and recorded events
  select the active cadence window;
- population cohorts and role/coverage slots remain aggregate until observation, consequence, or active
  projection requires exact people and locations;
- the casting model binds active slots to established/local/latent people before minting replacements;
  observed identities, promises, meaningful absences, and consequential movements harden persistently;
- important named people may carry sparse exact routines and commitments without upgrading the whole
  population into full-agent calendar simulation;
- natural and living sites receive biological, ecological, tidal, seasonal, weather, realm, and
  lifecycle cadence grammars rather than anthropomorphic office hours;
- cadence is resolved at meaningful windows and transitions. Stable distant activity uses deterministic
  lazy catch-up, not per-minute movement or all-NPC pathfinding;
- off-hours and absences create information, social friction, risk, infiltration, waiting, alternate
  contacts, messages, emergency access, or other contextual choices rather than arbitrary dead ends;
- schedule detail is justified only when it changes evidence, access, occupancy, service, relationship,
  vulnerability, opportunity, or consequence. Decorative calendars with no playable effect do not earn
  their runtime, save, authoring, or DM-context cost;
- the engine owns the causal schedule and its changes; the DM performs and interprets that truth rather
  than inventing who should be present, why a routine changed, or whether the change persists;
- implementation success must be proven on the production path. A schedule helper or paper architecture
  does not satisfy this promise unless a real generated fixture persists, projects, mutates, and exposes
  the intended player handles without simulation bloat or continuity breaks.

#### 10.10.2 Future-question assignments seeded by question 10

| Inherited ruling | Future owner |
|---|---|
| Purpose/ecology cadence plus coverage slots governs ordinary temporal activity | Remaining **Wave 2** authors cadence families, windows, and exceptions; future NPC/place systems own final casting integration |
| Aggregate populations become exact only in the active slice; established people and commitments persist | **Wave 9** owns bounded DM projection; **Wave 12** owns deterministic catch-up, persistence, revisit, and no-duplicate-cast gates |
| Schedule changes must create playable evidence, access, service, relationship, or consequence | Remaining **Wave 2** and Question 11 own semantic flow/handle eligibility; **Waves 3-5** own spatial routes, fixtures, and visible traces |
| Operational state and recorded events causally override ordinary cadence | **Wave 8** owns mutations; future World Turn/time systems own event advancement and catch-up |
| Natural/living sites use ecological and realm-specific cycles through shared interfaces | Remaining **Wave 2** owns ecological cadence content; realm packages extend the vocabulary without generator forks |
| Exact schedules remain sparse and off-hours cannot create meaningless mandatory lockouts | Future **interaction/NPC/quest** design owns waiting, alternate contact, urgency, and appointment mechanics; **Wave 12** owns lockout/continuity stress tests |

#### 10.10.3 Process checkpoint - closed Wave 1 architecture sketch

The requested background architecture pass has produced
`docs/PROCEDURAL-DUNGEON-ARCHITECTURE-SKETCH.md`. The primary session reviewed all 949 lines before
committing it. It remains `type: design-study`, `status: DISCOVERY`, closed-Wave-1-only,
non-`SPECCED`, and non-build-authorizing. It maps authority, conceptual ownership, current-code seams,
invariants, stress fixtures, future-wave handoffs, and promise-to-production evidence without freezing
Wave 2's unsettled schemas, algorithms, distributions, or performance budgets.


<!-- END VERBATIM MIGRATION: original lines 5247-7269 -->
