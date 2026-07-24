# Clayroom Reset, Proof Ladder, and Dev Workbench

Date: 2026-07-23  
Status: `WORKING SPEC — source-backed audit; no renderer implementation authorized by this document`  
Scope: repair the retained Clayroom into a trustworthy visual foundry before Guard Post 1 inherits
structure, material, trim, lighting, or sprite decisions.

## Recommendation

Yes: stop and make the Clayroom useful before continuing into the Guard Post.

The Guard Post should prove **site composition**—road, terrain, defended threshold, observation,
negative space, and cultural construction—not rediscover whether a wall corner closes, a trim band
maps, a sprite keeps its color, or a light profile can be tuned.

The right split is:

- **Clayroom:** renderer truth, generic construction grammar, surface routing, trim projection,
  lighting defaults, sprite citizenship, cutaway, diagnostics, and changed-seed resilience.
- **Guard Post:** the relational sentence and cultural expression of those admitted systems.

The Clayroom should be a retained family of small fixtures, not one increasingly cluttered room.
Every fixture must use the production compiler, geometry builders, materials, lights, camera,
sprites, and cutaway path. A special-purpose display may author canonical test inputs; it may not
invent a second renderer.

## Founder redlines captured from this conversation

These must be migrated verbatim into the repository's art-direction authority when an implementation
session is authorized:

> "The clay room in it's current state sucks."

> "It seems to have basic dungeon floor glued to it"

> "it doesn't seem to have any ability to have my two temp lighting system in it."

> "the sprite is back to an overexposed undersaturated crappy looking piece of paper that has been
> through the washing machine."

> "I know for sure I still want the lighting lab and i want to be able to basically adjust the
> default settings for every type of light that could be rolled in the game"

> "i still want the vertical and horizontal baseline editor added to the sprite sheet"

## Current-state audit

### What remains real and worth preserving

- The C1A record is a deterministic 5×5 canonical test fixture.
- It compiles through `spatializePlan` and `interiorBuildBoard`.
- It uses production floor, wall, doorway, furniture, light, and sprite paths.
- It retains stable cell, portal, object, and citizen ids plus a prose twin.
- It has a fixed production camera, grid overlay, low ambient, and an intended opposing warm/cool
  light pair.
- The existing dormant Lighting Lab already has in-memory preview, live sliders, readouts, JSON
  export, and an explicit offline fold step.
- The sprite registry already carries the intended two-axis contact contract: `footX`, `footY`,
  `worldHeight`, `contentBounds`, `alphaCutoff`, and `shadowProfile`.

These are useful mechanisms. The visual fixture has failed; the canonical/test seams have not all
failed.

### Finding CR-1 — the clay surface is not durable

Observed live at:

`genesis.html?clayroom=1`

The final settled frame shows a repeated dungeon-like floor instead of a neutral diagnostic clay
surface.

The source path explains the symptom:

1. `mountClayRoom()` calls `setInteriorBoard()`.
2. `clayRoomFlattenFurniture()` and `clayRoomFlattenStructure()` then replace selected production
   materials with flat gray.
3. The goblin sprite texture loads asynchronously.
4. `spriteTextureFor()` responds by replaying `setInteriorBoard(S.lastBoard)`.
5. That replay rebuilds the interior geometry/materials.
6. `clayRoomMaybeAutoMount()` reasserts only `clayRoomApplyLightProfile()` per frame; it does not
   reassert the diagnostic material routing.

Disposition: `REGRESSION — FIX BEFORE NEW PROOF`.

The correct repair is not a new hand-built floor. Diagnostic material selection must become a
stable production-builder mode or a replay-safe post-build override applied through the same mount
lifecycle every rebuild uses.

### Finding CR-2 — the two-temperature rig bypasses the Lighting Lab

`CLAY_C1A_LIGHT_PROFILE` does contain two opposing lights:

- west warm point: `0xffa04a`, intensity 16;
- east cool point: `0xaebfe8`, intensity 9;
- white ambient: intensity 0.18.

However, `clayRoomApplyLightProfile()` constructs these lights directly. It deliberately bypasses
`applyLightProfile()` and `LIGHT_TUNABLES` to escape the old global ambient clamp.

Live proof with:

`genesis.html?clayroom=1&lightlab=1`

shows both panels, but the Lighting Lab selector contains only the normal production renderer
profiles:

