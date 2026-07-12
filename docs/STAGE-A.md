# STAGE A — stop producing map overviews (GRAPHICS-NORTH-STAR wave 1)

type: system-spec
status: SPECCED (Opus 4.8, 2026-07-11 — Adam committed to Stage A as the next graphics wave. The
first + highest-leverage stage of docs/GRAPHICS-NORTH-STAR.md, per Codex's directive §7 Stage A.
Grounded against the current tree; execute exactly.)

Read with: `docs/GRAPHICS-NORTH-STAR.md`, the directive
`ui-sketches/mock-frames/vq-battle-scenes/CLAUDE-IMPLEMENTATION-HANDOFF.md` (§3, §4.1-4.4, §7-8), and
the target frames `04-gloom-dungeon` + `11-fantasy-dungeon-occlusion-fade`.

## The stage goal + gate
Make the battle view read as a **staged encounter**, not a map: the active room alone owns geometry,
the camera composes on the action cluster, occluders fade dynamically. **Success gate: frames `04`
and `11` are approximable with current assets and clearly read as staged encounters, not complete
maps** — asserted via the objective visual gates (GRAPHICS-NORTH-STAR §"Objective visual gates" /
directive §8): neighbor-room mesh count 0; medium standee 18-25% frame height; 0 living-subject pixels
outside the 7% safe frame; one dominant bright region; 35-55% of the indoor frame in the dark band.

## The 4 units (A1/A2 independent → parallel; A3/A4 consume A2 → after)

### A1 — ONE-ROOM-LITERAL (theater-interior.js) [independent]
Today `itrFocusRoomSet(plan, focusSegNum, radius)` (theater-interior.js:409) keeps the focus room +
`radius` hops of neighbors; `interiorBuildBoard(..., {radius:1})` renders the focus room AND its
1-hop neighbors. The active room alone should own render geometry (directive §4.3).
- Make the interior build render **only the active room** (keep set = `{focusSegNum}`), not its
  neighbors. A doorway/aperture becomes a shallow **darkness portal** (a dark recessed card / short
  corridor throat / controlled glimpse), NEVER the adjacent room's shell.
- Keep the logical plan intact (mechanics/reachability unchanged — this is render-only).
- Preserve the aperture edges (doors/archways) on the active room's boundary so A-later + Stage C/D
  can attach portals/transitions there.
- Reversible behind a diagnostic flag (`ITR_ACTIVE_ROOM_ONLY`, default ON) so the old multi-room
  render is one flag away during migration.
*Anchors:* `itrFocusRoomSet` (409), the `radius` plumbing into `interiorBuildBoard`, the wall/floor
build that consumes the keep set, the door/aperture list.
*Verify* (`dev/verify-active-room-only.mjs`, real Chrome): ⊗ RED-FIRST — at base, a multi-room plan
renders neighbor-room floor/wall meshes (assert neighbor mesh count > 0); GREEN — neighbor-room mesh
count is **0**, the active room fully renders, and each door aperture yields a portal card (not a
neighbor shell). Regression: verify-dungeon-interior 287/0, verify-interior-camera-frustum 14/0.
check-manifest OK. Shoot a before/after (multi-room vs one-room) capture; give the path.

