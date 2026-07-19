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

## 8. Wave 1 running record - questions 1-16 resolved; question 17 next

**Status:** IN PROGRESS, not closed. This checkpoint records the 2026-07-18/19 discussion through
question 16 and its follow-ups. Resume at the exact question under **Pick up here** below. Do not open
Wave 2 merely because these first rulings are strong.

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

A frontier jail might need only one to four cells, a sheriff, an optional deputy, secure storage,
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
outer-realm prison cell may be Mythic in a mundane frontier jail, ordinary enough to be Textured or
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
   frontier jail have similar graph sizes but radically different architecture; a six-room magical
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

- **Frontier jail:** tiny graph, tiny capacity, human scale; one to four cells, sheriff/deputy space,
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

Then continue questions 18-20 and every resulting follow-up. Wave 1 remains open until the closure gate
in section 6 is satisfied and Adam explicitly confirms it.

## 9. Implementation hold

This discovery capture authorizes research, diagnostics, test-card generation, and design work. It
does not authorize the procedural dungeon compiler, room-table rewrite, combat rewrite, renderer
cutover, or destructive-environment implementation. Those builds wait for their owning wave and a
locked spec.
