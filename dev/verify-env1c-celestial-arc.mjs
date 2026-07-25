#!/usr/bin/env node
/* dev/verify-env1c-celestial-arc.mjs — ENV-1c (docs/ENV-EXTERIOR-WAVE.md "The solar/lunar arc").
   Adam's verbatim ruling: "the sun and moon are diegetic sources and their position in the time of
   day should affect overall lighting when outdoors." Outdoor light is not a static per-profile mood
   (ENV-1's own TABLETOP_EXTERIOR_LOOK) — it is WHERE THE SUN/MOON IS.

   FIX (theater-boot.js, tabletop-only — same discipline as ENV-1/ENV-1B):
     - CELESTIAL_ARC (a low-parameter keyframe table, NOT an astronomy library) + celestialSunDirFor/
       celestialMoonDirFor/celestialArcFor (pure math) + applyCelestialArc (the mutator, called from
       setBoard right after applyTabletopExteriorLook and before applyTabletopShadowCasters).
     - applyCelestialArc repositions the profile's own key point light (S.pointLights[0]) along a
       continuous sun (daylit/overcast) or moon (moonlit) direction vector derived from clockMin,
       recolors it along a dawn/pink -> noon/near-white -> dusk/orange-red (or moon's cool blue-silver)
       curve, and rescales its intensity + S.ambientLight's intensity along the same elevation curve.
       ENV-1B's shadow-caster pass then configures shadows against this ALREADY-repositioned light, so
       dawn/dusk naturally read as long raking shadows and noon as short/tight ones — no shadow-specific
       code needed in this unit.
     - voidTintForTabletop gained a 3rd (clockMin) param: when threaded, S.celestialVoidTint (stamped
       by applyCelestialArc) wins over ENV-1's static per-profile void, so the sky/background follows
       the same keyframes as the key light.
     - overcast MODULATES the same sun arc (position retained) but desaturates color/void toward grey
       (OVERCAST_DESAT) and further damps key intensity (OVERCAST_SHADOW_DAMP) — overcast today authors
       ZERO points in LIGHT_PROFILES (untouched, shared with the interior channel), so its own
       shadow-caster pass is already a no-op by construction; this unit doesn't change that.
     - clockMin threads from src/world/render.js's theaterHereSourceFor (off clockOf(w).min, the SAME
       field dmDigest ships) through theaterStageSync -> trayFrom/theaterBoardFrom's opts ->
       theater-data.js's theaterBoardBuild/theaterIdleBoardFrom/theaterNodeBoardBuild, which stamp
       board.clockMin — additive/null-safe at every hop (an absent clock -> null -> byte-identical to
       pre-ENV-1c rendering, the SAME degrade law ENV-2's walkId threading established).
     - dark/torchlit/lavalit/fungal-glow/magic-glow/lamplit/voidlit (the protection set) and every
       INTERIOR profile are completely untouched (applyCelestialArc is a no-op outside
       CELESTIAL_PROFILE_SET={daylit,overcast,moonlit}, and is never called from setInteriorBoard).

   Sections:
     0. RED-FIRST, source-level: CELESTIAL_ARC/applyCelestialArc/celestialSunDirFor did not exist at
        the branch's base commit (master tip 0152a6f2, ENV-1B landed, ENV-1c not yet built).
     1. RED/GREEN, empirical (real browser via window.Theater.setBoard, board.clockMin set directly —
        the same "hand-built board fixture" convention verify-env1b-tabletop-shadows.mjs uses): the
        SAME daylit tray at clockMin=dawn vs clockMin=noon on the BASE-commit server (RED) is pixel-
        identical (time is ignored today); on the CURRENT server (GREEN) the key-light direction vector
        AND the sampled sky/background color differ materially.
     2. Shadow direction flips morning vs evening: the shadow-darkening cell (located the same
        block-mean-luma way verify-env1b-tabletop-shadows.mjs's own locator works) lands on OPPOSITE
        sides of the figure at clockMin=morning vs clockMin=dusk.
     3. Noon luma > dawn luma (mean canvas luma, current server).
     4. Night (moonlit) luma << noon (daylit) luma.
     5. Determinism: the SAME (profileKey, clockMin) setBoard call twice yields byte-identical
        key-light position/color/intensity (_tabletopSceneLightsForTest diagnostic, not a re-render).
     6. Interior byte-stability: interior3d torchlit + daylit, OLD-server vs NEW-server pixel-diff <
        epsilon (setInteriorBoard never calls applyCelestialArc).
     7. Overcast damps shadow contrast vs daylit at the SAME minute (block-mean darkening at the
        located shadow cell, daylit vs overcast).
     8. Re-run gate: env1 (28)/env1b/qfb-tray(37)/theater-shot(107)/dungeon-interior(288)/manifest all
        still green after this unit (invoked separately by the session, not from this file — logged
        here as a checklist reminder only).
     9. CAPTURE CARD: one dressed tray x 5 times of day (dawn/morning/noon/dusk/deep-night), same
        camera — dev/battle-gate/env1c-arc/env1c-<label>.png.

   Run:  node dev/verify-env1c-celestial-arc.mjs */

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
const outDir = path.join(__dirname, "battle-gate", "env1c-arc");
fs.mkdirSync(outDir, { recursive: true });

