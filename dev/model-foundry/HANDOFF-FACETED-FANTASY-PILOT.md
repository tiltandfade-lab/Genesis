# Handoff: Fantasy Faceted Prop Pilot

**Status: PAUSED FOR REVIEW. Do not start a broad regeneration wave.**

This work lives in the isolated worktree `/private/tmp/Genesis-extruded-props` on branch
`codex/extruded-prop-pilot`. Nothing from this lane has been merged or runtime-admitted.

## The decision that is now clear

The first extrusion contact sheet was a visual failure: blank space, magenta contamination, detached
geometry, rough slab shells, and perspective/source-art problems. It must not be cited as success.

The useful direction is currently called **B treatment**:

- retain the ornate, high-tier, mature Fantasy visual language;
- use source art as a front-face identity/material layer;
- build a shallow physical body behind it with a recessed backing, thin visible rim, controlled bevel,
  and selective real front relief;
- keep the source's original silhouette; do not replace an interesting artifact with generic red,
  starter-tier, World-of-Warcraft-like heraldry;
- real geometry and runtime lights own thickness, side faces, bevel highlights, and any low-poly relief.

The source must be classified before construction. A front-facing wall ornament can use shallow
extrusion; a perspective-painted chest, barrel, lever, shrine, or free-standing prop must be regenerated
as flat source art or routed to faced-box/lathe/procedural construction. Do not force all PNGs through
contour extrusion.

## Current proof artifacts

These are all offline technical/art-direction studies, not runtime assets:

- `dev/model-foundry/faceted-extrusion-proof/comparison.png`
  - A: original ornate shield on the failed legacy raw-contour slab.
  - B: original ornate shield on the new faceted extrusion.
  - C: regenerated ornate shield on the same extrusion recipe.
  - B was visually stronger than C at this moment because it retained the original's high-tier identity;
    C is a good source-art direction but its mesh/body tuning remains too chunky at grazing angles.
- `dev/model-foundry/faceted-extrusion-gallery/gallery.png`
  - nine **menu icons**, not in-game world props. It is valid only as a mesh-language experiment.
  - Adam correctly rejected it as the wrong population for deciding the world-prop direction.
- `dev/model-foundry/faceted-extrusion-proof/fantasy-shield-v4.png`
  - generated, chroma-removed ornate shield source. Preserves ivory/gold filigree and blue gems; it is
    not admitted and should be treated as an anchor candidate, not a shipped asset.

## Scope lock

Only **Fantasy** is in the regeneration pilot. Gloom and Chrome remain inventory/reference only.
No one should generate, replace, or admit assets in other realms until the Fantasy in-game pilot passes.

`dev/model-foundry/flat-prop-regeneration-queue.json` contains 32 Fantasy extrusion candidates. It is a
queue, not authorization to run all 32. Start with a compact representative in-game sample.

## The next task: correct in-game sample, not icons

Build a six-to-eight asset **Fantasy Walk dressing sample** from actual table-backed/dressing concepts.
Use it to prove source classification and the visual engine in a real room. Suggested test population:

1. banded oak door, closed/open state pair, wall-mounted;
2. wall lever, left/right state pair, wall-mounted;
3. ornate wall shield or heraldic relief, wall-mounted;
4. painted dragon tablet/portrait, wall-mounted shallow extrusion;
5. floor trap plate, horizontal floor mount (never upright);
6. broken shield-wall fragment or torn banner, wall/floor mount as authored;
7. a faced-box container or chest, explicitly **not** contour-extruded;
8. one visible practical light with physical fixture/emitter rather than a floating glow disc.

The existing sources in `assets/dressing/fantasy-*.png` are useful semantic references but many are
three-quarter paintings. For the B pilot, generate or regenerate sources one at a time whenever flat
projection is needed. Preserve the semantic slug/state/Walk binding; do not replace a table concept with
a generic decorative object.

## Required acceptance image

Do not produce another isolated asset sheet first. Produce one deterministic in-engine Fantasy room
capture, licensed by an actual Walk/room fixture, containing the sample above. It must exercise:

- wall volumes with visible caps and mounts;
- floor versus wall mount orientation;
- at least one state-family relationship;
- a practical whose emitter sits on visible fixture geometry;
- occlusion/cutaway behavior without floating items;
- camera angle that shows both front identity and a believable side/rim;
- no menu icon assets standing in for a world prop.

The acceptance question for Adam is simple: does this look like a beautiful physical diorama whose
objects belong to the rolled room, or like 2D icons pushed into 3D space? Do not widen the scope until
the answer is clearly the former.

## Technical notes

- Current proof builder: `dev/model-foundry/build_faceted_extrusion_proof.py`.
- Current B-gallery builder: `dev/model-foundry/build_faceted_icon_gallery.py`; it should not be used as
  a production prop factory without adapting it to the actual source/mount contract.
- Current reports use strict vocabulary: `technicalStatus: COMPILED` means only a GLB reloaded; visual
  verdict and `runtimeAdmitted` remain separate. Runtime admissions are zero.
- Sprite/procedure migration document: `docs/FACETED-SPRITE-ART-MIGRATION.md`.
- Extrusion source and construction document: `docs/EXTRUDED-SPRITE-PROP-LIBRARY.md`.
- The renderer already needs the broader wall-volume and physical-practical fixes described in
  `docs/STAGE-C-ART-DIRECTION-REVIEW.md`. Do not declare asset success while those defects still cause
  paper walls or floating light orbs in the real theater.

## Do not do

- Do not count a generated PNG, a compiled GLB, or an isolated contact sheet as acceptance.
- Do not replace ornate or strange artifact identity with simple red/blue generic game loot.
- Do not contour-extrude barrels, chests, altars, trees, shrines, portals, or perspective-painted props.
- Do not use menu/UI icons as the in-game dressing sample.
- Do not expand to Gloom/Chrome or all 32 Fantasy candidates.
- Do not merge this branch before the in-game Fantasy sample is reviewed.
