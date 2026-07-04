#!/usr/bin/env node
/* dev/battle-gate/capture-stage.mjs — the battle-UI polish loop's headless screenshot GATE HARNESS
   for the in-game battle-stage layout. Round 0 built the harness + shot the BASELINE of master (no
   product-code changes that round). ROUND 1 (this revision) extends the SAME script — output round
   is now BG_ROUND-selectable (default "round0" so a bare re-run stays byte-compatible with round 0's
   own invocation) — with: (a) real DM-log SEEDING via the app's own pushDmLog (two narration
   paragraphs + a roll line + an event-chip line) so the right-rail readability fix can be measured
   against actual rendered content, not one short system line; (b) a Range-API chars-per-line
   measurement on that real seeded .dm-txt node; (c) a placeholder-fits check (textarea scrollWidth vs
   clientWidth with the placeholder showing); (d) a plaque full-text-vs-rendered-text check; (e)
   page.on('requestfailed')/response-status capture surfacing every failed request's URL (round 0
   logged exactly one 404 per boot but never captured which URL); (f) a mutation check that strips
   .battle-stage from .game and re-measures the composer (proving the stage rules are scope-gated,
   classic untouched) then restores it; (g) an explore/classic parity block re-measuring the SAME
   composer/feed rects round 0 took at those modes, to prove those modes are unchanged by this round's
   CSS. See ACCEPTANCE.md + the mission brief for the acceptance bar these measurements serve.

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
       node dev/battle-gate/capture-stage.mjs                    # round 0 output (default, unchanged)
       BG_ROUND=round1 node dev/battle-gate/capture-stage.mjs    # round 1 output, this revision's fixes

   Options (env):
       BG_PORT=5181          override the serve port
       BG_KEEP_SERVER=1      leave the http.server running after (default: kill it)
       BG_ANGLE=1            force --use-angle=swiftshader on the FIRST launch (skip the probe)
       BG_ROUND=round1        output subdir under dev/battle-gate/ (default: round0)
       BG_VARIANT=floor55    ROUND 3 — variant-capture mode: instead of the full standard set, boot ONE
                             fight and write only stage-1440-<variant>.png + a metrics-<variant>.json
                             sidecar into the round dir, then exit. Purpose: A/B a SOURCE-CONST change
                             (e.g. STAGE_AMBIENT_FLOOR 0.55 vs 0.65) that no single run can capture both
                             sides of — edit the const, run the variant, restore the const, run the main
                             pass; the main pass folds any metrics-*.json sidecars found in the round dir
                             into metrics.json under `variants`. NOTE each boot mints a fresh world (gen
                             isn't seedable), so variant-vs-main tile layouts differ — the round-2 N=5
                             study measured that cross-world spread at ~±0.15 luma, far below the effects
                             being compared; treat sub-luma deltas as noise.
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
const ROUND_DIR = process.env.BG_ROUND || "round0";
const VARIANT = process.env.BG_VARIANT || null;   // ROUND 3 — see the header's BG_VARIANT note
const outDir = path.join(__dirname, ROUND_DIR);
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
// ROUND 2 — ARENA polish mutation proof: `boardRegionMeanLum` is the acceptance-criteria number for
// F2 (the lighting floor), sampled the SAME compositor-correct way canvasHealth already solved above
// (PNG bytes -> in-page <img> -> canvas2d getImageData, never a live WebGL readback — see canvasHealth's
// own header comment for why). Split out from canvasHealth as its own named function because this
// round needs to sample TWO different sources through the identical math: (a) a LIVE canvas element via
// elementHandle.screenshot(), and (b) a STATIC PNG FILE already on disk (round1/stage-1440.png, to
// recompute the floor-OFF baseline) — canvasHealth only covers (a). `sampleMeanLumFromPngBase64` is the
// shared inner sampler both paths funnel through, so the numbers are computed identically either way.
// ROUND 3 — the sampler now runs at FULL resolution (no downsample) and returns THREE stats:
//   meanLum        — mean luminance over every pixel of the region (round 2's number, same math).
//   nonVoidMean    — mean luminance of only the pixels ABOVE the void threshold (>10 luma) — the
//                    lit-surface readability number the whole-canvas mean dilutes (the near-black void
//                    background is unlit BY DESIGN and drags the mean down).
//   boardPixelShare — fraction of region pixels above that same threshold: the "board occupies the
//                    majority of the canvas" number (ACCEPTANCE §1). Full resolution matters HERE:
//                    round 2's 64x64 downsample bilinear-blended the PSX dither's dark texels into
//                    their brighter neighbors, inflating the share — full-res counts each real texel.
function inPagePngStats(b64, crop) {
  // (stringified into page.evaluate — plain function, no outer-scope capture)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const sx = crop ? crop.sx : 0, sy = crop ? crop.sy : 0;
        const sw = crop ? crop.sw : img.naturalWidth, sh = crop ? crop.sh : img.naturalHeight;
        const c = document.createElement("canvas"); c.width = sw; c.height = sh;
        const cx = c.getContext("2d");
        cx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const d = cx.getImageData(0, 0, sw, sh).data;
        const VOID_LUMA = 10; // the void threshold (>10 luma = "board pixel"), per the round-3 brief
        let sum = 0, nvSum = 0, nvCount = 0;
        const total = sw * sh;
        for (let i = 0; i < d.length; i += 4) {
          const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          sum += lum;
          if (lum > VOID_LUMA) { nvSum += lum; nvCount++; }
        }
        resolve({
          meanLum: sum / total,
          nonVoidMean: nvCount ? nvSum / nvCount : null,
          boardPixelShare: nvCount / total,
          nonVoidCount: nvCount, totalPixels: total,
          sampleWidth: sw, sampleHeight: sh, voidLumaThreshold: VOID_LUMA,
        });
      } catch (e) { resolve({ meanLum: null, error: e.message }); }
    };
    img.onerror = () => resolve({ meanLum: null, error: "img-load-failed" });
    img.src = "data:image/png;base64," + b64;
  });
}
async function sampleMeanLumFromPngBase64(page, base64Png, crop) {
  // pass the plain function by reference — puppeteer serializes its source and structured-clones the
  // args (the multi-MB base64 rides as an argument, never inlined into a giant expression string).
  return await page.evaluate(inPagePngStats, base64Png, crop || null);
}

// (a) LIVE canvas element -> the full stats trio, recorded on every stage capture per the mission brief.
async function boardRegionMeanLum(page, selector) {
  const el = await page.$(selector);
  if (!el) return { meanLum: null, reason: "selector-not-found" };
  let buf;
  try { buf = await el.screenshot({ encoding: "base64" }); }
  catch (e) { return { meanLum: null, reason: "screenshot-error", error: e.message }; }
  return await sampleMeanLumFromPngBase64(page, buf);
}

// (b) STATIC PNG FILE on disk, cropped by a CSS-pixel rect scaled to the file's OWN device pixel ratio
// (the committed captures used deviceScaleFactor:2 — confirmed the PNGs' real dimensions are 2x the
// CSS viewport, read directly off the PNG IHDR chunk — so a rect recorded in CSS pixels must be
// doubled to land on the right file pixels). Used to recompute prior rounds' canvas regions
// (round1 = floor-off, round2 = floor-0.55) with the SAME full-res math as this round's live numbers,
// so cross-round comparisons are method-identical, never mixed-resolution.
async function boardRegionMeanLumFromFile(page, filePath, cropRectCss, dpr) {
  let buf;
  try { buf = fs.readFileSync(filePath).toString("base64"); }
  catch (e) { return { meanLum: null, reason: "file-read-error", error: e.message }; }
  const scale = dpr || 2;
  const crop = {
    sx: Math.round(cropRectCss.x * scale), sy: Math.round(cropRectCss.y * scale),
    sw: Math.round(cropRectCss.width * scale), sh: Math.round(cropRectCss.height * scale),
  };
  const result = await sampleMeanLumFromPngBase64(page, buf, crop);
  return { ...result, cropPx: crop };
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

// ROUND 1 fix E — every round-0 boot logged exactly one 404 (metrics.consoleErrors) but never
// captured WHICH url. Accumulate failed-request records globally across every page this harness
// opens (stage/classic/explore all share one boot sequence per page, and the mission wants the URL
// surfaced, not per-page-deduped) — page.on('requestfailed') covers network-level failures (DNS,
// blocked, etc.), and a response listener filtering status>=400 covers HTTP-level 404/500s (the kind
// a missing static asset produces against this harness's own python3 http.server, which is what
// round 0's 404s almost certainly were).
const globalFailedRequests = [];
function wireFailedRequestCapture(page, label) {
  page.on("requestfailed", (req) => {
    const f = req.failure();
    globalFailedRequests.push({ url: req.url(), status: null, reason: (f && f.errorText) || "requestfailed", label });
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 400) globalFailedRequests.push({ url: res.url(), status, reason: null, label });
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
  wireFailedRequestCapture(page, label);
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

// ROUND 1 fix B (harness half) — the right-rail readability fix needs to be measured against REAL
// rendered content, not round 0's single short system chip. Investigated the real path an actual DM
// turn appends through: src/world/dm.js's sendTurn/applyResponse call `pushDmLog(w,role,text,meta)`
// (defined src/world/state.js:97 — `dmLogOf(w).push(Object.assign({role,text,t:Date.now(),...},meta))`
// then `w.dmlog` is what dmLogOf(w) returns). This calls that SAME real function directly in page
// context (not raw innerHTML injection) — one "dm" entry with two narration paragraphs (~60 and ~90
// words) plus meta.rolls (the exact shape renderDMFeed's .dm-roll renderer reads, src/world/render.js
// ~165-170: {label,die,result,mods,total} for a check line) and meta.events (the exact shape
// eventChip() reads, src/world/render.js:97-108: {type:"hp_changed",payload:{delta}}). renderWorld()
// afterward mirrors what a real turn-apply does post-pushDmLog.
async function seedDmLog(page) {
  return await page.evaluate(() => {
    try {
      const w = activeWorld();
      if (!w) return { ok: false, reason: "no-active-world" };
      if (typeof pushDmLog !== "function") return { ok: false, reason: "pushDmLog-missing" };
      const p1 = "The goblins break from the treeline in a ragged line, rusted blades catching the grey morning light. Their leader shrieks something in Goblin — a challenge, or maybe just fear given a voice — and the pack surges forward across the frost-brittle grass, boots and bare feet alike churning the mud left by last night's rain.";
      const p2 = "Behind them, low and unhurried, the wolf circles wide toward the treeline's shadow, head down, eyes fixed on the softest-looking target in your line. It isn't afraid of the goblins' noise — it is waiting for an opening the noise creates, patient in the way only something that has hunted before dawn can be patient. You can smell the wet-fur and old-blood musk of it even over the goblins' rank approach, and for a half-second the whole clearing seems to hold its breath around that one gliding shape in the frost."; // ~90 words
      const entry = pushDmLog(w, "dm", p1 + "\n\n" + p2, {
        rolls: [{ label: "Perception", die: "d20", result: 14, total: 19, mods: "+3 +2 prof" }],
        events: [{ type: "hp_changed", payload: { delta: -8 } }],
      });
      // a second, player-role entry so who/roll/latency-line collision (ACCEPTANCE §2) has more than
      // one message shape to prove itself against — mirrors the real dm-you rendering path (m.role==="player").
      pushDmLog(w, "player", "I raise my shield and hold the line, watching the wolf as much as the goblins.", {
        rolls: [{ label: "Athletics", die: "d20", result: 11, total: 15, mods: "+2 +2 prof" }],
      });
      if (typeof renderWorld === "function") renderWorld();
      return { ok: true, dmlogLength: (typeof dmLogOf === "function" ? dmLogOf(w).length : (w.dmlog || []).length), lastEntryRole: entry.role };
    } catch (e) {
      return { ok: false, reason: "exception", error: e.message, stack: e.stack };
    }
  });
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

    // estimated chars-per-line (glyph-width heuristic, kept from round 0 for continuity/comparison —
    // divide the rail's usable width by an average glyph width derived from the computed font-size).
    let estCharsPerLine = null;
    if (dmTxt && dmTxt.firstChild) {
      try {
        const range = document.createRange();
        range.selectNodeContents(dmTxt);
        const full = range.getBoundingClientRect();
        const text = dmTxt.textContent || "";
        if (text.length > 0 && full.width > 0) {
          const cs2 = getComputedStyle(dmTxt);
          const fontSize = parseFloat(cs2.fontSize) || 16;
          const avgGlyphWidth = fontSize * 0.52; // serif body-text heuristic, consistent estimate
          const usableWidth = dmTxt.getBoundingClientRect().width;
          estCharsPerLine = usableWidth > 0 ? Math.round(usableWidth / avgGlyphWidth) : null;
        }
      } catch (e) { /* best-effort estimate */ }
    }
    out.estCharsPerLine = estCharsPerLine;

    // ROUND 1 — REAL chars-per-line, measured directly via the Range API on the actual seeded
    // .dm-txt node's first text node (not a width/glyph-width estimate): walk a Range one character at
    // a time (binary-search-free, simple and correct for a ~150-char first line) and use
    // getClientRects() to detect the exact offset where the FIRST visual line ends — the count of
    // characters whose Range still reports only ONE client rect at the same top as offset 0 is the
    // real first-rendered-line character count. This is the harness's actual acceptance-criteria
    // number (ACCEPTANCE.md "~28-45 chars/line"); estCharsPerLine above is kept only for round-0
    // continuity/comparison, not as the pass/fail number.
    let realCharsPerLineFirstLine = null;
    if (dmTxt) {
      // find the first non-empty text node (seeded content is plain text inside the .dm-txt div, per
      // renderDMFeed's `<div class="dm-txt">${mdBold(escHtml(m.text))}</div>` shape for a completed,
      // non-streaming DM line — exactly what seedDmLog's pushDmLog call produces).
      let textNode = null;
      const walker = document.createTreeWalker(dmTxt, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) { if ((walker.currentNode.textContent || "").trim().length > 0) { textNode = walker.currentNode; break; } }
      if (textNode && textNode.textContent && textNode.textContent.length > 1) {
        try {
          const text = textNode.textContent;
          const range = document.createRange();
          range.setStart(textNode, 0);
          range.setEnd(textNode, 1);
          const firstLineTop = range.getClientRects()[0] ? range.getClientRects()[0].top : null;
          let lastGoodOffset = 1;
          if (firstLineTop != null) {
            for (let i = 2; i <= text.length; i++) {
              range.setEnd(textNode, i);
              const rects = range.getClientRects();
              // once the range spans TWO lines, getClientRects() returns >1 rect (one per visual line) —
              // the offset just before that happens is exactly where the first rendered line ends.
              if (rects.length > 1) break;
              // also stop if the (single) rect's top drifted from the first-char baseline (wrapped early
              // on a boundary getClientRects() didn't split cleanly — conservative fallback).
              if (Math.abs(rects[0].top - firstLineTop) > 1) break;
              lastGoodOffset = i;
            }
          }
          realCharsPerLineFirstLine = lastGoodOffset;
        } catch (e) { /* leave null on any Range failure */ }
      }
    }
    out.realCharsPerLineFirstLine = realCharsPerLineFirstLine;

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

    // ROUND 1 fix C (measurement half) — round 0 flagged .scene-plaque at scrollWidth:151/
    // clientWidth:93 (glyphs chopped both ends, no ellipsis — see the CSS fix's comment for why:
    // text-overflow:ellipsis never applied to the base rule's display:flex). This check confirms the
    // stage-scoped fix: renderedText should now either equal fullText (fits without truncation) or be
    // a proper ellipsis-truncated prefix of it (endsWithEllipsis true, no chopped-mid-glyph state) —
    // and the title attribute (render.js) always carries the untruncated full name regardless.
    const plaqueEl = document.querySelector(".stage-feed-col .scene-plaque");
    if (plaqueEl) {
      const fullText = plaqueEl.getAttribute("title") || plaqueEl.textContent || "";
      const renderedText = plaqueEl.textContent || "";
      // ROUND 2 fix C2 (measurement half) — round1's display:block fix dropped the base rule's
      // align-items:center flex centering, so the title sat high (overlapping the plaque frame art's
      // top edge). The fix (genesis.html) adds line-height:40px matching the box's own height:40px
      // (untouched by the stage override) to re-center via the classic single-line block-centering
      // trick. This checks it landed: the plaque element's OWN box vertical center (its border-image's
      // dark middle band fills the full box height in stage mode, since border-width is only 0 22px —
      // left/right only, never top/bottom) IS the "dark field" center the mission's acceptance bar
      // means; compare it against the ACTUAL RENDERED GLYPHS' bounding box center (a Range over the
      // first non-empty text node — the real glyph ink box, not just the CSS line-box) so this catches
      // a real visual miscenter, not just a line-height number that happens to be right on paper.
      const plaqueRect = plaqueEl.getBoundingClientRect();
      const boxCenterY = plaqueRect.top + plaqueRect.height / 2;
      let textCenterY = null;
      const plaqueWalker = document.createTreeWalker(plaqueEl, NodeFilter.SHOW_TEXT);
      let plaqueTextNode = null;
      while (plaqueWalker.nextNode()) { if ((plaqueWalker.currentNode.textContent || "").trim().length > 0) { plaqueTextNode = plaqueWalker.currentNode; break; } }
      if (plaqueTextNode) {
        try {
          const range = document.createRange();
          range.selectNodeContents(plaqueTextNode);
          const r = range.getBoundingClientRect();
          textCenterY = r.top + r.height / 2;
        } catch (e) { /* leave null on any Range failure */ }
      }
      const centerDeltaPx = textCenterY != null ? (textCenterY - boxCenterY) : null;
      out.plaqueCheck = {
        fullText, renderedText,
        titleMatchesFullText: plaqueEl.getAttribute("title") === fullText,
        scrollWidth: plaqueEl.scrollWidth, clientWidth: plaqueEl.clientWidth,
        overflowing: plaqueEl.scrollWidth > plaqueEl.clientWidth + 1,
        endsWithEllipsisCss: getComputedStyle(plaqueEl).textOverflow === "ellipsis",
        rendersFullTextOrIsTruncatedPrefix: renderedText === fullText || (fullText.startsWith(renderedText) && renderedText.length < fullText.length),
        verticalCenter: {
          boxCenterY, textCenterY, centerDeltaPx,
          withinTolerance: centerDeltaPx != null ? Math.abs(centerDeltaPx) <= 3 : null, // mission's own ±3px acceptance bar
        },
      };
    } else {
      out.plaqueCheck = { reason: "no .scene-plaque found in .stage-feed-col" };
    }

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
      // ROUND 1 — placeholder-fits check (mission requirement): "type what you do…" must render fully
      // unclipped. scrollWidth vs clientWidth on the textarea itself doesn't measure PLACEHOLDER overflow
      // (placeholder text doesn't affect scrollWidth, only actual .value content does) — so this
      // measures the placeholder's own rendered text width via a throwaway <span> cloned with the
      // textarea's exact computed font/letter-spacing, then compares that to the textarea's CONTENT
      // box width (clientWidth minus its own left+right padding). textarea.value is confirmed empty
      // first (the harness never types into #dmAction) so what's showing IS the placeholder.
      placeholderFits: (() => {
        if (!textarea) return null;
        if ((textarea.value || "") !== "") return null; // only meaningful while the placeholder is showing
        const ph = textarea.getAttribute("placeholder") || "";
        if (!ph) return null;
        const csT = getComputedStyle(textarea);
        const span = document.createElement("span");
        span.style.cssText = "position:absolute;visibility:hidden;white-space:pre;top:-9999px;left:-9999px;";
        span.style.font = csT.font;
        span.style.letterSpacing = csT.letterSpacing;
        span.style.fontStyle = csT.fontStyle;
        span.textContent = ph;
        document.body.appendChild(span);
        const phWidth = span.getBoundingClientRect().width;
        document.body.removeChild(span);
        const padL = parseFloat(csT.paddingLeft) || 0, padR = parseFloat(csT.paddingRight) || 0;
        const contentWidth = textarea.clientWidth - padL - padR;
        return { placeholderWidth: phWidth, textareaContentWidth: contentWidth, fits: phWidth <= contentWidth, placeholderText: ph };
      })(),
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
    // ROUND 1 — classic-mode composer+feed parity block (mission requirement): prove classic combat
    // mode's .dm-input/.dm-txt are UNCHANGED by this round's battle-stage-scoped CSS. Every stage-scoped
    // selector this round added is chained through `.game.battle-stage` — classic mode's .game never
    // carries that class, so these should read identical in shape to what the base/has-panel rules
    // alone would produce (not literally identical to round 0's numbers verbatim, since round 0 never
    // seeded DM-log content in classic mode either — but the RULES applying here are provably the same
    // has-panel-clamp rules, confirmed by rect math, not the battle-stage overrides).
    const dmInput = document.querySelector(".dm-input");
    const dmTxt = document.querySelector(".dm-feed .dm-txt");
    const gameEl = document.querySelector(".game");
    return {
      arenaHttpStatus: arenaStatus,
      cmbGridArenaRect: r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null,
      pageScroll: {
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        equal: document.documentElement.scrollHeight === window.innerHeight,
        delta: document.documentElement.scrollHeight - window.innerHeight,
      },
      gameClassList: gameEl ? Array.from(gameEl.classList) : null,
      dmInputRect: dmInput ? (() => { const b = dmInput.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; })() : null,
      dmInputMarginInline: dmInput ? (() => { const s = getComputedStyle(dmInput); return { "margin-inline-start": s.marginInlineStart, "margin-inline-end": s.marginInlineEnd }; })() : null,
      dmTxtFontSize: dmTxt ? getComputedStyle(dmTxt).fontSize : null,
    };
  }, arenaRequestStatus);
}

