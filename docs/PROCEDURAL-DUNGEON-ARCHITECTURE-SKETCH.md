---
type: design-study
status: DISCOVERY
created: 2026-07-19
updated: 2026-07-19
related:
  - "[[PROCEDURAL-DUNGEON-DIRECTION]]"
  - "[[PROCEDURAL-DUNGEON-RESEARCH]]"
  - "[[PROCEDURAL-DUNGEON-ENGINE-CROSSWALK]]"
  - "[[DUNGEON-GRAPH]]"
  - "[[ROOM-GRAMMAR]]"
---

# Procedural Dungeon Architecture Sketch

## 0. Status and authority

This is a living architecture sketch for **closed Wave 1: Dungeon Function, History, and Strange
Compatibility**, including the explicit skeptical clarifications that amend its universal wording. It
translates the accepted Wave 1 ontology into a compact map of conceptual records, ownership, flow,
invariants, current-code seams, and future-wave handoffs.

This document is deliberately:

- `DISCOVERY`, not `SPECCED`;
- illustrative rather than a frozen schema;
- a contradiction detector, not an implementation plan;
- non-build-authorizing;
- subordinate to `PROCEDURAL-DUNGEON-DIRECTION.md` when this summary is incomplete or ambiguous.

Nothing here authorizes code changes, table decomposition, compiler work, migration, renderer changes,
or a build-unit queue. Record names, field names, diagrams, and boundaries are provisional handles.
Wave 2 and later systems appear only where Wave 1 assigned them a future responsibility. Their unsettled
design must not be imported backward as if it were closed architecture.

The Wave 1 source boundary is `PROCEDURAL-DUNGEON-DIRECTION.md` sections 6-9, especially sections
8.1-8.21.1. The research and engine crosswalk supply implementation evidence, not additional rulings.

## 1. Architectural thesis

Wave 1 establishes a persistent semantic site before it establishes a visual room.

```text
authoritative world and premise facts
  -> definite site lineage and domain relationships
  -> intentional purpose/construction identity OR natural/living/anomalous origin grammar
  -> complete operating-model obligations
  -> coupled site profiles and protected variation
  -> sequential history and inherited present use
  -> current occupation zones and sparse active fronts
  -> scoped Spice roots, discoveries, promises, and knowledge boundaries
  -> fixed semantic hierarchy and mathematical connection topology for ordinary finite sites
  -> versioned topology laws and permanently committed frontiers for licensed unbounded domains
  -> deterministic latent detail inside already-fixed invariants
  -> later-wave spatial, gameplay, DM, and visual projections
```

The central boundary is:

> The engine owns persistent causal truth, semantic obligations, topology, provenance, and legal
> commitments. Later compilers own realization. The DM owns performance, interpretation, NPC agency,
> and licensed strategic timing; it does not repair missing architecture or invent causal continuity
> from orphan rolls.

This semantic core may eventually serve a bounded navigable site, a distributed institution linked
across domains, an entity-site such as a ship or living fortress, or the bounded materialization window
of a canonically unbounded domain. It does not collapse environment families. Wilderness walks remain
terrain journeys; urban walks remain movement through districts and institutions; either may enter a
bounded site when detailed navigation matters.

Four concepts remain separate even when ordinary cases compile into one compact bundle: **domain or
substrate** owns space and material extent; **site identity and lineage** own canonical continuity;
**institution, ecology, and occupation** own purpose/imperative and current operation; and the
**materialization window** owns only the finite active semantic, spatial, DM, and render slice.

## 2. Commitment and authority model

### 2.1 Authority order

Higher-authority truth cannot be rerolled to rescue a lower-authority choice:

```text
established world canon
  -> explicit place or adventure premise
  -> commissioner/creator/faction goal
  -> strong implication from established facts
  -> seeded editable roller result
  -> derived consequence
  -> compiler reconciliation within declared tolerances
  -> display or projection
```

If two claims conflict, the lower-authority claim yields or becomes an explicit historical,
occupational, mistaken-belief, or causal contradiction. The system never silently makes the latest
roll authoritative merely because it ran last.

### 2.2 Truth states

Wave 1 needs at least these conceptual hardness classes:

| State | Meaning |
|---|---|
| Established canon | Lore, premise, observed fact, or accepted promise that cannot be rerolled |
| Seeded canon | Rolled and stored site truth fixed before exploration |
| Deterministic latent | Stable id, seed, invariants, and legal expansion space; details not yet expanded |
| Soft assignment | Unobserved low-authority choice that may reconcile within stored constraints |
| Observed/acted-upon canon | A fact the party perceived, mapped, used, or relied upon; changes only by event |
| Presentation | DM/UI/render wording or view that exposes only licensed truth |

“Latent” means unresolved detail, never nonexistent structure. It cannot authorize a future reroll that
changes established adjacency, capacity, clues, identities, promises, or causes.

### 2.3 Provenance envelope

Every rolled, derived, promoted, or reconciled fact needs inspectable provenance. An illustrative
provenance envelope may retain:

```text
source authority and source id
table id, row/result, Spice band, modifiers, and seed
context facts used for eligibility or classification
derivation or reconciliation rule
parent cause/root and scope
superseded lower-authority alternatives, where consequential
observation/contact lock state
```

Human-readable rollers remain the editable source. A compiler may normalize them, but generated runtime
records are not the ordinary authoring surface. A modder must be able to trace an outcome back to its
table, result, context, and adjustment.

## 3. Conceptual ontology and record ownership

The names below are **illustrative labels**, not approved object names, JSON fields, APIs, or module
boundaries.

