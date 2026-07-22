---
type: design-study
status: OPEN RECOMMENDATION; IMPLEMENTATION UNAUTHORIZED
priority: HIGH SUPPORTING MODULE
created: 2026-07-22
updated: 2026-07-22
scope: deterministic architectural trim-sheet creation, packing, projection, and proof
parents:
  - PROCEDURAL-DUNGEON-DIRECTION.md
  - BATTLEMAP-TOWNTRAY-COMPOSITION.md
  - ART-DIRECTION-CANON.md
related:
  - FACETED-ART-REGENERATION-PRODUCTION-PLAN.md
  - GRAPHICS-PRODUCTION-RESEARCH-WAVE.md
  - ROOM-SHELL-COMPILER.md
  - WALL-VOLUMES-PRACTICALS.md
---

# Architectural Trim-Sheet Pipeline

This study answers the design request to determine how Genesis should create and implement trim sheets. It records
the current-engine audit, a recommended first scaffold and feature goal, the procedural UV/run contract, creation
pipeline, fallbacks, proof shape, costs, and five choices still awaiting Adam's ruling.

It does **not** authorize code, asset generation, package installation, or a build. Wave 12 still owns exact build
ordering and authorization. Wave 10 P10.10 still owns performance, device, texture-memory, and accessibility
budgets. The live Wave 10 questionnaire remains held at F10.9h.11-F10.9h.15 while this visual tangent is resolved.

## 1. Why trim sheets fit Genesis

A trim sheet is one texture set organized into reusable horizontal or vertical bands. Mesh UVs select a band and
run it along an architectural surface. The same sheet can therefore texture many walls, stairs, curbs, beams,
frames, roof edges, bridge edges, and props without a unique texture for each object. Adobe's official Substance
3D tutorial describes the same core use: texture many real-time assets with one texture set and lower texture-memory
cost through a deliberately planned sheet.

That is unusually compatible with Genesis because the engine already generates architecture as named surfaces and
ordered runs. A procedural wall perimeter, stair edge, curb, cap, beam, or eave does not need a general automatic UV
unwrap. The compiler knows the run's length, height, tangent, normal, owner, corners, and endpoints and can generate
the correct local coordinates directly.

Trim sheets are a practical bridge between:

- procedural geometry that is mechanically truthful but visually plain;
- generated art that should be reused rather than painted uniquely for every map;
- the high-priority BattleMap/TownTray composition module; and
- a no-human pipeline whose packing, metadata, fallback, and visual QA can be reproduced by an agent.

They are not a substitute for composition. A richly carved strip cannot turn noisy elevation, a false connector,
or a weak route into a good battlefield. Composition is proved first; trim-sheet citizenship is a separate surface
proof over the same retained fixture.

## 2. Keep four different things distinct

Genesis should not use “trim sheet” as a catch-all for every repeated architectural treatment.

| Term | What it owns | Genesis example |
|---|---|---|
| Tileable base material | Broad surface fabric, normally repeating in two axes | stone wall field, floor boards, roof tiles |
| Trim strip | One one-axis-repeat image | the current `fantasy-trim-1.png` carved stone band |
| Trim sheet | Several named reusable bands packed into one shared layout | base course, cornice, coping, stair nosing, curb, beam |
| Profile/sweep geometry | The physical cross-section and silhouette of a molding | projecting cornice, rounded stair nose, roof lip, curb |
| Decal/face atlas | Bounded, normally non-repeating marks or faces | plaque, crack, sign, cabinet face, drain cover |

A trim texture can suggest carved depth, wear, mortar, patina, or material change. It cannot create a silhouette,
collision edge, traversal rule, or actual overhang. Those remain geometry and mechanics. Conversely, a simple
profile sweep can create the silhouette while taking its color/detail from a trim-sheet slot.

This distinction prevents two common failures:

1. trying to solve every molding with a flat image whose baked lighting fights the real scene light; or
2. building unique ornate geometry for every material and venue when a small profile catalog plus reusable bands
   would do the job.

## 3. Current Genesis audit

Genesis is closer to a first trim proof than the older documents imply.

### 3.1 Generated trim art already exists

`src/ui/theater-interior.js` registers one trim variant for each current flagship realm:

- `assets/textures/fantasy-trim-1.png`;
- `assets/textures/gloom-trim-1.png`; and
- `assets/textures/chrome-trim-1.png`.

