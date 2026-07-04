#!/usr/bin/env node
/* dev/model-qa/capture-sheet.mjs — headless capture of full ps1-sheet.html proof sheets.
   Serves the repo on PORT 5177 (this executor's port) and screenshots the ps1 proof sheet for each
   requested set key, writing dev/model-qa/sheets/<key>.png. Transport mirrors capture.mjs.
   USAGE: node dev/model-qa/capture-sheet.mjs classes cr2 alts */
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
const PORT = 5177;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sets = process.argv.slice(2);
if(sets.length === 0){ console.error("usage: node capture-sheet.mjs <setkey> [...]"); process.exit(2); }
const outDir = path.join(__dirname, "sheets");
fs.mkdirSync(outDir, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
function portInUse(port){
  return new Promise(resolve => {
    const s = net.connect({ host:"127.0.0.1", port }, () => { s.destroy(); resolve(true); });
    s.on("error", () => resolve(false)); s.setTimeout(600, () => { s.destroy(); resolve(false); });
  });
}
let server = null;
async function startServer(){
  if(await portInUse(PORT)){
    try{ const r = await fetch(`http://127.0.0.1:${PORT}/dev/model-qa/ps1-sheet.html`, {cache:"no-store"});
      const b = r.ok ? await r.text() : ""; if(b.includes("ENGINE-PS1 PROOF SHEET")){ console.log(`[sheet] reusing :${PORT}`); return; } }catch(e){}
    throw new Error(`port ${PORT} busy with a foreign root`);
  }
  console.log(`[sheet] starting http.server ${PORT}`);
  server = spawn("python3", ["-m","http.server",String(PORT),"--bind","127.0.0.1"], {cwd:repoRoot, stdio:"ignore"});
  for(let i=0;i<40;i++){ if(await portInUse(PORT)) return; await sleep(150); }
  throw new Error("server failed to start");
}
async function main(){
  await startServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless:"new",
    args:["--use-angle=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--window-size=1500,1800"],
  });
  try{
    for(const key of sets){
      const page = await browser.newPage();
      await page.setViewport({ width: 1400, height: 1700, deviceScaleFactor: 1 });
      const errs = [];
      page.on("console", m => { if(m.type()==="error") errs.push(m.text().slice(0,140)); });
      page.on("pageerror", e => errs.push("PAGEERROR " + e.message));
      const url = `http://127.0.0.1:${PORT}/dev/model-qa/ps1-sheet.html?set=${key}`;
      await page.goto(url, { waitUntil:"domcontentloaded", timeout:25000 });
      let ok=false; for(let i=0;i<100;i++){ if(await page.evaluate(()=>!!window.__ready)){ ok=true; break; } await sleep(150); }
      await sleep(400);
      const stat = await page.$eval("#stat", el=>el.textContent).catch(()=>"(no stat)");
      const el = await page.$("#grid");
      const outFile = path.join(outDir, key + ".png");
      if(el){ await el.screenshot({ path: outFile }); } else { await page.screenshot({ path: outFile, fullPage:true }); }
      const kb=(fs.statSync(outFile).size/1024).toFixed(0);
      console.log(`[sheet] ${key} -> sheets/${key}.png (${kb}KB) ready=${ok} :: ${stat}${errs.length? " :: ERR "+errs.join(" | "):""}`);
      await page.close();
    }
  } finally {
    await browser.close();
    if(server){ try{ server.kill("SIGTERM"); }catch(e){} }
  }
}
main().catch(e => { console.error("[sheet] FAILED:", e.stack||e.message); if(server){try{server.kill("SIGTERM");}catch(_){}} process.exit(1); });
