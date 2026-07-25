/* THEATER SPLIT — public-contract gate (recon §6.4; brief "Required proof §1").

   Boots the real genesis.html under headless Chrome in both baseline modes (plain and
   ?clayroom=1&clayfixture=lights) and diffs the LIVE window.Theater surface — sorted key set +
   per-key typeof/accessor shape — against the Step-0 contract freeze at
   dev/fixtures/theater-surface-baseline.json.

   Run at EVERY split checkpoint. A missing key, a new key, or a shape change (function→accessor,
   accessor→value) is a FAIL: the 218-key facade must not lose or morph a seam silently. If the
   contract genuinely changes, regenerate the baseline with
   dev/capture-theater-surface-baseline.cjs in the same commit WITH an explanation — never to
   green a diff.

   Same puppeteer-core/boot convention as every other render harness (CI skips when
   puppeteer-core is unavailable; this gate is a BY-HAND gate on the split machine). */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASELINE_PATH = path.join(__dirname, "fixtures", "theater-surface-baseline.json");
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5361, 5362, 5363, 5364, 5365];

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log("  ok: " + label); }
  else { fail++; console.log("  FAIL: " + label); }
}

function portFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port, "127.0.0.1");
  });
}

async function startServer() {
  for (const port of PORT_CANDIDATES) {
    if (!(await portFree(port))) continue;
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"],
      { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 50; i++) {
      await new Promise((r) => setTimeout(r, 100));
      if (!(await portFree(port))) return { proc, port };
    }
    proc.kill();
  }
  throw new Error("no free port for the surface gate server");
}

async function surfaceOf(browser, url, waitForCanvas) {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.Theater && typeof window.Theater.mount === "function", { timeout: 30000 });
  if (waitForCanvas) {
    await page.waitForFunction(() => !!document.querySelector("canvas"), { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2500));
  } else {
    await new Promise((r) => setTimeout(r, 1500));
  }
  const surface = await page.evaluate(() => {
    const T = window.Theater;
    const keys = Object.keys(T).sort();
    const types = {};
    keys.forEach((k) => {
      const d = Object.getOwnPropertyDescriptor(T, k);
      types[k] = (d && (d.get || d.set)) ? "accessor" : typeof T[k];
    });
    return { keys, types };
  });
  await page.close();
  return { surface, pageErrors };
}

function diffSurface(label, live, frozen) {
  const liveSet = new Set(live.keys);
  const frozenSet = new Set(frozen.keys);
  const missing = frozen.keys.filter((k) => !liveSet.has(k));
  const added = live.keys.filter((k) => !frozenSet.has(k));
  const morphed = frozen.keys.filter((k) => liveSet.has(k) && live.types[k] !== frozen.types[k])
    .map((k) => `${k}: ${frozen.types[k]} -> ${live.types[k]}`);
  ok(missing.length === 0, `${label}: no baseline key missing` + (missing.length ? ` — MISSING: ${missing.join(", ")}` : ""));
  ok(added.length === 0, `${label}: no unexplained new key` + (added.length ? ` — ADDED: ${added.join(", ")}` : ""));
  ok(morphed.length === 0, `${label}: no key changed shape` + (morphed.length ? ` — MORPHED: ${morphed.join("; ")}` : ""));
}

(async () => {
  console.log("verify-theater-surface — the split's public-contract gate\n");
  ok(fs.existsSync(BASELINE_PATH), "baseline fixture exists (dev/fixtures/theater-surface-baseline.json)");
  if (!fs.existsSync(BASELINE_PATH)) { console.log(`\n${pass} passed, ${fail} failed`); process.exit(1); }
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));

  const { proc, port } = await startServer();
  const BASE = `http://127.0.0.1:${port}`;
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: "new",
      args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
      defaultViewport: { width: 1280, height: 720 },
    });

    const plain = await surfaceOf(browser, BASE + "/genesis.html", false);
    ok(plain.pageErrors.length === 0, "plain boot: zero page errors" + (plain.pageErrors.length ? ` — ${plain.pageErrors[0]}` : ""));
    diffSurface("plain", plain.surface, baseline.plain);

    const clay = await surfaceOf(browser, BASE + "/genesis.html?clayroom=1&clayfixture=lights", true);
    ok(clay.pageErrors.length === 0, "clayroom boot: zero page errors" + (clay.pageErrors.length ? ` — ${clay.pageErrors[0]}` : ""));
    diffSurface("clayroom", clay.surface, baseline.clayroom);
  } finally {
    if (browser) await browser.close();
    proc.kill();
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("SURFACE_GATE_ERROR", e.message); console.log(`\n${pass} passed, ${fail + 1} failed`); process.exit(1); });
