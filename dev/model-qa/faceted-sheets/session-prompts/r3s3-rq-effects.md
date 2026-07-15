You are a sprite-generation worker for the Genesis faceted art program. Your batch:
ROUND 3 — RQ effects & decals (F4 rebuild): fx-* sheets use the effects contract, shared-*-decal sheets magenta top-down. Everything you need is pasted below — do NOT read repo files for subjects;
this prompt is the complete, authoritative source. You have image generation; use it
for every sheet.

Rules — these are the whole job:
1. For each sheet section IN ORDER: submit ONE image-generation call consisting of the
   PASTE BLOCK below with [N] and [N x 887] filled in from that sheet's header, followed
   by that sheet's numbered cell list. The paste block is VERBATIM LAW (STYLE-CANON.md) —
   do not reword, trim, or summarize any sentence of it. Nothing added, nothing
   substituted, no subjects invented. EXCEPTION for sheets whose ids start with fx-:
   use the effects contract (hybrid faceted+glow, single-frame, black/alpha key);
   shared-*-decal sheets stay magenta-key top-down.
2. Create a fresh directory named fx3-returns/ under dev/model-qa/faceted-sheets/
   before the first call. It must start EMPTY — if it already contains files, STOP and
   report that instead of generating. Save each result IMMEDIATELY as
   fx3-returns/raw-figures/<first-cell-id>-candidate-001.png.
3. After each save, RE-OPEN the saved file and verify: correct cell count, all four
   corners #FF00FF (for magenta sheets), no figure touching an edge, every tail ends in
   exactly ONE tip, correct limb counts — AND the style laws: lanky house bias, COMPACT
   forward-facing support region (a wide sprawling stance is OFF-MODEL), adult register.
   If a figure reads chibi, cute, wide-based, bright-saturated, or cartoon-MMO: re-roll
   once, then mark FAILED. Do NOT substitute a different subject and do NOT rename
   another file to fill the slot.
4. Append one JSON row per call to fx3-returns/provenance/fx3-generation-calls.json:
   {"file": "...", "callId": "...", "cells": ["..."]} — written at save time, not
   reconstructed later.
5. Do NOT run any git commands. Files on disk plus the provenance JSON are your entire
   deliverable; committing happens elsewhere.
6. Your final report is only trusted if it matches the directory exactly. Report:
   sheets attempted, sheets saved, sheets FAILED (with reasons), and the full filename
   list. A report claiming more than the directory holds will be treated as fabricated —
   prior runs' reports were audited file-by-file and the fabrications were found.

=== PASTE BLOCK (VERBATIM LAW — use in every call, fill [N] and [N x 887]) ===

VERBATIM from [`STYLE-CANON.md`](STYLE-CANON.md) — do not reword any sentence of it.

> Render a character sprite sheet as a single image: a horizontal strip of **[N] equal vertical
> cells**, total canvas **[N×887]×1774** (each cell 887×1774, a vertical 4:8 frame). One figure
> per cell, hard invisible cell boundaries, nothing crossing between cells, no shared props.
> Consistent scale across cells (heads line up); no two figures share a stance.
>
> Visual language: mature, restrained, frightening where canonically appropriate — realistic
> dark-fantasy horror with a stylized triangulated low-poly twist. Large-faceted polygonal
> Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned
> triangular planes. Use smaller facets only around face, eyes, joints, and critical equipment
> landmarks. Believable weight, wear, materials, and adult visual seriousness. This is not World
> of Warcraft, not Baldur's Gate 3 cinematic glamour, not an MMO promotional render, a mobile
> game, a collectible toy, or a cartoon mascot. The house silhouette bias is lanky: longer limbs,
> rawboned frames, weight carried in posture not bulk; a heavy body must belong to a life that
> could actually produce one.
>
> Pose/expression: each figure holds a controlled orthographic front-three-quarter figurine pose
> expressing its listed VERB through center of gravity, spine, head angle, gaze, limbs, and
> negative space. Support region: compact, generally forward-facing — never a wide sprawling
> stance; tails wrap tight, wings furl, legs gather. Keep every pose mechanically usable as a
> standee.
>
> Projection/framing: orthographic front-three-quarter, no lens distortion, full body and every
> extremity visible in its cell, shared ground line, generous padding, no crop. No scenery, floor
> plane, cast shadow, contact shadow, atmosphere, spell effect, unrelated prop, text, border,
> label, or watermark. Do not paint a base or shadow into the source.
>
> Backdrop: perfectly flat solid magenta #FF00FF chroma-key background, completely uniform with
> no gradient, texture, reflection, floor, horizon, or lighting variation. Do not use magenta in
> the figure. Crisp separated edges.
>
> Anatomy is strict: exactly one tail with exactly one tip on any tailed creature — no forked,
> mirrored, doubled, or floating tail segments; correct limb counts (wyverns are BIPEDAL — two
> legs plus wings; no fifth leg, no third wing); tails and wings connect to the body at one
> continuous, plausible joint.
>
> Avoid: fake pixel art, voxel art, micro-triangulation, cracked-glass pattern, random polygon
> noise, chibi proportions, cute mascot treatment, rubber anatomy, inflated muscles, oversized
> shoulders, oversized hands/boots/weapons/teeth, candy saturation, glossy plastic, friendly
> monster grin, generic hero pose, theme-park fantasy, sanitized horror, cosplay cleanliness,
> baked rim light, and poster scene.
>
> The figures, left to right: **[numbered cell list from the batch doc]**

