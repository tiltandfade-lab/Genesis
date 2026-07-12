---
type: graphics-review
project: Genesis
status: ACTIONABLE 2026-07-12
audience: Claude/Codex graphics sessions
targets: vq-battle-scenes frames 12 and 19
---

# Stage C Art-Direction Review

## Ruling

Wave C is good infrastructure and incomplete visual acceptance.

Keep C1/C2/C3/C3b. The renderer can now express rolled dimensions, non-rectangular room contours,
polygon-derived exits, and floor tiers. Those are necessary. The shipped capture gate only proves that
a bare shell reads as an octagon, rotunda, or L. It bypasses the composed ShotPlan, carries no encounter,
does not run production `trayFrom` dressing, and originally supplied no `side` roll. It therefore does
not prove the Stage C North Star claim that frames 12 and 19 are structurally possible.

Do not reopen the geometry implementation as a failure. Reopen its art gate as an integration target.

## Findings

### P1: C2 discarded canonical layered terrain

`src/engine/place-spatialize.js` selected the first raised/sunken keyword and emitted exactly one patch.
Dungeon Area Type row 101 contains two simultaneous facts: a 30' x 30' sunken central arena and a 10'
wide raised ring walkway. The old path kept the arena and discarded the ring. This is both a walk-fidelity
bug and the direct reason the octagon capture lacked the target frame's strongest compositional device.

Corrected in this review branch:

- parse each semicolon-delimited structural clause independently;
- preserve every patch in `rooms[].terrain` in narrative order;
- treat a ring's dimension as width, not a square fallback footprint;
- derive ring cells inward from the room's real shaped boundary;
- preserve explicit vertical feet as one-foot tier quanta instead of flattening all heights/depths;
- make the room-shell compiler preserve holes in annular tiers instead of filling over sunken floors;
- stamp all patches into the existing deterministic tier buffer;
- retain the singular parser as a compatibility seam;
- gate exact row 101 behavior in `dev/verify-stage-c-terrain.mjs`.

### P1: C1 changes canonical small rooms to solve a staging problem

`SPATIAL_MIN_CELL = 4` turns a rolled 10' x 10' room into 20' x 20'. That makes placement easier but
rewrites structure. This conflicts with the walk-native rule and with the card-dealing design: a cramped
room is meaningful, and overloaded cards should be dealt into empty rooms, secret annexes, adjacent
encounters, or deferred reveals rather than forcing the source room larger.

Do not remove the clamp casually because combat, camera, and dressing fixtures may rely on it. Replace it
as a dedicated follow-up:

1. Store `canonicalWCells/canonicalDCells` from the roll without a furnishability floor.
2. Make logical room cells canonical.
3. Add a staging capacity calculation based on walkable cells, occlusion, required citizens, and exits.
4. Send overflow cards back to the graph dealer with a typed reason such as `capacity:spatial`.
5. Let the camera use a tight-room profile; never enlarge canon in the render adapter.

### P1: the shape capture bypasses the production visual stack

`capture-stage-c3-shapes.mjs` directly calls `spatializePlan -> semanticizePlan -> interiorBuildBoard`,
adds no pieces, and turns shot composition off. This is appropriate as a geometry diagnostic. It is not
an art gate. Keep it, but add an integrated sibling that goes through `trayFrom`, `walkSceneFrom`, the
card projection, dressing, pieces, ShotPlan, camera composition, light rig, and final post.

The integrated gate needs two fixed canonical fixtures:

- **Frame 12 fixture:** exact row-101 Gloom Grand Octagon, sunken arena, raised ring, one visible
  practical, one threat cluster, party cluster, and only roll-licensed bones/railings/dressing.
- **Frame 19 fixture:** Fantasy room whose actual rolls license several floor levels, stairs, cover,
  ruins, and a centerpiece; no arbitrary art-test nouns.

Every staged item must emit `sourceRef`. The capture JSON must fail when a required source field has no
visual citizen or when an unlicensed noun appears.

### P1: semantic nouns still collapse to generic geometry

`theater-data.js` maps every projected centerpiece, feature, interactable, dressing item, cover item,
and guise to `billboard`. Separately, `theater-interior.js` maps every blocker to a deterministically
random generic furniture recipe. A rolled dead hedge can therefore become a cabinet; a rubble wall can
become a table. Determinism does not make the silhouette truthful.

Replace role-only routing with a generated visual binding:

```js
{
  sourceRef,
  nounClass: "rubble-wall",
  constructionClass: "FACED_BOX_ASSEMBLY",
  renderStrategy: "full-3d-prop",
  recipeId: "masonry-collapse-01",
  footprint: { w: 2, d: 1, blocksMovement: true },
  stateChannels: ["intact", "breached", "collapsed"],
  fallback: "semantic-rubble-volume"
}
```

The fallback must preserve noun class and occupancy even when no bespoke generated art exists. A rubble
wall may degrade to a seeded stack of masonry prisms; it may not degrade to unrelated furniture.

### P1: Stage B is now on the critical path, not a parallel polish lane

The mock frames depend on figures behaving like physical standees. Current strategy metadata is only a
categorical geometry choice. The next renderer needs per-asset content bounds, foot anchor, intended
world height, base radius, alpha policy, edge dilation status, and QA flags. Without these, better room
geometry makes floating feet, square alpha shadows, inconsistent scale, and edge-on disappearances more
obvious.

Finish Stage B before judging Stage D/E integrated beauty. Sprite generation may continue in parallel,
but no generated sheet is production-ready until it passes the in-engine citizenship matrix.

### P2: free-standing dressing is over-billboarded

Trees, tombstones, boulders, wagons, coffins, ruined columns, and centerpieces cannot all be one
camera-facing plane. Camera-facing cards are correct for creatures and selected foliage clusters.
Objects with stable orientation, cover, an inspectable side, or a large footprint need generated
low-poly recipes, crossed-card clusters, extruded silhouettes, or hybrid card-plus-volume construction.

Use the cheapest strategy that preserves silhouette and gameplay truth:

| Asset | Preferred construction |
|---|---|
| creature/NPC | lit standee with thin side shell and plinth |
| grass/reeds/small foliage | 2-3 crossed alpha cards, seeded yaw |
| tree | procedural trunk/branches plus 2-4 foliage cards |
| tombstone/column/crate | faceted procedural mesh with generated surface maps |
| rubble/bone pile | seeded instanced primitive assembly plus sparse decal |
| wall art/screen/banner | wall-locked shallow extrusion |
| stain/crack/track | depth-biased decal, never upright card |
| fire/smoke/spell | layered FX planes plus a visible licensed emitter/object |

### P2: non-rect rooms remain materially flat

Stage C explicitly deferred non-rect AO/material finish. That is visible in the captures: the room has a
new outline but still reads as one repeated floor field. Stage E must derive material variation in world
space, not one texture per cell. The room-shell compiler should provide world position, tier, boundary
distance, curvature/edge class, and semantic surface id to the material layer.

## No-Human Production Contract

There is no artist fixing an alpha fringe, moving a foot anchor, sculpting a missing prop, or relighting a
bad room. Every beautiful effect must therefore be reproducible data plus a gate.

### Generated sprite intake

1. Generate preferred 1x4 horizontal view strips; each cell is a 4:6 portrait with consistent scale.
2. Slice by declared grid, never visual guessing.
3. Flood-fill or chroma-key the background in linear color with spill suppression.
4. Dilate RGB beneath transparent edge pixels before mip generation.
5. Compute alpha content bounds and the lowest connected opaque support region.
6. Infer `footX/footY`; reject multi-island ambiguity unless the manifest declares swarm/group.
7. Normalize world height by semantic size class, not source PNG dimensions.
8. Generate mipmaps after edge dilation; use alpha test for opaque standees and reserved blending only
   for genuinely translucent FX.
9. Render every view under the standard room's realm x light x yaw matrix.
10. Promote only when feet, edge, silhouette, scale, plinth, shadow, and dark-room readability pass.

### Standee renderer

- Front art uses a dedicated standee material, never the world PSX material.
- Separate readability from exposure: bounded key/fill response plus restrained rim, no full-bright card.
- Use alpha-tested depth writing for the opaque body to eliminate sorting glitches and square shadows.
- Add a 0.015-0.035u side shell from the alpha silhouette or a shallow beveled card hull.
- Mount the foot anchor to the floor-contact map, not the image rectangle.
- Use a stable world-up beveled plinth sized from metadata.
- Render a soft contact pool or blob shadow constrained beneath the foot/plinth, not a rectangular plane.
- Keep sprite color management on the same linear-to-display path as the world; avoid double sRGB.

### Procedural prop factory

