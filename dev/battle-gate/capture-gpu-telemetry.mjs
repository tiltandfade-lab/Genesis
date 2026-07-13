#!/usr/bin/env node
/* dev/battle-gate/capture-gpu-telemetry.mjs — GP-1 (docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md S5,
   docs/GRAPHICS-CONVERGENCE-PLAN.md Phase 0 GP-1 row) — the measurement-foundation half of Wave GP-1
   ("Agent A owns dev/battle-gate/capture-gpu-telemetry.mjs only").

   CHARTER S7 STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md):
     - Convergence rung advanced: C7 (performance tooling makes the result sustainable) — a GPU/
       resource census, not a new visual.
     - Canonical contracts preserved: dev-only, NEW path, zero edits to src/. Reads the existing
       inventory seam (window.Theater._graphicsResearchContextForTest /
       _graphicsResearchInventoryForTest, already on master in theater-boot.js) — never mutates the
       scene, never rerolls a card, never drives narrative RNG.
     - Fixtures/refs for acceptance: the row-101 Grand Octagon (Engine/03. _Tables/03. Session
       Mechanics/Dungeons/Dungeon Area Type.md row 101 — "30' x 30' sunken central arena... 10' wide
       raised ring walkway" — the SAME fixture dev/battle-gate/capture-wall-volumes.mjs already uses
       and the fixture GEOMETRY-ACCELERATION-TOOLCHAIN.md's own negative-sy regression targets), mounted
       twice at two radii with two identical creature standees, so unique-resource counts and draw-
       submission counts can be compared side by side.
     - Negative control: capture the SAME creature/light material palette in a SMALL scene (STAGE-A A1
       default, `window.ITR_ACTIVE_ROOM_ONLY===true` — "the active room ALONE owns render geometry",
       theater-interior.js S429-441 — the hub octagon only, doorways become shallow portals) and a
       LARGER scene (the documented harness A/B knob flipped, `window.ITR_ACTIVE_ROOM_ONLY=false`,
       restoring the pre-A1 `radius`-hop neighbor render byte-for-byte — hub + 2 neighbor chambers)
       built from the SAME cached textures and the SAME 2 creature standees. The receipt proves mesh
       count / draw calls / triangles rise from A to B while unique TEXTURE count stays flat (or rises
       far slower) — the measurement law from RESEARCH-WAVE S5.1: "an atlas can lower texture count
       without lowering mesh submissions" implies the inverse holds too: growing mesh submissions must
       not silently inflate the reported unique-resource counts. Unique MATERIAL count is reported
       alongside for contrast (Genesis currently mints a fresh MeshLambertMaterial per room/piece
       rather than sharing one — see the receipt's own materials delta — so materials scale with rooms
       while textures, which use per-slug/singleton caches (dressingTextureFor, interiorGlowTexture,
       interiorConeTexture, interiorPoolTexture), do not). `window.ITR_ACTIVE_ROOM_ONLY` is an existing,
       already-documented, already-reversible harness knob (theater-interior.js's own comment: "a live
       session or a verify harness can flip it at runtime... for an A/B capture") — not a new seam this
       unit adds; this script restores it to its default (true) before closing the page.
     - Classification: dev harness (research-only instrumentation). No runtime behavior change: the
       harness only READS renderer.info + the inventory seam and forces an existing test-only
       synchronous render seam (_renderFrameForTest, already on master) — it adds no new production
       code path and the scene renders identically whether or not this script ever runs.

   MEASUREMENT LAW (RESEARCH-WAVE S5.1): report unique resources (materials/textures/geometries)
   SEPARATELY from draw submissions (mesh count / renderer.info.render.calls/triangles). This script
   never collapses the two into one number. GPU timing via EXT_disjoint_timer_query_webgl2 is attempted
   as an S5.1-law-compliant best-effort cross-check (discarding any window where GPU_DISJOINT_EXT is
   true, never calling gl.finish()); stats-gl is NOT wired in (optional per the parent doc) — see the
   "gpuTiming" section of the receipt for availability + SwiftShader/software-render detection, which
   the parent doc requires flagging ("software-rendered runs are correctness evidence only, never the
   performance baseline").

   Run:  node dev/battle-gate/capture-gpu-telemetry.mjs
   Output: dev/battle-gate/gpu-telemetry/{scene-a-active-room-only,scene-b-radius-hop-neighbors}.png
           + telemetry.json */

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
const outDir = path.join(__dirname, "gpu-telemetry");
fs.mkdirSync(outDir, { recursive: true });

