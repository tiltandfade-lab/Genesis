---
type: research
status: AUDITED
created: 2026-07-18
updated: 2026-07-18
related:
  - "[[PROCEDURAL-DUNGEON-DIRECTION]]"
  - "[[PROCEDURAL-DUNGEON-RESEARCH]]"
---

# Genesis Engine Crosswalk

> **Wave 4 authority note (2026-07-22):** this read-only audit remains current-code evidence. Its suggested portal,
> slot, and legality fields are candidate technical shapes, not accepted design rulings. Canonical decisions for
> connections, secrets, vertical traversal, circulation, and mutation live in
> `procedural-dungeon-direction/wave-04/01-questionnaire-and-triage.md`.

## Snapshot

The primary read-only audit was performed at commit `a863de76ff6afd1931168763d9ad52b0e58b915a`
on 2026-07-18 while master was undergoing a separate cleanup. The combat/range-band seams and final
document destinations were rechecked after that cleanup at `3736d58c56bfdcbfe2f715d76ffc4d4c03626570`.
Treat line numbers and flags as snapshot evidence. The audit itself made no engine edits.

## Finding

Genesis does not lack a dungeon generator. It lacks a single authoritative **room legality model** shared by the spatializer, door placement, dressing, interactables, composition grammar, projection, and renderer.

Each individual subsystem is sensible in isolation:

- the walk owns a persistent graph and rich rolled fields;
- the spatializer produces deterministic, reachable cell plans and several polygonal room shapes;
- doors have type and state;
- dressing is deterministic and realm-aware;
- projected cards preserve canonical content;
- interactables are stateful;
- the room grammar knows about focal points, pairing, rhythm, and clear space;
- the room-shell renderer has physical wall runs and mount slots;
- the harness suite checks determinism, reachability, shapes, terrain, doors, dressing, and rendering.

The failure is in composition between them. Several stages independently choose cells or transforms, several infer meaning from prose, and no shared representation owns edge apertures, multi-cell footprints, clearance, circulation, or semantic sockets.

## The Archmage-method answer

For architecture, Genesis is closest to **method 3: pieces or tiles**. `SpatialPlan.cells` is explicitly a 5-foot tile grid; room floors, walls, doors, water, tiers, corridors, and polygonal footprints are compiled from it. The renderer turns that logical tiling into volumetric shells. It is not a chunk library, because rooms are not selected as finished authored prefabs. It is not method 2's chunk-and-tile hybrid in the article's sense, because the architectural whole is generated, not chosen as a room-sized shell and then subdivided.

For dressing, Genesis is an incomplete hybrid between tiles and **method 4: builder**. `dressPlan`, projected cards, interactable binding, optional subcell distribution, and `applyRoomGrammar` form an ordered builder pipeline. However, the stages do not share one occupancy and constraint context, so the builder cannot make or repair a room-wide arrangement.

## Current data path and the breaks in it

```text
Dungeon tables / rollers
  -> segment strings and roll provenance
  -> spatializePlan
       parses dimensions and keyword-classifies shape/terrain
       chooses boundary cell nearest other-room center
  -> dressPlan
       realm roster + role density + one-cell occupied set
  -> canonical card projection
  -> placeDistribute (production flag off)
  -> interactable binding
  -> applyRoomGrammar (interactables only)
  -> renderer shell, wall mount slots, skin, light, camera
```

The critical breaks are:

1. The rollers express architectural facts as prose, then `place-spatialize.js` reconstructs a small subset through regular expressions and dimension parsing.
2. Door placement chooses a floor boundary cell, not a compatible aperture on an oriented boundary edge.
3. Dressing, projected cards, interactables, and grammar do not reserve against one another.
4. Placement is primarily one-cell occupancy. Multi-cell object footprint, human clearance, swing, aisle, and visual support surfaces are not authoritative engine concepts.
5. `ROOM-GRAMMAR.md` specifies a broad grammar and room typologies, but the implementation refines only a limited subset of interactables.
6. Renderer wall-mount slots exist, but the logical engine does not own their semantic availability. This makes the renderer a late placement decider.

## File-by-file crosswalk

### `src/engine/dungeon-walk.js`

**What it gets right:** stable segment identity, graph exits, rolled room area/dimensions/side features, door type/state, dressing condition, feature, and roll references.

**Gap:** architectural and dressing semantics are mostly strings. The compiler receives display prose rather than a structured `RoomProgram`. A future table compiler should emit data fields and retain the current prose as `renderText` or derive it from the same fields.

