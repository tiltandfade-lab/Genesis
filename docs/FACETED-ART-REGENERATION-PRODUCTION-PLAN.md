# Faceted Art Regeneration Production Plan

**Status:** EXECUTION PLAN — visual language approved; runtime admission remains a separate gate  
**Initial execution scope:** Fantasy items and props  
**Deferred:** Gloom, Chrome, other realms, broad runtime admission  
**Primary operator:** a lower-cost Codex/model runner following this document literally  
**Visual target:** mature, ornate, large-faceted polygonal fantasy art; never fake pixel art

## 1. Purpose

This document is a complete operating procedure for regenerating Genesis art into the approved
triangulated polygonal language. It is written so that a lower-cost model can execute production
without inventing art direction, changing table meaning, or confusing generated source images with
runtime-ready assets.

The approved direction is:

- preserve the mature, ornate, high-tier identity of each existing Fantasy concept;
- replace fake-pixel rendering with deliberate polygonal planes;
- prefer fewer, larger triangles over dense micro-triangulation;
- generate strict orthographic or strict profile source art for shallow extrusion candidates;
- split articulated objects at real mechanical seams and generate reusable components;
- let deterministic engine recipes own component placement, pivots, overlap, and state transforms;
- let real geometry own thickness, bevels, relief, side faces, silhouette breaks, and shadows;
- use faced-box, lathe, sweep, procedural, or authored model construction for volumetric props;
- keep technical compilation, visual QA, in-engine QA, and runtime admission separate.

This is a versioned migration. Existing assets remain fallbacks until replacements pass every gate.

## 2. Generation sheets, component sprites, and review sheets

These are different artifacts. A generation sheet may contain several isolated components to conserve
generation calls. It must be cropped into independent component sprites before construction. A review
sheet is assembled later from those cropped sprites and engine-built state proofs.

### 2.1 Generation sheet

A generation sheet is the image returned directly by the image-generation model. Locked density:

- up to **4 isolated components** for normal assets;
- up to **2 isolated components** for large or ornate assets;
- **1 isolated component** only for bosses, centerpieces, highly irregular silhouettes, or anything
  that genuinely needs the entire canvas for inspection;
- exactly one projection;
- generous clean separation and no overlap between components;
- no scenery, state composition, perspective relationship, or assembled mechanism;
- no labels, captions, decorative borders, or neighboring unrelated props.

Related parts should share a generation sheet when they remain large and legible. A normal switch base
and lever belong together. A large door frame and matching leaf may share a two-component sheet. This
saves generation calls and helps visual identity, but it does **not** authorize a preassembled switch
or door image.

The generated location of a component is disposable. After chroma removal, each isolated component is
cropped to its own alpha bounds and normalized as an independent sprite. Runtime placement never uses
sheet coordinates, relative pixel distance, or an image-generated hinge angle.

If the generator overlaps components, crosses their silhouettes, paints one part into another, or
makes separation ambiguous, reject the sheet before cleanup. Use fewer components on the retry.

### 2.2 Component sprite

A component sprite is one cropped, cleaned part from a generation sheet. It has its own source file,
alpha file, content bounds, world scale, mount, socket, pivot, and construction class. The component
sprite—not the generation sheet—is the compiler input.

### 2.3 Review sheet

A review sheet is assembled locally after generation, cleanup, and cropping. It never goes into the
extrusion compiler.

- **4 sprites per review sheet** for normal assets;
- **2 sprites per review sheet** for large or ornate assets;
- **1 sprite per review sheet** for bosses, single-piece centerpieces, anchors, or close inspection.

Components from one kit should share a review sheet whenever their class allows it. A switch base and
lever may occupy two cells of a normal sheet. A door frame and leaf may occupy a two-cell large/ornate
sheet. Shut, ajar, open, left, and right are engine-built state proofs on a separate assembly sheet;
they are not additional source sprites. One-per-sheet is reserved for an individual component whose
silhouette or inspection needs truly consume the canvas, not automatically for every part of a major
asset.

## 3. Approved visual language

### 3.1 Overall read

The image should look like a mature low-poly sculpture whose materials and identity were designed in
polygonal planes. It must not look like a photograph with a triangle filter, a cracked-glass overlay,
pixel art, a voxel model, or a glossy mobile-game toy.

Required qualities:

- adult, restrained fantasy design;
- strong silhouette and readable construction hierarchy;
- ornate identity where the source concept is ornate;
- broad polygon planes that follow form and material construction;
- believable wear, grit, patina, scratches, carving, and age;
- controlled palette with clear wood/metal/stone/cloth separation;
- detail concentrated at semantic landmarks rather than spread uniformly;
- readable at gameplay scale before close-up beauty is considered.

### 3.2 Facet scale law

Prefer the largest triangles that still describe the form truthfully.

- Major flat regions: very large polygons.
- Broad curves: a small sequence of large directional planes.
- Material transitions: triangles may become moderately smaller to preserve the boundary.
- Hinges, sockets, eyes, clasps, runes, blade edges, relief borders, damage, and facial landmarks:
  selectively smaller facets are allowed.
- Empty surface area must not be filled with arbitrary triangle noise.
- Adjacent triangles should usually differ subtly in value, hue, roughness implication, or direction;
  avoid high-contrast patchwork.
- Triangles must reinforce plank direction, forging, carving, cloth folds, anatomy, or fracture logic.

Reject when facets resemble:

- shattered glass;
- a dense triangular texture filter;
- reptile scales on unrelated materials;
- uniformly tessellated computer geometry;
- tiny confetti visible only at source resolution;
- random light/dark polygons unrelated to form.

### 3.3 Material language

- **Wood:** long construction-aligned planes, visible grain/wear as restrained albedo marks, darker
  seams, no glossy varnished toy finish.
- **Iron/steel:** larger hammered planes, dark oxide, controlled edge wear, limited cool highlights;
  no chrome mirror finish unless the table concept explicitly requires it.
