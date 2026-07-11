#!/usr/bin/env node
/* dev/battle-gate/capture-bw2-5-silhouette.mjs — BEAUTY-WAVE-2.md BW2-5's own taste-gate capture
   (SILHOUETTE UPGRADES: door arches, parapet rim, finale dais, THE COLUMN DEMOTION/furniture channel,
   + the mid-flight addendum THE PROP PERSPECTIVE LAW). Sibling of dev/battle-gate/capture-interior-
   study.mjs — reuses that script's proven server/Chrome/boot/waitForTheater helpers VERBATIM (see its
   own header for the "why" behind each), trimmed + retargeted to THIS unit's own 4 structural claims:

     1. fantasy-explore — a non-finale room, real doorways: proves arch-header corbelling + the
        wall-thickness reveal (mock-01-fantasy-explore.png is the cited target).
     2. finale-dais — the plan's own FINALE room in focus: proves the 2-step dais platform + the
        camera-side parapet rim (never "vanishes to nothing") (mock-01-finale.png is the cited target).
     3. chrome-furniture — a multi-room Hub plan, chrome realm: proves blocker dressing renders as
        real furniture-class volumes (crate/cabinet/etc.), not flat cards or square columns
        (mock-01-chrome-combat.png is the cited target).
     4. wallprops-angle — the SAME fantasy scene as (1), re-shot from TWO different camera yaws: proves
        a wall-hang (painting) prop is wall-LOCKED (reads correctly from both angles), not a camera-
        facing billboard (the addendum's own "screen at the exact opposite perspective" bug).

   Run:  node dev/battle-gate/capture-bw2-5-silhouette.mjs
   Output: dev/battle-gate/bw2-5-silhouette/{fantasy-explore,finale-dais,chrome-furniture,
   wallprops-angle-yaw0,wallprops-angle-yaw1}.png + contact-sheet.png + metrics.json */

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
const outDir = path.join(__dirname, "bw2-5-silhouette");
fs.mkdirSync(outDir, { recursive: true });

// a FIFTH port range (5181-85 stage / 5191-95 place-tray / 5201-05 interior-study / 5211-15 dungeon-loop)
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[bw2-5-silhouette-gate]", ...a); }
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

// mirrors capture-interior-study.mjs's bootToInSession verbatim.
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
      if (nameEl) nameEl.value = "BW2-5 Silhouette Gate Soul";
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

// buildFixture: same linear-chain/hub-topology in-page generator capture-interior-study.mjs uses.
function buildFixtureSrc() {
  return `
    function buildFixture(topology, n) {
      const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
      const group = topology === "The Hub" ? "hub" : "linear";
      const edges = [];
      if (group === "hub") {
        const spokeCount = Math.min(n - 1, 4);
        for (let i = 1; i < n; i++) edges.push([ids[0], ids[Math.min(i, spokeCount)]]);
      } else {
        for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
      }
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
        exits: (adj[id] || []).map((tid) => ({ targetId: tid })),
        light: "normal",
      }));
    }
  `;
}

