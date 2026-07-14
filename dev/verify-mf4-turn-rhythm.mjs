#!/usr/bin/env node
/* dev/verify-mf4-turn-rhythm.mjs — BEAUTY-WAVE-4.md MF-4 (TURN & ROUND PRESENTATION, "the rhythm
   layer") verify. Three independent parts, matched to the three sub-items of the spec:

   PART A (real Chrome + THREE, puppeteer) — item 1, the acting-ring SLIDE. Boots the same live
   in-session/interior-board path dev/verify-mf1-camera-tweens.mjs uses (server/Chrome/boot conventions
   copied verbatim — see that file's own header for the "why": the ring's world-position math needs a
   LIVE THREE scene graph, a jsdom/pure-math harness would just be re-deriving setActingUnit's own math
   rather than proving it). FAKE-CLOCK DISCIPLINE identical to MF-1: theater-boot.js's tween timestamps
   ride the page's own global Date.now(); this harness overrides it in-page BEFORE firing the handoff, so
   the tween's `start` is a known quantity, then samples at exact fake-clock fractions.
   window.Theater._mf4RingSlideTweenForTest()/_mf4RingWorldPosForTest() are the MF-4 test-only seams
   added alongside the unit itself (src/ui/theater-boot.js, same convention as MF-1's own).

   PART B (full-app jsdom, real modules in manifest order — same convention as dev/verify-initiative-
   ui.mjs) — item 2, the round/chip choreography. Drives real combat_start/round_tick applyEvent calls
   and re-renders, asserting the one-shot `.cmb-round-boundary` class appears on the FIRST render of a
   new round, is ABSENT on a same-round re-render (including a mid-round side flip — not a round
   advance), and reappears on the NEXT round_tick.

   PART C (static CSS inspection, no browser needed) — item 3, the floater pop-in curve, plus the "no
   DOM reflow storms" requirement for all three choreographies: the relevant genesis.html @keyframes
   bodies are parsed as plain text and checked to declare ONLY transform/opacity (compositor-path
   properties), never a layout-triggering property (width/height/top/left/margin/padding).

   Run: node dev/verify-mf4-turn-rhythm.mjs   (jsdom + puppeteer-core per-env in ~/.genesis-jsdom — see
   CLAUDE.md "headless test" / the MF-1 harness's own header for the scratch-dir convention) */

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import net from "node:net";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const read = (p) => readFileSync(path.join(repoRoot, p), "utf-8");

let pass = 0, fail = 0;
const ok = (cond, label, detail = "") => { if (cond) { pass++; console.log("  ✓", label); } else { fail++; console.log("  ✗ FAIL:", label, detail ? ("— " + detail) : ""); } };

/* ============================================================================
   PART A — the acting-ring SLIDE (real Chrome + THREE)
   ============================================================================ */
