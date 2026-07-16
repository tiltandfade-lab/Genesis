#!/usr/bin/env node
/* dev/battle-gate/pal-ab-cards/capture-pal-card4-hires.mjs — CARD 4: the HIGH-RESOLUTION palette
   verdict card (Adam, on card2 at deviceScaleFactor 1: "very difficult to tell with the render at
   that resolution, i am still leaning towards the originals though. the colors are richer and the
   blends are smoother"). Card 2 (card2-palette-on-off.png, landed on chore/pal-ab-washout-cards) was
   too soft to rule on. This script re-runs the SAME quantized-vs-originals comparison at retina
   density with a per-subject THREE-way row (raw file | in-engine original | in-engine quantized),
   tight-cropped to fill the frame, plus a measured banding metric — EVIDENCE ONLY (this script and
   its outputs are the entire diff; no product code/asset touched).

   Model: EXTENDS dev/battle-gate/pal-ab-cards/capture-pal-ab-cards.mjs's own machinery — the boot/
   server/Chrome/board-fixture code, the numeric camera-identity proof, the PALETTE-OFF request-
   intercept + cache-bust mechanism, and the light-chain gotchas are all copied VERBATIM from that
   file (see its own header for the "why" of each — not re-derived here). What's NEW for card4:

     1. deviceScaleFactor 2 (retina) — every capture this unit at 2x device pixel density (SHOT_W x
        SHOT_H CSS px -> (SHOT_W*DSF) x (SHOT_H*DSF) actual PNG px). All crop-rect math that was
        CSS-pixel-space in the parent script (canvasBox from boundingBox(), NDC->pixel projection)
        stays CSS-space through computePieceObservations/cropRectFor, then gets scaled by DSF exactly
        once (scaleRectToDevicePixels) before it's used to slice the actual (DSF-scaled) screenshot
        PNG — mixing the two spaces anywhere else would silently crop the wrong region at 2x.

     2. SIX subjects (gradient/blend-heavy where quantization banding shows), one card4 row each:
        Wolf (fur), Air Elemental (wispy translucent gradient), Giant Fire Beetle (glow blend),
        Dragonborn Barbarian Male (pc), Adult Blue Dragon (Adam's named proven case), Adult Copper
        Dragon. All 6 verified present in quarantine-pack/pre-unification/originals-r2.zip AND already
        extracted to the session scratch dir (5 of 6 reused verbatim from the card2/card3 run's own
        ORIGINALS_DIR; Air Elemental is the one NEW extraction this script's setup step performed, same
        `unzip -p ... > scratch/pal-ab-originals/spr-fantasy-air-elemental.png` one-shot, byte-verified
        against the zip's own listed size (105545) before this script was written). NOTE: Ghost was the
        FIRST pick for "wispy gradient" (per this unit's own instruction, "ghost or air-elemental") but
        its registry entry carries `verdict:"fail"` — spriteEntryFor's own TIER-2 join
        (theater-boot.js:2977, `if(e.verdict==="fail") continue`) means review-failed art NEVER renders
        as a sprite in production, it falls through to the 3D placeholder chain instead — so Ghost
        physically cannot be mounted as a sprite piece at all. Discovered by an actual failed run of
        this script (not predicted), swapped to Air Elemental (`verdict:"pass"`) per the task's own
        named alternative, not a substitution invented here.

     3. Per subject, a THREE-way row: [raw original PNG file, alpha-trimmed + tight-fit on neutral] |
        [in-engine ORIGINAL served via the SAME palette-off intercept, tight crop] | [in-engine
        QUANTIZED (production), tight crop] — the in-engine pair is the SAME scene/camera (asserted
        every shutter via cameraDelta, identical to the parent script), torchlit, cropped to a small
        ~10% pad around the piece's own projected silhouette (padFrac 0.10 vs the parent script's 0.35
        — this unit's own "fill the crop" instruction, not a cosmetic tightening).

     4. Banding metric per subject, computed for the IN-ENGINE PAIR only (original-served vs
        quantized, same diff-masked sprite region — the same "diff-masked (engine crop)" methodology
        the parent script documents, extended here with two new numbers):
          - uniqueColors: count of distinct (r,g,b) byte-tuples within the diff-masked crop.
          - meanAbsHueDeltaAdjacent: mean circular HSL-hue distance between every diff-masked pixel and
            its right/below diff-masked neighbor (display-space, un-linearized, same as the parent
            script's rmsContrast convention) — a literal "how big are the local hue jumps" number: a
            genuinely smooth gradient has small adjacent deltas everywhere; palette banding shows up as
            a small number of large jumps at the ring seams, which pulls this mean UP even when most
            of the region is flat. Reported alongside uniqueColors, not instead of it — a low color
            count with LOW hue-delta is legitimately a flat design (Ghost's robe), not banding; a low
            color count with a HIGH hue-delta is the banding signature this metric exists to catch.
          Neither number claims to BE "richness" or "smoothness" on its own — they're the two honest
          proxies asked for; the READ in this file's own tail (and results-card4-hires.json's
          `verdicts` block) is a human judgment informed by them, not derived from them mechanically.

   Run:  node dev/battle-gate/pal-ab-cards/capture-pal-card4-hires.mjs
   Output: dev/battle-gate/pal-ab-cards/shots/card4-row-<slug>.png (per-subject 3-way row, full res)
           dev/battle-gate/pal-ab-cards/card4-hires-verdict.png (all 6 rows stacked)
           dev/battle-gate/pal-ab-cards/results-card4-hires.json */

import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const outDir = __dirname;
const shotsDir = path.join(outDir, "shots");
fs.mkdirSync(shotsDir, { recursive: true });

