STATUS: EVIDENCE DRAFT — CODEX ADVERSARIAL DISPOSITION RECORDED IN `synthesis.md` (2026-07-28)

# Lane 3 — FFT cohort comparison: how Final Fantasy Tactics handles scale

type: research-lane
date: 2026-07-27
status: COMPLETE (reproducibility caveat below)
corpus: `genesis/Reference/FFT-Guard-Post-Study/study-archive/maps/five-angle/`
(121 map ids × 5 views = 605 GIFs), read **in place**, read-only. Nothing copied, nothing
committed, no contact sheet derived — the same posture Lane 4 of the Lair Study used.

## Binding boundary restated

This is comparative map morphology and grammar induction, per the catalog's FFT BOUNDARY.
No FFT layout is reproduced, transcribed, or converted. The output is *relations*, and
several are stated as anti-rules precisely so nobody mistakes them for a map. No FFT mesh,
texture, map, or screenshot is or becomes a Genesis asset.

## Reproducibility caveat — read this before believing the lane

The five-angle corpus is **not in this worktree and not in the repository**. It exists only
in the untracked local evidence archive under the root repo. The catalog's import audit says
so explicitly ("NOT imported — copyrighted game screenshots"). Consequently:

- another agent cannot re-run this lane from `Genesis-sites` alone;
- the findings below are checkable only on a machine that has the local archive;
- this is a **declared reproducibility gap**, and it is one of the reasons Site 11's
  `RESEARCHED` gate is proposed at `PARTIAL`.

Map ids were resolved against the name table in the archive's own
`tools/heretic/src/map.c` (lines 116–245), the same prior the Lair Study verified
empirically. Views: `_0` is the orthographic top-down plan; `_1`–`_4` are the four
isometric rotations.

## Maps opened

`55_0`, `55_1` (Graveyard of Airships) · `70_1` (Nelveska Temple) · `73_1` (Inside of
Windmill Shed) · `38_1` (Goug Machine City) · `3_1` (Hall of St. Murond Temple).

Six frames, chosen because the name table flags them as the corpus's scale-relevant
candidates. Two of the six turned out **not** to be scale cases at all, which is itself a
finding.

## The headline finding — FFT almost never makes the PLAYFIELD giant

Across the whole cohort, one pattern holds and it is the most important thing this lane
produced:

> **FFT achieves the sense of another scale by making the surrounding mass and the vertical
> dressing oversized while keeping the walkable cells at ordinary standee scale.**

`3_1` **Hall of St. Murond Temple** is the clean demonstration. [read] The frame shows a
grand interior: tall lancet windows, long hanging banners, statuary flanking the space, a
heavy stepped stone floor with layered rugs and runners. Every *vertical* element is
exaggerated — the windows run most of the wall, the banners hang far above head height. But
the floor is an entirely ordinary tactical field of standee-sized cells with a couple of
low steps. The grandeur is in the envelope, and the envelope is not walkable.

`38_1` **Goug Machine City** [read] turned out to be a dense stack of ordinary half-timbered
houses with windmill vanes on the roofs — a town map. It is named for machines and contains
none at scale. Recorded as a negative result so the classification stays checkable.

## The two genuine exceptions, and what they cost

FFT breaks its own pattern exactly twice in this cohort, and both times the giant object
*becomes the floor*.

### `55` Graveyard of Airships — the object IS the map

[read `55_1`] The isometric view shows a wrecked airship: verdigris-green hull plates form
the sides and the map's entire boundary; the walkable field is the vessel's wooden deck; and
three broken masts or spars rise from the deck at angles, with what reads as a short
stair/ladder rung set on one spar. Rigging hangs in loose ropes over the hull edge.

[read `55_0`] The plan view confirms it: the footprint is a lens/almond shape — a hull in
plan — filled with plank grid, with the masts crossing the field as diagonal bars.

Restated as real-world construction: the tactical field is a **deck**. Its boundary is the
gunwale. Its cover and elevation vocabulary is the vessel's own structure — masts, spars,
hatch coamings — not architecture placed on top.

