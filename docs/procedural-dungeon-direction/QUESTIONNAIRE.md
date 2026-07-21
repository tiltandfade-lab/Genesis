---
type: design-study
status: PRESERVED
wave: all
part: questionnaire
legacy_sections: "6"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Procedural Dungeon Questionnaire and Wave Protocol

This file owns the immutable wave structure, closure law, preservation contract, additive `G` reference bank,
and prospective future-wave questions. The complete original Wave 1 question/answer sequence remains in the
[Wave 1 record](wave-01/01-running-record.md); original Wave 2 Questions 1-11 remain in the ordered
[Wave 2 record](wave-02/README.md). This avoids duplicating authority while preserving every original word.

<!-- BEGIN VERBATIM MIGRATION: original lines 309-1216 -->

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

### Revised execution order - shared SceneTray promoted (2026-07-20)

Adam identifies the main tray renderer as a product-critical dependency for getting Genesis off the ground. The
initial ordering left Interim Visual Engine and Release Scope at Wave 10, after detailed architecture, portals,
furnishing, scale, tactics, mutation, and DM-card decisions. That is too late: the renderer remains a projection,
not a semantic owner, but its chosen spatial precision, scene grammar, object budget, interaction language, and
visual target determine which upstream facts those later systems must compile and which expensive details can be
deferred.

The twelve subject-wave identities and ids remain preserved. Their **execution order** is now:

```text
1.  Wave 1  - Dungeon Function, History, and Strange Compatibility             CLOSED
2.  Wave 2  - Room Roster, Repetition, Spice, and Dungeon Ecology              ACTIVE
3.  Wave 10 - Interim Visual Engine and Release Scope                          PROMOTED NEXT
4.  Wave 3  - Architecture, Structural Stamps, and Degradation
5.  Wave 4  - Portals, Secrets, Vertical Connections, and Circulation
6.  Wave 5  - Furniture Assemblies, Dressing, Clutter, and Empty Rooms
7.  Wave 6  - Creature Scale, Capacity, Squeezing, and Party Participation
8.  Wave 7  - Tactical Affordances and Encounter Reshaping
9.  Wave 8  - Mutable and Destructible Environments
10. Wave 9  - DM Strategic Cards and Environmental Authority
11. Wave 11 - Workbench, Clay Corpus, and Teaching Loop
12. Wave 12 - Migration, Persistence, Acceptance Gates, and Build Order
```

Wave 2 still must exhaust G2.1, G2.2, P2.12-P2.20, every generated follow-up, and its explicit closure gate. The
promotion does not permit skipping the active wave. Once Wave 2 closes, Wave 10 opens before Wave 3. If later
architecture/tactical evidence contradicts the selected tray contract, Wave 10 reopens explicitly; later waves may
refine realization but may not silently drift back into the full renderer as the default.

The promoted Wave 10 must settle, at design level:

- one shared player-facing `SceneTray` grammar across dungeon/interior, town/social, wilderness/exploration,
  travel/map, and battle scenes, with typed adapters rather than separate unrelated visualizers;
- whether combat reconfigures the same established tray, which additional tactical precision it may reveal, and
  how it avoids inventing positions that exploration never established;
- the default spatial abstraction and uncertainty language: exact cells where required, zones/relations where
  sufficient, and no false precision for facts the engine does not own;
- the simplified composition budget: floor/ground, boundaries, connections, elevation, cast, focal/interactive
  objects, hazards/cover, environmental state, and a bounded dressing layer;
- the release camera/framing and representation choice among lit schematic, shallow-oblique tactical diorama,
  hybrid storyboard, range/relationship fallback, and any controlled combination;
- the preserve/rewire/archive boundary for current graphics wins: lighting, cast shadows, normal maps, materials,
  sprites, palettes, effects, environmental beauty, state transitions, interaction tells, and useful asset libraries;
- the rule that visual downgrade reduces generator complexity, scene breadth, and representational precision where
  appropriate - it does **not** authorize a dead flat grid, abandonment of beauty, or deletion of the 3D engine;
- a small cross-mode clay/capture corpus and measurable acceptance gate that proves the chosen tray on dungeon,
  town, wilderness/exploration, travel/map, social, and battle states before later waves optimize for it.

The current full 3D diorama remains a feature-flagged laboratory/future renderer and a source of proven lighting,
material, sprite, effect, and staging techniques. The promoted wave chooses a simpler production projection; it
does not destroy the research investment that made the simplification visually credible.

### Questionnaire preservation and additive Gemini-reference pass (2026-07-20)

The original questionnaire has not been replaced. The preserved baseline consists of:

- the twelve named subject waves above;
- Wave 1's complete original twenty-question sequence and every generated follow-up in section 8;
- Wave 2's original Questions 1-11 and every generated follow-up so far in section 10.

The future waves were intentionally preserved as subject sections to be expanded when reached; there was
never a hidden, prewritten twenty-question list for every future wave. Do not fabricate one and call it the
original. The questions below are a clearly labeled **additive reference bank** derived from the published
Gemini play audit in sections 10.11.51-10.11.56. They do not renumber, delete, or silently rewrite an
original question. When a future wave opens, integrate its `G` questions into that wave's ordinary sequence
and exhaust their follow-ups under the same closure gate.

For a closed wave, a `G` question is a validation question against its accepted ontology. It reopens the
wave only if the answer contradicts an accepted ruling; otherwise its concrete mechanism remains with the
named later owner.

#### Wave 1 additive questions - function, history, and strange compatibility

The section remains relevant. The reference validates its staged-canon, promotion, lineage, evidence, and
player-handle laws rather than displacing them.

- **G1.1:** When player interaction promotes incidental dressing into consequential truth, which original
  purpose, lineage, occupation, history, or local-event record owns the new fact, and when may the interaction
  create new canon rather than merely reveal existing canon?
- **G1.2:** Can every site family provide causal ownership for action-created facts without pretending that
  every natural, living, mobile, or anomalous site has an institutional builder or operator?

#### Wave 2 additive questions - room roster, repetition, Spice, and ecology

The section remains relevant. Its obligations, flows, populations, operating states, and material handles
provide the source facts from which sustained improvisational chains can grow.

- **G2.1:** Which generated site, room, assembly, prop, material, condition, position, and relationship facts
  are eligible for promotion into a `SceneFactGraph`, and what minimum source, owner, location, state,
  evidence, affordance, dependency, and expiry contract must promotion create?
- **G2.2:** How should a multi-actor `CrisisChain` consume roster roles, material flows, active props,
  conditions, clocks, and group contributions without duplicating the site simulation or reducing the scene
  to an abstract progress bar?

#### Wave 3 additive questions - architecture, structural stamps, and degradation

The section remains relevant. The transcript proves that geometry must support physical consequences, not
only static room presentation.

- **G3.1:** How do moved devices, embedded weapons, broken hulls, temporary anchors, dangling characters,
  vehicle orientation, and other action-created spatial facts bind to the semantic graph and local geometry
  while respecting fixed topology and legal mutation authority?
- **G3.2:** Which scars, damage states, improvised routes, and structural dependencies persist as physical
  history, and which remain short-lived scene facts with an explicit terminal or restoration condition?

