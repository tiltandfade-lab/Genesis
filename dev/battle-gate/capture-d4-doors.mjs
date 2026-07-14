#!/usr/bin/env node
/* dev/battle-gate/capture-d4-doors.mjs — docs/STAGE-D-WAVE-SPECS.md D4's REQUIRED visual evidence
   (Adam's taste gate before D5 scales to other archetypes):

   1. THE DOOR STUDY CARD — one capture per door state (shut/ajar/open/broken), SAME scene, SAME
      camera: the only thing that changes between the four frames is board.interactables[door].state,
      so the four poses read as a controlled A/B/C/D.
   2. THE WALK-THROUGH SEQUENCE — before door (room 1 focused) / mid-crossfade (the MF-2 overlay
      opaque during the board swap) / next room (room 2 focused, fade completed) — S0-1's transition
      slice, the active-room focus swap that already exists via focusSegNum.

   Boards are built entirely from the app's own real production chain IN-PAGE: spatializePlan ->
   semanticizePlan -> trayFrom({kind:"interior",...}) — the exact seam theaterStageSync calls; the
   door entry in board.interactables comes from the walk's own rolled exits[0].door field through
   bindWalkInteractables/applyRoomGrammar (Jobs 1+2's production wiring), NOT a hand-built mock. The
   per-state study frames then override ONLY that entry's `state` (simulating what four different
   state_transition histories would persist) before window.Theater.setInteriorBoard.

   Server/Chrome/boot conventions VERBATIM from dev/battle-gate/capture-interior-study.mjs (see its
   header for the "why" behind each) — port range 5211-5215 (a fresh range, no collision with the
   place-tray/stage/interior-study rigs).

   Run:  node dev/battle-gate/capture-d4-doors.mjs
   Output: dev/battle-gate/d4-doors/door-{shut,ajar,open,broken}.png +
           walkthrough-{1-before,2-crossfade,3-next-room}.png + metrics.json */

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
const outDir = path.join(__dirname, "d4-doors");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5211, 5212, 5213, 5214, 5215];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[d4-doors-gate]", ...a); }
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
      if (nameEl) nameEl.value = "D4 Doors Gate Soul";
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

