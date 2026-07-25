/* CLAYROOM VISUAL-CORRECTION capture rig
   (docs/FABLE-CLAYROOM-VISUAL-CORRECTION-ASSIGNMENT.md, Checkpoint 0 "honest before evidence" —
   and reused unchanged for every later checkpoint's after evidence, so before/after stay
   directly comparable).

   Banks, through the PRODUCTION renderer (genesis.html + the real ?clayroom=1 mount):

   PHASE A — CL-F02 lighting-bench (?clayfixture=lights), per recipe:
     clay-neutral-truth · clay-opposing-pair · daylit · moonlit · magic-glow · torchlit · lavalit
     - a settled full-page frame (layout evidence, panel visible)
     - a settled clean canvas-clip frame with the inspector hidden AND position/range/shadow
       overlays forced OFF (beauty/before evidence per the capture law)
     - a per-recipe probe: the AUTHORED recipe values next to the LIVE mounted THREE light values
       (distance/decay/positions/intensities), fixture emitter world positions, rig/ambient state,
       tone mapping, scene background, camera pose, renderer size/dpr — the readout-parity record.
     - rAF frame-rate sample under torchlit (the continuous flame animation path) and daylit
       (the static path).

   PHASE B — CL-F01 structure-bench (?clayfixture=structure):
     - assembled / sockets / access / negative / strategic view frames (full page + canvas clip)
     - the staged-latch sequence receipts (sealed -> door-open-sealed -> staged -> shut-after-staged)
     - the strategic-mode reporting-parity record (shell upper counts vs cameraSideOmission vs
       wallOmission.active — the "one state, two answers" evidence)
     - a NARROW-VIEWPORT run (760x900) with the panel visible: the inspector-consumes-half layout
       evidence.

   Usage (server must already be serving THIS worktree):
     node dev/capture-clayroom-visual-correction.cjs <outDir> [port]

   Read-only except for the fixtures' own documented test seams and the overlay panel's own UI
   buttons. Never asserts a visual verdict — measurement lives in the receipt, judgement with Adam. */
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "5176";
if (!OUT) { console.error("usage: node dev/capture-clayroom-visual-correction.cjs <outDir> [port]"); process.exit(2); }
const BASE = "http://127.0.0.1:" + PORT;
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };   // the capture-law gameplay scale
const NARROW_VIEWPORT = { width: 760, height: 900, deviceScaleFactor: 2 };

const RECIPES = [
  "clay-neutral-truth", "clay-opposing-pair", "daylit", "moonlit", "magic-glow", "torchlit", "lavalit"
];
const STRUCTURE_VIEWS = ["assembled", "sockets", "access", "negative", "strategic"];

