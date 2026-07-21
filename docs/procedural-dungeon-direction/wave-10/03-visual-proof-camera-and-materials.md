---
type: design-study
status: OPEN
wave: 10
part: 3
legacy_sections: "11.34-11.41"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 10 — Visual Proof, Camera, and Materials

<!-- BEGIN VERBATIM MIGRATION: original lines 18388-19055 -->

### 11.34 F10.6b ruling - three-point native-resolution proof; no 1024 full-shell promise

**Adam's ruling (2026-07-20):** choose Option B. The required Wave 10/P10.12 capture matrix is:

1. **2560×1440 native desktop:** beauty, large-field composition, crisp hybrid substrate/pixel citizenship, and
   higher-resolution renderer target;
2. **1920×1080 native desktop:** canonical gameplay acceptance gate for the dominant current desktop resolution;
3. **1194×834 logical-point landscape tablet:** representative horizontal-tablet shell gate, tested with safe-area
   insets and separately at its backing/device-pixel scale.

Genesis does **not** promise the complete left-rail/central-SceneTray/right-chat shell at 1024×768 logical points in
this ruling. That size may remain an exploratory or explicitly degraded/accessibility projection, but it cannot fail
the release candidate merely because the full shell does not fit. If product scope later claims smaller-tablet
support, reopen this gate explicitly and add a tested layout rather than silently inheriting Option A's rejected
floor.

At all three accepted gates, semantic and interaction invariants remain: canonical cast and state, exact tactical
truth where owned, readable chat/type, usable inputs, initiative navigation, safe object cards/drawers, and
accessibility equivalents. Presentation density/effect quality may scale only through the later P10.7/F10.7 budget
law. F10.6b is closed.

#### F10.6c - what controlled evidence proves normal response and sprite grounding?

The Cards G-L simulated modest normal-mapped relief, but `MATERIAL-IDENTITY.md` correctly remains
`SPECCED-WITH-SPIKE`. Its first legal scope is the interior shell—floor, walls, and doorframes—not figures, sprites,
dressing, displacement, parallax, or a full PBR conversion. Separately, sprites need an alpha-shaped real cast
shadow and a compact contact shadow; those solve different visual problems and require independent controls.

- **Option A - same-scene isolation ladder plus final-stack captures (recommended):** use identical canonical
  state, camera, albedo, light placement/intensity, exposure, and crop. Capture flat shell versus normal-enabled shell
  while holding shadows constant; then isolate sprite no-shadow, cast-only, contact-only, and cast+contact states
  while normal response remains fixed. Finish with the accepted full stack at all three F10.6b sizes and across the
  representative Gloom/Chrome/Fantasy material identities.
- **Option B - one flat/current capture and one fully polished capture:** cheapest persuasive comparison, but any
  improvement could come from changed exposure, light, shadow, camera, post, or composition. It cannot prove which
  layer works, tune cast versus contact independently, or diagnose a noisy normal map.
- **Option C - accept the taste-card simulation and defer controlled proof:** no immediate capture cost, but treats
  an unimplemented visual promise as if it were an engine win and leaves the release renderer boundary unverified.

Option A's minimum unique capture states are:

```text
M0  normals OFF · cast ON  · contact ON   (flat-material comparison)
S0  normals ON  · cast OFF · contact OFF  (ungrounded sprite baseline)
S1  normals ON  · cast ON  · contact OFF  (cast-shadow contribution)
S2  normals ON  · cast OFF · contact ON   (contact-grounding contribution)
S3  normals ON  · cast ON  · contact ON   (accepted full stack; M1 normal comparison)
```

`M0` versus `S3` changes only normal response; `S0/S1/S2/S3` isolate sprite grounding. If a material fallback or
missing derived map is under test, it must return truthfully to `M0` material response without changing scene
identity, lighting, or geometry.

The proof must establish more than visible difference:

- the Lambert-versus-Phong spike chooses a supported material path before style judgment;
- derived Sobel normals produce restrained surface feel rather than inflated grout, embossed stickers, crawling
  noise, or false geometry;
- Gloom, Chrome, and Fantasy remain distinguishable with light color held controlled enough to judge material;
- normal maps remain one reversible/cacheable binding per supported surface kind within the existing texture/draw-
  call guardrail;
- cast shadows follow sprite alpha instead of rectangles and respond truthfully to motivated lights;
- contact shadows remain compact/local and do not read as a second light source or duplicate silhouette;
- missing/disabled normals, missing cast support, reduced effects, and save/rebuild land on deterministic fallbacks;
- performance, texture memory, draw calls, edge filtering, pixel crispness, and visual comprehension are recorded at
  the three accepted sizes. P10.7/F10.7 later sets final tier budgets; this proof supplies evidence rather than
  guessing them.

Do not change light rigs, camera, scene dressing, or exposure between compared frames to make the enabled state win.
The full-stack beauty capture follows the isolation ladder; it does not replace it. First proof remains shell normals
plus sprite cast/contact shadows. Prop-class normals and any extraordinary sprite-light-response experiment remain
later P10.5/P10.6 questions, not scope smuggled into this gate.

**Implementation/maintenance cost:** Option A is **medium-high spike/capture/QA work**, but most architecture is
already bounded in `MATERIAL-IDENTITY.md`: material compatibility spike, derived map/cache, reversible flag, shadow
controls, capture harness, three realm scenes, three resolutions, and measured review. Option B is low-medium but
weak evidence; Option C carries the highest risk of discovering the target is unaffordable or ugly after committing
the renderer.

**Codex recommendation: Option A.** The target depends heavily on subtle material response and grounded pixel
citizens. A controlled isolation ladder is the smallest honest proof that those are actual independent engine wins,
not qualities painted into a mockup.

Does Adam accept Option A? If so, F10.6c closes as a future capture gate—still no implementation—and the
questionnaire returns to P10.5/P10.6 material/asset scope and the remaining Wave 10 deep dives. Wave 10 remains
**OPEN**.

### 11.35 F10.6c ruling and F10.6d expansion - controlled material/shadow proof accepted; route normals by construction

