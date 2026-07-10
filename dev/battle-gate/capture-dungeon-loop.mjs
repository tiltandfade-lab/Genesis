#!/usr/bin/env node
/* dev/battle-gate/capture-dungeon-loop.mjs — DUNGEON-GRAPH.md FINALE GATE: a REAL rolled dungeon
   through the ENTIRE pipeline (roll -> spatialize/semanticize -> prep-attach -> walk-advance ->
   combat_start -> interior render -> standee verbs), loop-tested N=5 times, seeded by LOOP INDEX
   (never Date.now/an unseeded Math.random of this script's own — rollDungeonWalk's own internal table
   picks use Math.random, same as every other production walk roll; that's the REAL roll, not a
   determinism violation this gate owns).

   Sibling of dev/battle-gate/capture-interior-study.mjs — reuses that script's proven server/Chrome/
   boot conventions VERBATIM (see its own header for the "why" behind each). Diverges from it in ONE
   load-bearing way: capture-interior-study.mjs builds SpatialPlans from a hand-rolled walk FIXTURE
   (spatializePlan/semanticizePlan called directly on synthetic segments) to hold two scenes byte-
   stable for a taste-gate screenshot. This script instead drives the app's OWN production functions
   end to end for each loop — rollDungeonWalk, addNode, prepOf/walkSetActive, applyEvent("prep_applied")
   (which fires prepAttachSpatialPlan), applyEvent("walk_advance"), applyEvent("combat_start") — the
   EXACT sequence dev/verify-dungeon-walkbind.mjs's mountDungeonWalk/runCheck2/check-3/check-4 already
   prove in jsdom, run here for real in a live Chrome + THREE mount instead. No fixtures, no mocks.

   Per iteration i=1..5:
     1. addNode + rollDungeonWalk({segCount: SEGCOUNTS[i-1]}) (REAL roll — topology/rooms are whatever
        the table actually returns) -> mount into world.prep exactly as applyPrep/startPrep do ->
        applyEvent("prep_applied") -> pn.spatial exists (prepAttachSpatialPlan, production seam).
     2. independent BFS reachability re-check on pn.spatial (same technique
        dev/verify-dungeon-walkbind.mjs's independentReachabilityCheck uses — never trust the plan's
        own internal verifier a second time).
     3. applyEvent("walk_advance") to a room roughly mid-walk (by BFS depth), not the entry.
     4. applyEvent("combat_start") with REALFOE_ROSTER[i-1] (3-5 real named foes) — production combat
        cellDims-from-room wiring (src/world/dm.js's combat_start case) resolves the room's own cell
        footprint; GS.combat.foes carries real fid/name/etc.
     5. render: trayFrom({kind:"interior",plan:pn.spatial,...}) — the SAME production seam
        theaterHereSourceFor/theaterStageSync uses outside combat — now threading dressPlan (this
        session's own fix to src/engine/theater-data.js). Combat foes are attached as board.pieces
        (tagged with their real `fid` — this session's own fix to interiorBuildPieces/findUnit, so
        window.Theater.play(verb,{who:fid}) can resolve them) positioned into the current room, since
        production theaterStageSync intentionally keeps the flat combat zone-grid board while combat is
        active (an OPEN design question, not a bug — see findings.json/the session report) — direct
        setInteriorBoard is this gate's own explicit allowance for exercising the interior+combat-piece
        render surface, matching capture-interior-study.mjs's own precedent.
     6. screenshot the room with pieces at true scale; play("hurt",{who:foes[0].fid}) + screenshot;
        play("down",{who:foes[1].fid}) + screenshot.
     7. record topology/rooms/plan-verify/pieces-resolved/dressing-count/meshCount/console-errors.
   ANY failure at any step is captured into findings.json and the loop CONTINUES to the next iteration
   (the loop's job is finding breaks, not stopping at the first one).

   Run:  node dev/battle-gate/capture-dungeon-loop.mjs
   Output: dev/battle-gate/dungeon-loop/{loop-01..05-room,-hurt,-down}.png, contact-sheet.png,
   findings.json */

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
const outDir = path.join(__dirname, "dungeon-loop");
fs.mkdirSync(outDir, { recursive: true });

