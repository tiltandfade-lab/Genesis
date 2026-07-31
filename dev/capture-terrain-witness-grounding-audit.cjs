/* GOLDEN SITE 1 terrain-witness grounding diagnosis.

   Banks the same Guard Post frame with:
     1. production silhouette shadow + contact pool,
     2. silhouette shadow + contact pool hidden,
     3. contact pool + silhouette caster disabled.

   The two bounded negative controls isolate contact/AO pixels from the long cast shadow without
   changing the map, camera, light, material, source sprite, or tactical footprint.

   Usage (server must already serve this worktree):
     node dev/capture-terrain-witness-grounding-audit.cjs <outDir> [port]
*/
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "5176";
const EXTRUSION = process.argv.includes("--spriteextrusion=1");
if (!OUT) {
  console.error("usage: node dev/capture-terrain-witness-grounding-audit.cjs <outDir> [port]");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const PAGE_URL = "http://127.0.0.1:" + PORT
  + "/genesis.html?clayroom=1&clayfixture=terrain"
  + "&terrainscene=gv-w2-guard-post-day"
  + "&guardprofile=institutional-frontier&terrainturn=0"
  + (EXTRUSION ? "&spriteextrusion=1" : "");

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
    // Include the one-body-height cast-shadow envelope around the figure, not only its card rect.
    const padX = 90;
    const padY = 110;
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

async function setTerrainContactVisible(page, visible) {
  return page.evaluate((on) => {
    const T = window.Theater;
    const root = T._clayInteriorGroupForTest && T._clayInteriorGroupForTest();
    let changed = 0;
    if (root) root.traverse((node) => {
      if (!(node.userData && node.userData.terrainWitnessContact)) return;
      node.visible = on;
      changed++;
    });
    return changed;
  }, visible);
}

async function settleFixedPose(page) {
  return page.evaluate(async () => {
    const T = window.Theater;
    if (T && T._clayTerrainSetViewForTest) T._clayTerrainSetViewForTest("production");
    if (T && T._clayTerrainSetQuarterTurnForTest) T._clayTerrainSetQuarterTurnForTest(0);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const report = T && T._clayTerrainBenchForTest && T._clayTerrainBenchForTest();
    const pose = T && T._clayCamPoseForTest && T._clayCamPoseForTest();
    return {
      quarterTurn: report && report.cameraQuarterTurn ? report.cameraQuarterTurn : null,
      position: pose && pose.pos ? pose.pos : null,
      target: pose && pose.target ? pose.target : null
    };
  });
}

async function snapshot(page, stem, clip) {
  // Reapply the governed production pose immediately before every control frame. A terrain-witness
  // retry may rebuild the bench after initial readiness; allowing that lifecycle to land between
  // A/B images would compare two camera bearings instead of two shadow states.
  const pose = await settleFixedPose(page);
  await new Promise((resolve) => setTimeout(resolve, 80));
  await page.screenshot({ path: path.join(OUT, stem + "-live-ui.png"), fullPage: false });
  if (clip) {
    await page.screenshot({ path: path.join(OUT, stem + "-human-crop.png"), clip });
  }
  return pose;
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
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/favicon.ico") request.respond({ status: 204 });
    else request.continue();
  });

  await page.goto(PAGE_URL, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => {
    const T = window.Theater;
    const report = T && T._clayTerrainBenchForTest && T._clayTerrainBenchForTest();
    const shadows = T && T._spriteShadowStateForTest && T._spriteShadowStateForTest();
    return report && report.sceneId === "gv-w2-guard-post-day"
      && shadows && shadows.some((row) => row.hasCustomDepth && row.castShadow);
  }, { timeout: 30000 });
  await new Promise((resolve) => setTimeout(resolve, 5500));

  // Match the clean production capture: remove the diagnostic panel without touching the canvas.
  await page.evaluate(() => {
    const overlay = document.getElementById("clay-room-overlay");
    if (overlay) overlay.style.visibility = "hidden";
  });
  await new Promise((resolve) => setTimeout(resolve, 180));
  const clip = await witnessClip(page);

  const receipt = {
    gate: "GS1-TERRAIN-WITNESS-GROUNDING",
    url: PAGE_URL,
    viewport: VIEWPORT,
    spriteExtrusionRequested: EXTRUSION,
    clip,
    terrain: await page.evaluate(() => window.Theater._clayTerrainBenchForTest()),
    lightRecipe: await page.evaluate(() => window.Theater._clayLightingRecipeForTest()),
    lightingProof: await page.evaluate(() => window.Theater._clayLightingProofForTest()),
    shadowContact: await page.evaluate(() => window.Theater._clayShadowContactForTest()),
    spriteShadowState: await page.evaluate(() => window.Theater._spriteShadowStateForTest()),
    shadowPassProbe: await page.evaluate(() => window.Theater._spriteShadowProbeForTest()),
    variants: []
  };

  const contactOn = await setTerrainContactVisible(page, true);
  const casterOn = await page.evaluate(() => window.Theater._setSpriteCastShadowForTest(true));
  const productionPose = await snapshot(page, "01-production-shadow-contact", clip);
  receipt.variants.push({ id: "production-shadow-contact", contactVisible: true, contactOn, casterOn,
    cameraPose: productionPose });

  const contactOff = await setTerrainContactVisible(page, false);
  const contactOffPose = await snapshot(page, "02-contact-off", clip);
  receipt.variants.push({ id: "contact-off", contactVisible: false, contactOff, casterOn: true,
    cameraPose: contactOffPose });

  await setTerrainContactVisible(page, true);
  const casterOff = await page.evaluate(() => window.Theater._setSpriteCastShadowForTest(false));
  const shadowOffPose = await snapshot(page, "03-shadow-off", clip);
  receipt.variants.push({ id: "shadow-off", contactVisible: true, casterOff,
    cameraPose: shadowOffPose });

  // Never leave the live page in a negative-control state.
  await page.evaluate(() => window.Theater._setSpriteCastShadowForTest(true));
  await setTerrainContactVisible(page, true);

  receipt.consoleErrors = consoleErrors;
  fs.writeFileSync(
    path.join(OUT, "terrain-witness-grounding-receipt.json"),
    JSON.stringify(receipt, null, 2) + "\n"
  );
  await browser.close();
  const actionable = consoleErrors.filter((message) => (
    message !== "Failed to load resource: the server responded with a status of 404 (File not found)"
  ));
  if (actionable.length) throw new Error("browser console errors: " + actionable.join(" | "));
  console.log("captured terrain-witness grounding A/B -> " + OUT);
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