=== YOUR SHEETS, IN ORDER ===

### Sheet RQ-05 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-env-shadowpool` (Medium) — (no seed row — derive from slug)
2. `fx-env-splash` (Medium) — (no seed row — derive from slug)
3. `fx-fantasy-emberrune` (Medium) — (no seed row — derive from slug)
4. `fx-fantasy-featherdrift` (Medium) — (no seed row — derive from slug)

### Sheet RQ-06 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-fantasy-frostshard` (Medium) — (no seed row — derive from slug)
2. `fx-fantasy-holyglow` (Medium) — (no seed row — derive from slug)
3. `fx-fantasy-holyglow-alt` (Medium) — (no seed row — derive from slug)
4. `fx-fantasy-leafburst` (Medium) — (no seed row — derive from slug)

### Sheet RQ-07 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-fantasy-leafburst-alt` (Medium) — (no seed row — derive from slug)
2. `fx-gloom-bonedust` (Medium) — (no seed row — derive from slug)
3. `fx-gloom-vhstear` (Medium) — (no seed row — derive from slug)
4. `fx-gloom-vhstear-alt` (Medium) — (no seed row — derive from slug)

### Sheet RQ-08 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-impact-blunt-star` (Medium) — (no seed row — derive from slug)
2. `fx-impact-crush-shatter` (Medium) — (no seed row — derive from slug)
3. `fx-impact-pierce-glint` (Medium) — (no seed row — derive from slug)
4. `fx-impact-slash-arc` (Medium) — (no seed row — derive from slug)

### Sheet RQ-09 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-impact-slash-heavy` (Medium) — (no seed row — derive from slug)
2. `fx-magic-bolthead` (Medium) — (no seed row — derive from slug)
3. `fx-magic-burstring` (Medium) — (no seed row — derive from slug)
4. `fx-magic-castcircle` (Medium) — (no seed row — derive from slug)

### Sheet RQ-10 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-magic-orbcharge` (Medium) — (no seed row — derive from slug)
2. `fx-magic-sigilflash` (Medium) — (no seed row — derive from slug)
3. `fx-status-bloodspatter` (Medium) — (no seed row — derive from slug)
4. `fx-status-healmotes` (Medium) — (no seed row — derive from slug)

### Sheet RQ-11 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-status-poisonbubble` (Medium) — (no seed row — derive from slug)
2. `fx-status-shieldshimmer` (Medium) — (no seed row — derive from slug)
3. `fx-status-smokepuff` (Medium) — (no seed row — derive from slug)
4. `fx-status-sparkburst` (Medium) — (no seed row — derive from slug)

### Sheet RQ-12 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-status-stunstars` (Medium) — (no seed row — derive from slug)
2. `shared-blood-decal` (Medium) — (no seed row — derive from slug)
3. `shared-cobweb-decal` (Medium) — (no seed row — derive from slug)
4. `shared-crack-decal` (Medium) — (no seed row — derive from slug)

### Sheet RQ-13 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `shared-grime-decal` (Medium) — (no seed row — derive from slug)
2. `shared-moss-decal` (Medium) — (no seed row — derive from slug)
3. `shared-rust-decal` (Medium) — (no seed row — derive from slug)
4. `shared-scorch-decal` (Medium) — (no seed row — derive from slug)

### Sheet RQ-14 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `shared-water-decal` (Medium) — (no seed row — derive from slug)
2. `shared-wear-decal` (Medium) — (no seed row — derive from slug)


## F5 re-dos (18 identities)

Failed files (reason digest):
- `spr-fantasy-adult-blue-dragon-candidate-001.png` — note:pixel-duplicate of F4/shared-blood-decal-candidate-001
- `spr-fantasy-adult-bronze-dragon-candidate-001.png` — style-drift:smooth
- `spr-fantasy-adult-copper-dragon-candidate-001.png` — style-drift:smooth
- `spr-fantasy-adult-gold-dragon-candidate-001.png` — style-drift:smooth; note:pixel-duplicate of F4/shared-grime-decal-candidate-001
- `spr-fantasy-adult-green-dragon-candidate-001.png` — note:pixel-duplicate of F4/shared-crack-decal-candidate-001
- `spr-fantasy-adult-silver-dragon-candidate-001.png` — style-drift:smooth
- `spr-fantasy-adult-white-dragon-candidate-001.png` — note:pixel-duplicate of F4/shared-moss-decal-candidate-001
- `spr-fantasy-ancient-black-dragon-candidate-001.png` — style-drift:photoreal
- `spr-fantasy-ancient-blue-dragon-candidate-001.png` — anatomy:major:tail terminates in two separate tapering tips at bottom-center: left coil ends i
- `spr-fantasy-ancient-green-dragon-candidate-001.png` — style-drift:soft-facet
- `spr-fantasy-ancient-white-dragon-candidate-001.png` — anatomy:major:tail duplicated/mirrored: two separate spiked tail tips converge at bottom cente
- `spr-fantasy-brass-dragon-wyrmling-bronze-dragon-wyrmling-candidate-001.png` — cropped; note:bronze wyrmling's right wing cut off by right image edge (confirmed by border-pi
- …and 6 more (see qa-ledger.json)
