#!/usr/bin/env node
/* dev/battle-gate/capture-wall-occlusion.mjs — docs/WALL-VOLUMES-PRACTICALS.md Unit C4.1b (segment-
   level upper-wall occlusion) — frame 02's own runtime capture gate: "shoot the SAME encounter from
   TWO camera yaws; the orchestrator READS both against frame 02 — same minis, far walls full, only
   near/blocking uppers faded, stems opaque throughout." Server/Chrome/boot/buildScene conventions
   copied VERBATIM from dev/battle-gate/capture-wall-volumes.mjs (C4.1a's own sibling capture) — see
   that file's header for the "why" behind each.

   SCENE: the SAME Grand Octagon fixture capture-wall-volumes.mjs uses, with s2 (a second room,
   one hop off the depth-0 entrance s1) as the FOCUS room, ALSO marked isFinale so it carries a real
   dais anchor (theater-interior.js's daisTop) — dsmAssignRoles (place-semantics.js) checks entry-room
   BEFORE finale, so the depth-0 entrance itself can never carry role "finale" (found live: an earlier
   version of this fixture made the entrance room both focus AND isFinale, and daisTop came back
   empty). That dais gives ShotPlan.anchors.objective a genuine in-room position; the board's own
   torchlit lights give a real focalLight anchor too (both real for any interior3d tray, no combat
   needed). A minimal `window.GS.combat` (set below, before setInteriorBoard mounts) supplies real
   player/primaryThreat anchors — theater-shot.js's own worldPosFromEntry checks explicit numeric x/z
   BEFORE the band/lane zone fallback, so this hands ABSOLUTE world positions straight through, no
   zone-grid translation needed. All four of the spec's required-subject kinds (player/primaryThreat/
   objective/"focal interaction" — the latter via focalLight, no dedicated ShotPlan anchor exists yet
   for it, per theater-boot.js's own wiring comment) are real and exercised against compiled wall-shell
   geometry. The pure harness (dev/verify-wall-occlusion.mjs) is the rigorous proof of the ray-blocking
   math itself at arbitrary synthetic positions; this capture's job is the VISUAL "I can read it" check
   frame 02 asks for, with the SAME product wiring (real ShotPlan, real compiled shell) end to end.

   TWO-YAW SEQUENCE: setInteriorBoard's own dirty-key skip (data+variant JSON unchanged -> no rebuild)
   means a bare rotate() alone would never re-run the wall-occlusion classify pass (it only calls
   placeCamera(), never setInteriorBoard). window.Theater.setInteriorVariant({}) is the EXISTING,
   already-wired mechanism that forces a replay (`S.boardKey = null; setInteriorBoard(S.lastBoard)`,
   theater-boot.js's own setInteriorVariant) — so the sequence here is: build once -> shoot yaw A ->
   rotate() (bumps S.rotationStep, moves the camera) -> setInteriorVariant({}) (forces the SAME board
   to rebuild at the new rotationStep) -> shoot yaw B. Both shots' logical state (wallSegments/
   apertures/mountSlots) is read via the EXISTING window.Theater._interiorRoomShellForTest() seam and
   asserted byte-identical (JSON deep-equal) — proving the cutaway is a pure PRESENTATION change, never
   a structural rewrite (this unit's own behavior item 4 / frame 02's own acceptance).

   Run:  node dev/battle-gate/capture-wall-occlusion.mjs
   Output: dev/battle-gate/wall-occlusion/{yaw-a,yaw-b}.png + metrics.json */

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
const outDir = path.join(__dirname, "wall-occlusion");
fs.mkdirSync(outDir, { recursive: true });

// a port range disjoint from every sibling battle-gate harness's own claimed ranges (checked live:
// 5201-5265 already claimed across the existing capture-*/verify-* scripts).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5271, 5272, 5273, 5274, 5275];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[wall-occlusion-gate]", ...a); }
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
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// mirrors capture-wall-volumes.mjs's own bootToInSession verbatim (see that file's header for why).
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
      if (nameEl) nameEl.value = "Wall Occlusion Gate Soul";
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

