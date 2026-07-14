#!/usr/bin/env node
/* dev/battle-gate/capture-value-plunge.mjs — BW2-4 THE VALUE PLUNGE (docs/BEAUTY-WAVE-2.md §BW2-4)
   iterate-loop capture + measured-luminance gate. The OPUS taste-loop harness: shoot the three anchor
   states (gloom combat / fantasy exploration / finale staging) matched to ui-sketches/mock-frames/
   mock-01-{gloom-combat,fantasy-explore,finale}.png, then MEASURE the value structure off the captured
   pixels so the "does the frame carry the mocks' darkness WITHOUT losing readability?" question has
   numbers behind it:
     - rim  <= 0.25 value (the diorama edge falls to near-black)
     - pool peak >= 0.70 value (a small HOT torch pool / focal)
     - characters inside pools >= 0.40 value (always readable)
     - shadow READS: floor luminance on a standee's shadow side (away from the torch) is measurably
       darker than its lit side (toward the torch) — the BW2-4 addendum gate.
     - light markers: zero bare orange rectangles (visual READ), a lantern card visible in gloom/fantasy
       (piecesResolved-style asserts + the frame itself).

   Writes each round's frames to dev/battle-gate/value-plunge/round-N/{scene}.png + a study-card.png +
   metrics.json (UNCOMMITTED evidence — the orchestrator re-shoots at the BW2-6 convergence gate).

   DEDICATED PORT RANGE 5221-5225 — never shared with capture-scene-direction.mjs (5211-5215) /
   capture-interior-study.mjs (5201-5205) / capture-place-tray.mjs (5191-5195) / capture-stage.mjs
   (5181-5185) / capture-dungeon-loop.mjs (5211-5215) — so a stale server from another script's tree
   can never be silently reused here. startServer() still probes+logs "already serving THIS tree".

   Run:  ROUND=1 node dev/battle-gate/capture-value-plunge.mjs   (ROUND names the output subdir) */

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
const ROUND = process.env.ROUND || "1";
const outDir = path.join(__dirname, "value-plunge", "round-" + ROUND);
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[value-plunge-gate]", ...a); }
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

const SHOT_W = Number(process.env.BG_SHOT_W) || 1600, SHOT_H = Number(process.env.BG_SHOT_H) || 900; // 16:9, matches the mock frames
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

// mirrors capture-scene-direction.mjs's bootToInSession verbatim.
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
      if (nameEl) nameEl.value = "Value Plunge Gate Soul";
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

