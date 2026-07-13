#!/usr/bin/env node
/* dev/verify-transparent-material-contract.mjs — GP-1 (docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md S7
   "R6: Transparency and WBOIT" S7.1, docs/GRAPHICS-CONVERGENCE-PLAN.md Phase 0 GP-1 row) — the
   material-census half of Wave GP-1 ("Agent B owns dev/verify-transparent-material-contract.mjs
   only").

   CHARTER S7 STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md):
     - Convergence rung advanced: C7 (performance/classification tooling makes the result sustainable).
     - Canonical contracts preserved: dev-only, NEW path, zero edits to src/. Reads the existing
       inventory seam (window.Theater._graphicsResearchContextForTest, already on master) to reach the
       live scene's real THREE.Material instances — classifies them, mutates nothing.
     - Fixtures/refs for acceptance: the same row-101 Grand Octagon fixture
       dev/battle-gate/capture-gpu-telemetry.mjs and capture-wall-volumes.mjs use, mounted with
       lightProfile="lamplit" + two creature standees so the live scene actually contains all three
       transparency classes RESEARCH-WAVE S7.1 names (sprite/light-card alpha-tested cutouts, light-
       cone/mote additive FX, per-piece contact-shadow-pool normal-alpha solids) rather than an empty
       room's architecture-only material set.
     - Negative control: this is a classification harness, not a numeric-growth comparison — its
       negative control is RED-FIRST-shaped: report is DATA (every material's classification +
       depth-state), not a hand-picked assertion list. A deliberately-broken material (see
       `--inject-fault` below) proves the harness actually flags contract violations instead of
       rubber-stamping green.
     - Classification: dev harness (research-only instrumentation). No runtime behavior change: reads
       material properties off the live production scene; writes nothing back to any material.

   FIX CLASSIFICATION (RESEARCH-WAVE S7.1) — every material that participates in transparency behavior
   (transparent===true OR alphaTest>0 OR blending===AdditiveBlending) must resolve to EXACTLY one of:
     - alpha-tested cutout   : alphaTest>0 (sprites/dressing) — MUST keep ordinary depth writing
                                (depthWrite !== false) and is excluded from OIT by definition.
     - additive FX           : blending===AdditiveBlending, no alphaTest — MUST have depthWrite===false
                                and is excluded from OIT by definition.
     - normal-alpha solid    : transparent===true, no alphaTest, not additive — the ONLY class that is
                                an OIT candidate (spectral bodies/liquids/glass/fading upper geometry).
   A material matching more than one rule (e.g. alphaTest>0 AND AdditiveBlending at once) is AMBIGUOUS
   and flagged, not silently bucketed. A material matching none of the three (transparent===false,
   alphaTest===0, ordinary blending) is OPAQUE — outside this contract's scope entirely, reported for
   completeness but never counted against it.

   OIT NOTE: Genesis has NOT implemented WBOIT/any OIT layer yet (RESEARCH-WAVE S7.2 rejects
   unmodified three-wboit and whole-scene WBOIT outright; a future fxOit scene is deferred). "excluded
   from OIT" is therefore currently VACUOUSLY true for every alpha-tested/additive material — there is
   no OIT pass for them to leak into. This script records that fact rather than asserting it as a
   fabricated pass.

   Run:  node dev/verify-transparent-material-contract.mjs
   Output: dev/battle-gate/material-contract/{scene.png,contract.json}; prints a PASS/FLAGGED summary;
           exits non-zero only if the boot/mount itself fails (misclassification is reported as DATA,
           per this task's own instruction — "flag it", not "fail the run" — see contract.json's own
           `flagged` array for anything that needs human/Codex attention). */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, ".."); // this script lives directly in dev/, repo root is its parent
