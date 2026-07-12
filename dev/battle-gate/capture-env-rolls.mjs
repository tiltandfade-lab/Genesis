#!/usr/bin/env node
/* dev/battle-gate/capture-interior-study.mjs — DUNGEON-GRAPH.md U3's REQUIRED render-quality STUDY
   CARD (the taste gate).

   ITERATION 2 (Adam's 2026-07-10 evening taste-gate feedback — "bigger card + creatures in the
   rooms"): the card was too small to read wall-prism volume, and empty rooms didn't sell "this is a
   real dungeon". This pass: (1) viewport bumped to 1600x1200 per shot (was 1280x800 total-page); (2)
   the camera is pulled TIGHT into the focus room (radius:1, not 2 — the WHOLE-plan-vs-just-this-room
   trim DUNGEON-GRAPH.md U3 item 2 already supports) so wall PRISMS read as unmistakably volumetric
   (thickness/height occluding the room behind); (3) each scene now carries `pieces` — real sprite
   billboards standing in the room at true scale; (4) shadows are BASELINE ON in every variant (ruling
   2 — real PointLights + cast shadows on interiors, no longer a study-only toggle).

   GR1 PASS (docs/GRAPHICS-ENGINE.md build unit GR1, §E TEXTURE-PER-REALM, historical): "3 realms
   (chrome/gloom/fantasy) x 2 variants (materials on / old flat, labeled)" — REPLACED the iteration-2
   AO/banded sweep entirely. SCENES grew from 2 to 3 (added a fantasy Spine crypt scene, reusing the
   SAME fantasy-tagged sprites U3's own gloom scene already draws from — regen-v3's own "cut" status
   confirms these at authoring time).

   GR3+GR4 PASS (docs/GRAPHICS-ENGINE.md build units GR3 LIGHT RIG LAW + GR4 STAGE LAW): this pass's
   ONE job is "does the hemisphere key + per-realm grade + diorama edge skirt actually read" — REPLACES
   the GR1 materials-on/materials-off variant pair with rig-on/rig-off (materials stay ON, GR1's own
   baseline, in BOTH variants now — GR1's own question is already answered/landed). `rig-off` sets
   `window.Theater.setInteriorVariant({rig:false})` — setInteriorBoard's own GR3 wiring
   (src/ui/theater-boot.js) reads that flag, dims the shared HemisphereLight to 0 for the render and
   drops the per-realm gradeColorLocal profile to null (an honest NO-RIG baseline: torches/lamps only,
   no soft key, no grade wash, no whisper fog) — never a resurrection of any retired code path. The
   GR4 skirt itself has no on/off toggle (it's cheap, always-on geometry, not a taste-gated variant) —
   it's simply visible in every panel, both variants, at every yaw. SCENES stay the SAME 3 (chrome
   Hub/gloom Spine/fantasy Spine) — this pass answers a lighting/grade/edge-finish question, not a
   scene-roster question. 6 panels total (3 realms x 2 variants) + one contact sheet.

   Sibling of dev/battle-gate/capture-place-tray.mjs — reuses that script's proven server/Chrome/boot
   conventions VERBATIM (see its own header comment for the "why" behind each) rather than
   reinventing them. Trimmed/extended to this unit's own scope: boot into a real session
   (bootToInSession), build three deterministic SpatialPlans directly via the app's own real global
   functions (spatializePlan/semanticizePlan/interiorBuildBoard — no mocks), attach `pieces` from the
   live sprite registry, push each through window.Theater.setInteriorBoard, sweep
   window.Theater.setInteriorVariant across the 2 rig combos, and screenshot each of the
   resulting 6 frames. Honest pixels: no cherry-picking — every variant that renders gets captured and
   included in the contact sheet, pass or fail. metrics.json also carries the sprite-purity/shadow/
   pieces audit (window.Theater.interiorPsxAudit / .shadowMapEnabled / .interiorPiecesResolved) dev/
   verify-dungeon-interior.mjs's own checks (16-21) re-assert the underlying data/structural claims
   without a browser.

   Run:  node dev/battle-gate/capture-interior-study.mjs
   Output: dev/battle-gate/interior-study/{chrome,gloom,fantasy}-{rig-on,rig-off}-*.png +
   study-card.png + metrics.json */

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
const outDir = path.join(__dirname, "env-rolls");
fs.mkdirSync(outDir, { recursive: true });

