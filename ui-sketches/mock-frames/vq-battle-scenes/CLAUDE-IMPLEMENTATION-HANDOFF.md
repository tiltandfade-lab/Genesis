# Claude Implementation Handoff: From Current Theater to the VQ Battle Frames

Audience: Claude sessions implementing Genesis graphics after 2026-07-11.

Read this with:

- `docs/GRAPHICS-ENGINE.md`
- `docs/BEAUTY-WAVE-5.md`
- `docs/DIEGETIC-LIGHT.md`
- `docs/LIGHT-SIGHT-POLISH.md`
- `docs/SPRITE-GEN-V2.md`
- `docs/TABLETOP-VISION.md`
- `ui-sketches/mock-frames/vq-battle-scenes/WALK-NATIVE-DIORAMA-CONTRACT.md`
- `ui-sketches/mock-frames/vq-battle-scenes/NOTES.md`

The twenty PNGs in this directory are visual requirements and composition targets. They are not
literal asset sheets and they do not imply that an artist will hand-correct a room, light, sprite,
texture, or camera. Genesis has no human graphics-production loop. Every visible result must be
derived from authored tables/state, generated sprite or texture assets, deterministic assembly, and
renderer rules that can survive arbitrary seeds.

### Walk-system correction (2026-07-12)

The walk system is Genesis's content spine. Read the dedicated walk-native contract linked above
before implementing this document. `ShotPlan`, trays, spatial plans, shells, and dioramas are
projections of a canonical walk segment and its persistent overlay; they are not peers of the walk
and they do not get to generate, reject, or replace its content. Where this document uses the word
"curation," interpret it as **selective visual objectification**: all rolled fields remain on the
segment, while a source-referenced staging reserve keeps over-budget fields available to the DM and
future frames even when only a small subset becomes geometry now.

## 0. Intent

The images are meant to stop the project from optimizing the current output locally. They show the
target *construction grammar*:

1. One contained miniature stage in darkness.
2. One active action cluster, not a map overview.
3. Dimensional terrain and props with material response.
4. Flat generated standee art, visibly seated on physical bases.
5. One dominant diegetic light story and a real value hierarchy.
6. Sparse, selected scene nouns rather than every rolled noun rendered at once.
7. A camera that composes the encounter and lets occluders fade when necessary.
8. Persistent physical consequences: opened doors, toppled bodies, rubble, stains, pits, and
   breached terrain.

Do not attempt to reach the frames by increasing prop count, texture contrast, global saturation,
bloom, or ambient light. Those moves make the current failure mode more elaborate. The primary gap is
stage construction and shot direction. Rendering polish matters after the scene has a legible shape.

## 1. Ground Truth in the Current Tree

The existing engine is not starting from zero. Preserve and build through these seams:

- `src/engine/theater-data.js`
  - `trayFrom(...)` and `theaterBoardFrom(...)` are the deterministic projection boundary.
  - Combat elevation, hazards, cover, light profile, and `scene.mods` already become render data.
  - `terrain_change` already has `break`, `burn`, `collapse`, `hole`, `flood`, and `raise` semantics
    on the older band/lane board.
- `src/ui/theater-interior.js`
  - `interiorBuildBoard(...)` emits `interior3d` data: floor, wall, doorframe, pillar, skirt, cover,
    furniture, wall props, lights, focus bounds, and realm material/texture selection.
  - Generated flagship textures already win over procedural material fallback through
    `REALM_TEXTURES` and `interiorTextureVariantFor(...)`.
  - Room focus trimming, sparse columns, a dais anchor, and per-room light seeds exist.
- `src/ui/theater-boot.js`
  - The interior channel uses a 20-degree perspective camera and no world vertex snap/dither.
  - Generated sprites use alpha-tested `MeshLambertMaterial`, an emissive readability floor,
    Y-billboarding, alpha-tested shadow depth material, and floor-aligned bases.
  - Interior boards have shadow maps, diegetic point lights, realm fill profiles, fog, camera fitting,
    camera tweening, room crossfade, and a post chain.
  - The current post chain is RenderPass -> screen-vertical tilt-shift DoF -> threshold bloom ->
    realm grade -> OutputPass.
  - Current occlusion handling splits blocking wall/pillar instances into an opaque ankle-height stem
    plus a translucent upper ghost. `ITR_OCCLUSION_GHOST_OPACITY` is currently `0.2`.
  - Diagnostic and capture surfaces already exist on `window.Theater`.