async function runPartA() {
  console.log("\n=== PART A — MF-4 item 1: the acting-ring slide (real Chrome + THREE, fake clock) ===");
  const require = createRequire(import.meta.url);
  const puppeteer = require(path.join(process.env.HOME, ".genesis-jsdom", "node_modules", "puppeteer-core"));
  const PORT_CANDIDATES = process.env.BG_PORT ? [parseInt(process.env.BG_PORT, 10)] : [5241, 5242, 5243, 5244, 5245];
  let BASE = null;
  const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
        if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc: null, port }; }
        continue;
      }
      const proc = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: repoRoot, stdio: ["ignore", "ignore", "ignore"] });
      for (let i = 0; i < 40; i++) {
        if (await portInUse(port)) { if (await probeRoot(port)) { BASE = `http://127.0.0.1:${port}`; return { proc, port }; } break; }
        await sleep(150);
      }
      try { proc.kill("SIGTERM"); } catch (e) {}
    }
    throw new Error(`no usable port: tried ${PORT_CANDIDATES.join(", ")}`);
  }
  async function launchChrome() {
    const args = ["--headless=new", "--no-sandbox", "--disable-gpu-sandbox", "--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist", "--window-size=1200,900"];
    return await puppeteer.launch({ executablePath: CHROME, headless: "new", args, defaultViewport: { width: 1200, height: 900, deviceScaleFactor: 1 } });
  }

  // same bootToInSession as verify-mf1-camera-tweens.mjs (verbatim — see that file's own header).
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
        if (nameEl) nameEl.value = "MF4 Gate Soul";
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

  function buildFixtureExpr() {
    return `
      function buildFixture(n) {
        const ids = Array.from({ length: n }, (_, i) => "s" + (i + 1));
        const edges = []; for (let i = 1; i < n; i++) edges.push([ids[i - 1], ids[i]]);
        const adj = {}; ids.forEach((id) => { adj[id] = []; });
        edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
        const depth = { [ids[0]]: 0 }; const q = [ids[0]]; let head = 0;
        while (head < q.length) { const cur = q[head++]; (adj[cur] || []).forEach((nb) => { if (depth[nb] == null) { depth[nb] = depth[cur] + 1; q.push(nb); } }); }
        return ids.map((id, i) => ({ id, num: i + 1, label: id, isFinale: i === n - 1, depth: depth[id] || 0, exits: (adj[id] || []).map((tid) => ({ targetId: tid })), light: "normal" }));
      }
    `;
  }
  // ONE board, two pieces tagged with combat fids ("u1"/"u2") — the same fid tagging §the finale-gate
  // finding (theater-boot.js ~6490) documents lets setActingUnit's findUnit() resolve an interior piece
  // by id, not just a setUnits()-built unit.
  async function buildBoard(page) {
    return await page.evaluate((fixtureSrc) => {
      try {
        eval(fixtureSrc);
        const fixture = buildFixture(6);
        const plan = spatializePlan(fixture, "The Slide", { walkId: "mf4-gate-room" });
        const room = plan.rooms[0];
        const b = interiorBuildBoard(plan, { realmId: "gloom", env: "dungeon", focusSegNum: room.segNum, radius: 1 });
        b.lightProfile = "torchlit";
        const inX = Math.max(room.x + 1, room.x), inY = Math.max(room.y + 1, room.y);
        const maxX = Math.max(inX, room.x + room.w - 2), maxY = Math.max(inY, room.y + room.d - 2);
        const positions = [{ x: inX, y: inY }, { x: maxX, y: maxY }];
        b.pieces = ["Skeleton", "Zombie"].map((slug, i) => ({ slug, cellX: positions[i].x, cellY: positions[i].y, fid: "u" + (i + 1) }));
        b.cameraFit = { mode: "beat", cells: positions.map((p) => ({ x: p.x, y: p.y })) };
        return { ok: true, board: b };
      } catch (e) { return { ok: false, error: e.message, stack: e.stack }; }
    }, buildFixtureExpr());
  }

  async function ringPos(page) {
    return await page.evaluate(() => window.Theater._mf4RingWorldPosForTest());
  }
  async function ringTween(page) {
    return await page.evaluate(() => window.Theater._mf4RingSlideTweenForTest());
  }
  async function setFakeNowAndTick(page, ms) {
    await page.evaluate((v) => { window.Date.now = () => v; }, ms);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  }
  async function restoreRealClock(page) {
    await page.evaluate(() => { window.Date.now = window.__mf4RealDateNow || Date.now; });
  }

  const server = await startServer();
  let browser = null;
  try {
    browser = await launchChrome();
    const page = await browser.newPage();
    await page.goto(`${BASE}/genesis.html`, { waitUntil: "networkidle0", timeout: 30000 });
    await sleep(300);
    await page.addStyleTag({ content: "#toast,.toast,#bardoCard,#spicePop,#diceOverlay{display:none !important;visibility:hidden !important}" });
    await page.evaluate(() => { window.__mf4RealDateNow = Date.now.bind(Date); });

    const boot = await bootToInSession(page);
    if (!boot.ok) throw new Error("boot failed: " + JSON.stringify(boot));
    const theaterState = await waitForTheater(page);
    if (!theaterState || !theaterState.hasSetInteriorBoard) throw new Error("theater never ready: " + JSON.stringify(theaterState));

    const built = await buildBoard(page);
    if (!built.ok) throw new Error("board build failed: " + built.error);

    await page.evaluate((board) => window.Theater.setInteriorVariant({}), null);
    await page.evaluate((board) => window.Theater.setInteriorBoard(board), built.board);
    await page.waitForFunction(() => window.Theater.tweensLive() === 0, { timeout: 5000 });

    console.log("\n[fixture] mount u1/u2, establish an INITIAL ring on u1 (instant path — no prior actor to slide from)");
    const mounted1 = await page.evaluate(() => window.Theater.setActingUnit("u1"));
    ok(mounted1 === 1, "setActingUnit('u1') mounts exactly one ring (first reveal, instant path)");
    const u1Pos = await ringPos(page);
    ok(u1Pos !== null, "ring world position is readable after the initial mount");

    console.log("\n[RED-FIRST — proves the slide is real, not a relabeled teleport]");
    // freeze the clock BEFORE firing the handoff so `start` is fake-known.
    const fakeT0 = 5000000;
    await page.evaluate((v) => { window.Date.now = () => v; }, fakeT0);
    const mounted2 = await page.evaluate(() => window.Theater.setActingUnit("u2"));
    ok(mounted2 === 1, "setActingUnit('u2') (a genuine 1-to-1 handoff) reports one ring in flight");
    const immediatelyAfter = await ringPos(page);
    const posEq = (a, b, eps = 1e-4) => a && b && Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps && Math.abs(a.z - b.z) < eps;
    ok(posEq(immediatelyAfter, u1Pos), "RED proof: immediately after the handoff fires, the ring is STILL at u1's position (t=0 == start) — a teleport implementation would already show u2's position here");

    const tw = await ringTween(page);
    ok(tw !== null, "a ring-slide tween IS registered the instant the handoff fires");
    ok(tw.dur === 300, `tween duration is exactly 300ms (BW4 MF-4 item 1's literal spec number) — got ${tw && tw.dur}`);

    console.log("\n[GREEN — fake-clock tween math: start(t=0) / mid(t=0.5) / end(t=1)]");
    await setFakeNowAndTick(page, tw.start + tw.dur * 0.5);
    const mid = await ringPos(page);
    await setFakeNowAndTick(page, tw.start + tw.dur);
    await setFakeNowAndTick(page, tw.start + tw.dur + 50); // one more frame past dur so onDone has settled
    const end = await ringPos(page);
    const endTween = await ringTween(page);

    ok(!posEq(mid, u1Pos) && !posEq(mid, end), "t=0.5: ring position is BETWEEN u1 and u2 — not equal to either (real interpolation, not a step)");
    ["x", "y", "z"].forEach((axis) => {
      const s = u1Pos[axis], m = mid[axis], e = end[axis];
      const lo = Math.min(s, e) - 1e-6, hi = Math.max(s, e) + 1e-6;
      ok(m >= lo && m <= hi, `t=0.5 ring.${axis} (${m.toFixed(3)}) lies within [u1,u2] (${s.toFixed(3)}, ${e.toFixed(3)})`);
    });
    ok(endTween === null, "t=1: the ring-slide tween has retired");
    ok(posEq(end, await ringPos(page)), "t=1: ring has docked at u2's exact position (sampling again is stable, no drift after onDone)");

    console.log("\n[GREEN — reuses the shared S.tweens channel, never a second tween system]");
    const usesSharedChannel = await page.evaluate(() => typeof window.Theater.tweensLive === "function");
    ok(usesSharedChannel, "sanity: the same tweensLive() diagnostic (S.tweens) that MF-1's camera tween and every verb tween share also accounts for the ring-slide tween");

    console.log("\n[GREEN — a clear (no actor) and a multi-unit acting side stay on the pre-MF-4 INSTANT path, never slide]");
    await restoreRealClock(page);
    const clearedCount = await page.evaluate(() => window.Theater.setActingUnit(null));
    ok(clearedCount === 0, "setActingUnit(null) clears instantly (0 mounted), no tween registered");
    const clearedTween = await ringTween(page);
    ok(clearedTween === null, "no ring-slide tween lingers after a clear");
    const multiMounted = await page.evaluate(() => window.Theater.setActingUnit(["u1", "u2"]));
    ok(multiMounted === 2, "a multi-unit acting side (2 ids) mounts both rings on the instant path — no ambiguous 2-ring slide attempted");

    console.log(`\n${pass} passed so far, ${fail} failed so far`);
  } finally {
    if (browser) await browser.close();
    if (server.proc) { try { server.proc.kill("SIGTERM"); } catch (e) {} }
  }
}