- **Brass/gold:** antique and selective, warm planar response, never bright yellow plastic.
- **Stone:** broad chipped planes, sediment/fracture logic, sparse pits, matte response.
- **Cloth/leather:** large fold planes, worn edges, restrained stitching, no inflated softness.
- **Painted surfaces:** broad pigment regions and age marks; real runtime light owns directional light.
- **Emissive material:** only the licensed flame, bulb, crystal, rune, or aperture may emit.

### 3.4 Identity preservation

Do not simplify an ornate or strange source into generic starter equipment. Preserve:

- semantic slug and noun;
- realm identity;
- rarity/tier impression;
- signature silhouette;
- heraldry, motif, material family, and meaningful damage;
- state landmarks such as hinges, handles, sockets, latch locations, seams, and apertures;
- authored mount and footprint.

The replacement may improve clarity. It may not change what the table roll means.

## 4. Construction-class routing

Classify every candidate before generation. Record the classification and reason.

| Construction class | Use for | Source projection | Forbidden shortcut |
| --- | --- | --- | --- |
| `EXTRUDE` | shield, plaque, sign, tablet, relief, door leaf, grate, blade, key | strict front elevation or strict profile | perspective-painted extrusion |
| `LAYERED_EXTRUDE` | ornate door, control face, layered heraldry, altar face | strict front elevation with named depth regions | one thick contour slab |
| `FACED_BOX` | chest, crate, cabinet, sarcophagus, box container | coordinated orthographic face set or procedural panels | contour-extruded three-quarter painting |
| `LATHE` | urn, bottle, bowl, bell, barrel-like rotational form | strict profile or authored profile curve | front-card extrusion |
| `SWEEP` | rope, chain, pipe, branch, rail | path/profile data or strict profile reference | flat billboard volume |
| `MODEL_RECIPE` | furniture, brazier, shrine, tree, rubble, trap mechanism | reference art plus deterministic geometry recipe | forcing the whole PNG through extrusion |
| `DECAL` | stain, crack, tracks, painted floor mark | strict top or front projection | upright billboard |
| `FX` | fire, smoke, spell, mist | purpose-built layered effect | opaque prop extrusion |

If uncertain between `EXTRUDE` and a volumetric class, choose the volumetric class. A poor fallback is
preferable to double perspective.

### 4.1 Component-kit and deterministic assembly contract

An object with moving, swappable, repeating, or independently deep parts is an **assembly kit**. The
image model supplies isolated component art. The engine supplies the finished object and every state.

Split at a seam only when at least one of these is true:

- the part moves around a pivot or along a track;
- the part swaps between mechanical or damage states;
- the part repeats and benefits from reuse;
- the part needs a different construction class, depth, material, or mount;
- the part must survive cutaway or occlusion independently;
- image-generated relative placement would otherwise become a gameplay dependency.

Do not split screws, trim, paint, cracks, or fixed ornament merely because they are visually distinct.
Keep fixed decoration on the largest mechanically coherent component. The goal is useful reuse, not
maximum fragmentation.

Every kit must define before generation:

- component list and construction class per component;
- permanent mount component and parent/child hierarchy;
- named sockets and normalized local pivots;
- canonical neutral pose for every movable component;
- world scale, depth, allowed transforms, and state table;
- front/back material requirements;
- cutaway ownership and visibility rules.

The engine does not infer this assembly from pixels. It reads a versioned recipe. Image-generated sheet
positions, gaps, scale differences, and apparent joint locations are discarded after cropping.

Connection hardware that must align physically—hinge pins, axles, sockets, collars, rails, hooks, and
mounting stems—belongs to deterministic geometry whenever possible. Source art may contain flush hinge
straps, decorative collars, and joint wear, but assembly may not depend on separately generated painted
circles happening to line up.

#### Door kit

Minimum reusable components:

1. `door-frame-front`: empty jamb/arch/threshold face with a transparent aperture and no leaf;
2. `door-leaf-front`: isolated front face in a neutral shut-shaped elevation;
3. `door-leaf-back`: only when the authored reverse face materially differs;
4. `door-leaf-broken`: only when damage materially changes silhouette or construction.

The frame and front leaf should normally share one two-component large/ornate generation sheet. They
are cropped and normalized independently afterward. The runtime recipe owns wall placement, hinge
axis, hinge knuckles, leaf thickness, side shell, frame depth, and shut/ajar/open transforms. Those
three states reuse the same leaf sprite. A broken state may swap the leaf while retaining the frame and
hinge metadata. The aperture reveals the real room beyond—never image-generated darkness, hallway, or
perspective depth.

#### Wall switch/lever kit

Minimum reusable components:

1. `switch-base`: empty wall plate/body with no arm or precomposed state;
2. `switch-lever`: isolated arm-and-grip unit in one canonical neutral orientation;
3. optional indicator or damaged lever only when licensed by source evidence.

The base and lever should share one normal generation sheet, with room for up to two additional simple
components if the tranche calls for them. The runtime recipe owns wall mounting, pivot axle, collar
depth, arm offset, rotation limits, and state angles. `left` and `right` are deterministic rotations of
the same lever sprite. The pivot is metadata, never a guide dot or crosshair painted into the art.

A recipe is ordinary authored data, not AI inference. Minimum shape:

```json
{
  "id": "fantasy-wall-switch-01",
  "mount": "wall",
  "components": [
    {
      "id": "base",
      "asset": "fantasy-wall-switch-01-base-v001.glb",
      "parent": null,
      "socket": "wall-center",
      "localPosition": [0, 0, 0]
    },
    {
      "id": "lever",
      "asset": "fantasy-wall-switch-01-lever-v001.glb",
      "parent": "base",
      "socket": "lever-axle",
      "pivotNormalized": [0.5, 0.12],
      "localPosition": [0, 0, 0.04],
      "rotationAxis": "local-z",
      "rotationRangeDeg": [-35, 35]
    }
  ],
  "states": {
    "left": { "lever.rotationDeg": 35 },
    "right": { "lever.rotationDeg": -35 }
  },
  "runtimeAdmitted": false
}
```

