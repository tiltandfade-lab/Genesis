---
type: build-plan
project: Genesis
status: SPECCED 2026-07-12; generation and implementation wait for Adam's go-ahead
created: 2026-07-12
authority: GRAPHICS-ENGINE.md section H owns construction classes; this document operationalizes the sprite-derived prop library
related:
  - "[[GRAPHICS-ENGINE]]"
  - "[[OFFLINE-ART-FOUNDRY-RESEARCH]]"
  - "[[SPRITE-TRANSITION]]"
  - "[[BEAUTY-WAVE-5]]"
  - "[[GRAPHICS-CONVERGENCE-PLAN]]"
  - "[[TABLETOP-VISION]]"
---

# EXTRUDED SPRITE PROP LIBRARY

## 0. Decision

Build the library.

Sprite-derived geometry is the highest-leverage route to a large, realm-specific prop vocabulary
without a human modeling department. It gives Genesis something a generic mesh pack cannot: the DM
can ask for an object that belongs to this rolled realm, faction, condition, magical state, and
scene, then receive a physical object whose identity came from those facts.

The library is not a directory of indiscriminately extruded PNGs. It is a governed bank of:

- reusable silhouettes;
- front faces, side faces, and top faces;
- reliefs, emblems, trims, and apertures;
- state variants;
- chassis attachments;
- semantic material masks;
- construction recipes and validation evidence.

`GRAPHICS-ENGINE.md` section H remains the normative geometry law: every prop resolves to
`EXTRUDE`, `FACED_BOX`, or `MODEL`. This document does not revive the retired flat-card object tier
and does not create a fourth competing construction model. It specifies how generated sprite art
feeds those three classes and extends the offline prop compiler described in
`OFFLINE-ART-FOUNDRY-RESEARCH.md`.

## 1. Why this is worth doing

Genesis already has three unusually valuable source corpora:

1. Twelve realm prompt files contain **50 authored loot-table items per realm**, or approximately
   600 object descriptions. Those sections were deliberately excluded from the creature manifest
   pending an item-specific pipeline.
2. `BEAUTY-WAVE-5.md` describes approximately 300 stateful interactable cells across doors, chests,
   containers, campfires, levers, portals, shrines, and traps.
3. `setting-dressing.md` and the place-asset queue describe signs, banners, portraits, windows,
   fixture overlays, flora, clutter, and cross-realm effects.

The narrative design work is therefore largely present. The gap is a compiler and admission
process. Generating another unstructured asset pile would waste that advantage.

The long-term supply is combinatorial:

```text
semantic noun
+ construction operator
+ chassis or silhouette family
+ realm motif kit
+ faction mark
+ material channels
+ age and condition
+ state
+ magic treatment
+ seeded proportions
= canonical prop recipe
```

A finite set of trustworthy operators and parts can produce an effectively unbounded recipe space.
That is more controllable and more visually coherent than asking ImageGen or a text-to-3D model to
invent each final object independently.

## 2. Non-negotiable boundaries

### 2.1 The walk owns meaning

The sprite foundry never invents, deletes, rerolls, or replaces a walk card. It receives the rolled
noun, source reference, realm, importance, state, and interaction needs. Its output retains
`sourceCardRefs[]`. Visual caching caches geometry and art results by recipe hash; it never caches or
suppresses narrative generation.

### 2.2 The DM specifies semantics, not modeling operations

The DM may request:

> a low reliquary, built for the Gloom parish, its silver eye relief cracked, still emitting cold
> light, hiding the chapel key

The DM may not choose contour tolerance, triangle count, source filenames, UV layout, bevel width,
or arbitrary coordinates. The compiler classifies the request and chooses operators, parts,
materials, sockets, footprint, and validation policy.

### 2.3 Every object has physical citizenship

Every admitted scene prop must have:

- a construction class;
- world dimensions and a stable origin;
- ground, wall, ceiling, tabletop, or handheld mounting;
- collision/interaction and occlusion proxies where applicable;
- authored or bounded depth;
- semantic material channels;
- state and reveal behavior;
- canonical render evidence;
- a fallback preserving noun class and gameplay footprint.

A generated image is not a production asset until those fields exist.

### 2.4 Infinite does not mean noisy

Realm identity comes from a small repeated motif language, not maximum novelty per object. Most
Grounded props should remain ordinary. Strange, Volatile, and Mythic bands earn stronger motif,
emissive, distortion, asymmetry, or impossible-material treatments. If every spoon is supernatural,
the realm loses hierarchy.

