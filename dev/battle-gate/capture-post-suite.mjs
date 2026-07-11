#!/usr/bin/env node
/* dev/battle-gate/capture-post-suite.mjs — BEAUTY-WAVE-3 THE POST SUITE (BW3-2 TILT-SHIFT DoF /
   BW3-3 SELECTIVE BLOOM / BW3-6 FILMIC GRADE) TASTE + VERIFY gate.

   Boots the real app to an in-session interior render (same server/Chrome/boot conventions as
   capture-interior-study.mjs — copied deliberately, see that file's header for the "why" behind each),
   mounts three flagship scenes (chrome / gloom / fantasy), and for each captures per-effect A/B cards:
     off   — all three effect passes disabled (composer path, but no effect: the honest baseline)
     dof   — DoF only
     bloom — bloom only
     grade — grade only
     on    — all three (the shipped look)
   Plus machine assertions read off window.Theater._postSuiteForTest / dofFocus:
     - DoF focal tracking: a "beat" fit vs a "room" fit yield DIFFERENT world focus distances.
     - Bloom negative control: mean-abs pixel diff (off vs bloom) in an ALBEDO region (a lit sprite
       body) stays tiny while an EMISSIVE region (the lantern/torch) differs measurably.
     - Grade determinism: same realm twice -> identical grade uniforms.
     - fps with ALL passes live (measureComposerFps-style back-to-back render loop).

   Run:  node dev/battle-gate/capture-post-suite.mjs   [ROUND=N env -> output subdir tag]
   Output: dev/battle-gate/post-suite/{scene}-{variant}.png, round-{N}.png (contact sheet), findings.json */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const outDir = path.join(__dirname, "post-suite");
