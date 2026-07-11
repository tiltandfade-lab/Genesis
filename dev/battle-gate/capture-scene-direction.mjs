#!/usr/bin/env node
/* dev/battle-gate/capture-scene-direction.mjs — VP4 SCENE ART DIRECTION (docs/BEAUTY-WAVE.md §VP4)
   study card — the ONE unit the spec itself flags as "most needing EYES" (Adam taste-gates the card).

   Sibling of dev/battle-gate/capture-interior-study.mjs — reuses that script's proven server/Chrome/
   boot conventions VERBATIM (same rationale, not re-explained here). Trimmed/extended to THIS unit's
   own scope: unlike capture-interior-study.mjs, buildScene here calls dressPlan(semPlan,{realmId})
   BEFORE interiorBuildBoard so plan.dressing (and its `.focal` tag) actually reaches the board —
   capture-interior-study.mjs never dresses its scenes, so it can't show VP4's key-light relocation or
   accent-doorframe tint at all. ONE variant per scene (no rig-on/off sweep — that question is GR3's,
   already answered): 4 scenes, one per distinct room ROLE (entrance/pocket/finale + a path room),
   spanning 3 realms, so the contact sheet shows the painted-scene hierarchy (item 1), the key light
   sitting beside the room's focal piece (item 2), the one-thread accent tint on a doorframe (item 3),
   and the finale room's extra brightness (item 4) side by side.

   CAPTURE-SERVER GOTCHA (docs/BEAUTY-WAVE.md orchestrator note): this script's own port range
   (5211-5215) is DEDICATED — never shared with capture-interior-study.mjs's 5201-5205 or
   capture-place-tray.mjs's 5191-5195 — so a stale server from a DIFFERENT script's tree can never be
   silently reused here. startServer() still probes+logs "already serving THIS tree" either way.

   Run:  node dev/battle-gate/capture-scene-direction.mjs
   Output: dev/battle-gate/scene-direction/{entrance,pocket,finale,path}-*.png + study-card.png +
   metrics.json (UNCOMMITTED — orchestrator re-shoots at integration, per the unit's own instructions) */

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
const outDir = path.join(__dirname, "scene-direction");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5211, 5212, 5213, 5214, 5215];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[scene-direction-gate]", ...a); }
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

// mirrors capture-interior-study.mjs's bootToInSession verbatim (see that file's header comment).
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
      if (nameEl) nameEl.value = "Scene Direction Gate Soul";
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

