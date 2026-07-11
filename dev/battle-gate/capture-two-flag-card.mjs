#!/usr/bin/env node
/* dev/battle-gate/capture-two-flag-card.mjs — VP0 THE TWO-FLAG STUDY CARD (docs/BEAUTY-WAVE.md,
   docs/GRAPHICS-ENGINE.md laws 2/2b). Adam's pixel-verdict card for the interior/diorama channel's
   camera-mode + world-PSX switches.

   Fable pre-ruled both flags (VERDICT-SEAT NOTE, 2026-07-10 night): PERSPECTIVE ~20° FOV ON ·
   DITHER+SNAP OFF world surfaces. This card is a CONFIRMATION gate, not a decision gate — it exists
   so the orchestrator can read the pixels and confirm the ruling before the defaults flip lands
   (src/ui/theater-boot.js's INTERIOR_CAM_MODE/WORLD_PSX_ENABLED consts), and so a future contradiction
   has a paper trail to point at.

   Same seeded gloom + fantasy rooms x FOUR cells: {ortho, persp20} x {world-PSX on, off} — 8 panels
   total (2 scenes x 4 cells). STANDEES MUST BE IN FRAME in all four cells per scene (the spec's
   amended requirement — the sprite/world juxtaposition, clean sprites vs dithered walls, is the
   actual question the dither flag turns on; a card without characters can't answer it), so both
   scenes carry the SAME `pieces` roster capture-interior-study.mjs's own gloom/fantasy scenes use.

   Sibling of dev/battle-gate/capture-interior-study.mjs — reuses that script's proven server/Chrome/
   boot/scene-building conventions VERBATIM (see its own header comment for the "why" behind each)
   rather than reinventing them; only the VARIANTS (camMode x worldPsx instead of rig-on/rig-off) and
   the pairwise pixel-distinctness check are new.

   Camera-mode/world-PSX overrides ride through window.Theater.setInteriorVariant({camMode, worldPsx})
   — src/ui/theater-boot.js's setInteriorBoard reads `variant.camMode`/`variant.worldPsx` as study-rig
   ONLY overrides of the module consts INTERIOR_CAM_MODE/WORLD_PSX_ENABLED (no product caller ever
   sets them), so this card can sweep all four cells in one page load without touching the consts.

   Run:  node dev/battle-gate/capture-two-flag-card.mjs
   Output: dev/battle-gate/two-flag/{gloom,fantasy}-{ortho,persp}-psx-{on,off}-*.png +
   two-flag-card.png + metrics.json */

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
const outDir = path.join(__dirname, "two-flag");
fs.mkdirSync(outDir, { recursive: true });

// a FOURTH port range (dungeon-loop/interior-study/place-tray/stage already claim theirs) so this
// harness can run concurrently with any of them without a collision.
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5211, 5212, 5213, 5214, 5215];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[two-flag-card]", ...a); }
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
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// mirrors capture-interior-study.mjs's bootToInSession verbatim (see that file's header comment for
// the full rationale — not re-explained here to avoid drift risk from a divergent copy).
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
      if (nameEl) nameEl.value = "Two-Flag Card Soul";
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

// SAME scene-building convention as capture-interior-study.mjs's buildScene (verbatim — see that
// file's own header comment for the full rationale).
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
      const board = interiorBuildBoard(semPlan, { realmId: cfg.realmId, env: cfg.env, focusSegNum, radius: 1 });
      if (cfg.lightProfile) board.lightProfile = cfg.lightProfile;
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

// VP0's four cells: {ortho, persp20} x {world-PSX on, off}. camMode/worldPsx ride through
// window.Theater.setInteriorVariant, read by setInteriorBoard as study-rig-only overrides (see this
// file's own header comment).
const VARIANTS = [
  { key: "ortho-psx-on",   label: "ortho / world-PSX ON",  flags: { camMode: "ortho", worldPsx: true } },
  { key: "ortho-psx-off",  label: "ortho / world-PSX OFF", flags: { camMode: "ortho", worldPsx: false } },
  { key: "persp-psx-on",   label: "persp20 / world-PSX ON",  flags: { camMode: "persp", worldPsx: true } },
  { key: "persp-psx-off",  label: "persp20 / world-PSX OFF", flags: { camMode: "persp", worldPsx: false } },
];

