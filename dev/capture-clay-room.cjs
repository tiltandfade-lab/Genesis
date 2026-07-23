/* C1A capture rig — mirrors dev/verify-room-shell-render.mjs's launch pattern */
const path = require("path");
const fs = require("fs");
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const OUT = process.argv[2];
const BASE = "http://127.0.0.1:5176";
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--headless=new", "--no-sandbox", "--use-gl=angle", "--enable-webgl", "--hide-scrollbars"],
    defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(BASE + "/genesis.html?clayroom=1", { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(
    () => document.querySelector("canvas") && /renderer size/.test(document.body.innerText),
    { timeout: 30000 }
  );
  await new Promise((r) => setTimeout(r, 3000)); // sprite async load + light reassert settle

  await page.screenshot({ path: path.join(OUT, "c1a-01-room-facts.png") });

  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Explain");
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, "c1a-02-explain.png") });

  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /edit\s+worldHeight/.test(x.textContent));
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT, "c1a-03-edit-refusal.png") });

  const probe = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    const t = window.Theater;
    return {
      backing: c ? c.width + "x" + c.height : null,
      css: c ? c.clientWidth + "x" + c.clientHeight : null,
      lights: t && t._interiorSceneLightsForTest ? t._interiorSceneLightsForTest() : null,
    };
  });
  fs.writeFileSync(path.join(OUT, "c1a-capture-probe.json"), JSON.stringify({ probe, consoleErrors: errors }, null, 2));
  await browser.close();
  console.log("CAPTURES_DONE", JSON.stringify(probe), "consoleErrors:", errors.length);
})().catch((e) => { console.error("CAPTURE_FAILED", e.message); process.exit(1); });