// buildScene: a small branching fixture (spine + a couple of pockets) so semanticizePlan's role
// assignment actually yields entrance/path/pocket/finale rooms — then dressPlan(semPlan,{realmId})
// BEFORE interiorBuildBoard so plan.dressing (and each room's tagged `.focal` piece) reaches the
// board this unit's itrRoomLights reads.
async function buildScene(page, { realmId, walkId, focusRole, pieces }) {
  return await page.evaluate((cfg) => {
    try {
      const nSpine = 7, nPockets = 3;
      const ids = Array.from({ length: nSpine }, (_, i) => "s" + (i + 1));
      const segs = ids.map((id, i) => ({
        id, num: i + 1, label: id, isFinale: i === nSpine - 1, depth: i,
        exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < nSpine - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
        light: "normal",
      }));
      for (let p = 0; p < nPockets; p++) {
        const parentIdx = 1 + (p % (nSpine - 2 > 0 ? nSpine - 2 : 1));
        const pid = "p" + (p + 1);
        segs.push({ id: pid, num: nSpine + p + 1, label: pid, isFinale: false, depth: segs[parentIdx].depth + 1, exits: [{ targetId: segs[parentIdx].id }], light: "normal" });
        segs[parentIdx].exits.push({ targetId: pid });
      }
      const plan = spatializePlan(segs, "Scene Direction Study", { walkId: cfg.walkId });
      const semPlan = semanticizePlan(plan, segs, []);
      const dressed = dressPlan(semPlan, { realmId: cfg.realmId, walkId: cfg.walkId + "-dress" });
      const focusRoom = dressed.rooms.find((r) => r.role === cfg.focusRole) || dressed.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(dressed, { realmId: cfg.realmId, env: "dungeon", focusSegNum, radius: 1 });
      board.dressing = dressed.dressing || [];

      function piecePositions(room, count) {
        const inX = Math.max(room.x + 1, room.x), inY = Math.max(room.y + 1, room.y);
        const maxX = Math.max(inX, room.x + room.w - 2), maxY = Math.max(inY, room.y + room.d - 2);
        return [{ x: inX, y: inY }, { x: maxX, y: inY }, { x: inX, y: maxY }, { x: maxX, y: maxY }].slice(0, count);
      }
      if (cfg.pieces && cfg.pieces.length) {
        const positions = piecePositions(focusRoom, cfg.pieces.length);
        board.pieces = cfg.pieces.map((slug, i) => ({ slug, cellX: positions[i].x, cellY: positions[i].y }));
      }
      const roomLights = board.lights.filter((l) => l.roomSegNum === focusSegNum);
      const roomDressing = (dressed.dressing || []).filter((d) => d.roomSegNum === focusSegNum);
      const focal = roomDressing.find((d) => d.focal) || null;
      return {
        ok: true, board, meta: board.meta,
        vp4: {
          role: focusRoom.role, keyIntensity: roomLights[0] ? roomLights[0].intensity : null,
          fillIntensities: roomLights.slice(1).map((l) => l.intensity),
          focal: focal ? { x: focal.x, y: focal.y, slug: focal.slug } : null,
          keyPos: roomLights[0] ? { x: roomLights[0].x, z: roomLights[0].z } : null,
        },
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { realmId, walkId, focusRole, pieces });
}

const SCENES = [
  { key: "entrance", label: "chrome entrance room", realmId: "chrome", walkId: "vp4-chrome-entrance", focusRole: "entrance", pieces: ["Wolf", "Knight"] },
  { key: "pocket", label: "gloom pocket room", realmId: "gloom", walkId: "vp4-gloom-pocket", focusRole: "pocket", pieces: ["Skeleton"] },
  { key: "path", label: "fantasy path room", realmId: "fantasy", walkId: "vp4-fantasy-path", focusRole: "path", pieces: ["Wolf", "Zombie"] },
  { key: "finale", label: "gloom finale room", realmId: "gloom", walkId: "vp4-gloom-finale", focusRole: "finale", pieces: ["Ogre Zombie", "Guard"] },
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
      metrics.scenes[scene.key] = { label: scene.label, built };
      if (!built.ok) { metrics.notes.push(`scene ${scene.key} FAILED to build: ${built.error}`); continue; }

      const mounted = await page.evaluate((board) => {
        try {
          window.Theater.setInteriorBoard(board);
          return {
            ok: true,
            meshCount: window.Theater.interiorMeshCount(),
            piecesResolved: window.Theater.interiorPiecesResolved(),
            piecesRequested: window.Theater.interiorPiecesRequested(),
            lightCount: window.Theater.interiorLightCount(),
          };
        } catch (e) { return { ok: false, error: e.message }; }
      }, built.board);
      metrics.scenes[scene.key].mounted = mounted;
      if (!mounted.ok) { metrics.notes.push(`scene ${scene.key} setInteriorBoard FAILED: ${mounted.error}`); continue; }

      if (mounted.piecesRequested > 0) {
        const deadline = Date.now() + 3000;
        let latest = mounted;
        while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
          await sleep(200);
          latest = await page.evaluate(() => ({
            piecesResolved: window.Theater.interiorPiecesResolved(),
            piecesRequested: window.Theater.interiorPiecesRequested(),
          }));
        }
        mounted.piecesResolved = latest.piecesResolved;
      }

      await sleep(400);
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const fileName = `${scene.key}.png`;
      const shotPath = path.join(outDir, fileName);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath });
      else await page.screenshot({ path: shotPath, fullPage: false });
      shots.push({ sceneKey: scene.key, sceneLabel: scene.label, path: shotPath, fileName, vp4: built.vp4 });
      log(`captured ${fileName} — role=${built.vp4.role} key=${built.vp4.keyIntensity} focal=${JSON.stringify(built.vp4.focal)}`);
    }

    metrics.shotCount = shots.length;
    metrics.shots = shots.map((s) => ({ sceneKey: s.sceneKey, fileName: s.fileName, vp4: s.vp4 }));

    if (shots.length) {
      const cols = 2, rows = Math.ceil(shots.length / cols);
      const cellW = 480, cellH = 360, labelH = 22, pad = 6;
      const images = shots.map((s) => ({ ...s, b64: fs.readFileSync(s.path).toString("base64") }));
      const sheetB64 = await page.evaluate(({ images, cols, cellW, cellH, labelH, pad }) => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          const rows = Math.ceil(images.length / cols);
          canvas.width = cols * (cellW + pad) + pad;
          canvas.height = rows * (cellH + labelH + pad) + pad;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          let loaded = 0;
          images.forEach((img, i) => {
            const im = new Image();
            const ri = Math.floor(i / cols), ci = i % cols;
            const x = pad + ci * (cellW + pad);
            const y = pad + ri * (cellH + labelH + pad);
            im.onload = () => {
              ctx.drawImage(im, x, y, cellW, cellH);
              ctx.fillStyle = "#eee"; ctx.font = "13px monospace";
              ctx.fillText(img.sceneLabel, x + 4, y + cellH + 16);
              loaded++;
              if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
            };
            im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + img.b64;
          });
          if (!images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
        });
      }, { images: images.map((i) => ({ b64: i.b64, sceneLabel: i.sceneLabel })), cols, cellW, cellH, labelH, pad });
      const sheetPath = path.join(outDir, "study-card.png");
      fs.writeFileSync(sheetPath, Buffer.from(sheetB64, "base64"));
      metrics.studyCardPath = sheetPath;
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
