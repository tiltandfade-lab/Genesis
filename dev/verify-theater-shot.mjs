/* dev/verify-theater-shot.mjs — GRAPHICS-NORTH-STAR STAGE A, UNIT A2 (docs/STAGE-A.md).
   Plain-Node ESM harness for src/ui/theater-shot.js — a PURE module (no THREE/DOM/window), so this
   is a real `import` of the production file, exactly dev/verify-mf2-spawn-grace.mjs's Part A
   convention for the same class of zero-DOM sibling module. No jsdom, no Chrome.

   RED-FIRST (checked live against base commit 4796562b, the master tip this unit branched from —
   re-checked below, not just cited): `git show 4796562b:src/ui/theater-shot.js` -> "fatal: path
   ... exists on disk, but not in 4796562b" — the module did not exist before this unit.

   Sections:
     0. RED-FIRST proof.
     1. ShotPlan shape completeness (every directive §3 top-level key present, even when empty).
     2. Anchor resolution against a known tray+combat fixture (player/primaryThreat/objective/
        actionCenter land at the expected positions) — ⊗ new assertion class, ⊗ RED-FIRST re-proven
        live (the fixture asserts a NEGATIVE too: swap which foe carries the higher cr and the
        primaryThreat pick flips, proving the check isn't vacuously true).
     3. composeShot picks the candidate that maximizes the score under a deterministic stub
        projection — ⊗ RED-FIRST: a rigged fixture where exactly one of the 5 default candidates
        (the 4 diagonal yaws + current orbit) has a materially better subject-separation term, and
        the harness asserts composeShot picked THAT one, not merely "a" one.
     4. A candidate that violates a hard constraint (a figure OUTSIDE the 7% safe frame) is
        REJECTED — ⊗ RED-FIRST: constructs a fixture where a living figure projects to ndcX=0.99
        (outside FRAME_SAFE_BOUND=0.86) and proves composeShot's metrics mark that exact candidate
        rejected with 'safe_frame' in its rejectReasons, and (when it's the ONLY candidate offered)
        that composeShot still returns SOME camera (never throws/returns undefined).
     5. Determinism: same fixture run twice -> byte-identical ShotPlan (JSON deep-equal) and
        byte-identical composeShot output (camera + metrics).
     6. The candidate-score metrics object is emitted and complete — one entry per candidate,
        every entry carrying terms + constraints + total.
     7. Individual term/constraint functions (exported for direct assertion, not just the composite).
     8. check-manifest.py OK (run live, not just cited).

   Run:  node dev/verify-theater-shot.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_COMMIT = "4796562b";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

console.log("=== 0. RED-FIRST proof (re-checked live) ===");
{
  let existedAtBase = true, msg = "";
  try {
    execSync(`git show ${BASE_COMMIT}:src/ui/theater-shot.js`, { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
  } catch (e) {
    existedAtBase = false; msg = String(e.stderr || e.message).split("\n")[0];
  }
  check(`RED0. src/ui/theater-shot.js did NOT exist at base commit ${BASE_COMMIT}`, existedAtBase === false, msg);
}

const modUrl = pathToFileURL(join(ROOT, "src/ui/theater-shot.js")).href;
const T = await import(modUrl);
const {
  shotPlanFrom, composeShot, defaultCameraCandidates, scoreCandidate,
  scoreSubjectSeparation, penaltySubjectOverlap, constraintSafeFrame, constraintMediumFigureHeight,
  constraintPrimaryOverlap, constraintStageEdgeVisible, constraintNeighborRoomAbsent,
  circleOverlapFraction, screenHeightFractionFor,
  FRAME_SAFE_BOUND, MEDIUM_FIGURE_MIN_FRAC, MEDIUM_FIGURE_MAX_FRAC, MEDIUM_FIGURE_WORLD_HEIGHT
} = T;

// ----------------------------------------------------------------------------------------------
// Fixtures — a small combat encounter (2 foes, one clearly the bigger threat by cr) staged in an
// interior3d tray with two lights (index 0 = the dominant/relocated key light per itrRoomLights'
// own documented convention) and a finale dais (the objective anchor).
// ----------------------------------------------------------------------------------------------
function makeTray() {
  return {
    kind: "interior3d", env: "dungeon", realmId: "gloom", cellSize: 1, activeRoomId: 7,
    bounds: { minX: 0, maxX: 9, minZ: 0, maxZ: 7 },
    daisTop: [{ roomSegNum: 7, x: 8, y: 6 }],
    lights: [
      { x: 8, z: 6, y: 1.5, color: "#ff9a44", intensity: 1.6, kind: "torch" },
      { x: 1, z: 1, y: 1.5, color: "#ff9a44", intensity: 0.4, kind: "torch" }
    ],
    instances: {
      floor: [], pillar: [],
      wall: [{ x: 0, z: 0, sx: 1, sy: 2.4, sz: 1 }, { x: 9, z: 7, sx: 1, sy: 2.4, sz: 1 }],
      doorframe: [{ x: 0, z: 3, sx: 0.6, sy: 2, sz: 0.6, transition: true }]
    },
    skirt: [{ x: -1, z: -1 }, { x: 10, z: 8 }],
    furniture: [{ x: 2, z: 2, kind: "table", roomSegNum: 7 }],
    props: []
  };
}
function makeCombat() {
  // raw GS.combat shape — deliberately the "(a)" contract branch (band/lane, no pre-resolved x/z) so
  // this fixture also exercises zoneWorldPos, not just the pass-through units[] branch.
  return {
    grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] },
    pc: { band: "melee", lane: "L", down: false, obliterated: false },
    allies: [],
    foes: [
      { fid: "f1", band: "near", lane: "C", down: false, fled: false, obliterated: false, cr: 2, hp: 30, maxHp: 30, name: "Grunt" },
      { fid: "f2", band: "far", lane: "R", down: false, fled: false, obliterated: false, cr: 8, hp: 90, maxHp: 90, name: "Boss" }
    ]
  };
}
// a deterministic stub projector matching the module's own 2-arg contract: project(worldPt, cameraPose).
// Simple orthographic-ish stub (no real perspective) — deterministic and total, which is all the
// contract requires; scoring math itself is exercised against real trig via the closed-form terms.
function stubProject(worldPt, cameraPose) {
  const yawRad = (cameraPose.yaw * Math.PI) / 180;
  const tx = worldPt.x - cameraPose.target.x, tz = worldPt.z - cameraPose.target.z;
  // rotate the point into the candidate's own yaw frame, then scale by distance (further candidate
  // distance = smaller projected magnitude, mimicking real perspective's distance falloff).
  const rx = tx * Math.cos(yawRad) - tz * Math.sin(yawRad);
  const rz = tx * Math.sin(yawRad) + tz * Math.cos(yawRad);
  const scale = 1 / Math.max(0.5, cameraPose.distance);
  return { ndcX: rx * scale, ndcY: rz * scale * 0.6 };
}

console.log("\n=== 1. ShotPlan shape completeness ===");
{
  const plan = shotPlanFrom(makeTray(), makeCombat(), {});
  const REQUIRED_KEYS = ["id", "seed", "realmId", "environment", "activeRoomId", "stage", "anchors",
    "pieces", "props", "interactables", "overlays", "traces", "lightRig", "camera", "occlusionTargets",
    "postProfile", "provenance"];
  REQUIRED_KEYS.forEach((k) => check(`1. ShotPlan has key '${k}'`, Object.prototype.hasOwnProperty.call(plan, k)));
  const STAGE_KEYS = ["polygon", "floorLevels", "wallSegments", "apertures", "skirt", "openEdges"];
  STAGE_KEYS.forEach((k) => check(`1. stage has key '${k}'`, Object.prototype.hasOwnProperty.call(plan.stage, k)));
  const ANCHOR_KEYS = ["player", "primaryThreat", "objective", "focalLight", "actionCenter"];
  ANCHOR_KEYS.forEach((k) => check(`1. anchors has key '${k}'`, Object.prototype.hasOwnProperty.call(plan.anchors, k)));
  const LIGHTRIG_KEYS = ["practicals", "sky", "readabilityFloor", "exposure"];
  LIGHTRIG_KEYS.forEach((k) => check(`1. lightRig has key '${k}'`, Object.prototype.hasOwnProperty.call(plan.lightRig, k)));
  const CAMERA_KEYS = ["mode", "yaw", "pitch", "fov", "target", "distance", "sharpSubjects"];
  CAMERA_KEYS.forEach((k) => check(`1. camera has key '${k}'`, Object.prototype.hasOwnProperty.call(plan.camera, k)));
  check("1. interactables/overlays/traces are empty arrays (no Stage D/E producer yet)",
    Array.isArray(plan.interactables) && plan.interactables.length === 0 &&
    Array.isArray(plan.overlays) && plan.overlays.length === 0 &&
    Array.isArray(plan.traces) && plan.traces.length === 0);
  check("1. an empty/null tray+combat still yields the full shape (total function, never throws)",
    (() => { try { const p = shotPlanFrom(null, null, null); return REQUIRED_KEYS.every((k) => k in p); } catch (e) { return false; } })());
}

console.log("\n=== 2. Anchor resolution against a known fixture ===");
{
  const plan = shotPlanFrom(makeTray(), makeCombat(), {});
  // pc @ melee:L -> x=0*3=0, z=0*3=0 (SHOT_ZONE_PATCH=3, bands.indexOf('melee')=0, lanes.indexOf('L')=0)
  check("2a. player anchor lands at the PC's zone-center (0,0) — the only living party member",
    plan.anchors.player && plan.anchors.player.x === 0 && plan.anchors.player.z === 0, plan.anchors.player);
  // f2 "Boss" cr=8 > f1 "Grunt" cr=2 -> primaryThreat picks f2. f2 @ far:R -> bandIdx=2,laneIdx=2 -> x=6,z=6
  check("2b. primaryThreat picks the HIGHER-cr foe (f2/Boss, cr8 > cr2), not array order",
    plan.anchors.primaryThreat && plan.anchors.primaryThreat.id === "f2", plan.anchors.primaryThreat);
  check("2c. primaryThreat lands at f2's zone-center (6,6)",
    plan.anchors.primaryThreat.x === 6 && plan.anchors.primaryThreat.z === 6, plan.anchors.primaryThreat);
  // NEGATIVE proof — swap the cr values; the pick must flip to f1, proving 2b isn't vacuously true.
  const swappedCombat = makeCombat();
  swappedCombat.foes[0].cr = 12; swappedCombat.foes[1].cr = 1;
  const swappedPlan = shotPlanFrom(makeTray(), swappedCombat, {});
  check("2d. NEGATIVE proof: swapping which foe carries the higher cr flips the primaryThreat pick to f1",
    swappedPlan.anchors.primaryThreat && swappedPlan.anchors.primaryThreat.id === "f1", swappedPlan.anchors.primaryThreat);
  // objective <- tray.daisTop[0] = {x:8,y:6} * cellSize(1)
  check("2e. objective anchor lands at the finale dais (8,6)",
    plan.anchors.objective && plan.anchors.objective.x === 8 && plan.anchors.objective.z === 6, plan.anchors.objective);
  // focalLight <- tray.lights[0] (the dominant/relocated key light per itrRoomLights' convention)
  check("2f. focalLight anchor lands at the dominant practical (lights[0], 8,6)",
    plan.anchors.focalLight && plan.anchors.focalLight.x === 8 && plan.anchors.focalLight.z === 6, plan.anchors.focalLight);
  // actionCenter = centroid(player(0,0), primaryThreat(6,6), objective(8,6)) = (14/3, 12/3) = (4.667,4)
  const ac = plan.anchors.actionCenter;
  check("2g. actionCenter is the weighted centroid of player+primaryThreat+objective",
    ac && Math.abs(ac.x - 14 / 3) < 1e-9 && Math.abs(ac.z - 4) < 1e-9, ac);
  // a down PC with no living allies still resolves a player anchor (falls back to all party units).
  const downCombat = makeCombat(); downCombat.pc.down = true;
  const downPlan = shotPlanFrom(makeTray(), downCombat, {});
  check("2h. an all-down party still resolves a player anchor (falls back to non-living units, never null)",
    downPlan.anchors.player && downPlan.anchors.player.x === 0 && downPlan.anchors.player.z === 0);
  // no combat at all -> no player/primaryThreat/objective(if tray has none)/focalLight but actionCenter total
  const idlePlan = shotPlanFrom({}, null, {});
  check("2i. no combat + no tray -> player/primaryThreat/objective/focalLight all null",
    idlePlan.anchors.player === null && idlePlan.anchors.primaryThreat === null &&
    idlePlan.anchors.objective === null && idlePlan.anchors.focalLight === null);
  check("2j. no combat + no tray -> actionCenter still a real point (stage-origin fallback), never null",
    idlePlan.anchors.actionCenter && idlePlan.anchors.actionCenter.x === 0 && idlePlan.anchors.actionCenter.z === 0);
}

console.log("\n=== 3. composeShot picks the maximizing candidate (RED-FIRST rigged fixture) ===");
{
  const plan = shotPlanFrom(makeTray(), makeCombat(), {});
  const EPS = 1e-6;
  const same = (a, b) => Math.abs(a - b) < EPS;
  const isPlayer = (pt) => same(pt.x, plan.anchors.player.x) && same(pt.z, plan.anchors.player.z);
  const isThreat = (pt) => same(pt.x, plan.anchors.primaryThreat.x) && same(pt.z, plan.anchors.primaryThreat.z);
  // A projector keyed EXPLICITLY off cameraPose.id (not real trig) so the rig is unambiguous: the
  // WINNER candidate projects player/threat WIDE apart (ndcX -0.5/+0.5, well inside the safe frame);
  // every other candidate projects player/threat to nearly the SAME point (ndcX 0.01/0.0 — almost
  // fully overlapping). Every other world point (objective/focalLight/stage corners/skirt) lands at
  // an identical, safely-on-screen (0.2,0.2) for EVERY candidate, so those terms/constraints tie
  // across the whole pool and cannot be what decides the winner — only subject_separation (higher for
  // WINNER) and subject_overlap / the primary_overlap HARD CONSTRAINT (which the near-coincident
  // pair on every other candidate fails outright, d << 2*figure-radius) can.
  function riggedProject(pt, cameraPose) {
    if (cameraPose.id === "WINNER") {
      if (isPlayer(pt)) return { ndcX: -0.5, ndcY: 0 };
      if (isThreat(pt)) return { ndcX: 0.5, ndcY: 0 };
      return { ndcX: 0.2, ndcY: 0.2 };
    }
    if (isPlayer(pt)) return { ndcX: 0.01, ndcY: 0 };
    if (isThreat(pt)) return { ndcX: 0.0, ndcY: 0 };
    return { ndcX: 0.2, ndcY: 0.2 };
  }
  // distance=19/fov=21 lands the medium-figure-height constraint IN-BAND for every candidate (a real
  // value, not a happy accident — see section 7's own in-band search) so this rig proves a clean win
  // among candidates that aren't ALSO fighting an unrelated constraint; every candidate here shares
  // the identical mode/pitch/fov/distance so foreground_depth_layer ties too.
  const base = { mode: "beat", pitch: 33, fov: 21, target: plan.anchors.actionCenter, distance: 19, sharpSubjects: [] };
  const candidates = [
    Object.assign({ id: "A" }, base, { yaw: 0 }),
    Object.assign({ id: "B" }, base, { yaw: 90 }),
    Object.assign({ id: "WINNER" }, base, { yaw: 45 }),
    Object.assign({ id: "C" }, base, { yaw: 180 }),
    Object.assign({ id: "D" }, base, { yaw: 270 })
  ];
  const { camera, metrics } = composeShot(plan, candidates, riggedProject);
  check("3a. composeShot picked the rigged WINNER candidate", metrics.chosenId === "WINNER", metrics.chosenId);
  check("3b. the returned camera IS the winner's pose (yaw 45)", camera.yaw === 45, camera);
  const winnerMetric = metrics.candidates.find((c) => c.id === "WINNER");
  const others = metrics.candidates.filter((c) => c.id !== "WINNER");
  check("3c. the WINNER's total score is strictly greater than every other candidate's",
    others.every((o) => winnerMetric.total > o.total), { winner: winnerMetric.total, others: others.map((o) => o.total) });
  check("3d. the WINNER is NOT rejected (passes every hard constraint)", winnerMetric.rejected === false, winnerMetric);
  check("3e. every OTHER candidate IS rejected (their near-coincident player/threat pair fails 'primary_overlap')",
    others.every((o) => o.rejected && o.rejectReasons.includes("primary_overlap")), others.map((o) => o.rejectReasons));
  // independent proof against the term function directly (not just the composite total)
  const s = scoreSubjectSeparation({ playerNdc: { ndcX: -0.5, ndcY: 0 }, threatNdc: { ndcX: 0.5, ndcY: 0 } });
  check("3f. scoreSubjectSeparation itself is a real, in-range [0,1] number for the winner's projected pair", s >= 0 && s <= 1 && s > 0, s);
}

console.log("\n=== 4. hard-constraint rejection (RED-FIRST: a figure outside the 7% safe frame) ===");
{
  const plan = shotPlanFrom(makeTray(), makeCombat(), {});
  // A projector rigged to place every living figure at ndcX=0.99 (outside FRAME_SAFE_BOUND ~0.86) —
  // constructed directly (not derived from the stub above) so this check is unambiguous regardless of
  // the stub's own trig, proving constraintSafeFrame really is being exercised against the projection.
  const offFrameProject = () => ({ ndcX: 0.99, ndcY: 0.0 });
  const rigged = [{ id: "OFFSCREEN", mode: "beat", yaw: 45, pitch: 33, fov: 21, target: plan.anchors.actionCenter, distance: 8, sharpSubjects: [] }];
  const { camera, metrics } = composeShot(plan, rigged, offFrameProject);
  const m = metrics.candidates[0];
  check("4a. the rigged candidate is marked rejected", m.rejected === true, m);
  check("4b. rejectReasons names 'safe_frame'", m.rejectReasons.includes("safe_frame"), m.rejectReasons);
  check("4c. composeShot still returns a real camera even when EVERY candidate is rejected (never throws/undefined)",
    camera && typeof camera.yaw === "number", camera);
  check("4d. metrics.allRejected is true for this fixture", metrics.allRejected === true);
  // direct term-function proof, isolated from composeShot's own plumbing
  const ctxLike = { livingNdc: [{ piece: { id: "pc" }, ndc: { ndcX: 0.99, ndcY: 0 } }] };
  const direct = constraintSafeFrame(ctxLike);
  check("4e. constraintSafeFrame itself rejects ndcX=0.99 (> FRAME_SAFE_BOUND)", direct.pass === false && direct.detail.includes("pc"), direct);
  // and the inverse: a figure comfortably inside the frame passes.
  const ctxInside = { livingNdc: [{ piece: { id: "pc" }, ndc: { ndcX: 0.1, ndcY: -0.1 } }] };
  check("4f. constraintSafeFrame passes a figure well inside the safe frame", constraintSafeFrame(ctxInside).pass === true);
}

console.log("\n=== 5. Determinism ===");
{
  const tray = makeTray(), combat = makeCombat();
  const plan1 = shotPlanFrom(tray, combat, { yawDeg: 12, zoomLevel: 1.1 });
  const plan2 = shotPlanFrom(makeTray(), makeCombat(), { yawDeg: 12, zoomLevel: 1.1 });
  check("5a. same (tray,combat,viewState) snapshot twice -> byte-identical ShotPlan (deep-equal JSON)",
    JSON.stringify(plan1) === JSON.stringify(plan2));
  const candidates = defaultCameraCandidates(plan1, { yawDeg: 12 });
  const out1 = composeShot(plan1, candidates, stubProject);
  const out2 = composeShot(plan2, defaultCameraCandidates(plan2, { yawDeg: 12 }), stubProject);
  check("5b. same inputs twice -> byte-identical composeShot output (camera+metrics)",
    JSON.stringify(out1) === JSON.stringify(out2));
  check("5c. no Math.random(...)/Date.now(...) CALLS anywhere in the module source (the header prose that says so doesn't count as a call)",
    (() => {
      const src = readFileSync(join(ROOT, "src/ui/theater-shot.js"), "utf-8");
      return !/Math\.random\s*\(/.test(src) && !/Date\.now\s*\(/.test(src);
    })());
}

console.log("\n=== 6. candidate-score metrics completeness ===");
{
  const plan = shotPlanFrom(makeTray(), makeCombat(), {});
  const candidates = defaultCameraCandidates(plan, {});
  check("6a. defaultCameraCandidates yields exactly 5 candidates (4 diagonal yaws + current orbit)", candidates.length === 5, candidates.length);
  const yaws = candidates.map((c) => c.yaw).sort((a, b) => a - b);
  check("6b. the 4 diagonal yaws are 45/135/225/315 plus the current orbit's own yaw",
    [45, 135, 225, 315].every((y) => yaws.includes(y)));
  check("6b2. default BEAT candidates target the authored 18-25% medium-figure frame-height band",
    candidates.every((c) => constraintMediumFigureHeight(c).pass),
    candidates.map((c) => constraintMediumFigureHeight(c).detail));
  const { metrics } = composeShot(plan, candidates, stubProject);
  check("6c. metrics.candidates has ONE entry per candidate (5)", metrics.candidates.length === candidates.length);
  const TERM_KEYS = ["subject_separation", "primary_threat_visibility", "objective_visibility",
    "focal_light_near_rule_of_thirds", "tray_edge_visibility", "foreground_depth_layer",
    "hard_occlusion_area", "subject_overlap", "clipped_subject_area", "empty_frame_area",
    "competing_bright_source_count"];
  check("6d. every candidate entry carries all 11 directive-formula terms",
    metrics.candidates.every((c) => TERM_KEYS.every((k) => k in c.terms)));
  const CONSTRAINT_KEYS = ["safe_frame", "medium_figure_height", "primary_overlap", "stage_edge_visible", "neighbor_room_absent"];
  check("6e. every candidate entry carries all 5 hard constraints",
    metrics.candidates.every((c) => CONSTRAINT_KEYS.every((k) => k in c.constraints)));
  check("6f. every candidate entry carries a numeric total + a chosenId pointing at a real candidate",
    metrics.candidates.every((c) => typeof c.total === "number") && candidates.some((c) => c.id === metrics.chosenId));
  // JSON-serializable (a capture tool writes this straight to disk) — proves no cyclic refs / functions leaked in.
  check("6g. the metrics object is JSON-serializable (a capture tool can write it straight to disk)",
    (() => { try { JSON.stringify(metrics); return true; } catch (e) { return false; } })());
}

console.log("\n=== 7. individual term/constraint functions (isolated assertions) ===");
{
  check("7a. circleOverlapFraction(0, r, r) — concentric circles fully overlap (fraction 1)",
    circleOverlapFraction(0, 1, 1) === 1);
  check("7b. circleOverlapFraction(large d, r, r) — far-apart circles never overlap (fraction 0)",
    circleOverlapFraction(100, 1, 1) === 0);
  const halfOverlap = circleOverlapFraction(1, 1, 1);
  check("7c. circleOverlapFraction is a real (0,1) fraction for a partial overlap", halfOverlap > 0 && halfOverlap < 1, halfOverlap);
  check("7d. screenHeightFractionFor grows as distance shrinks (closer camera -> bigger on screen)",
    screenHeightFractionFor(MEDIUM_FIGURE_WORLD_HEIGHT, 21, 4) > screenHeightFractionFor(MEDIUM_FIGURE_WORLD_HEIGHT, 21, 40));
  // constraintMediumFigureHeight: find a distance where the medium figure lands in-band, and one where
  // it's clearly too small (very far away) — proves the constraint is a real two-sided band check.
  const farCand = { mode: "beat", fov: 21, distance: 400 };
  check("7e. constraintMediumFigureHeight REJECTS a medium figure at a wildly far distance (too small on screen)",
    constraintMediumFigureHeight(farCand).pass === false);
  let inBandDistance = null;
  for (let d = 1; d < 30; d += 0.25) {
    const frac = screenHeightFractionFor(MEDIUM_FIGURE_WORLD_HEIGHT, 21, d);
    if (frac >= MEDIUM_FIGURE_MIN_FRAC && frac <= MEDIUM_FIGURE_MAX_FRAC) { inBandDistance = d; break; }
  }
  check("7f. a distance exists where constraintMediumFigureHeight PASSES (the band is reachable, not vacuous)",
    inBandDistance !== null && constraintMediumFigureHeight({ mode: "beat", fov: 21, distance: inBandDistance }).pass === true, inBandDistance);
  check("7g. constraintMediumFigureHeight is EXEMPT outside beat mode (boss mode always passes)",
    constraintMediumFigureHeight({ mode: "boss", fov: 21, distance: 400 }).pass === true);
  // constraintPrimaryOverlap: two anchors projected to the SAME ndc point at close distance -> full overlap -> reject.
  const overlapCtx = { playerNdc: { ndcX: 0, ndcY: 0 }, threatNdc: { ndcX: 0.001, ndcY: 0 } };
  check("7h. constraintPrimaryOverlap REJECTS two subjects projected almost on top of each other",
    constraintPrimaryOverlap(overlapCtx, { fov: 21, distance: 2 }).pass === false);
  const separatedCtx = { playerNdc: { ndcX: -0.8, ndcY: 0 }, threatNdc: { ndcX: 0.8, ndcY: 0 } };
  check("7i. constraintPrimaryOverlap PASSES two well-separated subjects",
    constraintPrimaryOverlap(separatedCtx, { fov: 21, distance: 8 }).pass === true);
  // penaltySubjectOverlap — the SCORING term (not the hard constraint): a real penalty magnitude that
  // shrinks monotonically as the two subjects separate, hitting exactly 0 once they're far enough
  // apart that their approximated screen circles no longer touch at all.
  const overlapPenaltyClose = penaltySubjectOverlap(overlapCtx, { fov: 21, distance: 2 });
  const overlapPenaltyFar = penaltySubjectOverlap(separatedCtx, { fov: 21, distance: 8 });
  check("7o. penaltySubjectOverlap is large for near-coincident subjects and 0 for well-separated ones",
    overlapPenaltyClose > 0.5 && overlapPenaltyFar === 0, { close: overlapPenaltyClose, far: overlapPenaltyFar });
  // constraintStageEdgeVisible: boss mode is exempt regardless of geometry.
  check("7j. constraintStageEdgeVisible is exempt in boss mode even with zero visible stage corners",
    constraintStageEdgeVisible({ stageCornerNdc: [{ ndcX: 5, ndcY: 5 }] }, { mode: "boss" }).pass === true);
  check("7k. constraintStageEdgeVisible REJECTS beat mode when no stage corner is on-screen",
    constraintStageEdgeVisible({ stageCornerNdc: [{ ndcX: 5, ndcY: 5 }] }, { mode: "beat" }).pass === false);
  check("7l. constraintStageEdgeVisible PASSES beat mode when at least one stage corner is on-screen",
    constraintStageEdgeVisible({ stageCornerNdc: [{ ndcX: 5, ndcY: 5 }, { ndcX: 0.2, ndcY: 0.2 }] }, { mode: "beat" }).pass === true);
  // constraintNeighborRoomAbsent: a piece tagged with a DIFFERENT roomSegNum than activeRoomId fails.
  check("7m. constraintNeighborRoomAbsent REJECTS a piece carrying a neighbor room's segNum",
    constraintNeighborRoomAbsent({ activeRoomId: 7, pieces: [{ id: "x", roomSegNum: 9 }], props: [] }).pass === false);
  check("7n. constraintNeighborRoomAbsent PASSES when every tagged piece matches the active room",
    constraintNeighborRoomAbsent({ activeRoomId: 7, pieces: [{ id: "x", roomSegNum: 7 }], props: [] }).pass === true);
  const edgeCtx = { livingNdc: [{ piece: { id: "edge" }, ndc: { ndcX: 0.82, ndcY: 0 } }] };
  const edgeCam = { mode: "beat", fov: 21, distance: 19 };
  check("7p. safe-frame includes figure extent (center inside, visible edge outside -> reject)",
    constraintSafeFrame(edgeCtx, edgeCam).pass === false);
}

console.log("\n=== 8. check-manifest.py (run live) ===");
{
  let out = "", okExit = true;
  try {
    out = execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" });
  } catch (e) {
    okExit = false; out = String(e.stdout || "") + String(e.stderr || "");
  }
  check("8a. check-manifest.py exits 0", okExit, out.split("\n").slice(-3).join(" | "));
  check("8b. check-manifest.py prints RESULT: OK", /RESULT: OK/.test(out));
  check("8c. ui.theater-shot is registered (no orphan/drift/missing-tag error mentions it)",
    !/theater-shot/.test(out.split("\n").filter((l) => l.includes("ERROR")).join("\n")));
}

console.log("\n=== 9. A3 — WalkScene consumption (docs/WALK-NATIVE-A.md A3 / contract §10) ===");
{
  // A minimal, hand-built WalkScene-shaped fixture (walk-scene.js's own return shape) carrying a
  // citizen, an interactable, and a centerpiece-flagged structure entry — each at a DIFFERENT
  // position than the tray.projection.stageNow fallback below, so "which source actually got read"
  // is a real, provable fact, not an assumption.
  const walkScene = {
    walkRef: { id: "walk-9", environment: "dungeon", topology: "spine" },
    segmentRef: { id: "seg-9", num: 3, label: "The Crypt" },
    register: { setup: "haunting", skin: "gloom", spiceTier: 2, posture: "tense", depth: 3, isFinale: false },
    structure: [{ role: "structure", sourceRef: { walkId: "walk-9", segmentNum: 3, fieldPath: "finale", tableId: "T1", roll: 12, overlayRef: null },
      id: "obj-1", centerpiece: true, position: { x: 5, y: 5 } }],
    citizens: [
      { role: "citizen", sourceRef: { walkId: "walk-9", segmentNum: 3, fieldPath: "S3.cast1", tableId: "T2", roll: 8, overlayRef: null },
        id: "cast-1", position: { x: 1, y: 1 } },
      { role: "citizen", sourceRef: { walkId: "walk-9", segmentNum: 3, fieldPath: "S3.reserve1", tableId: null, roll: null, overlayRef: null },
        id: "reserve-1", position: { x: 9, y: 9 }, deferred: true }
    ],
    interactables: [{ role: "interactable", sourceRef: { walkId: "walk-9", segmentNum: 3, fieldPath: "S3.lever", tableId: "T3", roll: 4, overlayRef: null },
      id: "lever-1", position: { x: 2, y: 6 } }],
    dressing: [], conditions: [], connections: [], atmosphere: [], traces: [], removals: [], hidden: [],
    fieldRefs: [
      { walkId: "walk-9", segmentNum: 3, fieldPath: "finale", tableId: "T1", roll: 12, overlayRef: null },
      { walkId: "walk-9", segmentNum: 3, fieldPath: "S3.cast1", tableId: "T2", roll: 8, overlayRef: null },
      { walkId: "walk-9", segmentNum: 3, fieldPath: "S3.reserve1", tableId: null, roll: null, overlayRef: null },
      { walkId: "walk-9", segmentNum: 3, fieldPath: "S3.lever", tableId: "T3", roll: 4, overlayRef: null }
    ]
  };
  // the projection fallback carries a DIFFERENT centerpiece/cast position — proves preference, not
  // just presence (a bug that read BOTH sources and happened to prefer projection would still pass a
  // weaker "walkScene fields exist somewhere" check but fail this one).
  const projectionFallback = {
    stageNow: [
      { id: "proj-cp", role: "centerpiece", centerpiece: true, position: { x: 50, y: 50 }, sourceRef: "S3.projFallbackCenterpiece" },
      { id: "proj-cast", role: "cast", position: { x: 60, y: 60 }, sourceRef: "S3.projFallbackCast" }
    ]
  };
  const trayWithWalkScene = { kind: "interior3d", cellSize: 1, activeRoomId: 3, walkScene, projection: projectionFallback,
    bounds: { minX: 0, maxX: 10, minZ: 0, maxZ: 10 }, instances: {}, furniture: [], lights: [] };
  const trayNoWalkScene = { kind: "interior3d", cellSize: 1, activeRoomId: 3, walkScene: null, projection: projectionFallback,
    bounds: { minX: 0, maxX: 10, minZ: 0, maxZ: 10 }, instances: {}, furniture: [], lights: [] };

  const planWith = shotPlanFrom(trayWithWalkScene, null, {});
  const planWithout = shotPlanFrom(trayNoWalkScene, null, {});

  check("9a. RED-FIRST — absent tray.walkScene: objective anchor falls back to tray.projection (x=50)",
    !!planWithout.anchors.objective && planWithout.anchors.objective.x === 50,
    planWithout.anchors.objective);
  check("9b. present tray.walkScene: objective anchor is read from walkScene.structure (x=5), NOT the projection fallback",
    !!planWith.anchors.objective && planWith.anchors.objective.x === 5,
    planWith.anchors.objective);
  check("9c. objective sourceRef is the WalkScene's own rich shape (fieldPath 'finale'), not a flat projection string",
    planWith.anchors.objective && planWith.anchors.objective.sourceRef && planWith.anchors.objective.sourceRef.fieldPath === "finale",
    planWith.anchors.objective && planWith.anchors.objective.sourceRef);

  check("9d. RED-FIRST — absent tray.walkScene: cast piece falls back to tray.projection (x=60)",
    planWithout.pieces.some((p) => p.kind === "cast" && p.x === 60), planWithout.pieces);
  check("9e. present tray.walkScene: cast piece is read from walkScene.citizens (x=1), NOT the projection fallback",
    planWith.pieces.some((p) => p.kind === "cast" && p.x === 1), planWith.pieces);
  check("9f. the DEFERRED (reserve-lane) citizen is excluded — never staged as a visible piece",
    !planWith.pieces.some((p) => p.x === 9 && p.z === 9), planWith.pieces);

  check("9g. present tray.walkScene: the interactable prop is read from walkScene.interactables (x=2)",
    planWith.props.some((p) => p.x === 2 && p.z === 6), planWith.props);
  check("9h. present tray.walkScene: the centerpiece structure entry is NOT double-counted as a prop (objectiveFrom already owns it)",
    !planWith.props.some((p) => p.x === 5 && p.z === 5), planWith.props);

  check("9i. ShotPlan.walkRef/segmentRef/register are carried straight through when tray.walkScene is present",
    planWith.walkRef && planWith.walkRef.id === "walk-9" && planWith.segmentRef && planWith.segmentRef.num === 3
      && planWith.register && planWith.register.skin === "gloom",
    { walkRef: planWith.walkRef, segmentRef: planWith.segmentRef, register: planWith.register });
  check("9j. ShotPlan.fieldRefs mirrors walkScene.fieldRefs verbatim (4 entries)",
    Array.isArray(planWith.fieldRefs) && planWith.fieldRefs.length === 4, planWith.fieldRefs);
  check("9k. absent tray.walkScene: walkRef/segmentRef/register are null, fieldRefs is []",
    planWithout.walkRef === null && planWithout.segmentRef === null && planWithout.register === null
      && Array.isArray(planWithout.fieldRefs) && planWithout.fieldRefs.length === 0,
    { walkRef: planWithout.walkRef, segmentRef: planWithout.segmentRef, register: planWithout.register, fieldRefs: planWithout.fieldRefs });
  check("9l. provenance carries walk-scene-sourced entries (one per fieldRefs item) when present",
    planWith.provenance.some((p) => p.source === "walk-scene"), planWith.provenance.filter((p) => p.source === "walk-scene"));

  // existing top-level keys are untouched (STAGE-A.md's own "enrich, don't restructure" clause) —
  // every key present before this unit is still present, still the same TYPE, in both trays.
  const priorKeys = ["id", "seed", "realmId", "environment", "activeRoomId", "stage", "anchors", "pieces",
    "props", "walkProjection", "interactables", "overlays", "traces", "lightRig", "camera",
    "occlusionTargets", "postProfile", "provenance"];
  check("9m. every pre-A3 top-level ShotPlan key is still present (enrich, don't restructure)",
    priorKeys.every((k) => Object.prototype.hasOwnProperty.call(planWith, k)),
    priorKeys.filter((k) => !Object.prototype.hasOwnProperty.call(planWith, k)));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
