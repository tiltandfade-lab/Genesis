---
type: design-study
status: DISCOVERY
created: 2026-07-18
updated: 2026-07-20
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

<!-- END VERBATIM MIGRATION: original lines 1-308 -->
