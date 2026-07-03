#!/usr/bin/env node
/* dev/model-qa/capture.mjs — the headless capture driver for the MODEL-QA blind-recognition rig
   (docs/MODEL-GRAMMAR.md §7b step 1: "a stager drives the preview page's lineup fixture and
   captures one PNG per recipe").

   WHAT IT DOES
     1. Serves the repo worktree over http://127.0.0.1:5178 (a fresh `python3 -m http.server`,
        NOT 5175 — a live DM bridge may be there; this driver never touches 5175 or the .dm/ dir).
     2. Launches SYSTEM Chrome via puppeteer-core (no bundled Chromium download) at
        /Applications/Google Chrome.app/Contents/MacOS/Google Chrome.
     3. Drives dev/model-lineup.html in each mode and screenshots at deviceScaleFactor 2 (so a
        ~150px grid cell reads crisply):
          (a) BLIND sheets 1-4 over the top-100  -> round1/sheet-{1..4}.png
          (b) the SAME sheets, name-labeled      -> round1/named-{1..4}.png
          (c) GRIP closeups (9 archetypes + 3 PC loadouts) -> round1/grip-*.png
          (d) round1/key.json  — every sheet+cell -> {slug,name}, harvested from the page's own
              window.__rigKeyMap (so the key can never drift from what was actually rendered).
     4. WebGL-in-headless handling: tries Chrome's default "new" headless first; if the first sheet
        comes back blank (a near-empty canvas — SwiftShader/ANGLE not kicking in), it RELAUNCHES with
        --use-angle=swiftshader and starts over. A blank-canvas heuristic (mean luminance + the page's
        own consoleErrors count + the rig-status data-ready flag) decides.

   RUN (from the repo root):
       node dev/model-qa/capture.mjs
   Options (env):
       QA_PORT=5178          override the serve port
       QA_SHEETS=1,2,3,4     which sheets to capture (default 1-4)
       QA_KEEP_SERVER=1      leave the http.server running after (default: kill it)
       QA_ANGLE=1            force --use-angle=swiftshader on the FIRST launch (skip the probe)
*/

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// puppeteer-core lives in the repo's dev-dep scratch dir (~/.genesis-jsdom), per CLAUDE.md's
// "npm i <dep> in a scratch dir" convention — resolve it from there, not from the repo.
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(__dirname, "round1");
fs.mkdirSync(outDir, { recursive: true });

const PORT = parseInt(process.env.QA_PORT || "5178", 10);
const BASE = `http://127.0.0.1:${PORT}`;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHEETS = (process.env.QA_SHEETS || "1,2,3,4").split(",").map(s => parseInt(s, 10)).filter(Boolean);
const GRIP_KEYS = [
  // 9 fixed archetypes
  "biped", "quadruped", "flyer", "serpent", "swarm", "giant", "ooze", "arachnid", "amorphous-horror",
  // 3 PC loadout fixtures (real loadout-mirror path)
  "fighter-greatsword", "ranger-bow", "wizard-staff"
];

function log(...a){ console.log("[capture]", ...a); }

// ---- tiny static server (spawn python3 http.server, bound to 127.0.0.1) ------------------------
function portInUse(port){
  return new Promise(resolve => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}

async function startServer(){
  if(await portInUse(PORT)){
    // reuse whatever is already serving the repo on this port (idempotent re-runs)
    log(`port ${PORT} already serving — reusing it`);
    return { proc: null, reused: true };
  }
  log(`starting python3 -m http.server ${PORT} (bind 127.0.0.1) in ${repoRoot}`);
  const proc = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], {
    cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"]
  });
  // wait for it to accept connections
  for(let i=0;i<40;i++){
    if(await portInUse(PORT)) return { proc, reused: false };
    await sleep(150);
  }
  throw new Error(`http.server on ${PORT} never came up`);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- blank-canvas heuristic: sample the page's own scratch canvas / a grid cell's pixels --------
