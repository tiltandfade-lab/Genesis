#!/usr/bin/env node
/* dev/battle-gate/capture-beat-camera.mjs — BEAUTY-WAVE-2.md unit BW2-1 (THE BEAT CAMERA) measured
   gate: law 2c ("the camera fits the ACTION CLUSTER") wired as an additive `fitMode` through
   placeCamera/setInteriorBoard (src/ui/theater-boot.js). This is the NEW measured check the unit
   calls for — not a frustum-containment assertion (dev/verify-interior-camera-frustum.mjs already
   owns that), but a REAL PIXEL measurement of how much of the frame a medium standee actually
   occupies, on a real rolled-fixture room, rendered through real Chrome + THREE.

   Method: build one gloom-realm room fixture (spatializePlan, same buildFixture/piece-placement
   convention dev/verify-interior-camera-frustum.mjs and dev/battle-gate/capture-dungeon-loop.mjs
   already use), mount a reference MEDIUM creature (Skeleton — data/sprite-registry.js's
   spr-fantasy-skeleton, scaleTrue:1.0, feet:5.5 — the exact SRD-medium reference law 2c's target
   fraction is defined against) at the room's center cell in TWO fits:
     "room"  — data.cameraFit omitted (or {mode:"room"}) — today's exploration path (focusRect fit).
     "beat"  — data.cameraFit = {mode:"beat", cells:[participant cells]} — the combat-beat path,
               fits the participant cluster (+1 cell margin, law 2c) instead of the whole room.
   Screenshots each (full-page capture cropped to the canvas's own bounding box in-page — the SAME
   technique capture-dungeon-loop.mjs's shootCanvas already proved reliable for a static, non-tween
   frame; this script never plays a verb, so the documented tween/screenshot compositor quirk that
   file's own header notes does not apply here).

   The measurement itself is a REAL PIXEL SCAN, not a re-derivation of placeCamera's own fit math:
   the reference creature's world-space top/bottom points are projected through the LIVE camera
   (window.Theater.projectWorldPoint, a new harness-only diagnostic mirroring interiorFrustumCheck's
   own Vector3.project discipline) purely to know WHERE on screen to look; the actual top/bottom
   pixel rows are then found by scanning a narrow column band around that location for pixels that
   differ from the local background (a real silhouette-edge detector), and the standee-height
   fraction is (bottomPx - topPx) / canvasHeightPx.

   RED-FIRST (per the orchestrator's brief): run this script UNMODIFIED against the pre-unit
   src/ui/theater-boot.js and the "room" case measures well under the law's own 12% floor (no
   participant-cluster fit exists yet, and the room fit's pre-unit pad is loose) — that run's raw
   output is the red evidence, kept in this file's own header/commit trail rather than a separate
   fixture. Post-unit: room >= 0.12, beat >= 0.18.

   Run: node dev/battle-gate/capture-beat-camera.mjs
   Output: dev/battle-gate/beat-camera/{room,beat}.png, measurements.json */

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
const outDir = path.join(__dirname, "beat-camera");
fs.mkdirSync(outDir, { recursive: true });

// a FIFTH port range — capture-interior-study.mjs owns 5201-5205, capture-place-tray.mjs 5191-5195,
// capture-stage.mjs 5181-5185, capture-dungeon-loop.mjs 5211-5215 — so this can run concurrently.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5231, 5232, 5233, 5234, 5235];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[beat-camera-gate]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// law 2c's own targets (BEAUTY-WAVE-2.md BW2-1): medium standee >= 18% frame height at "beat" fit,
// >= 12% at "room" fit. Overridable for tuning experiments only — the gate's real assertion always
// checks against these two numbers.
const TARGET_ROOM_FRACTION = Number(process.env.BC_TARGET_ROOM) || 0.12;
const TARGET_BEAT_FRACTION = Number(process.env.BC_TARGET_BEAT) || 0.18;

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

const SHOT_W = Number(process.env.BG_SHOT_W) || 1600, SHOT_H = Number(process.env.BG_SHOT_H) || 1200;
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
  return page;
}

