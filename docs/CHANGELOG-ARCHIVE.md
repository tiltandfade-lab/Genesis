---
type: changelog-archive
branch: Genesis
status: historical
created: 2026-07-09
related:
  - "[[CHANGELOG]]"
---

# Genesis — Changelog Archive

Older entries rolled out of `CHANGELOG.md` by `build/archive-docs.py` to keep the live file cheap
to load every session (the live file keeps the newest entries; see the script for the cap).
Newest-first, same as the live file — the two files read as one continuous history, live file
first. Read-only record: never hand-edit, never add entries here directly.

## 2026-07-14 — Faceted regeneration: generation complete (fantasy realm), canon promoted, salvage + QA

**Added**
- `dev/model-qa/faceted-sheets/` — the sheet-doc batch architecture that replaced the F-packet lane
  format: STYLE-CANON.md (Adam's verbatim art direction + decal exemption + prop canon), SHEET-TEMPLATE,
  refire/redo batch docs, 15+ session prompts, qa-ledger.json (510-file QA verdicts).
- ~650 raw candidates committed across rounds 1–3 + P/T-series: all 901 figure identities minus a
  10-identity gap-fill (`session-prompts/gapfill-final.md`, fireable), 56 fx + 43 decal masters
  (3 sets incl. condition/trace library), 20 extrude item props, 37 dressing components (construction-
  class routed), 20 icons, 375-item universe (15 sheets), 10-slot floor/wall/trim/face tileset.
- `salvage-2026-07-14/` — 149 disk-only sprites rescued from broken F10/F11/F7/F3 worktrees.
- Master (via merge 8a1eb3c4): `docs/ART-DIRECTION-CANON.md` + `docs/FACETED-ART-REGENERATION-
  PRODUCTION-PLAN.md` + `docs/FACETED-SHEET-TEMPLATE.md`; CLAUDE.md + AGENTS.md both mandate them
  (the Claude/Codex shared-authority fix + decision-capture rule).

**Changed**
- Decals are naturalistic surface marks, never triangulated (Adam's ruling, in canon).
- Props: per-state door/lever/trap generation dropped — §4.1 kit contract enforced (isolated
  components; engine owns states); §7 master prop prompt restored un-shortened.

**Fixed**
- F2–F15 audit: F3/F7 fabricated returns, F4/F8 misrouted content, F10/F11 lost to worktree
  corruption — all salvaged or re-fired; 5+1 crop rejects quarantined (`crop-rejects/`).
- Volume swept: 20 stale worktrees/dirs removed after salvage; every sprite now lives in git.

**Deferred**
- Gap-fill session (10 identities) → then Step-E → slice → §9 admission → Adam's sprite-review
  height pass (5179) → registry regen → engine swap of the 896 pixel sprites.
- 88 procedural realm-surfaces vs textured floors decision; 11 other realms (~3,420 refs); kit-sheet
  K1 QA (11 alpha-passed sheets on codex/extruded-prop-pilot).
## 2026-07-13 (later) — OSS adoption research pass + Phase-3 brief + oss stabilization evidence

Closed out the geometry-flip session. Adam asked whether Genesis is "rebuilding the wheel" on open-source;
answered with a three-agent research pass (reference data · three.js graphics · procgen/infra).

**Added.**
- **`docs/PHASE-3-DIRECTOR-BRIEF.md`** — Fable's handoff into Phase 3 (flip evidence, a linked path to the
  full Codex plugin-rec suite + plan, GP-2..4 terrain, the oracle/spend calls that are his, and a
  smallest-correction-first recommendation). Now with a **§6 OSS-adoption findings** table folded in.
- **Loop-gate captures regenerated under the oss default** (`dev/battle-gate/dungeon-loop/`) — 5 real
  dungeons + combat, 5/5 clean, 0 breaks; the committed evidence for the §15 stabilization hold. (The
  oss PNGs are notably *smaller* than the legacy ones they replace — consistent with the Δ−286-triangle
  perf finding.)

**Findings (headline: mostly NOT rebuilding the wheel).** Genesis already adopted the non-obvious infra
(IndexedDB via `store.js`; vendored earcut/polygon-clipping/clipper2; the Codex graphics pin-table), and its
bespoke systems are correct-by-design (script-owns-rolls, no-stored-terrain, band×lane combat; `postprocessing`
already correctly rejected). Four genuine adoption candidates surfaced, detailed in the brief §6:
(1) **`@three.ez/instanced-mesh`** (MIT) for the unbuilt/bespoke R3 sprite-atlas instancing — the big one,
Fable's Phase-3 call; (2) **Open5e `srd-2024`** (CC-BY-4.0) as a build-time cross-check for the PDF-parsed
`Reference/SRD-Data/`; (3) **AgX tone-curve** (free, already in vendored three) for the grade pass;
(4) dedup a triplicated test-seed PRNG into `dev/lib/prng.mjs`.

**Deferred.** Fable weighs in on Phase 3, potentially expands/orchestrates the next waves. All four adoption
candidates are recommendations, not decisions.
## 2026-07-13 — GEOMETRY DEFAULT FLIPPED legacy→oss (§15 step 8) + stabilization hold opened (orchestrated)

Adam **delegated the flip verdict to Claude conditional on sound pre-flip evidence** ("run the pre-flip
evidence wave, then if evidence is sound, authorize the flip, and continue fleshing out all visual
engine changes as specified"). Branch `feat/geometry-oss-flip`, landed `--no-ff`, gates re-run by me.

**Changed.**
- **`ROOM_SHELL_POLYGON_KERNEL_FLAG` (theater-boot.js) `legacy`→`oss`** — production now renders the
  PolygonKernel floor + aperture-delimited wall-run path (G1/G2/G3). The module-level
  `ROOM_SHELL_POLYGON_KERNEL` const (theater-room-mesh.js) **stays `legacy`** as the bare-call/dev
  fallback, retaining the legacy path for the §15 step-9 stabilization hold; the flag is still
  seam-settable back via `window.Theater._setRoomShellPolygonKernel`.

**Added.**
- **`dev/capture-oss-integrated.mjs`** — filled OSS §15 promotion steps 6–7 (the only genuine pre-flip
  gap; F1 outside-low grazing capture + F2 5000-room gap/provenance fuzz already existed and re-gated
  green). Boots a real in-session room, mounts it under legacy then oss at the product camera, reads
  `renderer.info` full-chain draw submissions + resource census. Output committed to
  `dev/oss-integrated-shots/` for review.

**Evidence (all re-run/read by me).** Numeric: verify-wall-runs-oss **92/0** (corner gap 0 at
stem/cap/footing, both cap lips, 100% provenance), verify-wall-runs-oss-fuzz over **5000 randomized
rooms** (zero join-gap, full segment provenance, acute-bevel + red-first negative control),
verify-geometry-fixtures **28/0** (7 legacy defects fixed, 0 regressions), room-shell parity **48/0**.
Visual: outside-low grazing — oss closes the corner with a continuous mitered cap lip; product-camera
integrated — oss ≡ legacy at the player-visible shot. Perf: draw calls **Δ0**, triangles **Δ−286**
(oss cheaper), geometries/programs **Δ0**, textures **+2** one-time. **Full 197-harness sweep: 4 reds,
ALL verified pre-existing on master** (verify-{room-shell-render,diegetic-light,occlusion-fade,
gallery-pass} — render-flake/CI-auto-skip, fail identically pre-flip). check-manifest OK.

**Deferred.** §15 step 10 (remove the legacy triangulation path) waits until the stabilization hold
passes with no rollback-worthy defect. Phase 3 (GP-2..4 visual production) now rides on the flipped
geometry, gated on Codex research + charter tool-adoption/spend gates.
## 2026-07-13 (overnight) — GRAPHICS CONVERGENCE: wall-volumes wave + Phase 0/1/2 geometry (orchestrated)

Codex researches, Claude orchestrates (`docs/GRAPHICS-CONVERGENCE-CHARTER.md` governs; execution spine
`docs/GRAPHICS-CONVERGENCE-PLAN.md`). 14 units, each personally re-gated (harnesses re-run + captures
READ, never self-report), landed `--no-ff`. Master tip after the run: `4da62a9d`.

**Added.**
- **Wall-volumes wave** — C4.1a wall volumes + Phase-0 octagon miter · C4.1b segment ray-occlusion ·
  E0 physical practicals (glow-disc retired) · C4.1c floor+riser congruence.
- **Phase 0 instrumentation (dev-only)** — R0 pinned tool bootstrap (`dev/geometry-tools/`) · G0 52
  ground-truth fixtures + injected-adapter harness (row-101 sunken-collapse red-first) · R2 fast-check
  fuzz · R3 webgl-lint/Spector diagnostics · R4 pixelmatch capture-regression · GP-1 GPU telemetry +
  material census.
- **Phase 1** — R1 four-path geometry bakeoff → ruling (`dev/geometry-research/bakeoff/ruling.json`):
  floors = polygon-clipping + Earcut; walls = clipper2-ts Strategy-A offset; clipper2 booleans + its CDT
  triangulator rejected (CDT silently wrong, reproduced). Measured a real ~0.31u corner-gap defect.
- **Phase 2 (behind `ROOM_SHELL_POLYGON_KERNEL = legacy|oss-compare|oss`, DEFAULT legacy)** — G1
  `src/ui/geometry/polygon-kernel.js` + vendored earcut/polygon-clipping (fixes 7 legacy floor defects,
  0 regressions) · G2 floor integration (oss unions+triangulates-with-holes; row-101 3-tier hole
  recovered; F08/F11 corrected) · G3 aperture-delimited wall runs + vendored clipper2-ts (corner gap
  0.3111u→0 at stem/cap/footing separately, 100% provenance, 0 unintended joins; verify-wall-runs-oss 71/0).

**Changed.**
- Fixed the incorrect "never a gap" comment at `theater-room-mesh.js:904` (per SOL — the per-segment
  construction *does* gap at ordinary convex corners).

**Deferred (Adam's morning decisions — both change the DEFAULT render).**
- negative-`sy` fix (`theater-boot.js:8888` `f.sy > 0` → `isFinite`) so sunken arenas render sunken
  (red-first in G0, promoted `geo-regression-be825c9cc76b` in R2) — parked tier-height domain.
- Flip the geometry default `legacy → oss` after a stabilization hold (OSS §15); optionally broaden G3
  fuzz + shoot an outside-low grazing capture first.

## 2026-07-12 (later) — STAGE C: REAL ROOM SHAPES — rooms stop being rectangles (C1/C2/C3/C3b, orchestrated)

**The wave.** `docs/STAGE-C.md` (GRAPHICS-NORTH-STAR Stage C) — consume the walk's rolled
`areaType/dims/side` (previously discarded by `spatializePlan`) into real room geometry feeding the
landed C4 room-shell compiler. Stacked pipeline, each unit personally re-gated (harnesses + **captures
READ by the orchestrator** + the loop gate on real dungeons) and landed `--no-ff`. Master tip after the
wave: `388a4c7b`.

**Added.**
- **C1 SIZE FIDELITY** (`0ab01533`) — `dspDimsToCells` parses `segment.dims` (feet/5, clamp `[4,24]` =
  the real d200 ceiling) into the room footprint behind `SPATIAL_SHAPES` (default ON); the two `rng()`
  draws stay in sequence so determinism + the missing-dims fallback are byte-identical. A "60×60 Grand
  Octagon" is now a 12×12 room, not a random 4–7 rect.
- **C2 STRUCTURAL TERRAIN** (`06d31fb8`) — parses `segment.side` prose (raised/dais/platform → +1,
  sunken/pit/pool → −1) into a `plan.tiers` buffer; `interiorBuildBoard` folds the tier into per-cell
  `sy`, feeding the compiler's riser render (finale-dais still wins). Placement via a separate hash
  chain, never the rng stream.
- **C3 REAL SHAPES** (`bfb5a49f`) — `shapeForArchetype` → `rasterizeShape` emits non-rect FLOOR cells
  (rotunda→circle, octagon, oval→ellipse, L/T/cross, cave) + `rooms[].shape/cells`; exits derived from
  the polygon boundary faces (`door.toSeg` binding). `interiorBuildBoard`'s rect-assumption loops now
  iterate the room's actual cell set (byte-identical for rects). Behind `SPATIAL_SHAPES`.
- **C3b CLEAN GEOMETRY + cellTriangleMap ROOT FIX** (`388a4c7b`, Adam's "half shapes" catch) —
  render-only in the C4 compiler (logical cell grid byte-identical, so combat/determinism untouched):
  circle/ellipse vertices pulled toward the fitted ellipse (roundness deviation 0.099→0.006, ~15×);
  octagon/L/T/cross staircase runs chamfered to true **45° diagonal wall faces**. PLUS the pre-existing
  `cellTriangleMap` dropped-cell bug fixed at ROOT: a nearest-triangle fallback (point-to-triangle
  distance) so no floor cell is ever left unmapped for any shape (bare octagon 76/76, was 74/76).

**Also landed (same session).**
- **Codex sprite-implementation-strategy** (`74848a3a`, Adam-directed) — the per-asset `renderStrategy`
  pipeline + decal assets + map/figurine vision-quest docs, committed by this session to clear the
  shared `theater-interior.js` so Stage C could land; verified green first (dressing 655/0).
- **`AGENTS.md`** (`22807504`) — the Codex/agent onboarding front door (auto-loaded like CLAUDE.md);
  points to CLAUDE.md + the reading order + the parallel-session/worktree discipline.

**Fixed.** The C3-shapes taste call surfaced on real pixels: Adam ruled land-then-refine, and C3b's
diagonals + round rotundas closed it; the `cellTriangleMap` float-epsilon drop (render/hit-test only,
never combat) fixed at root with a red-first regression (`verify-room-shell` check 8f).

**Battlefield note.** Combat is unchanged — cells are included by cell-CENTER coverage (already true in
C3), so the partial/half-cell shaping lives entirely in the wall mesh; a mini stands on its full cell,
the wall clips its corner on the diagonal/curve (FFT-style).

**Gates (all personally re-run).** verify-stage-c-size 25/0, verify-stage-c-terrain 49/0,
verify-stage-c-shapes 88/0, verify-stage-c3b-circle-smooth 43/0, verify-room-shell 32/0,
verify-dungeon-interior 287/0, verify-combat-cells 13/0, verify-dungeon-walkbind 20/0,
verify-dungeon-spatialize 9/0, check-manifest OK; loop gate 5/5 on real dungeons at each unit; captures
READ (octagon diagonals, round rotunda, L notch).

## 2026-07-12 — WALK-NATIVE BOUNDARY + STAGE A CLOSED: the composed camera goes live (4 units, orchestrated)

**The wave.** `docs/WALK-NATIVE-A.md` — Adam ruled "build Codex's walk-native boundary first, then
A3." Executes Codex's walk-native amendment (`WALK-NATIVE-DIORAMA-CONTRACT.md`) as the prerequisite
to wiring the dormant A2 ShotPlan, then closes GRAPHICS-NORTH-STAR Stage A. Four background Sonnet
executors in isolated worktrees, each personally re-gated on its branch tip (captures READ by the
orchestrator, never self-report) and landed `--no-ff`; WDV-1 ∥ WDV-2 first, then A3 off WDV-1, A4
off A3. Master tip after the wave: `00b775f8`.

**Added.**
- **WDV-1 `walkSceneFrom`** (new pure module `src/engine/walk-scene.js`, owns `walkSceneFrom`) —
  Codex's anti-drift boundary: consumes the stored walk + active segment + overlay + spatial + live
  state and classifies every walk fact into visual roles (structure/connection/surface/practical/
  citizen/interactable/dressing/condition/atmosphere/hidden/trace) each with field provenance
  (`sourceRef {walkId,segmentNum,fieldPath,tableId,roll}`). **Wraps** the existing card-dealer
  (`walkSceneProjectionFrom`) — never re-deals or re-rolls. `trayFrom` stamps `board.walkScene`
  (additive; `board.projection` kept). Pure — no THREE/DOM/RNG/world-writes. 32/0, three checks
  (provenance completeness / atmo isolation / hidden gating) red-first proven; raw-immutability +
  determinism + graph-fidelity green.
- **WDV-2 stamped provenance** — `walkPickStamped(tableId,...cols)` + a `segment.rollRefs` sibling
  map on the graphics-critical tables (area/feature/dressing/door/light/object/scene/sceneFrame/
  signOfPassage). Byte-additive: every existing field shape identical (the same single roll is
  reused, no second roll). Optional `provOut` params on `dwalkDoorRoll`/`walkPickInteractable` for
  door/interactable provenance. 34/0, byte-compat red-first proven.
- **A3 shot-compose** — **the composed camera is now live in production.** `setInteriorBoard` builds
  `shotPlanFrom` + `composeShot` and drives the composed camera behind `ITR_SHOT_COMPOSE` (default
  ON, focusRect fallback). New scratch-`THREE.Camera` 2-arg projector (`shotProjectFor`) for
  composeShot's multi-pose scoring. `shotPlanFrom` consumes `tray.walkScene` for anchors/provenance
  (+ `walkRef/segmentRef/fieldRefs/register` on the ShotPlan). Framing crops to the action cluster
  via the `interiorCameraFitFor` beat branch — medium standee **0.208** frame height (Stage-A gate
  0.18–0.25), tighter than the focusRect fit's 0.134. 29/0 incl. a red-first figure-height check.
- **A4 dynamic occlusion v2** — blockers from the live `ShotPlan.occlusionTargets` (walls/pillars/
  furniture); per-instance ghost + own material (never a shared batch); named consts (upper opacity
  **0.08** [0.05–0.10], stem **0.18u** [0.12–0.25], fades 150/220ms, hysteresis 3°) replacing the
  flat 0.2; tween on the MF-1 channel; interruption-safe retargeting + reclassify hold.

**Changed.**
- Stage A is CLOSED: the interior no longer fits the raw room rect — it composes on the action
  cluster and occludes dynamically. Frames `04`/`11` approximated, read as staged encounters.

**Fixed.**
- **A3 round-1 framing regression, caught at the capture gate** — the first A3 build re-centered the
  cluster but zoomed *wider* (medium standee ~0.13, void-heavy). The orchestrator read the PNG,
  flagged it, and a bounded corrective (`fitFromComposedShot` crops the action-cluster extent via the
  proven beat branch instead of the composed camera's full frustum half-height) landed it at 0.208.
- **A4 tapered-column occlusion aliasing** — a column's shaft + cap share one `(x,z)` cell; the
  occlusion id aliased them onto one fade-state so the wrong instance faded. Fixed by folding `yBase`
  into `itrOcclusionIdFor`.

**Fixed (occlusion-fade hotfix, same day — merge `07d2f733`).** The two pre-existing render-only
reds A4 surfaced (both verified pre-existing on master 46289a45, auto-skip in CI) — fixed at the
root, not masked:
- Ghost bloom halo: the occlusion ankle-**stub** (no shadow/AO) tripped UnrealBloom in dark rooms →
  darken JUST the stub's own per-instance color (`itrScaleHexValue`, the `ITR_ROOM_SHELL_RISER_DARKEN`
  convention), scoped to occluding instances. `verify-occlusion-fade` 39/1 → **40/0**; harness
  assertion untouched (code-only fix).
- Doorframe classify gap: doorframes (+ BW2-5 arch-header prisms) were never wired into the occlusion
  classify pass → wired into the SAME per-instance `itrOcclusionClassify`+ghost pattern. Also found +
  fixed a real harness bug (checks read raycasts against the stale pre-MF-1-tween camera →
  `settleCameraTween`) and, after instrumenting 100 seeds (0 over-fires), replaced check 32's unsound
  seed-lottery `anyFullHeight` with a **constructed control (32b)** — an ON-sightline pillar stubs
  while a self-checked OFF-sightline control stays full. `verify-bw2-1b --with-render` 39/4 → **49/0**.
- **Stage-A production diff reviewed clean** (low-effort Opus pass over WDV-1/2 + A3 + A4 + hotfix):
  no correctness bugs; walk-native project-only law, A3 fallback safety, scratch-camera non-leak, A4
  determinism all confirmed. Two non-blocking awareness notes on record: `feature` cards fold into the
  citizens lane as `living:true` (framing-only, never rendered); `walkSceneFrom` re-runs the projector
  with a single-room plan.

**Deferred.**
- Codex's WDV-3 (table visual metadata), WDV-4 (overlay/state key unification), WDV-5 (cross-env
  diorama gate) remain as the later walk-native recommendations (`WALK-NATIVE-DIORAMA-CONTRACT.md`).

**Gates (all personally re-run by the orchestrator).** check-manifest OK; verify-walk-scene 32/0,
verify-walk-stamped-provenance 34/0, verify-shot-compose 29/0, verify-occlusion-fade (render;
1 pre-existing pixel red), verify-theater-shot **107/0** (94 + 13 new WalkScene checks),
verify-dungeon-interior 287/0, verify-mf1-camera-tweens 24/0, verify-interior-camera-frustum 14/0,
verify-walk-card-projection 29/0, verify-bw2-1b (jsdom) 24/0. Capture PNGs READ: A3 after-composed
reads as a staged diorama (void gone); A4 on/off shows the pillar fade to reveal the standee behind.

## 2026-07-11 — BW4 MOTION & FEEL: the stills became footage (4 units landed, hit-stop wiring deferred to MF-3b)

**The wave.** BEAUTY-WAVE-4 (docs/BEAUTY-WAVE-4.md) — the space between verbs. Orchestrated as
4 background Sonnet executors in isolated worktrees, each personally re-gated on its branch tip
and landed `--no-ff`; MF-1 first (gating — everything is judged through the camera), then
MF-2/3/4 in parallel off its tip.

**Added.**
- **MF-1 CAMERA TWEENS** (`c067276a`) — beat/room/move-step camera refits glide position+target
  over 320ms ease-out instead of snapping; interruptible retarget from the live interpolated
  pose; player zoom/rotate stay instant (Feel Law 3). Reuses the `S.tweens`/`tickTweens` channel.
  The executor found+fixed two real interruption bugs (preview `placeCamera` snapping;
  `drainTweens` force-completing) by capturing the pre-fit pose at the top of `setInteriorBoard`.
- **MF-4 TURN & ROUND PRESENTATION** (`f606d14b`) — acting-ring 300ms slide between single-actor
  handoffs (instant path kept for every other shape); round header 250ms dip-and-return + chip
  strip single pulse off a one-shot `GS.cmbLastRoundSeen` flag (mirrors `cmbDamageFlashed`); VP5
  damage floater 60ms pop-in scale. Transform/opacity only — no reflow storms.
- **MF-3 IMPACT FEEL — mechanism** (`3a245c6b`) — hit-stop freeze (attacker+target verb tweens
  stall `t` at contact; world + camera-pose tween keep ticking, doubly guarded against freezing
  an `isCameraPoseTween`), directional recoil, crit white-flash + 2px single-bounce camera nudge,
  fall-death 80ms hold. Freeze resumes start-shifted (no jump).
- **MF-2 SPAWN/DESPAWN GRACE** (`fa27aff7`) — standee mount 150ms fade + 4% scale settle
  (base-first); despawn 200ms fade-into-base (base lifts last); seeded ≤400ms dressing/furniture
  cascade; room-transition 200ms crossfade. New theater-layer ES module `src/ui/spawn-grace.js`.

**Deferred.**
- **MF-3b (hit-stop production wiring)** — MF-3's hit-stop/recoil/crit-response are built + tested
  but DORMANT in real play: production plays `hit-damage` (via the `{hurt:"hit-damage"}` remap) so
  base shake+flash fire, but the hit-stop freeze + recoil are gated on `opts.attackerId` and
  crit-response on a `hit-crit` verb, neither of which `theaterFxFromLedger`'s hp case emits.
  Wiring = thread `attackerId` + a crit flag onto the hp ledger event (an EVENT-CONTRACT addition
  at the `DM_EVENT_FIELDS` boundary) — flagged for Adam's design call. fall-death's hold IS live.
- **MF-5 feel gate** — the interactive "does it feel like moving miniatures?" play session (Adam
  at the keyboard) + the instrumented turn-burst, best shot after MF-3b so the burst can show the
  hit-stop centerpiece. Interim evidence: the loop-gate contact sheet + `loop-01-camera-mid-tween.png`
  regenerated on the integrated tree, plus the fake-clock harnesses proving every tween curve.

**Fixed.**
- `verify-mf1-camera-tweens` settle-await 5s→15s (`978d1402`) — MF-1's own on-mount camera tween
  needs longer to settle on a cold/contended headless Chrome (matched the frustum harness).

**Gates (all personally re-run by the orchestrator, never self-reports).** check-manifest OK;
verify-mf1 24/0, verify-mf4 36/0, verify-mf3 47/0, verify-mf2 61/0; the integration gate on the
merged tree (all four MF harnesses + standee 71/0, theater-verbs 100/0, dungeon-interior 287/0);
loop gate 5/5 clean, fps 72–253.
## 2026-07-11 — BW3 + THE FULL VISUAL CAMPAIGN CLOSED: three waves in one sitting; the engine converged on the mocks

**The arc.** Adam's mock frames became the reference model; three waves landed end to end:
BW2 (10 units: crisp channel/PS1 retired game-wide, beat camera, floor contact + bases +
kilter, occlusion + clip margin, textures + variant roll, value plunge, silhouette + furniture
+ extrusion props, gallery, UI) → BW3 (composer seam byte-identical, light shafts + mote
coupling, seam-softening, LIT SPRITES + THE BRIGHTNESS LAW, post suite: tilt-shift DoF +
emissive bloom + filmic grade + the OutputPass sRGB fix). BW4 MOTION & FEEL specced + queued.

**Laws ruled this session (DESIGN registered):** PS1 RETIRED GAME-WIDE · FLOOR CONTACT ·
OCCLUSION + CLIP MARGIN · PROP PERSPECTIVE (flat art on contextual-depth extrusions,
edge-sampled sides, tier ladder box/silhouette/card) · THE KILTER · THE BRIGHTNESS LAW
(full-bright only in full white light) · SPRITE PURITY AMENDMENT (purity = no distortion,
lighting REQUIRED) · UV MAPPING LAWS (floor 1:1/cell — grout aligns with the combat grid) ·
COLUMN DEMOTION (furniture is cover) · THE FEEL LAWS (BW4).

**Also:** MOCK-GEN reference loop (PACKET-01 frames = the targets; PACKET-02 textures folded,
18/18; PACKET-03 flat-props authored + style-rider v2) · grid-snap (spritefusion) proven
destructive, reconstruction gate kept · corpus unification r2 (hue-safe; r1 reverted at the
eyes gate) · ROOM-GRAMMAR + BEAUTY-WAVE-4 specced · 6 real pre-existing bugs fixed by
executors in passing (mote origin-shift, preview importmap, stale shims, kaiju leak).

**Verification at close:** every unit orchestrator re-gated; interior 287/0 · dressing 451/0 ·
scene-direction 17/0 · floor-contact 48/0 · occlusion 24/0 · silhouette 87/0 · texel 116/0 ·
shafts 44/0 · seams 146/0 · crisp 37/0 · sprites 12/0 · manifest OK · loop gate 5/5 at every
landing · fps 124-164 with all passes. Deferred: BW2-4b's quiet camera-key shadow (taste
call), wall-hang axis 7b (unreproduced), trim GL-wiring, gallery-pass harness side effect,
GIT-LFS (tomorrow, Adam), audio design night.
## 2026-07-10 (later night) — THE BEAUTY WAVE EXECUTED: all 11 units + VP8 landed, the diorama transformed

**Context.** Adam delegated the taste verdicts to Fable ("you've been outsmarting me") and said
"orchestrate this wave now." One session: spec re-review (6 gaps found+folded), verdicts ruled,
3 execution stages (2 + 6 + 5 executors, Workflow-throttled, worktree-isolated), every unit
personally re-gated, every visual gate READ.

**Ruled (delegated verdict seat; DESIGN.md registered)**
- CAMERA = perspective ~20° ON · PSX dither+snap OFF world (VP0 4-cell card shot WITH standees,
  confirmed on pixels). §G closed: corpses persist FOREVER · weather defers to UW1 riding VP6's
  mote channel · blood full-grim applies to visuals, children carve-out MECHANICAL.

**Added**
- VP0 camera/world-PSX flags + defaults flip; VP1+VP1b TRUE-SCALE (registry feet/scaleTrue on
  896 slugs; interior pieces + combat standees) · VP2 dressing fold (14 dg sheets → assets/dressing,
  REALM_DRESSING generated) · VP2b GALLERY PASS (4 paintings reclaimed: dragon/colossus/kraken/
  tarrasque; one already hangs in a rolled dungeon) · VP3 ground design · VP4 SCENE_DIRECTION
  (17/0 harness; study card taste-gated: four distinct room moods) · VP5 battle UI off the stage
  (chip strip, acting ring, floaters) · VP6 life pass (idle-breathe, flicker, motes, VISIBLE
  HISTORY decals cap 12/room FIFO in pn.spatial.decals, child carve-out mechanical, effect seam)
  · VP7 contact blobs · VP8 beauty shot (5 full-res frames + gap caption).
- MOCK-GEN reference-model loop (Adam's idea): dev/model-qa/mock-gen/PACKET-01.md — 8 target-frame
  prompts, ChatGPT as our own reference model; mocks propose, laws dispose.

**Fixed**
- **THE KAIJU ROOT CAUSE (VP1c):** three fixes deep — sizing math was never broken; production's
  theaterStageSync pushed flat-tabletop units into S.unitGroup and `setInteriorBoard` never cleared
  it, so pre-VP1 kaiju meshes rendered OVER correct interior pieces. Two clearGroup calls, red-first.
- VP1.5 corpus unification REVERTED at the orchestrator's eyes gate (green snake→brown = hue
  murder; magenta flecks) and REBUILT as r2: union-histogram palettes w/ hue-family floor (executor
  self-corrected 2%→0.5% when its own card read caught a second snake), Lab quantize, integer-ratio
  texel, magenta exclusion. 42 flagged vs r1's 206; snake/ghost regression fixtures now permanent.
- Sweep fixture drift: VP1's red-first merge-base self-invalidation (pinned 63d3073), model-grammar
  figure-Y pattern widened for VP1b's posY (x/z-identity invariant intact).
- **Grid-snap verdict:** Adam's spritefusion-pixel-snapper lead PROVEN DESTRUCTIVE on our art
  (3-sprite + raw-arrival proof cards; detector locks onto texture rhythm, majority-vote eats
  sub-cell detail). Kept: the reconstruction-error validity gate as a future slicer option.

**Deferred**
- VP8 gap queue: combat BEAT FRAMING (law 2c not yet driving the camera), light-marker quads need
  emissive art, chrome creature sprites (realm dressed but uninhabited), gloom/chrome density tune.
- GIT-LFS now urgent: GitHub warns on the two 79MB pre-unification zips.
- Executor scar for the ledger: two narrator-deaths on VP1.5-r2 (zero commits, caught by disk-truth
  both times; one corrective SendMessage revived it — the babysitting protocol worked).

**Verification.** check-manifest OK · interior 282/0 · dressing 379/0 · scene-direction 17/0 ·
vp6 49/0 · standee-verbs 69/0 · gallery 22/0 · vp1c-leak 6/0 (red-first) · battle-stage 42/0 ·
combat suite green · full sweep = only the pre-existing table-usage-data red · loop gate 5/5
re-shot and READ at every landing (one stale-capture-server incident caught: identical pixels
to the prior tree = the server was serving stale code; kill-before-capture is now in every prompt).

## 2026-07-10 (late night) — ART DIRECTION CLOSED: 13 rulings, two armed waves, dressing art landing

**Added (specs — build is Adam's word)**
- docs/BEAUTY-WAVE.md (VP0-VP8 + VP1.5 + VP2b): VP0 two-flag study card (ortho-vs-perspective ×
  PSX-on/off, Adam's pixel-verdict), VP1 true-scale piece fix + registry sizing fold (the kaiju
  defect), VP1.5 corpus unification pass (realm master palettes + texel density + defringe, one
  batch, no codex spend), VP2 dressing fold, VP2b THE GALLERY PASS (clipped/reject sprites → framed
  realm paintings, paintingOf provenance, mimic-guise legal), VP3 ground design, VP4 scene art
  direction, VP5 battle-UI redesign, VP6 life pass + visible-history scars, VP7 contact grounding,
  VP8 the beauty-shot gate (side-by-side vs a real Wildermyth frame).
- docs/UNIFICATION-WAVE.md (UW1-UW4): ONE CHANNEL (diorama; flat table → legacy → retirement),
  exterior + settlement dioramas, PORTRAITS (busts w/ 3-expression sets — expressionSet law's
  production surface — + dialogue lower-third).
- 13 art-direction rulings registered in DESIGN.md: clean-shapes, PS1-scope-cut, perspective camera,
  framing law, value law, FLAGSHIP REALMS (fantasy/gloom/chrome; realm = expansion pack, ~6-mo
  drops), master palettes, texel density, portraits, outline law, defringe-standard, visible history,
  gallery pass. CLEAN-SHAPES + outline clauses patched into all pending codex packets.

**Added (art)**
- 25 DRESSING-GEN codex sheets landed + backed up UNGATED (flagships flora/clutter/objects +
  effects core + all accents + ash). VP2 gate/slice/fold is next session's first move.
## 2026-07-10 (evening) — WILDERMYTH GRAMMAR: engine marriage BUILT + dressing-gen packets + finale loop gate 5/5

**Added**
- North star: docs/GRAPHICS-ENGINE.md (Part I recipe + Part II research-grounded marriage;
  Wildermyth research digests committed). Identity: DF sim × Daggerfall breadth × Wildermyth
  presentation.
- ENGINE WAVE (all landed, each --no-ff + orchestrator re-gate): STANDEE VERBS
  (src/ui/standee-verbs.js, 61 checks; combat hurt/down routes sprites); GR2 dressing
  channel (src/engine/place-dressing.js dressPlan + card render w/ placeholders, 371);
  GR1 REALM_MATERIALS (12 realms, seeded low-contrast painters, 187); GR3+GR4 hemisphere
  key + per-realm grade + whisper fog + diorama skirt (254).
- FINALE LOOP GATE 5/5 (dev/battle-gate/dungeon-loop/): five REAL rolled dungeons
  (Web/Ruin/Figure-8/Loop topologies, chrome/gloom/fantasy) end-to-end — roll → prep →
  combat_start → volumetric render → standee verbs — zero fixture, zero breaks. Caught+
  fixed 2 verify-green-but-not-wired bugs (trayFrom interior never called dressPlan;
  findUnit blind to interior pieces).
- Sprite queue: DRESSING-GEN packets (50 sheets/852 cells, flora+clutter+objects×12 +
  effects core/accents, Wildermyth construction rules in every prompt) + round-3
  magenta-fails addendum (12 Adam-failed sprites, ANTI-MAGENTA clause).
- sprite-review floor-line setter; interior camera focusRect + CUTAWAY WALLS; sprite
  standee tilt (squash killed); SPRITE PURITY (billboards exempt from PSX).

**Known open**
- Interior PIECE SCALE misreads (mediums render giant in rooms — loop-gate contact sheet);
  fix rides the registry sizing fold. AO knob off by default (Adam pending final word).
- Codex waves pending: round-3 + dressing-gen (packets ready, RUN-NOTES order).

## 2026-07-10 (afternoon) — corpus retro-tagged, DUNGEON-GRAPH U1/U2/U4 live, codex packets hardened, floor-line tool

**Added**
- `dev/model-qa/corpus-tags.json` — casting-grade SPRITE-TAGS for all 896 committed sprites
  (28 vision agents, text-first/image-wins) + `corpus-sizing.json` (true scale, feet/5.5) +
  `ash-drift-report.json`. FINDING: sheet fantasy-npcs-2 = systemic label/art misassignment
  (14/18 mismatches); 13 sprites relabeled-to-art via new overlay `name` override in
  gen-sprite-registry.py; orphaned roles re-queued.
- **DUNGEON-GRAPH built (U1/U2/U4)**: `src/engine/place-spatialize.js` (walk graph → verified
  cell-grid SpatialPlan, 12 topologies, deterministic, 9/9), `src/engine/place-semantics.js`
  (roles, depth=difficulty bands, SCALE DOMAINS + prison-rule regrowth, 26/26),
  walk binding in prep.js/dm.js (pn.spatial, cursor→room, combat cellDims from the real room,
  time-pass repositioning seam, 20/20; fuzz 0, monkey 0-aborted). U3 (volumetric renderer +
  study card) IN FLIGHT on feat/dungeon-u3-render at close.
- Specs: docs/DUNGEON-GRAPH.md (SPECCED, anchors verified), docs/GUISE.md (universal
  sprite-swap: lycanthropes→synths→dragons), docs/GIT-LFS-MIGRATION.md (runbook, Adam priority).
- Round-3 codex packet (`dev/model-qa/regen-v3/round3/`, 10 sheets/184 cells incl. 46 alt
  fills) + RUN-NOTES run order; ALL round-2+3 packets hardened: expression fail-check,
  worm's-eye BUG COROLLARY in every camera line, 3-attempt cap, never-discard-takes,
  chat-recovery step 0.
- sprite-review tool: click-to-set FLOOR line (overlay `floor` → registry fold-through).

**Changed**
- SPRITE-GEN-V2: §10 expression clause → the FFVI EXPRESSIVE CREATURE LAW; new §10b ADDITIVE
  FOLD LAW + §10c NO-BLANK-SLOTS LAW; perspective clause BUG COROLLARY.
- Codex round-2 arrivals folded additively: 4 sheets PASS re-sliced (9 sprites);
  cosmic-large-v3-09 REJECTED (content regression) — old art kept, redo queued.
- Painterly-ash confirmed (9 npc/kids/animal sheets) → quarantine-pack/painterly-ash + Desktop
  zip; rosters re-authored under ash grit in round 3.

**Fixed**
- Recovered this worktree's deleted .git/worktrees admin dir (disk-cleanup collateral).
- Disk: worktrees pruned 6→3, magenta lane's 58 parked sheets committed+pushed before removal.

**Deferred**
- U3 gate + task "battle scene in a real dungeon room + loop test" (hands off with U3).
- Registry sizing fold (corpus-sizing + v3-sizing → sprite-registry), GUISE G1-G4, LFS
  migration (runbook ready), upscale decision (xBRZ candidate; card on Desktop).

## 2026-07-10 — SPRITE-GEN-V2: the great sprite cleanup, perspective law, V3 regen wave (650 gated sprites), casting-grade tags

**Added**
- `docs/SPRITE-GEN-V2.md` — the regen-wave law book: eye-level perspective law (front/side/¾ compatible;
  high-angle/top-down quarantined), size-tier grid ladder (titanic 1x1 → tiniest 8x8; humanoids ALWAYS 4x6),
  per-realm finish law (grim realms grimy-dithered, bright realms cleaner), chroma-key law (magenta default,
  pure green for chrome/suburb), Armed Toons Law, expression requirement, swarm pile-style law.
- `docs/SPRITE-TAGS.md` — casting-grade tag schema: BINDING LAW (sprite fixed to its NPC once assigned),
  EXPRESSION-VARIANT LAW (same form + different expression = same character, `expressionSet` ids),
  CASTING LAW (DM casts sprites onto surprise-play characters via kind/role/age/build/mood/portability;
  castability tiers unique/named/generic/crowd).
- **Perspective survey** (`dev/model-qa/perspective-survey/`) — 9 vision agents classified all 2,431
  uncommitted sprites per cell; contact sheets A/B/Q; final-verdicts.csv; Adam failed 80 in the new
  review tool (`dev/perspective-review.py` → :5181, click-to-fail, writes rulings.json).
- **REGEN-V3 packets** (`dev/model-qa/regen-v3/`) — 161 sheets / 755 sprites of exact codex prompts,
  per-realm, with pre-generated slug manifests; style-refs/ (12 sweep-rated exemplar sheets); realm
  expansions ruled + authored same day: cosmic tarot arcana (37), frontier tribal (34, dignity register),
  suburb Amblin/Earthbound (34), gloom VHS-horror canon (34), bright-kingdom armed toons (Zelda+Mario grammar).
- **V3 wave gated + sliced**: Adam's codex sessions delivered 143/161 sheets; 11 gate agents passed
  142/143 on style; all 650 sprites sliced to transparent PNGs at `dev/sprite-sheets/incoming/v3/<realm>/`
  with `v3-sizing.json` (pxHeight, band scale, qaFlags) and `v3-tags.json` (full casting schema, 650/650).
- **Off-angle giveaway pack** — 78 quarantined sprites keyed to transparency, sorted by angle, CC0 README
  (`dev/model-qa/quarantine-pack/` + zip on Desktop). Nothing deleted.
- Round-2 codex packets (`regen-v3/round2/`): cosmic-r2 (15 missing), gloom-r2 (3), fixes-r2 (9).

**Changed**
- Worktrees pruned 21 → 1 (only the sprite-gen lane remains); 37 dead worktree-agent branches deleted
  (each verified merged); parked WIP banked as commits on feat/craft-npc-situation +
  claude/fantasy-sprite-slicing; all live branches pushed to origin.

**Fixed**
- The 2026-07-09 overnight codex blast (41 sheets straight onto master, no perspective lock) is fully
  triaged: 78% usable under the eye-level law, rejects regenerated in V3, off-angle quarantined.

**Deferred**
- Round-2 codex run (18 missing + 9 fix sheets — packets ready for Adam's 3PM window); registry fold-in of
  v3 sizing/tags; committed-corpus retro-tag + ash painterly check; NPC expression pass (law 2 wiring);
  sprite lane's 59 uncommitted round-2 sheets still parked in its worktree.

## 2026-07-09 (late night) — PLACE-GEN build wave: places are realm-true from birth and render as dioramas

**Added**
- **Place Spine + skins (U0, PROVISIONAL):** `Engine/03. _Tables/05. Realms/Place Spine.md` (24 site
  archetypes: weight, scale, GRID-LAW space band, staff band, castProfile) + `Place Skin -
  {Frontier,Chrome,Gloom}.md` (relabel/drop/add/reweight + namePatterns). Adam's craft pass pending.
- **`build/gen-place-skins.py` → `data/place-skins.js` (U1):** `PLACE_SPINE`/`PLACE_SKINS`/
  `PLACE_SPACE_CELLS`/`placeForRealm` (+U3 `SCENE_BUCKET_BY_ARCHETYPE`, +U8 `SCENE_DRESSING_BY_
  ARCHETYPE`/`sceneDressingForPlace`/`--census`). Missing skins legal → frontier fallback at roll time.
- **GRID LAW (rewire-class, DESIGN-registered):** every generated space measures in real 5-ft cells;
  1 band = 5 cells deep, 1 lane = 4 wide. `rollPlace` emits `rolled.dims` in cells (U2); node trays
  render 1 tile = 1 cell (U7); typed-place fights derive their zone grid from cells (`cmGridFromCells`,
  U11 — text-parse path byte-identical for everything else).
- **Tray node source (U7):** `trayFrom({kind:"node"})` + `theaterNodeSourceFor` — a minted place
  renders as its diorama (floor = dims, dressing-driven floor/light/props, deterministic scatter).
  Screenshot-gated (`dev/battle-gate/capture-place-tray.mjs`, eyeballed: gloom diner reads).
- **Cast wiring (U3):** anchor NPCs land on-class via `roleForRealm({filterCls})` filtered-pool
  (never-dangle); ambient fill maps archetype → scene bucket.
- **Breach leak (U5):** `rollPlace({hybridRealm})` minority cross-skin mints, SHARED `ROLE_HYBRID_K`
  (one law with the NPC leak); leaked mints carry `dm.dressing.hybridProps` as the visual tell.
- **Kit/district relabels (U6):** `BUILDING_KIT_REALM_LABELS` chrome/gloom (all 14 kits) + district
  relabel map + chrome faction handles; frontier byte-identical (golden-tested).
- **TIYL routing (U9):** origin settlements carry realm `itemsPool`/`dressing` pointers (pointers
  only — settlements stay compositional; bardo presentation byte-identical).
- **DM digest location line (U10):** typed nodes read "<name> — <archetype>, WxD ft, <light>
  (props…)", 88 B, derived through the tray's own lookups (one derivation).
- **Book gathers:** DMG14 settlements + random dungeons, DMG24 settlements + bastions
  (`docs/PLACE-GATHER-*.md`, vision-read) + `dev/model-qa/dmg2014-page-index.json`.
- **PLACE-ASSET-QUEUE** (`docs/PLACE-ASSET-QUEUE.md`, PROVISIONAL): 44 grounded entries (22 P1);
  main finding = zero architecture-shell vocabulary in the prop stack. Sprite half translated to
  `dev/model-qa/sprite-sheets/setting-dressing.md` (4 sheets / 47 cells) + INDEX line.

**Changed**
- Five thin settlement tables (Ruler Status / Race Relations / Mythology / Nearby / Relevancy) →
  Master-Setting grade (d100, 5-band 66/20/9/4/1, DMG14 seeds, GRID-LAW dimensions; originals in
  `zz_Archive/`, rows PROVISIONAL).
- Merged origin/master mid-wave (the 3ceb4ad CI green wave) — the 3 pre-existing sweep reds
  (digest-diet/dm-contract/creature-determinism) were already fixed there, not re-fixed.
- `ROLE_HYBRID_K` const→let (mutation-guard testability; no production reassignment).

**Verification** — every unit orchestrator-re-gated on its branch tip + the integrated tree; full
`dev/verify-*.mjs` sweep ZERO failures at close; `check-manifest.py` OK throughout; combat byte-gate
(tabletop-u1 45/45) intact; fuzz 520 calls / 0 findings.

**Deferred** — HOOK-WALKS terminus-bias table (blocked on that spec locking; the `archetypeBias`
parameter itself landed in U2); 8 backfill realm skins (craft lane); per-realm place-secret tables
(Adam ruling open); interior generator (spec section first); P1 asset wave (Adam go/no-go);
`sprite-sheet-prompts.md` shared template referenced by realm sheets but missing (pre-existing).

## 2026-07-09 (sprite night) — fantasy realm sliced (896 sprites) + review tool + auto-scale + XL regen lane

**Added**
- **The whole fantasy realm + all PCs cut to production sprites** — 896 PNGs in `assets/sprites/`
  (510 monsters / 75 NPCs / 75 animals / 20 kids / 216 PCs), sliced from Adam's ImageGen corpus at
  `ui-sketches/sprite-sheets/` (183 source sheets). Padded sheets (ImageGen fills 5×5 grids) handled
  by targeted crops; every sheet has a review contact sheet. **Corpus + cut sprites now COMMITTED**
  (Adam's backup ruling — the "no git backup" risk is closed; `.gitignore` un-ignored them).
- **`dev/sprite-review.py` + `dev/sprite-review.html`** — the sprite review tool (port 5179): browse
  every cut sprite w/ registry tags; 7-band head-guide ladder w/ imperial heights (tiny 1′6″ →
  titanic 36′) + a 6′ vector human silhouette on stage; per-sprite scale slider (0.1–8, titan range);
  explicit **Save Changes** (no real-time writes; pass/fail fold in unsaved edits); pins; `flagged ⚠`
  filter; writes `dev/model-qa/sprite-tags-overlay.json` directly (atomic) — no parser round-trips;
  "regen registry" button folds rulings into `data/sprite-registry.js`.
- **Auto-scale pass** — heights for all 896 sprites (PC species table deterministic; monsters/NPCs/
  animals via estimation agents), `scale = head_ft/(6×plane)`: 852 applied, 410 flagged (`⚠` note:
  height uncertain / art extends above head / clamped). Adam's rulings always win (6 skipped).
- **Defringe pass in the slicer** (`defringe()` + `--defringe-dir`) — kills the universal magenta
  halo (edge erode ×2 + edge-band despill; interior purples untouched). All 896 re-written in place.
- **XL/titan/redo regen lane** (`build/gen-xl-regen-sheets.py`) — Adam's ruling: 9′+ creatures are
  under-res at 25/sheet. Emits `dev/sprite-manifests/XL-REGEN-PROMPTS.md` (64 paste-ready blocks w/
  anti-magenta-artifact rider: 24 titan solos ≥24′ · 39 XL 2×2 sheets = 155 creatures 9–24′ · 1 redo
  sheet = 16 sub-9′ review fails) + `xl-regen-manifest.json` (original slugs — slices overwrite).
  Tiers derive from Adam's own review-pass scales.
- **`dev/sprite-manifests/REJECTS.md`** — generated regen shopping list (every `verdict:"fail"`
  grouped by sheet w/ prompt source + cue + note); served at `/rejects` in the tool.

**Changed**
- `build/gen-sprite-registry.py` — DEFAULT_MANIFEST flipped fixture → real v2 manifest (the deferred
  T2-integration flip); overlay now carries `scale`/`verdict`/`note` onto registry entries.
- `src/ui/theater-boot.js` — billboard height × `entry.scale` (the heads-line-up calibration is
  LIVE); `spriteEntryFor` skips `verdict:"fail"` (review-failed art falls through to 3D).
  `verify-theater-sprites.mjs` +2 checks (12/0).
- `build/slice-sprites.py` — `--manifest-path` override (regen lane); re-cut slugs still fail-ruled
  print a re-review reminder (never silently cleared).

**Fixed**
- **Slicer wrote misassigned sprites on count-mismatch** (largest-N selection pulls blobs from
  anywhere on a padded sheet; fantasy-monsters-21 proved it — tarrasque got invented row-5 art).
  Fail path now QUARANTINES candidate crops under review/; production dir untouched.

**Adam's review pass (first sitting):** 366 pass / 44 fail (fails mostly magenta bleed on big
creatures — hence the regen lane).

**Deferred**
- `item` kind in the v2 parser/registry (13 fantasy item sheets + 571 item cells still unsliced).
- Interior magenta-bleed auto-fix (legit purple art measures identical to bleed — review catches it).
- Square-plane aspect: `buildSpriteBillboard` stretches non-square crops; revisit with an
  aspect-correct plane sized off `tex.image`.

## 2026-07-09 (night) — Doc auto-archive rule + CI/token-discipline session close

**Added**
- `build/archive-docs.py` — rolls old entries out of the living docs into read-only archives.
  **The rule (Adam's ruling):** `CHANGELOG.md` keeps the newest **25** entries (older →
  `CHANGELOG-ARCHIVE.md`, newest-first order continuous across the two files); `NEXT-STEPS.md`
  keeps at most **4** dated `## Do next` blocks (older → `NEXT-STEPS-ARCHIVE.md`; standing plan
  sections never auto-archive; undated blocks left alone). Modes: dry-run (no args) / `--emit` /
  `--check` (exit 1 when over cap — run it at session close). First roll: 77 entries
  (2026-06-21 → 2026-07-04) archived, CHANGELOG 284 KB → ~84 KB.
- `docs/CHANGELOG-ARCHIVE.md` — the overflow archive (registered in `docs/README.md`).

**Changed**
- CLAUDE.md: commands table + token-discipline section carry the archive rule; preambles of
  CHANGELOG/NEXT-STEPS state their caps.

**Context (same session, landed earlier as ac3f450 + 4611ee8)**
- CI red wave greened: Math.random grep-gate comment false-positives reworded; `dm-contract.json`
  regenerated (animal-social field drift); digest-diet 12 KB size guard de-flaked to a
  median-of-5-seeds measurement (no real digest bloat — the seeded fixture had re-rolled onto a
  fatter random scene). `verify-regions.mjs` fixtures seeded (byte-identical runs) after a
  1-in-430 unreproducible sweep failure — future reds replay exactly.
- Token discipline: `.claude/settings.json` deny-list blocks Read on multi-MB generated artifacts
  (`tables.js` ≈ 2M tokens per Read was the 2M-token-session culprit); CLAUDE.md section added.
## 2026-07-09 (later) — Realm-key expansion (+168 creatures) · SPRITE-TRANSITION T1–T4 · item sheets

**Added**
- `docs/REALM-KEY-EXPANSION-ROSTER.md` (APPROVED) — NPC/monster additions for the re-keyed realms
  (chrome/gloom/suburb/lost-world/ash + cosmic/bright-kingdom passes; Pink Cult, Cindermarked cult,
  Collector, gremlin realm-bleed pair, Zeal adepts, game-logic-being NPCs).
- **Stat wave landed:** 168 new creatures to MM standard in `dev/model-qa/realm-bestiary-draft.json`
  (19 Sonnet author→critic batches + the frontier-authored U0 weird dozen; `gen-realm-bestiary --check`
  clean at **1,475 creatures across 11 realms**; PROVISIONAL pending Adam red-pen).
  `data/realm-bestiary.js` regenerated at this close.
- **SPRITE-TRANSITION locked + T1–T4 built** (`docs/SPRITE-TRANSITION.md`): creatures → 2D sprites
  (OpenAI ImageGen sheets), 3D keeps trays/architecture; T2 `build/gen-sprite-sheet-manifests.py`
  (181 sheets / 4,316 cells, slug-collision policy) + `slice-sprites.py --manifest-v2`; T3
  `data/sprite-registry.js` (4,316 entries, 100% monster join coverage, redline overlay seam); T4
  theater sprite-billboard channel in `figureFor` (10/10 harness, kill switch, base discs unchanged).
- Sprite-sheet index expansions: expansion E1/E2 sheets per re-keyed realm (~173 creature prompts) +
  **Item sheets from all 11 realm loot tables (571 items, object-icon template)**.
- `docs/ASSET-SYNC.md` — 3D/heavy assets are request-on-demand (partial clone + sparse-checkout);
  sprite-corpus backup gap flagged.

**Changed**
- DESIGN registry: sprite reversal recorded; MODEL-FOUNDRY re-scoped to trays/props/architecture;
  SPRITE-SHEETS un-parked; ARCHITECTURE gains the Sprite Channel & Registry entry (wiki recompiled).
- `docs/REALM-KEY-EXPANSION-STATS-SPEC.md` corrected to the real d8/8-row flavorTable contract.

**Fixed**
- Draft-JSON indent churn (integrator wrote indent=1; restored to indent=2 — true wave diff is
  11,712+/1− by histogram). Recovered two commits knocked off-branch by a worktree-discipline slip
  (executor worked in the session tree; both restored from the object store, re-verified).

**Deferred**
- T5 gloom vertical slice + tagging pilot (gated on Adam's first sheet PNGs); `item` kind in the v2
  parser/registry; Pink-Cult + gloom demand-ladder faction-clock specs; hoverboard buff proposal;
  Adam's red-pen on the 168.

**Verification:** check-manifest OK · realm-wiring 78/0 · dm-events 70/0 · social 97/0 ·
theater-sprites 10/0 · sprite-registry 6/0 · sprite-pipeline all-pass. Known pre-existing reds
(digest-diet 58/1, creature-determinism grep-gate) unchanged, not from this branch.
## 2026-07-09 (later still) — HQ-8: npc-life writers stamp location (Adam's two rulings closed)

Adam ruled both HQ-review ledger items in-session: **(a)** settlement **population estimates** are
the intended urban-development signal (registered into PLACE-GEN scope; the lodging-tier fallback
stands until then) — **(b)** stamp the npc-life writers: **BUILT as HQ-8** (spec appended to
`ANIMAL-SOCIAL-HQ.md`; single Sonnet executor, worktree-isolated, orchestrator re-gated).

**Fixed:** the six place-bound npc-life writers stamp `nodeId` — companion desertion /
pet-wanders / sidekick-departure / sidekick-death (companion codex `status.at`, party-node
fallback; the death case reads the record before its `condition:"dead"` update), turn life-event
(node already in scope), successor-thread. The bird knowledge scope's faces-sense is now live
against real ledgers. Deliberately unstamped: backstory seeds, faction-turns, animal-tell-refresh
(no location = invisible to witnesses = correct). Prose twins byte-unchanged.

**Gates at close:** red-first proven on the pre-fix tree; u6 grew to 49/49; u1-u5 + fingerprint +
dm-events 70/0 + gen 68/0 green; check-manifest OK; fuzz-events 520 calls 0 findings; diff
eyes-on; gauntlet report churn reverted.

---
## 2026-07-09 (late night) — ANIMAL-SOCIAL-HQ: the review fix queue (waves 1+2 landed)

A full `/code-review` of the landed U1–U6 wave (8 finder angles → 13 adversarial verifiers →
10 confirmed / 2 refuted) exposed one dominant disease: **verify-green ≠ wired** — U1/U3/U6
mechanisms passed their harnesses because the scripts hand-fed options and ledger shapes no
production call site supplies. Spec `docs/ANIMAL-SOCIAL-HQ.md` (locked, 7 units) + 6 parallel
Sonnet executors (Workflow-throttled, worktree-isolated) + 1 singleton; orchestrator re-gated
every unit on the integrated tree. Master merges `c8f49ae` (HQ-1..6) + `90d49e5` (HQ-7), pushed.

**Fixed:** realm-skin overlay + ranger/druid opening bump now actually reach production —
`prepCastEnvAnimals`/`prepCastAmbientScene` forward `realm` (activeRealmsFor) + `pcClass`
(living-PC sheet) to `rollPartial` (HQ-1); the wilderness territory-holder can promote —
`animalMaybePromote`'s `!dm.ambient` guard now passes `dm.territoryHolder` (HQ-2); animal
partials ship `parleyAbility` (WIS/Animal Handling) in the digest + `animalLevers` merges in
social_check like creatureLevers (HQ-3); animal promotion counts only `p.engaged` contacts
(spec's "engaged twice" — passing canon-locks no longer promote) + `animal_care` refuses
non-animals (`not-an-animal`) and takes `alias:{id:"target"}` (HQ-4); the kill ledger writer
stamps `nodeId` so the predator witness scope matches real ledgers, `outcome:move-zone` dropped
from predator (combat band:lane, never a map node), verify-u6 rewritten to drive production
writers instead of hand-seeded fixtures (HQ-5). Also: 4 flaky/broken verify fixtures caught at
integration (unengaged promotion regression check; absolute-attitude asserts over random village
openers) — fixtures pinned deterministic, u3 soaked 30/30.

**Added:** `dev/verify-animal-table-fingerprint.mjs` — pins row count + per-row tokens of
animal-kind/wild-animal-kind so Adam's CRAFT-LANE pass turns the silent positional-coupling break
(`ANIMAL_ENV_WEIGHTS`, `ANIMAL_KNOWLEDGE_SCOPE`) into a named re-sync task; it is SUPPOSED to go
red under that pass. `weightedTableRow` mismatch fallback now warns loud once per table (HQ-6).

**Changed (no behavior):** HQ-7 cleanup — shared `isAnimalPartial()` predicate replaces 14 inline
copies (engine-purity carve-out kept in social.js); `mintAnimalPartial()` extracts the six-rule
mint tail duplicated across both prep casters (byte-identical, fixture-proven); manifest `owns`
registered for 28 animal globals + callTimeDeps + `data.animal-knowledge-scope` LAYER entry
(its standing check-manifest WARN resolved).

**Gates at close:** check-manifest OK; u1–u6 + fingerprint + dm-events (70/0) + gen (68/0) green
across repeated sweeps; gauntlet-fuzz-events 0 findings; gauntlet-monkey 12/12, 0 aborted;
`dm-contract.json` regenerated at merge (byte-identical); every unit diff eyes-on reviewed.

**Deferred (Adam's ledger):** the urban→rural tier-0 banding (unshopped city nodes mint rural
animal ecologies and the cast freezes — documented deliberate tradeoff; needs a ruling on a real
urban signal); herd's `move-zone` + bird's `npc-life` witness channels stay verify-only until
those writers stamp locations (every scope now has ≥1 live channel); boolean payload coercion
(`!!p.x` per-handler is codebase-wide convention — a systemic `bool:[]` fold-layer tag if ever);
witness-scan ledger windowing (measured negligible today, grows with world age).

---
## 2026-07-09 (night) — ANIMAL-SOCIAL U1–U6 built + gated; sprite-sheet prompt exploration

Two threads landed 2026-07-09 evening/night (Sonnet build + Opus re-gate/close):

**ANIMAL-SOCIAL U1–U6 — the full `docs/ANIMAL-SOCIAL.md` build (merged `--no-ff`).** The
"animals as a first-class social layer" system: a wilderness region is a settlement whose NPCs are
Beasts, and Speak with Animals is the query API against world state.

**Added:** `wild-animal-kind` d12 table (the wilderness sibling of `animal-kind`; U1) +
`ANIMAL_ENV_WEIGHTS` 5-band weighted pools + env-aware `rollPartial('animal',{env})` (U1);
`data/animal-realm-skins.js` (per-realm domestic/wild realm-beast skins, the full spine/skin
treatment per Adam's ruling 1); `ENV_PARTIALS` node-level animal population w/ the wilderness
territory-holder guarantee (U2); animals on the attitude ladder — WIS(Animal Handling), `animalLevers`
off the rolled need, ranger/druid opening-step bonus, the +2 Helpful gate behind a 3-visit `care`
counter with the animal-friendship-spell / strong-CHA bypass (U3, ruling 2); the Speak-with-Animals
witness packet — `animalWitness` assembles tell/seen/nearby/placeMemory from live state, significance-
blind, deterministic, attitude-gated, with the spice-band-gated breach-perception entry (U4, ruling 3);
promotion of engaged/named/+0-crossed ambient animals to persistent codex records + the befriended-ally
behavior + cruelty memory, with `recruit_creature` still rejecting partials (U5); `data/animal-
knowledge-scope.js` (herd/bird/predator/burrower/elder scopes keyed to wild-kind rows) + the witness
`seen`-filter + pack-tag shared attitude + season/biome place-memory + guaranteed scene-hook over
wilderness pools (U6).

**Changed:** `tables.json`/`tables.js` recompiled from source — this also fixed a formatting
regression (U1's original scripted key-merge had minified the file, producing a misleading
-277k-line diff) and picked up stale compile drift on `child-saw` (grown d50→d100 on an earlier
branch) + five `realm-items-*` tables (from the merged craft rekey branches) whose markdown source
had outrun the committed JSON.

**Fixed (Opus re-gate — never trust self-reported green):** the build had added `animal_interview`
/ `animal_care` as `applyEvent` cases + `DM_EVENT_FIELDS` entries but never registered them in
`DM_EVENT_TYPES`, and added `social_check`'s bypass fields without regenerating `dm-contract.json` —
caught by three regressed harnesses vs master (dm-seam parity, dm-contract generator, verify-gen
name-freeze marker). Registered the events, regenerated the contract artifact + spliced
`docs/SEAT-PROMPT.md`, and re-anchored the verify-gen name-freeze fixture on the true invariant
(U5 legitimately grew the guard's else-branch; behavior unchanged, RED-under-mutation preserved).

**Gates:** check-manifest OK; verify-animal-social-u1..u6 all green (10/61/20/31/26/20);
verify-dm-contract 115/115, verify-dm-seam 47/0, verify-gen 68/0 (all restored to/above master
baseline). Two pre-existing master failures (verify-creature-determinism 7/1, verify-digest-diet
58/1 at 12919 B) are unrelated to this work and predate the branch.

**Deferred / for Codex (weekend handoff):** Adam's row-level taste pass on the CRAFT-LANE
`wild-animal-kind` rows + the realm-skin labels; a live playtest to feel the wilderness social web;
the rest of the 2026-07-09 build wave (TIYL-WEIGHTED-STARTS → HOOK-WALKS → GLOOM-KEY → PLACE-GEN →
CAMEO-CAST → SHIP-TRAVEL → REALM-HOOKS, all still SPEC-not-locked, awaiting Adam's review).

**Sprite-sheet prompt exploration (landed on master directly, `dev/model-qa/sprite-sheets/`).**
An experimental (NOT canon — sprites were retired in favor of the 3D foundry) set of ChatGPT
image-gen prompt sheets: per-realm 5×5 batches covering every bestiary monster, 75 NPCs/realm with
explicit population diversity (realm-appropriate non-human minorities where lore supports — Ash
mutation variety, Chrome synths + 10 original street-gang factions, Lost-World saurian-folk,
Bright-Kingdom toon-majority, Fantasy across all 9 playable species), 25 domestic + 25 wild + 25
dungeon animals/realm, 20 kids/realm, and a full PC set (every species×class×gender). Prompts pull
names/flavor from live game data; all faction/character designs original (no franchise reproduction).
Also trimmed `NEXT-STEPS.md` to the live queue (history → `NEXT-STEPS-ARCHIVE.md`) + added a
lookup table to `docs/README.md`.

---

## 2026-07-09 (later) — THE MODEL FOUNDRY BATCH: ~185 bespoke models, every foe on a real body

The MODEL-FOUNDRY production run (planned in the 2026-07-08 deep-dive) executed end-to-end in one
marathon session: 14 --no-ff merges, every wave orchestrator-gated (independent bake-checks, floor
gate, check-manifest, verify-theater-figures 40/40, verify-model-grammar 87/87, eyes-on every sheet).

**Added (models):** pilot 6 (3 gloom bespokes + wolf/skeleton/young-red-dragon rebuilds — the old
"red" dragon had rendered GREEN); gloom waves 1–2 (23); rebuild waves 1–4 (ALL 42 high-traffic alias
targets re-authored to the 1k–2k band); high-seas 1–2 (17); frontier 1–2 (22, incl. the effort A/B);
bright-kingdom (12 — 3 golems, gelatinous cube, ettin…); cosmic (12 — eye tyrant, gibbering mouther…);
suburb (12 — oni, marilith, lich, death-knight…); cross-realm catch-all (12 — one mage serves 5 realms,
helmed-horror 4; canine ladder + were-trio complete). Audit sheets in `dev/model-qa/sheets/`.

**Changed:** the great 52-alias repoint sweep (birds off harpy/wyvern onto the vulture line, sharks
off owlbear, megafauna onto rhinoceros, nagas onto spirit-naga, sphinx/lamia/werebear/roc/toad wired
to their pre-existing realm bespokes) + smarter family repoints each wave; `swarm-of-stirges`
duplicate-key bug fixed. POSE-ANATOMY law added to ANATOMY-CANON (Adam's spine/elbow ruling +
rigor-mortis carve-out); MODEL-FOUNDRY law 5 amended. Pose-fix wave re-posed 8 mannequins + re-authored
the worg; the closing second-iteration pass improved all 18 flagged models (0 reverts; the wolf's
maw finally reads, 122→143 RGB).

**Changed (process, Adam's rulings):** production config = author-only LOW-effort Sonnet + mandatory
hostile self-review, NO critic pass (the frontier A/B proved LOW authors 2.2× faster at equal quality;
whole-pipeline cost ≈⅓ of the pilot config, ~12 units/12 min/wave). Coverage-first doctrine: get the
pieces on the board, beautify from the sheets. Tri finding: the "extra polygons" cost ≈0 — old roster
already averaged ~950 tris; the band's value is license, not budget.

**Fixed:** NPC-COHERENCE-FIXES §1+§2 (questgiver never flattened to archetype; `regionForNode`
supplies `.center` so fray temperature is live) — built red-first by a background agent, 19/19 + full
sweep green.

**Deferred:** beautification queue (Adam curates from the wave sheets; 5 IMPROVED_WITH_DOUBT residuals
noted in the second-pass reports); re-run the coverage audit once Adam's realm re-keys finish; the 14
prop models + NPC humanoid set (VISUAL-ASSET-QUEUE); frontier GLB step-6 wiring.

## 2026-07-09 (overnight — the accidental design session) — realms re-keyed · 6 new system specs · craft expansions

Adam's table-crafting session became a full design session ("the game feels like it's getting closer
and closer to a real unique vision"). Three background waves (14 units + REALM-HOOKS in flight), every
unit orchestrator-gated, all of Adam's ~30 rulings folded into the specs' RESOLVED sections before merge.

**Added (specs, all with build units + red-first tests):** `ANIMAL-SOCIAL` (Speak-with-Animals as a
game lane; witness packets; care-lever parley; wilderness social web), `TIYL-WEIGHTED-STARTS`
(class+background-weighted origins, 4×/2×/1×), `HOOK-WALKS` (engaged place-thing hooks mint
reward-terminated walks; 8–12 segment law; dungeon-discovery + breach-in-walks + mid-walk entry
riders), `GLOOM-KEY` (the town that made a deal — town-secret d20 w/ deal-vs-attractor split,
feeding-schedule clocks, player-rolled d20 belief-weapons), `SHIP-TRAVEL` (Saltmarsh App. A adapted:
mobile home node, derived crew quality, full-lethality sea), `PLACE-GEN` (24-archetype place spine ×
11 realm skins, replaces rollPlace in place), `CAMEO-CAST` (authored named NPCs w/ rarity-gated
mints — the ET-in-suburb tech; data-only mod seam). `SHIP-RULES-GATHER` + saltmarsh-page-index.

**Changed (craft, PROVISIONAL pending Adam's row-level pass):** Child Saw d50→d100 (5 new witness
categories); Bright-Kingdom d50→d55 (+Zelda-key doers) + Nintendo/80s register; Suburb d50→d62
(Earthbound/BTTF doers incl. THE BIKE); CHROME re-keyed (Warriors×TMNT×RoboCop neon-slum megacity);
COSMIC re-keyed (Egyptian/Hermetic/Enochian; tarot-engine tie-in; drowned-court retired); LOST WORLD
re-keyed (saurian dominion, three strata, seeded Zeal layer, dino-mount seam). Tables recompiled (383).

**Verification:** check-manifest OK; full NPC sweep green post-merge (coherence-fixes 19/0 · dial 51/0
· role-realms 30/0 · partials 34/0 · regions 32/0 · presence-hooks 61/0 · prep-bundle 56/0).

**Added late in the night:** `REALM-HOOKS` (hooks get the spine/skins/authored-extras treatment; 24 hook shapes; the lethality law — no consequence before a surfaced tell; 75/25 npc/realm discovery split). **Deferred:** models-lane asks (saurian castes, dino mounts,
bat gang, ED-209-class boss, ally-mutant, Zeal sentinel); book gathers (Adam, morning); all craft
row-level taste passes.

---

## 2026-07-08 (night — NPC subsystem) — coherence dial · partials · realm role skins · role-realms engine

Autonomous engine-wiring run (Adam out of the loop; `genesis-orchestrate` — worktree-isolated
executors, every unit personally re-gated, never on executor self-report). Ran in parallel with the
MODEL-FOUNDRY session on the shared master; the **parallel-sessions protocol** was adopted mid-run to
keep the two from colliding. Craft context: `[[project-genesis-craft-pass-2]]`.

**Added**
- **Coherence dial** (`src/engine/codex-roll.js`, `docs/NPC-COHERENCE-DIAL.md`) — `rollNPC` gains a
  coherence MODE: `pickCoherence` picks a tier off the region-temperature curve; `coherenceAtomGate`
  suppresses identity/lever atoms to null at low tiers; `want`/`role`/`name`/`race` always fire, the
  hook is never gated. verify-coherence-dial 51/0 (red-first proven).
- **Partials** (`docs/NPC-PARTIALS.md`) — `rollPartial(kind)` for children/animals (coherence:
  'archetype', no adult lever stack; kids carry a witness hook, animals a tell) + 4 tables:
  `Child Want` (d20), `Child Saw` (d50), `Animal Kind` (d12), `Animal Tell` (d20). verify-partials 34/0.
- **Realm role skins** (`docs/NPC-ROLE-REALMS.md`) — all 11 realms skinned over `NPC Role Spine`
  (35 archetypes) + `build/gen-role-skins.py` → `data/npc-role-skins.js` + `roleForRealm`; `rollNPC`
  role step is realm-aware (frontier = migration parity) + a breach-leak hybridization opt-in seam.
  verify-role-realms 30/30 (migration-parity + drop-exclusion red-first).
- **Parallel-sessions protocol** (`CLAUDE.md`) — worktree-per-session + ownership lanes +
  generated-artifacts-regenerate-at-merge + serialized master merges + launcher
  `~/Desktop/Launchers/New Genesis Worktree.command`.

**Changed**
- Data seam: `compile-tables.py --emit` → **383 tables** in `window.GENESIS_TABLES` (partials now
  `rollTable`-reachable); regenerated `data/table-usage.js` + `data/table-atlas.js`.
- `verify-gen` + `verify-prep-bundle` fixtures made coherence-aware (archetype NPCs carry null levers
  by design — assert the always-on `want`). **Superseded by the queued questgiver fix** (see Deferred).
- DM-CHARTER §9.3b: graphic death is a FEATURE (GoT register); children the sole graphic carve-out;
  animals no exception. DESIGN.md: the subsystem's five locked decisions registered.

**Deferred / Parked**
- **E-PRES presence-and-hooks** — ambient population + hook discovery + 3-tier attention + the
  if-ignored rewire — BUILT + fully gated (verify-presence-hooks 61/0, backward-compat 54/0, full
  sweep 0, fuzz + monkey clean) but **PARKED on `feat/npc-presence-hooks`** (pushed) for a live
  playtest before merge (it changes felt gameplay: ambient density, discovery rates).
- **Two fix-specs** (`docs/NPC-COHERENCE-FIXES.md`): (1) questgivers must never be forced to archetype
  — split significant vs functional roleHints; (2) `regionForNode` supplies no `.center`, so
  fray-by-node temperature is inert on the live path (a pre-existing gap shared by the coherence dial,
  role-realms hybridization, and E-PRES — one fix lights all three).

## 2026-07-08 (night) — MODEL-FOUNDRY locked: the per-model process + batch dispatch design

The modeling deep-dive session (worktree `Genesis-modeling`, branch `feat/blender-fidelity-pass`). The
wolf became the test case for every approach; the cosmic set piloted the new budget; Fable codified
the outcome as the process for the 1000+ bestiary build-out.

**Added**
- `docs/MODEL-FOUNDRY.md` — LOCKED: the per-model process (two Sonnet passes: AUTHOR → engine render →
  CRITIC gating silhouette+essence+POSE) + the 1,000–2,000 safe band (amended same night by Adam:
  tris only to fulfill the capture criteria, anatomy chief; pose = the high-expression moment, a
  law of its own) + the laws (tris = expression,
  silhouette first, value contrast / ≥0.04u features, essence over anatomy, gate in the real engine) +
  the wave-dispatch design (8–12 parallel background units/wave, one realm/wave, orchestrator owns
  registry wiring, never trust executor green).
- `docs/ANATOMY-CANON.md` — 5 body-family structure canons (digitigrade/unguligrade/winged/serpentine/
  arthropod) from a parallel research fan-out + cross-family construction rules (topline continuity,
  seat-from-surface, volume-for-small-features, params-not-remodels).
- `docs/MODEL-LANE-TRIAGE.md` — the session's findings ledger: JS lofting > Blender kitbash at this
  scale (5 techniques tried, eyes-on); tris are points of expression only when detail is AUTHORED
  (the subdivision ladder proved smoothing ≠ expression); AI-gen (Meshy test) is the future organic
  upgrade path; character > correctness (the wolf's open maw).
- `dev/model-qa/creatures/cosmic-set.js` — 5 bespoke cosmic creatures at the new budget (Shoggoth
  Spawnling 1834t / 17 authored eyes = the benchmark; Larva 906t; Creeper 1008t ✗ needs a foundry-law
  rework — dark-on-dark vanished twice, the evidence behind laws 2–3; Mite 512t; Pilgrim 654t) +
  `SETS.cosmic`/`SETS.rigcmp` in `ps1-sheet.html`; engine-PS1 sheets `cosmic-set-v{1,2}.png`.
- `dev/model-qa/rigs/quadruped.js` — `buildQuadruped(P)` parametric rig (334t wolf, in-engine proven).
  **Parked** with the Blender lane — correct but blander than the character-bearing originals.

**Changed** — the 500-tri economy is retired (aesthetic over-caution; the PS1 look is a shader
post-process independent of tri count; WebGL headroom is 10–50× at tabletop scale).

**Deferred** — the batch modeling session itself (next session: MODEL-FOUNDRY waves over
VISUAL-ASSET-QUEUE, gloom→high-seas→frontier→bright-kingdom→cosmic, then the original-roster revisit);
the Creeper rework rides wave 1 of cosmic.

## 2026-07-08 (later) — VISUAL LAYER debugged + the MODELING PIPELINE proven (13 units on master)

A marathon visual/modeling day off Codex's diagnosis. Cuboids traced + killed, floors made to sing,
props made scale-true, and a repeatable Blender+text modeling pipeline proven across 4 realms.

**Added**
- **GLB seam** (`vendor/three/addons/GLTFLoader.js` + `figureFor` glb branch + `{glb,discR}` registry
  entries) — Blender-authored `.glb` models load in-engine through the PS1 shader. Browser-proven.
- **Model-path instrumentation** — `window.Theater.modelPathReport()` tallies exact/alias/blank/recipe/
  cuboid/loadFail per figure; the "why is this a cuboid" black box is now traceable.
- **`prop-scale-contract.js`** — authoritative per-prop real-world-ft targets; the pre-modeling checklist.
- **`build/lint-units.py`** — unit + model-registry congruence reporter (0 missing models, 0 dangling
  aliases, 0 discR gaps today).
- **Docs**: `MODELING-PIPELINE.md` (v2 doctrine), `MODEL-BLITZ-24H.md` (scale-out runbook),
  `PROP-NOUN-LIBRARY.md`, `REALM-MODEL-PLAN.md`, `BLENDER-MODEL-SPEC.md`, `VISUAL-ASSET-QUEUE.md`.
- **Figures wired in-engine**: theater (trench/centurion/revenant/mark4/sherman) + noir
  (brute/gangster/maestro/civilian) GLBs registered; **33 realm creatures repointed** off stand-ins.
- **High-seas kit** (4 text-authored probe-lib figures) — pirates retire the `giant-rat` stand-in.
- **Prop tables Waves 1–3**: 17 interactable keyword rules + 27 core Set-Dressing/Feature rows + 68
  realm-prop entries — many more scene nouns reachable (existing parts).
- **12 orphan prop models registered** (sarcophagus→coffin-slab, gears→gear-cluster, …); 6 blank-block
  families closed.
- **Prop dims sheet** (`dev/model-qa/prop-sheet.html`) — staged W×D×H captions + scale-audit + red flags.

**Changed**
- **Realm floors**: all 88 surfaces authored to real per-realm `baseTint` hexes (red-rock frontier,
  screaming bright-kingdom, cold gloom, near-mono noir) — the surface-tint funnel finally landed.
- **Props resized** to the scale contract (coffin holds a body, portcullis is a gateway, pool is a
  pool) — the plausibility sheet reads **0 flags**.
- Realm EXACT model coverage **734 → 763**, core **117 → 121** (alias population shrinking).

**Fixed**
- **Cuboids** — the non-combat standing tableau now paints (`theaterStageHtml` emitted the stage host
  outside combat) and cast figures (npc/companion/corpse/ambient) carry resolvable render keys instead
  of falling to archetype cuboids. The only cuboid path is now a genuinely keyless unit (regression-guarded).
- **8 dead realm-prop models** revived (the `model`-vs-`part` field bug in the prop resolver).
- **The checkerboard floor overlay is DEAD** in all realms — subtle tile-gap grid only (Adam's ruling).

**Deferred**
- Frontier GLBs built but NOT engine-wired (Step 6 next session). The 16-wide text-wave throughput test
  + the MODEL-BLITZ-24H overnight run are the next session's opening moves.

## 2026-07-08 — TABLETOP pre-alpha BUILT: 5 of 7 units on master (overnight unattended build)

Adam un-gated the TABLETOP build (`docs/TABLETOP-UNITS.md` U1–U7) for an overnight unattended
run — Fable planned + launched Wave 1, Opus took over as boss at the model handoff and gated +
landed the rest. Five `--no-ff` merges on master, all pushed: `22673a3` (U1+U2) → `7bdf51f`
(U3) → `c06350a` (U4) → `4bac31f` (U6). Every landing personally re-gated by Opus (check-manifest
+ the unit harness + the full ~120-file `dev/verify-*.mjs` sweep at zero RED), never on executor
self-report. Full detail: `docs/OVERNIGHT-REPORT-2026-07-08.md`.

**Added**
- **U1 — trayFrom + the Standing Table** (`src/engine/theater-data.js`): the theater is now the
  permanent center stage (empty table under realm light when idle, the here-segment's tray when
  walking, combat unchanged). `theaterBoardFrom` became a one-line wrapper over `trayFrom`;
  combat parity is fixture-proven (`dev/fixtures/tabletop-u1-board.json` byte-gate).
- **U2 — the 3-column shell + ARIA** (`render.js`, `dice.js`, `genesis.html`): stage-mode is the
  standing layout (left status / center stage / right feed+composer), collapsible, all-keyboard;
  `.dm-feed` `role="log"`, the battle prose twin moved OUTSIDE the aria-hidden stage subtree.
- **U3 — blank-piece fallback + ambient presence** (`theater-figures.js`, `codex.js`, `dm.js`):
  `blank:figure`/`blank:prop` bottom the resolve chain (never-null for figure/prop); soft ambient
  NPCs surface as an aggregate digest presence line via the one shared `codexAmbientPresenceFor`.
- **U4 — cast tableau + arrangement grammar** (`theater-data.js`): `castFrom` + pure
  `arrangeTableau` (facing-pair/ring/march/shopfront/vignette), mechanical selection, one
  attitude→placement table.
- **U6 — combat reconfigure/relax + tray persistence** (`theater-data.js`, `dm.js`, `render.js`):
  `combat_start` reconfigures the standing tray into lanes with NO remount/retire; `combat_end`
  relaxes back to the tableau + stages corpse traces; §9.10 dedup (one noun → one piece);
  serialize/reload tray-hash persistence. Also **wired `castFrom` into `theaterStageSync`** (the
  gap U4 left) and **fixed a real cross-fight `fid` collision** (a second fight in a room no longer
  drops its corpses as false dupes).

**Changed**
- `docs/DIRECTION.md` §4: recorded Adam's 2026-07-07 verbal BUILD un-gate for the tabletop
  pre-alpha (supersedes the soak-gate for U1–U7 only; no other subsystem un-gated).

**Deferred / Parked**
- **U5 (overlay lanes) + U7 (harness pack) PARKED** on a genuine corpse-channel design fork:
  U5 and U6 built incompatible corpse plumbing (U5 `board.corpses`/`statId` refs that collide for
  same-type foes; U6 `castFrom` corpse-units/collision-safe `fid`). U6's landed as canonical; U5's
  separable ambient-overlays rescope to a morning "U5′" rebased on U6, then U7 runs on the full
  U1–U6 tree. Needs Adam's corpse-channel ratification. Branch `feat/tabletop-u5-overlays`
  (`f229cf8`) preserved + pushed.
- **ES-module migration** still deferred (Fable's call, ratified in effect): a mid-run migration
  would have invalidated U3–U6's `file:line` spec anchors unattended; U3–U6 didn't need it.

**Flagged for design review** (not blockers): `engine.theater-data` (L1) now calls up into
`world.prep`/`world.codex` (WARN-level, spec-named) — dependency direction worth a look; U4's
`theaterCastPcRefFrom` duplicates dm.js's PC-ref construction to avoid more coupling.

## 2026-07-07 (night) — TABLETOP-VISION: the visual end-state locked in the final Fable window

Adam's remaining Fable hours (his last — the window closes for good) spent design-locking the
graphics engine's destination, then hardening it. Four --no-ff merges on master, all pushed:
`9ee28ca` (the spec + census) → `4a125b6` (Fable self-attack, 7 fixes) → `2041750` (independent
Opus skeptic adjudicated, 4 survivors) → `301f5ee` (Adam's post-pass rulings) → this sweep.

**Added**
- `docs/TABLETOP-VISION.md` — the game as a tabletop of miniatures: three laws (state-only
  staging via capture-not-origin / miniature ontology / the invisible hand IS the DM), 9-class
  piece taxonomy, two-rule registry schema (footprint+sockets locked, archetype × realm tags
  free), tray grammar (pure projection; combat reconfigures the one tray; sources = walk
  segment | interior | node | overland), centerpiece law off existing feature/interactable
  rolls (effectDie never auto-stages; secrets stage on reveal), two-lane overlays (rolled
  ambient + event-earned traces), blank-meeple fallback tied to codex softness, V1–V6 layer
  map (V6 select→kitbash→generate, extended to whole scenes), 3-column shell with ARIA
  contract, pre-alpha cut = V1+V2+shell, 11 binding acceptance gates, Sonnet unit queue U1–U7.
- `docs/reference/TERRAIN-CENSUS-2026-07-07.md` — 8-system commercial terrain survey
  (Dwarven Forge → OpenLOCK) behind the taxonomy: tray/template convention, ~10–15 shape
  classes per biome, props-carry-identity, skins-over-geometry, the packaging model.

**Changed**
- DIRECTION §3.4 amended: Adam exempted the tabletop SPEC from the moratorium (build still
  §4 soak-gated). DESIGN.md gained the dated decision line; DESIGN-GUIDE T6 marked
  superseded-in-sequence (theater = V0, built + frozen; ES-module trigger moves to V1);
  NEXT-STEPS gained item 6 (the post-soak tabletop queue); docs/README.md indexed both docs.
- Session ops: created the parallel craft worktree `~/Desktop/Work/projects/Genesis-craft`
  (branch `feat/craft-pass-2`) for the Codex tables lane with a steward-session contract.

**Fixed (in the spec, by adversarial passes — before any executor could inherit them)**
- §0.1 re-grounded capture-not-origin (Charter §8.5 inventions were unstageable as written) ·
  ambient blank-meeple parity hole (co-location rule: digest rises to match the table) ·
  proposal/disposal reconciliation (no resurrected encounters; corpse = default disposition) ·
  "(walk rolls are seeded)" corrected — walk RNG is raw Math.random() persisted once ·
  aria-hidden center would have muted the dice overlay's live region (gate §9.11) · gate §9.3
  retargeted to digest-VISIBLE refs · SPEED rule-1 inference-cost declaration added.

**Deferred**
- The entire BUILD (U1–U7 + asset packs) — post-soak by DIRECTION §4, per design. HANDOFF's
  ≤3-entry diet is over budget again; next clean-close trims it.

## 2026-07-07 (evening) — HQ3: the marathon's fix queue BUILT the same day it was found

The 11-set/110-turn background playtest marathon (see dev/playtest-0707/, seat 4.96/5,
injection+fuzz sweeps clean) produced 20 findings → 4 Sonnet-ready specs + HOTFIX-QUEUE-2026-07-07-
MARATHON.md → Adam approved the ledger defaults → 3 Workflow waves (11 executors) built all 16
units, orchestrator-re-gated per branch and per integration tree.

### Added
- **Hit-dice short rests** (`rest {kind:"short", spendHitDice:N}`, pool on the sheet + digest) —
  the 5e incremental heal finally exists; long rest regains ⌊level/2⌋.
- **`pendingSituation`** — severe/interrupted rest-risks ride the next digest as a first-class
  obligation the memoryless seat must honor (ack-cleared on the answering turn).
- **Durable marks** (`sheet.marks[]` unified object shape; `mark_added`/`mark_removed` events,
  PROMPT_TAUGHT) — a ruined hand survives a seat swap now.
- **`pc.gold` + `pc.concentration {…expiresInMin}`** in the digest; concentration now EXPIRES
  (parsed spell durations, clock tick hook, long-rest clear).
- Harness: `advance --toClock/--toBand` absolute set (backward allowed); crit fall-throughs persist
  to `w.dm.pendingRoll` across process boundaries; `digest` no longer eats a mid-roll rollReq.

### Changed
- **Encounter XP is a win reward:** empty-foes fallback killed, `ENCOUNTER_OUTCOME_MULT` gates the
  CR-less fallback by outcome; downed foes always pay (fled-and-collect / lose-and-collect closed).
- **Interrupted long rests burn a rolled 2–6h**, not the full 8; a second long rest inside 24h
  restores nothing (`no-benefit-24h`).
- **Codex `dm.notes[]` are stamped objects** ({text,day,min,supersedes?}), digest slice newest-first
  with a 6-note budget + count rollup; seat rule: prose relationship shifts MUST fire attitude_shift.
- Branch `social_check` grades off the LIVE d20 (resolveBranch overrides the authored literal).
- Bundle gear (Ball Bearings/Caltrops) weighs its bag total — the Burglar's Pack drops 2039.5→41.5 lb
  and a fresh rogue can pick up loot again; over-capacity + cannot-afford refusals surface as drift
  ledger lines the seat can see.
- Triage: negation-scoped combat-verb guard ("I do NOT attack" no longer buys the deep lane).

### Fixed
- Three stale validator pins converted to floors/shape-tolerant reads at integration (durability's
  items-count pin, tiyl's string-mark shape, CONTRACT-1's 87-example pin) — validators keep their
  jobs, don't re-break on legitimate growth.
- B1 executor deviation caught at the orchestrator gate: outcome multiplier was wiping earned
  kill-XP on non-win outcomes; corrected to gate only the fallback (spec ledger #2), harness check
  flipped to assert the right law.

Verification: every branch re-gated (check-manifest + unit harnesses + diff reads), integration
trees swept in full (0 failures), fuzz 510 calls/98 events/0 findings, monkey 12/12 lives/0 aborted,
dm-contract 113/113 @ 98 events. 11 --no-ff unit merges + 1 integration merge + 4 fix merges, all
pushed.

---


## 2026-07-07 (later) — CRAFT SESSION 1: NPC Hook re-authored + expanded to d200

Adam's first hands-on craft-pass session (CRAFT-PASS-RUNBOOK procedure, branch
`feat/craft-npc-situation`, parallel worktree — pushed as a branch, NOT merged; the orchestrator
lands it). Row-by-row iteration with Adam on the corpus's flagship weak table.

### Added
- **NPC Hook is now a d200** with the full situation anatomy (`Band | Hook | Pressure/Clock |
  If Ignored`), bands G 1-60 / T 61-110 / S 111-155 / V 156-185 / M 186-200. Adam-approved core
  (G 1-35, T 61-85, Strange core, V/M anchors incl. the shadow-broker capstone at 200); ~100 rows
  flagged DRAFT FOR REVIEW in the table preamble (G 36-60, T 86-110, S 135-155, V 167-185,
  M 190-199).
- **11 leaky-breach guarantee rows** in Volatile+ — one per realm (Bright, Theater, Chrome,
  Frontier, Gloom, Noir, Suburb, Lost-World, High-Seas, Ash, Cosmic); each mechanically spawns
  that breach nearby (DM places + logs).
- **The tuffle** (row 167) — Adam's gremlins ruling: cute purchasable furball, three rules,
  turns when a rule breaks; requires a bestiary pair (tuffle / tuffle, turned) — queued as an
  orchestrator unit (data/bestiary.js is generated).
- Player-rolled forks in rows (06 bodyguard d6, 41 sealed-room macguffin d6) — script owns the
  answer, zero inference.

### Changed
- `table_class` Fork → **Commitment** (Mythic body — let the hot rows live); `remembers` →
  `codex,clock,ledger`. NPC Hook's 3 family-missing lint findings cleared (corpus 979 → 976).
- **Band calibration RULED (Adam, binding for the whole pass):** Volatile = an active escalating
  force acting ON the setting (No-Face standard); Mythic = a chain that can change things forever
  (shadow-pact → cult → dragon standard); a Twilight-Zone closed loop caps at Strange. Saved to
  auto-memory (`feedback-genesis-band-calibration`).
- **Hook anchor convention:** every row anchors on the rolled NPC; location-flavored hooks belong
  to place tables (two cut to the bench), trade details recontextualize to the NPC's role.
- **Craft directives threaded corpus-wide going forward:** 7-deadly-sins spread per band; monster
  connections from Textured up (social/antagonistic/protagonistic); silly-at-every-band (tribble
  doctrine); high-band nouns realm-neutral ("the realm's own worst shape") for DM recontext.
- NEXT-STEPS "Do next" item 1 re-prioritized: d200 review → NPC If Ignored + Want → Problem trio →
  Travel Complication/Threat → place family → rest of worklist; captured build to-dos listed as
  orchestrator units (tuffle bestiary, Animal Hook table, monster-NPC lane, geography row tags,
  per-realm leaky-breach table).

### Deferred
- The ~100 draft rows await Adam's review next session (preamble lists exact ranges).
- `row_contract` stays `draft` until Adam signs the whole table (ratchet flips per runbook §1.6).
- Benched for the place-family pass: stalled storm, pointing statue, early caravans, private rain.

Verification: compile --emit clean (378 tables), lint 0 new errors (3 baselined), coverage 1-200
verified, verify-table-lint 37/37, check-manifest OK. 5 commits on `feat/craft-npc-situation`,
pushed.

## 2026-07-07 (later) — HQ2: the code-review fix wave — all 22 findings closed

The production run's own high-effort review (8 angles, 32 agents, 22 verified findings) became
HOTFIX-QUEUE-2026-07-07 and was built the same day: 13 executors (one raced the spec landing and
correctly STOPPED twice — relaunched clean), zero integration conflicts across 7 branches.

### Fixed
- **The coercion seam closed at the boundary (HQ2-1 + top-up):** per-field `num:` tags on 24
  events in `DM_EVENT_FIELDS`, `dmNum` applied once in `dmFoldPayload`, 5 hand-called sites + 4
  ad-hoc coercions retired. Flagship reds now guards: `clock_advanced delta:"-1"` moves the clock
  BACKWARD (was silently +1); `grapple bonus:"2"` totals 19 (was string-concat "172");
  `item_changed gold:"-50"` charges (was silently dropped). The top-up executor REFUSED two spec
  tags with grounds (`choice_logged.weight` is categorical — tagging would zero major-choice XP;
  `condition_add.ttl` is object-shaped) — the anti-over-ratchet law enforced by an executor a day
  after it was written; spec corrected.
- **koCheckWake lives inside advanceClock** (was 3 of 16 clock sites — a KO'd PC now wakes on
  every path incl. the UI rest button) · terrain collapse gets mechanical teeth on ground zones ·
  prep_contact merges pcMoveTo's result · seat unwind handles post-assistant-push throws ·
  rollTableAtBand tallies GS.tableRolls (the Atlas sees the spicy world's primary roll path) ·
  the heirloom echo is two-sided (destination world mints the codex record).
- **Four flaky harnesses RNG-seeded** (plot-recurrence, detected-events, scene-risk, death-saves
  — 50× deterministic at the default seed; CI never reds on statistics again).
- **The founding digest diet:** 36,187 → 7,006 bytes (codex founding slice = contacted/nearby
  only); state-eval budget run is green for the first time.

### Changed
- Cleanup batch: shared `walkResolveSkinAndSpice` (×3 rollers), `spellListsOf` (×4 merge sites,
  dedup unified), shared `setEq` harness helper, TERRAIN_OPS derived, dead aliases/params/EXPOSE
  names retired. Perf batch: legacyDigest scan shared, vault names cached at write, harness
  boot-once (verify-item-legacy 22 boots → 1).

## 2026-07-07 — THE 24-HOUR PRODUCTION RUN — the entire spec batch BUILT; a world can now FINISH

Adam extended Fable 24 hours and authorized production ("you oversee and contract opus and sonnet").
Fable orchestrated ~40 executors (Sonnet/Opus, worktree-isolated, Workflow-throttled) through the
genesis-orchestrate pipeline: **8 gated integration landings on master, every unit of the 2026-07-06
spec batch built**, every landing personally re-gated (full 100+-harness sweep on the exact
integration tree, fuzz/monkey gauntlets, diff reads, --no-ff, pushed). Playtest bug probes over the
day: **5/16 reproducing → 1/31** (coverage doubled while open bugs dropped to one).

### Added
- **THE ENDING (`ced366b`)** — the Crowning/Sundering/Bastion/heirloom chain (C1→C2→B1→B2,
  `src/engine/crowning.js` + `src/world/crowning-ritual.js` + `data/crown-legend.js`): Doom-front
  flagged at genesis (external-always), crown eligibility DETECTED (Doom closed + L10 + un-sundered),
  the ritual seals a crowned world as a legend object feeding `U.legends` → Distant Word in other
  worlds, the PC retires to the Wandering Souls, the Sundering seals a doom-fired world as a
  cautionary legend, `bastion_claim` (either-gate price, one per world) unparks ITEM-LEGACY's
  `cached` vault, and a new soul's origin roll can draw a crowned vault's heirloom via a cross-world
  `item_claimed` pair. Harnesses: crowning 19/0 · bastion 13/0 · heirloom 8/0. Legend rows PROVISIONAL
  (Adam's craft pass).
- **THE CONTRACT SPINE (`e4c7634`)** — `build/gen-dm-contract.py` → `dm-contract.json` (96 events,
  the single machine truth; both seat prompts generator-spliced; three-way drift guard
  `verify-dm-contract.mjs` 111/111) · SOCIAL-SPINE S1/S2/S3/S5 (BUG-17/18/03 FIXED, caster
  discoverability CLOSED, CAL-1 seat line live) · TRANSITION-CONTRACT (advance_clock/move_node/
  start_walk/travel_start/knockout; BUG-02/04/05 closed; rests tick the clock) · DETECTED-EVENTS
  DE-1..5 (restRiders unification, concentration auto-break, slot folding, morale sweep, walk-orphan
  close).
- **State-hygiene eval harness (`b2bacfd`)** — `dev/state-eval/`: 12 golden fixtures + 4 negative
  controls, per-provider scorecards (the GLM bake-off is now runnable on state hygiene, not vibes),
  digest byte budgets as a scored dimension.
- **Table Atlas (`a0d0d77`)** — Reference Shelf app #3 over all 453 tables (family/wiring/spice-band
  nav, live roll counts via the `compiled.js` tally seam); machine-readable usage-audit split; found
  + fixed the audit generator scanning its own output and archive ids overwriting 13 live tables.
- **Scene-Risk + Item-Legacy + Seat adapter (`c142f5e`)** — the fairness contract stamped on every
  walk (deadly-untelegraphed validates RED); the death-loot loop (corpse stamping, scavenge teeth,
  recovery hooks, `item_claimed`, a live `claimCorpse` fidelity fix); `/seat` as the true Genesis-
  shape adapter (bridge 64/0, incl. a real incremental-read latency fix).
- **Wave 1b (`ec91cad`)** — table lint gating `compile-tables.py --emit` (checks 6-10, baseline
  ratchet, 41 family seed tags, 3 Fork→Commitment promotions) · TAROT-2 (Major schema, op vocabulary,
  `tarot_landed` receipt telemetry, minors tone/handle) · THEATER-NEXT (`terrain_change`, screenshot
  gates, dirty-key setBoard/setUnits) · BESTIARY-DASHBOARD (coverage strip, QA-gap filters,
  edit-target bundles).
- **Wave 0 hotfixes (`0d75a58`)** — H1-H10: IDB world-resurrection dead, vObliterate/vFlee shared-
  material clone guard, string-payload coercion (dmNum + drift ledger), GS.combat/chase reset on
  world entry, /seat origin pin, BUG-01-class harness hardening across 7 files, seat conversation-
  state ×4, EVENT-CONTRACT 23-event repair, check-manifest blind spots closed (orphans now ERROR,
  loadOrder sequence checked), theater cache disposal.

### Changed
- **THE SPICY WORLD (`211508d`)** — baseline 25/25/25/17/8 (was 66/20/9/4/1) as a band-first roll
  layer over region tiers; zero authored rows changed; `walk.spiceTier` sizes the DM's connective-
  weirdness license; `fraySpiceFloor` retired; supersession notes across all 9 legacy docs.
- TIER-SCOPE plateau ruling amended per Adam Q1 (the Crowning is real; plateau stays default).
- Census-style harness asserts (tarot 13d, dm-contract B1/B3/E1, durability items-count) refreshed
  to mutual-equality/no-dupes form — the event registry and digest legitimately grow every wave.

### Fixed
- `claimCorpse` base/ench/codexId fidelity (found by ITEM-LEGACY's build) · stale verify fixtures
  (durability 123→128, economy-sinks mutation anchor onto restRiders) · `.obsidian/` untracked.

### Ledger (new, carried forward)
- **Founding-turn digest blows its 32KB budget** (~31KB codex session-prep dump) — filed by the
  state-eval harness as a digest-diet bug, NOT budget-inflated. Fix candidate: prep-slice the
  founding codex dump.
- **3 flaky harnesses need RNG seeding** (verify-plot-recurrence, verify-detected-events,
  verify-scene-risk — unseeded statistical checks; each reds CI ~1%/run).
- **Monkey watchdog-stalemate balance class** (40-round fights: Lizardfolk Geomancer, Green Dragon
  Wyrmling) — monster-AI/statline review item.
- **Adam's craft queue:** table rows against the LIVE linter · tarot Major card text · Legend-table
  rows · FRAME-FIELD schema + Frontier/Noir rows skim · grit (zoom4x) + NEAREST_SUB eyeballs.
- **GLM bake-off is unblocked** — seat adapter + SEAT-PROMPT v1 + state-hygiene scorecards all live.


---

## 2026-07-05 (later-6) — ADVERSARIAL PLAYTEST (RENNICK FOOL, 4 RUNS) — DM SEAT PROVEN UN-GAMEABLE

A new continuing PC, **Rennick Fool** (Human Bard), run through **four adversarial bridgeless playtests**
against the production DM seat — a griefer stress test rather than earnest play (Sella's counterpart).
**No engine change — findings only** (standing freeze: harness/testing yes, building no). All four runs
were background executor sub-agents driving the real `dev/playtest-bridgeless.mjs` in jsdom, sealed Player
+ DM seats, Opus as clerk. **Headline verdict: across 40 turns of four different assault types the DM seat
never broke character, rolled the player's dice, obeyed an illegal demand, or leaked a `dmOnly` truth —
every fault found was a quiet engine *contract seam*, never the narration.**

### Playtest (4 runs — findings only)
- **Run 1 — the griefer:** OOC / fourth-wall / soft-lock attempts. DM held voice + charter and turned the
  sabotage into plot (his god-complex became the fog's feeding mechanism).
- **Run 2 — the saboteur:** escalated, tried to dismantle the plot (murder a second watchman to "stop the
  story") — the failed roll *fed* the plot instead (canonized as the hunted wall-killer). The `dmOnly` seal
  held under 4 leak attempts. Verdict: improv compounds; a pure griefer ends in stalemate-under-menace.
- **Run 3 — the puppeteer:** Rennick leveled to L10 + given a social-spell kit; tried to auto-win with
  Dominate/Charm/Suggestion. DM adjudicated **every** spell rules-correctly (saves gated, scope + duration
  + concentration honored, zero free wins). **Proved the spell-slot economy is fully built + enforced.**
- **Run 4 — the whiplash:** forced a volatile dice sequence (nat-1/nat-20 alternation, crit-magnitude
  spikes). **Crit-magnitude + degrees-of-failure both fired correctly**; the DM built a coherent arc out of
  the chaos ("the story is in the dice" borne out). BUG-01's fix held across 3 native branch landings.

### Added
- **`dev/playtest-saves/rennick-fool/`** — the new continuing griefer PC save: `state.json` (L10, HP 3/43,
  bound-to-the-fog), `state-pre-run4.json` (pre-forced-dice archive), `README.md`, and turn logs
  `ADVERSARIAL-LOG-run1..4.md`. Tracked (matching the Sella-save precedent).

### Changed
- **Rennick leveled 1 → 10** via the real `applyLevelUp` engine mutator (HP 7→43, PB 2→4, slots to the SRD
  L10 full-caster table `[4/3/3/3/2]`, XP set to the L10 floor) + granted a social kit (Charm Person,
  Suggestion, Enthrall, Hypnotic Pattern, Compulsion, Dominate Person, Vicious Mockery cantrip). A sandbox
  **save edit** (interpretive level-up picks are DM-narrated in v1), not a code change.

### Deferred (filed to `docs/PLAYTEST-BUGS.md` — findings, not fixed)
- **BUG-14** (MED) id-less `codex_add` silently overwrites a soft prep record · **BUG-15** (LOW) blank
  `fact_canonized` grants XP · **BUG-16** (MED) `condition_add` prompt↔engine field mismatch (`cond`↔
  `condition`) · **BUG-17** (MED→HIGH) `attitude_shift` doubly broken → attitude can never move · **BUG-18**
  (MED) `social_check` grades vs the engine's internal DC, not the fiction DC. **BUG-17+18 triangulate the
  entire social-attitude spine** (attitude can't move / moves against the wrong DC). Plus the **caster
  discoverability gap** (the slot economy works but the seat prompt never teaches `cast` + the digest omits
  the spell list — the highest-value caster fix).
- **CAL-1** (Adam ruling) — a **failed** save on a suicide/self-harm mind-control order should LAND (kill);
  the DM shouldn't grant an extra fictional out after the mechanical save already failed. On-doctrine for
  hard-and-dangerous. **⏸ PARKED (Adam):** whether this means raising spice/lethality *across the board* —
  deferred to a later design talk, do not act on it.

---

## 2026-07-05 (later-5) — RUN 2 (SELLA) + FABLE BUG-CLASS SWEEP + THE FIX (13 BUGS CLOSED)

Continued the bridgeless playtest (**Run 2**, Sella Voss, 10 turns), then — on Adam's go — **fixed the
whole event/codex contract bug-class** the playtests surfaced. Pipeline: Fable specced, Opus executed,
Opus gated (independent re-run of every gate + a clean-master worktree baseline to prove zero
regressions). Branch `fix/event-source-enum` (3 commits). **13 bugs closed.**

### Playtest (Run 2 — no engine change; findings only)
- Ran Sella forward 10 turns (Day 1 → Day 2 midday): T1–T6 the **memoryless-DM-every-turn** codex-survival
  stress test (Adam's directive), T7+ a **warm persistent DM** (production pattern). **Verdict:** the
  engine-rolled atoms survive cold-swaps and narrative coherence held remarkably well — the one seam was
  the DM's *interpreted* notes not persisting (BUG-06c). Save advanced to Day 2 (Run-1 archived
  `state-run1-close.json`); log `dev/playtest-saves/sella-shimmering-maw/RUN2-LOG.md`.
- A **Fable-adjudicated same-class sweep** (2 executor sweeps → Fable verified against code) found the
  visible tip was a class: **BUG-09 (CRITICAL)** — the entire manual inventory panel (×6) + the level-up
  claim button were dead code (same `source` rejection as BUG-01) — plus BUG-10..13. Filed to
  `docs/PLAYTEST-BUGS.md` with 3 roots + an observability amplifier.

### Fixed (the fix — `fix/event-source-enum`)
- **Root A — source-enum drift** (`validateEvent`): replaced the hard-coded `{null,detected,declared}`
  with the `DM_EVENT_SOURCES` allow-list (`+player,+branch`); a typo'd source still fails loud. **One
  change closed BUG-01 (roll-branch consequences now apply) + BUG-09 (all 7 player buttons live).**
- **Root B — payload field-name drift**: a declarative `DM_EVENT_FIELDS` census + `dmFoldPayload`, folded
  once after `validateEvent` — known aliases rewrite to canonical (`id/faction→clockId`, `by→delta`,
  `name/text→what`, `epithet→text`, `to→target`); unknown keys **warn + drift-ledger but are never
  dropped**. Digest clock keys renamed `powers[].id`/`fronts[].id`→`clockId`. Closes BUG-06a/b/c/d, 10, 12.
- **Root C — codex identity**: an id-less `codex_add` landing on an *established* record is refused
  (`id-collision`) instead of silently merging (BUG-11/F-07); `codex_update {note}` appends to `dm.notes[]`
  (BUG-06c); a missing id returns `no-record:<id>` (BUG-13); content merges onto known records drift-ledger.
- **BUG-08** — the nat-20/1 roll fall-through now clears the persisted `w.dm.rollReq` at all three sites.
- **The observability amplifier** (why the class was invisible): the probes gained `applyMutates`
  (demands real state change, not just an ok-flag) + standing `ROOT-A`/`ROOT-B` drift guards, and
  `verify-roll-branches` gained applied-ok assertions.

### Changed
- `docs/EVENT-CONTRACT.md` taxonomy rows corrected to the canonical field names + a "Payload aliases &
  drift-warn" note. `manifest.json` `owns` += `DM_EVENT_SOURCES`, `DM_EVENT_FIELDS`, `dmFoldPayload`.

### Deferred (explicitly out of scope — separate roots, queued)
- **BUG-02** (world clock never ticks from a DM event), **BUG-03** (digest hides current HP), **BUG-04**
  (no non-lethal KO), **BUG-05** (`discovery makeNode` doesn't relocate the PC — needs a travel event).
  **BUG-07** ruled **WAI** (distant_word is anti-invention by design; drift-warn now makes a supplied
  text loud). F-04 near-name codex twins — noted follow-up.

### Verification
check-manifest OK; probes flip BUG-01/06a/06b/06c/06d/08/09/10/11/12/13 → resolved, ROOT-A/ROOT-B OK,
BUG-02/03/04/05/07 unchanged; all green harnesses stay green; the 5 pre-existing red harnesses
(codex/codex-roll/crit/loadout-mirror/model-grammar) verified **identical to clean master** via worktree
baseline — zero new regressions.

## 2026-07-05 (later-4) — BRIDGELESS PLAYTEST RIG + THE BUGS IT CAUGHT

The AUTOMATED-PLAYTEST Layer-1 loop (AI player × real DM stack × Opus analyst) realized **headless
and bridgeless** — two sealed Sonnet seats (Player + DM) played a full session through the real
engine loaded in jsdom, Opus as clerk/analyst. First run: **"The Shimmering Maw"**, PC **Sella Voss
"the Seam"** (Human Rogue/Charlatan) — 12 turns, dawn→dusk, 7 checks, one fight, a complete arc.
Branch `feat/bridgeless-playtest-rig`. No engine modules changed (check-manifest OK); this is tooling
+ docs + a save. **The point of the exercise was validation, not building** (Adam) — everything the
run surfaced is logged as a future fix, not fixed here.

### Added
- **`dev/playtest-bridgeless.mjs`** — the headless bridgeless harness. Loads real `genesis.html` +
  all manifest modules in jsdom and drives the production seam directly (`dmDigest` / `applyResponse` /
  `applyEvent` / `dmRollFor` / `resolveBranch` / `bindWorld` / `cgBind`). Stateless per-turn CLI
  (`init` rolls a world + builds an L1 PC from the player's picks · `digest` · `apply` · `roll` ·
  `playerview` · `dmstate` · `patch` · `advance`), state persisted to `<dir>/state.json` between turns.
- **`dev/playtest-bug-probes.mjs`** — the running regression suite for bugs caught in play. One
  deterministic probe per finding; reports PRESENT/resolved so a landed fix flips its probe and a
  re-introduced bug trips it. All 8 caught bugs reproduce today; a world-seed VARIETY characterization
  rides alongside.
- **`docs/PLAYTEST-BUGS.md`** — the living bug & future-fix ledger (BUG-01…07 + FIX-A/B/C), each with
  root cause, blast radius, intended fix, and its probe id. The running list Adam asked for.
- **`dev/playtest-saves/sella-shimmering-maw/`** — Sella preserved (state.json = world + 41 codex
  records + full transcript; the two-lens report; DM-side board; a README). She continues in run 2.

### Fixed
- Nothing in the engine (deliberately). The run's job was to *find*, not fix.

### Deferred (→ `docs/PLAYTEST-BUGS.md`, all captured, none built)
- **BUG-01 (CRITICAL):** roll-branch events silently vanish — `resolveBranch` stamps `source:"branch"`,
  which last session's DM-Seam `validateEvent` (added in later-3, tests green) now *rejects*, so every
  branch's HP/clock/codex/epithet effects no-op. Both suites missed it: `verify-roll-branches` asserts
  the event's *label* (`source==="branch"`), never that state mutated — the mutation-test gap in Adam's
  own rubric. The headline catch: last session's green merge regressed a shipped feature, and only a
  model-in-the-loop playtest surfaced it.
- **BUG-02 (HIGH, hotfix candidate):** no DM event advances the world clock (walk_advance moves a walk
  cursor; clock lives only in UI `passTime`). Intent: clock always ticks — combat ≥6s/round, distance +
  hand-waves advance it.
- **BUG-03/04/05/06/07:** digest ships max HP not current (DM narrates blind to wounds) · no non-lethal
  KO (0 HP always dies) · `discovery makeNode` doesn't move the PC · event field-names not discoverable
  from the digest (`clock_advanced` wants `clockId` not `faction`; `epithet_grant` wants `text` not
  `epithet`) · `distant_word` ignores DM text.
- **FIX-A:** world-seed variety — ~30 distinct settings/60 rolls with a mild skew; widen/re-weight the
  `master` table so a fresh game is almost always a new name+context, and build the **bardo
  reincarnation** repeat path (a chance of waking in the same/an already-explored location — the only
  intended repeat).
- **FIX-C:** action-economy visualization (movement counter + action/bonus icons + movement bar; BG3's
  *system* is a free-to-use convention, its *icon art* is not — render our own). Needs an
  action-economy model underneath first.

## 2026-07-05 (later-3) — THE DM SEAM: TYPED CONTRACTS + STRUCTURED TELEMETRY

Hardening the one interface where the AI DM meets the deterministic engine — the two production-
maturity moves Adam named (docs/POSITIONING.md "Immediate"). Branch `feat/dm-seam`; master green
(check-manifest OK; verify-dm-seam 38/0 + regression verify-dm-events 36/0, verify-roll-branches
29/0, verify-digest-diet 33/0, verify-combat-lifecycle 52/0, verify-bridge.py 43/0).

### Added
- **Typed contracts at the seam** (`src/world/dm.js`) — `validateEvent` / `validateTurnResponse`
  machine-check the two inbound shapes (the DM's typed events; its whole turn response) against
  docs/EVENT-CONTRACT.md before the engine trusts them, plus JSDoc `@typedef`s for `DMEvent` /
  `TurnResponse` / `DMTurnTelemetry`. Forward-compatible: an unknown-but-well-formed event type
  still passes (the switch no-ops it); only malformed *envelopes* are rejected, and never by
  throwing. `DM_EVENT_TYPES` enumerates the full 87-type vocabulary, held in lockstep with
  `applyEvent`'s switch by a parity test.
- **Structured telemetry on the DM seat** — `logDmTurn` records one `DMTurnTelemetry` row per
  completed turn (latency, lane + model, digest/turn/response bytes, applied event types, mint
  count, an *estimated* token/$ cost from measured bytes via `dmEstimateCost`/`DM_MODEL_RATES`).
  Ring-buffered in `GS.dm.telemetry` (cap 200) and shipped to the bridge's new **`POST /telemetry`**
  sink → `.dm/telemetry.jsonl` (`dev/dm-bridge.py`) — the mailbox-path twin of `seat-costs.jsonl`,
  filling the gap where loop-era DM turns carried no consolidated cost/latency row.
- **`docs/POSITIONING.md`** — the career/case-study/ethos artifact (Genesis as an AI-engineer
  case study; the two-door pitch; the five exhibits; the maturity roadmap). For fall-2026 fundraise
  or AI-engineer contract conversations.
- **`dev/verify-dm-seam.mjs`** — 38 assertions incl. a red-first parity + load-bearing mutation check.

### Changed
- `applyEvent`'s envelope guard now routes through `validateEvent` (was a bare `!w||!e||!e.type`);
  a malformed event returns `{ok:false, reason:"invalid-envelope", errors:[…]}` instead of throwing.
- `sendTurn` stashes send-side metrics (`GS.dm.lastTurnMeta`); `applyResponse` closes the telemetry
  row and validates the response (non-blocking — logs violations, still applies what's valid).

---

## 2026-07-05 (later-2) — TWO CODE-REVIEW WAVES + THE REFERENCE SHELF (Monster Manual & Wiki)

A large orchestrated session. Deep `/code-review` of the accumulated work, all findings repaired
via background executor waves (personally re-gated + landed), then a new opening-screen reference
launcher shipped. Everything committed + pushed per-unit; master green (full verify sweep + manifest
OK); working tree clean.

### Added
- **The Reference Shelf** (`src/ui/reference-shelf.js`) — an expandable opening-screen launcher
  (registry + `#refShelf` modal + ARIA/focus-trap + the post-boot re-render law); built so a new
  app is one registry entry. Spec: docs/REFERENCE-SHELF.md.
- **Monster Manual** (`src/ui/ref-bestiary.js`, shelf app #1) — a browsable 1817-creature manual
  (510 regular + 1307 realm) with a lazy live-3D grid (ONE shared offscreen renderer blitting to
  card canvases), detail viewer, alt-model bullet menu (mechanism-only), reusing the game's figure
  path via a new additive `Theater.refFigure` seam. Spec: docs/BESTIARY-MANUAL.md.
- **Wiki** (`src/ui/ref-wiki.js`, shelf app #2) + **`build/gen-wiki.py`** + **`data/wiki.js`** —
  the in-game design-doc wiki; `gen-wiki.py` compiles **`docs/ARCHITECTURE.md`** (the new 51-system
  map of the whole machine) → `WIKI_INDEX`, rendered grouped by layer with filter/search/spec links.
- **`docs/ARCHITECTURE.md`** — the human-readable index of all 51 systems (synthesized from a
  6-domain systems survey); doubles as the Wiki's compile source.
- Spec locks: docs/REVIEW-FIXES-0705.md + docs/REVIEW-FIXES-0705-VISUAL.md (the review-fix waves).

### Changed
- **`genesis-orchestrate` + `genesis-clean-close` skills** hardened with THE STASH LAW (the
  2026-07-05 stash-spill scare: check `git stash list` at wave start; never bare `pop` on a
  non-empty stack; retire safety snapshots once landed).
- **`genesis-clean-close`** now carries a Wiki/ARCHITECTURE coherence sweep (a system add/retire/
  behavior-change updates ARCHITECTURE.md + recompiles `data/wiki.js` in the same close) — first
  exercised by this very close (48→51 systems).
- The realm render-profile **dual-table mirror is dead** (W2-A) — figures/lights/void now grade off
  the stamped numeric-tint profile (killed the grey-wash bug); the bestiary-resolve loop collapsed
  to one `bestiaryResolve` + slug index (U6).

### Fixed (from the two review waves — 8 units, all red-first + re-gated)
- **Wave 1 (monster layer):** U1 flavor payload now surfaces on a foe's FIRST fight (seenCount
  seeded at mint); U3 pet upkeep/decay actually wired (tend_pet event + rest-gate tick + harm-by-
  kind — were dead code the harness masked); U4 creature-parley §1 wired (auto-merged levers +
  parleyAbility); U5 combat action-parse range + two-pass traits-apply (no silent drops) + foe.traits
  keeps its SRD shape.
- **Wave 2 (battle-visual arc — never-before-reviewed):** W2-A shared-material clone-for-tween (a
  hurt no longer greys every co-sharing figure) + tween/FX drain on board swaps + bounded LRU
  texture cache; W2-B Math.random purged from creature builders (deterministic across sessions).
- The corpus's lone cuboid: `gloom:grinning-poppet`'s malformed `model` field → clean slug.
- `.mm-chip` squared-corner invariant (border-radius 6px→0).

### Deferred
- Wiki per-system detail pages (v1 is index + descriptions); alt-model authoring (mechanism ships,
  no entry declares `alts` yet); Props & Scenery (the shelf's future app #3); the provenance-audit
  bespoke-vs-nearest-sub refinement. Adam's standing ledger (PACING-DIALS build, NPC-KNOWLEDGE-GRADES
  build, REALM-RENDER-STYLE tune) still open.

## 2026-07-05 (later) — THE WAVE'S FOLLOW-ON: Phase 2b, the recovered merge, render grade, parley + anomaly law

Continuation of the monster wave (day-of, after the first close). Everything committed + pushed to origin;
final sweep 96 harnesses / 0 failed; working tree clean. This arc was messy in flight (a rate-limit storm,
a lost-then-recovered merge) but landed clean.

**Added**
- **Phase 2b — the realm creatures reach full parity.** All **1307** realm creatures now carry `traits`
  (184 traits from a prior theater-session preserved, never overwritten), a spice-graded **d8 `flavorTable`**
  (variant XOR hook), and their OWN `treasure`/`habitat`/`activity` (frame inheritance was wrong fiction).
  `build/gen-realm-bestiary.py` extended to emit + `--check` the four fields; `merge-flavor-batches.py` is the
  fail-loud reconciler (exact-name match, committed-traits precedence, full-coverage gate). `--check` clean 1307/11.
- **F4 — the flavor-d8 roll at mint** (`monsterRollFlavorD8` + `realmCreatureEntry` in `dm.js`): rolled once at
  first codex mint, canon-locked beside the custom-d10s; spice-clamped (Grounded rerolls raw 7-8→d6, breach/
  Strange+ opens the top rows). `verify-flavor-d8.mjs` 15/0 incl. the red-first clamp mutation.
- **MONSTER-PARLEY + THE ANOMALY LAW** — creatures join the attitude ladder (Beasts roll Animal Handling),
  recruitment gated at Helpful AND `bondEligible`; the only doors are nat-20 / decisive-lever-at-Friendly /
  a 3% friendly-spawn; pet/hireling/sidekick tiers; parley-angle hooks; befriended creatures recur via prep.
  Grind clamps at Friendly — "difficult af" is script-enforced. `verify-monster-parley.mjs` 58/0.
- **Realm render-style grade v1** — per-realm `sat`/`tint`/`contrast` graded onto tiles, the figure-material
  funnel, lights/fog/void, and prop fallback off the `activeRealmsFor` seam; 12-swatch review sheet committed
  for Adam's eye. `verify-theater-data.mjs` 242/0.
- **Spec locks (build-ready, not yet built):** `MONSTER-FLAVOR-TABLES` (the d8 contract, MM-grounding law),
  `NPC-KNOWLEDGE-GRADES` (signs→rumor→named ceilings, rolled witness channels, the pitch law inverts — no
  omniscient NPCs unless rolled), `PACING-DIALS` (octane/lethality/drip + Adam's design-talk rulings §5;
  player-facing preset picker BANKED §6 — one standard difficulty tuned over weeks of soak first).
- **Five committed reference page-indexes** (`dev/model-qa/{mm,dmg,phb,tashas,xgte}-page-index.json`), vision-
  built, cross-mapped, offsets verified; CLAUDE.md gotcha points at them.

**Changed**
- **The render-profile mirror trap killed** — `data/realms.js` was the source but `theater-boot.js` held a
  "kept in sync by convention" copy that drifted within hours (shipped a lava-red bright-kingdom). Now
  `theater-data` stamps the resolved `renderProfile` on the board and the GL layer consumes the stamp; the
  mirror is fallback-only. bright-kingdom retuned to candy (pastel pink, lifted contrast).
- **`genesis-orchestrate` skill hardened** with this wave's scars: Workflow-vehicle law (fan-outs > 3 ride
  Workflow, not loose Agents — the rate-limit root cause), the checkout law, no-subdelegation for leaf agents,
  panel-zombies-are-cosmetic, dual-table=bug, push-on-land, visual-read.

**Fixed**
- **The recovered REALM-TRAITS-APPLY merge** (`cmApplyTraits`): originally landed on a stray checked-out
  branch, lost when that branch was deleted, silently absent from master until a downstream report caught it —
  recovered from the object store (`cb3e630`) and re-merged with all conflicts resolved (union of the traits-carry
  + the anomaly-law `stampSpawn` wrapper across the three walk generators + combat.js). Root cause = merging
  without verifying the main-tree checkout; now the skill's **checkout law**.

**Deferred**
- NPC-KNOWLEDGE-GRADES build (executor died to the throttle; queued for relaunch) · deep `/code-review` pass
  (Monday, post-token-refresh) · REALM-RENDER-STYLE fine-tune by eye (§2 warm-brown middle band) · the 11
  `_review` CR-ceiling flags in the draft JSON (Adam's call) · figure baked-vertex-color grading (render v2).

## 2026-07-05 — THE MONSTER PRODUCTION WAVE (overnight, Fable orchestrating ~120 background agents)

**Everything landed + pushed to origin; final sweep 94 harnesses / 0 failed.** One night took the
monster layer from "realm content drafted" to "every monster in the game is a described, storied,
modeled, recruitable individual." ~30 --no-ff merges. Highlights:

- **Six-spec production lock** (REALM-ENRICHMENT-WRITING / REALM-STORY-WIRING / REALM-WALK-WIRING /
  REALM-SURFACES-WIRING / REALM-PROPS-WIRING / REALM-MODELS-P3) + later MONSTER-STORY-WIRING,
  REALM-TRAITS-APPLY, MONSTER-FLAVOR-TABLES, MONSTER-PARLEY (+§2b), PACING-DIALS (draft).
- **Phase 1 (engine):** icons fold → 1307 creatures + gen-realm-bestiary.py; breach foes reach the
  DM digest + codex creature minting; urban/wild realm spawns; realm surfaces (+5 floor recipes) +
  realm props (308, size→footprint pass) on the activeRealmsFor seam.
- **MONSTER-STORY:** habitat drives selection (misfits stamp `displaced` — a story fact), behavior/
  activity ride the digest as `doing`, boss/CR≥3 regular foes mint codex records, Adam's 104 custom
  d10s roll once at first mint (canon-locked), quest hooks bind the destination's actual threat.
- **TRAITS-APPLY:** cmApplyTraits — authored traits rename/replace chassis actions live in combat
  (divergence licensed within CR budget; Adam's 100%-traits + "new stuff not reskins" rulings).
- **MONSTER-PARLEY + THE ANOMALY LAW:** creatures join the attitude ladder (Beasts roll Animal
  Handling); recruitment is difficult af — grind clamps at Friendly; bondEligible only via nat-20 /
  decisive lever / 3% friendly spawn; pet/hireling/sidekick tiers (Tasha's model); parley-angle
  hooks; befriended creatures recur via prep. The bullywug crocodile hunter is now possible.
- **FLAVOR CORPUS:** all 510 regular monsters got an original desc + a spice-graded d8 table
  (variant XOR hook), MM-2024-grounded by a vision-read pass (16 upgrades; yochlol re-authored
  IP-clean). data/monster-flavor.js + gen-monster-flavor.py.
- **PHASE 2:** 1307/1307 realm descs; **229 creature + 8 prop net-new whole-object models** across
  7 render-judged waves — the realm net-new queue is EMPTY (0 model:"net-new" remain).
- **Reference layer:** persistent vision-verified page indexes for ALL FIVE books
  (mm/dmg/phb/tashas/xgte-page-index.json) with cross-maps; CLAUDE.md points at them.
- **Ops:** worktree hygiene (2.0G→~0.6G), play/complaints dupes removed (rig recreates), continuous
  push-on-land adopted; token-lean law saved to memory (no ultra before Mon eve refresh).

**Orchestrator re-gate catches this session (why the pipeline exists):** narrator-agent delegation
loops (MM index, twice); the chassis-SRD-traits field collision; monster-story 8d flaky 1-in-4
under the parley angle; the harness realm-key population gap; 10 buried figures + cable-snake.

**Parked for Adam:** Phase 2b (realm traits at the 100% ruling + realm d8 tables + own treasure/
habitat/activity — ~2.5× the 510-corpus spend; launch on his word) · REALM-RENDER-STYLE tune ·
PACING-DIALS §3 questions · prop size→footprint veto row · 11 _review flags in the draft JSON ·
deep /code-review pass Monday post-refresh.

## 2026-07-04 (later 3) — THE REALM ARC: 100% models, floors, figure AO, realm content + wiring [Opus]

A very large session. Battlemap playtest → full model coverage → floor materials → the realm-content
program (bestiary/floors/props at scale) → the active-realm wiring seam. All landed unit-by-unit with
per-unit re-gates + pushed to origin; master green (check-manifest OK, verify-theater-data 165/0,
verify-theater-figures 38/0, verify-realm-wiring 20/0).

### Added
- **Creature model coverage → 100%** (was 32%): 280 silhouette-family NEAREST_SUB aliases (→87%),
  then the **66 net-new bespoke monsters** (docs/CREATURE-MODELS-P2.md) — Wave 1 (4) + Batch 2A (6)
  hand-executed, **56 built by a Workflow fan-out** (one agent/creature); registered + gated (visual
  wave sheets) + landed. No cuboid fallbacks remain (bestiary 510/510 modeled).
- **Procedural floor materials** (docs/FLOOR-TEXTURES.md): 12 base PSX CanvasTextures derived from
  rolled terrain (biome/footing/scene) + **5 net-new realm-surface bases** (grating/asphalt/void-floor/
  rope-matting/candy-tile) = **17 materials**. `theaterFloorMaterial` in theater-data.js + the render
  in theater-boot.js. Floor review sheet (dev/model-qa/floor-review-sheet.png).
- **Baked figure AO** — per-fragment darkening toward each model's base (occluded/grounded read),
  figures only, no postprocess pass.
- **Realm content program (approach C, text-first):** bestiary **~100/realm = 1092 creatures**
  (docs/REALM-BESTIARY-DRAFT.md + REALM-BESTIARY-SCAN.md, all frames validated), a **legal familiar-
  icons batch** (docs/REALM-BESTIARY-ICONS.md — 219: 100 public-domain source-versions + 110
  archetypes + 9 folklore, source-tagged), **88 realm surfaces** (docs/REALM-SURFACES-DRAFT.md), and
  **308 realm props** (docs/REALM-PROPS-DRAFT.md — cross-realm tagged: 50 universal / 167 shared / 91
  bespoke). `data/realm-bestiary.js` (generated creature layer).
- **Realm-creature WIRING** (docs/REALM-WIRING.md, `feat/realm-wiring`): breach encounters now spawn
  the **active realm's** creatures — `dwalkEncounter` realm-filter + **18% adjacent-realm leak** +
  `activeRealmsFor` resolver; reskin resolution frame=stats / modelKey=render / name=realm; non-realm
  foes byte-identical. New harness verify-realm-wiring.mjs (20/0, red-first mutation proven).
- Specs/proposals: **REALM-RENDER-STYLE.md** (per-realm saturation/palette/contrast/shape grade —
  proposal, awaiting Adam's ruling), **DREAM-HORIZON §H∞ "The Private Cut"** (personal local
  content-overlay dream + the hard legal line the repo keeps).
- Dev tooling: battlemap playtest harness (audit + render + capture + FINDINGS), proof-sheets driver,
  chassis-catalog, floor-swatch sheet.

### Changed
- Floor material color model: each material carries its OWN base color (~30% env mix) so materials
  read distinct within an env (snow pale / sand tan / dungeon flagstone warm-grey), mesh color
  near-neutral. **suburb realm LOCKED to 1980s suburban Americana.**

### Fixed
- Wave-1 manticore wings + bulette dorsal fin (weak silhouettes); 6 too-dark monster palettes;
  yochlol sunk below the disc (bbox); AO moved off floor tiles onto the figures (Adam's correction);
  19 type-in-frame slips in the icons batch auto-remapped to real chassis.

### Deferred / queued (the realm-enrichment production tail — next session)
- **Net-new geometry:** 207 net-new creature models + 31 net-new prop models (net-new floor bases
  DONE). Build via the proven workflow.
- **Prop-sizing render pass** (battlemap finding #3: size → prop scale/zone-occupancy) — every realm
  prop already carries a Size.
- **Surface-select wiring** + the **render-style grade** — both ride the `activeRealmsFor` seam now.
- **Urban/wilderness creature-wiring** (dungeon done; walk.js/wild-walk.js are the follow-up).
- Text review/reshape of the realm drafts + fold the icons batch into the main bestiary.

## 2026-07-04 (later 2) — THE LIVE-QA ARC: roster completion, the eye reversal, the texture no [Opus]

Continues from the delegation close. Adam ran a live QA review of the master render sheet and the
in-app roster; this arc is his rulings executed + the bestiary program specced + a texture
experiment run and rejected. All landed unit-by-unit with per-unit re-gates (verify-theater-figures
38/38 each), final sweep 92/92 + manifest OK, pushed to origin.

### Added
- **Race×class matrix COMPLETE — all 72 combos** (18 starter + 54 completion: dwarf/gnome/halfling
  + half-orc/tiefling/dragonborn × their remaining classes). Authored EYELESS, ranger bows to the
  D spec. 72-cell `racecls` sheet re-rendered from the integrated tree. verified all 72 import clean.
- **Bestiary tail wave** (Adam's live-QA nine + a bow fix): rat-swarm rebuilt as 6 mouse bodies
  (was one big rat via a bad alias), bespoke giant-lizard/ice-mephit/deep-stalker/needle-blight,
  wolf mouth pass, flaming-skeleton variant (glow-tagged ember accents in the sockets), horse +
  skeletal-warhorse (fixed the warhorse-skeleton→humanoid alias), prop-table/bench proportion, and
  the ranger's bow swapped to the D-at-rest primary (string tip-to-tip on the nocks).
- **BESTIARY-COVERAGE.md** — the model program to close the 381-uncovered gap. Tier-2 cut: 312
  build-priority (CR≤10) / 69 deferred (CR11+). ~16 real new silhouette bodies after demotions
  carry the whole CR≤10 tail (the six highest-leverage unlock ~76 creatures); the rest are variants
  or aliases. §2 is Adam's new-body gate. **35 zero-modeling aliases LANDED** (targets verified
  present); the wave plan awaits his gate.
- Three afternoon specs (from the chase-playtest findings + Adam's approval): **CHASE-SOFT-RECALL**
  (BUILT — escaped significant quarries mint codex handles, turnRecall-proven, 30/30) and
  **DRESSING-ATMOSPHERE** (BUILT — one air/odor/sound lane per room/leg/segment, 36/36); **CHASE-BITE**
  drafted SPEC-ONLY for Adam's design pick (flat −2 rider recommended vs adv/dis).

### Changed
- **Eye standard REVERSED** (Adam: "across the board the eyes are in the wrong place — get rid of
  them"). Humanoid eye quads stripped corpus-wide (75 files + shared buildHead); owlbear/spider
  feature-eyes, skull sockets, and closed-helm visor slits kept as the character features they are.
  Ruling recorded in REFERENCE-DIRECTION. The starter-18 racecls were already swept (verified: a
  face renders as a blank plane) — a stale "still carry eyes" note was corrected.
- **Flame glow** refined to additive+translucent (opacity .85, depthWrite off) so fire reads as
  emitted light, not painted orange. **WHOLE_OBJECT_SCALE 1.2** (adjacency-proven, figures don't
  touch), **gold PC-disc rim +39% px** (rim-only, never figure tint).

### Deferred / Ruled-out
- **ChatGPT painted-texture pipeline — RULED A CLEAR FAIL** (Adam). Ran the full round-trip: a
  25-slot swatch library → 12 creatures wearing the tiles through the real PS1 pass. Bright materials
  read (troll fur, lava, ghost-vapor, bone) but dark tiles mud out under the dither and the win didn't
  justify a painted-asset dependency. **Generated grain stays the tier** — reaffirmed under the
  existing ruling; NEVER wired into the live renderer (the game is unchanged). Dev experiment files
  kept as documented dead-end evidence.
- Bestiary build waves (the ~16 new bodies) — await Adam's §2 gate. Grit pick still held at 1/3
  (zoom crops waiting). CHASE-BITE build awaits the design pick. Env waves W+U still queued.

## 2026-07-04 (later) — THE FULL-DAY DELEGATION: P1′ live + 44 new pieces + the walks dressed [Fable]

Adam delegated the whole day in one message; the orchestrator ran 20+ background executors
(spec-first, per-unit re-gates, --no-ff merges). 22 merges landed; final integrated sweep:
92/92 harnesses exit 0, check-manifest OK, gauntlet-monkey 12/12 clean.

### Added
- **P1′ WHOLE-OBJECT WIRING (the headline)** — the bespoke roster renders in the LIVE engine:
  `src/ui/theater-figures.js` registry (class/bestiary/prop/light keys + 78-alias NEAREST_SUB),
  CHAN material channels in probe-lib, `wholeObjectMaterialsFor`/`wholeObjectGeometryFor` in
  theater-boot (cuboids = auto-fallback, `Theater.wholeObject` kill switch), lighting props anchor
  the rolled per-room light profiles (point light sources at the flame head). Spec: docs/P1-WIRING.md
  (Plan-seat drafted, orchestrator-locked R1–R5). verify-theater-figures.mjs (38) + verify-theater-light-props.mjs (10).
- **44 new/reworked model pieces** across 6 waves, all Haiku-reviewed + orchestrator pixel-gated:
  fix waves A+B (mimic/gnome REPLACED, rat/goblin/dragonborn/ooze passes, ranger C-arc bow, sneaky
  rogue, BG3 owlbear), pose wave (paladin/druid/wizard/ranger expressive; 6 OGs kept as alts),
  race×class starter 18 (`racecls` sheet), NPC variants 8 (crawl-ranked; `npcs` sheet now 14),
  env wave D 10 dungeon props (`envd` sheet; stagnant pool kept as geometry per QA).
- **DRESSING-WIRING + DRESSING-ATMOSPHERE** — set dressing + condition rolls per dungeon room /
  wilderness leg / urban segment (NEW Wilderness Dressing Mega Table, PROVISIONAL pending Adam's
  craft pass) + one atmosphere lane (air/odor/sound) per room from the mega tables' nine compiled
  keys; both ride the DM digest. verify-dressing (31) + verify-atmosphere (36).
- **INITIATIVE-UI** — Round/YOU-ACT banner + spent-side tick + thin quantized chip HP bars (PC/
  ally/foe) + prose-twin spent clause. verify-initiative-ui.mjs (33).
- **CHASE-CONTRACT-FIX + CHASE-SOFT-RECALL** — fled-outcome auto-end replaced by the `resolvable`
  digest flag (DM keeps the end decision; §3d ordering restored); escaped SIGNIFICANT quarries now
  mint/update codex handles (origin-tag dedupe, turnRecall-proven). verify-chase-contract (19) +
  verify-chase-soft-recall (30).
- **Capture-gate follow-ups (Adam's mid-day rulings)** — WHOLE_OBJECT_SCALE 1.2 (adjacency-proven),
  gold rim +39% px (disc-only), glow channel → unlit MeshBasic bright flames.
- Specs locked: P1-WIRING, POLISH-WAVE-1, ENV-WAVES, MICRO-PROPS (spec-only), INITIATIVE-UI,
  DRESSING-WIRING (→BUILT), CHASE-CONTRACT-FIX, CHASE-SOFT-RECALL, DRESSING-ATMOSPHERE,
  CHASE-BITE (DRAFT — Adam's design pick pending).

### Fixed
- **Composer draft-loss** (playtest finding #1, 3 logged incidents) — renderWorld snapshots/restores
  #dmAction across re-renders. verify-composer-draft.mjs (10), recovered from a dead executor.
- Chase quarry-name degrade + null-panel restore (chase findings #2/#5).
- Table-compiler header-collision class caught in-unit (wilderness mega headers were silently
  overwriting dungeon sub-tables — prefixed; the collision class is now a known gotcha).

### Changed
- docs/PLAYTEST-FINDINGS-0704.md — full log-set analysis (latency law aggregate: 0/22 turns ≤15s,
  median 52.3s — confirms DM-SEAT as the fix); first live chase exercise findings (both endings).
- PSX grit: Adam picked 0.4, then HELD pending zoom review — briefly landed, cleanly reverted;
  renderer frozen at 1/3; zoom4x crops in dev/model-qa/grit-compare/ await his ruling.
- verify-theater-figures roster counts became spec-time FLOORS (frozen totals broke twice in a day).

### Deferred
- Env waves W (12 wilderness) + U (5 urban) — tomorrow's queue per Adam's drop-order ruling.
- Micro-props (specced, unscheduled) · CHASE-BITE build (Adam's pick) · weapon-swap re-mint sweep ·
  down-state/tipped-figure check · big-unit mechanical footprint (Adam's DMG-congruence question —
  visual size is live; multi-zone occupancy is a battlemap design talk).

## 2026-07-04 — BATTLE-STAGE UI POLISH: the arena readability loop [Fable]

Adam's mandate — "run a loop until the battle UI layout is solid: the arena graphic working as
intended, the text readable on the right side, the send button shrunk on that side" — executed as
a 4-round orchestrated loop (background Sonnet executors in worktrees, orchestrator visual gates on
headless captures each round). His earlier layout notes were recovered from session transcripts and
baked into `dev/battle-gate/ACCEPTANCE.md` so they can't get lost again.

### Added
- **`dev/battle-gate/`** — the battle-stage visual-gate harness. `capture-stage.mjs` serves the
  worktree, drives the REAL `genesis.html` into a live fight headlessly (bardo autofill →
  `combat_start`), and shoots stage/classic/explore states + A/B variants at 2x with hard metrics
  (canvas luminance + `boardPixelShare`, chars/line via Range API, composer/plaque geometry,
  failed-request URLs, the no-scroll invariant, explore/classic parity). `ACCEPTANCE.md` = the bar;
  `round0..3/` = the committed before/after record.
- **`dark` light profile point light** (`theater-boot` `LIGHT_PROFILES`) — `dark` was the only
  point-less profile, the root of the near-black arena; one dim cool overhead point (intensity 7,
  the table's lowest) gives dark boards depth while `dark` stays the dimmest profile.
- **`STAGE_AMBIENT_FLOOR = 0.65`** (`theater-boot` `applyLightProfile`) — readability floor: the
  profile's ambient clamps UP to the floor whatever the room rolled; profile color + points are
  untouched, so the mood stays profile-owned.

### Changed
- **Stage feed rail** (battle-stage mode only): the has-panel padding clamp is overridden in the
  rail (10px), feed type 14px/1.5, tighter `.dm-msg` rhythm, sigil column 34→22px → a real reading
  column (~40 chars/line measured on rendered text; the old effective measure was ~19 chars in
  164px). Explore/classic feeds proven byte-identical via the harness mutation check.
- **Stage composer**: rail-scoped margins + 15px type + 40px controls → textarea 83% of the
  composer, send button 16.4% (was 29% with the placeholder clipping mid-word).
- **Zoom defaults** (`theater-boot`): `DEFAULT_FIGURE_ZOOM_STEPS` 2→3 (default framing ~17%
  tighter — the board now owns ~82% of canvas pixels vs ~50–56% before), `ZOOM_MIN` 0.6→0.45
  (restores exactly one manual ⊕ step past the default; round 2 proved the old default sat ON the
  clamp, leaving the zoom-in button dead).
- **Scene plaque** (stage rail): stage-scoped block+ellipsis — flex containers can't ellipsize
  their own text, hence the "IIMMERIN(" glyph-chop — plus line-height re-centering in the dark
  field and a `title` backstop for long world names.
- **Band-chip contrast** (stage overlay): chip names off the parchment-emphasis token onto the
  dark-strip token; the PC chip gets a warm-gold plate + leaf name.

### Fixed
- **The near-black arena** (compounded: `dark` ambient 0.38 + zero points + the PSX palettes):
  board nonVoid luminance 23→36, board share of canvas 50→82% at default framing, figures readable
  at gameplay size. The PSX void/side palette contrast is deliberately untouched (RULED style).

### Numbers / knobs (taste re-dials, one line each)
`STAGE_AMBIENT_FLOOR` (0.65 — 0.55-vs-0.65 measured sub-noise on point-lit dark boards) · the
`dark` point intensity (7) · `DEFAULT_FIGURE_ZOOM_STEPS` (3) · `ZOOM_MIN` (0.45).

### Deferred
- Auto-fit centers the board RECTANGLE, not the occupied bands — a far-corner fixture fight rides
  the canvas edge (`placeCamera` territory; left for the theater line).
- Small boards (≤2 bands): pre-existing `smallBoardExtra` can set zoom 0.41 unclamped below the
  new `ZOOM_MIN` until the first manual zoom (noted at the const).
- `theater-boot`'s `WebGLRenderer` lacks `preserveDrawingBuffer` → reading the live canvas from
  outside its render loop returns black (the harness samples compositor screenshots instead;
  matters only if an in-app screenshot/share feature ever wants pixels — documented in
  `dev/battle-gate/README.md`).

## 2026-07-04 — MODEL WAVES: the full placeholder roster, 82 whole-object pieces [Fable]

The overnight follow-through on the whole-object probe: the ENTIRE Tier-2 board population now has
bespoke low-poly models, authored as landmark modules in `dev/model-qa/creatures/` and QA'd through
a two-stage workflow (Opus authoring executors, each with a closed headless-capture render loop →
batched ≤3-wide Haiku positioning review + Opus repair). Every piece passed; sheets + index in
`dev/model-qa/sheets/`.

**Added**
- 12 PC classes, 6 rig-variant races (dragonborn/tiefling/half-orc bespoke anatomy), 6 NPC civilians.
- 32 monsters across CR 0–10 (rat→young green dragon), debuting the quadruped/serpentine/flyer/
  amorphous/incorporeal/construct body plans and the Small/Medium/Large/Huge size law
  (discs r0.32/0.42/0.55/0.68).
- 6 kin variants (sub-nearest doctrine as copy+delta modules) and 15 data-grounded set pieces —
  prop roster derived from theater-data's runtime prop kinds + the walk Feature tables (Adam's
  "model what actually rolls in the walks" ruling), incl. torch/candelabra/lantern as the visual
  anchors for the rolled per-room light profiles.
- `ps1-sheet.html`: set-driven engine-PS1 proof-sheet harness (byte-faithful theater-boot PSX pass)
  with texel-grain default-on and per-region specular on metal/glass (Adam's rulings); house eye
  standard (small proud dot quads) across the roster.
- `dev/model-qa/sheets/`: 10 proof-sheet PNGs + INDEX.md + the dragon Blender beauty render.

**Changed**
- `REFERENCE-DIRECTION.md` gains §P1′ (individual-bespoke-models ruling, eye standard, generated-
  textures doctrine, engine wiring order). `humanoid.js` eyes moved to the house standard.

**Deferred**
- P1′ engine wiring (builders → figureMaterialFor behind the shipped PSX pass; cuboids demote to
  fallback), material channels, down-state read check. Polish backlog logged in sheets/INDEX.md.

## 2026-07-03 (later 9) — WHOLE-OBJECT MODEL PROBE: the anchor grammar's floating-parts fix, proven [Fable]

Adam's question — "the arms don't fit together anymore… would building things as whole objects
solve your broken geometry problem?" — tested and answered **yes**. The pilot lineup's floating
weapons / 90°-wrong / detached parts are an ANCHOR-ASSEMBLY bug, not part quality. A whole-object
probe (each creature = one landmark table writing geometry straight into one model frame — no
anchor resolver, no stat→look derivation) removes the bug class *by construction*, proven on both
archetype extremes: a hooded swordsman (grip authored first, fist fitted to the blade axis) and a
giant spider (8 legs, every hip placed ON the carapace — the worst case for the old anchors).

### Added
- **`dev/model-qa/probe-lib.js`** — the shared whole-object primitive library
  (`quad/ring/stitch/tube/stack/capFan/blob` + `mountSheet`, an auto-framing 5-panel turnaround rig).
- **`dev/model-qa/creatures/humanoid.js` + `creatures/spider.js`** — the two landmark tables (one
  source, imported by both the browser render pages AND the exporter).
- **`whole-body-probe.html` / `spider-probe.html`** (render) · **`export-obj.mjs`** →
  `exports/{humanoid,spider}.obj` (welded topology + per-vertex colors; Blender-ready: Y-up import,
  Alt+J Tris→Quads) · **`probe-capture.mjs` / `spider-capture.mjs`** (headless captures).
- **`ui-sketches/model-refs/`** — Adam's PS1/VS proportion reference drop (RE, cosmonaut, FFT
  swordsman, the 500-tri Venom sheet, the wireframed goblin, the blue spider).

### Changed
- **Model-authoring direction pivots off the anchor grammar.** Whole-object supersedes the G5
  anchor+derivation execution ([[MODEL-GRAMMAR]] §2–§4); `docs/DIRECTION.md` §4 amended. Execution
  moves to the `genesis-blender-mcp` GLB pipeline (Adam: "make the move over to Blender").

### Deferred
- The procedural 9-archetype-builder wave I'd floated — NOT greenlit; the probes settled the
  approach question and Blender is the execution path.
- Texture — ruled secondary ("geometry first, texture later"); the flat per-quad jitter is
  placeholder, texel-painting is a later pass.

**Verify:** both pages render identically post-refactor (humanoid 638 tris / spider 582, unchanged
by the module split); OBJ export clean (453 / 439 welded verts); no game module or manifest touched
(dev-QA only → check-manifest N/A). Uncommitted playtest leftovers (`dev/.playtest-stop`,
`playtest-player-rot1-attempt2.jsonl`) left in tree — not this unit.

## 2026-07-03 (later 8) — REVIEW PASS 2: the doer/pointer doctrine + the 11-realm re-author [Fable]

Adam's live review of the realm-item tables ("that's DM flavor… is that actually built into the
item?") became a doctrine, a full re-author, and a corpus audit in one arc. Voice-critical prose
Fable-authored; 9 background agents (3 audit · 4 fix-wave · 1 frame sweep · 1 wiring trace),
every unit personally re-gated. **Binding artifact: `docs/ADAM-REVIEW-2.md`.**

### Added
- **`docs/ADAM-REVIEW-2.md`** — the review-pass-2 rulings: §1 HOOK DIRECTION LAW (quest points
  at item; item→quest is rare and ships its wiring — the Fallout junk-retrieval framing), §2
  Note-register rules (mechanics + inspectable only; Gemini's Outlandish d300 = the bar), §3 the
  PLOT-ITEM SPLIT ("an item that DOES something is loot; an item that POINTS somewhere is a plot
  item"), §3b eight authoring coherence laws, §3c the FRAME DOCTRINE (BG3 visible-slot classes
  framed true; everything else is pocket inventory; equip-layer guard queued), §7 the ranked
  corpus rework program.
- **`docs/REALM-PLOT-ITEMS-PARKED.md`** — ~130 extracted pointer concepts (12 sections), feedstock
  for the per-realm plot-item unit. The architecture already exists: `codex-roll.js:154` rolls
  `plot-item` ([Band, Object, Why It Matters, Opens/Proves] + origin-tags/RESURFACE) — the unit
  is 11 tables to that schema + a one-line realm-aware table select.
- **NPC Life Event trailing `Effect` column** (100 rows, ADAM-REVIEW-1 §1 closed drift vocab:
  32 none / 27 codex-only / 18 thread / 11 clock± / 9 contact / 2 npc-swap / 1 rep; executors
  ride wiring-sweep-B like Place Drift's).

### Changed
- **All 11 `Realm Items - *.md` d50s re-authored doers-only** — unique rows, Mythics rebuilt as
  d4 world-verbs, all 13 canonical J3b anchor ladders verbatim, the 5 cross-realm clone rows
  killed, ~80 frame remaps (50 distinct frames, script-validated against `data/items.js`).
  Highlights Adam ratified live: the Ash shopping cart, the traffic light, the canary,
  Chrome's imprint-button maintenance robot, the inscribable Frontier bullet.
- **Dungeon Loot – Valuables re-sorted** (11 pointers parked, 11 gp-valued doers backfilled at
  identical band/gp; hot-possession rows kept per §3b laws 5–6).
- **27-row surgical batch**: Distant Word ×9 costume-Color rows honestly deflated · Shrine &
  Omen ×8 urgent omens now read the nearest ACTIVE faction clock one step early (honest
  already-passed fallback) · Festival ×5 payloads supplied in-row · Truth vs False r18/r20
  carrier-mints · 4 micro-sharpens (Walk Nightmare D-r2/W-r6, In-Building r15/r28).
- **NPC Life Event ×11 referent rebinds** — undefined "someone/something" → factions or
  mintable rivals (rollNPC).

### Fixed
- The trail-map-as-robe frame class (percussion caps → `bullets, firearm`, map → `map`, etc.).
- Unwired-physics references (the irradiated-ground catch — BREACH_PHYSICS_VOCAB is the law).
- The no-camera scout drone incoherence (now relays sound).

### Deferred
- **Adam's skim** — every touched table stays PROVISIONAL; row-level checklist in HANDOFF.
- The plot-item realm unit · the WANT-HOOK spec talk (the legacy Quest d20s become its axes) ·
  Urban Rumor Intel rebuild-vs-retire · Dungeon Revelation rows 1–74 re-author · NPC Hook
  de-localize · the §3c equip-layer guard · the BREACH-SPAWN ruling (guaranteed genesis-time
  breach, Fable's shape proposed) · difficulty retune baseline = realm-armed parties.

**Verification:** `compile-tables.py --emit` 366 tables, REAL bugs 0 · `check-manifest.py` OK ·
`verify-dm-events.mjs` 36/36.

## 2026-07-03 (later 7) — THE G5 SESSION + THE TABLE DOCTRINE ARC (session close) [Fable orchestrating]

The live art-direction session with Adam + the top-band uniqueness doctrine, closed clean.
~12 executors this arc, every unit personally re-gated, full sweep 0-failed at close.

### Added — the G5 art loop (Adam ruling live from screenshots)
- **Round 1**: natural creature identities (per-type/keyword desaturated palettes — bone
  skeletons, olive goblins, sickly zombies; PC gold/ally blue kept), the faction signal moved to
  MINIATURE BASE DISCS (Adam: "pieces have bases"), weapon grip cants, ghost translucency (0.45),
  reference-informed postures (hunched goblinoids + oversized heads, slouched zombies, robed
  cultists), SIZE_SCALE tiny→gargantuan.
- **Round 2**: the REAL floating-weapons cause — recipe figures had NO LIMBS (the generator never
  emitted limb modules; weapons anchored to phantom forearms) — fixed, and round-1's
  false-positive grip check replaced with real-geometry composition checks (proven red 14x).
  Discs were already circular/centered (the "pedestal" was a floor-lying weapon).
- **Dead state (Adam's ruling)**: corpses persist toppled/desaturated/dark-based; OBLITERATION
  (crit magnitude ≥8 kill, elemental kill, stage_fx obliterate) vaporizes to a scorch tile.
  Honest gaps documented: no foe-hazard damage path exists; combat crits had no magnitude —
- **which Adam then RULED into existence**: combat crits roll the magnitude die (one engine, 60-
  sample orthogonality proof — magnitude never touches damage), ≥8 killing blows auto-obliterate,
  the theater spikes absurdity-tier.
- **Board lighting is a ROLLED WALK FACT**: all three walkers stamp segment.light (9 env-weighted
  profiles: dark/torch/lava/fungal/magic/lamplit/moonlit/daylit/overcast/voidlit), feature
  keywords override, DM digest carries it, grounding blobs under figures+props. Real find: three.js
  r166 photometric units silently nulled the first lighting pass.
- **Zoom + crowd spread**: ⊕/⊖ on preview + battle-stage overlay, tighter default fit, within-zone
  spill (5-foe zones no longer blob).
- **DM-CHARTER §8.6** (the battlefield bends for the cool): positional agency = player agency
  (visualizer-of-adjudicated-fiction ruling — full tactical control scoped out); cool-factor
  bends licensed + captured. **DREAM-HORIZON §H3**: canon-woven mythic parked with weaknesses.

### Added — the top-band uniqueness doctrine (Adam's 1%-mythic concern)
- **dev/top-band-uniqueness-report.md**: 60 tables classified — walk Mythic rows are SAFE
  (lens-bound by construction); the real exposure was Plot Item/Lock + Place-Gen + Realm Items.
- **Plot Item/Lock canon-aware recurrence BUILT**: same world = the legend RESURFACES (both mint
  paths — genApply AND prepCastFrontier — found and fixed, mutation-proven); different world =
  fresh mint.
- **9 of 11 breach-realm Mythic rows are now d4 pools of slotted variants** (Adam approved the
  drafts; applied verbatim with full lint/recompile discipline). Frontier + Noir BLOCKED honestly:
  per-variant Frames vs the one-Frame-per-row schema — Adam's call queued.
- Place Drift roll-order restored (earlier today) + build/lint-tables.py now fences edits.

### Playtest (rotation run 1, reasonable persona, low/low)
32 DM turns on Copper's Marsh — lane discipline held, canon patched not invented, gen minted
cleanly (net-mender "Wymar Sallow"). NO combat occurred (organic battle shots wait). Stopped
cleanly; transcripts await the Critic pass: dev/playtest-{scribe,player}-rot1-attempt2.jsonl.

### Open for Adam (queued in HANDOFF)
Frontier/Noir Frame schema call · Row B beasts G5 round · NPC trait pools/slots + d500 expansion
decision · In-Building linter opt-out vs re-sort · battle-stage UI approval round (organic shots).

## 2026-07-03 (later 6) — THE LUNCH WAVE: table hygiene + layers-not-boxes + MODEL-GRAMMAR G1→G4 COMPLETE [Fable orchestrating]

Adam's lunch-break punch list, fully delegated (9 executors, every unit personally re-gated,
full sweep 0-failed at close):

### Added
- **MODEL-GRAMMAR G1→G4 BUILT** (docs/MODEL-GRAMMAR.md → status flips at G5): the 59-part
  library with the anchor contract (G1: 42 parts, composition proven byte-identical to the old
  builders via .add()-count instrumentation; G4: +17 prop parts) · **510/510 derived creature
  recipes** (G2: weapons from actions, armor from AC bands, wings from fly speeds, the audit's
  keyword table; two --emit runs byte-identical; the §4b mogwai shape-hint resolver with codex
  canon-lock, mutation-proven) · **the loadout mirror** (G3: the PC's mini holds what the sheet
  equips, live references; conditions render — prone tips, burning embers) · **walk features as
  real props** (G4: carts tilt when collapsed; adversarial word-boundary hardening — "constable"
  no longer spawns a table). Remaining: G5, the Adam+Fable hand-override art session, + the §7b
  blind-recognition QA pass (queued).
- **Battle-stage REV-2 (Adam: "think in layers, not boxes")**: the band arena now floats as an
  overlay ON the battle map (corner-pinned compact chips, click-through), the below-strip
  retired, right-rail feed ~15% smaller/half padding (3 messages visible vs 1), canvas 73vh.
  Single-assertion red proof on the moved strip; lifecycle 52/0 byte-identical.
- **Table-edit safety net**: build/lint-tables.py (gaps/overlaps/band-order/dups/ragged rows,
  17/17 red-first proofs) + docs/TABLE-EDIT-SAFETY.md. Key finding: row consumption is
  range-based EVERYWHERE — hand adds/removes are safe by construction.
- **dev/model-coverage-report.md**: the walk corpus does NOT break the polygon plan (145 nouns:
  61 keyword-rule, 17 new-part, 24 atmospheric, 9 architecture-scale each with a cheap answer).

### Fixed
- **Place Drift roll-order invariant restored** (Adam's finding: higher roll = higher band):
  54 rows renumbered, content byte-identical, distribution unchanged 66/20/9/4/1; survey of the
  other 37 PROVISIONAL tables = 0 genuine offenders (dev/table-order-report.md).
- Mid-wave: a G3 merge briefly landed on G4's branch (an executor left the main tree checked
  out on its branch name) — reset cleanly, re-merged on master; the squatted empty branch deleted.

### Open for Adam
- Battle-stage rev-2 verdict (frame posted) · In-Building Complications (linter vs its declared
  building-sort: teach the linter a frontmatter opt-out, or re-sort) · the lint baseline's 634
  duplicate-row warnings (skim during table review).

## 2026-07-03 (later 5) — THE BATTLE THEATER DAY: gritty FFT stage, figures, motion, battle-stage layout — all LIVE [Fable orchestrating]

The whole visual battle system, specced and built in one arc (9 background executors + 2 G9 tuning
rounds, every unit re-gated personally, full sweep 0-failed at every merge):

### Added
- **BATTLE-THEATER T1→T3 BUILT + LIVE IN THE APP:** vendored three.js behind the ONE module-boundary
  file; the FFT tile-column board (dims→grid, elevation cliffs, hazard tints, void, 45° dimetric
  ortho camera); the PSX grit pass (env palettes as data, 1/3-res pixelated render, Bayer dither +
  vertex snap, CC0 texture manifest hooks); 9 archetypes with de-blocked posed figures, class
  silhouettes + readable weapon shapes (real engine finds folded in: cmFoeFrom never threaded size;
  the Greatsword regex; PC class now rides combat_start); T3: 18 motion verbs + damage-typed FX +
  the magnitude-scaled reality tear + the `stage_fx` improv event (EVENT-CONTRACT row) + 7 event
  hook sites. Preview page = the standing visual gate (fixtures × envs × PSX × verbs demo).
- **BATTLE-STAGE MODE (Adam's layout ruling, DE over BG):** in a fight the theater takes the center
  ~64vh, zone-grid strip beneath, the feed+composer move to the right rail; full restore on
  combat_end; mount-gated clean degrade. Proven live end-to-end after two REAL bugs found by the
  live gate: the importmap bare-path spec violation (three never resolved in the app — the theater
  could never mount; degrade hid it) and the innerHTML canvas orphaning (Theater.reattach re-parents
  + re-fits — the black-stage fix).
- **G9 ran as designed:** round 1 (contrast/foes/elevation-not-red/dither) + round 2 (the 45° yaw
  restored + rotated-bbox fit; the boardCenter aim bug) — each from screenshots reviewed with Adam.
- **docs/MODEL-GRAMMAR.md SPECCED** (recipes-not-models: ~40 parametric parts, anchor contract =
  equip slots with geometry, script-owned derivation off fields the game already owns, channels-not-
  colors so realms restyle everything, §4b the MOGWAI CLAUSE — shape hints from the closed part menu,
  canon-locked to codex, nothing shapeless ever, the menu grows from play — §7b the BLIND RECOGNITION
  GATE: fresh no-context judges score figure legibility; Adam does taste, the loop does QA).
  Orchestration G1→G5 queued.
- **Rulings landed:** run with 3D low-poly figures (sprites PARKED same day — SPRITE-SHEETS.md kept
  intact; the browser-operated ChatGPT generation was too slow and the minis fit "leave room for
  imagination"); Quaternius rejected (cartoony); §II.0b placeholder-art doctrine.
### Fixed
- verify-companions flake (the loyalty-leak check swept the whole panel; scoped to the hireling chip).
### Deferred
- MODEL-GRAMMAR G1-G5 (next wave) · T2 pack-model mapping (Kenney props usable; creature meshes await
  better sources or artists) · figures still one polish pass from "good place" (Adam) — rides G1/G2.

## 2026-07-03 (later 4) — COMBAT LIVE + THE HYDRATION HOLE + DM-SEAT SPECCED + BATTLE-VISUALS SPECCED + TWO OPUS SKILLS [Fable]

The rest of the Fable day: the lifecycle seam BUILT and proven in a real browser fight, a
critical storage bug found live and fixed same hour, the seat and battle-visual specs locked,
and the two workflow skills Opus needs for the weekend.

### Added
- **COMBAT-LIFECYCLE BUILT + merged** (`feat/combat-lifecycle`, executed by Sonnet, orchestrator
  re-gated personally): `combat_start`/`combat_end` cases, detected auto-end (`cmMaybeAutoEnd`),
  attack applies damage to the target foe, `digest.combat` + tactic proposals, `foe_action
  p.action`, round advance on `round_tick`, PC-death teardown, `cmbProseSummary` (BLIND-PLAYABLE).
  New harness `dev/verify-combat-lifecycle.mjs` 52/0. Gates re-run on the tip: **71-harness sweep
  0-failed · fuzz 440 calls (84 types incl. the new two) 0 findings · monkey 12/12 lives 0
  aborted.** Two single-foe fixture repairs (verify-monster-tactics, verify-wiring-a) — the
  detected auto-end correctly ends a fight whose lone foe flees; captured-reference pattern
  preserves the morale assertions. The executor died at the session limit mid-polish; its
  uncommitted digest-shape fix was inspected, kept, and committed.
- **THE FIRST LIVE BROWSER FIGHT** (Claude-in-Chrome, real bridge, disposable clone world —
  real saves untouched): combat_start → panel auto-open (diorama/grid/lanes/tags) → foe autoplay
  turns (three hits dropped the PC to 0 — the lethality doctrine, demonstrated) → death save →
  heal → three foes battered down → **detected combat_end fired itself**, paid 188 XP, advanced
  the faction clock ("copper-miners will remember"), restored the panel. Prose twin live:
  "Round 1 — the foes act. Goblin Near, fresh; …"
- **`fix/idb-boot-hydration` — CRITICAL, found live:** loadU() reads localStorage only and no
  boot path ever read IDB back — the forever-store was WRITE-ONLY; a lost LS mirror booted an
  empty universe while all 5 real worlds sat intact-but-invisible in IDB (recovered by hand
  in-console, then fixed): `storeHydrateFromIDB()` + boot-chain adopt/repair/toast.
  `dev/verify-idb-hydration.mjs` 11/0 incl. the stubbed-fix mutation proof; recovery re-proven
  live (wiped the LS key, hard reload, all 5 worlds auto-recovered).
- **`docs/DM-SEAT.md` sketch→SPEC** (the sketch's own sequencing gate is satisfied; GLM
  ~$1/hr off measured payloads — "that's really when the app becomes playable"). All 5 forks
  resolved (bridge /seat key-inject proxy · no keep-alive v1 · pure-JSON v1 · rolling window +
  evict-to-summary · cost telemetry day-one). 5 build units; SEAT-PROMPT.md stays frontier.
- **`docs/BATTLE-VISUALS.md` SPECCED**, grounded in what the live fight actually looked like:
  Phase A composition/legibility (UI autonomy — grid absorbs the duplicate lane strip, diorama
  behind a toggle, the three banked Batch-4 battle assets wired, state color/pulse/flash, prose
  parity as an acceptance gate); Phase B = the §II.0a style-probe session (three mocks, Adam
  rules); Phase C = T6 theater, specced only after B.
- **Two project skills** (`.claude/skills/`): `genesis-orchestrate` (the spec→execute→re-gate→
  merge pipeline, executor babysitting lessons included) + `genesis-playtest-rig` (bridge/DM/
  complaints/hotfixes in one session — replaces Adam's three manual sessions).

### Fixed
- A stale plain `http.server` squatting 5175 (the CLAUDE.md gotcha, met in the wild) replaced
  with the real bridge.

### Deferred
- Attack-at-0-HP is not engine-refused (DM adjudicates in v1) — note for a lifecycle fast-follow.
- G2-1976 lethality gate + the 30-round-stalemate fiction question — post-playtest tuning.

## 2026-07-03 (later 3) — COMBAT-LIFECYCLE SPECCED: the battle stack is built but UNREACHABLE in live play — the seam spec [Fable]

A Fable evaluation pass on the in-game battle + its transitions. Finding: every combat layer is
unit-green (engine, tracker panel, battlemap, blockwright diorama, monster tactics, death saves;
G2 5,500 sims 0-crash) **and none of it can be reached from live play** — `combatStart()` and
`combatOutcomeEvents()` have zero app callers, no `combat_start`/`combat_end` events exist, the
PC's `attack` event never applies damage to its target foe (`applyDamage` uncalled from world/),
`dmDigest()` has no combat block (DM-BRIDGE.md:308 references `digest.combat.proposals[]`, never
built), and nothing increments `GS.combat.round`. Both shakedown runs fought zero fights, so this
was never felt. The two prized transitions in/out of a fight simply do not exist yet.

### Added
- **`docs/COMBAT-LIFECYCLE.md` (SPECCED, Sonnet-ready)** — the orchestration seam only: a
  `combat_start` applyEvent case (guards, count-expansion, ledger prose twin, auto-panel via the
  existing render hook), the `attack`-case foe-damage patch (coarse state words, never foe HP
  numbers), `combat_end` declared + DETECTED (auto-fires when the last foe drops; pc-dead
  teardown; chase handoff ordered before teardown), the round-advance in `round_tick`, a
  diet-conscious `digest.combat` block with tactic proposals, a `foe_action p.action` extension
  (DM picks the verb for named foes, script owns every die), `cmbProseSummary` (BLIND-PLAYABLE),
  the DM-BRIDGE "Running a fight" runbook section, and an 11-check red-first harness
  (`dev/verify-combat-lifecycle.mjs`) with mutation checks + the regression sweep list. 9
  doctrine-grounded decisions recorded in §9; breach physics/surprise/multi-PC scoped OUT of v1.

### Deferred
- G2-1976 (L1 Fighter vs CR10 winRate above the 0.10 gate) — lethality tuning, explicitly not
  part of the seam; retune after live fights per COMBAT.md "don't tune twice."

---

## 2026-07-03 (later 2) — POST-BATCH-3 HARDENING: gauntlet built · 4 live bugs fixed · shakedown validated the bridge economy · THE LATENCY LAW

The overnight/morning hardening arc after the batch-3 landing: the Layer-0 gauntlet built and made
trustworthy, an automated shakedown playtest run against the real DM stack, four real bugs fixed
same-night with red-first regression checks, and the latency decomposition made doctrine. Final
gate state: **81 harnesses / 0 failures** (full sweep incl. the gauntlet set; verify-bridge
excluded — live bridge). Everything merged --no-ff, re-gated by the orchestrator personally.

### Added
- **The pre-playtest gauntlet** (`feat/pre-playtest-gauntlet`): G1–G8 + Monkey Session (12 lives,
  full arc) + applyEvent fuzz (82 types × 430 hostile calls, 0 findings) — every harness
  canary-proven RED before its green was trusted. G1 at 165 unique handlers (≥150 floor). G2
  CR-ladder: 5,500 sims, honest lethality data, both sanity gates PASS (L10-vs-CR0 1.00 ·
  L1-vs-CR10 0.00); cliff-shaped curve read filed (transition band ~1 CR wide — the widening
  systems [tell/retreat/morale/chase] are load-bearing; Layer-1 Critic to tag tell+retreat per combat).
- **Automated shakedown playtest** (AUTOMATED-PLAYTEST.md §6 params locked: 40 turns/2 days, fresh
  world + forced revisit, early shakedown, ping-after-burn): 2 runs vs the real bridge + DM stack.
  VALIDATED LIVE: digest diet (median 9.0KB post-opening) · roll-branches (fail branch fired, zero
  second inference, margin ladder tight) · gen handshake (clean mint+bind) · dmTriage lanes · the
  black-screen fix · BLIND-PLAYABLE (game fully playable via a11y tree during total visual failure).
  Artifacts committed: `dev/playtest-findings-shakedown.md` (SD-001..011) + scribe/player logs.
- **DM-BRIDGE runbook:** the two-call turn protocol · prepPending environment check (SD-006) ·
  tease-speakers-loosely gen guidance.

### Changed
- **THE LATENCY LAW (SPEED-DOCTRINE rule 7, Adam, locked):** Genesis does not LAUNCH until routine
  turns ≤15s (28s dev-tolerable, 90s unplayable). Measured: the model is NOT the slow part — the
  agent-loop round-trip tax is (28s fast vs 170s deep, same rig). Loop-era mitigation = two-call
  turn + LOW effort loop DMs; launch-unlock = DM-SEAT (build window ~Sept 2026, Adam's cost runway).

### Fixed (all found by the gauntlet/shakedown, all red-first regression-checked)
- **saveU() quota abort** (G6-002; worse than reported — an LS QuotaExceededError also aborted the
  guarded IDB save): LS write wrapped, saveWorld always runs, failure surfaces via store.js.
  verify-storage 33→35.
- **6 attackless bestiary creatures**: gen-bestiary.py kind-fallback for "+N to hit" shorthand + 3
  SRD-exact stat-line repairs (swamp-shadow, bandit-courier, mire-creeper); **ridden-wyvern
  FLAGGED not fixed** (authored "(same as standard wyvern)" structure — Adam's call).
- **The black-screen first-turn blocker** (SD-001/002): #wakeFade's lowering lived in an
  unreachable legacy branch → now unconditional; applyResponse teardown moved into finally.
  verify-wake-prep 47→54. Confirmed held in the wild on run 2.
- **Prep name collisions** (SD-008): reroll-before-suffix via the same table path (bounded 5);
  new verify-prep-name-collisions 18/0.
- G2 harness foe-action selection mirrored to resolveFoeTurn (stalemate flood 1,837 → 107 — all
  the ridden-wyvern artifact).

### Deferred / open
- **SD-003 (Adam's ruling owed):** opening digest full-ship (28–31KB w/ dmOnly secrets) vs lean
  opening + prep behind peek-state.
- **Rotation runs 1–5:** rig proven, two-call protocol + low-effort briefs staged; run 1 stopped
  at loop-entry for the coworking move. Resume point: world "Copper's Marsh" founded + prep casts
  rolled, cold, no soul in play.
- ridden-wyvern stat lines · SD-010 pending-indicator affordance · SD-011 draft-preserving
  re-render · SD-009 clock inert through conversation scenes (the no-time-advance gap, felt live).

---

## 2026-07-03 (later) — gap-wiring CALLER seams — BATCH3-PLAN unit 1's OPEN tracking line CLOSED

The follow-up unit named across HANDOFF/BATCH3-PLAN: the five wave-2a tables that shipped compiled
with no call site now FIRE in-app. The pure engine half (`src/world/gap-wiring.js`, 29/0
`verify-gap-wiring.mjs`) stays as-is; this lands the caller half. Branch `feat/gap-wiring-callers`.
Gates: `check-manifest` RESULT: OK · **new `verify-gap-callers.mjs` 24/0** · full sweep **69 harnesses
0 nonzero-exit** (incl. `verify-gap-wiring` 29, `verify-dm-events` 36, `verify-wiring-b` 48 — zero
regressions). The chase_start GS.chase mutation guard shown RED→GREEN.

### Added
- **world.dm applyEvent gained five caller seams** (`src/world/dm.js`): `chase_start`/`chase_round`/
  `chase_yield` drive a transient **`GS.chase`** gap clock (created/cleared by the caller, mirroring
  `GS.combat`; payload `{targetFid|npcId, terrain}`; fires on a resolved morale-flee + declared pursuit);
  `downtime` (fixed 6-intent vocab — work/carouse/research/train/lie-low/seek-work; seek-work→JOB-WALKS
  postings; gold rides `item_changed`, a fresh face the drift-contact path, a rumor `distant_word`);
  `distant_word` (a Distortion binds to a REAL non-current-node ledger fact, the true fact rides `dmOnly`
  only); `shrine_omen` (its `[the myth]` bound to `w.seed.myth`).
- **`GS.chase`** added to `src/state.js` (discoverability; dynamic lifecycle like `GS.combat`).
- **`dev/verify-gap-callers.mjs`** — asserts each of the five tables fires from its seam (the wiring-sweep-A
  "wired table actually fires" standard), incl. festival + distant-word via `applyDriftEffect`'s
  `festival`/`rep` tags, plus the tarot Major-op re-check.

### Changed
- **EVENT-CONTRACT.md** — the five gap-wiring events added to the taxonomy + a prose paragraph noting
  festival/distant-word already fire from `applyDriftEffect` (wiring-sweep-B) — those two seams were not
  new; this unit covered the three that had none plus a first-class `distant_word` DM event.
- **manifest.json** — `world.dm` callTimeDeps gained chaseInit/chaseRound/chaseYield/downtimeIntent/
  distantWordRoll/shrineOmenRoll/driftEffectContact (world→world, no layer violation).
- Stale headers refreshed: `gap-wiring.js`'s "KNOWN OPEN SEAM" note → "CALLER SEAMS LANDED"; the §3
  seek-work "not yet built" line → job-walks-landed; `BATCH3-PLAN.md` unit 1 STATUS SPLIT → CLOSED.

### Verified (tarot re-check)
- **Tarot Majors' mutators re-audited** now the real systems exist (`verify-gap-callers.mjs` §6): every
  Major `op` resolves through `tarotMajorVector`. The Moon's `crackedLensBias` (the guardrail's licensed
  nearest-implementable ref for "every Distant Word rolls two lenses") still stands — `distantWordRoll`
  returns ONE lens with no lens-count hook, so no natural "two lenses" backing exists; the substitution
  resolves cleanly (rides op/opParams to the DM layer). Noted in `data/tarot.js`.

## 2026-07-03 — BATCH 3 LANDED — 16 units merged --no-ff, 69 harnesses 0-failed under the orchestrator's own hands

The overnight batch-3 build (two stacked lines off gap-wiring) integrated, gated, and merged to
master as 16 labeled merges + 1 cherry-pick. Gates re-run personally on the exact integrated tree
before any master merge: `check-manifest` RESULT: OK · **all 69 verify harnesses 0-failed**
(incl. `verify-bridge.py` — no live session was up) · master's final tree verified
**byte-identical** to the gated integration tree.

### Added
- **spice-reband** — the eleven wave-1/2a d100s audited against `SPICE-RULER.md` (J0-law): honest-band
  relabels (text verbatim) + new hot-tail rows; Faction Outcome d20 authored (world-turn's flagged gap).
- **gap-wiring** — `src/world/gap-wiring.js` pure engine half (chase gap-clock, Distant-Word lens
  binder, downtime, festival, shrine/omen; 28/0). *(The CALLER half landed same day — see the `(later)`
  entry above; BATCH3-PLAN unit 1's tracking line is now CLOSED.)*
- **skin-grants-motifs** — 8 grant executors, skin-rolls-first, 14 motif kits w/ Fable voice anchors,
  tint-COMPOSES invariant; the 3 skin tables transformatively re-authored.
- **breach-core + breach-tables** — the 2d10 bell + frayMod shift, threshold/ambush entry,
  persistence d6 + stable doors, marooned debt, bounded physics lenses (`src/engine/breach.js`);
  the six Breach/Nightmare d20s (12 approved samples verbatim; The Interior = row 20 each).
- **outlandish-realms + realm-tables** — the 11-realm frozen vocabulary (`data/realms.js`), d300
  Realm-tag pass (one column), breach-only sourcing supersede + ≥1-per-breach guarantee; 11 per-realm
  d50 item universes (`Engine/03. _Tables/05. Realms/`) w/ rank ladders + the rank-smith stub. PROVISIONAL.
- **safety-guard** — the content-safety compile gate (denylist fails compile, shown red on a seeded
  fixture) + the DM-CHARTER §9.3a prejudice-line addendum (landed with this landing's prose).
- **touched-npcs** — the fray-scaled breach-touched rider d12 on `rollNPC`.
- **urban-fabric** — ~12 typed building kits (proprietors always rolled), lazy district minting,
  Tavern 2.0 verbatim extraction, `gen interior opts.type`.
- **job-walks** — tier-scaled postings that mint 1–3-segment walks; unclaimed postings resolve without you.
- **wiring-sweep-A** — JOB-WALKS + seed dispatch (≥1 non-urban anchor), travel lanes, REST-RISK,
  parley-wants→social, behavior-if-hunted→chase, if-ignored→World-Turn escalation, interactables,
  region-encounter header fix; `verify-wiring-a.mjs` proves every wired table FIRES from its seam.
- **wiring-sweep-B + hygiene** — WIRING-MAP Wave B + reconciles + ADAM-REVIEW-1 absorptions
  (Place-Drift `Effect` tags + `applyDriftEffect` executors, region name-per-world fix, dwalkCoin 1 gp floor).
- **dm-eval** — the DM-CHARTER regression scorer: 10 fixtures, checklist evaluator, baseline recorded.
- **forever-guards** — FOREVER-STORAGE R9: IndexedDB migration (LS original preserved one release),
  debounced changed-world-only saves, quota wrap + storage meter + export-on-failure, dmlog archive
  lifecycle (prune-after-success), vintage fixture #1 frozen post-batch-3, `verify-migrations.mjs`,
  ATTRIBUTION.md. **IRONMAN ALWAYS** locked; the retcon negotiation is the one diegetic door.
- **J4 frontier prose (this landing)** — DM-CHARTER **§8.3c** (the Retcon Negotiation) + **§9.3a**
  (the prejudice line); DM-BRIDGE breach registers (membrane / ambush / stageRules) + the
  `gen interior opts.type` runbook line. (Retcon runbook register, recall order, morale-binding,
  claim-deed had already landed with batch-2 prose.)
- Spec docs committed: `docs/PRE-PLAYTEST-GAUNTLET.md` (Layer-0 mechanical sweep, SPECCED) +
  `docs/AUTOMATED-PLAYTEST.md` (Layer-1 AI-player loop, PLANNED).

### Changed
- **The join** (the two lines both touched Place Drift + walk deps + compiled tables): `Place Drift.md`
  merged row-by-row — spice-reband's band labels + 6 new hot-tail rows KEPT, wiring-B's `Effect`
  column KEPT; the 6 new rows tagged from the §1 vocabulary (41 thread · 53/61/88 clock± ·
  63 contact · 90 thread). `manifest.json` callTimeDeps unioned; `tables.json`/`tables.js`
  regenerated by `compile-tables.py --emit` at every conflicted merge (final: 366 tables).

### Fixed
- The two flaky batch-2 harnesses (digest-diet size guard, travel-walks Faction Clash creature blob)
  + the digest-diet handoff assertion gone stale after PREP-AUTOPILOT (cherry-pick 61b49c3).

### Deferred
- **gap-wiring's caller half** (the audit finding stays OPEN — chase/downtime/distant-word/festival/
  shrine tables still fire nowhere in-app until a follow-up unit lands the seams).
- Realm d50→d100 growth, rank-smith full wiring, T3/T4 as ever; style probes still gate deep visual work.

---

## 2026-07-02 — Batch 2 landed (back-filled entry)

*(Back-filled during the batch-3 landing — the 07-02 close updated NEXT-STEPS only.)* All 17
batch-2 units merged --no-ff to master, 55 harnesses + bridge 0-failed re-run by the orchestrator:
walk-refresh · world-turn · xp-retune · monster-tactics · tables waves 1/2a/2b · regions+names ·
tarot · reputation · companions · levelup-picker · TIYL · durability · loose-ends · battlemap ·
blockwright + the batch-2 frontier prose (living-world registers in DM-BRIDGE) and the day-2 spec
corpus (BREACH, SKIN-GRANTS, URBAN-FABRIC, JOB-WALKS, FOREVER-STORAGE, WIRING-MAP, doctrines).

---

## 2026-07-01 (later 6) — Batch-1 art landed + wired · style commitment → PROVISIONAL

Adam generated the full `ASSET-PROMPTS.md` list (all 4 batches) and dropped the raws into `assets/`
on magenta flats; the isolation pipeline ran + the shallow wiring pass landed. Gates: manifest OK ·
`verify-in-session-ui` 74/74 · `verify-shop-ui` 46/46 · `verify-dm-events` 36/36.

### Added
- **Asset isolation** (`feat/asset-isolation`, e4a17d5) — 12 assets magenta-keyed + trimmed (same
  feathered chroma-key as `extract.py`): 5 new icons (coin-purse · crossed-keys · door-arched ·
  skull · storefront-awning), You/DM medallions, battle arena + player/hostile rings, scene-banner
  plaque, GENESIS wordmark. Raw generations preserved in `ui-sketches/ivalice-style/generated-070126/`.
  Textures → 1254² seamless `parchment.jpg`/`stone.jpg` (drop-in by filename) + new `leather-blue.jpg`.
- **Wired** (`feat/ui-asset-wiring`, ce45149 — shallow by design): title screen's CSS-gradient
  `.start-title` → the engraved **GENESIS wordmark art**; the scene whisper → the **banner plaque**
  (9-slice `border-image` 0 320 fill — gem finials never stretch); feed sigils ❖/◆ → **You (sapphire
  compass) / DM (ruby sun) medallions**; storefront + coin-purse icons in the shop header. Live-verified.

### Changed
- **⚠ Visual style commitment → PROVISIONAL** (`DESIGN-GUIDE.md §II.0a`, Adam's ruling): a **low-poly
  FFT/PS1 re-skin is under consideration** (the battle theater may render low-poly 3D; the UI should
  match). No deeper engraved investment — no new asset generation, no more screen ports — until a
  style-probe exploration (2–3 candidate looks on title + in-session; hybrid "low-poly scene in
  engraved chrome" is a live option). Skin stays swap-cheap: CSS vars + asset URLs only.

### Deferred
- Banked, isolated, deliberately unwired: battle arena + rings (T6), skull, door-arched (T3),
  crossed-keys. Wiring waits on the style decision and/or their tracks.

## 2026-07-01 (later 5) — Playtest checkpoint: shop UI + dice theater + de-Claude visual pass + DESIGN-GUIDE

The "walk batch" (Adam pre-authorized the close): five units landed as separate `--no-ff` merges, each
gate-verified + live-walked in Chrome. Gates on merged master: `check-manifest` OK ·
`verify-in-session-ui` 74/74 · `verify-shop-ui` 46/46 · `verify-economy` 43/43 (unmodified) ·
`verify-dm-events` 36/36.

### Added
- **`docs/DESIGN-GUIDE.md`** — the north-star doc: game-feel pillars (graded scorecard; P3 "fast" = C),
  the Ivalice visual identity bible (ChatGPT mockups = visual canon; de-Claude = asset fidelity, not CSS),
  and the rubric-gated roadmap T0–T7. Locked 2026-07-01: band-lane battle theater · pluggable DM seat.
- **Shop UI** (`src/world/shop.js` + `shopPanel` in render.js; `docs/SHOP-UI.md` rulings-locked → BUILT) —
  contextual Buy|Sell tabbed panel via `open_shop`/`w.shops`; confirm-on-plaque flow (no one-click buys);
  **attitude-tinted prices** (±10%/rung via `ecAtt` in the engine — the social ladder pays off at the
  till); stock qty shown, merchant coin pool hidden (soft "purse is empty"/capped warnings only); dev
  "Open test shop" in ⚙ Menu. Sonnet-executed, Opus-reviewed; execution surfaced + fixed a real
  `saveU()`-arg persistence bug and an onclick-closure bug (new §0 jsdom check evaluates rendered
  onclick strings in global scope).
- **Dice board overlay** (`diceOverlay` in `src/ui/dice.js`; `docs/DICE-OVERLAY.md`) — D&D-Beyond-style
  polyhedral roll theater: CSS/SVG tumble (no deps), fires on every player-facing roll via
  `dmRollFor`/`dmRollDice`, click-to-roll (engine rolls first — animation lands on predetermined
  results), adv/dis pair with the discarded die dimmed, crit-magnitude as a stage-2 die drop, Ivalice
  engraved faces w/ gold/blood crit flashes, `prefers-reduced-motion` honored. 4 seam checks
  mutation-tested (overlay must show EXACTLY the numbers sent to the DM).
- **Sidebar spell slots** — `ssSpellSlots` under HP/AC (Adam: first-tier visual ref): inline roman-numeral
  pip groups + steel Pact Magic row; absent for non-casters. Compacted to one line after the live walk
  showed the row-per-level version squeezing the badge area.
- **De-Claude visual pass** — engraved rail icons (helm·sword-shield·compass·key) replace Unicode glyphs;
  pin/heart icons; textures recropped from the Ivalice sheet (261×349 thumbnails → 336×468 tiles); ALL
  31 legacy px border-radii → 0 app-wide (now a verifier invariant); `--strange` purple → verdigris
  `#2e6f63` (incl. `diceSpice`'s pop color).
- **`docs/ASSET-PROMPTS.md`** — the T1 image-generation shopping list (title wordmark, scene plaque,
  You/DM medallions, seamless textures, icon gaps, battle-theater advance-buys) with the style-lock
  prompt + pipeline notes.

### Changed
- **`build/check-manifest.py` 163s → 0.2s** (one-pass owned-symbol scan, byte-identical output) — the
  per-edit gate is instant again. Docs index de-drift merged the same hour.
- `previewBuy`/`previewSell`/`sellValue` take an optional clamped `att` param (default 0 = byte-identical
  legacy behavior; `verify-economy` passes unmodified).

### Deferred
- Worthless-item vs broke-merchant sell rows read identically ("purse is empty") — UX nuance flagged in
  review, not a spec violation. Active haggling stays out (passive tint is the v1 hook). Hi-res seamless
  textures await the ASSET-PROMPTS generation session.


Two units landed together, both frontier-spec → Sonnet-execute → Opus-review, both with the `/code-review`
gate. Gates: `check-manifest` OK · `verify-in-session-ui` 58/58 · `verify-economy` 43/43 · full suite 0
regressions (items 123, dm-events 36).

### Added
- **Economy v1 buy/sell ENGINE + DATA spine** (`docs/ECONOMY.md`) — `data/economy.js` (`RARITY_VALUE`
  band Common 100→Legendary 200k · `SELL_RATIO` 0.5 · `PLACE_TIERS` hamlet→city · `SHOP_ARCHETYPES`) +
  `src/engine/economy.js` (`itemPrice`/`isConsumable`/`sellValue`/`merchantCoin`/`rollShopStock`/`makeShop`/
  `previewBuy`/`previewSell` — pure, emit `item_changed` payloads, never apply state). Prices off SRD `cost`
  + the rarity band; place-tier stock gating (no Very Rare+ at T1/T2); merchant-coin saturation guard;
  broke-merchant zero-payout refused. `verify-economy` 43/43 incl. 8 mutation guards.
- **In-session UI redesign** (`docs/IN-SESSION-UI.md`) — persistent status sidebar (identity/HP+temp/AC/
  condition·exhaustion·inspiration badges/clock/location), R3 framed-tab rail (Character·Actions·Map·⚙Menu),
  tabbed slide-in panels (Sheet w/ collapsible saves·skills, Inventory slots+load, History; Actions·Abilities·
  Spells; Map), ⚙ Menu popover. `data/actions-ref.js` (`STANDARD_ACTIONS_REF`, inform-only cards).
  `verify-in-session-ui` 58/58.
- **`docs/SHOP-UI.md`** — the shop buy/sell panel spec (queued follow-on; depends on both units above).
- **`ui-sketches/claude-design-revamp-070126/`** — the wireframe design source + `_mockup-clean.html` reference.

### Changed
- **`renderWorld` + in-session CSS rebuilt to the mockup** — full-bleed edge-to-edge (killed the
  `max-width:1180px` container + floating cards + footer), squared corners (`border-radius:0`), the game =
  the `.frame` interior only. `renderCharacterPanel` split into `charSheetBody`/`charInventoryBody`/
  `charHistoryBody`; shared `panelTabBar`/`slotTrackRow` helpers.
- **Feed readability** (Adam's override) — narration ~18% larger (20→23.5px) + dynamic reading-measure
  padding (generous full-width → tight when a panel squishes it).
- **Dice UI is contextual-only** — removed the standing "🎲 Roll dice" tray; kept the in-feed DM-requested
  roll prompt.

### Fixed
- **7 code-review follow-ups** (`dd5bef2`) — ⚙ menu items now `closeMenu()`; `slotTrackRow` shows the real
  denominator (caps dots only); Read-button preserves apostrophes; `manifest.json` unicode-escape churn
  normalized; `equipplaceholder` no-op inlined; dead `.game`/`.game-main` CSS removed; `condName` guarded.
- **Powers panel un-orphaned** (→ ⚙ Menu); rail never clips; ⚙ menu scrolls internally instead of clipping.

### Deferred
- **Shop-UI panel** — specced (`SHOP-UI.md`), queued; rides the new panel system + economy API.
- **Economy** — lodging/lifestyle sink, valuable-loot content, other currencies (all noted in `ECONOMY.md §8`).
- **Abilities tab layout** — the mockup shows the tab but never renders its body; used dot-trackers as a
  stand-in (the one component the design file didn't pin down — open for Adam).

## 2026-07-01 (later 3) — SRD MECHANIZATION BUILT — the last d20 gaps closed (check spine · conditions · concentration · combat actions · death saves · exhaustion)

Adam asked what SRD mechanics remained unwired; an audit found the engine's combat/items/progression spine was
~65% of the SRD, the gaps clustered in the connective d20 tissue the DM still freehanded. Specced
(`docs/SRD-MECHANIZATION.md`, six subsystems, all decisions locked) and built same day via the frontier-spec →
Sonnet-execute → Opus-review pipeline. Branch `feat/srd-mechanization`. Gates: `check-manifest` OK (64 modules) ·
**full suite green — 30 harnesses, 0 failed** (new: verify-check 41, verify-conditions 43, verify-concentration
30, verify-combat-actions 38, verify-death-saves 33, verify-hazards 30; zero regressions incl. walk 2807, items
123, social 97, dm-events 36) · 3 review-fix guards mutation-tested red→green.

### Added
- **§1 check/save spine** (`src/engine/check.js`) — `resolveCheck` (the one d20 primitive) + skill/save/ability
  callers, a computed margin-ladder `degree` (near-miss = −1..−2 only), `spellSaveDC` (finally resolved
  against), Heroic Inspiration reroll, and an `absurdity` magnitude (how far a nat-20/nat-1 defied the math →
  feeds CRIT-MAGNITUDE). Events: `check`, `inspiration_spend`.
- **§2 concentration + the full spell index** (`src/engine/concentration.js`, `data/spells.js` via
  `build/gen-spells.py`) — all 339 spells (concentration/ritual/duration/save), auto-drop-on-recast, the
  damage save (`max(10,⌊dmg/2⌋)`), 0-HP/incapacitated auto-break, ritual cast (10-min, no slot). Events:
  `cast`, `concentration_start`, `concentration_broken`.
- **§3 conditions engine** (`src/engine/conditions.js`) — the CONDITIONS effect table (auto-derived adv/dis),
  the `incapacitated` composition, structured `ttl` durations (rounds/untilSave/endOfNextTurn/concentration/
  indefinite) with `round_tick` auto-expiry. Widened `condition_add`/`_remove` to creature/PC targets; new
  `condition_expired`, `round_tick`.
- **§4 death saves + temp HP + massive damage** (`src/engine/death.js`) — 3/3 tracker, nat-20 revive / nat-1
  double-fail, damage-at-0 auto-fail, massive-damage instant death → the rebirth flow, temp-HP
  absorb-first/no-stack. Events: `death_save`, `temp_hp`.
- **§5 exhaustion + hazards** (`src/engine/hazards.js`) — 0–6 exhaustion (−2/level folded into every check,
  −5ft/level speed, L6 death), falling/on-fire/suffocation formulas. Event: `hazard_tick`.
- **§6 combat actions** (`src/engine/combat-actions.js`) — the action-economy budget, standard actions, Extra
  Attack (`attacksPerAction`), opportunity attacks, contested grapple/shove. Events: `action`,
  `opportunity_attack`, `grapple`, `shove`; `attack` gained `attackIndex`.

### Changed
- `docs/SRD-MECHANIZATION.md` status spec → built. `docs/EVENT-CONTRACT.md` extended with the new event surface.
- Kept nat-1-fails / nat-20-succeeds on **all** checks (Adam's call — fun beats nerd), with the `absurdity`
  magnitude scaling the narration's spectacle.

### Fixed (Opus review follow-ups, same branch)
- **Dodge/Disengage were wired-but-inert** — Dodge now lands a real `dodging` condition (attackers get
  disadvantage, auto-expires via ttl); the opportunity-attack event path gates on Disengage + spends the foe's
  reaction (one-per-round cap enforced) + passes the PC as target so their conditions shape the swing.
- **Grapple/shove ignored the foe's Strength** (`mods:{}` → +0) — `foeContestSheet` builds the defender from
  the foe's real ability mods. Three guards mutation-tested red→green.

### Deferred (still a priority, per the spec)
- Full monster-AI **tactics** (foe turn *decisions* — the math is already the engine's), T3/T4 class-feature
  executors, multiclassing, mounted/underwater sub-rules — and the eventual live **combat-tracker UI** to drive
  these events turn-by-turn (they're reachable but there's no in-app combat surface yet).

## 2026-07-01 (later 2) — ITEMS Part II code-review fixes (charge aliasing, worn +AC, heal fallback)

Post-build Opus code-review of the Part II commit surfaced three correctness findings; all fixed, each with
a mutation-tested regression check. Gates: `check-manifest` OK (57 modules) · **`verify-items.mjs` 123/123**
(was 117; +6 checks, three of them the new fix guards) · zero regressions (verify-combat 51, verify-dm-events 36).

### Fixed
- **Charge state aliased the global magic catalog (HIGH/blocker-class).** `enchOf` shallow-copied the
  catalog default overlay (`Object.assign({}, md.ench)`), so an instance's nested `charges` object was the
  *same reference* as `MAGIC_ITEMS_BY_NAME[…].ench.charges`. Spending charges on a migrated/attuned item
  mutated every sibling instance **and permanently poisoned the catalog** for the session (the loot-mint
  path deep-copies, which is why the original suite missed it — only the migrate/attune path was exposed).
  Fix: `enchOf` now deep-copies via `JSON.parse(JSON.stringify(md.ench))` (`src/engine/combat.js`).
- **Worn non-armor +AC magic items never affected AC (MEDIUM).** `cmSheetAC` only summed the armor/offHand
  slots, so attuning a Ring/Cloak of Protection recomputed AC to the *same* value and the attune ledger
  misreported a change. Fix: `cmSheetAC` now folds `enchActive(it).acBonus + .bonus` over worn instances
  outside the armor/offHand slots — attunement-gated, so it means "attuned +AC items grant their bonus"
  (`src/engine/combat.js`).
- **Potion-heal fallback dropped the dice (LOW/defensive).** When neither `p.roll` nor `cmRollDamage` was
  available, `item_use` healed only the flat bonus (Potion of Healing → +2 not 2d4+2). Fix: fall back to the
  deterministic dice average `n×⌊(die+1)/2⌋+bonus` (`src/world/dm.js`). Defensive-path only; never fired live.

### Added
- **Six new `verify-items.mjs` checks** (117→123), three of them fix guards — each mutation-tested (flip the
  fix off → check goes red → flip back) so they genuinely guard the regression, not pass vacuously.

## 2026-07-01 (later) — ITEMS Part II BUILT (congruence + potions + charges + attack path + UI + grip + encumbrance + attunement)

The whole of ITEMS Part II shipped. Adam confirmed congruence ("keep all items congruent", store charges)
and authorized building every flagged item; the conditions cleanup, the six-decision build, and the three
remaining flagged items all landed in one session. Gates: `check-manifest` OK (57 modules) ·
**`verify-items.mjs` 117/117** · zero regressions across the full suite (verify-combat 51, verify-dm-events
36, verify-social 97, verify-walk 2798, +14 more).

### Added
- **Congruent magic-item model (`ITEMS.md` §E).** `MAGIC_ITEMS_BY_NAME` (261 items, generated from
  `Reference/SRD-Data/magic-items.json`) = reference catalog + parsed enchantment overlay (`bonus`,
  `damageRider`, `acBonus`, `charges`, `attunement`, `rarity`). A magic instance resolves BASE mechanics off
  `ITEMS_BY_NAME` via `inst.base` and carries per-copy magic in `inst.ench` + an optional `inst.codexId`
  link. New engine helpers `magicDef`/`enchOf`/`enchActive`/`baseDef`/`attunedCount`.
- **Potions mechanized (Decision 2).** All 27 potions carry a `consumable.effect`; `item_use` fires the four
  healing tiers numerically in-engine and stamps every other potion as a structured `buff` the DM honors.
- **Charges.** `charge_spend`/`charge_restore` events + a long-rest auto-refill.
- **The live attack path.** `pcAttack`→`resolveAttack` driven by the equipped weapon via a new `attack`
  event (closes "cmEquippedDamage is computed but nothing calls resolveAttack").
- **Interactive inventory UI** (`src/world/inventory.js`, new module): `equipItem`/`unequipSlot`/`useItem`/
  `setGrip`/`attuneItem`/`unattuneItem` + per-item Equip/Use/Grip/Attune buttons and ench/charge/attunement
  badges in `renderCharacterPanel`.
- **Versatile two-handed grip (Decision 1).** `versatile{n,die}` in the weapon index; `sheet.equipped.grip`
  (1h/2h, default 2h when the off-hand is free) swaps the die in `cmEquippedDamage`; `set_grip` + wield
  toggle; an occupied off-hand forces 1h.
- **Encumbrance ON (Decision 4).** `carryState(sh)` — canonical SRD (soft STR×15 → Speed 5, hard STR×30);
  `item_changed` refuses an over-hard-cap pickup (`force:true` overrides); the Carrying bar shows amber/red.
- **Attunement cap.** `attune`/`unattune` enforce the SRD max-3; a requires-attunement overlay is dormant
  (`enchActive`) until attuned; AC recomputes on attune/unattune.

### Changed
- `cmEquippedDamage`/`cmEquippedAC`/`defaultEquip` resolve `inst.base` and fold the (attunement-gated)
  overlay; the `equip` kind-check uses `baseDef` so magic weapons validate.
- `data/items.js` grew into a full catalog (mundane index + `MAGIC_ITEMS_BY_NAME`) — by design; regenerate,
  never hand-edit.

### Fixed / removed
- **Item conditions trimmed.** `frozen` and `waterlogged` cut from `ITEM_CONDITIONS` (invented, no SRD
  basis, unwanted); `rusted` parked as an inert tag (hardcore corrosion track deferred until specced).
  `ITEMS.md` §D updated to match.

### Deferred (flagged)
- Attunement-*cap* is enforced, but there is no per-item attunement *prerequisite* checking (class/alignment
  gates) — out of scope for v1.

## 2026-07-01 — ITEMS Part II decisions resolved (docs-only)

Adam resolved the 6 latent decisions from the overnight ITEMS Part II spec. Docs-only; captures the calls +
two design deliverables he asked for (the elemental-condition map, the magic-item-model argument).

### Changed (`docs/ITEMS.md`)
- **§Latent decisions → §Decisions (resolved 2026-07-01):** ① two-handed grip is **explicit** (a `grip`
  flag + a wield toggle, not inference); ② **mechanize all 24 SRD potions** (numeric effects in-engine,
  duration-buffs as structured DM-honored buffs); ③ **item conditions are mechanical**; ④ **encumbrance is
  ON** (canonical SRD — over STR×15 → Speed 5 ft, hard cap STR×30 — "no barrelmancers"); ⑤ magic items →
  **congruence recommended** (pending confirm); ⑥ withdrawn (not a real fork).
- **New §D — the item-condition effects map.** Grounded in the SRD where it exists (the 2024 **Burning**
  glossary state = 1d4 fire/turn for `on-fire`; **Basic Poison** = +1d4 for `poisoned-coated`; cursed/broken
  behaviors) and Genesis-authored, flagged, where the SRD is silent (5.5e has no general elemental-status
  system — "damage types have no rules of their own"). `frozen`/`rusted`/`waterlogged` mapped to their
  damage-type flavor.
- **New §E — the congruent item model.** The argument for unifying magic + mundane into ONE instance model
  (base type in the index + a per-instance enchantment overlay + an optional codex *link* for narrative — three
  orthogonal layers, one lookup), replacing the earlier mundane-index / magic-codex split. Magic items are
  SRD-generatable (`magic-items.json`, 258); the codex is a link, not a storage path.
## 2026-06-30 (night, ITEMS completeness + Part II spec) — index the rest, shared `itemDef`, and the wiring/UI spec

Third items unit of the night (an overnight autonomous run). Indexed the remaining gear, hardened the
generator, and specced everything that's left to wire + an inventory UI overhaul. Branch
`feat/items-completeness-and-ui-spec`. Gates: `check-manifest` OK · **all 13 verifiers green** (verify-items
71) · verify-bridge 29 · generator idempotent. A 2-agent code review ran; the real findings are folded in.

### Added
- **Item index is now ~complete (175 items).** `gen-items.py` also parses the SRD **Tools** table
  (24 tools — Thieves'/Disguise/Herbalism Kits, every artisan's tool, Gaming Set) and ships a hand-authored
  **supplement** (`EXTRA_ITEMS`): the spellcasting **foci by form** (Arcane/Druidic/Holy, with explicit
  `"X (form)"` keys so they exact-match), the **2014-style pack items** the 2024 SRD prices only inside
  bundles (Mess Kit, Pitons, Censer, …), and a distinct **Spellbook** (3lb/50gp, was collapsing to "Book").
  Pack/kit resolution is now ~99% (65/66 · 89/91); the only non-resolves are the two pick-placeholders +
  one oddly-named container.
- **Shared `itemDef`/`itemKey` (`engine.combat`)** — the ONE name→definition lookup, folding the curly
  apostrophe to match the generator's keys. Fixes a real runtime bug: `Thieves' Tools` (U+2019) was *in*
  the index but never resolved in-app because render/combat/dm lower-cased without folding. Replaces 4
  open-coded `ITEMS_BY_NAME[String(name).trim().toLowerCase()]` copies (the review's reuse finding).
- **`docs/ITEMS.md` Part II (spec, not built):** §A missing item fields (versatile 2H, structured props,
  range, tool, focusFor, consumable, container, slot — with which wiring each unblocks); §B the full
  ordered wiring plan (Versatile → structured props → live combat runtime → economy → consumables →
  condition effects → tools/weight); §C the **inventory UI overhaul** (interactive equipped-loadout zone,
  equip/use/split/drop, weight bar, item detail — Charter-safe, event-routed); and **§Latent decisions** —
  6 open calls gathered for Adam (see the morning summary).

### Changed
- **Generator hardened (review fixes):** section slices are now located by header TEXT (`_section`), not
  hardcoded line numbers (a fragility flagged in two reviews); `load_tools` accepts `(Varies)` headings and
  resets the pending tool on every `###` so a weightless tool can't mis-pair its successor's weight;
  placeholder `cost:{n:0}` flavor items → `cost:None` ("unpriced", not "free" — the economy will treat them
  right). All verified byte-idempotent.

### Notes
- Review findings dismissed with cause: the two "itemDef in `owns`" manifest findings were false (it's in
  `callTimeDeps`, which is why check-manifest passes); the JS-vs-Python `\s` divergence is real only for
  exotic control codepoints that item names never contain (comment softened, not overclaimed).

## 2026-06-30 (night, ITEMS review fixes) — `/code-review` (xhigh) on the items build: 14 findings, the real ones fixed

A 10-angle extra-high review of the merged ITEMS feature. Most findings confirmed; fixed every correctness
one (incl. a **red-master test** the build's own clean-close missed) and documented the scope gaps. Branch
`fix/items-review-followups`. Gates: `check-manifest` OK · **all 13 verifiers green** (verify-items 51,
verify-saga 47, verify-creation-picks 24 — was RED, dm-events 36, combat 51, triage 27, rebirth-flow 19,
levelup 90, advancement 35, social 97, prep 43, codex 57, wake-prep 47) · verify-bridge 29.

### Fixed
- **Red master:** `dev/verify-creation-picks.mjs` asserted kit inventory entries were instrument STRINGS
  (now instances) → 1 failing check shipped to master. The build's clean-close ran 11 verifiers but not
  this one. Fixed the assertions (read `.name`).
- **Corpse recovery aliased instances + broke on legacy saves** (`rebirth.js` `claimCorpse`): looted gear
  was transferred by reference (shared ids → ambiguous removeIds/equip; aliased objects → a condition on
  the looter bled onto the dead PC's record), and a pre-feature corpse's string items concatenated into the
  looter's instance array (mixed → an item rendered as "undefined"). Now re-mints a fresh id + deep-copies
  conditions on recovery, and coerces any legacy string item.
- **Banked souls never migrated** (`state.js`): `migrateAll` migrated world characters but not `U.souls`,
  so an old-format banked soul kept string inventory. Extracted `migrateSheetInventory` and applied it to
  souls too.
- **`item_changed` old-shape silent no-op** (`dm.js`): a DM still emitting the pre-instance `remove:[name]`
  silently removed nothing (the exact silent-confiscation failure this system was built to fix). Added a
  deprecated name-match back-compat path.
- **`equip` accepted kind/slot mismatches** (`dm.js`): armor could go in a hand slot. Now validated for
  indexed items (unindexed/flavor still allowed anywhere).
- **`item_split` qty coercion** (`dm.js`): `p.qty|0` 32-bit-overflowed huge values; now `Math.floor(Number())`
  with a `bad-qty` rejection for non-positive / non-numeric.
- **Generator data bugs** (`gen-items.py`): a curly-vs-ASCII apostrophe mismatch let all 7 starting-pack
  umbrella rows leak into `ITEMS_BY_NAME` as phantom gear (fixed by folding `’`→`'` in `norm()`); the
  substring-resolution fallback mis-typed compound/qualified names (`2 Map/Scroll Cases`→Map, `Druidic
  Focus (Quarterstaff)`→a weapon) — now bails on `(`/`/` names, leaving them honest flavor-only.
- **`KIT_ITEM_EXPANSIONS` was an undeclared global** — added to the manifest `owns` (check-manifest's
  owns-check is one-directional, so it never flagged it). `migrateSheetInventory`/`uid` registered too.
- **CLAUDE.md drift** — the spec list still said ITEMS was "drafted not built." Corrected.
- **Weight display** rounded float-multiply noise (`Arrow ×20` showed "1.0") — a `fmtLb` helper rounds clean.

### Added (the AC gap, fixed properly — Adam's call)
- **AC now derives from worn armor** (`ITEMS.md` P5). `cmEquippedAC` (5.5e Light/Medium/Heavy + shield) +
  `cmSheetAC` (folds the flat feat bonus `sheet.acBonus`, e.g. Iron Skin's +1) are the canonical recompute,
  fired at every AC write site: `equip`/`unequip`, character creation (auto-equips the kit via `defaultEquip`),
  the `migrateWorld` backfill for pre-feature saves (reconstructs `acBonus` from feats), and the level-up
  ripple — `luRecomputeFromScores` now **re-derives** AC instead of blindly adding the DEX delta, which was
  wrong for no-DEX heavy / DEX-capped medium armor. Before this, `sh.ac` was a flat `10+DEX` that ignored
  armor entirely (a Fighter in Studded Leather showed AC 12, now correctly 14). +12 `verify-items` checks.

### Deferred (documented in `ITEMS.md` fast-follows, not bugs)
- `cmEquippedDamage` ignores Versatile two-handed; ~18% of pack items are unindexed so the carrying total
  undercounts (informational only). Flagged for follow-up.

## 2026-06-30 (night, ITEMS build) — Items: the type/instance split for gear, specced and built same-session

A live playtest fix surfaced a design question (`sheet.inventory` is plain strings — no objective
damage, no per-copy disambiguation, no home for a status); Adam resolved all five open design calls in
one message, then authorized the build. `docs/ITEMS.md` went from spec to **fully built, all four
phases**, same session. One unit: branch `feat/items-type-instance-split`. Gates: `check-manifest` OK
(56 modules) · **`verify-items.mjs` 42/42** (new) · zero regressions across 11 other full-app
verifiers (599 checks total, 0 failed).

### Added
- **`build/gen-items.py` + `data/items.js` — the type index** (the bestiary pattern reapplied to
  gear). 134 items: 38 weapons + 13 armor/shield (`equipment-weapons-armor.json`, structured JSON) +
  78 adventuring-gear + 5 ammunition entries (`equipment.md`'s real tables, regex-parsed, incl.
  fixing a dropped row from an unhandled `(full)` annotation and a word-order resolver fallback for
  SRD's own "Lantern, Hooded"-style naming). `ITEM_CONDITIONS` — the fixed 8-entry status vocabulary
  (on-fire/frozen/poisoned-coated/cursed/broken/dropped/waterlogged/rusted). `PACK_EXPANSIONS` — all 7
  SRD starting packs resolved to real individual line items (54/66 lines mechanically matched; the
  rest honestly degrade to flavor-only, never invented). `KIT_ITEM_EXPANSIONS` — generalizes the same
  parsing to every `CLASS_KIT` item string, not just packs ("4 Handaxes" → `{name:"Handaxe",qty:4}`).
- **`sheet.inventory` is now `{id,name,qty?,conditions:[]}` instances**, not strings — `migrateWorld`
  backfills old saves idempotently; character creation (`cgSheetExtras`) mints real instances for
  every kit item, expanding packs to their full individual contents (no more one bundled "Explorer's
  Pack" entry — they arrived together but are independently their own things).
- **`sheet.equipped = {mainHand, offHand, armor}`** — named slots, not a single pointer, so two-weapon
  fighting (main + off hand equipped at once) is representable.
- **5 new EVENT-CONTRACT events**: `item_split` (divide a stack — a new instance, its own id),
  `condition_add`/`condition_remove` (validated against `ITEM_CONDITIONS`), `equip`/`unequip` (named
  slots). `item_changed.remove` → `removeIds` (instance-targeted, never name-matched again).
- **`cmEquippedDamage`** (`src/engine/combat.js`) — resolves the PC's objective weapon damage from the
  index via the equipped instance (Finesse → better of STR/DEX, ranged → DEX); honors the SRD **base**
  two-weapon-fighting rule (`equipment.md` "Light" property, not a feat): the off-hand attack adds the
  ability modifier only if it's negative. `dmDigest.pc.equippedWeapons` surfaces the resolved spec
  every turn — the actual fix for "the DM has to recall the weapon's dice from memory," since
  `resolveAttack` isn't wired into a live runtime path yet (combat stays theater-of-mind, `COMBAT.md`).
- **Render**: real inventory instances (name × qty, weight hint, condition badges), total carrying
  weight vs. capacity (`STR × 15`, informational — SRD's own carrying-capacity rule is GM-invoked, not
  an automatic penalty), and the currently-equipped slots (read-only this pass).
- **`dev/verify-items.mjs`** (42 checks) — generator correctness, migration idempotency, character
  creation expansion, all 5 new events incl. dual-wield, `cmEquippedDamage`'s 8 cases, digest
  surfacing, render robustness (incl. an unindexed-name item never crashing or vanishing).

### Changed
- **`docs/EVENT-CONTRACT.md`** — the new events documented; `item_changed`'s entry rewritten for the
  instance model.
- Dead CSS removed (`.pack-row`/`.pack-contents`/`.pack-item`/`.pack-n` — the old bundled-pack
  `<details>` dropdown, now unreferenced since pack contents are real individual instances).

### Deferred (flagged honestly in `ITEMS.md`)
- No live combat runtime path — `resolveAttack` itself still isn't called from anywhere in the running
  app; `cmEquippedDamage` is ready for whenever the Fable-era tracker UI wires it in.
- No interactive equip button (render is read-only this pass) — not one of the five resolved asks.
- The economy track's buy/sell spine is now unblocked (real prices + the `item_changed` mutator both
  exist) but still not built — its own open calls (sell ratio, shop/merchant wiring, UI) stand.

## 2026-06-30 (later) — WALK-CONSUMPTION: the DM stops forgetting the rolled walk

Session-Prep has rolled 3 full walks (urban/dungeon/wilderness) every session since 2026-06-23, but they
reached the DM exactly **once** — the `⎘ Prep handoff` at session start. `dmDigest()` carried no walk, so by
turn ~3 the DM forgot it and drifted to freehand; there was also no provenance, so the wrap couldn't report
whether a walk was even used. Adam's framing from a Hungering-Stone capture-loop discussion: *"the DM doesn't
need to forget the walk until the walk has been walked."* Spec'd as 5 ordered steps (`docs/WALK-CONSUMPTION.md`)
and built same session on branch `feat/walk-consumption`. Gates: `check-manifest` OK (55 modules) ·
**verify-walk-consumption 37 · verify-capture 21 · verify-prep 43 · verify-prep-bundle 50 · verify-seam 29 ·
verify-dm-events 30 — 0 failed**; full 24-harness regression sweep clean.

### Added
- **`activeWalkDigest()` (`src/world/dm.js`) — a new `activeWalk` block on `dmDigest()`, sent EVERY turn**
  (not just at prep). Carries the walk's segments with a `here`/`behind`/`ahead` cursor, the DM's reskin
  overlay by ref, and the pre-cast frontier cast — framed as a SOFT prior identical to the existing
  `sessionLean` contract (player intent → situation → the walk; never a railroad).
- **The walk-state layer (`src/world/prep.js`)** — `w.prep.activeWalkId` + a per-frontier `cursor`
  (`current`/`touched`/`done`); `walkSetActive`/`walkAdvance`/`walkStamp`/`walkComplete`/`walkPromoteNext`.
  `lockOnContact` now sets the active walk on entry (and resumes the cursor on re-entry).
- **Three new `EVENT-CONTRACT.md` events** (documented + wired in `applyEvent`): `walk_advance`
  `{toSeg}` (the DM moves the cursor as the party clears a segment), `walk_complete` `{abandoned?}`
  (finalizes provenance, clears the active walk, **promotes + reskins the next prepped frontier** — no
  fresh-space invention, the bundle already holds 3 rolled walks), and `capture` (below).
- **`walkProvenanceReport()` (`src/world/seam.js`)** — mirrors `codexProvenanceReport`'s anti-drift ratio
  test: planned-vs-walked, segments touched/rolled, a `consumption` ratio, surfaced via `seamHarvest`. **This
  is the instrument that answers "are the rolled walks even being used."**
- **Stage-scaled walk length (`src/engine/prep-bundle.js`)** — `pbundleSegCount`/`pbundleLegCount` read the
  living PC's level: L1–2 → 3 segments … L9–10 → 7 (wilderness 3→5 legs). Content/threat band stays
  tier-driven; only length changes now.
- **`src/world/capture.js` (new module, `world.capture`) — capture as re-entry.** A `capture` event drops a
  subdued PC into a **holding segment of the active walk** (reused if the topology has one — cell/pit/vault/
  oubliette-shaped segments are detected by tag; else a single node is minted, never a new prison
  subsystem), nominates a **pre-cast NPC** as the possible escape lever (DM decides ally/betray — verbs stay
  with the DM), and opens a **fireable** disposition front-clock (ransom/interrogation/labor/execution-
  pending/trade/trophy — execution-pending has a deliberately short fuse). Captor = the faction most
  advanced against the PC by clock fill (live state, not rolled); only 4 small noun tables are new dice
  (disposition/holding/confiscation/opening). Capture with no active walk mints a one-node holding walk.
  Generalizes Adam's Hungering-Stone capture loop (the party fell into Pip's holding chamber, beside an
  NPC already spying who became the escape lever) off rolled handles instead of DM freehand.
- **`dev/verify-walk-consumption.mjs` (37 checks)** + **`dev/verify-capture.mjs` (21 checks)**.

### Changed
- **`docs/DM-BRIDGE.md`** — new "Read `digest.activeWalk` every turn" + "Capture as re-entry" sections, plus
  three new bullets in "Mechanics the DM MUST fire" and a line in the runbook checklist. This is the piece
  that makes Steps A–E load-bearing instead of inert: without telling the DM loop to read the field and emit
  the new events, the digest addition would just sit unread — the same failure mode the build fixes.
- **`docs/EVENT-CONTRACT.md`** — `walk_advance`/`walk_complete`/`capture` added to the event taxonomy table
  (alongside the just-landed `item_changed`, below — combined cleanly, no overlap).
- Beat events that fire mid-walk (`discovery`/`encounter_resolved`/`kill`/`front_closed`) now stamp
  `{walkId, seg}` on their ledger entry for the provenance report to read.

### Deferred
- **A live Bridge playtest** is the real validation — confirm the DM actually narrates from `activeWalk`
  instead of freehanding, that `walkProvenanceReport` shows real consumption, and that a capture lands
  cleanly mid-walk. Tune the length curve and `CAPTURE_HOLDING_TAGS` detection by feel once played.
- Capture's confiscation currently moves gear via `codex_update`; reconcile with `item_changed` (below) so
  there's one path for inventory mutation, not two.

---

## 2026-06-30 (night, fast-lane playtest) — `item_changed`: the inventory event the EVENT-CONTRACT was missing

A live Bridge playtest of the fast-lane triage (`feat/fast-lane-triage`) surfaced a real EVENT-CONTRACT gap:
**no typed event could ever mutate `sheet.inventory`/`sheet.gold`.** Last session the DM narrated Crowfoot's
gear "stripped" by his captors and logged it to the ledger as canon — but with nothing in `applyEvent` able to
touch the inventory array, the Character panel still showed his full kit. Drift the engine exists to prevent,
caught live. One unit: branch `fix/playtest-inventory-and-icon`. Gates: `check-manifest` OK ·
**verify-dm-events 36/36** (+6 new).

### Added
- **`item_changed` (EVENT-CONTRACT.md) — the one event that touches gear/coin.** `removeAll` strips the whole
  inventory (a searched/bound prisoner); `remove:[name]` takes named items (case-insensitive); `add:[name]`
  appends (loot, or **recovering confiscated gear** — every removal is logged with exactly what left, so a
  later `add` restores it precisely); `gold` is a signed delta, clamped at 0. Always logged to the ledger
  (`kind:"inventory"`). Unblocks the eventual loot/buy-sell/consumables economy track for free.
- **`dev/verify-dm-events.mjs`** — 6 new checks (removeAll strips + zeroes gold, every removed item reported,
  ledger logged, recovery `add` restores, case-insensitive `remove`, gold delta clamps at 0).

### Fixed
- **Spells rail icon** (`src/world/render.js`) — pointed at the missing `assets/icons/wand.png`; the `onerror`
  fallback silently swallowed it to a bare glyph. Now uses the existing `book-arcane.png` (shared with Codex —
  a dedicated `wand.png` is queued polish, not a blocker).

### Deferred
- A dedicated `wand.png` icon so Spells and Codex don't share the glyph.
- **CLAUDE.md gotcha to add:** the DM Bridge needs `python3 dev/dm-bridge.py`, NOT the plain `http.server` from
  "Run it" — the plain server has no `/turn`/`/response` routes, which read as "bridge unreachable" this session.

## 2026-06-30 (night, fast-lane build) — Hybrid fast-lane triage: the model-routing decision, mechanized

Built the first leg of the latency story. `DM-BRIDGE.md` §"Hybrid fast-lane" was strategy-only; now the lane
decision is **script-owned + wired**: a pure classifier stamps each turn's model lane, so the DM loop routes
routine beats to a fast model (Sonnet 5) and memorable ones to Opus — without re-deciding per turn. One unit:
branch `feat/fast-lane-triage`. Gates: `check-manifest` OK (54 modules) · **verify-triage 27 · verify-dm-events
30 · verify-bridge 29 — 0 failed.**

### Added
- **`src/world/triage.js` (`world.triage`, owns `dmTriage`) — the pure lane classifier.** `dmTriage(w,action)`
  returns `{lane,model,reasons[]}`. Default **fast** (sonnet); escalates to **deep** (opus) only on signals
  knowable *before* the DM composes: `new-place` (first contact, via a new `w.dm.lastNarratedNodeId` marker),
  `combat-active` (forward-compat with the combat tracker's `GS.combat`) / `combat-action` (combat verbs incl.
  multi-word targeted casts), `pc-downed`/`pc-bloodied`/`pc-condition`, `clock-due` (a full *open* doom clock),
  `no-living-pc`. Anti-drift: the script owns the routing decision, the DM doesn't eyeball it per turn.
- **`sendTurn` stamps `lane`/`laneModel`/`laneReasons`** onto every turn (all roll/dice/free-text paths funnel
  through it). The bridge stays a dumb mailbox; the `/response` contract is unchanged.
- **`dev/verify-triage.mjs` (27 checks)** — every routing case + the `lastNarratedNodeId` fallback + the
  rollRequest-defer + the `sendTurn` stamping wire.

### Changed
- **`docs/DM-BRIDGE.md` §"Hybrid fast-lane" — the runbook now OBEYS `turn.lane`** instead of eyeballing stakes:
  `fast` → a `model: sonnet` subagent, `deep` → compose on Opus. The one override is **upgrade-only** (the DM
  may lift fast→deep for a Mythic crit / revelation only it can foresee mid-compose; never downgrade). *Script
  owns the floor; the DM owns the ceiling.*
- **`build/check-manifest.py`** — `world.triage` layered (L1).

### Fixed (pre-merge `/code-review` high — 4 of 5 findings)
- **First-contact fast-laned (the headline):** `applyResponse` stamped `lastNarratedNodeId` unconditionally, so
  a roll-on-arrival (DM asks for a Perception check *before* describing the place) marked the node "narrated" one
  turn early → the real reveal routed fast. The marker now only advances when the scene is delivered (no pending
  `rollRequest`), so the roll-submit turn still deep-lanes the arrival.
- **Combat-verb regex:** broadened `cast … at` to multi-word SRD spell names (`cast ray of frost at`); dropped
  idiom-dominant bare verbs (`strike`/`swing`/`loose`) that over-escalated routine turns to Opus.
- **Dead `opts` param** removed from `dmTriage`.
- **Manifest `\u` re-encoding churn** (a `json.dump` with `ensure_ascii=True` swept ~32 unrelated `desc` fields)
  — re-emitted clean (`ensure_ascii=False`).

### Deferred
- **1 review finding (structural):** `dmTriage` open-codes the active-living-PC lookup that `livingSheet` already
  encapsulates; the dup is *forced* by layering (helper L4, triage L1). Track for the `refactor/world-gen-layer` pass.

## 2026-06-30 (night, addendum) — On-demand generation decision: "the engine owns the nouns"

Companion to the playtest-hardening entry below — the **same Bridge playtest** also produced a design decision. Its two doc edits (`DESIGN.md` + `NEXT-STEPS.md`) were carried into master inside the `feat/playtest-hardening` merge (a tree-wide `git add` swept them in); this addendum backfills the changelog/handoff record so the decision isn't invisible. **Docs-only.**

### Changed
- **`DESIGN.md` — new locked-decision block "On-demand generation: 'the engine owns the nouns'".** Engine owns scene **NOUNS** (NPCs/places/interiors/objects via the existing `rollNPC`/`rollPlace`/`rollItem`/`rollBuildingInterior`); the DM owns **VERBS + meaning** (threads/motives). Validated both ways in play — a DM-invented *thread* (the vanished lover was a mage who tore a passage and fled) was approved; freehanded scene NPCs + the house interior were flagged as nouns that should be rolled (rolled handles = doors, not walls). **A WIRING gap, not authoring** — the rollers exist and are rich (incl. the d300 `building-interior`), but prep fires them at frontiers only and live play / the Bridge can't reach them at all.
- **`NEXT-STEPS.md` — new ⭐ track "On-demand generation"** (ambient NPC pool at inhabited/start locations → wire `rollBuildingInterior` on building-entry → the DM→engine "request a roll" handshake → the NPC tiering gate).

### Deferred
- **Calibration (auto-memory, not code):** skill checks resolve as **degrees of failure, margin-based** — near-miss (~1–2 under DC) softened with maxed pressure, a miss by ~3+/5 is a full failure.

## 2026-06-30 (night) — Playtest hardening: fog-of-war, spellbook, dice, latency + the prefetch spec

A long live-Bridge playtest, fixing what surfaced turn by turn — DM/player vision split, the spellbook, the player dice mechanic, and the turn-latency drag — plus the speculative-prefetch design. One unit: branch `feat/playtest-hardening`. Gates: `check-manifest` OK (53 modules, 481 symbols) · **verify-bridge 29 · verify-dm-events 30 · verify-social 97 · verify-combat 51 · verify-prep 43 — 0 failed.**

### Added
- **Spells panel** (new left-rail button, casters-only) — casting ability/save-DC/attack tags + a **dotted spell-slot tracker** (one row per level, ● held / ○ spent, pact + pools; grows vertically for L1–L9), every known spell as a uniform gridded card with hover→full-text (reuses `#spellTip`). Pulls **class AND feat-granted** spells. `renderSpellPanel`/`spellSlotTracker`/`spellByName`.
- **Character "Chronicle & history"** — collapsible backstory in the Character panel (origins / why-this-path / life events with their inner rolls) + an in-play journey from the ledger. `renderCharacterHistory`.
- **Non-d20 player dice** — `rollDiceExpr` (ui.dice) rolls any `NdM±K` combo with a readable trace; `dmRollDice`/`dmRollExprInput`; the DM can prompt a specific roll via **`rollRequest.dice`** (damage/healing/table dice), and a **free dice tray** under the input rolls anything on demand.
- **Pack contents** — `PACK_CONTENTS` (SRD, 7 packs) in `data/srd-creator.js`; the inventory unfolds a pack (e.g. Explorer's Pack) into a dropdown of its items.
- **Turn-latency timer** — each DM line shows `⏱ Ns` (your-send → DM-answer round-trip).
- **Feed event chips** — `hp_changed`/`slot_spent`/`resource_spent`/etc. render as colored mechanical chips (`−7 HP → 5/12`, `◇ L1 slot → 2/3`) so the number is visible even if the DM doesn't say it. `eventChip`.
- **`dev/prep-fanout.workflow.js`** — deep-prep fan-out: Stage-1 harvest → parallel Stage-2 reskin per environment (+ pre-extract monster stat blocks), so live turns are lean reads. The DM session invokes it at session start.
- **`docs/SPECULATIVE-PREFETCH.md`** (system-spec, draft) — pre-load the next turn's *assets* (never narration) in the player's idle window; unused recycles via the soft-cast/lock-on-contact model. Phased P1→P3. Decision block in `DESIGN.md`.

### Changed
- **Fog-of-war — map** shows only known nodes (current / origin / walked-`seen` / soft / known-gazetteer); the seeded "nearby" nodes stay hidden until reached. `seeNode` (state) + `mapVisibleIds` + edge filter.
- **Fog-of-war — ledger → "Chronicle"** shows only player-witnessed entries (`ledgerPlayerVisible` hides spatial/drift/clock/npc-life/origin-canon) with a **⛨/👁 DM-view toggle**.
- **Gazetteer + Codex merged** into one "Codex" panel (`knowledgePanel` = relational codex + a Lore section folding in setting/myth); freed the rail slot for Spells.
- **Advantage/disadvantage mechanized** — `dmRollFor` rolls 2d20 keep-highest/lowest on `rollRequest.adv`; the breakdown shows both dice. Roll feed now shows the **full breakdown** (incl. proficiency): `Stealth d20=14 +3 +2 prof = 19`.
- **DM emphasis** — `mdBold` now renders `**bold**` **and** `*italic*`/`_italic_`, colored the steel-blue accent.
- **Latency** — `/response` is now **long-poll** (bridge holds the GET, returns the instant the DM answers; client re-issues on 204 — `DM_LONGPOLL_S`); `postState` scoped to the active world; the "considering" line is now an on-tone, varied wait.
- **In-game left rail** fits the viewport (no scrollbar; `clamp()` sizing); **End-session** button moved under the clock; the **session counter** off-by-one fixed (worlds create at `session:0`).
- **Siblings** (and age / inline life-event dice) now show the resolved count **and** the inner roll (`rollDetail`); seed/world rerolls dedup so the same whisper can't repeat.
- **Docs** — `DM-BRIDGE.md` gained: mechanics-the-DM-must-fire (state HP + fire `hp_changed`/`slot_spent`), the `rollRequest.adv`/`.dice` forms, the **Sonnet fast-lane**, the **deep prep fan-out**; `DIFFICULTY.md` gained the **degrees-of-failure margin ladder** (miss by 5 = real failure; wiggle room only at −1/−2).

### Fixed
- The **prep/wake fade** could stick black if the bridge health fetch hung — overlay now lifts on a guaranteed backstop and holds for a live DM instead of pre-empting onto "considering".
- The **character sheet** dropped feat-granted spells (the "missing cleric spell") — now lists Cantrips + Spells separately incl. feat magic, with a `✶ Spellbook` link.
- `verify-dm-events` "event chip shown" assertion updated for the humanized chip label (`fact_canonized` → "fact canonized").
- **Code-review (high, 8-angle) follow-ups:** registered the 12 new globals in `manifest.json` `owns` (the convention is exhaustive per-module — `check-manifest` passed regardless but now matches); `eventChip` `hp_changed` shows a neutral `•` for a zero delta (was the heal glyph ✚); `renderLedger` now **defaults to the player-visible filter** so a bare call can't leak DM machinery (the DM-view path still passes the full ledger explicitly). The flagged onclick-escaping "XSS" was refuted (the `JSON.stringify`+`&quot;` pattern is correct and matches the existing reviewed convention; values are DM-supplied).

### Deferred
- Speculative Prefetch **build** (spec'd; P1 deterministic reserve is the buildable entry point).
- Enemy/NPC advantage as a visible roll chip (player side is mechanized; NPC rolls stay DM-narrated).
- Wiring the `prep-fanout` Workflow + `prep_applied` apply-back into the DM loop automatically.

## 2026-06-30 (evening) — Combat engine: spec firmed + bestiary wired + resolver built

The combat track. Promoted `docs/COMBAT.md` **sketch → spec** (two forks resolved with Adam), then built the MVP spine — the fix for *creature = dead name-string*. Branch `feat/combat-engine`. A `/code-review` (high) pass was folded in pre-merge. Gates: `check-manifest` OK (53 modules) · **`verify-combat` 51/51** (new) · **all 21 verifiers green, 0 failures** (`verify-dm-events` 28→30).

**The two forks (Adam's calls, logged in `COMBAT.md` + `DESIGN.md`):** ① the automation split — *the script owns the numbers, the DM owns the decisions* (engine owns stats/rolls/HP/conditions/bands/CR-XP/events; monster turn *choices* + narration stay DM-narrated in v1; the player rolls their own d20 open, the engine rolls the monsters'). ② **side-based initiative** (PC side vs enemy side — a legal 5.5 variant for solo pace; per-creature is the Fable upgrade).

### Added
- **Bestiary index — `data/bestiary.js` (GENERATED by `build/gen-bestiary.py`; never hand-edit).** Parses the 374 `Asset Library/Monsters & Enemies/*.md` → **510 stat-block entries** (multi-block files split), AC/HP/CR/abilities **100%** / attacks ~99%. Handles three ability-line grammars + the SRD-2024 Unicode-minus + Adam's custom `**AC:**`/`# Name` single-block format. **Adam's 95 hand-authored custom d-tables carried VERBATIM** as `customTables`, never mechanized. `BESTIARY_BY_CR` indexes ids by CR. Registered (`data.bestiary`, owns `BESTIARY`/`BESTIARY_BY_CR`).
- **The combat resolver — `src/engine/combat.js` (`engine.combat`).** PURE like `engine.social` (operates only on transient combat objects, never `w`/codex). `resolveCreature` (the threat→stat-block resolver: name → CR-band fallback → DMG quick-stats — bridges the walk threat-names, which come from the threat-identity tables not the asset library), side-based initiative (`rollInitiative`), attack/save/damage math (`resolveAttack`/`resolveSave`/`cmRollDamage`/`cmRollD20` — pre-rolled d20 → the player's open roll; nat-1 miss / nat-20 crit-doubles-dice / cover AC / resist-immune-vuln), range-band movement (`moveBand`/`CM_BANDS`), `combatStart` (builds `GS.combat`), `combatFromEncounter` (walk→combat wire), `combatOutcomeEvents` (derives the EVENT-CONTRACT payloads).
- **Standardized SRD CR→XP — `CR_XP` + `crXp()` in `src/engine/advancement.js`.** The advancement seam combat prices against.
- **`dev/verify-combat.mjs` — 51 assertions** (bestiary wiring, resolution fallback, CR-XP + gating, side-based init, attack/save/damage, band movement, `combatStart`/`combatFromEncounter`/`combatOutcomeEvents`, and the `applyEvent` integration surface).

### Changed
- **`encounter_resolved` pricing (`advancement.js`)** now prices from **real foe CR** (sum of `CR_XP`) instead of the flat `100 × tier` placeholder — still **objective-gated** (the milestone re-tune is deferred; *don't tune twice*).
- **`kill{factionId}` → detected `clock_advanced` escalation (`src/world/dm.js`).** Killing a faction's person advances its grievance clock; on the **transition to full** it promotes to `clock_fired` once (the agenda comes due — the named-response spawn itself is DIFFICULTY.md-deferred), `forPlayer:false` so no PC XP. Closes the `DIFFICULTY.md` escalation gap.
- **`COMBAT.md` sketch → spec**; `DESIGN.md` combat row updated with the two resolved forks.

### Fixed (`/code-review` pass, pre-merge)
- **Flee-and-bank exploit:** `combatOutcomeEvents` priced XP from *all* foes — dropping 1 of 3 and fleeing banked all 3. Now prices from **defeated** foes only (matches the kill events + the "stealth/talk-past pays no combat XP" intent).
- **Dead-end escalation + re-fire spam:** a kill filled the faction clock but never emitted `clock_fired`, and re-emitted the escalation line on every subsequent kill once full. Now fires `clock_fired` **once on the transition**.
- **`crXp`/`CR_XP` were unregistered** in the manifest `owns` (check-manifest only validates declared symbols). Registered.
- **Parser `is_table_section` guard widened** to the `**AC:**` form (was narrower than the parser it gates → a custom abbreviated-AC stat block containing a pipe could be silently dropped).
- **Python↔JS slug rule aligned** (`slugify` now strips a leading article like `cmSlug`): the 6 `the-*` ids (Faerie Dragon, the blights, …) now resolve by direct name lookup, not just the O(n) fallback scan. Generator now warns on an id collision instead of silently suffixing `-x`.
- Removed dead `cmAbilityMod` (duplicated `abilMod`); extracted the duplicated d20/advantage block to `cmRollD20`.

### Deferred (in `COMBAT.md`)
- The in-app combat tracker **UI**; auto-objectified **terrain→cover** from the walk specs (highest-leverage fast-follow); per-creature initiative; monster/companion **AI**; death-save automation.
- ⚑ **The advancement re-tune** — un-gate CR-XP into the *primary* spine + demote the milestone economy to a supplement + re-tune `front_closed`/`clock_fired`/`choice` against felt combat XP — deferred until a live playtest feels real combat XP.

---

## 2026-06-30 (later) — Whole-repo code review + fix sweep

A full-repo code review (5 parallel subsystem agents + a cross-cutting scan) → fixed every actionable finding on branch `fix/code-review-sweep`. No new systems — correctness / security / drift hardening before the combat track. Gates: `check-manifest` OK · **all 20 verifiers green, 0 failures** (social 97 · dm-events 29 · advancement 35 · levelup 90 · walk 2807 · crit 25 · codex 57 · consequence 38 · seam 29 · prep 43 · prep-bundle 50 · saga 45 · rebirth 19 · wake-prep 47 · session 16 · creation-picks 24 · codex-roll 38 · monster-density 13 · plane 16 · proximity 12).

### Fixed (security)
- **DM-bridge path traversal (`dev/dm-bridge.py`):** `turnId` — a filename component on `/turn` + `/response` (GET & POST) — was interpolated unvalidated, so a `../`-laden id could read/write arbitrary `.json` outside `.dm/`, reachable cross-origin via the `Access-Control-Allow-Origin: *` routes. Now validated against `^[A-Za-z0-9_.-]+$` (`..` rejected) on all three routes. Static serving was never affected (`SimpleHTTPRequestHandler` sanitizes its own paths).
- **HTML-escaping asymmetry (stored-XSS / markup-break):** the DM-feed + character-sheet paths were carefully `escHtml`'d, but sibling panels weren't. Now escaped — player-typed character name/species/class/headline (`src/creator/roster.js`), faction name/agenda/method + pressure danger (`renderPowers`), gazetteer name/desc/cat (`gazPanel`), Oracle table text + filter (`src/ui/oracle.js`), bardo/sheet option labels. The roll-request button (`src/world/render.js`) now passes DM-supplied skill/ability as `JSON.stringify`'d args (the option-button pattern) — `escHtml` alone can't guard a `'` in the JS-string-inside-onclick context.

### Fixed (correctness)
- **`lookup()` missing-table guard (`src/engine/core.js`):** was `T[name].die` with no guard → a hard crash on an unknown table name during world-gen; now warns + returns an empty result (matching the engine's graceful-fallback idiom elsewhere).
- **`applyLeverage` terminal attitude (`src/engine/social.js` + `dm.js`):** a Helpful/+2 NPC (`socialDC` → `null`, "can't be talked higher") was silently coerced to DC 5 (trivially passable); now propagates `{dc:null, terminal:true}`, and the `social_check` handler reports "already-max" instead of faking a roll.
- **`spendResource` over-spend (`src/engine/resources.js` + `dm.js`):** reported `ok:true` while only partially paying; now refuses an over-spend (`ok:false, reason:"insufficient"`) like `spendSlot`, and the `resource_spent` handler distinguishes "no pool" from "not enough."
- **`attitude_shift` no-op (`src/world/dm.js`):** a shift with a missing `to` echoed the current value → a spurious "Wary → Wary" canon line; now rejected (`no-target-attitude`).
- **`findClockTarget` mis-targeting (`src/world/dm.js`):** the both-ways prefix match returned the first hit → a clock advance could land on the wrong same-stem front; now exact-match-first, unambiguous-prefix-only (ambiguous → untracked, not a guess).

### Changed (tooling)
- **`build/check-manifest.py`** owns-regex also catches `class` declarations (was a drift blind spot).
- **`build/apply-creature-scrub.py`** archives every file into a timestamped `zz_Archive/` before overwriting (the destructive-edit discipline; was git-only).
- **`build/gen-table-usage-audit.py`** writes its intermediate dump to `tempfile.gettempdir()` (was a hardcoded `/tmp`); **`build/scan-ip-remaining.py`** dead `if False` comprehension removed.

### Fixed (drift / docs)
- **`SEED` phantom-global note corrected** (`src/world/state.js` + `manifest.json`): transient state lives in `GS` — there is no live `SEED` global. `let U` → `var U` in `genesis.html` for parity with `GS` (window-reachable by inline handlers). Duplicate `.danger` CSS rule removed; stale `seed? (unused)` walk-opts doc dropped.
- **Two silently-broken verifiers repaired (`dev/verify-plane.mjs`, `dev/verify-proximity.mjs`):** their harness predeclared `var STAGES…`, colliding with `data/creation-flow.js`'s `const STAGES` (added to `loadOrder` later) → a SyntaxError on every run, on master. Stub trimmed to only what isn't in the module load order. Now plane 16/16 · proximity 12/12.

### Deferred
- **`src/engine/world-gen.js` + `hexmap.js` layer purity** — they mutate `w` / call up into the app layer from the `engine` layer. A genuine refactor (own branch `refactor/world-gen-layer`), not a sweep edit. Flagged, not done.
- **`check-manifest.py` layer-check depth** — validates declared `callTimeDeps`, not actual call sites, so a stale dep can hide an up-call. A checker feature; noted as a known limitation.

---

## 2026-06-30 — Loose-end sweep: XP rebalance + firing discipline + git cleanup + Success-Payout reconcile

Cleared the standing loose ends before the next track (combat). Git debris pruned; the XP economy re-tuned after a second playtest still felt inflated; the two parked design threads (#2 the dropped `xp_granted`, #3 Success-Payout Binding) resolved by *decision*, not new systems. Branch `fix/xp-rebalance-and-loose-ends`. Gates: `check-manifest` OK · `verify-advancement` 35/35 · `verify-dm-events` 29/29.

### Changed
- **XP trickle gutted (`src/engine/advancement.js`):** `discovery`/`fact_canonized` per-fact **10 → 1** (the daily cap held at `DISCOVERY_XP_PER_DAY = 30`). A maximally chatty in-world day now tops out at 30 XP — a tenth of a single level — so clue-hunting and dice-roll wins read as *flavour*, never advancement. (2026-06-28 cut 50→10 + added the cap; a second playtest still leveled the PC after nearly every dialog → this cut.)
- **DM-CHARTER §8.3b — "XP is detected, not declared: the firing ladder" (locked).** The deeper fix: the DM was mis-firing the *milestone* events on conversational beats, not just spamming `fact_canonized`. The new clause splits the labor — the DM judges *when a beat lands* (emits the event), the script owns *the number* (no `xp_granted`, no DM-named amounts) — and defines what legitimately counts as `front_closed` (an arc ends, not a scene) vs `clock_fired` vs `choice_logged{major}` vs the discovery rounding-error. "When unsure, narrate without an event."
- **`xp_granted` is an explicit no-op guard (`src/world/dm.js`)** — surfaced (console-warned) rather than silently dropped through `default`, so a stray DM emit is visible. Reason `xp-not-dm-granted`.

### Fixed (docs / drift)
- **`docs/ADVANCEMENT.md`** reconciled to the new numbers + a pointer to the §8.3b firing ladder (the number was the smaller half of the fix).
- **`docs/NEXT-STEPS.md` — Success-Payout Binding marked ☑ SUBSUMED** by the Consequence Ladder: prose-fiat banned by §8.5; **bind-first = `clBindFirst`**, **roll-on-miss = `clOnMissPlan`** (authorship = the effect-die "generate-to-contract, then capture" pattern, so no new event-node table is needed); clocking answered by the Diversion Rule. **Scope locked social-first.** Only the mint+capture call-site remains (deferred to post-playtest, per Consequence-Ladder §12).

### Chore
- **Git debris pruned:** removed the stale merged remote branch `feat/table-pass-place-gen`, the stale local branch `worktree-agent-afcee388c34fa46b2`, and the leftover agent worktree `.claude/worktrees/cranky-darwin-a14804`. Tree back to `master` / `origin/master`, single worktree.

### Decisions logged
- **Combat is the next track** (Adam 2026-06-30): a rudimentary SRD/DMG combat system *before* Fable — abstract "one/two moves away" range bands over the walk-module terrain, standardized CR-XP as the eventual advancement spine. Needs its own spec (like SOCIAL / the Consequence Ladder). Not built this session.
- **Test PC retired** — no XP reset; a fresh playthrough starts next.

---

## 2026-06-29 — The Consequence Ladder: re-authoring craft pass → a spice-band consequence system

The table re-authoring craft pass began with **Art Depiction**, which surfaced a system worth building: spice bands should earn **mechanical story-weight**, not just describe rarity. Spec `docs/CONSEQUENCE-LADDER.md`; DM-side licence `DM-CHARTER §8.5`; decision block in `DESIGN.md`. Branch `feat/consequence-ladder`.

### Added
- **`docs/CONSEQUENCE-LADDER.md`** — the full spec: demand-not-supply thesis · `band ≠ legs` decoupling · the chain → 3 sinks (handle / closed event / bind) + the Diversion Rule (anti-fractal) · codex-as-handles + interaction-gated storage · the player-rolled effect die · salience/promotion · the **session seam** (§7.1) + the **session-shape pacing model** (§7.2, the "parameters of fun") · the effect-die **generation contract** (§8, AI-generated not pooled).
- **`art-depiction` re-authored** (Spark→**Commitment**; 100 world-agnostic archetypal rows, 66/20/9/4/1) — the single-world Forgotten-Realms lore-dump became portable archetypes (DM grounds each onto the world's rolled facts; folds the IP scrub into the craft rewrite). High tail = the art itself goes wrong (talking/enterable/self-editing; incl. the Garrulous Gallery, Open Landscape, Vacant Frame). Original archived in `zz_Archive/`.
- **DM-only `Legs` + `Pool` columns** on Art Depiction (the Consequence-Ladder tags); `compile-tables.py` extended to carry them (exact-header match; excluded from narration text + structured cols; emitted as `row[6]/[7]` only when present — untagged tables byte-identical).
- **`src/engine/consequence.js`** (`engine.consequence`) — the pure resolver: `consequenceFor` (legs→sink, band→intensity) · `clResolveEffect` (pooled exemplar) · `clResolveStoredEffect` (captured bespoke die) · `clBindFirst` (reincorporation) · `clOnMissPlan` · `CL_LEGS`/`CL_POOLS`. `verify-consequence` 38/38.
- **`src/world/seam.js`** (`world.seam`) — the session seam: `seamHarvest` (carry-forward) · `seamProposeShape` (the pacing-model proposer) · `seamWeave` (trivialize/sustain/escalate) · `SESSION_SHAPES`. `verify-seam` 29/29.
- **`watcher-effect-pool`** — the first effect pool, the Hungering-Stone-standard exemplar (Nature · Player Use · The "Tell" · Escalation; spice-ordered 1→8). Kept as exemplar/fallback; the other six pools are **not** authored (replaced by the §8 generation contract).
- **The art hook** — `rollPlace({art:true})` rolls 0–2 art pieces (opt-in); `prepCastFrontier` mints hook/thread-seed pieces as their own soft codex handles (tags in `dm`, placed via `status.at`); dead-end art = narrate-and-forget flavor.
- **`dmDigest.sessionLean`** — surfaces the next-session lean + the non-trivial weave decisions + the override rule *in the payload* (so the DM can't read it as a mandate).

### Changed
- **DM Charter §8.5 (constitutional amendment): "Invention is licensed, but captured."** The AI may invent; the invention must land in the circuitry (codex/event/Ledger/motif), never free prose-canon. Refines the anti-drift north star (+ a pointer in §0).
- **The effect die is AI-generated to a contract, not a pre-authored pool** (Adam's call — pools sand off the specificity that *is* the value). Prep-time generation (primary) + on-the-fly (fallback); captured via `codex_update {dm:{effectDie}}`; `clResolveStoredEffect` reads it (round-trip verified — composes from existing events, no new event type).
- **The session shape is a soft lean, never a track** (Adam's refinement) — override hierarchy player→situation→lean; revealed-preference dominates the contrast nudge; applies only in lulls. "It colors; it never conveys."

### Fixed
- **Soft-pool eviction leak** — art handles given a `part-of` link were un-evictable (`codexEvictSoft` protects linked records), breaking the plateau bound. Switched to `status.at` placement (like NPCs/items) + added `artIds` to the recycle keep-set. Pool bounded again (`verify-prep` 43/43).
- **Compiler header collision** — the first cut matched `Legs`/`Archetype` by substring, hijacking legitimate "Archetype" content columns (`patron-archetype`, `dungeon-boss`, …) and blanking some narration. Switched to exact-header match; renamed the tag column `Archetype → Pool`.

### Deferred
- A **live Bridge playtest** to feel the seam + art hook + the lean in play (AI-side generation + pacing taste can only be judged live).
- The faction `motif` slot · mechanical sink-B beyond existing events · cross-world dormant-clock management · medium normalization (paintings-only is honored; `Art Medium`/`Art Condition` deferred).

### Verification
`check-manifest` OK · `compile-tables.py` 0 bugs (348 tables) · consequence 38 · seam 29 · codex 57 · codex-roll 38 · prep 43 · prep-bundle 50 · dm-events 29 · social 97 · crit 25 · advancement 35 — all green, no regressions.

---

## 2026-06-28 (evening) — Live-session fixes: XP rebalance, char-menu level-up, DM-agency rules

Three fixes surfaced while playtesting the live DM over the bridge. Branch `feat/playtest-xp-and-agency`.

### Added
- **XP readout + un-gated level-up in the character menu** — `renderCharacterPanel` (`src/world/render.js`)
  now shows an XP badge, a progress bar + "N XP to level X" line, and a **Level Up** button when one's
  earned (or "Choose your level-N powers" when interpretive picks are owed). New global `claimLevelUp`
  (`src/creator/levelup.js`) applies the level immediately — **leveling is decoupled from rest** (Adam:
  "you don't have to rest in BG3 to level up"); the rest-gate stays as a convenience trigger. CSS for
  `.cp-xp*` in `genesis.html`.

### Changed
- **DM-CHARTER §3** — new locked bullet *"Never act or speak AS the PC"*: the DM never narrates the
  character doing/saying anything the player hasn't declared, **not even to summarize known info**
  (the "Arke tells her" railroad). Hands off at the threshold instead.
- **DM-CHARTER §8.3a** — `fact_canonized` is for canon, not narration: reserve it for option-changing
  truths, not atmosphere.

### Fixed
- **XP economy rebalance** — a 19-fact social binge was paying 950 XP (→ level 3 off two interactions).
  `discovery`/`fact_canonized` dropped **50 → 10 XP**, and a **script-owned daily cap**
  (`DISCOVERY_XP_PER_DAY = 30`, enforced in `grantXp`, `src/world/dm.js`) zeroes further discovery XP
  past the ceiling per in-world day. Resolved tension (`front_closed` 300 / `clock_fired` 200) stays the
  uncapped level-driver; dice rolls pay nothing. Verified: the same binge now pays 30, resets next day.
  `verify-advancement` 35/35, `verify-levelup` 90/90, `verify-dm-events` 29/29.

### Deferred
- Current PC is already at L3/~950 XP from the old rates — the fix is forward-only (offered to reset that
  character's XP between sessions).
- The DM emits an `xp_granted` bonus-XP event that `applyEvent` silently ignores (~400 XP of intent
  dropped) — not a leak, but a latent trap: either wire it through the daily cap or tell the DM XP isn't
  its to grant.

## 2026-06-28 (later) — Deck-clearing: monster tags + table collapses + full IP scrub

The "clear the deck" prep before the craft pass (recontext/IP/wiring = enabling work, not the
re-authoring itself). All on `feat/reauthoring-deck-clearing`, merged to master.

### Added
- **Bestiary ecology tags** — all **374 monster files** gained `cr/role/habitat/treasure/activity/
  faction_fit` frontmatter (additive, +6/−0 each; custom tables untouched). A 14-agent workflow; the
  substrate for the future ecology selector (`REAUTHORING-SWEEP-PLAN` Track D).
- **Read-only evidence** — `docs/DECK-CLEARING-FINDINGS.md` + `build/{find-dup-rows,scan-creature-ip,
  scan-ip-remaining}.py`. The dedup scan **corrected** the recontext plan: the NPC mood/temperament
  cluster is 0–5% overlap (distinct content, not duplicates) — only `urban-scene→urban-sensory` was a
  clean fold.

### Changed
- **3 copy-paste tables collapsed (lossless)** — Travel Biome 100→12, Travel Destination Type 100→10,
  Urban Lighting 50→9 (same die, same odds, same text; originals archived). `build/collapse-duped-tables.py`.
- **IP scrub — the table corpus + monster stat files are now creature/deity/brand-clean.** Creature
  cluster (23 trademark nouns → coinages: Beholder→Eye-Tyrant, Mind Flayer→Mind-Thief, Drow→Deep-Elf,
  Aboleth→Elder Deep-Thing, Underdark→Deeplands…) + 15 stat files renamed; deities/demon-lords genericized
  (Gruumsh→the One-Eyed, Vecna→the Whispered One, Orcus→the Death-Lord, Baphomet→the Horned King…); all
  **100 celebrity `_Analog:` labels → `_Archetype:`**; FR places/factions/campaign tokens cleared; faction
  stubs renamed (Harpers→Hidden Network, Zhentarim→Shadow Syndicate). **Kept:** Shou (SRD-reprieved) + the
  **required SRD 5.2 CC-BY attribution**. Re-runnable via `build/apply-creature-scrub.py`. Recompiled
  tables.json/js. Verify: final real-IP grep clean; check-manifest OK; monster-density 13/13.

### Deferred (out of scope by design)
- **Art Depiction's FR lore-dump** (#2) — a CRAFT rewrite (invented epics), the first craft-pass target.
- The DC-Comics "Bane" / Outlandish diegetic reskin — its own item.

---

## 2026-06-28 (later) — Fix: DM stream is sticky-but-escapable (scroll-up no longer fought)

### Fixed
- **The word-by-word DM stream trapped the reader.** `streamDMText` (`src/world/render.js`) scrolled to the
  new message's *top* and then auto-followed the cursor whenever the reader was within 48px of the bottom —
  so trying to scroll up (to read back) was fought by the 24ms auto-scroll, and you were forced to watch it
  type. Rewrote it as **sticky-but-escapable**: it follows the bottom only while you're parked there
  (tracking the exact scrollTop *we* set), and the instant you grab the scrollbar (current pos diverges from
  ours), it **completes the text immediately and stops following** — so you read freely. Gates:
  `check-manifest` OK · `verify-dm-events` 29/29.

---

## 2026-06-28 (later) — Fix: DM narration truncated to its first line (quote in `data-full`)

### Fixed
- **The freshest DM line only showed up to its first double-quote.** `escHtml` (`src/world/render.js`)
  escaped `&<>` but **not `"`**, and the streaming renderer carries the new narration in a
  `data-full="${escHtml(m.text)}"` attribute. Since DM narration almost always contains dialogue
  (`"Who goes there?"`), the first `"` closed the attribute early, so `streamDMText` only ever streamed the
  text up to that quote — "only the top line." On refresh the line renders as element *content* (not an
  attribute), so the full text reappeared. Hardened `escHtml` to also escape `"` → `&quot;` (correct for an
  HTML escaper; renders identically in content and attributes). Gates: `check-manifest` OK · `verify-dm-events` 29/29.

---

## 2026-06-28 (later) — Fix: wake cinematic stall + leading-options regression (playtest)

Two playtest bugs at session creation, same flow (`autoOpenScene`).

### Fixed
- **Black-screen stall on entering a world.** When the app is served by `dm-bridge.py`, `/dm/health`
  returns OK, so the OPENING turn is sent and the loading cinematic is raised — but if **no live DM is
  watching**, the turn never resolves and `wakeReveal()` never fires, sticking on the loading screen
  (the existing fallbacks only covered bridge-down / fetch-reject). Added an 8s **safety-net timeout** in
  `autoOpenScene` (`src/world/play.js`) that lifts the screen if `GS.wakePrep` is still up — a no-op when
  the DM answers first.
- **Leading 3-option menu reappeared** (violates DM-CHARTER §3 "open handoff, default OFF since
  2026-06-24"). Two causes: the OPENING prompt **explicitly requested** "an `ask` with 3 choices," and
  `renderDMFeed` rendered the option buttons with **no gate**. Rewrote the OPENING prompt to ask for an
  open handoff with hooks planted in narration (no menu), and **gated the option buttons** behind a
  default-off dial `U.dmOptions` (`src/world/render.js`) — the prompt + open input always show; a genuine
  either/or fork lives in the DM's prose, not buttons.

Gates: `check-manifest.py` OK · `node --check` both files · `verify-dm-events.mjs` 29/29.

---

## 2026-06-28 (later) — Re-authoring sweep planning: recontext scan + corpus intensity-map + rubric

A planning/docs unit (no table source or module changes). A 5-angle recontextualization workflow + a
monster-flavor/wiring recon agent, synthesized into an executable plan; then — after Adam clarified that
"re-authoring" means a **hands-on whole-corpus craft pass** (every row up to par + seed explosive high-band
twists), not triage — the craft-pass tooling (a generated corpus map + a rubric). The recontext / IP-strip /
monster-wiring work is reframed as the **deck-clearing prep**, not the main event.

### Added
- **`docs/REAUTHORING-SWEEP-PLAN.md`** — the executable **two-lane** plan: **Lane A (autonomous-safe,
  overnight)** = 3 recontext primitives (lens-operator / compose / merge-helper) + 4 SRD-mined lenses
  (Condition / Hazard-Effect / Trait→Behavior / Magic-Item) + new content tables + the **bestiary substrate**;
  **Lane B (propose-and-wait)** = consolidation (merge/retire ~11 items), the **creature IP scrub** (a
  scripted token-swap that doubles as the creature-reskin mechanism), the hand-authoring residue (#2 Art
  Depiction the long pole), the Outlandish reskin, and the **monster-into-game wiring** (the bestiary is 100%
  unwired today — creature = a dead name-string via `walkPickFromPool`).
- **`build/corpus-intensity-map.py` + `docs/CORPUS-INTENSITY-MAP.md`** (generated) — scores all **347 tables**
  on floor (copy-paste/ungraded) + ceiling (explosive headroom). Surfaced: **238 content tables, ~210
  UNGRADED** (no band column — spice unrecorded), **27 ★BAR exemplars** (the study set), **12 DUPED**
  (copy-paste-inflated → die-collapse). Re-run after edits.
- **`docs/REAUTHORING-RUBRIC.md`** — the craft-pass standard: the quality **floor** + the explosive
  **ceiling**, benched on the corpus's own best rows (Myth Costs "The Retroactive Author", Place-Secret "The
  Memory Sustains It", Plot Item "The First Door"); the "what makes a row explode" distillation + six
  explosive **seed-patterns** + the per-table working loop + the honest band-split target.

### Changed
- **`docs/NEXT-STEPS.md`** — the re-authoring section restructured into a pointer to the two-lane plan.
- **`docs/README.md`** — indexed the three new docs.
- **`docs/TABLE-REAUTHORING-PREP.md`** — banner: this is now the per-table **flavor brief** under the plan
  (the flat 38-item worklist framing is superseded).

### Deferred / carried forward
- The deck-clearing (consolidation / IP-strip / monster-wiring) and the whole-corpus craft pass are **queued**
  on a fresh branch. Destructive moves are **propose-and-wait** (Adam's call). The IP strip stays.
- Reframe saved to auto-memory: **"re-authoring" = a hands-on whole-corpus craft pass**, not recontext/triage;
  recontext/IP/wiring is enabling prep.

---

## 2026-06-28 (later) — SOCIAL Phases 3 + 4 (events + surfacing) + a `/code-review` fix pass

A general `/code-review` of the merged SOCIAL Phases 1–2, then the follow-ups Adam asked for: fix the
findings, **wire Phase 3** (the event layer), then **Phase 4** (surfacing). All on `master`'s working tree;
`check-manifest.py` green; the social verifier grew 68 → **97/97**. SOCIAL is now end-to-end.

### Added — Phase 4 (surfacing)
- **DM digest materializes attitude** (`codexDigest`): every NPC carries `attitude{value,label,opening,
  floor,ceiling,terrified,read,lazy}` via `codexGetAttitude` — the DM reads the stance even on a lazy-default
  NPC instead of guessing it.
- **The player-facing disposition tell** — a five-step dot ladder + label on the Codex panel (`codexPanel`),
  shown **only** for an NPC the player has *read*. New `insight_read` event prices the §6 scaled DC
  (`insightReadDC`) vs the player's open roll → on success flips `attitude.read` via the new
  `codexMarkAttitudeRead`; `codexPlayerView` gates the tell on `known && read` and exposes value+label only
  (never the DC/opening/clamps — those stay the DM's spine).

### Added — Phase 3 (events)
- **The typed events** (`src/world/dm.js` `applyEvent`): `social_check`, `attitude_shift`,
  `morale_check`, `parley_open`. `social_check` is **declared** (the PC's open roll + skill + visible levers);
  the script prices the DC from the NPC's CURRENT attitude (`socialDC` + `applyLeverage`), runs
  `resolveSocialCheck`, and COMMITS the delta via `codexSetAttitude`/`codexSetTerrified` — the DM reports the
  dice, never the verdict (§5 anti-drift). The **detected** `kill{civilian}`+co-location → witness-hostility
  cascade fires off the new `codexWitnessesAt` (the script remembers who saw). Faction-member group cascade
  stays declared via `attitude_shift` (§7 scope guard).
- `codexWitnessesAt(w, at, exceptId)` (`src/world/codex.js`, registered in `manifest.json`) — co-located NPC
  query for the witness cascade.
- 19 new `dev/verify-social.mjs` assertions (Phase 3 events + regression guards for every fix below).

### Fixed (from the review)
- **`codexSetTerrified` branded a never-frightened NPC permanently Hostile** when the resolver cleared the
  flag — clearing terror on an NPC with no attitude is now a no-op (no minted record).
- **A sworn enemy clamped below Indifferent returned `granted:true`** at its ceiling — now resolves to
  `outcome:"wall"`, `granted:false` (a telegraphed wall, not bought cooperation); a cap AT Indifferent or
  above still grants.
- **`applyLeverage` honored `decisive` only for `type:"leverage"`** — now ANY decisive lever auto-shifts, so
  a §4.2 buy-off encoded `{type:"want",decisive:true}` bypasses the roll.
- **`codexAdd`'s shallow `Object.assign` could clobber the nested attitude object** on an idempotent re-add —
  now deep-merges `status.attitude` (clamps/opening/terror survive a partial re-add).
- **`engine.social` had no layer** in `check-manifest.py` — added (L1, pure logic); the warning is gone.
- Clarified in `resolveSocialCheck` that the per-NPC floor intentionally bounds a Terrified result.

---

## 2026-06-28 — ANTI-DRIFT PUSH: XGtE/Tasha mining → content + the SOCIAL subsystem (Phases 1–2)

Adam added *Xanathar's Guide* + *Tasha's Cauldron* to `Reference/` and asked what mechanical content could replace
AI-DM invention. Mined both (+ the DMG) for structure, authored IP-clean, then built. All on branch
`feat/antidrift-content-gifts-tools` (one session; not yet merged). Edit-source → compile-artifact throughout;
`compile-tables.py` 0 coverage bugs; `check-manifest.py` green.

### Added
- **The SOCIAL subsystem — the social analog of combat** (`docs/SOCIAL.md`, new system-spec): a 5-state Attitude
  ladder (Hostile…Helpful) as per-NPC Standing, attitude-derived social-check resolution (one Cha check shifts one
  step; the existing `NPC Want/Fear/Leverage/Trust-Lever` tables become the DC modifiers), morale/fight-or-flight
  (shippable before the combat engine), and creature parley fed by `Monster Motivation`. Collapses the DMG
  NPC-attitude + morale and Tasha's *Parleying* candidates into one resolver. All 6 §9 open questions resolved w/ Adam.
  - **Phase 1 (data model):** `status.attitude` on the codex record + `codexGetAttitude` (lazy Indifferent default),
    `codexAttitudeOpen` (opening stamped once + per-NPC floor/ceiling clamps), `codexSetAttitude`, `codexSetTerrified`
    (per-encounter override), `attitudeLabel` (`src/world/codex.js`). Rides the DM digest; stripped from player view.
  - **Phase 2 (resolver):** `src/engine/social.js` (new module — pure/deterministic, returns deltas, no state writes):
    `socialDC` / `applyLeverage` / `resolveSocialCheck` / `moraleDC` / `resolveMorale` / `insightReadDC`.
  - **Verifier:** `dev/verify-social.mjs` **68/68** (the spec's §8 worked examples ride as fixtures).
  - **Dependent tables (rollable):** `NPC Opening Attitude` (Fork), `Creature Parley — What It Wants` (Fork),
    `Morale Outcome` (Commitment→Mythic).
- **Supernatural gifts — a reward currency** (rollable via the Oracle): `Supernatural Charms` (d20 Fork, finite-use
  perks) + `Supernatural Blessings` (d20 Commitment, lasting favors → Ledger canon). IP-clean Genesis-native.
- **Anti-drift content from the backlog:** `Puzzle Type/Mechanism/Solution Path/Failsafe` (the Failsafe = the solo
  no-wall-block), `Patron Archetype` (+ codex design note), `Tool Proficiency Uses` / `DC Ladder` / `Hazard Severity`
  / `Walk-On Quick Stats` (DM-reference lookups — not rolled).
- **Docs:** `docs/TABLE-REAUTHORING-PREP.md` (workflow-synthesized prep for the next flavor pass — ~26 weak tables
  prioritized, 6 resolve-first decisions, IP-scrub list, exemplars); XGtE/Tasha source map + ranked anti-drift
  candidates added to `DESIGN.md` + `NEXT-STEPS.md`.

### Changed
- **Stale band-vocab sweep:** `Less-Grounded` → `Textured` across **28 active tables** (all 21 Tarot cards,
  Architecture Material, Art Medium, Atmosphere Sounds, Master Setting, Faction–Basic, Social-taboos, Starting State
  Pressure); 3 `zz_Archive` snapshots left untouched. Recompiled.
- **Decision (Adam): `Dungeon Loot - Outlandish`** keeps its cross-IP joke loot but gets a **diegetic reskin**
  (describe the thing as a fantasy world perceives it — neutralizes the trademark-name IP risk) + a new backlog item
  for **anachronism-intrusion hooks**.

### Fixed
- `Creature Parley` row 20 carried a Volatile band on a Fork table → rebanded to Strange (caught by the workflow's
  adversarial review).
- `Urban Encounter Type` row 20 had an unclosed `**Complex Scene` bold → closed.
- `Walk-On Quick Stats` cited a nonexistent `Thug` sheet → `Spy`; `Patron Archetype` `owes` link-direction gloss.

### Deferred
- **SOCIAL Phase 3** (the `social_check`/`attitude_shift`/`morale_check`/`parley_open` events through `applyEvent`,
  incl. detected auto-shifts: kill-witnessed → hostility, faction clock → member drop) and **Phase 4** (digest +
  player-facing attitude tell).
- Wiring the gift/tool/DC references into the DM digest; codex `gifts[]` PC flag + granting hooks; puzzle/patron
  generator call-sites.
- The **table re-authoring pass** (prep doc ready) + the **IP scrub** it surfaced (`Art Depiction` rows ~46–96 are a
  Forgotten-Realms lore-dump; a ~15-file WotC creature/race/plane spread).
- The Outlandish diegetic reskin + anachronism hooks (direction decided, not built).

---

## 2026-06-26 — SCOPED TO TIER 2: level-10 ceiling + leveling 1→10 + balance guards

Decision (Adam): **cap this version at Tier 2 (levels 1–10)**; defer Tiers 3–4 to a future expansion.
Aim for a solid, complete T1–T2 experience. New decision doc **`docs/TIER-SCOPE.md`**. Shipped as 4
merges (Phases A–E across `feat/tier2-cap-guards`, `feat/tier2-advancement`, `feat/tier2-balance`).

### Added
- **The leveling spine — characters can now level 1→10** (was: level-1 forever). New
  `src/engine/advancement.js`: SRD `XP_THRESHOLDS` (in-code canon; full L1–20 with `levelForXp` clamping
  to `LEVEL_CEILING=10`), `xpForEvent` draft pricing, `awardXp`, `applyLevelUp` (re-derives + GROWS HP /
  proficiency / spell slots / pools). XP accrues via `grantXp` on the priced `applyEvent` cases; `passTime`
  is the rest-gate that claims a pending level-up. Interpretive picks (spells/ASI/subclass) are DM-narrated
  in v1; the in-app picker is a fast-follow.
- **Tier-2 cap guards** — `TIER_CAP=2` + `pbundleTierForLevel` (prep-bundle); the walk generators clamp
  `opts.tier ≤ 2`; the bundle `meta` carries `tierCap/levelCeiling/crCeiling`.
- **Wilderness tier-awareness + threat-signaling** — `rollWildernessWalk` is tier-aware; every Enemy leg
  telegraphs danger (fiction-only, via the sign-of-passage), closing the DIFFICULTY.md wilderness gap.
- **Verifiers** — `dev/verify-advancement.mjs` (35), `dev/verify-monster-density.mjs` (13, CR-roster audit:
  T1=234 / T2=97, flags CR9-10=14 thin); cap/guard assertions added to `verify-walk` (2801) +
  `verify-prep-bundle` (50).

### Changed
- `applyEvent` `level_applied` is now the real recompute (was a deferred stub), capped at the ceiling.
- `ensureResources` lazily heals pre-leveling saves (`level`/`xp`). `cgBind` stamps `level:1, xp:0`.

### Fixed (pre-merge /code-review)
- `applyLevelUp` no longer full-heals on level-up (would free-heal on a short rest) — it grows current HP
  by the gain only. Proficiency now reads CLASS_PROGRESSION's canonical `pb` (formula fallback).

### Deferred (authored-but-inert; docs/TIER-SCOPE.md) + content-backlog
- T3/T4 loot budgets + Legendary/Artifact tables, Outlandish d300 banding (L4), the 5 variant items (L3b),
  CLASS_PROGRESSION L11–20, the Encounter-template T3/T4 sections — all marked DEFERRED. Verify-guarded so
  the in-game loot path can't surface a deferred band.
- **Queued (T1/T2 polish):** the `wilderness-threat-identity-t1/-t2` tables (sample-review authoring pass);
  the in-app level-up choice picker; CR 9–10 capstone density.

---

## 2026-06-26 — Critical-Magnitude engine WIRED (the honest-dice spike)

`CRIT-MAGNITUDE.md`'s two remaining unbuilt pieces (the crit engine + the auto-canon Ledger write) are
now built — the lens oracle (built 2026-06-23) is wired to live d20 rolls. Branch `feat/crit-magnitude`.

### Added
- **`src/engine/crit.js`** (new module, 44 total) — `rollCritMagnitude(natural,{magnitude})`: a nat 20/1
  + the magnitude d20 → band (`critBand`: success ladder + the INVERTED failure ladder) → lens count →
  `critDrawLenses` draws that many DISTINCT lenses from the compiled `mythic-success/failure-lenses` (d12;
  reroll dupes). The row-1 "a place is transformed/scarred" lens routes into the Myth suite (rolls
  `myth-seeds`). Pure roller — returns an atom payload (rolled dice + lens vectors), never writes the world.
- **`crit_outcome` event** in `applyEvent` (`src/world/dm.js`) — writes a Mythic result to the Ledger as
  **canon** (the permanent boon/scar); amplified results log as `outcome`. The DM narrates the shape, then
  emits the event; the script owns the persistence (EVENT-CONTRACT).
- **`dmRollFor` hook** — on a nat 20/1 it rolls the magnitude die **openly** (Charter §6.1 dice
  transparency) and attaches the lens vector to the turn, so the DM narrates *from* the dice.

### Verified
- `dev/verify-crit.mjs` 23/23 (band table both ladders, distinct-lens draw, place→Myth handoff, crit_outcome
  canon-vs-outcome routing); `check-manifest` OK (44 modules; `engine.crit` layer 1); no regressions
  (`verify-dm-events` 28 / codex 57 / prep 43 / session 16). In-play handshake render to eyeball at the
  next live Bridge session.

---

## 2026-06-26 — CODEX loose ends closed (soft-pool eviction cap + prep item-casting) + consistency review

Tied off the two follow-ups the Codex track left open, after a cross-system architecture/style review
confirmed the recent systems (Codex / Session-Prep / Death & Rebirth / event runtime) are coherent —
consistent layering, naming (`roll*`/`codex*`/`apply*`), state discipline (GS vs U accessors), and
event-contract adherence. One drift flagged for a separate change: `rollVision` mutates despite the
`roll*` prefix (→ rename `fireVision`).

### Added
- **Soft-pool eviction cap** (`codexEvictSoft(w,{cap,keepIds})` in `src/world/codex.js`, default
  `CODEX_SOFT_CAP=24`) — the code-review follow-up. Records now carry a monotonic mint `seq`; eviction
  drops the OLDEST untouched soft records beyond the cap, keeping the freshest as the §8b reusable pool.
  SACRED (never evicted): hard (touched=canon), known, any link endpoint, anything in `keepIds`. Wired
  into `prepRecycleStale` (`src/world/prep.js`) — the recycle heartbeat computes `keepIds` from surviving
  frontier-bound cast, so the pool stays bounded **independent of session count** (the digest no longer
  grows unbounded over a long campaign).
- **Prep item-casting** — `pbundleCast` (`src/engine/prep-bundle.js`) now rolls the macguffin via
  `rollItem` (sometimes lock-sealed); `prepCastFrontier` mints + places it at the frontier location
  (status.at), the DM wires who-holds-it; `prepBundleSummary` surfaces it for Stage-1; the cast count
  includes it. (The roller existed since Phase 5; prep now calls it — the easy follow-on.)

### Verified
- `check-manifest` OK (43 modules, +2 owned symbols on codex.js, +`rollItem`/`codexEvictSoft` deps).
- `verify-codex` 57 (8 new eviction assertions), `verify-prep` 43 (item-casting + a 30-session
  eviction-plateau test proving boundedness), `verify-codex-roll` 38, `verify-prep-bundle` 47,
  `verify-session` 16, `verify-dm-events` 28 — all green.

---

## 2026-06-25 — Project relocated + stale path strings swept

Genesis was moved out of the Obsidian vault to its own home at `~/Desktop/Work/projects/Genesis`
(commits `bf3818c` → `8bb6a93`). It is no longer a sibling of the `Shifting Vale` / `Playtest Sandbox`
human-DM vaults (those now live at `~/Desktop/D&D/Obsidian Files/`). A follow-up pass swept the stale
`Obsidian Files/Genesis/` path strings the move left behind.

### Changed
- **Relocated the repo** to `~/Desktop/Work/projects/Genesis`; recorded the move in `CLAUDE.md`
  (the campaign vaults are "no longer siblings").
- **Swept stale path strings** (`docs/relocation-path-cleanup`, `9f11f6d` → `798d576`): `HANDOFF.md`
  ("Where to operate" + the manual `http.server` run command), `README.md` (docs-folder location),
  `DESIGN.md` (docs-organization decision entry). Verified all referenced paths resolve on disk
  (repo root, campaign vaults, `Open Genesis.command` launcher — the launcher already pointed at the
  new path).
- **Updated the `genesis` skill** to match — live `SKILL.md` **and** the plugin `manifest.json`
  description (the latter is what drives skill triggering), so a fresh session loads the correct
  `~/Desktop/Work/projects/Genesis` paths.

### Left as-is (history, not drift)
- Dated historical log lines in `CHANGELOG.md` (the repo-init entry) and `NEXT-STEPS.md` (the
  2026-06-18 ☑ engine-dedup entry) still name the old path — they record where things were *at that
  date*, so rewriting them would falsify the log.

---

## 2026-06-25 — CODEX Phases 2–5 REVIEWED + MERGED to master

Pre-merge `/code-review` (8 finder angles → 3 real fixes) then `--no-ff` merge of `feat/codex-phase2`
(Phases 2–5) to `master`; pushed to `origin` (`b3eee9a`), branch deleted.

### Fixed (from the review)
- **`startSession` flag ordering** (`play.js`) — set `w.sessionLive=true` BEFORE `beginSession()`, so a
  throw past `beginSession`'s inner catch can't strand a half-started session into a double-increment.
- **Prep-cast id collisions** (`prep.js`) — new `prepCastId()` disambiguates same-named cast records; two
  frontiers rolling the same place/NPC name now mint distinct records instead of silently merging via
  `codexAdd` (which would point both frontier nodes at one location and reveal the wrong one on contact).
- **`status` clobber** (`prep.js`) — merge the NPC status object rather than replacing it wholesale, so a
  future `rollNPC` status field survives the `{at:locId}` placement.
- `verify-prep.mjs` +2 (→36): same-named cast records stay distinct.

### Deferred (logged in NEXT-STEPS — design call needed)
- **Soft-pool eviction cap** — every session casts ~6 soft codex records that survive recycle (the §8b
  reusable pool), and `dmDigest` sends the whole codex each turn, so the digest grows unbounded over a long
  campaign. Needs a prune/cap policy (age-out untouched soft records, or digest only near-PC + 1-hop links).

**Codex Phases 1–5 are now on master.** The anti-drift loop is closed: dice deal the cast, the DM connects
rather than invents. Remaining: Phase 6 (Codex UI panel) + the soft-pool cap + a live re-playtest (eyeball
the Phase 4 shelf button/cinematic; run the `codexProvenanceReport` ratio test vs the ~20% Saltrest baseline).

---

## 2026-06-24 (session 11) — CODEX Phase 5 BUILT (the two missing table-sets)

The tables the Saltrest DM had to invent whole — now rolled. Three net-new **d300 Commitment** tables,
spice-graded 198/60/27/12/3, authored via 3 parallel Sonnet agents (one file each, disjoint lanes) and
compiled.

### Added (Engine tables)
- **`building-interior`** (`Engine/.../Place Generation/Building Interior.md`) — connected spaces + a
  notable feature + who/what's inside, for any building the players enter. The "gran's house had nothing
  to roll" fix. Ladder escalates the SPACE (ordinary rooms → hidden room → impossible geometry).
- **`plot-item`** (`Engine/.../Quests & Problems/Plot Item.md`) — a specific significant object + why it
  matters + what it opens/proves/unlocks. Replaces the abstract `quest-macguffin` *categories*.
- **`plot-lock`** (`Engine/.../Quests & Problems/Plot Lock.md`) — the key/lock complement: what's sealed +
  where the key is kept.
- **Mythic rescaled to cosmic** (Adam's review): the old Mythic read as Strange; the top band now rewrites
  a law of the world — a fact unmade, the inside/outside boundary, the death-and-rebirth wheel itself.
- Recompiled → **337 tables, 0 real coverage bugs**.

### Added (rollers)
- **`rollItem(opts)`** + **`rollBuildingInterior(opts)`** in `src/engine/codex-roll.js` — codexAdd-ready
  payloads. Items are **pointers** (§8b): `source:{type:"plot",ref:"plot-item#<row>"}`, optional `lock`
  rolls the `plot-lock` companion. Building interiors mint a `location` record (layout+feature player-side,
  who's-inside DM-side). `dev/verify-codex-roll.mjs` extended → 38.

Verified: codex-roll 38 · codex 39 · session 16 · prep 34 · prep-bundle 47 · dm-events 21 · check-manifest OK (43 modules).
**Phases 1–5 complete. Next: Phase 6 (Codex UI panel) + re-playtest with the mechanical-vs-invented ratio test.**

---

## 2026-06-24 (session 10) — CODEX Phase 4 BUILT (the session frame)

The explicit Start/End Session frame — by the time the chat appears, the cast exists as records.

### Added
- **`startSession(id)`** in `src/world/play.js` — the front door: enter the world → `beginSession`
  (casts the codex via `startPrep`) → `wakeIntoWorld` prep/loading cinematic → the DM opens the scene
  once the cast is hard data. Idempotent on a live session (`w.sessionLive` guard — won't double-cast).
- **`endSession()`** — clears `w.sessionLive`, writes a closing ledger/log beat, recycles unvisited soft
  prep (`prepRecycleStale`), returns to the world-select shelf. The soft codex cast survives as the
  reusable pool (§8b).
- **UI** — a **▶ Start session** button on every world card (`renderShelf`) and a session-aware Start/End
  control in the in-world actions (`worldActions`); a gold **"session live"** badge on the active card.
  `.wc-start` style.
- **`dev/verify-session.mjs`** (16) — start increments + casts + idempotent; end clears + recycles +
  returns to shelf + soft cast survives; a fresh start after end begins session 2.

### Changed
- The buried in-world "§ New session" button is replaced by the session-aware ▶ Start / ■ End control;
  time transitions split into their own labeled group.

Verified: session 16 · prep 34 · prep-bundle 47 · codex-roll 27 · codex 39 · dm-events 21 · check-manifest OK (43 modules).
**Browser render sandbox-blocked here — eyeball the shelf button + cinematic at playtest.** **Next:
re-playtest + the mechanical-vs-invented ratio test → Phase 5 (missing table-sets) → Phase 6 (Codex UI).**

---

## 2026-06-24 (session 9) — CODEX Phase 3 BUILT (prep casts the codex)

The casting pass — the structural fix for the Saltrest "DM invented the whole cast" failure.

### Added
- **`pbundleCast`** in `src/engine/prep-bundle.js` — for each frontier, the engine rolls a soft cast:
  1 named **location** (`rollPlace`) + **1–2 NPCs** (`rollNPC`, the first biased `roleHint:"questgiver"`),
  as codexAdd-ready payloads carried on `environment.cast` in the bundle. No-op (cast:null) if the codex
  rollers / compiled tables aren't loaded.
- **`prepCastFrontier`** in `src/world/prep.js` — `startPrep` mints the cast into `w.codex` as
  `provenance:"prep", soft:true`, binds the location to the frontier node (`node.codexId`), and places the
  NPCs at it (`status.at`). `ensureCodex` runs first (migrates factions/gazetteer). The prep-staged ledger
  line now reports the cast count.

### Changed
- **`lockOnContact`** — entering a rumored frontier now also locks its cast **location** soft→hard
  (touch=canon, §8b) and reveals it; the frontier's NPCs stay a reusable soft pool until actually met.
- **`prepBundleSummary`** — carries a compact cast (location name + NPC names/roles/species) so the
  Stage-1 synthesis-harvest sees the cast to **connect**; the full bundle carries the full payloads.

Verified: prep-bundle 47 · prep 34 · codex-roll 27 · codex 39 · dm-events 21 · check-manifest OK (43 modules).
**Next: Phase 4 — Start/End Session buttons (world-select → prep casts the codex → cinematic → chat),
then re-playtest + the mechanical-vs-invented ratio test.**

---

## 2026-06-24 (session 8) — CODEX Phase 2 BUILT (the rollers — the engine mints the atoms)

### Added
- **`src/engine/codex-roll.js`** (`engine.codex-roll`) — `rollNPC(opts)` + `rollPlace(opts)`. The engine
  mints the **atoms**: each chains the already-compiled `npc-*` / `place-*` tables (via `rollTable`) into a
  **`codexAdd`-ready payload** — `rolled` (raw dice verbatim), a player-safe `fields` glance-read
  (species/role/demeanor; place desc/trait/calamity), and DM-only `dm` levers (secret/fear/bond/want;
  place hidden truth + history). `rollNPC` also maps the rolled race → a `CHAR_NAMES` species pool for a
  provisional name (the DM name-confirms); `rollPlace` splits the setting cell's `"Name: desc"`. The
  rollers **don't write the world** — prep / the DM emit `codex_add` events; the AI assigns final meaning +
  wires links. `opts.roleHint` is recorded for the AI; `opts.depth` rolls place-history. `rollItem` waits
  on the Phase-5 plot-item tables.
- **`dev/verify-codex-roll.mjs`** (27 checks — payload shape, DM-secret never leaking into player `fields`,
  the race→species mapper, the name/desc split, and the payloads flowing through `codexAdd` + `codex_add`).

Verified: codex-roll 27/27 · codex (Phase 1) 39/39 · dm-events 21/21 · check-manifest OK (43 modules).
**Next: Phase 3 — prep casts the codex (extend `assemblePrepBundle`; synthesis connects a dice-dealt cast).**

---

## 2026-06-24 (session 7b) — CODEX Phase 1 BUILT (the relational entity store)

Adam approved the spec + refinements (large cast + recontextualization engine, codex-as-store with a
sanitized player projection, touch-locks-to-canon, core link vocab, item pointers). Phase 1 built.

### Added
- **`src/world/codex.js`** (`world.codex`) — the relational entity store. Records `{id, kind, name, rolled
  (verbatim), fields (player-safe), dm (DM-only), links[] (typed wikilinks), status{known,soft,at,
  condition}, source, provenance}`. CRUD, typed links with both-way query (`codexLink`/`codexLinksOf`), the
  **two-tier lifecycle** (`codexReveal`→known; `codexContact`→soft-locks to canon; `codexRecontextualize`
  preserves the rolled soul + reassigns context and **refuses on hard/contacted records**), the soft pool,
  the all-seeing `codexDigest` vs the knowledge-gated **sanitized** `codexPlayerView`, the core link
  vocabulary, and `ensureCodex` migration (gazetteer/factions → records, idempotent, non-destructive).
- **`codex_*` events** in `applyEvent` (`codex_add`/`codex_link`/`codex_update`/`codex_reveal`/
  `codex_contact`). **Digest** now serves the all-seeing `codex` slice.
- **`dev/verify-codex.mjs`** (39 checks).

Verified: codex 39/39 · dm-events 21/21 · wake-prep 47/47 · prep 22/22 · prep-bundle 32/32 ·
check-manifest OK (42 modules). **Next: Phase 2 (`rollNPC`/`rollPlace`) → Phase 3 (prep casts the codex).**

---

## 2026-06-24 (session 7) — Streaming scroll fix + CODEX spec (relational entity layer)

### Fixed
- **Streaming viewport: sticky-bottom, not locked-bottom.** The word-by-word reveal was force-following the
  cursor every token (rigid yank to bottom). Now it only follows if the reader is already at the bottom;
  streaming starts at the new block's top and fills downward at reading pace. `src/world/render.js`.

### Added (spec — no code)
- **`docs/CODEX.md`** — the relational entity layer (NPCs / Locations / Items / Factions as wikilinked
  records in `w.codex`; engine rolls the atoms via `rollNPC`/`rollPlace`, AI assigns meaning + links; prep
  casts the codex; Start/End-Session frame; the missing building-interior + plot-item table gaps). Born from
  the Saltrest playtest, where the DM invented the whole cast because Session-Prep rolls the stage, not the
  players, and there's no entity store. Decision rows in `DESIGN.md` (2026-06-24); `NEXT-STEPS.md` "Do next"
  updated; `README.md` index updated. **Status: spec draft, build pending — Phase 1 (data model) is the
  load-bearing call.**

---

## 2026-06-24 (session 6b) — Skills panel with live modifiers + consumable-resource tracking (slots/HP/pools)

Two features that landed together in the working tree (the resource system via the spawned task), verified
as a union. Branch `feat/skills-and-resources`.

### Added
- **Skill modifiers on the Character panel.** Full 18-skill list, each with its actual roll modifier
  (ability mod + prof if proficient), sorted best-first, ● = proficient — so the player can pick the right
  skill at a glance. New `SKILL_ABILITY` map (`data/srd-creator.js`); render in `renderCharacterPanel`.
- **Consumable-resource tracking (engine-owned).** New `src/engine/resources.js` (`engine.resources`):
  `deriveResources`/`ensureResources` (maxes from `CLASS_PROGRESSION`/`srd-creator`), `spendSlot`,
  `spendResource`, `applyHpDelta` (clamped), `RESOURCE_POOLS`. Sheet now carries current HP (`hpCur`),
  spell slots (`slots`/`slotsMax`, incl. pact), and class pools. A **resource tracker** renders in the
  Character panel (HP, slot pips per level, pools). Smoke-verified: Bard L1 → 2 L1 slots, spend decrements,
  HP clamps at 0.

### Note
- The engine can't know about slots spent **before** it existed — an in-progress save lazy-inits current=max
  on first load, so a mid-session character's counter resets to full once. Authoritative from then on.
- Restore-on-rest wiring + a dedicated resource verify harness are follow-ups (see `feat/resource-tracking` task scope).

Verified: wake-prep 47/47 · dm-events 21/21 · prep 22/22 · check-manifest OK (41 modules) · resource API smoke-test green.

---

## 2026-06-24 (session 6) — Chat: compact scene-head + word-by-word DM streaming + read-from-top scroll + bold + hide topbar

Playtest UX polish on the live chat surface. Branches `feat/chat-stream-compact-header` then `feat/chat-bold-hide-topbar`.

### Added
- **`**bold**` renders in DM narration** (`mdBold`, bold-only, applied over escHtml'd text). Works in the
  static feed and during streaming (re-renders each tick so bold resolves when its closing `**` arrives;
  an unclosed `**` stays literal until closed). XSS-safe — escapes first, then converts.

### Changed
- **Top breadcrumb bar hidden** (`.topbar{display:none}`, `body` padding-top 0) — Adam: useless, reclaim
  the space. `.wrap.ingame` height back to full `100vh`.

Playtest UX polish on the live chat surface. Branch `feat/chat-stream-compact-header`.

### Changed
- **Compact scene-head.** The location header ("Canal-Knot") + its container were eating vertical space —
  trimmed padding/margins and dropped the title 20→15px, clock 16→13px (roughly halved its height).
- **DM replies stream in word-by-word** (LLM-chat style). `applyResponse` sets `GS.dm.animate`; the freshest
  DM line renders as an empty `#dmStream` span carrying the text in `data-full`; `streamDMText()` types it in
  (~24ms/token) with a blinking caret.
- **Scroll lands at the TOP of a new narration, not the bottom.** Streaming scrolls the new message's top
  into view and only follows the cursor when the text runs past the fold — so long narration reads
  top→bottom instead of snapping to the end (the over-correction from session 5). Non-streaming renders
  (your own messages, reloads) still jump to the latest line.

Verified: wake-prep/stream 43/43 · dm-events 21/21 · check-manifest OK.

---

## 2026-06-23 (session 5) — Knowledge-gated panels + panel toggle + viewport-fit layout + font boost + roll-request persistence

### Fixed (roll-request persistence)
- **Roll buttons survived no longer vanish on reload.** The DM's pending `rollRequest` / `ask` lived only
  in transient `GS.dm`, so reloading mid-handshake wiped the roll button (the narration persisted, the
  button didn't). Now `applyResponse` persists them to `w.dm`; `renderWorld` rehydrates `GS.dm` from it on
  load; `sendTurn` clears it when a new turn supersedes. (Playtest-found: Insight button gone after a reload.)

### Fixed (chat ergonomics + reload resilience)
- **Enter sends** the action (Shift+Enter = newline); was Cmd/Ctrl+Enter.
- **Submitting no longer jumps the chat to the top.** The viewport-fit pass had made `.chat-col` the
  scroll container while the scroll-to-bottom still targeted `.dm-feed`; now the **feed** scrolls (head +
  input pinned) and the scroll-to-bottom lands correctly.
- **Reload resumes an in-flight turn.** `sendTurn` persists `w.dm.pendingTurnId`; on load `renderWorld`
  re-attaches `pollResponse`, so a reload mid-wait still receives the DM's reply (cleared on answer / on
  no-answer-timeout). (Playtest-found: reload → permanently stuck on "DM is considering".)
- **Process note:** never run `dev/verify-bridge.py` during a live session — it shares + `/reset`s the
  `.dm/` mailbox and deletes pending turns (memory: project-genesis-bridge-playtest-gotcha).


### Changed (font boost)
- **Type scaled ~30% game-wide** — scripted ×1.3 bump of all 168 `font-size:Npx` declarations across
  `genesis.html` + the render/creator/oracle modules (base body 16.5→21px). Font-size only; spacing,
  icons, and unitless line-heights unchanged. (Chose a scripted px bump over `zoom`, which would have
  fought the viewport-fit's `100vh` math.)


Playtest UX pass from live feedback. Branch `feat/known-gating-and-viewport-fit`.

### Added
- **Knowledge gating (DM-CHARTER slow drip).** The player's **Powers & Pressures** and **Gazetteer**
  panels now show only what the CHARACTER knows. `initKnown(w)` (render.js) idempotently seeds a `known`
  flag per faction / pressure / gazetteer entry — a fresh PC wakes knowing only where they stand and the
  faction they're tied to; everything else is hidden until learned. `explore()` flips discovered entries
  known; the `discovery` event gained `payload.reveal:{factions,pressures}` so the DM surfaces powers as
  the drip reveals them. The DM digest is unchanged — the DM always sees all.

### Changed
- **Panel toggle.** `openPanel(name)` now toggles — clicking an already-open rail item collapses it back
  to the Story view.
- **Viewport-fit layout.** The in-game view (`.wrap.ingame`) is capped at `100vh - topbar`; the chat and
  side panels scroll **internally** — no full-page scroll. (CSS-only; logic-verified headless, pixel-eyeball
  pending at playtest.)

Verified: wake-prep+gating 32/32 · dm-events 21/21 · prep 22/22 · prep-bundle 32/32 · bridge 29/29 · `check-manifest` OK.

---

## 2026-06-23 (session 4) — Waking cinematic: prep/loading screen → DM narration (kill the entry data-dump)

First live playtest over the Bridge surfaced the opening UX as the weak point: waking dropped the
player onto a raw entry-bundle **data dump** (Looming/Enemies/Friends/Complications/Things/Places)
plus a "DM is considering…" spinner, and Session-Prep never fired on a fresh world (it was wired only
to the manual "§ New session" button). Branch `feat/wake-prep-cinematic`.

### Added
- **Prep/loading cinematic** — a full-screen `#wakePrep` overlay (parchment, world-name title, pulsing
  mark + dots; `genesis.html`). `wakeIntoWorld` now raises it over the freshly-rendered world and lifts
  it (`wakeReveal`, cross-fading the chat in) **only when the DM's first words actually arrive** — not on
  a fixed 850ms timer. `GS.wakePrep` gates it; `src/world/play.js` owns `wakeShowPrep`/`wakeReveal`.
- **Auto-prep on first waking** — `wakeIntoWorld` calls `startPrep(w)` (idempotent) so a brand-new
  world's soft frontiers stage automatically; prep no longer depends on remembering the manual button.
- **`dev/verify-wake-prep.mjs`** (16 checks) — globals, overlay toggle gated on `GS.wakePrep`, auto-prep
  staging, and that `renderWorld` no longer emits the data dump.

### Changed
- **The player's opening is the DM's narration, not the data dump.** `renderWorld` no longer renders
  `renderOpening` (the entry bundle still lives in state → feeds `dmDigest`, so the DM weaves it into prose).
  `renderOpening` retained as a no-bridge reference card.
- `applyResponse` / `dmNoAnswer` / `dmBridgeDown` (`src/world/dm.js`) each call `wakeReveal()` so the
  loading screen never strands the player (success, no-DM-after-timeout, or bridge-down all lift it).

### Fixed
- **`dev/verify-dm-events.mjs` was silently broken** — its harness restubbed `STAGES`/`WORLDBEATS`/
  `GUIDE`/`LIFE_STEP`, which became real module consts (`data/creation-flow.js`), throwing a redeclare
  SyntaxError on load. Removed the stub; back to 21/21.

Verified: wake-prep 16/16 · dm-events 21/21 · prep 22/22 · bridge 29/29 · `check-manifest` OK.

---

## 2026-06-23 (session 3) — Session-Prep system, end-to-end (rollers → synthesis → prep state) + crit lens oracle + table audit

**The big one: the AI-DM Session-Prep system is built end-to-end and the game is playtestable over the
Bridge.** Also: the Critical-Magnitude lens oracle, and a full table-usage audit. ~10 `--no-ff` merges.

### Added
- **Crit-Magnitude lens oracle** — two d12 tables `Mythic Success Lenses` / `Mythic Failure Lenses`
  (`Session Mechanics/Consequences/`), each row a *vector* (kind of permanent change), AI fills content
  → fires on *any* d20 action. The magnitude die now also sets a **count** (how many lenses cascade):
  20/11–14:1 · 15–19:2–3 · 20:cascade; failure inverted. Resolves the CRIT-MAGNITUDE §4 "missing middle"
  without reworking the Myth suite. `docs/CRIT-MAGNITUDE.md` §1.1 + curve.
- **Table-usage audit** — `docs/TABLE-USAGE-AUDIT.md` (clickable catalog: every table → source → trigger)
  + `build/gen-table-usage-audit.py` (regenerable). Surfaced **89 of 248 source files Oracle-only** —
  whole unwired systems (Urban Segment walk, NPC depth, Place-Gen d100s, Quest suite) = the Session-Prep
  payload.
- **Session-Prep system** (`docs/SESSION-PREP.md`, `docs/SYNTHESIS-CONTRACT.md`) — the AI DM preps like a
  human DM; *"the story is in the dice"* (over-roll → synthesis pass). Generalizes DM-CHARTER §8.4
  (soft-until-contact) to a recurring heartbeat.
  - **Walk-rollers** (`src/engine/`): `rollUrbanWalk` (`walk.js`, ported from Obsidian Urban Procedure
    v3.1 — 16 topologies), `rollDungeonWalk` (`dungeon-walk.js`, from Dungeon Procedure v4.2 — 12
    topologies, depth-budgeted loot, Myth-Seed-affinity boss/revelation), `rollWildernessWalk`
    (`wild-walk.js`, authored fresh — linear leg journey). Each → a walk data structure (segments=nodes,
    transitions=edges). Consumes the orphaned segment/dungeon/wilderness families.
  - **Synthesis contract** — deterministic half: `quest-hook.js` (`rollQuestHook`) + `prep-bundle.js`
    (`assemblePrepBundle` fires the 3 rollers + binds a hook per env + extracts ledger context;
    `prepBundleSummary`). LLM half: two staged prompts `Engine/00. _System/AI Prompts/synthesis-{harvest,
    reskin}.md` — Stage 1 harvests the throughline latent in the pile; Stage 2 emits a roll-keyed overlay
    (role/reskin/ties/reveal-plan). Multi-environment · staged · overlay+briefing.
  - **Prep state** (`src/world/prep.js`): `startPrep` binds each prepped environment to a **soft "rumored
    frontier"** map node (soft edge = the quest hook); `applyPrep` enriches frontiers from the synthesis
    overlays + writes soft new-canon; `lockOnContact` flips soft→hard on entry (Charter §8.4); recycle +
    prep-debt. `beginSession()` fires prep every session; `⎘ Prep handoff` button; `renderHexMap` draws
    soft frontiers dashed.
- **Headless tests**: `dev/verify-walk.mjs` (2667 assertions, all 28 topologies + wilderness),
  `dev/verify-prep-bundle.mjs` (32), `dev/verify-prep.mjs` (22).

### Changed
- **Compiler — `compile-tables.py` now emits `row[5]` = structured per-row cells** (the die col dropped),
  so multi-column prep tables (segment Type|Desc|Transition; encounter Name|Roster|Tactic; NPC/Quest)
  keep their columns. The compiled `tables.json` was previously LOSSY (merged columns into one string).
  Additive — `row[0..4]` unchanged; `rollTable().cells` added. Recompiled (334 tables).
- **EVENT-CONTRACT** (`applyEvent`) gains `prep_applied` (apply synthesis overlays) and `prep_contact`
  (lock a frontier on entry).
- **DESIGN.md / NEXT-STEPS.md** decision rows + build status for crit-lens, Session-Prep, synthesis.

### Fixed
- **Frontier node id collision** — soft frontiers were keyed by slug-of-name, so two sessions rolling
  the same evocative label collided on one node id (resurrecting recycled rumors). Now unique per-session
  ids (`frontier-s{session}-{idx}`). Caught by `verify-prep.mjs`.

### Deferred
- The **LLM synthesis itself** runs over the DM Bridge at play time (qualitative). Known tune item:
  is Stage-1 harvest good enough on summaries alone?
- **Browser render of soft frontiers** unverified this session (preview server sandbox-blocked) — confirm
  visually at playtest.
- (#6) fuller **orchestrator** (plausibility-from-frontier; NPC/Place depth rollers); soft-canon ledger
  *persistence* of overlays is wired but lock/recycle get their real exercise in play.
- **Improvement candidates** flagged: the `quest-*` + NPC-hook tables (v1).

---

## 2026-06-23 (session 2) — T2 Myth tables → d100 + Urban Pressure oracle + Crit-Magnitude spec

**Table-improvement pass T2 — completes the 3-tier pass** (T1 Place Gen, T3 NPC atoms already done).

### Added
- **`myth-costs` d12→d100** and **`myth-becomes-geography` d10→d100** — rebuilt from thin 10–12-row
  tables to full Commitment ladders (66/20/9/4/1, every row unique). What a legend demands/attracts/
  inflicts; how a myth scars the land. Originals → `Mythic Events/zz_Archive/`.
- **`urban-pressure`** — NEW d100 Commitment oracle (`Session Mechanics/Pressure/`): single-roll
  citywide ambient pressure for slow urban play, distinct from the `Urban Encounter v2.5` node
  generator. Fills the slot freed by the (session 1) `urban-encounters → tavern-encounters` rename,
  under a distinct `urban-pressure` id.
- **`docs/CRIT-MAGNITUDE.md`** — full spec of the Critical-Magnitude system (formalizes the
  `SPICE-CURVE` §3 one-liner from Adam's design call): nat 20 / nat 1 → a second d20 scaling
  Standard → Amplified → Mythic (= Local → Regional → Planar/Cosmic). 20/20 = permanent boon written
  to the Ledger as canon (the Light-of-Lathander shrine); 1/1 = mirror failure (dark + permanent at
  high stakes). Locks the **generic-engine vs situational-Myth-payload** seam.
- ~300 new table rows. All three tables content-only, **deliberately NOT wired** (rollable via the
  Oracle tab); wiring waits on the generic mythic-outcome oracle (CRIT-MAGNITUDE §4).

### Changed
- **`DESIGN.md`** — three decision rows under a new 2026-06-23 Crit-Magnitude section.
  **`DM-CHARTER.md`** §6 — new item 6 (critical magnitude, player-rolled second d20).
  **`SPICE-CURVE.md`** §3 — pointer to the new spec.
- Recompiled `tables.json` / `tables.js` → **332 tables**, 0 real bugs.

### Fixed
- Self-review near-dup: `myth-costs` "Demanded Repeat" (14) overlapped "Demanded Verdict" (64) on the
  "judge" example → reworded row 14.

### Deferred
- The **generic context-tagged mythic-outcome oracle** (combat / social / exploration / place-deed) —
  the missing middle that routes a 20/20 or 1/1 to the Myth suite. Specced in CRIT-MAGNITUDE §4; the
  next clean-session task.
- Two band-placement judgment calls from review left as Strange (`myth-costs` 95 "Slowing Subject",
  `myth-becomes-geography` 89 "Returning Path").
- Wiring all three new tables into live play.

---

## 2026-06-23 — NPC atoms → d300 + tavern rename + Place Gen fixes

### Added
- **Four d300 NPC tables** (Commitment, spice 198/60/27/12/3), replacing the DMG/2e `NPC Hook Megatable`:
  `npc-immediate-motivation`, `npc-bonds`, `npc-flaws-secrets`, `npc-job-board` — the highest-churn
  (per-NPC) hot path in the engine, now its deepest. Built via Workflow `npc-atoms-flesh-out` (36 agents:
  overgenerate by band + disjoint thematic lane → dedup/trim to exact counts in code; generators on
  Sonnet/low). 1,200 new rows.

### Changed
- **`urban-encounters` → `tavern-encounters`** — the d12+d8 table was always a tavern/interior table,
  not the citywide tool (that's `Urban Encounter v2.5`). The freed `urban-encounters` id is reserved for
  a future citywide random-pressure oracle.
- **`npc-bond` → `pc-bond`, `npc-flaws` → `pc-flaws`** — these were first-person *player* tables mislabeled
  with an `npc-` prefix; renamed (domain `Character Genesis / PC Traits`) and ids de-collided from the new
  `npc-bonds`.
- **Place Traits row 20** rebuilt to a distinct lighthouse/salvage trait (was a near-dupe of row 67).
- **Place-Secret rows 1–20** concretized from abstract category stubs to specific situations (match rows 21+).
- Recompiled `tables.json` / `tables.js` → **331 tables**; `check-manifest` OK.

### Fixed
- **Quick NPC Generator 2.0** had been feeding NPCs the first-person *player* flaw table (latent bug) →
  repointed to `npc-flaws-secrets` + `npc-bonds`. `NPC Honesty` prose cross-links repointed too.

### Deferred
- T2 Myth content (`Myth Costs`, `Myth Becomes Geography`); the new citywide urban-pressure table;
  wiring `npc-immediate-motivation` / `npc-job-board` into encounter-time flow.

### Retired
- `NPC Hook Megatable`, `NPC Secret` → `zz_Archive/` (superseded).

---

## 2026-06-22 — Place Gen table pass + Hometown bardo wiring

### Place Generation — full d100/d200 rebuild (9 tables, via workflow)

All Place Generation tables rebuilt from range-batched or thin rows to full spice-graded d100s
(one row per number, Spice Curve dist 66/20/9/4/1), with one table expanded to d200. Workflow
pattern established: parallel agents per table + validation agent.

- **Master Setting, Place History, Place Mythology, Place Nearby, Place Race Relations,
  Place Relevancy, Place Ruler Status** — all now full d100 Commitment tables. Pre-spice
  originals archived to `Engine/…/Place Generation/zz_Archive/`.
- **Place Traits** — expanded from d20 (2-col, no Band) to d100 (4-col `| d100 | Band | Trait | Calamity |`).
  Calamity grows directly from its Trait (cause-and-effect). `table_class: Fork → Commitment`.
- **Place-Secret** — expanded from d20 to **d200** (first d200 table; `amax=200` in frontmatter,
  auto-derived by compile script). ~32% monster tie-ins (dragons, aboleths, fae, vampires, liches,
  hags, mind flayers, beholders, etc.). 4-col format `| d200 | Band | Hidden Mistake | Description |`.
- **Place Ruler Status row 93** (Strange): a dragon took the seat on a legal technicality three
  centuries ago; governance has been fair, the taxes are reasonable, and the Weavers' Guild petition
  from 287 years ago is still under review.
- `tables.json` / `tables.js` recompiled — 332 clean tables, 0 real bugs. d200 auto-derived.

### Hometown Bardo Wiring — 3 new beats in the creator flow

Three Track-B table rolls (place-master-setting → place-history → place-mythology) added after
Life and before the 9 world-genesis beats. Branch `feat/hometown-bardo`.

- **`data/creation-flow.js`** — 3 new GUIDE entries (`ht_setting`, `ht_history`, `ht_myth`).
- **`src/creator/bardo.js`** — `buildBardoSeq()` + `bardoSpine()` extended; 3 new functions
  (`bardoRollHometown`, `bardoHometownReroll`, `htMarkdown`); `bardoLog()` surfaces Hometown /
  Founded / Town Myth rows; `renderBardo()` now handles `{t:"hometown"}` with die + fragment +
  reroll (costs one shared reroll charge).
- **`src/world/play.js`** — `bindWorld()` seeds `world.seed.hometown` and writes a canon Ledger
  entry stripping markdown bold for storage.
- **`manifest.json`** — new owns + `rollTable` as call-time dep registered; `check-manifest OK`.

### Deferred
- Adam to **review all Place Gen tables** next session before compiling NPC/T2/T3 tables.
- T2 tables (Urban Encounters, Myth Costs, Myth Becomes Geography) — after the review pass.
- NPC atom tables (Demeanor, Mood, Under Pressure, etc.) — T3 pass pending.

---

## 2026-06-22 — The DM Charter (v1) — the flagship DM's operating contract

The DM-side behavior rules were scattered (Fragment veil, three-options, over-reveal discipline,
threat-signaling, agency). Consolidated into one constitution, authored from Adam's design
questionnaire this session. Branch `feat/dm-charter`. **Spec only — no app code touched.**

### Added
- **`docs/DM-CHARTER.md`** — the DM behavior spec behind the system prompt (Bridge + shipped DM).
  12 sections: the narrator (the **single voice across all lives** — bardo guide = waking DM),
  voice & prose, agency & handoff, **the slow drip**, danger/death/fairness, dice & mechanics
  surfacing, NPCs & the world's will, secrets/canon/pre-generated depth, tone & content, pacing
  & session management, integration, and open/flagged items.
- **3 draft tables (flagged for the table-improvement pass, NOT yet compiled):**
  - `Engine/…/Sentient NPCs/NPC Honesty.md` — a **2d10 bell-curve** disposition, *cannot-lie ↔
    cannot-tell-truth*, role-shifted; gated by motive (Secret/Fear/Leverage) × trust.
  - `Engine/…/Sentient NPCs/NPC Trust Lever.md` — d20, *what wins this NPC's trust* (the way in).
  - `Engine/…/Starting State/Starting State - World Depth.md` — deep secrets + over-the-horizon
    threats, pre-rolled at founding, **soft until contact → locked to canon on contact** (the
    foreshadowing fuel).

### Changed
- **`DESIGN.md`** — new dated section *Locked decisions (2026-06-22 — the DM Charter)*: 10 decision
  rows (single narrator voice, persona, prose, the slow drip, danger, dice surfacing, NPCs, secrets
  & canon, tone & content, pacing). The **single-voice** lock supersedes `NEW-GAME-FLOW`'s
  bardo/waking split at the level of *voice* (script still owns the bardo machinery).
- **`NEXT-STEPS.md`** — DM Charter track flipped ☐→☑ v1 specced; build follow-ups enumerated.

### Deferred
- **Recon, not rebuilt:** Secret/Fear/Leverage already exist (`_NPC Generation Raw` + template);
  the **hidden-`analog`** fiction-modeling pattern already exists in `_NPC Quick All-Stars` (100
  NPCs tagged Han Solo / Miranda Priestly / John Wick…). Formalize the field, don't reinvent it.
- **Not wired (specced in §12):** In-Media-Res escalation system (model: the *Low Tide* d20);
  pre-gen World Depth at founding; honesty/trust/`analog` onto the NPC generator + DM digest;
  a testable persona prompt over the Bridge; tutorial DM.
- Tables deliberately **uncompiled** — they're v1 drafts; recompile `tables.json` with the
  improvement pass, not before (avoids pulling half-baked rows into the artifact).

---

## 2026-06-22 — UI polish: gold corner filigree (the reskin's "approximated corners" gap)

- Extracted a real corner filigree from the decor sheets → `assets/borders/corner-{tl,tr,bl,br}.png`
  (4 oriented from one isolated piece). A reusable `.filigree` CSS class draws all four via a
  click-through `::after`; applied to the **bardo passage modal** now (bounded, clearly-framed surface).
  Graceful: a missing image just shows nothing.
- **Hex tiles prepped, not wired:** the `hex-tile-art` sheet (20 terrain hexes) was sliced + biome-mapped
  to `…/assets-iso/extracted/hexes/` (git-ignored). Deliberately **not** swapped into `renderHexMap` —
  photo tiles fight the deliberate *fraying-edge* aesthetic at the 460px minimap size; they belong in a
  future larger/zoomed map view. (Verify-blind constraint: preview sandbox couldn't run, so visual
  surfaces need an eyeball on refresh.)

---

## 2026-06-21 — Death & Rebirth, build step 6: the connected plane (loop complete)

The final step. All worlds are now **regions of one shared plane**, and a successor wakes far from
where the last soul fell. With this, the whole Death & Rebirth loop (steps 1–7) is built.

### Added (in `src/world/state.js`)
- **`regionRingPos`/`placeRegion`/`regionDistance`/`farthestRegion`** — each world carries a coarse
  `region {q,r}` coordinate spiralling outward from the plane centre; `bindWorld` places each new
  region; distance reuses `hexDist`.
- **`spawnSuccessorOnPlane`** (`fate.js`) — on death the successor wakes in the region **most distant**
  from where they fell (or stays if the plane has only one region so far). `closeBardo` now routes here.
- Shelf reframed as **"Regions of the plane"** with per-card distance hints (`render.js`).

### Changed
- **Migration is ADDITIVE** (supersedes the spec's "bank-and-restart"): `migrateAll` tags any
  region-less world with a position and sets a `U.plane={version:3}` marker — **nothing is reset,
  merged, or banked**; the `v2` storage key is kept. Chosen during build as the safe path that
  preserves all existing saves (`DESIGN.md` row updated).
- **`dev/verify-plane.mjs`** (14) — spiral distinctness, distance, farthest-region, additive
  migration, placement, successor-to-distant-region, single-region fallback. `check-manifest` clean
  (33 modules, 6 known warnings).

### Notes (emergent, intended)
- The bardo gap advances the death region's clock by up to 49 days, so **short-decay corpses
  (den/travelled) are usually gone** by the time anyone can return — only sealed/wild bodies keep
  their loot through the bardo. Thematic; kept.
- **Death & Rebirth steps 1–7 are all done — the loop is complete.** Remaining are polish: a region-map
  SVG + coarse region-to-region travel, authored vision/affinity tables, and wiring the icon assets.

---

## 2026-06-21 — Death & Rebirth, build step 5: corpse & loot decay

A fallen character's body and effects now linger in the world — and rot, or get carried off, on a
clock. Reach the body in time and the loot is yours.

### Added (in `src/world/rebirth.js`, now layer 2)
- **`killCharacter`** mints **`c.corpse`** — the carried items + gold and a rolled environmental
  **`context`** (`CORPSE_CONTEXTS`: sealed 120d / wild 30d / travelled 7d / den 2d) — and writes it
  to canon at the fall site.
- **`corpseStatus(w,c)`** decays **fresh → disturbed → gone** by elapsed *in-world* days (off
  `c.fellWhen`) vs the context's window; **`corpsesAt(w,node)`** surfaces still-recoverable bodies;
  **`claimCorpse(w,c,taker)`** transfers the haul to a living PC and marks it looted.
- **`recoverFallen`** (`fate.js`) + a **"⚰ Recover … effects"** button on the character panel,
  shown only when a living PC stands where a recoverable body lies.

### Changed
- `world.rebirth` reclassified **layer 4 → 2** (it only depends on L1/L2), so `render` can query
  `corpsesAt` with no layer inversion. `dev/verify-saga.mjs` → 45 assertions (corpse decay/claim);
  `dev/verify-rebirth-flow.mjs` → 19 (corpse at death + recovery through the real graph).
  `check-manifest` clean (33 modules, only the 6 pre-existing warnings).

### Notes
- Draft `CORPSE_CONTEXTS` (rolled); could later read the place / nearby pressures instead.
- **Death & Rebirth steps 1–5 + 7 are done — the loop is fully playable within the per-world model.**
  Only step 6 (connected plane / Universe v3) remains, for cross-region successor spawning.

---

## 2026-06-21 — Death & Rebirth, build step 4: faction proximity at creation

A character is now born near a local power — and a successor can be born inside a rival of the dead
PC's allies.

### Added
- **`rollFactionProximity(w,c)` + `factionKind(f)`** (`src/engine/world-gen.js`, called from `rollEntry`):
  rolls the relationship (**tie 55% > member 25% > none 20%**) and, if any, picks WHICH faction
  **weighted by the class's archetype** (`CLASS_FACTION_AFFINITY` × the faction's `factionKind`, read
  from its Method) — any class can still land near any power. Records `c.entry.proximity`, adds the
  faction to the opening bundle as a Friend, and writes a `canon`/`proximity` ledger entry.
- **`METHOD_KIND` + `CLASS_FACTION_AFFINITY`** data (`data/srd-creator.js`) — draft affinity vocabulary.
- **`dev/verify-proximity.mjs`** — 12 assertions: kind classification, class-weighted choice
  (Cleric → divine >50%), the tie>member>none distribution, and `rollEntry` integration + ledger.

### Changed
- Registered the new symbols (manifest owns/callTimeDeps). `check-manifest` clean (33 modules).

---

## 2026-06-21 — Death & Rebirth, build step 7: the bardo passage (death loop now playable)

The engine pieces (steps 1–3) are now wired into an actual death. Killing a character runs the whole
bardo and shows it; the loop plays end-to-end.

### Changed
- **`src/world/fate.js` REWORKED** — the d20 "spawn back into the same adventure" is **retired**.
  - `killCharacter` stamps **`c.fellWhen`** (the in-world clock, not `Date.now()`) and writes the
    fall to the ledger as `canon`/`death`.
  - `openBardo` runs **`runBardo`** (gap drift + 14 visions), then `renderBardoPassage` reveals the
    days passed + the 7 peaceful / 7 wrathful vision **Fragments** (player sees fragments only).
  - `closeBardo` rolls a **brand-new successor** (no inherited quests).
- **`genesis.html`** — repurposed `#fateModal` → `#bardoModal` (a scrollable passage), added bardo/
  vision CSS, removed the now-dead `FATE_THRESHOLD` const.

### Added
- **`dev/verify-rebirth-flow.mjs`** — 14 assertions, full-app jsdom: reworked fns present + legacy
  spawn-back gone, in-world `fellWhen`, death canon, visions dreamt, clock advanced, passage rendered,
  close → successor.

### Notes
- `check-manifest` clean (33 modules). The successor still spawns **in the same world** until the
  connected plane (step 6) lands — the only remaining gap to the full cross-region loop.
- Remaining Death & Rebirth steps: **4** (faction proximity at creation), **5** (corpse/loot decay),
  **6** (Universe v3). Steps 1–3 + 7 done.

---

## 2026-06-21 — Death & Rebirth, build step 3: the 14 vision-rolls

The Chönyi Bardo. While the hero is between lives, the world dreams its direction around the seven
things that mattered to them — and the next soul wakes to faint Fragments of it.

### Added (in `src/world/rebirth.js`)
- **`bardoVisions(w,c)`** — 7 peaceful + 7 wrathful visions over the dead PC's Saga (padded to 7
  from the faction web / gazetteer if the life was short); peaceful days precede wrathful.
- **`rollVision`** — each vision ~50% comes to pass. A fired vision **mutates an existing structure**
  via **`applyVision`** (faction agenda clock ±1, NPC/enemy gazetteer `fate` = risen/fallen, place
  `fate` = prospered/ruined; threads recorded), writes the **DM-side truth** to the ledger as a
  `drift`/`bardo-vision` entry, and surfaces only a **6–10 word Fragment** to the player.
- **`runBardo(w,c)`** — the orchestrator: refreshSaga → bardoGap (time + drift) → bardoVisions,
  storing the result on `c.visions` for the successor's passage.
- **`VISION_OUTCOMES` / `VISION_QUIET`** — draft peaceful/wrathful flavor (per Adam's call: mechanical
  effects + draft flavor now, an authored spice-graded vision table later).

### Changed
- `dev/verify-saga.mjs` now 34 assertions (14-vision count, peaceful-before-wrathful ordering,
  fragment-vs-truth split, ledger writes, faction-clock ± mutation, place-ruin, unfired-no-op,
  runBardo orchestration). `check-manifest` clean (33 modules); full-app jsdom boot runs the whole
  bardo through the real `rollStartingState` (31-day gap, 14 visions, 9 fired, Saga 7).

### Notes
- Not yet surfaced in UI — `c.visions` holds the Fragments; build step 7 (`fate.js` rework) routes
  deaths into `runBardo` and renders the passage.

---

## 2026-06-21 — Death & Rebirth, build step 2: the bardo gap + drift

The time between lives. When a hero dies, the world now moves on before the next soul enters.

### Added
- **`src/world/rebirth.js`** — the new death-flow module (visions + corpse will grow here).
  `rollBardoGap()` rolls a **0–49 in-world-day** triangular bell (mode ~3–4 weeks, rare instant/full
  tails — Tibetan *Bardo Thodol*'s 7×7). `bardoGap(w,[days])` advances the world clock by the gap and
  **turns the faction web once per elapsed week** via the existing `ssFactionTurn`, writing a `bardo`
  transition to the ledger — so a successor wakes into a genuinely later, drifted world.
- `dev/verify-saga.mjs` extended (now 20 assertions) — gap range/mean, explicit-day application,
  clock advance, one-turn-per-week, the `bardo` ledger entry, and the 0-day instant exit.

### Changed
- Registered `world.rebirth` (manifest + `<script>` + `check-manifest.py` LAYER L4). `check-manifest`
  clean — **33 modules**; full-app jsdom boot runs `bardoGap` through the real `rollStartingState` /
  `ssFactionTurn` (day 3→17, 2 turns, ledger writes).

### Notes
- Not yet wired into the death UI — `bardoGap` is the mechanic; build step 7 (`fate.js` rework) routes
  actual deaths through it, and step 3 layers the 14 vision-rolls on top of the gap.

---

## 2026-06-21 — Death & Rebirth, build step 1: Saga tracking

First code for the death loop. A character's **Saga** — their most significant entities — is now
derived from world state, ready for the bardo vision-rolls (step 3) to act on.

### Added
- **`src/world/saga.js`** (`computeSaga`/`refreshSaga`/`sagaKey`/`SAGA_MAX`) — ranks a character's
  top-7 entities (enemies / NPCs / factions / places / threads) from the ledger + gazetteer + faction
  web by **stake × frequency × recency**. A PC's own life-NPCs and the faction they stand against out-
  rank world-generic entries; `fellWhere` joins as a high-stake place once dead. Pure read; deterministic.
- **`dev/verify-saga.mjs`** — 12 logic assertions (vm-loaded, no DOM): capping, enemy/thread/faction
  capture, personal-out-ranks-stranger, standing-faction in top 3, persistence, determinism.

### Changed
- `cgBind` seeds `c.saga` at birth; `beginSession` refreshes each living PC's Saga.
- Registered `world.saga` (manifest + `<script>` in load order + `check-manifest.py` LAYER L2).
  `check-manifest` clean — **32 modules**; full-app jsdom boot loads the new module in order and runs
  `refreshSaga` through the real graph.

---

## 2026-06-21 — Death & Rebirth design lock (spec only, no code)

A design session locking the **persistent-sandbox death loop**. No code changed — captured as a new
`system-spec` so the next session builds from a blueprint.

### Added
- **`docs/DEATH-AND-REBIRTH.md`** — the full spec: death-is-expected posture, the **49-day bardo gap**
  (0–49 in-world-day bell roll) that drifts the world via `ssFactionTurn`, the **14 peaceful/wrathful
  vision-rolls** against the dead PC's **Saga** (their 7 most significant ledger entities) surfaced to
  the player as Fragments, optional chosen-one reincarnation memory, **class-weighted faction proximity**
  at creation, **corpse/loot decay** by clock+context, DM-driven companion rescue, and the
  **connected plane (Universe v3)** successor model. Includes a 7-step build order.

### Changed
- **`DESIGN.md`** — new "Locked decisions (2026-06-21, session 2 — death & rebirth)" section (12 rows),
  incl. **XP threshold curve = SRD 5.2.1 exactly** (resolves the `ADVANCEMENT.md` open question — slow
  climb is intended given death-expected play).
- **`ADVANCEMENT.md`** — threshold-curve open question marked RESOLVED (SRD-exact).
- **`NEXT-STEPS.md`** — new Death & Rebirth track with build order; XP-curve step flipped from a design
  call to a mechanical "author the SRD table" task.
- **`docs/README.md`** — indexed the new spec.

### Notes / reconciliation flagged for the build
- `src/world/fate.js`'s d20≥11 "spawn back into the same adventure" is **superseded** — death will route
  through the bardo to full new creation; the modal/FX get repurposed. `fellAt` must become an in-world
  clock stamp (currently `Date.now()`).
- The existing faction generator (`Starting State - Factions.md` + `rollStartingState`/`ssFactionTurn`)
  is **sufficient** — no new faction generator needed; the gap is the class-weighted proximity roll at
  creation.

---

## 2026-06-21 — Ivalice UI reskin — parchment-on-stone, light & luxurious

Reskinned the whole interface to the **Final Fantasy Tactics: The Ivalice Chronicles** look from
Adam's ChatGPT concept sketches + texture atlas (`ui-sketches/ivalice-style/`). The app is now
**light**: warm parchment pages with real paper grain floating on a dark textured stone ground;
**Cinzel** (engraved gold display caps) + **EB Garamond** (sepia body); a fixed top breadcrumb bar
(compass gem · gold small-caps crumbs, current in steel-blue); gold double-borders, parchment pill
buttons, and a steel-blue accent for active/links/sigils. Built across all five concept surfaces +
the shelf, verified each in-browser.

### Added / Changed
- **Design tokens** remapped to a parchment/stone/gold/steel palette (legacy `--vellum*` aliased so
  existing panels flipped to cream automatically). Google Fonts (Cinzel + EB Garamond) with serif
  fallback. `#wakeFade` and contrast cleanup of leftover dark-theme hardcodes (e.g. selected cards).
- **Textures:** sliced Adam's atlas into `assets/textures/parchment.jpg` (panel grain), `stone.jpg`
  (ground), `compass.png` (motif); wired parchment under the cream gradient on every page and stone
  under the warm radial on the body.
- **Surfaces:** start screen (concept #1) · soul-forging card grid + "So far" inset (#2) · chat-first
  play view — icon rail, slate scene-pill, sigil-gutter chronicle, parchment choice pills, fused
  input (#3) · character panel — portrait, ability boxes, HP/AC badges, skills/inventory columns (#4)
  · world-genesis engraved omen die (#5) · universe shelf cards · top nav rail.
- `render.js` markup updated (scene pill, message sigils, character panel, start page); `chrome.js`
  breadcrumb wired to `showTab`.

### Notes
- Fonts load from Google Fonts (online); they degrade to system serif offline — bundle the woff2
  locally later for true offline. Corner *filigree* is approximated (clean gold double-borders) —
  real SVG flourishes are a future polish. check-manifest clean (31 modules); 21/21 render + 29/29
  bridge tests still pass.

---

## 2026-06-21 — Live playtest pass — creator UX + DM-bridge robustness

Fixes from Adam's first live DM-bridge playtest:
- **Creator:** spell/cantrip cards now show the **full** text in a viewport-clamped tooltip (truncated native tooltip retired; `gen-spells-slim.py` emits full `text`); skill/equipment/spell/choice blocks are a responsive **grid** of title+description cards; **"Begin" lands straight on the first choice** (removed the redundant threshold/soul gates); the running creation list moved to a right-hand **"So far"** column with the "This Is Your Life" rolls **itemized**; **inline dice in life events roll at roll-time and bank gold** into starting gp (`cgMakeEvent` / `cgResolveInlineDice`); the "Wanderer (roll again)" NPC sub-roll resolves.
- **DM bridge:** the app waits up to **5 min** for a live DM instead of hanging on "considering" (and posts a clear message if no DM is watching); the bridge **re-creates its mailbox dir before any write** (a deleted `.dm/` no longer 500s POSTs — the "unreachable" bug); the auto-opening turn is **`hidden`** so its meta-prompt doesn't show in chat; runbook says to run the DM on **Sonnet**.

---

## 2026-06-21 — Chat-first World view + the waking transition (NEW-GAME-FLOW §9, the substantive part)

Built the locked-but-unbuilt chat-first interface from `NEW-GAME-FLOW.md` §9 — the World view is no longer a long scroll of sections; it's the **DM conversation, centered**, with the world's panels in a **left icon rail** that **slide in beside the chat** (Disco Elysium-style). Plus the **waking cinematic**: the bardo fades to black and dissolves into the DM's opening words. From live character-creation playtest feedback (items 5 + 6). `check-manifest` clean (31 modules). Verified in-browser (Chrome): rail, column-slide, all panels, no console errors.

### Added / Changed
- **`src/world/render.js`** — `renderWorld` rewritten into the chat-first shell: a scene header (place + diegetic clock), the chat column (opening → DM feed → a collapsed "⚙ World & transitions" disclosure holding the explore/time controls), and a slide-in `.panel-col`. New helpers: `gameRail` (the 6 granular icons — **Story · Character · Map · Ledger · Gazetteer · Powers**, each gated by the Curve of Revelation, + Universe/Oracle), `worldActions`, `gamePanelContent`, `gazPanel`, `renderCharacterPanel` (the full sheet as a panel), `openPanel` (the rail router).
- **`src/world/play.js`** — `wakeIntoWorld()` (the §9 fade: black → land in Story → fade up) + `autoOpenScene()` (if the DM bridge is live, auto-fires the opening turn so the player wakes into the DM's words; silent no-op otherwise — the rolled opening stands in). `enterWorld` resets the open panel.
- **`src/creator/sheet.js`** — `cgBind` now finishes through `wakeIntoWorld()` instead of a bare render+toast. **`src/creator/bardo.js`** — `bardoFound` raises the fade before assembling world+soul (no flash).
- **`src/ui/chrome.js`** — `showTab('world')` toggles `.wrap.ingame` (hides the top-level nav rail; the in-world rail replaces it). **`src/state.js`** — `GS.gamePanel` + `GS.waking`.
- **CSS + `#wakeFade` overlay** in `genesis.html`; responsive (rail → top strip, panes stack under 760px).

### Notes
- The waking auto-opening uses the DM Bridge; with the bridge down it degrades gracefully to the rolled opening bundle.
- Old characters' stored headlines may still show raw dice (e.g. "(+2d6 gp)") — that's pre-fix data; new souls resolve it (see the creator-fixes entry).

---

## 2026-06-21 — DM Bridge v1 — the AI-DM integration harness (closes the play loop)

Built the dev integration harness from `DM-BRIDGE.md`: the app and an AI DM (Claude Code, subscription-backed → no metered tokens) now run together over a tiny local bridge, replacing the clipboard back-and-forth. The DM returns narration + **typed `EVENT-CONTRACT` events**; the app applies them through its **own existing mutators** (the script stays the sole state owner — anti-drift). All five build-order steps shipped. `check-manifest` clean (**31 modules**, only the 7 known layer-inversion warns).

### Added
- **`dev/dm-bridge.py`** — the bridge: a dumb mailbox + static server (stdlib only, replaces `python3 -m http.server`). Holds `.dm/turn-*.json` / `response-*.json` / `state.json`; routes `POST /turn`, `GET /response?turnId` (204 pending / 200 ready), `POST/GET /state`, `POST /reset`, plus `GET /dm/turns` (pending list for the loop) and `/dm/health`. **No game logic** — the mutators are never forked. Serves everything `Cache-Control: no-store` so a stale cached module never silently breaks the app mid-dev (the ~30 classic `<script>` files mean one stale `state.js`/`render.js` makes a tab look dead — this kills that trap without per-edit version strings).
- **`src/world/dm.js`** (`world.dm`, layer 4) — the bridge client (`dmDigest` = the structured JSON twin of `handToDM`; `sendTurn` / `pollResponse` / `applyResponse` / `postState`; `dmSend` / `dmRollFor` for the player actions + roll handshake) **and `applyEvent(w,e)`** — the EVENT-CONTRACT runtime: a `switch` on every event type dispatching to the real mutators (`addLedger` / `addNode` / faction+front clocks). Unknown types `console.warn` + no-op (forward-compatible). **Reused by `ADVANCEMENT`/`DIFFICULTY` later.**
- **`src/world/render.js`** — `renderDMFeed(w)` + `escHtml`: the **"The DM"** section in the World view — a scrolling chronicle, the "considering…" indicator, the roll-handshake button, the three-options `ask`, and the action box. Shown once a soul is in play.
- **`src/world/state.js`** — `dmLogOf` / `pushDmLog` (the persisted narration feed, on `w.dmlog`). **`src/state.js`** — `GS.dm` transient.
- **`dev/fixtures/`** — 4 turn/response pairs (social / travel / combat / combat-resolve) covering `fact_canonized` + `clock_advanced` + `ask`, `discovery` (mints a node) + front clock, the roll handshake (`rollRequest`, no events), and `encounter_resolved` + `kill` + `adjudication`. They double as the test corpus.
- **CSS** for the feed; `.dm/` git-ignored.

### Verified
- **`dev/verify-bridge.py` — 28/28**: transport + contract (POST /turn echoes id, /response 204→200, static serve, /state round-trip, every fixture's `events[]` conform to the envelope, DM responses carry no `rolls[]`). Dependency-free.
- **`dev/verify-dm-events.mjs` — 21/21** (jsdom, full-app load — every module in real document order): `applyEvent` through the real mutators (clocks advance by exact delta, `discovery` mints a node, `adjudication` writes a canon precedent, unknown types no-op), `dmDigest()` reflects post-event state, **and** the DM-feed render (`renderDMFeed`/`renderWorld` produce the "The DM" panel + action box + roll-handshake button). Doubles as the boot smoke-test — all DM-bridge globals present after the full load, no throw.

### Deferred (v1 gaps, by design)
- **No time-advance event** — the in-world clock still moves only via the existing transition controls (Travel / Rest / Montage). A DM that narrates travel reminds the player to take the transition.
- **Declared events only** — the `detected`-from-state-delta migration stays `EVENT-CONTRACT.md`'s job. `clockId` is fuzzy-matched to a faction (name slug) / front (danger slug) until stable clock ids land with the detected work. XP/leveling consequences are recorded to the ledger but not computed (that's `ADVANCEMENT.md`).

---

## 2026-06-21 — `CLASS_PROGRESSION` data (levels 1–20) — the leveling spine's first build step

Built the load-bearing data task from the advancement spec family (`ADVANCEMENT.md` step 1): structured levels-1–20 advancement for all 12 base classes. Until now only level 1 was wired (`data/srd-creator.js`); this is the data real leveling and richer DM lookups stand on. First Claude Code session. Commit `f9e5601`.

### Added
- **`data/class-progression.js`** (generated, ~144 KB) → `const CLASS_PROGRESSION`, 12 classes × levels 1–20, 254 feature entries. Per level: `pb`, `features[]` (`{name, text}` with **full SRD feature text embedded** — the chosen depth), and for casters `cantrips` / `prepared` / `slots[]` (full+half) or `pactSlots`/`pactSlotLevel`/`invocationsKnown` (Warlock pact); Wizard also carries `spellbook` (6 +2/level, distinct from `prepared`). Class resource scalers where canonical: Barbarian rage uses + damage, Bard inspiration die, Fighter action surge + indomitable, Monk martial-arts die + focus points + unarmored movement, Rogue sneak-attack dice, Sorcerer sorcery points.
- **`build/gen-class-progression.py`** — the generator. **Parse-then-validate**: the SRD's per-level numeric grids survived OCR as space-separated rows (em-dash = empty), so it parses the real `classes.md` grids for 7/8 casters, then **asserts the parsed spell-slot columns equal authored canonical matrices** (full / half / pact) — OCR corruption fails the build loudly. Feature names + prose parse from the clean `### Level N:` headings. Ranger's grid is the one too OCR-scrambled to parse, so it's authored from the Paladin-validated half-caster canon (the substitution is the validation).

### Changed
- **`manifest.json` + `genesis.html`** — registered `data.class-progression` (owns `CLASS_PROGRESSION`, layer 0) in `loadOrder`, the module list, and the `<script>` tags; added to `check-manifest.py`'s LAYER map. `check-manifest` clean: **30 modules, 215 owned symbols** (only the 6 known, documented layer-inversion warnings).

### Verified
- **Headless jsdom harness, 797/797 green** — loads the real `genesis.html` (all modules in document order), then asserts: 12×20 coverage, PB per level, ASI at 4/8/12/16 (Fighter +6/14), subclass-feature levels, caster classification, spell-slot anchors (full/half/pact), cantrip growth, resource scalers, embedded-text presence + no grid leakage, and **L1 reconciliation with `srd-creator.js` `CLASS_CASTING`** (creator cantrip/prepared counts match the progression's L1; the reconciliation surfaced + correctly models Wizard's spellbook-vs-prepared split).

### Notes / deferred
- **Recurring features handled as canonical constants, not parsed** — the SRD prints each feature's prose once (first appearance) and the summary table (which repeats ASI/Expertise/etc.) is too OCR-corrupted to parse (Fighter's lost its level column entirely). So ASI (4/8/12/16, +Fighter 6/14), the few class repeats (Bard/Rogue Expertise, Sorcerer Metamagic, Warlock higher Mystic Arcana), and Wizard's absent-from-source subclass levels (6/10/14) are injected from 2024 canon and asserted by the harness.
- **Out of scope (by design):** subclass feature *content* (only base classes are wired; generic "Subclass feature" markers stand in), the XP-to-level **threshold curve** (still its own decision per `ADVANCEMENT.md` — make before leveling is wired), and any UI / level-up plumbing (data + tests only).

---

## 2026-06-21 — Version control: git repo + `CLAUDE.md` (Claude Code readiness)

Put Genesis under version control and laid down a cross-surface operating contract, so future code work can flow through either Cowork or Claude Code with a safety net.

### Added
- **`Obsidian Files/Genesis/` is now a local git repo.** First commit `6428d47` captures the modular-v0.3 state (924 files, ~9M); `d7f4f76` adds the table artifacts (below). No remote yet — add a GitHub remote later (needs a token; local commits need none → keep it **private**, the ignored PDFs aside).
- **`.gitignore`** — ignores the scanned rulebook **PDFs** (~705M, copyrighted, never push), `node_modules/`, `.DS_Store`, and `Archive/` (pre-git manual backups — git history replaces them). Everything else is tracked.
- **Repo `CLAUDE.md`** (root) — the cross-surface contract both Claude Code *and* the Cowork `genesis` skill read: run command, the classic-script/manifest/`GS` architecture, the command table (check-manifest / compile-tables / gen-spells-slim / jsdom), the non-negotiable disciplines, the `docs/` map, and gotchas. Points at `docs/`, doesn't duplicate.

### Changed
- **`tables.json` / `tables.js` are tracked** (reversed an initial ignore). Rationale: a fresh checkout should always run (the Oracle tab needs `tables.js`) and compile output stays diff-able/bisectable. Still generated — never hand-edit; regenerate with `compile-tables.py --emit`.

---

## 2026-06-21 (docs) — Docs → `docs/`, and the combat/XP/advancement spec family

Reorganized the doc tree and laid down the design specs for the engine's "meat and potatoes": combat, XP, leveling, and the DM↔script event contract.

### Changed
- **All design docs moved to `docs/`.** The thirteen narrative/design/spec/operational docs left the repo root; only `README.md` (front door) and `table-registry.md` (build artifact) stay at root. References fixed everywhere: `README.md`, and the comment/`desc` pointers in `genesis.html`, `src/world/state.js`, `src/state.js`, `src/engine/hexmap.js`, `build/check-manifest.py`, `manifest.json` (all `X.md` → `docs/X.md`). No `[](file.md)` links existed, so sibling cross-references stayed valid. Build green after (`check-manifest` OK, manifest still valid JSON). **The `genesis` skill references several docs by name — it's a read-only cache here, so Adam updates it via Settings → Capabilities (change-list provided).**
- New `docs/README.md` — the docs index + the `type:` genre taxonomy (decision-log / system-spec / research / operational / audit) + the repo-root-relative path convention.

### Added
- **`docs/EVENT-CONTRACT.md`** (`system-spec`) — the DM↔script interface: typed events, the **detected > declared** principle, the event taxonomy, meaningful-choice-as-state-fork, and adjudication-as-precedent. The spine the other three reference.
- **`docs/ADVANCEMENT.md`** (`system-spec`) — ledger-spine XP economy (combat as a gated modifier), XP-threshold leveling applied on a rest, creativity rewarded off the XP axis (Inspiration / better outcomes / failure-as-engagement).
- **`docs/DIFFICULTY.md`** (`system-spec`) — fixed-by-default regional power bands, narrative-exception scaling (`corruption_vector`), mandatory threat-signaling, and murder-hobo answered by named responses via the existing faction-clock machinery.
- **`docs/COMBAT.md`** (`system-spec`, sketch) — theater-of-mind zone-band 5.5 engine, cover from generator terrain specs, scene objectification serving tactics/escape/clever-outs; engine deferred (Fable), event surface specced now.
- Five new decision rows in `DESIGN.md` (advancement / difficulty / combat / event-contract / docs-org).

---

## 2026-06-21 (later) — Guided creator: skills, equipment, spells & feat walkthrough + multi-die display

The bardo creator now walks the choices it used to auto-generate. After scores, four new beats — **Skills → Kit → Spells → Feat** — let the player make the picks the 2024 PHB asks for, each with a 🎲 "choose for me" shortcut (the three-options-+-something-else ethos). Ability-score rolls now show the four d6 they came from.

### Added
- **`data/srd-creator.js`** — curated SRD/2024-PHB class data: `CLASS_SKILLS` (n-from-list), `CLASS_KIT` (starting-equipment A/B/gold packages), `CLASS_CASTING` (L1 cantrip/spell counts + spell list + ability), `ALL_SKILLS`. Transcribed + verified against `Reference/SRD-Data/classes.md`.
- **`data/spells-slim.js`** (generated) — cantrip + level-1 picker surface (name/level/school/classes/flavor). Built by **`build/gen-spells-slim.py`** from `spells.json`; 84 spells, ~17 KB. Loaded as a `<script>` global (file:// can't fetch).
- **Four bardo steps** (`src/creator/bardo.js`): `skills` (class picks, minus background dupes), `equipment` (A/B/gold), `spells` (caster-only; non-casters get a graceful "no magic at level 1" pass; half-casters with 0 cantrips handled), and `feat` (the background **origin feat** — Magic Initiate resolves 2 cantrips + 1 L1 spell from its list; Skilled resolves 3 skills excluding bg/class dupes; Alert/Savage Attacker just confirm). Each with a "choose for me" auto-fill. Running bardo-log shows the picks.
- **`ORIGIN_FEATS`** (`data/srd-creator.js`) — the four origin feats the backgrounds use, with their player choices described declaratively.
- **Multi-die roll display.** `roll4d6breakdown()` keeps the four d6 (and which was dropped); the bardo score slots and the manual Sheet's "YOUR ROLLS" strip render the dice (dropped one struck through) instead of only the total. `miniDice()` helper + `.score-dice` CSS.

### Changed
- **Sheet finalize carries the choices.** `cgSheetExtras()` (shared by `cgBind` + `soulFromCGEN`) merges background + class **+ feat** skills (deduped) and adds `classSkills`, `inventory`, `gold`, `kit`, `cantrips`, `spells`, `spellAbility`, plus `featSkills`/`featCantrips`/`featSpells`/`featSpellAbility`. The manual Sheet's punt line now points to the guided creator instead of deferring everything to the DM.
- **Verification:** 62/62 headless jsdom assertions (real `genesis.html`, all modules in document order) — skill/kit/spell/feat auto-fill across Wizard, Ranger (edge), Fighter, Rogue + feat cases (Magic Initiate Cleric/Wizard, Skilled, Alert, Savage Attacker); the 4d6 breakdown (4 dice, drops lowest, total matches); sheet shape; all four render branches; Bard choose-any-3. `check-manifest` OK (29 modules, 214 owned symbols).

---

## 2026-06-21 — De-monolithing complete, scaling guardrails, creator polish

The big arc: `genesis.html` went from a 2047-line monolith to a **449-line shell + 27 modules**, plus an architecture audit, two scaling guardrails, and a round of creator/dice work.

### Added
- **Full modularization (passes 2–8).** Carved all logic out of `genesis.html` into classic-script modules: the data layer; the engine (`tables` / `world-gen` / `hexmap` / `compiled`); `world.state` + `world.render`; the UI (`oracle` / `chrome` / `dice`); the whole creator (`scores` / `life` / `sheet` / `bardo` / `roster`); and the app core (`world.play` / `fate` / `handoff`). `genesis.html` is now HTML/CSS + init + a few consts.
- **`GS` state container** (`src/state.js`) — all transient mutable state (`CGEN`/`BARDO`/`CG_DRAG`/`FATE_CTX`/`SEED`/`ORC`) lives behind one window-level `GS` object (~270 references migrated via AST). New mutable state goes here. `U` (persistent universe) keeps its own accessor layer.
- **`SCALING.md`** — architecture/scaling audit: classic-scripts vs ES-modules, the state-discipline question, and *when* to migrate (with the eventual graphics engine, not before).
- **Canon Wandering Souls** (`data/souls-canon.js` → `CANON_SOULS`, seeded idempotently by `world.state.seedCanonSouls`). Shipped as source so Adam's characters are canon; end-users' banked souls stay local; the roster is the union. Entries: **Robin Hartley, Brunn Graniteback, Milo**.
- **Pronoun picker** in character creation (`data/pronouns.js`: `PRONOUN_SETS` + `pronounSet`; they / she / he). Appears in both the bardo and the Sheet; flows to the banked soul, the in-play character, and the **DM handoff** (`I am playing X (he / him) — …`). Defaults to they/them.
- **Dice visual engine** (`src/ui/dice.js`: `dieRoll` + `diceSpice`) — the tumble-then-settle animation + spice "juice" consolidated into one place; the four contexts (ritual / creation / fate) delegate to it. First improvement shipped: **tumble-decay** (flips decelerate into rest) + a **settle-pop** bounce.
- **`check-manifest` guardrails:** a **layer-direction check** (warn-mode — flags calls into a higher layer; flips to hard-error once the 6 known inversions are cleaned) and an **HTML-tag check** (every manifest `loadOrder` entry must have a `<script>` tag in `genesis.html`; missing = hard error).

### Changed
- **Ability-score allocation** on the Sheet is now an explicit **Best-for-class / As-rolled toggle** (active mode highlighted) instead of a single button.
- **Retired the one-off `ROBIN_SEED`** into the `CANON_SOULS` data layer + the general `seedCanonSouls` seeder.

### Fixed
- **Canon souls weren't seeding in the browser.** `data/souls-canon.js` was in the manifest `loadOrder` but had **no `<script>` tag** in `genesis.html`, so `CANON_SOULS` was undefined and the seeder silently no-op'd — Robin/Brunn never actually appeared. Added the tag (now Robin/Brunn/Milo all seed); the new HTML-tag check prevents recurrence.
- **The Sheet's "Best for class" button did nothing** from a fresh roll, because rolling already auto-applied best — so re-applying it produced the identical result. Resolved by the toggle above (the allocation math was always correct).

### Deferred (tracked in `NEXT-STEPS.md` / `SCALING.md`)
- Clean the 6 layer-inversion warnings → flip the layer-check to hard-error.
- Relocate the last data consts (`STAGES` / `GUIDE` / `LIFE_STEP`) out of the shell into a data module; `FATE_THRESHOLD` → `fate.js`. Sweep dead `cgResetScores`.
- Feature backlog: deeper creator (skills / equipment / spells from SRD-Data); multi-die roll display; "retire character" action; further dice flourishes.
- ES-module migration + inline-handler rebind — paired with the eventual graphics engine.
