---
type: design-guide
project: Genesis
status: ACTIVE
updated: 2026-07-12
audience: Claude orchestration sessions, Codex art direction, graphics implementation agents
authority: graphics architecture and mockup-convergence doctrine
companions: GRAPHICS-PRODUCTION-RESEARCH-WAVE.md, STAGE-C-ART-DIRECTION-REVIEW.md, WALK-CARD-DEALING.md
---

# Graphics Convergence Charter

## 0. Authority and purpose

This is the governing graphics charter for Genesis. Read it before planning or implementing any
battle-theater, dungeon-diorama, sprite, prop, material, lighting, camera, VFX, or graphics-toolchain
work.

The objective is not to finish graphics quickly, minimize sophistication, or make the current frame
merely acceptable. The objective is to reach the approved vision renders while preserving the
table-driven, walk-native, infinitely extensible adventure engine that makes Genesis distinct.

Open-source components, procedural generation, ImageGen, Codex, and Claude exist to remove solved
production labor. The saved effort is spent encoding Genesis's visual language and dramatic staging,
not lowering the target.

This charter governs intent and architectural boundaries. Technical execution belongs in
`GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` and the active wave spec. When a technical shortcut conflicts
with this charter, preserve the charter and revise the shortcut. When a visual technique would alter
canonical walk facts, preserve the walk and revise the visual technique.

## 1. Protected core

The following are inviolable:

1. The walk and its rolled cards are canonical.
2. Narrative facts survive even when all visual representatives cannot fit in the active tray.
3. Room generation remains legible as D&D-style fields and roll tables.
4. A new book, realm, monster family, or adventure system should add content through data and
   semantic recipes, not bespoke renderer branches.
5. Graphics consume facts. Graphics never become the source of those facts.
6. Every generated visual object retains provenance to its card, table result, room, and seed.
7. No visual subsystem may make the game dependent on a finite collection of handmade scenes.
8. No-human graphics production is a design constraint: adopted workflows must run deterministically
   through Codex/Claude, committed recipes, and machine-verifiable outputs.
9. Visual omission is not narrative deletion. When a room is overloaded, the dealer may stage,
   defer, conceal, resize, substitute representation, or connect cards across rooms; it may not erase
   their meaning.
10. Empty rooms are intentional compositional and narrative capacity, not failed generation.

## 2. The visual compiler

Treat the graphics engine as a compiler with explicit ownership boundaries:

```text
roll tables
  -> walk facts and canonical cards
  -> semantic scene projection
  -> walk-wide dramatic composition
  -> visual realization recipes
  -> geometry / material / light / sprite / VFX instances
  -> optimized GPU scene
```

### 2.1 Roll tables

Own nouns, quantities, relationships, secrets, hazards, active magic, encounters, lore, rewards,
room roles, environmental facts, and provenance. They do not choose meshes or shader constants.

### 2.2 Canonical cards

Preserve every rolled fact in a stable, inspectable form. Cards may carry visual metadata and
importance, but visual consumers may not reroll or reinterpret their narrative identity.

### 2.3 Semantic projection

Classify facts into visual roles such as architecture, centerpiece, resident, cover, hazard,
practical light, wall socket, secret, atmosphere, or hidden connection. Projection is deterministic
and provenance-preserving.

### 2.4 Dramatic composition

Assign cards meaningful homes across the entire walk. Consider focal hierarchy, room capacity,
empty rooms, reveals, secret networks, sightlines, foreground/middle-ground/background, player
reward, and intrigue. This layer may choose presentation; it may not change facts.

### 2.5 Visual realization

Resolve semantic descriptions into procedural geometry, generated sprites, UV/material recipes,
lighting fixtures, animation, and effects. Failure to realize a representation degrades visibly and
diagnostically; it never removes the canonical source.

### 2.6 GPU scene

Batch, atlas, compress, cull, fade, and LOD realized visuals without changing gameplay or narrative
meaning. Performance is an implementation concern, not permission to rewrite content.

## 3. What mockup convergence requires

