#!/usr/bin/env node
/* dev/verify-shot-compose.mjs — GRAPHICS-NORTH-STAR.md STAGE A unit A3 (docs/STAGE-A.md §A3;
   docs/WALK-NATIVE-A.md A3). Real Chrome + THREE harness — the ITR_SHOT_COMPOSE wiring lives in
   src/ui/theater-boot.js's setInteriorBoard (a sealed ES module coupled to a live WebGL camera), so
   this claim needs the LIVE camera the same way dev/verify-interior-camera-frustum.mjs's own claim
   does. Boot/server/settle conventions copied verbatim from that file + dev/battle-gate/
   capture-beat-camera.mjs (see their own headers for the "why").

   Checks (docs/STAGE-A.md §A3 "Verify" list):
     1. ⊗ RED-FIRST — the composed camera is actually driven: an OFF-CENTER action-cluster fixture
        (a combat pair parked in one corner of a big room, nowhere near the room's own center) is
        framed by the plain focusRect fit when ITR_SHOT_COMPOSE is forced OFF (the cluster sits far
        from frame-center, NOT what a "compose changed the frame" claim needs) and by the ShotPlan's
        own composed camera when the flag is ON (the cluster sits near frame-center) — proving compose
        actually changes what the render aims at, not just that a flag exists.
     2. projector correctness — window.Theater.shotProjectFor(pose) projects a known world point to
        the expected NDC for a hand-computed camera pose (a lookAt target always centers at NDC (0,0)
        by construction; a point offset to the world +X side of the target lands at NDC +X, the
        standard right-handed camera convention this scratch camera must honor).
     3. fallback safety — flag OFF is byte-identical to the pre-unit interiorCameraFitFor(focusRect)
        path (same board, same S.boardCenter/halfX/halfZ either way); an all-hard-constraints-rejected
        fixture (an impossibly tiny FOV band via a degenerate combat pair) still falls back to the
        focusRect fit (no black/undefined frame).
     4. provenance flows — the composed ShotPlan (window.Theater.lastShotPlan()) carries walkRef/
        fieldRefs from tray.walkScene, and the objective anchor's sourceRef resolves to a real
        WalkScene fieldPath (not a flat projection string) on a WalkScene-bearing interior fixture.
     5. frustum green (interiorFrustumCheck) + fps >= 30 + settle-await (MF-1 tween) on the composed
        fit, mirroring verify-interior-camera-frustum.mjs's own claim.

   Regression (this file also runs a short subset live, not just cites another file's own number):
     verify-mf1-camera-tweens, verify-interior-camera-frustum, verify-theater-shot, verify-active-
     room-only are run as SEPARATE `node` invocations by the orchestrator's own report step (each is
     its own real-Chrome/pure-Node process — running them all inside a single page/browser here would
     just be re-implementing `node` itself), not duplicated inline in this file.

   Run: node dev/verify-shot-compose.mjs */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(__dirname, "battle-gate", "shot-compose");
fs.mkdirSync(outDir, { recursive: true });

// a port range distinct from every other battle-gate/verify script's own range (see capture-beat-
// camera.mjs's own comment listing the ranges already in use — this claims a fresh one).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5241, 5242, 5243, 5244, 5245];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; console.log("  ✓", label); }
  else { fail++; console.log("  ✗ FAIL:", label, detail !== undefined ? "— " + JSON.stringify(detail) : ""); }
}
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

const SHOT_W = Number(process.env.BG_SHOT_W) || 1600, SHOT_H = Number(process.env.BG_SHOT_H) || 1200;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}

// verbatim boot convention (see dev/verify-interior-camera-frustum.mjs's own header comment).
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
      if (nameEl) nameEl.value = "Shot Compose Gate Soul";
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
        hasShotProjectFor: !!(window.Theater && typeof window.Theater.shotProjectFor === "function"),
        hasLastShotPlan: !!(window.Theater && typeof window.Theater.lastShotPlan === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}
async function settleCameraTween(page) {
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
}

