#!/usr/bin/env node
/* dev/battle-gate/eyeball-fixtures/capture-eyeball-fixtures.mjs — PHASE-3-WAVE-1-SPECS.md P3-1e —
   the art review's first C-art fixtures. Purpose (P3-1e Decision): taste evidence from INTEGRATED
   production scenes, not bare shells (the "shoebox problem", wave-plan finding #3), and to visibly
   stage the rare tiers/risers (finding #2 — exposure, not a code fix).

   Modeled VERBATIM on dev/capture-oss-integrated.mjs's boot/server/chrome/shoot conventions (own
   port range so it can run alongside every other capture-*.mjs harness). Three fixtures, EACH a
   legacy-vs-oss PAIR at the SAME scene/camera/light/crop (only `window.Theater.
   _setRoomShellPolygonKernel("legacy"|"oss")` toggles between the two captures of a pair):

     1. TIERED ROOM  — one room, `segment.side` terrain-fixture prose ("a raised dais ... ; a sunken
        pit ...") parsed by place-spatialize.js's dspParseSideTerrains into a dais (+tier) patch and a
        pit (-tier) patch on the SAME floor (STAGE-C.md C2). Proves risers/tiers actually render
        under BOTH kernels (finding #2: the bare-shell captures under-expose this, not a code bug).
     2. APERTURE-HEAVY ROOM — a 5-node "Hub" topology (1 hub + 4 spokes), focus=hub, radius=1, so
        the focus room's walls carry FOUR live door apertures at once (the same hub-topology fixture
        shape dev/battle-gate/capture-interior-study.mjs's buildFixture already proves clean).
     3. DRESSED ROOM — routed through the REAL production seam `trayFrom({kind:"interior",...})`
        (src/engine/theater-data.js), which calls dressPlan() before interiorBuildBoard() — the exact
        path a live walk's theaterStageSync render takes. Runs AFTER P3-1d (diorama cutaway restore)
        + E0-1 (fixture fade wiring) landed, so this capture should show the restored open diorama
        with wall-mounted fixtures composing normally.

   Each fixture's board is built ONCE (the shared "same board seed" fact), then structuredClone'd
   per kernel mount so the only variable between the two captures of a pair is the kernel flag. The
   product camera (setInteriorVariant({shotCompose:false}), i.e. NO pose override — the fitted
   establishing shot a real player sees) is used for every capture. Same-scene/camera/crop assertion:
   after each pair, compare (a) the cloned board sent to mountKernel (byte-identical modulo the
   kernel-tagged _verifyNonce) and (b) window.Theater._interiorCameraPositionForTest() read after
   each mount (must match within a tight epsilon — the auto-fit camera derives purely from room bbox
   dims, which the kernel never changes).

   Run:  node dev/battle-gate/eyeball-fixtures/capture-eyeball-fixtures.mjs
   Output: dev/battle-gate/eyeball-fixtures/{tiered-room,aperture-room,dressed-room}-{legacy,oss}.png
           + results.json (per-fixture board meta, shellMeta, camera-pose assertion, telemetry). */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import net from "node:net";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const OUT_DIR = __dirname;
// Own port range — capture-oss-integrated.mjs owns 5281-5285, capture-wall-runs-oss.mjs its own,
// capture-interior-study.mjs 5201-5205, capture-dungeon-loop.mjs 5211-5215 — pick an unused block.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5291, 5292, 5293, 5294, 5295];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CAM_EPS = 1e-4;

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

// bootToInSession/waitForTheater — verbatim convention from dev/capture-oss-integrated.mjs (its own
// header cites dev/capture-wall-runs-oss.mjs as the original source).
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
      if (nameEl) nameEl.value = "Eyeball Fixtures Soul";
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

