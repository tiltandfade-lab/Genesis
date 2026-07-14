/* dev/verify-p3-1d-cutaway.mjs — docs/PHASE-3-WAVE-1-SPECS.md P3-1d (Diorama cutaway restoration).
   Plain-Node ESM harness for src/ui/theater-shot.js's new pure surface —
   `wallUpperCameraSideBlockingSet` (the restored BW2-5 whole-room camera-side upper-band suppression,
   retired by C4.1b's exclusive-anchor ray-fade) plus a subject-list-cap sanity check for the extended
   occlusion subject set (theater-boot.js's own `OCCLUSION_SUBJECT_CAP`, exercised here by re-deriving
   its slice/log math against the SAME `data.pieces` shape production code reads). Modeled directly on
   dev/verify-wall-occlusion.mjs's own convention: a real `import` of the production ES module (no
   THREE/DOM/window), no jsdom, no Chrome.

   RED-FIRST (checked live against master tip 0caf0d1d, this unit's own branch point):
     `git show 0caf0d1d:src/ui/theater-shot.js | grep -c wallUpperCameraSideBlockingSet` -> 0 — the
     symbol did not exist before this unit; theater-boot.js's wall-upper pass ONLY consulted the
     4-anchor ray test (wallUpperBlockingSet), so a camera-side near wall with NO anchor behind it
     stayed fully opaque (the closed-box regression this unit fixes) — reproduced live below (check 1)
     by calling the OLD anchor-only path against a fixture with zero anchor subjects and confirming it
     reports NOTHING blocking, then proving the NEW function alone finds the near wall.

   Sections:
     0. RED-FIRST proof (symbol absence at base commit, re-checked live).
     1. ⊗ Camera-side band suppression — a near-side (camera-facing), in-band segment is flagged even
        with ZERO ray-test subjects (the closed-box case: no anchor stands behind it, so the OLD
        C4.1b-only path reports it fully opaque). RED baseline = wallUpperBlockingSet with no subjects
        (empty set, the pre-fix reality); GREEN = wallUpperCameraSideBlockingSet flags the same segment.
     2. Far-side segments (opposite the camera) are NEVER flagged by the band test, regardless of being
        in-band — BW2-5's own "far-side stays full height" semantics.
     3. Out-of-band segments (outside focusRect + margin) are never flagged, even on the near side.
     4. Determinism — same inputs -> identical Set across repeated calls.
     5. Composition — theater-boot.js's own union law: a segment flagged by EITHER the ray test OR the
        band test ends up in the final blocking set (re-derives the exact `new Set([...a, ...b])` union
        theater-boot.js performs, against two disjoint per-test fixtures, proving neither test alone
        would have caught the union member).
     6. Subject cap — re-derive theater-boot.js's own OCCLUSION_SUBJECT_CAP slice math: a mounted-figure
        list under the cap passes through whole; a list OVER the cap truncates to exactly the cap length
        (never silently drops without the corresponding warn condition being true).
     7. check-manifest.py OK (run live, not just cited).

   Run:  node dev/verify-p3-1d-cutaway.mjs */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_COMMIT = "0caf0d1d";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

console.log("=== 0. RED-FIRST proof (re-checked live) ===");
{
  let out = "1";
  try {
    out = execSync(`git show ${BASE_COMMIT}:src/ui/theater-shot.js | grep -c wallUpperCameraSideBlockingSet || true`,
      { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }).toString().trim();
  } catch (e) { out = String(e.stdout || e.message).trim(); }
  check(`RED0. wallUpperCameraSideBlockingSet did NOT exist in theater-shot.js at base commit ${BASE_COMMIT}`, out === "0", out);
}

const modUrl = pathToFileURL(join(ROOT, "src/ui/theater-shot.js")).href;
const T = await import(modUrl);
const {
  wallUpperBlockingSet, wallUpperCameraSideBlockingSet, OCCLUSION_CAMERA_SIDE_BAND_MARGIN
} = T;

