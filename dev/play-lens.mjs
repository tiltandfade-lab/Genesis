#!/usr/bin/env node
/* dev/play-lens.mjs — PLAY-LENS PL-1: the bot-play capture rig.
   docs/PLAY-LENS.md — Adam's direction verbatim: "get a bot to play for a bit, capture screens
   from the real play, and then learn what all is still outstanding, broken, ugly, not working."

   Extends the PROVEN pieces; invents nothing new:
     - dev/playtest-bridgeless.mjs — the headless session-driving CONVENTIONS (init a world via the
       real bardo, drive turns through the real production event seam applyEvent/applyResponse,
       never a fixture). This rig reuses that same seam, but through a REAL browser mount instead of
       jsdom, so the capture is of the actual render pipeline (theater/WebGL), not a headless DOM.
     - dev/battle-gate/capture-dungeon-loop.mjs — the puppeteer mount + screenshot pattern
       (launchChrome/newPage/bootToInSession/waitForTheater), and the "drive the REAL production
       seam directly via page.evaluate() — rollDungeonWalk/applyEvent(prep_applied)/applyEvent
       (walk_advance)/applyEvent(combat_start)" technique. Copied near-verbatim where the job is
       identical (boot, mount-wait); composed/extended where PLAY-LENS's route needs more legs
       (settlement node tray, travel, shop, rest) than that gate's dungeon-only loop drove.
     - dev/battle-gate/capture-place-tray.mjs — mintNodeTray's rollPlace/codexAdd/mapOf binding
       convention for a real place-gen node tray (documented there as "the exact same functions
       urban.js's buildingApproach / a DM `gen kind:"place"` mint call" would use).

   THE BOT: there is no live AI DM in this rig, by design (Genesis doctrine: no model call in a
   mechanical loop — docs project memory "Genesis doctrines 2026-07-02", SPEED). The "bot" plays by
   calling the SAME production entry points (applyEvent/addNode/rollDungeonWalk/rollPlace/etc.) a
   live DM's TurnResponse would eventually call — this is the identical technique
   capture-dungeon-loop.mjs already uses to drive real production code with no DM in the loop. The
   rig is read-only on game logic: it drives + photographs, it never patches engine behavior.

   SESSION ROUTE (a REAL rolled world, no fixtures — production rolls are intentionally unseeded):
     TIYL start (the bardo) -> a settlement/place node (tray scene, via rollPlace/codexAdd binding)
     -> travel (a real wilderness travel walk, or the engine's own honest instant-arrival degrade)
     -> a dungeon walk with combat rounds (rollDungeonWalk -> prep_applied -> walk_advance ->
     combat_start -> round_tick x2 -> a state_transition on a real rolled interactable ->
     combat_end -> walk_complete) -> a shop (open_shop, the "at least one shop/interior place" leg)
     -> a long rest. Each leg that can't be driven headless is reported HONESTLY in findings.json's
     `legs` array rather than silently skipped or faked.

   CAPTURE TRIGGERS (docs/PLAY-LENS.md): every scene change (new board/tray via trayFrom/
   setInteriorBoard — the standing-table source flips kind), every combat round start, every
   state_transition. This rig also captures a handful of explicit ROUTE MILESTONES (TIYL boot, rest)
   that are not scene-change/round/state_transition triggers themselves but are load-bearing legs of
   the route Adam asked for — tagged their own `kind` so the ledger can tell trigger-shots from
   milestone-shots apart. PLAY_LENS_MAX_SHOTS caps the run; hitting it logs LOUDLY (never a silent
   drop).

   Run:   node dev/play-lens.mjs --run-id <id> [--realm chrome] [--force-realm fantasy|gloom|chrome]
          [--route standard|travel-heavy|dungeon-heavy|town-beats] [--port 5241]
   Output: dev/play-lens/run-<runId>/pl-<seq>-<kind>-<context>.png + manifest.json + findings.json

   L1 (docs/VQ2-RESPEC.md §3 WAVE L / dev/play-lens/ledger.md "Rig improvements") — rig-only
   extensions, game logic byte-untouched:
     1. THE BOT FIGHTS — driveCombatRound now emits real production `attack` + `move_zone` events
        (not a Theater FX ping) so rounds 2-3 carry real HP/position deltas — the honest re-test for
        ledger P0 #2 (PC token presence across rounds).
     2. TRANSITION CAMERA — driveStateTransition parses the room's segNum off the interactable's own
        sourceRef ("S<segNum>.<field>", src/engine/walk-interactables.js:267) and the caller
        walk_advances the cursor there before shooting, so the capture actually frames the room the
        transition happened in (today's gap: pn.interactables spans every room in the plan, not just
        the one in camera).
     3. SHOP CAPTURE VERIFICATION — verifyShopPanelRendered() asserts the `.shop-header` DOM node is
        actually laid out and in-viewport after open_shop, not just that the event returned ok:true.
        Recorded on findings.json's top-level `shopRenderVerdict`.
     4. RECORD-LESS SETTLEMENT LEG — driveRecordlessSettlement() lands the PC on a node stamped
        env:"urban" (mirrors driveDungeon's own P.nodes[nodeId]={env:"dungeon",...} technique) with
        NO codexId ever bound, so theaterHereSourceFor's {kind:"node"} single-site-tray branch never
        fires and the ENV-3 town builder ({kind:"settlement"}) is the one exercised — the PL-3 ledger
        note ("Dorsal Market took precedence — correct; the record-less read is still owed").
     5. --force-realm <fantasy|gloom|chrome> — INSPECTED before implementing (see the branch's commit
        body for the full trail): the bardo WORLDBEATS tables (master/smell/sound/arch/taboo/nearby/
        myth/faction/pressure) carry a SPICE BAND (`cat`: Grounded/Textured/Strange/Volatile/Mythic),
        never a realm tag — "reroll bardoRollWorld until it matches a target realm" cannot converge,
        there is nothing realm-shaped in those tables to match. The real, already-wired lever is
        `w.realm` (src/engine/breach.js's breachMarkRealmActive): theaterActiveRealmsFor/
        activeRealmsFor read `w.realm.active`+`.name` to populate theaterHereSourceFor's `realms[]`,
        which interiorBuildBoard/interiorTileKitFor (src/ui/theater-interior.js) consume to pick the
        INTERIOR_TILE_KITS entry a dungeon room renders with — INTERIOR_TILE_KITS carries `fantasy`
        as a first-class key (the "three original kits" alongside chrome/gloom, predating the later
        GR1 9-realm expansion), so this is a direct, no-reroll seam: call the real production function
        once, dev-only, right after boot. Two honest scope notes surfaced in the manifest: (a)
        PLACE_SKINS (settlement/place-gen material skin) only defines {chrome, frontier, gloom} — a
        forced "fantasy" settlement mint degrades to the frontier skin, rollPlace's own pre-existing
        fallback; (b) production play never sets w.realm (a fresh-bound world has none) — this flag
        exists ONLY in the rig, gated behind an explicit CLI arg, never fired unseeded/by default.
     6. --route <standard|travel-heavy|dungeon-heavy|town-beats> — parameter presets over the SAME
        leg vocabulary (dungeon segCount, travel's own travelMin payload field, an extra shop-cycle
        for town-beats) — no new leg types invented. `standard` is byte-identical to the pre-L1 route.
*/

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// ---- CLI args ---------------------------------------------------------------
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) { a[argv[i].slice(2)] = argv[i + 1]; i++; }
  }
  return a;
}
const args = parseArgs(process.argv.slice(2));
if (!args["run-id"]) {
  process.stderr.write("play-lens.mjs: --run-id is REQUIRED (determinism law — no Date.now/wall-clock in artifact naming). Example: --run-id pl1-001\n");
  process.exit(2);
}
const RUN_ID = String(args["run-id"]);

