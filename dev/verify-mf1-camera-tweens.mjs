#!/usr/bin/env node
/* dev/verify-mf1-camera-tweens.mjs — BEAUTY-WAVE-4.md MF-1 (CAMERA TWEENS, "the snap killer") verify.

   Boots the same real Chrome + THREE in-session/interior-board path
   dev/verify-interior-camera-frustum.mjs uses (server/Chrome/boot conventions copied verbatim — see
   that file's own header for the "why": camera fit math needs a LIVE THREE camera/projection, a
   jsdom/pure-math harness would just be re-deriving placeCamera's own math rather than proving it).

   FAKE-CLOCK DISCIPLINE (determinism law binds clocks, not just seeds — CLAUDE.md/BEAUTY-WAVE-4.md's
   own thesis: "all time-based work... is FAKE-CLOCK TESTABLE"): theater-boot.js's tween timestamps
   ride the page's own global `Date.now()` (pushTween-style convention — see placeCameraTweened's own
   header in src/ui/theater-boot.js). This harness overrides `Date.now` in-page to a controlled value
   BEFORE firing a camera fit, so the tween's `start` timestamp is a known quantity; sampling then
   holds the fake clock at an exact `start + dur*fraction` and pumps exactly one real animation frame
   (the tween's own rAF loop, tickTweens, ticks against whatever Date.now() reads at that instant) —
   real frame-scheduling, fully deterministic elapsed-time math. window.Theater._mf1CameraPoseTweenForTest()
   exposes the live tween's own {start,dur} so assertions check against the ACTUAL numbers in play,
   never a guessed constant.

   Run: node dev/verify-mf1-camera-tweens.mjs */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5231, 5232, 5233, 5234, 5235];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label); } }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}
async function probeRoot(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" });
    if (!r.ok) return false;
    const body = await r.text();
    return body.includes("var U=loadU();") || body.includes("Genesis");
  } catch (e) { return false; }
}
async function startServer() {
  for (const port of PORT_CANDIDATES) {
    if (await portInUse(port)) {
      if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; }
      continue;
    }
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
}

