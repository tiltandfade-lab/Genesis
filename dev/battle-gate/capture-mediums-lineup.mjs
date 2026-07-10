#!/usr/bin/env node
/* dev/battle-gate/capture-mediums-lineup.mjs — SCREENSHOT RIG (dev tool, no engine changes) for Adam's
   ask: render the WORST under-resolution medium creature sprites on the Genesis standing table at
   TRUE SCALE (registry scale, never overridden) so he can eyeball whether they need regeneration.

   Sibling of dev/battle-gate/capture-place-tray.mjs and dev/battle-gate/capture-stage.mjs — reuses
   those harnesses' proven server/Chrome/boot conventions verbatim (see their own header comments for
   the "why" behind each) rather than reinventing them:
     - puppeteer-core resolved via createRequire from ~/.genesis-jsdom/node_modules.
     - System Chrome at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome.
     - Serve THIS WORKTREE's root over python3 -m http.server on its own port range (never 5175 the
       live DM bridge, never 5178 model-qa, never 5181-5185/5191-5195 the other two battle-gate rigs).
     - bootToInSession — copied verbatim from capture-place-tray.mjs (itself a verbatim copy of
       capture-stage.mjs's own stager) — the SAME "choose for me" guided-creation walk a player's
       click path drives, landing in a real live session (w.sessionLive=true via startSession()).

   THE REAL ENGINE CHANNEL (not a fallback): a real `combat_start` via applyEvent (src/world/dm.js),
   the exact payload shape dev/verify-combat-lifecycle.mjs and capture-stage.mjs's own startFight()
   already prove — { type:"combat_start", payload:{ foes:[{name,statId,band}, ...] } }. Passing an
   explicit `statId` (a real BESTIARY id) short-circuits cmResolveFoe straight to cmFoeFrom(BESTIARY[
   statId], name) (src/engine/combat.js:722) so every foe resolves to the EXACT creature intended, not
   a name-text guess. theaterUnitsFrom (src/engine/theater-data.js:2071) then stamps each foe unit's
   recipeSlug = f.modelKey || f.statId — that recipeSlug is exactly the SPRITE-TRANSITION T4 join key
   theater-boot.js's spriteEntryFor() reads (normalizeSpriteKey(recipeSlug) vs normalizeSpriteKey(
   SPRITE_REGISTRY[key].name) — kebab-vs-titlecase both collapse to the same [a-z0-9] string, so a
   BESTIARY id of "giant-weasel" joins SPRITE_REGISTRY's `name:"Giant Weasel"` entry cleanly). NO size
   override is ever passed — figureFor's billboard sizes off spriteSizeScaleFor(entry.size) (medium=1x
   for every creature here, since scaleVsHuman isn't folded into the registry yet, docs/HANDOFF.md item
   2) — i.e. every sprite here renders at its REAL committed registry scale, exactly as Adam asked.

   Slug selection (mechanical, no eyeballing): filters dev/model-qa/corpus-sizing.json for
   sizeBand:"medium" family:"monsters", sorts by pxHeight ascending, takes the worst 12. Plus one
   KNOWN-GOOD medium contrast (spr-fantasy-pirate-admiral — the highest-pxHeight qaFlags-clean medium
   monster; spr-fantasy-wolf was the original suggestion but it's actually IN the worst-12 list itself,
   so pirate-admiral stands in). Plus one qaFlags-clean LARGE creature for scale contrast
   (spr-fantasy-ogre-zombie, scaleVsHuman-eligible per docs/DUNGEON-GRAPH.md's true-scale law, though
   this rig doesn't pass scaleVsHuman — it renders through the SAME legacy SRD-category ladder as
   every other piece here, size:"Large" -> 2x, for an honest apples-to-apples read).

   Run:  node dev/battle-gate/capture-mediums-lineup.mjs
   Output: dev/battle-gate/mediums-lineup/{table.png, closeup.png, manifest.json} */

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
const outDir = path.join(__dirname, "mediums-lineup");
fs.mkdirSync(outDir, { recursive: true });

// own port range: distinct from capture-stage.mjs (5181-5185), capture-place-tray.mjs (5191-5195),
// capture-interior-study.mjs (whatever it claims), 5175 (live bridge), 5178 (model-qa).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5201, 5202, 5203, 5204, 5205];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[mediums-lineup]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- the 12 worst-under-resolution medium monster sprites + 2 contrast pieces (see header) --------
const WORST_12 = [
  "giant-weasel", "giant-badger", "mastiff", "giant-frog", "panther", "larva",
  "giant-wolf-spider", "reef-shark", "gray-ooze", "blink-dog", "rust-monster", "wolf",
];
const KNOWN_GOOD_MEDIUM = "pirate-admiral";
const LARGE_CONTRAST = "ogre-zombie";
const ALL_STAT_IDS = [...WORST_12, KNOWN_GOOD_MEDIUM, LARGE_CONTRAST];

