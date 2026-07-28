---
type: build-spec
status: BUILT — capture packet dev/clay-captures/cl-f07c-terrain-r2-v001/; visual verdict Adam's
unit: feat/terrain-expression-r2
base: feat/terrain-expression (499ec98d)
authority: Adam's rulings 2026-07-28 on the CL-F07b isolation ladder
---

# TERRAIN-EXPRESSION-R2 — Adam's rulings on the ladder

Verbatim intent, 2026-07-28, on seeing naked / material / all:

> "the standee on the stairs is a perfect fit, except the sprite itself should always be fixed at
> the same angle as the base" · "the medium base not being able to fit everywhere is a real stage
> design issue… There absolutely should be some places where they cant fit, small and tiny creatures
> should get the advantages in those areas and that's by design, but the majority of most of the map
> should still be accessible to medium size creatures… i don't think anywhere it is stated that
> medium creatures need to be able to get around too" · "we might need to extend the base down
> through the floor, so even on hills the base appears to make contact with the full ground, rather
> than just floating or teetering" · "i think we literally can express what FFT does, we just need to
> change our own rules… though the steepest ones look like they should be the max, and maybe on steep
> angled surfaces things like shoves from an advantageous position should get bonuses" · "of the
> three the second one is preferable, though i don't want EVERY single top level plane to overhang…
> specially on cliffsides, but it doesn't make sense on every single terrain surface… the 3rd image
> where every single block has an overhang is absolute overkill" · "i like the idea of having some
> edges where there are little rock bits that maybe a character can climb with a low or auto DC check
> vs the standard" · "including the inclines to the planes themselves helps a little, we just need to
> push the angle variations a bit further"

## R1 — THE SPRITE MATCHES ITS BASE (RULED, reverses the study)

The standee-contract study recommended tilting the plinth while keeping the sprite vertical. **Adam
rules the opposite: the sprite is fixed at the same angle as its base.** A physical miniature on a
sloped base leans with the base; that is the tabletop-of-miniatures doctrine applied honestly.

Move the tilt so base and sprite share one transform. `standeeWrap` currently owns sprite tilt and the
outer group's `.x` stays reserved for fall-death — respect both; do not fight the billboard yaw, which
must keep tracking the camera (R1 changes PITCH/ROLL, not yaw). Re-prove at free yaw across every
envelope and every surface class. The existing `verify-bw2-2` 21b rewrite measures the base child's
world-up; extend it to assert base and sprite world-up now AGREE, red-first.

## R2 — THE BASE SKIRT (RULED)

Extend the base DOWN through the surface so it always reads as making full contact, never floating or
teetering on a hill. A skirt below the contact plane, hidden inside the terrain, deep enough that no
camera in the governed range sees daylight under any corner at the steepest legal grade. Numbers to
derive and record, not guess. Purely cosmetic: it may not change the contact Y, the walkable census,
or any gate's contact measurement (the nearest-contact gap keeps measuring the CONTACT plane, not the
skirt).

## R3 — OVERHANG NEEDS RULES (RULED — the ladder's third rung is overkill)

Adam prefers the MATERIAL rung. Universal overhang is rejected: *"i don't want EVERY single top level
plane to overhang… the 3rd image where every single block has an overhang is absolute overkill."*
Overhang stays in the kit as a LICENSED VARIANT, biased to cliffsides and tall faces, not applied to
every cell. Author the placement rule and state it: what earns an overhang (face height, exposure,
material family, realm), what forbids it, and the cap on how much of one scene may carry it. Same
treatment for A7 face banding, which Adam's frames show reading as protruding rails — **drop it to a
material value change, not a projecting ledge** (0.022 wu proud is what catches the wrong highlight).

## R4 — PUSH THE ANGLE VARIATION (RULED — change our own rules)

*"i think we literally can express what FFT does, we just need to change our own rules… none of the
angles look particularly impossible… though the steepest ones look like they should be the max."*

This is authorisation to move past the single 26.565° step. Build a graded set of walkable surface
angles up to a declared maximum, with the STEEPEST equal to the current legal ceiling (the 30° cap is
the natural reading of "the steepest ones look like they should be the max" — propose it, do not
assume it). The render-only shallow grade from R1's build (18.004°) is the existing precedent; extend
it into a real ladder of grades. State plainly, per grade, whether it is render-only or logical: a
logical grade CHANGES walkability and is a gameplay change requiring Adam's sign-off; a render-only
grade is cosmetic. Prefer building the full expressive ladder render-only first, and bring the
logical proposal to Adam with pictures.