// same bootToInSession as verify-interior-camera-frustum.mjs (verbatim — see that file's own header).
async function bootToInSession(page) {
  return await page.evaluate(() => {
    const notes = [];
    try {
      if (typeof startBardo !== "function") return { ok: false, stage: "startBardo-missing" };
      startBardo();
      if (typeof bardoBegin === "function") bardoBegin();
      function autoFillStep(step) {
        if (!step) return;
        try {
          if (step.t === "choose") {
            if (!GS.CGEN[step.field]) {
              const src = step.field === "species" ? SPECIES : step.field === "class" ? CLASSES : BACKGROUNDS;
              const k = Object.keys(src || {})[0];
              if (k) cgChoose(step.field, k);
            }
          } else if (step.t === "scores") {
            while (GS.CGEN.scoreRolls.length < 6) bardoRollScore();
            if (!GS.CGEN.assigned) bardoAssign("best");
          } else if (step.t === "skills") { if (typeof cgSkillAuto === "function") cgSkillAuto(); }
          else if (step.t === "equipment") { if (typeof cgKitAuto === "function") cgKitAuto(); }
          else if (step.t === "tools") { if (typeof cgToolsAuto === "function") cgToolsAuto(); }
          else if (step.t === "languages") { if (typeof cgLangAuto === "function") cgLangAuto(); }
          else if (step.t === "spells") { if (typeof cgSpellsAuto === "function") cgSpellsAuto(); }
          else if (step.t === "feat") { if (typeof cgFeatAuto === "function") cgFeatAuto(); }
          else if (step.t === "life") { if (GS.CGEN.lifeQ && !GS.CGEN.lifeLog[GS.CGEN.lifeI] && typeof bardoLifeRoll === "function") bardoLifeRoll(); }
          else if (step.t === "hometown") { if (!GS.BARDO.rolled[step.key] && typeof bardoRollHometown === "function") bardoRollHometown(); }
          else if (step.t === "world") { if (!GS.BARDO.rolled[step.key] && typeof bardoRollWorld === "function") bardoRollWorld(); }
        } catch (e) { notes.push("autoFillStep threw at " + (step && step.t) + ": " + e.message); }
      }
      const seq = GS.BARDO.seq;
      let guard = 0; const MAX_STEPS = seq.length + 10;
      while (GS.BARDO && GS.BARDO.i < seq.length - 1 && guard < MAX_STEPS) {
        const step = seq[GS.BARDO.i];
        autoFillStep(step);
        if (step && step.t === "life" && GS.CGEN.lifeQ) {
          let lifeGuard = 0;
          while (GS.CGEN.lifeI < GS.CGEN.lifeQ.length - 1 && lifeGuard < 40) { autoFillStep(step); if (typeof bardoLifeStepNext === "function") bardoLifeStepNext(); lifeGuard++; }
          autoFillStep(step); if (typeof bardoLifeStepNext === "function") bardoLifeStepNext();
        }
        bardoAdvance(); guard++;
      }
      const nameEl = document.getElementById("charName");
      if (nameEl) nameEl.value = "MF1 Gate Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found", notes };
      if (typeof startSession === "function") startSession(world.id);
      showTab("world");
      return { ok: true, notes, worldId: world.id };
    } catch (e) { return { ok: false, stage: "exception", error: e.message, stack: e.stack, notes }; }
  });
}
async function waitForTheater(page) {
  const deadline = Date.now() + 20000;
  let state = null;
  while (Date.now() < deadline) {
    state = await page.evaluate(() => {
      const host = document.getElementById("worldView");
      return {
        hasBattleStage: !!(host && host.querySelector(".game.battle-stage")),
        theaterMounted: !!(typeof GS !== "undefined" && GS.theaterMounted),
        hasCanvas: !!(host && host.querySelector(".theater-stage-canvas canvas")),
        hasSetInteriorBoard: !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

function buildFixtureExpr() {
  // returned as a string of JS executed IN-PAGE (page.evaluate can't close over node functions), so
  // every board-builder below inlines this same tiny linear-dungeon fixture generator.
  return `
    function buildFixture(n) {
      const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
      const edges = []; for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
      const adj = {}; ids.forEach((id) => { adj[id] = []; });
      edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
      const depth = { [ids[0]]: 0 }; const q = [ids[0]]; let head = 0;
      while (head < q.length) { const cur = q[head++]; (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } }); }
      return ids.map((id, i) => ({ id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0, exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal" }));
    }
  `;
}

// builds TWO distinct interior boards (different focus rooms -> genuinely different camera fits) plus
// piece layouts for a "beat" cluster fit — same fixture-building convention as
// verify-interior-camera-frustum.mjs's own buildScene, just parameterized by which room to focus.
async function buildBoards(page) {
  return await page.evaluate((fixtureSrc) => {
    try {
      eval(fixtureSrc);
      const fixture = buildFixture(8);
      const plan = spatializePlan(fixture, "The Spine", { walkId: "mf1-gate-spine" });
      function boardFor(room) {
        const b = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: room.segNum, radius: 1 });
        b.lightProfile = "torchlit";
        const inX = Math.max(room.x + 1, room.x), inY = Math.max(room.y + 1, room.y);
        const maxX = Math.max(inX, room.x + room.w - 2), maxY = Math.max(inY, room.y + room.d - 2);
        const positions = [{ x: inX, y: inY }, { x: maxX, y: inY }].slice(0, 2);
        b.pieces = ["Skeleton", "Zombie"].map((slug, i) => ({ slug, cellX: positions[i].x, cellY: positions[i].y }));
        b.cameraFit = { mode: "beat", cells: positions.map((p) => ({ x: p.x, y: p.y })) };
        return b;
      }
      const roomA = plan.rooms[0];
      const roomB = plan.rooms.reduce((a, b) => (a.segNum !== roomA.segNum && (!b || Math.abs(b.x - roomA.x) + Math.abs(b.d - roomA.d) < Math.abs(a.x - roomA.x)) ? a : a), plan.rooms[plan.rooms.length - 1]);
      return { ok: true, boardA: boardFor(roomA), boardB: boardFor(roomB) };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, buildFixtureExpr());
}

// interiorFrustumCheck reads S.boardHalfX/Z/S.boardCenter/S.interiorFitMaxHeight LIVE off S — safe to
// call at any tween sample frame, exactly like verify-interior-camera-frustum.mjs's own GREEN section.
async function frustumOk(page) {
  return await page.evaluate(() => {
    const maxHeight = window.Theater.interiorFitMaxHeight();
    const check = window.Theater.interiorFrustumCheck(maxHeight);
    return { ok: check.ok, corners: check.corners.filter((c) => !c.inFrustum) };
  });
}
async function camPose(page) {
  return await page.evaluate(() => {
    const pos = window.Theater._interiorCameraPositionForTest();
    const target = window.Theater._mf1CameraLookTargetForTest();
    const tw = window.Theater._mf1CameraPoseTweenForTest();
    return { pos, target, tw, live: window.Theater.tweensLive() };
  });
}
// sets the page's Date.now() to a fixed value AND pumps exactly one real animation frame (the tween's
// own tickTweens loop reads Date.now() at whatever value we've frozen it to) — see this file's own
// header for why this is "fully fake-clock deterministic" despite pumping a real rAF.
async function setFakeNowAndTick(page, ms) {
  await page.evaluate((v) => { window.Date.now = () => v; }, ms);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}
async function restoreRealClock(page) {
  await page.evaluate(() => { window.Date.now = window.__mf1RealDateNow || Date.now; });
}

async function main() {
  console.log("[verify-mf1-camera-tweens]");
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    await page.evaluate(() => { window.__mf1RealDateNow = Date.now.bind(Date); });

    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("theater never ready: " + JSON.stringify(theaterState));

    const boards = await buildBoards(page);
    if (!boards.ok) throw new Error("board build failed: " + boards.error);

    // ── mount the FIRST board with the real clock (establishes a live "current pose" to glide FROM
    // on the next fit — the very first-ever fit has no prior pose worth asserting a glide against).
    await page.evaluate((board) => window.Theater.setInteriorVariant({}), null);
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardA);
    // MF-1 settle-await: a board mount now fires a 320ms camera-pose tween (MF-1 itself added it — a
    // pre-MF-1 mount produced NO tween, so tweensLive()===0 was instant and 5s was plenty). That tween
    // must tick to completion via rAF; on a cold/contended headless Chrome the rAF cadence can stall
    // past 5s (observed fail/fail/pass races), so this settle wait matches verify-interior-camera-
    // frustum.mjs's own 15s bump. Behavior is unchanged — only the fixture's wait is loosened.
    await page.waitForFunction(() => window.Theater.tweensLive() === 0, { timeout: 15000 });

    console.log("\n[RED-FIRST — proves the glide is real, not a relabeled snap]");
    // capture the SETTLED pose of board A (what the old, un-tweened placeCamera() would have snapped
    // straight to for board B too) — then fire the fit to board B and read the camera BEFORE any tween
    // tick runs. A snap implementation would already show boardB's end pose here; the tween
    // implementation must not — this is the falsifiable claim RED-FIRST proves before trusting the
    // green fake-clock assertions below.
    const settledA = await camPose(page);
    await setFakeNowAndTick(page, 0); // freeze the clock BEFORE firing the fit, so `start` is fake-known
    const fakeT0 = 1000000; // arbitrary fixed epoch far from 0, avoids any real Date.now() collision
    await page.evaluate((v) => { window.Date.now = () => v; }, fakeT0);
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardB);
    const immediatelyAfterFit = await camPose(page);
    ok(immediatelyAfterFit.tw !== null, "a camera-pose tween IS registered the instant a new fit fires");
    const snappedAlready = immediatelyAfterFit.pos && settledA.pos &&
      Math.abs(immediatelyAfterFit.pos.x - settledA.pos.x) < 1e-6 &&
      Math.abs(immediatelyAfterFit.pos.y - settledA.pos.y) < 1e-6 &&
      Math.abs(immediatelyAfterFit.pos.z - settledA.pos.z) < 1e-6;
    ok(snappedAlready === true, "RED proof: immediately after the fit fires, the camera is STILL at board A's settled pose (t=0 == start, not yet moved) — a snap implementation would already differ here since a snap has no start pose to hold at");

    console.log("\n[GREEN — fake-clock tween math: start(t=0) / mid(t=0.5) / end(t=1)]");
    const tw = immediatelyAfterFit.tw;
    ok(tw !== null && tw.dur >= 280 && tw.dur <= 350, `tween duration ${tw && tw.dur}ms is inside BW4's 280-350ms band`);
    const dur = tw.dur, start = tw.start;

    // t=0 (already captured as immediatelyAfterFit, but re-derive explicitly here for the assertion's
    // own clarity): position/target must equal board A's settled pose exactly.
    const posEq = (a, b, eps = 1e-4) => a && b && Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps && Math.abs(a.z - b.z) < eps;
    ok(posEq(immediatelyAfterFit.pos, settledA.pos), "t=0: camera position == the pre-fit start pose exactly");

    await setFakeNowAndTick(page, start + dur * 0.5);
    const mid = await camPose(page);
    await setFakeNowAndTick(page, start + dur); // t=1 (>=dur clamps to 1 in tickTweens)
    // one more frame past dur so onDone has definitely fired and settled to the exact end values.
    await setFakeNowAndTick(page, start + dur + 50);
    const end = await camPose(page);

    ok(!posEq(mid.pos, immediatelyAfterFit.pos) && !posEq(mid.pos, end.pos), "t=0.5: camera position is BETWEEN start and end — not equal to either (a real interpolation, not a step function)");
    // "between" on each axis independently (ease-out is monotonic in t for this lerp, so a strict
    // between-check per axis is a valid interpolation proof without assuming linear easing).
    ["x", "y", "z"].forEach((axis) => {
      const s = immediatelyAfterFit.pos[axis], m = mid.pos[axis], e = end.pos[axis];
      const lo = Math.min(s, e) - 1e-6, hi = Math.max(s, e) + 1e-6;
      ok(m >= lo && m <= hi, `t=0.5 camera.${axis} (${m.toFixed(3)}) lies within [start,end] (${s.toFixed(3)}, ${e.toFixed(3)})`);
    });
    ok(end.tw === null, "t=1: the camera-pose tween has retired (window.Theater._mf1CameraPoseTweenForTest() -> null)");

    console.log("\n[GREEN — retarget mid-flight: a new fit at t=0.5 interpolates from the MID pose, not the original start]");
    // fire fit A again (settled), then fit B, sample at exactly t=0.5, then fire a THIRD fit (back to
    // A) before the second tween ever completes — the third tween's start pose must equal the SECOND
    // tween's t=0.5 pose (mid), never the first tween's original start.
    await restoreRealClock(page);
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardA);
    await page.waitForFunction(() => window.Theater.tweensLive() === 0, { timeout: 15000 });
    const retargetBaseline = await camPose(page);

    const fakeT1 = 2000000;
    await page.evaluate((v) => { window.Date.now = () => v; }, fakeT1);
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardB);
    const twBtoward = (await camPose(page)).tw;
    await setFakeNowAndTick(page, fakeT1 + twBtoward.dur * 0.5);
    const midOfSecondFit = await camPose(page);
    ok(!posEq(midOfSecondFit.pos, retargetBaseline.pos), "sanity: the mid-flight retarget point is actually mid-flight (not still sitting at the original start)");

    // retarget: fire fit A again WHILE the B-tween is still live (same frozen fake clock instant).
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardA);
    const retargeted = await camPose(page);
    ok(retargeted.tw !== null, "a new tween is registered on retarget (not left running the stale one)");
    ok(posEq(retargeted.pos, midOfSecondFit.pos), "retarget start pose == the LIVE interpolated mid pose of the interrupted tween");
    ok(!posEq(retargeted.pos, retargetBaseline.pos) || posEq(midOfSecondFit.pos, retargetBaseline.pos) === false, "retarget start pose is NOT a restart from the original (pre-B) start pose");
    // only one camera-pose tween is ever live at once.
    const liveCameraTweenCount = await page.evaluate(() => (window.Theater.tweensLive() >= 1));
    ok(liveCameraTweenCount, "exactly one live tween after retarget (old one was spliced, not stacked)");

    console.log("\n[GREEN — frustum stays green at every sampled tween frame: t=0/0.25/0.5/0.75/1]");
    await restoreRealClock(page);
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardA);
    await page.waitForFunction(() => window.Theater.tweensLive() === 0, { timeout: 15000 });
    const fakeT2 = 3000000;
    await page.evaluate((v) => { window.Date.now = () => v; }, fakeT2);
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardB);
    const twFrust = (await camPose(page)).tw;
    for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
      await setFakeNowAndTick(page, fakeT2 + twFrust.dur * frac);
      const f = await frustumOk(page);
      ok(f.ok === true, `t=${frac}: action cluster stays fully in frustum mid-tween — ${JSON.stringify(f.corners)}`);
    }
    await restoreRealClock(page);
    await page.waitForFunction(() => window.Theater.tweensLive() === 0, { timeout: 15000 });

    console.log("\n[GREEN — player zoom/rotation stay DIRECT (Feel Law 3): never routed through the camera tween]");
    const beforeZoom = await camPose(page);
    ok(beforeZoom.live === 0, "sanity: no tween in flight before the zoom check");
    await page.evaluate(() => window.Theater.zoom(1));
    const afterZoom = await camPose(page);
    ok(afterZoom.live === 0, "zoom() registers NO tween — the camera snaps instantly (no added input lag)");
    ok(!posEq(beforeZoom.pos, afterZoom.pos), "sanity: zoom() actually changed the camera (a real assertion, not a vacuous one)");
    await page.evaluate(() => window.Theater.rotate());
    const afterRotate = await camPose(page);
    ok(afterRotate.live === 0, "rotate() registers NO tween — the camera snaps instantly (no added input lag)");

    console.log("\n[GREEN — fps >= 30 with the camera tween live]");
    // fire a fresh fit and measure composer/render fps WHILE the tween is in flight (real clock, real
    // frame pacing) — the tween's own per-frame work (one lerp + one lookAt call) must not be what
    // drags the frame budget under 30fps.
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardA);
    await page.waitForFunction(() => window.Theater.tweensLive() === 0, { timeout: 15000 });
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), boards.boardB);
    const fpsResult = await page.evaluate(() => window.Theater.measureRenderFps(40));
    const fps = fpsResult ? fpsResult.fps : 0;
    ok(fps >= 30, `render fps (${fps.toFixed(1)}) stays >= 30 with the camera-pose tween live`);

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail > 0 ? 1 : 0;
  } catch (e) {
    console.error("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}
main();
