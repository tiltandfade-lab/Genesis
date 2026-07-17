---
type: review
project: Genesis
status: PROPOSED ASSESSMENT — EXPERIMENTAL EXCEPT A6, WHICH ADAM LOCKED 2026-07-17
created: 2026-07-17
author: Codex art-direction lane
reviews: KGR8-KENNEY-SHELL-REBUILD.md at feat/kgr8-demolition e5d5606d
audience: Adam + Fable orchestrator
purpose: Amend KGR-8 so the full Kenney switch fixes dungeon architecture rather than only replacing prism boxes with module-built boxes, and so environmental sprite art becomes architecture-aligned scene geometry rather than camera-facing cards.
---

# KGR-8 CODEX ASSESSMENT — KENNEY NEEDS AN ARCHITECT

## Verdict

**GO after amendment. Do not execute KGR-8 exactly as currently written.**

KGR-8 makes the correct strategic retreat:

- mixed Kenney/prism shells are rejected;
- rectilinear rooms are a sensible temporary constraint;
- the flat-leaf door law removes the gatehouse/Stonehenge failure;
- corridors must terminate at room boundaries;
- the room-shaped base replaces the bounding-box slab;
- one camera-side authority is the right cleanup.

The demolition capture is visibly better. It removes the pieces that were blocking the room and
proves that the existing lighting, material response, standees, and camera can carry a good board.

But the proposed `Room compiler v2` still says:

> floor tiles over the cell set, wall runs from wall modules, corners from corner modules

That is the old abstraction with a consistent asset supplier. It can produce cleaner Kenney boxes,
but it does not yet provide the architectural composition visible in the experimental ImageGen
five-room and fourteen-room boards. The current spec solves **construction correctness**. It must
also solve **architectural composition**.

The full Kenney suite strengthens the plan. Kenney should supply the authored architectural
vocabulary. It should not be asked to decide the architecture one cell at a time.

This review does not make the ImageGen experiment canon. Those frames are diagnostic references
only, per Adam's instruction. Amendment A6 is the exception: Adam explicitly promoted the
character-versus-environment sprite citizenship distinction from “probably” to “definitely” on
2026-07-17, so that ruling is canonical even while the broader assessment remains proposed.

## What KGR-8 should preserve unchanged

The four locked rulings remain authoritative:

1. Dungeon shells are all-Kenney; no mixed kit/prism room.
2. Rectilinear room shapes only while the kit path proves.
3. Doors are flat leaves in wall-plane apertures, with no proud surround.
4. Production gameplay renders clean void beyond the active room.

Nothing here reopens those decisions. The proposed whole-walk view below is a **development capture
mode**, not a change to the active-room production rule.

The useful KGR infrastructure also remains:

- normalized assets and Genesis materials;
- calibration and workbench data;
- module scale and quarter-turn structural orientation;
- attachment transforms for leaves and mounted props;
- source-provenanced walk nouns;
- existing lights, standees, camera composition, and interaction state.

If the next pass fails, the replaceable surface is the dungeon shell compiler, not the renderer.

## Six required amendments

### A1 — Insert an architecture plan between SpatialPlan and Kenney instances

The renderer must not infer visible architecture directly from the rasterized cell perimeter.

Add an engine-level, renderer-independent `DungeonArchitecturePlan` (name flexible) with at least:

```js
{
  sourcePlanHash,
  rooms: [{
    segNum,
    playableCells,       // canonical tactical truth
    floorSilhouette,     // continuous visible floor boundary
    boundaryEdges,       // ordered wall-edge loops
    openings,            // connection-owned apertures before door geometry
    elevationZones,      // flat/dais/pit/gallery/stair regions
    featureZones,        // reserved composition/clearance regions
    structuralPalette,   // one coherent Kenney family/recipe set
    recipe,              // macro and template module placements
    coverageStatus
  }],
  connections
}
```

The tactical cells remain exact. The presentation plan may add outward wall thickness, caps,
non-playable trim, recesses, and module-compatible margins without changing traversability,
connectivity, room count, exit count, or tactical distance.

The important inversion is:

```text
walk truth
  → sealed rectilinear SpatialPlan
  → DungeonArchitecturePlan
  → Kenney coverage/recipe solver
  → rendered shell
  → tactical grid overlay
```

The current `cells → wall runs` approach skips the middle two decisions.