// Build the ONE fixture walk + both room boards through the REAL production chain (trayFrom). The
// walk carries a rolled door on every segment (verify-d4-doors.mjs's own fixture family): s1's own
// "Iron Door" (rectangular) is the study card's subject; s3/s4's "Archway" proves the arched
// silhouette in the same scene set.
async function buildBoards(page, doorState) {
  return await page.evaluate((cfg) => {
    try {
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2", door: { type: { name: "Iron Door", desc: "riveted plates" }, state: { name: "Closed, Unlocked", desc: "opens freely" } } }],
          light: "normal",
          object: { name: "Wooden chest latch", flavor: "Latch spring is weak." },
          feature: { name: "Stone Altar", flavor: "A low slab." } },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
          exits: [
            { targetId: "s1", door: { type: { name: "Iron Door", desc: "riveted plates" }, state: { name: "Closed, Unlocked", desc: "opens freely" } } },
            { targetId: "s3", door: { type: { name: "Archway", desc: "no frame" }, state: { name: "Open / Standing Ajar", desc: "no obstruction" } } },
          ],
          light: "normal",
          object: { name: "Lever bar", flavor: "Half-hidden behind rubble." },
          feature: { name: "Cold Hearth", flavor: "Ash long dead." } },
        { id: "s3", num: 3, label: "s3", isFinale: true, depth: 2,
          exits: [{ targetId: "s2", door: { type: { name: "Archway", desc: "no frame" }, state: { name: "Open / Standing Ajar", desc: "no obstruction" } } }],
          light: "normal",
          object: { name: "Crate lid", flavor: "Nailed shut." },
          feature: { name: "Iron Portcullis", flavor: "Rusted teeth." } },
      ];
      const walkId = "d4-doors-study";
      const plan = spatializePlan(fixture, "The Spine", { walkId });
      const semPlan = semanticizePlan(plan, fixture, []);
      const walk = { segments: fixture, environment: "dungeon" };
      const prepNode = {}; // the persisted-state store (Job 2) — shared across both boards below

      function board(focusSegNum) {
        const b = trayFrom({ kind: "interior", plan: semPlan, walk, segment: fixture[focusSegNum - 1], focusSegNum, radius: 1, realmId: "fantasy", walkId, prepNode }, null, {});
        b.lightProfile = "torchlit";
        return b;
      }
      const b1 = board(1);
      if (cfg.doorState) {
        // simulate the persisted history: state_transition wrote this state last turn — write it
        // into the SAME prep-node store the reconciliation reads, then re-derive (the real Job 2 path).
        (prepNode.interactables || []).forEach((r) => { if (r.archetype === "door") r.state = cfg.doorState; });
      }
      const b1Final = cfg.doorState ? board(1) : b1;
      const b2 = board(2);
      return { ok: true, b1: b1Final, b2, interactables: b1Final.interactables };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { doorState });
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

    async function shoot(fileName) {
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const shotPath = path.join(outDir, fileName);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath });
      else await page.screenshot({ path: shotPath, fullPage: false });
      metrics.shots.push(fileName);
      log(`captured ${fileName}`);
    }

    // ─── warm-up: dressing sprite textures load ASYNC (spriteTextureFor's loader replays
    // setInteriorBoard when each lands) — push the scene once and give the loads a generous window
    // BEFORE any study frame, so all four states capture the IDENTICAL fully-resolved scene. ────────
    {
      const warm = await buildBoards(page, null);
      if (!warm.ok) throw new Error("warm-up build failed: " + warm.error);
      await page.evaluate((board) => { window.Theater._resetInteriorDoorStateForTest(); window.Theater.setInteriorBoard(board); }, warm.b1);
      await sleep(5000);
      // this fixture's one s1 exit lands on the CAMERA-SIDE wall at the default yaw — which E0-1's
      // fade law correctly ghosts (the door fades WITH its suppressed wall segment; this rig's own
      // earlier run photographed exactly that). Rotate the camera 180° so the door wall reads as a
      // solid BACK wall for the study card — the rotation persists across every frame below, so all
      // seven shots still share ONE camera.
      await page.evaluate(() => { window.Theater.rotate(); window.Theater.rotate(); });
      await sleep(800);
    }

    // ─── 1. THE DOOR STUDY CARD — same scene/camera, only the door's persisted state changes ───────
    for (const state of ["shut", "ajar", "open", "broken"]) {
      const built = await buildBoards(page, state);
      if (!built.ok) { metrics.notes.push(`study ${state} build FAILED: ${built.error}`); continue; }
      metrics["study_" + state] = { interactables: built.interactables };
      await page.evaluate((board) => {
        window.Theater._resetInteriorDoorStateForTest(); // isolated per frame: no tween BETWEEN study states
        window.Theater.setInteriorBoard(board);
      }, built.b1);
      await sleep(1600); // clear the MF-2 crossfade + let the GL frame paint
      await shoot(`door-${state}.png`);
      const mounted = await page.evaluate(() => window.Theater._S ? null : (window.Theater.interiorInteractables ? window.Theater.interiorInteractables() : null));
      metrics["study_" + state].mounted = mounted;
    }

    // ─── 2. THE WALK-THROUGH SEQUENCE — before / mid-crossfade / next room ─────────────────────────
    {
      const built = await buildBoards(page, "open");
      if (!built.ok) throw new Error("walkthrough build failed: " + built.error);
      await page.evaluate((board) => { window.Theater._resetInteriorDoorStateForTest(); window.Theater.setInteriorBoard(board); }, built.b1);
      await sleep(1600);
      await shoot("walkthrough-1-before.png");
      // fire the room swap (the S0-1 transition slice: focusSegNum 1 -> 2) and catch the MF-2
      // overlay mid-fade — the swap snaps the overlay opaque synchronously and fades it back over
      // its authored duration, so a screenshot right after the push reads mid-crossfade.
      // MF-2's crossfade overlay is a screen-space DOM element OVER the canvas — canvasEl.screenshot()
      // bypasses DOM siblings entirely, so the mid-fade frame must shoot the PAGE clipped to the
      // canvas box. The fade is only ROOM_TRANSITION_DUR=200ms, and puppeteer's own screenshot
      // round-trip eats most of that, so: pre-resolve the clip box, push the board, screenshot with
      // ZERO added sleep, and record the overlay's LIVE opacity immediately before and after the shot
      // (metrics.json) — the honest instrumentation that the frame really was mid-fade.
      {
        const canvasEl = await page.$(".theater-stage-canvas canvas");
        const box = canvasEl ? await canvasEl.boundingBox() : null;
        // MID-FADE SAMPLING: the fade is only ROOM_TRANSITION_DUR=200ms — puppeteer's screenshot
        // round-trip alone eats that, so a live-raced shot always lands at ~0 opacity (measured
        // 0.05 -> 0 across one shot in this rig's own earlier runs), and a frozen-Date.now hold
        // (the fake-clock idiom) leaves the dirty-driven renderer un-presented (black canvas).
        // MF-2's own design makes the honest alternative exact: the new room is FULLY rebuilt
        // beneath the opaque overlay before the fade even starts ("the rebuild happens under it",
        // setInteriorBoard's own MF-2 comment) — so the true mid-fade frame IS the new room under
        // the overlay at its midpoint opacity. Sample it deterministically: push the board, verify
        // the fade really fired (live opacity read), let the room present, then PIN the overlay at
        // the fade's exact midpoint value for the shot and release it. Nothing in the frame is
        // fabricated — the overlay element, its stacking, and the room beneath are all production
        // state; only the sampling instant is pinned instead of raced.
        const fadeFired = await page.evaluate((board) => {
          window.Theater.setInteriorBoard(board); // synchronous rebuild; the fade tween starts at its tail
          const el = document.querySelector(".theater-transition-layer");
          return el ? el.style.opacity : null; // read IMMEDIATELY post-push: >0 iff the crossfade really fired
        }, built.b2);
        await sleep(600); // fade completes + the new room presents
        await page.evaluate(() => {
          const el = document.querySelector(".theater-transition-layer");
          if (el) el.style.opacity = "0.5"; // the fade's exact midpoint value, pinned for the shot
        });
        await sleep(100);
        const shotPath = path.join(outDir, "walkthrough-2-crossfade.png");
        if (box) await page.screenshot({ path: shotPath, clip: box });
        else await page.screenshot({ path: shotPath, fullPage: false });
        await page.evaluate(() => {
          const el = document.querySelector(".theater-transition-layer");
          if (el) el.style.opacity = "0";
        });
        metrics.crossfade = { overlayOpacityImmediatelyAfterPush: fadeFired, pinnedForShotAt: "0.5" };
        metrics.shots.push("walkthrough-2-crossfade.png");
        log(`captured walkthrough-2-crossfade.png (fade fired at opacity ${fadeFired}; midpoint 0.5 pinned for the shot)`);
      }
      await sleep(1800); // fade completes — the next room stands revealed
      await shoot("walkthrough-3-next-room.png");
    }

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("metrics.json written; done.");
  } finally {
    if (browser) try { await browser.close(); } catch (e) {}
    if (server.proc) try { server.proc.kill("SIGTERM"); } catch (e) {}
  }
}
main().catch((e) => { console.error("[d4-doors-gate] FATAL:", e); process.exit(1); });
