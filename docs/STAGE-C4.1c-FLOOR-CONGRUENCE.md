---
type: system-spec
project: Genesis
status: SPECCED
updated: 2026-07-12
companion: docs/WALL-VOLUMES-PRACTICALS.md
refs: ui-sketches/mock-frames/vq-next-waves/README.md (frame 08 row-101 target)
---

# C4.1c — floor + riser congruence (inner tiers follow the mitered shape flow)

Adam's read on the C4.1a octagon capture (2026-07-12): the outer wall ring is now a clean mitered
octagon, but the **inner floor + tier risers still stairstep** on the raw cell grid — visibly
incongruent (a pointed peak + rectangular notches on the raised-ring / sunken-arena boundary of the
row-101 Grand Octagon). This unit makes the inner floor and risers of shaped rooms share the SAME
mitered (diagonal) / rounded (radial) contour the walls use, so a tiered octagon reads congruent.

**Render-only.** Logical cells, `cellTriangleMap` cell→triangle/tier mapping, tier elevations,
combat geometry, and door placement are all byte-identical. This changes only how the render floor +
riser surfaces are tessellated.

## Root causes (verified anchors, `src/ui/theater-room-mesh.js`, current master)

1. **complexTier floor fallback — :1098-1099.** `const complexTier = rings.length > 1;` then
   `if (complexTier) buildFloorCells(floorBuf, tierCells, ...)`. A tier whose contour is more than one
   ring — an **annular** tier, e.g. the raised perimeter ring *around* the sunken arena — fills its
   floor with `buildFloorCells` (:947, one axis-aligned quad per raw cell = stairstep). The per-ring
   diagonalize/smooth pass (:1113-1130) still runs for that tier's rings, but the floor triangulation
   inside the ring loop is gated `!complexTier` (:1147, :1151), so a complex tier's floor NEVER
   triangulates from the mitered polygon.
2. **Risers are hard run-breaks — `diagonalizeStaircaseRing` :524, run detection ~:540.** The staircase
   scan requires `cur.kind === "wall"` (`if (cur.kind !== "wall" || segLen≠1) { out.push(cur); continue; }`),
   and riser/door segments break a run (:518). A tier boundary traced as **riser** segments therefore
   never chamfers → inner tier edges stay axis-aligned stairstep even where the outer wall is mitered.

(Verified: the row-101 octagon capture scene is `dev/battle-gate/capture-stage-c3-shapes.mjs` scene
`octagon` = "Grand Octagon row 101: sunken arena + raised ring" — a genuine multi-tier room.)

## The fix

### Part 1 — diagonalize riser rings like wall rings

Extend `diagonalizeStaircaseRing` (:524) so a maximal run of unit **riser** segments that share the
same `{loTier, hiTier}` pair AND strictly alternate between two perpendicular unit directions (a real
multi-cell riser staircase) chamfers via `chamferRunCorners` exactly like a wall run — mitering into
its straight riser neighbors, carrying `loTier`/`hiTier` onto every emitted diagonal segment so the
riser QUAD still builds at the correct tier heights (`finishSegment`/the riser meta carry at :280).

- Run qualification: same `kind` (`"wall"` OR `"riser"`), and for risers ALSO same `loTier`+`hiTier`
  (never merge risers spanning different tier pairs). Door segments remain hard breaks.
- `chamferRunCorners` already generalizes — it copies `run[i].tier`; extend it to also copy
  `loTier`/`hiTier` when present so a mitered riser segment keeps its tier pair.
- The wraparound-seam handling (`findDiagonalSafeStart`) and the NO-OP byte-identity guarantee for
  L/T/cross stay intact: a ring with no qualifying wall OR riser run returns unchanged.

### Part 2 — complexTier floors triangulate from the mitered rings (with holes)

For `smoothMode` `"diagonal"` or `"radial"` ONLY, retire the `buildFloorCells` stairstep fallback in
favor of triangulating each tier's floor as a **polygon with holes** built from that tier's
diagonalized/smoothed rings:

- Per tier, classify its rings: the outer boundary ring (positive signed area after `ensureCCW`) is
  the filled region; inner rings are holes (a sunken arena carved out of the raised-ring tier).
  Diagonalize/smooth EACH ring (already per-ring at :1101) before triangulation.
- Triangulate the region-with-holes. Implement a hole-aware path: bridge each inner (mitered) hole
  ring into the outer (mitered) ring (standard hole-bridging: connect mutually-visible vertices,
  splicing the CW hole into the CCW outer loop) then ear-clip via the existing `triangulatePolygon`
  (:632); OR triangulate the annulus by stitching the outer and inner mitered rings directly. Prefer
  hole-bridging so `triangulatePolygon` stays the single triangulator.
- Keep `buildFloorCells` (:947) ONLY for the untagged / no-`smoothShape` default (byte-identical for
  rect rooms — the existing `buildFloorGrid`/`buildFloorCells` paths for `smoothMode === null` are
  untouched). The change is gated on `smoothMode` being diagonal/radial.
- `bevelWidth` inset + door-threshold flush quads must still apply on the mitered rings (the existing
  `insetPolygon` + door-filler logic runs per ring — keep it working for holes too).

