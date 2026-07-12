#!/usr/bin/env node
/* dev/verify-active-room-only.mjs — STAGE-A A1 (docs/STAGE-A.md, docs/GRAPHICS-NORTH-STAR.md §4.3):
   "the ACTIVE ROOM ALONE owns render geometry" — asserted against a real Chrome + THREE render (this
   claim is about the LIVE mounted scene, not just interiorBuildBoard's own data shape — the sibling
   pure-data checks already live in dev/verify-dungeon-interior.mjs). Boots the same real in-session/
   interior-board path dev/verify-interior-camera-frustum.mjs uses (server/Chrome/boot conventions
   copied verbatim — see that file's own header for the "why").

   RED-FIRST (per docs/STAGE-A.md's own instruction): before trusting the GREEN state, this script
   first proves the multi-room render is real by flipping `window.ITR_ACTIVE_ROOM_ONLY = false` (the
   documented reversibility escape hatch, src/ui/theater-interior.js) and mounting a chain-topology
   plan with focusSegNum+radius:1 — the pre-A1 default. A middle room's own two neighbors (1 hop away)
   get real floor/wall InstancedMesh instances under this state; asserted directly off the LIVE mounted
   scene via the new STAGE-A A1 test seams (window.Theater._interiorFloorListForTest() /
   _interiorWallListForTest(), which return the exact per-instance list the live floorMesh/wallMesh in
   S.interiorGroup were built from — same convention _interiorPillarListForTest/_interiorWallListForTest
   already established for S-1's occlusion-fade checks).

   GREEN: `window.ITR_ACTIVE_ROOM_ONLY = true` (the default — this run also proves the SAME board
   inputs collapse to zero neighbor geometry without ever touching `opts`): rebuilding the identical
   (plan, focusSegNum, radius:1) request now keeps ONLY the focus room — neighbor floor/wall instance
   count is exactly 0, the focus room's own floor/wall/doorframe still render fully, and each of its
   boundary doors emits exactly one DARKNESS PORTAL card (window.Theater._interiorPortalListForTest()).

   FLAG REVERSIBILITY: flipping back to `false` and rebuilding the SAME request brings the neighbor
   meshes back — proves the flag is a real, live, two-way toggle, not a one-shot fixed migration.

   Regression (run separately, not re-implemented here — see this repo's own commands):
     node dev/verify-dungeon-interior.mjs        (287/0 expected)
     node dev/verify-interior-camera-frustum.mjs (14/0 expected)
     python3 build/check-manifest.py             (RESULT: OK expected)

   Run:  node dev/verify-active-room-only.mjs */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import net from "node:net";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5231, 5232, 5233, 5234, 5235];
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
async function settleCameraTween(page) {
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
}
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
}

// same bootToInSession as verify-interior-camera-frustum.mjs / capture-two-flag-card.mjs (verbatim).
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
      if (nameEl) nameEl.value = "One Room Soul";
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

// builds a 4-room chain (s1-s2-s3-s4) plan client-side, returns the plan + the focus room's own
// segNum (s2 — the middle room with exactly 2 boundary doors, one to each neighbor) + s2's two
// 1-hop neighbor room rects + the 2-hop-away room's rect, so the harness can attribute live mesh
// instances back to "focus" vs "neighbor" vs "far" without any Node<->page data round-trip games.
async function buildFixture(page) {
  return await page.evaluate(() => {
    function buildChainFixture(n) {
      const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
      return ids.map((id, i) => ({
        id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
        exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < n - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
        light: "normal",
      }));
    }
    const fixture = buildChainFixture(4);
    const plan = spatializePlan(fixture, "The Spine", { walkId: "a1-verify-chain" });
    const focusRoom = plan.rooms.find((r) => r.segNum === 2);
    const neighborA = plan.rooms.find((r) => r.segNum === 1);
    const neighborB = plan.rooms.find((r) => r.segNum === 3);
    const farRoom = plan.rooms.find((r) => r.segNum === 4);
    return {
      ok: true,
      focusSegNum: focusRoom.segNum,
      focusRect: { minX: focusRoom.x, maxX: focusRoom.x + focusRoom.w - 1, minZ: focusRoom.y, maxZ: focusRoom.y + focusRoom.d - 1 },
      neighborRects: [neighborA, neighborB].map((r) => ({ minX: r.x - 1, maxX: r.x + r.w, minZ: r.y - 1, maxZ: r.y + r.d })), // dilated by 1 to catch the room's own wall RING too
      farRect: { minX: farRoom.x - 1, maxX: farRoom.x + farRoom.w, minZ: farRoom.y - 1, maxZ: farRoom.y + farRoom.d },
    };
  });
}