// SAME Grand Octagon fixture capture-wall-volumes.mjs uses — s1 marked isFinale (see this file's own
// header) so it carries a real dais anchor (ShotPlan's own objective anchor). torchlit light profile
// so a real focalLight anchor resolves too.
async function buildScene(page) {
  return await page.evaluate(() => {
    try {
      // s1 (entrance, depth 0) -> s2 (the FOCUS room). dsmAssignRoles (src/engine/place-semantics.js)
      // checks `r.segNum === entry.segNum` BEFORE its own finale check, so the depth-0/entry room can
      // never carry role "finale" even with isFinale:true stamped on it directly (found live: an
      // earlier version of this fixture made s1 both entry AND isFinale, and daisTop came back empty
      // for exactly that reason) — s2 is the finale AND the focus room here so ShotPlan's objective
      // anchor resolves to a real in-room dais.
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }],
          light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s2", num: 2, label: "s2", isFinale: true, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Grand Octagon", dims: "60' x 60'" },
      ];
      const plan = spatializePlan(fixture, "The Hub", { walkId: "wall-occlusion-gate-octagon" });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s2");
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = "torchlit";
      // C4.1b's required subject set is player/primaryThreat/objective/focalInteraction ONLY (see
      // theater-boot.js's own wallOcclusionSubjects comment) — NOT generic staged pieces/cast cards, so
      // a real GS.combat (set separately, below, before setInteriorBoard mounts) is what actually
      // feeds the wall-upper ray test's subjects. The x/z-direct branch of theater-shot.js's own
      // worldPosFromEntry (checked BEFORE the band/lane zone fallback) lets a combat unit carry an
      // explicit ABSOLUTE world position matching this room's own coordinate space directly — no
      // zone-grid translation needed for a synthetic capture fixture. fitFromComposedShot's own
      // action-cluster crop falls back to the player/primaryThreat/objective anchors when
      // shotPlan.pieces is empty (this fixture's own case — no walkScene/projection cast cards), so
      // placing player/threat gives the composed camera real walls-in-frame extent too.
      return { ok: true, board, roomShape: focusRoom.shape, roomRole: focusRoom.role, roomCellCount: Array.isArray(focusRoom.cells) ? focusRoom.cells.length : null, daisTop: board.daisTop };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// readShellState() — the LOGICAL state a rebuild must never touch (wallSegments/apertures/mountSlots)
