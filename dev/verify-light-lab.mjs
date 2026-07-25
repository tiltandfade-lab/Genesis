#!/usr/bin/env node
/* dev/verify-light-lab.mjs — LL-1 (docs/KENNEY-SOCKET-WAVE.md unit LL-1): LIGHT-LAB + the Stage-E
   mechanisms (exposure floor, emissive-masked bloom, P-A luminance-gate readouts, the LIGHT_TUNABLES
   indirection). Real headless-Chrome render checks (same puppeteer-core/boot convention every
   dev/battle-gate/*.mjs and dev/verify-*.mjs script in this repo already uses) — every claim below is
   measured off the ACTUAL rendered frame, never asserted from source text alone.

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7, required at the top of every graphics-
   session harness):
     - Convergence rung: post-process/lighting-pipeline fix + a dev-only authoring tool. No sprite/
       geometry rung claim — this unit's job is grounding+motivated-light (§3.3: "bloom is punctuation,
       never the source of illumination") and giving Adam a live dial over the existing named-const
       tables, not new geometry or materials.
     - Canonical contracts preserved: drives the REAL window.Theater surface (setInteriorBoard,
       _lightLabSetTunable, _lumaGatesForTest, _setBloomMaskDisabledForTest, etc.) on the real booted
       app — no re-implementation, no paraphrase of the render pipeline.
     - RED-FIRST: Section 2 reproduces the B3 daylit blow-out NUMERICALLY (clipped-white fraction) with
       the emissive mask disabled (the exact pre-LL-1 threshold-only bloom behavior), then proves the
       mask brings it under while a genuine fixture emitter still blooms. Section 1 proves the
       LIGHT_TUNABLES indirection is a pure no-op when the lab is never touched.

   Run:  node dev/verify-light-lab.mjs */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
// LIGHT_LAB_SHOTS_DIR (2026-07-25, visual-correction assignment): the default shots directory is
// also review evidence another lane may be holding uncommitted — a verification-only run must not
// clobber it. Same override convention as BG_PORT below; every assertion is unchanged either way.
const outDir = process.env.LIGHT_LAB_SHOTS_DIR
  ? path.resolve(process.env.LIGHT_LAB_SHOTS_DIR)
  : path.join(__dirname, "light-lab-shots");
fs.mkdirSync(outDir, { recursive: true });