| Conceptual record | Owns | Does not own | Primary producer | Future consumers |
|---|---|---|---|---|
| `DomainSubstrate` | Space, topology, physics, extent, mobility, material form, and explicit links to other domains | Site continuity or institutional ownership | World/site generation + topology | Spatial compilers, events, renderer |
| `SiteIdentity` | Stable canonical identity, continuity, predecessor/successor relationships, linked domain facets | Automatic equivalence with one building, institution, faction, or current claimant | Site/world generation + lineage events | All site stages |
| `SiteLineage` | Ordered origin episodes and, only when required, a small source/copy/graft/split/merge graph | Assumption that every origin was intentional construction; silent current-use overwrite | Canon/premise/origin-family rollers + history | Roster, history, discovery, identity projection |
| `PurposeLineage` | Intended purposes and subordinate purposes belonging to intentional or designated episodes | Natural origin, behavioral imperative, ecological role, current use, or belief | Intentional construction/designation episodes | Roster, history, room programs |
| `ConstructionIdentity` | For intentional episodes: commissioner, original operator, doctrine, design tradition, intended users/scale, substrate, era, consequential workforce | Universal origin grammar; present occupants or renderer repair | Intentional construction-context pass | Operating model, architecture, history |
| `InstitutionEcologyOccupation` | Purpose or imperative, operators/populations, operating model, current use, and typed overlapping claims | Domain identity or automatic site-lineage merger | Purpose/ecology/occupation passes | Roster, fronts, resources, current projection |
| `MaterializationWindow` | Finite active semantic, spatial, DM, and render slice with honest frontiers | Canonical site extent, lineage, or permission to reroll cold truth | Active-slice planner | DM, UI, renderer, persistence cache |
| `OperatingModel` | Required capabilities, operators, population/throughput, resources, procedures, dependencies, operating state | A rigid one-room-per-capability list | Purpose profile | Wave 2 roster and ecology |
| `SiteProfileBundle` | Structural scope, operational load, spatial envelope, accommodation domains | Topology, danger, history, discovery, physics, or materialization hidden inside “size” | Context + purpose + rollers | Roster, topology, room and scale compilers |
| `HistorySequence` | Ordered transformations with agent, action, affected functions, evidence, consequence | Present use silently replacing original purpose | History rollers and established events | Current occupation, discovery, knowledge |
| `ResourceEcology` | Needs, production, storage, distribution, consumption, disposal, external dependencies | Continuous per-person domestic simulation | Operating model + occupancy relationship | Wave 2 ecology, Wave 8 mutation |
| `SemanticSitePlan` | Stable site/zone/room/assembly hierarchy, functional homes, connection requirements | Fine placement, visual transforms, eagerly populated minor details | Semantic planning pass | Waves 3-5 compilers |
| `RepeatedAssembly` | Shared construction/service truth, stable child ids, controlled variance | Fully independent heavyweight stories for every child | Roster + semantic planner | Search, discovery, room materialization |
| `CausalSpiceEvent` | Root cause, band, scope, license, affected records, manifestations, consequences, handles | A global site-temperature ceiling or floor | Eligible Commitment/root roll or promotion | Discoveries, history, rooms, DM cards |
| `DiscoveryOpportunity` | Stable target, tell, methods/gates, cost, attached payoff or root | A guaranteed player-facing checklist or independent Major secret | Room/assembly/site discovery allocation | Search, knowledge, DM projection |
| `StoryPromise` | Minimal canonical stub, invariants, attachments, fulfillment obligation, attention state | A fully generated unused network | Unattached discovery, contract, or canonical mention | DM scheduler and lazy materialization |
| `OccupationZone` | Current occupant defaults and typed overlapping claims over a coherent region | Independent room-by-room occupant rolls | Present-occupation pass | Rooms, fronts, access, current use |
| `OccupationFront` | Sparse pressure, triggers, transitions, affected claims/zones, evidence | Continuous group turns or inevitable escalation | Licensed pressure/event | World ledger, DM scheduler |
| `KnowledgeRecord` | Canon reference, observations, beliefs, witnesses, confidence, holder/scope, sharing policy | Hidden canon leaking into party output | Observation, interpretation, communication | DM digest, journal, UI, action eligibility |
| `NarrativeCard` | Priority, eligibility, service horizon, causal role, legal homes, deferral reason | Permission to overwrite rolled room identity | Promise/contract/root/event systems | Wave 9 scheduler |
| `AccessDepthProfile` | Effective route/access cost used for noisy challenge/reward expectation | A universal narrative chronology or automatic Spice ramp | Topology + barriers/access state | Wave 7 difficulty/reward planning |

Some records may later combine or split. The ownership distinction matters more than the names.

## 4. Lineage, purpose, construction, and operating-model layering

### 4.1 Site lineage and intentional purpose

Every site has definite lineage. A lineage episode may be intentional construction; natural formation;
living growth; emergent anomaly; collective or vernacular accretion; unintended anthropogenic byproduct;
automated or self-building formation; social designation; graft/composite/copy/relocation; mobile or
temporary embodiment; split/merge continuity; player creation; or a rare canonically plural/recursive
origin. Lineage is sequential by default and becomes a small provenance graph only when sources, copies,
grafts, splits, merges, or recursive formation require it.

An intentionally constructed site normally has one dominant original purpose and zero to two direct
subordinate purposes. The zero-to-two count is a default anti-purpose-soup guardrail, not a universal
ontology limit on child sites, historical occupations, Breaches, or campaign-created structures.
Natural/living/anomalous families use their own origin grammar rather than receiving a fake builder.

Keep intended purpose, behavioral imperative, ecological role, social designation, current use, and
belief separate. A later designation may add an institution to a natural cave without rewriting how the
cave formed. Multiple institutions may share and contest one domain without merging site identities or
purpose lineages.

Functions are classified causally:

| Class | Architectural meaning |
|---|---|
| Core | Guaranteed capability without which the original purpose is not a working instance |
| Supporting | Coverage required in proportion to scale, occupancy, supply, and doctrine |
| Compatible | Plausible weighted capacity, not guaranteed |
| Exceptional | Requires a stored doctrine, culture, history, current-use, subordinate-purpose, or Spice license |
| Conflicting | Excluded from the original roster absent a recorded transformation or current-use overlay |

Physical and canonical impossibility remain hard refusals. “Unusual for a prison” is not the same as
“cannot exist.” Context shifts probability and band classification rather than creating ordinary
purpose-only blacklists.

Four causal categories must not collapse:

- a **supporting function** mainly lets another purpose operate;
- a **subordinate purpose** has an independently meaningful goal/commission, beneficiary or operator,
  recognizable mini-operating model, and bounded allocation inside the parent envelope;
- a **current-use overlay** describes what later occupants do with inherited architecture;
- **secret** describes reveal/access, never the space's underlying purpose.

### 4.2 Construction identity

Construction separates:

```text
commissioner
+ original operator
+ institutional doctrine
+ design tradition
+ intended occupants and accommodation domains
+ substrate
+ construction era
+ workforce when it leaves consequential evidence
```

Original operator determines functional need. Doctrine changes how the institution expresses that
need. Design tradition changes architectural language. Intended occupants establish accommodation
domains. Workforce is retained only when forced labor, sabotage, mixed craft, unfinished work, or a
similar fact matters.

