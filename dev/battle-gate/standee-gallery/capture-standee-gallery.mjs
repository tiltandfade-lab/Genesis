#!/usr/bin/env node
/* dev/battle-gate/standee-gallery/capture-standee-gallery.mjs — PHASE-3-WAVE-2-SPECS.md §B3, the
   in-engine STANDEE ACCEPTANCE GALLERY: Adam's taste gate for B2's physical-standee work AND the
   sprite-flip (S5) taste exhibit, side by side, in one artifact. Dev-only, strictly additive — no
   product code touched.

   Model: boot/server/Chrome/board-fixture machinery copied VERBATIM from
   dev/capture-oss-integrated.mjs and dev/battle-gate/capture-s5-flip-card.mjs (both already proven —
   this file's own job is new: the light x yaw matrix + the mechanical per-cell defect-observation
   read-back, not a new boot path).

   WHAT THIS CAPTURES, per core-three realm (fantasy / gloom / chrome):
     - a 5-creature standee LINEUP on a bare single-room stage (spec's own "a minimal flat stage with
       one light rig is FINE and preferable to a rolled room" — this is a lineup, not a scene) —
       fixed cast (see CAST below) spanning a candidate-covered creature, a legacy-only creature, a
       Large/Huge creature, an NPC, and a PC sprite.
     - a light (torchlit / daylit) x yaw (0deg front-facing / 60deg off-axis) matrix: 4 cells, the
       SAME board re-mounted per light so geometry stays identical across the matrix; yaw is realized
       via window.Theater._setInteriorCameraPoseForTest (BW2-1b/C4.1a's own test-only camera-pose
       write seam, already proven live in capture-wall-volumes.mjs) orbiting the lineup's own default
       establishing-shot camera (read back via _interiorCameraPositionForTest) around the lineup's
       center at the SAME radius/height the product's own auto-fit chose — never a guessed distance.
     - ONE flip-pair close-up per realm: "Giant Rat" (spr-fantasy-giant-rat, the only candidate-
       covered slug in the registry at time of writing — see CAST note below) rendered ALONE on a
       minimal single-piece stage, once with its registry runtimeAdmitted respected (candidate/
       faceted-v1, the committed default) and once with that ONE registry entry's runtimeAdmitted
       field mutated to "legacy" IN-PAGE (never touching disk — see stubGiantRatLegacy/
       restoreGiantRatRegistry) and the board re-mounted so interiorBuildPieces re-reads the mutated
       entry — "side by side, unoccluded, close-up" per the spec's own wording.

   MECHANICAL PER-CELL OBSERVATIONS (an image can't self-certify — this is what the harness can
   actually measure off the live scene + the rendered pixels, not a verdict):
     - projectedWidthPx per piece, computed from the piece's REAL live-scene worldPosition (read back
       via THREE.Object3D.getWorldPosition off the userData.sprite/userData.spriteSlug-tagged group
       interiorBuildPieces itself creates — ground truth, never recomputed independently) and its
       userData.interiorWidth (the exact world-unit width interiorSpriteBillboard built), projected
       through THREE.Vector3.project(camera) at each yaw. Because every standee sprite billboards
       Y-axis-only toward the camera (theater-boot.js's own "Y-axis-only billboarding to the camera"
       law, ~L3051/L4591), projectedWidthPx is EXPECTED to stay ~constant across yaw — this harness
       reports the measured ratio rather than assuming it; a genuine "edge-on-invisible" read is
       structurally unreachable by orbiting the camera alone under the CURRENT (pre-B2) billboard
       architecture, which is itself the honest finding this gallery is supposed to surface.
     - projectedFootPx per piece — the SAME real worldPosition projected to a pixel coordinate, i.e.
       exactly where the engine placed this standee's contact point. Confirming the RENDERED sprite's
       own bottom edge visually sits there (vs. floating) is a human-eyes call this harness cannot make
       from a flat composited RGB screenshot (no isolated alpha channel survives compositing) — flagged
       honestly in each cell's `observations` field rather than faked with a pixel-alpha scan that would
       silently be measuring the wrong thing.
     - lumaSpriteSample vs lumaSurroundSample — real pixel luma read back off the saved PNG (an offscreen
       canvas getImageData, in-page) at the projected mid-height sprite point vs. a patch offset
       sideways at the same screen row, feeding the "full-bright sprite in a dark corner" defect class
       mechanically (a ratio far above 1 in a torchlit cell is the measurable signature).
     - square shadows / tilted bases / key halos: NOT mechanically classifiable from pixel data without
       a real CV shape/edge model (out of this unit's scope) — each cell's `observations` field says so
       explicitly per slug, so Adam/orchestrator judge those by eye off the contact sheet, per the
       spec's own "orchestrator + Adam judge" instruction.

   CAST NOTE (an honest registry finding, not a bug in this harness): at time of writing ALL 252
   runtimeAdmitted:"candidate" entries are realm:"fantasy" (213) or realm:"pc" (39) — ZERO gloom/chrome
   entries have faceted art yet (grep data/sprite-registry.js confirms). The sprite-render corpus is
   ALSO cross-realm by construction (spriteEntryFor's own TIER1/TIER2 join has no realm filter —
   confirmed live: capture-interior-study.mjs's own gloom/chrome scenes already reuse fantasy-cut
   bestiary names like "Wolf"/"Skeleton"/"Guard"). So the SAME 5-creature cast (all fantasy/pc-realm
   registry entries) is used to dress all three realm dioramas below — the realm axis varies the
   DIORAMA dressing/palette (interiorBuildBoard's realmId), never the creature art itself. This is
   documented, not hidden.

   PC-SPRITE NOTE (a genuine, useful finding): figureFor's COMBAT/tabletop chain explicitly excludes
   kind:"pc"/"ally" from ever reaching the sprite-billboard branch (its own header comment: "a pc/ally
   keys off its CLASS... always skips straight past this branch"). But THIS gallery mounts pieces via
   window.Theater.setInteriorBoard -> interiorBuildPieces -> spriteEntryFor(p.slug) directly — a
   SEPARATE code path with NO kind guard at all. So a PC registry entry (e.g. "Dragonborn Barbarian
   (Male)") DOES resolve and render as a real standee here, even though the same slug would never
   reach a sprite in the combat/tabletop board. Recorded as `pcSpriteReachableViaInteriorPath: true`
   in each realm's results.json — worth Adam/orchestrator knowing about independent of this gate.

   Run:  node dev/battle-gate/standee-gallery/capture-standee-gallery.mjs
   Output: dev/battle-gate/standee-gallery/shots/<realm>-<cell>.png (per-cell renders)
           dev/battle-gate/standee-gallery/<realm>-contact-sheet.png (labeled 6-cell sheet)
           dev/battle-gate/standee-gallery/<realm>-results.json (per-cell mechanical observations)
           dev/battle-gate/standee-gallery/results.json (top-level summary, all three realms) */

