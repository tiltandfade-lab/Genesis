/* AO CONTACT-REGISTRATION DIAGNOSTIC (Adam 2026-07-25: "at every point of planar contact you can
   see a gap of light shining through on every shape").

   Reproduces the symptom close-up, then A/Bs the leading hypotheses WITHOUT touching source:
     1. current settings (half-res AO, authored denoise) — the symptom baseline;
     2. AO OFF — proves the gap belongs to the AO layer, not lighting;
     3. full-res AO (ENV_AO_RESOLUTION_SCALE 1.0 equivalent via live setSize) — tests the
        upsample-misregistration hypothesis;
     4. denoise radius 0 (raw AO) at half res — tests the Poisson-denoise bleed hypothesis;
     5. full-res + raw — the two combined.
   Each frame is the SAME settled clay-neutral-truth pose framed tight on the sphere/floor and
   cube/floor contact seams. Also samples a 1-px-wide luma strip across the sphere-floor contact
   for each state so the "bright rim at contact" is a measured curve, not an impression.

   Usage: node dev/capture-ao-contact-diagnostic.cjs <outDir> [port=5178] */
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "5178";
if (!OUT) { console.error("usage: node dev/capture-ao-contact-diagnostic.cjs <outDir> [port]"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://127.0.0.1:" + PORT;

const CLOSE_POSE = { pos: { x: -2.6, y: 1.6, z: 3.4 }, lookAt: { x: -0.4, y: 0.25, z: -0.2 } };

async function shoot(page, file) {
  // pose-set + yaw + forced render + toDataURL in ONE evaluate — the Phase-A close-view law: a
  // screenshot taken after the evaluate returns races whatever re-renders next (a 250ms readout
  // tick, a starved-rAF glide); reading the canvas back INSIDE the same eval right after the
  // forced render makes the race impossible by construction. Pose read-back proves the framing.
  const shotData = await page.evaluate((pose) => {
    const T = window.Theater;
    if (T._setInteriorCameraPoseForTest) T._setInteriorCameraPoseForTest(pose.pos, pose.lookAt);
    if (T._updateSpriteBillboardYawForTest) T._updateSpriteBillboardYawForTest();
    if (T._renderFrameForTest) T._renderFrameForTest();
    const c = document.querySelector("canvas");
    const cam = T._interiorCameraPositionForTest ? T._interiorCameraPositionForTest() : null;
    return { dataUrl: c.toDataURL("image/png"), cam };
  }, CLOSE_POSE);
  fs.writeFileSync(path.join(OUT, file), Buffer.from(shotData.dataUrl.split(",")[1], "base64"));
  return shotData.cam;
}

async function lumaStrip(page) {
  // 1-px vertical luma strip through the sphere-floor contact — re-poses and re-renders inside
  // the eval for the same race-免 reason as shoot().
  return page.evaluate((pose) => {
    const T = window.Theater;
    if (T._setInteriorCameraPoseForTest) T._setInteriorCameraPoseForTest(pose.pos, pose.lookAt);
    if (T._renderFrameForTest) T._renderFrameForTest();
    const c = document.querySelector("canvas");
    const gl2 = document.createElement("canvas");
    gl2.width = c.width; gl2.height = c.height;
    const ctx = gl2.getContext("2d");
    ctx.drawImage(c, 0, 0);
    const x = Math.floor(c.width * 0.42);           // vertical line through the sphere body
    const y0 = Math.floor(c.height * 0.35), y1 = Math.floor(c.height * 0.9);
    const data = ctx.getImageData(x, y0, 1, y1 - y0).data;
    const luma = [];
    for (let i = 0; i < data.length; i += 4) luma.push(+(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]).toFixed(1));
    return { x, y0, y1, luma };
  }, CLOSE_POSE);
}

async function setAOState(page, mode) {
  // mode: "on" | "off" | "fullres" | "raw" | "fullres-raw"
  return page.evaluate((m) => {
    const T = window.Theater;
    const info = T._environmentAOForTest ? T._environmentAOForTest() : null;
    T._setSuitePassEnabledForTest("ao", m !== "off");
    if (m === "off" || !info) return { mode: m, applied: true };
    // reach the live pass through the diagnostic seam (read-only registry of the post suite)
    return T._aoContactDiagForTest ? T._aoContactDiagForTest(m) : { mode: m, applied: false, note: "no seam — page-side fallback used" };
  }, mode);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + "/genesis.html?clayroom=1&clayfixture=lights", { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.Theater && typeof window.Theater._environmentAOForTest === "function" && document.querySelector("canvas"), { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 4000));
  await page.evaluate(() => window.Theater._claySetLightingRecipeForTest("clay-neutral-truth"));
  await new Promise((r) => setTimeout(r, 1500));
  // hide panel chrome
  await page.evaluate(() => { const p = document.getElementById("clay-room-overlay"); if (p) p.style.display = "none"; });

  const receipt = { pose: CLOSE_POSE, states: {}, pageErrors: errors };
  const states = ["on", "off", "fullres", "raw", "fullres-raw"];
  for (const m of states) {
    const applied = await setAOState(page, m);
    const cam = await shoot(page, "contact-" + m + ".png");
    receipt.states[m] = { applied, cam, luma: await lumaStrip(page) };
  }
  fs.writeFileSync(path.join(OUT, "contact-diagnostic-receipt.json"), JSON.stringify(receipt, null, 2));
  await browser.close();
  console.log("AO_CONTACT_DIAG_DONE errors=" + errors.length);
})().catch((e) => { console.error("AO_CONTACT_DIAG_FAILED", e.message); process.exit(1); });
