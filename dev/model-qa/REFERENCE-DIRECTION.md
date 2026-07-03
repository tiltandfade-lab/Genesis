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

## Engineering translation (round-2 build units)

1. **Procedural pixel-skin system** — canvas-generated per-part textures implementing
  L2/L7 off the palette channels; cache by (part, palette, motif) key; vertex-color
  fallback when canvas/WebGL absent (headless/jsdom degrade unchanged).
2. **The maw module** — open wedge jaw + teeth prisms (L4), keyword-wired
  (wolf/dire/predator/dragon/ghoul...); wedge-taper variants for heads/torsos (L6).
3. **Family proportion presets** — per creatureType signature scalars applied at
  recipe derivation (L3), overridable per-slug in model-recipe-overrides.

## How G5 sessions use this

Contact-sheet reactions from Adam ("this reads / too blobby / legs wrong") get
translated into one of L1–L7 + a recipe/preset delta. A figure that can't be fixed
inside the laws escalates the ladder: parts vocabulary → Blender-authored hero GLB
(top-20 only) → pack swap. All placeholder-tier per DESIGN-GUIDE §II.0b.