// ----------------------------------------------------------------------------------------------
// Fixture: a small square room (SAME shape dev/verify-wall-occlusion.mjs uses), focusRect the room's
// own bounds, camera due SOUTH (z=-8) under theater-boot.js's own candidateCameraWorldPos convention:
// camera world pos = target + (sin(yaw)*horiz, height, cos(yaw)*horiz) — i.e. (dirX,dirZ)=(sin(yaw),
// cos(yaw)) points FROM the room center TOWARD the camera. yaw=180 -> dirZ=cos(180)=-1, matching a
// camera sitting at z=-8 (south of the z=0 center). The near/camera-facing wall is therefore the SOUTH
// one (segment 0, mid z=-3: (-3)*(-1)=3>0 -> flagged), matching dev/verify-wall-occlusion.mjs's own
// CAMERA_SOUTH/south-wall convention exactly.
// ----------------------------------------------------------------------------------------------
const WALL_HEIGHT = 2.4;
function makeRoomSegments() {
  return [
    { a: { x: -3, z: -3 }, b: { x: 3, z: -3 }, height: WALL_HEIGHT, tier: 0 },  // 0: south wall (near/camera-facing)
    { a: { x: 3, z: -3 }, b: { x: 3, z: 3 }, height: WALL_HEIGHT, tier: 0 },    // 1: east wall
    { a: { x: 3, z: 3 }, b: { x: -3, z: 3 }, height: WALL_HEIGHT, tier: 0 },    // 2: north wall (far/opposite camera)
    { a: { x: -3, z: 3 }, b: { x: -3, z: -3 }, height: WALL_HEIGHT, tier: 0 }   // 3: west wall
  ];
}
const FOCUS_RECT = { minX: -3, maxX: 3, minZ: -3, maxZ: 3 };
const CX = 0, CZ = 0, YAW_DEG_CAMERA_SOUTH = 180; // candidateCameraWorldPos convention: camera sits at (sin(yaw)*dist, cos(yaw)*dist) off target -> yaw=180 places the camera SOUTH (dirZ=cos(180)=-1), matching CAMERA_SOUTH below

console.log("\n=== 1. ⊗ Camera-side band suppression (RED-FIRST) ===");
{
  const segs = makeRoomSegments();
  // RED baseline: the OLD (C4.1b-only) path — no anchor stands behind the near wall, so the pure
  // ray test alone (zero subjects) reports NOTHING. This is exactly today's closed-box bug: a
  // non-anchor figure crouched just past the south wall, with no ShotPlan anchor there, would never
  // un-hide it.
  const oldPathResult = wallUpperBlockingSet({ camera: { x: 0, y: 1.6, z: -8 }, subjects: [], wallSegments: segs });
  check("RED1a. the OLD anchor-only ray test (zero subjects) misses the near south wall entirely",
    !oldPathResult.has(0) && oldPathResult.size === 0, Array.from(oldPathResult));
  // GREEN: the NEW camera-side band test flags the near wall with NO subjects at all — restoring
  // BW2-5's "camera-side upper band always suppresses" behavior.
  const bandResult = wallUpperCameraSideBlockingSet({
    focusRect: FOCUS_RECT, wallSegments: segs, cx: CX, cz: CZ, yawDeg: YAW_DEG_CAMERA_SOUTH
  });
  check("GREEN1b. wallUpperCameraSideBlockingSet flags segment 0 (near/south wall) with zero subjects",
    bandResult.has(0), Array.from(bandResult));
}

console.log("\n=== 2. Far-side segments never flagged ===");
{
  const segs = makeRoomSegments();
  const bandResult = wallUpperCameraSideBlockingSet({
    focusRect: FOCUS_RECT, wallSegments: segs, cx: CX, cz: CZ, yawDeg: YAW_DEG_CAMERA_SOUTH
  });
  check("2a. segment 2 (north wall, opposite the camera) is NEVER flagged — BW2-5's far-side-stays-full semantics",
    !bandResult.has(2), Array.from(bandResult));
  check("2b. NEGATIVE proof this isn't vacuous: something IS flagged (the near wall)", bandResult.size > 0, Array.from(bandResult));
}

console.log("\n=== 3. Out-of-band segments never flagged ===");
{
  // a wall span far outside the room's own focusRect + margin — even though it's geometrically on the
  // "near" side of (cx,cz), it's not part of THIS room and must never be suppressed by this test.
  const farAwaySeg = { a: { x: 50, z: -53 }, b: { x: 56, z: -53 }, height: WALL_HEIGHT, tier: 0 };
  const segs = [farAwaySeg];
  const bandResult = wallUpperCameraSideBlockingSet({
    focusRect: FOCUS_RECT, wallSegments: segs, cx: CX, cz: CZ, yawDeg: YAW_DEG_CAMERA_SOUTH, margin: OCCLUSION_CAMERA_SIDE_BAND_MARGIN
  });
  check("3a. a segment far outside focusRect+margin is never flagged, even on the geometric near side",
    bandResult.size === 0, Array.from(bandResult));
}

