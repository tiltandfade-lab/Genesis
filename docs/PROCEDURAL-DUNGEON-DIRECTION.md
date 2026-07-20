---
type: design-study
status: DISCOVERY
created: 2026-07-18
updated: 2026-07-19
related:
  - "[[DUNGEON-GRAPH]]"
  - "[[ROOM-GRAMMAR]]"
  - "[[PROCEDURAL-DUNGEON-RESEARCH]]"
  - "[[PROCEDURAL-DUNGEON-ENGINE-CROSSWALK]]"
---

# Procedural Dungeon Direction

This is the living authority for the procedural-dungeon redesign discussion begun on 2026-07-18.
It records what Adam has accepted, what remains provisional, and the gated question waves required
before this becomes a buildable system spec. It is deliberately `DISCOVERY`, not `SPECCED`: the broad
direction is strong, but several upstream game-design systems remain open.

Supporting evidence:

- `docs/PROCEDURAL-DUNGEON-RESEARCH.md` - technical synthesis of the Archmage Rises article,
  Edgar, nine primary papers, and the Genesis engine.
- `docs/PROCEDURAL-DUNGEON-ENGINE-CROSSWALK.md` - file-by-file audit of current seams.
- `Reference/Procedural-Dungeon-Research/` - source index, report PDF, and nine primary PDFs.
- `ui-sketches/mock-frames/procedural-dungeon/interim-visual-engine-options.png` - first
  range-strip / schematic-board / hybrid-storyboard comparison.

## 1. The diagnosis

Genesis has the ingredients of a strong procedural dungeon system, but they do not share one
authoritative legality model. The walk owns rich facts; the spatializer owns reachable polygonal
cells; door state, dressing, canonical-card projection, interactables, room grammar, renderer mounts,
and verification all exist. Each stage nevertheless uses a different partial idea of where things
may go.

Door placement is the clearest symptom. A door is currently solved mainly as a deterministic boundary
cell facing the neighboring room. It needs to be a compatible aperture on an oriented boundary edge,
with width, corner policy, elevation, structural exclusions, threshold, motion envelope, circulation,
and neighboring-slot compatibility.

Dressing has the same problem. One-cell occupancy, center and apron exclusions, optional subcell
distribution, independent interactable placement, partial grammar, and renderer-side wall mounts
cannot collectively guarantee a readable, usable room.

The solution is not a larger random dressing pass. It is a deterministic room compiler shared by
architecture, portals, reservations, assemblies, stateful affordances, and rendering.

## 2. Accepted direction

Adam stated on 2026-07-18 that he was "100% with" the recommendations developed through the first
48-question pass. The items below record that accepted direction while preserving the open design
questions named later in this document.

### 2.1 Method and ownership

- Genesis architecture is already closest to the Archmage article's **pieces/tiles** method.
- Keep the 5-foot mechanical cell grid. Add boundary subslots for apertures and supports, plus local
  subcell transforms for visual objects. Logical resolution does not dictate render style.
- The rollers author intent, constraints, relationships, condition, and provenance. They do not
  choose coordinates.
- The room compiler solves geometry, portals, circulation, zones, footprints, sockets, placements,
  degradation, and diagnostics.
- The renderer consumes compiled facts. It may refine an accepted socket to exact mesh coordinates;
  it may not decide semantic legality.
- The DM narrates and plays strategic state-changing cards. For the present technology and system
  maturity, the DM does not decorate rooms or repair architecture.

### 2.2 Room function becomes upstream

- The vast majority of rooms should have a readable dominant function.
- Function examples include kitchen, ritual chamber, torture chamber, laboratory, training room,
  dormitory, shrine, guardroom, workshop, cistern, storage, privy, cell, archive, and similar uses.
- A new function/recipe roll is warranted. It should participate in the spice curve and repetition
  control.
- Footprint and function use weighted compatibility, never a rigid pairing. A chapel in a cave is
  desirable when it remains coherent.
- The existing d200 is loved but not protected as the underlying architecture. It may survive,
  transform into a presentation/result table, or be replaced if the new system preserves or exceeds
  its variation and improves mechanical viability.
- Architecture and dressing may roll independently at a high level because surprising combinations
  are part of Genesis. A compatibility layer interprets the combination without flattening it.

### 2.3 Function, use, and history are distinct

A room can be empty now without having been meaningless. The emerging room identity is:

```text
original function
  + architectural expression
  + current use or occupant
  + condition/history
  + local detail, anomaly, secret, and treasure
```

Examples:

```text
dormitory + human monastery + empty + looted and leaking
chapel + natural grotto + monster den + desecrated
treasury + giant-built vault + abandoned + breached long ago
natural pocket + cave + no current use + untouched
```

Rare empty, stripped, transitional, unused, or naturally functionless rooms are valid. They must be
rolled identities, not silent fallbacks when dressing fails. Empty space also carries pacing,
acoustic, tactical, and narrative value.

### 2.4 Small rooms are real rooms

- A room does not imply an encounter arena. Most dungeon rooms do not roll combat.
- Closets, tight hallways, pockets, secret chambers, cells, privies, and small service spaces should
  remain genuinely small.
- Every usable floor position must respect the 5-by-5-foot piece base, but a room does not need to
  hold the whole party.
- The reasonable eventual party limit is six. Not every member should enter a constrained room at
  once.
- Party splitting should eventually be supported. The near-term bridge is **scene participation**:
  record who is inside, at the portal, or in the adjacent space without requiring constant manual
  formation management.
- Room capacity has separate meanings: standing capacity, interaction capacity, throughput, and
  combat capacity.
- Combat capacity is graded: no-combat, one-on-one/grapple, bottleneck/skirmish, ordinary combat,
  formation combat, and large-creature arena.

### 2.5 Architectural transformation

- Rotation and mirroring are freely licensed unless a rare authored feature forbids them.
- Stretching and reshaping are not arbitrary. Architectural definitions declare one dimensional
  policy: fixed, ranged, bay-extensible, path-extensible, organic, or variant-shaped.
- Ranged rooms choose within authored bounds. Bay-extensible rooms add whole rhythmic bays. Organic
  spaces may alter outline. Variant-shaped functions choose among licensed footprint families.
- Use a hybrid of reusable structural stamps and authored **signature bundles**. Stamps make rules
  testable; bundles make functions readable and prevent combinatorial mush.

### 2.6 Portals

- A door is an architectural aperture whose type contributes physical constraints and whose state
  initializes behavior.
- Portal priority is: graph compatibility; threshold and circulation; structural legality;
  architectural composition; corridor cost; variation.
- Main chamber and connecting doors prefer wall centers, axes, or other composed positions.
  Service doors such as closets and bathrooms may correctly occupy corners. Secret, defensive,
  cramped, and deliberately asymmetric connections have their own policies.
- Portal relationships are rolled policies: axial, through-aligned, offset, screened/dogleg,
  radial, service, or concealed.
- Ordinary doors use real hinge, leaf-motion, and use envelopes. Archways, shutters, gates, and
  portcullises expose their own envelopes.
- Secret doors are compiled from the beginning and hidden from the player projection. The DM may
  determine discovery, opening method, and revealed contents through licensed rolls and play.
- Vertical connections belong in the same contract: stairs, ramps, ladders, shafts, drops, and
  similar transitions.

### 2.7 Circulation, elevation, and tactics

- Thresholds, use envelopes, aprons, door-to-door paths, focal approaches, aisles, and interaction
  fronts are first-class reservations.
- Dressing may obstruct optional routes or create tactical friction. It may not accidentally block
  the only required route. A required blockage must be an explicit, actionable feature.
- Elevation becomes strategic as early as possible and consumes the SRD mechanics for climbing,
  jumping, falling, cover, movement, and related checks rather than remaining renderer-only.
- Architecture and dressing deliberately generate tactical affordances: cover, chokepoints,
  flanking lanes, elevation, destructibles, hazards, and interaction opportunities.
- Encounter requirements may reshape dressing during compilation. Once the room persists, an
  encounter uses the established room rather than invisibly restaging it.
- Required focal and stateful interactables remain reachable unless obstruction is itself a declared
  puzzle state.

### 2.8 Dressing and assemblies

- Furniture is generated as assemblies and relationship graphs, not unrelated object lists.
- Examples: bed plus footlocker and access side; table plus chairs and tabletop sockets; altar plus
  aisle and pews; workbench plus tools and storage; shelves plus contents.
- A room-function recipe establishes functional nouns and major assemblies.
- Canonical narrative/mechanical cards add mandatory nouns and outrank optional dressing.
- A redesigned detail system supplies condition, anomaly, local evidence, a specific object, or
  fillable-socket contents.
- Represent everything reasonably possible, with mandatory representation for stateful,
  interactable, tactical, treasure-bearing, and narratively referential objects. Harmless ambient
  multiplicity may remain aggregate texture.
- Ordinary density is inhabited but navigable, with strong variation by function and condition.
- Support sockets fill before free-floor scatter: walls, shelves, tables, containers, chairs,
  counters, rafters, and other supports carry visual density while floors preserve use.
- Every recipe owns a degradation ladder. Failure never silently erases its identity.

### 2.9 Creature scale and ecology

- Architecture and creature scale constrain each other. Do not enlarge every dungeon for its
  largest resident.
- Builder-first architecture, inhabitant-shaped architecture, natural selection, and repurposed
  mismatch are distinct states.
- A connected scale domain may use wider portals, corridors, taller ceilings, larger steps, and
  explicit transition rooms.
- Existing architecture filters likely occupants, but rare incompatibility is valuable when the
  generator produces a valid explanation: guise, squeezing, amorphous movement, breach, external
  lair, trapped resident, servants, or recent invasion.
- Creature movement profiles eventually include footprint, clearance, squeezing, climbing, flight,
  swimming, burrowing, amorphous/incorporeal movement, guise, door use, and destructive breach.

### 2.10 Persistence, recovery, and dev rerolls

- Development tools must lock and reroll individual layers: architecture, portals, dressing,
  arrangement, skin, and state.
- Production compilation may try several hidden candidates before reveal; that is solving, not a
  player-visible reroll.
- Once discovered, a room never rerolls. Only explicit state changes alter it.
- Persist compiled rooms, not just seeds, so compiler upgrades cannot rewrite established worlds.
- Compatibility projections preserve existing consumers while the new plan is adopted.

### 2.11 Solver and diagnostics

- Begin with bounded constructive placement, configuration-space masks, backtracking, and candidate
  scoring. Do not begin with machine learning, simulated annealing, or an SMT rewrite.
- Hard validity precedes soft composition.
- Every failure explains itself in plain language and rule counts.
- The workbench shows room program, potential and rejected portal slots, reservations, footprints,
  sockets, candidate gallery, score breakdown, degradation, and provenance.
- Adam can pin or adjust examples in the workbench to teach the system. Preference capture records
  why a candidate won rather than storing a hand-authored production room.

## 3. Draft compiler boundary

This is a discussion target, not yet a frozen schema:

```text
rolls and dungeon ecology
  -> RoomProgram
       function, history, current use, architecture, portals required
       structural stamps, recipe, condition, secrets, treasure, provenance
  -> deterministic room compiler
       cells, edges, portals, reservations, zones
       footprints, assemblies, sockets, placements, diagnostics
  -> persistent SpatialPlanV2
  -> gameplay projections
       DM digest, combat zones, secrets, strategic affordances
  -> replaceable visual projections
       range/zone UI, schematic board, hybrid storyboard, 3D laboratory
```

The graph and walk remain canonical. `DOOR` cells may remain as compatibility output, but explicit
portal objects become authoritative. The renderer never becomes the source of a fact.

## 4. Interim visual-engine finding

No production renderer has been selected yet.

### 4.1 Current evidence

- The first range-strip mockup was confusing in its presented layout. This rejects that particular
  layout, not the underlying range-band mechanics.
- The schematic room board was the clearest and most exciting option, but an exact player-facing
  five-foot tactical board is close to the present visual ambition and carries substantial combat
  rules work.
- The hybrid tactical storyboard remains promising.
- The existing combat engine already owns four range bands, three lateral lanes, movement budget,
  opportunity attacks, zone AoE, cover, elevation zones, hazards, and a combat panel. A redesigned
  range/relationship presentation can reuse this rather than starting over.
- A schematic board has two meanings: a cheap read-only projection of the room, or an authoritative
  exact-cell tactical game. The latter is not an interim UI; it is a major combat-system project.

### 4.2 Preservation requirement

Even if production temporarily uses a top-down or symbolic view, Genesis must not discard the visual
work already achieved. Lighting, motivated practicals, normal maps, material response, environmental
beauty, and canonical sprites remain valuable. Smaller on-screen sprites or a reduced scene do not
make those systems irrelevant.

The likely design space to investigate is not the flat mockup alone. A top-down or shallow-oblique
room projection might retain:

- real light and shadow over a simplified room surface;
- normal-mapped floors and major architectural features;
- emissive practicals;
- canonical sprites at smaller scale;
- readable portals, elevation, hazards, cover, and focal objects;
- symbolic cards for facts that cannot be represented spatially;
- range/relationship information without claiming false exactness.

This may be a **lit schematic** or **tactical diorama map**: much cheaper than the current composed 3D
room theater, but not a dead flat grid. It requires its own question wave and clay-corpus comparison.

### 4.3 Provisional renderer layering

The current working recommendation remains provisional:

```text
authoritative combat and room state
  -> redesigned range/relationship view       reliable fallback
  -> lit schematic or hybrid storyboard       likely player-facing candidate
  -> exact cell board                          workbench first; optional player mode
  -> current full 3D diorama                   retained laboratory/future renderer
```

The current 3D engine should be feature-flagged out of ordinary production play only after the
interim renderer wave chooses and proves a replacement. It should not be deleted.

## 5. Separate systems discovered

This conversation exposed several systems that must not be hidden inside a room-placement task:

1. Dungeon function, roster, history, current use, repetition, and compatibility.
2. Room compiler: architecture, portals, reservations, assemblies, and degradation.
3. Scale, capacity, party participation, and eventual party splitting.
4. Mutable/destructible environments and topology-changing state.
5. DM strategic environmental cards.
6. Interim visual engine and release scope.
7. Workbench and teaching loop.

## 6. Question-wave protocol

The design proceeds in waves. A wave does not close merely because its first twenty questions were
answered.

### Closure gate

Each wave closes only when:

1. Its initial questions are answered.
2. Contradictions and second-order consequences are identified.
3. Every material follow-up question is discussed.
4. Rulings survive concrete dungeon examples and edge cases.
5. The wave records locked decisions, rejected options, deliberate deferrals, and unresolved blockers.
6. Adam explicitly confirms the summary.

Only then does the next wave open. A later contradiction reopens an earlier wave explicitly; it is
never routed around silently.

### Wave order

1. **Dungeon Function, History, and Strange Compatibility**
2. **Room Roster, Repetition, Spice, and Dungeon Ecology**
3. **Architecture, Structural Stamps, and Degradation**
4. **Portals, Secrets, Vertical Connections, and Circulation**
5. **Furniture Assemblies, Dressing, Clutter, and Empty Rooms**
6. **Creature Scale, Capacity, Squeezing, and Party Participation**
7. **Tactical Affordances and Encounter Reshaping**
8. **Mutable and Destructible Environments**
9. **DM Strategic Cards and Environmental Authority**
10. **Interim Visual Engine and Release Scope**
11. **Workbench, Clay Corpus, and Teaching Loop**
12. **Migration, Persistence, Acceptance Gates, and Build Order**

The order may change if a wave proves upstream of another, but the closure law does not.

## 7. Wave 1 setup - Dungeon Function, History, and Strange Compatibility

Wave 1 must determine the ontology from which the roller is built. Its first questions should cover:

- whether original function is always known to the engine;
- how dungeon purpose generates a sensible room roster;
- which rooms are required, likely, optional, unique, or repeatable;
- how current occupants repurpose original architecture;
- how age, looting, abandonment, invasion, and catastrophe change function;
- what counts as a surprising-but-coherent combination;
- what combinations are invalid rather than merely strange;
- when compatibility adapts a recipe, adds an explanation, or refuses the result;
- how spice affects function, history, transformation, and anomaly separately;
- how empty rooms are licensed and kept meaningful;
- how dependencies work: kitchen requires food source/storage; dormitory suggests sanitation;
  prison suggests guard/control spaces; ritual complexes suggest preparation and disposal spaces;
- how dungeon size and room count constrain the roster;
- how repeated functions gain variants rather than cloning one recipe;
- what information reaches the player immediately versus through discovery;
- whether the existing d200 becomes source material, a result table, or is retired.

Wave 1 is in progress. Nothing in this document licenses table replacement or compiler implementation
before its closure.

## 8. Wave 1 running record - questions 1-20 resolved; closure audit pending

**Status:** IN PROGRESS, not closed. This checkpoint records the 2026-07-18/19 discussion through
question 20 and its follow-ups. The initial questionnaire is resolved, but Wave 1 remains open for its
closure audit and Adam's explicit confirmation. Do not open Wave 2 merely because these rulings are
strong.

**Live-capture practice (2026-07-19):** during the remainder of this design session, this section is
the running record. Append each question's framing, recommendation, Adam's answer, and every generated
follow-up as the discussion happens. Do not silently replace an earlier ruling; preserve it and record
any later correction or supersession explicitly. `HANDOFF.md` and `NEXT-STEPS.md` need not move again
until Adam ends the session.

At the end of each question, add a **future-question assignments** block. If an answer already settles,
constrains, or creates a requirement for a later questionnaire item, wave, or system, name that future
owner explicitly. The later discussion begins from that inherited ruling instead of asking Adam to
re-decide it. A deferral must likewise name its owner and does not remain an artificial blocker for the
current question.