### A2 — Make the Kenney recipe macro-first, not tile-random

The full suite contains authored room and corridor grammar that the current KGR-8 census omits:

- `room-small`, `room-large`, `room-wide`, and their variations;
- `corridor`, `corridor-corner`, `corridor-end`, `corridor-junction`,
  `corridor-intersection`, and `corridor-transition`;
- wide corridor equivalents;
- `template-floor-big`, `template-wall-corner`, wall tops/halves/details;
- raised layers, holes, wall-stairs, `stairs`, and `stairs-wide`.

Recipe priority should be:

1. exact whole-room or corridor macro;
2. composition of a small number of compatible macros;
3. template floor/wall/corner fill for the remainder;
4. explicit unsupported result.

Do not choose structural pieces independently per cell. Choose one coherent structural palette per
room or walk. “Full suite” means broad availability to the compiler, not indiscriminate mixing in
the rendered room.

Openings must be placed from canonical connections before walls are covered. A wall recipe fills
the boundary *around* those apertures; a doorway is not discovered afterward by replacing a wall.

### A3 — Remove prism fallback from every successful KGR-8 path

The current spec says the prism shell is condemned, then allows any uncovered room to fall back to
the prism shell. That is acceptable only as a clearly marked legacy-save/debug compatibility path.
It cannot count as KGR-8 success and cannot appear in acceptance frames.

For newly generated rectilinear dungeons:

- the spatializer must only emit shapes covered by the admitted structural grammar;
- coverage failure is a red gate, not a visually accepted fallback;
- machine evidence must report `kitCoverageRooms / dungeonRooms = 100%`;
- machine evidence must report zero prism wall/floor instances.

For old saves with unsupported shapes, a temporary whole-room fallback may remain behind an explicit
compatibility flag, but the frame must be labeled unsupported and cannot satisfy the visual gate.

### A4 — Replace the single dark gameplay capture with a staged shell gate

Ivory Pit plus one fresh roll is too narrow and too easy for lighting, props, or the active-room crop
to conceal structural defects.

KGR-8 needs four capture stages:

1. **Clay shell:** neutral material, high legibility, no props, creatures, dressing, effects, fog,
   or practical lights.
2. **Grid proof:** same shell with the five-foot overlay, proving that walls do not consume legal
   cells and that every aperture maps to a traversable connection.
3. **Production room:** normal materials, lights, standees, and active-room camera.
4. **Walk proof:** development-only 90-degree orthographic view with `focusSegNum` omitted, showing
   the whole graph without changing production's clean-void rule.

Fixtures:

- single rect, L, T, and U rooms;
- 5-foot and 10-foot openings on each wall orientation;
- a deterministic five-room walk;
- a deterministic fourteen-room walk with a branch and a loop;
- at least one dais or pit after flat shells pass.

The ImageGen experiment showed why the whole-walk card matters: composition failures are easier to
see when the room graph, corridors, and repeated shell decisions appear together.

### A5 — Correlate variation; do not randomize every cell

“Seeded per cell” risks replacing a uniform floor with visual confetti. Cracks, moss, dampness, and
wear should form sparse patches or fields with a room-level budget.

Required variation law:

- one base structural family per room/walk;
- a small deterministic variant budget;
- correlated patches, wall stretches, traffic paths, damp corners, or feature-affine regions;
- no independent roulette on every tile;
- variation never changes footprint, collision, wall height, or aperture alignment.

First accept the clay silhouette. Texture variation is the final KGR-8 unit, not evidence that the
shell itself works.

### A6 — LOCKED: only character standees billboard; environmental sprites belong to the room

Adam's words, verbatim:

> "also, the only sprites that need to billboard are the character sprites, environment sprites
> should probably be more of the sprite extrusions andgled and placed in the room in a way that
> aligns them to their environment"

Then, removing the tentative qualifier:

> "ok not probably, definitely. like every little item in your mock ups had a neat home and it
> looked natural, in our renders it always looks like some random thing just floating around"

The current broad billboard strategy weakens otherwise good lighting and makes environmental nouns
look pasted into the frame. Character and creature sprites benefit from camera-facing standees
because their silhouette, expression, and combat readability must survive composed camera changes.
Environmental sprites have a different job: they must appear attached to the architecture.

Locked citizenship law:

