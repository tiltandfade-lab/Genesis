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

   GR1 PASS (docs/GRAPHICS-ENGINE.md build unit GR1, §E TEXTURE-PER-REALM): Adam's own instruction for
   this unit's card — "3 realms (chrome/gloom/fantasy) x 2 variants (materials on / old flat, labeled)"
   — REPLACES the iteration-2 AO/banded sweep entirely (that sweep answered a different taste question,
   GR3's job when it lands; this card's ONE job is "does GR1's material texture actually read"). SCENES
   grew from 2 to 3 (added a fantasy Spine crypt scene, reusing the SAME fantasy-tagged sprites U3's own
   gloom scene already draws from — regen-v3's own "cut" status confirms these at authoring time); the
   materials-off variant sets `window.Theater.setInteriorVariant({materials:false})` — setInteriorBoard's
   own GR1 wiring (src/ui/theater-boot.js) reads that flag and drops floorTex/wallTex to `null` (a flat
   single base-color material, interiorBuildInstancedMesh's own untextured branch) instead of baking a
   REALM_MATERIALS texture — an honest OLD-FLAT baseline, not a resurrection of the retired pattern
   texture (which no longer exists in the codebase at all). 6 panels total (3 realms x 2 variants) + one
   contact sheet.

   Sibling of dev/battle-gate/capture-place-tray.mjs — reuses that script's proven server/Chrome/boot
   conventions VERBATIM (see its own header comment for the "why" behind each) rather than
   reinventing them. Trimmed/extended to this unit's own scope: boot into a real session
   (bootToInSession), build three deterministic SpatialPlans directly via the app's own real global
   functions (spatializePlan/semanticizePlan/interiorBuildBoard — no mocks), attach `pieces` from the
   live sprite registry, push each through window.Theater.setInteriorBoard, sweep
   window.Theater.setInteriorVariant across the 2 materials combos, and screenshot each of the
   resulting 6 frames. Honest pixels: no cherry-picking — every variant that renders gets captured and
   included in the contact sheet, pass or fail. metrics.json also carries the sprite-purity/shadow/
   pieces audit (window.Theater.interiorPsxAudit / .shadowMapEnabled / .interiorPiecesResolved) dev/
   verify-dungeon-interior.mjs's browser-mode checks re-assert against a fresh boot.

   Run:  node dev/battle-gate/capture-interior-study.mjs
   Output: dev/battle-gate/interior-study/{chrome,gloom,fantasy}-{materials-on,materials-off}-*.png +
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
const outDir = path.join(__dirname, "interior-study");
fs.mkdirSync(outDir, { recursive: true });

// same port discipline as capture-place-tray.mjs (5191-5195) / capture-stage.mjs (5181-5185) — a
// THIRD range so all three harnesses can run concurrently without a collision.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5201, 5202, 5203, 5204, 5205];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[interior-study-gate]", ...a); }
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

// GR1 (docs/GRAPHICS-ENGINE.md build unit GR1): Adam's own instruction for this card — "materials on /
// old flat, labeled" — 2 variants, not the iteration-2 AO/banded sweep (that sweep answered a different
// taste question; this card's ONE job is proving GR1's material texture actually reads at glance
// distance). Shadows/AO/banded/fog all stay at setInteriorBoard's own baseline defaults in both
// variants (ao:false, banded:false, fog defaults on) — `materials` is the ONLY thing that changes.
const VARIANTS = [
  { key: "materials-on", label: "materials ON (GR1)", flags: { materials: true, ao: false, banded: false } },
  { key: "materials-off", label: "materials OFF (old flat)", flags: { materials: false, ao: false, banded: false } },
];

// ITERATION 2, ruling 3 (piece sprites) + GR1 (3rd scene, Adam's own "chrome/gloom/fantasy" card spec):
// chrome Hub (lamplit), gloom Spine crypt (torchlit), fantasy Spine crypt (torchlit) — sprite-registry
// NAMES (spriteEntryFor's join key), every one confirmed `status:"cut"` in data/sprite-registry.js at
// authoring time (only the fantasy realm has cut sprites today per SPRITE-TRANSITION's own history; the
// chrome scene reuses fantasy-tagged sprites for the same reason iteration 2 already did — no
// chrome-tagged creature wave exists yet). The new fantasy scene draws from the SAME confirmed-cut
// fantasy roster the gloom scene already uses (Wolf/Zombie/Ape/Guard), just a different mix, so it
// needs no new sprite-registry lookups to resolve.
const SCENES = [
  { key: "chrome", label: "chrome Hub dungeon room", topology: "The Hub", realmId: "chrome", env: "dungeon", walkId: "interior-study-chrome-hub", residents: null, lightProfile: "lamplit",
    pieces: ["Wolf", "Giant Rat", "Spider", "Knight"] },
  { key: "gloom", label: "gloom Spine crypt room", topology: "The Spine", realmId: "gloom", env: "dungeon", walkId: "interior-study-gloom-spine", residents: [{ segNum: 1, scaleVsHuman: 2.5, apex: false }], lightProfile: "torchlit",
    pieces: ["Ogre Zombie", "Skeleton", "Zombie", "Guard"] },
  { key: "fantasy", label: "fantasy Spine crypt room", topology: "The Spine", realmId: "fantasy", env: "dungeon", walkId: "interior-study-fantasy-spine", residents: null, lightProfile: "torchlit",
    pieces: ["Wolf", "Zombie", "Ape", "Guard"] },
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
      const sheetPath = path.join(outDir, "study-card.png");
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