The door recipe uses the same structure: frame as the permanent wall child, leaf parented to a named
hinge socket, local-y rotation for shut/ajar/open, and an optional broken-leaf asset swap. The current
Fantasy pilot already proves this assembly pattern with child groups and deterministic rotations in
`src/ui/theater-boot.js`; the production step replaces its temporary procedural faces with compiled
component meshes while preserving the explicit hierarchy and zero runtime admission.

Other useful kits follow the same rule:

- chest/container: faced-box body, lid, and state-specific contents only when visible;
- floor trap: floor frame/cover plus independently mounted mechanism or hazard;
- practical light: wall/floor mount plus physical lamp body and separately controlled FX;
- hanging sign: wall bracket plus signboard, with runtime hinge or chain placement;
- shrine/control: permanent backing plus swappable relief, insert, dial, or indicator.

## 5. Projection contracts

### 5.1 Front elevation

Use for broad-faced shallow objects. Required:

- camera exactly perpendicular to the principal face;
- no visible top, side, underside, or back;
- no foreshortening or converging parallel lines;
- no painted thickness or side planes;
- no cast shadow, contact shadow, floor plane, or environment;
- each component centered within its declared sheet cell, fully visible, with generous padding.

### 5.2 Strict profile

Use when the silhouette/profile is the construction input: blades, keys, lathe profiles, certain
mechanical arms, trim profiles. Required:

- camera exactly perpendicular to the profile plane;
- no three-quarter rotation;
- no second side visible;
- no perspective taper unrelated to the authored silhouette.

### 5.3 Orthographic face set

Use only for `FACED_BOX` or another explicitly multi-faced object. Generate each face as a separate
source unless a validated tool guarantees identical scale and material identity. Required faces must
be named before generation: `front`, `back`, `left`, `right`, `top`, `bottom` as needed.

### 5.4 Creature, NPC, child, animal, and PC standee projection

Living figures are not shallow-extruded props. Their final runtime citizen is a lit standee with a
thin side shell and plinth, so their source may use a **controlled orthographic front-three-quarter
figurine pose**. This is the only standard source class allowed to show more than a strict front or
profile projection.

Required for every figure:

- orthographic or extremely long-lens visual construction with no visible lens distortion;
- full body, fully visible extremities, generous padding, and one shared ground line;
- consistent head height and scale convention within the identity/family;
- no scenery, floor plane, cast shadow, contact shadow, smoke, or unrelated props;
- neutral-ready or personality-ready pose that remains usable as a game standee;
- equipment, anatomy, injuries, size, age, and role preserved exactly from source evidence;
- readable silhouette at gameplay scale;
- large construction-aligned facets, with smaller facets only for face, joints, claws, equipment
  junctions, wounds, or other critical landmarks;
- no painted plinth: the runtime builds the physical base.

One generation contains one identity. A controlled `1x4` identity strip is allowed only when the
assigned tranche explicitly requests multiple views or mechanical states and all cells preserve
anatomy, equipment, scale, and ground line. Otherwise generate one accepted ready pose first.

## 6. Figure regeneration specifications

### 6.1 Shared figure art direction

Genesis fantasy is adult, dangerous, tactile, and grounded in frightening Dungeons & Dragons fantasy.
It is not theme-park fantasy, superhero fantasy, or stylized MMO loot advertising.

Required:

- believable weight, anatomy, balance, and material wear;
- mature proportions appropriate to species and age;
- restrained palette shaped by realm and creature ecology;
- broad, deliberate polygon planes that clarify anatomy, cloth, armor, hide, scales, bone, or fur;
- readable expression and intent without pantomime;
- equipment sized for use rather than promotional exaggeration;
- menace, beauty, vulnerability, dignity, or strangeness preserved when licensed by the source.

Explicitly reject:

- World of Warcraft-like oversized shoulder armor, weapons, hands, boots, heads, teeth, or eyebrows;
- candy saturation, glowing outlines, glossy plastic armor, inflated muscles, or rubber anatomy;
- chibi, mascot, collectible-toy, mobile-game, or Saturday-morning-cartoon treatment;
- universal heroic power stance;
- clean cosplay surfaces or decorative damage unrelated to the creature's history;
- dense micro-triangulation that makes skin, cloth, and armor share one noisy texture;
- sanitized monsters that lose the horror, cruelty, disease, death, predation, or unnatural wrongness
  named by their canonical concept.

Horror must come from truthful design—anatomy, posture, gaze, asymmetry, material condition, negative
space, scale, and implication—not indiscriminate gore. When the source is horrific, the regenerated
creature must remain genuinely horrific.

### 6.2 Monsters

Every monster needs one personality-bearing, mechanically usable pose. A neutral mannequin pose is
insufficient unless emotional blankness is itself the monster's defining horror.

Before prompting, extract:

- creature type, size, movement mode, and anatomy;
- combat behavior and signature action;
- intelligence and temperament;
- habitat/realm and material condition;
- one defining silhouette feature;
- one personality verb: `stalks`, `guards`, `hunts`, `schemes`, `hungers`, `mourns`, `commands`,
  `endures`, `frenzies`, `waits`, or another source-backed verb;
- exact equipment and injuries;
- horror mechanism: predation, corruption, undeath, body wrongness, scale, disease, mimicry,
  intelligence, ritual, or environmental adaptation.

Pose rules:

- express the personality verb through center of gravity, spine, shoulders, head angle, hands/claws,
  wings, tail, gaze, and occupied negative space;
- keep both major silhouette and ground support unambiguous;
- prefer tension before action over a frozen mid-attack that crops or tangles anatomy;
- signature weapons and limbs must remain separable from the torso at gameplay scale;
- flyers may spread or partially mantle wings but must preserve a clear standee footprint/anchor;
- quadrupeds must show believable load-bearing anatomy;
- serpentine and amorphous creatures need a declared ground/support region;
- swarms require an explicit group silhouette and may not be mistaken for detached debris.

