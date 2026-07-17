#!/usr/bin/env node
/* KGR-7 walk-truth capture — the gameplay-first acceptance rig.
   Boots the REAL game (genesis.html, production manifest, real Chrome/WebGL), rolls a REAL world
   and session, services prep exactly the way the DM seat does ({type:"prep_applied"} through
   applyEvent), walks into a rolled dungeon frontier ({type:"start_walk"}), lets the PRODUCTION
   render path mount the volumetric interior, and captures the actual engine frame plus a full
   noun->realization diagnosis. Nothing here hand-authors a plan, a dressing array, or a noun —
   OPERATION §15's answer to rect.png being a controlled scene and the live capture being blank.

   Determinism: Math.random is seeded (mulberry32) before any page script runs, so the SAME seed
   rolls the SAME world/walk — the before/after pair compares one canonical walk under two
   registry/rule states. spatializePlan is walkId-seeded and unaffected.

   Determinism amendment: the page consumes entropy beyond Math.random (Date-derived ids), so a
   seed alone does NOT re-roll the identical world. The canonical fixture is therefore the game's
   own persistence law — the world IS the save file: the before run saves the full U state to
   kgr7-world-state.json, and --restore renders THAT world again (same canonical walk, same prep,
   same active segment) under the current engine. Before/after compare one world, never two rolls.

   Usage: node dev/battle-gate/capture-kgr7-walk-truth.mjs --label before [--seed 20260717]
          node dev/battle-gate/capture-kgr7-walk-truth.mjs --label after --restore dev/battle-gate/kgr7-walk-truth/kgr7-world-state.json
   Outputs under dev/battle-gate/kgr7-walk-truth/:
     kgr7-<label>-preprep.png   the first frontier render BEFORE prep is serviced (the honest
                                reproduction of the blank/flat live-playtest state)
     kgr7-<label>.png           the settled volumetric interior of the rolled walk
     kgr7-<label>-diagnosis.json  walk nouns, dressing entries, rule matches, realization stamps */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createWorkbenchServer } from "../model-foundry/kenney-workbench-server.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "dev/battle-gate/kgr7-walk-truth");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
const SEED = parseInt(args.seed ?? "20260717", 10) >>> 0;
const LABEL = args.label || "probe";
const MAX_WORLDS = parseInt(args.worlds ?? "8", 10);

mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(done => setTimeout(done, ms));
function listen(server) { return new Promise((ok, bad) => { server.once("error", bad); server.listen(0, "127.0.0.1", () => ok(server.address().port)); }); }
async function doubleFrame(page) { await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))); }
async function canvasShot(page) {
  await doubleFrame(page); await sleep(150);
  const canvas = await page.$(".theater-stage-canvas canvas");
  if (!canvas) throw new Error("gameplay canvas missing");
  return await canvas.screenshot({ encoding: "base64" });
}

/* Same real-bardo boot the KGR-6 rig used: production character/world creation, no shortcuts. */
async function bootToInSession(page) {
  return page.evaluate(() => {
    try {
      startBardo(); if (typeof bardoBegin === "function") bardoBegin();
      function fill(step) {
        if (!step) return;
        if (step.t === "choose" && !GS.CGEN[step.field]) { const src = step.field === "species" ? SPECIES : step.field === "class" ? CLASSES : BACKGROUNDS; cgChoose(step.field, Object.keys(src)[0]); }
        else if (step.t === "scores") { while (GS.CGEN.scoreRolls.length < 6) bardoRollScore(); if (!GS.CGEN.assigned) bardoAssign("best"); }
        else if (step.t === "skills" && typeof cgSkillAuto === "function") cgSkillAuto();
        else if (step.t === "equipment" && typeof cgKitAuto === "function") cgKitAuto();
        else if (step.t === "tools" && typeof cgToolsAuto === "function") cgToolsAuto();
        else if (step.t === "languages" && typeof cgLangAuto === "function") cgLangAuto();
        else if (step.t === "spells" && typeof cgSpellsAuto === "function") cgSpellsAuto();
        else if (step.t === "feat" && typeof cgFeatAuto === "function") cgFeatAuto();
        else if (step.t === "life" && GS.CGEN.lifeQ && !GS.CGEN.lifeLog[GS.CGEN.lifeI]) bardoLifeRoll();
        else if (step.t === "hometown" && !GS.BARDO.rolled[step.key]) bardoRollHometown();
        else if (step.t === "world" && !GS.BARDO.rolled[step.key]) bardoRollWorld();
      }
      let guard = 0; while (GS.BARDO.i < GS.BARDO.seq.length - 1 && guard++ < GS.BARDO.seq.length + 10) { const step = GS.BARDO.seq[GS.BARDO.i]; fill(step); if (step?.t === "life" && GS.CGEN.lifeQ) { let g = 0; while (GS.CGEN.lifeI < GS.CGEN.lifeQ.length - 1 && g++ < 40) { fill(step); bardoLifeStepNext(); } fill(step); bardoLifeStepNext(); } bardoAdvance(); }
      document.getElementById("charName").value = "KGR-7 Witness"; (bardoWake || bardoFound)();
      const world = activeWorld(); startSession(world.id); showTab("world"); return { ok: true, worldId: world.id, worldName: world.name };
    } catch (error) { return { ok: false, error: error.message, stack: error.stack }; }
  });
}
async function waitTheater(page) {
  await page.waitForFunction(() => window.Theater && typeof Theater.setInteriorBoard === "function" && document.querySelector(".theater-stage-canvas canvas"), { timeout: 30000 });
}

