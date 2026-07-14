#!/usr/bin/env node
/* dev/model-qa/floor-swatch-sheet.mjs — a REVIEW SHEET of every floor material.
   Writes 12 clean-floor (no-unit) swatch fixtures, renders each board through the real engine,
   crops the floor, and stitches a labeled grid into dev/model-qa/floor-review-sheet.png.
   RUN: node dev/model-qa/floor-swatch-sheet.mjs [--port 5189]  DEV-ONLY. */
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
const PORT = parseInt(arg("--port", "5189"), 10);

// 12 materials, each forced via a segment keyword the derivation reads, in a suiting env/light. No units.
const seg = (o) => Object.assign({ id: "sw", dims: "40' x 40'" }, o);
const MATS = [
  ["flagstone", "dungeon", "torchlit", seg({ scene: "worn flagstone paving underfoot" })],
  ["cobble", "urban", "lamplit", seg({ description: "a cobblestone lane", dressing: { text: "rounded cobbles" } })],
  ["cracked-earth", "dungeon", "torchlit", seg({ scene: "packed dirt and cracked clay floor" })],
  ["cave-rock", "dungeon", "torchlit", seg({ scene: "a raw bedrock cavern, rough natural stone" })],
  ["grass", "wilderness", "daylit", seg({ biome: "Grassland", footing: { text: "Springy Turf / Tundra Moss" } })],
  ["leaf-litter", "wilderness", "daylit", seg({ biome: "Forest", footing: { text: "Dry Leaf Litter / Shed Pine Needles" } })],
  ["sand", "wilderness", "daylit", seg({ biome: "Desert", footing: { text: "Sun-Baked Hardpan / Salt Flat" } })],
  ["snow-ice", "wilderness", "daylit", seg({ biome: "Arctic", footing: { text: "Stomped Snow / Polished Ice" } })],
  ["mud", "wilderness", "moonlit", seg({ biome: "Swamp", footing: { text: "Damp Loam / Firm Wet Mud" } })],
  ["scree", "wilderness", "daylit", seg({ biome: "Mountain", footing: { text: "Shattered Slate / Loose Scree" } })],
  ["plank", "urban", "lamplit", seg({ scene: "a wood plank floor, timber boards" })],
  ["ash", "dungeon", "torchlit", seg({ scene: "a floor of fine ash and grey dust" })],
  ["grating", "urban", "lamplit", seg({ scene: "grated metal catwalk over machinery, perforated walkway" })],
  ["asphalt", "urban", "lamplit", seg({ scene: "wet asphalt crossing, faded crosswalk striping" })],
  ["void-floor", "breach", "moonlit", seg({ scene: "a star-flecked void floor, non-euclidean stone" })],
  ["rope-matting", "urban", "daylit", seg({ scene: "woven rope matting underfoot" })],
  ["candy-tile", "urban", "daylit", seg({ scene: "a candy gumdrop tile floor" })],
];
const fixtures = MATS.map(([mat, env, light, segment]) => ({
  name: mat, tag: mat, mode: "F", env, light, dims: segment.dims, summary: mat, segment,
  scene: { cover: {}, zoneCover: {}, hazardZones: [], elevZones: [], hazards: [], exits: [] }, units: [],
}));
fs.writeFileSync(path.join(__dirname, "battlemap-fixtures.js"),
  "/* GENERATED floor-swatch-sheet.mjs — 12 clean floor material swatches. */\nwindow.__BM_FIXTURES = " + JSON.stringify(fixtures, null, 2) + ";\n");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const portInUse = (p) => new Promise((res) => { const s = net.connect({ host: "127.0.0.1", port: p }, () => { s.destroy(); res(true); }); s.on("error", () => res(false)); s.setTimeout(600, () => { s.destroy(); res(false); }); });
let ownServer = null;
async function ensureServer() { if (await portInUse(PORT)) return; ownServer = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: "ignore" }); for (let i = 0; i < 40; i++) { if (await portInUse(PORT)) return; await sleep(150); } throw new Error("no server"); }

async function main() {
  await ensureServer();
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-gpu-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 2 });
  const swatches = [];
  for (let i = 0; i < fixtures.length; i++) {
    await page.goto(`http://127.0.0.1:${PORT}/dev/model-qa/battlemap-render.html?i=${i}&zoom=0`, { waitUntil: "domcontentloaded", timeout: 30000 });
    for (let t = 0; t < 100; t++) { if (await page.evaluate(() => !!window.__ready)) break; await sleep(120); }
    await sleep(350);
    // crop a centered floor region of the 960x540 stage (skip the caption band at top)
    const clip = { x: 120, y: 150, width: 720, height: 360 };
    const buf = await page.screenshot({ clip, encoding: "base64" });
    swatches.push({ mat: fixtures[i].tag, env: fixtures[i].env, b64: buf });
    console.log(`  rendered ${fixtures[i].tag}`);
  }
  // stitch a labeled 4x3 grid contact sheet, screenshot it as the review sheet
  const cells = swatches.map((s) => `<figure><img src="data:image/png;base64,${s.b64}"><figcaption><b>${s.mat}</b> <span>${s.env}</span></figcaption></figure>`).join("");
  const html = `<!doctype html><meta charset=utf-8><style>
    body{margin:0;background:#0b0908;font:14px -apple-system,sans-serif;color:#e8e2d0}
    h1{margin:14px 18px 2px;font-size:17px}p.sub{margin:0 18px 12px;color:#8a8172;font-size:12px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 18px}
    figure{margin:0}img{width:100%;display:block;border:1px solid #2a251d;border-radius:5px;image-rendering:pixelated}
    figcaption{font-size:12px;margin-top:3px}figcaption b{color:#c9a24b}figcaption span{color:#6f675a}</style>
    <h1>Floor material review — ${swatches.length} procedural floor types <span style="color:#8a8172;font-weight:400">· engine PS1</span></h1>
    <p class="sub">Each rendered as a clean board (no figures), in a suiting environment/light. Material color + pattern + env tint.</p>
    <div class="grid">${cells}</div>`;
  await page.setViewport({ width: 1500, height: 1200, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load" });
  await sleep(300);
  const gridEl = await page.$(".grid");
  const box = await gridEl.boundingBox();
  await page.screenshot({ path: path.join(__dirname, "floor-review-sheet.png"), clip: { x: 0, y: 0, width: 1500, height: Math.ceil(box.y + box.height + 12) } });
  await browser.close();
  if (ownServer) ownServer.kill("SIGTERM");
  console.log(`\nfloor review sheet -> dev/model-qa/floor-review-sheet.png (${swatches.length} materials)`);
}
main().catch(async (e) => { console.error("FAILED:", e.stack || e.message); if (ownServer) ownServer.kill("SIGTERM"); process.exit(1); });