**Adam's ruling (2026-07-20):** accept Option A as a future implementation/capture gate. The same canonical scene,
camera, albedo, light placement/intensity, exposure, crop, and dressing must produce the controlled `M0/S0/S1/S2/
S3` ladder from section 11.34. Flat-versus-normal response and no/cast/contact/both sprite shadows are independently
observable before the full-stack beauty frame is judged.

The full stack must then prove Gloom, Chrome, and Fantasy material identity at 2560×1440, 1920×1080, and 1194×834
logical tablet layout/backing scale. Capture evidence includes compatibility-spike result, realm differentiation,
normal restraint, alpha-shaped cast shadows, compact contact grounding, fallbacks, performance, texture memory,
draw calls, filtering, pixel crispness, and comprehension. F10.6c closes as a specified future gate; it does not
authorize implementing or running that gate now.

#### F10.6d - after the shell proof, which props or sprites should receive normal response?

Normal maps are useful only when their height interpretation is truthful. A floor texel recipe deliberately encodes
grout and stone relief; a character sprite's painted highlights, eyes, cloak folds, transparent gaps, and single
view do not automatically encode a valid tangent-space surface. Applying the same luminance-to-normal conversion to
both would turn lighting paint into false dents and make pixel citizens crawl under moving lights.

- **Option A - construction-class-routed normal response (recommended):** require derived normals for supported
  shell recipes after F10.6c passes; allow governed reusable material/height recipes on structural primitives and
  prop classes whose construction supports them; keep ordinary creature/NPC sprites normal-map-free and ground them
  through alpha cast/contact shadows. Permit authored/generated normals for rare hero assets only after their own
  same-state proof.
- **Option B - generate normal maps for every visible asset, including sprites:** maximizes dynamic light response
  but creates a large generation/cache/QA surface, makes single-view pixel art pretend to own volume it does not,
  and risks noisy relief, halo edges, inconsistent faces, and per-asset exceptions dominating production.
- **Option C - shell normals only, permanently:** safest first release and lowest maintenance, but leaves cheap
  integrated chests, doors, columns, blocks, and later hero props unable to gain coherent material response even
  when their construction recipes already own truthful faces/height.

Option A routes by the accepted prop construction taxonomy:

| Representation | Best-case normal-response law |
|---|---|
| Interior floor/wall/doorframe shell | Derived/cached recipe normal required after spike; modest realm-tuned scale; flat fallback. |
| Structural tile/block/cylinder/opening | Geometry/vertex normals own form; optional class material micro-normal may describe stone, wood, metal, or soil without changing collision/elevation. |
| `FACED_BOX` chest/crate | Body and lid remain actual box geometry. Each face may use a governed face/height/normal binding; hinges, seams, and lid state come from construction/state, not painted fake depth. |
| `EXTRUDE`/`LAYERED_EXTRUDE` | Actual extrusion owns silhouette/depth. A modest front-face normal is allowed only from an explicit height recipe or reviewed asset binding, never blind brightness. |
| `LATHE`/`SWEEP`/`MODEL_RECIPE` | Geometry owns major curvature/form; reusable material micro-normal is optional. Do not bake geometric handles, legs, rope coils, or moving parts into a normal map. |
| `DECAL`/semantic marker/card art | Flat by default. A decal may alter material channels only when its semantic class says so; a marker/card never claims surface depth. |
| Creature/NPC pixel standee | No automatic normal map. Preserve crisp canonical pixels, alpha-shaped cast shadow, compact contact shadow, stable lighting/grade, and optional non-geometric active glow. |
| Rare hero/boss/keepsake asset | May earn an authored or governed generated normal binding with asset version, fallback, budget, and controlled A/B proof; absence never blocks canonical identity. |

Examples:

- a chest is not made physical by embossing its flat sprite. Its body/lid are `FACED_BOX` geometry; the wood/iron face
  materials may carry restrained normal response while opening remains deterministic lid rotation;
- a round column's cylinder geometry owns roundness. A stone micro-normal adds chisel/pore response but cannot move
  its cover boundary or invent cracks;
- Varka's pixel sprite remains visually stable as lighting moves. The board's motivated light, alpha cast shadow,
  contact mark, color grade, and active glow make Varka belong without pretending the single sprite contains a 3D
  facial normal field;
- a unique dragon portrait/standee might later receive a reviewed hero normal asset, but the generic dragon remains
  fully playable and beautiful through the ordinary sprite contract.

Every normal binding records semantic material/class, source/derivation version, orientation/tangent convention,
scale, cache key, supported lights/material path, fallback, memory cost, and QA state. Normal response may change
shading only. It cannot establish geometry, collision, footprint, cover, openings, state, identity, or hidden facts.

**Implementation/maintenance cost:** Option A is **medium-high but bounded**: shell generator plus a small reusable
material-normal library, construction-class binding rules, selective prop/hero admission, cache/version/fallback,
and representative QA. Option B is very high recurring asset cost and visual risk. Option C is low now but closes a
valuable later quality lane unnecessarily.

**Codex recommendation: Option A.** It preserves the high-resolution material ambition while letting actual
geometry own form, pixel art remain crisp, and exceptional assets earn exceptional treatment instead of forcing an
unreliable universal pipeline.

Does Adam accept Option A? If so, follow into F10.6e: exactly which interim prop classes must be integrated geometry
at pre-alpha versus sprite/marker/card representation, then return to P10.5 beauty-floor and P10.7 performance deep
dives. Wave 10 remains **OPEN**; no build is authorized.

### 11.36 F10.6d ruling and F10.6d.1 follow-up - construction routing accepted provisionally; sprites earn an honest challenge

**Adam's ruling (2026-07-20):** settle provisionally on Option A, but do not treat ordinary character-sprite normal
maps as a proven waste of time or resources. Before that lane is rejected, Genesis must show comparative evidence
using its actual character art, actual board camera, actual gameplay scale, and actual lighting stack.

This qualification is supported by the existing research record rather than opposed to it. Section 5 of
`SPRITE-BILLBOARD-RESEARCH.md` finds that a flat billboard has one camera-facing surface normal and therefore can
receive useful overall light/tint but cannot express directional anatomy, folds, or volume. Per-sprite normal maps
are a legitimate documented upgrade, not nonsense. The same review also finds no research-derived sprite-size or
cost threshold at which that upgrade becomes worthwhile. The downloaded procedural-layout papers do not answer a
sprite-shading question; their applicable lesson is methodological: preserve hard truth constraints, compare legal
candidates, measure cost, and expose the decision rather than hiding it in a generator. Therefore the prior
recommendation remains a default production posture, not a foregone visual verdict.

