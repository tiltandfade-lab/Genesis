# Genesis — Changelog

All notable changes to Genesis, newest first. Started 2026-06-21 (earlier history lives in `DESIGN.md` and git, not backfilled here). Add a dated entry each working session; group changes under **Added / Changed / Fixed / Deferred**.

**Auto-archive rule (2026-07-09):** this file keeps the newest 25 entries; older ones roll into
`CHANGELOG-ARCHIVE.md` via `python3 build/archive-docs.py --emit` (run it at session close when
`--check` complains). The two files read as one continuous newest-first history.

---

## 2026-07-14 (later-2) — VQ2 WORLD LOOKS: 16-frame exterior/beat vision quest + build recipes [Codex]

The PLAY-LENS exterior, staging, and combat-continuity gaps now have an independent visual target and
an engineering handoff. This is art direction, not a BUILT claim; the frames deliberately separate
visual proof from runtime scope.

**Added**
- `ui-sketches/mock-frames/vq2-world-looks/` — all 16 requested frames: four exterior light profiles,
  five wilderness/arrival looks, town/settlement grammar, three Kenney bridge studies, shop/rest beats,
  two odd-roll substitutions, and an exploration→combat continuity pair.
- `SOL-SOLUTIONS.md` — per-frame friction plus P-A..P-F LAW/RECIPE/RISK blocks with current-engine seams,
  numeric light/material budgets, provenance gates, cut list, and blocker amendment queue.
- `GENERATION-PROMPTS.md` — reproducible built-in ImageGen contract and per-frame prompt deltas; every
  generation call carried the canonical figure language verbatim.
- `dev/model-qa/mock-gen/PACKET-VQ2-WORLD-LOOKS.md` — the source packet committed beside its output.

**Changed** — the recommended graphics order is now: use VQ2 as the acceptance target for ENV/EXTERIOR;
build one donor-normalization adapter before pack wiring; preserve one interior scene graph through
combat rather than swapping to the flat board.

**Deferred** — all implementation remains open. Adam red-pen/taste gate first; then split P-A..P-F into
bounded specs. Physically accurate glass/refraction, full-town trays, dense industrial odd-roll kits,
and bespoke wonder assets are explicitly cut.

## 2026-07-14 (later) — STAGE D STATEFUL NOUNS + AgX LIVE + the door package + PLAY-LENS [Claude Opus 4.8, orchestrated]

The evening block: the whole Stage D spine, AgX as the production look, the door package driven by
Adam's live taste rulings, and PLAY-LENS — the bot-play visual audit that now ORDERS the waves.
Master tip `67566b6a`, all pushed. Every unit orchestrator-re-gated (own harness runs, frames READ).

**Added**
- **STAGE D — STATEFUL NOUNS, complete (D0–D4)**: `state_transition` at the contract boundary (D0,
  fuzz 0/530) · `data/interactables.js` registry `slug@state` + extrudeDepth/location/renderStrategy
  authoring (D1) · `plan.interactables[]` walk binding, raw segment byte-canon (D2, 89/0) ·
  ROOM-GRAMMAR placement ALIGN/PAIR/FOCAL/RHYTHM/CLEAR-last (D3, 38/0) · the DOORS-FIRST keystone
  (D4, 61/0 + 102/0): trayFrom wiring (WIRING LAW closed), persisted state in the prep node (a door
  opened last turn STAYS open), shaped-aperture stateful door on the BW4 tween + MF-2 crossfade.
  D0+D1 integration cross-check caught a real fixture red (lexical-const shadowing) — fixed red-first.
- **The door package (Adam's rulings)**: D4b hinge-edge axis (jamb pivot, deterministic side; broken
  grounded) + the PRODUCTION apron fix (dpPlaceRoom dressing could legally squat in doorways — the
  vine-arch bug, harness-locked) · D4c broken-variant family {flopped, hanging, shattered} — seeded
  visual flavor inside ONE contract state (202/0) · D4d doorframes are FRAMES (2 slim jambs + header;
  old geometry proven a light-proof column via stash A/B; bw2-5 fixtures synced honestly, 110/0).
- **P3-3a AgX filmic tone-curve**: verbatim three r166 GLSL in makeGradePass behind GRADE_TONEMAP;
  none≡master proven byte-identical; A/B set shot on the eyeball fixtures; **Adam ruled "agx looks
  awesome" → default FLIPPED live** (baseline pinned to 074cf05d so the proofs hold forever).