// SAME gloom+fantasy seeded scenes capture-interior-study.mjs's SCENES uses — STANDEES IN FRAME is the
// spec's amended VP0 requirement, so both carry the SAME 4-piece roster that script already proved
// resolves against the confirmed-cut fantasy-tagged sprite roster.
const SCENES = [
  { key: "gloom", label: "gloom Spine crypt room", topology: "The Spine", realmId: "gloom", env: "dungeon", walkId: "two-flag-gloom-spine", residents: [{ segNum: 1, scaleVsHuman: 2.5, apex: false }], lightProfile: "torchlit",
    pieces: ["Ogre Zombie", "Skeleton", "Zombie", "Guard"] },
  { key: "fantasy", label: "fantasy Spine crypt room", topology: "The Spine", realmId: "fantasy", env: "dungeon", walkId: "two-flag-fantasy-spine", residents: null, lightProfile: "torchlit",
    pieces: ["Wolf", "Zombie", "Ape", "Guard"] },
];

// pairwise pixel-distinctness: mean per-channel absolute difference over RGBA between two same-sized
// PNG buffers (decoded in-page via <canvas>, no extra node image-lib dependency — same discipline
// capture-interior-study.mjs's contact-sheet compositor already uses for image decode work).
const DIFF_THRESHOLD = 3.0; // mean abs channel delta out of 255 — 4 genuinely different renders (camera
                             // type + a world-shader toggle) should clear this by a wide margin; a near-
                             // zero mean diff means two cells rendered visually identical (the actual bug
                             // this check exists to catch — e.g. a variant silently not applying).