// a FOURTH port range — capture-interior-study.mjs owns 5201-5205, capture-place-tray.mjs 5191-5195,
// capture-stage.mjs 5181-5185 — so this harness can run concurrently with any of them.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5211, 5212, 5213, 5214, 5215];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[dungeon-loop-gate]", ...a); }
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
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; window.__bg404Urls = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  // DUNGEON-GRAPH.md GR2 §D DRESSING SYSTEM: this session's own theater-data.js fix (wiring dressPlan
  // into production trayFrom) means a rendered room's dressing cards now attempt a REAL
  // assets/dressing/<slug>.png fetch — that art hasn't been generated yet (GRAPHICS-ENGINE.md §F,
  // "the next big codex campaign after round 3"), so a 404 there is an EXPECTED, already-documented
  // degrade (dressingTextureFor's own placeholder-forever fallback, src/ui/theater-boot.js) — never a
  // visual break. Tracked with the real URL (not just the console's URL-less "Failed to load resource"
  // text) so findings.json can classify benign-vs-real console noise honestly instead of either hiding
  // it or over-flagging it as a break.
  page.on("response", (res) => { if (res.status() === 404) { const u = res.url(); page.evaluate((url) => { window.__bg404Urls.push(url); }, u).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// mirrors capture-interior-study.mjs's bootToInSession verbatim (see that file's header comment).
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
      if (nameEl) nameEl.value = "Dungeon Loop Gate Soul";
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
        hasPlay: !!(window.Theater && typeof window.Theater.play === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard && state.hasPlay) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

// FINDING (dungeon-loop-gate, 2026-07-10): a puppeteer `elementHandle.screenshot()` (or
// `page.screenshot({clip})`) taken on the WebGL `.theater-stage-canvas canvas` shortly after a
// window.Theater.play() standee-verb tween does NOT reliably reflect the tween's terminal frame in
// this headless config — verified directly: window.Theater.tweensLive()/a live scene-graph read
// (wrap.rotation.x, material.color) prove the verb DOES apply correctly and the WebGL renderer DOES
// repaint repeatedly (~30+ real renderer.render() calls) during the tween window, yet an
// elementHandle/clip screenshot taken afterward is byte-identical to the pre-verb frame; a full,
// UNCLIPPED `page.screenshot()` taken at the exact same moment DOES show the change. This reads as a
// Puppeteer/headless-Chrome canvas-compositing quirk (a clipped/element capture skips a repaint pass
// an unclipped page capture forces), not a Genesis rendering bug — the verb pipeline itself is
// independently proven correct by dev/verify-standee-verbs.mjs's Parts A/B/C (tween math, production
// wiring, and the interior-piece findUnit fix, all with mutation tests). Workaround: capture the FULL
// page, then crop to the canvas's own bounding box via an in-page <canvas> (same drawImage technique
// the contact-sheet compositor below already uses) — reliable in every trial run during triage.
async function shootCanvas(page, outPath) {
  const canvasEl = await page.$(".theater-stage-canvas canvas");
  if (!canvasEl) { await page.screenshot({ path: outPath }); return; }
  const box = await canvasEl.boundingBox();
  const fullB64 = await page.screenshot({ encoding: "base64" });
  if (!box) { fs.writeFileSync(outPath, Buffer.from(fullB64, "base64")); return; }
  const croppedB64 = await page.evaluate(({ fullB64, box }) => {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(box.width); canvas.height = Math.round(box.height);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(im, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
        resolve(canvas.toDataURL("image/png").split(",")[1]);
      };
      im.onerror = () => resolve(fullB64);
      im.src = "data:image/png;base64," + fullB64;
    });
  }, { fullB64, box });
  fs.writeFileSync(outPath, Buffer.from(croppedB64, "base64"));
}

// loop-index-seeded variety (NO Date.now anywhere in this file) — segCount/realm/foe roster all vary
// deterministically by iteration; rollDungeonWalk's OWN internal table picks are real Math.random
// (the production roller, unseeded — that's the "REAL roll", not this gate's own determinism surface).
const SEGCOUNTS = [4, 6, 8, 10, 7];
const REALMS = ["chrome", "gloom", "fantasy", "gloom", "chrome"];
const FOE_ROSTERS = [
  ["Wolf", "Giant Rat", "Spider"],
  ["Ogre Zombie", "Skeleton", "Zombie", "Guard"],
  ["Wolf", "Zombie", "Ape", "Guard", "Knight"],
  ["Giant Rat", "Spider", "Knight"],
  ["Ogre Zombie", "Skeleton", "Zombie", "Guard", "Wolf"],
];

// runs ONE full loop iteration IN-PAGE (steps 1-4 of the header's per-iteration list): real
// rollDungeonWalk -> prep-mount -> applyEvent(prep_applied) -> applyEvent(walk_advance) ->
// applyEvent(combat_start). Returns a rich {ok, stage, ...} result at every possible failure point
// rather than throwing, so the node-side driver can keep looping even when a step breaks.
async function driveLoopIteration(page, cfg) {
  return await page.evaluate((cfg) => {
    const out = { ok: false, stage: "start", loopIndex: cfg.loopIndex };
    try {
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return Object.assign(out, { stage: "no-active-world" });

      // reset any prior iteration's combat so combat_start doesn't bounce off "combat-already-active".
      GS.combat = null;

      out.stage = "roll";
      const walk = rollDungeonWalk({ segCount: cfg.segCount, tier: 1 });
      if (!walk || !Array.isArray(walk.segments) || !walk.segments.length) return Object.assign(out, { stage: "roll-empty", walk });
      out.topology = walk.topology;
      out.segCount = walk.segments.length;
      out.environment = walk.environment;

      out.stage = "mount";
      const nodeId = addNode(world, "Dungeon Loop " + cfg.loopIndex, "Dungeon");
      const P = prepOf(world);
      P.bundle = P.bundle || { environments: [] };
      const idx = P.bundle.environments.length;
      P.bundle.environments.push({ kind: "dungeon", walk, hook: { leadsTo: null }, cast: null });
      P.nodes[nodeId] = { env: "dungeon", idx, soft: true, locked: false, hook: null };
      walkSetActive(world, nodeId);
      out.nodeId = nodeId;

      out.stage = "prep_applied";
      const prepRes = applyEvent(world, { type: "prep_applied", payload: { overlays: { dungeon: { briefing: "dungeon-loop-gate iteration " + cfg.loopIndex, segments: [] } } } });
      if (!prepRes || prepRes.ok !== true) return Object.assign(out, { stage: "prep_applied-failed", prepRes });

      const pn = prepOf(world).nodes[nodeId];
      if (!pn || !pn.spatial) return Object.assign(out, { stage: "no-spatial-plan-after-prep", pn: pn ? { hasSpatial: !!pn.spatial } : null });
      out.roomCount = pn.spatial.rooms.length;

      // independent BFS reachability re-check (mirrors dev/verify-dungeon-walkbind.mjs's
      // independentReachabilityCheck — never trust spatializePlan's own internal verifier a 2nd time).
      out.stage = "reachability-check";
      (function () {
        const passable = new Set([SPATIAL_CELL.FLOOR, SPATIAL_CELL.DOOR, SPATIAL_CELL.WATER]);
        const entrySeg = walk.segments.find((s) => s.depth === 0) || walk.segments[0];
        const entryRoom = pn.spatial.rooms.find((r) => r.segNum === entrySeg.num);
        if (!entryRoom) { out.reachability = { ok: false, reason: "no-entry-room" }; return; }
        const idxOf = (x, y) => y * pn.spatial.cellW + x;
        const sx = Math.min(pn.spatial.cellW - 1, Math.max(0, entryRoom.x + Math.floor(entryRoom.w / 2)));
        const sy = Math.min(pn.spatial.cellD - 1, Math.max(0, entryRoom.y + Math.floor(entryRoom.d / 2)));
        const cells = pn.spatial.cells;
        if (!passable.has(cells[idxOf(sx, sy)])) { out.reachability = { ok: false, reason: "entry-cell-not-passable" }; return; }
        const seen = new Uint8Array(pn.spatial.cellW * pn.spatial.cellD);
        const q = [[sx, sy]]; seen[idxOf(sx, sy)] = 1; let head = 0;
        while (head < q.length) {
          const [cx, cy] = q[head++];
          for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
            if (nx < 0 || ny < 0 || nx >= pn.spatial.cellW || ny >= pn.spatial.cellD) continue;
            const ii = idxOf(nx, ny);
            if (seen[ii] || !passable.has(cells[ii])) continue;
            seen[ii] = 1; q.push([nx, ny]);
          }
        }
        let unreachable = 0;
        for (let i = 0; i < cells.length; i++) if (cells[i] === SPATIAL_CELL.FLOOR && !seen[i]) unreachable++;
        out.reachability = { ok: unreachable === 0, unreachable };
      })();
      if (!out.reachability.ok) return Object.assign(out, { stage: "reachability-failed" });

      // advance to a MID room by BFS depth (never the entry) via the REAL walk_advance event.
      out.stage = "walk_advance";
      const byDepth = walk.segments.slice().sort((a, b) => a.depth - b.depth);
      const targetSeg = byDepth[Math.floor(byDepth.length / 2)] || byDepth[byDepth.length - 1];
      const adv = applyEvent(world, { type: "walk_advance", payload: { toSeg: targetSeg.num, nodeId } });
      if (!adv || adv.ok !== true) return Object.assign(out, { stage: "walk_advance-failed", adv });
      out.targetSegNum = targetSeg.num;

      const room = spatialRoomForSeg(pn, pn.cursor.current);
      if (!room) return Object.assign(out, { stage: "no-room-for-cursor", cursor: pn.cursor });
      out.room = { segNum: room.segNum, x: room.x, y: room.y, w: room.w, d: room.d };

      out.stage = "combat_start";
      const foeSpecs = cfg.foes.map((name) => ({ name }));
      const cr = applyEvent(world, { type: "combat_start", payload: { foes: foeSpecs } });
      if (!cr || cr.ok !== true) return Object.assign(out, { stage: "combat_start-failed", cr });
      if (!GS.combat || !GS.combat.active) return Object.assign(out, { stage: "no-active-combat-after-start" });
      out.foes = GS.combat.foes.map((f) => ({ fid: f.fid, name: f.name }));
      out.combatGrid = GS.combat.grid;

      out.stage = "done";
      out.ok = true;
      out.nodeId = nodeId;
      out.pnCursor = pn.cursor.current;
      return out;
    } catch (e) {
      return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack });
    }
  }, cfg);
}

