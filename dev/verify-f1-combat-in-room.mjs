#!/usr/bin/env node
/* dev/verify-f1-combat-in-room.mjs — VQ2-RESPEC.md §4 unit F1 (ledger #10 Sol P-F: "combat is a
   STATE of the explored room, never a board swap"; ledger row #6, the "stacked invisible rat").

   Real jsdom, real modules (manifest loadOrder + tables.js, one big classic-script eval — same
   convention as dev/verify-battle-stage.mjs). window.Theater is STUBBED (theater-boot.js is an ES
   module, excluded from the classic-script concat in every jsdom harness in this repo — GL code
   isn't jsdom-testable, see that file's own manifest desc: "browser smoke pass instead") — the stub
   RECORDS every setBoard/setInteriorBoard/setUnits payload so this harness can assert on the exact
   data render.js hands the (real, in production) GL layer.

   Sections:
     0. ⊗ RED-FIRST — src/world/render.js as committed at this branch's own base (`git show HEAD:...`,
        i.e. BEFORE this unit's edit) proves the bug live: combat's board is NOT the room's own
        interior3d recipe (the void), and/or the scene "recipe" changes across the exploration->combat
        cut. Re-run against the CURRENT working tree afterward to prove the same fixture is fixed.
     1-5. Per room SHAPE (rectangular / octagon / cave / tiered / overloaded — Sol P-F's own list):
        exploration -> combat_start -> combat_end, asserting:
          a. identical scene "recipe" (activeRoomId, tileKit, wall/floor/pillar/doorframe instance
             counts, furniture, lights, dressing, interactables incl. their ids, walkScene) across all
             three renders — "zero new architecture/material/light instances at combat start" AND
             "combat end restores exactly" in one comparison.
          b. board.kind === "interior3d" (routed through setInteriorBoard, never the flat setBoard)
             for the combat render.
          c. every combat unit lands on a real room floor cell, no two units share one (the stacked-
             rat fix) — cross-checked against an INDEPENDENT re-derivation of legal cells from
             room.cells minus board.furniture, not just trusting the module's own count.
     6. OVERLOADED STRESS — the same uniqueness/legality guarantee under an artificially crowded room
        (most cells blocked, more combatants than the untouched-cell budget) — the whole-room-fallback
        path, proven directly against theaterUnitsOnRoomCells/theaterCombatRoomCellsFor.
     7. f1ClampCamFit (theater-boot.js, extracted + eval'd in isolation — pure math, no THREE/DOM
        needed) — "target/distance delta clamped ≤10%": within-bound passthrough, over-bound clamp on
        both the target (center) and the distance proxy (halfX/halfZ), each independently.
     8. check-manifest.py (run live).

   Run: node dev/verify-f1-combat-in-room.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const readAtHead = (p) => execSync(`git show HEAD:${p}`, { cwd: ROOT, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗ FAIL:", name, "—", JSON.stringify(detail)));
function section(title) { console.log("\n=== " + title + " ==="); }

// ─── bundle builders ────────────────────────────────────────────────────────────────────────────
const man = JSON.parse(read("manifest.json"));
const jsPaths = man.loadOrder.filter((p) => p.endsWith(".js"));
function buildBundle(reader) {
  return reader("tables.js") + "\n;\n" + jsPaths.map(reader).join("\n;\n");
}
const NEW_BUNDLE = buildBundle(read);
let OLD_BUNDLE = null;
try { OLD_BUNDLE = buildBundle(readAtHead); } catch (e) { console.log("  (red-first base build failed: " + e.message + " — skipping section 0)"); }

const HARNESS_PREFIX = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
function freshWin(bundle) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(HARNESS_PREFIX + "\n" + bundle);
  return win;
}

// ─── world/prep/walk fixtures ───────────────────────────────────────────────────────────────────
function makeWorld(win) {
  const world = {
    id: "w-f1test", name: "The F1 Combat-In-Room Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting DOM" } },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: { species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0, profBonus: 3, scores: { str: 18, con: 16 }, mods: { str: 4, con: 3 },
        saveProfs: ["str", "con"], skillProfs: ["Athletics"], passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false, cantrips: [], spells: [], inventory: [], equipped: {}, pools: {} } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], sessionLive: true,
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
  return { world, nodeId: originId };
}

// walk.js:593-625 segment shape, extended w/ areaType/dims/side (STAGE-C fields) — same convention
// dev/verify-stage-c-shapes.mjs's chainFixture uses.
function chainFixture(list) {
  const n = list.length;
  const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
  return ids.map((id, i) => ({
    id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
    exits: [
      ...(i > 0 ? [{ targetId: ids[i - 1], num: i, label: ids[i - 1], isFinale: i - 1 === n - 1 }] : []),
      ...(i < n - 1 ? [{ targetId: ids[i + 1], num: i + 2, label: ids[i + 1], isFinale: i + 1 === n - 1 }] : []),
    ],
    light: "normal",
    ...(list[i].areaType !== undefined ? { areaType: list[i].areaType } : {}),
    ...(list[i].dims !== undefined ? { dims: list[i].dims } : {}),
    ...(list[i].side !== undefined ? { side: list[i].side } : {}),
  }));
}
const SHAPE_FIXTURES = {
  rectangular: { areaType: "Guard Chamber", dims: "30' x 30'" },
  octagon: { areaType: "Grand Octagon", dims: "60' x 60'" },       // real table row 101 — STAGE-C C3
  cave: { areaType: "Massive Cavern", dims: "60' x 80' irregular" }, // real table row 140
  tiered: { areaType: "Guard Chamber", dims: "30' x 30'", side: "a raised dais along the back wall" }, // STAGE-C C2
  overloaded: { areaType: "Small Chamber", dims: "20' x 20'" },    // small footprint -> tight legal-cell budget
};
function buildRoomPlan(win, shapeKind) {
  const segs = chainFixture([{}, SHAPE_FIXTURES[shapeKind]]);
  const plan = win.spatializePlan(segs, "The Spine", { walkId: "f1-" + shapeKind });
  const room = plan.rooms.find((r) => r.segNum === 2);
  return { segs, plan, room, focusNum: 2 };
}
// wires the active walk exactly the way dm.js's real WALK-CONSUMPTION path would — pn.spatial +
// pn.cursor.current + pn.walk (walkOfFrontier's own "stored directly on the node's prep slot" branch)
// — the SAME shape theaterHereSourceFor's {kind:"interior",plan} branch reads.
function wireActiveWalk(win, world, nodeId, plan, segs, focusNum) {
  const P = win.prepOf(world);
  const pn = { env: "dungeon", soft: false, locked: false, hook: null,
    spatial: plan, cursor: { current: focusNum },
    walk: { segments: segs, environment: "dungeon" }, segments: [] };
  P.nodes[nodeId] = pn;
  P.activeWalkId = nodeId;
  return pn;
}
function stubTheater(win) {
  const calls = { mount: 0, setBoard: 0, setInteriorBoard: 0, setUnits: 0, retire: 0 };
  let lastBoard = null, lastInteriorBoard = null, lastUnits = null;
  win.Theater = {
    mount(el) { calls.mount++; return true; },
    reattach() {},
    setBoard(d) { calls.setBoard++; lastBoard = d; },
    setInteriorBoard(d) { calls.setInteriorBoard++; lastInteriorBoard = d; },
    setUnits(u) { calls.setUnits++; lastUnits = u && u.units; },
    rotate() {}, zoom() { return 1; }, retire() { calls.retire++; },
  };
  return { calls, get lastBoard() { return lastBoard; }, get lastInteriorBoard() { return lastInteriorBoard; }, get lastUnits() { return lastUnits; } };
}
function startFight(win) {
  const combat = win.combatStart({
    pc: { init: 2 },
    foes: [{ name: "Dire Wolf" }, { name: "Skeleton" }, { name: "Giant Rat" }],
    pcRoll: 15, foeRoll: 3,
  });
  return combat;
}

// ─── recipe signature (the "byte-identical scene recipe" claim) ───────────────────────────────────
// Deliberately excludes `combat` (F1's own additive field — units/legalCells are SESSION state, not
// room recipe) and the light-flicker/mote-seed fields the study rig itself documents as cosmetic.
// Includes interactable ids explicitly (the ledger's own "identical scene recipe hash + interactable
// ids" wording) via a stable, sorted extraction rather than relying on array order.
function recipeSignature(board) {
  if (!board) return null;
  const inst = board.instances || {};
  const ids = (arr) => (arr || []).map((e) => e && (e.sourceRef || e.id || null)).filter(Boolean).sort();
  return JSON.stringify({
    kind: board.kind, activeRoomId: board.activeRoomId, env: board.env, realmId: board.realmId,
    tileKit: board.tileKit,
    wallCount: (inst.wall || []).length, floorCount: (inst.floor || []).length,
    pillarCount: (inst.pillar || []).length, doorframeCount: (inst.doorframe || []).length,
    furniture: (board.furniture || []).map((f) => f.x + "," + f.y + ":" + f.kind).sort(),
    lightsCount: (board.lights || []).length,
    dressingIds: ids(board.dressing), interactableIds: ids(board.interactables),
    interactableCount: (board.interactables || []).length,
    walkScene: board.walkScene,
  });
}

// ─── legal-cell re-derivation (independent of the module's own count — never trust it twice) ──────
function independentLegalCells(room, board) {
  const blocked = new Set((board.furniture || []).map((f) => f.x + "," + f.y));
  return (room.cells || []).filter((c) => !blocked.has(c.x + "," + c.y));
}

// ============================================================================================
// SECTION 0 — RED-FIRST
// ============================================================================================
section("0. RED-FIRST — the void, proven live against HEAD (pre-F1)");
if (OLD_BUNDLE) {
  const winOld = freshWin(OLD_BUNDLE);
  const { world, nodeId } = makeWorld(winOld);
  const { plan, segs, focusNum } = buildRoomPlan(winOld, "rectangular");
  wireActiveWalk(winOld, world, nodeId, plan, segs, focusNum);
  winOld.GS.theaterMounted = true;
  const stub = stubTheater(winOld);
  winOld.theaterStageSync(world, null);
  const exploreSig = recipeSignature(stub.lastInteriorBoard);
  check("0a. exploration (pre-fix code) already routes through setInteriorBoard (sanity)",
    stub.calls.setInteriorBoard === 1 && !!stub.lastInteriorBoard);
  const combat = startFight(winOld);
  winOld.GS.combat = combat;
  winOld.theaterStageSync(world, null);
  check("0b. ⊗ pre-fix: combat NEVER calls setInteriorBoard again — it falls back to the flat setBoard (the void)",
    stub.calls.setBoard === 1 && stub.calls.setInteriorBoard === 1,
    { setBoard: stub.calls.setBoard, setInteriorBoard: stub.calls.setInteriorBoard });
  check("0c. ⊗ pre-fix: the flat board carries NO room architecture at all (no instances/tileKit/activeRoomId)",
    stub.lastBoard && stub.lastBoard.kind !== "interior3d" && stub.lastBoard.activeRoomId == null,
    stub.lastBoard && { kind: stub.lastBoard.kind, activeRoomId: stub.lastBoard.activeRoomId });
  // "scene recipe hash CHANGES at combat start" — the task's own RED-FIRST wording. Compare the
  // exploration board's recipe against the combat board's: trivially, honestly true on pre-fix code
  // (a real interior3d recipe vs a kind:"grid"-ish flat board with no activeRoomId/tileKit/instances at
  // all) — the exact discontinuity F1 exists to close.
  const combatSigOld = recipeSignature(stub.lastBoard);
  check("0d. ⊗ pre-fix: scene recipe hash CHANGES at combat start (interior explore recipe != combat's flat recipe)",
    exploreSig !== combatSigOld, { same: exploreSig === combatSigOld });
  // "the stacked rat" class (ledger row #6): note, not asserted here as a guaranteed-every-roll numeric
  // tie — cmResolveFoe/CM_BANDS' own default banding already spreads SOME default foes across bands
  // even on the flat system (checked live: this fixture's own cast does NOT collide exactly), so a
  // literal-collision claim would be dishonest as a blanket RED-FIRST fact. The real, unconditional
  // defect is 0b/0c/0d above (no room, no continuity) — F1's own fix is what GUARANTEES uniqueness
  // (never "usually"), proven per-shape in section (g) below via a real independent re-derivation, not
  // asserted as a pre-fix regression that doesn't reliably reproduce.
} else {
  console.log("  (skipped — could not build the pre-fix bundle)");
}

// ============================================================================================
// SECTIONS 1-5 — per-shape acceptance (current working tree)
// ============================================================================================
const SHAPES = ["rectangular", "octagon", "cave", "tiered", "overloaded"];
SHAPES.forEach((shapeKind, idx) => {
  section((idx + 1) + ". SHAPE: " + shapeKind);
  const win = freshWin(NEW_BUNDLE);
  const { world, nodeId } = makeWorld(win);
  const { plan, room, segs, focusNum } = buildRoomPlan(win, shapeKind);
  check("room fixture produced real floor cells", !!room && Array.isArray(room.cells) && room.cells.length > 0,
    room && room.cells && room.cells.length);
  wireActiveWalk(win, world, nodeId, plan, segs, focusNum);
  win.GS.theaterMounted = true;
  const stub = stubTheater(win);

  // EXPLORATION — the baseline recipe.
  win.theaterStageSync(world, null);
  const exploreBoard = stub.lastInteriorBoard;
  check("a. exploration routes through setInteriorBoard, kind interior3d",
    !!exploreBoard && exploreBoard.kind === "interior3d");
  check("b. exploration board carries the real activeRoomId", exploreBoard && exploreBoard.activeRoomId === focusNum);
  const exploreSig = recipeSignature(exploreBoard);
  const exploreSetBoardCalls = stub.calls.setBoard;

  // COMBAT START
  const combat = startFight(win);
  win.GS.combat = combat;
  win.theaterStageSync(world, null);
  const combatBoard = stub.lastInteriorBoard;
  const combatUnits = stub.lastUnits || [];
  check("c. combat ALSO routes through setInteriorBoard (never the flat void board)",
    !!combatBoard && combatBoard.kind === "interior3d");
  check("d. the flat setBoard() is NEVER called for this interior fight", stub.calls.setBoard === exploreSetBoardCalls,
    { setBoard: stub.calls.setBoard });
  const combatSig = recipeSignature(combatBoard);
  check("e. ✓ IDENTICAL scene recipe hash across the exploration->combat cut (walls/floor/pillars/doors/" +
    "furniture/lights/dressing/interactables incl. ids, tileKit, walkScene — zero new architecture/material/" +
    "light instances at combat start)",
    exploreSig === combatSig, exploreSig === combatSig ? "match" : { exploreSig, combatSig });

  // UNIT PLACEMENT — legality + uniqueness, independently re-derived.
  const legal = independentLegalCells(room, combatBoard);
  const legalKeys = new Set(legal.map((c) => c.x + "," + c.y));
  check("f. every combat unit resolves to a real ROOM cell (not the flat zone-patch coordinates)",
    combatUnits.length > 0 && combatUnits.every((u) => legalKeys.has(Math.round(u.x) + "," + Math.round(u.z))),
    combatUnits.map((u) => ({ id: u.id, x: u.x, z: u.z })));
  const unitKeys = combatUnits.map((u) => Math.round(u.x) + "," + Math.round(u.z));
  check("g. ✓ every unit's cell is UNIQUE (the stacked-rat fix) — " + combatUnits.length + " combatants, " +
    new Set(unitKeys).size + " distinct cells",
    new Set(unitKeys).size === combatUnits.length, unitKeys);
  check("h. all 4 expected combatants present (pc + wolf + skeleton + rat)", combatUnits.length === 4,
    combatUnits.map((u) => u.id));

  // COMBAT END — exact restoration.
  win.GS.combat = null;
  win.theaterStageSync(world, null);
  const postBoard = stub.lastInteriorBoard;
  const postSig = recipeSignature(postBoard);
  check("i. ✓ combat_end restores the EXACT same recipe (no lingering combat artifacts, no drift)",
    postSig === exploreSig, postSig === exploreSig ? "match" : { exploreSig, postSig });
  check("j. post-combat board carries no leftover `combat` field", !postBoard.combat);
});

// ============================================================================================
// SECTION 6 — OVERLOADED STRESS (direct, artificially crowded)
// ============================================================================================
section("6. OVERLOADED STRESS — crowded room, whole-room fallback");
{
  const win = freshWin(NEW_BUNDLE);
  const { plan, room } = buildRoomPlan(win, "rectangular");
  // block every cell except a scarce handful (deterministic — no RNG), forcing several combatants
  // into the SAME ring x lane bucket with only the whole-room fallback left to resolve them.
  const allCells = room.cells;
  const keep = allCells.slice(0, Math.max(3, Math.floor(allCells.length * 0.15)));
  const keepKeys = new Set(keep.map((c) => c.x + "," + c.y));
  const blocked = new Set(allCells.filter((c) => !keepKeys.has(c.x + "," + c.y)).map((c) => c.x + "," + c.y));
  const legalCells = win.theaterCombatRoomCellsFor(plan, 2, blocked);
  check("6a. theaterCombatRoomCellsFor correctly excludes every blocked cell", legalCells.every((c) => !blocked.has(c.x + "," + c.y)));
  check("6b. a real, non-trivial scarce legal-cell budget", legalCells.length === keep.length, legalCells.length);

  const combat = win.combatStart({
    pc: { init: 2 },
    foes: [{ name: "Dire Wolf" }, { name: "Skeleton" }, { name: "Giant Rat" }, { name: "Bandit" }, { name: "Bandit" }],
    pcRoll: 15, foeRoll: 3,
  });
  const rawUnits = win.theaterUnitsFrom(combat).units;
  const placed = win.theaterUnitsOnRoomCells(combat, rawUnits, legalCells, combat.grid);
  const placedKeys = placed.map((u) => Math.round(u.x) + "," + Math.round(u.z));
  check("6c. 6 combatants > " + legalCells.length + " legal cells — every one STILL gets a unique legal cell " +
    "while any remain free (no crash, no silent overlap)",
    new Set(placedKeys).size === Math.min(placed.length, legalCells.length), placedKeys);
  check("6d. every assigned cell is a real legal cell", placed.every((u) => legalCells.some((c) => c.x === Math.round(u.x) && c.y === Math.round(u.z))));
}

// ============================================================================================
// SECTION 7 — f1ClampCamFit (pure math, extracted from theater-boot.js and eval'd in isolation)
// ============================================================================================
section("7. f1ClampCamFit — target/distance delta clamped ≤10%");
{
  const bootSrc = read("src/ui/theater-boot.js");
  const startMarker = "function f1ClampCamFit(camFit, baseline, maxFrac){";
  const start = bootSrc.indexOf(startMarker);
  if (start < 0) {
    check("7. f1ClampCamFit found in src/ui/theater-boot.js", false, "not found");
  } else {
    let depth = 0, i = start, end = -1;
    for (; i < bootSrc.length; i++) {
      if (bootSrc[i] === "{") depth++;
      else if (bootSrc[i] === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    const fnSrc = bootSrc.slice(start, end);
    const f1ClampCamFit = new Function("return (" + fnSrc + ")")();

    const baseline = { center: { x: 10, z: -4 }, halfX: 8, halfZ: 6 };
    // within bound: a tiny nudge, well under 10% of the room's own extent -> passes through unclamped.
    const withinBound = { center: { x: 10.2, z: -3.9 }, halfX: 8.2, halfZ: 6.1 };
    const r1 = f1ClampCamFit(withinBound, baseline, 0.10);
    check("7a. within-bound target/extent passes through UNCLAMPED", r1.center.x === 10.2 && r1.center.z === -3.9 && r1.halfX === 8.2 && r1.halfZ === 6.1, r1);

    // over-bound target: 5 units off on X (room extent max(8,6)=8, 10%=0.8) -> clamped to a 0.8-unit delta.
    const overTarget = { center: { x: 15, z: -4 }, halfX: 8, halfZ: 6 };
    const r2 = f1ClampCamFit(overTarget, baseline, 0.10);
    const dist2 = Math.hypot(r2.center.x - baseline.center.x, r2.center.z - baseline.center.z);
    check("7b. over-bound TARGET clamped to ≤0.8 world units from baseline (10% of extent 8)", Math.abs(dist2 - 0.8) < 1e-6, dist2);

    // over-bound distance proxy: halfX jumps from 8 to 12 (50% growth) -> clamped to 8*1.10=8.8.
    const overDist = { center: baseline.center, halfX: 12, halfZ: 6 };
    const r3 = f1ClampCamFit(overDist, baseline, 0.10);
    check("7c. over-bound DISTANCE proxy (halfX) clamped to ≤10% relative growth (8.8 vs raw 12)", Math.abs(r3.halfX - 8.8) < 1e-6, r3.halfX);

    // shrink direction also clamped (a tighter combat crop pulled in too far).
    const underDist = { center: baseline.center, halfX: 2, halfZ: 6 };
    const r4 = f1ClampCamFit(underDist, baseline, 0.10);
    check("7d. under-bound DISTANCE proxy (halfX shrink) clamped the same way (7.2 vs raw 2)", Math.abs(r4.halfX - 7.2) < 1e-6, r4.halfX);

    // no baseline -> pure passthrough (a walk-less/first-ever render never clamps against nothing).
    const r5 = f1ClampCamFit(overTarget, null, 0.10);
    check("7e. no baseline -> unclamped passthrough (never throws on a fresh room)", r5 === overTarget);
  }
}

// ============================================================================================
// SECTION 8 — check-manifest.py
// ============================================================================================
section("8. check-manifest.py");
{
  try {
    execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" });
    check("8. check-manifest.py exits clean", true);
  } catch (e) {
    check("8. check-manifest.py exits clean", false, (e.stdout || e.message || "").toString().slice(-2000));
  }
}

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