**Option-integrity practice (2026-07-19):** do not force every question into three choices. Earlier
frames often put one minimal failure mode first, one maximal failure mode second, and the recommended
balanced synthesis third. The alternatives were real, but repeating that template creates positional
anchoring and an illusion of choice. Going forward, present only materially viable alternatives, use as
many or as few as the problem actually has, identify a dominated option as a failure mode rather than a
candidate, and state directly when one architecture is clearly recommended. Do not manufacture a vote
when the real decision is a priority order, threshold, or deliberate deferral.

### 8.1 Identity and authority

- **Original purpose is permanent engine truth.** It remains definite even when every living person
  has forgotten it. This makes lore, investigation, and environmental evidence mechanically valuable.
- A dungeon normally has one dominant original purpose plus zero to two subordinate complexes. The
  dominant purpose gates the functional roster, but purpose alone does not absolutely ban a room.
- Purpose compatibility is currently described as **core, supporting, compatible, exceptional, or
  conflicting**. An exceptional/conflicting function needs culture, history, current use, or another
  causal bridge; it is not silently rerolled. Physical and canonical impossibility are separate.
- A sacrificial chamber may be native to a military fort whose operator doctrine binds sacrifice to
  warfare, installed by a later cult, or licensed by a specific exceptional history. Exact profiles
  and weights wait for the real table-design discussion.
- Lore is the top authority. Purpose resolves through: established canon -> explicit place/adventure
  premise -> creator/faction goal -> strong implication -> seeded purpose roll. The selected result
  stores provenance; lower-authority compatible claims may become subordinate purposes.
- The 2014 DMG purpose/history/chamber tables and the 2e *Dungeon Builder's Guidebook* approach,
  property, repetition, emptiness, and permutation procedures are source material, not a direct
  room-by-room runtime. Their authored frequencies should teach Genesis what a coherent whole needs.
  Dice still express each need, but independent room rolls no longer create six kitchens and no gate.
- The current seam is explicit: `Dungeon Type.md` already carries an Original Purpose column, while
  `rollDungeonWalk()` stores only its archetype and atmosphere; the heterogeneous `Dungeon Area Type`
  d200 then rolls independently per room. This is evidence for the redesign, not implementation
  authorization.

### 8.2 Builder, operator, doctrine, and scale

The useful construction identity separates:

```text
commissioner
+ original operator
+ institutional doctrine
+ design tradition
+ intended occupants and scale domains
+ substrate
+ construction era
+ workforce, only when meaningful
```

- Original operator determines functional needs. Design tradition determines architectural language.
  Intended occupants determine scale domains. The workforce is routinely recorded only when it
  creates consequential lore or physical evidence: forced labor, sabotage, mixed craft, unfinished
  work, or a comparable fact.
- Institutional doctrine is a distinct identity field, derived from an established faction when one
  exists and rolled only when missing. Militaristic-sacral, ascetic, mercantile, punitive, scholarly,
  imperial, communal, extractive, funerary, and ecstatic institutions can express the same primary
  purpose differently.
- Mixed-scale construction is established from the beginning. A dragon vault maintained by kobolds
  may contain a dragon domain, kobold service network, and explicit transition spaces; the renderer
  does not invent that accommodation afterward.
- Purpose may change multiple times before current occupants arrive. Designed function, intervening
  use, current use, and occupant belief remain distinct truths.

### 8.3 Resource ecology and occupancy

"Kitchen" is an expression, not the upstream need. A place's **resource ecology** covers food, water,
rest, air/heat, waste, population renewal, material inputs, and unusual creature requirements. It may
produce farms, breeding pens, cisterns, storage, preparation, distribution, feeding, disposal, or an
external supply route. A full ecology can contain several linked functions rather than one kitchen.

Every site receives an occupancy model that filters how much support it needs:

- externally supplied;
- transient;
- predatory;
- self-sustaining;
- dormant;
- failing.

This is a strategic system as well as dressing. Players may discover or disrupt water, food,
ventilation, breeding, storage, waste, or supply dependencies.

### 8.4 Age, instability, and historical transformations

- Establish original purpose/operator/doctrine first. Then derive or roll construction era/relative
  age and historical instability. Together they determine **zero to three consequential
  transformations**; age alone never guarantees change.
- Age bands are recent, established, old, ancient, primordial, and (only when licensed) unmoored.
  Instability is stable, pressured, contested, or shattered. Established world history outranks rolls.
- Roll transformations sequentially before applying the present occupation. Each transformation
  carries **agent + action + affected functions + surviving evidence + unresolved consequence**.
- Every transformation should give the DM at least one potential player handle: claimant, faction,
  witness, record, route, resource, obligation, secret, or destination. Handles remain potential so
  history does not flood the active campaign with mandatory quests.
- History tables participate in the Spice Curve. One band governs a transformation's causal event;
  its subresults express that event rather than independently stacking unrelated spicy details.
  Grounded/Textured preserve ordinary causality, Strange introduces bounded wrongness, Volatile adds
  an active escalating force, and Mythic may establish a durable new law.

### 8.5 Current occupation and misunderstood architecture

- Current occupants relate to inherited architecture by **continue, restore, adapt, squat, exploit,
  deface, overgrow, or contest**. Large or factional sites may eventually apply different relationships
  by zone; that follow-up remains inside Wave 1.
- A room may have no current function while retaining a definite original function.
- Occupants may misunderstand what they use. `originalFunction`, `currentFunction`, and an optional
  `believedFunction` are distinct. This mismatch is a high-value D&D comedy, horror, discovery, and
  interaction source rather than an error to correct.

### 8.6 Bounded-place extension discovered

The semantic technology is broader than a dungeon renderer: it is a prospective **bounded-place
compiler** for dungeons, manors, castles, temples, warehouses, ships, sewers, and similar navigable
sites. Do not collapse the walk families:

- wilderness walks remain journeys through terrain and may discover or enter bounded sites;
- urban walks remain social movement through districts and institutions, but may enter a compiled
  manor/castle/site when detailed navigation matters;
- the bounded site reuses purpose, owner, doctrine, occupancy, history, function, and spatial rules.

For an urban manor, established ownership and lore remain canonical; party heat, affiliation, access
status, and the owner's attitude determine whether the inhabitants welcome, watch, restrict, flee, or
violently resist the party. A history/secret result may license an older complex beneath the manor,
but the system does not put a dungeon under every building. Castle/manor construction tables are a
future source audit. This extension is direction, not a build authorization.

### 8.7 Functional obligations and the minimum viable institution

Purpose profiles use **guaranteed functional obligations plus weighted realization**. A generated
prison must contain enough prison to function, but it is not assembled from one rigid room checklist.

- **Core** obligations are guaranteed capabilities. The roller/compiler may realize them as separate
  rooms, combined rooms, repeated rooms, external services, or mixed-scale domains according to site
  size and context; it may not omit them through bad luck.
- **Supporting** obligations receive guaranteed coverage proportional to size, occupancy, and supply
  model, while exact supporting functions remain weighted.
- **Compatible** functions fill ordinary weighted capacity without a guarantee.
- **Exceptional** functions require a stored causal license from doctrine, culture, subordinate
  purpose, history, current occupation, Spice, or another established fact.
- **Conflicting** functions do not enter the original-purpose roster ordinarily. A recorded
  transformation or current-use overlay may introduce them, with the mismatch and its evidence
  preserved. Physical and canonical impossibility remain separate hard refusals.

The guarantee is a **complete operating model**, not rooms alone:

```text
required spaces and capacities
+ essential operator roles
+ intended population and throughput
+ internal resources and procedures
+ external dependencies
+ active, failing, abandoned, or repurposed state
```

A hamlet jail might need only one to four cells, a sheriff, an optional deputy, secure storage,
and externally supplied meals. A major city prison may require cellblocks, intake, guard control,
administration, food supply, sanitation, evidence storage, an infirmary, and shift staffing. An
abandoned prison keeps the original operating model as historical truth but has no active staff;
later occupants receive their own overlay.

Every purpose-and-size profile also protects a **proportional random allocation**. Random functions,
secrets, anomalies, subordinate complexes, and Spice-Curve outcomes are not leftover filler: they
are the bread and butter that keeps an institution from becoming only a functional floor plan. An
alchemist's shop may conceal a coherent necromancy laboratory beneath it; that surprise needs a
cause, discovery path, evidence, and narrative handles rather than appearing as an orphan room.
Exact quotas, percentages, and size thresholds remain deliberately deferred to table design.

### 8.8 Time-indexed context cascade

Generation follows this priority order:

1. established canon and explicit premise;
2. surrounding context **at the time of construction** - region, settlement, realm influence,
   magic/technology, law, culture, wealth, and materials;
3. commissioner, original operator, doctrine, design tradition, and intended scale;
4. purpose, size, capacity, resource ecology, and guaranteed operating model;
5. protected original random/Spice allocation;
6. sequential historical transformations;
7. present context, occupants, condition, and their relationship to inherited architecture;
8. final current use, staffing, supply, restrictions, secrets, and unresolved consequences.

Context changes probability and Spice classification rather than creating ordinary blacklists. An
outer-realm prison cell may be Mythic in a mundane hamlet jail, ordinary enough to be Textured or
Strange in a mage colony, or inherited technology misunderstood by later residents. Current context
does not retroactively rewrite original construction: a later retrofit or transformation must explain
the change. In Genesis, such portal outcomes may be typed **breaches** into any eligible realm.

### 8.9 Room secrets, discovery promises, and secret networks

Retain the current principle that **every dungeon room receives a secret opportunity**, but do not
interpret every opportunity as an independent Major secret. Secrets operate at two scales:

- a room-scale opportunity may become a local note, tool, cache, anomaly, clue, tell, entrance,
  observation point, contradiction, confirmation, or other discovery;
- whole-site secrets coordinate larger truths, hidden complexes, routes, factions, transformations,
  breaches, and campaign-scale revelations across several room opportunities.

Every room must reward attention somehow, including empty rooms, but not every reward needs loot or
even concealment. Quiet rooms may provide history, safety, acoustic information, practical knowledge,
personal evidence, a resource dependency, or a clue while remaining quiet on entry. Major and Mythic
secret counts must scale at the site level rather than multiplying without bound per room.

No discovery packet may lead to nothing. It attaches to an existing generated entity, place, event,
faction, resource, transformation, or truth when possible. Otherwise it creates a **promissory story
card**: a stable minimal reference plus invariants and a fulfillment obligation. A child's note can
canonize the barkeep's missing daughter, their relationship, a dated bandit-linked disappearance,
the note's provenance, and unresolved status without generating her full network immediately.

Promissory cards expand lazily:

```text
seeded    - canonical stub only
tugged    - one nearby attachment or corroborating clue
pursued   - working NPC/faction/place network
committed - active clocks, opposition, consequences, and recurrence
```

The DM may promote a suitable card at a dramatically useful time. Player pursuit also forces enough
materialization to answer the action honestly; a player who reaches the bandit camp cannot be told
that the daughter has not been generated. Priority may cool when the player walks away, but the
canonical promise never disappears.

Secret spaces receive the same meaningful-room treatment, with bounded nesting. Hidden loot remains
an occasional secret payoff, including tier-appropriate healing, antidotes, ammunition, tools, and
other consumables. Informational leverage, shortcuts, safe rest, tactical advantage, hazard avoidance,
and persistent discovery remain valid rewards that do not inflate treasure budgets.

### 8.10 Contract cards and the DM's priority decks

Asking an NPC "what's in it for me?" begins negotiation: terms, reward, known stakes, and the NPC's
response become canonical, and the card rises sharply in priority. Actual agreement, accepting
payment/authority, or acting toward the objective creates a **service guarantee**. The guarantee is
not "put this in the next room"; it is "advance this within a bounded window of suitable
opportunities."

The DM receives a thin, relevance-filtered hand rather than the campaign's full unresolved index:

```text
MUST PLAY    - player-demanded facts, immediate consequences, expiring deadlines
PLAY SOON    - accepted contracts and highly engaged threads
PLAY IF FIT  - active factions, relationships, histories, and lower-pressure threads
RESERVE      - dormant promises and lightly touched discoveries
LOCAL SPICE  - new room-level opportunities after higher priorities are considered
```

The engine enforces this cascade. "ASAP" means the earliest semantically, geographically,
spatially, and canonically legal opportunity. It records why a high-priority card was deferred,
raises waiting pressure, and creates a diegetic delivery opportunity or dedicated hook-walk when a
service horizon would otherwise expire. Contracts normally receive a **progress beat**, not instant
resolution: a witness, route clue, faction response, related captive, fresh evidence, or other rooted
advance may be the correct play.

Rolled rooms retain their function, history, current use, and physical legality. Campaign cards give
them relationships and relevance rather than turning them into blank narrative stages.

### 8.11 Multi-beat social places, resource pressure, inventory, and preservation

Narrative capacity is contextual rather than a one-beat universal limit. Taverns, markets, social
halls, courts, temple services, prison yards, and similar gathering places may contain several
independent or related beats. Use layered population:

- institutional anchors such as proprietor, staff, security, and regulars;
- foreground high-priority beats;
- social clusters with shared immediate purposes;
- stable latent NPC stubs with a role, purpose, and observable tell;
- ambient population that establishes density without indexing everyone fully.

The DM foregrounds a legible subset while the rest remains canonical or lazily expandable. Player
attention promotes a cluster or individual through the same graded-attention model. This must be
layered into the bounded-place/place-generation redesign rather than built as a separate crowd toy.

Consumable supply and encounter pressure are planned jointly. Harder or more attritional sites may
provide more expected opportunities for healing, antidotes, ammunition, tools, and safe rest. An
optional secret cache gives the player a real earned advantage; the engine never reacts by silently
upgrading later enemies. This joint budget is a future difficulty-setting lever.

Inventory should be Baldur's-Gate-like and almost entirely automatic: every item occupies one UI
tile, carries weight, goes directly into inventory on pickup, stacks and sorts routinely, equips into
explicit character slots, and supports drag-and-drop transfer/equip/split behavior. Inventory creates
resource choices, not packing labor. Its implementation wave should audit adoptable existing systems
before authoring bespoke inventory machinery.

Finally, apply the **golden-beat preservation law**:

> Preserve the golden beat, not necessarily the mechanism that currently delivers it.

Classify existing mechanisms as retain, rewire, recompose, or retire-with-replacement-proof. The
current d200, per-room secret roll, NPC presence/attention, Hook Walks, breaches, empty-room results,
and other productive systems are valuable evidence, not frozen architecture. Before implementation,
the engine/table crosswalk must name each golden behavior's new home and provide an executable example
that it still occurs.

Existing Genesis proposals such as Walk Card Dealing are candidates, not predetermined answers. At
every remaining question, sift the proposed system through the indexed research: semantic scene
requirements and hierarchical blocks; room/door/template legality; path, lock/key, reward, and
playability constraints; circulation and furnishing objectives; two-stage generation and expressivity
measurement; and solver-escalation options. Preserve Genesis's vision while adopting elegant solved
techniques rather than recreating them poorly.

#### 8.11.1 Future-question assignments seeded by question 11

| Inherited ruling | Future owner |
|---|---|
| Per-room discovery opportunities plus coordinated site-secret networks; no discovery packet leads nowhere | **Wave 4 - Portals, Secrets, Vertical Connections, and Circulation** begins from this model and decides its spatial/reveal implementation rather than reopening the principle |
| Promissory cards, attention promotion, contract service horizons, and the MUST PLAY -> LOCAL SPICE hand | **Wave 9 - DM Strategic Cards and Environmental Authority** owns scheduling details, capacity limits, deferral accounting, and DM interfaces |
| Multi-beat social rooms with layered anchors, clusters, latent NPCs, and ambient population | Future **bounded-place/place-generation** discussion owns population compilation and presentation |
| Joint danger, attrition, consumable, and rest budgeting with no reactive punishment for found loot | **Wave 7 - Tactical Affordances and Encounter Reshaping** and the future difficulty-setting system inherit this constraint |
| Baldur's-Gate-like automatic inventory, weight, equipment slots, and drag-and-drop without packing labor | Future **inventory-system** design; audit adoptable systems before bespoke implementation |
| Golden-beat preservation, research sift, and replacement-proof crosswalk | **Wave 12 - Migration, Persistence, Acceptance Gates, and Build Order** must turn these into migration and executable acceptance requirements |

### 8.12 Functional Roster and Site Scale - resolved

Resume **Wave 1, question 12 - Functional Roster and Site Scale**:

> What does a dungeon's size measure? Decide whether one headline size controls everything or whether
> generation separates graph budget (rooms/connections/zones/levels), institutional capacity
> (population/throughput/support), and physical scale (builders, portals, ceilings, circulation, and
> mixed-scale domains). Determine how the result governs guaranteed, supporting, random, secret, and
> subordinate-complex allocations while deferring exact numeric bands where appropriate.

**Open discussion frame - not yet a ruling:** "size" can describe three different things that often
correlate but are not interchangeable:

- **graph budget** - how many explorable functional domains, rooms, connections, loops, levels, and
  subordinate complexes the site can contain;
- **institutional capacity** - how many people, prisoners, patients, worshippers, goods, or other
  users it was designed to hold or process, including staffing and support burden;
- **physical scale domains** - who or what the architecture fits: halfling, human, giant, dragon,
  vehicle, industrial machinery, pocket realm, or a recorded mixture, including ceiling height,
  portal size, circulation width, reach, and furniture scale.

Three working choices:

1. **One master size.** Small/medium/large/extra-large controls all three. This is simple, but it
   falsely equates room count, capacity, and bodily scale. A four-room giant tomb and a four-room
   hamlet jail have similar graph sizes but radically different architecture; a six-room magical
   prison may hold hundreds through breach-linked cells.