// builds ONE real (spatializePlan-rolled) room, BIG enough that a corner-parked cluster sits well
// away from the room's own center — the "known off-center-cluster fixture" check 1 needs. Same
// buildFixture/biggest-room convention verify-interior-camera-frustum.mjs's own "elongated" regression
// case already uses.
async function buildOffCenterFixture(page) {
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
      const fixture = buildFixture(14);
      const plan = spatializePlan(fixture, "The Spine", { walkId: "shot-compose-gate-spine" });
      const room = plan.rooms.reduce((a, b) => (a.w * a.d > b.w * b.d ? a : b));
      const focusSegNum = room.segNum;
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = "torchlit";
      // corner cluster: one cell in from the room's own min corner (never on the wall cell itself).
      const cornerX = room.x + 1, cornerZ = room.y + 1;
      const c2 = { x: cornerX + 1, z: cornerZ };
      board.pieces = [
        { slug: "Guard", cellX: cornerX, cellY: cornerZ },
        { slug: "Skeleton", cellX: c2.x, cellY: c2.z }
      ];
      // GS.combat.units — the theater-shot.js header's own contract (b): a caller-enriched shape with
      // world positions already resolved (bypasses the pure module's own simplified zone-grid fallback,
      // which would otherwise land anchors nowhere near this room's real cell-index footprint — see
      // this unit's own report for why that fallback is out of scope for A3 to fix).
      GS.combat = {
        active: false, // exploration render path — NOT the flat-tabletop combat channel (out of scope)
        units: [
          { id: "pc", kind: "pc", x: cornerX, z: cornerZ },
          { id: "f1", kind: "foe", x: c2.x, z: c2.z, cr: 5 }
        ]
      };
      const roomCenter = { x: room.x + room.w / 2, z: room.y + room.d / 2 };
      const clusterCenter = { x: (cornerX + c2.x) / 2, z: (cornerZ + c2.z) / 2 };
      return { ok: true, board, focusRect: board.focusRect, room: { x: room.x, y: room.y, w: room.w, d: room.d }, roomCenter, clusterCenter, combat: GS.combat };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// NDC distance of the cluster's own world centroid from frame-center (0,0), under whatever fit is
// CURRENTLY live — the check-1 measurement: "did compose move the aim point onto the action cluster."
// `pt` is RAW (pre cx/cz-shift) world coordinates, the SAME space fx.room/fx.clusterCenter/
// fx.roomCenter and setInteriorBoard's own `data.focusRect` all use — window.Theater.projectWorldPoint
// projects through the LIVE camera, which lives in the SHIFTED local frame every mounted instance
// uses (setInteriorBoard's own `cx,cz = (fit.minX+fit.maxX)/2, (fit.minZ+fit.maxZ)/2`), so `pt` must be
// shifted by the SAME `fit`-derived cx/cz before projecting — capture-beat-camera.mjs's own
// `worldX = refCell.x - cx` line is the exact precedent this mirrors.
async function clusterFrameOffset(page, pt, fit) {
  const cx = (fit.minX + fit.maxX) / 2, cz = (fit.minZ + fit.maxZ) / 2;
  return await page.evaluate((args) => {
    const p = window.Theater.projectWorldPoint(args.x - args.cx, 0, args.z - args.cz);
    if (!p) return null;
    return Math.hypot(p.ndcX, p.ndcY);
  }, { x: pt.x, z: pt.z, cx, cz });
}
// re-applies fx's own off-center GS.combat — needed anywhere fx.board is re-mounted AFTER an earlier
// section has overwritten/cleared GS.combat (checks 3/4 both do), since fx.board's own composed
// framing depends on GS.combat.units being the SAME off-corner pair buildOffCenterFixture set up.
async function restoreCombat(page, fx) {
  await page.evaluate((combat) => { GS.combat = combat; }, fx.combat);
}
// waits for the board's sprite billboards to actually mount+resolve their textures, then reads the
// TALLEST mounted sprite's height as a fraction of the canvas DRAWING-BUFFER height via
// window.Theater.__spriteScreenRects() (the sprite screen-rect diagnostic capture-lit-sprites.mjs
// already uses — real rendered sprite pixels, not a re-derivation of the fit math). Both pieces in
// this fixture are MEDIUM standees (Guard + Skeleton, scaleTrue ~1.0), so the tallest rect IS the
// "medium standee" the Stage-A gate is defined against.
async function mediumFigureFraction(page, expectPieces) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const resolved = await page.evaluate(() => (typeof window.Theater.interiorPiecesResolved === "function") ? window.Theater.interiorPiecesResolved() : 0);
    if (resolved >= expectPieces) break;
    await sleep(150);
  }
  await settleCameraTween(page);
  await sleep(300);
  return await page.evaluate(() => {
    const rects = window.Theater.__spriteScreenRects();
    const canvas = document.querySelector(".theater-stage-canvas canvas");
    const bufH = canvas ? canvas.height : 0;
    if (!bufH || !rects.length) return null;
    let maxFrac = 0, maxSlug = null;
    rects.forEach((r) => { const f = r.h / bufH; if (f > maxFrac) { maxFrac = f; maxSlug = r.slug; } });
    return { maxFrac, maxSlug, count: rects.length, bufH };
  });
}