`dark`, `torchlit`, `lavalit`, `fungal-glow`, `magic-glow`, `lamplit`, `moonlit`, `daylit`,
`overcast`, and `voidlit`.

There is no Clayroom opposing-pair recipe in the Lab, and the existing profile schema exposes only
one key point per profile. Global exposure/bloom/sprite controls can affect the rebuilt frame, but
the actual Clayroom pair cannot be edited as a pair.

Disposition: `MECHANISM EXISTS; AUTHORING CONNECTION MISSING`.

The repair should generalize the tunable light recipe to a bounded `lights[]` array and admit the
Clayroom diagnostic pair as a named test recipe. It should not add more Clayroom-only light objects.

### Finding CR-3 — physical emitter truth is unclear

The live Clayroom console reports:

`[interiorBuildLights] wall-mount fixture had no mount slot data — degrading to floor:
bracket-generic 1`

The frame also shows several bright emitter-like orbs without a clearly readable cool-side physical
source. The private opposing pair is not linked to visible fixture geometry.

Disposition:

- A **diagnostic studio rig** may use explicitly labeled non-diegetic test lights.
- A **production rolled practical** must remain co-located with a visible housing/emitter and a
  valid mount socket.
- The UI and capture receipt must say which mode is active. The two may not be visually or
  semantically conflated.

### Finding CR-4 — sprite citizenship is incomplete

The bleached sprite is visible in the settled Clayroom capture. Several source facts make this more
than a subjective read:

1. `spriteTextureFor()` sets filtering but does not set the loaded PNG texture's color space to
   `THREE.SRGBColorSpace`. Other authored color textures in the same renderer explicitly do.
   Interpreting sRGB color bytes as linear input is a strong candidate for the pale/high-value
   result and must be A/B tested.
2. The Clayroom pair uses two non-attenuating point lights (`distance:0`, `decay:0`) with combined
   authored intensity 25. A camera-facing Lambert plane can receive both strongly, after which the
   grade compresses the result. This is a second strong candidate for washed highlights and lost
   chroma.
3. The generated registry carries `footX` and `footY`, but the live interior sprite branch stores
   `interiorFloorFrac` from the older optional `entry.floor` field. The two-axis registry contract
   is therefore not the live anchoring authority.
4. `buildSpriteBillboardMesh()` still builds one `PlaneGeometry`; the specified thin side shell is
   not present in that path.
5. The C1A verifier checks sprite identity, registry height provenance, and light-profile shape. It
   does not compare source-art color to rendered color, measure highlight clipping/chroma loss, or
   exercise the full citizenship defect matrix.

Disposition: `PARTIAL CITIZENSHIP; VISUAL ACCEPTANCE WITHDRAWN`.

Do not solve this with an arbitrary saturation slider. First make color-space handling, lighting
energy, anchoring, alpha, material response, and the physical standee contract correct. Artistic
grade controls come after those invariants.

### Finding CR-5 — the fixture gate proved truth, not beauty

The C1A harness is strong about deterministic records, ids, provenance, production wiring, the
presence of two different light colors, and the intended low ambient. The capture script takes
screenshots and records console errors, but it does not establish a durable accepted visual
baseline or a mutation-sensitive beauty gate.

This is why the code can be 79/79 green while the frame visibly regresses.

Disposition: retain the harness and add visual-system gates; do not weaken or discard the truth
gate.

## Clayroom fixture family

One URL may host these as selectable modes, but each mode is a small retained fixture with one
primary question.

| Fixture | Primary question | Content |
|---|---|---|
| `CL-F00 room-truth` | Does the real production room stay honest after every rebuild? | 5×5 room, door, crate, one citizen, neutral clay, grid |
| `CL-F01 structure-bench` | Do generic construction atoms join and terminate correctly? | runs, corners, ends, openings, tiers, risers, connectors, blocker |
| `CL-F02 lighting-bench` | Do diagnostic and rolled light recipes produce controlled, motivated light? | neutral stepped surfaces, one matte sphere/cube, visible fixtures, sprite |
| `CL-F03 sprite-citizenship` | Does source pixel art remain a physical, correctly colored standee? | representative sprites across size/alpha/value bands |
| `CL-F04 material-bench` | Do material channels, scale, UVs, roles, and fallbacks work? | floor, wall, riser, trim skeleton, timber, iron, ground |
| `CL-F05 trim-bench` | Does the `h6-v1` sheet project without hiding geometry defects? | straight/non-multiple runs, corners, endpoint, opening, stair, curb, T-junction |
| `CL-F06 seed-stress` | Do bounded procedural variants remain legal and readable? | retained seed matrix plus adversarial dimensions/joins |

