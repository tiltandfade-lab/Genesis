---
type: system-spec
project: Genesis
status: SPECCED
updated: 2026-07-12
audience: Claude orchestration sessions, graphics subagents, Codex art direction
parents: GEOMETRY-ACCELERATION-TOOLCHAIN.md, STAGE-C-ART-DIRECTION-REVIEW.md
scope: reference rendering, UVs, atlases, telemetry, procedural distribution, transparency, materials
---

# Graphics Production Research Wave

## 0. Intent

This wave shortens the distance between the current procedural diorama and the vision renders. It is
not a package shopping list and it does not replace the walk. Each candidate must either improve a
measured visual-production bottleneck or leave the engine untouched.

The central architecture remains:

```text
roll tables -> walk facts/cards -> semantic projection -> visual realization -> render scene
```

Research tools may improve only the last two arrows. They may distribute already-selected incidental
objects, bake assets, report GPU cost, or create a high-quality reference image. They may not reroll,
delete, rename, or reinterpret narrative facts. A canonical card that cannot fit visually remains in
the walk and remains narratable.

There is no human graphics-production lane. Therefore every adopted technique must be:

- deterministic from committed inputs and an explicit algorithm version;
- runnable by Codex or Claude without GUI painting or mesh cleanup;
- guarded by machine checks plus fixed-camera captures;
- reversible behind a Genesis-owned adapter;
- able to explain provenance from a rendered object back to its roll/card/source asset.

## 1. Executed compatibility baseline

The research lab is `dev/graphics-research/`. Candidate packages live in a disposable scratch install,
never in the production import map. `toolchain.json` pins the exact experiment:

| Candidate | Pin | Research role | Initial ruling |
| --- | ---: | --- | --- |
| Three.js | 0.166.0 | Match Genesis runtime | Required baseline |
| three-gpu-pathtracer | 0.0.23 | Offline visual oracle | Adopt spike with adapter |
| three-mesh-bvh | 0.7.4 | Path-tracer acceleration | Dev-only transitive pin |
| xatlas-web | 0.1.0 | UV unwrap engine | Build-time spike |
| xatlas-three | 0.2.1 | Three geometry adapter | Defer pending worker capture |
| stats-gl | 4.2.3 | Whole-frame telemetry cross-check | Dev harness only |
| potpack | 2.1.0 | Deterministic atlas layout | Adopt prototype |
| poisson-disk-sampling | 2.3.1 | Incidental spatial distribution | Adopt realization spike |
| three-wboit | 1.0.15 | Transparent FX experiment | Defer; never whole-scene |
| sharp | 0.35.3 | Image assembly candidate | Reject for now; keep Pillow |

Executed on Node 22.15.0:

- all ten exact pins resolve and import beside Three r166;
- a normal box produces 24 path-tracer position vertices;
- a two-copy `InstancedMesh` also produces only 24, proving instances are not preserved;
- `xatlas-three.UVUnwrapper` imports in Node, but its actual unwrap needs WASM/worker resources and
  indexed geometry, so an import is not an execution proof;
- a deterministic six-item Potpack fixture occupies 70.08% of a 614x904 page with no overlaps;
- the Poisson fixture produces 24 deterministic points, minimum separation 0.70094 cells, while
  preserving the center CLEAR and doorway apron exclusions.

Re-run:

```sh
node dev/graphics-research/verify-toolchain.mjs
node dev/graphics-research/verify-layout-probes.mjs
```

## 2. R1: Path-traced reference oracle

### 2.1 Purpose

The oracle renders the same generated room with slower, physically coherent light transport. It is a
diagnostic target, not a replacement runtime. The raster renderer should approach its value hierarchy,
contact, material separation, and light motivation using cheaper techniques.

### 2.2 Scene extraction

`window.Theater._graphicsResearchContextForTest()` exposes the exact live scene, camera, renderer,
composer, interior group, and post suite to a harness. The harness must clone into a research scene;
it must not mutate live objects.

The adapter performs these steps in order:

