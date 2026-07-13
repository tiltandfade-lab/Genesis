#!/usr/bin/env node
/* dev/graphics-regression/capture-regions.mjs — R4 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md S13.7):
   the deterministic capture mode for capture-region regression testing.

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md S7 + S5): this unit is a RUNG-ENABLING
   research harness — it gives a same-environment regression net so visual work doesn't silently break
   topology/silhouette. It is dev-only, touches ZERO production paths (it drives the REAL, UNMODIFIED
   genesis.html/src through the same page.evaluate() calling convention dev/battle-gate's captures
   already use — see capture-stage-c3-shapes.mjs's header for that precedent), and its goldens are
   EVIDENCE for the orchestrator, never authority over art direction. Per S5's open-source doctrine,
   image-regression thresholds here are NOT a substitute for art-direction judgment — see golden
   hierarchy layer 3 in compare-regions.mjs. Classification: research-only. Negative control: proven by
   run-negative-control.mjs (red-first on a one-pixel/topology mutation of a golden capture).

   WHAT THIS SCRIPT FREEZES (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md S3.8's required list):
     - seed              -> a fixed, hand-authored walk.segments[] fixture (no Math.random anywhere
                             in the fixture construction; the app's own seeded PRNGs handle the rest).
     - viewport + dpr     -> fixed CAPTURE_W x CAPTURE_H, deviceScaleFactor:1 (see CAPTURE_DPR below).
     - renderer resolution -> Chrome window-size == viewport, canvas backing size read back and
                             recorded in meta.json so a drift is VISIBLE, not silently absorbed.
     - camera + ShotPlan  -> window.Theater.setInteriorVariant({shotCompose:false}) forces the plain
                             "room" camera-fit path (whole floor bbox + fixed pad, theater-boot.js
                             interiorCameraFitFor) instead of the cinematic shot-composer's candidate
                             picker — same escape hatch dev/battle-gate/capture-stage-c3-shapes.mjs
                             uses for the identical reason (a full, reproducible room read).
     - animation clock    -> window.Theater._renderFrameForTest() is called SYNCHRONOUSLY inside the
                             same page.evaluate() turn as setInteriorBoard(), before this script ever
                             yields back to the event loop — no requestAnimationFrame tick has had a
                             chance to fire between mount and this first forced frame.
     - particle/mote state -> partially frozen (see the "NOT fully frozen" note below) by capturing as
                             close to mount as possible with the same _renderFrameForTest() call.
     - exposure/grade/post -> not randomized inputs (deterministic per lightProfile/realmId); no extra
                             freeze needed beyond fixing those fixture fields.
     - font loading       -> the capture crops to the WebGL <canvas> element only (elementHandle.
                             screenshot()), never the surrounding DOM chrome, so async web-font swaps
                             in the page UI cannot leak into the compared pixels.

   NOT FULLY FROZEN (flagged for the orchestrator, per the task's explicit ask):
     - Ambient motes (theater-boot.js startMoteDrift/stopMoteDrift) run on their own internal
       requestAnimationFrame loop scheduled at Theater mount time, driven by performance.now() (real
       wall-clock), and neither stopMoteDrift() nor a pause/disable toggle is exposed on window.Theater
       for a harness to call — only _renderFrameForTest() (render synchronously) and
       interiorMoteCount() (read the count) are exposed. This script minimizes drift by never awaiting
       between board-mount and the first forced render, but CANNOT guarantee zero mote-position drift
       between two separate process launches (CDP round-trip jitter, OS scheduling). Mitigation: the
       region masks (region-masks/octagon-row101.json) keep motes OUT of the tight-tolerance regions
       (board-silhouette, floor-topology, wall-silhouette) and give the one region likely to graze
       drifting motes (subject-readability) a wider maxRatio. See run-negative-control.mjs's "GREEN on
       unchanged recapture" result for the measured real-world drift magnitude.

   FIXTURE: the SAME "Grand Octagon row 101" semantic fixture dev/battle-gate/capture-stage-c3-shapes.mjs
   uses (areaType/dims read verbatim off Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area
   Type.md row 101) and the SAME semantic fixture G0's dev/geometry-research/fixtures/row101-live-dump.json
   structural truth was captured from (shape:"octagon") — chosen so this capture-region layer and the
   structural-metrics layer both reference one real, named table row, not two unrelated scenes.

   RUN:
     node dev/graphics-regression/capture-regions.mjs --out golden
     node dev/graphics-regression/capture-regions.mjs --out rerun
   Output: dev/graphics-regression/captures/<label>/{full.png, canvas-meta.json, structural.json,
   env.json}
*/

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

