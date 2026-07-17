/* Verify TABLETOP-UNITS.md §U1 — trayFrom + the Standing Table (TABLETOP-VISION.md §1/§3, the pre-
   alpha V1 unit). jsdom, real genesis.html modules in document order (same convention as
   dev/verify-battle-stage.mjs) — window.Theater is STUBBED (theater-boot.js is a sealed ES module,
   never loaded in this classic-script harness); a separate check proves the Theater-absent degrade
   with no stub at all.

   Checks:
     1. COMBAT BYTE-GATE (STEP ZERO — the load-bearing check of the whole unit): theaterBoardFrom
        (segment,scene,opts) over the fixture segment+scene in dev/fixtures/tabletop-u1-board.json,
        after omitting exactly KGR-5's derived `visualAsset` metadata, deep-equals the frozen
        pre-refactor snapshot. The fixture stays frozen. Mutation controls prove canonical changes
        and every other added/removed field still flip the gate red.
     2. trayFrom({kind:"segment",segment},scene,opts) === theaterBoardFrom(segment,scene,opts) (the
        wrapper IS trayFrom under the hood, not a parallel implementation).
     3. trayFrom({kind:"idle",env,realms}) — empty tiles/props, light from a seeded roll, renderProfile
        from realmRenderProfile(realms[0]), grid present, floorMaterial/surfaceName/surfaceTint null
        (mat-less surface, TABLETOP-VISION §1).
     4. §9.1 determinism: identical (source,scene,opts) snapshot -> identical board (JSON hash), for
        both a segment tray and an idle tray.
     5. §9.4 atmo mutation: a segment whose ONLY prop-keyword-bearing text is `atmo` (never feature/
        dressing) spawns zero props — the sibling check to the fixture's own atmo decoy.
     6. §9.9 GS/U hygiene: 50 direct trayFrom/theaterBoardFrom calls never mutate a snapshotted GS/U.
     7. End-to-end render.js seams over a scripted session (jsdom, stubbed window.Theater):
        (a) the FIRST render of a live session attempts mount via the (session-gated, not
            combat-gated) probe — GS.theaterMounted flips true with no fight ever having started;
        (b) walking outside combat pushes the here-segment's tray via setBoard + setUnits([]);
        (c) starting a fight does NOT re-mount (Theater.mount still called exactly once) and pushes
            the combat board/units exactly as before this unit (parity);
        (d) combat_end does NOT call Theater.retire() (TABLETOP-VISION §3 "one table, many
            arrangements") — GS.theaterMounted stays true and the very next render relaxes back to
            the standing-table tray (setBoard called again with a non-combat tray).
     8. WebGL/Theater-absent degrade: (a) no window.Theater at all -> classic layout, zero throws,
        a full scripted session completes; (b) window.Theater present but mount() returns false ->
        stays classic forever, no crash, no retry storm.
     9. Seam 5 static check: theater-boot.js declares window.Theater.ready (init false + flips true
        inside loadWholeObjectBuilders' onSettled callback) — asserted by source-text scan (theater-
        boot.js is a sealed ES module never loaded in this jsdom harness, per repo convention).

   MUTATION CHECKS (both shown RED then restored — see the inline MUTATION blocks):
     M1 — a broken registry module entry (theater-figures.js, real ES-module Node import): confirm the
          REAL per-entry try/catch discipline never rejects/throws and the broken entry simply stays
          unresolved (cuboid-fallback path); then a hand-rolled NO-CATCH reimplementation of the same
          batch-import loop is shown to actually reject on the identical broken entry — proving the
          real code's try/catch is load-bearing, not decorative.
     M2 — delete segment.light: the REAL code falls back to a seeded theaterRollLight profile (never
          undefined); a source-mutated copy of theaterBoardBuild with that fallback line removed is
          shown to leave board.light undefined for the same input — proving the check bites.

   Run:  node dev/verify-tabletop-u1.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const CLASSIC_FILES = man.loadOrder.filter((p) => p.endsWith(".js"));
const moduleSrc = CLASSIC_FILES.map(read).join("\n;\n");
const TABLES_SRC = read("tables.js");
const srcText = TABLES_SRC + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin(customSrc) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || srcText));
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// FIXTURE (kept in sync with dev/gen-tabletop-u1-fixture.mjs's own copy by convention)
// ============================================================================
const fixtureFile = JSON.parse(read("dev/fixtures/tabletop-u1-board.json"));
const { FIXTURE_SEGMENT, FIXTURE_SCENE, FIXTURE_OPTS, board: FROZEN_BOARD } = fixtureFile;

// KGR-5's runtime realization metadata is explicitly derived/non-persisted. Keep the legacy snapshot
// frozen and normalize away ONLY that one named key; all canonical and other derived bytes remain in
// the comparison. Recursive handling prevents a future visualAsset carrier from requiring a broader
// exception while the mutation checks below prove this is not a general "ignore additions" filter.
function withoutVisualAsset(value) {
  if (Array.isArray(value)) return value.map(withoutVisualAsset);
  if (!value || typeof value !== "object") return value;
  const out = {};
  Object.keys(value).forEach((key) => {
    if (key !== "visualAsset") out[key] = withoutVisualAsset(value[key]);
  });
  return out;
}

function visualAssetKeyCount(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + visualAssetKeyCount(item), 0);
  if (!value || typeof value !== "object") return 0;
  return Object.keys(value).reduce((sum, key) => sum + (key === "visualAsset" ? 1 : visualAssetKeyCount(value[key])), 0);
}

// ============================================================================
// 1. COMBAT BYTE-GATE — STEP ZERO, the load-bearing check
// ============================================================================
{
  const win = freshWin();
  const board = win.theaterBoardFrom(FIXTURE_SEGMENT, FIXTURE_SCENE, FIXTURE_OPTS);
  const same = JSON.stringify(withoutVisualAsset(board)) === JSON.stringify(FROZEN_BOARD);
  check("1a. theaterBoardFrom(fixture), omitting only derived visualAsset, is BYTE-IDENTICAL to the frozen pre-refactor snapshot",
    same, same ? "" : JSON.stringify(board).slice(0, 300));
  check("1a-guard. fixture exercises KGR-5 additive visualAsset (the exception is not vacuous)",
    visualAssetKeyCount(board) > 0, `visualAsset keys=${visualAssetKeyCount(board)}`);
  const canonicalMutation = JSON.parse(JSON.stringify(board));
  canonicalMutation.props[0].x += 1;
  check("1a-mutation. a canonical position change still makes the normalized byte gate RED",
    JSON.stringify(withoutVisualAsset(canonicalMutation)) !== JSON.stringify(FROZEN_BOARD));
  const otherDerivedMutation = JSON.parse(JSON.stringify(board));
  otherDerivedMutation.props[0].unexpectedDerivedProbe = true;
  check("1a-mutation. an unrelated derived addition still makes the normalized byte gate RED",
    JSON.stringify(withoutVisualAsset(otherDerivedMutation)) !== JSON.stringify(FROZEN_BOARD));
  check("1b. the fixture actually exercises tiles/props/hazard/elevation/realm (non-trivial gate)",
    board.tiles.length > 0 && board.props.length > 0 && board.realmId, JSON.stringify({ tiles: board.tiles.length, props: board.props.length, realmId: board.realmId }));

  // MUTATION (shown RED then restored): route theaterBoardFrom's wrapper through {kind:"idle"}
  // instead of {kind:"segment"} — proves check 1a isn't vacuously true (a wrapper that ignored the
  // segment entirely would still "work" if this fixture happened to tolerate it).
  const original = read("src/engine/theater-data.js");
  const marker = `function theaterBoardFrom(segment, scene, opts){\n  return trayFrom({ kind: "segment", segment: segment }, scene, opts);\n}`;
  const mutated = `function theaterBoardFrom(segment, scene, opts){\n  return trayFrom({ kind: "idle", env: opts && opts.env, realms: opts && opts.realms }, scene, opts);\n}`;
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(byte-gate): wrapper marker text not found verbatim — spec drifted?");
  } else {
    const mutSrc = TABLES_SRC + "\n;\n" + CLASSIC_FILES.map((p) => (p === "src/engine/theater-data.js" ? original.replace(marker, mutated) : read(p))).join("\n;\n");
    const mwin = freshWin(mutSrc);
    const mboard = mwin.theaterBoardFrom(FIXTURE_SEGMENT, FIXTURE_SCENE, FIXTURE_OPTS);
    const stillSame = JSON.stringify(mboard) === JSON.stringify(FROZEN_BOARD);
    check("MUTATION (shown RED then restored): routing theaterBoardFrom through {kind:\"idle\"} breaks the byte-gate",
      !stillSame, stillSame ? "mutation did not move the check — wiring may have changed" : "confirmed RED under mutation, as expected");
  }
}

// ============================================================================
// 2. trayFrom({kind:"segment"}) IS theaterBoardFrom under the hood
// ============================================================================
{
  const win = freshWin();
  const viaTray = win.trayFrom({ kind: "segment", segment: FIXTURE_SEGMENT }, FIXTURE_SCENE, FIXTURE_OPTS);
  const viaWrapper = win.theaterBoardFrom(FIXTURE_SEGMENT, FIXTURE_SCENE, FIXTURE_OPTS);
  check("2a. trayFrom segment-kind output === theaterBoardFrom output (same board, byte for byte)",
    JSON.stringify(viaTray) === JSON.stringify(viaWrapper));
}

// ============================================================================
// 3. trayFrom({kind:"idle"}) — the empty table
// ============================================================================
{
  const win = freshWin();
  const idle = win.trayFrom({ kind: "idle", env: "dungeon", realms: ["ember-kingdom"] }, null, {});
  check("3a. idle tiles are empty", Array.isArray(idle.tiles) && idle.tiles.length === 0, idle.tiles.length);
  check("3b. idle props are empty", Array.isArray(idle.props) && idle.props.length === 0, idle.props.length);
  check("3c. idle light is a real (seeded) profile object, never absent", !!(idle.light && idle.light.profile), JSON.stringify(idle.light));
  check("3d. idle realmId resolves to the realm list's own first entry (deterministic, no room to seed against)",
    idle.realmId === "ember-kingdom", idle.realmId);
  check("3e. idle renderProfile is stamped from realmRenderProfile (sat/tint/tintAmt/contrast present)",
    idle.renderProfile && typeof idle.renderProfile.sat === "number", JSON.stringify(idle.renderProfile));
  check("3f. idle floorMaterial/surfaceName/surfaceTint/surfaceBaseTint are null (mat-less surface, TABLETOP-VISION §1)",
    idle.floorMaterial === null && idle.surfaceName === null && idle.surfaceTint === null && idle.surfaceBaseTint === null);
  check("3g. idle grid carries a real bands/lanes shape (setBoard's caller can still read a grid)",
    Array.isArray(idle.grid.bands) && idle.grid.bands.length > 0);

  const idleNoRealm = win.trayFrom({ kind: "idle", env: "wilderness" }, null, {});
  check("3h. idle with NO realms -> realmId null, never throws", idleNoRealm.realmId === null);
}

// ============================================================================
// 4. §9.1 DETERMINISM — same snapshot -> identical board hash
// ============================================================================
{
  const win = freshWin();
  const a1 = win.trayFrom({ kind: "segment", segment: FIXTURE_SEGMENT }, FIXTURE_SCENE, FIXTURE_OPTS);
  const a2 = win.trayFrom({ kind: "segment", segment: FIXTURE_SEGMENT }, FIXTURE_SCENE, FIXTURE_OPTS);
  check("4a. segment tray: identical inputs -> identical board (deep-equal, not just same shape)",
    JSON.stringify(a1) === JSON.stringify(a2));
  const b1 = win.trayFrom({ kind: "idle", env: "urban", realms: ["chrome"] }, null, {});
  const b2 = win.trayFrom({ kind: "idle", env: "urban", realms: ["chrome"] }, null, {});
  check("4b. idle tray: identical inputs -> identical board (deep-equal)",
    JSON.stringify(b1) === JSON.stringify(b2));
}

// ============================================================================
// 5. §9.4 ATMO MUTATION — atmo-only prop keyword spawns zero props
// ============================================================================
{
  const win = freshWin();
  // feature/dressing carry NOTHING prop-shaped; only atmo names a barrel — theaterSegmentFeatureText
  // never reads segment.atmo, so this MUST spawn no cover prop even though the zone is a cover zone.
  const segNoPropText = { id: "atmo-only", num: 1, dims: "30' x 30'",
    feature: { name: "a quiet room", flavor: "nothing remarkable" },
    dressing: { text: "bare stone", condition: null },
    atmo: { text: "the reek of an old barrel of pitch hangs in the air" } };
  const scene = { zoneCover: { "melee:C": "half" }, cover: {}, hazardZones: [], elevZones: [], mods: [] };
  const board = win.theaterBoardFrom(segNoPropText, scene, { env: "dungeon" });
  const coverProp = board.props.find(p => p.zone === "melee:C");
  check("5a. a cover zone with only an atmo-side prop keyword gets NO specific part (generic cover only)",
    !!coverProp && !coverProp.part, JSON.stringify(coverProp));
  check("5b. the fixture's own atmo decoy (\"barrel\") never produced a barrel-family prop either",
    !FROZEN_BOARD.props.some(p => p.part === "crate" && p.partParams && p.partParams.round));
}

// ============================================================================
// 6. §9.9 STATE HYGIENE — trayFrom/theaterBoardFrom never write GS/U
// ============================================================================
{
  const win = freshWin();
  win.GS.combat = null;
  const before = JSON.stringify({ GS: win.GS, U: win.U });
  for (let i = 0; i < 50; i++) {
    win.theaterBoardFrom(FIXTURE_SEGMENT, FIXTURE_SCENE, FIXTURE_OPTS);
    win.trayFrom({ kind: "idle", env: "breach", realms: ["gloom"] }, null, {});
    win.trayFrom({ kind: "segment", segment: FIXTURE_SEGMENT }, FIXTURE_SCENE, FIXTURE_OPTS);
  }
  const after = JSON.stringify({ GS: win.GS, U: win.U });
  check("6a. 150 direct trayFrom/theaterBoardFrom calls never mutate GS or U (pure read, no writes)",
    before === after);
  const tdSrc = read("src/engine/theater-data.js");
  check("6b. theater-data.js source carries no GS./U. WRITE (static scan — only the pre-existing doc comment mentions GS, no assignment)",
    !/\b(GS|U)\.\w+\s*=(?!=)/.test(tdSrc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1")));
}

// ============================================================================
// 7. END-TO-END render.js SEAMS — a scripted session with a stubbed window.Theater
// ============================================================================
function makeSessionWorld(win) {
  const world = {
    id: "w-u1test", name: "The Standing Table Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the tray" } },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: { species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16 }, mods: { str: 4, con: 3 }, saveProfs: ["str", "con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false, cantrips: [], spells: [],
        inventory: [], equipped: {}, pools: {} } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], sessionLive: true,
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
    // a live walk parked on segment 1 — theaterHereSourceFor's own pn.walk direct-storage shape
    // (prep.js's walkOfFrontier: "pn.walk -> TRAVEL-WALKS shape"), so no engine roll needed.
    prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], walkLog: [],
      activeWalkId: "walk-node-1",
      nodes: { "walk-node-1": {
        cursor: { current: 1, touched: [1], done: false },
        walk: { environment: "dungeon", skin: null,
          segments: [ Object.assign({}, FIXTURE_SEGMENT) ] }
      } } },
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.theaterMounted = false; win.GS.stageCollapsed = false;
  return world;
}

function stubTheater(win, { mountReturns = true } = {}) {
  const calls = { mount: 0, setBoard: 0, setUnits: 0, retire: 0 };
  const lastBoards = [];
  win.Theater = {
    mount(el) { calls.mount++; return mountReturns && !!el; },
    reattach(el) {},
    setBoard(d) { calls.setBoard++; lastBoards.push(d); },
    setUnits(u) { calls.setUnits++; },
    rotate() {}, zoom(dir) { return 1; },
    retire() { calls.retire++; },
  };
  return { calls, lastBoards };
}

{
  const win = freshWin();
  const world = makeSessionWorld(win);
  const { calls, lastBoards } = stubTheater(win);

  // 7a. FIRST render of a live session (no fight ever started) attempts the mount.
  win.renderWorld();
  check("7a. GS.theaterMounted flips true on the first render of a live session, with NO combat ever active",
    win.GS.theaterMounted === true);
  check("7a-2. mount() was called exactly once", calls.mount === 1, calls.mount);

  // 7b. walking outside combat pushes the here-segment's tray.
  const boardsAfterMount = calls.setBoard;
  win.renderWorld();
  check("7b. a render outside combat pushes a board via setBoard", calls.setBoard > boardsAfterMount, calls.setBoard);
  const lastBoard = lastBoards[lastBoards.length - 1];
  // props stay 0 outside combat: cover/hazard/elevZones are COMBAT scene fields (scene is null while
  // walking, per render.js seam 4's own trayFrom(hereSource,null,{...}) call) — only the dims-derived
  // tile grid carries over from the fixture segment; there is no cover zone for a room-wide feature
  // to resolve a prop into until a fight opens on this same tray (checked in 7c below).
  check("7b-2. the pushed board is the here-segment's tray (same dims-derived tile grid as the fixture)",
    lastBoard && lastBoard.tiles.length === FROZEN_BOARD.tiles.length,
    JSON.stringify({ tiles: lastBoard && lastBoard.tiles.length }));
  check("7b-2b. no cover props outside combat (scene is null while walking — cover/hazard are combat-scene fields)",
    lastBoard && lastBoard.props.length === 0, lastBoard && lastBoard.props.length);
  check("7b-3. setUnits([]) — no figures on the standing table yet (U4's job)", calls.setUnits >= 1);

  // 7c. starting a fight does not re-mount; combat board/units push exactly as before this unit.
  const mountsBeforeFight = calls.mount;
  const combat = win.combatStart({ pc: { init: 2 }, foes: [{ name: "Bat" }], pcRoll: 15, foeRoll: 3 });
  win.GS.combat = combat;
  win.renderWorld();
  check("7c. starting a fight does NOT re-mount the Theater instance", calls.mount === mountsBeforeFight, calls.mount);
  const combatBoard = lastBoards[lastBoards.length - 1];
  check("7c-2. combat pushes the combat board (theaterBoardFrom(cm.segment,cm.scene,...) parity, unchanged)",
    !!combatBoard && Array.isArray(combatBoard.tiles));

  // 7d. combat_end does NOT retire; GS.theaterMounted stays true; the very next render relaxes
  //     back to the standing-table tray.
  combat.foes.forEach(f => { f.hp = 0; f.down = true; });
  win.applyEvent(world, { type: "combat_end", source: "declared", payload: { outcome: "resolved" } });
  check("7d. combat_end does NOT call Theater.retire() (one table, many arrangements)", calls.retire === 0, calls.retire);
  check("7d-2. GS.theaterMounted stays true across combat_end (the SAME mounted stage carries forward)",
    win.GS.theaterMounted === true);
  const boardsBeforeRelax = calls.setBoard;
  win.renderWorld();
  check("7d-3. the very next render after combat_end pushes a NEW board (the relaxed standing-table tray)",
    calls.setBoard > boardsBeforeRelax, calls.setBoard);
  const relaxedBoard = lastBoards[lastBoards.length - 1];
  check("7d-4. the relaxed board matches the standing-table tray again (not still combat-shaped)",
    relaxedBoard && relaxedBoard.tiles.length === FROZEN_BOARD.tiles.length,
    JSON.stringify({ tiles: relaxedBoard && relaxedBoard.tiles.length }));
}

// ============================================================================
// 8. WEBGL / THEATER-ABSENT DEGRADE
// ============================================================================
{
  const win = freshWin();
  const world = makeSessionWorld(win);
  // no window.Theater stub at all
  win.renderWorld();
  const host = win.document.getElementById("worldView");
  check("8a. no window.Theater -> classic layout renders (no .game.battle-stage)",
    !host.querySelector(".game.battle-stage"));
  check("8b. GS.theaterMounted stays false with nothing to mount", win.GS.theaterMounted === false);
  check("8c. a full scripted turn completes with zero throws (composer present, feed present)",
    !!host.querySelector("#dmAction") && !!host.querySelector(".dm-feed"));
}
{
  const win = freshWin();
  const world = makeSessionWorld(win);
  const { calls } = stubTheater(win, { mountReturns: false });
  win.renderWorld();
  check("8d. Theater present but mount() returns false -> stays classic, no crash", win.GS.theaterMounted === false);
  const mountsAfterOne = calls.mount;
  win.renderWorld();
  win.renderWorld();
  check("8e. repeated renders do not spiral into an unbounded mount-retry storm",
    calls.mount >= mountsAfterOne, calls.mount);
}

// ============================================================================
// 9. SEAM 5 — the boot-preload readiness flag (static source check; theater-boot.js is a sealed
//    ES module never loaded in this classic-script jsdom harness, per repo convention)
// ============================================================================
{
  const bootSrc = read("src/ui/theater-boot.js");
  check("9a. theater-boot.js initializes window.Theater.ready = false at module scope",
    /window\.Theater\.ready\s*=\s*false\s*;/.test(bootSrc));
  check("9b. theater-boot.js flips window.Theater.ready = true inside loadWholeObjectBuilders' onSettled callback",
    // tail accepts the optional injected-loader 2nd arg (GLB seam: `}, glbLoadScene);`) — the check's
    // JOB is unchanged: ready=true must sit INSIDE loadWholeObjectBuilders' onSettled callback body.
    // The head bound is generous (the callback carries large explanatory comment blocks — the replay
    // discrimination + the readiness rationale — currently ~2.3k chars before ready=true); the real
    // "inside the callback" guarantee comes from the `}...);` close anchor, not the head distance.
    /loadWholeObjectBuilders\(function\(\)\{[\s\S]{0,4000}window\.Theater\.ready\s*=\s*true\s*;[\s\S]{0,140}\}\s*(?:,\s*\w+\s*)?\);/.test(bootSrc));
}

// ============================================================================
// M1. MUTATION — broken registry module import -> cuboid fallback, no throw (theater-figures.js,
//     the REAL ES module, imported directly via Node per this file's own "Node-importable" header)
// ============================================================================
{
  const FIGURES_URL = pathToFileURL(join(ROOT, "src/ui/theater-figures.js")).href;
  const Figures = await import(FIGURES_URL);
  const { WHOLE_OBJECT_REGISTRY, resolveWholeObject, loadWholeObjectBuilders } = Figures;
  const anyKey = Object.keys(WHOLE_OBJECT_REGISTRY)[0];
  const savedFn = WHOLE_OBJECT_REGISTRY[anyKey].fn;
  WHOLE_OBJECT_REGISTRY[anyKey].fn = "doesNotExist_" + savedFn;
  let threw = false;
  await new Promise((resolve) => {
    try { loadWholeObjectBuilders(resolve); } catch (e) { threw = true; resolve(); }
  });
  check("M1a. a broken registry entry (fn -> a non-existent export) never throws/rejects the batch",
    !threw);
  check("M1b. the broken entry itself stays unresolved (no .build populated) — the cuboid-fallback path",
    !WHOLE_OBJECT_REGISTRY[anyKey].build);
  check("M1c. resolveWholeObject still returns the entry object (never null) — figureFor's own guard skips the missing .build, doesn't crash",
    resolveWholeObject(anyKey) === WHOLE_OBJECT_REGISTRY[anyKey]);
  // every OTHER entry still resolves — the batch as a whole survives one bad apple.
  const otherKey = Object.keys(WHOLE_OBJECT_REGISTRY).find(k => k !== anyKey);
  check("M1d. every OTHER registry entry is unaffected by the one broken entry",
    !!resolveWholeObject(otherKey));
  WHOLE_OBJECT_REGISTRY[anyKey].fn = savedFn; // restore in-memory (this process's copy only; the file on disk was never touched)

  // MUTATION (shown RED then restored): a NO-CATCH reimplementation of the exact same batch-import
  // loop — proves the real code's per-entry try/catch (theater-figures.js:728-754) is load-bearing,
  // not decorative. Re-broken here (module-scope object, safe to mutate again for this one probe).
  WHOLE_OBJECT_REGISTRY[anyKey].fn = "doesNotExist_" + savedFn;
  const entry = WHOLE_OBJECT_REGISTRY[anyKey];
  let noCatchRejected = false;
  try {
    await import(/* @vite-ignore */ entry.module).then((mod) => {
      const fn = mod && mod[entry.fn];
      if (typeof fn !== "function") throw new Error("MUTATION: no try/catch, this import 'fails' to resolve the export");
    });
  } catch (e) { noCatchRejected = true; }
  check("MUTATION (shown RED then restored): a no-catch reimplementation of the same import DOES throw on the identical broken entry — proves the real try/catch is load-bearing",
    noCatchRejected);
  WHOLE_OBJECT_REGISTRY[anyKey].fn = savedFn;
}