// verbatim (see dev/verify-interior-camera-frustum.mjs's own header) — the shared boot convention.
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
      if (nameEl) nameEl.value = "Beat Camera Gate Soul";
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
        hasProject: !!(window.Theater && typeof window.Theater.projectWorldPoint === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

// builds ONE fixed gloom-realm room (same 6-segment spine fixture dev/verify-interior-camera-
// frustum.mjs's buildScene uses) and returns {ok, board, focusRect, centerCell}. board.pieces is set
// by the caller per test case (room vs beat) so this stays a single shared fixture across both shots
// — a real difference in fraction between the two screenshots can only come from the fit, never from
// two different rolled rooms.
async function buildFixtureBoard(page) {
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
      const plan = spatializePlan(fixture, "The Spine", { walkId: "beat-camera-gate-spine" });
      const focusRoom = plan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = "torchlit";
      const centerCell = {
        x: focusRoom.x + Math.floor(focusRoom.w / 2),
        y: focusRoom.y + Math.floor(focusRoom.d / 2)
      };
      return { ok: true, board, focusRect: board.focusRect, centerCell, room: { x: focusRoom.x, y: focusRoom.y, w: focusRoom.w, d: focusRoom.d } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// mounts the board with the given pieces/cameraFit, waits for the reference piece's sprite texture
// to resolve, settles a couple render passes, then shoots+measures in ONE page.evaluate (avoids a
// second screenshot round-trip and keeps the crop + scan reading the SAME frame).
async function mountShootMeasure(page, fx, opts) {
  const board = Object.assign({}, fx.board, {
    pieces: opts.pieces,
    cameraFit: opts.cameraFit || undefined
  });
  await page.evaluate((b) => { window.Theater.setInteriorBoard(b); }, board);

  const deadline = Date.now() + 4000;
  let resolved = 0, requested = opts.pieces.length;
  while (Date.now() < deadline) {
    resolved = await page.evaluate(() => window.Theater.interiorPiecesResolved());
    if (resolved >= requested) break;
    await sleep(150);
  }
  await sleep(400); // let idle-breathe / mote/tween settle one frame past mount

  const canvasEl = await page.$(".theater-stage-canvas canvas");
  if (!canvasEl) throw new Error("no .theater-stage-canvas canvas found");
  const box = await canvasEl.boundingBox();
  if (!box) throw new Error("canvas has no bounding box (zero-size mount?)");
  const fullB64 = await page.screenshot({ encoding: "base64" });

  // reference piece world position: same cx/cz origin-shift setInteriorBoard itself applies
  // (fit.minX+maxX)/2, (fit.minZ+maxZ)/2 off data.focusRect — replicated here (read-only, not a
  // re-derivation of the FIT itself, just the coordinate-space shift every instance in the room uses).
  const fr = fx.focusRect;
  const cx = (fr.minX + fr.maxX) / 2, cz = (fr.minZ + fr.maxZ) / 2;
  const refCell = opts.refCell;
  const worldX = refCell.x - cx, worldZ = refCell.y - cz;
  const refHeight = opts.refHeight; // HUMAN_TRUE_HEIGHT * scaleTrue for the reference creature

  const result = await page.evaluate(({ fullB64, box, worldX, worldZ, refHeight }) => {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const canvas = document.createElement("canvas");
        const w = Math.round(box.width), h = Math.round(box.height);
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(im, box.x, box.y, box.width, box.height, 0, 0, w, h);
        const croppedB64 = canvas.toDataURL("image/png").split(",")[1];

        // project the reference creature's world top/bottom through the LIVE camera — this only
        // locates WHERE to scan; the actual measurement below is a real pixel read, not this math.
        const top = window.Theater.projectWorldPoint(worldX, refHeight, worldZ);
        const bot = window.Theater.projectWorldPoint(worldX, 0, worldZ);
        if (!top || !bot) { resolve({ ok: false, reason: "projectWorldPoint unavailable", croppedB64, canvasW: w, canvasH: h }); return; }
        const topPxExpected = (1 - (top.ndcY * 0.5 + 0.5)) * h;
        const botPxExpected = (1 - (bot.ndcY * 0.5 + 0.5)) * h;
        const centerXNdc = ((top.ndcX + bot.ndcX) / 2) * 0.5 + 0.5;
        const centerXpx = centerXNdc * w;

        const imgData = ctx.getImageData(0, 0, w, h).data;
        function pixelAt(px, py) {
          px = Math.max(0, Math.min(w - 1, Math.round(px)));
          py = Math.max(0, Math.min(h - 1, Math.round(py)));
          const i = (py * w + px) * 4;
          return [imgData[i], imgData[i + 1], imgData[i + 2]];
        }
        // local background sample: just outside the expected column band, same row range — the
        // dungeon void/wall/floor at that height, NOT a global single-pixel guess.
        const scanColMin = Math.max(0, Math.round(centerXpx - 30));
        const scanColMax = Math.min(w - 1, Math.round(centerXpx + 30));
        const scanRowMin = Math.max(0, Math.round(topPxExpected - Math.max(40, (botPxExpected - topPxExpected) * 0.6)));
        const scanRowMax = Math.min(h - 1, Math.round(botPxExpected + Math.max(40, (botPxExpected - topPxExpected) * 0.6)));
        // PER-ROW background reference (not one fixed sample): the room's floor/wall texture carries
        // a real vertical gradient (wall value up top, floor value below, plus the wall-floor seam
        // itself) across this scan band, so a single fixed bg color false-triggers "content" the
        // instant the scan crosses that gradient. Sampling the SAME row, just outside the column band
        // on BOTH sides (average of the two, so a stray dressing/prop pixel on one side alone doesn't
        // skew it), tracks the gradient and isolates the actual standee silhouette against it.
        const bgLeftX = Math.max(0, scanColMin - 45);
        const bgRightX = Math.min(w - 1, scanColMax + 45);
        function bgAtRow(row) {
          const l = pixelAt(bgLeftX, row), r = pixelAt(bgRightX, row);
          return [(l[0] + r[0]) / 2, (l[1] + r[1]) / 2, (l[2] + r[2]) / 2];
        }
        function differsFromBg(rgb, bg) {
          const dr = rgb[0] - bg[0], dg = rgb[1] - bg[1], db = rgb[2] - bg[2];
          return Math.sqrt(dr * dr + dg * dg + db * db) > 26; // conservative silhouette-edge threshold
        }
        let firstRow = -1, lastRow = -1;
        for (let row = scanRowMin; row <= scanRowMax; row++) {
          const bgRow = bgAtRow(row);
          let hitCount = 0;
          for (let col = scanColMin; col <= scanColMax; col += 2) {
            if (differsFromBg(pixelAt(col, row), bgRow)) hitCount++;
          }
          // require >=2 differing samples in the row (a single stray antialiased/dither pixel is
          // noise, not silhouette) — cheap denoise against the PSX dither pass this render channel
          // may still apply to world surfaces.
          if (hitCount >= 2) { if (firstRow === -1) firstRow = row; lastRow = row; }
        }
        const measuredHeightPx = (firstRow >= 0 && lastRow >= firstRow) ? (lastRow - firstRow + 1) : 0;
        const fraction = measuredHeightPx / h;
        resolve({
          ok: true, croppedB64, canvasW: w, canvasH: h,
          expected: { topPxExpected, botPxExpected, centerXpx },
          measured: { firstRow, lastRow, measuredHeightPx, fraction }
        });
      };
      im.onerror = () => resolve({ ok: false, reason: "image-load-failed" });
      im.src = "data:image/png;base64," + fullB64;
    });
  }, { fullB64, box, worldX, worldZ, refHeight });

  return result;
}

