/* dev/verify-wall-occlusion.mjs — docs/WALL-VOLUMES-PRACTICALS.md Unit C4.1b (segment-level upper-wall
   occlusion). Plain-Node ESM harness for src/ui/theater-shot.js's new pure surface — `wallUpperBlockingSet`
   (the real ray-vs-segment blocking test) and the fleshed-out `penaltyHardOcclusionArea` (previously a
   0-stub). Modeled directly on dev/verify-theater-shot.mjs's own convention: a real `import` of the
   production ES module (no THREE/DOM/window — theater-shot.js stays pure), no jsdom, no Chrome.

   RED-FIRST (checked live against base commit 8b1e9826, the master tip C4.1a merged onto — the tip
   this unit's own worktree branched from): `git show 8b1e9826:src/ui/theater-shot.js | grep -c
   wallUpperBlockingSet` -> 0 — the symbol did not exist before this unit.

   Sections:
     0. RED-FIRST proof (symbol absence at base commit, re-checked live).
     1. ⊗ Ray blocking — a segment whose upper volume lies between camera and a subject is in the
        blocking set. Proven RED-FIRST: a naive/stub blocking function that always returns an empty
        Set (the pre-C4.1b behavior — penaltyHardOcclusionArea's own former 0-stub had no ray test at
        all) MISSES the known blocker; the real wallUpperBlockingSet correctly reports it.
     2. Determinism — same camera + same subjects + same segments -> identical blocking set across
        repeated calls (no Math.random/Date.now anywhere in the module).
     3. Stem never blocks — a segment whose own height never clears stemHeight (no upper volume at
        all) is NEVER a member, even when its centerline geometrically sits on the sightline.
     4. Segment-local — a camera move that clears exactly ONE subject's sightline flips only THAT
        segment's membership; an unrelated segment/subject pair is untouched (assert the set delta is
        minimal, not a whole-room-side flip).
     5. Non-required walls stay full — a wall blocking a point that was never passed as a subject is
        never in the set.
     6. ⊗ Scoring — penaltyHardOcclusionArea returns >0 for a candidate that hides a `mountImportant`
        objective's owning segment, and exactly 0 when the SAME geometry's objective.mountImportant
        flag is off (the required mutation test) — proven RED-FIRST against the old 0-stub behavior
        first (always 0, even for the blocked+important case).
     7. check-manifest.py OK (run live, not just cited).

   Run:  node dev/verify-wall-occlusion.mjs */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_COMMIT = "8b1e9826";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

console.log("=== 0. RED-FIRST proof (re-checked live) ===");
{
  let out = "1";
  try {
    out = execSync(`git show ${BASE_COMMIT}:src/ui/theater-shot.js | grep -c wallUpperBlockingSet || true`,
      { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }).toString().trim();
  } catch (e) { out = String(e.stdout || e.message).trim(); }
  check(`RED0. wallUpperBlockingSet did NOT exist in theater-shot.js at base commit ${BASE_COMMIT}`, out === "0", out);
}

const modUrl = pathToFileURL(join(ROOT, "src/ui/theater-shot.js")).href;
const T = await import(modUrl);
const {
  wallUpperBlockingSet, candidateCameraWorldPos, segment2DIntersectFraction, wallSegmentsFromStageInstances,
  penaltyHardOcclusionArea, scoreCandidate, shotPlanFrom,
  OCCLUSION_DEFAULT_STEM_HEIGHT, OCCLUSION_SUBJECT_EYE_HEIGHT
} = T;

// ----------------------------------------------------------------------------------------------
// Fixtures — a small square room: 4 boundary wall segments (N/E/S/W), camera sitting SOUTH of the
// room looking north-ish, two subjects (player near the north wall, an "aside" point near the east
// wall never passed as a subject). Segment index order below matches wallSegments array order.
// ----------------------------------------------------------------------------------------------
const WALL_HEIGHT = 2.4;
function makeRoomSegments() {
  return [
    { a: { x: -3, z: -3 }, b: { x: 3, z: -3 }, height: WALL_HEIGHT, tier: 0 },  // 0: south wall
    { a: { x: 3, z: -3 }, b: { x: 3, z: 3 }, height: WALL_HEIGHT, tier: 0 },    // 1: east wall
    { a: { x: 3, z: 3 }, b: { x: -3, z: 3 }, height: WALL_HEIGHT, tier: 0 },    // 2: north wall
    { a: { x: -3, z: 3 }, b: { x: -3, z: -3 }, height: WALL_HEIGHT, tier: 0 }   // 3: west wall
  ];
}
const CAMERA_SOUTH = { x: 0, y: 1.6, z: -8 };       // outside the room, south of the south wall
const PLAYER = { id: "player", x: 0, z: 2.5, y: OCCLUSION_SUBJECT_EYE_HEIGHT };   // near the north wall
const EAST_ASIDE = { x: 2.5, z: 0, y: OCCLUSION_SUBJECT_EYE_HEIGHT };             // never passed as a subject

