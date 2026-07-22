---
type: research
status: COMPLETE
created: 2026-07-18
updated: 2026-07-22
related:
  - "[[PROCEDURAL-DUNGEON-DIRECTION]]"
  - "[[PROCEDURAL-DUNGEON-ENGINE-CROSSWALK]]"
---

# From Rolls to Rooms

## A technical research report on procedural dungeon architecture, doors, and dressing for Genesis

Prepared 2026-07-18

Primary Genesis audit snapshot: `a863de76ff6afd1931168763d9ad52b0e58b915a`; selected seams
rechecked at `3736d58c56bfdcbfe2f715d76ffc4d4c03626570`

Research corpus: Archmage Rises, Edgar documentation, and nine included primary-source papers

---

## Executive conclusion

Genesis should commit to a **deterministic multi-pass tile-and-slot room compiler**.

The subsequent design discussion accepted this direction while opening twelve gated question waves.
The current decision authority is `docs/PROCEDURAL-DUNGEON-DIRECTION.md`; this report is its research
foundation, not an implementation spec.

That recommendation does not replace the walk rollers. It clarifies their job. The rollers should author the room's intent: what kind of space this is, its footprint family, dimensions, elevation, structural features, portals required by the graph, purpose, major assemblies, condition, treasure, and narrative facts. A room compiler should turn that intent into explicit geometry: cells, oriented boundary edges, door apertures, reservations, zones, multi-cell footprints, support sockets, and scored placements. The renderer should skin and refine that solved plan. The DM should narrate it and play strategic cards against it.

This is also the answer to the question raised by the Archmage Rises article. Genesis is already closest to the article's **third method, pieces or tiles**, for architecture. Its 5-foot grid, rasterized room polygons, corridors, wall and door cells, terrain tiers, and compiled volumetric shell are a tile system. Genesis dressing is closer to an incomplete **builder** method: a sequence of dressing, card projection, optional distribution, interactable binding, and composition refinement. What is not working is not the choice of tiles. It is the absence of one shared legality model across those stages.

Door placement exposes the problem most cleanly. A door is currently chosen largely as the room-boundary cell nearest the other room's center. That is deterministic and usually connects the graph, but it cannot express the architectural question: which oriented span of wall is a legal and desirable aperture, given width, corners, elevation, structural features, symmetry, circulation, threshold clearance, motion, and the compatible side of the neighboring region? The logical model has a `DOOR` cell where it needs a **portal object on an edge**.

The same issue reappears in dressing. One subsystem avoids a center block and a door apron. Another uses a one-cell occupied set. Another independently places interactables. The room grammar refines only a limited interactable set. Renderer wall slots exist, but they arrive after semantic placement. Because there is no common reservation, footprint, clearance, and socket model, the systems cannot negotiate.

The proposed compiler is not speculative. It is the synthesis of several mature lines of work:

- semantic, rule-based placement with legal-region construction and backtracking [S1];
- high-level scene descriptions compiled into procedures [S2];
- explicit door-to-door paths and accessibility in whole-room optimization [S3];
- functional and visual layout criteria such as clearance, connectivity, alignment, balance, and focal emphasis [S4];
- fast gameplay constraints along portal graphs and paths [S5];
- room-template boundary compatibility and configuration spaces [S6];
- separation of architecture from furnishing and automated expressivity/playability evaluation [S7];
- learned layout priors as a later enhancement [S8];
- declarative structural constraints through SMT as an escalation path [S9].

Genesis already contains many of the hard ingredients: a canonical graph, deterministic random streams, rich rolls, provenance, reachable polygonal plans, a compiled shell, stateful interactables, realm skins, one-room rendering, and a deep verification culture. The work is therefore a consolidation and contract correction, not a restart.

---

## 1. What the Archmage Rises article is actually saying

The Archmage Rises article describes four broad ways to construct rooms:

1. **Chunks:** choose a largely finished authored room or section.
2. **Chunks plus tiles:** choose an authored shell, then populate a grid or sockets inside it.
3. **Pieces or tiles:** assemble architecture and contents from discrete pieces governed by tile occupancy and layered rules.
4. **Builder:** encode a room's construction as an ordered program, where earlier decisions create constraints and opportunities for later steps.

These are not exclusive mathematical categories. A production generator often combines them. A tile substrate can support a builder, while selected authored chunks can enter the same compiler as large templates.

The article's strongest technical ideas are not its Unity-specific implementation details. They are the separation of object categories and the ordering of decisions:

- floor, wall, and door structure precede decoration;
- practical objects and decorative objects have different rules;
- placed objects block or enable later spaces;
- objects can expose slots for child objects;
- wall space and floor space are different placement domains;
- selection, placement, and later dressing are separate responsibilities;
- the builder controls dependency order.

Genesis has adopted portions of this structure without giving them one state. That is why the present system feels tantalizingly close. It has tiles but not a complete tile legality model. It has builder stages but not a shared builder context.

### 1.1 Which method Genesis uses

For architecture, Genesis uses **pieces or tiles**.

The evidence is direct:

- `SpatialPlan.cells` is a row-major 5-foot grid of `VOID`, `FLOOR`, `WALL`, `DOOR`, and `WATER`.
- Polygonal shapes are rasterized into included cells.
- Corridors are carved along graph exits.
- walls and doors are derived from the plan.
- elevation tiers sit beside the cell layer.
- the renderer compiles the plan into floors, risers, and volumetric wall runs.

This is a better foundation for Genesis than room-sized chunks. The game's premise is that rolls author persistent worlds, so a small authored-room library would produce visible repetition and would make new roll combinations difficult to express. Chunks can still be valuable for rare set pieces or as assembly templates, but they should not be the default architecture model.

For dressing, Genesis is **builder-like**, but the builder is fragmented. The production derivation path roughly does the following:

```text
generic deterministic dressing
  -> append canonical projected cards
  -> optional subcell distribution
  -> bind stateful interactables
  -> refine interactable arrangement with room grammar
  -> render and skin
```

The sequence resembles the article's builder, but each stage sees a different partial world. Earlier dressing cannot reserve for later interactables. The grammar does not arrange the entire dressing plan. Distribution does not own global circulation and is disabled in the audited production snapshot. Renderer mount slots are a late geometric convenience rather than a semantic contract. A builder is only as coherent as the context it mutates.

### 1.2 Why tiles are still the right method

Tiles give Genesis five properties it needs:

1. **Mechanical truth.** The same substrate can answer combat movement, accessibility, cover, hazard, reachability, and placement questions.
2. **Determinism.** Candidate regions and footprints can be reproduced and verified from a seed.
3. **Constraint propagation.** A committed door or altar can remove legal space from every later object.
4. **Debuggability.** Developers can see legal cells, rejected cells, reservations, scores, and the exact rule that removed a candidate.
5. **Table composability.** A new roll can add a stamp, zone, requirement, or score term without requiring an authored room mesh.

The common objection to tiles is visual regularity. That objection applies only if logical resolution is confused with render resolution. Genesis should use multiple resolutions:

- a **5-foot macro grid** for topology, combat, zones, and large footprints;
- **edge subslots** for door widths, corner margins, wall bays, windows, and mounts;
- **subcell or continuous transforms** for chairs, bottles, debris, rugs, and visual variation;
- polygonal feature masks for irregular footprints and clearances.

The entire grid does not need to become one-foot tiles. A coarse logical cell can contain several visual sockets. A two-cell table can expose four chair sockets, tabletop sockets, and a clearance polygon. This preserves tactical honesty while escaping the blocky look.

---

## 2. What the research adds beyond the article

The Archmage article is practical and intuitive. The papers make its implicit mechanisms precise.

## 2.1 Semantic rules and legal-region construction