- `src/ui/theater-verbs.js`
  - Placement, movement, hurt, death/topple, flee, and damage effects establish the motion/event
    vocabulary. Extend this vocabulary for stateful room citizens instead of inventing a parallel
    animation system.
- `dev/battle-gate/`
  - Existing captures cover environment rolls, interior studies, the dungeon loop, occlusion, sprite
    scale, and stage framing. Extend these rigs; do not judge changes only in an ad hoc browser view.

The Three.js renderer is capable of the target. A wholesale engine replacement is not warranted yet.
The recommended change is a stronger scene-description layer plus better geometry, lighting, sprite,
and image-quality contracts inside the existing renderer. Reconsider the engine only if the WebGL2
path cannot meet the measured frame and memory budgets after these changes.

## 2. Why the Current Game Can Read as a 1990s Map

The visual age gap is not mainly polygon count.

### 2.1 The room is assembled as cells, then photographed

The current interior is fundamentally a rasterized plan rendered as many unit prisms. Even with good
textures, this exposes the square-cell origin of the data. The target frames look like a miniature
maker built a room shell, then placed gameplay pieces in it. The renderer needs to convert cells into
larger architectural surfaces and silhouettes before rendering.

### 2.2 The camera fits geometry, not a dramatic subject

`focusRect` and `cameraFit` are useful, but a rectangle is not an encounter. The desired subject is a
weighted cluster: player, primary threat, objective/centerpiece, and light source. Framing should
solve for those anchors and allow some room geometry to leave the frame.

### 2.3 Rich rolls lose their visual structure

Room shape, structural features, interactable state, architecture material, and condition often
collapse into rectangular cells, generic prisms, or prose. This makes different scenes share the
same silhouette. Realm tint cannot repair identical spatial composition.

### 2.4 Sprite success is evaluated as an asset, not as a rendered citizen

A clean sprite PNG can still fail in-engine because of fringe color, inconsistent ground line,
incorrect aspect metadata, mismatched world height, base tilt, depth sorting, light response, or an
edge-on shadow. The unit of quality is `generated asset -> folded registry -> lit standee in a room`,
not the isolated sprite.

### 2.5 Lighting has too many responsibilities

Current constants compensate for dark materials, sprite readability, bright realms, cosmic realms,
and small torch pools. The result can oscillate between crushed black and flat fill. The target needs
separate controls for scene exposure, local source energy, sprite legibility, and material albedo.

### 2.6 Post effects are screen heuristics

The current vertical tilt-shift is inexpensive and attractive in controlled framing, but it has no
depth buffer. It can blur a near wall and a sprite at the same screen Y equally, and it cannot reliably
hold the entire action cluster sharp. Bloom is luminance-thresholded rather than emitter-masked. These
are good provisional effects, not the final photographic pipeline.

## 3. Required Render Contract

Every rendered battle shot should be derived from a plain-data `ShotPlan`. This is view data, never
new world state:

```js
{
  id,
  seed,
  realmId,
  environment,
  activeRoomId,
  stage: {
    polygon,
    floorLevels,
    wallSegments,
    apertures,
    skirt,
    openEdges
  },
  anchors: {
    player,
    primaryThreat,
    objective,
    focalLight,
    actionCenter
  },
  pieces: [],
  props: [],
  interactables: [],
  overlays: [],
  traces: [],
  lightRig: {
    practicals: [],
    sky,
    readabilityFloor,
    exposure
  },
  camera: {
    mode: "beat" | "room" | "boss",
    yaw,
    pitch,
    fov,
    target,
    distance,
    sharpSubjects: []
  },
  occlusionTargets: [],
  postProfile,
  provenance: []
}
```

`shotPlanFrom(tray, combat, viewState)` should be a deterministic pure function except for player
camera orbit/zoom, which is ephemeral view state. `provenance` maps every staged noun to the state,
roll, codex record, combat unit, or trace that licensed it. The renderer consumes `ShotPlan`; it never
rolls content and never writes gameplay state.

The shot planner is the highest-leverage engine addition proposed by these images. It makes the
camera, curation, lighting, occlusion, and tests agree about what the frame is *about*.