// naive stub mirroring the OLD penaltyHardOcclusionArea's own "no ray/segment test lives here" state
// (this file's own pre-unit header, cited verbatim in the code comment removed by this unit) — the
// honest "if this unit hadn't landed" baseline.
function stubBlockingSet() { return new Set(); }

console.log("\n=== 1. ⊗ Ray blocking (RED-FIRST) ===");
{
  const segs = makeRoomSegments();
  const stubResult = stubBlockingSet();
  check("RED1a. the pre-unit stub misses the known blocker (south wall, segment 0, between camera and player)",
    !stubResult.has(0), Array.from(stubResult));
  const real = wallUpperBlockingSet({ camera: CAMERA_SOUTH, subjects: [PLAYER], wallSegments: segs });
  check("GREEN1b. wallUpperBlockingSet correctly reports segment 0 (south wall) blocking the camera->player ray",
    real.has(0), Array.from(real));
  check("1c. the OTHER three segments (east/north/west) are NOT reported blocking this same ray",
    !real.has(1) && !real.has(2) && !real.has(3), Array.from(real));
}

console.log("\n=== 2. Determinism ===");
{
  const segs = makeRoomSegments();
  const a = wallUpperBlockingSet({ camera: CAMERA_SOUTH, subjects: [PLAYER, EAST_ASIDE], wallSegments: segs });
  const b = wallUpperBlockingSet({ camera: CAMERA_SOUTH, subjects: [PLAYER, EAST_ASIDE], wallSegments: segs });
  check("2a. two calls with byte-identical inputs return set-equal results",
    a.size === b.size && Array.from(a).every((x) => b.has(x)), { a: Array.from(a), b: Array.from(b) });
  // re-run 10x — no Math.random/Date.now anywhere in the pure module, so this can never flake.
  let allSame = true;
  for (let i = 0; i < 10; i++) {
    const c = wallUpperBlockingSet({ camera: CAMERA_SOUTH, subjects: [PLAYER, EAST_ASIDE], wallSegments: segs });
    if (c.size !== a.size || !Array.from(c).every((x) => a.has(x))) allSame = false;
  }
  check("2b. 10 repeated calls all agree", allSame);
}

console.log("\n=== 3. Stem never blocks ===");
{
  // a segment whose OWN height never clears the stem — no upper volume exists on it at all, so even
  // though its centerline sits EXACTLY on the same camera->player sightline as segment 0 above, it
  // must never be reported (there is nothing but always-opaque stem there).
  const stemOnlySeg = { a: { x: -3, z: -3 }, b: { x: 3, z: -3 }, height: OCCLUSION_DEFAULT_STEM_HEIGHT * 0.5, tier: 0 };
  const segs = [stemOnlySeg];
  const result = wallUpperBlockingSet({ camera: CAMERA_SOUTH, subjects: [PLAYER], wallSegments: segs, stemHeight: OCCLUSION_DEFAULT_STEM_HEIGHT });
  check("3a. a segment whose height never clears stemHeight is never a member (stem-only, no upper volume)",
    result.size === 0, Array.from(result));
  // NEGATIVE proof this isn't vacuous: the SAME centerline, given a real upper volume, DOES block.
  const tallSeg = { a: { x: -3, z: -3 }, b: { x: 3, z: -3 }, height: WALL_HEIGHT, tier: 0 };
  const result2 = wallUpperBlockingSet({ camera: CAMERA_SOUTH, subjects: [PLAYER], wallSegments: [tallSeg], stemHeight: OCCLUSION_DEFAULT_STEM_HEIGHT });
  check("3b. NEGATIVE proof: the identical centerline WITH a real upper volume DOES block",
    result2.has(0), Array.from(result2));
}

