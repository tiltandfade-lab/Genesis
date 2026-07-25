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
      camera: T._clayCameraPoseForTest(),
      lightRecipe: T._clayLightingRecipeForTest(),
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
  await clickExact(page, "ASSEMBLED");
  await new Promise((resolve) => setTimeout(resolve, 250));
  const settled = await probe(page);
  await page.screenshot({ path: path.join(OUT, "01-assembled-live-ui.png"), fullPage: false });
  const viewport = await page.$("#clay-room-workbench-viewport");
  if (!viewport) throw new Error("Clayroom viewport disappeared");
  await viewport.screenshot({ path: path.join(OUT, "02-assembled-daylight-viewport.png") });

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

  const s = settled.structure;
  const strategic = viewReceipts.find((row) => row.view === "strategic").probe.structure;
  const requiredKinds = ["wall-run", "t-junction", "stair", "ramp", "blocker", "support-square", "support-round"];
  const assertions = {
    fixtureMounted: s.mounted && s.fixtureId === "cl-f01-structure-bench",
    productionRenderer: settled.renderer.hostCanvasCount === 1 && settled.renderer.perspective,
    shadowPipeline: settled.renderer.shadowMap && s.shadowCasters > 0 && s.shadowReceivers > 0,
    surfaceOwnership: settled.surfaceCensus.unclaimed.length === 0
      && settled.surfaceCensus.texturedClayCount === 0,
    compiledShell: s.shell.meta.floorCellCount === 32
      && s.shell.wallSegments > 0
      && s.shell.riserSegments > 0
      && s.shell.apertures === 1
      && s.shell.exposedSlabSides,
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
    socketsAndAccessPresent: s.specimens.every((row) => row.sockets.length >= 2
      && Object.keys(row.access).length >= 2),
    rampWalkable: s.slope.walkable && s.slope.degrees <= s.slope.maxDegrees,
    badJoinRejectedVisibly: !s.negativeControl.accepted
      && s.negativeControl.reason === "socket-axis-mismatch"
      && s.negativeControl.visibleGap,
    noClimbMechanicsClaim: s.climbMechanicsImplemented === false,
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
    stagingSequence,
    roleId,
    moonlit,
    assertions,
    consoleErrors,
    consoleWarnings
  };
  fs.writeFileSync(path.join(OUT, "cl-r3-structure-bench-receipt.json"), JSON.stringify(receipt, null, 2));

  const cards = [
    ["02-assembled-daylight-viewport.png", "Assembled daylight", "Production shell, atoms, shadows, fixed camera."],
    ["03-sockets-viewport.png", "Socket axes", "Cyan strips expose authored mount and join directions."],
    ["04-access-viewport.png", "Access faces", "Walk / climb-cost / climb-dc / none remain data, not invented mechanics."],
    ["05-wrong-axis-rejected-viewport.png", "Wrong-axis rejection", "The pieces remain separated and the red X names the failed join."],
    ["06-role-id-viewport.png", "Surface ownership", "Every visible material route remains claimed under diagnostic role colours."],
    ["07-moonlit-viewport.png", "Moonlight stress", "The same production geometry under a lore-native dark recipe."],
    ["08-strategic-all-walls-viewport.png", "Strategic map mode", "A governed top-down camera rebuilds every wall upper for map reading."],
    ["09-sealed-open-door-all-walls-viewport.png", "Staging latch", "An open door alone does not stage the room; sealed space keeps every upper."]
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
      + "<header><h1>CL-R3 · Structure grammar</h1>"
      + "<p>One production renderer · compiled wall/floor volumes · reusable atoms · typed join failure</p></header>"
      + "<main>" + htmlCards + "</main>"
      + "<footer>ADMISSION RESULT · " + Object.keys(assertions).length + " / " + Object.keys(assertions).length
      + " assertions passed · climb labels remain non-mechanical</footer>",
    { waitUntil: "load" }
  );
  await page.screenshot({ path: path.join(OUT, "cl-r3-structure-bench-sheet.png"), fullPage: true });
  await browser.close();
  console.log("CAPTURE_DONE", "meshes=" + s.mountedMeshes, "assertions=" + Object.keys(assertions).length,
    "errors=" + consoleErrors.length, "warnings=" + consoleWarnings.length);
})().catch((error) => {
  console.error("CAPTURE_FAILED", error.stack || error.message);
  process.exit(1);
});
