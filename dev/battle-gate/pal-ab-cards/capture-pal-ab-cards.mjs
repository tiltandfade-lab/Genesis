#!/usr/bin/env node
/* dev/battle-gate/pal-ab-cards/capture-pal-ab-cards.mjs — WHY sprites read washed-out in-engine vs
   their PNG files (Adam's 2026-07-15 report). Produces three evidence cards, EVIDENCE ONLY (this
   script and its outputs are the entire diff — no product code/asset touched):

     CARD 1 — file vs engine: 4 of 12 sample sprites, raw PNG (composited on neutral) beside its
       in-engine render crop, CURRENT PRODUCTION settings.
     CARD 2 — palette on/off IN-ENGINE: the SAME 6-piece lineup rendered twice at production light —
       once with the current (quantized) assets, once with the restored pre-unification ORIGINALS
       served in their place via a Puppeteer request intercept (never touches the worktree's assets/
       or the root repo — see PALETTE-OFF MECHANISM below).
     CARD 3 — chain isolation (quantized assets, one variable at a time): production baseline · AgX
       vs pre-AgX tonemap · spriteEmissiveFloor->0 · gradeTintScale->0 · combo · all-three-off. Six
       panels, each with measured per-panel stats (mean HSL saturation + RMS luminance contrast over
       diff-masked sprite pixels).

   Model: boot/server/Chrome/board-fixture machinery + the numeric camera-identity proof copied
   VERBATIM from dev/battle-gate/ab-flip-cards/capture-ab-flip.mjs (that file's own header documents
   the renderWorld-poll-starvation gotcha and the _abCacheBust dirtyKey-skip gotcha this script also
   avoids — both reproduced below with the SAME fixes, never re-derived from scratch).

   SAMPLE SET (12 diverse fantasy sprites, extracted from quarantine-pack/pre-unification/
   originals-r2.zip to a SESSION SCRATCH DIR, never into this repo — see ORIGINALS_DIR below):
     spr-fantasy-adult-blue-dragon, spr-fantasy-adult-copper-dragon (Adam's loved ones),
     spr-fantasy-wolf, spr-fantasy-skeleton (the protection set + "something pale"),
     spr-fantasy-giant-fire-beetle ("something saturated"), spr-pc-dragonborn-barbarian-male
     (the pc slug), spr-fantasy-owlbear, spr-fantasy-baboon, spr-fantasy-commoner,
     spr-fantasy-eagle, spr-fantasy-hyena, spr-fantasy-constrictor-snake (the green hue-family case
     ART-DEPARTMENT.md ยง3 names). All 12 verified present in the zip, the registry, and on disk
     BEFORE this script ever runs (a one-time `unzip -l`/grep audit, not re-verified here) — zero
     absent.

   LIVE LINEUP (6 of the 12 — room-capacity reasons, see below): the two loved dragons + wolf +
   skeleton + the saturated beetle + the pc slug. The other 6 (owlbear/baboon/commoner/eagle/hyena/
   constrictor-snake) stay extracted+verified-available but are NOT mounted in this run's lineup —
   an honest scope cut, not a silent drop (recorded in results.json's `sampleSet` block). CARD 1's
   4-of-12 picks are the 4 Adam named explicitly by name (both dragons + wolf + skeleton), all 4
   members of the live lineup so its engine-crop can be sliced straight out of the SAME baseline
   render CARD 2/3 already captured — no extra mount.

   ROOM CAPACITY: reuses capture-ab-flip.mjs's own "The Hub" (n=6) topology + lineupPositions
   guard-cell law verbatim — proven to hold 5 cast members with a full clear guard cell on each
   side; this script's 6-piece cast is one more, so `lineup.compressed` is checked and recorded
   (never silently accepted) rather than assumed fine by analogy.

   CAMERA IDENTITY: ONE establishing pose is captured off the very first mount (the baseline cast
   panel) and reapplied via window.Theater._setInteriorCameraPoseForTest(pos, lookAt) before EVERY
   single shutter across all three cards — the numeric max-delta check (cameraDelta, ported verbatim
   from capture-ab-flip.mjs) is asserted per shot and folded into results.json.camera, not just the
   first pair. "Same scene, same camera" is a measured claim here, not a described one.

   PALETTE-OFF MECHANISM (CARD 2's "restored originals" panel): per this unit's own instruction
   ("point the sprite path at the scratch dir via the harness — e.g. a fetch intercept ... never
   the root repo"), this script mutates each cast slug's SPRITE_REGISTRY[slug].legacyAsset IN-PAGE
   to the SAME path + a "?palOrig=1" cache-buster query string (never touches disk — same
   never-commit-a-mutated-registry discipline capture-ab-flip.mjs's own runtimeAdmitted stub uses).
   The cache-buster is REQUIRED, not decorative: spriteTextureFor(entry) (theater-boot.js ~L3026)
   caches strictly by (slug -> resolvedPath) and only evicts+reloads when the resolved path STRING
   changes (SPRITE_TEXTURE_SRC[slug] !== path) — serving different BYTES at the byte-identical URL
   string (a plain fetch intercept with no query bump) would silently keep showing the FIRST-loaded
   (quantized) texture out of cache, exactly the kind of false-confidence confound capture-ab-flip.mjs's
   own header warns about for its sibling _abCacheBust gotcha. The intercepted request (Puppeteer
   page.on("request"), already wired for the favicon stub) matches the exact "<slug>.png?palOrig=1"
   suffix for a KNOWN cast slug and responds with the scratch-dir original's raw bytes; every other
   request (including the SAME slug's un-suffixed production URL) falls through to page.continue().

   LIGHT-CHAIN ISOLATION MECHANISM (CARD 3): window.Theater._lightLabSetTunable(path, value) (LL-1,
   docs/KENNEY-SOCKET-WAVE.md unit LL-1) is the sanctioned seam for spriteEmissiveFloor/gradeTintScale;
   window.Theater._setGradeTonemapForTest("agx"|"none") is P3-3a's tonemap-curve seam. BUT: this
   script does NOT trust _lightLabSetTunable's own internal replay (lightLabApplyTunables, theater-
   boot.js ~L13586) to force a full rebuild on an ALREADY-MOUNTED board — read closely, that function
   calls setInteriorBoard(S.lastBoard) with the SAME `data` object reference, and setInteriorBoard's
   own dirtyKey guard (`dirtyKey = "interior:"+JSON.stringify(variant)+":"+JSON.stringify(data); if
   (dirtyKey === S.boardKey) { ...skip...; return; }`, ~L10140) recomputes a BYTE-IDENTICAL key in
   that case and SKIPS the rebuild entirely — meaning spriteEmissiveFloor (baked into sprite MATERIAL
   construction at build time) and gradeTintScale (recomputed in updatePostSuiteGrade, only called
   from mountPostSuite at board-mount time) would silently NOT visually apply on a live remount via
   that path alone. (gradeExposureFloor/bloomThreshold/bloomStrength are the exception — those get a
   REDUNDANT direct uniform poke inside lightLabApplyTunables itself, so they'd have worked either
   way; verify-light-lab.mjs ยง3 already pixel-proves exactly those three, and NOT spriteEmissiveFloor/
   gradeTintScale, which is the tell.) This script therefore ALWAYS force-remounts with a fresh
   cache-bust marker (the SAME _abCacheBust trick as capture-ab-flip.mjs) immediately after every
   _lightLabSetTunable/_setGradeTonemapForTest call, rather than relying on the seam's own replay —
   belt-and-suspenders, but the belt is the one actually holding here. Flagged in results.json as a
   real finding for whoever owns the light-lab seam next, not fixed (out of this unit's EVIDENCE-ONLY
   scope).

   Run:  node dev/battle-gate/pal-ab-cards/capture-pal-ab-cards.mjs
   Output: dev/battle-gate/pal-ab-cards/shots/*.png (raw per-panel captures)
           dev/battle-gate/pal-ab-cards/card1-file-vs-engine.png
           dev/battle-gate/pal-ab-cards/card2-palette-on-off.png
           dev/battle-gate/pal-ab-cards/card3-chain-isolation.png
           dev/battle-gate/pal-ab-cards/results.json */

