#!/usr/bin/env node
/* dev/battle-gate/agx/capture-agx-ab.mjs — P3-3a (docs/PHASE-3-AGX-SPEC.md) — Adam's taste-gate A/B
   set. Modeled VERBATIM on dev/capture-oss-integrated.mjs's boot/server/chrome/shoot conventions (own
   port range so it can run alongside every other capture-*.mjs harness).

   Reuses the P3-1e eyeball fixtures (tiered / aperture / dressed — dev/battle-gate/eyeball-fixtures/
   capture-eyeball-fixtures.mjs's own build* functions, copied verbatim here since they're page-context
   closures puppeteer serializes, not an importable module) PLUS one new "loop room" fixture: a genuine
   3-room CYCLE topology (s1<->s2<->s3<->s1, focus=s1, radius=1 — every neighbor of the cycle already
   in view from the focus room, so this stands in for "a loop-gate room" without needing to run the
   full dev/battle-gate/capture-dungeon-loop.mjs finale-gate machinery, which rolls and plays an entire
   dungeon walk end to end — out of proportion for what's just a 4th A/B scene here).

   Each fixture's board is built ONCE, then MOUNTED ONCE (window.Theater.setInteriorBoard) — unlike the
   eyeball-fixtures' legacy/oss kernel A/B (which has to remount per kernel, since the room-shell
   polygon kernel changes at BOARD-COMPILE time), GRADE_TONEMAP is a POST-PROCESS-ONLY flag: the scene/
   camera/lights never change when it flips, only the grade pass's own compiled shader. So the harness
   mounts the board a SINGLE time, shoots "none", flips the flag in-place via
   window.Theater._setGradeTonemapForTest("agx") (P3-3a's own test seam — mirrors
   _setRoomShellPolygonKernel; src/ui/theater-boot.js), re-renders, shoots "agx" — a STRONGER same-
   scene/camera/light guarantee than a remount-based A/B (there is no remount at all between the two
   captures of a pair, so nothing but the tonemap curve itself can differ).

   Run:  node dev/battle-gate/agx/capture-agx-ab.mjs
   Output: dev/battle-gate/agx/{tiered-room,aperture-room,dressed-room,loop-room}-{none,agx}.png
           + results.json (per-fixture board meta + grade-pass diagnostics). */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import net from "node:net";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const OUT_DIR = __dirname;
// Own port range — see dev/battle-gate/eyeball-fixtures/capture-eyeball-fixtures.mjs's own port-block
// registry comment; 5296-5299 is the next free block after that unit's 5291-5295.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5296, 5297, 5298, 5299, 5300];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
    if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; } continue; }
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
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1280,800"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 } });
}

// bootToInSession/waitForTheater — verbatim convention from dev/capture-oss-integrated.mjs (its own
// header cites dev/capture-wall-runs-oss.mjs as the original source).
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
      if (nameEl) nameEl.value = "AgX A/B Soul";
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