2. **Three independent size rolls.** Roll graph, capacity, and physical scale separately. This
   preserves unusual sites, but unconstrained independence generates nonsense: a three-room mundane
   jail for five hundred prisoners, or human operators unable to use their own giant-scaled doors.
3. **A coupled three-axis profile.** Preserve all three values, but generate them causally rather than
   independently. Purpose and intended throughput establish capacity; the operating model and its
   choices about combined rooms, repeated rooms, and external services establish the functional
   roster and graph demand; builders, occupants, doctrine, technology, and realm influence establish
   one or more physical scale domains. History and Spice may create explained divergence. A simple
   headline size can still be derived for UI and table routing, but it is never the hidden source of
   truth.

**Recommendation:** choice 3. It protects coherence without sacrificing the strange cases Genesis
needs. The axes should govern different allocations:

```text
institutional capacity -> core/support coverage, repetition, staffing, supply, throughput
graph budget           -> zones, connections, levels, protected random slots, room opportunities
physical scale domains -> dimensions, clearances, portal classes, circulation, furniture, encounter space
site/history complexity-> coordinated site secrets and subordinate-complex eligibility
```

The graph budget is not merely a raw room count. First reserve the guaranteed operating model, then
reserve the purpose-and-size-proportional random/Spice share, then realize both through combined rooms,
repetition, external dependencies, and multiple levels. Every realized room still receives a local
discovery opportunity, while Major/Mythic secrets and subordinate complexes are budgeted at site or
zone scale so a fifty-five-room prison does not produce fifty-five unrelated campaign revelations.

Concrete results under this model:

- **Hamlet jail:** tiny graph, tiny capacity, human scale; one to four cells, sheriff/deputy space,
  secure storage, external meals, a small protected random allocation, and room-level discoveries.
- **Main city prison:** extra-large graph and capacity, human scale; repeated cellblocks and full
  support functions, several zones/levels, a larger proportional random allocation, and a bounded
  number of coordinated site-secret networks.
- **Giant ossuary:** small graph, low present capacity, giant physical scale; only a few enormous
  chambers, with human squatters occupying inserted or improvised human-scale pockets.
- **Mage-colony prison:** modest visible graph, high effective capacity, mixed human/breach scale;
  portal-cell banks and ward-control infrastructure are ordinary operating-model realizations rather
  than automatically Mythic anomalies.

#### 8.12.1 Follow-up - do three axes actually cover the problem?

Adam accepts the coupled-profile direction but explicitly rejects treating three as a magic number.
Before locking the model, identify every genuinely independent sizing concern and evaluate the
implementation and maintenance cost of adding it. All decisions must anticipate the Breach system's
realm expansion. **Scalability, versatility, and modifiability are permanent design criteria**, not
cleanup work for a later expansion.

First distinguish two questions:

- an **axis/profile** is an independently meaningful property such as operational capacity or spatial
  extent;
- a **band** is one label or range along that property, such as tiny/small/medium/large.

Adding a band to a well-factored profile is usually a tuning/content cost. Adding a new profile is an
integration cost. Neither is inherently a serious runtime cost; the dangerous cost comes from
authoring and testing the Cartesian product of every band on every profile.

**Initial finding:** the original three-axis proposal is not sufficient as written because "physical
scale" conflates two independent facts:

1. the site's total metric extent or volume; and
2. the bodies, vehicles, machinery, and portals its interfaces accommodate.

A one-room human-built cavern can be hundreds of feet across, while a four-room giant guard post may
have little total extent but giant-scale doors, furniture, and circulation. A six-node mine may cross
miles; a six-room house may fit on one lot. Graph scope and accommodation scale cannot recover this
difference by themselves.

The present recommendation is therefore a **provisional four-profile core**, not a locked magic four:

1. **Structural/exploration scope** - canonical functional domains, enterable spaces, connections,
   zones, levels, and room-level discovery surfaces. This replaces the misleading idea that one raw
   room count is the whole graph budget.
2. **Operational load** - designed simultaneous capacity, throughput over time, staffing, supply,
   storage, and support burden. This may be a typed vector rather than one scalar: a prison holds
   inmates, a court processes cases and visitors, and a mill processes material.
3. **Spatial envelope** - footprint, volume, horizontal travel distance, and vertical extent. It may
   be constrained by a building shell, geology, vehicle hull, city block, demiplane, or no ordinary
   exterior at all.
4. **Accommodation domains** - the scale and interface needs of intended bodies, vehicles, cargo,
   machinery, portals, and furniture. A site or zone may carry several domains plus explicit
   transitions between them.

Other independent concerns remain first-class profiles, but should not be mislabeled as kinds of
size:

- **topology:** linearity, branching, loops, chokepoints, vertical connectivity, and portal edges;
- **current state:** occupancy, density, activity, damage, abandonment, and resource failure;
- **challenge/resource pressure:** danger, attrition, rest access, opposition, and expected supplies;
- **temporal depth:** age, number and severity of transformations, and legibility of historical layers;
- **discovery/narrative density:** coordinated secrets, promises, factions, and active story-card load;
- **realm/physics profile:** gravity, geometry, time, matter, breach behavior, and other local laws;
- **realization resolution:** how much canonical structure is instantiated in full detail now versus
  held as deterministic persistent substructure for lazy expansion. This is an engine budget, never a
  license to erase physical rooms or discoveries from canon.

The distinction between canonical scope and realization resolution is essential for very large and
realm-scale sites. A city prison may canonically contain eight cellblocks and hundreds of cells without
requiring hundreds of heavyweight NPC/story records at first generation. Repeated cells can compile as
a structural assembly with stable identities; any enterable cell still exists and receives its local
discovery opportunity, while its deeper contents materialize deterministically when attention reaches
it. The semantic-scene and hierarchical-block research supports this site -> zone -> room -> assembly
shape; the two-stage generation research supports resolving semantic obligations before full geometry.

Each site, zone, subordinate complex, and breach-linked destination may carry its own profile. The
parent site holds an aggregate and the relationships among them. Thus a human prison, its giant-built
buried foundation, and its pocket-realm cell bank do not need one compromised global scale. A breach is
a typed edge between domains, with any size or physics transformation recorded on the edge.

**Implementation and maintenance cost:**

| Cost surface | Naive cross-product design | Factored profile design |
|---|---|---|
| Data/schema | Another axis appears everywhere | Add one versioned field/profile with provenance and defaults |
| Tables/content | Authors every combination | Authors a universal spine plus profile- and realm-specific modifiers |
| Generator | Nested conditionals for combinations | Each stage reads only the profiles it owns; constraints reconcile boundaries |
| Rendering | Realm/size special cases spread through code | Compiler consumes resolved dimensions, interfaces, physics, and asset tags |
| Persistence | Brittle positional records | Additive named fields, stable ids, schema version, deterministic migration |
| Testing | Exhaust every combination | Boundary tests per profile, pairwise interactions, adversarial fixtures, and realm conformance tests |

With five bands, exhaustive tables for three axes already imply `5^3 = 125` combinations; four imply
`625`; five imply `3,125`. Genesis must not build that way. In the factored model, operational-roster
rules read operational load; graph rules read structural scope and topology; the spatial compiler reads
the envelope and accommodation domains; secrets read exploration scope, history, and narrative density;
realm adapters supply data and constraints. Runtime work remains tiny compared with room compilation and
rendering. Maintenance grows roughly with the new rules actually introduced, not with every theoretical
combination.

The current executable engine reinforces the need for this redesign: `SpatialPlan.rooms[].scaleDomain`
is presently a single numeric multiplier assigned from large residents after the graph exists, and the
semantic pass may grow rooms to fit. Preserve that useful golden beat - large inhabitants receive usable
territory and transitional doors - but rewire it into construction-time accommodation domains rather
than treating a late resident-size repair as the future ontology.

An additional core profile should be admitted only when all of these hold:

1. two sites can match on the existing core but differ materially on the candidate property;
2. that difference changes at least two independent engine or player-facing decisions;
3. it cannot be derived reliably from existing facts;
4. it must persist, be queried, or carry provenance rather than existing only during compilation.

Otherwise it belongs as a derived value, categorical profile, local constraint, or realm modifier.

**Breach/realm scalability law:** keep the purpose, obligation, profile, hierarchy, and constraint
language realm-neutral. A realm contributes registered data, laws, vocabulary, assets, modifiers, and
solver constraints through shared interfaces; it does not add scattered `if realm == ...` branches to
the base dungeon generator. Invalid extensions fail loudly in authoring/validation and degrade through
declared runtime fallbacks. Realm-specific geometry should be local to zones/domains and breach edges,
not a mutation of global assumptions. This follows Genesis's existing universal-spine plus realm-skin
pattern and does not reopen the currently frozen founding realm-id slate unless Adam separately does so.

**Open recommendation:** reinterpret choice 3 as a **coupled, extensible multi-profile model**. Begin
with the four core profiles above, keep the exact number of bands unresolved, and keep topology, state,
challenge, history, discovery, realm physics, and realization resolution orthogonal. Do not lock the
core count until concrete dungeon and cross-realm counterexamples stop exposing missing independent
facts.

#### 8.12.2 Clarification - what an orthogonal profile means

"Orthogonal" does **not** mean optional flavor, unimportant, generated last, or unable to affect the
four core profiles. It means **a separate named control knob rather than another meaning hidden inside
the word size**. The profiles may constrain and modify one another through declared rules while
remaining independently stored, authored, tested, and changed.

The proposed division is:

- core site-envelope profiles answer **how much site exists, what it was built to do, how much space
  it occupies, and what can physically use it**;
- orthogonal profiles answer **how that site is connected, what happened to it, what it is like now,
  how dangerous and narratively dense it is, which physical laws apply, and how much detail the engine
  has currently materialized**.

Concrete comparisons:

- Two twenty-room human forts may match on all four core profiles. One can be a straight defensive
  sequence while the other is a looped hub with flanking routes. That is a **topology** difference,
  not a larger fort.
- The same city prison can be newly operational or built over six older institutions. Its footprint,
  capacity, and architecture can match while its **temporal depth** and secret network differ.
- The same warehouse can hold harmless grain or a sleeping dragon. **Challenge** changes enormously;
  size does not.
- Two otherwise identical archives can contain mundane tax ledgers or the evidence web of a kingdom-
  wide conspiracy. **Discovery density** differs without one archive becoming physically larger.
- A human-scale corridor in Fantasy and an equally sized corridor in a low-gravity realm share size
  facts. The realm's **physics profile** changes movement, furnishing constraints, hazards, and
  rendering, but does not need to redefine "medium corridor."
- A prison's one hundred cells remain canonical whether all cell records are fully populated at site
  creation or most begin as stable deterministic stubs. **Realization resolution** describes engine
  detail and cost, not the prison's true extent.

Keeping these profiles separate does not prevent interactions. A zero-gravity physics rule may remove
ordinary floor-clearance assumptions; severe historical collapse may reduce currently usable capacity;
a highly looped topology may support more secret routes; a Mythic breach may connect spatial envelopes
that ordinary geometry could not. The rule records which profile modified which other result and why.

The alternative is to call all of these "size axes." Then "large" can ambiguously mean many rooms,
high capacity, old history, dangerous encounters, dense secrets, complex loops, expensive simulation,
or strange physics. Tables and tests begin multiplying unrelated facts, and changing difficulty or
history risks accidentally changing architecture.

The actual open decision is therefore simpler than the terminology suggested:

> Should **size/site envelope** remain responsible for amount, function, extent, and physical fit,
> while topology, history, current state, danger, discovery, realm physics, and engine detail remain
> equally first-class but separately named profiles?

The recommendation remains **yes**. This gives every concern explicit authority while preventing one
giant "size" variable from becoming the whole dungeon generator in disguise.

#### 8.12.3 Ruling - editable rollers, replayability, and the affordable representation

Adam accepts the recommendation. Choice 3 now means a **coupled, extensible multi-profile model**:

- size/site envelope governs structural scope, operational load, spatial extent, and accommodation;
- topology, history, current state, challenge/resource pressure, discovery density, realm physics,
  and realization resolution remain separate, equally authoritative, interacting profiles;
- the four-profile envelope is the current sufficient core, not a sacred permanent count;
- exact band counts and numeric thresholds remain open for the table-design and expressivity pass.

The control knobs remain **editable rollers**. Human-readable tables are the authoring surface even
when the compiler emits a different normalized runtime representation. This is not merely a convenient
file format:

- tables let a human see probability, alternatives, and exceptional outcomes directly;
- they let Adam, beginning developers, and modders change the game without rewriting engine code;
- they preserve dice, weighted uncertainty, and inspectable rulings as part of Genesis's D&D soul;
- they make realm expansions additive content packs rather than generator forks;
- they keep source authorship distinct from runtime optimization.

The established author-in/compile-to discipline therefore applies to the redesign:

```text
human-readable roller tables and profile recipes
        -> schema validation, reference resolution, and constraint compilation
        -> normalized runtime records, indexes, and solver inputs
```

Generated runtime artifacts are never the normal editing surface. Each roll retains its table id,
row, band, modifiers, seed/provenance, and any constraint-driven reconciliation so a modder can trace
an in-game result back to editable source. Established canon or an explicit premise may fix a value;
otherwise the value is obtained through its roller. "Control knob" does not mean an opaque hardcoded
slider hidden from the table system.

Avoid both implementation traps:

1. do not author one giant table containing every profile and realm combination;
2. do not bury realm-specific probability changes in scattered engine conditionals.

Instead, a universal roller spine selects typed profile results, while purpose, context, doctrine,
history, and realm tables apply readable weights, additions, replacements, constraints, and Spice
licenses. The compiler validates that referenced tags and transformations exist. Engine stages consume
the compiled result without taking table authorship away from humans.

Adam also confirms the product priority:

> Prefer TTRPG freedom and effectively unbounded replayability over Baldur's Gate 3-style authored
> geometric accuracy. Genesis can afford the former and cannot afford the latter.

A top-down grid/graph-based representation may make this breadth feasible. The semantic systems -
purpose, history, topology, secrets, realm laws, persistence, and player-driven expansion - carry more
value than expensive literal depiction of every possible place. This is not permission for a cheap or
ugly presentation; it is a budget and product-soul ruling about where fidelity must live.

**Representation implication - deliberately deferred:** do not yet conflate three layers:

1. **canonical connection graph** - which spaces, zones, sites, and realms connect, including typed
   doors, passages, stairs, travel spans, and breaches;
2. **canonical local spatial plan** - metric cells/slots, shapes, elevation, portals, circulation,
   objects, and scale domains inside a room or locally coherent zone;
3. **presentation projection** - top-down grid, graph map, isometric diorama, theater frame, prose, or
   another view compiled from the same truth.

Whether graph plus local metric plan should be canonical, whether top-down should be the default
projection, and what happens to the current graphics engine are **not Question 12 rulings**. Adam assigns
them to **Wave 10 - Interim Visual Engine and Release Scope**, where the new graphics direction, target
captures, production cost, and renderer alternatives can be judged together. Question 12 contributes
only the already-accepted product constraint: favor TTRPG freedom and replayability over unaffordable
BG3-style geometric accuracy.

#### 8.12.4 Future-question assignments seeded by question 12

| Inherited ruling or open decision | Future owner |
|---|---|
| Structural scope, operational load, spatial envelope, and accommodation are separate but coupled; exact band counts remain open | **Wave 2 - Room Roster, Repetition, Spice, and Dungeon Ecology** owns profile tables, allocations, repeated-unit treatment, and expressivity testing |
| Accommodation domains may vary by site, zone, and breach-linked subsite | **Wave 6 - Creature Scale, Capacity, Squeezing, and Party Participation** inherits construction-time domains and decides creature/party mechanics at their boundaries |
| Topology is first-class but not a kind of size | **Wave 3** owns structural compilation and **Wave 4** owns portal/vertical/circulation edge semantics; neither should derive topology accidentally from room count alone |
| Canonical scope and current realization resolution are distinct; stable latent substructure may expand deterministically | **Wave 12 - Migration, Persistence, Acceptance Gates, and Build Order** owns ids, save evolution, lazy materialization, and reproducibility gates |
| Human-readable rollers remain the editable source; compiled records retain row/modifier/seed provenance | **Wave 12** and the table-compiler/modding work inherit this author-in/compile-to contract |
| Realm expansion uses a universal semantic spine plus registered data, constraints, assets, and modifiers rather than scattered realm branches | Every later wave, especially **Waves 3, 4, 6, 10, and 12**; the frozen founding realm-id slate remains intact unless separately reopened |
| Graph/local-grid/top-down/full-renderer choice | **Wave 10 - Interim Visual Engine and Release Scope**; explicitly deferred and not a Question 12 blocker |

Question 12 is resolved. Its exact table bands remain deliberately deferred to their owning table and
expressivity pass; no material functional/site-scale follow-up remains in Wave 1.

### 8.13 Pick up here - question 13: repeated functions without cloned rooms

Large institutions repeat functions: prison cells, barracks bays, dormitories, archive stacks,
workshops, classrooms, storage vaults, treatment rooms, mine headings, and ritual stations. Decide what
the engine treats as an individual room, a repeated physical unit, a functional domain, and a lazily
expanded detail record. The decision must preserve honest explorable architecture and per-room
discovery without forcing every repeated unit to carry a heavyweight independent story on creation.

**Open discussion frame - not yet a ruling:** three approaches expose the tradeoff:

1. **Every repeated unit is a fully independent room roll.** Forty prison cells receive forty complete
   room generations. This maximizes immediate specificity but inflates generation, secrets, NPC/story
   state, and DM attention; independent rolls also make a purpose-built cellblock look incoherently
   random.
2. **Collapse the whole repeated function into one abstract room.** "Cellblock: 40 cells" is one node
   and one content packet. This is cheap, but produces facade architecture: individual doors and cells
   either cannot be entered or have no persistent identity, violating exploration and the per-room
   discovery principle.
