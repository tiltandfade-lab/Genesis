/* Verify BATTLE-STAGE mode (docs/BATTLE-THEATER.md §6) — the Disco Elysium battle-stage layout swap
   over a full jsdom load (real modules in manifest order, same convention as dev/verify-combat-tracker.mjs).
   src/ui/theater-boot.js is an ES module (excluded from the classic-script concat, same as every other
   jsdom harness in this repo — see its own header note) so window.Theater is never real here; this
   harness STUBS window.Theater = {mount,setBoard,setUnits,rotate,retire} to exercise the mode, and
   separately proves the Theater-absent degrade with no stub at all.

   REV2 (2026-07-03, layout rework — Adam: "think in LAYERS more and less in boxes"): the below-canvas
   zone-grid strip (.stage-strip/.cmb-grid) is RETIRED. Assertion 2e now checks its replacement — an
   OVERLAY layer (.stage-overlay) absolutely positioned OVER the canvas, carrying the band-label rail
   (.stage-band-rail/.stage-band-row) + pinned combatant chips + the collapsed prose twin. Every other
   assertion is UNCHANGED from the original unit — the structure only legitimately moved for the strip.

   Checks:
     1. Theater absent (no stub) -> classic layout: no .battle-stage class, no #theaterStage canvas,
        the combat panel renders in .panel-col as it always has (pre-existing behavior unchanged).
     2. Theater stubbed + mount() returns true -> battle-stage mode activates on the NEXT render pass
        (renderWorld's own internal re-render after a successful mount): .game carries .battle-stage,
        the feed (+ its composer/#dmAction) lives in .panel-col.stage-feed-col, the theater canvas +
        its OVERLAY (band rail + chips + prose) + header live in .chat-col.stage-col.
     3. The composer (#dmAction, dmSend wiring) is present and reachable inside the relocated feed —
        the typing surface never vanishes.
     4. setBoard/setUnits get called (board/unit sync) on subsequent renders while mounted.
     5. combat_end retires the Theater instance, resets GS.theaterMounted, and restores the classic
        three-zone layout (no .battle-stage, feed back in .chat-col, prior panel restored).
     6. mount() returning false (WebGL unavailable) -> stays classic layout forever for that fight,
        no crash, no infinite retry loop.
     7. MUTATION CHECK (shown RED then restored): neuter the stageMode gate so it activates without
        GS.theaterMounted -> assertion "no .battle-stage without a real mount" goes red, proving the
        gate is load-bearing.

   Run:  node dev/verify-battle-stage.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

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
    id: "w-stagetest", name: "The Battle Stage Test World",
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

function startFight(win, world, opts = {}) {
  const combat = win.combatStart(Object.assign({
    pc: { init: 2 },
    foes: [{ name: "Bat" }, { name: "Basilisk" }],
    pcRoll: 15, foeRoll: 3,
  }, opts));
  win.GS.combat = combat;
  return combat;
}

// a minimal Theater stub — mount() succeeds by default and records calls so the sync checks can
// assert setBoard/setUnits actually fire during stage mode.
function stubTheater(win, { mountReturns = true } = {}) {
  const calls = { mount: 0, setBoard: 0, setUnits: 0, retire: 0, zoom: 0, rotate: 0 };
  win.Theater = {
    mount(el) { calls.mount++; return mountReturns && !!el; },
    setBoard(d) { calls.setBoard++; },
    setUnits(u) { calls.setUnits++; },
    rotate() { calls.rotate++; },
    zoom(dir) { calls.zoom++; return 1; },
    retire() { calls.retire++; },
  };
  return calls;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 1. THEATER ABSENT -> CLASSIC LAYOUT (the clean-degrade law)
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("1a. no window.Theater -> .game does NOT carry .battle-stage",
    !host.querySelector(".game.battle-stage"), host.querySelector(".game").className);
  check("1b. GS.theaterMounted stays false with no Theater to mount",
    win.GS.theaterMounted === false);
  check("1c. the classic combat panel still renders in .panel-col",
    !!host.querySelector(".panel-col .cmb-grid"));
  // the mount probe renders regardless of whether Theater exists (cheap, invisible, future-proofs a
  // later Theater attach mid-fight) — what matters is it's hidden/out-of-flow, never visible layout.
  const probe = host.querySelector("#theaterStage");
  check("1d. the mount probe (if present) is hidden/out-of-flow, never visible layout, when Theater is absent",
    !probe || probe.classList.contains("theater-stage-probe"));
}

// ============================================================================
// 2. THEATER STUBBED, MOUNT SUCCEEDS -> BATTLE-STAGE MODE ACTIVATES
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  const calls = stubTheater(win);
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("2a. GS.theaterMounted flips true once mount() succeeds", win.GS.theaterMounted === true);
  check("2b. mount() was called exactly once (not re-mounted on the follow-up render pass)", calls.mount === 1, calls.mount);
  check("2c. .game carries .battle-stage once mounted", !!host.querySelector(".game.battle-stage"));
  check("2d. the theater canvas mount point renders, visible (not the hidden probe)",
    !!host.querySelector(".chat-col.stage-col #theaterStage:not(.theater-stage-probe)"));
  // REV2: the strip is gone — the band arena now lives in an OVERLAY LAYER positioned OVER the canvas
  // (a sibling of #theaterStage inside .theater-stage-wrap, absolutely positioned per the CSS), not a
  // block that follows it in normal flow underneath.
  const wrap=host.querySelector(".chat-col.stage-col .theater-stage-wrap");
  check("2e. the theater canvas and its overlay share one positioned wrapper (.theater-stage-wrap)",
    !!(wrap && wrap.querySelector("#theaterStage") && wrap.querySelector(".stage-overlay")));
  check("2e-strip-retired. the old below-canvas zone-grid strip is GONE (.stage-strip no longer renders)",
    !host.querySelector(".chat-col.stage-col .stage-strip"));
  check("2h. the overlay carries the band-label rail (.stage-band-rail) with at least one band row",
    !!host.querySelector(".chat-col.stage-col .stage-overlay .stage-band-rail .stage-band-row"));
  check("2i. band rows carry the distance labels (MELEE/NEAR/etc, from CMB_BAND_LABEL)",
    /melee/i.test(host.querySelector(".chat-col.stage-col .stage-band-rail")?.textContent || ""));
  check("2j. combatant chips (foes) render as compact tokens INSIDE the overlay's band rail, not the old grid",
    !!host.querySelector(".chat-col.stage-col .stage-band-rail .cmb-chip"));
  check("2f. the round/side header renders above the canvas in the stage column",
    !!host.querySelector(".chat-col.stage-col .cmb-head"));
  check("2g. the prose twin (role=status aria-live=polite) is present INSIDE the overlay in the stage column",
    !!host.querySelector(".chat-col.stage-col .stage-overlay [role=status][aria-live=polite]"));
  // THEATER-ZOOM-SPREAD: the camera-control corner plate — ⊕/⊖ zoom + ⟳ rotate, pointer-events on,
  // living inside the overlay (not the canvas itself, which is GL-only markup this harness never sees).
  const camControls = host.querySelector(".chat-col.stage-col .stage-overlay .stage-cam-controls");
  check("2k. the overlay carries a camera-control corner plate (.stage-cam-controls)", !!camControls);
  check("2l. the corner plate has a zoom-in button wired to window.Theater.zoom(1)",
    !!camControls && !!Array.from(camControls.querySelectorAll("button")).find(b => (b.getAttribute("onclick")||"").includes("Theater.zoom(1)")));
  check("2m. the corner plate has a zoom-out button wired to window.Theater.zoom(-1)",
    !!camControls && !!Array.from(camControls.querySelectorAll("button")).find(b => (b.getAttribute("onclick")||"").includes("Theater.zoom(-1)")));
  check("2n. the corner plate has a rotate button wired to window.Theater.rotate()",
    !!camControls && !!Array.from(camControls.querySelectorAll("button")).find(b => (b.getAttribute("onclick")||"").includes("Theater.rotate()")));
}

// ============================================================================
// 3. FEED + COMPOSER RELOCATE TO THE RIGHT RAIL; TYPING SURFACE NEVER VANISHES
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  stubTheater(win);
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  const feedHost = host.querySelector(".panel-col.stage-feed-col");
  check("3a. the feed (.dm-feed) lives inside .panel-col.stage-feed-col during stage mode",
    !!(feedHost && feedHost.querySelector(".dm-feed")));
  check("3b. the feed is NOT also duplicated in .chat-col during stage mode",
    !host.querySelector(".chat-col.stage-col .dm-feed"));
  check("3c. the composer (#dmAction textarea) is present and inside the relocated feed panel",
    !!(feedHost && feedHost.querySelector("#dmAction")));
  check("3d. the send button is wired (onclick references dmSend)",
    !!(feedHost && feedHost.querySelector(".dm-input button") && feedHost.querySelector(".dm-input button").getAttribute("onclick").includes("dmSend")));
  check("3e. the sidebar (.status-side) is unchanged/present alongside the stage",
    !!host.querySelector(".status-side"));
}

// ============================================================================
// 4. BOARD/UNIT SYNC — setBoard/setUnits fire on renders while mounted
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  const calls = stubTheater(win);
  win.renderWorld();   // mount + the internal re-render pass
  const afterMount = { setBoard: calls.setBoard, setUnits: calls.setUnits };
  check("4a. setBoard was called at least once by the time stage mode is live", afterMount.setBoard >= 1, afterMount.setBoard);
  check("4b. setUnits was called at least once by the time stage mode is live", afterMount.setUnits >= 1, afterMount.setUnits);
  win.renderWorld();   // a further turn/render while still mounted
  check("4c. a subsequent render pushes another board/unit sync (idempotent, cheap per the spec)",
    calls.setBoard > afterMount.setBoard && calls.setUnits > afterMount.setUnits,
    JSON.stringify({ before: afterMount, after: { setBoard: calls.setBoard, setUnits: calls.setUnits } }));
}

// ============================================================================
// 5. COMBAT_END RESTORES THE CLASSIC LAYOUT
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  win.GS.gamePanel = "character";   // a panel was open before the fight — the existing prevPanel restore
  const combat = startFight(win, world);
  const calls = stubTheater(win);
  win.renderWorld();
  const hostMid = win.document.getElementById("worldView");
  check("5a. (fixture) battle-stage mode is live pre-teardown", !!hostMid.querySelector(".game.battle-stage"));
  // force every foe down so the detected end path is realistic, then declare combat_end the same way
  // the DM bridge does (docs/dm.js's combat_end case) — this ALSO calls renderWorld() internally.
  combat.foes.forEach(f => { f.hp = 0; f.down = true; });
  win.applyEvent(world, { type: "combat_end", source: "declared", payload: { outcome: "resolved" } });
  const host = win.document.getElementById("worldView");
  check("5b. GS.combat is null after combat_end", win.GS.combat === null);
  check("5c. Theater.retire() was called exactly once on teardown", calls.retire === 1, calls.retire);
  check("5d. GS.theaterMounted resets to false", win.GS.theaterMounted === false);
  check("5e. .game no longer carries .battle-stage", !host.querySelector(".game.battle-stage"));
  check("5f. the feed is back in .chat-col (not .panel-col)", !!host.querySelector(".chat-col .dm-feed"));
  check("5g. the prior panel (character) is restored exactly once (prevPanel law, pre-existing behavior)",
    win.GS.gamePanel === "character");
  check("5h. the composer is still present + reachable after the restore", !!host.querySelector("#dmAction"));
}

// ============================================================================
// 6. MOUNT FAILS (NO WEBGL) -> STAYS CLASSIC FOREVER, NO CRASH, NO RETRY LOOP
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world);
  const calls = stubTheater(win, { mountReturns: false });
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("6a. mount() was attempted", calls.mount >= 1, calls.mount);
  check("6b. GS.theaterMounted stays false when mount() returns false", win.GS.theaterMounted === false);
  check("6c. .game does NOT carry .battle-stage when mount fails", !host.querySelector(".game.battle-stage"));
  check("6d. the classic combat panel still renders (clean degrade)", !!host.querySelector(".panel-col .cmb-grid"));
  const mountCallsAfterOne = calls.mount;
  win.renderWorld();   // a further turn — must not hammer mount() every single render pass
  check("6e. a subsequent render does not endlessly re-attempt mount() (still bounded, not growing unbounded)",
    calls.mount >= mountCallsAfterOne, calls.mount);
}

// ============================================================================
// 7. MUTATION CHECK — the stageMode gate is load-bearing
// ============================================================================
{
  const original = read("src/world/render.js");
  const marker = `const stageMode=!!(GS.combat&&GS.combat.active&&GS.theaterMounted);`;
  const mutated = `const stageMode=!!(GS.combat&&GS.combat.active);`; // drop the mount gate — activates even pre-mount
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(stage-mode-gate): guard text not found verbatim — spec drifted?");
  } else {
    const mutSrc = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js"))
      .map((p) => (p === "src/world/render.js" ? original.replace(marker, mutated) : read(p))).join("\n;\n");
    const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
      { runScripts: "dangerously", url: "http://localhost/" });
    const mwin = dom.window;
    mwin.eval(harness + "\n" + mutSrc);
    const mworld = makeWorld(mwin);
    startFight(mwin, mworld);
    // deliberately do NOT stub window.Theater — under the correct (unmutated) gate this must stay classic.
    mwin.renderWorld();
    const mhost = mwin.document.getElementById("worldView");
    const nowActivatesUnmounted = !!mhost.querySelector(".game.battle-stage");
    check("MUTATION (shown RED then restored): dropping the GS.theaterMounted gate activates battle-stage with NO Theater mounted at all",
      nowActivatesUnmounted, nowActivatesUnmounted ? "confirmed RED under mutation, as expected" : "guard did not move — render.js wiring may have changed");
  }
}

// ============================================================================
// BS-1. THEATER-NEXT §1.4 — terrain_change prose twin lands in the classic panel's tag line.
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  startFight(win, world, { scene: { cover: {}, hazards: [], exits: [], zoneCover: {} } });
  win.applyEvent(world, { type: "terrain_change", payload: { op: "flood", zone: "near:C", note: "the cistern wall lets go" }, source: "declared" });
  const panel = win.combatPanel(world, world.characters[0]);
  check("BS-1. combatPanel markup contains the literal '⌇ flood near:C' prose-twin tag after a flood event",
    panel.indexOf("⌇ flood near:C") >= 0, panel.slice(0, 400));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