Tutenel et al. describe a generic rule-based layout solver in which objects belong to semantic classes and expose spatial features such as walls, tabletops, clearance regions, and off-limit areas. Placement begins with a possible region, subtracts forbidden regions, intersects required feature regions, and then uses attractors or detractors to weight valid candidates [S1, Sections 3-4].

The critical technique is that object rules do not merely say "near a wall." They transform legal space. Clearance can be represented by enlarging an object's footprint or a forbidden region through a Minkowski sum. A tabletop exposes a region where child objects may be placed. A desk assembly can be a hierarchical block, placed as a unit and then populated by subrules [S1 pp. 4-7].

The solver accepts an ordered plan with counts, loops, conditionals, context tags, optional elements, and backtracking. It can create provisional semantic areas that later rules consume. Its designer tools display possible regions and generated alternatives, which is as important as the solver itself [S1 pp. 6-9].

This maps almost directly to Genesis:

- a door creates `threshold`, `swing`, `apron`, and `approach` off-limit features;
- a wall run exposes mount sockets;
- a table exposes chair and tabletop sockets;
- an altar exposes a focal approach and flanking sockets;
- a bed assembly contains bed, footlocker, and access side;
- a row of pews creates a center-aisle reservation;
- a structural pit removes ordinary floor legality but may expose a bridge or edge socket.

The reported prototype placed about 30 objects from 13 classes with one to three rules per class in roughly 152 milliseconds on 2009 hardware [S1 p. 9]. The precise number is not a modern performance target, but it demonstrates that semantic rules, diagnostics, and backtracking are compatible with interactive content generation.

## 2.2 Rollers as semantic scene descriptions

The follow-up semantic scene description work begins from an observation that applies strongly to Genesis: designers think first about **what a scene is**, not the exact algorithm for placing it. The proposed language expresses object types, attributes, relationships, counts or ranges, mandatory and optional elements, and hierarchical context; a compiler turns that description into a layout procedure [S2, Sections 1-4].

Genesis's current architectural table stores much of this intent in display prose. The spatializer then keyword-scans the prose to recover a small subset. That reverses the proper boundary. The roller should emit a semantic scene description and the user-facing prose from the same source row.

For example, a row could compile to:

```text
RoomProgram
  purpose: shrine
  footprint: octagon
  dimensions: 40ft x 40ft
  elevation: central-dais(+1)
  portalPolicy: axial-preferred, corner-margin=5ft
  required:
    altar(far-wall-or-dais, accessible-front)
    aisle(entry -> altar)
  optional:
    pew-row(count-fit)
    brazier-pair(flank altar)
  structural:
    alcove(count=2, opposing-preferred)
  detailRoll:
    cracked mosaic, damp, one offering bowl
```

The roller still owns the creative result. The compiler has simply received machine-legible intent rather than being asked to reconstruct it from English.

## 2.3 Circulation as generated geometry

Yu et al. encode furniture arrangement as a whole-layout objective including accessibility, visibility, door-to-door pathways, and pairwise distance and orientation relationships [S3, Sections 3-5]. Their pathway is not just a boolean flood-fill after furniture is placed. It is represented geometrically and optimized alongside the furniture. Merrell et al. likewise include object clearances and connected free configuration space for a human-sized disk, as well as conversation, balance, alignment, focal emphasis, and symmetry [S4, Sections 3-4].

The Genesis lesson is decisive: **circulation is an object in the plan**.

The compiler should reserve:

- threshold and apron regions at every portal;
- door motion or a conservative door-use envelope;
- widened shortest paths between every required portal pair;
- access paths from the circulation spine to mandatory interactables;
- a focal approach where the room recipe requires one;
- explicit aisles inside assemblies such as pews, shelves, bunks, or dining rows.

These reservations can be raster masks at macro resolution with geometric refinements at subcell resolution. Dressing does not get to occupy them. If a required assembly cannot fit without breaking circulation, the compiler should select an alternate assembly, reduce an optional count, or report that the room program is infeasible.

## 2.4 Hard constraints versus soft composition

The furniture papers distinguish validity from quality. Collision, containment, and accessibility can be hard requirements. Alignment, balance, symmetry, conversation, visibility, and focal emphasis can be optimized and traded off [S3; S4].

Genesis should make the separation explicit and lexicographic:

1. **Validity:** within room, supported, no footprint overlap, no forbidden reservations, required access connected.
2. **Recipe satisfaction:** all required major assemblies and stateful affordances represented.
3. **Gameplay:** circulation, tactical lanes, cover policy, hazard approach, visibility where required.
4. **Semantic relations:** near, opposite, facing, flanking, attached, contained, accessible-side.
5. **Composition:** focal strength, alignment, rhythm, balance, symmetry or intentional asymmetry.
6. **Variety and story:** avoid repeated arrangements; honor condition, clutter, and narrative detail.

A soft score must never make an inaccessible layout beat an accessible one. This is why a single weighted sum is often less transparent than a tiered score or hard-filter-then-score pipeline.

## 2.5 Portals and compatible boundary segments

Nepozitek and Gemrot take a room connectivity graph and polygonal room templates, then search for layouts in which connected rooms share compatible boundary segments. They precompute configuration spaces for valid relative positions, decompose the graph into chains, incrementally place rooms, and backtrack when a chain cannot be added [S6, Sections 2-4]. Edgar's current documentation exposes the production-facing version of these ideas through room templates, allowed door lines, door sockets, transformations, and door modes.

Genesis should borrow the **contract**, not necessarily replace its entire spatializer with Edgar:

- each footprint exposes oriented boundary runs;
- a run contains potential portal subslots;
- a portal requirement specifies kind, width, elevation compatibility, destination, and optional visibility behavior;
- a graph edge is satisfied only by a compatible portal pair and connecting region;
- room rotation, mirror, placement, or optional features can change which slots remain available.

This corrects the conceptual weakness of choosing the nearest boundary cell. "Nearest" can be one score term. It cannot be the definition of a valid portal.

## 2.6 Architecture and furnishing as separate generators

Green et al. explicitly divide level generation into an architectural creator followed by a furnisher and evaluate combinations of independently implemented generators [S7, Sections 2-5]. Their game-specific furnisher must respect entrances, exits, pathways, traps, and treasures. They use expressivity measures and automated personas to understand what different generator combinations produce.

This supports Genesis's desired boundary:

- the **architectural roller/compiler** establishes graph-valid room structure, portals, terrain, zones, and reservations;
- the **dressing roller/compiler** fills that structure with purpose-aware assemblies and detail;
- automated seed corpora measure not only crashes but distribution, feasibility, variety, and playability.

Separation does not mean ignorance. The architecture compiler must expose a program that the dresser can satisfy, and the dresser must consume reservations and sockets from architecture.

## 2.7 Gameplay constraints beyond furniture

Horswill and Foged use constraint propagation to populate indoor levels while maintaining playability requirements along likely or standard paths. Their representation uses graph nodes, portals, numeric attributes, and constraints for items such as enemy pressure, health, keys, and locks [S5, Sections 2-5].

Genesis can use the same layer above room legality:

- a key must precede its required lock on all intended progression paths;
- healing, rest, or escape resources can be bounded by path pressure;
- treasure can be placed behind a licensed risk or secret rather than randomly within a room;
- tactical cover and hazard density can follow depth and encounter role;
- strategic DM cards can mutate portal state, hazards, reinforcements, or visibility without inventing geometry.

This is not a dressing concern alone. It is a dungeon-wide constraint pass that consumes the room compiler's ports, zones, and affordances.

## 2.8 Optional future solvers