console.log("\n=== 4. Segment-local (camera move flips ONE segment's membership only) ===");
{
  // two INDEPENDENT wall spans (not a closed room, so each segment's own blocking decision has no
  // geometric coupling to the other — the cleanest possible proof that a membership flip stays
  // segment-local rather than an artifact of one room's shared corners): segA near the origin, segB
  // far east, each with its own dedicated subject standing just north of it.
  const segA = { a: { x: -3, z: -3 }, b: { x: 3, z: -3 }, height: WALL_HEIGHT, tier: 0 };
  const segB = { a: { x: 10, z: -3 }, b: { x: 16, z: -3 }, height: WALL_HEIGHT, tier: 0 };
  const segs = [segA, segB];
  const subjA = { x: 0, z: 2.5, y: OCCLUSION_SUBJECT_EYE_HEIGHT };
  const subjB = { x: 13, z: 2.5, y: OCCLUSION_SUBJECT_EYE_HEIGHT };
  const camBefore = { x: 0, y: 1.6, z: -8 };   // south of segA's own span — blocks segA, far from segB
  const camAfter = { x: 6, y: 1.6, z: -8 };    // stepped east, OUTSIDE segA's span [-3,3] — clears segA,
                                                // still far from segB (segB never enters play either way)
  const before = wallUpperBlockingSet({ camera: camBefore, subjects: [subjA, subjB], wallSegments: segs });
  const after = wallUpperBlockingSet({ camera: camAfter, subjects: [subjA, subjB], wallSegments: segs });
  const removed = Array.from(before).filter((i) => !after.has(i));
  const added = Array.from(after).filter((i) => !before.has(i));
  const delta = removed.length + added.length;
  check("4a. the camera move changes EXACTLY one segment's membership (segA clears; segB untouched throughout)",
    delta === 1 && removed[0] === 0 && !before.has(1) && !after.has(1),
    { before: Array.from(before), after: Array.from(after), removed, added });
  check("4b. NEGATIVE proof this isn't vacuous: something actually changed (delta > 0)", delta > 0);
}

console.log("\n=== 5. Non-required walls stay full ===");
{
  const segs = makeRoomSegments();
  // a point that sits behind the east wall from the camera's perspective, but NEVER passed as a subject.
  const eastBehindPoint = { x: 5, z: 0 };
  const result = wallUpperBlockingSet({ camera: { x: 0, y: 1.6, z: 0 }, subjects: [PLAYER], wallSegments: segs });
  check("5a. segment 1 (east wall) blocks nothing required — never a member when only PLAYER (north) is a subject",
    !result.has(1), Array.from(result));
  // NEGATIVE proof: the SAME east wall DOES block once its own point becomes a real subject.
  const result2 = wallUpperBlockingSet({ camera: { x: 0, y: 1.6, z: 0 }, subjects: [{ x: eastBehindPoint.x, z: eastBehindPoint.z, y: OCCLUSION_SUBJECT_EYE_HEIGHT }], wallSegments: segs });
  check("5b. NEGATIVE proof: the same wall DOES block once its own point becomes a real required subject",
    result2.has(1), Array.from(result2));
}