This is the closest FFT gets to Genesis's Mode C/D, and the lesson is precise: when the
giant object becomes the map, **you inherit its vocabulary and stop using the building kit
entirely.** There are no walls, doors, roofs, or stairs on that map because a hull does not
have them.

### `70` Nelveska Temple — megalithic blocks as terrain steps

[read `70_1`] A stack of massive rectangular stone blocks forming a ruined temple mass,
with free-standing columns on a grass apron in front and rubble scattered at the base. The
blocks are large relative to the standee scale: the playable surface is reached by treating
the blocks themselves as steps and terraces.

Restated as real-world construction: this is cyclopean masonry as *tactical terrain*. The
block is simultaneously the wall, the step, and the cover. The apron of ordinary ground in
front exists to give the player somewhere to stand and read the mass before committing.

This is FFT's Mode A, and the lesson is that oversize masonry needs a **normal-scale
approach apron** or the player cannot judge it.

## The third case — a big object inside a small room

[read `73_1`] **Inside of Windmill Shed** is a modest stone-and-timber interior whose entire
centre is occupied by a large wooden mill machine — gear, axle, and frame — standing perhaps
three standees tall. Crates and loose planks line the walls. A single shaft of light falls
from a barred window onto the floor.

Restated as real-world construction: the room is human-scale; its contents are not. The
machine's frame reaches the ceiling, its footprint eats the middle of the floor, and the
walkable space is the ring left over.

**This is the cheapest mixed-scale composition in the entire cohort** — one oversized object
in an ordinary room, producing a doughnut-shaped playfield with sightline breaks and two
ways around. It costs one prop and no new geometry. Genesis should keep it as the bottom
rung of the ladder.

## Cohort classification

| id | name | scale case? | what it contributes |
|---|---|---|---|
| 55 | Graveyard of Airships | **yes — object as map** | giant object supplies the entire vocabulary; building kit stands down |
| 70 | Nelveska Temple | **yes — oversize mass as terrain** | block-as-step-as-cover; needs a normal-scale approach apron |
| 73 | Inside of Windmill Shed | **yes — oversize object in ordinary room** | the one-prop mixed-scale composition; doughnut playfield |
| 3 | Hall of St. Murond Temple | no — tall envelope only | scale carried by unwalkable vertical dressing |
| 38 | Goug Machine City | no | negative result; ordinary town stack |
| 28/29/30 | Colliery Underground | no (Site 5's cohort) | listed for boundary clarity, not opened this pass |

## Anti-rules for Genesis — stated as anti-rules on purpose

1. **Do not build a giant-cell grid.** FFT never does. Every walkable cell in the corpus is
   standee-scaled; scale is expressed through what surrounds the cells. Genesis's 5-ft cell
   stays 5 ft in Site 11.
2. **Do not scale the whole kit up together.** `70` works because ordinary columns and
   ordinary grass sit beside the oversized blocks. If everything is 2×, nothing is 2× —
   the frame just reads as a normal building further away. **Site 11's `2×` piece variants
   are only legible next to unscaled pieces.** This directly qualifies the STRUCTURE-KIT
   matrix's Site-11 line.
3. **Do not put the scale in the ceiling and call it done.** `3` is beautiful and is *not*
   a Site 11 map, because none of its scale is reachable. If the oversize is not something
   the player can stand on, climb, hide behind, or be blocked by, it is dressing.
4. **Do not mix the object-as-map mode with the building kit.** `55` has no doors because a
   deck has no doors. A Genesis carcass-hall that grows a doorframe has lost the mode.

## What FFT does NOT answer

- **No hoard terrain anywhere in the cohort.** FFT has no granular-mass floor. Genesis is
  on its own for that, which is why Lane 1 went to grain engineering instead.
- **No two-aperture building.** FFT has no case of a room with a big-body door and a
  small-body door. The Hampi finding has no FFT counterpart, so the aperture pair is a
  Genesis-original mechanism with a historical, not a ludic, precedent.
- **No simultaneous two-body-class play.** In every frame the giant thing is scenery or
  boss-adjacent; the map never asks a large body and a small body to move through the same
  space under different rules at the same time. That is precisely the gap Site 11 exists to
  fill — and it means the FFT cohort validates Site 11's *look* but cannot validate its
  *mechanism*.