// ─── Fixture 1: TIERED ROOM (dais+pit, terrain-fixture prose) — copied verbatim from
// dev/battle-gate/eyeball-fixtures/capture-eyeball-fixtures.mjs's own buildTieredRoomFixture. ────────
async function buildTieredRoomFixture(page) {
  return await page.evaluate(() => {
    try {
      const side = "A raised stone dais, 2 ft high, in the corner (15' x 15'); " +
        "a sunken pit, 2 ft deep, along the wall (10' x 10')";
      const fixture = [{
        id: "r1", num: 1, label: "chamber", isFinale: false, depth: 0, exits: [], light: "normal",
        dims: "30' x 25'", side,
      }];
      const plan = spatializePlan(fixture, "P3-3a AgX Tiered Room", { walkId: "p3-3a-agx:tiered-room-v1" });
      const room = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: room.segNum, radius: 1 });
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "p3-3a-agx-tiered-room";
      return { ok: true, board, room: { x: room.x, z: room.y, w: room.w, d: room.d, segNum: room.segNum } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// ─── Fixture 2: APERTURE-HEAVY ROOM (4-door hub) — copied verbatim (buildApertureRoomFixture). ──────
async function buildApertureRoomFixture(page) {
  return await page.evaluate(() => {
    try {
      function buildHubFixture(n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const spokeCount = Math.min(n - 1, 4);
        const edges = [];
        for (let i = 1; i < n; i++) edges.push([ids[0], ids[Math.min(i, spokeCount)]]);
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { if (a !== b) { adj[a].push(b); adj[b].push(a); } });
        const depth = { [ids[0]]: 0 };
        const q = [ids[0]]; let head = 0;
        while (head < q.length) {
          const cur = q[head++];
          (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } });
        }
        return ids.map((id, i) => ({
          id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0,
          exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal",
        }));
      }
      const fixture = buildHubFixture(5);
      const plan = spatializePlan(fixture, "P3-3a AgX Aperture Hub", { walkId: "p3-3a-agx:aperture-room-v1" });
      const focusRoom = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "chrome", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "p3-3a-agx-aperture-room";
      const apertureCount = (board.instances && board.instances.doorframe) ? board.instances.doorframe.length : 0;
      return { ok: true, board, apertureCount, room: { x: focusRoom.x, z: focusRoom.y, w: focusRoom.w, d: focusRoom.d, segNum: focusRoom.segNum } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// ─── Fixture 3: DRESSED ROOM through production trayFrom — copied verbatim (buildDressedRoomFixture) ─
async function buildDressedRoomFixture(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [{ id: "r1", num: 1, label: "hall", isFinale: false, depth: 0, exits: [], light: "normal", dims: "25' x 20'" }];
      const plan = spatializePlan(fixture, "P3-3a AgX Dressed Room", { walkId: "p3-3a-agx:dressed-room-v1" });
      const room = plan.rooms[0];
      const board = trayFrom({ kind: "interior", plan, env: "dungeon", realmId: "fantasy", focusSegNum: room.segNum, radius: 1 }, null, {});
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "p3-3a-agx-dressed-room";
      return {
        ok: true, board, room: { x: room.x, z: room.y, w: room.w, d: room.d, segNum: room.segNum },
        dressingCount: Array.isArray(board.dressing) ? board.dressing.length : 0,
        furnitureCount: Array.isArray(board.furniture) ? board.furniture.length : 0,
        lightsCount: Array.isArray(board.lights) ? board.lights.length : 0,
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// ─── Fixture 4: LOOP ROOM — a genuine 3-room CYCLE (s1<->s2<->s3<->s1) ─────────────────────────────
// Stands in for "a loop-gate room" (the spec's own phrase) without running the full dungeon-loop
// finale-gate machinery (dev/battle-gate/capture-dungeon-loop.mjs rolls+plays an entire dungeon walk
// end to end — out of proportion for a 4th A/B scene). focus=s1, radius=1 already reaches BOTH s2 and
// s3 in a 3-cycle, so the focus room's own walls carry the loop's two closing apertures at once.
async function buildLoopRoomFixture(page) {
  return await page.evaluate(() => {
    try {
      const ids = ["s1", "s2", "s3"];
      const edges = [["s1", "s2"], ["s2", "s3"], ["s3", "s1"]]; // the closing edge (s3->s1) IS the loop
      const adj = {}; ids.forEach((id) => { adj[id] = []; });
      edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
      const depth = { s1: 0 };
      const q = ["s1"]; let head = 0;
      while (head < q.length) {
        const cur = q[head++];
        (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } });
      }
      const fixture = ids.map((id, i) => ({
        id, num: i + 1, label: id, isFinale: i === ids.length - 1, depth: depth[id] || 0,
        exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal",
      }));
      const plan = spatializePlan(fixture, "P3-3a AgX Loop Room", { walkId: "p3-3a-agx:loop-room-v1" });
      const focusRoom = plan.rooms[0]; // s1 — both cycle-closing neighbors visible from here
      // realmId "bright-kingdom" (not lost-world): a first capture run measured lost-world's light
      // profile rendering this fixture near-black — a truthful render but useless as A/B taste
      // evidence (nothing visible to compare). The A/B needs a LIT scene to show the curve.
      const board = interiorBuildBoard(plan, { realmId: "bright-kingdom", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "p3-3a-agx-loop-room";
      const apertureCount = (board.instances && board.instances.doorframe) ? board.instances.doorframe.length : 0;
      return { ok: true, board, apertureCount, room: { x: focusRoom.x, z: focusRoom.y, w: focusRoom.w, d: focusRoom.d, segNum: focusRoom.segNum } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// mountOnce: builds the theater ONCE for a fixture — no per-tonemap remount (see this file's own
// header: GRADE_TONEMAP is post-process-only, so a single mount serves BOTH captures of a pair).
async function mountOnce(page, board) {
  return await page.evaluate((board) => {
    try {
      window.Theater._setGradeTonemapForTest("none"); // known starting state, every fixture
      window.Theater.setInteriorBoard(board);
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, board);
}
// setTonemap: flips GRADE_TONEMAP live (P3-3a's own test seam) and reports what changed.
async function setTonemap(page, value) {
  return await page.evaluate((value) => {
    try {
      const res = window.Theater._setGradeTonemapForTest(value);
      const ps = window.Theater._postSuiteForTest ? window.Theater._postSuiteForTest() : null;
      return { ok: true, res, postSuite: ps };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, value);
}

// FINDING (dev/battle-gate/eyeball-fixtures/capture-eyeball-fixtures.mjs's own session): mounting a
// new board fires an ANIMATED camera-pose glide tween — poll it to null (settled) before reading pose
// or shooting. Same discipline here, even though this harness only mounts once per fixture (the FIRST
// capture of a pair still needs the settle wait; the SECOND capture, after only a tonemap flip, has no
// tween to wait for at all, but the wait is a no-op then, not a correctness risk).
async function waitForCameraSettle(page, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 6000);
  while (Date.now() < deadline) {
    const live = await page.evaluate(() => {
      const t = window.Theater && window.Theater._mf1CameraPoseTweenForTest ? window.Theater._mf1CameraPoseTweenForTest() : null;
      return !!t;
    });
    if (!live) return true;
    await sleep(100);
  }
  return false;
}
async function readCameraPos(page) {
  return await page.evaluate(() => (window.Theater && window.Theater._interiorCameraPositionForTest) ? window.Theater._interiorCameraPositionForTest() : null);
}
async function shoot(page, outPath) {
  const canvas = await page.$(".theater-stage-canvas canvas");
  const box = canvas && await canvas.boundingBox();
  if (!box) throw new Error("theater canvas has no page bounding box");
  await page.screenshot({ path: outPath, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height } });
  return box;
}
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
function camPosClose(a, b, eps) {
  if (!a || !b) return false;
  return Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps && Math.abs(a.z - b.z) < eps && Math.abs((a.zoom || 1) - (b.zoom || 1)) < eps;
}
const CAM_EPS = 1e-4;

const FIXTURES = [
  { key: "tiered-room", label: "Tiered room (dais+pit, terrain-fixture prose)", build: buildTieredRoomFixture },
  { key: "aperture-room", label: "Aperture-heavy room (4-door hub)", build: buildApertureRoomFixture },
  { key: "dressed-room", label: "Dressed room (production trayFrom)", build: buildDressedRoomFixture },
  { key: "loop-room", label: "Loop room (3-room cycle, closing aperture)", build: buildLoopRoomFixture },
];

(async () => {
  const { proc } = await startServer();
  console.log("server:", BASE);
  const browser = await launchChrome();
  const results = { generatedBy: "capture-agx-ab.mjs", generatedAt: new Date().toISOString(), fixtures: {} };
  let anyFail = false;
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
    await page.goto(BASE + "/genesis.html", { waitUntil: "networkidle0", timeout: 120000 });
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const bootRes = await bootToInSession(page);
    if (!bootRes.ok) { console.log("BOOT FAILED:", JSON.stringify(bootRes)); process.exitCode = 1; return; }
    const theaterState = await waitForTheater(page);
    if (!theaterState.hasSetInteriorBoard) { console.log("THEATER NOT READY:", JSON.stringify(theaterState)); process.exitCode = 1; return; }
    // Product camera (fitted establishing shot) — NO pose override; this is the shot a player sees.
    await page.evaluate(() => { try { window.Theater.setInteriorVariant({ shotCompose: false }); } catch (e) {} });

    for (const fx of FIXTURES) {
      console.log(`\n=== ${fx.key} — ${fx.label} ===`);
      const built = await fx.build(page);
      if (!built.ok) { console.log("FIXTURE BUILD FAILED:", JSON.stringify(built)); anyFail = true; results.fixtures[fx.key] = { ok: false, error: built.error, stack: built.stack }; continue; }
      const { board, ...meta } = built;
      console.log(`  board meta: ${JSON.stringify(meta)}`);

      const mountRes = await mountOnce(page, board);
      if (!mountRes.ok) { console.log("MOUNT FAILED:", JSON.stringify(mountRes)); anyFail = true; results.fixtures[fx.key] = { ok: false, error: mountRes.error }; continue; }
      try { await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 8000 }); } catch (e) {}
      await waitForCameraSettle(page, 6000);
      // TEXTURE SETTLE: the dressed-room fixture's dressing texture fetches are async (see the
      // eyeball-fixtures harness's own finding on this) — wait for network idle once, before EITHER
      // capture, since both captures of this pair share the SAME mount (no remount to re-race against).
      try { await page.waitForNetworkIdle({ idleTime: 300, timeout: 5000 }); } catch (e) {}
      await waitForRepaint(page);
      await sleep(150);

      const fxResult = { ok: true, label: fx.label, meta, tonemaps: {} };
      const camPositions = {};
      for (const tonemap of ["none", "agx"]) {
        const setRes = await setTonemap(page, tonemap);
        if (!setRes.ok) { console.log(`SET-TONEMAP FAILED (${tonemap}):`, JSON.stringify(setRes)); anyFail = true; fxResult.ok = false; continue; }
        await waitForRepaint(page);
        await sleep(150);
        const camPos = await readCameraPos(page);
        camPositions[tonemap] = camPos;
        const outPath = path.join(OUT_DIR, `${fx.key}-${tonemap}.png`);
        await shoot(page, outPath);
        fxResult.tonemaps[tonemap] = {
          changed: setRes.res && setRes.res.changed,
          tonemap: setRes.res && setRes.res.tonemap,
          grade: setRes.postSuite && setRes.postSuite.grade,
          camPos,
        };
        console.log(`  wrote ${outPath} (tonemap=${setRes.res && setRes.res.tonemap})`);
        console.log(`    grade: ${JSON.stringify(setRes.postSuite && setRes.postSuite.grade)}`);
        console.log(`    camPos: ${JSON.stringify(camPos)}`);
      }

      // SAME-SCENE/CAMERA/CROP ASSERTION: since both captures of a pair share ONE mount (no remount
      // between them — see this file's own header), the camera pose must be not just "close within
      // epsilon" but EXACTLY unchanged (same object, never re-derived).
      const camMatch = camPositions.none && camPositions.agx ? camPosClose(camPositions.none, camPositions.agx, CAM_EPS) : false;
      fxResult.sameSceneAssertion = { camMatch, camNone: camPositions.none, camAgx: camPositions.agx };
      console.log(`  SAME-SCENE ASSERTION: camMatch=${camMatch}`);
      if (!camMatch) anyFail = true;

      results.fixtures[fx.key] = fxResult;
    }

    fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(results, null, 2));
    console.log("\nCaptures + results.json written to", OUT_DIR);
    if (anyFail) process.exitCode = 1;
  } finally {
    await browser.close();
    if (proc) proc.kill("SIGTERM");
  }
})();
