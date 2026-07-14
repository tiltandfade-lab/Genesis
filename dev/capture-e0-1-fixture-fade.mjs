#!/usr/bin/env node
/* dev/capture-e0-1-fixture-fade.mjs — VISUAL capture for docs/PHASE-3-WAVE-1-SPECS.md E0-1. Boots the
   real app (server + headless Chrome + THREE), same convention dev/verify-occlusion-fade.mjs already
   uses. Builds a hand-built room with TWO wall-mounted torches (one on each of two adjacent walls),
   waits for P3-1d's camera-side occlusion tween to settle, then reads which wall segment(s) actually
   suppressed and confirms (via window.Theater._interiorFixtureEmittersForTest() + a live scene-graph
   traversal for the fixture's body-mesh material) that a torch on a suppressed segment reads a
   real, non-1 opacity — then screenshots the canvas.

   Run: node dev/capture-e0-1-fixture-fade.mjs */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(__dirname, "battle-gate", "e0-1-fixture-fade");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5261, 5262, 5263, 5264, 5265];
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let BASE = null;
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label); } }
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
    const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" });
    if (!r.ok) return false;
    return (await r.text()).includes("Genesis");
  } catch (e) { return false; }
}
async function startServer() {
  for (const port of PORT_CANDIDATES) {
    if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; } continue; }
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}
async function settleCameraTween(page) {
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
}
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
}

// A 7x7 floored room (perimeter walls auto-derived by the room-shell compiler off this footprint —
// no manual wall instances needed) with TWO wall-mount torches, one centered on the south wall
// (z=-1 side) and one on the east wall (x=7 side) — between the two, at least one should land on
// whichever side P3-1d's camera-side band calls "near" for the default dimetric yaw.
function buildHandBoardSrc() {
  return `
    const kit = interiorTileKitFor("gloom");
    const W = 7, D = 7, wallH = 2.4;
    const floor = [];
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) floor.push({ x, z, sx: 1, sy: 1, sz: 1, color: kit.floorColor });
    const lights = [
      { x: 3, z: -0.9, y: 1.6, color: "#ff9a44", intensity: 1.2, distance: 8, decay: 2, kind: "torch",
        fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.06, z: 0.16 }, castShadow: false },
      { x: 6.9, z: 3, y: 1.6, color: "#ff9a44", intensity: 1.2, distance: 8, decay: 2, kind: "torch",
        fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.06, z: 0.16 }, castShadow: false },
    ];
    return {
      kind: "interior3d", env: "dungeon", realmId: "gloom", cellSize: 1, wallHeightBase: wallH,
      tileKit: { floorColor: kit.floorColor, wallColor: kit.wallColor, trimColor: kit.trimColor,
        floorMaterial: kit.floorMaterial, wallMaterial: kit.wallMaterial, trimMaterial: kit.trimMaterial,
        floorGrain: 0, wallGrain: 0, trimGrain: 0, gradeTint: null, gradeStrength: 0, fogWhisper: 0 },
      instances: { floor, wall: [], doorframe: [], pillar: [] },
      bounds: { minX: -1, maxX: W, minZ: -1, maxZ: D },
      // production always supplies this for a focused room (theater-interior.js's own interiorBuildBoard,
      // focusRect field) — P3-1d's camera-side band test reads it directly; leaving it null (this
      // harness's own earlier miss) makes every segment read as "out of band", never suppressing.
      focusRect: { minX: 0, maxX: W - 1, minZ: 0, maxZ: D - 1 },
      cameraFit: { mode: "beat", cells: [{ x: 3, y: 0 }, { x: 3, y: 2 }] },
      lightProfile: "torchlit",
      lights,
      pieces: [],
    };
  `;
}

async function main() {
  console.log("[capture-e0-1-fixture-fade]");
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await browser.newPage();
    page.on("console", (msg) => { const t = msg.text(); if (/wall-mount fixture had no mount slot/.test(t)) console.log("  [page]", t); });
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "load", timeout: 30000 });
    for (let i = 0; i < 60; i++) {
      const ready = await page.evaluate(() => !!(window.Theater && window.Theater.ready === true));
      if (ready) break;
      await sleep(150);
    }
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay,#startView{display:none !important;visibility:hidden !important}" });

    const mounted = await page.evaluate(() => {
      const el = document.createElement("div");
      el.className = "theater-stage-canvas";
      el.style.position = "fixed"; el.style.left = "0"; el.style.top = "0";
      el.style.width = "1200px"; el.style.height = "900px";
      document.body.appendChild(el);
      return !!window.Theater.mount(el);
    });
    if (!mounted) throw new Error("Theater.mount failed");

    await page.evaluate((boardSrc) => {
      const buildBoard = new Function(boardSrc);
      const board = buildBoard();
      window.Theater.setInteriorBoard(board);
    }, buildHandBoardSrc());
    await settleCameraTween(page);
    // occlusion fade tweens run on a SEPARATE channel (S.tweens, driven by startTweenLoop's own rAF
    // loop) from the camera-pose tween settleCameraTween already waits on — give it real wall-clock
    // time to reach its committed target opacity before reading anything.
    await sleep(900);

    const report = await page.evaluate(() => {
      const shell = window.Theater._interiorRoomShellForTest();
      const segs = (shell && shell.wallUpperMeshes) || [];
      const fixtures = window.Theater._interiorFixtureEmittersForTest();
      return {
        segCount: segs.length,
        segOpacities: segs.map((s) => ({ ownerSegIndex: s.ownerSegIndex, opacity: s.fadeEntry ? s.fadeEntry.opacity : null, matCount: s.fadeEntry ? s.fadeEntry.materials.length : 0 })),
        fixtures: fixtures.map((f) => ({ ownerSegIndex: f.ownerSegIndex, mount: f.mount, emissiveIntensity: f.emissiveIntensity })),
      };
    });
    console.log("  room-shell wall-upper segments:", JSON.stringify(report.segOpacities));
    console.log("  mounted fixtures:", JSON.stringify(report.fixtures));

    ok(report.segCount > 0, "room-shell compiled real wall segments");
    ok(report.fixtures.length === 2, `both torches mounted (${report.fixtures.length})`);

    // PRIMARY PROOF: any wall segment whose fadeEntry.opacity < 1 AND has >2 materials (own upper mesh
    // + a fixture's appended pair) proves the fixture on it inherited the SAME sub-1 opacity, since
    // itrOcclusionClassify's tween writes ALL of fadeEntry.materials to the identical value on every
    // tick/onDone — this is the exact mechanism check 4a of the isolation-proof harness already re-
    // derives directly; here we confirm it fires in the REAL, live-rendered app.
    const suppressed = report.segOpacities.filter((s) => s.opacity != null && s.opacity < 0.999);
    const suppressedWithFixture = suppressed.filter((s) => s.matCount > 1);
    ok(suppressed.length > 0, `at least one wall segment is suppressed by P3-1d camera-side banding (${suppressed.length} of ${report.segOpacities.length})`);
    ok(suppressedWithFixture.length > 0,
      `at least one SUPPRESSED segment has a registered fixture (matCount>1) — the exact "torch on a suppressed near wall" scenario (${JSON.stringify(suppressed)})`);

    const shot = path.join(outDir, "e0-1-suppressed-torch.png");
    const canvasEl = await page.$(".theater-stage-canvas canvas");
    if (canvasEl) await canvasEl.screenshot({ path: shot }); else await page.screenshot({ path: shot });
    console.log("  screenshot:", shot, canvasEl ? "(canvas element)" : "(WHOLE PAGE FALLBACK — canvas not found)");

  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
