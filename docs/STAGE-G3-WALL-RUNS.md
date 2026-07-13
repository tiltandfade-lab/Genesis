---
type: system-spec
project: Genesis
status: SPECCED
updated: 2026-07-13
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
companion: GRAPHICS-CONVERGENCE-PLAN.md, GEOMETRY-OSS-INTEGRATION.md (§8 wall law, §17.6 G3)
ruling_by: GPT 5.6 SOL (2026-07-13), adopted by Adam
supersedes_baseline: the C4.1a bespoke per-segment wall miter (theater-room-mesh.js) — the R1 four-path bakeoff P0 baseline
---

# G3 — aperture-delimited-run wall offsetting (retire the bespoke miter, correctly)

## The ruling (SOL, adopted by Adam — do not re-litigate)

**Retire the bespoke per-segment miter, but ONLY when the aperture-aware Strategy-A replacement is
ready. Do NOT ship the door-free/door-bearing split as the lasting architecture.**

The R1 bakeoff measured a real **~0.31u (wallThickness·√2) gap at ordinary 90° convex corners** in the
current per-segment outer-face construction (`outerA = innerA - n·wallThickness`, computed independently
per segment, no cross-segment miter). SOL confirmed this gap is **visible, not subpixel**, and that the
caps do NOT conceal it:

- the top cap expands only along each segment's normal, not beyond its endpoints along the tangent;
- the footing follows the same independent per-segment construction;
- so stem, cap, AND footing all inherit the unjoined outer corner;
- at ~⅓ of a gameplay cell it reads as dark wedges / broken silhouettes at exposed outer corners
  (lighting masks some instances but not the defect).

**Incorrect comment to fix:** `src/ui/theater-room-mesh.js:904` claims the construction yields "never a
gap (…overlap is invisible…)". The measured construction produces gaps at ordinary convex corners.
Correct the comment to reflect reality as part of this unit.

## The authorized G3 design — Strategy A *per aperture-delimited run*

NOT an A/B fallback hybrid. Strategy B contributes only the *idea* of explicit source/run ownership;
its geometry must not survive (a single-segment butt offset reproduces the existing gap exactly).

1. Split the boundary into **maximal contiguous solid-wall runs**, with doors / open edges as **hard
   breaks**.
2. **Offset each complete run with Clipper2** (`clipper2-ts`, via the PolygonKernel adapter seam once
   G1 lands; CLIPPER_SCALE integer quantization is mandatory — sub-1.0 float deltas silently no-op) so
   every interior corner *within* that run receives a true joined miter (miter for ordinary corners
   under a strict miter limit; bevel for acute/unstable; round only where a roll licenses a curve;
   butt/square where a run terminates at an aperture).
3. Give run endpoints explicit aperture semantics: **butt/square jamb termination**, with **no attempt
   to bridge the opening**.
4. **Preserve source provenance** from the original inner segments and run intervals — carry ownership
   forward from the canonical inner segments, NOT by asking projected outer edges to rediscover
   ownership (that's the door-provenance regression the whole-ring Strategy A showed, 33–60% near doors).
5. Build the **stem, upper, cap, footing, and trim from the same run contour** (one offset contour per
   run drives all bands — no independent per-segment outer faces anywhere).

## Sequencing (SOL, load-bearing)

- **Retain the current bespoke wall extrusion until the run-based implementation passes.** Build the new
  path behind the `legacy|oss-compare|oss` switch (per GEOMETRY-OSS-INTEGRATION §15); `oss-compare`
  computes both + emits parity diagnostics, renders legacy. **Never flip the default** until the gate
  below is green.
- **Retire the bespoke miter across BOTH door-free and door-bearing walls at once**, only once the
  run-based implementation achieves **100% source provenance + zero unintended joins**. There is no
  interim door-free/door-bearing production split.

## Acceptance gate (all required; captures READ by the orchestrator)

Fixtures: ordinary 90° corners · acute corners · octagon/chamfer runs · centered doors · **two
apertures with a narrow pier** · full-width open edges · visible-upper on AND off · neutral-lit
**outside-low** captures.

Checks:
- 100% of outer-wall corners *within a run* are true joined miters (zero gaps, zero unintended joins/
  overlaps); measure the outer-corner gap → must be 0 within epsilon (vs the ~0.31u legacy baseline).
- **Cap continuity and footing continuity inspected SEPARATELY** — not only the stem outer face. Each
  must follow the same run contour with no inherited corner gap.
- 100% source/aperture provenance preserved: every emitted wall run maps to its canonical inner
  segments + aperture intervals; door jambs terminate butt/square; no opening bridged.
- Mechanics/collision/apertures/mount slots read the logical full segment (byte-identical); render-only.
- C4.1b upper-occlusion + E0 practicals harnesses stay green; upper on/off both correct.
- Parity diagnostics (oss-compare) recorded; the geometry gate + pixelmatch wall/stem + cap/footing
  region masks (R4) pass on the reference env.

## Out of scope

- Floors (G2, polygon-clipping + Earcut — approved separately).
- Flipping the default to `oss` (a later promotion wave after this gate + a stabilization hold).
- Independent-riser dynamic raise/lower (parked for Codex's riser research).
