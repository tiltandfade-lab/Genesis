#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME,
  ".genesis-jsdom", "node_modules", "puppeteer-core"));
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const outDir = path.join(repoRoot, "artifacts/golden-site-1-wall-modules-v004",
  "dimension-ladder");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png"
};
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const file = path.resolve(repoRoot, `.${pathname}`);
  if (file !== repoRoot && !file.startsWith(`${repoRoot}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404).end();
      return;
    }
    response.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
    response.end(data);
  });
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: [
    "--headless=new", "--no-sandbox", "--use-angle=swiftshader",
    "--enable-webgl", "--ignore-gpu-blocklist", "--hide-scrollbars"
  ]
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
try {
  await page.setViewport({ width: 1900, height: 1260, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}`
    + "/dev/material-cards/guard-wall-module-dimension-ladder.html",
  { waitUntil: "networkidle0", timeout: 45000 });
  await page.waitForFunction(() => window.__ready === true, { timeout: 45000 });
  const report = await page.evaluate(() => window.__renderReport);
  const sheet = await page.$("#sheet");
  const image = path.join(outDir, "guard-wall-module-dimension-ladder.png");
  await sheet.screenshot({ path: image });
  if (errors.length) throw new Error(errors.join("\n"));
  fs.writeFileSync(path.join(outDir, "receipt.json"), `${JSON.stringify({
    ...report,
    generatedAt: new Date().toISOString(),
    image: path.relative(repoRoot, image),
    verdict: "ENGINE-COMPILER-PROOF"
  }, null, 2)}\n`);
  console.log(image);
} catch (error) {
  if (errors.length) console.error(errors.join("\n"));
  throw error;
} finally {
  await browser.close();
  server.close();
}
