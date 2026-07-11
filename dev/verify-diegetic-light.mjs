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
        let s = 0, cnt = 0;
        for (let i = 0; i < steps; i++) {
          for (let j = 0; j < steps; j++) {
            const fx = b.minX + (b.maxX - b.minX) * (i + 0.5) / steps;
            const fz = b.minZ + (b.maxZ - b.minZ) * (j + 0.5) / steps;
            const l = patchLum(toScreen(fx, fz, 0.3), rad);
            if (l != null) { s += l; cnt++; }
          }
        }
        out.roomMean = cnt ? s / cnt : null;
        out.roomSamples = cnt;
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