#### F10.6d.1 - what evidence may close, preserve, or expand the character-normal lane?

Use one canonical encounter state and lock board geometry, character positions, camera, crop, albedo, filtering,
light placement/intensity/color, exposure, cast shadows, contact shadows, color grade, and UI. Compare three
character treatments:

```text
C0  ordinary sprite contract: flat character surface + accepted cast/contact grounding
C1  best governed automatic normal derivation + the same cast/contact grounding
C2  reviewed art-aware normal asset + the same cast/contact grounding
```

`C1` may test silhouette inflation, height/distance-field construction, or another reproducible automatic method,
but blind albedo-luminance embossing is not accepted as the best automatic case merely because it is easy. `C2`
must be a genuine best-case treatment whose surface directions respect face, body, equipment, folds, and transparent
gaps; otherwise the test would prove only that a poor normal map looks poor. All three states use the same material
response and only the character-normal binding changes.

The representative set must include at least:

- one ordinary upright PC or ally with a readable face and cloth;
- one armored or hard-surface humanoid whose painted highlights could conflict with moving light;
- one very small figure judged at true gameplay size;
- one wide quadruped or horizontal creature;
- one winged, many-limbed, or transparency-complex silhouette;
- one large boss/hero candidate likely to benefit from exceptional treatment;
- one dark-value sprite in a dim Gloom scene; and
- one bright or reflective sprite in Chrome/Fantasy lighting.

Use real Genesis sprites, including their source-resolution and alpha-edge behavior, rather than purpose-built test
art. Capture the accepted 2560×1440, 1920×1080, and 1194×834 layouts. Judge true gameplay presentation first; a
diagnostic enlargement may explain a result but cannot win a feature players cannot perceive on the board. Include
several motivated light directions or a short deterministic light/character-motion trace so the test reveals false
dents, highlight reversal, edge halos, shimmer/crawl, and painted-light versus simulated-light conflict that one
still frame can conceal.

The report must measure and show:

1. **Visible benefit:** whether the normal-enabled sprite is consistently preferred for scene integration,
   directional form, readability, and material response at gameplay scale—not merely visibly different when zoomed.
2. **Identity/style fidelity:** whether face, silhouette, equipment, faceted/pixel planes, palette hierarchy, and
   authored painted light remain stable as scene lighting changes. A normal map cannot make a canonical character
   look dented, rubbery, embossed, wet, or like a different pose.
3. **Grounding contribution:** whether `C1` or `C2` adds a meaningful win after alpha cast and contact shadows are
   already present. It does not get credit for a grounding problem solved equally well by the cheaper shadow stack.
4. **Runtime cost:** measured GPU frame time, texture memory, texture uploads/cache behavior, shader/material or
   draw-call consequences, loading, and fallbacks across a representative combat crowd—not a theoretical claim
   that one texture sample is cheap.
5. **Production cost:** generation or authoring minutes, correction/rejection rate, map storage, version/cache
   invalidation, alpha/tangent/orientation bugs, regeneration after sprite revision, and required visual-QA time,
   extrapolated transparently across the actual admitted sprite corpus.

Captures should be shuffled or otherwise unlabeled for the first visual preference pass, then unblinded for artifact
diagnosis. Adam retains visual-acceptance authority, but the capture sheet also records the measurable costs so a
subtle preference cannot silently become an unlimited per-asset obligation.

The gate has three honest outcomes:

- **Close ordinary character normals:** if neither `C1` nor `C2` produces a repeatable gameplay-scale improvement
  after the shadow stack, or if the improvement is outweighed by fidelity failures and corpus-wide cost, retain
  `C0` for ordinary sprites and record the evidence. This is the proof needed to call the broad lane wasteful.
- **Preserve the exceptional lane:** if `C2` materially helps close/hero presentation but `C1` fails or the benefit
  disappears at ordinary scale, retain reviewed normal assets only for rare hero, boss, or keepsake sprites whose
  screen use earns the cost. This is compatible with provisional Option A.
- **Reopen and expand the lane:** if `C1` or another governed reproducible path wins across representative ordinary
  sprites within the renderer and production budgets, amend Option A and admit the proven sprite classes. The test
  is not constructed to protect the recommendation from contrary evidence.

This proof is a **medium isolated R&D/capture cost** and a low recurring cost if it closes the lane. It prevents a
potentially much larger mistake in either direction: commissioning normal assets for the whole corpus without a
visible payoff, or discarding a high-value integration technique because its cheapest version was poor.

**Codex recommendation:** accept this three-way challenge gate and keep F10.6d provisional until it runs at the
relevant implementation milestone. Continue the design questionnaire under construction-routed Option A; the
later evidence may close, preserve, or expand sprite-normal scope without reopening unrelated shell/prop rulings.

Does Adam accept this as sufficient proof design, or should the eventual test include another character type,
lighting condition, or success criterion? After this material follow-up is exhausted, proceed to F10.6e: which
interim prop classes must be integrated geometry at pre-alpha versus sprite/marker/card representation. Wave 10
remains **OPEN**; no build is authorized.

### 11.37 F10.6d.1 ruling and F10.6e expansion - sprite challenge accepted; choose the pre-alpha physical-prop floor

**Adam's ruling (2026-07-20):** the three-way `C0/C1/C2` challenge is sufficient proof design for now. Continue
under construction-routed Option A, provisionally. Ordinary character normals are neither commissioned nor
permanently rejected until the future gameplay-scale evidence closes, preserves, or expands that lane.

#### F10.6e - in plain English, which objects must actually exist on the pre-alpha board?

The question is not whether every noun deserves a beautiful bespoke 3D model. It is which small set of reusable
physical recipes Genesis must possess before the board can honestly communicate movement, cover, openings,
interaction, light, and object state. A complex noun may combine an exact mechanical proxy with a marker/card for
identity; integrated geometry does not require pretending the proxy captures every visual detail.