async function collectExploreMetrics(page) {
  return await page.evaluate(() => {
    // ROUND 1 — explore-mode composer+feed parity block (mission requirement): explore (in-session,
    // no fight) never gets .battle-stage either, so its .dm-input should still be reading the plain
    // base rule (margin-inline:clamp(32px,8vw,180px) — no has-panel clamp either, since no panel is
    // open pre-fight) — a DIFFERENT-but-also-UNCHANGED-by-this-round baseline from classic's has-panel
    // one. Comparing both proves this round's new stage-scoped rules never leak outside .battle-stage.
    const dmInput = document.querySelector(".dm-input");
    const dmTxt = document.querySelector(".dm-feed .dm-txt");
    const gameEl = document.querySelector(".game");
    return {
      pageScroll: {
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        equal: document.documentElement.scrollHeight === window.innerHeight,
        delta: document.documentElement.scrollHeight - window.innerHeight,
      },
      hasIngame: !!document.querySelector(".wrap.ingame"),
      hasBattleStage: !!document.querySelector(".game.battle-stage"),
      gameClassList: gameEl ? Array.from(gameEl.classList) : null,
      dmInputRect: dmInput ? (() => { const b = dmInput.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; })() : null,
      dmInputMarginInline: dmInput ? (() => { const s = getComputedStyle(dmInput); return { "margin-inline-start": s.marginInlineStart, "margin-inline-end": s.marginInlineEnd }; })() : null,
      dmTxtFontSize: dmTxt ? getComputedStyle(dmTxt).fontSize : null,
    };
  });
}

