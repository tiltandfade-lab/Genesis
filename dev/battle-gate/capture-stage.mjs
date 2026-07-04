#!/usr/bin/env node
/* dev/battle-gate/capture-stage.mjs — ROUND 0 of the battle-UI polish loop: a headless screenshot
   GATE HARNESS for the in-game battle-stage layout. Round 0 builds the harness + shoots the BASELINE
   of current master; it changes NO product code (new files only, under dev/battle-gate/).

   MECHANICS COPIED FROM dev/model-qa/capture.mjs (read it first — it solved every hard problem):
     - puppeteer-core resolved via createRequire from ~/.genesis-jsdom/node_modules (same as capture.mjs).
     - System Chrome at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome.
     - Serve THIS WORKTREE's root over python3 -m http.server on a free port >=5181 (never 5175 — a
       live DM bridge may own it; never 5178 — the model-qa rig owns that one). Kill the server when done.
     - Headless first; if the theater canvas comes back blank (mean-luminance heuristic, same math as
       capture.mjs's looksBlank), relaunch with --use-angle=swiftshader.
     - deviceScaleFactor: 2 on all shots.

   THE CRUX — booting into a LIVE FIGHT in the REAL genesis.html (never a mock page):
     dev/gauntlet-1-clicks.mjs stages guided-creation by calling the real global functions directly
     (startBardo/cgChoose/bardoAdvance/...) rather than literal DOM clicks — its own header note calls
     this "mirrors gauntlet-g8.mjs's stager pattern." This driver does the SAME thing via
     page.evaluate(), because the bardo sequence is ~20-30 steps (species/class/background/scores/
     skills/equipment/tools/languages/spells/feat/life/hometown x3/worldbeats x N/found) and driving it
     with literal clicks would be far more brittle than calling the same functions the gauntlet already
     proved safe. This is "driving the real app's real code paths," not inventing a mock — no product
     code is bypassed; every function called here is the same one a player's click would invoke.
   Then a real combat_start via applyEvent (src/world/dm.js), mirroring dev/verify-combat-lifecycle.mjs's
   canonical payload shape: { type:"combat_start", payload:{ foes:[{name,cr}, ...] } }.

   RUN (from the repo root):
       node dev/battle-gate/capture-stage.mjs

   Options (env):
       BG_PORT=5181          override the serve port
       BG_KEEP_SERVER=1      leave the http.server running after (default: kill it)
       BG_ANGLE=1            force --use-angle=swiftshader on the FIRST launch (skip the probe)
*/

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
const outDir = path.join(__dirname, "round0");
fs.mkdirSync(outDir, { recursive: true });

// never 5175 (live DM bridge) / never 5178 (model-qa rig) — start at 5181 per the mission brief.
const PORT_CANDIDATES = process.env.BG_PORT
  ? [parseInt(process.env.BG_PORT, 10)]
  : [5181, 5182, 5183, 5184, 5185];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const metrics = { generatedAt: new Date().toISOString(), notes: [], consoleErrors: { stage: [], classic: [], explore: [] } };
const report = { captures: [], bootNotes: [], blockers: [] };

function log(...a) { console.log("[battle-gate]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- tiny static server (spawn python3 http.server, bound to 127.0.0.1) ------------------------
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
      if (await probeRoot(port)) {
        log(`port ${port} already serving THIS tree — reusing it`);
        BASE = `http://127.0.0.1:${port}`;
        return { proc: null, reused: true, port };
      }
      log(`port ${port} is busy serving a DIFFERENT root — skipping it`);
      continue;
    }
    log(`starting python3 -m http.server ${port} (bind 127.0.0.1) in ${repoRoot}`);
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
      cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"],
    });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) {
        if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, reused: false, port }; }
        break;
      }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}