const server = createWorkbenchServer({
  root: ROOT,
  calibrationPath: join(ROOT, "dev/model-foundry/kenney-calibration.json"),
  censusPath: join(ROOT, "dev/model-foundry/kenney-census.json"),
});
const port = await listen(server); const BASE = `http://127.0.0.1:${port}`;
const require = createRequire(import.meta.url);
const puppeteer = require(join(process.env.HOME, ".genesis-jsdom/node_modules/puppeteer-core"));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--disable-gpu-sandbox", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"], defaultViewport: { width: 1440, height: 960, deviceScaleFactor: 2 } });

const consoleErrors = [];
/* Shared back half: wait for the production interior, settle assets, dump the diagnosis, shoot. */
async function settleDiagnoseCapture(page, meta) {
  // Wait for the production render to mount the volumetric interior, then settle assets.
  await page.waitForFunction(() => {
      const w = activeWorld();
      const src = (typeof theaterHereSourceFor === "function") ? theaterHereSourceFor(w) : null;
      return src && src.kind === "interior" && !!Theater._interiorRoomShellForTest?.();
    }, { timeout: 30000 });
    await page.waitForNetworkIdle({ idleTime: 1500, timeout: 60000 }).catch(() => {});
    // Donor settle: wait for every stamped visualAsset's template so the capture never races the
    // async GLB load + board replay (the invalid KGR-6 live capture was exactly a timing race).
    const stampedDonors = await page.evaluate(() => {
      const source = theaterHereSourceFor(activeWorld());
      if (!source || source.kind !== "interior") return [];
      const board = trayFrom(source, null, { beat: null });
      return (board.dressing || []).filter(e => e.visualAsset && e.visualAsset.placementStatus !== "fallback-overlap")
        .map(e => [e.visualAsset.pack, e.visualAsset.slug]);
    });
    if (stampedDonors.length) {
      await page.waitForFunction(rows => rows.every(([pack, slug]) => Theater._donorTemplateReadyForTest(pack, slug, "fantasy")), { timeout: 60000 }, stampedDonors).catch(() => {});
      await page.evaluate(() => { if (typeof renderWorld === "function") renderWorld(); });
    }
    await sleep(1500); await doubleFrame(page);

    // Full noun->realization diagnosis off the LIVE here-source, through the real seam.
    const diagnosis = await page.evaluate(() => {
      const w = activeWorld();
      const source = theaterHereSourceFor(w);
      const walk = source.walk || null;
      const seg = source.segment || null;
      const board = trayFrom(source, null, { beat: null });
      const entryView = e => ({
        sourceRef: e.sourceRef ?? null, slug: e.slug ?? null, realmPropName: e.realmPropName ?? null,
        role: e.role ?? null, primary: e.primary ?? null, cardKind: e.cardKind ?? null,
        renderStrategy: e.renderStrategy ?? null, projected: !!e.projected, count: e.count ?? null,
        x: e.x, y: e.y, roomSegNum: e.roomSegNum ?? null,
        visualAsset: e.visualAsset ? { assetId: e.visualAsset.assetId, resolutionRule: e.visualAsset.resolutionRule, placementStatus: e.visualAsset.placementStatus, mountSocket: e.visualAsset.mountSocket } : null,
      });
      const segNouns = seg ? {
        num: seg.num, label: seg.label ?? null, areaType: seg.areaType ?? null, segType: seg.segType ?? null,
        feature: seg.feature ?? null, object: seg.object ?? null, dressing: seg.dressing ?? null,
        atmo: seg.atmo ?? null, encounter: seg.encounter ? { type: seg.encounter.type } : null,
      } : null;
      const deckCards = (walk && walk.deck && Array.isArray(walk.deck.cards)) ? walk.deck.cards.map(c => ({
        id: c.id, role: c.role ?? null, homeSegNum: c.homeSegNum ?? null, sourceRef: c.sourceRef ?? null,
        slug: (c.visual && c.visual.slug) ?? null, presentation: (c.visual && c.visual.presentation) ?? null,
        count: c.count ?? null,
      })) : null;
      return {
        world: { id: w.id, name: w.name }, hereKind: source.kind, walkId: source.walkId ?? null,
        realms: { active: (typeof theaterActiveRealmsFor === "function") ? theaterActiveRealmsFor(w) : null, sourceRealms: source.realms ?? null, walkSkin: (walk && walk.skin) ?? null },
        walk: walk ? { environment: walk.environment ?? null, topology: walk.topology ?? null, segments: (walk.segments || []).length, explicitDeal: !!(walk.deck && walk.deck.cards) } : null,
        activeSegment: segNouns, deckCards,
        allSegments: walk ? (walk.segments || []).map(s => ({
          num: s.num, label: s.label ?? null, areaType: s.areaType ?? null, isFinale: !!s.isFinale,
          feature: s.feature ? { name: s.feature.name, flavor: s.feature.flavor } : null,
          object: s.object ? { name: s.object.name, flavor: s.object.flavor } : null,
          dressing: s.dressing ? { text: s.dressing.text, condition: s.dressing.condition } : null,
          encounter: s.encounter ? { type: s.encounter.type } : null,
        })) : null,
        plan: source.plan ? { rooms: (source.plan.rooms || []).length, cellW: source.plan.cellW, cellD: source.plan.cellD } : null,
        boardDressing: (board.dressing || []).map(entryView),
        boardInteractables: (board.interactables || []).map(i => ({ sourceRef: i.sourceRef ?? null, archetype: i.archetype ?? null, slug: i.slug ?? null, x: i.x, y: i.y })),
        projection: board.projection ? { density: board.projection.density, stageNow: board.projection.stageNow.map(c => ({ id: c.id, role: c.role, slug: c.slug, sourceRef: c.sourceRef, count: c.count })), narrateNow: board.projection.narrateNow.length, reserve: board.projection.reserve.length } : null,
        realization: {
          rulesLoaded: (typeof KENNEY_VISUAL_RULES !== "undefined") ? KENNEY_VISUAL_RULES.length : null,
          runtimeAssets: (typeof KENNEY_RUNTIME_ASSETS !== "undefined") ? Object.keys(KENNEY_RUNTIME_ASSETS).length : null,
          registryHash: (typeof KENNEY_RUNTIME_REGISTRY_HASH !== "undefined") ? KENNEY_RUNTIME_REGISTRY_HASH : null,
          stamped: (board.dressing || []).filter(e => e.visualAsset).length,
          unmatched: (board.dressing || []).filter(e => !e.visualAsset).length,
        },
        mounted: { dressingWorld: Theater.interiorDressingWorldPositions?.() ?? null, shell: !!Theater._interiorRoomShellForTest?.() },
      };
    });

  const frame = await canvasShot(page);
  writeFileSync(join(OUT, `kgr7-${LABEL}.png`), Buffer.from(frame, "base64"));
  diagnosis.meta = Object.assign({ label: LABEL, base: BASE, consoleErrors: consoleErrors.slice() }, meta);
  writeFileSync(join(OUT, `kgr7-${LABEL}-diagnosis.json`), JSON.stringify(diagnosis, null, 2) + "\n");
  console.log(`KGR-7 ${LABEL}: world "${diagnosis.world.name}" · ${diagnosis.realization.stamped} realized / ${diagnosis.realization.unmatched} unmatched dressing entries · frame + diagnosis written`);
  return diagnosis;
}