Each folded runtime strip is 256x64. The raw fantasy candidate remains at
`dev/model-qa/faceted-sheets/t1tiles-returns/raw-textures/fantasy-trim-1-candidate-001.png` and its provenance is
recorded. The generation prompt requested one carved stone border, strict front elevation, full strip height, and
left-right tileability. The fold report records the runtime texture and edge/contrast checks.

These are useful **single trim strips**, not yet multi-slot trim sheets. They prove that the generation/fold lane
can make a horizontally repeated band. They do not yet prove:

- a stable multi-band layout;
- material-channel alignment;
- runtime slot selection;
- correct physical scale across different roles;
- repeated-run UVs on variable-length procedural geometry;
- corner, endpoint, aperture, or junction behavior; or
- BattleMap/TownTray visual acceptance.

The fantasy source also reads like a finished relief panel. Its apparent highlights and shadows are useful concept
detail but too directional to be treated automatically as physically neutral albedo. A production trim source must
reserve real scene lighting for the renderer, allowing only restrained material-color and crevice information.

### 3.2 The registry is intentionally not wired to GL

`interiorBuildBoard` already resolves `trimTextureFile` and `trimTextureWrap` into the tile kit. An older comment in
`src/ui/theater-boot.js` says the strip is registered but not GL-wired because the available geometry at that time
was not a proper trim run. That caution was correct when written: stretching a small border over an arch prism
would have produced the wrong result.

### 3.3 Dedicated wall-trim run geometry now exists

`src/ui/theater-room-mesh.js` now emits optional `wallTrim` geometry:

- a base-course ribbon at the footing line;
- a cornice ribbon at the stem/upper seam;
- continuous perimeter-distance U coordinates;
- per-segment ownership metadata; and
- corner-miter/bevel points derived from the same wall run.

`src/ui/theater-boot.js` mounts that geometry, but currently uses `wallMat`. The generated trim texture and the new
trim-run geometry have therefore arrived on opposite sides of an unfinished seam.

This is the highest-value first implementation target. It uses real production geometry and exposes the missing
contract without requiring a new model format or runtime unwrap.

### 3.4 The current UV bundle is not a slot contract

The current trim ribbons reuse wall-style coordinates:

- U is perimeter distance; and
- V is literal band height such as `0..0.05`.

That is enough to sample a repeating wall texture, but not enough to select named regions of a trim sheet. Base
course and cornice are merged into one geometry and do not carry distinct slot or role data. A direct “load the
trim PNG instead of the wall PNG” patch would sample only a small accidental portion of the strip in V and would
not scale or route two roles correctly.

### 3.5 Current material authority needs correction

The registered strips are chosen by realm. The canonical `Architecture Material` roll, however, describes what the
place is actually built from and is already identified as `voice_critical`. A marble, basalt, copper, timber, or
ironwood building should not acquire an unrelated realm-only molding.

The recommended long-term authority is therefore:

1. stable **semantic sheet layout** shared across compatible variants;
2. primary visual variant from the canonical architecture material or compatible material family;
3. realm grade/tint as a secondary mood treatment; and
4. geometry-only/plain fallback when no honest trim variant exists.

This avoids a realm x material x biome x venue combinatorial explosion while preserving the rolled material's
identity. The first proof needs one material family, not all twelve current architecture-material rows.

## 4. Recommended product contract

The recommended architectural surface product is:

```text
ArchitecturalSurfaceFamily
  base material set
  trim-sheet layout + compatible visual variant
  small profile/sweep catalog
  decal/face family
  deterministic fallbacks
```

The trim sheet is a set of **full-width horizontal bands** in its first implementation. Every band repeats only
left-to-right. Full-width bands are deliberately less space-efficient than arbitrary rectangles, but they make the
runtime contract simple, deterministic, and compatible with generated runs.

The layout must be semantic and versioned. A stone, wood, metal, or strange-material visual variant can replace
another only when it implements the same layout id and slot meanings. A layout change is a data migration, not an
untracked art replacement.

### 4.1 Provisional manifest shape

The exact schema waits for a build spec, but it should carry at least:

```js
trimSheet = {
  sheetId: "architecture-core-stone-01",
  layoutId: "architecture-core-v1",
  version: 1,
  authoringSize: [1024, 1024],
  runtimeSize: [512, 512],       // provisional; P10.10 owns the budget
  colorSpace: "srgb",
  channels: ["baseColor"],       // normal/ORM may promote later
  materialFamily: "masonry",
  architectureMaterialIds: ["basalt", "limestone"],
  realmGradeSafe: true,
  slots: [
    {
      slotId: "base-course",
      semanticRole: "BASE_COURSE",
      rectPx: [0, 0, 1024, 192],
      repeatWorldLength: 1,
      physicalBandHeight: 0.15,
      allowedSurfaceKinds: ["WALL_FACE", "RETAINING_FACE"],
      profileId: "profile-square-proud-01",
      repeatAxis: "u",
      reversible: true,
      endpointPolicy: "plain-cap",
      fallbackSlotId: "plain-band"
    }
  ],
  guttersPx: 8,
  sourceRefs: [],
  licenseRefs: [],
  hashes: {}
}
```

