#!/usr/bin/env node
/* dev/battle-gate/capture-d4c-broken-variants.mjs — docs/STAGE-D-WAVE-SPECS.md D4c's REQUIRED
   visual evidence (Adam's design ruling 2026-07-14, "flopped / hanging / shattered"):

   THE BROKEN-VARIANT STUDY CARD — one capture per variant, SAME scene, SAME camera: the only thing
   that changes between the three frames is which broken variant the door renders — flopped (the
   landed D4b pose)/hanging (torn off one hinge)/shattered (3-5 seeded shards). The variant is FORCED
   via window.Theater._setBrokenDoorVariantForTest (the same "ForTest" seam convention this file's
   sibling capture-d4-doors.mjs already established for door STATE, extended here to pin the VARIANT
   too) rather than hunting for three hash-matching sourceRefs — a controlled A/B/C, not a lucky roll.

   Board built from the app's own real production chain IN-PAGE: spatializePlan -> semanticizePlan ->
   trayFrom({kind:"interior",...}) — the exact seam theaterStageSync calls; the door entry comes from
   the walk's own rolled exits[0].door field (Jobs 1+2's production wiring), NOT a hand-built mock.
   The board's own door state is forced to "broken" (state_transition simulation, same technique
   capture-d4-doors.mjs's own buildBoards(doorState) already uses) before each variant-forced shot.

   Server/Chrome/boot conventions VERBATIM from dev/battle-gate/capture-d4-doors.mjs (see its own
   header for the "why" behind each) — port range 5216-5220 (fresh range, no collision with the
   d4-doors/place-tray/stage/interior-study rigs).

   Run:  node dev/battle-gate/capture-d4c-broken-variants.mjs
   Output: dev/battle-gate/d4-doors/variant-{flopped,hanging,shattered}.png + metrics-variants.json */

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

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5216, 5217, 5218, 5219, 5220];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[d4c-variants-gate]", ...a); }
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
      if (nameEl) nameEl.value = "D4c Broken Variants Gate Soul";
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
        hasVariantSeam: !!(window.Theater && typeof window.Theater._setBrokenDoorVariantForTest === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

// Build the ONE fixture walk through the REAL production chain (trayFrom), then force the door's
// persisted state to "broken" (the same state_transition-simulation technique capture-d4-doors.mjs's
// own buildBoards uses) — the VARIANT itself is pinned separately, in-page, via the ForTest seam.
// Fixture is VERBATIM capture-d4-doors.mjs's own buildBoards fixture (s1/s2/s3, s1's "Iron Door" is
// the study subject) — that rig's own door-broken.png already proves this exact fixture+camera
// framing puts the door clearly in frame; reusing it rather than inventing a new layout blind.
async function buildBrokenBoard(page) {
  return await page.evaluate(() => {
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
      // SAME walkId as capture-d4-doors.mjs's own proven rig — room shape/door-wall placement is
      // deterministic per (fixture, walkId), so reusing the exact string that rig already confirmed
      // puts the door in frame after the 2x camera rotate (below) avoids re-rolling a DIFFERENT room
      // shape that could land the door on some other wall entirely.
      const walkId = "d4-doors-study";
      const plan = spatializePlan(fixture, "The Spine", { walkId });
      const semPlan = semanticizePlan(plan, fixture, []);
      const walk = { segments: fixture, environment: "dungeon" };
      const prepNode = {};
      const b1 = trayFrom({ kind: "interior", plan: semPlan, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId, prepNode }, null, {});
      // simulate the persisted history: state_transition wrote "broken" last turn.
      (prepNode.interactables || []).forEach((r) => { if (r.archetype === "door") r.state = "broken"; });
      const b1Broken = trayFrom({ kind: "interior", plan: semPlan, walk, segment: fixture[0], focusSegNum: 1, radius: 1, realmId: "fantasy", walkId, prepNode }, null, {});
      b1Broken.lightProfile = "torchlit";
      return { ok: true, board: b1Broken, interactables: b1Broken.interactables };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
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
    if (!theaterState.hasVariantSeam) throw new Error("window.Theater._setBrokenDoorVariantForTest is missing — D4c test seam not wired");

    async function shoot(fileName) {
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const shotPath = path.join(outDir, fileName);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath });
      else await page.screenshot({ path: shotPath, fullPage: false });
      metrics.shots.push(fileName);
      log(`captured ${fileName}`);
    }

    // ─── warm-up: dressing sprite textures load ASYNC — push the scene once, give loads a window,
    // then rotate the camera 180deg so the door's own wall reads as a solid BACK wall (mirrors
    // capture-d4-doors.mjs's own reasoning — this fixture's exit lands on the camera-side wall,
    // which E0-1's fade law correctly ghosts otherwise). ────────────────────────────────────────────
    const built = await buildBrokenBoard(page);
    if (!built.ok) throw new Error("board build failed: " + built.error);
    metrics.interactables = built.interactables;
    await page.evaluate(() => { window.Theater._setBrokenDoorVariantForTest(null); window.Theater._resetInteriorDoorStateForTest(); });
    await page.evaluate((board) => { window.Theater.setInteriorBoard(board); }, built.board);
    await sleep(5000);
    await page.evaluate(() => { window.Theater.rotate(); window.Theater.rotate(); });
    await sleep(800);

    // ─── THE BROKEN-VARIANT STUDY CARD — same scene/camera, only the FORCED variant changes ───────
    // setInteriorBoard has its own dirty-key skip ("if this exact board+variant JSON was already
    // rendered, no-op" — window.Theater.stats.boardSkips, theater-boot.js's own setInteriorBoard):
    // since board is the SAME reference/content every iteration here, that skip would silently
    // no-op every call after the first, leaving the warm-up's board on screen for all three "frames"
    // (found live: the first run of this rig produced three IDENTICAL screenshots/diagnostics before
    // this fix). window.Theater.setInteriorVariant({}) is the file's OWN documented seam for exactly
    // this — "null the dirty key, replay S.lastBoard" — used here with an empty flags object purely
    // to force the real rebuild under whichever variant was just forced.
    for (const variant of ["flopped", "hanging", "shattered"]) {
      await page.evaluate((v) => {
        window.Theater._setBrokenDoorVariantForTest(v);
        window.Theater._resetInteriorDoorStateForTest(); // isolated per frame: no tween between variant frames
        window.Theater.setInteriorVariant({});
      }, variant);
      await sleep(1600); // clear the MF-2 crossfade + let the GL frame paint
      await shoot(`variant-${variant}.png`);
      const diag = await page.evaluate(() => {
        return window.Theater._interiorInteractablesWorldPositionsForTest ? window.Theater._interiorInteractablesWorldPositionsForTest() : null;
      });
      metrics["variant_" + variant] = { diag };
    }
    await page.evaluate(() => { window.Theater._setBrokenDoorVariantForTest(null); }); // leave the real hash pick active for anything after this rig

    fs.writeFileSync(path.join(outDir, "metrics-variants.json"), JSON.stringify(metrics, null, 2));
    log("metrics-variants.json written; done.");
  } finally {
    if (browser) try { await browser.close(); } catch (e) {}
    if (server.proc) try { server.proc.kill("SIGTERM"); } catch (e) {}
  }
}
main().catch((e) => { console.error("[d4c-variants-gate] FATAL:", e); process.exit(1); });