// ==================================================================================================
// ROUND 3 — VARIANT-CAPTURE MODE (BG_VARIANT, see header): one fight, ONE capture, a metrics sidecar,
// exit. Built entirely from the same proven building blocks the main flow uses (bootToInSession /
// startFight / waitForStageMode / seedDmLog / shootFull / boardRegionMeanLum), so the variant's number
// is method-identical to the main pass's stage-1440 number — the only intended difference between the
// two runs is whatever SOURCE CONST the operator swapped between them. Writes metrics-<variant>.json
// (never metrics.json — the main pass owns that and folds sidecars in).
// ==================================================================================================
async function runVariantCapture(browser) {
  const sidecar = { generatedAt: new Date().toISOString(), variant: VARIANT, blockers: [] };
  const page = await newPage(browser, `variant-${VARIANT}`);
  await page.goto(`${BASE}/genesis.html`, { waitUntil: "domcontentloaded" });
  await sleep(300);
  const boot = await bootToInSession(page);
  sidecar.boot = { ok: boot.ok, worldId: boot.worldId, worldName: boot.worldName };
  if (!boot.ok) { sidecar.blockers.push(`boot failed: ${boot.stage}`); }
  let fight = null;
  if (boot.ok) {
    fight = await startFight(page, [{ name: "Goblin", cr: 0.25 }, { name: "Goblin", cr: 0.25 }, { name: "Wolf", cr: 0.25 }]);
    if (!fight.ok) sidecar.blockers.push(`combat_start failed: ${JSON.stringify(fight)}`);
  }
  if (boot.ok && fight && fight.ok) {
    const stageWait = await waitForStageMode(page, 20000);
    sidecar.stageWait = { ready: stageWait.ready, state: stageWait.state };
    const st = stageWait.state || {};
    if (!(st.hasBattleStage && st.theaterMounted && st.hasCanvas)) {
      sidecar.blockers.push("theater never structurally mounted (no swiftshader retry in variant mode — record and inspect)");
    } else {
      const seed = await seedDmLog(page);
      sidecar.seed = { ok: seed.ok };
      await sleep(300);
      // same rolled-profile discipline as the main pass's dark-pin check: the variant compares LIGHTING
      // consts, so it must be a dark-profile board — force dark if the fresh world rolled otherwise.
      const pin = await page.evaluate(() => {
        try {
          const cm = GS.combat;
          if (!cm || typeof theaterBoardFrom !== "function") return { ok: false, reason: "no-combat-or-theaterBoardFrom" };
          const env = (cm.segment && cm.segment.environment) || undefined;
          const board = theaterBoardFrom(cm.segment, cm.scene, { env });
          const rolledProfile = (board.light && board.light.profile) || null;
          if (rolledProfile === "dark") return { ok: true, rolledProfile, alreadyDark: true };
          const forced = Object.assign({}, board, { light: Object.assign({}, board.light, { profile: "dark" }) });
          if (window.Theater && typeof window.Theater.setBoard === "function") window.Theater.setBoard(forced);
          return { ok: true, rolledProfile, alreadyDark: false, forcedApplied: true };
        } catch (e) { return { ok: false, reason: "exception", error: e.message }; }
      });
      sidecar.darkPin = pin;
      if (pin.ok && !pin.alreadyDark) await sleep(300);
      const f = path.join(outDir, `stage-1440-${VARIANT}.png`);
      const bytes = await shootFull(page, f);
      sidecar.capture = { name: `stage-1440-${VARIANT}.png`, path: f, bytes };
      sidecar.boardRegionStats = await boardRegionMeanLum(page, ".theater-stage-canvas canvas");
      log(`stage-1440-${VARIANT}.png -> ${bytes} bytes; stats: ${JSON.stringify(sidecar.boardRegionStats)}`);
    }
  }
  await page.close();
  const sidecarPath = path.join(outDir, `metrics-${VARIANT}.json`);
  fs.writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2) + "\n");
  log(`variant '${VARIANT}' sidecar -> ${path.relative(repoRoot, sidecarPath)}${sidecar.blockers.length ? ` (BLOCKERS: ${sidecar.blockers.join("; ")})` : ""}`);
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

    // ROUND 3 — variant-capture mode short-circuits the whole standard flow (see runVariantCapture).
    if (VARIANT) { await runVariantCapture(browser); return; }

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

    // ROUND 2 harness addition 2 (extended in ROUND 3) — recompute the canvas-region stats for the
    // COMMITTED prior-round stage-1440.png files, with the SAME full-res sampler as this round's live
    // numbers (cross-round comparisons must be method-identical, never mixed-resolution):
    //   round1 = floor OFF, zoom default 0.64  (the original baseline)
    //   round2 = floor 0.55, zoom clamp-pinned 0.6 (round 2's shipped state)
    // Independent of any live fight/board state — this just decodes on-disk PNGs through the in-page
    // canvas2d sampler on this freshly-navigated page. Cropped by each round's OWN recorded
    // stage1440.theaterStageCanvas.clientRect (CSS px), scaled by its deviceScaleFactor:2 (confirmed:
    // the PNGs' real dimensions are 2x the CSS viewport, read off the PNG IHDR chunk). A missing
    // metrics.json/PNG degrades to a reason string, never a thrown blocker.
    async function recomputePriorRound(roundDirName) {
      try {
        const mPath = path.join(__dirname, roundDirName, "metrics.json");
        const pngPath = path.join(__dirname, roundDirName, "stage-1440.png");
        if (!fs.existsSync(mPath) || !fs.existsSync(pngPath)) return { meanLum: null, reason: `${roundDirName} metrics.json or stage-1440.png not found` };
        const priorMetrics = JSON.parse(fs.readFileSync(mPath, "utf8"));
        const canvasRect = priorMetrics.stage1440 && priorMetrics.stage1440.theaterStageCanvas && priorMetrics.stage1440.theaterStageCanvas.clientRect;
        if (!canvasRect) return { meanLum: null, reason: `${roundDirName} metrics.json has no stage1440.theaterStageCanvas.clientRect` };
        const r = await boardRegionMeanLumFromFile(page, pngPath, canvasRect, 2);
        return { ...r, sourceCropRectCss: canvasRect, sourceFile: `${roundDirName}/stage-1440.png`, sourceDpr: 2 };
      } catch (e) { return { meanLum: null, reason: "exception", error: e.message }; }
    }
    metrics.round1BoardRegionMeanLumFloorOff = await recomputePriorRound("round1");
    log(`round1/stage-1440.png canvas-region stats (floor-OFF baseline): ${JSON.stringify(metrics.round1BoardRegionMeanLumFloorOff)}`);
    metrics.round2BoardRegionStatsFloor55Zoom06 = await recomputePriorRound("round2");
    log(`round2/stage-1440.png canvas-region stats (floor-0.55/zoom-0.6 baseline): ${JSON.stringify(metrics.round2BoardRegionStatsFloor55Zoom06)}`);

    // ---- explore-1440.png: in-session, NO fight — sanity baseline ------------------------------
    if (boot.ok) {
      await sleep(200);
      const exploreMetrics = await collectExploreMetrics(page);
      metrics.explore = exploreMetrics;
      const f = path.join(outDir, "explore-1440.png");
      const size = await shootFull(page, f);
      report.captures.push({ name: "explore-1440.png", ok: true, path: f, bytes: size });
      log(`explore-1440.png -> ${size} bytes`);

      // ROUND 1 — the visual PNG above intentionally stays the clean UNSEEDED baseline (explore's own
      // "sanity baseline" purpose per its header comment), but dmTxtFontSize in collectExploreMetrics
      // reads null pre-seed (the empty-feed fallback markup — src/world/render.js:183's `<div
      // class="empty">` — has no .dm-txt node at all until a real dmlog entry exists). Seed the SAME
      // real dmlog content here, AFTER the screenshot, purely so the parity metric has a real .dm-txt
      // to compare against classic/stage — this never touches the PNG already written above. Then
      // TRUNCATE w.dmlog back to empty (this page continues on into the SAME world for the stage-mode
      // capture below — leaving the seed in place would double-stack into the stage feed, producing a
      // stray pre-combat roll line ahead of the "Combat start" chip that could misread as a real
      // ordering bug rather than harness test-data residue).
      const exploreSeed = await seedDmLog(page);
      metrics.exploreSeedResult = exploreSeed;
      if (exploreSeed.ok) {
        await sleep(150);
        metrics.explore = { ...metrics.explore, ...(await collectExploreMetrics(page)) };
        await page.evaluate(() => { const w = activeWorld(); if (w) w.dmlog = []; });
      }
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

    // ---- ROUND 1 fix B: seed real DM-log content BEFORE any stage screenshot/metric is taken, so
    // every downstream capture (the PNG, feedText, estCharsPerLine, overflowingDescendants) reflects
    // actual rendered prose+roll+event content, not round 0's single short system-chip line. ----------
    let seedResult = null;
    if (boot.ok && fightResult && fightResult.ok && structurallyMounted) {
      seedResult = await seedDmLog(page);
      report.bootNotes.push({ phase: "seed-dm-log", ...seedResult });
      if (!seedResult.ok) report.blockers.push(`seedDmLog FAILED: ${JSON.stringify(seedResult)}`);
      else { log(`seedDmLog ok — dmlog length ${seedResult.dmlogLength}`); await sleep(300); }
    }
    metrics.seedResult = seedResult;

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

      // ROUND 2 harness addition 1 — boardRegionMeanLum on this (and every other) stage capture: the
      // F2 lighting-floor mutation-proof number, sampled from the CANVAS ONLY (not the full page).
      metrics.stage1440.boardRegionMeanLum = await boardRegionMeanLum(page, ".theater-stage-canvas canvas");
      log(`stage-1440 boardRegionMeanLum: ${JSON.stringify(metrics.stage1440.boardRegionMeanLum)}`);

      // ---- DARK-PROFILE PINNING (mission's "Gates you run" §Lighting mutation proof) — the seeded
      // fight's actual rolled light.profile rides cm.segment.light.profile (theaterStageSync's own read,
      // src/world/render.js:373); this harness's synthetic combat_start has no active walk (no real DM
      // turn ever ran theaterEnvSegmentFor), so segment.light is almost always null/absent here and
      // theaterBoardFrom's own fallback (theaterRollLight, deterministic off the segment id — NOT
      // Math.random) resolves it. Read whatever it actually resolved to; if it's already "dark", the
      // stage-1440 capture above IS the worst-case pin (no need to force/duplicate it). If the seeded
      // fight happened to roll something else, re-apply the SAME board data with light.profile forced
      // to "dark" (mission's exact instruction) and capture the worst-case frame separately so the
      // sanity check always has a real dark-profile number to report against, regardless of luck.
      const darkPin = await page.evaluate(() => {
        try {
          const cm = GS.combat;
          if (!cm || typeof theaterBoardFrom !== "function") return { ok: false, reason: "no-combat-or-theaterBoardFrom" };
          const env = (cm.segment && cm.segment.environment) || undefined;
          const board = theaterBoardFrom(cm.segment, cm.scene, { env });
          const rolledProfile = (board.light && board.light.profile) || null;
          if (rolledProfile === "dark") return { ok: true, rolledProfile, alreadyDark: true };
          // force dark and re-apply — same board data, only light.profile overridden, per the mission's
          // own instruction ("re-apply the same board data with light.profile='dark' in-page").
          const forced = Object.assign({}, board, { light: Object.assign({}, board.light, { profile: "dark" }) });
          if (window.Theater && typeof window.Theater.setBoard === "function") window.Theater.setBoard(forced);
          return { ok: true, rolledProfile, alreadyDark: false, forcedApplied: true };
        } catch (e) { return { ok: false, reason: "exception", error: e.message }; }
      });
      report.bootNotes.push({ phase: "dark-profile-pin-check", ...darkPin });
      let darkProfileMeanLum = metrics.stage1440.boardRegionMeanLum; // if already dark, this IS the pinned number
      let darkProfilePinned = !!(darkPin.ok && darkPin.alreadyDark);
      if (darkPin.ok && !darkPin.alreadyDark && darkPin.forcedApplied) {
        await sleep(300); // let the forced re-apply/re-render settle (same settle window as the initial stage-1440 capture)
        const pinnedFile = path.join(outDir, "stage-1440-dark-pinned.png");
        const pinnedSize = await shootFull(page, pinnedFile);
        report.captures.push({ name: "stage-1440-dark-pinned.png", ok: true, path: pinnedFile, bytes: pinnedSize });
        darkProfileMeanLum = await boardRegionMeanLum(page, ".theater-stage-canvas canvas");
        darkProfilePinned = true;
        log(`stage-1440-dark-pinned.png -> ${pinnedSize} bytes (forced from rolled "${darkPin.rolledProfile}") — boardRegionMeanLum: ${JSON.stringify(darkProfileMeanLum)}`);
        // restore the board to its actually-rolled profile before continuing (this harness's other
        // captures below — right-rail/composer/1280 — should reflect what the fight really rolled, not
        // the forced pin, which is a side-channel worst-case check only).
        await page.evaluate(() => {
          try {
            const cm = GS.combat;
            const env = (cm.segment && cm.segment.environment) || undefined;
            const board = theaterBoardFrom(cm.segment, cm.scene, { env });
            if (window.Theater && typeof window.Theater.setBoard === "function") window.Theater.setBoard(board);
          } catch (e) { /* best-effort restore */ }
        });
        await sleep(300);
      } else if (!darkPin.ok) {
        log(`dark-profile-pin check could not run: ${JSON.stringify(darkPin)}`);
      }
      metrics.darkProfilePinned = darkProfilePinned;
      metrics.darkProfileRolled = darkPin.ok ? darkPin.rolledProfile : null;
      metrics.darkProfileBoardRegionMeanLum = darkProfileMeanLum;
      log(`darkProfilePinned=${darkProfilePinned}, rolledProfile=${darkPin.ok ? darkPin.rolledProfile : "unknown"}, meanLum=${JSON.stringify(darkProfileMeanLum)}`);

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

      // ---- MUTATION CHECK (mission requirement) — proves the composer fix is scope-gated to
      // .battle-stage, not a global .dm-input change that happens to also apply to classic/explore.
      // Strip .battle-stage from .game in-page (no reload — same live DOM), re-measure the composer
      // (must SNAP BACK to the has-panel clamp values: ~206px total / 144px textarea / 60px button,
      // round 0's own numbers), then restore .battle-stage and re-measure (must return to this
      // round's fixed values). Both measurement sets land in metrics.mutationCheck.
      metrics.mutationCheck = await page.evaluate(() => {
        const gameEl = document.querySelector(".game");
        const measure = () => {
          const dmInput = document.querySelector(".dm-input");
          const textarea = document.querySelector(".dm-input textarea");
          const button = document.querySelector(".dm-input button");
          if (!dmInput) return null;
          const r = (el) => el ? (() => { const b = el.getBoundingClientRect(); return { width: b.width, height: b.height }; })() : null;
          return {
            gameClassList: gameEl ? Array.from(gameEl.classList) : null,
            dmInputWidth: dmInput.getBoundingClientRect().width,
            textareaRect: r(textarea),
            buttonRect: r(button),
            buttonWidthPctOfDmInput: (button) ? (button.getBoundingClientRect().width / dmInput.getBoundingClientRect().width * 100) : null,
          };
        };
        if (!gameEl) return { ok: false, reason: "no .game element" };
        const hadBattleStage = gameEl.classList.contains("battle-stage");
        const before = measure(); // fixed (this round's) values, battle-stage still present
        gameEl.classList.remove("battle-stage");
        const mutated = measure(); // expect snap-back to has-panel clamp values
        if (hadBattleStage) gameEl.classList.add("battle-stage"); // restore
        const restored = measure(); // expect back to fixed values
        return { ok: true, fixedBeforeMutation: before, mutatedNoBattleStageClass: mutated, restoredAfterMutation: restored };
      });

      // ---- 2. stage-1280.png (resize viewport, same live state) --------------------------------
      await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
      await sleep(300);
      const f1280 = path.join(outDir, "stage-1280.png");
      const size1280 = await shootFull(page, f1280);
      report.captures.push({ name: "stage-1280.png", ok: true, path: f1280, bytes: size1280 });
      log(`stage-1280.png -> ${size1280} bytes`);
      metrics.stage1280 = await collect1280Metrics(page);
      // ROUND 2 harness addition 1 (cont.) — boardRegionMeanLum for every stage capture, not just 1440.
      metrics.stage1280.boardRegionMeanLum = await boardRegionMeanLum(page, ".theater-stage-canvas canvas");
      log(`stage-1280 boardRegionMeanLum: ${JSON.stringify(metrics.stage1280.boardRegionMeanLum)}`);
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

      // ---- ROUND 2 harness addition 3 — A/B ZOOM PROTOCOL (F1's proof) — same seeded fight, all at
      // 1440x900. Runs LAST (after every standard capture above is already safely on disk) — this
      // block calls window.Theater.zoom(1) TWICE, and those steps are NOT reversible in general: if a
      // step lands on the [ZOOM_MIN,ZOOM_MAX] clamp (round 2's baked default sat exactly ON the clamp;
      // round 3's 0.512 default hits it after one manual step), a same-count zoom(-1) sequence does
      // NOT return to the pre-clamp value (a clamped
      // zoom(1) throws away the "how far over the ceiling/floor it tried to go" information, so the
      // reverse step starts multiplying from the CLAMPED value, not the true prior one — verified live:
      // an earlier revision of this block ran the A/B protocol BEFORE stage-1280.png and "restored"
      // with two zoom(-1) calls, which landed at 0.9375 instead of the true baked-default 0.6 for this
      // exact fight, silently corrupting stage-1280.png's zoom state). Running this LAST sidesteps the
      // whole problem — nothing downstream on this page depends on the zoom level once this fires, so
      // no restore is needed at all.
      // zoom0 = the BAKED default (this round's once-per-fight bias in theaterStageSync already fired
      // during setBoard earlier — every capture up to and including stage-1280.png above reflects it —
      // so THIS shot is "what a player sees the instant the fight mounts," no extra Theater.zoom() call
      // here). zoom1/zoom2 each call window.Theater.zoom(1) ONE MORE time past that baked default.
      // window.Theater exposes zoom(dir) as the ONLY zoom surface (src/ui/theater-boot.js:2925-2926's
      // window.Theater object literal — no readable .zoomLevel property, checked directly) — it returns
      // the resulting numeric level on a real call, or false pre-mount/on a no-op dir (zoom(0) included,
      // per zoom()'s own early-return). That means zoom0's OWN level is never independently peekable
      // without either calling zoom() again (which would mutate it, defeating "no extra call at zoom0")
      // or adding new public surface to window.Theater (out of bounds for this mission). So zoom0 below
      // reports only what's real: the frame + a note; zoom1/zoom2's ACTUAL returned zoomLevel numbers
      // are the real data points the orchestrator compares (each one more explicit step past whatever
      // zoom0's baked level was — the meaningful A/B signal regardless of the absolute zoom0 number).
      const zoomAB = { steps: [] };
      {
        const f0 = path.join(outDir, "stage-zoom0.png");
        const size0 = await shootFull(page, f0);
        report.captures.push({ name: "stage-zoom0.png", ok: true, path: f0, bytes: size0 });
        zoomAB.steps.push({ name: "stage-zoom0.png", zoomLevelAfter: null, bytes: size0, note: "baked default (once-per-fight bias already applied by theaterStageSync); zoomLevel not independently readable without a mutating zoom() call — see block comment above" });
        log(`stage-zoom0.png -> ${size0} bytes (baked default, no manual zoom call)`);
      }
      {
        const z1 = await page.evaluate(() => (window.Theater && typeof window.Theater.zoom === "function") ? window.Theater.zoom(1) : false);
        await sleep(200);
        const f1 = path.join(outDir, "stage-zoom1.png");
        const size1 = await shootFull(page, f1);
        report.captures.push({ name: "stage-zoom1.png", ok: true, path: f1, bytes: size1 });
        zoomAB.steps.push({ name: "stage-zoom1.png", zoomLevelAfter: z1, bytes: size1, note: "baked default + 1 manual Theater.zoom(1) step" });
        log(`stage-zoom1.png -> ${size1} bytes (Theater.zoom(1) returned ${z1})`);
      }
      {
        const z2 = await page.evaluate(() => (window.Theater && typeof window.Theater.zoom === "function") ? window.Theater.zoom(1) : false);
        await sleep(200);
        const f2 = path.join(outDir, "stage-zoom2.png");
        const size2 = await shootFull(page, f2);
        report.captures.push({ name: "stage-zoom2.png", ok: true, path: f2, bytes: size2 });
        zoomAB.steps.push({ name: "stage-zoom2.png", zoomLevelAfter: z2, bytes: size2, note: "baked default + 2 manual Theater.zoom(1) steps" });
        log(`stage-zoom2.png -> ${size2} bytes (Theater.zoom(1) returned ${z2})`);
      }
      metrics.zoomAB = zoomAB;
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

      // ROUND 1 — same pattern as the explore parity block above: classic-fallback.png stays the clean
      // baseline PNG, but seed dmlog AFTER it so dmTxtFontSize (currently null pre-seed, same empty-feed
      // reason) gets a real value for the classic-vs-stage font-size comparison.
      const classicSeed = await seedDmLog(page2);
      metrics.classicSeedResult = classicSeed;
      if (classicSeed.ok) {
        await sleep(150);
        metrics.classic = { ...metrics.classic, ...(await collectClassicMetrics(page2, arenaStatus)) };
      }
    } else {
      report.captures.push({ name: "classic-fallback.png", ok: false, reason: boot3.ok ? "combat-start-failed" : "boot-failed" });
      if (!classicFightResult || !classicFightResult.ok) report.blockers.push(`classic-fallback combat_start FAILED: ${JSON.stringify(classicFightResult)}`);
    }

    const errsExplore = await page2.evaluate(() => window.__bgConsoleErrors || []).catch(() => []);
    metrics.consoleErrors.explore.push(...errsExplore.map((e) => `[explore-page2] ${e}`));

    await page2.close();

    // ---- ROUND 1 fix E: surface every failed request's URL (round 0 logged one 404/boot but never
    // captured which url — see wireFailedRequestCapture()'s header comment). Dedupe by url+status so a
    // repeated favicon-style 404 across multiple page loads doesn't spam the same URL N times. --------
    const seen = new Set();
    metrics.failedRequests = globalFailedRequests.filter((r) => {
      const key = `${r.url}|${r.status}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ---- write metrics.json --------------------------------------------------------------------
    // ROUND 3 — fold any variant sidecars (written by earlier BG_VARIANT=<name> runs into this same
    // round dir) into the main metrics, so the orchestrator reads one metrics.json per round.
    const sidecars = fs.readdirSync(outDir).filter((f) => /^metrics-.+\.json$/.test(f));
    if (sidecars.length) {
      metrics.variants = {};
      for (const sf of sidecars) {
        const key = sf.replace(/^metrics-/, "").replace(/\.json$/, "");
        try { metrics.variants[key] = JSON.parse(fs.readFileSync(path.join(outDir, sf), "utf8")); }
        catch (e) { metrics.variants[key] = { error: e.message }; }
      }
      log(`folded ${sidecars.length} variant sidecar(s) into metrics.variants: ${Object.keys(metrics.variants).join(", ")}`);
    }

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