// spread across bands x lanes (4x3=12 cells) so the 14 pieces read as a legible lineup rather than
// all stacking into one occupant-ring — cycles back into the same cells for the overflow 2.
const BANDS = ["melee", "near", "far", "out"];
const LANES = ["L", "C", "R"];
function zoneFor(idx) {
  const cell = idx % (BANDS.length * LANES.length);
  return { band: BANDS[Math.floor(cell / LANES.length)], lane: LANES[cell % LANES.length] };
}

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
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1440,900"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 } });
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

// verbatim copy of capture-place-tray.mjs's bootToInSession (itself mirroring capture-stage.mjs's own
// stager) — see either file's header for the full rationale; not re-explained here to avoid drift
// risk from a third divergent copy of subtle staging logic.
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
      if (nameEl) nameEl.value = "Mediums Lineup Gate Soul";
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

// start a fight with an EXPLICIT statId per foe (bestiary id) — cmResolveFoe short-circuits straight
// to BESTIARY[statId] (src/engine/combat.js:722), never a name-text resolveCreature guess, so every
// foe is exactly the creature this rig intended. Same applyEvent/combat_start shape
// capture-stage.mjs's startFight() and dev/verify-combat-lifecycle.mjs already prove.
async function startFight(page, foesSpec) {
  return await page.evaluate((spec) => {
    try {
      const w = activeWorld();
      if (!w) return { ok: false, reason: "no-active-world" };
      const r = applyEvent(w, { type: "combat_start", payload: { foes: spec } });
      if (r && r.ok) renderWorld();
      return { ok: !!(r && r.ok), raw: r };
    } catch (e) { return { ok: false, reason: "exception", error: e.message, stack: e.stack }; }
  }, foesSpec);
}

async function waitForStageMode(page, timeoutMs) {
  const deadline = Date.now() + (timeoutMs || 20000);
  let last = null;
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => {
      const host = document.getElementById("worldView");
      return {
        hasBattleStage: !!(host && host.querySelector(".game.battle-stage")),
        theaterMounted: !!(typeof GS !== "undefined" && GS.theaterMounted),
        hasCanvas: !!(host && host.querySelector(".theater-stage-canvas canvas")),
      };
    });
    last = state;
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas) return { ready: true, state };
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return { ready: false, state: last };
}

function pngMeanLum(page, filePath) {
  const pngB64 = fs.readFileSync(filePath).toString("base64");
  return page.evaluate((b64) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = 48, h = 48;
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const cx = c.getContext("2d"); cx.drawImage(img, 0, 0, w, h);
        const d = cx.getImageData(0, 0, w, h).data;
        let sum = 0; for (let i = 0; i < d.length; i += 4) sum += (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
        resolve({ meanLum: sum / (w * h) });
      } catch (e) { resolve({ meanLum: null, error: e.message }); }
    };
    img.onerror = () => resolve({ meanLum: null, error: "img-load-failed" });
    img.src = "data:image/png;base64," + b64;
  }), pngB64);
}