const args = process.argv.slice(2);
function argVal(flag, dflt) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
}
const LABEL = argVal("--out", "golden");
const outDir = path.join(__dirname, "captures", LABEL);
fs.mkdirSync(outDir, { recursive: true });

// a SIXTH port range, distinct from every dev/battle-gate/*.mjs and dev/model-qa/capture.mjs range
// (5175/5178/5179 reserved; 5181-5285 claimed by sibling harnesses — see this repo's grep of every
// PORT_CANDIDATES literal at authoring time). R4 owns 5281-5285.
const PORT_CANDIDATES = process.env.GR_PORT
  ? [parseInt(process.env.GR_PORT, 10)]
  : [5281, 5282, 5283, 5284, 5285];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const CAPTURE_W = 1280;
const CAPTURE_H = 960;
const CAPTURE_DPR = 1; // fixed, frozen — never left to the OS default

function log(...a) { console.log("[graphics-regression]", ...a); }
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

async function launchChrome() {
  const chromeArgs = [
    "--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle",
    "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${CAPTURE_W},${CAPTURE_H}`,
    "--force-device-scale-factor=" + CAPTURE_DPR,
  ];
  return await puppeteer.launch({
    executablePath: CHROME, headless: "new", args: chromeArgs,
    defaultViewport: { width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: CAPTURE_DPR },
  });
}

async function newPage(browser) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().endsWith("/favicon.ico")) {
      req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
    } else req.continue();
  });
  const errs = [];
  await page.evaluateOnNewDocument(() => { window.__grConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { errs.push(msg.text()); log("console.error:", msg.text().slice(0, 200)); } });
  page.on("pageerror", (e) => { errs.push("pageerror: " + e.message); log("PAGE ERROR:", e.message); });
  page._grErrors = errs;
  return page;
}

// mirrors dev/battle-gate/capture-stage-c3-shapes.mjs's bootToInSession verbatim (same reasoning:
// staging guided creation via the app's real global functions, exactly the calls a player's click
// invokes — never a mock page, never a bypassed code path).
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
      if (nameEl) nameEl.value = "R4 Capture Regression Soul";
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
        hasRenderFrameForTest: !!(window.Theater && typeof window.Theater._renderFrameForTest === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

// the row-101 "Grand Octagon" fixture — semantically identical to dev/battle-gate/
// capture-stage-c3-shapes.mjs's SCENES[0] and to G0's row101-live-dump.json truth (shape:"octagon").
const FIXTURE = {
  key: "octagon-row101",
  label: "Grand Octagon row 101: sunken arena + raised ring",
  focusAreaType: "Grand Octagon",
  focusDims: "60' x 60'",
  focusSide: "30' x 30' sunken central arena (5 ft below the surrounding level); 10' wide raised ring walkway with iron railing.",
  realmId: "gloom",
  env: "dungeon",
  walkId: "graphics-regression-r4-octagon",
  lightProfile: "lamplit",
};

// buildScene + mount + FIRST FORCED FRAME, all inside ONE page.evaluate() turn — this is the
// "animation clock" freeze: no requestAnimationFrame tick can fire between board-mount and the
// synchronous _renderFrameForTest() call this function ends with, because nothing here ever awaits.
async function buildMountAndRenderOnce(page, cfg) {
  return await page.evaluate((c) => {
    try {
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }, { targetId: "s3" }],
          light: "normal", areaType: c.focusAreaType, dims: c.focusDims, side: c.focusSide },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s3", num: 3, label: "s3", isFinale: true, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
      ];
      const plan = spatializePlan(fixture, "The Hub", { walkId: c.walkId });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s1");
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: c.realmId, env: c.env, focusSegNum, radius: 1 });
      if (c.lightProfile) board.lightProfile = c.lightProfile;

      window.Theater.setInteriorVariant({ shotCompose: false }); // frozen ShotPlan — plain full-room fit
      window.Theater.setInteriorBoard(board);
      const meshCount = window.Theater.interiorMeshCount ? window.Theater.interiorMeshCount() : null;
      const moteCount = window.Theater.interiorMoteCount ? window.Theater.interiorMoteCount() : null;
      const renderedNow = window.Theater._renderFrameForTest ? window.Theater._renderFrameForTest() : false;
      const frustum = window.Theater.interiorFrustumCheck ? window.Theater.interiorFrustumCheck() : null;

      return {
        ok: true,
        structural: {
          roomShape: focusRoom.shape,
          roomCellCount: Array.isArray(focusRoom.cells) ? focusRoom.cells.length : null,
          roomBBoxArea: focusRoom.w * focusRoom.d,
          roomW: focusRoom.w, roomD: focusRoom.d,
          terrain: (focusRoom.terrain || []).map((p) => ({ tier: p.tier, kind: p.kind, footprint: p.footprint || "patch", cellCount: p.cells.length })),
          meshCount, moteCount,
          frustumOk: frustum ? frustum.ok : null,
          boardMeta: board.meta || null,
        },
        renderedSynchronously: renderedNow,
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, cfg);
}