- **Character/creature sprites:** retain the existing camera-facing standee behavior.
- **Floor environmental sprites:** compile to shallow, smooth-contour extrusions; ground to a floor
  anchor and hold a deterministic yaw derived from the room composition or feature zone.
- **Wall environmental sprites:** compile to relief-like contour extrusions or surface cards aligned
  to the owning wall plane and normal; consume the same camera-cutaway decision as that wall.
- **Surface-mounted sprites:** align to the `top-surface` socket or declared support plane rather
  than the camera.
- **Corridor/edge features:** align to the corridor axis, opening, boundary edge, or feature axis
  that licensed their placement.
- **Floor/wall markings:** remain decals or surface projections, not upright billboards.

Environmental art must not swivel when the camera changes. A quarter-turn camera comparison should
show character standees continuing to face the viewer while an altar, painting, ladder, barricade,
fungal growth, or furniture silhouette remains physically oriented to its room.

The preferred generated geometry is the already-directed **smooth-contour extrusion**: a small,
clean depth behind the sprite silhouette, stable edge treatment, no choppy one-pixel staircase
sidewall, grounded pivot, and a conservative shadow footprint. Extrusion depth is a presentation
property and must not invent collision or consume additional tactical cells.

Every environmental sprite instance should carry an auditable placement contract:

```js
{
  sourceRef,
  renderMode: "contour-extrusion" | "wall-relief" | "surface-decal" | "true-3d",
  anchorKind: "floor" | "wall" | "top-surface" | "edge" | "opening",
  anchorRef,
  orientationSource: "wall-normal" | "corridor-axis" | "feature-axis" | "socket",
  yaw,
  normal,
  footprint,
  cutawayOwner
}
```

No environmental instance should resolve to `billboard` in an accepted dungeon frame. If a noun
cannot yet be truthfully extruded or mounted, the fallback should be explicit and logged; do not
quietly make it camera-facing.

KGR-8 does not need to convert the entire environment corpus before shell acceptance. It does need
to emit stable walls, floors, openings, feature zones, normals, and sockets that make this placement
possible. A following staging unit can migrate environmental sprites by demand from real walks.

## Additional contract clarifications

### Walls and the tactical grid

Kenney placement can remain cell-lattice plus quarter-turn. The visible wall body must nevertheless
be owned by a **boundary edge**, not by a playable cell center. Its thickness should extend outward
or into reserved non-playable trim so a five-foot tactical square remains a five-foot usable square.

The grid is an overlay on legal floor space. It is not the mesh-generation algorithm.

### Corridors and doors

The spatializer fix in KGR-8 §4b is P0 and should precede shell rendering:

- corridor interiors never tunnel through room interiors;
- a connection terminates at the room boundary;
- every door aperture belongs to exactly one connection;
- its wall line has valid cheeks on both sides where the recipe requires them;
- the dark portal, aperture module, leaf, collision, and interaction state consume the same
  opening record.

The current nearest-throat visual correction remains a compatibility repair, not the architectural
truth for newly compiled rooms.

### Elevation

Do not let a random fresh walk make the first shell proof depend on incomplete elevation coverage.
Accept flat rectilinear rooms first, then admit dais/pit/stair recipes as a separate unit.

A dark gradient is an honest temporary pit-depth presentation, but it must occupy a declared
`elevationZone`; it cannot be an untracked renderer effect inferred from prose.

### Rolled nouns

KGR-8 should not be blocked on catalog-wide noun realization. It must preserve feature zones,
source references, sockets, and clearances so the next staging pass has an architectural surface to
target.

After shell acceptance, run one production capture with existing walk-native nouns and emit:

```text
sourceRef → feature zone/socket → approved asset or truthful sprite fallback → rendered instance
```

This proves that the rebuild did not improve empty rooms by breaking their contents.

The same audit must identify citizenship. Character/creature entries may report `billboard`;
environment entries must report an architecture-aligned extrusion, relief, decal, or true 3D asset.

## Recommended executor split

Do not issue the current §3 as one leaf unit. Split it at independently gateable seams:

1. **KGR-8A — Spatial truth:** rectilinear shape constraint, sealed room boundaries, corridor
   termination, connection-owned openings.
2. **KGR-8B — Structural grammar:** census/calibrate macro rooms, corridor grammar, templates,
   corners, apertures, layers, stairs; define coherent palettes.
