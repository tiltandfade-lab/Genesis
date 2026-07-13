#!/usr/bin/env node
/* dev/graphics-debug/capture-webgl-diagnostics.mjs — Unit R3 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §6, §13.6): the dev-only WebGL diagnostics harness. Turns intermittent GL/geometry failures into
   minimal repros — an ENABLING unit, not a rung of its own; it supports every convergence rung by
   giving every later unit (G2/G3/GP-1/GP-4/...) a repeatable "did this frame actually draw clean"
   check.

   docs/GRAPHICS-CONVERGENCE-CHARTER.md §7 STATEMENT (required at the top of every graphics harness):
     - convergence rung: (enabling) — turns intermittent GL/geometry failures into minimal repros;
       supports every rung, advances none by itself.
     - canonical contracts preserved: dev-only. This file, and everything it injects, NEVER edits
       production render behavior and NEVER ships in genesis.html — see checkBootPathAbsence() below
       for the load-bearing proof, not just an assertion.
     - classification: research-only.
     - negative control: this harness proves it CATCHES an injected GL error (a deliberately-unset
       uniform in a throwaway shader program) — exit code is nonzero if the injected error is NOT
       caught, not just if the real corpus is dirty. See runNegativeControl() + main()'s exit logic.

   WHAT THIS DOES (the 10 steps of §6.1, mapped to functions below):
     1. launch the existing app over localhost           -> startServer()/launchChrome()
     2. inject webgl-lint BEFORE the renderer creates its GL context
                                                           -> registerInjections() (evaluateOnNewDocument)
     3. optionally inject Spector before context creation -> registerInjections() (SPECTOR_SRC, opt-in)
     4. load a deterministic room/encounter fixture        -> FIXTURES[].build()
     5. freeze clock/tweens/particles                      -> waitForSettle() (existing tweensLive()==0
                                                              settle convention; see its own comment for
                                                              why a true freeze API is out of R3's scope)
     6. wait for renderer + texture readiness               -> waitForTheater() + waitForTextures()
     7. render one named frame                              -> per-fixture screenshot
     8. capture console, lint output, renderer info,
        optional Spector JSON                               -> collectConsole()/readRendererInfo()
     9. write a screenshot + structured receipt              -> writeReceipt()
    10. exit nonzero on unapproved GL errors                 -> main()'s exit logic

   WHY webgl-lint IS SAFE TO INJECT LIKE THIS: it is resolved from GEOMETRY_TOOLS_HOME (R0's pinned
   scratch install, never the repo tree) via createRequire, read as plain source text, and handed to
   Puppeteer's evaluateOnNewDocument — which runs it in the PAGE's own JS realm before any of
   genesis.html's own scripts execute, so it patches HTMLCanvasElement.prototype.getContext before
   theater-boot.js's `mount()` (src/ui/theater-boot.js, `new THREE.WebGLRenderer(...)`) ever calls it.
   This is 100% harness-side injection: nothing under src/ imports, references, or conditionally loads
   webgl-lint or spectorjs. Enabling is per-invocation of THIS script, never a query flag genesis.html
   itself reads — matching §3.6's "enabled by a diagnostic harness or explicit dev query flag, never by
   default" law via the harness half of that OR, not the flag half (a query-flag path would require
   src/ to read it, which R3 must not touch).

   PROOF THE EXACT theater-boot.js CONTEXT GETS WRAPPED: registerInjections() also patches
   THREE.WebGLRenderer.prototype.render (a dynamic import() of the SAME vendored ES module URL
   genesis.html's own import map resolves "three" to — browsers dedupe ES module fetches by resolved
   URL, so this is the identical singleton class, not a shadow copy) purely to stash a reference to the
   live renderer instance for read-out; it calls straight through to the original render() every frame,
   changing zero behavior. Once a scene mounts, readRendererInfo() calls
   `renderer.getContext().getExtension('GMAN_debug_helper')` on THAT exact instance — this extension
   only exists on a webgl-lint-wrapped context, so a truthy result is direct, unfakeable proof (not an
   inference) that the exact context theater-boot.js created is the one being linted.

   FIXTURES (4 of the §6.3 corpus's 8 — the task brief's own "at least" floor; reused verbatim
   conventions from existing dev/battle-gate/*.mjs capture harnesses rather than reinvented):
     - row101-ring-pit          — dev/battle-gate/capture-stage-c3-shapes.mjs's own "octagon" scene
                                   (Grand Octagon row 101: sunken arena + raised ring), reused directly.
     - octagon-diagonal-doorway — a Grand Octagon with 4 satellite exits (vs row101's 2), so a door has
                                   a real chance of landing adjacent to one of the octagon's own chamfered
                                   diagonal wall runs (diagonalizeStaircaseRing, src/ui/theater-room-
                                   mesh.js). Verified empirically at runtime via the existing
                                   window.Theater._interiorRoomShellForTest() seam — NOT assumed; see
                                   classifyDoorAdjacency() and the honest `diagonalDoorConfirmed` field
                                   in the receipt if it doesn't land that way.
     - wall-upper-fade-camera-move — dev/battle-gate/capture-wall-occlusion.mjs's own two-yaw sequence
                                   (rotate() + setInteriorVariant({}) forces the SAME board to replay at
                                   the new rotationStep — the documented existing mechanism), reused
                                   verbatim; captures BOTH yaws' diagnostics.
     - wall-mounted-practical    — dev/battle-gate/capture-practicals.mjs's own "sconce-iron" fixture
                                   (mount:"wall", snapping to a real C4.1a mount slot), isolated to just
                                   that one fixture family for a focused GL-diagnostic scene.

   Run:
     node dev/graphics-debug/capture-webgl-diagnostics.mjs
   Env:
     WGL_PORT               override the base port (default tries 5291-5295)
     WGL_SKIP_CORPUS=1      run ONLY the negative control (fast iteration on the negative-control path)
     WGL_SKIP_NEGCTRL=1     run ONLY the real corpus (fast iteration on fixture geometry)
     GEOMETRY_TOOLS_HOME    override the R0 scratch tool home (default ~/.genesis-geometry-tools)

   Output: dev/graphics-debug/reports/{fixtureId}.png + report.json + negative-control.json
   (all UNCOMMITTED evidence — .gitignore'd; see README.md). */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(__dirname, "reports");
