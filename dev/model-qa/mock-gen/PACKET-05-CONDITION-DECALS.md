# PACKET-05 — CONDITION DECALS (surface condition as a rendered overlay)

type: codex-packet
status: READY (Fable, 2026-07-11 — BW5 SEAM 3 / MC-2. Today condition lives only as prose
(`REALM_SURFACES.summary`, `baseTint` a single flat hex); the renderer never sees "rust-streaked"
or "mildew bloom." These sheets are the ART that turns that prose into a rendered overlay, laid as
the flat decal-quad already in the engine — quad-on-top, NOT base+tile compositing.)

## What these are (different from PACKET-02/04 textures)

- **NOT tileable, NOT opaque.** Each is an ALPHA decal — an irregular patch that composits OVER any
  base floor/wall via the flat quad (`interiorBuildDecals`, MeshBasicMaterial, alpha, a hair above
  the surface). Background **pure magenta #FF00FF** (chroma → alpha at slice; defringe).
- **Realm-agnostic base, tinted at render.** Author neutral/desaturated — the engine tints each
  decal by the realm grade + the surface `tint`. (A grime decal reads soot-grey by default, olive
  in gloom, teal in chrome.)
- **A SET per sheet:** a 512×512 sheet of **6 varied patches** (different shape/size/density, edges
  fading to nothing — no hard rectangle borders). Variety is the point: the placer scatters and
  rotates them, so 6 non-repeating patches kill visible tiling.
- Save `ui-sketches/textures/shared-<condition>-decal-set-<n>.png`, additive law (`-take2`).
- **Spice hook (S0-4):** condition DENSITY rolls off the spice band — a Grounded room gets one
  faint patch, a Mythic/decayed room gets many. Author each set with a light→heavy range across its
  6 patches so the placer can pick intensity.

## Standing prompt header (paste atop every prompt)

> Generate a pixel-art DECAL SET sheet, 512×512, on a pure magenta #FF00FF background. Six separate
> irregular condition patches arranged in a loose grid, each self-contained with soft alpha-fading
> edges (no hard borders, no rectangle frames — the patch dissolves into the magenta). Neutral/
> desaturated color (the engine tints it per realm). PS1 RETIRED — crisp full-res, painterly-pixel
> form, no dither except inside the grime itself. These overlay a floor or wall, so bake NO base
> material, NO cast shadow, NO directional light — only the condition itself (the stain/growth/wear),
> semi-transparent so the surface reads through it. Vary the six from faint/small to heavy/large.

## The sets (9 generations)

1. **shared-grime-decal-set** — soot/dirt film: greasy dark smudges, footfall scuff-buildup, corner
   grime, a settled-dust haze. The everyday "this room isn't clean" layer.
2. **shared-moss-decal-set** — moss/algae bloom: soft green-black organic creep, denser at seams and
   bases, a few lichen speckles. (Feeds cave/temple/gloom + the material-inheritance "rough" flag.)
3. **shared-water-decal-set** — damp seep + wet sheen: dark water-staining, standing-puddle gloss
   ovals, drip runs, tide-line rings. (Supersedes/extends the existing `shared-wet-stain-decal-set-1`
   — keep that as `-1`, add these as the varied `-2`.)
4. **shared-scorch-decal-set** — burn char: black scorch blooms, ember-orange edge licks fading to
   soot, a few branching burn cracks. (Also the objects-dg-03 campfire/torch ground-char.)
5. **shared-rust-decal-set** — corrosion: orange-brown rust bleed streaks radiating from rivet/seam
   points, flaking scale, drip stains down a wall. (For grated decking, hull plate, iron trim.)
6. **shared-crack-decal-set** — fracture: spiderweb impact cracks + linear settling cracks + a
   heaved-slab seam, thin dark fault lines with faint pale spall at the edges.
7. **shared-cobweb-decal-set** — neglect: cobweb veils for corners/thresholds, dust drape, a few
   hanging strands. Wall-and-ceiling-corner biased. (The "long-abandoned" cue.)
8. **shared-wear-decal-set** — traffic wear: worn-flat pale paths, polished-smooth high spots,
   scuffed thresholds, faded lane-ghosts. The inverse of grime — where use has *removed* material.
9. **shared-blood-decal-set** — dried gore: rust-brown old bloodstains, spatter, drag smears, a
   pooled ring gone black at the center. **CHILD CARVE-OUT:** this set is gated by the existing
   `childTagged` decal rule — never stamped where the child-safe path is active (`prep.js` blood
   carve-out). Author it clearly "old/dried," not fresh-wet.

## Return handling (orchestrator)

Arrivals → `ui-sketches/textures/` → **slice path (not the opaque texture fold):** chroma-key
#FF00FF → alpha, defringe, split the 6 patches to individual alpha PNGs (or keep as an atlas with a
cell map). Register a `CONDITION_DECALS` table (kind → `[patch files]`) parallel to
`DECAL_KIND_COLOR`. MC-2 extends `interiorBuildDecals` so a condition decal carries an ART texture
on its quad instead of a flat tint constant; selection driven by the room's `REALM_SURFACES` prose
+ material roll, density by spice band (S0-4). Reuse the existing decal cap/FIFO
(`INTERIOR_DECAL_CAP`) and the `childTagged` gate for the blood set.