3. **KGR-8C — Architecture compiler:** produce deterministic `DungeonArchitecturePlan` and a
   complete coverage result without mounting Three.js objects.
4. **KGR-8D — Kenney shell renderer:** instantiate the recipe, silhouette plinth, flat leaves, and
   unified camera-side visibility.
5. **KGR-8E — Environment anchor contract:** expose floor planes, ordered wall normals, feature
   axes, edge/opening references, and cutaway ownership for architecture-aligned environmental art.
6. **KGR-8F — Elevation and correlated variation:** admit pit/dais/stair recipes, then sparse
   texture/detail variation.
7. **KGR-8G — Gameplay acceptance:** clay/grid/production/whole-walk capture matrix, one
   character-vs-environment quarter-turn proof, machine audit, and Adam's visual read.

Every unit should preserve one-flag diagnostic retreat until KGR-8G passes, but no prism frame can
be declared the successful outcome.

## Machine gates

Machine gates do not prove beauty, but they should prevent known structural failures:

- deterministic architecture-plan and recipe hash;
- every legal floor cell covered exactly once;
- every boundary edge covered exactly once or claimed by one opening;
- every opening maps to exactly one canonical connection;
- no corridor interior overlaps a room interior except the explicit connection throat;
- no structural footprint overlaps another incompatible footprint;
- zero NaN/singular transforms and zero ungrounded modules;
- 100% all-Kenney coverage for new generated acceptance walks;
- zero prism wall/floor instances in those walks;
- exact room and connection counts in the five- and fourteen-room fixtures;
- whole-walk draw-call and frame-time budgets recorded;
- sourceRef preservation for all rolled nouns after the shell rebuild.
- zero environmental `billboard` instances in the environment-citizenship acceptance fixture;
- environment orientation remains fixed in world space across quarter-turn camera captures while
  character/creature standees continue to face the camera.

## Visual gates

Adam's frame read remains the only acceptance of the look. Present before/after frames at identical
camera, exposure, resolution, and restored world state.

Reject if any of these remain:

- a room reads as a floor rectangle wearing wall pieces;
- corridors appear bored through room floors;
- corners, wall tops, or apertures expose seams;
- full-height camera-side walls hide the stage;
- doors read as buildings, monuments, or floating leaves;
- a room silently falls back to prism geometry;
- variation reads as independent tile noise;
- environmental props swivel toward the camera or read as unattached cards;
- lighting or props are needed to conceal weak shell geometry;
- the whole-walk card loses or invents rooms/connections.

The clay card must already look intentionally constructed before production materials are restored.

## Go/no-go boundary

KGR-8 is the correct final pass before considering a broader reset, but its success must be judged at
the shell abstraction boundary.

If KGR-8D cannot produce a convincing empty five-room and fourteen-room clay board, stop admitting
assets and replace the dungeon shell compiler cleanly. Preserve the walk roller, SpatialPlan truth,
Three.js renderer, lighting, standees, materials, calibration, interaction, and Kenney corpus.

If the clay boards pass, continue with elevation, variation, and rolled-noun staging. That outcome
means Genesis did not need a new graphics engine. It needed an architectural compiler between its
game grid and its asset kit.

## Exact disposition of the current KGR-8 spec

| Current section | Disposition |
| --- | --- |
| §0 diagnosis | Keep |
| §1 four rulings | Keep locked |
| §2 demolition | Keep; valid improvement |
| §3.1 census | Expand to macro rooms/corridor grammar and coherent palettes |
| §3.2 compiler | Replace with ArchitecturePlan + macro-first coverage solver |
| §3.2 prism fallback | Compatibility-only; forbidden in successful acceptance |
| §3.3 doors | Keep; consume connection-owned opening records |
| §3.4 silhouette base | Keep |
| §3.5 elevation | Split after flat-shell proof |
| §3.6 visibility authority | Keep and make all wall citizens consume it |
| §3.7 variation | Move after environment anchors; correlated room-level budget, not per-cell roulette |
| §4 acceptance | Replace with clay/grid/production/whole-walk matrix |
| §4b spatial truths | Promote to first executor unit |
| §5 scope | Keep, with development whole-walk capture and the environment-anchor contract explicitly allowed; bulk sprite migration remains a following demand-led unit |
