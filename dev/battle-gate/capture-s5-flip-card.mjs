#!/usr/bin/env node
/* dev/battle-gate/capture-s5-flip-card.mjs — VQ2-RESPEC.md S5's REQUIRED taste-gate exhibit ("the
   capture card"): the SAME interior scene, cast, and camera, captured once with the faceted flip ON
   (the committed default -- FACETED_FLIP_ENABLED=true) and once with it OFF (the one-flag retreat,
   proven live), so Adam can eyeball the real pixel difference before P3-2 Stage B's gallery re-gates
   the whole batch admission.

   Reuses dev/battle-gate/capture-interior-study.mjs's proven server/Chrome/boot/buildScene machinery
   VERBATIM (see that file's own header for the "why" behind each convention) -- only the scene
   roster (ONE scene, not three) and the swept axis (facetedFlip on/off, not rig on/off) are new.

   Scene: the SAME "chrome Hub dungeon room" capture-interior-study.mjs already uses, cast
   ["Wolf", "Giant Rat", "Spider", "Knight"] -- "Giant Rat" (spr-fantasy-giant-rat) is one of the 252
   S2-cut faceted candidates (runtimeAdmitted:"candidate"); "Wolf" (spr-fantasy-wolf) carries NO
   candidate art (candidateAsset:null) -- the wolf/skeleton protection-set shape VQ2-RESPEC.md S5
   names explicitly, so it MUST render byte-identical in both panels. "Spider"/"Knight" are also
   uncovered (candidateAsset:null), giving 3 untouched creatures alongside the 1 flipped one in the
   SAME frame -- the honest "what actually changed" comparison.

   FACETED_FLIP_ENABLED is a real `const` (VQ2-RESPEC.md S5's own literal instruction -- the retreat
   is a SOURCE edit, not a runtime toggle: see FACETED_FLIP_ENABLED's own header comment in
   src/ui/theater-boot.js). This script proves the "OFF" panel by TEMPORARILY writing a mutated copy
   of theater-boot.js to disk (the exact `true` -> `false` substitution a hand edit would make),
   reloading the page (python's http.server has no cache -- a fresh navigation re-reads the mutated
   file), capturing, then RESTORING THE ORIGINAL BYTES in a try/finally that fires on every exit path
   (including an uncaught throw) -- the working tree is never left mutated, whether this script
   succeeds or fails.

   Run:  node dev/battle-gate/capture-s5-flip-card.mjs
   Output: dev/battle-gate/s5-flip-card/{flip-on,flip-off}.png + s5-flip-card.png + metrics.json */

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
const outDir = path.join(__dirname, "s5-flip-card");
fs.mkdirSync(outDir, { recursive: true });

// a FIFTH port range (dungeon-loop/interior-study/place-tray/stage/two-flag already claim theirs).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[s5-flip-card]", ...a); }
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

// verbatim from capture-interior-study.mjs (see that file's header for rationale).
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
      if (nameEl) nameEl.value = "S5 Flip Card Soul";
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

// the "chrome Hub dungeon room" scene, VERBATIM from capture-interior-study.mjs's SCENES[0] -- same
// topology/realm/env/lightProfile/pieces, so this card's panels are directly comparable to that
// study card's own chrome-realm shots.
const SCENE = {
  key: "chrome", label: "chrome Hub dungeon room", topology: "The Hub", realmId: "chrome", env: "dungeon",
  walkId: "s5-flip-card-chrome-hub", residents: null, lightProfile: "lamplit",
  pieces: ["Wolf", "Giant Rat", "Spider", "Knight"],
};

async function buildScene(page, cfg) {
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
  }, cfg);
}

async function mountAndCapture(page, board, shotPath) {
  const mounted = await page.evaluate((board) => {
    try {
      window.Theater.setInteriorBoard(board);
      return {
        ok: true,
        piecesResolved: window.Theater.interiorPiecesResolved(),
        piecesRequested: window.Theater.interiorPiecesRequested(),
      };
    } catch (e) { return { ok: false, error: e.message }; }
  }, board);
  if (!mounted.ok) throw new Error("setInteriorBoard failed: " + mounted.error);

  if (mounted.piecesRequested > 0) {
    const deadline = Date.now() + 4000;
    let latest = mounted;
    while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
      await sleep(200);
      latest = await page.evaluate(() => ({
        piecesResolved: window.Theater.interiorPiecesResolved(),
        piecesRequested: window.Theater.interiorPiecesRequested(),
      }));
    }
    mounted.piecesResolved = latest.piecesResolved;
  }
  await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
  await sleep(500);
  const canvasEl = await page.$(".theater-stage-canvas canvas");
  if (canvasEl) await canvasEl.screenshot({ path: shotPath });
  else await page.screenshot({ path: shotPath, fullPage: false });
  return mounted;
}