Whitehead demonstrates that integer linear constraints expressed to an SMT solver can handle room bounds, non-overlap, separation, designer constraints, and control lines at useful speeds for tens of rooms [S9, Sections 3-5]. Henderson et al. learn conditional distributions over furniture classes, counts, positions, orientations, motifs, and wall abutments, then use rejection sampling to satisfy size, door, window, and traversability constraints [S8, Sections 3-5].

Both are valuable, but neither should be Genesis's first move.

SMT becomes attractive if structural layout, room transforms, and portal compatibility produce coupled cases that bounded constructive search handles poorly. Learned priors become attractive after Genesis has a large corpus of accepted layouts or a suitable licensed dataset and wants more human-like variation. Both require the same thing Genesis lacks today: a clear structured representation and explicit validity tests. Building the contract first does not foreclose them; it makes them possible.

---

## 3. Genesis as it exists: strengths and failure seams

The detailed file audit is in the companion crosswalk. This section summarizes the architectural diagnosis.

## 3.1 Strengths to preserve

### The walk and graph are already canonical

Genesis's dungeon walk stores segments as nodes and exits as edges, with persistent identity, depth, finale status, light, room fields, door rolls, feature rolls, dressing, and provenance. The generator does not need to invent connectivity after room placement. This is a major advantage over many research systems.

### The spatializer is deterministic and honest

`place-spatialize.js` is a pure data stage. It uses seeded generation, separates rooms, carves only authored graph exits, rasterizes cells, verifies reachability, retries, and fails honestly. It supports dimensions, multiple room shapes, and terrain tiers. These laws should be retained.

### The renderer has surpassed the logical plan

Genesis's compiled polygon shell, joined wall runs, volumetric geometry, cutaways, mounts, tiers, lights, materials, and one-room render architecture are substantial. The project does not need an authored prefab system to look good. It needs the logical plan to license the renderer more precisely.

### Provenance and verification are cultural assets

Roll references, deterministic re-derivation, mutation-style checks, BFS gates, visual capture gates, and a broad verification suite are unusually strong foundations for a procedural compiler. The proposed system should emit diagnostics in the same spirit rather than hiding behavior inside opaque optimization.

## 3.2 Prose is being used as an accidental API

The d200 area table is rich, but its columns combine shape, dimension, side features, and descriptive content. The current engine parses dimensions and keyword-classifies shapes and terrain. At the audited snapshot:

- 143 of 200 rows fell through to rectangle;
- only 67 rows matched current terrain keywords;
- 55 of 199 parseable dimension rows were raised to a 20-foot minimum.

This does not mean the current outputs are always wrong. It means the parser necessarily collapses authored distinctions. It also means every new phrasing can silently change or fail to change geometry.

The correct migration is additive. Preserve the hand-authored row and attach structured fields:

```text
archId
footprintFamily
dimensions
portalPolicy
structuralStamps[]
zoneProgram[]
capacityPolicy
renderText
```

The compiled data should carry both the machine program and the authored prose. The machine should never need to parse its own display string.

## 3.3 Door placement is topologically correct but architecturally under-specified

For non-rectangular rooms, the current algorithm enumerates boundary floor cells and selects the cell nearest the connected room's center, with a stable tie-break. Corridors then route to those anchors. This solves a narrow problem: choose a deterministic point that faces the neighbor.

It does not solve:

- whether the aperture fits on an unbroken wall run;
- whether it is too close to a corner;
- whether the local floor and elevation are compatible;
- whether a column, alcove, pit, stair, or other structural stamp occupies the span;
- whether paired or axial doors should be symmetric;
- whether threshold, hinge, door leaf, and approach remain usable;
- whether the neighboring room offers a compatible portal slot;
- whether the result creates a good door-to-door path through the room.

The documentation already contains a connection-point contract with typed slots. The implementation never made that contract the logical source of truth. This is a classic design-to-code gap, not a lack of design insight.

## 3.4 Dressing is several independent placement systems

The generic dressing pass uses realm rosters, density, candidate cell lists, and a one-cell occupied set. It protects a small center region and immediate door area. Projected canonical cards are then appended. Subcell distribution exists but is disabled in the audited production path and lacks global aisles or door swing. Stateful interactables are placed independently. Room grammar refines a subset of those interactables rather than the entire room.

These systems cannot collectively guarantee that:

- the room's purpose reads immediately;
- a required object actually fits;
- multi-cell furniture has adequate clearance;
- a table's chairs remain usable;
- every door connects to every other door;
- the focal object is approachable;
- rows preserve an aisle;
- wall objects occupy real unbroken wall support;
- clutter fills containers and surfaces rather than floating as unrelated floor objects.

The solution is not more exclusion checks inside each module. It is a single occupancy and relationship plan.

## 3.5 The room grammar contains the right vocabulary but not the full compiler

`ROOM-GRAMMAR.md` is one of the strongest existing design documents. Its law that rolls own nouns and grammar owns arrangement should remain. ALIGN, RHYTHM, PAIR, ROW, FLANK, FOCAL, and CLEAR are a compact procedural vocabulary. Its first typologies - shop, shrine, library, barracks, crypt, throne, and camp - are exactly the right kind of constrained recipes.

The current implementation realizes only part of this vocabulary for a small interactable set. It does not place the dressing plan, solve doors, instantiate multi-object assemblies, or maintain global clearance. The right response is not to throw away the grammar. It is to compile its primitives into candidate generators, hard constraints, and soft scores.

## 3.6 Renderer sockets should become logical sockets

The wall-mesh compiler can generate mount positions on inner wall faces, and the renderer uses them for practical lights. This proves that useful support geometry can be derived from the actual shell.

The semantic engine should own socket **types and allocation**, while the renderer owns final mesh attachment. A logical wall run might expose `wall-mount`, `door-flank`, and `wall-center` sockets with capacity and exclusions. The mesh compiler refines each accepted logical socket to a precise world transform. Similar contracts should exist for:

- tabletop;
- shelf;
- counter display;
- chair positions;
- bed foot and accessible side;
- container contents;
- focal flank;
- floor edge;
- column bay;
- ceiling or hanging points where supported.

This lets one placed assembly create meaningful opportunities for later detail rather than merely occupying a cell.

---

## 4. The proposed room compiler

## 4.1 The core contract

The compiler should accept:

```text
compileRoom(RoomProgram, GraphContext, Catalogs, seed) -> SpatialPlanV2
```

`RoomProgram` expresses rolled intent. `GraphContext` expresses required connections and neighboring domains. `Catalogs` contain declarative footprints, features, sockets, recipes, and skins. The seed makes candidate enumeration and tie-breaking reproducible.

An illustrative program:

```text
RoomProgram
  identity
    walkId, segmentId, rollRefs
  architecture
    footprintFamily, dimensions, elevationProfile
    structuralStamps[]
    portalRequirements[]
    portalPolicy
    zoneProgram[]
    capacityPolicy
  dressing
    purpose
    requiredAssemblies[]
    optionalAssemblies[]
    detailDirectives[]
    clutterPools[]
    condition
  gameplay
    encounterRole, treasureRole, hazardPolicy, secretPolicy
  presentation
    authoredText, realmSkin, light, atmosphere
```

The output:

```text
SpatialPlanV2
  cells
    floor, void, water, elevation, traversal, combat metadata
  edges[]
    boundary geometry, normal, span, structural exclusions, socket inventory
  portals[]
    kind, width, edge/span, outward normal, destination
    threshold, swing/use envelope, apron, visibility, stateRef
  zones[]
    entry, circulation, focal, service, hazard, tactical, clutter
  reservations[]
    geometry, kind, priority, owner, ruleRef
  placements[]
    nounRef, transform, footprint, clearance, features, sockets
    stateRef, rollRef, recipeRef, ruleRef, candidateRef
  diagnostics
    rejected candidates, relaxations, score breakdown, timings
```

