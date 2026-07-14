#!/usr/bin/env node
/* dev/audit-depth-state.mjs — Phase-3 Wave-1 P3-1b (GP-4a depth-state defect audit, DIAGNOSTIC ONLY;
   docs/PHASE-3-WAVE-1-SPECS.md "P3-1b — GP-4a depth-state defect audit"). Input to the later P3-3
   GP-4b fix wave (docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md S7.1) — this script fixes NOTHING and
   edits NO product source. It captures the LIVE oss-kernel scene at four fixed camera yaws and dumps
   every material's depth-state (depthWrite/depthTest/transparent/blending/renderOrder) so a human/
   Codex reviewer can classify each transparency artifact into S7.1's three classes (alpha-tested
   cutout / additive FX / true normal-alpha solid) and flag which are SIMPLER depth-state defects
   (transparent without depthWrite=false; coplanar rings/decals needing layer height / polygon offset
   / bounded render order) versus which would be real OIT candidates.

   Bootstrap/scene-setup MODELED ON (per the spec's own instruction):
     - dev/capture-oss-integrated.mjs — product camera, oss kernel mounted via the existing
       window.Theater._setRoomShellPolygonKernel/_setRoomShellEnabled test seams, shotCompose:false
       (no pose override — the shot a player actually sees).
     - dev/verify-transparent-material-contract.mjs — the dressed multi-room fixture (Grand Octagon hub
       + 2 neighbor chambers, lightProfile="lamplit", 2x Skeleton standee) that GP-1 proved already
       exercises all three S7.1 transparency classes in one live scene (byClass in its own
       dev/battle-gate/material-contract/contract.json: alpha-tested-cutout=4, additive-fx=7,
       normal-alpha-solid=27), plus its classify() logic (extended here with depthTest/renderOrder,
       which that harness didn't need).

   FOUR FIXED YAWS: window.Theater.rotate() advances S.rotationStep by exactly 1 (mod 4) each call —
   the same rotationStep*90deg + CAM_YAW_OFFSET_DEG yaw law theater-boot.js already uses everywhere
   (theater-boot.js:3995,4379,8472,8768) — so four calls sweep the camera through all four fixed yaws
   (0/90/180/270 relative to the default). rotate() alone only calls placeCamera() (never re-runs
   setInteriorBoard); window.Theater.setInteriorVariant({}) is the EXISTING mechanism
   (S.boardKey=null; replay S.lastBoard) that forces the same board to rebuild at the new
   rotationStep — copied verbatim from dev/battle-gate/capture-wall-occlusion.mjs's own two-yaw
   sequence, extended here to four.

   Reads-only seams used (all pre-existing on master; this script adds NONE):
     window.Theater._setRoomShellPolygonKernel / _setRoomShellEnabled / setInteriorBoard /
     setInteriorVariant / rotate / _graphicsResearchContextForTest / _renderFrameForTest

   Run:  node dev/audit-depth-state.mjs
   Output: dev/depth-audit/{yaw-0,yaw-90,yaw-180,yaw-270}.png + dev/depth-audit/depth-state.json +
           dev/depth-audit/report.md (the deliverable defect table). */

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
const OUT_DIR = path.join(__dirname, "depth-audit");
fs.mkdirSync(OUT_DIR, { recursive: true });

// a port range disjoint from the sibling battle-gate/dev harnesses' own claimed ranges.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5301, 5302, 5303, 5304, 5305];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[depth-audit]", ...a); }
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

