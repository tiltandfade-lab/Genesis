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

## 8. Wave 1 checkpoint - questions 1-11 resolved; question 12 next

**Status:** IN PROGRESS, not closed. This checkpoint records the 2026-07-18/19 discussion through
question 11 and its follow-ups. Resume at the exact question under **Pick up here** below. Do not open
Wave 2 merely because these first rulings are strong.

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

### 8.12 Pick up here

Resume **Wave 1, question 12 - Functional Roster and Site Scale**:

> What does a dungeon's size measure? Decide whether one headline size controls everything or whether
> generation separates graph budget (rooms/connections/zones/levels), institutional capacity
> (population/throughput/support), and physical scale (builders, portals, ceilings, circulation, and
> mixed-scale domains). Determine how the result governs guaranteed, supporting, random, secret, and
> subordinate-complex allocations while deferring exact numeric bands where appropriate.

Then continue questions 13-20 and every resulting follow-up. Wave 1 remains open until the closure gate
in section 6 is satisfied and Adam explicitly confirms it.

## 9. Implementation hold

This discovery capture authorizes research, diagnostics, test-card generation, and design work. It
does not authorize the procedural dungeon compiler, room-table rewrite, combat rewrite, renderer
cutover, or destructive-environment implementation. Those builds wait for their owning wave and a
locked spec.