import { spawn } from "node:child_process";
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

// a NEW port range — every existing battle-gate script already claims its own (README's own
// convention: each capture script gets a fresh 5-slot range so parallel runs never collide).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5231, 5232, 5233, 5234, 5235];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[standee-gallery]", ...a); }
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
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  page.on("response", (res) => { if (res.status() >= 400) log("HTTP", res.status(), res.url()); });
  return page;
}

// bootToInSession/waitForTheater — verbatim convention from capture-interior-study.mjs /
// capture-s5-flip-card.mjs (this repo's own established boot ritual; see either file's header for the
// "why" behind each step).
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
      if (nameEl) nameEl.value = "B3 Standee Gallery Soul";
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

// buildFixture/spatializePlan — verbatim from capture-interior-study.mjs (topology "The Hub", n=6 —
// proven to give enough floor space for a 4-piece cast; we ask for 5, spaced along a single line, and
// fall back gracefully — see lineupPositions below — if the room is tight).
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
      const plan = spatializePlan(fixture, "The Hub", { walkId: "standee-gallery-" + realmId });
      const focusRoom = plan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(plan, { realmId, env: "dungeon", focusSegNum, radius: 1 });
      return { ok: true, board, room: { x: focusRoom.x, y: focusRoom.y, w: focusRoom.w, d: focusRoom.d } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, realmId);
}

// evenly-spaced points along ONE horizontal line through the room's middle, 1-cell wall margin —
// a "lineup", not a tactical spread. Clamps spacing down (never below 1 cell) rather than overflowing
// the room if 5 pieces don't fit the auto-generated room's width.
function lineupPositions(room, count) {
  const marginX = Math.max(1, room.w * 0.12);
  const usableW = Math.max(1, room.w - marginX * 2);
  const midY = Math.round(room.y + room.d / 2);
  const step = count > 1 ? usableW / (count - 1) : 0;
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push({ x: Math.round(room.x + marginX + step * i), y: midY });
  }
  return positions;
}