### Preserve (hard requirements)

- **cellTriangleMap**: every logical cell center (ALL tiers, including the annular tier and the
  arena) still resolves inside a real containing floor triangle. The mitered contour only moves the
  render boundary; a cell center never falls outside (the miter adds/holds area — verify per the
  c3b containment invariant, extended to tiered/complex rooms).
- **Tier elevations + risers**: each tier's floor stays at its `elevationY`; riser quads still bridge
  the correct `loTier`→`hiTier` heights. Row-101 must still report arena tier −1 (−5ft) and raised
  ring tier +1 (`verify-stage-c-terrain.mjs` stays green).
- **Combat byte-gate**: logical cell grid + tier assignments unchanged.

## Files + functions to touch

1. `src/ui/theater-room-mesh.js` — `diagonalizeStaircaseRing` (:524) + its run scan (Part 1);
   `chamferRunCorners` (:471, carry loTier/hiTier); the tier loop's floor dispatch (:1098-1166,
   Part 2 hole-aware triangulation + gate `buildFloorCells` behind `smoothMode === null`); possibly a
   new `triangulatePolygonWithHoles` helper (bridge holes → `triangulatePolygon`). Update the module
   opts/return doc-block. Add any new exported symbol to `manifest.json` `owns` (`ui.theater-room-mesh`).
2. `dev/verify-floor-congruence.mjs` (new).
3. `dev/verify-room-shell.mjs` / `dev/verify-wall-volumes.mjs` / `dev/verify-stage-c-terrain.mjs` /
   `dev/verify-stage-c3b-circle-smooth.mjs` — update any assertion that pins the OLD stairstep floor
   triangle count for tiered/complex rooms (red-first, comment WHY); do NOT weaken tier-height,
   containment, aperture, or combat-parity assertions.
4. `dev/battle-gate/capture-stage-c3-shapes.mjs` — re-shoot (no code change required).

## Verification (⊗ = red-first)

New `dev/verify-floor-congruence.mjs` (pure, imports `compileRoomShellData`), compiling the row-101
tiered octagon (arena + raised ring — copy the fixture shape from `capture-stage-c3-shapes.mjs`'s
octagon scene / `verify-stage-c-terrain.mjs`):

1. ⊗ **Inner floor mitered** — the annular (complex) tier's floor boundary carries 45° diagonal edges
   congruent with the wall ring (prove: the CURRENT compile's complex-tier floor boundary is
   axis-aligned-only stairstep → red → then green with diagonals).
2. ⊗ **Risers mitered** — the tier-boundary riser segments carry 45° diagonals (prove the CURRENT
   riser ring is axis-aligned-only → red → green).
3. **Congruence** — where an inner tier boundary runs parallel to a wall diagonal, its segments share
   direction (both true 45°), not a stairstep under a diagonal.
4. **Containment** — every logical cell center (all tiers) resolves inside a floor triangle
   (extend the c3b containment check to the tiered/annular room).
5. **Tier heights preserved** — arena tier −1, raised ring tier +1; riser `loTier`/`hiTier` + heights
   unchanged vs a baseline compile.
6. **No-op guarantee** — a rect room (no `smoothShape`) is byte-identical to master (buildFloorCells/
   buildFloorGrid path untouched); an L/T/cross with no qualifying run unchanged.
7. **Determinism** — same cells+opts → byte-identical buffers.

Regression (must stay green): `verify-wall-volumes`, `verify-octagon-miter`, `verify-room-shell`,
`verify-stage-c-terrain` (row 101 tiers), `verify-stage-c3b-circle-smooth`, `verify-stage-c-shapes`,
`verify-stage-c-size`, `python3 build/check-manifest.py` → `RESULT: OK`.

**Capture gate:** re-run `node dev/battle-gate/capture-stage-c3-shapes.mjs`; orchestrator READS
`stage-c3-shapes/octagon.png` — the inner tier boundary + risers now follow the octagon's diagonal
flow, congruent with the mitered walls (no stairstep peak/notch). Confirm rotunda (radial) + L (still
crisp) unregressed.

## Out of scope

- Wall volumes / occlusion / lights (other units). Material/PBR/AO/bloom (Stage E1).
- The non-shaped rect default floor path (`smoothMode === null`) — untouched, byte-identical.
- Radial-riser smoothing beyond what falls out of Part 1's kind-generalization: if `radialSmoothRing`
  needs a separate riser pass for circle tiers and it isn't a trivial symmetric extension, scope that
  to a follow-up and NOTE it (the octagon/diagonal case is the reported bug).

## Decisions (do not re-litigate)

- **Retire `buildFloorCells` for smoothMode diagonal/radial only** — grounds: it is the stairstep
  source; the mitered contour must drive the floor for congruence (Adam, 2026-07-12). Rect default
  keeps it.
- **Risers chamfer per same-tier-pair run** — grounds: a tier boundary is architecturally a wall; the
  45° flow must propagate inward. Same-`{loTier,hiTier}` guard prevents merging unlike risers.
- **Hole-bridging over a new triangulator** — grounds: keep `triangulatePolygon` the single ear-clip;
  bridge holes into the outer loop rather than maintain a second triangulation path.