// buildScene: branching fixture -> dressPlan -> interiorBuildBoard on the focus room; place pieces; set
// cameraFit (beat = fit the participant cluster, room = frame the room close). Returns the board plus
// the probe geometry the measurement step needs (torch cell = focus room key light, piece cells, bounds).
async function buildScene(page, cfg) {
  return await page.evaluate((cfg) => {
    try {
      const nSpine = 7, nPockets = 3;
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
      const plan = spatializePlan(segs, "Value Plunge Study", { walkId: cfg.walkId });
      const semPlan = semanticizePlan(plan, segs, []);
      const dressed = dressPlan(semPlan, { realmId: cfg.realmId, walkId: cfg.walkId + "-dress" });
      const focusRoom = dressed.rooms.find((r) => r.role === cfg.focusRole) || dressed.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(dressed, { realmId: cfg.realmId, env: "dungeon", focusSegNum, radius: 1 });
      board.dressing = dressed.dressing || [];

      // SHADOW-PROBE scene: inject a SINGLE controlled torch so the shadow gate has guaranteed
      // torch->standee geometry (the aesthetic scenes' seeded lights don't reliably pool ON the standee
      // once the global fill is cut — a shadow only READS inside a pool). Standee sits at room center,
      // torch 2 cells away; every other room light is dropped so this torch is the nearest shadow caster.
      if (cfg.injectTorch) {
        const isFloor = (x, y) => x >= 0 && y >= 0 && x < plan.cellW && y < plan.cellD && plan.cells[y * plan.cellW + x] === SPATIAL_CELL.FLOOR;
        // standee = a guaranteed floor cell near room center
        let sx = focusRoom.x + Math.floor(focusRoom.w / 2), sy = focusRoom.y + Math.floor(focusRoom.d / 2);
        if (!isFloor(sx, sy)) { outer: for (let yy = focusRoom.y; yy < focusRoom.y + focusRoom.d; yy++) for (let xx = focusRoom.x; xx < focusRoom.x + focusRoom.w; xx++) if (isFloor(xx, yy)) { sx = xx; sy = yy; break outer; } }
        // torch = a floor cell exactly 2 cells from the standee along whichever axis stays on floor
        const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]];
        let tx = sx + 2, tz = sy, litC = { x: sx + 1, y: sy }, shC = { x: sx - 1, y: sy };
        for (const [dx, dy] of dirs) {
          if (isFloor(sx + dx, sy + dy) && isFloor(sx + dx / 2, sy + dy / 2) && isFloor(sx - dx / 2, sy - dy / 2)) {
            tx = sx + dx; tz = sy + dy; litC = { x: sx + dx / 2, y: sy + dy / 2 }; shC = { x: sx - dx / 2, y: sy - dy / 2 }; break;
          }
        }
        board.lights = [{ x: tx, z: tz, y: 2.5, color: "#ff9a44", intensity: 2.0, distance: 6.0, decay: 2, kind: "torch", roomSegNum: focusSegNum }];
        board.pieces = (cfg.pieces || ["Skeleton"]).slice(0, 1).map((slug) => ({ slug, cellX: sx, cellY: sy }));
        board.cameraFit = { mode: "beat", cells: [{ x: sx, y: sy }, { x: tx, y: tz }] };
        return { ok: true, board, meta: board.meta, probe: { role: focusRoom.role, torch: { x: tx, z: tz, intensity: 2.0, distance: 6.0 }, pieceCells: [{ x: sx, y: sy }], bounds: board.bounds, shadowCells: { lit: litC, shadow: shC } } };
      }

      const roomLights = board.lights.filter((l) => l.roomSegNum === focusSegNum);
      const torch = roomLights[0] || null;

      // place standees. If a torch exists, seat the FIRST piece exactly 2 cells from the torch (along
      // whichever axis stays inside the room) so the shadow probe has guaranteed torch->standee geometry.
      function inRoom(x, y) { return x > focusRoom.x && x < focusRoom.x + focusRoom.w - 1 && y > focusRoom.y && y < focusRoom.y + focusRoom.d - 1; }
      const cells = [];
      if (torch && cfg.pieces && cfg.pieces.length) {
        let sx = torch.x + 2, sy = torch.z;
        if (!inRoom(sx, sy)) { sx = torch.x - 2; }
        if (!inRoom(sx, sy)) { sx = torch.x; sy = torch.z + 2; }
        if (!inRoom(sx, sy)) { sx = torch.x; sy = torch.z - 2; }
        if (!inRoom(sx, sy)) { sx = focusRoom.x + Math.floor(focusRoom.w / 2); sy = focusRoom.y + Math.floor(focusRoom.d / 2); }
        cells.push({ x: sx, y: sy });
        // second+ pieces flank the first
        const flanks = [{ x: sx + 1, y: sy }, { x: sx - 1, y: sy }, { x: sx, y: sy + 1 }];
        for (let i = 1; i < cfg.pieces.length; i++) {
          let c = flanks[i - 1] || { x: sx + i, y: sy };
          if (!inRoom(c.x, c.y)) c = { x: sx, y: sy };
          cells.push(c);
        }
      } else if (cfg.pieces) {
        const cx0 = focusRoom.x + Math.floor(focusRoom.w / 2), cy0 = focusRoom.y + Math.floor(focusRoom.d / 2);
        for (let i = 0; i < cfg.pieces.length; i++) cells.push({ x: cx0 + (i - 0), y: cy0 });
      }
      if (cfg.pieces && cfg.pieces.length) {
        board.pieces = cfg.pieces.map((slug, i) => ({ slug, cellX: cells[i].x, cellY: cells[i].y }));
      }
      if (cfg.cameraFit === "beat" && cells.length) {
        board.cameraFit = { mode: "beat", cells: cells.map((c) => ({ x: c.x, y: c.y })) };
      } else {
        board.cameraFit = { mode: "room" };
      }
      return {
        ok: true, board, meta: board.meta,
        probe: {
          role: focusRoom.role,
          torch: torch ? { x: torch.x, z: torch.z, intensity: torch.intensity, distance: torch.distance } : null,
          pieceCells: cells,
          bounds: board.bounds,
        },
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, cfg);
}

// measure(): decode the just-captured PNG (a WebGL canvas's own drawing buffer reads BLACK via
// drawImage once composited — preserveDrawingBuffer is off — so we sample the screenshot PNG instead,
// re-imported into a 2D canvas where getImageData is legal), compute value bands, and locate the torch
// pool / standees / rim / shadow cells via window.Theater.projectWorldPoint (world coords are the
// mounted, cx/cz-SHIFTED frame) + interiorBoardOrigin. The board is still mounted here, so the live
// camera projection is valid; only the PIXELS come from the PNG, not the dead WebGL buffer.
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

    // full-frame histogram
    const all = [];
    for (let i = 0; i < data.length; i += 4) all.push(lum(data[i], data[i + 1], data[i + 2]));
    all.sort((a, b) => a - b);
    const pct = (p) => all[Math.min(all.length - 1, Math.floor(p * all.length))];
    const brightMean = (frac) => { const n = Math.max(1, Math.floor(all.length * frac)); let s = 0; for (let i = all.length - n; i < all.length; i++) s += all[i]; return s / n; };

    // rim band: outer 7% margin ring of the frame (void + skirt + diorama rim fall to near-black)
    const mx = Math.floor(W * 0.07), my = Math.floor(H * 0.07);
    let rimSum = 0, rimN = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (x >= mx && x < W - mx && y >= my && y < H - my) continue;
        const i = (y * W + x) * 4; rimSum += lum(data[i], data[i + 1], data[i + 2]); rimN++;
      }
    }
    const rimBand = rimN ? rimSum / rimN : 0;

    const origin = window.Theater.interiorBoardOrigin ? window.Theater.interiorBoardOrigin() : null;
    const cx = origin ? origin.cx : 0, cz = origin ? origin.cz : 0;
    function toScreen(cellX, cellY, worldY) {
      const p = window.Theater.projectWorldPoint(cellX - cx, worldY, cellY - cz);
      if (!p) return null;
      return { sx: Math.round((p.ndcX * 0.5 + 0.5) * W), sy: Math.round((1 - (p.ndcY * 0.5 + 0.5)) * H) };
    }
    function patchLum(scr, rad) {
      if (!scr) return null;
      let s = 0, n = 0;
      for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
        const x = scr.sx + dx, y = scr.sy + dy;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = (y * W + x) * 4; s += lum(data[i], data[i + 1], data[i + 2]); n++;
      }
      return n ? s / n : null;
    }
    function patchMax(scr, rad) {
      if (!scr) return null;
      let mx2 = 0, any = false;
      for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
        const x = scr.sx + dx, y = scr.sy + dy;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = (y * W + x) * 4; const l = lum(data[i], data[i + 1], data[i + 2]); if (l > mx2) { mx2 = l; any = true; }
      }
      return any ? mx2 : null;
    }

    const out = {
      ok: true, W, H,
      global: { mean: all.reduce((a, b) => a + b, 0) / all.length, p01: pct(0.01), p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), max: all[all.length - 1], brightMean2pct: brightMean(0.02) },
      rimBand,
    };

    // torch pool: peak luminance in a screen patch around the torch flame point (world y ~ 1.25)
    if (probe.torch) {
      const torchScr = toScreen(probe.torch.x, probe.torch.z, 1.25);
      out.poolPeak = patchMax(torchScr, Math.floor(H * 0.06));
      out.torchScr = torchScr;
      // rim floor: nearest board-bounds corner floor cell (a diorama rim cell) at floor level
      const b = probe.bounds;
      if (b) {
        const rimCells = [{ x: b.minX, y: b.minZ }, { x: b.maxX, y: b.minZ }, { x: b.minX, y: b.maxZ }, { x: b.maxX, y: b.maxZ }];
        const rimLums = rimCells.map((rc) => patchLum(toScreen(rc.x, rc.y, -0.4), Math.floor(H * 0.015))).filter((v) => v != null);
        out.rimFloor = rimLums.length ? rimLums.reduce((a, v) => a + v, 0) / rimLums.length : null;
        // VALUE LAW mid band: a floor cell halfway between the torch and the nearest rim corner — the
        // "mid floor" that must sit between the dark rim and the one bright pool (dark < mid < bright).
        let near = rimCells[0], nd = Infinity;
        rimCells.forEach((rc) => { const d = Math.hypot(rc.x - probe.torch.x, rc.y - probe.torch.z); if (d < nd) { nd = d; near = rc; } });
        const midCell = { x: Math.round((probe.torch.x + near.x) / 2), y: Math.round((probe.torch.z + near.y) / 2) };
        out.midFloor = patchLum(toScreen(midCell.x, midCell.y, -0.4), Math.floor(H * 0.02));
      }
    }

    // characters: torso patch of each standee (cell center, world y ~ 0.35 = mid-body above the floor)
    out.charLums = (probe.pieceCells || []).map((pc) => patchLum(toScreen(pc.x, pc.y, 0.35), Math.floor(H * 0.02)));
    out.charLumMin = out.charLums.filter((v) => v != null).length ? Math.min(...out.charLums.filter((v) => v != null)) : null;

    // shadow: standee[0] sits 2 cells from the torch. Lit floor = cell one step TOWARD the torch;
    // shadow floor = cell one step AWAY. Compare floor luminance (world y ~ -0.4).
    if (probe.torch && probe.pieceCells && probe.pieceCells.length) {
      const s = probe.pieceCells[0], t = probe.torch;
      let litCell, shadowCell;
      if (probe.shadowCells) { litCell = probe.shadowCells.lit; shadowCell = probe.shadowCells.shadow; }
      else {
        let vx = s.x - t.x, vy = s.y - t.z; const len = Math.hypot(vx, vy) || 1; vx /= len; vy /= len;
        litCell = { x: Math.round(s.x - vx), y: Math.round(s.y - vy) };   // toward torch
        shadowCell = { x: Math.round(s.x + vx), y: Math.round(s.y + vy) }; // away from torch
      }
      const litL = patchLum(toScreen(litCell.x, litCell.y, -0.4), Math.floor(H * 0.012));
      const shadowL = patchLum(toScreen(shadowCell.x, shadowCell.y, -0.4), Math.floor(H * 0.012));
      out.shadow = { litCell, shadowCell, litL, shadowL, delta: (litL != null && shadowL != null) ? (litL - shadowL) : null };
    }
    return resolveOuter(out);
    };
    img.onerror = () => resolveOuter({ ok: false, error: "png decode failed" });
    img.src = "data:image/png;base64," + pngB64;
  }), { probe, pngB64 });
}

