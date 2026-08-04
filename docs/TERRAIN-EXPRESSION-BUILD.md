---
type: build-spec
status: SPECCED
unit: feat/terrain-expression
base: feat/terrain-bench-r1 (c8702e12)
research: transferred FFT/TS corpus · STANDEE-CONTRACT-NONFLAT.md · GRID-BREAKING-STUDY.md
---

# TERRAIN-EXPRESSION-BUILD — getting off the chonky blocks, with standee proof

Adam, 2026-07-28, on seeing the fixed CL-F07a frames: *"those chunks actually look pretty good and
it's a decent start… not every surface is flat, some have inclines… some are split into tris so that
a single piece of a grid might have a varied angle… we just need a bit more expression to get us a
little further from minecraft… perhaps the corners of each grid block can be expressed by a 1/9
sized block… let's explore some options with standee proof."* And: *"we gotta have a world that isn't
just big chonky blocks, we need some subtlety, even if it's just dressing or trickery."*

## §0 THE PARTITION — why this is mostly a dressing build

Three independent measurements say the walkable top of a cell must stay almost flat:

1. **The standee protected area is a disc of 0.932 wu — 93% of the cell.** The plinth is
   camera-facing, so its 0.856 × 0.369 rectangle sweeps a circle of its own diagonal. A walkable
   cell has **6.8% slack**. (XCOM authors cover props at 80 of 96 units and keeps 16.7% — we are
   tighter than XCOM on the floor.)
2. **The engine's own walkable-relief ceiling is 2.32 inches per cell** —
   `TERRAIN_WALK_NOISE_BUDGET_H.perCellH` = 0.0774 quanta, derived as half the sub-quantum headroom
   the 30° cap leaves over the 1h step. **Guarded faces are exempt and spend full amplitude.**
3. **FFT keeps walkable tops flat or gently graded**; its expression lives at the edges and on the
   faces.

**THE PARTITION: shape belongs on the faces, dressing belongs on the floor, and the arris carries
both.** Every unit below obeys it. Anything that changes a walkable cell, a cover value, occupancy,
or LOS is a GAMEPLAY change and is out of scope here — it goes to Adam as a proposal, never into a
dressing rung.

## §1 Prerequisites — two defects that would make any standee proof dishonest

**P1 — terrain witnesses never billboard.** The `face()` sweep walks 2 levels; the terrain witness
sits 3 deep, so every terrain proof so far has tested only the easy axis-aligned yaw — the exact
case that hides the stair-overhang problem. Fix the traversal depth (do not special-case terrain).
Red-first: a check that a terrain witness's yaw tracks the camera like every other figure.

**P2 — two gates would stay green on the failure picture.** `WITNESS_MAX_GAP` measures the origin
gap, which is 0.096 by construction and cannot move — it would pass on a visibly floating plinth.
`verify-bw2-2` group 21b asserts `fig.rotation.x === 0`, which the slope recommendation below would
slip past while making the assertion meaningless. **Rewrite both to measure the thing they name**
(nearest-contact gap under the plinth footprint; and an explicit statement of which rotation channel
owns tilt). Do not extend them — a gate that cannot fail is not a gate (the backdrop-luma lesson).

## §2 Rung A — the cheap dozen (no geometry, no gameplay change)

Each device below is authored, and each must be independently switchable so the proof can isolate it.
Bins are `ART-DIRECTION-CANON`'s three: material / decal-paint / prop.

- **A1 · Per-instance jitter** (code). Sub-quantum sink, tilt and yaw variation per placed instance,
  seeded and deterministic. Ranked the cheapest highest-effect device in the study: *"six matching
  ruins with the same broken corner are still six matching pieces"* — the defect is identical posing,
  not repetition. Jitter must stay inside the noise budget on walkable cells and may spend freely on
  faces and props.
- **A2 · Material roll-over at the arris** (material). The top material wraps and droops over the
  top edge so the hard two-tone cube line never exists. **The #1 Minecraft-breaking device in the FFT
  corpus** — documented in the transferred corpus routed by
  `docs/FFT-TS-RESEARCH-EXTERNAL.md`.
- **A3 · The arris chamfer** (geometry, but free). A uniform ~1/8-cell chamfer that stays **strictly
  below the top plane**: zero intrusion on the standee disc at any size, zero change to the walkable
  census. This is Adam's 1/9-corner instinct, relocated out of the top plane — where it costs
  nothing. (A corner block that raises or lowers a cell top is a GAMEPLAY change: it shrinks the
  usable top to 0.333 wu while still reporting `standable: true` — a green lie. Out of scope.)