The existing `cells` buffer remains useful and can remain backward-compatible. The change is that a `DOOR` cell becomes derived from a richer portal object instead of being the only truth.

## 4.2 Pass order

The following order makes dependencies explicit:

1. **Normalize the room program.** Validate fields, resolve defaults, and preserve exact roll provenance.
2. **Build the footprint.** Rasterize macro cells and derive elevation and structural boundary geometry.
3. **Extract boundary edges.** Merge compatible cell faces into oriented runs or polygon spans.
4. **Enumerate portal slots.** Apply width, corner margin, elevation, wall continuity, structural exclusions, and portal kind.
5. **Solve graph connections.** Pair compatible slots with neighboring regions or corridors; commit apertures and fallback reasons.
6. **Reserve use space.** Thresholds, swing/use envelopes, aprons, widened door-to-door paths, required approaches.
7. **Stamp structural features and zones.** Dais, pit, alcove, column bays, ledges, hazards, service zones, tactical bands.
8. **Compile the dressing recipe.** Turn purpose and detail rolls into required and optional assembly graphs.
9. **Place major assemblies.** Multi-cell and focal elements first, with configuration-space legality and relationship constraints.
10. **Place minor assemblies and stateful affordances.** Shelves, racks, containers, interactables, tactical objects.
11. **Fill typed sockets.** Wall mounts, chairs, tabletop objects, shelf contents, clutter, decals, and cosmetic detail.
12. **Generate and score alternatives.** Choose among valid candidates deterministically.
13. **Emit diagnostics and compatibility projections.** Raster door cells, renderer transforms, score explanation, and failures.

This is a builder, but it is a builder over a tile-and-slot legality model.

## 4.3 Door solver in detail

A robust door pass should work at the edge level.

### Candidate generation

For each required exit:

1. derive the room's boundary runs from its footprint;
2. subdivide runs into potential apertures at the required width and step;
3. reject spans that violate a minimum corner margin;
4. reject spans blocked by elevation discontinuity, structural stamp, column bay, reserved secret, or unsupported portal kind;
5. evaluate corridor or neighbor compatibility, including outward normal and destination direction;
6. calculate threshold and use-envelope geometry and reject impossible interior approaches.

### Scoring

Among valid candidates, score:

- centered on wall face;
- symmetry with another required portal;
- alignment with room axis or recipe focal;
- short and simple corridor connection;
- clear door-to-door circulation;
- useful sightline or intentional concealment;
- distance from corners and structural clutter;
- compatibility with room purpose;
- variation from recent rooms where all else is equal.

### Backtracking and relaxation

If no candidate survives, use a named recovery ladder:

1. alternate portal slot;
2. relax optional structural feature;
3. rotate or mirror the footprint/template;
4. move the room within its legal macro layout;
5. choose another permitted footprint variant;
6. regenerate the structural candidate;
7. fail honestly with the eliminated-rule histogram.

Do not silently put a door in a corner because it is nearest. If a corner aperture is the only feasible result, provenance should say which constraints forced it.

### Door roll responsibility

Genesis's door type and state rolls remain useful. They apply after the structural aperture is solved:

- type selects the compatible frame/leaf/arch/portcullis family and may add width or height requirements known during enumeration;
- state initializes open, closed, locked, broken, barred, concealed, or trapped behavior;
- narrative text and realm skin decorate the same explicit portal;
- a strategic DM card can change state, reveal a secret portal, seal it, or damage it through a typed mutation.

The roll should not pick an arbitrary coordinate.

## 4.4 Reservations and circulation

Reservations should be first-class, typed, owned geometry. Examples:

```text
threshold(portal-3)
door-use(portal-3)
circulation(portal-1 -> portal-3, width=5ft)
focal-approach(altar-1, width=5ft)
center-aisle(pew-assembly-2, width=5ft)
interaction-front(chest-4)
combat-spawn(entry-role)
camera-critical(optional, low priority)
```

The compiler should build a circulation graph from portals and required affordances. A practical first version can compute shortest paths on macro cells, widen the paths by a human-radius mask, then reserve them. If an object candidate blocks the only path, it is invalid. If several equivalent paths exist, a soft penalty can discourage excessive obstruction without forbidding useful tactical cover.

The distinction between **movement path** and **combat interest** matters. A completely empty room is navigable but dull. The compiler can reserve a narrow guaranteed circulation spine while permitting cover, hazard, or furniture in secondary lanes according to the room's tactical policy.

## 4.5 Footprints, features, and sockets

Every placeable catalog entry should be more than an asset slug:

```text
PlaceableDefinition
  id, semanticClass, tags
  footprintVariants[]
  clearanceFeatures[]
  requiredSupport
  accessFaces[]
  blocksMovement, blocksSight, providesCover
  features[]
  sockets[]
  allowedTransforms
  renderBindings
```

A bed can occupy two macro cells or a macro cell plus subcell extent, require one accessible side, expose a `footlocker` socket, and provide no cover. A table can expose chair sockets, tabletop fill sockets, and a conversation zone. A bookshelf requires wall support, blocks sight, and exposes shelf-content sockets. An altar exposes a focal front and two flank sockets.

This is the research papers' semantic-feature idea adapted to Genesis's game data [S1; S2]. It also gives the renderer a deterministic binding point for art.

## 4.6 Assemblies and room recipes

A room purpose should compile to a graph of relationships rather than a flat list.

### Barracks

```text
required: cot-row >= 1
per cot: optional footlocker at foot socket
optional: weapon-rack aligned to wall
hard: center aisle, access side for each cot, all portals connected
soft: uniform rhythm, paired rows, officer cot near focal or far wall
```

### Shrine

```text
required: altar at far-wall center or dais focal
required: entry-to-altar approach
optional: pew rows facing altar
optional: brazier pair flanking altar
optional: wall hanging behind altar
hard: altar interaction front and aisle clear
soft: axial symmetry, focal emphasis, rhythmic rows
```

### Shop

```text
required: counter facing entry, with service side and customer side
required: path entry -> counter
optional: side-wall shelf rows
optional: storage cluster behind counter
optional: focal curio visible from entry
hard: public/private boundary, counter access, all exits connected
soft: display visibility, balanced shelf density, realm-true stock
```

These are not authored maps. They are reusable semantic programs that roll counts, variants, condition, and skin within a legal room.

## 4.7 Candidate generation and scoring

A first implementation should be constructive and bounded:

1. order requirements by constraint: portals and focal majors first, flexible clutter last;
2. generate legal candidate transforms from supports, zones, and sockets;
3. filter candidates through footprint, clearance, reservation, and access masks;
4. rank candidates by local semantic and composition score;
5. recurse with bounded backtracking;
6. retain several complete candidates;
7. compute a room-wide score and choose the deterministic winner.

Generate perhaps 8 to 16 complete candidates for ordinary rooms, with a strict work budget rather than an unbounded iteration count. The exact number should be measured. The key is that the compiler can show the candidate gallery and explain why candidate 7 won.

Simulated annealing or MCMC, as used in several furniture systems [S3; S4], can explore dense continuous arrangements but is harder to debug and to guarantee within a small deterministic budget. Genesis's discrete recipes and modest room sizes favor constructive search first.

## 4.8 Degradation rather than silent omission

Procedural systems fail at the edges. A small room may roll a recipe that wants too much. The response should be authored and visible:

```text
shrine.full
  -> shrine.no-pews
  -> roadside-shrine.altar-and-offering
  -> sacred-mark.focal-only
  -> infeasible (if even focal access cannot fit)
```

Each recipe can declare optionality, minimum viable form, and fallback. Diagnostics should record the transition and its cause. This is more honest than silently dropping objects until the room becomes generic.