async function main() {
  const server = await startServer();
  let browser = null;
  const report = { label: LABEL, fixture: FIXTURE.key, generatedAt: new Date().toISOString() };
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(200);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    report.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const theaterState = await waitForTheater(page);
    report.theaterState = theaterState;
    if (!theaterState || !theaterState.hasSetInteriorBoard || !theaterState.hasRenderFrameForTest) {
      throw new Error("Theater test seams unavailable: " + JSON.stringify(theaterState));
    }

    const built = await buildMountAndRenderOnce(page, FIXTURE);
    report.built = built;
    if (!built.ok) throw new Error("scene build/mount failed: " + built.error);

    // capture strictly through the canvas element (elementHandle.screenshot() reads the compositor
    // correctly — see this repo's dev/battle-gate/capture-stage.mjs canvasHealth() header for why a
    // raw in-page WebGL readback is unreliable here; that gotcha and its fix are inherited verbatim).
    const canvasEl = await page.$(".theater-stage-canvas canvas");
    if (!canvasEl) throw new Error("theater canvas element not found");
    const fullPath = path.join(outDir, "full.png");
    await canvasEl.screenshot({ path: fullPath });

    const canvasBackingSize = await page.evaluate(() => {
      const c = document.querySelector(".theater-stage-canvas canvas");
      return c ? { width: c.width, height: c.height, clientWidth: c.clientWidth, clientHeight: c.clientHeight } : null;
    });

    // renderer/GPU metadata (docs S3.8 requirement: "renderer/browser/GPU metadata" on every diff).
    const glInfo = await page.evaluate(() => {
      try {
        const c = document.createElement("canvas");
        const gl = c.getContext("webgl2") || c.getContext("webgl");
        if (!gl) return { ok: false, reason: "no-webgl-context" };
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        return {
          ok: true,
          version: gl.getParameter(gl.VERSION),
          shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          unmaskedVendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : null,
          unmaskedRenderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null,
        };
      } catch (e) { return { ok: false, error: e.message }; }
    });

    const browserVersion = await browser.version();

    const env = {
      generatedAt: report.generatedAt,
      label: LABEL,
      captureWidth: CAPTURE_W,
      captureHeight: CAPTURE_H,
      captureDpr: CAPTURE_DPR,
      canvasBackingSize,
      glInfo,
      browserVersion,
      chromeExecutable: CHROME,
      node: process.version,
      platform: `${os.platform()} ${os.arch()} ${os.release()}`,
      gitCommit: safeGit(["rev-parse", "HEAD"]),
      gitBranch: safeGit(["rev-parse", "--abbrev-ref", "HEAD"]),
      fixture: FIXTURE,
      pixelmatchVersion: readPinnedVersion("pixelmatch"),
      consoleErrors: page._grErrors,
    };

    fs.writeFileSync(path.join(outDir, "structural.json"), JSON.stringify(built.structural, null, 2) + "\n");
    fs.writeFileSync(path.join(outDir, "env.json"), JSON.stringify(env, null, 2) + "\n");
    fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2) + "\n");

    log(`captured ${LABEL} -> ${fullPath}`);
    log(`structural: shape=${built.structural.roomShape} cells=${built.structural.roomCellCount} mesh=${built.structural.meshCount} motes=${built.structural.moteCount} frustumOk=${built.structural.frustumOk}`);
  } finally {
    if (browser) await browser.close();
    if (server && server.proc) server.proc.kill("SIGTERM");
  }
}

function safeGit(argv) {
  try { return execFileSync("git", argv, { encoding: "utf8", cwd: repoRoot }).trim(); } catch (e) { return null; }
}
function readPinnedVersion(pkg) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(process.env.HOME, ".genesis-geometry-tools", "package.json"), "utf8"));
    return p.dependencies ? p.dependencies[pkg] : null;
  } catch (e) { return null; }
}

main().catch((e) => { console.error("[graphics-regression] FATAL:", e.message, e.stack); process.exitCode = 1; });
