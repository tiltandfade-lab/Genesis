#!/usr/bin/env node
/* dev/battle-gate/capture-practicals.mjs — docs/WALL-VOLUMES-PRACTICALS.md Unit E0, capture gate.
   Renders one room lit by the six demonstrated fixture families (frame 03,
   ui-sketches/mock-frames/vq-next-waves/03-visible-practicals.png): floor candle cluster, handled
   floor lantern, low brazier, wall sconce, ceiling-hung lamp [DEFERRED — see the spec's own §E0
   Decisions "Ceiling deferred"], chrome faceted crystal. Injects synthetic light records carrying
   real fixtureId/mount/emitterLocal fields (bypassing the realm-seeded resolution, same
   "injectTorch"-style determinism-by-construction convention dev/battle-gate/capture-value-plunge.mjs
   already uses for its own shadow-probe scene) so every family appears in ONE room regardless of which
   realm's RNG would normally pick it — a single-room demo, not a claim about any one realm's own mix.

   The wall sconce snaps to a REAL C4.1a mount slot (S.interiorLastRoomShell.mountSlots) — ITR_ROOM_SHELL
   stays at its production default (on), so this also doubles as a live smoke test of the E0 wall-mount
   seam (interiorBuildLights' new `wallMountData` thread) against real compiled-shell geometry.

   Writes dev/battle-gate/practicals/{room-overview.png, room-closeup.png, contact-sheet.png}
   (UNCOMMITTED evidence, orchestrator reads it against frame 03).

   DEDICATED PORT RANGE 5271-5275 — checked against every PORT_CANDIDATES literal in dev/*.mjs +
   dev/battle-gate/*.mjs at authoring time (5191/5201/5206/5211/5216/5221/5231/5241/5251/5261 taken).

   Run:  node dev/battle-gate/capture-practicals.mjs */

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
const outDir = path.join(__dirname, "practicals");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5271, 5272, 5273, 5274, 5275];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[capture-practicals]", ...a); }
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

const SHOT_W = 1600, SHOT_H = 900;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}
async function newPage(browser) {
  const page = await browser.newPage();
  page.on("console", (msg) => { if (msg.type() === "error") log("console.error:", msg.text().slice(0, 200)); });
  page.on("pageerror", (e) => log("PAGE ERROR:", e.message));
  return page;
}

// bootToInSession/waitForTheater — verbatim from dev/verify-diegetic-light.mjs's own convention.
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
      if (nameEl) nameEl.value = "Visible Practicals Gate Soul";
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