3. **Hierarchical repeated assemblies.** A parent functional domain rolls a count, shared layout and
   infrastructure, invariant requirements, and a controlled variance recipe. It compiles real stable
   child spaces or units. Every enterable child exists and can receive a lightweight local discovery;
   player attention promotes a child to richer contents and relationships. Group-level history,
   current use, and secrets create coordinated variation, while selected units receive exceptional
   differences through purpose, occupants, history, or Spice.

**Recommendation:** choice 3. A forty-cell prison should feel deliberately constructed as a cellblock,
not like forty unrelated dungeons, while Cell 17 can still contain scratched names, Cell 22 a loose
stone and medicine cache, Cell 31 evidence of an impossible former prisoner, and most cells quieter
but still inspectable. Shared assemblies reduce cost and improve coherence; stable child identities,
deterministic detail promotion, and bounded per-unit opportunities preserve TTRPG freedom.

#### 8.13.1 Ruling and follow-up - the SNES cell model

Adam selects **choice 3, hierarchical repeated assemblies**. The intended player-facing cadence is
similar to old Squaresoft SNES exploration: most prison cells appear to contain nothing of immediate
importance; some contain treasure; some contain an NPC who will talk; some contain an NPC who refuses
to talk. Repetition supplies rhythm and makes exceptions legible rather than demanding that every cell
perform as an authored set piece.

The parent assembly owns shared facts and systems:

```text
cell count and layout pattern
+ guard/control/circulation structure
+ common construction and required fixtures
+ shared supply, sanitation, light, locks, and hazards
+ group history, current condition, and occupancy pressure
+ allowed child-state distribution and variance budget
```

Each enterable child receives a stable identity and a lightweight state rather than a full independent
room generation:

- **visibly empty/quiet** - no obvious actor, loot, or active event;
- **environmental trace** - wear, residue, writing, damage, sound, smell, or practical evidence;
- **resource/cache** - ordinary supplies, concealed consumables, treasure, contraband, or tools;
- **occupied and receptive** - an NPC willing to engage under current conditions;
- **occupied and guarded/refusing** - an NPC present but unwilling, unable, afraid, hostile, bound by
  orders, or requiring changed circumstances before engagement;
- **hazard/obstacle** - a local danger or access problem;
- **secret/story-bearing** - a child carrying or contributing to a coordinated larger discovery.

These states remain editable rollers compiled through the same author-in/compile-to pipeline. Purpose,
current occupancy, history, resource pressure, and Spice alter weights. The parent prevents incoherent
independent-roll excess: it can cap treasure, NPC density, exceptional variance, and major-secret
participation while still permitting a rare run in which several unusual cells share one cause.

An NPC refusing to talk is a legitimate state, not a generation failure. The record needs only the
observable refusal and its stable cause or unlock condition initially; deeper personality and network
materialize when player attention or changed circumstances require them. Refusal does not automatically
create a quest, but it must remain consistent when revisited.

**Open follow-up - what does "most cells are nothing" mean?** This must reconcile the SNES cadence with
Question 11's ruling that every room receives a discovery opportunity and quiet rooms can reward
attention:

1. **Literally inert:** most cells have no actor, loot, useful observation, inspectable detail, or
   gameplay contribution beyond floor space. This is maximally clean but partially reverses the
   meaningful-room law.
2. **Nothing obvious, lightweight on attention:** most cells look empty on entry and do not announce an
   interaction. If deliberately examined or made relevant by another clue, they can yield a small
   truthful observation - guard routine evidence, acoustics, old tally marks, recent absence, a usable
   hiding/rest position, confirmation that a searched-for person was not held there, or participation
   in a shared secret network. Most still contain no loot, NPC, quest, or unique spectacle.
3. **Block-level meaning only:** ordinary cells remain inert individually, but searching or studying
   the cellblock as a whole yields its environmental and discovery information. This avoids repetitive
   inspection but makes individual cells less meaningful.

**Recommendation:** choice 2 with a block-level convenience. "Nothing" should be the honest surface
state and the common result, not a UI sparkle or mandatory bespoke vignette. Every enterable cell keeps
a lightweight opportunity if attention or a clue targets it, while broad actions such as searching the
cellblock can aggregate routine observations so the optimal play is not clicking forty identical doors.

#### 8.13.2 Ruling and follow-up - reward attention, not container clicking

Adam accepts **nothing obvious, lightweight on attention, with block-level convenience**. Thorough
players should receive some reward, but optimal play must not become the Bethesda pattern of inspecting
every box, drawer, barrel, corpse, shelf, and cell individually. A chat interface naturally makes that
behavior slower than clicking through a 3D room, but interaction friction alone is not the balancing
mechanism: a player can still say "I search every container."

Use **scope-and-intent search**:

1. **Automatic room read** - entering or observing supplies obvious occupants, exits, major hazards,
   visible resources, functional identity, and salient anomalies without a search tax.
2. **Focused inspection** - the player names a target, suspicion, method, or question: examine Cell 17's
   masonry, look for guard messages, check the desk for false compartments, use a pole under the beds.
   The engine resolves the relevant opportunity with the chosen skill, tool, magic, risk, and time.
3. **Systematic sweep** - the player declares a broad careful search of the cellblock, storeroom, office,
   or repeated assembly. The engine aggregates interchangeable children/containers into one action,
   advances the appropriate time/pressure/noise, and returns a concise packet of meaningful findings
   rather than requiring dozens of turns.

Per-room discovery opportunity does **not** imply per-container secret rolls. Interchangeable barrels,
drawers, shelves, beds, and crates normally form one assembly-level search surface. A particular object
receives stable independent identity only when purpose, state, a clue, an inhabitant, a resource record,
history, Spice, or player action distinguishes it.

This preserves both sides of the ruling:

- careful play can uncover extra consumables, minor treasure, evidence, practical leverage, safer
  routes, and story connections;
- ordinary forward play receives the information necessary to understand and navigate the place;
- mandatory progression and accepted-contract service are never gated solely behind an untelegraphed
  exhaustive sweep of generic clutter;
- repeating the same search wording does not mint new rolls. The discovery packet is stable until the
  player brings a materially new method, clue, tool, spell, access state, or changed world state;
- group searches report ordinary negatives concisely: "No other occupied cells, fresh messages, or
  usable supplies" is valid evidence without forty separate empty responses.

The chat interface therefore removes repetitive input without removing D&D search decisions. Search
remains about **where, why, how, and at what cost**, not how many nouns the player lists.

**Open follow-up - what does a systematic sweep guarantee?**

1. **Guaranteed exhaustive discovery:** sufficient declared time finds every secret in the scope. This
   strongly rewards patience but collapses skills, tools, magical reveal vectors, and uncertainty.
2. **One broad roll:** the sweep samples everything through one check and may miss even routine facts.
   This is quick but makes careful play feel arbitrarily fruitless and invites reroll fishing.
3. **Layered certainty by method:** a systematic sweep automatically finds all routine information and
   resources its declared method can reveal. Concealed, trapped, encoded, magical, socially withheld,
   or otherwise gated opportunities still require the appropriate check, tool, clue, access, or spell.
   The action resolves all eligible checks once and records what remains inaccessible without exposing
   secret spoilers. Repetition gains nothing unless the approach or state changes.

**Recommendation:** choice 3. Searching every cell visually should find ordinary scratches, abandoned
items, and obvious loose masonry; it should not automatically read invisible writing, open a locked
false wall, make a terrified prisoner trust the party, or recognize a cipher. Thoroughness guarantees
coverage, while character capability and chosen method determine depth.

#### 8.13.3 Ruling and follow-up - systematic search produces inspectable leads

Adam selects **layered certainty by method**. This matches a real tabletop session: a careful search
produces a list of things that can be investigated, while skill rolls and contextual obstacles govern
what the party can learn or change about them.

A systematic sweep therefore compiles a stable **inspection opportunity list** for its declared scope
and method. An opportunity may record:

```text
stable target and physical/narrative anchor
+ currently perceivable tell
+ eligible approaches, skills, tools, spells, or relationships
+ contextual obstacle or access requirement
+ time, noise, danger, resource, or social cost
+ linked discovery packet or practical result
+ attempt state and materially new retry conditions
+ table/row/seed provenance
```

The opportunity is not itself a spoiler. The player should perceive the **tell**, not the hidden answer:

- "The mortar around the third stone is newer" rather than "DC 15 secret compartment."
- "One prisoner watches the guards before meeting your eyes" rather than "persuasion-gated witness."
- "The bottom drawer stops short of the desk's full depth" rather than "hidden evidence cache."
- "The faded sigil disappears under ordinary lamplight" rather than "requires magical illumination."

Context gates are as important as numerical skill gates. A character may recognize the loose stone but
still lack privacy, leverage, a crowbar, the correct language, enough time before patrol, permission to
break evidence, or a safe way past its trap. Conversely, established knowledge, the right NPC, a prior
clue, or a clever tool can bypass a roll honestly.

Search state is persistent. Rephrasing the same attempt does not reroll the opportunity. A new skill,
method, tool, relationship, clue, access route, or changed world state can reopen it; failure may reveal
partial information or impose a consequence according to the owning reveal recipe rather than simply
returning a content-free "no."

**Open presentation follow-up:** who sees the inspection list?

1. **Literal player checklist.** The UI lists every inspectable target and its available roll. This is
   clear and accessible, but becomes gamey, advertises content density, and encourages clearing every
   icon.
2. **Unstructured prose only.** The DM mentions details without a machine-readable opportunity hand.
   This feels natural but makes stable gating, persistence, aggregation, and reliable fulfillment much
   harder.
3. **Structured DM hand, narratively surfaced.** The engine maintains the full opportunity list. The DM
   presents currently perceptible tells naturally, prioritizes a small relevant subset, summarizes
   routine negatives, and responds to free-form player questions by querying the same stable records.
   Accessibility modes may expose clearer prompts without turning every room into a checklist.

**Recommendation:** choice 3. The structured list belongs behind the screen. The player receives a
legible description and can ask or act freely; the DM receives enough stable structure to be fair,
persistent, skill-aware, and consistent across revisits.

Adam selects **choice 3, structured DM hand narratively surfaced**. Question 13 is resolved. Repeated
spaces are coherent hierarchical assemblies with stable children; most children are quiet on the
surface; broad searches aggregate routine inspection; systematic coverage finds everything the method
can ordinarily reveal; gated opportunities remain gated by capability and context; and the full
inspection list stays behind the screen while the DM presents perceptible tells naturally.

#### 8.13.4 Future-question assignments seeded by question 13

| Inherited ruling | Future owner |
|---|---|
| Parent functional domains compile stable repeated child spaces with invariant requirements, shared systems, controlled variance, and bounded exceptional children | **Wave 2 - Room Roster, Repetition, Spice, and Dungeon Ecology** owns repeat-count tables, variant recipes, density caps, and expressivity tests |
| Repeated children must be real and enterable rather than facade labels | **Wave 3 - Architecture, Structural Stamps, and Degradation** owns their spatial assembly and legal degradation; **Wave 5** owns fixtures, dressing, clutter, and quiet-space presentation |
| Every enterable child retains a lightweight local discovery opportunity, while parent/site networks coordinate larger truths | **Wave 4 - Portals, Secrets, Vertical Connections, and Circulation** owns reveal vectors, secret-network placement, and spatial access |
| Search uses automatic read -> focused inspection -> systematic sweep; interchangeable clutter is one search surface; identical retries do not reroll | Future **interaction/action-resolution** design and **Wave 4** inherit time, skill, tool, spell, consequence, and retry mechanics |
| The engine holds a stable inspection-opportunity hand and the DM narratively surfaces perceptible tells | **Wave 9 - DM Strategic Cards and Environmental Authority** owns hand capacity/prioritization; accessibility and player-facing presentation belong to **Wave 10** |
| Receptive/refusing NPC states are persistent and causal but lazily expand under attention | Future **NPC/social and bounded-place generation** work inherits response states, unlock conditions, and revisit consistency |
| Exhaustive generic-container play may yield bounded extra resources but is never required for ordinary comprehension or mandatory progression | Future loot/inventory/difficulty work and **Wave 7** inherit the reward curve, search cost, and progression-safety gates |

### 8.14 Pick up here - question 14: what becomes of the current dungeon d200?

The current `Dungeon Area Type` d200 is valuable, but it is not one clean kind of roller. A single row
may simultaneously declare topology, function, shape, dimensions, a structural stamp, a side room,
fixture state, history, hazard, vertical connection, secret, or anomaly. Concrete examples:

- row 001 combines a narrow-passage shape, exact dimensions, and a blind side alcove;
- row 150 combines the **Prison Block** function, a 30-by-50-foot envelope, a central circulation hall,
  ten repeated cells, barred doors, and a present condition;
- row 164 combines **Kitchen**, dimensions, cold-storage dependency, hearth fixtures, and collapse;
- row 180 is primarily a multi-level structural/pit recipe;
- row 195 is primarily a distortion/anomaly outcome rather than an ordinary room shape;
- row 197 is a vertical transport mechanism plus gear-room assembly;
- row 200 is a planar-gate function, special geometry, ritual fixture, gallery, and anomaly tell.

Rolling this flat table independently for every graph node is exactly the behavior the function-first
redesign is replacing. Deleting it wholesale would discard unusually rich authored material and violate
the golden-beat preservation law.

Three dispositions:

1. **Keep the d200 as the final room roller.** Purpose/context merely filters or reweights whole rows.
   This preserves the familiar table with little authoring work, but function, topology, architecture,
   condition, and anomaly remain fused. It cannot guarantee a complete operating model cleanly and
   makes new realms multiply whole-row variants.
2. **Mine it for fragments and retire every whole row from runtime.** Split shapes, dimensions,
   functions, side areas, structures, mechanisms, and anomalies into new rollers. This gives maximum
   composability, but discards excellent authored relationships - such as a prison block's cells and
   control hall - and risks rebuilding those relationships less elegantly.
3. **Decompose it while preserving proven composite recipes.** Audit every row into typed components.
   Atomic facts populate new human-readable rollers; coherent relationships become named hierarchical
   room/assembly recipes; anomaly and history clauses move to their owning passes. Original row ids and
   prose remain as provenance, regression fixtures, and a legacy composite recipe where the whole row
   still expresses a useful arrangement. Purpose, context, site profiles, and topology decide which
   components or recipes are eligible before geometry is compiled.

**Recommendation:** choice 3. The new system should be able to invoke `Prison Block` as a coherent
assembly recipe without letting a random flat d200 roll decide that an unrelated graph node must become
one. `Planar Gate Room` may survive as a high-Spice licensed composite; its octagon, gate assembly,
gallery, and ambient tell can also become reusable typed parts. The table remains a human-readable
source and design corpus, but it no longer bears every generation responsibility at once.

The research supports this split: semantic scene descriptions express mandatory/optional elements and
relationships; hierarchical blocks preserve meaningful assemblies; two-stage generation resolves
semantic intent before geometry; constraint/template techniques legalize the selected recipe. Exact
row-by-row dispositions belong to the later table audit after the ontology is closed, not to Question
14's conceptual ruling.

#### 8.14.1 Ruling and follow-up - decompose, band, rewrite, and preserve a recovery point

Adam selects **decompose the d200 while preserving strong composite recipes**. The row audit happens
only after the redesign decisions are complete and the implementation waves are specced. No table or
engine decomposition is authorized during this discussion.

Every resulting editable roller must be organized through the canonical Spice Curve, and every table
receives a deliberate writing pass to ensure that its results are sufficiently flavored. Keep two
different quality axes explicit:

- **Spice band** grades how far the result departs from ordinary genre reality;
- **writing quality/flavor** determines whether the row is concrete, evocative, usable by the DM, and
  native to the relevant purpose/context/realm even when it is Grounded.

A richly written Grounded pantry is not "less flavorful" than a Mythic planar larder. Conversely,
purple prose does not make a mechanically ordinary result Mythic.

Table class still governs the honest ceiling:

- **Spark** detail tables ordinarily cover Grounded and Textured;
- **Fork** direction/architecture tables may reach Strange;
- **Commitment** consequence/anomaly tables may carry Volatile and Mythic outcomes.

Decomposition should improve this discipline. An ordinary room-shape table no longer needs a planar
gate hidden at its hot end merely to cover all five bands; the Planar Gate belongs to a licensed
Commitment/anomaly or composite-recipe table. Within every eligible band up to a table's honest ceiling,
the authoring pass supplies sufficient coverage and variety for band-first rolling. Exact distributions
remain governed by the region/context Spice system rather than by row order alone.

**Mandatory pre-implementation recovery gate - assigned, not executed now:** after design decisions
are complete and the actual redesign waves are specced, but before any destructive table/compiler/
engine migration begins, preserve today's working game in a verified recovery package.

Git answers most but not all of the concern:

- a clean commit plus an immutable tag can reproduce every tracked ordinary Git file exactly;
- the old build can be opened safely in a separate worktree at that tag without rewinding current work;
- if redesign work has already landed on shared history, recovery can branch from the tag or revert the
  redesign commits rather than using a destructive reset;
- Git LFS commits store pointers, not the asset bytes themselves. Recovery also requires the referenced
  LFS objects to remain available;
- untracked/ignored files, browser-local saves, external cold-shelf material, and other local state are
  not protected merely by a Git commit.

The later gate should therefore create and verify all of the following before implementation:

1. a clean named pre-redesign commit and immutable tag with recorded SHA;
2. a fresh-worktree launch/check of that tag with the build-required LFS assets materialized;
3. an explicit manifest and checksums for the required LFS/cold-shelf assets;
4. a portable Git bundle containing Git history and refs - noting that a bundle still does not contain
   LFS object payloads;