function countInRects(list, rects) {
  return (list || []).filter((inst) => rects.some((r) => inst.x >= r.minX && inst.x <= r.maxX && inst.z >= r.minZ && inst.z <= r.maxZ)).length;
}

async function mountFor(page, focusSegNum, flagOn) {
  return await page.evaluate((args) => {
    try {
      window.ITR_ACTIVE_ROOM_ONLY = args.flagOn;
      function buildChainFixture(n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        return ids.map((id, i) => ({
          id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
          exits: [i > 0 ? { targetId: ids[i - 1] } : null, i < n - 1 ? { targetId: ids[i + 1] } : null].filter(Boolean),
          light: "normal",
        }));
      }
      const fixture = buildChainFixture(4);
      const plan = spatializePlan(fixture, "The Spine", { walkId: "a1-verify-chain" });
      const board = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: args.focusSegNum, radius: 1 });
      board.lightProfile = "torchlit";
      board._verifyNonce = Math.random() + ":" + Date.now(); // force a real rebuild every call — never skip on the dirty-key
      window.Theater.setInteriorBoard(board);
      return { ok: true, meta: board.meta, portalCount: (board.portals || []).length };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { focusSegNum, flagOn });
}

async function liveCounts(page) {
  return await page.evaluate(() => ({
    floor: window.Theater._interiorFloorListForTest(),
    wall: window.Theater._interiorWallListForTest(),
    door: window.Theater._interiorDoorListForTest(),
    portal: window.Theater._interiorPortalListForTest(),
  }));
}

async function shoot(page, outPath) {
  const canvasEl = await page.$(".theater-stage-canvas canvas");
  if (canvasEl) await canvasEl.screenshot({ path: outPath }); else await page.screenshot({ path: outPath });
}

// a WIDE establishing shot (zoomed out from the tight per-room auto-fit) so a human reviewer can see
// the doorway/aperture itself, not just the room interior the default fit crops to — diagnostic only,
// no assertions ride on this capture (dir<0 = zoom OUT, window.Theater.zoom's own doc comment).
async function shootWide(page, outPath, steps) {
  for (let i = 0; i < (steps || 6); i++) await page.evaluate(() => window.Theater.zoom(-1));
  await settleCameraTween(page);
  await sleep(200);
  await shoot(page, outPath);
  for (let i = 0; i < (steps || 6); i++) await page.evaluate(() => window.Theater.zoom(1));
  await settleCameraTween(page);
}

