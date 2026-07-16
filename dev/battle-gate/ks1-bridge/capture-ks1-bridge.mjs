#!/usr/bin/env node
/* dev/battle-gate/ks1-bridge/capture-ks1-bridge.mjs — KS-1 three-card bridge gate driver. Boots a
   local static server (python3 -m http.server, same convention as dev/battle-gate/ab-flip-cards/
   capture-ab-flip.mjs — that file's own header documents the port/probe boilerplate this script
   copies verbatim) and Chrome headless via puppeteer-core, navigates to harness.html (a STANDALONE
   scene — see that file's own header for why this unit doesn't drive the live genesis.html app),
   and for each donor family captures RAW / DIRECT_MODULATED / grey-silhouette panels, composites
   them into one three-panel card, and writes dev/battle-gate/ks1-bridge/results.json.

   This script does NOT itself render a verdict — it only captures. The verdicts (DIRECT_MODULATED
   vs CHASSIS per family, with an honest description of what was actually seen) are written by
   the orchestrator AFTER reading the produced cards, per the KS-1 spec's own instruction ("READ
   your cards yourself; classify each family DIRECT_MODULATED or CHASSIS honestly").

   Run:  node dev/battle-gate/ks1-bridge/capture-ks1-bridge.mjs */
import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const outDir = __dirname;
const shotsDir = path.join(outDir, "shots");
fs.mkdirSync(shotsDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5261, 5262, 5263, 5264, 5265];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[ks1-bridge]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}
async function probeRoot(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/dev/battle-gate/ks1-bridge/harness.html`, { cache: "no-store" });
    return r.ok;
  } catch (e) { return false; }
}
async function startServer() {
  for (const port of PORT_CANDIDATES) {
    if (await portInUse(port)) {
      if (await probeRoot(port)) { log(`port ${port} already serving THIS tree — reusing it`); BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; }
      continue;
    }
    log(`starting python3 -m http.server ${port} (bind 127.0.0.1) in ${repoRoot}`);
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}

const SHOT_W = 1200, SHOT_H = 900;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}
async function newPage(browser) {
  const page = await browser.newPage();
  page.on("console", (msg) => { if (msg.type() === "error") log("PAGE CONSOLE ERROR:", msg.text()); });
  page.on("pageerror", (e) => log("PAGE ERROR:", e.message));
  page.on("response", (res) => { if (res.status() >= 400) log("HTTP", res.status(), res.url()); });
  return page;
}

// FAMILIES — one three-panel card per (pack, representative slug), covering both packs plus the
// doorway/hinge assembly (KS-1's own centerpiece feature — "Sockets (the point)"). "loose
// strictness" per Adam's ruling: this is a REPRESENTATIVE sample per pack, not exhaustive
// per-piece capture (47 admitted pieces share the SAME material recipe per family — the recipe
// is what the gate judges, not every individual mesh).
const FAMILIES = [
  { pack: "kenney-modular-dungeon-kit", slug: "room-small", label: "modular-dungeon-kit / room-small (room-shell architecture)" },
  { pack: "kenney-modular-dungeon-kit", slug: "gate-door", label: "modular-dungeon-kit / gate-door (doorway-frame + hinge leaf)" },
  { pack: "kenney-mini-dungeon", slug: "wall", label: "mini-dungeon / wall (wall architecture)" },
];

async function captureOne(page, pack, slug, mode) {
  const ok = await page.evaluate(async (pack, slug, mode) => {
    try {
      await window.__ks1Capture(pack, slug, mode, { realmId: "fantasy", realmProfile: null });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message, stack: e.stack };
    }
  }, pack, slug, mode);
  if (!ok.ok) throw new Error(`capture(${pack}/${slug}/${mode}) failed: ${ok.error}\n${ok.stack || ""}`);
  await sleep(100);
  const shotPath = path.join(shotsDir, `${pack}-${slug}-${mode}.png`);
  const canvasEl = await page.$("#c");
  await canvasEl.screenshot({ path: shotPath });
  return shotPath;
}

async function buildComposite(page, family, shots) {
  const cellW = 380, cellH = 285, labelH = 30, pad = 8;
  const titles = { raw: "RAW (Kenney authored)", direct: "DIRECT_MODULATED (Genesis recipe, real interior, torchlit)", grey: "GREY SILHOUETTE (gameplay size)" };
  const modes = ["raw", "direct", "grey"];
  const b64s = {};
  for (const m of modes) b64s[m] = fs.readFileSync(shots[m]).toString("base64");
  const sheetB64 = await page.evaluate(({ b64s, cellW, cellH, labelH, pad, label, modes, titles }) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = modes.length * (cellW + pad) + pad;
      canvas.height = cellH + labelH * 2 + pad * 2;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#eee"; ctx.font = "16px monospace";
      ctx.fillText(`KS-1 BRIDGE — ${label}`, pad, 20);
      let loaded = 0;
      const draw = (m, ci) => {
        const im = new Image();
        im.onload = () => {
          const x = pad + ci * (cellW + pad);
          ctx.drawImage(im, x, labelH + pad, cellW, cellH);
          ctx.fillStyle = "#9cf"; ctx.font = "12px monospace";
          ctx.fillText(titles[m], x + 2, labelH + pad + cellH + 16);
          loaded++;
          if (loaded === modes.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
        };
        im.onerror = () => { loaded++; if (loaded === modes.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
        im.src = "data:image/png;base64," + b64s[m];
      };
      modes.forEach((m, i) => draw(m, i));
    });
  }, { b64s, cellW, cellH, labelH, pad, label: family.label, modes, titles });
  const compositePath = path.join(outDir, `${family.pack}-${family.slug}-card.png`);
  fs.writeFileSync(compositePath, Buffer.from(sheetB64, "base64"));
  return compositePath;
}

async function main() {
  let branch = null, sha = null;
  try { branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: repoRoot }).toString().trim(); } catch (e) {}
  try { sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot }).toString().trim(); } catch (e) {}

  const server = await startServer();
  log("server:", BASE);
  const browser = await launchChrome();
  const summary = { generatedAt: new Date().toISOString(), branch, sha, families: [] };
  try {
    const page = await newPage(browser);
    await page.goto(`${BASE}/dev/battle-gate/ks1-bridge/harness.html`, { waitUntil: "networkidle0", timeout: 30000 });

    for (const family of FAMILIES) {
      log(`=== family: ${family.label} ===`);
      const shots = {};
      for (const mode of ["raw", "direct", "grey"]) {
        log(`  capturing ${mode}...`);
        shots[mode] = await captureOne(page, family.pack, family.slug, mode);
      }
      const compositePath = await buildComposite(page, family, shots);
      summary.families.push({
        pack: family.pack, slug: family.slug, label: family.label,
        shots: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, path.relative(outDir, v)])),
        composite: path.relative(outDir, compositePath),
      });
      log(`  composite -> ${path.relative(outDir, compositePath)}`);
    }

    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(summary, null, 2));
    log("wrote results.json (capture-only — verdicts added by the orchestrator after reading the cards)");
  } catch (e) {
    summary.error = e.message;
    summary.stack = e.stack;
    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(summary, null, 2));
    log("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
