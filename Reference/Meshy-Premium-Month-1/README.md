# Meshy Premium Month 1 reference inputs

Production slate:
[`docs/MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md`](../../docs/MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md)

These images are inputs for Meshy Image-to-3D. They are not runtime assets or proof that a
generated model has passed Genesis admission.

## Shared contract

- isolated object;
- orthographic front-three-quarter view unless otherwise declared;
- complete silhouette with generous padding;
- warm light-gray background;
- no floor, base, cast shadow, contact shadow, scenery, character, text, or watermark;
- broad construction-aligned low-poly planes;
- neutral lighting and muted material regions;
- separable parts made visually explicit;
- no direct reproduction of an existing commercial game asset.

## Fast incoming-file workflow

Adam does not need to rename Meshy downloads.

1. Save or drag the download into `incoming/` with whatever filename Meshy supplies.
2. Say that the file is in and identify the model ID only if more than one test is active.
3. Codex inspects the GLB, confirms which stage was downloaded, and renames it canonically.
4. Codex never admits or commits the file until its contents match the canonical name.

Canonical pattern:

```text
M###-V-short-family-name-stage.glb
```

Examples:

```text
M019-A-universal-four-wheel-wagon-chassis-original.glb
M001-A-low-cover-boulder-cluster-remesh-400.glb
M001-A-low-cover-boulder-cluster-clean-v1.glb
```

`original`, `remesh-N`, and `clean-vN` describe actual file state. They are not interchangeable.
Avoid overwriting an earlier download when convenient because the comparison can help diagnose a
failure, but an overwrite is acceptable when the prior stage is knowingly disposable.

## M001-A — low-cover boulder cluster

![M001-A](reference-images/M001-A-low-cover-boulder-cluster-v1.png)

### Intended use

A compact `cover-anchor` rock mass for:

- half cover at a route edge, outside bend, terrace, or boundary cap;
- one local geological landmark without destroying quiet ground;
- recolored sedimentary families across guard-post, camp, lair, mine, and abandoned-site schemas;
- extracting one primary and two subordinate rock donors if Meshy preserves useful islands.

Implied production dimensions are approximately 5 feet wide, 3.5 feet deep, and 3 feet tall.
The cluster must not become a climbable stair, a rubble field, or a substitute for terrain-owned
elevation.

### ImageGen production prompt

```text
Use case: stylized-concept
Asset type: Genesis Fantasy volumetric donor-model reference for Meshy Image-to-3D

Create one isolated compact low-cover boulder cluster for a mature low-poly tactical fantasy
game. It must fit approximately within one 5-foot tactical cell and read as waist-high half
cover: about 5 feet wide, 3.5 feet deep, and 3 feet tall in implied human scale. Compose
exactly three substantial interlocking stones: one broad primary rounded layered boulder and
two smaller subordinate stones tucked tightly against its base. Form one stable compact cover
mass without spreading into a field or creating a climbable staircase. Give the cluster a
broad flat, contact-aware underside suitable for procedural terrain.

Use extremely simple deliberate geometry with large construction-aligned polygonal planes.
Each stone reads as a one- or two-ring irregular polyhedron with a controlled rounded
silhouette, not smooth subdivision. Broad facets follow geological layers, pressure breaks,
buried edges, and silhouette changes. Use a few meaningful planes rather than dense
triangulation. Preserve three understandable stone masses while making their contacts feel
naturally embedded and structurally stable.

Mature, restrained polygonal fantasy asset reference; modern tactical-diorama readability;
geology first. Muted weathered gray-brown sedimentary stone with two or three broad slightly
warmer strata. No photoreal texture and no toy appearance.

Exactly one object and one view. Controlled orthographic front-three-quarter projection from
approximately 45-degree yaw and 25-degree elevation. No lens distortion, perspective
convergence, dramatic foreshortening, model sheet, turnaround, inset, duplicate, or underside
view. Center and enlarge the complete cluster to use approximately 75 percent of the canvas
with generous clean padding.

Perfectly flat solid warm light-gray #E8E3DB backdrop. No floor, horizon, gradient, texture,
vignette, reflection, contact shadow, cast shadow, or lighting variation. Neutral diffuse
form description only: no directional key, rim light, dramatic highlight, painted ambient
occlusion, or baked shadow.

Avoid loose pebbles, gravel, scree, rubble field, tiny stones, moss, grass, roots, snow,
crystals, ore, plants, scenery, ground base, path, wall, characters, cracks drawn as black
lines, random triangle noise, cracked-glass faceting, micro-triangulation, smooth blob, voxel
art, pixel art, miniature base, climbable steps, tall full-cover outcrop, cave entrance, text,
watermark, or direct imitation of a commercial game asset.
```

