#!/usr/bin/env node
/* dev/battle-gate/capture-env3-town.mjs — ENV-3 (docs/ENV-EXTERIOR-WAVE.md) CARD: one town,
   daylit + moonlit + overcast, same camera — "does Genesis have a town now?" Mirrors dev/battle-gate/
   capture-env2-biomes.mjs's puppeteer boot/mount pattern (bootToInSession, launchChrome, real
   production seams) — never a hand-built board fixture, the REAL origin/start town a fresh world
   always has.

   Run:   node dev/battle-gate/capture-env3-town.mjs
   Output: dev/battle-gate/env3-town/env3-town-<profile>.png */
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
const outDir = path.join(__dirname, "env3-town");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = [5271, 5272, 5273, 5274, 5275]; // a NEW range — see play-lens.mjs's own port-range roster comment
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[env3-town]", ...a); }
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

const SHOT_W = 1600, SHOT_H = 1000;
async function launchChrome() {
  const argv = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args: argv, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}

// verbatim (near-identical) to dev/play-lens.mjs's/capture-env2-biomes.mjs's own bootToInSession — the
// proven TIYL/bardo autofill. Reused rather than re-invented.
async function bootToInSession(page) {
  return await page.evaluate(() => {
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
        } catch (e) {}
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
      if (nameEl) nameEl.value = "ENV3 Capture Bot";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found" };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found" };
      if (typeof startSession === "function") { startSession(world.id); }
      showTab("world");
      return { ok: true, worldId: world.id };
    } catch (e) { return { ok: false, stage: "exception", error: e.message }; }
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
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

// mounts the REAL origin/start-town settlement tray (ENV-3's own routing — theaterHereSourceFor at the
// origin node, no active walk), then forces THIS shot's light profile — a controlled A/B/C, not a
// random roll (mirrors capture-env2-biomes.mjs's own seg.light.profile poke, one level up: the
// settlement board's `light.profile` field, not a walk segment's).
async function mountTownShot(page, profile) {
  return await page.evaluate((profile) => {
    try {
      const w = activeWorld();
      const P = prepOf(w);
      if (P.activeWalkId) applyEvent(w, { type: "walk_complete", payload: { nodeId: P.activeWalkId } });
      w.currentNodeId = w.startNodeId; // stand at the origin settlement — always settlement-kind (ENV-3)
      const hereSource = theaterHereSourceFor(w);
      if (hereSource.kind !== "settlement") return { ok: false, stage: "not-settlement-kind", hereSource };
      let board = trayFrom(hereSource, null, { env: hereSource.env, realms: hereSource.realms, walkId: hereSource.walkId });
      board = Object.assign({}, board, { light: Object.assign({}, board.light, { profile: profile }) });
      window.Theater.setBoard(board);
      const castSource = theaterCastSourceFor(w, hereSource);
      castSource.boardCenter = theaterBoardCenterFor(board);
      window.Theater.setUnits({ units: castFrom(w, castSource) });
      return {
        ok: true, buildings: (board.buildings || []).length,
        streetTiles: (board.tiles || []).filter(t => t.kind === "floor" && t.material === "cobble").length,
        props: (board.props || []).length, tiles: (board.tiles || []).length,
        realmId: board.realmId, profile: board.light && board.light.profile,
      };
    } catch (e) { return { ok: false, stage: "exception", error: e.message, stack: e.stack }; }
  }, profile);
}

(async () => {
  const { proc } = await startServer();
  const browser = await launchChrome();
  try {
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    // ENV-3b (docs/ENV-EXTERIOR-WAVE.md composition-fix wave) ruling 4: an ambient toast ("Bizarre...",
    // src/ui/chrome.js's toast()) can fire mid-capture and land squarely in frame (the gate's own
    // "an ambient toast renders mid-frame" failure) — suppress it BEFORE bootToInSession runs any world
    // logic that might trigger one, same mechanism dev/battle-gate/capture-interior-study.mjs already
    // uses for the identical class of bug (its own addStyleTag call, verbatim selector list).
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    const boot = await bootToInSession(page);
    if (!boot.ok) { log("BOOT FAILED:", JSON.stringify(boot)); process.exitCode = 1; return; }
    log("booted:", boot.worldId);
    const theaterState = await waitForTheater(page);
    log("theater state:", JSON.stringify(theaterState));
    if (!theaterState.hasCanvas) { log("no WebGL canvas — aborting capture"); process.exitCode = 1; return; }

    const PROFILES = ["daylit", "moonlit", "overcast"];
    const results = [];
    for (const profile of PROFILES) {
      const mounted = await mountTownShot(page, profile);
      if (!mounted.ok) { log("MOUNT FAILED", profile, JSON.stringify(mounted)); continue; }
      // NOTE: deliberately NOT calling renderWorld() here (unlike capture-env2-biomes.mjs) — the
      // settlement board ROLLS its own light profile deterministically off the node id
      // (theaterRollLight, theater-data.js), so a real production re-render would re-derive the SAME
      // rolled profile and stomp mountTownShot's own forced `board.light.profile` override before the
      // shot. window.Theater.setBoard/setUnits (called inside mountTownShot) already render the frame.
      await sleep(1500); // let the async texture/dressing-card loads settle
      const fileName = `env3-town-${profile}.png`;
      const filePath = path.join(outDir, fileName);
      await page.screenshot({ path: filePath });
      log(`captured ${fileName}`, JSON.stringify(mounted));
      results.push({ profile, fileName, mounted });
    }
    fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({ results }, null, 2));
    log(`done — ${results.length}/${PROFILES.length} frames captured`);
  } finally {
    await browser.close();
    if (proc) proc.kill("SIGTERM");
  }
})();
