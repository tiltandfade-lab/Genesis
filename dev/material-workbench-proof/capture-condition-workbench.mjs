#!/usr/bin/env node
/**
 * Capture isolated age, erosion, wetness, and combined material-condition states
 * in real three.js/WebGL without opening a visible application window.
 */
import crypto from "node:crypto";
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
const outDir = path.join(here, "out");
const receiptPath = path.join(here, "condition-workbench-receipt.json");
const metricsPath = path.join(here, "generated", "condition-map-metrics.json");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const pagePath = "/dev/material-workbench-proof/material-condition-workbench.html";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png"
};
const states = [
  { id: "age-only", age: .85, erosion: 0, wetness: 0 },
  { id: "erosion-only", age: 0, erosion: .85, wetness: 0 },
  { id: "wetness-only", age: 0, erosion: 0, wetness: .85 },
  { id: "combined", age: .65, erosion: .55, wetness: .65 }
];

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function safeFile(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, "http://127.0.0.1").pathname);
  const candidate = path.resolve(repoRoot, `.${pathname}`);
  if (candidate !== repoRoot && !candidate.startsWith(`${repoRoot}${path.sep}`)) return null;
  return candidate;
}

const server = http.createServer((request, response) => {
  if (request.url === "/favicon.ico") {
    response.writeHead(204).end();
    return;
  }
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

async function capture(state) {
  await page.setViewport({ width: 1600, height: 1500, deviceScaleFactor: 1 });
  const query = new URLSearchParams({
    age: String(state.age),
    erosion: String(state.erosion),
    wetness: String(state.wetness),
    normal: "1.2"
  });
  await page.goto(`${origin}${pagePath}?${query}`, {
    waitUntil: "networkidle0",
    timeout: 45000
  });
  await page.waitForFunction(() => window.__ready === true, { timeout: 45000 });
  const report = await page.evaluate(() => window.__proofReport);
  const proof = await page.$("#proof");
  const output = path.join(outDir, `material-condition-${state.id}.png`);
  await proof.screenshot({ path: output });
  return {
    id: state.id,
    output: path.relative(repoRoot, output),
    sha256: sha256(output),
    report
  };
}

try {
  const captures = [];
  for (const state of states) captures.push(await capture(state));
  if (pageErrors.length) throw new Error(pageErrors.join("\n"));
  const metrics = JSON.parse(fs.readFileSync(metricsPath, "utf8"));
  const receipt = {
    schemaVersion: 1,
    proofId: "GENESIS-MATERIAL-CONDITION-WORKBENCH-V001",
    generatedAt: new Date().toISOString(),
    harness: "dev/material-workbench-proof/material-condition-workbench.html",
    browser: chrome,
    captures: captures.map(({ id, output, sha256: captureSha }) => ({
      id,
      path: output,
      sha256: captureSha
    })),
    renderReports: captures.map(({ id, report }) => ({ id, report })),
    sourceLineage: metrics.textures.map((texture) => ({
      id: texture.id,
      source: texture.source,
      sourceObjectSha256: texture.sourceStorage.oidSha256,
      proofAlbedoSha256: texture.albedo.sha256,
      byteIdenticalToSourceObject: texture.albedo.byteIdenticalToSourceObject,
      class: texture.class,
      structureContract: texture.structureContract
    })),
    pageErrors: []
  };
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`Captured ${captures.length} independent material-condition states.`);
  for (const item of receipt.captures) console.log(item.path);
} finally {
  let closeTimeout;
  await Promise.race([
    browser.close(),
    new Promise((resolve) => {
      closeTimeout = setTimeout(resolve, 5000);
      closeTimeout.unref?.();
    })
  ]);
  clearTimeout(closeTimeout);
  const browserProcess = browser.process();
  if (browserProcess && browserProcess.exitCode === null) browserProcess.kill("SIGTERM");
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}
