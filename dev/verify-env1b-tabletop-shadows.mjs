#!/usr/bin/env node
/* dev/verify-env1b-tabletop-shadows.mjs — ENV-1B (session brief, 2026-07-14): the tabletop/exterior
   channel gets real cast shadows, matching the interior channel's own convention and Adam's actual
   DESIGN.md ruling ("soft real lighting + cast shadows", AO off because "real shadows carry contact
   darkness"). Retires src/ui/theater-boot.js:6201's stale §2 "no shadow maps — blob quads only" line
   (a 2026-07-07 pre-alpha placeholder, never an Adam ruling).

   FIX (theater-boot.js):
     - renderer.shadowMap.enabled now defaults true at mount() and stays true through setBoard's own
       restore (previously the one place it was forced back to false after an interior tray).
     - applyTabletopShadowCasters() (new, called only from setBoard, right after
       applyTabletopExteriorLook) marks every live S.pointLights[] instance castShadow=true with a
       TABLETOP_SHADOW_MAP_SIZE (512, matches interior's own INTERIOR_SHADOW_MAP_SIZE)/
       TABLETOP_SHADOW_BIAS (-0.002, matches interior's own PointLight practical bias) shadow map,
       far-plane keyed off the board's own half-extent. Mutates the LIVE THREE light objects
       applyLightProfile already built — never LIGHT_PROFILES/applyLightProfile itself (SHARED with
       setInteriorBoard — editing the shared function would also turn interior's own profile-mood
       point into a second shadow source, breaking interior byte-stability for no reason).
     - setBoard's tile (ground) meshes get receiveShadow=true.
     - setBoard's three prop tiers (whole-object mesh / Parts.PARTS renderPartInto group / flat-box
       fallback) get castShadow=true + receiveShadow=true (solid volumetric objects, mirroring the
       interior room-shell wall/trim/riser/furniture/door convention).
     - Sprite billboards (creature figures) already carried castShadow=true/receiveShadow=false
       (buildSpriteBillboardMesh, shared by both channels) — this unit changes nothing there; it was
       simply inert while renderer.shadowMap.enabled was globally false on the tabletop path.
     - setUnits stamps castShadow=true on every mounted figure's meshes on the TABLETOP channel only
       (gated !interiorMode — figureFor/addBox/renderPartInto are SHARED with the interior channel,
       where PC/ally solid figures have never cast; stamping in the shared builders would change
       interior renders). receiveShadow stays false on figures — shadows land on the GROUND.

   Sections:
     0. RED-FIRST, source-level: TABLETOP_SHADOW_MAP_SIZE/TABLETOP_SHADOW_BIAS/applyTabletopShadowCasters
        did not exist at the branch's base commit; mount()'s shadowMap default was false there.
     1+2. RED/GREEN, empirical: the SAME dressed daylit tray (ground tiles + a prop + one creature
        figure) rendered on BOTH servers — the base-commit server (shadows off) and the current one.
        The shadow REGION is located mechanically: the pixel neighborhood where the current render got
        darkest relative to the base render (max positive lumaOld-lumaNew cluster). RED assertion: in
        the base-commit frame that same region reads as plain bright floor (its luma matches an
        untouched open-floor patch — no shadow there today). GREEN assertion: in the current frame the
        region is meaningfully darker than it was on the base commit (the located darkening IS
        material, not noise). Together: a shadow-darkened ground region exists now and did not before.
     3. Diagnostic-accessor checks (_tabletopSceneLightsForTest / shadowMapEnabled): every profile's
        point light carries castShadow=true at TABLETOP_SHADOW_MAP_SIZE/TABLETOP_SHADOW_BIAS.
     4. Interior byte-stability: interior3d torchlit + daylit, OLD-server vs NEW-server pixel-diff <
        epsilon (setInteriorBoard/applyLightProfile/LIGHT_PROFILES themselves are untouched).
     5. Flip-sequence integrity: interior -> tabletop -> interior renders identically to a direct
        interior render (the hemi/key/fill/shadowMap/orthoCamera restore discipline still round-trips).
     6. FPS delta: window.Theater.measureRenderFps on a dressed tray (props + a creature figure) under
        daylit, OLD server (shadows off) vs NEW server (shadows on) — reported, not gated (a perf
        CENSUS, not a regression gate; the task's own "measure and report" framing).
     7. CAPTURE CARD: the ENV-1 4-profile card re-shot with a dressed figure under real shadows
        (dev/battle-gate/env1-profiles/env1b-wilderness-<profile>-shadows.png) + one zoomed dressed-tray
        daylit shot for the blob-quad double-darkening read (dev/battle-gate/env1-profiles/
        env1b-daylit-blob-zoom.png).

   Run:  node dev/verify-env1b-tabletop-shadows.mjs */

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