function lightingProbe() {
  const T = window.Theater || {};
  const recipe = T._clayLightingRecipeForTest ? T._clayLightingRecipeForTest() : null;
  const proof = T._clayLightingProofForTest ? T._clayLightingProofForTest() : null;
  const bench = T._clayLightingBenchForTest ? T._clayLightingBenchForTest() : null;
  const canvas = document.querySelector("canvas");
  return {
    authoredRecipe: recipe ? {
      id: recipe.id, mode: recipe.mode, ambient: recipe.ambient, toneMap: recipe.toneMap,
      bloom: recipe.bloom, exposureFloor: recipe.exposureFloor,
      lights: (recipe.lights || []).map((l) => ({
        id: l.id, type: l.type, pos: l.pos, heightM: l.heightM, rangeM: l.rangeM,
        falloff: l.falloff, physicalIntensity: l.physicalIntensity, temperatureK: l.temperatureK,
        mount: l.mount, fixtureId: l.fixtureId, azimuthDeg: l.azimuthDeg, elevationDeg: l.elevationDeg,
        shadowCast: l.shadow && l.shadow.cast, state: l.state,
      })),
    } : null,
    liveMountedLights: proof && proof.snapshot ? {
      ambient: proof.snapshot.ambient,
      rig: proof.snapshot.rig,
      practicals: (proof.snapshot.lights || []).map((l) => ({
        id: l.id, emitted: l.emitted, distance: l.distance, decay: l.decay,
        castShadow: l.castShadow, state: l.state,
        pointPositionLocal: l.pointPosition, color: l.color,
      })),
    } : null,
    fixtureEmitterWorldPositions: T._interiorFixtureEmittersForTest ? T._interiorFixtureEmittersForTest() : null,
    sceneLightsSummary: T._interiorSceneLightsForTest ? T._interiorSceneLightsForTest() : null,
    sceneBackgroundHex: (T._tabletopSceneLightsForTest ? T._tabletopSceneLightsForTest().background : null),
    gradeTonemap: T._gradeTonemapForTest ? T._gradeTonemapForTest() : null,
    overlayModes: bench ? bench.overlayModes : null,
    camera: T._clayCameraPoseForTest ? T._clayCameraPoseForTest() : null,
    renderer: {
      backingPx: canvas ? canvas.width + "x" + canvas.height : null,
      cssPx: canvas ? canvas.clientWidth + "x" + canvas.clientHeight : null,
      dprEffective: canvas && canvas.clientWidth ? +(canvas.width / canvas.clientWidth).toFixed(2) : null,
      shadowMap: T.shadowMapEnabled ? T.shadowMapEnabled() : null,
    },
    postChain: T._postChainForTest ? T._postChainForTest() : null,
  };
}

function structureProbe() {
  const T = window.Theater || {};
  const sb = T._clayStructureBenchForTest ? T._clayStructureBenchForTest() : null;
  const canvas = document.querySelector("canvas");
  return sb ? {
    view: sb.view,
    mountedMeshes: sb.mountedMeshes, shadowCasters: sb.shadowCasters,
    hostSuppressedMeshes: sb.hostSuppressedMeshes,
    shellUppers: { built: sb.shell.builtUpperSegments, omitted: sb.shell.omittedUpperSegments, total: sb.shell.totalUpperSegments },
    wallOmission: sb.wallOmission,
    cameraSideOmission: { active: sb.cameraSideOmission.active, ruleId: sb.cameraSideOmission.ruleId,
      omitted: sb.cameraSideOmission.omitted, built: sb.cameraSideOmission.built },
    negativeControl: sb.negativeControl,
    specimens: (sb.specimens || []).map((s) => s.id),
    camera: T._clayCameraPoseForTest ? T._clayCameraPoseForTest() : null,
    renderer: { backingPx: canvas ? canvas.width + "x" + canvas.height : null,
      cssPx: canvas ? canvas.clientWidth + "x" + canvas.clientHeight : null },
  } : null;
}

async function fpsSample(page, ms) {
  return page.evaluate(async (sampleMs) => {
    return await new Promise((resolve) => {
      let frames = 0;
      const t0 = performance.now();
      const deltas = [];
      let last = t0;
      function tick(now) {
        frames++;
        deltas.push(now - last);
        last = now;
        if (now - t0 < sampleMs) requestAnimationFrame(tick);
        else {
          deltas.sort((a, b) => a - b);
          resolve({
            frames,
            elapsedMs: +(now - t0).toFixed(1),
            fps: +(frames / ((now - t0) / 1000)).toFixed(1),
            frameMsMedian: +(deltas[Math.floor(deltas.length / 2)] || 0).toFixed(2),
            frameMsP95: +(deltas[Math.floor(deltas.length * 0.95)] || 0).toFixed(2),
          });
        }
      }
      requestAnimationFrame(tick);
    });
  }, ms);
}

async function canvasClip(page, filePath) {
  const box = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  if (box) await page.screenshot({ path: filePath, clip: box });
  else await page.screenshot({ path: filePath });
}

async function hidePanel(page, hidden) {
  await page.evaluate((h) => {
    const p = document.getElementById("clay-room-overlay");
    if (p) p.style.display = h ? "none" : "";
  }, hidden);
}

