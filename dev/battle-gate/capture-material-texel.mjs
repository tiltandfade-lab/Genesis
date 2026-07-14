#!/usr/bin/env node
/* dev/battle-gate/capture-material-texel.mjs — BEAUTY-WAVE-2 BW2-3 MATERIAL TEXEL taste-loop capture.

   The OPUS taste-loop gate for BW2-3: shoot the three flagship realms (chrome/gloom/fantasy) at the
   BW2-1 tight beat camera with the folded PACKET-02 wall/floor/trim/pillar textures ON, so the walls
   read as masonry and the chrome floor as wet tile — READ vs ui-sketches/mock-frames/mock-01-*.png.

   Reuses dev/battle-gate/capture-interior-study.mjs's server/Chrome/boot/buildScene conventions
   VERBATIM (see that file's header for the "why"), trimmed to: rig-ON only, poll interiorFileTexPending
   to 0 before every screenshot (the folded textures load async), one full-frame shot per realm + a
   3-up contact card. Port range 5211-5215 (a distinct band; kill stale servers there before a run).

   Run:  MT_ROUND=1 node dev/battle-gate/capture-material-texel.mjs
   Output: dev/battle-gate/material-texel/round-<N>-{chrome,gloom,fantasy}.png + round-<N>.png (contact)
           + round-<N>-metrics.json */

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
const outDir = path.join(__dirname, "material-texel");
fs.mkdirSync(outDir, { recursive: true });
const ROUND = process.env.MT_ROUND || "1";

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5211, 5212, 5213, 5214, 5215];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[material-texel-gate]", ...a); }
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
    log(`starting python3 -m http.server ${port} in ${repoRoot}`);
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
  page.on("console", (msg) => { if (msg.type() === "error") { page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

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
      if (nameEl) nameEl.value = "Material Texel Gate Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found", notes };
      if (typeof startSession === "function") { startSession(world.id); }
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

async function buildScene(page, { topology, realmId, env, walkId, residents, lightProfile, pieces }) {
  return await page.evaluate((cfg) => {
    try {
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
          exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal",
        }));
      }
      const fixture = buildFixture(cfg.topology, 6);
      const plan = spatializePlan(fixture, cfg.topology, { walkId: cfg.walkId });
      const semPlan = cfg.residents ? semanticizePlan(plan, fixture, cfg.residents) : plan;
      const focusRoom = semPlan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: cfg.realmId, env: cfg.env, focusSegNum, radius: 1 });
      if (cfg.lightProfile) board.lightProfile = cfg.lightProfile;
      function piecePositions(room, count) {
        const inX = Math.max(room.x + 1, room.x), inY = Math.max(room.y + 1, room.y);
        const maxX = Math.max(inX, room.x + room.w - 2), maxY = Math.max(inY, room.y + room.d - 2);
        return [{ x: inX, y: inY }, { x: maxX, y: inY }, { x: inX, y: maxY }, { x: maxX, y: maxY }].slice(0, count);
      }
      if (cfg.pieces && cfg.pieces.length) {
        const positions = piecePositions(focusRoom, cfg.pieces.length);
        board.pieces = cfg.pieces.map((slug, i) => ({ slug, cellX: positions[i].x, cellY: positions[i].y }));
      }
      // structural asserts for the metrics.json read: the folded texture file the tileKit actually
      // carries per surface (the VARIANT ROLL's pick), so the harness can prove flagships got FILES not
      // the procedural fallback, and the wrap verdict each got.
      const tk = board.tileKit || {};
      return { ok: true, board, tex: {
        floorFile: tk.floorTextureFile, floorWrap: tk.floorTextureWrap,
        wallFile: tk.wallTextureFile, wallWrap: tk.wallTextureWrap,
        trimFile: tk.trimTextureFile, trimWrap: tk.trimTextureWrap,
        roomW: focusRoom.w, roomD: focusRoom.d,
      } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { topology, realmId, env, walkId, residents, lightProfile, pieces });
}

const SCENES = [
  { key: "chrome", realmId: "chrome", env: "dungeon", topology: "The Hub", walkId: "material-texel-chrome-hub", residents: null, lightProfile: "lamplit", pieces: ["Wolf", "Giant Rat", "Spider", "Knight"] },
  { key: "gloom", realmId: "gloom", env: "dungeon", topology: "The Spine", walkId: "material-texel-gloom-spine", residents: [{ segNum: 1, scaleVsHuman: 2.5, apex: false }], lightProfile: "torchlit", pieces: ["Ogre Zombie", "Skeleton", "Zombie", "Guard"] },
  { key: "fantasy", realmId: "fantasy", env: "dungeon", topology: "The Spine", walkId: "material-texel-fantasy-spine", residents: null, lightProfile: "torchlit", pieces: ["Wolf", "Zombie", "Ape", "Guard"] },
];

