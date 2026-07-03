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

## How G5 sessions use this

Contact-sheet reactions from Adam ("this reads / too blobby / legs wrong") get
translated into one of L1–L7 + a recipe/preset delta. A figure that can't be fixed
inside the laws escalates the ladder: parts vocabulary → Blender-authored hero GLB
(top-20 only) → pack swap. All placeholder-tier per DESIGN-GUIDE §II.0b.
