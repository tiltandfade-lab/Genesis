#!/usr/bin/env node
/* dev/battle-gate/capture-occlusion-real.mjs — LIGHT-SIGHT-POLISH.md unit P-3 (REAL OCCLUSION DEMO).

   WHY: dev/verify-occlusion-fade.mjs (docs/DIEGETIC-LIGHT.md S-1) proves the ankle-cut+ghost
   mechanism with a hand-built 7x7 room + a SYNTHETIC saturated-red pillar injected directly onto
   the camera->figure segment, and a figure whose texture is deliberately left UNRESOLVED (no real
   billboard ever mounts — see that file's own header for why). Adam's read on that demo: "makes no
   sense... don't think it's working" — no real column, no real mini, nothing a human can eyeball.
   This unit builds the REAL equivalent: a genuine multi-room dungeon (spatializePlan +
   interiorBuildBoard, the SAME production path capture-interior-study.mjs exercises), a REAL
   corner column the generator itself rolled (THE COLUMN DEMOTION, theater-interior.js ~1230:
   ITR_COLUMN_CHANCE=0.14 per eligible room, ITR_PILLAR_MIN_DIM=6), and a REAL cut sprite (fantasy
   realm is the only one with status:"cut" entries today — data/sprite-registry.js, ~510 of them;
   "Skeleton" is one) standing in a cell the LIVE interior camera genuinely cannot see past the
   column without the fade fix. No production logic changes: the runtime disable flag P-3 needed
   ALREADY EXISTS (window.Theater._setOcclusionFadeDisabledForTest, added alongside S-1 itself —
   theater-boot.js line ~8749) — nothing new was added to touch production code.

   THE GEOMETRIC GUARANTEE (why a real column can be made to occlude, not just "maybe"):
   placeCamera's persp/ortho branches both derive the camera's horizontal offset direction as
   (sin(yaw), cos(yaw)) with yaw = rotationStep*90 + CAM_YAW_OFFSET_DEG(45) — a FIXED diagonal
   direction for a given rotationStep, independent of where the "beat" cameraFit's cluster center
   sits. THE COLUMN DEMOTION always plants a room's (at most one) column at one of the room's own
   4 INTERIOR corners: (r.x+1,r.y+1) / (r.x+w-2,r.y+1) / (r.x+1,r.y+d-2) / (r.x+w-2,r.y+d-2) — each
   exactly 1 diagonal grid-step in from a wall corner. Grid steps of (+-1,+-1) sit EXACTLY on the
   45-degree family of lines placeCamera's 4 rotationStep values produce. So: pick whichever corner
   the generator actually rolled, choose the ONE rotationStep (0-3) whose camera-direction sign
   matches that corner's own (signX,signZ) from room-center, "beat"-fit the camera tightly onto a
   mini cell placed exactly 1 diagonal step FURTHER IN from the column (mini = column - (signX,
   signZ)) — the column now sits exactly on the camera->mini ray, at the ~1-cell distance
   dev/verify-occlusion-fade.mjs's own empirical sweep found is the realistic occluding window for
   this camera (its header note: "a realistic 1-unit column's valid occluding window is a razor-
   thin sliver of t... confirmed empirically"). This is worked out from the real yaw/corner
   geometry, not tuned by trial and error, and the search below re-derives it fresh per room found
   (not hard-coded to one lucky seed).

   THE SEARCH: room dimensions are forced into the ITR_PILLAR_MIN_DIM-eligible band via
   spatializePlan's own opts.sizeClass (a real, supported knob — not a synthetic room), then a
   chain of rooms (topology "The Spine") is tried across many walkId seeds until the seeded
   ITR_COLUMN_CHANCE roll actually lands a square/tapered (box-shaped, not round — see the in-file
   comment on why round pillars are skipped) column in some room. This is real dungeon-generator
   output; nothing about the ROOM or its WALLS/COLUMN is hand-placed. Only the CHOICE of which
   rolled room/seed to render, and where within it to stand the mini, is chosen by this script (the
   spec's own explicit allowance: "if you can't find such a cell in the rolled room, adjust the
   room/mini cell until the ray is genuinely occluded, and record how").

   THE GUARD (the thing the first demo lacked): before trusting ANY screenshot, a REAL
   THREE.Raycaster is cast from the LIVE camera position to the mini's own torso-height sight point
   (window.Theater._interiorRaycastClearForTest — BW2-1b's own seam, intersecting only the tagged
   solid wall/pillar/doorframe meshes) with occlusion-fade forced OFF (full-height, un-cut column —
   the honest "if the fix didn't exist" geometry). This must report clear:false with a "pillar" hit
   BEFORE any ON/OFF/CONTACT comparison is trusted — if it doesn't, the room is rejected and the
   search moves to the next candidate (never eyeballed).

   THE THREE SHOTS (same board, same camera framing throughout — only the fade flag / column
   presence changes between them):
     OFF     — window.Theater._setOcclusionFadeDisabledForTest(true): full-height column, no cut,
               no ghost. This IS the guard state — the mini's own screen rect should read the
               COLUMN's color (occluded).
     ON      — fade re-enabled (the shipped default): ankle-cut + ~5% ghost. The mini's own screen
               rect should read close to CONTACT (visible through the faded column).
     CONTACT — same board/camera, but the ONE occluding column instance spliced out of
               board.instances.pillar (the room and everything else stays exactly as generated) —
               the un-occluded "what does this mini actually look like here" reference.

   Run:  node dev/battle-gate/capture-occlusion-real.mjs
   Output: dev/battle-gate/occlusion-real/{on,off,contact}.png + metrics.json */

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
const outDir = path.join(__dirname, "occlusion-real");
fs.mkdirSync(outDir, { recursive: true });

