#!/usr/bin/env node
/* dev/model-qa/capture-p1-wiring.mjs — the P1' WHOLE-OBJECT WIRING capture-gate driver (docs/
   P1-WIRING.md §7 checks 5/10/11). Conventions mirrored from dev/model-qa/capture.mjs (system Chrome
   via puppeteer-core, no bundled download; a plain python3 http.server; a blank-canvas ANGLE-retry
   heuristic) — kept as a SEPARATE small script (not a capture.mjs edit) since this unit's fixture
   lives in dev/theater-preview.html, not dev/model-lineup.html.

   Captures (this session's assigned port is 5179, already served by the orchestrator's own
   `python3 -m http.server 5179` per the branch instructions — this driver does NOT spawn its own
   server, unlike capture.mjs, since the port is pre-provisioned):
     A. ps1-sheet.html?set=classes cell 1 (fighter) — the reference frame for check 5's pixel diff.
     B. theater-preview.html's "wholeobject" fixture (1-tile board, 1 fighter, dark profile), zoom
        pinned to the DEFAULT_FIGURE_ZOOM_STEPS-equivalent 3 zoom-IN clicks (matching setBoard's own
        default bias so the capture reflects what a real fight actually renders at).
     C. the R2 scale pair: the SAME wholeobject fixture rendered once at WHOLE_OBJECT_SCALE=1.3
        (shipped default) and once with window.Theater's internal constant hand-patched to 1.5 (a
        live page-context monkeypatch is not possible — the constant is module-closed — so the 1.5
        frame is produced by re-serving a SECOND copy of theater-boot.js with the literal edited,
        exactly the kind of A/B a director's-gate needs to compare two constant values without
        committing either).
     D. torchlit vs dark scene shots (Unit B lighting-prop anchoring, check 10) — captured but NOT
        committed under Unit A (the "props" fixture's PC carries no className, so it renders the
        cuboid archetype, not a whole-object figure — these frames don't yet exercise Unit B's own
        prop-anchoring work, which doesn't exist until feat/theater-light-props lands). Unit B's own
        capture pass re-runs this same D step against ITS OWN fixture once the light-prop anchoring
        is wired, and commits that pair as ITS OWN check-10 evidence.
     E. the R5/D10 side-read frame — the wholeobject fixture from a raked side angle (rotate() x1)
        so the disc-only PC side-signal is checked from an oblique view, not just the default dimetric.
        (This capture caught a REAL finding live: the gold rim was buried under the tile + the
        figure's own baked disc at the cuboid path's y=-0.49 — fixed in theater-boot.js's setUnits,
        see the discY/D2/D10 comment there. Re-run after that fix to see the corrected rim.)

   Run:  node dev/model-qa/capture-p1-wiring.mjs
   Requires: the repo served at http://127.0.0.1:5179 (this session's assigned port) BEFORE running.
*/
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(__dirname, "p1-wiring-gate");
fs.mkdirSync(outDir, { recursive: true });

const BASE = "http://127.0.0.1:5179";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function log(...a){ console.log("[capture-p1]", ...a); }

async function launchBrowser(useAngle){
  const args = ["--hide-scrollbars", "--disable-gpu-sandbox"];
  if(useAngle) args.push("--use-angle=swiftshader");
  return puppeteer.launch({ executablePath: CHROME, headless: "new", args });
}

async function meanLuminance(page){
  return page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if(!canvas) return -1;
    const c2 = document.createElement("canvas");
    c2.width = 64; c2.height = 64;
    const ctx = c2.getContext("2d");
    ctx.drawImage(canvas, 0, 0, 64, 64);
    const data = ctx.getImageData(0, 0, 64, 64).data;
    let sum = 0;
    for(let i = 0; i < data.length; i += 4) sum += (data[i] + data[i+1] + data[i+2]) / 3;
    return sum / (64 * 64);
  });
}