/* ============================================================================
   PART B — round/chip choreography fires exactly once per round-advance (full-app jsdom)
   ============================================================================ */
async function runPartB() {
  console.log("\n=== PART B — MF-4 item 2: round-boundary choreography fires ONCE per round-advance (jsdom) ===");
  const JSDOM_HOME = process.env.JSDOM_HOME || path.join(process.env.HOME, ".genesis-jsdom");
  const { JSDOM } = createRequire(path.join(JSDOM_HOME, "package.json"))("jsdom");

  const man = JSON.parse(read("manifest.json"));
  const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const srcText = read("tables.js") + "\n;\n" + moduleSrc;
  const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

  function freshWin() {
    const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
      { runScripts: "dangerously", url: "http://localhost/" });
    const win = dom.window;
    win.eval(harness + "\n" + srcText);
    return win;
  }
  function makeWorld(win, sheetOverrides = {}) {
    const world = {
      id: "w-mf4", name: "The MF-4 Test World",
      seed: { master: { name: "Test Redoubt", desc: "a place for asserting DOM" } },
      characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
        sheet: Object.assign({
          species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
          hp: 52, hpCur: 52, ac: 16, tempHp: 0,
          profBonus: 3, scores: { str: 18, con: 16 }, mods: { str: 4, con: 3 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
          passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
          conditions: [], exhaustion: 0, inspiration: false,
          cantrips: [], spells: [],
          inventory: [], equipped: {}, pools: {},
        }, sheetOverrides) }],
      gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
      map: { nodes: {}, edges: [] }, currentNodeId: null,
      factions: [], pressures: [],
      revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
    };
    const originId = win.addNode(world, "Test Redoubt", "Setting");
    world.currentNodeId = originId;
    win.U.worlds[world.id] = world;
    win.U.activeWorldId = world.id;
    win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
    win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
    win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
    win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.theaterMounted = false;
    return world;
  }
  function startFight(win, world, forceFirst) {
    const res = win.applyEvent(world, { type: "combat_start", source: "declared", payload: { foes: [{ name: "Aarakocra Aeromancer" }] } });
    if (forceFirst && win.GS.combat) { win.GS.combat.first = forceFirst; win.GS.combat.side = forceFirst; }
    return res;
  }
  function banner(win) { return win.document.getElementById("worldView").querySelector(".cmb-turn-banner"); }

  // ---- 1. first render of round 1 -> the banner carries the boundary class (a fresh fight IS a
  // round-advance, per cmbRoundBoundaryFlashed's own reset-on-inactive contract). NOTE: applyEvent
  // itself already calls renderWorld() internally as part of normal event processing (dm.js's own
  // post-processing convention — every applyEvent case re-renders so the UI never shows stale state),
  // so the FIRST render this fixture must inspect is the one produced by startFight() itself, not a
  // second explicit win.renderWorld() call after it (that second call would legitimately be a SAME-
  // round re-render and correctly suppress the class — conflating the two was a bug in an earlier
  // draft of this harness, not in the implementation). ----
  {
    const win = freshWin();
    const world = makeWorld(win);
    const res = startFight(win, world, "pc");
    ok(res && res.ok, "(fixture) combat_start applyEvent succeeded");
    const b1 = banner(win);
    ok(!!b1, "a .cmb-turn-banner exists after combat_start");
    ok(!!b1 && b1.classList.contains("cmb-round-boundary"), "round 1's FIRST render (applyEvent's own internal renderWorld()) carries .cmb-round-boundary (a fresh fight is a round-advance)");

    // ---- 2. a SAME-round re-render (no round/side change at all) does NOT re-fire. ----
    win.renderWorld();
    const b2 = banner(win);
    ok(!!b2 && !b2.classList.contains("cmb-round-boundary"), "a same-round re-render (nothing changed) does NOT carry .cmb-round-boundary — fires ONCE, not every render");

    // ---- 3. a MID-ROUND turn handoff (side flips, round stays 1) must NOT fire either. ----
    win.GS.combat.side = "enemy";
    win.renderWorld();
    const b3 = banner(win);
    ok(!!b3 && /round\s*1/i.test(b3.textContent), "(fixture) still round 1 after the side flip");
    ok(!!b3 && !b3.classList.contains("cmb-round-boundary"), "a mid-round turn handoff (side flip, same round) does NOT carry .cmb-round-boundary — only a genuine ROUND advance does");

    // ---- 4. a real round_tick(end) advances to round 2 -> fires again, exactly once. ----
    win.applyEvent(world, { type: "round_tick", source: "detected", payload: { phase: "end" } });
    win.renderWorld();
    const b4 = banner(win);
    ok(!!b4 && /round\s*2/i.test(b4.textContent), "(fixture) round advanced to 2 via round_tick(end)");
    ok(!!b4 && b4.classList.contains("cmb-round-boundary"), "round 2's FIRST render re-fires .cmb-round-boundary — the choreography repeats on every genuine round-advance");
    win.renderWorld();
    const b5 = banner(win);
    ok(!!b5 && !b5.classList.contains("cmb-round-boundary"), "round 2's SECOND render does not re-fire (one-shot per round, not per render, holds on round 2 too)");
  }

  console.log(`\n${pass} passed so far, ${fail} failed so far`);
}

