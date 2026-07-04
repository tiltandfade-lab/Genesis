#!/usr/bin/env node
/* dev/model-qa/capture-texture-preview.mjs — headless capture driver for texture-preview.html
   (Adam's ChatGPT material-tile round-trip test). Mirrors the proven transport from
   capture-piece.mjs / ps1-capture.mjs: system Chrome via puppeteer-core in ~/.genesis-jsdom,
   ANGLE/swiftshader for headless WebGL.

   Serves THIS worktree on PORT 5177 (lsof-checked free at authoring time; falls back to 5183
   if 5177 is foreign-owned). Renders each of the 12 creature/atlas mappings + composes the
   labeled 12-cell sheet.

   RUN (from repo root):
     node dev/model-qa/capture-texture-preview.mjs

   Writes:
     dev/model-qa/chatgpt-swatch/preview/NN-creature.png   (one per mapping; vc1 variant gets -vc1 suffix)
     dev/model-qa/chatgpt-swatch/texture-preview-12.png    (composed 4x3 labeled sheet) */
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
const PRIMARY_PORT = 5177, FALLBACK_PORT = 5183;

const outDir = path.join(__dirname, "chatgpt-swatch", "preview");
fs.mkdirSync(outDir, { recursive: true });

/* THE 12 MAPPINGS (tile -> creature builder). vc:1 renders BOTH modes (vertexColors off + on) for
   comparison; all others default to vc:0 (texture-at-strength, the primary test mode). */
const MAPPINGS = [
  { n: "01", creature: "mon-dragon.js",       fn: "buildYoungDragon",   atlas: "04-red-dragon-scale",     label: "YOUNG RED DRAGON · red-dragon-scale" },
  { n: "02", creature: "mon-lizard.js",       fn: "buildGiantLizard",   atlas: "05-green-dragon-scale",   label: "GIANT LIZARD · green-dragon-scale" },
  { n: "03", creature: "mon-snake.js",        fn: "buildGiantSnake",    atlas: "07-black-serpent-scale",  label: "GIANT CONSTRICTOR SNAKE · black-serpent-scale" },
  { n: "04", creature: "mon-wolf.js",         fn: "buildWolf",          atlas: "09-grey-wolf-fur",        label: "WOLF · grey-wolf-fur", both: true },
  { n: "05", creature: "mon-troll.js",        fn: "buildTroll",         atlas: "10-white-yeti-fur",       label: "TROLL · white-yeti-fur" },
  { n: "06", creature: "mon-skeleton.js",     fn: "buildSkeleton",      atlas: "11-bleached-bone",        label: "SKELETON · bleached-bone" },
  { n: "07", creature: "spider.js",           fn: "buildSpider",        atlas: "13-black-chitin",         label: "GIANT SPIDER · black-chitin" },
  { n: "08", creature: "mon-armor.js",        fn: "buildAnimatedArmor", atlas: "15-rusted-iron",          label: "ANIMATED ARMOR · rusted-iron" },
  { n: "09", creature: "npc-cultist.js",      fn: "buildCultist",       atlas: "19-crimson-robe",         label: "CULTIST · crimson-robe" },
  { n: "10", creature: "mon-needleblight.js", fn: "buildNeedleBlight",  atlas: "21-treant-bark",          label: "NEEDLE BLIGHT · treant-bark" },
  { n: "11", creature: "mon-fireelem.js",     fn: "buildFireElemental",atlas: "24-lava-crack",           label: "FIRE ELEMENTAL · lava-crack" },
  { n: "12", creature: "mon-shadow.js",       fn: "buildShadow",        atlas: "25-ghost-vapor",          label: "SHADOW · ghost-vapor" },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
function portInUse(port){
  return new Promise(resolve => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}

let server = null, PORT = PRIMARY_PORT;
async function startServer(){
  if(await portInUse(PRIMARY_PORT)){
    try{
      const r = await fetch(`http://127.0.0.1:${PRIMARY_PORT}/dev/model-qa/texture-preview.html`, { cache:"no-store" });
      if(r.ok){ PORT = PRIMARY_PORT; console.log(`[cap] reusing :${PRIMARY_PORT} (this tree)`); return; }
    }catch(e){}
    console.log(`[cap] :${PRIMARY_PORT} busy with a foreign root, falling back to :${FALLBACK_PORT}`);
    PORT = FALLBACK_PORT;
    if(await portInUse(FALLBACK_PORT)) throw new Error(`both ${PRIMARY_PORT} and ${FALLBACK_PORT} busy`);
  }
  console.log(`[cap] starting python3 -m http.server ${PORT} in ${repoRoot}`);
  server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"],
    { cwd: repoRoot, stdio: "ignore" });
  for(let i=0;i<40;i++){ if(await portInUse(PORT)) return; await sleep(150); }
  throw new Error("server failed to start on " + PORT);
}

async function shootOne(page, m, vc){
  const suffix = vc === 1 ? "-vc1" : "";
  const outFile = path.join(outDir, `${m.n}-${m.creature.replace(/\.js$/,"")}${suffix}.png`);
  const label = vc === 1 ? m.label + " (vc:ON)" : m.label;
  const url = `http://127.0.0.1:${PORT}/dev/model-qa/texture-preview.html`
    + `?creature=${encodeURIComponent(m.creature)}&fn=${encodeURIComponent(m.fn)}`
    + `&atlas=${encodeURIComponent("./chatgpt-swatch/tiles-a/" + m.atlas + ".png")}`
    + `&label=${encodeURIComponent(label)}&vc=${vc}`;
  const errs = [];
  page.removeAllListeners("console"); page.removeAllListeners("pageerror");
  page.on("console", ev => { if(ev.type()==="error") errs.push(ev.text().slice(0,200)); });
  page.on("pageerror", e => errs.push("PAGEERROR " + e.message));
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
  let ok = false;
  for(let i=0;i<80;i++){ if(await page.evaluate(()=>!!window.__ready)){ ok = true; break; } await sleep(150); }
  await sleep(250);
  const stat = await page.$eval("#stat", el => el.textContent).catch(()=>"(no stat)");
  const grid = await page.$("#grid");
  if(grid){ await grid.screenshot({ path: outFile }); } else { await page.screenshot({ path: outFile }); }
  const kb = (fs.statSync(outFile).size/1024).toFixed(0);
  console.log(`[cap] ${m.n} ${m.creature}${suffix} -> ${path.relative(repoRoot,outFile)} (${kb}KB) ready=${ok} :: ${stat}${errs.length? " :: ERR "+errs.join(" | "):""}`);
  return { outFile, ok, errs, stat };
}

async function main(){
  await startServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: "new",
    args: ["--use-angle=swiftshader","--enable-webgl","--ignore-gpu-blocklist","--no-sandbox","--window-size=420,520"],
  });
  const results = [];
  try{
    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 500, deviceScaleFactor: 2 });
    for(const m of MAPPINGS){
      results.push(await shootOne(page, m, 0));
      if(m.both) results.push(await shootOne(page, m, 1));
    }
    await page.close();
  } finally {
    await browser.close();
    if(server){ try{ server.kill("SIGTERM"); }catch(e){} }
  }
  const failed = results.filter(r => !r.ok || r.errs.length);
  console.log(`\n[cap] done: ${results.length} shots, ${failed.length} with issues.`);
  if(failed.length) process.exitCode = 1;
}
main().catch(e => { console.error("[cap] FAILED:", e.stack||e.message); if(server){try{server.kill("SIGTERM");}catch(_){}} process.exit(1); });
