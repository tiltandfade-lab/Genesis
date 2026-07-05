#!/usr/bin/env node
/* dev/model-qa/realm-render-style-sheet.mjs — REALM-RENDER-STYLE.md §4 visual gate: renders the SAME
   fixture board (a populated fight — floor tiles, a hazard patch, an elevated patch, a cover prop, a PC
   + a foe) under all 11 realm render profiles + the neutral/no-realm baseline, and stitches a labeled
   review sheet so each realm's grade (saturation/tint/contrast) is eyeball-checkable in one place.
   Mirrors dev/model-qa/realm-surface-swatch-sheet.mjs's exact capture pattern (same battlemap-render.html
   host, same puppeteer-core from ~/.genesis-jsdom, same fixture->screenshot->grid-stitch flow) — this
   sheet forces `opts.realms` (theaterBoardFrom's realm-render seam) the same way that sheet forces the
   realm-surface seam, on a richer fixture so figures/props/tiles/hazard/elevation all read at once.
   RUN: node dev/model-qa/realm-render-style-sheet.mjs [--port 5190]  DEV-ONLY. */
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

// one populated fixture per realm (+ a "neutral" no-realms control) — a fixed 4-band x 3-lane room with
// a hazard tile (melee:L), an elevated tile (far:R), a cover prop (near:C), a PC (melee:C) and a foe
// (far:C) so the review sheet shows the grade landing on floor/hazard/elevation/prop/figure all at once,
// not just a clean floor swatch (realm-surface-swatch-sheet.mjs's own narrower scope).
const seg = (o) => Object.assign({ id: "rrs", dims: "40' x 30'" }, o);
const sceneFor = () => ({
  cover: { "near:C": "an overturned cart" },
  zoneCover: {},
  hazardZones: [{ zone: "melee:L", kind: "scorch", revealed: true }],
  elevZones: ["far:R"],
  hazards: [],
  exits: []
});
const unitsFor = () => ([
  { id: "pc", kind: "pc", creatureType: "humanoid", className: "fighter", band: "melee", lane: "C" },
  { id: "f1", kind: "foe", creatureType: "beast", size: "medium", statId: null, band: "far", lane: "C", name: "test foe" }
]);

const REALM_ENV = {
  frontier: "dungeon", chrome: "dungeon", noir: "urban", ash: "dungeon", suburb: "urban",
  cosmic: "breach", theater: "dungeon", "high-seas": "wilderness", "lost-world": "wilderness",
  gloom: "dungeon", "bright-kingdom": "urban"
};
const REALM_IDS = Object.keys(REALM_ENV);

const fixtures = [
  // neutral/no-realm control FIRST — the regression-law anchor: every other swatch's grade should read
  // as a visible departure from this one baseline, never itself grade-shifted.
  { name: "neutral", tag: "neutral (no realm)", mode: "F", env: "dungeon", light: "torchlit", dims: "40' x 30'",
    summary: "no opts.realms — the byte-identical baseline every graded swatch is judged against",
    segment: seg({}), realms: undefined, scene: sceneFor(), units: unitsFor() },
  ...REALM_IDS.map((realm) => ({
    name: realm, tag: realm, mode: "F", env: REALM_ENV[realm], light: "torchlit", dims: "40' x 30'",
    summary: realm + " render profile (sat/tint/contrast graded)",
    segment: seg({}), realms: [realm], scene: sceneFor(), units: unitsFor()
  }))
];
fs.writeFileSync(path.join(__dirname, "battlemap-fixtures.js"),
  "/* GENERATED realm-render-style-sheet.mjs — 1 neutral baseline + 11 realm render-profile swatches. */\nwindow.__BM_FIXTURES = " + JSON.stringify(fixtures, null, 2) + ";\n");

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
    await page.goto(`http://127.0.0.1:${PORT}/dev/model-qa/battlemap-render.html?i=${i}&zoom=1`, { waitUntil: "domcontentloaded", timeout: 30000 });
    for (let t = 0; t < 100; t++) { if (await page.evaluate(() => !!window.__ready)) break; await sleep(120); }
    await sleep(350);
    const clip = { x: 60, y: 90, width: 840, height: 460 };
    const buf = await page.screenshot({ clip, encoding: "base64" });
    swatches.push({ realm: fixtures[i].tag, env: fixtures[i].env, b64: buf });
    console.log(`  rendered ${fixtures[i].tag}`);
  }
  const cells = swatches.map((s) => `<figure><img src="data:image/png;base64,${s.b64}"><figcaption><b>${s.realm}</b> <span>${s.env}</span></figcaption></figure>`).join("");
  const html = `<!doctype html><meta charset=utf-8><style>
    body{margin:0;background:#0b0908;font:14px -apple-system,sans-serif;color:#e8e2d0}
    h1{margin:14px 18px 2px;font-size:17px}p.sub{margin:0 18px 12px;color:#8a8172;font-size:12px}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px 18px}
    figure{margin:0}img{width:100%;display:block;border:1px solid #2a251d;border-radius:5px;image-rendering:pixelated}
    figcaption{font-size:12px;margin-top:3px}figcaption b{color:#c9a24b}figcaption span{color:#6f675a}</style>
    <h1>Realm render-style review — ${swatches.length} swatches <span style="color:#8a8172;font-weight:400">· gradeColor(sat/tint/contrast) · engine PS1</span></h1>
    <p class="sub">Same fixture board (PC + foe, hazard tile, elevated tile, cover prop) rendered under each realm's render profile. First cell = the neutral/no-realm baseline every other cell should visibly depart from.</p>
    <div class="grid">${cells}</div>`;
  await page.setViewport({ width: 1400, height: 1600, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load" });
  await sleep(300);
  const gridEl = await page.$(".grid");
  const box = await gridEl.boundingBox();
  await page.screenshot({ path: path.join(__dirname, "realm-render-style-review-sheet.png"), clip: { x: 0, y: 0, width: 1400, height: Math.ceil(box.y + box.height + 12) } });
  await browser.close();
  if (ownServer) ownServer.kill("SIGTERM");
  console.log(`\nrealm render-style review sheet -> dev/model-qa/realm-render-style-review-sheet.png (${swatches.length} swatches)`);
}
main().catch(async (e) => { console.error("FAILED:", e.stack || e.message); if (ownServer) ownServer.kill("SIGTERM"); process.exit(1); });