async function main() {
  console.log("[verify-active-room-only] docs/STAGE-A.md A1 — ONE-ROOM-LITERAL");
  const outDir = path.join(__dirname, "active-room-only-shots");
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

    const fx = await buildFixture(page);
    if (!fx.ok) throw new Error("fixture build failed");
    console.log(`  fixture: 4-room chain, focus segNum=${fx.focusSegNum}, focusRect=${JSON.stringify(fx.focusRect)}`);

    console.log("\n[RED-FIRST — window.ITR_ACTIVE_ROOM_ONLY=false: the pre-A1 multi-room render is real]");
    let m = await mountFor(page, fx.focusSegNum, false);
    if (!m.ok) throw new Error("RED mount failed: " + m.error);
    await settleCameraTween(page);
    await sleep(300);
    let counts = await liveCounts(page);
    const redNeighborFloor = countInRects(counts.floor, fx.neighborRects);
    const redNeighborWall = countInRects(counts.wall, fx.neighborRects);
    ok(redNeighborFloor > 0, `RED: neighbor-room FLOOR mesh instances > 0 under radius:1 multi-room render (got ${redNeighborFloor})`);
    ok(redNeighborWall > 0, `RED: neighbor-room WALL mesh instances > 0 under radius:1 multi-room render (got ${redNeighborWall})`);
    ok(m.meta.roomCount === 3, `RED: board.meta.roomCount === 3 (focus + 2 neighbors, radius:1) — got ${m.meta.roomCount}`);
    ok((m.portalCount || 0) === 0, `RED: zero portal cards emitted when the flag is off (pre-A1 has no portal concept) — got ${m.portalCount}`);
    await shoot(page, path.join(outDir, "before-multi-room.png"));
    await shootWide(page, path.join(outDir, "before-multi-room-wide.png"));
    console.log(`  before (multi-room) capture: ${path.join(outDir, "before-multi-room.png")} (+ -wide.png)`);

    console.log("\n[GREEN — window.ITR_ACTIVE_ROOM_ONLY=true (default): the active room ALONE owns render geometry]");
    m = await mountFor(page, fx.focusSegNum, true);
    if (!m.ok) throw new Error("GREEN mount failed: " + m.error);
    await settleCameraTween(page);
    await sleep(300);
    counts = await liveCounts(page);
    const greenNeighborFloor = countInRects(counts.floor, fx.neighborRects);
    const greenNeighborWall = countInRects(counts.wall, fx.neighborRects);
    const greenFarFloor = countInRects(counts.floor, [fx.farRect]);
    const greenFocusFloor = countInRects(counts.floor, [fx.focusRect]);
    ok(greenNeighborFloor === 0, `GREEN: neighbor-room FLOOR mesh instances === 0 (got ${greenNeighborFloor})`);
    ok(greenNeighborWall === 0, `GREEN: neighbor-room WALL mesh instances === 0 (got ${greenNeighborWall})`);
    ok(greenFarFloor === 0, `GREEN: the 2-hop-away room's FLOOR mesh instances === 0 (never rendered even under the OLD radius:1 request) — got ${greenFarFloor}`);
    ok(greenFocusFloor > 0, `GREEN: the ACTIVE room's own FLOOR mesh instances still fully render (got ${greenFocusFloor})`);
    ok(m.meta.roomCount === 1, `GREEN: board.meta.roomCount === 1 (active room alone) — got ${m.meta.roomCount}`);
    ok(counts.door.length >= 2, `GREEN: the active room's own 2 boundary doorframes still render (got ${counts.door.length} door instances)`);
    ok(counts.portal.length === 2, `GREEN: exactly 2 DARKNESS PORTAL cards — one per boundary door (to segNum 1, to segNum 3) — got ${counts.portal.length}`);
    ok(m.portalCount === counts.portal.length, `GREEN: board.meta.portalCount (${m.portalCount}) matches the live mounted portal list length (${counts.portal.length})`);
    counts.portal.forEach((p, i) => {
      ok(typeof p.color === "string" && /^#[0-9a-fA-F]{6}$/.test(p.color), `GREEN portal[${i}]: carries a real hex color (got ${p.color})`);
      ok(p.sy > 0 && (p.sx > 0 || p.sz > 0), `GREEN portal[${i}]: nonzero footprint/height (a real recessed card, not a degenerate zero-size prism)`);
    });
    await shoot(page, path.join(outDir, "after-one-room.png"));
    await shootWide(page, path.join(outDir, "after-one-room-wide.png"));
    console.log(`  after (one-room) capture: ${path.join(outDir, "after-one-room.png")} (+ -wide.png)`);

    console.log("\n[FLAG REVERSIBILITY — flipping back to false brings the multi-room render back]");
    m = await mountFor(page, fx.focusSegNum, false);
    if (!m.ok) throw new Error("reversibility mount failed: " + m.error);
    await settleCameraTween(page);
    await sleep(300);
    counts = await liveCounts(page);
    const revertNeighborFloor = countInRects(counts.floor, fx.neighborRects);
    const revertNeighborWall = countInRects(counts.wall, fx.neighborRects);
    ok(revertNeighborFloor > 0, `REVERT: neighbor-room FLOOR mesh instances reappear (got ${revertNeighborFloor})`);
    ok(revertNeighborWall > 0, `REVERT: neighbor-room WALL mesh instances reappear (got ${revertNeighborWall})`);
    ok((m.portalCount || 0) === 0, `REVERT: zero portal cards again once the flag is off (got ${m.portalCount})`);

    // leave the page in the DEFAULT (on) state, tidy even though the page is about to close.
    await page.evaluate(() => { window.ITR_ACTIVE_ROOM_ONLY = true; });

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