`room-truth` stays small forever. Later benches join it; they do not replace it.

## Proof ladder before Guard Post 1

### CL-R0 — reset the current fixture

Primary question: can the existing room remain diagnostic clay after asynchronous assets and
rebuilds settle?

Required:

- neutral gray on every intended structural/furniture role;
- no color texture bound to diagnostic-clay materials;
- same result before and after sprite/door/fixture async settlement;
- role-ID diagnostic mode for floor, wall, riser, trim, portal, furniture, emitter, and sprite;
- zero ownerless mounted objects;
- zero mount-socket warnings in the accepted fixture;
- one known-bad replay mutation must visibly return the unwanted dungeon material and fail.

Guard Post work should not consume the fixture until CL-R0 passes.

### CL-R1 — color, light, and tone-response truth

Primary question: can the renderer preserve authored color while allowing light to shape value?

Two separately labeled modes:

1. **Opposing warm/cool diagnostic pair**
   - low white ambient;
   - bounded warm and cool sources on opposite sides;
   - tunable through the same recipe registry as the Lab;
   - neutral test geometry plus a representative sprite;
   - intended only as a comparison rig.
2. **Rolled production recipe**
   - selected from the renderer light catalog;
   - environmental source or physical fixture is explicit;
   - shadows, range, decay, emitter body, and mount are real;
   - semantic table row and renderer recipe mapping are visible.

Required measurements:

- source-sprite versus unlit-render versus lit-render comparison;
- clipped-highlight percentage;
- median and percentile luma;
- chroma/saturation retention by a simple declared metric;
- dark-corner, pool, and daylight sprite brightness bands;
- material gray card values;
- no practical point/spot without a visible valid emitter;
- a deliberately wrong color-space mutation and an overpowered-light mutation both fail.

### CL-R2 — complete sprite citizenship

Primary question: does a sprite read as a physical citizen rather than printed paper?

Required:

- sRGB color texture invariant;
- nearest magnification and governed minification;
- registry `footX` and `footY` are the only contact/rotation anchors;
- authoritative `worldHeight`, honest width/aspect, and occupied-cell relation;
- alpha cutoff from the registry;
- content bounds available or loudly marked missing;
- thin side shell/extrusion so the card does not vanish edge-on;
- stable floor-flat beveled plinth;
- soft contact plus diegetic cast shadow;
- controlled Lambert/standee shader response and readability floor;
- no arbitrary full-bright exception indoors;
- fixed-camera billboard behavior, deterministic kilter, cutaway/occlusion citizenship;
- source art, isolated standee, neutral Clayroom, dark corner, warm pool, cool pool, and full daylight
  cards for the same sprite.

Minimum representative matrix:

- Small dark fantasy creature;
- Medium PC/humanoid with skin and cloth;
- pale/bright creature vulnerable to highlight clipping;
- very dark creature vulnerable to black crush;
- Large or Huge silhouette;
- translucent/FX-like alpha edge case if the live corpus licenses one.

The current goblin alone is not a citizenship gate.

### CL-R3 — basic construction grammar

Primary question: can the Guard Post inherit trustworthy geometric atoms?

Prove in neutral clay:

- floor field and exposed slab sides;
- straight wall with honest thickness, cap, inner and outer faces;
- convex and concave corners;
- endpoint and T-junction ownership;
- opening/aperture, frame, threshold, hinged leaf, and swing clearance;
- broad raised and sunken region;
- riser/retaining run, inside/outside corner, endpoint, and cap;
- one-cell and wide stair with top/bottom landings;
- shallow ramp;
- half-height blocker/parapet base;
- square and round support;
- deterministic cutaway/ghosting;
- mount/join sockets and provenance.

Keep crenellations, arrow slits, roof silhouette, signaling devices, and guard-specific defenses out
of this gate unless a generic construction need independently licenses them.

### CL-R4 — material and surface routing

Primary question: can reusable Material Maker 1.3 seeds arrive in the renderer correctly?

Prove:

- base color, normal, and ORM channel interpretation;
- declared physical scale and 3×3 repeat;
- stable UV frame on floor, wall, riser, cap, and opening;
- semantic material family separated from surface-role selection;
- missing normal/ORM fallback to the same base family;
- neutral old stone parent seed;
- structural timber parent seed;
- forged iron parent seed;
- quiet earth/ground parent seed;
- condition masks consume canonical inputs and never invent history;
- source graph, exported maps, manifest, binding, and capture receipt share one version/hash lineage.

The Clayroom proves the seed parents and routing. The Guard Post proves the selected maintained
overgrown-stone combination, road/ground relation, chronological repair story, and cultural
selection.

### CL-R5 — trim-sheet projection

Primary question: does trim infrastructure work before aesthetic trim enters the Guard Post?

First use a diagnostic six-color `h6-v1` sheet. Prove:

- stable band manifest;
- full-width strips with gutter/mip safety;
- base course, cornice/belt, cap, stair nosing, and curb/retaining route to the correct geometry;
- repeat phase, non-multiple lengths, run segmentation, clamped sampling;
- corners, acute bevels, endpoints, openings, and T-junction fallback;
- cutaway ownership;
- base-only and geometry-only fallbacks;
- zero tactical/collision change.

Only after the diagnostic sheet passes should Material Maker stone strips be packed and judged.

### CL-R6 — deterministic seed resilience

Primary question: do admitted rules survive variation rather than one curated fixture?

Required evidence:

- one retained ordinary golden seed;
- at least eight changed seeds for each admitted procedural fixture;
- adversarial smallest/largest legal dimensions;
- inside/outside corners, odd run lengths, openings near corners, elevation transitions, and
  connector adjacency;
- same seed plus recipe version is byte-identical;
- different seeds vary only licensed fields;
- no seed-specific branches or hand-placed coordinates;
- failure yields a typed rejection/fallback receipt, never broken geometry.

## Lighting Lab 2.0

### Product answer

Yes, the Lighting Lab is still worth building. More than that: it should be the visual-default
authoring surface for the renderer's bounded light recipes.

It must edit **recipes and defaults**, not arbitrary scene patches.

### Three levels of lighting truth

Do not create one independent renderer preset for every prose row.

1. **Semantic roll**
   - Examples: Torchlit Warmth, Lantern Cones, Pitch Black, Shadow-Heavy, Moon-Sick Blue,
     Green Lichen Glow, Urban Filtered, Wilderness Overcast.
   - Table-owned meaning, mechanical visibility, and flavor.
2. **Renderer recipe**
   - Current bounded set: `dark`, `torchlit`, `lavalit`, `fungal-glow`, `magic-glow`,
     `lamplit`, `moonlit`, `daylit`, `overcast`, `voidlit`.
   - A recipe may support a bounded `lights[]`, not only one point.
3. **Physical/environmental realization**
   - Environment key: sun, moon, sky/overcast, diagnostic key/fill.
   - Practical fixture: torch, brazier, lantern/lamp, fungus, magical source, lava/ember source.
   - Every practical owns housing, emitter, mount, range, shadows, and optional flicker.

The Lab edits levels 2 and 3 and displays the level-1 mapping. The Table Atlas remains the editor
for level 1.

### Editable recipe fields

Scene:

- ambient color or temperature;
- ambient intensity;
- exposure floor;
- tone-map/grade profile selection and bounded strength;
- bloom threshold/strength;
- fog/obscurement only when owned by a separate canonical atmosphere fact.

Each `lights[]` entry:

- enabled;
- `environment | directional | point | spot`;
- color temperature in Kelvin with derived hex plus exact hex override;
- intensity with explicit units/convention;
- board-relative or socket-relative position strategy;
- azimuth/elevation for environment/directional sources;
- range and decay;
- spot cone and penumbra where applicable;
- cast shadow, bias, normal bias, map size, and budget priority;
- flicker recipe id/amplitude/rate where licensed;
- physical fixture id, emitter-local offset, and mount socket for practicals.

Sprite response:

- emissive readability floor;
- declared standee material/shader recipe;
- read-only color-space/filter/alpha invariants;
- dark-corner, warm-pool, cool-pool, and daylight measured outputs.

Color space, alpha mode, and authored sprite saturation are invariants, not taste sliders.

### Required Lab behaviors