import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const outDir = __dirname;
const shotsDir = path.join(outDir, "shots");
fs.mkdirSync(shotsDir, { recursive: true });

// session scratch dir the calling agent already extracted the 12 originals into (unzip -j from
// quarantine-pack/pre-unification/originals-r2.zip) — NEVER inside this repo, per this unit's own
// instruction ("never the root repo"). If this script is re-run later and the scratchpad has been
// cleared, ORIGINALS_DIR can be overridden via env, or re-populated with the same unzip -j command
// documented in this file's own header/report.
const ORIGINALS_DIR = process.env.PAL_AB_ORIGINALS_DIR
  || "/private/tmp/claude-501/-Volumes-Genesis-Genesis/511b0c52-df6c-4cdb-81d7-16f6f0dd9e7c/scratchpad/pal-ab-originals";

const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5401, 5402, 5403, 5404, 5405];
let BASE = null;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function log(...a) { console.log("[pal-ab-cards]", ...a); }
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

const SHOT_W = 1600, SHOT_H = 1200;
async function launchChrome() {
  const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", `--window-size=${SHOT_W},${SHOT_H}`];
  return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: SHOT_W, height: SHOT_H, deviceScaleFactor: 1 } });
}

// CAST — same 6 registry slugs verified (zip + registry + disk) before this script was written. The
// `name` field is copied VERBATIM from data/sprite-registry.js so spriteEntryFor's normalized-name
// join (theater-boot.js ~L2972) hits on the FIRST try, never the logged fallback scan.
// Order matters here (NOT the order Adam named them in) — a first render pass (this script's own
// dev run, not carried over from elsewhere) put the two Huge/20ft dragons in the MIDDLE of the
// lineup and found the Wolf visually swallowed by the Copper Dragon's own billboard silhouette at
// the room's default spacing: two Gargantuan-scale sprites need real world-space clearance, not just
// image-space clearance, and lineupPositions spaces every piece EVENLY by index regardless of size.
// Fix applied here (not a cosmetic reorder): the two dragons sit TOGETHER at one end (their own
// mutual overlap is an accepted, intentional pairing — Adam wants both in frame), so the four
// modest-scale pieces (Wolf/Skeleton/Beetle/PC) each get a modest-scale neighbor on both sides
// instead of a 20ft silhouette bleeding into their crop rects. Combined with the widened room
// (sizeClass below), verified visually (not just via lineup.compressed) before this script's cards
// were trusted.
const CAST = [
  { pieceSlug: "Wolf", registrySlug: "spr-fantasy-wolf", note: "protection set" },
  { pieceSlug: "Skeleton", registrySlug: "spr-fantasy-skeleton", note: "protection set + pale" },
  { pieceSlug: "Giant Fire Beetle", registrySlug: "spr-fantasy-giant-fire-beetle", note: "saturated (small — expect a tight crop)" },
  { pieceSlug: "Dragonborn Barbarian (Male)", registrySlug: "spr-pc-dragonborn-barbarian-male", note: "pc slug" },
  { pieceSlug: "Adult Blue Dragon", registrySlug: "spr-fantasy-adult-blue-dragon", note: "Adam's loved one" },
  { pieceSlug: "Adult Copper Dragon", registrySlug: "spr-fantasy-adult-copper-dragon", note: "Adam's loved one" },
];
// the 6 extracted-but-not-mounted diversity picks — recorded so results.json's sampleSet block is
// the full 12, not just the live 6.
const EXTRACTED_ONLY = ["spr-fantasy-owlbear", "spr-fantasy-baboon", "spr-fantasy-commoner", "spr-fantasy-eagle", "spr-fantasy-hyena", "spr-fantasy-constrictor-snake"];
// CARD 1's 4-of-12 — the 4 Adam named explicitly, all members of CAST (see header).
const CARD1_SLUGS = ["spr-fantasy-adult-blue-dragon", "spr-fantasy-adult-copper-dragon", "spr-fantasy-wolf", "spr-fantasy-skeleton"];
const REALM = "fantasy";
const LIGHT_PROFILE = "torchlit"; // per this unit's own instruction: ONE torchlit interior light for every card.

async function newPage(browser, paletteOffState) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = req.url();
    if (url.endsWith("/favicon.ico")) {
      req.respond({ status: 200, contentType: "image/gif", body: Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7", "base64") });
      return;
    }
    // PALETTE-OFF intercept — see this file's own header "PALETTE-OFF MECHANISM". Only fires when
    // paletteOffState.active is true AND the URL is the EXACT "<slug>.png?palOrig=1" cache-busted
    // form for a known cast slug — every other request (including the same slug's plain production
    // URL) falls straight through.
    if (paletteOffState.active) {
      const m = url.match(/\/assets\/sprites\/(spr-[a-z0-9-]+)\.png\?palOrig=1$/);
      if (m && paletteOffState.files[m[1]]) {
        req.respond({ status: 200, contentType: "image/png", body: paletteOffState.files[m[1]] });
        return;
      }
    }
    req.continue();
  });
  await page.evaluateOnNewDocument(() => { window.__bgConsoleErrors = []; });
  page.on("console", (msg) => { if (msg.type() === "error") { page.evaluate((t) => { window.__bgConsoleErrors.push(t); }, msg.text()).catch(() => {}); } });
  page.on("pageerror", (e) => { log("PAGE ERROR:", e.message); page.evaluate((t) => { window.__bgConsoleErrors.push("pageerror: " + t); }, e.message).catch(() => {}); });
  page.on("response", (res) => { if (res.status() >= 400 && !res.url().includes("palOrig=1")) log("HTTP", res.status(), res.url()); });
  return page;
}