// ---- blank-canvas heuristic ----------------------------------------------------------------------
// IMPORTANT — this does NOT sample the live WebGL canvas via an in-page drawImage()/getImageData()
// read, unlike dev/model-qa/capture.mjs's original approach. Investigated live during this harness's
// build: an in-page `ctx2d.drawImage(liveCanvas,...)` read consistently returned meanLum=0 for the
// ENTIRE poll window even while Puppeteer's own page.screenshot() (going through Chrome's compositor,
// not the page's WebGL readback) captured a correct, visibly non-blank board at the exact same
// moment — confirmed by decoding a captured PNG and measuring its real pixel luminance (~14.7-19.9,
// never near-zero). Root cause: THREE.WebGLRenderer here is constructed WITHOUT
// `preserveDrawingBuffer:true` (src/ui/theater-boot.js:2347, `new THREE.WebGLRenderer({antialias:
// false, alpha:false})` — no preserveDrawingBuffer key) — the drawing buffer clears immediately after
// each compositor present, so any read from OUTSIDE that exact frame reads back empty. This is the
// SAME documented gotcha capture.mjs's own header calls out ("sampling a live WebGL canvas after
// present reads black... even when the compositor shows a full scene") — capture.mjs works around it
// by having its OWN fixture page (dev/model-lineup.html) stash a same-frame snapshot into a
// #scene-probe element; genesis.html is real product code this round must not touch, so that
// page-cooperation trick isn't available here. Fix: use Puppeteer's own elementHandle.screenshot()
// (which reads the compositor correctly, same path as the full-page shots that DO look right) to get
// the canvas's pixels, hand that PNG back into the page as a plain <img> data URL, and sample THAT
// via ctx2d (a plain <img> has no WebGL drawing-buffer-clear gotcha at all).
async function canvasHealth(page, selector) {
  const el = await page.$(selector);
  if (!el) return { meanLum: null, errorsCount: 0, hasCanvas: false };
  let buf;
  try { buf = await el.screenshot({ encoding: "base64" }); }
  catch (e) { return { meanLum: null, errorsCount: 0, hasCanvas: true, screenshotError: e.message }; }
  const result = await page.evaluate((b64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const w = 48, h = 48;
          const c = document.createElement("canvas"); c.width = w; c.height = h;
          const cx = c.getContext("2d");
          cx.drawImage(img, 0, 0, w, h);
          const d = cx.getImageData(0, 0, w, h).data;
          let sum = 0;
          for (let i = 0; i < d.length; i += 4) sum += (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
          resolve({ meanLum: sum / (w * h) });
        } catch (e) { resolve({ meanLum: null, error: e.message }); }
      };
      img.onerror = () => resolve({ meanLum: null, error: "img-load-failed" });
      img.src = "data:image/png;base64," + b64;
    });
  }, buf);
  const errs = await page.evaluate(() => (window.__bgConsoleErrors || []).length).catch(() => 0);
  return { meanLum: result.meanLum, errorsCount: errs, hasCanvas: true, sampleError: result.error };
}
function looksBlank(health) {
  if (health.meanLum == null) return true;
  // dev/model-qa/capture.mjs uses <14 for its lineup-fixture palette; the in-game dungeon/PSX-void
  // environment this harness boots into legitimately reads darker (observed ~14.7-19.9 mean luminance
  // on REAL, correctly-rendered fights — verified by direct pixel sampling of captured PNGs, not a
  // guess) — < 14 alone false-flags a genuinely dark board as blank. Now that the sampling path itself
  // is fixed (see canvasHealth's header comment — this reads a compositor-correct screenshot, not the
  // unreliable in-page WebGL readback), a truly blank canvas should read much closer to the pure-void
  // floor; keep a slightly lower bar than capture.mjs's own 14 to stay conservative against this
  // engine's darker PSX palette.
  return health.meanLum < 8;
}

async function launchChrome(useAngle) {
  const args = [
    "--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle",
    "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1440,900",
  ];
  if (useAngle) args.push("--use-angle=swiftshader");
  log(`launching Chrome${useAngle ? " with --use-angle=swiftshader" : " (default ANGLE)"}`);
  return await puppeteer.launch({
    executablePath: CHROME, headless: "new", args,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });
}

async function newPage(browser, label) {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => { log(`PAGE ERROR [${label}]:`, e.message); errs.push(`pageerror: ${e.message}`); });
  page.on("console", (msg) => {
    if (msg.type() === "error") { log(`console.error [${label}]:`, msg.text().slice(0, 200)); errs.push(`console.error: ${msg.text().slice(0, 300)}`); }
  });
  page._bgErrors = errs;
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); });
  return page;
}