async function setOverlays(page, wanted) {
  // Click the bench's own POSITION/RANGE/SHADOW toggle buttons until modes match `wanted`.
  await page.evaluate((want) => {
    const T = window.Theater;
    for (let i = 0; i < 2; i++) {
      const bench = T._clayLightingBenchForTest ? T._clayLightingBenchForTest() : null;
      if (!bench || !bench.overlayModes) return;
      const modes = bench.overlayModes;
      ["position", "range", "shadow"].forEach((key) => {
        if (!!modes[key] !== !!want[key]) {
          const b = [...document.querySelectorAll("button")]
            .find((x) => x.getAttribute("aria-label") === "Toggle " + key + " light overlay");
          if (b) b.click();
        }
      });
    }
  }, wanted);
}

async function openPage(browser, viewport, extraQuery, errors, warnings) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/favicon.ico") request.respond({ status: 204 });
    else request.continue();
  });
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
    else if (m.type() === "warning" || m.type() === "warn") warnings.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  const url = BASE + "/genesis.html?clayroom=1" + (extraQuery ? "&" + extraQuery : "");
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(
    () => document.querySelector("canvas") && /renderer size/.test(document.body.innerText),
    { timeout: 30000 }
  );
  return page;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT,
  });
  const consoleErrors = [], consoleWarnings = [];
  const receipt = {
    capturedBy: "dev/capture-clayroom-visual-correction.cjs",
    assignment: "docs/FABLE-CLAYROOM-VISUAL-CORRECTION-ASSIGNMENT.md",
    runtimePath: "authored JSON lock -> compiled light registry -> clayRoomBoardFrom() -> spatializePlan -> interiorBuildBoard -> setInteriorBoard (production interior channel)",
    viewport: VIEWPORT, narrowViewport: NARROW_VIEWPORT,
    lighting: {}, structure: {}, fps: {},
  };

  // ---------------- PHASE A: CL-F02 lighting bench ----------------
  {
    const page = await openPage(browser, VIEWPORT, "clayfixture=lights", consoleErrors, consoleWarnings);
    await new Promise((r) => setTimeout(r, 4500)); // full async settle (sprite replay, door warm)
    for (const recipeId of RECIPES) {
      const ok = await page.evaluate((id) => !!(window.Theater
        && window.Theater._claySetLightingRecipeForTest
        && window.Theater._claySetLightingRecipeForTest(id)), recipeId);
      if (!ok) throw new Error("could not apply light recipe " + recipeId);
      await new Promise((r) => setTimeout(r, 1500));
      // full-page layout frame, panel + default overlays as the UI ships them
      await page.screenshot({ path: path.join(OUT, "f02-" + recipeId + "-layout.png") });
      // clean beauty frame: panel hidden, all light overlays off
      await setOverlays(page, { position: false, range: false, shadow: false });
      await hidePanel(page, true);
      await new Promise((r) => setTimeout(r, 350));
      await canvasClip(page, path.join(OUT, "f02-" + recipeId + "-clean.png"));
      receipt.lighting[recipeId] = await page.evaluate(lightingProbe);
      if (recipeId === "torchlit") receipt.fps.torchlit = await fpsSample(page, 2000);
      if (recipeId === "daylit") receipt.fps.daylit = await fpsSample(page, 2000);
      await hidePanel(page, false);
      await setOverlays(page, { position: true, range: true, shadow: false });
      await new Promise((r) => setTimeout(r, 250));
    }
    // leave the technical overlay-on warm/cool frame as explicit labeled evidence
    await page.evaluate(() => window.Theater._claySetLightingRecipeForTest("clay-opposing-pair"));
    await new Promise((r) => setTimeout(r, 1200));
    await hidePanel(page, true);
    await new Promise((r) => setTimeout(r, 300));
    await canvasClip(page, path.join(OUT, "f02-clay-opposing-pair-overlays-on-technical.png"));
    await hidePanel(page, false);
    await page.close();
  }

  // ---------------- PHASE B: CL-F01 structure bench ----------------
  {
    const page = await openPage(browser, VIEWPORT, "clayfixture=structure", consoleErrors, consoleWarnings);
    await new Promise((r) => setTimeout(r, 4500));
    for (const view of STRUCTURE_VIEWS) {
      const ok = await page.evaluate((v) => !!(window.Theater
        && window.Theater._claySetStructureViewForTest
        && window.Theater._claySetStructureViewForTest(v)), view);
      if (!ok) throw new Error("could not set structure view " + view);
      await new Promise((r) => setTimeout(r, 900));
      await page.screenshot({ path: path.join(OUT, "f01-" + view + "-layout.png") });
      await hidePanel(page, true);
      await new Promise((r) => setTimeout(r, 300));
      await canvasClip(page, path.join(OUT, "f01-" + view + "-clean.png"));
      await hidePanel(page, false);
      receipt.structure[view] = await page.evaluate(structureProbe);
    }
    // staged-latch sequence (mechanical receipts, no frames needed beyond the two states)
    receipt.structure.latchSequence = await page.evaluate(() => {
      const T = window.Theater;
      T._claySetStructureViewForTest("assembled");
      const seq = [];
      const grab = (step) => {
        const sb = T._clayStructureBenchForTest();
        seq.push({ step, staged: sb.wallOmission.staged, latched: sb.wallOmission.latched,
          omittedUppers: sb.shell.omittedUpperSegments, builtUppers: sb.shell.builtUpperSegments });
      };
      T._claySetStructureStagedForTest(false); grab("leave-play");
      T._claySetStructureDoorStateForTest("open"); grab("door-open-while-sealed");
      T._claySetStructureStagedForTest(true); grab("stage-space");
      T._claySetStructureDoorStateForTest("shut"); grab("door-shut-after-staged");
      T._claySetStructureDoorStateForTest("open"); grab("door-reopen-staged");
      return seq;
    });
    await new Promise((r) => setTimeout(r, 600));
    await hidePanel(page, true);
    await new Promise((r) => setTimeout(r, 300));
    await canvasClip(page, path.join(OUT, "f01-staged-door-open-clean.png"));
    await hidePanel(page, false);
    await page.close();
  }

  // ---------------- PHASE C: narrow-viewport layout evidence ----------------
  {
    const page = await openPage(browser, NARROW_VIEWPORT, "clayfixture=structure", consoleErrors, consoleWarnings);
    await new Promise((r) => setTimeout(r, 4000));
    await page.screenshot({ path: path.join(OUT, "f01-narrow-layout.png") });
    receipt.structure.narrowLayout = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const panel = document.getElementById("clay-room-overlay");
      const cr = canvas ? canvas.getBoundingClientRect() : null;
      const pr = panel ? panel.getBoundingClientRect() : null;
      return {
        window: { w: window.innerWidth, h: window.innerHeight },
        canvasRect: cr ? { x: cr.x, y: cr.y, w: cr.width, h: cr.height } : null,
        panelRect: pr ? { x: pr.x, y: pr.y, w: pr.width, h: pr.height } : null,
        panelFractionOfWindow: pr ? +((pr.width * pr.height) / (window.innerWidth * window.innerHeight)).toFixed(3) : null,
      };
    });
    await page.close();
  }

  receipt.consoleErrors = consoleErrors;
  receipt.consoleWarnings = consoleWarnings;
  fs.writeFileSync(path.join(OUT, "capture-receipt.json"), JSON.stringify(receipt, null, 2));
  await browser.close();
  console.log("CAPTURE_DONE frames=" + fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).length
    + " consoleErrors=" + consoleErrors.length + " consoleWarnings=" + consoleWarnings.length);
})().catch((e) => { console.error("CAPTURE_FAILED", e.message); process.exit(1); });