Numbers above illustrate the data shape; they are not accepted budgets. Authoring can retain a 1024 master while a
deterministic fold produces 512 or 256 runtime variants. Capture evidence and P10.10 decide the shipped size.

### 4.2 First semantic slot roster

The first sheet should remain deliberately small:

1. plain/fallback band;
2. base course or skirting;
3. cornice or wall belt;
4. coping/cap edge;
5. stair or ledge nosing; and
6. curb/retaining edge.

Beam, door/window frame, roof/eave, gutter, storefront, bridge-side, rail, and decorative frieze slots are feature
promotions. C2M can add the first town-specific roles only after the core layout/run contract works.

## 5. Creation pipeline

Image generation should help create material detail; it should not own the final atlas layout. Asking a model for a
finished sheet with exact band coordinates, channel correspondence, gutters, and pixel-perfect semantic slots would
make the production contract nondeterministic.

### Step 1 - lock a debug layout before making beauty art

Create a manifest and a flat diagnostic sheet whose bands have unique colors, ids, arrows, repeat markers, and
scale ticks. Mount it on real geometry first. This catches slot inversion, stretching, corner phase, wrong role,
and accidental whole-atlas wrapping before art quality obscures the problem.

### Step 2 - create each source band independently

Each generated or authored candidate is a separate full-width strip at canonical authoring scale. Every future
generation prompt must quote the applicable `ART-DIRECTION-CANON.md` language verbatim, then add the role-specific
contract:

- strict front elevation;
- no perspective or scene framing;
- seamless left-right repetition;
- full band height in frame;
- fixed material and physical scale;
- no cast shadow, sun direction, vignette, text, or surrounding wall panel;
- restrained ambient crevice information only;
- no unique corner or endpoint unless explicitly requested as a separate module; and
- opaque, deterministic background/alpha policy.

The pipeline keeps multiple candidates and provenance until visual review accepts one. Generated pixels do not
become canonical merely because their edge metric passes.

### Step 3 - normalize and prove horizontal repetition

A deterministic build step should:

- crop/resample to the declared band size;
- preserve aspect and declared physical scale;
- compare left/right edges;
- render at least a 3x repeat proof;
- reject obvious motif discontinuity even when mean edge difference is low;
- normalize palette/contrast only within the accepted art rules; and
- record source, transformation, dimensions, hashes, and tool version.

Do not require vertical tileability inside a band. V is clamped to the band and protected by gutters.

### Step 4 - pack identical slot coordinates deterministically

The packer places accepted strips at manifest coordinates, adds edge dilation/gutters, and emits:

- the runtime base-color sheet;
- a labeled contact sheet/debug overlay;
- the resolved manifest with pixel and normalized UV bounds;
- a build/fold report;
- provenance and license records; and
- later, any additional aligned material channels.

The same layout must produce byte-stable output from the same inputs.

### Step 5 - phase material channels

**First proof:** base color only, with real geometry normals and scene lighting. This fits the current renderer and
isolates trim selection/scale/repetition from a larger PBR-material rewrite.

**Feature goal:** aligned normal plus packed occlusion/roughness/metalness or other channels when the chosen
material system and P10.10 budgets justify them. Height/parallax is not a default entitlement. It must improve the
gameplay-scale capture enough to earn shader, aliasing, memory, and maintenance cost.

Color data must use the correct color space; normal/mask data must remain linear. Every channel uses identical
slot coordinates and gutters.

## 6. Runtime projection and repeat contract

The runtime input should be a named run, not a request to “texture this mesh somehow.”

```js
trimRun = {
  runId,
  surfaceId,
  ownerId,
  role: "BASE_COURSE",
  sheetId,
  slotId,
  profileId,
  path: [{ x, y, z }, ...],
  runLength,
  phaseOrigin,
  repeatWorldLength,
  localFrame: { O, N, T, B },
  endpointPolicy,
  cornerPolicy,
  occlusionOwner: "stem",
  sourceRef
}
```