Monster expression examples:

- a cunning goblin leans forward with guarded eyes and a knife kept close, not a broad comic grin;
- an orc commander occupies space with scarred, economical authority, not inflated MMO musculature;
- an undead knight is unnaturally still and purposeful, not a Halloween skeleton mascot;
- a dragon expresses age, territorial intelligence, and predatory attention through neck and gaze,
  not a cheerful roaring poster pose;
- an aberration may be difficult to parse anatomically, but its silhouette and support must remain
  intentional rather than noisy.

Monster projection and base-fit rule:

- Prefer front view or only slightly angled front-three-quarter for most monsters.
- Compose long limbs, weapons, tails, and wings upward, inward, or around the body so the figure can read
  on a normal 1x1 base whenever its size class allows it.
- Use long side-view silhouettes only when the creature's authored anatomy truly requires it; otherwise
  treat dramatic side-view beasts as reference/salvage rather than ideal standee sources.
- Goblin-family and similar furtive small humanoids should usually be lanky, wiry, long-limbed,
  narrow-shouldered, and knife-thin unless the source explicitly says squat or heavy.
- Monster personality is mandatory. The pose, gaze, spine, claws, wings, mouth, hands, negative space,
  and held objects should express the monster's actual character: scary, menacing, charming,
  confusing, pathetic, predatory, regal, diseased, alien, or otherwise source-backed.
- Keep monsters as vertically oriented as is reasonable for base function, but do not distort their true
  shape. Round, broad, amorphous, serpentine, hovering, or many-limbed monsters may remain round or
  broad when that is their canonical silhouette.

Monster review density:

- ordinary Medium or smaller monsters: 4 per review sheet;
- Large, ornate, or anatomy-complex monsters: 2 per review sheet;
- bosses, legendary creatures, dragons, and centerpieces: 1 per review sheet.

### 6.3 Adult NPCs

NPCs are people with social roles, not generic adventurer mannequins.

Preserve:

- age band, ancestry/species, body type, occupation, status, faction, and environment;
- ordinary tools, clothing layers, armor, religious/civic marks, and wear appropriate to the role;
- attitude and current pressure when source-backed;
- practical proportions and a believable center of gravity.

Pose rules:

- use restrained social body language: guarded, welcoming, exhausted, officious, grieving, watchful,
  suspicious, proud, or hurried;
- do not give every NPC a weapon-forward combat pose;
- do not beautify poverty, erase disability/scarring, or turn tradespeople into pristine heroes;
- avoid exaggerated class cosplay and oversized fantasy accessories.

Ordinary NPCs may use 2 per generation/review sheet when both figures remain large enough to judge
body language, face, hands, clothing layers, and triangulation. Use 4 only for simple background NPCs
after the style is stable. Visually dominant, ornate, faction-leading, or Large NPCs use 2; major named
anchors use 1.

Body-shape rule:

- Fat, stout, heavy, and round-bodied NPCs are welcome when source-backed or role-appropriate.
- Favor those shapes for urban and social roles such as innkeepers, cooks, merchants, guild officials,
  magistrates, moneylenders, brewers, comfortable clergy, nobles, and civic fixers.
- Do not let urban/social body variety leak into monsters whose desired read is lanky, predatory,
  diseased, furtive, or starved.
- Body type is identity, not comedy; avoid caricature, mascot styling, and chibi compression.

Ancestry and racial diversity rule:

- Fantasy NPC production must include realm-accurate diversity across human skin tones, facial
  structures, hair textures, ages, body types, disabilities/scars, social classes, and classic fantasy
  ancestries.
- Do not let the default Fantasy town population become mostly pale humans. Humans may be light,
  brown, dark, olive, freckled, weathered, mixed, and regionally varied.
- Distribute dwarves, elves, halflings, gnomes, dragonborn, tieflings, orcs/half-orcs, goliaths, and
  other classic ancestries through ordinary civic, trade, religious, rural, criminal, military, and
  domestic roles according to source evidence and setting tone.
- Avoid tokenism: nonhuman or nonwhite NPCs should appear as brewers, magistrates, midwives,
  merchants, guards, farmers, scribes, innkeepers, artisans, nobles, servants, children, and elders,
  not only as outsiders, mystics, villains, or spectacle roles.
- Preserve role practicality and mature grounded design for every ancestry.

### 6.4 Children

Children must read as real children of the declared age band, never miniature adults and never chibi.

Required metadata:

- approximate age band: early child, middle child, preteen, or adolescent;
- species/ancestry and true height;
- role, family/community context, clothing, carried object, and emotional state if authored;
- ground/contact anchor and intended world height.

Required treatment:

- age-appropriate head/body/limb proportions and posture;
- age-appropriate clothing, equipment, gestures, and facial structure;
- nonsexual presentation without adult glamour posing, cosmetics, anatomy emphasis, or revealing
  costume design;
- emotional truth without turning fear, poverty, injury, or danger into cuteness;
- ordinary imperfection and practical fantasy clothing rather than mascot styling.

If a child is endangered or frightened, depict readable emotion and defensive/hesitant posture without
graphic exploitation. If a child is brave, preserve youth and uncertainty rather than converting the
figure into a tiny adult action hero.

Children normally use 4 per review sheet; a named story anchor may use 2 or 1 when close inspection is
required.

### 6.5 Animals and natural beasts

Animals must preserve real species anatomy, locomotion, weight distribution, and behavior unless the
canonical creature explicitly alters them.

Required:

- correct number and placement of limbs, joints, digits, eyes, ears, horns, wings, and tail;
- believable stance for the species and movement mode;
- species-specific alertness, fear, aggression, curiosity, patience, or domestication;
- correct true scale relative to humanoids;
- fur, feather, scale, shell, and hide facets aligned with major body masses rather than rendered as
  dense triangular noise.