// bootToInSession/waitForTheater/waitForRepaint — verbatim convention from capture-ab-flip.mjs /
// capture-standee-gallery.mjs (see those files' own headers for the "why").
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
      if (nameEl) nameEl.value = "Pal AB Cards Soul";
      if (typeof bardoWake === "function") bardoWake(); else if (typeof bardoFound === "function") bardoFound();
      const world = (typeof activeWorld === "function") ? activeWorld() : null;
      if (!world) return { ok: false, stage: "no-active-world-after-found", notes };
      if (!world.characters || !world.characters.some((c) => c.status === "living")) return { ok: false, stage: "no-living-pc-after-found", notes };
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
async function waitForRepaint(page) {
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

// buildLineupBoard/lineupPositions — verbatim port from capture-ab-flip.mjs (see that file's own
// header for the "why" of the guard-cell spacing law).
async function buildLineupBoard(page, realmId) {
  return await page.evaluate((realmId) => {
    try {
      function buildFixture(topology, n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const group = topology === "The Hub" ? "hub" : "linear";
        const edges = [];
        if (group === "hub") {
          const spokeCount = Math.min(n - 1, 4);
          for (let i = 1; i < n; i++) edges.push([ids[0], ids[Math.min(i, spokeCount)]]);
        } else {
          for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
        }
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { if (a !== b) { adj[a].push(b); adj[b].push(a); } });
        const depth = { [ids[0]]: 0 };
        const q = [ids[0]]; let head = 0;
        while (head < q.length) {
          const cur = q[head++];
          (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } });
        }
        return ids.map((id, i) => ({
          id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0,
          exits: (adj[id] || []).map((tid) => ({ targetId: tid })),
          light: "normal",
        }));
      }
      const fixture = buildFixture("The Hub", 6);
      // GRID-LAW sizeClass override (place-spatialize.js's own documented opts.sizeClass field,
      // NOT a hack) — the default 4-7 cell range is a coin-flip for a 6-piece lineup (capture-ab-
      // flip.mjs's own 5-piece cast got lucky with a w=7 draw; this script's first unforced run
      // drew w=4 and silently stacked 3 pieces per cell — caught via lineupPositions.compressed +
      // a visual read, not assumed fine by analogy). Forcing a generous room removes the coin-flip.
      const plan = spatializePlan(fixture, "The Hub", { walkId: "pal-ab-cards-" + realmId, sizeClass: { minW: 22, maxW: 26, minD: 10, maxD: 12 } });
      const focusRoom = plan.rooms[0];
      const focusSegNum = focusRoom.segNum;
      const board = interiorBuildBoard(plan, { realmId, env: "dungeon", focusSegNum, radius: 1 });
      return { ok: true, board, room: { x: focusRoom.x, y: focusRoom.y, w: focusRoom.w, d: focusRoom.d } };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, realmId);
}
function lineupPositions(room, count) {
  const marginCells = 1;
  const loX = room.x + marginCells;
  const hiX = room.x + room.w - 1 - marginCells;
  const usable = Math.max(0, hiX - loX);
  const midY = Math.round(room.y + room.d / 2);
  const step = count > 1 ? usable / (count - 1) : 0;
  const positions = [];
  for (let i = 0; i < count; i++) positions.push({ x: Math.round(loX + step * i), y: midY });
  const compressed = count > 1 && step < 1;
  return { positions, compressed, loX, hiX, usable };
}

// mountBoard — verbatim from capture-ab-flip.mjs, INCLUDING its own "never call renderWorld() after
// setInteriorBoard while waiting" gotcha (see that file's own header for the reproduction).
async function mountBoard(page, board, cacheBustLabel) {
  const mounted = await page.evaluate((board, cacheBustLabel) => {
    try {
      const clone = (typeof structuredClone === "function") ? structuredClone(board) : JSON.parse(JSON.stringify(board));
      if (cacheBustLabel != null) clone._abCacheBust = cacheBustLabel;
      window.Theater.setInteriorBoard(clone);
      return { ok: true, piecesResolved: window.Theater.interiorPiecesResolved(), piecesRequested: window.Theater.interiorPiecesRequested() };
    } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
  }, board, cacheBustLabel);
  if (!mounted.ok) return mounted;
  if (mounted.piecesRequested > 0) {
    const deadline = Date.now() + 8000;
    let latest = mounted;
    let ticks = 0;
    while (Date.now() < deadline && latest.piecesResolved < latest.piecesRequested) {
      await sleep(250);
      latest = await page.evaluate(() => ({
        piecesResolved: window.Theater.interiorPiecesResolved(),
        piecesRequested: window.Theater.interiorPiecesRequested(),
      }));
      ticks++;
    }
    mounted.piecesResolved = latest.piecesResolved;
    mounted.settleTicks = ticks;
    mounted.timedOut = latest.piecesResolved < latest.piecesRequested;
  }
  return mounted;
}

async function verifyCastResolution(page, cast) {
  return await page.evaluate((cast) => {
    return cast.map((c) => {
      const entry = window.Theater._spriteEntryForTest ? window.Theater._spriteEntryForTest(c.pieceSlug) : null;
      if (!entry) return { pieceSlug: c.pieceSlug, registrySlug: c.registrySlug, ok: false, reason: "no registry entry" };
      const resolvedPath = window.Theater._spriteAssetPathForTest ? window.Theater._spriteAssetPathForTest(entry) : null;
      const cacheEntry = window.Theater._spriteTextureCache ? window.Theater._spriteTextureCache[entry.slug] : undefined;
      const isLoadedTexture = !!(cacheEntry && typeof cacheEntry === "object" && cacheEntry.isTexture);
      const textureState = isLoadedTexture ? "loaded" : (cacheEntry === "pending" ? "pending" : (cacheEntry === "failed" ? "failed" : "never-requested"));
      return { pieceSlug: c.pieceSlug, registrySlug: entry.slug, resolvedPath, textureState, worldHeight: entry.worldHeight };
    });
  }, cast);
}