**Recommended role:** author of declarative intent only. It should not own coordinates.

### `src/engine/place-spatialize.js`

**What it gets right:** pure data in/out, seeded determinism, graph-edge fidelity, retry with honest failure, BFS reachability, 5-foot cells, dimension fidelity, polygonal shapes, terrain tiers, and a compatible raster plan. The module header's stage description and laws are valuable and should survive.

**Evidence of the gap:** lines 31-40 document string parsing for shape and terrain. Lines 294-315 classify shapes by substring. Lines 451-497 enumerate boundary **cells** and choose the one nearest the other room's center. This is deterministic, but it is not a portal solver: it knows neither wall-run span nor corner clearance, door width, hinge/swing, architectural symmetry, exclusion from structural features, or compatibility with a candidate slot on the other room.

**Recommended evolution:** retain cells and rasterization; add oriented `edges[]`, candidate `portalSlots[]`, committed `portals[]`, and `reservations[]`. Raster `DOOR` cells become a compatibility projection from portals.

### `docs/DUNGEON-GRAPH.md`

**What it gets right:** the graph is canonical, one cell is 5 feet, generation is deterministic, and the room must be independently renderable while graph-valid. Lines 161-184 already specify typed connection slots for doors, archways, hallways, and stairs.

**Gap:** the later slot contract was not realized as the shared logical source of truth. Current code has doors, renderer aperture data, and mount slots, but no implemented `rooms[].slots` contract carrying connection compatibility through every stage.

**Recommended evolution:** treat the existing connection-point section as the seed of `SpatialPlanV2`, but strengthen `side|arc` into explicit boundary geometry, span, normal, threshold, motion envelope, and provenance.

### `src/engine/place-dressing.js`

**What it gets right:** deterministic, realm-aware rosters; role-based density; focal, blocker, light, wall-hang, and filler categories; basic center and door-apron avoidance.

**Evidence of the gap:** the core selection works with a single `occupied` cell set. It places pieces from generic realm rosters rather than compiling the active room's rolled purpose into required assemblies and relationships.

**Recommended evolution:** make `dressPlan` consume `RoomProgram.dressing`, shared reservations, actual polygon capacity, and a catalog of footprints/features/sockets. It should place assemblies before clutter and emit why any requirement degraded.

### `src/engine/place-distribution.js`

**What it gets right:** recognizes that noun choice and spatial realization are different operations and uses a seeded, re-derivable placement stage.

**Evidence of the gap:** its own header limits legality to center, columns, anchors, door/apron, and a small set of exclusions. It has no global door swing, aisle, or widened circulation model. At the audited snapshot, `ROOM_PLACE_DISTRIBUTE` is false, so the production path does not benefit from the more refined transforms.

**Recommended evolution:** do not merely flip the flag. First make the stage consume the shared legality model; then use it for visual subcell transforms inside already-approved logical footprints.

### `src/engine/room-grammar.js` and `docs/ROOM-GRAMMAR.md`

**What the spec gets right:** "the roll owns the nouns; the grammar owns the arrangement" is exactly the correct boundary. ALIGN, RHYTHM, PAIR, ROW, FLANK, FOCAL, and CLEAR are a strong vocabulary. Shop, shrine, library, barracks, crypt, throne, and camp are good first recipe families. The door preference law correctly says centered/symmetric before corner.

**Implementation gap:** the code's header explicitly scopes itself to a small set of interactable archetypes and partial primitives. It does not arrange the broader dressing list, instantiate full room typologies, solve furniture assemblies, or affect portal choice. `CLEAR` cannot be genuinely inviolable when placement systems use separate occupancies.

**Recommended evolution:** preserve the grammar names but compile them to constraint and scoring terms inside the room compiler. `ROW` produces a hierarchical assembly plus aisle reservation; `FLANK` queries a committed portal; `FOCAL` owns an approach reservation; `CLEAR` is a hard mask applied before every candidate.

### `src/engine/walk-interactables.js`

**What it gets right:** stateful objects are derived from canonical text and receive stable source references.

**Gap:** a small keyword-to-archetype classifier and independent candidate placement cannot negotiate with furniture, structural stamps, or doors.

**Recommended evolution:** bind the noun and state before placement, but have the room compiler position the resulting required affordance. A lever, chest, altar, or portal should arrive as a placement requirement with footprint, access face, and interaction approach.