### 3.1 Reliable architectural geometry

Rooms require volumetric walls, caps, outer and inner faces, reveals, arches, ledges, stairs, pits,
platforms, alcoves, wall sockets, coherent diagonals, and readable cutaways. Arbitrary table-generated
topology must look constructed rather than debug-extruded.

Geometry acceptance is not "the mesh rendered." It includes watertightness where required, correct
normals and winding, consistent thickness, stable triangulation, wall/floor/riser congruence, no
S-curves or corner spikes, camera-safe occlusion, gameplay-cell fidelity, and capture review across
rectangular, L-shaped, octagonal, rotunda, cave, tiered, and overloaded fixtures.

### 3.2 Semantic materials

A surface is not a texture filename. It is a recipe derived from semantic facts:

```text
material family + construction + culture + realm + age + condition
+ moisture + damage + magical influence + narrative emphasis
```

The material system translates these facts into albedo structure, scale, roughness, metalness,
normal response, edge wear, grime, wetness, emissive influence, decals, and controlled variation.
World-aligned/triplanar materials remain appropriate for large procedural architecture. UV-baked,
ImageGen-painted atlases are appropriate for identifiable reusable props and hero centerpieces.

### 3.3 Grounding and motivated light

The mockups rely on contact, depth, wall thickness, controlled ambient fill, motivated practicals,
and focal contrast. A luminous orb is not a fixture. Every practical light has a physical emitter,
mount ownership, plausible position, local response, and visual silhouette when bloom is disabled.

Grounding may combine real shadows, contact pools, restrained ambient occlusion, normal response,
depth-aware postprocessing, and composition. Bloom is punctuation, never the source of illumination.

### 3.4 Generated-prop foundry

Reusable objects follow this contract:

```text
noun + culture + realm + age + scale + condition + magical state
  -> geometry recipe
  -> interaction and attachment sockets
  -> UV/projection treatment
  -> material recipe
  -> mesh and texture validation
  -> optimized reusable asset
```

Doors, altars, statues, chests, furniture, switches, braziers, bridges, cages, cover, and centerpieces
must come from extensible grammars. One-off procedural code without a reusable semantic recipe is not
a foundry contribution.

### 3.5 Sprite citizenship

Sprites are first-class physical inhabitants, not camera stickers. They require canonical scale,
ground-contact pivots, plinth/contact treatment, lighting response, alpha-tested depth behavior,
shadows, reliable billboarding, guise swaps, animation state, selection/acting feedback, corpse
persistence, and predictable occlusion.

Atlas packing reduces delivery cost. Draw-call reduction additionally requires instanced card
rendering with per-instance UV, transform, tint, opacity, visibility, state, and matching depth logic.

### 3.6 VFX vocabulary

Effects are semantic, reusable, and table-addressable:

```text
damage.fire.minor
hazard.poison.lingering
magic.divination.active
creature.spectral.idle
secret.reveal.arcane
terrain.collapse.dust
```

An effect engine realizes those recipes through particles, trails, meshes, decals, light, sound, and
timing. Individual spells and monsters should compose vocabulary rather than add bespoke render code.

### 3.7 Procedural cinematography

The mockups are composed images. Camera and staging must understand focal subjects, entrances,
player sightlines, dramatic importance, negative space, silhouette separation, reveal timing, room
role, centerpieces, secrets, overloaded cards, and foreground/middle-ground/background occupancy.

The camera may frame, crop, fade occluders, and select a presentation. It may not hide required
gameplay information without a reversible reveal rule or rewrite the room to fit its preferred shot.

### 3.8 Visual oracle

Flagship fixtures should eventually produce:

- approved vision reference;
- current shipped raster capture;
- neutral-post raster capture;
- path-traced diagnostic reference;
- geometry, normals, depth, material, light, and provenance debug views;
- renderer inventory and GPU timing;
- explicit art-direction findings and the next smallest corrective unit.

The oracle does not establish a second aesthetic. It reveals why the shipped frame differs from the
approved mockup in value hierarchy, contact, shape, material separation, lighting, or composition.