## 3. Construction router

The compiler selects the cheapest operator that preserves silhouette, volume, state, and gameplay.

| Shape class | Default construction | Examples |
| --- | --- | --- |
| silhouette-defined, shallow | `EXTRUDE` | plaque, shield, key, blade, sign, grate, lever face, relief, door leaf |
| flexible/thin environmental cluster | crossed/layered extrusion under `EXTRUDE` | reeds, hanging moss, paper cluster, broken boards |
| rectilinear volume | `FACED_BOX` | table, bed, cabinet, crate, pew, counter, sarcophagus base |
| axial/revolved volume | procedural lathe feeding `MODEL` | bottle, urn, bowl, goblet, column ornament |
| path-defined volume | procedural sweep feeding `MODEL` | rope, chain run, pipe, branch, horn, cable |
| layered shallow volume | multi-depth `EXTRUDE` assembly | altar face, ornate door, control panel, carved idol |
| articulated or inspectable hero prop | `MODEL` or chassis plus generated attachments | chest, portal, cage, large mechanism, centerpiece |
| large architecture | polygon/prism kernel plus surface assets | walls, floors, stairs, apertures, bridges |

Negative controls are mandatory. Beds, barrels, chairs, large trees, and complex machines must be
included in the proof corpus specifically to demonstrate that a single silhouette extrusion is
rejected for the wrong shape class.

## 4. Generated art contract

### 4.1 Silhouette source

An extrusion-source cell must request:

- one isolated object;
- orthographic front or top elevation declared by mounting class;
- complete object with margin and no cropping;
- transparent or exact-key background;
- no cast shadow, floor plane, hand, character, scene, or perspective;
- strong closed outer silhouette;
- holes separated clearly from painted dark regions;
- no tiny detached fragments unless the manifest explicitly permits islands;
- large readable forms at battle-camera scale;
- semantic material regions with limited visual noise;
- consistent orientation across a state family.

The existing magenta-sheet machinery may remain an acquisition format, but the canonical cut asset
is RGBA with alpha-safe RGB gutters. ImageGen output is source evidence, not geometry truth.

### 4.2 Faced-box source

A faced-box family requests coordinated orthographic surfaces, not a single object portrait:

- front, side, and top faces in known aspect ratios;
- shared palette and construction details;
- no perspective or shading that contradicts scene light;
- edge landmarks aligned across faces;
- optional masks for trim, hardware, emissive, damage, and faction accent;
- state variants that preserve dimensions and attachment landmarks.

The chassis owns volume. Generated faces provide identity and material storytelling.

### 4.3 Relief and motif source

Realm motif kits are deliberately more reusable than finished objects. Each motif cell declares:

- motif family and realm;
- attachment role: emblem, border, corner, handle, clasp, aperture, trim, rune, crest, or fracture;
- allowed construction/material hosts;
- repeat policy: single, mirrored, linear, radial, or tiled;
- symmetry and facing;
- whether it may glow, animate by state swap, or mark faction ownership.

Motifs should be generated as clean masks or shallow painted reliefs suitable for attaching to
Kenney/procedural chassis. This is the primary mechanism that makes donor geometry look like
Genesis rather than like its source pack.

## 5. Image-to-geometry compiler

### 5.1 Alpha preparation

1. Convert keyed background to alpha using a deterministic tolerance.
2. Remove edge-key spill without eroding the object.
3. Retain the largest component plus explicitly allowed islands.
4. Fill only holes classified as accidental; preserve declared apertures.
5. Apply nearest-opaque RGB dilation into transparent gutters.
6. Record source hash, cleaned-mask hash, parameters, and component decisions.

### 5.2 Contour extraction

1. Extract outer and inner contours with marching squares or the selected polygon kernel.
2. Normalize winding and classify holes.
3. Simplify with bounded Douglas-Peucker tolerance in world-space error, not a fixed pixel guess.
4. Preserve protected landmarks: sockets, hinge edge, aperture corners, blade tip, handle opening.
5. Reject self-intersections, tiny loops, collapsed holes, and non-finite coordinates.
6. Triangulate through the geometry stack selected by R1/G1; do not add a separate polygon library.