// returns { ready:bool, errors:int, meanLum:number|null }
async function pageHealth(page){
  return await page.evaluate(() => {
    const status = document.getElementById("rig-status");
    const ready = status ? status.hasAttribute("data-ready") : false;
    const errored = status ? status.hasAttribute("data-error") : false;
    const errors = (typeof window.__rigErrors === "function") ? window.__rigErrors() : -1;
    // sample the first grid cell's <img> (grid mode) OR a solo/grip stage canvas: draw onto a small
    // offscreen canvas and average luminance. A near-zero mean over a black background with a figure
    // means "nothing drew" (all void); a real figure lifts the mean above the pure-void floor.
    let meanLum = null;
    try{
      const src = document.querySelector(".cell .shot") || document.querySelector(".solo-stage canvas") || document.querySelector(".solo-stage img");
      if(src){
        const w = 48, h = 48;
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        const cx = c.getContext("2d");
        cx.drawImage(src, 0, 0, w, h);
        const d = cx.getImageData(0, 0, w, h).data;
        let sum = 0;
        for(let i=0;i<d.length;i+=4){ sum += (d[i]*0.299 + d[i+1]*0.587 + d[i+2]*0.114); }
        meanLum = sum / (w*h);
      }
    }catch(e){ /* cross-origin taint shouldn't happen (same-origin data-URL), but guard anyway */ }
    return { ready, errored, errors, meanLum };
  });
}

// ---- wait until the rig reports ready (data-ready on #rig-status) -------------------------------
async function waitReady(page, label, timeoutMs){
  const deadline = Date.now() + (timeoutMs || 60000);
  while(Date.now() < deadline){
    const h = await pageHealth(page);
    if(h.errored) throw new Error(`rig reported an error on ${label} (consoleErrors=${h.errors})`);
    if(h.ready) return h;
    await sleep(200);
  }
  throw new Error(`timed out waiting for ${label} to be ready`);
}

async function launchChrome(useAngle){
  const args = [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--use-gl=angle",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--window-size=1280,1280"
  ];
  if(useAngle) args.push("--use-angle=swiftshader");
  log(`launching Chrome${useAngle ? " with --use-angle=swiftshader" : " (default ANGLE)"}`);
  return await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args,
    defaultViewport: { width: 1220, height: 1220, deviceScaleFactor: 2 }
  });
}

async function newPage(browser){
  const page = await browser.newPage();
  page.on("pageerror", e => log("PAGE ERROR:", e.message));
  page.on("console", msg => { if(msg.type() === "error") log("page console.error:", msg.text().slice(0, 200)); });
  return page;
}