// buildPracticalsRoom: a single generous room (gloom kit — the stone-and-iron read frame 03 targets),
// ITR_ROOM_SHELL at its production default (on) so wall-mount fixtures resolve against REAL C4.1a
// mount-slot geometry. board.lights is REPLACED with 5 synthetic, hand-placed fixture records (the
// spec's own 6 families minus the deferred ceiling lamp) — deterministic by construction, independent
// of any one realm's seeded resolution (that determinism is verify-visible-practicals.mjs's own job).
async function buildPracticalsRoom(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [{ id: "s1", num: 1, label: "s1", isFinale: false, depth: 0, exits: [], light: "normal" }];
      const plan = spatializePlan(fixture, "Practicals Study", { walkId: "e0-practicals-demo" });
      const focusRoom = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      const cx0 = focusRoom.x + Math.floor(focusRoom.w / 2), cz0 = focusRoom.y + Math.floor(focusRoom.d / 2);

      board.lights = [
        // floor candle cluster — center-left
        { x: cx0 - 2, z: cz0 + 1, y: 2.5, color: "#ffbb66", intensity: 1.2, distance: 5.5, decay: 2, kind: "torch", roomSegNum: focusRoom.segNum, fixtureId: "candle-cluster", mount: "floor", emitterLocal: { x: 0, y: 0.28, z: 0.02 } },
        // handled floor lantern — center
        { x: cx0, z: cz0 + 1, y: 2.5, color: "#ffb347", intensity: 1.2, distance: 6, decay: 2, kind: "lamp", roomSegNum: focusRoom.segNum, fixtureId: "lantern-handled", mount: "floor", emitterLocal: { x: 0, y: 0.30, z: 0 } },
        // low brazier — center-right
        { x: cx0 + 2, z: cz0 + 1, y: 2.5, color: "#ff9a44", intensity: 1.3, distance: 6, decay: 2, kind: "torch", roomSegNum: focusRoom.segNum, fixtureId: "brazier-low", mount: "floor", emitterLocal: { x: 0, y: 0.32, z: 0 } },
        // chrome faceted crystal — far corner (floor pedestal)
        { x: cx0 - 2, z: cz0 - 1, y: 2.5, color: "#bfe8ff", intensity: 1.1, distance: 6, decay: 2, kind: "lamp", roomSegNum: focusRoom.segNum, fixtureId: "crystal-faceted", mount: "floor", emitterLocal: { x: 0, y: 0.30, z: 0 } },
        // wall sconce — snaps to the nearest REAL C4.1a mount slot (mount:"wall", no explicit worldPos —
        // interiorBuildLights resolves it against S.interiorLastRoomShell.mountSlots at render time).
        { x: cx0, z: focusRoom.y + 1, y: 2.5, color: "#ff8844", intensity: 0.9, distance: 5, decay: 2, kind: "torch", roomSegNum: focusRoom.segNum, fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.05, z: 0.16 } },
      ];
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      return { ok: true, board, probe: { center: { x: cx0, z: cz0 }, bounds: board.bounds } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

async function mountAndShoot(page, board, outPath) {
  const mounted = await page.evaluate((b) => {
    try {
      window.Theater.setInteriorBoard(b);
      return { ok: true, meshCount: window.Theater.interiorMeshCount(), lightCount: window.Theater.interiorLightCount(), glowCount: window.Theater.interiorLightGlowCount() };
    } catch (e) { return { ok: false, error: e.message }; }
  }, board);
  if (!mounted.ok) throw new Error("mount failed: " + mounted.error);
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  await sleep(600); // let one flicker tick settle so the emitters read at their steady-state glow
  const canvasEl = await page.$(".theater-stage-canvas canvas");
  if (canvasEl) await canvasEl.screenshot({ path: outPath }); else await page.screenshot({ path: outPath });
  return mounted;
}

async function main() {
  const server = await startServer();
  let browser = null;
  const report = { generatedAt: new Date().toISOString(), notes: [] };
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("theater never ready: " + JSON.stringify(theaterState));

    const built = await buildPracticalsRoom(page);
    if (!built.ok) throw new Error("scene build failed: " + built.error);

    // ROOM OVERVIEW — the room-framed shot (frame 03's own composition: all 5 fixtures visible at once).
    const overviewPath = path.join(outDir, "room-overview.png");
    const mounted = await mountAndShoot(page, built.board, overviewPath);
    log(`room-overview: meshCount=${mounted.meshCount} lightCount=${mounted.lightCount} glowCount=${mounted.glowCount} (glowCount must be 0 — the diagnostics-only disc stays off in production)`);
    report.roomOverview = { path: overviewPath, ...mounted };

    // sanity: glowCount MUST be 0 (production default) and every fixture must have resolved.
    const emitters = await page.evaluate(() => window.Theater._interiorFixtureEmittersForTest());
    report.emitters = emitters;
    log(`fixture emitters: ${JSON.stringify(emitters)}`);
    if (mounted.glowCount !== 0) report.notes.push(`WARNING: glowCount=${mounted.glowCount}, expected 0 in production`);
    if (!emitters || emitters.length !== 5) report.notes.push(`WARNING: expected 5 fixture emitters, found ${emitters && emitters.length}`);
    const wallEmitter = (emitters || []).find((e) => e.mount === "wall");
    if (!wallEmitter || wallEmitter.ownerSegIndex == null) report.notes.push(`WARNING: the wall sconce fixture never resolved a real ownerSegIndex (found ${JSON.stringify(wallEmitter)}) — it may have degraded to floor`);
    else log(`wall sconce resolved ownerSegIndex=${wallEmitter.ownerSegIndex} (a real C4.1a mount slot, not a degrade)`);

    // ROOM CLOSEUP — a beat-framed shot centered on the candle-cluster/lantern/brazier trio (the
    // orchestrator's own "only the emitter glows, warm floor pools" read is easier to judge close-in).
    await page.evaluate((b) => {
      const closeup = Object.assign({}, b, { cameraFit: { mode: "beat", cells: [{ x: b.lights[0].x, y: b.lights[0].z }, { x: b.lights[2].x, y: b.lights[2].z }] } });
      window.Theater.setInteriorBoard(closeup);
    }, built.board);
    await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
    await sleep(500);
    const closeupPath = path.join(outDir, "room-closeup.png");
    const canvasEl2 = await page.$(".theater-stage-canvas canvas");
    if (canvasEl2) await canvasEl2.screenshot({ path: closeupPath }); else await page.screenshot({ path: closeupPath });
    report.roomCloseup = { path: closeupPath };

    // CONTACT SHEET — both shots stacked, labeled, for a one-glance orchestrator read.
    const images = [
      { path: overviewPath, label: "room-overview (5 fixture families: candle cluster / handled lantern / brazier / crystal / wall sconce)" },
      { path: closeupPath, label: "room-closeup (candle cluster -> lantern -> brazier trio)" },
    ].map((s) => ({ ...s, b64: fs.readFileSync(s.path).toString("base64") }));
    const sheetB64 = await page.evaluate(({ images, cellW, cellH, labelH, pad }) => new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = cellW + pad * 2; canvas.height = images.length * (cellH + labelH + pad) + pad;
      const ctx = canvas.getContext("2d"); ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      let loaded = 0;
      images.forEach((img, i) => {
        const im = new Image(); const y = pad + i * (cellH + labelH + pad);
        im.onload = () => { ctx.drawImage(im, pad, y, cellW, cellH); ctx.fillStyle = "#eee"; ctx.font = "13px monospace"; ctx.fillText(img.label, pad + 4, y + cellH + 16); loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
        im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
        im.src = "data:image/png;base64," + img.b64;
      });
    }), { images: images.map((i) => ({ b64: i.b64, label: i.label })), cellW: 1400, cellH: 787, labelH: 22, pad: 10 });
    fs.writeFileSync(path.join(outDir, "contact-sheet.png"), Buffer.from(sheetB64, "base64"));

    fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
    log(`wrote ${outDir}/{room-overview.png, room-closeup.png, contact-sheet.png, report.json}`);
    if (report.notes.length) { log("NOTES:", JSON.stringify(report.notes)); }
  } catch (e) {
    report.error = e.message;
    fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
    log("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}
main();
