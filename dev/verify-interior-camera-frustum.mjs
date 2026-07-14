#!/usr/bin/env node
/* dev/verify-interior-camera-frustum.mjs — VP0/GRAPHICS-ENGINE.md law 2c (FRAMING LAW) verify item:
   "the camera fits the ACTION CLUSTER fully in frustum" — asserted directly against a real Chrome +
   THREE render (this claim needs the LIVE camera's view*projection matrix; a jsdom/pure-math harness
   would just be re-deriving placeCamera's own math rather than proving it). Boots the same real
   in-session/interior-board path dev/battle-gate/capture-two-flag-card.mjs uses (server/Chrome/boot
   conventions copied verbatim — see that file's own header for the "why").

   RED-FIRST (per the orchestrator's brief): before asserting the fit HOLDS, this script first proves
   the check is load-bearing by zooming the camera in aggressively (window.Theater.zoom -> S.zoomLevel,
   the SAME lever placeCamera's own fit multiplies by) until src/ui/theater-boot.js's own
   window.Theater.interiorFrustumCheck() reports a corner outside [-1,1] — i.e. the check can and does
   fail when the fit is actually broken, so its later green isn't vacuous. Zoom is then reset and the
   REAL assertion (default zoom, both camera modes) runs.

   BEAUTY-WAVE-2.md BW2-1 (THE BEAT CAMERA) EXTENSION: the GREEN section now also runs BOTH
   data.cameraFit modes ("room" — the default/absent case, byte-identical in shape to the pre-unit
   fit — and "beat" — data.cameraFit={mode:"beat",cells:[participant cells]}, the new law-2c
   participant-cluster fit) at each camera mode, asserting the SAME "every action-cluster corner
   stays in frustum" claim holds for "beat" too — interiorFrustumCheck reads S.boardHalfX/Z/
   S.boardCenter, which now vary by fitMode, so this is a real assertion on the new code path, not a
   re-run of the old one under a new label.

   Run: node dev/verify-interior-camera-frustum.mjs */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label); } }
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
      if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; }
      continue;
    }
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}
// BEAUTY-WAVE-4.md MF-1 (CAMERA TWEENS): setInteriorBoard's own camera fit now GLIDES (280-350ms,
// window.Theater.tweensLive() tracks the live count) instead of snapping — this harness's own claim
// ("the action cluster fits fully in frustum") is about the SETTLED fit, so every check below waits
// for the glide to finish first (this is the "settle-await" the orchestrator's brief calls for,
// mirrored from the loop-gate's own capture scripts). MF-1's own verify script (verify-mf1-camera-
// tweens.mjs) is what actually asserts the frustum holds at EVERY mid-tween sample frame — this file
// stays scoped to its original pre-existing claim about the final, settled pose.
async function settleCameraTween(page) {
  // generous timeout: the tween itself is only ~320ms, but a cold first frame (textures/shaders still
  // warming up right after boot) can stall the rAF loop's own cadence well past that on a loaded CI
  // box — this is a settle WAIT, not a duration assertion (verify-mf1-camera-tweens.mjs's own
  // fake-clock harness is what actually asserts the 280-350ms band), so a generous cap here costs
  // nothing but a slower run on the rare slow frame.
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
}

async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
}