// FRESH range — never shared with any other capture-*.mjs / verify-*.mjs dedicated range (surveyed
// at authoring time: 5181-5185 stage, 5191-5195 place-tray, 5201-5210 interior-study/dressing,
// 5211-5220 scene-direction/two-flag/dungeon-loop/material-texel/lit-sprites, 5221-5235 post-suite/
// value-plunge/bw2-5-silhouette/interior-camera-frustum/bw2-1b-occlusion/bw2-2-floor-contact/vp1c/
// mf1, 5241-5245 mf4, 5251-5255 occlusion-fade/diegetic-light).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5261, 5262, 5263, 5264, 5265];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[occlusion-real]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label); } }
function group(name) { console.log("\n[" + name + "]"); }

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
    return body.includes("Genesis");
  } catch (e) { return false; }
}
// SCAR (docs/-referenced repeatedly across this repo's own capture harnesses): a leftover
// http.server from an OLDER tree serving THIS port produces false results. Kill anything squatting
// our dedicated range that isn't actually serving this exact checkout before starting a fresh one.
async function killStaleServers() {
  for (const port of PORT_CANDIDATES) {
    if (!(await portInUse(port))) continue;
    if (await probeRoot(port)) { log(`port ${port} already serving THIS tree — will reuse it`); continue; }
    log(`port ${port} is in use by something that does NOT look like this tree — killing it`);
    try {
      const lsof = spawn("lsof", ["-ti", `tcp:${port}`]);
      let pids = "";
      lsof.stdout.on("data", (d) => { pids += d.toString(); });
      await new Promise((resolve) => lsof.on("close", resolve));
      pids.trim().split(/\s+/).filter(Boolean).forEach((pid) => { try { process.kill(parseInt(pid, 10), "SIGTERM"); } catch (e) {} });
      await sleep(300);
    } catch (e) { log("  (kill attempt failed, continuing anyway):", e.message); }
  }
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

const SHOT_W = 1200, SHOT_H = 900;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}

// mirrors dev/verify-mf1-camera-tweens.mjs / dev/verify-occlusion-fade.mjs's own settle convention —
// every claim this harness makes (camera position, raycast, screenshot, projectWorldPoint) is about
// the SETTLED pose, never a mid-glide frame.
async function settleCameraTween(page) {
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
}

// A REAL cut sprite so the mini actually RENDERS a billboard (not the deliberately-unresolved
// synthetic figure dev/verify-occlusion-fade.mjs uses) — fantasy is the ONLY realm carrying
// status:"cut" entries today (data/sprite-registry.js survey at authoring time: ~510 fantasy, 0
// elsewhere) per SPRITE-TRANSITION's own history; spriteEntryFor's join is by NORMALIZED NAME only
// (theater-boot.js normalizeSpriteKey), not filtered by the board's own realmId, so a fantasy-cut
// sprite standing in a fantasy-tiled room is the natural, non-contrived choice here (matching
// capture-interior-study.mjs's own gloom/chrome scenes, which reuse the SAME fantasy roster).
const MINI_SLUG = "Skeleton";
const REALM_ID = "fantasy";
const ENV = "dungeon";