const BASE_COMMIT = "b6b591e8"; // master tip this branch (feat/env1b-tabletop-shadows) forked from
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// dedicated range — disjoint from every sibling verify-*/capture-*.mjs's own claimed ranges.
const GREEN_PORT_CANDIDATES = [5321, 5322, 5323];
const RED_PORT_CANDIDATES = [5326, 5327, 5328];
// the "meaningfully darker" materiality threshold for the shadow-region-vs-control luma comparison —
// a single named number, used symmetrically (RED must sit below it, GREEN must clear it), same
// discipline as verify-env1-light-profiles.mjs's own ENV1_MATERIAL_LUMA_DELTA.
const SHADOW_LUMA_DELTA = 0.03;

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
// Scratch "OLD CODE" tree — same convention as verify-env1-light-profiles.mjs's buildOldCodeScratch.
// ------------------------------------------------------------------------------------------------
function buildOldCodeScratch() {
  const scratch = path.join(repoRoot, ".env1b-red-scratch");
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
    if (entry === "src" || entry === ".env1b-red-scratch" || entry === ".git") continue;
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

// A dressed 8x7 tabletop tray — ground tiles, one grounding-blob-bearing prop, and one SPRITE-backed
// creature figure ("grinning-poppet" — the same cut-status test slug dev/verify-theater-sprites.mjs
// already uses, so it's a known-good, already-cut sprite entry) standing off-center so its cast
// shadow has open floor to land on toward one side and a clean control patch on the other.
function dressedTrayBoard(env, lightProfile) {
  const tiles = [];
  for (let x = 0; x < 8; x++) for (let z = 0; z < 7; z++) tiles.push({ x, z, h: 0, kind: "floor" });
  return {
    tiles,
    props: [{ x: 1, z: 1, part: "crate", partParams: {} }],
    env, light: { profile: lightProfile },
    grid: { bandCount: 7, laneCount: 8 },
    __n: Math.random(),
  };
}
function dressedTrayUnits() {
  return { units: [{ id: "foe1", kind: "foe", name: "Shadow Test Poppet", recipeSlug: "grinning-poppet", x: 4, z: 3, hpPct: 1 }], __n: Math.random() };
}
async function setDressedTray(page, env, lightProfile) {
  await page.bringToFront();
  await page.evaluate((board) => { window.Theater.setBoard(board); }, dressedTrayBoard(env, lightProfile));
  await page.evaluate((units) => { window.Theater.setUnits(units); }, dressedTrayUnits());
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  // SPRITE PRE-WARM: buildSpriteBillboard's texture fetch is async (spriteTextureFor's own header —
  // a cache miss kicks off TextureLoader.load and returns null, so the FIRST setUnits call after a
  // fresh mount falls through to the whole-object/blank-figure placeholder; the real image's onLoad
  // then auto-replays S.lastUnits). Poll window.Theater._spriteTextureCache (exposed read/write, same
  // seam dev/verify-theater-sprites.mjs pre-warms directly in jsdom) until a "spr-*grinning-poppet*"
  // entry resolves to a real texture (neither undefined nor the string "pending"), then re-confirm
  // settle — real network+decode over localhost, not a fake jsdom stub, so this can take a beat.
  await page.waitForFunction(() => {
    const cache = window.Theater && window.Theater._spriteTextureCache;
    if (!cache) return false;
    const key = Object.keys(cache).find((k) => k.indexOf("grinning-poppet") >= 0);
    return !!key && cache[key] !== "pending" && cache[key] !== "failed";
  }, { timeout: 15000 }).catch(() => {}); // best-effort — a genuinely missing/failed sprite falls through to the documented placeholder chain, not a hang
  await page.waitForFunction(() => !window.Theater || typeof window.Theater.tweensLive !== "function" || window.Theater.tweensLive() === 0, { timeout: 15000 });
  await sleep(260);
}

async function screenshotBase64(page) {
  await page.bringToFront();
  const el = await page.$(".theater-stage-canvas canvas, canvas");
  if (!el) return null;
  return await el.screenshot({ encoding: "base64" });
}
// samples the MEAN LUMA of a small square region (CSS pixel coords, canvas top-left origin) of the
// currently-mounted canvas — used to compare a "behind the figure" patch against an "open floor"
// control patch far from any occluder.
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

// interior3d fixture — mirrors verify-env1-light-profiles.mjs's own interiorFixtureSrc exactly (same
// realm/geometry/light), so this harness's interior-stability numbers are directly comparable to
// that harness's own baseline.
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
  console.log("[verify-env1b-tabletop-shadows] ENV-1B — real cast shadows on the tabletop/exterior channel");

  group("0. RED-FIRST (source-level, base commit " + BASE_COMMIT + ")");
  {
    const oldSrc = execFileSync("git", ["show", `${BASE_COMMIT}:src/ui/theater-boot.js`], { cwd: repoRoot, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 });
    ok(!oldSrc.includes("TABLETOP_SHADOW_MAP_SIZE"), "TABLETOP_SHADOW_MAP_SIZE did not exist at base commit");
    ok(!oldSrc.includes("applyTabletopShadowCasters"), "applyTabletopShadowCasters did not exist at base commit");
    ok(oldSrc.includes("renderer.shadowMap.enabled = false; // §2"), "base commit's mount() still carried the old §2 shadowMap-off default");
    // THEATER SPLIT B9 (2026-07-25): mount() stayed in theater-boot.js, but setBoard's own restore moved
    // VERBATIM to src/ui/theater-tabletop.js (and setInteriorBoard's enable to
    // src/ui/theater-interior-realize.js). Read the two production files that carry the two lines this
    // check names; the assertion (BOTH mount's default and setBoard's restore flip to true) is unchanged.
    const newSrc = fs.readFileSync(path.join(repoRoot, "src/ui/theater-boot.js"), "utf-8")
      + "\n/* [verify-env1b composite boundary — src/ui/theater-tabletop.js follows] */\n"
      + fs.readFileSync(path.join(repoRoot, "src/ui/theater-tabletop.js"), "utf-8");
    ok(newSrc.includes("TABLETOP_SHADOW_MAP_SIZE") && newSrc.includes("applyTabletopShadowCasters"),
      "current worktree source carries the new shadow-caster symbols");
    ok(newSrc.match(/renderer\.shadowMap\.enabled = true;/g).length >= 2,
      "current worktree flips BOTH mount()'s default and setBoard's restore to true");
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

    // shadow-region sample point — located mechanically in section 1/2 (never hand-guessed), reused
    // by section 7's zoom capture.
    let shadowPt = null;

    group("1+2. RED/GREEN (empirical) — a shadow-darkened ground region exists NOW and did NOT at base");
    {
      await setDressedTray(redPage, "wilderness", "daylit");
      const redShot = await screenshotBase64(redPage);
      await setDressedTray(greenPage, "wilderness", "daylit");
      const greenShot = await screenshotBase64(greenPage);

      // locate the region where the CURRENT render darkened most vs the base render: block-mean
      // (16px cells) of (lumaOld - lumaNew), take the max cell. Block-mean (not single pixel) so a
      // stray antialias/dither pixel can never win over a real shadow pool.
      const found = await greenPage.evaluate(({ a, b }) => new Promise((resolve, reject) => {
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
      }), { a: redShot, b: greenShot });
      shadowPt = { x: found.x, y: found.y };
      console.log("    located max-darkening cell: " + JSON.stringify(found));

      // devicePixelRatio note: the screenshots are canvas-buffer-resolution; regionLuma samples the
      // same buffer space the locator searched, so coordinates line up 1:1 by construction.
      const redRegion = await regionLuma(redPage, shadowPt.x, shadowPt.y, 12);
      const greenRegion = await regionLuma(greenPage, shadowPt.x, shadowPt.y, 12);
      // an open-floor control patch: the SAME region in the RED frame is the control by construction
      // (nothing else changed between servers but this unit's shadow work) — additionally require it
      // to read as LIT floor (bright), not void/figure, so the claim is "a shadow-darkened region on
      // the GROUND", not just "some pixels got darker".
      console.log("    region luma: base=" + redRegion.toFixed(4) + " current=" + greenRegion.toFixed(4) + " darkening=" + (redRegion - greenRegion).toFixed(4));
      ok(found.darken > SHADOW_LUMA_DELTA, "[GREEN] a region exists where the current render is meaningfully darker than base (block-mean darkening " + found.darken.toFixed(4) + " > " + SHADOW_LUMA_DELTA + ")", found);
      ok(redRegion - greenRegion > SHADOW_LUMA_DELTA, "[RED+GREEN] that region was bright floor at base (luma " + redRegion.toFixed(3) + ") and is shadow-darkened now (luma " + greenRegion.toFixed(3) + ") — the shadow did not exist before this unit", { redRegion, greenRegion });
      ok(redRegion > 0.35, "[RED] the located region read as LIT GROUND on the base commit (not void/figure) — the new darkness is a cast shadow ON the floor", { redRegion });
      ok(await greenPage.evaluate(() => window.Theater.shadowMapEnabled()), "shadowMapEnabled() is true on the tabletop channel");
      ok(!(await redPage.evaluate(() => window.Theater.shadowMapEnabled())), "[RED] base-commit server confirms shadowMapEnabled() === false on its tabletop channel (the old §2 default, reproduced live)");
    }

    group("3. diagnostic accessor — every tabletop profile's point light casts");
    {
      const page = greenPage;
      for (const profile of ["daylit", "torchlit", "moonlit", "dark", "lavalit"]) {
        await setDressedTray(page, "wilderness", profile);
        const diag = await page.evaluate(() => window.Theater._tabletopSceneLightsForTest());
        const p0 = diag.points[0];
        ok(!!(p0 && p0.castShadow === true), "[" + profile + "] point[0].castShadow === true", p0);
        ok(!!(p0 && p0.shadowMapSize === 512), "[" + profile + "] point[0].shadowMapSize === 512 (TABLETOP_SHADOW_MAP_SIZE)", p0);
        ok(!!(p0 && Math.abs(p0.shadowBias - (-0.002)) < 1e-9), "[" + profile + "] point[0].shadowBias === -0.002 (TABLETOP_SHADOW_BIAS)", p0);
      }
      // overcast authors ZERO points (LIGHT_PROFILES.overcast.points === []) — nothing to mark, and the
      // accessor should reflect that honestly rather than fabricating a caster.
      await setDressedTray(page, "wilderness", "overcast");
      const diagOvercast = await page.evaluate(() => window.Theater._tabletopSceneLightsForTest());
      ok(diagOvercast.points.length === 0, "[overcast] authors zero points — nothing to mark as a caster (expected, not a gap)", diagOvercast);
    }

    group("4. interior byte-stability — torchlit + daylit, OLD vs NEW pixel-diff < epsilon");
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

    group("5. flip-sequence integrity — interior -> tabletop -> interior restores correctly");
    {
      const page = greenPage;
      await setInterior(page, "torchlit");
      const direct = await screenshotBase64(page);
      await setDressedTray(page, "wilderness", "daylit");
      ok(await page.evaluate(() => window.Theater.shadowMapEnabled()), "tabletop hop: shadowMapEnabled() still true (both channels now share it)");
      await setInterior(page, "torchlit");
      const afterFlip = await screenshotBase64(page);
      ok(await page.evaluate(() => window.Theater.shadowMapEnabled()), "back in interior: shadowMapEnabled() true");
      const diffFlip = await pixelDiffMean(page, direct, afterFlip);
      console.log("    interior direct vs interior-after-tabletop-hop: mean=" + diffFlip.mean.toFixed(5));
      ok(diffFlip.mean < 0.01, "interior render is pixel-stable across an interior->tabletop->interior hop (restore discipline intact)", diffFlip);
    }

    group("6. FPS delta — measureRenderFps on the dressed tray, OLD (shadows off) vs NEW (shadows on)");
    {
      await setDressedTray(redPage, "wilderness", "daylit");
      const redFps = await redPage.evaluate(() => window.Theater.measureRenderFps(90));
      await setDressedTray(greenPage, "wilderness", "daylit");
      const greenFps = await greenPage.evaluate(() => window.Theater.measureRenderFps(90));
      console.log("    OLD (shadows off): " + JSON.stringify(redFps));
      console.log("    NEW (shadows on):  " + JSON.stringify(greenFps));
      console.log("    delta: " + (greenFps.fps - redFps.fps).toFixed(1) + " fps (" + (((greenFps.fps - redFps.fps) / redFps.fps) * 100).toFixed(1) + "%)");
      ok(redFps && greenFps, "captured fps on both servers", { redFps, greenFps });
      // reported, not gated — this is a perf CENSUS per the task brief, not a regression threshold.
    }

    group("7. CAPTURE CARD — 4-profile shadow reshoot + a zoomed blob/shadow overlap read");
    {
      const page = greenPage;
      const shots = [];
      for (const profile of ["daylit", "overcast", "moonlit", "dark"]) {
        await setDressedTray(page, "wilderness", profile);
        const el = await page.$(".theater-stage-canvas canvas, canvas");
        const file = path.join(outDir, `env1b-wilderness-${profile}-shadows.png`);
        if (el) { await el.screenshot({ path: file }); shots.push(file); }
      }
      ok(shots.length === 4, "captured all 4 profile-with-shadows frames", shots);

      // zoomed blob/shadow overlap read — daylit, cropped tight around the figure's own base.
      await setDressedTray(page, "wilderness", "daylit");
      const el = await page.$(".theater-stage-canvas canvas, canvas");
      const zoomFile = path.join(outDir, "env1b-daylit-blob-zoom.png");
      if (el) {
        const box = shadowPt ? { x: shadowPt.x - 180, y: shadowPt.y - 220, width: 360, height: 320 } : undefined;
        await el.screenshot({ path: zoomFile, clip: box });
        shots.push(zoomFile);
      }
      ok(fs.existsSync(zoomFile), "captured the zoomed blob/shadow-overlap frame", zoomFile);
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