Do not anthropomorphize facial expression, posture, clothing, or gesture unless the source explicitly
describes an awakened, magical, or humanoid animal. Do not turn dangerous animals into pets or mascots.

Ordinary animals use 4 per review sheet; Large/ornate beasts use 2; legendary or centerpiece beasts
use 1.

### 6.6 Player characters

PC art must preserve player-authored identity more strictly than generic NPC art.

Lock before generation:

- species/ancestry, age, body type, skin/fur/scale traits, face and hair;
- class/subclass cues without costume exaggeration;
- exact equipped armor, weapons, focus, shield, and signature carried items;
- injuries, conditions, prosthetics, scars, and persistent visual changes;
- true scale and ground anchor;
- one signature silhouette idea and one restrained personality cue.

Default pose is neutral-ready: capable of entering exploration or combat, expressive enough to show
identity, but not frozen in a spectacular attack. Equipment must remain readable and mechanically
correct. Avoid universal grimacing, fashion-model posing, superhero anatomy, and oversized class icons.

PC review density:

- normal party lineup: 4 per review sheet for heads-line-up scale comparison;
- ornate/large PCs or alternate mechanical states: 2 per review sheet;
- the active PC identity anchor and final acceptance close-up: 1 per review sheet.

### 6.7 Figure aspect and triangulation calibration

The earlier 4:6 figure-cell convention is a minimum layout convenience, not a universal silhouette
target. Use **4:8 source/review framing** when the authored figure is tall, lanky, robed, long-limbed,
upright-serpentine, wing-folded, or otherwise needs vertical room. Most non-halfling adult humanoids
and many monsters should read taller than the legacy pixel corpus unless the source says short, round,
stooped, squat, or compact. Keep 4:6 for children, halflings, crouched animals, broad beasts, squat
constructs, and intentionally compact bodies.

The best current triangulation target is the two-NPC sheet with the elderly midwife and halfling
innkeeper: broad readable planes, visible polygonal construction, and no fake pixel texture. The
goblin-family sheet is a useful candidate but shows slight drift toward triangulation that is too
regular and too fine in places. Future prompts should explicitly ask for irregular large planes,
avoid uniform tessellation, and reserve small facets for eyes, hands, joints, teeth, weapons, damage,
and critical equipment.

Two-up figure sheets must leave a wide, clean chroma gutter between figures and generous outer margins
around every extremity, weapon, tail, wing, garment edge, and carried object. If the figures nearly
touch, crowd the canvas edge, or make automated slicing ambiguous, flag the sheet for audit even when
the art is otherwise beautiful.

Cast variety rule: do not let the regenerated NPC population all share the same distant off-camera
gaze. Across a production wave, deliberately vary gaze direction, head tilt, expression, emotional
temperature, hand use, stance, and social energy while preserving standee readability. Use direct
address, downward concentration, sideways suspicion, inward grief, practical focus on a tool, guarded
watchfulness, tired patience, open welcome, official severity, and hurried distraction as role-backed
variants. Avoid a monotonous lineup of everyone looking longingly past the camera.

Unrelated-object and crop rule: a figure sprite may include only carried or worn objects that belong
to that character's readable silhouette and can be cleanly cropped with them. Do not include partial
set dressing, wagon wheels, furniture, background props, animal companions, cropped tools, or
environment fragments. A cropped or ambiguous neighboring object makes the figure unusable as a
replacement source even when the figure itself is beautiful.

### 6.8 Figure master prompt

Use this template for monsters, NPCs, children, animals, and PCs. Replace only bracketed fields.

```text
Use case: stylized-concept
Asset type: Genesis [FIGURE CLASS] standee source art

Primary request: Create exactly one full-body [IDENTITY]. Canonical facts: [SIZE, TYPE/SPECIES,
AGE BAND, ANATOMY, ROLE, EQUIPMENT, CONDITION]. Personality/behavior verb: [VERB]. Signature
silhouette feature: [FEATURE]. Preserve these exact identity landmarks: [LANDMARKS].

Visual language: mature, restrained, frightening where canonically appropriate, large-faceted
polygonal Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned triangular
planes. Use smaller facets only around face, eyes, joints, claws, wounds, armor junctions, and critical
equipment landmarks. Believable weight, wear, materials, and adult visual seriousness. This is not
World of Warcraft, an MMO promotional render, a mobile game, a collectible toy, or a cartoon mascot.

Pose/expression: a controlled orthographic front-three-quarter figurine pose expressing [VERB] through
center of gravity, spine, head angle, gaze, limbs, and negative space. Use tension and personality,
not pantomime. Keep the pose mechanically usable as a standee. [CATEGORY-SPECIFIC POSE REQUIREMENTS].

Projection/framing: orthographic front-three-quarter, no lens distortion, full body and every extremity
visible, shared ground line, generous padding, no crop. For monsters that must fit a 1x1 base, prefer
front view or only slightly angled front-three-quarter and keep the silhouette compact around the
support region. Use 4:8 framing when the authored figure is tall or lanky. No scenery, floor plane,
cast shadow, contact shadow, atmosphere, spell effect, unrelated prop, text, border, label, or
watermark.

Geometry ownership: the source owns identity, silhouette, polygonal material/albedo regions, wear,
expression, and pose. Runtime geometry owns the plinth, thin side shell, contact shadow, scene light,
and directional highlights. Do not paint a base or shadow into the source.

Backdrop: perfectly flat solid [CHROMA COLOR] chroma-key background, completely uniform with no
gradient, texture, reflection, floor, horizon, or lighting variation. Do not use [CHROMA COLOR] in the
figure. Crisp separated edges.

Avoid: fake pixel art, voxel art, micro-triangulation, cracked-glass pattern, random polygon noise,
chibi proportions, cute mascot treatment, rubber anatomy, inflated muscles, oversized shoulders,
oversized hands/boots/weapons/teeth, candy saturation, glossy plastic, friendly monster grin, generic
hero pose, theme-park fantasy, sanitized horror, cosplay cleanliness, baked rim light, and poster scene.
```