async function buildScene(page, cfg) {
  return await page.evaluate((cfg) => {
    try {
      eval(cfg.buildFixtureSrc);
      const fixture = buildFixture(cfg.topology, cfg.n || 6);
      const plan = spatializePlan(fixture, cfg.topology, { walkId: cfg.walkId });
      const semPlan = semanticizePlan(plan, fixture, []);
      const dressedPlan = dressPlan(semPlan, { realmId: cfg.realmId, walkId: cfg.walkId }); // PRODUCTION order (theater-data.js): dress THEN build
      const focusRoom = cfg.focusRole
        ? (dressedPlan.rooms.find((r) => r.role === cfg.focusRole) || dressedPlan.rooms[0])
        : dressedPlan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(dressedPlan, { realmId: cfg.realmId, env: "dungeon", focusSegNum, radius: 1 });
      if (cfg.pieces && cfg.pieces.length) {
        board.pieces = cfg.pieces.map((p) => Object.assign({}, p));
      }
      return {
        ok: true, board, meta: board.meta,
        focusRoomRole: focusRoom.role, focusRoomRect: { x: focusRoom.x, y: focusRoom.y, w: focusRoom.w, d: focusRoom.d },
        daisTop: board.daisTop, furnitureCount: (board.furniture || []).length, wallPropsCount: (board.wallProps || []).length,
        doorArchCount: (board.instances.doorframe || []).filter((d) => d.archStep != null).length,
        wallRevealCount: (board.instances.wall || []).filter((w) => (w.ox || 0) !== 0 || (w.oz || 0) !== 0).length,
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { ...cfg, buildFixtureSrc: buildFixtureSrc() });
}

const SCENES = [
  { key: "fantasy-explore", label: "fantasy explore (arches+reveals)", topology: "The Spine", n: 6, realmId: "fantasy", walkId: "bw2-5-fantasy-explore", focusRole: "entrance" },
  { key: "finale-dais", label: "finale dais (parapet+2-step platform)", topology: "The Spine", n: 6, realmId: "gloom", walkId: "bw2-5-finale-dais", focusRole: "finale",
    pieces: [{ slug: "Ogre Zombie", preferDais: true, roomSegNum: null }] },
  { key: "chrome-furniture", label: "chrome furniture (crates not columns)", topology: "The Hub", n: 6, realmId: "chrome", walkId: "bw2-5-chrome-furniture", focusRole: null },
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
          return { ok: true, meshCount: window.Theater.interiorMeshCount() };
        } catch (e) { return { ok: false, error: e.message }; }
      }, built.board);
      metrics.scenes[scene.key].mounted = mounted;
      if (!mounted.ok) { metrics.notes.push(`scene ${scene.key} setInteriorBoard FAILED: ${mounted.error}`); continue; }
      await sleep(500);
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const shotPath = path.join(outDir, `${scene.key}.png`);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath }); else await page.screenshot({ path: shotPath, fullPage: false });
      shots.push({ sceneKey: scene.key, sceneLabel: scene.label, path: shotPath, fileName: `${scene.key}.png` });
      log(`captured ${scene.key}.png`);

      // wallprops-angle: re-shoot the fantasy-explore scene from a SECOND camera yaw (rotateBoard, the
      // same production rotate control) — a wall-hang PROP must read consistently from BOTH angles
      // (wall-LOCKED), unlike the pre-addendum billboard bug (always faces the camera, so it looked
      // "correct" from only ONE side and backwards/sideways from others).
      if (scene.key === "fantasy-explore") {
        const yaw0Path = path.join(outDir, "wallprops-angle-yaw0.png");
        if (canvasEl) await canvasEl.screenshot({ path: yaw0Path }); else await page.screenshot({ path: yaw0Path, fullPage: false });
        shots.push({ sceneKey: "wallprops-angle-yaw0", sceneLabel: "wall-hang @ yaw 0", path: yaw0Path, fileName: "wallprops-angle-yaw0.png" });
        await page.evaluate(() => { if (typeof window.Theater.rotate === "function") window.Theater.rotate(); });
        await sleep(500);
        const canvasEl2 = await page.$(".theater-stage-canvas canvas");
        const yaw1Path = path.join(outDir, "wallprops-angle-yaw1.png");
        if (canvasEl2) await canvasEl2.screenshot({ path: yaw1Path }); else await page.screenshot({ path: yaw1Path, fullPage: false });
        shots.push({ sceneKey: "wallprops-angle-yaw1", sceneLabel: "wall-hang @ yaw 1", path: yaw1Path, fileName: "wallprops-angle-yaw1.png" });
        log("captured wallprops-angle-yaw0/yaw1.png");
      }
    }

    metrics.shotCount = shots.length;
    metrics.shots = shots.map((s) => ({ sceneKey: s.sceneKey, fileName: s.fileName }));

    // contact sheet (in-page canvas composite, same technique capture-interior-study.mjs uses)
    if (shots.length) {
      const cellW = 480, cellH = 360, labelH = 22, pad = 8, cols = 3;
      const rows = Math.ceil(shots.length / cols);
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
            const ci = i % cols, ri = Math.floor(i / cols);
            const x = pad + ci * (cellW + pad), y = pad + ri * (cellH + labelH + pad);
            im.onload = () => {
              ctx.drawImage(im, x, y, cellW, cellH);
              ctx.fillStyle = "#eee"; ctx.font = "13px monospace";
              ctx.fillText(img.sceneLabel, x + 4, y + cellH + 16);
              loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
            };
            im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + img.b64;
          });
        });
      }, { images: images.map((i) => ({ b64: i.b64, sceneLabel: i.sceneLabel })), cols, cellW, cellH, labelH, pad });
      const sheetPath = path.join(outDir, "contact-sheet.png");
      fs.writeFileSync(sheetPath, Buffer.from(sheetB64, "base64"));
      metrics.contactSheetPath = sheetPath;
      log("wrote", sheetPath);
    }

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    metrics.consoleErrorsCount = metrics.consoleErrors.length;
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("wrote metrics.json —", metrics.shotCount, "shots,", metrics.consoleErrorsCount, "console errors");
    if (metrics.shotCount < SCENES.length + 2) {
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