fs.mkdirSync(outDir, { recursive: true });
const ROUND = process.env.ROUND || "1";

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5221, 5222, 5223, 5224, 5225];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[post-suite-gate]", ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portInUse(port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: "127.0.0.1", port }, () => { sock.destroy(); resolve(true); });
    sock.on("error", () => resolve(false));
    sock.setTimeout(600, () => { sock.destroy(); resolve(false); });
  });
}
async function probeRoot(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/genesis.html`, { cache: "no-store" });
    if (!r.ok) return false;
    const body = await r.text();
    return body.includes("var U=loadU();") || body.includes("Genesis");
  } catch (e) { return false; }
}
async function startServer() {
  for (const port of PORT_CANDIDATES) {
    if (await portInUse(port)) {
      if (await probeRoot(port)) { log(`port ${port} already serving THIS tree — reusing it`); BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; }
      continue;
    }
    log(`starting python3 -m http.server ${port}`);
    const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
    for (let i = 0; i < 40; i++) {
      if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
      await sleep(150);
    }
    try { proc.kill("SIGTERM"); } catch (e) {}
  }
  throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
}

const SHOT_W = 1600, SHOT_H = 1000;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}
async function newPage(browser) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().endsWith("/favicon.ico")) req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
    else req.continue();
  });
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

async function bootToInSession(page) {
  return await page.evaluate(() => {
    const notes = [];
    try {
      if (typeof startBardo !== "function") return { ok: false, stage: "startBardo-missing" };
      startBardo();
      if (typeof bardoBegin === "function") bardoBegin();
      function autoFillStep(step) {
        if (!step) return;
        try {
          if (step.t === "choose") {
            if (!GS.CGEN[step.field]) {
              const src = step.field === "species" ? SPECIES : step.field === "class" ? CLASSES : BACKGROUNDS;
              const k = Object.keys(src || {})[0]; if (k) cgChoose(step.field, k);
            }
          } else if (step.t === "scores") { while (GS.CGEN.scoreRolls.length < 6) bardoRollScore(); if (!GS.CGEN.assigned) bardoAssign("best"); }
          else if (step.t === "skills") { if (typeof cgSkillAuto === "function") cgSkillAuto(); }
          else if (step.t === "equipment") { if (typeof cgKitAuto === "function") cgKitAuto(); }
          else if (step.t === "tools") { if (typeof cgToolsAuto === "function") cgToolsAuto(); }
          else if (step.t === "languages") { if (typeof cgLangAuto === "function") cgLangAuto(); }
          else if (step.t === "spells") { if (typeof cgSpellsAuto === "function") cgSpellsAuto(); }
          else if (step.t === "feat") { if (typeof cgFeatAuto === "function") cgFeatAuto(); }
          else if (step.t === "life") { if (GS.CGEN.lifeQ && !GS.CGEN.lifeLog[GS.CGEN.lifeI] && typeof bardoLifeRoll === "function") bardoLifeRoll(); }
          else if (step.t === "hometown") { if (!GS.BARDO.rolled[step.key] && typeof bardoRollHometown === "function") bardoRollHometown(); }
          else if (step.t === "world") { if (!GS.BARDO.rolled[step.key] && typeof bardoRollWorld === "function") bardoRollWorld(); }
        } catch (e) { notes.push("autoFillStep threw at " + (step && step.t) + ": " + e.message); }
      }
      const seq = GS.BARDO.seq;
      let guard = 0; const MAX_STEPS = seq.length + 10;
      while (GS.BARDO && GS.BARDO.i < seq.length - 1 && guard < MAX_STEPS) {
        const step = seq[GS.BARDO.i];
        autoFillStep(step);
        if (step && step.t === "life" && GS.CGEN.lifeQ) {
          let lifeGuard = 0;
          while (GS.CGEN.lifeI < GS.CGEN.lifeQ.length - 1 && lifeGuard < 40) { autoFillStep(step); if (typeof bardoLifeStepNext === "function") bardoLifeStepNext(); lifeGuard++; }
          autoFillStep(step); if (typeof bardoLifeStepNext === "function") bardoLifeStepNext();
        }
        bardoAdvance(); guard++;
      }
      const nameEl = document.getElementById("charName");
      if (nameEl) nameEl.value = "Post Suite Gate Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc", notes };
      if (typeof startSession === "function") startSession(world.id);
      showTab("world");
      return { ok: true, notes, worldId: world.id };
    } catch (e) { return { ok: false, stage: "exception", error: e.message, stack: e.stack, notes }; }
  });
}

async function waitForTheater(page) {
  const deadline = Date.now() + 20000;
  let state = null;
  while (Date.now() < deadline) {
    state = await page.evaluate(() => {
      const host = document.getElementById("worldView");
      return {
        theaterMounted: !!(typeof GS !== "undefined" && GS.theaterMounted),
        hasCanvas: !!(host && host.querySelector(".theater-stage-canvas canvas")),
        hasSetInteriorBoard: !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"),
        hasSuiteSeam: !!(window.Theater && typeof window.Theater._postSuiteForTest === "function"),
      };
    });
    if (state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard && state.hasSuiteSeam) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

// Build a deterministic interior board (chrome Hub / gloom+fantasy Spine), same generator family as
// capture-interior-study.mjs. cameraFit optionally forces "beat" mode (for the focal-tracking test).
async function buildScene(page, cfg) {
  return await page.evaluate((cfg) => {
    try {
      function buildFixture(topology, n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const group = topology === "The Hub" ? "hub" : "linear";
        const edges = [];
        if (group === "hub") { const spokeCount = Math.min(n - 1, 4); for (let i = 1; i < n; i++) edges.push([ids[0], ids[Math.min(i, spokeCount)]]); }
        else { for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]); }
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { if (a !== b) { adj[a].push(b); adj[b].push(a); } });
        const depth = { [ids[0]]: 0 }; const q = [ids[0]]; let head = 0;
        while (head < q.length) { const cur = q[head++]; (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } }); }
        return ids.map((id, i) => ({ id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0, exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal" }));
      }
      const fixture = buildFixture(cfg.topology, 6);
      const plan = spatializePlan(fixture, cfg.topology, { walkId: cfg.walkId });
      const semPlan = cfg.residents ? semanticizePlan(plan, fixture, cfg.residents) : plan;
      const focusRoom = semPlan.rooms[0];
      const board = interiorBuildBoard(semPlan, { realmId: cfg.realmId, env: cfg.env, focusSegNum: focusRoom.segNum, radius: 1 });
      if (cfg.lightProfile) board.lightProfile = cfg.lightProfile;
      function piecePositions(room, count) {
        const inX = Math.max(room.x + 1, room.x), inY = Math.max(room.y + 1, room.y);
        const maxX = Math.max(inX, room.x + room.w - 2), maxY = Math.max(inY, room.y + room.d - 2);
        return [{ x: inX, y: inY }, { x: maxX, y: inY }, { x: inX, y: maxY }, { x: maxX, y: maxY }].slice(0, count);
      }
      let pieceCells = null;
      if (cfg.pieces && cfg.pieces.length) {
        const positions = piecePositions(focusRoom, cfg.pieces.length);
        board.pieces = cfg.pieces.map((slug, i) => ({ slug, cellX: positions[i].x, cellY: positions[i].y }));
        pieceCells = positions.map((p) => ({ x: p.x, y: p.y }));
      }
      if (cfg.beat && pieceCells) board.cameraFit = { mode: "beat", cells: pieceCells };
      return { ok: true, board };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, cfg);
}

async function mountAndSettle(page, board) {
  const mounted = await page.evaluate((board) => {
    try { window.Theater.setInteriorBoard(board); return { ok: true, req: window.Theater.interiorPiecesRequested(), res: window.Theater.interiorPiecesResolved() }; }
    catch (e) { return { ok: false, error: e.message }; }
  }, board);
  if (mounted.ok && mounted.req > 0) {
    const deadline = Date.now() + 3500; let latest = mounted;
    while (Date.now() < deadline && latest.res < latest.req) {
      await sleep(200);
      latest = await page.evaluate(() => ({ res: window.Theater.interiorPiecesResolved(), req: window.Theater.interiorPiecesRequested() }));
      // re-mount replays on texture load automatically; nudge a render
      await page.evaluate(() => { try { window.Theater._renderFrameForTest(); } catch (e) {} });
    }
    mounted.res = latest.res;
  }
  return mounted;
}

async function setVariant(page, which) {
  // which: "off" | "dof" | "bloom" | "grade" | "on"
  await page.evaluate((which) => {
    const set = window.Theater._setSuitePassEnabledForTest;
    const only = { dof: which === "dof" || which === "on", bloom: which === "bloom" || which === "on", grade: which === "grade" || which === "on" };
    set("dof", only.dof); set("bloom", only.bloom); set("grade", only.grade);
    try { window.Theater._renderFrameForTest(); } catch (e) {}
  }, which);
  await sleep(120);
  await page.evaluate(() => { try { window.Theater._renderFrameForTest(); } catch (e) {} });
}

async function shoot(page, name) {
  const p = path.join(outDir, name);
  const el = await page.$(".theater-stage-canvas canvas");
  if (el) await el.screenshot({ path: p }); else await page.screenshot({ path: p });
  return p;
}

const SCENES = [
  { key: "chrome", topology: "The Hub", realmId: "chrome", env: "dungeon", walkId: "ps-chrome", residents: null, lightProfile: "lamplit", pieces: ["Wolf", "Giant Rat", "Spider", "Knight"] },
  { key: "gloom", topology: "The Spine", realmId: "gloom", env: "dungeon", walkId: "ps-gloom", residents: [{ segNum: 1, scaleVsHuman: 2.5, apex: false }], lightProfile: "torchlit", pieces: ["Ogre Zombie", "Skeleton", "Zombie", "Guard"] },
  { key: "fantasy", topology: "The Spine", realmId: "fantasy", env: "dungeon", walkId: "ps-fantasy", residents: null, lightProfile: "torchlit", pieces: ["Wolf", "Zombie", "Ape", "Guard"] },
];
const VARIANTS = ["off", "dof", "bloom", "grade", "on"];

async function main() {
  const findings = { generatedAt: new Date().toISOString(), round: ROUND, scenes: {}, asserts: {}, notes: [] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none!important;visibility:hidden!important}" });
    const boot = await bootToInSession(page);
    findings.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const ts = await waitForTheater(page);
    findings.theaterState = ts;
    if (!ts || !ts.hasSuiteSeam) throw new Error("post-suite seam never available: " + JSON.stringify(ts));

    const shots = [];
    for (const scene of SCENES) {
      const built = await buildScene(page, scene);
      if (!built.ok) { findings.notes.push(`scene ${scene.key} build FAILED: ${built.error}`); continue; }
      const mounted = await mountAndSettle(page, built.board);
      findings.scenes[scene.key] = { mounted, suite: null, variants: [] };
      if (!mounted.ok) { findings.notes.push(`scene ${scene.key} mount FAILED: ${mounted.error}`); continue; }
      const suite = await page.evaluate(() => window.Theater._postSuiteForTest());
      findings.scenes[scene.key].suite = suite;

      for (const v of VARIANTS) {
        await setVariant(page, v);
        const name = `${scene.key}-${v}.png`;
        await shoot(page, name);
        shots.push({ scene: scene.key, variant: v, name });
        findings.scenes[scene.key].variants.push(v);
      }
    }

    // ── ASSERT 1: DoF focal tracking — beat vs room focus distance on the fantasy scene.
    {
      const roomBuilt = await buildScene(page, { ...SCENES[2], beat: false });
      await mountAndSettle(page, roomBuilt.board);
      const roomFocus = await page.evaluate(() => window.Theater.dofFocus());
      const beatBuilt = await buildScene(page, { ...SCENES[2], walkId: "ps-fantasy-beat", beat: true });
      await mountAndSettle(page, beatBuilt.board);
      const beatFocus = await page.evaluate(() => window.Theater.dofFocus());
      findings.asserts.dofFocalTracking = {
        roomDist: roomFocus.dist, beatDist: beatFocus.dist,
        roomFocusV: roomFocus.focusV, beatFocusV: beatFocus.focusV,
        differs: Math.abs(roomFocus.dist - beatFocus.dist) > 0.5,
      };
    }

    // ── ASSERT 2: bloom negative control. Re-mount gloom (has a lantern). Capture off vs bloom-only,
    // compare mean-abs pixel diff in an ALBEDO region (lower-centre, lit sprite bodies) vs an EMISSIVE
    // region (upper area near the lantern glow). Albedo diff must be << emissive diff.
    {
      const gb = await buildScene(page, SCENES[1]);
      await mountAndSettle(page, gb.board);
      await setVariant(page, "off");
      const offPng = await shoot(page, "neg-control-off.png");
      await setVariant(page, "bloom");
      const bloomPng = await shoot(page, "neg-control-bloom.png");
      const diff = await page.evaluate(async ({ offB64, bloomB64 }) => {
        function load(b64) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = "data:image/png;base64," + b64; }); }
        const [a, b] = await Promise.all([load(offB64), load(bloomB64)]);
        const w = a.width, h = a.height;
        const ca = document.createElement("canvas"); ca.width = w; ca.height = h; const xa = ca.getContext("2d"); xa.drawImage(a, 0, 0);
        const cb = document.createElement("canvas"); cb.width = w; cb.height = h; const xb = cb.getContext("2d"); xb.drawImage(b, 0, 0);
        function meanAbs(x0, y0, x1, y1) {
          const da = xa.getImageData(x0, y0, x1 - x0, y1 - y0).data;
          const db = xb.getImageData(x0, y0, x1 - x0, y1 - y0).data;
          let s = 0, n = 0;
          for (let i = 0; i < da.length; i += 4) { s += Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]); n += 3; }
          return s / Math.max(1, n);
        }
        // emissive band: top-right quadrant (lantern sits upper-right in the gloom scene); albedo band:
        // lower-centre (sprite bodies / floor).
        const emissive = meanAbs(Math.floor(w * 0.55), Math.floor(h * 0.02), Math.floor(w * 0.80), Math.floor(h * 0.30));
        const albedo = meanAbs(Math.floor(w * 0.05), Math.floor(h * 0.55), Math.floor(w * 0.40), Math.floor(h * 0.85));
        return { emissive, albedo };
      }, { offB64: fs.readFileSync(offPng).toString("base64"), bloomB64: fs.readFileSync(bloomPng).toString("base64") });
      // The LAW is "a lit-albedo sprite must not bloom" — i.e. the albedo region is essentially
      // untouched (tiny ABSOLUTE diff on the 0-255 scale), while the emissive region (flame/cone) does
      // change. Absolute albedo epsilon, plus emissive-moves-more, states that directly.
      findings.asserts.bloomNegativeControl = { ...diff, gated: diff.albedo < 4.0 && diff.emissive > diff.albedo };
    }

    // ── ASSERT 3: grade determinism — same realm mounted twice yields identical grade uniforms.
    {
      const g1 = await buildScene(page, SCENES[0]); await mountAndSettle(page, g1.board);
      const s1 = await page.evaluate(() => window.Theater._postSuiteForTest().grade);
      const g2 = await buildScene(page, SCENES[0]); await mountAndSettle(page, g2.board);
      const s2 = await page.evaluate(() => window.Theater._postSuiteForTest().grade);
      findings.asserts.gradeDeterminism = { s1, s2, identical: JSON.stringify(s1) === JSON.stringify(s2) };
    }

    // ── ASSERT 4: fps with ALL passes live. Back-to-back synchronous renders over the on-variant chain.
    {
      const gb = await buildScene(page, SCENES[1]); await mountAndSettle(page, gb.board);
      await setVariant(page, "on");
      const fps = await page.evaluate(() => {
        const N = 120; const t0 = performance.now();
        for (let i = 0; i < N; i++) { window.Theater._renderFrameForTest(); }
        const dt = performance.now() - t0;
        return { frames: N, ms: dt, fps: (N * 1000) / dt };
      });
      findings.asserts.fpsAllPasses = fps;
    }

    findings.consoleErrors = await page.evaluate(() => window.__bgConsoleErrors || []);

    // ── contact sheet round-N.png (scenes x variants grid)
    if (shots.length) {
      const cols = VARIANTS.length, rows = SCENES.length;
      const cellW = 300, cellH = 190, labelH = 20, pad = 6;
      const images = shots.map((s) => ({ ...s, b64: fs.readFileSync(path.join(outDir, s.name)).toString("base64") }));
      const sheetB64 = await page.evaluate(({ images, cols, rows, cellW, cellH, labelH, pad, variants, scenes }) => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas");
          canvas.width = cols * (cellW + pad) + pad; canvas.height = rows * (cellH + labelH + pad) + pad + labelH;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#eee"; ctx.font = "13px monospace";
          variants.forEach((lbl, ci) => ctx.fillText(lbl, pad + ci * (cellW + pad) + 4, labelH - 6));
          let loaded = 0;
          images.forEach((img) => {
            const im = new Image();
            im.onload = () => {
              const ri = scenes.indexOf(img.scene), ci = variants.indexOf(img.variant);
              const x = pad + ci * (cellW + pad), y = labelH + pad + ri * (cellH + labelH + pad) + labelH;
              ctx.drawImage(im, x, y, cellW, cellH);
              ctx.fillStyle = "#eee"; ctx.font = "11px monospace"; ctx.fillText(img.scene + "/" + img.variant, x + 4, y + cellH + 13);
              loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]);
            };
            im.onerror = () => { loaded++; if (loaded === images.length) resolve(canvas.toDataURL("image/png").split(",")[1]); };
            im.src = "data:image/png;base64," + img.b64;
          });
        });
      }, { images, cols, rows, cellW, cellH, labelH, pad, variants: VARIANTS, scenes: SCENES.map((s) => s.key) });
      fs.writeFileSync(path.join(outDir, `round-${ROUND}.png`), Buffer.from(sheetB64, "base64"));
    }

    fs.writeFileSync(path.join(outDir, "findings.json"), JSON.stringify(findings, null, 2));
    log("DONE. asserts:", JSON.stringify(findings.asserts, null, 2));
  } finally {
    if (browser) await browser.close();
    if (server && server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}
main().catch((e) => { console.error("[post-suite-gate] FATAL", e); process.exit(1); });