// PLUS the per-segment upper-mesh opacity/visible state a rebuild SHOULD be free to change. Read via
// the existing window.Theater._interiorRoomShellForTest() seam — no new test hook needed.
async function readShellState(page) {
  return await page.evaluate(() => {
    const shell = window.Theater._interiorRoomShellForTest ? window.Theater._interiorRoomShellForTest() : null;
    if (!shell) return null;
    return {
      wallSegments: shell.wallSegments,
      apertures: shell.apertures,
      mountSlots: shell.mountSlots,
      stemOpacity: shell.wallStemMesh && shell.wallStemMesh.material ? shell.wallStemMesh.material.opacity : null,
      stemVisible: shell.wallStemMesh ? shell.wallStemMesh.visible : null,
      upper: (shell.wallUpperMeshes || []).map((e) => ({
        ownerSegIndex: e.ownerSegIndex,
        opacity: e.mesh.material ? e.mesh.material.opacity : null,
        visible: e.mesh.visible,
      })),
    };
  });
}

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), notes: [], shots: [] };
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
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("window.Theater.setInteriorBoard never became available: " + JSON.stringify(theaterState));

    const built = await buildScene(page);
    metrics.built = { ok: built.ok, error: built.error, roomShape: built.roomShape, roomCellCount: built.roomCellCount, daisTop: built.daisTop };
    if (!built.ok) throw new Error("scene build FAILED: " + built.error);
    log(`scene built: shape=${built.roomShape} cells=${built.roomCellCount} daisTop=${JSON.stringify(built.daisTop)}`);

    // C4.1b's required subject set (player/primaryThreat/objective/focalInteraction) needs a REAL
    // combat unit pair to exercise player+primaryThreat (objective/focalLight already resolve off the
    // board's own dais+lights, no combat needed). theater-shot.js's own worldPosFromEntry checks
    // explicit numeric x/z BEFORE the band/lane zone fallback, so this fixture hands ABSOLUTE world
    // positions straight through — no zone-grid translation. A first pass spread player/threat across
    // the whole room (11 world units apart) and composeShot's own safe-frame hard constraint rejected
    // EVERY candidate (verified live: metrics.candidates[].rejectReasons all ["safe_frame"]) — a real,
    // correct rejection (that pair genuinely can't both fit one beat-mode frame), not a bug; a tight
    // melee-range pair close to the room's own south edge (near the dais at (8,16), the octagon's own
    // ~12-world-unit footprint) both fits the frame AND sits close enough to that wall for it to
    // genuinely occlude at some camera yaw.
    await page.evaluate(() => {
      window.GS = window.GS || {};
      window.GS.combat = {
        grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] },
        pc: { x: 8, z: 11, down: false, obliterated: false },
        allies: [],
        foes: [{ fid: "f1", x: 10, z: 12.5, down: false, fled: false, obliterated: false, cr: 5, hp: 50, maxHp: 50, name: "Threat" }],
      };
    });
    // render the SAME two positions as real standees too (board.pieces, {slug,cellX,cellY} — the
    // established convention every other capture-*.mjs's own board.pieces assignment uses) so the
    // screenshot itself shows "the same minis" frame 02 asks for, not just the underlying ShotPlan math.
    built.board.pieces = [
      { slug: "class:fighter", cellX: 8, cellY: 11 },
      { slug: "Skeleton", cellX: 10, cellY: 12.5 },
    ];

    // shotCompose left at its product DEFAULT (ON — ITR_SHOT_COMPOSE=true, theater-boot.js) — unlike
    // capture-wall-volumes.mjs's own shotCompose:false escape hatch, THIS capture needs a real
    // S.lastShotPlan (the ShotPlan.anchors the wall-upper occlusion pass reads its subjects from).
    const mounted = await page.evaluate((board) => {
      try { window.Theater.setInteriorBoard(board); return { ok: true, meshCount: window.Theater.interiorMeshCount() }; }
      catch (e) { return { ok: false, error: e.message }; }
    }, built.board);
    metrics.mounted = mounted;
    if (!mounted.ok) throw new Error("setInteriorBoard FAILED: " + mounted.error);
    await sleep(500);

    const shotPlanDebug = await page.evaluate(() => {
      const p = window.Theater.lastShotPlan ? window.Theater.lastShotPlan() : null;
      const attempt = window.Theater.lastComposedShotAttempt ? window.Theater.lastComposedShotAttempt() : null;
      return {
        anchors: p ? p.anchors : null,
        allRejected: attempt && attempt.metrics ? attempt.metrics.allRejected : null,
        rejectReasons: attempt && attempt.metrics ? attempt.metrics.candidates.map((c) => c.rejectReasons) : null,
        error: window.Theater.lastComposedShotError ? window.Theater.lastComposedShotError() : "NO_SEAM",
      };
    });
    metrics.shotPlanAnchors = shotPlanDebug.anchors;
    metrics.shotPlanDebug = shotPlanDebug;
    log("ShotPlan anchors:", JSON.stringify(metrics.shotPlanAnchors), "debug:", JSON.stringify(shotPlanDebug));

    async function shoot(fileName) {
      const shotPath = path.join(outDir, fileName);
      // full-PAGE screenshot — same WebGL-canvas staleness fix capture-wall-volumes.mjs's own header
      // documents (elementHandle.screenshot() on this canvas returns a cached bitmap; a full-page CDP
      // screenshot reads the real composited output).
      await page.screenshot({ path: shotPath, fullPage: false });
      metrics.shots.push(fileName);
      log("captured", fileName);
    }
    async function waitForRepaint() {
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    }

    // yaw A — the freshly-mounted board at its default rotationStep.
    await shoot("yaw-a.png");
    const stateA = await readShellState(page);
    metrics.stateA = stateA;

    // rotate() alone never re-runs setInteriorBoard (it only calls placeCamera()) — setInteriorVariant
    // is the EXISTING mechanism ("null S.boardKey, replay S.lastBoard", theater-boot.js's own
    // setInteriorVariant) that forces the SAME board to rebuild at the new rotationStep, which is what
    // actually re-runs the wall-upper occlusion classify pass this capture is proving.
    await page.evaluate(() => { window.Theater.rotate(); });
    await page.evaluate(() => { window.Theater.setInteriorVariant({}); });
    await waitForRepaint();
    await sleep(150);
    await shoot("yaw-b.png");
    const stateB = await readShellState(page);
    metrics.stateB = stateB;

    // ── assertions the orchestrator can read straight off metrics.json ──────────────────────────
    const eqJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    metrics.assertions = {
      logicalStateIdentical:
        stateA && stateB &&
        eqJson(stateA.wallSegments, stateB.wallSegments) &&
        eqJson(stateA.apertures, stateB.apertures) &&
        eqJson(stateA.mountSlots, stateB.mountSlots),
      stemAlwaysOpaqueA: stateA && stateA.stemOpacity === 1 && stateA.stemVisible === true,
      stemAlwaysOpaqueB: stateB && stateB.stemOpacity === 1 && stateB.stemVisible === true,
      everyUpperMeshStaysVisibleTrueA: stateA && stateA.upper.every((u) => u.visible === true),
      everyUpperMeshStaysVisibleTrueB: stateB && stateB.upper.every((u) => u.visible === true),
      atLeastOneSegmentOpacityDiffers:
        stateA && stateB && stateA.upper.length === stateB.upper.length &&
        stateA.upper.some((u, i) => Math.abs(u.opacity - stateB.upper[i].opacity) > 1e-3),
    };
    log("assertions:", JSON.stringify(metrics.assertions));

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    metrics.consoleErrorsCount = metrics.consoleErrors.length;
    metrics.shotCount = metrics.shots.length;

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("wrote metrics.json —", metrics.shotCount, "shots,", metrics.consoleErrorsCount, "console errors");
    const failedAssertion = Object.entries(metrics.assertions).find(([, v]) => v !== true);
    if (metrics.shotCount < 2 || failedAssertion) {
      log("WARNING: gate condition failed —", failedAssertion ? failedAssertion[0] : "shot count", "— see metrics.json");
      process.exitCode = 1;
    }
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
