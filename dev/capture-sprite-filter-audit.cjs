/* GOLDEN SITE 1 renderer-resumption proof.

   Captures four sprite sampling contracts from the same settled production sprite-citizenship
   fixture, camera, selected human, and neutral-truth lighting. This is a diagnosis harness only:
   it mutates loaded texture filters through window.Theater._setSpriteSamplingForTest and never
   changes authored assets, world materials, camera state, or production defaults.

   Usage (server must already serve this worktree):
     node dev/capture-sprite-filter-audit.cjs <outDir> [port]
*/
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "4173";
if (!OUT) {
  console.error("usage: node dev/capture-sprite-filter-audit.cjs <outDir> [port]");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const PAGE_URL = "http://127.0.0.1:" + PORT
  + "/genesis.html?clayroom=1&clayfixture=sprite-citizenship";
const MODES = [
  ["nearest", "01-nearest"],
  ["bw2-linear", "02-bw2-linear"],
  ["nearest-mipmap", "03-nearest-mipmap"],
  ["trilinear", "04-trilinear"],
];

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

async function settle(page) {
  await page.waitForFunction(() => {
    const T = window.Theater;
    const snap = T && T._claySpriteCitizenshipForTest && T._claySpriteCitizenshipForTest();
    const selected = snap && snap.lineup && snap.lineup
      .find((row) => row.slug === "spr-pc-human-fighter-female");
    return selected && selected.contentBounds && selected.shell;
  }, { timeout: 30000 });
  // Allow every asynchronous sprite load/replay to finish. This audit is intentionally scoped to
  // the same selected Human Fighter in every frame; the current worktree's full true-scale lineup
  // may legitimately be smaller while non-human candidate assets are absent or cut.
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function selectedClip(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("#clay-room-workbench-viewport canvas")
      || document.querySelector("canvas");
    const selected = window.Theater.__spriteScreenRects()
      .find((row) => row.slug === "spr-pc-human-fighter-female");
    if (!canvas || !selected) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    const pad = 52;
    const x = rect.left + (selected.cx - selected.w * 0.5) / scaleX - pad;
    const y = rect.top + (selected.cy - selected.h * 0.5) / scaleY - pad;
    const width = selected.w / scaleX + pad * 2;
    const height = selected.h / scaleY + pad * 2;
    return {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.min(window.innerWidth - Math.max(0, x), width),
      height: Math.min(window.innerHeight - Math.max(0, y), height)
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT,
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto(PAGE_URL, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => (
    window.Theater
    && typeof window.Theater._setSpriteSamplingForTest === "function"
    && typeof window.Theater.__spriteScreenRects === "function"
    && typeof window.Theater._claySetSpriteScaleModeForTest === "function"
  ), { timeout: 30000 });
  await clickExact(page, "Sprites");
  const expanded = await page.$eval("#clay-room-workbench-catalog",
    (rail) => rail.getAttribute("aria-expanded") !== "false");
  if (expanded) await page.click('[aria-label="Collapse or expand Clayroom catalog"]');
  await page.evaluate(() => {
    window.Theater._claySetLightingRecipeForTest("clay-neutral-truth");
    // The presentation cap is the actual tactical read where minification quality matters. True
    // scale remains covered by CL-R2; using it here also pushes the selected figure off-frame when
    // the current worktree has only a subset of the giant/monster candidates available.
    window.Theater._claySetSpriteScaleModeForTest("diagnostic-cap");
    window.Theater._claySelectSpriteForTest("spr-pc-human-fighter-female");
    window.Theater._claySetSelectedSpriteViewForTest("face");
  });
  try {
    await settle(page);
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      href: location.href,
      title: document.title,
      bodyText: document.body ? document.body.innerText.slice(0, 1200) : null,
      theaterKeys: window.Theater ? Object.keys(window.Theater).filter((key) => key.includes("clay")) : [],
      citizenship: window.Theater && window.Theater._claySpriteCitizenshipForTest
        ? window.Theater._claySpriteCitizenshipForTest() : null,
    }));
    console.error("settle diagnostic:", JSON.stringify(diagnostic, null, 2));
    throw error;
  }

  const receipt = {
    gate: "GS1-SPRITE-FILTER-AUDIT",
    capturedBy: "dev/capture-sprite-filter-audit.cjs",
    url: PAGE_URL,
    viewport: VIEWPORT,
    camera: await page.evaluate(() => window.Theater._clayCameraPoseForTest()),
    variants: [],
  };
  for (const [mode, stem] of MODES) {
    const mutation = await page.evaluate((requestedMode) => (
      window.Theater._setSpriteSamplingForTest(requestedMode)
    ), mode);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const clip = await selectedClip(page);
    const fullFile = stem + "-live-ui.png";
    const cropFile = stem + "-selected-human.png";
    await page.screenshot({ path: path.join(OUT, fullFile), fullPage: false });
    if (clip && clip.width > 1 && clip.height > 1) {
      await page.screenshot({ path: path.join(OUT, cropFile), clip });
    }
    receipt.variants.push({
      requestedMode: mode,
      mutation,
      fullFile,
      cropFile: clip ? cropFile : null,
      clip,
      audit: await page.evaluate(() => window.Theater.spriteFilterAudit()),
      contract: await page.evaluate(() => window.Theater._spriteCitizenshipRenderContractForTest())
    });
  }

  receipt.consoleErrors = consoleErrors;
  fs.writeFileSync(
    path.join(OUT, "sprite-filter-audit-receipt.json"),
    JSON.stringify(receipt, null, 2) + "\n"
  );
  await browser.close();
  const actionableConsoleErrors = consoleErrors.filter((message) => (
    message !== "Failed to load resource: the server responded with a status of 404 (File not found)"
  ));
  if (actionableConsoleErrors.length) {
    throw new Error("browser console errors: " + actionableConsoleErrors.join(" | "));
  }
  console.log("captured " + receipt.variants.length + " sprite sampling variants -> " + OUT);
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