function attach404Logging(page, notFound) {
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", error => consoleErrors.push(error.message));
  page.on("response", response => { if (response.status() === 404) notFound.push(response.url()); });
}

try {
  if (args.restore) {
    // Render the SAVED canonical world under the current engine — the world is the save file.
    const state = readFileSync(resolve(args.restore), "utf8");
    const page = await browser.newPage();
    const notFound = [];
    attach404Logging(page, notFound);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none!important;visibility:hidden!important}" });
    await page.waitForNetworkIdle({ idleTime: 800, timeout: 30000 }).catch(() => {});
    const restored = await page.evaluate(payload => {
      try {
        const parsed = JSON.parse(payload);
        Object.keys(U.worlds || {}).forEach(k => delete U.worlds[k]);
        Object.assign(U.worlds, parsed.worlds || {});
        U.activeWorldId = parsed.activeWorldId;
        if (parsed.revealed) U.revealed = parsed.revealed;
        const w = activeWorld();
        if (!w) return { ok: false, reason: "no-active-world" };
        showTab("world"); if (typeof renderWorld === "function") renderWorld();
        return { ok: true, worldId: w.id, worldName: w.name };
      } catch (error) { return { ok: false, error: error.message }; }
    }, state);
    if (!restored.ok) throw new Error(`state restore failed: ${JSON.stringify(restored)}`);
    await waitTheater(page);
    await settleDiagnoseCapture(page, { restoredFrom: args.restore, notFoundUrls: [...new Set(notFound)] });
    await page.close();
  } else {
    let result = null;
    for (let attempt = 0; attempt < MAX_WORLDS && !result; attempt++) {
      const seed = (SEED + attempt) >>> 0;
      const page = await browser.newPage();
      const notFound = [];
      attach404Logging(page, notFound);
      // Deterministic-ish dice — the page consumes other entropy too; the SAVED STATE is the fixture.
      await page.evaluateOnNewDocument(seedValue => {
        let s = seedValue >>> 0 || 1;
        Math.random = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      }, seed);
      await page.goto(`${BASE}/genesis.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none!important;visibility:hidden!important}" });
      const boot = await bootToInSession(page);
      if (!boot.ok) throw new Error(`game boot failed (seed ${seed}): ${JSON.stringify(boot)}`);
      await waitTheater(page); await page.waitForNetworkIdle({ idleTime: 800, timeout: 30000 }).catch(() => {});

      // What did this session's prep actually rumor? Need a dungeon-shaped frontier for the
      // volumetric-interior lane. No reroll of any WALK content — a miss skips the whole world.
      const frontierScan = await page.evaluate(() => {
        const w = activeWorld(); const P = prepOf(w);
        return { pendingBefore: (typeof prepPendingDigest === "function") ? prepPendingDigest(w) : null,
          frontiers: Object.keys(P.nodes).map(id => ({ id, env: P.nodes[id].env, overlaid: !!P.nodes[id].overlaid })) };
      });
      const hasDungeon = frontierScan.frontiers.some(f => f.env === "dungeon");
      if (!hasDungeon) {
        console.log(`seed ${seed}: prep rolled [${frontierScan.frontiers.map(f => f.env).join(", ")}] — no dungeon frontier, next world`);
        await page.close(); continue;
      }

      // The honest "unserviced prep" frame — exactly the state the invalid live capture recorded.
      const prePrep = await canvasShot(page);
      writeFileSync(join(OUT, `kgr7-${LABEL}-preprep.png`), Buffer.from(prePrep, "base64"));

      // Service prep through the SAME event seam the DM seat uses, then walk in.
      const entered = await page.evaluate(() => {
        const w = activeWorld(); const P = prepOf(w);
        const overlays = {};
        Object.values(P.nodes).forEach(pn => { overlays[pn.env] = overlays[pn.env] || { env: pn.env }; });
        const applied = applyEvent(w, { type: "prep_applied", payload: { overlays }, source: "declared" });
        const dungeonId = Object.keys(P.nodes).find(id => P.nodes[id].env === "dungeon" && P.nodes[id].spatial);
        if (!dungeonId) return { ok: false, applied, reason: "no-dungeon-spatial", frontiers: Object.keys(P.nodes).map(id => ({ id, env: P.nodes[id].env, spatial: !!P.nodes[id].spatial })) };
        const walkStart = applyEvent(w, { type: "start_walk", payload: { nodeId: dungeonId }, source: "declared" });
        if (typeof renderWorld === "function") renderWorld();
        return { ok: true, applied, walkStart: { ok: walkStart.ok }, dungeonId,
          pendingAfter: (typeof prepPendingDigest === "function") ? prepPendingDigest(w) : null };
      });
      if (!entered.ok) throw new Error(`prep/walk entry failed (seed ${seed}): ${JSON.stringify(entered)}`);

      result = await settleDiagnoseCapture(page, { seed, attempt, notFoundUrls: [...new Set(notFound)],
        pendingBefore: frontierScan.pendingBefore, entered: { dungeonId: entered.dungeonId, pendingAfter: entered.pendingAfter } });

      // The world IS the save file — persist it so every later engine state renders THIS world.
      const stateJson = await page.evaluate(() => JSON.stringify({ worlds: U.worlds, activeWorldId: U.activeWorldId, revealed: U.revealed }));
      writeFileSync(join(OUT, "kgr7-world-state.json"), stateJson + "\n");
      console.log(`canonical world state saved -> kgr7-world-state.json`);
      await page.close();
    }
    if (!result) throw new Error(`no dungeon frontier in ${MAX_WORLDS} seeded worlds starting at ${SEED}`);
  }
} finally {
  await browser.close();
  server.close();
}