// same scratch dir the card2/card3 run used — Ghost is the one new extraction this unit's own setup
// step added to it (see this file's header). Never inside this repo.
const ORIGINALS_DIR = process.env.PAL_AB_ORIGINALS_DIR
  || "/private/tmp/claude-501/-Volumes-Genesis-Genesis/511b0c52-df6c-4cdb-81d7-16f6f0dd9e7c/scratchpad/pal-ab-originals";

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5406, 5407, 5408, 5409, 5410];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[pal-card4-hires]", ...a); }
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

// ─── RETINA: DSF=2 — the whole point of this unit. SHOT_W/SHOT_H stay CSS px; the actual screenshot
// PNG is (SHOT_W*DSF) x (SHOT_H*DSF). See this file's header item 1 for the crop-rect space discipline
// this requires downstream.
const SHOT_W = 1600, SHOT_H = 1200, DSF = 2;
const PHYS_W = SHOT_W * DSF, PHYS_H = SHOT_H * DSF;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: DSF } });
}

// CAST — 6 registry slugs, all verified present in the zip + registry + ORIGINALS_DIR before this
// script was written (see header). Ordering follows the parent script's own spacing law verbatim:
// the two Gargantuan/Huge dragons sit TOGETHER at one end (their own mutual overlap is accepted —
// Adam wants both in frame), the four modest-scale pieces occupy the rest so no 20ft silhouette
// bleeds into a neighbor's crop rect. Air Elemental takes the "wispy gradient" slot (Ghost is
// verdict:"fail" in the registry — see header note — so it cannot mount as a sprite at all).
const CAST = [
  { pieceSlug: "Wolf", registrySlug: "spr-fantasy-wolf", note: "fur — gradient/blend case" },
  { pieceSlug: "Air Elemental", registrySlug: "spr-fantasy-air-elemental", note: "wispy translucent gradient" },
  { pieceSlug: "Giant Fire Beetle", registrySlug: "spr-fantasy-giant-fire-beetle", note: "glow blend (small — expect a tight crop)" },
  { pieceSlug: "Dragonborn Barbarian (Male)", registrySlug: "spr-pc-dragonborn-barbarian-male", note: "pc slug" },
  { pieceSlug: "Adult Blue Dragon", registrySlug: "spr-fantasy-adult-blue-dragon", note: "Adam's named proven case" },
  { pieceSlug: "Adult Copper Dragon", registrySlug: "spr-fantasy-adult-copper-dragon", note: "Adam's loved one" },
];
const REALM = "fantasy";
const LIGHT_PROFILE = "torchlit"; // one torchlit interior light for every card, per the parent unit's own instruction.

async function newPage(browser, paletteOffState) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = req.url();
    if (url.endsWith("/favicon.ico")) {
      req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
      return;
    }
    // PALETTE-OFF intercept — verbatim from the parent script's own "PALETTE-OFF MECHANISM" (see
    // its header): only fires for the EXACT "<slug>.png?palOrig=1" cache-busted form of a known cast
    // slug; every other request (incl. the same slug's plain production URL) falls through.
    if (paletteOffState.active) {
      const m = url.match(/\/assets\/sprites\/(spr-[a-z0-9-]+)\.png\?palOrig=1$/);
      if (m && paletteOffState.files[m[1]]) {
        req.respond({ status: 200, contentType: "image/png", body: paletteOffState.files[m[1]] });
        return;
      }
    }
    req.continue();
  });
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  page.on("response", (res) => { if (res.status() >= 400 && !res.url().includes("palOrig=1")) log("HTTP", res.status(), res.url()); });
  return page;
}

// bootToInSession/waitForTheater/waitForRepaint — verbatim from capture-pal-ab-cards.mjs.
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
      if (nameEl) nameEl.value = "Pal Card4 Hires Soul";
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
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

// buildLineupBoard/lineupPositions — verbatim port, INCLUDING the sizeClass override for a 6-piece
// cast (see the parent script's own header for the "why" of the guard-cell spacing law).
async function buildLineupBoard(page, realmId) {
  return await page.evaluate((realmId) => {
    try {
      function buildFixture(topology, n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const group = topology === "The Hub" ? "hub" : "linear";
        const edges = [];
        if (group === "hub") {
          const spokeCount = Math.min(n - 1, 4);
          for (let i = 1; i < n; i++) edges.push([ids[0], ids[Math.min(i, spokeCount)]]);
        } else {
          for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
        }
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
          exits: (adj[id] || []).map((tid) => ({ targetId: tid })),
          light: "normal",
        }));
      }
      const fixture = buildFixture("The Hub", 6);
      const plan = spatializePlan(fixture, "The Hub", { walkId: "pal-card4-hires-" + realmId, sizeClass: { minW: 22, maxW: 26, minD: 10, maxD: 12 } });
      const focusRoom = plan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(plan, { realmId, env: "dungeon", focusSegNum, radius: 1 });
      return { ok: true, board, room: { x: focusRoom.x, y: focusRoom.y, w: focusRoom.w, d: focusRoom.d } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, realmId);
}
function lineupPositions(room, count) {
  const marginCells = 1;
  const loX = room.x + marginCells;
  const hiX = room.x + room.w - 1 - marginCells;
  const usable = Math.max(0, hiX - loX);
  const midY = Math.round(room.y + room.d / 2);
  const step = count > 1 ? usable / (count - 1) : 0;
  const positions = [];
  for (let i = 0; i < count; i++) positions.push({ x: Math.round(loX + step * i), y: midY });
  const compressed = count > 1 && step < 1;
  return { positions, compressed, loX, hiX, usable };
}

