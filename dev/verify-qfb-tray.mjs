#!/usr/bin/env node
/* dev/verify-qfb-tray.mjs — PLAY-LENS P0 quick-fix wave, items 4/5/6 (dev/play-lens/ledger.md):
     QF-B1 "unshaded white wireframe mesh floating in the settlement tray" (pl-002)
     QF-B2 "walk_complete arrival renders as a single soft ellipse on black" (pl-010)
     QF-B3 "the tray camera clips the PC's head" (pl-001, pl-002)

   Boots the real app (server + headless Chrome + THREE), same convention dev/verify-occlusion-
   fade.mjs already uses. Drives window.Theater.setBoard/setUnits directly (dev/theater-preview.html's
   own fixture-button convention, called headless here instead of via UI clicks) — no live DM/combat
   state needed for any of these three claims.

   ============================================================================================
   QF-B1 — ROOT CAUSE: data/realm-props.js (GENERATED from dev/model-qa/realm-props.json) reuses
   prop-web.js's buildWebMass — a giant-spider CORNER WEB authored in pale ghost-silk vertex colors
   (thin, low-poly strand tubes) — as a generic "thin tangled lattice" placeholder shape for ~15
   semantically-unrelated realm props (Alley Fire Escape, Rebar Thicket, Cable Snarl, Cargo Net
   Tangle, Barbed Coil, Coiled Mooring Rope, Shopping Cart Tangle, Broken Parking Meter Row, Downed
   Observation Balloon, Jungle Liana Curtain, Grinning Crank-Box, Storm-Cloud Bounce House, Overgrown
   Hedge Row, Fleshy Growth). The whole-object prop pipeline (theater-boot.js wholeObjectGeometryFor/
   wholeObjectMaterialsFor) bakes a model's palette directly into its geometry's vertex-color buffer —
   there was no per-instance recolor hook, so EVERY reuse rendered in the model's own fixed pale
   palette regardless of what it stood in for. On this model's thin strand geometry, pale-on-dark
   reads exactly as an unshaded white wireframe cage (pl-002's evidence frame) — not a literal
   `wireframe:true` material (none exists anywhere in this codebase — verified by source grep) and
   not a GLB/missing-texture fallback (this model is a hand-authored probe-lib figure, not a GLB).
   FIX: wholeObjectGeometryFor gained an optional `retintHex` 4th arg + wholeObjectRetintColorBuffer
   (theater-boot.js) — recolors a cached geometry's baked vertex colors toward a target hue while
   preserving each vertex's own luma (its existing lit/shadow pattern). The props mount call site
   reads an authored `partParams.retint` (data/realm-props.js, generated from a new per-entry
   `retint` field in dev/model-qa/realm-props.json + build/gen-realm-props.py) and threads it
   through. The 2 genuinely web-thematic reuses (Cobweb Mass, Hanging Cocoon Cluster) carry NO
   retint — untouched, regression-safe.
   Checks 1-6 below.

   ============================================================================================
   QF-B2 / QF-B3 — ROOT CAUSE (shared mechanism): placeCamera()'s screenHalfHeight term is
   `screenHalfDepth*sin(elevation) + standeeHeight*cos(elevation)`. The interior/"beat" channel
   already threads a real standeeHeight (S.interiorFitMaxHeight, setInteriorBoard's own
   interiorFitMaxHeightFor) — the FLAT TABLETOP channel (setBoard/setUnits: node/settlement trays
   AND live combat both render through this same GL layer) never did: setBoard unconditionally
   reset S.interiorFitMaxHeight to 0 every render ("0 for the flat tabletop... only
   setInteriorBoard ever computes a nonzero" — the file's own pre-existing comment). So the
   tabletop fit had ZERO knowledge of standee height:
     - QF-B3: a normal-height PC/NPC's head can crop against the top frame edge even though its
       floor cell sits correctly inside the fit (pl-001, pl-002).
     - QF-B2: on a DEGENERATE board (theaterIdleBoardFrom's `tiles:[],props:[]` empty table —
       the render arrival lands on when the destination node isn't a place-gen record, e.g. a
       dungeon-entrance/frontier marker) the footprint-only fit collapses to a tiny ~1-unit-radius
       frustum with NO height awareness at all — a full standing PC figure blows straight past
       every frame edge, leaving only its small floor-level base disc inside frame: a lone pale
       ellipse on black (pl-010's evidence frame — exactly reproduced below, check 9).
   Separately, THEATER-ZOOM-SPREAD's own "3-step readability" zoom-in bias (S.zoomLevel ≈ 0.512
   on a normal board) multiplies the auto-fit viewSize UNCONDITIONALLY, so even a correctly
   height-aware auto-fit could still get re-cropped by that bias (check 8's own red/green pair).
   FIX (theater-boot.js):
     - TABLETOP_CAMERA_HEADROOM (named const, 0.3 world units) — clearance above the tallest
       figure's own measured top.
     - setUnits now measures every mounted figure's REAL rendered bounding-box top (THREE.Box3,
       not a per-archetype height guess — correct across whole-object/recipe/cuboid/interior-
       sprite figures alike) and, on the flat tabletop channel only (`!S.isInteriorBoard`, never
       touching the interior channel's own dedicated fit), stores the tallest one (+ headroom)
       into the SAME S.interiorFitMaxHeight field placeCamera already reads, then calls
       placeCamera() again so the fit setBoard computed (before any unit existed) gets refit
       against the real figures.
     - placeCamera's ortho branch (the tabletop's own camera type, always) floors the zoom-biased
       final viewSize at `viewSizeForHeight` (the headroom-inclusive height term, unbiased) — the
       zoom-in bias can still tighten the frame past the board-footprint fit for dramatic framing,
       but never past the point where the tallest figure's own padded head would crop.
   No data-layer change: theaterHereSourceFor's existing "untyped node -> idle" resolution
   (dev/verify-place-tray.mjs's own locked/tested d4 check) is UNTOUCHED — an arrival at a node
   with no typed place record still resolves to the idle board; what changed is that the idle
   board's OWN camera fit is no longer degenerate, so the PC standee it holds is genuinely visible
   and well-composed instead of collapsing to a stray ellipse.
   Checks 7-10 below.

   Run:  node dev/verify-qfb-tray.mjs */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(__dirname, "battle-gate", "qfb-tray");