// sampleCellFloor(): decode a PNG + sample the floor luminance at ONE cell (world y ~ -0.4). Used by
// the shadow gate's two-render comparison — the SAME cell measured with the standee present vs removed,
// so the difference is purely the standee's CAST SHADOW (isolated from torch falloff, which is identical
// in both renders). Board still mounted -> projectWorldPoint is valid.
async function sampleCellFloor(page, cell, pngB64) {
  return await page.evaluate(({ cell, pngB64 }) => new Promise((res) => {
    function lum(r, g, b) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
    const img = new Image();
    img.onload = () => {
      const W = img.naturalWidth, H = img.naturalHeight;
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, W, H);
      let data; try { data = ctx.getImageData(0, 0, W, H).data; } catch (e) { return res(null); }
      const o = window.Theater.interiorBoardOrigin ? window.Theater.interiorBoardOrigin() : { cx: 0, cz: 0 };
      const p = window.Theater.projectWorldPoint(cell.x - o.cx, -0.4, cell.y - o.cz);
      if (!p) return res(null);
      const sx = Math.round((p.ndcX * 0.5 + 0.5) * W), sy = Math.round((1 - (p.ndcY * 0.5 + 0.5)) * H);
      const rad = Math.floor(H * 0.012); let s = 0, n = 0;
      for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
        const x = sx + dx, y = sy + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const i = (y * W + x) * 4; s += lum(data[i], data[i + 1], data[i + 2]); n++;
      }
      res(n ? s / n : null);
    };
    img.onerror = () => res(null);
    img.src = "data:image/png;base64," + pngB64;
  }), { cell, pngB64 });
}