5. a materialized working-tree archive for Google Drive, plus exported representative saves/seeds and
   a small proof capture so recovery verifies behavior rather than files alone;
6. confirmed remote/tag/LFS backup only when Adam authorizes the external push/upload at that future
   gate.

A zip of the materialized repository snapshot is useful disaster insurance, but the tag is the easier
day-to-day rollback mechanism; the bundle plus asset manifest makes the archive auditable. Use both
rather than trusting either Git history or one opaque zip alone. This task belongs to **Wave 12 -
Migration, Persistence, Acceptance Gates, and Build Order** and becomes the first gate of the eventual
implementation plan.

**Open writing-schema follow-up:** how should each human-readable row preserve both machine precision
and sufficient flavor?

1. **One prose result cell.** Mechanics and flavor remain blended in one paragraph. This is pleasant to
   read but forces the compiler/DM to infer requirements, dimensions, and relationships from prose.
2. **Pure mechanical table plus separate flavor table.** This is precise but doubles lookup surfaces,
   invites drift, and makes mod authoring harder.
3. **One readable row with distinct contract and flavor fields.** A row carries a concise result name,
   typed semantic/mechanical fields or tags, Spice band and scope where relevant, plus one evocative DM
   fragment/tell. The compiler consumes the contract; the DM uses the flavor; both share one row id and
   cannot drift apart silently.

**Recommendation:** choice 3. For example, a cell-variance row could read as one ordinary Markdown row:

```text
Result: Recent transfer marks
Contract: trace; custody-history; wall; no-loot
Band: Grounded
DM fragment/tell: Fresh tally cuts stop at seven. An older set beneath them was plastered over.
```

This remains approachable to a beginning developer or modder, gives the compiler reliable structure,
and guarantees that even plumbing tables receive an intentional writing pass without asking engine code
to parse literary prose as geometry.

#### 8.14.2 Ruling and follow-up - typed handles for narrative-card placement

Adam accepts **one readable row with distinct contract and flavor fields** and asks whether the contract
needs tags so the DM can place narrative cards easily. The answer is **yes, but not unrestricted
free-form tag soup**.

The existing Walk Card Dealing proposal already scores `semanticAffinity`, topology, capacity, pacing,
secret synergy, and reward fit, while the room-compiler research calls for semantic sockets and required
affordances. Those systems need machine-readable handles. Inferring them from the DM fragment would make
placement unreliable, expensive, hard to validate, and hostile to mods.

Three choices:

1. **No tags; infer from prose.** Easiest table writing, but the DM/compiler must guess that "newer
   mortar" provides a wall anchor, concealed-space possibility, and custody-history evidence.
2. **Flat free-form tags.** Every author adds arbitrary words such as `wall`, `clue`, `secret`, `prison`,
   and `good-for-quest`. This initially works but quickly develops synonyms, typos, realm-specific
   dialects, dead tags, and untestable card matching.
3. **Controlled typed semantic contracts.** Rows use a small namespaced vocabulary for facts they
   guarantee. The compiler validates those terms, inherits context from parent records, and emits an
   effective affordance profile. Narrative cards declare hard requirements, soft preferences,
   exclusions, scope, and capacity cost against the same vocabulary.

**Recommendation:** choice 3. A row might remain compact and human-readable:

```text
Result: Recent transfer marks
Contract: anchor:wall; evidence:custody-history; reveal:visual; payload:none
Band: Grounded
DM tell: Fresh tally cuts stop at seven. An older set beneath them was plastered over.
```

The row does not repeat facts supplied by its parents. If it was rolled for Cell 17 inside an active
city prison, the compiled effective profile may merge:

```text
site: institution:prison; state:active; access:restricted
zone: function:cellblock; surveillance:guarded; assembly:repeated-cells
room: function:cell; privacy:isolated; anchors:[wall,bedding,door]
row:  evidence:custody-history; reveal:visual
```

The normalized vocabulary should distinguish at least:

- **function/identity** - what the site, room, object, or NPC is for;
- **anchors/sockets** - wall, desk, body, prisoner, ledger, container, altar, portal, water, machinery;
- **affordances** - conceal-small, hold-document, private-conversation, witness, rest, bypass, sabotage;
- **access/state** - public, restricted, locked, guarded, submerged, ruined, occupied, observed;
- **reveal vectors** - visual, acoustic, tactile, social, tool, lore, magic, breach resonance;
- **payload/resource kinds** - evidence, consumable, treasure, route, NPC, hazard, lore, mechanism;
- **scope/capacity** - child, room, zone, site, relational; minor/major beat capacity where relevant.

These names are illustrative, not a prematurely locked ontology. Each term eventually belongs to a
validated registry with definitions, aliases/deprecations, eligible parents, and mod-extension rules.
Authoring validation fails loudly on an unknown term; runtime never silently treats a typo as a valid
affordance.

Narrative cards use richer placement contracts than a Boolean tag match:

```text
requiresAll: facts that make placement legal
requiresAny: alternate legal anchors or reveal vectors
prefers:     thematically stronger homes
excludes:    contradictions or unsafe contexts
scope:       child / room / zone / site / relational
consumes:    narrative, secret, reward, or spatial capacity
```

For example, a hidden medicine card might require `affordance:conceal-small`, prefer
`function:cell` or `function:infirmary`, exclude `state:submerged`, and consume a minor resource/secret
slot. The missing-daughter note might accept a personal cache, writing surface, or document anchor;
prefer a location connected to the barkeep, bandits, or custody; and require a reveal vector the party
can eventually exercise. A MUST PLAY card still cannot violate its hard requirements; if no eligible
home appears inside its service horizon, the scheduler creates the previously ruled diegetic delivery
or dedicated hook opportunity.

The DM does not sort raw tags manually. The engine uses the effective affordances to produce a thin
ranked hand of legal narrative cards for the current room; the DM chooses, narrates, delays with a
recorded reason, or lets the scheduler resolve according to priority. Hidden tags never become player
knowledge merely because they exist in the contract.

The controlled vocabulary is a real maintenance surface, but its cost is far lower than hardcoded
purpose/realm/card combinations. It also makes mods scalable: a mod can reuse core affordances and may
register namespaced additions with validation instead of teaching every engine stage new prose.

**Open confirmation:** adopt controlled typed semantic contracts as the narrative-card placement
language, with inheritance and compiler-derived effective affordances, rather than prose inference or
flat tags.

Adam confirms the system. Question 14 is resolved: decompose the current d200 into typed rollers and
preserved composite recipes; organize eligible results through honest Spice bands and class ceilings;
give every table a dedicated flavor-writing pass; author each row with distinct machine contract and DM
tell fields; and compile controlled inherited semantic affordances for narrative-card placement.

#### 8.14.3 Future-question assignments seeded by question 14

| Inherited ruling | Future owner |
|---|---|
| Audit every d200 row into atomic facts, hierarchical recipes, history/state clauses, mechanisms, and licensed anomalies while preserving source ids/prose and golden composites | **Wave 2** owns functional/recipe decomposition; **Wave 3** owns shapes/structures; **Wave 4** owns portals/secrets/connectors; **Wave 5** owns fixtures/dressing/quiet-room material |
| Every resulting roller is Spice-banded within its honest Spark/Fork/Commitment ceiling | The later **table-design and expressivity pass** owns band coverage, distribution audits, and edge-case rolls; no table receives fake high-Spice content merely to fill five bands |
| Every table receives a flavor-writing pass, including Grounded plumbing tables | The future **writing/content wave** must gate for concreteness, usability, realm/purpose voice, repetition, and sufficient row variety separately from mechanical validation |
| One row carries distinct result, typed contract, band/scope where relevant, and evocative DM tell | **Wave 12/table compiler** owns schema, validation, compiled normalization, provenance, and source-to-runtime traceability |
| Controlled namespaced contracts compile inherited site/zone/room/row facts into effective affordances | **Waves 2-5** define their domain vocabularies; **Wave 9** consumes them for legal narrative-card matching; **Wave 12** owns registry/version/mod-extension rules |
| Cards match with hard requirements, alternate anchors, soft preferences, exclusions, scope, and capacity rather than Boolean prose keywords | **Wave 9 - DM Strategic Cards and Environmental Authority** owns scoring, thin-hand presentation, service-horizon interaction, and validation |
| Preserve a tagged, verified, LFS-complete recovery point plus Git bundle and materialized Google Drive archive before implementation | **Wave 12** first implementation gate; execute only after redesign/spec closure and explicit authorization, not during this discussion |

### 8.15 Pick up here - question 15: what does the player know on entering a room?

The engine may know original function, current function, believed function, occupants, history layers,
resource systems, secrets, and narrative-card homes. The player should not receive that entire canonical
record as a label, but ordinary architecture must also remain legible: recognizing an obvious kitchen
should not require a ritual of searching every hearth.

Questions 11 and 13 already constrain the answer:

- entry provides an automatic room read of obvious occupants, exits, hazards, resources, function, and
  salient anomalies;
- hidden content remains behind perceptible tells, methods, skills, tools, context, and inspection;
- the DM holds structured truth and opportunity records while surfacing only currently perceptible facts;
- player discoveries persist rather than being forgotten between visits.

Three approaches:

1. **Canonical labels immediately.** The UI/DM states "original prison kitchen, later converted to a
   cult dormitory; secret necromantic drain below." This is clear but destroys inference, discovery,
   misinterpretation, and slow-drip history.
2. **Sensory prose only until the player investigates.** Even an obvious barracks or chapel is never
   named automatically. This protects mystery but makes the player fight the interface to understand
   ordinary rooms and lets DM phrasing accidentally hide basic affordances.
3. **Graded evidence and confidence.** The engine separates canonical truth from observations and
   player beliefs. Obvious present facts and unmistakable functions are named automatically; visible
   evidence is described; character expertise adds justified interpretations; focused action reveals
   deeper original use or transformation; secrets remain gated. The player may hold an uncertain or
   mistaken belief, but the engine does not lie without a canonical deception, illusion, or sincere
   in-world misunderstanding.

**Recommendation:** choice 3, using a reveal ladder:

```text
manifest     -> unmistakable current facts; automatic room read
legible      -> ordinary function inferred from visible architecture; name when confidence is high
specialist   -> character background, skill, tool, lore, or relationship supplies interpretation
investigated -> focused action establishes history, mechanism, contradiction, or hidden relationship
concealed    -> secret network, deception, inaccessible evidence, magic, or breach gate
confirmed    -> corroborated truth recorded as player knowledge
```

Example: in a prison kitchen repurposed by cult squatters, entry reveals large hearths, grease channels,
food-preparation surfaces, bedrolls, occult chalk, and visible occupants. The DM may simply call it an
old institutional kitchen now used as a camp because that is architecturally obvious. It does not reveal
the sealed necromantic drain, the date of conversion, or which cultist knows its purpose. A cook may
recognize the meal throughput; a mason may notice the drain predates the ovens; a systematic magical
inspection may expose the lower laboratory connection.

Store at least three separate records:

- **canon:** what is actually true, including source/provenance;
- **observations:** what the party has directly perceived or established;
- **beliefs/hypotheses:** current interpretation, confidence, supporting evidence, and contradictions.

The DM narrates from the party's knowledge boundary, not from hidden canon. Revisit summaries can use
confirmed observations without rerolling or forcing the player to rediscover an obvious room.

**Open decision:** choose the reveal model and decide whether obvious function names may be stated
automatically when the architecture makes them unmistakable.

#### 8.15.1 Ruling and follow-up - graded reveal accepted; who owns knowledge?

Adam accepts **graded evidence and confidence**, including automatic naming of an obvious function when
the visible architecture makes it unmistakable. The DM does not force the player to investigate an
ordinary kitchen merely to earn the word "kitchen," and it does not leak original purpose, transformation
history, secret mechanisms, or hidden card content merely because those facts are canonical.

The accepted knowledge ladder is manifest -> legible -> specialist -> investigated -> concealed ->
confirmed, with canon, observations, and beliefs/hypotheses stored separately. This creates one material
follow-up for a party-based game: **who knows a specialist observation or discovery?**

1. **Instant universal party knowledge.** Anything learned by one character becomes in-world knowledge
   for every party member, including separated characters. This minimizes bookkeeping but breaks
   witness logic, party splitting, secrets, and effects that target perception or memory.
2. **Strict per-character knowledge.** Every observation stays with its witnesses until the player
   explicitly makes characters communicate it. This is faithful but creates conversational chores and
   risks making optimal play consist of repeatedly telling companions obvious facts.
3. **Source-attributed knowledge with automatic ordinary sharing.** Every observation records witnesses,
   source, confidence, shareability, and when/how it entered shared party knowledge. Co-present cooperative
   characters automatically exchange ordinary findings; a specialist may voice the interpretation as
   party chatter. Separated characters learn it only through reunion or a communication channel.
   Canonical withholding, private visions, deception, curses, memory alteration, hostile relationships,
   or deliberate secrecy can keep a fact individual.

**Recommendation:** choice 3. The player should not micromanage "I tell everyone about the kitchen," but
the world should still know that only the rogue saw the hidden hand signal, the wizard alone remembers a
dream-realm sigil, or the separated scout has not yet warned the main group about the pit.

A knowledge record may need:

```text
fact/observation id and canonical source
+ direct witnesses and interpreting character
+ perceived tell versus inferred meaning
+ confidence and supporting/contradicting evidence
+ shareability and current holders
+ communication event or automatic co-present share
+ deception, memory, secrecy, or expiry rules where canonically licensed
```

The player may see character-specific information because this is a single-player game while the DM
still respects which characters know it in-world. Exact UI, companion autonomy, split-party narration,
and communication mechanics belong to **Wave 6 - Creature Scale, Capacity, Squeezing, and Party
Participation** and the later DM/interface waves; Question 15 needs only the knowledge ontology.

#### 8.15.2 Ruling and follow-up - protected private knowledge

Adam selects **source-attributed knowledge with automatic ordinary sharing**, provided that facts which
remain individual for canonical reasons are genuinely protected. Private knowledge is a high-value
story mechanism, not an annotation the DM may casually collapse into party knowledge.

Use explicit knowledge scopes and sharing policies:

```text
dm-only canon          - true but not yet perceived by any player character
character-private      - held by named witnesses/knowers only
party-shared           - ordinary cooperative party knowledge
public/established     - broadly available in the relevant world context
```

A private record also needs a policy:

- **shareable by choice** - the knower may communicate it; a player-controlled character's decision
  belongs to the player;
- **withheld by a canonical actor** - an NPC/companion conceals it for a stable goal, fear, loyalty,
  shame, bargain, or relationship reason;
- **conditionally shareable** - a curse, geas, language barrier, psychic block, memory damage, distance,
  surveillance, or other established obstacle prevents ordinary communication;
- **experiential/partial** - the knower can describe an experience but cannot transfer its full sensory,
  magical, emotional, or prophetic certainty;
- **unrecognized** - a character perceived the tell but has not understood what it means; later context
  may promote it without retroactively giving other characters the original experience.

Protection applies to every output channel, not narration alone. Until sharing becomes canonical, a
private fact must not leak through:

- automatic party journals or quest summaries;
- another character's dialogue, action suggestions, or skill prompts;
- map markers, room labels, codex entries, or objective text;
- narrative-card placement that assumes an uninformed character can act on it;
- DM recap language, NPC reactions, or renderer/UI telegraphs that expose the hidden answer.

The record remains persistent across saves, rests, party splitting, companion departure, and revisits.
If the sole knower dies, leaves, forgets, or refuses to share, the information may genuinely be lost to
the active party until another evidence route appears. Secret networks should ordinarily provide fair
independent evidence when progression requires the truth, but they need not erase the consequence of a
lost personal confidence or private story.

Private knowledge cannot be minted arbitrarily "for drama." It requires provenance and a canonical
reason. The DM cannot decide that a player-controlled character silently withholds an ordinary finding;
the player chooses. NPC companions may withhold according to their established goals, relationships,
and knowledge policies. The DM may create pressure and opportunity around sharing, but not force the
reveal merely because a priority card wants resolution.

**Open follow-up - what does the human player see?** Character knowledge and player knowledge are not
the same in a single-player party game:

1. **Strict perspective secrecy.** The human sees only what the currently controlled/present character
   knows. This minimizes metagaming but can hide excellent companion/private-character story from the
   only human audience and makes party switching awkward.
2. **Player sees every character's private record immediately.** The UI exposes all private knowledge
   with holder labels while the DM enforces in-world separation. This supports dramatic irony but can
   spoil NPC companion secrets and burdens the player with constant anti-metagaming.
3. **Perspective-gated dramatic irony.** When a player-controlled character directly experiences a
   private scene or discovery, the human sees it and a private journal entry identifies its holder;
   other characters remain ignorant in-world. NPC/companion withheld facts remain hidden from the human
   until an earned scene, viewpoint handoff, revelation, or explicit design license exposes them.
   Shared facts promote into the ordinary party record.

**Recommendation:** choice 3. It lets the game tell the player a rogue's private discovery or a wizard's
vision without pretending the whole party knows, while preserving companion mysteries and earned
revelations. The UI and DM must label viewpoint and holder clearly enough that dramatic irony feels
intentional rather than like a continuity bug.

Adam selects **choice 3, perspective-gated dramatic irony**. Question 15 is resolved. Obvious rooms are
legible without investigation taxes; deeper function/history/secret truth follows graded evidence;
knowledge retains witnesses and provenance; ordinary co-present sharing is automatic; canonically
private facts are protected across every output channel; and the human sees private discoveries made by
player-controlled viewpoints without receiving unearned NPC/companion secrets.

#### 8.15.3 Future-question assignments seeded by question 15