### `src/engine/place-projection.js`

**What it gets right:** canonical cards remain authoritative, presentation has priorities, and mechanical content is protected.

**Evidence of the gap:** room capacity uses bounding-box `w*d/8`, not actual polygon cells minus reservations and committed footprints. Visual eligibility also depends on late presentation fields rather than a common spatial contract.

**Recommended evolution:** calculate capacity from usable legal area and socket inventory. Projection decides which canonical facts require representation; the compiler decides where they fit and records degradation rather than silently dropping meaning.

### `src/engine/theater-data.js`

**What it gets right:** has a central derivation path and maintains state reconciliation for interactables.

**Gap:** the audited production order builds dressing, appends projected cards, conditionally distributes, then binds interactables and applies grammar. The comments describe a more coherent logical order than the actual shared legality allows. Earlier stages cannot anticipate later hard requirements.

**Recommended evolution:** replace the sequence of independent spatial passes with one `compileRoom(program, graphContext, catalogs, seed)` call, followed by state reconciliation and rendering projection.

### `src/ui/theater-room-mesh.js` and `src/ui/theater-boot.js`

**What they get right:** the compiled shell understands physical wall runs and can emit usable mount positions on inner wall faces. The boot layer uses those slots for practical lights.

**Gap:** renderer-generated mount slots are useful geometry facts but arrive too late to govern semantic dressing. A wall object can be declared without knowing whether a valid wall support exists.

**Recommended evolution:** hoist a generalized socket contract into logical compilation. The renderer may refine a logical socket to exact mesh coordinates, but it should not decide whether the room semantically has a valid wall, tabletop, shelf, chair, fillable, or focal socket.

## Table crosswalk

### `Dungeon Area Type.md`

The d200 is rich authorship, but the current four columns overload several machine concepts into prose. A read-only census at the snapshot found:

- 200 rows;
- 143 classified as rectangles by the current shape parser;
- 31 as cave-like, with the remaining 26 spread across circle, octagon, L, T, cross, and ellipse;
- only 67 rows matching the current terrain keyword parser;
- 199 dimension strings parseable, but 55 clamped to the 20-foot minimum.

This is not evidence that the table is weak. It is evidence that a rich table is being compressed by a narrow text parser. Preserve Adam's rows and attach structured compiler fields or recipe identifiers beside them.

### `Dungeon Set Dressing.md`

The d108 currently behaves mostly as a prose micro-detail roll. A single object or oddity cannot define a believable room function. Split the responsibility:

- **Room Function/Recipe:** required major assembly, optional assemblies, zones, circulation policy, tactical policy, clutter budget.
- **Dressing Detail:** one object, condition, anomaly, support-content instruction, or local story cue.

The current text remains valuable as display and narrative material. It should no longer be the sole machine interface.

### `Room Elevation Profile.md`

This table is already close to the desired pattern because it separates profile, shape, and minimum dimensions. Treat it as the model for other architectural rows, and move remaining interpretation out of roller-specific code into the shared `RoomProgram` compiler boundary.

## What to preserve without redesign

- Dungeon graph and walk storage.
- Roll provenance and deterministic seed discipline.
- Honest-failure and bounded retry laws.
- Five-foot combat grid and polygonal rasterization.
- Realm skin separation.
- Rolled door type and state as aperture state/appearance.
- One-room render architecture.
- Compiled shell and geometry kernel.
- Existing harnesses for determinism, reachability, shapes, terrain, render state, and regressions.

## New verification layer

Add solver-level tests that the present suite cannot express:

- potential-slot enumeration on every supported footprint;
- compatible portal pairing across graph edges;
- non-corner preference and named forced-corner cases;
- threshold, swing, apron, aisle, and focal-approach exclusion;
- multi-cell footprint and clearance non-overlap;
- all-portals circulation after every placement;
- required recipe satisfaction or declared degradation;
- hierarchical assembly completeness;
- score ordering and deterministic winner selection;
- provenance from placement to roll/recipe/rule/candidate;
- seed-corpus dashboards showing failure reasons and table-row feasibility.

## Bottom line

The current work should not be discarded. It should be **collapsed into one compiler**. The spatializer supplies macro geometry; the room grammar supplies relationship vocabulary; dressing and projection supply canonical nouns; interactables supply required affordances and state; renderer slots supply geometric refinement. A shared cell-edge-reservation-footprint-socket plan is the missing middle that lets all of them become one reliable system.