// ─── Fixture 1: TIERED ROOM (dais+pit, terrain-fixture prose) ─────────────────────────────────────
// One room, sized generously (30'x25' = 6x5 cells) so a 15'x15' dais patch (corner-anchored) and a
// 10'x10' pit patch (wall-anchored) both fit with room to spare. `side` is real walk-table PROSE —
// place-spatialize.js's dspParseSideTerrains splits on ";" and classifies each clause independently
// (DSP_TERRAIN_RAISE_RE matches "raised"/"dais"; DSP_TERRAIN_SINK_RE matches "sunken"/"pit").
async function buildTieredRoomFixture(page) {
  return await page.evaluate(() => {
    try {
      const side = "A raised stone dais, 2 ft high, in the corner (15' x 15'); " +
        "a sunken pit, 2 ft deep, along the wall (10' x 10')";
      const fixture = [{
        id: "r1", num: 1, label: "chamber", isFinale: false, depth: 0, exits: [], light: "normal",
        dims: "30' x 25'", side,
      }];
      const plan = spatializePlan(fixture, "P3-1e Tiered Room", { walkId: "p3-1e-eyeball:tiered-room-v1" });
      const room = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: room.segNum, radius: 1 });
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "p3-1e-tiered-room";
      return {
        ok: true, board,
        room: { x: room.x, z: room.y, w: room.w, d: room.d, segNum: room.segNum },
        terrain: (room.terrain || []).map((t) => ({ kind: t.kind, tier: t.tier, cellCount: t.cells.length })),
        tierCellsNonZero: Array.from(plan.tiers || []).filter((t) => t !== 0).length,
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// ─── Fixture 2: APERTURE-HEAVY ROOM ───────────────────────────────────────────────────────────────
// A 5-node "Hub" topology: s1 (the hub/focus room) wired to FOUR spokes (s2-s5), spokeCount=min(n-1,4)
// — the exact hub-fixture shape dev/battle-gate/capture-interior-study.mjs's buildFixture proves
// spatializes cleanly. focusSegNum=hub, radius=1 keeps all four immediate neighbors, so all four
// doors between the hub and its spokes render as live doorframe apertures on the hub's own walls.
async function buildApertureRoomFixture(page) {
  return await page.evaluate(() => {
    try {
      function buildHubFixture(n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const spokeCount = Math.min(n - 1, 4);
        const edges = [];
        for (let i = 1; i < n; i++) edges.push([ids[0], ids[Math.min(i, spokeCount)]]);
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { if (a !== b) { adj[a].push(b); adj[b].push(a); } });
        const depth = { [ids[0]]: 0 };
        const q = [ids[0]]; let head = 0;
        while (head < q.length) {
          const cur = q[head++];
          (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } });
        }
        return ids.map((id, i) => ({
          id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0,
          exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal",
        }));
      }
      const fixture = buildHubFixture(5);
      const plan = spatializePlan(fixture, "P3-1e Aperture Hub", { walkId: "p3-1e-eyeball:aperture-room-v1" });
      const focusRoom = plan.rooms[0]; // s1, the hub
      const board = interiorBuildBoard(plan, { realmId: "chrome", env: "dungeon", focusSegNum: focusRoom.segNum, radius: 1 });
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "p3-1e-aperture-room";
      const apertureCount = (board.instances && board.instances.doorframe) ? board.instances.doorframe.length : 0;
      return {
        ok: true, board, apertureCount,
        room: { x: focusRoom.x, z: focusRoom.y, w: focusRoom.w, d: focusRoom.d, segNum: focusRoom.segNum },
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// ─── Fixture 3: DRESSED ROOM through production trayFrom ──────────────────────────────────────────
// Routes through the REAL production seam (src/engine/theater-data.js trayFrom, kind:"interior")
// instead of calling interiorBuildBoard directly — this is what makes dressPlan() run (props/
// furniture/lights get realized), the exact code path a live walk's theaterStageSync render takes.
// Single dressable room, no combat pieces (kept out so the comparison isn't perturbed by standee
// tweens, same discipline capture-oss-integrated.mjs's own fixture uses).
async function buildDressedRoomFixture(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [{ id: "r1", num: 1, label: "hall", isFinale: false, depth: 0, exits: [], light: "normal", dims: "25' x 20'" }];
      const plan = spatializePlan(fixture, "P3-1e Dressed Room", { walkId: "p3-1e-eyeball:dressed-room-v1" });
      const room = plan.rooms[0];
      const board = trayFrom({ kind: "interior", plan, env: "dungeon", realmId: "fantasy", focusSegNum: room.segNum, radius: 1 }, null, {});
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      board._verifyNonce = "p3-1e-dressed-room";
      return {
        ok: true, board,
        room: { x: room.x, z: room.y, w: room.w, d: room.d, segNum: room.segNum },
        dressingCount: Array.isArray(board.dressing) ? board.dressing.length : 0,
        furnitureCount: Array.isArray(board.furniture) ? board.furniture.length : 0,
        lightsCount: Array.isArray(board.lights) ? board.lights.length : 0,
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

async function mountKernel(page, kernelMode, sourceBoard) {
  return await page.evaluate((kernelMode, sourceBoard) => {
    try {
      window.Theater._setRoomShellPolygonKernel(kernelMode);
      window.Theater._setRoomShellEnabled(true);
      const board = (typeof structuredClone === "function") ? structuredClone(sourceBoard) : JSON.parse(JSON.stringify(sourceBoard));
      board._verifyNonce = (sourceBoard._verifyNonce || "board") + ":" + kernelMode;
      window.Theater.setInteriorBoard(board);
      const shell = window.Theater._interiorRoomShellForTest ? window.Theater._interiorRoomShellForTest() : null;
      return {
        ok: true, kernel: window.Theater._roomShellPolygonKernel(),
        shellMeta: shell && shell.meta ? shell.meta : null,
        clonedBoardCheck: JSON.stringify(Object.assign({}, board, { _verifyNonce: undefined })),
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, kernelMode, sourceBoard);
}

// FINDING (this session): mounting a new board fires an ANIMATED camera-pose glide tween (MF-1,
// window.Theater._mf1CameraPoseTweenForTest — separate from window.Theater.tweensLive(), which
// tracks a different tween family). Reading _interiorCameraPositionForTest() immediately after
// setInteriorBoard (as capture-oss-integrated.mjs's single-fixture script does) can catch the
// camera mid-glide — verified directly here: an early trial run showed the SAME stale camera
// position bleeding across unrelated fixtures because a still-live glide tween hadn't finished
// when the next mount fired. Poll _mf1CameraPoseTweenForTest() to null (glide finished) before
// ever reading the "settled" pose.
async function waitForCameraSettle(page, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 6000);
  while (Date.now() < deadline) {
    const live = await page.evaluate(() => {
      const t = window.Theater && window.Theater._mf1CameraPoseTweenForTest ? window.Theater._mf1CameraPoseTweenForTest() : null;
      return !!t;
    });
    if (!live) return true;
    await sleep(100);
  }
  return false;
}
async function readCameraPos(page) {
  return await page.evaluate(() => (window.Theater && window.Theater._interiorCameraPositionForTest) ? window.Theater._interiorCameraPositionForTest() : null);
}

async function shoot(page, outPath) {
  const canvas = await page.$(".theater-stage-canvas canvas");
  const box = canvas && await canvas.boundingBox();
  if (!box) throw new Error("theater canvas has no page bounding box");
  await page.screenshot({ path: outPath, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height } });
  return box;
}
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

function camPosClose(a, b, eps) {
  if (!a || !b) return false;
  return Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps && Math.abs(a.z - b.z) < eps && Math.abs((a.zoom || 1) - (b.zoom || 1)) < eps;
}

const FIXTURES = [
  { key: "tiered-room", label: "Tiered room (dais+pit, terrain-fixture prose)", build: buildTieredRoomFixture },
  { key: "aperture-room", label: "Aperture-heavy room (4-door hub)", build: buildApertureRoomFixture },
  { key: "dressed-room", label: "Dressed room (production trayFrom)", build: buildDressedRoomFixture },
];

(async () => {
  const { proc } = await startServer();
  console.log("server:", BASE);
  const browser = await launchChrome();
  const results = { generatedBy: "capture-eyeball-fixtures.mjs", generatedAt: new Date().toISOString(), fixtures: {} };
  let anyFail = false;
  try {
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
    // NOTE (this environment, observed 2026-07-13): a cold genesis.html load fires ~680 requests
    // (every dev/model-qa/creatures/*.js + glb model probe file) — python3 -m http.server is
    // single-threaded, so draining that queue to network-idle measured ~47-49s here, well past the
    // 30s timeout dev/capture-oss-integrated.mjs's own convention uses. Bumped to 120s; the wait is
    // I/O-bound settling, not a hang (waitForNetworkIdle confirmed it always completes).
    await page.goto(BASE + "/genesis.html", { waitUntil: "networkidle0", timeout: 120000 });
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const bootRes = await bootToInSession(page);
    if (!bootRes.ok) { console.log("BOOT FAILED:", JSON.stringify(bootRes)); process.exitCode = 1; return; }
    const theaterState = await waitForTheater(page);
    if (!theaterState.hasSetInteriorBoard) { console.log("THEATER NOT READY:", JSON.stringify(theaterState)); process.exitCode = 1; return; }
    // Product camera (fitted establishing shot) — NO pose override; this is the shot a player sees.
    await page.evaluate(() => { try { window.Theater.setInteriorVariant({ shotCompose: false }); } catch (e) {} });

    for (const fx of FIXTURES) {
      console.log(`\n=== ${fx.key} — ${fx.label} ===`);
      const built = await fx.build(page);
      if (!built.ok) { console.log("FIXTURE BUILD FAILED:", JSON.stringify(built)); anyFail = true; results.fixtures[fx.key] = { ok: false, error: built.error, stack: built.stack }; continue; }
      const { board, ...meta } = built;
      console.log(`  board meta: ${JSON.stringify(meta)}`);

      // TEXTURE PREWARM: mount the board ONCE (throwaway, kernel doesn't matter — dressing texture
      // fetch is kernel-independent) and let the browser's own HTTP cache absorb every asset/
      // dressing/<slug>.png fetch before either REAL capture below. Without this, the first real
      // mount races the async texture load (verified directly: an earlier trial showed the FIRST
      // capture of the dressed-room pair still showing 1-2 "placeholder-forever" fallback cards
      // that the SECOND capture, seconds later, had already resolved to real art) — a load-order
      // artifact of this harness, never a legacy-vs-oss rendering difference (dressing has nothing
      // to do with the room-shell polygon kernel).
      const warm = await mountKernel(page, "legacy", board);
      if (warm && warm.ok) { try { await page.waitForNetworkIdle({ idleTime: 500, timeout: 8000 }); } catch (e) {} }

      const fxResult = { ok: true, label: fx.label, meta, kernels: {} };
      const boardChecks = {};
      for (const kernelMode of ["legacy", "oss"]) {
        const res = await mountKernel(page, kernelMode, board);
        if (!res || !res.ok) { console.log(`MOUNT FAILED (${kernelMode}):`, JSON.stringify(res)); anyFail = true; fxResult.ok = false; continue; }
        try { await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 8000 }); } catch (e) {}
        const camSettled = await waitForCameraSettle(page, 6000);
        // FINDING (this session): the dressed-room fixture's dressing texture fetches (assets/
        // dressing/<slug>.png) are async and NOT tied to any tween — an early trial showed the
        // LEGACY capture (mounted first) catching the "placeholder-forever" fallback card mid-fetch
        // while the OSS capture (mounted ~1-2s later, same board) showed the resolved real sprite
        // art. That's a texture-load RACE, not a kernel effect — wait for network idle here so BOTH
        // captures of a pair see the same settled asset state (never letting fetch timing masquerade
        // as a legacy/oss visual difference).
        try { await page.waitForNetworkIdle({ idleTime: 300, timeout: 5000 }); } catch (e) {}
        await waitForRepaint(page);
        await sleep(150);
        const camPos = await readCameraPos(page);
        const outPath = path.join(OUT_DIR, `${fx.key}-${kernelMode}.png`);
        await shoot(page, outPath);
        boardChecks[kernelMode] = res.clonedBoardCheck;
        fxResult.kernels[kernelMode] = { kernel: res.kernel, shellMeta: res.shellMeta, camPos, camSettled };
        console.log(`  wrote ${outPath} (kernel=${res.kernel})`);
        console.log(`    shellMeta: ${JSON.stringify(res.shellMeta)}`);
        console.log(`    camPos: ${JSON.stringify(camPos)} (settled=${camSettled})`);
      }

      // SAME-SCENE/CAMERA/CROP ASSERTION: the board sent to mountKernel must be byte-identical
      // between the two kernel mounts (modulo the kernel-tagged _verifyNonce, already stripped
      // above), and the auto-fit camera pose must match within CAM_EPS — proving the only real
      // variable between the pair is the room-shell kernel flag.
      const boardsIdentical = boardChecks.legacy != null && boardChecks.oss != null && boardChecks.legacy === boardChecks.oss;
      const camMatch = fxResult.kernels.legacy && fxResult.kernels.oss
        ? camPosClose(fxResult.kernels.legacy.camPos, fxResult.kernels.oss.camPos, CAM_EPS) : false;
      fxResult.sameSceneAssertion = { boardsIdentical, camMatch, camLegacy: fxResult.kernels.legacy && fxResult.kernels.legacy.camPos, camOss: fxResult.kernels.oss && fxResult.kernels.oss.camPos };
      console.log(`  SAME-SCENE ASSERTION: boardsIdentical=${boardsIdentical} camMatch=${camMatch}`);
      if (!boardsIdentical || !camMatch) anyFail = true;

      results.fixtures[fx.key] = fxResult;
    }

    fs.writeFileSync(path.join(OUT_DIR, "results.json"), JSON.stringify(results, null, 2));
    console.log("\nCaptures + results.json written to", OUT_DIR);
    if (anyFail) process.exitCode = 1;
  } finally {
    await browser.close();
    if (proc) proc.kill("SIGTERM");
  }
})();