- fixture selector defaults to the Clayroom lighting bench;
- choose semantic roll and see its renderer mapping;
- choose renderer recipe and inspect every light/fixture;
- opposing warm/cool diagnostic preset;
- before/after immutable baseline;
- reset to authored default;
- reset to compiled lock;
- undo/redo;
- seed and time-of-day preview;
- source sprite versus rendered sprite card;
- diagnostic overlays for light position/range/cone/shadow frustum;
- live luma/chroma/clipping/readability values;
- capture the whole acceptance matrix;
- export one validated versioned lock/receipt;
- no direct JavaScript-constant mutation from the browser.

### Save model

Use the already-specified Dev Portal lock transaction:

`dirty preview -> validate -> authored JSON lock -> deterministic compile -> relevant verifier ->
reload compiled lock`.

The existing `build/fold-lightlab.py` is useful evidence but should eventually fold or compile the
same structured lock format the Dev Portal uses. Do not maintain two permanent save authorities.

## Extend the existing Sprite Editor: vertical and horizontal crosshair

Do not build a replacement Sprite Editor. The existing tool is still present in the moved repository:

- `genesis/dev/sprite-review.py`
- `genesis/dev/sprite-review.html`

Run it from the nested repository with:

```bash
cd "/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis"
python3 dev/sprite-review.py
```

Then open `http://127.0.0.1:5179/`.

It already owns the valuable review workflow: filtering, lineup and pinning, scale and height review,
the horizontal floor line, pass/fail/redline state, notes and tags, overlays, and registry
regeneration. Preserve all of that. The missing capability is a visible, draggable two-axis
crosshair.

To avoid ambiguous terminology, store:

- **Vertical guide: `anchorX` / `footX`** — the horizontal image coordinate of the planted
  contact/rotation axis. It is drawn as a vertical line.
- **Horizontal guide: `contactY` / `footY`** — the vertical image coordinate of the floor-contact
  line. It is drawn as a horizontal line.

The crossing point is the standee origin.

### Required editor behavior

- drag either guide or the crosshair;
- display pixel and normalized coordinates;
- arrow-key nudge by 1 px; Shift for a larger declared step;
- reset to measured alpha-contact candidate;
- reset to compiled registry value;
- show tight content bounds and alpha cutoff;
- show the source cut over transparency;
- show the standee on its real plinth in the Clayroom citizenship fixture;
- show side, front, and fixed production views;
- show floor plane, shadow, occupied-cell footprint, and declared world height;
- pin a 6-foot reference and representative same-size neighbors;
- save to the authored overlay/lock, regenerate the registry, and verify;
- preserve old stable ids and never rewrite PNG pixels from anchor edits.

### Minimal extension

The existing `dev/sprite-review` tool supports a click-set horizontal `floor` line. Extend that tool
in place:

- add a draggable vertical guide that writes canonical `footX`;
- make the horizontal guide the other arm of the same crosshair and write canonical `footY`;
- preserve migration or conversion from the existing overlay `floor` value;
- retain the current filtering, lineup, pinning, scale, height, verdict, notes, tags, overlays, and
  regeneration behavior;
- make the runtime consume the resulting `footX/footY` pair consistently.

The editor can later be mounted or linked from the Dev Portal, but that integration must not become
an excuse to rewrite or discard the working tool.

The earlier Dev Portal sketch already anticipated:

`floorLinePx`, `anchorXPx`, `anchorYPx`, `offsetXPx`, `offsetYPx`.

Simplify that into one canonical crosshair plus clearly separated optional presentation offsets:

```text
footX, footY            canonical sprite-space contact origin
offsetX, offsetY        rare renderer presentation correction, separately justified
worldHeight             canonical physical height
```

Do not use offsets to hide a wrong crop, wrong anchor, or wrong world height.

An optional full-sheet contact view may overlay every cell's saved crosshair for batch review, but
the data remains per stable sprite id. These guides are not destructive slicer boundaries.

## Clayroom Workbench

### Product answer

Yes, but do not build a freeform level editor.

The useful tool is a **procedural acceptance workbench**: Adam changes bounded defaults and recipe
parameters, sees production output immediately, compares against accepted states, and exports a
versioned candidate. The tool must not allow hand-authoring the Guard Post one cell at a time.

### Relationship to the existing Dev Portal sketch

Preserve the portal's governing law: one real renderer, one fixture adapter, one mounted tool at a
time, validated lock data, no direct constant edits.