- **Option A - mechanics-first physical starter kit (recommended):** build the dungeon shell and a bounded family
  of ubiquitous stateful primitives. Require geometry where position, obstruction, cover, traversal, motion, or an
  open/broken/on/off state changes play. Give everything else a truthful marker/card or explicit unmounted reason.
- **Option B - implement every construction class as a broad pre-alpha asset library:** make `EXTRUDE`,
  `LAYERED_EXTRUDE`, `FACED_BOX`, `LATHE`, `SWEEP`, and `MODEL_RECIPE` production-capable across furniture,
  mechanisms, dressing, and hero props before the first complete board. This reduces marker use, but converts the
  renderer bootstrap into a major procedural-modeling and asset-admission project.
- **Option C - structural shell plus chest exception:** render tiles, walls, columns, openings, hazards, and the
  already accepted chest; use markers/cards for nearly every other object, including practical lights and simple
  mechanisms. This is the fastest board, but likely makes the first playable world read as a good map covered in
  UI symbols rather than the desired hybrid physical scene.

Under Option A, the mandatory pre-alpha floor is:

| Physical family | Minimum honest representation | Examples and limits |
|---|---|---|
| **Ground, elevation, and traversal** | Tiles/meshes own raised and depressed cells, ledges, pits, stairs/ramps where required, bridges, and moving platforms. | The freight lift carrying Varka must be real positioned geometry with a moving reference frame. A painted lift icon cannot own his elevation or collision. |
| **Boundaries and portals** | Blocks, wall runs, cylinders, apertures, frames, door/gate leaves, portcullises, and hatches own collision, sight, cover, and open/closed/broken state. | A locked crypt door is a simple frame plus leaf; a raised portcullis clears its actual passage. Ornate identity may still come from face art and an inspector. |
| **Tactical blockers and cover** | Any noun currently affecting footprint, blockage, climbability, or cover gets an honest primitive/composite volume. | A toppled wardrobe used as full cover may be a correctly sized box proxy plus wardrobe marker/card. Decorative upright furniture need not receive that geometry merely because it exists in narration. |
| **Common box containers** | A reusable `FACED_BOX` body/lid recipe for chests is required; crates, cabinets, and sarcophagi may reuse it when their state or tactical presence matters. | The dungeon chest opens through lid motion and gives sound/animation feedback. Its latch is not stamped onto every face, and looting changes the same object's state rather than swapping in a new noun. |
| **Simple round containers/blockers** | Existing cylinders plus governed material/state bindings cover barrels, vats, urns, or posts when they block, contain, break, roll, or explode. A general `LATHE` art pipeline is not required yet. | An explosive barrel needs position, size, collision, destroyed state, and visible feedback. A decorative bottle on a shelf can remain in the room card. |
| **Motivated practical lights** | A tiny mount/body primitive plus emissive/`FX` supplies torches, lanterns, braziers, crystals, and similar visible light sources; canonical state owns lit/extinguished/broken. | The brazier visibly licenses its warm point light. Extinguishing it removes the flame/light without deleting the brazier. Ornate sculptural brazier modeling is deferred. |
| **Simple mechanisms and floor conditions** | Cheap `EXTRUDE`/`LAYERED_EXTRUDE` plates or handles, plus `DECAL`/`FX` where appropriate, represent switches, levers, pressure plates, grates, stains, tracks, fire, mist, and hazard footprints. Mechanical truth remains in canonical state. | A pressure plate needs a readable bounded cell and depressed/armed state; poison gas may be an area plus FX. Neither needs a bespoke trap sculpture. |

The following remain marker/card/reserve-first during pre-alpha unless their current mechanics promote them into
one of the physical families above:

- handheld, inventory-sized, or dropped items such as the turtle communicator, keys, letters, weapons, ingredients,
  and loose treasure: exact/bounded marker plus smart object card when on the board;
- complex machines, multi-ring astrolabes, strange magical instruments, statues, shrines, and focal curios:
  marker/card by default, or a simple footprint/cover proxy plus identity card when they affect tactics;
- ordinary tables, beds, shelves, market stock, crockery, books, and background dressing: projected only when
  salient, interactive, or mechanically relevant; no field of decorative dots;
- ropes, chains, pipes, roots, and rails: `SWEEP` only when their path affects traversal, restraint, cover, or a
  mechanism; otherwise a sprite/decal/FX or reserve description;
- bespoke `MODEL_RECIPE` furniture, monuments, traps, trees, and hero assemblies: valuable later quality work, but
  not a prerequisite for proving the board, state projection, interaction loop, and procedural room compiler.

Promotion is deterministic and state-driven. If the DM says an ordinary market table is now overturned for cover,
the canonical action must first create that valid world-state change. The SceneProjection then upgrades the table
from dressing/card to a sized cover proxy with the same object id; it does not improvise collision from prose or
mint a duplicate table. If no honest proxy can represent the new mechanic, the action receives an explicit
unsupported/alternate-realization response rather than fake geometry.

In a concrete dungeon, this means the floor, walls, door, portcullis, pit, chest, brazier, pressure plate, and rubble
barricade can all read and behave physically. A jeweled astrolabe and dropped turtle communicator may be precise
markers opening rich cards. In the Gemini-driven game, the DM can still invent either object: invention creates
trackable canonical properties first, and the renderer selects the best legal physical or marker representation
from those properties rather than restricting the DM to the existing art catalog.

**Implementation/maintenance cost:** Option A is **medium-high but bounded**. It needs the structural compiler,
portal states, primitive cover proxies, one real `FACED_BOX` container recipe, cylinder/state reuse, simple
practicals, basic plate/lever/decal/FX bindings, marker/card fallback, and promotion/rebuild tests. Option B is very
high because every procedural model class, source-art contract, state kit, and QA corpus becomes critical path.
Option C is low-medium but postpones too much of the physical feedback needed to judge the game honestly.

**Codex recommendation: Option A.** It proves every important representation seam—structure, moving platform,
portal, cover, container, practical light, mechanism, hazard, marker, card, and runtime promotion—without requiring
Genesis to model the whole furniture catalog before the procedural board works.

Does Adam accept Option A, prefer the broader Option B, or want to amend the starter-kit families? If Option A
closes without another material prop follow-up, return next to P10.5/F10.6's gameplay-scale beauty floor, then
P10.7 performance and degradation. Wave 10 remains **OPEN**; no build is authorized.

