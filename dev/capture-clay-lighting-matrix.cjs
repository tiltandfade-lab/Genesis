/* CL-R1 / CL-F02 complete lighting comparison capture.

   Starts the real Genesis page on the dedicated lighting bench, asks the workbench's one-click
   capture path to render its exact seven-recipe matrix, and banks both the composed PNG and the
   machine-readable receipt returned by that same browser path.

   Usage (server must already serve this worktree):
     node dev/capture-clay-lighting-matrix.cjs <outDir> [port]
*/
const fs = require("fs");
const path = require("path");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "4173";
if (!OUT) {
  console.error("usage: node dev/capture-clay-lighting-matrix.cjs <outDir> [port]");
  process.exit(2);
}
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 2 };
const PAGE_URL = "http://127.0.0.1:" + PORT
  + "/genesis.html?clayroom=1&clayfixture=lighting-bench";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEWPORT,
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

  await page.goto(PAGE_URL, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => (
    window.Theater
    && typeof window.Theater._clayCaptureLightingMatrixForTest === "function"
    && document.getElementById("clay-room-pixel-readout")
  ), { timeout: 30000 });
  await page.waitForFunction(() => (
    /authored PNG/.test(document.body.innerText)
    && !/loading authored source/.test(document.body.innerText)
  ), { timeout: 30000 });

  const artifact = await page.evaluate(async () => {
    window.Theater._claySetLightingRecipeForTest("torchlit");
    window.Theater._claySetLightingPreviewSeedForTest("A");
    const result = await window.Theater._clayCaptureLightingMatrixForTest();
    return result ? {
      receipt: result.receipt,
      dataUrl: result.dataUrl,
      width: result.width,
      height: result.height,
    } : null;
  });
  if (!artifact || !artifact.dataUrl || !artifact.receipt) {
    throw new Error("Clayroom returned no lighting matrix artifact");
  }
  if (!Array.isArray(artifact.receipt.cards) || artifact.receipt.cards.length !== 7) {
    throw new Error("expected exactly seven lighting cards");
  }
  ["daylit", "moonlit", "magic-glow", "torchlit", "lavalit"].forEach((recipeId) => {
    const card = artifact.receipt.cards.find((row) => row.recipeId === recipeId);
    if (!card || !card.source || card.source.loreNative !== true || !card.lights.length) {
      throw new Error("lore-native matrix card has no live renderer light: " + recipeId);
    }
  });

  const png = Buffer.from(artifact.dataUrl.replace(/^data:image\/png;base64,/, ""), "base64");
  fs.writeFileSync(path.join(OUT, "cl-r1-lighting-comparison.png"), png);
  artifact.receipt.capture = {
    capturedBy: "dev/capture-clay-lighting-matrix.cjs",
    url: PAGE_URL,
    viewport: VIEWPORT,
    composedSize: { width: artifact.width, height: artifact.height },
    consoleErrors,
    consoleWarnings,
    warningVerdict: consoleWarnings.length === 0 ? "PASS" : "REVIEW",
  };
  fs.writeFileSync(
    path.join(OUT, "cl-r1-lighting-comparison-receipt.json"),
    JSON.stringify(artifact.receipt, null, 2)
  );
  await page.screenshot({
    path: path.join(OUT, "cl-r1-lighting-comparison-live-ui.png"),
    fullPage: false,
  });
  await browser.close();

  console.log(
    "CAPTURE_DONE",
    "cards=" + artifact.receipt.cards.length,
    "png=" + artifact.width + "x" + artifact.height,
    "errors=" + consoleErrors.length,
    "warnings=" + consoleWarnings.length
  );
})().catch((error) => {
  console.error("CAPTURE_FAILED", error.stack || error.message);
  process.exit(1);
});