const BASE_COMMIT = "0152a6f2"; // master tip this branch (feat/env1c-celestial-arc) forked from — ENV-1B landed, ENV-1c not yet built
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// dedicated range — disjoint from every sibling verify-*/capture-*.mjs's own claimed ranges (env1b
// claimed 5321-5328; this unit takes the next block up).
const GREEN_PORT_CANDIDATES = [5331, 5332, 5333];
const RED_PORT_CANDIDATES = [5336, 5337, 5338];
const MATERIAL_LUMA_DELTA = 0.03; // "meaningfully different" luma floor, same discipline as env1/env1b's own named deltas
const SHADOW_LUMA_DELTA = 0.03;

// named clockMin constants for the 5-time capture card + the checks above — a fantasy day (matches
// CELESTIAL_ARC's own SUNRISE_MIN=360/SUNSET_MIN=1200 in theater-boot.js, kept in sync by convention).
const CLOCK = {
  dawn: 390,       // 06:30 — just after sunrise, low warm-pink sun
  morning: 540,     // 09:00 — mid-morning, rising sun, east-biased key
  noon: 780,        // 13:00 — solar noon, high near-white, key overhead
  dusk: 1170,       // 19:30 — just before sunset, low orange-red sun, west-biased key
  deepNight: 120,    // 02:00 — deep night per timeOfDay() (src/world/state.js); moon arc, not forced to any particular elevation
};

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
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900",
    "--disable-background-timer-throttling", "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, protocolTimeout: 60000, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
}

