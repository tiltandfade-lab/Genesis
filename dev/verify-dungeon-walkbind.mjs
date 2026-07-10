/* Verify DUNGEON-GRAPH U4 — walk binding (docs/DUNGEON-GRAPH.md "Build units" U4).
   jsdom over the real genesis.html modules in manifest order (same convention as
   dev/verify-combat-cells.mjs / dev/verify-combat-lifecycle.mjs / dev/verify-place-tray.mjs) — this
   unit's whole point is PRODUCTION-PATH wiring (WIRING LAW: acceptance greps must show production
   callers, not test harnesses), so every check below drives the real `applyEvent` handlers
   (`prep_applied` → applyPrep → prepAttachSpatialPlan; `walk_advance` → walkAdvance; `combat_start` →
   the dm.js cellDims seam), never calling prepAttachSpatialPlan/spatialRoomForSeg as bare unit calls
   except where the check is explicitly about the pure helper itself (check 6, the repositioning seam,
   which the spec's own §4 language scopes to "export the function + test it", not a production seam).

   Checks (per the U4 task's own numbered acceptance list):
     1. RED-FIRST — prove a dungeon walk's prep overlay has no spatial plan (assert absent) and dm.js
        combat falls through to feet-text dims. SIMULATED: this branch already contains the U4 fix, so
        there is no pristine pre-fix tree to run against inside this process. The proof stubs
        `prepAttachSpatialPlan` to a no-op (the exact observable shape of "this function doesn't exist
        yet") — the SAME technique dev/verify-combat-cells.mjs's own mutation check (d) uses to prove a
        wiring's presence/absence. Documented explicitly, not silently passed off as a real red-first
        capture.
     2. dungeon walk prep ⇒ pn.spatial exists, plan verifies (independent BFS reachability re-check,
        not trusting spatializePlan's own internal verifier), rooms map 1:1 to segments.
     3. cursor at seg N ⇒ spatialRoomForSeg returns the room whose segNum==N — driven through the real
        `walk_advance` event (not a bare cursor mutation).
     4. combat started in a room with a plan receives that room's cellDims — driven through the real
        `combat_start` event (no typed place record bound, no DM-supplied segment.dims — the ONLY way
        the grid can be room-derived is via this unit's new seam). Discriminating: default room sizes
        (place-spatialize.js's sizeClass caps at 7 cells) never produce the "no dims" fallback grid
        (4 bands x 3 lanes), so a passing match here can't be a coincidence.
     5. BYTE-GATE — the walk store shape for NON-dungeon walks (an urban frontier carrying a hook, and
        a travel/wilderness walk) is byte-identical whether prepAttachSpatialPlan runs for real or is
        stubbed to a no-op (same hand-built fixture walk both times, so the ONLY variable is whether
        this unit's new call fires).
     6. repositioning seam — spatialRepositionOnTimePass(pn,minutes): same seed+minutes ⇒ same drift
        (called twice, byte-identical positions), the player piece is never moved, and every drifted
        piece lands on a FLOOR cell within its own room.

   Mutation test (see bottom, --mutate-attach): stubs prepAttachSpatialPlan off and re-runs check 2's
   own assertions, confirming they go RED under the stub — proof check 2 isn't rubber-stamped.

   Run:  node dev/verify-dungeon-walkbind.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)
   Mutation-test mode: node dev/verify-dungeon-walkbind.mjs --mutate-attach */
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
  // SPATIAL_CELL is a top-level `const` in place-spatialize.js — const/let declarations don't
  // become window properties (unlike var/function) and aren't visible to a LATER, separate
  // win.eval() call either (each eval runs its own top-level scope in jsdom) — so the exposing
  // assignment must ride in the SAME eval call as the module source itself, same fix
  // dev/verify-dungeon-spatialize.mjs's vm-context version applies via `this.__SPATIAL_CELL=...`.
  win.eval(harness + "\n" + srcText + "\n;window.SPATIAL_CELL=SPATIAL_CELL;");
  return win;
}