The compiler owns the final path, profile, corners, segment insertion, and local frame. The art manifest owns the
compatible slot, repeat length, physical band scale, and fallback.

### 6.1 Recommended first repeat method

Ordinary three.js `Texture.repeat` repeats the **whole image**, not one selected band. With several slots in one
atlas, letting U or V wrap naturally can sample another band. The official three.js texture contract confirms that
repeat and wrap operate at texture scope.

The recommended first implementation therefore uses:

- full-width horizontal bands;
- clamp-to-edge sampling on the full sheet;
- V coordinates remapped inside the selected band's padded bounds;
- the run split at every repeat-length boundary; and
- each repeat segment mapped U `0..1`, with phase preserved continuously around the run.

This adds a bounded number of vertices but requires no custom shader and makes every sampled UV stay inside its
declared slot. It is the simplest honest scaffold for the existing generated architecture.

### 6.2 Later shader optimization

If P10.10 evidence shows run tessellation or mesh splitting is material, a later shared trim material can carry
`trimPhase`, `trimV`, and `slotRect` attributes and compute sub-rectangle repetition in the shader. That path needs
careful derivative, mip, gutter, and batching validation. It should not be the first proof merely because it is
technically elegant.

### 6.3 Texel density and physical scale

Every role declares a physical band height and repeat world length. A stair nosing may be narrow; a carved wall
belt may be broad. Both should retain a consistent pixels-per-world-unit target within the visual family. Scaling a
single ornate band to fill arbitrary geometry would make motifs huge on curbs and tiny on cornices.

The debug sheet and capture gate must show scale at:

- one grid cell;
- the expected gameplay camera;
- the four supported yaws; and
- at least two run lengths that are not exact multiples of the repeat.

## 7. Corners, endpoints, apertures, and branches

### Straight and mitered corners

Simple wall-ring corners reuse the existing continuous perimeter phase and shared miter geometry. The motif turns
the corner because U advances along the run; Genesis does not need north/east/south/west variants.

### Acute bevels

The existing wall-run compiler inserts small bevel bridges for unstable acute miters. The current bridge UV span
can collapse near one perimeter coordinate, so the first proof must explicitly inspect acute corners for pinching.
The correct fallback is a plain material/profile bridge or a clean phase restart, not stretched ornament.

### Endpoints and apertures

A decorative motif should not be sliced randomly at every door, broken wall, or run endpoint. Each slot declares
one of:

- `plain-cap`: terminate into a geometry-owned neutral cap;
- `phase-fit`: adjust only within a bounded tolerance so a repeat ends cleanly;
- `dedicated-cap`: mount a reusable start/end component; or
- `allow-cut`: acceptable for non-ornamental material bands.

Door/window frames are named runs or component faces, not accidental continuations of the wall belt.

### Inside corners, T-junctions, and branches

The first proof may support simple outer/inner wall-ring corners and clean endpoints. T-junctions and branches must
terminate and restart through a declared cap/junction policy until a dedicated junction module exists. No shader or
UV rule should silently stretch one band across several branches.

## 8. Geometry and occlusion ownership

The existing `wallTrimGeometry` merges base course and cornice into one mesh rendered with one wall material. A
production trim contract should preserve batching while keeping semantic and visibility ownership explicit:

- base course normally follows the persistent stem;
- a high wall belt/cornice may follow the owning upper wall when that upper fades;
- a tray-edge cap may remain with the stem because it communicates the cutaway boundary;
- door/window trim follows its aperture/component owner; and
- damaged or removed architecture invalidates only its own trim run.

This can be represented through geometry groups or separate owner-class bundles that still share one trim-sheet
material. A single merged mesh that cannot follow per-segment occlusion would violate the existing wall-volume
contract even if its texture looks correct.

Trim geometry is cosmetic unless an accepted mechanic says otherwise. Collision, cover, line of sight, climb,
traversal, and object interaction read canonical structural geometry and connectors, never a painted molding.

## 9. Fallback ladder

The trim system must fail into truthful architecture, not a missing checkerboard or wrong material.

1. exact accepted slot and profile;
2. compatible plain slot in the same material family;
3. geometry-only profile tinted from the canonical base material;
4. base surface with no trim; and
5. debug/error color only in developer diagnostics.

Missing normal/roughness channels fall back to base-color plus scene lighting. Missing endpoints use plain geometry
caps. Invalid corner geometry uses a bounded bevel or butt termination. A missing marble trim must not silently use
a carved wood or chrome strip just because the realm matches.

## 10. Recommended proof and promotion path