const outDir = path.join(repoRoot, "dev", "battle-gate", "material-contract");
fs.mkdirSync(outDir, { recursive: true });

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5291, 5292, 5293, 5294, 5295];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[material-contract]", ...a); }
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
    log(`starting python3 -m http.server ${port} (bind 127.0.0.1) in ${repoRoot}`);
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
    if (req.url().endsWith("/favicon.ico")) {
      req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
    } else req.continue();
  });
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// bootToInSession — same convention as capture-gpu-telemetry.mjs / capture-wall-volumes.mjs.
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
              const k = Object.keys(src || {})[0];
              if (k) cgChoose(step.field, k);
            }
          } else if (step.t === "scores") {
            while (GS.CGEN.scoreRolls.length < 6) bardoRollScore();
            if (!GS.CGEN.assigned) bardoAssign("best");
          } else if (step.t === "skills") { if (typeof cgSkillAuto === "function") cgSkillAuto(); }
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
      if (nameEl) nameEl.value = "Material Contract Gate Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found", notes };
      if (typeof startSession === "function") { startSession(world.id); notes.push("startSession() called"); }
      showTab("world");
      return { ok: true, notes, worldId: world.id, worldName: world.name };
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
        hasBattleStage: !!(host && host.querySelector(".game.battle-stage")),
        theaterMounted: !!(typeof GS !== "undefined" && GS.theaterMounted),
        hasCanvas: !!(host && host.querySelector(".theater-stage-canvas canvas")),
        hasSetInteriorBoard: !!(window.Theater && typeof window.Theater.setInteriorBoard === "function"),
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas && state.hasSetInteriorBoard) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