### A2 — SHOTPLAN + composeShot (NEW `src/ui/theater-shot.js`) [independent, foundational]
A **pure, deterministic** module (no THREE/DOM — plain-Node importable + unit-testable, like
theater-verbs.js's pure helpers). Register in `manifest.json`; load in dependency order.
- **`shotPlanFrom(tray, combat, viewState)`** → the `ShotPlan` object (directive §3 shape verbatim):
  `{id, seed, realmId, environment, activeRoomId, stage:{polygon,floorLevels,wallSegments,apertures,
  skirt,openEdges}, anchors:{player,primaryThreat,objective,focalLight,actionCenter}, pieces, props,
  interactables, overlays, traces, lightRig:{practicals,sky,readabilityFloor,exposure}, camera:{mode,
  yaw,pitch,fov,target,distance,sharpSubjects}, occlusionTargets, postProfile, provenance}`. Populate
  from the tray/board data (`trayFrom`/`theaterBoardFrom`, src/engine/theater-data.js:1080/1126) +
  combat state. Pure except ephemeral player orbit/zoom (`viewState`). Every staged noun gets a
  `provenance` entry (the state/roll/combat-unit/trace that licensed it). NEVER rolls content, NEVER
  writes gameplay state.
- **Anchor resolution:** `anchors` = the weighted encounter cluster — player (living PC group
  centroid), primaryThreat (highest-threat foe), objective (centerpiece/objective cell if any),
  focalLight (dominant practical), actionCenter (weighted centroid of player+primaryThreat+objective).
- **`composeShot(shotPlan, cameraCandidates)`** → the chosen `camera` (directive §4.2): a FINITE
  candidate search (NOT continuous optimization, NOT a model call). Candidates = the 4 diagonal yaws
  + the current orbit. Pitch clamped 28-38°, FOV 18-24°. Score each candidate:
  `+subject_separation +primary_threat_visibility +objective_visibility +focal_light_near_rule_of_thirds
  +tray_edge_visibility +foreground_depth_layer −hard_occlusion_area −subject_overlap
  −clipped_subject_area −empty_frame_area −competing_bright_source_count`. HARD constraints (reject a
  candidate that fails): all living figures inside a 7% safe frame; medium figure 18-25% frame height
  in beat mode; primary threat/player overlap ≤15%; ≥1 stage edge/skirt visible (unless boss mode);
  neighbor-room mesh never in the graph; UI excluded. Emit ALL candidate scores to a capture JSON (so
  Codex can debug composition without guessing from pixels).
- Projection: A2 is pure, so take a `project(worldPt)->{ndcX,ndcY}` function as an INJECTED dependency
  (the caller passes the live camera projection; the harness passes a deterministic stub). Do NOT
  import THREE. (A3 wires the real `window.Theater.projectWorldPoint`.)
*Verify* (`dev/verify-theater-shot.mjs`, plain Node — pure module): ⊗ RED-FIRST where marked — a known
tray+combat fixture yields the expected anchors; composeShot picks the candidate maximizing the score
under a stub projection; a candidate violating a hard constraint (a figure outside the 7% safe frame)
is rejected (prove it's rejected). Deterministic: same fixture → same ShotPlan + same chosen camera.
Assert the candidate-score JSON is emitted. check-manifest OK (new module registered).

### A3 — REFRAME AROUND THE SHOT CAMERA (theater-boot.js) [after A2]
Wire the interior render to COMPOSE via A2 instead of `focusRect`: at the fit point, build the
ShotPlan (`shotPlanFrom`), pass the real `projectWorldPoint`, run `composeShot`, and drive the camera
from the chosen `camera` (yaw/pitch/fov/target/distance) — reusing the existing camera-fit + the MF-1
camera tween (glide to the composed pose, don't snap). Player zoom/rotate stay direct (Feel Law 3).
Keep `focusRect` as a fallback behind a flag (`ITR_SHOT_COMPOSE`, default ON).
*Anchors:* the fit call site in `setInteriorBoard` (`placeCameraTweened`), `window.Theater.
projectWorldPoint`, `interiorCameraFitFor`. *Verify* (`dev/verify-shot-compose.mjs`, real Chrome):
the composed camera keeps the action cluster in the 7% safe frame + medium figure 18-25% frame height
(reuse the sprite screen-rect diagnostics); frustum green; fps ≥30; loop gate stays green (settle-
await). Regression: verify-mf1-camera-tweens 24/0, verify-interior-camera-frustum 14/0. A capture READ.

### A4 — DYNAMIC OCCLUSION v2 (theater-boot.js) [after A2; supersedes the flat 0.2 ghost]
Upgrade the ankle-stem+ghost (directive §4.4): blockers from `ShotPlan.occlusionTargets` (walls,
pillars, tall furniture, large foreground props), not only original piece cells. Fade ONLY the
blocking segment/instance. Upper opacity **0.05-0.10** (named const, from the current 0.2) + a solid
**0.12-0.25u stem**. **Tween** opacity 120-180ms in / 180-260ms out with interruption-safe retargeting
(reuse the MF-1/verbs tween channel). Add **2-4° hysteresis / a short hold** before re-classifying (no
flicker on camera move). Keep transparent occluders `depthWrite:false`, solid stems normal; keep the
small ghost mesh (don't per-instance-alpha a big shared material). *Verify:* extend
`dev/verify-occlusion-fade.mjs` + reuse `capture-occlusion-real.mjs` — ⊗ the mini reads through a
faded blocker; only the blocking instance fades (non-blockers opaque); the fade TWEENS (fake-clock
start/mid/end) and holds under a small camera jitter (hysteresis); fps ≥30. Regression: dungeon-
interior 287/0, bw2-1b-occlusion. check-manifest OK. READ on/off capture.

## Order + vehicles
A1 + A2 launch in PARALLEL (disjoint files: theater-interior.js vs new theater-shot.js). A3 + A4
launch after A2 lands (they consume the ShotPlan; both touch theater-boot.js so land them serially,
re-gating the theater surface after each). After all four: RE-SHOOT + read frames 04/11 approximations
+ run the composition objective gates. Everything reversible (ITR_ACTIVE_ROOM_ONLY, ITR_SHOT_COMPOSE,
the occlusion consts). Do NOT bury A3/A4 policy in new theater-boot constants beyond the flags — the
ShotPlan/compose logic lives in theater-shot.js (directive §9: theater-boot already carries too much).

## Out of scope (later stages)
Room-shell compiler / polygon rooms (Stage C); sprite citizenship shader/contract (Stage B); stateful
interactables + curation (Stage D); PBR materials + LightRig registry + post upgrades (Stage E). A2's
ShotPlan defines the FIELDS those stages populate (stage.polygon, interactables, traces, lightRig) —
they can be empty/simple now and filled by later stages.
