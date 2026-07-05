#!/usr/bin/env node
/* dev/model-qa/realm-props-footprint-sheet.mjs — REALM-PROPS-WIRING.md §4 visual gate: ONE captured
   board proving the §3 prop-sizing render pass actually scales — a Small/Medium/Large/Huge realm-prop
   ROW, all four in the SAME frontier board so the relative scale reads at a glance (Hitching Rail
   [Small] < Water Trough [Medium] < Long Bar [Large] < Mission Bell Tower [Huge]), each placed via a
   real theaterBoardFrom realm-consult (cover text naming the prop, opts.realms:["frontier"]) — not a
   hand-forced fixture bypassing the actual select seam. Writes one fixture (4 bands x 1 lane, one prop
   per band), renders it through the real engine, and saves the full-board screenshot.
   RUN: node dev/model-qa/realm-props-footprint-sheet.mjs [--port 5190]  DEV-ONLY. */
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
const PORT = parseInt(arg("--port", "5190"), 10);

// one board, 4 bands (melee/near/far/out) x 3 lanes — a cover entry in the "C" lane of each band,
// its own cover text naming the exact frontier prop whose Size we want to prove at that row. Every
// name below is a REAL frontier prop (data/realm-props.js) resolving a REAL part with REAL
// geometry (pillar-broken/basin-block/table-slab all have either whole-object or Parts.PARTS
// renderers) — proves theaterRealmPropForText's keyword consult AND propFootprint's scale together,
// not just the scale math in isolation.
const ROWS = [
  { band: "melee", size: "Small",  text: "a hitching rail post stands here" },   // Hitching Rail, 0.55x
  { band: "near",  size: "Medium", text: "a water trough sits here" },           // Water Trough, 0.80x
  { band: "far",   size: "Large",  text: "a long bar runs along the wall" },     // Long Bar, 1.00x
  { band: "out",   size: "Huge",   text: "the old mission bell hangs silent here" }, // Mission Bell Tower, 1.60x
];
const cover = {}, zoneCover = {};
ROWS.forEach(r => { cover[r.band + ":C"] = r.text; zoneCover[r.band + ":C"] = "half"; });

const fixture = {
  name: "props-footprint", tag: "realm-props-footprint", mode: "F", env: "dungeon", light: "daylit",
  dims: "100' x 60'", grid: "4x3", summary: "Small/Medium/Large/Huge frontier props, one per band row",
  segment: { id: "props-footprint-sheet", dims: "100' x 60'" }, realms: ["frontier"],
  scene: { cover, zoneCover, hazardZones: [], elevZones: [], hazards: [], exits: [] }, units: [],
};
fs.writeFileSync(path.join(__dirname, "battlemap-fixtures.js"),
  "/* GENERATED realm-props-footprint-sheet.mjs — 1 fixture: Small/Medium/Large/Huge prop row. */\nwindow.__BM_FIXTURES = " + JSON.stringify([fixture], null, 2) + ";\n");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const portInUse = (p) => new Promise((res) => { const s = net.connect({ host: "127.0.0.1", port: p }, () => { s.destroy(); res(true); }); s.on("error", () => res(false)); s.setTimeout(600, () => { s.destroy(); res(false); }); });
let ownServer = null;
async function ensureServer() { if (await portInUse(PORT)) return; ownServer = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: "ignore" }); for (let i = 0; i < 40; i++) { if (await portInUse(PORT)) return; await sleep(150); } throw new Error("no server"); }