Target complexity is approximately 50-250 visible triangles for an ordinary shallow prop, with a
larger budget only when the silhouette demonstrably needs it. Triangle count is a budget, not an
art target.

### 5.3 Volume and bevel

- Extrude to the archetype default `extrudeDepth`, with an optional stored per-sprite override as
  already ruled in `GRAPHICS-ENGINE.md` section H.
- Generate front, back, side, and bevel groups separately.
- Use a small semantic bevel band to catch scene light; flush fixtures may have no visible bevel.
- Assign side color/material from semantic construction channels or robust border sampling.
- Cap holes correctly. An open handle must remain open after extrusion.
- Ground or mount from declared contact edges rather than generic bounding-box center.

Depth bands remain those already ruled: thin surface 0.02, framed flat 0.07, mounted 0.12, fixture
0.14, shallow furniture 0.18, floor volume 0.15-0.3, and deep wall 0.30-0.35, with stored exceptions.

### 5.4 UV and material output

- Preserve source art on front/back regions without resampling drift.
- Give sides and bevels stable UV strips or semantic procedural material assignment.
- Emit material masks for body, trim, accent, glow, grime, and damage where supplied.
- Derive restrained normal/roughness channels; never bake scene-specific directional light into
  reusable art.
- Apply realm, faction, age, condition, and magic through channels rather than destructive recolor.

### 5.5 Collision and interaction

Render geometry does not double as gameplay geometry by accident. Generate or declare:

- footprint and height class;
- simple box, capsule, hull, or aperture proxy;
- cover and movement-blocking class;
- occlusion proxy;
- `interaction.front`, `interaction.top`, `light.emitter`, `loot.origin`, `concealment`, and other
  applicable sockets;
- wall/ceiling attachment plane and camera-facing policy.

## 6. Registry contract

The sprite-derived prop registry extends the interactable fold described in `BEAUTY-WAVE-5.md`; it
does not reuse `SPRITE_REGISTRY`, which remains creature-oriented.

```json
{
  "slug": "prop-gloom-reliquary-eye",
  "realm": "gloom",
  "noun": "reliquary",
  "archetype": "container-reliquary",
  "state": "closed",
  "constructionClass": "FACED_BOX",
  "operator": "chassis+relief",
  "source": {
    "promptRef": "gloom:item-sheet-2:cell-18",
    "imageSha256": "...",
    "recipeVersion": 1
  },
  "art": {
    "front": "...png",
    "side": "...png",
    "top": "...png",
    "masks": "...png"
  },
  "geometry": {
    "chassis": "reliquary-low",
    "attachments": ["relief:gloom-eye", "clasp:iron-small"],
    "extrudeDepth": null,
    "canonicalGlb": "...glb"
  },
  "mount": "ground",
  "aspects": ["openable", "lootable", "concealing"],
  "channels": ["body", "trim", "accent", "glow", "damage"],
  "footprint": {"w":0.8, "d":0.45, "blocksMovement":false, "cover":"none"},
  "sockets": ["interaction.front", "loot.origin", "concealment"],
  "fallback": "semantic-container-volume",
  "status": "source|cut|compiled|qa-pass|rejected",
  "qa": {"silhouette":"pass", "contact":"pass", "stateFamily":"pass", "material":"pass"}
}
```

Every state family shares footprint, origin, sockets, and scale unless the state contract explicitly
describes a moving articulated component. A closed door and open door cannot silently disagree about
their hinge or aperture.

## 7. Library composition

### 7.1 Do not regenerate what already exists on paper

First compile an inventory from:

- the 600 authored realm item cells;
- objects/interactables manifests and prompts;
- setting-dressing sheets;
- realm dressing, place skins, item tables, and interaction archetypes;
- the Kenney donor census and procedural part grammar.

Deduplicate by semantic family, not merely by name. A Gloom lantern and Chrome work light are realm
variants of `practical-light/portable`; they do not require separate geometry schemas.

### 7.2 Seed library target

The first production-worthy library should be small enough to validate deeply:

| family | initial target | purpose |
| --- | ---: | --- |
| neutral chassis | 20 | boxes, frames, plaques, shrines, panels, low furniture, containers |
| extrusion silhouettes | 24 | shield, blade, key, sign, grate, lever, tablet, relief, door studies |
| faced-box face sets | 12 | crate, cabinet, altar, bench, table, sarcophagus studies |
| lathe/sweep profiles | 12 | urn, bottle, bowl, bell, rope, pipe, branch studies |
| realm motifs | 12 per pilot realm | emblem, trim, clasp, aperture, fracture, rune families |
| stateful interactables | 8 archetypes in pilot realms | door, chest, container, fire, lever, portal, shrine, trap |

