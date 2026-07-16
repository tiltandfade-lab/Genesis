#!/usr/bin/env node
/* dev/battle-gate/capture-ks2-door-assembly.mjs — docs/KENNEY-SOCKET-WAVE.md KS-2's REQUIRED capture
   card: "one interior with 2-3 doors (incl. a corner door) — kit path ON vs prism-fallback (flag off)
   side by side, plus a 4-state strip (shut/ajar/open/broken) of one kit door."

   Server/Chrome/boot conventions VERBATIM from dev/battle-gate/capture-d4-doors.mjs (bootToInSession,
   waitForTheater, launchChrome, startServer) — port range 5221-5225, a fresh range.

   Unlike capture-d4-doors.mjs (which rolls a walk through the real trayFrom production chain), this
   rig HAND-BUILDS the interior plan in-page (mirrors dev/verify-ks2-door-assembly.mjs's own fixture
   technique) so the corner-door topology is deterministic/guaranteed rather than hoping a random roll
   produces one — calling the REAL interiorBuildBoard(plan, opts) directly (window.interiorBuildBoard,
   theater-interior.js's own classic-script bridge) for the geometry, then hand-stamping a matching
   `interactables` array (the D1-shaped door entries trayFrom would normally derive) before handing the
   whole thing to window.Theater.setInteriorBoard — same board SHAPE, same render path, just a
   deterministic source plan instead of a rolled one.

   Run:  node dev/battle-gate/capture-ks2-door-assembly.mjs
   Output: dev/battle-gate/ks2-door-assembly/{kit-on,prism-off}.png +
           kit-door-{shut,ajar,open,broken}.png + metrics.json */

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
const outDir = path.join(__dirname, "ks2-door-assembly");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[ks2-door-assembly-gate]", ...a); }
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

// mirrors capture-d4-doors.mjs's bootToInSession verbatim.
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
      if (nameEl) nameEl.value = "KS-2 Door Assembly Gate Soul";
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

// waits for the KS-2 kit-door async preload (theater-boot.js's module-scope loadDonorPiece call) to
// settle — a screenshot taken before this is warm would silently show the prism fallback for EVERY
// door regardless of KIT_DOORS_ENABLED, defeating the kit-on/prism-off comparison.
async function waitForKitDoorTemplate(page) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const ready = await page.evaluate(() => !!(window.Theater && window.Theater._kitDoorTemplateReadyForTest && window.Theater._kitDoorTemplateReadyForTest()));
    if (ready) return true;
    await sleep(250);
  }
  return false;
}

