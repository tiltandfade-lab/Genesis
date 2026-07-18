#!/usr/bin/env node
/* dev/battle-gate/capture-kgr8-clay-room.mjs — KGR-8 CLAY CARD 01: the 5×5 proving room.
   (docs/KGR8-KENNEY-SHELL-REBUILD.md morning amendment: "THE PROVING LADDER — clay 5×5
   (hand-authored, the only hand-built fixture) → rolled 5-room walk → rolled 14-room walk";
   docs/KGR8-CODEX-ASSESSMENT.md A4 stage 1: "Clay shell: neutral material, high legibility, no
   props, creatures, dressing, effects, fog, or practical lights.")

   WHAT THIS IS: a HAND-AUTHORED dev fixture — the one hand-built room the prototype-proof law
   licenses — that drives the EXISTING engine end to end and swaps the condemned prism shell for a
   100%-Kenney module shell on this one board. Zero production files are touched: the fixture
   (a) builds a real board through the real interiorBuildBoard (production camera framing,
       focusRect, portal/leaf/skirt machinery all real),
   (b) empties the prism instance lists in the BOARD DATA before mount (pure data, the same channel
       capture-ks3-kit-shells.mjs already writes) so neither the per-cell prisms nor the compiled
       room shell mount (the compiler consumes floorList — empty in, nothing out),
   (c) mounts the Kenney modules itself through window.TheaterDonor.loadDonorPiece — the REAL
       admission path (calibrated normalized index, provenance hash verified per load), and
   (d) applies the clay-grey matte + neutral light rig for the A4 stage-1 read.

   CAMERA / CUTAWAY: the production camera places itself off the board's own focusRect exactly as
   in gameplay (placeCameraTweened, CAM_YAW_OFFSET_DEG 45). The camera-side parapet cut for the
   hand-mounted kit walls reapplies the IDENTICAL published math (theater-boot.js
   itrCameraSideBand: focusRect±1 band ∧ (rx·sinYaw + rz·cosYaw) > 0, then scale.y ×=
   ITR_CUTAWAY_PARAPET_FRAC 0.4 — the same numbers interiorBuildKitShellWalls' runs get). This is a
   documented fixture-side mirror of a closure that is not reachable from page scope; it consumes
   the same S.rotationStep=0 default every fresh session has.

   ROOM GRAMMAR (all kenney-modular-dungeon-kit — one coherent structural palette per A2):
     floor  template-floor 2×2-cell tiles covering the 5×5 interior EXACTLY: centers 1.5/3.5/4.5,
            the last row+column overlapping one cell, dropped by a sub-mm epsilon so coplanar
            tiles never z-fight (the kit ships no 1×1 floor tile — recorded coverage gap; any
            outward excess read as a pale fringe ledge beyond the thin walls on earlier passes).
     walls  template-wall (2-cell) + template-wall-half (1-cell) runs, face ON the room boundary,
            body growing OUTWARD into the ring band, scale.y-corrected to the board's
            wallHeightBase per the engine's own KIT_WALL_NATIVE_HEIGHT convention. 5-cell sides
            tile wall+half+wall (the half centered, matching the door side's rhythm).
     corner strategy selectable (--corner post|piece|lap) while the card iterates:
            post   = one template-wall-corner square post per corner, inner faces FLUSH with both
                     wall face planes, body fully outward (default — the lineup probe showed the
                     kit walls are THIN slabs, so the 0.5×0.5 post is the kit's own corner answer)
            piece  = one template-corner per corner (the kit's authored 2×2 CURVED quarter-round —
                     rounded outside corners, the room-small macro's own corner language)
            lap    = template-wall-half laps closing each corner from the long band (rejected by
                     the probe: thin slabs lapping across the corner leave protruding fins)
     door   exactly ONE 5-ft (1-cell) aperture mid-north-wall — an absence in the wall run whose
            butt ends are the jambs (zero proud surround, THE DOOR LAW) — plus the production flat
            leaf (state "shut") via the real interactables channel, hinge shifted +0.20z into the
            aperture so the leaf reads as an inset panel behind a shadow reveal (see the
            LEAF-PLANE CORRECTION comment). The darkness portal is retired ON THIS CARD ONLY —
            it mounts nearer the room than the shut leaf and would fully cover it.

   Run:   node dev/battle-gate/capture-kgr8-clay-room.mjs                  (the card)
          node dev/battle-gate/capture-kgr8-clay-room.mjs --mode lineup    (module contact probe)
          node dev/battle-gate/capture-kgr8-clay-room.mjs --corner quad
   Out:   dev/battle-gate/kgr8-clay-room/clay-01-shell.png (+ clay-01-diagnosis.json;
          lineup mode writes lineup-modular.png / lineup-mini.png + lineup-manifest.json)

   Server/Chrome/boot conventions VERBATIM from capture-ks3-kit-shells.mjs (itself from
   capture-ks2-door-assembly.mjs / capture-d4-doors.mjs). Fresh port range 5241-5245.
   KNOWN HAZARD (orchestrator note): puppeteer nav has been timeout-flaking on this machine after
   many Chrome launches — this rig uses generous timeouts, ONE Chrome per run, and retries the
   whole browser session up to 3 times. */

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
const outDir = path.join(__dirname, "kgr8-clay-room");
fs.mkdirSync(outDir, { recursive: true });

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
const MODE = args.mode || "card";
const CORNER = args.corner || "post";
const SHOT = args.shot || "clay-01-shell";
// production zoom-out steps for the whole-shell read: setInteriorBoard's own small-board bias
// (DEFAULT_FIGURE_ZOOM_STEPS) zooms a 5×5 board toward figure close-up — correct for gameplay,
// wrong for a shell acceptance card. Theater.zoom(−1) is the production player lever; the count
// used is recorded in the diagnosis JSON so every later card can reproduce the framing.
const ZOOMOUT = args.zoomout != null ? parseInt(args.zoomout, 10) : 3;

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5241, 5242, 5243, 5244, 5245];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[kgr8-clay-room]", ...a); }
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

