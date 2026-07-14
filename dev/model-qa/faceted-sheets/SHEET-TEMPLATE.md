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

> Render a character sprite sheet as a single image: a horizontal strip of **[N] equal vertical
> cells**, total canvas **[N×887]×1774** (each cell 887×1774, a 4:8 portrait). Solid flat magenta
> **#FF00FF** background in every cell — no gradient, no vignette, no scene, no pedestal or base,
> no cast shadow on the ground, no washed-out pink and no darkened purple: pure #FF00FF to the
> corners. One figure per cell, hard invisible cell boundaries, nothing crossing between cells,
> no shared props. Each figure **fully inside its cell with clear margin on all four sides — the
> complete body, head to toe, weapon tips and wingtips and tail included; nothing may touch or
> clip the image edge.** Consistent scale across cells (heads line up); orthographic-leaning 3/4
> view; every figure in an expressive mid-action pose that captures its essence — mid-lunge,
> mid-cast, braced, snarling — never a T-pose or idle stand.
>
> Art style: **crisp, hard-edged TRIANGULATED low-poly faceting** — the entire surface of every
> figure reads as flat triangular planes, like a faceted 3D sculpture; painterly texture and
> material detail live ON the facet planes, never dissolving them. No smooth organic rendering,
> no photoreal, no pixel-art, no soft/mushy half-faceting — if a face, hair, or fabric area goes
> smooth, the render is off-model.
>
> Tone is **realistic horror dark-fantasy**: grim, weathered, unsettling; muted desaturated
> palette of earth, bone, ash, rust, and shadow with at most one controlled accent color per
> figure — never bright saturated hero-fantasy colors. Proportions are **naturalistic and
> slightly elongated** — adult head-to-body ratio around 1:7 to 1:8, lean gaunt silhouettes,
> long limbs and fingers; monsters read as disturbing and anatomically plausible, not cute or
> heroic. HARD NEGATIVE GATES (any of these is an automatic off-model reject): no chibi or
> oversized heads, no stubby limbs, no oversized cartoon weapons or pauldrons, no
> stylized-MMO/action-RPG cartoon look (nothing resembling World of Warcraft, Torchlight,
> Hearthstone, Fortnite, or mobile-game art), no cute/juvenile/big-eyed faces, no candy
> saturation, no thick outlines, no glossy toy-plastic sheen. Do not imitate any specific
> commercial game's promotional art style either — this is its own grounded horror-naturalism
> expressed through the faceted geometry.
>
> Anatomy is strict: **exactly one tail with exactly one tip** on any tailed creature — no
> forked, mirrored, doubled, or floating tail segments; correct limb counts (wyverns are BIPEDAL
> — two legs plus wings; nagas have no arms; no fifth leg, no third wing); tails and wings
> connect to the body at one continuous, plausible joint. The figures, left to right:
> **[numbered cell list from the batch doc]**

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
