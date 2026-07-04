#!/usr/bin/env node
/* dev/model-qa/gate-followups/capture-adjacency.mjs — the capture-gate follow-up's ADJACENCY PROOF
   (item 2b in the task): two whole-object units (pc fighter + ally cleric) in adjacent lanes on the
   theater-preview.html "wholeobject-adjacency" fixture (dev/theater-preview.html), at the ruled
   WHOLE_OBJECT_SCALE=1.2, captured to show the discs/figures clearing each other rather than touching.
   Conventions mirrored from dev/model-qa/capture-p1-wiring.mjs's own captureFixture() — kept as a
   separate small script (not a capture-p1-wiring.mjs edit) since that file's own header says its
   fixture set is fixed to what P1-WIRING.md's original §7 check list named; this fixture is a
   follow-up-specific addition on top.

   Run:  node dev/model-qa/gate-followups/capture-adjacency.mjs
   Requires: the repo served at http://127.0.0.1:5179 BEFORE running.
*/
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;

const BASE = "http://127.0.0.1:5179";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function log(...a){ console.log("[capture-adjacency]", ...a); }

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--hide-scrollbars", "--disable-gpu-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 760, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (msg) => { if(msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + "/dev/theater-preview.html", { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForFunction(() => !!window.Theater, { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 600)); // let loadWholeObjectBuilders settle
  await page.click('button[data-fixture="wholeobject-adjacency"]');
  await new Promise((r) => setTimeout(r, 500));
  await page.click('button[data-light="dark"]');
  await new Promise((r) => setTimeout(r, 400));
  // DEFAULT_FIGURE_ZOOM_STEPS=3 biases the mount-time default zoom IN (theater-boot.js) for the
  // single-figure case — a 2-unit board needs to zoom back OUT from that default to keep both units
  // in frame; 3 zoom-out clicks undoes the built-in bias back toward the plain auto-fit.
  for(let i = 0; i < 3; i++){
    await page.click("#zoomOutBtn").catch(() => {});
    await new Promise((r) => setTimeout(r, 80));
  }
  await new Promise((r) => setTimeout(r, 400));
  const stageEl = await page.$("#stage");
  const outPath = path.join(outDir, "adjacency-fighter-cleric-scale1.2.png");
  await (stageEl || page).screenshot({ path: outPath });
  log("captured ->", outPath, "| console errors:", errors.length, errors.slice(0, 5));
  await page.close();
  await browser.close();
})().catch((e) => { console.error("[capture-adjacency] FAILED", e); process.exit(1); });