- **PLAY-LENS (Adam's direction)**: `dev/play-lens.mjs` — the bot plays a REAL 14-leg session
  (TIYL → settlement → 7-leg travel → 7-room dungeon + combat + live state_transition → shop →
  rest), 26 shots; PL-2 audit (3 vision auditors + synthesis) → **`dev/play-lens/ledger.md`** ranked
  BROKEN/UGLY/MISSING/WORKING. Standing law: the lens re-runs after every visual wave.

**Ledger verdict (the new wave order):** 1) QUICK-FIX (rat-as-humanoid casting bug, PC token vanishes
in combat rounds 2–3, door leaves unanchored in real rooms, wireframe fallback, degenerate arrival
frame, tray head-clip) → 2) ENV/EXTERIOR (all 6 travel legs are an empty plane; daylit≡moonlit≡
overcast pixel-identical — light profiles unwired outside interiors; no town tray) → 3) Stage E
exposure/bloom → 4) combat-in-room + staging beats → 5) P3-2 (auto-fires when sprite-QA lands).

**Changed** — loop-gate evidence refreshed on today's stack (5/5 clean, AgX + open dioramas).
**Deferred** — shattered shards have no prop-avoidance (2/3 occluded in the card — taste-pass item);
PL-1b rig improvements (bot should fight; transition captures focus the right room; shop-panel check).

## 2026-07-14 — PHASE-3 WAVE-1: no-spend visual wave + diorama cutaway restore + repo migration [Claude Opus 4.8, orchestrated]

Phase-3 Wave-1 executed as background worktree-isolated Sonnet executors, each personally re-gated
(harnesses re-run by me, visual units' PNGs READ, never self-report), landed `--no-ff`. Master tip
after the wave: `a23d2eb2`.

**Added**
- **P3-1a Poisson dressing** (`src/engine/place-distribution.js`, `placeDistribute`) — seeded
  Poisson-disk realization of incidental floor dressing behind `ROOM_PLACE_DISTRIBUTE=false`
  (byte-identical until a follow-up flip). 27/27 (5 red-first), dungeon-dressing 655/0, interior
  287/0, active-room p95 0.53ms.
- **W0-c Open5e cross-check** (`build/sync-open5e.py`) — read-only SRD-Data validator vs Open5e
  `srd-2024` (339/339 name join, 223 representation-format field diffs surfaced); NEVER writes SRD-Data.
- **E0-1 wall-fixture occlusion-fade** — wall-mounted practicals fade with their occluded wall
  segment (per-wall-mount body-material clone; append into the `ownerSegIndex` fadeEntry, never
  overwrite). 32/0 + 3-way isolation proof; capture confirms suppressed torch dims, non-suppressed
  stays lit. (Grew from a P3-1d out-of-scope finding.)
- **P3-1e eyeball fixtures** (`dev/battle-gate/eyeball-fixtures/`) — legacy-vs-oss capture pairs
  (tiered / aperture / dressed room), same scene/camera/crop taste-gate set; frames READ (tiers
  render under both kernels — a staging gap, not a code defect).
- **P3-1b depth-state audit** (`dev/audit-depth-state.mjs`) — four-yaw oss capture + material census;
  PROVEN defect table EMPTY (renderer transparency clean), one latent wall-upper condition flagged for P3-3.

**Fixed**
- **P3-1d diorama cutaway restoration** — compiled rooms read as OPEN dioramas again, not closed
  boxes (the C4.1b regression). Camera-side wall-upper band suppression restored via
  `itrOcclusionClassify` (`wallUpperCameraSideBlockingSet`, `theater-shot.js`); occlusion subjects
  extended anchors→all mounted figures (`OCCLUSION_SUBJECT_CAP=24`, loud warn). 14/14 red-first,
  wall-occlusion 23/0, theater-shot 107/0, interior 287/0; before/after loop-gate PNGs READ.

**Changed**
- **CI scoped to master + PRs** (`.github/workflows/ci.yml`) — a blanket `on: push` (all branches)
  turned a `git push --all` backup into ~100 failing CI runs (inbox flood); branch backups no longer
  each trigger a run. Cancelled the active runs; deleted 81 junk `worktree-*` branches from origin.
- **Repo migrated to an APFS sparsebundle on the Work Drive** (`/Volumes/Genesis/Genesis`) — off the
  97%-full boot drive. exec bits preserved (git clean, no fileMode churn), all branches + Cowork
  memory carried over, verified (check-manifest OK, harnesses green, app serves). Launchers +
  `.claude/launch.json` rerouted; old copy removed (corrupt zip discarded — origin is the backup).
- **P3-2 Stage B teed up** (`docs/PHASE-3-WAVE-2-SPECS.md`, B1–B4) — GATED on sprite-QA registry
  coordination (B1 regenerates `sprite-registry.js`).

**Deferred**
- W0-b PRNG dedup — real surface is 20+ harness files, not 3; re-scope before executing.
- W0-a struck — MF-3b hit-stop already shipped in BW4B (`17474b45`); wave plan listed a stale unit.

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