// step 5-6 of the header's per-iteration list: render the interior room (production trayFrom seam —
// exercises this session's own dressPlan-wiring fix) with the combat foes attached as tagged pieces
// (exercises this session's own findUnit/interiorBuildPieces fid-tagging fix), mount, then play a
// standee verb sequence on two of the foes.
async function renderAndAnimate(page, cfg, driveResult) {
  return await page.evaluate((cfg, driveResult) => {
    const out = { ok: false, stage: "start" };
    try {
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      const pn = prepOf(world).nodes[driveResult.nodeId];
      if (!pn || !pn.spatial) return Object.assign(out, { stage: "no-spatial-plan" });

      out.stage = "trayFrom";
      // the SAME source shape theaterHereSourceFor (src/world/render.js) builds for a dungeon walk
      // carrying pn.spatial — the production seam, not a hand-rolled board.
      const board = trayFrom(
        { kind: "interior", plan: pn.spatial, focusSegNum: pn.cursor.current, radius: 1, env: driveResult.environment, realms: [cfg.realmId] },
        null, {}
      );
      if (!board || board.kind !== "interior3d") return Object.assign(out, { stage: "trayFrom-wrong-kind", board: board && board.kind });
      out.dressingCountFromTray = (board.dressing || []).length;

      // attach combat foes as pieces, tagged with their real fid (this session's fix) — positioned at
      // deterministic interior-corner cells of the CURRENT room (same corner-placement convention
      // capture-interior-study.mjs's piecePositions uses).
      out.stage = "attach-pieces";
      const room = spatialRoomForSeg(pn, pn.cursor.current);
      function piecePositions(r, count) {
        const inX = Math.max(r.x + 1, r.x), inY = Math.max(r.y + 1, r.y);
        const maxX = Math.max(inX, r.x + r.w - 2), maxY = Math.max(inY, r.y + r.d - 2);
        return [{ x: inX, y: inY }, { x: maxX, y: inY }, { x: inX, y: maxY }, { x: maxX, y: maxY }, { x: Math.round((inX + maxX) / 2), y: Math.round((inY + maxY) / 2) }].slice(0, count);
      }
      const positions = piecePositions(room, driveResult.foes.length);
      board.pieces = driveResult.foes.map((f, i) => ({
        slug: f.name, fid: f.fid, cellX: positions[i].x, cellY: positions[i].y,
      }));

      out.stage = "setInteriorBoard";
      window.Theater.setInteriorBoard(board);
      out.ok = true;
      out.meshCount = window.Theater.interiorMeshCount();
      out.piecesRequested = window.Theater.interiorPiecesRequested();
      out.piecesResolved = window.Theater.interiorPiecesResolved();
      out.dressingCount = window.Theater.interiorDressingCount();
      return out;
    } catch (e) {
      return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack });
    }
  }, cfg, driveResult);
}