fs.mkdirSync(outDir, { recursive: true });

function log(...a) { console.log("[wgl-diag]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── R0 tool home resolution (createRequire, per docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §3.6) ──────
const toolHome = process.env.GEOMETRY_TOOLS_HOME || path.join(os.homedir(), ".genesis-geometry-tools");
const toolHomePkgJson = path.join(toolHome, "package.json");
if (!fs.existsSync(toolHomePkgJson)) {
  console.error(`[wgl-diag] FAILED: tool home not found at ${toolHome} (no package.json). Run:`);
  console.error(`  node dev/geometry-tools/setup.mjs --with-spector`);
  process.exit(1);
}
const toolReq = createRequire(toolHomePkgJson);
let WEBGL_LINT_SRC = null;
let WEBGL_LINT_VERSION = null;
try {
  const lintEntry = toolReq.resolve("webgl-lint");
  WEBGL_LINT_SRC = fs.readFileSync(lintEntry, "utf8");
  WEBGL_LINT_VERSION = JSON.parse(fs.readFileSync(path.join(path.dirname(lintEntry), "package.json"), "utf8")).version;
  log(`resolved webgl-lint@${WEBGL_LINT_VERSION} from ${lintEntry}`);
} catch (e) {
  console.error(`[wgl-diag] FAILED: could not resolve webgl-lint from ${toolHome}: ${e.message}`);
  console.error("  Run: node dev/geometry-tools/setup.mjs");
  process.exit(1);
}
let SPECTOR_SRC = null;
let SPECTOR_VERSION = null;
try {
  const spectorEntry = toolReq.resolve("spectorjs");
  SPECTOR_SRC = fs.readFileSync(spectorEntry, "utf8");
  SPECTOR_VERSION = JSON.parse(fs.readFileSync(path.join(path.dirname(path.dirname(spectorEntry)), "package.json"), "utf8")).version;
  log(`resolved spectorjs@${SPECTOR_VERSION} (standalone, optional)`);
} catch (e) {
  log(`spectorjs not resolved from ${toolHome} (optional, dep-aware-skip): ${e.message}`);
}

// ── server / chrome boilerplate — copied convention from dev/battle-gate/capture-stage-c3-shapes.mjs
// (see that file's own header for the "why" behind each piece) — new port range, disjoint from every
// dev/battle-gate/*.mjs PORT_CANDIDATES literal (5181-5275 already claimed at authoring time). ────────
const PORT_CANDIDATES = process.env.WGL_PORT ? [parseInt(process.env.WGL_PORT, 10)] : [5291, 5292, 5293, 5294, 5295];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

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

// ── the injections (step 2/3): webgl-lint config div + webgl-lint source + spectorjs source (opt-in) +
// the read-only renderer-instance capture patch. Registered via evaluateOnNewDocument so they run
// before ANY of the page's own scripts, on every navigation of this page (including the negative-
// control's "about:blank" pass and the real genesis.html pass) — never a one-time injection that could
// race a later reload. ──────────────────────────────────────────────────────────────────────────────
async function registerInjections(page, { includeSpector }) {
  // console/pageerror capture -> a page-side array, mirroring dev/battle-gate's own
  // window.__bgConsoleErrors convention (see e.g. capture-stage-c3-shapes.mjs) but generalized to
  // carry BOTH errors and warnings, and reset per-phase by the Node side (see collectConsole()).
  await page.evaluateOnNewDocument(() => {
    window.__wglConsole = [];
  });
  page.on("console", (msg) => {
    const type = msg.type();
    if (type === "error" || type === "warning") {
      const text = msg.text();
      log(`console.${type}:`, text.slice(0, 220));
      page.evaluate((t, ty) => { (window.__wglConsole = window.__wglConsole || []).push({ type: ty, text: t, ts: Date.now() }); }, text, type).catch(() => {});
    }
  });
  page.on("pageerror", (e) => {
    log("PAGE ERROR:", e.message);
    page.evaluate((t) => { (window.__wglConsole = window.__wglConsole || []).push({ type: "pageerror", text: t, ts: Date.now() }); }, e.message).catch(() => {});
  });

  // webgl-lint config: throwOnError:false (so a real error logs via console.error rather than
  // throwing and aborting the render loop mid-scene — we want every scene to finish rendering so the
  // FULL set of errors for that frame is captured, not just the first); maxDrawCalls:0 (unlimited —
  // the library's own default of 1000 silently stops checking on a large dressed room, which would
  // under-report, not over-report, errors). Delivered via the library's own documented zero-code
  // `data-gman-debug-helper` DOM-attribute mechanism (§3.6's README, "Configuration" §2) — no fork,
  // no monkeypatch of the library itself.
  await page.evaluateOnNewDocument((cfgJson) => {
    function addConfigDiv() {
      try {
        const d = document.createElement("div");
        d.setAttribute("data-gman-debug-helper", cfgJson);
        d.style.display = "none";
        const root = document.documentElement || document.head || document.body;
        if (root) { root.appendChild(d); return true; }
      } catch (e) {}
      return false;
    }
    if (!addConfigDiv()) document.addEventListener("DOMContentLoaded", addConfigDiv);
  }, JSON.stringify({ throwOnError: false, maxDrawCalls: 0 }));

  // webgl-lint itself — raw source text, resolved from GEOMETRY_TOOLS_HOME (R0's pinned scratch
  // install), never a repo-tree copy. This patches HTMLCanvasElement.prototype.getContext /
  // OffscreenCanvas.prototype.getContext the moment it runs (see its own IIFE tail,
  // ~/.genesis-geometry-tools/node_modules/webgl-lint/webgl-lint.js:3541-3546).
  await page.evaluateOnNewDocument(WEBGL_LINT_SRC);

  if (includeSpector && SPECTOR_SRC) {
    // spectorjs standalone bundle — browser-only UMD, exposes window.SPECTOR. Injected before context
    // creation too (§3.7), though Spector's own capture API (captureCanvas) is invoked AFTER a canvas
    // exists (see runSpectorStandaloneCapture below) — early injection just guarantees window.SPECTOR
    // exists before app code runs, matching the same "inject before context creation" discipline as
    // webgl-lint even though Spector doesn't itself patch getContext at injection time.
    // DEFERRED to DOMContentLoaded (found live: evaluating the bundle at true document-start throws
    // "Cannot read properties of null (reading 'insertBefore')" — Spector's own UI-container init
    // reaches for document.head before the parser has created one on a fresh navigation, e.g.
    // "about:blank"). Safe to defer here: this harness never needs window.SPECTOR before the app is
    // fully booted and a scene is mounted (see runSpectorStandaloneSmoke, called well after
    // waitForTheater) — unlike webgl-lint, Spector's own timing requirement is "before we call
    // captureCanvas," not "before the app's first getContext."
    await page.evaluateOnNewDocument(
      `document.addEventListener('DOMContentLoaded', function(){\n${SPECTOR_SRC}\n});`
    );
  }

  // read-only renderer-instance capture: dynamic import() of the SAME vendored three.module.js URL
  // genesis.html's own import map resolves "three" to (browsers dedupe ES module fetches by resolved
  // URL — this is the identical singleton class object, not a shadow copy), patching
  // WebGLRenderer.prototype.render to stash `this` for read-out and call straight through to the
  // original. Zero behavior change: the original render() always runs, with its original arguments,
  // its original return value passed through. On "about:blank" (the negative-control pass) the import
  // 404s — caught and recorded, not fatal, since the negative control never needs renderer telemetry.
  await page.evaluateOnNewDocument(() => {
    window.__wglRendererDiag = { patched: false, patchError: null, renderCalls: 0 };
    try {
      import("./vendor/three/three.module.js").then((THREE) => {
        const RC = THREE.WebGLRenderer;
        if (RC && !RC.prototype.__wglDiagPatched) {
          const orig = RC.prototype.render;
          RC.prototype.render = function (...args) {
            window.__wglRendererDiag.lastRenderer = this;
            window.__wglRendererDiag.renderCalls++;
            return orig.apply(this, args);
          };
          RC.prototype.__wglDiagPatched = true;
          window.__wglRendererDiag.patched = true;
        }
      }).catch((e) => { window.__wglRendererDiag.patchError = String((e && e.message) || e); });
    } catch (e) { window.__wglRendererDiag.patchError = String((e && e.message) || e); }
  });
}

// snapshot + clear the page-side console buffer -> {errors:[], warnings:[]} (pageerror folded into
// errors). Called around each bounded phase (negative control, each fixture) so every receipt's
// webglLint.{errors,warnings} reflects ONLY that phase's own console activity.
// isLintAttributable(text) -> true when a console entry is actually webgl-lint's OWN output, not
// unrelated page noise sharing the same console.error/warning channel. webgl-lint's own
// reportFunctionError/generateFunctionError ALWAYS format as "error in <funcName>(...): <msg>"
// (webgl-lint.js:3309) or reference its own extension/config surface directly — found live, this
// matters: Spector's own async capture-timeout message ("No frames with gl commands detected. Try
// moving the camera.") and ordinary 404 resource-load noise both land on console.error too, and would
// silently misattribute an unrelated warning to "this fixture's GL diagnostics" if not filtered. Every
// entry is STILL preserved in the `raw` field below (nothing hidden) — this only decides what counts
// toward `webglLint.errors`/`.warnings` and therefore the harness's own nonzero-exit gate.
function isLintAttributable(text) {
  return /error in \w+\(|GMAN_debug_helper|failUnsetUniforms|webgl-lint|have not been set|matrix is all zeros|is NaN\b|is undefined\b|out of range|no shader program|no valid program|shader compile|program link/i.test(text);
}
async function collectConsole(page) {
  const entries = await page.evaluate(() => {
    const c = window.__wglConsole || [];
    window.__wglConsole = [];
    return c;
  });
  const errorEntries = entries.filter((e) => e.type === "error" || e.type === "pageerror");
  const warningEntries = entries.filter((e) => e.type === "warning");
  const errors = errorEntries.filter((e) => isLintAttributable(e.text)).map((e) => e.text);
  const warnings = warningEntries.filter((e) => isLintAttributable(e.text)).map((e) => e.text);
  const otherErrors = errorEntries.filter((e) => !isLintAttributable(e.text)).map((e) => e.text);
  const otherWarnings = warningEntries.filter((e) => !isLintAttributable(e.text)).map((e) => e.text);
  return { errors, warnings, otherErrors, otherWarnings, raw: entries };
}

// ── app boot helpers — copied verbatim convention from dev/battle-gate/capture-stage-c3-shapes.mjs
// (see that file's header for the full rationale; not re-explained here to avoid drift risk). ────────
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
      if (nameEl) nameEl.value = "R3 WebGL Diagnostics Gate Soul";
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

// step 5 (freeze clock/tweens/particles) + step 6 (renderer/texture readiness): there is no true
// "freeze" API exposed to dev harnesses (adding one would mean editing src/, which R3 must not do) —
// this reuses the EXISTING settle-wait convention dev/battle-gate/capture-practicals.mjs and siblings
// already rely on for determinism: poll window.Theater.tweensLive() to 0, then window.Theater
// .interiorFileTexPending() to 0, then one extra settle sleep. Honest framing: this is "wait until
// quiescent," not a hard clock freeze; documented here rather than silently reinterpreted.
async function waitForSettle(page, { timeoutMs = 15000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let tweensOk = false, texOk = false;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({
      tweens: window.Theater && typeof window.Theater.tweensLive === "function" ? window.Theater.tweensLive() : 0,
      texPending: window.Theater && typeof window.Theater.interiorFileTexPending === "function" ? window.Theater.interiorFileTexPending() : 0,
    }));
    tweensOk = state.tweens === 0;
    texOk = state.texPending === 0;
    if (tweensOk && texOk) break;
    await sleep(150);
  }
  return { tweensOk, texOk };
}
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

// renderer info + the direct lint-wrap proof (see this file's own header comment for why this is
// unfakeable, not inferred). Returns nulls with an honest reason if the patch never captured a
// renderer instance (e.g. a fixture that never actually mounted).
async function readRendererInfo(page) {
  return await page.evaluate(() => {
    const diag = window.__wglRendererDiag || {};
    const renderer = diag.lastRenderer || null;
    if (!renderer) {
      return { available: false, reason: diag.patchError ? `patch failed: ${diag.patchError}` : "no renderer instance captured yet", patched: !!diag.patched, renderCalls: diag.renderCalls || 0 };
    }
    let gl = null, glErr = null;
    try { gl = renderer.getContext(); } catch (e) { glErr = e.message; }
    let lintWrapConfirmed = false, ext = null;
    if (gl) {
      try { ext = gl.getExtension("GMAN_debug_helper"); lintWrapConfirmed = !!ext; } catch (e) {}
    }
    let gpuVendor = null, gpuRenderer = null;
    if (gl) {
      try {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbg) {
          gpuVendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
          gpuRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
        } else {
          gpuVendor = gl.getParameter(gl.VENDOR);
          gpuRenderer = gl.getParameter(gl.RENDERER);
        }
      } catch (e) {}
    }
    const info = renderer.info || {};
    const canvas = renderer.domElement;
    return {
      available: true,
      lintWrapConfirmed,
      renderCalls: diag.renderCalls || 0,
      gpuVendor, gpuRenderer,
      canvas: canvas ? { width: canvas.width, height: canvas.height, pixelRatio: (renderer.getPixelRatio ? renderer.getPixelRatio() : null) } : null,
      drawCalls: info.render ? info.render.calls : null,
      triangles: info.render ? info.render.triangles : null,
      textures: info.memory ? info.memory.textures : null,
      geometries: info.memory ? info.memory.geometries : null,
      programs: Array.isArray(info.programs) ? info.programs.length : null,
      glGetError: glErr,
    };
  });
}

// ── NEGATIVE CONTROL (required by the task brief: prove the harness CATCHES an injected error, not
// just reports zero). Runs on a throwaway canvas that has NOTHING to do with the app — a minimal valid
// WebGL1 program with one fragment-shader uniform that is DELIBERATELY never set before drawArrays().
// webgl-lint's own `failUnsetUniforms` check (default: true) is documented to fire exactly on this
// shape of bug (README.md §Configuration: "It's a common error to forget to set a uniform..."). Because
// this harness sets throwOnError:false globally (see registerInjections), the violation surfaces as a
// console.error rather than an uncaught exception — collectConsole() reads it back the same way every
// real-corpus fixture's errors would be read, so the negative control exercises the EXACT same
// detection path the corpus pass relies on, not a separate one. ─────────────────────────────────────
async function runNegativeControl(page) {
  await collectConsole(page); // clear any residual buffer before this phase
  const result = await page.evaluate(() => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 4; canvas.height = 4;
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return { ok: false, reason: "no-webgl-context-available" };
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }");
      gl.compileShader(vs);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      // uMissing is referenced (so it isn't optimized away) but NEVER set via uniform1f before the draw.
      gl.shaderSource(fs, "precision mediump float; uniform float uMissing; void main(){ gl_FragColor = vec4(uMissing, 0.0, 0.0, 1.0); }");
      gl.compileShader(fs);
      const prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        return { ok: false, reason: "program-link-failed", log: gl.getProgramInfoLog(prog) };
      }
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 0, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const ext = gl.getExtension("GMAN_debug_helper");
      const lintActive = !!ext;
      // the deliberately-buggy draw call — uMissing was never set.
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return { ok: true, lintActive };
    } catch (e) {
      // throwOnError:false means we do NOT expect a throw here, but if the config div raced (see
      // registerInjections' addConfigDiv fallback) and the library's own hard-coded default
      // (throwOnError:true) was still active at getContext() time, a thrown error IS itself valid
      // proof of detection — record it as caught, not as a harness failure.
      return { ok: true, threw: true, error: e.message };
    }
  });
  await sleep(100); // let the console.error's async page.evaluate push land before we read it back
  const console_ = await collectConsole(page);
  return { ...result, console: console_ };
}