Mixed-scale truth begins here. A dragon vault maintained by kobolds may contain distinct dragon and
kobold domains with explicit transitions. It is not repaired later by scaling the renderer.

### 4.3 Complete operating model

A purpose produces a complete operating model, not a checklist of room nouns:

```text
required spaces/capacities
+ essential operator roles or processes
+ intended population and throughput
+ internal resources, systems, and procedures
+ external dependencies
+ active, failing, abandoned, or repurposed state
```

A guaranteed capability may realize later as a dedicated room, a combined room, a repeated assembly, a
fixture/procedure, a distributed system, or an honest external service. Wave 1 protects the semantic
capability and its causal relationships; Wave 2 owns the exact allocation vocabulary and curves.

Protected discretionary and Spice capacity is part of the site requirement, not leftover space after
function. Even the smallest purposeful site targets a clear majority chance of at least one added
spatial variation, and every discretionary space contains at least one juicy player handle. “Juicy” may
be Grounded and personal; it need not be demonic, hostile, combat-bearing, treasure-bearing, or Mythic.

### 4.4 Resource ecology and occupancy relationship

“Kitchen” is a realization of needs, not the upstream need itself. Resource ecology may include food,
water, rest, air/heat, waste, population renewal, material inputs, storage, preparation, distribution,
consumption, disposal, and external supply. Unusual creatures may replace these with their own coherent
requirements.

The site's occupancy relationship filters support expectations:

- externally supplied;
- transient;
- predatory;
- self-sustaining;
- dormant;
- failing.

Wave 1 requires persistent causal dependencies and player handles. It does not decide Wave 2's exact
light-simulation model or permit a universal continuous economy.

## 5. Time-indexed generation and history

### 5.1 Context cascade

The generation order is temporal, not a bag of simultaneous modifiers. Steps about commissioner,
construction doctrine, and intended purpose apply only when the lineage episode is intentional:

```text
1. established canon and premise
2. origin-time region, settlement, realm influence, law, culture, wealth, materials, technology, magic,
   ecology, and physics
3. lineage mechanism; commissioner, operator, doctrine, design tradition, and intended scale only when
   canonically applicable
4. purpose, imperative, ecological role, profiles, resource ecology, and guaranteed operating model
5. protected original discretionary/Spice allocation
6. zero to three sequential historical transformations
7. present context, occupants, condition, and relationship to inherited architecture
8. current use, staffing, supply, restrictions, secrets, and unresolved consequences
```

Present context cannot retroactively rewrite original formation or construction. A later designation,
retrofit, occupation, or transformation must explain the difference. The same portal-cell technique may
be ordinary in a mage colony and Mythic in a mundane hamlet because context changes
eligibility/classification, not because the fact has no cause.

### 5.2 Historical transformations

Relative age and instability jointly produce zero to three consequential transformations. Age alone
does not guarantee change.

Each transformation owns:

```text
agent
+ action
+ affected functions/structure
+ surviving evidence
+ unresolved consequence
+ at least one potential player handle
+ one causal Spice band for the event
```

Sequential application matters. Later transformations consume the surviving result of earlier ones.
Their manifestations express the transformation's one causal result instead of independently rolling
new high-band causes in every affected room.

### 5.3 Present occupation and belief

Current occupants relate to inherited architecture by continuing, restoring, adapting, squatting,
exploiting, defacing, overgrowing, or contesting it. Ordinary rooms inherit a zone-level relationship;
local deviation needs a cause.

Store original function, current function, and believed function separately. Occupants may sincerely
misunderstand inherited architecture. That misunderstanding is valid comedy, horror, evidence, and
play—not an inconsistency for the engine to “correct.” A room may have no present use while retaining a
definite original function.

## 6. Profile separation and realm scalability

### 6.1 Current core profiles

Wave 1's coupled and extensible core has four presently sufficient concerns:

1. **Structural/exploration scope** — canonical functional domains, enterable spaces, connections,
   zones, levels, and discovery surfaces.
2. **Operational load** — capacity, throughput, staffing, supply, storage, support, and duty-cycle
   burden; potentially a typed vector rather than one scalar.
3. **Spatial envelope** — footprint, volume, travel distance, and vertical extent, possibly constrained
   by a shell, hull, geology, city lot, or realm.
4. **Accommodation domains** — the interface needs of bodies, vehicles, cargo, machinery, portals, and
   furniture; several domains and explicit transitions may coexist.

This is not a sacred permanent count. Add a new core profile only if matching sites can differ on the
candidate fact, the difference changes at least two engine/player decisions, existing facts cannot
derive it reliably, and it must persist or carry provenance.

### 6.2 Separately named first-class profiles

Do not hide these inside “size”:

- topology;
- current state;
- challenge/resource pressure;
- temporal depth;
- discovery/narrative density;
- realm/physics;
- realization resolution.

These profiles can constrain one another through declared rules while retaining separate authority.
A Mythic realm law may alter geometry; collapse may reduce usable capacity; neither turns history,
physics, danger, or engine detail into a synonym for “large.”

Canonical scope and realization resolution are distinct. A hundred cells can exist canonically while
most child detail remains sparse and latent.

A friendly headline size may be derived for UI labels and table routing. It is never the hidden source
of truth from which every profile is reconstructed.

The product constraint behind this separation is explicit: prefer TTRPG freedom, procedural breadth,
modifiability, and replayability over unaffordable BG3-style literal geometric accuracy. A future
top-down/grid/graph presentation may serve that priority, but Wave 10—not this sketch—decides the
projection. Simplification is not permission to abandon environmental beauty, lighting, materials, or
useful existing sprites.

### 6.3 Realm-extension law

Purpose, obligation, hierarchy, profile, constraint, and provenance vocabularies stay realm-neutral.
A realm supplies registered data, vocabulary, assets, modifiers, laws, and solver constraints through
shared interfaces. It does not fork the generator with scattered realm-conditionals. A Breach is a
typed edge between domains; transformations in size or physics belong on the domain/edge rather than
mutating global assumptions.

## 7. Semantic hierarchy, repetition, and commitment frontier

### 7.1 Canonical identity, domains, and hierarchy

```text
site identity and lineage
  -> one or more domains/substrates connected by typed relationships
     -> overlapping institutions/ecologies/occupations and their claims
     -> zones / levels / subordinate domains
        -> rooms / functional domains / repeated assemblies
           -> stable enterable children / inspection surfaces
              -> deterministically latent details and occupants
```

