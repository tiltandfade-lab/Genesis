/* CL-R0 capture rig (docs/CLAYROOM-RESET-LADDER.md §"Capture and receipt law").

   A gameplay-scale before/after capture of ONE Clayroom fixture through the PRODUCTION renderer
   (genesis.html + the real ?clayroom=1 mount), plus a machine-readable receipt that records the
   exact fixture, seed, recipe, camera, renderer path, light values, and SURFACE CENSUS that
   produced the frame. Supersedes nothing: dev/capture-clay-room.cjs remains the C1A overlay-tab
   packet rig; this one exists because CL-R0's own acceptance needs the settle TIMELINE (a frame
   captured before async settlement and the same frame after) and per-surface material provenance,
   neither of which that rig records.

   Usage (server must already be serving THIS worktree):
     node dev/capture-clayroom-fixture.cjs <outDir> <label> [port] [extraQuery] [lightRecipeId]

   Everything it reads is an existing read-only diagnostic seam (window.Theater._*ForTest) or a
   pure engine global (clayRoomRecordFrom / CLAY_* ). It never mutates page state except to click
   the overlay's own tab buttons, and it never asserts a visual verdict — measurement lives in
   dev/measure-clay-capture.py and judgement lives with Adam. */
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const LABEL = process.argv[3] || "capture";
const PORT = process.argv[4] || "5176";
const EXTRA = process.argv[5] || "";
const LIGHT_RECIPE_ID = process.argv[6] || "";
const MATERIAL_MODE = new URLSearchParams(EXTRA).get("materialmode") || "";
const TRIM_MODE = new URLSearchParams(EXTRA).get("trimmode") || "";
if (!OUT) { console.error("usage: node dev/capture-clayroom-fixture.cjs <outDir> <label> [port] [extraQuery] [lightRecipeId]"); process.exit(2); }
const BASE = "http://127.0.0.1:" + PORT;
fs.mkdirSync(OUT, { recursive: true });

// Gameplay scale: the same 1280x720 @ dpr2 the C1A packet rig used, so before/after and the two
// eras of capture stay directly comparable. Declared in the receipt, never inferred at read time.
const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };

// Deterministic measurement windows, normalized to the frame, verified against the banked
// `before` capture so each rectangle actually contains the surface it names. Declared HERE (and
// echoed into every receipt) so dev/measure-clay-capture.py measures the same rectangles on every
// capture instead of a human eyeballing a crop. The fixture's geometry and camera are fixed, so
// these stay valid across before/after. KEEP IN SYNC with dev/measure-clay-capture.py's REGIONS.
const REGIONS = {
  full:      [0.00, 0.00, 1.00, 1.00],
  floor:     [0.42, 0.73, 0.58, 0.86],  // clean floor field, below/left of the crate
  sprite:    [0.25, 0.37, 0.35, 0.60],  // the goblin citizen's own column, incl. its plinth
  crate:     [0.53, 0.38, 0.69, 0.75],  // the furniture assembly
  doorframe: [0.84, 0.38, 0.95, 0.62],  // the north portal's jamb/header
};