## 4. Convergence ladder

Progress is judged by visual gates, not feature count:

```text
C0  Topology is correct
C1  Architecture has volume and believable construction
C2  Everything has contact and motivated lighting
C3  Materials communicate realm, age, construction, and function
C4  Sprites and props inhabit the same physical world
C5  Composition stages every meaningful rolled card across the walk
C6  Atmosphere and VFX reinforce narrative state
C7  Performance tooling makes the result sustainable
C8  Flagship generated captures approach the mockups without special-case scenes
```

No rung is passed by a single favorable room. Gates cover at minimum:

- rectangular, L-shaped, octagonal, rotunda, irregular/cave, and tiered architecture;
- empty, sparse, ordinary, secret-heavy, and deliberately overloaded rooms;
- fantasy, gloom, and chrome flagship realms;
- ordinary encounter, centerpiece, hazard, active magic, hidden encounter, and secret connection;
- sprites of materially different size and alpha behavior;
- fixed cameras plus the production shot composer;
- deterministic reruns and an explicit performance census.

## 5. Open-source adoption doctrine

Open-source software is adopted to remove solved labor, not to surrender Genesis's architecture.

Adopt when a candidate:

- owns a technically mature problem behind a Genesis adapter;
- preserves deterministic inputs and output provenance;
- works without manual cleanup in the supported production environment;
- has a compatible license and exact pinned version;
- passes fixed fixtures, negative controls, visual captures, and performance gates;
- can be replaced without changing walk or semantic contracts.

Defer or reject when it:

- requires runtime network access or GUI-only authoring;
- changes narrative RNG consumption or canonical cards;
- silently drops instances, attributes, alpha behavior, or material semantics;
- demands a framework migration before proving a visual gain;
- expands renderer ownership broadly to solve a narrow defect;
- produces attractive demos but no reproducible Genesis fixture;
- makes procedural breadth dependent on a finite asset catalog.

## 6. No-human production contract

Every graphics-production pipeline must define:

1. Committed semantic input schema.
2. Deterministic seed and algorithm version.
3. Exact tool and model versions where applicable.
4. Generated artifact provenance and hashes.
5. Mechanical validation and negative controls.
6. Fixed-camera visual review artifacts.
7. Fallback behavior for generation or load failure.
8. Regeneration command and cache invalidation law.
9. License/attribution record for every external source.
10. A clear boundary between canonical facts and replaceable visuals.

ImageGen is an art-production stage, not an authority over geometry or game facts. Codex/Claude own
masks, UVs, projection, baking, gutters, seam repair, validation, and integration. Generated imagery
is accepted only after it survives the same physical-scale, contact, alpha, lighting, and capture
gates as procedural assets.

## 7. Session protocol for Claude

At the start of a graphics session, read in this order:

1. `docs/GRAPHICS-CONVERGENCE-CHARTER.md` — governing intent and protected architecture.
2. `docs/HANDOFF.md` top graphics block — current landed state and active unit.
3. `docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` — evaluated tools and execution boundaries.
4. `docs/STAGE-C-ART-DIRECTION-REVIEW.md` — current visual shortcomings and route toward the mocks.
5. The specific active wave/system spec.

Before implementation, state:

- which convergence rung the unit advances;
- which canonical contracts it consumes and must preserve;
- the exact generated fixtures and visual references used for acceptance;
- the negative control that proves the improvement is load-bearing;
- whether the work is runtime, build-time, research-only, or art-direction-only.

At close, report both engineering correctness and visual movement. A green harness without a read
capture does not close a taste-bearing graphics unit. A prettier capture that changes canonical facts
or only works for a hand-authored fixture also does not close it.

## 8. Standing directive

Do not protect the infinite engine by keeping its graphics primitive. Protect it by making every
sophisticated visual capability semantic, deterministic, composable, provenance-preserving, and
table-addressable.

Take the time required to reach the mockups. Spend that time on reusable laws and validated
production systems, not repeated local patches whose beauty cannot survive the next generated room.
