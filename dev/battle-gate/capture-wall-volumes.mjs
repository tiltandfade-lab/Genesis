#!/usr/bin/env node
/* dev/battle-gate/capture-wall-volumes.mjs — WALL VOLUME GEOMETRY (docs/WALL-VOLUMES-PRACTICALS.md,
   Unit C4.1a) — the GRAZING-ANGLE capture gate frame 01's own acceptance criterion asks for: "A grazing
   camera angle visibly resolves inner face, cap, and outer face." dev/battle-gate/capture-stage-c3-
   shapes.mjs already proves the shapes read correctly from the PRODUCT camera (the normal fitted
   establishing shot); this sibling proves the wall VOLUME itself reads at a real low/oblique angle no
   product camera pose ever uses — server/Chrome/boot/buildScene conventions copied VERBATIM from that
   script (see its own header for the "why" behind each).

   Two grazing shots, since no single vantage sees inner+outer simultaneously (the inner face faces
   INTO the room, the outer face faces AWAY — a real architectural wall, not a one-sided billboard):
     - inside-low:  a worm's-eye view from just inside the room, low + oblique along one wall segment —
                     resolves the INNER face + the stem's own top-CAP overhang.
     - outside-low: a worm's-eye view from just outside the boundary, low + oblique along the SAME wall
                     segment — resolves the OUTER face + the same CAP's own outward lip + the FOOTING
                     skirt silhouette.
   Uses a new TEST-ONLY seam, window.Theater._setInteriorCameraPoseForTest(pos, lookAt) (added alongside
   this unit, theater-boot.js — the write-sibling of the existing _interiorCameraPositionForTest read
   seam) — no product camera pose ever grazes this low, so a direct override is the honest way to get it.

   Run:  node dev/battle-gate/capture-wall-volumes.mjs
   Output: dev/battle-gate/wall-volumes/{establishing,inside-low,outside-low}.png + metrics.json */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(__dirname, "wall-volumes");
fs.mkdirSync(outDir, { recursive: true });

// a port range disjoint from every sibling battle-gate harness's own claimed ranges.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5231, 5232, 5233, 5234, 5235];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[wall-volumes-gate]", ...a); }
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
      if (await probeRoot(port)) { log(`port ${port} already serving THIS tree — reusing it`); BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; }
      continue;
    }
    log(`starting python3 -m http.server ${port} (bind 127.0.0.1) in ${repoRoot}`);
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}

const SHOT_W = 1600, SHOT_H = 1200;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}
async function newPage(browser) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().endsWith("/favicon.ico")) {
      req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
    } else req.continue();
  });
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// mirrors capture-stage-c3-shapes.mjs's own bootToInSession verbatim (see that file's header for why).
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
      if (nameEl) nameEl.value = "Wall Volumes Gate Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found", notes };
      if (typeof startSession === "function") { startSession(world.id); notes.push("startSession() called"); }
      showTab("world");
      return { ok: true, notes, worldId: world.id, worldName: world.name };
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

