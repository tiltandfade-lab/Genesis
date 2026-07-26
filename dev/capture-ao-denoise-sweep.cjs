/* AO DENOISE PARAMETER SWEEP — the measured fix for the contact-gap defect.

   The contact diagnostic proved the Poisson denoise bleeds bright open-surface AO across creases
   (raw AO hugs every contact; denoised AO shows Adam's "gap of light"). The shader's weights say
   why: depthPhi is a view-space plane distance (authored 8 ≈ the whole room → never gates),
   lumaPhi 10 over a 0..1 AO range never gates, so only normalSimilarity protects creases — and
   half-res normals are averaged exactly there.

   This rig sweeps candidates and MEASURES each against the raw reference:
     - creaseGap = mean |luma(candidate) - luma(raw)| inside the crease band (a 2-D patch centred
       on the tread/block inside corner) — lower = the denoise no longer lifts the crease;
     - flatNoise = luma stddev in a flat floor patch — lower = dither still smoothed;
   plus the same close-up frame per candidate for eyes.

   Usage: node dev/capture-ao-denoise-sweep.cjs <outDir> [port=5178] */
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const PORT = process.argv[3] || "5178";
if (!OUT) { console.error("usage: node dev/capture-ao-denoise-sweep.cjs <outDir> [port]"); process.exit(2); }
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://127.0.0.1:" + PORT;

const CLOSE_POSE = { pos: { x: -2.6, y: 1.6, z: 3.4 }, lookAt: { x: -0.4, y: 0.25, z: -0.2 } };
// screen-space measurement patches at deviceScaleFactor 2, canvas ~2648x2704 backing px (fractions):
// crease band: tight box on the second-tread/block inside corner; flat patch: open floor upper-left.
const CREASE = { x0: 0.665, x1: 0.700, y0: 0.60, y1: 0.72 };
const FLAT = { x0: 0.10, x1: 0.30, y0: 0.15, y1: 0.30 };

const CANDIDATES = [
  { name: "raw-ref", params: { radius: 0 } },                                    // reference truth FIRST
  { name: "authored", params: {} },                                              // current (the defect)
  { name: "A-normal16-tight", params: { lumaPhi: 0.8, depthPhi: 0.5, normalPhi: 16 } },
  { name: "B-normal24-r3", params: { radius: 3, lumaPhi: 0.8, depthPhi: 0.5, normalPhi: 24 } },
  { name: "C-lumadepth-only", params: { lumaPhi: 0.8, depthPhi: 0.5 } },         // isolate: keep normalPhi 8
  { name: "D-normal-only", params: { normalPhi: 16 } },                          // isolate: keep luma/depth loose
  { name: "E-fullres-A", params: { resolutionScale: 1, lumaPhi: 0.8, depthPhi: 0.5, normalPhi: 16 } },
  // round 2 — preserve the 1-2-texel crease line: the luma gate is what can save a thin dark line
  // from a spatial average (lumaPhi 0.8 leaves weight 0.38 across a 0.5 AO contrast; 0.25-0.4
  // zeroes it), and a smaller radius shrinks how far the average reaches in the first place.
  { name: "F-r2-luma04", params: { radius: 2, lumaPhi: 0.4, depthPhi: 0.5, normalPhi: 16 } },
  { name: "G-r2-luma025", params: { radius: 2, lumaPhi: 0.25, depthPhi: 0.5, normalPhi: 16 } },
  { name: "H-r1-luma04", params: { radius: 1, lumaPhi: 0.4, depthPhi: 0.5, normalPhi: 16 } },
  { name: "I-r3-luma03", params: { radius: 3, lumaPhi: 0.3, depthPhi: 0.5, normalPhi: 16 } },
];