#### Wave 4 additive questions - portals, secrets, vertical connections, and circulation

The section remains relevant. The realm transition and later escape show that connections are causal objects
with conditions and consequences, not merely exits.

- **G4.1:** What exact causal receipt may create, move, invert, stabilize, or destroy a portal, Breach,
  shortcut, improvised bridge, or vertical route, and how are endpoints, access conditions, travelers,
  evidence, pursuit, and return paths preserved?
- **G4.2:** How can a room-scale clue or action-created fact participate in a later site- or campaign-scale
  discovery chain without relying on the DM's context-window memory or revealing hidden canon too early?

#### Wave 5 additive questions - furniture assemblies, dressing, clutter, and empty rooms

The section remains relevant. The brandy, snow, dashboard, mace, and fuel were valuable because apparently
ordinary nouns became real interaction surfaces.

- **G5.1:** What lightweight composition and interaction grammar lets touched dressing acquire states such
  as wet, flammable, chilled, embedded, leaking, powered, blocked, or exhausted without turning every bottle,
  drawer, and snowflake into a continuously simulated object?
- **G5.2:** How may the DM freestyle a plausible physical detail in response to player attention, while one
  transactional validation step prevents the invention from contradicting space, inventory, prior evidence,
  or available affordances?

#### Wave 6 additive questions - creature scale, capacity, squeezing, and party participation

The section remains relevant. Leonardo's continuity failure demonstrates that group membership, individual
identity, location, and availability must remain separate even during fast multi-actor scenes.

- **G6.1:** What must a `CastRoster` record so an individual retains stable identity, aliases, group
  membership, position/zone, condition, motive, equipment, knowledge, relationship, and last valid transition
  through party splits, vehicles, scale changes, and realm transitions?
- **G6.2:** How are simultaneous rescuers, pilots, passengers, pursuers, bystanders, large creatures, and
  offscreen participants aggregated or individualized so cooperative scenes stay legible without eager
  simulation of every actor?

#### Wave 7 additive questions - tactical affordances and encounter reshaping

The section remains relevant. The reference's strongest play came from cooperative consequences, but its
dice drift shows that momentum cannot replace mechanical honesty.

- **G7.1:** How does a failed action honestly miss its declared objective while still creating a concrete
  complication, changed position, cost, threat advance, exposure, or new affordance that keeps play moving?
- **G7.2:** What bounded `Style/Combo` rules reward synchronized creativity, callbacks, setup/payoff, and
  multi-character contribution without fabricating a natural result, bypassing action economy, enabling
  crit fishing, or trespassing on Crit Magnitude?

#### Wave 8 additive questions - mutable and destructible environments

The section remains relevant. The reference requires typed state transitions and causal permanence rather
than prose-only destruction or one generic `obliterated` flag.

- **G8.1:** How do environmental mutations declare causal parents, targets, dependencies, propagation,
  duration, repair, evidence, and downstream affordances so an early fact can be legally consumed much later?
- **G8.2:** How do ordinary damage, transformation, banishment, disintegration, planar consumption, and
  Worldbreaker-scale permanence resolve through typed terminal disposition while preserving inventory,
  remains, identity, witnesses, recovery possibilities, and prior history?

#### Wave 9 additive questions - DM strategic cards and environmental authority

The section remains relevant. The reference adds player-authored motifs, cast continuity, tutorial posture,
and pressure cadence to the DM's existing priority-hand problem.

- **G9.1:** How should a sourced `Motif/CallbackDeck` remember player phrases, humor, music references,
  fears, relationships, and action styles with recurrence budgets and explicit mechanical permission, while
  separating private/user-local material from shippable authored content?
- **G9.2:** What active digest and validation boundary lets the DM sustain pressure, license quiet beats,
  mention only valid cast members and facts, and offer per-player rules/tutorial assistance without turning
  contextual examples into an action menu or tactical railroad?

#### Wave 10 additive questions - interim visual engine and release scope

The section remains relevant. A causal scene is only trustworthy if presentation shows the authoritative
positions and consequential states rather than a visually convenient approximation.

- **G10.1:** How does every target representation project current cast location, active props, conditions,
  damage, routes, moving platforms/vehicles, and realm transitions at gameplay scale without inventing or
  dropping canonical nouns?
- **G10.2:** Which visual tells make promoted affordances and accumulated object history legible without
  outlining every container, cluttering the interface, or exposing facts the viewpoint has not earned?

#### Wave 11 additive questions - workbench, clay corpus, and teaching loop

The section remains relevant. Authors and modders need to see why an improvisational chain worked or failed,
not merely whether a final scene rendered.

- **G11.1:** How can a human-readable roller/workbench author fact types, state transitions, combination
  permissions, affordances, motif hooks, and fallback behavior while compiling them into controlled,
  versioned contracts?
- **G11.2:** What causal debugger and clay corpus prove that an early prop, actor, resource, clue, or
  condition survives many turns, is consumed only when legal, produces a readable trace, and fails loudly
  when narration attempts a Leonardo-style continuity error?

#### Wave 12 additive questions - migration, persistence, acceptance gates, and build order

The section remains relevant. Gemini's context loss turns save/load, replay, compaction, and long-scene
continuity into product-defining acceptance requirements.

- **G12.1:** What canonical facts, selected recipes, source versions, event receipts, cast transitions,
  motif provenance, and causal edges must survive save/load, code/table evolution, context compaction, mod
  removal, and lazy reactivation—and what may be safely summarized or regenerated?
- **G12.2:** What deterministic, IP-clean golden-session trace proves that Genesis can reproduce causal
  generosity across a long cooperative crisis while remaining exact about identities, locations, dice,
  resources, durations, object states, knowledge boundaries, and lasting consequences?

### Prospective master questionnaire by wave and category (authored 2026-07-20)

Adam asks that the full procedural-design questionnaire be formulated now so the complete rules program remains
visible even when one generated follow-up becomes unusually deep. This bank is **newly authored prospectively**;
it does not alter the preservation statement above or pretend that future questions were part of a hidden original
list. Its job is navigation, coverage, dependency discovery, and protection against losing the larger design.

#### Provenance and lifecycle labels

```text
O   preserved original question already present in the running record
G   additive Gemini-reference question from the bank above
P   prospective question newly formulated in this master bank
F   material follow-up generated by an answer to O, G, P, or another F question
```

- `O` text is immutable except through an explicit correction recorded after it.
- `G` remains additive and never renumbers or replaces `O` or `P`.
- `P` is a real planned question, but its wording may be amended before opening if earlier answers expose a better
  boundary. Any amendment preserves the old wording and records why it changed.
- When a `P` question opens, the running record gives it the next Wave question heading and cites its prospective
  id. It does not become retroactively “original.”
- `F` questions stay nested under the question that exposed them until materially exhausted or explicitly assigned
  to a later owner. Depth never erases breadth.
- A wave closes only through the existing closure gate. Answering this bank in outline or approving its wording is
  not an answer to the questions themselves.

#### Live bookmark

