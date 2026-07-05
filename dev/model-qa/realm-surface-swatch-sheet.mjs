#!/usr/bin/env node
/* dev/model-qa/realm-surface-swatch-sheet.mjs — REALM-SURFACES-WIRING.md §2/§4 visual gate: a REVIEW
   SHEET proving the select seam actually renders — one clean-floor swatch per realm, forced via
   `opts.realms` (NOT a segment keyword — this exercises theaterFloorMaterial's realm-seeded pick path,
   the S2 material recipes are already gated by dev/model-qa/floor-swatch-sheet.mjs's own 17-material
   sheet). Writes 11 fixtures (one per REALM_IDS), renders each board through the real engine, crops the
   floor, and stitches a labeled grid into dev/model-qa/realm-surface-review-sheet.png.
   RUN: node dev/model-qa/realm-surface-swatch-sheet.mjs [--port 5189]  DEV-ONLY. */
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

const REALM_SURFACES = JSON.parse(fs.readFileSync(path.join(repoRoot, "dev/model-qa/realm-surfaces.json"), "utf-8"));

// one swatch per realm — a bare segment (no keyword hit) so the render exercises the SEEDED pick
// (theaterRealmSurfacePick's fallback branch), same "prove the mechanism, not just a lucky keyword
// match" discipline floor-swatch-sheet.mjs's own dungeon/urban entries use. `env` picks dungeon for
// realms whose surfaces skew interior, wilderness for the more exterior-leaning ones — cosmetic only,
// theaterFloorMaterial's realm branch doesn't care about env beyond the interior/exterior where-bucket.
const seg = (o) => Object.assign({ id: "rsw", dims: "40' x 40'" }, o);
const REALMS = [
  ["frontier", "dungeon", "torchlit"], ["chrome", "dungeon", "lamplit"], ["noir", "urban", "lamplit"],
  ["ash", "dungeon", "torchlit"], ["suburb", "urban", "daylit"], ["cosmic", "breach", "moonlit"],
  ["theater", "dungeon", "torchlit"], ["high-seas", "wilderness", "daylit"], ["lost-world", "wilderness", "daylit"],
  ["gloom", "dungeon", "torchlit"], ["bright-kingdom", "urban", "daylit"],
];
const fixtures = REALMS.map(([realm, env, light]) => ({
  name: realm, tag: realm, mode: "F", env, light, dims: "40' x 40'", summary: realm + " (realm-seeded pick, no keyword)",
  segment: seg({}), realms: [realm],
  scene: { cover: {}, zoneCover: {}, hazardZones: [], elevZones: [], hazards: [], exits: [] }, units: [],
}));
fs.writeFileSync(path.join(__dirname, "battlemap-fixtures.js"),
  "/* GENERATED realm-surface-swatch-sheet.mjs — 11 realm-surface swatches (one per realm, seeded pick). */\nwindow.__BM_FIXTURES = " + JSON.stringify(fixtures, null, 2) + ";\n");

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
    // pull the resolved surfaceName straight off the live board the render already built
    // (window.__board — proves the label matches what's actually rendered, not a recomputation).
    const surfaceName = await page.evaluate(() => {
      const b = window.__board;
      return b ? (b.surfaceName + " (" + b.floorMaterial + ")") : "?";
    });
    const clip = { x: 120, y: 150, width: 720, height: 360 };
    const buf = await page.screenshot({ clip, encoding: "base64" });
    swatches.push({ realm: fixtures[i].tag, env: fixtures[i].env, surfaceName, b64: buf });
    console.log(`  rendered ${fixtures[i].tag} -> ${surfaceName}`);
  }
  const cells = swatches.map((s) => `<figure><img src="data:image/png;base64,${s.b64}"><figcaption><b>${s.realm}</b> <span>${s.env}</span><br><i>${s.surfaceName}</i></figcaption></figure>`).join("");
  const html = `<!doctype html><meta charset=utf-8><style>
    body{margin:0;background:#0b0908;font:14px -apple-system,sans-serif;color:#e8e2d0}
    h1{margin:14px 18px 2px;font-size:17px}p.sub{margin:0 18px 12px;color:#8a8172;font-size:12px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 18px}
    figure{margin:0}img{width:100%;display:block;border:1px solid #2a251d;border-radius:5px;image-rendering:pixelated}
    figcaption{font-size:12px;margin-top:3px}figcaption b{color:#c9a24b}figcaption span{color:#6f675a}figcaption i{color:#9a8f7a;font-style:normal}</style>
    <h1>Realm surface review — ${swatches.length} realms <span style="color:#8a8172;font-weight:400">· theaterFloorSurfaceInfo seeded pick · engine PS1</span></h1>
    <p class="sub">Each rendered via opts.realms (no segment keyword) — proves the realm-select seam picks a real, named surface per realm.</p>
    <div class="grid">${cells}</div>`;
  await page.setViewport({ width: 1500, height: 1200, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load" });
  await sleep(300);
  const gridEl = await page.$(".grid");
  const box = await gridEl.boundingBox();
  await page.screenshot({ path: path.join(__dirname, "realm-surface-review-sheet.png"), clip: { x: 0, y: 0, width: 1500, height: Math.ceil(box.y + box.height + 12) } });
  await browser.close();
  if (ownServer) ownServer.kill("SIGTERM");
  console.log(`\nrealm surface review sheet -> dev/model-qa/realm-surface-review-sheet.png (${swatches.length} realms)`);
}
main().catch(async (e) => { console.error("FAILED:", e.stack || e.message); if (ownServer) ownServer.kill("SIGTERM"); process.exit(1); });