### 11.38 F10.6e ruling and F10.6f expansion - mechanics-first prop kit accepted; define the beauty floor

**Adam's ruling (2026-07-20):** accept Option A. Pre-alpha must physically prove ground/elevation/traversal,
boundaries/portals, tactical blockers and cover, the common `FACED_BOX` chest/container path, simple round
containers/blockers, motivated practical lights, and simple mechanisms/conditions/hazards. Complex, small, and
background nouns remain marker/card/reserve-first unless canonical mechanics promote them into a physical family.
Promotion preserves the same object id and receives an honest proxy or explicit unsupported/alternate realization;
the renderer never invents collision from prose. F10.6e closes.

#### F10.6f - what does “beautiful enough at gameplay scale” actually require?

Cards G-L establish a working visual family, but copying Card G's exact dungeon into every scene would be as wrong
as accepting an unlit wireframe because its cells are legal. The beauty floor needs to preserve an intentional,
coherent hybrid image while permitting different sites, modes, densities, weather, and performance tiers.

- **Option A - Card-G-equivalent finish everywhere:** require every ordinary room, town street, wilderness segment,
  and battle state to show approximately Card G's density of finished geometry, textured surfaces, practical
  lights, shadows, and composed atmosphere. This is visually simple to police but turns one dungeon beauty frame
  into an expensive universal content quota and may make daylight, sparse wilderness, or humble interiors feel
  artificially over-dressed.
- **Option B - invariant hybrid floor plus mode-specific reference frames (recommended):** lock the visual truths
  that every playable frame must preserve, then judge composition against a small reference family for its actual
  mode and density. Expensive accents may vary; legibility, citizenship, material/realm identity, and intentional
  composition may not.
- **Option C - mechanical legibility floor only:** pass when cells, doors, cover, actors, markers, and UI are
  readable, with lighting/material beauty treated as later polish. This is the cheapest gate but directly violates
  the accepted requirement that simplification preserve Genesis's visual-engine wins rather than become a diagram.

Under Option B, every normal playable SceneTray must pass these invariants at its accepted native viewport:

1. **Intentional composition:** the camera crop has a readable focal hierarchy and controlled negative space. The
   tray cannot look like arbitrary legal cells surrounded by empty renderer darkness, and no required play area is
   hidden beneath the left rail, right narration, initiative ribbon, drawer, card, or lens.
2. **High-resolution physical substrate:** silhouettes, elevation, apertures, edges, and large material regions are
   clean and stable at native output. Geometry does not become a globally pixelated framebuffer merely because
   actors use canonical pixel art.
3. **Material and realm identity:** floor, wall, structural, and cheap-prop materials respond coherently to light
   and remain distinguishable through construction/albedo/material pattern and grade—not only by tinting the same
   grey room blue, orange, or green. Normal response joins this floor only if the accepted controlled spike proves
   it; the flat fallback must still compose beautifully.
4. **Motivated light and controlled darkness:** local artificial light has a visible or spatially credible
   practical; daylight, moonlight, weather, magic, and other environmental sources have equally credible scene
   evidence. Darkness frames and directs attention without crushing important actors, paths, exits, or text.
5. **Grounded pixel citizens:** sprites retain canonical pixels, scale, silhouette, foot anchor, and readable
   palette. Contact grounding is present; cast-shadow behavior is alpha-shaped and light-consistent where the
   scene's light supports it. No magenta fringe, rectangular shadow, filtering smear, edge crawl, or pasted-sticker
   citizenship passes.
6. **Tactical and semantic truth:** walkable cells, height changes, openings, cover, hazards, selected/active state,
   known markers, and current object state remain readable without every object glowing. A beautiful frame that
   obscures play fails; a correct frame with no visual hierarchy or material life also fails.
7. **Readable game shell:** DM narration remains comfortable over the translucent right surface; active controls,
   labels, object cards, and character drawers meet contrast, scale, focus, and safe-placement laws without asking
   transparency to compensate for text laid directly over uncontrolled scene contrast.
8. **Truthful fallback:** missing art, disabled normals, reduced shadow quality, absent atmosphere, or a deferred
   model lands on a composed known representation—not a random substitute, invisible noun, glaring debug primitive,
   or materially different world state.

This is a reference-and-failure gate rather than an asset-count checklist. Fog, rain, bloom, floating motes,
special decals, ornate props, and hero effects appear only when semantically licensed and within budget. A bright
village noon can pass without torches or Gothic darkness; a barren salt flat can pass without clutter; both still
need deliberate material, light, scale, composition, and citizen integration.

The initial reference family should be:

| Mode | Working comparison |
|---|---|
| Ordinary dungeon/battle | Card G substrate and full shell, amended by all later combat/UI rulings. |
| Selected combatant / action focus | Card H's derived EngagementLens relationship, amended by its later orientation, labels, distance, initiative, and contextual-collapse rulings. |
| Large or multilevel battle | Card L's spatial scale and restrained shell, with the same readability and material floor. |
| Town/social street or public place | A new same-shell taste/capture frame is still required; dungeon blocks recolored as a town do not prove it. |
| Wilderness/travel/exploration | A new same-shell taste/capture frame is still required; an empty green grid does not prove it. |

Before Wave 10 closes, the town and wilderness references must establish the same visual grammar without demanding
the dungeon's exact masonry density or lighting. Later P10.12 captures must use canonical same-state inputs and
real engine assets; generated taste cards may set direction but cannot serve as build proof.

The downloaded procedural-layout papers support separating semantic intent from legal realization, comparing
candidates, and exposing fallbacks. They do not define visual beauty. That part must remain an explicit reference,
capture, play-scale comprehension, and art-direction judgment rather than a solver score masquerading as taste.

**Implementation/maintenance cost:** Option B is **medium-high renderer/art-direction/QA work**: stable hybrid
sampling, camera composition, lighting/material tuning, grounding, responsive shell checks, fallback composition,
and a small fixed cross-mode reference corpus. It is substantially cheaper than Option A's universal dressing quota
and materially safer than Option C's “polish later” promise.