```text
WAVE 1        O1.1-O1.20 closed; G1.1-G1.2 remain inherited validation gates
WAVE 2        CLOSED explicitly in section 10.SWEEP.8
CURRENT       PROMOTED WAVE 10 shared SceneTray/graphics-engine revision
PENDING NOW   Adam's batch disposition on the section 11.SWEEP full-wave recommendations
NEXT          deep-dive every flagged/material Wave 10 question and generated follow-up
AFTERWARD     Wave 3; implementation remains unauthorized
```

This means “return to Wave 2 Question 12” refers to continuing the Wave 2 numbering sequence. There was no
preserved prewritten Question 12. `P2.12` below is its newly formulated prospective wording and must retain that
provenance when opened.

#### Wave 1 - Dungeon Function, History, and Strange Compatibility

**Status:** original sequence closed. The authoritative O1.1-O1.20 questions, answers, generated follow-ups, and
closure live in sections 8.1-8.21. The categories already settled are:

- purpose, authority, construction identity, doctrine, occupants, and scale;
- resource ecology, historical lineage, current use, and misunderstood architecture;
- functional obligations, context cascade, discoveries, promises, and DM priority hands;
- repetition, existing-table disposition, player knowledge, subordinate purpose, Spice coherence, occupation,
  incompatibility/degradation, and canon commitment.

**Additive validation:** G1.1-G1.2 remain cross-wave contradiction checks for action-created canon and
non-institutional/living/mobile/anomalous sites. They do not reopen Wave 1 unless a later answer violates its
accepted ontology.

#### Wave 2 - Room Roster, Repetition, Spice, and Dungeon Ecology

**Status:** **CLOSED by Adam's explicit agreement** in section 10.SWEEP.8. O2.1-O2.11 are answered in sections
10.1-10.11; G2.1-G2.2 and P2.12-P2.20 are answered and audited through sections 10.SWEEP.1-10.SWEEP.7.

##### Settled original categories

- **O2.1-O2.3 - roster and realization:** pre-room allocations, light-simulation eligibility, and when an
  obligation earns a room rather than another realization.
- **O2.4-O2.6 - variation, Spice, and quantity:** correlated repeated families, multi-scope functional/Spice
  capacity, and demand becoming bounded exact quantities.
- **O2.7-O2.11 - living operation:** population realization, multiple groups, operating states, time/cadence, and
  material flows as player-facing handles rather than commodity simulation.

##### Additive integration before the prospective sequence

- **G2.1 - SceneFactGraph promotion (CLOSED BASELINE):** the full fact-promotion, callback, semantic-invention,
  compilation, precedent, NPC-casting-pool, private-deliberation, and certification follow-up tree is settled.
- **G2.2 - cooperative CrisisChain (CLOSED MECHANICAL BASELINE):** multi-actor crisis play consumes roster roles,
  flows, props, conditions, clocks, and contributions through a thin orchestration graph without duplicating the
  site simulation or becoming one abstract progress bar. Presentation remains deliberately assigned to promoted
  Wave 10.

##### Activation, boundaries, and neighboring systems

- **P2.12 - active/aggregate/cold ownership:** How does a site transfer facts and consequences among the active
  room slice, site-level aggregate, and cold lazy state without double-counting resources, people, threats, or due
  consequences?
- **P2.13 - external supply and dependency:** How do roads, waterways, portals, settlements, factions, trade,
  tribute, migration, raids, and blocked supply connect a site to its neighbors without simulating an entire region
  at room resolution?
- **P2.14 - renewal, depletion, and transformation:** Which resources regenerate, spoil, migrate, reproduce,
  transform, or permanently deplete; what owns each cadence; and what evidence lets players understand the change?

##### Ecology, holdings, and player-caused operation

- **P2.15 - ecological and population pressure:** How do hunger, crowding, predation, disease, morale, doctrine,
  labor demand, and habitat capacity cause movement, conflict, adaptation, dormancy, or collapse without spawning
  bespoke actors merely to fit the current scene?
- **P2.16 - loot, consumables, crafting outputs, and custody:** How do treasure, tools, food, ammunition, medicines,
  trade goods, waste, and manufactured outputs arise from actual holdings and processes while preserving surprise,
  rarity, ownership, theft consequences, and inventory usability?
- **P2.17 - player-caused operational change:** How do sabotage, repair, liberation, occupation, alliance, theft,
  cleansing, contamination, labor loss, route closure, and resource gifts alter the operating model without
  trespassing on Wave 8's detailed mutation mechanics?

##### Contradiction handling, projection, and closure evidence

- **P2.18 - impossible or overconstrained operation:** When purpose obligations, inhabitants, supply, space,
  history, and present conditions cannot all fit, which constraints are hard, which degrade, which create crisis,
  and when must generation fail honestly rather than hide the contradiction?
- **P2.19 - DM and player operational projection:** What compact projections let the DM understand owners,
  reserves, due changes, latent groups, flows, and legal handles while players receive proportionate sensory and
  investigatory tells without simulation dashboards or leaked secrets?
- **P2.20 - Wave 2 acceptance corpus:** Which site families, sizes, operating states, population conflicts, Spice
  bands, player interventions, long lazy intervals, and worst-case active slices must prove coherence, variety,
  causal persistence, and performance before Wave 2 may close?

#### Wave 3 - Architecture, Structural Stamps, and Degradation

**Status:** prospective P3.1-P3.12 plus additive G3.1-G3.2. Inherits Wave 1 construction/history truth and Wave 2
roster/flow/activation ownership.

##### Structural truth and scale

- **P3.1 - authoritative architectural representation:** What graph, room polygon/volume, cell/grid, elevation,
  material, support, boundary, and semantic-zone data are canonical, and which renderer geometry is only a view?
- **P3.2 - structural stamps:** How do purpose, builder tradition, doctrine, era, workforce, substrate, intended
  occupants, and realm skin select and combine repeatable architectural grammars without producing cloned sites?
- **P3.3 - structural versus decorative truth:** Which walls, floors, columns, beams, pits, platforms, openings,
  machines, and embedded features carry load, block movement, support placement, or own mechanics rather than
  existing only as visual dressing?
- **P3.4 - scale domains and transitions:** How does architecture serve Small through Gargantuan inhabitants,
  mixed-scale institutions, vehicles, crowds, and changing guises through domains and transition spaces rather
  than renderer scaling or oversized empty rooms?

##### Graph realization and constraint solving

- **P3.5 - graph-to-space realization:** How are the canonical functional/connectivity graph, room areas,
  adjacencies, depth, circulation, structural systems, and site boundary embedded into coherent geometry without
  inventing or losing graph edges?
- **P3.6 - reservations and competing claims:** How are portals, vertical circulation, tactical clearance,
  centerpiece obligations, furniture assemblies, secrets, utilities, structural support, and camera/readability
  needs reserved before later passes compete for the same space?
- **P3.7 - stamp composition and overlap:** Which architectural stamps may nest, merge, intersect, repeat, rotate,
  mirror, or deform, and what explicit rules prevent seams, impossible clearances, duplicate structures, and
  purpose-breaking collisions?
- **P3.8 - solve failure and degradation:** What is the ordered backtrack, relaxation, resize, alternate-stamp,
  split-domain, or honest-unsatisfied policy when hard constraints cannot fit, and which constraints may never be
  silently relaxed?

##### Historical architecture, runtime scars, and proof