Pilot realms are **Fantasy, Gloom, and Chrome**. They provide a strong material and shape spread:
stone/wood/iron, domestic-funerary wrongness, and industrial/ceramic/emissive machinery. Do not
generate all twelve realms until these three prove the compiler and visual language.

### 7.3 Expansion target

After the pilot passes, expand by player-facing demand rather than completing a ceremonial matrix:

1. Compile all 600 item descriptions into candidate registry records.
2. Resolve each to an existing chassis/operator/motif recipe where possible.
3. Generate new art only for unresolved high-frequency or high-importance families.
4. Record unresolved requests in the prop-gap ledger.
5. Promote recurring gaps into new parts or motif families.

This creates near-infinite supply through reuse while protecting ImageGen credits and review time.

## 8. Generation and admission workflow

```text
tables and authored prompts
-> candidate manifest
-> semantic dedupe and construction classification
-> prompt compiler
-> ImageGen source sheets
-> slicer and mask cleanup
-> contour/faced-box/lathe/sweep compiler
-> canonical GLB plus metadata
-> technical QA
-> canonical renders
-> independent visual QA
-> admitted registry
-> runtime demand loading
```

No human is required in the production loop. The review roles are automated but separated:

- the generator creates source art;
- the compiler produces geometry and diagnostics;
- a fresh visual agent judges canonical renders without seeing the intended technical verdict;
- the integrator admits passing records and logs failures;
- Adam receives periodic contact sheets for direction, not per-asset production labor.

## 9. Automated gates

### 9.1 Source-art gates

- expected cell count and stable cell-to-slug mapping;
- no cropping, scene background, hand, character, or cast shadow;
- alpha/key cleanup produces bounded component count;
- state-family silhouettes align at hinge, base, and interaction landmarks;
- no key-color contamination or dark RGB fringe.

### 9.2 Geometry gates

- deterministic source+recipe output;
- finite bounds, normals, UVs, and transforms;
- zero accidental degenerate/duplicate faces;
- contour has no self-intersection after simplification;
- declared holes survive triangulation and extrusion;
- front face, side shell, bevel, and back cap are correctly oriented;
- mount contact and socket transforms fall within permitted bounds;
- complexity and draw-call budgets hold.

### 9.3 Visual gates

Render front, three-quarter, side, top, and battle-camera views under neutral and realm lighting.
Require:

- recognizable noun and state at battle-camera scale;
- visible but restrained thickness;
- no cardboard disappearance at expected camera orbit;
- no floating contact or inset wall fixture;
- material response without baked-light contradiction;
- realm identity readable without overwhelming ordinary noun identity;
- housed emissive source for practical lights;
- correct relationship to chassis and neighboring modules.

### 9.4 Negative controls

The harness must fail deliberately mutated fixtures:

- jagged unsimplified pixel contour;
- filled handle/aperture hole;
- black alpha fringe;
- detached floating island;
- wrong winding or inverted cap;
- zero/absurd depth;
- state variant shifted off its hinge;
- bed or barrel routed to single extrusion;
- practical light represented only by a floating emissive orb;
- prop whose collision proxy disagrees with visible footprint.

## 10. Runtime contract

- Compile and cache geometry offline or on first demand, keyed by normalized recipe hash.
- Do not triangulate complex ImageGen contours every frame or every room reveal.
- Load only assets requested by the current active room and its controlled threshold glimpse.
- Reuse geometry and materials through instancing where state and recipe hashes match.
- Preserve state transitions through stable group transforms and material swaps.
- Keep collision, occlusion, and interaction proxies simple even when render geometry is ornate.
- The fallback chain preserves meaning: admitted canonical prop -> compatible generic chassis ->
  semantic primitive assembly -> plain block of the correct footprint. Never unrelated scenery.

## 11. Relationship to Kenney and procedural meshes

The mesh and sprite libraries are complementary:

- Kenney/procedural geometry supplies trustworthy chassis, proportions, volume, and sockets.
- Sprite-derived silhouettes supply unusual flat forms, apertures, reliefs, and item identities.
- Realm motif kits transform reusable chassis into Genesis-specific objects.
- Faced-box art supplies coherent surfaces without requiring a unique mesh.
- Lathe/sweep operators handle common volumes that silhouette extrusion cannot.
- Hero centerpieces may combine all of the above under one recipe.

