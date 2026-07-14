#!/usr/bin/env node
/* dev/model-qa/proof-sheets-capture.mjs — FULL-ROSTER proof sheets.

   Renders every ps1-sheet.html set (the whole shipped model roster) through the real engine PS1
   shader and screenshots each set's #grid to a high-res PNG, then builds proof-sheets/index.html
   embedding them all under headers. Open the index in Chrome and browser-zoom for fidelity.

   RUN:  node dev/model-qa/proof-sheets-capture.mjs [--port 5179]
   DEV-ONLY. Reuses the puppeteer-core transport from ps1-capture.mjs. */

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

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const PORT = parseInt(arg("--port", "5179"), 10);
const OUT_DIR = path.join(repoRoot, "dev", "model-qa", "proof-sheets");
const DSF = 2;

// the sets, in a sensible viewing order, with human labels (mirrors ps1-sheet.html's SETS keys).
const SETS = [
  ["classes", "Classes — the 12 base classes"],
  ["races", "Player races"],
  ["racecls", "Race × Class bespoke starters (72)"],
  ["npcs", "NPCs"],
  ["cr0", "Monsters · CR 0"],
  ["cr1", "Monsters · CR 1"],
  ["cr2", "Monsters · CR 2"],
  ["cr5", "Monsters · CR 5"],
  ["icons", "Monsters · iconic"],
  ["variants", "Monster variants"],
  ["tail", "Polish tail-wave (swarms/beasts/fixes)"],
  ["alts", "Alt poses (kept originals)"],
  ["props", "Props — cover & scenery"],
  ["envd", "Env props · dungeon"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function portInUse(port) {
  return new Promise((res) => {
    const s = net.connect({ host: "127.0.0.1", port }, () => { s.destroy(); res(true); });
    s.on("error", () => res(false));
    s.setTimeout(600, () => { s.destroy(); res(false); });
  });
}
let ownServer = null;
async function ensureServer() {
  if (await portInUse(PORT)) return;
  ownServer = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: "ignore" });
  for (let i = 0; i < 40; i++) { if (await portInUse(PORT)) return; await sleep(150); }
  throw new Error("could not start server on " + PORT);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await ensureServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: "new",
    args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-gpu-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1200, deviceScaleFactor: DSF });

  const results = [];
  for (const [key, label] of SETS) {
    const url = `http://127.0.0.1:${PORT}/dev/model-qa/ps1-sheet.html?set=${key}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    let ready = false;
    for (let t = 0; t < 200; t++) { if (await page.evaluate(() => !!window.__ready)) { ready = true; break; } await sleep(200); }
    await sleep(700); // let the last GL frames settle
    const stat = await page.$eval("#stat", (el) => el.textContent).catch(() => "");
    const grid = await page.$("#grid");
    const box = await grid.boundingBox().catch(() => null);
    const file = `${key}.png`;
    await grid.screenshot({ path: path.join(OUT_DIR, file) });
    results.push({ key, label, file, stat, w: box && Math.round(box.width), h: box && Math.round(box.height), ready });
    console.log(`  [${ready ? "ok" : "TIMEOUT"}] ${key.padEnd(9)} ${stat}`);
  }

  await browser.close();
  if (ownServer) ownServer.kill("SIGTERM");

  // index page — click a set in the nav, or just scroll; each PNG is full-res so browser-zoom is crisp.
  const nav = results.map((r) => `<a href="#${r.key}">${r.label}</a>`).join("");
  const secs = results.map((r) => `
  <section id="${r.key}">
    <h2>${r.label} <span class="stat">${(r.stat || "").replace(/</g, "&lt;")}</span></h2>
    <img src="${r.file}" alt="${r.label}" loading="lazy">
  </section>`).join("\n");
  const html = `<!doctype html><meta charset=utf-8><title>Genesis — full model proof sheets</title>
<style>
  :root{color-scheme:dark}
  body{background:#0a0908;color:#e8e2d0;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0}
  header{position:sticky;top:0;background:#0a0908ee;backdrop-filter:blur(4px);border-bottom:1px solid #4a3f2c;padding:12px 18px;z-index:10}
  header h1{font-size:16px;margin:0 0 6px}
  nav{display:flex;flex-wrap:wrap;gap:6px}
  nav a{font-size:12px;color:#c9a24b;text-decoration:none;border:1px solid #4a3f2c;border-radius:5px;padding:3px 8px}
  nav a:hover{background:#241f18}
  section{padding:18px}
  h2{font-size:15px;margin:0 0 10px;border-left:3px solid #c9a24b;padding-left:8px}
  h2 .stat{color:#8a8172;font-weight:400;font-size:12px}
  img{max-width:100%;height:auto;image-rendering:pixelated;border:1px solid #2a251d;border-radius:6px;background:#0a0908}
  p.hint{color:#8a8172;font-size:12px;margin:0 0 0}
</style>
<header>
  <h1>Genesis — full model proof sheets <span style="color:#8a8172;font-weight:400">· engine PS1 shader · ${results.length} sets</span></h1>
  <nav>${nav}</nav>
</header>
<section><p class="hint">Every sheet is a full-resolution PNG rendered through the real theater-boot.js PS1 pass (dither + vertex-snap + 1/3 internal res). Use your browser zoom (⌘ +) to inspect fidelity; images are pixel-rendered so zoom stays crisp.</p></section>
${secs}`;
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html);
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(results, null, 2) + "\n");

  const ok = results.filter((r) => r.ready).length;
  console.log(`\n${ok}/${results.length} sets rendered · sheets -> dev/model-qa/proof-sheets/ · index -> proof-sheets/index.html`);
}
main().catch(async (e) => { console.error("FAILED:", e.stack || e.message); if (ownServer) ownServer.kill("SIGTERM"); process.exit(1); });
