#!/usr/bin/env node
/* dev/capture-wall-runs-oss.mjs — UNIT G3 (docs/GEOMETRY-OSS-INTEGRATION.md §16, §17.6,
   docs/STAGE-G3-WALL-RUNS.md's own "neutral-lit outside-low captures"). NOT a pass/fail harness — a
   CAPTURE script, matching §16's "the coordinator must actually inspect the PNGs" requirement. Boots
   the real in-session interior board (same conventions as dev/verify-room-shell-render.mjs), forces
   ROOM_SHELL_POLYGON_KERNEL="oss" via the live test seam (window.Theater._setRoomShellPolygonKernel),
   mounts one stripped rectangular room under the neutral daylit profile, positions the live THREE
   camera OUTSIDE the room at a LOW grazing angle looking along a wall into one of its corners via the
   existing _setInteriorCameraPoseForTest seam, forces a render, and screenshots the composited page.
   Captures BOTH "legacy" and "oss" from the SAME serialized board + exact camera pose so the
   orchestrator can compare the corner directly; committed default captures (any existing capture in
   dev/*-shots/) stay legacy/untouched — this writes to its OWN new directory only.

   Run:  node dev/capture-wall-runs-oss.mjs */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import net from "node:net";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const OUT_DIR = path.join(__dirname, "wall-runs-oss-shots");
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5271, 5272, 5273, 5274, 5275];
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

// bootToInSession/waitForTheater — verbatim from dev/verify-room-shell-render.mjs (same boot convention).
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
      if (nameEl) nameEl.value = "G3 Wall Runs Soul";
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

