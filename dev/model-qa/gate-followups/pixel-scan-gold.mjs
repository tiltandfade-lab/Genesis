#!/usr/bin/env node
/* dev/model-qa/gate-followups/pixel-scan-gold.mjs — the R5/D10 side-read gate's gold-rim pixel-count
   technique (docs/P1-WIRING.md §0.1 R5's own "verified by direct pixel scan" finding, now committed as
   a reusable script instead of a one-off manual read). Loads a captured PNG into an offscreen <canvas>
   via puppeteer-core (system Chrome, same convention as capture-p1-wiring.mjs) and counts pixels whose
   hue/saturation/value fall in the "gold rim" family — matches the PC disc's own hue range (both the
   old 0xc9a24b and the new brighter 0xe6bb52 sit at hue ~41-43°), not a single exact hex (jitter +
   dither + grain all perturb the baked color slightly, so an exact-match count would undercount).

   Run:  node dev/model-qa/gate-followups/pixel-scan-gold.mjs <path-to-png> [<path-to-png> ...]
*/
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function countGoldPixels(browser, pngPath){
  const page = await browser.newPage();
  const dataUrl = "data:image/png;base64," + fs.readFileSync(pngPath).toString("base64");
  const result = await page.evaluate(async (url) => {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let gold = 0, total = c.width * c.height;
    for(let i = 0; i < data.length; i += 4){
      const r = data[i], g = data[i+1], b = data[i+2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const v = max / 255;
      const sat = max === 0 ? 0 : (max - min) / max;
      // hue (fast approximation, degrees)
      let hue = 0;
      if(max !== min){
        if(max === r) hue = 60 * (((g - b) / (max - min)) % 6);
        else if(max === g) hue = 60 * ((b - r) / (max - min) + 2);
        else hue = 60 * ((r - g) / (max - min) + 4);
        if(hue < 0) hue += 360;
      }
      // gold family: hue 30-55deg, reasonably saturated + not too dark (excludes the near-black tile
      // grout lines and the desaturated stone floor, which both sit outside this hue/sat/value band).
      if(hue >= 30 && hue <= 55 && sat > 0.25 && v > 0.25) gold++;
    }
    return { gold, total };
  }, dataUrl);
  await page.close();
  return result;
}

(async () => {
  const targets = process.argv.slice(2);
  if(!targets.length){ console.error("usage: node pixel-scan-gold.mjs <png...>"); process.exit(1); }
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  for(const t of targets){
    const { gold, total } = await countGoldPixels(browser, t);
    console.log(`${path.basename(t)}: ${gold} gold-family px / ${total} total (${(100*gold/total).toFixed(3)}%)`);
  }
  await browser.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