// same bootToInSession as capture-two-flag-card.mjs (verbatim — see that file's own header comment).
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
      if (nameEl) nameEl.value = "Frustum Gate Soul";
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
async function buildScene(page) {
  return await page.evaluate(() => {
    try {
      function buildFixture(n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const edges = []; for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
        const depth = { [ids[0]]: 0 }; const q = [ids[0]]; let head = 0;
        while (head < q.length) { const cur = q[head++]; (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } }); }
        return ids.map((id, i) => ({ id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0, exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal" }));
      }
      const fixture = buildFixture(6);
      const plan = spatializePlan(fixture, "The Spine", { walkId: "frustum-gate-spine" });
      const focusRoom = plan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = "torchlit";
      function piecePositions(room, count) {
        const inX = Math.max(room.x + 1, room.x), inY = Math.max(room.y + 1, room.y);
        const maxX = Math.max(inX, room.x + room.w - 2), maxY = Math.max(inY, room.y + room.d - 2);
        return [{ x: inX, y: inY }, { x: maxX, y: inY }, { x: inX, y: maxY }, { x: maxX, y: maxY }].slice(0, count);
      }
      const pieces = ["Ogre Zombie", "Skeleton", "Zombie", "Guard"];
      const positions = piecePositions(focusRoom, pieces.length);
      board.pieces = pieces.map((slug, i) => ({ slug, cellX: positions[i].x, cellY: positions[i].y }));
      return { ok: true, board, positions };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

async function main() {
  console.log("[verify-interior-camera-frustum]");
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("theater never ready: " + JSON.stringify(theaterState));

    const built = await buildScene(page);
    if (!built.ok) throw new Error("scene build failed: " + built.error);

    // BW2-1: the "beat" board is the SAME room/pieces, plus data.cameraFit fitting those 4 piece
    // cells (+1 cell margin, law 2c) instead of the whole room — a real second fit shape to assert
    // frustum containment against, not just a relabeled copy of the room board.
    const beatBoard = Object.assign({}, built.board, {
      cameraFit: { mode: "beat", cells: built.positions.map((p) => ({ x: p.x, y: p.y })) }
    });
    const boardFor = (fitMode) => (fitMode === "beat" ? beatBoard : built.board);

    console.log("\n[RED-FIRST — the frustum check must be able to FAIL before trusting its green]");
    for (const camMode of ["ortho", "persp"]) {
      for (const fitMode of ["room", "beat"]) {
        await page.evaluate((flags) => window.Theater.setInteriorVariant(flags), { camMode });
        await page.evaluate((board) => window.Theater.setInteriorBoard(board), boardFor(fitMode));
        await settleCameraTween(page);
        // zoom "in" repeatedly: S.zoomLevel shrinks toward ZOOM_MIN, which placeCamera multiplies its
        // fit distance/frustum by — the SAME lever both camera branches read (this file's own comment
        // on the ortho/persp camDist lines), so this is a real stress on the fit, not a synthetic prop.
        for (let i = 0; i < 12; i++) await page.evaluate(() => window.Theater.zoom(1));
        const redCheck = await page.evaluate(() => window.Theater.interiorFrustumCheck());
        ok(redCheck.ok === false, `${camMode}/${fitMode}: aggressive zoom-in DOES break the frustum fit (proves the check is load-bearing) — ok=${redCheck.ok}`);
        // reset zoom back to the board's own auto-fit for the real assertion below.
        for (let i = 0; i < 12; i++) await page.evaluate(() => window.Theater.zoom(-1));
      }
    }

    console.log("\n[GREEN — law 2c: the action cluster fits fully in frustum at normal zoom, both camera modes x both fitModes]");
    for (const camMode of ["ortho", "persp"]) {
      for (const fitMode of ["room", "beat"]) {
        await page.evaluate((flags) => window.Theater.setInteriorVariant(flags), { camMode });
        await page.evaluate((board) => window.Theater.setInteriorBoard(board), boardFor(fitMode));
        await settleCameraTween(page);
        // BW2-1: this fixture's own roster includes an Ogre Zombie (Large, real height ~1.9 world
        // units, well above interiorFrustumCheck's generic 1.1 default) — check against the board's
        // OWN computed tallest-participant height (window.Theater.interiorFitMaxHeight(), read off the
        // live S.interiorFitMaxHeight placeCamera actually fit to), not the generic default, so this
        // assertion is honest about the mixed-size roster it's built from.
        const maxHeight = await page.evaluate(() => window.Theater.interiorFitMaxHeight());
        const check = await page.evaluate((h) => window.Theater.interiorFrustumCheck(h), maxHeight);
        const camIsPersp = await page.evaluate(() => window.Theater.cameraIsPerspective());
        ok(camIsPersp === (camMode === "persp"), `${camMode}/${fitMode}: camera type resolved correctly (isPerspective=${camIsPersp})`);
        ok(check.ok === true, `${camMode}/${fitMode}: all 8 action-cluster corner points (headHeight=${maxHeight.toFixed(2)}) project within NDC [-1,1] — ${JSON.stringify(check.corners.filter((c) => !c.inFrustum))}`);
      }
    }

    // BW2-1 REGRESSION (found live during this unit's own build): an ELONGATED beat cluster (a melee
    // lined up along one axis, not a square huddle) carrying a TALL outlier participant broke
    // containment even at headHeight=0 — a pre-existing gap in placeCamera's screenHalfWidth/Height
    // support-function estimate (it only ever held for a roughly-square, generously-padded box before
    // "beat" mode existed to make a tight, possibly-elongated one). Locked in here so it can never
    // silently regress: a 4-cell-wide x 1-cell-deep cluster (Ogre Zombie + 3 mediums) in a real
    // (non-clamped, big-enough) room, both camera modes.
    console.log("\n[REGRESSION — elongated beat cluster + a tall (Large) outlier participant]");
    const elongated = await page.evaluate(() => {
      function buildFixture(n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const edges = []; for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
        const depth = { [ids[0]]: 0 }; const q = [ids[0]]; let head = 0;
        while (head < q.length) { const cur = q[head++]; (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } }); }
        return ids.map((id, i) => ({ id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0, exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal" }));
      }
      const fixture = buildFixture(14);
      const plan = spatializePlan(fixture, "The Spine", { walkId: "frustum-gate-elongated" });
      // the biggest room in this 14-segment fixture (big enough that a 4-cell-wide cluster + margin
      // isn't clamped against the room's own walls — a clamped cluster would understate this box's
      // real, intended elongation and mask the regression).
      const room = plan.rooms.reduce((a, b) => (a.w * a.d > b.w * b.d ? a : b));
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: room.segNum, radius: 1 });
      board.lightProfile = "torchlit";
      const cx0 = room.x + Math.floor(room.w / 2), cy0 = room.y + Math.floor(room.d / 2);
      const positions = [[-3, 0], [-1, 0], [1, 0], [3, 0]].map(([dx, dy]) => ({ x: cx0 + dx, y: cy0 + dy }));
      const foes = ["Ogre Zombie", "Skeleton", "Zombie", "Guard"]; // Large + 3 Medium
      board.pieces = foes.map((slug, i) => ({ slug, cellX: positions[i].x, cellY: positions[i].y }));
      board.cameraFit = { mode: "beat", cells: positions.map((p) => ({ x: p.x, y: p.y })) };
      return { ok: true, board };
    });
    for (const camMode of ["ortho", "persp"]) {
      await page.evaluate((flags) => window.Theater.setInteriorVariant(flags), { camMode });
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), elongated.board);
      await settleCameraTween(page);
      const maxHeight = await page.evaluate(() => window.Theater.interiorFitMaxHeight());
      const check = await page.evaluate((h) => window.Theater.interiorFrustumCheck(h), maxHeight);
      ok(check.ok === true, `${camMode}/beat elongated+tall: all 8 corners (headHeight=${maxHeight.toFixed(2)}) project within NDC [-1,1] — ${JSON.stringify(check.corners.filter((c) => !c.inFrustum))}`);
    }

    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail > 0 ? 1 : 0;
  } catch (e) {
    console.error("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}
main();