async function buildControlledFixture(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [{ id: "s1", num: 1, label: "s1", isFinale: false, depth: 0, exits: [], light: "normal" }];
      const plan = spatializePlan(fixture, "G3 Wall Runs", { walkId: "g3-wall-runs:controlled-v2" });
      const focusRoom = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      // Strip every scene-dependent decoration channel. The comparison is wall construction, so the
      // board must not inherit a random character, dressing card, light card, furniture, or portal.
      board.instances.pillar = [];
      board.instances.doorframe = [];
      board.pieces = [];
      board.cover = [];
      board.furniture = [];
      board.wallProps = [];
      board.portals = [];
      board.lights = [];
      board.lightProfile = "daylit";
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "g3-controlled-fixture";
      return { ok: true, board, room: { x: focusRoom.x, z: focusRoom.y, w: focusRoom.w, d: focusRoom.d } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

async function mountAndFrame(page, kernelMode, sourceBoard, pose) {
  return await page.evaluate((kernelMode, sourceBoard, pose) => {
    try {
      window.Theater._setRoomShellPolygonKernel(kernelMode);
      window.Theater._setRoomShellEnabled(true);
      const board = (typeof structuredClone === "function") ? structuredClone(sourceBoard) : JSON.parse(JSON.stringify(sourceBoard));
      board._verifyNonce = "g3-controlled-fixture:" + kernelMode;
      window.Theater.setInteriorBoard(board);
      const shell = window.Theater._interiorRoomShellForTest();
      return {
        ok: true, kernel: window.Theater._roomShellPolygonKernel(),
        shellMeta: shell && shell.meta ? shell.meta : null, // plain-data subset only — the full shell
        // record can carry large typed arrays that don't round-trip cleanly through puppeteer's
        // structured-clone boundary; `.meta` is a small plain-data summary (segment/aperture counts).
        poseSet: pose ? window.Theater._setInteriorCameraPoseForTest(pose.pos, pose.look) : null,
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, kernelMode, sourceBoard, pose);
}

async function shoot(page, outPath) {
  // Canvas element screenshots can return a stale pre-pose WebGL buffer in headless Chrome. The
  // page-level CDP path captures the actual composited frame after the double-rAF wait below. Clip
  // that page screenshot to the canvas's live bounds so unrelated UI transitions cannot differ.
  const canvas = await page.$(".theater-stage-canvas canvas");
  const box = canvas && await canvas.boundingBox();
  if (!box) throw new Error("theater canvas has no page bounding box");
  await page.screenshot({ path: outPath, clip: {
    x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height,
  } });
}

async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function outsideLowCornerPose(page) {
  return await page.evaluate(() => {
    const shell = window.Theater._interiorRoomShellForTest && window.Theater._interiorRoomShellForTest();
    const origin = window.Theater.interiorBoardOrigin && window.Theater.interiorBoardOrigin();
    const segs = shell && shell.wallSegments;
    if (!origin || !segs || segs.length < 2) return null;
    let pick = null;
    for (let i = 0; i < segs.length; i++) {
      const a = segs[i], b = segs[(i + 1) % segs.length];
      const joined = Math.hypot(a.b.x - b.a.x, a.b.z - b.a.z) < 1e-6;
      const len = Math.hypot(a.b.x - a.a.x, a.b.z - a.a.z);
      if (joined && len >= 2) { pick = a; break; }
    }
    if (!pick) return null;
    const dx = pick.b.x - pick.a.x, dz = pick.b.z - pick.a.z;
    const len = Math.hypot(dx, dz) || 1;
    const t = { x: dx / len, z: dz / len };
    const inward = { x: -dz / len, z: dx / len };
    const corner = { x: pick.b.x - origin.cx, z: pick.b.z - origin.cz };
    return {
      pos: { x: corner.x - inward.x * 4.5 - t.x * 5.5, y: 0.16, z: corner.z - inward.z * 4.5 - t.z * 5.5 },
      look: { x: corner.x - inward.x * 0.18, y: 0.34, z: corner.z - inward.z * 0.18 },
    };
  });
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { proc } = await startServer();
  console.log("server:", BASE);
  const browser = await launchChrome();
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
    await page.goto(BASE + "/genesis.html", { waitUntil: "networkidle0", timeout: 30000 });
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const bootRes = await bootToInSession(page);
    if (!bootRes.ok) { console.log("BOOT FAILED:", JSON.stringify(bootRes)); process.exitCode = 1; return; }
    const theaterState = await waitForTheater(page);
    if (!theaterState.hasSetInteriorBoard) { console.log("THEATER NOT READY:", JSON.stringify(theaterState)); process.exitCode = 1; return; }

    const fixture = await buildControlledFixture(page);
    if (!fixture.ok) { console.log("FIXTURE BUILD FAILED:", JSON.stringify(fixture)); process.exitCode = 1; return; }
    await page.evaluate(() => { window.Theater.setInteriorVariant({ shotCompose: false }); });

    let pose = null;
    for (const kernelMode of ["legacy", "oss"]) {
      let res;
      try {
        res = await mountAndFrame(page, kernelMode, fixture.board, pose);
      } catch (e) {
        console.log(`MOUNT THREW (${kernelMode}):`, e && e.message, e && e.stack);
        process.exitCode = 1; continue;
      }
      if (!res || !res.ok) { console.log(`MOUNT FAILED (${kernelMode}):`, JSON.stringify(res)); process.exitCode = 1; continue; }
      try { await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 8000 }); } catch (e) { /* fall through with whatever frame is current */ }
      if (!pose) pose = await outsideLowCornerPose(page);
      if (!pose) { console.log("POSE DERIVATION FAILED"); process.exitCode = 1; continue; }
      const poseState = await page.evaluate((p) => {
        const set = window.Theater._setInteriorCameraPoseForTest(p.pos, p.look);
        return { set, camera: window.Theater._interiorCameraPositionForTest() };
      }, pose);
      await waitForRepaint(page);
      await sleep(150);
      const outPath = path.join(OUT_DIR, `wall-corner-${kernelMode}.png`);
      await shoot(page, outPath);
      console.log(`  wrote ${outPath} (kernel=${res.kernel}, room=${JSON.stringify(fixture.room)})`);
      console.log(`    shell meta: ${JSON.stringify(res.shellMeta)}`);
      console.log(`    controlled pose: ${JSON.stringify(poseState)}`);
    }
    console.log("\nCaptures written to", OUT_DIR);
  } finally {
    await browser.close();
    if (proc) proc.kill("SIGTERM");
  }
})();