| Inherited ruling | Future owner |
|---|---|
| Canon, observations, and beliefs/hypotheses are separate persistent records with confidence, evidence, and contradictions | **Wave 12 - Migration, Persistence, Acceptance Gates, and Build Order** owns schemas, migrations, save persistence, provenance, and knowledge regression gates |
| The DM narrates from the active party/viewpoint knowledge boundary and may not leak hidden canon through recaps, prompts, objectives, maps, or card placement | **Wave 9 - DM Strategic Cards and Environmental Authority** owns prompt/digest partitioning and card eligibility; **Wave 10** owns player-facing leakage gates |
| Co-present cooperative characters automatically share ordinary findings; split characters require reunion or communication | **Wave 6 - Creature Scale, Capacity, Squeezing, and Party Participation** owns splitting, witness sets, communication channels, and reunion behavior |
| Canonically private knowledge has explicit holders and share policies; the player controls whether a player character voluntarily shares it | Future **party/companion and NPC social systems** own withholding motives, relationship effects, confessions, coercion, and agency protections |
| Perspective-gated dramatic irony shows player-character private scenes to the human but preserves NPC/companion mysteries until earned | Future **companion narrative design**, **Wave 9**, and **Wave 10** own viewpoint scenes, private journals, holder labels, and revelation presentation |
| Obvious function may be named automatically; specialist/investigated/concealed truth remains gated | **Wave 4** owns reveal vectors and secret access; future DM/writing passes own legible descriptions that neither obscure ordinary function nor leak hidden truth |

### 8.16 Pick up here - question 16: support, subordinate purpose, occupation, or secret?

The design already allows a primary purpose plus zero to two subordinate purposes, and it allows later
occupants, hidden complexes, and exceptional functions. Those categories need sharper boundaries or the
engine will label every interesting room cluster a "secondary purpose" and lose causal clarity.

Concrete cases:

- a prison kitchen exists to support imprisonment;
- a military fort may include an independently operated prison wing;
- a temple may include a library that serves worship, or a distinct scholarly order with its own goal;
- an alchemist's public shop may conceal the proprietor's necromancy laboratory;
- smugglers occupying an abandoned mine did not retroactively make smuggling its construction purpose;
- a breach-linked cell realm may be part of a mage prison's original operating model or a later parasitic
  incursion.

Three approaches:

1. **One primary purpose; everything else is a supporting/exceptional room.** This is simple but cannot
   represent coherent secondary institutions, mixed commissions, hidden businesses, or purpose-built
   annexes with their own staff and dependencies.
2. **Any coherent cluster becomes another purpose.** This preserves variety but produces purpose soup:
   kitchen, infirmary, archive, shrine, treasury, and cells all become peer institutions, inflating
   guarantees and narrative importance.
3. **Causal nested purpose records.** Classify by independence and history:
   - a **supporting function** exists chiefly to make another purpose operate and does not carry an
     independent goal/operating model;
   - a **subordinate purpose** has a distinct goal or commission, recognizable functional roster,
     operator/doctrine or beneficiary, and allocated spatial/operational envelope, while remaining
     causally subordinate to the site;
   - a **current-use overlay** records what later occupants do with inherited architecture without
     rewriting its construction purpose;
   - **secret** is a reveal/access state, not a purpose category. A hidden space still has an original
     function, subordinate purpose, transformation, or current use underneath the secrecy.

**Recommendation:** choice 3. A prison kitchen is support. A fort's separately administered jail wing
may be a subordinate purpose. Smugglers in an old mine are a current-use overlay. The necromancy lab
beneath the shop may be a concealed subordinate purpose if the proprietor deliberately built and
operated both, or a later transformation if another actor added it. "Hidden" alone decides none of
those questions.

A subordinate purpose should require provenance and receive a bounded mini-operating model rather than
merely a themed room. It may be spatially integrated, zoned, annexed, embedded, breach-linked, concealed,
or contested. Its functional and random allocations live inside the parent site's total envelope so
adding a subordinate purpose does not duplicate the whole dungeon budget. Exact allocation rules remain
for Wave 2.

**Open decision:** adopt the causal four-way distinction and preserve the existing zero-to-two
subordinate-purpose bound pending later probability/allocation tables.

Adam selects **choice 3, causal nested purpose records**. Question 16 is resolved. Supporting functions
serve another operating model; subordinate purposes have an independently meaningful goal, operator or
beneficiary, bounded roster, and allocation; current-use overlays record later activity without
rewriting construction; secrecy remains an access/reveal property rather than a purpose category. Zero
to two direct subordinate purposes remains the default generation guardrail, not an absolute limit on
child sites, transformations, occupations, Breaches, or later campaign development.

#### 8.16.1 Future-question assignments seeded by question 16

| Inherited ruling | Future owner |
|---|---|
| Supporting function versus independently rostered subordinate purpose is decided by goal/operator/beneficiary/operating-model independence, not thematic difference alone | **Wave 2 - Room Roster, Repetition, Spice, and Dungeon Ecology** owns profile schemas, mini-rosters, dependencies, weights, and allocation tests |
| Subordinate-purpose allocations live inside the parent site envelope rather than minting another full dungeon budget | **Wave 2** owns capacity math and protected random shares; **Wave 3** owns spatial realization |
| Integrated, zoned, annexed, embedded, breach-linked, concealed, and contested relationships are explicit rather than inferred from labels | **Wave 3** owns structural relationships; **Wave 4** owns breach/secret/access edges; history/current-occupation tables own their causal provenance |
| Current-use overlays never rewrite original construction purpose | Future occupation/history work and **Wave 12** persistence/migration gates must retain original, intervening, current, and believed functions separately |
| Secret is a reveal/access state layered over actual function/history/current use | **Wave 4 - Portals, Secrets, Vertical Connections, and Circulation** begins from this distinction and does not create "secret" as a substitute function |
| Zero to two direct subordinate purposes is a default anti-purpose-soup guardrail, not a universal ontology limit | **Wave 2** must stress-test distributions and exceptional composite/realm cases before locking exact weights or recursion bounds |

### 8.17 Pick up here - question 17: how should Spice remain coherent across a site?

The design has already established that Spice is emergent, context-sensitive, and separate from scope;
historical transformations receive one causal band whose subresults express the same event. The broader
site still needs an ownership rule. Otherwise the engine may either paint every room with one global
weirdness level or independently roll so many anomalies that a large dungeon becomes incoherent Spice
confetti.

Three approaches:

1. **One site-wide Spice band.** A dungeon rolls Grounded through Mythic and every purpose, room,
   history event, secret, and anomaly conforms to that level. This produces a strong register but makes
   Mythic sites uniformly loud, prevents ordinary rooms inside strange places, and turns one roll into a
   tonal escalation engine.
2. **Independent Spice roll for every detail.** Every room, fixture, secret, transformation, and NPC
   wrinkle rolls separately. This maximizes surprise but compounds high-band outcomes with site size and
   produces unrelated weirdness rather than causal mystery.
3. **Causal Spice graph.** Roll bands for eligible causal events - a purpose variation, construction
   doctrine, historical transformation, current anomaly, secret network, breach, or other licensed
   commitment. Each event owns one band and scope. Its dependent rooms, clues, symptoms, mechanics, and
   consequences express that event rather than rerolling independent intensity. Ordinary Spark/Fork
   details still vary locally within their honest ceilings. The site stores a summary of active causal
   outcomes, not a temperature that forces later rolls upward.

**Recommendation:** choice 3. An ordinary city prison may contain one Mythic prisoner whose cell exists
across several realms; the rest of the institution remains grounded and functional. A Volatile curse in
an ancient tomb may express through repeated dreams, sealed doors, altered corpses, and one escalating
clock across several rooms - those are correlated manifestations of one result, not four Volatile rolls.
A mage-colony prison may treat portal cells as Grounded/Textured infrastructure while one Strange breach
failure creates flickering wards, contradictory inmate records, and impossible footprints.

The causal graph should record:

```text
root event/card and provenance
+ Spice band
+ scope: child / room / zone / site / regional / planar / cosmic
+ causal license and context used for classification
+ affected entities, functions, rooms, and edges
+ manifestations/tells that inherit the root
+ persistent consequences and unresolved handles
```

This preserves the existing law that the world becomes stranger because rolled outcomes happen and
persist, not because a hidden meter rises. A prior Mythic event may change canon and thereby make a later
result eligible or contextually ordinary, but it does not mechanically heat every subsequent table.

**Open decision:** choose whether Spice is site-wide, independently per detail, or owned by causal events
whose manifestations inherit their intensity.

#### 8.17.1 Ruling and follow-up - no downward Spice ceiling

Adam selects the **causal Spice graph** and identifies the crucial layering rule: a site-level Grounded
result must not force its occupants, NPCs, loot, encounters, discoveries, or other child generators to
remain Grounded. Those systems carry their own eligible Spice rolls. A Grounded dungeon can still become
excellent through granular NPC, loot, secret, and local-detail variation.

Use **scoped independence with causal inheritance**, not parent-band constraint:

- **Independent child:** an NPC, item, secret, encounter, local detail, or later event rolls through its
  own table class, context, scope, and Spice eligibility. Its result may exceed the site's construction/
  history band.
- **Causal manifestation:** when a child exists because of an already rolled root event, it inherits or
  expresses that root's band and does not roll another independent intensity merely for being another
  symptom.
- **Context modifier:** parent purpose, region, realm, doctrine, history, and current state may change
  row eligibility, classification, and weights, but they do not impose an ordinary maximum band.
- **Hard constraint:** physical or canonical impossibility can still reject a result; that is the
  compatibility system, not a Grounded parent suppressing Spice.

Therefore:

- a Grounded working prison may hold a Mythic NPC whose identity or condition is locally world-marking;
- its loot may independently contain a high-band artifact if an eligible Commitment result and causal
  placement explain how it is there;
- one Strange hidden route may exist inside otherwise ordinary construction;
- a Mythic site may still contain Grounded guards, meals, tools, vermin, furniture, and cells;
- a mage-colony prison may classify portal infrastructure as Grounded while an individual inmate's
  cross-realm nature rolls much higher.

A high-band child does not retroactively rewrite the original dungeon as high-band construction. It
adds its own scoped causal record to the site's active event graph. If the Mythic prisoner later tears
open the prison, that consequence may create a new site-scale transformation through ordinary outcome/
ledger rules.

Apply two non-cascade laws:

> **No downward ceiling:** a parent's band does not cap independently rolled descendants.

> **No upward averaging:** a child's band does not recolor every ancestor or sibling; the site summary
> lists the scoped active event rather than replacing the site's other truths with one maximum band.

This layering needs anti-saturation safeguards. Large sites create more NPCs, loot, rooms, and details,
so uncontrolled independent Commitment rolls would make high-band outcomes nearly inevitable. Prevent
that without a parent ceiling:

- Spark/Fork/Commitment class ceilings remain honest; most detail rolls cannot reach Volatile/Mythic;
- site/zone budgets bound independent Commitment opportunities and major secret networks;
- one root event supplies correlated manifestations instead of rerolling intensity per room;
- repeated assemblies use parent variance budgets rather than one full high-ceiling roll per child;
- scope remains separate, so a Mythic personal fact need not become a site-wide catastrophe;
- player attention may deepen a child record but does not raise its band merely because it was pursued.

**Open confirmation:** adopt scoped independence, causal inheritance, no downward ceiling, and no upward
averaging as the Spice-layer relationship.

Adam confirms. Question 17 is resolved. Spice belongs to scoped causal events; manifestations inherit
their root; independent children retain eligible rolls; parent bands neither cap descendants nor become
recolored by them; table classes, causal correlation, repeated-assembly variance, scope, and bounded
Commitment opportunities prevent size-driven Spice saturation.

#### 8.17.2 Future-question assignments seeded by question 17

| Inherited ruling | Future owner |
|---|---|
| Eligible causal events own band, scope, context/license, affected records, manifestations, consequences, and handles | **Wave 2** owns Spice/event recipes and expressivity; **Wave 12** owns persistent schemas, provenance, and outcome-ledger integration |
| Independent children may exceed parent bands; manifestations of one root inherit rather than reroll | Every later content/table wave; the compiler and validators must distinguish `independent` from `manifestationOf` and test both no-downward-ceiling and no-upward-averaging |
| Spark/Fork/Commitment ceilings and bounded Commitment opportunities prevent large sites from accumulating automatic high-band noise | **Wave 2/table design** owns budgets and distributions; future difficulty settings must not silently turn the Spice Curve into a tone-escalation control |
| Secret clues, rooms, and symptoms may express one causal root across a site | **Wave 4** owns network construction/reveal while preserving the single-root band and scope |
| High-priority narrative cards may attach to eligible active Spice events but may not promote their bands merely through attention | **Wave 9** owns scheduling and reincorporation; player pursuit increases detail/priority, not intensity by fiat |
| Realm/context changes classification and eligibility without imposing ordinary parent ceilings | Realm table/content work and all later waves inherit the universal-spine/context-license rule |

### 8.18 Pick up here - question 18: how do current occupants claim and use a site?

Question 8 established that occupants may continue, restore, adapt, squat, exploit, deface, overgrow,
or contest inherited architecture. A large or factional dungeon cannot apply one relationship uniformly,
but independent room-by-room occupation rolls would produce checkerboard nonsense. The engine needs a
coherent present-tense territorial model.

Examples:

- goblins squat in a fort's outer barracks, exploit its kitchen, avoid the sealed command level, and
  contest the gatehouse with bandits;
- a cult restores a temple sanctuary while defacing older side chapels and using the crypt only for
  disposal;
- undead continue the original funerary function below a manor whose living owners sincerely know
  nothing about them;
- a breach faction controls one portal-linked zone but cannot safely cross the human-scale service
  tunnels;
- an abandoned prison may have vermin in storage, scavengers in intake, one occupied cellblock, and
  genuinely unused wings.

Three approaches:

1. **One site-wide occupation relationship.** "Goblins squat here" applies everywhere. This is legible
   but erases differentiated use, inaccessible zones, contested borders, and resource strategy.
2. **Independent room occupation rolls.** Every room separately chooses occupant, current use, and
   relationship to architecture. This creates variety but no territorial logic, supply path, patrol
   behavior, or faction coherence.
3. **Zoned occupation map.** Current factions/groups claim coherent graph regions according to access,
   goals, population, resources, defenses, scale, and known hazards. Each zone inherits a dominant
   relationship to architecture and may contain bounded room-level exceptions. Borders, shared systems,
   buffers, concealed enclaves, unoccupied areas, and contested rooms are explicit.

**Recommendation:** choice 3. A site's current-occupation layer should record:

```text
occupant/faction/group id and provenance
+ claimed zones and access routes
+ continue/restore/adapt/squat/exploit/deface/overgrow/contest relationship by zone
+ current functions, population pressure, staffing, and supply dependencies
+ controlled, patrolled, observed, avoided, unknown, contested, and unused spaces
+ borders, chokepoints, permissions, alarms, and communication paths
+ beliefs about inherited architecture and known/misunderstood hazards
+ relationships with other occupants and external suppliers/claimants
```

Rooms inherit the zone's occupant and relationship by default. A room deviates only through a stored
cause: specialist use, local damage, secret resident, personal claim, hazard, transformation, or active
story card. This produces coherent repetition without making every barracks room identical.

No exact faction count should be a magic constant. Site scope, occupancy model, instability, current
story obligations, access partitions, and available resources determine how many coherent groups fit.
The generator should prefer the smallest set that explains the rolled present state; additional factions
need distinct goals, territory or network, and player-facing consequences rather than existing only for
variety.

**Open decision:** choose the occupation model and whether ordinary rooms should inherit a zone-level
relationship unless a causal exception overrides it.

#### 8.18.1 Ruling and follow-up - contested zones must make the site feel alive

Adam selects **occupation zones**. This is an old-school dungeon strength and a high-value world-life
mechanism. Skyrim's strongest contested dungeons made multiple occupants feel like active inhabitants;
the BG3 Grove's refugee tieflings and paranoid druids demonstrate that a contested place can be social,
political, legal, religious, and resource-driven rather than merely two hostile encounter groups.

Do not reduce control to one colored ownership layer. A zone may have overlapping claims:

- **physical control** - who can presently occupy, fortify, patrol, or exclude;
- **population presence** - who lives, works, hides, travels, or takes refuge there;
- **legal/ritual authority** - who believes they have the right to command, judge, worship, or perform
  necessary rites;
- **resource dependence** - who needs its water, food, passage, shelter, workshop, gate, or magic;
- **social influence** - who the inhabitants trust, fear, resent, obey, or sympathize with;
- **knowledge/access** - who knows routes, mechanisms, passwords, dangers, and secret entries;
- **claim/aspiration** - who wants the zone without currently controlling it.

The Grove pattern can therefore represent druids holding ritual and legal authority, refugees holding
population presence and moral/social claims, both depending on shared gates and supplies, and neither
cleanly owning every common space. `contest` is a relationship among claims, not necessarily combat.

This creates a simulation follow-up:

1. **Static occupation snapshot.** Roll zones and factions once; they change only through direct player
   action. This is cheap and legible but the site goes inert whenever the player looks away.
2. **Continuous full simulation.** Individually simulate every patrol, resource use, NPC decision,
   skirmish, and territorial move. This can create rich emergence but is unaffordable, difficult to
   validate, and likely to produce important off-screen nonsense.
3. **Event-driven occupation fronts.** Each group receives goals, pressures, dependencies, relationships,
   controlled/desired zones, and a small number of clocks or state transitions. The engine advances them
   on meaningful world time transitions, player actions, supply changes, casualties, contract outcomes,
   faction events, or site revisits - not continuously per second. Resulting events update zone claims,
   occupants, patrols, access, evidence, and story cards persistently.

