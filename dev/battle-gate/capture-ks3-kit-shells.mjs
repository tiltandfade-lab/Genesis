#!/usr/bin/env node
/* dev/battle-gate/capture-ks3-kit-shells.mjs — docs/KENNEY-SOCKET-WAVE.md KS-3's REQUIRED capture cards:
   "the SAME rolled room kit-shell ON vs prism (flag off) for rect + octagon + L, fantasy realm,
   torchlit, same camera asserted — 6 panels. Plus one wide dressed-room beauty shot with kit walls +
   kit door + props."

   Server/Chrome/boot conventions VERBATIM from dev/battle-gate/capture-ks2-door-assembly.mjs (itself
   VERBATIM from capture-d4-doors.mjs) — port range 5231-5235, a fresh range. Same HAND-BUILT-plan
   technique as capture-ks2-door-assembly.mjs (calls the real window.interiorBuildBoard directly rather
   than hoping a random roll produces the exact shape/topology this card needs).

   REALM GRADING (KS-3's own retrofit target): board.renderProfile is stamped via the REAL
   theaterStampRenderProfile("fantasy") in-page (not left null) — the KS-2 capture never set this field,
   which is exactly why the door's own realm-grading-passthrough deviation was invisible in that card.
   This capture proves the retrofit landed: every kit piece (door AND the new wall/floor pieces) takes
   the SAME live fantasy grade.

   Run:  node dev/battle-gate/capture-ks3-kit-shells.mjs
   Output: dev/battle-gate/ks3-kit-shells/{rect,octagon,l}-{kit-on,prism-off}.png + beauty-dressed.png +
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
const outDir = path.join(__dirname, "ks3-kit-shells");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5231, 5232, 5233, 5234, 5235];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[ks3-kit-shells-gate]", ...a); }
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
  page.on("console", (msg) => { if (msg.type() === "error") log("console.error:", msg.text().slice(0, 200)); });
  page.on("pageerror", (e) => log("PAGE ERROR:", e.message));
  return page;
}

// mirrors capture-ks2-door-assembly.mjs's bootToInSession verbatim.
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
      if (nameEl) nameEl.value = "KS-3 Kit Shells Gate Soul";
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

// waits for the graded kit templates (door + wall + floor, all keyed "@fantasy") to settle — a
// screenshot taken before this is warm would show a stale/ungraded piece or the prism fallback,
// defeating both the kit-on/prism-off comparison AND the grading-retrofit proof.
async function waitForKitTemplates(page) {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    const ready = await page.evaluate(() => {
      const T = window.Theater;
      if (!T || !T._donorTemplateReadyForTest) return false;
      return T._donorTemplateReadyForTest("kenney-modular-dungeon-kit", "gate-door", "fantasy")
        && T._donorTemplateReadyForTest("kenney-modular-dungeon-kit", "template-wall", "fantasy")
        && T._donorTemplateReadyForTest("kenney-modular-dungeon-kit", "template-floor", "fantasy");
    });
    if (ready) return true;
    await sleep(300);
  }
  return false;
}

const SPATIAL_CELL = { VOID: 0, FLOOR: 1, WALL: 2, DOOR: 3, WATER: 4 };

// buildPlan(shape) -> {plan, room, doorCell} — one hand-built fixture per shape, wide enough to show
// several straight kit wall-run modules per side (not just a single corner-to-corner remainder).
function planForShape(shape) {
  if (shape === "rect") {
    const w = 13, d = 9;
    const cells = new Array(w * d).fill(SPATIAL_CELL.VOID);
    for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
      if (x >= 1 && x <= 11 && y >= 1 && y <= 7) cells[y * w + x] = SPATIAL_CELL.FLOOR;
      else if ((x >= 0 && x <= 12 && (y === 0 || y === 8)) || (y >= 0 && y <= 8 && (x === 0 || x === 12))) cells[y * w + x] = SPATIAL_CELL.WALL;
    }
    const doorCell = { x: 6, y: 0 };
    cells[doorCell.y * w + doorCell.x] = SPATIAL_CELL.DOOR;
    const room = { segNum: 1, x: 1, y: 1, w: 11, d: 7, role: "start", scaleDomain: 1.0, shape: "rect" };
    return { w, d, cells, room, doorCell };
  }
  if (shape === "octagon") {
    const w = 11, d = 11;
    const isCorner = (x, y) => (x === 1 || x === 9) && (y === 1 || y === 9);
    const cells = new Array(w * d).fill(SPATIAL_CELL.VOID);
    for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
      if (x >= 1 && x <= 9 && y >= 1 && y <= 9) cells[y * w + x] = isCorner(x, y) ? SPATIAL_CELL.VOID : SPATIAL_CELL.FLOOR;
      else if (x >= 1 && x <= 9 && (y === 0 || y === 10)) cells[y * w + x] = SPATIAL_CELL.WALL;
      else if (y >= 1 && y <= 9 && (x === 0 || x === 10)) cells[y * w + x] = SPATIAL_CELL.WALL;
    }
    const doorCell = { x: 5, y: 0 };
    cells[doorCell.y * w + doorCell.x] = SPATIAL_CELL.DOOR;
    const room = { segNum: 1, x: 1, y: 1, w: 9, d: 9, role: "start", scaleDomain: 1.0, shape: "octagon" };
    return { w, d, cells, room, doorCell };
  }
  // "l" — an L-shaped room (NE 4x4 quadrant carved to VOID), wall ring drawn around the actual footprint.
  const w = 13, d = 13;
  const isFloor = (x, y) => {
    if (x < 1 || x > 10 || y < 1 || y > 10) return false;
    if (x >= 6 && y <= 4) return false; // carve the NE quadrant
    return true;
  };
  const cells = new Array(w * d).fill(SPATIAL_CELL.VOID);
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
    if (isFloor(x, y)) { cells[y * w + x] = SPATIAL_CELL.FLOOR; continue; }
    const neigh = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    if (neigh.some(([dx, dy]) => isFloor(x + dx, y + dy))) cells[y * w + x] = SPATIAL_CELL.WALL;
  }
  const doorCell = { x: 0, y: 7 };
  cells[doorCell.y * w + doorCell.x] = SPATIAL_CELL.DOOR; // west wall, well clear of the notch
  const room = { segNum: 1, x: 1, y: 1, w: 10, d: 10, role: "start", scaleDomain: 1.0, shape: "L" };
  return { w, d, cells, room, doorCell };
}

async function buildBoard(page, { shape, kitShellOn, dressed }) {
  return await page.evaluate((cfg) => {
    try {
      window.KIT_SHELL_ENABLED = cfg.kitShellOn;
      window.KIT_DOORS_ENABLED = cfg.kitShellOn; // the door's own kit path rides the SAME on/off toggle for this card — a clean "prism world" vs "kit world" comparison, not a mixed state
      const fx = cfg.fx;
      const plan = {
        cellW: fx.w, cellD: fx.d, cells: fx.cells, rooms: [fx.room],
        corridors: [{ fromSeg: 1, toSeg: 1, cells: [{ x: fx.doorCell.x, y: fx.doorCell.y }] }],
        doors: [{ x: fx.doorCell.x, y: fx.doorCell.y, squeeze: false }],
        seed: "ks3-capture-" + fx.room.shape,
      };
      // KS-3b item 2 (docs/KENNEY-SOCKET-WAVE.md's own KS-3 gate flag) — focusSegNum is REQUIRED for
      // interiorBuildBoard to stamp data.focusRect at all (theater-interior.js's own focusRect/
      // activeRoomShape derivation, both gated on opts.focusSegNum != null) — without it neither the
      // PRE-EXISTING prism wallList parapet cut (BW2-5) nor this unit's new kit-wall camera-side parity
      // ever fire, so this card would silently never exercise "does the room stay open as the camera
      // orbits" at all (the exact card this unit's own report needs to show). A real gameplay session
      // always supplies focusSegNum when it fits/frames a room; this capture now does too.
      const board = interiorBuildBoard(plan, { realmId: "fantasy", env: "dungeon", focusSegNum: fx.room.segNum });
      // KS-3 retrofit proof: a REAL fantasy render profile (not null) so every kit piece's live grade
      // is actually exercised, not a byte-identical passthrough.
      board.renderProfile = (typeof theaterStampRenderProfile === "function") ? theaterStampRenderProfile("fantasy") : null;
      board.lightProfile = "torchlit";
      board.interactables = [{
        archetype: "door", sourceRef: "ks3." + fx.room.shape, state: "ajar",
        x: fx.doorCell.x, y: fx.doorCell.y, slug: "door", name: "Iron Door", flavor: "riveted plates",
        extrudeDepth: 0.32, reserve: false,
      }];
      if (cfg.dressed) {
        // a few standee-style mounted pieces so the beauty shot reads as an inhabited, dressed room —
        // window.Theater.setInteriorBoard's own data.pieces channel (true-scale mounted figures).
        // "Skeleton" is the proven working figureFor slug several existing capture rigs already use
        // (dev/battle-gate/capture-beat-camera.mjs, capture-gpu-telemetry.mjs, capture-lit-sprites.mjs).
        board.pieces = [
          { slug: "Skeleton", fid: "ks3-beauty-a", cellX: fx.room.x + 2, cellY: fx.room.y + 2 },
          { slug: "Skeleton", fid: "ks3-beauty-b", cellX: fx.room.x + fx.room.w - 3, cellY: fx.room.y + fx.room.d - 3 },
        ];
      }
      return { ok: true, board, doorCell: fx.doorCell };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { shape, kitShellOn, fx: planForShape(shape), dressed: !!dressed });
}

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), shots: [], notes: [] };
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
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("Theater never mounted: " + JSON.stringify(theaterState));

    // warm the templates with one throwaway kit-on rect build BEFORE any real capture, so every
    // subsequent shot (including the very first) already has the graded templates hot.
    const warm = await buildBoard(page, { shape: "rect", kitShellOn: true, dressed: false });
    if (warm.ok) {
      await page.evaluate((board) => { window.Theater._resetInteriorDoorStateForTest(); window.Theater.setInteriorBoard(board); }, warm.board);
    }
    const templatesReady = await waitForKitTemplates(page);
    metrics.templatesReady = templatesReady;
    log(`kit templates (door+wall+floor, @fantasy) ready: ${templatesReady}`);

    async function shoot(fileName) {
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const shotPath = path.join(outDir, fileName);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath });
      else await page.screenshot({ path: shotPath, fullPage: false });
      metrics.shots.push(fileName);
      log(`captured ${fileName}`);
    }

    // ─── 6-panel comparison: kit-on vs prism-off, same fixture/camera, per shape ────────────────────
    for (const shape of ["rect", "octagon", "l"]) {
      for (const [label, kitShellOn] of [["kit-on", true], ["prism-off", false]]) {
        const built = await buildBoard(page, { shape, kitShellOn, dressed: false });
        if (!built.ok) { metrics.notes.push(`${shape}-${label} build FAILED: ${built.error}`); continue; }
        metrics[`${shape}-${label}`] = { doorCell: built.doorCell, meta: built.board.meta };
        await page.evaluate((board) => {
          window.Theater._resetInteriorDoorStateForTest();
          window.Theater.setInteriorBoard(board);
        }, built.board);
        await sleep(1600);
        await shoot(`${shape}-${label}.png`);
      }
    }

    // ─── wide dressed-room beauty shot: kit walls + kit door + mounted figures, kit-on ─────────────
    {
      const built = await buildBoard(page, { shape: "rect", kitShellOn: true, dressed: true });
      if (!built.ok) { metrics.notes.push(`beauty-dressed build FAILED: ${built.error}`); }
      else {
        metrics["beauty-dressed"] = { doorCell: built.doorCell, meta: built.board.meta, renderProfile: built.board.renderProfile };
        await page.evaluate((board) => {
          window.Theater._resetInteriorDoorStateForTest();
          window.Theater.setInteriorBoard(board);
        }, built.board);
        await sleep(1800);
        await shoot("beauty-dressed.png");
      }
    }

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("metrics.json written; done.");
  } finally {
    if (browser) try { await browser.close(); } catch (e) {}
    if (server.proc) try { server.proc.kill("SIGTERM"); } catch (e) {}
  }
}
main().catch((e) => { console.error("[ks3-kit-shells-gate] FATAL:", e); process.exit(1); });
