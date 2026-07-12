# Genesis — Changelog

All notable changes to Genesis, newest first. Started 2026-06-21 (earlier history lives in `DESIGN.md` and git, not backfilled here). Add a dated entry each working session; group changes under **Added / Changed / Fixed / Deferred**.

**Auto-archive rule (2026-07-09):** this file keeps the newest 25 entries; older ones roll into
`CHANGELOG-ARCHIVE.md` via `python3 build/archive-docs.py --emit` (run it at session close when
`--check` complains). The two files read as one continuous newest-first history.

---

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