// buildScene — verbatim (fixture + probe standees) from capture-gpu-telemetry.mjs's own buildScene at
// radius:1, so the material census sees the full multi-room palette (both neighbor chambers' own
// walls/floors/lights, not just the hub octagon).
async function buildScene(page) {
  return await page.evaluate(() => {
    try {
      const fixture = [
        { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
          exits: [{ targetId: "s2" }, { targetId: "s3" }],
          light: "normal", areaType: "Grand Octagon", dims: "60' x 60'" },
        { id: "s2", num: 2, label: "s2", isFinale: false, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
        { id: "s3", num: 3, label: "s3", isFinale: true, depth: 1,
          exits: [{ targetId: "s1" }], light: "normal", areaType: "Standard Chamber", dims: "20' x 20' square" },
      ];
      const plan = spatializePlan(fixture, "The Hub", { walkId: "material-contract-gate-octagon" });
      const semPlan = semanticizePlan ? semanticizePlan(plan, fixture, null) : plan;
      const focusRoom = semPlan.rooms.find((r) => r.segId === "s1");
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(semPlan, { realmId: "gloom", env: "dungeon", focusSegNum, radius: 1 });
      board.lightProfile = "lamplit";
      const cells = (focusRoom.cells || []).slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
      const cellA = cells[Math.floor(cells.length / 3)] || cells[0];
      const cellB = cells[Math.floor(cells.length * 2 / 3)] || cells[cells.length - 1];
      board.pieces = [
        { slug: "Skeleton", fid: "contract-probe-a", cellX: cellA.x, cellY: cellA.y },
        { slug: "Skeleton", fid: "contract-probe-b", cellX: cellB.x, cellY: cellB.y },
      ];
      return { ok: true, board, roomShape: focusRoom.shape, roomCellCount: cells.length };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

async function pollPiecesResolved(page) {
  const deadline = Date.now() + 6000;
  let r = null;
  while (Date.now() < deadline) {
    r = await page.evaluate(() => ({
      resolved: window.Theater.interiorPiecesResolved(),
      requested: window.Theater.interiorPiecesRequested(),
      fileTexPending: window.Theater.interiorFileTexPending(),
    }));
    if (r.resolved >= r.requested && r.fileTexPending === 0) return r;
    await sleep(200);
  }
  return r;
}

// classifyMaterials — runs IN-PAGE and returns a JSON-safe classification report per RESEARCH-WAVE
// S7.1's 3-class rule. `injectFault` (bool) is the negative control: when true, this ALSO synthesizes
// one deliberately-broken material (additive FX with depthWrite left true, the exact "verb fades and
// particles become transparent without disabling depth writes" defect class S7.1 names) purely in the
// returned data — it is never attached to the live scene, so it proves the CLASSIFIER catches a
// violation without mutating anything real.
async function classifyMaterials(page, injectFault) {
  return await page.evaluate((injectFault) => {
    const ctx = window.Theater._graphicsResearchContextForTest();
    const scene = ctx.scene;
    // theater-boot.js does `import * as THREE from "three"` (an ES module import binding, genesis.html
    // S1206's importmap) — NOT `window.THREE = THREE` — so the global THREE this page-context function
    // needs isn't reachable from here. Rather than add a new production seam for it, this uses THREE's
    // own stable, documented Blending enum integer values directly (Constants.js: NoBlending=0,
    // NormalBlending=1, AdditiveBlending=2, SubtractiveBlending=3, MultiplyBlending=4,
    // CustomBlending=5 — unchanged across three.js's public API for years).
    const ADDITIVE_BLENDING = 2;
    const seen = new Map(); // uuid -> record
    function recordOwner(rec, obj, slot) {
      rec.owners.push({ objectType: obj.type || "Object3D", objectName: obj.name || null, slot });
    }
    function classify(m) {
      const additive = m.blending === ADDITIVE_BLENDING;
      const alphaTested = (m.alphaTest || 0) > 0;
      const transparent = !!m.transparent;
      let cls, violations = [];
      if (alphaTested && additive) {
        cls = "ambiguous";
        violations.push("alphaTest>0 AND blending=AdditiveBlending simultaneously — cutout and additive-FX rules conflict (S7.1 defines these as mutually exclusive classes).");
      } else if (alphaTested) {
        cls = "alpha-tested-cutout";
        if (m.depthWrite === false) violations.push("alpha-tested cutout has depthWrite=false — S7.1 requires cutouts to keep ORDINARY depth writing.");
      } else if (additive) {
        cls = "additive-fx";
        if (m.depthWrite !== false) violations.push("additive FX material has depthWrite!==false — S7.1 requires additive FX to keep depthWrite=false (the depth-state defect class: 'becomes transparent without disabling depth writes').");
      } else if (transparent) {
        cls = "normal-alpha-solid";
      } else {
        cls = "opaque";
      }
      return { cls, violations, flags: { alphaTested, additive, transparent, depthWrite: m.depthWrite !== false, blending: blendingName(m.blending) } };
    }
    function blendingName(b) {
      const map = { 0: "NoBlending", 1: "NormalBlending", 2: "AdditiveBlending", 3: "SubtractiveBlending", 4: "MultiplyBlending", 5: "CustomBlending" };
      return map[b] != null ? map[b] : String(b);
    }
    function visit(m, obj, slot) {
      if (!m || !m.uuid) return;
      let rec = seen.get(m.uuid);
      if (!rec) {
        const c = classify(m);
        rec = { uuid: m.uuid, type: m.type || "Material", owners: [], ...c };
        seen.set(m.uuid, rec);
      }
      recordOwner(rec, obj, slot);
    }
    if (scene) scene.traverse((obj) => {
      const list = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
      list.forEach((m, i) => visit(m, obj, list.length > 1 ? "material[" + i + "]" : "material"));
      if (obj.customDepthMaterial) visit(obj.customDepthMaterial, obj, "customDepthMaterial");
      if (obj.customDistanceMaterial) visit(obj.customDistanceMaterial, obj, "customDistanceMaterial");
    });
    const records = Array.from(seen.values());
    const byClass = {};
    records.forEach((r) => { byClass[r.cls] = (byClass[r.cls] || 0) + 1; });
    const flagged = records.filter((r) => r.cls === "ambiguous" || r.violations.length > 0)
      .map((r) => ({ uuid: r.uuid, type: r.type, cls: r.cls, violations: r.violations, flags: r.flags, ownerSample: r.owners.slice(0, 3) }));

    // negative control: a SYNTHETIC record (never attached to any real object) proving the same
    // classify() function DOES flag a known-bad case — additive FX with depthWrite left at its
    // THREE.js default (true) instead of the required false.
    let negativeControl = null;
    if (injectFault) {
      const fakeMat = { uuid: "SYNTHETIC-NEGATIVE-CONTROL-0001", type: "MeshBasicMaterial", blending: ADDITIVE_BLENDING, transparent: true, alphaTest: 0, depthWrite: true };
      const c = classify(fakeMat);
      negativeControl = {
        description: "synthetic additive-FX material with depthWrite left true (never attached to the live scene) — proves classify() catches the depth-state defect S7.1 names, not just rubber-stamps whatever it's handed.",
        input: { blending: "AdditiveBlending", transparent: true, alphaTest: 0, depthWrite: true },
        result: c,
        caught: c.cls === "additive-fx" && c.violations.length === 1,
      };
    }

    return {
      totalUniqueMaterials: records.length,
      byClass,
      records: records.map((r) => ({ uuid: r.uuid, type: r.type, cls: r.cls, violations: r.violations, flags: r.flags, ownerCount: r.owners.length, ownerSample: r.owners.slice(0, 3) })),
      flagged,
      negativeControl,
      oitNote: "No fxOit scene/layer exists in production yet (RESEARCH-WAVE S7.2 rejects whole-scene WBOIT and unmodified three-wboit; a dedicated fxOit layer is deferred). 'excluded from OIT' is therefore vacuously true for every alpha-tested-cutout and additive-fx material right now — there is no OIT pass for them to leak into. This assertion becomes load-bearing once a GP-4/R6 OIT layer actually lands.",
    };
  }, injectFault);
}

async function main() {
  const contract = { generatedAt: new Date().toISOString(), unit: "GP-1", fixture: "row-101 Grand Octagon, hub + 2 neighbor chambers, 2x Skeleton standee, lightProfile=lamplit", classes: ["alpha-tested-cutout", "additive-fx", "normal-alpha-solid"] };
  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const boot = await bootToInSession(page);
    contract.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));

    const theaterState = await waitForTheater(page);
    contract.theaterState = theaterState;
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("window.Theater.setInteriorBoard never became available: " + JSON.stringify(theaterState));

    const built = await buildScene(page);
    contract.built = { ok: built.ok, error: built.error, roomShape: built.roomShape, roomCellCount: built.roomCellCount };
    if (!built.ok) throw new Error("scene build FAILED: " + built.error);
    log(`scene built: shape=${built.roomShape} cells=${built.roomCellCount}`);

    await page.evaluate(() => { window.Theater.setInteriorVariant({ shotCompose: false }); });
    const mounted = await page.evaluate((board) => {
      try { window.Theater.setInteriorBoard(board); return { ok: true }; }
      catch (e) { return { ok: false, error: e.message }; }
    }, built.board);
    contract.mounted = mounted;
    if (!mounted.ok) throw new Error("setInteriorBoard FAILED: " + mounted.error);

    contract.resolvedState = await pollPiecesResolved(page);
    await sleep(300);
    await page.evaluate(() => { if (window.Theater._renderFrameForTest) window.Theater._renderFrameForTest(); });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

    const shotPath = path.join(outDir, "scene.png");
    await page.screenshot({ path: shotPath, fullPage: false });
    log("captured scene.png");

    const classification = await classifyMaterials(page, true);
    Object.assign(contract, classification);

    contract.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    contract.consoleErrorsCount = contract.consoleErrors.length;
    contract.noRuntimeBehaviorChangeNote = "This harness calls ONLY the production setInteriorBoard mount call plus the existing TEST-ONLY read seam _graphicsResearchContextForTest (already on master). Materials are read and classified; none is ever assigned to or mutated. The synthetic negative-control material above is a plain JS object never attached to any Object3D or the scene graph.";

    const flaggedCount = contract.flagged ? contract.flagged.length : 0;
    fs.writeFileSync(path.join(outDir, "contract.json"), JSON.stringify(contract, null, 2));
    log(`wrote contract.json — ${contract.totalUniqueMaterials} unique materials, byClass=${JSON.stringify(contract.byClass)}, flagged=${flaggedCount}, negativeControl.caught=${contract.negativeControl && contract.negativeControl.caught}`);
    if (flaggedCount > 0) log(`NOTE: ${flaggedCount} material(s) flagged — see contract.json's own "flagged" array. Per this unit's own charge, this is DATA for Codex/human review, not a hard gate failure.`);
    if (!contract.negativeControl || !contract.negativeControl.caught) { log("WARNING: negative control did not fire as expected — the classifier may not be catching real defects"); process.exitCode = 1; }
  } catch (e) {
    contract.error = e.message;
    fs.writeFileSync(path.join(outDir, "contract.json"), JSON.stringify(contract, null, 2));
    log("FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