---

## 5. Reshaping the rollers

The user hypothesis is correct: architecture and dressing rollers can solve many more problems, allowing the DM to focus on narrative and strategy. The important boundary is that rollers select **intent and constraints**, not coordinates.

## 5.1 Architectural roll

The current area roll can be reorganized into composable fields while preserving the d200's authored voice:

| Field | Example | Compiler use |
| --- | --- | --- |
| `archId` | `octagonal-shrine-chamber` | stable recipe/provenance key |
| `footprint` | `octagon` | raster and edge extraction |
| `dimensions` | `40ft x 40ft` | macro bounds and capacity |
| `portalPolicy` | `axial-preferred` | portal candidate scoring |
| `structuralStamps` | `central-dais(+1), opposed-alcoves(2)` | geometry and support sockets |
| `zones` | `entry, processional, focal` | dressing legality |
| `capacityPolicy` | `ceremonial-low-density` | clutter and assembly count |
| `renderText` | authored prose | card and DM description |

Rows can reference shared recipes with parameters. Two hundred rows do not require two hundred functions.

## 5.2 Dressing rolls at two scales

The existing set-dressing table is strongest as a micro-detail and condition source. Add or derive a separate **Room Function/Recipe** roll.

### Room Function/Recipe

Chooses:

- functional type;
- required assembly graph;
- optional assemblies;
- circulation and access policy;
- tactical profile;
- clutter budget;
- preferred supports and zones;
- fallback chain.

### Dressing Detail

Chooses:

- a specific minor object or oddity;
- condition or damage;
- contents of a fillable socket;
- local evidence or narrative residue;
- texture/decal instruction;
- a realm-specific substitution.

This solves a common procedural-generation failure: a list of individually evocative objects does not automatically produce a legible room.

## 5.3 Elevation roll

The elevation profile table is already relatively structured. It should become a direct `RoomProgram` field that stamps tier geometry, edge compatibility, access requirements, and sockets. Stairs and ramps are not merely renderer decoration; they are traversal connections and can constrain portals and assemblies.

## 5.4 Skin, narrative, treasure, and other rollers

The other roller families can remain substantially as they are:

- **skin** selects realm assets, materials, forms, palettes, and substitutions after semantic placement;
- **narrative** supplies history, sensory facts, factions, motives, and discoverable meaning;
- **treasure** selects rewards and risk relationships, then requests a container, display, cache, corpse, or hidden socket from the compiler;
- **encounter and tactical roles** request spawn zones, cover policy, hazard regions, and actionable affordances rather than moving furniture directly.

The room compiler becomes the spatial service those rollers use.

---

## 6. The DM's new boundary

The engine should give the DM a fully licensed scene:

- what architecture exists;
- which portals exist and their state;
- which objects and features exist;
- what is interactable, visible, hidden, trapped, destructible, or usable as cover;
- what treasure, evidence, and narrative facts are attached;
- which tactical zones and routes exist.

The DM then does two jobs.

### Narrative

The DM describes, interprets, voices, connects, and remembers the structured facts. It can emphasize a detail based on character history or current pressure, but it does not invent a missing wall, move a door, or add a convenient table because the generator failed.

### Strategic cards

The DM can spend licensed state-changing actions:

- lock, bar, seal, open, or break a portal;
- reveal a secret connection that was precompiled but concealed;
- activate a hazard;
- call reinforcements through a valid route;
- extinguish lights or change visibility;
- collapse a declared fragile support;
- animate a placed statue or corpse;
- expose treasure in a filled socket;
- change faction control or environmental condition.

These actions are strategic because they transform a real plan. They are not decorative repair work.

---

## 7. Development tools are part of the design

The research repeatedly shows the importance of interactive inspection. Tutenel's system visualizes legal regions and examples [S1]. Merrell's interface exposes constraints and alternative layouts [S4]. Genesis's own history shows that capture and diagnostic gates catch defects that unit assertions miss.

The first compiler milestone should therefore include tools, not postpone them.

## 7.1 Room program inspector

Show the normalized roll output, recipe expansion, mandatory and optional elements, counts, fallbacks, and provenance.

## 7.2 Boundary and portal overlay

Render:

- boundary runs and normals;
- potential portal slots;
- rejected slots colored by rule;
- committed apertures;
- threshold, use envelope, and apron;
- compatible slot on the neighboring room or corridor.

Door problems should become obvious before art loads.

## 7.3 Reservation overlay

Toggle door-to-door paths, widened circulation, focal approaches, interaction fronts, aisles, combat spawn zones, and tactical lanes.

## 7.4 Footprint, feature, and socket overlay

Show object footprints, clearance polygons, support features, occupied sockets, unused sockets, and ownership. Selecting a table should reveal its chair and tabletop sockets.

## 7.5 Rule-elimination heatmap

For any object, show the initial candidate region and the region after each rule. A developer should be able to answer "why could this altar not fit?" without reading random seeds in a debugger.

## 7.6 Candidate gallery and score breakdown

Display several valid complete arrangements with identical room program and different candidate branches. Show validity, recipe satisfaction, circulation, gameplay, semantic, composition, and variety terms. Let the team inspect whether the score matches taste.

## 7.7 Seed corpus runner

Run representative table rows, dimensions, exit counts, room roles, and realm skins across a stable seed set. Report:

- generation and fallback rates;
- portal failures and forced-corner doors;
- required-recipe satisfaction;
- circulation violations;
- footprint overlaps;
- score distributions;
- repeated layout signatures;
- performance percentiles;
- table rows that are consistently infeasible or never exercised.

This is the compiler equivalent of Genesis's existing full verification and visual lens culture.

---

## 8. Verification and performance gates

The compiler should not be considered built when it merely renders a pleasant room. It needs contract gates.

## 8.1 Structural gates

- Every required graph edge resolves to compatible explicit portal geometry on both sides or generation fails honestly.
- Every portal lies on a valid continuous boundary span and respects its width and corner margin.
- No corner portal is selected when a legal, equally compatible preferred slot exists, unless the recipe explicitly prefers the corner.
- Compatibility rasterization produces the expected `DOOR` cells for legacy consumers.
- All macro floor regions intended to be traversable remain reachable.

## 8.2 Dressing gates

- No footprints overlap.
- No placement intersects a hard reservation or lacks its required support.
- Every required assembly is complete or a declared degradation is recorded.
- Every required access face connects to the circulation graph.
- All typed child objects occupy valid sockets.
- Counts and optionality match the compiled recipe.

## 8.3 Determinism and provenance gates

- Same program, graph context, catalogs, and seed produce a byte-stable plan and score breakdown.
- Every portal, reservation, zone, and placement points to the roll, recipe, and rule that licensed it.
- A failure includes the exhausted budget, recovery steps attempted, and the rules eliminating the final candidates.

## 8.4 Expressivity gates

- A seed corpus exercises all footprint families, portal policies, structural stamps, major recipe families, and fallback levels.
- Layout signatures do not collapse to one arrangement per recipe.
- Realm skins change presentation without changing logical validity.
- Rich d200 rows remain distinguishable in compiled structure rather than all falling through to rectangles and generic clutter.

## 8.5 Suggested performance budgets

Budgets should be measured against the actual room-compilation moment. A reasonable initial target is:

- portal enumeration and commitment: p95 below 10 ms per active room;
- complete room compile at walk preparation: p95 below 50 ms per ordinary room;
- bounded maximum with honest degradation or retry, not an unbounded search;
- no frame-time search in the renderer.

These are planning targets, not research-derived constants. The research shows a broad feasible range, from tens of milliseconds for learned unconstrained layouts [S8] and small SMT layouts [S9] to roughly 152 ms for an older semantic interior prototype [S1]. Genesis should instrument before locking the final budget.