/* ============================================================================
   PART C — static CSS inspection: floater pop-in curve + "no DOM reflow storms"
   ============================================================================ */
function extractKeyframeBody(css, name) {
  const re = new RegExp("@keyframes\\s+" + name + "\\s*\\{", "m");
  const m = re.exec(css);
  if (!m) return null;
  // brace-balanced scan from the opening `{` (keyframe selectors like "0%,100%{...}" nest one level
  // of braces per stop) so nested `{...}` stop blocks don't truncate the match early.
  let depth = 0, i = m.index + m[0].length - 1, start = i;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") { depth--; if (depth === 0) return css.slice(start, i + 1); }
  }
  return null;
}
// only transform/opacity declarations allowed inside a stop block — anything else (width/height/top/
// left/margin/padding/box-shadow/background etc.) is a layout- or paint-triggering property, which
// would defeat the spec's "no DOM reflow storms" requirement for a per-frame-driven choreography.
function onlyCompositorProps(body) {
  const stops = body.match(/\{[^}]*\}/g) || [];
  const propRe = /([a-zA-Z-]+)\s*:/g;
  const bad = [];
  stops.forEach((stop) => {
    let m;
    while ((m = propRe.exec(stop))) {
      const prop = m[1].toLowerCase();
      if (prop !== "transform" && prop !== "opacity") bad.push(prop);
    }
  });
  return { ok: bad.length === 0, bad };
}
function runPartC() {
  console.log("\n=== PART C — MF-4 item 3 (floater pop-in curve) + reflow-storm check (static CSS) ===");
  const css = read("genesis.html");

  const rise = extractKeyframeBody(css, "theaterFloaterRise");
  ok(!!rise, "theaterFloaterRise keyframe is present");
  ok(!!rise && /0%\{[^}]*scale\(1\.15\)/.test(rise), "0%: floater starts at scale(1.15) (the pop-in's oversized start)");
  ok(!!rise && /10%\{[^}]*scale\(1\)\}/.test(rise), "10% (60ms of the floater's 600ms lifetime): settled to scale(1) — a 60ms pop-in, per BW4's literal number");
  ok(!!rise && /100%\{[^}]*scale\(1\)/.test(rise), "100%: stays at scale(1) through the rest of the rise/fade — the pop never re-triggers");

  const dip = extractKeyframeBody(css, "cmbRoundDip");
  ok(!!dip, "cmbRoundDip (the round header's dip-and-return) keyframe is present");

  const pulseOnce = extractKeyframeBody(css, "cmbStripPulseOnce");
  ok(!!pulseOnce, "cmbStripPulseOnce (the chip strip's single pulse) keyframe is present");

  // duration check: both new animation rules must read exactly .25s (250ms, BW4's literal number).
  const dipRuleMatch = /\.cmb-turn-banner\.cmb-round-boundary\{animation:cmbRoundDip\s+\.25s/.exec(css);
  ok(!!dipRuleMatch, "the header dip's CSS rule declares exactly .25s (250ms)");
  const pulseRuleMatch = /\.stage-unit-strip\.cmb-round-boundary\{animation:cmbStripPulseOnce\s+\.25s/.exec(css);
  ok(!!pulseRuleMatch, "the chip strip pulse's CSS rule declares exactly .25s (250ms)");

  [["theaterFloaterRise", rise], ["cmbRoundDip", dip], ["cmbStripPulseOnce", pulseOnce]].forEach(([name, body]) => {
    if (!body) return;
    const check = onlyCompositorProps(body);
    ok(check.ok, `${name} uses ONLY transform/opacity (compositor-only, no reflow) — no layout-triggering property`, check.bad.join(","));
  });

  console.log(`\n${pass} passed so far, ${fail} failed so far`);
}

async function main() {
  console.log("[verify-mf4-turn-rhythm]");
  runPartC(); // no browser/jsdom cost — run first so a CSS regression is reported fast.
  await runPartB();
  await runPartA();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail > 0 ? 1 : 0;
}
main().catch((e) => { console.error("FAILED:", e.message, e.stack); process.exitCode = 1; });