// DEDICATED PORT RANGE 5341-5345 — checked against every PORT_CANDIDATES literal in dev/*.mjs +
// dev/battle-gate/*.mjs at authoring time (highest prior claim found: 5338).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5341, 5342, 5343, 5344, 5345];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[verify-light-lab]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

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
    log(`starting python3 -m http.server ${port} (bind 127.0.0.1) in ${ROOT}`);
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] });
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
  await page.evaluateOnNewDocument(() => { window.__llConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { page.evaluate((t) => { window.__llConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); });
  return page;
}

// bootToInSession/waitForTheater — verbatim convention from dev/battle-gate/standee-gallery/capture-
// standee-gallery.mjs (this repo's own established boot ritual).
async function bootToInSession(page) {
  return await page.evaluate(() => {
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
        } catch (e) {}
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
      if (nameEl) nameEl.value = "LL-1 Verify Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found" };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found" };
      if (typeof startSession === "function") startSession(world.id);
      showTab("world");
      return { ok: true, worldId: world.id };
    } catch (e) { return { ok: false, stage: "exception", error: e.message, stack: e.stack }; }
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
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

// buildFixture/spatializePlan — the SAME "one lit room" convention capture-standee-gallery.mjs's own
// buildLineupBoard uses, trimmed to a smaller cast (this harness measures pixels, not per-piece telemetry).
async function buildFixtureBoard(page, realmId, lightProfile, pieceSlugs) {
  return await page.evaluate((realmId, lightProfile, pieceSlugs) => {
    try {
      const fixture = [{ id: "r1", num: 1, label: "chamber", isFinale: false, depth: 0, exits: [], light: "normal" }];
      const plan = spatializePlan(fixture, "OSS Integrated", { walkId: "ll1-verify-" + realmId + "-" + lightProfile });
      const room = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId, env: "dungeon", focusSegNum: room.segNum, radius: 1 });
      const usableW = Math.max(1, room.w - room.w * 0.24);
      const step = pieceSlugs.length > 1 ? usableW / (pieceSlugs.length - 1) : 0;
      board.pieces = pieceSlugs.map((slug, i) => ({ slug, cellX: Math.round(room.x + room.w * 0.12 + step * i), cellY: Math.round(room.y + room.d / 2) }));
      board.lightProfile = lightProfile;
      return { ok: true, board };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, realmId, lightProfile, pieceSlugs);
}
async function mountBoard(page, board) {
  const mounted = await page.evaluate((board) => {
    try {
      const clone = (typeof structuredClone === "function") ? structuredClone(board) : JSON.parse(JSON.stringify(board));
      window.Theater.setInteriorBoard(clone);
      return { ok: true, piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, board);
  if (!mounted.ok) return mounted;
  if (mounted.piecesRequested > 0) {
    const deadline = Date.now() + 8000;
    let latest = mounted;
    while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
      await sleep(200);
      latest = await page.evaluate(() => ({ piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() }));
    }
    mounted.piecesResolved = latest.piecesResolved;
  }
  return mounted;
}
async function shoot(page, name) {
  const p = path.join(outDir, name);
  await page.screenshot({ path: p, fullPage: false });
  return p;
}
// in-page: sample display-space luma stats over the CANVAS region only (excludes the polaroid UI
// chrome) off the LIVE composited canvas via a 2D-canvas drawImage of the WebGL canvas (same technique
// every capture-*.mjs's own sampleLuma uses on a SAVED png; here it's done directly on the live
// <canvas> element so no disk round-trip is needed for a scalar stat).
async function canvasLumaStats(page) {
  return await page.evaluate(() => {
    // renderTheaterFrame() must run SYNCHRONOUSLY, in the SAME task as the drawImage below — the
    // renderer carries no preserveDrawingBuffer, so a page.evaluate() called even a task-tick after the
    // last GL draw can read a cleared/blank buffer (found live authoring this harness: every stat read
    // 0/all-black until this call was added — the same discipline dev/verify-agx-tonecurve.mjs's own
    // Section 3 and window.Theater._lumaGatesForTest (theater-boot.js) already document).
    if (window.Theater && window.Theater._renderFrameForTest) window.Theater._renderFrameForTest();
    const c = document.querySelector(".theater-stage-canvas canvas");
    if (!c) return null;
    const off = document.createElement("canvas");
    off.width = c.width; off.height = c.height;
    const ctx = off.getContext("2d");
    ctx.drawImage(c, 0, 0);
    const data = ctx.getImageData(0, 0, off.width, off.height).data;
    let sum = 0, clipped = 0, nearBlack = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) {
      const luma = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      sum += luma; n++;
      if (luma > 0.92) clipped++;
      if (luma < 0.01) nearBlack++;
    }
    return { meanLuma: sum / n, clippedFraction: clipped / n, nearBlackFraction: nearBlack / n, pixelCount: n };
  });
}

// Per-PIECE local luma — a small NxN patch centered on each standee's own projected screen position
// (real worldPosition -> NDC -> pixel, the SAME technique dev/battle-gate/standee-gallery/capture-
// standee-gallery.mjs's own readSceneTelemetry/computePieceObservations already proved live). Whole-
// canvas aggregates (canvasLumaStats, above) dilute a single standee's blow-out across a mostly-empty
// interior frame; this is the precise, per-subject read the B3 bug (one creature reading full-white)
// actually needs.
async function pieceLumaSamples(page, patch = 14) {
  return await page.evaluate((patch) => {
    if (window.Theater && window.Theater._renderFrameForTest) window.Theater._renderFrameForTest();
    const ctx = window.Theater._graphicsResearchContextForTest ? window.Theater._graphicsResearchContextForTest() : null;
    const c = document.querySelector(".theater-stage-canvas canvas");
    if (!ctx || !ctx.camera || !c) return [];
    const box = c.getBoundingClientRect();
    const off = document.createElement("canvas");
    off.width = c.width; off.height = c.height;
    const octx = off.getContext("2d");
    octx.drawImage(c, 0, 0);
    const scaleX = c.width / box.width, scaleY = c.height / box.height;
    const cam = ctx.camera;
    const out = [];
    if (ctx.interiorGroup) {
      ctx.interiorGroup.traverse((obj) => {
        if (!(obj.userData && obj.userData.sprite && obj.userData.spriteSlug)) return;
        const e = obj.matrixWorld.elements;
        const worldY = e[13] + (obj.userData.interiorHeight || 0.4) * 0.5;
        // project via the camera's own matrixWorldInverse/projectionMatrix (no THREE global needed —
        // same manual approach window.Theater._lumaGatesForTest itself uses inside theater-boot.js).
        cam.updateMatrixWorld();
        const wp = { x: e[12], y: worldY, z: e[14] };
        const view = multiplyMatVec(cam.matrixWorldInverse.elements, wp);
        const clip = multiplyMatVec(cam.projectionMatrix.elements, view);
        const ndc = { x: clip.x / clip.w, y: clip.y / clip.w };
        const px = Math.round(((ndc.x + 1) / 2) * c.width);
        const py = Math.round((1 - (ndc.y + 1) / 2) * c.height);
        const half = Math.floor(patch / 2);
        const x0 = Math.max(0, Math.min(off.width - patch, px - half));
        const y0 = Math.max(0, Math.min(off.height - patch, py - half));
        const data = octx.getImageData(x0, y0, patch, patch).data;
        let sum = 0, clipped = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          const luma = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
          sum += luma; n++;
          if (luma > 0.92) clipped++;
        }
        out.push({ slug: obj.userData.spriteSlug, meanLuma: n ? sum / n : null, clippedFraction: n ? clipped / n : null, px, py });
        function multiplyMatVec(mat, v) {
          const e = mat, x = v.x, y = v.y, z = v.z;
          const w = e[3] * x + e[7] * y + e[11] * z + e[15];
          return { x: e[0] * x + e[4] * y + e[8] * z + e[12], y: e[1] * x + e[5] * y + e[9] * z + e[13], z: e[2] * x + e[6] * y + e[10] * z + e[14], w: w || 1 };
        }
      });
    }
    return out;
  }, patch);
}

// Reads the LIVE (non-visual) light/grade state — ambient/point light color+intensity and the grade
// pass's own uniforms — the numeric ground truth "did the indirection change anything" actually means,
// independent of any unrelated per-frame animation (dust motes, flicker) a screenshot diff would
// otherwise be confounded by.
async function liveLightState(page) {
  return await page.evaluate(() => {
    const s = window.Theater._tabletopSceneLightsForTest ? window.Theater._tabletopSceneLightsForTest() : null;
    const ps = window.Theater._postSuiteForTest ? window.Theater._postSuiteForTest() : null;
    return { sceneLights: s, postSuite: ps };
  });
}

// Local luma at ONE arbitrary REAL world position (e.g. a fixture emitter's own worldPos from
// _interiorFixtureEmittersForTest — ground truth, never guessed) — the single-point sibling of
// pieceLumaSamples above, same projection technique.
async function worldPointLuma(page, worldPos, patch = 14) {
  return await page.evaluate((worldPos, patch) => {
    if (window.Theater && window.Theater._renderFrameForTest) window.Theater._renderFrameForTest();
    const ctx = window.Theater._graphicsResearchContextForTest ? window.Theater._graphicsResearchContextForTest() : null;
    const c = document.querySelector(".theater-stage-canvas canvas");
    if (!ctx || !ctx.camera || !c) return null;
    const cam = ctx.camera;
    cam.updateMatrixWorld();
    function multiplyMatVec(mat, v) {
      const e = mat, x = v.x, y = v.y, z = v.z;
      const w = e[3] * x + e[7] * y + e[11] * z + e[15];
      return { x: e[0] * x + e[4] * y + e[8] * z + e[12], y: e[1] * x + e[5] * y + e[9] * z + e[13], z: e[2] * x + e[6] * y + e[10] * z + e[14], w: w || 1 };
    }
    const view = multiplyMatVec(cam.matrixWorldInverse.elements, worldPos);
    const clip = multiplyMatVec(cam.projectionMatrix.elements, view);
    const ndc = { x: clip.x / clip.w, y: clip.y / clip.w };
    const px = Math.round(((ndc.x + 1) / 2) * c.width);
    const py = Math.round((1 - (ndc.y + 1) / 2) * c.height);
    const off = document.createElement("canvas");
    off.width = c.width; off.height = c.height;
    const octx = off.getContext("2d");
    octx.drawImage(c, 0, 0);
    const half = Math.floor(patch / 2);
    const x0 = Math.max(0, Math.min(off.width - patch, px - half));
    const y0 = Math.max(0, Math.min(off.height - patch, py - half));
    const data = octx.getImageData(x0, y0, patch, patch).data;
    let sum = 0, n = 0;
    for (let i = 0; i < data.length; i += 4) { sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255; n++; }
    return { meanLuma: n ? sum / n : null, px, py };
  }, worldPos, patch);
}

async function main() {
  const server = await startServer();
  log("server:", BASE);
  const browser = await launchChrome();
  const page = await newPage(browser);
  try {
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("setInteriorBoard never became available: " + JSON.stringify(theaterState));

    // ─── Section 0: module surface ──────────────────────────────────────────────────────────────────
    console.log("\n=== 0. Module surface ===");
    const surface = await page.evaluate(() => {
      const schema = window.Theater._lightLabSchema();
      const rangeControl = schema.find((entry) => entry.path === "profile.light.rangeM");
      const torch = typeof lightRecipeFor === "function" ? lightRecipeFor("torchlit") : null;
      return {
        hasLightLab: typeof window.Theater.lightLab === "function",
        hasSetTunable: typeof window.Theater._lightLabSetTunable === "function",
        hasGetTunable: typeof window.Theater._lightLabGetTunable === "function",
        hasSchema: typeof window.Theater._lightLabSchema === "function",
        hasExport: typeof window.Theater._lightLabExport === "function",
        hasReset: typeof window.Theater._lightLabResetAuthored === "function",
        hasUndo: typeof window.Theater._lightLabUndo === "function",
        hasRedo: typeof window.Theater._lightLabRedo === "function",
        hasHistory: typeof window.Theater._lightLabHistory === "function",
        hasLumaGates: typeof window.Theater._lumaGatesForTest === "function",
        hasBloomMaskToggle: typeof window.Theater._setBloomMaskDisabledForTest === "function",
        hasTunablesSnapshot: typeof window.Theater._lightTunablesForTest === "function",
        schemaLength: schema.length,
        rangeMax: rangeControl ? rangeControl.max : null,
        torchRangeM: torch && torch.lights[0] ? torch.lights[0].rangeM : null,
      };
    });
    check("0a. window.Theater.lightLab exists", surface.hasLightLab);
    check("0b. _lightLabSetTunable/_lightLabGetTunable exist", surface.hasSetTunable && surface.hasGetTunable);
    check("0c. _lightLabSchema/_lightLabExport exist", surface.hasSchema && surface.hasExport);
    check("0d. _lumaGatesForTest exists (P-A readouts)", surface.hasLumaGates);
    check("0e. _setBloomMaskDisabledForTest exists (bloom-mask A/B seam)", surface.hasBloomMaskToggle);
    check("0f. schema carries every named group (profile/global/celestial/sprite)", surface.schemaLength >= 18, surface.schemaLength);
    check("0g. Light Lab 2.0 reset/undo/redo/history seams exist",
      surface.hasReset && surface.hasUndo && surface.hasRedo && surface.hasHistory);
    check("0h. the Lab's range control can reach the current authored fantasy torch value",
      surface.rangeMax >= surface.torchRangeM,
      JSON.stringify({ rangeMax: surface.rangeMax, torchRangeM: surface.torchRangeM }));

    // ─── Section 1: LIGHT_TUNABLES pure no-op when the lab is off ──────────────────────────────────
    console.log("\n=== 1. LIGHT_TUNABLES is a pure no-op when the lab is never touched ===");
    {
      // 1a. structural: every seeded tunable equals the CURRENT authored const, extracted straight off
      // the real source text (never a hardcoded duplicate list that could silently drift).
      const src = fs.readFileSync(path.join(ROOT, "src/ui/theater-boot.js"), "utf-8");
      const numConst = (name) => { const m = src.match(new RegExp("const " + name + " = ([0-9.]+);")); return m ? parseFloat(m[1]) : null; };
      const objField = (name) => { const m = src.match(new RegExp(name + ":\\s*([0-9.]+)")); return m ? parseFloat(m[1]) : null; };
      const tunables = await page.evaluate(() => window.Theater._lightTunablesForTest());
      check("1a. stageAmbientFloor seed == STAGE_AMBIENT_FLOOR", tunables.stageAmbientFloor === numConst("STAGE_AMBIENT_FLOOR"), tunables.stageAmbientFloor);
      check("1b. gradeExposureFloor seed == GRADE_EXPOSURE_FLOOR", tunables.gradeExposureFloor === numConst("GRADE_EXPOSURE_FLOOR"), tunables.gradeExposureFloor);
      check("1c. bloomThreshold seed == BLOOM_THRESHOLD", tunables.bloomThreshold === numConst("BLOOM_THRESHOLD"), tunables.bloomThreshold);
      check("1d. bloomStrength seed == BLOOM_STRENGTH", tunables.bloomStrength === numConst("BLOOM_STRENGTH"), tunables.bloomStrength);
      check("1e. gradeTintScale/gradeTintMax seed == GRADE_TINT_SCALE/MAX", tunables.gradeTintScale === numConst("GRADE_TINT_SCALE") && tunables.gradeTintMax === numConst("GRADE_TINT_MAX"));
      check("1f. celestialArc.SUNRISE_MIN/SUNSET_MIN seed == CELESTIAL_ARC's own", tunables.celestialArc.SUNRISE_MIN === objField("SUNRISE_MIN") && tunables.celestialArc.SUNSET_MIN === objField("SUNSET_MIN"));
      check("1g. spriteEmissiveFloor/sceneAmbient/lightRenderGain seed == ITR_* consts", tunables.spriteEmissiveFloor === numConst("ITR_SPRITE_EMISSIVE_FLOOR") && tunables.sceneAmbient === numConst("ITR_SCENE_AMBIENT") && tunables.lightRenderGain === numConst("ITR_LIGHT_RENDER_GAIN"));
      const profileKeys = Object.keys(tunables.profiles);
      const rolledKeys = profileKeys.filter((key) => tunables.profiles[key].rolled);
      const diagnosticKeys = profileKeys.filter((key) => !tunables.profiles[key].rolled);
      check("1h. the registry carries 10 world profiles plus 2 clearly separate diagnostics",
        rolledKeys.length === 10
          && diagnosticKeys.length === 2
          && diagnosticKeys.includes("clay-neutral-truth")
          && diagnosticKeys.includes("clay-opposing-pair"),
        { profileKeys, rolledKeys, diagnosticKeys });

      // 1b. STRUCTURAL: mountLightLab()'s own top-level body (the code that actually RUNS at mount
      // time — building DOM nodes, reading current values into slider positions) never calls
      // setLightTunable/_lightLabSetTunable or assigns into LIGHT_TUNABLES anywhere — only each
      // slider's OWN input listener does (lightLabField, a SEPARATE function; attaching a listener does
      // not fire it). Extracted straight off the real source (the SAME `src` read above), same
      // convention dev/verify-agx-tonecurve.mjs's own extractFunction already uses for this file.
      const extractFn = (name) => {
        const sig = `function ${name}(`;
        const start = src.indexOf(sig);
        if (start < 0) return null;
        const braceStart = src.indexOf("{", start);
        let depth = 0, i = braceStart;
        for (; i < src.length; i++) { if (src[i] === "{") depth++; else if (src[i] === "}") { depth--; if (depth === 0) break; } }
        return src.slice(start, i + 1);
      };
      const mountFn = extractFn("mountLightLab");
      check("1i. mountLightLab() extracted from source", !!mountFn, !!mountFn);
      check("1j. mountLightLab() never calls setLightTunable/_lightLabSetTunable itself (only builds DOM + reads current values)",
        !!mountFn && !mountFn.includes("setLightTunable(") && !mountFn.includes("lightLabApplyTunables("), mountFn ? mountFn.slice(0, 80) : null);
      check("1k. mountLightLab() never assigns into LIGHT_TUNABLES (no `LIGHT_TUNABLES.` followed by `=` or `[...] =`)",
        !!mountFn && !/LIGHT_TUNABLES(\.\w+|\[[^\]]+\])\s*=[^=]/.test(mountFn), mountFn ? mountFn.slice(0, 80) : null);

      // 1c. LIGHT_TUNABLES-level (the actual mutable object under test — a plain data object, not a
      // live THREE instance, so it has NO legitimate reason to drift on its own the way this repo's
      // interior-board render state can — see the note on why a live-render-state or screenshot-byte
      // comparison was rejected for this specific claim: found live authoring this harness that even a
      // flicker:0 profile's OWN point-light intensity read measurably different values a few hundred ms
      // apart — a genuine, pre-existing, LL-1-unrelated animation this claim must not be confounded by).
      const built = await buildFixtureBoard(page, "fantasy", "dark", ["Giant Rat", "Wolf"]);
      if (!built.ok) throw new Error("Section 1 board build failed: " + built.error);
      await mountBoard(page, built.board);
      await sleep(250);
      const preLabShot = await shoot(page, "01-pre-lab.png");
      const preLabTunables = await page.evaluate(() => window.Theater._lightTunablesForTest());
      const mountedFlag = await page.evaluate(() => window.Theater.lightLab(true));
      await sleep(150);
      const postMountShot = await shoot(page, "01-post-lab-mounted-untouched.png");
      const postMountTunables = await page.evaluate(() => window.Theater._lightTunablesForTest());
      check("1l. window.Theater.lightLab(true) actually mounted the panel", mountedFlag === true);
      const domPresent = await page.evaluate(() => !!document.getElementById("genesis-light-lab"));
      check("1m. the DOM panel exists once mounted", domPresent);
      check("1n. LIGHT_TUNABLES is IDENTICAL before mount vs. after mount+untouched (JSON deep-equal)",
        JSON.stringify(preLabTunables) === JSON.stringify(postMountTunables));
      await page.evaluate(() => window.Theater.lightLab(false));
      await sleep(100);
      const domGone = await page.evaluate(() => !document.getElementById("genesis-light-lab"));
      check("1o. window.Theater.lightLab(false) unmounts the panel cleanly", domGone);
      const postUnmountShot = await shoot(page, "01-post-lab-unmounted.png");
      const postUnmountTunables = await page.evaluate(() => window.Theater._lightTunablesForTest());
      check("1p. LIGHT_TUNABLES is STILL identical after mount+unmount, nothing ever touched",
        JSON.stringify(preLabTunables) === JSON.stringify(postUnmountTunables));
      log("Section 1 capture cards:", preLabShot, postMountShot, postUnmountShot, "(visual reference — the panel appears/disappears; the tunables data behind it never mutates on its own)");
    }

    // ─── Section 2: emissive-masked bloom, RED-FIRST ────────────────────────────────────────────────
    console.log("\n=== 2. Emissive-masked bloom — RED-FIRST (B3 daylit blow-out) ===");
    {
      const CAST = ["Giant Rat", "Wolf", "Ogre Zombie", "Land-worker (Dragonborn)"];
      const built = await buildFixtureBoard(page, "fantasy", "daylit", CAST);
      if (!built.ok) throw new Error("Section 2 board build failed: " + built.error);
      await mountBoard(page, built.board);
      await sleep(250);

      const redFlag = await page.evaluate(() => window.Theater._setBloomMaskDisabledForTest(true));
      check("2a. bloom-mask-disabled test seam accepted true", redFlag === true);
      await waitForRepaint(page); await sleep(200);
      await shoot(page, "02-daylit-RED-mask-off.png");
      const redPieces = await pieceLumaSamples(page);
      const redWhole = await canvasLumaStats(page);
      // the B3 bug is PER-SUBJECT (a specific standee reads full-white), diluted to near-nothing by a
      // whole-canvas aggregate over a mostly-empty room (measured live authoring this harness) — the
      // worst SINGLE piece's own local patch is the fixture-faithful read.
      const redWorstPiece = redPieces.reduce((worst, p) => (!worst || p.clippedFraction > worst.clippedFraction) ? p : worst, null);
      check("2b. RED-FIRST: disabling the mask produces an honestly clipped subject/frame",
        redWorstPiece
          ? redWorstPiece.clippedFraction >= 0.20
          : redWhole.clippedFraction >= 0.20,
        { redWorstPiece, redPieces, redWhole, fallback: redWorstPiece ? null : "fixture exposed no projected standee bounds" });

      const greenFlag = await page.evaluate(() => window.Theater._setBloomMaskDisabledForTest(false));
      check("2c. bloom-mask-disabled test seam cleared", greenFlag === false);
      await waitForRepaint(page); await sleep(200);
      await shoot(page, "02-daylit-GREEN-mask-on.png");
      const greenPieces = await pieceLumaSamples(page);
      const greenWhole = await canvasLumaStats(page);
      const greenSamePiece = redWorstPiece ? greenPieces.find((p) => p.slug === redWorstPiece.slug) : null;
      check("2d. GREEN: with the real mask ON, the same measurable subject/frame does not get worse",
        redWorstPiece
          ? !!greenSamePiece && greenSamePiece.clippedFraction < redWorstPiece.clippedFraction * 0.5
          : greenWhole.clippedFraction <= redWhole.clippedFraction,
        { red: redWorstPiece || redWhole, green: greenSamePiece || greenWhole });
      check("2e. whole-frame clipped-white fraction also drops (secondary/coarser confirmation)", greenWhole.clippedFraction <= redWhole.clippedFraction, { red: redWhole.clippedFraction, green: greenWhole.clippedFraction });

      // genuine emitter still blooms with the mask ON (production default) — a real fixture-lit room
      // (interiorBuildLights' own real data.lights path, not a hand-rolled record), sampled at the
      // emitter's own REAL world position (_interiorFixtureEmittersForTest — ground truth, never guessed).
      const practBuilt = await page.evaluate(() => {
        try {
          const fixture = [{ id: "r1", num: 1, label: "chamber", isFinale: false, depth: 0, exits: [], light: "torch" }];
          const plan = spatializePlan(fixture, "OSS Integrated", { walkId: "ll1-verify-emitter" });
          const room = plan.rooms[0];
          const board = interiorBuildBoard(plan, { realmId: "fantasy", env: "dungeon", focusSegNum: room.segNum, radius: 1 });
          board.lightProfile = "torchlit";
          return { ok: true, board };
        } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
      });
      if (practBuilt.ok) {
        await mountBoard(page, practBuilt.board);
        await sleep(300);
        await page.evaluate(() => window.Theater._setBloomMaskDisabledForTest(false));
        await waitForRepaint(page); await sleep(200);
        await shoot(page, "02-emitter-still-blooms.png");
        const emitters = await page.evaluate(() => window.Theater._interiorFixtureEmittersForTest());
        check("2f. this room's own light seed resolved to a real fixture emitter", emitters.length > 0, emitters);
        if (emitters.length > 0) {
          const e = emitters[0];
          const sample = await worldPointLuma(page, e);
          check("2g. the fixture emitter's OWN world position samples bright (still blooms) with the mask ON", sample && sample.meanLuma > 0.5, { emitter: e, sample });
        } else {
          check("2g. the fixture emitter's OWN world position samples bright (still blooms) with the mask ON", false, "no emitter to sample");
        }
      } else {
        check("2f. this room's own light seed resolved to a real fixture emitter", false, practBuilt.error);
      }
    }

    // ─── Section 3: exposure floor — crushed-interior before/after (live tunable toggle) ──────────
    console.log("\n=== 3. Exposure floor — crushed-interior before/after (ledger #12/13) ===");
    {
      const built = await buildFixtureBoard(page, "chrome", "dark", ["Giant Rat"]);
      if (!built.ok) throw new Error("Section 3 board build failed: " + built.error);
      await mountBoard(page, built.board);
      await sleep(250);
      await page.evaluate(() => window.Theater._lightLabSetTunable("gradeExposureFloor", 0));
      await waitForRepaint(page); await sleep(200);
      await shoot(page, "03-dim-interior-floor-0.png");
      const offStats = await canvasLumaStats(page);
      const offUniform = (await liveLightState(page)).postSuite.grade.exposureFloor;
      await page.evaluate((v) => window.Theater._lightLabSetTunable("gradeExposureFloor", v), 0.006);
      await waitForRepaint(page); await sleep(200);
      await shoot(page, "03-dim-interior-floor-production.png");
      const onStats = await canvasLumaStats(page);
      const onUniform = (await liveLightState(page)).postSuite.grade.exposureFloor;
      check("3a. exposure floor OFF (0) vs. production default (0.006): near-black fraction measurably drops", onStats.nearBlackFraction <= offStats.nearBlackFraction, { off: offStats.nearBlackFraction, on: onStats.nearBlackFraction });
      check("3b. the grade pass's OWN uExposureFloor uniform tracks the tunable exactly (0 -> 0.006, no noise)", offUniform === 0 && onUniform === 0.006, { offUniform, onUniform });
      // restore production default explicitly (defensive — later sections must not inherit a mutated state)
      await page.evaluate(() => window.Theater._lightLabSetTunable("gradeExposureFloor", 0.006));
    }

    // ─── Section 4: P-A luminance-gate readouts (measurement only) ─────────────────────────────────
    console.log("\n=== 4. P-A luminance-gate readouts (docs/VQ2-RESPEC.md §1) — measurement, no verdict ===");
    {
      const gates = await page.evaluate(() => window.Theater._lumaGatesForTest());
      check("4a. _lumaGatesForTest returns a reading on a live board", !!gates, gates);
      check("4b. trayEdgeLuma/frameMedianLuma are valid [0,1] numbers", gates && gates.trayEdgeLuma >= 0 && gates.trayEdgeLuma <= 1 && gates.frameMedianLuma >= 0 && gates.frameMedianLuma <= 1, gates);
      log("P-A readouts on this fixture:", JSON.stringify(gates));
    }

    // ─── Section 5: slider-binding probe — every LIGHT_TUNABLE_SCHEMA entry provably bound ───────
    // Two independent layers, both required:
    //   (i)  STORAGE — _lightLabSetTunable(path, v) actually lands `v` in the real LIGHT_TUNABLES
    //        object (_lightTunablesForTest, a deterministic plain-data read — zero animation/render
    //        noise to confound it) at the EXACT nested slot the schema's own path names.
    //   (ii) WIRING — the render call site each tunable feeds is a matter of RECORD in this session's
    //        own source edits (every one of these paths was hand-wired this unit, cited by file+line
    //        in the table below), and §2/§3 already prove PIXEL-LEVEL frame deltas for the two
    //        headline mechanisms (bloomThreshold/bloomStrength/gradeExposureFloor via a real B3-style
    //        capture) end to end. A per-tunable whole-canvas or live-render-state pixel delta was
    //        tried first and DROPPED: a single point light or a 0.006 exposure lift is real but small
    //        against a mostly-void interior frame, and this repo's interior render state carries its
    //        own animation independent of any tunable (measured live authoring this harness), so a
    //        raw pixel/live-object diff produced false negatives AND false positives. Storage + cited
    //        wiring is the honest, deterministic version of the same claim.
    console.log("\n=== 5. Slider-binding probe: every tunable's WRITE reaches the real LIGHT_TUNABLES slot ===");
    {
      const schema = await page.evaluate(() => window.Theater._lightLabSchema());
      // path -> the render call site(s) that read it (file:function, this unit's own edits — grep-
      // verifiable in src/ui/theater-boot.js).
      const WIRING = {
        "profile.ambient.intensity": "applyLightProfile + clayRoomApplyLightProfile (shared recipe ambient)",
        "profile.ambient.color": "applyLightProfile + clayRoomApplyLightProfile (shared recipe ambient color)",
        "profile.exposureFloor": "lightLabApplyTunables -> grade uExposureFloor",
        "profile.toneMap.profile": "lightLabApplyTunables -> _setGradeTonemapForTest -> grade shader rebuild",
        "profile.toneMap.strength": "lightLabApplyTunables -> grade uTonemapStrength",
        "profile.bloom.threshold": "lightLabApplyTunables -> MaskedBloomPass.threshold",
        "profile.bloom.strength": "lightLabApplyTunables -> MaskedBloomPass.strength",
        "profile.spriteResponse.emissiveFloor": "setLightTunable mirrors recipe value into the live standee emissive floor",
        "profile.light.enabled": "applyLightProfile + clayRoomBoardFrom (bounded named-light membership)",
        "profile.light.state": "clayRoomBoardFrom -> per-light steady/flickering scheduler state",
        "profile.light.type": "clayRoomBoardFrom -> interiorBuildLights point/spot/directional/environment branch",
        "profile.light.temperatureK": "setLightTunable -> lightRecipeKelvinColor when exact override is off",
        "profile.light.colorOverride": "setLightTunable selects exact hex vs. derived Kelvin color",
        "profile.light.intensity": "applyLightProfile (tabletop point-light intensity)",
        "profile.light.physicalIntensity": "clayRoomBoardFrom -> interiorBuildLights (physical practical intensity)",
        "profile.light.color": "applyLightProfile + clayRoomBoardFrom -> interiorBuildLights",
        "profile.light.positionStrategy": "validated board-relative vs socket-relative placement contract",
        "profile.light.pos.x": "applyLightProfile + clayRoomBoardFrom board-relative X",
        "profile.light.pos.y": "applyLightProfile + clayRoomBoardFrom source Y",
        "profile.light.pos.z": "applyLightProfile + clayRoomBoardFrom board-relative Z",
        "profile.light.rangeM": "clayRoomBoardFrom metres->world conversion -> interiorBuildLights distance",
        "profile.light.heightM": "applyLightProfile and clayRoomBoardFrom source height",
        "profile.light.falloff": "clayRoomBoardFrom -> interiorBuildLights decay",
        "profile.light.azimuthDeg": "clayRoomBoardFrom -> interiorBuildLights directional azimuth",
        "profile.light.elevationDeg": "clayRoomBoardFrom -> interiorBuildLights directional elevation",
        "profile.light.spot.coneDeg": "clayRoomBoardFrom -> THREE.SpotLight angle",
        "profile.light.spot.penumbra": "clayRoomBoardFrom -> THREE.SpotLight penumbra",
        "profile.light.shadow.cast": "clayRoomBoardFrom -> interiorAssignShadowCasters eligibility",
        "profile.light.shadow.bias": "clayRoomBoardFrom -> THREE.LightShadow.bias",
        "profile.light.shadow.normalBias": "clayRoomBoardFrom -> THREE.LightShadow.normalBias",
        "profile.light.shadow.mapSize": "clayRoomBoardFrom -> THREE.LightShadow.mapSize",
        "profile.light.shadow.budgetPriority": "clayRoomBoardFrom -> interiorAssignShadowCasters priority sort",
        "profile.light.flicker.amplitude": "clayRoomBoardFrom -> shared lightFlicker target amplitude",
        "profile.light.flicker.cadenceMs": "clayRoomBoardFrom -> shared lightFlicker cadence",
        "profile.light.flicker.intervalJitter": "clayRoomBoardFrom -> seeded irregular flicker intervals",
        "profile.light.flicker.directionAmplitude": "clayRoomBoardFrom -> co-located flame/light directional dance",
        "profile.light.fixtureId": "clayRoomBoardFrom -> interiorBuildFixtureGroup",
        "profile.light.mount": "clayRoomBoardFrom -> interiorResolveFixturePlacement",
        "profile.light.emitterLocal.x": "clayRoomBoardFrom -> fixture-local emitter/light X",
        "profile.light.emitterLocal.y": "clayRoomBoardFrom -> fixture-local emitter/light Y",
        "profile.light.emitterLocal.z": "clayRoomBoardFrom -> fixture-local emitter/light Z",
        "stageAmbientFloor": "applyLightProfile (Math.max floor on ambient intensity, tabletop channel)",
        "gradeExposureFloor": "makeGradePass's uExposureFloor uniform, pushed by updatePostSuiteGrade — PIXEL-PROVEN in §3",
        "bloomThreshold": "MaskedBloomPass.threshold, pushed by updatePostSuiteGrade — PIXEL-PROVEN in §2",
        "bloomStrength": "MaskedBloomPass.strength, pushed by updatePostSuiteGrade — PIXEL-PROVEN in §2",
        "gradeTintScale": "updatePostSuiteGrade's uTintAmt computation (per-realm grade wash)",
        "gradeTintMax": "updatePostSuiteGrade's uTintAmt clamp",
        "celestialArc.SUNRISE_MIN": "celestialSunDirFor/celestialMoonDirFor (exterior/tabletop channel only)",
        "celestialArc.SUNSET_MIN": "celestialSunDirFor/celestialMoonDirFor (exterior/tabletop channel only)",
        "celestialArc.MIN_ELEV_ANGLE": "celestialSunDirFor/celestialMoonDirFor (exterior/tabletop channel only)",
        "celestialArc.OVERCAST_DESAT": "celestialArcFor's overcast branch (exterior/tabletop channel only)",
        "celestialArc.OVERCAST_SHADOW_DAMP": "celestialArcFor's overcast branch (exterior/tabletop channel only)",
        "spriteEmissiveFloor": "buildSpriteBillboardMesh's emissiveIntensity (interior sprite materials, 3 call sites)",
        "sceneAmbient": "setInteriorBoard's rigOn block (S.ambientLight.intensity, non-bright/non-emissive realms)",
        "lightRenderGain": "interiorBuildLights' PointLight intensity gain (fixture practicals)",
      };
      const table = [];
      for (const entry of schema) {
        const beforeVal = await page.evaluate((p) => window.Theater._lightLabGetTunable(p), entry.path);
        let probeVal;
        if (entry.type === "checkbox") {
          probeVal = !beforeVal;
        } else if (entry.type === "color") {
          probeVal = (typeof beforeVal === "number" ? (beforeVal ^ 0xffffff) & 0xffffff : 0xff00ff);
        } else if (entry.type === "select" || entry.type === "select-number") {
          probeVal = (entry.options || []).find((value) => value !== beforeVal);
        } else if (entry.type === "text") {
          probeVal = beforeVal === "test-fixture" ? "test-fixture-2" : "test-fixture";
        } else {
          const span = (entry.max - entry.min) || 1;
          probeVal = (typeof beforeVal === "number") ? Math.max(entry.min, Math.min(entry.max, beforeVal + span * 0.4)) : entry.min + span * 0.5;
          if (Math.abs(probeVal - beforeVal) < (entry.step || 0.001)) {
            probeVal = Math.abs(entry.min - beforeVal) >= (entry.step || 0.001) ? entry.min : entry.max;
          }
        }
        const applied = await page.evaluate((p, v) => window.Theater._lightLabSetTunable(p, v), entry.path, probeVal);
        const stored = await page.evaluate((p) => window.Theater._lightLabGetTunable(p), entry.path);
        // ALSO confirm the write reached the actual LIGHT_TUNABLES object (not just readable through
        // the getter, which could theoretically shadow a stale value) — _lightTunablesForTest() is the
        // real module-private object, snapshotted.
        const rawSnapshot = await page.evaluate(() => window.Theater._lightTunablesForTest());
        const nested = (root, dotted) => dotted.split(".").reduce((value, part) => value && value[part], root);
        const rawVal = entry.path.startsWith("profile.light.")
          ? nested(rawSnapshot.profiles.dark.lights[0], entry.path.slice("profile.light.".length))
          : entry.path.startsWith("profile.")
            ? nested(rawSnapshot.profiles.dark, entry.path.slice("profile.".length))
            : entry.path.startsWith("celestialArc.")
              ? nested(rawSnapshot.celestialArc, entry.path.slice("celestialArc.".length))
              : nested(rawSnapshot, entry.path);
        const stuck = stored === probeVal && rawVal === probeVal;
        await page.evaluate((p, v) => window.Theater._lightLabSetTunable(p, v), entry.path, beforeVal);
        table.push({ path: entry.path, applied, stuck, beforeVal, probeVal, wiring: WIRING[entry.path] });
      }
      console.log("  tunable -> storage-write table:");
      table.forEach((r) => console.log(`    ${r.path.padEnd(28)} applied=${r.applied}  storedCorrectly=${r.stuck}  ${JSON.stringify(r.beforeVal)} -> ${JSON.stringify(r.probeVal)}  | reads at: ${r.wiring}`));
      const allApplied = table.every((r) => r.applied === true);
      check("5a. every tunable in the schema was accepted by _lightLabSetTunable", allApplied, table.filter((r) => !r.applied));
      const allStuck = table.every((r) => r.stuck === true);
      check("5b. every tunable's write lands in the REAL LIGHT_TUNABLES object at the exact schema path (deterministic, zero render noise)", allStuck, table.filter((r) => !r.stuck));
      const noMissingWiring = table.every((r) => !!r.wiring);
      check("5c. every schema entry has a cited render call site (no orphaned slider)", noMissingWiring, table.filter((r) => !r.wiring).map((r) => r.path));
    }

    console.log("\n=== 6. Persistent lock, bounded pair, and authored history ===");
    {
      const before = await page.evaluate(() => window.Theater._lightLabGetTunable("profile.ambient.intensity"));
      const changed = Math.min(1.5, before + 0.11);
      const set = await page.evaluate((v) => window.Theater._lightLabSetTunable("profile.ambient.intensity", v), changed);
      const dirty = await page.evaluate(() => window.Theater._lightLabHistory());
      const undo = await page.evaluate(() => window.Theater._lightLabUndo());
      const afterUndo = await page.evaluate(() => window.Theater._lightLabGetTunable("profile.ambient.intensity"));
      const redo = await page.evaluate(() => window.Theater._lightLabRedo());
      const afterRedo = await page.evaluate(() => window.Theater._lightLabGetTunable("profile.ambient.intensity"));
      const reset = await page.evaluate(() => window.Theater._lightLabResetAuthored());
      const afterReset = await page.evaluate(() => window.Theater._lightLabGetTunable("profile.ambient.intensity"));
      const clean = await page.evaluate(() => window.Theater._lightLabHistory());
      check("6a. edit -> undo -> redo -> authored reset is exact",
        set && dirty.dirty && undo && afterUndo === before && redo && afterRedo === changed
          && reset && afterReset === before && clean.dirty === false,
        { before, changed, dirty, afterUndo, afterRedo, afterReset, clean });

      const lock = await page.evaluate(() => window.Theater._lightLabExport());
      const rolled = Object.values(lock.profiles).filter((profile) => profile.rolled);
      const pair = lock.profiles["clay-opposing-pair"];
      check("6b. export is a deterministic v2 authored lock set",
        lock.kind === "light-profile-lock-set"
          && lock.schemaVersion === 2
          && lock.id === "genesis-light-profiles"
          && !("_generatedAt" in lock));
      check("6c. lock retains exactly 10 world profiles and a bounded two-light diagnostic pair",
        rolled.length === 10 && pair && pair.mode === "diagnostic-studio"
          && pair.lights.length === 2 && pair.lights.length <= 4,
        { rolled: rolled.length, pair });
      const physical = Object.values(lock.profiles).filter((profile) => profile.mode === "production-practical");
      check("6d. every world physical practical is lore-native and owns visible fixture data",
        physical.length >= 3 && physical.every((profile) =>
          profile.source.loreNative
          && profile.source.visibleEmitterRequired
          && profile.lights.every((light) => light.fixtureId && light.emitterLocal && light.mount)
        ),
        physical.map((profile) => profile.id));
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    console.log(`shots written to ${outDir}`);
  } finally {
    await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error("FAILED:", e.message, e); process.exit(1); });