async function main() {
  const findings = { generatedAt: new Date().toISOString(), iterations: [], breaks: [], notes: [] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    findings.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const theaterState = await waitForTheater(page);
    findings.theaterState = theaterState;
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("window.Theater.setInteriorBoard never became available: " + JSON.stringify(theaterState));

    const shots = [];

    for (let i = 1; i <= 5; i++) {
      const loopIndex = i;
      const li = String(i).padStart(2, "0");
      const cfg = { loopIndex, segCount: SEGCOUNTS[i - 1], realmId: REALMS[i - 1], foes: FOE_ROSTERS[i - 1] };
      const iterFindings = { loopIndex, cfg, breaks: [] };
      log(`--- loop ${li}: segCount=${cfg.segCount} realm=${cfg.realmId} foes=${cfg.foes.join(",")} ---`);

      await page.evaluate(() => { window.__bgConsoleErrors = []; });

      const drive = await driveLoopIteration(page, cfg);
      iterFindings.drive = drive;
      if (!drive.ok) {
        iterFindings.breaks.push({ where: "drive", stage: drive.stage, detail: drive });
        findings.breaks.push({ loopIndex, where: "drive", stage: drive.stage, detail: drive });
        findings.iterations.push(iterFindings);
        log(`  BREAK at drive stage "${drive.stage}" — continuing loop`);
        continue;
      }
      iterFindings.topology = drive.topology;
      iterFindings.roomCount = drive.roomCount;
      iterFindings.reachability = drive.reachability;

      const rendered = await renderAndAnimate(page, cfg, drive);
      iterFindings.rendered = rendered;
      if (!rendered.ok) {
        iterFindings.breaks.push({ where: "render", stage: rendered.stage, detail: rendered });
        findings.breaks.push({ loopIndex, where: "render", stage: rendered.stage, detail: rendered });
        findings.iterations.push(iterFindings);
        log(`  BREAK at render stage "${rendered.stage}" — continuing loop`);
        continue;
      }

      // pieces load their textures async (same race capture-interior-study.mjs documents) — poll
      // interiorPiecesResolved() before trusting the count, then screenshot the room.
      if (rendered.piecesRequested > 0) {
        const deadline = Date.now() + 3000;
        let latest = rendered;
        while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
          await sleep(200);
          latest = await page.evaluate(() => ({
            piecesResolved: window.Theater.interiorPiecesResolved(),
            piecesRequested: window.Theater.interiorPiecesRequested(),
          }));
        }
        rendered.piecesResolved = latest.piecesResolved;
        iterFindings.rendered = rendered;
      }
      if (rendered.piecesRequested > 0 && rendered.piecesResolved < rendered.piecesRequested) {
        iterFindings.breaks.push({ where: "pieces", detail: `only ${rendered.piecesResolved}/${rendered.piecesRequested} piece sprites resolved` });
        findings.breaks.push({ loopIndex, where: "pieces", detail: `only ${rendered.piecesResolved}/${rendered.piecesRequested} piece sprites resolved`, foes: cfg.foes });
      }

      await sleep(400);
      const roomPath = path.join(outDir, `loop-${li}-room.png`);
      await shootCanvas(page, roomPath);
      shots.push({ loopIndex, kind: "room", label: `loop ${li} · ${drive.topology} · ${cfg.realmId} · ${drive.roomCount} rooms`, path: roomPath, fileName: path.basename(roomPath) });
      log(`  captured ${path.basename(roomPath)}`);

      // standee verb sequence: hit-damage on foe[0], fall-death on foe[1] (skip cleanly if <2 foes,
      // which never happens with this loop's rosters, but a real gate should never assume).
      const foes = drive.foes || [];
      const verbResults = { hurt: null, down: null };
      if (foes[0]) {
        verbResults.hurt = await page.evaluate((who) => {
          try { return { ok: window.Theater.play("hurt", { who }) }; } catch (e) { return { ok: false, error: e.message }; }
        }, foes[0].fid);
        if (!verbResults.hurt.ok) {
          iterFindings.breaks.push({ where: "verb-hurt", detail: verbResults.hurt });
          findings.breaks.push({ loopIndex, where: "verb-hurt", detail: verbResults.hurt, fid: foes[0].fid });
        }
        await sleep(700); // let the tween actually animate (hit-damage's own phase duration)
        const hurtPath = path.join(outDir, `loop-${li}-hurt.png`);
        await shootCanvas(page, hurtPath);
        shots.push({ loopIndex, kind: "hurt", label: `loop ${li} · hit-damage on ${foes[0].name}`, path: hurtPath, fileName: path.basename(hurtPath) });
        log(`  captured ${path.basename(hurtPath)} (verb ok=${verbResults.hurt.ok})`);
      }
      if (foes[1]) {
        verbResults.down = await page.evaluate((who) => {
          try { return { ok: window.Theater.play("down", { who }) }; } catch (e) { return { ok: false, error: e.message }; }
        }, foes[1].fid);
        if (!verbResults.down.ok) {
          iterFindings.breaks.push({ where: "verb-down", detail: verbResults.down });
          findings.breaks.push({ loopIndex, where: "verb-down", detail: verbResults.down, fid: foes[1].fid });
        }
        await sleep(700);
        const downPath = path.join(outDir, `loop-${li}-down.png`);
        await shootCanvas(page, downPath);
        shots.push({ loopIndex, kind: "down", label: `loop ${li} · fall-death on ${foes[1].name}`, path: downPath, fileName: path.basename(downPath) });
        log(`  captured ${path.basename(downPath)} (verb ok=${verbResults.down.ok})`);
      }
      iterFindings.verbResults = verbResults;

      const consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
      const urls404 = await page.evaluate(() => { const u = (window.__bg404Urls || []).slice(); window.__bg404Urls = []; return u; });
      iterFindings.consoleErrors = consoleErrors;
      iterFindings.urls404 = urls404;
      // classify: pending-art dressing placeholders (expected — see the newPage() comment above) and
      // the DM bridge health probe (this harness runs the plain static server, not dev/dm-bridge.py, so
      // /dm/health 404ing is expected and unrelated to anything this gate tests) are BENIGN — every
      // other 404/console error is a real break.
      const benign404 = urls404.filter((u) => /\/assets\/dressing\/.+\.png$/.test(u) || /\/dm\/health$/.test(u));
      const unexpected404 = urls404.filter((u) => !benign404.includes(u));
      const genericConsoleErrorCount = Math.max(0, consoleErrors.length - urls404.length); // "Failed to load resource" lines pair 1:1 with a 404 response; anything left over is a DIFFERENT kind of console.error
      iterFindings.benign404Count = benign404.length;
      if (unexpected404.length || genericConsoleErrorCount > 0) {
        iterFindings.breaks.push({ where: "console", detail: { unexpected404, genericConsoleErrorCount, consoleErrors } });
        findings.breaks.push({ loopIndex, where: "console", detail: { unexpected404, genericConsoleErrorCount, consoleErrors } });
      }

      iterFindings.summary = {
        topology: drive.topology, realm: cfg.realmId, roomCount: drive.roomCount,
        planVerified: !!(drive.reachability && drive.reachability.ok),
        piecesResolved: rendered.piecesResolved, piecesRequested: rendered.piecesRequested,
        dressingCount: rendered.dressingCount, meshCount: rendered.meshCount,
        consoleErrorCount: consoleErrors.length, breakCount: iterFindings.breaks.length,
      };
      findings.iterations.push(iterFindings);
    }

    // contact sheet: every captured PNG onto one grid (5 loop rows x up to 3 cols: room/hurt/down).
    if (shots.length) {
      const cols = 3, rows = 5;
      const cellW = 360, cellH = 270, labelH = 20, pad = 6;
      const colKey = { room: 0, hurt: 1, down: 2 };
      const images = shots.map((s) => ({ ...s, b64: fs.readFileSync(s.path).toString("base64") }));
      const sheetB64 = await page.evaluate(({ images, cols, rows, cellW, cellH, labelH, pad, colKey }) => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = cols * (cellW + pad) + pad;
          canvas.height = rows * (cellH + labelH + pad) + pad;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          let loaded = 0;
          if (!images.length) { resolve(canvas.toDataURL("image/png").split(",")[1]); return; }
          images.forEach((img) => {
            const im = new Image();
            im.onload = () => {
              const ri = img.loopIndex - 1;
              const ci = colKey[img.kind];
              const x = pad + ci * (cellW + pad);
              const y = pad + ri * (cellH + labelH + pad);
              ctx.drawImage(im, x, y, cellW, cellH);
              ctx.fillStyle = "#eee"; ctx.font = "12px monospace";
              ctx.fillText(img.label, x + 4, y + cellH + 14);
              loaded++;
              if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
            };
            im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + img.b64;
          });
        });
      }, { images: images.map((i) => ({ b64: i.b64, loopIndex: i.loopIndex, kind: i.kind, label: i.label })), cols, rows, cellW, cellH, labelH, pad, colKey });
      const sheetPath = path.join(outDir, "contact-sheet.png");
      fs.writeFileSync(sheetPath, Buffer.from(sheetB64, "base64"));
      findings.contactSheetPath = sheetPath;
      log("wrote", sheetPath);
    }

    // KNOWN OPEN ITEM (not counted as a `breaks` entry — production wiring is independently proven
    // correct, this is a capture-tooling limitation): window.Theater.play("hurt"/"down",...) reliably
    // returns true and reliably mutates the real THREE scene graph (verified during this gate's own
    // triage via a live debug read — wrap.rotation.x 0->pi/2, material color white->gray — and by
    // dev/verify-standee-verbs.mjs Parts A/B/C, all green with mutation tests), but the hurt/down PNGs
    // this script captures do not reliably show that terminal visual state in a multi-verb-per-page
    // sequence under this headless Chrome/puppeteer config — see shootCanvas()'s own header comment for
    // the full triage trail. Flagged honestly rather than silently accepted; needs further headless-
    // compositor investigation, out of this session's scope.
    findings.notes.push("OPEN: hurt/down screenshot PNGs may not visually reflect the standee-verb's terminal frame in this headless capture harness (play() itself, and the underlying scene-graph mutation, are independently proven correct — see shootCanvas()'s header comment in this file for the full triage trail). Not counted as a loop break.");

    findings.shotCount = shots.length;
    findings.breakCount = findings.breaks.length;
    findings.cleanIterations = findings.iterations.filter((it) => it.breaks.length === 0).length;
    fs.writeFileSync(path.join(outDir, "findings.json"), JSON.stringify(findings, null, 2));
    log(`wrote findings.json — ${findings.cleanIterations}/5 clean iterations, ${findings.breakCount} total breaks, ${shots.length} shots`);
    if (findings.breakCount > 0) process.exitCode = 1;
  } catch (e) {
    findings.fatalError = e.message;
    fs.writeFileSync(path.join(outDir, "findings.json"), JSON.stringify(findings, null, 2));
    log("FATAL:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