Category insertion requirements:

- **Monster:** include combat behavior, horror mechanism, support region, signature anatomy, and a
  personality-bearing ready pose.
- **NPC:** include social attitude, occupation, status/faction, practical carried objects, and a
  restrained noncombat pose unless combat is canonical.
- **Child:** include age band and true height; require age-appropriate nonsexual anatomy, clothing,
  gesture, and emotion; forbid miniature-adult or chibi treatment.
- **Animal:** include species locomotion, anatomy, support, behavior, and true scale; forbid
  anthropomorphism unless canonical.
- **PC:** include player-locked identity, exact loadout, persistent conditions, class cues, signature
  silhouette, and neutral-ready pose.

### 6.9 Figure technical and integrated QA

Before a figure can receive `in-game-pass`, verify:

- alpha bounds and RGB dilation are clean;
- feet/support touch the shared ground line;
- `footX`, `footY`, intended world height, width, base radius, and true scale are recorded;
- no detached debris unless explicitly declared as a swarm/group;
- medium humanoid height reads at the approved gameplay-frame percentage;
- anatomy/equipment survives bright and dark lighting;
- standee side shell and plinth remain world-up and stable across camera yaw;
- no square alpha shadow, fringe, double-sRGB, sorting break, floating, or sinking;
- pose remains readable when crowded and does not overlap primary neighbors excessively;
- monsters remain expressive and frightening at gameplay scale rather than only in close-up;
- children retain age-appropriate proportions at gameplay scale rather than collapsing into chibi;
- animals remain identifiable by anatomy and locomotion;
- PCs remain immediately distinguishable from NPCs and other party members without relying only on
  base color.

## 7. Master prop generation prompt

The runner must copy this prompt and replace only bracketed fields. Do not shorten it.

```text
Use case: stylized-concept
Asset type: Genesis [REALM] component generation sheet

Primary request: Create exactly [COMPONENT COUNT] isolated component sprites for [KIT OR ASSET NAME].
Component manifest: [ORDERED COMPONENT NAMES, ROLES, CONSTRUCTION CLASSES, PROJECTIONS, AND CANONICAL
POSES]. Preserve this semantic identity: [SOURCE DESCRIPTION]. Preserve these kit landmarks and
mechanical seams: [LANDMARKS AND SEAMS]. Preserve these materials and motifs: [MATERIALS AND MOTIFS].
Do not assemble, overlap, attach, or pre-position the components relative to one another.

Visual language: mature, restrained, high-tier polygonal fantasy art. Construct the visible design
with fewer, larger, deliberate triangular planes. Large facets must follow silhouette, construction,
material boundaries, carving, folds, forging, anatomy, or fracture logic. Use smaller facets only at
important transitions such as hinges, sockets, clasps, relief borders, damage, or other semantic
landmarks. The result must read as sculpted low-poly form, not a triangle filter or cracked glass.
Preserve ornate identity and believable wear. Avoid cute, toy-like, glossy, generic starter-tier art.

Projection: use the exact projection declared for each component in the manifest. Every camera is
perpendicular to its construction plane. No visible top, side, underside, back, foreshortening,
perspective convergence, three-quarter view, isometric view, or painted thickness.

Geometry ownership: source art owns silhouette, broad albedo regions, polygonal material facets,
paint, carving marks, wear, and damage marks. Real runtime geometry will own thickness, bevels,
side faces, true relief, shadows, and directional lighting. Do not paint those into the source.

Backdrop: perfectly flat solid [CHROMA COLOR] chroma-key background for removal. The background must
be one uniform color with no gradient, texture, floor, horizon, reflection, contact shadow, or light
variation. Do not use [CHROMA COLOR] anywhere in the asset. Keep generous clean padding.

Composition: [2X2 GRID FOR UP TO FOUR NORMAL COMPONENTS / 2X1 GRID FOR UP TO TWO LARGE OR ORNATE
COMPONENTS / SINGLE FULL-CANVAS COMPONENT]. Exactly one isolated component per occupied cell, centered
within that cell, fully visible, with a crisp silhouette and generous empty chroma separation. Do not
let any silhouettes touch or cross cell boundaries. Cell position is only for later cropping and must
not imply runtime position, scale, overlap, pivot, hinge angle, or assembly. No labels, captions,
decorative border, neighboring unrelated objects, floating debris, scenery, hands, characters, text,
or watermark.

Avoid: pixel art, fake pixels, voxel art, micro-triangulation, dense tessellation, cracked-glass
pattern, random polygon noise, poster illustration, baked directional light, rim light, cast shadow,
perspective painting, scene dressing, or generic mobile-game loot.
```

### 7.1 Chroma selection

- Default: `#00ff00`.
- Use `#ff00ff` only when green is materially important to the asset.
- Do not use blue as the key for blue gems, steel, water, or magical artifacts.
- The key must be flat and uniform at every border.

## 8. State-family and component-kit procedure

State families must be designed as coordinated assemblies, never as unrelated precomposed images.

1. Read every existing state and source reference before generating the first member.
2. Define component list, hierarchy, sockets, pivots, canonical poses, and runtime state table.
3. Decide which named states are transforms of accepted parts and which truly require a changed part.
4. Pack related components onto a generation sheet using the locked 4/2/1 density.
5. Crop and normalize each component independently; discard generation-sheet coordinates.
6. Assemble every state locally from the declared recipe.
7. Compare source components on review sheets and engine-built states on a separate state-proof sheet.
8. Reject the kit if sockets, pivots, scale, motif, material identity, or transform ranges drift.

Do not generate a new sprite merely because a state name exists. Generate a state-specific component
only when its silhouette, face art, damage, material, or visible contents actually change. Translation,
rotation, hinge motion, concealment, and ordinary open/closed poses belong to the engine.

Required first Fantasy families:

- door kit: empty frame plus front leaf on one two-component sheet; optional back or broken leaf only
  when materially required; shut, ajar, and open are engine transforms;