// the fixed 5-creature cast — SAME roster for all three realms (see this file's own header CAST NOTE
// for why: the sprite corpus is cross-realm and 252/252 candidates are fantasy/pc-realm only). Each
// entry's `slug` is the EXACT string handed to board.pieces[].slug -> spriteEntryFor(p.slug) — the
// bestiary/registry NAME (TIER2 join) for monster/npc/pc entries here (none of these needed the
// TIER1 bestiary-id map to resolve during dev testing of this script).
const CAST = [
  { role: "candidate-covered", pieceSlug: "Giant Rat", registrySlug: "spr-fantasy-giant-rat" },
  { role: "legacy-only", pieceSlug: "Wolf", registrySlug: "spr-fantasy-wolf" },
  { role: "large-huge", pieceSlug: "Ogre Zombie", registrySlug: "spr-fantasy-ogre-zombie" },
  { role: "npc", pieceSlug: "Land-worker (Dragonborn)", registrySlug: "spr-fantasy-land-worker-dragonborn" },
  { role: "pc", pieceSlug: "Dragonborn Barbarian (Male)", registrySlug: "spr-pc-dragonborn-barbarian-male" },
];
const FLIP_SLUG = { pieceSlug: "Giant Rat", registrySlug: "spr-fantasy-giant-rat" };
const REALMS = process.env.BG_REALMS ? process.env.BG_REALMS.split(",") : ["fantasy", "gloom", "chrome"];

