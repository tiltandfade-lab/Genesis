/* dev/model-qa/grit-compare/capture-res.mjs — ONE-OFF capture driver for the director's PSX
   resolution-comparison gate (chore/grit-compare, comparison-only — NO engine change).

   Captures dev/model-qa/ps1-sheet.html?set=classes at a list of ?res= overrides (and, separately,
   with the param ABSENT so the byte-faithful default can be hash-compared against a pre-change
   baseline). Mirrors the transport of dev/model-qa/probe-capture.mjs / capture.mjs (system Chrome
   via puppeteer-core in ~/.genesis-jsdom, --use-angle=swiftshader for WebGL-in-headless).

   RUN (from repo root), server already up on 5178:
       QA_BASE=http://127.0.0.1:5178 node dev/model-qa/grit-compare/capture-res.mjs

   Writes dev/model-qa/grit-compare/classes-res-<label>.png for each entry in SHOTS.
*/
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.QA_BASE || "http://127.0.0.1:5178";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// [label, query-suffix]; "default" omits ?res= entirely (must stay byte-faithful to pre-change).
const SHOTS = (process.env.QA_SHOTS_JSON ? JSON.parse(process.env.QA_SHOTS_JSON) : [
  ["default", ""],
  ["0.3333", "&res=0.3333"],
  ["0.4", "&res=0.4"],
  ["0.5", "&res=0.5"],
]);

async function main(){
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle",
           "--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader", "--window-size=1400,1400"],
    defaultViewport: { width: 1360, height: 1720, deviceScaleFactor: 2 },
  });
  try {
    for (const [label, qs] of SHOTS) {
      const page = await browser.newPage();
      const errs = [];
      page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
      page.on("pageerror", e => errs.push("PAGEERROR " + e.message));
      const url = `${BASE}/dev/model-qa/ps1-sheet.html?set=classes${qs}`;
      console.log("[capture-res] ->", url);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      // wait for window.__ready (set at end of ps1-sheet.html's script)
      const deadline = Date.now() + 30000;
      let ready = false;
      while (Date.now() < deadline) {
        ready = await page.evaluate(() => window.__ready === true).catch(() => false);
        if (ready) break;
        await new Promise(r => setTimeout(r, 200));
      }
      if (!ready) console.log(`[capture-res] WARNING: ${label} never reported __ready`);
      await new Promise(r => setTimeout(r, 300));
      const stat = await page.$eval("#stat", el => el.textContent).catch(() => "(no stat)");
      const grid = await page.$("#grid");
      const outFile = path.join(__dirname, `classes-res-${label}.png`);
      if (grid) await grid.screenshot({ path: outFile });
      else await page.screenshot({ path: outFile, fullPage: true });
      console.log(`[capture-res] ${label} -> ${path.relative(process.cwd(), outFile)}  STAT: ${stat}`);
      if (errs.length) console.log(`[capture-res]   console errors: ${errs.join(" | ")}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
main().catch(e => { console.error("[capture-res] FAILED:", e.stack || e.message); process.exit(1); });