1. Traverse only the active interior subtree and approved lights.
2. Expand every `InstancedMesh` into ordinary meshes by multiplying each instance matrix by the
   source object's world matrix. Clone shared geometry once per geometry/material compatibility key.
3. Convert interleaved attributes to ordinary `BufferAttribute` arrays.
4. Ensure indexed triangles, normals, and finite transforms. Reject NaNs and zero-area geometry.
5. Preserve standard/physical material color, roughness, metalness, maps, normal maps, alpha test,
   emissive color/intensity, and side policy. Record every approximation.
6. Keep alpha-tested sprite cards as cutouts. Do not reinterpret them as translucent sheets.
7. Map diegetic fixtures to their real point/spot lights. Do not invent floating oracle lights.
8. Render the live camera and one inspection camera at fixed seeds/sample counts.

The executed instancing probe makes step 2 mandatory. Directly passing Genesis's scene to
`PathTracingSceneGenerator` silently omits copies and produces a dishonest room.

### 2.3 Comparison output

For each flagship realm, emit a five-panel contact sheet:

```text
raster shipped | raster neutral post | path trace | false-color normals | absolute difference
```

The report also records camera matrices, light list, material approximation list, samples, elapsed
time, package pins, source commit, and scene inventory. The oracle is successful when it identifies
specific raster work such as missing contact shadow, weak wall cap separation, excessive ambient fill,
or flat normal response. “The path trace is prettier” is not an actionable result.

### 2.4 Gate

Adopt as a recurring dev gate only if all active geometry appears, alpha silhouettes remain correct,
two repeated runs are pixel-stable within the sampler tolerance, and at least three raster corrections
can be named from the first three flagship comparisons. Runtime inclusion is forbidden.

## 3. R2: Automatic UV unwrap and procedural materials

### 3.1 Ownership

UV unwrap is build-time only. Runtime room-shell generation continues to use procedural/triplanar or
known authored UVs. xatlas may process generated reusable props and baked room-shell fixtures, never a
live walk during play.

Input contract:

- indexed `BufferGeometry` only;
- finite position and normal attributes;
- topology validated before unwrap;
- stable geometry recipe/version/source hash;
- clone before unwrap because xatlas may add/reorder vertices;
- remap every non-position attribute through returned old-index provenance;
- output UV channel and atlas dimensions recorded in metadata.

The worker/browser spike must actually load `xatlas.wasm`, unwrap a box, an L-room shell, a beveled
fixture, and a deliberately non-indexed negative control. Node import success alone does not pass.

### 3.2 Material production

Material Maker is an optional offline compiler because it supports `--export-material`, but adoption
requires a pinned executable and `.ptex` graph to export without GUI interaction on the supported
machine. Until then, Genesis's deterministic JS/Pillow material recipes remain canonical.

A CC0 64x64 single-channel blue-noise tile may be introduced for offline albedo/normal microvariation
and quantization dithering. It must not restore the retired screen-space PSX dither. Preserve histogram
mean, cap amplitude, record source/license, and hash generated outputs.

## 4. R3: Sprite and dressing atlases

### 4.1 Honest goal

Genesis currently owns roughly 1,264 cut sprite/dressing PNGs and allocates one color material per
mounted card plus a depth material for shadow-casting cards. An atlas can reduce requests, decodes,
texture cache entries, and binds. It cannot reduce draw calls while every card remains a separate mesh
and material. No report may claim batching from atlas packing alone.

### 4.2 Atlas contract

- deterministic slug ordering, no rotation, maximum 4096x4096 pages;
- separate pages for creature cutouts, dressing cutouts, additive FX, and alpha-depth policy;
- four physical pixels of padding around each source;
- nearest-opaque RGB dilation into transparent gutter pixels while retaining alpha zero;
- straight RGBA, `premultiplyAlpha=false`, no mipmaps for current cutout policy;
- source aspect and floor pivot derive from source dimensions, never padded dimensions;
- Three V coordinates account for top-left image coordinates;
- metadata includes page, pixel/content rectangles, source size/hash, UV bounds, gutter, filters,
  alpha mode, packer version, and digest;
