/* dev/verify-env2-travel.mjs — Verify ENV-2 (docs/ENV-EXTERIOR-WAVE.md "Travel legs project their
   rolled biome"). jsdom, real genesis.html classic modules in document order (the established
   convention — see dev/verify-tabletop-u1.mjs/u6.mjs's own header) — window.Theater is STUBBED with a
   call-counting spy exactly like verify-tabletop-u6.mjs's own stubTheater, so this harness drives the
   REAL production seam (rollWildernessWalk -> prepStartTravelWalk -> renderWorld -> theaterHereSourceFor
   -> trayFrom -> castFrom), never a hand-built board fixture.

   RED-FIRST (checked against master tip 749e8dd1, this unit's OWN branch point — `git show
   749e8dd1:src/engine/theater-data.js` swapped in for the on-disk file, everything else real/current):
   before this unit, theaterBoardBuild never read a biome at all for prop generation (only for floor
   tint) and castFrom/arrangeTableau placed every unit in a small local frame authored against (0,0)
   regardless of the mounted board's own tile-bbox center — a wilderness travel leg's board carried
   ZERO dressing props and its PC unit landed on the board's extreme CORNER tile, not its center
   (confirmed live via a real browser session against this exact commit before writing this harness).

   Checks:
     1. RED-FIRST A: the pre-unit theater-data.js yields ZERO dressing-kind props on a real rolled
        wilderness travel leg.
     2. RED-FIRST B: the pre-unit theater-data.js places the PC unit at the board's raw (0,0) — its
        extreme corner tile, not the board's own tile-bbox center (4,5.5 for the default 4x3 grid).
     3. GREEN — the real (current) source: a real rolled travel leg yields >= ENV2_DRESSING_MIN_COUNT
        dressing props, the PC unit mounts within the board's real footprint at its visual center.
     4. Determinism: same walkId+leg -> byte-identical scatter (called twice).
     5. Different biome -> a disjoint dressing-slug pool (BIOME_DRESSING's own construction).
     6. No scatter ever lands on the center (walking) lane.
     7. The raw segment record is byte-untouched by the board build (walk-native law).
     8. Ground material: THEATER_FLOOR_BIOME_MAP now resolves the two biomes (Deeplands/Underwater)
        the OLD map's stale Underdark/Jungle keys never matched.
     9. Combat scope boundary: a board built the SAME way combat_start calls it (no opts.walkId) never
        gets biome dressing — the byte-gates protecting combat boards stay untouched by this unit.
    10. Unknown biome degrades to the generic pool (logged), never throws.

   Run:  node dev/verify-env2-travel.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const CLASSIC_FILES = man.loadOrder.filter((p) => p.endsWith(".js"));
const TABLES_SRC = read("tables.js");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

// buildModuleSrc(overrides): `overrides` is {relativePath: sourceText} — every OTHER file loads
// verbatim from disk, in the SAME manifest loadOrder every other jsdom harness in this repo uses.
function buildModuleSrc(overrides) {
  overrides = overrides || {};
  return CLASSIC_FILES.map((p) => (Object.prototype.hasOwnProperty.call(overrides, p) ? overrides[p] : read(p))).join("\n;\n");
}
// a top-level `const` in a classic <script> (or an indirect win.eval, same realm semantics) is a
// GLOBAL LEXICAL binding — readable by bare name from later code in the SAME realm, but never mirrored
// onto `window` itself (unlike `var`/`function`, which DO become window properties — this is why
// win.renderWorld()/win.GS work directly but win.ENV2_DRESSING_MIN_COUNT would not). Stamp the handful
// of consts this harness needs onto `this` explicitly — the SAME "this.__foo=typeof foo..." bridge
// dev/verify-place-distribution.mjs's own check 8 already uses for ROOM_PLACE_DISTRIBUTE.
const CONST_STAMPS = [
  "this.ENV2_DRESSING_MIN_COUNT=typeof ENV2_DRESSING_MIN_COUNT!=='undefined'?ENV2_DRESSING_MIN_COUNT:undefined;",
  "this.BIOME_DRESSING=typeof BIOME_DRESSING!=='undefined'?BIOME_DRESSING:undefined;",
  "this.BIOME_DRESSING_GENERIC=typeof BIOME_DRESSING_GENERIC!=='undefined'?BIOME_DRESSING_GENERIC:undefined;",
  "this.THEATER_FLOOR_BIOME_MAP=typeof THEATER_FLOOR_BIOME_MAP!=='undefined'?THEATER_FLOOR_BIOME_MAP:undefined;",
].join("\n");
function freshWin(overrides) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + TABLES_SRC + "\n;\n" + buildModuleSrc(overrides) + "\n;\n" + CONST_STAMPS);
  return win;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));
const redCheck = (name, cond, detail = "") =>
  !cond ? (pass++, console.log("  RED-CONFIRMED", name)) : (fail++, console.log("  RED-NOT-PROVEN", name, "(unexpectedly passed under the pre-unit source)", detail));

function stubTheater(win) {
  const calls = { mount: 0, setBoard: 0, setUnits: 0 };
  const lastBoards = [];
  const lastUnits = [];
  win.Theater = {
    mount(el) { calls.mount++; return !!el; },
    reattach() {},
    setBoard(d) { calls.setBoard++; lastBoards.push(d); },
    setInteriorBoard(d) { calls.setBoard++; lastBoards.push(d); },
    setUnits(u) { calls.setUnits++; lastUnits.push(Array.isArray(u) ? u : ((u && u.units) || [])); },
    rotate() {}, zoom() { return 1; }, retire() {},
  };
  return { calls, lastBoards, lastUnits };
}

function makeSessionWorld(win) {
  const world = {
    id: "w-env2test", name: "The ENV-2 Test World",
    seed: { master: { name: "Test Mire", desc: "a place for asserting the travel tray" } },
    characters: [{ id: "c1", status: "living", name: "Ashen Vell", headline: "a test soul", spark: "a test soul", pronouns: "she",
      sheet: { species: "Human", class: "Barbarian", background: "Soldier", level: 1, xp: 0,
        hp: 13, hpCur: 13, ac: 11, tempHp: 0,
        profBonus: 2, scores: { str: 16, con: 14 }, mods: { str: 3, con: 2 }, saveProfs: ["str", "con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: null,
        conditions: [], exhaustion: 0, inspiration: false, cantrips: [], spells: [],
        inventory: [], equipped: {}, pools: {} } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], sessionLive: true,
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
    prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], walkLog: [], activeWalkId: null, nodes: {} },
  };
  const originId = win.addNode(world, "Origin", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.theaterMounted = false; win.GS.stageCollapsed = false;
  return world;
}

// mints + mounts a real rolled wilderness TRAVEL walk (prepStartTravelWalk's own shape, src/world/
// prep.js — the SAME shape travel_start stamps) with a forced per-leg biome array (TRAVEL-WALKS.md
// §3's opts.biomes override, wild-walk.js) so the harness can pin exact biomes for its own assertions
// rather than depending on an unseeded random roll.
function mountTravelWalk(win, world, biomes, legIdOverride) {
  const wildWalk = win.rollWildernessWalk({ legCount: biomes.length, tier: 1, kind: "travel", biomes });
  const originId = world.currentNodeId;
  const destId = win.addNode(world, "Distant Hollow " + (legIdOverride || "x"), "Place");
  const r = win.prepStartTravelWalk(world, { destNodeId: destId, originNodeId: originId, travelMin: 60, walk: wildWalk });
  return { ok: r.ok, walkId: destId, walk: wildWalk };
}

// ============================================================================
// 1/2 — RED-FIRST: master tip 749e8dd1's theater-data.js (this unit's own branch point)
// ============================================================================
console.log("=== RED-FIRST: theater-data.js @ 749e8dd1 (this unit's branch point) ===");
{
  const preUnitTheaterData = execFileSync("git", ["show", "749e8dd1:src/engine/theater-data.js"], { cwd: ROOT, encoding: "utf-8" });
  check("0-setup. the pre-unit blob loaded from git is NOT byte-identical to the current file (a real diff exists to test against)",
    preUnitTheaterData !== read("src/engine/theater-data.js"));

  const win = freshWin({ "src/engine/theater-data.js": preUnitTheaterData });
  const world = makeSessionWorld(win);
  const { lastBoards, lastUnits } = stubTheater(win);
  const mounted = mountTravelWalk(win, world, ["Forest", "Forest", "Forest"], "red");
  check("0-setup. the pre-unit sandbox mints + mounts a real travel walk", mounted.ok);

  win.renderWorld(); // mount pass
  win.renderWorld(); // real board/units push
  const board = lastBoards[lastBoards.length - 1];
  const units = lastUnits[lastUnits.length - 1];
  const dressing = (board && board.props || []).filter((p) => p && p.kind === "dressing");
  redCheck("1. RED-FIRST A: the pre-unit board carries ZERO dressing-kind props on a real rolled Forest travel leg",
    dressing.length > 0, JSON.stringify({ propsLength: board && board.props && board.props.length }));

  const pc = (units || []).find((u) => u.kind === "pc");
  check("2-setup. the pre-unit tableau still stages a PC unit at all", !!pc);
  // the default 4x3 combat-zone grid's own tile-bbox center is (4,5.5) — theaterBoardCenterFor's exact
  // formula, verified live against a real browser session (see this unit's own session report).
  const atCorner = pc && pc.x === 0 && pc.z === 0;
  redCheck("2. RED-FIRST B: the pre-unit PC unit lands at the board's raw (0,0) corner, not its (4,5.5) visual center",
    !atCorner, JSON.stringify({ pcX: pc && pc.x, pcZ: pc && pc.z }));
}

// ============================================================================
// 3-10 — GREEN: the real (current, on-disk) source
// ============================================================================
console.log("\n=== GREEN: the real (current) source ===");
{
  const win = freshWin();
  const world = makeSessionWorld(win);
  const { lastBoards, lastUnits } = stubTheater(win);
  const mounted = mountTravelWalk(win, world, ["Forest", "Desert", "Swamp"], "green");
  check("3-setup. the real sandbox mints + mounts a real 3-leg travel walk (Forest/Desert/Swamp)", mounted.ok);

  win.renderWorld(); // mount
  win.renderWorld(); // leg 1 (Forest) board/units push
  const board1 = lastBoards[lastBoards.length - 1];
  const units1 = lastUnits[lastUnits.length - 1];
  const dressing1 = (board1.props || []).filter((p) => p && p.kind === "dressing");

  check("3a. >= ENV2_DRESSING_MIN_COUNT dressing objects on the Forest leg's real board",
    dressing1.length >= win.ENV2_DRESSING_MIN_COUNT, dressing1.length);
  check("3b. every dressing entry carries a real assets/dressing/<slug> from the Forest pool",
    dressing1.every((d) => win.BIOME_DRESSING.Forest.pool.some((p) => p.slug === d.slug)), JSON.stringify(dressing1.map((d) => d.slug)));

  const pc1 = units1.find((u) => u.kind === "pc");
  check("3c. the PC unit mounts on the Forest leg's board", !!pc1);
  const halfX = board1.grid && board1.grid.laneCount ? (board1.grid.laneCount * 3) / 2 : 4.5;
  const halfZ = board1.grid && board1.grid.bandCount ? (board1.grid.bandCount * 3) / 2 : 6;
  check("3d. the PC unit lands WITHIN the board's own real footprint (its visual center, not a corner)",
    pc1 && Math.abs(pc1.x) < halfX && Math.abs(pc1.z) < halfZ, JSON.stringify({ pcX: pc1 && pc1.x, pcZ: pc1 && pc1.z, halfX, halfZ }));
  check("3e. the PC unit no longer sits at the raw (0,0) corner",
    pc1 && !(pc1.x === 0 && pc1.z === 0), JSON.stringify({ pcX: pc1 && pc1.x, pcZ: pc1 && pc1.z }));

  // 4 — determinism: re-derive the SAME leg's board (via theaterHereSourceFor+trayFrom directly,
  // bypassing the dirty-key skip setBoard's own stub would otherwise short-circuit on an unchanged key).
  const hereSource1 = win.theaterHereSourceFor(world);
  const boardAgainA = win.trayFrom(hereSource1, null, { env: hereSource1.env, realms: hereSource1.realms, walkId: hereSource1.walkId });
  const boardAgainB = win.trayFrom(hereSource1, null, { env: hereSource1.env, realms: hereSource1.realms, walkId: hereSource1.walkId });
  const dAgainA = (boardAgainA.props || []).filter((p) => p.kind === "dressing");
  const dAgainB = (boardAgainB.props || []).filter((p) => p.kind === "dressing");
  check("4. determinism: same walkId+leg -> byte-identical scatter across two independent calls",
    JSON.stringify(dAgainA) === JSON.stringify(dAgainB));
  check("4b. ...and byte-identical to the FIRST render's own scatter too (not just internally consistent)",
    JSON.stringify(dAgainA) === JSON.stringify(dressing1));

  // 5 — different biome -> a disjoint pool. Advance onto leg 2 (Desert).
  win.applyEvent(world, { type: "walk_advance", payload: { toSeg: 2, nodeId: mounted.walkId } });
  win.renderWorld();
  const board2 = lastBoards[lastBoards.length - 1];
  const dressing2 = (board2.props || []).filter((p) => p && p.kind === "dressing");
  check("5-setup. the Desert leg's board also carries dressing", dressing2.length > 0, dressing2.length);
  const forestSlugs = new Set(win.BIOME_DRESSING.Forest.pool.map((p) => p.slug));
  const desertSlugs = new Set(win.BIOME_DRESSING.Desert.pool.map((p) => p.slug));
  check("5. Forest and Desert BIOME_DRESSING pools are disjoint (a different biome -> a genuinely different pool)",
    [...forestSlugs].every((s) => !desertSlugs.has(s)), JSON.stringify({ forest: [...forestSlugs], desert: [...desertSlugs] }));
  check("5b. the Desert leg's actual scatter draws ONLY from the Desert pool, never a Forest slug",
    dressing2.every((d) => desertSlugs.has(d.slug)) && !dressing2.some((d) => forestSlugs.has(d.slug)), JSON.stringify(dressing2.map((d) => d.slug)));

  // 6 — no scatter on the center (walking) lane, on BOTH legs.
  const centerLane = (board1.grid.lanes || [])[Math.floor(((board1.grid.lanes || []).length - 1) / 2)];
  check("6. no dressing entry (Forest leg) lands on the center walking lane",
    dressing1.every((d) => d.zone.split(":")[1] !== centerLane), JSON.stringify(dressing1.map((d) => d.zone)));
  check("6b. no dressing entry (Desert leg) lands on the center walking lane",
    dressing2.every((d) => d.zone.split(":")[1] !== centerLane), JSON.stringify(dressing2.map((d) => d.zone)));

  // 7 — the raw segment record is byte-untouched (walk-native law).
  const pn = win.prepOf(world).nodes[mounted.walkId];
  const rawSegBefore = JSON.parse(JSON.stringify(pn.walk.segments[1])); // Desert leg, num 2
  win.trayFrom(win.theaterHereSourceFor(world), null, { env: "wilderness", walkId: mounted.walkId });
  const rawSegAfter = pn.walk.segments[1];
  check("7. the raw walk segment is byte-untouched by repeated board builds",
    JSON.stringify(rawSegBefore) === JSON.stringify(rawSegAfter));

  // 8 — ground material: Deeplands/Underwater now resolve (the old stale Underdark/Jungle keys never
  // matched what the real wilderness-biome-type table actually rolls).
  check("8. THEATER_FLOOR_BIOME_MAP.Deeplands resolves to a real material (was unreachable before this unit)",
    win.THEATER_FLOOR_BIOME_MAP.Deeplands === "cave-rock");
  check("8b. THEATER_FLOOR_BIOME_MAP.Underwater resolves to a real material (was unreachable before this unit)",
    win.THEATER_FLOOR_BIOME_MAP.Underwater === "cave-rock");
  const deeplandsMat = win.theaterFloorMaterial({ id: "dl1", biome: "Deeplands" }, "wilderness");
  check("8c. theaterFloorMaterial actually resolves a Deeplands segment to that material (not the stale cracked-earth fallback)",
    deeplandsMat === "cave-rock", deeplandsMat);

  // 9 — combat scope boundary: the SAME call shape combat_start uses (no opts.walkId) never gets
  // biome dressing — proves this unit never touches the combat byte-gates.
  const combatShapeBoard = win.theaterBoardFrom({ id: "l1", num: 1, biome: "Forest", dims: undefined }, {}, { env: "wilderness" });
  const combatDressing = (combatShapeBoard.props || []).filter((p) => p && p.kind === "dressing");
  check("9. a board built WITHOUT opts.walkId (combat_start's own call shape) never carries biome dressing",
    combatDressing.length === 0, combatDressing.length);

  // 10 — unknown biome degrades to the generic pool, never throws.
  let threw = null, unknownBoard = null;
  try {
    unknownBoard = win.theaterBoardFrom({ id: "lx", num: 1, biome: "Nonexistentia" }, null, { env: "wilderness", walkId: "unknown-biome-walk" });
  } catch (e) { threw = e; }
  check("10. an unrecognized biome word never throws", !threw, threw && threw.message);
  const unknownDressing = unknownBoard && (unknownBoard.props || []).filter((p) => p && p.kind === "dressing");
  check("10b. an unrecognized biome degrades to the generic pool (still dresses the tray, not empty)",
    unknownDressing && unknownDressing.length > 0 && unknownDressing.every((d) => win.BIOME_DRESSING_GENERIC.pool.some((p) => p.slug === d.slug)),
    JSON.stringify(unknownDressing && unknownDressing.map((d) => d.slug)));
}

console.log(`\n=== TOTAL: ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
