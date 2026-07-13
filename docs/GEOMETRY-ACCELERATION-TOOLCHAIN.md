---
type: system-spec
project: Genesis
status: SPECCED
updated: 2026-07-12
audience: Claude orchestration sessions, graphics subagents, Codex art direction
parent: GEOMETRY-OSS-INTEGRATION.md
scope: geometry research, graphics diagnostics, procedural asset toolchain
---

# Geometry Acceleration Toolchain

## 0. Purpose and authority

This document is the executable research and implementation companion to
`GEOMETRY-OSS-INTEGRATION.md`. The parent spec defines the stable architecture: the walk remains
canonical, render geometry is a projection, third-party code sits behind Genesis-owned adapters, and
no library may rewrite rolled facts. This document defines how to evaluate, select, integrate, and
operate the public tools that can make that architecture arrive faster.

It answers four practical questions:

1. Which polygon stack should own floors, holes, tiers, offsets, and triangulation?
2. How do agents turn intermittent geometry and WebGL failures into minimal reproducible cases?
3. How can procedurally generated props become validated, compact, reusable assets without a human
   modeling pass?
4. Which visual effects are mature enough to evaluate without destabilizing the current renderer?

This is a buildable spec. Research agents must produce measurements, fixtures, captures, and explicit
adopt/defer/reject rulings. A README claim, star count, attractive demo, or agent opinion is not an
acceptance gate.

## 1. Executive decisions

### 1.1 Start immediately

Run these workstreams as isolated research units:

- a four-path polygon and wall-offset bakeoff;
- property-based geometry fuzzing with shrinking;
- development-only WebGL validation and frame capture;
- deterministic screenshot-region regression;
- a JSCAD versus Manifold procedural-prop bakeoff;
- a glTF optimization and validation spike for generated assets.

### 1.2 Do not decide prematurely

`GEOMETRY-OSS-INTEGRATION.md` names `polygon-clipping` plus Earcut as the conservative production
baseline. This document does not revoke that decision. It adds Clipper2 as a serious comparative
candidate because robust polygon offsetting could remove Genesis's custom corner-miter and wall-shell
math.

The bakeoff compares:

```text
P0  current legacy contour + ear clipping + current wall extrusion
P1  polygon-clipping floors + Earcut triangulation + current wall extrusion
P2  polygon-clipping floors + Earcut triangulation + Clipper2 wall offsets
P3  Clipper2 booleans + Clipper2 constrained triangulation + Clipper2 wall offsets
```

The winner may be a hybrid. No agent may force one library to own all operations merely to reduce the
dependency count.

### 1.3 Adopt as development tooling after a small compatibility spike