// mountBoard — verbatim from the parent script, INCLUDING its own "never call renderWorld() after
// setInteriorBoard while waiting" gotcha.
async function mountBoard(page, board, cacheBustLabel) {
  const mounted = await page.evaluate((board, cacheBustLabel) => {
    try {
      const clone = (typeof structuredClone === "function") ? structuredClone(board) : JSON.parse(JSON.stringify(board));
      if (cacheBustLabel != null) clone._abCacheBust = cacheBustLabel;
      window.Theater.setInteriorBoard(clone);
      return { ok: true, piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, board, cacheBustLabel);
  if (!mounted.ok) return mounted;
  if (mounted.piecesRequested > 0) {
    const deadline = Date.now() + 8000;
    let latest = mounted;
    let ticks = 0;
    while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
      await sleep(250);
      latest = await page.evaluate(() => ({
        piecesResolved: window.Theater.interiorPiecesResolved(),
        piecesRequested: window.Theater.interiorPiecesRequested(),
      }));
      ticks++;
    }
    mounted.piecesResolved = latest.piecesResolved;
    mounted.settleTicks = ticks;
    mounted.timedOut = latest.piecesResolved < latest.piecesRequested;
  }
  return mounted;
}

async function verifyCastResolution(page, cast) {
  return await page.evaluate((cast) => {
    return cast.map((c) => {
      const entry = window.Theater._spriteEntryForTest ? window.Theater._spriteEntryForTest(c.pieceSlug) : null;
      if (!entry) return { pieceSlug: c.pieceSlug, registrySlug: c.registrySlug, ok: false, reason: "no registry entry" };
      const resolvedPath = window.Theater._spriteAssetPathForTest ? window.Theater._spriteAssetPathForTest(entry) : null;
      const cacheEntry = window.Theater._spriteTextureCache ? window.Theater._spriteTextureCache[entry.slug] : undefined;
      const isLoadedTexture = !!(cacheEntry && typeof cacheEntry === "object" && cacheEntry.isTexture);
      const textureState = isLoadedTexture ? "loaded" : (cacheEntry === "pending" ? "pending" : (cacheEntry === "failed" ? "failed" : "never-requested"));
      return { pieceSlug: c.pieceSlug, registrySlug: entry.slug, resolvedPath, textureState, worldHeight: entry.worldHeight };
    });
  }, cast);
}

// camera pose + projection math — verbatim port from the parent script (CSS-pixel space throughout;
// DSF scaling is applied ONLY at crop time — see cropRectFor/scaleRectToDevicePixels below).
async function readSceneTelemetry(page) {
  return await page.evaluate(() => {
    const ctx = window.Theater._graphicsResearchContextForTest ? window.Theater._graphicsResearchContextForTest() : null;
    if (!ctx || !ctx.camera) return { ok: false, reason: "no graphics-research ctx seam" };
    const cam = ctx.camera;
    const pieces = [];
    if (ctx.interiorGroup) {
      ctx.interiorGroup.traverse((obj) => {
        if (obj.userData && obj.userData.sprite && obj.userData.spriteSlug) {
          const e = obj.matrixWorld.elements;
          const wp = { x: e[12], y: e[13], z: e[14] };
          pieces.push({
            spriteSlug: obj.userData.spriteSlug,
            worldPos: { x: wp.x, y: wp.y, z: wp.z },
            interiorWidth: obj.userData.interiorWidth || null,
            interiorHeight: obj.userData.interiorHeight || null,
          });
        }
      });
    }
    return {
      ok: true,
      camera: {
        position: { x: cam.position.x, y: cam.position.y, z: cam.position.z },
        fov: cam.fov, aspect: cam.aspect,
        matrixWorld: cam.matrixWorld.elements.slice(),
        projectionMatrix: cam.projectionMatrix.elements.slice(),
        matrixWorldInverse: cam.matrixWorldInverse.elements.slice(),
      },
      pieces,
    };
  });
}
async function setCameraPose(page, pos, lookAt) {
  return await page.evaluate((pos, lookAt) => {
    if (!window.Theater._setInteriorCameraPoseForTest) return false;
    return window.Theater._setInteriorCameraPoseForTest(pos, lookAt);
  }, pos, lookAt);
}
function multiplyMatVec(mat, v) {
  const e = mat;
  const x = v.x, y = v.y, z = v.z;
  const w = e[3] * x + e[7] * y + e[11] * z + e[15];
  return { x: e[0]*x+e[4]*y+e[8]*z+e[12], y: e[1]*x+e[5]*y+e[9]*z+e[13], z: e[2]*x+e[6]*y+e[10]*z+e[14], w: w || 1 };
}
function worldToNdc(worldPos, camera) {
  const view = multiplyMatVec(camera.matrixWorldInverse, worldPos);
  const clip = multiplyMatVec(camera.projectionMatrix, view);
  return { x: clip.x / clip.w, y: clip.y / clip.w, z: clip.z / clip.w };
}
function ndcToPixel(ndc, canvasBox) {
  return { x: canvasBox.x + ((ndc.x + 1) / 2) * canvasBox.width, y: canvasBox.y + (1 - (ndc.y + 1) / 2) * canvasBox.height };
}
function cameraRightWorld(camera) {
  const e = camera.matrixWorld;
  const rx = e[0], ry = e[1], rz = e[2];
  const len = Math.hypot(rx, ry, rz) || 1;
  return { x: rx / len, y: ry / len, z: rz / len };
}
function cameraForwardWorld(camera) {
  const e = camera.matrixWorld;
  const fx = -e[8], fy = -e[9], fz = -e[10];
  const len = Math.hypot(fx, fy, fz) || 1;
  return { x: fx / len, y: fy / len, z: fz / len };
}
function computePieceObservations(telemetry, canvasBox) {
  const cam = telemetry.camera;
  const right = cameraRightWorld(cam);
  return telemetry.pieces.map((p) => {
    const midHeight = { x: p.worldPos.x, y: p.worldPos.y + (p.interiorHeight || 0) / 2, z: p.worldPos.z };
    const footPoint = p.worldPos;
    const topPoint = { x: p.worldPos.x, y: p.worldPos.y + (p.interiorHeight || 0), z: p.worldPos.z };
    const halfW = (p.interiorWidth || 0) / 2;
    const leftPoint = { x: midHeight.x - right.x * halfW, y: midHeight.y - right.y * halfW, z: midHeight.z - right.z * halfW };
    const rightPoint = { x: midHeight.x + right.x * halfW, y: midHeight.y + right.y * halfW, z: midHeight.z + right.z * halfW };
    const footPx = ndcToPixel(worldToNdc(footPoint, cam), canvasBox);
    const topPx = ndcToPixel(worldToNdc(topPoint, cam), canvasBox);
    const leftPx = ndcToPixel(worldToNdc(leftPoint, cam), canvasBox);
    const rightPx = ndcToPixel(worldToNdc(rightPoint, cam), canvasBox);
    return {
      spriteSlug: p.spriteSlug,
      interiorWidth: p.interiorWidth, interiorHeight: p.interiorHeight,
      worldPos: p.worldPos,
      projectedFootPx: { x: Math.round(footPx.x), y: Math.round(footPx.y) },
      projectedTopPx: { x: Math.round(topPx.x), y: Math.round(topPx.y) },
      projectedLeftPx: { x: Math.round(leftPx.x), y: Math.round(leftPx.y) },
      projectedRightPx: { x: Math.round(rightPx.x), y: Math.round(rightPx.y) },
      projectedWidthPx: Math.round(Math.hypot(rightPx.x - leftPx.x, rightPx.y - leftPx.y)),
    };
  });
}
function cameraDelta(a, b) {
  if (!a || !b) return { ok: false, maxDelta: null };
  const posDelta = Math.max(Math.abs(a.position.x-b.position.x), Math.abs(a.position.y-b.position.y), Math.abs(a.position.z-b.position.z));
  let matDelta = 0;
  for (let i = 0; i < 16; i++) matDelta = Math.max(matDelta, Math.abs(a.matrixWorld[i] - b.matrixWorld[i]));
  const maxDelta = Math.max(posDelta, matDelta);
  return { ok: true, positionMaxDelta: posDelta, matrixWorldMaxDelta: matDelta, maxDelta, identical: maxDelta < 1e-6 };
}

async function setPaletteOff(page, cast, on) {
  return await page.evaluate((cast, on) => {
    if (typeof SPRITE_REGISTRY === "undefined") return { ok: false, reason: "SPRITE_REGISTRY not loaded" };
    const results = [];
    cast.forEach((c) => {
      const e = SPRITE_REGISTRY[c.registrySlug];
      if (!e) { results.push({ registrySlug: c.registrySlug, ok: false }); return; }
      const prior = e.legacyAsset;
      e.legacyAsset = on ? ("assets/sprites/" + c.registrySlug + ".png?palOrig=1") : ("assets/sprites/" + c.registrySlug + ".png");
      results.push({ registrySlug: c.registrySlug, prior, now: e.legacyAsset });
    });
    return { ok: true, results };
  }, cast, on);
}

async function shootFullPage(page, shotPath) {
  await page.screenshot({ path: shotPath, fullPage: false });
}

// ─── in-page pixel-stat helpers — NEW for card4: extends the parent script's alpha/diff stats with
// uniqueColors + meanAbsHueDeltaAdjacent (this file's header item 4 documents the methodology and its
// honest limits). Loaded once via page.evaluate(fn) since canvas getImageData is browser-only.
function pixelStatsBrowserFns() {
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h, s, l };
  }
  function hueDist(h1, h2) { const d = Math.abs(h1 - h2); return Math.min(d, 1 - d); }

  // raw-file (alpha-masked) stats, incl. tight alpha bbox for the "trim + fill the crop" raw panel.
  window.__c4AlphaBBox = function (b64, alphaThreshold) {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
        const ctx = c.getContext("2d"); ctx.drawImage(im, 0, 0);
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
        for (let y = 0; y < c.height; y++) {
          for (let x = 0; x < c.width; x++) {
            const a = data[(y * c.width + x) * 4 + 3];
            if (a > alphaThreshold) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          }
        }
        if (x1 < 0) { resolve({ ok: false, width: im.width, height: im.height }); return; }
        resolve({ ok: true, width: im.width, height: im.height, bbox: { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } });
      };
      im.onerror = () => resolve({ ok: false, error: "image failed to load" });
      im.src = "data:image/png;base64," + b64;
    });
  };
  window.__c4AlphaStats = function (b64, alphaThreshold) {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
        const ctx = c.getContext("2d"); ctx.drawImage(im, 0, 0);
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let n = 0, satSum = 0; const lumas = []; const colorSet = new Set();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a <= alphaThreshold) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const { s } = rgbToHsl(r, g, b);
          satSum += s; n++;
          lumas.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
          colorSet.add(r + "," + g + "," + b);
        }
        if (n === 0) { resolve({ n: 0, meanSaturation: null, rmsContrast: null, uniqueColors: 0 }); return; }
        const meanL = lumas.reduce((a, b) => a + b, 0) / n;
        const variance = lumas.reduce((a, l) => a + (l - meanL) * (l - meanL), 0) / n;
        const stdev = Math.sqrt(variance);
        resolve({ n, width: im.width, height: im.height, meanSaturation: satSum / n, rmsContrast: meanL > 0 ? stdev / meanL : null, meanLuma: meanL, uniqueColors: colorSet.size });
      };
      im.onerror = () => resolve({ n: 0, error: "image failed to load" });
      im.src = "data:image/png;base64," + b64;
    });
  };
  // diff-masked in-engine crop stats — the "in-engine pair" banding metric (uniqueColors +
  // meanAbsHueDeltaAdjacent) computed ONLY over pixels that differ from the same-camera/same-light
  // zero-piece background render (the mechanical "sprite pixel" definition, same as the parent
  // script's diffStats — extended here, not replaced).
  window.__c4DiffStats = function (castB64, bgB64, rect, diffThreshold) {
    return new Promise((resolve) => {
      let loaded = 0; let castImg, bgImg;
      const onBoth = () => {
        const w = rect.w, h = rect.h;
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        ctx.drawImage(castImg, rect.x, rect.y, w, h, 0, 0, w, h);
        const castData = ctx.getImageData(0, 0, w, h).data;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(bgImg, rect.x, rect.y, w, h, 0, 0, w, h);
        const bgData = ctx.getImageData(0, 0, w, h).data;
        const mask = new Uint8Array(w * h);
        const hueGrid = new Float32Array(w * h); hueGrid.fill(-1);
        const colorSet = new Set();
        let n = 0, satSum = 0; const lumas = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = y * w + x, i = idx * 4;
            const dr = Math.abs(castData[i] - bgData[i]), dg = Math.abs(castData[i + 1] - bgData[i + 1]), db = Math.abs(castData[i + 2] - bgData[i + 2]);
            if (Math.max(dr, dg, db) <= diffThreshold) continue;
            mask[idx] = 1; n++;
            const r = castData[i], g = castData[i + 1], b = castData[i + 2];
            const hs = rgbToHsl(r, g, b);
            hueGrid[idx] = hs.h; satSum += hs.s;
            lumas.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
            colorSet.add(r + "," + g + "," + b);
          }
        }
        if (n === 0) { resolve({ n: 0, meanSaturation: null, rmsContrast: null, uniqueColors: 0, meanAbsHueDeltaAdjacent: null, rect }); return; }
        const meanL = lumas.reduce((a, b) => a + b, 0) / n;
        const variance = lumas.reduce((a, l) => a + (l - meanL) * (l - meanL), 0) / n;
        const stdev = Math.sqrt(variance);
        let hueDeltaSum = 0, hueDeltaN = 0;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            if (!mask[idx]) continue;
            if (x + 1 < w && mask[idx + 1]) { hueDeltaSum += hueDist(hueGrid[idx], hueGrid[idx + 1]); hueDeltaN++; }
            if (y + 1 < h && mask[idx + w]) { hueDeltaSum += hueDist(hueGrid[idx], hueGrid[idx + w]); hueDeltaN++; }
          }
        }
        resolve({ n, meanSaturation: satSum / n, rmsContrast: meanL > 0 ? stdev / meanL : null, meanLuma: meanL, uniqueColors: colorSet.size, meanAbsHueDeltaAdjacent: hueDeltaN ? hueDeltaSum / hueDeltaN : null, rect, maskedFraction: n / (w * h) });
      };
      castImg = new Image(); castImg.onload = () => { loaded++; if (loaded === 2) onBoth(); }; castImg.src = "data:image/png;base64," + castB64;
      bgImg = new Image(); bgImg.onload = () => { loaded++; if (loaded === 2) onBoth(); }; bgImg.src = "data:image/png;base64," + bgB64;
    });
  };
}
async function installPixelStatFns(page) { await page.evaluate(pixelStatsBrowserFns); }
async function alphaBBox(page, b64, alphaThreshold = 10) { return await page.evaluate((b64, t) => window.__c4AlphaBBox(b64, t), b64, alphaThreshold); }
async function alphaStats(page, b64, alphaThreshold = 10) { return await page.evaluate((b64, t) => window.__c4AlphaStats(b64, t), b64, alphaThreshold); }
async function diffStats(page, castB64, bgB64, rect, diffThreshold = 24) { return await page.evaluate((c, b, r, t) => window.__c4DiffStats(c, b, r, t), castB64, bgB64, rect, diffThreshold); }

