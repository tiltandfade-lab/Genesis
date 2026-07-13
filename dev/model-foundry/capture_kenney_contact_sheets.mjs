#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const requireFromScratch = createRequire(path.join(process.env.HOME, ".genesis-jsdom", "package.json"));
const puppeteer = requireFromScratch("puppeteer-core");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outDir = path.join(__dirname, "contact-sheets");
const pageDir = path.join(outDir, "pages");
fs.mkdirSync(pageDir, {recursive: true});

const census = JSON.parse(fs.readFileSync(path.join(__dirname, "kenney-census.json"), "utf8"));
const byPack = new Map();
for (const asset of census.assets) {
  if (!byPack.has(asset.pack)) byPack.set(asset.pack, []);
  byPack.get(asset.pack).push(asset);
}

const mime = {".html":"text/html", ".js":"text/javascript", ".json":"application/json", ".glb":"model/gltf-binary"};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.resolve(root, "." + pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, {"Content-Type": mime[path.extname(file)] || "application/octet-stream", "Cache-Control":"no-store"});
    res.end(data);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const browser = await puppeteer.launch({executablePath: chrome, headless: "new", args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-gpu-sandbox"]});
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 1000, deviceScaleFactor: 1});
  await page.goto(`http://127.0.0.1:${port}/dev/model-foundry/kenney-viewer.html`, {waitUntil: "networkidle0"});
  await page.waitForFunction(() => window.__ready === true);
  const index = {schema:"genesis.kenney-contact-pages.v1", width:1280, height:1000, cell:{width:256,height:250,labelHeight:28}, pages:[], failures:[]};
  for (const [pack, assets] of [...byPack.entries()].sort()) {
    for (let offset = 0; offset < assets.length; offset += 20) {
      const entries = assets.slice(offset, offset + 20).map(asset => ({path:asset.path, name:asset.name, family:asset.family}));
      const failures = await page.evaluate(batch => window.renderBatch(batch), entries);
      const number = String(offset / 20 + 1).padStart(2, "0");
      const filename = `${pack}-${number}.png`;
      await page.screenshot({path:path.join(pageDir, filename)});
      index.pages.push({pack, filename, entries});
      index.failures.push(...failures);
      process.stdout.write(`captured ${filename} (${Math.min(offset + 20, assets.length)}/${assets.length})\n`);
    }
  }
  fs.writeFileSync(path.join(outDir, "page-index.json"), JSON.stringify(index, null, 2) + "\n");
  await browser.close(); server.close();
  if (index.failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