- **P3.9 - lineage, decay, and repair layers:** How do original construction, each historical transformation,
  weathering, collapse, looting, repair, reinforcement, and current-occupant modification remain distinguishable
  in structure, evidence, materials, and navigation?
- **P3.10 - action-created spatial facts:** How do moved devices, embedded weapons, temporary anchors, dangling
  actors, vehicle orientation, broken boundaries, and similar G3.1 facts bind to local geometry without claiming
  unauthorized topology change?
- **P3.11 - persistent structural history:** Which scars, damage, improvised supports/routes, deformation, and
  dependencies become durable architectural truth under G3.2, and which belong to temporary scene state or Wave 8
  mutation owners?
- **P3.12 - Wave 3 acceptance corpus:** Which purpose families, shapes, scale domains, transformation histories,
  structural materials, solver conflicts, and gameplay-scale captures prove valid geometry, preserved graph truth,
  readable history, deterministic replay, and acceptable solve time?

#### Wave 4 - Portals, Secrets, Vertical Connections, and Circulation

**Status:** prospective P4.1-P4.12 plus additive G4.1-G4.2. Inherits canonical graph/geometry and reserves from
Wave 3.

##### Connection ontology and access

- **P4.1 - connection types:** What distinguishes door, archway, corridor, crawl, stair, ladder, ramp, shaft,
  chute, bridge, lift, window, breach, teleport, planar portal, secret connection, and one-way transition in
  topology, traversal, visibility, sound, capacity, and state?
- **P4.2 - endpoint and directionality contract:** How are both endpoints, orientation, directionality, capacity,
  travel time, current state, owners, knowledge, and failure behavior represented so one side cannot disagree with
  the other?
- **P4.3 - locks, keys, permissions, and barriers:** How do physical locks, passwords, rituals, faction access,
  size restrictions, hazards, seals, social permission, and resource costs create typed gates with lawful bypasses
  rather than binary DM fiat?
- **P4.4 - verticality and fall space:** How do elevation, headroom, climbability, support, falling, hanging,
  multiple landings, sight/sound across levels, large creatures, and rescue participation become playable without
  collapsing into flat adjacency?

##### Circulation, secrets, and dependency solvability

- **P4.5 - loops, bottlenecks, and escape:** What circulation profiles guarantee useful loops, service routes,
  defensible thresholds, shortcuts, dead ends, evacuation/escape possibilities, and purpose-appropriate access
  without making every site equally connected?
- **P4.6 - secret existence and discovery:** When is a connection physically present but unknown, how is evidence
  budgeted and placed, what checks/actions can reveal it, and how do false beliefs and partial maps remain distinct
  from topology truth?
- **P4.7 - dependency and progression safety:** How do keys, controls, clues, routes, power sources, faction help,
  destructible bypasses, and return paths form solvable dependency graphs that never place a required solution
  behind its own gate?
- **P4.8 - pursuit and group traversal:** How do doors, crowds, squeezing, vehicles, split parties, followers,
  enemies, closing gates, time costs, and simultaneous transitions resolve without teleporting or losing actors?

##### Mutation, knowledge, presentation, and proof

- **P4.9 - created and changing connections:** Under G4.1, what receipt may open, close, move, invert, stabilize,
  damage, repair, create, or destroy a connection; how are endpoints, travelers, pursuit, evidence, and return
  paths reconciled?
- **P4.10 - maps, memory, and cross-scale discovery:** How do viewpoint knowledge, maps, rumors, room clues, site
  secrets, and G4.2 campaign-scale discovery chains share references without revealing unknown endpoints or relying
  on context-window memory?
- **P4.11 - connection projection:** What must tactical, schematic, diorama, theater, and text views show about
  state, direction, elevation, visibility, capacity, danger, and interaction while preserving secrets and avoiding
  false spatial precision?
- **P4.12 - Wave 4 acceptance corpus:** Which multi-level graphs, secret/gated loops, size domains, split-party
  transitions, pursuit traces, mutable portals, save/load cases, and unsatisfied dependencies prove traversal,
  discovery fairness, continuity, and deterministic topology?

#### Wave 5 - Furniture Assemblies, Dressing, Clutter, and Empty Rooms

**Status:** prospective P5.1-P5.12 plus additive G5.1-G5.2. Inherits room obligations, structural reservations,
connections, materials, and secret boundaries.

##### Assembly grammar and spatial composition

- **P5.1 - assembly ontology:** What makes a bed area, workstation, shrine, kitchen line, cell, archive bay,
  market stall, guard post, laboratory, refuse point, or other furnishing cluster a functional assembly rather
  than unrelated props?
- **P5.2 - function, evidence, and dressing layers:** Which placed elements fulfill operating obligations, which
  communicate use/history/occupants, which support tactics or interaction, and which are optional visual texture;
  how does the compiler prevent one attractive prop from falsely satisfying every layer?
- **P5.3 - sockets, relations, and access:** How do wall/floor/ceiling/object sockets, adjacency, orientation,
  reachability, working clearance, circulation, visibility, ergonomic use, and support relations place assemblies
  sensibly within structural reservations?
- **P5.4 - density and meaningful emptiness:** How are sparse, normal, crowded, stripped, abandoned, ceremonial,
  ruined, and intentionally empty rooms distinguished; what protects circulation and focal hierarchy; and what
  makes emptiness informative rather than unfinished?

##### Variation, materials, state, and interaction

- **P5.5 - repeated-assembly variation:** How do correlated room families share institutional identity while
  varying layout, wear, ownership, contents, current use, failures, secrets, and focal props without procedural
  noise or cloned compositions?
- **P5.6 - material and affordance grammar:** Which lightweight material, construction, contents, attachment,
  mobility, temperature, wetness, flammability, fragility, power, cleanliness, and condition tags support G5.1
  interactions without continuously simulating every object?
- **P5.7 - containers, contents, and inventory boundary:** When are drawers, shelves, sacks, chests, barrels,
  corpses, racks, and hidden compartments real inventories versus aggregate holdings or dressing; how are search,
  custody, depletion, replenishment, and discovered emptiness handled?
- **P5.8 - attention and DM-authored detail:** Under G5.2 and G2.1, when may player attention or DM synthesis
  promote dressing into a stable noun/state/affordance, and what transaction prevents contradiction, retroactive
  convenience, or invisible mechanical invention?

##### Mutation ownership, visual realization, budgets, and proof

- **P5.9 - movement, use, damage, and exhaustion:** Which owner handles moving, tipping, opening, burning,
  breaking, repairing, consuming, spilling, embedding, blocking, powering, or exhausting an assembly/prop, and
  when does the change escalate to Wave 8 topology or systemic mutation?
- **P5.10 - asset realization and fallback:** How do semantic tags select approved sprites/models/faced boxes,
  compose kit parts, preserve scale/orientation/state readability, and fall back deterministically without
  changing object identity or mechanics?
- **P5.11 - active-prop and clutter budget:** How many full interactables, latent promotable props, containers,
  state variants, visual dressings, and collision bodies may a room/site support; how are distant/irrelevant
  elements aggregated without erasing promised facts?
- **P5.12 - Wave 5 acceptance corpus:** Which room families, densities, repeated assemblies, empty rooms,
  container/search traces, promoted props, mutations, realm skins, and gameplay-scale captures prove function,
  composition, readability, interaction honesty, variety, and performance?

