---
type: working-material-foundry-spec
status: ROUGH BUILD SPEC — pinned to Material Maker 1.3
created: 2026-07-23
scope: reusable Guard Post material seeds, graph architecture, exports, mutation, and admission
---

# Guard Post — Material Maker 1.3 Seed-Graph Spec

## Outcome

Material Maker 1.3 is sufficient for the Guard Post material lane. The right unit of production is
not a finished disposable texture; it is a versioned **seed graph** with exposed parameters,
reusable custom subgraphs, named configurations, semantic outputs, deterministic exports, and a
recorded lineage from which future cultural, geological, historical, climatic, and realm mutations
can grow.

The Guard Post should begin with eight immediately buildable core seeds, one pending roof parent,
two derivative/support seeds, and one shared condition-response toolkit. It does not need a large
one-off texture batch.

## Founder rulings captured for later canon migration

Adam, 2026-07-23:

> "can you also spec out how the materials would be made in material maker? i have that working now
> and that is what we will be using for our material design. i could only get v1.3 working on this
> mac book, so that's what we are stuck with."

> "we want to save, re-use, and modify anything we make in MM, so we don't just use and throw away,
> every material should be considered a fertile seed for a future mutated version of that same
> material"

This Desktop spec pins every instruction to 1.3. It deliberately does not depend on nodes or project
behavior introduced in 1.4–1.7.

## Verified Material Maker 1.3 capabilities

The installed application is:

```text
/Applications/Material Maker 1.3.app
CFBundleShortVersionString: 1.3
executable: /Applications/Material Maker 1.3.app/Contents/MacOS/material_maker
```

The official 1.3 source tag is preserved read-only in:

```text
/Users/adamstephenson/Desktop/Genesis FFT Guard Post Study/material-maker-1.3/source
tag: 1.3
commit: 1a86d73967479c43db5fa17e5adda5e54a0c886f
```

Verified in that tag:

- procedural material projects are JSON-text `.ptex` files;
- the Static PBR Material node accepts albedo, metallic, roughness, emission, normal, AO, depth,
  opacity, and subsurface inputs;
- the built-in Godot 4 ORM export emits albedo, packed ORM, normal, and optional height/emission;
- subgraphs can expose inputs, outputs, and selected parameters;
- Remote nodes provide linked parameters, named configurations, and named parameters;
- selected custom nodes can be saved into reusable user libraries;
- each library is a standalone JSON file;
- material nodes support custom export targets;
- command-line batch export accepts multiple `.ptex` files, wildcards, target, output directory,
  and output size;
- 1.3 includes the needed bricks/uneven bricks, tilers, noises, FBM, Voronoi, warp, slope blur,
  morphology, remap/tones, color mapping, normal-map, and occlusion families.

Material Maker 1.3's own documentation and release notes are preserved in the pinned source. Public
primary references:

- [Material Maker 1.3 release notes](https://rodzilla.itch.io/material-maker/devlog/520779/material-maker-13)
- [Official Material Maker repository](https://github.com/RodZill4/material-maker/tree/1.3)
- [Official Material Maker site/documentation](https://www.materialmaker.org/doc)

## Important 1.3 reuse truth

Do not assume a magical cross-file live inheritance system.

Material Maker 1.3 can:

- turn a selected graph/subgraph into a reusable custom library node;
- expose and configure high-value parameters;
- store named configurations inside a graph;
- propagate an edited subgraph to same-named instances inside a project;
- save every project and library as readable JSON.

But an already-authored `.ptex` should not be assumed to update automatically when a library node is
changed later. Therefore:

1. admitted custom nodes are immutable and versioned;
2. existing materials keep the exact node version they were built with;
3. a newer node receives a new id/version;
4. graph lineage and parameter receipts live in a small external manifest;
5. migrations are explicit rebuilds, never silent library replacement.

That gives us fertile seeds without making old materials drift.

## Source-of-truth package for every material

Each admitted material family eventually owns:

```text
<material-id>/
  source/
    <material-id>-vNNN.ptex
  manifest/
    <material-id>-vNNN.material.json
  previews/
    native-tile.png
    repeat-3x3.png
    lit-slab.png
    gameplay-context.png
  exports/
    <material-id>-albedo.png
    <material-id>-normal.png
    <material-id>-orm.png
    <material-id>-height.png          # optional foundry/debug channel
    <material-id>-aux-*.png           # only declared auxiliary masks
  qa/
    export-hashes.json
    taste-ruling.json
```

The Material Maker project is the editable source. Exported PNGs are replaceable build products.
The manifest is a deterministic receipt, not a second visual graph.

### Minimum manifest fields

```text
materialId
materialVersion
displayName
semanticFamily
parentMaterialId?
parentMaterialVersion?
mmVersion: "1.3"
sourcePtex
sourceSha256
customNodeLibraryId
customNodeVersions{}
rootSeed
configurationName
exposedParameters{}
declaredPhysicalScale
supportedSurfaceRoles[]
cultureCompatibility[]
conditionCompatibility[]
exportProfile
exportSize
outputFilesAndHashes{}
fallbackMaterialId
licenseAndProvenance[]
tasteRuling
```

## Genesis Material Maker library

Create one versioned user-library JSON for reusable Genesis nodes rather than burying copies of the
same logic inside every material:

```text
genesis-material-seeds-mm13-v001.json
```

### Reusable custom-node catalog

| ID | Custom node | Recommended 1.3 building blocks | Outputs |
|---|---|---|---|
| `GMM-N01` | Broad macro field | `FBM 2` or `Wavelet Noise` → `Remap`/`Tones Range`; scale kept low | macro value, macro color selector |
| `GMM-N02` | Construction cells | `Bricks 3`, `Uneven Bricks 3`, or compatible tiler; fill outputs retained | height, unit fill/id, joint mask |
| `GMM-N03` | Restrained edge weathering | height/fill → low-strength `Slope Blur` and/or `Morphology` | softened height, edge-wear candidate |
| `GMM-N04` | Cavity/occlusion response | height → `Occlusion 2`; remapped and clamped | AO, cavity affinity |
| `GMM-N05` | Per-unit variation | fill → random grey/color → low-contrast `Color Map` or `Blend` | unit value/color, roughness offset |
| `GMM-N06` | Broad plane breakup | low-count Voronoi/FBM → `Tones Step`/quantize → very low-strength blend | large value planes; never crack lines |
| `GMM-N07` | PBR finisher | height → `Normal Map 2` + `Occlusion 2`; roughness clamp; channel routing | albedo, roughness, metallic, normal, AO, height |
| `GMM-N08` | Condition-affinity interface | cavity + upward/exposure candidate + macro noise + optional authored mask inputs | growth, damp, wear, deposit, repair-affinity masks |
| `GMM-N09` | Directional fiber/strata | `Directional Noise`/anisotropic noise + FBM + remap | timber grain or geological strata |
| `GMM-N10` | Trim-strip candidate | one material role sampled into a declared horizontal strip | aligned albedo, normal, ORM, height, aux strips |

Every custom node should:

- have a stable id and version in its display name;
- have documented inputs, outputs, parameters, units, and expected ranges;
- expose only controls that create meaningful reusable mutation;
- transmit a stable seed where randomness is intended;
- clamp outputs;
- include a neutral/default configuration;
- be tested alone before use in a family graph.

## Common root graph architecture

Every static PBR seed follows the same top-level organization:

```text
[construction pattern or broad natural field]
                  |
          [macro variation]
                  |
       [restrained weathering]
                  |
     +------------+-------------+
     |            |             |
  height       unit/fill      cavities
     |            |             |
 [normal/AO]  [albedo]      [roughness]
     |            |             |
     +------ [PBR finisher] -----+
                  |
       [Static PBR Material]

auxiliary masks branch from semantic intermediate outputs;
they do not feed back into geometry or invent site history.
```

Use comments/groups for:

1. semantic construction;
2. broad variation;
3. age-neutral surface character;
4. PBR response;
5. condition-affinity outputs;
6. export.

## Exposed-parameter discipline

Expose a parameter only if it is:

- meaningful across several future variants;
- stable enough to name and document;
- visible at gameplay scale;
- safe within a declared range;
- not a disguised site-specific paint operation.

Common parameter surface:

```text
variationSeed
declaredScale
macroScale
macroStrength
primaryPalette
secondaryPalette
heightStrength
normalStrength
roughnessBase
roughnessVariation
weatheringAmount
edgeWearAmount
cavityStrength
conditionAffinityStrength
```

Construction-specific parameters add unit width/height, joint width/depth, row irregularity,
fiber direction, stratum direction, or oxidation scale as appropriate.

Do not expose every node knob. A fertile seed is a coherent instrument, not a cockpit with forty
unrelated sliders.

## Guard Post material seed catalog

### `GP-MM-M01` — Old operational stone: coursed

**Use:** Institutional Frontier Works wall fields, retaining runs, plinths, and compatible floors.

**Graph route:**

```text
Bricks 3
  → Construction Cells
  → restrained Slope Blur/Morphology
  → per-unit low-contrast variation
  + broad macro field
  → stone palette mapping
  → PBR finisher
```

**Expose:**

- course count/physical unit scale;
- block aspect;
- row offset;
- joint width and depth;
- unit-size/position irregularity within a narrow band;
- edge softening/chip strength;
- broad value variation;
- stone roughness and mortar roughness;
- root seed.

**Starting visual band:**

- clearly repeated lifts, but not perfect modern brick;
- a few large units visible across a wall panel;
- recessed joints that read without black outlines;
- shallow normal response;
- quiet grey/earth value range;
- no pebble field, pore noise, or deep random craters.

**Mutations:** wetter/drier geology, larger frontier blocks, reclaimed mixed campaign, less-aged
repair stone, realm tint/response later.

### `GP-MM-M02` — Old operational stone: local rubble

**Use:** Upland Vernacular Station wall fields and terrain-fitted retaining work.

**Graph route:**

```text
Uneven Bricks 3 or Skewed Uneven Bricks
  → Construction Cells
  → bounded warp/edge weathering
  → per-unit fill variation
  + broad macro field
  → rubble palette mapping
  → PBR finisher
```

**Expose:**

- mean unit size;
- minimum unit size;
- row/placement irregularity;
- joint width/depth;
- controlled skew/warp;
- broad stone-value spread;
- edge weathering;
- root seed.

**Starting visual band:**

- irregular local units form a coherent wall field;
- the wall remains a broad value mass at gameplay scale;
- joints remain subordinate;
- no Voronoi flagstone web, random polygon confetti, or unstable silhouette.

**Mutation rule:** this is not “coursed stone with more noise.” It has its own construction-cell
logic but reuses the common macro, edge, condition, and PBR nodes.

### `GP-MM-M03` — Dressed operational stone

**Use:** corners, openings, lintels, sills, thresholds, caps, drains, barrier supports, and recent
replacement units for both cultures.

**Parent:** `M01` construction logic, simplified and regularized.

**Expose:**

- unit dimensions;
- joint width;
- dressing smoothness;
- edge wear;
- age;
- palette relation to the wall field.

**Starting visual band:**

- larger, flatter, cleaner faces;
- lower unit-to-unit variation;
- sharper but still worn edges;
- readable contrast from the field wall without becoming bright trim.

Configurations should include `institutional-regular`, `upland-local-dressed`, and
`recent-replacement`. These are parameter configurations, not unrelated textures.

### `GP-MM-M04` — Packed road and working apron

**Use:** pass-through road ribbon, narrowing, threshold apron, and working terrace.

**Graph route:**

```text
low-frequency FBM/cloud field
  + restrained directional breakup
  + sparse coarse aggregate field
  → packed-earth/stone color blend
  → shallow height and roughness
  → PBR finisher
```

**Expose:**

- earth/aggregate balance;
- aggregate scale and scarcity;
- compaction;
- broad dampness potential;
- macro color spread;
- root seed.

The base graph does **not** bake the Guard Post's exact wheel/foot lane. Traffic, clearing, puddling,
and threshold wear are projected later from the committed road geometry and use facts.

### `GP-MM-M05` — Quiet grass/soil ground

**Use:** broad approach shelves, shoulder top, negative-space fields, and soil exposures.

**Graph route:**

```text
very low-frequency soil/grass region field
  + weak directional fiber/noise
  → restrained green/earth color blend
  → nearly flat height
  → PBR finisher
```

**Expose:**

- grass/soil balance;
- grass value and dryness;
- broad patch scale;
- directional strength;
- height/normal strength;
- root seed.

The first version contains no dense modeled-blade illusion and no high-frequency lawn noise.
Sparse edge tufts, if later admitted, are a geometry/dressing family.

### `GP-MM-M06` — Geological outcrop rock

**Use:** shoulder cuts, cliff/riser exposures, and `GP-LP-T09/T10` rock clusters.

**Graph route:**

```text
Directional/anisotropic strata field
  + FBM macro mass
  → stepped/quantized broad plane response
  → restrained warp
  → geological palette
  → PBR finisher
```

**Expose:**

- stratum direction and scale;
- plane-breakup scale;
- fracture/edge strength;
- geological palette;
- roughness;
- root seed.

It must remain visibly distinct from masonry: no mortar network, no repeated construction units,
and no evenly sized stone cells.

### `GP-MM-M07` — Structural timber

**Use:** barrier, door/closure, lookout deck and supports, braces, cribbing, lintels, and future
furnishing proxies.

**Graph route:**

```text
Directional Noise / anisotropic field
  + low-frequency longitudinal value shift
  + restrained age/check candidate
  → timber palette
  → PBR finisher
```

**Expose:**

- grain direction and scale;
- board/beam value variation;
- age/darkening;
- roughness;
- shallow fiber normal;
- end-grain configuration;
- root seed.

Named configurations:

- `institutional-standard-section`;
- `upland-heavy-local`;
- `recent-repair`;
- `end-grain`;
- `roof-board` if the selected roof uses timber.

Plank seams and beam silhouettes remain geometry/trim responsibilities. Do not use the material to
fake the edge of a structural member.

### `GP-MM-M08` — Forged iron

**Use:** straps, hinges, brackets, barrier fittings, grate, fasteners, and future physical proxies.

**Graph route:**

```text
low-frequency hammer/oxidation field
  + sparse restrained pitting candidate
  → dark iron palette
  → metallic = 1
  → high but varied roughness
  → shallow normal
```

**Expose:**

- oxidation amount;
- hammer scale/strength;
- roughness;
- edge-polish candidate;
- palette;
- root seed.

Edge polish and fresh damage should consume geometry/event masks when available. The tiling base
must not wear every edge as if every piece had the same history.

### `GP-MM-M09` — Roof/weather family

**Status:** seed architecture is specified; the first roof construction remains a founder/capture
choice.

Build one parent graph with named construction configurations rather than unrelated roof textures:

- `timber-deck/board`;
- `split-timber-shingle`;
- `flat-local-stone-or-slate`.

The parent reuses `M07` for timber responses and `M06/M03` for geological/dressed stone responses.
Overlap rhythm may be material/trim, while the roof plane, pitch, eave thickness, and ridge remain
low-poly geometry.

Do not admit all three for Guard Post 1. Select only the culture-compatible branches proven by the
paired clay/material cards.

### `GP-MM-M10` — Interior reveal and cut-section

**Use:** opening reveals, open-top/cutaway caps, and subdued interior planes.

**Parent:** a quiet derivative of the owning wall/stone family.

It reduces contrast and surface variation while preserving construction identity. It is a
presentation derivative, not a new building material and not a black void.

### `GP-MM-M11` — Maintained-overgrowth response toolkit

This is a reusable **mask/response system**, not one green-stained stone texture.

Inputs or intermediate facts:

- cavity/joint affinity;
- upward-facing or sheltered-face candidate;
- moisture/drainage potential;
- low-frequency biological breakup;
- traffic/clearance suppression;
- repair suppression;
- explicit canonical overgrowth intensity.

Outputs:

- damp-darkening response;
- moss growth affinity;
- lichen affinity;
- crevice-growth affinity;
- deposit/grime affinity;
- cleared-use suppression;
- repair suppression.

Material Maker may author the base response textures and masks. The engine combines them with the
actual surface orientation, exposure, drainage, road use, threshold clearance, and repair facts.
The graph may never decide that the site is abandoned, wet, damaged, repaired, or overgrown.

### `GP-MM-M12` — Trim-role source strips

The complete source, layout, profile, packing, UV, channel, mutation, and fallback contract is in:

`GUARD-POST-TRIM-SHEET-MM1.3-SPEC.md`

The first stable layout is `genesis-architecture-core-h6-v1`:

1. compatible plain/fallback band;
2. base course;
3. cornice/wall belt;
4. coping/cap fascia;
5. stair/ledge nosing;
6. curb/retaining edge.

Material Maker creates each full-width horizontally seamless source band independently. The
deterministic Genesis packer owns the exact 1024 master layout, 512 fold, safe rectangles, vertical
gutters, channel alignment, hashes, provenance, and reports. Do not ask a single `.ptex` graph,
image-generation call, or runtime shader to own the final atlas layout.

Opening/threshold faces use dressed operational stone or the plain slot in v1. Roof/eave, beam,
frame, bridge, rail, and dedicated corner/endpoint roles wait for a versioned layout promotion.

## Culture and history binding

| Semantic role | Institutional Frontier Works | Upland Vernacular Station |
|---|---|---|
| wall field | `M01:coursed-frontier` | `M02:local-rubble` |
| operational edges | `M03:institutional-regular` | `M03:upland-local-dressed` |
| timber | `M07:institutional-standard-section` | `M07:upland-heavy-local` |
| iron | `M08:repeated-standard-fittings` | `M08:adapted-local-fittings` |
| repair | `M03/M07:recent-replacement` with measured drain/brace masks | local replacement plus crib/buttress/drain masks |
| overgrowth | same `M11` physical rules and canonical intensity | same `M11` physical rules and canonical intensity |

Culture is not a hue slider. At least the construction-cell logic, material-role distribution, and
one low-poly silhouette/assembly channel differ coherently.

History is not baked into the base family. Old construction, current occupancy, recent repair,
traffic clearing, and moisture/growth response remain separable layers.

## Export contract

### First authoring resolution

- author and taste at `512 × 512`;
- increase a family or source strip to `1024 × 1024` only when a gameplay-scale capture identifies
  a real deficit;
- do not create 2K/4K masters by default for this low-poly fixed-camera target;
- keep declared physical scale independent of pixel resolution.

### First PBR payload

Required:

- albedo/base color;
- normal;
- packed ORM: red AO, green roughness, blue metallic.

Optional foundry/debug:

- height;
- unit/fill id;
- joint/cavity;
- growth affinity;
- wear/traffic affinity;
- repair eligibility/suppression.

Keep auxiliary outputs only when a runtime or foundry consumer is named. “Might be useful” is not
enough to enlarge every material.

### Built-in batch-export command

Material Maker 1.3's pinned source supports:

```bash
"/Applications/Material Maker 1.3.app/Contents/MacOS/material_maker" \
  --export-material \
  --target "Godot/Godot 4 ORM" \
  --size 512 \
  -o <existing-output-directory> \
  <one-or-more-input.ptex>
```

Wildcards are supported by the 1.3 exporter. The output directory must already exist.

First use the built-in `Godot/Godot 4 ORM` target for the primary PBR payload. A later
`Genesis Guard Post` custom export target may add consistently named auxiliary masks, but it should
be versioned and verified before it becomes the batch default.

### Determinism receipt

For each export:

1. record app version, graph version, source hash, node-library versions, root seed,
   configuration, parameters, target, size, and command;
2. export twice to separate directories;
3. hash all outputs;
4. require byte-identical hashes or document the exact non-deterministic cause before admission;
5. preserve the successful receipt with the taste card.

## Mutation law

There are three legal mutation levels:

### Level 1 — named configuration

Use a Remote-node configuration when the same graph topology supports a coherent variant:

- old versus recent stone;
- institutional versus upland dressed edge;
- standard versus heavy timber;
- dry versus damp-compatible roughness response.

### Level 2 — child material graph

Fork a new `.ptex` with explicit `parentMaterialId` when the mutation needs a new graph branch or
construction logic:

- coursed masonry to rubble masonry;
- timber face to materially different shingle assembly;
- sedimentary strata to volcanic rock behavior.

The child reuses versioned custom nodes and retains provenance.

### Level 3 — new family

Create a new semantic family only when the material's construction and response cannot truthfully
be represented as a configuration or child:

- metal is not a stone preset;
- grass/soil is not road dirt with a green palette;
- geological rock is not mortarless masonry.

Never destructively edit the only source of an admitted material. New work increments a
configuration, child id, node version, or material version.

## Naming

```text
Project graph:
  gp-mm-m01-old-stone-coursed-v001.ptex

Custom node:
  GMM-N02 Construction Cells v001

Configuration:
  institutional-frontier-aged

Export prefix:
  gp-mm-m01-v001-institutional-frontier-aged
```

Names describe semantic material and lineage. Avoid `final`, `final2`, `nice`, `test-good`, or
camera-specific names.

## Taste-card gate

Every seed graph must be reviewed as:

1. native 1× tile;
2. 3×3 repeat field;
3. lit wall slab;
4. lit floor or slope slab if supported;
5. fixed-camera Guard Post context with a canonical standee;
6. culture-paired context when culture-bound;
7. neutral clay comparison proving the material is not inventing geometry.

Pass only when:

- the standee remains the visual star;
- the tile does not reveal an obvious repeat at gameplay scale;
- unit/joint scale matches declared world scale;
- normal response strengthens broad construction without sparkle or fake depth;
- albedo remains readable without baked lighting;
- roughness separates stone, timber, iron, road, grass/soil, and damp response;
- material changes do not alter route, cover, opening, or collision truth;
- overgrowth follows cavities/moisture and avoids traffic, working clearances, and recent repair;
- the two cultures do not rely on color alone;
- the source graph, library nodes, receipt, hashes, and fallback are preserved.

### Negative controls

At least one card per relevant family deliberately shows:

- unit scale too small;
- normal strength too high;
- macro contrast too strong;
- joints too dark/deep;
- overgrowth ignoring traffic/repair;
- rock accidentally reading as masonry;
- culture changed only by hue.

The accepted graph must visibly outperform its negative control at the production camera.

## Build order

1. Build and save the Genesis MM 1.3 custom-node library.
2. Prove `M01` coursed stone and `M02` rubble stone on the same clay wall.
3. Derive `M03` dressed operational stone.
4. Prove `M04` road, `M05` quiet grass/soil, and `M06` geological rock together on one elevation/
   road/rock Clayroom fixture.
5. Prove `M07` timber and `M08` iron on the threshold/barrier fixture.
6. Select and prove only the necessary `M09` roof configurations after the roof clay choice.
7. Build `M11` condition-affinity outputs and test maintained overgrowth against traffic, drainage,
   and recent repair.
8. Export `M12` role strips only after the base families pass.
9. Run the paired culture cards.
10. Admit materials to the golden Guard Post only after its architecture passes in neutral clay.

## What is deliberately not being built yet

- culture-specific furnishing materials;
- large prop catalogs;
- unique heraldry, signs, banners, or decorative hero assets;
- dense grass cards or modeled vegetation;
- bespoke scene-painted dirt/wear maps;
- a full culture × realm × climate × age matrix;
- multiple roof systems per culture;
- site-specific material graphs that cannot be reused;
- microdetail intended only for close-up inspection.

## Related working documents

- `GUARD-POST-FFT-LOW-POLY-CONSTRUCTION-SPEC.md`
- `GUARD-POST-CULTURAL-MUTATION-MVP.md`
- `GUARD-POST-LOCK-AUDIT.md`
- `FFT-TO-GENESIS-RELATIONAL-SHAPE-GRAMMAR-STUDY.md`
- `GUARD-POST-TRIM-SHEET-MM1.3-SPEC.md`