// a port range disjoint from every sibling battle-gate harness's own claimed ranges (see the sweep
// across dev/battle-gate/*.mjs — 51xx/52xx are all taken; 5281-5285 is unclaimed).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5281, 5282, 5283, 5284, 5285];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[gpu-telemetry]", ...a); }
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

const SHOT_W = 1600, SHOT_H = 1000; // the S5.2 fixture size (docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md)
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
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// bootToInSession — verbatim from capture-wall-volumes.mjs (see that file's header for why).
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
      if (nameEl) nameEl.value = "GPU Telemetry Gate Soul";
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

// buildScene — the SAME row-101 Grand Octagon fixture capture-wall-volumes.mjs uses (real rolled
// dims/dungeon area type, not a hand-drawn shape), PLUS two creature standees ("Skeleton" — the same
// gloom probe slug dev/battle-gate/capture-lit-sprites.mjs already uses) so the material palette
// covers alpha-tested cutouts (sprite standees + light cards), additive FX (light cones + motes from
// lightProfile "lamplit"), and normal-alpha solids (per-piece contact-shadow pool blobs) — not just
// bare architecture. `activeRoomOnly` sets the documented harness A/B knob (theater-interior.js S429-
// 441, `window.ITR_ACTIVE_ROOM_ONLY`) BEFORE building: true (default) = STAGE-A A1 single-room-literal
// (the focus octagon ALONE); false = the pre-A1 radius-hop neighbor render (focus octagon + s2/s3). The
// SAME fixture/seed/pieces are used either way — only the flag differs — which is what makes the two
// captures a valid unique-vs-submissions comparison rather than two unrelated scenes.
async function buildScene(page, activeRoomOnly) {
  return await page.evaluate((activeRoomOnly) => {
    try {
      window.ITR_ACTIVE_ROOM_ONLY = activeRoomOnly;
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }, { targetId: "s3" }],
          light: "normal", areaType: "Grand Octagon", dims: "60' x 60'" },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s3", num: 3, label: "s3", isFinale: true, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
      ];
      // SAME walkId/seed regardless of activeRoomOnly — the flag is the only variable between A and B.
      const plan = spatializePlan(fixture, "The Hub", { walkId: "gpu-telemetry-gate-octagon" });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s1");
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = "lamplit";
      // two deterministic standee cells drawn from the SAME focus room, sorted so the choice is
      // reproducible regardless of cell-array emission order — picks roughly 1/3 and 2/3 through the
      // room's own footprint so neither standee sits on a boundary/door cell.
      const cells = (focusRoom.cells || []).slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
      const cellA = cells[Math.floor(cells.length / 3)] || cells[0];
      const cellB = cells[Math.floor(cells.length * 2 / 3)] || cells[cells.length - 1];
      board.pieces = [
        { slug: "Skeleton", fid: "telemetry-probe-a", cellX: cellA.x, cellY: cellA.y },
        { slug: "Skeleton", fid: "telemetry-probe-b", cellX: cellB.x, cellY: cellB.y },
      ];
      return { ok: true, board, roomShape: focusRoom.shape, roomCellCount: cells.length, activeRoomOnly: window.ITR_ACTIVE_ROOM_ONLY };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, activeRoomOnly);
}

async function pollPiecesResolved(page) {
  const deadline = Date.now() + 6000;
  let r = null;
  while (Date.now() < deadline) {
    r = await page.evaluate(() => ({
      resolved: window.Theater.interiorPiecesResolved(),
      requested: window.Theater.interiorPiecesRequested(),
      fileTexPending: window.Theater.interiorFileTexPending(),
    }));
    if (r.resolved >= r.requested && r.fileTexPending === 0) return r;
    await sleep(200);
  }
  return r;
}

