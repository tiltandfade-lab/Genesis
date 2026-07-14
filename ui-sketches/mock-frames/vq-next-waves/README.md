# Next-Wave Technical Vision References

type: graphics vision packet
status: ART-DIRECTION TARGETS, 2026-07-12
audience: Claude/Codex graphics implementation sessions
companion: `docs/STAGE-C-ART-DIRECTION-REVIEW.md`

## How to use this packet

These are subsystem targets, not evidence that an image model has solved the renderer. Each frame
isolates a graphics problem and is paired with an implementation contract below.

The authority order is:

1. canonical stored walk fields and persistent state;
2. the technical notes in this file and the art-direction review;
3. executable capture gates;
4. the visual reference image.

If an image accidentally adds, omits, or rearranges a noun, do not copy that accident. Preserve the
canonical scene and reproduce the intended geometry, composition, material, light, or sprite behavior.

All eight images were generated with the built-in image-generation tool. They share a mature faceted
photographed-miniature direction derived from the existing Gloom Octagon and Fantasy terrain-tier
targets. No human graphics cleanup is assumed.

## Packet index

| Frame | File | Implementation wave |
|---|---|---|
| 01 | `01-wall-anatomy.png` | C4.1 wall volumes |
| 02 | `02-wall-occlusion-states.png` | C4.1 + ShotPlan occlusion |
| 03 | `03-visible-practicals.png` | E0 visible practicals |
| 04 | `04-sprite-citizenship.png` | B1-B4 sprite citizenship |
| 05 | `05-construction-class-comparison.png` | D0-D1 semantic construction |
| 06 | `06-realm-material-matrix.png` | E1-E2 material/light identity |
| 07 | `07-overloaded-walk-staging.png` | walk-card dealer + D projection |
| 08 | `08-integrated-row-101-target.png` | integrated promotion gate |

---

## 01 - Wall Anatomy

**Intent:** Walls must read as heavy architectural citizens, not vertical texture planes. The near
cutaway should produce the attractive capped tray edge Adam identified while preserving full walls for
doors, switches, shelves, sconces, secret panels, breaches, climbing, and cover.

### Copy from the image

- broad visible wall thickness at the top and exposed ends;
- full-height far and side walls;
- substantial capped camera-side stems;
- door aperture built through the wall volume;
- fixtures flush to an inward-facing mount surface;
- footing/base course and top cap as silhouette-producing geometry;
- a damaged corner assembled from the same wall grammar, not a bespoke sculpt.

### Do not copy literally

- The image contains more visible flame sources than a normal room budget should allow.
- Masonry block frequency is a material/detail target, not permission to generate one mesh per brick.
- The broken corner is illustrative unless a roll/state licenses damage.

### Procedural implementation

For each simplified boundary segment, compute `tangent`, `inwardNormal`, `thickness`, `stemHeight`,
`fullHeight`, and aperture intervals. Emit separate indexed buffers:

```js
{
  stem:  { inner, outer, topCap, endCaps, footing },
  upper: { inner, outer, topCap, endCaps },
  trim:  { baseCourse, cornice },
  mounts: [{ slotId, u, v, normal, ownerSegmentId }]
}
```

Suggested initial dimensions at one world unit = five feet:

- stone thickness: `0.20-0.30u`;
- timber/metal partition thickness: `0.10-0.18u`;
- persistent stem height: `0.24-0.36u`;
- full wall height: existing `2.4u` baseline;
- cap overhang: `0.025-0.06u` per side;
- footing projection: `0.04-0.10u`.

Use a few long quads/profile sweeps with world-space texture coordinates. Surface masonry belongs in
albedo/normal/roughness and sparse trim instances, not hundreds of unique brick draw calls.

### Acceptance

- A grazing camera angle visibly resolves inner face, cap, and outer face.
- No wall segment is a single two-triangle plane.
- Apertures have jamb depth and a header/threshold.
- Every wall-mounted object has a valid segment owner and mount transform.
- Removing all textures still leaves a convincing architectural silhouette.

---

## 02 - Wall Occlusion States

**Intent:** Cutaway is camera-relative presentation, not a rewrite of room structure. A wall becomes
low only when its upper body actually blocks a required subject.

### Copy from the image