// camera pose + projection math — verbatim port from capture-ab-flip.mjs, EXTENDED with a topPoint
// projection (foot + {0,interiorHeight,0}) so this script gets a real projected top-of-silhouette
// pixel instead of approximating it from the mid-height point (needed for a tight, honest crop box —
// see this file's header's "diff-masked sprite pixels" methodology).
async function readSceneTelemetry(page) {
  return await page.evaluate(() => {
    const ctx = window.Theater._graphicsResearchContextForTest ? window.Theater._graphicsResearchContextForTest() : null;
    if (!ctx || !ctx.camera) return { ok: false, reason: "no graphics-research ctx seam" };
    const cam = ctx.camera;
    const pieces = [];
    if (ctx.interiorGroup) {
      ctx.interiorGroup.traverse((obj) => {
        if (obj.userData && obj.userData.sprite && obj.userData.spriteSlug) {
          const e = obj.matrixWorld.elements;
          const wp = { x: e[12], y: e[13], z: e[14] };
          pieces.push({
            spriteSlug: obj.userData.spriteSlug,
            worldPos: { x: wp.x, y: wp.y, z: wp.z },
            interiorWidth: obj.userData.interiorWidth || null,
            interiorHeight: obj.userData.interiorHeight || null,
          });
        }
      });
    }
    return {
      ok: true,
      camera: {
        position: { x: cam.position.x, y: cam.position.y, z: cam.position.z },
        fov: cam.fov, aspect: cam.aspect,
        matrixWorld: cam.matrixWorld.elements.slice(),
        projectionMatrix: cam.projectionMatrix.elements.slice(),
        matrixWorldInverse: cam.matrixWorldInverse.elements.slice(),
      },
      pieces,
    };
  });
}
async function setCameraPose(page, pos, lookAt) {
  return await page.evaluate((pos, lookAt) => {
    if (!window.Theater._setInteriorCameraPoseForTest) return false;
    return window.Theater._setInteriorCameraPoseForTest(pos, lookAt);
  }, pos, lookAt);
}
function multiplyMatVec(mat, v) {
  const e = mat;
  const x = v.x, y = v.y, z = v.z;
  const w = e[3] * x + e[7] * y + e[11] * z + e[15];
  return { x: e[0]*x+e[4]*y+e[8]*z+e[12], y: e[1]*x+e[5]*y+e[9]*z+e[13], z: e[2]*x+e[6]*y+e[10]*z+e[14], w: w || 1 };
}
function worldToNdc(worldPos, camera) {
  const view = multiplyMatVec(camera.matrixWorldInverse, worldPos);
  const clip = multiplyMatVec(camera.projectionMatrix, view);
  return { x: clip.x / clip.w, y: clip.y / clip.w, z: clip.z / clip.w };
}
function ndcToPixel(ndc, canvasBox) {
  return { x: canvasBox.x + ((ndc.x + 1) / 2) * canvasBox.width, y: canvasBox.y + (1 - (ndc.y + 1) / 2) * canvasBox.height };
}
function cameraRightWorld(camera) {
  const e = camera.matrixWorld;
  const rx = e[0], ry = e[1], rz = e[2];
  const len = Math.hypot(rx, ry, rz) || 1;
  return { x: rx / len, y: ry / len, z: rz / len };
}
function cameraForwardWorld(camera) {
  const e = camera.matrixWorld;
  const fx = -e[8], fy = -e[9], fz = -e[10];
  const len = Math.hypot(fx, fy, fz) || 1;
  return { x: fx / len, y: fy / len, z: fz / len };
}
function computePieceObservations(telemetry, canvasBox) {
  const cam = telemetry.camera;
  const right = cameraRightWorld(cam);
  return telemetry.pieces.map((p) => {
    const midHeight = { x: p.worldPos.x, y: p.worldPos.y + (p.interiorHeight || 0) / 2, z: p.worldPos.z };
    const footPoint = p.worldPos;
    const topPoint = { x: p.worldPos.x, y: p.worldPos.y + (p.interiorHeight || 0), z: p.worldPos.z };
    const halfW = (p.interiorWidth || 0) / 2;
    const leftPoint = { x: midHeight.x - right.x * halfW, y: midHeight.y - right.y * halfW, z: midHeight.z - right.z * halfW };
    const rightPoint = { x: midHeight.x + right.x * halfW, y: midHeight.y + right.y * halfW, z: midHeight.z + right.z * halfW };
    const footPx = ndcToPixel(worldToNdc(footPoint, cam), canvasBox);
    const topPx = ndcToPixel(worldToNdc(topPoint, cam), canvasBox);
    const leftPx = ndcToPixel(worldToNdc(leftPoint, cam), canvasBox);
    const rightPx = ndcToPixel(worldToNdc(rightPoint, cam), canvasBox);
    return {
      spriteSlug: p.spriteSlug,
      interiorWidth: p.interiorWidth, interiorHeight: p.interiorHeight,
      worldPos: p.worldPos,
      projectedFootPx: { x: Math.round(footPx.x), y: Math.round(footPx.y) },
      projectedTopPx: { x: Math.round(topPx.x), y: Math.round(topPx.y) },
      projectedLeftPx: { x: Math.round(leftPx.x), y: Math.round(leftPx.y) },
      projectedRightPx: { x: Math.round(rightPx.x), y: Math.round(rightPx.y) },
      projectedWidthPx: Math.round(Math.hypot(rightPx.x - leftPx.x, rightPx.y - leftPx.y)),
    };
  });
}
function cameraDelta(a, b) {
  if (!a || !b) return { ok: false, maxDelta: null };
  const posDelta = Math.max(Math.abs(a.position.x-b.position.x), Math.abs(a.position.y-b.position.y), Math.abs(a.position.z-b.position.z));
  let matDelta = 0;
  for (let i = 0; i < 16; i++) matDelta = Math.max(matDelta, Math.abs(a.matrixWorld[i] - b.matrixWorld[i]));
  const maxDelta = Math.max(posDelta, matDelta);
  return { ok: true, positionMaxDelta: posDelta, matrixWorldMaxDelta: matDelta, maxDelta, identical: maxDelta < 1e-6 };
}

// ─── light-chain state control (CARD 3) ────────────────────────────────────────────────────────────
// Sets spriteEmissiveFloor/gradeTintScale via the sanctioned _lightLabSetTunable seam (storage of
// record) AND the tonemap via _setGradeTonemapForTest, then relies on the CALLER to force a fresh
// cache-busted remount (see this file's header "LIGHT-CHAIN ISOLATION MECHANISM" for why the seam's
// own internal replay is not trusted alone).
async function setChainState(page, { tonemap, spriteEmissiveFloor, gradeTintScale }) {
  return await page.evaluate((tonemap, spriteEmissiveFloor, gradeTintScale) => {
    const r1 = window.Theater._setGradeTonemapForTest(tonemap);
    const r2 = window.Theater._lightLabSetTunable("spriteEmissiveFloor", spriteEmissiveFloor);
    const r3 = window.Theater._lightLabSetTunable("gradeTintScale", gradeTintScale);
    return { tonemapResult: r1, floorApplied: r2, tintApplied: r3, snapshot: window.Theater._lightTunablesForTest(), tonemapNow: window.Theater._gradeTonemapForTest() };
  }, tonemap, spriteEmissiveFloor, gradeTintScale);
}

async function setPaletteOff(page, cast, on) {
  return await page.evaluate((cast, on) => {
    if (typeof SPRITE_REGISTRY === "undefined") return { ok: false, reason: "SPRITE_REGISTRY not loaded" };
    const results = [];
    cast.forEach((c) => {
      const e = SPRITE_REGISTRY[c.registrySlug];
      if (!e) { results.push({ registrySlug: c.registrySlug, ok: false }); return; }
      const prior = e.legacyAsset;
      e.legacyAsset = on ? ("assets/sprites/" + c.registrySlug + ".png?palOrig=1") : ("assets/sprites/" + c.registrySlug + ".png");
      results.push({ registrySlug: c.registrySlug, prior, now: e.legacyAsset });
    });
    return { ok: true, results };
  }, cast, on);
}

async function shootFullPage(page, shotPath) {
  await page.screenshot({ path: shotPath, fullPage: false });
}