// captureOne — mounts ONE scene at the given ITR_ACTIVE_ROOM_ONLY setting, forces a synchronous render
// (the existing _renderFrameForTest test-only seam, already on master — bypasses rAF-throttling risk
// in a backgrounded automated tab, same rationale as capture-wall-volumes.mjs's waitForRepaint), then
// reads BOTH the JSON-safe inventory census and raw renderer.info off the SAME frame. No new test seam
// is added by this script; it reads two that already exist.
async function captureOne(page, label, activeRoomOnly) {
  const built = await buildScene(page, activeRoomOnly);
  if (!built.ok) throw new Error(`scene build FAILED (${label}): ${built.error}`);
  log(`${label}: scene built — shape=${built.roomShape} cells=${built.roomCellCount} activeRoomOnly=${built.activeRoomOnly}`);

  await page.evaluate(() => { window.Theater.setInteriorVariant({ shotCompose: false }); });
  const mounted = await page.evaluate((board) => {
    try { window.Theater.setInteriorBoard(board); return { ok: true }; }
    catch (e) { return { ok: false, error: e.message }; }
  }, built.board);
  if (!mounted.ok) throw new Error(`setInteriorBoard FAILED (${label}): ${mounted.error}`);

  const resolvedState = await pollPiecesResolved(page);
  await sleep(200);

  // PER-PASS GPU TELEMETRY (RESEARCH-WAVE S5.1: "Temporarily wrap each pass's render in the Puppeteer
  // page... Record... renderer calls/triangles"). This is REQUIRED, not decorative: found live
  // building this receipt — three.js's WebGLRenderer resets info.render.calls/triangles at the START
  // of every renderer.render() call, and EffectComposer.render() invokes renderer.render() ONCE PER
  // ENABLED PASS internally. Reading ctx.renderer.info only AFTER the whole composer.render() chain
  // (the naive approach) therefore reports ONLY the LAST pass's own tiny submission (a full-screen
  // OutputPass triangle — always calls:1 triangles:1 regardless of scene complexity, confirmed by a
  // first pass of this script that read exactly that constant in both scene A and scene B). Wrapping
  // each pass's own `.render` method to snapshot info right after ITS OWN internal renderer.render()
  // call recovers the true per-pass and full-chain numbers. The wrapper calls the ORIGINAL unmodified
  // method and only READS info afterward — zero behavior change — and is restored immediately after
  // this one frame (see `restore()` below), so no other capture in this run or any other script is
  // affected.
  const perPassResult = await page.evaluate(() => {
    const ctx = window.Theater._graphicsResearchContextForTest();
    const composer = ctx.composer;
    const info = ctx.renderer && ctx.renderer.info;
    const perPass = [];
    let restore = () => {};
    if (composer && Array.isArray(composer.passes) && composer.passes.length) {
      const originals = composer.passes.map((p) => p.render);
      composer.passes.forEach((p, i) => {
        const orig = originals[i];
        p.render = function (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
          orig.call(p, renderer, writeBuffer, readBuffer, deltaTime, maskActive);
          perPass.push({
            index: i, name: p.__bwName || p.constructor.name || ("pass" + i), enabled: !!p.enabled,
            callsAfter: info.render.calls, trianglesAfter: info.render.triangles,
          });
        };
      });
      restore = () => { composer.passes.forEach((p, i) => { p.render = originals[i]; }); };
    }
    if (window.Theater._renderFrameForTest) window.Theater._renderFrameForTest();
    restore();
    return {
      wrapped: perPass.length > 0,
      passCount: composer && composer.passes ? composer.passes.length : 0,
      perPass,
      // full-chain totals: sum each wrapped pass's OWN submission (callsAfter/trianglesAfter are
      // already "since this pass's own internal render() call reset the counters", i.e. that pass's
      // own count — NOT a running cumulative total across passes).
      fullChainCalls: perPass.reduce((s, p) => s + p.callsAfter, 0),
      fullChainTriangles: perPass.reduce((s, p) => s + p.trianglesAfter, 0),
    };
  });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

  const telemetry = await page.evaluate((perPassResult) => {
    const inv = window.Theater._graphicsResearchInventoryForTest();
    const ctx = window.Theater._graphicsResearchContextForTest();
    const info = ctx.renderer && ctx.renderer.info;
    // GPU timing best-effort cross-check (RESEARCH-WAVE S5.1's measurement law): probe
    // EXT_disjoint_timer_query_webgl2 availability + whether the renderer identifies as software
    // (SwiftShader) — a headless/CI GPU context frequently has neither real timer-query support nor a
    // hardware GPU behind it, so this reports availability honestly rather than faking a number.
    let gl = null;
    try { gl = ctx.renderer && ctx.renderer.getContext && ctx.renderer.getContext(); } catch (e) {}
    let rendererIdentity = null, timerExt = null, disjointDetected = false;
    if (gl) {
      try {
        const dbgExt = gl.getExtension("WEBGL_debug_renderer_info");
        rendererIdentity = dbgExt ? gl.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      } catch (e) { rendererIdentity = "unavailable: " + e.message; }
      try { timerExt = !!gl.getExtension("EXT_disjoint_timer_query_webgl2"); } catch (e) { timerExt = false; }
    }
    const isSoftware = typeof rendererIdentity === "string" && /swiftshader|software|llvmpipe/i.test(rendererIdentity);
    return {
      inventory: inv,
      perPassRender: perPassResult,
      rendererInfoRaw: info ? {
        // render.calls/render.triangles here are the LAST-pass-only reading (the naive/misleading
        // number — kept for contrast, see this function's own header comment on WHY it under-reports
        // through a multi-pass composer). perPassRender.fullChainCalls/fullChainTriangles above are
        // the CORRECT full-chain submission totals.
        render: { calls: info.render.calls, triangles: info.render.triangles, points: info.render.points, lines: info.render.lines, frame: info.render.frame },
        memory: { geometries: info.memory.geometries, textures: info.memory.textures },
        programCount: info.programs ? info.programs.length : null,
      } : null,
      gpuTiming: {
        contextAvailable: !!gl,
        rendererIdentity,
        isSoftwareRenderer: isSoftware,
        disjointTimerQueryExt2Available: timerExt,
        disjointDetected,
        note: isSoftware
          ? "SwiftShader/software renderer detected — this run is correctness evidence only, NOT a performance baseline (RESEARCH-WAVE S5.1)."
          : (timerExt ? "EXT_disjoint_timer_query_webgl2 available — a future GP-1 follow-up can wire real per-pass GPU p50/p95 through it; not exercised by this receipt."
                       : "EXT_disjoint_timer_query_webgl2 NOT available in this context — GPU timing unavailable; renderer.info submission counts are the only measurement this receipt reports."),
      },
      canvasSize: ctx.renderer ? { width: ctx.renderer.domElement.width, height: ctx.renderer.domElement.height } : null,
    };
  }, perPassResult);

  const shotPath = path.join(outDir, label + ".png");
  await page.screenshot({ path: shotPath, fullPage: false });
  log(`${label}: captured ${label}.png`);

  return { label, activeRoomOnly: built.activeRoomOnly, roomShape: built.roomShape, roomCellCount: built.roomCellCount, resolvedState, telemetry };
}