## 4. Proposed Engine Changes

### 4.1 Replace cell-prism presentation with a room-shell compiler

Keep the cell grid for mechanics and reachability. Compile it into render geometry:

1. Extract the active room's walkable contour with marching squares or boundary-edge tracing.
2. Simplify collinear boundary segments while preserving door/aperture edges.
3. Triangulate the floor polygon, with separate polygons per elevation tier.
4. Generate wall strips from boundary segments rather than one box per wall cell.
5. Cut or segment wall geometry at door apertures.
6. Add a shallow bevel or chamfer to exposed floor, riser, wall, and tray edges.
7. Generate vertical side faces for every elevation change using a deliberately darker material
   variant. This is essential to frame 19's dais/pit readability.
8. Use world-aligned UVs so a texture continues across adjacent surfaces instead of visibly restarting
   per cell.
9. Keep a hidden logical cell-to-triangle/segment map for placement, hit testing, path display, and
   terrain mutation.

Suggested new module: `src/ui/theater-room-mesh.js`. Keep `interiorBuildBoard(...)` as the data
producer; add `compileRoomShell(board.stage)` as a render-only compiler. During migration, retain the
current instanced-prism path behind a diagnostic flag.

For octagons, rotundas, L rooms, crosses, and caves, do not fake the silhouette with colored square
cells. Extend the spatial plan to carry the actual polygon and derive exit slots from polygon edges as
specified in `BEAUTY-WAVE-5.md`. The mechanics grid may rasterize that polygon afterward; render truth
should preserve the polygon.

### 4.2 Add a deterministic composition solver

Create `composeShot(tray, cameraCandidates)` with a small finite candidate search, not continuous
optimization and not a model call. Candidate yaw can initially be the four diagonal quarters plus the
current orbit. Pitch stays in a narrow 28-38 degree band; perspective FOV stays about 18-24 degrees.

For each candidate, project anchor bounds and score:

```text
score =
  + subject_separation
  + primary_threat_visibility
  + objective_visibility
  + focal_light_near_rule_of_thirds
  + tray_edge_visibility
  + foreground_depth_layer
  - hard_occlusion_area
  - subject_overlap
  - clipped_subject_area
  - empty_frame_area
  - competing_bright_source_count
```

Hard constraints:

- All living action figures remain inside a 7% safe frame.
- Medium figures occupy roughly 18-25% of frame height in beat mode.
- The primary threat and player do not overlap by more than 15% of the smaller projected bounds.
- At least one stage edge or skirt segment is visible unless an intentional close boss shot says no.
- The next room never enters the rendered scene graph.
- UI is not part of the frame calculation.

Use current `projectWorldPoint`, sprite screen-rect diagnostics, and camera-fit code rather than
rebuilding projection math. The solver should emit its candidate scores to a capture JSON so Codex can
debug composition failures without guessing from pixels alone.

### 4.3 Make one-room rendering literal

`focusRect` currently frames a focus room while neighboring kept geometry can still exist. For the
target, the active room alone should own render geometry. A doorway may contain a shallow darkness
portal, a short corridor throat, or a controlled glimpse card, but never the adjacent room shell.

This change concentrates triangle, shadow, texture, and composition budgets on what the player can
see. It also eliminates a major source of map-like framing.

### 4.4 Turn occlusion into dynamic view state

The current ankle-stem plus 20% ghost proves the path but is too opaque for frame 11 and changes
instantly at board build. Upgrade it:

- Determine blockers against the current `ShotPlan.occlusionTargets`, not only original piece cells.
- Include walls, pillars, tall furniture, and large foreground props.
- Fade only the blocking segment/instance, not the entire material bucket.
- Target upper-geometry opacity near 0.05-0.10; preserve a solid 0.12-0.25u stem so room shape remains
  readable.
- Tween opacity over 120-180 ms with interruption-safe retargeting.
- Restore over 180-260 ms to avoid flicker while the camera moves.
- Add 2-4 degrees of hysteresis or a short hold time before changing classification.
- Keep transparent occluders `depthWrite:false`, but render their solid stems normally.
- Sort the small ghost set back-to-front or render it in a dedicated late transparent group.