### Existing C1H remains composition-first

C1H should still answer whether one real rolled room is tactically and visually composed. Its clay/dressed parity
cannot depend on an ornate sheet. Trim work may prepare a debug layout in parallel, but C1H does not pass because a
wall band is attractive.

### Proposed C1I - one trim-sheet architecture pilot

Add a separate retained pass immediately after C1H if Adam accepts the recommendation:

**Primary question:** can one deterministic manifest-driven horizontal trim sheet route distinct base-course,
cornice, cap/nosing, and curb/retaining roles across the real C1H procedural geometry at correct scale, repeat phase,
corners, endpoints, occlusion ownership, and four-yaw readability—with a geometry-only fallback, unchanged tactics,
and no unique per-map texture?

The first pass uses:

- one material family;
- one stable layout;
- the existing wall-trim run plus the minimum extra edge roles the retained fixture actually exposes;
- base color only;
- run segmentation rather than a custom repeat shader;
- a diagnostic sheet before beauty art; and
- one unchanged clay-versus-dressed mechanics comparison.

It does not require all architecture materials, roof/eave breadth, PBR channels, general automatic unwrap, unique
corner art, parallax, or performance batching beyond proportional safety checks.

### C2M and later promotions

C2M reuses the same sheet-layout/run authority for the retained market. It may add only demonstrated town roles
such as curb, roof/eave, storefront belt, or awning rail. It cannot create a second town-only atlas schema.

Later evidence may promote:

- real profile sweeps for stronger silhouettes;
- more architecture-material families under the same layout;
- roof, bridge, beam, door/window, and prop roles;
- aligned normal/roughness/metalness channels;
- dedicated caps/corners/junctions;
- shader-side sub-rectangle repetition and batching; and
- compact damage/wear overlays that preserve the base trim identity.

## 11. Implementation and maintenance cost

| Work | Implementation cost | Ongoing maintenance | Reason |
|---|---:|---:|---|
| Audit and manifest/debug layout | Low | Low | Current art, registry, runs, and UVs already exist |
| Deterministic strip normalizer/packer/report | Low-medium | Low | Existing fold/provenance patterns can be extended |
| Route one base-color sheet onto existing wall trims | Medium | Low | Material seam is small; role/UV/visibility correctness is not trivial |
| Repeat-boundary segmentation and phase continuity | Medium | Low | Pure geometry/UV work with corner and aperture fixtures |
| First accepted multi-band art sheet | Medium | Medium | Requires generation, taste review, seam/scale iteration, and provenance |
| Cap/nosing/curb run extraction | Medium | Low-medium | Reuses surface frames but adds semantic run roles |
| Profile-sweep geometry and corner policies | Medium-high | Medium | Cross-section, miters, endpoints, normals, and occlusion need fixtures |
| Architecture-material variant breadth | Medium per family; high cumulative | Medium | Art review and truthful fallback dominate, not packing code |
| Normal/ORM channel pipeline | Medium | Medium | Channel alignment, color space, mip bleed, and renderer routing |
| Custom atlas-repeat shader/batching | Medium-high | Medium | Derivatives, mipmaps, attributes, material integration, device variance |

The recommended base-color C1I pilot is **medium bounded work after C1H**, not a research project on the scale of
general automatic unwrapping. The mature cross-material/profile/channel library is a larger module and should grow
only from retained fixtures.

## 12. Failure risks and controls

| Risk | Control |
|---|---|
| Decorative detail hides weak composition | C1H passes in clay before C1I surface proof |
| Image generation shifts band coordinates | Generate bands independently; deterministic manifest packer owns layout |
| Whole atlas wraps into another slot | Full-width bands, clamped sheet, repeat-boundary run segmentation |
| Mipmaps bleed adjacent bands | Padded slot bounds, dilation/gutters, gameplay-scale mip QA |
| Motifs stretch or change scale | Physical band height, repeat length, texel-density metadata |
| Corners pinch or ornaments cut awkwardly | Continuous phase plus explicit bevel/cap/phase-fit policies and fixtures |
| Baked highlights fight dynamic light | Flat ambient source contract; real geometry/material channels own response |
| Realm trim contradicts rolled building material | Architecture material/family selects variant; realm grade remains secondary |
| Atlas reduces textures but not draw calls | Share one material/mesh family; measure batching later under P10.10 |
| Trim changes mechanics or survives destroyed structure | Canonical surface/run owner controls existence; trim remains projection |
| Variant breadth explodes | Stable layout, compatible families, honest plain/geometry fallbacks |