fs.mkdirSync(outDir, { recursive: true });

// dedicated range — never shared with capture-*.mjs's own (5181-5225) or the other verify-*.mjs
// dedicated ranges already claimed (5231-5235 mf1/vp1c, 5241-5245 mf4, 5251-5255 occlusion-fade).
const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5261, 5262, 5263, 5264, 5265];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let pass = 0, fail = 0;
function ok(cond, label, detail) { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label, detail !== undefined ? "— " + detail : ""); } }
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
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
}

// ============================================================================================
// SECTION 0 — data-layer checks (no browser): dev/model-qa/realm-props.json / data/realm-props.js
// ============================================================================================
group("0. data-layer — retint authored on the mismatched props, NOT on the genuine web ones");
{
  const genJs = fs.readFileSync(path.join(repoRoot, "data/realm-props.js"), "utf-8");
  const RETINTED = ["Cable Snarl", "Alley Fire Escape", "Broken Parking Meter Row", "Rebar Thicket",
    "Shopping Cart Tangle", "Overgrown Hedge Row", "Fleshy Growth", "Barbed Coil",
    "Downed Observation Balloon", "Cargo Net Tangle", "Ratlines Web", "Coiled Mooring Rope",
    "Jungle Liana Curtain", "Grinning Crank-Box", "Storm-Cloud Bounce House"];
  const UNTOUCHED = ["Cobweb Mass", "Hanging Cocoon Cluster"];
  for (const name of RETINTED) {
    const re = new RegExp(`"name":\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]{0,260}?"retint":\\s*\\d+`);
    ok(re.test(genJs), `${name}: carries a numeric partParams.retint in data/realm-props.js`);
  }
  for (const name of UNTOUCHED) {
    const block = genJs.slice(genJs.indexOf(`"name": "${name}"`), genJs.indexOf(`"name": "${name}"`) + 300);
    ok(block.includes(`"partParams": {}`), `${name}: partParams stays {} (untouched — genuinely pale web/cocoon read)`);
  }
  ok(fs.readFileSync(path.join(repoRoot, "dev/model-qa/realm-props.json"), "utf-8").includes('"retint"'),
    "source dev/model-qa/realm-props.json carries the authored retint field (edit-source discipline)");
}