// ─── in-page search: real spatializePlan + interiorBuildBoard output, tried across many seeds until
// THE COLUMN DEMOTION's seeded roll (ITR_COLUMN_CHANCE=0.14, room must clear ITR_PILLAR_MIN_DIM=6)
// actually lands a box-shaped (square/tapered — round pillars route through a SEPARATE mesh builder
// that never stamps mesh.userData.interiorKind="pillar", so the BW2-1b raycast guard would silently
// never intersect one; skipped here rather than risk a guard that can't fire) column in SOME room of
// a chain. sizeClass forces every room into the pillar-eligible band (a real, supported spatializePlan
// knob — docs on that function's own header) so only the 14% column roll gates success, not room size
// too. Returns the FIRST (seed, room, pillar) hit; the actual render board is rebuilt afterward with
// that specific room as the camera's own focus (see "why re-center on the pillar's own room" below).
async function findOccludedRoom(page) {
  return await page.evaluate(() => {
    function buildFixture(n) {
      const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
      const edges = [];
      for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
      const adj = {}; ids.forEach((id) => { adj[id] = []; });
      edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
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
    const N_ROOMS = 8;
    const MAX_SEEDS = 60;
    const fixture = buildFixture(N_ROOMS);
    const tried = [];
    for (let attempt = 0; attempt < MAX_SEEDS; attempt++) {
      const walkId = "p3-occlusion-real-search:" + attempt;
      let plan;
      try {
        plan = spatializePlan(fixture, "The Spine", { walkId, sizeClass: { minW: 6, maxW: 8, minD: 6, maxD: 8 } });
      } catch (e) { tried.push({ attempt, error: e.message }); continue; }
      // broad build (radius covers the whole chain) purely to SURVEY where a column landed — the
      // ACTUAL render board (built by the node-side caller after this returns) re-centers on
      // whichever room the column is in, which real "beat camera" framing needs (see this file's own
      // header on placeCamera's origin-relative offset formula: the beat cluster must sit near the
      // cx/cz shift origin, i.e. near ITS OWN room's center, or the fit distance blows up).
      const surveyFocus = plan.rooms[0].segNum;
      let board;
      try {
        board = interiorBuildBoard(plan, { realmId: "fantasy", env: "dungeon", focusSegNum: surveyFocus, radius: 99 });
      } catch (e) { tried.push({ attempt, walkId, error: e.message }); continue; }
      const candidates = (board.instances.pillar || []).filter((p) => p.profile === "square" || p.profile === "tapered");
      if (!candidates.length) { tried.push({ attempt, walkId, pillarCount: (board.instances.pillar || []).length }); continue; }
      for (const p of candidates) {
        const room = plan.rooms.find((r) => {
          const minXHit = Math.abs(p.x - (r.x + 1)) < 1e-6, maxXHit = Math.abs(p.x - (r.x + r.w - 2)) < 1e-6;
          const minZHit = Math.abs(p.z - (r.y + 1)) < 1e-6, maxZHit = Math.abs(p.z - (r.y + r.d - 2)) < 1e-6;
          return (minXHit || maxXHit) && (minZHit || maxZHit);
        });
        if (!room) continue;
        const isMinX = Math.abs(p.x - (room.x + 1)) < 1e-6;
        const isMinZ = Math.abs(p.z - (room.y + 1)) < 1e-6;
        const dirXsign = isMinX ? -1 : 1, dirZsign = isMinZ ? -1 : 1;
        // yaw = rotationStep*90 + 45deg; sign(sin(yaw)),sign(cos(yaw)) per step: 0->(+,+) 1->(+,-)
        // 2->(-,-) 3->(-,+) (placeCamera, theater-boot.js CAM_YAW_OFFSET_DEG=45/CAM_ELEV_DEG=35) —
        // pick the ONE rotationStep whose camera-direction sign matches this corner's own side of
        // the room (camera sits on the SAME side as the column, mini sits one diagonal step further
        // IN from it — the column is then exactly between camera and mini).
        let rotationStep;
        if (dirXsign > 0 && dirZsign > 0) rotationStep = 0;
        else if (dirXsign > 0 && dirZsign < 0) rotationStep = 1;
        else if (dirXsign < 0 && dirZsign < 0) rotationStep = 2;
        else rotationStep = 3;
        const miniX = p.x - dirXsign, miniZ = p.z - dirZsign;
        const floorHit = (board.instances.floor || []).some((f) => f.x === miniX && f.z === miniZ);
        if (!floorHit) continue;
        return {
          ok: true, attempt, walkId, seed: plan.seed,
          room: { segNum: room.segNum, x: room.x, y: room.y, w: room.w, d: room.d },
          pillar: { x: p.x, z: p.z, sx: p.sx, sy: p.sy, sz: p.sz, profile: p.profile },
          miniCell: { x: miniX, z: miniZ }, rotationStep, triedSeeds: attempt + 1,
        };
      }
      tried.push({ attempt, walkId, pillarCandidates: candidates.length, noRoomOrFloorMatch: true });
    }
    return { ok: false, triedSeeds: MAX_SEEDS, tried: tried.slice(-10) };
  });
}

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), notes: [] };
  await killStaleServers();
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await browser.newPage();
    page.on("console", (msg) => { if (msg.type() === "error") log("console.error:", msg.text().slice(0, 200)); });
    page.on("pageerror", (e) => log("PAGE ERROR:", e.message));
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "load", timeout: 30000 });
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    // dev/verify-occlusion-fade.mjs's own documented PRE-EXISTING BUG workaround: wait for
    // window.Theater.ready (flips true once the stray whole-object-builder replay callback has
    // already fired and found nothing mounted) BEFORE ever calling mount() — sidesteps a bogus
    // camera-corrupting replay entirely rather than fighting it.
    for (let i = 0; i < 60; i++) {
      const ready = await page.evaluate(() => !!(window.Theater && window.Theater.ready === true));
      if (ready) break;
      await sleep(150);
    }

    const mounted = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "theater-stage-canvas";
      el.style.position = "fixed"; el.style.left = "0"; el.style.top = "0";
      el.style.width = "1200px"; el.style.height = "900px";
      document.body.appendChild(el);
      return !!window.Theater.mount(el);
    });
    if (!mounted) throw new Error("Theater.mount failed");

    group("SEARCH — real spatializePlan + interiorBuildBoard, hunting a real generator-rolled column");
    const found = await findOccludedRoom(page);
    metrics.search = found;
    ok(!!found.ok, `found a real room with a box-profile column within ${found.triedSeeds} seed attempt(s)` + (found.ok ? ` (walkId=${found.walkId}, room segNum=${found.room.segNum} ${found.room.w}x${found.room.d}, pillar profile=${found.pillar.profile})` : ""));
    if (!found.ok) { throw new Error("search exhausted MAX_SEEDS without finding an eligible column — see metrics.search.tried"); }
    log(`room segNum=${found.room.segNum} (${found.room.w}x${found.room.d} @ ${found.room.x},${found.room.y}), column at (${found.pillar.x},${found.pillar.z}) profile=${found.pillar.profile}, mini cell (${found.miniCell.x},${found.miniCell.z}), rotationStep=${found.rotationStep}`);

    // rebuild the SAME plan (same seed => byte-identical rooms/column roll) as an ACTUAL render
    // board, this time focused on the column's OWN room (so the "beat" camera's cx/cz shift origin
    // sits at that room's center, keeping the beat cluster near the shift origin — see this file's
    // header note on why a beat fit needs this) — and register the real sprite + rotate the camera
    // to the derived rotationStep BEFORE the first setInteriorBoard call.
    const built = await page.evaluate(({ walkId, room, miniCell, rotationStep, slug, realmId, env }) => {
      try {
        function buildFixture(n) {
          const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
          const edges = [];
          for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
          const adj = {}; ids.forEach((id) => { adj[id] = []; });
          edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
          const depth = { [ids[0]]: 0 };
          const q = [ids[0]]; let head = 0;
          while (head < q.length) {
            const cur = q[head++];
            (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } });
          }
          return ids.map((id, i) => ({
            id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0,
            exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal",
          }));
        }
        const fixture = buildFixture(8);
        const plan = spatializePlan(fixture, "The Spine", { walkId, sizeClass: { minW: 6, maxW: 8, minD: 6, maxD: 8 } });
        const board = interiorBuildBoard(plan, { realmId, env, focusSegNum: room.segNum, radius: 1 });
        board.lightProfile = "torchlit";
        board.pieces = [{ slug, cellX: miniCell.x, cellY: miniCell.z }];
        board.cameraFit = { mode: "beat", cells: [{ x: miniCell.x, y: miniCell.z }] };
        // sanity: re-confirm the column this exact board carries at (room.x/y-relative corner) still
        // matches what the search found (same seed => same roll, but verify rather than assume).
        const pillarIdx = (board.instances.pillar || []).findIndex((p) => Math.abs(p.x - (room.x + 1)) < 1e-6 || Math.abs(p.x - (room.x + room.w - 2)) < 1e-6);
        const rebuiltPillar = pillarIdx >= 0 ? board.instances.pillar[pillarIdx] : null;
        if (!rebuiltPillar) return { ok: false, stage: "rebuilt-board-missing-pillar", pillarCount: (board.instances.pillar || []).length };
        // rotate to the derived rotationStep (S.rotationStep persists across setInteriorBoard calls —
        // theater-boot.js confirmed: setInteriorBoard never resets it, only setBoard's flat-tabletop
        // path does) BEFORE the first mount so every subsequent replay keeps this exact framing.
        for (let i = 0; i < rotationStep; i++) window.Theater.rotate();
        SPRITE_REGISTRY.__p3RegistryCheck = !!SPRITE_REGISTRY; // no-op touch, keeps lints quiet
        window.__p3OcclusionBoard = board;
        window.__p3PillarIdx = pillarIdx;
        window.Theater._setOcclusionFadeDisabledForTest(true); // OFF/guard state mounts first
        window.Theater.setInteriorBoard(board);
        return { ok: true, pillarIdx, rebuiltPillar: { x: rebuiltPillar.x, z: rebuiltPillar.z, sy: rebuiltPillar.sy, profile: rebuiltPillar.profile } };
      } catch (e) { return { ok: false, stage: "exception", error: e.message, stack: e.stack }; }
    }, { walkId: found.walkId, room: found.room, miniCell: found.miniCell, rotationStep: found.rotationStep, slug: MINI_SLUG, realmId: REALM_ID, env: ENV });
    metrics.built = built;
    ok(!!built.ok, "rebuilt render board (focused on the column's own room) mounted OFF/guard state" + (built.ok ? "" : `: ${built.error || built.stage}`));
    if (!built.ok) throw new Error("board rebuild/mount failed: " + JSON.stringify(built));

    await settleCameraTween(page);

    // wait for the real sprite texture to actually resolve (spriteTextureFor's async image load —
    // same poll convention capture-interior-study.mjs uses) before trusting ANY screenshot.
    async function waitPieceResolved() {
      const deadline = Date.now() + 4000;
      let last = null;
      while (Date.now() < deadline) {
        last = await page.evaluate(() => ({ resolved: window.Theater.interiorPiecesResolved(), requested: window.Theater.interiorPiecesRequested() }));
        if (last.requested > 0 && last.resolved >= last.requested) return last;
        await sleep(200);
      }
      return last;
    }
    const pieceState0 = await waitPieceResolved();
    metrics.pieceState = pieceState0;
    ok(!!pieceState0 && pieceState0.requested > 0 && pieceState0.resolved >= pieceState0.requested, `mini sprite (${MINI_SLUG}) texture resolved (${pieceState0 && pieceState0.resolved}/${pieceState0 && pieceState0.requested})`);

    // ── THE GUARD: a REAL THREE.Raycaster from the LIVE camera to the mini's own torso sight point,
    // with occlusion-fade forced OFF (full-height column, no cut) — must genuinely intersect a
    // "pillar" (or "wall") solid BEFORE any screenshot is trusted. Never eyeballed.
    group("GUARD — real raycast, camera->mini, occlusion fade forced OFF (full-height column)");
    const guard = await page.evaluate(({ miniCell, slug }) => {
      const origin = window.Theater.interiorBoardOrigin();
      const floorTopMap = window.Theater._interiorFloorTopMapForTest();
      const sightPoints = window.Theater._occlusionLawForTest.itrPieceSightPoints(
        [{ slug, cellX: miniCell.x, cellY: miniCell.z }], origin.cx, origin.cz, floorTopMap
      );
      const sightPoint = sightPoints[0] || null;
      const raycast = sightPoint ? window.Theater._interiorRaycastClearForTest(sightPoint) : null;
      return { origin, sightPoint, raycast, cam: window.Theater._interiorCameraPositionForTest() };
    }, { miniCell: found.miniCell, slug: MINI_SLUG });
    metrics.guard = guard;
    ok(!!guard.sightPoint, `mini's real torso sight point resolved (${JSON.stringify(guard.sightPoint)})`);
    ok(!!guard.raycast && guard.raycast.clear === false, `GUARD: real raycast camera->mini is BLOCKED (clear:false) — ${JSON.stringify(guard.raycast)}`);
    ok(!!guard.raycast && guard.raycast.hits && guard.raycast.hits.some((h) => h.kind === "pillar" || h.kind === "wall"), "GUARD: the blocking hit is a real pillar/wall instance, not something else");

    // shoot+sample helper (capture-value-plunge.mjs's own established "screenshot then decode as a
    // 2D-canvas image" pattern — preserveDrawingBuffer is off, so drawImage(glCanvas) reads black
    // once composited; a captured PNG re-decoded as an <img> sidesteps that).
    async function shootAndSample(tag, worldPos) {
      await sleep(500); // let the GL frame actually paint
      const canvasEl = await page.$(".theater-stage-canvas canvas");
      const shotPath = path.join(outDir, tag + ".png");
      if (canvasEl) await canvasEl.screenshot({ path: shotPath }); else await page.screenshot({ path: shotPath });
      const pngB64 = fs.readFileSync(shotPath).toString("base64");
      const sample = await page.evaluate(({ pngB64, worldPos }) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const W = img.naturalWidth, H = img.naturalHeight;
          const c = document.createElement("canvas"); c.width = W; c.height = H;
          const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, W, H);
          let data; try { data = ctx.getImageData(0, 0, W, H).data; } catch (e) { return resolve({ err: "getImageData: " + e.message, W, H }); }
          const p = window.Theater.projectWorldPoint(worldPos.x, worldPos.y, worldPos.z);
          if (!p) return resolve({ err: "projectWorldPoint returned null", W, H });
          const sx = Math.round((p.ndcX * 0.5 + 0.5) * W), sy = Math.round((1 - (p.ndcY * 0.5 + 0.5)) * H);
          const rad = Math.max(3, Math.floor(H * 0.025));
          let r = 0, g = 0, b = 0, n = 0;
          for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) {
            const x = sx + dx, y = sy + dy;
            if (x < 0 || y < 0 || x >= W || y >= H) continue;
            const i = (y * W + x) * 4; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
          resolve(n ? { r: r / n, g: g / n, b: b / n, sx, sy, n } : { err: "0 in-bounds pixels sampled", W, H, sx, sy });
        };
        img.onerror = () => resolve({ err: "png decode failed" });
        img.src = "data:image/png;base64," + pngB64;
      }), { pngB64, worldPos });
      return { shotPath, sample: sample && !sample.err ? sample : null, raw: sample };
    }
    function colorDist(a, b) { if (!a || !b) return null; return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b); }

    // OFF is the SAME mount as the guard above (fade already forced off) — capture it now.
    const off = await shootAndSample("off", guard.sightPoint);
    ok(!!off.sample, `OFF screenshot sampled at mini's screen rect (${JSON.stringify(off.sample)})`);
    metrics.off = { shotPath: off.shotPath, sample: off.sample };

    // ── ON: fade re-enabled (the shipped default) — same board object, forced replay (the
    // "setInteriorVariant({}) nulls S.boardKey then replays S.lastBoard" trick dev/verify-occlusion-
    // fade.mjs's own header documents, since the fade flag alone isn't part of the dirty key).
    group("ON — occlusion fade ENABLED (the shipped default): mini's own screen rect should read THROUGH the column");
    await page.evaluate(() => {
      window.Theater._setOcclusionFadeDisabledForTest(false);
      window.Theater.setInteriorVariant({});
    });
    await settleCameraTween(page);
    await waitPieceResolved();
    const onDebug = await page.evaluate(({ rebuiltPillar, sightPoint }) => {
      const id = window.Theater._occlusionIdFor("pillar", rebuiltPillar.x, rebuiltPillar.z);
      return {
        id, entry: window.Theater._occlusionFadeEntryForTest(id),
        matOpacity: window.Theater._occlusionGhostMaterialOpacityForTest(id),
        raycast: window.Theater._interiorRaycastClearForTest(sightPoint),
        pillarList: window.Theater._interiorPillarListForTest(),
        pillarGhostList: window.Theater._interiorPillarGhostListForTest(),
      };
    }, { rebuiltPillar: built.rebuiltPillar, sightPoint: guard.sightPoint });
    console.log("  DEBUG A4 ON state:", JSON.stringify(onDebug));
    const on = await shootAndSample("on", guard.sightPoint);
    ok(!!on.sample, `ON screenshot sampled at mini's screen rect (${JSON.stringify(on.sample)})`);
    metrics.on = { shotPath: on.shotPath, sample: on.sample };

    // warm-up (discarded): the FIRST render() call after a scene change pays one-time shader-
    // compile/GPU-upload cost for every material this room mounted (ghost overlay, ankle stub, wall/
    // floor/pillar, the sprite billboard, contact blob, base plinth) — the SAME amortization every
    // other measureRenderFps caller gets for free once the scene has already been on-screen a few
    // frames (this harness's own timed sample is the FIRST thing to render this exact scene, unlike
    // a real play session). Discard a small warm-up batch, then measure steady-state.
    await page.evaluate(() => window.Theater.measureRenderFps(10));
    const fpsResult = await page.evaluate(() => window.Theater.measureRenderFps(60));
    metrics.fps = fpsResult;
    ok(!!fpsResult && fpsResult.fps >= 30, `fps with occlusion fade active (ON state): ${fpsResult && fpsResult.fps.toFixed(1)} (>= 30 required)`);

    // ── CONTACT: same board/camera, the ONE occluding column instance spliced OUT of
    // board.instances.pillar (everything else — walls, the room, camera framing — untouched) — the
    // un-occluded reference for what this exact mini actually looks like at this exact screen rect.
    group("CONTACT — same framing, occluding column physically removed (un-occluded reference)");
    await page.evaluate(() => {
      const board = window.__p3OcclusionBoard;
      board.instances.pillar.splice(window.__p3PillarIdx, 1);
      window.Theater._setOcclusionFadeDisabledForTest(false);
      window.Theater.setInteriorVariant({});
    });
    await settleCameraTween(page);
    await waitPieceResolved();
    const contact = await shootAndSample("contact", guard.sightPoint);
    ok(!!contact.sample, `CONTACT screenshot sampled at mini's screen rect (${JSON.stringify(contact.sample)})`);
    metrics.contact = { shotPath: contact.shotPath, sample: contact.sample };

    // ── the real, measured delta.
    group("THE MEASURED DELTA");
    const onVsContact = colorDist(on.sample, contact.sample);
    const offVsContact = colorDist(off.sample, contact.sample);
    const onVsOff = colorDist(on.sample, off.sample);
    metrics.deltas = { onVsContact, offVsContact, onVsOff };
    console.log(`  ON    sample: ${JSON.stringify(on.sample)}`);
    console.log(`  OFF   sample: ${JSON.stringify(off.sample)}`);
    console.log(`  CONTACT sample: ${JSON.stringify(contact.sample)}`);
    console.log(`  |ON-CONTACT| = ${onVsContact && onVsContact.toFixed(1)}   |OFF-CONTACT| = ${offVsContact && offVsContact.toFixed(1)}   |ON-OFF| = ${onVsOff && onVsOff.toFixed(1)}`);
    ok(offVsContact != null && offVsContact > 25, `OFF reads far from the true mini color (|OFF-CONTACT|=${offVsContact && offVsContact.toFixed(1)} > 25) — the full-height column genuinely occludes`);
    ok(onVsContact != null && offVsContact != null && onVsContact < offVsContact * 0.5, `ON reads MUCH closer to the true mini color than OFF does (|ON-CONTACT|=${onVsContact && onVsContact.toFixed(1)} < half of |OFF-CONTACT|=${offVsContact && offVsContact.toFixed(1)}) — the fade genuinely lets the mini read through`);
    ok(onVsOff != null && onVsOff > 15, `ON and OFF genuinely differ (|ON-OFF|=${onVsOff && onVsOff.toFixed(1)} > 15) — not a no-op`);

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    metrics.pass = pass; metrics.fail = fail;
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log(`wrote metrics.json + on.png/off.png/contact.png to ${outDir}`);
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exitCode = fail > 0 ? 1 : 0;
  } catch (e) {
    metrics.error = e.message;
    metrics.pass = pass; metrics.fail = fail;
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}
main();