- output names digest every source hash and packing option;
- Pillow remains the assembler because it already owns slicing/defringe and avoids a second native
  image stack. Reconsider Sharp only after a measured Pillow bottleneck.

### 4.3 Phase separation

Phase A builds atlases and changes texture lookup only. It records requests, decode/upload time,
resident texture bytes, texture count, draw calls, and FPS before/after.

Phase B is a separate instancing design. It needs one `InstancedMesh` per page/render-state family,
per-instance transform/UV/tint/opacity/visibility attributes, a matching alpha-tested depth shader,
and verb/guise updates through attributes instead of material clones. It may proceed only after Phase A
shows useful delivery savings and its architecture preserves animation, guise swaps, death state,
shadows, tint, and selection feedback.

Atlas gate: byte-identical builds, exact RGBA extraction, no overlap, pages at least 70% occupied,
allocated RGBA no more than 1.25x source RGBA, zero fringe on black/white/realm backgrounds, and no
claim of draw-call reduction without `renderer.info.render.calls` evidence.

## 5. R4: GPU telemetry

### 5.1 Measurement law

Existing synchronous FPS loops measure CPU command submission, not completed GPU work. The telemetry
harness uses `EXT_disjoint_timer_query_webgl2` asynchronously, checks availability, and discards every
window where `GPU_DISJOINT_EXT` is true. It never calls `gl.finish()`.

Instrument the live composer passes:

```text
RenderPass -> DoF -> UnrealBloomPass -> Grade -> OutputPass
```

Temporarily wrap each pass's `render` in the Puppeteer page. Record GPU p50/p95/max, CPU submission
p50/p95, query/discard counts, renderer calls/triangles/resources, target sizes/formats, Chrome/GL
identity, extension support, DPR, and whether the renderer is SwiftShader. Software-rendered runs are
correctness evidence only, never the performance baseline.

Use `stats-gl` in a separate run as a whole-frame cross-check. Do not nest its timer query around the
per-pass queries.

### 5.2 Fixtures and budgets

Use the existing 1600x1000 DPR 1 fixed `ps-gloom` scene. Freeze camera/time/flicker/tweens after
settlement, warm 30 frames, and collect at least 120 completed samples. Report direct render,
render+output, cumulative pass variants, and full chain.

The initial target is full-chain GPU p95 at or below 16.7 ms on the named reference GPU. A candidate
effect must state its incremental p95 budget before implementation; transparent OIT receives at most
2 ms at this resolution.

`_graphicsResearchInventoryForTest()` is the JSON-safe resource census. It separates object/mesh/
instance counts, unique material/texture counts, material policies, renderer submissions/resources,
and post-suite state so changes cannot hide a tradeoff in a single FPS number.

## 6. R5: Poisson visual realization

### 6.1 Architectural seam

Seeded Poisson distribution runs after `dressPlan` and projected canonical cards are concatenated in
`src/engine/theater-data.js`, before `interiorBuildBoard`. At that point nouns, counts, source refs,
home rooms, canonical anchors, and overloaded-room decisions are frozen.

It may:

- reposition incidental filler inside a legal room region;
- distribute visual representatives around a canonical group anchor;
- add sub-cell variation to already-selected objects.

It may not move canonical anchors; place doors, columns, paintings, torches, rugs, pew rows, focal
pieces, furniture, or blockers; generate counts from area; or consume the noun-selection RNG stream.

Seed each entry independently:

```text
hash("place-realize:v1:" + walkId + ":" + roomSegNum + ":" +
     (sourceRef || slug + ":" + originalOrdinal))
```

Adding one card must not move unrelated realizations.

### 6.2 Legal region

Start from true `room.cells`, intersect floor cells, and erode by half the object footprint plus 0.08
cell. Subtract door cells, swing cells, one-cell aprons, widened shortest-door paths, template aisles,
focal approaches, canonical footprints, combat occupants, columns, furniture, hazards, pits,
interaction sockets, and the existing generic center 2x2 CLEAR.

Counts continue to come from role budgets. Suggested minimum radii are small 0.28, medium 0.42, large
0.70 cells, increased by footprint. Failure to fit means fewer visual representatives; the canonical
card remains. Never collapse radius until objects overlap.

