/* Clayroom camera-pose survival across a viewport resize.

   THE DEFECT THIS GATES (found while fixing CL-F07a round 4, fixed separately because it changes
   behaviour on all six benches): window resize -> S.resizeHandler -> placeCamera(), which re-fits
   the camera to the HOST ROOM and hard-resets S.camera.far to `camDist + FOG_FAR + 20`
   (src/ui/theater-camera.js:346/353/360/396 — an absolute assignment, not grow-only). Nothing
   re-applied the clay pose afterwards, so the governed pan/zoom (S.clayCamOffset / S.clayCamZoom)
   and — since round 4 made the far plane part of the pose — the grown clip range were silently
   discarded. On the CL-F07 terrain bench's 24x24 sheet the camera parks 115.98 from its target
   inside a 116.63 far plane, so everything more than 0.65 units beyond the target left the
   frustum: half the field, clipped on a plane perpendicular to the view axis, which reads as a
   clean diagonal across the grid. The captures never saw it because the capture rig never resizes.

   This probe drives the REAL page and the REAL governed pose, then resizes the viewport the way a
   live viewer does. It asserts geometry, never appearance — whether the ground looks like ground
   is Adam's call and Codex's, never this script's.

   Usage:  node dev/verify-clay-camera-resize.cjs [port]
   With no port it serves this worktree itself on 5177 and shuts the server down on exit.
*/
const path = require("path");
const { spawn } = require("child_process");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const ROOT = path.resolve(__dirname, "..");
const ARG_PORT = process.argv[2] || null;
const PORT = ARG_PORT || "5177";
const BASE = "http://127.0.0.1:" + PORT;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/* Viewport A is the capture rig's own framing, so a pass here means the banked frames' pose is the
   one under test. Viewport B changes BOTH extents and the aspect ratio, because the fit is
   aspect-dependent: a resize that preserved aspect would let a stale fit pass by luck. */
const VIEWPORT_A = { width: 1280, height: 720, deviceScaleFactor: 2 };
const VIEWPORT_B = { width: 980, height: 900, deviceScaleFactor: 2 };
/* A pan no fit would produce by accident. The ZOOM is deliberately left at the scene's own
   governed value (the sheet fits at 2.048x, dollied well OUT) rather than a made-up one: dollying
   IN shrinks the distance to the target and would let the far-plane assertion pass trivially,
   which is the opposite of the case that clipped the field. */
const TEST_OFFSET = { x: 3.5, z: -2.25 };

let passed = 0, failed = 0;
function ok(name, cond, detail){
  if(cond){ passed++; console.log("  ✓ " + name); }
  else { failed++; console.log("  ✗ " + name + (detail ? " — " + detail : "")); }
}

/* The theater's state object is closure-scoped, so everything here goes through the file's
   established window.Theater._*ForTest seams — the same surface the capture rig reads. */
function readPose(){
  const T = window.Theater || {};
  const p = T._clayCamPoseForTest ? T._clayCamPoseForTest() : null;
  if(!p) return { ok: false };
  return Object.assign({ ok: true,
    /* The physical question the far plane has to answer: is the whole posed content sphere inside
       the frustum? This is the number that was false when half the sheet vanished. */
    farNeeded: (p.dist != null && p.contentRadius != null) ? p.dist + p.contentRadius : null
  }, p);
}