function pageProbe() {
  // Runs INSIDE the page. Only read-only seams.
  const T = window.Theater || {};
  const rec = (typeof clayRoomRecordFrom === "function") ? clayRoomRecordFrom(0x6c0ffee) : null;
  const canvas = document.querySelector("canvas");
  const meshes = T._interiorGroupMeshInfoForTest ? T._interiorGroupMeshInfoForTest() : null;
  return {
    fixture: rec ? {
      id: rec.id, version: rec.version, tier: rec.tier, seed: rec.seed,
      seedHex: rec.seed == null ? null : "0x" + Number(rec.seed).toString(16),
      dims: rec.dims, portal: rec.portal, object: rec.object,
      citizen: { id: rec.citizen.id, bestiaryId: rec.citizen.bestiaryId, cell: rec.citizen.cell,
                 worldHeight: rec.citizen.bodyForm.worldHeight, heightSource: rec.citizen.bodyForm.heightSource },
      provenance: rec.provenance ? { pass: rec.provenance.pass, derivation: rec.provenance.derivation, created: rec.provenance.created } : null,
    } : null,
    lightRecipe: T._clayLightingRecipeForTest ? T._clayLightingRecipeForTest() : null,
    lightingBench: T._clayLightingBenchForTest ? T._clayLightingBenchForTest() : null,
    materialBench: T._clayMaterialBenchForTest ? T._clayMaterialBenchForTest() : null,
    trimBench: T._clayTrimBenchForTest ? T._clayTrimBenchForTest() : null,
    structureBench: T._clayStructureBenchForTest ? T._clayStructureBenchForTest() : null,
    traversabilityGrid: T._clayTraversabilityGridForTest
      ? T._clayTraversabilityGridForTest() : null,
    lightLock: (typeof LIGHT_PROFILE_LOCKS_COMPILED !== "undefined")
      ? { id: LIGHT_PROFILE_LOCKS_COMPILED.id, version: LIGHT_PROFILE_LOCKS_COMPILED.version,
          schemaVersion: LIGHT_PROFILE_LOCKS_COMPILED.schemaVersion }
      : null,
    lightingProof: T._clayLightingProofForTest ? T._clayLightingProofForTest() : null,
    surfaceRecipe: (typeof CLAY_DIAGNOSTIC_SURFACE_RECIPE !== "undefined")
      ? JSON.parse(JSON.stringify(CLAY_DIAGNOSTIC_SURFACE_RECIPE)) : null,
    camera: T._clayCameraPoseForTest ? T._clayCameraPoseForTest() : null,
    renderer: {
      backingPx: canvas ? canvas.width + "x" + canvas.height : null,
      cssPx: canvas ? canvas.clientWidth + "x" + canvas.clientHeight : null,
      canvasCount: document.querySelectorAll("canvas").length,
      shadowMap: T.shadowMapEnabled ? T.shadowMapEnabled() : null,
      cameraIsPerspective: T.cameraIsPerspective ? T.cameraIsPerspective() : null,
    },
    lights: T._interiorSceneLightsForTest ? T._interiorSceneLightsForTest() : null,
    surfaces: meshes,
    // The CL-R0 headline number: how many structural surfaces are still carrying a real texture
    // map (i.e. did NOT end up on the diagnostic clay route) at this instant.
    texturedSurfaceCount: meshes ? meshes.filter((m) => !!m.mapInfo).length : null,
    surfaceOwners: T._claySurfaceCensusForTest ? T._claySurfaceCensusForTest() : null,
    // CL-R3a — the compile-time wall-omission decision set (ruleId/version/active/omitted/built), so
    // the receipt names exactly which wall segments were omitted and by which rule.
    wallOmission: T._wallOmissionForTest ? T._wallOmissionForTest() : null,
    // door tranche — where each practical light fixture physically mounted (the placement-bias proof)
    fixtures: T._interiorFixtureEmittersForTest ? T._interiorFixtureEmittersForTest() : null,
    doorMount: T._doorMountForTest ? T._doorMountForTest() : null,
    provenanceAudit: T._clayProvenanceAuditForTest ? T._clayProvenanceAuditForTest() : null,
    stats: T.stats ? { boardBuilds: T.stats.boardBuilds, boardSkips: T.stats.boardSkips } : null,
  };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT,
  });
  const page = await browser.newPage();
  // The repository intentionally has no favicon. Keep that browser-chrome request from polluting
  // the application error receipt; every real Genesis request still reaches the server unchanged.
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/favicon.ico") request.respond({ status: 204 });
    else request.continue();
  });
  const consoleErrors = [], consoleWarnings = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
    else if (m.type() === "warning" || m.type() === "warn") consoleWarnings.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  const url = BASE + "/genesis.html?clayroom=1" + (EXTRA ? "&" + EXTRA : "");
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(
    () => document.querySelector("canvas") && document.getElementById("clay-room-overlay"),
    { timeout: 30000 }
  );
  if (MATERIAL_MODE) {
    const applied = await page.evaluate((mode) => {
      return !!(window.Theater && window.Theater._claySetMaterialModeForTest
        && window.Theater._claySetMaterialModeForTest(mode));
    }, MATERIAL_MODE);
    if (!applied) throw new Error("could not apply material mode " + MATERIAL_MODE);
    await new Promise((r) => setTimeout(r, 350));
  }
  if (TRIM_MODE) {
    const applied = await page.evaluate((mode) => {
      return !!(window.Theater && window.Theater._claySetTrimModeForTest
        && window.Theater._claySetTrimModeForTest(mode));
    }, TRIM_MODE);
    if (!applied) throw new Error("could not apply trim mode " + TRIM_MODE);
    await new Promise((r) => setTimeout(r, 350));
  }
  if (LIGHT_RECIPE_ID) {
    const applied = await page.evaluate((id) => {
      return !!(window.Theater && window.Theater._claySetLightingRecipeForTest
        && window.Theater._claySetLightingRecipeForTest(id));
    }, LIGHT_RECIPE_ID);
    if (!applied) throw new Error("could not apply light recipe " + LIGHT_RECIPE_ID);
    await page.evaluate(() => {
      const button = [...document.querySelectorAll("button")]
        .find((entry) => entry.getAttribute("aria-label") === "Clayroom lighting proof");
      if (button) button.click();
    });
    await new Promise((r) => setTimeout(r, 350));
  }

  // THE SETTLE TIMELINE. `early` is the frame right after mount, BEFORE the goblin's sprite PNG
  // finishes loading and fires spriteTextureFor's own setInteriorBoard(S.lastBoard) replay;
  // `settled` is the same fixture 5s later, after every async rebuild this mount can trigger.
  // CR-1 (the "basic dungeon floor glued to it" regression) is precisely a DIFFERENCE between
  // these two, so both are banked every time, never just the pretty one.
  await new Promise((r) => setTimeout(r, 600));
  const early = await page.evaluate(pageProbe);
  await page.screenshot({ path: path.join(OUT, LABEL + "-01-early.png") });

  await new Promise((r) => setTimeout(r, 5000));
  const settled = await page.evaluate(pageProbe);
  await page.screenshot({ path: path.join(OUT, LABEL + "-02-settled.png") });

  // THE CLEAN FRAME (added after Adam's 2026-07-23 review note: "are you trying to hide the door
  // behind the console"). The overlay panel is anchored top-right, which is exactly where the north
  // portal's jamb/header sit under the fixed production camera — so every packet frame partially
  // occluded the one element with a known deferred defect (RL-1, the unwired door leaf). Whatever the
  // intent, evidence framed that way is not evidence. Every capture now also banks the settled frame
  // with the panel hidden, so the door is always fully visible in the record. Hidden via style only —
  // the panel is not unmounted, so nothing about the scene or the render path changes between
  // -02-settled and -04-clean.
  await page.evaluate(() => {
    const p = document.getElementById("clay-room-overlay");
    if (p) p.style.display = "none";
    const ids = [
      "clay-room-workbench-topbar",
      "clay-room-workbench-catalog",
      "clay-room-workbench-scene",
      "clay-room-workbench-viewport"
    ];
    window.__clayCaptureChromeStyles = {};
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) window.__clayCaptureChromeStyles[id] = el.getAttribute("style") || "";
    });
    ["clay-room-workbench-topbar", "clay-room-workbench-catalog", "clay-room-workbench-scene"]
      .forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });
    const viewport = document.getElementById("clay-room-workbench-viewport");
    if (viewport) {
      viewport.style.left = "0";
      viewport.style.right = "0";
      viewport.style.top = "0";
      viewport.style.bottom = "0";
    }
    window.dispatchEvent(new Event("resize"));
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, LABEL + "-04-clean-no-overlay.png") });
  await page.evaluate(() => {
    const p = document.getElementById("clay-room-overlay");
    if (p) p.style.display = "";
    Object.entries(window.__clayCaptureChromeStyles || {}).forEach(([id, style]) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute("style", style);
    });
    window.__clayCaptureChromeStyles = null;
    window.dispatchEvent(new Event("resize"));
  });
  await new Promise((r) => setTimeout(r, 200));

  // Overlay tabs, for the human-readable half of the packet.
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Explain");
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, LABEL + "-03-explain.png") });

  const receipt = {
    label: LABEL,
    requestedLightRecipeId: LIGHT_RECIPE_ID || "clay-opposing-pair",
    requestedMaterialMode: MATERIAL_MODE || null,
    requestedTrimMode: TRIM_MODE || null,
    captureTab: LIGHT_RECIPE_ID ? "Lights (movement overlays cleared)" : "default workbench tab",
    capturedBy: "dev/capture-clayroom-fixture.cjs",
    url,
    runtimePath: "authored JSON lock -> compiled light registry -> clayRoomBoardFrom() -> spatializePlan -> interiorBuildBoard -> setInteriorBoard (production interior channel)",
    viewport: VIEWPORT,
    regions: REGIONS,
    timeline: { early, settled },
    // The one comparison that answers CL-R0's primary question without a human looking.
    settleDelta: {
      texturedSurfaceCountEarly: early.texturedSurfaceCount,
      texturedSurfaceCountSettled: settled.texturedSurfaceCount,
      boardBuildsEarly: early.stats && early.stats.boardBuilds,
      boardBuildsSettled: settled.stats && settled.stats.boardBuilds,
      surfacesChanged: JSON.stringify(early.surfaces) !== JSON.stringify(settled.surfaces),
    },
    consoleErrors,
    consoleWarnings,
    warningVerdict: consoleWarnings.length === 0 ? "PASS" : "REVIEW",
  };
  fs.writeFileSync(path.join(OUT, LABEL + "-receipt.json"), JSON.stringify(receipt, null, 2));
  await browser.close();
  console.log("CAPTURE_DONE", LABEL,
    "texturedSurfaces early=" + early.texturedSurfaceCount + " settled=" + settled.texturedSurfaceCount,
    "boardBuilds=" + (settled.stats && settled.stats.boardBuilds),
    "consoleErrors=" + consoleErrors.length);
  process.exit(0);
})().catch((e) => { console.error("CAPTURE_FAILED", e.message); process.exit(1); });
