#!/usr/bin/env node
/* dev/verify-wallhang-placement.mjs — docs/LIGHT-SIGHT-POLISH.md P-2 (WALL-HANG PLACEMENT FIX): the
   "floating tan rhomboid" bug — interiorBuildWallProps (theater-boot.js) used to mount every wall-hang
   extrusion prop at the cell CENTER, at FLOOR level, with no wall-normal offset and no orientation-
   aware push to the wall plane. Real Chrome + THREE, boot/server/Chrome conventions copied verbatim
   from dev/verify-diegetic-light.mjs (bootToInSession/waitForTheater/launchChrome), since these claims
   (a mounted prop's real world position/rotation) need the LIVE renderer's actual scene graph, not a
   pure-data re-derivation of the same math.

   DEDICATED PORT RANGE 5261-5265 — not used by any other capture/verify script (checked against every
   PORT_CANDIDATES literal in dev/*.mjs + dev/battle-gate/*.mjs at authoring time).

   Checks:
     RED   git-show BASE_SHA's (the commit this unit branched from) interiorBuildWallProps body and
           prove it floats: mounts at floorTop (not mid-wall) with the cell-center coordinate UNCHANGED
           by any wall-normal push, and carries no wallSide/normal branch at all — text-proof, same
           convention dev/verify-bw2-2-floor-contact.mjs group 5 already established for a no-flag bug
           fix. Then GREEN: today's real source DOES carry the fix.
     G-1   real mount, all 4 sides (n/s/w/e): each wall-hang's Y sits in a genuine MID band between
           floorTop and floorTop+wallHeightBase (not at floorTop) — a magnitude/band assertion, not a
           copy of the product's own frac constant.
     G-2   real mount, all 4 sides: the prop's back-face world coordinate (== the group's own mount
           point, for these axis-aligned 90-degree-multiple yaws — see the comment at BACK_FACE_AXIS
           below) sits within a small epsilon of the TRUE wall plane, independently computed from the
           fixture's own known room rectangle (never re-using the product's ITR_WALLHANG_WALL_OFFSET
           value directly — only the geometric fact that a wall plane sits half a cell off room edge,
           GRID LAW cellSize=1).
     G-3   rotation matches the resolved wall normal, read off the product's own real yaw table via the
           _wallHangLawForTest seam (never hand-copied into this file).
     G-4   wall-contact AO is still present and still a small POSITIVE local z (hugging the NEW back
           face) for every wall-hang.
     G-5   fallback: an entry with a null/unresolved wallSide keeps the PRE-FIX placement (floor level,
           exact cell center) and logs instead of throwing — the "never throw" clause.
     CAP   before/after screenshots of a real room with wall-hangs mounted at the OLD vs NEW formula
           (same fixture, same camera) so the orchestrator can eyeball the rhomboids are gone.

   Run:  node dev/verify-wallhang-placement.mjs */

