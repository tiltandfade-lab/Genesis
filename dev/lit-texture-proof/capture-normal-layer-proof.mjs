#!/usr/bin/env node
/**
 * Capture the normal-layer A/B proof under opposed tangent-light directions
 * with equal front incidence using system Chrome and real three.js/WebGL.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(
  path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core")
);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const outDir = path.join(here, "out");
const receiptPath = path.join(here, "normal-layer-proof-receipt.json");
const metricsPath = path.join(here, "generated", "normal-layer-metrics.json");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const proofPath = "/dev/lit-texture-proof/normal-layer-proof.html";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png"
};

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

async function capture(name, azimuth) {
  await page.setViewport({ width: 1600, height: 1500, deviceScaleFactor: 1 });
  const url = `${origin}${proofPath}?azimuth=${azimuth}&elevation=34&normal=1.4`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
  await page.waitForFunction(() => window.__ready === true, { timeout: 45000 });
  const report = await page.evaluate(() => window.__proofReport);
  const proof = await page.$("#proof");
  const output = path.join(outDir, name);
  await proof.screenshot({ path: output });
  return {
    output: path.relative(repoRoot, output),
    sha256: sha256(output),
    report
  };
}

try {
  const angleA = await capture("normal-layer-proof-light-right.png", 45);
  const angleB = await capture("normal-layer-proof-light-left.png", 135);
  if (pageErrors.length) throw new Error(pageErrors.join("\n"));
  const metrics = JSON.parse(fs.readFileSync(metricsPath, "utf8"));
  const receipt = {
    schemaVersion: 1,
    proofId: "GENESIS-NORMAL-LAYER-AB-V001",
    generatedAt: new Date().toISOString(),
    harness: "dev/lit-texture-proof/normal-layer-proof.html",
    browser: chrome,
    captures: [angleA.output, angleB.output],
    captureHashes: [angleA.sha256, angleB.sha256],
    renderReports: [angleA.report, angleB.report],
    sourceLineage: metrics.textures.map((texture) => ({
      id: texture.id,
      source: texture.source,
      sourceObjectSha256: texture.sourceStorage.oidSha256,
      proofAlbedoSha256: texture.albedo.sha256,
      byteIdenticalToSourceObject: texture.albedo.byteIdenticalToSourceObject,
      normalSha256: texture.normal.sha256
    })),
    pageErrors: []
  };
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log("Captured normal-layer A/B proof under opposed tangent-light directions.");
  for (const capturePath of receipt.captures) console.log(capturePath);
} finally {
  await browser.close();
  server.close();
}
