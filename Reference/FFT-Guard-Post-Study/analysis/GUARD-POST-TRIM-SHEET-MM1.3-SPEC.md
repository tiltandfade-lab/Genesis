---
type: working-trim-sheet-foundry-spec
status: ROUGH BUILD SPEC — layout exact enough for a diagnostic proof; art values remain taste-calibrated
created: 2026-07-23
scope: Guard Post architectural trim sources, Material Maker 1.3 graphs, deterministic packing, projection, mutation, and fallback
---

# Guard Post — Trim-Sheet and Material Maker 1.3 Spec

## Outcome

The missing trim contract is now:

> Material Maker 1.3 authors six reusable, horizontally seamless PBR source bands independently.
> A deterministic manifest packer—not Material Maker, image generation, or the runtime renderer—
> places those bands into one stable full-width horizontal layout. Procedural low-poly geometry
> owns every physical profile, corner, endpoint, aperture, and occlusion relation. The sheet owns
> only reusable material-scale surface response.

The first layout is deliberately modest. It gives the Guard Post a coherent base course, wall belt,
cap, nosing, and retaining/curb language without turning the building into ornate miniature
architecture or making trim carry the cultural read by itself.

This is a Guard Post proving specification for a layout intended to become a shared
BattleMap/TownTray architectural surface contract. It is not a one-site atlas.

## Governing decisions inherited from Genesis

The accepted repository authority requires:

- one stable semantic multi-band layout;
- full-width horizontal bands;
- independent source strips;
- deterministic manifest-owned packing;
- a diagnostic sheet before beauty art;
- material family as the primary visual-variant authority;
- realm grade only as a secondary treatment;
- clamped atlas sampling;
- repeat-boundary run segmentation before any custom atlas-repeat shader;
- geometry-owned profile, silhouette, corners, endpoints, existence, and occlusion;
- compatible plain, geometry-only, and untrimmed fallbacks;
- C1H/architecture passing in clay before C1I/trim is allowed to claim success.

Source authority read-only at the time of this Desktop spec:

```text
/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/docs/TRIM-SHEET-PIPELINE.md
/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/docs/ART-DIRECTION-CANON.md
/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/docs/BATTLEMAP-TOWNTRAY-COMPOSITION.md
```

No repository file is modified by this study.

## What a trim sheet is allowed to do

Trim may express:

- a base course or skirt distinct from the wall field;
- a shallow construction belt or cornice rhythm;
- a dressed coping/cap fascia;
- a stair or ledge nosing treatment;
- a curb or retaining-edge construction rhythm;
- restrained joints, dressing, wear affinity, roughness, and material variation;
- culture-compatible construction regularity inside a shared semantic role.

Trim may not express:

- a physical ledge or overhang not present in the mesh;
- collision, cover, climbability, or an elevation step;
- a doorway, window, drain opening, battlement, or barrier;
- a destroyed/broken profile without a canonical damage event and geometry;
- site-specific overgrowth, repair, traffic, or dampness baked indiscriminately into the base sheet;
- heraldry, signs, banners, furnishing identity, or unrelated ornament;
- a unique map composition.

## Keep the product layers separate

| Layer | Owner | Example |
|---|---|---|
| Base tileable material | Material Maker seed family | coursed wall field, rubble wall field, dressed stone |
| Trim source band | Material Maker role graph | base-course material response |
| Packed trim sheet | Deterministic manifest packer | six bands with aligned channels and gutters |
| Profile geometry | Low-poly structure compiler | projecting base, cap lip, nosing wedge |
| Exact endpoint/junction | Geometry/component grammar | plain cap, butt end, bevel bridge |
| Condition projection | Canonical state + engine masks | moss only where moisture/use/repair permit |
| Runtime material | Renderer | sheet channels, sampling, lighting, fallback |

## Stable layout

### Layout identity

```text
layoutId: genesis-architecture-core-h6-v1
layoutVersion: 1
orientation: full-width-horizontal-bands
authoringSize: 1024x1024
firstRuntimeSize: 512x512
repeatAxis: u
sheetWrap: clamp-to-edge
masterVerticalGutterPx: 16 per side of each band
runtimeVerticalGutterPx: 8 after 2:1 fold
```

The 1024 master is an exception to the ordinary 512 material-card starting point because six
semantic bands share the same atlas. The first runtime fold is still 512. A 256 fold may be tested,
but it is not presumed acceptable.

