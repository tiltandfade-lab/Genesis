/* CL-R2 / CL-F03 complete sprite-citizenship comparison capture.

   Captures the real Clayroom production lineup at preferred presentation and canonical-check scale, proves
   the selected standee face/edge shell and one-tread support on the production staircase, walks
   the five accepted lighting contexts, and banks a machine-readable receipt plus contact sheet.

   Usage (server must already serve this worktree):
     node dev/capture-clay-sprite-citizenship.cjs <outDir> [port]
*/
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "4173";
if (!OUT) {
  console.error("usage: node dev/capture-clay-sprite-citizenship.cjs <outDir> [port]");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

// The Clay capture law's real gameplay scale. The comparison sheet may scale these images for
// reading, but every source frame and its receipt stay directly comparable at 1280x720 @ dpr2.
const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const PAGE_URL = "http://127.0.0.1:" + PORT
  + "/genesis.html?clayroom=1&clayfixture=sprite-citizenship";
const CONTEXTS = [
  ["clay-neutral-truth", "04-neutral-production.png", "Neutral truth"],
  ["moonlit", "05-dark-production.png", "Dark / moon"],
  ["torchlit", "06-warm-production.png", "Warm / fire"],
  ["magic-glow", "07-cool-production.png", "Cool / magic"],
  ["daylit", "08-day-production.png", "Full daylight"],
];

function pageProbe() {
  const T = window.Theater || {};
  const record = typeof clayRoomRecordFrom === "function" ? clayRoomRecordFrom(0x6c0ffee) : null;
  const canvas = document.querySelector("canvas");
  const citizenship = T._claySpriteCitizenshipForTest ? T._claySpriteCitizenshipForTest() : null;
  return {
    fixture: {
      id: citizenship && citizenship.fixtureId,
      version: citizenship && citizenship.fixtureVersion,
      seed: record && record.seed,
      seedHex: record && record.seed != null ? "0x" + Number(record.seed).toString(16) : null,
      roomRecordId: record && record.id,
    },
    citizenship,
    surfaceRecipe: typeof CLAY_DIAGNOSTIC_SURFACE_RECIPE !== "undefined"
      ? JSON.parse(JSON.stringify(CLAY_DIAGNOSTIC_SURFACE_RECIPE))
      : null,
    camera: T._clayCameraPoseForTest ? T._clayCameraPoseForTest() : null,
    renderer: {
      backingPx: canvas ? canvas.width + "x" + canvas.height : null,
      cssPx: canvas ? canvas.clientWidth + "x" + canvas.clientHeight : null,
      canvasCount: document.querySelectorAll("canvas").length,
      shadowMap: T.shadowMapEnabled ? T.shadowMapEnabled() : null,
      cameraIsPerspective: T.cameraIsPerspective ? T.cameraIsPerspective() : null,
    },
    lightRecipe: T._clayLightingRecipeForTest ? T._clayLightingRecipeForTest() : null,
    lightingProof: T._clayLightingProofForTest ? T._clayLightingProofForTest() : null,
    effectiveLights: T._interiorSceneLightsForTest ? T._interiorSceneLightsForTest() : null,
    surfaceCensus: T._claySurfaceCensusForTest ? T._claySurfaceCensusForTest() : null,
    provenanceAudit: T._clayProvenanceAuditForTest ? T._clayProvenanceAuditForTest() : null,
    stats: T.stats ? { boardBuilds: T.stats.boardBuilds, boardSkips: T.stats.boardSkips } : null,
  };
}

async function clickExact(page, text) {
  const clicked = await page.evaluate((label) => {
    const button = Array.from(document.querySelectorAll("button"))
      .find((candidate) => candidate.textContent.trim() === label);
    if (!button) return false;
    button.click();
    return true;
  }, text);
  if (!clicked) throw new Error("missing button: " + text);
}

async function waitForLineup(page, mode) {
  await page.waitForFunction((expectedMode) => {
    const api = window.Theater && window.Theater._claySpriteCitizenshipForTest;
    const snap = api && api();
    return snap
      && snap.scaleMode === expectedMode
      && snap.lineup.length === 7
      && snap.stairSamples.length === 3
      && snap.lineup.every((row) => row.contentBounds && row.shell);
  }, { timeout: 30000 }, mode);
  await new Promise((resolve) => setTimeout(resolve, 300));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT,
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/favicon.ico") request.respond({ status: 204 });
    else request.continue();
  });
  const consoleErrors = [];
  const consoleWarnings = [];
  const failedResponses = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
    else if (message.type() === "warning" || message.type() === "warn") consoleWarnings.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push({
      status: response.status(),
      path: new URL(response.url()).pathname,
    });
  });

  await page.goto(PAGE_URL, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => (
    window.Theater
    && typeof window.Theater._claySpriteCitizenshipForTest === "function"
    && typeof window.Theater._claySetSpriteScaleModeForTest === "function"
    && document.getElementById("clay-room-workbench-viewport")
  ), { timeout: 30000 });
  await clickExact(page, "Sprites");
  const expanded = await page.$eval("#clay-room-workbench-catalog", (rail) => rail.getAttribute("aria-expanded") !== "false");
  if (expanded) await page.click('[aria-label="Collapse or expand Clayroom catalog"]');

  // The working surface must open in preferred presentation scale without a test seam changing it.
  await waitForLineup(page, "diagnostic-cap");
  const defaultPresentation = await page.evaluate(() => window.Theater._claySpriteCitizenshipForTest());

  await page.evaluate(() => {
    window.Theater._claySetLightingRecipeForTest("clay-neutral-truth");
    window.Theater._claySetSpriteScaleModeForTest("true-scale");
    window.Theater._claySelectSpriteForTest("spr-pc-human-fighter-female");
    window.Theater._claySetSelectedSpriteViewForTest("face");
  });
  // Capture-law timeline: early is taken shortly after mount, then the same fixture is allowed to
  // survive every sprite-texture replay before the settled frame is probed.
  await new Promise((resolve) => setTimeout(resolve, 600));
  const early = await page.evaluate(pageProbe);
  await page.screenshot({ path: path.join(OUT, "00-true-scale-early-live-ui.png"), fullPage: false });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await waitForLineup(page, "true-scale");
  const canonical = await page.evaluate(() => window.Theater._claySpriteCitizenshipForTest());
  const settled = await page.evaluate(pageProbe);
  // The contract contains one row per live texture/material. Bank it exactly once on the settled
  // timeline frame instead of repeating the same large diagnostic in every probe and light recipe.
  settled.renderContract = await page.evaluate(() => (
    window.Theater._spriteCitizenshipRenderContractForTest
      ? window.Theater._spriteCitizenshipRenderContractForTest() : null
  ));
  await page.screenshot({ path: path.join(OUT, "01-true-scale-live-ui.png"), fullPage: false });

  // Selection-neon negative control: move selection once, prove the previous base spill is hidden
  // while exactly one support-shaped neon spill follows the newly selected physical base, then
  // restore the canonical Human Fighter selection before the visual sequence continues.
  await page.evaluate(() => window.Theater._claySelectSpriteForTest("spr-fantasy-flaming-skeleton"));
  await new Promise((resolve) => setTimeout(resolve, 120));
  const selectionHandoff = await page.evaluate(() => window.Theater._claySpriteCitizenshipForTest());
  await page.evaluate(() => window.Theater._claySelectSpriteForTest("spr-pc-human-fighter-female"));
  await new Promise((resolve) => setTimeout(resolve, 120));

  // Deep-inspection proof: drive the real wheel listener to its clamp, bank the resulting governed
  // camera pose, then use the real double-click reset before the comparison captures continue.
  await page.evaluate(() => {
    const host = document.getElementById("clay-room-host");
    for (let i = 0; i < 16; i++) {
      host.dispatchEvent(new WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true }));
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 250));
  const deepZoom = await page.evaluate(() => window.Theater._clayCameraPoseForTest());
  await page.screenshot({ path: path.join(OUT, "09-deep-zoom-live-ui.png"), fullPage: false });
  await page.evaluate(() => {
    document.getElementById("clay-room-host")
      .dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true }));
  });
  await new Promise((resolve) => setTimeout(resolve, 150));

  await page.evaluate(() => window.Theater._claySetSpriteScaleModeForTest("diagnostic-cap"));
  await waitForLineup(page, "diagnostic-cap");
  const capped = await page.evaluate(() => window.Theater._claySpriteCitizenshipForTest());
  await page.screenshot({ path: path.join(OUT, "02-cap-spectrum-live-ui.png"), fullPage: false });

  await page.evaluate(() => {
    window.Theater._claySelectSpriteForTest("spr-pc-human-fighter-female");
    window.Theater._claySetSelectedSpriteViewForTest("edge");
  });
  await page.waitForFunction(() => window.Theater._claySpriteCitizenshipForTest().selectedView === "edge");
  await new Promise((resolve) => setTimeout(resolve, 250));
  await page.screenshot({ path: path.join(OUT, "03-edge-and-stair-live-ui.png"), fullPage: false });
  await page.evaluate(() => window.Theater._claySetSelectedSpriteViewForTest("face"));

  const contextReceipts = [];
  const viewport = await page.$("#clay-room-workbench-viewport");
  if (!viewport) throw new Error("Clayroom viewport disappeared");
  for (const [recipeId, file, label] of CONTEXTS) {
    await page.evaluate((id) => window.Theater._claySetLightingRecipeForTest(id), recipeId);
    if (recipeId === "torchlit") {
      await page.evaluate(() => window.Theater._claySetLightingPreviewSeedForTest("A"));
    }
    await page.waitForFunction((id) => {
      const recipe = window.Theater._clayLightingRecipeForTest();
      return recipe && recipe.id === id;
    }, { timeout: 30000 }, recipeId);
    await new Promise((resolve) => setTimeout(resolve, 350));
    await viewport.screenshot({ path: path.join(OUT, file) });
    const proof = await page.evaluate(() => ({
      recipe: window.Theater._clayLightingRecipeForTest(),
      lighting: window.Theater._clayLightingProofForTest(),
      citizenship: window.Theater._claySpriteCitizenshipForTest(),
    }));
    contextReceipts.push({ recipeId, label, file, proof });
  }

  const expectedFlags = ["spr-fantasy-treant", "spr-fantasy-kraken"];
  if (canonical.lineup.length !== 7 || capped.lineup.length !== 7) {
    throw new Error("expected seven production sprites in both scale modes");
  }
  if (!canonical.stairSamples.every((row) => row.stairFit) || !capped.stairSamples.every((row) => row.stairFit)) {
    throw new Error("one or more production supports does not fit the stair tread");
  }
  if (JSON.stringify(canonical.regenRecommended) !== JSON.stringify(expectedFlags)) {
    throw new Error("unexpected width-regeneration flags: " + JSON.stringify(canonical.regenRecommended));
  }
  if (!canonical.collisionAudit || canonical.collisionAudit.remainingOverlaps !== 0) {
    throw new Error("one or more visible standee supports still overlap: "
      + JSON.stringify(canonical.collisionAudit));
  }
  if (!canonical.lineup.every((row) => row.contactShadow && row.contactShadow.linked)) {
    throw new Error("one or more standee contact shadows lost its live piece link");
  }
  if (!canonical.lineup.every((row) => row.contactShadow
      && row.contactShadow.blendMode === "multiply"
      && row.contactShadow.multiplyIdentityRim)) {
    throw new Error("one or more contact shadows is not using the white-rim multiply contract");
  }
  if (!canonical.lineup.every((row) => row.shadowSilhouette
      && row.shadowSilhouette.planeCasts
      && row.shadowSilhouette.alphaDepth
      && row.shadowSilhouette.alphaDistance
      && !row.shadowSilhouette.shellCasts)) {
    throw new Error("one or more standees can still cast a rectangular card instead of its alpha silhouette: "
      + JSON.stringify(canonical.lineup.map((row) => ({ slug: row.slug, shadow: row.shadowSilhouette }))));
  }
  if (!canonical.cameraFill || !canonical.cameraFill.enabled || canonical.cameraFill.castShadow) {
    throw new Error("sprite-only camera fill is missing, disabled, or casting shadows");
  }
  if (!canonical.environmentFormFill
      || canonical.environmentFormFill.castShadow
      || canonical.environmentFormFill.intensity < canonical.environmentFormFill.diagnosticFloor) {
    throw new Error("shadow-form hemisphere floor is missing, too dim, or casting shadows");
  }
  if (!canonical.lineup.some((row) => row.selected && row.selectionBaseRingGlow)) {
    throw new Error("selected standee does not expose its vertical base-ring glow in the live receipt");
  }
  const selectedRow = canonical.lineup.find((row) => row.selected);
  if (!selectedRow || !selectedRow.selectionBaseNeon
      || !selectedRow.selectionBaseNeon.linked
      || !selectedRow.selectionBaseNeon.visible
      || selectedRow.selectionBaseNeon.source !== "emissive-sidewall"
      || selectedRow.selectionBaseNeon.footprintShape !== "support-rounded-strip"
      || !selectedRow.selectionBaseNeon.additive
      || selectedRow.selectionBaseNeon.centerPointLight
      || selectedRow.selectionBaseNeon.castShadow) {
    throw new Error("selected base neon is missing, unlinked, center-lit, or casting shadows: "
      + JSON.stringify(selectedRow && selectedRow.selectionBaseNeon));
  }
  const visibleSelectionNeonsAfterHandoff = selectionHandoff.lineup.filter((row) => (
    row.selectionBaseNeon && row.selectionBaseNeon.visible
  ));
  const clearedHumanNeon = selectionHandoff.lineup.find((row) => row.slug === "spr-pc-human-fighter-female");
  if (visibleSelectionNeonsAfterHandoff.length !== 1
      || visibleSelectionNeonsAfterHandoff[0].slug !== "spr-fantasy-flaming-skeleton"
      || !clearedHumanNeon
      || !clearedHumanNeon.selectionBaseNeon
      || clearedHumanNeon.selectionBaseNeon.visible) {
    throw new Error("selection handoff did not hide the old base spill and move exactly one neon spill: "
      + JSON.stringify(selectionHandoff.lineup.map((row) => ({
        slug: row.slug,
        neon: row.selectionBaseNeon
      }))));
  }
  if (!deepZoom || !deepZoom.clayZoomRange
      || Math.abs(deepZoom.clayZoom - deepZoom.clayZoomRange[0]) > 1e-6) {
    throw new Error("real wheel control did not reach the governed deep-zoom clamp: "
      + JSON.stringify(deepZoom));
  }
  // These two optional trim textures are unrelated to CL-F03 and are absent in the tracked
  // prototype worktree. Chrome reports each 404 only as a generic console resource error, so bind
  // the suppression to the exact response paths and keep every other browser error fatal.
  const tolerated404Paths = new Set([
    "/dev/material-lane/exports/b06-trim-packed-v001/run-a/trim-institutional-h6-v1-basecolor-512-v001.png",
    "/dev/material-lane/exports/b06-trim-packed-v001/run-a/trim-upland-h6-v1-basecolor-512-v001.png",
  ]);
  const unexpectedFailedResponses = failedResponses.filter((row) => (
    row.status !== 404 || !tolerated404Paths.has(row.path)
  ));
  const genericResourceErrors = consoleErrors.filter((message) => (
    message === "Failed to load resource: the server responded with a status of 404 (File not found)"
  ));
  const actionableConsoleErrors = consoleErrors.filter((message) => !genericResourceErrors.includes(message));
  if (unexpectedFailedResponses.length
      || genericResourceErrors.length > failedResponses.length
      || actionableConsoleErrors.length) {
    throw new Error("browser console errors: " + consoleErrors.join(" | ")
      + " failedResponses=" + JSON.stringify(failedResponses));
  }

  const receipt = {
    gate: "CL-R2",
    fixture: "CL-F03",
    capturedBy: "dev/capture-clay-sprite-citizenship.cjs",
    url: PAGE_URL,
    runtimePath: "sprite registry + CL-F03 fixture -> data.pieces -> interiorSpriteBillboard -> buildSpriteBillboardMesh -> setInteriorBoard (production interior channel)",
    viewport: VIEWPORT,
    timeline: { early, settled },
    settleDelta: {
      earlyLineupCount: early.citizenship ? early.citizenship.lineup.length : null,
      settledLineupCount: settled.citizenship ? settled.citizenship.lineup.length : null,
      boardBuildsEarly: early.stats && early.stats.boardBuilds,
      boardBuildsSettled: settled.stats && settled.stats.boardBuilds,
      surfaceCensusChanged: JSON.stringify(early.surfaceCensus) !== JSON.stringify(settled.surfaceCensus),
    },
    canonical,
    preferredPresentation: capped,
    defaultPresentation,
    deepZoom,
    selectionNeonNegativeControl: selectionHandoff,
    lightingContexts: contextReceipts,
    assertions: {
      castCount: canonical.lineup.length,
      stairViewCount: canonical.stairSamples.length,
      everySupportFitsTread: canonical.stairSamples.every((row) => row.stairFit),
      everySpriteHasContentBounds: canonical.lineup.every((row) => !!row.contentBounds),
      everySpriteHasSideShell: canonical.lineup.every((row) => row.shell),
      tacticalFootprintSeparate: canonical.tacticalFootprintSeparate,
      widthRegenerationFlags: canonical.regenRecommended,
      noSupportOverlap: canonical.collisionAudit && canonical.collisionAudit.remainingOverlaps === 0,
      everyContactShadowLinked: canonical.lineup.every((row) => row.contactShadow && row.contactShadow.linked),
      everyContactShadowMultiplies: canonical.lineup.every((row) => row.contactShadow
        && row.contactShadow.blendMode === "multiply"
        && row.contactShadow.multiplyIdentityRim),
      defaultScaleIsPreferredPresentation: defaultPresentation.scaleMode === "diagnostic-cap",
      everyCastShadowUsesSpriteSilhouette: canonical.lineup.every((row) => row.shadowSilhouette
        && row.shadowSilhouette.planeCasts
        && row.shadowSilhouette.alphaDepth
        && row.shadowSilhouette.alphaDistance
        && row.shadowSilhouette.shellCasts === false),
      selectedBaseRingGlow: canonical.lineup.some((row) => row.selected && row.selectionBaseRingGlow),
      selectedBaseNeonEmitsFromSidewall: selectedRow
        && selectedRow.selectionBaseNeon
        && selectedRow.selectionBaseNeon.linked
        && selectedRow.selectionBaseNeon.visible
        && selectedRow.selectionBaseNeon.source === "emissive-sidewall"
        && selectedRow.selectionBaseNeon.footprintShape === "support-rounded-strip"
        && selectedRow.selectionBaseNeon.additive
        && selectedRow.selectionBaseNeon.centerPointLight === false
        && selectedRow.selectionBaseNeon.castShadow === false,
      selectionNeonHandoffExclusive: visibleSelectionNeonsAfterHandoff.length === 1
        && visibleSelectionNeonsAfterHandoff[0].slug === "spr-fantasy-flaming-skeleton"
        && clearedHumanNeon
        && clearedHumanNeon.selectionBaseNeon
        && clearedHumanNeon.selectionBaseNeon.visible === false,
      spriteCameraFillShadowless: canonical.cameraFill
        && canonical.cameraFill.enabled
        && canonical.cameraFill.castShadow === false,
      shadowFormFloorActive: canonical.environmentFormFill
        && canonical.environmentFormFill.castShadow === false
        && canonical.environmentFormFill.intensity >= canonical.environmentFormFill.diagnosticFloor,
      deepZoomReachedClamp: deepZoom
        && deepZoom.clayZoomRange
        && Math.abs(deepZoom.clayZoom - deepZoom.clayZoomRange[0]) < 1e-6,
      rendererUsesCitizenshipV2: settled.renderContract
        && settled.renderContract.recipe === "lit-standee-v2",
      rendererUsesPerceptualReadabilityFloor: settled.renderContract
        && settled.renderContract.readabilityFloor === 0.12
        && settled.renderContract.realmTintStrength === 0.15,
      everyLoadedSpriteUsesMipmappedMinification: settled.renderContract
        && settled.renderContract.textures.length >= 7
        && settled.renderContract.textures.every((row) => row.generateMipmaps),
      everyStandeeUsesAlphaToCoverage: settled.renderContract
        && settled.renderContract.materials.length >= 7
        && settled.renderContract.materials.every((row) => row.alphaToCoverage),
    },
    consoleErrors,
    failedResponses,
    toleratedMissingPrototypeTrimTextures: failedResponses.filter((row) => tolerated404Paths.has(row.path)),
    consoleWarnings,
    warningVerdict: consoleWarnings.every((message) => (
      message.includes("qa: sprite-oversize")
      || message.includes("qa: oversize-clamped")
      || message.includes("WebGL")
    )) ? "EXPECTED_WIDTH_STRESS_ONLY" : "REVIEW",
  };
  fs.writeFileSync(path.join(OUT, "cl-r2-sprite-citizenship-receipt.json"), JSON.stringify(receipt, null, 2));

  const cards = [
    ["00-true-scale-early-live-ui.png", "Early mount", "Capture-law frame before the five-second async-settle window."],
    ["01-true-scale-live-ui.png", "Canonical true scale", "Honest 0.25–60 ft spectrum; the kraken dominates by design."],
    ["09-deep-zoom-live-ui.png", "Deep inspection zoom", "Real wheel control at the governed 8.3× closer clamp; bearing and pitch remain fixed."],
    ["02-cap-spectrum-live-ui.png", "Preferred 1–30 ft presentation", "Working scale; authored world heights and tactical footprints stay untouched."],
    ["03-edge-and-stair-live-ui.png", "Edge + stair proof", "Thin shell remains visible; Medium support depth equals one tread."],
    ...CONTEXTS.map((row) => [row[1], row[2], row[0]]),
  ];
  const htmlCards = cards.map(([file, title, note]) => (
    "<article><h2>" + title + "</h2><p>" + note + "</p>"
    + "<img src='data:image/png;base64," + fs.readFileSync(path.join(OUT, file)).toString("base64") + "'></article>"
  )).join("");
  await page.setViewport({ width: 1800, height: 1000, deviceScaleFactor: 1 });
  await page.setContent(
    "<!doctype html><style>"
      + "*{box-sizing:border-box}body{margin:0;padding:28px;background:#11151a;color:#e7edf4;font-family:ui-monospace,monospace}"
      + "header{margin-bottom:22px}h1{margin:0 0 6px;color:#9fd4ec;font-size:28px}header p{margin:0;color:#9aa8b6}"
      + "main{display:grid;grid-template-columns:1fr 1fr;gap:20px}article{background:#181e25;border:1px solid #394654;padding:14px}"
      + "h2{font-size:17px;margin:0 0 4px;color:#dce9f3}p{font-size:12px;color:#9aa8b6;margin:0 0 10px}"
      + "img{display:block;width:100%;height:auto;background:#090c10;border:1px solid #2c3742}"
      + "article:nth-child(n+4) img{aspect-ratio:1.7;object-fit:cover}footer{margin-top:20px;color:#94a3b2;font-size:13px}"
      + "</style><header><h1>CL-R2 · Sprite citizenship</h1>"
      + "<p>One production renderer · seven authored sprites · alpha-silhouette cast shadows · preferred presentation scale</p></header>"
      + "<main>" + htmlCards + "</main><footer>WIDTH FLAGS · Treant + Kraken → regenerate taller / more upright before final admission</footer>",
    { waitUntil: "load" }
  );
  await page.screenshot({ path: path.join(OUT, "cl-r2-sprite-citizenship-sheet.png"), fullPage: true });
  await browser.close();

  console.log(
    "CAPTURE_DONE",
    "cast=" + canonical.lineup.length,
    "stairs=" + canonical.stairSamples.length,
    "contexts=" + contextReceipts.length,
    "errors=" + consoleErrors.length,
    "warnings=" + consoleWarnings.length
  );
})().catch((error) => {
  console.error("CAPTURE_FAILED", error.stack || error.message);
  process.exit(1);
});
