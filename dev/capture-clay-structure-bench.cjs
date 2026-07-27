/* CL-R3 / CL-F01 structure-bench capture.

   Uses the live production Theater, not a screenshot mock. Captures the assembled daylight hero,
   socket/access overlays, the visibly rejected wrong-axis join, a role-id ownership view, and a
   moonlight stress frame. Banks a machine-readable receipt and a composed review sheet.

   Usage (server must already serve this worktree):
     node dev/capture-clay-structure-bench.cjs <outDir> [port]
*/
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "4173";
if (!OUT) {
  console.error("usage: node dev/capture-clay-structure-bench.cjs <outDir> [port]");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const BASE = "http://127.0.0.1:" + PORT + "/genesis.html?clayroom=1&clayfixture=structure-bench";

async function waitForBench(page) {
  await page.waitForFunction(() => {
    const T = window.Theater;
    const snap = T && T._clayStructureBenchForTest && T._clayStructureBenchForTest();
    return snap && snap.mounted && snap.fixtureId === "cl-f01-structure-bench"
      && snap.mountedMeshes >= 20 && snap.shell.apertures === 1;
  }, { timeout: 30000 });
}

async function clickExact(page, label) {
  const ok = await page.evaluate((text) => {
    const button = Array.from(document.querySelectorAll("button"))
      .find((candidate) => candidate.textContent.trim() === text);
    if (!button) return false;
    button.click();
    return true;
  }, label);
  if (!ok) throw new Error("missing button: " + label);
}
async function selectStructurePiece(page, id) {
  const ok = await page.evaluate((value) => {
    const select = document.querySelector('[aria-label="Choose Clayroom structure focus piece"]');
    if (!select) return false;
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return select.value === value;
  }, id);
  if (!ok) throw new Error("missing structure focus piece: " + id);
}
async function focusStructurePiece(page, id, zoom) {
  const focus = () => page.evaluate((args) => (
    window.Theater._clayFocusStructureSpecForTest(args.id, args.zoom)
  ), { id, zoom });
  if (!await focus()) throw new Error("could not focus structure piece: " + id);
  await new Promise((resolve) => setTimeout(resolve, 350));
  // A fixture/view transition may still be settling its governed camera tween. Reassert the exact
  // same governed focus once after that boundary so the capture cannot bank a stale fit frame.
  if (!await focus()) throw new Error("could not retain structure focus: " + id);
  await new Promise((resolve) => setTimeout(resolve, 350));
}
async function cropViewport(page, viewport, file, rect) {
  const box = await viewport.boundingBox();
  if (!box) throw new Error("viewport has no capture bounds");
  await page.screenshot({
    path: file,
    clip: {
      x: box.x + rect.x,
      y: box.y + rect.y,
      width: rect.width,
      height: rect.height
    }
  });
}

async function probe(page) {
  return page.evaluate(() => {
    const T = window.Theater;
    const canvas = document.querySelector("canvas");
    return {
      structure: T._clayStructureBenchForTest(),
      productionOcclusion: {
        pillars: T._interiorPillarListForTest(),
        pillarGhosts: T._interiorPillarGhostListForTest(),
        pieces: T.interiorPiecesWorldPositions()
      },
      surfaceCensus: T._claySurfaceCensusForTest(),
      grid: T._clayTraversabilityGridForTest(),
      camera: T._clayCameraPoseForTest(),
      lightRecipe: T._clayLightingRecipeForTest(),
      mood: T._clayMoodLayerForTest(),
      lighting: T._clayLightingProofForTest(),
      provenance: T._clayProvenanceAuditForTest(),
      renderer: {
        cssPx: canvas ? canvas.clientWidth + "x" + canvas.clientHeight : null,
        backingPx: canvas ? canvas.width + "x" + canvas.height : null,
        canvasCount: document.querySelectorAll("canvas").length,
        hostCanvasCount: document.querySelectorAll("#clay-room-host canvas").length,
        shadowMap: T.shadowMapEnabled(),
        perspective: T.cameraIsPerspective()
      }
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/favicon.ico") request.respond({ status: 204 });
    else request.continue();
  });
  const consoleErrors = [];
  const consoleWarnings = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
    else if (message.type() === "warning" || message.type() === "warn") consoleWarnings.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto(BASE, { waitUntil: "load", timeout: 60000 });
  await waitForBench(page);
  await clickExact(page, "Structure");
  await new Promise((resolve) => setTimeout(resolve, 500));
  const early = await probe(page);
  await page.screenshot({ path: path.join(OUT, "00-early-live-ui.png"), fullPage: false });

  await new Promise((resolve) => setTimeout(resolve, 4500));
  await waitForBench(page);
  const railExpanded = await page.$eval("#clay-room-workbench-catalog",
    (rail) => rail.getAttribute("aria-expanded") !== "false");
  if (railExpanded) await page.click('[aria-label="Collapse or expand Clayroom catalog"]');
  await new Promise((resolve) => setTimeout(resolve, 800));
  await clickExact(page, "ASSEMBLED");
  await new Promise((resolve) => setTimeout(resolve, 250));
  const settled = await probe(page);
  await page.screenshot({ path: path.join(OUT, "01-assembled-live-ui.png"), fullPage: false });
  const viewport = await page.$("#clay-room-workbench-viewport");
  if (!viewport) throw new Error("Clayroom viewport disappeared");
  await viewport.screenshot({ path: path.join(OUT, "02-assembled-daylight-viewport.png") });
  await viewport.screenshot({ path: path.join(OUT, "02b-second-storey-stair-proof-viewport.png") });
  await cropViewport(page, viewport, path.join(OUT, "02c-second-storey-stair-proof-close.png"),
    { x: 330, y: 220, width: 350, height: 310 });

  // Storey proof view: the straight family consumes two adjacent 5×5 cells; the turned family
  // consumes lower flight + landing + upper flight. Park the real human standee on the middle tread
  // and bank the geometry-derived support margins/base-bottom clearance.
  await clickExact(page, "STAIRS");
  await page.waitForFunction(() => window.Theater._clayStructureBenchForTest().view === "stairs");
  await page.evaluate(() => window.Theater._clayFocusStructureProofForTest("straight-storey", 0.34));
  await new Promise((resolve) => setTimeout(resolve, 350));
  await viewport.screenshot({ path: path.join(OUT, "02d-straight-two-cell-storey-proof.png") });
  const stairParking = await page.evaluate(() => (
    window.Theater._clayParkStructureStepForTest("assembly-story-lower-stair", 1, false)
  ));
  if (!stairParking.ok || !stairParking.balanced || !stairParking.baseBottomOnSurface) {
    throw new Error("standee stair parking failed: " + JSON.stringify(stairParking));
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
  const stairParkingProbe = await probe(page);
  await viewport.screenshot({ path: path.join(OUT, "02e-standee-balanced-on-stair.png") });
  await page.evaluate(() => window.Theater._clayResetStructureClimbForTest());
  await page.evaluate(() => window.Theater._clayFocusStructureProofForTest("l-storey", 0.34));
  await new Promise((resolve) => setTimeout(resolve, 350));
  await viewport.screenshot({ path: path.join(OUT, "02f-l-storey-three-cell-proof.png") });

  const views = [
    ["SOCKETS", "03-sockets-viewport.png", "sockets"],
    ["ACCESS", "04-access-viewport.png", "access"],
    ["BAD JOIN", "05-wrong-axis-rejected-viewport.png", "negative"],
    ["ALL WALLS", "08-strategic-all-walls-viewport.png", "strategic"]
  ];
  const viewReceipts = [];
  for (const [button, file, expectedView] of views) {
    await clickExact(page, button);
    await page.waitForFunction((view) => (
      window.Theater._clayStructureBenchForTest().view === view
    ), {}, expectedView);
    await new Promise((resolve) => setTimeout(resolve, 180));
    await viewport.screenshot({ path: path.join(OUT, file) });
    viewReceipts.push({ view: expectedView, file, probe: await probe(page) });
  }

  // The traversability overlay follows support truth, not just the base floor. Focus the two
  // non-rectangular specimen surfaces so a round perch and a sloped ramp cannot pass only because
  // their generic access metadata exists.
  await page.evaluate(() => window.Theater._claySetStructureViewForTest("access"));
  await selectStructurePiece(page, "round-support");
  await focusStructurePiece(page, "round-support", 0.42);
  await page.waitForFunction(() => (
    window.Theater._clayTraversabilityGridForTest().roundTops === 1
  ));
  const roundTopGrid = await probe(page);
  await viewport.screenshot({ path: path.join(OUT, "04g-round-column-grid.png") });
  await selectStructurePiece(page, "shallow-ramp");
  await focusStructurePiece(page, "shallow-ramp", 0.42);
  await page.waitForFunction(() => (
    window.Theater._clayTraversabilityGridForTest().rampSurfaces === 1
  ));
  const rampGrid = await probe(page);
  await viewport.screenshot({ path: path.join(OUT, "04h-ramp-grid.png") });

  // Two different corner topologies, captured separately so an outer L-wrap cannot masquerade as
  // the concave nested infill. Then resolve a real open-d20 climb on the square support and wait for
  // the production standee verb to settle on its top surface.
  await clickExact(page, "CLIMB");
  await new Promise((resolve) => setTimeout(resolve, 800));
  await selectStructurePiece(page, "inside-corner-stair");
  await viewport.screenshot({ path: path.join(OUT, "04a-inner-corner-stair-viewport.png") });
  await cropViewport(page, viewport, path.join(OUT, "04a-inner-corner-stair-close.png"),
    { x: 270, y: 350, width: 210, height: 190 });
  await selectStructurePiece(page, "outside-corner-stair");
  await viewport.screenshot({ path: path.join(OUT, "04b-outer-corner-stair-viewport.png") });
  await cropViewport(page, viewport, path.join(OUT, "04b-outer-corner-stair-close.png"),
    { x: 320, y: 380, width: 240, height: 210 });
  await selectStructurePiece(page, "square-support");
  const climbStart = await page.evaluate(() => {
    window.Theater._claySelectStructureClimbTargetForTest("square-support");
    return window.Theater._clayResolveStructureClimbForTest(12, 3);
  });
  if (!climbStart.ok || !climbStart.passed) throw new Error("square-support climb did not start successfully");
  await page.waitForFunction(() => {
    const climb = window.Theater._clayStructureBenchForTest().climb;
    return climb && !climb.busy && climb.phase === "perched"
      && climb.last && climb.last.passed;
  }, { timeout: 10000 });
  const climbSuccess = await probe(page);
  await viewport.screenshot({ path: path.join(OUT, "04c-square-column-climb-success-viewport.png") });
  await cropViewport(page, viewport, path.join(OUT, "04c-square-column-climb-success-close.png"),
    { x: 275, y: 330, width: 230, height: 260 });
  await page.screenshot({ path: path.join(OUT, "04d-square-column-climb-success-ui.png"), fullPage: false });
  await page.evaluate(() => window.Theater._clayResetStructureClimbForTest());

  // Production raycast proof: a literal pointer click on the visible compiled wall must retarget
  // the climb contract before the same open-d20 resolver can place the witness on that wall.
  await viewport.click({ offset: { x: 520, y: 190 } });
  await page.waitForFunction(() => {
    const climb = window.Theater._clayStructureBenchForTest().climb;
    return climb && climb.target && /^compiled-/.test(climb.target.id);
  }, { timeout: 5000 });
  const wallClimbStart = await page.evaluate(() => (
    window.Theater._clayResolveStructureClimbForTest(12, 3)
  ));
  if (!wallClimbStart.ok || !wallClimbStart.passed) throw new Error("clicked-wall climb did not pass");
  await page.waitForFunction(() => {
    const climb = window.Theater._clayStructureBenchForTest().climb;
    return climb && !climb.busy && climb.phase === "perched";
  }, { timeout: 10000 });
  const wallClimbSuccess = await probe(page);
  await viewport.screenshot({ path: path.join(OUT, "04e-clicked-wall-climb-success-viewport.png") });
  await page.evaluate(() => window.Theater._clayResetStructureClimbForTest());

  // Severe miss branch: fail by 3+ returns the witness to the floor, marks Prone, and exposes 1d6.
  await selectStructurePiece(page, "square-support");
  const fallStart = await page.evaluate(() => (
    window.Theater._clayResolveStructureClimbForTest(1, 3)
  ));
  if (!fallStart.ok || !fallStart.fall) throw new Error("square-support fall branch did not start");
  await page.waitForFunction(() => {
    const climb = window.Theater._clayStructureBenchForTest().climb;
    return climb && !climb.busy && climb.phase === "fell";
  }, { timeout: 10000 });
  const climbFall = await probe(page);
  await page.screenshot({ path: path.join(OUT, "04f-square-column-fall-ui.png"), fullPage: false });
  await page.evaluate(() => window.Theater._clayResetStructureClimbForTest());

  // Execute the staged/latch law against the real C1B connection state. Door motion alone never
  // reveals or re-conceals the space; explicit scene staging controls the compile-time uppers.
  await page.evaluate(() => window.Theater._claySetStructureViewForTest("assembled"));
  await page.waitForFunction(() => window.Theater._clayStructureBenchForTest().view === "assembled");
  const stagedBeforeDoor = await probe(page);
  await page.evaluate(() => window.Theater._claySetStructureDoorStateForTest("open"));
  await page.waitForFunction(() => {
    const s = window.Theater._clayStructureBenchForTest();
    return s.wallOmission.doorState === "open" && s.wallOmission.active;
  });
  const stagedDoorOpen = await probe(page);
  await page.evaluate(() => window.Theater._claySetStructureDoorStateForTest("shut"));
  await page.waitForFunction(() => {
    const s = window.Theater._clayStructureBenchForTest();
    return s.wallOmission.doorState === "shut" && s.wallOmission.active;
  });
  const stagedDoorShut = await probe(page);
  await page.evaluate(() => window.Theater._claySetStructureStagedForTest(false));
  await page.waitForFunction(() => {
    const s = window.Theater._clayStructureBenchForTest();
    return !s.wallOmission.staged && !s.wallOmission.active
      && s.shell.omittedUpperSegments === 0;
  });
  await page.evaluate(() => window.Theater._claySetStructureDoorStateForTest("open"));
  await page.waitForFunction(() => {
    const s = window.Theater._clayStructureBenchForTest();
    return s.wallOmission.doorState === "open" && !s.wallOmission.staged
      && !s.wallOmission.active;
  });
  const sealedDoorOpen = await probe(page);
  await viewport.screenshot({ path: path.join(OUT, "09-sealed-open-door-all-walls-viewport.png") });
  await page.evaluate(() => window.Theater._claySetStructureStagedForTest(true));
  await page.waitForFunction(() => {
    const s = window.Theater._clayStructureBenchForTest();
    return s.wallOmission.staged && s.wallOmission.latched && s.wallOmission.active
      && s.shell.omittedUpperSegments > 0;
  });
  const stagedAgain = await probe(page);
  const stagingSequence = {
    stagedBeforeDoor,
    stagedDoorOpen,
    stagedDoorShut,
    sealedDoorOpen,
    stagedAgain
  };

  // Diagnostic role ownership is a fresh mount so material routing is exercised from cold boot.
  await page.goto(BASE + "&claysurface=role-id", { waitUntil: "load", timeout: 60000 });
  await waitForBench(page);
  await page.evaluate(() => window.Theater._claySetStructureViewForTest("assembled"));
  await new Promise((resolve) => setTimeout(resolve, 300));
  const roleId = await probe(page);
  const roleViewport = await page.$("#clay-room-workbench-viewport");
  await roleViewport.screenshot({ path: path.join(OUT, "06-role-id-viewport.png") });

  // Return to neutral clay and use the real production moon recipe as the dark-form stress case.
  await page.goto(BASE, { waitUntil: "load", timeout: 60000 });
  await waitForBench(page);
  await page.evaluate(() => {
    window.Theater._claySetStructureViewForTest("assembled");
    window.Theater._claySetLightingRecipeForTest("moonlit");
  });
  await page.waitForFunction(() => window.Theater._clayLightingRecipeForTest().id === "moonlit");
  await new Promise((resolve) => setTimeout(resolve, 400));
  const moonlit = await probe(page);
  const moonViewport = await page.$("#clay-room-workbench-viewport");
  await moonViewport.screenshot({ path: path.join(OUT, "07-moonlit-viewport.png") });
  const moodExamples = [];
  const moodPairs = [
    { recipeId: "daylit", moodId: "dawn-violet" },
    { recipeId: "moonlit", moodId: "crypt-violet" },
    { recipeId: "torchlit", moodId: "dungeon-cold" },
    { recipeId: "fungal-glow", moodId: "spore-haze" }
  ];
  for (const pair of moodPairs) {
    await page.evaluate((value) => {
      window.Theater._claySetStructureViewForTest("assembled");
      window.Theater._claySetLightingRecipeForTest(value.recipeId);
      window.Theater._claySetMoodLayerForTest(value.moodId);
    }, pair);
    await page.waitForFunction(
      (value) => window.Theater._clayLightingRecipeForTest().id === value.recipeId
        && window.Theater._clayMoodLayerForTest().layerId === value.moodId,
      {},
      pair
    );
    await new Promise((resolve) => setTimeout(resolve, 450));
    const file = "10-mood-" + pair.recipeId + "+" + pair.moodId + ".png";
    await moonViewport.screenshot({ path: path.join(OUT, file) });
    moodExamples.push({
      recipeId: pair.recipeId,
      moodId: pair.moodId,
      file,
      probe: await probe(page)
    });
  }
  await page.evaluate(() => {
    window.Theater._claySetFixtureForTest("cl-f00-room-truth");
    window.Theater._claySetLightingRecipeForTest("daylit");
    window.Theater._claySetMoodLayerForTest("dawn-violet");
  });
  await page.waitForFunction(() => {
    const grid = window.Theater._clayTraversabilityGridForTest();
    const mood = window.Theater._clayMoodLayerForTest();
    return grid && grid.hostFloorCells === 225 && grid.crateTops === 1
      && mood && mood.pairId === "daylit+dawn-violet";
  });
  await page.evaluate(() => window.Theater._claySetMovementOverlayVisibleForTest(false));
  await new Promise((resolve) => setTimeout(resolve, 350));
  const roomTruthGrid = await probe(page);
  const roomTruthViewport = await page.$("#clay-room-workbench-viewport");
  await roomTruthViewport.screenshot({ path: path.join(OUT, "11-room-truth-crate-grid.png") });
  await cropViewport(page, roomTruthViewport, path.join(OUT, "11a-room-truth-crate-grid-close.png"),
    { x: 190, y: 220, width: 300, height: 280 });

  const s = settled.structure;
  const strategic = viewReceipts.find((row) => row.view === "strategic").probe.structure;
  const requiredKinds = [
    "wall-run", "t-junction", "stair", "stair-inner-corner", "stair-outer-corner",
    "ramp", "blocker", "support-square", "support-round"
  ];
  const assertions = {
    fixtureMounted: s.mounted && s.fixtureId === "cl-f01-structure-bench",
    productionRenderer: settled.renderer.hostCanvasCount === 1 && settled.renderer.perspective,
    shadowPipeline: settled.renderer.shadowMap && s.shadowCasters > 0 && s.shadowReceivers > 0,
    shadowContactRegistration: s.shadowContact
      && s.shadowContact.rendererFilter === "pcf"
      && s.shadowContact.frontFaceShadowCasters === s.shadowCasters
      && s.shadowContact.automaticShadowCasters === 0
      && s.shadowContact.directionalLights.some((row) => row.bias === -0.001
        && row.normalBias === 0
        && row.mapSize[0] === 2048
        && row.mapSize[1] === 2048),
    traversabilityGrid: s.traversabilityGrid
      && s.traversabilityGrid.contract === "every-flat-or-traversable-surface"
      && s.traversabilityGrid.hostFloorCells === 225
      && s.traversabilityGrid.shellFloorCells === 32
      && s.traversabilityGrid.stairTreads > 0
      && s.traversabilityGrid.walkableTops > 0
      && s.traversabilityGrid.uniqueSegments > 0,
    roundColumnTopGrid: roundTopGrid.grid && roundTopGrid.grid.roundTops === 1,
    slopedRampGrid: rampGrid.grid && rampGrid.grid.rampSurfaces === 1,
    productionCrateTopGrid: roomTruthGrid.grid
      && roomTruthGrid.grid.hostFloorCells === 225
      && roomTruthGrid.grid.crateTops === 1,
    sourcePlusMoodLayering: moodExamples.every((row) => row.probe.mood
      && row.probe.mood.baseRecipeId === row.recipeId
      && row.probe.mood.layerId === row.moodId
      && row.probe.mood.sourceRetained
      && row.probe.mood.underEnergyCap
      && !row.probe.mood.moodCastsShadow),
    torchBlobSuppressed: moodExamples
      .find((row) => row.recipeId === "torchlit")
      .probe.lighting.snapshot.lights.some((row) => row.id === "torch-key"
        && row.emitterBloomSuppressed),
    surfaceOwnership: settled.surfaceCensus.unclaimed.length === 0
      && settled.surfaceCensus.texturedClayCount === 0,
    compiledShell: s.shell.meta.floorCellCount === 32
      && s.shell.wallSegments > 0
      && s.shell.riserSegments > 0
      && s.shell.apertures === 1
      && s.shell.exposedSlabSides
      && s.shell.polygonKernel === "oss",
    connectiveFoundations: s.connectiveTissue
      && s.connectiveTissue.foundationRuns > 0
      && s.connectiveTissue.foundationCorners > 0
      && s.connectiveTissue.wallJunctions > 0
      && s.connectiveTissue.contactEmbed > 0,
    threeElevationTiers: JSON.stringify(s.shell.tiers) === JSON.stringify([-1, 0, 1]),
    cameraSideOmission: s.cameraSideOmission && s.cameraSideOmission.active
      && s.hostSuppressedMeshes > 0,
    stagedLatch: s.wallOmission.staged && s.wallOmission.latched && s.wallOmission.active
      && s.shell.omittedUpperSegments > 0
      && stagedDoorOpen.structure.wallOmission.active
      && stagedDoorShut.structure.wallOmission.active
      && stagedDoorShut.structure.wallOmission.latched,
    rawDoorDoesNotStage: !sealedDoorOpen.structure.wallOmission.staged
      && !sealedDoorOpen.structure.wallOmission.latched
      && !sealedDoorOpen.structure.wallOmission.active
      && sealedDoorOpen.structure.wallOmission.doorState === "open"
      && sealedDoorOpen.structure.shell.omittedUpperSegments === 0,
    explicitRestagingReenablesOmission: stagedAgain.structure.wallOmission.staged
      && stagedAgain.structure.wallOmission.latched
      && stagedAgain.structure.wallOmission.active
      && stagedAgain.structure.shell.omittedUpperSegments > 0,
    strategicAllWalls: strategic.wallOmission.strategicView
      && strategic.wallOmission.cameraMode === "top-down-strategic"
      && !strategic.wallOmission.active
      && strategic.shell.omittedUpperSegments === 0
      && strategic.shell.builtUpperSegments === strategic.shell.totalUpperSegments,
    omissionCarveouts: s.wallOmission.apertureUpperBuilt
      && s.wallOmission.structuralMassBuilt
      && s.wallOmission.carveouts.aperture
      && s.wallOmission.carveouts.structuralMass
      && s.wallOmission.carveouts.strategicView,
    dynamicCutawayPresent: s.dynamicCutaway && !s.dynamicCutaway.disabledForTest
      && s.dynamicCutaway.candidates > 0
      && s.dynamicCutaway.blocking > 0
      && s.dynamicCutaway.faded > 0
      && settled.productionOcclusion.pillarGhosts.length > 0,
    hingedOpening: s.opening.mounted && s.opening.threshold
      && s.opening.hingeSocket === "hinge"
      && s.opening.swingClearanceDeg === 90
      && s.opening.leafCastsShadow,
    genericKindsPresent: requiredKinds.every((kind) => s.specimens.some((row) => row.kind === kind)),
    adaptiveStairFamily: s.stairAdapter
      && JSON.stringify(s.stairAdapter.examples.map((row) => row.riseFeet).sort((a, b) => a - b)) === JSON.stringify([2, 3, 5, 5])
      && s.stairAdapter.examples.every((row) => row.footprintCells === 1)
      && s.stairAdapter.cornerFamilies.includes("stair-inner-corner")
      && s.stairAdapter.cornerFamilies.includes("stair-outer-corner")
      && s.stairAdapter.cornerTopologies.some((row) => row.topology === "inverse-expanding-l-bands-smallest-low")
      && s.stairAdapter.cornerTopologies.some((row) => row.topology === "open-quadrant-l-wrap-smallest-high"),
    fullStoreyStairProof: s.stairAdapter.fullStoreyProof.connected
      && s.stairAdapter.fullStoreyProof.stairUnits === 2
      && s.stairAdapter.fullStoreyProof.footprintCells === 2
      && s.stairAdapter.fullStoreyProof.riseFeet === 10,
    lStoreyStairProof: s.stairAdapter.lStoreyProof.connected
      && s.stairAdapter.lStoreyProof.footprintCells === 3
      && s.stairAdapter.lStoreyProof.turnDeg === 90
      && s.stairAdapter.lStoreyProof.riseFeet === 10,
    balancedStairParking: stairParkingProbe.structure.parking
      && stairParkingProbe.structure.parking.centered
      && stairParkingProbe.structure.parking.balanced
      && stairParkingProbe.structure.parking.baseBottomOnSurface
      && !stairParkingProbe.structure.parking.clipsTreadEdge,
    standableSupportTops: s.specimens
      .filter((row) => row.kind === "support-square" || row.kind === "support-round")
      .every((row) => row.access.top === "walk" && row.access.shaft === "climb-dc"
        && row.entry && row.entry.topCheck === "balance"),
    socketsAndAccessPresent: s.specimens.every((row) => row.sockets.length >= 2
      && Object.keys(row.access).length >= 2),
    rampWalkable: s.slope.walkable && s.slope.degrees <= s.slope.maxDegrees,
    badJoinRejectedVisibly: !s.negativeControl.accepted
      && s.negativeControl.reason === "socket-axis-mismatch"
      && s.negativeControl.visibleGap,
    clickToClimbImplemented: s.climbMechanicsImplemented === true
      && climbSuccess.structure.climb.phase === "perched"
      && climbSuccess.structure.climb.last.passed
      && climbSuccess.structure.climb.last.d20 === 12
      && climbSuccess.structure.climb.last.total === 15
      && climbSuccess.structure.climb.perchAudit
      && climbSuccess.structure.climb.perchAudit.baseBottomOnSurface,
    literalWallClickClimb: wallClimbSuccess.structure.climb.target
      && /^compiled-/.test(wallClimbSuccess.structure.climb.target.id)
      && wallClimbSuccess.structure.climb.last.passed
      && wallClimbSuccess.structure.climb.phase === "perched",
    climbFallBranch: climbFall.structure.climb.last
      && climbFall.structure.climb.last.outcome === "fell"
      && climbFall.structure.climb.last.prone
      && climbFall.structure.climb.last.damage === "1d6",
    provenanceComplete: s.specimens.every((row) => row.provenance
      && row.provenance.source === "docs/STRUCTURE-KIT-CATALOG.md"),
    roleIdStillOwned: roleId.surfaceCensus.unclaimed.length === 0,
    moonlightStressUsesProductionRecipe: moonlit.lightRecipe.id === "moonlit",
    noBrowserErrors: consoleErrors.length === 0
  };
  const failedAssertions = Object.entries(assertions).filter(([, pass]) => !pass).map(([name]) => name);
  if (failedAssertions.length) throw new Error("failed assertions: " + failedAssertions.join(", ")
    + " · renderer " + JSON.stringify(settled.renderer));
  if (consoleErrors.length) throw new Error("browser console errors: " + consoleErrors.join(" | "));

  const receipt = {
    gate: "CL-R3",
    fixture: "CL-F01",
    capturedBy: "dev/capture-clay-structure-bench.cjs",
    url: BASE,
    runtimePath: "CL-F01 catalog data -> compileRoomShell + generic structure-part assemblers -> production Theater",
    viewport: VIEWPORT,
    timeline: { early, settled },
    views: viewReceipts,
    climbSuccess,
    wallClimbSuccess,
    climbFall,
    stagingSequence,
    roleId,
    moonlit,
    moodExamples,
    roomTruthGrid,
    roundTopGrid,
    rampGrid,
    stairParking,
    stairParkingProbe,
    assertions,
    consoleErrors,
    consoleWarnings
  };
  fs.writeFileSync(path.join(OUT, "cl-r3-structure-bench-receipt.json"), JSON.stringify(receipt, null, 2));

  const cards = [
    ["02-assembled-daylight-viewport.png", "Assembled continuity", "OSS corners, datum foundations, connector blocks, and the U-shaped terrace edge."],
    ["02d-straight-two-cell-storey-proof.png", "Two cells to the second storey", "Two adjacent 5×5 flights rise directly from ground to the occupied +10 ft deck."],
    ["02f-l-storey-three-cell-proof.png", "Three-cell L stair", "Lower flight, turning landing, and perpendicular upper flight reach the occupied +10 ft deck."],
    ["02e-standee-balanced-on-stair.png", "Balanced tread parking", "The real standee base is centered, aligned across the rise, and seated by its bottom face."],
    ["03-sockets-viewport.png", "Focused socket key", "One selected piece shows labelled type and direction; the rest stay quiet."],
    ["04-access-viewport.png", "Standable support top", "The top is walkable; the shaft is a difficult climb and the perch calls for balance."],
    ["04g-round-column-grid.png", "Traversability grid · round perch", "The overlay clips to the circular support top instead of pretending it is a square floor tile."],
    ["04h-ramp-grid.png", "Traversability grid · slope", "The overlay follows the ramp plane and its rise rather than remaining projected on the ground."],
    ["04a-inner-corner-stair-close.png", "Inner corner stair", "The smallest bridge tread is lowest; higher L-bands expand outward through the concave turn."],
    ["04b-outer-corner-stair-close.png", "Outer corner stair", "L-shaped treads wrap a convex corner while preserving the open quadrant."],
    ["04c-square-column-climb-success-close.png", "Square-column climb", "Open d20 12 + Athletics 3 clears DC 15; the human witness is physically perched on top."],
    ["04e-clicked-wall-climb-success-viewport.png", "Literal wall-click climb", "A production viewport click selects the compiled wall; the same open d20 places the witness on it."],
    ["04f-square-column-fall-ui.png", "Climb fall branch", "A severe miss resolves to fall, Prone, and 1d6 in the visible interaction card."],
    ["05-wrong-axis-rejected-viewport.png", "Wrong-axis rejection", "The pieces remain separated and the red X names the failed join."],
    ["06-role-id-viewport.png", "Surface ownership", "Every visible material route remains claimed under diagnostic role colours."],
    ["07-moonlit-viewport.png", "Moonlight stress", "The same production geometry under a lore-native dark recipe."],
    ["08-strategic-all-walls-viewport.png", "Strategic continuity", "Every upper rebuilds over a foundation that reaches the common site datum."],
    ["09-sealed-open-door-all-walls-viewport.png", "Staging latch", "An open door alone does not stage the room; sealed space keeps every upper."],
    ["10-mood-daylit+dawn-violet.png", "Source + mood · violet dawn", "The warm directional sun remains the shadow key beneath a room-wide violet sky wash."],
    ["10-mood-moonlit+crypt-violet.png", "Source + mood · violet crypt", "The moon keeps its direction while a low-energy crypt palette colours the unlit volume."],
    ["10-mood-torchlit+dungeon-cold.png", "Source + mood · cold dungeon", "A localized warm torch survives inside cool room ambience; its old square bloom artifact is gone."],
    ["10-mood-fungal-glow+spore-haze.png", "Source + mood · spore haze", "The physical fungal cluster remains the local source beneath a broader organic room condition."],
    ["11a-room-truth-crate-grid-close.png", "Traversability grid · production crate", "The same overlay follows the real six-sided crate top instead of stopping at the base floor."]
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
      + "footer{margin-top:20px;color:#94a3b2;font-size:13px}</style>"
      + "<header><h1>CL-R3 · Structural continuity correction</h1>"
      + "<p>Closed corners · legible foundations · adaptive stairs · focused access/socket evidence</p></header>"
      + "<main>" + htmlCards + "</main>"
      + "<footer>ADMISSION RESULT · " + Object.keys(assertions).length + " / " + Object.keys(assertions).length
      + " assertions passed · click-to-climb is executable</footer>",
    { waitUntil: "load" }
  );
  await page.screenshot({ path: path.join(OUT, "cl-r3-structure-bench-sheet.png"), fullPage: true });
  await browser.close();
  console.log("CAPTURE_DONE", "meshes=" + s.mountedMeshes, "assertions=" + Object.keys(assertions).length,
    "errors=" + consoleErrors.length, "warnings=" + consoleWarnings.length);
  process.exit(0);
})().catch((error) => {
  console.error("CAPTURE_FAILED", error.stack || error.message);
  process.exit(1);
});