### Exact v1 pixel layout

Coordinates use top-left pixel origin. `paddedRectPx` includes the vertically dilated gutters.
`safeContentRectPx` is the only region the UV manifest exposes.

| Slot id | Semantic role | Padded rect | Safe content rect | Default profile | First endpoint policy |
|---|---|---:|---:|---|---|
| `plain-band` | compatible neutral fallback | `[0,0,1024,128]` | `[0,16,1024,96]` | `GP-TR-P00` | `allow-cut` |
| `base-course` | wall/plinth base course | `[0,128,1024,192]` | `[0,144,1024,160]` | `GP-TR-P01` | `plain-cap` |
| `cornice-belt` | shallow wall belt/cornice | `[0,320,1024,192]` | `[0,336,1024,160]` | `GP-TR-P02` | `plain-cap` |
| `coping-cap` | parapet/ledge/cap fascia | `[0,512,1024,160]` | `[0,528,1024,128]` | `GP-TR-P03` | `plain-cap` |
| `stair-nosing` | tread/ledge nose fascia | `[0,672,1024,128]` | `[0,688,1024,96]` | `GP-TR-P04` | `allow-cut` |
| `curb-retaining` | curb/retaining cap or edge | `[0,800,1024,224]` | `[0,816,1024,192]` | `GP-TR-P05` | `allow-cut` |

The padded rectangles sum to exactly 1024 pixels. There is no horizontal gutter because every
source is required to be left-right seamless across the full sheet width. Vertical edge dilation
fills the 16-pixel master padding above and below each safe band. At the 512 fold, every coordinate
and gutter halves exactly.

The packer emits normalized UV bounds and records whether the runtime's V origin must be flipped.
Runtime code never infers slot bounds from the image.

### Why the first sheet does not contain every Guard Post edge

Door/window surrounds, threshold faces, drain mouths, roof/eaves, beams, rails, and dedicated
corners are valid future roles, but they do not belong in `h6-v1`.

For Guard Post 1:

- opening jambs, sills, lintels, and threshold faces use the dressed operational-stone base
  material or `plain-band`;
- drain openings remain geometry plus dressed-stone material;
- roof/eave treatment uses the selected roof base material until a shared eave role earns layout
  v2;
- timber beams and barrier members use structural timber, not a stone trim slot;
- unique corner/end art is deferred; geometry creates clean caps and miters.

Adding a role later creates `layoutVersion: 2` and a deliberate UV/data migration. It does not
silently repack v1.

## Slot construction briefs

### `plain-band`

Purpose:

- truthful same-family fallback;
- neutral endpoint bridge;
- acute-corner or junction fallback;
- dressed edge where a decorative rhythm would be misleading.

Visual brief:

- same material identity as the visual sheet variant;
- no unique repeated motif;
- low contrast;
- restrained macro variation;
- no baked border, highlight, shadow, grime band, or growth.

### `base-course`

Purpose:

- show where a wall/plinth bears on foundation or ground;
- visually settle a low-poly wall mass;
- support a real geometry-owned shallow projection.

Institutional expression:

- one or two regular dressed courses;
- repeatable unit rhythm;
- restrained joint width;
- measured edge dressing.

Upland expression:

- heavier local dressed units;
- slightly varied lengths;
- still clearly selected/bearing stone rather than rubble wall infill.

Do not:

- paint soil contact or moss into every base course;
- fake a projecting plinth in the height map;
- use tiny repeating bricks.

### `cornice-belt`

Purpose:

- a shallow construction seam near the wall top or roof/deck transition;
- break a tall wall field with one readable low-poly band.

Institutional expression:

- repeated shallow step/belt;
- regular dressing and spacing.

Upland expression:

- simpler, heavier cap/belt transition;
- less regular unit lengths but a stable continuous datum.

This is not an ornate carved frieze. A scene that needs figurative carving, glyphs, heraldry, or a
culture-specific plaque needs a separate licensed component/decal family.

### `coping-cap`

Purpose:

- visible fascia of a geometry-owned parapet cap, ledge cap, or retaining cap;
- protect/read the end of a wall run.

Visual brief:

- broad dressed face;
- minimal joint rhythm;
- slightly smoother/wear-prone response than wall field;
- no painted top surface—the geometry's top face receives its own surface role.

