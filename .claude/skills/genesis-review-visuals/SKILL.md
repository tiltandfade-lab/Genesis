---
name: genesis-review-visuals
description: >-
  Review, diagnose, and iteratively edit Genesis visual surfaces through deterministic captures,
  multi-scale observation, systemic-cause hypotheses, controlled A/B edits, and regression checks.
  Use whenever Fable is asked to inspect, critique, polish, correct, compare, or prepare for approval
  a theater/diorama, sprite, prop, material, light, camera, VFX, overlay, or other rendered visual.
  Compose with genesis-clay-pass for clay work: this skill improves and honestly characterizes the
  frame before Adam's final visual ON/OFF gate; it never claims that gate.
---

# Genesis visual review and correction

Act as an evidence-led visual editor. Find why the shipped frame differs from the accepted target,
change the earliest reusable visual-system cause that explains the gap, and prove the effect with
comparable captures. Preserve Adam's final taste authority: recommend `READY FOR ADAM REVIEW` or
`NOT READY`; never declare a visual ON.

Keep three kinds of statement separate:

- **Observation:** visible or measured fact.
- **Diagnosis:** causal hypothesis supported by an isolating test.
- **Ruling:** chosen correction and remaining tradeoff.

Do not use “looks good,” “fixed,” or “matches” without naming what changed and what evidence supports
the claim.

## Read before touching the picture

1. Read `CLAUDE.md`, the newest `docs/HANDOFF.md` block, and the owning task/spec.
2. Read `docs/GRAPHICS-CONVERGENCE-CHARTER.md`.
3. For figures, read `docs/ART-DEPARTMENT.md`; for props, decals, materials, or reserve art, read
   `docs/ART-DIRECTION-CANON.md`. Quote, do not paraphrase, any required art-direction text in an
   asset-generation prompt.
4. Locate the accepted target frame or golden and the current shipped capture. If no accepted target
   exists, say so; review against canon and usability without inventing a new aesthetic.

## The correction loop

### 1. Frame the review

Name:

- the user-visible problem;
- the convergence rung or acceptance criterion affected;
- one representative deterministic fixture;
- at least one negative-control fixture likely to expose overfitting;
- the visual dimensions in scope and the protected behavior outside scope.

For review-only work, stop after diagnosis and a prioritized list of the smallest corrective units.
For correction work, continue through the loop without waiting between safe, in-scope iterations.

### 2. Lock a trustworthy baseline

Capture from the real production entry point. Record the commit, URL, seed/save, realm/room, viewport,
DPR, UI state, camera pose, post-processing state, and important feature flags.

Before every trusted capture:

- serve the current worktree with no-cache headers or a fresh port;
- wait for fonts, textures, generated assets, transitions, camera motion, and scene rebuilds to settle;
- read governed camera and scene state back from the runtime instead of assuming the setter won;
- capture one state per call when the transport or renderer can race;
- verify the capture path sees the live compositor; compare a full-page capture when a WebGL element
  screenshot may be stale.

Bank both:

- the real gameplay-scale frame, which owns readability and composition;
- a diagnostic crop or debug view, which may explain but never replace the gameplay frame.

If the screenshot and scene telemetry disagree, diagnose the capture instrument before diagnosing the
product.

### 3. Review in passes

Inspect the same frame repeatedly, changing the question rather than trying to judge everything at
once:

1. **Truth and play:** Are required facts present, legible, correctly scaled, and attached to their
   canonical sources? Did presentation hide or alter a game fact?
2. **Composition:** At thumbnail and gameplay scale, what reads first, second, and third? Check focal
   hierarchy, silhouette separation, negative space, foreground/middle/background, crop, and UI
   competition.
3. **Space and contact:** Check perspective, camera, topology, wall thickness, scale relationships,
   pivots, ground contact, shadows, occlusion, clipping, and depth behavior.
4. **Value and light:** Check in color and grayscale. Find crushed darks, dead midtones, unmotivated
   pools, missing practical emitters, weak subject separation, and bloom doing illumination's job.
5. **Material and citizenship:** Check texel/world scale, normals, roughness, construction cues,
   palette, edge treatment, sprite/prop lighting response, alpha, and whether all registers inhabit
   one physical world.