The current separate ghost draw call is a workable foundation. Avoid per-instance blended alpha in a
large shared material unless profiling proves it stable. Since only a few blockers should fade in a
single room, moving those instances into a small ghost mesh is simpler and more predictable.

### 4.5 Introduce an explicit standee asset contract

Every generated sprite registry entry used as a standee should resolve:

```js
{
  slug,
  image,
  alphaMask,
  pixelWidth,
  pixelHeight,
  contentBounds,
  footX,
  footY,
  worldHeight,
  facing,
  pose,
  palette,
  alphaCutoff,
  extrudeDepth,
  baseRadius,
  shadowProfile,
  qaFlags
}
```

Required automated fold steps:

1. Choose magenta or green key by measured rarity.
2. Remove the key with color-distance alpha, not exact RGB only.
3. Defringe edge pixels by unmixing the key color from partially covered RGB.
4. Remove disconnected key-colored islands outside the principal subject unless the manifest marks
   them as an effect.
5. Compute alpha bounds and a bottom-contact distribution.
6. Normalize the ground line from the lowest meaningful opaque run, ignoring isolated effect pixels.
7. Reject or quarantine sprites whose feet/contact band is absent, whose subject touches the sheet
   boundary, or whose alpha occupancy is outside expected size-band limits.
8. Generate a separate binary/soft alpha mask for shadows and optional silhouette extrusion.
9. Store dimensions and contact metadata; never infer world size from the runtime texture alone.

Renderer changes:

- Keep the art plane pixel-pure and nearest-filtered.
- Keep Y billboarding, with the existing camera-pitch counter-tilt only on the inner art wrapper.
- Use alpha-to-coverage when MSAA is available, or a small derivative-smoothed alpha threshold in a
  custom standee shader. This reduces crawling edges without blurring sprite pixels.
- Keep `depthWrite:true` for the opaque alpha-tested art pass.
- Render a separate narrow side/back extrusion or dark card edge, about 0.015-0.035u, so oblique views
  read as a physical standee rather than a zero-thickness plane. The front art remains unchanged.
- Keep the plinth physically flat, with a bevel and realm-neutral dark material.
- Add a soft contact shadow directly under the plinth. This is not a substitute for diegetic cast
  shadows; it ensures contact even when a point light makes the card's cast shadow nearly edge-on.
- Continue to cast alpha-tested shadows, but consider a slightly thickened shadow proxy derived from
  the alpha mask for low-angle point lights.

Do not apply world dither, vertex snap, texture warping, post sharpening, or PBR specular to sprite
front pixels. Realm identity reaches sprites through generated art, controlled light response, edge
color, and a very small emissive readability floor.

### 4.6 Separate sprite readability from ambient illumination

The current Lambert plus emissive-map floor is directionally correct. Make it a dedicated standee
shader so the controls are explicit:

```text
spriteRGB = albedo * (ambientFloor + directDiffuse)
          + albedo * realmReadabilityTint * readabilityFloor
          + authoredEmissiveMask * emitterGain
```

Clamp the readability contribution in perceptual luminance, not raw RGB. A dark-corner standee should
retain its silhouette and one or two internal value breaks without looking self-lit. Suggested capture
bands, measured after output encoding:

- dark corner sprite median luma: 0.10-0.22
- sprite in source pool: 0.25-0.55
- bright outdoor sprite: 0.45-0.75
- no indoor non-emissive sprite highlight above about 0.85

These are starting gates, not immutable taste numbers. Store per-realm overrides in data, not a chain
of realm conditionals inside `setInteriorBoard(...)`.

### 4.7 Rebuild the lighting contract around visible practicals

Each room gets one dominant lighting story. A `LightRig` should classify sources:

- `keyPractical`: the dominant visible torch, lamp, fire, beacon, moon aperture, or neon fixture.
- `supportPractical`: optional, at lower energy and usually same color family.
- `sky`: exterior/overcast/moon hemisphere or directional source.
- `readabilityFloor`: non-shadow-casting low-frequency fill.
- `emissive`: material-only emitters that may bloom.

Rules:

- Every local PointLight must have visible emitter geometry at the same transform.
- One source owns the brightest 5% of frame pixels. Additional sources remain subordinate.
- Indoor local lights use inverse-square decay and a bounded radius.
- Outdoor scenes use a broad sky/directional source plus one visible local focus when appropriate.
- Only the dominant one or two lights cast real-time shadows.
- Use 1024 or 2048 shadow maps according to capture resolution and budget; tune `bias` and
  `normalBias` per light class, not globally.