The Clayroom is a shared fixture, not a thirteenth duplicate renderer. The workbench should link to
the existing dedicated editors:

- **Lighting Lab** for renderer recipes and fixture defaults;
- **existing sprite-review editor** for contact/height/citizenship, extended rather than replaced;
- **Object/Construction Workbench** for anchor-relative geometry and sockets;
- **Provenance Inspector** for source-to-render ownership;
- **Shot Tuner** for diagnostics, with production camera pitch still locked.

### Clayroom-specific controls

Fixture:

- retained fixture/mode selector;
- seed and recipe-version selector;
- rebuild/reset;
- accepted baseline versus candidate;
- capture matrix and receipt export.

Structure:

- catalog part/assembly selector;
- table-backed profile choice;
- legal dimensions, run length, height, thickness, and connector variant;
- join/corner/endpoint/aperture cases;
- socket visualization;
- cutaway/ghost state;
- custom/procedural, Kenney fallback, and geometry-only fallback A/B.

Surface:

- diagnostic clay;
- role-ID colors;
- normals;
- UV checker and repeat phase;
- material-id/trim-band view;
- albedo-only, normal-only, roughness, metallic, AO;
- fallback and missing-channel state.

QA:

- grid/collision/blocked volume;
- owner/provenance;
- object bounds and mount axes;
- light fixtures/ranges/cones/shadow frusta;
- sprite origin/plinth/shadow;
- luma, chroma, clipping, draw calls, triangles, texture memory, and frame time;
- visible failed assertions and rejected candidate receipts.

### Controls that should not exist

- free cell painting;
- arbitrary prop placement;
- arbitrary world transforms as the primary save format;
- per-seed patching;
- culture or realm painting;
- direct table-fact edits;
- direct generated-artifact edits;
- unlocked production camera pitch;
- a saturation slider that compensates for incorrect color management;
- a “make pretty” control with no reproducible recipe.

## Table versus engine boundary

| Belongs in table/catalog data | Belongs in deterministic engine roller | Belongs in renderer/tool |
|---|---|---|
| structure family, corner/end profile, connector type, material family, surface role, light semantic, renderer recipe id, fixture class, culture construction choice, condition/history fact | coordinates, bounded candidates, run segmentation, join resolution, UV phase, socket matching, light placement from mounts, seed variation, validation/scoring, fallback selection | projection, material/light/shader execution, diagnostics, temporary preview, measurement, capture |

Every saved workbench change must become a table/catalog row, a versioned recipe/lock, or an explicit
renderer invariant. If it cannot be represented that way, it is probably hand-authored decoration
and should not enter the procedural pipeline.

## Guard Post entry gate

Guard Post 1 may begin its real composition pass when:

1. CL-R0 diagnostic clay survives every rebuild.
2. CL-R1 has a tunable opposing-pair rig plus real rolled-recipe mode.
3. CL-R2 passes the sprite citizenship matrix.
4. CL-R3 admits the generic wall/opening/elevation/riser/connector/blocker atoms the selected
   composition needs.
5. CL-R4 proves the material channel and MM 1.3 seed-parent pipeline.
6. CL-R5 proves the diagnostic trim sheet before beauty strips.
7. CL-R6 changed-seed and adversarial cases have no broken geometry.

The Guard Post then owns:

- road and terrain relation;
- defended threshold;
- observation and operational silhouette;
- maintained overgrown-stone selection and history;
- culture A/B construction expression;
- tactical negative space, approach, flank, objective, and retreat;
- final gameplay-scale taste.

## Recommended execution order

1. Bank the current bad Clayroom frame as the red baseline.
2. Repair replay-safe diagnostic-clay routing.
3. A/B sprite sRGB tagging and bounded light energy; bank the causal result.
4. Route the opposing pair through a generalized light-recipe registry.
5. Extend the existing Sprite Editor with the authoritative crosshair and consume `footX/footY` at
   runtime.
6. Complete the physical standee contract and citizenship matrix.
7. Build the small structure bench.
8. Prove MM 1.3 material routing on neutral parent seeds.
9. Prove the diagnostic `h6-v1` trim sheet.
10. Run changed-seed/adversarial sheets.
11. Resume Guard Post composition.

This sequence removes the systems that currently contaminate Guard Post judgment while keeping the
Guard Post responsible for the compositional and cultural questions that only a real site can answer.
