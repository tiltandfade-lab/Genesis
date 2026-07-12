# Vision Quest — The Living Figurine

## Premise

Genesis already has the right foundation for a figurine-like 2.5D game:

- creatures are moving toward generated billboard sprites;
- the Three.js stage owns trays, rooms, props, lights, fog, and camera;
- `theater-verbs.js` provides short parametric motion;
- `spawn-grace.js` provides staged entrance motion;
- `theater-boot.js` already has idle breathing, sprite billboarding, contact pools, decals, dressing cards, light flicker, glow discs, motes, and persistent combat traces;
- `data/sprite-registry.js` and the sprite-sheet pipeline provide an image-generation-to-runtime seam.

The goal is not full character animation. The goal is to make a still figurine feel inhabited through cheap, deterministic, readable life signals.

> Add life to the stage, not production complexity to every character.

## Recommendation

Prioritize a **micro-life pass** before building a full PC puppet system:

1. deterministic idle poses and breathing;
2. tiny reactive gesture cards or pose swaps;
3. environmental motion that responds to the rolled scene;
4. physical contact, shadow, and lighting response;
5. a limited layered puppet channel only for PCs and flagship NPCs.

This keeps the figurine look while avoiding a requirement for every generated character to have a perfect animation rig.

## What ImageGen is good at here

ImageGen is well suited for:

- clean front/three-quarter sprite sheets;
- alternate pose sheets for the same character;
- separate opaque accessory layers: cloak, weapon, shield, familiar, banner, wings;
- effect cards: smoke puff, spark, dust burst, spell glow, bloodless impact flash, portal shimmer;
- small environment dressing cards: banners, paintings, signs, pennants, candles, hanging chains, foliage silhouettes;
- material swatches and low-resolution tile textures;
- cutout silhouettes for crowds, distant figures, and background activity.

ImageGen is less reliable for:

- exact frame-to-frame character identity across long animation sequences;
- precise limb articulation;
- transparent glass, smoke, fire, and hair edges without cleanup;
- mechanically meaningful geometry;
- readable text or UI labels.

Therefore, generated imagery should supply **discrete visual states**, while the engine supplies timing, position, scale, visibility, and rules.

## Candidate life systems

### 1. Idle state library — highest value, lowest risk

Give each PC, creature, or NPC a small state set:

```text
idle-neutral
idle-alert
idle-wounded
idle-triumphant
idle-threatening
idle-resting
```

The engine selects a state from combat state, conditions, posture, scene pressure, and activity. Each state can be a sprite swap or a tiny transform variant. No DM narration is required.

Implementation fit:

- Extend sprite registry entries with `poseSet` or `stateSlugs`.
- Reuse `spriteTextureFor`, `buildSpriteBillboardMesh`, and existing sprite scale rules in `theater-boot.js`.
- Use `theater-verbs.js` only for a short settle/breathe transition.
- Keep a neutral fallback when the state asset is missing.

ImageGen deliverable: one consistent sheet containing a small number of full-body pose variants, not a 24-frame animation.

### 2. Layered PC puppets — selective, not universal

For PCs, a puppet can be worth the extra work because the player sees the same figure constantly. Use three to five layers:

```text
base body / clothing
head or hair
held weapon or shield
cloak/banner/familiar
effect or status layer
```

Each layer remains an upright billboard or shallow plane. The engine applies small rotations, offsets, and swaps. Do not attempt skeletal animation first.

Good puppet actions:

- weapon lift on attack;
- shield raise on guard;
- cloak sway on movement;
- head/face turn toward the active target;
- familiar hover;
- spell-hand glow;
- wounded lean;
- victory raise.

Technical caution: separate image parts must share a rigid anchor and silhouette guide. Otherwise the puppet will visibly shear at the joints. The production pipeline should require a fixed canvas, anchor metadata, and a registry entry for every layer.

### 3. Pose-card reactions — better than trying to animate everything

Instead of continuous animation, use an authored pose change triggered by mechanical events:

| Event | Visual reaction |
|---|---|
| turn begins | alert pose settles in |
| hit received | brief recoil pose or squash |
| critical hit | attack pose + impact card |
| ally falls | lowered/resting pose |
| spell succeeds | casting pose + effect card |
| door opens | attention/turn pose |
| victory | raised weapon or relaxed pose |
| breach begins | unstable silhouette or color grade |

The engine owns the event and timing. The DM does not need to micromanage it. This fits the existing event/verb architecture much better than freeform animation commands.

### 4. Environment life — the cheapest broad upgrade

Make the environment breathe around the figurines:

- banners sway;
- torch and lamp flicker;
- smoke or dust drifts in a bounded card pool;
- water shimmers with a simple scrolling or offset plane;
- motes gather near light;
- hanging chains or foliage perform tiny seeded rotations;
- distant silhouettes move once every few seconds;
- a portal or breach pulses on its own clock;
- a defeated enemy leaves a persistent decal or dropped marker.

Most of these already have seams in `theater-boot.js`: light profiles, flicker cadence, glow discs, motes, dressing cards, decals, and tween registration.

The rule should be **one ambient behavior per scene kit**, not an animation on every object.

### 5. Reactive figurine bases

The base can communicate state without changing the sprite:

- selected PC: subtle active ring;
- acting unit: brief raised light or pulse;
- wounded: dim/red rim or tilted shadow;
- hidden: lowered opacity or occlusion treatment;
- frightened/pressured: irregular low-frequency pulse;
- dead/fled: base darkens or empties;
- summoned: base appears with a short spawn ring.

This is inexpensive, legible, and does not require ImageGen beyond optional base decals or effect cards.

### 6. Contact and footfall life