### `stair-nosing`

Purpose:

- clarify the front edge of a real tactical step or ledge;
- give a narrow wear-capable band without painting fake step depth.

Visual brief:

- very quiet;
- no large motif that will be sliced at every tread;
- strong enough value/roughness separation to read under the fixed camera;
- intrinsic edge-wear affinity may be exported, but actual wear depends on use.

### `curb-retaining`

Purpose:

- curb the road/apron;
- cap or articulate a retaining run;
- connect road engineering to the guarded threshold.

Institutional expression:

- repeated dressed engineering course;
- regular drainage-compatible rhythm.

Upland expression:

- broader local stones selected for bearing and water management;
- mild length irregularity;
- no collapse or random displaced stones in the base sheet.

## Low-poly profile catalog

The following are geometry recipes, not height-map illusions. Cross-section counts are first-clay
targets.

| Profile id | Role | Cross-section | Low-poly rule |
|---|---|---|---|
| `GP-TR-P00` | flush/plain | two-point face | no projection; material-only fallback |
| `GP-TR-P01` | square-proud base | four-point shallow step | one outward step, no bevel stack |
| `GP-TR-P02` | shallow belt | four- or six-point stepped profile | one readable belt; one small bevel only if the silhouette earns it |
| `GP-TR-P03` | cap fascia | four-point lip/cap | top face is a separate horizontal surface; trim samples only the fascia |
| `GP-TR-P04` | nosing | three- or four-point wedge/lip | one tactical-edge silhouette; no rounded high-segment nose |
| `GP-TR-P05` | curb/retaining cap | four-point block/cap | stable corners and road contact; no decorative serration |

Each run record names both `slotId` and `profileId`. The same visual slot may be used on a compatible
flush or shallow profile, but profile substitutions are bounded and table/config controlled.

Provisional physical starting bands, to be calibrated in clay:

| Slot | Band-height starting range | Default repeat world length |
|---|---:|---:|
| `plain-band` | profile-defined | 1.00 tactical cell |
| `base-course` | 0.10–0.18 cell | 1.00 cell |
| `cornice-belt` | 0.06–0.12 cell | 1.25 cells |
| `coping-cap` | 0.05–0.10 cell | 1.00 cell |
| `stair-nosing` | 0.025–0.06 cell | 0.75 cell |
| `curb-retaining` | 0.08–0.16 cell | 1.25 cells |

The committed material/profile row stores one exact value, not a range. These ranges only define
the first Clayroom search space.

## Material Maker 1.3 source system

### Source organization

Use one `.ptex` project per semantic band and visual material-family variant:

```text
source/
  gmm-trim-stone-institutional-plain-v001.ptex
  gmm-trim-stone-institutional-base-course-v001.ptex
  gmm-trim-stone-institutional-cornice-belt-v001.ptex
  gmm-trim-stone-institutional-coping-cap-v001.ptex
  gmm-trim-stone-institutional-stair-nosing-v001.ptex
  gmm-trim-stone-institutional-curb-retaining-v001.ptex
```

The Upland family mirrors the six role ids. This is not wasteful duplication: all projects consume
the same immutable versioned custom nodes, while each role remains independently replaceable,
reviewable, hashable, and packable.

### Custom nodes

Add these reusable nodes to the versioned Genesis Material Maker 1.3 library:

| ID | Node | Function |
|---|---|---|
| `GMM-TR01` | Trim Role Frame v001 | establishes repeat-U/clamp-V frame, safe content window, scale, and debug guides |
| `GMM-TR02` | Trim Vertical Profile v001 | builds broad vertical height/value bands from Gradient/Curve/Remap controls |
| `GMM-TR03` | Trim Unit Rhythm v001 | applies Bricks 3, Uneven Bricks 3, or a simple tiler only when the role needs constructed units |
| `GMM-TR04` | Trim Edge and Cavity v001 | produces restrained edge/cavity candidates from height using Morphology/Slope Blur/Occlusion |
| `GMM-TR05` | Trim PBR Finish v001 | derives aligned albedo, normal, roughness, metallic, AO, height, and intrinsic affinity |
| `GMM-TR06` | Trim Debug Overlay v001 | produces role id, U arrow, scale ticks, seam markers, and V-up marker for diagnostic exports only |