// ==================================================================================================
// IN-PAGE BOOT SCRIPT — mirrors dev/gauntlet-1-clicks.mjs's stageGuidedCreation/autoFillBardoStep,
// but calls the app's REAL global functions inside the REAL browser (real IndexedDB, real ES-module
// theater-boot.js), not a jsdom stage. Every function called here is one a player's click invokes.
// ==================================================================================================
async function bootToInSession(page) {
  const result = await page.evaluate(() => {
    const notes = [];
    try {
      // migrateAll() + showTab('start') already ran at page-load (genesis.html's own boot script).
      if (typeof startBardo !== "function") return { ok: false, stage: "startBardo-missing" };
      startBardo();
      notes.push("startBardo() called");
      if (typeof bardoBegin === "function") bardoBegin();

      // best-effort "choose for me" for every step type (verbatim logic from gauntlet-1-clicks.mjs's
      // autoFillBardoStep, adapted to run against the LIVE GS/window in this real page).
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
          else if (step.t === "life") {
            if (!GS.CGEN.lifeQ) return;
            if (!GS.CGEN.lifeLog[GS.CGEN.lifeI] && typeof bardoLifeRoll === "function") bardoLifeRoll();
          } else if (step.t === "hometown") {
            if (!GS.BARDO.rolled[step.key] && typeof bardoRollHometown === "function") bardoRollHometown();
          } else if (step.t === "world") {
            if (!GS.BARDO.rolled[step.key] && typeof bardoRollWorld === "function") bardoRollWorld();
          }
        } catch (e) { notes.push("autoFillStep threw at " + (step && step.t) + ": " + e.message); }
      }

      const seq = GS.BARDO.seq;
      let guard = 0;
      const MAX_STEPS = seq.length + 10;
      // walk every step, auto-filling then advancing, same discipline as the gauntlet's staging loop.
      while (GS.BARDO && GS.BARDO.i < seq.length - 1 && guard < MAX_STEPS) {
        const step = seq[GS.BARDO.i];
        autoFillStep(step);
        // life steps can have sub-steps (lifeI) that don't map 1:1 to bardoAdvance — drain them first.
        if (step && step.t === "life" && GS.CGEN.lifeQ) {
          let lifeGuard = 0;
          while (GS.CGEN.lifeI < GS.CGEN.lifeQ.length - 1 && lifeGuard < 40) {
            autoFillStep(step);
            if (typeof bardoLifeStepNext === "function") bardoLifeStepNext();
            lifeGuard++;
          }
          // final life sub-step + roll before leaving the life beat
          autoFillStep(step);
          if (typeof bardoLifeStepNext === "function") bardoLifeStepNext();
        }
        bardoAdvance();
        guard++;
      }
      notes.push("bardo walk finished after " + guard + " steps, GS.BARDO.i=" + (GS.BARDO && GS.BARDO.i));

      // final step is {t:"found"} — bardoWake() reads #charName (best-effort set) then bardoFound().
      const nameEl = document.getElementById("charName");
      if (nameEl) nameEl.value = "Gate Harness Test Soul";
      if (typeof bardoWake === "function") bardoWake();
      else if (typeof bardoFound === "function") bardoFound();
      notes.push("bardoFound/bardoWake called");

      // bardoFound -> bindWorld() + cgBind() run synchronously; cgBind() also calls wakeIntoWorld().
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) {
        return { ok: false, stage: "no-living-pc-after-found", notes, worldId: world.id };
      }

      showTab("world");
      notes.push("showTab('world') called");
      return { ok: true, notes, worldId: world.id, worldName: world.name, pcName: world.characters[0].name };
    } catch (e) {
      return { ok: false, stage: "exception", error: e.message, stack: e.stack, notes };
    }
  });
  return result;
}

// start a fight the same way the app does (mirrors verify-combat-lifecycle.mjs's canonical shape).
async function startFight(page, foes) {
  return await page.evaluate((foesSpec) => {
    try {
      const w = activeWorld();
      if (!w) return { ok: false, reason: "no-active-world" };
      const r = applyEvent(w, { type: "combat_start", payload: { foes: foesSpec } });
      if (r && r.ok) renderWorld(); // mirrors what the real DM-turn apply path does after an event lands
      return { ok: !!(r && r.ok), raw: r };
    } catch (e) {
      return { ok: false, reason: "exception", error: e.message, stack: e.stack };
    }
  }, foes);
}