// ------------------------------------------------------------------------------------------------
// Scratch "OLD CODE" tree — same convention as verify-env1b-tabletop-shadows.mjs's buildOldCodeScratch:
// only src/ui/theater-boot.js is swapped for the base-commit version (this unit's whole diff lives
// there + a few additive fields in render.js/theater-data.js — but the celestial RIG ITSELF, the
// thing under test, is 100% theater-boot.js, so swapping just that file reproduces "time is ignored"
// faithfully; render.js/theater-data.js's additive clockMin threading is harmless to leave current on
// the RED server since a hand-built board fixture below sets board.clockMin directly, bypassing both).
// ------------------------------------------------------------------------------------------------
function buildOldCodeScratch() {
  const scratch = path.join(repoRoot, ".env1c-red-scratch");
  fs.rmSync(scratch, { recursive: true, force: true });
  fs.mkdirSync(path.join(scratch, "src", "ui"), { recursive: true });
  // THEATER SPLIT B5 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md) — TWO-FILE PIN, and why it is
  // required for this proof to mean anything. Before the split, src/ui/theater-boot.js WAS the whole GL
  // layer, so swapping that one file made a complete "old code" tree. It no longer is: splits B1-B5
  // extracted theater-clay-room / -light-lab / -skins / -whole-object / -figure-build / -post / -dispose /
  // -lighting / -practicals / -motes, and TODAY's genesis.html carries a <script type="module"> tag for
  // each of them. Symlinking today's genesis.html into this scratch would therefore load the BASE
  // COMMIT's MONOLITH *and* the post-split modules on the same page — two theater facades racing to
  // publish window.Theater, i.e. a meaningless RED. Fix, both halves of one idea:
  //   (a) genesis.html is materialized from the SAME BASE_COMMIT (it is the file that decides which
  //       modules exist at all), and
  //   (b) any src/ui/theater-*.js that does not exist at BASE_COMMIT is not symlinked in either.
  // Verified: `git diff --diff-filter=D BASE_COMMIT HEAD -- src data` is empty, so every file the base
  // genesis.html references still exists in this worktree and resolves through the symlinks. NOT ONE
  // ASSERTION BELOW IS RELAXED by this — it only restores the RED side to a coherent single-facade tree.
  const existsAtBase = (repoPath) => {
    try { execFileSync("git", ["cat-file", "-e", `${BASE_COMMIT}:${repoPath}`], { cwd: repoRoot, stdio: "ignore" }); return true; }
    catch (e) { return false; }
  };
  for (const entry of fs.readdirSync(repoRoot)) {
    if (entry === "src" || entry === ".env1c-red-scratch" || entry === ".git") continue;
    if (entry === "genesis.html") continue; // split B5: pinned from BASE_COMMIT below, never today's tag list
    fs.symlinkSync(path.join(repoRoot, entry), path.join(scratch, entry));
  }
  for (const entry of fs.readdirSync(path.join(repoRoot, "src"))) {
    if (entry === "ui") continue;
    fs.symlinkSync(path.join(repoRoot, "src", entry), path.join(scratch, "src", entry));
  }
  for (const entry of fs.readdirSync(path.join(repoRoot, "src", "ui"))) {
    if (entry === "theater-boot.js") continue;
    // split B5: a theater-*.js module that did not exist at BASE_COMMIT must NOT join the old-code tree.
    if (/^theater-.*\.js$/.test(entry) && !existsAtBase("src/ui/" + entry)) continue;
    fs.symlinkSync(path.join(repoRoot, "src", "ui", entry), path.join(scratch, "src", "ui", entry));
  }
  const oldSource = execFileSync("git", ["show", `${BASE_COMMIT}:src/ui/theater-boot.js`], { cwd: repoRoot, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 });
  fs.writeFileSync(path.join(scratch, "src", "ui", "theater-boot.js"), oldSource);
  // split B5: the matching genesis.html — same commit, so the page loads exactly the module set that
  // existed alongside this monolith and nothing that did not.
  const oldHtml = execFileSync("git", ["show", `${BASE_COMMIT}:genesis.html`], { cwd: repoRoot, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 });
  fs.writeFileSync(path.join(scratch, "genesis.html"), oldHtml);
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

// A dressed 8x7 tabletop tray — mirrors verify-env1b-tabletop-shadows.mjs's own dressedTrayBoard EXACTLY
// (same footprint/prop/figure) so this harness's luma/shadow numbers are directly comparable, with
// board.clockMin set directly (bypassing theater-data.js's threading — a hand-built fixture, the SAME
// convention that harness already uses for env/light.profile).
function dressedTrayBoard(env, lightProfile, clockMin) {
  const tiles = [];
  for (let x = 0; x < 8; x++) for (let z = 0; z < 7; z++) tiles.push({ x, z, h: 0, kind: "floor" });
  return {
    tiles,
    props: [{ x: 1, z: 1, part: "crate", partParams: {} }],
    env, light: { profile: lightProfile }, clockMin,
    grid: { bandCount: 7, laneCount: 8 },
    __n: Math.random(),
  };
}
function dressedTrayUnits() {
  return { units: [{ id: "foe1", kind: "foe", name: "Arc Test Poppet", recipeSlug: "grinning-poppet", x: 4, z: 3, hpPct: 1 }], __n: Math.random() };
}
// withUnits=false renders the BOARD ALONE (no figure): the sprite standee carries a subtle idle
// animation, so two screenshots of the same board+figure taken seconds apart differ by a small but
// nonzero pixel-diff even under IDENTICAL lighting — the check-1 RED/GREEN comparison needs a fully
// static scene to make "time ignored -> pixel-identical" an honest assertion (found live: the first
// harness run measured 0.021 mean diff on the BASE commit purely from the figure's own animation).
async function setDressedTray(page, env, lightProfile, clockMin, withUnits = true) {
  await page.bringToFront();
  await page.evaluate((board) => { window.Theater.setBoard(board); }, dressedTrayBoard(env, lightProfile, clockMin));
  await page.evaluate((units) => { window.Theater.setUnits(units); }, withUnits ? dressedTrayUnits() : { units: [], __n: Math.random() });
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  if (withUnits) {
    await page.waitForFunction(() => {
      const cache = window.Theater && window.Theater._spriteTextureCache;
      if (!cache) return false;
      const key = Object.keys(cache).find((k) => k.indexOf("grinning-poppet") >= 0);
      return !!key && cache[key] !== "pending" && cache[key] !== "failed";
    }, { timeout: 15000 }).catch(() => {});
  }
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  await sleep(260);
}

async function screenshotBase64(page) {
  await page.bringToFront();
  const el = await page.$(".theater-stage-canvas canvas, canvas");
  if (!el) return null;
  return await el.screenshot({ encoding: "base64" });
}
async function meanCanvasLuma(page) {
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
    img.onerror = () => reject(new Error("img load failed"));
    img.src = "data:image/png;base64," + b64;
  }), b64);
}
// samples the mean luma of a small square region OF A GIVEN screenshot (base64) — unlike regionLuma
// below, this never re-screenshots, so it can sample a frame captured BEFORE the page moved on to a
// different board (the first harness run's check-7 bug: regionLuma re-screenshotted the CURRENT page,
// silently sampling the overcast frame for both profiles' "shadow cell").
async function regionLumaOf(page, b64, cx, cy, half) {
  return await page.evaluate(({ b64, cx, cy, half }) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const x0 = Math.max(0, Math.round(cx - half)), y0 = Math.max(0, Math.round(cy - half));
      const w = Math.min(c.width - x0, half * 2), h = Math.min(c.height - y0, half * 2);
      const { data } = ctx.getImageData(x0, y0, Math.max(1, w), Math.max(1, h));
      let sum = 0, n = data.length / 4;
      for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      resolve((sum / n) / 255);
    };
    img.onerror = () => reject(new Error("img load failed"));
    img.src = "data:image/png;base64," + b64;
  }), { b64, cx, cy, half });
}
async function regionLuma(page, cx, cy, half) {
  const b64 = await screenshotBase64(page);
  if (!b64) return null;
  return await page.evaluate(({ b64, cx, cy, half }) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const x0 = Math.max(0, Math.round(cx - half)), y0 = Math.max(0, Math.round(cy - half));
      const w = Math.min(c.width - x0, half * 2), h = Math.min(c.height - y0, half * 2);
      const { data } = ctx.getImageData(x0, y0, Math.max(1, w), Math.max(1, h));
      let sum = 0, n = data.length / 4;
      for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      resolve((sum / n) / 255);
    };
    img.onerror = () => reject(new Error("img load failed"));
    img.src = "data:image/png;base64," + b64;
  }), { b64, cx, cy, half });
}
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
// locates the max-darkening 16px block between two screenshots (base64) — same algorithm as
// verify-env1b-tabletop-shadows.mjs's own inline locator, factored here for reuse across checks 2+7.
async function locateMaxDarkening(page, b64A, b64B) {
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
      const dA = ctx.getImageData(0, 0, W, H).data;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(imgB, 0, 0);
      const dB = ctx.getImageData(0, 0, W, H).data;
      const CELL = 16;
      let best = { x: 0, y: 0, darken: 0 };
      for (let cy = 0; cy + CELL <= H; cy += CELL) {
        for (let cx = 0; cx + CELL <= W; cx += CELL) {
          let sum = 0;
          for (let y = cy; y < cy + CELL; y++) {
            for (let x = cx; x < cx + CELL; x++) {
              const i = (y * W + x) * 4;
              const la = 0.299 * dA[i] + 0.587 * dA[i + 1] + 0.114 * dA[i + 2];
              const lb = 0.299 * dB[i] + 0.587 * dB[i + 1] + 0.114 * dB[i + 2];
              sum += (la - lb);
            }
          }
          const mean = (sum / (CELL * CELL)) / 255;
          if (mean > best.darken) best = { x: cx + CELL / 2, y: cy + CELL / 2, darken: mean };
        }
      }
      resolve(best);
    }).catch(reject);
  }), { a: b64A, b: b64B });
}

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
  await page.bringToFront();
  await page.evaluate((src) => {
    const buildBoard = new Function(src);
    window.Theater.setInteriorBoard(buildBoard());
  }, interiorFixtureSrc(lightProfile));
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  await sleep(250);
}