const SHOT_W = 1440, SHOT_H = 960;
async function launchChrome() {
  const chromeArgs = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({
    executablePath: CHROME, headless: "new", args: chromeArgs,
    defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 2 },
    protocolTimeout: 240000,
  });
}
async function newPage(browser) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().endsWith("/favicon.ico")) {
      req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
    } else req.continue();
  });
  page.on("console", (msg) => { if (msg.type() === "error") log("console.error:", msg.text().slice(0, 200)); });
  page.on("pageerror", (e) => log("PAGE ERROR:", e.message));
  return page;
}

// mirrors capture-ks3-kit-shells.mjs's bootToInSession verbatim.
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
      if (nameEl) nameEl.value = "KGR-8 Clay Witness";
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
  const deadline = Date.now() + 30000;
  let state = null;
  while (Date.now() < deadline) {
    state = await page.evaluate(() => {
      const host = document.getElementById("worldView");
      return {
        hasBattleStage: !!(host && host.querySelector(".game.battle-stage")),
        theaterMounted: !!(typeof GS !== "undefined" && GS.theaterMounted),
        hasCanvas: !!(host && host.querySelector(".theater-stage-canvas canvas")),
        hasSetInteriorBoard: !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"),
        hasDonor: !!(window.TheaterDonor && typeof window.TheaterDonor.loadDonorPiece === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard && state.hasDonor) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

const SPATIAL_CELL = { VOID: 0, FLOOR: 1, WALL: 2, DOOR: 3, WATER: 4 };

/* clayPlan() — THE hand-authored 5×5 fixture. 7×7 grid: interior FLOOR cells (1..5)², WALL ring,
   exactly ONE DOOR cell mid-north (x=3, y=0 — the far side under the default rotationStep-0
   camera, so the doorway + leaf read at full height, never inside the parapet cut). */
function clayPlan() {
  const w = 7, d = 7;
  const cells = new Array(w * d).fill(SPATIAL_CELL.VOID);
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
    if (x >= 1 && x <= 5 && y >= 1 && y <= 5) cells[y * w + x] = SPATIAL_CELL.FLOOR;
    else cells[y * w + x] = SPATIAL_CELL.WALL;
  }
  const doorCell = { x: 3, y: 0 };
  cells[doorCell.y * w + doorCell.x] = SPATIAL_CELL.DOOR;
  const room = { segNum: 1, x: 1, y: 1, w: 5, d: 5, role: "start", scaleDomain: 1.0, shape: "rect" };
  return { w, d, cells, room, doorCell };
}

/* lineup fixture — a wide flat room the module contact probe stands its pieces in (prism shell KEPT
   for ground truth/context; this board never claims to be a clay acceptance frame). */
function lineupPlan(w, d) {
  const cells = new Array(w * d).fill(SPATIAL_CELL.VOID);
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) {
    if (x >= 1 && x <= w - 2 && y >= 1 && y <= d - 2) cells[y * w + x] = SPATIAL_CELL.FLOOR;
    else cells[y * w + x] = SPATIAL_CELL.WALL;
  }
  const doorCell = { x: Math.floor(w / 2), y: 0 };
  cells[doorCell.y * w + doorCell.x] = SPATIAL_CELL.DOOR;
  const room = { segNum: 1, x: 1, y: 1, w: w - 2, d: d - 2, role: "start", scaleDomain: 1.0, shape: "rect" };
  return { w, d, cells, room, doorCell };
}

/* KIT RECIPE — the hand-authored module plan for the clay room, in PLAN-CELL WORLD coordinates
   (1 cell = 1 world unit; interior floor spans x,z ∈ [0.5, 5.5]). rotY per the engine's own
   quarter-turn convention (rotY=0 keeps template-wall's face plane toward +z; the face sits ON the
   room boundary and the ~1-unit body grows OUTWARD into the ring band). */
function kitRecipe(corner) {
  // nativeHeight: each piece's calibrated post-canonicalScale height (normalized index bounds) —
  // consumed by the production wallHeightBase scale-Y parity correction at mount.
  const WALL = { pack: "kenney-modular-dungeon-kit", slug: "template-wall", nativeHeight: 2.075 };
  const HALF = { pack: "kenney-modular-dungeon-kit", slug: "template-wall-half", nativeHeight: 2.075 };
  const CORNER_QUARTER = { pack: "kenney-modular-dungeon-kit", slug: "template-wall-corner", nativeHeight: 2.025 };
  const CORNER_PIECE = { pack: "kenney-modular-dungeon-kit", slug: "template-corner", nativeHeight: 2.117 };
  const FLOOR = { pack: "kenney-modular-dungeon-kit", slug: "template-floor", nativeHeight: null };
  const R0 = 0, R90 = Math.PI / 2, R180 = Math.PI, R270 = -Math.PI / 2;
  const modules = [];
  const add = (m, x, z, rotY, role) => modules.push({ pack: m.pack, slug: m.slug, nativeHeight: m.nativeHeight, x, z, rotY, role });

  // FLOOR — EXACT 5×5 coverage from 2×2 tiles by overlapping the last row/column one cell
  // (centers 1.5 / 3.5 / 4.5): the kit ships no 1×1 floor tile (recorded coverage gap), and any
  // outward excess reads as a pale fringe ledge beyond the thin walls (measured on v2–v4). The
  // overlapped strip is dropped by a 0.6 mm epsilon per overlapping axis so the coplanar tiles
  // never z-fight; invisible at clay tones, loud in this comment and the README.
  {
    const centers = [1.5, 3.5, 4.5];
    centers.forEach((bx, ix) => centers.forEach((bz, iz) => {
      const eps = (ix === 2 ? 0.0006 : 0) + (iz === 2 ? 0.0012 : 0);
      modules.push({ pack: FLOOR.pack, slug: FLOOR.slug, nativeHeight: null, x: bx, z: bz, rotY: R0, role: "floor", yOffset: -eps });
    }));
  }

  // WALLS — face plane on the boundary, body outward.
  // north (face z=0.5, faces +z into the room, body z∈[-0.5,0.5]) — THE DOOR SIDE:
  //   wall [0.5..2.5] + APERTURE [2.5..3.5] + wall [3.5..5.5]
  add(WALL, 1.5, 0.5, R0, "wall-n");
  add(WALL, 4.5, 0.5, R0, "wall-n");
  // south (face z=5.5, faces −z, body z∈[5.5,6.5]): wall + centered half + wall
  add(WALL, 1.5, 5.5, R180, "wall-s");
  add(HALF, 3.0, 5.5, R180, "wall-s");
  add(WALL, 4.5, 5.5, R180, "wall-s");
  // west (face x=0.5, faces +x, body x∈[-0.5,0.5])
  add(WALL, 0.5, 1.5, R90, "wall-w");
  add(HALF, 0.5, 3.0, R90, "wall-w");
  add(WALL, 0.5, 4.5, R90, "wall-w");
  // east (face x=5.5, faces −x, body x∈[5.5,6.5])
  add(WALL, 5.5, 1.5, R270, "wall-e");
  add(HALF, 5.5, 3.0, R270, "wall-e");
  add(WALL, 5.5, 4.5, R270, "wall-e");

  // CORNERS — the four corner points where two wall face planes intersect:
  // (0.5,0.5) (5.5,0.5) (0.5,5.5) (5.5,5.5).
  if (corner === "post") {
    // template-wall-corner's body occupies the local −x/−z quadrant ([−0.5,0]² world, per its own
    // calibrated bounds), so a holder AT the corner point rotated per quadrant lands the post with
    // its two inner faces FLUSH with both wall face planes and its mass fully OUTWARD:
    //   R_y(θ): local (−0.5,−0.5) → NW(θ=0)(−x/−z) NE(θ=−90°)(+x/−z) SE(θ=180°)(+x/+z) SW(θ=90°)(−x/+z)
    add(CORNER_QUARTER, 0.5, 0.5, R0, "corner-nw");
    add(CORNER_QUARTER, 5.5, 0.5, R270, "corner-ne");
    add(CORNER_QUARTER, 5.5, 5.5, R180, "corner-se");
    add(CORNER_QUARTER, 0.5, 5.5, R90, "corner-sw");
  } else if (corner === "piece") {
    // the kit's authored CURVED quarter-round corner (2×2 footprint), one per corner, oriented so
    // the round bulges outward past the corner point.
    add(CORNER_PIECE, 0.5, 0.5, R0, "corner-nw");
    add(CORNER_PIECE, 5.5, 0.5, R270, "corner-ne");
    add(CORNER_PIECE, 5.5, 5.5, R180, "corner-se");
    add(CORNER_PIECE, 0.5, 5.5, R90, "corner-sw");
  } else if (corner === "lap") {
    // template-wall-half laps across the corner cells from the long bands (probe-rejected: thin
    // slabs leave protruding fins; kept callable for the A/B evidence).
    add(HALF, 0.0, 0.5, R0, "corner-nw");
    add(HALF, 6.0, 0.5, R0, "corner-ne");
    add(HALF, 0.0, 5.5, R180, "corner-sw");
    add(HALF, 6.0, 5.5, R180, "corner-se");
  }
  return modules;
}

/* the lineup probe's piece tables (positions filled in below). */
const LINEUP_MODULAR = [
  "template-wall", "template-wall-half", "template-corner", "template-wall-corner", "template-wall-top",
  "template-wall-detail-a", "template-detail", "template-floor", "template-floor-detail", "template-floor-detail-a",
  "gate", "gate-door", "gate-metal-bars",
];
const LINEUP_MINI = ["wall", "wall-half", "wall-narrow", "wall-opening", "gate", "floor", "floor-detail"];

/* prepBoard — build the REAL board off the fixture plan, then (card mode only) strip the prism
   shell + every non-clay channel in the BOARD DATA (pure data, pre-mount — the exact channel the
   KS-3 rig already writes). */
async function prepBoard(page, fx, opts) {
  return await page.evaluate((cfg) => {
    try {
      window.KIT_SHELL_ENABLED = false; // never the retired mixed-shell experiment
      window.KIT_DOORS_ENABLED = false; // KGR-8 demolition default — flat leaf only
      const fx = cfg.fx;
      const plan = {
        cellW: fx.w, cellD: fx.d, cells: fx.cells, rooms: [fx.room],
        corridors: [{ fromSeg: 1, toSeg: 1, cells: [{ x: fx.doorCell.x, y: fx.doorCell.y }] }],
        doors: [{ x: fx.doorCell.x, y: fx.doorCell.y, squeeze: false }],
        seed: "kgr8-clay-01",
      };
      const board = interiorBuildBoard(plan, { realmId: "fantasy", env: "dungeon", focusSegNum: fx.room.segNum });
      const strippedMeta = {
        prismFloor: board.instances.floor.length, prismWall: board.instances.wall.length,
        prismDoorframe: board.instances.doorframe.length, prismPillar: board.instances.pillar.length,
        portals: board.portals.length,
      };
      if (cfg.stripPrism) {
        // THE SWAP — whole-room claim (ruling 1): the prism shell never mounts on this board. The
        // compiled room shell consumes floorList, the per-cell meshes consume these same arrays —
        // empty in, zero prism geometry out. Skirt (the tray plinth under the floor silhouette)
        // stays production.
        board.instances.floor = [];
        board.instances.wall = [];
        board.instances.doorframe = [];
        board.instances.pillar = [];
        // A4 clay stage: no props/dressing/effects/practicals.
        board.cover = [];
        board.furniture = [];
        board.wallProps = [];
        board.lights = [];
        board.daisTop = [];
        // the darkness portal card is retired ON THIS CARD ONLY: it mounts INSIDE the aperture
        // nearer the room than the shut leaf (portal z≈−2.63 vs leaf z≈−3.0, measured off the live
        // inventory), so it fully covers the flat leaf the door law wants read. The dark-opening
        // ruling is about doorways into the beyond; this card's single doorway is SHUT. Later cards
        // with open doorways re-adopt the production portal.
        board.portals = [];
      }
      board.renderProfile = null;      // clay neutrality — no realm grade on the card
      board.lightProfile = cfg.lightProfile || "overcast"; // flattest neutral profile (no points, no flicker)
      board.interactables = [{
        archetype: "door", sourceRef: "kgr8.clay01.door", state: "shut",
        x: fx.doorCell.x, y: fx.doorCell.y, slug: "door", name: "Plain Door", flavor: "a flat leaf",
        extrudeDepth: 0.32, reserve: false,
      }];
      board.pieces = [];
      board.dressing = [];
      board.decals = [];
      return { ok: true, board, strippedMeta };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { fx, stripPrism: !!opts.stripPrism, lightProfile: opts.lightProfile });
}

/* mountBoard — capture the live THREE scene via a temporary Object3D.add hook (setInteriorBoard
   re-adds S.interiorGroup to S.scene on every mount), then find the interior group. */
async function mountBoard(page, board) {
  return await page.evaluate(async (b) => {
    try {
      const THREE = await import("three");
      const K = (window.__KGR8 = window.__KGR8 || {});
      K.THREE = THREE;
      // one-time render hook: capture the LIVE (scene, camera) pair the production render loop
      // actually draws with — needed for the screen-space projection diagnostics.
      if (!K.renderHooked) {
        const origRender = THREE.WebGLRenderer.prototype.render;
        if (origRender) {
          THREE.WebGLRenderer.prototype.render = function (scene, camera) {
            if (scene && scene.isScene && camera && camera.isCamera) { K.scene = scene; K.camera = camera; }
            return origRender.call(this, scene, camera);
          };
        }
        // older three builds define WebGLRenderer.render per-instance — the camera is still
        // reachable through Object3D.prototype.lookAt, which placeCamera calls on every zoom/fit.
        const origLookAt = THREE.Object3D.prototype.lookAt;
        THREE.Object3D.prototype.lookAt = function (...a) {
          if (this.isCamera) K.camera = this;
          return origLookAt.apply(this, a);
        };
        K.renderHooked = true;
      }
      const origAdd = THREE.Object3D.prototype.add;
      THREE.Object3D.prototype.add = function (...objs) {
        if (this.isScene) K.scene = this;
        return origAdd.apply(this, objs);
      };
      try {
        window.Theater._resetInteriorDoorStateForTest();
        window.Theater.setInteriorBoard(b);
      } finally {
        THREE.Object3D.prototype.add = origAdd;
      }
      if (!K.scene) return { ok: false, error: "scene never captured via add hook" };
      K.interiorGroup = null;
      K.scene.traverse((o) => {
        if (K.interiorGroup) return;
        if (o.isGroup && o.children.some((c) => c.userData && c.userData.interiorKind)) K.interiorGroup = o;
      });
      // fall back: the group that owns the most descendants with interiorKind stamps
      if (!K.interiorGroup) {
        let best = null, bestN = 0;
        K.scene.children.forEach((o) => {
          let n = 0; o.traverse((c) => { if (c.userData && c.userData.interiorKind) n++; });
          if (n > bestN) { bestN = n; best = o; }
        });
        K.interiorGroup = best;
      }
      if (!K.interiorGroup) return { ok: false, error: "interior group not found in captured scene" };
      return {
        ok: true,
        meshKinds: window.Theater._interiorGroupMeshInfoForTest().map((m) => m.kind),
        origin: window.Theater.interiorBoardOrigin(),
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, board);
}

/* mountKitModules — load every module through the REAL admission path and hand-place it. */
async function mountKitModules(page, modules, opts) {
  return await page.evaluate(async (cfg) => {
    try {
      const K = window.__KGR8;
      const THREE = K.THREE;
      if (!K || !K.interiorGroup) return { ok: false, error: "mountBoard must run first" };
      if (K.kitGroup) { K.kitGroup.parent && K.kitGroup.parent.remove(K.kitGroup); K.kitGroup = null; }
      const origin = window.Theater.interiorBoardOrigin() || { cx: 0, cz: 0 };
      const FLOOR_TOP_Y = -0.3;  // ITR_FLOOR_BASE_Y (−0.5) + ITR_FLOOR_HEIGHT (0.2) — KIT_FLOOR_TOP_Y's own published sum
      const FLOOR_BASE_Y = -0.5; // walls stand on the base plane, same as interiorBuildKitShellWalls
      const group = new THREE.Group();
      group.userData = { interiorKind: "kgr8-clay-kit" };
      const manifest = [];
      // preload one template per (pack,slug) through the REAL loader (provenance verified), clone per placement
      const templates = {};
      for (const m of cfg.modules) {
        const key = m.pack + "/" + m.slug;
        if (!templates[key]) {
          templates[key] = await window.TheaterDonor.loadDonorPiece(m.pack, m.slug, {
            realmId: "fantasy", realmProfile: null, seedKey: "kgr8-clay:" + key,
          });
        }
      }
      for (const m of cfg.modules) {
        const key = m.pack + "/" + m.slug;
        const piece = templates[key].clone(true);
        // re-anchor: floor-mount socket onto the holder origin (the interiorBuildKitShellWalls law)
        const sockets = (templates[key].userData && templates[key].userData.sockets) || [];
        const fm = sockets.find((s) => s.type === "floor-mount" && Array.isArray(s.position));
        const off = fm ? fm.position : [0, 0, 0];
        piece.position.set(-off[0], -off[1], -off[2]);
        piece.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        const holder = new THREE.Group();
        holder.add(piece);
        const isFloor = m.role === "floor";
        holder.position.set(m.x - origin.cx, (isFloor ? cfg.floorTopY ?? FLOOR_TOP_Y : FLOOR_BASE_Y) + (m.yOffset || 0), m.z - origin.cz);
        holder.rotation.y = m.rotY || 0;
        // production wall-height parity — the engine's OWN kit-wall convention (theater-boot.js
        // KIT_WALL_NATIVE_HEIGHT 2.075: "a non-uniform Object3D.scale.y correction, X/Z untouched")
        // stretches kit walls to the board's wallHeightBase so the leaf/portal/parapet machinery
        // (all calibrated to that height) stays consistent. Same correction applied here to walls
        // AND corner posts (post native 2.025 → the same 1.9-world wall top, closing the kit's own
        // 0.05 wall-vs-post height mismatch).
        if (!isFloor && cfg.wallHeightBase && m.nativeHeight) holder.scale.y = cfg.wallHeightBase / m.nativeHeight;
        holder.userData = { kgr8Module: key, role: m.role, planX: m.x, planZ: m.z };
        group.add(holder);
        manifest.push({ module: key, role: m.role, x: m.x, z: m.z, rotY: m.rotY || 0, scaleY: holder.scale.y });
      }
      // CAMERA-SIDE PARAPET PARITY — the documented fixture-side mirror of theater-boot.js's
      // itrCameraSideBand + ITR_CUTAWAY_PARAPET_FRAC (0.4): band = focusRect±1, camera side =
      // (rx·sin(yaw) + rz·cos(yaw)) > 0 with yaw = rotationStep·90° + 45° (fresh session:
      // rotationStep 0 → 45°). Applied to WALL/CORNER holders only, never the floor.
      let parapetCut = 0;
      if (cfg.applyCutaway && cfg.focusRect) {
        const fr = cfg.focusRect;
        const yaw = (45 * Math.PI) / 180;
        const dirX = Math.sin(yaw), dirZ = Math.cos(yaw);
        group.children.forEach((holder) => {
          if (holder.userData.role === "floor") return;
          const wx = holder.userData.planX, wz = holder.userData.planZ;
          const inBand = wx >= fr.minX - 1 && wx <= fr.maxX + 1 && wz >= fr.minZ - 1 && wz <= fr.maxZ + 1;
          if (!inBand) return;
          const rx = wx - origin.cx, rz = wz - origin.cz;
          if ((rx * dirX + rz * dirZ) > 0) { holder.scale.y *= 0.4; parapetCut++; }
        });
      }
      K.interiorGroup.add(group);
      K.kitGroup = group;
      return { ok: true, placed: manifest.length, parapetCut, manifest };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { modules, applyCutaway: !!opts.applyCutaway, focusRect: opts.focusRect || null, floorTopY: opts.floorTopY, wallHeightBase: opts.wallHeightBase || null });
}

/* clayPass — uniform clay-grey matte, SCOPED: the hand-mounted kit group, the skirt (tray plinth),
   and the interactables subtree (the flat leaf) — never the stage/void planes (clean-void ruling 4
   keeps everything beyond the room dark) and never the darkness portals (the "dark opening" read).
   Removes motes (Points), kills scene fog, disables the post chain, adds the neutral clay rig. */
async function clayPass(page) {
  return await page.evaluate(() => {
    try {
      const K = window.__KGR8;
      const THREE = K.THREE;
      if (!K || !K.scene || !K.interiorGroup) return { ok: false, error: "mount steps must run first" };
      const clay = K.clayMat || (K.clayMat = new THREE.MeshStandardMaterial({ color: 0xa8a29a, roughness: 0.93, metalness: 0.0 }));
      // the leaf sits recessed inside the aperture tunnel where the neutral rig barely reaches — it
      // gets the clay tone PLUS a small emissive lift, the clay-card analog of the engine's own
      // "door leaf carries the sprite emissive readability floor" law (KGR-8 demolition item 5).
      const leafClay = K.leafClayMat || (K.leafClayMat = new THREE.MeshStandardMaterial({
        color: 0xa8a29a, roughness: 0.93, metalness: 0.0, emissive: 0x565049, emissiveIntensity: 1.0,
      }));
      let clayed = 0, portalsKept = 0, pointsRemoved = 0;
      const clayTargets = [];
      if (K.kitGroup) clayTargets.push({ root: K.kitGroup, mat: clay });
      const voidMatEarly = K.voidMat || (K.voidMat = new THREE.MeshBasicMaterial({ color: 0x14100c }));
      K.interiorGroup.children.forEach((child) => {
        // the interactables group (the flat leaf): userData carries bySourceRef (theater-boot.js's
        // own interiorBuildInteractables return shape).
        if (child.userData && child.userData.bySourceRef) clayTargets.push({ root: child, mat: leafClay });
        // the skirt ring: its fantasy-kit albedo reads PALE under the neutral clay rig (production
        // only reads it dark through mood lighting + grade + post, all disabled on this card).
        // CHARCOAL MATTE, not pure void-black: the kit walls ship base-rubble scatter that lands
        // on the skirt plane — over unlit black the chips read as floating shards; over a dim
        // lit charcoal they ground as debris on the tray plinth, while the plinth stays clearly
        // darker than the room (ruling 4's hierarchy holds).
        if (child.userData && child.userData.interiorKind === "skirt") {
          child.material = K.skirtMat || (K.skirtMat = new THREE.MeshStandardMaterial({ color: 0x2b2926, roughness: 1.0, metalness: 0 }));
        }
      });
      const toRemove = [];
      clayTargets.forEach(({ root, mat }) => root.traverse((o) => {
        if (!o.isMesh) return;
        const kind = (o.userData && o.userData.interiorKind) || null;
        if (kind === "portal") { portalsKept++; return; }
        o.material = mat;
        clayed++;
      }));
      K.interiorGroup.traverse((o) => { if (o.isPoints) toRemove.push(o); });
      // the ambient MOTE field mounts as a group of tiny drifting meshes (not Points) regardless of
      // board.lights — A4 stage 1 says no effects, so any direct child group made ENTIRELY of
      // sub-0.35-extent meshes is removed (measured: 8 specks spread across the room's mid-air).
      K.interiorGroup.children.forEach((child) => {
        if (!child.isGroup || (child.userData && (child.userData.interiorKind || child.userData.bySourceRef))) return;
        let meshCount = 0, allTiny = true;
        child.traverse((c) => {
          if (!c.isMesh) return;
          meshCount++;
          const box = new THREE.Box3().setFromObject(c);
          const size = box.getSize(new THREE.Vector3());
          if (Math.max(size.x, size.y, size.z) > 0.35) allTiny = false;
        });
        if (meshCount > 0 && allTiny) toRemove.push(child);
      });
      toRemove.forEach((o) => { o.parent && o.parent.remove(o); pointsRemoved++; });
      // CLEAN VOID (ruling 4): the stage/table planes OUTSIDE the interior group read pale under the
      // neutral clay rig — force every large flat scene mesh outside the interior group to an unlit
      // near-black void material so nothing renders beyond the active room.
      let voidDarkened = 0;
      const voidOutside = [];
      const voidMat = K.voidMat || (K.voidMat = new THREE.MeshBasicMaterial({ color: 0x14100c }));
      K.scene.traverse((o) => {
        if (!o.isMesh) return;
        let inInterior = false;
        for (let p = o; p; p = p.parent) if (p === K.interiorGroup) { inInterior = true; break; }
        if (inInterior) return;
        const box = new THREE.Box3().setFromObject(o);
        const size = box.getSize(new THREE.Vector3());
        const colorHex = (o.material && o.material.color) ? o.material.color.getHexString() : null;
        voidOutside.push({ type: o.type, name: o.name || null, size: size.toArray().map((v) => +v.toFixed(2)), y: +box.min.y.toFixed(2), color: colorHex });
        // any broad ground-plane-scale mesh beyond the interior group is void territory (ruling 4)
        if (Math.max(size.x, size.z) > 6 && size.y < 1.2) { o.material = voidMat; voidDarkened++; }
      });
      K.scene.fog = null;
      // neutral clay light rig — A4 stage 1 "neutral material, high legibility": one hemisphere +
      // one soft key raking from camera-left-high so form reads without any mood/practical light.
      if (!K.clayLights) {
        const rig = new THREE.Group();
        rig.add(new THREE.HemisphereLight(0xffffff, 0x777770, 0.85));
        const key = new THREE.DirectionalLight(0xffffff, 0.75);
        key.position.set(6, 12, 9);
        key.target.position.set(0, 0, 0);
        rig.add(key); rig.add(key.target);
        K.scene.add(rig);
        K.clayLights = rig;
      }
      if (window.Theater._setPostChainEnabledForTest) window.Theater._setPostChainEnabledForTest(false);
      if (window.Theater._setOcclusionFadeDisabledForTest) window.Theater._setOcclusionFadeDisabledForTest(true);
      if (window.Theater._renderFrameForTest) window.Theater._renderFrameForTest();
      return { ok: true, clayed, portalsKept, pointsRemoved, voidDarkened, voidOutside };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

/* sceneInventory — every direct child of the interior group (and each interactables/kit child one
   level down): kind tags, mesh/instance counts, world-space AABB. The "what is actually standing
   on this board" audit the diagnosis JSON carries so nothing in the frame is unaccounted for. */
async function sceneInventory(page) {
  return await page.evaluate(() => {
    const K = window.__KGR8;
    if (!K || !K.interiorGroup) return null;
    const THREE = K.THREE;
    const rows = [];
    const describe = (o, depth, path) => {
      const kind = (o.userData && (o.userData.interiorKind || o.userData.kgr8Module)) || null;
      let meshes = 0, instances = 0;
      o.traverse((c) => { if (c.isMesh) { meshes++; instances += c.isInstancedMesh ? c.count : 1; } });
      const box = new THREE.Box3().setFromObject(o);
      rows.push({
        depth, path, type: o.type, name: o.name || null, kind,
        userDataKeys: o.userData ? Object.keys(o.userData) : [],
        meshes, instances,
        box: box.isEmpty() ? null : {
          min: box.min.toArray().map((v) => +v.toFixed(3)),
          max: box.max.toArray().map((v) => +v.toFixed(3)),
        },
      });
    };
    K.interiorGroup.children.forEach((child, i) => {
      describe(child, 0, "interiorGroup[" + i + "]");
      const kind = child.userData && (child.userData.interiorKind || null);
      const isInteractables = !!(child.userData && child.userData.bySourceRef);
      if (kind === "kgr8-clay-kit" || isInteractables) {
        child.children.forEach((g, j) => describe(g, 1, "interiorGroup[" + i + "][" + j + "]"));
      }
    });
    return rows;
  });
}

async function forceFrame(page) {
  await page.evaluate(() => { if (window.Theater._renderFrameForTest) window.Theater._renderFrameForTest(); });
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))).catch(() => {});
}

async function shoot(page, fileName) {
  await forceFrame(page);
  const canvasEl = await page.$(".theater-stage-canvas canvas");
  const shotPath = path.join(outDir, fileName);
  if (canvasEl) await canvasEl.screenshot({ path: shotPath });
  else await page.screenshot({ path: shotPath, fullPage: false });
  log(`captured ${fileName}`);
  return shotPath;
}

async function runLineup(page, metrics) {
  // board with the prism shell KEPT (context probe, not an acceptance frame)
  for (const [name, pack, slugs, planW, planD] of [
    ["lineup-modular", "kenney-modular-dungeon-kit", LINEUP_MODULAR, 17, 11],
    ["lineup-mini", "kenney-mini-dungeon", LINEUP_MINI, 17, 11],
  ]) {
    const fx = lineupPlan(planW, planD);
    const prep = await prepBoard(page, fx, { stripPrism: false, lightProfile: "overcast" });
    if (!prep.ok) throw new Error(name + " prep failed: " + prep.error);
    const mounted = await mountBoard(page, prep.board);
    if (!mounted.ok) throw new Error(name + " mount failed: " + mounted.error);
    await sleep(2500);
    // stand the pieces in rows of 5, 3 units apart, donor materials intact
    const modules = slugs.map((slug, i) => ({
      pack, slug,
      x: 2.5 + (i % 5) * 3, z: 2.5 + Math.floor(i / 5) * 3.2,
      rotY: 0, role: "lineup",
    }));
    const placed = await mountKitModules(page, modules, { applyCutaway: false, floorTopY: -0.3 });
    if (!placed.ok) throw new Error(name + " module mount failed: " + placed.error);
    await page.evaluate(() => { const K = window.__KGR8; K.scene.fog = null; if (window.Theater._setPostChainEnabledForTest) window.Theater._setPostChainEnabledForTest(false); });
    await sleep(1200);
    await shoot(page, name + ".png");
    metrics[name] = { placed: placed.placed, manifest: placed.manifest };
  }
  fs.writeFileSync(path.join(outDir, "lineup-manifest.json"), JSON.stringify(metrics, null, 2));
}

async function runCard(page, metrics) {
  const fx = clayPlan();
  const prep = await prepBoard(page, fx, { stripPrism: true, lightProfile: "overcast" });
  if (!prep.ok) throw new Error("card prep failed: " + prep.error);
  metrics.strippedMeta = prep.strippedMeta;
  metrics.focusRect = prep.board.focusRect;
  const mounted = await mountBoard(page, prep.board);
  if (!mounted.ok) throw new Error("card mount failed: " + mounted.error);
  metrics.mount = mounted;
  await sleep(3000); // camera tween settle
  const modules = kitRecipe(CORNER);
  const placed = await mountKitModules(page, modules, { applyCutaway: true, focusRect: prep.board.focusRect, wallHeightBase: prep.board.wallHeightBase });
  if (!placed.ok) throw new Error("kit module mount failed: " + placed.error);
  metrics.kit = { corner: CORNER, placed: placed.placed, parapetCut: placed.parapetCut, manifest: placed.manifest };
  // THE LEAF-PLANE CORRECTION (fixture-scoped, documented in the README): production mounts the
  // leaf hinge at the door CELL CENTER — the wall MID-PLANE under the old 1-cell-thick prism walls,
  // but half a cell OUTSIDE the thin kit slab (slab face plan z=0.5, ~0.15 deep). Shift the hinge
  // +0.20z so the leaf sits inside the aperture with a ~0.14 reveal behind the wall face — "a flat
  // leaf in the wall plane" (door law), zero proud surround, and the shadowed reveal outlines the
  // leaf so it still READS as a door on a uniform clay card (a perfectly flush clay leaf visually
  // merges into the wall — measured on the v6 capture). Screen-map evidence for the underlying
  // mismatch: the leaf base sat at plan z=0, a detached monolith behind the aperture.
  metrics.leafShift = await page.evaluate(() => {
    const K = window.__KGR8;
    let shifted = 0;
    K.interiorGroup.children.forEach((child) => {
      if (child.userData && child.userData.bySourceRef) {
        child.children.forEach((hinge) => { hinge.position.z += 0.20; shifted++; });
      }
    });
    return { shifted, dz: 0.20 };
  });
  const clay = await clayPass(page);
  if (!clay.ok) throw new Error("clay pass failed: " + clay.error);
  metrics.clay = clay;
  // whole-shell framing: production zoom-out steps (instant placeCamera, no tween)
  metrics.zoom = await page.evaluate((steps) => {
    let level = null;
    for (let i = 0; i < steps; i++) level = window.Theater.zoom(-1);
    return { steps, level };
  }, ZOOMOUT);
  await sleep(800);
  // clay RE-ASSERT — async texture loads (the leaf's own sprite/emissive floor) can re-assign a
  // material after the first pass; a second traverse right before the shot catches every late swap.
  const clay2 = await clayPass(page);
  metrics.clayReassert = clay2;
  metrics.inventory = await sceneInventory(page);
  if (args.screenmap) {
    metrics.screenmap = await page.evaluate(() => {
      const K = window.__KGR8;
      const cam = (function findCam(){ let c = null; K.scene.traverse((o) => { if (o.isCamera) c = c || o; }); return c; })();
      // S.camera isn't scene-childed in three; recover via renderer? fall back: use kit holders' matrices with the camera from Theater state seam
      const rows = [];
      const canvas = document.querySelector(".theater-stage-canvas canvas");
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const project = (obj, label) => {
        obj.updateWorldMatrix(true, false);
        const p = new K.THREE.Vector3().setFromMatrixPosition(obj.matrixWorld);
        const top = p.clone(); top.y += 1.9 * (obj.scale ? obj.scale.y : 1);
        [["base", p], ["top", top]].forEach(([tag, v]) => {
          const ndc = v.clone().project(K.camera);
          rows.push({ label: label + ":" + tag, x: +(((ndc.x + 1) / 2) * w).toFixed(0), y: +(((1 - ndc.y) / 2) * h).toFixed(0) });
        });
      };
      if (!K.camera) return { error: "no K.camera", camFound: !!cam };
      K.kitGroup.children.forEach((holder) => project(holder, holder.userData.role + "@" + holder.userData.planX + "," + holder.userData.planZ));
      K.interiorGroup.children.forEach((child) => { if (child.userData && child.userData.bySourceRef) child.children.forEach((hinge, i) => project(hinge, "leaf" + i)); });
      return { rows, w, h };
    });
  }
  if (args.probe) {
    metrics.probe = await page.evaluate(() => {
      const K = window.__KGR8;
      const rows = [];
      K.scene.traverse((o) => {
        if (!(o.isMesh || o.isSprite || o.isPoints || o.isLine)) return;
        if (!o.visible) return;
        const box = new K.THREE.Box3().setFromObject(o);
        const size = box.getSize(new K.THREE.Vector3());
        let inInterior = false;
        for (let p = o; p; p = p.parent) if (p === K.interiorGroup) { inInterior = true; break; }
        rows.push({
          t: o.type, name: o.name || null, inInterior,
          kind: (o.userData && o.userData.interiorKind) || null,
          size: size.toArray().map((v) => +v.toFixed(2)), yMin: +box.min.y.toFixed(2),
          mat: o.material ? { type: o.material.type, color: o.material.color ? o.material.color.getHexString() : null, transparent: !!o.material.transparent, opacity: o.material.opacity } : null,
        });
      });
      const host = document.querySelector(".theater-stage-canvas");
      const dom = [];
      if (host) Array.from(host.children).forEach((c) => {
        const cs = getComputedStyle(c);
        dom.push({ tag: c.tagName, cls: c.className && c.className.baseVal !== undefined ? String(c.className.baseVal) : String(c.className || ""), bg: cs.backgroundColor, transform: cs.transform, w: c.clientWidth, h: c.clientHeight, children: c.children.length });
      });
      return { sceneRows: rows.filter((r) => !r.inInterior || r.kind === "skirt" || Math.max(...r.size) > 5), dom, sceneChildren: K.scene.children.map((c) => c.type + ":" + (c.name || "")) };
    });
  }
  // LATE-ASYNC SETTLE: file-texture loads / donor replays can re-add production pieces (skirt,
  // motes, leaf materials) AFTER the first clay pass — settle fully, then re-assert the clay/void
  // state at shot time and take the final-state inventory the diagnosis records.
  await sleep(2500);
  metrics.clayFinal = await clayPass(page);
  metrics.leafShiftFinal = await page.evaluate(() => {
    const K = window.__KGR8;
    let shifted = 0;
    K.interiorGroup.children.forEach((child) => {
      if (child.userData && child.userData.bySourceRef) {
        child.children.forEach((hinge) => { if (Math.abs(hinge.position.z % 1) < 0.01) { hinge.position.z += 0.20; shifted++; } });
      }
    });
    return { shifted };
  });
  metrics.inventoryFinal = await sceneInventory(page);
  if (args.xray2) {
    const groups = [
      ["xray2-floor", "(o)=>o.userData.role==='floor'"],
      ["xray2-walls", "(o)=>o.userData.role&&o.userData.role!=='floor'"],
      ["xray2-skirt", "skirt"],
      ["xray2-leaf", "leaf"],
    ];
    for (const [name, sel] of groups) {
      await page.evaluate((s) => {
        const K = window.__KGR8;
        K.scene.traverse((o) => { if (o.isMesh || o.isSprite || o.isPoints) o.visible = false; });
        if (s === "skirt") {
          K.interiorGroup.children.forEach((c) => { if (c.userData && c.userData.interiorKind === "skirt") c.visible = true; });
        } else if (s === "leaf") {
          K.interiorGroup.children.forEach((c) => { if (c.userData && c.userData.bySourceRef) c.traverse((m) => { m.visible = true; }); });
        } else {
          const fn = eval(s);
          K.kitGroup.children.forEach((h) => { if (fn(h)) h.traverse((m) => { m.visible = true; }); });
        }
      }, sel);
      await shoot(page, name + ".png");
    }
    await page.evaluate(() => { const K = window.__KGR8; K.scene.traverse((o) => { if (o.isMesh || o.isSprite || o.isPoints) o.visible = true; }); });
  }
  if (args.xray) {
    await page.evaluate(() => { const K = window.__KGR8; K.hidden = []; K.scene.traverse((o) => { if ((o.isMesh || o.isSprite || o.isPoints) && o.visible) { K.hidden.push(o); o.visible = false; } }); });
    await shoot(page, "xray-empty.png");
    await page.evaluate(() => { const K = window.__KGR8; K.hidden.forEach((o) => { if (o.userData && o.userData.interiorKind === "skirt") o.visible = true; }); });
    await shoot(page, "xray-skirt.png");
    await page.evaluate(() => { const K = window.__KGR8; K.hidden.forEach((o) => { o.visible = true; }); });
  }
  await shoot(page, SHOT + ".png");
  metrics.generatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, SHOT.replace(/-shell$/, "") + "-diagnosis.json"), JSON.stringify(metrics, null, 2));
}

async function main() {
  const metrics = { mode: MODE, corner: CORNER, notes: [] };
  const server = await startServer();
  let lastError = null;
  try {
    for (let attempt = 1; attempt <= 3; attempt++) {
      let browser = null;
      try {
        browser = await launchChrome();
        const page = await newPage(browser);
        await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await sleep(300);
        await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
        const boot = await bootToInSession(page);
        metrics.boot = boot;
        if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
        const theaterState = await waitForTheater(page);
        if (!theaterState || !theaterState.hasSetInteriorBoard || !theaterState.hasDonor) {
          throw new Error("Theater/TheaterDonor never mounted: " + JSON.stringify(theaterState));
        }
        if (MODE === "lineup") await runLineup(page, metrics);
        else await runCard(page, metrics);
        lastError = null;
        break;
      } catch (e) {
        lastError = e;
        log(`attempt ${attempt} failed: ${e.message}`);
        metrics.notes.push(`attempt ${attempt}: ${e.message}`);
      } finally {
        if (browser) try { await browser.close(); } catch (e) {}
      }
      await sleep(3000);
    }
    if (lastError) throw lastError;
    log("done.");
  } finally {
    if (server.proc) try { server.proc.kill("SIGTERM"); } catch (e) {}
  }
}
main().catch((e) => { console.error("[kgr8-clay-room] FATAL:", e); process.exit(1); });
