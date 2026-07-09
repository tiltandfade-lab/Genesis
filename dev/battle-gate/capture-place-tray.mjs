#!/usr/bin/env node
/* dev/battle-gate/capture-place-tray.mjs — SCREENSHOT GATE for PLACE-GEN.md ADDENDUM §7 unit 7 (the
   tray `node` source: a minted, realm-typed place renders as the standing table's diorama). Sibling
   of dev/battle-gate/capture-stage.mjs — reuses that harness's proven server/Chrome/boot conventions
   (see its own header comment for the "why" behind each) rather than reinventing them, trimmed to
   this unit's own scope: boot into a real session (bootToInSession, the same guided-creation stager),
   mint a typed place at the current node via the app's own real global functions (rollPlace/codexAdd/
   mapOf — the exact functions a DM `gen kind:"place"` mint would call, no mock), force a render so
   theaterStageSync pushes the node tray, and screenshot the standing table.

   THEATER-NEXT §2 mandatory-gate policy: this unit's diff touches src/engine/theater-data.js's
   tile-prop emission (theaterNodeBoardBuild) — a screenshot gate is required before merge, per that
   section. The orchestrator eyeballs the PNG; this script's only job is honest pixels + metrics.

   Run:  node dev/battle-gate/capture-place-tray.mjs
   Output: dev/battle-gate/place-tray/tray.png + metrics.json */

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
const outDir = path.join(__dirname, "place-tray");
fs.mkdirSync(outDir, { recursive: true });

// same port discipline as capture-stage.mjs: never 5175 (live bridge) / never 5178 (model-qa) — probe
// a DIFFERENT range than capture-stage.mjs's own 5181-5185 so the two harnesses can run concurrently
// without a port collision.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5191, 5192, 5193, 5194, 5195];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[place-tray-gate]", ...a); }
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

async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1440,900"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 } });
}
async function newPage(browser) {
  const page = await browser.newPage();
  // genesis.html ships no favicon.ico — the bare python3 http.server 404s the browser's automatic
  // favicon probe, which Chrome surfaces as a console.error unrelated to anything this gate is
  // actually verifying (app behavior, not this unit's diff). Fulfill it with a 1x1 transparent GIF
  // instead of letting the request fail, so the metrics' consoleErrors count reflects real app
  // errors only, same "honest pixels + metrics" discipline capture-stage.mjs's own header states.
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

// mirrors capture-stage.mjs's bootToInSession verbatim (same "choose for me" guided-creation stager —
// see that file's header comment for the full rationale; not re-explained here to avoid drift risk
// from two divergent copies of subtle staging logic).
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
      if (nameEl) nameEl.value = "Place Tray Gate Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found", notes };
      // theaterStageSync's mount attempt is gated on w.sessionLive (src/world/render.js) — bardoFound
      // alone does not flip it; startSession does (+ beginSession's codex cast + wakeIntoWorld's DM
      // open), the SAME call the world-list "Start session" button makes.
      if (typeof startSession === "function") { startSession(world.id); notes.push("startSession() called"); }
      showTab("world");
      return { ok: true, notes, worldId: world.id, worldName: world.name };
    } catch (e) { return { ok: false, stage: "exception", error: e.message, stack: e.stack, notes }; }
  });
}

