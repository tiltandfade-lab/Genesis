# REFERENCE-DIRECTION — the figure look, set by Adam's reference corpus (2026-07-03)

Adam supplied five reference images in-session (drop the originals in
`ui-sketches/model-refs/` when convenient — descriptions below are the working canon
until then). This file is the art-direction contract for every figure-fidelity round
and the G5 override sessions. It supersedes the earlier "flat vertex color, silhouette
only" ruling for figures.

## The five references, and what each one teaches

1. **RE1 PSX interior (Chris by the bookshelf)** — *detail lives in the texture, not
   the mesh.* Patches, belts, holsters are paint. Geometry owns silhouette only.
   Warm, hard-shadowed, texel-dirty integration of figure and set.
2. **Pixel-skinned cosmonaut (PS1-revival low-poly)** — *limited desaturated palette +
   ONE accent* (orange visor, red stripes on cream) + hand-shaded pixel texture at
   ~32–64px per region. Dither and shading baked into the skin. Enormous charm per
   triangle. This is our target texel density.
3. **Goblin with wireframe (modern low-poly)** — *proportion hierarchy IS identity*:
   head ~1.5–1.8×, ears/hands oversized, legs stumpy; ~300–600 tris. Painted white
   edge-highlights on ears/knuckles/belt (worn-edge paint, zero geometry). Organic
   wedges and tapers — a box torso reads as a crate; a tapered wedge reads as a body.
4. **PSX wolf (open maw)** — *one signature feature exaggerated makes the species*:
   the open jaw with geometric teeth IS "wolf"; the body is a generic quadruped.
   Mottled camo texture, wedge head.
5. **FF-style PSX monster (mouths-for-arms)** — *monsters get one weird bold idea
   pushed hard*, a strict two-tone scheme, and a repeated motif (teeth everywhere).
   Coherence beats complexity; asymmetric pose sells menace.

## Batch 2 — humanoids & heroes (2026-07-03, later same day)

6. **PSX soldier (conical helm, plate, chest strap)** — *equipment IS the humanoid
   silhouette*: helm, pauldrons, oversized sabatons read before anatomy; the diagonal
   strap is a one-part signature accent; the grumpy face is painted, never modeled.
7. **PSX spider (blue, sigil abdomen)** — legs are single tapered prisms with painted
   banding; the abdomen is a motif canvas; the species reads from leg splay alone
   (validates `legSpider`). Stripes are texture, not geometry.
8. **Venom model sheet (500 tris · 128×128 texture)** — **THE HERO BUDGET, now canon**:
   ~500 triangles + one 128px painted texture per hero figure. Hunched-menace stance
   (shoulder mass forward, arms past knees, small head); ONE painted motif (the chest
   spider) carries all identity.
9. **Pixel knight (red plume)** — the maximal edge-highlight case: every plate rim
   gets a lighter run; metal reads through value banding alone, no shine shader; one
   hot accent (plume) + one warm accent (gold belt); armor is distinct silhouette
   lumps, never a smooth shell.
10. **FFT ranger (white hood, ready stance)** — *stance is half the figure*: weapon
    held across the body in a two-point ready grip, slight crouch; the hood is a class
    silhouette; ~4 heads tall, chunky forearms; muted earths + one light accent.

11. **Low-poly humanoid base mesh (400 tris / 207 verts, wireframe)** — the TOPOLOGY
    blueprint: one continuous skin (shoulder flows into arm, torso into hips); limb and
    torso cross-sections are 6–8 sided tapering loops, never square; edge-loop density
    concentrates at joints; hands are flat mitts (~10 tris), feet are wedges. Budget
    distribution: torso ~120 · limb ~55 · head ~40 — proof that 250–300 tris suffices
    for a full organic body when spent this way.

12. **Low-poly horse (wireframe + textured, ~450 tris)** — the QUADRUPED topology
    blueprint: horizontal body loft (chest deeper than haunch), a SEPARATE rising
    neck loft into a wedge head (the missing neck is why our quadrupeds read as
    planks), ear spikes (2 tris, huge silhouette payoff), legs with joint loops and
    a rear-leg hock bend (front/rear legs are not identical posts), a tail plane.
    Textured half: paint zones carry the species — face blaze, white socks over dark
    hooves, one eye dot with a highlight (L18 zone masks + L19 eyes, confirmed).

13. **Low-poly wolf wireframe (~500 tris)** — the wolf acceptance target: rising neck,
    wedge muzzle, ear spikes, chest-deep body sloping down to the haunch, hock-bent
    rear legs, toe splits — and the TAIL HAS VOLUME (a lofted curve, never a flat
    plane).