---

## 9. Migration plan

The migration should be additive so the current game remains operable while master settles.

## Phase 0: contracts and evidence

- Define `RoomProgram` and `SpatialPlanV2` as specs.
- Choose a golden corpus of real walk segments, difficult shapes, exit counts, elevations, and dressing rolls.
- Build the program, portal, reservation, and footprint overlays against captured data.
- Record present failure cases, including corner doors and dressing obstruction, before changing behavior.

## Phase 1: edges and portals beside current cells

- Derive oriented boundary runs from current room polygons.
- Enumerate potential portal slots.
- Commit explicit portal objects for existing doors.
- Continue emitting current `DOOR` cells and renderer aperture data from the new portal objects.
- Verify byte or behavior compatibility where intended.

This phase fixes the representation before changing all tables.

## Phase 2: portal solver and reservations

- Replace nearest-boundary-cell choice with hard slot filtering and deterministic score selection.
- Add threshold, use envelope, apron, and widened door-to-door reservations.
- Add forced-corner diagnostics and the recovery ladder.
- Make renderer doors consume explicit portal geometry.

Door placement should stop being a recurring struggle at the end of this phase.

## Phase 3: structured architecture programs

- Add structured fields or stable recipe IDs to architectural source rows.
- Compile those fields into `RoomProgram.architecture`.
- Keep current prose as authored display text.
- Gradually retire shape and terrain keyword parsing behind compatibility checks.
- Make elevation and structural stamps produce geometry, zones, supports, and exclusions.

## Phase 4: multi-cell dressing and assemblies

- Define the placeable catalog: footprint, clearance, supports, features, sockets, access, cover, and render binding.
- Split room function recipes from dressing detail rolls.
- Compile ROOM-GRAMMAR primitives into assembly candidate generators and constraints.
- Place major assemblies, interactables, and projected canonical requirements in one solver.
- Fill wall, table, shelf, chair, and container sockets afterward.

## Phase 5: candidate scoring and diagnostic tools

- Generate several complete valid candidates.
- Add score breakdown, gallery, and deterministic selection.
- Add seed-corpus distribution and feasibility reports.
- Tune rules using real Genesis rooms, not isolated rectangles.

## Phase 6: renderer and subcell consolidation

- Turn on subcell distribution only after it consumes the shared plan.
- Let renderer geometry refine logical sockets to exact transforms.
- Remove late semantic placement decisions from renderer code.
- Keep cosmetic-only micro-scatter renderer-side when it cannot affect mechanics or named content.

## Phase 7: optional advanced solvers

- Evaluate SMT for coupled room placement and portal constraints if profiling shows constructive backtracking is inadequate.
- Evaluate learned priors only after a sufficient accepted-layout corpus exists.
- Retain the same `RoomProgram` and `SpatialPlanV2` boundaries so solver experiments are replaceable.

---

## 10. Risks and design cautions

## 10.1 Over-structuring the handmade tables

The goal is not to replace authored rows with sterile enums. Store the machine program beside the voice. Shared recipes should reduce parser ambiguity while the original text remains visible and narratively useful.

## 10.2 Turning every detail into a hard rule

Hard constraints should protect physical and gameplay truth. Composition often needs weights and variation. If symmetry is always hard, every shrine will look the same. If circulation is merely soft, some shrines will be unusable. The tier matters.

## 10.3 Solving at one resolution

A five-foot-only plan will make furniture coarse. A one-foot global grid will inflate search and combat data. Use macro cells, edge subslots, and local subcell transforms.

## 10.4 Letting the renderer become the solver again

Renderer refinements may adjust exact mount coordinates within a licensed socket. They must not choose semantic nouns, move doors, or violate reservations because a mesh looks better.

## 10.5 Hidden fallback behavior

Procedural quality degrades when failures silently drop requirements. Every fallback should be declared, deterministic, and measurable.

## 10.6 Premature general optimization

Do not begin by importing a complex optimizer. Most early failures will be contract and catalog failures, not search failures. A transparent bounded solver will teach the team more quickly.

---

## 11. Direct answers

### Which method from the first article are we using?

Architecture uses **pieces or tiles**. Dressing uses an incomplete tile-and-builder hybrid.

### Why would we not use the tile method?

There is no strong reason to abandon it. Genesis should use it more completely. Tiles are the logical substrate; polygon meshes, sprites, models, materials, and subcell transforms are the presentation. The only reason not to force a thing onto tiles is when it is purely cosmetic and has no mechanical or semantic consequence.

### Why are doors still hard?

Because the engine models a door chiefly as a chosen boundary cell and later render aperture, not as a compatible, scored, reserved portal on an oriented boundary edge. That representation cannot express the real architectural constraints.

### Can the architectural and dressing rollers take more responsibility?

Yes. They should emit structured room programs and recipes. They should decide purpose, requirements, relationships, policies, and fallback options. They should not calculate coordinates.

### What should the DM still do?

Narration, interpretation, NPC agency, pressure, and strategic state changes. The DM should not decorate rooms or repair structure.

### Should Genesis adopt Edgar wholesale?

Not necessarily. Borrow its room-template, potential-door-slot, socket, transformation, and compatibility concepts. Genesis already has a canonical graph, a spatializer, polygon cells, and a renderer tailored to its persistent walk model. A wholesale replacement would discard useful advantages.

### Should the first implementation use SMT, simulated annealing, or machine learning?

No. Start with bounded constructive search, configuration-space masks, backtracking, and candidate scoring. Keep SMT and learned priors as measured escalation paths.

---

## 12. Final recommendation

The proposal is not "build a better dressing randomizer." It is to establish a room compiler as a first-class engine boundary.

The walk rollers author a `RoomProgram`. The compiler turns that program into a graph-valid, circulation-valid, purpose-legible `SpatialPlanV2`. The renderer realizes the plan. The DM plays the scene.

That boundary resolves the present door issue, lets room grammar grow from a partial interactable refinement into a real arrangement language, makes the d200 architecture table more mechanically expressive without flattening its voice, allows dressing to become assemblies rather than scatter, and gives the dev tools something honest to inspect.

Most importantly, it aligns with Genesis's existing philosophy: the rolls are canonical, procedural systems are deterministic and provenance-preserving, visual output is a projection rather than a replacement, and the AI DM interprets a world the engine can actually name.

---

## 13. FFT battle-map and GaneshaDx addendum (2026-07-22)