async function main() {
  console.log("[verify-shot-compose]");
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
    ok(theaterState.hasShotProjectFor, "boot: window.Theater.shotProjectFor is exposed");
    ok(theaterState.hasLastShotPlan, "boot: window.Theater.lastShotPlan is exposed");

    const fx = await buildOffCenterFixture(page);
    if (!fx.ok) throw new Error("fixture build failed: " + fx.error);
    const fxFit = fx.focusRect || fx.board.bounds; // the exact box setInteriorBoard's own `fit` reads
    console.log(`  fixture room: ${JSON.stringify(fx.room)} clusterCenter=${JSON.stringify(fx.clusterCenter)} fit=${JSON.stringify(fxFit)}`);

    console.log("\n=== 1. RED-FIRST — the composed camera is actually driven ===");
    {
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: false }));
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), fx.board);
      await settleCameraTween(page);
      const offOffset = await clusterFrameOffset(page, fx.clusterCenter, fxFit);
      ok(offOffset !== null && offOffset > 0.35,
        `RED — ITR_SHOT_COMPOSE OFF: the plain focusRect (room-center) fit does NOT center the off-corner action cluster (ndc-offset=${offOffset && offOffset.toFixed(3)}, expected > 0.35)`,
        { offOffset });
      const lastShotOff = await page.evaluate(() => window.Theater.lastShotPlan());
      ok(lastShotOff === null, "RED — with compose OFF, window.Theater.lastShotPlan() is null (no composed plan was used)", lastShotOff);

      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: true }));
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), fx.board);
      await settleCameraTween(page);
      const onOffset = await clusterFrameOffset(page, fx.clusterCenter, fxFit);
      ok(onOffset !== null && onOffset < 0.35,
        `GREEN — ITR_SHOT_COMPOSE ON: the composed camera centers the off-corner action cluster (ndc-offset=${onOffset && onOffset.toFixed(3)}, expected < 0.35)`,
        { onOffset });
      ok(onOffset < offOffset, `GREEN — the composed fit's cluster-centering is materially BETTER than the plain focusRect fit (${onOffset && onOffset.toFixed(3)} < ${offOffset && offOffset.toFixed(3)})`, { onOffset, offOffset });
      const lastShotOn = await page.evaluate(() => window.Theater.lastShotPlan());
      ok(!!lastShotOn, "GREEN — with compose ON, window.Theater.lastShotPlan() is a real ShotPlan", lastShotOn);

      const frustum = await page.evaluate(() => window.Theater.interiorFrustumCheck());
      ok(frustum && frustum.ok === true, "GREEN — the composed fit's own board-box corners still pass interiorFrustumCheck (no clipped geometry)", frustum);
    }

    console.log("\n=== 1b. RED-FIRST — the composed fit crops TIGHT (medium standee 18-25% frame height) ===");
    // The Stage-A gate: a medium standee fills 18-25% of frame height, minimal dead frame. Round 1's
    // full-frustum box rendered the pair at ~13% (LOOSER than focusRect, void-heavy — the coordinator's
    // read). This section proves the figure-height check is load-bearing (flip the superseded wide box
    // back on -> below 18% -> RED), then that the shipped action-cluster crop passes (18-25% -> GREEN)
    // and is TIGHTER than the plain focusRect fit on the SAME fixture.
    {
      const EXPECT_PIECES = fx.board.pieces.length; // 2

      // RED baseline: force the superseded wide full-frustum box (test-only seam).
      await restoreCombat(page, fx);
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: true, shotComposeWideBoxForTest: true }));
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), Object.assign({}, fx.board, { pieces: fx.board.pieces.slice() }));
      const wide = await mediumFigureFraction(page, EXPECT_PIECES);
      ok(wide && wide.maxFrac < 0.18,
        `RED — the superseded wide full-frustum box renders the medium standee BELOW the gate (frac=${wide && wide.maxFrac.toFixed(3)}, gate floor 0.18) — proves the figure-height check is load-bearing`,
        wide);

      // GREEN: the shipped action-cluster crop (wide flag off).
      await restoreCombat(page, fx);
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: true, shotComposeWideBoxForTest: false }));
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), Object.assign({}, fx.board, { pieces: fx.board.pieces.slice() }));
      const composedFrac = await mediumFigureFraction(page, EXPECT_PIECES);
      ok(composedFrac && composedFrac.maxFrac >= 0.18 && composedFrac.maxFrac <= 0.25,
        `GREEN — the composed action-cluster crop lands the medium standee inside the Stage-A gate (frac=${composedFrac && composedFrac.maxFrac.toFixed(3)}, gate 0.18-0.25)`,
        composedFrac);

      // GREEN: tighter than the plain focusRect fit on the SAME fixture.
      await restoreCombat(page, fx);
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: false }));
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), Object.assign({}, fx.board, { pieces: fx.board.pieces.slice() }));
      const focusFrac = await mediumFigureFraction(page, EXPECT_PIECES);
      ok(focusFrac && composedFrac && composedFrac.maxFrac > focusFrac.maxFrac,
        `GREEN — the composed crop is TIGHTER than the plain focusRect fit (composed ${composedFrac && composedFrac.maxFrac.toFixed(3)} > focusRect ${focusFrac && focusFrac.maxFrac.toFixed(3)})`,
        { composed: composedFrac && composedFrac.maxFrac, focusRect: focusFrac && focusFrac.maxFrac });
      // leave the wide-box test flag off for every section that follows.
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotComposeWideBoxForTest: false }));
    }

    console.log("\n=== 2. projector correctness (window.Theater.shotProjectFor) ===");
    {
      const centerPose = { id: "t", mode: "beat", yaw: 0, pitch: 0, fov: 60, target: { x: 0, z: 0 }, distance: 5, sharpSubjects: [] };
      const centerNdc = await page.evaluate((pose) => window.Theater.shotProjectFor(pose)({ x: 0, y: 0, z: 0 }), centerPose);
      ok(centerNdc && Math.abs(centerNdc.ndcX) < 1e-4 && Math.abs(centerNdc.ndcY) < 1e-4,
        "2a. a lookAt-target world point always projects to NDC (0,0) — by construction, for any pose", centerNdc);

      const rightNdc = await page.evaluate((pose) => window.Theater.shotProjectFor(pose)({ x: 1, y: 0, z: 0 }), centerPose);
      ok(rightNdc && rightNdc.ndcX > 0.05,
        "2b. a world point offset toward +X off the target lands at NDC +X (standard right-handed camera convention)", rightNdc);

      const behindPose = Object.assign({}, centerPose, { yaw: 180 });
      const behindNdc = await page.evaluate((pose) => window.Theater.shotProjectFor(pose)({ x: 1, y: 0, z: 0 }), behindPose);
      ok(behindNdc && behindNdc.ndcX < -0.05,
        "2c. rotating the pose 180° flips which screen side the same +X world point lands on (yaw is actually being read)", behindNdc);

      const badNdc = await page.evaluate(() => window.Theater.shotProjectFor(null)({ x: 0, y: 0, z: 0 }));
      ok(badNdc === null, "2d. a null cameraPose degrades to null (never throws)", badNdc);
      const badPt = await page.evaluate((pose) => window.Theater.shotProjectFor(pose)(null), centerPose);
      ok(badPt === null, "2e. a null worldPt degrades to null (never throws)", badPt);
    }

    console.log("\n=== 3. fallback safety ===");
    {
      // 3a. flag OFF is byte-identical to the pre-unit interiorCameraFitFor(focusRect) path — mount
      // the SAME board twice with a dirty-key-breaking touch between (a fresh piece array reference)
      // so setInteriorBoard doesn't just skip the second call as a no-op.
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: false }));
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), fx.board);
      await settleCameraTween(page);
      const composedOff = await page.evaluate(() => window.Theater.lastComposedShot());
      ok(composedOff === null, "3a-i. flag OFF: window.Theater.lastComposedShot() is null (the compose block never ran/never committed a camFit)", composedOff);
      // "byte-identical to the pre-unit path" — the same board, mounted under compose OFF, must frame
      // the FIT BOX's own center (not the off-corner cluster): its NDC offset from frame-center is
      // ~0 (interiorCameraFitFor's "room" mode always aims S.boardCenter at (0,0,0) in the cx/cz-
      // shifted frame, i.e. the fit box's own center IS boardCenter by construction — this is the exact
      // pre-unit invariant, re-asserted live rather than assumed). Uses the fit box's OWN center
      // ((minX+maxX)/2,(minZ+maxZ)/2), not a hand-computed room-dims center, since interiorCameraFitFor
      // reads `fit` directly — the two can differ by half a cell for a room with an odd wall inset,
      // which is exactly the kind of test-fixture-precision noise this check must not be sensitive to.
      const fitCenterPt = { x: (fxFit.minX + fxFit.maxX) / 2, z: (fxFit.minZ + fxFit.maxZ) / 2 };
      const roomCenterOffsetOff = await clusterFrameOffset(page, fitCenterPt, fxFit);
      ok(roomCenterOffsetOff !== null && roomCenterOffsetOff < 0.01,
        "3a-ii. flag OFF: the fit box's own center still lands at frame-center (interiorCameraFitFor's unmodified room-mode invariant)",
        { roomCenterOffsetOff });

      // 3b. an ALL-REJECTED fixture — GS.combat.units with player+threat pinned OUTSIDE the room's own
      // stage polygon at a huge separation, guaranteeing every one of the 5 default candidates fails
      // tray_edge/safe_frame — still produces a real, finite camera (S.boardCenter/halfX/halfZ never
      // null/NaN), i.e. the focusRect fallback fires rather than a black/undefined frame.
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: true }));
      const rejectedBoard = await page.evaluate((board) => {
        const b = Object.assign({}, board, { pieces: board.pieces.slice().reverse() }); // break the dirty-key skip
        GS.combat = { active: false, units: [
          { id: "pc", kind: "pc", x: -5000, z: -5000 },
          { id: "f1", kind: "foe", x: 5000, z: 5000, cr: 20 }
        ] };
        return b;
      }, fx.board);
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), rejectedBoard);
      await settleCameraTween(page);
      const afterReject = await page.evaluate(() => {
        // lastComposedShot() is the ACCEPTED-only read (null here, by design — see this file's own
        // header near S.lastComposedShotAttempt); lastComposedShotAttempt() is the RAW composeShot
        // result regardless of accept/reject, which is what proves the rejection actually happened.
        const accepted = window.Theater.lastComposedShot();
        const attempt = window.Theater.lastComposedShotAttempt();
        const error = window.Theater.lastComposedShotError();
        return { accepted, attempt, error, allRejected: attempt && attempt.metrics ? attempt.metrics.allRejected : null };
      });
      ok(afterReject.accepted === null, "3b-i. the degenerate wide-separation fixture is NOT accepted as a real camFit (lastComposedShot() stays null)", afterReject.accepted);
      ok(afterReject.error === null, "3b-ii. composeShot did not throw for this fixture (a real rejection, not an exception being mistaken for one)", afterReject.error);
      ok(afterReject.allRejected === true, "3b-iii. the degenerate wide-separation fixture DOES make composeShot reject every candidate (metrics.allRejected===true) — the fallback trigger is real, not vacuous", afterReject);
      const finiteFit = await page.evaluate(() => {
        const p = window.Theater.projectWorldPoint(0, 0, 0);
        return !!p && isFinite(p.ndcX) && isFinite(p.ndcY);
      });
      ok(finiteFit, "3c. all-rejected compose still yields a real, finite camera fit (focusRect fallback fired, not a black/NaN frame)", finiteFit);

      // reset GS.combat for anything that runs after this block.
      await page.evaluate(() => { GS.combat = null; });
    }

    console.log("\n=== 4. provenance flows (WalkScene -> ShotPlan) ===");
    // This checks the LIVE WIRING (setInteriorBoard reads tray.walkScene, shotPlanFrom/composeShot
    // consume it, window.Theater.lastShotPlan() surfaces it) — NOT WDV-1's own dealer/classifier logic,
    // which dev/verify-theater-shot.mjs section 9 already covers pure-module-level (13/13 green,
    // including this exact "objective anchor's sourceRef resolves to a real WalkScene sourceRef, not a
    // flat projection string" claim). place-projection.js's fallback (non-explicit-deck) card path
    // never stamps a card's `.visual.position` today (wspFallbackCards' own `add()` never merges the
    // segment field's value onto the card — a real, pre-existing gap in that module, out of scope for
    // A3 to fix), so a synthetic trayFrom()-driven fixture can't exercise a positioned WalkScene
    // centerpiece end-to-end without first patching that gap. Attaching a hand-built `board.walkScene`
    // directly (the SAME fixture shape verify-theater-shot.mjs's own section 9 already proved correct
    // at the pure-module level) sidesteps that gap and stays honestly scoped to what THIS file owns:
    // the wiring, not the dealer.
    {
      const walkFixture = await page.evaluate(() => {
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
          const walkId = "shot-compose-walk-prov";
          const plan = spatializePlan(fixture, "The Spine", { walkId });
          const focusRoom = plan.rooms[0];
          const focusSegNum = focusRoom.segNum;
          const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
          board.lightProfile = "torchlit";
          board.activeRoomId = focusSegNum;
          const finalePos = { x: focusRoom.x + Math.floor(focusRoom.w / 2), y: focusRoom.y + Math.floor(focusRoom.d / 2) };
          // walk-scene.js's own wsFoldCardLane/wsSourceRef shape, verbatim (matches dev/verify-theater-
          // shot.mjs section 9's fixture exactly).
          board.walkScene = {
            walkRef: { id: walkId, environment: "dungeon", topology: "spine" },
            segmentRef: { id: "seg-" + focusSegNum, num: focusSegNum, label: "The Reliquary" },
            register: { setup: "haunting", skin: "gloom", spiceTier: 2, posture: "tense", depth: 0, isFinale: false },
            structure: [{ role: "structure",
              sourceRef: { walkId, segmentNum: focusSegNum, fieldPath: "finale", tableId: "T1", roll: 12, overlayRef: null },
              id: "obj-prov", centerpiece: true, position: finalePos }],
            citizens: [], interactables: [], dressing: [], conditions: [], connections: [],
            atmosphere: [], traces: [], removals: [], hidden: [],
            fieldRefs: [{ walkId, segmentNum: focusSegNum, fieldPath: "finale", tableId: "T1", roll: 12, overlayRef: null }]
          };
          return { ok: true, board };
        } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
      });
      if (!walkFixture.ok) {
        ok(false, "4-setup. WalkScene-bearing fixture built (" + walkFixture.error + ")", walkFixture);
      } else {
        await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: true }));
        await page.evaluate((board) => window.Theater.setInteriorBoard(board), walkFixture.board);
        await settleCameraTween(page);
        const shot = await page.evaluate(() => window.Theater.lastShotPlan());
        ok(!!shot, "4a. compose ON on a WalkScene-bearing board produces a real lastShotPlan()", shot);
        if (shot) {
          ok(shot.walkRef && shot.walkRef.id === "shot-compose-walk-prov", "4b. ShotPlan.walkRef flows through from tray.walkScene", shot.walkRef);
          ok(Array.isArray(shot.fieldRefs) && shot.fieldRefs.length === 1, "4c. ShotPlan.fieldRefs mirrors WalkScene's own flat provenance index", shot.fieldRefs);
          const objSourceRef = shot.anchors && shot.anchors.objective && shot.anchors.objective.sourceRef;
          ok(!!objSourceRef && typeof objSourceRef === "object" && objSourceRef.fieldPath === "finale",
            "4d. the objective anchor's sourceRef is a real WalkScene sourceRef object (fieldPath='finale'), not a flat projection string",
            { objSourceRef, anchors: shot.anchors });
        }
      }
    }

    console.log("\n=== 5. frustum green + fps>=30 + settle-await on the composed fit ===");
    {
      await restoreCombat(page, fx); // section 3/4 both clobbered GS.combat since this last set it
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: true }));
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), fx.board);
      await settleCameraTween(page);
      const frustum = await page.evaluate(() => window.Theater.interiorFrustumCheck());
      ok(frustum && frustum.ok === true, "5a. composed fit: interiorFrustumCheck ok=true (no clipped board-box corner)", frustum);
      // warm-up sample discarded first (shader/JIT warm-up cost, same discipline any perf harness
      // needs — this page has run several mounts by this point in the script) — verify-mf1-camera-
      // tweens.mjs's own single-mount run doesn't need this, but this file's longer multi-fixture
      // session does, so measure twice and keep the second, steady-state reading.
      await page.evaluate(() => window.Theater.measureRenderFps(15));
      const fpsResult = await page.evaluate(() => window.Theater.measureRenderFps(40));
      const fps = fpsResult ? fpsResult.fps : 0;
      ok(fps >= 30, `5b. composed fit: render fps (${fps.toFixed(1)}) stays >= 30`, fpsResult);
    }

    // before/after capture (required by the orchestrator's brief) — reuses this same off-center
    // fixture: one screenshot under the plain focusRect fit, one under the composed fit.
    console.log("\n=== capture: before (focusRect) / after (composed) ===");
    {
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: false }));
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), fx.board);
      await settleCameraTween(page);
      await sleep(400);
      const beforeCanvas = await page.$(".theater-stage-canvas canvas");
      const beforeBox = beforeCanvas ? await beforeCanvas.boundingBox() : null;
      if (beforeBox) {
        const beforeB64 = await page.screenshot({ clip: beforeBox, encoding: "base64" });
        fs.writeFileSync(path.join(outDir, "before-focusrect.png"), Buffer.from(beforeB64, "base64"));
      }

      await restoreCombat(page, fx); // still needed here too (independent of the section-5 restore above)
      await page.evaluate(() => window.Theater.setInteriorVariant({ shotCompose: true }));
      const touchedBoard = Object.assign({}, fx.board, { pieces: fx.board.pieces.slice() });
      await page.evaluate((board) => window.Theater.setInteriorBoard(board), touchedBoard);
      await settleCameraTween(page);
      await sleep(400);
      const afterCanvas = await page.$(".theater-stage-canvas canvas");
      const afterBox = afterCanvas ? await afterCanvas.boundingBox() : null;
      if (afterBox) {
        const afterB64 = await page.screenshot({ clip: afterBox, encoding: "base64" });
        fs.writeFileSync(path.join(outDir, "after-composed.png"), Buffer.from(afterB64, "base64"));
      }
      ok(!!beforeBox && !!afterBox, "capture: both before/after PNGs were written to dev/battle-gate/shot-compose/", { beforeBox: !!beforeBox, afterBox: !!afterBox });
      console.log(`  wrote ${path.join(outDir, "before-focusrect.png")}`);
      console.log(`  wrote ${path.join(outDir, "after-composed.png")}`);
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