- identical encounter state across camera changes;
- full far walls retained for spatial context and mounted interactions;
- low, thick, capped near-wall segments;
- restoration of upper walls as the camera moves away;
- segment-local behavior rather than removing an entire room side.

### Image limitation

The generated diptych does not exaggerate the state delta enough to be a pixel-golden reference. The
technical rule below is authoritative: each panel should have a different blocker set computed from the
same room and subjects.

### Procedural implementation

1. Build full wall volumes once from logical structure.
2. Keep `wall-stem` opaque and persistent.
3. Give each `wall-upper` segment an independent visibility/fade state.
4. Cast camera-to-target rays for player, primary threat, objective, and focal interaction.
5. Mark a segment blocking only when its upper volume intersects a ray before the target.
6. Apply existing hysteresis and tween timing to upper opacity; never modify collision or wall state.
7. Parent ordinary mounts to the owning upper group. Important mounts become camera-scoring anchors.

Camera candidate scoring should strongly penalize hiding a required wall-mounted objective. If every
candidate is blocked, choose a wall-facing close shot or orbit; never detach the object into open air.

### Acceptance

- Same camera + same targets gives the same blocker set deterministically.
- Orbiting across a threshold changes only affected upper segments.
- Stems remain opaque, capped, and thick throughout transitions.
- Mechanics, pathing, doors, cover, and mounts are byte-identical before/after visual cutaway.
- No transparent full-wall ghosts remain as the normal presentation.

---

## 03 - Visible Practicals

**Intent:** Every local light has an inspectable physical source. The fixture is the visible noun; the
PointLight illuminates; the emissive submesh and selective bloom provide only the tight hot core.

### Six demonstrated fixture families

1. floor candle cluster;
2. handled floor lantern;
3. low brazier;
4. wall sconce;
5. ceiling-hung lamp;
6. Chrome faceted energy fixture.

### Procedural implementation

Extend light records:

```js
{
  fixtureId,
  mount: "floor" | "wall" | "ceiling",
  ownerSegmentId: null,
  transform,
  emitterLocal: { x, y, z },
  color,
  intensity,
  distance,
  decay,
  sourceRef
}
```

Resolve `fixtureId` from the lighting roll and realm material family. Build fixture geometry from a
small grammar of cylinders, cups, handles, chains, brackets, cages, wax columns, and faceted crystals.
The flame/bulb/crystal is a named emissive submesh. Attach the PointLight to `emitterLocal`.

Disable `interiorBuildGlowDisc` in production. It may remain behind a diagnostics flag. Replace tests
that require `glowCount > 0` with fixture/emitter co-location and visible-practical assertions.

### Acceptance

- Every non-environment PointLight resolves exactly one visible fixture.
- Emitter world position lies inside/on its fixture emissive bounds.
- Wall and ceiling fixtures have valid owners and cannot float.
- Bloom mask includes emissive submeshes only; diffuse stone clipping remains below the gate.
- One practical owns the brightest region; supporting sources remain subordinate.
- Turning emissive bloom off still leaves the fixture physically understandable.

---

## 04 - Sprite Citizenship

**Intent:** Generated illustrations must behave like physical citizens of the same lit diorama. The
reference deliberately shows front, oblique, nearly edge-on, rear, and large-monster cases.

### Copy from the image

- consistent human scale;
- foot anchor seated on a small beveled plinth;
- visible thin card thickness at oblique/edge-on angles;
- crisp alpha silhouette without key fringe;
- soft local contact shadow, not a rectangular plane;
- sprite face responds to room light but remains readable;
- large creature scales from semantic size while obeying the same grounding law.

### Asset manifest required before runtime

```js
{
  contentBounds,
  footX,
  footY,
  worldHeight,
  alphaCutoff,
  edgeDilated: true,
  extrudeDepth,
  baseRadius,
  shadowProfile,
  viewId,
  qaFlags
}
```

Preferred generated source remains a horizontal `1x4` view strip with each cell a `4:6` portrait.
Automated folding must slice by declaration, key/despill, dilate hidden RGB before mip generation,
derive bounds/foot anchors, normalize scale semantically, and reject ambiguous support islands unless
the asset is declared as a swarm/group.

### Runtime implementation