- switch kit: empty base plus one neutral lever on one normal sheet; left and right are engine rotations;
- chest kit: faced-box body plus lid and visible contents as needed; closed/open are hinge transforms;
- container kit: faced-box body plus only materially different cracked/broken panels;
- trap kit: floor mount/cover plus mechanism or hazard; hidden/sprung are transforms or component swaps
  according to the authored table state.

## 9. Per-sheet and per-component production sequence

The runner must execute these steps in order.

### Step A — provenance

Create a candidate record with:

```json
{
  "slug": "...",
  "semanticName": "...",
  "realm": "fantasy",
  "sourceTableRefs": ["..."],
  "walkRefs": ["..."],
  "legacyAssets": ["..."],
  "assemblyKit": "... or null",
  "componentRole": "permanent-mount|movable|swappable|repeating|standalone",
  "parentComponent": "... or null",
  "parentSocket": "... or null",
  "localPivotNormalized": [0.0, 0.0],
  "canonicalPose": "...",
  "allowedRuntimeTransforms": ["..."],
  "derivedStates": ["..."],
  "stateSpecificComponentFor": ["..."],
  "mount": "wall|floor|ceiling|tabletop|portable",
  "constructionClass": "...",
  "classificationReason": "...",
  "runtimeAdmitted": false
}
```

No source reference means no generation.

### Step B — source audit

Inspect the legacy source only for semantic identity, palette, ornament, state, and material evidence.
Do not assume its perspective is valid construction input.

### Step C — prompt compilation

Fill the master prompt. Include an ordered cell manifest, explicit landmark/seam list, component role,
projection, and canonical pose for every occupied cell. Do not ask the image model to decide the
construction class, runtime placement, pivot, or state composition.

### Step D — generation

Generate one bounded 4/2/1 component sheet. Save the raw output non-destructively. Record image model,
prompt version, ordered cell manifest, reference inputs, date, and raw hash.

### Step E — immediate source rejection gate

Reject before cleanup if any condition is true:

- component count differs from the declared cell manifest;
- silhouettes overlap, touch, cross cell boundaries, or cannot be cropped independently;
- any component is attached to or pre-positioned against another component;
- perspective, three-quarter, isometric, or visible thickness;
- crop or silhouette ambiguity;
- background gradient, shadow, floor, debris, or contamination;
- wrong noun/state/material/motif;
- genericized identity;
- dense micro-triangulation or cracked-glass read;
- obvious baked directional lighting;
- insufficient separation from chroma.

### Step F — chroma removal

Use the approved local chroma-removal helper with auto-border sampling, soft matte, and despill. Then:

- validate an alpha channel exists;
- confirm all four corners are transparent;
- confirm no key-color fringe;
- split the sheet by declared cells, then crop each component independently;
- confirm meaningful detached islands within a component were not deleted;
- reject islands that cross cells or create ambiguous component ownership;
- dilate RGB beneath transparent edge pixels before mip generation.

### Step G — crop and normalize

- crop every component to its own alpha bounds plus consistent family padding;
- discard sheet position and inter-cell pixel distance;
- preserve identical canvas convention within an assembly kit;
- store independent content bounds, world scale, socket, and pivot metadata;
- never stretch non-uniformly;
- optional external upscaling may increase pixel resolution but may not alter silhouette, projection,
  facet scale, landmarks, or material identity.

### Step H — review-sheet assembly

Assemble locally according to the locked 4/2/1 policy. Every cell must show:

- kit slug, component name, and role;
- projection;
- construction class;
- source dimensions;
- generation attempt number;
- technical status;
- visual status;
- `runtimeAdmitted: false` unless separately promoted.

Review sheets use a neutral background and consistent cell scale. Never feed them to the compiler.
State-proof sheets are separate engine-built artifacts and must list the exact component versions,
sockets, pivots, depths, and transforms used for each pose.

### Step I — construction

Compile or build according to the routed construction class. The mesh must supply real thickness,
controlled bevel, recessed backing, thin visible rim, material-specific side shell, and selective real
relief where semantically useful. Do not create a thick slab merely because extrusion is available.
Build multi-part props from independent component meshes and a versioned assembly recipe. Do not
flatten the assembled mechanism back into one precomposed sprite.

### Step J — technical QA

Technical status may become `COMPILED` only after:

- output reloads successfully;
- finite transforms and bounds;
- expected topology and winding;
- no unexplained disconnected geometry;
- face/material budgets recorded;
- mount, pivot, hinge, socket, footprint, and scale metadata present;
- every assembly parent, socket, component version, and state transform resolves deterministically;
- hashes and provenance recorded.

`COMPILED` does not mean visually accepted.

### Step K — isolated visual QA

Render front, three-quarter, and grazing views under neutral bright and dark rigs. Inspect:

- silhouette retention;
- large-facet read;
- controlled bevel/rim;
- side material plausibility;
- no paper card, foam slab, or icon-pushed-into-3D read;
- no double perspective;
- correct state landmarks and mount.
- component seams remain clean through the full allowed transform range.

### Step L — integrated in-engine QA

Stage assets in a deterministic Walk/table-backed room using production shell, camera, cutaway,
materials, and practical lights. Required checks:

- wall props are flush to real wall mount planes;
- floor props lie on the floor and use correct orientation;
- doors bind to apertures and hinges;
- door leaves rotate about deterministic hinges inside permanent frames;
- switch arms rotate about deterministic pivots inside permanent bases;
- state pairs visibly share identity because they reuse accepted components;
- wall volumes retain caps/stems during cutaway;
- practical emitter sits on physical fixture geometry;
- no floating glow disc;
- no floating, clipping, sinking, or camera-facing wall props;
- the room reads as a physical diorama, not an icon gallery.

### Step M — admission

Runtime admission remains false until a reviewed integrated capture earns `in-game-pass`. File
presence, successful generation, successful cleanup, GLB compilation, or isolated beauty cannot admit
an asset.