(async () => {
  let server = null;
  if(!ARG_PORT){
    server = spawn("python3", ["-m", "http.server", PORT, "--bind", "127.0.0.1"],
      { cwd: ROOT, stdio: "ignore" });
    await new Promise((r) => setTimeout(r, 900));
  }
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"] });
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport(VIEWPORT_A);
    const url = BASE + "/genesis.html?clayroom=1&clayfixture=terrain&terrainscene=thirteen-piece-sheet";
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(
      () => document.querySelector("canvas") && document.getElementById("clay-room-overlay"),
      { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 4500)); // the CR-1 settle timeline the capture rig uses

    console.log("clay camera pose survival across resize — CL-F07 terrain sheet");

    const mounted = await page.evaluate(readPose);
    ok("the bench mounted with the clay diagnostic active", mounted.ok && mounted.diagnosticActive,
      JSON.stringify({ ok: mounted.ok, active: mounted.diagnosticActive }));
    ok("the mounted pose already fits its content inside the far plane",
      mounted.farNeeded != null && mounted.far >= mounted.farNeeded,
      "far=" + (mounted.far || 0).toFixed(2) + " needed=" + (mounted.farNeeded || 0).toFixed(2));

    /* Establish a governed pose the way the art director does, through the same entry point the
       drag and wheel handlers use, so this tests the shipped path and not a bespoke one. */
    await page.evaluate((off) => {
      window.Theater._clayCamPoseSetForTest(off, null); // pan only; the scene keeps its own zoom
    }, TEST_OFFSET);
    await new Promise((r) => setTimeout(r, 300));
    const posed = await page.evaluate(readPose);
    ok("the scene is dollied OUT, so the far plane is load-bearing here",
      posed.zoom != null && posed.zoom > 1.2, "zoom=" + posed.zoom);
    ok("the governed pan moved the camera off its fit",
      posed.fitPos != null && Math.hypot(posed.pos[0] - posed.fitPos[0], posed.pos[2] - posed.fitPos[2]) > 0.5,
      JSON.stringify({ pos: posed.pos, fit: posed.fitPos }));
    ok("the posed camera still fits its content inside the far plane",
      posed.farNeeded != null && posed.far >= posed.farNeeded,
      "far=" + (posed.far || 0).toFixed(2) + " needed=" + (posed.farNeeded || 0).toFixed(2));

    /* THE RESIZE. puppeteer's setViewport fires the page's own resize event, so this is the live
       viewer's path (window resize -> S.resizeHandler -> placeCamera), not a synthetic call. */
    await page.setViewport(VIEWPORT_B);
    await new Promise((r) => setTimeout(r, 1200));
    const after = await page.evaluate(readPose);

    ok("the viewport actually changed aspect", Math.abs(after.aspect - posed.aspect) > 0.05,
      "before=" + posed.aspect.toFixed(3) + " after=" + after.aspect.toFixed(3));
    ok("the governed pan survived the resize",
      after.offset && Math.abs(after.offset.x - TEST_OFFSET.x) < 1e-6
        && Math.abs(after.offset.z - TEST_OFFSET.z) < 1e-6,
      JSON.stringify(after.offset));
    ok("the governed zoom survived the resize",
      after.zoom != null && Math.abs(after.zoom - posed.zoom) < 1e-6,
      "before=" + posed.zoom + " after=" + after.zoom);
    /* THE SHARP ONE. posedAt is what clayRoomApplyCamPose last put the camera at — its own record,
       not a second copy of the pose math. If the camera has drifted off it, the last thing to place
       the camera was placeCamera's host fit and the pose was never re-applied. Comparing against
       the captured FIT instead would pass spuriously: after a resize the stale fit no longer equals
       where the host just put the camera, so "not on the fit" is true even when the pose is lost. */
    ok("the camera sits where the pose last put it, not where the host re-fitted it",
      after.posedAt != null
        && Math.hypot(after.pos[0] - after.posedAt[0], after.pos[1] - after.posedAt[1],
                      after.pos[2] - after.posedAt[2]) < 1e-4,
      JSON.stringify({ pos: after.pos, posedAt: after.posedAt }));
    /* The regression itself: before the fix the far plane reverted to the host room's own clip
       range and the content sphere no longer fit inside it — which is what clipped half the sheet. */
    ok("the far plane still contains the posed content sphere",
      after.farNeeded != null && after.far >= after.farNeeded,
      "far=" + (after.far || 0).toFixed(2) + " needed=" + (after.farNeeded || 0).toFixed(2));

    console.log("\n" + passed + " passed, " + failed + " failed.");
  } catch (e) {
    failed++;
    console.log("  ✗ harness error — " + e.message);
  } finally {
    await browser.close();
    if(server) server.kill();
  }
  process.exit(failed ? 1 : 0);
})();