// ─── in-page pixel-stat helpers (loaded once, called per-panel via page.evaluate with function
// serialization — canvas getImageData is a browser-only API, so this math has to run in-page, not
// in Node). Methodology, stated plainly for results.json's own "methodology" field:
//   saturation  = mean HSL S (0..1) over INCLUDED pixels.
//   contrast    = RMS/coefficient-of-variation contrast: stdev(L) / mean(L), L = sRGB luma
//                 (0.2126R+0.7152G+0.0722B on the raw 0..255 display-encoded bytes the canvas hands
//                 back — NOT linearized; this is a display-space contrast figure, stated as such, not
//                 claimed as scene-referred linear contrast).
//   ALPHA-masked (CARD 1 raw PNGs): included = alpha > 10.
//   DIFF-masked (CARD 2/3 engine crops): included = per-channel max(|cast-bg|) > threshold (default
//     24/255) at that pixel, i.e. "this pixel changed measurably between the cast-mounted panel and
//     the SAME camera/light/room with zero pieces" — the mechanical definition of "sprite pixel" this
//     script uses, since a raw screenshot carries no per-piece alpha channel of its own.
// ────────────────────────────────────────────────────────────────────────────────────────────────────
function pixelStatsBrowserFns() {
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h, s, l };
  }
  window.__palAbAlphaStats = function (b64, alphaThreshold) {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas"); c.width = im.width; c.height = im.height;
        const ctx = c.getContext("2d"); ctx.drawImage(im, 0, 0);
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let n = 0, satSum = 0, lumas = [];
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a <= alphaThreshold) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const { s } = rgbToHsl(r, g, b);
          satSum += s; n++;
          lumas.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
        }
        if (n === 0) { resolve({ n: 0, meanSaturation: null, rmsContrast: null }); return; }
        const meanL = lumas.reduce((a, b) => a + b, 0) / n;
        const variance = lumas.reduce((a, l) => a + (l - meanL) * (l - meanL), 0) / n;
        const stdev = Math.sqrt(variance);
        resolve({ n, width: im.width, height: im.height, meanSaturation: satSum / n, rmsContrast: meanL > 0 ? stdev / meanL : null, meanLuma: meanL });
      };
      im.onerror = () => resolve({ n: 0, error: "image failed to load" });
      im.src = "data:image/png;base64," + b64;
    });
  };
  window.__palAbDiffStats = function (castB64, bgB64, rect, diffThreshold) {
    return new Promise((resolve) => {
      let loaded = 0; let castImg, bgImg;
      const onBoth = () => {
        const c = document.createElement("canvas"); c.width = rect.w; c.height = rect.h;
        const ctx = c.getContext("2d");
        ctx.drawImage(castImg, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
        const castData = ctx.getImageData(0, 0, rect.w, rect.h).data;
        ctx.clearRect(0, 0, rect.w, rect.h);
        ctx.drawImage(bgImg, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
        const bgData = ctx.getImageData(0, 0, rect.w, rect.h).data;
        let n = 0, satSum = 0; const lumas = [];
        for (let i = 0; i < castData.length; i += 4) {
          const dr = Math.abs(castData[i] - bgData[i]), dg = Math.abs(castData[i + 1] - bgData[i + 1]), db = Math.abs(castData[i + 2] - bgData[i + 2]);
          if (Math.max(dr, dg, db) <= diffThreshold) continue;
          const r = castData[i], g = castData[i + 1], b = castData[i + 2];
          const { s } = rgbToHsl(r, g, b);
          satSum += s; n++;
          lumas.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
        }
        if (n === 0) { resolve({ n: 0, meanSaturation: null, rmsContrast: null, rect }); return; }
        const meanL = lumas.reduce((a, b) => a + b, 0) / n;
        const variance = lumas.reduce((a, l) => a + (l - meanL) * (l - meanL), 0) / n;
        const stdev = Math.sqrt(variance);
        resolve({ n, meanSaturation: satSum / n, rmsContrast: meanL > 0 ? stdev / meanL : null, meanLuma: meanL, rect, maskedFraction: n / (rect.w * rect.h) });
      };
      castImg = new Image(); castImg.onload = () => { loaded++; if (loaded === 2) onBoth(); }; castImg.src = "data:image/png;base64," + castB64;
      bgImg = new Image(); bgImg.onload = () => { loaded++; if (loaded === 2) onBoth(); }; bgImg.src = "data:image/png;base64," + bgB64;
    });
  };
}
async function installPixelStatFns(page) { await page.evaluate(pixelStatsBrowserFns); }
async function alphaStats(page, b64, alphaThreshold = 10) { return await page.evaluate((b64, t) => window.__palAbAlphaStats(b64, t), b64, alphaThreshold); }
async function diffStats(page, castB64, bgB64, rect, diffThreshold = 24) { return await page.evaluate((c, b, r, t) => window.__palAbDiffStats(c, b, r, t), castB64, bgB64, rect, diffThreshold); }

// piece crop rect (screenshot pixel space) from computePieceObservations' projected corners, padded.
function cropRectFor(obs, padFrac = 0.35) {
  const xs = [obs.projectedLeftPx.x, obs.projectedRightPx.x, obs.projectedFootPx.x, obs.projectedTopPx.x];
  const ys = [obs.projectedTopPx.y, obs.projectedFootPx.y];
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const w = Math.max(4, x1 - x0), h = Math.max(4, y1 - y0);
  const padX = w * padFrac, padY = h * padFrac * 0.4; // less vertical pad — foot/top are already exact
  x0 = Math.max(0, Math.round(x0 - padX)); y0 = Math.max(0, Math.round(y0 - padY));
  const w2 = Math.round(w + 2 * padX), h2 = Math.round(h + 2 * padY);
  return { x: x0, y: y0, w: Math.min(w2, SHOT_W - x0), h: Math.min(h2, SHOT_H - y0) };
}

function readPngB64(p) { return fs.readFileSync(p).toString("base64"); }

async function main() {
  let branch = null, sha = null;
  try { branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoRoot }).toString().trim(); } catch (e) {}
  try { sha = execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim(); } catch (e) {}

  // verify the 12-sprite sample set is present in the scratch dir BEFORE booting Chrome — fail loud,
  // never render a card silently missing a subject.
  const ALL_12 = CAST.map((c) => c.registrySlug).concat(EXTRACTED_ONLY);
  const sampleSet = ALL_12.map((slug) => {
    const p = path.join(ORIGINALS_DIR, slug + ".png");
    return { slug, extractedPath: p, present: fs.existsSync(p), bytes: fs.existsSync(p) ? fs.statSync(p).size : null };
  });
  const missing = sampleSet.filter((s) => !s.present);
  if (missing.length) { log("MISSING originals (will be noted, not fatal):", missing.map((m) => m.slug).join(", ")); }

  const server = await startServer();
  log("server:", BASE);
  const browser = await launchChrome();

  const paletteOffState = { active: false, files: {} };
  for (const c of CAST) {
    const p = path.join(ORIGINALS_DIR, c.registrySlug + ".png");
    if (fs.existsSync(p)) paletteOffState.files[c.registrySlug] = fs.readFileSync(p);
  }

  const summary = {
    generatedAt: new Date().toISOString(), branch, sha, realm: REALM, lightProfile: LIGHT_PROFILE,
    sampleSet, castLineup: CAST, extractedOnly: EXTRACTED_ONLY, card1Slugs: CARD1_SLUGS,
    methodology: {
      saturation: "mean HSL S (0..1) over included pixels",
      contrast: "RMS/coefficient-of-variation: stdev(sRGB luma 0.2126R+0.7152G+0.0722B) / mean(luma), display-space bytes, not linearized",
      card1Mask: "raw PNG: alpha > 10 (true alpha channel)",
      card2card3Mask: "engine crop: per-pixel max(|cast_channel - bg_channel|) > 24/255 against a same-camera/same-light/zero-piece background render of the identical room",
    },
    notes: [],
    camera: { poses: [] },
  };

  try {
    const page = await newPage(browser, paletteOffState);
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 60000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    await installPixelStatFns(page);

    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("setInteriorBoard never available: " + JSON.stringify(theaterState));

    const built = await buildLineupBoard(page, REALM);
    if (!built.ok) throw new Error("buildLineupBoard failed: " + built.error);
    const lineup = lineupPositions(built.room, CAST.length);
    if (lineup.compressed) summary.notes.push(`lineupPositions: room.w=${built.room.w} compressed spacing for ${CAST.length} cast members (usable=${lineup.usable}).`);
    summary.room = built.room; summary.lineupPositions = lineup.positions;

    const castBoard = JSON.parse(JSON.stringify(built.board));
    castBoard.lightProfile = LIGHT_PROFILE;
    castBoard.pieces = CAST.map((c, i) => ({ slug: c.pieceSlug, cellX: lineup.positions[i].x, cellY: lineup.positions[i].y }));
    const emptyBoard = JSON.parse(JSON.stringify(built.board));
    emptyBoard.lightProfile = LIGHT_PROFILE;
    emptyBoard.pieces = [];

    const canvasEl = await page.$(".theater-stage-canvas canvas");
    const canvasBox = canvasEl ? await canvasEl.boundingBox() : null;
    if (!canvasBox) throw new Error("theater canvas has no bounding box");

    // read PRODUCTION tunables/tonemap BEFORE any mutation.
    const prod = await page.evaluate(() => ({ tunables: window.Theater._lightTunablesForTest(), tonemap: window.Theater._gradeTonemapForTest() }));
    summary.productionDefaults = { spriteEmissiveFloor: prod.tunables.spriteEmissiveFloor, gradeTintScale: prod.tunables.gradeTintScale, gradeTintMax: prod.tunables.gradeTintMax, gradeExposureFloor: prod.tunables.gradeExposureFloor, tonemap: prod.tonemap };
    log("production defaults:", JSON.stringify(summary.productionDefaults));

    // ─── FIRST mount: production baseline cast — this establishes the ONE camera pose reused for
    // every subsequent shutter in this session (numerically asserted each time via cameraDelta). ───
    const mounted0 = await mountBoard(page, castBoard, "baseline:cast:v1");
    if (!mounted0.ok) throw new Error("baseline cast mount FAILED: " + mounted0.error);
    await sleep(200);
    const tele0 = await readSceneTelemetry(page);
    if (!tele0.ok) throw new Error("no telemetry: " + tele0.reason);
    const controlCam = tele0.camera;
    const forward = cameraForwardWorld(controlCam);
    const lookAtPoint = { x: controlCam.position.x + forward.x * 10, y: controlCam.position.y + forward.y * 10, z: controlCam.position.z + forward.z * 10 };
    await setCameraPose(page, controlCam.position, lookAtPoint);
    await waitForRepaint(page); await sleep(150);

    // per-shutter helper: apply the SAME control pose, screenshot, read telemetry back, assert delta.
    async function shutter(label) {
      await setCameraPose(page, controlCam.position, lookAtPoint);
      await waitForRepaint(page); await sleep(150);
      const shotPath = path.join(shotsDir, `${label}.png`);
      await shootFullPage(page, shotPath);
      const tele = await readSceneTelemetry(page);
      const delta = tele.ok ? cameraDelta(controlCam, tele.camera) : { ok: false };
      summary.camera.poses.push({ label, identical: delta.identical, maxDelta: delta.maxDelta });
      return { shotPath, tele, delta };
    }

    const baselineShot = await shutter("baseline-cast");
    const baselineResolution = await verifyCastResolution(page, CAST);
    const baselineObs = baselineShot.tele.ok ? computePieceObservations(baselineShot.tele, canvasBox) : [];

    const emptyMounted0 = await mountBoard(page, emptyBoard, "baseline:bg:v1");
    if (!emptyMounted0.ok) throw new Error("baseline bg mount FAILED: " + emptyMounted0.error);
    await sleep(200);
    const bgBaselineShot = await shutter("baseline-bg");

    // ═══════════════════════════════ CARD 2 — palette on/off ═══════════════════════════════════════
    log("=== CARD 2: palette on/off ===");
    await setPaletteOff(page, CAST, true);
    paletteOffState.active = true;
    const originalsMounted = await mountBoard(page, castBoard, "originals:cast:v1");
    if (!originalsMounted.ok) summary.notes.push("CARD2 originals mount FAILED: " + originalsMounted.error);
    await sleep(200);
    const originalsResolution = await verifyCastResolution(page, CAST);
    const originalsShot = await shutter("card2-originals-cast");
    const originalsObs = originalsShot.tele.ok ? computePieceObservations(originalsShot.tele, canvasBox) : [];
    paletteOffState.active = false;
    await setPaletteOff(page, CAST, false);

    async function statsForPanel(panelLabel, castShotPath, bgShotPath, obsList) {
      const castB64 = readPngB64(castShotPath);
      const bgB64 = readPngB64(bgShotPath);
      const perPiece = [];
      for (const c of CAST) {
        const obs = obsList.find((o) => o.spriteSlug === c.registrySlug || o.spriteSlug === c.pieceSlug);
        if (!obs) { perPiece.push({ registrySlug: c.registrySlug, ok: false, reason: "not in interiorGroup (never resolved)" }); continue; }
        const rect = cropRectFor(obs);
        const s = await diffStats(page, castB64, bgB64, rect, 24);
        perPiece.push(Object.assign({ registrySlug: c.registrySlug, pieceSlug: c.pieceSlug, ok: true }, s));
      }
      const valid = perPiece.filter((p) => p.ok && p.n > 0);
      const panelMeanSat = valid.length ? valid.reduce((a, p) => a + p.meanSaturation, 0) / valid.length : null;
      const panelMeanContrast = valid.length ? valid.reduce((a, p) => a + p.rmsContrast, 0) / valid.length : null;
      return { panelLabel, perPiece, panelMeanSaturation: panelMeanSat, panelMeanRmsContrast: panelMeanContrast };
    }

    const card2QuantizedStats = await statsForPanel("card2-quantized", baselineShot.shotPath, bgBaselineShot.shotPath, baselineObs);
    const card2OriginalsStats = await statsForPanel("card2-originals", originalsShot.shotPath, bgBaselineShot.shotPath, originalsObs);

    // ═══════════════════════════════ CARD 3 — chain isolation ══════════════════════════════════════
    log("=== CARD 3: chain isolation ===");
    const chainPanels = [
      { key: "p1-baseline", label: "P1 production baseline", tonemap: prod.tonemap, floor: prod.tunables.spriteEmissiveFloor, tint: prod.tunables.gradeTintScale, bgKey: "bgA" },
      { key: "p2-agx-off", label: "P2 AgX OFF (pre-AgX tonemap)", tonemap: "none", floor: prod.tunables.spriteEmissiveFloor, tint: prod.tunables.gradeTintScale, bgKey: "bgB" },
      { key: "p3-floor0", label: "P3 spriteEmissiveFloor -> 0", tonemap: prod.tonemap, floor: 0, tint: prod.tunables.gradeTintScale, bgKey: "bgA" },
      { key: "p4-tint0", label: "P4 gradeTintScale -> 0", tonemap: prod.tonemap, floor: prod.tunables.spriteEmissiveFloor, tint: 0, bgKey: "bgC" },
      { key: "p5-combo", label: "P5 AgX OFF + spriteEmissiveFloor -> 0", tonemap: "none", floor: 0, tint: prod.tunables.gradeTintScale, bgKey: "bgB" },
      { key: "p6-alloff", label: "P6 ALL THREE OFF", tonemap: "none", floor: 0, tint: 0, bgKey: "bgD" },
    ];
    const bgCache = { bgA: { shot: bgBaselineShot.shotPath } }; // bgA == the baseline bg already captured (tonemap=prod, tint=prod)

    async function ensureBg(bgKey, tonemap, tint) {
      if (bgCache[bgKey]) return bgCache[bgKey];
      const r = await setChainState(page, { tonemap, spriteEmissiveFloor: prod.tunables.spriteEmissiveFloor, gradeTintScale: tint });
      const m = await mountBoard(page, emptyBoard, `${bgKey}:bg:v1`);
      if (!m.ok) summary.notes.push(`CARD3 ${bgKey} bg mount FAILED: ${m.error}`);
      await sleep(200);
      const shot = await shutter(`card3-${bgKey}-bg`);
      bgCache[bgKey] = { shot: shot.shotPath, chainState: r.snapshot ? { spriteEmissiveFloor: r.snapshot.spriteEmissiveFloor, gradeTintScale: r.snapshot.gradeTintScale, tonemap: r.tonemapNow } : null };
      return bgCache[bgKey];
    }

    const card3Results = [];
    for (const panel of chainPanels) {
      const chainState = await setChainState(page, { tonemap: panel.tonemap, spriteEmissiveFloor: panel.floor, gradeTintScale: panel.tint });
      const bg = await ensureBg(panel.bgKey, panel.tonemap, panel.tint);
      // re-apply this panel's own chain state (ensureBg may have just mutated it while building a
      // DIFFERENT bg for a later panel's reuse — re-set here defensively before this panel's own cast mount).
      await setChainState(page, { tonemap: panel.tonemap, spriteEmissiveFloor: panel.floor, gradeTintScale: panel.tint });
      const m = await mountBoard(page, castBoard, `${panel.key}:cast:v1`);
      if (!m.ok) summary.notes.push(`CARD3 ${panel.key} cast mount FAILED: ${m.error}`);
      await sleep(200);
      const resolution = await verifyCastResolution(page, CAST);
      const shot = await shutter(`card3-${panel.key}-cast`);
      const obs = shot.tele.ok ? computePieceObservations(shot.tele, canvasBox) : [];
      const stats = await statsForPanel(panel.key, shot.shotPath, bg.shot, obs);
      card3Results.push({ key: panel.key, label: panel.label, tonemap: panel.tonemap, spriteEmissiveFloor: panel.floor, gradeTintScale: panel.tint, bgKey: panel.bgKey, shot: path.relative(outDir, shot.shotPath), bgShot: path.relative(outDir, bg.shot), resolution, stats, chainStateApplied: chainState });
      log(`  ${panel.key}: meanSat=${stats.panelMeanSaturation != null ? stats.panelMeanSaturation.toFixed(3) : "n/a"} rmsContrast=${stats.panelMeanRmsContrast != null ? stats.panelMeanRmsContrast.toFixed(3) : "n/a"}`);
    }

    // restore production defaults defensively before any further mount.
    await setChainState(page, { tonemap: prod.tonemap, spriteEmissiveFloor: prod.tunables.spriteEmissiveFloor, gradeTintScale: prod.tunables.gradeTintScale });

    // ═══════════════════════════════ CARD 1 — file vs engine ═══════════════════════════════════════
    log("=== CARD 1: file vs engine (4 of 12) ===");
    const card1 = [];
    for (const slug of CARD1_SLUGS) {
      const c = CAST.find((x) => x.registrySlug === slug);
      const obs = baselineObs.find((o) => o.spriteSlug === slug || o.spriteSlug === c.pieceSlug);
      const rawPath = path.join(ORIGINALS_DIR, slug + ".png");
      const rawPresent = fs.existsSync(rawPath);
      const rawStats = rawPresent ? await alphaStats(page, readPngB64(rawPath)) : { n: 0, error: "original not found in scratch dir" };
      let engineCrop = null, engineStats = null;
      if (obs) {
        const rect = cropRectFor(obs);
        engineCrop = rect;
        const castB64 = readPngB64(baselineShot.shotPath);
        const bgB64 = readPngB64(bgBaselineShot.shotPath);
        engineStats = await diffStats(page, castB64, bgB64, rect, 24);
      }
      card1.push({ registrySlug: slug, pieceSlug: c.pieceSlug, rawPresent, rawStats, engineCrop, engineStats });
    }

    // ─── build the three composite images ───────────────────────────────────────────────────────────
    const compPage = await browser.newPage();

    // CARD 1 composite: 4 rows x [raw swatch | engine crop], each with a caption of the measured stats.
    const card1Png = await compPage.evaluate(async (rows, castB64, cellW, cellH) => {
      const pad = 10, labelH = 26, capH = 34, rowH = cellH + labelH + capH + pad;
      const canvas = document.createElement("canvas");
      canvas.width = 2 * (cellW + pad) + pad;
      canvas.height = rows.length * rowH + pad + 30;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#eee"; ctx.font = "18px monospace";
      ctx.fillText("CARD 1 — file vs engine (current production settings)", pad, 20);
      function loadImg(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
      const castImg = await loadImg("data:image/png;base64," + castB64);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const y0 = 30 + i * rowH;
        ctx.fillStyle = "#9cf"; ctx.font = "14px monospace";
        ctx.fillText(row.pieceSlug + "  (" + row.registrySlug + ")", pad, y0 + labelH - 8);
        // left: raw swatch on neutral
        const lx = pad, ly = y0 + labelH;
        ctx.fillStyle = "#808080"; ctx.fillRect(lx, ly, cellW, cellH);
        if (row.rawB64) {
          const rawImg = await loadImg("data:image/png;base64," + row.rawB64);
          if (rawImg) {
            const scale = Math.min((cellW * 0.85) / rawImg.width, (cellH * 0.85) / rawImg.height);
            const dw = rawImg.width * scale, dh = rawImg.height * scale;
            ctx.drawImage(rawImg, lx + (cellW - dw) / 2, ly + (cellH - dh) / 2, dw, dh);
          }
        }
        ctx.fillStyle = "#fff"; ctx.font = "11px monospace";
        ctx.fillText("RAW PNG (neutral bg)  sat=" + (row.rawStats.meanSaturation != null ? row.rawStats.meanSaturation.toFixed(3) : "n/a") + "  contrast=" + (row.rawStats.rmsContrast != null ? row.rawStats.rmsContrast.toFixed(3) : "n/a") + "  n=" + row.rawStats.n, lx + 2, ly + cellH + 14);
        // right: engine crop
        const rx = pad * 2 + cellW, ry = y0 + labelH;
        ctx.fillStyle = "#222"; ctx.fillRect(rx, ry, cellW, cellH);
        if (row.engineCrop && castImg) {
          const rct = row.engineCrop;
          const scale = Math.min(cellW / rct.w, cellH / rct.h);
          const dw = rct.w * scale, dh = rct.h * scale;
          ctx.drawImage(castImg, rct.x, rct.y, rct.w, rct.h, rx + (cellW - dw) / 2, ry + (cellH - dh) / 2, dw, dh);
        }
        ctx.fillStyle = "#fff"; ctx.font = "11px monospace";
        const es = row.engineStats || {};
        ctx.fillText("ENGINE CROP (torchlit, prod)  sat=" + (es.meanSaturation != null ? es.meanSaturation.toFixed(3) : "n/a") + "  contrast=" + (es.rmsContrast != null ? es.rmsContrast.toFixed(3) : "n/a") + "  n=" + (es.n || 0), rx + 2, ry + cellH + 14);
      }
      return canvas.toDataURL("image/png").split(",")[1];
    }, card1.map((r) => ({ pieceSlug: r.pieceSlug, registrySlug: r.registrySlug, rawB64: r.rawPresent ? readPngB64(path.join(ORIGINALS_DIR, r.registrySlug + ".png")) : null, rawStats: r.rawStats, engineCrop: r.engineCrop, engineStats: r.engineStats })), readPngB64(baselineShot.shotPath), 420, 460);
    fs.writeFileSync(path.join(outDir, "card1-file-vs-engine.png"), Buffer.from(card1Png, "base64"));

    // CARD 2 composite: 2 panels (quantized vs originals), full lineup frame, captions with per-panel means.
    const card2Png = await compPage.evaluate(async (quantizedB64, originalsB64, quantStats, origStats) => {
      const cellW = 720, cellH = 540, labelH = 30, capH = 40, pad = 10;
      const canvas = document.createElement("canvas");
      canvas.width = 2 * (cellW + pad) + pad; canvas.height = cellH + labelH + capH + 2 * pad;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#eee"; ctx.font = "16px monospace";
      ctx.fillText("CARD 2 — palette restriction ON vs OFF (same lineup, same camera, same torchlit light)", pad, 18);
      function loadImg(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
      const draw = async (b64, ci, title, cap) => {
        const im = await loadImg("data:image/png;base64," + b64);
        const x = pad + ci * (cellW + pad);
        if (im) ctx.drawImage(im, x, labelH + pad, cellW, cellH);
        ctx.fillStyle = "#eee"; ctx.font = "14px monospace"; ctx.fillText(title, x + 4, labelH - 4);
        ctx.fillStyle = "#9cf"; ctx.font = "12px monospace"; ctx.fillText(cap, x + 4, labelH + pad + cellH + 18);
      };
      await draw(quantizedB64, 0, "QUANTIZED (current production — 32-48 color realm palette)", "mean sat=" + (quantStats.panelMeanSaturation != null ? quantStats.panelMeanSaturation.toFixed(3) : "n/a") + "  mean RMS contrast=" + (quantStats.panelMeanRmsContrast != null ? quantStats.panelMeanRmsContrast.toFixed(3) : "n/a"));
      await draw(originalsB64, 1, "RESTORED ORIGINALS (pre-unification, unify-corpus.py OFF)", "mean sat=" + (origStats.panelMeanSaturation != null ? origStats.panelMeanSaturation.toFixed(3) : "n/a") + "  mean RMS contrast=" + (origStats.panelMeanRmsContrast != null ? origStats.panelMeanRmsContrast.toFixed(3) : "n/a"));
      return canvas.toDataURL("image/png").split(",")[1];
    }, readPngB64(baselineShot.shotPath), readPngB64(originalsShot.shotPath), card2QuantizedStats, card2OriginalsStats);
    fs.writeFileSync(path.join(outDir, "card2-palette-on-off.png"), Buffer.from(card2Png, "base64"));

    // CARD 3 composite: 6 panels, 3x2 grid, each labeled with its own stats.
    const card3Png = await compPage.evaluate(async (panels) => {
      const cellW = 500, cellH = 375, labelH = 40, capH = 46, pad = 8, cols = 3;
      const rowsN = Math.ceil(panels.length / cols);
      const canvas = document.createElement("canvas");
      canvas.width = cols * (cellW + pad) + pad; canvas.height = rowsN * (cellH + labelH + capH + pad) + pad + 24;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#eee"; ctx.font = "16px monospace";
      ctx.fillText("CARD 3 — chain isolation (quantized assets, one variable at a time)", pad, 18);
      function loadImg(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
      for (let i = 0; i < panels.length; i++) {
        const p = panels[i];
        const col = i % cols, row = Math.floor(i / cols);
        const x = pad + col * (cellW + pad), y0 = 24 + row * (cellH + labelH + capH + pad);
        const im = await loadImg("data:image/png;base64," + p.b64);
        if (im) ctx.drawImage(im, x, y0 + labelH, cellW, cellH);
        ctx.fillStyle = "#eee"; ctx.font = "12px monospace"; ctx.fillText(p.label, x + 2, y0 + labelH - 22);
        ctx.fillText("tonemap=" + p.tonemap + " floor=" + p.spriteEmissiveFloor + " tint=" + p.gradeTintScale, x + 2, y0 + labelH - 8);
        ctx.fillStyle = "#9cf"; ctx.font = "11px monospace";
        ctx.fillText("meanSat=" + (p.stats.panelMeanSaturation != null ? p.stats.panelMeanSaturation.toFixed(3) : "n/a") + "  rmsContrast=" + (p.stats.panelMeanRmsContrast != null ? p.stats.panelMeanRmsContrast.toFixed(3) : "n/a"), x + 2, y0 + labelH + cellH + 14);
      }
      return canvas.toDataURL("image/png").split(",")[1];
    }, card3Results.map((r) => ({ b64: readPngB64(path.join(outDir, r.shot)), label: r.label, tonemap: r.tonemap, spriteEmissiveFloor: r.spriteEmissiveFloor, gradeTintScale: r.gradeTintScale, stats: r.stats })));
    fs.writeFileSync(path.join(outDir, "card3-chain-isolation.png"), Buffer.from(card3Png, "base64"));

    await compPage.close();

    summary.card1 = card1.map((r) => ({ registrySlug: r.registrySlug, pieceSlug: r.pieceSlug, rawPresent: r.rawPresent, rawStats: r.rawStats, engineCrop: r.engineCrop, engineStats: r.engineStats }));
    summary.card2 = { baselineResolution, originalsResolution, quantized: card2QuantizedStats, originals: card2OriginalsStats, quantizedShot: path.relative(outDir, baselineShot.shotPath), originalsShot: path.relative(outDir, originalsShot.shotPath), bgShot: path.relative(outDir, bgBaselineShot.shotPath) };
    summary.card3 = card3Results;
    summary.consoleErrors = await page.evaluate(() => (window.__bgConsoleErrors || []).slice());
    await page.close();

    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(summary, null, 2));
    log("wrote results.json + 3 composite cards");
  } catch (e) {
    summary.error = e.message; summary.stack = e.stack;
    fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(summary, null, 2));
    log("FAILED:", e.message, e.stack);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

main();