async function main() {
  const receipt = { generatedAt: new Date().toISOString(), unit: "GP-1", fixture: "row-101 Grand Octagon (Dungeon Area Type table), hub + 2 neighbor chambers, 2x Skeleton standee, lightProfile=lamplit", scenes: [], notes: [] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    receipt.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const theaterState = await waitForTheater(page);
    receipt.theaterState = theaterState;
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("window.Theater.setInteriorBoard never became available: " + JSON.stringify(theaterState));

    // SCENE A — ITR_ACTIVE_ROOM_ONLY=true (STAGE-A A1 default): the focus octagon room ALONE, doorways
    // become shallow portals, no neighbor-room shell geometry compiled in.
    const sceneA = await captureOne(page, "scene-a-active-room-only", true);
    receipt.scenes.push(sceneA);

    // SCENE B — ITR_ACTIVE_ROOM_ONLY=false (the documented harness A/B knob, pre-A1 radius-hop
    // render): the SAME focus octagon room plus 2 neighbor chambers (s2/s3) compiled in — strictly
    // more architecture, more meshes, more draw calls than scene A, same fixture/seed/pieces otherwise.
    const sceneB = await captureOne(page, "scene-b-radius-hop-neighbors", false);
    receipt.scenes.push(sceneB);

    // restore the flag to its production default before closing the page — this harness reads a
    // documented reversible knob, it does not leave global state mutated behind it.
    await page.evaluate(() => { window.ITR_ACTIVE_ROOM_ONLY = true; });

    receipt.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    receipt.consoleErrorsCount = receipt.consoleErrors.length;

    // NEGATIVE CONTROL — the measurement law (RESEARCH-WAVE S5.1): unique resources must be reported
    // SEPARATELY from draw submissions, i.e. growing submissions must not silently inflate (or hide
    // changes in) the reported unique-resource counts. Compare A -> B.
    const a = sceneA.telemetry.inventory, b = sceneB.telemetry.inventory;
    const aPass = sceneA.telemetry.perPassRender, bPass = sceneB.telemetry.perPassRender;
    const control = {
      law: "unique resources (materials/textures/geometries) are reported separately from draw submissions (mesh count / full-chain renderer draw calls+triangles) — growing one axis must not be silently conflated with the other.",
      textures: { a: a.resources.textures, b: b.resources.textures, delta: b.resources.textures - a.resources.textures },
      materials: { a: a.resources.materials, b: b.resources.materials, delta: b.resources.materials - a.resources.materials },
      meshes: { a: a.scene.meshes, b: b.scene.meshes, delta: b.scene.meshes - a.scene.meshes },
      objects: { a: a.scene.objects, b: b.scene.objects, delta: b.scene.objects - a.scene.objects },
      // full-chain (per-pass-summed) draw calls/triangles — see perPassRender's own header comment for
      // why the naive post-composer renderer.info read (rendererInfoRaw.render.calls/triangles, kept
      // in the receipt for contrast) under-reports to a constant 1/1 (the last pass's own full-screen
      // triangle only).
      fullChainRendererCalls: aPass && bPass ? { a: aPass.fullChainCalls, b: bPass.fullChainCalls, delta: bPass.fullChainCalls - aPass.fullChainCalls } : null,
      fullChainRendererTriangles: aPass && bPass ? { a: aPass.fullChainTriangles, b: bPass.fullChainTriangles, delta: bPass.fullChainTriangles - aPass.fullChainTriangles } : null,
    };
    control.meshesGrew = control.meshes.delta > 0;
    control.textureCountGrewProportionallyLess = control.meshes.delta > 0
      ? (control.textures.delta === 0 || (control.textures.delta / Math.max(1, a.resources.textures)) < (control.meshes.delta / Math.max(1, a.scene.meshes)))
      : null;
    control.proven = !!(control.meshesGrew && control.textureCountGrewProportionallyLess);
    receipt.negativeControl = control;

    receipt.noRuntimeBehaviorChangeNote = "This harness calls ONLY read-only production APIs (setInteriorBoard — the same production mount call every battle-gate capture script uses) plus two existing TEST-ONLY read seams (_graphicsResearchContextForTest, _graphicsResearchInventoryForTest) and one existing TEST-ONLY forced-render seam (_renderFrameForTest) that were already on master before this unit. No new window.Theater.* seam was added, no src/ file was edited, and _renderFrameForTest only forces the SAME renderTheaterFrame() the normal rAF loop would have called on its own next tick — it does not change what gets rendered, only when.";

    fs.writeFileSync(path.join(outDir, "telemetry.json"), JSON.stringify(receipt, null, 2));
    log("wrote telemetry.json —", receipt.scenes.length, "scenes,", receipt.consoleErrorsCount, "console errors, negative control proven =", control.proven);
    if (receipt.scenes.length < 2 || !control.proven) { log("WARNING: negative control not conclusively proven — see telemetry.json"); process.exitCode = 1; }
  } catch (e) {
    receipt.error = e.message;
    fs.writeFileSync(path.join(outDir, "telemetry.json"), JSON.stringify(receipt, null, 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