// PLACE-GEN.md ADDENDUM §7 unit 7 — mint a typed place record at the current node via the app's own
// real global functions (rollPlace/codexAdd/mapOf), the SAME functions urban.js's buildingApproach /
// a DM `gen kind:"place"` mint call, then force a render so theaterStageSync's null-safe source read
// (theaterHereSourceFor -> theaterNodeSourceFor) picks it up as the {kind:"node"} tray.
async function mintNodeTray(page) {
  return await page.evaluate(() => {
    try {
      const w = activeWorld();
      if (!w) return { ok: false, reason: "no-active-world" };
      if (typeof rollPlace !== "function" || typeof codexAdd !== "function" || typeof mapOf !== "function") {
        return { ok: false, reason: "place-gen-functions-missing" };
      }
      const nodeId = w.currentNodeId;
      if (!nodeId) return { ok: false, reason: "no-current-node" };
      const payload = rollPlace({ realm: "gloom" });
      const rec = codexAdd(w, payload);
      mapOf(w).nodes[nodeId] = Object.assign({}, mapOf(w).nodes[nodeId] || {}, { codexId: rec.id });
      renderWorld();
      const src = (typeof theaterHereSourceFor === "function") ? theaterHereSourceFor(w) : null;
      return { ok: true, nodeId, recordId: rec.id, archetypeKey: rec.rolled && rec.rolled.archetypeKey, sourceKind: src && src.kind };
    } catch (e) { return { ok: false, reason: "exception", error: e.message, stack: e.stack }; }
  });
}

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), notes: [] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);

    const boot = await bootToInSession(page);
    metrics.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const mint = await mintNodeTray(page);
    metrics.mint = mint;
    if (!mint.ok) throw new Error("mint failed: " + JSON.stringify(mint));

    // theaterStageSync mounts on the FIRST render of a live session (a session-gated probe, not
    // combat-gated — src/world/render.js), but window.Theater itself loads async (theater-boot.js is
    // a real ES module) — poll up to 20s, forcing a fresh renderWorld() each pass so theaterStageSync
    // gets another chance to mount, same discipline as capture-stage.mjs's waitForStageMode.
    let state = null;
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      state = await page.evaluate(() => {
        const host = document.getElementById("worldView");
        return {
          hasBattleStage: !!(host && host.querySelector(".game.battle-stage")),
          theaterMounted: !!(typeof GS !== "undefined" && GS.theaterMounted),
          hasCanvas: !!(host && host.querySelector(".theater-stage-canvas canvas")),
        };
      });
      if (state.hasBattleStage && state.theaterMounted && state.hasCanvas) break;
      await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
      await sleep(300);
    }
    if (process.env.BG_DEBUG) {
      const dbg = await page.evaluate(() => ({
        hasTheaterGlobal: !!window.Theater,
        theaterReady: !!(window.Theater && window.Theater.ready),
        theaterMountFn: !!(window.Theater && typeof window.Theater.mount === "function"),
        sessionLive: !!(activeWorld() && activeWorld().sessionLive),
        el: !!document.getElementById("theaterStage"),
      }));
      log("DEBUG:", JSON.stringify(dbg));
    }
    metrics.theaterMounted = !!(state && state.theaterMounted);
    metrics.stageState = state;
    await sleep(500); // let the GL frame actually paint before the screenshot

    const canvasSel = ".theater-stage-canvas canvas";
    const canvasEl = await page.$(canvasSel);
    metrics.canvasFound = !!canvasEl;

    const shotPath = path.join(outDir, "tray.png");
    if (canvasEl) {
      await canvasEl.screenshot({ path: shotPath });
    } else {
      await page.screenshot({ path: shotPath, fullPage: false });
      metrics.notes.push("no theater canvas found — captured full page instead");
    }

    // compositor-correct non-blank check (same PNG-roundtrip trick capture-stage.mjs's canvasHealth
    // uses — a live WebGL canvas has no preserveDrawingBuffer, so an in-page drawImage/getImageData
    // read on the LIVE canvas reads back black even when the compositor shows a full scene; reading
    // the already-captured PNG file sidesteps that entirely).
    const pngB64 = fs.readFileSync(shotPath).toString("base64");
    const stats = await page.evaluate((b64) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const w = 48, h = 48;
          const c = document.createElement("canvas"); c.width = w; c.height = h;
          const cx = c.getContext("2d"); cx.drawImage(img, 0, 0, w, h);
          const d = cx.getImageData(0, 0, w, h).data;
          let sum = 0; for (let i = 0; i < d.length; i += 4) sum += (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
          resolve({ meanLum: sum / (w * h) });
        } catch (e) { resolve({ meanLum: null, error: e.message }); }
      };
      img.onerror = () => resolve({ meanLum: null, error: "img-load-failed" });
      img.src = "data:image/png;base64," + b64;
    }), pngB64);
    metrics.meanLum = stats.meanLum;
    metrics.canvasConfirmedNonBlank = typeof stats.meanLum === "number" && stats.meanLum >= 8;

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    metrics.consoleErrorsCount = metrics.consoleErrors.length;

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("wrote", path.join(outDir, "tray.png"), "and metrics.json");
    log(JSON.stringify(metrics, null, 2));
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