**Recommendation:** choice 3. It captures the feeling of a living contested dungeon without pretending
Genesis can afford a total-world agent simulation.

For example, goblins hold a fort's barracks, bandits hold its gatehouse, and both need the kitchen route.
The kitchen edge begins contested. If the party destroys the bandits' stored food, opens a smugglers'
tunnel, kills a goblin chief, negotiates shared access, rests for several days, or leaves during an
active deadline, the relevant fronts advance. On return, the engine may establish a shifted patrol line,
abandoned position, truce marker, corpses, new barricade, refugee cluster, or claimant message. Nothing
changes merely because an invisible timer wanted drama; a recorded pressure and transition caused it.

Fronts should normally be sparse:

```text
group goal and present stance
+ controlled, depended-on, and desired zones
+ relationship/claim layers
+ one or a few active pressures or clocks
+ legal triggers and transition outcomes
+ evidence left by each transition
+ player handles and narrative-card consequences
```

The World State Ledger records actual changes. The DM priority hand surfaces immediate and follow-up
consequences. A front may cool, stabilize, negotiate, or resolve in either direction; it is not an
escalation engine and does not force every dispute toward violence.

**Open decision:** choose static, continuous, or event-driven occupation change, and confirm that
contested claims may be social/political/resource-based as well as spatial and military.

Adam selects **event-driven occupation fronts** and confirms that contests may be spatial, social,
political, legal, religious, ideological, or resource-based. Question 18 is resolved. Occupation is a
coherent zoned present-tense layer with inherited room defaults and causal exceptions; overlapping
claims are typed; sparse fronts update them through recorded triggers and world transitions rather than
continuous simulation or automatic escalation.

#### 8.18.2 Future-question assignments seeded by question 18

| Inherited ruling | Future owner |
|---|---|
| Occupants claim coherent graph zones; rooms inherit zone defaults and deviate only through a stored cause | **Wave 2** owns occupancy/population/supply profiles; **Wave 3** owns zone boundaries and access; future faction/NPC systems own group generation |
| Claims distinguish physical control, population, authority, resources, influence, knowledge/access, and aspiration | Future **faction/social/place systems** own diplomacy and relationship mechanics; schemas and persistence belong to **Wave 12** |
| `contest` includes political, legal, religious, ideological, social, and resource conflict rather than implying combat | **Wave 7** must not turn every contested zone into an encounter; **Wave 9** owns negotiation/consequence cards and active pressures |
| Sparse event-driven fronts advance only on recorded time transitions, player actions, supply changes, casualties, contracts, faction events, or revisits | World-clock/ledger work, **Wave 8** mutable state, **Wave 9** scheduling, and **Wave 12** persistence/acceptance inherit this trigger law |
| Transitions leave physical, social, and documentary evidence and may stabilize, cool, negotiate, or resolve without escalation | **Wave 5** owns visible traces/dressing; future writing and DM systems own recaps, witnesses, messages, and nonviolent outcomes |
| Use the smallest group set that explains the state; another group requires a distinct goal, claim/network, and player consequence | Future occupancy/faction table design owns expressivity and anti-noise tests; no universal faction-count constant is locked |

### 8.19 Pick up here - question 19: what yields when the operating model does not fit?

Coupled generation should prevent most contradictions, but established canon, fixed building shells,
mods, unusual profile combinations, and preserved composite recipes can still create a site whose core
operating model, support coverage, random/Spice allocation, occupants, and physical envelope do not all
fit naively. The decision is not one of three competing architectures; it is the **authority and
reconciliation order**.

Examples:

- a hamlet jail has only four small rooms but still needs custody, control, secure storage, external
  meals, and some room for discovery/Spice;
- a canonically fixed manor shell acquires a subordinate intelligence office without gaining another
  floor;
- a city prison's rolled capacity implies sanitation and food throughput the available graph cannot
  express as separate rooms;
- a giant-built ruin is occupied by humans who cannot use every original interface;
- a modded purpose profile requests two mutually incompatible required assemblies;
- an already visited site gains a new occupant or story obligation and cannot rewrite observed walls.

**Recommended reconciliation ladder:**

1. **Prevent the mismatch upstream.** Purpose, operational load, graph scope, envelope, accommodation,
   dependencies, and protected random share are coupled before room selection.
2. **Satisfy capabilities without demanding one noun per room.** Combine compatible functions, use
   repeated assemblies/subspaces, shift/time-share a room, or realize support through fixtures and
   procedures.
3. **Use honest external dependencies.** Meals, water, records, waste, staffing, and supplies may come
   from outside only when context and access make that operating model plausible.
4. **Use opportunity capacity as well as floor area.** A tiny jail's protected random/Spice allocation
   may be a child's note, concealed medicine, a compromised deputy, an old foundation, or a secret
   passage attached to a core room; it need not force a fifth dedicated random room. Larger profiles can
   support dedicated random rooms, zones, and subordinate complexes.
5. **Adjust unobserved low-authority structure within declared tolerances.** Expand dimensions, add a
   level, change repetition count, or select another compatible recipe when canon and premise permit;
   preserve the original roll and record reconciliation.
6. **Add an annex, child site, or breach-linked domain only with causal license.** Never conjure an
   off-map facility merely to hide a failed roster.
7. **Yield optional realization before guaranteed capability.** Compatible choices, exact supporting
   variants, decorative density, and redundant repetition may change; core capability, canonical facts,
   physical legality, and the protected chance for meaningful variation may not silently disappear.
8. **Before first contact, regenerate the lowest-authority incompatible choice.** Do not reroll lore,
   explicit premise, observed geometry, or a high-priority canonical obligation to save a late recipe.
9. **After contact, change only through world events.** Expansion, collapse, occupation, repair, or
   revelation writes persistent history; the generator never edits remembered walls behind the player.
10. **Fail honestly when no legal model exists.** Emit the conflicting requirements, attempted
    reconciliations, and owning sources for workbench/modder repair rather than overlap rooms, create
    fake doors, shrink circulation below legality, or drop a roll silently.

This ladder treats a guaranteed function as a semantic capability, not an entitlement to its own room,
and treats protected random/Spice capacity as meaningful variation, not a mandatory percentage of bare
floor area. The later compiler may optimize realization, but it may not decide which truths deserve to
exist.

**Open decision:** review the authority/reconciliation ladder, especially whether tiny fixed sites may
fulfill their protected random allocation through details, secrets, people, and history inside core
rooms rather than through dedicated random rooms.

#### 8.19.1 Correction and follow-up - small sites retain a structural-variation tail

Adam accepts the reconciliation ladder and the use of in-room variation at every scale, but rejects an
accidental hard reading of capacity: even a small jail should retain some chance to roll an additional
room. "Small" sets an expected structural range and strongly affects probability; it does not create a
purpose/size blacklist. A successful expansion roll establishes the additional capacity and its cause
rather than squeezing an impossible room into the prior shell.

Distinguish two channels of protected variation:

1. **Embedded variation - always available.** Notes, people, caches, secrets, unusual fixtures,
   relationships, history, compromised procedures, and small spatial pockets attach to core/supporting
   rooms.
2. **Structural variation - scale-weighted tail.** A dedicated discretionary room, annex, attic,
   basement, tunnel, outbuilding, inherited chamber, hidden domain, or subordinate complex may be added.
   Small sites have a low but nonzero chance; larger sites receive more expected slots and can support
   larger outcomes. History, shell type, lot, geology, realm context, and Spice determine what can fit.

`Random room` describes an **allocation channel**, not an ontological room type. Once selected, the room
still receives provenance, time of origin, function/current use, physical relationship, and narrative
handles. Some results may help the institution incidentally; they are random because the operating
model did not guarantee them.

Examples for a small hamlet jail:

| Possible extra space | Causal source | Why it belongs in the pool | Likely player value |
|---|---|---|---|
| Cramped evidence/records room | Optional original construction or later partition | A jail can function without a dedicated one, but a particular sheriff invested in it | Cold cases, confiscated object, forged ledger, missing-person link |
| Deputy's bunk/ready room | Staffing variation | External lodging is sufficient, so the room is not guaranteed | Personal life, divided loyalty, emergency gear, off-shift witness |
| Root cellar or cistern | Inherited building/support | The jail may occupy an older house, station, or civic shell | Water leverage, hidden cache, foundation clue, escape route |
| Temporary quarantine or drunk cell | Local practice/history | Frontier crises produce ad hoc capacity beyond ordinary cells | Epidemic history, dangerous detainee, town prejudice, survivor clue |
| Rear evidence shed or confiscation cage | Annex/outbuilding | Fits a small lot without enlarging the main jail unrealistically | Contraband, animal, wagon evidence, volatile seized goods |
| Sealed former sheriff's office | Historical transformation | The institution contracted, changed leadership, or covered up an event | Old case wall, predecessor's fate, secret correspondence |
| Prisoner-dug escape tunnel and pocket | Emergent alteration | Occupants changed the architecture without official knowledge | Route, tools, bandit connection, buried note, collapsed danger |
| Smuggler or vigilante interview room | Concealed current/subordinate use | A corrupt deputy or town faction operates inside the institution | Faction leverage, illegal detention, blackmail, rescue opportunity |
| Pre-jail crypt, mine assay vault, or storm shelter | Inherited substrate | The civic building reused an older foundation common to the settlement | Local lineage, unusual material, hidden entrance, old claimant |
| Small shrine or last-rites niche | Doctrine/culture variation | Not needed for custody but plausible for a particular community | Prisoner promises, cleric connection, desecration, moral choice |
| Ward room or breach-containment closet | Contextual magic/technology | Plausible in a mage colony; Strange or higher in a mundane frontier | Failed ward, realm clue, exceptional prisoner, dangerous shortcut |
| Extradimensional evidence cell or impossible lower room | High-Spice licensed event | Physically exceeds the shell only because its causal event changes ordinary geometry | Major secret network, realm access, world-marking prisoner or artifact |

Not every example is equally "random" in every profile. A dedicated evidence room may be supporting in a
city prison but discretionary in the hamlet jail. A portal ward may be Grounded infrastructure in a
mage colony and a high-band anomaly in a mundane settlement. Context determines affinity and band rather
than a universal list.

The pool should still refuse unexplained nonsense. A fifty-seat banquet hall, giant foundry, or
hundred-cell wing does not fit a four-room street jail unless a recorded annex, hidden child site,
demiplane, transformation, or other exceptional license creates that capacity. The roll may change the
known envelope honestly; it may not overlap the neighboring building or invent inaccessible facade
space.

**Revised recommendation:** site-size bands are soft distributions with explicit structural tails, not
hard room-count caps. Embedded variation remains guaranteed; dedicated random-room probability and
maximum ordinary footprint scale with the site; high-Spice and causally licensed results may exceed
ordinary geometry. Exact probabilities wait for Wave 2's expressivity tests.

**Open confirmation:** keep a low but nonzero additional-room chance even at the smallest site sizes,
using context-weighted room families and a causal capacity check rather than a size blacklist.

#### 8.19.2 Final ruling - this is a spicy restaurant

Adam strengthens the structural-tail ruling: an extra discretionary room should be **likely even in a
small purposeful site**, not held to a low rare chance. The additional space proved the design point by
immediately producing a deep pool of local history, people, secrets, resources, corruption, inherited
architecture, and realm possibility. Genesis should not serve bland food to protect a conservative
dungeon distribution.

The existing adopted spicy-world stance already supports this taste target: baseline band-first play is
`25/25/25/17/8`, with three-quarters of eligible results Textured or hotter and one-quarter Volatile or
Mythic. The dungeon redesign must not quietly restore the old conservative distribution or add a
small-site dampener. Grounded results remain necessary contrast and are themselves concrete human
pressure, never filler.

Replace the prior "low but nonzero tail" recommendation with:

- every purposeful site receives embedded variation;
- even the smallest ordinary site has a **clear-majority target** for at least one additional spatial
  variation - room, attic, cellar, shed, tunnel, inherited pocket, hidden domain, or comparable space;
- exact probability and the chance of multiple additions scale with site/profile/context and are tuned
  through Wave 2 expressivity/playtest, but "likely" is the acceptance target;
- ordinary footprint and causal legality still constrain the shape; high-Spice licensed results may
  create capacity beyond ordinary geometry;
- a failed dedicated-space result falls back to embedded variation rather than producing bland null.

Every discretionary space must contain at least one **juicy player handle**, but juicy is not synonymous
with demonic, hostile, combat, loot, or Mythic. Valid handles include:

- a person, relationship, refusal, divided loyalty, or social pressure;
- useful or dangerous loot, supplies, evidence, contraband, or a practical resource;
- a secret, clue, contradiction, route, mechanism, or tactical affordance;
- an inherited function, historical transformation, claimant, or unresolved consequence;
- a funny, unsettling, poignant, or realm-inflected object whose implications can grow under attention;
- a high-band entity, breach, curse, or impossible space when the Commitment roll fires.

Thus the extra bathroom might contain nothing more catastrophic than the sheriff's **demonic bar of
soap**: perhaps it whispers confessions out of the hands it cleans, removes blood before it is spilled,
smells like the realm that made it, has slowly altered the sheriff's dreams, or is simply an inexplicable
object he regards as ordinary. It can remain a local Textured/Strange hook, seed a future promissory card,
or prove to be one tell of a larger causal event. The same opportunity retains the potential to roll an
actual demonic occupant or Mythic breach without requiring one every time.

The flavor target is **high hook density with mixed intensity**:

> Most generated places should offer something memorable to pursue; some of the surrounding people,
> rooms, objects, procedures, and pressures remain Grounded so the spicy results retain contrast and the
> world remains emotionally/materially legible.

Question 19 is resolved. Its reconciliation ladder stands, amended so small-site structural variation
is likely rather than rare.

#### 8.19.3 Future-question assignments seeded by question 19

| Inherited ruling | Future owner |
|---|---|
| Guaranteed functions are semantic capabilities, not mandatory one-room nouns; reconcile through combination, assemblies, procedures, external dependencies, and honest envelope changes | **Wave 2** owns roster/allocation logic; **Wave 3** owns legal realization and degradation |
| Protected variation has embedded and structural channels; small sites target a clear majority with at least one added space, larger sites support more/larger additions | **Wave 2** owns exact distributions and expressivity/playtest gates; no size-only blacklist is allowed |
| Every discretionary space guarantees at least one juicy player handle while preserving mixed Spice intensity | **Wave 2** owns handle-bearing room recipes; **Wave 4** owns secret/routes/reveal; future writing/loot/NPC systems own their channels |
| SPICE-RAISE's spicy-world weights remain the play distribution; dungeon/site size does not dampen them | Future table/compiler work inherits band-first tier weights and honest class ceilings; playtests tune room-slot probability separately from band distribution |
| Unobserved low-authority conflicts may reconcile with provenance; observed facts change only through world events; impossible sets fail diagnostically | **Waves 3 and 12** own compiler diagnostics, persistence, migration, workbench traces, and no-silent-drop gates |
| Preexisting shells, annexes, child sites, and Breaches may create capacity only with causal license | **Wave 3** owns shell/annex geometry; **Wave 4** owns hidden/breach edges; history/purpose records own provenance |

### 8.20 Pick up here - question 20: when does a generated site become canon?

The accepted system is hierarchical, persistent, and capable of very large sites and realm-linked
substructures. Fully generating every cell, NPC network, item, secret manifestation, and dressing detail
at site creation is expensive and front-loads facts no player may reach. Rolling each room only when the
door opens recreates incoherent room-by-room generation and lets future facts contradict earlier clues.
The final initial question is therefore the **commitment frontier**: what must exist before exploration,
what may remain deterministic latent structure, and what locks when observed?

This is not a vote between two defensible extremes. Pure eager generation and pure improvisational lazy
generation both violate accepted requirements. The recommended staged model is:

#### Seeded canon - locked when the site is created

- stable site id, seed, context, provenance, and authority chain;
- original purpose, subordinate purposes, builder/operator/doctrine, and operating-model obligations;
- structural scope, operational load, spatial envelope, accommodation domains, and topology profile;
- history/transformations, resource ecology, original/current/believed-function distinctions;
- present occupant groups, zone claims, active fronts, supply relationships, and current state;
- root causal Spice events, major secret/story networks, required commitments, and allocation budgets;
- a semantic site -> zone -> room/assembly plan sufficient to guarantee that functions, routes,
  repeated spaces, connections, and protected variation have legal homes.

#### Deterministic latent structure - stable but expandable

- exact low-importance repeated-child contents;
- minor NPC personality/network detail beyond established role, goal, tell, and relationship invariants;
- local inspection opportunities and lightweight loot within already allocated budgets;
- fine dressing, sensory variants, and presentation details;
- exact geometry that can be compiled later from a fixed semantic room/assembly program without changing
  established connections, capacity, or clues.

Latent records receive stable ids/seeds and invariants. Expanding them is deterministic materialization,
not a fresh unconstrained reroll. Player pursuit, proximity, narrative priority, a clue, a targeted
search, or an implementation need may force expansion.

#### Contact and observation locks

- rolled plans may reconcile unobserved low-authority soft assignments only within their stored
  constraints and with provenance;
- once the party observes, acts upon, maps, learns, or is promised a fact, that fact becomes hard canon;
- later movement, destruction, construction, occupation, revelation, disguise, or memory change occurs
  through a recorded world event rather than retconning the generated record;
- a player who reaches a promised destination receives enough materialization to answer the action
  honestly; the engine cannot cite laziness as a reason the content does not exist.

The DM sees the smallest relevant slice of seeded canon and latent opportunities, partitioned by
knowledge and priority. The renderer receives only the active local plan. Neither needs the entire site
or campaign index in context at once.