Use the existing general seed nodes from
`GUARD-POST-MATERIAL-MAKER-1.3-SEED-GRAPH-SPEC.md` for macro fields, per-unit variation,
condition affinity, and common PBR finishing.

### Common graph order

```text
[Remote Parameters / named configuration]
                    |
           [GMM-TR01 Role Frame]
                    |
      +-------------+--------------+
      |                            |
[GMM-TR02 vertical profile]  [GMM-TR03 unit rhythm]
      |                            |
      +---------- [height blend] --+
                    |
          [GMM-TR04 edge/cavity]
                    |
   [base material palette + macro variation]
                    |
           [GMM-TR05 PBR finish]
                    |
        [Static PBR Material output]
                    |
       [optional intrinsic-affinity export]
```

### Recommended 1.3 base nodes

- `Gradient`, `Curve`, `Remap`, `Tones`, and `Tones Step` for broad vertical/profile control;
- `Bricks 3` for regular dressed units;
- `Uneven Bricks 3` or `Skewed Uneven Bricks` for bounded Upland variation;
- `Tiler Advanced` only when a later role needs a repeatable authored shape;
- `FBM 2` or `Wavelet Noise` for broad macro variation;
- `Morphology` and low-strength `Slope Blur` for restrained weathering;
- fill-to-random-grey/color plus `Color Map` for per-unit variation;
- `Normal Map 2` and `Occlusion 2` for derived response;
- Static PBR Material for the aligned export payload.

Avoid using high-frequency noise to make the strip appear detailed. The production camera should
read one broad construction rhythm, not a miniature relief carving.

### Exposed parameters

Common:

```text
rootSeed
repeatWorldLength
physicalBandHeight
roleFrameHeight
verticalProfileStrength
macroScale
macroStrength
unitVariation
jointWidth
jointDepth
edgeWeathering
heightStrength
normalStrength
roughnessBase
roughnessVariation
paletteConfiguration
intrinsicAffinityStrength
```

Role-specific:

- base course: course count, unit length, bearing-face flatness;
- cornice: step count, step positions, belt depth;
- coping: cap-unit length, face flatness, joint spacing;
- nosing: lip height, wear-zone width;
- curb: course/unit length, drainage rhythm candidate;
- plain: macro variation only.

The parameter surface must remain small. If a value changes only one candidate for one camera, it
is not a reusable exposed parameter.

## Batchable square-source contract

Material Maker 1.3 can preview/export non-square images from its 2D preview, which is useful during
taste work. Its ordinary material batch export is easiest to keep deterministic with square
outputs. Therefore the canonical automated source contract is:

1. export each `.ptex` at `1024 × 1024`;
2. author the role inside a centered, manifest-declared horizontal source window;
3. crop that window without non-uniform stretching;
4. place it into the matching `safeContentRectPx`;
5. vertically dilate its top/bottom edges into the padded rectangle;
6. verify exact left/right seam continuity before packing.

Centered source windows:

| Safe height | Source window |
|---:|---:|
| 96 | `[0,464,1024,96]` |
| 128 | `[0,448,1024,128]` |
| 160 | `[0,432,1024,160]` |
| 192 | `[0,416,1024,192]` |

The role graph's UV/frame controls are authored for that final aspect. The packer may crop and
uniformly downsample; it may not arbitrarily squash an ordinary square material into a narrow band.

## Channel contract

### Phase A — diagnostic

```text
debug-role.png
```

Contains:

- unique role color;
- slot id;
- U-direction arrows;
- one-repeat brackets;
- scale ticks;
- left/right seam marks;
- V-up indicator;
- safe-content and gutter bounds.

It is development-only and never a beauty fallback.

### Phase B — first C1I beauty obligation

```text
baseColor: sRGB
```

Base color contains material color and restrained crevice information only. It contains no cast
shadow, directional sun, painted specular highlight, bloom, vignette, or scene lighting.

### Phase C — aligned material promotion

```text
normal: linear; convention explicitly declared
orm: linear; R=ambient occlusion, G=roughness, B=metallic
height: linear; foundry/debug unless separately admitted
affinity: linear; R=cavity/deposit, G=edge wear, B=ledge/moisture, A=1
```

The first runtime proof does not have to wire Phase C. Material Maker graphs should nevertheless
retain the aligned intermediates so later promotion does not require repainting unrelated bands.

Never assume normal-map handedness. The manifest records `normalConvention` and the pack/fold step
performs any deterministic channel inversion required by the Genesis renderer.