- [fast-check](https://github.com/dubzzz/fast-check) for generated geometry cases and shrinking;
- [webgl-lint](https://github.com/greggman/webgl-lint) for invalid WebGL usage, NaNs, unset uniforms,
  buffer-range errors, and shader failures;
- [Spector.js](https://github.com/BabylonJS/Spector.js) for frame command/state/texture inspection;
- [pixelmatch](https://github.com/mapbox/pixelmatch) for deterministic, region-scoped capture diffs.

All four are development-only. None ships in `genesis.html` or the production asset bundle.

### 1.4 Evaluate as build-time tools

- [JSCAD](https://github.com/jscad/OpenJSCAD.org) for approachable parametric solid recipes;
- [Manifold](https://github.com/elalish/manifold) for robust manifold booleans and mesh validation;
- [glTF Transform](https://github.com/donmccurdy/glTF-Transform) for reproducible glTF creation,
  repair, deduplication, pruning, welding, instancing, and optional compression;
- [Khronos glTF Validator](https://github.com/KhronosGroup/glTF-Validator) for specification-level
  asset validation;
- [meshoptimizer](https://github.com/zeux/meshoptimizer) only through an evaluated build-time glTF
  path, never as an assumed runtime dependency.

### 1.5 Defer visual-effect adoption

[N8AO](https://github.com/N8python/n8ao) is a credible SSAO candidate, but it changes the compositor's
render-pass arrangement and depth assumptions. Geometry, physical practicals, sprite depth writing,
and wall cutaways must be stable first. AO is a later A/B spike, not part of the geometry critical path.

### 1.6 Reject for this program

- `threejs/three-devtools`: archived and explicitly experimental;
- full procedural-dungeon generators: they compete with the walk rather than projecting it;
- runtime CAD/CSG for ordinary rooms;
- a new application framework, scene graph, bundler, or package manager;
- CDN dependencies;
- libraries with incompatible licensing or unverifiable source provenance;
- image-regression thresholds used as a substitute for art direction.

## 2. Research ledger

The table below is the initial ruling. Every `SPIKE` entry requires evidence before production use.

| Repository | Job | Runtime? | Initial ruling | Primary concern |
| --- | --- | --- | --- | --- |
| [polygon-clipping](https://github.com/mfogel/polygon-clipping) | polygon booleans, holes, multipolygons | candidate | BASELINE | no wall offset operation |
| [Earcut](https://github.com/mapbox/earcut) | triangulation with holes | candidate | BASELINE | not a boolean/offset engine |
| [Clipper2](https://github.com/AngusJohnson/Clipper2) | reference clipping, offsetting, triangulation | no direct JS runtime | REFERENCE | native upstream, needs port/WASM |
| [clipper2-ts](https://github.com/countertype/clipper2-ts) | JS booleans, offsets, CDT | candidate | SPIKE | young port, no tagged GitHub releases |
| [robust-predicates](https://github.com/mourner/robust-predicates) | reliable orientation/incircle tests | tiny candidate/dev | SPIKE | coordinate-sign convention |
| [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | accelerated ray/spatial queries | candidate | DEFERRED SPIKE | build/lifecycle may cost more than current AABBs |
| [fast-check](https://github.com/dubzzz/fast-check) | generated cases and shrinking | dev only | ADOPT AFTER SMOKE | isolated dependency resolution |
| [webgl-lint](https://github.com/greggman/webgl-lint) | invalid WebGL state detection | dev only | ADOPT AFTER SMOKE | must initialize before GL context |
| [Spector.js](https://github.com/BabylonJS/Spector.js) | frame capture and inspection | dev only | SPIKE | tagged release is old; MCP is newer source |
| [pixelmatch](https://github.com/mapbox/pixelmatch) | screenshot-region diffs | dev only | ADOPT AFTER SMOKE | cross-GPU false positives |
| [JSCAD](https://github.com/jscad/OpenJSCAD.org) | parametric solid recipes | build only | SPIKE | UV/material/export fidelity |
| [Manifold](https://github.com/elalish/manifold) | robust solid booleans | build only | SPIKE | WASM/tool complexity |
| [glTF Transform](https://github.com/donmccurdy/glTF-Transform) | glTF creation/optimization | build only | STRONG SPIKE | decoder/extension compatibility |
| [glTF Validator](https://github.com/KhronosGroup/glTF-Validator) | glTF spec validation | build only | ADOPT IF GLTF PATH | adds build tooling only |
| [meshoptimizer](https://github.com/zeux/meshoptimizer) | mesh optimization/compression | build + optional decoder | DEFER | compressed runtime requires decoder wiring |
| [KTX-Software](https://github.com/KhronosGroup/KTX-Software) | GPU texture compression | build + runtime loader | DEFER | separate sprite/texture program; determinism |
| [N8AO](https://github.com/N8python/n8ao) | SSAO/contact depth | renderer | LATER SPIKE | composer, gamma, AA, performance |

## 3. Repository-specific research notes

### 3.1 polygon-clipping

Use it for floating-point polygon union, intersection, difference, XOR, multipolygons, and holes. It is
the conservative floor-normalization candidate because its job is narrow and its output shape is easy
to hide behind `PolygonKernel`.

Research questions:

- Does it return byte-stable ring ordering after Genesis canonicalization?
- Does it preserve row-101 ring and arena topology under shuffled cell input?
- How does it behave on corner-touching regions and one-cell necks?
- Does repeated union/difference accumulate visible coordinate drift?
- Is its distributed ESM source small enough to vendor audibly?

Do not use its native nested arrays outside `PolygonKernel`.

### 3.2 Earcut

Use it for one outer contour plus zero or more holes. Three already relies on Earcut through
`ShapeUtils`, but Genesis should vendor or import it through a pure, Three-independent adapter so Node
geometry harnesses keep working.

Research questions:

- Are all normalized Genesis fixtures triangulated without zero-area output?
- Does triangle area equal surface area within the declared epsilon?
- Does it ever bridge a hole because ring ownership or winding is wrong?
- Is the resulting triangle distribution suitable for `cellTriangleMap`?
- Is vertex/triangle ordering stable after Genesis ring canonicalization?

Earcut is not responsible for repairing self-intersecting input. Validation and normalized booleans
must precede it.

### 3.3 Clipper2 and clipper2-ts

The upstream Clipper2 project is the reference implementation for polygon clipping, offsetting, and
triangulation. The TypeScript port exposes booleans, path inflation/deflation with join choices, and
constrained triangulation. Its repository reports a reference-derived test suite, but it is young and
has no tagged GitHub releases. Pin an exact commit if evaluated. Do not rely on a deprecated scoped npm
package name; verify the current unscoped package and source repository at spike time.

The important capability is offsetting:

```text
validated room boundary
  -> inner wall face
  -> outward offset by wall thickness
  -> outer wall face
  -> miter/bevel/round corner joins under a bounded miter limit
```

This could replace custom outer-face endpoint math and prevent:

- diagonal endpoint hooks;
- acute-corner spikes;
- gaps between adjacent wall volumes;
- overlapping outer faces at concave corners;
- mismatched cap and footing contours.

It also creates a new problem: polygon offsets do not automatically preserve Genesis segment IDs,
apertures, mount slots, or source provenance. The bakeoff must prove a deterministic correspondence
between each canonical inner segment and its outer offset run.

Candidate coordinate scale:

```js
const CLIPPER_SCALE = 4096;
const toClipper = (v) => Math.round(v * CLIPPER_SCALE);
const fromClipper = (v) => v / CLIPPER_SCALE;
```

Why 4096 is the starting candidate:

- grid cells and half-cell edges remain exact;
- one integer step is roughly `0.000244` world units;
- a 0.22-unit wall thickness resolves to roughly 901 integer units;
- expected room coordinates remain vastly below JavaScript's safe-integer limit.

The spike must compare 1024, 4096, and 65536 scales. It must report visible error, deterministic output,
overflow margin, execution time, and whether smoothing inputs gain any real benefit from the larger
scale. Do not silently hard-code the largest value.

Offset join candidates:

- miter for ordinary architectural corners, with a strict miter limit;
- bevel for acute or unstable corners;
- round only for intentionally curved profiles, never as a universal repair;
- butt/square handling for open runs where an aperture splits a wall.

### 3.4 robust-predicates

This library provides reliable orientation and in-circle tests that avoid ordinary floating-point
predicate failures. Use it for Genesis-owned validators and source-mapping logic, not to duplicate
Clipper or Earcut internals.

Candidate uses:

- consistent collinearity checks;
- segment-intersection classification;
- winding validation;
- corner convex/concave classification;
- triangle orientation checks;
- offset-run to source-segment correspondence.

The upstream API documents a Y-axis convention that differs from many mathematical coordinate systems.
Genesis uses `(x,z)` in a world plane. Create exactly one wrapper and calibrate it with explicit
clockwise, counterclockwise, and collinear fixtures. No production caller uses the upstream function
directly.

```js
export function orientXZ(a, b, c) {
  // Sign mapping is established by fixtures, not assumed from screen coordinates.
  return genesisSign * orient2d(a.x, a.z, b.x, b.z, c.x, c.z);
}
```

### 3.5 fast-check

Property-based testing attacks the exact failure pattern Genesis has experienced: a geometry function
works for hand-authored fixtures and fails on a rare generated combination. `fast-check` generates
inputs, runs invariants, records a replay seed, and shrinks a failure to a smaller counterexample.

This is development tooling only. It never rolls game content and never enters `genesis.html`.

Required custom arbitraries:

```js
connectedCellSetArbitrary(options)
tierAssignmentArbitrary(cells, options)
apertureArbitrary(cells, options)
terrainPatchArbitrary(cells, options)
shapeTransformArbitrary(options)
wallProfileArbitrary(options)
```

The connected-cell generator must grow from a seed cell by legal cardinal neighbors. Its shrinker must
prefer removing leaf cells while preserving any required connectivity. Do not generate arbitrary
coordinate arrays and discard 99% of them with a precondition; that produces weak exploration and poor
shrinking.

Persist every promoted failure as a plain regression fixture:

```json
{
  "id": "geo-regression-<content-hash>",
  "foundBy": "fast-check",
  "seed": 123456,
  "path": "4:2:1:0",
  "property": "triangle-area-equals-surface-area",
  "cells": [{"x":0,"z":0}],
  "tiers": {},
  "apertures": [],
  "profile": {},
  "expected": {},
  "firstSeenCommit": "<sha>"
}
```

Promoted fixtures become ordinary deterministic tests. CI should not depend solely on randomized runs.

### 3.6 webgl-lint

`webgl-lint` wraps WebGL calls and detects common invalid state, including undefined arguments, NaN
values, unset uniforms, out-of-range attribute access, shader compile/link failures, and contextualized
WebGL errors.

Genesis integration law:

- dev harness only;
- injected before the renderer creates its WebGL context;
- enabled by a diagnostic harness or explicit dev query flag, never by default;
- output captured to structured text/JSON with frame and fixture identity;
- zero lint errors required for the deterministic graphics corpus;
- performance measured with lint disabled.

Because the normal app uses a pinned vendored Three build, the smoke test must prove webgl-lint can wrap
the exact context created by `theater-boot.js` without changing renderer behavior.

### 3.7 Spector.js

Spector captures WebGL draw calls, shaders, textures, uniforms, blend/depth state, framebuffer state,
and object metadata for a frame. It supports vanilla WebGL and standalone browser use.

The repository's default branch also contains an MCP server intended to let AI tools load a URL,
capture frames, and inspect draw state. The latest tagged release shown by GitHub is substantially older
than the MCP source. Therefore treat these as two separate spikes:

1. stable browser/standalone frame capture;
2. pinned-source MCP integration in a scratch tool environment.

Do not vendor a moving default branch into production. For the MCP spike, record exact commit SHA,
Node version, build command, exposed capabilities, and any network/security assumptions.

Required capture metadata:

```js
object.__SPECTOR_Metadata = {
  genesisKind: "room-shell-wall-upper",
  roomId,
  segmentId,
  sourceRef,
  materialFamily
};
```

Three objects do not expose raw WebGL objects directly at authoring time, so the spike must determine
which renderer resources can be named usefully without coupling production code to Spector. It is
acceptable to start with draw-call/material/geometry group names from existing Three object names.

Required diagnostic questions for one bad frame:

- Which draw call first introduces the visual artifact?
- Is the geometry/index range valid?
- Which depth, blend, cull, and color-write state is active?
- Which texture and sampler state is bound?
- Are matrices/uniforms finite and expected?
- Is a post pass amplifying a source artifact?
- Does disabling one pass or object remove the issue?

### 3.8 pixelmatch

Pixelmatch is appropriate for deterministic, same-environment visual regression. It is not appropriate
for declaring two frames artistically equivalent across browsers, GPUs, operating systems, or driver
versions.

Use it only after stabilizing:

- seed;
- viewport and device scale;
- renderer resolution;
- camera and ShotPlan;
- animation clock;
- particle/mote state;
- exposure, grade, and post settings;
- font loading where UI is included.

Compare named regions instead of the entire application:

```text
board silhouette
floor topology
wall/stem silhouette
practical fixture region
subject readability region
sprite alpha/contact region
```

Every diff writes:

- actual PNG;
- expected PNG;
- diff PNG;
- region mask;
- mismatched-pixel count and ratio;
- threshold and antialias policy;
- renderer/browser/GPU metadata;
- structural sidecar metrics.

A changed golden requires a written reason and visual inspection. Agents may not overwrite goldens to
make a gate green.

### 3.9 JSCAD

JSCAD offers JavaScript primitives, transforms, extrusions, booleans, browser use, and Node/CLI use. It
could let Claude express semantic props quickly:

```js
const altar = union(
  cuboid({ size: [1.4, 0.8, 0.6] }),
  translate([0, 0.45, 0], cuboid({ size: [1.6, 0.12, 0.8] }))
);
```

The question is not whether JSCAD can make a solid. The question is whether it can produce Genesis-ready
low-poly assets with stable topology, material groups, flat normals, UVs, pivots, and semantic state
variants more cheaply than the existing recipe grammar.

Build-time only. No JSCAD runtime in the game.

### 3.10 Manifold

Manifold is the robustness comparator. Its strengths are solid booleans and manifold guarantees. Its
costs are WASM/tool integration and a lower-level authoring experience than JSCAD.

Evaluate three possible roles independently:

- authoring kernel;
- post-JSCAD validation/repair kernel;
- complex-recipe-only backend for arches, breaches, and ruins.

Do not assume one backend must author every prop.

### 3.11 glTF Transform

Genesis already vendors `GLTFLoader`, making glTF/GLB a plausible build artifact for generated props.
glTF Transform can create, edit, repair, optimize, and write glTF reproducibly. Useful operations include
prune, dedup, weld, flatten, join, instance, texture resizing/compression, and optional mesh compression.

Preferred role:

```text
semantic recipe
  -> JSCAD/Manifold/custom primitive geometry
  -> Genesis mesh interchange
  -> glTF Transform document
  -> prune/dedup/weld/normalize
  -> glTF Validator
  -> Genesis model QA
  -> promoted GLB + manifest entry
```

Do not enable Draco, Meshopt, WebP, or KTX2 merely because the CLI offers them. Every extension adds a
runtime decoder/loader requirement and a new failure surface. Begin with plain GLB and lossless cleanup.

### 3.12 glTF Validator

The Khronos validator emits JSON reports for glTF 2.0 conformance and asset statistics. If generated
props become GLB, validator errors are promotion blockers. Warnings are classified rather than ignored.

Store a compact validation receipt with each generated asset batch:

```json
{
  "asset": "gloom-sarcophagus-01.glb",
  "generatorCommit": "...",
  "validatorVersion": "...",
  "errors": 0,
  "warnings": 0,
  "triangles": 0,
  "vertices": 0,
  "materials": 0,
  "textures": 0
}
```

### 3.13 meshoptimizer

Meshoptimizer can improve vertex/index order, simplify meshes, and compress glTF geometry. It is mature
and MIT-licensed, but the relevant question is whether Genesis's generated low-poly props are large
enough to justify decoder and extension complexity.

Evaluate only through glTF Transform or `gltfpack` on a representative asset pack. Compare:

- raw GLB bytes;
- gzip transfer bytes;
- parse/decode time;
- first-render time;
- GPU memory;
- triangle/vertex count;
- visual output;
- additional vendored runtime code.

Do not add `EXT_meshopt_compression` until the pinned Three `GLTFLoader` path has a pinned compatible
decoder and browser harness.

### 3.14 KTX and Basis Universal

KTX2 can reduce transfer and GPU texture memory, but it belongs to a separate texture program. Genesis
sprites have alpha-edge, mip, palette, and readability requirements that are more important than raw
compression. KTX tooling also has settings whose output can vary with threading.

Defer until geometry and sprite citizenship are stable. Any later deterministic build must pin tool
versions and force deterministic encoder settings, including single-thread operation where necessary.

### 3.15 N8AO

N8AO is a Three-compatible SSAO pass emphasizing temporal stability and artist control. It can make
wall/floor/prop contact read more physically, but its vanilla integration replaces the normal render
pass, affects antialiasing choices, consumes depth, and requires correct gamma placement.

Prerequisites:

- all opaque shell and standee body geometry writes valid depth;
- translucent FX are classified separately;
- existing post order is documented and tested;
- physical practicals and exposure are stable;
- geometry captures are free of topology artifacts;
- a performance budget is available.

The A/B spike compares current material/contact darkening, Three's matching-version SSAO option if
available, and N8AO. It does not replace the entire composer.

## 4. Four-path geometry bakeoff

### 4.1 Shared input contract

Every path receives identical frozen plain data:

```js
{
  fixtureId,
  roomId,
  cells: [{ x, z, tier, isDoor, sourceRef }],
  terrain: [{ id, tier, cells, sourceRef }],
  apertures: [{ id, sourceEdgeRefs, width, state, sourceRef }],
  renderShape: "identity|octagon|radial|ellipse|cave",
  wallProfile: {
    thickness,
    stemHeight,
    capHeight,
    capOverhang,
    footing,
    miterLimit
  }
}
```

No path may mutate the input. Deep-freeze it in development runs and hash before/after.

### 4.2 Shared output contract

Normalize every path into:

```js
{
  surfaces: [{
    tier,
    polygons: [{ outer, holes, sourceCellKeys }],
    vertices,
    indices,
    triangleOwners
  }],
  walls: [{
    id,
    sourceSegmentRefs,
    innerA,
    innerB,
    outerA,
    outerB,
    joinStart,
    joinEnd,
    apertureIds,
    mountSlots
  }],
  cellTriangleMap,
  diagnostics,
  timings
}
```

Library-native types never enter reports or downstream comparison.

### 4.3 Required fixture classes

Use all fixtures from `GEOMETRY-OSS-INTEGRATION.md`, plus:

1. convex 45-degree corner with normal wall thickness;
2. convex acute corner near miter-limit threshold;
3. concave 90-degree corner;
4. concave 45-degree notch;
5. alternating convex/concave cave boundary;
6. doorway centered on a straight wall;
7. doorway touching a diagonal-to-straight join;
8. two adjacent apertures with a narrow pier;
9. full-width open edge;
10. wall-mounted sconce immediately beside an aperture;
11. octagon at minimum supported size;
12. octagon at representative grand-room size;
13. annular wall/railing around a pit;
14. multiple disconnected tier islands;
15. translated copies at large positive and negative coordinates;
16. shuffled equivalent inputs across at least 100 permutations;
17. tiny legal wall thickness;
18. maximum supported wall thickness;
19. intentionally malformed self-touching contour;
20. known S-hook regression captured from the production octagon.

### 4.4 Correctness scoring

Each path receives pass/fail and measured error for:

- floor area;
- triangle area;
- hole preservation;
- polygon count;
- tier coverage;
- input-order determinism;
- translation/rotation/reflection invariance;
- cell ownership completeness;
- boundary parity;
- aperture interval preservation;
- wall outer-contour validity;
- join spikes/gaps/overlap;
- mount/source correspondence;
- finite vertices/normals/UVs;
- stable segment IDs;
- typed failure behavior.

Any unbounded missing floor, filled hole, invalid index, NaN, source-identity loss, or aperture closure is
an automatic rejection for that operation.

### 4.5 Performance scoring

After warm-up, run at least 200 builds per fixture class and report:

```json
{
  "path": "P2",
  "fixture": "row-101",
  "iterations": 200,
  "inputCells": 0,
  "outputVertices": 0,
  "outputTriangles": 0,
  "medianMs": 0,
  "p95Ms": 0,
  "maxMs": 0,
  "heapDeltaBytes": 0,
  "vendorBytesRaw": 0,
  "vendorBytesGzip": 0
}
```

Run timing in a process separate from lint/fuzz instrumentation. Report machine, Node, browser, and
commit. Do not compare one warmed path with another cold path.

### 4.6 Wall offset source mapping

Clipper output is geometric; Genesis needs semantic segment identity. Evaluate two mapping strategies:

**Strategy A: whole-ring offset correspondence**

1. Offset the full validated ring.
2. For each output edge, project midpoint and direction onto candidate source segments.
3. Assign the source with parallel direction, bounded distance, and overlapping projected interval.
4. Classify unmatched edges as corner joins owned by the two adjacent source segments.
5. Split output runs at aperture projections.

**Strategy B: per-run offset plus library join polygons**

1. Preserve source segments and aperture splits first.
2. Offset each wall run as an open path.
3. Ask Clipper for bounded join/cap geometry.
4. Stitch adjacent runs under stable source IDs.

Strategy A is topologically cleaner. Strategy B may preserve source identity more naturally. Both must
be measured; neither is assumed.

### 4.7 Bakeoff ruling format

The geometry agent must conclude with operation-level decisions:

```json
{
  "booleanKernel": "polygon-clipping|clipper2-ts|legacy",
  "triangulator": "earcut|clipper2-cdt|legacy",
  "wallOffset": "clipper2-ts|genesis-segment-extrusion",
  "predicates": "robust-predicates|genesis",
  "rejected": [{"choice":"...","reason":"...","evidence":"..."}],
  "fixtures": {"passed":0,"failed":0},
  "performance": {},
  "requiredFollowups": []
}
```

The likely hybrid P2 is not preselected. Evidence decides each field independently.

## 5. Property-based geometry program

### 5.1 Required properties

At minimum, test:

```text
union area = number of unique cells
union is idempotent
union input order does not matter
normalization is idempotent
translation preserves topology and area
quarter-turn rotation preserves topology and area
reflection preserves topology and flips only expected winding
triangulated area = normalized polygon area
triangle centroids are inside outer and outside holes
all indices are valid
all vertices are finite
all canonical floor cells map to bounded triangles
no noncanonical cell gains ownership
apertures remove exactly their intervals
wall offset contains the inner wall envelope where expected
offset output has no self-intersection
offset distance stays within quantization tolerance
compile does not mutate input
same seed and input produce byte-identical normalized output
typed invalid input never causes an unclassified crash or blank result
```

### 5.2 Generator bands

Run separate bands so difficult cases are not drowned by rectangles:

- `small-exhaustive`: 1-12 cells in a tight coordinate box;
- `concavity-heavy`: forced notches and narrow necks;
- `holes-heavy`: ring and multiple-hole arrangements;
- `tiers-heavy`: 2-4 nested/adjacent tiers;
- `apertures-heavy`: doors at corners, joins, and narrow piers;
- `shape-heavy`: octagon/radial/cave render transforms;
- `large-production`: representative maximum rooms;
- `invalid-input`: duplicates, disconnected metadata, self-touching transforms, bad apertures.

### 5.3 Run modes

```text
PR smoke:       fixed seeds, promoted regressions, 500 generated cases
nightly/local:  fixed seed ledger, 25,000 generated cases
bug hunt:       supplied seed/path, verbose shrinking
release gate:   promoted regressions + 100,000 cases across bands
```

The exact counts may be tuned after measuring runtime, but no agent lowers them merely to make a slow
implementation appear acceptable.

### 5.4 Failure handling

On failure:

1. preserve seed and shrink path;
2. write the minimal case to a temporary report;
3. confirm it fails outside fast-check in a deterministic one-case harness;
4. classify library bug, adapter bug, invalid-generator bug, or underspecified policy;
5. add a promoted regression fixture for real product defects;
6. fix red-first;
7. rerun the original seed and full promoted corpus.

Never patch a generator to stop producing a valid room that exposes a bug.

## 6. WebGL diagnostic implementation

### 6.1 Dedicated harness

Create one harness rather than sprinkling debug imports through production:

```text
dev/graphics-debug/
  README.md
  capture-webgl-diagnostics.mjs
  fixtures/
  reports/                 # generated/ignored unless a reviewed receipt is intentionally committed
```

The harness:

1. launches the existing localhost app;
2. injects webgl-lint before context creation;
3. optionally injects Spector before context creation;
4. loads a deterministic room/encounter fixture;
5. freezes clock/tweens/particles;
6. waits for renderer and texture readiness;
7. renders one named frame;
8. captures console, WebGL-lint output, renderer info, and optional Spector JSON;
9. writes a screenshot and structured receipt;
10. exits nonzero on unapproved GL errors.

### 6.2 Diagnostic receipt

```json
{
  "fixtureId": "row101-integrated",
  "commit": "...",
  "browser": "...",
  "gpu": "...",
  "renderer": "...",
  "canvas": {"width":0,"height":0,"pixelRatio":0},
  "drawCalls": 0,
  "triangles": 0,
  "textures": 0,
  "programs": 0,
  "webglLint": {"errors":[],"warnings":[]},
  "spector": {"capturePath":"...","commands":0},
  "postPasses": [],
  "screenshot": "..."
}
```

### 6.3 First diagnostic corpus

- row-101 ring/pit integrated scene;
- octagon with diagonal doorway;
- wall upper fading across a camera move;
- physical wall-mounted practical;
- opaque standee plus translucent FX overlap;
- bloom-only emissive fixture beside bright diffuse stone;
- maximum dressing/cover/centerpiece room;
- known sprite alpha/depth regression fixture.

### 6.4 Spector MCP feasibility gate

The MCP spike succeeds only if an agent can:

1. start the pinned Spector MCP server from an isolated tool directory;
2. connect from the supported agent environment;
3. load the local Genesis URL;
4. capture a requested frame;
5. identify named draw calls, shaders, textures, and depth/blend state;
6. export a durable JSON artifact;
7. do so without modifying or weakening app security/runtime behavior.

If the current Claude environment cannot connect to the MCP server, retain Spector as a standalone
capture tool. Do not block geometry work.

## 7. Capture-regression implementation

### 7.1 Golden hierarchy

Use three kinds of evidence:

1. **structural metrics**: area, holes, wall segments, mapped cells, draw calls;
2. **pixel regions**: localized Pixelmatch comparisons under a fixed environment;
3. **art-direction reads**: human/Codex visual judgment against mock targets.

No layer replaces another.

### 7.2 Region masks

Masks must be generated from known fixture coordinates or stable screen-space boxes, not hand-painted
after a failure. Store mask definitions as data:

```json
{
  "fixtureId": "octagon-door",
  "regions": [
    {"id":"diagonal-wall","rect":[120,80,240,180],"threshold":0.08,"maxRatio":0.01},
    {"id":"floor-hole","rect":[280,180,160,120],"threshold":0.05,"maxRatio":0.005}
  ]
}
```

### 7.3 Cross-GPU policy

Exact goldens are authoritative only on the recorded reference environment. Other environments use:

- structural metrics;
- wider perceptual thresholds;
- silhouette/alpha masks;
- explicit warning rather than automatic golden replacement.

Changes to color grading, lights, or textures can legitimately alter many pixels. Geometry-specific
gates should compare silhouettes, depth edges, and topology regions wherever possible.

## 8. Procedural prop bakeoff

### 8.1 Common semantic input

Both JSCAD and Manifold receive the same Genesis recipe:

```json
{
  "slug": "gloom-sarcophagus-01",
  "nounClass": "sarcophagus",
  "seed": "fixture-seed",
  "dimensions": [1.6,0.8,0.65],
  "footprintCells": [2,1],
  "pivot": "floor-center",
  "facing": "+z",
  "parts": ["body","lid","handles","inset"],
  "states": ["closed","open","broken"],
  "materialSlots": ["stone","metal","emissive-inset"],
  "collisionClass": "solid-cover",
  "sourceRef": "prop-fixture:sarcophagus"
}
```

### 8.2 Required sample family

Generate the same assets in both systems:

1. arched doorway with wall-depth opening;
2. sarcophagus with removable lid;
3. broken column with intact/fallen/shattered states;
4. altar with inset rune plate;
5. brazier with separate emissive/flame mount;
6. bookshelf with carcass and shelf material groups;
7. rubble wall with collision-valid footprint;
8. stairs with exact riser/tread dimensions;

These cover booleans, repeated parts, state variants, mounts, materials, collision, and architectural
alignment.

### 8.3 Required output

```js
{
  positions,
  normals,
  uvs,
  indices,
  materialGroups,
  bounds,
  pivot,
  mountSlots,
  collisionHull,
  stateParts,
  diagnostics
}
```

No backend-specific object enters the asset manifest.

### 8.4 Evaluation criteria

Score:

- recipe source lines and conceptual complexity;
- deterministic output hash;
- boolean robustness;
- manifold/watertight result;
- degenerate triangles and duplicate vertices;
- flat/smooth normal control;
- UV generation effort;
- material-group preservation;
- state-variant reuse;
- pivot/facing correctness;
- triangle/vertex count;
- build time and tool startup;
- conversion complexity to Three and glTF;
- visual quality at gameplay distance;
- ease of adding a ninth semantic noun without backend expertise.

### 8.5 Possible rulings

- JSCAD authors all, Manifold validates complex assets;
- custom Genesis primitive grammar authors simple props, Manifold authors complex booleans;
- JSCAD authors collision/solid skeletons, Genesis adds material/UV layers;
- Manifold alone;
- neither: improve the existing recipe grammar instead.

The bakeoff may reject both. The goal is faster reliable production, not tool adoption.

## 9. Generated glTF pipeline

### 9.1 Initial uncompressed path

```text
recipe JSON
  -> backend-neutral mesh bundle
  -> glTF Transform Document
  -> canonical node/mesh/material naming
  -> weld within semantic part boundaries
  -> dedup identical data
  -> prune unused nodes/materials/textures
  -> compute/validate bounds
  -> write GLB
  -> Khronos validation
  -> Genesis model QA capture
  -> manifest promotion
```

Do not join meshes across state-part, material, mount, collision, or occlusion boundaries merely to
reduce draw calls.

### 9.2 Naming contract

```text
node:     <slug>/<state>/<part>
mesh:     <slug>:<part>
material: <realm>:<family>:<channel>
mount:    mount:<kind>:<id>
```

Stable names let `GLTFLoader`, diagnostics, state swaps, and Spector receipts refer to semantic parts.

### 9.3 Validation gates

- glTF Validator errors = 0;
- no unexpected validator warnings;
- finite normalized normals;
- UVs in declared policy range;
- index buffers valid;
- bounds match recipe dimensions within tolerance;
- pivot sits on expected floor/world origin;
- facing matches Genesis `+z` law;
- material count bounded;
- no unlicensed external URI;
- no unused buffer views/nodes/materials;
- loader smoke test under pinned Three;
- deterministic build hash under pinned toolchain;
- in-engine capture inspected.

### 9.4 Compression decision

After a representative pack exists, compare:

```text
plain cleaned GLB
plain cleaned GLB + HTTP/gzip characteristics
Meshopt GLB
Draco GLB
```

Prefer no mesh compression for tiny independent props if decoder cost and complexity exceed transfer
savings. Instancing and deduplication may matter more than codec choice.

## 10. AO and contact-depth spike

This is explicitly downstream of geometry and practicals.

### 10.1 Compared paths

```text
A0 current boundary/riser/contact darkening
A1 pinned-Three SSAO pass, if compatible and available
A2 N8AO in the existing composer
```

### 10.2 Fixtures

- thick capped near wall;
- far-wall corner;
- stair/riser stack;
- column on floor;
- rubble pile;
- standee plinth/contact;
- alpha-tested sprite edge;
- translucent smoke/fire negative control;
- dark Gloom and bright Fantasy profiles.

### 10.3 Acceptance

- contact improves at gameplay size;
- no halos around sprites or cutaway edges;
- no depth bleed through holes/apertures;
- no double gamma;
- no temporal crawl during camera tween;
- no material-class darkening that destroys sprite readability;
- no bloom interaction regression;
- desktop and mobile performance within budget;
- pass can be disabled cleanly per profile.

## 11. Dependency and tool isolation

Genesis does not become an npm application because research tools use npm packages.

### 11.1 Scratch tool home

Follow the existing jsdom precedent with an overrideable tool home:

```text
GEOMETRY_TOOLS_HOME=${GEOMETRY_TOOLS_HOME:-$HOME/.genesis-geometry-tools}
```

The implementation unit creates a pinned package manifest and lockfile in the scratch environment or a
small repo-owned setup script that materializes it there. Do not commit a root `node_modules` or rewrite
the app architecture.

Harnesses resolve tools with `createRequire` from the configured home, mirroring existing jsdom tools.

### 11.2 Reproducibility receipt

Every report includes:

```json
{
  "node": "...",
  "platform": "...",
  "toolHome": "...",
  "packages": {
    "fast-check": {"version":"...","integrity":"..."},
    "pixelmatch": {"version":"...","integrity":"..."}
  },
  "upstreamCommits": {},
  "licenses": {}
}
```

### 11.3 Runtime vendoring

Only the selected production polygon components are vendored into `vendor/`. Dev tools remain external
to the shipping app. Build-time asset tools remain pinned development dependencies or executable tools,
not browser imports.

## 12. Security and licensing gate

Before adoption:

1. verify official repository and package ownership;
2. pin exact version and commit;
3. preserve license and third-party notices;
4. review transitive dependencies;
5. avoid lifecycle scripts where not required;
6. record package integrity hashes;
7. keep MCP servers local and scoped to the needed localhost URL/files;
8. do not expose game saves, private repositories, or unrelated filesystem paths;
9. do not permit diagnostic tooling in release builds;
10. review commercial redistribution obligations.

Current research indicates permissive or public-domain-style licenses for the strongest candidates, but
the implementing agent must verify the exact pinned artifact. The Clipper2 TypeScript port uses Boost
Software License 1.0; the upstream Clipper2 license and third-party notices must also be retained.

## 13. Multi-agent execution plan

### 13.1 Current parallel-work constraint

At specification time, separate Claude worktrees are active for floor congruence, wall-upper occlusion,
and visible practicals. Research units must not edit their production files. Start with new fixture,
spike, report, and harness paths. Production integration waits until prerequisites land and branches are
rebased from the new master tip.

### 13.2 Agent graph

```text
R0 dependency ledger + tool bootstrap
  |\
  | +--> R2 property-fuzz harness --------+
  |                                      |
  +----> R1 four-path geometry bakeoff --+--> R6 production selection spec/amendment
  |                                      |
  +----> R3 WebGL diagnostics ------------+--> R7 integrated diagnostic corpus
  |
  +----> R4 Pixelmatch capture regions ---+
  |
  +----> R5 JSCAD/Manifold prop bakeoff --> R8 glTF pipeline --> model QA

Geometry/practicals prerequisites land -------------------------------> R7
Geometry stable ------------------------------------------------------> R9 AO spike
```

R1, R2, R3, R4, and R5 may work in parallel only because their ownership paths are separate. R6-R9 are
serialized integration units.

### 13.3 R0: dependency ledger and bootstrap

Ownership:

- new tooling setup/runbook paths;
- package/version/license ledger;
- no production source.

Deliverables:

- exact repository, package, release/tag, commit, license, integrity, and source-size data;
- scratch-tool bootstrap instructions;
- one import smoke test per dev tool;
- no root application package conversion.

### 13.4 R1: four-path geometry bakeoff

Ownership:

- `dev/geometry-research/` or equivalent new spike paths;
- adapters used only by the spike;
- reports and deterministic fixtures;
- no production room-shell integration.

Deliverables:

- P0-P3 implementations behind common test interface;
- all fixtures and metrics from section 4;
- offset source-mapping comparison;
- operation-level ruling JSON;
- report with known risks.

### 13.5 R2: property-fuzz harness

Ownership:

- generated-case harness and arbitraries;
- promoted geometry regression fixture directory;
- no production edits.

Deliverables:

- custom connectivity-preserving generators/shrinkers;
- property suite;
- fixed seed ledger;
- at least one red-first demonstration against a deliberately faulty adapter or known legacy defect;
- promoted minimal fixture workflow.

### 13.6 R3: WebGL diagnostics

Ownership:

- `dev/graphics-debug/` new paths;
- tooling bootstrap additions coordinated with R0;
- no permanent app boot import.

Deliverables:

- webgl-lint injection smoke;
- Spector standalone capture;
- MCP feasibility receipt;
- one known scene diagnostic report;
- proof diagnostics are absent from release boot.

### 13.7 R4: capture-region regression

Ownership:

- Pixelmatch harness;
- region-mask data;
- generated diff output policy;
- no art golden changes outside assigned fixtures.

Deliverables:

- frozen deterministic capture mode;
- at least three region-specific comparisons;
- cross-GPU metadata policy;
- red-first one-pixel/topology mutation demonstration.

### 13.8 R5: procedural backend bakeoff

Ownership:

- isolated prop-research directory;
- common semantic recipes;
- JSCAD and Manifold adapters;
- generated samples/reports, not production assets.

Deliverables:

- eight sample assets from section 8;
- backend-neutral mesh outputs;
- comparative authoring/robustness/performance report;
- recommended backend split;
- no runtime dependency.

### 13.9 R6: production geometry selection

Prerequisites:

- R1 and R2 complete;
- floor congruence landed;
- wall-upper occlusion landed;
- latest master integrated into branch.

Ownership:

- an amendment to `GEOMETRY-OSS-INTEGRATION.md` recording selected operation owners;
- exact implementation units and migration order;
- no broad production code unless separately assigned.

### 13.10 R7: integrated diagnostic corpus

Prerequisites:

- R3 and R4 complete;
- physical practicals and wall occlusion landed;
- selected geometry path available behind compare mode.

Deliverables:

- full deterministic scene corpus;
- WebGL-lint zero-error gate;
- Spector evidence for at least one artifact investigation;
- region diffs plus structural metrics;
- inspected screenshots.

### 13.11 R8: generated glTF production path

Prerequisites:

- R5 backend ruling;
- representative asset approved visually;

Deliverables:

- backend-neutral mesh-to-glTF converter;
- pinned glTF Transform pipeline;
- Khronos validation receipt;
- pinned Three loader smoke;
- one promoted prop family only;
- rollback path to existing recipe asset.

### 13.12 R9: AO spike

Prerequisites are section 3.15. This is explicitly nonblocking.

## 14. Subagent task packet

Every research agent receives:

```text
You own Genesis acceleration unit <R#> only.

Read:
1. CLAUDE.md
2. docs/HANDOFF.md
3. docs/GEOMETRY-OSS-INTEGRATION.md
4. docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md sections <...>

Starting master SHA: <sha>
Worktree/branch: <path> / <branch>
Exclusive paths: <paths>
Forbidden paths: active-agent and production paths not named above

Requirements:
- perform research against pinned source, not README claims alone;
- preserve walk/canonical inputs byte-for-byte;
- create red-first proof for each claimed gate;
- keep third-party types behind adapters;
- write reports with raw fixture sizes and timings;
- stage explicit paths only;
- commit one scoped unit;
- report commit, changed paths, tests, pass/fail counts, evidence paths, licenses, versions, and risks;
- do not merge master;
- do not update shared handoff/index/change docs.
```

## 15. Orchestrator review checklist

For each unit, the orchestrator personally verifies:

- branch starts from declared master SHA;
- no active-agent file collision;
- dependency provenance and license;
- adapter boundary respected;
- fixtures are truths, not snapshots of bugs;
- red-first proof is genuine;
- benchmark warm-up and sample sizes are fair;
- output is deterministic where claimed;
- failures are not excluded by weakening generators;
- reports include machine/tool metadata;
- captures are opened and read;
- generated GLB is validator-clean if applicable;
- production bundle excludes dev tools;
- rollback/fallback exists;
- `python3 build/check-manifest.py` ends `RESULT: OK` after any module edit;
- relevant existing geometry, combat-cell, occlusion, practical-light, sprite, and loop gates remain
  green after integration.

## 16. Merge sequence

Recommended order:

1. R0 tooling ledger/bootstrap;
2. R1-R5 independent spike units in any safe serialized merge order;
3. R6 selection amendment;
4. production PolygonKernel implementation from the parent spec;
5. selected wall-offset/source-mapping implementation if earned;
6. R7 integrated diagnostic corpus;
7. R8 one-family glTF production pilot;
8. R9 AO spike.

Do not merge experimental vendor code into runtime merely to make it available to another spike. Keep
spike dependencies in the scratch tool environment or quarantined research paths until selected.

## 17. Stop conditions

Stop and reject a candidate when:

- licensing is incompatible or unclear;
- deterministic builds cannot be achieved;
- a valid canonical fixture is dropped or rewritten;
- holes, tiers, or apertures are not representable;
- source-segment identity cannot be recovered within bounded rules;
- the candidate requires a renderer/framework migration;
- runtime size/lifecycle exceeds demonstrated benefit;
- a dev tool changes release behavior;
- a procedural backend cannot preserve pivots, material groups, or state parts;
- compression requires unplanned runtime decoders for negligible savings;
- AO introduces halos, temporal crawl, readability loss, or unacceptable frame cost.

Rejecting a library is a successful research outcome when the evidence is durable.

## 18. Definition of done

The acceleration research program is complete when:

- P0-P3 are compared on the full deterministic and generated fixture corpus;
- booleans, triangulation, wall offsets, and predicates each have an evidence-backed owner;
- every valid fuzz failure shrinks and can be promoted as a regression fixture;
- WebGL-lint can run before Genesis context creation and produces zero errors on the corpus;
- Spector can produce an actionable standalone frame capture, with MCP adopted or explicitly deferred;
- Pixelmatch produces region-scoped diffs without becoming a cross-GPU false-authority;
- JSCAD and Manifold are compared on identical semantic recipes;
- the generated-asset backend split is decided;
- one generated GLB passes glTF Validator and the pinned Three loader, if glTF is selected;
- compression remains off or has measured decoder-aware justification;
- the AO candidate is deferred or judged against stable geometry with measured captures;
- all decisions are recorded with versions, SHAs, licenses, timings, fixtures, and rejection reasons;
- no research tool ships in production unintentionally;
- the walk remains canonical and every visual result remains a provenance-preserving projection.

The program succeeds when agents spend less time guessing at malformed screenshots and more time
working from minimal geometry fixtures, captured GPU state, validated assets, and measured operation
boundaries. The libraries are accelerators. Genesis's walk, semantics, and visual direction remain the
engine.