async function main() {
  const metrics = { round: ROUND, generatedAt: new Date().toISOString(), scenes: {}, notes: [] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const boot = await bootToInSession(page);
    metrics.boot = { ok: boot.ok, stage: boot.stage };
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("setInteriorBoard never available: " + JSON.stringify(theaterState));

    const shots = [];
    for (const scene of SCENES) {
      const built = await buildScene(page, scene);
      metrics.scenes[scene.key] = { tex: built.tex, built: built.ok };
      if (!built.ok) { metrics.notes.push(`scene ${scene.key} build FAILED: ${built.error}`); continue; }

      const mounted = await page.evaluate((board) => {
        try {
          window.Theater.setInteriorVariant({ materials: true, ao: false, banded: false, rig: true });
          window.Theater.setInteriorBoard(board);
          return { ok: true, piecesRequested: window.Theater.interiorPiecesRequested(), filePending: window.Theater.interiorFileTexPending() };
        } catch (e) { return { ok: false, error: e.message }; }
      }, built.board);
      if (!mounted.ok) { metrics.notes.push(`scene ${scene.key} mount FAILED: ${mounted.error}`); continue; }

      // wait for the async folded-texture decodes AND the piece sprites to land, then a paint margin.
      const deadline = Date.now() + 6000;
      let latest = mounted;
      while (Date.now() < deadline) {
        latest = await page.evaluate(() => ({
          filePending: window.Theater.interiorFileTexPending(),
          piecesResolved: window.Theater.interiorPiecesResolved(),
          piecesRequested: window.Theater.interiorPiecesRequested(),
        }));
        if (latest.filePending === 0 && latest.piecesResolved >= latest.piecesRequested) break;
        await sleep(200);
      }
      metrics.scenes[scene.key].filePending = latest.filePending;
      metrics.scenes[scene.key].piecesResolved = latest.piecesResolved;
      await sleep(500); // paint margin (the async texture onLoad already markDirty'd the render)

      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const fileName = `round-${ROUND}-${scene.key}.png`;
      const shotPath = path.join(outDir, fileName);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath });
      else await page.screenshot({ path: shotPath, fullPage: false });
      shots.push({ key: scene.key, path: shotPath, fileName });
      log(`captured ${fileName} (filePending=${latest.filePending})`);
    }

    // 3-up contact card round-<N>.png
    if (shots.length) {
      const cellW = 520, cellH = 390, labelH = 20, pad = 6;
      const images = shots.map((s) => ({ key: s.key, b64: fs.readFileSync(s.path).toString("base64") }));
      const sheetB64 = await page.evaluate(({ images, cellW, cellH, labelH, pad }) => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = images.length * (cellW + pad) + pad;
          canvas.height = cellH + labelH + pad * 2;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          let loaded = 0;
          images.forEach((img, i) => {
            const im = new Image();
            im.onload = () => {
              const x = pad + i * (cellW + pad), y = labelH + pad;
              ctx.drawImage(im, x, y, cellW, cellH);
              ctx.fillStyle = "#eee"; ctx.font = "13px monospace"; ctx.fillText(img.key, x + 4, labelH - 4);
              loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
            };
            im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + img.b64;
          });
        });
      }, { images, cellW, cellH, labelH, pad });
      fs.writeFileSync(path.join(outDir, `round-${ROUND}.png`), Buffer.from(sheetB64, "base64"));
      log(`wrote round-${ROUND}.png contact card`);
    }

    metrics.consoleErrors = (await page.evaluate(() => (window.__bgConsoleErrors || []).slice())).slice(0, 20);
    fs.writeFileSync(path.join(outDir, `round-${ROUND}-metrics.json`), JSON.stringify(metrics, null, 2));
    log(`round ${ROUND}: ${shots.length} shots, ${metrics.consoleErrors.length} console errors`);
  } catch (e) {
    metrics.error = e.message;
    fs.writeFileSync(path.join(outDir, `round-${ROUND}-metrics.json`), JSON.stringify(metrics, null, 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
