/* THEATER SPLIT — Step 0 contract freeze.

   Captures the LIVE window.Theater surface (sorted key list + typeof each key) in a real
   browser, in the two boot modes that publish different key sets:
     - plain genesis.html (production boot; theater may be unmounted but the facade exists)
     - ?clayroom=1&clayfixture=lights (dev-surface boot; clay + light-lab seams live)
   Writes dev/fixtures/theater-surface-baseline.json. The split's per-step gate
   (dev/verify-theater-surface.mjs) diffs the live surface against this file — the brief's
   "Public-contract proof" made mechanical. The module header is NOT a valid inventory
   (9 documented methods vs ~200 live keys); this capture is.

   Usage: node dev/capture-theater-surface-baseline.cjs [port]   (default 5180) */
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const PORT = process.argv[2] || "5180";
const BASE = "http://127.0.0.1:" + PORT;
const OUT = path.join(__dirname, "fixtures", "theater-surface-baseline.json");

async function surfaceOf(browser, url, waitForCanvas) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.Theater && typeof window.Theater.mount === "function", { timeout: 30000 });
  if (waitForCanvas) {
    await page.waitForFunction(() => !!document.querySelector("canvas"), { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2500));
  } else {
    await new Promise((r) => setTimeout(r, 1500));
  }
  const surface = await page.evaluate(() => {
    const T = window.Theater;
    const keys = Object.keys(T).sort();
    const types = {};
    keys.forEach((k) => {
      const d = Object.getOwnPropertyDescriptor(T, k);
      types[k] = (d && (d.get || d.set)) ? "accessor" : typeof T[k];
    });
    return { keyCount: keys.length, keys, types };
  });
  await page.close();
  return { surface, pageErrors: errors };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: { width: 1280, height: 720 },
  });
  const plain = await surfaceOf(browser, BASE + "/genesis.html", false);
  const clay = await surfaceOf(browser, BASE + "/genesis.html?clayroom=1&clayfixture=lights", true);
  await browser.close();

  const baseline = {
    capturedBy: "dev/capture-theater-surface-baseline.cjs",
    branch: "refactor/theater-boot-split",
    note: "Contract freeze for the theater-boot split. Regenerate ONLY with an explicit, explained contract change — never to green a diff.",
    plain: plain.surface,
    clayroom: clay.surface,
    pageErrors: { plain: plain.pageErrors, clayroom: clay.pageErrors },
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(baseline, null, 2) + "\n");
  console.log("SURFACE_BASELINE_DONE plain=" + plain.surface.keyCount + " clayroom=" + clay.surface.keyCount
    + " errors=" + (plain.pageErrors.length + clay.pageErrors.length));
})().catch((e) => { console.error("SURFACE_BASELINE_FAILED", e.message); process.exit(1); });
