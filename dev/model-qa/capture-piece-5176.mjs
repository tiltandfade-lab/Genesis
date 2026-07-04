#!/usr/bin/env node
/* dev/model-qa/capture-piece-5176.mjs — headless single-piece PS1 capture for POLISH-WAVE-1 §F4
   (race×class starter). Same transport + page as capture-piece.mjs, but pinned to THIS executor's
   assigned port 5176 (capture-piece.mjs hardcodes 5177). Reuses a server already serving this tree
   on :5176, else starts its own.

   USAGE:  node dev/model-qa/capture-piece-5176.mjs <outSubdir> <file.js:buildFn:label> [more...]
   Writes  dev/model-qa/<outSubdir>/<label>.png  per piece (3 angles: game/front/side). */
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
const PORT = 5176;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const outSub = process.argv[2];
const pieces = process.argv.slice(3).map(spec => {
  const [file, fn, label] = spec.split(":");
  return { file, fn, label: label || fn };
});
if(!outSub || pieces.length === 0){
  console.error("usage: node capture-piece-5176.mjs <outSubdir> <file.js:buildFn:label> [...]");
  process.exit(2);
}
const outDir = path.join(__dirname, outSub);
fs.mkdirSync(outDir, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
function portInUse(port){
  return new Promise(resolve => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}

let server = null;
async function startServer(){
  if(await portInUse(PORT)){
    try{
      const r = await fetch(`http://127.0.0.1:${PORT}/dev/model-qa/piece-shot.html`, { cache:"no-store" });
      const body = r.ok ? await r.text() : "";
      if(body.includes("PIECE PS1 SHOT")){ console.log(`[cap] reusing :${PORT} (this tree)`); return; }
    }catch(e){}
    throw new Error(`port ${PORT} busy with a foreign root`);
  }
  console.log(`[cap] starting python3 -m http.server ${PORT} in ${repoRoot}`);
  server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"],
    { cwd: repoRoot, stdio: "ignore" });
  for(let i=0;i<40;i++){ if(await portInUse(PORT)) return; await sleep(150); }
  throw new Error("server failed to start on " + PORT);
}

async function main(){
  await startServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: "new",
    args: ["--use-angle=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--window-size=1300,700"],
  });
  try{
    for(const p of pieces){
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 520, deviceScaleFactor: 2 });
      const errs = [];
      page.on("console", m => { if(m.type()==="error") errs.push(m.text().slice(0,160)); });
      page.on("pageerror", e => errs.push("PAGEERROR " + e.message));
      const url = `http://127.0.0.1:${PORT}/dev/model-qa/piece-shot.html?file=${p.file}&fn=${p.fn}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      let ok = false;
      for(let i=0;i<80;i++){ if(await page.evaluate(()=>!!window.__ready)){ ok = true; break; } await sleep(150); }
      await sleep(300);
      const stat = await page.$eval("#stat", el => el.textContent).catch(()=>"(no stat)");
      const grid = await page.$("#grid");
      const outFile = path.join(outDir, p.label + ".png");
      if(grid){ await grid.screenshot({ path: outFile }); }
      else { await page.screenshot({ path: outFile }); }
      const kb = (fs.statSync(outFile).size/1024).toFixed(0);
      console.log(`[cap] ${p.label} -> ${path.relative(repoRoot,outFile)} (${kb}KB) ready=${ok} :: ${stat}${errs.length? " :: ERR "+errs.join(" | "):""}`);
      await page.close();
    }
  } finally {
    await browser.close();
    if(server){ try{ server.kill("SIGTERM"); }catch(e){} }
  }
}
main().catch(e => { console.error("[cap] FAILED:", e.stack||e.message); if(server){try{server.kill("SIGTERM");}catch(_){}} process.exit(1); });
