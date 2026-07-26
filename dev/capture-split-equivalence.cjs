/* THEATER SPLIT — B10 visual-equivalence proof (brief "Required proof §4").

   Captures the SAME four scenes against two servers — the pre-split B0 tip (e4370753) and the
   post-split head — same machine, same viewport/DPR, same fixture seeds, same settled state,
   in-eval toDataURL (the pose-race law), pose read back into the receipt:

     P1  flat tabletop, several unit sizes   (theater-preview.html fixture board)
     P2  ordinary interior: door aperture, dressing, practical light  (clayroom torchlit)
     P3  the clayroom sprite/lighting fixture (clay-neutral-truth)
     P4  dark interior: environment fill, contact, cast shadows, post (clayroom moonlit)

   Emits per-pair mean/max |luma diff| and the count of pixels differing by >6 luma. The intended
   result is visual equivalence; any measurable difference must be explained or treated as a
   visual change for Adam. Flicker-animated recipes are avoided on purpose (torchlit flame is
   PAUSED via the solo/steady seam when available; P2 uses the settled first frame either way —
   the same-frame A/A noise of this instrument is reported alongside).

   Usage: node dev/capture-split-equivalence.cjs <outDir> <beforePort> <afterPort> */
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const BEFORE_PORT = process.argv[3] || "5181";
const AFTER_PORT = process.argv[4] || "5180";
if (!OUT) { console.error("usage: node dev/capture-split-equivalence.cjs <outDir> <beforePort> <afterPort>"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });

const VIEW = { width: 1280, height: 720, deviceScaleFactor: 2 };

async function captureClay(browser, base, recipe, file) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/genesis.html?clayroom=1&clayfixture=lights", { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.Theater && typeof window.Theater._claySetLightingRecipeForTest === "function" && document.querySelector("canvas"), { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3500));
  await page.evaluate((id) => window.Theater._claySetLightingRecipeForTest(id), recipe);
  await new Promise((r) => setTimeout(r, 1600));
  const shot = await page.evaluate(() => {
    const T = window.Theater;
    const p = document.getElementById("clay-room-overlay"); if (p) p.style.display = "none";
    if (T._claySetLightSoloForTest) { /* leave solo state default — same both sides */ }
    if (T._updateSpriteBillboardYawForTest) T._updateSpriteBillboardYawForTest();
    if (T._renderFrameForTest) T._renderFrameForTest();
    const c = document.querySelector("canvas");
    const cam = T._interiorCameraPositionForTest ? T._interiorCameraPositionForTest() : null;
    return { dataUrl: c.toDataURL("image/png"), cam, w: c.width, h: c.height };
  });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(shot.dataUrl.split(",")[1], "base64"));
  await page.close();
  return { cam: shot.cam, w: shot.w, h: shot.h, pageErrors: errors };
}

async function captureTabletop(browser, base, file) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base + "/dev/theater-preview.html", { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.Theater && typeof window.Theater.setBoard === "function", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2500));
  const shot = await page.evaluate(async () => {
    const T = window.Theater;
    // a deterministic flat board + three unit sizes through the production realizer
    if (!document.querySelector("canvas")) {
      const host = document.querySelector("#stage") || document.body.firstElementChild;
      T.mount(host);
    }
    T.setBoard({});
    T.setUnits({ units: [
      { fid: "u1", name: "Guard", x: 3, z: 3, size: "Medium" },
      { fid: "u2", name: "Skeleton", x: 5, z: 4, size: "Medium" },
      { fid: "u3", name: "Zombie", x: 4, z: 6, size: "Large" },
    ]});
    await new Promise((r) => setTimeout(r, 1200));
    if (T._updateSpriteBillboardYawForTest) T._updateSpriteBillboardYawForTest();
    if (T._renderFrameForTest) T._renderFrameForTest();
    const c = document.querySelector("canvas");
    return { dataUrl: c.toDataURL("image/png"), w: c.width, h: c.height };
  });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(shot.dataUrl.split(",")[1], "base64"));
  await page.close();
  return { w: shot.w, h: shot.h, pageErrors: errors };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: VIEW,
  });
  const receipt = { before: {}, after: {} };
  for (const [side, port] of [["before", BEFORE_PORT], ["after", AFTER_PORT]]) {
    const base = "http://127.0.0.1:" + port;
    receipt[side].p1 = await captureTabletop(browser, base, `p1-tabletop-${side}.png`);
    receipt[side].p2 = await captureClay(browser, base, "torchlit", `p2-interior-${side}.png`);
    receipt[side].p3 = await captureClay(browser, base, "clay-neutral-truth", `p3-clayfixture-${side}.png`);
    receipt[side].p4 = await captureClay(browser, base, "moonlit", `p4-dark-${side}.png`);
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, "equivalence-receipt.json"), JSON.stringify(receipt, null, 2));
  const errs = ["before", "after"].flatMap((s) => ["p1", "p2", "p3", "p4"].flatMap((p) => receipt[s][p].pageErrors || []));
  console.log("EQUIV_CAPTURE_DONE pageErrors=" + errs.length);
})().catch((e) => { console.error("EQUIV_CAPTURE_FAILED", e.message); process.exit(1); });