function makeWorld(win) {
  const world = {
    id: "w-walkbind", name: "The Walk-Bind Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the binding" },
            smell:{name:"smoke"}, sound:{name:"wind"}, arch:{name:"stone"},
            taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: {
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16, dex: 12 }, mods: { str: 4, con: 3, dex: 1 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [], equipped: { mainHand:null, offHand:null, armor:null }, pools: {},
      } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;   // deliberately untyped (no codexId) — theaterNodeSourceFor degrades to null
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// ─── a REAL dungeon walk, rolled via the production roller (rollDungeonWalk), mounted into
//     world.prep exactly the shape startPrep/applyPrep produce (P.bundle.environments[idx].walk +
//     P.nodes[id]={env,idx,soft,locked,hook}) and activated via the REAL walkSetActive. ──────────
function mountDungeonWalk(win, world, segCount) {
  const walk = win.rollDungeonWalk({ segCount: segCount || 6, tier: 1 });
  const nodeId = win.addNode(world, "Test Dungeon Frontier", "Dungeon");
  const P = win.prepOf(world);
  P.bundle = P.bundle || { environments: [] };
  const idx = P.bundle.environments.length;
  P.bundle.environments.push({ kind: "dungeon", walk, hook: { leadsTo: null }, cast: null });
  P.nodes[nodeId] = { env: "dungeon", idx, soft: true, locked: false, hook: null };
  win.walkSetActive(world, nodeId);
  return { nodeId, walk };
}

// ─── independent reachability re-check (mirrors dev/verify-dungeon-spatialize.mjs /
//     dev/verify-dungeon-semantics.mjs) — this harness does not trust spatializePlan's own internal
//     BFS verifier for check 2. ──────────────────────────────────────────────────────────────────
function independentReachabilityCheck(plan, entrySegNum, SPATIAL_CELL) {
  const passable = new Set([SPATIAL_CELL.FLOOR, SPATIAL_CELL.DOOR, SPATIAL_CELL.WATER]);
  const entryRoom = plan.rooms.find((r) => r.segNum === entrySegNum);
  if (!entryRoom) return { ok: false, unreachable: -1, reason: "no entry room in plan" };
  const idx = (x, y) => y * plan.cellW + x;
  const sx = Math.min(plan.cellW - 1, Math.max(0, entryRoom.x + Math.floor(entryRoom.w / 2)));
  const sy = Math.min(plan.cellD - 1, Math.max(0, entryRoom.y + Math.floor(entryRoom.d / 2)));
  const cells = plan.cells;
  if (!passable.has(cells[idx(sx, sy)])) return { ok: false, unreachable: -1, reason: "entry cell not passable" };
  const seen = new Uint8Array(plan.cellW * plan.cellD);
  const q = [[sx, sy]]; seen[idx(sx, sy)] = 1; let head = 0;
  while (head < q.length) {
    const [cx, cy] = q[head++];
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) continue;
      const ii = idx(nx, ny);
      if (seen[ii] || !passable.has(cells[ii])) continue;
      seen[ii] = 1; q.push([nx, ny]);
    }
  }
  let unreachable = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i] === SPATIAL_CELL.FLOOR && !seen[i]) unreachable++;
  return { ok: unreachable === 0, unreachable };
}

// ─── hand-built fixture walks for check 5's byte-gate (never rolled — a rolled walk's table picks
//     are non-deterministic across two separate processes/runs, which would make a byte-diff
//     meaningless; a hand-built fixture makes the ONLY variable "did prepAttachSpatialPlan run"). ──
function buildUrbanFixtureWalk() {
  return {
    environment: "urban", topology: "The Spine", topologyDesc: "", tier: "T1", segCount: 3,
    threat: { id: "T" }, haul: {}, setup: {}, skin: null, spiceTier: "baseline",
    segments: [
      { id: "u1", num: 1, label: "u1", isFinale: false, depth: 0, exits: [{ targetId: "u2", num: 2, label: "u2", isFinale: false }], light: "normal" },
      { id: "u2", num: 2, label: "u2", isFinale: false, depth: 1, exits: [{ targetId: "u1", num: 1, label: "u1", isFinale: false }, { targetId: "u3", num: 3, label: "u3", isFinale: true }], light: "normal" },
      { id: "u3", num: 3, label: "u3", isFinale: true, depth: 2, exits: [{ targetId: "u2", num: 2, label: "u2", isFinale: false }], light: "normal" },
    ],
    edges: [[1, 2], [2, 3]],
  };
}