async function mountBoard(page, board) {
  const mounted = await page.evaluate((board) => {
    try {
      const clone = (typeof structuredClone === "function") ? structuredClone(board) : JSON.parse(JSON.stringify(board));
      window.Theater.setInteriorBoard(clone);
      return { ok: true, piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, board);
  if (!mounted.ok) return mounted;
  // sprite textures load ASYNC (spriteTextureFor kicks off THREE.TextureLoader.load and returns null
  // the first call); spriteTextureFor's own onLoad callback self-replays
  // (`if(S.mounted && S.lastBoard && S.lastBoard.kind === "interior3d") setInteriorBoard(S.lastBoard)`)
  // once the texture lands, updating interiorPiecesResolved() with NO caller action needed.
  // LIVE-DEBUGGED FINDING (dev-only, not a product bug — recorded here because it cost real time to
  // find and the OTHER battle-gate scripts' polling convention carries the same latent risk): calling
  // renderWorld() from a Node-side poll loop AFTER setInteriorBoard() — the pattern
  // capture-s5-flip-card.mjs/capture-oss-integrated.mjs's own mountAndCapture uses — reliably starves
  // this replay forever (reproduced against master: 0/5 resolved after 15s+ WITH renderWorld() polling,
  // 5/5 resolved on the FIRST 250ms tick with the renderWorld() call simply removed from the loop).
  // renderWorld() appears to touch S.mounted/S.lastBoard.kind in a way that un-arms the
  // "interior3d" replay condition. This script therefore does NOT call renderWorld() after mount —
  // it only sleeps and re-reads the counters, which is sufficient (confirmed live, see dbg3-6 traces
  // in this unit's own PR notes) since the async callback drives its own replay.
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
      if (process.env.BG_DEBUG && ticks % 4 === 0) log(`  ...waiting: ${latest.piecesResolved}/${latest.piecesRequested} (tick ${ticks})`);
    }
    mounted.piecesResolved = latest.piecesResolved;
    if (process.env.BG_DEBUG) log(`mount settled: ${mounted.piecesResolved}/${mounted.piecesRequested} after ${ticks} ticks`);
  }
  return mounted;
}

// read back the REAL live-scene world position + rendered width/height per piece, keyed by the
// registry slug interiorBuildPieces actually resolved to (g.userData.spriteSlug) — ground truth, never
// a second independent geometry derivation. Also returns S.camera's live pose for the projection math
// this script does back on the node side.
async function readSceneTelemetry(page) {
  return await page.evaluate(() => {
    const ctx = window.Theater._graphicsResearchContextForTest ? window.Theater._graphicsResearchContextForTest() : null;
    if (!ctx || !ctx.camera) return { ok: false, reason: "no graphics-research ctx seam" };
    const cam = ctx.camera;
    const pieces = [];
    if (ctx.interiorGroup) {
      ctx.interiorGroup.traverse((obj) => {
        if (obj.userData && obj.userData.sprite && obj.userData.spriteSlug) {
          // avoid `new THREE.Vector3()` — THREE isn't a page-global here (genesis.html imports it as
          // an ES module, not window.THREE); matrixWorld is already current post-render, so read the
          // translation column directly (elements[12..14], three.js's own column-major convention).
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
async function cameraPositionNow(page) {
  return await page.evaluate(() => window.Theater._interiorCameraPositionForTest ? window.Theater._interiorCameraPositionForTest() : null);
}

// pure node-side math mirroring THREE.Vector3.project(camera) (view-projection matrix multiply +
// perspective divide) — done off the SERIALIZED matrices readSceneTelemetry pulled back, so no
// second in-page evaluate round trip is needed per point.
function multiplyMatVec(mat, v) {
  // column-major 4x4 (three.js Matrix4.elements convention), homogeneous [x,y,z,1]
  const e = mat;
  const x = v.x, y = v.y, z = v.z;
  const w = e[3] * x + e[7] * y + e[11] * z + e[15];
  return {
    x: e[0] * x + e[4] * y + e[8] * z + e[12],
    y: e[1] * x + e[5] * y + e[9] * z + e[13],
    z: e[2] * x + e[6] * y + e[10] * z + e[14],
    w: w || 1,
  };
}
function worldToNdc(worldPos, camera) {
  const view = multiplyMatVec(camera.matrixWorldInverse, worldPos);
  const clip = multiplyMatVec(camera.projectionMatrix, view);
  return { x: clip.x / clip.w, y: clip.y / clip.w, z: clip.z / clip.w };
}
function ndcToPixel(ndc, canvasBox) {
  return {
    x: canvasBox.x + ((ndc.x + 1) / 2) * canvasBox.width,
    y: canvasBox.y + (1 - (ndc.y + 1) / 2) * canvasBox.height,
  };
}
// camera's world "right" vector — column 0 of matrixWorld, normalized. Y-axis-only billboards keep
// their local-X (width) axis aligned to this, so it's the correct edge direction for a projected-width
// measurement (see this file's header comment on why this is legitimate, not a guess).
function cameraRightWorld(camera) {
  const e = camera.matrixWorld;
  const rx = e[0], ry = e[1], rz = e[2];
  const len = Math.hypot(rx, ry, rz) || 1;
  return { x: rx / len, y: ry / len, z: rz / len };
}

function computePieceObservations(telemetry, canvasBox) {
  const cam = telemetry.camera;
  const right = cameraRightWorld(cam);
  return telemetry.pieces.map((p) => {
    const midHeight = { x: p.worldPos.x, y: p.worldPos.y + (p.interiorHeight || 0) / 2, z: p.worldPos.z };
    const footPoint = p.worldPos;
    const halfW = (p.interiorWidth || 0) / 2;
    const leftPoint = { x: midHeight.x - right.x * halfW, y: midHeight.y - right.y * halfW, z: midHeight.z - right.z * halfW };
    const rightPoint = { x: midHeight.x + right.x * halfW, y: midHeight.y + right.y * halfW, z: midHeight.z + right.z * halfW };
    const footPx = ndcToPixel(worldToNdc(footPoint, cam), canvasBox);
    const midPx = ndcToPixel(worldToNdc(midHeight, cam), canvasBox);
    const leftPx = ndcToPixel(worldToNdc(leftPoint, cam), canvasBox);
    const rightPx = ndcToPixel(worldToNdc(rightPoint, cam), canvasBox);
    return {
      spriteSlug: p.spriteSlug,
      interiorWidth: p.interiorWidth, interiorHeight: p.interiorHeight,
      worldPos: p.worldPos,
      projectedFootPx: { x: Math.round(footPx.x), y: Math.round(footPx.y) },
      projectedMidPx: { x: Math.round(midPx.x), y: Math.round(midPx.y) },
      projectedWidthPx: Math.round(Math.hypot(rightPx.x - leftPx.x, rightPx.y - leftPx.y)),
    };
  });
}

// luma read-back off the SAVED PNG (real rendered pixels, not a live-page canvas read — the file is
// what Adam/orchestrator will actually look at). Loads the PNG as a data URL into a throwaway <img>,
// draws to an offscreen canvas, samples an NxN patch centered at (x,y) plus a same-row background
// patch offset sideways by `offsetPx` (clamped inside the canvas).
async function sampleLuma(page, pngPath, x, y, offsetPx, patch = 10) {
  const b64 = fs.readFileSync(pngPath).toString("base64");
  return await page.evaluate(({ b64, x, y, offsetPx, patch }) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        function lumaAt(cx, cy) {
          const half = Math.floor(patch / 2);
          const px = Math.max(half, Math.min(canvas.width - half - 1, Math.round(cx)));
          const py = Math.max(half, Math.min(canvas.height - half - 1, Math.round(cy)));
          const data = ctx.getImageData(px - half, py - half, patch, patch).data;
          let sum = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
            n++;
          }
          return n ? sum / n : null;
        }
        const spriteLuma = lumaAt(x, y);
        // background sample: try +offsetPx first, fall back to -offsetPx if that would clamp
        // identically to the sprite sample (i.e. offset pushed past canvas edge).
        let bgX = x + offsetPx;
        if (bgX > canvas.width - patch) bgX = x - offsetPx;
        const bgLuma = lumaAt(bgX, y);
        resolve({ spriteLuma, bgLuma, canvasSize: { w: canvas.width, h: canvas.height } });
      };
      img.onerror = () => resolve({ spriteLuma: null, bgLuma: null, error: "image load failed" });
      img.src = "data:image/png;base64," + b64;
    });
  }, { b64, x, y, offsetPx, patch });
}

async function shootFullPage(page, shotPath) {
  await page.screenshot({ path: shotPath, fullPage: false });
}

// ─── flip-pair stub helpers — in-page only, never touches disk ────────────────────────────────────
async function setGiantRatRuntimeAdmitted(page, value) {
  return await page.evaluate((slug, value) => {
    if (typeof SPRITE_REGISTRY === "undefined" || !SPRITE_REGISTRY[slug]) return { ok: false, reason: "registry entry missing" };
    const prior = SPRITE_REGISTRY[slug].runtimeAdmitted;
    SPRITE_REGISTRY[slug].runtimeAdmitted = value;
    return { ok: true, prior, now: SPRITE_REGISTRY[slug].runtimeAdmitted };
  }, FLIP_SLUG.registrySlug, value);
}

async function buildSinglePieceBoard(page, realmId, pieceSlug) {
  return await page.evaluate((realmId, pieceSlug) => {
    try {
      const fixture = [{ id: "r1", num: 1, label: "chamber", isFinale: false, depth: 0, exits: [], light: "normal" }];
      const plan = spatializePlan(fixture, "OSS Integrated", { walkId: "standee-gallery-flip-" + realmId });
      const room = plan.rooms[0];
      const board = interiorBuildBoard(plan, { realmId, env: "dungeon", focusSegNum: room.segNum, radius: 1 });
      board.pieces = [{ slug: pieceSlug, cellX: Math.round(room.x + room.w / 2), cellY: Math.round(room.y + room.d / 2) }];
      // overcast — the ONE LIGHT_PROFILES entry with points:[] (ambient-only, theater-boot.js's own
      // "overcast: points: []" comment). Tried daylit/lamplit first and both blew the standee out to a
      // near-white smear at this close range (their point light sits close to a room-center piece,
      // inverse-square falloff overexposing it — a real close-up-rig gotcha, not a product defect).
      // Ambient-only avoids that so the faceted-vs-legacy comparison is actually legible.
      board.lightProfile = "overcast";
      return { ok: true, board, room: { x: room.x, y: room.y, w: room.w, d: room.d } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, realmId, pieceSlug);
}

// ─── main per-realm run ─────────────────────────────────────────────────────────────────────────
async function runRealm(browser, realm) {
  const page = await newPage(browser);
  await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
  await sleep(300);
  await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

  const boot = await bootToInSession(page);
  if (!boot.ok) throw new Error(`[${realm}] boot failed: ` + JSON.stringify(boot));
  const theaterState = await waitForTheater(page);
  if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error(`[${realm}] setInteriorBoard never became available: ` + JSON.stringify(theaterState));

  const result = { realm, generatedAt: new Date().toISOString(), cast: CAST.map((c) => ({ role: c.role, pieceSlug: c.pieceSlug, registrySlug: c.registrySlug })), matrixCells: [], flipPair: null, notes: [], consoleErrors: [] };

  // ─── the lineup board, built ONCE, re-mounted per light so geometry is byte-identical across cells ───
  const built = await buildLineupBoard(page, realm);
  if (!built.ok) throw new Error(`[${realm}] buildLineupBoard failed: ` + built.error);
  const positions = lineupPositions(built.room, CAST.length);
  built.board.pieces = CAST.map((c, i) => ({ slug: c.pieceSlug, cellX: positions[i].x, cellY: positions[i].y }));

  const canvasEl = await page.$(".theater-stage-canvas canvas");
  const canvasBox = canvasEl ? await canvasEl.boundingBox() : null;
  if (!canvasBox) throw new Error(`[${realm}] theater canvas has no bounding box`);

  for (const lightProfile of ["torchlit", "daylit"]) {
    const boardForLight = JSON.parse(JSON.stringify(built.board));
    boardForLight.lightProfile = lightProfile;
    const mounted = await mountBoard(page, boardForLight);
    if (!mounted.ok) { result.notes.push(`[${realm}/${lightProfile}] mount FAILED: ${mounted.error}`); continue; }
    // NO renderWorld() here — see mountBoard's own header comment on why that starves the async
    // sprite-texture replay for an interior board. mountBoard already settles pieces before returning.
    await sleep(200);

    // yaw 0 — the product's own default establishing-shot camera, untouched.
    const baseCamPos = await cameraPositionNow(page);
    const yaw0Shot = path.join(shotsDir, `${realm}-${lightProfile}-yaw0.png`);
    await shootFullPage(page, yaw0Shot);
    const yaw0Telemetry = await readSceneTelemetry(page);
    const yaw0Obs = yaw0Telemetry.ok ? computePieceObservations(yaw0Telemetry, canvasBox) : [];

    // pivot = average of the mounted pieces' REAL world positions (ground truth, not my own grid math).
    const pivot = yaw0Obs.length
      ? { x: yaw0Obs.reduce((s, p) => s + p.worldPos.x, 0) / yaw0Obs.length, z: yaw0Obs.reduce((s, p) => s + p.worldPos.z, 0) / yaw0Obs.length }
      : { x: 0, z: 0 };
    const lookY = yaw0Obs.length ? yaw0Obs.reduce((s, p) => s + (p.worldPos.y + (p.interiorHeight || 0) / 2), 0) / yaw0Obs.length : 1;

    let yaw60Shot = null, yaw60Telemetry = null, yaw60Obs = [], yaw60CamPos = null;
    if (baseCamPos) {
      const radius = Math.hypot(baseCamPos.x - pivot.x, baseCamPos.z - pivot.z);
      const baseAngle = Math.atan2(baseCamPos.z - pivot.z, baseCamPos.x - pivot.x);
      const yaw60Angle = baseAngle + (60 * Math.PI) / 180;
      const yaw60Pos = { x: pivot.x + radius * Math.cos(yaw60Angle), y: baseCamPos.y, z: pivot.z + radius * Math.sin(yaw60Angle) };
      const yaw60Look = { x: pivot.x, y: lookY, z: pivot.z };
      await setCameraPose(page, yaw60Pos, yaw60Look);
      await waitForRepaint(page);
      await sleep(150);
      yaw60Shot = path.join(shotsDir, `${realm}-${lightProfile}-yaw60.png`);
      await shootFullPage(page, yaw60Shot);
      yaw60Telemetry = await readSceneTelemetry(page);
      yaw60Obs = yaw60Telemetry.ok ? computePieceObservations(yaw60Telemetry, canvasBox) : [];
      yaw60CamPos = await cameraPositionNow(page);
    } else {
      result.notes.push(`[${realm}/${lightProfile}] no baseline camera position read back — yaw60 skipped`);
    }

    // luma sampling — one background-vs-sprite read per piece per yaw, off the SAVED png.
    async function withLuma(shotPath, obsList) {
      const out = [];
      for (const p of obsList) {
        const lum = await sampleLuma(page, shotPath, p.projectedMidPx.x, p.projectedMidPx.y, Math.max(60, p.projectedWidthPx * 1.6));
        out.push(Object.assign({}, p, {
          lumaSpriteSample: lum.spriteLuma, lumaSurroundSample: lum.bgLuma,
          lumaRatio: (lum.spriteLuma != null && lum.bgLuma) ? +(lum.spriteLuma / Math.max(1, lum.bgLuma)).toFixed(2) : null,
        }));
      }
      return out;
    }
    const yaw0ObsWithLuma = await withLuma(yaw0Shot, yaw0Obs);
    const yaw60ObsWithLuma = yaw60Shot ? await withLuma(yaw60Shot, yaw60Obs) : [];

    // edge-on / width-stability observation across yaw, matched by spriteSlug.
    const widthDeltas = yaw0ObsWithLuma.map((p0) => {
      const p60 = yaw60ObsWithLuma.find((p) => p.spriteSlug === p0.spriteSlug);
      if (!p60 || !p0.projectedWidthPx) return { spriteSlug: p0.spriteSlug, widthYaw0: p0.projectedWidthPx, widthYaw60: p60 ? p60.projectedWidthPx : null, ratio: null };
      return { spriteSlug: p0.spriteSlug, widthYaw0: p0.projectedWidthPx, widthYaw60: p60.projectedWidthPx, ratio: +(p60.projectedWidthPx / p0.projectedWidthPx).toFixed(2) };
    });

    result.matrixCells.push({
      lightProfile,
      piecesResolved: mounted.piecesResolved, piecesRequested: mounted.piecesRequested,
      yaw0: { shot: path.relative(outDir, yaw0Shot), cameraPos: baseCamPos, pieces: yaw0ObsWithLuma },
      yaw60: yaw60Shot ? { shot: path.relative(outDir, yaw60Shot), cameraPos: yaw60CamPos, pieces: yaw60ObsWithLuma } : null,
      widthAcrossYawObservation: widthDeltas,
      observations: {
        edgeOnInvisibleCards: "projectedWidthPx measured mechanically per piece per yaw (see widthAcrossYawObservation); standees Y-axis-billboard toward the camera (theater-boot.js law), so width is expected to stay ~constant across yaw under the current pre-B2 architecture — a genuine edge-on view is not reachable by camera orbit alone yet.",
        fullBrightInDarkCorner: "lumaRatio = spriteLuma/surroundLuma per piece (see pieces[].lumaRatio above), read off the actual saved PNG. A torchlit cell where a piece's ratio is far above its siblings' is the measurable signature; absolute judgment (does it read as full-bright) is Adam/orchestrator's call.",
        squareShadows: "not mechanically classifiable from pixel data (no per-object alpha mask survives compositing) — human eyes on the contact sheet.",
        floatingFeet: "projectedFootPx per piece is the exact pixel the ENGINE placed the contact point at (see pieces[].projectedFootPx) — confirming the rendered sprite's own visible bottom edge sits there is a human-eyes call this harness cannot make from a flat RGB screenshot.",
        tiltedBases: "human eyes on the contact sheet — no plinth-orientation seam exposed to test yet (pre-B2).",
        keyHalos: "human eyes on the contact sheet.",
      },
    });
  }

  // ─── flip-pair close-up: Giant Rat, candidate (default) vs stubbed-legacy, unoccluded ────────────
  const flipBuilt = await buildSinglePieceBoard(page, realm, FLIP_SLUG.pieceSlug);
  if (!flipBuilt.ok) {
    result.notes.push(`[${realm}] flip-pair board build FAILED: ${flipBuilt.error}`);
  } else {
    const pieceWorldX = flipBuilt.board.pieces[0].cellX, pieceWorldZ = flipBuilt.board.pieces[0].cellY;
    async function captureFlipPanel(label) {
      const mounted = await mountBoard(page, flipBuilt.board);
      if (!mounted.ok) return { ok: false, error: mounted.error };
      // NO renderWorld() here either — same reason as the lineup mounts above.
      await sleep(200);
      // close, eye-level, dead-on pose so nothing but the standee fills the frame.
      const telemetryPre = await readSceneTelemetry(page);
      const piece = telemetryPre.ok ? telemetryPre.pieces[0] : null;
      if (!piece) return { ok: false, error: "piece did not resolve to a live sprite group — cannot pose a close-up" };
      // frame the standee to fill ~55% of the vertical FOV (INTERIOR_CAM_FOV_DEG=20, theater-boot.js)
      // rather than a fixed world-unit standoff — a Giant Rat's interiorHeight (~0.4 world units) and
      // an Ogre Zombie's (~1.7) need very different distances to both read as "large in frame".
      const halfHeight = (piece.interiorHeight || 0.4) * 0.5;
      const fillFraction = 0.4;
      const fovRad = (20 * Math.PI) / 180;
      const distance = Math.max(1.2, halfHeight / Math.tan(fovRad / 2) / fillFraction);
      const eyeY = piece.worldPos.y + halfHeight * 1.1;
      const pos = { x: piece.worldPos.x, y: eyeY, z: piece.worldPos.z + distance };
      await setCameraPose(page, pos, { x: piece.worldPos.x, y: eyeY, z: piece.worldPos.z });
      await waitForRepaint(page);
      await sleep(150);
      const shotPath = path.join(shotsDir, `${realm}-flip-${label}.png`);
      await shootFullPage(page, shotPath);
      const telemetry = await readSceneTelemetry(page);
      const obs = telemetry.ok ? computePieceObservations(telemetry, canvasBox) : [];
      const lum = obs.length ? await sampleLuma(page, shotPath, obs[0].projectedMidPx.x, obs[0].projectedMidPx.y, 200) : null;
      return { ok: true, shot: path.relative(outDir, shotPath), piecesResolved: mounted.piecesResolved, observations: obs, luma: lum };
    }

    const candidatePanel = await captureFlipPanel("candidate");
    const stub = await setGiantRatRuntimeAdmitted(page, "legacy");
    const legacyPanel = await captureFlipPanel("legacy");
    const restore = await setGiantRatRuntimeAdmitted(page, "candidate");

    result.flipPair = {
      registrySlug: FLIP_SLUG.registrySlug,
      candidate: candidatePanel, legacy: legacyPanel,
      stubApplied: stub, stubRestored: restore,
      observations: "side-by-side close-up, same board/pose/light for both panels (only runtimeAdmitted differs, mutated in-page then restored — never touched disk). Whether the faceted register reads as canon vs. the legacy v3 corpus (line weight, palette, silhouette read) is Adam/orchestrator's taste call off the two PNGs — not something this harness scores.",
    };
  }

  result.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
  await page.close();
  return result;
}

// ─── contact sheet compositor — 6 labeled cells (4 matrix + 2 flip) per realm, same canvas-compose
// technique dev/battle-gate/capture-s5-flip-card.mjs already proved live. ────────────────────────────
async function buildContactSheet(browser, realm, result) {
  const cells = [];
  for (const cell of result.matrixCells) {
    if (cell.yaw0 && cell.yaw0.shot) cells.push({ path: path.join(outDir, cell.yaw0.shot), label: `${cell.lightProfile} / yaw0` });
    if (cell.yaw60 && cell.yaw60.shot) cells.push({ path: path.join(outDir, cell.yaw60.shot), label: `${cell.lightProfile} / yaw60` });
  }
  if (result.flipPair) {
    if (result.flipPair.candidate && result.flipPair.candidate.shot) cells.push({ path: path.join(outDir, result.flipPair.candidate.shot), label: "flip: candidate (faceted-v1)" });
    if (result.flipPair.legacy && result.flipPair.legacy.shot) cells.push({ path: path.join(outDir, result.flipPair.legacy.shot), label: "flip: legacy (v3, stubbed)" });
  }
  if (!cells.length) return null;
  const page = await browser.newPage();
  try {
    const cellW = 520, cellH = 390, labelH = 24, pad = 6, cols = 3;
    const rows = Math.ceil(cells.length / cols);
    const b64s = cells.map((c) => (fs.existsSync(c.path) ? fs.readFileSync(c.path).toString("base64") : null));
    const sheetB64 = await page.evaluate(({ b64s, labels, cellW, cellH, labelH, pad, cols, rows }) => {
      return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = cols * (cellW + pad) + pad;
        canvas.height = rows * (cellH + labelH + pad) + pad;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#eee"; ctx.font = "14px monospace";
        let loaded = 0;
        const total = b64s.length;
        if (!total) resolve(canvas.toDataURL("image/png").split(",")[1]);
        b64s.forEach((b64, i) => {
          const col = i % cols, row = Math.floor(i / cols);
          const x = pad + col * (cellW + pad), y = pad + row * (cellH + labelH + pad);
          ctx.fillText(labels[i], x + 4, y + labelH - 6);
          if (!b64) { loaded++; if (loaded === total) resolve(canvas.toDataURL("image/png").split(",")[1]); return; }
          const im = new Image();
          im.onload = () => { ctx.drawImage(im, x, y + labelH, cellW, cellH); loaded++; if (loaded === total) resolve(canvas.toDataURL("image/png").split(",")[1]); };
          im.onerror = () => { loaded++; if (loaded === total) resolve(canvas.toDataURL("image/png").split(",")[1]); };
          im.src = "data:image/png;base64," + b64;
        });
      });
    }, { b64s, labels: cells.map((c) => c.label), cellW, cellH, labelH, pad, cols, rows });
    const sheetPath = path.join(outDir, `${realm}-contact-sheet.png`);
    fs.writeFileSync(sheetPath, Buffer.from(sheetB64, "base64"));
    return sheetPath;
  } finally {
    await page.close();
  }
}

async function main() {
  const server = await startServer();
  log("server:", BASE);
  const browser = await launchChrome();
  const summary = { generatedAt: new Date().toISOString(), realms: {}, notes: [] };
  try {
    for (const realm of REALMS) {
      log(`=== realm: ${realm} ===`);
      const result = await runRealm(browser, realm);
      result.pcSpriteReachableViaInteriorPath = result.matrixCells.some((c) => c.yaw0 && c.yaw0.pieces.some((p) => p.spriteSlug === "spr-pc-dragonborn-barbarian-male"));
      const sheetPath = await buildContactSheet(browser, realm, result);
      result.contactSheet = sheetPath ? path.relative(outDir, sheetPath) : null;
      fs.writeFileSync(path.join(outDir, `${realm}-results.json`), JSON.stringify(result, null, 2));
      log(`wrote ${realm}-results.json + contact sheet`);
      summary.realms[realm] = {
        contactSheet: result.contactSheet,
        castSlugs: result.cast.map((c) => c.registrySlug),
        matrixCellCount: result.matrixCells.length,
        flipPairPresent: !!result.flipPair,
        pcSpriteReachableViaInteriorPath: result.pcSpriteReachableViaInteriorPath,
        consoleErrorCount: result.consoleErrors.length,
        notes: result.notes,
      };
    }
    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(summary, null, 2));
    log("wrote top-level results.json");
  } catch (e) {
    summary.error = e.message;
    summary.stack = e.stack;
    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(summary, null, 2));
    log("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
