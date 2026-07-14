---
type: system-spec
project: Genesis
status: SPECCED — 2026-07-14 (Fable); pulled forward from P3-3 (sprite-independent, runs while P3-2 waits on QA)
governed_by: GRAPHICS-CONVERGENCE-CHARTER.md
composes: PHASE-3-WAVE-PLAN.md (P3-3 AgX)
audience: Sonnet executor (singleton)
---

# P3-3a — AgX filmic tone-curve into the grade pass

The render currently has **no tone-mapping curve** (`theater-boot.js:~8032`: "no renderer.toneMapping
set anywhere") — the grade pass does color work but never a filmic shoulder/toe, so highlights clip
and saturated lights blow out. Port the **AgX** tone-mapping curve into `makeGradePass` so the frame
reads "shot on film" instead of "rendered." Sprite-independent, post-process only — preserves the
protected walk/table core (Charter §protected: no geometry/state/roll touched).

## Decision (do not re-litigate)
Port the AgX curve as **verbatim GLSL from three r166's `tonemapping_pars_fragment.glsl.js`** (the
`AgXToneMapping` implementation — the AgX inset/outset matrices + the 6th-order `agxDefaultContrast`
polynomial + the **r161 gamut-mapping fix**). Apply it inside the grade pass fragment shader
(`makeGradePass`, `theater-boot.js:4198`) at the correct point: after exposure/input, as the tone map
before the final look/grade math (match how a filmic pipeline orders exposure → tonemap → grade).
Land it **behind a flag, default OFF (byte-identical)** — a global look change never flips without
Adam's taste gate.

### Sourcing the GLSL
If the vendored `three` is Read-restricted, fetch the exact source: `npm i three@0.166` in a scratch
dir and copy `AgXToneMapping` verbatim from `node_modules/three/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js`.
Do NOT hand-approximate the curve — it must be the canonical AgX with the r161 gamut fix. Cite the
three revision you copied from in a comment.

## Flag
`GRADE_TONEMAP` — a module-level `const` in `theater-boot.js`, values `"none"` (default, current look,
byte-identical) | `"agx"`. `makeGradePass` branches on it (compile the AgX path into the shader only
when `"agx"`, or a uniform-gated `if` — either is fine as long as `"none"` reproduces today's output
exactly). Mirrors the `ROOM_SHELL_POLYGON_KERNEL` / `ROOM_PLACE_DISTRIBUTE` staging discipline.

## Files
- EDIT `src/ui/theater-boot.js` — `makeGradePass` (:4198): add the AgX GLSL + the `GRADE_TONEMAP`
  branch. Named const for the flag; comment citing the three revision.
- NEW `dev/battle-gate/agx/capture-agx-ab.mjs` — the A/B capture harness (model on
  `dev/capture-oss-integrated.mjs`). Re-uses the **P3-1e eyeball fixtures** (tiered / aperture /
  dressed rooms) AND a loop-gate room as the A/B surface — captures each scene with `GRADE_TONEMAP`
  `"none"` vs `"agx"` at the SAME scene/camera/light/crop (differ ONLY by the flag). Output pairs
  under `dev/battle-gate/agx/`.
- NEW harness `dev/verify-agx-tonecurve.mjs`.

## Verification
- ⊗ RED FIRST: with `GRADE_TONEMAP="agx"`, the grade pass output for a bright/clipping input is
  measurably tone-mapped (highlight value rolled off vs raw) — assert a known bright input maps below
  1.0 with a shoulder; fails with the flag `"none"` (linear/clipped), passes with `"agx"`.
- Flag OFF (default) ⇒ grade output **byte-identical** to current master for a fixed input (prove it).
- No regressions: `dev/verify-theater-shot.mjs`, `dev/verify-dungeon-interior.mjs`, any existing
  grade/render harness, `check-manifest.py` (RESULT: OK).
- Visual A/B: capture the fixtures none-vs-agx, READ your own captures, and describe the difference
  (highlights held, midtones, saturation) per scene — this is Adam's taste-gate set.

## Out of scope
Flipping `GRADE_TONEMAP` to default `"agx"` (Adam's taste call after the A/B); the `tony-mc-mapface`
comparison LUT (optional — add only if trivial, else note as a follow-up); per-realm grade retuning;
any geometry / state / sprite / registry change; `renderer.toneMapping` (do it in the grade pass, not
the renderer, to stay inside the existing pipeline).