**Codex recommendation: Option B.** It protects what makes Cards G-L desirable while allowing a dungeon, village,
wilderness crossing, sparse ruin, and large tactical field to be beautiful for different reasons. It also exposes
the current evidence gap honestly: the dungeon family has a target, while town and exploration still need their
own integrated-shell taste cards.

Does Adam accept Option B, prefer universal Card-G-level finish under Option A, or want to amend the mandatory
invariants/reference modes? If Option B is accepted, follow into the remaining F10.6 camera/zoom/play-scale bounds,
including minimum actor/cell readability, before P10.7's performance and degradation laws. Wave 10 remains
**OPEN**; no build is authorized.

### 11.39 F10.6f ruling and F10.6g expansion - invariant hybrid beauty floor accepted; choose camera focus authority

**Adam's ruling (2026-07-20):** accept Option B. Every normal playable SceneTray inherits the invariant hybrid
beauty floor from section 11.38, while mode-specific references define how a dungeon, selected-combatant view,
large field, town/social place, and wilderness/exploration place can satisfy it differently. Card G, amended Card
H, and Card L remain the current dungeon/action/large-field targets. Integrated-shell town and wilderness taste
references remain required before Wave 10 closes. F10.6f closes.

#### F10.6g - when does the camera show the whole place versus moving close enough to read the action?

The board cannot simultaneously show every cell of a large battlefield and keep every Medium standee large enough
to read. That is a presentation conflict, not a geometry failure. The camera therefore needs a declared authority:
does it always preserve the full field, does the system choose contextual fits, or may it become a freely directed
cinematic camera?

- **Option A - one full-board auto-fit plus manual zoom/pan:** the default always contains the complete current
  board. The player zooms or pans when actors are too small. This is deterministic and cheapest, but makes ordinary
  turns begin with tiny figures on large maps and pushes routine comprehension onto repeated manual camera work.
- **Option B - governed focus ladder with player override (recommended):** retain a stable nearly top-down camera
  family, but give it explicit overview, room/exploration, and action/combat fits. Canonical context chooses the
  starting fit; bounded player pan/zoom/rotation may override it, and a one-step recenter returns to the current
  canonical focus. Programmatic changes glide briefly and remain interruptible; direct player input responds
  immediately.
- **Option C - free cinematic orbit and zoom:** permit arbitrary pitch, yaw, distance, and target like a general 3D
  tactics camera. This offers the most screenshots and close inspection, but creates the largest occlusion,
  billboard, input, controller/touch, hidden-information, safe-rectangle, shadow, asset-backside, and QA burden.

Option B's three fit states are:

| Fit | What must remain in frame | Presentation target |
|---|---|---|
| **Overview** | The known current field or explored local site, its major topology, known exits/objectives, party locations, and revealed threats/hazards. | Spatial understanding; actors may become identification tokens at extreme scale, but cannot vanish or merge invisibly. Selecting one refocuses without changing state. |
| **Room/exploration** | The focused room/place zone, its usable portals, current party/cast, salient interactables, and one-cell-equivalent breathing margin where applicable. | The existing Beauty Wave target of a Medium standee around **12% of central SceneTray height** is a provisional capture benchmark, not a world-scale mutation. |
| **Action/combat** | Active actor, legal target/area, relevant route, reaction/hazard evidence, and enough surrounding cells to understand the choice and result. | The existing Beauty Wave target of a Medium standee around **18% of central SceneTray height** is a provisional benchmark; selected-actor EngagementLens may add identity/drama but cannot replace board truth. |

The percentages are starting evidence targets inherited from the built camera work, not universal constants for
Tiny, Huge, long, flying, or swarming bodies. The final gate measures representative silhouettes at 2560×1440,
1920×1080, and 1194×834. It asks whether the actor, its speakable label, occupied cells, posture/state, and key
equipment or anatomy remain identifiable at normal viewing distance. A diagnostic enlargement does not rescue an
unreadable gameplay frame.

Camera and UI share one safe-rectangle contract. Opening the object card, character drawer, right chat state,
initiative ribbon, or EngagementLens causes a governed refit of the same focus; it never crops the active actor's
head, the selected route/destination, a targeted area, or a known material consequence beneath UI. Closing the
surface restores the prior player-adjusted view when still legal rather than forgetting it.

The focus ladder may not become an information leak. It cannot center an unrevealed creature, reserve unexplained
space for a secret room, pull back to include an unknown ambush, or frame a hidden trap. Only player-known canon and
the legal action preview contribute to the fit. Large creatures, split parties, moving platforms, reinforcement
reveals, and changing elevations recompute from current projected bounds; they do not trigger hand-authored camera
exceptions.

The existing engine makes Option B credible: it already owns a roughly 35-degree elevated/45-degree dimetric
camera family, four yaw steps, auto-fit, manual zoom, room/beat fit concepts, headroom-aware containment, and
interruptible refit glides. Those are useful mechanisms, not automatically accepted release tuning. The next
material follow-up must decide whether the release BattleMat stays orthographic, uses the existing gentle
perspective path in some modes, or proves one projection through a controlled same-state capture.

**Implementation/maintenance cost:** Option B is **medium** because much of the mechanism exists, but safe-rectangle
integration, canonical focus sets, view restoration, representative size gates, large-field fallback, and
desktop/tablet capture proof remain. Option A is low-medium but spends player attention every turn. Option C is very
high recurring camera/art/QA cost and works against the simplified pre-alpha asset strategy.

**Codex recommendation: Option B.** It lets Card L show the battlefield, Card G show the room, and combat focus show
the actual choice without creating three renderers or asking the player to repair the camera every turn.

Does Adam accept Option B, prefer the fixed full-board Option A, or want free-camera Option C? If B is accepted,
follow immediately into F10.6h's orthographic-versus-gentle-perspective choice and final minimum-scale treatment,
then proceed to P10.7 performance/degradation. Wave 10 remains **OPEN**; no build is authorized.

### 11.40 F10.6g ruling and F10.6h expansion - governed focus ladder accepted; choose one projection law

**Adam's ruling (2026-07-20):** accept Option B. The SceneTray camera has governed overview,
room/exploration, and action/combat fits, chosen from player-known canonical focus sets. Bounded player pan, zoom,
and rotation override them; recenter returns to the current focus; player input is immediate while programmatic
refits may glide briefly and interruptibly. UI changes publish one safe rectangle and refit without losing the
prior legal player view. The existing 12% exploration and 18% combat Medium-standee targets remain provisional
capture benchmarks. F10.6g closes.

