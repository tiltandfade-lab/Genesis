# Genesis Figurine Sprite Style Guide — Vision Variant

## Status

Exploration style guide for the reference sheets in this folder. This is not yet a replacement for the canonical production rules in `docs/SPRITE-SHEETS.md` and `docs/SPRITE-TRANSITION.md`.

The current canonical pipeline already records:

- ImageGen-generated sprite sheets;
- flat chroma-key extraction;
- consistent sheet grids and full-body crops;
- sprite registry and manifest generation;
- nearest-neighbor filtering;
- alpha-cutout billboards;
- Y-axis billboarding;
- size scaling against creature category;
- fallback from sprite → whole object → cuboid → blank meeple.

This guide records the newer **faceted figurine** look used by the PC and monster reference sheets.

## Difference from the current canonical style

The existing canonical master style in `docs/SPRITE-SHEETS.md` describes a magenta key, 3/4-left presentation, near-realistic proportions, an oxblood/steel/bone/moss palette, and no outlines.

The new vision variant uses:

- green chroma key `#00ff00` for the current reference sheets;
- low-poly/faceted planes;
- compact tabletop-figurine proportions;
- charcoal, deep teal, muted brass, bone, moss, ember, and celestial-blue accents;
- front, back, and three-quarter views where useful;
- readable iconic silhouettes over anatomical detail;
- slightly stronger color blocking and material separation.

Do not silently mix these conventions in production. Claude should treat this file as a candidate house-style variant until the project owner locks the key color, palette, and view rules.

## Reproduction prompt

Use this block as the stable preamble for future ImageGen requests:

```text
Create an original Genesis fantasy figurine sprite sheet for a 2.5D Three.js game.

STYLE:
- low-poly PS1-era tabletop figurine aesthetic;
- faceted painted planes with crisp readable silhouettes;
- compact but believable proportions;
- simple graphic material separation rather than fine texture detail;
- no painterly background and no photorealism;
- no black ink outline around the subject;
- no cast shadow or floor contact shadow;
- the character must remain legible when reduced to a small billboard sprite.

CAMERA AND VIEWS:
- orthographic character presentation;
- front or front three-quarter view by default, facing left unless the sheet explicitly requests another view;
- add a back view only when the sprite will support hero-versus-boss staging or a puppet/diorama experiment;
- preserve the same silhouette, costume, equipment, proportions, and palette across every cell;
- full body visible with generous padding and a shared ground line.

MATERIALS AND COLOR:
- charcoal and deep blue-black foundations;
- deep teal or muted realm color for cloth and magic;
- muted brass or aged gold for focal trim;
- worn leather and subdued earth colors;
- bone, moss, ember, or celestial-blue accents only where the creature concept requires them;
- avoid glossy toy plastic, neon rainbow color, and excessive micro-detail.

SHEET DISCIPLINE:
- equal cells in a clean grid;
- one complete subject per cell;
- no overlap between cells;
- no additional characters;
- no scenery, text, labels, logos, or watermark;
- keep weapons, tails, wings, horns, and other extremities inside the cell;
- preserve consistent scale and baseline.

BACKGROUND:
- use a perfectly flat solid #00ff00 chroma-key background for this exploratory variant;
- do not use the key color anywhere in the subject;
- no gradient, texture, reflection, fog, particles, or lighting variation in the background.
```

## PC model sheet recipe

For a PC model sheet, request six cells:

1. front neutral;
2. back neutral;
3. front three-quarter;
4. back three-quarter;
5. left profile;
6. right profile.

The front and back pair should share a ground line and body scale. The back view is not required for every pose; it is an orientation asset for special staging, idle rotation, or a layered-puppet experiment.

## Pose-card recipe

For discrete pose cards, request eight full-body cells:

1. neutral idle;
2. alert;
3. attack;
4. guard;
5. spell cast;
6. wounded;
7. victory front or three-quarter;
8. victory back-facing.

Pose cards are sprite swaps, not animation frames. Do not ask ImageGen for motion blur or a continuous sequence. The engine owns when a pose changes.

## Monster sheet recipe by CR band

Use broad production bands rather than asking ImageGen to understand numeric CR mechanically:

- CR 0–1: small, simple, high-count silhouettes; readable weapons and body shapes;
- CR 2–4: one strong silhouette feature and modest equipment/armor;
- CR 5–10: larger bodies, asymmetry, unusual limbs, wings, crystals, or strong material identity;
- CR 11+: iconic boss silhouette, large footprint, one dominant visual motif, minimal clutter.

CR belongs in the manifest and registry. It should not be encoded by visual noise alone.

## Front/back staging rule

Use front and back sprites deliberately:

- ordinary encounters: front or three-quarter is sufficient;
- exploration: front/three-quarter plus occasional idle rotation is sufficient;
- party facing a boss: use back-facing PC sprites and a front-facing boss sprite;
- cutaway or reveal: use a back-facing enemy only when the silhouette itself is the dramatic information;
- puppet prototype: front/back is the minimum useful orientation pair before attempting more layers.

This creates a figurine-diorama read without requiring a fully rotatable 3D character.

## Technical handoff

The generated sheet is not a runtime asset until it passes the existing pipeline:

1. Generate against the approved key-color convention.
2. Review the whole sheet for identity, cell boundaries, silhouette, baseline, and extremity clipping.
3. Slice using the existing manifest/slicer workflow in `docs/SPRITE-SHEETS.md`.
4. Remove the chroma key and trim transparent bounds.
5. Register each slug through the generated manifest/registry path.
6. Apply manual head-line/scale calibration through the existing overlay workflow.
7. Review against sprite size guides and the active theater camera.
8. Run the sprite pipeline and theater sprite verification before promotion.

The runtime seam remains the existing one:

- `src/ui/theater-boot.js` resolves sprite entries and builds billboard groups;
- `spriteTextureFor` loads/caches the texture;
- `buildSpriteBillboardMesh` provides the cutout plane;
- the base disc and size ladder establish figurine scale;
- Y-axis billboarding preserves the 2.5D stage read;
- missing assets fall through safely.

## Puppet extension rules

If a PC becomes a layered puppet, keep the same art language:

- fixed canvas size for every layer;
- fixed anchor metadata for head, hands, weapon, shield, and feet;
- same key-color and palette rules;
- same faceted plane treatment;
- no layer that requires realistic translucency or complex hair simulation;
- body sprite remains a valid fallback if any layer fails.

Start with body + weapon + cloak/familiar. Add head or face layers only after the anchor system is proven.

## Drift checklist

Reject or regenerate a sheet when:

- the subject reads as a full illustration instead of a cutout figurine;
- the camera angle changes between cells;
- the silhouette is too thin or detailed to read at stage scale;
- the palette becomes neon or photorealistic;
- the subject touches the cell edge;
- weapons, wings, tails, or horns clip across cells;
- front/back views change costume or body proportions;
- the background contains shadows, gradients, or scenery;
- pose differences are too subtle to be mechanically useful;
- the image introduces text or a watermark.

## Lock decision still required

Before production-wide generation, choose one canonical convention:

- existing canonical magenta-key sprite style;
- this green-key faceted figurine variant;
- or a reconciled style that keeps the canonical pipeline but adopts the figurine palette and front/back staging rules.

Until that decision is made, keep these images in `docs/vision-quests/references/` and do not treat them as the final asset corpus.