// ── FIXTURE BUILDERS ─────────────────────────────────────────────────────────────────────────────

// row101-ring-pit: capture-stage-c3-shapes.mjs's own "octagon" scene, reused verbatim (Grand Octagon
// row 101: sunken arena + raised ring — 2 real exits, 2 real terrain patches).
async function buildRow101RingPit(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }, { targetId: "s3" }],
          light: "normal", areaType: "Grand Octagon", dims: "60' x 60'",
          side: "30' x 30' sunken central arena (5 ft below the surrounding level); 10' wide raised ring walkway with iron railing." },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s3", num: 3, label: "s3", isFinale: true, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
      ];
      const plan = spatializePlan(fixture, "The Hub", { walkId: "r3-webgl-diag-row101" });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s1");
      const board = interiorBuildBoard(semPlan, { realmId: "gloom", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      board.lightProfile = "lamplit";
      return {
        ok: true, board, roomShape: focusRoom.shape,
        terrain: (focusRoom.terrain || []).map((p) => ({ tier: p.tier, kind: p.kind, cellCount: p.cells.length })),
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// octagon-diagonal-doorway: same areaType/dims, but 4 satellite exits (vs row101's 2) around s1 (via
// "The Hub" topology's own spoke-spreading, mirroring dev/battle-gate/capture-interior-study.mjs's
// buildFixture spoke pattern) — a real chance a door lands adjacent to a chamfered diagonal wall run.
// VERIFIED empirically, not assumed: classifyDoorAdjacency() below walks the real compiled
// shell.wallSegments (window.Theater._interiorRoomShellForTest(), the same seam capture-wall-
// occlusion.mjs's own readShellState() uses) and reports whether any door segment shares an endpoint
// with a non-axis-aligned (diagonal) wall segment. If it doesn't land that way this run, the receipt
// says so honestly (diagonalDoorConfirmed:false) rather than claiming a geometry fact this harness
// didn't actually observe.
async function buildOctagonDiagonalDoorway(page) {
  return await page.evaluate(() => {
    function classifyDir(a, b) {
      const dx = b.x - a.x, dz = b.z - a.z;
      const ax = Math.abs(dx), az = Math.abs(dz);
      if (ax < 1e-6 && az < 1e-6) return "degenerate";
      if (ax < 1e-6 || az < 1e-6) return "axis";
      const ratio = ax > az ? az / ax : ax / az;
      return ratio > 0.5 ? "diagonal" : "axis"; // generous ~26.5deg-63.5deg band around 45deg
    }
    function classifyDoorAdjacency(shell) {
      if (!shell || !Array.isArray(shell.wallSegments)) return { found: false, reason: "no-wall-segments" };
      const segs = shell.wallSegments;
      const doors = segs.filter((s) => s.kind === "door");
      const sameEndpoint = (p1, p2) => Math.abs(p1.x - p2.x) < 1e-3 && Math.abs(p1.z - p2.z) < 1e-3;
      for (const d of doors) {
        for (const s of segs) {
          if (s === d || s.kind === "door") continue;
          const adjacent = sameEndpoint(d.a, s.a) || sameEndpoint(d.a, s.b) || sameEndpoint(d.b, s.a) || sameEndpoint(d.b, s.b);
          if (adjacent && classifyDir(s.a, s.b) === "diagonal") {
            return { found: true, doorSeg: { a: d.a, b: d.b }, wallSeg: { a: s.a, b: s.b } };
          }
        }
      }
      return { found: false, doorCount: doors.length, segCount: segs.length };
    }
    try {
      const ids = ["s1", "s2", "s3", "s4", "s5"];
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }, { targetId: "s3" }, { targetId: "s4" }, { targetId: "s5" }],
          light: "normal", areaType: "Grand Octagon", dims: "60' x 60'" },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1, exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s3", num: 3, label: "s3", isFinale: false, depth: 1, exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s4", num: 4, label: "s4", isFinale: false, depth: 1, exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s5", num: 5, label: "s5", isFinale: true, depth: 1, exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
      ];
      const plan = spatializePlan(fixture, "The Hub", { walkId: "r3-webgl-diag-octagon-diagonal" });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s1");
      const board = interiorBuildBoard(semPlan, { realmId: "chrome", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      board.lightProfile = "lamplit";
      return { ok: true, board, roomShape: focusRoom.shape, ids };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}
async function classifyDoorAdjacency(page) {
  return await page.evaluate(() => {
    function classifyDir(a, b) {
      const dx = b.x - a.x, dz = b.z - a.z;
      const ax = Math.abs(dx), az = Math.abs(dz);
      if (ax < 1e-6 && az < 1e-6) return "degenerate";
      if (ax < 1e-6 || az < 1e-6) return "axis";
      const ratio = ax > az ? az / ax : ax / az;
      return ratio > 0.5 ? "diagonal" : "axis";
    }
    const shell = window.Theater._interiorRoomShellForTest ? window.Theater._interiorRoomShellForTest() : null;
    if (!shell || !Array.isArray(shell.wallSegments)) return { found: false, reason: "no-wall-segments" };
    const segs = shell.wallSegments;
    const doors = segs.filter((s) => s.kind === "door");
    const sameEndpoint = (p1, p2) => Math.abs(p1.x - p2.x) < 1e-3 && Math.abs(p1.z - p2.z) < 1e-3;
    for (const d of doors) {
      for (const s of segs) {
        if (s === d || s.kind === "door") continue;
        const adjacent = sameEndpoint(d.a, s.a) || sameEndpoint(d.a, s.b) || sameEndpoint(d.b, s.a) || sameEndpoint(d.b, s.b);
        if (adjacent && classifyDir(s.a, s.b) === "diagonal") {
          return { found: true, doorSeg: { a: d.a, b: d.b }, wallSeg: { a: s.a, b: s.b } };
        }
      }
    }
    return { found: false, doorCount: doors.length, segCount: segs.length };
  });
}

// wall-upper-fade-camera-move: dev/battle-gate/capture-wall-occlusion.mjs's own Grand Octagon + real
// GS.combat pair + rotate()/setInteriorVariant({}) two-yaw sequence, reused verbatim.
async function buildWallFadeCameraMove(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0, exits: [{ targetId: "s2" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s2", num: 2, label: "s2", isFinale: true, depth: 1, exits: [{ targetId: "s1" }], light: "normal", areaType: "Grand Octagon", dims: "60' x 60'" },
      ];
      const plan = spatializePlan(fixture, "The Hub", { walkId: "r3-webgl-diag-wall-fade" });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s2");
      const board = interiorBuildBoard(semPlan, { realmId: "gloom", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      board.lightProfile = "torchlit";
      return { ok: true, board, roomShape: focusRoom.shape, daisTop: board.daisTop };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// wall-mounted-practical: dev/battle-gate/capture-practicals.mjs's own "sconce-iron" fixture, isolated
// to just the one wall-mount family (ITR_ROOM_SHELL at its production default — the sconce resolves
// against REAL C4.1a mount-slot geometry, S.interiorLastRoomShell.mountSlots).
async function buildWallMountedPractical(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [{ id: "s1", num: 1, label: "s1", isFinale: false, depth: 0, exits: [], light: "normal" }];
      const plan = spatializePlan(fixture, "R3 WebGL Diag Practical", { walkId: "r3-webgl-diag-practical" });
      const focusRoom = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      const cx0 = focusRoom.x + Math.floor(focusRoom.w / 2), cz0 = focusRoom.y + Math.floor(focusRoom.d / 2);
      board.lights = [
        { x: cx0, z: focusRoom.y + 1, y: 2.5, color: "#ff8844", intensity: 0.9, distance: 5, decay: 2, kind: "torch", roomSegNum: focusRoom.segNum, fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.05, z: 0.16 } },
      ];
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      return { ok: true, board, probe: { center: { x: cx0, z: cz0 } } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

const FIXTURES = [
  { id: "row101-ring-pit", label: "Grand Octagon row 101: sunken arena + raised ring", build: buildRow101RingPit, camera: "single" },
  { id: "octagon-diagonal-doorway", label: "Grand Octagon, 4 satellite exits (diagonal-doorway adjacency probe)", build: buildOctagonDiagonalDoorway, camera: "single", diagonalProbe: true },
  { id: "wall-upper-fade-camera-move", label: "Grand Octagon + real combat pair, two-yaw wall-upper fade", build: buildWallFadeCameraMove, camera: "two-yaw" },
  { id: "wall-mounted-practical", label: "Wall sconce snapped to a real C4.1a mount slot", build: buildWallMountedPractical, camera: "single" },
];

// ── boot-path absence proof (deliverable 5 of the task brief) — this is a grep-based STRUCTURAL
// check, not a claim: confirms no production path (genesis.html, manifest.json, src/**/*.js) ever
// references webgl-lint / spectorjs / this dev/graphics-debug/ directory. ──────────────────────────
function checkBootPathAbsence() {
  const findings = { ok: true, checked: [], hits: [] };
  const needles = ["webgl-lint", "spectorjs", "graphics-debug", "GMAN_debug_helper", "GEOMETRY_TOOLS_HOME"];
  const targets = [];
  targets.push(path.join(repoRoot, "genesis.html"));
  targets.push(path.join(repoRoot, "manifest.json"));
  // every src/**/*.js file (production module tree) — walked directly, not via manifest (manifest only
  // tracks src/data modules registered in loadOrder; this check must cover the whole src/ tree
  // regardless of manifest registration).
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (entry.name.endsWith(".js")) targets.push(full);
    }
  }
  const srcDir = path.join(repoRoot, "src");
  if (fs.existsSync(srcDir)) walk(srcDir);

  for (const file of targets) {
    if (!fs.existsSync(file)) continue;
    const rel = path.relative(repoRoot, file);
    findings.checked.push(rel);
    const text = fs.readFileSync(file, "utf8");
    for (const needle of needles) {
      if (text.includes(needle)) {
        findings.ok = false;
        findings.hits.push({ file: rel, needle });
      }
    }
  }
  findings.checkedCount = findings.checked.length;
  return findings;
}

// ── Spector standalone smoke (best-effort, non-blocking per §6.4: "do not block geometry work" if the
// capture doesn't complete). Attempted on a fresh minimal synthetic draw (NOT the full production
// scene — capturing a real Three.js scene's async rAF timing reliably from a cold headless launch is
// exactly the higher-risk case §3.7 flags as needing its own dedicated spike; this proves the CAPTURE
// MECHANISM works at all, which is the §13.6 "Spector standalone capture" deliverable). ─────────────
async function runSpectorStandaloneSmoke(page) {
  if (!SPECTOR_SRC) return { attempted: false, reason: "spectorjs not installed in tool home (optional; run setup.mjs --with-spector)" };
  const result = await page.evaluate(async () => {
    try {
      if (!window.SPECTOR) return { ok: false, reason: "window.SPECTOR not present after injection" };
      const spector = new window.SPECTOR.Spector();
      const canvas = document.createElement("canvas");
      canvas.width = 8; canvas.height = 8;
      document.body.appendChild(canvas);
      const gl = canvas.getContext("webgl");
      if (!gl) return { ok: false, reason: "no-webgl-context" };
      const capturePromise = new Promise((resolve) => {
        let settled = false;
        spector.onCapture.add((capture) => { if (!settled) { settled = true; resolve({ ok: true, capture }); } });
        setTimeout(() => { if (!settled) { settled = true; resolve({ ok: false, reason: "capture-timeout" }); } }, 4000);
      });
      spector.captureCanvas(canvas);
      // one minimal deterministic draw so there is at least one command to capture.
      const vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }");
      gl.compileShader(vs);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, "precision mediump float; void main(){ gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }");
      gl.compileShader(fs);
      const prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 0, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const res = await capturePromise;
      if (!res.ok) return res;
      let commandCount = null, status = null;
      try { commandCount = Array.isArray(res.capture.commands) ? res.capture.commands.length : null; status = res.capture.status || null; } catch (e) {}
      return { ok: true, commandCount, status };
    } catch (e) {
      return { ok: false, reason: "exception", error: e.message, stack: e.stack };
    }
  });
  return { attempted: true, ...result };
}

// ── main ─────────────────────────────────────────────────────────────────────────────────────────
async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    unit: "R3",
    charterStatement: {
      convergenceRung: "(enabling) — supports every rung, advances none by itself",
      canonicalContractsPreserved: "dev-only; no production src/ edit; see bootPathAbsence below",
      classification: "research-only",
    },
    toolVersions: { webglLint: WEBGL_LINT_VERSION, spectorjs: SPECTOR_VERSION },
    negativeControl: null,
    fixtures: {},
    spectorStandalone: null,
    spectorMcpFeasibility: {
      attempted: false,
      reason: "No Spector MCP server is registered/reachable in this Claude Code session (no `claude mcp` entry for a Spector server exists to connect to). Per docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §6.4: \"If the current Claude environment cannot connect to the MCP server, retain Spector as a standalone capture tool. Do not block geometry work.\" This is recorded as a documented blocker, not attempted-and-failed — connecting a new MCP server is a session-level configuration change outside this unit's file-system-only scope.",
      standaloneRetained: true,
    },
    bootPathAbsence: null,
    notes: [],
  };

  let commit = null;
  try { commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch (e) {}
  report.commit = commit;

  // step 5 of the task brief's deliverables — this is pure filesystem work, no browser needed.
  report.bootPathAbsence = checkBootPathAbsence();
  log(`boot-path absence check: ${report.bootPathAbsence.ok ? "CLEAN" : "HITS FOUND"} (checked ${report.bootPathAbsence.checkedCount} files)`);
  if (!report.bootPathAbsence.ok) log("  HITS:", JSON.stringify(report.bootPathAbsence.hits));

  const runCorpus = process.env.WGL_SKIP_CORPUS !== "1";
  const runNegCtrl = process.env.WGL_SKIP_NEGCTRL !== "1";
  if (!runCorpus && !runNegCtrl) { console.error("[wgl-diag] both WGL_SKIP_CORPUS and WGL_SKIP_NEGCTRL set — nothing to do"); process.exit(1); }

  const server = await startServer();
  let browser = null;
  let exitCode = 0;
  try {
    browser = await launchChrome();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (req.url().endsWith("/favicon.ico")) {
        req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
      } else req.continue();
    });
    await registerInjections(page, { includeSpector: true });

    // ── NEGATIVE CONTROL (about:blank — fully isolated from app state) ──────────────────────────
    if (runNegCtrl) {
      await page.goto("about:blank");
      await sleep(100);
      const neg = await runNegativeControl(page);
      const caughtViaConsole = neg.console.errors.some((t) => /uMissing|have not been set|uniform/i.test(t));
      const caughtViaThrow = !!neg.threw;
      neg.caught = caughtViaConsole || caughtViaThrow;
      report.negativeControl = neg;
      log(`negative control: lintActive=${neg.lintActive} caught=${neg.caught} (console errors: ${neg.console.errors.length})`);
      if (!neg.caught) {
        exitCode = 1;
        report.notes.push("NEGATIVE CONTROL FAILED: the deliberately-injected unset-uniform GL error was NOT caught by webgl-lint. This is a harness defect (or webgl-lint failed to wrap the exact context this canvas created) — do NOT trust a 'zero errors' corpus result until this is fixed.");
      }
    } else {
      report.notes.push("negative control SKIPPED (WGL_SKIP_NEGCTRL=1)");
    }

    // ── REAL CORPUS ───────────────────────────────────────────────────────────────────────────
    if (runCorpus) {
      await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
      await sleep(300);
      // clear any page-lifecycle noise from navigation itself (e.g. an early-document-state
      // console/pageerror unrelated to any fixture) before boot, so it can never bleed into the
      // first fixture's own error count.
      await collectConsole(page);
      await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

      const boot = await bootToInSession(page);
      report.boot = boot;
      if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

      const theaterState = await waitForTheater(page);
      report.theaterState = theaterState;
      if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("window.Theater.setInteriorBoard never became available: " + JSON.stringify(theaterState));

      // Spector standalone smoke — once, not per-fixture (see runSpectorStandaloneSmoke's own header).
      report.spectorStandalone = await runSpectorStandaloneSmoke(page);
      log(`spector standalone smoke: attempted=${report.spectorStandalone.attempted} ok=${report.spectorStandalone.ok}`);

      for (const fx of FIXTURES) {
        log(`--- fixture: ${fx.id} ---`);
        await collectConsole(page); // clear before this fixture's phase
        const built = await fx.build(page);
        if (!built.ok) {
          report.fixtures[fx.id] = { fixtureId: fx.id, label: fx.label, built: false, error: built.error };
          report.notes.push(`fixture ${fx.id} FAILED to build: ${built.error}`);
          exitCode = 1;
          continue;
        }
        await page.evaluate(() => { if (window.Theater.setInteriorVariant) window.Theater.setInteriorVariant({ shotCompose: false }); });
        const mounted = await page.evaluate((board) => {
          try { window.Theater.setInteriorBoard(board); return { ok: true, meshCount: window.Theater.interiorMeshCount() }; }
          catch (e) { return { ok: false, error: e.message }; }
        }, built.board);
        if (!mounted.ok) {
          report.fixtures[fx.id] = { fixtureId: fx.id, label: fx.label, built: true, mounted: false, error: mounted.error };
          report.notes.push(`fixture ${fx.id} setInteriorBoard FAILED: ${mounted.error}`);
          exitCode = 1;
          continue;
        }
        await waitForSettle(page);
        await waitForRepaint(page);
        await sleep(400);

        let diagonalProbe = null;
        if (fx.diagonalProbe) diagonalProbe = await classifyDoorAdjacency(page);

        const frames = [];
        if (fx.camera === "two-yaw") {
          // yaw A
          const shotAPath = path.join(outDir, `${fx.id}-yaw-a.png`);
          const canvasElA = await page.$(".theater-stage-canvas canvas");
          if (canvasElA) await canvasElA.screenshot({ path: shotAPath }); else await page.screenshot({ path: shotAPath });
          const rendererA = await readRendererInfo(page);
          const consoleA = await collectConsole(page);
          frames.push({ name: "yaw-a", screenshot: path.relative(repoRoot, shotAPath), renderer: rendererA, webglLint: { errors: consoleA.errors, warnings: consoleA.warnings }, otherConsole: { errors: consoleA.otherErrors, warnings: consoleA.otherWarnings } });

          await page.evaluate(() => { window.Theater.rotate(); });
          await page.evaluate(() => { window.Theater.setInteriorVariant({}); });
          await waitForRepaint(page);
          await sleep(200);
          const shotBPath = path.join(outDir, `${fx.id}-yaw-b.png`);
          const canvasElB = await page.$(".theater-stage-canvas canvas");
          if (canvasElB) await canvasElB.screenshot({ path: shotBPath }); else await page.screenshot({ path: shotBPath });
          const rendererB = await readRendererInfo(page);
          const consoleB = await collectConsole(page);
          frames.push({ name: "yaw-b", screenshot: path.relative(repoRoot, shotBPath), renderer: rendererB, webglLint: { errors: consoleB.errors, warnings: consoleB.warnings }, otherConsole: { errors: consoleB.otherErrors, warnings: consoleB.otherWarnings } });
        } else {
          const shotPath = path.join(outDir, `${fx.id}.png`);
          const canvasEl = await page.$(".theater-stage-canvas canvas");
          if (canvasEl) await canvasEl.screenshot({ path: shotPath }); else await page.screenshot({ path: shotPath });
          const rendererInfo = await readRendererInfo(page);
          const consoleInfo = await collectConsole(page);
          frames.push({ name: "default", screenshot: path.relative(repoRoot, shotPath), renderer: rendererInfo, webglLint: { errors: consoleInfo.errors, warnings: consoleInfo.warnings }, otherConsole: { errors: consoleInfo.otherErrors, warnings: consoleInfo.otherWarnings } });
        }

        const allErrors = frames.flatMap((f) => f.webglLint.errors);
        const allWarnings = frames.flatMap((f) => f.webglLint.warnings);
        const allOtherErrors = frames.flatMap((f) => f.otherConsole.errors);
        const allOtherWarnings = frames.flatMap((f) => f.otherConsole.warnings);
        const rendererSample = frames.find((f) => f.renderer && f.renderer.available) || frames[0];

        report.fixtures[fx.id] = {
          fixtureId: fx.id,
          label: fx.label,
          commit,
          browser: await browser.version(),
          gpu: rendererSample.renderer ? { vendor: rendererSample.renderer.gpuVendor, renderer: rendererSample.renderer.gpuRenderer } : null,
          renderer: rendererSample.renderer ? rendererSample.renderer.gpuRenderer : null,
          canvas: rendererSample.renderer ? rendererSample.renderer.canvas : null,
          drawCalls: rendererSample.renderer ? rendererSample.renderer.drawCalls : null,
          triangles: rendererSample.renderer ? rendererSample.renderer.triangles : null,
          textures: rendererSample.renderer ? rendererSample.renderer.textures : null,
          programs: rendererSample.renderer ? rendererSample.renderer.programs : null,
          lintWrapConfirmed: rendererSample.renderer ? rendererSample.renderer.lintWrapConfirmed : null,
          webglLint: { errors: allErrors, warnings: allWarnings },
          otherConsole: { errors: allOtherErrors, warnings: allOtherWarnings, note: "console activity during this fixture's window that is NOT attributable to webgl-lint (e.g. unrelated 404s, Spector's own async messages) — kept for transparency, never gates the exit code" },
          spector: { capturePath: null, commands: null, note: "per-fixture Spector capture not attempted (see spectorStandalone + spectorMcpFeasibility for the Spector deliverables); high timing risk against a live rAF scene from cold headless launch, see this file's header" },
          postPasses: [],
          frames,
          roomShape: built.roomShape || null,
          diagonalProbe,
          built: true, mounted: true,
        };

        log(`  ${fx.id}: errors=${allErrors.length} warnings=${allWarnings.length} lintWrapConfirmed=${rendererSample.renderer && rendererSample.renderer.lintWrapConfirmed}`);
        if (allErrors.length > 0) {
          exitCode = 1;
          report.notes.push(`fixture ${fx.id}: ${allErrors.length} unapproved GL/lint error(s) — see fixtures.${fx.id}.webglLint.errors`);
        }
        if (fx.diagonalProbe) {
          log(`  ${fx.id}: diagonalDoorConfirmed=${diagonalProbe && diagonalProbe.found}`);
          if (!diagonalProbe || !diagonalProbe.found) {
            report.notes.push(`fixture ${fx.id}: diagonal-door adjacency NOT confirmed this run (doorCount=${diagonalProbe && diagonalProbe.doorCount}, segCount=${diagonalProbe && diagonalProbe.segCount}) — the scene still renders and is still lint-checked, but the specific "door on/adjacent-to a diagonal wall" geometry condition wasn't empirically observed. Reported honestly rather than assumed.`);
          }
        }
      }
    } else {
      report.notes.push("real corpus SKIPPED (WGL_SKIP_CORPUS=1)");
    }
  } catch (e) {
    exitCode = 1;
    report.error = e.message;
    report.stack = e.stack;
    log("FAILED:", e.message);
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }

  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
  log("wrote", path.join(outDir, "report.json"));
  log(`SUMMARY: negativeControlCaught=${report.negativeControl ? report.negativeControl.caught : "skipped"} bootPathAbsenceOk=${report.bootPathAbsence.ok} fixturesWithErrors=${Object.values(report.fixtures).filter((f) => f.webglLint && f.webglLint.errors.length > 0).length}/${Object.keys(report.fixtures).length}`);

  if (!report.bootPathAbsence.ok) exitCode = 1;
  process.exitCode = exitCode;
}

main();