// runs a FULL prep-node lifecycle for a non-dungeon fixture — an urban frontier that carries a hook
// (the common case) AND a travel/wilderness walk (prepStartTravelWalk's own shape) — through the
// REAL applyPrep (prep_applied event), with prepAttachSpatialPlan either live or stubbed to a no-op.
// Returns { urbanSnapshot, travelSnapshot } — JSON.stringify of each pn after the SAME sequence.
function runByteGateFixtures(win, world, stubAttachOff) {
  if (stubAttachOff) win.eval(`prepAttachSpatialPlan = function(){ return null; };`);
  const P = win.prepOf(world);
  const urbanWalk = buildUrbanFixtureWalk();
  const urbanId = win.addNode(world, "Test Urban Frontier", "Settlement");
  P.bundle = { environments: [{ kind: "urban", walk: urbanWalk, hook: { leadsTo: "dungeon" }, cast: null }] };
  P.nodes[urbanId] = { env: "urban", idx: 0, soft: true, locked: false, hook: { leadsTo: "dungeon" } };
  win.walkSetActive(world, urbanId);

  const travelWalk = buildUrbanFixtureWalk(); travelWalk.environment = "wilderness";
  const travelDestId = win.addNode(world, "Test Travel Destination", "Settlement");
  win.prepStartTravelWalk(world, { destNodeId: travelDestId, originNodeId: world.currentNodeId, travelMin: 60, walk: travelWalk });

  win.applyEvent(world, { type: "prep_applied", payload: { overlays: {
    urban: { briefing: "the same urban briefing text", segments: [] },
    wilderness: { briefing: "the same wilderness briefing text", segments: [] },
  } } });

  return {
    urbanSnapshot: JSON.stringify(win.prepOf(world).nodes[urbanId]),
    travelSnapshot: JSON.stringify(win.prepOf(world).nodes[travelDestId]),
  };
}

// ============================================================================
// MUTATION TEST — disable the plan attachment, confirm check 2 goes red (exits here; does not fall
// through to the normal check suite below, mirroring dev/verify-dungeon-semantics.mjs's own
// --mutate-fit-test convention: mutually-exclusive modes, not "run everything then also mutate").
// ============================================================================
function runMutationDemo() {
  console.log("=== MUTATION TEST: prepAttachSpatialPlan disabled (stubbed to a no-op) — re-running check 2's own assertions ===");
  const win = freshWin();
  const world = makeWorld(win);
  win.eval(`prepAttachSpatialPlan = function(){ return null; };`);
  let mpass = 0, mfail = 0;
  const mcheck = (name, cond, detail = "") =>
    cond ? (mpass++, console.log("  ✓", name)) : (mfail++, console.log("  ✗", name, "—", detail));
  const { nodeId } = mountDungeonWalk(win, world, 8);
  win.applyEvent(world, { type: "prep_applied", payload: { overlays: { dungeon: { briefing: "test", segments: [] } } } });
  const pn = win.prepOf(world).nodes[nodeId];
  mcheck("mutation-2b. pn.spatial exists", !!(pn && pn.spatial), JSON.stringify(pn && pn.spatial));
  console.log(`\n${mpass} passed, ${mfail} failed under the stub.`);
  if (mfail > 0 && mpass === 0) {
    console.log("  ✓ MUTATION CONFIRMED: with prepAttachSpatialPlan disabled, check 2's own assertion goes RED — proves check 2 is not rubber-stamped.");
    process.exit(0);
  } else {
    console.log("  ✗ mutation did not flip check 2 red as expected — investigate.");
    process.exit(1);
  }
}

