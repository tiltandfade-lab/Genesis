---
type: agent-brief
status: READY — continuation prompt for the next Fable session (or the current one running on)
created: 2026-07-25
owner: Adam / Fable
---

# Continuation Prompt — finish the Clayroom corrections, split theater-boot, clean close

You are Fable, resuming the 2026-07-25 program. Adam's directive, verbatim in spirit: do as much
of this autonomously as you can; contract Opus 5 subagents freely; review your own changes with a
critical eye and make corrections — your critical re-gate stands in for his per-checkpoint visual
verdicts until the end-of-program review.

## Read first (in order)

1. `CLAUDE.md`
2. `docs/HANDOFF.md` — the newest block is this program's state; `2cdf2ccb` is the checkpoint.
3. `docs/FABLE-CLAYROOM-VISUAL-CORRECTION-ASSIGNMENT.md` — the owning brief; Checkpoints 0–1 are
   done (seven review rounds, Adam-verified); its laws still bind Checkpoints 2–4.
4. `dev/clay-captures/clayroom-visual-correction/00-root-cause-notes.md` — root causes with
   file:line receipts; the Checkpoint-2/3 causes are already diagnosed there.

## Phase A — remaining correction checkpoints (worktree `Genesis-clay-ladder`, branch `clay/cl-r1-r3`)

**Checkpoint 2 — warm/cool overlap + readout truth.** Root causes already pinned: the
`authoredRange` torch-only exemption ([clay-room.js ~§board.lights compile]) clamps the pair to
`ITR_LIGHT_DISTANCE_CAP = 7` in a 15-unit room; the wall-mount snap moved the cool bulb to the
north wall; the readout prints authored values the mount replaced. Required: both pools overlap
the central subjects (sphere/cube/stairs/sprite), each readable alone; no dark seam; overlays
default OFF; the readout describes the MOUNTED lights (positions, ranges, live intensities —
extend the celestial `userData.celestial` pattern to every light row). Live proof set per the
brief; capture with `dev/capture-clayroom-ao-ab.cjs` conventions (yaw-settled, one-state-per-call).

**Checkpoint 3 — lore-native sources + dark readability.** Fire keeps its accepted flicker; magic
needs a believable crystal/rune emitter; lava needs emissive molten geometry (fixture vocabulary
currently has only `bracket-generic` + the torch — build the two fixtures through the existing
fixture-group path); sources must be staged to light the subjects; **the void/fog must respond to
the recipe** (interior background is env-keyed only — `theater-boot.js ~11551`; the celestial arc
already computes `voidTint` and `S.celestialVoidTint` is the tabletop channel's carrier — extend
honestly to the interior channel); dark regions keep slight form separation; sprite silhouette
shadows and camera fill are protected behavior.

**Checkpoint 4 — CL-F01 honest workbench.** The bench mechanics are sound (latch receipts in the
packet); the work is composition and projection: ordered specimen lane + one coherent assembled
example; label→object mapping; per-face access projection (the record already carries per-face
data); socket type/direction symbols; fitted all-walls camera; reconcile the shell report with the
`cameraSideOmission` projection (one state → one answer); the inspector may not eat half the frame
at narrow widths; ramp hard normals (`clayStructureRampGeometry` — indexed + computeVertexNormals
is the pillow bug; go non-indexed per-face).

Per checkpoint: extend `dev/verify-clay-room.mjs` (never weaken), run the focused sweep
(`LIGHT_LAB_SHOTS_DIR` redirect for light-lab!), bank packet frames + sheets (numbered names per
the brief §Capture packet), update HANDOFF, fast-checkpoint commit. Inherited reds stay reported
as inherited.

## Phase B — theater-boot split

Worktree `../Genesis-theater-split`, brief
`../Genesis-theater-split/docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md` (Codex-authored; review it and
make your own decisions — you own the architecture calls). theater-boot.js is ~20k lines and
overdue to split into systems. Mind the classic-script global-scope law (no ES-module migration
beyond what the brief licenses), `manifest.json` registration for every new module, and the
harness ecosystem (many verify-*.mjs import theater-boot seams — the split must keep every seam
reachable; run the full focused sweep after each extraction). Note: the clay-ladder branch
(Phase A) touches theater-boot.js heavily — land/merge Phase A BEFORE cutting the split, or
rebase the split onto it; never run both lanes in the same tree.

## Phase C — the singular clean close

Adam's ruling: after the split, a COMPLETE clean close — merge every outstanding lane back to one
master (`/genesis-clean-close` skill; full CI-equivalent gate; regenerate generated artifacts at
the merge; serialized landings). The known outstanding surfaces at prompt-writing time:
`clay/cl-r1-r3` (Phase A), the theater-split lane (Phase B), and whatever
`git worktree list` + `git branch -a` reveal — survey before merging. Push and confirm GitHub CI
green. This is the one step that does NOT proceed without Adam if any merge would discard work:
surface conflicts, never bulldoze them.

## Standing laws that bit us this session (do not relearn them)

- Serve the worktree with `dev/nocache` headers or a fresh port — the browser cache serves stale
  modules and compiled locks otherwise (the "old zoom limit" ghost).
- Forced synchronous renders must run `_updateSpriteBillboardYawForTest()` first, and one capture
  call per state with a marker in the same payload — the transport sorts object keys.
- Headless tabs starve rAF: pending resize refits fire under screenshots; cancel camera tweens via
  the argument-less pose seam; never trust a governed-camera capture without reading the pose back.
- The panel overlays the canvas's right edge — frame subjects clear of it or crop.
- Measure before believing any visual claim (pixel A/B with a toggled cause), and never let a
  capture instrument's artifact be reported as a product defect — three of Adam's five findings
  this session were instrument bugs; the diff/probe seams built this session
  (`_spriteShadowStateForTest`, `_spriteShadowProbeForTest`, `_setSpriteCastShadowForTest`,
  `_setStandeeDepthBiasForTest`, `_setEnvironmentAOOutputForTest`) answer these in one call.