Hierarchical storage prevents facade architecture without forcing every repeated child to become a
heavyweight independent story record. Distributed sites use explicit links rather than fake continuous
geometry. Entity-sites use linked entity and site facets over one canonical identity. Identity may
outlive material fabric; formation, movement, destruction, copy, split, merge, and continuity remain
event-owned.

### 7.2 Repeated assemblies

A repeated assembly owns shared construction, infrastructure, circulation, common fixtures, support
systems, group history/state, and a controlled child-variance program. Each enterable child has a stable
identity and seed.

Child surface states may include quiet/empty, environmental trace, resource/cache, occupied/receptive,
occupied/refusing, hazard/obstacle, and secret/story-bearing. Most children may be quiet. They retain a
lightweight discovery opportunity without each receiving a full independent Commitment roll.

Search uses three levels:

1. automatic room read for obvious function, occupants, exits, hazards, resources, and salient tells;
2. focused inspection of a named target, suspicion, method, or question;
3. systematic sweep of a room or repeated assembly, aggregating interchangeable children and clutter.

A systematic sweep automatically covers routine information its method can reveal. Concealed, trapped,
encoded, magical, socially withheld, or otherwise gated content still requires its method, capability,
access, relationship, or roll. Repeating the same wording does not reroll stable opportunities.

The engine keeps the structured inspection list behind the screen. The DM narrates perceptible tells,
routine negatives, and free-form responses; accessibility options may expose clearer prompts without
turning the site into an icon-clearing checklist.

### 7.3 Fixed before exploration

Before an ordinary finite bounded site becomes explorable, seeded canon includes:

- site id, seed, context, domain relationships, site lineage, applicable purpose/construction episodes,
  and provenance;
- operating-model obligations and site/profile allocations;
- history, resource ecology, current occupation zones/fronts, and root Spice events;
- major secret/promise networks and required commitments;
- stable ids for zones, levels, rooms, assemblies, and every traversable or discoverable edge;
- complete mathematical doors/connections topology, including typed ordinary and secret edges;
- semantic homes and invariants sufficient to prove that every required function, route, repeated
  child, protected variation, and critical card can exist legally.

Exact geometry may remain latent only if later compilation cannot change connection, capacity, semantic
home, clue, promise, or access invariants. A secret door can be hidden from the party while already
existing in the graph.

A canonically unbounded domain is a narrow exception, never the default for missing scope data. Prefer a
realm/journey representation containing ordinary bounded sites. When canon truly requires indefinite
local continuation, stable-frontier generation fixes versioned topology grammar, laws, invariants, and
frontier interfaces before play, then permanently canonizes every committed node and edge. It cannot
reroll explored space or become arbitrary door-by-door DM improvisation. Its materialization window is
finite without pretending to be its canonical extent.

### 7.4 Materialized on approach or attention

Within fixed invariants, later deterministic expansion may select:

- fine geometry allowed by the stored semantic program;
- dressing and sensory variants;
- local inspection tells;
- exact lightweight loot inside allocated budgets;
- deeper NPC detail beyond already fixed identity/role/relationship invariants.

Approach-time expansion is materialization, not a new unconstrained roll. Once observed, acted upon,
mapped, or promised, a fact hardens. Later alteration requires a recorded world event.

## 8. Discovery, promises, contracts, and knowledge

### 8.1 Discovery opportunities and site networks

Every enterable room or child has a discovery opportunity, but not every opportunity is concealed,
treasure-bearing, unique, Major, or independent. Quiet rewards include history, safety, acoustics,
practical knowledge, resource dependencies, confirmation/negative evidence, routes, leverage, or
occasional tier-appropriate consumables.

Whole-site networks coordinate larger secrets, transformations, factions, hidden complexes, routes,
Breaches, and revelations. Major/Mythic counts scale at site/zone scope rather than once per room.

No discovery packet may lead to nothing. It must:

1. attach to existing generated truth; or
2. create a stable promissory story card with invariants and a fulfillment obligation.

The missing-daughter note is the canonical stress example. It may fix a relationship, disappearance,
date, bandit link, provenance, and unresolved status without eagerly generating the daughter, bandit
network, and destination.

### 8.2 Attention and promises

Promissory cards expand through:

```text
seeded -> tugged -> pursued -> committed
```

Player attention increases priority and materialization depth, never Spice intensity by fiat. Priority
may cool, but canon does not disappear. Reaching the promised destination forces enough expansion to
answer the player's action honestly.

Negotiating “what is in it for me?” begins canonical terms. Agreement, payment/authority, or action
toward the objective creates a service guarantee: advance within a bounded window of suitable legal
opportunities. The guarantee normally promises progress, not resolution in the next room.

### 8.3 DM priority hand

The DM receives a small relevance-filtered hand:

```text
MUST PLAY
PLAY SOON
PLAY IF FIT
RESERVE
LOCAL SPICE
```

Cards retain hard semantic requirements, exclusions, soft preferences, scope, capacity cost, and causal
relationships. A room's identity is not overwritten to satisfy a card. Recorded deferral raises
pressure; if a service horizon would expire without a legal home, the scheduler produces a diegetic
delivery opportunity or dedicated hook-walk rather than dropping the promise.

Gathering places may hold several beats. Institutional anchors, foreground beats, social clusters,
stable latent people, and ambient population coexist; the DM foregrounds a legible subset. Wave 1 does
not define Wave 2's population/casting schema.

### 8.4 Graded reveal and knowledge ownership

Canonical truth, observations, and beliefs/hypotheses remain separate. The reveal ladder is:

```text
manifest -> legible -> specialist -> investigated -> concealed -> confirmed
```

Obvious functions may be named automatically. A recognizable kitchen should not require a search tax.
Original purpose, transformation history, hidden mechanisms, and secrets remain gated by evidence and
capability.

Knowledge is source-attributed. Co-present cooperative characters automatically share ordinary
findings; separated characters require reunion or communication. Canonically private facts retain named
holders and a sharing policy: shareable by choice, withheld by a canonical actor, conditionally
shareable, experiential/partial, or unrecognized.

Private facts cannot leak through narration, journals, objectives, maps, prompts, other characters,
card eligibility, or UI telegraphs. The player decides whether a player-controlled character shares an
ordinary private fact. NPC companions may withhold only for established reasons.

The human player receives perspective-gated dramatic irony: a player-character's directly experienced
private scene may be shown with clear holder/viewpoint labeling, while unearned NPC/companion secrets
remain hidden.

## 9. Causal Spice architecture

### 9.1 Spice is scoped causality, not temperature