## 13. Five decisions awaiting Adam

These are a generated visual-engine batch. Answering them does not move past F10.9h.11-F10.9h.15.

### T10.1 - first implementation depth

**Option A - wire one current 256x64 strip directly.** Fastest screenshot, but it leaves only one semantic band,
does not solve base-versus-cornice routing, and will likely create another replacement seam.

**Option B - one manifest-driven horizontal multi-band sheet on generated runs, then profile/channel breadth
(recommended).** Proves the actual reusable system in bounded form while preserving later silhouette and material
goals. Medium implementation and art-pipeline cost.

**Option C - require full profile sweeps, multi-channel PBR, and several material families before first use.** Best
initial breadth, but high cost and likely to delay the playable battle/composition spine.

### T10.2 - visual variant authority

**Option A - choose trims only by realm.** Reuses the current registry but can contradict canonical building
material.

**Option B - stable layout; architecture material/family chooses the visual variant; realm grade is secondary
(recommended).** Preserves canonical construction while preventing bespoke venue sheets. Medium content-routing
work and honest fallbacks.

**Option C - generate a unique sheet for every venue.** Maximum specificity, with unacceptable generation,
latency, cache, consistency, provenance, and maintenance cost for the procedural core.

### T10.3 - art creation method

**Option A - ask image generation for the finished packed sheet.** Fewer build steps, but exact slots, gutters,
scale, and aligned channels become unreliable.

**Option B - generate/author source strips independently and pack them deterministically from a manifest
(recommended).** Uses image generation where it is strong and code where precision is mandatory. Medium first
pipeline cost, low repeat cost.

**Option C - make every sheet manually in a 3D/texture-authoring package.** Strong control but violates the desired
no-human production path as the only solution; it remains a valid exceptional source, not the default authority.

### T10.4 - first runtime repetition method

**Option A - write a custom sub-rectangle repeat shader immediately.** Potentially fewer vertices and flexible
packing, with medium-high shader/mip/device risk before the contract is proved.

**Option B - full-width horizontal bands plus repeat-boundary run segmentation first; shader optimization only if
measured (recommended).** Deterministic, debuggable, compatible with current geometry, and medium bounded cost.

**Option C - keep every band as a separate texture/material.** Simple UVs, but it loses the shared-sheet material
and batching benefit and multiplies bindings/draw groups.

### T10.5 - proof-ladder placement

**Option A - fold trim-sheet acceptance into C1H.** Fewer pass names, but one gate could fail for unrelated map-
composition, art-generation, UV, material, or corner reasons.

**Option B - keep C1H composition-first and add C1I as the retained trim-sheet architecture pilot
(recommended).** Honors one-primary-risk-per-pass and gives TownTray a proved surface seam. It adds one bounded
pass after the high-priority battlefield proof.

**Option C - defer trim sheets until C2M TownTray.** Protects the first battlefield schedule, but risks discovering
the surface contract only after town geometry and roles multiply.

## References

- [Adobe Substance 3D: Trim Sheets with Substance Painter](https://www.adobe.com/learn/substance-3d-painter/web/trim-sheets-with-substance-painter)
  - official planning/creation tutorial and the one-texture-set efficiency premise.
- [three.js Texture documentation](https://threejs.org/docs/pages/Texture.html) - UV mapping, repeat, wrap, mipmap,
  color-space, and texture-source behavior used to bound the runtime recommendation.
- [three.js texture manual](https://threejs.org/manual/en/textures.html) - atlas use, GPU memory, filtering/mipmaps,
  and texture-scope wrapping behavior.
- [Blender UV introduction](https://docs.blender.org/manual/en/latest/editors/uv/introduction.html) and
  [Pack Islands documentation](https://docs.blender.org/manual/en/latest/modeling/meshes/uv/editing.html#pack-islands)
  - general UV control, distortion, layout, and margin background. Generated architectural runs use direct
  parameterization; complex reusable assets may still use offline unwrap.
- `src/ui/theater-interior.js`, `src/ui/theater-room-mesh.js`, and `src/ui/theater-boot.js` - current trim registry,
  generated wall-trim runs, UVs, and unwired material seam.
- `dev/model-qa/faceted-sheets/session-prompts/t1-floors-walls.md` and
  `dev/model-qa/faceted-sheets/t1tiles-returns/` - current single-strip prompt, candidates, and provenance.
- `build/fold-textures-report.json` and `dev/verify-bw2-3-material-texel.mjs` - current 256x64 fold and validation
  contract.