// L1 §5 — dev-only realm steering. Whitelist matches INTERIOR_TILE_KITS' three original kits
// (src/ui/theater-interior.js) == docs/PLAY-LENS.md's "core-3" — see the header note above for the
// full inspection trail on why this (not a bardoRollWorld reroll) is the real seam.
const FORCE_REALM_WHITELIST = ["fantasy", "gloom", "chrome"];
const FORCE_REALM = args["force-realm"] || null;
if (FORCE_REALM && FORCE_REALM_WHITELIST.indexOf(FORCE_REALM) < 0) {
  process.stderr.write(`play-lens.mjs: --force-realm '${FORCE_REALM}' must be one of ${FORCE_REALM_WHITELIST.join("|")}\n`);
  process.exit(2);
}
const REALM = FORCE_REALM || args.realm || "chrome"; // core-3 first (docs/PLAY-LENS.md) — chrome/gloom/fantasy

// L1 §6 — route variants over the SAME leg vocabulary (dungeon segCount / travel's travelMin payload
// field / an extra shop open-close cycle for town-beats). `standard` is the pre-L1 fixed cross-section,
// byte-identical to before this unit.
const ROUTE = args.route || "standard";
const ROUTE_PRESETS = {
  "standard":       { travelMin: null, dungeonSegCount: 6,  extraShopCycle: false },
  "travel-heavy":   { travelMin: 300,  dungeonSegCount: 3,  extraShopCycle: false },
  "dungeon-heavy":  { travelMin: null, dungeonSegCount: 11, extraShopCycle: false },
  "town-beats":     { travelMin: 90,   dungeonSegCount: 3,  extraShopCycle: true },
};
if (!ROUTE_PRESETS[ROUTE]) {
  process.stderr.write(`play-lens.mjs: --route '${ROUTE}' must be one of ${Object.keys(ROUTE_PRESETS).join("|")}\n`);
  process.exit(2);
}
const ROUTE_CFG = ROUTE_PRESETS[ROUTE];

const outDir = path.join(__dirname, "play-lens", `run-${RUN_ID}`);
fs.mkdirSync(outDir, { recursive: true });

// PLAY-LENS.md: "Cap per run: PLAY_LENS_MAX_SHOTS=120 (named const; log when hit — no silent cap)."
const PLAY_LENS_MAX_SHOTS = 120;

// a FIFTH port range — capture-place-tray.mjs owns 5191-5195, capture-stage.mjs 5181-5185,
// capture-interior-study.mjs 5201-5205, capture-dungeon-loop.mjs 5211-5215 — so this rig can run
// concurrently with any of them.
const PORT_CANDIDATES = args.port ? [parseInt(args.port, 10)] : [5241, 5242, 5243, 5244, 5245];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[play-lens]", ...a); }
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

const SHOT_W = Number(process.env.PL_SHOT_W) || 1600, SHOT_H = Number(process.env.PL_SHOT_H) || 1000;
async function launchChrome() {
  const argv = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args: argv, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}
async function newPage(browser) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().endsWith("/favicon.ico")) {
      req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
    } else req.continue();
  });
  await page.evaluateOnNewDocument(() => { window.__plConsoleErrors = []; window.__pl404Urls = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { log("console.error:", msg.text().slice(0, 200)); page.evaluate((t) => { window.__plConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("response", (res) => { if (res.status() === 404) { const u = res.url(); page.evaluate((url) => { window.__pl404Urls.push(url); }, u).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__plConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  return page;
}

// mirrors capture-dungeon-loop.mjs's bootToInSession verbatim (the proven TIYL/bardo autofill —
// this IS "TIYL start": the bardo ("This Is Your Life") character-creation ritual, auto-filled with
// the app's own first-listed picks/auto-pick helpers, ending in a real living PC + a live session).
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
      if (nameEl) nameEl.value = "Play Lens Bot";
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
      };
    });
    if (state.hasBattleStage && state.theaterMounted && state.hasCanvas) return state;
    await page.evaluate(() => { try { renderWorld(); } catch (e) {} });
    await sleep(300);
  }
  return state;
}

// ---- context snapshot (feeds the manifest row) -------------------------------
// {realm, env, nodeKind, walkId, segNum, lightProfile} read off the SAME live seams theaterStageSync
// itself reads (theaterHereSourceFor/prepOf/GS.combat) — never re-derived/guessed.
async function snapshotContext(page) {
  return await page.evaluate(() => {
    try {
      const w = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!w) return {};
      const hereSource = (typeof theaterHereSourceFor === "function") ? theaterHereSourceFor(w) : null;
      const P = (typeof prepOf === "function") ? prepOf(w) : null;
      const combatActive = !!(window.GS && GS.combat && GS.combat.active);
      const lights = (window.Theater && typeof window.Theater._interiorSceneLightsForTest === "function") ? window.Theater._interiorSceneLightsForTest() : null;
      const walkId = (P && P.activeWalkId) || null;
      const pn = walkId && P.nodes && P.nodes[walkId];
      return {
        realm: (hereSource && hereSource.realms && hereSource.realms[0]) || null,
        env: (hereSource && hereSource.env) || (combatActive && GS.combat.segment && GS.combat.segment.environment) || null,
        nodeKind: hereSource ? hereSource.kind : null,
        walkId: walkId,
        segNum: (hereSource && hereSource.focusSegNum != null) ? hereSource.focusSegNum : ((pn && pn.cursor && pn.cursor.current) || null),
        lightProfile: lights ? lights.profileKey : null,
        combatRound: combatActive ? GS.combat.round : null,
        currentNodeId: w.currentNodeId || null,
        clock: w.clock ? (w.clock.day + ":" + w.clock.min) : null,
      };
    } catch (e) { return { snapshotError: e.message }; }
  });
}

async function measureFps(page) {
  try {
    return await page.evaluate(() => (window.Theater && typeof window.Theater.measureRenderFps === "function") ? window.Theater.measureRenderFps(20) : null);
  } catch (e) { return null; }
}

// ============================================================================
// the capture ledger — seq/manifest/cap discipline lives here, once.
// ============================================================================
function makeCapture(page) {
  let seq = 0;
  const rows = [];
  let capped = false;
  return {
    async shot(kind, context, notes) {
      if (seq >= PLAY_LENS_MAX_SHOTS) {
        if (!capped) { log(`*** PLAY_LENS_MAX_SHOTS (${PLAY_LENS_MAX_SHOTS}) HIT — no further shots this run ***`); capped = true; }
        return null;
      }
      seq += 1;
      const seqStr = String(seq).padStart(3, "0");
      const safeContext = String(context || "x").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 48);
      const fileName = `pl-${seqStr}-${kind}-${safeContext}.png`;
      const filePath = path.join(outDir, fileName);
      try {
        await page.screenshot({ path: filePath });
      } catch (e) {
        log(`  screenshot FAILED for ${fileName}: ${e.message}`);
      }
      const ctx = await snapshotContext(page);
      const fps = await measureFps(page);
      const row = { seq, kind, realm: ctx.realm || REALM, env: ctx.env || null, nodeKind: ctx.nodeKind || null,
        walkId: ctx.walkId || null, segNum: ctx.segNum != null ? ctx.segNum : null, lightProfile: ctx.lightProfile || null,
        fps: (fps && typeof fps.fps === "number") ? Number(fps.fps.toFixed(1)) : null,
        notes: notes || null, file: fileName, combatRound: ctx.combatRound != null ? ctx.combatRound : null,
        currentNodeId: ctx.currentNodeId || null, clock: ctx.clock || null };
      rows.push(row);
      log(`  [${seqStr}] ${kind}/${safeContext} -> ${fileName}` + (notes ? ` (${notes})` : ""));
      return row;
    },
    rows() { return rows; },
    count() { return seq; },
    capped() { return capped; },
  };
}

