#!/usr/bin/env node
/* dev/capture-oss-integrated.mjs — GEOMETRY-OSS-INTEGRATION §15 promotion steps 6+7 (the pre-flip
   evidence the stripped-fixture captures do NOT provide). capture-wall-runs-oss.mjs proved a STRIPPED
   rectangular fixture at an outside-low grazing pose; verify-wall-runs-oss{,-fuzz}.mjs proved the
   numbers. What was missing before authorizing the legacy->oss default flip:

     step 6 — an INTEGRATED scene: a real, DRESSED room WITH a live door aperture (dressing/furniture/
              lights/doorframe all present, not stripped) rendered at the PRODUCT camera under BOTH
              kernels from the SAME serialized board, so the coordinator can confirm oss renders a real
              dungeon room — apertures, dressing, and all — with no regression, not just a bare shell.
     step 7 — a PERF/MEMORY receipt: renderer.info draw submissions (calls/triangles) + resource census
              (geometries/textures/programs) read off the SAME frame under each kernel, so a geometry
              change that silently balloons draw calls or GPU memory is caught before the flip.

   Reads-only seams (all pre-existing, added by earlier oss/telemetry units; this script adds NONE):
     window.Theater._setRoomShellPolygonKernel / _setRoomShellEnabled / setInteriorBoard
     window.Theater._graphicsResearchContextForTest (renderer.info) / _renderFrameForTest
   Boot/server/chrome/shoot conventions copied VERBATIM from dev/capture-wall-runs-oss.mjs.

   Committed default captures elsewhere stay legacy/untouched — this writes to its OWN new dir only.
   NOTE: headless Chrome here is typically SwiftShader (software) — the telemetry is a SUBMISSION-COUNT
   receipt (calls/triangles/resources), correctness+relative evidence, NOT a wall-clock GPU baseline.

   Run:  node dev/capture-oss-integrated.mjs
   Output: dev/oss-integrated-shots/{room-legacy,room-oss}.png + perf.json */

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
const OUT_DIR = path.join(__dirname, "oss-integrated-shots");
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5281, 5282, 5283, 5284, 5285];
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

// bootToInSession/waitForTheater — verbatim from dev/capture-wall-runs-oss.mjs (same boot convention).
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
      if (nameEl) nameEl.value = "OSS Integrated Soul";
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