async function main() {
  await ensureServer();
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-gpu-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${PORT}/dev/model-qa/battlemap-render.html?i=0&zoom=0`, { waitUntil: "domcontentloaded", timeout: 30000 });
  for (let t = 0; t < 100; t++) { if (await page.evaluate(() => !!window.__ready)) break; await sleep(120); }
  // zoom OUT (negative dir, per theater-boot.js's Theater.zoom sign convention) so all 4 band rows
  // (melee/near/far/out) fit in frame — the default auto-fit + this dev host's own zoom-IN bias
  // (battlemap-render.html defaults zoomSteps=2 zoom-IN for close single-zone swatches) crops a
  // 4-row spread otherwise. Called directly on window.Theater rather than via the render host's own
  // ?zoom= param (that param only ever zooms IN) — no shared dev-harness edit needed.
  await page.evaluate(() => { for (let i = 0; i < 3; i++) window.Theater.zoom(-1); });
  await sleep(400);

  // pull the resolved props straight off the live board (proves the row actually resolved realm
  // props with `size` stamped, not just that something rendered).
  const resolved = await page.evaluate(() => {
    const b = window.__board;
    return b ? b.props.filter(p => p.realmPropName).map(p => ({ zone: p.zone, name: p.realmPropName, size: p.size, part: p.part })) : [];
  });
  console.log("resolved props:", JSON.stringify(resolved, null, 2));
  if (resolved.length !== 4) {
    console.error(`FAILED: expected 4 realm props resolved, got ${resolved.length}`);
    await browser.close();
    if (ownServer) ownServer.kill("SIGTERM");
    process.exit(1);
  }

  const clip = { x: 0, y: 30, width: 960, height: 570 };
  const boardBuf = await page.screenshot({ clip, encoding: "base64" });

  // a labeled review page (same aesthetic as realm-surface-swatch-sheet.mjs's own review html) —
  // the board screenshot plus a legend row naming each resolved prop's Size/scale, so the PNG is
  // self-documenting (an orchestrator judging it needs no separate console log alongside).
  const legend = resolved
    .sort((a, b) => ["Small", "Medium", "Large", "Huge"].indexOf(a.size) - ["Small", "Medium", "Large", "Huge"].indexOf(b.size))
    .map(p => {
      const fp = { Small: "0.55x, decorative", Medium: "0.80x, shares", Large: "1.00x, OCCUPIES", Huge: "1.60x, spans+OCCUPIES both" }[p.size];
      return `<div class="row"><b>${p.size}</b><span class="name">${p.name}</span><span class="fp">${fp}</span><span class="part">part: ${p.part || "(no part — generic fallback)"}</span></div>`;
    }).join("");
  const html = `<!doctype html><meta charset=utf-8><style>
    body{margin:0;background:#0b0908;font:14px -apple-system,sans-serif;color:#e8e2d0}
    h1{margin:14px 18px 2px;font-size:17px}p.sub{margin:0 18px 12px;color:#8a8172;font-size:12px}
    .board{padding:0 18px}img{width:100%;display:block;border:1px solid #2a251d;border-radius:5px;image-rendering:pixelated}
    .legend{padding:12px 18px;display:flex;flex-direction:column;gap:6px}
    .row{display:flex;gap:14px;align-items:baseline;font-size:13px;border-bottom:1px solid #241f1a;padding:4px 0}
    .row b{color:#c9a24b;width:60px}.row .name{width:170px;color:#e8e2d0}
    .row .fp{width:230px;color:#9a8f7a}.row .part{color:#6f675a;font-size:12px}</style>
    <h1>REALM-PROPS-WIRING §3/§4 — prop-sizing render pass</h1>
    <p class="sub">One frontier board, real theaterRealmPropForText keyword consults, real propFootprint scale — Small/Medium/Large/Huge in one frame.</p>
    <div class="board"><img src="data:image/png;base64,${boardBuf}"></div>
    <div class="legend">${legend}</div>`;
  await page.setViewport({ width: 1000, height: 900, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load" });
  await sleep(200);
  const bodyBox = await page.evaluate(() => { const r = document.body.getBoundingClientRect(); return { w: r.width, h: r.height }; });
  await page.screenshot({ path: path.join(__dirname, "realm-props-footprint-sheet.png"), clip: { x: 0, y: 0, width: bodyBox.w, height: Math.ceil(bodyBox.h) } });
  await browser.close();
  if (ownServer) ownServer.kill("SIGTERM");
  console.log(`\nrealm props footprint sheet -> dev/model-qa/realm-props-footprint-sheet.png`);
}
main().catch(async (e) => { console.error("FAILED:", e.stack || e.message); if (ownServer) ownServer.kill("SIGTERM"); process.exit(1); });
