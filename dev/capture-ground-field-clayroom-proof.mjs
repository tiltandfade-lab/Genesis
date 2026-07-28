#!/usr/bin/env node
/* Captures Assetforge ground-field output through the actual governed Clayroom:
   genesis.html?clayroom=1 -> clayRoomBoardFrom -> interiorBuildBoard -> setInteriorBoard.
   CL-F06 intentionally carries no legacy battlefield units, sprites, dressing cards, or fallback
   models. The visible forms are the current Clayroom's production interior floor/wall channel plus
   the shared compiled ground-field surface. */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const outDir = path.join(
  here, "model-qa", "assetforge-real", "runs", "ground-field", "clayroom-proof"
);
fs.mkdirSync(outDir, { recursive: true });
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ports = [5291, 5292, 5293, 5294];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function portInUse(port){
  return new Promise((resolve) => {
    const socket = net.connect({host:"127.0.0.1",port}, () => { socket.destroy(); resolve(true); });
    socket.on("error", () => resolve(false));
    socket.setTimeout(500, () => { socket.destroy(); resolve(false); });
  });
}

async function probe(port){
  try{
    const response = await fetch(`http://127.0.0.1:${port}/genesis.html`);
    return response.ok && (await response.text()).includes("Genesis");
  }catch(error){ return false; }
}

async function server(){
  for(const port of ports){
    if(await portInUse(port)){
      if(await probe(port)) return {base:`http://127.0.0.1:${port}`,process:null};
      continue;
    }
    const process = spawn(
      "python3",
      ["-m","http.server",String(port),"--bind","127.0.0.1"],
      {cwd:repoRoot,stdio:["ignore","ignore","ignore"]}
    );
    for(let attempt=0;attempt<40;attempt++){
      await sleep(150);
      if(await probe(port)) return {base:`http://127.0.0.1:${port}`,process};
    }
    process.kill("SIGTERM");
  }
  throw new Error("no Clayroom proof server port available");
}

function instrumentation(page){
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const httpErrors = [];
  page.on("console", (message) => {
    if(message.type() === "error"){
      consoleErrors.push({text:message.text(),url:message.location()?.url || null});
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    failedRequests.push({url:request.url(),error:request.failure()?.errorText || "unknown"});
  });
  page.on("response", (response) => {
    if(response.status() >= 400 && !response.url().endsWith("/favicon.ico")){
      httpErrors.push({url:response.url(),status:response.status()});
    }
  });
  return {consoleErrors,pageErrors,failedRequests,httpErrors};
}

async function waitForGroundField(page, mode){
  await page.waitForFunction(
    (expected) => {
      const T = window.Theater;
      const report = T && T.stats && T.stats.groundField;
      return document.querySelectorAll("#clay-room-host canvas").length === 1
        && document.getElementById("clay-room-workbench-viewport")
        && report && report.fixtureId === "cl-f06-ground-field"
        && report.renderChannel === "interior3d"
        && report.comparisonMode === expected
        && report.albedoReady && report.roughnessReady
        && (expected === "repeated-control" || (report.normalReady && report.ormReady));
    },
    {timeout:30000},
    mode
  );
  await sleep(700);
}

async function prepareCleanViewport(page){
  await page.evaluate(() => {
    const overlay = document.getElementById("clay-room-overlay");
    if(overlay) overlay.style.display = "none";
    ["clay-room-workbench-topbar","clay-room-workbench-catalog","clay-room-workbench-scene"]
      .forEach((id) => {
        const element = document.getElementById(id);
        if(element) element.style.display = "none";
      });
    // The compiled PBR path naturally triggers several asynchronous rebuilds; the single-map
    // repeated control does not. Exercise the same governed resize lifecycle once so both pages
    // settle their composer to the current workbench viewport before the A/B is captured.
    window.dispatchEvent(new Event("resize"));
  });
  await sleep(700);
}

async function probePage(page){
  return page.evaluate(() => {
    const T = window.Theater;
    const canvas = document.querySelector("#clay-room-host canvas");
    const census = T._claySurfaceCensusForTest ? T._claySurfaceCensusForTest() : null;
    return {
      url: location.pathname + location.search,
      groundField: JSON.parse(JSON.stringify(T.stats.groundField)),
      clayroom: {
        hostCanvasCount: document.querySelectorAll("#clay-room-host canvas").length,
        viewportPresent: !!document.getElementById("clay-room-workbench-viewport"),
        overlayPresent: !!document.getElementById("clay-room-overlay"),
        perspectiveCamera: T.cameraIsPerspective(),
        shadowMap: T.shadowMapEnabled(),
        piecesRequested: T.interiorPiecesRequested(),
        piecesResolved: T.interiorPiecesResolved(),
        surfaceCensus: census ? {
          unclaimedCount: census.unclaimed.length,
          texturedClayCount: census.texturedClayCount,
          groundRows: census.surfaces.filter((row) => row.role === "ground-field-proof")
        } : null
      },
      renderer: {
        cssPx: canvas ? canvas.clientWidth + "x" + canvas.clientHeight : null,
        backingPx: canvas ? canvas.width + "x" + canvas.height : null
      },
      stats: {
        boardBuilds: T.stats.boardBuilds,
        boardSkips: T.stats.boardSkips,
        modelPaths: JSON.parse(JSON.stringify(T.stats.modelPaths))
      }
    };
  });
}

async function captureMode(browser, base, mode, fileName, rotate){
  const page = await browser.newPage();
  const errors = instrumentation(page);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if(new URL(request.url()).pathname === "/favicon.ico") request.respond({status:204});
    else request.continue();
  });
  const queryMode = mode === "repeated-control" ? "control" : "compiled";
  const url = `${base}/genesis.html?clayroom=1&clayfixture=ground-field&groundfield=${queryMode}`;
  try{
    await page.goto(url, {waitUntil:"load",timeout:60000});
    await waitForGroundField(page,mode);
    await prepareCleanViewport(page);
    if(rotate){
      await page.evaluate(() => window.Theater.rotate());
      await sleep(700);
    }
    const canvas = await page.$("#clay-room-host canvas");
    if(!canvas) throw new Error("Clayroom renderer canvas disappeared");
    await canvas.screenshot({path:path.join(outDir,fileName)});
    return {report:await probePage(page),errors};
  }finally{
    await page.close();
  }
}

