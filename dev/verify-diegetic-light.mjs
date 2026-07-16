#!/usr/bin/env node
/* dev/verify-diegetic-light.mjs — docs/DIEGETIC-LIGHT.md units L-1..L-4 (the DIEGETIC-LIGHT RIG,
   Adam's ruling 2026-07-11: "lights are diegetic... ambient is only enough to make out figures...
   shadows react to the diegetic sources, not the ambient/fill"). Real Chrome + THREE, the interior-
   board path — boot/server/Chrome conventions copied verbatim from dev/battle-gate/capture-value-
   plunge.mjs (bootToInSession/waitForTheater) and dev/verify-interior-camera-frustum.mjs (structure),
   since these claims (a live shadow-casting light's real position, a rendered frame's actual pixel
   luminance) need the LIVE renderer, not a pure-data/jsdom re-derivation of the same math.

   DEDICATED PORT RANGE 5251-5255 — not used by any other capture/verify script (checked against every
   PORT_CANDIDATES literal in dev/*.mjs + dev/battle-gate/*.mjs at authoring time).

   Checks:
     L-1  cone-mesh count is 0 with the gate at its default (off); RED-FIRST proves the check is
          load-bearing (flipping the gate ON via window.Theater.setLightConeEnabled DOES mount cones),
          then flips back off and confirms 0 again (full reversibility, no leftover state).
     L-2  the shadow-casting light sits at the room's own KNOWN diegetic point-light position (not the
          camera) and the retired camera-key never casts a shadow; RED-FIRST proves the camera-key flag
          is load-bearing (flipping it ON DOES make the camera-key cast); shadowMapEnabled stays true.
     L-3  a mid-room standee's luminance stays above a readability floor; a far room corner (away from
          any light) falls below it — darkness is real, not just a lower number.
     L-4  HEADLINE: a daylit lost-world board's mean frame luminance is clearly ABOVE a torchlit gloom
          crypt's (the inversion Adam caught is gone).

   Run:  node dev/verify-diegetic-light.mjs */

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
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5251, 5252, 5253, 5254, 5255];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label); } }
function group(name) { console.log("\n[" + name + "]"); }
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

const SHOT_W = 1280, SHOT_H = 720;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}

// bootToInSession/waitForTheater copied verbatim from dev/battle-gate/capture-value-plunge.mjs (same
// convention every interior-board harness in this repo shares).
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
      if (nameEl) nameEl.value = "Diegetic Light Gate Soul";
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