async function meanAbsDiff(page, bufA, bufB) {
  return await page.evaluate(({ b64A, b64B }) => {
    return new Promise((resolve) => {
      const imA = new Image(), imB = new Image();
      let loaded = 0;
      function onBoth() {
        const c = document.createElement("canvas");
        c.width = imA.width; c.height = imA.height;
        const ctx = c.getContext("2d");
        ctx.drawImage(imA, 0, 0);
        const dataA = ctx.getImageData(0, 0, c.width, c.height).data;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(imB, 0, 0, c.width, c.height);
        const dataB = ctx.getImageData(0, 0, c.width, c.height).data;
        if (dataA.length !== dataB.length) { resolve({ error: "size mismatch" }); return; }
        let sum = 0;
        for (let i = 0; i < dataA.length; i++) sum += Math.abs(dataA[i] - dataB[i]);
        resolve({ meanAbsDiff: sum / dataA.length });
      }
      imA.onload = () => { loaded++; if (loaded === 2) onBoth(); };
      imB.onload = () => { loaded++; if (loaded === 2) onBoth(); };
      imA.src = "data:image/png;base64," + b64A;
      imB.src = "data:image/png;base64," + b64B;
    });
  }, { b64A: bufA.toString("base64"), b64B: bufB.toString("base64") });
}

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), scenes: {}, notes: [], pairwiseDiffs: {} };
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

    const shots = []; // {sceneKey, variantKey, path, buf}

    for (const scene of SCENES) {
      const built = await buildScene(page, scene);
      metrics.scenes[scene.key] = { label: scene.label, built };
      if (!built.ok) { metrics.notes.push(`scene ${scene.key} FAILED to build: ${built.error}`); continue; }

      const sceneShots = [];

      for (const variant of VARIANTS) {
        // setInteriorVariant BEFORE setInteriorBoard: setInteriorBoard's own dirtyKey folds
        // S.interiorVariant in (same discipline capture-interior-study.mjs's rig sweep uses), and
        // camMode/worldPsx are read fresh at build time inside setInteriorBoard — so the variant must
        // already be set before the board call for THIS cell to pick it up.
        await page.evaluate((flags) => { window.Theater.setInteriorVariant(flags); }, variant.flags);
        const mounted = await page.evaluate((board) => {
          try {
            window.Theater.setInteriorBoard(board);
            return {
              ok: true,
              meshCount: window.Theater.interiorMeshCount(),
              piecesResolved: window.Theater.interiorPiecesResolved(),
              piecesRequested: window.Theater.interiorPiecesRequested(),
              shadowMapEnabled: window.Theater.shadowMapEnabled(),
              psxAudit: window.Theater.interiorPsxAudit(),
              camIsPersp: window.Theater.cameraIsPerspective(),
            };
          } catch (e) { return { ok: false, error: e.message }; }
        }, built.board);
        if (!mounted.ok) { metrics.notes.push(`scene ${scene.key} variant ${variant.key} setInteriorBoard FAILED: ${mounted.error}`); continue; }

        // piece sprite textures load ASYNC — poll interiorPiecesResolved() before trusting/screenshotting
        // (same discipline capture-interior-study.mjs uses), so standees are actually IN FRAME (the
        // spec's amended requirement) rather than captured mid-load as empty billboards.
        if (mounted.piecesRequested > 0) {
          // 8000ms not 3000ms (capture-interior-study.mjs's own margin): this card's very FIRST
          // setInteriorBoard call is the coldest texture load on the whole page (nothing warmed it
          // yet) — observed taking longer than 3s under headless Chrome on a cold run.
          const deadline = Date.now() + 8000;
          let resolved = mounted.piecesResolved;
          while (Date.now() < deadline && resolved < mounted.piecesRequested) {
            await sleep(200);
            resolved = await page.evaluate(() => window.Theater.interiorPiecesResolved());
          }
          mounted.piecesResolved = resolved;
        }
        if (mounted.piecesRequested > 0 && mounted.piecesResolved < mounted.piecesRequested) {
          metrics.notes.push(`scene ${scene.key} variant ${variant.key}: only ${mounted.piecesResolved}/${mounted.piecesRequested} piece sprites resolved (standees may not be in frame)`);
        }
        if (!mounted.shadowMapEnabled) {
          metrics.notes.push(`scene ${scene.key} variant ${variant.key}: shadowMap NOT enabled on an interior board`);
        }
        if (mounted.psxAudit && mounted.psxAudit.billboardsChecked > 0 && mounted.psxAudit.billboardsWronglyPsxApplied > 0) {
          metrics.notes.push(`scene ${scene.key} variant ${variant.key}: ${mounted.psxAudit.billboardsWronglyPsxApplied} billboard(s) wrongly carry PSX shader tweaks (SPRITE PURITY law broken)`);
        }
        const expectPersp = variant.flags.camMode === "persp";
        if (mounted.camIsPersp !== expectPersp) {
          metrics.notes.push(`scene ${scene.key} variant ${variant.key}: expected camIsPersp=${expectPersp} but got ${mounted.camIsPersp}`);
        }
        // world-PSX resolution sanity: with worldPsx:false the wall/floor materials' resolved dither/
        // snap flags must actually be false (proves the flag reached the shader, not just the const).
        const worldPsxAudit = await page.evaluate(() => window.Theater.interiorWorldPsxAudit());
        if (worldPsxAudit) {
          const expectOn = variant.flags.worldPsx === true;
          if (worldPsxAudit.checked > 0) {
            const anyOn = worldPsxAudit.ditherOnCount > 0 || worldPsxAudit.snapOnCount > 0;
            if (expectOn && !anyOn) metrics.notes.push(`scene ${scene.key} variant ${variant.key}: expected world-PSX ON but no world material resolved dither/snap`);
            if (!expectOn && anyOn) metrics.notes.push(`scene ${scene.key} variant ${variant.key}: expected world-PSX OFF but ${worldPsxAudit.ditherOnCount} dither / ${worldPsxAudit.snapOnCount} snap material(s) still resolved ON`);
          }
        }
        metrics.scenes[scene.key][variant.key] = { mounted, worldPsxAudit };

        await sleep(400); // let the GL frame actually paint (same margin capture-interior-study.mjs uses)
        const canvasEl = await page.$(".theater-stage-canvas canvas");
        const fileName = `${scene.key}-${variant.key}.png`;
        const shotPath = path.join(outDir, fileName);
        let buf;
        if (canvasEl) buf = await canvasEl.screenshot({ path: shotPath });
        else buf = await page.screenshot({ path: shotPath, fullPage: false });
        const rec = { sceneKey: scene.key, sceneLabel: scene.label, variantKey: variant.key, variantLabel: variant.label, path: shotPath, fileName, buf };
        shots.push(rec);
        sceneShots.push(rec);
        log(`captured ${fileName}`);
      }

      // pairwise pixel-distinctness — every one of the 4 cells vs every other, WITHIN this scene
      // (the spec's actual verify item: "the four cells are pairwise pixel-distinct").
      const pairKey = scene.key;
      metrics.pairwiseDiffs[pairKey] = [];
      for (let i = 0; i < sceneShots.length; i++) {
        for (let j = i + 1; j < sceneShots.length; j++) {
          const a = sceneShots[i], b = sceneShots[j];
          const diff = await meanAbsDiff(page, a.buf, b.buf);
          const rec = { a: a.variantKey, b: b.variantKey, meanAbsDiff: diff.meanAbsDiff, error: diff.error };
          metrics.pairwiseDiffs[pairKey].push(rec);
          if (diff.error) {
            metrics.notes.push(`scene ${scene.key}: pixel-diff ${a.variantKey} vs ${b.variantKey} FAILED: ${diff.error}`);
          } else if (diff.meanAbsDiff < DIFF_THRESHOLD) {
            metrics.notes.push(`scene ${scene.key}: cells ${a.variantKey} and ${b.variantKey} are NOT pixel-distinct (meanAbsDiff ${diff.meanAbsDiff.toFixed(3)} < threshold ${DIFF_THRESHOLD})`);
          }
          log(`${scene.key}: ${a.variantKey} vs ${b.variantKey} meanAbsDiff=${diff.meanAbsDiff != null ? diff.meanAbsDiff.toFixed(3) : diff.error}`);
        }
      }
    }

    metrics.shotCount = shots.length;
    metrics.shots = shots.map((s) => ({ sceneKey: s.sceneKey, variantKey: s.variantKey, fileName: s.fileName }));

    // ─── composite card: 2 scenes x 4 cells ──────────────────────────────────────────────────────
    if (shots.length) {
      const cols = VARIANTS.length, rows = SCENES.length;
      const cellW = 320, cellH = 240, labelH = 22, pad = 6;
      const images = shots.map((s) => ({ sceneKey: s.sceneKey, sceneLabel: s.sceneLabel, variantKey: s.variantKey, variantLabel: s.variantLabel, b64: fs.readFileSync(s.path).toString("base64") }));
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
      const sheetPath = path.join(outDir, "two-flag-card.png");
      fs.writeFileSync(sheetPath, Buffer.from(sheetB64, "base64"));
      metrics.studyCardPath = sheetPath;
      log("wrote", sheetPath);
    }

    metrics.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    metrics.consoleErrorsCount = metrics.consoleErrors.length;

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify({ ...metrics, shots: metrics.shots }, (k, v) => (k === "buf" ? undefined : v), 2));
    log("wrote metrics.json —", metrics.shotCount, "shots,", metrics.consoleErrorsCount, "console errors");

    if (metrics.shotCount < SCENES.length * VARIANTS.length) {
      log("WARNING: not every scene/variant combo produced a shot — see metrics.notes:", metrics.notes);
      process.exitCode = 1;
    }
    if (metrics.notes.some((n) => /piece sprites resolved|shadowMap NOT enabled|wrongly carry PSX|NOT pixel-distinct|pixel-diff .* FAILED|expected world-PSX|expected camIsPersp/.test(n))) {
      log("WARNING: two-flag-card audit found issues — see metrics.notes:", metrics.notes);
      process.exitCode = 1;
    }
  } catch (e) {
    metrics.error = e.message;
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, (k, v) => (k === "buf" ? undefined : v), 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
