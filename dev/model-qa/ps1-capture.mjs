#!/usr/bin/env node
/* dev/model-qa/ps1-capture.mjs — headless capture driver for ps1-sheet.html (the byte-faithful
   engine-PS1 proof sheet). Reuses the proven transport from capture.mjs / probe-capture.mjs:
   system Chrome via puppeteer-core in ~/.genesis-jsdom, ANGLE/swiftshader for WebGL-in-headless.

   The overnight model program had NO dedicated ps1-sheet headless driver (capture.mjs drives
   model-lineup.html, probe-capture.mjs drives whole-body-probe.html). This is the minimal
   ps1-sheet analogue: it drives ps1-sheet.html?set=<set>, waits for window.__ready, screenshots
   the whole #grid, and (given a cell index) crops the single creature cell out for the piece file.

   RUN (from the repo root; if nothing is serving the port it starts its own http.server):
     node dev/model-qa/ps1-capture.mjs --port 5176 --set cr0 --out dev/model-qa/captures-fix-a/rat-before.png --cell 0
     node dev/model-qa/ps1-capture.mjs --port 5176 --set cr0 --out .../cr0-sheet.png          # whole sheet, no --cell

   The sheet lays out a COLS=4 grid of CELL=340 x CH=430 CSS cells (see ps1-sheet.html). --cell N
   crops the Nth cell (row-major, 0-based) at deviceScaleFactor 2. */

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
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const CELL = 340, CH = 430, COLS = 4, DSF = 2;

function arg(name, def){ const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i+1] : def; }
const PORT = parseInt(arg("--port", "5176"), 10);
const SET = arg("--set", "classes");
const OUT = arg("--out", null);
const CELL_IDX = arg("--cell", null);
if(!OUT){ console.error("need --out <file>"); process.exit(1); }

function portInUse(port){
  return new Promise(resolve => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

let ownServer = null;
async function ensureServer(){
  if(await portInUse(PORT)) return; // already served (the harness serves it) — reuse
  ownServer = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: "ignore" });
  for(let i=0;i<40;i++){ if(await portInUse(PORT)) return; await sleep(150); }
  throw new Error("could not start server on " + PORT);
}

async function main(){
  await ensureServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-gpu-sandbox", "--window-size=1500,2000"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1900, deviceScaleFactor: DSF });
  const errs = [];
  page.on("console", m => { if(m.type() === "error") errs.push(m.text().slice(0,200)); });
  page.on("pageerror", e => errs.push("PAGEERROR " + e.message));
  const url = `http://127.0.0.1:${PORT}/dev/model-qa/ps1-sheet.html?set=${SET}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  // wait for window.__ready
  for(let i=0;i<120;i++){ if(await page.evaluate(()=>!!window.__ready)) break; await sleep(200); }
  await sleep(500);
  const stat = await page.$eval("#stat", el => el.textContent).catch(()=>"(no stat)");

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, OUT)), { recursive: true });
  if(CELL_IDX == null){
    const grid = await page.$("#grid");
    await grid.screenshot({ path: path.resolve(repoRoot, OUT) });
  } else {
    const idx = parseInt(CELL_IDX, 10);
    const col = idx % COLS, row = (idx / COLS) | 0;
    // clip is in CSS px; puppeteer scales by deviceScaleFactor internally
    await page.screenshot({
      path: path.resolve(repoRoot, OUT),
      clip: { x: col*CELL, y: row*CH + 34 /* #bar height ~34px */, width: CELL, height: CH }
    });
  }
  console.log("STAT:", stat);
  console.log("OUT:", OUT, "cell:", CELL_IDX == null ? "(whole grid)" : CELL_IDX);
  console.log("ERRORS:", errs.length ? errs.slice(0,5).join(" | ") : "none");
  await browser.close();
  if(ownServer) ownServer.kill("SIGTERM");
}
main().catch(async e => { console.error("FAILED:", e.stack || e.message); if(ownServer) ownServer.kill("SIGTERM"); process.exit(1); });