const liveServer = await server();
const browser = await puppeteer.launch({
  executablePath:chrome,
  headless:"new",
  // Match the retina-density material-test captures while keeping the governed Clayroom layout and
  // camera untouched. UI is DOM and stays outside the captured production renderer canvas.
  defaultViewport:{width:1600,height:1000,deviceScaleFactor:2},
  args:["--headless=new","--no-sandbox","--disable-gpu-sandbox","--use-gl=angle","--enable-webgl","--ignore-gpu-blocklist","--hide-scrollbars"]
});

try{
  const compiled = await captureMode(
    browser,liveServer.base,"compiled","clayroom-compiled-default.png",false
  );
  const repeated = await captureMode(
    browser,liveServer.base,"repeated-control","clayroom-repeated-control.png",false
  );
  const rotated = await captureMode(
    browser,liveServer.base,"compiled","clayroom-compiled-rotated.png",true
  );
  const errorSets = [compiled.errors,repeated.errors,rotated.errors];
  const allErrors = {
    consoleErrors:errorSets.flatMap((entry) => entry.consoleErrors),
    pageErrors:errorSets.flatMap((entry) => entry.pageErrors),
    failedRequests:errorSets.flatMap((entry) => entry.failedRequests),
    httpErrors:errorSets.flatMap((entry) => entry.httpErrors)
  };
  const knownClayroomAssetDebt = allErrors.httpErrors.filter((entry) => (
    entry.url.includes("/dev/material-lane/exports/b06-trim-packed-v001/")
  ));
  const unexpectedHttpErrors = allErrors.httpErrors.filter((entry) => (
    !entry.url.includes("/dev/material-lane/exports/b06-trim-packed-v001/")
  ));
  const unexpectedConsoleErrors = allErrors.consoleErrors.filter((entry) => (
    !String(entry.text).startsWith("Failed to load resource:")
  ));
  const groundRows = compiled.report.clayroom.surfaceCensus?.groundRows || [];
  const modelCounts = compiled.report.stats.modelPaths || {};
  const modelTotal = Object.entries(modelCounts)
    .filter(([key,value]) => key !== "misses" && typeof value === "number")
    .reduce((sum,[,value]) => sum + value,0);
  const gates = {
    actualGovernedClayroomRoute:
      compiled.report.url.includes("genesis.html?clayroom=1")
      && compiled.report.clayroom.hostCanvasCount === 1
      && compiled.report.clayroom.viewportPresent
      && compiled.report.clayroom.overlayPresent,
    productionInteriorRealizer:
      compiled.report.groundField.renderChannel === "interior3d"
      && compiled.report.clayroom.perspectiveCamera === true,
    clF06FixtureMounted: compiled.report.groundField.fixtureId === "cl-f06-ground-field",
    compiledPbrChannelsLoaded:
      compiled.report.groundField.albedoReady
      && compiled.report.groundField.normalReady
      && compiled.report.groundField.ormReady
      && compiled.report.groundField.roughnessReady,
    standardLitShadowReceivingSurface:
      compiled.report.groundField.materialType === "MeshStandardMaterial"
      && compiled.report.groundField.receivesShadow
      && compiled.report.clayroom.shadowMap,
    fullFifteenByFifteenField:
      compiled.report.groundField.width === 15 && compiled.report.groundField.depth === 15,
    compilerSurfaceSurvivesClayRouting:
      groundRows.length === 1 && groundRows[0].route === "passthrough",
    noLegacyBattlefieldCast:
      compiled.report.clayroom.piecesRequested === 0
      && compiled.report.clayroom.piecesResolved === 0
      && modelTotal === 0,
    repeatedNegativeControlRendered:
      repeated.report.groundField.comparisonMode === "repeated-control"
      && repeated.report.groundField.albedoReady,
    alternateClayroomCameraRendered:
      rotated.report.groundField.comparisonMode === "compiled"
      && rotated.report.groundField.albedoReady,
    wideAngleMaterialSampling:
      compiled.report.groundField.generatedMipmaps === true
      && compiled.report.groundField.anisotropy >= 1
      && compiled.report.groundField.materialChannels.albedo
      && compiled.report.groundField.materialChannels.normal
      && compiled.report.groundField.materialChannels.ao
      && compiled.report.groundField.materialChannels.roughness,
    noUnexpectedConsoleOrPageErrors:
      unexpectedConsoleErrors.length === 0 && allErrors.pageErrors.length === 0,
    noFailedRequests: allErrors.failedRequests.length === 0,
    noUnexpectedHttpErrors: unexpectedHttpErrors.length === 0
  };
  const receipt = {
    schemaVersion:1,
    proof:"assetforge-ground-field-governed-clayroom-pbr-v2",
    technicalStatus:Object.values(gates).every(Boolean) ? "PASS" : "FAIL",
    runtimePath:"genesis.html?clayroom=1&clayfixture=ground-field -> clayRoomBoardFrom -> interiorBuildBoard -> setInteriorBoard -> shared ground-field mount",
    gates,
    captures:{
      compiledDefault:"dev/model-qa/assetforge-real/runs/ground-field/clayroom-proof/clayroom-compiled-default.png",
      repeatedControl:"dev/model-qa/assetforge-real/runs/ground-field/clayroom-proof/clayroom-repeated-control.png",
      compiledRotated:"dev/model-qa/assetforge-real/runs/ground-field/clayroom-proof/clayroom-compiled-rotated.png"
    },
    compiledReport:compiled.report,
    repeatedReport:repeated.report,
    rotatedReport:rotated.report,
    errors:{
      unexpectedConsoleErrors,
      pageErrors:allErrors.pageErrors,
      failedRequests:allErrors.failedRequests,
      unexpectedHttpErrors,
      knownClayroomAssetDebt
    },
    claimBoundary:"Governed Clayroom technical proof. The candidate field still requires founder visual admission."
  };
  fs.writeFileSync(
    path.join(outDir,"clayroom-proof-receipt.json"),
    JSON.stringify(receipt,null,2) + "\n"
  );
  console.log(JSON.stringify(receipt,null,2));
  if(receipt.technicalStatus !== "PASS") process.exitCode = 1;
}finally{
  await Promise.race([browser.close(),sleep(5000)]);
  const browserProcess = browser.process();
  if(browserProcess && browserProcess.exitCode == null) browserProcess.kill("SIGTERM");
  if(liveServer.process) liveServer.process.kill("SIGTERM");
}