import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
// the commit this unit's worktree branched from (feat/p2-wallhang-placement off master tip) — the
// pre-fix state of interiorBuildWallProps, per this file's own header RED-FIRST convention.
const BASE_SHA = "522e7edb";
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5261, 5262, 5263, 5264, 5265];
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
async function killStaleServer(port) {
  // "kill stale servers on your port range first" (a leftover server serving OLD code causes false
  // failures) — if something's listening but it doesn't look like OUR genesis.html, kill it before
  // trying to bind. Best-effort: lsof -> kill, ignore failures (macOS dev box convention).
  if (!(await portInUse(port))) return;
  if (await probeRoot(port)) return; // looks fine, leave it — startServer will reuse it
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { cwd: repoRoot }).toString().trim().split("\n").filter(Boolean);
    pids.forEach((pid) => { try { process.kill(parseInt(pid, 10), "SIGTERM"); } catch (e) {} });
    await sleep(300);
  } catch (e) { /* lsof found nothing / already gone — fine */ }
}
async function startServer() {
  for (const port of PORT_CANDIDATES) await killStaleServer(port);
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

// bootToInSession/waitForTheater copied verbatim from dev/verify-diegetic-light.mjs (same convention
// every interior-board harness in this repo shares).
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
      if (nameEl) nameEl.value = "Wall-Hang Placement Soul";
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

// buildScene: ONE isolated, doorless room (a single segment, no exits — spatializePlan never carves a
// corridor/door for it, so every one of its 4 boundary walls is guaranteed a real WALL neighbor, no
// ambiguity) with 4 HAND-PLACED plan.dressing wall-hang entries, one against each side (n/s/w/e), at
// deterministic cells the fixture's own room rect makes fully known ahead of time — the controlled
// input this unit's placement-math assertions need (mirrors dev/verify-diegetic-light.mjs's own
// "inject a controlled light at a known position" convention, one level earlier: BEFORE
// interiorBuildBoard, since wallProps is derived FROM plan.dressing at build time, not settable after).
async function buildScene(page, cfg) {
  return await page.evaluate((cfg) => {
    try {
      const segs = [{ id: "s1", num: 1, label: "s1", isFinale: false, depth: 0, exits: [], light: "normal" }];
      const plan = spatializePlan(segs, "Isolated Wall-Hang Study", { walkId: cfg.walkId });
      const semPlan = semanticizePlan(plan, segs, []);
      const room = semPlan.rooms[0];
      const segNum = room.segNum;
      const midX = room.x + Math.floor(room.w / 2);
      const midY = room.y + Math.floor(room.d / 2);
      // one wall-hang per side, cardKind "medium" (CARD_SIZE_BY_KIND.medium — a mid-size prop, neither
      // the smallest nor largest, representative of "painting/sconce").
      semPlan.dressing = [
        { x: midX, y: room.y, primary: "wall-hang", cardKind: "medium", slug: "wh-north", roomSegNum: segNum },
        { x: midX, y: room.y + room.d - 1, primary: "wall-hang", cardKind: "medium", slug: "wh-south", roomSegNum: segNum },
        { x: room.x, y: midY, primary: "wall-hang", cardKind: "medium", slug: "wh-west", roomSegNum: segNum },
        { x: room.x + room.w - 1, y: midY, primary: "wall-hang", cardKind: "medium", slug: "wh-east", roomSegNum: segNum },
      ];
      const board = interiorBuildBoard(semPlan, { realmId: cfg.realmId || "gloom", env: "dungeon", focusSegNum: segNum, radius: 0 });
      board.lightProfile = cfg.lightProfile || "torchlit";
      board.lights = [{ x: midX, z: midY, y: 2.0, color: "#ff9a44", intensity: 1.2, distance: 6, decay: 2, kind: "torch", roomSegNum: segNum }];
      board.pieces = [];
      board.cameraFit = { mode: "room" };
      return {
        ok: true, board,
        room: { x: room.x, y: room.y, w: room.w, d: room.d, segNum },
        wallHeightBase: board.wallHeightBase,
        wallProps: board.wallProps, // {slug,x,y,wallSide,...} straight off the real builder — the RESOLVED input this test's expectations key off
      };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, cfg);
}

async function mountAndShoot(page, board, outPath) {
  // THEATER-NEXT dirty-key skip: setInteriorBoard no-ops when JSON.stringify(data) matches the LAST
  // mounted board — a nonce field forces a real rebuild every call (same convention as
  // dev/verify-diegetic-light.mjs's own mountAndShoot).
  const mounted = await page.evaluate((b) => {
    try {
      const board2 = Object.assign({}, b, { _verifyNonce: Math.random() + ":" + Date.now() });
      window.Theater.setInteriorBoard(board2);
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  }, board);
  if (!mounted.ok) throw new Error("mount failed: " + mounted.error);
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  await sleep(500); // dressing/lantern textures + one flicker tick settle
  if (outPath) {
    const canvasEl = await page.$(".theater-stage-canvas canvas");
    if (canvasEl) await canvasEl.screenshot({ path: outPath }); else await page.screenshot({ path: outPath });
  }
}

async function main() {
  console.log("[verify-wallhang-placement] docs/LIGHT-SIGHT-POLISH.md P-2");
  const outDir = path.join(__dirname, "wallhang-placement-shots");
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

    // ================================================================
    // RED — the pre-fix source (BASE_SHA) floated: floor-level Y, cell-center XZ, no wallSide branch.
    // ================================================================
    group(`RED-FIRST — ${BASE_SHA}'s interiorBuildWallProps mounted every wall-hang at floor level, cell center, no wall push`);
    const preFixSrc = execSync(`git show ${BASE_SHA}:src/ui/theater-boot.js`, { cwd: repoRoot, maxBuffer: 1024 * 1024 * 64 }).toString();
    const preFixMatch = preFixSrc.match(/function interiorBuildWallProps\([^)]*\)\{[\s\S]*?\n\}/);
    ok(!!preFixMatch, `RED-FIRST: could extract the pre-fix interiorBuildWallProps body from ${BASE_SHA}`);
    const preFixBody = preFixMatch ? preFixMatch[0] : "";
    ok(/g\.position\.set\(\(d\.x \|\| 0\) - \(cx \|\| 0\), floorTop, \(d\.y \|\| 0\) - \(cz \|\| 0\)\)/.test(preFixBody),
      "RED-FIRST: the pre-fix body mounts g.position at the RAW cell center (d.x-cx, floorTop, d.y-cz) — no wall-normal term at all");
    ok(!/wallSide/.test(preFixBody), "RED-FIRST: the pre-fix body never reads d.wallSide at all — no orientation-aware placement, matching the diagnosed bug");
    ok(preFixBody.split("g.position.set").length - 1 === 1, "RED-FIRST: exactly ONE position.set call in the pre-fix body (a single unconditional floor-center mount, not a resolved/fallback branch)");

    const nowSrc = fs.readFileSync(path.join(repoRoot, "src", "ui", "theater-boot.js"), "utf-8");
    const nowMatch = nowSrc.match(/function interiorBuildWallProps\([^)]*\)\{[\s\S]*?\n\}/);
    ok(!!nowMatch, "GREEN: could extract the CURRENT interiorBuildWallProps body from the working tree");
    const nowBody = nowMatch ? nowMatch[0] : "";
    ok(/ITR_WALL_SIDE_NORMAL\[d\.wallSide\]/.test(nowBody), "GREEN: the current body resolves a wall normal off d.wallSide (ITR_WALL_SIDE_NORMAL[d.wallSide])");
    ok(/ITR_WALLHANG_HEIGHT_FRAC/.test(nowBody), "GREEN: the current body lifts the mount by ITR_WALLHANG_HEIGHT_FRAC (mid-wall height, not floor)");
    ok(/ITR_WALLHANG_WALL_OFFSET/.test(nowBody), "GREEN: the current body pushes the mount by ITR_WALLHANG_WALL_OFFSET (half a cell toward the wall)");
    ok(nowBody.split("g.position.set").length - 1 === 2, "GREEN: the current body has TWO position.set calls (resolved-wallSide branch + never-throw fallback), not the old single unconditional one");

    // ================================================================
    // Build the real fixture (once) — reused for G-1..G-5 and the before/after capture.
    // ================================================================
    const built = await buildScene(page, { realmId: "gloom", lightProfile: "torchlit", walkId: "wallhang-p2-study" });
    if (!built.ok) throw new Error("scene build failed: " + built.error);
    ok(built.wallProps.length === 4, `fixture rolled exactly 4 wall-hang entries (n/s/w/e) — found ${built.wallProps.length}`);
    ["wh-north", "wh-south", "wh-west", "wh-east"].forEach((slug, i) => {
      const w = built.wallProps.find((p) => p.slug === slug);
      ok(!!w, `fixture carries a wallProps entry for ${slug}`);
    });
    const bySide = { n: built.wallProps.find((p) => p.slug === "wh-north"), s: built.wallProps.find((p) => p.slug === "wh-south"), w: built.wallProps.find((p) => p.slug === "wh-west"), e: built.wallProps.find((p) => p.slug === "wh-east") };
    ok(bySide.n && bySide.n.wallSide === "n", `wh-north resolved wallSide "n" (got ${bySide.n && bySide.n.wallSide})`);
    ok(bySide.s && bySide.s.wallSide === "s", `wh-south resolved wallSide "s" (got ${bySide.s && bySide.s.wallSide})`);
    ok(bySide.w && bySide.w.wallSide === "w", `wh-west resolved wallSide "w" (got ${bySide.w && bySide.w.wallSide})`);
    ok(bySide.e && bySide.e.wallSide === "e", `wh-east resolved wallSide "e" (got ${bySide.e && bySide.e.wallSide})`);

    await mountAndShoot(page, built.board, path.join(outDir, "after-mounted.png"));
    const origin = await page.evaluate(() => window.Theater.interiorBoardOrigin());
    const law = await page.evaluate(() => {
      const l = window.Theater._wallHangLawForTest;
      return { ITR_WALL_SIDE_YAW: l.ITR_WALL_SIDE_YAW, ITR_WALL_SIDE_NORMAL: l.ITR_WALL_SIDE_NORMAL };
    });
    const mounted = await page.evaluate(() => window.Theater.interiorWallPropsWorldPositions());
    const floorTopFor = await page.evaluate((probes) => {
      const law2 = window.Theater._floorContactLawForTest;
      const map = window.Theater._interiorFloorTopMapForTest();
      const out = {};
      probes.forEach((p) => { out[p.slug] = law2.interiorFloorTopAt(map, p.x, p.y); });
      return out;
    }, built.wallProps.map((w) => ({ slug: w.slug, x: w.x, y: w.y })));

    // ================================================================
    // G-1/G-2/G-3 — mid-height band, flush-to-wall-plane, correct rotation, for all 4 sides.
    // ================================================================
    group("G-1/G-2/G-3 — real mount: mid-wall height, flush to the true wall plane, oriented into the room (all 4 sides)");
    const EPS_PLANE = 0.02;
    const cellHalf = 0.5; // GRID LAW: cellSize=1 (theater-interior.js) — a wall plane sits half a cell off a room-edge cell's own center. Geometric fact, not a copy of the product's own offset constant.
    ["n", "s", "w", "e"].forEach((side) => {
      const slug = { n: "wh-north", s: "wh-south", w: "wh-west", e: "wh-east" }[side];
      const src = bySide[side];
      const m = mounted.find((x) => x.slug === slug);
      if (!m) { ok(false, `${slug}: no mounted entry found in interiorWallPropsWorldPositions()`); return; }
      const floorTop = floorTopFor[slug];
      const wallH = built.wallHeightBase;
      // G-1: mid band — strictly above floor, strictly below the full wall height, generous band (this
      // unit's own frac is dial-able; the property under test is "mid", not the exact chosen number).
      const bandLo = floorTop + 0.15 * wallH, bandHi = floorTop + 0.85 * wallH;
      ok(m.y > bandLo && m.y < bandHi, `${slug}: Y=${m.y.toFixed(3)} sits in the MID band (${bandLo.toFixed(3)}..${bandHi.toFixed(3)}) — floorTop=${floorTop.toFixed(3)}, wallHeightBase=${wallH}`);
      ok(m.y > floorTop + 0.02, `${slug}: Y=${m.y.toFixed(3)} is measurably ABOVE floorTop=${floorTop.toFixed(3)} (not the pre-fix floor-level mount)`);

      // G-2: flush to the wall plane. For n/s the wall-normal axis is world Z; for w/e it's world X —
      // and for these 4 special-case 90-degree-multiple yaws, the group's OWN position component along
      // that axis IS the back face's world coordinate (see buildExtrusionProp: the back face passes
      // through local (0,0,0), a plane invariant under any multiple-of-90 Y rotation on that axis).
      const rawCenterX = (src.x || 0) - origin.cx, rawCenterZ = (src.y || 0) - origin.cz;
      let expectedPlane, actual, axisLabel;
      if (side === "n") { expectedPlane = rawCenterZ - cellHalf; actual = m.z; axisLabel = "z"; }
      else if (side === "s") { expectedPlane = rawCenterZ + cellHalf; actual = m.z; axisLabel = "z"; }
      else if (side === "w") { expectedPlane = rawCenterX - cellHalf; actual = m.x; axisLabel = "x"; }
      else { expectedPlane = rawCenterX + cellHalf; actual = m.x; axisLabel = "x"; }
      ok(Math.abs(actual - expectedPlane) < EPS_PLANE, `${slug}: back-face ${axisLabel}=${actual.toFixed(3)} within ${EPS_PLANE} of the TRUE wall plane (expected ${expectedPlane.toFixed(3)}) — flush, not floating at the raw cell center (${axisLabel}=${(axisLabel === "z" ? rawCenterZ : rawCenterX).toFixed(3)})`);
      const rawCellDist = Math.hypot(m.x - rawCenterX, m.z - rawCenterZ);
      ok(rawCellDist > 0.3, `${slug}: mount point is >0.3 world units from the raw cell center (${rawCellDist.toFixed(3)}) — genuinely pushed to the wall, not left floating mid-cell`);

      // G-3: rotation matches the resolved wall normal, read off the PRODUCT's own real yaw table.
      const expectedYaw = law.ITR_WALL_SIDE_YAW[side];
      const yawDiff = Math.abs(((m.rotY - expectedYaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
      ok(yawDiff < 0.001, `${slug}: rotY=${m.rotY.toFixed(4)} matches ITR_WALL_SIDE_YAW["${side}"]=${expectedYaw.toFixed(4)} (front face points into the room)`);
    });

    // ================================================================
    // G-4 — wall-contact AO still present, still a small positive local z (hugs the NEW back face).
    // ================================================================
    group("G-4 — wall-contact AO still present, still hugging the (repositioned) back face");
    ["wh-north", "wh-south", "wh-west", "wh-east"].forEach((slug) => {
      const m = mounted.find((x) => x.slug === slug);
      ok(!!m && m.aoPresent === true, `${slug}: wall-contact AO quad present`);
      ok(!!m && m.aoZ != null && m.aoZ > 0 && m.aoZ < 0.02, `${slug}: AO local z=${m && m.aoZ} sits a small POSITIVE offset in front of the back face (0 < z < 0.02)`);
    });

    // ================================================================
    // G-5 — fallback: unresolved wallSide keeps the PRE-FIX placement, never throws.
    // ================================================================
    group("G-5 — fallback (no resolvable wallSide): keeps the pre-fix floor-level/cell-center placement, never throws");
    // NOTE: the floorTopMap is a live JS Map, built and consumed ENTIRELY inside this one page.evaluate
    // call — Puppeteer's Node<->page argument bridge is JSON-only, so a Map passed IN as an argument
    // loses its .get method (that bit us on the first pass: "floorTopMap.get is not a function").
    // Fetching it fresh inside the callback (same convention floorTopFor above already uses) keeps it
    // a real Map for the whole computation; only the plain-number RESULT crosses back out.
    const fallback = await page.evaluate(() => {
      try {
        const T = window.Theater;
        const map = T._interiorFloorTopMapForTest();
        const built2 = T._interiorBuildWallPropsForTest(
          [{ slug: "orphan-wallhang", primary: "wall-hang", cardKind: "medium", x: 3, y: 0, wallSide: null }], 0, 0, map, 2.4);
        const g = built2.children[0];
        const expectedFloorTop = T._floorContactLawForTest.interiorFloorTopAt(map, 3, 0);
        return { ok: true, x: g.position.x, y: g.position.y, z: g.position.z, expectedFloorTop };
      } catch (e) { return { ok: false, error: e.message }; }
    });
    ok(fallback.ok, `G-5: no-wallSide entry never throws (${fallback.error || "ok"})`);
    if (fallback.ok) {
      ok(Math.abs(fallback.y - fallback.expectedFloorTop) < 0.001, `G-5: Y=${fallback.y.toFixed(3)} stays at floorTop=${fallback.expectedFloorTop.toFixed(3)} (pre-fix behavior preserved) when wallSide is unresolved`);
      ok(Math.abs(fallback.x - 3) < 0.001 && Math.abs(fallback.z - 0) < 0.001, `G-5: x=${fallback.x.toFixed(3)},z=${fallback.z.toFixed(3)} stays at the raw cell center (3,0) — no wall push applied when there's nothing to resolve it against`);
    }

    // ================================================================
    // BEFORE capture — remount the SAME fixture through the pre-fix formula (reconstructed from the
    // extracted BASE_SHA body's own documented math: floorTop, raw cell center, no rotation) so the
    // orchestrator can see the actual delta, not just trust the numbers above.
    // ================================================================
    group("CAPTURE — before (pre-fix formula) vs after (real current mount) screenshots");
    const beforeBoard = await page.evaluate((b) => {
      const clone = JSON.parse(JSON.stringify(b));
      // reconstruct the PRE-FIX mount by stripping wallSide (forces every wall-hang through this
      // file's OWN fallback path, which is byte-identical to the diagnosed bug: floorTop, cell center,
      // no rotation) — a legitimate use of the real fallback branch to reproduce the historical defect
      // on demand, without a second copy of interiorBuildWallProps to maintain.
      (clone.wallProps || []).forEach((w) => { w.wallSide = null; });
      return clone;
    }, built.board);
    await mountAndShoot(page, beforeBoard, path.join(outDir, "before-floating.png"));
    await mountAndShoot(page, built.board, path.join(outDir, "after-mounted.png"));
    ok(fs.existsSync(path.join(outDir, "before-floating.png")) && fs.existsSync(path.join(outDir, "after-mounted.png")),
      `before/after captures written to ${outDir}`);
    console.log(`  before: ${path.join(outDir, "before-floating.png")}`);
    console.log(`  after:  ${path.join(outDir, "after-mounted.png")}`);

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