## 10. Review rubric

Score every candidate `PASS`, `REVISE`, or `REJECT` on each axis:

1. Semantic fidelity
2. Projection correctness
3. Silhouette readability
4. Large-facet quality
5. Material separation
6. Mature/ornate identity
7. State-family consistency
8. Component reuse and deterministic assembly
9. Chroma/alpha cleanliness
10. Construction-class correctness
11. Mount/contact correctness
12. Gameplay-scale readability
13. Integrated diorama citizenship

One `REJECT` axis blocks admission. A `REVISE` axis requires a new versioned attempt.

## 11. Lower-model execution guardrails

The lower-cost runner must not exercise aesthetic discretion outside this plan.

It may:

- fill bracketed prompt fields from source evidence;
- route using the construction table;
- run deterministic cleanup/build scripts;
- assemble review sheets;
- crop generation sheets into independent component sprites;
- build declared assembly recipes and state-proof sheets;
- apply objective rejection gates;
- report uncertainty and stop.

It may not:

- broaden beyond the assigned tranche;
- regenerate Gloom or Chrome during the Fantasy tranche;
- invent nouns, motifs, lore, states, components, or mounts;
- shorten the master style/projection constraints;
- exceed the locked 4/2/1 generation-sheet density;
- admit assets;
- interpret compilation as visual success;
- force perspective art through contour extrusion;
- ask image generation to preassemble moving parts or choose state placement;
- replace an ornate identity with a simpler generic object;
- approve its own output when an independent review is required.

When uncertain, the runner records `BLOCKED_CLASSIFICATION` or `NEEDS_ART_REVIEW` and moves to the next
non-dependent candidate. It never guesses.

## 12. Tranche structure

Do not begin a broad wave. Execute in small reviewable tranches.

### Tranche F1 — flat wall/floor pilot

1. ornate wall shield/relief;
2. painted dragon tablet/portrait;
3. wall switch kit: empty base plus neutral lever on one sheet; left/right proved by engine rotation;
4. floor trap kit: separated floor mount/cover and mechanism as licensed; hidden/sprung proved by the
   assembly recipe;
5. one normal plaque, grate, or sign.

### Tranche F2 — articulated threshold pilot

1. major ornate empty frame plus matching isolated leaf front on one two-component sheet;
2. matching leaf back only if materially distinct;
3. broken leaf component only if materially required;
4. aperture/jamb/hinge assembly recipe;
5. engine-built shut, ajar, open, and broken state captures.

The frame and leaf use the two-sprite large/ornate policy. One-per-sheet is used only if a component
fails readability at that density.

### Tranche F3 — volumetric contrast pilot

1. one faced-box container family;
2. one chest family;
3. one lathed vessel;
4. one procedural practical fixture;
5. one rejected negative control proving routing works.

Expand only after integrated captures are reviewed.

### 12.1 Legacy queue warning

Any existing queue entry that requests a complete `door-shut`, `door-ajar`, `door-open`,
`lever-left`, or `lever-right` image predates this component-kit contract and must not be executed for
the new faceted tranche. Source/table references from those entries remain useful provenance, but the
prompts must be recompiled into frame/leaf and base/lever component sheets first.

## 13. Naming and versioning

Never overwrite legacy art.

Recommended paths:

```text
assets/props-v4/fantasy/<kit>/<kit>-generation-sheet-v001.png
assets/props-v4/fantasy/<kit>/<kit>-<component>-source-v001.png
assets/props-v4/fantasy/<kit>/<kit>-<component>-alpha-v001.png
assets/props-v4/fantasy/<kit>/<kit>-<component>-v001.glb
assets/props-v4/fantasy/<kit>/<kit>-assembly-v001.json
dev/model-foundry/review-sheets/fantasy/<tranche>-sheet-01.png
dev/model-foundry/review-sheets/fantasy/<tranche>-state-proof-01.png
dev/model-foundry/reports/fantasy/<tranche>-report.json
```

Rejected candidates remain versioned evidence with rejection reasons. They are never silently deleted
or substituted.

## 14. Required report separation

Every tranche report must expose these counts independently:

```json
{
  "generationSheetAttempts": 0,
  "generatedComponentCount": 0,
  "sourceTechnicalPass": 0,
  "compiledCount": 0,
  "isolatedVisualPass": 0,
  "integratedInGamePass": 0,
  "runtimeAdmittedCount": 0,
  "rejectedCount": 0,
  "rejectionReasons": {}
}
```

Never describe `generationSheetAttempts`, `generatedComponentCount`, or `compiledCount` as completed
art.

## 15. Operator launch prompt

Give the lower-cost runner this exact instruction, followed by a bounded candidate list:

```text
Read dev/model-foundry/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md completely before acting.
Execute only the assigned Fantasy tranche and candidate list. Do not generate Gloom, Chrome, or any
unlisted asset. Do not admit runtime assets. Preserve every source/table/Walk reference. Classify each
candidate before generation. Use the master prompt without shortening its visual, projection, geometry
ownership, component-isolation, or avoid clauses. Pack related independent components into each
generation sheet using the locked 4/2/1 density. Crop every component into its own sprite and discard
sheet coordinates. Never ask image generation to place moving parts or render a state that can be made
by a deterministic transform. Assemble source review sheets and separate engine-built state proofs.
Prefer fewer, larger, construction-aligned facets; reject micro-triangulation and cracked-glass
texture. Stop and report typed uncertainty instead of guessing. Return generation sheets, cropped
component sprites, review sheets, assembly recipes, state proofs, machine-readable report, prompts,
hashes, and rejection reasons.
```

## 16. Final acceptance statement

The migration succeeds when the room looks like a photographed physical low-poly diorama populated by
objects licensed by the Walk—not when a contact sheet contains many generated images. The approved art
language is large-faceted, mature, restrained, tactile, and semantically faithful. Production quantity
never outranks projection correctness, construction truth, state consistency, or in-engine citizenship.