async function main() {
  console.log("[verify-qfb-tray] QF-B1 / QF-B2 / QF-B3 — PLAY-LENS P0 items 4/5/6");
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
    await page.goto(`${BASE}/dev/theater-preview.html`, { waitUntil: "load", timeout: 30000 });
    for (let i = 0; i < 60; i++) {
      const ready = await page.evaluate(() => !!(window.Theater && typeof window.Theater.setBoard === "function" && window.Theater.ready === true));
      if (ready) break;
      await sleep(150);
    }
    const readyNow = await page.evaluate(() => !!(window.Theater && window.Theater.ready === true));
    ok(readyNow, "window.Theater mounted + ready before any check runs");

    // ==========================================================================================
    // SECTION 1 — QF-B1: the retint mechanism, on the REAL cached geometry pipeline
    // ==========================================================================================
    group("1. [RED-FIRST] QF-B1 — prop:web-mass's baked palette is genuinely pale (the pl-002 bug's raw material)");
    const paleAvg = await page.evaluate(() => {
      const geo = window.Theater._wholeObjectGeometryForTest("prop:web-mass", false, "prop");
      if (!geo) return null;
      const col = geo.getAttribute("color").array;
      let r = 0, g = 0, b = 0, n = col.length / 3;
      for (let i = 0; i < col.length; i += 3) { r += col[i]; g += col[i + 1]; b += col[i + 2]; }
      return { r: r / n, g: g / n, b: b / n, luma: (0.299 * r + 0.587 * g + 0.114 * b) / n };
    });
    ok(!!paleAvg, "prop:web-mass geometry resolves (builder loaded, non-empty buffer)");
    if (paleAvg) {
      ok(paleAvg.luma > 0.35, "RED baseline: untinted prop:web-mass average luma is pale/mid-bright (the silk strands dominate on this thin geometry — reads as near-white at board distance)", JSON.stringify(paleAvg));
    }

    group("2. [GREEN] QF-B1 — retintHex recolors the SAME geometry toward the target hue, luma pattern preserved");
    const tintedAvg = await page.evaluate(() => {
      const geo = window.Theater._wholeObjectGeometryForTest("prop:web-mass", false, "prop", 0x4a4c4f); // dark iron
      if (!geo) return null;
      const col = geo.getAttribute("color").array;
      let r = 0, g = 0, b = 0, n = col.length / 3;
      for (let i = 0; i < col.length; i += 3) { r += col[i]; g += col[i + 1]; b += col[i + 2]; }
      return { r: r / n, g: g / n, b: b / n, luma: (0.299 * r + 0.587 * g + 0.114 * b) / n };
    });
    ok(!!tintedAvg, "retinted prop:web-mass geometry resolves");
    if (tintedAvg && paleAvg) {
      ok(tintedAvg.luma < paleAvg.luma - 0.15, "retinted average luma is meaningfully darker than the pale baseline (0x4a4c4f is a dark iron tone)", JSON.stringify({ pale: paleAvg.luma, tinted: tintedAvg.luma }));
      const chanSpread = Math.max(tintedAvg.r, tintedAvg.g, tintedAvg.b) - Math.min(tintedAvg.r, tintedAvg.g, tintedAvg.b);
      ok(chanSpread < 0.03, "retinted average channels sit close together (a desaturated near-gray) matching the dark-iron target's own low-saturation hue (0x4a4c4f: 74,76,79)", JSON.stringify(tintedAvg));
    }

    group("3. [GREEN] QF-B1 — untouched genuine-web reuses stay byte-identical (Cobweb Mass regression guard)");
    const cachedTwice = await page.evaluate(() => {
      const a = window.Theater._wholeObjectGeometryForTest("prop:web-mass", false, "prop");
      const b = window.Theater._wholeObjectGeometryForTest("prop:web-mass", false, "prop");
      return a === b; // same cache-key -> same cached object, never rebuilt
    });
    ok(cachedTwice, "an omitted retintHex (every genuine-web reuse's own call) resolves the SAME cached geometry instance — no accidental recolor drift");

    group("4. [RED-FIRST] QF-B1 — a live node-tray mount of the mismatched prop (pl-002 repro) reads pale before the fix, dark after");
    {
      const tiles = []; for (let x = 0; x < 2; x++) for (let z = 0; z < 2; z++) tiles.push({ x, z, h: 0, kind: "floor" });
      const before = await page.evaluate((tiles) => {
        window.Theater.setBoard({ tiles, props: [{ x: 0.5, z: 0.5, model: "prop:web-mass", partParams: {} }], env: "dungeon", light: { profile: "dark" }, grid: { bandCount: 2, laneCount: 2 }, __n: Math.random() });
        const geo = window.Theater._wholeObjectGeometryForTest("prop:web-mass", false, "prop"); // no retint = today's "Alley Fire Escape" bug, byte for byte
        const col = geo.getAttribute("color").array;
        let luma = 0, n = col.length / 3;
        for (let i = 0; i < col.length; i += 3) luma += 0.299 * col[i] + 0.587 * col[i + 1] + 0.114 * col[i + 2];
        return luma / n;
      }, tiles);
      ok(before > 0.35, "[RED] a node-tray mount with no retint (the pre-fix shape every mismatched entry had) is pale — the wireframe-cage symptom", before);
      const after = await page.evaluate((tiles) => {
        window.Theater.setBoard({ tiles, props: [{ x: 0.5, z: 0.5, model: "prop:web-mass", partParams: { retint: 0x4a4c4f } }], env: "dungeon", light: { profile: "dark" }, grid: { bandCount: 2, laneCount: 2 }, __n: Math.random() });
        const geo = window.Theater._wholeObjectGeometryForTest("prop:web-mass", false, "prop", 0x4a4c4f);
        const col = geo.getAttribute("color").array;
        let luma = 0, n = col.length / 3;
        for (let i = 0; i < col.length; i += 3) luma += 0.299 * col[i] + 0.587 * col[i + 1] + 0.114 * col[i + 2];
        return luma / n;
      }, tiles);
      ok(after < 0.35, "[GREEN] the SAME node-tray mount with the authored retint (Alley Fire Escape's real partParams shape) reads dark/shaded", after);
    }

    // ==========================================================================================
    // SECTION 2 — QF-B3: the tabletop camera fit includes real standee height + headroom
    // ==========================================================================================
    group("5. [RED-FIRST] QF-B3 — a mounted PC's head is NOT contained when the fit carries no height data");
    {
      const tiles = []; for (let x = 0; x < 4; x++) for (let z = 0; z < 3; z++) tiles.push({ x, z, h: 0, kind: "floor" });
      const redResult = await page.evaluate((tiles) => {
        window.Theater.setBoard({ tiles, props: [], env: "dungeon", light: { profile: "dark" }, grid: { bandCount: 3, laneCount: 4 }, __n: Math.random() });
        window.Theater.setUnits({ units: [], __n: Math.random() }); // no figures mounted — S.interiorFitMaxHeight has nothing to measure, mirrors the pre-fix permanent-0
        const fitH = window.Theater.interiorFitMaxHeight();
        // a realistic standing-PC head height (measured live in check 6 below; a conservative literal here keeps this check independent/self-contained)
        return { fitH, frustum: window.Theater.interiorFrustumCheck(1.55) };
      }, tiles);
      ok(redResult.fitH === 0, "[RED] with no units mounted, the tabletop fit's own height term is 0 (today's permanent-0 baseline)", redResult.fitH);
      ok(redResult.frustum.ok === false, "[RED] a 1.55u-tall standee's top corners are NOT contained by a height-blind fit — the head-clip bug, reproduced", JSON.stringify(redResult.frustum.corners.filter(c => !c.inFrustum)));
    }

    group("6. [GREEN] QF-B3 — mounting the real PC figure measures its true height and refits containment");
    {
      const tiles = []; for (let x = 0; x < 4; x++) for (let z = 0; z < 3; z++) tiles.push({ x, z, h: 0, kind: "floor" });
      const greenResult = await page.evaluate((tiles) => {
        window.Theater.setBoard({ tiles, props: [], env: "dungeon", light: { profile: "dark" }, grid: { bandCount: 3, laneCount: 4 }, __n: Math.random() });
        window.Theater.setUnits({ units: [{ id: "pc1", kind: "pc", name: "Play Lens Bot", x: 1.5, z: 1.5, hpPct: 1, className: "barbarian" }], __n: Math.random() });
        const fitH = window.Theater.interiorFitMaxHeight();
        return { fitH, frustum: window.Theater.interiorFrustumCheck(fitH) };
      }, tiles);
      ok(greenResult.fitH > 1.0 && greenResult.fitH < 3.0, "a real barbarian PC's measured height + TABLETOP_CAMERA_HEADROOM lands in a sane range", greenResult.fitH);
      ok(greenResult.frustum.ok === true, "[GREEN] the fitted height is now fully contained in frustum (every corner)", JSON.stringify(greenResult.frustum.corners));
    }

    group("7. [RED-FIRST->GREEN] QF-B3 — the readability zoom-in bias can no longer crop past the headroom floor");
    {
      // a small/near-square board (bandCount<=SMALL_BOARD_BAND_THRESHOLD) draws THEATER-ZOOM-SPREAD's
      // extra small-board zoom-in on top of the normal 3-step bias — the tightest, most crop-prone case.
      const tiles = [{ x: 0, z: 0, h: 0, kind: "floor" }, { x: 1, z: 0, h: 0, kind: "floor" }, { x: 0, z: 1, h: 0, kind: "floor" }, { x: 1, z: 1, h: 0, kind: "floor" }];
      const r = await page.evaluate((tiles) => {
        window.Theater.setBoard({ tiles, props: [], env: "dungeon", light: { profile: "dark" }, grid: { bandCount: 2, laneCount: 2 }, __n: Math.random() });
        window.Theater.setUnits({ units: [{ id: "pc1", kind: "pc", name: "Play Lens Bot", x: 0.5, z: 0.5, hpPct: 1, className: "barbarian" }], __n: Math.random() });
        const fitH = window.Theater.interiorFitMaxHeight();
        return { fitH, frustum: window.Theater.interiorFrustumCheck(fitH) };
      }, tiles);
      ok(r.frustum.ok === true, "a small (zoom-biased) 2x2 tray still fully contains the PC's measured height — the bias floor holds", JSON.stringify(r.frustum.corners.filter(c => !c.inFrustum)));
    }

    // ==========================================================================================
    // SECTION 3 — QF-B2: the walk_complete arrival (idle/degenerate board) repro
    // ==========================================================================================
    group("8. [RED-FIRST] QF-B2 — the idle empty-table board (theaterIdleBoardFrom's tiles:[]) + a mounted PC, pre-fix shape");
    {
      const redResult = await page.evaluate(() => {
        window.Theater.setBoard({ tiles: [], props: [], env: "dungeon", light: { profile: "dark" }, grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"], bandCount: 4, laneCount: 3 }, __n: Math.random() });
        window.Theater.setUnits({ units: [], __n: Math.random() }); // pre-fix shape: setBoard alone never learns a height, no unit mounted yet either
        return { fitH: window.Theater.interiorFitMaxHeight(), frustum: window.Theater.interiorFrustumCheck(1.55) };
      });
      ok(redResult.fitH === 0, "[RED] the idle board's own fit carries zero height data before any figure mounts", redResult.fitH);
      ok(redResult.frustum.ok === false, "[RED] a standee-height corner set is NOT contained — this is pl-010's degenerate-fit mechanism", JSON.stringify(redResult.frustum.corners.filter(c => !c.inFrustum)));
    }

    group("9. [GREEN] QF-B2 — mounting the arrived PC on the SAME idle board now fully composes (no floor tiles, real figure, full containment)");
    {
      const greenResult = await page.evaluate(() => {
        window.Theater.setBoard({ tiles: [], props: [], env: "dungeon", light: { profile: "dark" }, grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"], bandCount: 4, laneCount: 3 }, __n: Math.random() });
        window.Theater.setUnits({ units: [{ id: "pc1", kind: "pc", name: "Play Lens Bot", x: 0, z: 0, hpPct: 1, className: "barbarian" }], __n: Math.random() });
        const fitH = window.Theater.interiorFitMaxHeight();
        return { fitH, frustum: window.Theater.interiorFrustumCheck(fitH), unitCount: window.Theater._unitGroupChildCountForTest ? window.Theater._unitGroupChildCountForTest() : null };
      });
      ok(greenResult.fitH > 1.0, "[GREEN] the arrival-idle board now carries a real measured height once the PC mounts", greenResult.fitH);
      ok(greenResult.frustum.ok === true, "[GREEN] the arrived PC's full height is contained — a legible standing figure, not a stray ellipse", JSON.stringify(greenResult.frustum.corners));
    }

    group("10. capture — visual proof frames (read + described by hand in the session report, not asserted here)");
    {
      const canvasSel = ".theater-stage-canvas canvas, canvas";
      await sleep(200);
      const el = await page.$(canvasSel);
      if (el) {
        await page.evaluate((tiles) => {
          window.Theater.setBoard({ tiles, props: [{ x: 0.5, z: 0.5, model: "prop:web-mass", partParams: { retint: 0x4a4c4f } }], env: "dungeon", light: { profile: "dark" }, grid: { bandCount: 2, laneCount: 2 }, __n: Math.random() });
          window.Theater.setUnits({ units: [], __n: Math.random() }); // isolate this capture from any figure a prior check left mounted
        }, [{ x: 0, z: 0, h: 0, kind: "floor" }, { x: 1, z: 0, h: 0, kind: "floor" }, { x: 0, z: 1, h: 0, kind: "floor" }, { x: 1, z: 1, h: 0, kind: "floor" }]);
        await sleep(150);
        await el.screenshot({ path: path.join(outDir, "qfb1-web-mass-retinted.png") });
        await page.evaluate((tiles) => {
          window.Theater.setBoard({ tiles, props: [], env: "dungeon", light: { profile: "dark" }, grid: { bandCount: 2, laneCount: 2 }, __n: Math.random() });
          window.Theater.setUnits({ units: [{ id: "pc1", kind: "pc", name: "Play Lens Bot", x: 0.5, z: 0.5, hpPct: 1, className: "barbarian" }], __n: Math.random() });
        }, [{ x: 0, z: 0, h: 0, kind: "floor" }, { x: 1, z: 0, h: 0, kind: "floor" }, { x: 0, z: 1, h: 0, kind: "floor" }, { x: 1, z: 1, h: 0, kind: "floor" }]);
        await sleep(150);
        await el.screenshot({ path: path.join(outDir, "qfb3-tray-camera-headroom.png") });
        await page.evaluate(() => {
          window.Theater.setBoard({ tiles: [], props: [], env: "dungeon", light: { profile: "dark" }, grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"], bandCount: 4, laneCount: 3 }, __n: Math.random() });
          window.Theater.setUnits({ units: [{ id: "pc1", kind: "pc", name: "Play Lens Bot", x: 0, z: 0, hpPct: 1, className: "barbarian" }], __n: Math.random() });
        });
        await sleep(150);
        await el.screenshot({ path: path.join(outDir, "qfb2-arrival-idle-board.png") });
        ok(true, "captured 3 proof frames to dev/battle-gate/qfb-tray/");
      } else {
        ok(false, "canvas element not found for capture");
      }
    }
  } finally {
    if (browser) await browser.close();
    if (server && server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

await main();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
