#!/usr/bin/env node
/* dev/capture-elev1-profiles.mjs — ELEV-1 (docs/KENNEY-SOCKET-WAVE.md ELEV-1) CARD CAPTURE. NOT a
   pass/fail harness — a CAPTURE script (same convention as dev/capture-wall-runs-oss.mjs): boots the
   real in-session interior board, mounts FOUR controlled single-room fixtures (one per profile —
   Dais / Sunken center / Gallery ring / Chasm/shaft), each a 30'x30' room (6x6 cells, clears every
   profile's min-dims gate so none walks down) with `segment.elevation` hand-set (bypassing the
   roller — same "controlled fixture" discipline the wall-runs script uses for its own single room),
   through spatializePlan -> interiorBuildBoard -> Theater.setInteriorBoard, ALL real production code,
   zero mocks. SAME default room-fit camera for all four (no per-shot pose tuning) so the four PNGs
   are honestly comparable. This is the ELEV-1b before-state per the spec's own red-first section —
   whatever the existing per-cell tiers render seam does with a profile that reaches ±2/±3 (past the
   ±1 side-parse patches it was proven against), captured as-is. HARD LANE FENCE: this script never
   edits src/ui/theater-interior.js or src/ui/theater-boot.js — it only DRIVES them as a real user
   session would.

   Run:  node dev/capture-elev1-profiles.mjs */

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
const OUT_DIR = path.join(__dirname, "elev1-profile-shots");
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5281, 5282, 5283, 5284, 5285];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROFILES = [
  { key: "dais", profile: "Dais", roll: 45 },
  { key: "sunken", profile: "Sunken center", roll: 60 },
  { key: "gallery", profile: "Gallery ring", roll: 93 },
  { key: "chasm", profile: "Chasm/shaft", roll: 98 },
];

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
      if (nameEl) nameEl.value = "ELEV-1 Profile Soul";
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

async function buildProfileFixture(page, entry) {
  return await page.evaluate((entry) => {
    try {
      const fixture = [{
        id: "s1", num: 1, label: "s1", isFinale: false, depth: 0, exits: [], light: "normal",
        dims: "30' x 30' square",
        elevation: { roll: entry.roll, profile: entry.profile, degradedFrom: null },
      }];
      const plan = spatializePlan(fixture, "ELEV-1 Profile Card", { walkId: "elev1-profile:" + entry.key });
      const focusRoom = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      // Strip scene-dependent decoration so the floor/tiers geometry itself is legible in the shot.
      board.instances.pillar = [];
      board.instances.doorframe = [];
      board.pieces = [];
      board.cover = [];
      board.furniture = [];
      board.wallProps = [];
      board.portals = [];
      board.lights = [];
      board.lightProfile = "daylit";
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "elev1-profile-fixture:" + entry.key;
      // count non-zero tiers cells for an honest per-shot stat (reported alongside the PNG).
      let nz = 0;
      for (let i = 0; i < plan.tiers.length; i++) if (plan.tiers[i] !== 0) nz++;
      const room = plan.rooms[0];
      return {
        ok: true, board,
        room: { x: room.x, z: room.y, w: room.w, d: room.d, cells: (room.cells || []).length },
        nonZeroTierCells: nz,
        elevationProfile: room.elevationProfile || null,
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, entry);
}

async function mountAndFrame(page, board, key) {
  return await page.evaluate((board, key) => {
    try {
      window.Theater._setRoomShellEnabled(true);
      const cloned = (typeof structuredClone === "function") ? structuredClone(board) : JSON.parse(JSON.stringify(board));
      cloned._verifyNonce = "elev1-profile-fixture:" + key + ":mount";
      window.Theater.setInteriorBoard(cloned);
      const shell = window.Theater._interiorRoomShellForTest ? window.Theater._interiorRoomShellForTest() : null;
      return { ok: true, shellMeta: shell && shell.meta ? shell.meta : null };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, board, key);
}

async function shoot(page, outPath) {
  const canvas = await page.$(".theater-stage-canvas canvas");
  const box = canvas && await canvas.boundingBox();
  if (!box) throw new Error("theater canvas has no page bounding box");
  await page.screenshot({ path: outPath, clip: {
    x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height,
  } });
}
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { proc } = await startServer();
  console.log("server:", BASE);
  const browser = await launchChrome();
  const summary = [];
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
    await page.goto(BASE + "/genesis.html", { waitUntil: "networkidle0", timeout: 30000 });
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const bootRes = await bootToInSession(page);
    if (!bootRes.ok) { console.log("BOOT FAILED:", JSON.stringify(bootRes)); process.exitCode = 1; return; }
    const theaterState = await waitForTheater(page);
    if (!theaterState.hasSetInteriorBoard) { console.log("THEATER NOT READY:", JSON.stringify(theaterState)); process.exitCode = 1; return; }
    await page.evaluate(() => { window.Theater.setInteriorVariant({ shotCompose: false }); });

    for (const entry of PROFILES) {
      const fixture = await buildProfileFixture(page, entry);
      if (!fixture.ok) { console.log(`FIXTURE BUILD FAILED (${entry.key}):`, JSON.stringify(fixture)); process.exitCode = 1; continue; }
      let res;
      try {
        res = await mountAndFrame(page, fixture.board, entry.key);
      } catch (e) {
        console.log(`MOUNT THREW (${entry.key}):`, e && e.message, e && e.stack);
        process.exitCode = 1; continue;
      }
      if (!res || !res.ok) { console.log(`MOUNT FAILED (${entry.key}):`, JSON.stringify(res)); process.exitCode = 1; continue; }
      try { await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 8000 }); } catch (e) { /* fall through */ }
      await waitForRepaint(page);
      await sleep(150);
      const outPath = path.join(OUT_DIR, `elev1-${entry.key}.png`);
      await shoot(page, outPath);
      const line = {
        key: entry.key, profile: entry.profile, wrote: outPath,
        room: fixture.room, nonZeroTierCells: fixture.nonZeroTierCells,
        elevationProfile: fixture.elevationProfile, shellMeta: res.shellMeta,
      };
      summary.push(line);
      console.log(`  wrote ${outPath}`);
      console.log(`    room=${JSON.stringify(fixture.room)} nonZeroTierCells=${fixture.nonZeroTierCells}`);
      console.log(`    shell meta: ${JSON.stringify(res.shellMeta)}`);
    }
    console.log("\nCaptures written to", OUT_DIR);
    console.log("\nSUMMARY_JSON:", JSON.stringify(summary));
  } finally {
    await browser.close();
    if (proc) proc.kill("SIGTERM");
  }
})();