- Keep cast-shadow frusta/ranges tight around the active room.
- Prefer PCF soft shadows initially. Move to VSM only if alpha-tested sprite shadows and light bleeding
  remain controlled in the target browser.
- Generate practical geometry procedurally or from the object registry. Never leave a floating glow
  disc as the source.

The current per-realm bright-fill table is a useful emergency control. Long term, migrate these values
into a declarative `LIGHT_RIG_PROFILES` registry consumed by the shot planner, including expected
surface-luminance range and exposure. This prevents every new realm from adding more constants to
`theater-boot.js`.

### 4.8 Improve material response without making textures noisy

The target frames need readable material classes, not high-frequency detail.

- Use `MeshStandardMaterial` for room shells and hero props where roughness/metalness matter.
- Keep albedo textures low contrast and world-scaled.
- Add generated roughness and normal maps from each accepted albedo texture. For procedural fallback,
  derive low-amplitude height from luminance after removing large value gradients.
- Metalness should be semantic: chrome panel/iron/copper can be metallic; painted wood, stone, moss,
  flesh, and grime should not.
- Use vertex color or a low-frequency AO mask for perimeter/riser darkening; do not bake a dark square
  into every tile.
- Add edge wear sparingly through masks tied to convex edges, not screen-space noise.
- Render condition decals as sparse projected/quad overlays with depth offset, material-aware blending,
  and deterministic rotation/scale. Decals must not cover the room uniformly.

Suggested texture set per surface variant:

```text
albedo.png      sRGB, low contrast
normal.png      linear, subtle
roughness.png   linear
height.png      optional, low amplitude
mask.png        optional condition/edge channels
```

The generated asset pipeline should verify tileability by wrap-shift comparison, luminance range,
frequency energy, palette distance, and seam score before adding a variant to `REALM_TEXTURES`.

### 4.9 Upgrade post-processing to use scene data

Keep the existing suite as a fallback. Add these upgrades in order:

1. Confirm one color-management path: linear scene rendering, one tone mapper, one output encoding.
   Avoid grading already tone-mapped content and then tone-mapping again.
2. Replace screen-Y DoF with depth-aware DoF once room-shell depth is stable. Supply a depth texture
   from the render target; focus distance comes from the weighted action anchors. Keep blur capped and
   preserve standee silhouettes in the focal cluster.
3. Replace luminance-only bloom selection with an emissive mask or selective bloom layer. A white
   daylit wall must not bloom merely because exposure is high.
4. Add very subtle color-noise/dither only at final output to reduce banding in dark fog. This is not
   PS1 dither and never modifies sprite texture coordinates.
5. Keep vignette weak and camera-relative. The physical skirt/void should do most edge containment.

Do not add SSAO as a blanket first move. If contact remains weak after shell bevels, real shadows, and
contact decals, use a low-radius GTAO/SSAO pass limited to terrain and props, excluding sprite fronts.

### 4.10 Make interactables and terrain state first-class render citizens

Implement `plan.interactables[]` and the broad state primitive from `BEAUTY-WAVE-5.md`. Every placed
object resolves through a construction class:

- `MODEL`: articulated hero object such as chest, portal, complex shrine.
- `FACED_BOX`: rectilinear furniture with generated face art.
- `EXTRUDE`: simplified silhouette extrusion for lever, grate, banner, relief.

State transition examples:

```text
door: shut -> ajar -> open -> broken
chest: closed -> open -> looted
lever: left -> right
fire: lit -> embers -> cold
portal: sealed -> active
creature: alive -> wounded -> dead -> removed/decayed
surface: clean -> wet/scorched/bloodied/breached
```

The existing theater verb loop should animate these transitions. State comes from game data; animation
is a view projection. On revisit, the same room must rebuild to the same terminal visual state.

### 4.11 Add a walk-native visual-projection pass before placement

The generated scenes look sparse because they were composed, not because their source vocabulary was
small. Implement a deterministic field-to-visual compiler over the active walk record:

1. Read the walk-level setup/skin, active raw segment, matching `pn.segments` overlay, spatial room,
   and live combat/codex state. Do not roll here.
