/* CLAYROOM VISUAL CORRECTION — Checkpoint 1 AO A/B + performance capture.

   For each proof recipe (neutral truth, daylight, moonlight) banks the SAME settled clean frame
   with environment AO ON and OFF (nothing else changes — the A/B the assignment requires), plus:
   - a shadow-side CLOSE VIEW (stairs, wall/floor contact, opening, support) AO ON/OFF;
   - a clean beauty frame with every diagnostic control hidden (panel + overlays off, AO ON);
   - measured FPS/frame-time at the production viewport AND the high-DPR review viewport,
     each with AO ON and AO OFF — the "do not accept choppy" evidence;
   - a receipt with the authored AO params, live pass state, prepass exclusion counts, and the
     per-frame conditions.

   Usage: node dev/capture-clayroom-ao-ab.cjs <outDir> [port] */
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "5177";
if (!OUT) { console.error("usage: node dev/capture-clayroom-ao-ab.cjs <outDir> [port]"); process.exit(2); }
const BASE = "http://127.0.0.1:" + PORT;
fs.mkdirSync(OUT, { recursive: true });

const REVIEW_VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };    // capture-law review scale
const PRODUCTION_VIEWPORT = { width: 960, height: 540, deviceScaleFactor: 2 }; // the fixture's own default renderer size
const RECIPES = ["clay-neutral-truth", "daylit", "moonlit"];

// The shadow-form close view: framed on the bench stairs' shadowed side so one frame carries
// stair treads/risers + the wall/floor seam + the portal opening edge + primitive/floor contacts.
const CLOSE_POSE = {
  pos: { x: -4.2, y: 3.4, z: 5.2 },
  lookAt: { x: -1.2, y: 0.4, z: -0.6 },
};