// same port discipline as capture-place-tray.mjs (5191-5195) / capture-stage.mjs (5181-5185) — a
// THIRD range so all three harnesses can run concurrently without a collision.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5241, 5242, 5243, 5244, 5245];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[env-rolls]", ...a); }
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

// ITERATION 2 (Adam: "bigger card"): 1600x1200 per shot, up from 1280x800 — big enough that wall-prism
// thickness/height and standing sprite pieces both read clearly at contact-sheet thumbnail size too.
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
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// mirrors capture-place-tray.mjs's bootToInSession verbatim (see that file's header comment for the
// full rationale — not re-explained here to avoid drift risk from a divergent copy).
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
      if (nameEl) nameEl.value = "Interior Study Gate Soul";
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

// wait for window.Theater to be ready and the stage canvas to exist (same poll discipline
// capture-place-tray.mjs uses to wait for theaterStageSync's async mount).
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

// DUNGEON-GRAPH.md U3: two deterministic seeded scenes — a chrome Hub dungeon room, a gloom Spine
// crypt room. Built entirely from the app's own real global functions (spatializePlan/
// semanticizePlan/interiorBuildBoard), no mocks. A small synthetic walk.segments[] fixture (the
// EXACT id/num/label/isFinale/depth/exits/light shape src/engine/walk.js:593-625 builds) — same
// generator family dev/verify-dungeon-*.mjs already use, reimplemented in-page since this runs inside
// the real browser, not node vm.
// ITERATION 2, ruling 3: `cfg.pieces` is a plain list of sprite-registry NAMES (the same join key
// spriteEntryFor uses) — buildScene resolves each against the focus room's own rect into deterministic
// cellX/cellY floor positions (interior corners) in-page, see piecePositions() inside the evaluate()
// callback below (needs the freshly-built room rect, not something this node-side wrapper could
// precompute before the plan exists).
async function buildScene(page, { topology, realmId, env, walkId, residents, lightProfile, pieces }) {
  return await page.evaluate((cfg) => {
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
        // BFS depth from s1 (entry)
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
      const fixture = buildFixture(cfg.topology, 6);
      const plan = spatializePlan(fixture, cfg.topology, { walkId: cfg.walkId });
      const semPlan = cfg.residents ? semanticizePlan(plan, fixture, cfg.residents) : plan;
      const focusRoom = semPlan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      // ITERATION 2 (Adam: camera pulled tight into the focus room): radius:1, not 2 — render ONLY the
      // focus room + its immediate doors/corridor stubs, so the fitted camera sits close enough that
      // wall thickness/height are unmistakable, not a distant whole-plan overview.
      const board = interiorBuildBoard(semPlan, { realmId: cfg.realmId, env: cfg.env, focusSegNum, radius: 1 });
      if (cfg.lightProfile) board.lightProfile = cfg.lightProfile;
      // ITERATION 2, ruling 3: pieces placed at deterministic interior-corner/center cells of the
      // focus room rect (in-page since it needs the freshly-built room rect, not something buildScene's
      // node-side caller could precompute before the plan exists).
      function piecePositions(room, count) {
        const inX = Math.max(room.x + 1, room.x), inY = Math.max(room.y + 1, room.y);
        const maxX = Math.max(inX, room.x + room.w - 2), maxY = Math.max(inY, room.y + room.d - 2);
        return [{ x: inX, y: inY }, { x: maxX, y: inY }, { x: inX, y: maxY }, { x: maxX, y: maxY }].slice(0, count);
      }
      if (cfg.pieces && cfg.pieces.length) {
        const positions = piecePositions(focusRoom, cfg.pieces.length);
        board.pieces = cfg.pieces.map((slug, i) => ({
          slug, cellX: positions[i].x, cellY: positions[i].y,
        }));
      }
      return { ok: true, board, meta: board.meta };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { topology, realmId, env, walkId, residents, lightProfile, pieces });
}

// GR3+GR4 (docs/GRAPHICS-ENGINE.md build units GR3 LIGHT RIG LAW + GR4 STAGE LAW): this card's ONE job
// is proving the hemisphere key + per-realm grade actually read at glance distance (the skirt has no
// toggle — it's always on in both panels, see this file's own header). materials stay ON (GR1's own
// landed baseline) in both variants; `rig` is the ONLY thing that changes.
// ENV-ROLLS (feedback gate, 2026-07-11): ONE production-look variant — the real render (materials +
// GR3 rig on), not the rig on/off A/B. Adam is judging the actual environments, not the light rig.
const VARIANTS = [
  { key: "look", label: "production look", flags: { materials: true, ao: false, banded: false, rig: true } },
];

// A BROAD MATRIX of environmental rolls for Adam's feedback — varies realm (all 7 with surface art
// in data/realm-surfaces.js + fantasy), topology (Spine vs Hub → different room shapes), light
// profile (the 8 valid keys in theater-boot.js LIGHT_PROFILES; an unknown key safely falls back to
// "dark", theater-boot.js:7460), and walkId (spatializePlan's seed → different rolled room shapes).
// Only fantasy-tagged creature sprites resolve today (SPRITE-TRANSITION history), so gloom/chrome/
// fantasy scenes carry that confirmed-cut roster (Wolf/Skeleton/Zombie/Guard/Knight/Ogre Zombie/Ape);
// realms with no creature wave yet render as EMPTY rooms (which best showcase architecture/materials/
// lighting anyway). Any scene that fails to build just logs + skips (main()'s own `continue`).
const SCENES = [
  { key: "gloom-crypt", label: "gloom · Spine crypt · torchlit", topology: "The Spine", realmId: "gloom", env: "dungeon", walkId: "env-gloom-spine-a", residents: [{ segNum: 1, scaleVsHuman: 2.5, apex: false }], lightProfile: "torchlit",
    pieces: ["Ogre Zombie", "Skeleton", "Zombie", "Guard"] },
  { key: "gloom-lava", label: "gloom · Hub chamber · lavalit", topology: "The Hub", realmId: "gloom", env: "dungeon", walkId: "env-gloom-hub-b", residents: null, lightProfile: "lavalit",
    pieces: null },
  { key: "chrome-hub", label: "chrome · Hub · lamplit", topology: "The Hub", realmId: "chrome", env: "dungeon", walkId: "env-chrome-hub-a", residents: null, lightProfile: "lamplit",
    pieces: ["Wolf", "Giant Rat", "Spider", "Knight"] },
  { key: "chrome-void", label: "chrome · Spine · voidlit", topology: "The Spine", realmId: "chrome", env: "dungeon", walkId: "env-chrome-spine-b", residents: null, lightProfile: "voidlit",
    pieces: null },
  { key: "fantasy-crypt", label: "fantasy · Spine crypt · torchlit", topology: "The Spine", realmId: "fantasy", env: "dungeon", walkId: "env-fantasy-spine-a", residents: null, lightProfile: "torchlit",
    pieces: ["Wolf", "Zombie", "Ape", "Guard"] },
  { key: "lost-world-day", label: "lost-world · Spine · daylit", topology: "The Spine", realmId: "lost-world", env: "dungeon", walkId: "env-lostworld-spine-a", residents: null, lightProfile: "daylit",
    pieces: null },
  { key: "lost-world-overcast", label: "lost-world · Hub · overcast", topology: "The Hub", realmId: "lost-world", env: "dungeon", walkId: "env-lostworld-hub-b", residents: null, lightProfile: "overcast",
    pieces: null },
  { key: "bright-kingdom", label: "bright-kingdom · Hub · lamplit", topology: "The Hub", realmId: "bright-kingdom", env: "dungeon", walkId: "env-bright-hub-a", residents: null, lightProfile: "lamplit",
    pieces: null },
  { key: "cosmic", label: "cosmic · Spine · voidlit", topology: "The Spine", realmId: "cosmic", env: "dungeon", walkId: "env-cosmic-spine-a", residents: null, lightProfile: "voidlit",
    pieces: null },
  { key: "suburb", label: "suburb · Hub · daylit", topology: "The Hub", realmId: "suburb", env: "dungeon", walkId: "env-suburb-hub-a", residents: null, lightProfile: "daylit",
    pieces: null },
  { key: "noir", label: "noir · Spine · moonlit", topology: "The Spine", realmId: "noir", env: "dungeon", walkId: "env-noir-spine-a", residents: null, lightProfile: "moonlit",
    pieces: null },
  { key: "gloom-dark", label: "gloom · Spine · dark (unlit)", topology: "The Spine", realmId: "gloom", env: "dungeon", walkId: "env-gloom-spine-dark", residents: null, lightProfile: "dark",
    pieces: null },
];

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), scenes: {}, notes: [] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);

    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const boot = await bootToInSession(page);
    metrics.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const theaterState = await waitForTheater(page);
    metrics.theaterState = theaterState;
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("window.Theater.setInteriorBoard never became available: " + JSON.stringify(theaterState));

    const shots = []; // {sceneKey, variantKey, path}

    for (const scene of SCENES) {
      const built = await buildScene(page, scene);
      metrics.scenes[scene.key] = { label: scene.label, built };
      if (!built.ok) { metrics.notes.push(`scene ${scene.key} FAILED to build: ${built.error}`); continue; }

      const mounted = await page.evaluate((board) => {
        try {
          window.Theater.setInteriorBoard(board);
          // ITERATION 2 audit — sprite purity, shadow state, piece resolution (rulings 1/2/3) asserted
          // directly against the LIVE mounted scene graph, not inferred from a screenshot.
          return {
            ok: true,
            meshCount: window.Theater.interiorMeshCount(),
            piecesResolved: window.Theater.interiorPiecesResolved(),
            piecesRequested: window.Theater.interiorPiecesRequested(),
            lightCount: window.Theater.interiorLightCount(),
            shadowCasterCount: window.Theater.interiorShadowCasterCount(),
            shadowMapEnabled: window.Theater.shadowMapEnabled(),
            psxAudit: window.Theater.interiorPsxAudit(),
          };
        } catch (e) { return { ok: false, error: e.message }; }
      }, built.board);
      metrics.scenes[scene.key].mounted = mounted;
      if (!mounted.ok) { metrics.notes.push(`scene ${scene.key} setInteriorBoard FAILED: ${mounted.error}`); continue; }

      // piece sprite textures load ASYNC (spriteTextureFor's textureLoader.load callback replays
      // setInteriorBoard once each texture lands — see that callback's own header note) — the first
      // setInteriorBoard call above almost always mounts with 0 pieces resolved (textures not loaded
      // yet). Poll interiorPiecesResolved() up to ~3s (local file loads, this is generous) before
      // trusting the "resolved" count, rather than judging resolution off a race-prone single read.
      if (mounted.piecesRequested > 0) {
        const deadline = Date.now() + 3000;
        let latest = mounted;
        while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
          await sleep(200);
          latest = await page.evaluate(() => ({
            piecesResolved: window.Theater.interiorPiecesResolved(),
            piecesRequested: window.Theater.interiorPiecesRequested(),
            psxAudit: window.Theater.interiorPsxAudit(), // re-read too: 0 billboards existed at the FIRST mount
          }));
        }
        mounted.piecesResolved = latest.piecesResolved;
        if (latest.psxAudit) mounted.psxAudit = latest.psxAudit;
        metrics.scenes[scene.key].mounted = mounted;
      }
      if (mounted.piecesRequested > 0 && mounted.piecesResolved < mounted.piecesRequested) {
        metrics.notes.push(`scene ${scene.key}: only ${mounted.piecesResolved}/${mounted.piecesRequested} piece sprites resolved`);
      }
      if (!mounted.shadowMapEnabled) {
        metrics.notes.push(`scene ${scene.key}: shadowMap NOT enabled on an interior board`);
      }
      if (mounted.psxAudit.billboardsChecked > 0 && mounted.psxAudit.billboardsWronglyPsxApplied > 0) {
        metrics.notes.push(`scene ${scene.key}: ${mounted.psxAudit.billboardsWronglyPsxApplied} billboard(s) wrongly carry PSX shader tweaks`);
      }

      for (const variant of VARIANTS) {
        await page.evaluate((flags) => { window.Theater.setInteriorVariant(flags); }, variant.flags);
        await sleep(400); // let the GL frame actually paint (same margin capture-place-tray.mjs uses)
        const canvasEl = await page.$(".theater-stage-canvas canvas");
        const fileName = `${scene.key}-${variant.key}.png`;
        const shotPath = path.join(outDir, fileName);
        if (canvasEl) await canvasEl.screenshot({ path: shotPath });
        else await page.screenshot({ path: shotPath, fullPage: false });
        shots.push({ sceneKey: scene.key, sceneLabel: scene.label, variantKey: variant.key, variantLabel: variant.label, path: shotPath, fileName });
        log(`captured ${fileName}`);
      }
    }

    metrics.shotCount = shots.length;
    metrics.shots = shots.map((s) => ({ sceneKey: s.sceneKey, variantKey: s.variantKey, fileName: s.fileName }));

    // ─── contact sheet: composite every captured PNG onto one grid (scenes x rows, variants x cols)
    // via an in-page <canvas> in the SAME browser (no extra node image-lib dependency) ─────────────
    if (shots.length) {
      const cols = VARIANTS.length, rows = SCENES.length;
      const cellW = 320, cellH = 240, labelH = 22, pad = 6;
      const images = shots.map((s) => ({ ...s, b64: fs.readFileSync(s.path).toString("base64") }));
      const sheetB64 = await page.evaluate(({ images, cols, rows, cellW, cellH, labelH, pad, sceneLabels, variantLabels }) => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = cols * (cellW + pad) + pad;
          canvas.height = rows * (cellH + labelH + pad) + pad + labelH;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#eee"; ctx.font = "13px monospace";
          variantLabels.forEach((lbl, ci) => { ctx.fillText(lbl, pad + ci * (cellW + pad) + 4, labelH - 6); });
          let loaded = 0;
          images.forEach((img) => {
            const im = new Image();
            im.onload = () => {
              const ri = sceneLabels.indexOf(img.sceneLabel);
              const ci = variantLabels.indexOf(img.variantLabel);
              const x = pad + ci * (cellW + pad);
              const y = labelH + pad + ri * (cellH + labelH + pad) + labelH;
              ctx.drawImage(im, x, y, cellW, cellH);
              ctx.fillStyle = "#eee"; ctx.font = "12px monospace";
              ctx.fillText(img.sceneLabel + " / " + img.variantKey, x + 4, y + cellH + 14);
              loaded++;
              if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
            };
            im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + img.b64;
          });
          if (!images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
        });
      }, {
        images: images.map((i) => ({ b64: i.b64, sceneLabel: i.sceneLabel, variantLabel: i.variantLabel, variantKey: i.variantKey })),
        cols, rows, cellW, cellH, labelH, pad,
        sceneLabels: SCENES.map((s) => s.label), variantLabels: VARIANTS.map((v) => v.label),
      });
      const sheetPath = path.join(outDir, "contact-sheet.png");
      fs.writeFileSync(sheetPath, Buffer.from(sheetB64, "base64"));
      metrics.studyCardPath = sheetPath;
      log("wrote", sheetPath);
    }

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    metrics.consoleErrorsCount = metrics.consoleErrors.length;

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("wrote metrics.json —", metrics.shotCount, "shots,", metrics.consoleErrorsCount, "console errors");
    if (metrics.shotCount < SCENES.length * VARIANTS.length) {
      log("WARNING: not every scene/variant combo produced a shot — see metrics.notes:", metrics.notes);
      process.exitCode = 1;
    }
    // ITERATION 2: a piece sprite that failed to resolve, or shadow-mapping not actually on, is a
    // silent regression a screenshot alone wouldn't catch (the frame still renders, just missing the
    // thing Adam asked for) — fail the gate the same way an incomplete shot set does.
    if (metrics.notes.some((n) => /piece sprites resolved|shadowMap NOT enabled|wrongly carry PSX/.test(n))) {
      log("WARNING: iteration-2 audit found issues — see metrics.notes:", metrics.notes);
      process.exitCode = 1;
    }
  } catch (e) {
    metrics.error = e.message;
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