Eligible causal events—purpose variation, doctrine, transformation, current anomaly, secret network,
Breach, or other licensed Commitment—own a band and scope. Their manifestations express the same cause
rather than rerolling intensity.

```text
CausalSpiceEvent
  root/cause and provenance
  band
  scope: child / room / zone / site / regional / planar / cosmic
  context and causal license
  affected records and edges
  manifestations and tells
  persistent consequences and unresolved handles
```

Table classes retain honest ceilings: Spark detail normally reaches Grounded/Textured, Fork direction
may reach Strange, and Commitment consequence/anomaly can reach Volatile/Mythic. A table does not receive
fake hot rows merely to fill all bands.

### 9.2 Independence and inheritance laws

> **No downward ceiling:** a parent band's intensity does not cap independently eligible descendants.

> **No upward averaging:** a high-band child does not recolor every ancestor or sibling.

An independent NPC, item, encounter, discovery, or detail may roll within its own table authority. A
manifestation of an existing cause inherits/binds to that cause rather than becoming another root. A
Grounded prison may contain a Mythic prisoner; a Mythic site may contain Grounded guards, meals, tools,
and cells.

Large sites are protected from high-band saturation by table-class ceilings, site/zone Commitment
opportunity budgets, repeated-assembly variance budgets, causal inheritance, and scope. Player pursuit
adds detail and priority, not automatic intensity.

### 9.3 Promotion and player handles

Wave 1 requires that strong results retain causal provenance and lead somewhere. The exact mechanized
promotion algorithm was assigned to later authoring/compiler design, but this sketch must preserve the
architectural requirement: a result that claims a broader cause or persistent consequence cannot remain
an untracked disposable micro-detail. It must bind to a compatible root or create a scoped tracked root
without erasing the rolled outcome.

The sheriff's demonic soap can remain a bounded local accent, seed a promise, manifest an existing
infernal event, or promote into a root with evidence and future consequences. The engine must know which
case occurred.

## 10. Occupation zones and event-driven fronts

### 10.1 Zoned present use

Current populations claim coherent graph regions based on access, goals, resources, defenses, scale,
known hazards, and history. Rooms inherit the zone's ordinary occupant/current-use relationship and
deviate only through a stored cause.

Claims are layered rather than one ownership color:

- physical control;
- population presence;
- legal/ritual authority;
- resource dependence/control;
- social influence;
- knowledge/access;
- aspiration.

Later Wave 2 work may refine this vocabulary. Wave 1's invariant is that contest can be spatial,
social, political, legal, religious, ideological, or resource-based; it does not imply combat.

### 10.2 Sparse fronts

The site is neither a frozen snapshot nor a continuously simulated ant colony. A sparse front stores a
goal/stance, controlled/depended-on/desired zones, one or a few pressures, legal triggers, transition
outcomes, evidence, and player handles.

Fronts advance only through recorded causes such as meaningful elapsed time, player action, supply
change, casualties, contract outcome, faction/world event, or revisit. Transitions can escalate,
stabilize, cool, negotiate, retreat, or resolve. They update affected claims, access, inhabitants,
evidence, and cards persistently; they do not take turns merely to manufacture drama.

The generator prefers the smallest group set that explains the present state. Exact occupant-group and
headcount architecture is a Wave 2 owner, not a Wave 1 schema.

## 11. Narrative scheduling versus challenge and reward

Wave 1 separates two schedulers.

### 11.1 Flexible narrative scheduler

Narrative placement follows semantic fit, causal order, player attention, contracts, occupation,
knowledge, service horizon, and each card's own topology/timing behavior. Depth is optional metadata,
not a universal plot outline.

Cards may be pre-entry, entrance-facing, any-depth, depth-biased, deep-gated, terminal, cross-zone, or
route-spanning. A chain may reveal early and explore consequences later, begin outside the front gate,
fork across zones, or remain a campaign promise after the site.

Coverage and placement-slack prevent accidental drought, conservative hoarding, and final-room dumping.
Exact homes are fixed early when causal consistency requires them; softer cards retain ranked legal
homes among unobserved candidates. The DM sees only the current thin hand.

### 11.2 Noisy mechanical access-depth gradient

Expected challenge commitment and reward rise with **effective access depth**, not raw room number:

```text
graph distance
+ required transitions
+ locks/barriers
+ hazards and hostile control
+ resource cost
+ branch/route commitment
+ secret knowledge/access requirements
+ available alternate entrances
```

The gradient is noisy and overlapping. Dangerous shallow guardians, rewarding social rooms, calm deep
rooms, peaks, valleys, shortcuts, and quiet spaces remain valid. Challenge need not be combat. Reward
may be information, allies, routes, safety, authority, equipment, discovery, or campaign leverage.
Challenge and reward correlate across routes/regions rather than as one compulsory room transaction.

Spice remains independent. Deeper does not mean more supernatural.

Consumable opportunities, danger, attrition, and rest are jointly planned. Finding optional healing or
supplies grants a real advantage; the engine never reacts by silently upgrading later opponents.

## 12. Budget surfaces and bounded work

Wave 1 fixes what budgets must protect, but not exact curves.

| Budget | Protects | Must not do |
|---|---|---|
| Operating-model allocation | Core/support capability and resource/process truth | Demand one room per noun or silently omit a capability |
| Discretionary spatial allocation | Added rooms, pockets, annexes, inherited spaces, child domains | Become only leftover capacity after function |
| Embedded discovery allocation | Room/child tells, people, objects, resources, history, practical handles | Mint one Major secret or high-class roll per container |
| Site/zone causal allocation | Major secrets, transformations, subordinate purposes, roots, fronts | Multiply roots once per manifestation or child |
| Repetition variance | Exceptions inside a coherent repeated family | Independently regenerate every child or make all children facades |
| Narrative capacity | Legal card homes, service horizons, current thin hand | Rewrite room identity, hoard indefinitely, or dump at the finale |
| Challenge/reward | Route/region risk, attrition, supplies, payoff | Become a Spice ramp or reactive punishment system |
| Materialization | Fine detail expanded now | Erase canonical scope or defer an immediate player-required answer |
| DM context | Relevant local truth, due cards, nearby dependencies | Send the full campaign/site index to the DM |
| Renderer | Active projection only | Become semantic authority or force canon expansion |

Exact counts, percentages, bands, and performance thresholds belong to their assigned later waves.
The smallest site still receives embedded variation and a likely added spatial variation. Larger sites
receive proportional opportunity without automatically receiving a larger number of unrelated high-band
roots.

