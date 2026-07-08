/* Verify TABLETOP-UNITS.md §U6 — Combat reconfigure/relax + tray persistence proof (TABLETOP-VISION.md
   §3 "one table, many arrangements" + §9.10 dedup gate + §9.1 determinism, including traces).

   jsdom, real genesis.html classic modules in document order (the established convention — see
   dev/verify-tabletop-u1.mjs/u3.mjs/u4.mjs's own header) — window.Theater is STUBBED with a
   call-counting spy (mount/setBoard/setUnits/retire), same pattern as verify-tabletop-u1.mjs §7.

   Checks:
     1. Live-fixture flow: mount (once) -> walk (tableau: PC + castFrom units, empty props outside
        combat) -> combat_start (unit source switches castFrom->theaterUnitsFrom; scene passed into
        trayFrom -> lanes/cover pass ON) -> combat_end (unit source reverses castFrom<-theaterUnitsFrom;
        U5's trace-write contract shape written via walkUpdateSegment) -> tableau restored with corpse
        traces staged as units, ALL while Theater.mount is called exactly ONCE across the whole flow.
     2. §9.10 DEDUP MUTATION FIXTURE [RED-FIRST]: two cover zones with no cover/hazard text of their
        own both fall back to the SAME room-wide feature text (an "ancient shrine") — the resolved
        part's total piece count across the board must stay 1. Shown RED first (both zones staging
        the full recipe, count 2) by calling the pre-dedup `||`-chain logic directly, then GREEN on
        the real (patched) theaterBoardBuild.
     3. Persistence (§9.1): after combat_end, serialize `w` to JSON, boot a FRESH jsdom window, load
        the serialized world back in, re-derive the tableau tray+units (theaterHereSourceFor+trayFrom+
        castFrom) — identical hash to the pre-serialize tableau, INCLUDING the corpse trace unit. Proves
        persistence rides real w/prep state, not any transient GS/JS-closure fact.
     4. Obliteration: an obliterated foe lands in `removed`, never stages a corpse figure.
     5. Revisit union: ending combat TWICE on the same segment (two separate fights) accumulates BOTH
        fights' corpses rather than overwriting the first fight's trace.

   Run:  node dev/verify-tabletop-u6.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

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

// ============================================================================
// FIXTURE — a room whose feature text ("an ancient shrine") resolves via the SAME rule as the
// §9.10 dedup mutation (theaterPropForText's shrine-block rule matches "shrine"/"altar").
// ============================================================================
const FIXTURE_SEGMENT = {
  id: "u6-room", num: 1, dims: "30' x 30'",
  feature: { name: "an ancient shrine", flavor: "long since abandoned" },
  dressing: { text: "cold stone", condition: null },
  environment: "dungeon",
};
// §9.10 mutation fixture scene: TWO cover zones, NEITHER carrying its own cover/hazard text — both
// must fall back to the shared featureText ("an ancient shrine").
const DEDUP_SCENE = { zoneCover: { "melee:C": "half", "near:C": "half" }, cover: {}, hazardZones: [], elevZones: [], mods: [] };

function makeSessionWorld(win) {
  const world = {
    id: "w-u6test", name: "The Reconfigure Test World",
    seed: { master: { name: "Test Shrine-Room", desc: "a place for asserting the reconfigure" } },
    characters: [{ id: "c1", status: "living", name: "Ashen Vell", headline: "a test soul", spark: "a test soul", pronouns: "she",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 5, xp: 6500,
        hp: 44, hpCur: 44, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 16, con: 14 }, mods: { str: 3, con: 2 }, saveProfs: ["str", "con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d10", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false, cantrips: [], spells: [],
        inventory: [], equipped: {}, pools: {} } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], sessionLive: true,
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
    // a live walk parked on segment 1 (the same "pn.walk direct-storage shape" U1's own fixture uses).
    prep: { session: 1, bundle: null, overlays: {}, harvest: null, debt: [], walkLog: [],
      activeWalkId: "walk-node-1",
      nodes: { "walk-node-1": {
        cursor: { current: 1, touched: [1], done: false },
        walk: { environment: "dungeon", skin: null,
          segments: [ Object.assign({}, FIXTURE_SEGMENT) ] }
      } } },
  };
  const originId = win.addNode(world, "Test Shrine-Room", "Setting");
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
  const lastUnits = [];
  win.Theater = {
    mount(el) { calls.mount++; return mountReturns && !!el; },
    reattach(el) {},
    setBoard(d) { calls.setBoard++; lastBoards.push(d); },
    // theater-boot.js's OWN contract comment: "`u` is a theaterUnitsFrom(...)-shaped {units:[...]}"
    // — unwrap here so every downstream assertion in this harness deals with a plain array
    // regardless of which branch (combat's theaterUnitsFrom vs the tableau's wrapped castFrom) fed
    // it; a caller that ever regresses to passing a bare array is still tolerated (Array.isArray guard).
    setUnits(u) { calls.setUnits++; lastUnits.push(Array.isArray(u) ? u : ((u && u.units) || [])); },
    rotate() {}, zoom(dir) { return 1; },
    retire() { calls.retire++; },
  };
  return { calls, lastBoards, lastUnits };
}

// ============================================================================
// 1. LIVE-FIXTURE FLOW: walk -> tableau -> combat_start -> lanes -> combat_end -> tableau + traces
// ============================================================================
let persistedWorldJSON = null;
let preSerializeBoard = null, preSerializeUnits = null;
{
  const win = freshWin();
  const world = makeSessionWorld(win);
  const { calls, lastBoards, lastUnits } = stubTheater(win);

  // --- mount (once) ---
  win.renderWorld();
  check("1a. GS.theaterMounted flips true on the first render", win.GS.theaterMounted === true);
  check("1a-2. mount() called exactly once", calls.mount === 1, calls.mount);

  // --- walk: tableau outside combat ---
  win.renderWorld();
  const tableauUnits1 = lastUnits[lastUnits.length - 1];
  check("1b. walking outside combat pushes a NON-empty unit list via castFrom (the U6 wiring)",
    Array.isArray(tableauUnits1) && tableauUnits1.length >= 1, JSON.stringify(tableauUnits1));
  check("1b-2. the PC unit is present in the tableau", tableauUnits1.some(u => u.kind === "pc"));
  const tableauBoard1 = lastBoards[lastBoards.length - 1];
  check("1b-3. no cover props on the walk tableau (scene is null while walking)",
    tableauBoard1.props.length === 0, tableauBoard1.props.length);

  // --- combat_start: unit source switches castFrom -> theaterUnitsFrom; scene -> trayFrom lanes ON ---
  const mountsBeforeFight = calls.mount;
  const combat = win.combatStart({
    pc: { init: 2 }, foes: [{ name: "Cultist" }, { name: "Cultist Two" }], pcRoll: 15, foeRoll: 3,
    segment: Object.assign({}, FIXTURE_SEGMENT), scene: JSON.parse(JSON.stringify(DEDUP_SCENE)),
  });
  win.GS.combat = combat;
  win.renderWorld();
  check("1c. starting a fight does NOT re-mount the Theater instance", calls.mount === mountsBeforeFight, calls.mount);
  const combatBoard = lastBoards[lastBoards.length - 1];
  const combatUnits = lastUnits[lastUnits.length - 1];
  check("1c-2. combat pushes lanes/cover props (scene present -> trayFrom's cover pass fires)",
    combatBoard.props.length > 0, combatBoard.props.length);
  check("1c-3. combat units come from theaterUnitsFrom (band/lane-shaped, not the tableau's pc/ally/npc kinds)",
    Array.isArray(combatUnits) && combatUnits.some(u => u.kind === "foe" || u.band != null),
    JSON.stringify(combatUnits && combatUnits[0]));

  // --- §9.10 dedup: both cover zones share the SAME feature-fallback noun -> ONE recipe, not two ---
  const shrineProps = combatBoard.props.filter(p => p.part === "shrine-block");
  check("1c-4 (§9.10). the shrine-block recipe stages exactly ONCE despite two matching cover zones",
    shrineProps.length === 1, JSON.stringify(combatBoard.props));
  const bareCoverProps = combatBoard.props.filter(p => p.zone !== shrineProps[0].zone && !p.part);
  check("1c-5. the SECOND cover zone still gets a plain cover marker (never worse than today)",
    bareCoverProps.length === 1, JSON.stringify(bareCoverProps));

  // --- combat_end: down one foe, obliterate the other; unit source reverses; U5 trace write fires ---
  combat.foes[0].hp = 0; combat.foes[0].down = true;
  combat.foes[1].hp = 0; combat.foes[1].down = true; combat.foes[1].obliterated = true;
  const fid0 = combat.foes[0].fid, fid1 = combat.foes[1].fid;
  win.applyEvent(world, { type: "combat_end", source: "declared", payload: { outcome: "resolved" } });
  check("1d. combat_end does NOT call Theater.retire() (one table, many arrangements)", calls.retire === 0, calls.retire);
  check("1d-2. GS.theaterMounted stays true across combat_end", win.GS.theaterMounted === true);

  // the trace write itself (U5's LOCKED contract shape) landed on the segment's reskin overlay
  const pn = win.prepOf(world).nodes["walk-node-1"];
  const reskin = (pn.segments || []).find(o => o.ref === "S1");
  check("1d-3. combat_end writes overlay.traces via the EXISTING walk_update path (prep.js:499)",
    !!reskin && Array.isArray(reskin.traces), JSON.stringify(reskin));
  check("1d-4. the DOWN (non-obliterated) foe becomes a {kind:'corpse',ref,zone} trace",
    reskin.traces.some(t => t.kind === "corpse" && t.ref === fid0));
  check("1d-5. the OBLITERATED foe lands in `removed`, NOT `traces` (corpse is default; removal is earned)",
    Array.isArray(reskin.removed) && reskin.removed.includes(fid1) && !reskin.traces.some(t => t.ref === fid1),
    JSON.stringify(reskin));

  // --- the very next render relaxes back: board AND units both reconfigure ---
  const boardsBeforeRelax = calls.setBoard;
  win.renderWorld();
  check("1e. the render after combat_end pushes a NEW board (the relaxed standing-table tray)",
    calls.setBoard > boardsBeforeRelax, calls.setBoard);
  const relaxedBoard = lastBoards[lastBoards.length - 1];
  const relaxedUnits = lastUnits[lastUnits.length - 1];
  check("1e-2. the relaxed board has no lanes/cover props again (scene is null outside combat)",
    relaxedBoard.props.length === 0, relaxedBoard.props.length);
  check("1e-3. unit source reversed: PC is back (castFrom, not theaterUnitsFrom's band/lane units)",
    relaxedUnits.some(u => u.kind === "pc"));
  check("1e-4. the corpse trace stages as a unit on the relaxed tableau",
    relaxedUnits.some(u => u.kind === "corpse" && u.ref === fid0 && u.down === true),
    JSON.stringify(relaxedUnits.filter(u => u.kind === "corpse")));
  check("1e-5. the obliterated foe never stages a figure at all",
    !relaxedUnits.some(u => u.ref === fid1));
  check("1e-6. Theater.mount is STILL called exactly once across the ENTIRE flow (walk->combat->relax)",
    calls.mount === 1, calls.mount);

  preSerializeBoard = relaxedBoard;
  preSerializeUnits = relaxedUnits;
  persistedWorldJSON = JSON.stringify(world);
}

// ============================================================================
// 2. §9.10 DEDUP + MUTATION [RED-FIRST, against the REAL source text]: two cover zones with no
//    text of their own both fall back to the identical room-wide feature text — the resolved
//    part's total piece count must stay 1. The mutation neuters the ACTUAL claim-tracking guard
//    (isDuplicateFeatureNoun) in a copy of theater-data.js, reloads a fresh jsdom window from that
//    mutated source, and shows the SAME fixture now double-stages the noun — proving the real
//    guard (not a parallel reimplementation) is what's actually preventing the duplicate.
// ============================================================================
{
  const win = freshWin();
  const board = win.theaterBoardBuild(Object.assign({}, FIXTURE_SEGMENT), JSON.parse(JSON.stringify(DEDUP_SCENE)), { env: "dungeon" });
  const shrineProps = board.props.filter(p => p.part === "shrine-block");
  check("2a. the REAL (patched) theaterBoardBuild stages the shared-feature noun exactly once",
    shrineProps.length === 1, JSON.stringify(board.props));
  const bareCoverProps = board.props.filter(p => !p.part);
  check("2b. the second (deduped) zone still gets a plain cover marker, never dropped entirely",
    bareCoverProps.length === 1, JSON.stringify(bareCoverProps));

  const original = read("src/engine/theater-data.js");
  const marker = "const isDuplicateFeatureNoun = wonViaFeatureFallback && featureText && featureFallbackClaimed;";
  if (!original.includes(marker)) {
    fail++; console.log("  ✗ MUTATION(§9.10): dedup-guard marker text not found verbatim — spec drifted?");
  } else {
    const mutated = original.replace(marker, "const isDuplicateFeatureNoun = false; // MUTATION: guard neutered");
    const mutSrc = TABLES_SRC + "\n;\n" + CLASSIC_FILES.map((p) => (p === "src/engine/theater-data.js" ? mutated : read(p))).join("\n;\n");
    const mwin = freshWin(mutSrc);
    const mboard = mwin.theaterBoardBuild(Object.assign({}, FIXTURE_SEGMENT), JSON.parse(JSON.stringify(DEDUP_SCENE)), { env: "dungeon" });
    const mShrineProps = mboard.props.filter(p => p.part === "shrine-block");
    check("MUTATION (shown RED then restored): neutering isDuplicateFeatureNoun stages the shared noun TWICE (piece count 2, not 1)",
      mShrineProps.length === 2, JSON.stringify(mboard.props));
  }
}

// ============================================================================
// 3. PERSISTENCE (§9.1): serialize -> fresh jsdom boot -> re-derive -> identical tray hash + traces
// ============================================================================
{
  const win2 = freshWin();
  const world2 = JSON.parse(persistedWorldJSON);
  win2.U.worlds[world2.id] = world2;
  win2.U.activeWorldId = world2.id;
  win2.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win2.GS.gamePanel = null; win2.GS.menuOpen = false; win2.GS.charTab = null; win2.GS.actionsTab = "abilities";
  win2.GS.activeShopId = null; win2.GS.shopTab = "buy"; win2.GS.shopSel = null;
  win2.GS.combat = null; win2.GS.prevPanel = undefined; win2.GS.theaterMounted = false; win2.GS.stageCollapsed = false;
  const { lastBoards, lastUnits } = stubTheater(win2);

  win2.renderWorld(); // mount
  win2.renderWorld(); // push the tableau
  const reloadedBoard = lastBoards[lastBoards.length - 1];
  const reloadedUnits = lastUnits[lastUnits.length - 1];

  check("3a. reloaded board hash (tiles/props) is IDENTICAL to the pre-serialize relaxed tableau",
    JSON.stringify(reloadedBoard) === JSON.stringify(preSerializeBoard));
  check("3b. reloaded unit list is IDENTICAL to the pre-serialize relaxed tableau (same order/fields)",
    JSON.stringify(reloadedUnits) === JSON.stringify(preSerializeUnits),
    JSON.stringify({ before: preSerializeUnits, after: reloadedUnits }));
  check("3c. the corpse trace survives the reload (a fresh jsdom boot, no shared JS state)",
    reloadedUnits.some(u => u.kind === "corpse" && u.down === true));
}

// ============================================================================
// 4/5. REVISIT UNION: a SECOND fight on the same segment accumulates onto the first fight's traces
// ============================================================================
{
  const win = freshWin();
  const world = makeSessionWorld(win);
  const { calls } = stubTheater(win);
  win.renderWorld(); win.renderWorld();

  // combatStart numbers foes "f1","f2",… FROM 1 every time (fresh per fight) — fight #2's foe
  // collides on the raw fid with fight #1's, so this is also the collision-safe-suffix proof
  // (theaterCombatEndTraces must not silently drop fight #2's corpse as a false "already staged" dupe).
  const combat1 = win.combatStart({ pc: { init: 2 }, foes: [{ name: "Bandit" }], pcRoll: 15, foeRoll: 3,
    segment: Object.assign({}, FIXTURE_SEGMENT), scene: { cover: {}, hazards: [], exits: [] } });
  win.GS.combat = combat1;
  combat1.foes[0].hp = 0; combat1.foes[0].down = true;
  win.applyEvent(world, { type: "combat_end", source: "declared", payload: { outcome: "resolved" } });
  const pn = win.prepOf(world).nodes["walk-node-1"];
  const afterFirstFight = ((pn.segments || []).find(o => o.ref === "S1") || {}).traces.slice();
  check("5a. the first fight's corpse trace lands (exactly 1 entry)", afterFirstFight.length === 1, JSON.stringify(afterFirstFight));

  const combat2 = win.combatStart({ pc: { init: 2 }, foes: [{ name: "Bandit Two" }], pcRoll: 15, foeRoll: 3,
    segment: Object.assign({}, FIXTURE_SEGMENT), scene: { cover: {}, hazards: [], exits: [] } });
  win.GS.combat = combat2;
  check("5a-2. fight #2's foe fid COLLIDES with fight #1's raw fid (proves the suffix guard is load-bearing)",
    combat2.foes[0].fid === combat1.foes[0].fid, combat2.foes[0].fid);
  combat2.foes[0].hp = 0; combat2.foes[0].down = true;
  win.applyEvent(world, { type: "combat_end", source: "declared", payload: { outcome: "resolved" } });

  const reskin = (pn.segments || []).find(o => o.ref === "S1");
  check("5b. BOTH fights' corpses persist (union, not overwrite) — exactly 2 trace entries",
    reskin.traces.length === 2, JSON.stringify(reskin.traces));
  check("5c. fight #1's original trace entry is UNCHANGED (still present, untouched)",
    reskin.traces.some(t => t.ref === afterFirstFight[0].ref));
  check("5d. fight #2's corpse got a COLLISION-SAFE distinct ref (not silently dropped as a dupe)",
    reskin.traces.filter(t => t.ref !== afterFirstFight[0].ref).length === 1,
    JSON.stringify(reskin.traces));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