Affinity maps do not declare that moss, wear, dampness, or grime exists. Runtime condition
projection intersects intrinsic affinity with canonical condition, geometry orientation, exposure,
drainage, traffic, clearance, repair, and history facts.

## First visual variants

All variants implement exactly `genesis-architecture-core-h6-v1`.

### `gp-trim-stone-institutional-v1`

Compatible with:

- coursed operational stone;
- dressed institutional operational edges;
- standardized frontier repair stone where separately bound.

Character:

- regular construction datums;
- restrained repeated unit lengths;
- shallow measured profiles;
- quiet iron/repair interfaces left to components rather than painted ornament.

### `gp-trim-stone-upland-v1`

Compatible with:

- local rubble wall fields;
- dressed local operational edges;
- heavy terrain-fitted retaining construction.

Character:

- broad locally selected dressed units;
- bounded length variation;
- heavier cap/curb response;
- stable functional datums despite irregular wall infill.

### `gp-trim-debug-h6-v1`

Implements the same slots, UVs, and profile bindings with diagnostic colors and markers.

Culture never changes the layout coordinates. A culture profile selects a compatible visual sheet
variant and profile family. If no compatible beauty sheet exists, it falls back through the same
material family rather than borrowing a contradictory culture/realm sheet.

## Manifest

Minimum resolved manifest:

```json
{
  "sheetId": "gp-trim-stone-institutional-v1",
  "sheetVersion": 1,
  "layoutId": "genesis-architecture-core-h6-v1",
  "layoutVersion": 1,
  "materialFamilyId": "old-operational-stone",
  "constructionProfileId": "institutional-frontier-works",
  "mmVersion": "1.3",
  "authoringSize": [1024, 1024],
  "runtimeFolds": [[512, 512]],
  "repeatAxis": "u",
  "wrapS": "clamp",
  "wrapT": "clamp",
  "channels": {
    "baseColor": {"colorSpace": "srgb"},
    "normal": {"colorSpace": "linear", "normalConvention": "DECLARED_AT_INTEGRATION"},
    "orm": {"colorSpace": "linear", "packing": "R=AO,G=roughness,B=metallic"},
    "affinity": {"colorSpace": "linear", "packing": "R=cavity,G=edge,B=ledge,A=1"}
  },
  "slots": [],
  "sourceGraphs": [],
  "sourceHashes": {},
  "outputHashes": {},
  "packerVersion": "UNBUILT",
  "fallbackSheetId": "gp-trim-stone-plain-v1",
  "licenseRefs": [],
  "tasteRuling": "PENDING"
}
```

Each slot adds:

```text
slotId
semanticRole
paddedRectPx
safeContentRectPx
uvBounds
physicalBandHeight
repeatWorldLength
allowedSurfaceKinds[]
compatibleProfileIds[]
endpointPolicy
cornerPolicy
reversible
sourceGraphId
sourceConfiguration
sourceWindowPx
fallbackSlotId
```

## Deterministic packing pipeline

1. Validate layout id/version and exact rectangles.
2. Resolve the six source graphs, configurations, receipts, and hashes.
3. Batch-export square aligned channel sources from Material Maker 1.3.
4. Crop the exact manifest source windows.
5. Confirm dimensions and forbid non-uniform stretch.
6. Run left/right numeric edge comparison.
7. Render a 3× repeat proof and require visual seam review.
8. Place every safe band at the exact layout coordinate.
9. Dilate top/bottom edge pixels into the vertical gutters for every channel.
10. Emit the master sheet channels.
11. Deterministically fold to 512.
12. Emit normalized UV bounds with explicit origin convention.
13. Emit labeled contact sheet, repeat sheet, pack report, provenance, and hashes.
14. Repeat the entire pack into a second output directory and require byte-identical hashes.

The packer never:

- changes semantic slot order;
- invents a missing strip;
- performs unrecorded contrast or palette correction;
- asks image generation to repair atlas placement;
- mixes source versions without recording them;
- substitutes a realm-matched but materially incompatible band.

## Runtime projection

Each generated run carries:

```text
trimRunId
owningSurfaceId
owningStructureId
semanticRole
sheetId
layoutId
slotId
profileId
path[]
runLength
phaseOrigin
repeatWorldLength
localFrame
endpointPolicy
cornerPolicy
occlusionOwner
sourceCanonicalFactIds[]
```