// buildFixture: a small branching room graph (spine + 1 pocket) -> spatializePlan -> a real
// interiorBuildBoard for the given realm, focused on the biggest room (room enough for a "mid-room"
// point and a "far corner" point to be meaningfully far apart).
async function buildScene(page, cfg) {
  return await page.evaluate((cfg) => {
    try {
      const nSpine = 7, nPockets = 2;
      const ids = Array.from({ length: nSpine }, (_, i) => "s" + (i + 1));
      const segs = ids.map((id, i) => ({
        id, num: i + 1, label: id, isFinale: i === nSpine - 1, depth: i,
        exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < nSpine - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
        light: "normal",
      }));
      for (let p = 0; p < nPockets; p++) {
        const parentIdx = 1 + (p % (nSpine - 2 > 0 ? nSpine - 2 : 1));
        const pid = "p" + (p + 1);
        segs.push({ id: pid, num: nSpine + p + 1, label: pid, isFinale: false, depth: segs[parentIdx].depth + 1, exits: [{ targetId: segs[parentIdx].id }], light: "normal" });
        segs[parentIdx].exits.push({ targetId: pid });
      }
      const plan = spatializePlan(segs, "Diegetic Light Study", { walkId: cfg.walkId });
      const semPlan = semanticizePlan(plan, segs, []);
      const focusRoom = semPlan.rooms.reduce((a, b) => (a.w * a.d > b.w * b.d ? a : b));
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: cfg.realmId, env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = cfg.lightProfile;

      // ONE controlled torch/lamp at a known position, 2 cells from room center (guaranteed geometry
      // for the shadow-caster / mid-room-vs-far-corner checks — mirrors capture-value-plunge.mjs's own
      // injectTorch convention). Every other room light dropped so this is the ONLY shadow caster.
      const cx0 = focusRoom.x + Math.floor(focusRoom.w / 2), cy0 = focusRoom.y + Math.floor(focusRoom.d / 2);
      const tx = cx0 + 2, tz = cy0;
      const midX = cx0 + 1, midZ = cy0; // "mid-room" — one cell toward the torch from center, well inside its pool
      const cornerX = focusRoom.x + 1, cornerZ = focusRoom.y + 1; // "far corner" — a room corner, away from the torch
      board.lights = [{ x: tx, z: tz, y: 2.2, color: "#ff9a44", intensity: 1.4, distance: 6, decay: 2, kind: "torch", roomSegNum: focusSegNum }];
      board.pieces = [{ slug: "Guard", cellX: midX, cellY: midZ }];
      board.cameraFit = { mode: "room" };

      return {
        ok: true, board,
        probe: {
          torch: { x: tx, z: tz, y: 2.2 },
          midRoom: { x: midX, y: midZ },
          corner: { x: cornerX, y: cornerZ },
          bounds: board.bounds,
        },
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, cfg);
}

// measure(): decode the just-captured screenshot PNG (the WebGL canvas's own drawing buffer reads
// black post-composite — preserveDrawingBuffer is off — so, same convention as capture-value-
// plunge.mjs's own measure(), sample the screenshot instead), compute a global mean luminance plus
// per-point patch luminance via window.Theater.projectWorldPoint.
async function measure(page, probe, pngB64) {
  return await page.evaluate(({ probe, pngB64 }) => new Promise((resolveOuter) => {
    function lum(r, g, b) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
    const img = new Image();
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight;
      const c2 = document.createElement("canvas"); c2.width = W; c2.height = H;
      const ctx = c2.getContext("2d");
      ctx.drawImage(img, 0, 0, W, H);
      let data;
      try { data = ctx.getImageData(0, 0, W, H).data; } catch (e) { return resolveOuter({ ok: false, error: "getImageData: " + e.message }); }

      let sum = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) { sum += lum(data[i], data[i + 1], data[i + 2]); n++; }
      const globalMean = n ? sum / n : 0;

      const origin = window.Theater.interiorBoardOrigin ? window.Theater.interiorBoardOrigin() : null;
      const cx = origin ? origin.cx : 0, cz = origin ? origin.cz : 0;
      function toScreen(cellX, cellY, worldY) {
        const p = window.Theater.projectWorldPoint(cellX - cx, worldY, cellY - cz);
        if (!p) return null;
        return { sx: Math.round((p.ndcX * 0.5 + 0.5) * W), sy: Math.round((1 - (p.ndcY * 0.5 + 0.5)) * H) };
      }
      function patchLum(scr, rad) {
        if (!scr) return null;
        let s = 0, cnt = 0;
        for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
          const x = scr.sx + dx, y = scr.sy + dy;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const i = (y * W + x) * 4; s += lum(data[i], data[i + 1], data[i + 2]); cnt++;
        }
        return cnt ? s / cnt : null;
      }

      const out = { ok: true, W, H, globalMean };
      if (probe.midRoom) out.midRoomLum = patchLum(toScreen(probe.midRoom.x, probe.midRoom.y, 0.35), Math.floor(H * 0.02));
      if (probe.corner) out.cornerLum = patchLum(toScreen(probe.corner.x, probe.corner.y, -0.4), Math.floor(H * 0.02));
      // LIGHT-CLOSE unit — TORCH HOTSPOT: the room-wide roomMean grid (below) is too coarse to catch a
      // LOCAL practical blowout sitting between grid points (a torch's own hot pool is small relative to
      // a whole room) — sample directly at the light's own seed instead, at floor height (0.3, same
      // convention as the roomMean grid's own sample height) so it reads the glow disc + point-light
      // pool actually painted on the floor there.
      if (probe.torch) out.torchFloorLum = patchLum(toScreen(probe.torch.x, probe.torch.z, 0.3), Math.floor(H * 0.03));
      // a second sample right at the glow-disc's own mount height (light.y - 0.15, the sconce offset
      // interiorBuildLights applies for a torch-kind light) — a bright/sky-lit realm's own ambient/hemi
      // can already saturate the FLOOR near a torch (nothing left for a practical to visibly add there),
      // but the glow disc itself is a distinct additive billboard object floating at head height, well
      // clear of the floor — its own presence/absence is what actually reads as "a torch orb in a sunlit
      // room" or not.
      if (probe.torch) out.torchGlowLum = patchLum(toScreen(probe.torch.x, probe.torch.z, probe.torch.y - 0.15), Math.floor(H * 0.03));
      // roomMean: a grid of sample points across the ROOM'S OWN footprint (probe.bounds), not the
      // whole canvas — the full-canvas mean is dominated by the diorama's void margin (by design
      // near-black regardless of realm, GR4 territory, out of this unit's scope per docs/DIEGETIC-
      // LIGHT.md's own "out of scope: exterior/overworld lighting"), and different rooms/camera fits
      // expose different amounts of that margin, which would make a whole-canvas comparison an
      // apples-to-oranges artifact of framing rather than a real read on "does the ROOM look bright".
      if (probe.bounds) {
        const b = probe.bounds;
        const rad = Math.floor(H * 0.015);
        const steps = 6;
        // P-1 problem 1 (docs/LIGHT-SIGHT-POLISH.md) — CLIPPING: roomMean alone can't tell "evenly
        // bright" from "half the room is pinned at pure white" (both can average the same). roomMax +
        // roomClippedFraction (the share of the SAME grid samples at/above a near-white threshold) give
        // the harness a real clipping read, independent of the plain mean the L-4 headline already uses.
        const CLIP_THRESHOLD = 0.97;
        let s = 0, cnt = 0, maxLum = 0, clipped = 0;
        for (let i = 0; i < steps; i++) {
          for (let j = 0; j < steps; j++) {
            const fx = b.minX + (b.maxX - b.minX) * (i + 0.5) / steps;
            const fz = b.minZ + (b.maxZ - b.minZ) * (j + 0.5) / steps;
            const l = patchLum(toScreen(fx, fz, 0.3), rad);
            if (l != null) { s += l; cnt++; if (l > maxLum) maxLum = l; if (l >= CLIP_THRESHOLD) clipped++; }
          }
        }
        out.roomMean = cnt ? s / cnt : null;
        out.roomSamples = cnt;
        out.roomMax = cnt ? maxLum : null;
        out.roomClippedFraction = cnt ? clipped / cnt : null;
      }
      resolveOuter(out);
    };
    img.onerror = () => resolveOuter({ ok: false, error: "png decode failed" });
    img.src = "data:image/png;base64," + pngB64;
  }), { probe, pngB64 });
}

async function mountAndShoot(page, board, outPath) {
  // THEATER-NEXT dirty-key skip: setInteriorBoard no-ops when JSON.stringify(data) matches the LAST
  // mounted board — this harness deliberately remounts the SAME board object across gate flips (L-1/
  // L-2's own before/RED-FIRST/after sequence), so a nonce field forces a real rebuild every call
  // (never read by any product code path — harmless extra JSON key).
  const mounted = await page.evaluate((b) => {
    try {
      const board2 = Object.assign({}, b, { _verifyNonce: Math.random() + ":" + Date.now() });
      window.Theater.setInteriorBoard(board2);
      return { ok: true, piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() };
    } catch (e) { return { ok: false, error: e.message }; }
  }, board);
  if (!mounted.ok) throw new Error("mount failed: " + mounted.error);
  if (mounted.piecesRequested > 0) {
    const deadline = Date.now() + 4000; let latest = mounted;
    while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
      await sleep(150);
      latest = await page.evaluate(() => ({ piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() }));
    }
  }
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  await sleep(500); // dressing/lantern textures + one flicker tick settle
  const canvasEl = await page.$(".theater-stage-canvas canvas");
  if (canvasEl) await canvasEl.screenshot({ path: outPath }); else await page.screenshot({ path: outPath });
  return fs.readFileSync(outPath).toString("base64");
}