Generated image art is surface evidence, not permission to fake volume with a plane. Build a small grammar
of deterministic recipes: slabs, posts, arches, cylinders, tapered trunks, branches, rubble clusters,
cloth planes, chains/rails, vessels, and furniture frames. A recipe chooses dimensions from semantic size,
uses seeded variation, assigns occupancy, and receives generated albedo/normal/roughness or a procedural
material. Instancing keeps this affordable.

The generator should output a manifest entry, not just a PNG:

```json
{
  "slug": "gloom-clutter-brokentombstone",
  "nounClass": "tombstone",
  "constructionClass": "MODEL_RECIPE",
  "recipeId": "grave-marker-broken",
  "dimensions": [0.55, 1.1, 0.18],
  "footprintCells": [1, 1],
  "materialFamily": "gloom-funerary-stone",
  "states": ["upright", "fallen", "shattered"],
  "qa": { "silhouette": "pass", "occupancy": "pass", "material": "pass" }
}
```

### Material and lighting path

1. Move shell/prop surfaces to `MeshStandardMaterial` or a controlled equivalent.
2. Generate normal and roughness from accepted albedo, but clamp them by semantic material family.
3. Assign metalness semantically; never derive it from luminance.
4. Add boundary-distance AO, riser darkening, contact darkening, and sparse condition decals.
5. Define one visible dominant practical and at most one supporting shadow light for a normal room.
6. Compute exposure from a stable profile, not frame-by-frame auto-exposure.
7. Restrict bloom to emissive masks; bright diffuse stone must not glow.
8. Apply depth-aware focus only after camera/subjects are locked; never screen-Y blur.
9. Keep one color-management path and add subtle output dither after grading.

## Ordered Route To The Mock Frames

1. **C2.1 layered terrain correction**: landed on this review branch; preserve row 101 completely.
2. **B1-B4 sprite citizenship**: metadata, alpha/anchor fold, physical standee renderer, matrix gallery.
3. **D0 semantic construction resolver**: replace role-only billboards and random furniture substitution.
4. **D1 procedural prop grammar**: core structural/dressing noun classes with truthful fallbacks.
5. **D2 stateful keystone slice**: door, lever, chest, fire, shrine, portal, trap, persistent traces.
6. **C-art integrated fixtures**: exact frame-12/frame-19 walk-derived scenes through production `trayFrom`.
7. **E1 materials**: world-space PBR shell/prop system, tier/riser/boundary response, realm families.
8. **E2 light rigs**: visible practical hierarchy, shadow budget, sprite/world readability balance.
9. **E3 post**: emissive bloom, depth-aware focus, restrained grade/vignette/dither.
10. **Promotion gate**: compare integrated captures at desktop and mobile gameplay size; require provenance,
    pixel metrics, sprite metrics, camera metrics, performance, and human art-direction read.

## Acceptance Metrics

Automated metrics narrow failure; they do not replace the final visual read.

- 100% of required visible walk cards have a staged citizen or a typed reserve reason.
- 0 unlicensed visible nouns; 0 hidden facts leaked before reveal.
- 0 canonical dimensions enlarged by renderer policy.
- 0 unresolved core-three sprite assets.
- foot-to-floor gap <= 2 screen pixels; plinth normal world-up within epsilon.
- no square alpha shadows, chroma fringe, double-sRGB sprites, or blended-depth sorting breaks.
- medium figure height 18-25% of frame; all living subjects inside 7% safe frame.
- primary figure overlap < 15%; at least one stage edge visible; no neighbor room shell.
- one dominant bright region; diffuse near-white clipping < 0.5%; highlight band <= about 8%.
- dominant practical is visible and brighter than every non-emissive surface.
- stable 60 fps target on Adam's reference machine with capture-time frame metrics recorded.

## Note To Claude

Your Wave C implementation is worth keeping. The correction is about what the milestone was allowed to
claim, not about discarding the work. The geometry compiler is finally capable of carrying the table's
structure. Please use this review as the next execution contract:

- preserve the walk/table facts before solving staging;
- make capture fixtures exercise production composition, citizens, and provenance;
- treat the sprite contract as renderer infrastructure, not an asset-shopping task;
- resolve nouns to truthful construction classes before adding more dressing volume;
- make every effect reproducible by generation/folding/runtime rules because no human cleanup pass exists;
- do not use contrast, bloom, fog, or prop count to disguise missing composition/material structure.

The visual target is not “more detailed.” It is a legible photographed miniature: one canonical room,
one action cluster, truthful physical citizens, one dominant practical, controlled materials, and enough
darkness around the stage to make the rolled story feel deliberately presented.