// disable the theater BEFORE combat starts, forcing the classic combat-panel fallback. Per
// src/world/render.js's theaterStageSync, the real gate is `window.Theater && typeof
// window.Theater.mount==="function"` (hasTheater) — there is no separate GS.flags.theater kill
// switch in the shipped code (checked: grep found none), so the accurate way to force classic mode
// is to remove/neuter the real gate exactly as render.js reads it.
async function disableTheater(page) {
  return await page.evaluate(() => {
    try {
      if (window.Theater) { try { window.Theater.retire && window.Theater.retire(); } catch (e) {} }
      window.Theater = undefined;
      GS.theaterMounted = false;
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  });
}

// wait until stage mode is live: .battle-stage class + Theater mounted + canvas non-blank
async function waitForStageMode(page, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 20000);
  let last = null;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => {
      const host = document.getElementById("worldView");
      const hasBattleStage = !!(host && host.querySelector(".game.battle-stage"));
      const theaterMounted = !!(typeof GS !== "undefined" && GS.theaterMounted);
      const hasCanvas = !!(host && host.querySelector(".theater-stage-canvas canvas"));
      return { hasBattleStage, theaterMounted, hasCanvas };
    });
    last = state;
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas) {
      const health = await canvasHealth(page, ".theater-stage-canvas canvas");
      if (!looksBlank(health)) return { ready: true, state, health };
      last = { ...state, health };
    }
    // force a render pass so theaterStageSync gets another chance to mount (mirrors real per-turn renders)
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return { ready: false, state: last };
}

async function shootFull(page, file) {
  await page.screenshot({ path: file, fullPage: false });
  return fs.statSync(file).size;
}
async function shootClip(page, selector, file, marginPx) {
  const el = await page.$(selector);
  if (!el) return { ok: false, reason: "selector-not-found" };
  const box = await el.boundingBox();
  if (!box) return { ok: false, reason: "no-bounding-box" };
  const m = marginPx || 0;
  const clip = {
    x: Math.max(0, box.x - m), y: Math.max(0, box.y - m),
    width: box.width + m * 2, height: box.height + m * 2,
  };
  await page.screenshot({ path: file, clip });
  return { ok: true, size: fs.statSync(file).size, box };
}