The preferred result is often hybrid. A Gloom confessional lever might use a simple mechanism donor,
an extruded silver-eye handle, a generated engraved faceplate, and a cold-light state mask. No one
component needs to be complex for the assembled object to feel authored.

## 12. Implementation waves

This is a subtrack of `GRAPHICS-CONVERGENCE-PLAN.md`, not a competing global order. Image inventory
and prompt work can proceed offline. Geometry implementation waits for R1/G1 to select polygon and
triangulation ownership; canonical glTF output aligns with R8; material/oracle work aligns with
GP-2 through GP-4.

### ES-0: inventory and classifier

- Parse existing item, interactable, and dressing prompts into a candidate manifest.
- Add `item`, `object`, `dressing`, `motif`, and `face-set` source kinds without changing creature
  semantics.
- Classify construction operator, mount, state family, importance, and likely reuse.
- Emit dedupe and unresolved-classification reports.

Gate: all authored cells are accounted for; no generated art or runtime edit.

### ES-1: twelve-object geometry proof

Build a proof corpus across shield, key, sign, grate, lever, relief, door, crate, urn, rope, bed, and
barrel. The last two are routing negative controls. Compare runtime `THREE.ExtrudeGeometry` against
the selected offline geometry path only if R1 has completed.

Gate: correct router decision, preserved holes, stable contact, deterministic output, canonical
renders inspected.

### ES-2: registry and compiler

- Implement the registry schema, recipe hashes, source provenance, mask cleaner, contour pipeline,
  depth authoring, UV/material groups, sockets, proxies, and glTF output.
- Integrate with the existing interactable fold rather than creating a parallel object registry.
- Add technical and visual harnesses with the negative controls in section 9.

Gate: twelve-object proof passes from source image to canonical GLB without manual geometry edits.

### ES-3: three-realm motif pilot

- Generate Fantasy, Gloom, and Chrome motif kits.
- Build eight stateful interactable archetypes across those realms.
- Assemble at least 50 readable variants from no more than 20 chassis.
- Demonstrate Grounded through Mythic intensity without making each object equally loud.

Gate: blind realm/noun/state recognition, no floating parts, stable state transitions, and visual
comparison against the approved battle mockups.

### ES-4: walk and DM proof

Feed persisted walk fixtures through semantic prop requests. Include ordinary room, empty room used
for overflow, hidden NPC observation chamber, secret connection, hazard, active magic, centerpiece,
guise object, and practical-light scene.

Gate: every visible result retains source-card provenance; hidden content remains concealed; reduced
visual budget changes projection only; reload reproduces the room byte-identically at the recipe
level.

### ES-5: demand-driven realm expansion

- Compile all realm item candidates.
- Resolve existing recipes before generating art.
- Expand remaining realms by encounter frequency and unresolved gap count.
- Publish periodic contact sheets and coverage reports.

Gate: measured recipe reuse rises over time; new generation is justified by unresolved semantic
coverage rather than matrix completion.

## 13. Multi-agent ownership

One schema owner controls registry and recipe vocabulary. Parallel lanes may own:

- source inventory and prompt compilation;
- alpha/contour technical pipeline;
- faced-box/lathe/sweep operator proofs;
- realm motif generation;
- canonical render and blind visual review;
- walk/interaction integration after offline gates pass.

Agents return candidate records and evidence. They do not create private construction classes,
duplicate registries, or edit the same generated manifest concurrently. Runtime integration is
serialized after the offline compiler and pilot library pass.

## 14. Success criteria

The system succeeds when:

1. the DM can request an unmodeled realm-specific prop semantically;
2. the compiler chooses an honest construction operator;
3. the object is generated or assembled without human mesh editing;
4. it reads correctly at the battle camera and behaves correctly in gameplay;
5. it retains rolled provenance and stable state;
6. its realm identity comes from reusable motifs/materials rather than arbitrary visual noise;
7. recurring requests increase the library's reusable vocabulary;
8. ordinary generated rooms stop reading as generic empty game maps.

The north-star output is not “an extruded sprite.” It is a coherent physical diorama prop whose
silhouette, surfaces, state, realm identity, gameplay footprint, and narrative provenance agree.
