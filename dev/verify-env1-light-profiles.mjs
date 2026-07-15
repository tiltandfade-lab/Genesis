#!/usr/bin/env node
/* dev/verify-env1-light-profiles.mjs — ENV-1 (docs/ENV-EXTERIOR-WAVE.md): "light profiles
   differentiate everywhere". Boots the real app (server + headless Chrome + THREE), same
   convention dev/verify-qfb-tray.mjs / dev/capture-e0-1-fixture-fade.mjs already use.

   ROOT CAUSE (measured live against dev/play-lens/run-pl1-002/pl-004..009, ledger #8):
   applyLightProfile (src/ui/theater-boot.js) ALREADY ran on the flat tabletop channel (setBoard) —
   every node/travel/settlement/combat/idle tray was already "consuming the active profile" in that
   narrow sense. Two things nonetheless made daylit/overcast/moonlit render pixel-identical on that
   channel: (1) the void/background tint (ENV_VOID_TINT/voidTintFor) is keyed ONLY by `env`, never
   by the light profile — the same wilderness travel leg shows the identical near-black void
   whichever mood the walk rolled; (2) STAGE_AMBIENT_FLOOR (0.42) clamps overcast (0.39) and
   moonlit (0.36) to the IDENTICAL ambient on this channel, erasing the mood table's own small gap.
   FIX (theater-boot.js): TABLETOP_EXTERIOR_LOOK (new, tabletop-channel-only table) +
   voidTintForTabletop/applyTabletopExteriorLook (new functions, called only from setBoard) —
   dark/torchlit/lavalit/fungal-glow/magic-glow/lamplit/voidlit are the PROTECTION SET (absent from
   the new table -> byte-identical to before this unit); daylit/overcast/moonlit get a profile-
   driven ambient + background wash. LIGHT_PROFILES/applyLightProfile/STAGE_AMBIENT_FLOOR/
   setInteriorBoard themselves are untouched — the interior channel overwrites ambient/hemi/key/
   fill from its OWN ITR_BRIGHT_REALM_FILL/ITR_SCENE_* tables regardless, so editing the shared
   table would have risked interior byte-stability for no reason.

   Sections:
     0. RED-FIRST, source-level: TABLETOP_EXTERIOR_LOOK/voidTintForTabletop/applyTabletopExteriorLook
        did not exist at the branch's base commit.
     1. RED-FIRST, empirical: the SAME fixture tray rendered daylit vs moonlit on a scratch server
        running the BASE COMMIT's theater-boot.js (symlinked repo, only that one file swapped) —
        mean-luma delta is BELOW the "materially different" threshold (today's bug, reproduced live).
     2. GREEN: the same comparison on the CURRENT (fixed) code — mean-luma delta clears the
        threshold, and the 4-profile luma ordering (daylit > overcast > moonlit >= dark) holds.
     3. Diagnostic-accessor checks (_tabletopSceneLightsForTest): exact ambient/background values
        per profile, including the protection-set profile (dark) matching its OLD pre-unit value
        byte-for-byte (STAGE_AMBIENT_FLOOR itself, env-keyed void) — proving the protection set is
        genuinely untouched, not just "close enough."
     4. Cross-env: the SAME light profile yields the SAME background/ambient on two different envs
        (profile wins over env for the 3 exterior moods) — "differentiates everywhere," not just
        one env.
     5. Interior + tabletop-protection-set byte-stability: OLD-server vs NEW-server screenshot
        pixel-diff for (a) an interior3d tray under torchlit, (b) the same interior under daylit
        (the interior channel's OWN pre-existing bright-realm path), (c) a tabletop tray under dark.
        All three must be pixel-identical (epsilon ~0, allowing only for benign nondeterminism).
     6. CAPTURE CARD: one fixture tray x 4 profiles, same camera, saved to
        dev/battle-gate/env1-profiles/ for hand read-and-describe in the session report.

   Run:  node dev/verify-env1-light-profiles.mjs */