async function main() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    route: "real-engine",
    routeNote: "window.Theater.setUnits/setBoard driven live via combat_start(applyEvent) + theaterUnitsFrom's real recipeSlug->SPRITE_REGISTRY join (SPRITE-TRANSITION T4) — no mock, no size override; every piece renders at its committed registry scale.",
    worstTwelve: [], knownGoodMedium: null, largeContrast: null,
    notes: [],
  };
  // fold in corpus-sizing.json pxHeights for the manifest (source of truth for the selection).
  const sizing = JSON.parse(fs.readFileSync(path.join(repoRoot, "dev/model-qa/corpus-sizing.json"), "utf8"));
  const sizingFor = (statId) => sizing["spr-fantasy-" + statId] || null;
  manifest.worstTwelve = WORST_12.map((id) => ({ statId: id, slug: "spr-fantasy-" + id, ...sizingFor(id) }));
  manifest.knownGoodMedium = { statId: KNOWN_GOOD_MEDIUM, slug: "spr-fantasy-" + KNOWN_GOOD_MEDIUM, ...sizingFor(KNOWN_GOOD_MEDIUM) };
  manifest.largeContrast = { statId: LARGE_CONTRAST, slug: "spr-fantasy-" + LARGE_CONTRAST, ...sizingFor(LARGE_CONTRAST) };

  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);

    const boot = await bootToInSession(page);
    manifest.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const foesSpec = ALL_STAT_IDS.map((statId, i) => {
      const { band, lane } = zoneFor(i);
      return { statId, name: statId.replace(/-/g, " "), band, lane };
    });
    const fight = await startFight(page, foesSpec);
    manifest.fight = fight;
    if (!fight.ok) throw new Error("combat_start failed: " + JSON.stringify(fight));

    const stage = await waitForStageMode(page, 20000);
    manifest.stage = stage;
    if (!stage.ready) manifest.notes.push("stage mode never fully reported ready — proceeding with a best-effort shot anyway");

    // let sprite textures (async THREE.TextureLoader.load, one fetch per distinct slug) resolve and the
    // GL frame actually paint — spriteTextureFor's own onSettled replay handles late arrivals, but this
    // rig wants every billboard loaded BEFORE the shot, not a mid-pop-in frame.
    await sleep(3000);
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(700);

    // which foes actually resolved to a real sprite billboard vs fell through to the 3D cuboid chain —
    // read straight off spriteTextureFor's own diagnostic cache (window.Theater._spriteTextureCache,
    // keyed by sprite slug: a loaded THREE.Texture object means that slug's billboard is live; "failed"
    // means the PNG 404'd; "pending"/absent means it never got requested at all (the join itself
    // missed) — the most honest possible check, since it's the SAME cache figureFor's billboard path
    // reads, not a re-derivation of the join logic here.
    const resolvedSprites = await page.evaluate((slugs) => {
      try {
        const cache = window.Theater && window.Theater._spriteTextureCache;
        if (!cache) return { ok: false, reason: "no-sprite-texture-cache" };
        const byCase = {};
        slugs.forEach((slug) => {
          const v = cache[slug];
          byCase[slug] = v === "failed" ? "failed" : v === "pending" ? "pending" : v ? "loaded" : "not-requested";
        });
        return { ok: true, byCase };
      } catch (e) { return { ok: false, error: e.message }; }
    }, ALL_STAT_IDS.map((id) => "spr-fantasy-" + id));
    manifest.resolvedSpritesProbe = resolvedSprites;

    const consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    manifest.consoleErrors = consoleErrors;
    manifest.consoleErrorsCount = consoleErrors.length;

    // FULL-TABLE shot — the whole theater canvas.
    const tablePath = path.join(outDir, "table.png");
    const canvasSel = ".theater-stage-canvas canvas";
    const canvasEl = await page.$(canvasSel);
    manifest.canvasFound = !!canvasEl;
    if (canvasEl) {
      await canvasEl.screenshot({ path: tablePath });
    } else {
      await page.screenshot({ path: tablePath, fullPage: false });
      manifest.notes.push("no theater canvas found for table.png — captured full page instead");
    }
    manifest.tableMeanLum = (await pngMeanLum(page, tablePath)).meanLum;

    // CLOSE-UP shot: zoom the theater camera in on the lineup before the second capture (Theater's own
    // zoom verb — theater-boot.js's public accessor — mirrors what a player's scroll/pinch drives).
    // zoom() steps 1.25x per call (theater-boot.js header) — several calls to get a real close-up,
    // not a barely-perceptible single step.
    const zoomResult = await page.evaluate(() => {
      try {
        if (!(window.Theater && typeof window.Theater.zoom === "function")) return { ok: false, reason: "no-zoom-verb" };
        let last = null;
        for (let i = 0; i < 5; i++) last = window.Theater.zoom(1);
        return { ok: true, via: "Theater.zoom", steps: 5, finalZoomLevel: last };
      } catch (e) { return { ok: false, error: e.message }; }
    });
    manifest.zoomResult = zoomResult;
    await sleep(500);
    const closeupPath = path.join(outDir, "closeup.png");
    const canvasEl2 = await page.$(canvasSel);
    if (canvasEl2) {
      await canvasEl2.screenshot({ path: closeupPath });
    } else {
      await page.screenshot({ path: closeupPath, fullPage: false });
      manifest.notes.push("no theater canvas found for closeup.png — captured full page instead");
    }
    manifest.closeupMeanLum = (await pngMeanLum(page, closeupPath)).meanLum;

    fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    log("wrote table.png, closeup.png, manifest.json to", outDir);
    log(JSON.stringify({ boot: manifest.boot.ok, fight: manifest.fight.ok, stageReady: manifest.stage.ready, consoleErrorsCount: manifest.consoleErrorsCount, tableMeanLum: manifest.tableMeanLum }, null, 2));
  } catch (e) {
    manifest.error = e.message;
    fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