const SHOT_W = 1600, SHOT_H = 1000;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}
async function newPage(browser) {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// bootToInSession — verbatim convention from dev/capture-oss-integrated.mjs / dev/verify-transparent-
// material-contract.mjs (same sibling harnesses this unit's own header cites).
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
      if (nameEl) nameEl.value = "Depth Audit Soul";
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
  const deadline = Date.now() + 45000;
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

// The dressed, multi-room, dressing+furniture+lights+doorframe+standee fixture — verbatim copy of
// dev/verify-transparent-material-contract.mjs's own buildScene (already proven, per its own committed
// contract.json, to exercise all three S7.1 transparency classes in one live mount: alpha-tested-
// cutout=4, additive-fx=7, normal-alpha-solid=27, opaque=15).
async function buildScene(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }, { targetId: "s3" }],
          light: "normal", areaType: "Grand Octagon", dims: "60' x 60'" },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s3", num: 3, label: "s3", isFinale: true, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
      ];
      const plan = spatializePlan(fixture, "Depth Audit Hub", { walkId: "depth-audit-octagon" });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s1");
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = "lamplit";
      const cells = (focusRoom.cells || []).slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
      const cellA = cells[Math.floor(cells.length / 3)] || cells[0];
      const cellB = cells[Math.floor(cells.length * 2 / 3)] || cells[cells.length - 1];
      // edge cells (the room's own extreme corner + a near neighbor) — used to place a REAL
      // GS.combat player/primaryThreat pair close to a wall (theater-boot.js's C4.1b upper-band
      // occlusion only fades a wall segment that's actually camera-side AND blocking one of its 4
      // required ShotPlan subjects — a bare dressed room with no combat units never exercises it,
      // per docs/PHASE-3-WAVE-1-SPECS.md P3-1d's own "closed box" finding). Model: verbatim convention
      // from dev/battle-gate/capture-wall-occlusion.mjs (melee-range pair near a room edge).
      const edgeCell = cells[0];
      const edgeCell2 = cells.find((c) => c !== edgeCell && Math.abs(c.x - edgeCell.x) <= 2 && Math.abs(c.y - edgeCell.y) <= 2) || cells[1] || edgeCell;
      board.pieces = [
        { slug: "Skeleton", fid: "depth-audit-probe-a", cellX: cellA.x, cellY: cellA.y },
        { slug: "Skeleton", fid: "depth-audit-probe-b", cellX: cellB.x, cellY: cellB.y },
        { slug: "class:fighter", fid: "depth-audit-pc", cellX: edgeCell.x, cellY: edgeCell.y },
        { slug: "Skeleton", fid: "depth-audit-threat", cellX: edgeCell2.x, cellY: edgeCell2.y },
      ];
      return { ok: true, board, roomShape: focusRoom.shape, roomCellCount: cells.length, edgeCell, edgeCell2 };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

async function pollPiecesResolved(page) {
  const deadline = Date.now() + 15000;
  let r = null;
  while (Date.now() < deadline) {
    r = await page.evaluate(() => ({
      resolved: window.Theater.interiorPiecesResolved(),
      requested: window.Theater.interiorPiecesRequested(),
      fileTexPending: window.Theater.interiorFileTexPending(),
    }));
    if (r.resolved >= r.requested && r.fileTexPending === 0) return r;
    await sleep(200);
  }
  return r;
}