2. Derive the dominant visual register from already-rolled walk fields such as motif, biome,
   area/segment type, encounter, feature, or scene frame. Never invent a theme token.
3. Reserve mandatory gameplay citizens: doors, combatants, objective, hazards, earned traces.
4. Choose at most one *visually dominant* centerpiece from fields already rolled. This does not erase
   other rolled features from canon.
5. Objectify a small prop set that reinforces the rolled register and tactical lanes.
6. Prefer pairs/rhythms only when the archetype calls for them.
7. Preserve center clearance and navigation.
8. Leave over-budget fields on the canonical segment and add them to its source-referenced staging
   reserve. Never delete, reroll, or sever them from their originating field because they are visually
   inconvenient.

Initial room budgets:

- ordinary room: 0-3 decorative props, 0-1 centerpiece, 0-2 overlays
- dressed room: 3-6 props, 0-1 centerpiece, 1-3 overlays
- boss room: 2-5 props, exactly one structural/focal centerpiece, traces as earned

Doors, combatants, and necessary interactables do not consume the decorative budget. The majority of
ordinary rooms should still be near-bare *on screen*. Bare presentation is a projection decision;
the walk record remains fully rich.

## 5. Fully Procedural Asset Production

There is no human paint-over or manual curation requirement in this plan. Codex should operate a
manifest-driven generation and QA loop.

### 5.1 Asset request

Every generation packet must create the manifest before images arrive. It names slugs, grid cells,
realm, family, intended size, construction class, state variants, lighting neutrality, perspective,
chroma key, and expected output dimensions.

### 5.2 Generation

Use image generation for:

- standee fronts and state variants
- prop face art and extrusion silhouettes
- tileable albedo source textures
- decals with transparent/keyed backgrounds
- practical emitter cards/masks

Do not generate complete battle-map screenshots as runtime assets. The VQ images are references for
the assembler and renderer, not backgrounds to place behind gameplay.

### 5.3 Mechanical fold

Folding scripts should slice, key, defringe, normalize, classify, resize without smoothing where
appropriate, generate derived masks/maps, and write registry entries. Generated artifacts are never
hand-edited.

### 5.4 Automated QA

Run deterministic image tests first, then a vision-model review against explicit rubrics.

Mechanical gates include:

- correct grid/cell count
- no blank cells
- subject does not touch crop edge
- key-color residue under threshold
- alpha fringe score under threshold
- contact line detected
- expected alpha occupancy by size band
- no top-down perspective for standees
- texture seam score and frequency bounds
- decal alpha occupancy and transparent background
- state variants retain identity similarity

Vision review asks binary, scoped questions: eye-level or not; readable at 50% scale or not; correct
realm or not; silhouette distinct or not; state variant visibly changed or not; better than the
currently registered asset or not. A rejected generation remains out of the live registry and is
requeued with the failed criterion added to its prompt. This is the no-human version of the additive
fold law in `SPRITE-GEN-V2.md`.

### 5.5 In-engine QA

An asset is not accepted solely from its source PNG. Render it in a standard test room under:

- dark-corner light
- dominant practical light
- bright exterior light
- fantasy, gloom, and chrome grade
- front and two oblique camera yaws
- overlap with another standee and one foreground wall

Capture at actual gameplay size. Verify alpha, ground contact, scale, light response, shadow, realm
coherence, and screen readability. The registry promotes the asset only after this gate.

## 6. What Each VQ Frame Asks the Engine to Prove

1. `01-fantasy-dungeon`: warm practical, stone shell, sparse organic dressing, large-vs-medium scale.
2. `02-fantasy-urban`: vertical facade fragments without pulling camera away from street combat.
3. `03-fantasy-wilderness`: an open mat can still read as a contained stage through skirt, light, and
   prop clustering.
4. `04-gloom-dungeon`: dark value hierarchy with standees legible below full brightness.
5. `05-gloom-urban`: wet material response, one green practical, restrained facade detail.
6. `06-gloom-wilderness`: low fog, reflective water/mud, silhouettes that remain readable.
7. `07-chrome-dungeon`: metal roughness/normal response, cyan practical, restrained magenta accent.
8. `08-chrome-urban`: selective emissive bloom and wet reflections without turning the tray into a
   whole neon city.