## 13. Reconciliation, degradation, and failure

### 13.1 Authority-preserving reconciliation ladder

When the operating model, protected variation, fixed shell, occupants, and envelope do not fit naively:

1. prevent contradiction by coupling purpose, profiles, dependencies, and protected allocation early;
2. realize capabilities without one noun per room through combination, repeated subspaces, procedures,
   schedules, fixtures, and distributed systems;
3. externalize only through an honest provider, route, reliability, access, and failure relationship;
4. fulfill protected variation through both embedded and spatial channels;
5. adjust unobserved low-authority structure inside declared tolerances and record the reconciliation;
6. add an annex, child site, inherited pocket, or Breach domain only with causal license;
7. yield optional variants, redundant repetition, and decorative density before core capability,
   canonical truth, physical legality, or protected meaningful variation;
8. before contact, regenerate only the lowest-authority incompatible choice;
9. after contact, alter observed truth only through recorded construction, collapse, occupation,
   repair, or revelation events;
10. if no legal model exists, fail with the conflicting requirements, sources, and attempted recovery.

Small is a soft distribution, not a hard room blacklist. An extra room, attic, cellar, shed, tunnel,
older foundation, or impossible domain may establish its own capacity and cause. It may not overlap the
neighboring building or become inaccessible facade space.

### 13.2 Declared degradation

Later compilers may select an authored minimum viable realization, but cannot silently delete the
site's identity. Every fallback needs:

```text
original requested fact
reason it cannot be realized as first requested
lower-authority alternatives tried
selected legal fallback
capabilities and player handles preserved
provenance and diagnostic
```

Physical/canonical impossibility is a hard constraint. Composition, preferred adjacency, redundant
support, and exact presentation may be soft. A soft score may never outvote physical validity, required
access, canonical truth, or guaranteed capability.

### 13.3 Authoring and source-contract consequences

The current d200 is not retained as the independent final-room runtime and is not discarded wholesale.
Its later audit must decompose each row into typed atomic facts, history/state clauses, mechanisms,
licensed anomalies, and preserved hierarchical composites. Source ids and authored prose remain useful
provenance and regression fixtures.

Each future human-readable row should keep machine precision and voice together under one identity:

```text
concise result name
+ controlled typed semantic contract
+ honest Spice band and scope where relevant
+ evocative DM fragment/tell
+ source and roll provenance
```

Controlled namespaced contracts—not prose inference or free-form tag soup—eventually describe function,
anchors/sockets, affordances, access/state, reveal vectors, payload/resource kind, scope, and capacity.
Parent site/zone/room facts may be inherited into an effective affordance profile rather than repeated
in every child row. A narrative card may declare hard requirements, alternate legal anchors, soft
preferences, exclusions, scope, and capacity cost against the same vocabulary. The final vocabulary and
schema are later-wave decisions.

Spice band and writing quality remain separate axes. A Grounded pantry can be vivid, concrete, and
excellent; purple prose cannot promote an ordinary mechanism to Mythic. Every eventual roller receives
a deliberate writing pass within its honest Spark/Fork/Commitment ceiling. An ordinary shape table does
not need a planar gate at its hot end merely to fill five bands.

Apply the golden-beat preservation law to every migration:

> Preserve the golden beat, not necessarily the mechanism that currently delivers it.

Classify current behavior as retain, rewire, recompose, or retire-with-replacement-proof. Sift the new
design through the indexed procedural-generation research—semantic scene requirements, hierarchical
blocks, portal/template legality, path and reward constraints, circulation/furnishing objectives,
two-stage generation, expressivity measurement, and optional solver escalation—without surrendering
Genesis's authored voice or D&D roller surface.

## 14. Current-engine seam crosswalk

These dispositions are provisional architecture judgments. They are not permission to edit the named
surface. `Keep` means preserve the golden behavior, not necessarily every current field or call path.

| Current surface / behavior | Disposition | Wave 1 reason and required future home |
|---|---|---|
| `src/engine/dungeon-walk.js` stable segments, exits, roll refs, graph identity | **Keep + extend** | Canonical walk/graph and provenance survive; future semantic site/room programs and explicit connections enrich them |
| Existing graph depth/BFS and semantic depth seams | **Adapt** | Preserve topology metrics, but distinguish optional narrative topology/timing from effective-access challenge/reward depth |
| `src/engine/place-spatialize.js` determinism, cells, shapes, reachability, retry/honest failure | **Keep + adapt later** | Macro geometry remains valuable; it must consume fixed semantic topology and eventually explicit portal legality rather than infer purpose from prose |
| Late `scaleDomain` repair from large residents | **Recompose** | Preserve usable large-inhabitant territory and transitions; move authority to construction-time accommodation domains |
| `Dungeon Type.md` Original Purpose | **Extend** | Existing original-purpose seed is valuable; store lineage, provenance, doctrine, operating model, and history instead of losing purpose after the roll |
| `Dungeon Area Type.md` d200 | **Decompose with replacement proof** | Preserve prose, source ids, strong composites, and golden beats; move atomic facts to typed rollers/recipes and stop using the flat d200 as the independent final room authority |
| Shape/terrain keyword parsing from display prose | **Retire after structured replacement** | Machine contract and DM tell must share a row id; the engine must not reverse-engineer semantics from literary prose |
| Current per-room secret roll/golden behavior | **Recompose** | Preserve one discovery opportunity per room/child while coordinating Major secrets and causal roots at zone/site scale |
| Current empty-room results | **Keep + rewire** | Empty/quiet is a rolled meaningful identity and pacing state, never a dressing/compiler failure |
| `docs/WALK-CARD-DEALING.md` / card-dealing ideas | **Adapt as candidate** | Preserve semantic-fit and prioritization ideas; final architecture is thin hand + typed legal homes + promises, not an assumed full-deck mechanism |
| Current NPC presence/attention and Codex soft-to-hard lifecycle | **Keep + extend** | Preserve graded materialization and stable contact; future bounded-place population work owns anchors, clusters, latent people, and public-room density |
| Current faction/relationship state | **Extend, not replace by room rolls** | Future work must support coherent occupation zones, typed overlapping claims, and sparse fronts rather than one site faction or per-room confetti |
| World State Ledger and typed event precedent | **Keep + extend** | History, fronts, knowledge, observed changes, roots, promises, and reconciliation need persistent event/provenance paths |
| `src/engine/place-dressing.js`, projection, interactables, and room grammar as separate spatial passes | **Collapse later into shared legality** | Preserve realm awareness, canonical nouns, state, and grammar vocabulary; later waves must prevent independent placement from violating one plan |
| `docs/ROOM-GRAMMAR.md` ALIGN/RHYTHM/PAIR/ROW/FLANK/FOCAL/CLEAR | **Keep + recompose** | Strong future realization vocabulary; compile into constraints/scores after roster/topology ownership is settled |
| Renderer wall mounts, shell, one-room rendering, lights/materials/sprites | **Keep as projection laboratory** | Useful geometry/beauty remain; renderer cannot own semantic sockets, function, topology, knowledge, or truth |
| Current `DOOR` cells and door state | **Keep as compatibility projection; extend later** | Graph edges and state survive; explicit oriented portal objects become later authority |
| Human-readable Markdown tables and compiler provenance | **Keep** | Core modding/D&D authoring contract; never replace with opaque hardcoded optimization |
| Automatic inventory implementation | **Future system, no Wave 1 code seam** | Preserve the locked BG-like product requirement; audit adoptable systems before bespoke work |