async function mountOssKernel(page) {
  return await page.evaluate(() => {
    try {
      window.Theater._setRoomShellPolygonKernel("oss");
      window.Theater._setRoomShellEnabled(true);
      return { ok: true, kernel: window.Theater._roomShellPolygonKernel() };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// dumpDepthState — runs IN-PAGE; walks the live scene graph and records, per unique material, the five
// depth-state fields the spec names (depthWrite/depthTest/transparent/blending/renderOrder), plus the
// classification RESEARCH-WAVE S7.1 defines (alpha-tested-cutout / additive-fx / normal-alpha-solid /
// opaque) so the report can flag "transparent without depthWrite=false" mechanically. renderOrder is a
// per-Object3D property (not per-material) — recorded per owner, not per material record.
async function dumpDepthState(page, yawLabel) {
  return await page.evaluate((yawLabel) => {
    const ctx = window.Theater._graphicsResearchContextForTest ? window.Theater._graphicsResearchContextForTest() : null;
    if (!ctx || !ctx.scene) return { ok: false, reason: "no graphics-research ctx seam" };
    const ADDITIVE_BLENDING = 2; // THREE.AdditiveBlending — stable enum int, avoids needing a global THREE binding in-page.
    const blendingName = (b) => ({ 0: "NoBlending", 1: "NormalBlending", 2: "AdditiveBlending", 3: "SubtractiveBlending", 4: "MultiplyBlending", 5: "CustomBlending" }[b] ?? String(b));
    function classify(m) {
      const additive = m.blending === ADDITIVE_BLENDING;
      const alphaTested = (m.alphaTest || 0) > 0;
      const transparent = !!m.transparent;
      if (alphaTested && additive) return "ambiguous";
      if (alphaTested) return "alpha-tested-cutout";
      if (additive) return "additive-fx";
      if (transparent) return "normal-alpha-solid";
      return "opaque";
    }
    const seen = new Map();
    function visit(m, obj, slot) {
      if (!m || !m.uuid) return;
      let rec = seen.get(m.uuid);
      if (!rec) {
        rec = {
          uuid: m.uuid, type: m.type || "Material", cls: classify(m),
          depthWrite: m.depthWrite !== false, depthTest: m.depthTest !== false,
          transparent: !!m.transparent, alphaTest: m.alphaTest || 0, blending: blendingName(m.blending),
          opacity: typeof m.opacity === "number" ? m.opacity : 1,
          owners: [],
        };
        seen.set(m.uuid, rec);
      }
      rec.owners.push({ objectType: obj.type || "Object3D", objectName: obj.name || null, slot, renderOrder: obj.renderOrder || 0, interiorKind: (obj.userData && obj.userData.interiorKind) || null });
    }
    ctx.scene.traverse((obj) => {
      const list = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
      list.forEach((m, i) => visit(m, obj, list.length > 1 ? "material[" + i + "]" : "material"));
      if (obj.customDepthMaterial) visit(obj.customDepthMaterial, obj, "customDepthMaterial");
      if (obj.customDistanceMaterial) visit(obj.customDistanceMaterial, obj, "customDistanceMaterial");
    });
    const records = Array.from(seen.values());
    // depth-state-defect flags per S7.1: a transparent (non-opaque, non-additive-excluded) material
    // whose depthWrite is still true; OR two-plus owners sharing an identical renderOrder AND both
    // transparent AND depthWrite:false at the SAME slot (the "coplanar decal" shape) — reported as DATA,
    // not asserted, since coplanarity in world-space needs the screenshot to actually confirm popping.
    const suspect = records.filter((r) => {
      if (r.cls === "additive-fx" && r.depthWrite) return true;
      if (r.cls === "normal-alpha-solid" && r.depthWrite) return true;
      return false;
    }).map((r) => ({ uuid: r.uuid, type: r.type, cls: r.cls, depthWrite: r.depthWrite, depthTest: r.depthTest, blending: r.blending, opacity: r.opacity, ownerSample: r.owners.slice(0, 3) }));
    const byClass = {};
    records.forEach((r) => { byClass[r.cls] = (byClass[r.cls] || 0) + 1; });
    return {
      ok: true, yaw: yawLabel, totalUniqueMaterials: records.length, byClass,
      records: records.map((r) => ({ ...r, ownerCount: r.owners.length, ownerSample: r.owners.slice(0, 5) })),
      suspect,
    };
  }, yawLabel);
}

async function shoot(page, outPath) {
  const canvas = await page.$(".theater-stage-canvas canvas");
  const box = canvas && await canvas.boundingBox();
  if (!box) throw new Error("theater canvas has no page bounding box");
  await page.screenshot({ path: outPath, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: box.height } });
}
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

const YAWS = [
  { step: 0, label: "yaw-0", file: "yaw-0.png" },
  { step: 1, label: "yaw-90", file: "yaw-90.png" },
  { step: 2, label: "yaw-180", file: "yaw-180.png" },
  { step: 3, label: "yaw-270", file: "yaw-270.png" },
];

async function main() {
  const report = {
    generatedAt: new Date().toISOString(), unit: "P3-1b",
    fixture: "row-101 Grand Octagon hub + 2 neighbor chambers, 2x Skeleton standee, lightProfile=lamplit, kernel=oss",
    yaws: [],
  };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 90000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    report.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const theaterState = await waitForTheater(page);
    report.theaterState = theaterState;
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("Theater not ready: " + JSON.stringify(theaterState));

    const kernel = await mountOssKernel(page);
    report.kernel = kernel;
    if (!kernel.ok) throw new Error("oss kernel mount FAILED: " + kernel.error);
    log(`kernel mounted: ${kernel.kernel}`);

    const built = await buildScene(page);
    report.built = { ok: built.ok, error: built.error, roomShape: built.roomShape, roomCellCount: built.roomCellCount, edgeCell: built.edgeCell, edgeCell2: built.edgeCell2 };
    if (!built.ok) throw new Error("scene build FAILED: " + built.error);
    log(`scene built: shape=${built.roomShape} cells=${built.roomCellCount} edgeCell=${JSON.stringify(built.edgeCell)} edgeCell2=${JSON.stringify(built.edgeCell2)}`);

    // real GS.combat player/primaryThreat pair, positioned at the SAME edge cells as the pc/threat
    // standees just added to board.pieces — required to exercise theater-boot.js's C4.1b wall-upper
    // camera-side occlusion fade at all (see theater-boot.js:9106-9107's own comment: "absent a
    // ShotPlan entirely ... subjects stays empty and every upper segment simply reads full/opaque").
    // shotCompose is left at its PRODUCT DEFAULT (true, never overridden) for the same reason
    // dev/battle-gate/capture-wall-occlusion.mjs leaves it alone — a real S.lastShotPlan is what the
    // occlusion pass reads its subjects from.
    await page.evaluate((edgeCell, edgeCell2) => {
      window.GS = window.GS || {};
      window.GS.combat = {
        grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] },
        pc: { x: edgeCell.x, z: edgeCell.y, down: false, obliterated: false },
        allies: [],
        foes: [{ fid: "depth-audit-threat", x: edgeCell2.x, z: edgeCell2.y, down: false, fled: false, obliterated: false, cr: 5, hp: 50, maxHp: 50, name: "Threat" }],
      };
    }, built.edgeCell, built.edgeCell2);

    const mounted = await page.evaluate((board) => {
      try { window.Theater.setInteriorBoard(board); return { ok: true }; }
      catch (e) { return { ok: false, error: e.message }; }
    }, built.board);
    report.mounted = mounted;
    if (!mounted.ok) throw new Error("setInteriorBoard FAILED: " + mounted.error);

    report.resolvedState = await pollPiecesResolved(page);
    await sleep(300);

    for (const yaw of YAWS) {
      if (yaw.step > 0) {
        // advance one rotationStep per iteration (rotate() itself wraps mod 4; called cumulatively so
        // step N here means N calls total since mount) — then force the SAME board to rebuild at the
        // new rotationStep (rotate() alone only calls placeCamera(), never re-runs setInteriorBoard;
        // setInteriorVariant({}) is the existing mechanism, per capture-wall-occlusion.mjs's own
        // documented two-yaw sequence, extended here to four).
        await page.evaluate(() => { window.Theater.rotate(); });
        await page.evaluate(() => { window.Theater.setInteriorVariant({}); });
        await sleep(200);
      }
      await waitForRepaint(page);
      await sleep(150);
      await page.evaluate(() => { if (window.Theater._renderFrameForTest) window.Theater._renderFrameForTest(); });
      await waitForRepaint(page);

      const shotPath = path.join(OUT_DIR, yaw.file);
      await shoot(page, shotPath);
      log(`captured ${yaw.file}`);

      const depthState = await dumpDepthState(page, yaw.label);
      report.yaws.push({ label: yaw.label, file: yaw.file, depthState });
      log(`  ${yaw.label}: totalUniqueMaterials=${depthState.totalUniqueMaterials} byClass=${JSON.stringify(depthState.byClass)} suspect=${depthState.suspect ? depthState.suspect.length : "n/a"}`);
    }

    report.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    report.consoleErrorsCount = report.consoleErrors.length;
    report.noRuntimeBehaviorChangeNote = "This harness calls ONLY production mount/rotate/setInteriorVariant calls plus the existing TEST-ONLY read seams _graphicsResearchContextForTest/_renderFrameForTest/_roomShellPolygonKernel (already on master). Materials are read and classified; none is ever mutated. No src/ or data/ file is touched.";

    fs.writeFileSync(path.join(OUT_DIR, "depth-state.json"), JSON.stringify(report, null, 2));
    log(`wrote depth-state.json (${report.yaws.length} yaws captured)`);
  } catch (e) {
    report.error = e.message;
    fs.writeFileSync(path.join(OUT_DIR, "depth-state.json"), JSON.stringify(report, null, 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