### U mapping

```text
uPhase = (distanceAlongRun + phaseOrigin) / repeatWorldLength
```

The first implementation splits the run at each integer repeat boundary. Each emitted repeat
segment maps U from `0..1`, keeping all samples inside the full-width strip and preserving phase
continuity.

`phaseOrigin` is not a cosmetic random number. It is derived from a stable semantic run origin and
stored in the committed surface plan. Paired cultural captures use the same run origins so
construction comparison does not drift because one motif happened to start elsewhere.

### V mapping

Profile-local V `0..1` maps only into `safeContentRectPx`/resolved `uvBounds`. It never includes the
gutter or neighboring slot.

### Texture state

- sheet wrap S/T: clamp;
- slot repetition: geometry segmentation, not texture wrap;
- base color: sRGB;
- normal/ORM/affinity: linear;
- mipmaps: permitted only after gutter/bleed capture passes;
- filtering: measured against the fixed production camera and the existing texel-density law.

## Corners and endpoints

### Ordinary corners

- continue U by perimeter/run distance;
- miter or bevel the geometry from the owning profile;
- do not create north/east/south/west texture variants.

### Acute corners

If a miter becomes unstable:

1. insert the bounded geometry bevel already licensed by the run compiler;
2. use `plain-band` on the bridge or restart phase cleanly;
3. never stretch an ornate unit across the bevel.

### Apertures

- terminate the wall run at the opening;
- apply its endpoint policy;
- frame the opening with dressed operational-stone surfaces or a future named frame run;
- never continue a cornice/base motif through empty door/window space.

### T-junctions and branches

V1 terminates and restarts using a plain cap. Dedicated junction art is later work. One band does
not branch through an atlas trick.

### Damage and repair

Trim existence follows the owning structural run:

- destroyed/removed wall removes its trim;
- a broken silhouette uses damage geometry and a compatible plain/broken material treatment;
- recent repair may bind a compatible newer material variant over the repaired run;
- the base sheet does not randomly omit or break units to simulate history.

## Occlusion and cutaway ownership

- base course normally follows the persistent wall stem;
- cornice follows the owning upper wall if that wall fades/cuts away;
- a tray-edge/cut cap may remain with the stem only when it communicates the cutaway truth;
- parapet coping follows the parapet owner;
- stair nosing follows the tactical stair/ledge owner;
- retaining/curb follows its road/retaining owner;
- hidden or removed structures cannot leave floating trim.

Separate geometry groups or owner-class bundles may share one trim material. Batching does not
erase visibility ownership.

## Mutation and seed law

The fertile-seed hierarchy is:

```text
stable layout
  → material-family sheet variant
    → culture-compatible construction configuration
      → age/geology/realm-compatible child variant
        → runtime canonical condition projection
```

Legal mutations:

- palette and geology within the same material family;
- coursing/unit rhythm within the same semantic slot;
- institutional versus upland construction treatment;
- restrained roughness/normal response;
- new/repaired material variant under the same layout;
- later realm response that does not contradict the material.

Illegal mutations:

- moving or resizing slots without a layout-version migration;
- changing a slot's semantic role;
- baking site-specific moss, repair, or damage into the base variant;
- using culture as a random per-run roll;
- changing geometry profile from inside the material graph;
- adding an ornate hero motif to a generic repeat strip.

Every source `.ptex`, custom-node version, root seed, configuration, source window, and packed
output hash is recorded. Admitted sources are never overwritten in place.

## Fallback ladder

1. exact visual sheet variant + exact role slot + exact profile;
2. compatible `plain-band` in the same material-family sheet;
3. same-family base material on the geometry-owned profile;
4. truthful untrimmed base surface;
5. diagnostic role color in developer fixtures only.

Missing aligned channels fall back independently:

- missing normal: real geometry normals plus base color;
- missing ORM: owning base material's scalar response;
- missing affinity: no projected condition from that affinity channel;
- missing beauty sheet: diagnostic only in QA, never player-facing.

There is no fallback from missing stone to wood, chrome, or an unrelated realm treatment.

## Output package