#### Wave 6 - Creature Scale, Capacity, Squeezing, and Party Participation

**Status:** prospective P6.1-P6.12 plus additive G6.1-G6.2. Inherits architecture/connection dimensions, active
population owners, and promoted scene facts.

##### Physical scale, occupancy, and architecture

- **P6.1 - canonical body/form dimensions:** What size, footprint, height, reach, mass class, posture, occupied
  volume, movement modes, and form/guise relationship are authoritative for PCs, NPCs, monsters, swarms, mounts,
  vehicles, and unusual bodies?
- **P6.2 - capacity and co-location:** How many creatures and objects can stand, work, fight, pass, hide, ride,
  carry, or gather in a cell/zone/room/vehicle; how do comfort, functional capacity, tactical occupancy, crowding,
  and emergency overflow differ?
- **P6.3 - squeezing, reach, and constrained movement:** How do narrow passages, low ceilings, partial openings,
  difficult footing, long bodies, large equipment, reach, opportunity, cover, and forced movement interact across
  scale without binary “fits/doesn't fit” handwaving?
- **P6.4 - creature-scale domains:** How do sites built around dragons, giants, tiny folk, mixed populations,
  industrial machines, or vehicles allocate domain-scale rooms and transitions while remaining explorable by the
  player and coherent with original construction truth?

##### Party continuity, aggregation, and form change

- **P6.5 - party split and regroup:** What exact events, clocks, communication limits, viewpoint rules, danger
  ownership, shared-resource access, and DM-turn protocol govern characters in different rooms, routes, vehicles,
  or realms without duplicating or forgetting them?
- **P6.6 - CastRoster and offscreen aggregation:** Under G6.1-G6.2, when are actors individually simulated versus
  represented as groups; which identity, aliases, membership, position, condition, motive, equipment, knowledge,
  relationship, and last-transition facts can never be aggregated away?
- **P6.7 - mounts, vehicles, carrying, and passengers:** How are rider/passenger/cargo attachment, capacity,
  boarding, dismounting, falls, forced separation, vehicle orientation, damage, and simultaneous movement stored
  so containment never substitutes for actor location?
- **P6.8 - guises and transformations:** How do one entity's multiple forms change size, statistics, equipment,
  movement, occupancy, visibility, knowledge/reveal, and rendering while identity, history, relationships, and
  continuity remain singular?

##### Participation, presentation, and proof

- **P6.9 - tactical and cooperative participation:** How do large groups, different scales, off-turn rescuers,
  helpers, bystanders, summons, and environmental actors contribute to initiative, checks, CrisisChains, and
  hazards without giving everyone full simulation or reducing them to decorative narration?
- **P6.10 - scale-readable danger and access:** What tells let players judge whether a creature fits, reaches,
  sees, hears, can pursue, can be escaped, or can use an object/route; how are alternate approaches preserved for
  bodies the architecture did not primarily serve?
- **P6.11 - visual and camera projection:** How do true scale, standee/sprite dimensions, bases, occlusion,
  elevation, large bodies, crowds, split parties, guises, and vehicles remain legible across interim and future
  renderers without compressing mechanical scale?
- **P6.12 - Wave 6 acceptance corpus:** Which mixed-size casts, dragon domains, tiny passages, crowds, mounts,
  vehicles, transformations, party splits, offscreen intervals, rescue scenes, terminal outcomes, and captures
  prove identity continuity, spatial legality, fair participation, and bounded performance?

#### Wave 7 - Tactical Affordances and Encounter Reshaping

**Status:** prospective P7.1-P7.12 plus additive G7.1-G7.2. Inherits canonical geometry, connections, assemblies,
scale/capacity, SceneFact promotion, and CrisisChain ownership.

##### Tactical truth and environmental opportunity

- **P7.1 - authoritative tactical abstraction:** Which cells, zones, bands, lanes, elevations, adjacency,
  orientation, occupancy, and uncertainty are mechanical truth in exploration and conflict, and how can different
  views project them without changing rules?
- **P7.2 - movement, range, sight, sound, and cover:** How are distance, path cost, reach, line of sight/effect,
  hearing, concealment, partial/total cover, elevation, facing where relevant, and uncertain positions resolved
  consistently for player and enemies?
- **P7.3 - terrain and hazard affordances:** How do surfaces, height, chokepoints, obstacles, fluids, fire, smoke,
  darkness, machinery, unstable structures, and interactable props advertise and supply tactical options without
  every room becoming a puzzle arena?
- **P7.4 - starting state and reinforcement:** How do approach, scouting, surprise, formation, stealth, room use,
  occupant routine, doors, alarm state, reserves, escape routes, and reinforcements determine fair initial
  positions and later arrivals rather than camera-friendly placement?

##### Action, intelligence, creativity, and failure

- **P7.5 - action and resource economy:** How do standard actions, movement, reactions, bonus actions, checks,
  saves, item uses, spells, help, preparation, simultaneous/cooperative effort, and scene-specific operations share
  one declared-and-detected mechanical contract?
- **P7.6 - enemy environmental intelligence:** How do creatures and factions select tactics from canonical goals,
  abilities, knowledge, morale, coordination, and perceived terrain; learn or adapt lawfully; and avoid perfect
  omniscience, scripted stupidity, or reactive difficulty scaling?
- **P7.7 - arbitrary creative intent:** How does the player attempt anything physically/socially/magically
  plausible; how do engine owners expose legal primitives and stakes; and when may the semantic resolver create a
  new affordance, technique, tool, or consequence without bypassing checks or resource cost?
- **P7.8 - honest failure and momentum:** Under G7.1, how does a failed action miss its declared objective while
  producing proportional new position, cost, exposure, threat, partial information, complication, or alternate
  affordance only when licensed by the pre-roll contract?

##### Cooperation, risk, aftermath, and proof

- **P7.9 - cooperation, setup/payoff, and Style/Combo:** Under G7.2, what rewards synchronized intent, callbacks,
  environmental setup, sacrifice, timing, and multiple-character contribution without fabricating die results,
  multiplying actions, bypassing limits, or trespassing on Crit Magnitude?
- **P7.10 - risk, reward, retreat, and non-victory:** How do danger/reward profiles, telegraphs, readable skill
  opportunities, escape, surrender, parley, rescue, pursuit, objective completion, and unwinnable encounters remain
  brutal but fair across improvised reshaping?
- **P7.11 - encounter reconfiguration and aftermath:** How do changed terrain, opened routes, alarms, morale,
  reinforcements, casualties, loot/custody, fleeing actors, environmental spread, and unresolved objectives persist
  when combat begins/ends or the party leaves?
- **P7.12 - Wave 7 acceptance corpus:** Which tactical archetypes, noncombat crises, creative actions, failures,
  cooperative chains, enemy strategies, scale mixes, retreats, environmental transformations, and replay traces
  prove legality, variety, fairness, intelligence, and visual readability?

#### Wave 8 - Mutable and Destructible Environments

**Status:** prospective P8.1-P8.12 plus additive G8.1-G8.2. Inherits material/structural truth, tactical actions,
typed terminal disposition, and semantic invention authority.