// The INTEGRATED fixture: a real two-segment plan (corridor -> room) so the focus room carries a LIVE
// door aperture on a shared wall, DRESSED as production dresses it (dressing/furniture/lights/doorframe
// all left in place — the deliberate contrast with capture-wall-runs-oss.mjs's stripped shell). One
// board, serialized once, mounted under both kernels so the only variable is the wall/floor kernel.
async function buildIntegratedFixture(page) {
  return await page.evaluate(() => {
    try {
      // Single segment — the topology capture-wall-runs-oss.mjs proves spatializes cleanly. The door
      // APERTURE path is already covered exhaustively by the numbers (verify-wall-runs-oss 92/0:
      // centered doors + two-apertures-narrow-pier; the 5000-room fuzz: randomized multi-door). This
      // capture's own job is the DRESSED integrated render (dressing/furniture/lights kept) + perf.
      const fixture = [{ id: "r1", num: 1, label: "chamber", isFinale: false, depth: 0, exits: [], light: "normal" }];
      const plan = spatializePlan(fixture, "OSS Integrated", { walkId: "oss-integrated:dressed-v1" });
      const room = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: room.segNum, radius: 1 });
      // Deterministic, product-camera framing; keep EVERY decoration channel intact (the integrated
      // point). Only strip live combat pieces so the comparison isn't perturbed by standee tweens.
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "oss-integrated-fixture";
      const apertureCount = (board.instances && board.instances.doorframe ? board.instances.doorframe.length : 0);
      return { ok: true, board, apertureCount,
        dressing: (board.instances && board.instances.dressing ? board.instances.dressing.length : 0),
        furniture: (board.furniture ? board.furniture.length : 0),
        lights: (board.lights ? board.lights.length : 0),
        room: { x: room.x, z: room.y, w: room.w, d: room.d } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

async function mountKernel(page, kernelMode, sourceBoard) {
  return await page.evaluate((kernelMode, sourceBoard) => {
    try {
      window.Theater._setRoomShellPolygonKernel(kernelMode);
      window.Theater._setRoomShellEnabled(true);
      const board = (typeof structuredClone === "function") ? structuredClone(sourceBoard) : JSON.parse(JSON.stringify(sourceBoard));
      board._verifyNonce = "oss-integrated-fixture:" + kernelMode;
      window.Theater.setInteriorBoard(board);
      const shell = window.Theater._interiorRoomShellForTest ? window.Theater._interiorRoomShellForTest() : null;
      return { ok: true, kernel: window.Theater._roomShellPolygonKernel(), shellMeta: shell && shell.meta ? shell.meta : null };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, kernelMode, sourceBoard);
}

// renderer.info submission + resource receipt off the current frame (§15 step 7). Force one render,
// then read calls/triangles/geometries/textures/programs. Software-renderer honesty note recorded.
async function readTelemetry(page) {
  return await page.evaluate(() => {
    const ctx = window.Theater._graphicsResearchContextForTest ? window.Theater._graphicsResearchContextForTest() : null;
    if (!ctx || !ctx.renderer) return { ok: false, reason: "no graphics-research ctx seam" };
    const info = ctx.renderer.info;
    // Full-chain draw submission (borrowed from capture-gpu-telemetry.mjs): through a multi-pass
    // composer, info.render.calls read AFTER composer.render() is the LAST pass only (the misleading
    // "calls=1"). Wrap each pass to sum its own post-render count = the true full-chain submission.
    let fullChainCalls = null, fullChainTriangles = null, passCount = 0;
    const composer = ctx.composer;
    if (composer && Array.isArray(composer.passes) && composer.passes.length) {
      const perPass = [];
      const originals = composer.passes.map((p) => p.render);
      composer.passes.forEach((p, i) => {
        const orig = originals[i];
        p.render = function (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
          orig.call(p, renderer, writeBuffer, readBuffer, deltaTime, maskActive);
          perPass.push({ callsAfter: info.render.calls, trianglesAfter: info.render.triangles });
        };
      });
      if (window.Theater._renderFrameForTest) window.Theater._renderFrameForTest();
      composer.passes.forEach((p, i) => { p.render = originals[i]; });
      passCount = composer.passes.length;
      fullChainCalls = perPass.reduce((s, p) => s + p.callsAfter, 0);
      fullChainTriangles = perPass.reduce((s, p) => s + p.trianglesAfter, 0);
    } else if (window.Theater._renderFrameForTest) {
      window.Theater._renderFrameForTest();
    }
    let rendererIdentity = null;
    try {
      const gl = ctx.renderer.getContext && ctx.renderer.getContext();
      const dbg = gl && gl.getExtension("WEBGL_debug_renderer_info");
      rendererIdentity = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : (gl ? gl.getParameter(gl.RENDERER) : null);
    } catch (e) { rendererIdentity = "unavailable: " + e.message; }
    const isSoftware = typeof rendererIdentity === "string" && /swiftshader|software|llvmpipe/i.test(rendererIdentity);
    return {
      ok: true,
      render: { calls: info.render.calls, triangles: info.render.triangles, lines: info.render.lines, points: info.render.points },
      fullChain: { calls: fullChainCalls, triangles: fullChainTriangles, passCount },
      memory: { geometries: info.memory.geometries, textures: info.memory.textures },
      programCount: info.programs ? info.programs.length : null,
      rendererIdentity, isSoftwareRenderer: isSoftware,
    };
  });
}

async function shoot(page, outPath) {
  const canvas = await page.$(".theater-stage-canvas canvas");
  const box = canvas && await canvas.boundingBox();
  if (!box) throw new Error("theater canvas has no page bounding box");
  await page.screenshot({ path: outPath, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height } });
}
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { proc } = await startServer();
  console.log("server:", BASE);
  const browser = await launchChrome();
  const perf = { generatedBy: "capture-oss-integrated.mjs", kernels: {} };
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
    await page.goto(BASE + "/genesis.html", { waitUntil: "networkidle0", timeout: 30000 });
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const bootRes = await bootToInSession(page);
    if (!bootRes.ok) { console.log("BOOT FAILED:", JSON.stringify(bootRes)); process.exitCode = 1; return; }
    const theaterState = await waitForTheater(page);
    if (!theaterState.hasSetInteriorBoard) { console.log("THEATER NOT READY:", JSON.stringify(theaterState)); process.exitCode = 1; return; }

    const fixture = await buildIntegratedFixture(page);
    if (!fixture.ok) { console.log("FIXTURE BUILD FAILED:", JSON.stringify(fixture)); process.exitCode = 1; return; }
    console.log(`  integrated board: aperture(doorframe)=${fixture.apertureCount} dressing=${fixture.dressing} furniture=${fixture.furniture} lights=${fixture.lights} room=${JSON.stringify(fixture.room)}`);
    perf.board = { apertureCount: fixture.apertureCount, dressing: fixture.dressing, furniture: fixture.furniture, lights: fixture.lights, room: fixture.room };
    // Product camera (fitted establishing shot) — NO pose override; this is the shot a player sees.
    await page.evaluate(() => { try { window.Theater.setInteriorVariant({ shotCompose: false }); } catch (e) {} });

    for (const kernelMode of ["legacy", "oss"]) {
      const res = await mountKernel(page, kernelMode, fixture.board);
      if (!res || !res.ok) { console.log(`MOUNT FAILED (${kernelMode}):`, JSON.stringify(res)); process.exitCode = 1; continue; }
      try { await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 8000 }); } catch (e) {}
      await waitForRepaint(page);
      await sleep(150);
      const telemetry = await readTelemetry(page);
      const outPath = path.join(OUT_DIR, `room-${kernelMode}.png`);
      await shoot(page, outPath);
      perf.kernels[kernelMode] = { kernel: res.kernel, shellMeta: res.shellMeta, telemetry };
      console.log(`  wrote ${outPath} (kernel=${res.kernel})`);
      console.log(`    shellMeta: ${JSON.stringify(res.shellMeta)}`);
      console.log(`    telemetry: ${telemetry && telemetry.ok ? "fullChain=" + JSON.stringify(telemetry.fullChain) + " mem=" + JSON.stringify(telemetry.memory) + " programs=" + telemetry.programCount + (telemetry.isSoftwareRenderer ? " [SOFTWARE]" : "") : JSON.stringify(telemetry)}`);
    }

    // §15 step 7 delta — draw submissions + resource census, legacy vs oss. Software note carried.
    const L = perf.kernels.legacy && perf.kernels.legacy.telemetry, O = perf.kernels.oss && perf.kernels.oss.telemetry;
    if (L && L.ok && O && O.ok) {
      perf.delta = {
        fullChainCalls: (O.fullChain.calls || 0) - (L.fullChain.calls || 0),
        fullChainTriangles: (O.fullChain.triangles || 0) - (L.fullChain.triangles || 0),
        geometries: O.memory.geometries - L.memory.geometries, textures: O.memory.textures - L.memory.textures,
        programs: (O.programCount || 0) - (L.programCount || 0),
        softwareRenderer: !!L.isSoftwareRenderer,
        note: L.isSoftwareRenderer ? "SwiftShader/software context — submission-count + resource evidence only, not a GPU wall-clock baseline." : "hardware GL context.",
      };
      console.log(`\n  DELTA oss-legacy: fullChainCalls=${perf.delta.fullChainCalls} fullChainTriangles=${perf.delta.fullChainTriangles} geometries=${perf.delta.geometries} textures=${perf.delta.textures} programs=${perf.delta.programs}`);
    }
    fs.writeFileSync(path.join(OUT_DIR, "perf.json"), JSON.stringify(perf, null, 2));
    console.log("\nCaptures + perf.json written to", OUT_DIR);
  } finally {
    await browser.close();
    if (proc) proc.kill("SIGTERM");
  }
})();
