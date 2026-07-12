#!/usr/bin/env node
/* dev/battle-gate/capture-stage-c3-shapes.mjs — STAGE-C.md C3 CAPTURE GATE ("I read it"): a REAL
   rolled octagon room + a REAL rolled rotunda + a REAL rolled L-shaped room, rendered through the
   ACTUAL theater interior pipeline (spatializePlan -> semanticizePlan -> interiorBuildBoard ->
   window.Theater.setInteriorBoard -> the landed C4 room-shell compiler), screenshotted so the
   orchestrator can READ that the shells trace those shapes, not rectangles (a harness can't judge
   "reads as an octagon" — docs/STAGE-C.md C3's own Verify §5 instruction).

   Sibling of dev/battle-gate/capture-interior-study.mjs — reuses that script's proven server/Chrome/
   boot/buildScene conventions VERBATIM (see its own header for the "why" behind each). Diverges in
   ONE load-bearing way: this script's fixture stamps a REAL `areaType`/`dims` string (off the actual
   "Dungeon Area Type" table, Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md)
   onto the FOCUS segment, so shapeForArchetype/rasterizeShape (this unit's own new code) actually
   fire — SPATIAL_SHAPES defaults ON, no flag-forcing needed. Each focus room also carries 2 real
   segment.exits[] neighbors, so the polygon-boundary door(s) are visible in frame too.

   Run:  node dev/battle-gate/capture-stage-c3-shapes.mjs
   Output: dev/battle-gate/stage-c3-shapes/{rotunda,octagon,l-shaped}.png + contact-sheet.png +
   metrics.json */

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
const outDir = path.join(__dirname, "stage-c3-shapes");
fs.mkdirSync(outDir, { recursive: true });

// a FIFTH port range — 5201-5205/5191-5195/5181-5185/5211-5215 are already claimed by sibling
// battle-gate harnesses, so this one can run concurrently with any of them.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[stage-c3-shapes-gate]", ...a); }
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

// mirrors capture-interior-study.mjs's bootToInSession verbatim (see that file's header comment for
// the full rationale — not re-explained here to avoid drift risk from a divergent copy).
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
      if (nameEl) nameEl.value = "Stage C3 Shapes Gate Soul";
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

// buildScene(page, cfg) — a small synthetic walk.segments[] fixture (walk.js:593-625 shape), with a
// REAL areaType/dims string stamped onto the FOCUS segment (s1) so shapeForArchetype/rasterizeShape
// actually classify + rasterize it as a non-rect shape. s1 carries 2 real segment.exits[] neighbors
// (s2/s3) so the polygon-boundary door(s) this unit derives are visible in frame too.
async function buildScene(page, { key, focusAreaType, focusDims, realmId, env, walkId, lightProfile }) {
  return await page.evaluate((cfg) => {
    try {
      const ids = ["s1", "s2", "s3"];
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }, { targetId: "s3" }],
          light: "normal", areaType: cfg.focusAreaType, dims: cfg.focusDims },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s3", num: 3, label: "s3", isFinale: true, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
      ];
      const plan = spatializePlan(fixture, "The Hub", { walkId: cfg.walkId });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s1");
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: cfg.realmId, env: cfg.env, focusSegNum, radius: 1 });
      if (cfg.lightProfile) board.lightProfile = cfg.lightProfile;
      return {
        ok: true, board, meta: board.meta,
        roomShape: focusRoom.shape, roomCellCount: Array.isArray(focusRoom.cells) ? focusRoom.cells.length : null,
        roomBBoxArea: focusRoom.w * focusRoom.d, roomWD: `${focusRoom.w}x${focusRoom.d}`,
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { key, focusAreaType, focusDims, realmId, env, walkId, lightProfile });
}

