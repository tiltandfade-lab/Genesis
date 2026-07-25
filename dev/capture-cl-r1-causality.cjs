/* CL-R1 causal sprite/light capture matrix.

   Every rendered card uses the production Clayroom and changes exactly one named
   variable. This is evidence, not an alternate renderer.

     node dev/capture-cl-r1-causality.cjs <outDir> [port]
*/
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "5176";
if (!OUT) {
  console.error("usage: node dev/capture-cl-r1-causality.cjs <outDir> [port]");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const BASE = "http://127.0.0.1:" + PORT + "/genesis.html?clayroom=1";
const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const DELAY = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function newPage(browser, query, errors, warnings) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/favicon.ico") request.respond({ status: 204 });
    else request.continue();
  });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
    else if (message.type() === "warning" || message.type() === "warn") warnings.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(BASE + (query ? "&" + query : ""), { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(
    () => window.Theater && window.Theater._claySetLightingRecipeForTest
      && document.querySelector("canvas") && /renderer size/.test(document.body.innerText),
    { timeout: 30000 }
  );
  await DELAY(1800);
  await page.evaluate(() => {
    window.Theater._claySetLightingRecipeForTest("clay-neutral-truth");
    const lightingButton = [...document.querySelectorAll("button")]
      .find((entry) => entry.getAttribute("aria-label") === "Clayroom lighting proof");
    if (lightingButton) lightingButton.click();
    const overlay = document.getElementById("clay-room-overlay");
    if (overlay) overlay.style.display = "none";
  });
  await DELAY(750);
  return page;
}

async function spriteClip(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const canvasBox = canvas.getBoundingClientRect();
    const rows = window.Theater.__spriteScreenRects();
    if (!rows.length) return null;
    const row = rows[0];
    const sx = canvasBox.width / canvas.width;
    const sy = canvasBox.height / canvas.height;
    const margin = 18;
    const x = canvasBox.left + (row.cx - row.w * 0.75) * sx - margin;
    const y = canvasBox.top + (row.cy - row.h * 0.68) * sy - margin;
    const width = row.w * 1.5 * sx + margin * 2;
    const height = row.h * 1.36 * sy + margin * 2;
    return {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.min(window.innerWidth - Math.max(0, x), width),
      height: Math.min(window.innerHeight - Math.max(0, y), height),
      projected: row,
    };
  });
}