- **A4 · The two-frequency joint** (material). A fine texture unit far smaller than the cell, plus
  **one coarse course at the cell pitch**, so the ruled tactical overlay lands on a mortar line
  instead of on nothing. This is the Dwarven Forge trick — hide the grid by making the grid diegetic.
- **A5 · Edge-biased occluders** (prop). Placement law: bias scatter toward risers, arrises and
  concave corners so props straddle cell boundaries. **Break the grid with something that is not on
  the grid.** Placement may never occupy the standee disc of a walkable cell.
- **A6 · Cavity-darken + curvature-lighten** (material). Wash and drybrush translated: darken
  cavities, lighten curvature, both driven off the height channel the engine already exports.
- **A7 · Seam and face dressing** (prop/material). The XCOM move — the volume behind a thin face is
  free, so fill it where neither cover nor pathing is generating.

## §3 Rung B — the standee contract, proved

- **B1 · Slope.** Tilt the plinth to the cell's top plane; keep the sprite vertical. The base child's
  `rotation.x/.z` are free; the outer group's `.x` stays reserved for fall-death; sprite tilt stays on
  `standeeWrap`. Riders: the contact pool tilts with it, and the field must publish **a plane per
  cell**, not a scalar height. Reuse the existing 26.565° `shallow-ramp` atom, which has never
  carried a figure.
- **B2 · Stairs, corrected.** FFT's cell-scale stair is tread = 1 cell, riser = 0.5 cell = **exactly
  one Genesis quantum**, and the **nosing overhang** is what stops it reading as stacked cubes. Ours
  currently overhangs by −0.018 (inverted) and clears the standee by 0.002 only because of an
  unrelated shadow-slit inflation. Give the tread a real nosing and re-prove: a standee on a tread at
  **free yaw**, not locked yaw.
- **B3 · Envelopes.** Small, Medium and Large on the same slope, stair and chamfered cell.
- **B4 · Tri-split, honestly.** A Medium cannot stand in a half-cell triangle at any yaw (inscribed
  disc 0.586 vs 0.831 needed). Build it as **sub-quantum visual relief over one declared stand
  plane** — the cell keeps a single walkable height; only the render folds. Prove a standee stands
  correctly on a folded cell.

## §4 Rung C — the one real geometry question, built as render-only

FFT's common walkable grade measures **≈18°**; its steepest ≈31°. Genesis's only legal slope is
**26.565°** (1 quantum / 1 cell), and FFT quantizes in halves — its own UI reads *"Height 7.5"*. An
18° grade over a 5-ft cell is 1.62 ft = **0.65 of a quantum**: the grade the corpus uses most is one
we cannot currently say.

Build it **render-only**: the logical grid, walkable census, cover and LOS are computed from the
existing integer heightfield and DO NOT MOVE; only the rendered top plane folds to the shallower
grade. Precedent: `STAGE-C.md` C3b, *"render-only, the logical grid never moves."* Whether Genesis
adopts a true half-quantum is a **founder decision** and is explicitly NOT taken here — this rung
exists so Adam can see the shallow grade beside the 26.565° step and rule.

## §5 The proof — bin isolation, six captures plus controls

A ladder inside `CL-F07a`, same seed, same camera, same layout throughout:
**naked → +material → +decal → +prop → all → jitter-disabled negative control.**
Each at the fixed production camera and the 72° strategic read; plus dark; plus one changed seed;
plus the 16-cell hostile tray.

**The back-end gate (mine to prove):** across all six rungs the **walkable census, cover set,
occupancy and LOS must be byte-identical**. That is what makes this provably a dressing pass and not
a silent gameplay change. Plus: the round-4 coverage gate stays ≥99% per scene; every standee
records nearest-contact gap under its footprint (not origin gap); zero base-corner penetration; zero
airborne plinths; determinism across two page loads.

**The front-end gate is Adam's**, as always. No frame is declared good here.

## §6 Out of scope (name it, do not do it)

Sub-cell corner blocks that move a cell top · true half-quantum heights · non-rectilinear footprints ·
undercuts and floor-over-floor (the chassis is a single-valued heightfield) · live destruction ·
any change to walkable cells, cover, occupancy or LOS.