// three real "Dungeon Area Type" table rows (Engine/03. _Tables/03. Session Mechanics/Dungeons/
// Dungeon Area Type.md) — read the actual file rather than fabricating text.
// all 3 use realmId:"chrome" + lightProfile:"lamplit" (the same bright combo capture-interior-
// study.mjs's own "chrome" scene uses) — this gate's ONE job is proving the SHAPE reads, so every
// scene stays consistently well-lit rather than varying realm mood; a "gloom"/"fantasy" torchlit
// scene's own low-ambient falloff (correct, existing behavior) made the far half of a small room
// read as near-black in an earlier pass of this script, obscuring the very floor/wall geometry
// this gate exists to show.
// ROTUNDA/L-SHAPED bumped to bigger real rows than the verify harness uses (row 089/102, both 6x6
// cells) — a 6x6 circle only clips its 4 corners (32/36 cells), too few staircase steps for a human
// eye to read as "round" rather than "rect with clipped corners" at a glance; row 095/103 give more
// steps to work with, matching the octagon's own 12x12 scale for a fair, legible comparison.
const SCENES = [
  { key: "octagon", label: "Grand Octagon (row 101, 60'x60')", focusAreaType: "Grand Octagon", focusDims: "60' x 60'",
    realmId: "chrome", env: "dungeon", walkId: "stage-c3-shapes-octagon", lightProfile: "lamplit" },
  { key: "rotunda", label: "Grand Rotunda (row 095, 50' diameter)", focusAreaType: "Grand Rotunda", focusDims: "50' diameter",
    realmId: "chrome", env: "dungeon", walkId: "stage-c3-shapes-rotunda", lightProfile: "lamplit" },
  { key: "l-shaped", label: "L-Shaped Chamber (row 103, 40'x40' 15' arms)", focusAreaType: "L-Shaped Chamber", focusDims: "40' x 40' (15' wide arms)",
    realmId: "chrome", env: "dungeon", walkId: "stage-c3-shapes-l", lightProfile: "lamplit" },
];

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), scenes: {}, notes: [] };
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

    const shots = [];

    for (const scene of SCENES) {
      const built = await buildScene(page, scene);
      metrics.scenes[scene.key] = { label: scene.label, focusAreaType: scene.focusAreaType, focusDims: scene.focusDims, built };
      if (!built.ok) { metrics.notes.push(`scene ${scene.key} FAILED to build: ${built.error}`); continue; }
      log(`${scene.key}: shape=${built.roomShape} cells=${built.roomCellCount}/${built.roomBBoxArea} (${built.roomWD})`);
      if (built.roomShape === "rect") metrics.notes.push(`scene ${scene.key}: room classified 'rect' — shapeForArchetype/rasterizeShape did NOT fire as expected`);

      // shotCompose OFF (window.Theater.setInteriorVariant, the study-rig's own documented escape
      // hatch — theater-boot.js:9147's header) — ITR_SHOT_COMPOSE's cinematic candidate-picker (tuned
      // for a PIECE-focused beat, no pieces in this scene) was cropping to a corner; forcing it off
      // falls back to interiorCameraFitFor's plain "room" mode — the WHOLE floor bbox + a fixed pad
      // (theater-boot.js:7381) — the honest full-room read this gate actually needs.
      await page.evaluate(() => { window.Theater.setInteriorVariant({ shotCompose: false }); });
      const mounted = await page.evaluate((board) => {
        try {
          window.Theater.setInteriorBoard(board);
          return { ok: true, meshCount: window.Theater.interiorMeshCount() };
        } catch (e) { return { ok: false, error: e.message }; }
      }, built.board);
      metrics.scenes[scene.key].mounted = mounted;
      if (!mounted.ok) { metrics.notes.push(`scene ${scene.key} setInteriorBoard FAILED: ${mounted.error}`); continue; }

      await sleep(500); // let the GL frame actually paint
      // objective camera-fit proof alongside the visual read: window.Theater.interiorFrustumCheck
      // (theater-boot.js:10415, the SAME facility dev/verify-interior-camera-frustum.mjs uses)
      // confirms the room's own bbox (floor + wall-height corners) is fully inside the camera's NDC
      // frustum — i.e. this is a full-room shot, not an accidental crop.
      const frustum = await page.evaluate(() => window.Theater.interiorFrustumCheck ? window.Theater.interiorFrustumCheck() : null);
      metrics.scenes[scene.key].frustumOk = frustum ? frustum.ok : null;
      log(`  ${scene.key} frustum containment ok=${frustum && frustum.ok}`);
      if (frustum && !frustum.ok) metrics.notes.push(`scene ${scene.key}: room bbox NOT fully inside camera frustum`);
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const fileName = `${scene.key}.png`;
      const shotPath = path.join(outDir, fileName);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath });
      else await page.screenshot({ path: shotPath, fullPage: false });
      shots.push({ sceneKey: scene.key, sceneLabel: scene.label, path: shotPath, fileName });
      log(`captured ${fileName}`);
    }

    metrics.shotCount = shots.length;
    metrics.shots = shots.map((s) => ({ sceneKey: s.sceneKey, fileName: s.fileName }));

    // contact sheet: composite every captured PNG onto one grid via an in-page <canvas>.
    if (shots.length) {
      const cols = 1, rows = SCENES.length;
      const cellW = 640, cellH = 480, labelH = 22, pad = 6;
      const images = shots.map((s) => ({ ...s, b64: fs.readFileSync(s.path).toString("base64") }));
      const sheetB64 = await page.evaluate(({ images, cols, rows, cellW, cellH, labelH, pad, sceneKeys }) => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = cols * (cellW + pad) + pad;
          canvas.height = rows * (cellH + labelH + pad) + pad + labelH;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          let loaded = 0;
          images.forEach((img, i) => {
            const im = new Image();
            im.onload = () => {
              const ri = sceneKeys.indexOf(img.sceneKey);
              const x = pad;
              const y = labelH + pad + ri * (cellH + labelH + pad) + labelH;
              ctx.drawImage(im, x, y, cellW, cellH);
              ctx.fillStyle = "#eee"; ctx.font = "13px monospace";
              ctx.fillText(img.sceneLabel, x + 4, y + cellH + 14);
              loaded++;
              if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
            };
            im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + img.b64;
          });
          if (!images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
        });
      }, { images: images.map((i) => ({ b64: i.b64, sceneLabel: i.sceneLabel, sceneKey: i.sceneKey, fileName: i.fileName })), cols, rows, cellW, cellH, labelH, pad, sceneKeys: SCENES.map((s) => s.key) });
      const sheetPath = path.join(outDir, "contact-sheet.png");
      fs.writeFileSync(sheetPath, Buffer.from(sheetB64, "base64"));
      metrics.contactSheetPath = sheetPath;
      log("wrote", sheetPath);
    }

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    metrics.consoleErrorsCount = metrics.consoleErrors.length;

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("wrote metrics.json —", metrics.shotCount, "shots,", metrics.consoleErrorsCount, "console errors");
    if (metrics.shotCount < SCENES.length) {
      log("WARNING: not every scene produced a shot — see metrics.notes:", metrics.notes);
      process.exitCode = 1;
    }
    if (metrics.notes.some((n) => /classified 'rect'/.test(n))) {
      log("WARNING: a scene never actually exercised the non-rect shape path — see metrics.notes:", metrics.notes);
      process.exitCode = 1;
    }
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