14. **Low-poly T-Rex wireframe** — the big-monster blueprint: mass drama (huge
    haunches, tiny arms — proportion is the menace), body BALANCED OVER THE HIPS with
    the tail as counterweight (a stance lesson), open jaw with individual geometric
    teeth, claw toes. Serves dragons, drakes, every large beast.
15. **Low-poly bat wireframe (flying)** — THE WING LAW's source: arm spar + finger
    spars radiating, membrane panels fanned BETWEEN the fingers, scalloped trailing
    edge, attached at the SHOULDERS of a small body; big ear spikes. A swarm mini-bat
    is this at 1/10 detail.
16. **Hooded monk statue (textured + wireframe)** — the robed-figure pattern: THE ROBE
    IS THE BODY (one flowing loft to the ground, no legs modeled), hood holding a DARK
    VOID instead of a face, sleeve tubes meeting at a held object. Solves wizard/
    cultist/specter in one pattern; doubles as the statue-prop blueprint (plinth
    included).
17. **HL2 Combine cop model sheet (411 tris · 128×128 atlas; stun baton 36 tris ·
    8×64 strip)** — the second hero-budget receipt (with #8): a full armored humanoid
    with gear ≈ 411 tris on ONE small atlas; **weapons ≈ 36 tris** with optional tiny
    strip textures.

## The laws (grade every figure round against these)

- **L1 — Texture carries detail; geometry carries silhouette.** Never model what
  paint can say. Never paint what the silhouette must say.
- **L2 — Pixel-skin discipline:** 32–64px painted-look textures, NearestFilter, no
  mips (or nearest-mip). Quantized 2–3 value bands top-lit, Bayer/ordered dither,
  1px lighter top-edge highlights, darker underside. Deterministic per recipe seed.
- **L3 — Proportion exaggeration per family:** signature features scaled 1.3–2×
  (goblinoid heads/hands, beast maws, horror's weird idea). Legs err stumpy. Uniform
  realistic proportions are the failure mode — they read as mannequins.
- **L4 — One signature feature per creature** (the wolf's jaw rule). The §7b judge
  should be able to name the creature from that feature alone at ~100px.
- **L5 — One weird idea per monster, pushed hard** (the mouths-for-arms rule), plus a
  repeated motif. Two-tone palette + one accent; value contrast over hue variety.
- **L6 — Wedges and tapers over boxes** for organic forms. Boxes stay for crates,
  armor plates, architecture.
- **L7 — Palette:** desaturated base, single accent, worn-edge paint. The existing
  channel stack (skin/armor/accent/glow) already routes this — obey it.
- **L8 — Equipment is the humanoid silhouette.** Helm/pauldron/boots/hood read before
  anatomy; exaggerate them 1.2–1.5×. For people, the loadout mirror IS the identity
  system.
- **L9 — The hero budget: ~500 tris, one 128px texture.** The exact spec for the
  Blender hero tier (top-20 creatures). The grammar aims lower, and that's fine.
- **L10 — Motif paint carries identity.** Torso/abdomen faces are motif canvases —
  ONE stamp per creature, tied to L5's repeated-motif rule.
- **L11 — Stance is half the figure.** Family stance presets: soldiers square, rogues
  crouched, brutes hunched with arms past knees. Weapons default to a two-point READY
  grip across the body — never parade-rest at the hip. (This, not anchor math, is the
  real fix for "weapons aren't held right.")
- **L12 — Faces are painted, never modeled — and treated as an experiment.** 2–4 dark
  pixels for eyes + a brow line, behind the pixel-skin toggle; bad pixel faces go
  goofy fast, so it dies quickly if judges laugh.
- **L21 — The loft law (body topology, from reference #11).** Organic masses are
  LOFTED loop-skins: a spine of 6–8 sided cross-section loops skinned into one strip —
  never glued boxes. Loops cluster at joints; straight runs stay cheap; mitts and
  wedge feet are canon. Boxes/wedges/prisms remain for armor plates, gear, weapons,
  architecture. This is the primitive that makes the 250–300 budget read organic.
  Quadruped clause (reference #12): body = horizontal loft, NECK = its own rising
  loft into the head wedge, ear spikes, hock-bent rear legs, tail plane, hoof/sock
  paint zones.
- **L22 — The wing law (reference #15).** Wings are a spar skeleton (arm + radiating
  fingers) with membrane panels fanned between, scalloped trailing edge, attached at
  the SHOULDERS. Never a floating slab. Swarm members use the same construction at
  1/10 detail.
- **L23 — The robe law (reference #16).** Robed figures: the robe IS the body — one
  flowing loft to the ground, no legs; hood holds a dark void, not a face; sleeves
  are tubes. Wizard, cultist, specter, and statue props all speak this pattern.
  Weapon budget (reference #17): ~36 tris per held weapon; strip textures allowed.
- **L14 — Carry states (Adam, 2026-07-03): "in the hand" means THROUGH the fist, and
  every weapon class gets a static-piece-sensible carry.** Forearms end in a FIST block
  (oversized per the goblin reference — it's both the hand-read and the gripping
  volume); a held weapon's grip section passes THROUGH the fist with a slight cant —
  intersection, never adjacency. The states: **held-fist** (1H melee + versatile) ·
  **planted** (spear/polearm/staff — vertical in fist, butt near ground, the classic
  minis at-rest guard) · **back-mount** (heavy 2H melee: greatsword/greataxe/maul —
  diagonal across the back at the back anchor; Adam: "that's how static game pieces
  work") · **bow-held** (vertical arc in fist) · **shield** (off-forearm). A 2H weapon
  floating near one hand is a failure state.
- **L15 — Pose investment is PC-first.** No multiple poses per model yet; when stance/
  pose work lands, PC figures get it first — the roster is semi-limited and the payoff
  is highest (the player stares at their own mini all session). Monsters hold one
  neutral-ready pose until the PC set proves the system.
- **L13 — Shape expression (Adam, 2026-07-03): the primitive vocabulary is NOT box-only.**
  "One extra pass of shape expression" — the part layer speaks
  {box · taperedBox · wedge · prism6/8 · lozenge · low-cone · low-blob}, each ≤~60 tris,
  default box for back-compat. Organic masses get tapered/faceted volumes; boxes are for
  crates, plates, and architecture (ties to L6). The references run 300–600 tris/figure;
  today's box-builds run ~180 — there is headroom to SPEND on shape, and shape is where
  it goes. All 510 recipes stay valid (parts change inside; recipe surface unchanged).

## Engineering translation (round-2 build units)

1. **Procedural pixel-skin system** — canvas-generated per-part textures implementing
  L2/L7 off the palette channels; cache by (part, palette, motif) key; vertex-color
  fallback when canvas/WebGL absent (headless/jsdom degrade unchanged).
2. **The maw module** — open wedge jaw + teeth prisms (L4), keyword-wired
  (wolf/dire/predator/dragon/ghoul...); wedge-taper variants for heads/torsos (L6).
3. **Family proportion presets** — per creatureType signature scalars applied at
  recipe derivation (L3), overridable per-slug in model-recipe-overrides.

In-flight amendments (2026-07-03, from the round-1 sheets): unit 0a = fix the ALBEDO
CRUSH (figures render near-black; luminance-floor the resolved channel colors) · unit
0b = THE FRAME RETARGET (limbs/hands/wings ported from the old y≈0.56-shoulder frame
into y=1.0-shoulder torsos without conversion — re-hang arms from the shoulder line,
raise hands to ready-grip, pin wings at shoulder-blade height, check quadruped legs;
acceptance by CAPTURE, never box-math).

### The shape wave (next, after round-2 captures)

4. **The L13 primitive layer** — shapeSpec {box · taperedBox · wedge · prism6/8 ·
  lozenge · low-cone · low-blob}, box-default for back-compat, then a shape-expression
  sweep through the big-read parts (torsos, heads, limbs first; props later).
5. **Swarm density pass** — 12–20 elements, size/height variance ("swarms are just
  some dots").
6. **Stance presets** (L11) joining the proportion presets · motif-stamp hook in the
  pixel-skin generator · the face-paint experiment (L12).

## G5 round-2 rulings (Adam, 2026-07-03 evening — the shape-wave mandate)

Adam's verdict on the round-2 pilot: textures upgrade the tone, arms are right,
"everything needs more detail." The wave runs on the EXACT pilot creatures first.
**THE TRI BUDGET, TIERED (Adam, later same evening — "400–500 is the magic zone"):**
swarm members 30–60 each · common minis 250–400 · **PCs / bosses / large creatures
400–600** (the magic zone; the receipts: base body 400 · Combine 411 · Venom 500).
Tri count is a budget, not a recipe — it only reads when spent per L21 (loops at
joints, necks, silhouette features), and perf is a non-issue (a full fight ≈ 10K
tris). **PRESENTATION SCALE (Adam, same evening): minis render ~2× bigger** —
~200–300px tall on the battle stage (was ~100–150px). QA sheets judge at gameplay
size from round 3 on; hero-tier skins may step to 64px; the within-zone crowding
nit is promoted to a real item (zoom-spread owns it). Original mandate follows:

- **L16 — THE ORIENTATION LAW.** Every figure faces the SAME stage convention.
  Quadrupeds + the spider currently build 90° off (wings inherit the wrong axis with
  them). Correctness fix, global, before any styling.
- **L17 — THE SWARM LAW.** A swarm is 8–14 SMALL INSTANCES of the member creature
  (mini-bats with real wings, rat wedges with tails) in an IRREGULAR Diablo-2-style
  cluster — varied heights, varied orientations, never a uniform circle, never
  abstract blobs. Adam: "how much does it really cost to just make multiple bats?"
- **L18 — MATERIAL PROGRAMS.** The pixel-skin generator grows per-material programs,
  not generic dither: **bone** (pale, joint cracks), **plate** (bands + rivet dots +
  rim highlight), **cloth** (weave banding), **scale** (offset rows), **leather**,
  **fur-noise**. Chosen by channel + part kind. "Nothing looks like armor or bone or
  teeth" is the failure this kills.
- **L19 — EYES.** Small eye dots (2–4 px, black; red for undead/fiends) on head-front
  textures. The cheapest life a figure can get.
- **L20 — SPECIAL MATERIALS.** Gray Ooze: ROUNDED blob (L13 low-blob, not stacked
  cuboids) + transparency + minor specular/reflectivity. The specter's translucency
  precedent generalizes into a small material-variant vocabulary.
- **Archetype corrections:** mephits = little winged gargoyle-demons (small biped +
  wings + horns + tail), NOT pale quadrupeds ("looks like a minecraft sheep").
  Blind Deep-Stalker = full one-weird-idea rebuild (currently "the poop of a sheep
  mephit" — Adam). 

## The approval flow (Adam, 2026-07-03): pilot-first, environment included

- **THE PILOT LINEUP** — a standing set of ~16 representative figures
  (`dev/model-qa/pilot.json`): the Row-B beasts (wolf · spider · swarm · ooze ·
  ghost/spectre · dragon-kin) + core humanoids (skeleton · zombie · goblin · bandit) +
  the three PC archetype fixtures (fighter-greatsword · ranger-bow · wizard-staff,
  L15 PC-priority) + one giant + one flyer + one horror. One sheet, fast to read.
- **Wave scope (Adam, 2026-07-03 late): only the parts and generator rules the pilot
  16 consume get modeled** (plus explicitly-critiqued rebuilds — mephit, deep-stalker).
  Parts no pilot creature reaches (serpent, fins, props, non-pilot family presets)
  stay untouched until approval; the expansion pass ports the approved grammar to
  them afterward. The recipe diff must prove the blast radius matched the sheet.
- **Style passes go pilot → Adam approves → sweep.** Proportion presets, pixel-skin
  style, shape expression, stance — tuned and captured on the pilot first; only after
  Adam's sheet approval does the change sweep all 510 (then one full-set spot-check
  sheet). **Correctness fixes (assembly frame, albedo, parse) stay global** — they're
  bug repairs, not taste.
- **Environment rides every approval round:** alongside figure sheets, capture 3–4
  scene shots — textured board + props under 2–3 light profiles (marsh, dungeon,
  camp). Round-1 accidentally shot palette-only (the fixture page 404'd the texture
  manifest); the textured board has never actually been approved.

## How G5 sessions use this

Contact-sheet reactions from Adam ("this reads / too blobby / legs wrong") get
translated into one of L1–L7 + a recipe/preset delta. A figure that can't be fixed
inside the laws escalates the ladder: parts vocabulary → Blender-authored hero GLB
(top-20 only) → pack swap. All placeholder-tier per DESIGN-GUIDE §II.0b.

## P1′ — WHOLE-OBJECT figures into the engine (Adam's rulings, 2026-07-03 late-night wave)

The class-roster wave supersedes the cuboid-parts figures for the ROSTER (PCs + named/key
monsters); cuboid-parts demotes to auto-fallback + nearest-sub for the bestiary tail. The
12 class figures live in `creatures/*.js` (whole-object landmark tables — one function, one
frame, held items first, ~2 min/class to author); `ps1-sheet.html` is the standing in-engine
QA gate (byte-faithful copy of theater-boot's PSX pass: Bayer dither, vertex-snap 96,
1/3-res + pixelated upscale). QA runs as the two-wave workflow: fix (eye standard) →
positioning review (grips/ground/intersections/facing, structured verdicts) → repair.

**RULED — individual bespoke models** (board-piece mentality); an anomalous game creature
subs in the nearest existing model, "like we do in real life." Modular parts (`parts.js`)
stay as an authoring accelerant, never a runtime assembly.

**RULED — the house eye standard:** two SMALL intentional dark quads (~0.026×0.021) flanking
the nose ridge, proud of the BULGED face plane (+0.004 past the nose-push; naive ellipse-z
buries them), jitter 0. No shaded ring-column eye bands, ever. Closed helms (paladin) are
exempt — a painted visor slit is headgear, not eyes.

**REVERSAL — RULED 2026-07-04 evening:** NO authored eye quads — Adam: "across the board the
eyes are in the wrong place so just get rid of them." The house eye standard above is
SUPERSEDED; the small dark humanoid/beast face-dot pattern (the `P.eye`/`eyeCols`/`isEye`
authoring convention, wherever it appeared — PCs, races, NPCs, and most monsters) is removed
across the module set. **Closed-helm visor slits stay** (headgear, not eyes — e.g. paladin.js's
`isVisor` dark band). **Large monster feature-eyes stay** — a small number of creatures where
the "eyes" are a genuine large feature-read (built from a proper iris/rim/pupil disc
construction, not the flat 2-quad dot) rather than the misplaced small humanoid dot: the
owlbear's huge forward amber owl eyes (`mon-owlbear.js`/`mon-owlbear-alt1.js`) and the spider's
eye cluster (`spider.js`/`var-wolfspider.js`). `mon-skeleton.js`'s skull-socket eye voids and the
dead skull embedded in `mon-ooze.js`'s engulfed bone were never in the small-quad `P.eye`
pattern to begin with (they're bone/death-motif detail, not a living face, per the skeleton's
own pre-existing exemption) — untouched, not swept. Skipped this pass — owned by parallel
executors working the same evening, who remove their own eyes: `mon-wolf.js`, `mon-rat.js`,
`mon-skeleton.js`, `ranger.js`, `ranger-alt1.js`.

**RULED — textures are GENERATED, never painted assets (Adam: "a. yes b. yes"):**
> REAFFIRMED 2026-07-04 after testing the alternative. Ran a ChatGPT painted-swatch round-trip:
> a 25-slot material-tile library → 12 creatures wearing the tiles through the real PS1 pass
> (dev/model-qa/chatgpt-swatch/, texture-preview.html). RESULT — Adam: "clear fail, let's not
> apply the textures." Bright/high-contrast tiles read (troll fur, lava, ghost-vapor, bone) but
> dark tiles mud out under the dither and the win didn't justify a painted-asset dependency.
> The generated grain stays the tier. Do not re-litigate painted textures; the dev experiment
> files are kept as the documented dead-end evidence. NEVER wired into the live renderer.
(a) The TEXEL GRAIN pass is default-on in the sheet: one seeded 128px canvas atlas
    (mottle flecks 0.60–0.94 + broad soft patches + worn scratches, NearestFilter, no
    mipmaps), per-quad UV windows (tri pair shares a window), multiplied UNDER the vertex
    colors. Palette stays authored; grain adds the VS texel-dirt. Toggle `?grain=0`.
(b) P1′ engine wiring carries MATERIAL CHANNELS on whole-object quads: palette keys tag
    cloth/metal/skin/leather/bone regions at author time, and theater-boot's existing
    per-material pixel-skin texel programs (L18: bone/plate/scale/fur banding + worn-edge)
    paint each region when figures flow through `figureMaterialFor`. Texture = a generated
    property of the model, not an art task.

P1′ build order: (1) whole-object path in theater-boot (`landmark builder → BufferGeometry
+ uv/channel attrs → figureMaterialFor → applyPsxShaderTweaks`), gated, cuboids fallback;
(2) `creatureId → builder` registry (the recipe seam); (3) races as RIG variants (gnome =
proportion preset on `humanoidRig`; dragonborn/tiefling get bespoke anatomy passes);
(4) monster waves by CR, deduped by silhouette family, sized (size law + base-disc
diameters — draft before the first wave); T2 GLTFLoader seam stays for Blender/Kenney.