**Recommendation:** adopt this staged commitment frontier. It preserves whole-site coherence and clues,
supports huge/Breach-linked sites, controls engine/DM load, and still lets player attention root outward
into rich detail. Exact eager/lazy cut points for geometry, NPCs, loot, and secrets become future-wave
implementation questions, but they may not violate the seeded invariants or contact lock.

**Open decision:** approve, revise, or reject the proposed boundary between seeded canon,
deterministically latent structure, and observed hard canon.

#### 8.20.1 Ruling and follow-up - eager topology, depth-window card plan

Adam accepts the staged commitment frontier in principle and sharpens its mechanical boundary. The
dungeon's **doors/connections topology must be mathematical truth before exploration**. Details may
materialize as the party approaches rooms, but neither the generator nor the DM may discover the actual
graph ad hoc one doorway at a time. The DM should also begin with a planned sense of narrative-card
distribution and dungeon escalation by room depth. The pacing system must prevent both failure modes:
conservative hoarding that starves the early/middle dungeon and a full remaining hand dumped into the
last few rooms.

This is feasible as an extension of existing machinery rather than an aspiration delegated entirely to
AI judgment. `place-semantics.js` already derives shortest-path room depth by breadth-first search and
assigns shallow/mid/deep bands; `dungeon-walk.js` already uses graph depth for reward and elevation
decisions. The redesign should generalize those seams into a stable topology record and an explicit
card-placement scheduler.

##### Eager mathematical skeleton

Before the site becomes explorable, lock:

- stable ids for the site, zones, levels, rooms/assemblies, and every traversable or discoverable edge;
- the graph's doors, corridors, stairs, ladders, lifts, drops, crawlspaces, gates, Breaches, and
  secret-edge eligibility, including directionality, lock/barrier type, and traversal constraints;
- entry points, exits, critical routes, loops, branches, side pockets, choke points, finale candidates,
  and required egress;
- graph distances from each relevant entrance, normalized depth, critical-path position, branch depth,
  zone membership, and topological roles such as entry, connector, hub, side room, deep pocket, or
  terminal;
- semantic room/assembly programs, capacity envelopes, mandatory functions, protected variation,
  reservations, and enough causal placement to prove that every promised fact has a legal home.

Approach-time generation may choose fine geometry, dressing, local inspection tells, exact lightweight
loot, and expandable NPC detail from the fixed room program. It may not change established adjacency,
invent or remove required capacity, invalidate a clue, or make a mapped route cease to exist. A secret
door can remain concealed from the player without being absent from the canonical graph.

##### Planned distribution, not a full free hand

Major and mandatory cards are not left as an unordered deck for the DM to spend whenever convenient.
Before exploration, each receives:

- scope and causal chain;
- semantic requirements, exclusions, preferences, and capacity cost;
- priority and service horizon;
- a chain role such as seed, tell, complication, corroboration, reveal, turn, or payoff;
- an **earliest / preferred / latest depth window** expressed against normalized graph depth and
  qualified by zone, branch, and topology role;
- one or more eligible homes and any required separation or ordering from related beats.

The recommended plan is hybrid:

1. Structural commitments, mandatory operating functions, critical route facts, major secrets, and
   causal reveals receive exact homes early when later consistency depends upon them.
2. Softer narrative beats and local Spice receive bounded depth windows plus ranked candidate homes.
   Their exact home may finalize when the party approaches, but only among unobserved legal candidates
   and without breaking the planned chain.
3. The DM receives a **small current hand**: due now, unusually strong fits now, due soon, and a small
   reserve/local-Spice lane. It does not sort or remember the full unresolved deck.

Depth means shortest-path and topological depth, not room visitation order and not simply "the last
three rooms." Branch depth, zone transitions, alternate entrances, bypassed paths, and loops all modify
the placement score. Soft assignments may be replanned across still-unobserved eligible homes when the
party takes an unexpected route; locked homes and observed facts do not move.

##### Anti-hoarding and anti-dump controls

For every unresolved card, track placement slack:

> `slack = remaining eligible unobserved homes before latest depth - unresolved placements competing for those homes`

Low or zero slack makes a card due at the next legal home; the DM cannot keep deferring it for a
hypothetical perfect room. Conversely, a card cannot use the final band merely because the scheduler
failed to place it earlier. The generator validates narrative capacity and chain coverage before play,
reserves finale capacity for actual payoffs/turns, and reports impossible schedules rather than treating
the last rooms as overflow bins.

Each depth/zone segment also has coverage targets. The precise cadence varies by site and chain, but the
default shape is:

- opening/shallow: establish function, pressure, occupant legibility, and one or more usable tells;
- early-middle: let a person, faction, resource problem, or secret chain become actionable;
- middle/deepening: complicate, contradict, corroborate, escalate, or advance a contract;
- deep: reveal, transform, or force a costly consequence;
- finale/terminal space: pay off, turn, resolve, or deliberately leave a charged future promise - not
  deliver all missing exposition.

If a room has legal narrative capacity, coverage is behind, and a relevant high-priority card is inside
its preferred window, the default is **use it while it fits**. Deferral needs a concrete reason such as
capacity conflict, causal order, needed separation, player knowledge, or a demonstrably stronger
already-reserved home. Quiet-room protections still apply: pacing may leave the manifest layer calm
while carrying a subtle tell, hidden resource, or latent connection.

Dungeon escalation by depth governs pressure, stakes, resource strain, encounter commitment, and the
phase of narrative chains. It does **not** impose an automatic Spice ramp. A shallow room may contain a
Mythic root when causally licensed, and a deep room may remain Grounded; depth schedules revelation and
play pressure rather than replacing the independent Spice roll.

**Recommendation:** adopt the hybrid predeal plus depth-window scheduler: exact early homes where
coherence requires them, bounded candidate homes for softer beats, a small due-now DM hand, explicit
coverage targets, and slack-based pressure to play cards before their legal opportunities vanish. This
keeps the engine flexible without asking the DM to improvise pacing from an ever-growing deck.

**Open follow-up:** should this hybrid model be the Question 20 ruling, including (a) fully fixed graph
topology before play, (b) approach-time deterministic detail, (c) exact early placement for structural
and causally critical cards, and (d) depth windows, coverage targets, and slack pressure for movable
cards?

#### 8.20.2 Correction - narrative freedom, mechanical depth gradient

Adam rejects any formula that makes every dungeon tell the same shallow-establish, middle-complicate,
deep-reveal story. A faction problem may already be visible outside the front gate; a contract may begin
in town; the dungeon's defining secret may announce itself in the entrance hall; a deep room may provide
quiet human context rather than a climax. Genesis wants escalation without converting graph depth into a
mandatory narrative chronology.

Revise the depth-window model accordingly:

- **Narrative cards are topology-aware, not universally depth-monotonic.** Semantic fit, causal order,
  player attention, contract priority, zone ownership, service horizon, and available capacity govern
  placement. Depth is one optional constraint or preference, not a required field on every card.
- Cards may declare different depth behaviors: pre-entry, entrance-facing, any-depth, depth-biased,
  deep-gated, terminal, cross-zone, or route-spanning. A faction/front card can operate outside the site,
  across the threshold, or throughout several occupation zones.
- Seed -> complication -> reveal -> payoff is one useful chain shape, not the dungeon template. Chains
  may begin before entry, reveal early and explore consequences later, fork across zones, recur through
  several depths, resolve outside the dungeon, or remain a live campaign promise after the site.
- Coverage targets prevent long accidental droughts and end-loading, but do not prescribe which kind of
  beat belongs in each depth band. The scheduler asks whether meaningful material is being used at a
  healthy cadence, not whether room five contains the designated complication.
- Slack and service-horizon pressure still prevent hoarding. They apply to each card's actual eligible
  topology and timing contract rather than forcing every card through the same shallow-to-deep window.

Depth does carry a firmer **mechanical** promise: expected challenge commitment and expected reward
increase as meaningful access depth increases. This should be a noisy overlapping gradient rather than
a staircase where every successive room is harder and richer than the last:

- deeper bands receive higher expected opposition/hazard/resource-pressure budgets and higher expected
  reward value, rarity, strategic leverage, information value, or access value;
- peaks, valleys, quiet rooms, empty-looking rooms, social rooms, shortcuts, and exceptionally dangerous
  shallow guardians remain legal;
- reward need not be treasure and challenge need not be combat; information, allies, routes, safety,
  authority, equipment, discoveries, and campaign leverage can pay for social, traversal, puzzle,
  attrition, legal, environmental, or combat risk;
- reward and challenge correlate over a region or route, not as a compulsory one-room transaction;
- Spice remains independent: deeper means higher expected commitment and payoff, not automatically more
  supernatural or Mythic.

Use **effective access depth**, not merely room number or unweighted distance from the front door. Its
inputs can include graph distance, required transitions, locks/barriers, hazards, hostile control,
resource cost, branch commitment, secret knowledge, and available entrances. A hidden rear entrance may
land physically near a deep vault, but learning, reaching, or opening it carries access cost that
preserves the risk/reward bargain. Occupation zones can create their own local gradients and contested
thresholds inside the larger site.

**Revised recommendation:** keep the hybrid commitment frontier and small current DM hand, but replace
the universal narrative-depth cadence with two separate schedulers:

1. a flexible narrative scheduler using semantic fit, causality, priority, attention, coverage, and each
   card's individually declared topology/timing behavior; and
2. a graph-based risk/reward scheduler that raises expected challenge commitment and reward with
   effective access depth while deliberately distributing local peaks, valleys, and quiet spaces.

**Open follow-up:** approve this separation, including effective access depth as the basis of the
mechanical gradient and depth as only an optional narrative-card constraint?

#### 8.20.3 Final ruling - staged canon with separate narrative and risk/reward schedulers

Adam confirms the separation. Question 20 is resolved:

- the semantic room/assembly plan and complete mathematical connection topology become seeded canon
  before exploration;
- stable latent records may materialize fine detail deterministically as the party approaches or pays
  attention, without changing topology, capacity, clues, promises, or other invariants;
- structural and causally critical cards receive exact homes when coherence requires them; movable
  cards retain typed eligible homes and any timing/topology constraints rather than entering a free
  unbounded DM hand;
- the DM receives a small relevance-filtered current hand, with coverage and slack/service-horizon
  pressure preventing both conservative hoarding and final-room dumping;
- narrative placement follows semantic fit, causality, attention, contracts, occupation, and the
  individual card's topology/timing behavior. Depth is optional narrative metadata, never a universal
  linear plot template;
- expected challenge commitment and reward rise along a noisy **effective access-depth** gradient that
  can include graph distance, barriers, hazards, hostile control, resources, route commitment, secret
  knowledge, and available entrances;
- local peaks, valleys, quiet spaces, difficult shallow rooms, rewarding noncombat rooms, and calm deep
  rooms remain legal; reward/challenge correlation applies across routes and regions rather than as a
  compulsory room-by-room exchange;
- Spice remains an independent causal dimension. Mechanical depth escalation does not become automatic
  supernatural escalation.

Rejected models include pure eager population of every fine detail, unconstrained door-by-door lazy
generation, a full unresolved narrative deck handed to the DM, finale rooms used as overflow, raw room
number as the risk measure, and one prescribed shallow-to-deep narrative arc for every dungeon.

#### 8.20.4 Future-question assignments seeded by question 20

| Inherited ruling | Future owner |
|---|---|
| Full stable graph topology exists before play; exact geometry may materialize later only within fixed semantic/connection/capacity invariants | **Waves 3 and 4** own structural realization, topology proofs, portals, secret edges, circulation, and graph diagnostics |
| Structural/causally critical cards may receive exact homes; movable cards use typed candidates, coverage, slack, and service horizons; the DM sees a small current hand | **Wave 9** owns scheduler formulas, hand limits, deferral traces, replanning, and DM presentation |
| Narrative cards declare individual topology/timing behaviors; no universal depth-ordered plot template | **Wave 9** owns the card schema and cadence tests; every story/content system inherits the freedom constraint |
| Expected challenge and reward rise noisily with effective access depth, with route/region correlation and local peaks, valleys, and quiet rooms | **Wave 7** and the future difficulty-setting system own budget curves, challenge/reward currencies, exploit tests, and tuning |
| Approach-time detail is deterministic materialization, not unconstrained rerolling; observed/promised facts harden and later change through events | **Wave 12** owns persistence, save compatibility, provenance, migration, and deterministic replay gates; NPC, loot, and dressing systems own their typed expansion boundaries |
| Alternate entrances and shortcuts preserve the bargain through effective access cost rather than physical distance alone | **Waves 3, 4, and 7** own topology metrics, access-state changes, and risk/reward validation |

### 8.21 Wave 1 closure audit - awaiting Adam's explicit confirmation

The twenty-question questionnaire and its generated follow-ups now establish a coherent Wave 1
ontology. The audit finds these central locked decisions:

1. A site retains definite original purpose, builder/operator/doctrine, resource ecology, history,
   original/current/believed functions, and provenance even when occupants or players do not know them.
2. Purpose produces a complete operating model through guaranteed capabilities and weighted
   realization, not a rigid one-room-per-noun checklist.
3. Structural scope, operational load, spatial envelope, and accommodation domains form a coupled,
   extensible core; topology, state, history, challenge, discovery, realm physics, and realization
   resolution remain separately named first-class profiles.
4. Every purposeful site protects random/Spice allocation and room-level discovery opportunity. Even
   the smallest site targets likely added spatial variation and every discretionary space carries at
   least one juicy player handle, with mixed intensity preserving Grounded contrast.
5. Repeated spaces compile as hierarchical assemblies with stable child identities and meaningful
   variation. Search exposes a stable set of contextual opportunities without encouraging exhaustive
   container clicking.
6. The current d200 becomes decomposed source material: atomic typed rollers, preserved composite
   recipes, band-first Spice organization, a dedicated flavor-writing pass, and replacement-proof for
   its golden beats.
7. History, subordinate purposes, current-use overlays, secrets, and occupation zones remain causally
   distinct. Occupants can hold overlapping physical, social, legal, political, religious, resource,
   influence, and aspirational claims that change through event-driven fronts.
8. Spice belongs to scoped causal events. Child NPCs, loot, and other eligible entities retain their
   own rolls; manifestations inherit their root; neither a Grounded parent ceiling nor a Mythic parent
   floor cascades through the tree.
9. Knowledge uses graded reveal, source attribution, party sharing, and protected private facts.
   Discoveries attach to generated truth or create persistent promissory cards that must lead somewhere
   when pursued.
10. Seeded canon fixes semantic obligations and mathematical topology; fine detail may remain
    deterministic latent structure. Narrative scheduling stays nonlinear, while challenge and reward
    rise noisily with effective access depth.

The material tensions raised during the wave have explicit reconciliations:

- institutional coherence versus surprise -> guaranteed operating model plus protected variation;
- tiny physical envelopes versus likely added space -> combination, external dependency, inherited
  pockets, annexes, hidden domains, Breaches, or explicit diagnostic failure rather than silent overlap;
- grounded sites versus spicy contents -> causal scoped Spice with no downward ceiling;
- whole-site coherence versus affordable lazy generation -> eager invariants/topology plus deterministic
  approach-time materialization and contact locks;
- meaningful rooms versus tedious inspection -> automatic read, focused inspection, and systematic
  sweep with stable opportunity lists and bounded presentation;
- timely narrative use versus formulaic linear plots -> small hands, typed eligibility, coverage/slack,
  and individually declared card behavior;
- deeper escalation versus alternate routes -> effective access cost and noisy route/region budgets.

Concrete examples exercised during discussion include the hamlet jail, major city prison,
mage-colony Breach prison, giant ossuary with human-scale insertions, alchemist shop over a necromancy
laboratory, manor with an older hidden complex, contested multi-occupant sites, the child's note that
roots into a missing-person campaign, and the sheriff's demonic bar of soap. No example currently
forces a contradiction in the ontology.

Deliberate implementation/tuning deferrals have named owners rather than remaining Wave 1 blockers:

- exact room/variation probabilities, profile bands, roster distributions, and flavor corpus ->
  **Wave 2**;
- geometry, shells, assemblies, degradation, and fixed-topology realization -> **Waves 3-5**;
- scale/capacity and encounter/resource curves -> **Waves 6-7** and difficulty design;
- mutable topology and environmental strategy -> **Waves 8-9**;
- narrative-card schema, scheduling, hands, and diagnostics -> **Wave 9**;
- representational graphics choice -> **Wave 10**;
- workbench teaching and modding UX -> **Wave 11**;
- persistence, migration, recovery package, golden-beat replacement proofs, and acceptance gates ->
  **Wave 12**;
- automatic inventory implementation -> its future system design, preceded by an adoptable-system audit.

**Audit result:** no unresolved blocker or material follow-up is currently known at Wave 1's ontology
level. This is not yet a declaration of completion. Adam must challenge or explicitly confirm this
summary before Wave 1 closes, and any resulting follow-up remains inside Wave 1 until exhausted.

#### 8.21.1 Final closure - Adam confirmed

Adam explicitly confirms that Wave 1's follow-ups are exhausted and closes the wave on 2026-07-19.
The closure gate in section 6 is satisfied: all initial questions are answered, material contradictions
and consequences were pursued, rulings survived the named examples, deferrals have owners, and the
summary was explicitly accepted. Wave 2 is now authorized to open. A later contradiction may reopen
Wave 1 only by naming the affected ruling and recording the supersession; it may not route around this
closed ontology silently.

After question 20, continue every resulting follow-up. Wave 1 remains open until the closure gate
in section 6 is satisfied and Adam explicitly confirms it.

## 9. Implementation hold

This discovery capture authorizes research, diagnostics, test-card generation, and design work. It
does not authorize the procedural dungeon compiler, room-table rewrite, combat rewrite, renderer
cutover, or destructive-environment implementation. Those builds wait for their owning wave and a
locked spec.

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
