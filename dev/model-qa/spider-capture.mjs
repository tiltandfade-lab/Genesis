/* dev/model-qa/probe-capture.mjs — one-off headless shot of spider-probe.html.
   Mirrors capture.mjs's transport (system Chrome via puppeteer-core in ~/.genesis-jsdom,
   ANGLE/swiftshader for WebGL-in-headless). Serves the repo on 5177, screenshots the
   probe canvas, writes probe.png beside this file. */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const PORT = 5177;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: "ignore" });
await new Promise(r => setTimeout(r, 900));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--window-size=1300,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1300, height: 860, deviceScaleFactor: 2 });
const errs = [];
page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", e => errs.push("PAGEERROR " + e.message));
await page.goto(`http://127.0.0.1:${PORT}/dev/model-qa/spider-probe.html`, { waitUntil: "networkidle0", timeout: 20000 });
await new Promise(r => setTimeout(r, 700));
const stat = await page.$eval("#stat", el => el.textContent).catch(() => "(no stat)");
const buf = await page.$("#stage").then(h => h.screenshot());
fs.writeFileSync(path.join(__dirname, "spider-probe.png"), buf);
console.log("STAT:", stat);
console.log("ERRORS:", errs.length ? errs.join("\n  ") : "none");
await browser.close();
server.kill();