#### F10.6h - should the board be orthographic, gently perspective, or change projection by mode?

All three candidates can use the accepted nearly top-down angle and governed focus ladder. The meaningful
difference is whether distance changes apparent scale. Orthographic projection keeps near and far cells the same
screen size; gentle perspective lets corridors, height, and foreground/background separation recede slightly.

- **Option A - orthographic in every mode:** strongest board-game clarity, stable screen scale, easiest cell
  comparison, and lowest billboard/occlusion variance. It can still show real 3D height, lighting, shadows, and
  rotation, but long rooms and multilevel spaces may read flatter and less like the accepted XCOM/BG3/Octopath
  aspiration.
- **Option B - one gentle low-distortion perspective in every mode (recommended):** use the existing roughly
  **20-degree field of view** as the starting lens, with a nearly top-down roughly 35-degree elevation and 45-degree
  dimetric yaw. Overview, exploration, and action fits move camera distance/target while FOV stays stable. Exact
  grid state remains authoritative; modest perspective adds depth without becoming a free cinematic camera.
- **Option C - orthographic combat, gentle-perspective exploration/town:** gives each mode its locally strongest
  projection, but combat start/end visibly changes the world's projection; safe rectangles, labels, marker cards,
  shadows, sprite size, object picking, camera restoration, and every capture gate must work twice. It preserves two
  camera personalities precisely when the redesign is trying to converge on one tray language.

Under Option B, perspective is governed tightly:

- FOV is a stable visual contract, not a dramatic zoom effect. Player and system zoom move the camera within
  bounded fits; they do not pump the lens between wide-angle distortion and telephoto flattening.
- The starting angle is the current 35-degree-elevation/45-degree-yaw family, but the same-state capture spike may
  tune elevation within a narrow nearly top-down band if walls hide cells or the stage reads too flat. Four 90-degree
  yaw steps remain available; arbitrary pitch/orbit does not.
- Exact movement, reach, areas, cover, line of sight, elevation, and occupancy come from cells and receipts. A far
  cell looking smaller never changes its cost or lets the renderer estimate legality by screen distance.
- Depth of field, fog, bloom, or foreground occlusion may not blur/hide a currently selected actor, route,
  destination, target area, known hazard, or interaction marker. Cosmetic depth yields to comprehension.
- A projection change never occurs merely because combat starts. The same room, object ids, camera orientation,
  and player-adjusted view persist; only the governed focus target/distance may change.

#### Minimum-scale treatment - preserve world scale, enlarge the interface around it

Genesis must not make a distant goblin physically Huge or make an ogre shrink to Medium just to normalize their
screen height. World scale, footprint, and relative size remain canonical. When overview scale makes a citizen too
small for individual art reading:

1. retain the real sprite at true world scale and a truthful floor/footprint anchor;
2. keep selected/active/faction treatment, speakable label, and picking target usable through governed screen-space
   UI that does not pretend to be creature geometry;
3. focus the camera or open the accepted EngagementLens/initiative portrait when the player requests individual
   identity or action detail;
4. collapse only nonconsequential crowds through the already accepted representative-count/area rule; named or
   individually consequential citizens do not merge into one anonymous token;
5. if true-scale art, labels, and cells cannot be separated without overlap, declare the overview an overview and
   require a closer fit for individual targeting rather than lying with screen-space-scaled miniatures.

The 12%/18% benchmarks remain useful for Medium figures, but final admission is a corpus test rather than one magic
number. At all three accepted viewports, test Tiny, Small, Medium, Large, Huge, long/horizontal, flying, winged,
many-limbed, and swarm silhouettes. Record screen-space opaque bounds, cell/footprint separation, label collision,
selection hit target, edge stability, and whether identity/posture/key anatomy is readable at normal viewing
distance. Do not let a close-up screenshot rescue a failed gameplay fit.

The controlled projection proof uses the same canonical Gloom, Chrome, and Fantasy scenes, light/state/crop, UI
safe rectangle, and focus set. Compare orthographic and 20-degree perspective before final tuning. Option B remains
the recommendation only if gentle perspective materially improves depth/composition without breaking cell read,
sprite citizenship, target selection, shadow truth, or the 2560×1440, 1920×1080, and 1194×834 capture gates. If it
does not, orthographic Option A is the deterministic fallback; the taste-card look is not allowed to overrule real
engine evidence.

**Implementation/maintenance cost:** Option B is **low-medium incremental risk** because the engine already owns a
20-degree perspective path, the 35/45 camera family, focus fitting, sprite tilt compensation, and containment tests.
It still needs one converged projection path, screen-space UI aids, representative corpus captures, and occlusion/
picking proof. Option A is lowest risk. Option C is medium-high recurring dual-path QA and continuity cost.

**Codex recommendation: Option B with the controlled orthographic fallback.** It most directly pursues the accepted
high-resolution physical-diorama target while keeping perspective subtle, stable, testable, and subordinate to the
exact board.

Does Adam accept Option B, prefer universal orthographic Option A, or want the mode-switching Option C? If B is
accepted without another camera objection, F10.6's camera/beauty/material/prop branch closes provisionally behind
its explicit future capture gates and the questionnaire proceeds to P10.7/F10.7 performance and graceful
degradation. Wave 10 remains **OPEN**; no build is authorized.

### 11.41 F10.6h ruling, sequence correction, and F10.7a expansion - gentle perspective provisional; attention without glow clutter

**Adam's ruling (2026-07-20):** choose Option B for now. The working release projection is one stable gentle
low-distortion perspective family, beginning from the existing roughly 20-degree FOV, 35-degree elevation, and
45-degree dimetric yaw. Governed focus changes camera target/distance rather than pumping FOV; true world scale and
exact cells remain authoritative. Orthographic remains the mandatory same-state evidence fallback. If gentle
perspective does not materially improve depth/composition without harming cell read, sprite citizenship, picking,
shadow truth, or the three accepted viewport gates, the implementation ruling returns to orthographic rather than
protecting the concept image. F10.6h and the current F10.6 branch close **provisionally behind capture proof**.