import { spawn, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(__dirname, "battle-gate", "env1-profiles");
fs.mkdirSync(outDir, { recursive: true });

const BASE_COMMIT = "749e8dd1"; // master tip this branch forked from (session brief)
// THE named materiality threshold (spec: "mean-luma delta > a named threshold"). One number, used
// symmetrically: the BASE COMMIT's daylit-vs-moonlit delta must sit BELOW it (the ledger-#8 bug —
// measured live at ~0.03-0.07 across runs: the profiles' authored ambient/point values differ a
// little, but nowhere near an at-a-glance read), and the FIXED code's delta must clear it.
const ENV1_MATERIAL_LUMA_DELTA = 0.15;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// dedicated range — never shared with any other verify-*.mjs/capture-*.mjs dedicated range.
const GREEN_PORT_CANDIDATES = [5311, 5312, 5313];
const RED_PORT_CANDIDATES = [5316, 5317, 5318];

let pass = 0, fail = 0;
function ok(cond, label, detail) { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label, detail !== undefined ? "— " + JSON.stringify(detail) : ""); } }
function group(name) { console.log("\n[" + name + "]"); }
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
    const body = await r.text();
    return body.includes("Genesis");
  } catch (e) { return false; }
}
async function startServer(cwd, candidates) {
  for (const port of candidates) {
    if (await portInUse(port)) continue;
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) return { proc, port, base: `http://127.0.0.1:${port}` }; break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${candidates.join(", ")}`);
}
async function launchChrome() {
  // --disable-background-timer-throttling / --disable-renderer-backgrounding: this harness keeps TWO
  // pages open (base-commit server + current server) — headless Chrome throttles the backgrounded
  // page's rAF loop, which freezes the theater's render/tween loops there (tweensLive never drains,
  // el.screenshot stalls). Belt: these flags; suspenders: every page-driving helper below ALSO calls
  // page.bringToFront() before acting.
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900",
    "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, protocolTimeout: 60000, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
}

// ------------------------------------------------------------------------------------------------
// Scratch "OLD CODE" tree — symlink every top-level entry + every src/* entry + every src/ui/*
// entry EXCEPT theater-boot.js, which is written out from `git show BASE_COMMIT:...`. Lightweight
// (no copying of the multi-GB asset tree) and self-cleaning (an isolated scratch dir, never the
// real worktree). Proves RED against the ACTUAL base-commit source, not a hand description of it.
// ------------------------------------------------------------------------------------------------
function buildOldCodeScratch() {
  const scratch = path.join(repoRoot, ".env1-red-scratch");
  fs.rmSync(scratch, { recursive: true, force: true });
  fs.mkdirSync(path.join(scratch, "src", "ui"), { recursive: true });
  for (const entry of fs.readdirSync(repoRoot)) {
    if (entry === "src" || entry === ".env1-red-scratch" || entry === ".git") continue;
    fs.symlinkSync(path.join(repoRoot, entry), path.join(scratch, entry));
  }
  for (const entry of fs.readdirSync(path.join(repoRoot, "src"))) {
    if (entry === "ui") continue;
    fs.symlinkSync(path.join(repoRoot, "src", entry), path.join(scratch, "src", entry));
  }
  for (const entry of fs.readdirSync(path.join(repoRoot, "src", "ui"))) {
    if (entry === "theater-boot.js") continue;
    fs.symlinkSync(path.join(repoRoot, "src", "ui", entry), path.join(scratch, "src", "ui", entry));
  }
  const oldSource = execFileSync("git", ["show", `${BASE_COMMIT}:src/ui/theater-boot.js`], { cwd: repoRoot, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 });
  fs.writeFileSync(path.join(scratch, "src", "ui", "theater-boot.js"), oldSource);
  return scratch;
}

// ------------------------------------------------------------------------------------------------
// Page helpers
// ------------------------------------------------------------------------------------------------
async function newMountedPage(browser, base) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
  await page.goto(`${base}/genesis.html`, { waitUntil: "load", timeout: 30000 });
  for (let i = 0; i < 60; i++) {
    const ready = await page.evaluate(() => !!(window.Theater && typeof window.Theater.mount === "function"));
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
  if (!mounted) throw new Error("Theater.mount failed at " + base);
  return page;
}

// A simple 6x5 flat tabletop fixture — no props/units (isolates the void+ambient/point rig from
// any figure-material grading), tiles all plain floor so the tile-surface luma reads the light rig
// directly. `env` + `lightProfile` are the only two axes varied by the checks below.
function tabletopFixture(env, lightProfile) {
  const tiles = [];
  for (let x = 0; x < 6; x++) for (let z = 0; z < 5; z++) tiles.push({ x, z, h: 0, kind: "floor" });
  return { tiles, props: [], env, light: { profile: lightProfile }, grid: { bandCount: 5, laneCount: 6 }, __n: Math.random() };
}
async function setTabletop(page, env, lightProfile) {
  await page.bringToFront(); // un-throttle this page's rAF loop (see launchChrome's own comment)
  await page.evaluate((board) => { window.Theater.setBoard(board); }, tabletopFixture(env, lightProfile));
  await sleep(220);
}
// NOTE: the WebGL canvas's own drawing buffer reads black post-composite (preserveDrawingBuffer is
// off, src/ui/theater-boot.js's `new THREE.WebGLRenderer({antialias:false, alpha:false})`) — reading
// it directly via canvas.toDataURL/getImageData is unreliable (same gotcha dev/verify-diegetic-
// light.mjs's own measure() documents). Same fix that harness uses: take a REAL CDP screenshot
// (el.screenshot(), which captures the composited frame) and, for luma, decode that PNG via an
// in-page <img> + 2D canvas (a data-URI image load never taints a same-origin canvas).
async function screenshotBase64(page) {
  await page.bringToFront(); // un-throttle this page's rAF loop (see launchChrome's own comment)
  const el = await page.$(".theater-stage-canvas canvas, canvas");
  if (!el) return null;
  return await el.screenshot({ encoding: "base64" });
}
async function meanLumaOf(page) {
  const b64 = await screenshotBase64(page);
  if (!b64) return null;
  return await page.evaluate((b64) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, c.width, c.height);
      let sum = 0, n = data.length / 4;
      for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      resolve((sum / n) / 255);
    };
    img.onerror = (e) => reject(new Error("img load failed"));
    img.src = "data:image/png;base64," + b64;
  }), b64);
}

// A 6x6 interior3d fixture (hand-authored, mirrors dev/capture-e0-1-fixture-fade.mjs's own
// buildHandBoardSrc convention) — built INSIDE the page via `new Function` so it can call the
// classic-global interiorTileKitFor (genesis.html's full script chain loads theater-interior.js;
// this scratch source string never needs importing anything).
function interiorFixtureSrc(lightProfile) {
  return `
    const kit = interiorTileKitFor("gloom");
    const W = 6, D = 6, wallH = 2.4;
    const floor = [];
    for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) floor.push({ x, z, sx: 1, sy: 1, sz: 1, color: kit.floorColor });
    const lights = [
      { x: 3, z: -0.9, y: 1.6, color: "#ff9a44", intensity: 1.2, distance: 8, decay: 2, kind: "torch",
        fixtureId: "sconce-iron", mount: "wall", emitterLocal: { x: 0, y: 0.06, z: 0.16 }, castShadow: false },
    ];
    return {
      kind: "interior3d", env: "dungeon", realmId: "gloom", cellSize: 1, wallHeightBase: wallH,
      tileKit: { floorColor: kit.floorColor, wallColor: kit.wallColor, trimColor: kit.trimColor,
        floorMaterial: kit.floorMaterial, wallMaterial: kit.wallMaterial, trimMaterial: kit.trimMaterial,
        floorGrain: 0, wallGrain: 0, trimGrain: 0, gradeTint: null, gradeStrength: 0, fogWhisper: 0 },
      instances: { floor, wall: [], doorframe: [], pillar: [] },
      bounds: { minX: -1, maxX: W, minZ: -1, maxZ: D },
      focusRect: { minX: 0, maxX: W - 1, minZ: 0, maxZ: D - 1 },
      cameraFit: { mode: "beat", cells: [{ x: 3, y: 0 }, { x: 3, y: 2 }] },
      lightProfile: "${lightProfile}",
      lights,
      pieces: [],
    };
  `;
}
async function setInterior(page, lightProfile) {
  await page.bringToFront(); // un-throttle this page's rAF loop (see launchChrome's own comment)
  await page.evaluate((src) => {
    const buildBoard = new Function(src);
    window.Theater.setInteriorBoard(buildBoard());
  }, interiorFixtureSrc(lightProfile));
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  await sleep(250);
}

// Per-pixel mean-absolute-luma diff between two PNG screenshots, computed in-page (decode via
// <img> + 2D canvas — no node-side PNG dependency). BYTE-exact stability is impossible for a lit
// interior even with UNCHANGED code: the torch flicker tick (lightFlickerStep, every 480ms) uses
// Math.random on the live light intensities/emitters, so two screenshots of the SAME server a
// moment apart already differ slightly. The spec's own fallback applies ("prove visually-identical
// via pixel-diff < epsilon and explain") — and this harness measures the SAME-server animation
// noise floor explicitly (the intra baseline) so the cross-server epsilon claim is calibrated
// against reality, not hand-waved.
async function pixelDiffMean(page, b64A, b64B) {
  return await page.evaluate(({ a, b }) => new Promise((resolve, reject) => {
    function load(src) {
      return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => rej(new Error("img load failed"));
        img.src = "data:image/png;base64," + src;
      });
    }
    Promise.all([load(a), load(b)]).then(([imgA, imgB]) => {
      const W = Math.min(imgA.naturalWidth, imgB.naturalWidth);
      const H = Math.min(imgA.naturalHeight, imgB.naturalHeight);
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(imgA, 0, 0);
      const dataA = ctx.getImageData(0, 0, W, H).data;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(imgB, 0, 0);
      const dataB = ctx.getImageData(0, 0, W, H).data;
      let sum = 0, maxD = 0, n = dataA.length / 4;
      for (let i = 0; i < dataA.length; i += 4) {
        const la = 0.299 * dataA[i] + 0.587 * dataA[i + 1] + 0.114 * dataA[i + 2];
        const lb = 0.299 * dataB[i] + 0.587 * dataB[i + 1] + 0.114 * dataB[i + 2];
        const d = Math.abs(la - lb);
        sum += d; if (d > maxD) maxD = d;
      }
      resolve({ mean: (sum / n) / 255, max: maxD / 255, sameDims: imgA.naturalWidth === imgB.naturalWidth && imgA.naturalHeight === imgB.naturalHeight });
    }).catch(reject);
  }), { a: b64A, b: b64B });
}

// ==================================================================================================
async function main() {
  console.log("[verify-env1-light-profiles] ENV-1 — light profiles differentiate everywhere");

  group("0. RED-FIRST (source-level, base commit " + BASE_COMMIT + ")");
  {
    const oldSrc = execFileSync("git", ["show", `${BASE_COMMIT}:src/ui/theater-boot.js`], { cwd: repoRoot, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 });
    ok(!oldSrc.includes("TABLETOP_EXTERIOR_LOOK"), "TABLETOP_EXTERIOR_LOOK did not exist at base commit");
    ok(!oldSrc.includes("voidTintForTabletop"), "voidTintForTabletop did not exist at base commit");
    ok(!oldSrc.includes("applyTabletopExteriorLook"), "applyTabletopExteriorLook did not exist at base commit");
    const newSrc = fs.readFileSync(path.join(repoRoot, "src/ui/theater-boot.js"), "utf-8");
    ok(newSrc.includes("TABLETOP_EXTERIOR_LOOK") && newSrc.includes("voidTintForTabletop") && newSrc.includes("applyTabletopExteriorLook"),
      "current worktree source carries all 3 new symbols");
  }

  const scratch = buildOldCodeScratch();
  let redServer = null, greenServer = null, browser = null;
  try {
    [redServer, greenServer] = await Promise.all([
      startServer(scratch, RED_PORT_CANDIDATES),
      startServer(repoRoot, GREEN_PORT_CANDIDATES),
    ]);
    browser = await launchChrome();
    // ONE page per server, reused across every group below (mirrors dev/verify-qfb-tray.mjs's own
    // single-page-for-the-whole-run convention) — repeatedly mounting/closing fresh pages/WebGL
    // contexts turned out to starve later mounts (a stuck setInteriorBoard tween-settle wait), so
    // this harness opens each server's page exactly once.
    const redPage = await newMountedPage(browser, redServer.base);
    const greenPage = await newMountedPage(browser, greenServer.base);

    group("1. RED-FIRST (empirical, base-commit server) — daylit vs moonlit, same fixture/env");
    let redDaylitLuma = null, redMoonlitLuma = null;
    {
      await setTabletop(redPage, "wilderness", "daylit");
      redDaylitLuma = await meanLumaOf(redPage);
      await setTabletop(redPage, "wilderness", "moonlit");
      redMoonlitLuma = await meanLumaOf(redPage);
      ok(redDaylitLuma != null && redMoonlitLuma != null, "captured mean luma for both profiles (base-commit server)", { redDaylitLuma, redMoonlitLuma });
      const delta = Math.abs(redDaylitLuma - redMoonlitLuma);
      console.log("    base-commit delta:", delta.toFixed(4), JSON.stringify({ redDaylitLuma, redMoonlitLuma }));
      ok(delta < ENV1_MATERIAL_LUMA_DELTA, "[RED] base-commit daylit vs moonlit mean-luma delta is BELOW ENV1_MATERIAL_LUMA_DELTA (" + ENV1_MATERIAL_LUMA_DELTA + ") — the profiles fail materiality today (ledger #8), reproduced live", { delta, redDaylitLuma, redMoonlitLuma });
    }

    group("2. GREEN (current/fixed code) — daylit vs moonlit framebuffers differ materially");
    let greenLuma = {};
    {
      const page = greenPage;
      for (const profile of ["daylit", "overcast", "moonlit", "dark"]) {
        await setTabletop(page, "wilderness", profile);
        greenLuma[profile] = await meanLumaOf(page);
      }
      console.log("    luma:", JSON.stringify(greenLuma));
      const dvm = Math.abs(greenLuma.daylit - greenLuma.moonlit);
      ok(dvm > ENV1_MATERIAL_LUMA_DELTA, "[GREEN] daylit vs moonlit mean-luma delta clears ENV1_MATERIAL_LUMA_DELTA (" + ENV1_MATERIAL_LUMA_DELTA + ")", { delta: dvm, greenLuma });
      ok(greenLuma.daylit > greenLuma.overcast, "[GREEN] luma ordering: daylit > overcast", greenLuma);
      ok(greenLuma.overcast > greenLuma.moonlit, "[GREEN] luma ordering: overcast > moonlit", greenLuma);
      ok(greenLuma.moonlit >= greenLuma.dark - 0.005, "[GREEN] luma ordering: moonlit >= dark (small epsilon for float noise)", greenLuma);
    }

    group("3. diagnostic accessor (_tabletopSceneLightsForTest) — exact per-profile values");
    {
      const page = greenPage;
      const diag = {};
      for (const profile of ["daylit", "overcast", "moonlit", "dark", "torchlit"]) {
        await setTabletop(page, "wilderness", profile);
        diag[profile] = await page.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      }
      console.log("    diag:", JSON.stringify(diag));
      ok(diag.daylit.ambient === 0.80, "daylit ambient == 0.80 (TABLETOP_EXTERIOR_LOOK draft value)", diag.daylit);
      ok(diag.overcast.ambient === 0.55, "overcast ambient == 0.55", diag.overcast);
      ok(diag.moonlit.ambient === 0.44, "moonlit ambient == 0.44", diag.moonlit);
      ok(diag.daylit.background === 0xaed4f2, "daylit background == 0xaed4f2 (sky wash, not black)", diag.daylit);
      ok(diag.overcast.background === 0x8c94a0, "overcast background == 0x8c94a0 (muted grey)", diag.overcast);
      ok(diag.moonlit.background === 0x141c30, "moonlit background == 0x141c30 (near-dark blue)", diag.moonlit);
      // protection set: dark/torchlit ambient stays the pre-existing STAGE_AMBIENT_FLOOR-clamped
      // value (0.42) and its background is the plain env-keyed void (wilderness == 0x07090a) —
      // BYTE-IDENTICAL to pre-unit setBoard (no TABLETOP_EXTERIOR_LOOK entry for either profile).
      ok(diag.dark.ambient === 0.42, "[protection set] dark ambient stays the pre-existing STAGE_AMBIENT_FLOOR value (0.42), untouched", diag.dark);
      ok(diag.dark.background === 0x07090a, "[protection set] dark background stays the plain env-keyed void (wilderness 0x07090a), untouched", diag.dark);
      ok(diag.torchlit.ambient === 0.42, "[protection set] torchlit ambient untouched (0.42 floor)", diag.torchlit);
      ok(diag.torchlit.background === 0x07090a, "[protection set] torchlit background untouched (plain env void)", diag.torchlit);
    }

    group("4. cross-env — the same profile wins over env for the 3 exterior moods");
    {
      const page = greenPage;
      const envs = ["dungeon", "urban", "wilderness", "breach"];
      const results = {};
      for (const env of envs) {
        await setTabletop(page, env, "daylit");
        results[env] = await page.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      }
      console.log("    cross-env daylit:", JSON.stringify(results));
      const allSameBg = envs.every((e) => results[e].background === results.dungeon.background);
      const allSameAmbient = envs.every((e) => results[e].ambient === results.dungeon.ambient);
      ok(allSameBg, "daylit background is IDENTICAL across all 4 envs (profile wins over env)", results);
      ok(allSameAmbient, "daylit ambient is IDENTICAL across all 4 envs (profile wins over env)", results);
      // sanity: the SAME 4 envs under the protection-set "dark" profile should differ per-env
      // (proving the cross-env identity above is a real profile effect, not a harness bug that
      // always returns the same value regardless of what's asked).
      const darkResults = {};
      for (const env of envs) {
        await setTabletop(page, env, "dark");
        darkResults[env] = await page.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      }
      const darkVaries = new Set(envs.map((e) => darkResults[e].background)).size > 1;
      ok(darkVaries, "[negative control] dark profile's background DOES vary per-env (protection set correctly still env-keyed)", darkResults);
    }

    group("5. stability — protection-set renders identical old-server vs new-server (pixel-diff < epsilon)");
    {
      // Byte-exact is impossible here even for UNCHANGED code — see pixelDiffMean's own header
      // (torch flicker = Math.random every 480ms on live intensities). So: measure the SAME-server
      // animation-noise floor (two consecutive screenshots of the identical board on the identical
      // code) and require the cross-server diff to sit in that same noise band (episilon 0.01 mean
      // luma — generous vs the measured noise, tiny vs any real lighting change: section 2's daylit
      // vs moonlit delta is ~0.57 on this scale).
      const EPS = 0.01;

      // 5a. interior3d under torchlit (the working interior look).
      await setInterior(redPage, "torchlit");
      const redT1 = await screenshotBase64(redPage);
      const redT2 = await screenshotBase64(redPage); // same server twice = the noise floor
      await setInterior(greenPage, "torchlit");
      const greenT1 = await screenshotBase64(greenPage);
      const noiseA = await pixelDiffMean(greenPage, redT1, redT2);
      const diffA = await pixelDiffMean(greenPage, redT1, greenT1);
      console.log("    interior/torchlit: same-server noise mean=" + noiseA.mean.toFixed(5) + " cross-server mean=" + diffA.mean.toFixed(5));
      ok(diffA.sameDims, "interior3d/torchlit: identical dimensions old vs new", diffA);
      ok(diffA.mean < EPS, "interior3d/torchlit: OLD vs NEW pixel-diff mean < " + EPS + " (visually identical; flicker noise floor measured alongside)", { cross: diffA, noise: noiseA });

      // 5b. interior3d under daylit (the interior channel's OWN pre-existing bright-realm path —
      // never touched by this unit; proves setInteriorBoard's ITR_BRIGHT_REALM_FILL system is
      // fully untouched too, not just the dark/torchlit case).
      await setInterior(redPage, "daylit");
      const redD1 = await screenshotBase64(redPage);
      await setInterior(greenPage, "daylit");
      const greenD1 = await screenshotBase64(greenPage);
      const diffB = await pixelDiffMean(greenPage, redD1, greenD1);
      console.log("    interior/daylit: cross-server mean=" + diffB.mean.toFixed(5));
      ok(diffB.mean < EPS, "interior3d/daylit: OLD vs NEW pixel-diff mean < " + EPS + " (interior bright-realm path untouched)", diffB);

      // 5c. flat tabletop under dark (this unit's own protection set, ON the channel this unit
      // actually changed — the strongest stability proof for the tabletop path; the dark profile
      // has flicker 0 and the tabletop has no motes, so this one should be at/near true zero).
      await setTabletop(redPage, "dungeon", "dark");
      const redK1 = await screenshotBase64(redPage);
      await setTabletop(greenPage, "dungeon", "dark");
      const greenK1 = await screenshotBase64(greenPage);
      const diffC = await pixelDiffMean(greenPage, redK1, greenK1);
      console.log("    tabletop/dark: cross-server mean=" + diffC.mean.toFixed(5) + " max=" + diffC.max.toFixed(5));
      ok(diffC.mean < EPS, "tabletop/dark: OLD vs NEW pixel-diff mean < " + EPS + " (protection set on the changed channel)", diffC);
    }

    group("6. CAPTURE CARD — one fixture tray x 4 profiles, same camera");
    {
      const page = greenPage;
      const shots = [];
      for (const profile of ["daylit", "overcast", "moonlit", "dark"]) {
        await setTabletop(page, "wilderness", profile);
        const canvasSel = ".theater-stage-canvas canvas, canvas";
        const el = await page.$(canvasSel);
        const file = path.join(outDir, `env1-wilderness-${profile}.png`);
        if (el) { await el.screenshot({ path: file }); shots.push(file); }
      }
      ok(shots.length === 4, "captured all 4 profile frames to dev/battle-gate/env1-profiles/", shots);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    if (redServer && redServer.proc) { try { redServer.proc.kill("SIGTERM"); } catch (e) {} }
    if (greenServer && greenServer.proc) { try { greenServer.proc.kill("SIGTERM"); } catch (e) {} }
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

await main();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