// ==================================================================================================
// METRICS COLLECTION (in-page) — see the mission's metrics.json field list.
// ==================================================================================================
async function collectStageMetrics(page) {
  return await page.evaluate(() => {
    const out = {};
    const rectOf = (el) => el ? (() => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, left: r.left, right: r.right, bottom: r.bottom }; })() : null;
    const cs = (el, props) => { if (!el) return null; const s = getComputedStyle(el); const o = {}; props.forEach((p) => o[p] = s.getPropertyValue(p)); return o; };

    const wrapWrap = document.querySelector(".theater-stage-wrap");
    const canvasEl = document.querySelector(".theater-stage-canvas canvas");
    const canvasWrapEl = document.querySelector(".theater-stage-canvas");
    out.theaterStageWrap = {
      rect: rectOf(wrapWrap),
      heightPctVh: wrapWrap ? (wrapWrap.getBoundingClientRect().height / window.innerHeight * 100) : null,
    };
    out.theaterStageCanvas = canvasEl ? {
      clientRect: rectOf(canvasEl),
      backingWidth: canvasEl.width, backingHeight: canvasEl.height,
      clientAspect: canvasEl.getBoundingClientRect().width / Math.max(1, canvasEl.getBoundingClientRect().height),
      backingAspect: canvasEl.width / Math.max(1, canvasEl.height),
    } : null;
    if (out.theaterStageCanvas) {
      out.theaterStageCanvas.aspectDelta = Math.abs(out.theaterStageCanvas.clientAspect - out.theaterStageCanvas.backingAspect);
    }
    out.canvasWrapRect = rectOf(canvasWrapEl);

    const feedCol = document.querySelector(".stage-feed-col");
    out.stageFeedCol = { rect: rectOf(feedCol), width: feedCol ? feedCol.getBoundingClientRect().width : null };
    const gameEl = document.querySelector(".game");
    out.gameHasPanel = !!(gameEl && gameEl.classList.contains("has-panel"));
    out.gameClassList = gameEl ? Array.from(gameEl.classList) : null;

    // feed readability
    const dmTxt = document.querySelector(".stage-feed-col .dm-feed .dm-txt");
    const dmRoll = document.querySelector(".stage-feed-col .dm-feed .dm-roll");
    const dmWho = document.querySelector(".stage-feed-col .dm-feed .dm-who");
    out.feedText = { dmTxt: cs(dmTxt, ["font-size", "line-height"]), dmRoll: cs(dmRoll, ["font-size", "line-height"]), dmWho: cs(dmWho, ["font-size", "line-height"]) };
    out.feedTextRailWidth = dmTxt ? dmTxt.getBoundingClientRect().width : null;

    // estimated chars-per-line: measure a rendered line's width via Range over its first text node,
    // divide the rail's usable width by (line-width / char-count) if the node's text is long enough
    // to span more than one visual line worth of measurement; else divide by an average glyph width.
    let estCharsPerLine = null;
    if (dmTxt && dmTxt.firstChild) {
      try {
        const range = document.createRange();
        range.selectNodeContents(dmTxt);
        const full = range.getBoundingClientRect();
        const text = dmTxt.textContent || "";
        if (text.length > 0 && full.width > 0) {
          // approximate average glyph width from the full measured block (may span multiple lines —
          // this is an estimate per the spec, not an exact single-line measurement)
          const cs2 = getComputedStyle(dmTxt);
          const fontSize = parseFloat(cs2.fontSize) || 16;
          const avgGlyphWidth = fontSize * 0.52; // serif body-text heuristic, consistent estimate
          const usableWidth = dmTxt.getBoundingClientRect().width;
          estCharsPerLine = usableWidth > 0 ? Math.round(usableWidth / avgGlyphWidth) : null;
        }
      } catch (e) { /* best-effort estimate */ }
    }
    out.estCharsPerLine = estCharsPerLine;

    // overflow flags: any .stage-feed-col descendant with scrollWidth > clientWidth+1
    const overflowing = [];
    if (feedCol) {
      feedCol.querySelectorAll("*").forEach((el) => {
        if (el.scrollWidth > el.clientWidth + 1) {
          overflowing.push({ tag: el.tagName, cls: el.className, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
        }
      });
    }
    out.overflowingDescendants = overflowing.slice(0, 30); // cap so metrics.json stays sane

    // composer
    const dmInput = document.querySelector(".dm-input");
    const textarea = document.querySelector(".dm-input textarea");
    const button = document.querySelector(".dm-input button");
    out.composer = {
      dmInputRect: rectOf(dmInput),
      dmInputMarginInline: cs(dmInput, ["margin-inline-start", "margin-inline-end", "margin-left", "margin-right"]),
      textareaRect: rectOf(textarea),
      textareaFontSize: cs(textarea, ["font-size"]),
      buttonRect: rectOf(button),
      buttonFontSize: cs(button, ["font-size"]),
      buttonPadding: cs(button, ["padding"]),
      buttonWidthPctOfDmInput: (button && dmInput) ? (button.getBoundingClientRect().width / dmInput.getBoundingClientRect().width * 100) : null,
      fitsOneRow: (() => {
        if (!textarea || !button) return null;
        const tRect = textarea.getBoundingClientRect(), bRect = button.getBoundingClientRect();
        // "no wrap" heuristic: their vertical centers are within a small tolerance of each other
        return Math.abs((tRect.top + tRect.height / 2) - (bRect.top + bRect.height / 2)) < 4;
      })(),
      bottomVsViewport: dmInput ? (window.innerHeight - dmInput.getBoundingClientRect().bottom) : null,
      clipped: dmInput ? (dmInput.getBoundingClientRect().bottom > window.innerHeight) : null,
    };

    // page-scroll invariant
    out.pageScroll = {
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      equal: document.documentElement.scrollHeight === window.innerHeight,
      delta: document.documentElement.scrollHeight - window.innerHeight,
    };

    // band rail
    const bandRows = document.querySelectorAll(".stage-band-row");
    out.bandRail = { rowCount: bandRows.length, hasOccCount: document.querySelectorAll(".stage-band-row.has-occ").length };

    return out;
  });
}

async function collect1280Metrics(page) {
  return await page.evaluate(() => {
    const feedCol = document.querySelector(".stage-feed-col");
    const dmInput = document.querySelector(".dm-input");
    return {
      stageFeedColWidth: feedCol ? feedCol.getBoundingClientRect().width : null,
      pageScroll: {
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        equal: document.documentElement.scrollHeight === window.innerHeight,
        delta: document.documentElement.scrollHeight - window.innerHeight,
      },
      composerClipped: dmInput ? (dmInput.getBoundingClientRect().bottom > window.innerHeight) : null,
    };
  });
}