**Questionnaire sequence correction:** the closing sentence of section 11.40 mislabeled the next topic as
performance/degradation. In the preserved Wave 10 questionnaire, **P10.7/F10.7 owns interaction, promotion, secret
tells, attention, and accumulated history**. Performance/device/accessibility quality tiers belong to **P10.10**
and remain later in the original sequence. No question is skipped or renumbered by this correction.

#### F10.7a - how does the board call attention to something without making every useful object glow?

The existing feedback rulings answer what happens after an action commits: receipts drive truthful board motion,
state change, sound/caption, card refresh, and optional EngagementLens drama. This question is different. Before an
action, how does the player distinguish ambient scenery, something noticed, something currently relevant, the
selected target, and a place changed by history—without the renderer advertising secrets or covering the world in
icons and outlines?

- **Option A - explicit game-outline/icon language for every known interactive or historical noun:** clearest and
  easiest to scan, but a busy room becomes an icon field; “can interact” overwhelms visual hierarchy, physical
  evidence becomes cosmetic, and unknown secrets are difficult to distinguish from missing UI.
- **Option B - restrained knowledge-and-attention ladder (recommended):** physical state, material evidence,
  animation, motivated light, sound, composition, and object-card affordance do most of the work. Explicit outline,
  ring, label, or icon appears only for current selection/targeting, urgency, accessibility, or a player-invoked
  scan. Every cue is viewpoint-gated and tied to canonical knowledge.
- **Option C - narration and cards carry attention:** the board remains visually pure and the DM describes useful
  details. This is cheapest, but makes investigation and tactical interaction slow, gives poor direct-manipulation
  feedback, and turns a missing visual binding into recurring AI narration work.

Option B uses five states; these are projection states, not five new canonical object types:

| Attention state | Ordinary presentation | Explicit UI allowance |
|---|---|---|
| **Ambient / not singled out** | The noun appears only through its normal legal physical, sprite, marker, or reserve representation. No interactable shimmer merely because an action exists in the database. | None beyond ordinary accessible scene description. |
| **Noticed / known** | Show the evidence the viewpoint has actually earned: scratches, fresh blood, disturbed dust, a draft, ownership heraldry, a flickering mechanism, an open lid, a scorch, a dropped-object marker, or a concise spoken/sound cue when perceptible. | Inspectable cursor/focus semantics and accessible label may become available; no target glow required. |
| **Relevant / available now** | Context may strengthen an already known tell: a nearby lever receives a restrained material/idle-motion cue when the player is operating its machine; a reachable chest accepts focus; a known burning doorway clearly animates and sounds hazardous. | Player-invoked scan, keyboard/controller focus, or accessibility setting may add a stable non-color icon/edge/base cue. Availability cannot invent a hidden affordance. |
| **Active / selected / targeted** | Strong, brief, unmistakable focus treatment bound to the exact object, cell, path, area, or citizen; preserve the accepted blue/red/grey allegiance language and non-color shape/motion cues where relevant. | Outline/ring/label/area overlay/action preview is legal here and disappears or changes when focus changes. |
| **Changed / historical** | Prefer the current physical state and plausible residue: broken door, open/looted chest, extinguished brazier, blood, ash, scorch, moved cover, empty mount, cracked floor, abandoned marker, or another canonical trace. | A card/history affordance may expose the fuller known account; history is not represented by leaving the old target outline permanently on. |

Concrete examples:

- an ordinary chest sits physically on the board without pulsing. When focused, its base/edge and board card make
  selection explicit. After opening, the lid and contents knowledge change; after looting, the same chest remains
  visibly open/empty rather than reverting or wearing a permanent “completed” halo;
- a secret panel looks like ordinary wall until scratches, draft, map evidence, magic, or discovery is canonically
  available to this viewpoint. The cue points to evidence first; it does not outline the unrevealed door behind it;
- a punctured oil cask leaks a dark/glinting spill and changes sound/material behavior. Targeting it for ignition
  adds the strong active overlay; the spill itself, not a floating exclamation point, carries ordinary relevance;
- the dropped turtle communicator receives its precise object marker because its location and identity are known.
  A localized pulse/sound may be canonical when it rings; it does not blink forever merely because it has actions;
- a hostile fire field always carries readable animated shape/boundary and caption equivalents because it is an
  active known hazard. A hidden pressure plate does not acquire that language until detected or triggered.

Promotion may strengthen presentation only after canonical state or player context makes an existing affordance
relevant. The DM cannot cause the renderer to glow an object as a hint without creating a viewpoint-legal tell.
Conversely, lack of bespoke art cannot suppress a known interactable: the marker/card/fallback lane supplies a
truthful focus target and accessible label.

Every cue has a non-audio and non-color path. Persistent looping animation is budgeted and reduced-motion-safe;
sound respects distance, occlusion, and viewpoint. A “highlight all known interactables” accessibility/scan command
may temporarily expose the relevant/available set, but it cannot reveal secrets, unknown ownership, hidden hazards,
or actions the player has not earned enough information to formulate.

The procedural-layout papers support the separation of semantic facts from visual realization and the display of
legal candidates/evidence, but they do not prescribe highlight taste. Genesis therefore binds cues to explicit
knowledge/state constraints, then judges clutter and comprehension through representative captures and playtests.

**Implementation/maintenance cost:** Option B is **medium-high but reusable**: attention-state derivation,
viewpoint/knowledge gating, physical-tell bindings, selection/target overlays, scan/accessibility projection,
audio/caption equivalence, reduced motion, fallback coverage, and clutter tests. Option A is medium implementation
but high aesthetic debt. Option C is low renderer cost and high interaction/AI burden.

**Codex recommendation: Option B.** It lets the world itself carry clues and scars while reserving overt game UI
for the moment the player asks a concrete question of that world.

Does Adam accept Option B, prefer the always-explicit Option A, or want narration-first Option C? If B is accepted,
follow into F10.7b: which historical traces remain physically visible, which coalesce or age, and how the renderer
stays bounded without erasing world history. Wave 10 remains **OPEN**; no build is authorized.


<!-- END VERBATIM MIGRATION: original lines 18388-19055 -->