Every realization carries `sourceRef`, `realizationIndex`, `realizationSeed`, `algorithmVersion`,
`anchor`, and `regionKind`. Gates prove noun/count/home identity before/after, deterministic same seed,
different positions but same nouns for a changed seed, polygon containment, pairwise clearance, zero
CLEAR violations, and active-room p95 below 2 ms.

## 7. R6: Transparency and WBOIT

### 7.1 Fix classification before algorithms

The renderer has three distinct classes:

- alpha-tested cutouts: sprites/dressing; keep ordinary depth writing and exclude from OIT;
- additive FX: flames, glows, motes; keep `depthWrite=false` and exclude from OIT;
- true normal-alpha solids: spectral bodies, liquids, glass, and some fading upper geometry; these are
  the only OIT candidates.

Several current artifacts are simpler depth-state defects: verb fades and particles become transparent
without disabling depth writes; coplanar rings/decals need layer height, polygon offset, or bounded
render order. Correct and test these before evaluating WBOIT.

### 7.2 WBOIT ruling

Reject whole-scene WBOIT and reject unmodified `three-wboit.WboitPass`. It behaves like a render-pass
replacement with private targets rather than an ordinary effect over the existing read buffer, and an
upstream depth-state restore concern requires audit.

An experiment may create an explicit `fxOit` scene/layer containing only normal-alpha smoke, spectral
bodies, liquids, and glass, then composite accum/reveal targets over Genesis's existing composer
buffer. Compare conventional and WBOIT at four fixed yaws with opaque, cutout, additive, wall, and UI
controls. Adopt only if popping/missing faces materially improve, controls are pixel-stable, occlusion
stays honest, and incremental GPU p95 is at most 2 ms.

## 8. Claude orchestration plan

Run units in separate worktrees and merge serially. Agents are not permitted to change rolled facts or
production dependencies.

### Wave GP-1: Measurement foundation

- Agent A owns `dev/battle-gate/capture-gpu-telemetry.mjs` only.
- Agent B owns `dev/verify-transparent-material-contract.mjs` only.
- Integrator owns the inventory seam already added to `theater-boot.js` and validates manifest plus
  dungeon-interior regressions.
- Exit: JSON telemetry and material census from one fixed scene; no runtime behavior change.

### Wave GP-2: Offline oracle and UV

- Agent A owns the scene-expansion adapter and path-trace harness.
- Agent B owns the browser/worker xatlas fixture and negative controls.
- Agent C owns three-realm oracle contact-sheet assembly and differences.
- Exit: no missing instances, explicit material approximation report, real WASM unwrap proof.

### Wave GP-3: Distribution and atlas

- Agent A owns a pure `place-distribution.js` prototype and fixtures.
- Agent B owns a Pillow atlas builder and metadata checks.
- Agent C owns browser UV/fringe/request/resource captures.
- Exit: narrative identity byte-stable, CLEAR intact, atlas deterministic, measurements reported.

### Wave GP-4: Targeted visual upgrades

- First fix proven depth-state defects.
- Add blue-noise material microvariation only if captures show clumping/banding.
- Run dedicated FX-layer WBOIT only if four-yaw controls still prove a true sorting defect.
- Convert oracle findings into small raster changes, one visual variable per A/B gate.

Every subagent returns: files changed, commands run, raw artifact paths, measured result, unexpected
finding, and an adopt/defer/reject recommendation. The orchestrator reads captures before accepting.

## 9. Stop conditions

Stop or defer a candidate when it requires runtime network/package installation, GUI-only cleanup,
mutates narrative cards, changes unrelated RNG consumption, cannot produce source provenance, silently
drops instances/attributes, changes alpha semantics, relies only on CPU FPS, or broadens renderer
ownership before a smaller depth/material correction is tested.

The objective is not a more sophisticated engine on paper. It is a reproducible sequence by which
procedural content acquires coherent shape, contact, material, light, atmosphere, and legibility until
the shipped raster frames approach the vision renders.