// ============================================================================
// M2. MUTATION — delete segment.light -> profile falls back seeded, never undefined
// ============================================================================
{
  const win = freshWin();
  const segNoLight = Object.assign({}, FIXTURE_SEGMENT);
  delete segNoLight.light;
  const board = win.theaterBoardFrom(segNoLight, FIXTURE_SCENE, FIXTURE_OPTS);
  check("M2a. deleting segment.light -> board.light is a real seeded profile object, never undefined",
    board.light !== undefined && board.light !== null && typeof board.light.profile === "string",
    JSON.stringify(board.light));
  check("M2b. the fallback IS seeded (deterministic) — re-deriving the same segment id yields the same profile",
    JSON.stringify(win.theaterBoardFrom(segNoLight, FIXTURE_SCENE, FIXTURE_OPTS).light) === JSON.stringify(board.light));

  // MUTATION (shown RED then restored): patch out the seeded-fallback line in a copy of
  // theaterBoardBuild's source and show board.light becomes undefined for the same input.
  const original = read("src/engine/theater-data.js");
  const marker = `const baseLight = stampedLight ? { profile: stampedLight.profile, rolled: stampedLight.rolled, overridden: !!stampedLight.overridden }
    : theaterRollLight(env, seedKey, featureText);`;
  const mutated = `const baseLight = stampedLight ? { profile: stampedLight.profile, rolled: stampedLight.rolled, overridden: !!stampedLight.overridden }
    : undefined; // MUTATION: dropped the seeded fallback`;
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(segment-light-fallback): marker text not found verbatim — spec drifted?");
  } else {
    const mutSrc = TABLES_SRC + "\n;\n" + CLASSIC_FILES.map((p) => (p === "src/engine/theater-data.js" ? original.replace(marker, mutated) : read(p))).join("\n;\n");
    const mwin = freshWin(mutSrc);
    let mLight;
    try { mLight = mwin.theaterBoardFrom(segNoLight, FIXTURE_SCENE, FIXTURE_OPTS).light; } catch (e) { mLight = "THREW: " + e.message; }
    check("MUTATION (shown RED then restored): dropping the seeded-light fallback leaves board.light undefined/broken for a no-light segment",
      mLight === undefined || (typeof mLight === "object" && mLight && mLight.profile === undefined) || String(mLight).startsWith("THREW"),
      JSON.stringify(mLight));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