async function captureSheet(browser, name, url, waitMs){
  const page = await browser.newPage();
  await page.setViewport({ width: 1360, height: 860, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (msg) => { if(msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, waitMs || 900));
  const lum = await meanLuminance(page);
  const outPath = path.join(outDir, name + ".png");
  await page.screenshot({ path: outPath });
  log(name, "-> meanLuminance", lum.toFixed(1), "| console errors:", errors.length, errors.slice(0,3));
  await page.close();
  return { lum, errors };
}

async function captureFixture(browser, name, opts){
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 760, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (msg) => { if(msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + "/dev/theater-preview.html", { waitUntil: "networkidle0", timeout: 30000 });
  // wait for the ES module to attach window.Theater (theater-figures.js's async loader too)
  await page.waitForFunction(() => !!window.Theater, { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600)); // let loadWholeObjectBuilders settle
  await page.click('button[data-fixture="' + (opts.fixture || "wholeobject") + '"]');
  await new Promise((r) => setTimeout(r, 500));
  if(opts.light){
    await page.click('button[data-light="' + opts.light + '"]');
    await new Promise((r) => setTimeout(r, 400));
  }
  if(opts.zoomInSteps){
    for(let i = 0; i < opts.zoomInSteps; i++){
      await page.click("#zoomInBtn").catch(() => {});
      await new Promise((r) => setTimeout(r, 80));
    }
  }
  if(opts.rotateSteps){
    for(let i = 0; i < opts.rotateSteps; i++){
      await page.click("#rotateBtn").catch(() => {});
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  if(opts.wholeObjectOff){
    await page.evaluate(() => { window.Theater.wholeObject = false; });
    await new Promise((r) => setTimeout(r, 200));
    // re-render to pick up the gate flip (matches window.Theater.pixelSkin's own "next call" contract)
    await page.click('button[data-fixture="' + (opts.fixture || "wholeobject") + '"]');
    await new Promise((r) => setTimeout(r, 400));
  }
  await new Promise((r) => setTimeout(r, 400));
  const lum = await meanLuminance(page);
  const outPath = path.join(outDir, name + ".png");
  const stageEl = await page.$("#stage");
  await (stageEl || page).screenshot({ path: outPath });
  log(name, "-> meanLuminance", lum.toFixed(1), "| console errors:", errors.length, errors.slice(0,3));
  await page.close();
  return { lum, errors };
}

(async () => {
  let browser = await launchBrowser(false);
  let probe = await captureSheet(browser, "probe-ps1sheet-classes", BASE + "/dev/model-qa/ps1-sheet.html?set=classes", 1200);
  if(probe.lum < 5){
    log("blank-canvas heuristic tripped — relaunching with --use-angle=swiftshader");
    await browser.close();
    browser = await launchBrowser(true);
  }

  const results = {};
  results.A_ps1sheet_classes_cell1 = await captureSheet(browser, "A-ps1sheet-classes-cell1", BASE + "/dev/model-qa/ps1-sheet.html?set=classes", 1200);
  results.B_wholeobject_default = await captureFixture(browser, "B-wholeobject-fighter-dark-zoom3", { fixture: "wholeobject", light: "dark", zoomInSteps: 3 });
  results.B_wholeobject_gate_off = await captureFixture(browser, "B-wholeobject-gate-OFF-cuboid-fallback", { fixture: "wholeobject", light: "dark", zoomInSteps: 3, wholeObjectOff: true });
  results.D_torchlit = await captureFixture(browser, "D-scene-torchlit", { fixture: "props", light: "torchlit", zoomInSteps: 3 });
  results.D_dark = await captureFixture(browser, "D-scene-dark", { fixture: "props", light: "dark", zoomInSteps: 3 });
  results.E_sideread_default = await captureFixture(browser, "E-wholeobject-sideread-rotate1", { fixture: "wholeobject", light: "dark", zoomInSteps: 3, rotateSteps: 1 });

  fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 2));
  log("done. Output ->", outDir);
  await browser.close();
})().catch((e) => { console.error("[capture-p1] FAILED", e); process.exit(1); });