No current surface is declared safe to delete. “Retire” requires a replacement proof and, before
destructive implementation, Wave 12's verified recovery package: immutable pre-redesign tag, launchable
worktree, LFS/cold-shelf manifest, Git bundle, materialized archive, representative saves/seeds, and
behavior proof.

## 15. Wave 1 invariants

Any later spec or implementation that violates one of these reopens Wave 1 explicitly.

### Identity and authority

- Site lineage remains definite engine truth even if forgotten in-world.
- Intended purpose and construction identity remain definite for intentional episodes; natural, living,
  emergent, or anomalous origins are not assigned fake builders or purposes.
- Domain/substrate, site identity/lineage, institution/ecology/occupation, and materialization window do
  not silently overwrite or collapse one another.
- Original, intervening, current, and believed functions never overwrite one another silently.
- Established lore/premise outranks rolls; rolls outrank downstream convenience.
- Every reconciliation, promotion, mutation, and observation has provenance.

### Operating model and variation

- Every purposeful site has a complete operating model and guaranteed identity-bearing capabilities.
- Capabilities are not rigidly one-room-per-noun.
- Supporting, subordinate-purpose, current-use, and secret categories remain causally distinct.
- Protected variation is never whatever remains after the functional plan.
- Even the smallest purposeful site retains likely added spatial variation plus embedded opportunity.
- Every discretionary space has at least one player handle; Grounded content remains valuable contrast.

### Scale and hierarchy

- Structural scope, operational load, spatial envelope, and accommodation remain separate but coupled.
- Topology, state, danger, history, discovery, physics, and materialization are not overloaded into size.
- Realms extend shared semantic interfaces rather than forking the generator.
- Repeated children are stable and enterable, not facades; shared truth is stored at their assembly.

### Discovery, Spice, and knowledge

- Every enterable room/child has a discovery opportunity; not every opportunity is a secret or Major.
- No discovery or promise leads nowhere when pursued.
- Major secrets and high-band roots are coordinated at appropriate scope.
- Secret spaces follow the same meaningful-room law and use bounded nesting.
- Parent bands neither cap descendants nor recolor every sibling/ancestor.
- A manifestation inherits its root instead of rerolling a new independent intensity.
- The DM and every output channel respect player/character knowledge boundaries and private holders.
- Search is stable and method-sensitive; identical retries do not mint new content.
- Ordinary comprehension and mandatory progression never depend only on an untelegraphed exhaustive
  sweep of generic containers or repeated children.
- If a sole private knower dies, leaves, forgets, or refuses to share, that knowledge may remain lost
  until another fair evidence route exists; party summaries cannot silently universalize it.

### Occupation and change

- Current occupation is zoned and causal; room deviations need reasons.
- Contest does not imply combat or automatic escalation.
- Fronts are sparse and event-driven; they may stabilize or cool.
- Observed facts change through events, not generator retcons.

### Topology, scheduling, and budgets

- The complete semantic connection topology exists before exploration for ordinary finite bounded sites.
- Canonically unbounded domains require explicit license, versioned topology/frontier laws, and permanent
  commitment of generated nodes and edges; a finite materialization window never implies finite extent.
- Latent expansion cannot alter topology, capacity, established clues, promises, or observed truth.
- Narrative scheduling is nonlinear and card-specific; depth is not a universal story template.
- Challenge and reward rise noisily with effective access depth, not raw room order.
- Spice is not a depth ramp.
- The DM receives a thin local hand/context, not the full unresolved index.
- Optional resources are real earned advantages and never trigger reactive enemy scaling.
- Impossible constraint sets fail diagnostically; no roll or guaranteed capability disappears silently.

## 16. Wave 1 stress fixtures

These are semantic contradiction fixtures, not finished content packages or geometry tests.

| Fixture | Wave 1 facts it must prove | Failure it should expose |
|---|---|---|
| Hamlet jail | Complete minimal custody model, external service, human scale, likely added space, juicy local handle | Small-size blacklist, one-room-per-obligation bloat, bland null fallback |
| Major city prison | Repetition, zones, coordinated secrets, proportional variation, current-use/history layers | One independent Major secret and heavyweight record per cell |
| Mage-colony Breach prison | Context-sensitive classification, mixed domains, ordinary portal custody plus exceptional failure | “Portal always Mythic,” one global scale, realm fork |
| Giant ossuary with human squatters | Low room count, huge envelope/accommodation, inserted human current-use pockets | One master size or late renderer-scale repair |
| Alchemist shop over necromancy lab | Public primary purpose, concealed subordinate purpose or later transformation, legal discovery path | “Hidden” used as purpose; orphan surprise room |
| Manor with an older hidden complex | Established ownership/access, inherited substrate, bounded child site | Dungeon under every building or current context rewriting origin |
| Contested fort/grove-like refuge | Overlapping physical/social/legal/resource claims and nonviolent front outcomes | One owner color, per-room faction confetti, forced combat |
| Living fortress or world-tree settlement | One entity/site identity, linked facets, organic imperative, institutions sharing domains, material continuity events | Fake builder/purpose, duplicated identity, renderer owning canon |
| Canonically endless archive | Stable topology laws, honest finite frontier, permanent node/edge commitment, bounded active window | Pretend finite preseed, rerolled explored space, arbitrary DM corridor creation |
| Child's note / missing daughter | Local discovery becomes a persistent promise, then expands under attention | Flavor note with no canonical attachment or fulfillment |
| Sheriff's demonic soap | Bounded local accent, manifestation, or promoted root remains distinguishable | Every spicy object becomes an unrelated site catastrophe |
| Small fixed shell with overfull program | Reconciliation ladder, combination/externality/annex license, honest failure | Silent overlap, fake door, dropped capability, repeated reroll-until-fit |
| Multi-entrance site | Effective access depth preserves risk/reward despite shortcuts | Raw room index used as difficulty; prescribed narrative order |
| Empty/quiet repeated cells | Automatic read, focused search, systematic sweep, stable opportunities | Forty-click container play or literally meaningless facade rooms |

