/* GOLDEN SITE 1 — SPRITE STANDEE AO/DEPTH AUDIT.

   Two fresh production pages, identical Guard Post map/camera/light:
     - legacy rectangular standee shell (`spriteextrusion=0`);
     - source-alpha contour extrusion (`spriteextrusion=1`).

   Each page banks the composite, GTAO-only, and depth-only views around the same human witness.
   The purpose is narrow: prove which physical standee representation enters the environment
   prepass. This rig does not tune AO, light, terrain, materials, or camera.

   Usage (server must already serve this worktree):
     node dev/capture-sprite-standee-ao-audit.cjs <outDir> [port]
*/
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "5176";
if (!OUT) {
  console.error("usage: node dev/capture-sprite-standee-ao-audit.cjs <outDir> [port]");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const BASE = "http://127.0.0.1:" + PORT
  + "/genesis.html?clayroom=1&clayfixture=terrain"
  + "&terrainscene=gv-w2-guard-post-day"
  + "&guardprofile=institutional-frontier&terrainturn=0";

async function witnessClip(page) {
  return page.evaluate(() => {
    const T = window.Theater;
    const canvas = document.querySelector("canvas");
    const row = T.__spriteScreenRects()
      .find((candidate) => candidate.slug === "spr-pc-human-fighter-female");
    if (!canvas || !row) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    const padX = 70, padY = 75;
    const x = rect.left + (row.cx - row.w * 0.5) / scaleX - padX;
    const y = rect.top + (row.cy - row.h * 0.5) / scaleY - padY;
    return {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.min(window.innerWidth - Math.max(0, x), row.w / scaleX + padX * 2),
      height: Math.min(window.innerHeight - Math.max(0, y), row.h / scaleY + padY * 2)
    };
  });
}

async function settle(page) {
  return page.evaluate(async () => {
    const T = window.Theater;
    T._clayTerrainSetViewForTest("production");
    T._clayTerrainSetQuarterTurnForTest(0);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      terrain: T._clayTerrainBenchForTest(),
      sprites: T._spriteShadowStateForTest(),
      ao: T._environmentAOForTest(),
      exclusions: T._envAOPrepassExcludesForTest()
    };
  });
}

async function bankMode(page, variantDir, mode, clip) {
  const applied = await page.evaluate(async (nextMode) => {
    const T = window.Theater;
    T._setSuitePassEnabledForTest("ao", true);
    const result = T._setEnvironmentAOOutputForTest(nextMode);
    T._updateSpriteBillboardYawForTest();
    T._renderFrameForTest();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return result;
  }, mode);
  await page.screenshot({
    path: path.join(variantDir, mode + "-human-crop.png"),
    clip
  });
  return applied;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT
  });
  const receipt = {
    gate: "GS1-SPRITE-STANDEE-AO-AUDIT",
    invariant: "same map, production camera, light, sprite, scale, alpha cutoff, and tactical anchor",
    viewport: VIEWPORT,
    variants: []
  };

  for (const variant of [
    { id: "legacy-rectangle", query: "0" },
    { id: "alpha-contour-extrusion", query: "1" }
  ]) {
    const variantDir = path.join(OUT, variant.id);
    fs.mkdirSync(variantDir, { recursive: true });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const url = BASE + "&spriteextrusion=" + variant.query;
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => {
      const T = window.Theater;
      const terrain = T && T._clayTerrainBenchForTest && T._clayTerrainBenchForTest();
      const sprites = T && T._spriteShadowStateForTest && T._spriteShadowStateForTest();
      return terrain && terrain.sceneId === "gv-w2-guard-post-day"
        && sprites && sprites.some((row) => row.hasCustomDepth);
    }, { timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 8500));
    await page.evaluate(() => {
      const overlay = document.getElementById("clay-room-overlay");
      if (overlay) overlay.style.visibility = "hidden";
    });
    const state = await settle(page);
    const clip = await witnessClip(page);
    const modes = {};
    for (const mode of ["default", "ao", "depth"]) {
      modes[mode] = await bankMode(page, variantDir, mode, clip);
    }
    await page.evaluate(() => window.Theater._setEnvironmentAOOutputForTest("default"));
    receipt.variants.push({
      id: variant.id,
      query: variant.query,
      url,
      clip,
      state,
      modes,
      errors
    });
    await page.close();
  }

  fs.writeFileSync(
    path.join(OUT, "sprite-standee-ao-audit-receipt.json"),
    JSON.stringify(receipt, null, 2) + "\n"
  );
  await browser.close();
  const actionable = receipt.variants.flatMap((variant) => variant.errors)
    .filter((message) => message !== "Failed to load resource: the server responded with a status of 404 (File not found)");
  if (actionable.length) throw new Error("browser console errors: " + actionable.join(" | "));
  console.log("captured sprite standee AO audit -> " + OUT);
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