// ==================================================================================================
async function main() {
  console.log("[verify-env1c-celestial-arc] ENV-1c — the solar/lunar arc");

  group("0. RED-FIRST (source-level, base commit " + BASE_COMMIT + ")");
  {
    const oldSrc = execFileSync("git", ["show", `${BASE_COMMIT}:src/ui/theater-boot.js`], { cwd: repoRoot, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 });
    ok(!oldSrc.includes("CELESTIAL_ARC"), "CELESTIAL_ARC did not exist at base commit");
    ok(!oldSrc.includes("applyCelestialArc"), "applyCelestialArc did not exist at base commit");
    ok(!oldSrc.includes("celestialSunDirFor"), "celestialSunDirFor did not exist at base commit");
    const newSrc = fs.readFileSync(path.join(repoRoot, "src/ui/theater-boot.js"), "utf-8");
    ok(newSrc.includes("CELESTIAL_ARC") && newSrc.includes("applyCelestialArc") && newSrc.includes("celestialSunDirFor") && newSrc.includes("celestialMoonDirFor"),
      "current worktree source carries the new celestial-arc symbols");
  }

  const scratch = buildOldCodeScratch();
  let redServer = null, greenServer = null, browser = null;
  try {
    [redServer, greenServer] = await Promise.all([
      startServer(scratch, RED_PORT_CANDIDATES),
      startServer(repoRoot, GREEN_PORT_CANDIDATES),
    ]);
    browser = await launchChrome();
    const redPage = await newMountedPage(browser, redServer.base);
    const greenPage = await newMountedPage(browser, greenServer.base);

    group("1. RED/GREEN (empirical) — same daylit tray, dawn vs noon clockMin (STATIC board, no figure)");
    {
      // RED: base commit ignores clockMin entirely — dawn and noon boards render pixel-identical.
      // Board WITHOUT the sprite figure (its idle animation alone produced a 0.021 mean diff on the
      // base commit in the first harness run — see setDressedTray's own withUnits note).
      await setDressedTray(redPage, "wilderness", "daylit", CLOCK.dawn, false);
      const redDawn = await screenshotBase64(redPage);
      const redDawnDiag = await redPage.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      await setDressedTray(redPage, "wilderness", "daylit", CLOCK.noon, false);
      const redNoon = await screenshotBase64(redPage);
      const redNoonDiag = await redPage.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      const redDiff = await pixelDiffMean(redPage, redDawn, redNoon);
      console.log("    [RED] dawn vs noon pixel-diff mean=" + redDiff.mean.toFixed(5));
      console.log("    [RED] dawn rig=" + JSON.stringify(redDawnDiag) + "\n    [RED] noon rig=" + JSON.stringify(redNoonDiag));
      ok(redDiff.mean < 0.005, "[RED] base commit: dawn and noon boards are pixel-identical (time ignored today)", redDiff);
      // rig-level RED: the base accessor (ENV-1B's) has no `position` field yet, but color/intensity/
      // background fully describe the pre-ENV-1c rig — identical across clockMin proves time is ignored
      // at the RIG level, not just below a pixel threshold.
      ok(JSON.stringify(redDawnDiag) === JSON.stringify(redNoonDiag), "[RED] base commit: the light rig diagnostic is BYTE-IDENTICAL dawn vs noon (clockMin never reaches the rig)", { redDawnDiag, redNoonDiag });

      // GREEN: current worktree — dawn vs noon must differ materially (key direction + color).
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.dawn, false);
      const greenDawn = await screenshotBase64(greenPage);
      const dawnDiag = await greenPage.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.noon, false);
      const greenNoon = await screenshotBase64(greenPage);
      const noonDiag = await greenPage.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      const greenDiff = await pixelDiffMean(greenPage, greenDawn, greenNoon);
      console.log("    [GREEN] dawn vs noon pixel-diff mean=" + greenDiff.mean.toFixed(5));
      console.log("    [GREEN] dawn key position=" + JSON.stringify(dawnDiag.points[0] && dawnDiag.points[0].position) + " color=" + (dawnDiag.points[0] && dawnDiag.points[0].color.toString(16)));
      console.log("    [GREEN] noon key position=" + JSON.stringify(noonDiag.points[0] && noonDiag.points[0].position) + " color=" + (noonDiag.points[0] && noonDiag.points[0].color.toString(16)));
      ok(greenDiff.mean > MATERIAL_LUMA_DELTA, "[GREEN] current worktree: dawn vs noon boards differ materially (mean-luma delta " + greenDiff.mean.toFixed(4) + " > " + MATERIAL_LUMA_DELTA + ")", greenDiff);
      const dp = dawnDiag.points[0], np = noonDiag.points[0];
      ok(!!(dp && np), "both dawn/noon diagnostics carry a key point light", { dp, np });
      const posDelta = dp && np ? Math.hypot(dp.position.x - np.position.x, dp.position.y - np.position.y, dp.position.z - np.position.z) : 0;
      ok(posDelta > 0.5, "[GREEN] key-light DIRECTION vector differs materially between dawn and noon (position delta " + posDelta.toFixed(3) + ")", { dp, np, posDelta });
      ok(!!(dp && np && dp.color !== np.color), "[GREEN] key-light COLOR differs between dawn and noon", { dawnColor: dp && dp.color.toString(16), noonColor: np && np.color.toString(16) });
      ok(!!(dawnDiag.background !== noonDiag.background), "[GREEN] sky/void background color differs between dawn and noon", { dawnBg: dawnDiag.background && dawnDiag.background.toString(16), noonBg: noonDiag.background && noonDiag.background.toString(16) });
    }

    let morningShadowPt = null, duskShadowPt = null;
    group("2. Shadow direction flips morning vs evening");
    {
      // idle/no-figure control frame (open floor only, no figure -> no shadow) at morning, to isolate
      // the figure's OWN cast shadow from any ambient/key color shift between the two times.
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.morning);
      const morningShot = await screenshotBase64(greenPage);
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.dusk);
      const duskShot = await screenshotBase64(greenPage);
      // locate each time's own darkest-relative-to-the-OTHER-time cell — the figure's shadow pool sits
      // on the side AWAY from the key light, so morning's shadow cell should NOT be dusk's shadow cell.
      const morningVsDusk = await locateMaxDarkening(greenPage, duskShot, morningShot); // where morning is darker than dusk
      const duskVsMorning = await locateMaxDarkening(greenPage, morningShot, duskShot); // where dusk is darker than morning
      morningShadowPt = { x: morningVsDusk.x, y: morningVsDusk.y };
      duskShadowPt = { x: duskVsMorning.x, y: duskVsMorning.y };
      console.log("    morning-darker cell: " + JSON.stringify(morningVsDusk));
      console.log("    dusk-darker cell:    " + JSON.stringify(duskVsMorning));
      const cellDelta = Math.hypot(morningShadowPt.x - duskShadowPt.x, morningShadowPt.y - duskShadowPt.y);
      ok(morningVsDusk.darken > SHADOW_LUMA_DELTA, "a region exists that's darker at morning than at dusk", morningVsDusk);
      ok(duskVsMorning.darken > SHADOW_LUMA_DELTA, "a region exists that's darker at dusk than at morning", duskVsMorning);
      ok(cellDelta > 20, "the morning-side and dusk-side darkening regions sit in DIFFERENT screen locations (shadow flips sides, delta=" + cellDelta.toFixed(1) + "px)", { morningShadowPt, duskShadowPt, cellDelta });
    }

    group("3. Noon luma > dawn luma");
    {
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.dawn);
      const dawnLuma = await meanCanvasLuma(greenPage);
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.noon);
      const noonLuma = await meanCanvasLuma(greenPage);
      console.log("    dawn luma=" + dawnLuma.toFixed(4) + " noon luma=" + noonLuma.toFixed(4));
      ok(noonLuma > dawnLuma, "noon mean canvas luma > dawn mean canvas luma", { dawnLuma, noonLuma });
    }

    group("4. Night (moonlit) luma << noon (daylit) luma");
    {
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.noon);
      const noonLuma = await meanCanvasLuma(greenPage);
      await setDressedTray(greenPage, "wilderness", "moonlit", CLOCK.deepNight);
      const nightLuma = await meanCanvasLuma(greenPage);
      console.log("    noon luma=" + noonLuma.toFixed(4) + " night(moonlit) luma=" + nightLuma.toFixed(4));
      ok(nightLuma < noonLuma * 0.6, "night(moonlit) luma is well below noon luma (< 60%)", { noonLuma, nightLuma, ratio: nightLuma / noonLuma });
    }

    group("5. Determinism — same (profile, clockMin) yields byte-identical rig");
    {
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.morning);
      const a = await greenPage.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.morning);
      const b = await greenPage.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      ok(JSON.stringify(a) === JSON.stringify(b), "same (daylit, morning) setBoard call twice -> byte-identical diagnostic", { a, b });
    }

    group("6. interior byte-stability — torchlit + daylit, OLD vs NEW pixel-diff < epsilon");
    {
      const EPS = 0.01;
      await setInterior(redPage, "torchlit");
      const redT1 = await screenshotBase64(redPage);
      await setInterior(greenPage, "torchlit");
      const greenT1 = await screenshotBase64(greenPage);
      const diffA = await pixelDiffMean(greenPage, redT1, greenT1);
      console.log("    interior/torchlit: cross-server mean=" + diffA.mean.toFixed(5));
      ok(diffA.sameDims, "interior3d/torchlit: identical dimensions old vs new", diffA);
      ok(diffA.mean < EPS, "interior3d/torchlit: OLD vs NEW pixel-diff mean < " + EPS, diffA);

      await setInterior(redPage, "daylit");
      const redD1 = await screenshotBase64(redPage);
      await setInterior(greenPage, "daylit");
      const greenD1 = await screenshotBase64(greenPage);
      const diffB = await pixelDiffMean(greenPage, redD1, greenD1);
      console.log("    interior/daylit: cross-server mean=" + diffB.mean.toFixed(5));
      ok(diffB.mean < EPS, "interior3d/daylit: OLD vs NEW pixel-diff mean < " + EPS, diffB);
    }

    group("7. Overcast damps shadow contrast vs daylit at the same minute");
    {
      // per-profile SAME-FRAME contrast: the daylit shadow cell (located mechanically in check 2 —
      // it's the region that darkens at morning but not at dusk, i.e. the figure's own morning cast
      // shadow, not the figure body, which renders at both times) vs the frame's own central board
      // region mean. Under daylit the cell is a shadow pool (far below the board mean); under
      // overcast (no key light at all — LIGHT_PROFILES.overcast authors zero points, so no cast
      // shadow exists by construction) the same cell is ordinary flat-lit floor (near the board
      // mean). Both samples come from each profile's OWN captured frame (regionLumaOf, never a
      // re-screenshot — the first harness run's check-7 bug sampled the live page after the board
      // had already changed).
      const pt = morningShadowPt || { x: 600, y: 450 };
      const CENTER = { x: 600, y: 450, half: 140 }; // the board fills the frame center at this camera
      await setDressedTray(greenPage, "wilderness", "daylit", CLOCK.morning);
      const daylitShot = await screenshotBase64(greenPage);
      const daylitDiag = await greenPage.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      await setDressedTray(greenPage, "wilderness", "overcast", CLOCK.morning);
      const overcastShot = await screenshotBase64(greenPage);
      const overcastDiag = await greenPage.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      const daylitCell = await regionLumaOf(greenPage, daylitShot, pt.x, pt.y, 12);
      const daylitMean = await regionLumaOf(greenPage, daylitShot, CENTER.x, CENTER.y, CENTER.half);
      const overcastCell = await regionLumaOf(greenPage, overcastShot, pt.x, pt.y, 12);
      const overcastMean = await regionLumaOf(greenPage, overcastShot, CENTER.x, CENTER.y, CENTER.half);
      const daylitContrast = (daylitMean - daylitCell) / Math.max(daylitMean, 1e-6);
      const overcastContrast = (overcastMean - overcastCell) / Math.max(overcastMean, 1e-6);
      console.log("    daylit:   shadow-cell=" + daylitCell.toFixed(4) + " board-mean=" + daylitMean.toFixed(4) + " contrast=" + daylitContrast.toFixed(4));
      console.log("    overcast: same-cell=" + overcastCell.toFixed(4) + " board-mean=" + overcastMean.toFixed(4) + " contrast=" + overcastContrast.toFixed(4));
      ok(overcastContrast < daylitContrast, "overcast's shadow-cell contrast (vs its own board mean) is smaller than daylit's at the same clockMin", { daylitContrast, overcastContrast });
      // rig-level corroboration: overcast has NO shadow-casting key at all (zero authored points —
      // shadow contrast damped to its floor by construction), while daylit's key casts.
      ok(overcastDiag.points.length === 0, "overcast authors zero point lights (no shadow caster exists — contrast damped by construction)", overcastDiag);
      ok(!!(daylitDiag.points[0] && daylitDiag.points[0].castShadow === true), "daylit's key casts (ENV-1B contract still holds under the arc)", daylitDiag.points[0]);
    }

    group("9. CAPTURE CARD — one dressed tray x 5 times of day, same camera");
    {
      const page = greenPage;
      const shots = [];
      const times = [
        ["dawn", "daylit", CLOCK.dawn],
        ["morning", "daylit", CLOCK.morning],
        ["noon", "daylit", CLOCK.noon],
        ["dusk", "daylit", CLOCK.dusk],
        ["deep-night", "moonlit", CLOCK.deepNight],
      ];
      for (const [label, profile, clockMin] of times) {
        await setDressedTray(page, "wilderness", profile, clockMin);
        const el = await page.$(".theater-stage-canvas canvas, canvas");
        const file = path.join(outDir, `env1c-${label}.png`);
        if (el) { await el.screenshot({ path: file }); shots.push(file); }
      }
      ok(shots.length === 5, "captured all 5 time-of-day frames", shots);
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