## R5 — THE MEDIUM-ACCESSIBILITY LAW (NEW LAW, the real stage-design gap)

Adam: pockets a Medium cannot reach are GOOD and deliberate — they are where Small and Tiny earn
their advantage — but *"the majority of most of the map should still be accessible to medium size
creatures"*, and no law says so today.

1. **Verify the existing large-creature law first.** Adam believes a map containing a Large creature
   is already generated to fit it. FIND that law (grep the specs/engine) and quote it, or report
   honestly that it does not exist. Do not assume.
2. **Author the Medium floor** as a countable generation law: a defined minimum share of walkable
   cells must admit the Medium protected disc (0.831 wu; 0.932 for the worst-case cap), and the
   Small/Tiny-only remainder is legal, bounded, and desirable. Derive the threshold from real census
   data across the terrain scenes rather than picking a round number; mark the exact figure PROPOSED
   for Adam.
3. **Gate it.** A harness that fails a generated field violating the floor, red-first proven. Report
   the measured Medium-accessible share of every existing CL-F07 scene — that number is itself
   evidence Adam has never had.

## R6 — CLIMBABLE EDGE BITS (RULED as a direction to explore)

*"some edges where there are little rock bits that maybe a character can climb with a low or auto DC
check vs the standard."* `TERRAIN_GRID_LAW.climbDcBands` is already `[12, 15, 17]`. Add an EASED band
(auto or low DC) earned by a face that carries climbable relief, and express it visually so the player
can READ which faces are the easy ones — the affordance must be visible, not hidden in a tooltip.
This is a gameplay change: spec it, build the visual, and bring the DC values to Adam as PROPOSED.

## R7 — STEEP-SURFACE SHOVE BONUS (DESIGN NOTE — not built here)

*"maybe on steep angled surfaces things like shoves from an advantageous position should get
bonuses."* Record in the combat/difficulty specs as a proposal with a suggested shape; do NOT build
it in this pass. Terrain owes it the fact it needs — the surface grade at a cell — which R4 provides.

## Gates

Everything from the R1 build holds: walk fingerprint byte-identical across rungs (this pass adds
grades — a RENDER-ONLY grade must not move it, and that is now a load-bearing assertion); coverage
≥99%; nearest-contact gap per envelope at free yaw; determinism; `verify-terrain-bench` ≥73/0;
`verify-terrain-expression` ≥69/0; `verify-clay-camera-resize` ≥10/0; check-manifest OK.
New: base/sprite world-up agreement (R1), skirt-invisibility at the steepest grade (R2), overhang
placement obeys its stated rule and its scene cap (R3), grade ladder renders every declared angle
(R4), Medium-accessibility floor (R5), eased-climb band reads visually (R6).

Visual verdicts remain Adam's. No frame is declared good.

## BUILT (2026-07-28) — where each ruling landed

| ruling | built | proved by |
|---|---|---|
| R1 sprite matches base | `theater-sprites.js` face(): `wrap = R_plane · R_cameraPitch` | `verify-bw2-2` 21b-R1 (teeth in-process) · `verify-terrain-standee-r2` R1a-f |
| R2 base skirt | `theater-standee-mount.js` `buildInteriorBaseSkirt` (opt-in child mesh) · `TERRAIN_BASE_SKIRT` | `verify-terrain-expression-r2` R2a-f · `verify-terrain-standee-r2` R2a-e (`?terrainskirt=0` red) |
| R3 overhang licence + A7 flush | `TERRAIN_OVERHANG_LAW` / `terrainOverhangCensus` · three render modes | `verify-terrain-expression-r2` R3a-k · `verify-terrain-standee-r2` R3a-f |
| R4 grade ladder + PROPOSED max | `TERRAIN_GRADE_LADDER` (g0-g4) · plane-magnitude ceiling | `verify-terrain-expression-r2` R4a-k · `verify-terrain-standee-r2` R4a-d |
| R5 Medium floor | `TERRAIN_MEDIUM_ACCESS_LAW` / `terrainMediumAccessCensus` | `verify-terrain-expression-r2` R5a-i (three teeth) |
| R6 eased climb | `TERRAIN_CLIMB_EASED` / `terrainFaceClimb` + `clayTerrainClimbBits` | `verify-terrain-expression-r2` R6a-h · `verify-terrain-standee-r2` R6a-b |
| R7 shove bonus | NOT BUILT — recorded as a PROPOSED section in `docs/COMBAT.md` | n/a |

Decisions, grounds, every measured number and the eyes-on concerns are in `docs/DESIGN.md`
(2026-07-28, "Terrain expression R2"). Adam still rules the look; no frame is declared good.