- alpha-tested depth-writing front material for opaque body;
- shallow silhouette/card hull `0.015-0.035u` deep;
- world-up plinth sized from metadata;
- floor contact from `footX/footY`, never image rectangle bottom;
- bounded light response separate from world exposure;
- soft contact pool constrained to feet/plinth;
- same linear-to-display color path as world surfaces.

### Acceptance matrix

Render every promoted sprite under Fantasy/Gloom/Chrome, bright/dark practical profiles, and several
camera yaws. Require: foot gap <= two screen pixels, no chroma fringe, no square shadow, no tilted base,
no unresolved scale, no full-bright dark-corner sprite, and a legible edge-on hull.

---

## 05 - Construction Class Comparison

**Intent:** Semantic nouns choose geometry. A deterministic but unrelated furniture silhouette is not
a valid fallback. The left bay illustrates role-only billboard collapse; the right bay illustrates
truthful construction.

### Target routing

| Noun | Construction |
|---|---|
| gnarled tree | faceted trunk/branches + 2-4 crossed foliage cards |
| tombstone | tapered/chipped stone volume |
| rubble wall | seeded masonry assembly with occupancy/cover |
| coffin | lidded faceted box recipe with state channel |
| ruined column | stacked shaft/capital/drum recipe |
| chest | stateful box/hinge/lid volume |
| hanging banner | wall-locked shallow extrusion/cloth plane |
| brazier fire | physical vessel + layered flame FX |

### Image limitation

The image model duplicated a brazier in the left bay. That duplication is not licensed. The table above
is the exact noun inventory and must drive both comparison fixtures.

### Procedural implementation

Add a semantic binding between walk projection and render strategy:

```js
{
  nounClass,
  constructionClass: "MODEL_RECIPE" | "FACED_BOX_ASSEMBLY" | "EXTRUDED_CARD" |
    "CROSSED_CARDS" | "DECAL" | "LAYERED_FX",
  recipeId,
  footprint,
  stateChannels,
  materialFamily,
  fallback,
  sourceRef
}
```

Fallbacks preserve noun class. Missing tombstone art becomes a procedural grave-marker volume, never a
random cabinet. Missing rubble art becomes masonry primitives, never a table.

### Acceptance

- Every blocker/cover noun has truthful occupancy and silhouette.
- Rotating the camera 90 degrees does not make volumetric nouns disappear or face the camera.
- State changes rebuild deterministically from saved state.
- Removing generated textures still leaves every noun class distinguishable.
- No projected centerpiece defaults to billboard solely because its role is `centerpiece`.

---

## 06 - Realm Material Matrix

**Intent:** Realm identity must come from material response and construction vocabulary, not a global
tint. Geometry, camera, nouns, and encounter state remain fixed across Fantasy, Gloom, and Chrome.

### Fantasy

- grounded stone/timber;
- natural roughness, moss/soil traces;
- warm practical and muted heraldic accent;
- readable midtones without beige wash.

### Gloom

- austere funerary stone, iron, bone/wax traces;
- lowest average value but preserved figure silhouettes;
- hard material planes and sparse candle warmth;
- no blanket black crush.

### Chrome

- bright reflective faceted metal plus dark composite;
- semantic metalness, controlled roughness;
- cyan primary emitter with limited acid-green/magenta accents;
- crisp reflections without blue fog or diffuse neon bloom.

### Procedural implementation

Material family records should provide albedo source, normal/roughness generation policy, semantic
metalness, AO response, trim material, decal vocabulary, emitter family, fog profile, and grade. Use
world-space UVs/triplanar projection where possible so material scale does not reset per cell.

Generated normal/roughness must be clamped by semantic family. Do not infer metalness from luminance.
Apply boundary-distance AO, contact darkening, and riser value changes before postprocessing.

### Acceptance

- A grayscale render still distinguishes the material hierarchy within each realm.
- Realm classifier remains recognizable after neutralizing global grade tint.
- Same nouns and transforms across all three fixtures are byte-identical.
- Non-emissive near-white clipping stays below 0.5%.
- Chrome reflections remain bounded and do not erase silhouettes.

---

## 07 - Overloaded Walk Staging

**Intent:** Rolled content behaves like a deck of cards dealt across the generated graph. The active
room remains readable; empty rooms, secret rooms, and hidden connections become meaningful homes for
overflow without deleting or rerolling canon.

### Spatial reading