This addendum examines Adam's 22-image `Reference/FFT Battle Maps/` collection and
[Garmichael/GaneshaDx](https://github.com/Garmichael/GaneshaDx), a GPL-3.0 editor for the original
PlayStation Final Fantasy Tactics maps. The images are a user-curated composition reference, not licensed production
assets. The editor is evidence about useful data boundaries and tooling; Genesis should not copy its GPL code,
import FFT assets, or let a reverse-engineered legacy format become an engine dependency.

This is a research recommendation, not an accepted visual ruling or implementation authorization.

### 13.1 What the reference images consistently demonstrate

The maps are not interesting because they are small isometric dioramas. Their durable value is how strongly a
finite grid is composed before it is dressed:

- **Elevation appears as a few coherent masses, not per-cell height noise.** A raised fort, shelf, roof, ridge,
  terrace, or bridge usually spans enough cells to become a tactical region with a readable silhouette.
- **Every important height change creates a route decision.** Stairs, ramps, gates, bridges, ledges, falls, and
  narrow approaches connect or separate plateaus. Height is valuable because access to it is shaped.
- **One dominant landmark organizes the board.** The waterfall, gatehouse, church, ruined wall, giant tree, bridge,
  or rock formation establishes orientation while also affecting routes, cover, sightlines, or encounter framing.
- **Negative space defines the playable footprint.** Water, void, cliff, walls, and dense vegetation cut a clear
  boundary and create bays, pockets, and flanks instead of presenting a filled rectangle.
- **Maps usually have a primary movement spine plus one secondary opportunity.** A bridge or street carries the
  obvious conflict while an elevated shelf, side stair, waterline, alley, or broken edge creates a flank, refuge,
  shortcut, or delayed approach.
- **Architecture performs most of the tactical work.** Props are relatively sparse. Buildings, terraces, walls,
  waterways, and large natural forms create cover and obstruction, so the battlefield does not depend on noisy
  scatter dressing.
- **The skyline is intentionally asymmetric but visually balanced.** A tall mass often sits off-center and is
  counterweighted by a lower route, open arena, water body, or secondary cluster. This makes the board memorable
  from a diagonal camera without turning every cell into a focal point.
- **The encounter is composed with the terrain.** Deployment pockets, likely first contact, high-ground advantage,
  retreat routes, and contested connectors are legible as parts of the same layout rather than units scattered
  after the map is finished.

The most useful Genesis translation is therefore not “generate FFT maps.” It is **compile each rolled room or
battlefield into a small number of readable tactical regions and connectors, then validate its composition from the
actual gameplay camera**.

### 13.2 What GaneshaDx makes explicit

GaneshaDx separates tactical terrain from decorative mesh data. Its
[`Terrain`](https://github.com/Garmichael/GaneshaDx/blob/main/Resources/ContentDataTypes/Terrains/Terrain.cs)
stores X/Z dimensions and two terrain layers. Each
[`TerrainTile`](https://github.com/Garmichael/GaneshaDx/blob/main/Resources/ContentDataTypes/Terrains/TerrainTile.cs)
stores a surface kind, height, depth/thickness, shading, slope kind and slope height, pass-through-only,
impassable, and unselectable flags. Flat, directional incline, convex-corner, and concave-corner slopes are named
data rather than inferred from the final picture.

Two editor tools expose a valuable round-trip discipline:

- [`Greyboxer`](https://github.com/Garmichael/GaneshaDx/blob/main/Common/Greyboxer.cs) can rebuild surface and wall
  polygons from tactical tiles; and
- [`TerrainGenerator`](https://github.com/Garmichael/GaneshaDx/blob/main/Common/TerrainGenerator.cs) can inspect
  polygons and derive upper/lower tactical tiles, height, slope, and passability.

Genesis should keep mechanics flowing only from rolls -> compiler -> canonical grid -> renderer. It should not
adopt visual mesh as runtime authority. The reverse direction is nevertheless useful as a **QA diagnostic**: inspect
the emitted mesh and prove that it reconstructs the same traversable regions, elevation bands, connectors, voids,
and blockers the canonical plan licensed.

GaneshaDx also separates polygon render properties from terrain. Its
[`PolygonRenderingProperties`](https://github.com/Garmichael/GaneshaDx/blob/main/Resources/ContentDataTypes/Polygons/PolygonRenderingProperties.cs)
can hide faces for particular compass views, and its
[`StageCamera`](https://github.com/Garmichael/GaneshaDx/blob/main/Environment/StageCamera.cs) snaps among four
diagonal views and two elevations. Genesis already has a stronger dynamic ShotPlan/occlusion/cutaway system and
should not replace it with authored per-direction visibility flags. The useful lesson is to test every generated
board from four canonical yaws and reject or repair layouts whose landmarks, routes, actors, or critical elevation
changes disappear from too many views.

### 13.3 What Genesis already owns

This pass does **not** justify rebuilding the spatializer or theater renderer. Genesis already has:

- canonical five-foot cells and typed floor/door/water/wall/void legality;
- rolled room shapes and coherent elevation profiles;
- signed tier buffers, raised/sunken patches, terraces, split levels, galleries, chasms, stairs/ramps, and bridge
  markers;
- shape-generic tier contours, floors, risers, walls, apertures, and cell-to-triangle diagnostics;
- deterministic provenance and degradation rather than silent omission;
- an orthographic/dimetric camera with 90-degree rotation, fit logic, ShotPlan composition, and dynamic occlusion;
  and
- the accepted BattleMat rule that exact mechanics remain canonical while presentation consumes them.

The reference corpus strengthens the existing multi-pass compiler direction. It does not replace it.

### 13.4 Candidate engine additions

The following candidates are worth carrying into the design waves and later specs.

#### A. Tactical-region composition pass

After structural legality but before fine dressing, derive a small graph of coherent tactical regions:

- plateaus or elevation masses;
- open arena/pocket;
- primary route spine;
- secondary flank, refuge, or shortcut where the roll and footprint allow it;
- chokepoint/threshold connectors;
- negative-space boundaries; and
- one landmark anchor licensed by the room/place program.

This pass scores composition. It never invents a landmark, route, or height the rolls did not license. A tiny simple
room may correctly produce one region and no flank; the goal is readable structure, not mandatory FFT complexity.

#### B. Explicit vertical-connector edges

An elevation tier alone does not say how actors move between tiers. `SpatialPlanV2` should eventually carry typed
connector edges such as stair, ramp, climb, ladder, jump/drop, bridge, lift, or blocked riser, including direction,
height delta, width/capacity, required capability, and traversal cost. The renderer projects the connector; combat
and pathfinding consume the same edge. A decorative staircase cannot make an unreachable tier legal, and a legal
ramp cannot disappear because dressing selected a prettier prop.

#### C. Reserved stacked-surface seam, not a pre-alpha requirement

GaneshaDx's two tile levels demonstrate a compact way to represent a bridge above water, a roof above an interior,
or an overpass above a lane. Genesis's current 2D cell plus tier model and `bridge:true` corridor marker should not
be expanded into full stacked traversal before the BattleMat-first proof. The future plan should nevertheless avoid
assuming one traversable surface per X/Z forever. A later promotion can add stable surface ids, vertical layer,
support/overhead clearance, and connectors when an accepted fixture actually requires simultaneous upper and lower
routes.

#### D. Four-view composition and occlusion gate

Every retained visual fixture should capture the four player camera rotations at gameplay scale and measure:

- critical actor and objective visibility;
- readable primary route and at least one legal approach;
- landmark recognition;
- distinguishable elevation bands and connectors;
- excessive foreground wall/prop coverage;
- camera-dependent false adjacency; and
- whether dynamic cutaway/ghosting repairs the problem without erasing architectural mass.

The goal is not equal beauty from every angle. It is no tactically dishonest or routinely unreadable angle.

#### E. Greybox-first roll-to-board acceptance

Before material polish, a generated map should pass as a plain clay/grid projection of one real rolled program.
The debug view should show tactical regions, tier values, connectors, blockers, reservations, deployment zones,
landmark source/provenance, and rejected/relaxed constraints. The dressed capture then proves that art preserves the
same composition. This directly supports the accepted one-small-clay-room -> multi-room -> relational staging plan.

### 13.5 Suggested composition diagnostics

Do not hard-code an “FFT score.” Record transparent metrics that support human and corpus review:

- number and area share of coherent elevation regions;
- maximum adjacent height delta and whether it has a legal connector;
- start/objective route count by supported mobility class;
- primary-spine length, chokepoint count, and optional flank availability;
- unreachable or tactically irrelevant islands;
- cover/obstruction density by region rather than whole-map average;
- landmark visibility from canonical yaws;
- deployment-zone exposure and immediate high-ground asymmetry;
- negative-space perimeter and narrow-neck distribution; and
- four-view actor/route/connector occlusion failures.

These are diagnostics and score terms, not universal hard minima. The room's purpose and rolls decide whether a
flat arena, brutal single chokepoint, inaccessible balcony, or high-ground ambush is correct. The compiler's job is
to make that intentional, legible, mechanically truthful, and reproducible.

### 13.6 Direction promotion and UV correction (2026-07-22)

Adam promoted the composition findings above to a **high-priority shared BattleMap/TownTray direction**. The
binding direction and provisional implementation architecture now live in
`docs/BATTLEMAP-TOWNTRAY-COMPOSITION.md`. The five candidates in 13.4 are no longer disposable research ideas:

- tactical-region composition and typed vertical connectors enter the high-priority feature path;
- four-view and greybox-first proof enter the retained acceptance ladder;
- the stacked-surface seam remains reserved rather than becoming a pre-alpha requirement; and
- town venues consume the same composition product as battlefields instead of developing a second generator.

The follow-up code/doc audit also corrected an assumption about UV tooling. Genesis already constructs production
UVs for procedural architecture: floors and horizontal faces use world-aligned projection, while walls and risers
use continuous perimeter distance and height. General automatic unwrap is **not** installed or proven in
production. The xatlas adapter imported in the scratch probe, but the required WASM/worker unwrap never ran; the
later watlas carrier wave did not fire. This strengthens rather than weakens the proposed engine boundary:
world/local planar or triplanar projection remains the right path for disposable generated architecture, while
offline unwrap is promoted only for reusable complex assets and paint-over bakes that actually require an atlas.

### 13.7 Trim-sheet implementation audit (2026-07-22)

Adam requested that Genesis determine how to create and implement trim sheets. The resulting local audit found a
valuable near-join rather than a blank-slate system:

- `src/ui/theater-interior.js` already registers one generated left-right tileable trim strip for each of the three
  flagship realms and carries its file/wrap data into the tile kit;
- the folded strips are 256x64 and retain source prompt, generation-call provenance, and fold metrics;
- an older `src/ui/theater-boot.js` note deliberately leaves those files unwired because the then-available target
  was not dedicated trim-run geometry;
- `src/ui/theater-room-mesh.js` now emits base-course and cornice ribbons from the real wall contour, continuous
  perimeter U, per-segment ownership, and shared miter/bevel points; and
- `src/ui/theater-boot.js` mounts the resulting `wallTrimGeometry`, but still renders it through `wallMat`.

The existing art is a **single strip**, not a multi-slot trim sheet, and the current trim mesh's literal wall-style
V span cannot select semantic atlas bands. The first correct implementation is therefore not a one-line material
swap. It needs named roles, a stable sheet layout, padded slot coordinates, repeat length/physical scale, visibility
ownership, truthful material selection, and corner/endpoint fallbacks.

The recommended system uses full-width horizontal bands. It generates or authors source strips independently and
packs them deterministically from a versioned manifest; image generation supplies material detail but never exact
atlas coordinates. Runtime generated runs are segmented at each repeat boundary, map U `0..1` within the band, and
clamp V to its padded slot. This avoids repeating the whole atlas through texture-scope wrapping and avoids a custom
shader in the first proof. A later shader optimization must earn its derivative/mipmap/device cost through P10.10
evidence.

This direction aligns with the official
[Adobe Substance trim-sheet tutorial](https://www.adobe.com/learn/substance-3d-painter/web/trim-sheets-with-substance-painter),
which frames trim sheets as a planned way to texture many real-time assets with one texture set. The
[three.js texture contract](https://threejs.org/docs/pages/Texture.html) confirms that repeat/wrap operate on the
texture and that mipmapping/filtering are texture concerns, supporting the bounded geometry-segmentation scaffold.
The [Blender UV manual](https://docs.blender.org/manual/en/latest/editors/uv/introduction.html) reinforces that UVs
are explicit mappings and complex shapes may require unwrap/packing; Genesis's known architectural runs can bypass
that general step through direct parameterization, while complex reusable assets retain the offline unwrap lane.

The full open recommendation, five generated choices, proof shape, costs, and fallbacks are in
`docs/TRIM-SHEET-PIPELINE.md`. No option has yet been accepted.

---

## References

### Included PDFs

- **S1.** Tutenel, T.; Bidarra, R.; Smelik, R. M.; de Kraker, K. J. "Rule-based layout solving and its application to procedural interior generation." 2009. `Reference/Procedural-Dungeon-Research/papers/01-tutenel-2009-rule-based-layout-solving.pdf`.
- **S2.** Tutenel, T.; Smelik, R. M.; Bidarra, R.; de Kraker, K. J. "A Semantic Scene Description Language for Procedural Layout Solving Problems." 2010. `Reference/Procedural-Dungeon-Research/papers/02-tutenel-2010-semantic-scene-description.pdf`.
- **S3.** Yu, L.-F. et al. "Make it Home: Automatic Optimization of Furniture Arrangement." 2011. `Reference/Procedural-Dungeon-Research/papers/03-yu-2011-make-it-home.pdf`.
- **S4.** Merrell, P.; Schkufza, E.; Li, Z.; Agrawala, M.; Koltun, V. "Interactive Furniture Layout Using Interior Design Guidelines." 2011. `Reference/Procedural-Dungeon-Research/papers/04-merrell-2011-interactive-furniture-layout.pdf`.
- **S5.** Horswill, I.; Foged, L. "Fast Procedural Level Population with Playability Constraints." 2012. `Reference/Procedural-Dungeon-Research/papers/05-horswill-2012-playability-constraints.pdf`.
- **S6.** Nepozitek, O.; Gemrot, J. "Fast Configurable Tile-Based Dungeon Level Generator." 2018. `Reference/Procedural-Dungeon-Research/papers/06-nepozitek-2018-tile-based-dungeon-generator.pdf`.
- **S7.** Green, M. C. et al. "Two-step Constructive Approaches for Dungeon Generation." 2019. `Reference/Procedural-Dungeon-Research/papers/07-green-2019-two-step-dungeon-generation.pdf`.
- **S8.** Henderson, P.; Subr, K.; Ferrari, V. "Automatic Generation of Constrained Furniture Layouts." 2019. `Reference/Procedural-Dungeon-Research/papers/08-henderson-2019-constrained-furniture-layouts.pdf`.
- **S9.** Whitehead, J. "Spatial Layout of Procedural Dungeons Using Linear Constraints and SMT Solvers." 2020. `Reference/Procedural-Dungeon-Research/papers/09-whitehead-2020-smt-dungeon-layout.pdf`.

### Live technical sources

- Archmage Rises. "How to Procedurally Generate and Decorate 3D Dungeon Rooms in Unity C#." 2021. https://www.archmagerises.com/news/2021/6/12/how-to-procedurally-generate-and-decorate-3d-dungeon-rooms-in-unity-c
- Edgar documentation. "Room templates." https://ondrejnepozitek.github.io/Edgar-Unity/docs/next/basics/room-templates/
- Garmichael. "GaneshaDx: Map editor for Final Fantasy Tactics." GPL-3.0. https://github.com/Garmichael/GaneshaDx

### Genesis sources audited

Primary files include `docs/DUNGEON-GRAPH.md`, `docs/ROOM-GRAMMAR.md`, `docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md`, `src/engine/dungeon-walk.js`, `src/engine/place-spatialize.js`, `src/engine/place-dressing.js`, `src/engine/place-distribution.js`, `src/engine/place-projection.js`, `src/engine/room-grammar.js`, `src/engine/walk-interactables.js`, `src/engine/theater-data.js`, `src/ui/theater-room-mesh.js`, `src/ui/theater-boot.js`, and the relevant dungeon table sources under `Engine/03. _Tables/03. Session Mechanics/Dungeons/`.