Later waves add residential college, ordinary/boutique inn, regional trade, population, group-count,
and other fixtures only when their owning decisions close. They are not retroactively treated as Wave 1
architecture here.

## 17. Promise-to-production traceability template

Every eventual `SPECCED` requirement derived from Wave 1 should carry a completed trace. A helper-level
green test is never enough.

| Trace question | Required evidence |
|---|---|
| Which Wave 1 ruling is this preserving? | Exact direction section and invariant; note any explicit supersession |
| Who produces the fact in production? | Real entry path and upstream authority, not a test-only helper |
| Is it rolled, derived, inherited, promoted, reconciled, observed, or event-mutated? | One named authority mode and legal transition rules |
| Where is canonical truth stored? | Persistent owner, stable id, provenance, hardness/contact state, migration behavior |
| What remains latent? | Seed/invariants and deterministic expansion boundary that cannot retcon hard facts |
| Who consumes it? | Actual roster/topology/room/gameplay/DM/UI/render call sites, each within its authority |
| What does the player/DM see? | Knowledge-safe, attention-safe, bounded projection and private-fact leakage checks |
| How can it change? | Typed event, causal root, affected frontier, evidence, and replay/idempotence behavior |
| What happens if inputs conflict? | Reconciliation order, lowest-authority yield, degradation, and no-silent-drop diagnostic |
| What happens if data is absent, corrupt, or over budget? | Deterministic fallback or last-known-good behavior; truth is not erased |
| Which golden beat does it replace or preserve? | Executable fixture showing the old desirable outcome still occurs |
| How is it proven on the real path? | Unit invariant + production integration + persistence/revisit + fixture/distribution/performance evidence |
| Does it require experiential or visual proof? | Capture/playtest gate when legibility, pacing, search, DM behavior, or beauty is claimed |

Suggested per-promise ledger row:

```text
promise id:
source ruling:
producer:
canonical owner:
authority transition:
consumers:
player/DM projection:
mutation path:
fallback/diagnostic:
golden-beat fixture:
production-path gate:
status: UNTRACED / TRACED / SPECCED / BUILT-AND-PROVEN
```

`BUILT-AND-PROVEN` requires the production path to create, persist, project, mutate, revisit, and survive
the promised fixture. Passing a schema validator or calling a helper in isolation does not satisfy it.

## 18. Future-wave ownership map

Wave 1 defines the semantic promises below and deliberately leaves their realization to named owners.

| Wave 1 handoff | Owning future work |
|---|---|
| Purpose profiles, exact roster allocations, repeat counts/variance, ecology, protected opportunity curves, Spice inventories | **Wave 2** |
| Structural stamps, legal room/assembly realization, shells, annexes, domain boundaries, entity-site spatial interfaces, deterministic degradation | **Wave 3** |
| Explicit portal/secret/Breach/vertical and distributed-domain edges, circulation, reveal vectors, secret-network spatialization, licensed stable-frontier topology | **Wave 4** |
| Furniture/fixture assemblies, dressing, expression, clutter, quiet-room staging, event traces | **Wave 5** |
| Accommodation boundaries, squeezing, capacity, party participation/splitting, witness/communication sets | **Wave 6** |
| Effective-access challenge/reward/attrition/resource curves and encounter reshaping | **Wave 7** |
| Formation, movement, destruction, repair, copy/split/merge/continuity, topology/resource mutations, persistent environment events | **Wave 8** |
| Card schema, legal-home scoring, thin hand, coverage/slack, service horizons, fronts, DM digest/knowledge partition | **Wave 9** |
| Graph/local-plan/player-view choice, interim renderer, search/knowledge accessibility presentation, visual leakage | **Wave 10** |
| Authoring workbench, roller editing, diagnostics, preference teaching, mod vocabulary UX | **Wave 11** |
| Persistent lineage/domain schemas, migrations, deterministic replay, recovery package, compiler validation, golden-beat proofs, performance/soak gates, build order | **Wave 12** |
| Baldur's-Gate-like automatic inventory and equipment UI | Separate future inventory design after adoptable-system audit |
| Full bounded-place settlement/population/casting/economy architecture | Future place/settlement/NPC/economy work, constrained by later closed waves |

No future owner may silently reopen or replace a Wave 1 invariant. A later contradiction must name the
affected ruling, record the counterexample, and explicitly reconcile or supersede it in the living
direction before this sketch changes.

## 19. Deliberate uncertainties

These are unresolved by design rather than omissions to fill from intuition:

- exact profile bands and thresholds;
- purpose/roster/variation distributions;
- exact rate and size of discretionary spaces;
- root/manifestation and secret-network counts;
- final controlled semantic vocabulary and row schema;
- exact graph-generation and portal-solving algorithms;
- precise latent-versus-eager cut points for geometry, occupants, loot, and dressing;
- exact scheduler formulas, hand limits, and service windows;
- effective-access weights and difficulty/reward curves;
- final player-facing visual representation;
- schema names, module boundaries, migrations, and performance budgets.

The sketch must flag these; it must not solve them by smuggling in an unapproved default.

## 20. Review gate for this sketch

Before this Wave 1 map is treated as accepted architecture:

1. compare every Wave 1 closure-audit item against sections 2-15 above;
2. run the stress fixtures as paper traces through authority, ownership, persistence, and failure;
3. confirm that no Wave 2 answer was imported as a frozen Wave 1 schema;
4. reconcile omissions or contradictions in `PROCEDURAL-DUNGEON-DIRECTION.md` first;
5. keep the result `DISCOVERY` until the relevant wave closure and explicit spec gate;
6. do not infer build authorization from acceptance of the sketch.

The document may then receive closed-wave appendices one wave at a time. Every appendix should preserve
the same promise-to-production trace and should openly supersede provisional seams rather than quietly
retrofitting them.