##### Mutation ontology and physical consequence

- **P8.1 - mutation operations and owners:** What typed operations may change object, assembly, zone, structure,
  connection, resource, ecology, or place state; which system owns each; and what source authority, target,
  precondition, cost, evidence, dependency, and terminal rule must every mutation declare?
- **P8.2 - material response and damage:** How do material, construction, scale, force, damage type, temperature,
  pressure, corrosion, contamination, magic, wear, and existing condition determine damage, resistance, fracture,
  ignition, deformation, leakage, collapse, and repair without a bespoke simulation for every noun?
- **P8.3 - propagation:** How do fire, smoke, water, gas, cold, electricity, disease, infestation, collapse,
  flooding, contamination, alarms, and magical effects spread through owned graphs with bounded cadence,
  barriers, fuel/resources, aggregation, evidence, and deterministic lazy catch-up?
- **P8.4 - topology mutation:** What authority and validation may breach, block, collapse, bridge, tunnel, move,
  rotate, invert, flood, seal, repair, or create paths; how are connectivity, occupants, supports, maps, secrets,
  pursuit, and escape reconciled atomically?

##### Duration, dependency, terminal state, and offscreen life

- **P8.5 - temporary, persistent, repairable, and permanent:** How are duration, stabilization, maintenance,
  restoration, regeneration, scarring, recurrence, and irreversibility chosen; what makes a change local, site-wide,
  regional, Mythic, or Worldbreaker?
- **P8.6 - causal chains and dependencies:** Under G8.1, how do mutations record parents, targets, propagation,
  supported/blocked dependencies, consumption, evidence, and downstream affordances so an early change can be
  legally used much later without keyword inference?
- **P8.7 - terminal disposition across nouns:** Under G8.2, how do ordinary damage, breakage, death,
  transformation, banishment, disintegration, planar consumption, obliteration compatibility, remains, inventory,
  identity, witnesses, recovery, and history resolve for actors, items, creatures, and structures?
- **P8.8 - inactive and offscreen mutation:** Which processes advance while rooms/sites are cold; what summaries
  make catch-up deterministic and bounded; how are due hard consequences preserved; and when must a site reactivate
  into a dedicated crisis rather than silently aggregate?

##### Authority, readability, budgets, and proof

- **P8.9 - player, DM, system, and Crit authority:** Which mutations arise directly from resolved mechanics,
  which are DM-authored consequence forms inside envelopes, which require place/ecology owners, and which need
  C3-C4 or explicit Crit reach; how are hostile and beneficial inventions kept symmetric and fair?
- **P8.10 - mutation tells and visual history:** How do sound, debris, cracks, stains, smoke, temperature, motion,
  changed silhouettes, inaccessible routes, map updates, and Codex/evidence make active danger and lasting scars
  readable without revealing hidden propagation or unsupported precision?
- **P8.11 - performance and saturation:** What active propagation fronts, mutable entities, topology edits,
  dependencies, histories, particles/visual states, and catch-up work fit each scene/site budget; how are minor
  resolved facts compacted without erasure?
- **P8.12 - Wave 8 acceptance corpus:** Which materials, damage types, propagation networks, topology changes,
  repairs, offscreen intervals, terminal dispositions, Mythic/Worldbreaker events, save migrations, and visual
  captures prove causal correctness, persistence, fairness, boundedness, and historical legibility?

#### Wave 9 - DM Strategic Cards and Environmental Authority

**Status:** prospective P9.1-P9.12 plus additive G9.1-G9.2. Inherits promises, callbacks, SceneFactGraph,
CrisisChain, faction/actor knowledge, mutable environments, and creative envelopes.

##### Card ontology, authority, and scheduling

- **P9.1 - card families and sources:** What distinct cards represent obligations, consequences, callbacks,
  motifs, faction moves, environmental opportunities, threats, quiet beats, discoveries, rewards, tutorials, and
  local Spice; which canonical event/owner may mint each?
- **P9.2 - permissions and legal windows:** What can each card request versus establish; which REPLAY, DERIVE, ROLL,
  PROPOSE, or SYNTHESIZE lane applies; and what semantic, geographic, spatial, temporal, knowledge, resource, and
  C-band conditions make a play legal now?
- **P9.3 - priority hand and service:** How do MUST PLAY, PLAY SOON, PLAY IF FIT, RESERVE, and LOCAL SPICE interact
  with salience, deadlines, player attention, contracts, scene load, danger, quiet, and opportunity so priorities
  are honored without overwriting rolled room identity?
- **P9.4 - deferral, expiry, and forced delivery:** When may the DM defer a card, what raises pressure, what expires
  versus persists, and when must the system create a diegetic delivery, messenger, consequence, dedicated hook-walk,
  or honest failure rather than silently dropping a promise?

##### Memory, pressure, agency, and strategic opposition

- **P9.5 - motif/callback memory:** Under G9.1, how are player phrases, humor, music references, fears, relationships,
  action styles, scars, objects, and prior hostile inventions sourced, scoped, budgeted, transformed, cooled, and
  separated from private/profile-local versus shippable content?
- **P9.6 - pressure, release, and cadence:** How do active crises, clocks, danger, player momentum, recent intensity,
  quiet needs, recurrence saturation, and campaign style determine whether the DM escalates, sustains, pivots,
  releases, or lets a room remain ordinary?
- **P9.7 - attention, contracts, and player direction:** How do questions, repeated investigation, promises,
  bargains, payment, pursuit, abandonment, and explicit goals promote cards and service guarantees without turning
  curiosity into an unavoidable quest or cooling into erasure?
- **P9.8 - faction/NPC/environment strategy:** How do actors and systems draw or create plans from goals, knowledge,
  resources, relationships, clocks, territory, prior observation, and doctrine; how do hostile cards obey causal
  preparation, graduated counters, and no-reactive-scaling law?

##### DM context, non-railroading, composition, and proof

- **P9.9 - environmental authority:** Which card effects may reposition threats, activate machinery, reveal
  prepared features, change weather/lighting, spend reserves, start propagation, close opportunities, or create
  expression-bearing complications; when must they defer to Wave 8 mutation and Wave 7 action owners?
- **P9.10 - DM digest and assistance profile:** Under G9.2, what bounded current hand, cast/fact validity, legal
  actions, due obligations, rules references, and per-player rules-only/affordance/tutorial posture reach the DM
  without an action menu, tactical steering, stale nouns, or context overload?
- **P9.11 - composition, saturation, and anti-railroad:** Which cards may combine into one beat, how are competing
  owners arbitrated, what prevents recursive callbacks and nonstop escalation, and what measurable room remains for
  player-authored direction, surprise, refusal, silence, and genuine DM taste?
- **P9.12 - Wave 9 acceptance corpus:** Which long sessions, quiet/dense campaigns, deferred promises, expiring
  services, callbacks, factions, private motifs, invalid plays, context compactions, and adversarial card stacks
  prove memory, restraint, agency, legal authority, varied cadence, and causal delivery?

#### Wave 10 - Interim Visual Engine and Release Scope