// ============================================================================
// production-seam drivers — each returns {ok,stage,...}, never throws (the caller decides whether
// to continue the route on a failure — "the loop's job is finding breaks, not stopping at the
// first one", capture-dungeon-loop.mjs's own header law, adopted here verbatim).
// ============================================================================

// L1 §5 — dev-only realm force. Calls the REAL production function breachMarkRealmActive
// (src/engine/breach.js) once, right after boot: this is the marooned-realm seam ("w.realm"),
// the ONE place theaterActiveRealmsFor/activeRealmsFor read a non-empty realms[] from outside a
// live breach walk — see the file header for the full inspection trail on why this (not a
// bardoRollWorld reroll) is the real, no-reroll-needed lever. Idempotent (breachMarkRealmActive
// itself never re-rolls an already-active w.realm) and a documented production no-op path when the
// flag is absent (a plain-booted world never gets w.realm set — "production stays unseeded").
async function driveForceRealm(page, realmTag) {
  return await page.evaluate((realmTag) => {
    try {
      if (typeof breachMarkRealmActive !== "function") return { ok: false, reason: "breach-unavailable" };
      const w = activeWorld();
      if (!w) return { ok: false, reason: "no-active-world" };
      const r = breachMarkRealmActive(w, realmTag);
      return { ok: true, realm: r };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, realmTag);
}

// LEG 2 — mint a real place-gen record and bind it to the CURRENT node (the origin/"Setting" node
// bindWorld minted never gets a codexId in normal play — settlements are out of rollPlace's single-
// site scale, see PLACE-GEN.md — so this is the closest production-real analog to a "town/
// settlement node tray": a real rolled place record bound via the SAME rollPlace/codexAdd/mapOf
// triplet capture-place-tray.mjs already proved renders a real {kind:"node"} tray, not the idle
// empty table). Honest caveat surfaced in the row's `notes`.
async function mintSettlementNode(page, realm) {
  return await page.evaluate((realm) => {
    try {
      const w = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!w) return { ok: false, reason: "no-active-world" };
      if (typeof rollPlace !== "function" || typeof codexAdd !== "function" || typeof mapOf !== "function") {
        return { ok: false, reason: "place-gen-functions-missing" };
      }
      const nodeId = w.currentNodeId;
      if (!nodeId) return { ok: false, reason: "no-current-node" };
      const payload = rollPlace({ realm });
      const rec = codexAdd(w, payload);
      mapOf(w).nodes[nodeId] = Object.assign({}, mapOf(w).nodes[nodeId] || {}, { codexId: rec.id });
      if (typeof renderWorld === "function") renderWorld();
      const src = (typeof theaterHereSourceFor === "function") ? theaterHereSourceFor(w) : null;
      return { ok: true, nodeId, recordId: rec.id, archetypeKey: rec.rolled && rec.rolled.archetypeKey, name: rec.name || (rec.rolled && rec.rolled.name), sourceKind: src && src.kind };
    } catch (e) { return { ok: false, reason: "exception", error: e.message, stack: e.stack }; }
  }, realm);
}

// LEG 3 — travel: a real production travel_start (routes through travelDepart, src/world/play.js) —
// mints (or degrades honestly if the wilderness-walk engine isn't loaded) a real travel walk to a
// freshly minted destination node. Returns whether a walk actually opened (a real distinct travel
// tray to screenshot) or the engine's own instant-arrival degrade fired (still ok:true — an honest,
// documented production fallback, not a rig failure).
async function driveTravel(page, destName, travelMin) {
  return await page.evaluate((destName, travelMin) => {
    const out = { ok: false, stage: "start" };
    try {
      const w = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!w) return Object.assign(out, { stage: "no-active-world" });
      if (typeof addNode !== "function" || typeof applyEvent !== "function") return Object.assign(out, { stage: "missing-functions" });
      out.stage = "add-node";
      const nodeId = addNode(w, destName, "Place");
      out.destNodeId = nodeId;
      out.stage = "travel_start";
      // L1 §6 route presets: travel_start's own payload.travelMin (threaded to travelDepart, src/
      // world/play.js) sets route.leagues -> the wilderness walk's leg count (encN) — the SAME
      // production field a DM-declared travel time would carry. null (standard route) leaves the
      // pre-L1 behavior byte-identical (travelDepart's own rollRoute() picks the leagues).
      const payload = { toNodeId: nodeId };
      if (travelMin != null) payload.travelMin = travelMin;
      const r = applyEvent(w, { type: "travel_start", payload });
      if (!r || r.ok !== true) return Object.assign(out, { stage: "travel_start-failed", detail: r });
      if (typeof renderWorld === "function") renderWorld();
      out.walk = !!r.walk;
      out.instant = !!r.instant;
      out.travelMin = r.travelMin;
      out.ok = true;
      out.stage = "done";
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  }, destName, travelMin);
}

// the active walk's segment list in BFS order (each walk_advance onto one is a SCENE CHANGE —
// docs/PLAY-LENS.md's own capture trigger: "new board/tray/room via trayFrom") — so the main loop
// can advance leg-by-leg and shoot each room/leg the party actually enters.
async function readWalkSegments(page) {
  return await page.evaluate(() => {
    try {
      const w = activeWorld(); const P = prepOf(w); const walkId = P.activeWalkId;
      if (!walkId) return { ok: false, reason: "no-active-walk" };
      const walk = (typeof walkOfFrontier === "function") ? walkOfFrontier(w, walkId) : null;
      if (!walk || !Array.isArray(walk.segments)) return { ok: false, reason: "no-walk-segments" };
      const segs = walk.segments.slice().sort((a, b) => (a.depth || 0) - (b.depth || 0)).map((s) => s.num);
      const pn = P.nodes[walkId];
      return { ok: true, walkId, segs, current: (pn && pn.cursor && pn.cursor.current) || null, env: walk.environment || null };
    } catch (e) { return { ok: false, reason: "exception", error: e.message }; }
  });
}

// one real walk_advance onto a specific segment (the production cursor move; renders after).
async function driveWalkAdvance(page, segNum) {
  return await page.evaluate((segNum) => {
    try {
      const w = activeWorld(); const P = prepOf(w); const walkId = P.activeWalkId;
      if (!walkId) return { ok: false, reason: "no-active-walk" };
      const adv = applyEvent(w, { type: "walk_advance", payload: { toSeg: segNum, nodeId: walkId } });
      if (typeof renderWorld === "function") renderWorld();
      return Object.assign({ ok: !!(adv && adv.ok) }, adv);
    } catch (e) { return { ok: false, reason: "exception", error: e.message }; }
  }, segNum);
}

// walk_complete on the active walk (travel arrival / dungeon clear both ride this one production seam).
async function driveWalkComplete(page) {
  return await page.evaluate(() => {
    const out = { ok: false, stage: "start" };
    try {
      const w = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!w) return Object.assign(out, { stage: "no-active-world" });
      const P = (typeof prepOf === "function") ? prepOf(w) : null;
      const walkId = P && P.activeWalkId;
      if (!walkId) return Object.assign(out, { stage: "no-active-walk" });
      out.stage = "walk_complete";
      const wc = applyEvent(w, { type: "walk_complete", payload: { nodeId: walkId } });
      if (!wc || wc.ok !== true) return Object.assign(out, { stage: "walk_complete-failed", detail: wc });
      if (typeof renderWorld === "function") renderWorld();
      out.ok = true; out.stage = "done";
      out.arrivedNodeId = w.currentNodeId;
      out.detail = wc;
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  });
}

// LEG 4 — a real dungeon walk on the JUST-ARRIVED node (reuses capture-dungeon-loop.mjs's own proven
// roll -> prep-mount -> prep_applied -> walk_advance -> combat_start sequence VERBATIM, retargeted at
// the destination node the travel leg above landed the PC on, instead of a fresh addNode).
async function driveDungeon(page, cfg) {
  return await page.evaluate((cfg) => {
    const out = { ok: false, stage: "start" };
    try {
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return Object.assign(out, { stage: "no-active-world" });
      const nodeId = cfg.nodeId || world.currentNodeId;
      if (!nodeId) return Object.assign(out, { stage: "no-node" });
      GS.combat = null; // a prior iteration's combat (never expected here, belt-and-suspenders)

      out.stage = "roll";
      const walk = rollDungeonWalk({ segCount: cfg.segCount, tier: 1 });
      if (!walk || !Array.isArray(walk.segments) || !walk.segments.length) return Object.assign(out, { stage: "roll-empty", walk });
      out.topology = walk.topology; out.segCount = walk.segments.length; out.environment = walk.environment;

      out.stage = "mount";
      const P = prepOf(world);
      P.bundle = P.bundle || { environments: [] };
      const idx = P.bundle.environments.length;
      P.bundle.environments.push({ kind: "dungeon", walk, hook: { leadsTo: null }, cast: null });
      P.nodes[nodeId] = { env: "dungeon", idx, soft: true, locked: false, hook: null };
      walkSetActive(world, nodeId);
      out.nodeId = nodeId;

      out.stage = "prep_applied";
      const prepRes = applyEvent(world, { type: "prep_applied", payload: { overlays: { dungeon: { briefing: "play-lens dungeon leg", segments: [] } } } });
      if (!prepRes || prepRes.ok !== true) return Object.assign(out, { stage: "prep_applied-failed", prepRes });

      const pn = prepOf(world).nodes[nodeId];
      if (!pn || !pn.spatial) return Object.assign(out, { stage: "no-spatial-plan-after-prep" });
      out.roomCount = pn.spatial.rooms.length;

      if (typeof renderWorld === "function") renderWorld();

      out.stage = "done";
      out.ok = true;
      out.nodeId = nodeId;
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  }, cfg);
}

// combat_start on the CURRENT room (wherever the cursor stands after the room-by-room walk above) —
// the production seam resolves the room's own cell footprint via spatialRoomForSeg (dm.js:2124-2130).
async function driveCombatStart(page, foes) {
  return await page.evaluate((foes) => {
    const out = { ok: false, stage: "combat_start" };
    try {
      const world = activeWorld();
      GS.combat = null;
      const cr = applyEvent(world, { type: "combat_start", payload: { foes: foes.map((name) => ({ name })) } });
      if (!cr || cr.ok !== true) return Object.assign(out, { stage: "combat_start-failed", cr });
      if (!GS.combat || !GS.combat.active) return Object.assign(out, { stage: "no-active-combat-after-start" });
      out.foes = GS.combat.foes.map((f) => ({ fid: f.fid, name: f.name }));
      out.ok = true; out.stage = "done";
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  }, foes);
}

// L1 §1 — THE BOT FIGHTS. One combat round: a real `attack` on a living foe (the SAME production
// event a PC's weapon swing fires — applies damage to the foe via applyDamage inside the `attack`
// case, src/world/dm.js:2189) + a real `move_zone` (the SAME production event a declared move fires
// — src/world/dm.js:2373) + round_tick(phase:"end") (increments GS.combat.round). Replaces the old
// Theater.play("hurt") FX-only ping, which never touched GS.combat/w.ledger at all — the RED-FIRST
// proof (this branch's commit body) shows the old driver left pcBand/foe HP byte-identical across
// two full rounds and added zero attack/hp ledger entries; this driver visibly changes both.
// resetTurnBudget (src/engine/combat-actions.js) is called once per round on GS.combat.pc — the
// "walk/turn loop's own job" per that file's header — since round_tick(phase:"end") only clears
// per-turn FLAGS (disengaged/readied), never the movement BUDGET; without this a second round's
// move_zone would legally fail with reason:"already-moved".
async function driveCombatRound(page, round) {
  return await page.evaluate((round) => {
    const out = { ok: false, stage: "start" };
    try {
      if (!GS.combat || !GS.combat.active) return Object.assign(out, { stage: "no-combat" });
      const w = activeWorld();
      out.beforeFoes = GS.combat.foes.map((f) => ({ fid: f.fid, hpCur: f.hpCur, down: !!f.down }));
      out.beforePcBand = GS.combat.pc.band;

      const foe = (GS.combat.foes || []).find((f) => !f.down) || (GS.combat.foes || [])[0];
      if (foe) {
        out.stage = "attack";
        const atk = applyEvent(w, { type: "attack", payload: { d20: 15, targetAC: foe.ac || 13, target: foe.fid } });
        out.attack = { ok: !!(atk && atk.ok), targetFid: foe.fid, hit: !!(atk && atk.result && atk.result.hit), damage: atk && atk.result && atk.result.damage };
      } else {
        out.attack = { ok: false, reason: "no-living-foe" };
      }

      if (typeof resetTurnBudget === "function") resetTurnBudget(GS.combat.pc);
      out.stage = "move_zone";
      const wantBand = GS.combat.pc.band === "melee" ? "near" : "melee";
      const mv = applyEvent(w, { type: "move_zone", payload: { who: "pc", band: wantBand } });
      out.move = { ok: !!(mv && mv.ok), band: mv && mv.band, reason: mv && mv.reason };

      out.stage = "round_tick";
      const rt = applyEvent(w, { type: "round_tick", payload: { phase: "end" } });
      if (typeof renderWorld === "function") renderWorld();

      out.afterFoes = GS.combat.foes.map((f) => ({ fid: f.fid, hpCur: f.hpCur, down: !!f.down }));
      out.afterPcBand = GS.combat.pc.band;
      out.ok = !!(rt && rt.round != null);
      out.round = GS.combat.round;
      out.stage = "done";
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  }, round);
}

// a real state_transition on a real rolled interactable — reads plan.interactables[] as reconciled
// onto the live prep node (trayReconcileInteractableState, src/engine/theater-data.js:1069) by the
// render that just happened (walk-binding D2/D3, landed per the repo's own git log), picks the FIRST
// entity whose archetype has >=2 known states (dmArchetypeStates, src/world/dm.js:1913) and flips it
// to the next one in its own authored state list — never inventing a state, never guessing an entity.
async function driveStateTransition(page) {
  return await page.evaluate(() => {
    const out = { ok: false, stage: "start" };
    try {
      const w = activeWorld(); if (!w) return Object.assign(out, { stage: "no-active-world" });
      const P = prepOf(w); const walkId = P.activeWalkId;
      const pn = walkId && P.nodes[walkId];
      const list = (pn && Array.isArray(pn.interactables)) ? pn.interactables : [];
      out.candidateCount = list.length;
      const found = list.find((it) => {
        const states = (typeof dmArchetypeStates === "function") ? dmArchetypeStates(it.archetype) : null;
        return Array.isArray(states) && states.length >= 2;
      });
      if (!found) return Object.assign(out, { stage: "no-eligible-interactable" });
      const states = dmArchetypeStates(found.archetype);
      const cur = found.state || states[0];
      const curIdx = states.indexOf(cur);
      const next = states[(curIdx + 1) % states.length];
      const r = applyEvent(w, { type: "state_transition", payload: { entityRef: found.sourceRef, to: next } });
      if (!r || r.ok !== true) return Object.assign(out, { stage: "state_transition-failed", detail: r });
      // L1 §2 — TRANSITION CAMERA. pn.interactables spans EVERY room in the walk's spatial plan (D2's
      // bindWalkInteractables iterates plan.rooms.forEach unconditionally, src/engine/
      // walk-interactables.js) — the first eligible entity found above is not necessarily in the room
      // currently in camera (pn.cursor.current). sourceRef is stamped "S<segNum>.<field>" by that same
      // bind (walk-interactables.js:267) — the one place a room identity rides on an interactable ref.
      // Parse it so the caller can walk_advance the cursor there before screenshotting.
      const m = /^S(\d+)\./.exec(found.sourceRef || "");
      out.roomSegNum = m ? Number(m[1]) : null;
      if (typeof renderWorld === "function") renderWorld();
      out.ok = true; out.stage = "done"; out.entityRef = found.sourceRef; out.archetype = found.archetype; out.from = r.from; out.to = r.to;
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  });
}

async function driveCombatEnd(page) {
  return await page.evaluate(() => {
    const out = { ok: false, stage: "start" };
    try {
      if (!GS.combat) return Object.assign(out, { stage: "no-combat" });
      const w = activeWorld();
      const r = applyEvent(w, { type: "combat_end", payload: { outcome: "resolved", method: "combat" } });
      if (!r || r.ok !== true) return Object.assign(out, { stage: "combat_end-failed", detail: r });
      out.ok = true; out.stage = "done";
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  });
}

async function driveDungeonComplete(page) {
  return await page.evaluate(() => {
    const out = { ok: false, stage: "start" };
    try {
      const w = activeWorld(); const P = prepOf(w); const walkId = P.activeWalkId;
      if (!walkId) return Object.assign(out, { stage: "no-active-walk" });
      const r = applyEvent(w, { type: "walk_complete", payload: { nodeId: walkId, abandoned: false } });
      if (typeof renderWorld === "function") renderWorld();
      out.ok = !!(r && r.ok);
      out.detail = r;
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  });
}

// L1 §4 — RECORD-LESS SETTLEMENT LEG. mintSettlementNode (LEG 2, above) always binds a codexId, which
// routes theaterHereSourceFor to its {kind:"node"} single-site-tray branch — the ENV-3 town builder
// ({kind:"settlement"}) only fires for a settlement-kind node with NO bound place record
// (nodeIsSettlementKind + theaterNodeSourceFor returning null, src/world/render.js:472-505). This
// mints a FRESH node, stamps its prep entry env:"urban" directly (mirrors driveDungeon's own
// P.nodes[nodeId]={env:"dungeon",...} technique above — the SAME proven rig pattern, not a new one),
// and NEVER binds a codexId, then moves the PC there via the real `move_node` production event
// (src/world/dm.js:4251 — a narrative jump, no active walk required/left open). PL-3 ledger: "Dorsal
// Market took precedence — correct; the record-less read is still owed."
async function driveRecordlessSettlement(page) {
  return await page.evaluate(() => {
    const out = { ok: false, stage: "start" };
    try {
      const w = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!w) return Object.assign(out, { stage: "no-active-world" });
      if (typeof addNode !== "function" || typeof applyEvent !== "function" || typeof prepOf !== "function")
        return Object.assign(out, { stage: "missing-functions" });
      out.stage = "add-node";
      const nodeId = addNode(w, "Play-Lens Record-less Settlement", "Place");
      out.nodeId = nodeId;
      const P = prepOf(w);
      P.nodes[nodeId] = { env: "urban", soft: true, locked: false, hook: null };
      out.stage = "move_node";
      const mv = applyEvent(w, { type: "move_node", payload: { nodeId, travelMin: 0, cause: "play-lens record-less settlement leg" } });
      if (!mv || mv.ok !== true) return Object.assign(out, { stage: "move_node-failed", detail: mv });
      if (typeof renderWorld === "function") renderWorld();
      const src = (typeof theaterHereSourceFor === "function") ? theaterHereSourceFor(w) : null;
      out.sourceKind = src && src.kind; // expect "settlement" — the ENV-3 town builder
      out.hasCodexId = !!(mapOf(w).nodes[nodeId] && mapOf(w).nodes[nodeId].codexId);
      out.ok = true; out.stage = "done";
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  });
}

// L1 §3 — SHOP CAPTURE VERIFICATION. open_shop's own handler sets GS.gamePanel="shop" and calls
// renderWorld() synchronously (src/world/dm.js:4328-4329), so by the time driveOpenShop below
// returns, the DOM SHOULD already carry the panel — this asserts that honestly instead of trusting
// the event's ok:true. shopPanel (src/world/render.js:1442) roots its markup at `.shop-header`
// inside the sliding `.panel-col` aside; checked for both layout (display/visibility/non-zero rect)
// and actually being inside the captured viewport (a slid-off-canvas panel would still pass a bare
// querySelector check).
async function verifyShopPanelRendered(page) {
  return await page.evaluate(() => {
    const el = document.querySelector(".panel-col .shop-header") || document.querySelector(".shop-header");
    if (!el) {
      // diagnostic-only, never a fix: src/world/render.js's battle-stage branch (showStage=
      // stageMode&&!GS.stageCollapsed) replaces .panel-col wholesale with the DM chat feed
      // (.stage-feed-col) — gamePanelContent(w,cur,panel), the ONE place shopPanel() renders, only
      // ever fires in the non-battle-stage/classic layout. Surfacing this so the finding names WHY,
      // not just THAT — a genuine production gap this rig discovered, not a rig bug.
      const battleStageActive = !!document.querySelector(".game.battle-stage");
      const stageFeedColPresent = !!document.querySelector(".stage-feed-col");
      return {
        rendered: false, reason: "no-.shop-header-in-dom",
        battleStageActive, stageFeedColPresent,
        note: battleStageActive ? "battle-stage layout is active — render.js's showStage branch swaps .panel-col for the DM feed unconditionally; GS.gamePanel='shop' has no visual effect while the theater stage is mounted (a real production gap, not a rig defect)." : null,
      };
    }
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const laidOut = cs.display !== "none" && cs.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    const inViewport = rect.right > 0 && rect.bottom > 0 && rect.left < window.innerWidth && rect.top < window.innerHeight;
    const nameEl = document.querySelector(".panel-col .shop-name");
    return {
      rendered: laidOut && inViewport, laidOut, inViewport,
      rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      shopName: nameEl ? nameEl.textContent.trim() : null,
    };
  });
}

// LEG 5 — "at least one shop/interior place": open_shop (src/world/dm.js:4308) — the real merchant-
// open seam (the same event a live DM or the dev "Open test shop" affordance fires); renders itself.
async function driveOpenShop(page) {
  return await page.evaluate(() => {
    const out = { ok: false, stage: "start" };
    try {
      const w = activeWorld();
      const r = applyEvent(w, { type: "open_shop", payload: { name: "The Play-Lens Trading Post", archetype: "general" } });
      if (!r || r.ok !== true) return Object.assign(out, { stage: "open_shop-failed", detail: r });
      out.ok = true; out.shopId = r.shopId; out.stage = "done";
      return out;
    } catch (e) { return Object.assign(out, { stage: (out.stage || "start") + "-exception", error: e.message, stack: e.stack }); }
  });
}
async function driveCloseShop(page) {
  return await page.evaluate(() => {
    try {
      if (typeof GS !== "undefined") { GS.activeShopId = null; GS.gamePanel = null; }
      if (typeof renderWorld === "function") renderWorld();
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  });
}

// LEG 6 — rest: a real long rest (src/world/dm.js:2564) — refuses mid-combat by production design
// (DETECTED-EVENTS.md DE-1), so this only fires after combat_end above.
async function driveRest(page) {
  return await page.evaluate(() => {
    try {
      const w = activeWorld();
      const r = applyEvent(w, { type: "rest", payload: { kind: "long" } });
      if (typeof renderWorld === "function") renderWorld();
      return Object.assign({ ok: !!(r && r.ok) }, r);
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  });
}

// ============================================================================
// main
// ============================================================================
async function main() {
  const findings = { runId: RUN_ID, realm: REALM, route: ROUTE, forceRealm: FORCE_REALM, generatedAt: new Date().toISOString(), legs: [], notes: [] };
  const server = await startServer();
  let browser = null;
  const legOk = (name, detail) => { findings.legs.push({ leg: name, ok: true, detail }); log(`LEG OK: ${name}`); };
  const legFail = (name, detail) => { findings.legs.push({ leg: name, ok: false, detail }); log(`LEG FAILED (continuing route): ${name} — ${JSON.stringify(detail).slice(0, 300)}`); };

  try {
    browser = await launchChrome();
    const page = await newPage(browser);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });

    const cap = makeCapture(page);

    // LEG 1 — TIYL start (the bardo). Not itself a scene-change/round/state_transition trigger, but
    // the route's opening milestone — tagged its own kind so the ledger can tell it apart.
    const boot = await bootToInSession(page);
    findings.boot = boot;
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    legOk("tiyl-start", { worldName: boot.worldName });

    // L1 §5 — dev-only realm force, applied as early as possible (before the FIRST render) so even
    // the boot shot below reflects the target realm's interior/material kit.
    if (FORCE_REALM) {
      const fr = await driveForceRealm(page, FORCE_REALM);
      findings.forceRealm = Object.assign({ requested: FORCE_REALM }, fr);
      if (fr.ok) {
        legOk("force-realm", fr);
        findings.notes.push(`--force-realm ${FORCE_REALM}: w.realm.active=true via breachMarkRealmActive — dungeon INTERIOR_TILE_KITS + activeRealms now steer to '${FORCE_REALM}'. Scope note: PLACE_SKINS (settlement mint skin) only defines {chrome,frontier,gloom} — a 'fantasy' settlement mint degrades to the frontier skin (rollPlace's own pre-existing fallback), unaffected by this flag.`);
      } else {
        legFail("force-realm", fr);
        findings.notes.push("--force-realm could not be applied: " + JSON.stringify(fr));
      }
    }

    const theaterState = await waitForTheater(page);
    findings.theaterState = theaterState;
    await cap.shot("boot", "tiyl-start", "world founded via the bardo; PC living" + (FORCE_REALM ? ` (--force-realm ${FORCE_REALM})` : ""));

    // LEG 2 — settlement/place node tray.
    const mint = await mintSettlementNode(page, REALM);
    findings.mint = mint;
    if (mint.ok) {
      legOk("settlement-node", mint);
      await cap.shot("scene", "settlement-" + (mint.archetypeKey || REALM),
        "node tray via rollPlace/codexAdd binding (settlements are out of rollPlace's single-site scale per PLACE-GEN.md — closest production-real analog to a town tray)");
    } else {
      legFail("settlement-node", mint);
      findings.notes.push("LEG settlement-node could not be driven headless: " + JSON.stringify(mint));
      await cap.shot("scene", "settlement-fallback", "mintSettlementNode failed — capturing whatever the standing table shows instead");
    }

    // LEG 3 — travel. Every walk_advance onto a new leg IS a scene change (the tray re-derives off
    // the new here-segment) — shot per leg, per docs/PLAY-LENS.md's capture policy.
    const travel = await driveTravel(page, "Play-Lens Dungeon Approach", ROUTE_CFG.travelMin);
    findings.travel = travel;
    if (travel.ok) {
      legOk("travel-depart", travel);
      await cap.shot("scene", travel.walk ? "travel-walk" : "travel-instant",
        travel.walk ? "real wilderness travel walk opened" : "engine's own instant-arrival degrade (no wilderness-walk engine loaded) — honest fallback, not a rig failure");
      if (travel.walk) {
        const tsegs = await readWalkSegments(page);
        findings.travelSegments = tsegs;
        if (tsegs.ok) {
          for (const segNum of tsegs.segs) {
            if (segNum === tsegs.current) continue; // cursor already stands here — not a scene change
            const adv = await driveWalkAdvance(page, segNum);
            if (adv.ok) { await sleep(300); await cap.shot("scene", "travel-leg-" + segNum, "walk_advance leg " + segNum); }
            else { legFail("travel-leg-" + segNum, adv); findings.notes.push("travel leg " + segNum + " walk_advance failed: " + JSON.stringify(adv)); }
          }
        }
        const arrive = await driveWalkComplete(page);
        findings.travelArrive = arrive;
        if (arrive.ok) { legOk("travel-arrive", arrive); await cap.shot("scene", "travel-arrive", "walk_complete landed the PC at the destination node"); }
        else { legFail("travel-arrive", arrive); findings.notes.push("travel-arrive could not complete: " + JSON.stringify(arrive)); }
      }
    } else {
      legFail("travel-depart", travel);
      findings.notes.push("LEG travel could not be driven headless: " + JSON.stringify(travel));
    }
    const destNodeId = (travel && travel.destNodeId) || null;

    // LEG 4 — dungeon walk with combat rounds. Room-by-room: each walk_advance re-derives the
    // interior tray onto the NEW room (a scene change per docs/PLAY-LENS.md), so shoot each room the
    // party actually enters, then open combat in the deepest room reached.
    const dungeonCfg = { nodeId: destNodeId, segCount: ROUTE_CFG.dungeonSegCount, foes: ["Wolf", "Giant Rat", "Skeleton"] };
    const drive = await driveDungeon(page, dungeonCfg);
    findings.dungeon = drive;
    if (drive.ok) {
      legOk("dungeon-walk", { topology: drive.topology, roomCount: drive.roomCount });
      const dsegs = await readWalkSegments(page);
      findings.dungeonSegments = dsegs;
      if (dsegs.ok) {
        for (const segNum of dsegs.segs) {
          const adv = await driveWalkAdvance(page, segNum);
          if (adv.ok) { await sleep(400); await cap.shot("scene", "dungeon-room-" + segNum, `${drive.topology} room S${segNum}`); }
          else { legFail("dungeon-room-" + segNum, adv); findings.notes.push("dungeon room S" + segNum + " walk_advance failed: " + JSON.stringify(adv)); }
        }
        legOk("dungeon-rooms", { walked: dsegs.segs.length });
      } else {
        legFail("dungeon-rooms", dsegs);
        findings.notes.push("could not read dungeon segments: " + JSON.stringify(dsegs));
      }

      const cs = await driveCombatStart(page, dungeonCfg.foes);
      findings.combatStart = cs;
      if (cs.ok) {
        legOk("combat-start", { foes: cs.foes });
        // pieces (foe sprites) resolve async — a short settle poll before the combat-start shot, same
        // discipline capture-dungeon-loop.mjs uses.
        await sleep(600);
        await cap.shot("combat_round", "round-1", "combat_start — round 1");
      } else {
        legFail("combat-start", cs);
        findings.notes.push("combat_start could not be driven: " + JSON.stringify(cs));
      }

      // L1 §1 — 2 more rounds, each a REAL attack + move_zone + round_tick(phase:"end") (bumps
      // GS.combat.round — src/world/dm.js:3026-3027), not just an FX ping. Notes carry the actual
      // hit/damage/band delta so the manifest row is self-documenting proof, not just "round N".
      for (let r = 2; r <= 3; r++) {
        const rt = await driveCombatRound(page, r);
        findings["combatRound" + r] = rt;
        if (rt.ok) {
          legOk("combat-round-" + r, rt);
          const a = rt.attack || {};
          await cap.shot("combat_round", "round-" + r,
            `attack(target=${a.targetFid},hit=${a.hit},dmg=${a.damage}) + move_zone(pc:${rt.beforePcBand}->${rt.afterPcBand}) -> round=${rt.round}`);
        } else {
          legFail("combat-round-" + r, rt);
          findings.notes.push("combat round " + r + " could not be driven: " + JSON.stringify(rt));
        }
      }

      // a real state_transition on a rolled interactable, if the room has one.
      const st = await driveStateTransition(page);
      findings.stateTransition = st;
      if (st.ok) {
        legOk("state-transition", st);
        // L1 §2 — refocus the camera on the transition's OWN room before shooting.
        let refocusNote = "";
        if (st.roomSegNum != null) {
          const curCtx = await snapshotContext(page);
          if (curCtx.segNum !== st.roomSegNum) {
            const adv = await driveWalkAdvance(page, st.roomSegNum);
            refocusNote = adv.ok ? ` [camera refocused to S${st.roomSegNum}]` : ` [refocus to S${st.roomSegNum} FAILED: ${JSON.stringify(adv).slice(0, 150)}]`;
          } else {
            refocusNote = ` [already focused on S${st.roomSegNum}]`;
          }
        } else {
          refocusNote = " [no roomSegNum parsed off sourceRef — camera left as-is]";
        }
        await cap.shot("state_transition", st.archetype + "-" + st.from + "-to-" + st.to, `entityRef ${st.entityRef}` + refocusNote);
      }
      else {
        legFail("state-transition", st);
        findings.notes.push("state_transition leg: " + (st.stage === "no-eligible-interactable" ? "this room rolled no interactable with >=2 states (honest — not every room has one)" : JSON.stringify(st)));
      }

      const ce = await driveCombatEnd(page);
      findings.combatEnd = ce;
      if (ce.ok) { legOk("combat-end", ce); await cap.shot("scene", "combat-end", "combat_end(resolved)"); }
      else { legFail("combat-end", ce); findings.notes.push("combat_end could not be driven: " + JSON.stringify(ce)); }

      const dc = await driveDungeonComplete(page);
      findings.dungeonComplete = dc;
      if (dc.ok) { legOk("dungeon-complete", dc); await cap.shot("scene", "dungeon-complete", "walk_complete — frontier cleared"); }
      else { legFail("dungeon-complete", dc); findings.notes.push("dungeon walk_complete failed: " + JSON.stringify(dc)); }
    } else {
      legFail("dungeon-walk", drive);
      findings.notes.push("LEG dungeon-walk could not be driven headless: " + JSON.stringify(drive));
      await cap.shot("scene", "dungeon-fallback", "driveDungeon failed — capturing whatever the standing table shows instead");
    }

    // L1 §4 — record-less settlement leg (unconditional — a standing ledger debt, not route-gated).
    // No active walk at this point (dungeon-complete above cleared it), which move_node requires.
    const recordless = await driveRecordlessSettlement(page);
    findings.recordlessSettlement = recordless;
    if (recordless.ok) {
      legOk("recordless-settlement", recordless);
      await cap.shot("scene", "recordless-settlement",
        `theaterHereSourceFor.kind=${recordless.sourceKind} (expect "settlement" — ENV-3 town builder; hasCodexId=${recordless.hasCodexId})`);
    } else {
      legFail("recordless-settlement", recordless);
      findings.notes.push("LEG recordless-settlement could not be driven headless: " + JSON.stringify(recordless));
    }

    // LEG 5 — shop/interior.
    const shop = await driveOpenShop(page);
    findings.shop = shop;
    if (shop.ok) {
      legOk("shop", shop);
      // L1 §3 — assert the shop panel actually rendered in-capture, don't just trust ok:true.
      const shopVerdict = await verifyShopPanelRendered(page);
      findings.shopRenderVerdict = shopVerdict;
      await cap.shot("scene", "shop-open", `open_shop — GS.gamePanel=shop; render-verdict rendered=${shopVerdict.rendered} shopName="${shopVerdict.shopName}"`);
      await driveCloseShop(page);
      await cap.shot("scene", "shop-closed", "shop closed, back to the standing table");
      // L1 §6 town-beats: an extra open/close cycle to bias this route's leg mix toward town/shop beats.
      if (ROUTE_CFG.extraShopCycle) {
        const shop2 = await driveOpenShop(page);
        findings.shop2 = shop2;
        if (shop2.ok) {
          legOk("shop-cycle-2", shop2);
          const shopVerdict2 = await verifyShopPanelRendered(page);
          findings.shopRenderVerdict2 = shopVerdict2;
          await cap.shot("scene", "shop-open-2", `route=town-beats extra cycle — render-verdict rendered=${shopVerdict2.rendered}`);
          await driveCloseShop(page);
          await cap.shot("scene", "shop-closed-2", "shop closed (extra town-beats cycle)");
        } else {
          legFail("shop-cycle-2", shop2);
          findings.notes.push("town-beats extra shop cycle could not be driven: " + JSON.stringify(shop2));
        }
      }
    } else {
      legFail("shop", shop);
      findings.notes.push("LEG shop could not be driven headless: " + JSON.stringify(shop));
      findings.shopRenderVerdict = { rendered: false, reason: "open_shop-event-failed" };
    }

    // LEG 6 — rest.
    const rest = await driveRest(page);
    findings.rest = rest;
    if (rest.ok) { legOk("rest", rest); await cap.shot("rest", "long-rest", "rest(long) — clock advanced " + (rest.minutes || "?") + "min"); }
    else { legFail("rest", rest); findings.notes.push("LEG rest could not be driven headless: " + JSON.stringify(rest)); }

    // ---- write manifest + findings ----
    const consoleErrors = await page.evaluate(() => (window.__plConsoleErrors || []).slice());
    const urls404 = await page.evaluate(() => (window.__pl404Urls || []).slice());
    const benign404 = urls404.filter((u) => /\/assets\/dressing\/.+\.png$/.test(u) || /\/dm\/health$/.test(u));
    const unexpected404 = urls404.filter((u) => !benign404.includes(u));

    const manifest = {
      runId: RUN_ID, realm: REALM, generatedAt: findings.generatedAt,
      shotCount: cap.count(), maxShots: PLAY_LENS_MAX_SHOTS, capped: cap.capped(),
      kindsPresent: Array.from(new Set(cap.rows().map((r) => r.kind))),
      rows: cap.rows(),
    };
    fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

    findings.shotCount = cap.count();
    findings.kindsPresent = manifest.kindsPresent;
    findings.legOkCount = findings.legs.filter((l) => l.ok).length;
    findings.legFailCount = findings.legs.filter((l) => !l.ok).length;
    findings.consoleErrorCount = consoleErrors.length;
    findings.unexpected404 = unexpected404;
    findings.benign404Count = benign404.length;
    if (unexpected404.length) findings.notes.push("unexpected 404s: " + JSON.stringify(unexpected404));
    fs.writeFileSync(path.join(outDir, "findings.json"), JSON.stringify(findings, null, 2));

    log(`DONE — ${cap.count()} shots, kinds=${manifest.kindsPresent.join(",")}, legs ok=${findings.legOkCount}/${findings.legs.length}`);
    log(`manifest: ${path.join(outDir, "manifest.json")}`);
    log(`findings: ${path.join(outDir, "findings.json")}`);
  } catch (e) {
    findings.fatalError = e.message;
    fs.writeFileSync(path.join(outDir, "findings.json"), JSON.stringify(findings, null, 2));
    log("FATAL:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