async function hideChrome(page, hidden) {
  await page.evaluate((h) => {
    const p = document.getElementById("clay-room-overlay");
    if (p) p.style.display = h ? "none" : "";
  }, hidden);
}
async function overlaysOff(page) {
  await page.evaluate(() => {
    const T = window.Theater;
    for (let i = 0; i < 2; i++) {
      const bench = T._clayLightingBenchForTest ? T._clayLightingBenchForTest() : null;
      if (!bench || !bench.overlayModes) return;
      ["position", "range", "shadow"].forEach((key) => {
        if (bench.overlayModes[key]) {
          const b = [...document.querySelectorAll("button")]
            .find((x) => x.getAttribute("aria-label") === "Toggle " + key + " light overlay");
          if (b) b.click();
        }
      });
    }
  });
}
async function setAO(page, on) {
  return page.evaluate((v) => window.Theater._setSuitePassEnabledForTest("ao", v), on);
}
async function canvasClip(page, filePath) {
  const box = await page.evaluate(() => {
    // Backgrounded/headless tabs starve rAF (the codebase's own _renderFrameForTest header names
    // this exact hazard) — force one synchronous production render so the canvas pixels reflect
    // the CURRENT camera/pass state before the screenshot reads them. Billboard yaw normally runs
    // in the rAF loop BEFORE the render (scheduleRender's own ordering); a forced render after a
    // board rebuild must run it too, or a freshly rebuilt card is photographed EDGE-ON (the
    // "invisible sprite with a visible shadow" capture artifact, Adam 2026-07-25).
    if (window.Theater && window.Theater._updateSpriteBillboardYawForTest) window.Theater._updateSpriteBillboardYawForTest();
    if (window.Theater && window.Theater._renderFrameForTest) window.Theater._renderFrameForTest();
    const c = document.querySelector("canvas");
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  if (box) await page.screenshot({ path: filePath, clip: box });
  else await page.screenshot({ path: filePath });
}
async function fpsSample(page, ms) {
  return page.evaluate(async (sampleMs) => {
    // force continuous re-render so the sample measures full-pipeline frames, not idle rAF
    const stop = { done: false };
    (function loop(){ if (stop.done) return; window.Theater._renderFrameForTest ? window.Theater._renderFrameForTest() : null; requestAnimationFrame(loop); })();
    const out = await new Promise((resolve) => {
      let frames = 0; const t0 = performance.now(); const deltas = []; let last = t0;
      function tick(now) {
        frames++; deltas.push(now - last); last = now;
        if (now - t0 < sampleMs) requestAnimationFrame(tick);
        else {
          deltas.sort((a, b) => a - b);
          resolve({ frames, elapsedMs: +(now - t0).toFixed(1),
            fps: +(frames / ((now - t0) / 1000)).toFixed(1),
            frameMsMedian: +(deltas[Math.floor(deltas.length / 2)] || 0).toFixed(2),
            frameMsP95: +(deltas[Math.floor(deltas.length * 0.95)] || 0).toFixed(2) });
        }
      }
      requestAnimationFrame(tick);
    });
    stop.done = true;
    return out;
  }, ms);
}
async function openPage(browser, viewport, errors, warnings) {
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
  await page.goto(BASE + "/genesis.html?clayroom=1&clayfixture=lights", { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(
    () => document.querySelector("canvas") && /renderer size/.test(document.body.innerText)
      && window.Theater && typeof window.Theater._environmentAOForTest === "function",
    { timeout: 30000 }
  );
  await new Promise((r) => setTimeout(r, 4000));
  return page;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: REVIEW_VIEWPORT,
  });
  const consoleErrors = [], consoleWarnings = [];
  const receipt = { capturedBy: "dev/capture-clayroom-ao-ab.cjs", recipes: {}, fps: {}, close: {} };

  // -------- A/B frames + beauty at review scale --------
  {
    const page = await openPage(browser, REVIEW_VIEWPORT, consoleErrors, consoleWarnings);
    for (const recipeId of RECIPES) {
      await page.evaluate((id) => window.Theater._claySetLightingRecipeForTest(id), recipeId);
      await new Promise((r) => setTimeout(r, 1400));
      await overlaysOff(page);
      await hideChrome(page, true);
      await new Promise((r) => setTimeout(r, 300));
      await setAO(page, true);
      await new Promise((r) => setTimeout(r, 250));
      await canvasClip(page, path.join(OUT, recipeId + "-ao-on.png"));
      const aoOnState = await page.evaluate(() => window.Theater._environmentAOForTest());
      await setAO(page, false);
      await new Promise((r) => setTimeout(r, 250));
      await canvasClip(page, path.join(OUT, recipeId + "-ao-off.png"));
      await setAO(page, true);
      await hideChrome(page, false);
      receipt.recipes[recipeId] = { aoOnState };
    }
    // NOTE (2026-07-25): the shadow-form CLOSE view is captured from the LIVE browser session,
    // not this rig — headless Chrome's starved rAF loop re-fits the governed camera under the
    // screenshot in a way live tabs do not (traced; see the checkpoint report). The live capture
    // path: governed wheel-zoom + drag-pan, then one toDataURL per AO state in separate calls,
    // written to close-shadow-forms-ao-on/off.png. This rig deliberately does NOT write those
    // files so a rig re-run can never clobber the live-captured pair.
    // clean beauty frame: neutral, AO on, everything diagnostic hidden
    await page.evaluate((id) => window.Theater._claySetLightingRecipeForTest(id), "clay-neutral-truth");
    await new Promise((r) => setTimeout(r, 1200));
    await page.evaluate(() => {
      const c = document.querySelector("canvas");
      if (c) { const T = window.Theater; /* default framing */ }
      window.dispatchEvent(new Event("resize"));
    });
    await new Promise((r) => setTimeout(r, 600));
    await canvasClip(page, path.join(OUT, "beauty-neutral-ao-on.png"));
    // review-scale FPS with AO on/off
    receipt.fps.review = {};
    await setAO(page, true);
    receipt.fps.review.aoOn = await fpsSample(page, 2500);
    await setAO(page, false);
    receipt.fps.review.aoOff = await fpsSample(page, 2500);
    await setAO(page, true);
    await page.close();
  }

  // -------- production-scale FPS (the fixture's own default renderer size) --------
  {
    const page = await openPage(browser, PRODUCTION_VIEWPORT, consoleErrors, consoleWarnings);
    await page.evaluate((id) => window.Theater._claySetLightingRecipeForTest(id), "torchlit");
    await new Promise((r) => setTimeout(r, 1400)); // flame = the continuous animation path
    receipt.fps.production = {};
    await setAO(page, true);
    receipt.fps.production.aoOn = await fpsSample(page, 2500);
    await setAO(page, false);
    receipt.fps.production.aoOff = await fpsSample(page, 2500);
    await setAO(page, true);
    receipt.fps.production.recipe = "torchlit (flame animating)";
    receipt.fps.production.renderer = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      return c ? { backingPx: c.width + "x" + c.height, cssPx: c.clientWidth + "x" + c.clientHeight } : null;
    });
    await page.close();
  }

  receipt.consoleErrors = consoleErrors;
  receipt.consoleWarnings = consoleWarnings;
  fs.writeFileSync(path.join(OUT, "ao-ab-receipt.json"), JSON.stringify(receipt, null, 2));
  await browser.close();
  console.log("AO_AB_DONE frames=" + fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).length
    + " consoleErrors=" + consoleErrors.length);
})().catch((e) => { console.error("AO_AB_FAILED", e.message); process.exit(1); });
