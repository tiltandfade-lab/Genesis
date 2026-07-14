#!/usr/bin/env node
/* dev/model-qa/battlemap-capture.mjs — BATTLEMAP PLAYTEST, part 2 (headless renders).

   Loops every fixture in battlemap-fixtures.js (emitted by battlemap-audit.mjs), loads
   battlemap-render.html?i=<n> in headless Chrome (WebGL via swiftshader), waits for window.__ready,
   and screenshots the #stage into dev/model-qa/battlemap-shots/. Reuses the proven puppeteer-core
   transport from ps1-capture.mjs. Then stitches an A/B contact sheet per room.

   RUN:  node dev/model-qa/battlemap-capture.mjs [--port 5178]

   DEV-ONLY. */

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

const arg = (name, def) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : def; };
const PORT = parseInt(arg("--port", "5178"), 10);
const OUT_DIR = path.join(repoRoot, "dev", "model-qa", "battlemap-shots");
const STAGE_W = 960, STAGE_H = 540, DSF = 2;

// fixtures are declared in the generated JS as `window.__BM_FIXTURES = [...]`; read them here too.
const fxSrc = fs.readFileSync(path.join(__dirname, "battlemap-fixtures.js"), "utf-8");
const FIXTURES = (new Function("var window={}; " + fxSrc + " return window.__BM_FIXTURES;"))();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
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
    executablePath: CHROME,
    headless: "new",
    args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-gpu-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: STAGE_W, height: STAGE_H + 60, deviceScaleFactor: DSF });

  const results = [];
  for (let i = 0; i < FIXTURES.length; i++) {
    const fx = FIXTURES[i];
    const errs = [];
    const onConsole = (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); };
    const onErr = (e) => errs.push("PAGEERROR " + e.message.slice(0, 160));
    page.on("console", onConsole); page.on("pageerror", onErr);

    const url = `http://127.0.0.1:${PORT}/dev/model-qa/battlemap-render.html?i=${i}&zoom=0`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    let ready = false;
    for (let t = 0; t < 100; t++) { if (await page.evaluate(() => !!window.__ready)) { ready = true; break; } await sleep(150); }
    await sleep(400);
    const err = await page.evaluate(() => window.__error || null);
    const cap = await page.$eval("#cap", (el) => el.innerText).catch(() => "");

    const file = `${String(i).padStart(2, "0")}-${fx.tag}-${fx.mode}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, file), clip: { x: 0, y: 0, width: STAGE_W, height: STAGE_H + 56 } });

    page.off("console", onConsole); page.off("pageerror", onErr);
    const status = err ? `SKIP(${err})` : (errs.length ? `ERR(${errs.length})` : "ok");
    results.push({ i, file, tag: fx.tag, mode: fx.mode, env: fx.env, status, errs, cap });
    console.log(`  [${status}] #${i} ${fx.name}`);
    if (errs.length) console.log("       " + errs.slice(0, 2).join(" | "));
  }

  await browser.close();
  if (ownServer) ownServer.kill("SIGTERM");

  // write a tiny index the findings doc / contact sheet can read
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(results.map(({ errs, cap, ...r }) => r), null, 2) + "\n");

  // build an HTML contact sheet: A/B side by side per room.
  const rooms = {};
  for (const r of results) (rooms[r.tag] ||= {})[r.mode] = r;
  const rows = Object.entries(rooms).map(([tag, ab]) => `
    <div class="room">
      <h3>${tag} <span class="env">(${(ab.A || ab.B).env})</span></h3>
      <div class="pair">
        <figure><figcaption>A — as-shipped (scene = {})</figcaption>${ab.A ? `<img src="${ab.A.file}">` : "<div class=miss>—</div>"}</figure>
        <figure><figcaption>B — fully-fed (rolled content wired in)</figcaption>${ab.B ? `<img src="${ab.B.file}">` : "<div class=miss>—</div>"}</figure>
      </div>
    </div>`).join("\n");
  const html = `<!doctype html><meta charset=utf-8><title>Battlemap Playtest — contact sheet</title>
<style>body{background:#0b0908;color:#e8e2d0;font:14px/1.5 -apple-system,sans-serif;margin:24px}
h1{font-size:20px}h3{margin:26px 0 8px;font-size:15px}.env{color:#8a8172;font-weight:400}
.pair{display:flex;gap:16px;flex-wrap:wrap}figure{margin:0}figcaption{font-size:12px;color:#8a8172;margin-bottom:4px}
img{width:520px;border:1px solid #4a3f2c;border-radius:6px;display:block}.miss{width:520px;height:300px;display:grid;place-items:center;border:1px dashed #4a3f2c;color:#5a5346}</style>
<h1>Battlemap Playtest — A (as-shipped) vs B (fully-fed)</h1>
<p style="color:#8a8172">Same rolled room, two renders. A = what a player sees today (engine derives no hazard/object zones). B = the same room's rolled hazards/objects/sizes mechanically wired into the scene.</p>
${rows}`;
  fs.writeFileSync(path.join(OUT_DIR, "contact-sheet.html"), html);

  const ok = results.filter((r) => r.status === "ok").length;
  console.log(`\n${ok}/${results.length} rendered clean · shots -> dev/model-qa/battlemap-shots/ · contact sheet -> battlemap-shots/contact-sheet.html`);
}
main().catch(async (e) => { console.error("FAILED:", e.stack || e.message); if (ownServer) ownServer.kill("SIGTERM"); process.exit(1); });