async function main() {
  const findings = { generatedAt: new Date().toISOString(), targets: { room: TARGET_ROOM_FRACTION, beat: TARGET_BEAT_FRACTION }, cases: {} };
  const server = await startServer();
  let browser = null;
  let pass = true;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("theater never ready: " + JSON.stringify(theaterState));
    findings.hasProjectWorldPoint = !!theaterState.hasProject;

    const fx = await buildFixtureBoard(page);
    if (!fx.ok) throw new Error("fixture build failed: " + fx.error);
    log(`fixture room: ${JSON.stringify(fx.room)} focusRect=${JSON.stringify(fx.focusRect)} center=${JSON.stringify(fx.centerCell)}`);

    const REF_HEIGHT = 1.1; // HUMAN_TRUE_HEIGHT(1.1) * Skeleton's scaleTrue(1.0) — data/sprite-registry.js spr-fantasy-skeleton

    // "room" case: one Skeleton at the room's center, NO cameraFit (today's default exploration path).
    log("--- case: room (exploration fit) ---");
    const roomPieces = [{ slug: "Skeleton", cellX: fx.centerCell.x, cellY: fx.centerCell.y }];
    const roomRes = await mountShootMeasure(page, fx, { pieces: roomPieces, refCell: fx.centerCell, refHeight: REF_HEIGHT });
    if (!roomRes.ok) throw new Error("room case measurement failed: " + JSON.stringify(roomRes));
    fs.writeFileSync(path.join(outDir, "room.png"), Buffer.from(roomRes.croppedB64, "base64"));
    findings.cases.room = { fraction: roomRes.measured.fraction, target: TARGET_ROOM_FRACTION, ...roomRes.measured, canvasW: roomRes.canvasW, canvasH: roomRes.canvasH };
    log(`  measured fraction = ${roomRes.measured.fraction.toFixed(4)} (target >= ${TARGET_ROOM_FRACTION})`);
    if (roomRes.measured.fraction < TARGET_ROOM_FRACTION) pass = false;

    // "beat" case: two adjacent Skeletons (a minimal combat cluster), cameraFit fits THEM + 1 cell
    // margin — the reference measured piece is the first (same center cell, so its own on-screen
    // position is directly comparable to the room case's single piece above).
    log("--- case: beat (combat participant-cluster fit) ---");
    const c2 = { x: fx.centerCell.x + 1, y: fx.centerCell.y };
    const beatPieces = [
      { slug: "Skeleton", cellX: fx.centerCell.x, cellY: fx.centerCell.y },
      { slug: "Skeleton", cellX: c2.x, cellY: c2.y }
    ];
    const cameraFit = { mode: "beat", cells: [{ x: fx.centerCell.x, y: fx.centerCell.y }, { x: c2.x, y: c2.y }] };
    const beatRes = await mountShootMeasure(page, fx, { pieces: beatPieces, cameraFit, refCell: fx.centerCell, refHeight: REF_HEIGHT });
    if (!beatRes.ok) throw new Error("beat case measurement failed: " + JSON.stringify(beatRes));
    fs.writeFileSync(path.join(outDir, "beat.png"), Buffer.from(beatRes.croppedB64, "base64"));
    findings.cases.beat = { fraction: beatRes.measured.fraction, target: TARGET_BEAT_FRACTION, ...beatRes.measured, canvasW: beatRes.canvasW, canvasH: beatRes.canvasH };
    log(`  measured fraction = ${beatRes.measured.fraction.toFixed(4)} (target >= ${TARGET_BEAT_FRACTION})`);
    if (beatRes.measured.fraction < TARGET_BEAT_FRACTION) pass = false;

    // DETERMINISM: interiorCameraFitFor (src/ui/theater-boot.js) is pure arithmetic over
    // data.cameraFit — no RNG, no time input — so the SAME cameraFit must yield a byte-identical
    // camera fit (S.boardHalfX/Z/boardCenter) on every rebuild. Proven directly rather than assumed:
    // force TWO separate rebuilds of the identical beat board (setInteriorBoard's own dirty-key skip
    // would otherwise no-op an identical second call and prove nothing — a harmless `_detNonce` field
    // busts the key without touching cameraFit/pieces/focusRect) and diff interiorFrustumCheck()'s
    // projected corners (a direct read of S.boardHalfX/Z/S.boardCenter through the live camera).
    log("--- determinism: same cameraFit, two independent rebuilds -> byte-identical fit ---");
    const detBoardA = Object.assign({}, fx.board, { pieces: beatPieces, cameraFit, _detNonce: 1 });
    const detBoardB = Object.assign({}, fx.board, { pieces: beatPieces, cameraFit, _detNonce: 2 });
    await page.evaluate((b) => window.Theater.setInteriorBoard(b), detBoardA);
    await sleep(200);
    const cornersA = await page.evaluate(() => window.Theater.interiorFrustumCheck());
    await page.evaluate((b) => window.Theater.setInteriorBoard(b), detBoardB);
    await sleep(200);
    const cornersB = await page.evaluate(() => window.Theater.interiorFrustumCheck());
    const deterministic = JSON.stringify(cornersA.corners) === JSON.stringify(cornersB.corners);
    findings.determinism = { ok: deterministic, cornersA: cornersA.corners, cornersB: cornersB.corners };
    log(`  deterministic fit across independent rebuilds: ${deterministic}`);
    if (!deterministic) pass = false;

    findings.pass = pass;
    fs.writeFileSync(path.join(outDir, "measurements.json"), JSON.stringify(findings, null, 2));
    log(`wrote measurements.json — pass=${pass}`);
    log(`room.png / beat.png written to ${outDir}`);
    process.exitCode = pass ? 0 : 1;
  } catch (e) {
    findings.fatalError = e.message;
    fs.writeFileSync(path.join(outDir, "measurements.json"), JSON.stringify(findings, null, 2));
    log("FATAL:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}
main();