6. **State and motion:** Check idle/action/hurt/down/reveal/transition states, first frame, settled
   frame, and reduced-motion or paused cases where relevant.
7. **Technical integrity:** Check asset readiness, fallbacks, scene-graph counts, transforms,
   provenance, deterministic binding, draw/performance budget, and console errors.

Use overlays and debug views to answer a question, then turn them off and judge the production frame.

### 4. Convert criticism into a falsifiable diagnosis

Write each finding as:

```text
OBSERVATION — what a person can see or a probe measured
CAUSE — the most likely system-level explanation
TEST — the smallest toggle/probe that would disprove that explanation
EDIT — the smallest reusable correction if the test supports it
```

Quantify when useful: screen-space size, contact gap, luminance/contrast, bounding boxes, projected
positions, light ranges, material parameters, instance counts, and GPU timing. Do not infer an
implementation cause from pixels alone when a runtime probe can check it.

Common triage order:

- **Flat:** projection and scale → occlusion/contact → normals/material response → lighting → post.
- **Floating:** canonical pivot/ground Y → receiver geometry → contact shadow/AO → camera angle.
- **Muddy:** value hierarchy and local light influence → material separation → saturation/bloom.
- **Too small or huge:** canonical scale and camera projection → staging; avoid arbitrary per-instance
  scaling.
- **Missing or intermittent:** lifecycle/async readiness → culling/depth → asset fallback → art.
- **Style mismatch:** source register → scale/pivot → palette/value → material/light response.

### 5. Edit the controlling layer

Change the earliest visual-compiler layer that explains the symptom:

```text
semantic projection
  -> composition and camera
  -> geometry, scale, pivot, and sockets
  -> material and motivated light
  -> VFX and post
  -> local exception (last resort)
```

Never change canonical walk facts to improve a picture. Prefer a deterministic recipe, shared
renderer rule, camera/composition policy, asset contract, or parameter over hand-decoration for one
scene. Preserve provenance and fallbacks.

Change one dominant variable per comparison. Keep edits reversible. Do not stack several plausible
fixes before proving which one moved the pixels.

### 6. Prove the edit with a true A/B

Produce before and after from the same seed, room, subjects, camera pose, viewport, DPR, UI, and
settled state. The intended variable is the only material difference.

For every A/B:

1. Read the changed runtime value back.
2. Capture A and B with identical framing.
3. Compare side by side at gameplay scale; use a pixel diff or numeric probe where it answers the
   question.
4. State the visible delta, any regression, and the residual gap.
5. Toggle back once when practical. If the claimed effect survives the toggle, the test is not
   isolating the cause.
6. Revert an edit that does not improve the scoped criterion or whose regression costs more.

An attractive after-frame without an isolating before-frame is inspiration, not proof.

### 7. Test for overfitting

After the primary frame moves:

- run the negative-control fixture;
- sample materially different topology, realm, asset size/alpha, and overloaded/empty states as the
  touched system warrants;
- check at least the supported narrow and wide viewport extremes for camera or overlay work;
- run the relevant verify harnesses and `python3 build/check-manifest.py` after module edits;
- report performance or fallback movement when the edit affects production cost or asset readiness.

Do not mint or replace a golden until Adam accepts the intended visual change.

### 8. Hand off an honest packet

Place capture files on disk. Lead with plain English:

1. **Target and fixture:** what was reviewed and under what locked state.
2. **Before/after:** paired images with identical conditions.
3. **What visibly changed:** one short paragraph per pair.
4. **Countable evidence:** measurements, probes, and scene facts that support the diagnosis.
5. **Engineering gates:** commands run and results.
6. **Regressions and residuals:** what remains weak, uncertain, or outside scope.
7. **Recommendation:** `READY FOR ADAM REVIEW` or `NOT READY — NEXT CORRECTIVE UNIT: …`.

The packet may say that a hypothesis failed. That is useful evidence. It may not call the visual ON.

## Stop conditions

Stop and surface the issue when:

- no accepted target or user choice exists and competing directions would materially change the
  aesthetic;
- the visual improvement requires altering canonical facts, removing provenance, or introducing a
  bespoke scene branch;
- capture evidence remains untrustworthy after instrument checks;
- the same correction has failed twice and a new architectural decision is required;
- the next step would broaden scope beyond the owning spec.