// piece crop rect in CSS-pixel space (SAME space as canvasBox/computePieceObservations) — padFrac is
// TIGHT (0.10) per this unit's own "fill the crop" instruction, vs the parent script's 0.35.
function cropRectFor(obs, padFrac = 0.10) {
  const xs = [obs.projectedLeftPx.x, obs.projectedRightPx.x, obs.projectedFootPx.x, obs.projectedTopPx.x];
  const ys = [obs.projectedTopPx.y, obs.projectedFootPx.y];
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const w = Math.max(4, x1 - x0), h = Math.max(4, y1 - y0);
  const padX = w * padFrac, padY = h * padFrac * 0.4;
  x0 = Math.max(0, Math.round(x0 - padX)); y0 = Math.max(0, Math.round(y0 - padY));
  const w2 = Math.round(w + 2 * padX), h2 = Math.round(h + 2 * padY);
  return { x: x0, y: y0, w: Math.min(w2, SHOT_W - x0), h: Math.min(h2, SHOT_H - y0) };
}
// scales a CSS-pixel-space rect into the actual (DSF-scaled) screenshot's pixel space, clamped to the
// physical canvas bounds — see this file's header item 1 for why this has to happen exactly once.
function scaleRectToDevicePixels(rect) {
  const x = Math.round(rect.x * DSF), y = Math.round(rect.y * DSF);
  const w = Math.round(rect.w * DSF), h = Math.round(rect.h * DSF);
  return { x, y, w: Math.min(w, PHYS_W - x), h: Math.min(h, PHYS_H - y) };
}