const SCENES = [
  { key: "gloom-combat", label: "gloom combat (mock-01-gloom-combat)", realmId: "gloom", walkId: "bw24-gloom-combat", focusRole: "path", pieces: ["Death Knight", "Skeleton"], cameraFit: "beat" },
  { key: "fantasy-explore", label: "fantasy exploration (mock-01-fantasy-explore)", realmId: "fantasy", walkId: "bw24-fantasy-explore", focusRole: "entrance", pieces: ["Dire Wolf"], cameraFit: "room" },
  { key: "finale", label: "gloom finale (mock-01-finale)", realmId: "gloom", walkId: "bw24-gloom-finale", focusRole: "finale", pieces: ["Death Knight", "Guard"], cameraFit: "room" },
  { key: "shadow-probe", label: "shadow gate (torch->standee, guaranteed geometry)", realmId: "gloom", walkId: "bw24-shadow-probe", focusRole: "path", pieces: ["Guard"], injectTorch: true },
];

async function main() {
  const metrics = { round: ROUND, generatedAt: new Date().toISOString(), shot: { W: SHOT_W, H: SHOT_H }, scenes: {}, notes: [] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const boot = await bootToInSession(page);
    metrics.boot = { ok: boot.ok, stage: boot.stage };
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("setInteriorBoard never available: " + JSON.stringify(theaterState));

    const shots = [];
    for (const scene of SCENES) {
      const built = await buildScene(page, scene);
      if (!built.ok) { metrics.notes.push(`scene ${scene.key} build FAILED: ${built.error}`); metrics.scenes[scene.key] = { built }; continue; }
      const mounted = await page.evaluate((board) => {
        try {
          window.Theater.setInteriorBoard(board);
          return { ok: true, meshCount: window.Theater.interiorMeshCount(), piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested(), lightCount: window.Theater.interiorLightCount(), shadowCasters: window.Theater.interiorShadowCasterCount(), shadowMap: window.Theater.shadowMapEnabled() };
        } catch (e) { return { ok: false, error: e.message }; }
      }, built.board);
      if (!mounted.ok) { metrics.notes.push(`scene ${scene.key} mount FAILED: ${mounted.error}`); metrics.scenes[scene.key] = { built: { ok: true }, mounted }; continue; }
      // wait for piece textures + dressing (lantern) textures to resolve
      if (mounted.piecesRequested > 0) {
        const deadline = Date.now() + 4000; let latest = mounted;
        while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
          await sleep(200);
          latest = await page.evaluate(() => ({ piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() }));
        }
        mounted.piecesResolved = latest.piecesResolved;
      }
      await sleep(700); // let dressing/lantern textures load + one flicker tick settle
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const shotPath = path.join(outDir, `${scene.key}.png`);
      if (canvasEl) await canvasEl.screenshot({ path: shotPath }); else await page.screenshot({ path: shotPath });
      const pngB64 = fs.readFileSync(shotPath).toString("base64");
      const measured = await measure(page, built.probe, pngB64);

      // SHADOW GATE (addendum) — rigorous two-render proof: remount the SAME board with NO standee, then
      // sample the SAME shadow-side floor cell. Torch falloff is identical in both renders, so
      // (noStandee - withStandee) at that cell is PURELY the standee's cast shadow. Positive => the cast
      // shadow reads on the floor.
      if (scene.key === "shadow-probe" && built.probe.shadowCells && measured.shadow) {
        const cell = built.probe.shadowCells.shadow;
        // FREEZE the flicker: the torch/fill flicker uses Math.random per 480ms tick, so two successive
        // renders differ in light state — a confound that swamps the (small) cast shadow. Pin Math.random
        // to 0.5 (flicker delta -> 0) and wait one tick so BOTH renders below are byte-stable in lighting;
        // then noStandee - withStandee at the same cell is PURELY the standee's cast shadow.
        await page.evaluate(() => { Math.random = () => 0.5; });
        await sleep(600);
        const withEl = await page.$(".theater-stage-canvas canvas");
        const withTmp = path.join(outDir, "shadow-probe.png");
        if (withEl) await withEl.screenshot({ path: withTmp });
        const withPng = fs.readFileSync(withTmp).toString("base64");
        const withStandee = await sampleCellFloor(page, cell, withPng);
        await page.evaluate((board) => { const b = Object.assign({}, board, { pieces: [] }); window.Theater.setInteriorBoard(b); }, built.board);
        await sleep(400);
        const noStandeePng = await (async () => { const el = await page.$(".theater-stage-canvas canvas"); const tmp = path.join(outDir, "shadow-probe-nostandee.png"); if (el) await el.screenshot({ path: tmp }); return fs.readFileSync(tmp).toString("base64"); })();
        const noStandee = await sampleCellFloor(page, cell, noStandeePng);
        measured.shadowCast = { cell, withStandee, noStandee, delta: (withStandee != null && noStandee != null) ? (noStandee - withStandee) : null };
        await page.evaluate((board) => { window.Theater.setInteriorBoard(board); }, built.board);
        await sleep(200);
        log(`shadow-cast proof (flicker-frozen): noStandee=${noStandee && noStandee.toFixed(3)} withStandee=${withStandee && withStandee.toFixed(3)} castDelta=${measured.shadowCast.delta != null ? measured.shadowCast.delta.toFixed(3) : "n/a"}`);
      }
      shots.push({ key: scene.key, label: scene.label, path: shotPath });
      metrics.scenes[scene.key] = { label: scene.label, mounted, probe: built.probe, measured };
      log(`captured ${scene.key}: rimBand=${measured.rimBand && measured.rimBand.toFixed(3)} rimFloor=${measured.rimFloor && measured.rimFloor.toFixed(3)} poolPeak=${measured.poolPeak && measured.poolPeak.toFixed(3)} charMin=${measured.charLumMin && measured.charLumMin.toFixed(3)} shadowDelta=${measured.shadow && measured.shadow.delta != null ? measured.shadow.delta.toFixed(3) : "n/a"} piecesResolved=${mounted.piecesResolved}/${mounted.piecesRequested}`);
    }

    // study card
    if (shots.length) {
      const cols = 1, cellW = 960, cellH = 540, labelH = 22, pad = 8;
      const images = shots.map((s) => ({ ...s, b64: fs.readFileSync(s.path).toString("base64") }));
      const sheetB64 = await page.evaluate(({ images, cols, cellW, cellH, labelH, pad }) => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          const rows = Math.ceil(images.length / cols);
          canvas.width = cols * (cellW + pad) + pad; canvas.height = rows * (cellH + labelH + pad) + pad;
          const ctx = canvas.getContext("2d"); ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          let loaded = 0;
          images.forEach((img, i) => {
            const im = new Image(); const ri = Math.floor(i / cols), ci = i % cols;
            const x = pad + ci * (cellW + pad); const y = pad + ri * (cellH + labelH + pad);
            im.onload = () => { ctx.drawImage(im, x, y, cellW, cellH); ctx.fillStyle = "#eee"; ctx.font = "13px monospace"; ctx.fillText(img.label, x + 4, y + cellH + 16); loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + img.b64;
          });
          if (!images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
        });
      }, { images: images.map((i) => ({ b64: i.b64, label: i.label })), cols, cellW, cellH, labelH, pad });
      fs.writeFileSync(path.join(outDir, "study-card.png"), Buffer.from(sheetB64, "base64"));
    }

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice(0, 20));
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log(`round ${ROUND}: wrote ${shots.length} shots + metrics.json (${metrics.consoleErrors.length} console errors) -> ${outDir}`);
  } catch (e) {
    metrics.error = e.message; fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("FAILED:", e.message); process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}
main();
