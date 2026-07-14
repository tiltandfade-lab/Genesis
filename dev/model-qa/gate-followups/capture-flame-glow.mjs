#!/usr/bin/env node
/* dev/model-qa/gate-followups/capture-flame-glow.mjs — FLAME-GLOW FOLLOW-UP (2026-07-04, Adam: "the
   material on the flame still reads flat, it should be glowing/bright vs a flat orange texture,
   probably with some opacity as well") capture proof: additive-transparent glow bucket
   (wholeObjectMaterialsFor's slot 3 in src/ui/theater-boot.js) vs the prior flat-unlit-only glow.

   Captures FOUR fixtures, each requiring the server currently running to be serving the BEFORE or
   AFTER material code (this script does not swap code itself — run it twice, once per state, per
   the runbook below):
     1. flame-glow-{state}-torchlit-scene.png   — theater-preview.html "wholeobject" fixture, light
        profile "torchlit" (the torch prop mounts via mountLightProp -> "light:torchlit" -> buildTorch,
        exactly the D-scene fixture the original capture-gate before/after used).
     2. flame-glow-{state}-candelabra.png       — "props" fixture with cover text overridden to
        "a candelabra with three candles" so theaterPropForText resolves "prop:candelabra"
        (src/engine/theater-data.js's candelabra/brazier-stand/torch-sconce rule), light "torchlit".
     3. flame-glow-{state}-lantern-post.png     — "wholeobject" fixture, light profile "lamplit" (->
        "light:lamplit" -> buildLanternPost).

   Run (repo served on PORT arg, default 5187):
     node dev/model-qa/gate-followups/capture-flame-glow.mjs before   (with the OLD material code live)
     node dev/model-qa/gate-followups/capture-flame-glow.mjs after    (with the NEW material code live)
*/
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;

const PORT = process.env.PORT || 5187;
const BASE = "http://127.0.0.1:" + PORT;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const STATE = (process.argv[2] === "before") ? "before" : "after";

function log(...a){ console.log("[capture-flame-glow]", ...a); }

async function newPage(browser){
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 760, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (msg) => { if(msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  return { page, errors };
}

async function gotoPreview(page){
  await page.goto(BASE + "/dev/theater-preview.html", { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForFunction(() => !!window.Theater, { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600)); // let loadWholeObjectBuilders settle
}

// the "wholeobject" fixture's single-tile board inherits DEFAULT_FIGURE_ZOOM_STEPS=3 (theater-boot.js)
// -- a tight figure-emphasis zoom that crops the light-prop (mounted on a neighboring tile, its flame
// head above the PC's own height) out of frame entirely. Zoom OUT to see prop + flame together, same
// remedy capture-adjacency.mjs uses for its own 2-unit board.
const ZOOM_OUT_CLICKS = 4;
async function zoomOut(page){
  for(let i = 0; i < ZOOM_OUT_CLICKS; i++){
    await page.click("#zoomOutBtn").catch(() => {});
    await new Promise((r) => setTimeout(r, 80));
  }
}

async function captureTorchScene(browser){
  const { page, errors } = await newPage(browser);
  await gotoPreview(page);
  await page.click('button[data-fixture="wholeobject"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('button[data-light="torchlit"]');
  await new Promise((r) => setTimeout(r, 500));
  await zoomOut(page);
  await new Promise((r) => setTimeout(r, 300));
  const stageEl = await page.$("#stage");
  const outPath = path.join(outDir, `flame-glow-${STATE}-torchlit-scene.png`);
  await (stageEl || page).screenshot({ path: outPath });
  log("captured ->", outPath, "| console errors:", errors.length, errors.slice(0, 5));
  await page.close();
}

async function captureLanternPost(browser){
  const { page, errors } = await newPage(browser);
  await gotoPreview(page);
  await page.click('button[data-fixture="wholeobject"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('button[data-light="lamplit"]');
  await new Promise((r) => setTimeout(r, 500));
  await zoomOut(page);
  await new Promise((r) => setTimeout(r, 300));
  const stageEl = await page.$("#stage");
  const outPath = path.join(outDir, `flame-glow-${STATE}-lantern-post.png`);
  await (stageEl || page).screenshot({ path: outPath });
  log("captured ->", outPath, "| console errors:", errors.length, errors.slice(0, 5));
  await page.close();
}

async function captureCandelabra(browser){
  const { page, errors } = await newPage(browser);
  await gotoPreview(page);
  // theater-preview.html's own FIXTURES/renderFixture are closure-private (IIFE-wrapped inline
  // <script>, not reachable from outside) — but theaterBoardFrom/theaterUnitsFrom (src/engine/
  // theater-data.js) and window.Theater (src/ui/theater-boot.js) are both real globals, so build
  // the candelabra board directly off the SAME functions the preview page's renderFixture() uses,
  // with cover text that trips theater-data.js's /candelabra|brazier.?stand|torch.?sconce/i rule
  // (part "candelabra" -> theater-figures.js "prop:candelabra") plus a torchlit light override so
  // the candelabra's own flame tufts render lit and warm, matching the other two captures' mood.
  await page.evaluate(() => {
    // mirrors theater-preview.html's own "wholeobject" fixture shape (single-zone 20'x20' board, one
    // PC at melee:C) — same tight framing convention as the torch/lantern captures — but with the
    // melee:C COVER text swapped to trip src/engine/theater-data.js's
    // /candelabra|brazier.?stand|torch.?sconce/i rule (part "candelabra" -> theater-figures.js
    // "prop:candelabra") so the candelabra prop mounts on the PC's own zone tile, in frame.
    const segment = { id: "cap-candelabra", dims: "20' x 20'" };
    const scene = {
      cover: { "melee:C": "a candelabra with three candles" },
      hazards: [], hazardZones: [], elevZones: [], zoneCover: {}, exits: []
    };
    const board = window.theaterBoardFrom(segment, scene, { env: "dungeon" });
    board.light = { profile: "torchlit", rolled: board.light && board.light.rolled, overridden: true };
    const unitsData = window.theaterUnitsFrom({ units: [{ id: "pc", kind: "pc", creatureType: "humanoid", band: "melee", lane: "C", className: "fighter" }] });
    window.Theater.mount(document.getElementById("stage"), { psx: true });
    window.Theater.setBoard(board);
    window.Theater.setUnits(unitsData);
  });
  await new Promise((r) => setTimeout(r, 500));
  await zoomOut(page);
  await new Promise((r) => setTimeout(r, 300));
  const stageEl = await page.$("#stage");
  const outPath = path.join(outDir, `flame-glow-${STATE}-candelabra.png`);
  await (stageEl || page).screenshot({ path: outPath });
  log("captured ->", outPath, "| console errors:", errors.length, errors.slice(0, 5));
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--hide-scrollbars", "--disable-gpu-sandbox"] });
  await captureTorchScene(browser);
  await captureLanternPost(browser);
  await captureCandelabra(browser);
  await browser.close();
  log("done, state =", STATE);
})().catch((e) => { console.error("[capture-flame-glow] FAILED", e); process.exit(1); });