function readPngB64(p) { return fs.readFileSync(p).toString("base64"); }

async function main() {
  let branch = null, sha = null;
  try { branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoRoot }).toString().trim(); } catch (e) {}
  try { sha = execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim(); } catch (e) {}

  const sampleSet = CAST.map((c) => {
    const p = path.join(ORIGINALS_DIR, c.registrySlug + ".png");
    return { slug: c.registrySlug, extractedPath: p, present: fs.existsSync(p), bytes: fs.existsSync(p) ? fs.statSync(p).size : null };
  });
  const missing = sampleSet.filter((s) => !s.present);
  if (missing.length) throw new Error("MISSING originals (fatal for card4 — every subject needs its raw file column): " + missing.map((m) => m.slug).join(", "));

  const server = await startServer();
  log("server:", BASE);
  const browser = await launchChrome();

  const paletteOffState = { active: false, files: {} };
  for (const c of CAST) {
    const p = path.join(ORIGINALS_DIR, c.registrySlug + ".png");
    paletteOffState.files[c.registrySlug] = fs.readFileSync(p);
  }

  const summary = {
    generatedAt: new Date().toISOString(), branch, sha, realm: REALM, lightProfile: LIGHT_PROFILE,
    deviceScaleFactor: DSF, shotCssPx: { w: SHOT_W, h: SHOT_H }, shotPhysicalPx: { w: PHYS_W, h: PHYS_H },
    sampleSet, castLineup: CAST,
    methodology: {
      saturation: "mean HSL S (0..1) over included pixels",
      contrast: "RMS/coefficient-of-variation: stdev(sRGB luma 0.2126R+0.7152G+0.0722B) / mean(luma), display-space bytes, not linearized",
      rawFileMask: "raw PNG: alpha > 10 (true alpha channel), trimmed to its own tight alpha bbox before compositing",
      engineCropMask: "engine crop: per-pixel max(|cast_channel - bg_channel|) > 24/255 against a same-camera/same-light/zero-piece background render of the identical room, in PHYSICAL (DSF=2) pixel space",
      uniqueColors: "count of distinct (r,g,b) byte-tuples within the masked region",
      meanAbsHueDeltaAdjacent: "mean circular HSL-hue distance between each masked pixel and its right/below masked neighbor — a local-jump ('banding') proxy, computed for the in-engine original-vs-quantized pair only",
    },
    notes: [],
    camera: { poses: [] },
  };

  try {
    const page = await newPage(browser, paletteOffState);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    await installPixelStatFns(page);

    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("setInteriorBoard never available: " + JSON.stringify(theaterState));

    const built = await buildLineupBoard(page, REALM);
    if (!built.ok) throw new Error("buildLineupBoard failed: " + built.error);
    const lineup = lineupPositions(built.room, CAST.length);
    if (lineup.compressed) summary.notes.push(`lineupPositions: room.w=${built.room.w} compressed spacing for ${CAST.length} cast members (usable=${lineup.usable}).`);
    summary.room = built.room; summary.lineupPositions = lineup.positions;

    const castBoard = JSON.parse(JSON.stringify(built.board));
    castBoard.lightProfile = LIGHT_PROFILE;
    castBoard.pieces = CAST.map((c, i) => ({ slug: c.pieceSlug, cellX: lineup.positions[i].x, cellY: lineup.positions[i].y }));
    const emptyBoard = JSON.parse(JSON.stringify(built.board));
    emptyBoard.lightProfile = LIGHT_PROFILE;
    emptyBoard.pieces = [];

    const canvasEl = await page.$(".theater-stage-canvas canvas");
    const canvasBox = canvasEl ? await canvasEl.boundingBox() : null;
    if (!canvasBox) throw new Error("theater canvas has no bounding box");
    summary.canvasBoxCssPx = canvasBox;

    const prod = await page.evaluate(() => ({ tunables: window.Theater._lightTunablesForTest(), tonemap: window.Theater._gradeTonemapForTest() }));
    summary.productionDefaults = { spriteEmissiveFloor: prod.tunables.spriteEmissiveFloor, gradeTintScale: prod.tunables.gradeTintScale, tonemap: prod.tonemap };
    log("production defaults:", JSON.stringify(summary.productionDefaults));

    // ─── FIRST mount: production (quantized) baseline cast — establishes the ONE camera pose reused
    // for every subsequent shutter (numerically asserted each time via cameraDelta). ───
    const mounted0 = await mountBoard(page, castBoard, "card4:baseline:cast:v1");
    if (!mounted0.ok) throw new Error("baseline cast mount FAILED: " + mounted0.error);
    await sleep(200);
    const tele0 = await readSceneTelemetry(page);
    if (!tele0.ok) throw new Error("no telemetry: " + tele0.reason);
    const controlCam = tele0.camera;
    const forward = cameraForwardWorld(controlCam);
    const lookAtPoint = { x: controlCam.position.x + forward.x * 10, y: controlCam.position.y + forward.y * 10, z: controlCam.position.z + forward.z * 10 };
    await setCameraPose(page, controlCam.position, lookAtPoint);
    await waitForRepaint(page); await sleep(150);

    async function shutter(label) {
      await setCameraPose(page, controlCam.position, lookAtPoint);
      await waitForRepaint(page); await sleep(150);
      const shotPath = path.join(shotsDir, `${label}.png`);
      await shootFullPage(page, shotPath);
      const tele = await readSceneTelemetry(page);
      const delta = tele.ok ? cameraDelta(controlCam, tele.camera) : { ok: false };
      summary.camera.poses.push({ label, identical: delta.identical, maxDelta: delta.maxDelta });
      return { shotPath, tele, delta };
    }

    const quantShot = await shutter("card4-quantized-cast");
    const quantResolution = await verifyCastResolution(page, CAST);
    const quantObs = quantShot.tele.ok ? computePieceObservations(quantShot.tele, canvasBox) : [];

    const emptyMounted0 = await mountBoard(page, emptyBoard, "card4:baseline:bg:v1");
    if (!emptyMounted0.ok) throw new Error("baseline bg mount FAILED: " + emptyMounted0.error);
    await sleep(200);
    const bgShot = await shutter("card4-baseline-bg");

    // assert the actual PNG dimensions really are DSF-scaled before trusting any crop math downstream.
    const dims = await page.evaluate((p) => new Promise((resolve) => { const im = new Image(); im.onload = () => resolve({ w: im.width, h: im.height }); im.src = p; }), "data:image/png;base64," + readPngB64(quantShot.shotPath));
    summary.screenshotActualPx = dims;
    if (dims.w !== PHYS_W || dims.h !== PHYS_H) summary.notes.push(`WARNING: screenshot actual px ${dims.w}x${dims.h} != expected PHYS_W/H ${PHYS_W}x${PHYS_H} — DSF may not have applied as assumed.`);

    // ─── originals-served (palette OFF) pass ───
    log("=== originals-served pass ===");
    await setPaletteOff(page, CAST, true);
    paletteOffState.active = true;
    const originalsMounted = await mountBoard(page, castBoard, "card4:originals:cast:v1");
    if (!originalsMounted.ok) summary.notes.push("originals mount FAILED: " + originalsMounted.error);
    await sleep(200);
    const originalsResolution = await verifyCastResolution(page, CAST);
    const originalsShot = await shutter("card4-originals-cast");
    const originalsObs = originalsShot.tele.ok ? computePieceObservations(originalsShot.tele, canvasBox) : [];
    paletteOffState.active = false;
    await setPaletteOff(page, CAST, false);

    // ─── per-subject THREE-way rows ───
    log("=== building per-subject rows ===");
    const compPage = await browser.newPage();
    const quantB64 = readPngB64(quantShot.shotPath);
    const origB64 = readPngB64(originalsShot.shotPath);
    const bgB64 = readPngB64(bgShot.shotPath);

    const rows = [];
    for (const c of CAST) {
      const obsQ = quantObs.find((o) => o.spriteSlug === c.registrySlug || o.spriteSlug === c.pieceSlug);
      const rawPath = path.join(ORIGINALS_DIR, c.registrySlug + ".png");
      const rawB64 = readPngB64(rawPath);
      const rawBBox = await alphaBBox(page, rawB64);
      const rawStats = await alphaStats(page, rawB64);

      if (!obsQ) { rows.push({ registrySlug: c.registrySlug, pieceSlug: c.pieceSlug, ok: false, reason: "not resolved in interiorGroup" }); continue; }

      const rectCss = cropRectFor(obsQ);
      const rectPhys = scaleRectToDevicePixels(rectCss);

      const quantStats = await diffStats(page, quantB64, bgB64, rectPhys, 24);
      const origStats = await diffStats(page, origB64, bgB64, rectPhys, 24);

      // build the 3-way row PNG (raw | in-engine original | in-engine quantized), physical-pixel width
      // matched to a fixed cell size so all 6 rows stack cleanly.
      const cellW = 700, cellH = 700, labelH = 34, capH = 52, pad = 12;
      const rowB64 = await compPage.evaluate(async (rawB64, rawBBoxOk, rawBBox, quantB64, origB64, rectPhys, cellW, cellH, labelH, capH, pad, title, rawStats, quantStats, origStats) => {
        function loadImg(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
        const canvas = document.createElement("canvas");
        canvas.width = 3 * (cellW + pad) + pad;
        canvas.height = labelH + cellH + capH + pad * 2;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#eee"; ctx.font = "16px monospace";
        ctx.fillText(title, pad, 18);

        async function panel(ci, im, srcRect, label, capLines) {
          const x = pad + ci * (cellW + pad), y = labelH + pad;
          ctx.fillStyle = "#222"; ctx.fillRect(x, y, cellW, cellH);
          if (im) {
            const sw = srcRect ? srcRect.w : im.width, sh = srcRect ? srcRect.h : im.height;
            const sx = srcRect ? srcRect.x : 0, sy = srcRect ? srcRect.y : 0;
            const scale = Math.min((cellW * 0.96) / sw, (cellH * 0.96) / sh);
            const dw = sw * scale, dh = sh * scale;
            ctx.drawImage(im, sx, sy, sw, sh, x + (cellW - dw) / 2, y + (cellH - dh) / 2, dw, dh);
          }
          ctx.fillStyle = "#9cf"; ctx.font = "12px monospace"; ctx.fillText(label, x + 2, y + cellH + 16);
          ctx.fillStyle = "#fff"; ctx.font = "10px monospace";
          capLines.forEach((line, li) => ctx.fillText(line, x + 2, y + cellH + 30 + li * 12));
        }

        const rawImg = await loadImg("data:image/png;base64," + rawB64);
        await panel(0, rawImg, rawBBoxOk ? rawBBox : null, "RAW FILE (alpha-trimmed, neutral bg)",
          [`sat=${rawStats.meanSaturation != null ? rawStats.meanSaturation.toFixed(3) : "n/a"} contrast=${rawStats.rmsContrast != null ? rawStats.rmsContrast.toFixed(3) : "n/a"}`,
           `uniqueColors=${rawStats.uniqueColors} n=${rawStats.n}`]);

        const origImg = await loadImg("data:image/png;base64," + origB64);
        await panel(1, origImg, rectPhys, "IN-ENGINE ORIGINAL (palette-off, served)",
          [`sat=${origStats.meanSaturation != null ? origStats.meanSaturation.toFixed(3) : "n/a"} contrast=${origStats.rmsContrast != null ? origStats.rmsContrast.toFixed(3) : "n/a"}`,
           `uniqueColors=${origStats.uniqueColors} meanAbsHueDeltaAdj=${origStats.meanAbsHueDeltaAdjacent != null ? origStats.meanAbsHueDeltaAdjacent.toFixed(4) : "n/a"} n=${origStats.n}`]);

        const quantImg = await loadImg("data:image/png;base64," + quantB64);
        await panel(2, quantImg, rectPhys, "IN-ENGINE QUANTIZED (current production)",
          [`sat=${quantStats.meanSaturation != null ? quantStats.meanSaturation.toFixed(3) : "n/a"} contrast=${quantStats.rmsContrast != null ? quantStats.rmsContrast.toFixed(3) : "n/a"}`,
           `uniqueColors=${quantStats.uniqueColors} meanAbsHueDeltaAdj=${quantStats.meanAbsHueDeltaAdjacent != null ? quantStats.meanAbsHueDeltaAdjacent.toFixed(4) : "n/a"} n=${quantStats.n}`]);

        return canvas.toDataURL("image/png").split(",")[1];
      }, rawB64, rawBBox.ok, rawBBox.ok ? rawBBox.bbox : null, quantB64, origB64, rectPhys, cellW, cellH, labelH, capH, pad,
         `${c.pieceSlug}  (${c.registrySlug})  —  ${c.note}`, rawStats, quantStats, origStats);

      const rowPath = path.join(shotsDir, `card4-row-${c.registrySlug}.png`);
      fs.writeFileSync(rowPath, Buffer.from(rowB64, "base64"));

      rows.push({
        registrySlug: c.registrySlug, pieceSlug: c.pieceSlug, note: c.note, ok: true,
        rowShot: path.relative(outDir, rowPath),
        cropRectCssPx: rectCss, cropRectPhysicalPx: rectPhys,
        rawBBox: rawBBox.ok ? rawBBox.bbox : null, rawStats,
        inEngineOriginal: origStats, inEngineQuantized: quantStats,
        deltaUniqueColors: (origStats.uniqueColors != null && quantStats.uniqueColors != null) ? origStats.uniqueColors - quantStats.uniqueColors : null,
        deltaMeanAbsHueDeltaAdjacent: (origStats.meanAbsHueDeltaAdjacent != null && quantStats.meanAbsHueDeltaAdjacent != null) ? origStats.meanAbsHueDeltaAdjacent - quantStats.meanAbsHueDeltaAdjacent : null,
      });
      log(`  ${c.registrySlug}: orig uniqueColors=${origStats.uniqueColors} hueDelta=${origStats.meanAbsHueDeltaAdjacent != null ? origStats.meanAbsHueDeltaAdjacent.toFixed(4) : "n/a"}  |  quant uniqueColors=${quantStats.uniqueColors} hueDelta=${quantStats.meanAbsHueDeltaAdjacent != null ? quantStats.meanAbsHueDeltaAdjacent.toFixed(4) : "n/a"}`);
    }

    // ─── stack all 6 rows into the final verdict card ───
    const rowImgsB64 = rows.filter((r) => r.ok).map((r) => readPngB64(path.join(outDir, r.rowShot)));
    const verdictB64 = await compPage.evaluate(async (rowImgsB64, headerText) => {
      function loadImg(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
      const imgs = await Promise.all(rowImgsB64.map((b64) => loadImg("data:image/png;base64," + b64)));
      const w = Math.max(...imgs.map((im) => im.width));
      const headerH = 40;
      const totalH = headerH + imgs.reduce((a, im) => a + im.height, 0);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = totalH;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, w, totalH);
      ctx.fillStyle = "#eee"; ctx.font = "20px monospace";
      ctx.fillText(headerText, 12, 26);
      let y = headerH;
      for (const im of imgs) { ctx.drawImage(im, 0, y); y += im.height; }
      return canvas.toDataURL("image/png").split(",")[1];
    }, rowImgsB64, "CARD 4 — HIGH-RESOLUTION palette verdict (deviceScaleFactor=2, torchlit, tight-cropped) — raw file | in-engine original | in-engine quantized");
    fs.writeFileSync(path.join(outDir, "card4-hires-verdict.png"), Buffer.from(verdictB64, "base64"));

    await compPage.close();

    summary.rows = rows;
    summary.quantResolution = quantResolution;
    summary.originalsResolution = originalsResolution;
    summary.shots = { quantized: path.relative(outDir, quantShot.shotPath), originals: path.relative(outDir, originalsShot.shotPath), bg: path.relative(outDir, bgShot.shotPath) };
    summary.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    await page.close();

    fs.writeFileSync(path.join(outDir, "results-card4-hires.json"), JSON.stringify(summary, null, 2));
    log("wrote results-card4-hires.json + card4-hires-verdict.png (" + rows.filter((r) => r.ok).length + "/" + CAST.length + " rows)");
  } catch (e) {
    summary.error = e.message; summary.stack = e.stack;
    fs.writeFileSync(path.join(outDir, "results-card4-hires.json"), JSON.stringify(summary, null, 2));
    log("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
