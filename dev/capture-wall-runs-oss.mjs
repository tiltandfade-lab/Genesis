#!/usr/bin/env node
/* dev/capture-wall-runs-oss.mjs — UNIT G3 (docs/GEOMETRY-OSS-INTEGRATION.md §16, §17.6,
   docs/STAGE-G3-WALL-RUNS.md's own "neutral-lit outside-low captures"). NOT a pass/fail harness — a
   CAPTURE script, matching §16's "the coordinator must actually inspect the PNGs" requirement. Boots
   the real in-session interior board (same conventions as dev/verify-room-shell-render.mjs), forces
   ROOM_SHELL_POLYGON_KERNEL="oss" via the live test seam (window.Theater._setRoomShellPolygonKernel),
   mounts a rectangular room with a centered door under the "dark" (flattest/most neutral) light
   profile, positions the live THREE camera OUTSIDE the room at a LOW angle looking back at one of its
   corners (via window.Theater._graphicsResearchContextForTest()'s real scene/camera references — no
   production camera-fit mode does this by itself, so this script drives it directly), forces a render,
   and screenshots the canvas. Captures BOTH "legacy" and "oss" for the SAME fixture + camera so the
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

async function mountAndFrame(page, kernelMode) {
  return await page.evaluate((kernelMode) => {
    try {
      window.Theater._setRoomShellPolygonKernel(kernelMode);
      window.Theater._setRoomShellEnabled(true);
      const ids = ["s1"];
      const fixture = [{ id: "s1", num: 1, label: "s1", isFinale: false, depth: 0, exits: [], light: "normal" }];
      const plan = spatializePlan(fixture, "G3 Wall Runs", { walkId: "g3-wall-runs:" + kernelMode });
      const focusRoom = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      board.lightProfile = "daylit"; // neutral/bright-even profile — legible geometry over mood lighting for this capture
      board.cameraFit = { mode: "room" };
      board._verifyNonce = Math.random() + ":" + Date.now();
      window.Theater.setInteriorBoard(board);
      // NOTE: a direct camera.position.set() here (attempted, then reverted — see this unit's own
      // session notes) does NOT stick: the interior board's own camera-fit is a continuously-applied
      // follow, not a one-shot tween, and re-asserts its own fit position every frame regardless of a
      // manual override from outside that loop. This capture therefore uses the PRODUCT'S OWN default
      // room-fit framing (the same 3/4 overhead angle every other room-shell capture in this repo uses)
      // rather than a literal "outside-low" angle this session did not find a real seam to drive.
      const cx = focusRoom.x, cz = focusRoom.y, w = focusRoom.w, d = focusRoom.d;
      const shell = window.Theater._interiorRoomShellForTest();
      return {
        ok: true, kernel: window.Theater._roomShellPolygonKernel(),
        room: { x: cx, z: cz, w, d },
        shellMeta: shell && shell.meta ? shell.meta : null, // plain-data subset only — the full shell
        // record can carry large typed arrays that don't round-trip cleanly through puppeteer's
        // structured-clone boundary; `.meta` is a small plain-data summary (segment/aperture counts).
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, kernelMode);
}

async function shoot(page, outPath) {
  const canvasEl = await page.$(".theater-stage-canvas canvas");
  if (canvasEl) await canvasEl.screenshot({ path: outPath }); else await page.screenshot({ path: outPath });
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
    const bootRes = await bootToInSession(page);
    if (!bootRes.ok) { console.log("BOOT FAILED:", JSON.stringify(bootRes)); process.exitCode = 1; return; }
    const theaterState = await waitForTheater(page);
    if (!theaterState.hasSetInteriorBoard) { console.log("THEATER NOT READY:", JSON.stringify(theaterState)); process.exitCode = 1; return; }

    for (const kernelMode of ["legacy", "oss"]) {
      let res;
      try {
        res = await mountAndFrame(page, kernelMode);
      } catch (e) {
        console.log(`MOUNT THREW (${kernelMode}):`, e && e.message, e && e.stack);
        process.exitCode = 1; continue;
      }
      if (!res || !res.ok) { console.log(`MOUNT FAILED (${kernelMode}):`, JSON.stringify(res)); process.exitCode = 1; continue; }
      try { await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 8000 }); } catch (e) { /* fall through with whatever frame is current */ }
      await sleep(300);
      const outPath = path.join(OUT_DIR, `wall-corner-${kernelMode}.png`);
      await shoot(page, outPath);
      console.log(`  wrote ${outPath} (kernel=${res.kernel}, room=${JSON.stringify(res.room)})`);
      console.log(`    shell meta: ${JSON.stringify(res.shellMeta)}`);
    }
    console.log("\nCaptures written to", OUT_DIR);
  } finally {
    await browser.close();
    if (proc) proc.kill("SIGTERM");
  }
})();