if (process.argv.includes("--mutate-attach")) {
  runMutationDemo();
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// [1] RED-FIRST (simulated via stub — see file header) — no spatial plan, combat falls through
// ============================================================================
console.log("[1] RED-FIRST (simulated: prepAttachSpatialPlan stubbed to a no-op) — no spatial plan; combat falls through to feet-text default");
{
  const win = freshWin();
  const world = makeWorld(win);
  const { nodeId } = mountDungeonWalk(win, world);
  win.eval(`prepAttachSpatialPlan = function(){ return null; };`);
  const r = win.applyEvent(world, { type: "prep_applied", payload: { overlays: { dungeon: { briefing: "test", segments: [] } } } });
  check("1a. prep_applied ok", r && r.ok === true, JSON.stringify(r));
  const pn = win.prepOf(world).nodes[nodeId];
  check("1b. pre-U4 (stubbed): pn.spatial is absent", pn.spatial === undefined || pn.spatial === null, JSON.stringify(pn.spatial));
  const cr = win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  check("1c. combat_start ok", cr && cr.ok === true, JSON.stringify(cr));
  check("1d. pre-U4 (stubbed): combat falls through to the feet-text default grid (4 bands x 3 lanes)",
    win.GS.combat.grid.bandCount === 4 && win.GS.combat.grid.laneCount === 3, JSON.stringify(win.GS.combat.grid));
}

// ============================================================================
// [2] dungeon walk prep ⇒ pn.spatial exists, plan verifies, rooms map 1:1 to segments
// ============================================================================
console.log("\n[2] dungeon walk prep ⇒ pn.spatial exists, plan verifies (independent BFS re-check), rooms map 1:1 to segments");
function runCheck2(win, world, label) {
  const { nodeId, walk } = mountDungeonWalk(win, world, 8);
  const r = win.applyEvent(world, { type: "prep_applied", payload: { overlays: { dungeon: { briefing: "test", segments: [] } } } });
  check(`2a${label}. prep_applied ok`, r && r.ok === true, JSON.stringify(r));
  const pn = win.prepOf(world).nodes[nodeId];
  check(`2b${label}. pn.spatial exists`, !!(pn && pn.spatial), JSON.stringify(pn && pn.spatial));
  if (!pn || !pn.spatial) return { ok: false };
  const entrySeg = walk.segments.find((s) => s.depth === 0) || walk.segments[0];
  const reach = independentReachabilityCheck(pn.spatial, entrySeg.num, win.SPATIAL_CELL);
  check(`2c${label}. plan verifies — independent BFS reachability re-check`, reach.ok, `unreachable=${reach.unreachable}`);
  const roomsOk = pn.spatial.rooms.length === walk.segments.length &&
    walk.segments.every((s) => pn.spatial.rooms.some((r2) => r2.segNum === s.num));
  check(`2d${label}. rooms map 1:1 to segments`, roomsOk,
    `${pn.spatial.rooms.length} rooms vs ${walk.segments.length} segments`);
  return { ok: true, pn, walk, nodeId };
}
{
  const win = freshWin();
  const world = makeWorld(win);
  runCheck2(win, world, "");
}

// ============================================================================
// [3] cursor at seg N ⇒ spatialRoomForSeg returns the room whose segNum==N (via real walk_advance)
// ============================================================================
console.log("\n[3] cursor at seg N ⇒ spatialRoomForSeg returns the room whose segNum==N");
let sharedFixture; // reused by check 4 below
{
  const win = freshWin();
  const world = makeWorld(win);
  const { nodeId, walk } = mountDungeonWalk(win, world, 8);
  win.applyEvent(world, { type: "prep_applied", payload: { overlays: { dungeon: { briefing: "test", segments: [] } } } });
  const pn = win.prepOf(world).nodes[nodeId];
  const targetSeg = walk.segments.find((s) => s.num !== pn.cursor.current) || walk.segments[0];
  const adv = win.applyEvent(world, { type: "walk_advance", payload: { toSeg: targetSeg.num, nodeId } });
  check("3a. walk_advance ok", adv && adv.ok === true, JSON.stringify(adv));
  check("3b. pn.cursor.current === target segNum", pn.cursor.current === targetSeg.num, pn.cursor.current);
  const room = win.spatialRoomForSeg(pn, targetSeg.num);
  check("3c. spatialRoomForSeg(pn, N) returns the room whose segNum==N", !!room && room.segNum === targetSeg.num,
    JSON.stringify(room && room.segNum));
  sharedFixture = { win, world, nodeId, walk, targetSeg, room };
}

// ============================================================================
// [4] combat started in a room with a plan receives that room's cellDims (production-path: the real
//     combat_start event, no typed place record, no DM-supplied segment.dims)
// ============================================================================
console.log("\n[4] combat started in a room with a plan receives that room's cellDims (production combat_start seam)");
{
  const { win, world, room } = sharedFixture;
  const expectedGrid = win.cmGridFromCells({ w: room.w, d: room.d });
  const cr = win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  check("4a. combat_start ok", cr && cr.ok === true, JSON.stringify(cr));
  check("4b. GS.combat.grid matches the CURRENT ROOM's cell-derived grid",
    win.GS.combat.grid.bandCount === expectedGrid.bands && win.GS.combat.grid.laneCount === expectedGrid.lanes,
    JSON.stringify({ got: win.GS.combat.grid, expected: expectedGrid, room: { w: room.w, d: room.d } }));
  check("4c. discriminating: room-derived grid differs from the no-dims default (4 bands x 3 lanes) — not a coincidence",
    !(expectedGrid.bands === 4 && expectedGrid.lanes === 3), JSON.stringify(expectedGrid));
}

// ============================================================================
// [5] BYTE-GATE — non-dungeon walk store shape byte-identical before/after this unit
// ============================================================================
console.log("\n[5] BYTE-GATE — non-dungeon (urban+hook, travel/wilderness) walk store shape byte-identical before/after U4");
{
  const winReal = freshWin(); const worldReal = makeWorld(winReal);
  const real = runByteGateFixtures(winReal, worldReal, false);
  const winStub = freshWin(); const worldStub = makeWorld(winStub);
  const stub = runByteGateFixtures(winStub, worldStub, true);
  check("5a. urban (hook-bearing) frontier pn shape byte-identical (real prepAttachSpatialPlan vs stubbed no-op)",
    real.urbanSnapshot === stub.urbanSnapshot,
    real.urbanSnapshot === stub.urbanSnapshot ? "" : `real=${real.urbanSnapshot}\nstub=${stub.urbanSnapshot}`);
  check("5b. travel/wilderness walk pn shape byte-identical (real prepAttachSpatialPlan vs stubbed no-op)",
    real.travelSnapshot === stub.travelSnapshot,
    real.travelSnapshot === stub.travelSnapshot ? "" : `real=${real.travelSnapshot}\nstub=${stub.travelSnapshot}`);
}

// ============================================================================
// [6] repositioning seam — spatialRepositionOnTimePass(pn,minutes): deterministic, player piece never
//     moves, every drifted piece lands on a FLOOR cell within its own room
// ============================================================================
console.log("\n[6] repositioning seam — deterministic drift, player piece never moves, pieces stay on FLOOR cells");
{
  const win = freshWin();
  const world = makeWorld(win);
  const { nodeId, walk } = mountDungeonWalk(win, world, 8);
  win.applyEvent(world, { type: "prep_applied", payload: { overlays: { dungeon: { briefing: "test", segments: [] } } } });
  const pn = win.prepOf(world).nodes[nodeId];
  const rooms = pn.spatial.rooms;
  const playerRoom = rooms[0], mook1Room = rooms[Math.min(1, rooms.length - 1)], mook2Room = rooms[Math.min(2, rooms.length - 1)];
  const playerStart = { segNum: playerRoom.segNum, x: playerRoom.x, y: playerRoom.y, isPlayer: true };
  pn.spatial.positions = {
    "pc": Object.assign({}, playerStart),
    "mook1": { segNum: mook1Room.segNum, x: mook1Room.x, y: mook1Room.y, isPlayer: false },
    "mook2": { segNum: mook2Room.segNum, x: mook2Room.x, y: mook2Room.y, isPlayer: false },
  };
  const before = JSON.parse(JSON.stringify(pn.spatial.positions));
  const runA = win.spatialRepositionOnTimePass(pn, 30);
  const snapA = JSON.stringify(runA);
  check("6a. spatialRepositionOnTimePass returns the positions map", !!runA, JSON.stringify(runA));
  check("6b. player piece (isPlayer:true) never moves", runA.pc.x === before.pc.x && runA.pc.y === before.pc.y && runA.pc.segNum === before.pc.segNum,
    JSON.stringify({ before: before.pc, after: runA.pc }));
  // re-seed identical positions and re-run with the SAME minutes — must reproduce byte-identically
  pn.spatial.positions = {
    "pc": Object.assign({}, playerStart),
    "mook1": { segNum: mook1Room.segNum, x: mook1Room.x, y: mook1Room.y, isPlayer: false },
    "mook2": { segNum: mook2Room.segNum, x: mook2Room.x, y: mook2Room.y, isPlayer: false },
  };
  const runB = win.spatialRepositionOnTimePass(pn, 30);
  const snapB = JSON.stringify(runB);
  check("6c. same seed + same minutes ⇒ byte-identical drift (deterministic)", snapA === snapB, `A=${snapA}\nB=${snapB}`);
  // pieces stay on FLOOR cells within their own room
  const cells = pn.spatial.cells, cellW = pn.spatial.cellW, FLOOR = win.SPATIAL_CELL.FLOOR;
  const roomBySeg = {}; rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
  let allOnFloorWithinRoom = true; const badPieces = [];
  ["mook1", "mook2"].forEach((pid) => {
    const piece = runB[pid], room = roomBySeg[piece.segNum];
    const inRoom = room && piece.x >= room.x && piece.x < room.x + room.w && piece.y >= room.y && piece.y < room.y + room.d;
    const onFloor = cells[piece.y * cellW + piece.x] === FLOOR;
    if (!inRoom || !onFloor) { allOnFloorWithinRoom = false; badPieces.push({ pid, piece, inRoom, onFloor }); }
  });
  check("6d. every drifted piece lands on a FLOOR cell within its own room", allOnFloorWithinRoom, JSON.stringify(badPieces));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