**Status:** **PROMOTED to the first wave after Wave 2**, prospective P10.0-P10.12 plus additive G10.1-G10.2. It
inherits Wave 1/2 semantic, roster, flow, promotion, and authority truth; it sets the shared SceneTray target and
required projections for Waves 3-9. Those later waves may expose explicit reopenings but may not let renderer
convenience become canonical truth.

##### Prospective amendment record - promotion to shared SceneTray gate

This promotion adds P10.0 and expands three prospective questions. Their earlier 2026-07-20 wording is preserved
here rather than silently overwritten:

- `P10.1` previously asked: “Which range/relationship view, lit schematic, tactical diorama, hybrid storyboard,
  exact cell board, text/card surface, and retained 3D theater roles best serve ordinary play, combat, exploration,
  accessibility, debugging, and future expansion; which becomes the release default?” The expansion names the
  shared town/social and travel/map adapters and asks for one controlled default experience.
- `P10.9` previously asked: “Does combat reconfigure one persistent scene, switch views, or open a tactical layer;
  how do conversation, investigation, CrisisChains, travel, split parties, and aftermath retain spatial and visual
  memory across mode changes?” The expansion makes the shared scene identity across map, town, exploration,
  dungeon, and battle explicit.
- `P10.12` previously asked: “Which fixed canonical scenes, gameplay-scale captures, renderer comparisons, beauty
  targets, secrets, promotions, scale extremes, topology changes, devices, accessibility paths, and failure
  fallbacks decide the release default and prove it more truthful/useful than the current view?” The expansion
  requires named cross-mode corpus coverage and adds simpler as an acceptance dimension.

No accepted answer existed for these prospective questions. The amendment changes future coverage and execution
priority, not a prior ruling.

##### Shared SceneTray thesis and adapters

- **P10.0 - one tray grammar, typed scene adapters:** What common `SceneTray` contract must dungeon/interior,
  town/social, wilderness/exploration, travel/map, and battle share; which differences require typed adapters; and
  how does combat reconfigure an established tray instead of replacing it with an unrelated tactical map?

##### Representation choice and canonical projection

- **P10.1 - target representation portfolio:** Which range/relationship view, lit schematic, shallow-oblique
  tactical diorama, hybrid storyboard, exact cell board, text/card surface, and retained 3D theater roles best serve
  ordinary play, town/social scenes, travel/map, exploration, combat, accessibility, debugging, and future
  expansion; which controlled combination becomes the one release-default SceneTray experience?
- **P10.2 - state-to-visual contract:** Under G10.1, how does every target view project current rooms/zones,
  connections, elevations, cast locations, scale, active props, hazards, conditions, damage, routes, vehicles,
  secrets, and transitions without inventing or omitting canonical nouns?
- **P10.3 - precision and uncertainty:** Which positions and dimensions are exact, zone-level, relational,
  estimated, hidden, or unknown; how does the visual language show that distinction so a pretty arrangement never
  creates false tactical promises?
- **P10.4 - camera, framing, and viewpoint:** How do scene focus, orbit/top-down choice, occlusion, cutaway,
  elevation, table edge, split parties, large creatures, hidden areas, and viewpoint knowledge remain readable and
  performant without camera-driven world mutation?

##### Beauty, interaction, motion, and continuity

- **P10.5 - architecture, materials, light, and atmosphere:** Which existing geometry, normal maps, surface
  response, realm palettes, motivated practicals, shadows, grade, weather, effects, and stage framing survive in the
  interim engine; what measurable beauty floor prevents simplification from becoming visual abandonment?
- **P10.6 - creatures, objects, and scale:** How do canonical sprites/standees, bases, true scale, guises, crowds,
  faced boxes, extrusions, models, assembly kits, state variants, and fallbacks coexist without sprite/prop
  citizenship drift or mechanically misleading silhouettes?
- **P10.7 - interaction, promotion, and secret tells:** Under G10.2, what visual/aural changes expose known
  interactables, promoted affordances, evidence, damage, ownership, active hazards, and accumulated history without
  outlining all clutter, spoiling secrets, or requiring bespoke art before mechanics can exist?
- **P10.8 - transitions and verbs:** How do placement/reveal, movement, attack, reaction, damage, condition,
  transformation, door/portal use, topology change, destruction, pickup/transfer, and scene transition animate
  through invisible-hand/tabletop laws while preserving exact event order and state?

##### Modes, budgets, generation, and visual acceptance

- **P10.9 - map/town/exploration/combat continuity:** How do travel/map, arrival, town/social interaction,
  wilderness exploration, dungeon movement, investigation, CrisisChains, battle reconfiguration, split parties,
  and aftermath retain one scene identity, cast/object continuity, and visual memory across adapters and mode
  changes?
- **P10.10 - performance, device, UI, and accessibility:** What frame/memory/load budgets, quality tiers, input
  modes, text alternatives, color/contrast, scale controls, reduced motion, screen-reader/live-region behavior, and
  fallback representations define the supported release surface?
- **P10.11 - assets, exact generation, and rollback:** How do approved libraries, sockets, procedural composition,
  governed image generation, semantic slot specs, review/certification, caches, deterministic fallbacks, feature
  flags, and retained old assets make a no-human visual lane reversible and canon-safe?
- **P10.12 - Wave 10 acceptance corpus:** Which fixed canonical dungeon, town/social, wilderness/exploration,
  travel/map, and battle scenes; gameplay-scale captures; renderer comparisons; beauty targets; secrets;
  promotions; scale extremes; topology changes; devices; accessibility paths; and failure fallbacks decide the
  release default and prove it simpler, more truthful, and more useful than the current composed 3D view?

#### Wave 11 - Workbench, Clay Corpus, and Teaching Loop

**Status:** prospective P11.1-P11.12 plus additive G11.1-G11.2. Inherits every semantic schema, compiler boundary,
renderer contract, and acceptance need discovered in prior waves.

##### Users, sources, authoring, and compilation

- **P11.1 - workbench users and jobs:** What must Adam, a future designer, a table/content author, an artist, a
  modder, an AI agent, QA, and a player-facing creator each inspect or change; which powers and dangerous operations
  must remain distinct?
- **P11.2 - source-of-truth and compile path:** Which markdown/tables/data/assets/schemas are authored sources,
  which artifacts are generated, how are provenance and ownership exposed, and how does the workbench prevent
  editing compiled outputs or creating parallel truth?
- **P11.3 - semantic and recipe authoring:** Under G11.1, how are fact types, classes, services, attributes,
  relationships, constraints, triggers, effects, costs, affordances, failures, variants, motifs, fallbacks, and
  version rules created and explained without requiring raw code?
- **P11.4 - controlled preview and compilation:** How does an author preview rolls, site graphs, rooms, assemblies,
  mechanics, inventions, migrations, and visuals; fix meaningful choices; request variants; and compile only after
  validation while preserving reproducible seeds and inputs?

##### Debugging, corpus, simulation, and teaching

- **P11.5 - constraint and causal debugger:** What view explains why a candidate appeared, which constraints
  passed/failed, what relaxed, who owned each fact/change, how an effect propagated, why a callback was legal, and
  where an unsatisfied request stopped without dumping internal noise?
- **P11.6 - clay corpus design:** Which small, deliberately ugly/cheap canonical scenarios isolate site purpose,
  roster, structure, portals, assemblies, scales, tactics, mutation, cards, rendering, invention, and migration so
  rule quality can be judged before expensive content/art production?