9. `09-chrome-wilderness`: realm identity without relying on darkness or neon everywhere.
10. `10-flagship-gloom-boss`: boss camera mode, structural dais, one dominant source, scale hierarchy.
11. `11-fantasy-dungeon-occlusion-fade`: dynamic 5-10% upper ghost plus solid wall stem.
12. `12-gloom-octagon-room-shape`: polygon-preserving room shell and polygon-derived exits.
13. `13-chrome-stateful-door-lever`: object registry, state projection, shaped aperture, transition.
14. `14-fantasy-urban-cover-lanes`: tactical lanes remain readable without a visible grid overlay.
15. `15-gloom-corpse-trace-persistence`: event-derived trace survives rebuild and revisit.
16. `16-chrome-material-condition-decals`: material, rust/scorch/wet overlays, sparse decal composition.
17. `17-fantasy-wilderness-exterior-light`: sky source plus campfire practical, independent exposure.
18. `18-gloom-wilderness-fog-readability`: low-height fog volume/particles, not global opaque fog.
19. `19-fantasy-dungeon-terrain-tiers`: polygon floor levels, riser side faces, reachable stairs/ramps.
20. `20-chrome-terrain-change-breach`: logical cell mutation compiles into clean shell damage, rubble,
    void edge, and persistent trace.

## 7. Recommended Build Order

### Stage A: stop producing map overviews

1. Make active-room-only geometry literal.
2. Add `ShotPlan` and deterministic composition scoring.
3. Reframe existing geometry around action anchors.
4. Lower occlusion ghost opacity and make fading dynamic.

Success gate: frames 04 and 11 can be approximated with current assets and clearly read as staged
encounters rather than complete maps.

### Stage B: fix sprite citizenship

1. Complete registry metadata and automated fold gates.
2. Add standee side thickness, stable plinth, contact shadow, and explicit shader.
3. Build an in-engine sprite acceptance gallery.
4. Remove runtime size inference and unresolved fallback scaling.

Success gate: no square shadows, floating feet, tilted bases, key-color halos, edge-on invisible cards,
or full-bright dark-corner sprites across the core-three gallery.

### Stage C: compile real room shells

1. Preserve rolled size.
2. Add structural elevation.
3. Add polygon room shapes and exit slots.
4. Compile floor/wall/riser geometry with world UVs and bevels.

Success gate: frames 12 and 19 are structurally possible without decorative props.

### Stage D: make rolled nouns physical and stateful

1. Fold core-three object generation into a state registry.
2. Ship door -> room transition first.
3. Add lever, chest, fire, shrine, portal, container, and trap.
4. Extend verbs for state changes and persistent traces.

Success gate: frames 13, 15, and 20 rebuild correctly from saved state.

### Stage E: material and light finish

1. Declarative light rigs and visible practicals.
2. PBR terrain/prop materials with restrained generated maps.
3. Condition decals and low fog.
4. Depth-aware DoF, selective bloom, and single color-management path.

Success gate: the same scene remains legible in fantasy, gloom, and chrome while each realm has a
distinct material/light identity rather than only a tint.

## 8. Objective Visual Gates

Every graphics unit should produce capture PNGs plus metrics JSON. Add failures as executable gates,
not prose-only observations.

### Composition

- living subject clipping: 0 pixels outside safe frame
- medium standee frame height in beat mode: 18-25%
- projected overlap between primary figures: under 15%
- active room geometry only: neighbor room mesh count 0
- dominant bright connected region: one, except explicitly multi-source scenes

### Value

- at least 35-55% of indoor frame remains in the dark band
- no more than about 8% of pixels in the highlight band
- non-emissive indoor clipping near display white: under 0.5% of frame
- focal source region brighter than every non-source region

### Sprites

- unresolved sprite count: 0 in core-three fixtures
- visible chroma fringe above threshold: 0 accepted assets
- base plane normal remains world-up within epsilon
- foot-to-base gap under two screen pixels at target resolution
- sprite front receives no world PSX shader
- source pool vs dark-corner luminance ratio is measurable and bounded

### Geometry and state