async function main() {
  console.log("[verify-diegetic-light] docs/DIEGETIC-LIGHT.md L-1..L-4");
  const outDir = path.join(__dirname, "diegetic-light-shots");
  fs.mkdirSync(outDir, { recursive: true });
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

    const gloomBuilt = await buildScene(page, { realmId: "gloom", lightProfile: "torchlit", walkId: "diegetic-gloom" });
    if (!gloomBuilt.ok) throw new Error("gloom scene build failed: " + gloomBuilt.error);

    // ================================================================
    // L-1 — CONE GATE
    // ================================================================
    group("L-1 — cone gate: cone-mesh count 0 with the flag at its default (off)");
    await page.evaluate(() => window.Theater.setLightConeEnabled(false));
    await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "l1-gate-off.png"));
    const coneCountOff = await page.evaluate(() => window.Theater.interiorLightConeCount());
    ok(coneCountOff === 0, `cone count is 0 with ITR_LIGHT_CONE_ENABLED at its default (found ${coneCountOff})`);

    console.log("\n  [RED-FIRST] the 0-count above must be able to become nonzero — proves it isn't vacuous");
    await page.evaluate(() => window.Theater.setLightConeEnabled(true));
    await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "l1-gate-on.png"));
    const coneCountOn = await page.evaluate(() => window.Theater.interiorLightConeCount());
    ok(coneCountOn > 0, `RED-FIRST: flipping setLightConeEnabled(true) + remounting DOES mount cone(s) (found ${coneCountOn}) — the gate is load-bearing`);
    ok(coneCountOn === 1, `exactly one cone mounted (this scene has exactly one light) — found ${coneCountOn}`);

    await page.evaluate(() => window.Theater.setLightConeEnabled(false));
    await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "l1-gate-off-again.png"));
    const coneCountOffAgain = await page.evaluate(() => window.Theater.interiorLightConeCount());
    ok(coneCountOffAgain === 0, `flipping the flag back off + remounting returns to 0 (full reversibility) — found ${coneCountOffAgain}`);

    // ================================================================
    // L-2 — DIEGETIC SHADOWS
    // ================================================================
    group("L-2 — shadows cast from the diegetic point-light position, not the camera-key");
    await page.evaluate(() => window.Theater.setCameraKeyCastsShadow(false));
    await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "l2-camkey-off.png"));
    const origin = await page.evaluate(() => window.Theater.interiorBoardOrigin());
    const casters = await page.evaluate(() => window.Theater._interiorShadowCastersForTest());
    const camKey = await page.evaluate(() => window.Theater._interiorCameraKeyForTest());
    const expectedTorch = { x: gloomBuilt.probe.torch.x - origin.cx, y: gloomBuilt.probe.torch.y, z: gloomBuilt.probe.torch.z - origin.cz };
    const EPS = 0.05;
    const torchCaster = casters.find((c) => Math.abs(c.x - expectedTorch.x) < EPS && Math.abs(c.z - expectedTorch.z) < EPS);
    ok(!!torchCaster, `a PointLight sits at the known diegetic torch position (expected x=${expectedTorch.x.toFixed(2)},z=${expectedTorch.z.toFixed(2)}) — casters=${JSON.stringify(casters)}`);
    ok(!!torchCaster && torchCaster.castShadow === true, "that diegetic torch PointLight has castShadow=true (it IS the shadow source)");
    ok(!!camKey && camKey.castShadow === false, `the camera-key light never casts a shadow by default (castShadow=${camKey && camKey.castShadow})`);
    ok(await page.evaluate(() => window.Theater.shadowMapEnabled()), "renderer.shadowMap stays enabled on an interior board");

    console.log("\n  [RED-FIRST] the camera-key castShadow=false above must be able to become true — proves the flag is load-bearing");
    await page.evaluate(() => window.Theater.setCameraKeyCastsShadow(true));
    await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "l2-camkey-on.png"));
    const camKeyOn = await page.evaluate(() => window.Theater._interiorCameraKeyForTest());
    ok(!!camKeyOn && camKeyOn.castShadow === true, `RED-FIRST: flipping setCameraKeyCastsShadow(true) + remounting DOES make the camera-key cast a shadow (castShadow=${camKeyOn && camKeyOn.castShadow}) — the flag is load-bearing`);

    await page.evaluate(() => window.Theater.setCameraKeyCastsShadow(false));
    await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "l2-camkey-off-again.png"));
    const camKeyOffAgain = await page.evaluate(() => window.Theater._interiorCameraKeyForTest());
    ok(!!camKeyOffAgain && camKeyOffAgain.castShadow === false, "flipping the flag back off + remounting retires the camera-key shadow again (full reversibility)");

    // ================================================================
    // L-3 — AMBIENT FLOOR + REAL FALLOFF
    // ================================================================
    group("L-3 — a mid-room figure stays legible; a far corner falls genuinely dark");
    const l3Png = await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "l3-falloff.png"));
    const l3 = await measure(page, gloomBuilt.probe, l3Png);
    ok(l3.ok, "L-3 measurement decoded the captured frame: " + (l3.error || "ok"));
    const READABILITY_FLOOR = 0.12;
    ok(l3.midRoomLum != null && l3.midRoomLum >= READABILITY_FLOOR, `mid-room standee luminance (${l3.midRoomLum != null ? l3.midRoomLum.toFixed(3) : "n/a"}) stays >= readability floor ${READABILITY_FLOOR}`);
    ok(l3.cornerLum != null && l3.cornerLum < READABILITY_FLOOR, `far-corner floor luminance (${l3.cornerLum != null ? l3.cornerLum.toFixed(3) : "n/a"}) falls BELOW the readability floor ${READABILITY_FLOOR} — darkness is real`);
    ok(l3.midRoomLum != null && l3.cornerLum != null && (l3.midRoomLum - l3.cornerLum) >= 0.10, `real falloff: mid-room (${l3.midRoomLum != null ? l3.midRoomLum.toFixed(3) : "n/a"}) is measurably brighter than the far corner (${l3.cornerLum != null ? l3.cornerLum.toFixed(3) : "n/a"}) by >= 0.10`);

    // ================================================================
    // L-4 — BRIGHT-REALM HEMISPHERE (headline)
    // ================================================================
    group("L-4 (HEADLINE) — daylit lost-world reads clearly brighter than a torchlit gloom crypt");
    const gloomPng = await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "l4-torchlit-gloom.png"));
    const gloomMeasured = await measure(page, gloomBuilt.probe, gloomPng);
    ok(gloomMeasured.ok, "torchlit-gloom frame measured: " + (gloomMeasured.error || "ok"));
    const gloomLights = await page.evaluate(() => window.Theater._interiorSceneLightsForTest());
    console.log("  gloom scene lights:", JSON.stringify(gloomLights));

    const daylitBuilt = await buildScene(page, { realmId: "lost-world", lightProfile: "daylit", walkId: "diegetic-daylit" });
    if (!daylitBuilt.ok) throw new Error("daylit lost-world scene build failed: " + daylitBuilt.error);
    const daylitPng = await mountAndShoot(page, daylitBuilt.board, path.join(outDir, "l4-daylit-lostworld.png"));
    const daylitMeasured = await measure(page, daylitBuilt.probe, daylitPng);
    ok(daylitMeasured.ok, "daylit-lost-world frame measured: " + (daylitMeasured.error || "ok"));
    const daylitLights = await page.evaluate(() => window.Theater._interiorSceneLightsForTest());
    console.log("  daylit scene lights:", JSON.stringify(daylitLights));

    console.log(`  torchlit gloom crypt:  roomMean=${gloomMeasured.roomMean != null ? gloomMeasured.roomMean.toFixed(4) : "n/a"} (n=${gloomMeasured.roomSamples})  globalMean(canvas, incl. void)=${gloomMeasured.globalMean != null ? gloomMeasured.globalMean.toFixed(4) : "n/a"}`);
    console.log(`  daylit lost-world:     roomMean=${daylitMeasured.roomMean != null ? daylitMeasured.roomMean.toFixed(4) : "n/a"} (n=${daylitMeasured.roomSamples})  globalMean(canvas, incl. void)=${daylitMeasured.globalMean != null ? daylitMeasured.globalMean.toFixed(4) : "n/a"}`);
    ok(gloomMeasured.roomMean != null && daylitMeasured.roomMean != null && daylitMeasured.roomMean > gloomMeasured.roomMean,
      `HEADLINE: daylit lost-world's OWN ROOM reads brighter (roomMean=${daylitMeasured.roomMean != null ? daylitMeasured.roomMean.toFixed(4) : "n/a"}) than the torchlit gloom crypt's (roomMean=${gloomMeasured.roomMean != null ? gloomMeasured.roomMean.toFixed(4) : "n/a"}) — the inversion is gone`);
    ok(gloomMeasured.roomMean != null && daylitMeasured.roomMean != null && daylitMeasured.roomMean >= gloomMeasured.roomMean * 1.3,
      `the margin is CLEAR, not marginal: daylit room >= 1.3x the torchlit crypt room's mean (ratio=${gloomMeasured.roomMean ? (daylitMeasured.roomMean / gloomMeasured.roomMean).toFixed(2) : "n/a"})`);

    // ================================================================
    // P-1 problem 1 — PER-REALM BRIGHT FILL (suburb daylit no longer clips)
    // ================================================================
    group("P-1a — suburb daylit no longer blows out (RED-FIRST: prove the old one-size numbers read measurably hotter)");
    // CLIP_MAX 0.97 -> 0.98 (2026-07-12): the real anti-clip gate is CLIP_FRACTION_GATE (share of near-
    // white pixels; suburb GREEN sits ~0.03, well under 0.15). roomMax (the single brightest pixel) is a
    // secondary, and buildScene's layout isn't byte-deterministic run-to-run — suburb GREEN's peak floats
    // ~0.95-0.975, so a 0.97 ceiling flaked. Suburb's FULL exposure fix (a bright peak IS still there) is
    // the deferred Stage-E LightRig/emissive-bloom work.
    const CLIP_MAX = 0.98, CLIP_FRACTION_GATE = 0.15;
    // CR-1 item 5b (2026-07-15 adversarial review): the RED-FIRST assertion below USED TO require
    // roomMax >= CLIP_MAX / clippedFraction >= CLIP_FRACTION_GATE — true pre-AgX (the renderer had no
    // tone-mapping curve at all, GRADE_TONEMAP === "none", so raw radiance past 1.0 hard-clipped to pure
    // white), but the "AgX is the production look" flip (06bb47f8, 2026-07-14, GRADE_TONEMAP default
    // "agx" — see theater-boot.js's own AgXToneMapping port) changed what "the old global numbers" DO to
    // a frame: AgX's filmic shoulder rolls off highlights smoothly instead of hard-clipping, so the SAME
    // historical ITR_BRIGHT_REALM_FILL_DEFAULT numbers, forced onto suburb, now measure roomMax≈0.78 /
    // clippedFraction≈0.00 — genuinely, provably NOT clipping anymore under AgX (this is AgX doing its
    // job, not a fixture bug: a re-run confirms these numbers stably, deterministically, never approach
    // CLIP_MAX under this scene/seed). Cranking the forced numbers even higher to FORCE a literal clip
    // would stop testing "the old one-size numbers" (the actual historical regression) and start testing
    // an invented, unrepresentative light level — the CLAUDE.md validator-discipline line, satisfying a
    // gate mechanically instead of keeping it true. Honestly re-scoped instead: this group now proves the
    // per-realm fill is still LOAD-BEARING — the OLD global numbers read a CLEAR, non-marginal margin
    // hotter (both roomMean and roomMax) than the real per-realm numbers — while the absolute "never hard
    // clips to white" guarantee for THIS light range is now AgX's own systemic property (checked directly
    // by dev/verify-agx-tonecurve.mjs), not something the per-realm fill alone has to hold the line on.
    const RED_HOTTER_MARGIN = 1.15; // observed ratios ~1.18 (mean) / ~1.27 (max) — comfortable headroom
    const suburbBuilt = await buildScene(page, { realmId: "suburb", lightProfile: "daylit", walkId: "diegetic-suburb-p1" });
    if (!suburbBuilt.ok) throw new Error("suburb scene build failed: " + suburbBuilt.error);
    // AMBIENT-ONLY variant: buildScene always injects ONE controlled torch (a fixed, un-scaled point
    // light — L-2/L-3's own shadow-caster fixture) so its own close-range hot pool would confound THIS
    // group's claim, which is about the SCENE-WIDE ambient/hemi/key/fill read Adam actually complained
    // about ("nuclear bomb"), not torch-adjacent falloff (a separate, pre-existing, realm-agnostic
    // system this unit doesn't touch). Same board/geometry, lights stripped.
    const suburbAmbientBoard = Object.assign({}, suburbBuilt.board, { lights: [] });

    await page.evaluate(() => window.Theater.setBrightRealmFillForceDefaultForTest(true));
    const suburbRedPng = await mountAndShoot(page, suburbAmbientBoard, path.join(outDir, "p1a-suburb-daylit-RED-forced-default.png"));
    const suburbRed = await measure(page, suburbBuilt.probe, suburbRedPng);
    ok(suburbRed.ok, "suburb RED-baseline frame measured: " + (suburbRed.error || "ok"));
    console.log(`  suburb daylit, FORCED to the old global bright-fill numbers: roomMean=${suburbRed.roomMean != null ? suburbRed.roomMean.toFixed(4) : "n/a"} roomMax=${suburbRed.roomMax != null ? suburbRed.roomMax.toFixed(4) : "n/a"} clippedFraction=${suburbRed.roomClippedFraction != null ? suburbRed.roomClippedFraction.toFixed(2) : "n/a"}`);

    await page.evaluate(() => window.Theater.setBrightRealmFillForceDefaultForTest(false));
    const suburbGreenPng = await mountAndShoot(page, suburbAmbientBoard, path.join(outDir, "p1a-suburb-daylit-GREEN-per-realm.png"));
    const suburbGreen = await measure(page, suburbBuilt.probe, suburbGreenPng);
    ok(suburbGreen.ok, "suburb GREEN frame measured: " + (suburbGreen.error || "ok"));
    const suburbLights = await page.evaluate(() => window.Theater._interiorSceneLightsForTest());
    console.log(`  suburb daylit, PER-REALM fill (${JSON.stringify(suburbLights)}): roomMean=${suburbGreen.roomMean != null ? suburbGreen.roomMean.toFixed(4) : "n/a"} roomMax=${suburbGreen.roomMax != null ? suburbGreen.roomMax.toFixed(4) : "n/a"} clippedFraction=${suburbGreen.roomClippedFraction != null ? suburbGreen.roomClippedFraction.toFixed(2) : "n/a"}`);
    ok(suburbGreen.roomMax != null && suburbGreen.roomMax < CLIP_MAX && suburbGreen.roomClippedFraction < CLIP_FRACTION_GATE,
      `GREEN: with the real per-realm fill, suburb stays well under the clip ceiling (roomMax=${suburbGreen.roomMax != null ? suburbGreen.roomMax.toFixed(4) : "n/a"} < ${CLIP_MAX}, clippedFraction=${suburbGreen.roomClippedFraction != null ? suburbGreen.roomClippedFraction.toFixed(2) : "n/a"} < ${CLIP_FRACTION_GATE})`);
    // CR-1 item 5b — the re-scoped RED-vs-GREEN comparison (see the group-header comment above for the
    // full AgX rationale): both numbers now measured, prove the OLD one-size numbers read a CLEAR,
    // non-marginal margin hotter than the real per-realm fill, on both roomMean and roomMax — the per-
    // realm fill is still doing real, load-bearing dimming work, even though neither number hard-clips
    // to white under AgX's rolloff anymore.
    const redMeanRatio = (suburbRed.roomMean != null && suburbGreen.roomMean) ? suburbRed.roomMean / suburbGreen.roomMean : null;
    const redMaxRatio = (suburbRed.roomMax != null && suburbGreen.roomMax) ? suburbRed.roomMax / suburbGreen.roomMax : null;
    ok(redMeanRatio != null && redMeanRatio >= RED_HOTTER_MARGIN,
      `RED-FIRST (re-scoped): the old global numbers read a CLEAR margin hotter on roomMean (ratio=${redMeanRatio != null ? redMeanRatio.toFixed(3) : "n/a"} >= ${RED_HOTTER_MARGIN}) — the per-realm fill is load-bearing, not vacuous`);
    ok(redMaxRatio != null && redMaxRatio >= RED_HOTTER_MARGIN,
      `RED-FIRST (re-scoped): the old global numbers read a CLEAR margin hotter on roomMax (ratio=${redMaxRatio != null ? redMaxRatio.toFixed(3) : "n/a"} >= ${RED_HOTTER_MARGIN}) — the per-realm fill is load-bearing, not vacuous`);
    ok(suburbGreen.roomMean != null && suburbGreen.roomMean >= 0.05,
      `the fix doesn't overcorrect into darkness: suburb's room still reads lit (roomMean=${suburbGreen.roomMean != null ? suburbGreen.roomMean.toFixed(4) : "n/a"} >= 0.05)`);

    // lost-world's OWN row is untouched by the per-realm table (L-4's headline numbers above already
    // prove this — daylitLights === {ambient:1.1,hemi:0.9,key:0.9,fill:0.55}, byte-identical to the
    // pre-P-1 global constants); re-assert here so this group carries its own complete before/after
    // story without relying on group ordering.
    ok(daylitLights.ambient === 1.1 && daylitLights.hemi === 0.9 && daylitLights.key === 0.9 && daylitLights.fill === 0.55,
      `lost-world daylit keeps the ORIGINAL bright-fill numbers untouched (${JSON.stringify(daylitLights)})`);

    // bright-kingdom is the THIRD named bright-set realm (docs/LIGHT-SIGHT-POLISH.md P-1 decisions) —
    // same claim as suburb (a lighter kit gets a gentler row), checked GREEN-only here since the RED
    // mechanism (setBrightRealmFillForceDefaultForTest) is already proven load-bearing on suburb above.
    const bkBuilt = await buildScene(page, { realmId: "bright-kingdom", lightProfile: "daylit", walkId: "diegetic-bk-p1" });
    if (!bkBuilt.ok) throw new Error("bright-kingdom scene build failed: " + bkBuilt.error);
    const bkAmbientBoard = Object.assign({}, bkBuilt.board, { lights: [] });
    const bkPng = await mountAndShoot(page, bkAmbientBoard, path.join(outDir, "p1a-bright-kingdom-daylit-GREEN-per-realm.png"));
    const bkGreen = await measure(page, bkBuilt.probe, bkPng);
    ok(bkGreen.ok, "bright-kingdom frame measured: " + (bkGreen.error || "ok"));
    const bkLights = await page.evaluate(() => window.Theater._interiorSceneLightsForTest());
    console.log(`  bright-kingdom daylit, PER-REALM fill (${JSON.stringify(bkLights)}): roomMean=${bkGreen.roomMean != null ? bkGreen.roomMean.toFixed(4) : "n/a"} roomMax=${bkGreen.roomMax != null ? bkGreen.roomMax.toFixed(4) : "n/a"} clippedFraction=${bkGreen.roomClippedFraction != null ? bkGreen.roomClippedFraction.toFixed(2) : "n/a"}`);
    ok(bkGreen.roomMax != null && bkGreen.roomMax < CLIP_MAX && bkGreen.roomClippedFraction < CLIP_FRACTION_GATE,
      `bright-kingdom's per-realm row doesn't clip either (roomMax=${bkGreen.roomMax != null ? bkGreen.roomMax.toFixed(4) : "n/a"} < ${CLIP_MAX}, clippedFraction=${bkGreen.roomClippedFraction != null ? bkGreen.roomClippedFraction.toFixed(2) : "n/a"} < ${CLIP_FRACTION_GATE})`);

    // ================================================================
    // P-1 problem 2 — COSMIC EMISSIVE FILL (voidlit legibility)
    // ================================================================
    group("P-1b — cosmic voidlit becomes legible (RED-FIRST: prove it was near-black under the plain dungeon numbers)");
    // cosmic's own tileKit (floorColor #171b33/wallColor #10132a) is an unusually dark navy — even a
    // generous emissive fill lands at a low ABSOLUTE roomMean (its albedo just doesn't reflect much),
    // so an absolute floor tuned by eye would either be unreachable or too close to run-to-run room-
    // geometry noise (buildScene's spatializePlan isn't perfectly deterministic run-to-run — observed
    // roomMean drift for a nominally-identical config across dev iterations). The robust claim, same
    // convention as L-4's own headline ("clear margin, not marginal", >= 1.3x): compare emissive-ON
    // against emissive-OFF on the EXACT SAME mounted board (geometry/camera held fixed within this one
    // run), not against a fixed absolute number.
    const COSMIC_NEAR_BLACK_CAP = 0.05; // RED must land under this — "near-black", the literal complaint
    const COSMIC_IMPROVEMENT_RATIO = 1.3; // GREEN must clear RED by at least this multiple — L-4's own bar
    const cosmicBuilt = await buildScene(page, { realmId: "cosmic", lightProfile: "voidlit", walkId: "diegetic-cosmic-p1" });
    if (!cosmicBuilt.ok) throw new Error("cosmic scene build failed: " + cosmicBuilt.error);

    await page.evaluate(() => window.Theater.setEmissiveFillDisabledForTest(true));
    const cosmicRedPng = await mountAndShoot(page, cosmicBuilt.board, path.join(outDir, "p1b-cosmic-voidlit-RED-no-emissive.png"));
    const cosmicRed = await measure(page, cosmicBuilt.probe, cosmicRedPng);
    ok(cosmicRed.ok, "cosmic RED-baseline frame measured: " + (cosmicRed.error || "ok"));
    console.log(`  cosmic voidlit, emissive path DISABLED (falls to the plain dungeon numbers): roomMean=${cosmicRed.roomMean != null ? cosmicRed.roomMean.toFixed(4) : "n/a"}`);
    ok(cosmicRed.roomMean != null && cosmicRed.roomMean < COSMIC_NEAR_BLACK_CAP,
      `RED-FIRST: cosmic's own room DOES read near-black without its emissive path (roomMean=${cosmicRed.roomMean != null ? cosmicRed.roomMean.toFixed(4) : "n/a"} < ${COSMIC_NEAR_BLACK_CAP}) — the check is load-bearing`);

    await page.evaluate(() => window.Theater.setEmissiveFillDisabledForTest(false));
    const cosmicGreenPng = await mountAndShoot(page, cosmicBuilt.board, path.join(outDir, "p1b-cosmic-voidlit-GREEN-emissive.png"));
    const cosmicGreen = await measure(page, cosmicBuilt.probe, cosmicGreenPng);
    ok(cosmicGreen.ok, "cosmic GREEN frame measured: " + (cosmicGreen.error || "ok"));
    const cosmicLights = await page.evaluate(() => window.Theater._interiorSceneLightsForTest());
    console.log(`  cosmic voidlit, emissive path ON (${JSON.stringify(cosmicLights)}): roomMean=${cosmicGreen.roomMean != null ? cosmicGreen.roomMean.toFixed(4) : "n/a"}`);
    ok(cosmicGreen.roomMean != null && cosmicRed.roomMean != null && cosmicGreen.roomMean > cosmicRed.roomMean,
      `GREEN: cosmic's own room reads brighter with the emissive path on (roomMean ${cosmicGreen.roomMean != null ? cosmicGreen.roomMean.toFixed(4) : "n/a"} > RED ${cosmicRed.roomMean != null ? cosmicRed.roomMean.toFixed(4) : "n/a"})`);
    ok(cosmicGreen.roomMean != null && cosmicRed.roomMean != null && cosmicGreen.roomMean >= cosmicRed.roomMean * COSMIC_IMPROVEMENT_RATIO,
      `the improvement is CLEAR, not marginal: emissive-on room >= ${COSMIC_IMPROVEMENT_RATIO}x the disabled baseline (ratio=${cosmicRed.roomMean ? (cosmicGreen.roomMean / cosmicRed.roomMean).toFixed(2) : "n/a"})`);

    // ================================================================
    // P-1 problem 3, REWRITTEN for docs/WALL-VOLUMES-PRACTICALS.md Unit E0 (2026-07-12) — WHY: the
    // old card/nub emitter system (INTERIOR_LIGHT_CARD / interiorBuildLightEmitterNub /
    // _interiorLightEmittersForTest) is retired — interiorBuildLights now mounts ONE physical FIXTURE
    // per light unconditionally (interiorBuildFixtureGroup), tagged fixtureEmitter and reachable via the
    // new _interiorFixtureEmittersForTest() seam. "Seat the glow" becomes "every light has a real
    // fixture body + emitter" (always true now, not a per-realm card/nub lookup that could miss).
    // ================================================================
    group("P-1c — every light resolves a real physical fixture with a visible emitter (RED-FIRST: the OLD card/nub seam is retired)");
    const EMIT_EPS = 0.05;
    async function fixtureEmitterNear(built) {
      const origin = await page.evaluate(() => window.Theater.interiorBoardOrigin());
      const emitters = await page.evaluate(() => window.Theater._interiorFixtureEmittersForTest());
      const ex = built.probe.torch.x - origin.cx, ez = built.probe.torch.z - origin.cz;
      return emitters.find((e) => Math.abs(e.x - ex) < EMIT_EPS && Math.abs(e.z - ez) < EMIT_EPS) || null;
    }

    // RED-FIRST: the OLD card/nub seam (_interiorLightEmittersForTest) now finds NOTHING — proves the
    // old system is genuinely retired from the production build path, not just unused-but-still-wired.
    await mountAndShoot(page, cosmicBuilt.board, path.join(outDir, "p1c-cosmic-RED-old-seam-empty.png"));
    const cosmicOldSeam = await page.evaluate(() => window.Theater._interiorLightEmittersForTest());
    ok(Array.isArray(cosmicOldSeam) && cosmicOldSeam.length === 0, `RED-FIRST: the OLD card/nub seam (_interiorLightEmittersForTest) returns EMPTY now (found ${JSON.stringify(cosmicOldSeam)}) — the old marker system is retired, not merely dormant`);

    // GREEN: the NEW fixture-emitter seam finds a real, physical fixture at the same light seed.
    const cosmicEmitter = await fixtureEmitterNear(cosmicBuilt);
    ok(!!cosmicEmitter, `GREEN: the NEW _interiorFixtureEmittersForTest() DOES find a real fixture emitter at cosmic's light seed (${JSON.stringify(cosmicEmitter)}) — E0's own "every light gets a fixture" replaces the old per-realm card/nub lookup`);
    ok(!!cosmicEmitter && cosmicEmitter.emissiveIntensity > 0, `cosmic (non-bright): the fixture's emitter is actually GLOWING (emissiveIntensity=${cosmicEmitter && cosmicEmitter.emissiveIntensity})`);

    // Full sweep, at production defaults: EVERY realm/profile now resolves a fixture — chrome/gloom/
    // fantasy/cosmic (non-bright) glow; lost-world/suburb/bright-kingdom (bright/daylit) keep the SAME
    // physical fixture body (§E0 "keep the fixture, drop the glow") but its emitter goes dark
    // (emissiveIntensity===0) — never "no fixture at all" the way the old system went to nothing.
    const coreRealmChecks = [
      { realmId: "chrome", lightProfile: "torchlit", bright: false },
      { realmId: "gloom", lightProfile: "torchlit", bright: false },
      { realmId: "fantasy", lightProfile: "torchlit", bright: false },
      { realmId: "lost-world", lightProfile: "daylit", bright: true },
      { realmId: "suburb", lightProfile: "daylit", bright: true },
      { realmId: "bright-kingdom", lightProfile: "daylit", bright: true },
      { realmId: "cosmic", lightProfile: "voidlit", bright: false },
    ];
    for (const cfg of coreRealmChecks) {
      const built = await buildScene(page, { realmId: cfg.realmId, lightProfile: cfg.lightProfile, walkId: "diegetic-p1c-" + cfg.realmId });
      if (!built.ok) { ok(false, `${cfg.realmId}: scene build failed: ${built.error}`); continue; }
      await mountAndShoot(page, built.board, path.join(outDir, `p1c-${cfg.realmId}-emitter.png`));
      const emitter = await fixtureEmitterNear(built);
      ok(!!emitter, `${cfg.realmId}: a real fixture emitter exists at the light seed (bright realms keep the fixture BODY too — found ${JSON.stringify(emitter)})`);
      if (cfg.bright) {
        ok(!!emitter && emitter.emissiveIntensity === 0, `${cfg.realmId} (bright profile): the fixture's emitter is DARK (emissiveIntensity=0) — suppressed, but the physical object is still there`);
      } else {
        ok(!!emitter && emitter.emissiveIntensity > 0, `${cfg.realmId} (non-bright): the fixture's emitter is GLOWING (emissiveIntensity=${emitter && emitter.emissiveIntensity})`);
      }
    }

    // ================================================================
    // LIGHT-CLOSE unit — PART A, REWRITTEN for E0 — bright-realm practical suppression. WHY: glowCount
    // is now 0 in EVERY production capture (the glow disc is diagnostics-only, ITR_GLOW_DISC_DIAGNOSTIC),
    // so the old "glowCount>0 (RED) -> glowCount===0 (GREEN)" proof no longer distinguishes suppressed
    // from unsuppressed — that signal moved to the FIXTURE's own emitter emissiveIntensity (glowDiscDiagnosticEnabled
    // stays OFF throughout this group, matching the real production path a player actually sees).
    // ================================================================
    group("LC-1 — bright-realm practicals suppress (suburb's fixture emitter goes dark; RED-FIRST proves it used to glow)");
    ok((await page.evaluate(() => window.Theater.glowDiscDiagnosticEnabled())) === false, "sanity: ITR_GLOW_DISC_DIAGNOSTIC stays at its real production default (off) throughout this group");
    await page.evaluate(() => window.Theater.setBrightPracticalsSuppressed(false));
    const lc1RedPng = await mountAndShoot(page, suburbBuilt.board, path.join(outDir, "lc1-suburb-RED-practicals-on.png"));
    const lc1Red = await measure(page, suburbBuilt.probe, lc1RedPng);
    ok(lc1Red.ok, "LC-1 RED-baseline frame measured: " + (lc1Red.error || "ok"));
    const lc1RedGlowCount = await page.evaluate(() => window.Theater.interiorLightGlowCount());
    const lc1RedEmitter = await fixtureEmitterNear(suburbBuilt);
    console.log(`  suburb daylit, suppression OFF (RED): glowCount=${lc1RedGlowCount} emitter=${JSON.stringify(lc1RedEmitter)} roomMean=${lc1Red.roomMean != null ? lc1Red.roomMean.toFixed(4) : "n/a"}`);
    ok(lc1RedGlowCount === 0, `glowCount stays 0 in production regardless of suppression state (glowCount=${lc1RedGlowCount}) — the diagnostics-only disc is not the suppression signal anymore`);
    ok(!!lc1RedEmitter, `RED-FIRST: with suppression OFF, suburb's torch DOES seat a real fixture (found ${JSON.stringify(lc1RedEmitter)})`);
    ok(!!lc1RedEmitter && lc1RedEmitter.emissiveIntensity > 0, `RED-FIRST: suburb's torch fixture emitter DOES glow (emissiveIntensity=${lc1RedEmitter && lc1RedEmitter.emissiveIntensity}) — the check below is load-bearing, not vacuous`);

    await page.evaluate(() => window.Theater.setBrightPracticalsSuppressed(true));
    const lc1GreenPng = await mountAndShoot(page, suburbBuilt.board, path.join(outDir, "lc1-suburb-GREEN-suppressed.png"));
    const lc1Green = await measure(page, suburbBuilt.probe, lc1GreenPng);
    ok(lc1Green.ok, "LC-1 GREEN frame measured: " + (lc1Green.error || "ok"));
    const lc1GreenEmitter = await fixtureEmitterNear(suburbBuilt);
    console.log(`  suburb daylit, suppression ON (GREEN, default): emitter=${JSON.stringify(lc1GreenEmitter)} roomMean=${lc1Green.roomMean != null ? lc1Green.roomMean.toFixed(4) : "n/a"}`);
    ok(!!lc1GreenEmitter, `GREEN: the fixture's own BODY is still there (§E0 "keep the fixture, drop the glow") — found ${JSON.stringify(lc1GreenEmitter)}`);
    ok(!!lc1GreenEmitter && lc1GreenEmitter.emissiveIntensity === 0, `GREEN: suppression ON — the fixture's emitter is now DARK (emissiveIntensity=${lc1GreenEmitter && lc1GreenEmitter.emissiveIntensity}), never a floating orb`);
    ok(lc1Green.roomMean != null && lc1Green.roomMean >= 0.05,
      `the suppression doesn't overcorrect into darkness: suburb's room still reads sky-lit (roomMean=${lc1Green.roomMean != null ? lc1Green.roomMean.toFixed(4) : "n/a"} >= 0.05)`);

    // ================================================================
    // LIGHT-CLOSE unit — REGRESSION: a torchlit/lamplit realm's practicals are UNAFFECTED (suppression
    // is bright-profile ONLY) — checked with the suppression flag left at its real default (on, set
    // just above) so this proves the gate discriminates by profile, not a global kill switch.
    // ================================================================
    group("LC-1-regression — gloom (torchlit) keeps its fixture emitter glowing; suppression never touches non-bright realms");
    await mountAndShoot(page, gloomBuilt.board, path.join(outDir, "lc1-gloom-torchlit-unaffected.png"));
    const gloomEmitterStill = await fixtureEmitterNear(gloomBuilt);
    ok(!!gloomEmitterStill && gloomEmitterStill.emissiveIntensity > 0, `gloom (torchlit) still glows with bright-suppression ON (found ${JSON.stringify(gloomEmitterStill)}) — suppression is bright-profile only`);

    // ================================================================
    // LIGHT-CLOSE unit — PART B: cosmic albedo lift (isolated from P-1b's emissive-light toggle via its
    // own ITR_EMISSIVE_ALBEDO_LIFT_DISABLED_FOR_TEST flag — the emissive ambient/hemi/key/fill stay ON
    // for BOTH captures here; only the floor/wall GEOMETRY albedo differs)
    // ================================================================
    group("LC-2 — cosmic's floor/wall albedo lift clears a legibility floor beyond P-1's own emissive-light plateau (RED-FIRST)");
    const ALBEDO_LEGIBILITY_FLOOR = 0.06; // clears P-1b's own measured ~0.02 emissive-light-only plateau with real headroom
    const ALBEDO_IMPROVEMENT_RATIO = 1.3;  // same "clear margin, not marginal" bar as L-4/P-1b
    await page.evaluate(() => window.Theater.setEmissiveAlbedoLiftDisabledForTest(true));
    const lc2RedPng = await mountAndShoot(page, cosmicBuilt.board, path.join(outDir, "lc2-cosmic-RED-no-albedo-lift.png"));
    const lc2Red = await measure(page, cosmicBuilt.probe, lc2RedPng);
    ok(lc2Red.ok, "LC-2 RED-baseline frame measured: " + (lc2Red.error || "ok"));
    console.log(`  cosmic voidlit, emissive light ON but albedo lift DISABLED (RED): roomMean=${lc2Red.roomMean != null ? lc2Red.roomMean.toFixed(4) : "n/a"}`);
    ok(lc2Red.roomMean != null && lc2Red.roomMean < ALBEDO_LEGIBILITY_FLOOR,
      `RED-FIRST: cosmic's own room stays under the legibility floor with the albedo lift disabled (roomMean=${lc2Red.roomMean != null ? lc2Red.roomMean.toFixed(4) : "n/a"} < ${ALBEDO_LEGIBILITY_FLOOR}) — the check is load-bearing`);

    await page.evaluate(() => window.Theater.setEmissiveAlbedoLiftDisabledForTest(false));
    const lc2GreenPng = await mountAndShoot(page, cosmicBuilt.board, path.join(outDir, "lc2-cosmic-GREEN-albedo-lifted.png"));
    const lc2Green = await measure(page, cosmicBuilt.probe, lc2GreenPng);
    ok(lc2Green.ok, "LC-2 GREEN frame measured: " + (lc2Green.error || "ok"));
    console.log(`  cosmic voidlit, albedo lift ON (GREEN, default): roomMean=${lc2Green.roomMean != null ? lc2Green.roomMean.toFixed(4) : "n/a"}`);
    ok(lc2Green.roomMean != null && lc2Red.roomMean != null && lc2Green.roomMean >= lc2Red.roomMean * ALBEDO_IMPROVEMENT_RATIO,
      `GREEN: the albedo lift alone clears a CLEAR margin over the RED baseline (>= ${ALBEDO_IMPROVEMENT_RATIO}x — ratio=${lc2Red.roomMean ? (lc2Green.roomMean / lc2Red.roomMean).toFixed(2) : "n/a"})`);
    ok(lc2Green.roomMean != null && lc2Green.roomMean >= ALBEDO_LEGIBILITY_FLOOR,
      `GREEN: cosmic's room clears the legibility floor (roomMean=${lc2Green.roomMean != null ? lc2Green.roomMean.toFixed(4) : "n/a"} >= ${ALBEDO_LEGIBILITY_FLOOR})`);

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
