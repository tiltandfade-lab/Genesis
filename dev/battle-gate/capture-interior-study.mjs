#!/usr/bin/env node
/* dev/battle-gate/capture-interior-study.mjs — DUNGEON-GRAPH.md U3's REQUIRED render-quality STUDY
   CARD (the taste gate): renders the SAME two seeded scenes — a chrome Hub dungeon room and a gloom
   Spine crypt room — under 6 render variants each ((a) flat baseline, (b) +baked-AO-approximation at
   wall-floor seams, (c) +banded/quantized lighting, (d) +realm-tinted fog, (e) AO+banded,
   (f) AO+banded+fog), and writes labeled PNGs + a combined contact sheet for Adam's eyeball gate
   (docs/DUNGEON-GRAPH.md "Open for Adam" item 1).

   Sibling of dev/battle-gate/capture-place-tray.mjs — reuses that script's proven server/Chrome/boot
   conventions VERBATIM (see its own header comment for the "why" behind each) rather than
   reinventing them. Trimmed/extended to this unit's own scope: boot into a real session
   (bootToInSession), build two deterministic SpatialPlans directly via the app's own real global
   functions (spatializePlan/semanticizePlan/interiorBuildBoard — no mocks), push each through
   window.Theater.setInteriorBoard, sweep window.Theater.setInteriorVariant across the 6 combos, and
   screenshot each of the resulting 12 frames. Honest pixels: no cherry-picking — every variant that
   renders gets captured and included in the contact sheet, pass or fail.

   Run:  node dev/battle-gate/capture-interior-study.mjs
   Output: dev/battle-gate/interior-study/{chrome,gloom}-{a..f}-*.png + study-card.png + metrics.json */

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

async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1280,800"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 1 } });
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
async function buildScene(page, { topology, realmId, env, walkId, residents }) {
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
      const focusSegNum = semPlan.rooms[0].segNum;
      const board = interiorBuildBoard(semPlan, { realmId: cfg.realmId, env: cfg.env, focusSegNum, radius: 2 });
      return { ok: true, board, meta: board.meta };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, { topology, realmId, env, walkId, residents });
}

const VARIANTS = [
  { key: "a-flat", label: "(a) flat baseline", flags: { ao: false, banded: false, fog: false } },
  { key: "b-ao", label: "(b) +baked AO at wall-floor seams", flags: { ao: true, banded: false, fog: false } },
  { key: "c-banded", label: "(c) +banded/quantized lighting", flags: { ao: false, banded: true, fog: false } },
  { key: "d-fog", label: "(d) +realm-tinted fog", flags: { ao: false, banded: false, fog: true } },
  { key: "e-ao-banded", label: "(e) AO+banded", flags: { ao: true, banded: true, fog: false } },
  { key: "f-ao-banded-fog", label: "(f) AO+banded+fog", flags: { ao: true, banded: true, fog: true } },
];

const SCENES = [
  { key: "chrome", label: "chrome Hub dungeon room", topology: "The Hub", realmId: "chrome", env: "dungeon", walkId: "interior-study-chrome-hub", residents: null },
  { key: "gloom", label: "gloom Spine crypt room", topology: "The Spine", realmId: "gloom", env: "dungeon", walkId: "interior-study-gloom-spine", residents: [{ segNum: 1, scaleVsHuman: 2.5, apex: false }] },
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
        try { window.Theater.setInteriorBoard(board); return { ok: true, meshCount: window.Theater.interiorMeshCount() }; }
        catch (e) { return { ok: false, error: e.message }; }
      }, built.board);
      metrics.scenes[scene.key].mounted = mounted;
      if (!mounted.ok) { metrics.notes.push(`scene ${scene.key} setInteriorBoard FAILED: ${mounted.error}`); continue; }

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