### Meshy input settings

```text
mode: Image to 3D
topology: Smart Topology
target: 400 polygons
texture: off
image enhancement: off
```

Canonical admitted-download name:
`incoming/M001-A-low-cover-boulder-cluster-remesh-400.glb`

Do not buy or preserve generated micro-cracks, pebbles, or surface grain. Genesis materials own
geological color and restrained layer variation. Geometry owns only the three large silhouettes,
their broad facets, their stable contact, and any genuinely useful separation between the stones.

### Admission test

M001-A passes only if:

- it remains one compact half-cover footprint;
- it reads cleanly at the fixed game camera without a generated texture;
- no stone becomes an accidental stair or movement surface;
- the accepted cluster lands within roughly 150–600 triangles after cleanup;
- cleanup is faster than producing three `GP-LP-T09` procedural rocks;
- the silhouette or geological plane logic is materially better than the procedural recipe.

If it fails the final condition, remove ordinary boulder clusters from paid production and keep
Meshy only for exceptional rock mouths, transitions, roots, and strange formations.

### First intake — settings mismatch, silhouette provisionally passed

![M001-A high-poly diagnostic](intake-previews/M001-A-highpoly-settings-mismatch.png)

The first downloaded file overwrote the same temporary download name later used for the remesh.
Its neutral diagnostic preview is retained, but the 23 MB settings-mismatch GLB itself is not.
It contained:

- 139,328 triangles and 72,220 vertices;
- four embedded texture images;
- 24 disconnected geometric islands inside one unnamed mesh;
- the intended stable three-rock silhouette when inspected in neutral Blender clay.

This is a settings mismatch, not a failed reference image. Do not repeat Image-to-3D. Remesh the
existing Meshy model with fixed triangle topology at 400 faces. Texture may be omitted in Meshy or
stripped locally after download.

Save that result as:
`incoming/M001-A-low-cover-boulder-cluster-remesh-400.glb`

### Second intake — accepted

![M001-A cleaned clay proof](intake-previews/M001-A-clean-v1.png)

The remesh arrived with 420 triangles, 222 vertices, no materials, and no embedded textures.
Meshy represented each intended rock as two near-identical overlapping shells: six disconnected
islands rather than three. `scripts/model-foundry/clean-meshy-rock-cluster.py` paired the shells by
matching bounds, kept the larger outer shell in each pair, and exported three named rock objects:

```text
rock_primary
rock_left_subordinate
rock_right_subordinate
```

Accepted production donor:
`processed/M001-A-low-cover-boulder-cluster-clean-v1.glb`

The accepted cluster is 236 triangles. It preserves the compact half-cover silhouette, has no
accidental stair, reads without textures, and required deterministic cleanup rather than manual
sculpting. M001-A passes calibration. Ordinary rocks remain candidates for procedural generation,
but Meshy is admitted for authored cover-anchor clusters when this stronger composed silhouette is
worth the generation.

### ImageGen correction record

The first call produced a visually useful five-view model sheet. It was rejected because a
multi-object sheet violates the single-subject Meshy contract. The accepted image is a second
ImageGen pass preserving only the first pass's upper-left cluster as one enlarged orthographic
view. This presentation correction did not change the family design.

## M019-A — universal four-wheel wagon chassis

![M019-A](reference-images/M019-A-universal-four-wheel-wagon-chassis-v2.png)

### Intended use

A high-reuse donor chassis for:

- camp household and military carriers;
- merchant and urban service wagons;
- guard-post supplies;
- mine haul and maintenance;
- broken roadside wrecks;
- improvised barricades;
- cargo, canopy, lantern, cage, sideboard, and repair attachments.

### Generation prompt

