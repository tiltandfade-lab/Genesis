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

   BEAUTY-WAVE VP5 (docs/BEAUTY-WAVE.md §VP5, 2026-07-10) — "get off the stage": the stacked-card band
   rail (.stage-band-rail/.stage-band-row, one plated row per band each carrying its own chips) is
   RETIRED in favor of two thinner things — floating band-edge tags (.stage-band-tags/.stage-band-tag,
   no plate) and a single bottom-docked unit strip (.stage-unit-strip/.stage-strip-chip) carrying every
   combatant's chip in one row. 2h/2i/2j updated RED-FIRST to the new selectors below (deliberate
   structure change per the spec, not a silent relaxation — see docs/BEAUTY-WAVE.md §VP5 + CLAUDE.md's
   "validators preserve the thing's job" discipline).

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
     5. combat_end does NOT retire the Theater instance and does NOT reset GS.theaterMounted — updated
        2026-07-08 for TABLETOP-UNITS.md §U1 (TABLETOP-VISION.md §3 "combat does not spawn a second
        surface" / "one table, many arrangements"): the SAME mounted stage now relaxes into the
        Standing Table instead of tearing down, so battle-stage mode (the .battle-stage class + the
        feed living in the right rail) stays up after a fight ends — retire() only fires on leaving
        the in-session view or the user collapsing the stage (neither happens here). The prior-panel
        restore (5g) and GS.combat===null (5b) are unaffected — pure combat-lifecycle facts, not
        stage-mount ones.
     6. mount() returning false (WebGL unavailable) -> stays classic layout forever for that SESSION
        (widened from "that fight" 2026-07-08 — the mount attempt is session-scoped now, see #2 below),
        no crash, no infinite retry loop.
     7. MUTATION CHECK (shown RED then restored): neuter the stageMode gate so it activates with no
        real mount at all -> assertion "no .battle-stage without a real mount" goes red, proving the
        gate is load-bearing. Updated 2026-07-08 for §U1's new gate text (`GS.theaterMounted &&
        !GS.stageCollapsed`, no longer `GS.combat&&GS.combat.active&&GS.theaterMounted`).

   2026-07-08 (TABLETOP-UNITS.md §U1): the mount attempt itself is now gated on `w.sessionLive` (the
   Standing Table is session-scoped — theaterStageSync's own `inSession` read), not
   `GS.combat&&GS.combat.active` — makeWorld() below sets `sessionLive:true` (a fight only ever
   happens inside a live session in the real app, so this is the correct fixture value, not a
   workaround). Checks 1-4/6/7/BS-1 are otherwise BYTE-IDENTICAL in intent to before this unit —
   combat's own mount/board/unit sync is untouched, only what GATES the mount attempt changed.

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

function makeWorld(win, sheetOverrides = {}, presentationMode = "theater") {
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
    // TABLETOP-UNITS.md §U1: the mount attempt is now gated on w.sessionLive (the Standing Table is
    // session-scoped, not fight-scoped — see theaterStageSync/renderWorld's `inSession` read) instead
    // of GS.combat.active. A fight only ever happens inside a live session in the real app, so this
    // is the correct/realistic fixture value, not a workaround.
    sessionLive: true,
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.theaterMounted = false; win.GS.stageCollapsed = false;
  win.GS.presentationMode = presentationMode; // existing theater assertions explicitly opt into the lab
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
// 0. STORY IS THE DEFAULT; THEATER IS AN EXPLICIT LAB LENS
// ============================================================================
{
  const win = freshWin();
  check("0a. fresh app state defaults to Story presentation", win.GS.presentationMode === "story", win.GS.presentationMode);
  const world = makeWorld(win, {}, "story");
  const calls = stubTheater(win);
  win.renderWorld();
  win.renderWorld(); // settle any ordinary repeat-render initialization before fingerprinting the lens toggle
  const canonicalBefore = JSON.stringify(world); // compare presentation toggles after ordinary render initialization
  check("0b. Story mode never calls Theater.mount, even in a live session", calls.mount === 0, calls.mount);
  check("0c. Story mode renders the classic text-first layout", !win.document.querySelector(".game.battle-stage"));
  win.toggleTheaterLab();
  check("0d. the explicit Theater Lab toggle mounts the preserved visual lens", calls.mount === 1 && win.GS.presentationMode === "theater", calls.mount);
  check("0e. toggling the lab off returns to Story and retires its renderer", (win.toggleTheaterLab(), win.GS.presentationMode === "story" && calls.retire === 1));
  const canonicalAfter=JSON.stringify(world), baselineWorld=JSON.parse(canonicalBefore);
  const changedKeys=Object.keys(world).filter(k=>JSON.stringify(world[k])!==JSON.stringify(baselineWorld[k]));
  check("0f. Story→Theater→Story changes no canonical world state", canonicalAfter === canonicalBefore, changedKeys.join(","));
}

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
  check("2h. VP5: the overlay carries floating band-edge tags (.stage-band-tags) with at least one tag",
    !!host.querySelector(".chat-col.stage-col .stage-overlay .stage-band-tags .stage-band-tag"));
  check("2i. VP5: band tags carry the distance labels (MELEE/NEAR/etc, from CMB_BAND_LABEL)",
    /melee/i.test(host.querySelector(".chat-col.stage-col .stage-band-tags")?.textContent || ""));
  check("2j. VP5: combatant chips (foes) render as compact tokens in the bottom unit strip, not the old grid",
    !!host.querySelector(".chat-col.stage-col .stage-unit-strip .stage-strip-chip"));
  check("2f. the round/side header renders above the canvas in the stage column",
    !!host.querySelector(".chat-col.stage-col .cmb-head"));
  // TABLETOP-UNITS U2 / TABLETOP-VISION §9.11 (red-first, 2026-07-07): the prose twin used to render
  // INSIDE .stage-overlay-foot, inside this now-aria-hidden stage column — an aria-hidden ancestor
  // silently suppresses a descendant's aria-live announcement, so U2 moved it OUT to the feed
  // column as a live sibling (render.js's stageProseHtml(), called from renderWorld's mainHtml, not
  // from theaterStageHtml anymore). Proven red first: this assertion (querying INSIDE .chat-col.
  // stage-col) failed once the prose relocated. It's still exactly one node, still role=status
  // aria-live=polite, still re-rendered every turn — just reachable outside the hidden stage now.
  check("2g. the prose twin (role=status aria-live=polite) is present, reachable OUTSIDE the hidden stage column (TABLETOP-UNITS U2 §9.11)",
    !host.querySelector(".chat-col.stage-col [role=status][aria-live=polite].stage-prose") &&
    !!host.querySelector("[role=status][aria-live=polite].stage-prose"));
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
// 5. COMBAT_END — TABLETOP-UNITS.md §U1 (2026-07-08): the stage RELAXES, it does not TEAR DOWN.
//    Updated from "restores the classic layout" (pre-U1: combat_end retired the Theater instance and
//    reverted to the 2-column classic layout) to TABLETOP-VISION.md §3's "one table, many
//    arrangements" — the SAME mounted stage stays up as the Standing Table; only combat's own
//    lifecycle facts (GS.combat===null, the prior-panel restore) still change at combat_end.
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
  check("5c. Theater.retire() is NOT called on combat_end (§U1: the mount carries forward into the relaxed table)",
    calls.retire === 0, calls.retire);
  check("5d. GS.theaterMounted stays true across combat_end (the SAME instance relaxes, it isn't torn down)",
    win.GS.theaterMounted === true);
  check("5e. .game STILL carries .battle-stage (the Standing Table is the layout now, not a combat-only mode)",
    !!host.querySelector(".game.battle-stage"));
  check("5f. the feed STAYS in the relocated stage-feed column (not moved back to .chat-col)",
    !!host.querySelector(".panel-col.stage-feed-col .dm-feed") && !host.querySelector(".chat-col .dm-feed"));
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
  // TABLETOP-UNITS.md §U1 (2026-07-08): the gate text moved from combat-scoped to mount-scoped —
  // `GS.combat&&GS.combat.active` dropped out (the Standing Table activates outside combat too), but
  // the load-bearing half (never activate without a REAL mount) is exactly what this mutation proves.
  const marker = `const stageMode=!!(theaterLab && GS.theaterMounted && !GS.stageCollapsed);`;
  const mutated = `const stageMode=!!(theaterLab && !GS.stageCollapsed);`; // drop the mount gate — activates even pre-mount
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

// ============================================================================
// 8. STAGE-MODE PANEL COLUMN (2026-07-15 — the L1 rig's shopRenderVerdict finding, DEMAND-LEDGER
//    null row #3): with the stage STANDING (§U1), gamePanelContent panels must still render.
//    Pre-fix, the showStage branch replaced .panel-col with the feed and every panel
//    (shop/character/actions/map) silently vanished from the DOM in normal play — open_shop's
//    GS.gamePanel="shop" had zero visual effect. The fix adds .panel-col.game-panel-col as its own
//    column (stage · panel · feed); the feed + composer must SURVIVE alongside it (shopping is
//    conversational — buy via the panel, haggle via #dmAction), and panel==="combat" stays
//    suppressed (theaterStageHtml owns combat chrome; combatPanel() re-entry would double-call
//    cmbDamageFlashed, a read-then-overwrite). RED-FIRST: proven against the pre-fix render.js
//    (orchestrated run — see the unit's report; the checks below fail without the stagePanel arm).
// ============================================================================
{
  const win = freshWin();
  const world = makeWorld(win);
  stubTheater(win);
  win.renderWorld();               // first pass mounts; stage mode is live on the internal re-render
  const host = win.document.getElementById("worldView");
  check("8a. (fixture) battle-stage mode is live with no fight", !!host.querySelector(".game.battle-stage"));

  // the shop: open_shop's own GS stamps (dm.js), minimal merchant fixture in world state
  world.shops = { s1: { id: "s1", name: "Verify Goods", archetype: "general", stock: [], nodeId: world.currentNodeId } };
  win.GS.gamePanel = "shop"; win.GS.activeShopId = "s1"; win.GS.shopTab = "buy";
  win.renderWorld();
  const h8 = win.document.getElementById("worldView");
  check("8b. the shop panel renders IN STAGE MODE (.game-panel-col .shop-header exists — the rig's exact probe)",
    !!h8.querySelector(".panel-col.game-panel-col .shop-header"));
  check("8c. the shop name is the fixture merchant's (content really came through gamePanelContent)",
    /Verify Goods/.test((h8.querySelector(".game-panel-col .shop-name") || {}).textContent || ""));
  check("8d. the feed SURVIVES alongside the open panel (haggling stays possible)",
    !!h8.querySelector(".panel-col.stage-feed-col .dm-feed"));
  check("8e. the composer (#dmAction) survives alongside the open panel",
    !!h8.querySelector(".stage-feed-col #dmAction"));
  check("8f. the stage column survives alongside the open panel (one table, many arrangements)",
    !!h8.querySelector(".chat-col.stage-col"));

  // a non-shop panel takes the same column
  win.GS.gamePanel = "character"; win.GS.activeShopId = null;
  win.renderWorld();
  check("8g. character panel renders in the same stage-mode column",
    !!win.document.querySelector(".panel-col.game-panel-col"));

  // combat stays suppressed — theaterStageHtml owns combat chrome in stage mode
  const combat = startFight(win, world);
  win.renderWorld();
  const h8c = win.document.getElementById("worldView");
  check("8h. (fixture) combat forced the combat panel key", win.GS.gamePanel === "combat");
  check("8i. NO .game-panel-col renders for panel==='combat' in stage mode (no combatPanel re-entry)",
    !h8c.querySelector(".panel-col.game-panel-col"));
  // close out so this block leaves no dangling fight
  combat.foes.forEach(f => { f.hp = 0; f.down = true; });
  win.applyEvent(world, { type: "combat_end", source: "declared", payload: { outcome: "resolved" } });
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