// same synthetic walk.segments[] fixture shape capture-stage-c3-shapes.mjs uses — a real octagon row
// (Grand Octagon, Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md) with a real
// door aperture (s1 -> s2/s3 exits), so the compiled shell actually has a wall to graze AND an aperture
// jamb in frame.
async function buildScene(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }, { targetId: "s3" }],
          light: "normal", areaType: "Grand Octagon", dims: "60' x 60'" },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s3", num: 3, label: "s3", isFinale: true, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
      ];
      const plan = spatializePlan(fixture, "The Hub", { walkId: "wall-volumes-gate-octagon" });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s1");
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = "lamplit";
      return { ok: true, board, roomShape: focusRoom.shape, roomCellCount: Array.isArray(focusRoom.cells) ? focusRoom.cells.length : null };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), notes: [], shots: [] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    metrics.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const theaterState = await waitForTheater(page);
    metrics.theaterState = theaterState;
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("window.Theater.setInteriorBoard never became available: " + JSON.stringify(theaterState));

    const built = await buildScene(page);
    metrics.built = { ok: built.ok, error: built.error, roomShape: built.roomShape, roomCellCount: built.roomCellCount };
    if (!built.ok) throw new Error("scene build FAILED: " + built.error);
    log(`scene built: shape=${built.roomShape} cells=${built.roomCellCount}`);

    // shotCompose OFF — same escape hatch capture-stage-c3-shapes.mjs uses, so the ESTABLISHING shot is
    // a plain full-room fit (not a pieces-focused beat crop; this scene has no pieces).
    await page.evaluate(() => { window.Theater.setInteriorVariant({ shotCompose: false }); });
    const mounted = await page.evaluate((board) => {
      try { window.Theater.setInteriorBoard(board); return { ok: true, meshCount: window.Theater.interiorMeshCount() }; }
      catch (e) { return { ok: false, error: e.message }; }
    }, built.board);
    metrics.mounted = mounted;
    if (!mounted.ok) throw new Error("setInteriorBoard FAILED: " + mounted.error);
    await sleep(500);

    async function shoot(fileName) {
      const shotPath = path.join(outDir, fileName);
      // full-PAGE screenshot (not an element screenshot of the canvas) — found live debugging this
      // script's own grazing-pose shots: `elementHandle.screenshot()` on the WebGL canvas kept
      // returning a STALE pre-override frame despite the camera/render state reading back correctly
      // in-page (confirmed via a dedicated debug seam) and an explicit double-rAF repaint wait; a
      // full-page CDP screenshot reads the ACTUAL composited page instead of a cached element bitmap.
      await page.screenshot({ path: shotPath, fullPage: false });
      metrics.shots.push(fileName);
      log("captured", fileName);
    }
    // waitForRepaint — a genuine double-rAF round trip in PAGE context (not a fixed sleep). Found live
    // debugging this exact script: _setInteriorCameraPoseForTest's own forced synchronous
    // renderTheaterFrame() call DOES redraw the WebGL buffer with the new camera pose (confirmed via
    // the debug seam — camera position/matrixWorld/postSuite all read back correctly) but a puppeteer
    // canvas screenshot taken right after (even with an extra fixed sleep) kept reading the STALE
    // pre-override frame — the renderer has no `preserveDrawingBuffer:true`, so headless Chrome's own
    // compositor only actually re-paints the canvas into the page's composited output on its OWN next
    // real rAF-driven paint tick, which markDirty()'s normal path schedules but a same-tick bypass call
    // does not wait for. Awaiting two chained rAF callbacks here forces that real compositor paint to
    // happen before the screenshot fires.
    async function waitForRepaint() {
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    }

    // shot 1 — the ESTABLISHING shot at the normal product camera fit (sanity: confirms the mounted
    // scene is the SAME wall-volume octagon capture-stage-c3-shapes.mjs already reads).
    await shoot("establishing.png");

    // pull the compiled shell's own wall segments + the board origin (production API,
    // window.Theater.interiorBoardOrigin — NOT test-only) so the grazing poses below are computed off
    // the REAL compiled geometry, not a guessed room size.
    const geo = await page.evaluate(() => {
      const shell = window.Theater._interiorRoomShellForTest ? window.Theater._interiorRoomShellForTest() : null;
      const origin = window.Theater.interiorBoardOrigin ? window.Theater.interiorBoardOrigin() : null;
      if (!shell || !shell.wallSegments || !shell.wallSegments.length || !origin) return null;
      // pick the FIRST wall segment (deterministic — compileRoomShellData's own emission order) that is
      // at least 2 world units long, so the grazing camera has real length to sweep along, not a tiny
      // aperture-flanking stub.
      const seg = shell.wallSegments.find((s) => Math.hypot(s.b.x - s.a.x, s.b.z - s.a.z) >= 2) || shell.wallSegments[0];
      const dx = seg.b.x - seg.a.x, dz = seg.b.z - seg.a.z;
      const len = Math.hypot(dx, dz) || 1;
      const t = { x: dx / len, z: dz / len };
      const n = { x: -dz / len, z: dx / len }; // segmentNormal's own formula — inward unit normal
      const midLocal = { x: (seg.a.x + seg.b.x) / 2, z: (seg.a.z + seg.b.z) / 2 };
      const midWorld = { x: midLocal.x - origin.cx, z: midLocal.z - origin.cz };
      return { midWorld, n, t, segHeight: seg.height };
    });
    metrics.geo = geo;
    if (!geo) throw new Error("could not read compiled wall segments for the grazing poses");

    const { midWorld, n, t } = geo;
    // aim a bit above the stem/cap seam (docs/WALL-VOLUMES-PRACTICALS.md defaults: stemHeight 0.28 +
    // capHeight 0.06 = 0.34) so the frame catches the cap silhouette AND a slice of the upper wall
    // above it, not just the stem alone.
    const aimY = 0.34; // the stem's own cap seam (stemHeight 0.28 + capHeight 0.06) — the target silhouette
    // the board's interior camera is PERSPECTIVE (fov ~20deg, confirmed live) — distance ALONE drives
    // close-up scale (no ortho fixed-box quirk); pulled back further than a first pass (8-9 world units,
    // camera BELOW the cap seam) so the cap's own top edge reads as a silhouette against the dark void
    // above it, not just a same-tone stretch of wall texture filling the whole frame.

    // shot 2 — INSIDE-LOW: a worm's-eye view from just inside the room, low + oblique along the wall —
    // resolves the wall's own INNER face + the stem cap's overhang from below.
    const insidePos = { x: midWorld.x + n.x * 8 + t.x * 5, y: 0.15, z: midWorld.z + n.z * 8 + t.z * 5 };
    const insideLook = { x: midWorld.x, y: aimY, z: midWorld.z };
    const insideSetResult = await page.evaluate((pos, look) => (window.Theater._setInteriorCameraPoseForTest ? window.Theater._setInteriorCameraPoseForTest(pos, look) : "NO_WRITE_SEAM"), insidePos, insideLook);
    const insideAfterPose = await page.evaluate(() => window.Theater._interiorCameraPositionForTest ? window.Theater._interiorCameraPositionForTest() : "NO_READ_SEAM");
    metrics.poseDebug = { insidePos, insideLook, insideSetResult, insideAfterPose };
    log("inside pose:", JSON.stringify(metrics.poseDebug));
    await waitForRepaint();
    await sleep(150);
    await shoot("inside-low.png");

    // shot 3 — OUTSIDE-LOW: a worm's-eye view from just outside the boundary, low + oblique along the
    // SAME wall segment — resolves the wall's own OUTER face + the same cap's outward lip + the footing
    // skirt silhouette. Same standoff distance, mirrored to the OUTWARD side (-n) of the wall.
    const outsidePos = { x: midWorld.x - n.x * 8 + t.x * 5, y: 0.15, z: midWorld.z - n.z * 8 + t.z * 5 };
    const outsideLook = { x: midWorld.x - n.x * 0.3, y: aimY, z: midWorld.z - n.z * 0.3 };
    const outsideAfterPose = await page.evaluate((pos, look) => { window.Theater._setInteriorCameraPoseForTest(pos, look); return window.Theater._interiorCameraPositionForTest(); }, outsidePos, outsideLook);
    metrics.outsideAfterPose = outsideAfterPose;
    log("outside pose:", JSON.stringify(outsideAfterPose));
    await waitForRepaint();
    await sleep(150);
    await shoot("outside-low.png");

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    metrics.consoleErrorsCount = metrics.consoleErrors.length;
    metrics.shotCount = metrics.shots.length;

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("wrote metrics.json —", metrics.shotCount, "shots,", metrics.consoleErrorsCount, "console errors");
    if (metrics.shotCount < 3) { log("WARNING: not every shot captured — see metrics.json"); process.exitCode = 1; }
  } catch (e) {
    metrics.error = e.message;
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