```text
Use case: stylized-concept
Asset type: Genesis Fantasy volumetric donor-model reference for Meshy Image-to-3D

Primary request: Create one isolated universal four-wheel fantasy freight wagon chassis.
It must be reusable as a camp carrier, merchant wagon, supply wagon, barricade wreck, and
mine service cart. Preserve these distinct donor parts: narrow timber chassis, four
separate thick circular wooden wheels with simple iron tires, simple front axle and rear
axle, long centered pull tongue, low plank cargo bed, simple axle blocks, and four square
corner sockets for removable canopy hoops, sideboards, lanterns, cages, or cargo. No
animal, driver, cargo, canopy, or ground base. Keep connection hardware simple and
mechanically plausible. The reference should suggest extremely simple geometry; do not
model fasteners unless essential to the silhouette or separation of a major part.

Visual language: mature, restrained, high-tier polygonal fantasy art. Construct the visible
design with fewer, larger, deliberate triangular planes. Large facets must follow
silhouette, construction, material boundaries, carving, folds, forging, anatomy, or
fracture logic. Use smaller facets only at important transitions such as hinges, sockets,
clasps, relief borders, damage, or other semantic landmarks. The result must read as
sculpted low-poly form, not a triangle filter or cracked glass. Preserve ornate identity
and believable wear. Avoid cute, toy-like, glossy, generic starter-tier art.

Projection: controlled orthographic front-three-quarter volumetric reference, wagon facing
toward the left-front. No lens distortion, foreshortening, or perspective convergence.
Entire tongue, cargo bed, all four wheels, axles, and sockets fully visible with generous
padding. The view exists only to communicate separable volume to Meshy.

Geometry ownership: source art owns silhouette, broad albedo regions, polygonal material
facets, paint, carving marks, wear, and damage marks. Real runtime geometry will own
thickness, bevels, side faces, true relief, shadows, and directional lighting. Do not paint
those into the source.

Volumetric donor clarification: this image is source evidence for provisional Meshy volume,
not an extruded sprite or final runtime object. Show the chassis and major parts as simple
visible solid forms, but do not fake thickness with painted shadows or surface texture.
Meshy output remains a donor that will be rescaled, simplified, segmented, re-materialed,
and validated locally.

Backdrop: perfectly flat solid warm light-gray #E8E3DB background. The background must be
one uniform color with no gradient, texture, floor, horizon, reflection, contact shadow,
cast shadow, or light variation. Keep generous clean padding.

Composition: single full-canvas component. One isolated wagon chassis centered and fully
visible with a crisp silhouette and generous empty separation. No labels, captions,
decorative border, neighboring unrelated objects, floating debris, scenery, hands,
characters, text, or watermark.

Materials: large clean regions of muted weathered oak and charcoal iron. Restrained wear
only at major plank edges and wheel rims. No photoreal grain, no dense bolts, no ornamental
carving, no painted directional light.

Avoid: pixel art, fake pixels, voxel art, micro-triangulation, dense tessellation,
cracked-glass pattern, random polygon noise, poster illustration, baked directional light,
rim light, cast shadow, perspective painting, scene dressing, or generic mobile-game loot.

Also avoid direct copying of any existing commercial game asset, cinematic CRPG density,
MMO proportions, cartoon styling, chibi forms, collectible-miniature presentation, glossy
plastic, photorealism, dense greebles, bent axles, oval wheels, fused wheel-and-body
silhouette, loose clutter, or scenery.
```

### Initial visual review

Promising:

- clear chassis, bed, wheel, tongue, and socket ownership;
- useful neutral construction;
- strong complete silhouette;
- no scene contamination;
- immediately understandable reuse.

Watch in Meshy:

- plank grain and iron fasteners may produce unnecessary surface geometry;
- rear axle and far wheel separation must be checked in orbit;
- the attachment sockets must emerge as distinct parts rather than being fused to the rails;
- the model may need a much lower target polygon count than the image implies.

### Meshy intake result

Source:
`incoming/M019-A-universal-four-wheel-wagon-chassis-original.glb`

Processed donor:
`processed/M019-A-wagon-chassis-clean-v1.glb`

Meshy's original doubled extension was normalized after the intake convention was approved.
Meshy delivered one unnamed mesh with 1,898 triangles and 59 disconnected geometric islands.
The chassis, shafts, bed, braces, axles, and corner sockets were useful.
The four wheels were the only conspicuously dirty forms: they consumed 20 islands and 935
triangles, with lumpy rims and radial fan triangulation.

`scripts/model-foundry/clean-meshy-wagon.mjs` preserves the source, removes only the isolated
wheel geometry, and exports:

- one named `wagon_chassis` mesh;
- one named `clean_low_poly_wheel` mesh instanced by four named wheel nodes;
- 963 retained chassis triangles;
- 272 triangles in the reusable wheel;
- 2,051 visible triangles in the complete four-wheel scene.

Inspect either GLB with:

`dev/model-foundry/meshy-intake.html?model=/Reference/Meshy-Premium-Month-1/...`

### Superseded first pass

`reference-images/M019-universal-four-wheel-wagon-chassis.png` is retained as prompt-drift
evidence. It is not the current Meshy input. The second pass quoted the governing art-language
blocks verbatim, removed unnecessary iron fasteners, simplified the axle assembly, and produced
a cleaner donor silhouette.