async function measure(page, name) {
  const r = await page.evaluate((pose, CREASE, FLAT) => {
    const T = window.Theater;
    if (T._setInteriorCameraPoseForTest) T._setInteriorCameraPoseForTest(pose.pos, pose.lookAt);
    if (T._updateSpriteBillboardYawForTest) T._updateSpriteBillboardYawForTest();
    if (T._renderFrameForTest) T._renderFrameForTest();
    const c = document.querySelector("canvas");
    const g = document.createElement("canvas");
    g.width = c.width; g.height = c.height;
    const ctx = g.getContext("2d");
    ctx.drawImage(c, 0, 0);
    function patchLuma(p) {
      const x0 = Math.floor(c.width * p.x0), x1 = Math.floor(c.width * p.x1);
      const y0 = Math.floor(c.height * p.y0), y1 = Math.floor(c.height * p.y1);
      const d = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data;
      const out = [];
      for (let i = 0; i < d.length; i += 4) out.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
      return out;
    }
    const cam = T._interiorCameraPositionForTest ? T._interiorCameraPositionForTest() : null;
    // whole-frame luma at 1/4 sampling (every 2nd px both axes of the backing store) — the gap is a
    // thin line whose location we should not have to guess; a whole-frame diff finds it wherever it is
    const wf = [];
    {
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      for (let y = 0; y < c.height; y += 2) {
        const row = y * c.width * 4;
        for (let x = 0; x < c.width; x += 2) {
          const i = row + x * 4;
          wf.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
        }
      }
    }
    const live = window.Theater._environmentAOForTest();
    return { crease: patchLuma(CREASE), flat: patchLuma(FLAT), wholeFrame: wf, liveDenoise: null, targetSize: live.targetSize, dataUrl: c.toDataURL("image/png"), cam };
  }, CLOSE_POSE, CREASE, FLAT);
  fs.writeFileSync(path.join(OUT, "sweep-" + name + ".png"), Buffer.from(r.dataUrl.split(",")[1], "base64"));
  return r;
}

function stats(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / arr.length);
  return { mean: +mean.toFixed(2), sd: +sd.toFixed(2) };
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
  await page.waitForFunction(() => window.Theater && typeof window.Theater._aoContactDiagForTest === "function" && document.querySelector("canvas"), { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 4000));
  await page.evaluate(() => window.Theater._claySetLightingRecipeForTest("clay-neutral-truth"));
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(() => { const p = document.getElementById("clay-room-overlay"); if (p) p.style.display = "none"; });

  const results = {};
  let rawFrame = null;
  for (const cand of CANDIDATES) {
    const applied = await page.evaluate((p) => window.Theater._aoContactDiagForTest(Object.keys(p).length ? p : "on"), cand.params);
    await new Promise((r) => setTimeout(r, 250));
    const m = await measure(page, cand.name);
    const crease = stats(m.crease), flat = stats(m.flat);
    results[cand.name] = { params: cand.params, applied, crease, flat, targetSize: m.targetSize, cam: m.cam };
    if (cand.name === "raw-ref") rawFrame = m.wholeFrame;
    else if (rawFrame && m.wholeFrame.length === rawFrame.length) {
      // mean |diff| vs raw over the whole frame, plus the mean of the top-1% differing samples —
      // the thin gap line lives in that tail (a whole-frame mean alone would dilute it away)
      const diffs = new Array(rawFrame.length);
      for (let i = 0; i < rawFrame.length; i++) diffs[i] = Math.abs(m.wholeFrame[i] - rawFrame[i]);
      const sorted = diffs.slice().sort((a, b) => b - a);
      const tailN = Math.max(1, Math.floor(sorted.length * 0.01));
      let tailSum = 0; for (let i = 0; i < tailN; i++) tailSum += sorted[i];
      let all = 0; for (const d of diffs) all += d;
      results[cand.name].vsRaw = { meanAbs: +(all / diffs.length).toFixed(3), top1pctMean: +(tailSum / tailN).toFixed(2) };
    }
  }
  fs.writeFileSync(path.join(OUT, "denoise-sweep-receipt.json"), JSON.stringify({ pose: CLOSE_POSE, patches: { CREASE, FLAT }, results, pageErrors: errors }, null, 2));
  console.log("AO_SWEEP_DONE errors=" + errors.length);
  for (const [k, v] of Object.entries(results)) {
    console.log(`  ${k.padEnd(18)} flat sd ${String(v.flat.sd).padStart(5)} | size ${v.targetSize ? v.targetSize.w : "?"}` + (v.vsRaw ? ` | vsRaw mean ${v.vsRaw.meanAbs} top1% ${v.vsRaw.top1pctMean}` : " | (reference)"));
  }
  await browser.close();
})().catch((e) => { console.error("AO_SWEEP_FAILED", e.message); process.exit(1); });