async function collectClassicMetrics(page, arenaRequestStatus) {
  return await page.evaluate((arenaStatus) => {
    const grid = document.querySelector(".cmb-grid-arena");
    const r = grid ? grid.getBoundingClientRect() : null;
    return {
      arenaHttpStatus: arenaStatus,
      cmbGridArenaRect: r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null,
      pageScroll: {
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        equal: document.documentElement.scrollHeight === window.innerHeight,
        delta: document.documentElement.scrollHeight - window.innerHeight,
      },
    };
  }, arenaRequestStatus);
}

async function collectExploreMetrics(page) {
  return await page.evaluate(() => ({
    pageScroll: {
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      equal: document.documentElement.scrollHeight === window.innerHeight,
      delta: document.documentElement.scrollHeight - window.innerHeight,
    },
    hasIngame: !!document.querySelector(".wrap.ingame"),
    hasBattleStage: !!document.querySelector(".game.battle-stage"),
  }));
}

// ==================================================================================================
// MAIN
// ==================================================================================================
async function main() {
  const server = await startServer();
  let browser = null;
  const cleanup = async () => {
    try { if (browser) await browser.close(); } catch (e) {}
    if (server.proc && !process.env.BG_KEEP_SERVER) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  };
  process.on("SIGINT", async () => { await cleanup(); process.exit(130); });

  try {
    let useAngle = process.env.BG_ANGLE === "1";
    browser = await launchChrome(useAngle);

    // =============================================================================================
    // PAGE 1: fresh load -> guided creation -> in-session -> combat_start -> STAGE MODE
    // =============================================================================================
    let page = await newPage(browser, "stage-boot");
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "domcontentloaded" });
    await sleep(300); // let the synchronous boot script (var U=loadU(); migrateAll(); showTab('start')) settle

    const boot = await bootToInSession(page);
    report.bootNotes.push({ phase: "creation-to-in-session", ...boot });
    if (!boot.ok) {
      report.blockers.push(`bootToInSession FAILED at stage '${boot.stage}': ${boot.error || ""}`);
      log("BLOCKER: boot failed —", JSON.stringify(boot));
    } else {
      log(`boot ok — world ${boot.worldId} / PC ${boot.pcName}`);
    }

    // ---- explore-1440.png: in-session, NO fight — sanity baseline ------------------------------
    if (boot.ok) {
      await sleep(200);
      const exploreMetrics = await collectExploreMetrics(page);
      metrics.explore = exploreMetrics;
      const f = path.join(outDir, "explore-1440.png");
      const size = await shootFull(page, f);
      report.captures.push({ name: "explore-1440.png", ok: true, path: f, bytes: size });
      log(`explore-1440.png -> ${size} bytes`);
    } else {
      report.captures.push({ name: "explore-1440.png", ok: false, reason: "boot-failed" });
    }

    // ---- start the fight (real combat_start via applyEvent) ------------------------------------
    let fightResult = null;
    if (boot.ok) {
      fightResult = await startFight(page, [{ name: "Goblin", cr: 0.25 }, { name: "Goblin", cr: 0.25 }, { name: "Wolf", cr: 0.25 }]);
      report.bootNotes.push({ phase: "combat_start", ...fightResult });
      if (!fightResult.ok) report.blockers.push(`combat_start FAILED: ${JSON.stringify(fightResult)}`);
      else log("combat_start ok:", JSON.stringify(fightResult.raw && fightResult.raw.combat ? { foes: fightResult.raw.combat.foes.map((f) => f.fid) } : fightResult.raw));
    }

    // ---- probe for blank canvas, relaunch with swiftshader if needed (mirrors capture.mjs) -----
    let stageWait = null;
    if (boot.ok && fightResult && fightResult.ok) {
      stageWait = await waitForStageMode(page, 20000);
      if (!stageWait.ready && !useAngle) {
        log(`stage canvas looks blank/absent (state=${JSON.stringify(stageWait.state)}); relaunching with --use-angle=swiftshader`);
        await page.close();
        await browser.close();
        useAngle = true;
        browser = await launchChrome(true);
        page = await newPage(browser, "stage-boot-retry");
        await page.goto(`${BASE}/genesis.html`, { waitUntil: "domcontentloaded" });
        await sleep(300);
        const boot2 = await bootToInSession(page);
        report.bootNotes.push({ phase: "creation-to-in-session-retry-swiftshader", ...boot2 });
        if (boot2.ok) {
          const fightResult2 = await startFight(page, [{ name: "Goblin", cr: 0.25 }, { name: "Goblin", cr: 0.25 }, { name: "Wolf", cr: 0.25 }]);
          report.bootNotes.push({ phase: "combat_start-retry", ...fightResult2 });
          stageWait = await waitForStageMode(page, 20000);
        } else {
          report.blockers.push(`retry boot FAILED: ${boot2.stage}`);
        }
      }
      metrics.stageWaitFinal = stageWait ? { ready: stageWait.ready, state: stageWait.state, health: stageWait.health } : null;
      metrics.angleUsed = useAngle ? "swiftshader" : "default-angle";
    }

    // theaterMounted reflects the ACTUAL last-observed GS.theaterMounted/.battle-stage/#canvas state,
    // not just whether the (possibly over-strict) blank-canvas heuristic was satisfied — a scene can
    // be genuinely mounted+painted (hasBattleStage/theaterMounted/hasCanvas all true) even if
    // waitForStageMode's `ready` gate didn't flip (e.g. a borderline-dark frame). Report both signals
    // distinctly so a false "never mounted" blocker is never conflated with a real mount failure.
    const lastState = stageWait && stageWait.state;
    const structurallyMounted = !!(lastState && lastState.hasBattleStage && lastState.theaterMounted && lastState.hasCanvas);
    const canvasConfirmedNonBlank = !!(stageWait && stageWait.ready);
    metrics.theaterMounted = structurallyMounted;
    metrics.canvasConfirmedNonBlank = canvasConfirmedNonBlank;
    if (!structurallyMounted) {
      report.blockers.push(`Theater never reached structural mount (battle-stage+theaterMounted+canvas). Last state: ${JSON.stringify(lastState)}`);
    } else if (!canvasConfirmedNonBlank) {
      report.bootNotes.push({ phase: "canvas-blank-heuristic-note", note: "structurally mounted (battle-stage+theaterMounted+canvas all true) but the blank-canvas luminance heuristic did not clear its threshold — inspect the PNG directly; this is very likely a legitimately dark PSX-void scene, not a real blank mount (see looksBlank()'s comment).", health: lastState && lastState.health });
    }

    // ---- 1. stage-1440.png -----------------------------------------------------------------------
    if (boot.ok && fightResult && fightResult.ok) {
      await sleep(300);
      const f = path.join(outDir, "stage-1440.png");
      const size = await shootFull(page, f);
      report.captures.push({ name: "stage-1440.png", ok: true, path: f, bytes: size });
      log(`stage-1440.png -> ${size} bytes (structurallyMounted=${!!(stageWait && stageWait.state && stageWait.state.hasBattleStage && stageWait.state.theaterMounted && stageWait.state.hasCanvas)})`);

      // metrics at 1440x900 stage mode
      metrics.stage1440 = await collectStageMetrics(page);
      const errs1440 = await page.evaluate(() => window.__bgConsoleErrors || []);
      metrics.consoleErrors.stage.push(...errs1440.map((e) => `[1440] ${e}`));

      // ---- 3. stage-right-rail.png (clip to .stage-feed-col) -----------------------------------
      const railFile = path.join(outDir, "stage-right-rail.png");
      const railResult = await shootClip(page, ".stage-feed-col", railFile, 0);
      report.captures.push({ name: "stage-right-rail.png", ok: railResult.ok, path: railFile, ...railResult });
      log(`stage-right-rail.png -> ${JSON.stringify(railResult.ok ? { bytes: railResult.size } : railResult)}`);

      // ---- 4. stage-composer.png (clip to .dm-input + 12px margin) -----------------------------
      const composerFile = path.join(outDir, "stage-composer.png");
      const composerResult = await shootClip(page, ".dm-input", composerFile, 12);
      report.captures.push({ name: "stage-composer.png", ok: composerResult.ok, path: composerFile, ...composerResult });
      log(`stage-composer.png -> ${JSON.stringify(composerResult.ok ? { bytes: composerResult.size } : composerResult)}`);

      // ---- 2. stage-1280.png (resize viewport, same live state) --------------------------------
      await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
      await sleep(300);
      const f1280 = path.join(outDir, "stage-1280.png");
      const size1280 = await shootFull(page, f1280);
      report.captures.push({ name: "stage-1280.png", ok: true, path: f1280, bytes: size1280 });
      log(`stage-1280.png -> ${size1280} bytes`);
      metrics.stage1280 = await collect1280Metrics(page);
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    } else {
      ["stage-1440.png", "stage-right-rail.png", "stage-composer.png", "stage-1280.png"].forEach((name) =>
        report.captures.push({ name, ok: false, reason: "fight-or-boot-failed" })
      );
    }

    await page.close();

    // =============================================================================================
    // PAGE 2: fresh load -> guided creation -> disable Theater -> combat_start -> CLASSIC FALLBACK
    // =============================================================================================
    const page2 = await newPage(browser, "classic-boot");
    await page2.goto(`${BASE}/genesis.html`, { waitUntil: "domcontentloaded" });
    await sleep(300);

    const boot3 = await bootToInSession(page2);
    report.bootNotes.push({ phase: "creation-to-in-session-classic-page", ...boot3 });

    let classicFightResult = null;
    let arenaStatus = null;
    if (boot3.ok) {
      const disableResult = await disableTheater(page2);
      report.bootNotes.push({ phase: "disable-theater", ...disableResult });
      classicFightResult = await startFight(page2, [{ name: "Goblin", cr: 0.25 }, { name: "Goblin", cr: 0.25 }, { name: "Wolf", cr: 0.25 }]);
      report.bootNotes.push({ phase: "combat_start-classic", ...classicFightResult });
      await sleep(500);
    }

    // arena.png HTTP status, checked via an in-page fetch (NOT page.goto — a real navigation would
    // destroy the live app document/state we just built via bardo+combat_start).
    if (boot3.ok) {
      const arenaCheck = await page2.evaluate(async () => {
        try {
          const r = await fetch("assets/battle/arena.png", { cache: "no-store" });
          return { status: r.status, ok: r.ok };
        } catch (e) { return { status: null, ok: false, error: e.message }; }
      }).catch((e) => ({ status: null, ok: false, error: e.message }));
      arenaStatus = arenaCheck;
      report.bootNotes.push({ phase: "arena-png-fetch-check", ...arenaCheck });
    }

    if (boot3.ok && classicFightResult && classicFightResult.ok) {
      const f = path.join(outDir, "classic-fallback.png");
      const size = await shootFull(page2, f);
      report.captures.push({ name: "classic-fallback.png", ok: true, path: f, bytes: size });
      log(`classic-fallback.png -> ${size} bytes`);
      metrics.classic = await collectClassicMetrics(page2, arenaStatus);
      const errsClassic = await page2.evaluate(() => window.__bgConsoleErrors || []);
      metrics.consoleErrors.classic.push(...errsClassic.map((e) => `[classic] ${e}`));
    } else {
      report.captures.push({ name: "classic-fallback.png", ok: false, reason: boot3.ok ? "combat-start-failed" : "boot-failed" });
      if (!classicFightResult || !classicFightResult.ok) report.blockers.push(`classic-fallback combat_start FAILED: ${JSON.stringify(classicFightResult)}`);
    }

    const errsExplore = await page2.evaluate(() => window.__bgConsoleErrors || []).catch(() => []);
    metrics.consoleErrors.explore.push(...errsExplore.map((e) => `[explore-page2] ${e}`));

    await page2.close();

    // ---- write metrics.json --------------------------------------------------------------------
    metrics.bootReport = report;
    const metricsPath = path.join(outDir, "metrics.json");
    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2) + "\n");
    log(`wrote ${path.relative(repoRoot, metricsPath)}`);

    // ---- summary ---------------------------------------------------------------------------------
    const pngs = fs.readdirSync(outDir).filter((f) => f.endsWith(".png"));
    log(`DONE — ${pngs.length} PNGs in ${path.relative(repoRoot, outDir)}/`);
    pngs.sort().forEach((f) => {
      const s = fs.statSync(path.join(outDir, f)).size;
      log(`   ${f} ${(s / 1024).toFixed(0)}KB`);
    });
    if (report.blockers.length) {
      log(`BLOCKERS (${report.blockers.length}):`);
      report.blockers.forEach((b) => log("   - " + b));
    }
  } finally {
    await cleanup();
  }
}

main().catch(async (e) => {
  console.error("[battle-gate] FAILED:", e.stack || e.message);
  try {
    metrics.fatalError = { message: e.message, stack: e.stack };
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2) + "\n");
  } catch (e2) {}
  process.exit(1);
});
