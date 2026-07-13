---
type: system-spec
project: Genesis
status: SPECCED
updated: 2026-07-12
audience: Claude orchestration sessions, graphics subagents, Codex art direction
depends_on: STAGE-C-ART-DIRECTION-REVIEW, ROOM-SHELL-COMPILER, WALL-VOLUMES-PRACTICALS
---

# Open-Source Geometry Integration

## 0. Executive ruling

Genesis must stop owning commodity polygon mathematics while continuing to own its walk-native scene
meaning, spatial contracts, art direction, and diorama projection.

There is no public repository that can replace this pipeline:

```text
D&D tables -> stored walk -> canonical cells/tiers/apertures -> staged visual citizens -> diorama
```

That pipeline is Genesis. Public libraries should replace only the fragile commodity operations inside
it: polygon normalization, triangulation with holes, and, if benchmarks prove worthwhile, accelerated
spatial queries and robust build-time solid modeling.

The immediate production recommendation is:

1. Preserve the canonical walk and logical cell grid exactly.
2. Introduce one pure `PolygonKernel` adapter.
3. Use [polygon-clipping](https://github.com/mfogel/polygon-clipping) to normalize unions,
   differences, intersections, holes, and multipolygons.
4. Use [Earcut](https://github.com/mapbox/earcut) to triangulate normalized rings with holes.
5. Replace the bespoke triangulator only after fixture parity and adversarial topology gates pass.
6. Keep current wall-volume, practical-light, ShotPlan, sprite, and post-processing work intact.
7. Evaluate [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) and
   [Manifold](https://github.com/elalish/manifold) as measured follow-ups, not assumed dependencies.

This is not permission for a broad graphics rewrite. It is a controlled replacement of mathematical
infrastructure beneath the existing room-shell compiler.

## 1. Why this spec exists

Genesis currently performs several difficult operations in `src/ui/theater-room-mesh.js`:

- traces directed boundary edges from a raster cell set;
- chains the edges into rings;
- simplifies collinear runs while preserving apertures;
- applies shape-specific smoothing and diagonalization;
- classifies rings and constructs floor/tier surfaces;
- triangulates polygons with a bespoke ear-clipping implementation;
- maps logical combat cells back to rendered triangles;
- extrudes boundary segments into wall stems, upper walls, caps, footing, trim, and mount slots.

The last three architectural outputs are Genesis-specific and valuable. Polygon boolean operations and
triangulation are not. They are old, deceptively difficult problems with failures around holes,
coincident vertices, narrow necks, self-touching boundaries, winding, disconnected islands, and
floating-point degeneracy. A custom implementation can pass friendly rectangles and still emit a
filled pit, an omitted cell, an inverted triangle, or an S-shaped diagonal.

The visual symptom is not merely ugliness. Broken topology poisons every downstream system:

- walls inherit malformed boundaries;
- caps and miters amplify tiny contour defects;
- tier holes become covered floors;
- cell-to-triangle ownership becomes incomplete;
- cutaway tests classify geometry that should not exist;
- decals and mounts receive invalid surface frames;
- camera framing compensates for a shape different from the canonical room;
- generated props appear to float because the floor height query and rendered floor disagree.

The purpose of this work is to establish one trustworthy geometric interpretation of the canonical
walk without letting the renderer rewrite that walk.

## 2. Current-state constraints

The implementation session must re-read `CLAUDE.md`, `docs/HANDOFF.md`, and
`docs/STAGE-C-ART-DIRECTION-REVIEW.md` before acting. As of this spec:

- `src/ui/theater-room-mesh.js` is an ESM island with a deliberately pure, THREE-free geometry core.
- Genesis vendors Three.js at a pinned version and does not use a normal application package install.
- `theater-boot.js` already owns an `EffectComposer`, render pass, DoF, bloom, grade, and output path.
- C4.1a thick wall stems/uppers/caps/footings are already represented in the room-shell compiler.
- C4.1b segment-level upper-wall occlusion is in flight in a separate worktree.
- E0 visible physical practicals are in flight in a separate worktree.
- Floor congruence is in flight in a separate worktree.
- Combat, pathfinding, placement, walk provenance, and card dealing read canonical logical cells. They
  must not begin reading smoothed render polygons as a consequence of this work.

Therefore:

- do not replace Three;
- do not introduce React, a bundler, npm-at-runtime, or a second scene graph;
- do not replace the existing post stack with `pmndrs/postprocessing` in this wave;
- do not make wall geometry the responsibility of a CSG engine;
- do not let a library alter canonical room dimensions, rolled tiers, apertures, or walk facts;
- do not edit files owned by active agents until their branches are landed and the coordinator has
  rebased all dependent worktrees on the resulting master tip.

## 3. Library decisions

### 3.1 Adopt behind an adapter: polygon-clipping

Repository: [mfogel/polygon-clipping](https://github.com/mfogel/polygon-clipping)

License at the time of evaluation: MIT. Reconfirm from the exact pinned revision before vendoring.

Role:

- union cell rectangles into normalized room polygons;
- subtract pits, shafts, voids, and other non-floor regions;
- intersect terrain patches with the canonical room footprint;
- normalize overlapping tier patches into disjoint render regions;
- return multipolygons with explicit outer rings and holes.

It must not:

- decide what a room contains;
- create or remove logical cells;
- decide which terrain clause wins;
- smooth curves or invent diagonals;
- choose aperture locations;
- determine collision or line-of-sight rules.

The adapter must isolate its coordinate-array conventions from production callers. No production
module outside the adapter may depend directly on polygon-clipping's nested array format.

### 3.2 Adopt behind the same adapter: Earcut

Repository: [mapbox/earcut](https://github.com/mapbox/earcut)

License at the time of evaluation: ISC. Reconfirm from the exact pinned revision before vendoring.

Role:

- triangulate one normalized outer contour plus zero or more holes;
- support concave rooms and annular tier surfaces;
- replace bespoke ear clipping after parity gates pass.

Three.js already uses Earcut in its own
[`ShapeUtils.triangulateShape`](https://github.com/mrdoob/three.js/blob/dev/src/extras/ShapeUtils.js).
Genesis should still call Earcut through its own pure adapter because the current room-shell core is
Node-importable and intentionally independent of Three. The adapter also gives Genesis one stable seam
for pinning, winding normalization, epsilon policy, diagnostics, and future replacement.

### 3.3 Evaluate only: three-mesh-bvh

Repository: [gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)

License at the time of evaluation: MIT. Reconfirm before vendoring.

Potential role:

- accelerate camera-to-subject wall and prop ray tests;
- accelerate picking against compiled room shells;
- support future projectile, decal-placement, and visibility queries against static room geometry.

Current occlusion works primarily over a modest number of segment/AABB candidates. A BVH can be slower
overall if building/refitting it costs more than the saved ray work. It earns production adoption only
if the benchmark in section 13 proves a material benefit on representative large rooms and does not
complicate deterministic rebuild/disposal behavior.

### 3.4 Evaluate for build time only: Manifold

Repository: [elalish/manifold](https://github.com/elalish/manifold)

License at the time of evaluation: Apache-2.0. Reconfirm before vendoring.

Potential role:

- robust offline boolean construction of arches, stairs, columns, ruins, furniture, and prop families;
- validate that generated procedural models are watertight manifold solids;
- export generated geometry into Genesis-owned compact assets or recipes.

Do not put its WASM kernel into the gameplay render path during this work. Genesis currently has no need
to recompute arbitrary CAD booleans every frame. Build-time generation preserves determinism, avoids a
large runtime payload, and lets generated output pass QA before promotion.

### 3.5 Do not adopt for core shells: three-bvh-csg

Repository: [gkjohnson/three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg)

The project is valuable, but its own documentation describes important manifold and numerical
preconditions. Do not make all doors, pits, wall caps, or room shells depend on runtime CSG. Consider a
future isolated experiment for destructible breaches after ordinary walls and apertures are stable.

### 3.6 Use what is already vendored: Three DecalGeometry

Three maintains
[`DecalGeometry`](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/geometries/DecalGeometry.js).
When Genesis adds projected cracks, blood, scorch, tracks, grime, or rune marks, vendor the matching
addon from the same pinned Three release. Do not add the stale standalone decal repository.

### 3.7 Explicitly rejected in this wave

- procedural dungeon generators: they compete with the walk rather than helping its projection;
- marching-squares dependencies solely for sprite alpha: a small build-time contour tracer is enough;
- a new post-processing framework: Genesis already has the needed composer seam;
- runtime CAD/CSG for ordinary architecture;
- physics engines as a solution to rendering topology;
- geometry libraries whose license is incompatible with Genesis distribution;
- CDN imports or unpinned GitHub raw URLs.

## 4. Architectural boundary

Add a pure ESM module with a narrow API. Recommended path:

```text
src/ui/geometry/polygon-kernel.js
```

The final location may follow a newly landed graphics convention, but the responsibilities must remain
separate from `theater-boot.js` and Three assembly.

Recommended public contract:

```js
// All points are plain {x, z}. Rings are open: first point is not repeated at the end.

export function unionCellRects(cells, options = {}) {}

export function unionPolygons(polygons, options = {}) {}

export function differencePolygons(subject, clips, options = {}) {}

export function intersectPolygons(subject, clips, options = {}) {}

export function normalizeMultiPolygon(input, options = {}) {}

export function triangulateSurface(surface, options = {}) {}

export function validateSurface(surface, options = {}) {}

export function pointInSurface(point, surface, epsilon = DEFAULT_EPSILON) {}

export function surfaceArea(surface) {}
```

Genesis-owned return type:

```js
{
  polygons: [
    {
      outer: [{ x, z }, ...],
      holes: [[{ x, z }, ...], ...],
      area,
      bounds: { minX, minZ, maxX, maxZ }
    }
  ],
  diagnostics: {
    droppedDuplicatePoints: 0,
    droppedDegenerateRings: 0,
    repairedWinding: 0,
    inputArea,
    outputArea,
    areaDelta
  }
}
```

Triangulation return type:

```js
{
  vertices: [{ x, z }, ...],
  indices: [a, b, c, ...],
  trianglePolygonIds: [0, 0, 1, ...],
  area,
  diagnostics: {
    zeroAreaTriangles: 0,
    reversedTriangles: 0,
    centroidOutsideSurface: 0,
    centroidInsideHole: 0,
    areaDelta: 0
  }
}
```

No library-native arrays, classes, geometry objects, mutable singletons, Three types, or DOM state may
escape this module.

## 5. Coordinate, winding, and epsilon law

These decisions must be explicit and tested rather than inferred from whichever library is called.

1. Geometry operates in the horizontal `(x,z)` plane.
2. One logical cell `(x,z)` occupies `[x-0.5,x+0.5] x [z-0.5,z+0.5]`.
3. Adapter rings omit a duplicated closing point.
4. Outer rings use one Genesis-owned winding; holes use the opposite winding.
5. The adapter converts to and from each library's expected winding and closure rules.
6. Quantization may be used only at the adapter boundary and only at an epsilon far below visible or
   logical resolution. It must never snap a five-foot cell edge into a different cell.
7. Start with `DEFAULT_EPSILON = 1e-7` in world units and prove it against fixtures. Do not scatter
   unrelated `1e-3`, `toFixed(3)`, and `1e-6` policies through the pipeline.
8. Deduplicate consecutive equal points and a repeated terminal point before triangulation.
9. Reject rings with fewer than three unique points or area below epsilon.
10. Rotate each ring to a deterministic starting vertex: lexicographically smallest `(x,z)`, with a
    deterministic outgoing-edge tie break.
11. Sort polygons deterministically by descending absolute area, then bounds, then vertex sequence.
12. Sort holes by the same rule inside their owner.

This canonicalization is required because byte-deterministic output is a Genesis contract and because
libraries may return geometrically equivalent rings in different orders.

## 6. Canonical geometry versus render geometry

Never collapse these into one concept.

### 6.1 Canonical geometry

Canonical geometry is derived from stored walk facts and logical cells:

- room dimensions and shape roll;
- exact occupied cell set;
- terrain patches and tier membership;
- doors, exits, apertures, secret boundaries, and connections;
- collision, movement, cover, reach, and occupancy;
- source provenance.

It is integer-grid faithful and is never rewritten to make a prettier picture.

### 6.2 Render geometry

Render geometry is a projection of canonical geometry:

- diagonalized octagon edges;
- rounded rotunda/ellipse contours;
- bevels and cap overhangs;
- wall thickness extending outside the interior;
- visual-only seam cleanup;
- camera-relative visibility of upper wall bands;
- material coordinates and decals.

Every render contour must retain a relation to its canonical source. At minimum, keep:

```js
{
  sourceRoomId,
  sourceTier,
  sourceCellKeys,
  sourceSegmentRefs,
  transformKind: "identity|diagonalize|radial-smooth|bevel|offset"
}
```

Combat and card placement continue to use canonical cells. Render raycasting may use render geometry.
Whenever the two disagree, the disagreement must be visible in diagnostics rather than silently
changing mechanics.

## 7. Target floor pipeline

The target dataflow is:

```text
canonical tier cells
  -> cell rectangles
  -> polygon union
  -> canonical multipolygon (outer rings + holes)
  -> subtract explicit voids where required
  -> intersect rolled terrain patches with canonical room footprint
  -> resolve disjoint tier surfaces
  -> render-only contour transform
  -> topology validation
  -> Earcut triangulation per polygon with holes
  -> triangle validation
  -> cellTriangleMap / floor-height ownership
  -> Three BufferGeometry assembly
```

### 7.1 Cell union

Each cell becomes a closed rectangle in library coordinates. Union all rectangles belonging to the
same final floor tier. Duplicate cells must not double area. Corner-touching cells may produce separate
polygons; the adapter must not invent a diagonal bridge. Edge-touching cells must merge.

The output may contain:

- one simple polygon;
- one polygon with holes;
- several disconnected polygons;
- several polygons each with holes.

All are valid mathematical results. A later Genesis policy may reject disconnected walkable islands,
but the polygon kernel must represent them truthfully rather than dropping all but the largest ring.

### 7.2 Terrain resolution

Terrain patches must be resolved from their canonical cells and narrative order before triangulation.
Do not ask polygon-clipping to decide narrative precedence. The caller decides the tier of every cell or
supplies explicit subject/clip sets; the kernel performs only the requested boolean operation.

For row-101-like annular terrain:

- the raised ring must remain a ring with a hole;
- the sunken arena must remain visible inside that hole;
- the summed projected area must equal the canonical room's covered area unless a roll explicitly
  creates a void;
- no upper-tier triangle may span the central hole;
- the shared riser boundary must be derivable once and emitted once.

### 7.3 Render transforms

Shape-specific diagonalization and radial smoothing occur after the canonical boolean result and before
triangulation. Each transform must preserve ring ownership and must pass validation.

If a transform causes:

- self-intersection;
- hole escape;
- hole/outer contact inside epsilon;
- winding inversion;
- area drift beyond its declared tolerance;
- a wall segment shorter than the minimum cap/miter requirement;

then fall back to the untransformed normalized contour and emit a diagnostic. Never push malformed
geometry downstream because the smoothed version looked nicer on the common fixture.

## 8. Wall derivation law

Walls derive from the final validated render boundary, while mechanics remain attached to canonical
segments.

For every boundary segment, produce a stable record:

```js
{
  id,
  sourceRoomId,
  sourceRefs,
  sourceCellEdges,
  a: { x, z },
  b: { x, z },
  inwardNormal: { x, z },
  tier,
  kind: "wall|door|riser|open",
  length,
  canonicalHeight,
  thickness,
  stemHeight,
  capHeight,
  apertureIds: [],
  mountSlots: []
}
```

Requirements:

- no wall is emitted across a hole unless that boundary is intentionally a retaining/riser wall;
- no wall is emitted across a door aperture;
- every non-open outer edge belongs to exactly one wall segment;
- segment joins have stable miter, bevel, or butt behavior;
- acute joins are clamped to a maximum miter extension;
- diagonal walls are a single straight segment unless canonical geometry contains an actual turn;
- no zero-length segment reaches wall extrusion;
- outer faces, inner faces, top caps, end caps, footing, trim, and mount planes share the same segment
  frame;
- a hidden upper wall leaves the opaque capped stem and all logical collision intact;
- mounts parent to the owning wall record and never become free-floating substitutes.

The S-shaped octagon failure is an acceptance-test fixture: an octagon chamfer must produce one straight
monotonic diagonal per corner, with no alternating inward/outward step and no endpoint hook.

## 9. Aperture law

Doors and secret connections are semantic boundaries, not holes discovered after triangulation.

1. Preserve aperture ownership before collinear simplification.
2. Split a normalized wall run at aperture endpoints.
3. Do not merge across aperture metadata even when segments are collinear.
4. Clamp apertures to their owner segment and fail loudly if the requested width cannot fit.
5. Doorframes, wall caps, collision, and nav connections must consume the same aperture record.
6. A secret aperture may be visually closed while remaining represented as a latent connection.
7. Opening, breaching, or revealing an aperture changes state; it does not mutate the original walk
   provenance.

Polygon difference is not required for a normal floor-level doorway because the wall compiler can omit
the owning span. Use boolean subtraction only when a true hole is needed in a solid surface.

## 10. Cell-to-triangle mapping

`cellTriangleMap` is a gameplay/render bridge and must be total for every rendered canonical floor cell.

Preferred mapping:

1. Build a spatial index of generated triangles per tier, even if initially a simple bounds grid.
2. Test the cell center against candidate triangles using an epsilon-aware barycentric test.
3. If the center lies on an edge, choose deterministically by triangle index.
4. For heavily smoothed boundary cells whose center is outside render geometry, map the nearest point on
   the render surface only if the cell remains canonical and the distance is under a declared bound.
5. Record fallback distance and reason.
6. Fail the geometry gate if any walkable cell remains unmapped.

Do not hide missing cells by assigning an arbitrary nearest triangle without a distance limit. The map
must prove congruence, not simply become non-null.

Recommended record:

```js
cellTriangleMap[cellKey] = {
  tier,
  polygonId,
  triIndex,
  method: "contains-center|edge-tie|nearest-surface",
  distance,
  canonicalCellKey
};
```

## 11. Required fixture corpus

Create fixtures as small plain-data modules. Keep them free of Three and browser state. Every fixture
declares expected area, polygon count, hole count, tier count, aperture count, and allowed transform
area tolerance.

Minimum corpus:

1. one cell;
2. 2x2 rectangle;
3. long 1-cell corridor;
4. concave L room;
5. T room;
6. cross room;
7. canonical chamfered octagon;
8. octagon with one doorway on a diagonal;
9. raster rotunda before and after render smoothing;
10. ellipse with unequal axes;
11. cave with noisy but valid boundary;
12. one-cell-wide neck joining two lobes;
13. two regions touching only at one corner;
14. two disconnected islands;
15. donut/annulus with one hole;
16. outer polygon with two holes;
17. nested tier: raised ring around sunken arena;
18. row-101 exact canonical fixture;
19. dais with two elevation levels;
20. pit touching an outer wall;
21. duplicate cell input;
22. shuffled cell order repeated across at least 100 seeded permutations;
23. adjacent door cells forming a wide aperture;
24. door at a concave corner;
25. tiny room at the canonical minimum without renderer enlargement;
26. malformed input fixture that must return diagnostics rather than throw;
27. very large room near expected production maximum;
28. overloaded visual scene whose geometry remains unchanged while cards reserve elsewhere.

Fixtures 7, 8, 15, 17, 18, and 22 are merge blockers.

## 12. Automated invariants

The pure geometry harness must assert all of the following:

- deterministic byte-identical normalized output for equivalent input orderings;
- union area equals unique canonical cell count for flat-cell fixtures;
- tier surface area equals the count or explicit polygon area assigned to that tier;
- total visible floor area equals canonical covered area minus explicit void area;
- every ring is simple after normalization;
- outer/hole winding follows Genesis law;
- every hole belongs to exactly one outer polygon;
- holes contain no floor triangles;
- no triangle has repeated indices or near-zero area;
- triangle winding is consistent with upward floor normals;
- summed triangle area matches normalized surface area within epsilon;
- every triangle centroid is inside its owning outer and outside all holes;
- every canonical floor cell has a bounded `cellTriangleMap` entry;
- no noncanonical cell acquires gameplay ownership;
- boundary edges have correct parity: interior triangulation edges occur twice, exterior/hole edges once;
- wall coverage equals boundary coverage minus apertures and explicitly open edges;
- each aperture removes exactly its owned wall interval;
- no wall segment self-intersects;
- no wall cap or outer-face index is NaN or infinite;
- all normals are finite and approximately unit length;
- UVs are finite and continuous across a collinear wall run;
- row 101 retains both raised ring and sunken center;
- diagonal octagon walls are straight and monotonic;
- canonical cells and stored walk structures are byte-identical before and after render compilation;
- library failure returns a typed diagnostic/fallback, never a blank stage or uncaught exception.

Run the existing harnesses after integration:

```bash
python3 build/check-manifest.py
node dev/verify-room-shell.mjs
node dev/verify-room-shell-render.mjs
node dev/verify-stage-c-terrain.mjs
node dev/verify-stage-c-shapes.mjs
node dev/verify-stage-c3b-circle-smooth.mjs
node dev/verify-octagon-miter.mjs
node dev/verify-dungeon-interior.mjs
node dev/verify-combat-cells.mjs
node dev/verify-theater-shot.mjs
```

Use the exact current names from the rebased master if a harness is renamed. Render harnesses may
auto-skip without Chrome, but the coordinator must run them in an environment with Chrome before merge.

## 13. Benchmarks and adoption gates

Correctness comes first. Performance measurements must use production-scale and adversarial fixtures,
not only a 4x4 rectangle.

### 13.1 Polygon kernel budget

Measure separately:

- rectangle creation;
- polygon union;
- terrain boolean operations;
- normalization/canonicalization;
- triangulation;
- cell-to-triangle mapping;
- wall derivation;
- Three assembly.

Capture median, p95, maximum, input cell count, output vertex count, triangle count, and heap delta over
at least 100 deterministic builds after warm-up. The target is no visible interaction stall. Because a
room shell is static for long stretches, a modest one-time build cost is acceptable; accidental rebuilds
every animation frame are not.

Cache only deterministic compiled geometry keyed by canonical geometry identity plus render profile.
Do not cache narrative/card placement. Invalidate on tier/aperture/shape-state changes, not camera-only
wall visibility changes.

### 13.2 BVH experiment

Agent output must compare:

```text
existing segment/AABB occlusion
vs
Three Raycaster over ordinary BufferGeometry
vs
three-mesh-bvh accelerated raycasting
```

Test small, representative, large, and pathological rooms with the actual number of ShotPlan targets.
Measure:

- BVH build time;
- memory;
- rays per camera evaluation;
- p50/p95 query time;
- rebuild/refit cost after state changes;
- disposal correctness;
- classification parity with the existing implementation.

Adopt only if p95 camera-evaluation time improves materially on representative scenes and total cost,
including build and lifecycle complexity, is justified. A useful initial threshold is at least a 2x
query improvement or a demonstrated frame-budget problem solved. Otherwise retain the simpler segment
math and record the rejection.

### 13.3 Manifold experiment

Build one arch, one breached wall, one stair, and one semantic furniture recipe offline. Record:

- WASM/tool startup time;
- generated triangle count;
- watertight/manifold validation;
- deterministic output hash;
- export/import complexity;
- visual benefit over Genesis's prism grammar;
- whether generated UV/material groups survive;
- licensing and distribution impact.

Adopt only as a build tool if it clearly reduces procedural recipe complexity or eliminates invalid
solid output. Do not ship the experiment in runtime code.

## 14. Vendoring policy

No subagent may add a dependency by copying an arbitrary minified file from a website.

For every accepted library:

1. Pin an exact tagged release and commit SHA.
2. Verify the release from the upstream GitHub repository.
3. Record upstream URL, version, SHA, license, vendored files, and any local modifications.
4. Preserve the upstream license beside the vendored source.
5. Prefer an auditable ESM source file over an opaque bundle when practical.
6. Do not include tests, docs, benchmarks, or package-manager debris that runtime does not need.
7. Do not import from a CDN.
8. Register runtime modules according to Genesis's manifest/import conventions.
9. Add a smoke test proving the vendored module loads over localhost and in Node harnesses.
10. Run license and size review before production promotion.

Recommended layout:

```text
vendor/earcut/
  LICENSE
  README-GENESIS.md
  earcut.js

vendor/polygon-clipping/
  LICENSE
  README-GENESIS.md
  polygon-clipping.js
```

`README-GENESIS.md` must contain provenance and update instructions. Never edit vendored algorithm code
to make Genesis tests pass; put coordinate conversion and policy in `PolygonKernel`.

## 15. Rollout and fallback

Use a temporary feature switch at the room-shell boundary:

```js
ROOM_SHELL_POLYGON_KERNEL = "legacy|oss-compare|oss"
```

This is a migration switch, not a permanent player setting.

- `legacy`: existing production output.
- `oss-compare`: render legacy, compute both, emit structured parity diagnostics.
- `oss`: render the new normalized/triangulated output.

The compare mode must compare semantic invariants, not raw vertex order:

- area;
- polygon/hole count;
- covered canonical cells;
- aperture intervals;
- wall boundary length;
- tier ownership;
- triangle validity;
- output bounds.

Promotion sequence:

1. pure fixtures green;
2. legacy parity fixtures green where legacy is known-correct;
3. known-broken fixtures demonstrate the intended new behavior;
4. compare mode over a deterministic dungeon corpus;
5. render captures for required geometry scenes;
6. integrated walk-native frame-12/frame-19 captures;
7. performance and memory gates;
8. switch default to `oss`;
9. hold legacy path for one stabilization wave;
10. remove legacy triangulation only after no rollback-worthy defect appears.

Fallback is per-surface, not all-or-nothing: if a render transform fails validation, use the normalized
canonical contour. If Earcut fails unexpectedly, emit diagnostics and use the validated legacy
triangulator only during the stabilization window. Never render an empty room silently.

## 16. Required visual gates

Pure math gates do not prove beauty. Capture all of these through the production renderer:

1. bare geometry diagnostic: rectangle, L, octagon, rotunda, annulus;
2. octagon close-up showing four straight chamfers without S-hooks;
3. row-101 raised ring with visibly open sunken center;
4. diagonal doorway with caps and frame aligned to one wall plane;
5. near-wall cutaway retaining a thick opaque capped stem;
6. far/side walls remaining full height where they do not block subjects;
7. physical wall sconce remaining attached through camera changes;
8. pit, dais, stairs, cover, centerpiece, figures, and props in one integrated scene;
9. desktop and mobile gameplay-size captures;
10. deterministic repeat capture with geometry metrics sidecar.

Every capture report includes:

```json
{
  "walkId": "...",
  "roomId": "...",
  "kernel": "oss",
  "inputCells": 0,
  "polygons": 0,
  "holes": 0,
  "triangles": 0,
  "wallSegments": 0,
  "apertures": 0,
  "unmappedCells": 0,
  "areaDelta": 0,
  "buildMs": 0,
  "sourceRefCoverage": 1
}
```

The coordinator must actually inspect the PNGs. A subagent saying a capture "looks correct" is not a
visual gate.

## 17. Multi-agent execution plan

### 17.1 Orchestrator law

One orchestrator owns the wave. Subagents never merge to master. Each subagent gets:

- one worktree;
- one branch;
- one narrow ownership surface;
- one written task packet;
- one required commit;
- explicit tests and output artifacts;
- an instruction not to edit shared handoff/design docs.

The orchestrator:

- records the starting master SHA;
- checks active worktrees and file ownership before assignment;
- waits for floor-congruence, wall-upper-occlusion, and visible-practicals to land before creating any
  dependent room-shell integration branch;
- rebases or merges the latest master into each dependent branch before execution;
- reviews diffs and reruns gates personally;
- serializes all merges;
- updates shared docs once, after code has landed;
- pushes master immediately after each accepted merge.

Do not launch all agents against `theater-room-mesh.js`. Parallelize research, fixtures, adapters, and
benchmarks; serialize the integration owner.

### 17.2 Dependency graph

```text
Active Claude worktrees land
        |
        v
G0 baseline + fixtures --------------------+
        |                                  |
        v                                  v
G1 polygon-kernel adapter             G4 BVH benchmark
        |                                  |
        v                                  +--> report only
G2 room-shell integration
        |
        v
G3 wall/aperture/cell-map integration
        |
        v
G5 integrated render gate

G6 Manifold build-time spike ----------------> report + quarantined samples only
```

G4 and G6 may run in parallel with G1 because they must not edit production room-shell files.

### 17.3 Unit G0: baseline and golden fixtures

Ownership:

- new geometry fixture module(s);
- new pure kernel verification harness skeleton;
- baseline JSON reports and approved captures;
- no production renderer edits.

Tasks:

1. Record exact master SHA and test commands.
2. Encode the fixture corpus from section 11.
3. Run current legacy compiler and record known passes/failures.
4. Add invariant helpers independent of either implementation.
5. Prove at least one red fixture for a real known defect or missing capability.
6. Commit fixtures and baseline report.

Acceptance:

- fixtures are deterministic plain data;
- expected values are geometric truths, not snapshots of legacy bugs;
- harness can test either implementation through an injected adapter;
- no generated binary capture is committed unless repo convention requires it.

### 17.4 Unit G1: PolygonKernel and vendoring

Ownership:

- vendored Earcut and polygon-clipping directories;
- `src/ui/geometry/polygon-kernel.js`;
- kernel-only tests;
- manifest/import registration needed solely for this module.

Tasks:

1. Reconfirm versions, SHAs, and licenses.
2. Vendor minimum auditable ESM sources and licenses.
3. Implement Genesis-native conversions and deterministic canonicalization.
4. Implement union/difference/intersection/validation/triangulation APIs.
5. Make every section-11 fixture green at the pure kernel level.
6. Produce timing and bundle-size report.

Forbidden:

- editing `theater-room-mesh.js`;
- changing walk/spatialization code;
- importing Three;
- adding a package-manager runtime dependency;
- relaxing expected areas to match a faulty result.

Acceptance:

- kernel is pure and Node-importable;
- no library-native type escapes;
- shuffled input is deterministic;
- holes and multipolygons pass;
- `check-manifest.py` passes if module registration changes.

### 17.5 Unit G2: floor integration

Ownership:

- `src/ui/theater-room-mesh.js` floor contour and triangulation integration;
- direct room-shell tests only.

Prerequisites:

- active floor-congruence work landed;
- G0 and G1 merged;
- branch created from that exact master tip.

Tasks:

1. Add `legacy|oss-compare|oss` migration mode.
2. Convert tier cells into normalized surfaces through PolygonKernel.
3. Preserve door/riser/source metadata needed downstream.
4. Apply existing render transforms with validation/fallback.
5. Replace floor triangulation with Earcut in `oss` mode.
6. Preserve legacy output in `legacy` mode.
7. Emit parity diagnostics in compare mode.
8. Keep Three assembly thin and unchanged where possible.

Acceptance:

- all pure fixtures and existing room-shell tests pass;
- row 101 has an actual hole in its raised ring;
- no logical cells or terrain arrays mutate;
- old and new outputs agree on all known-correct fixtures;
- the legacy known-broken fixture is corrected rather than preserved.

### 17.6 Unit G3: boundaries, walls, apertures, and ownership

Ownership:

- room-shell boundary-to-wall adapter;
- aperture splitting;
- `cellTriangleMap` completion and diagnostics;
- focused tests.

Prerequisites:

- wall-upper-occlusion work landed before branch creation;
- G2 merged.

Tasks:

1. Derive wall runs from validated render boundaries.
2. Reattach canonical source edge and aperture metadata deterministically.
3. Preserve C4.1 wall stems, uppers, caps, trim, footing, and mount slots.
4. Prove straight diagonal octagon walls.
5. Make the cell map total with bounded fallbacks.
6. Verify occlusion classifications consume stable segment IDs after geometry changes.
7. Verify practical mounts stay attached to owner segments.

Acceptance:

- wall and aperture invariants pass;
- current C4.1b and E0 harnesses remain green;
- no camera-facing wall becomes canonically low;
- no practical becomes a floating object;
- diagonal and concave joins have no spikes or S-hooks.

### 17.7 Unit G4: BVH decision spike

Ownership:

- `dev/spikes/geometry-bvh/` or equivalent quarantined spike directory;
- benchmark harness and report;
- no production imports.

Tasks:

1. Reproduce current occlusion query workload.
2. Compare the three paths in section 13.2.
3. Test static build, state change, disposal, and deterministic classification.
4. Recommend `adopt`, `defer`, or `reject` with numbers.

Acceptance:

- report includes raw fixture sizes and p50/p95 timings;
- no claim is based on upstream README performance;
- production code remains untouched unless a later separately specced unit adopts it.

### 17.8 Unit G5: integrated production gate

Ownership:

- one new integrated capture harness;
- metrics sidecars;
- no core geometry edits except a narrowly reviewed test seam if unavoidable.

Prerequisites:

- G3 merged;
- visible-practicals work landed;
- relevant sprite citizenship changes landed or explicitly version-pinned.

Tasks:

1. Build exact walk-derived frame-12 and frame-19 fixtures.
2. Enter through `trayFrom`/`walkSceneFrom`, not direct bare-shell construction.
3. Enable ShotPlan, physical practicals, pieces, dressing, materials, and post.
4. Assert source provenance and no unlicensed nouns.
5. Capture desktop/mobile and compare mode metrics.
6. Inspect every frame and record art-direction findings.

Acceptance:

- geometry is correct and the room reads as a substantial diorama;
- raised/sunken topology is visible at gameplay size;
- wall cutaways reveal subjects without flattening all architecture;
- no floating glow discs;
- no sprite floor gap or square-alpha shadow regression;
- frame time remains within current project gate.

### 17.9 Unit G6: Manifold offline spike

Ownership:

- isolated build-time experiment directory;
- generated samples and technical report;
- no production runtime import.

Tasks and gates are section 13.3. This work cannot block G1-G5.

## 18. Subagent prompt template

The orchestrator should give each agent a packet shaped like this:

```text
You own Genesis geometry unit <ID> only.

Read, in order:
1. CLAUDE.md
2. docs/HANDOFF.md
3. docs/GEOMETRY-OSS-INTEGRATION.md sections <...>
4. the exact production files named below

Starting master SHA: <sha>
Your branch/worktree: <branch> / <path>
Exclusive ownership: <paths>
Forbidden paths: <paths owned by active agents and shared docs>

Required behavior:
- preserve the walk and canonical logical cells byte-for-byte;
- write a red-first test for the assigned invariant;
- use apply_patch for manual edits;
- never edit generated artifacts;
- run check-manifest after module edits;
- run these exact harnesses: <commands>;
- inspect generated captures if this unit renders;
- stage explicit paths only;
- commit with one scoped commit;
- report SHA, changed paths, tests with pass counts, benchmark/capture paths, and remaining risks;
- do not merge or push master.

Do not broaden the task. If a prerequisite is missing, stop and report the exact missing contract.
```

The orchestrator must tailor the paths and tests. A generic "fix geometry" prompt is prohibited.

## 19. Merge protocol

For every unit:

1. Confirm the subagent committed all intended paths and no unrelated paths.
2. Inspect `git diff <merge-base>...<branch>`.
3. Re-run the unit's tests personally on its branch tip.
4. Re-run captures personally and inspect them where applicable.
5. Merge latest `origin/master` into the unit branch if master advanced.
6. Resolve conflicts by preserving both landed contracts; never choose one branch wholesale.
7. Re-run gates after conflict resolution.
8. Merge to master with `--no-ff` in the serialized integration session.
9. Push master immediately.
10. Start the next dependent branch from the new master tip.

Do not merge G2 before active floor congruence. Do not merge G3 before active wall-upper occlusion. Do
not run G5 before visible practicals. Those are semantic dependencies, not scheduling suggestions.

## 20. Definition of done

This wave is complete only when:

- upstream versions, SHAs, and licenses are recorded;
- PolygonKernel is the only production boundary to third-party polygon libraries;
- all required fixtures and invariants pass;
- Earcut handles all production floor triangulation in the promoted path;
- annular and multi-tier floors preserve holes;
- the octagon's diagonal walls are straight, thick, capped volumes;
- apertures, wall mounts, collision, and render walls agree;
- every canonical floor cell has a valid bounded triangle mapping;
- walk inputs are unmodified and all staged citizens retain provenance;
- compare mode has run over a deterministic dungeon corpus;
- integrated frame-12/frame-19 captures have been inspected at gameplay size;
- performance and memory remain acceptable;
- legacy fallback has an explicit removal date or stabilization criterion;
- BVH and Manifold have evidence-based adopt/defer/reject rulings;
- shared handoff/design/index docs are updated once by the orchestrator after integration.

The artistic success criterion is simple: the player should see a coherent physical room whose floor,
walls, tiers, doors, fixtures, props, and figures all appear to inhabit the same place. The technical
success criterion is stricter: that room must be a deterministic, provenance-preserving projection of
the walk, not a beautiful replacement for it.
