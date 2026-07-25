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
`incoming/M019-A-wagon-chassis-original.glb .glb`

Processed donor:
`processed/M019-A-wagon-chassis-clean-v1.glb`

The literal doubled `.glb .glb` source filename came from the download and remains untouched
as intake provenance. Meshy delivered one unnamed mesh with 1,898 triangles and 59 disconnected
geometric islands. The chassis, shafts, bed, braces, axles, and corner sockets were useful.
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
