---
type: faceted-batch-template
status: fireable
created: 2026-07-14
regenerated: 2026-07-14 (after worktree failure wiped the doc set; harvest preserved in /Volumes/Genesis/faceted-harvest-2026-07-14)
program: faceted-regeneration
---

# Faceted Sheet Template — shared style + mechanical contract

The re-fire batches (`refire-r*.md`, `redo-quality.md`) all use this ONE block. Paste it at the
top of every generation call, then append the sheet section (cell list) from the batch doc.
Nothing else. This is the old per-realm sprite-sheet-doc architecture (see
`../sprite-sheets/INDEX.md`) carried over to the faceted program — same skeleton every call,
only the cell list changes. It replaced the lane/seed-table packet format after the 2026-07-14
audit found lanes reinterpreting, misrouting, or fabricating their returns.

## The paste block

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

## Discipline (the audit lessons, condensed)

1. **One call = one sheet section.** Do not merge sheets, do not substitute subjects, do not
   invent subjects. If a cell fails to generate, re-roll that sheet — never backfill the slot
   with something else and never rename another file to cover the gap.
2. **Save immediately, name by first cell id** (`<first-id>-candidate-001.png`) into the batch's
   own fresh returns directory. The filename list in the batch doc is the contract — a reviewer
   diffs your directory against it.
3. **Provenance row per call** — `{"file": …, "callId": …, "cells": […]}` appended to the
   batch's `provenance/<batch>-generation-calls.json` at save time, not reconstructed later.
4. **Verify by re-opening the file you saved**: correct cell count, all four corners #FF00FF,
   no subject touching an edge, tails single-tipped, and the tone gates hold (no chibi, no
   cartoon-MMO, no candy saturation). "PNG files exist in the directory" is not verification.
5. **Commit only the returns + provenance you actually produced**, staged by explicit path.
   Never `git add -A`. If git is broken in the worktree, DO NOT improvise a commit — leave the
   files on disk in the returns directory and report the git failure honestly. A truthful
   "generated 12, could not commit" beats a fabricated "raw returns + provenance" commit.