async function captureOnePanel(label, boardOverride) {
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("setInteriorBoard never became available: " + JSON.stringify(theaterState));

    const facetedFlipEnabled = await page.evaluate(() => window.Theater.facetedFlip);

    // CRITICAL for an honest "SAME scene" comparison: each fresh page load runs startBardo() ->
    // a NEW randomized character/world, and buildScene's own spatializePlan draws fresh RNG per
    // call -- two independent buildScene calls (one per panel, since each panel needs its OWN
    // page load to pick up the mutated/restored theater-boot.js) produce DIFFERENT room geometry,
    // not just different sprite art. boardOverride lets the SECOND panel skip buildScene entirely
    // and mount the EXACT board object (walls/pieces/floor, byte-for-byte via JSON round-trip)
    // captured from the FIRST panel -- isolating the ONLY thing that should differ: which asset
    // spriteTextureFor resolves for each piece.
    let board = boardOverride;
    if (!board) {
      const built = await buildScene(page, SCENE);
      if (!built.ok) throw new Error("buildScene failed: " + built.error);
      board = built.board;
    }

    const shotPath = path.join(outDir, `${label}.png`);
    const mounted = await mountAndCapture(page, board, shotPath);
    const consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    return { ok: true, label, shotPath, facetedFlipEnabled, mounted, consoleErrors, board };
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

async function main() {
  const metrics = { generatedAt: new Date().toISOString(), scene: SCENE.key, panels: {}, notes: [] };
  const bootJs = path.join(repoRoot, "src", "ui", "theater-boot.js");
  const originalSource = fs.readFileSync(bootJs, "utf-8");
  const KILLED_LINE_OLD = "const FACETED_FLIP_ENABLED = true;";
  const KILLED_LINE_NEW = "const FACETED_FLIP_ENABLED = false;";
  if (!originalSource.includes(KILLED_LINE_OLD)) {
    throw new Error("expected literal `" + KILLED_LINE_OLD + "` in src/ui/theater-boot.js -- refusing to guess at a mutation");
  }

  try {
    // ─── panel 1: flip ON (the committed default -- theater-boot.js untouched) ───────────────────
    log("capturing flip-ON panel (committed source, FACETED_FLIP_ENABLED=true)...");
    metrics.panels.flipOn = await captureOnePanel("flip-on");
    log("flip-ON done:", metrics.panels.flipOn.mounted);

    // ─── panel 2: flip OFF (temporary source mutation, restored in the finally below) ─────────────
    log("writing temporary FACETED_FLIP_ENABLED=false mutation to src/ui/theater-boot.js...");
    fs.writeFileSync(bootJs, originalSource.replace(KILLED_LINE_OLD, KILLED_LINE_NEW));
    try {
      log("capturing flip-OFF panel (mutated source, FACETED_FLIP_ENABLED=false)...");
      metrics.panels.flipOff = await captureOnePanel("flip-off", metrics.panels.flipOn.board);
      log("flip-OFF done:", metrics.panels.flipOff.mounted);
    } finally {
      log("restoring original src/ui/theater-boot.js bytes...");
      fs.writeFileSync(bootJs, originalSource);
      const restored = fs.readFileSync(bootJs, "utf-8");
      if (restored !== originalSource) throw new Error("RESTORE VERIFICATION FAILED -- theater-boot.js does not match its original bytes");
      log("restore verified byte-identical.");
    }

    if (metrics.panels.flipOn.facetedFlipEnabled !== true) metrics.notes.push("flip-ON panel: window.Theater.facetedFlip was not true");
    if (metrics.panels.flipOff.facetedFlipEnabled !== false) metrics.notes.push("flip-OFF panel: window.Theater.facetedFlip was not false (mutation didn't take)");

    // ─── side-by-side card: composite the two PNGs onto one canvas via a throwaway Chrome page ────
    const browser = await launchChrome();
    try {
      const page = await browser.newPage();
      const cellW = 760, cellH = 570, labelH = 26, pad = 8;
      const b64On = fs.readFileSync(metrics.panels.flipOn.shotPath).toString("base64");
      const b64Off = fs.readFileSync(metrics.panels.flipOff.shotPath).toString("base64");
      const sheetB64 = await page.evaluate(({ b64On, b64Off, cellW, cellH, labelH, pad }) => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = 2 * (cellW + pad) + pad;
          canvas.height = cellH + labelH + 2 * pad;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#eee"; ctx.font = "16px monospace";
          let loaded = 0;
          const draw = (b64, ci, label) => {
            const im = new Image();
            im.onload = () => {
              const x = pad + ci * (cellW + pad);
              ctx.drawImage(im, x, labelH + pad, cellW, cellH);
              ctx.fillText(label, x + 4, labelH - 4);
              loaded++;
              if (loaded === 2) resolve(canvas.toDataURL("image/png").split(",")[1]);
            };
            im.onerror = () => { loaded++; if (loaded === 2) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + b64;
          };
          draw(b64On, 0, "flip ON (candidate art, faceted-v1) -- chrome Hub room");
          draw(b64Off, 1, "flip OFF (legacy corpus, v3) -- SAME scene, SAME cast");
        });
      }, { b64On, b64Off, cellW, cellH, labelH, pad });
      const cardPath = path.join(outDir, "s5-flip-card.png");
      fs.writeFileSync(cardPath, Buffer.from(sheetB64, "base64"));
      metrics.cardPath = cardPath;
      log("wrote", cardPath);
    } finally {
      await browser.close();
    }

    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("wrote metrics.json");
  } catch (e) {
    // belt-and-suspenders: if ANY step above threw after the mutation was written but before its own
    // finally ran (shouldn't happen given the try/finally above, but never leave the tree mutated on
    // an unexpected throw), verify + force-restore here too.
    const current = fs.readFileSync(bootJs, "utf-8");
    if (current !== originalSource) {
      log("EMERGENCY RESTORE: theater-boot.js was left mutated -- restoring original bytes now.");
      fs.writeFileSync(bootJs, originalSource);
    }
    metrics.error = e.message;
    fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  }
}

main();
