#!/usr/bin/env node
/* dev/battle-gate/capture-env2-biomes.mjs — ENV-2 (docs/ENV-EXTERIOR-WAVE.md) CARD: 3 different
   biomes x daylit/moonlit, same camera. Mirrors dev/play-lens.mjs's puppeteer boot/mount pattern
   (bootToInSession, launchChrome, real production seams) — never a hand-built board fixture, a REAL
   rolled+mounted wilderness travel walk each shot.

   ENV-1 NOTE (read before judging these frames): ENV-1 (docs/ENV-EXTERIOR-WAVE.md, a PARALLEL unit,
   branch feat/env1-light-profiles) owns making daylit/moonlit/overcast visually distinct on tabletop/
   travel trays — it had not landed in this worktree as of this capture. Confirmed live (this unit's
   own session): forcing segment.light.profile between "daylit"/"moonlit" on this tray produces
   visually indistinguishable renders (same dark/torchlit-style void+floor read) today. Per the ENV-2
   task brief's own allowance ("if profiles don't differentiate yet in your worktree, shoot under the
   current profile and say so") — this script still SHOOTS both forced profiles per biome (6 frames
   total) so the pairs are directly comparable once ENV-1 lands, but the biome-scatter/ground-tint
   comparison is the one these frames actually prove today.

   Run:   node dev/battle-gate/capture-env2-biomes.mjs
   Output: dev/battle-gate/env2-biomes/env2-<biome>-<profile>.png */
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
const outDir = path.join(__dirname, "env2-biomes");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = [5261, 5262, 5263, 5264, 5265]; // a NEW range — see play-lens.mjs's own port-range roster comment
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[env2-biomes]", ...a); }
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

// verbatim (near-identical) to dev/play-lens.mjs's own bootToInSession — the proven TIYL/bardo
// autofill. Reused rather than re-invented; trimmed of play-lens' own notes-array bookkeeping since
// this script only needs the boolean/worldId result.
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
      if (nameEl) nameEl.value = "ENV2 Capture Bot";
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

// mints + mounts a real rolled wilderness TRAVEL walk pinned to ONE biome (TRAVEL-WALKS.md §3's
// opts.biomes override — the SAME real production roller/mount seam my diagnostic session used to
// find the PC-mount bug, and dev/verify-env2-travel.mjs uses to test it), then forces this leg's own
// rolled light.profile to the requested value (a pure data poke, mirroring how ENV-1's own gate would
// force a profile for its A/B comparison — no engine call exists yet to pick a profile deliberately).
async function mountBiomeLeg(page, biome, profile) {
  return await page.evaluate((biome, profile) => {
    const w = activeWorld();
    // a walk from the PREVIOUS shot is still active — walk_complete it (production's own arrival
    // seam, prep.js) before minting the next one; travel_start refuses a second concurrent walk.
    const P0 = prepOf(w);
    if (P0.activeWalkId) applyEvent(w, { type: "walk_complete", payload: { nodeId: P0.activeWalkId } });
    // a unique name per shot (biome+profile+a counter) — addNode dedupes by name, and re-targeting
    // the SAME name we just walk_complete'd into would make travel_start see "already-there".
    w.__env2Shot = (w.__env2Shot || 0) + 1;
    const nodeId = addNode(w, "ENV2 " + biome + " " + profile + " " + w.__env2Shot, "Place");
    const r = applyEvent(w, { type: "travel_start", payload: { toNodeId: nodeId } });
    if (!r || r.ok !== true) return { ok: false, stage: "travel_start-failed", detail: r };
    // force this leg's own rolled biome + light profile — a controlled shot, not a random one.
    const P = prepOf(w);
    const pn = P.nodes[P.activeWalkId];
    const seg = pn.walk.segments.find((s) => s.num === (pn.cursor && pn.cursor.current || 1));
    seg.biome = biome;
    if (seg.light) seg.light.profile = profile;
    renderWorld();
    return { ok: true, biome: seg.biome, profile: seg.light && seg.light.profile };
  }, biome, profile);
}

(async () => {
  const { proc } = await startServer();
  const browser = await launchChrome();
  try {
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    const boot = await bootToInSession(page);
    if (!boot.ok) { log("BOOT FAILED:", JSON.stringify(boot)); process.exitCode = 1; return; }
    log("booted:", boot.worldId);
    const theaterState = await waitForTheater(page);
    log("theater state:", JSON.stringify(theaterState));
    if (!theaterState.hasCanvas) { log("no WebGL canvas — aborting capture"); process.exitCode = 1; return; }

    const BIOMES = ["Forest", "Desert", "Swamp"];
    const PROFILES = ["daylit", "moonlit"];
    const results = [];
    for (const biome of BIOMES) {
      for (const profile of PROFILES) {
        const mounted = await mountBiomeLeg(page, biome, profile);
        if (!mounted.ok) { log("MOUNT FAILED", biome, profile, JSON.stringify(mounted)); continue; }
        await sleep(1500); // let the async texture loads (dressingTextureFor's placeholder-then-real swap + its own setBoard replay) settle
        await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
        await sleep(400);
        const fileName = `env2-${biome.toLowerCase()}-${profile}.png`;
        const filePath = path.join(outDir, fileName);
        await page.screenshot({ path: filePath });
        log(`captured ${fileName} (biome=${mounted.biome} profile=${mounted.profile})`);
        results.push({ biome, profile, fileName, mounted });
      }
    }
    fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({ results }, null, 2));
    log(`done — ${results.length}/${BIOMES.length * PROFILES.length} frames captured`);
  } finally {
    await browser.close();
    if (proc) proc.kill("SIGTERM");
  }
})();