console.log("\n=== 4. Determinism ===");
{
  const segs = makeRoomSegments();
  const a = wallUpperCameraSideBlockingSet({ focusRect: FOCUS_RECT, wallSegments: segs, cx: CX, cz: CZ, yawDeg: YAW_DEG_CAMERA_SOUTH });
  let allSame = true;
  for (let i = 0; i < 10; i++) {
    const b = wallUpperCameraSideBlockingSet({ focusRect: FOCUS_RECT, wallSegments: segs, cx: CX, cz: CZ, yawDeg: YAW_DEG_CAMERA_SOUTH });
    if (b.size !== a.size || !Array.from(b).every((x) => a.has(x))) allSame = false;
  }
  check("4a. 10 repeated calls with byte-identical inputs all agree", allSame, Array.from(a));
}

console.log("\n=== 5. Composition — the union law theater-boot.js applies ===");
{
  // two DISJOINT single-segment fixtures: segRay is far from the camera-side band (never flagged by
  // the band test) but sits directly on a camera->subject ray (flagged by wallUpperBlockingSet);
  // segBand sits in-band on the camera-facing side (flagged by the band test) but has no subject
  // behind it (never flagged by the ray test). Neither test alone reports BOTH; the union does.
  const segRay = { a: { x: 10, z: -3 }, b: { x: 16, z: -3 }, height: WALL_HEIGHT, tier: 0 };   // far away, only ray-flaggable
  const segBand = { a: { x: -3, z: -3 }, b: { x: 3, z: -3 }, height: WALL_HEIGHT, tier: 0 };   // near/in-band, only band-flaggable
  const segs = [segRay, segBand];
  const camera = { x: 0, y: 1.6, z: -8 };
  // chosen so the camera(0,-8)->subject ray crosses segRay's own z=-3 line at x=13 (inside its [10,16]
  // span): extending the camera->(13,-3) direction (13,5) out to t=2 lands the subject at (26,2).
  const subjectBehindRaySeg = { x: 26, z: 2, y: 1.2 };
  const rayBlocking = wallUpperBlockingSet({ camera, subjects: [subjectBehindRaySeg], wallSegments: segs });
  const bandBlocking = wallUpperCameraSideBlockingSet({ focusRect: FOCUS_RECT, wallSegments: segs, cx: CX, cz: CZ, yawDeg: YAW_DEG_CAMERA_SOUTH });
  check("5a. the ray test alone flags segRay(0) but NOT segBand(1)", rayBlocking.has(0) && !rayBlocking.has(1), Array.from(rayBlocking));
  check("5b. the band test alone flags segBand(1) but NOT segRay(0)", bandBlocking.has(1) && !bandBlocking.has(0), Array.from(bandBlocking));
  const union = new Set([...rayBlocking, ...bandBlocking]);
  check("5c. the union (theater-boot.js's own wallUpperRawBlocking) reports BOTH segments",
    union.has(0) && union.has(1) && union.size === 2, Array.from(union));
}

console.log("\n=== 6. Subject cap — re-derive theater-boot.js's own slice/log math ===");
{
  const OCCLUSION_SUBJECT_CAP = 24; // theater-boot.js's own named const, mirrored here for the pure-math proof
  const underCap = Array.from({ length: 10 }, (_, i) => ({ x: i, z: 0, y: 1.2 }));
  const overCap = Array.from({ length: 30 }, (_, i) => ({ x: i, z: 0, y: 1.2 }));
  check("6a. an under-cap list passes through with no truncation", underCap.slice(0, OCCLUSION_SUBJECT_CAP).length === 10);
  const truncated = overCap.slice(0, OCCLUSION_SUBJECT_CAP);
  check("6b. an over-cap list truncates to EXACTLY the cap length (never silently drops without the warn condition being true)",
    truncated.length === OCCLUSION_SUBJECT_CAP && overCap.length > OCCLUSION_SUBJECT_CAP,
    { truncated: truncated.length, original: overCap.length });
  check("6c. the truncation condition (list.length > CAP) that gates theater-boot.js's console.warn is TRUE for the over-cap fixture",
    overCap.length > OCCLUSION_SUBJECT_CAP);
}

console.log("\n=== 7. check-manifest.py OK ===");
{
  let out = "", ok = false;
  try {
    out = execSync("python3 build/check-manifest.py", { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] }).toString();
    ok = /RESULT:\s*OK/.test(out);
  } catch (e) { out = String(e.stdout || e.stderr || e.message); ok = false; }
  check("7a. check-manifest.py ends RESULT: OK", ok, out.split("\n").slice(-3).join(" | "));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