```text
<sheet-id>/
  source/
    *.ptex
  manifest/
    <sheet-id>.trim-sheet.json
  master/
    <sheet-id>-basecolor-1024.png
    <sheet-id>-normal-1024.png
    <sheet-id>-orm-1024.png
    <sheet-id>-affinity-1024.png
  runtime/
    <sheet-id>-basecolor-512.png
    <sheet-id>-normal-512.png
    <sheet-id>-orm-512.png
    <sheet-id>-affinity-512.png
  diagnostic/
    <layout-id>-debug-1024.png
    <sheet-id>-labeled.png
    <sheet-id>-repeat-3x.png
    <sheet-id>-mip-bleed.png
  qa/
    pack-report.json
    source-hashes.json
    output-hashes.json
    taste-ruling.json
```

Phase B may omit runtime normal/ORM/affinity files until those channels are admitted, but the
manifest states their status explicitly rather than pretending they exist.

## Clayroom and Guard Post proof order

1. Emit the six low-poly profile/run atoms with geometry-only neutral clay.
2. Validate straight runs, non-multiple lengths, corners, endpoints, opening splits, T-junction
   fallback, acute bevel, and cutaway ownership.
3. Build the exact `h6-v1` manifest.
4. Pack and mount the diagnostic sheet.
5. Deliberately test V inversion, wrong slot, whole-atlas wrapping, phase reset, and missing owner.
6. Build the Institutional six-band Material Maker source family.
7. Pack base color and pass the 1×, 3×, lit-slab, and fixed-camera cards.
8. Build the Upland family under the identical layout.
9. Compare both cultures on the same committed Guard Post topology and run origins.
10. Test geometry-only, plain-band, and untrimmed fallbacks.
11. Add condition affinity only after base trim reads cleanly.
12. Promote normal/ORM only if gameplay-scale captures materially improve.
13. Replay across changed road, retaining, wall, roof/cutaway, and culture seeds.

## Acceptance gate

The Guard Post trim system passes only when:

1. the complete scene still passes in neutral clay;
2. all six diagnostic roles land on the correct surfaces;
3. the atlas never samples a neighboring band;
4. left/right repetition is invisible at gameplay scale and acceptable in the 3× diagnostic;
5. two run lengths that are not repeat multiples maintain scale and phase;
6. ordinary corners, acute bevels, endpoints, apertures, and T-junction fallbacks remain clean;
7. trim disappears/ghosts with its true owning structure;
8. no trim changes collision, cover, pathing, sight, or interaction;
9. the Institutional and Upland sheets share byte-equivalent layout/UV metadata;
10. material/culture changes are visible but do not depend on hue or ornament alone;
11. no source contains baked directional light or indiscriminate overgrowth/damage;
12. base course, belt, cap, nosing, and curb retain credible physical scale;
13. 512 runtime gutters survive mip/filter inspection under the fixed production camera;
14. missing exact art follows the fallback ladder without changing site identity;
15. identical inputs produce byte-identical packed outputs and receipts;
16. no accepted seed or capture requires a map-specific strip or UV patch.

## Negative controls

Retain captures of:

- the whole atlas incorrectly wrapping in U;
- V coordinates sampling two slots;
- the sheet vertically inverted;
- a base course with brick units too small for the camera;
- a normal map strong enough to fake geometry;
- a corner with pinched/stretched motif;
- an aperture with trim illegally running through the void;
- overgrowth baked evenly into every band;
- the Upland post using the Institutional sheet only recolored;
- a destroyed wall leaving floating trim.

These controls make the contract visually falsifiable rather than merely descriptive.

## Deliberately deferred

- roof/eave, beam, frame, bridge, storefront, rail, and gutter slots;
- dedicated corner, endpoint, and T-junction art;
- carved narrative panels, plaques, heraldry, or signs;
- custom sub-rectangle-repeat shader;
- layout compaction into arbitrary atlas rectangles;
- parallax/height runtime use;
- broad material-family and realm matrices;
- damage-strip catalogs;
- culture-specific furnishing trim;
- unique trim generated for an individual map seed.

## Related Desktop working documents

- `GUARD-POST-MATERIAL-MAKER-1.3-SEED-GRAPH-SPEC.md`
- `GUARD-POST-FFT-LOW-POLY-CONSTRUCTION-SPEC.md`
- `GUARD-POST-CULTURAL-MUTATION-MVP.md`
- `GUARD-POST-LOCK-AUDIT.md`
- `/Users/adamstephenson/Desktop/Genesis Golden Sites - Structure and Material Catalog.md`