// capture one grid sheet; returns { keyMap, health }
async function captureSheet(browser, sheet, named, outFile){
  const page = await newPage(browser);
  const url = `${BASE}/dev/model-lineup.html?sheet=${sheet}&per=25&set=top100${named ? "&named=1" : ""}`;
  log(`  -> ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const health = await waitReady(page, `sheet ${sheet}${named ? " (named)" : " (blind)"}`, 90000);
  // small settle so the last cell's data-URL paints into its <img>
  await sleep(300);
  const grid = await page.$("#rig-body");
  // screenshot the grid area only (tighter, no page chrome) — fall back to full page if absent
  if(grid){ await grid.screenshot({ path: outFile }); }
  else { await page.screenshot({ path: outFile, fullPage: true }); }
  const keyMap = await page.evaluate(() => window.__rigKeyMap || []);
  await page.close();
  return { keyMap, health };
}

async function captureGrip(browser, key, outFile){
  const page = await newPage(browser);
  const url = `${BASE}/dev/model-lineup.html?grip=${encodeURIComponent(key)}`;
  log(`  -> ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const health = await waitReady(page, `grip ${key}`, 60000);
  await sleep(300);
  const grip = await page.$("#rig-body");
  if(grip){ await grip.screenshot({ path: outFile }); }
  else { await page.screenshot({ path: outFile, fullPage: true }); }
  await page.close();
  return health;
}

// decide whether a health reading looks "blank" (WebGL didn't render)
function looksBlank(health){
  // meanLum over the void floor: a pure-void 48x48 sample of the dungeon palette (~#0a0807) is ~9;
  // a real lit figure + ground patch lifts the mean well above ~18. Treat < 14 as suspiciously blank.
  if(health.meanLum == null) return true;
  return health.meanLum < 14;
}

async function main(){
  const server = await startServer();
  let browser = null;
  const cleanup = async () => {
    try{ if(browser) await browser.close(); }catch(e){}
    if(server.proc && !process.env.QA_KEEP_SERVER){ try{ server.proc.kill("SIGTERM"); }catch(e){} }
  };
  process.on("SIGINT", async () => { await cleanup(); process.exit(130); });

  try{
    let useAngle = process.env.QA_ANGLE === "1";
    browser = await launchChrome(useAngle);

    // ---- PROBE: capture blind sheet 1 first; if blank, relaunch with SwiftShader and retry once ----
    const probeFile = path.join(outDir, "sheet-1.png");
    let probe = await captureSheet(browser, SHEETS[0], false, probeFile);
    if(looksBlank(probe.health) && !useAngle){
      log(`sheet ${SHEETS[0]} looks blank (meanLum=${probe.health.meanLum}); relaunching with --use-angle=swiftshader`);
      await browser.close();
      useAngle = true;
      browser = await launchChrome(true);
      probe = await captureSheet(browser, SHEETS[0], false, probeFile);
      if(looksBlank(probe.health)){
        log(`WARNING: sheet ${SHEETS[0]} STILL looks blank after SwiftShader (meanLum=${probe.health.meanLum}). Continuing anyway — inspect the PNG.`);
      }
    }
    log(`probe meanLum=${probe.health.meanLum}, angle=${useAngle}`);

    // ---- (a) BLIND sheets (sheet 1 already captured above as the probe) --------------------------
    const keyRows = [];
    keyRows.push(...probe.keyMap);
    for(const sheet of SHEETS.slice(1)){
      const f = path.join(outDir, `sheet-${sheet}.png`);
      const r = await captureSheet(browser, sheet, false, f);
      keyRows.push(...r.keyMap);
      log(`  blind sheet ${sheet} -> ${path.relative(repoRoot, f)} (meanLum=${r.health.meanLum})`);
    }

    // ---- (b) NAMED sheets ------------------------------------------------------------------------
    for(const sheet of SHEETS){
      const f = path.join(outDir, `named-${sheet}.png`);
      const r = await captureSheet(browser, sheet, true, f);
      log(`  named sheet ${sheet} -> ${path.relative(repoRoot, f)} (meanLum=${r.health.meanLum})`);
    }

    // ---- (c) GRIP closeups -----------------------------------------------------------------------
    for(const key of GRIP_KEYS){
      const f = path.join(outDir, `grip-${key}.png`);
      const h = await captureGrip(browser, key, f);
      log(`  grip ${key} -> ${path.relative(repoRoot, f)} (meanLum=${h.meanLum})`);
    }

    // ---- (d) key.json ----------------------------------------------------------------------------
    // dedupe/normalize: keyRows may re-include sheet 1 from the probe once — collapse by (sheet,cell)
    const bySheet = {};
    for(const row of keyRows){
      const k = `${row.sheet}:${row.cell}`;
      bySheet[k] = row;
    }
    const keyOut = {
      _comment: "MODEL-QA blind-recognition key (docs/MODEL-GRAMMAR.md §7b). Maps every captured "
        + "sheet+cell to the creature actually rendered there. GENERATED by dev/model-qa/capture.mjs "
        + "from the page's own window.__rigKeyMap (so it can never drift from what was rendered). "
        + "A blind judge answers 'what creature is each cell?' WITHOUT this file; score their answers "
        + "against it (exact / family / miss).",
      base: "http://127.0.0.1:<port>/dev/model-lineup.html",
      angle: useAngle ? "swiftshader" : "default-angle",
      sheets: SHEETS,
      cells: Object.values(bySheet).sort((a,b) => a.sheet - b.sheet || (a.cell < b.cell ? -1 : 1))
    };
    const keyPath = path.join(outDir, "key.json");
    fs.writeFileSync(keyPath, JSON.stringify(keyOut, null, 2) + "\n");
    log(`wrote ${path.relative(repoRoot, keyPath)} (${keyOut.cells.length} cells)`);

    // ---- summary ----------------------------------------------------------------------------------
    const pngs = fs.readdirSync(outDir).filter(f => f.endsWith(".png"));
    log(`DONE — ${pngs.length} PNGs in ${path.relative(repoRoot, outDir)}/`);
    const sizes = pngs.map(f => { const s = fs.statSync(path.join(outDir, f)).size; return `${f} ${(s/1024).toFixed(0)}KB`; });
    sizes.sort();
    sizes.forEach(s => log("   " + s));
  } finally {
    await cleanup();
  }
}

main().catch(async e => {
  console.error("[capture] FAILED:", e.stack || e.message);
  process.exit(1);
});