Small deterministic effects can sell physical presence:

- a two-step dust puff when a figurine enters a zone;
- a brief shadow stretch during a lunge;
- a footfall ring on wet, ash, sand, or magical ground;
- a tiny displacement of grass or motes near a large creature;
- a dropped shell, footprint, or bloodless impact mark.

These should be derived from movement type, terrain, size, and speed. They should not be DM-authored events.

### 7. Crowd and background life

Cities can feel alive without rendering a simulated population:

- use a small pool of silhouette cards;
- spawn them only in background districts or roads;
- move them along a few deterministic loops;
- change density from district pressure, time, danger, and spectacle;
- freeze or remove them when the camera focuses on the active scene.

ImageGen can generate silhouette families and banners. The engine supplies the loops and density.

### 8. Mechanically visible pressure

World-state pressure can appear as environmental change:

- faction control changes banners and guard silhouettes;
- danger clocks increase patrol density or torch color;
- a closing front adds barricades or sealed doors;
- a breach adds geometry drift, violet accents, or wrong shadows;
- a famine or siege reduces market activity;
- a festival increases lights, crowds, and pennants.

This is powerful because it makes the ledger visible without exposing raw numbers. The mapping should be qualitative and deterministic: pressure band → visual kit variant.

## What should not be built first

- full skeletal rigs for every PC and NPC;
- continuous generated animation from ImageGen frames;
- facial lip sync;
- procedural hand/finger animation;
- physics-based cloth or hair;
- a unique animated mesh for every creature;
- DM-authored animation commands for routine life;
- particle-heavy effects that run permanently across the whole theater.

Those systems increase asset QA and runtime complexity without proportionate gains in the figurine read.

## Technical implementation shape

### Registry extension

Extend sprite metadata only when the existing transition pipeline is stable:

```js
{
  slug,
  size,
  realm,
  stateSlugs: {
    idle: "pc-hero-idle",
    alert: "pc-hero-alert",
    wounded: "pc-hero-wounded"
  },
  layers: {
    weapon: "pc-hero-sword",
    cloak: "pc-hero-cloak"
  },
  anchors: {
    weapon: { x: 0.18, y: 0.42 },
    head: { x: 0.5, y: 0.82 }
  }
}
```

The existing generated registry should remain generated; anchor/layer data belongs in a source manifest or overlay, not hand edits to `data/sprite-registry.js`.

### Pure mechanical resolver

Add a pure resolver outside the renderer:

```js
lifeStateFor(unit, scene, ledger, seed) => {
  pose: "idle" | "alert" | "wounded" | "victory",
  ambient: ["torch-flicker", "motes"],
  effects: [],
  baseState: "active"
}
```

Inputs should include conditions, HP band if already permitted to the renderer, current turn, environment, pressure band, movement event, and breach state. It returns a small declarative result. The DM is not involved in routine selection.

### Renderer resolver

`theater-boot.js` consumes the life result:

- swap sprite texture or pose group;
- register a short `theater-verbs.js` tween;
- mount a cached effect card;
- update base ring/contact pool/decal;
- schedule no loop unless the scene kit explicitly requires it.

Keep sprite billboard orientation and scale rules unchanged. Keep 2.5D depth ordering and base grounding authoritative.

## ImageGen production guidance

For PC sheets:

- request a neutral orthographic three-quarter character;
- lock silhouette, costume, palette, and scale guide;
- request a small grid of discrete poses, not motion blur;
- use a flat chroma-key background for simple opaque cutouts;
- slice through the existing sprite pipeline;
- review anchor alignment before registration.

For effect cards:

- request isolated, opaque, simple shapes on a flat key background;
- avoid complex smoke, glass, translucent fire, and hair if clean removal matters;
- keep effects small and camera-facing;
- use one generated card in multiple scales and tints where possible.

For environment dressing:

- generate sheet families, not one image per location;
- keep perspective consistent and silhouettes readable;
- use low-detail cards for background life;
- never use generated images as authority for map geometry or mechanics.

## Recommended rollout

### Wave 1 — no new asset dependency

- expand current idle-breathe variation;
- improve base rings, contact pools, and active-unit pulse;
- bind light flicker, motes, decals, and spawn grace to existing scene facts;
- add deterministic environment idle presets.

### Wave 2 — small ImageGen effect and dressing set

- impact cards;
- spell cards;
- dust/footfall cards;
- banners, chains, foliage, and background silhouettes;
- one pose alternate per PC.

### Wave 3 — selective PC puppet channel

- base + body + weapon + cloak/familiar layers;
- three or four mechanically selected pose states;
- explicit anchor metadata and visual QA;
- fallback to the existing full sprite when any layer is missing.

### Wave 4 — flagship characters only

- richer layered poses for the active PC and major NPCs;
- no expectation that the whole bestiary participates.

## Acceptance test

The life pass succeeds if:

- the stage feels inhabited while the player does nothing;
- routine animation is selected from state and rolls, not DM choreography;
- the player can read selection, danger, action, injury, and victory immediately;
- missing images degrade to the existing sprite/cuboid/blank fallback chain;
- no new per-frame loop is created for every unit;
- generated art can be sliced, anchored, cached, and reused;
- the figurines remain the visual center of the scene;
- the 2.5D look survives at low and high camera scale.

## Final recommendation

Do not choose between “static sprites” and “full puppets” yet. Build a layered life system where most characters use one sprite plus mechanically selected pose/effect states, while PCs and flagship characters can opt into a small puppet assembly. This gets most of the emotional payoff from lighting, bases, pose swaps, environmental dressing, and event cards—and keeps the expensive image-generation work focused where the player actually looks.