// HAND-BUILT plan (mirrors dev/verify-ks2-door-assembly.mjs's own fixture technique): one 7x7-floor
// room, THREE doors — a CORNER door (west wall, one cell off the NW corner — the exact class
// DESIGN-REVIEW-2026-07-15.md §0 names) and two STANDARD mid-wall doors (kit-eligible; the north one
// is the subject of the 4-state strip). `kitOn` toggles window.KIT_DOORS_ENABLED for THIS build.
async function buildBoard(page, { kitOn, doorStates, single }) {
  return await page.evaluate((cfg) => {
    try {
      window.KIT_DOORS_ENABLED = cfg.kitOn;
      const SPATIAL_CELL = { VOID: 0, FLOOR: 1, WALL: 2, DOOR: 3, WATER: 4 };
      const w = 9, d = 9;
      const cells = new Array(w * d).fill(SPATIAL_CELL.VOID);
      for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
        if (x >= 1 && x <= 7 && y >= 1 && y <= 7) cells[y * w + x] = SPATIAL_CELL.FLOOR;
        else if ((x >= 0 && x <= 8 && (y === 0 || y === 8)) || (y >= 0 && y <= 8 && (x === 0 || x === 8))) cells[y * w + x] = SPATIAL_CELL.WALL;
      }
      // `single` (a door id string, or falsy): isolate JUST that one door in its own small room — the
      // 3-door scene crowds all three archways into one camera frame (fine for the kit-on/prism-off
      // comparison, which only needs ONE clean difference to read), but makes an individual door's
      // OWN state-to-state swing (or, for the corner door, its own frame orientation) hard to eyeball
      // against its close neighbors. Same room geometry/camera either way — only the door roster differs.
      const ALL_DOORS = {
        "north-standard": { x: 4, y: 0, id: "north-standard" }, // north wall, dead-center — kit-eligible
        "west-corner": { x: 0, y: 1, id: "west-corner" },       // west wall, ONE cell off the NW corner — the corner-door class
        "east-standard": { x: 8, y: 4, id: "east-standard" },   // east wall, dead-center — kit-eligible
      };
      const doorCells = cfg.single ? [ALL_DOORS[cfg.single]] : [ALL_DOORS["north-standard"], ALL_DOORS["west-corner"], ALL_DOORS["east-standard"]];
      doorCells.forEach((dc) => { cells[dc.y * w + dc.x] = SPATIAL_CELL.DOOR; });
      const room = { segNum: 1, x: 1, y: 1, w: 7, d: 7, role: "start", scaleDomain: 1.0 };
      // degenerate one-cell corridors per door — itrBuildKeepGrid's own render-keep-set logic only
      // marks a WALL cell "kept" via 8-adjacency; a DOOR cell needs corridor ownership (real
      // spatializePlan output always wires a door onto a corridor connecting two rooms — see
      // dev/verify-ks2-door-assembly.mjs's own fixture-builder comment for the full rationale).
      const corridors = doorCells.map((dc) => ({ fromSeg: 1, toSeg: 1, cells: [{ x: dc.x, y: dc.y }] }));
      const doors = doorCells.map((dc) => ({ x: dc.x, y: dc.y, squeeze: false }));
      const plan = { cellW: w, cellD: d, cells, rooms: [room], corridors, doors, seed: "ks2-capture" };
      const board = interiorBuildBoard(plan, { realmId: "fantasy", env: "dungeon" });
      board.lightProfile = "torchlit";
      board.interactables = doorCells.map((dc) => ({
        archetype: "door", sourceRef: "ks2." + dc.id, state: cfg.doorStates[dc.id] || "shut",
        x: dc.x, y: dc.y, slug: "door", name: "Iron Door", flavor: "riveted plates", extrudeDepth: 0.32, reserve: false,
      }));
      return { ok: true, board, doorCells };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { kitOn, doorStates, single });
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

    const kitReady = await waitForKitDoorTemplate(page);
    metrics.kitDoorTemplateReady = kitReady;
    log(`kit door template ready: ${kitReady}`);

    async function shoot(fileName) {
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const shotPath = path.join(outDir, fileName);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath });
      else await page.screenshot({ path: shotPath, fullPage: false });
      metrics.shots.push(fileName);
      log(`captured ${fileName}`);
    }

    const restState = { "north-standard": "shut", "west-corner": "ajar", "east-standard": "open" };

    // ─── 1. KIT PATH ON vs PRISM FALLBACK OFF — same scene/camera, only KIT_DOORS_ENABLED changes ──
    for (const [label, kitOn] of [["kit-on", true], ["prism-off", false]]) {
      const built = await buildBoard(page, { kitOn, doorStates: restState });
      if (!built.ok) { metrics.notes.push(`${label} build FAILED: ${built.error}`); continue; }
      metrics[label] = { doorCells: built.doorCells, meta: built.board.meta };
      await page.evaluate((board) => {
        window.Theater._resetInteriorDoorStateForTest();
        window.Theater.setInteriorBoard(board);
      }, built.board);
      await sleep(1600);
      await shoot(`${label}.png`);
    }

    // ─── 2. THE KIT DOOR 4-STATE STRIP — single-door isolated room (this function's own `single` note),
    // same scene/camera across all 4 frames, only the door's persisted state changes.
    for (const state of ["shut", "ajar", "open", "broken"]) {
      const built = await buildBoard(page, { kitOn: true, doorStates: { "north-standard": state }, single: "north-standard" });
      if (!built.ok) { metrics.notes.push(`kit-door-${state} build FAILED: ${built.error}`); continue; }
      await page.evaluate((board) => {
        window.Theater._resetInteriorDoorStateForTest();
        window.Theater.setInteriorBoard(board);
      }, built.board);
      await sleep(1600);
      await shoot(`kit-door-${state}.png`);
    }

    // ─── 3. THE CORNER DOOR, ISOLATED, ON THE PRISM PATH (KIT_DOORS_ENABLED off) — the most direct
    // visual proof QF-D1 targets: DESIGN-REVIEW-2026-07-15.md §0's "hollow column" is a doorframe
    // rotated 90deg from the wall it's actually set into (a slim post standing perpendicular, jutting
    // INTO the room). A corner door, isolated with no neighbors to visually confuse it, either reads
    // as a frame FLUSH with the west wall plane (fixed) or as a post sticking out into the floor
    // (still broken) — unambiguous either way.
    {
      const built = await buildBoard(page, { kitOn: false, doorStates: { "west-corner": "ajar" }, single: "west-corner" });
      if (!built.ok) { metrics.notes.push(`corner-door-prism build FAILED: ${built.error}`); }
      else {
        metrics["corner-door-prism"] = { doorCells: built.doorCells, meta: built.board.meta };
        await page.evaluate((board) => {
          window.Theater._resetInteriorDoorStateForTest();
          window.Theater.setInteriorBoard(board);
        }, built.board);
        await sleep(1600);
        await shoot("corner-door-prism.png");
      }
    }

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("metrics.json written; done.");
  } finally {
    if (browser) try { await browser.close(); } catch (e) {}
    if (server.proc) try { server.proc.kill("SIGTERM"); } catch (e) {}
  }
}
main().catch((e) => { console.error("[ks2-door-assembly-gate] FATAL:", e); process.exit(1); });