- center: entered active encounter, dense but legible;
- quiet room: lore/reward/aftermath clues with negative space;
- concealed observation chamber: hidden NPCs behind sight slits;
- secret annex: reward and a discoverable connection;
- repeated motifs/tracks establish narrative linkage.

### Image limitation

This is a graph/dealing overview, not the normal gameplay camera. Production rendering still shows one
active room. Adjacent/secret rooms appear only when entered, revealed, or represented by a controlled
portal/glimpse. The image also cannot prove provenance; the capture JSON must.

### Procedural implementation

The card dealer should score candidate homes by spatial capacity, pacing, narrative affinity, secrecy,
reward cadence, and existing density. Every card ends with one of:

```text
stage-now | stage-on-entry | stage-on-reveal | merge-as-group |
attach-to-connection | persistent-reserve-with-reason
```

Empty rooms receive overflow only when the assignment creates intrigue or reward, not merely storage.
Secret payloads remain absent from player-facing `walkSceneFrom` until reveal state permits them.

### Acceptance

- Every canonical card has a home or typed reserve reason.
- No hidden noun reaches player render data before reveal.
- Active room stays within composition/overlap/density gates.
- Observation-chamber NPCs have sightline provenance and a real secret connection.
- Revisiting rooms reproduces assignments and terminal states byte-identically.

---

## 08 - Integrated Row-101 Target

**Intent:** This is the promotion frame after C4.1, E0, Stage B, D0/D1, and E1/E2. It is deliberately
closer to what the procedural engine can construct than an unconstrained concept painting.

### Canonical structure

- `areaType`: Grand Octagon;
- `dims`: 60' x 60';
- `side`: 30' x 30' central arena sunk five feet;
- `side`: 10'-wide raised perimeter ring walkway with iron railing;
- one room shell only;
- polygon-derived apertures and exact tier occupancy.

### Visual target

- thick octagonal wall volume;
- full far wall, capped near cutaway;
- unmistakable raised perimeter ring and lower central arena;
- broad generated steps between levels;
- sparse iron railings with tactical openings;
- four grounded party standees against one primary and two secondary threats;
- one wall-mounted objective/interactable;
- sparse licensed bones/rubble/cover;
- one dominant physical practical and deep surrounding darkness;
- material depth from roughness, normal response, AO, risers, and contact, not prop count.

### Image limitations

The generated image uses more than one visible wall flame and interprets the ring/arena transition with
broad concentric steps. The exact table roll and room-cell tiers remain authoritative. Railings, bones,
steps, enemies, objective, and centerpiece must appear only when fixture data licenses them.

### Integrated capture route

```text
stored walk snapshot
  -> walkSceneFrom + provenance
  -> graph card dealing/reveal state
  -> SpatialPlan with row-101 multi-patch tiers
  -> semantic construction resolver
  -> thick wall/terrain compiler
  -> physical sprite/prop/light citizens
  -> ShotPlan + segment occlusion
  -> PBR materials + selective emissive post
  -> capture metrics + art-direction read
```

### Promotion gate

- row-101 terrain summary reports pit tier `-5`, raised ring tier `+1`, and no filled-over holes;
- 100% of visible nouns carry `sourceRef`;
- zero unresolved core sprites and zero role-only fallback billboards for volumetric nouns;
- no floating practical markers or unsupported mounts;
- all required subjects inside 7% safe frame; medium standee 18-25% frame height;
- primary overlap below 15%; no neighbor room geometry;
- one dominant bright region; highlight band <= about 8%; diffuse clipping below 0.5%;
- captured frame remains readable at desktop and mobile gameplay sizes;
- performance and draw-call metrics recorded against the current baseline;
- final human art-direction read: staged encounter, not map overview; photographed miniature, not 1990s
  tile field; canonical walk made physical, not an authored replacement scene.

## Recommended build order

1. Frame 01: wall volume buffers.
2. Frame 02: segment-level upper-wall occlusion.
3. Frame 03: physical fixtures; disable glow-disc production path.
4. Frame 04: sprite fold metadata and dedicated standee renderer.
5. Frame 05: semantic construction resolver and procedural recipe grammar.
6. Frame 06: material families and declarative light rigs.
7. Frame 07: integrated card-dealing/reveal capture.
8. Frame 08: row-101 promotion capture and final art-direction comparison.