- **P11.7 - golden causal traces:** Under G11.2, how do long deterministic sessions prove early nouns, actors,
  resources, clues, conditions, positions, rolls, effects, callbacks, inventions, and terminal outcomes survive,
  become consumable only when legal, and fail loudly on continuity drift?
- **P11.8 - batch simulation and coverage:** How are purpose/size/state/realm/Spice/seed matrices, solver tails,
  path playability, resource balance, visual captures, model behaviors, edge cases, and regression diffs sampled and
  summarized without mistaking aggregate green metrics for good individual worlds?

##### Feedback, mods, automation, and proof

- **P11.9 - teaching and feedback loop:** How do human selections, redlines, rejected candidates, semantic
  corrections, playtest complaints, runtime traces, and certification outcomes become versioned examples, rules,
  fixtures, weights, or model context without silently learning private data or overfitting one preference?
- **P11.10 - mod/IP/provenance boundary:** How are tables, rules, schemas, assets, recipes, model outputs, and
  external references licensed, attributed, packaged, sandboxed, versioned, dependency-checked, shared, removed,
  and prevented from contaminating core or another world?
- **P11.11 - no-human pipeline authority:** Which authoring, validation, visual generation, certification,
  migration, and promotion lanes may graduate to autonomous operation; what executable evidence, audit sampling,
  budgets, quarantine, rollback, and human exception path earn and retain that trust?
- **P11.12 - Wave 11 acceptance corpus:** Which novice/expert authoring tasks, source edits, broken constraints,
  long traces, visual redlines, mods, IP hazards, autonomous batches, migrations, and rollback exercises prove the
  workbench understandable, safe, useful, reproducible, and capable of teaching the system?

#### Wave 12 - Migration, Persistence, Acceptance Gates, and Build Order

**Status:** prospective P12.1-P12.12 plus additive G12.1-G12.2. This wave integrates every earlier authority into
the final persistence, compatibility, delivery, and implementation contract.

##### Canonical persistence and evolution

- **P12.1 - canonical save boundary:** Which world, site, graph, room, actor, item, relationship, recipe, resource,
  clock, card, fact, event, knowledge, visual-binding, and provenance state must be saved exactly; what may be
  derived, compacted, cached, or regenerated?
- **P12.2 - event, snapshot, and reconciliation model:** Which changes require durable events, when are snapshots
  taken, how are detected/declarative transactions made idempotent, and how does load/recovery reconcile stale or
  partially written state without duplicating or dropping consequences?
- **P12.3 - schema/table/recipe migration:** How do versioned schemas, generated tables, effect primitives,
  semantic recipes, custom precedents, renderer contracts, and balance corrections migrate old worlds while
  preserving the rule version that governed historical outcomes?
- **P12.4 - dependency loss and replacement:** What happens when a mod, asset pack, model, custom pattern,
  primitive, table row, realm skin, or external service is missing, retired, quarantined, incompatible, or removed;
  which deterministic fallbacks preserve canon and which worlds must stop honestly?

##### Compaction, determinism, recovery, and ownership

- **P12.5 - lazy state and context compaction:** Under G12.1, what facts, recipes, transitions, motifs, causal edges,
  obligations, and provenance survive cold storage and DM-context compaction; what summaries are safe; and what
  must reactivate before play can legally consume it?
- **P12.6 - seeds, models, and reproducibility:** Which generation and resolution stages must replay exactly from
  seeds/inputs, which AI-authored semantic outputs must be stored as committed canon, and how are provider/model
  changes tested without pretending nondeterministic re-generation is historical truth?
- **P12.7 - rollback, quarantine, and repair:** How do corrupt saves, unsafe recipes, broken migrations, bad
  generated assets, contradictory state, failed deployment, and certification mistakes recover through backups,
  transactions, repair tools, migrations, feature flags, or quarantine without destructive reset?
- **P12.8 - privacy, portability, and sharing:** How can players inspect, export, import, duplicate, archive,
  delete, and share worlds/profile patterns while private motifs, personal data, licensed assets, product telemetry,
  and cross-world candidates obey consent, provenance, and isolation boundaries?

##### Acceptance, implementation strategy, and final closure

- **P12.9 - executable acceptance gates:** Under G12.2, what unit/property/integration/replay/performance/visual/
  accessibility/security/IP/manual gates and golden sessions must pass for each system, wave, build slice, migration,
  and release; which failures block versus warn?
- **P12.10 - dependency graph and build slices:** In what order do semantic owners, schemas, compiler, spatial
  systems, domain adapters, renderer, workbench, certification, and migration land; what vertical slices deliver
  felt player value; and which best-case capabilities remain explicit deferred gaps rather than hidden scope cuts?
- **P12.11 - legacy disposition and deployment:** Which current walk/table/renderer/bridge/state systems are
  retained, rewired, recomposed, feature-flagged, archived, or retired with replacement proof; how are branches,
  staged rollout, local data, observability, rollback, and clean-close responsibilities handled?
- **P12.12 - final design and build authorization gate:** Have all inherited contradictions, deferrals, budgets,
  risks, IP/privacy/security obligations, acceptance evidence, production costs, and unresolved choices been made
  explicit; which exact slice is authorized; and what would require reopening a wave before implementation?

#### Master-bank closure discipline

This prospective bank is deliberately comprehensive but not self-closing. Every question still receives, when
opened:

1. a plain-English restatement and relevant options;
2. concrete dungeon and Gemini-game examples;
3. research filtering and explicit limits of what the papers establish;
4. implementation, content, runtime, maintenance, migration, and QA cost;
5. Adam's ruling plus all generated follow-ups;
6. future-owner assignments and contradiction checks;
7. a wave-level audit and Adam's explicit closure.

The bank may expose dependencies that justify reordering future waves, but no question vanishes because another
wave touched it first. Earlier rulings become inherited constraints; the later owning question tests integration,
edge cases, and acceptance rather than making Adam decide the same principle again.


<!-- END VERBATIM MIGRATION: original lines 309-1216 -->

## Prototype/MVP phasing amendment (2026-07-21)

The preserved questionnaire and additive bank above are unchanged. For every future ruling, the answer record must
also apply the [prototype/MVP phasing framework](PHASING-FRAMEWORK.md): distinguish any narrower proof prototype from
the recognizable playable pre-alpha/MVP, then name the retained upgrade seam, feature goal, and promotion evidence,
or state why the feature goal is pre-alpha-critical. A borderline behavior stays in the MVP with narrow breadth.
An unresolved phase cut keeps the relevant closure audit provisional; it never deletes or replaces an original,
additive, or generated follow-up.

Design-wave size does not determine implementation-unit size. Each accepted ruling must also map into the
[feature-promotion ledger](FEATURE-PROMOTION-LEDGER.md) and the retained small-pass
[Clay Proof Ladder](CLAY-PROOF-LADDER.md): first proof, playable MVP gate, ideal feature goal, and promotion evidence.
Future wave audits report unmapped or ownerless goals explicitly. This traceability is additive to the preserved
question/closure protocol and does not authorize implementation before Wave 12's final gate.
