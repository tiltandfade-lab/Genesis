#!/usr/bin/env node
/**
 * Capture the sprite-first experiment in real three.js/WebGL using system
 * Chrome: one three-candidate overview plus one full-size card per candidate.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(
  path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core")
);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const outDir = path.join(here, "out", "sprite-first-material-v001");
const receiptPath = path.join(here, "sprite-first-material-card-receipt.json");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pagePath = "/dev/material-cards/sprite-first-material-experiment.html";
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(
      repoRoot,
      "dev/material-lane/manifests/sprite-first-material-experiment-v001.source.json"
    ),
    "utf8"
  )
);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png"
};

function safeFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
  const candidate = path.resolve(repoRoot, `.${pathname}`);
  if (candidate !== repoRoot && !candidate.startsWith(`${repoRoot}${path.sep}`)) return null;
  return candidate;
}

const server = http.createServer((request, response) => {
  const file = safeFile(request.url);
  if (!file) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404).end();
      return;
    }
    response.setHeader("Content-Type", mime[path.extname(file)] ?? "application/octet-stream");
    response.end(data);
  });
});

async function screenshot(page, url, viewport, output) {
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
  await page.waitForFunction(() => window.__ready === true, { timeout: 45000 });
  const report = await page.evaluate(() => window.__renderReport);
  const sheet = await page.$("#sheet");
  await sheet.screenshot({ path: output });
  return report;
}

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--use-angle=swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--hide-scrollbars"
  ]
});
const page = await browser.newPage();
const pageErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") pageErrors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => pageErrors.push(`pageerror: ${error.message}`));

try {
  const captures = [];
  const overview = path.join(outDir, "sprite-first-material-overview.png");
  const overviewReport = await screenshot(
    page,
    `${origin}${pagePath}`,
    { width: 2440, height: 1700 },
    overview
  );
  captures.push(path.relative(repoRoot, overview));

  for (const candidate of manifest.candidates) {
    const output = path.join(outDir, `${candidate.id}-sprite-first-material-card.png`);
    await screenshot(
      page,
      `${origin}${pagePath}?candidate=${encodeURIComponent(candidate.id)}`,
      { width: 1580, height: 1500 },
      output
    );
    captures.push(path.relative(repoRoot, output));
  }

  if (pageErrors.length) throw new Error(pageErrors.join("\n"));
  const receipt = {
    schemaVersion: 1,
    experimentId: manifest.experimentId,
    generatedAt: new Date().toISOString(),
    harness: "dev/material-cards/sprite-first-material-experiment.html",
    browser: chrome,
    captureCount: captures.length,
    captures,
    renderContract: overviewReport,
    pageErrors: []
  };
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`PASS: captured ${captures.length} sprite-first comparison images.`);
  for (const capture of captures) console.log(capture);
} finally {
  await browser.close();
  server.close();
}