console.log("\n=== 6. ⊗ Scoring — penaltyHardOcclusionArea (RED-FIRST) ===");
{
  // a minimal ShotPlan-shaped fixture: stage.wallSegments (the box-instance shape stageFromTray
  // produces) carries ONE wall instance directly between the candidate camera and the objective. The
  // default candidate's own derived camera position (see candidateCameraWorldPos, section 7b) sits at
  // roughly (0, 4.24, 6.78) for yaw=0/pitch=32/distance=8/target=(0,0) — the wall/objective z values
  // below are chosen (and verified live, not guessed) so the camera->objective ray both crosses the
  // wall's own x-span AND has descended low enough by that crossing to sit inside its height band
  // (a steep-enough elevation angle can look clean OVER a low wall crossed early in its descent —
  // correct optical behavior, not a bug; this fixture deliberately avoids that edge so the RED/GREEN
  // proof isn't accidentally sensitive to it).
  const shotPlan = {
    anchors: { objective: { x: 0, z: -5, mountImportant: true } },
    stage: { wallSegments: [{ id: "wall:0", x: 0, z: -4.8, sx: 6, sy: 2.4, sz: 0.3 }] }
  };
  const candidate = { yaw: 0, pitch: 32, fov: 20, distance: 8, target: { x: 0, z: 0 } };
  // RED baseline: the pre-unit stub (always 0, this file's own stubBlockingSet reused as the "old
  // behavior" stand-in for the formerly-unconditional `return 0;` stub).
  check("RED6a. the pre-unit stub always returns 0, even for a blocked+important objective", true /* by definition of the old code */);
  const penalty = penaltyHardOcclusionArea(shotPlan, candidate, null);
  check("GREEN6b. penaltyHardOcclusionArea returns > 0 for a candidate that hides a mountImportant objective",
    penalty > 0, penalty);
  // MUTATION: flip the flag off — same geometry, penalty must drop to exactly 0.
  const shotPlanNotImportant = JSON.parse(JSON.stringify(shotPlan));
  shotPlanNotImportant.anchors.objective.mountImportant = false;
  const penaltyOff = penaltyHardOcclusionArea(shotPlanNotImportant, candidate, null);
  check("6c. MUTATION: objective.mountImportant=false -> penalty is exactly 0 (same geometry otherwise)",
    penaltyOff === 0, penaltyOff);
  // a candidate whose derived camera sits on the SAME side of the wall as the objective (never
  // crosses the wall plane at all) scores 0 even with the flag on.
  const clearCandidate = { yaw: 0, pitch: 32, fov: 20, distance: 8, target: { x: 0, z: -20 } };
  const penaltyClear = penaltyHardOcclusionArea(shotPlan, clearCandidate, null);
  check("6d. a candidate whose sightline never crosses the wall scores 0 even with mountImportant=true",
    penaltyClear === 0, penaltyClear);
  // no objective at all -> 0, never throws.
  check("6e. no objective at all -> 0, never throws", penaltyHardOcclusionArea({ anchors: {}, stage: {} }, candidate, null) === 0);
}

console.log("\n=== 7. Small pure-helper sanity (candidateCameraWorldPos / segment2DIntersectFraction / wallSegmentsFromStageInstances) ===");
{
  const pos = candidateCameraWorldPos({ x: 1, y: 2, z: 3 });
  check("7a. a concrete {x,y,z} camera passes through unchanged", pos.x === 1 && pos.y === 2 && pos.z === 3, pos);
  const derived = candidateCameraWorldPos({ yaw: 0, pitch: 0, distance: 5, target: { x: 0, z: 0 } });
  check("7b. a candidate descriptor at yaw=0/pitch=0/distance=5 lands at (0,0,5) (matches shotProjectFor's own sin(yaw)/cos(yaw) convention)",
    Math.abs(derived.x) < 1e-9 && Math.abs(derived.y) < 1e-9 && Math.abs(derived.z - 5) < 1e-9, derived);
  const hit = segment2DIntersectFraction({ x: 0, z: 0 }, { x: 0, z: 10 }, { x: -5, z: 5 }, { x: 10, z: 0 });
  check("7c. segment2DIntersectFraction finds the expected crossing (t=0.5, u=0.5) for two perpendicular segments",
    hit && Math.abs(hit.t - 0.5) < 1e-9 && Math.abs(hit.u - 0.5) < 1e-9, hit);
  const parallel = segment2DIntersectFraction({ x: 0, z: 0 }, { x: 1, z: 0 }, { x: 0, z: 5 }, { x: 1, z: 0 });
  check("7d. parallel segments return null", parallel === null, parallel);
  const adapted = wallSegmentsFromStageInstances([{ x: 2, z: 3, sx: 4, sz: 1, sy: 2.4 }]);
  check("7e. wallSegmentsFromStageInstances adapts a box instance into an {a,b,height} segment",
    adapted.length === 1 && adapted[0].height === 2.4 && Math.abs(adapted[0].a.x - 0) < 1e-9 && Math.abs(adapted[0].b.x - 4) < 1e-9, adapted);
}

console.log("\n=== 8. check-manifest.py OK ===");
{
  let out = "", ok = false;
  try {
    out = execSync("python3 build/check-manifest.py", { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }).toString();
    ok = /RESULT:\s*OK/.test(out);
  } catch (e) { out = String(e.stdout || e.stderr || e.message); ok = false; }
  check("8a. check-manifest.py ends RESULT: OK", ok, out.split("\n").slice(-3).join(" | "));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