- no duplicate noun pieces
- no prop intersects a CLEAR cell, door swing, or living figure footprint
- no z-fighting pixels in stable capture fixtures
- room polygon and exits remain deterministic for identical state
- state transitions fire once and rebuild to terminal state
- trace persists after room swap and reload

### Performance

Measure on the target browser and Adam's machine:

- warm `shotPlanFrom` + room assembly target: <=250 ms
- room swap under opaque crossfade: no exposed partial frame
- steady battle target: >=60 fps preferred, >=30 fps hard floor
- only 1-2 real-time shadow-casting lights
- post effects individually toggleable and reported in metrics
- draw calls and triangles recorded per capture, with budgets set from the best current core-three room
  plus headroom rather than guessed globally

Use canvas-pixel checks to reject blank, near-black, clipped, or blown-out captures before asking a
vision model to judge taste.

## 9. Exact Implementation Touchpoints

Likely changes, in dependency order:

- `src/engine/theater-data.js`
  - Extend projection shapes for stateful interactables, traces, and structural terrain.
  - Keep provenance and determinism at this boundary.
- `src/ui/theater-interior.js`
  - Emit active-room polygon, elevations, apertures, materials, condition decals, and anchor metadata.
  - Replace neighbor keep-set presentation with active-room-only render data.
- `src/ui/theater-room-mesh.js` (new, register in `manifest.json`)
  - Compile polygons, walls, apertures, risers, bevels, UVs, and logical-cell mappings.
- `src/ui/theater-shot.js` (new, register in `manifest.json`)
  - Build `ShotPlan`, score camera candidates, select light story, and report metrics.
- `src/ui/theater-boot.js`
  - Consume compiled shell and shot camera.
  - Add dynamic occlusion transition.
  - Replace implicit standee material with explicit shader/material factory.
  - Migrate post effects toward depth/emissive masks.
  - Keep `window.Theater` diagnostics and toggles for every new subsystem.
- `src/ui/theater-figures.js`
  - Resolve full standee metadata and construction; do not silently infer missing values.
- `src/ui/theater-materials.js`
  - Own terrain/prop PBR material recipes and generated derived maps.
- `src/ui/theater-verbs.js`
  - Add object-state, trace, and terrain-change visual verbs.
- sprite/texture fold scripts under `build/` and generation/review artifacts under `dev/model-qa/`
  - Make the no-human production loop executable and additive.
- `dev/battle-gate/`
  - Add core-three shot-plan, sprite-citizenship, room-shell, state-rebuild, and post-mask galleries.

Because the repo uses classic-script globals plus one ES-module theater bridge, register every new
module in `manifest.json` and load it in dependency order. Run `python3 build/check-manifest.py` after
every module edit. Do not hide a graphics redesign inside `theater-boot.js`; it is already carrying too
many policy constants. New data contracts deserve focused modules.

## 10. Non-Goals and Failure Traps

- Do not render the VQ PNGs as backgrounds.
- Do not ask a runtime model to compose every frame. Runtime assembly stays deterministic and fast.
- Do not add a graphics-only content roller beside the walk system.
- Do not reject or reroll a walk field because it is difficult to stage; preserve it in prose and
  improve its visual binding separately.
- Do not require hand-authored coordinates per room.
- Do not add all rolled dressing to prove the roll exists.
- Do not solve readability with full ambient light.
- Do not solve material identity with high-contrast noise.
- Do not solve sprite grounding with a large opaque blob.
- Do not make all geometry translucent when one segment occludes a subject.
- Do not let post-processing become the primary source of depth or value hierarchy.
- Do not accept an asset because its isolated PNG is beautiful.
- Do not let procedural fallback silently replace a failed generated asset without reporting the
  fallback in capture metrics.

## 11. The Practical North Star

The shortest route from the current output to the images is:

```text
walk setup + active segment + persistent overlay + live state
  -> walk-native visual projection
  -> active-room tray
  -> polygonal room shell + physical citizens
  -> shot plan centered on the action
  -> one visible light story
  -> stable standees with bases/contact/shadows
  -> restrained depth-aware finish
  -> automated capture and promotion gates
```

The images should be treated as a demand for stronger procedural direction, not for manual art. The
engine must become opinionated enough that arbitrary valid content is staged with the same laws a
miniature photographer would apply. Once those laws are executable, generated sprites and textures
can improve independently without sending the battle view back into the ugly-map loop.
