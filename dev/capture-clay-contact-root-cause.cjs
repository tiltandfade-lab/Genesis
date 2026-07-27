/* CL-R3 PLANAR-CONTACT ROOT-CAUSE CAPTURE.

   Same production structure, camera, material, light, and post chain in every frame. The only
   controlled variables are GTAO enable/output/resolution and the live directional-light shadow
   map recipe. This distinguishes:
     - a real geometry/depth crack;
     - an AO upsample/denoise halo;
     - shadow-map contact quantization/filtering.

   Usage:
     node dev/capture-clay-contact-root-cause.cjs <outDir> [port=4182]
*/
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "4182";
if (!OUT) {
  console.error("usage: node dev/capture-clay-contact-root-cause.cjs <outDir> [port]");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

async function renderCanvas(page, file) {
  const dataUrl = await page.evaluate(() => {
    window.Theater._updateSpriteBillboardYawForTest();
    window.Theater._renderFrameForTest();
    return document.querySelector("canvas").toDataURL("image/png");
  });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(dataUrl.split(",")[1], "base64"));
}

async function applyState(page, state) {
  return page.evaluate((next) => {
    const T = window.Theater;
    T._setEnvironmentAOOutputForTest(next.aoOutput || "default");
    T._setSuitePassEnabledForTest("ao", next.aoEnabled !== false);
    if (next.aoMode) T._aoContactDiagForTest(next.aoMode);
    const shadowMode = {
      bias: next.bias,
      normalBias: next.normalBias,
      mapSize: next.mapSize,
      filter: next.filter,
      shadowSide: next.shadowSide
    };
    if (typeof next.castShadow === "boolean") shadowMode.castShadow = next.castShadow;
    const shadows = T._clayShadowContactForTest(shadowMode);
    T._renderFrameForTest();
    return {
      ao: T._environmentAOForTest(),
      shadows,
      camera: T._clayCameraPoseForTest()
    };
  }, state);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 2 }
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(
    "http://127.0.0.1:" + PORT + "/genesis.html?clayroom=1&clayfixture=structure-bench",
    { waitUntil: "load", timeout: 60000 }
  );
  await page.waitForFunction(() => (
    window.Theater
    && typeof window.Theater._clayShadowContactForTest === "function"
    && window.Theater._clayStructureBenchForTest()
    && document.querySelector("canvas")
  ), { timeout: 30000 });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await page.evaluate(() => {
    window.Theater._claySetStructureViewForTest("assembled");
    window.Theater._clayFocusStructureSpecForTest("assembly-second-floor", 0.24);
    const overlay = document.getElementById("clay-room-overlay");
    if (overlay) overlay.style.display = "none";
  });

  const states = [
    { id: "01-legacy-auto-1024", aoEnabled: true, aoMode: "on", normalBias: 0.03, bias: -0.0003, mapSize: 1024, filter: "pcf", shadowSide: "auto" },
    { id: "02-legacy-auto-ao-off", aoEnabled: false, normalBias: 0.03, bias: -0.0003, mapSize: 1024, filter: "pcf", shadowSide: "auto" },
    { id: "03-culprit-auto-2048", aoEnabled: true, aoMode: "on", normalBias: 0, bias: 0, mapSize: 2048, filter: "pcf", shadowSide: "auto" },
    { id: "04-culprit-auto-ao-off", aoEnabled: false, normalBias: 0, bias: 0, mapSize: 2048, filter: "pcf", shadowSide: "auto" },
    { id: "05-production-front-bias", aoEnabled: true, aoMode: "on", normalBias: 0, bias: -0.001, mapSize: 2048, filter: "pcf", shadowSide: "front" },
    { id: "06-production-front-ao-off", aoEnabled: false, normalBias: 0, bias: -0.001, mapSize: 2048, filter: "pcf", shadowSide: "front" },
    { id: "07-production-front-fullres-ao", aoEnabled: true, aoMode: "fullres", normalBias: 0, bias: -0.001, mapSize: 2048, filter: "pcf", shadowSide: "front" },
    { id: "08-front-zero-bias-acne", aoEnabled: true, aoMode: "on", normalBias: 0, bias: 0, mapSize: 2048, filter: "pcf", shadowSide: "front" },
    { id: "09-front-small-bias-acne", aoEnabled: true, aoMode: "on", normalBias: 0, bias: -0.0005, mapSize: 2048, filter: "pcf", shadowSide: "front" },
    { id: "10-auto-pcf-4096-residual", aoEnabled: true, aoMode: "on", normalBias: 0, bias: 0, mapSize: 4096, filter: "pcf", shadowSide: "auto" },
    { id: "11-auto-soft-filter-failure", aoEnabled: true, aoMode: "on", normalBias: 0, bias: 0, mapSize: 2048, filter: "pcf-soft", shadowSide: "auto" },
    { id: "12-auto-basic-filter-failure", aoEnabled: true, aoMode: "on", normalBias: 0, bias: 0, mapSize: 2048, filter: "basic", shadowSide: "auto" },
    { id: "13-ao-only", aoEnabled: true, aoMode: "fullres", aoOutput: "ao", castShadow: false, normalBias: 0, bias: -0.001, mapSize: 2048, filter: "pcf", shadowSide: "front" },
    { id: "14-shadow-off", aoEnabled: true, aoMode: "on", castShadow: false, normalBias: 0, bias: -0.001, mapSize: 2048, filter: "pcf", shadowSide: "front" }
  ];
  const receipt = { fixture: "CL-F01", focus: "assembly-second-floor", states: [], errors };
  for (const state of states) {
    const applied = await applyState(page, state);
    const file = state.id + ".png";
    await renderCanvas(page, file);
    receipt.states.push({ state, applied, file });
  }
  fs.writeFileSync(
    path.join(OUT, "contact-root-cause-receipt.json"),
    JSON.stringify(receipt, null, 2)
  );
  await browser.close();
  console.log("CONTACT_ROOT_CAUSE_DONE states=" + states.length + " errors=" + errors.length);
})().catch((error) => {
  console.error("CONTACT_ROOT_CAUSE_FAILED", error && error.stack || error);
  process.exit(1);
});
