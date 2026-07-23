#!/usr/bin/env node
/**
 * Serve the worktree, run the real three.js r166/WebGL material-card harness in
 * system Chrome, and capture full-size, app-width, and per-candidate review PNGs.
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
const outDir = path.join(here, "out", "guard-post-mm13-v001");
const receiptPath = path.join(here, "guard-post-card-receipt.json");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pagePath = "/dev/material-cards/guard-post-material-cards.html";
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "dev/material-lane/manifests/guard-post-stone-v001.json"),
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

async function screenshot(page, url, viewport, output, fullPage = false) {
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
  await page.waitForFunction(() => window.__ready === true, { timeout: 45000 });
  const report = await page.evaluate(() => window.__renderReport);
  if (fullPage) {
    await page.screenshot({ path: output, fullPage: true });
  } else {
    const sheet = await page.$("#sheet");
    await sheet.screenshot({ path: output });
  }
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
  const full = path.join(outDir, "guard-post-material-overview-full.png");
  const fullReport = await screenshot(
    page,
    `${origin}${pagePath}?mode=overview`,
    { width: 2240, height: 1800 },
    full
  );
  captures.push(path.relative(repoRoot, full));

  const app = path.join(outDir, "guard-post-material-overview-app.png");
  await screenshot(
    page,
    `${origin}${pagePath}?mode=app`,
    { width: 1440, height: 1200 },
    app
  );
  captures.push(path.relative(repoRoot, app));

  for (const candidate of manifest.candidates) {
    const output = path.join(outDir, `${candidate.id.toLowerCase()}-material-card.png`);
    await screenshot(
      page,
      `${origin}${pagePath}?candidate=${encodeURIComponent(candidate.id)}`,
      { width: 1540, height: 1400 },
      output
    );
    captures.push(path.relative(repoRoot, output));
  }

  if (pageErrors.length) throw new Error(pageErrors.join("\n"));
  const receipt = {
    schemaVersion: 1,
    batchId: manifest.batchId,
    generatedAt: new Date().toISOString(),
    harness: "dev/material-cards/guard-post-material-cards.html",
    browser: chrome,
    captureCount: captures.length,
    captures,
    renderContract: fullReport,
    pageErrors: []
  };
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`PASS: captured ${captures.length} material review images with real three.js/WebGL.`);
  for (const capture of captures) console.log(capture);
} finally {
  await browser.close();
  server.close();
}