async function capture(page, id, variable, expected, receipt) {
  await DELAY(500);
  const clip = await spriteClip(page);
  if (!clip) throw new Error("sprite screen rectangle unavailable for " + id);
  await page.screenshot({ path: path.join(OUT, id + "-full.png") });
  await page.screenshot({
    path: path.join(OUT, id + "-sprite.png"),
    clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height },
  });
  receipt.cards.push({
    id,
    variable,
    expected,
    spriteClip: clip,
    recipe: await page.evaluate(() => window.Theater._clayLightingRecipeForTest()),
    spriteFilters: await page.evaluate(() => window.Theater.spriteFilterAudit
      ? window.Theater.spriteFilterAudit() : null),
    tonemap: await page.evaluate(() => window.Theater._gradeTonemapForTest()),
    postChain: await page.evaluate(() => window.Theater._postChainForTest
      ? window.Theater._postChainForTest() : null),
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT,
  });
  const errors = [];
  const warnings = [];
  const receipt = {
    kind: "cl-r1-causal-capture",
    fixture: "CL-F00 production Clayroom",
    viewport: VIEWPORT,
    sourceSprite: "assets/sprites/spr-fantasy-goblin-warrior.png",
    isolationLaw: "same fixture/camera/geometry; one named renderer variable changed per A/B",
    cards: [],
    negativeControls: {},
  };

  // Colour-space A/B requires a fresh texture load because colourSpace is applied by the loader.
  const wrongColorPage = await newPage(browser, "spritesrgb=0", errors, warnings);
  await capture(
    wrongColorPage,
    "01-color-wrong-untagged",
    "colour-space tagging only",
    "known-bad: lifted midtones and reduced chroma",
    receipt
  );
  await wrongColorPage.close();

  const page = await newPage(browser, "spritesrgb=1", errors, warnings);
  await capture(
    page,
    "02-color-production-srgb",
    "colour-space tagging only",
    "production: authored sRGB decoded once",
    receipt
  );

  // Material response: full-bright MeshBasic versus the production lit standee material.
  await page.evaluate(() => {
    window.Theater.__setSpriteUnlitDebug(true);
    window.Theater._claySetLightingRecipeForTest("clay-neutral-truth");
  });
  await capture(
    page,
    "03-material-unlit",
    "standee material response only",
    "reference: source-colour/full-bright render",
    receipt
  );
  await page.evaluate(() => {
    window.Theater.__setSpriteUnlitDebug(false);
    window.Theater._claySetLightingRecipeForTest("clay-neutral-truth");
  });
  await capture(
    page,
    "04-material-lit",
    "standee material response only",
    "production: light shapes value without changing colour-space",
    receipt
  );

  // Texture sampling: production nearest magnification versus a deliberately softened mutation.
  await page.evaluate(() => window.Theater._setSpriteSamplingForTest("linear"));
  await capture(
    page,
    "05-sampling-wrong-linear",
    "texture sampling only",
    "known-bad: softened pixel edges",
    receipt
  );
  await page.evaluate(() => window.Theater._setSpriteSamplingForTest("production"));
  await capture(
    page,
    "06-sampling-production-nearest",
    "texture sampling only",
    "production: nearest magnification, governed linear minification",
    receipt
  );

  // Tone mapping: rebuild only the grade curve in the same mounted composer.
  await page.evaluate(() => window.Theater._setGradeTonemapForTest("none"));
  await capture(
    page,
    "07-tonemap-none",
    "tone mapping only",
    "comparison: no AgX shoulder",
    receipt
  );
  await page.evaluate(() => window.Theater._setGradeTonemapForTest("agx"));
  await capture(
    page,
    "08-tonemap-production-agx",
    "tone mapping only",
    "production: AgX highlight shoulder",
    receipt
  );

  // Compositing: leave all material/light state intact and bypass only the post chain.
  await page.evaluate(() => window.Theater._setPostChainEnabledForTest(false));
  await capture(
    page,
    "09-compositing-post-off",
    "compositing only",
    "comparison: direct renderer",
    receipt
  );
  await page.evaluate(() => window.Theater._setPostChainEnabledForTest(true));
  await capture(
    page,
    "10-compositing-production-post",
    "compositing only",
    "production: renderer → grade/bloom/output chain",
    receipt
  );

  // Light-energy A/B through the same structured lock editor seam the Lab UI uses.
  await page.evaluate(() => window.Theater._claySetLightingRecipeForTest("torchlit"));
  await capture(
    page,
    "11-energy-production-torch",
    "light energy only",
    "production authored torch energy",
    receipt
  );
  const mutationAccepted = await page.evaluate(() => {
    window.Theater._lightLabSelectForTest("torchlit", 0);
    return window.Theater._lightLabSetTunable("profile.light.physicalIntensity", 30);
  });
  await capture(
    page,
    "12-energy-overpowered",
    "light energy only",
    "known-bad visual mutation at the Lab's maximum preview bound",
    receipt
  );
  receipt.negativeControls.overpoweredPreviewAccepted = mutationAccepted;
  receipt.negativeControls.outOfBoundsRejected = await page.evaluate(() => {
    window.Theater._lightLabSelectForTest("torchlit", 0);
    return !window.Theater._lightLabSetTunable("profile.light.physicalIntensity", 31);
  });
  await page.evaluate(() => window.Theater._lightLabResetAuthored());

  receipt.consoleErrors = errors;
  receipt.consoleWarnings = warnings;
  receipt.verdict = errors.length === 0 && warnings.length === 0
    && receipt.negativeControls.outOfBoundsRejected ? "PASS" : "REVIEW";
  fs.writeFileSync(path.join(OUT, "causality-receipt.json"), JSON.stringify(receipt, null, 2));
  await page.close();
  await browser.close();
  console.log(
    "CL_R1_CAUSAL_CAPTURE_DONE",
    "cards=" + receipt.cards.length,
    "consoleErrors=" + errors.length,
    "consoleWarnings=" + warnings.length,
    "outOfBoundsRejected=" + receipt.negativeControls.outOfBoundsRejected
  );
  process.exit(0);
})().catch((error) => {
  console.error("CL_R1_CAUSAL_CAPTURE_FAILED", error.stack || error.message);
  process.exit(1);
});
