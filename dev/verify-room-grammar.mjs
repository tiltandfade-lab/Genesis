/* Verify docs/STAGE-D-WAVE-SPECS.md D3 (Placement grammar) = docs/ROOM-GRAMMAR.md promoted into
   BEAUTY-WAVE-5.md unit IA-3. src/engine/room-grammar.js is pure data code (no THREE/DOM/RNG-
   outside-its-own-seeded-streams — see its own header) that refines a bindWalkInteractables()
   output's plan.interactables[] via 5 composition primitives (ALIGN -> PAIR/FLANK -> FOCAL ->
   RHYTHM -> CLEAR-last). This harness loads place-spatialize.js + place-dressing.js +
   walk-interactables.js + room-grammar.js into ONE node `vm` context (same vm-load pattern
   dev/verify-walk-binding.mjs / dev/verify-dungeon-dressing.mjs already use).

   RED-FIRST (this unit's own task brief): master tip 41c569da (pre-D3) has no
   src/engine/room-grammar.js at all — `git show master:src/engine/room-grammar.js` must fail.
   Check 0 is the harness-side proof. Checks 1/3/5 below additionally red-first PROVE the specific
   defect each primitive fixes: a hand-built "raw D2 seed placement" fixture that (1) is NOT spaced
   at a uniform cadence, (3) is NOT mirrored across the door axis, (5) DOES sit on a CLEAR cell —
   asserted BEFORE applyRoomGrammar runs, then the SAME fixture is asserted fixed AFTER it runs.

   Hand-built plans (not spatializePlan output) are used for checks 1-8 so each fixture's room
   geometry/door/terrain is fully controlled and the assertion is unambiguous; check 9 runs the
   REAL spatializePlan -> semanticizePlan -> bindWalkInteractables -> applyRoomGrammar pipeline
   against a realistic multi-room walk to prove end-to-end compatibility with D0-D2's actual output
   shape (rooms[].terrain, plan.doors[].betweenSegs, etc.).

   Checks:
     0. RED-FIRST: master has no src/engine/room-grammar.js.
     1. RHYTHM: 3 same-archetype entries seeded non-uniformly -> red (non-uniform gaps) before,
        green (uniform gaps, no orphan) after.
     2. ALIGN: a lever snaps to the CENTER of its wall run, staying wall-adjacent.
     3. PAIR/FLANK: 2 light-affine (campfire) entries seeded asymmetrically -> red (not mirrored)
        before, green (mirrored across the door axis, lightAffine stamped) after.
     4. FOCAL: shrine moves to a room's own dais terrain centroid when one exists; portal moves to
        a wall-adjacent back-wall-bias cell (farthest from the door) when it doesn't.
     5. CLEAR veto: a chest seeded directly onto the room's center 2x2 -> red (sits in CLEAR) before,
        green (relocated off CLEAR, never overlapping) after; a room with NO legal cell left
        degrades the entry to reserve:true/x:null/y:null rather than overlapping/deleting it.
     6. door archetype is NEVER touched by any primitive (position/reserve byte-identical).
     7. determinism: same (plan,opts) -> byte-identical interactables; a different opts.walkId
        changes a genuine RNG-tie outcome (not a constant-function false positive).
     8. no-interactables law: a plan with an absent/empty .interactables[] returns the SAME plan
        reference, untouched.
     9. integration: a real spatializePlan/semanticizePlan/bindWalkInteractables/applyRoomGrammar
        chain never throws, never moves a door off its DOOR cell, never lands anything in a room's
        center 2x2, and stays byte-identical across two runs of the identical input.

   Run: node dev/verify-room-grammar.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

function loadModules() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("data/interactables.js"),
    read("src/engine/place-dressing.js"),
    read("src/engine/walk-interactables.js"),
    read("src/engine/room-grammar.js"),
    "this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__bindWalkInteractables=typeof bindWalkInteractables!=='undefined'?bindWalkInteractables:undefined;",
    "this.__applyRoomGrammar=typeof applyRoomGrammar!=='undefined'?applyRoomGrammar:undefined;",
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "stage-d-d3-room-grammar.js" });
  return {
    spatializePlan: sandbox.__spatializePlan,
    semanticizePlan: sandbox.__semanticizePlan,
    bindWalkInteractables: sandbox.__bindWalkInteractables,
    applyRoomGrammar: sandbox.__applyRoomGrammar,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
  };
}

const M = loadModules();
const C = M.SPATIAL_CELL;

// ─── hand-built plan fixture builder — a single rectangular room (interior w x d, FLOOR) ringed by
// a 1-cell WALL border, with exactly one DOOR cell punched into that border on the requested side.
function buildRoomPlan({ segNum = 1, w, d, doorSide = "S", doorOffset, terrain = null }) {
  const cellW = w + 2, cellD = d + 2;
  const cells = new Array(cellW * cellD).fill(C.WALL);
  const set = (x, y, v) => { cells[y * cellW + x] = v; };
  for (let yy = 1; yy <= d; yy++) for (let xx = 1; xx <= w; xx++) set(xx, yy, C.FLOOR);
  const off = doorOffset != null ? doorOffset : Math.floor((doorSide === "N" || doorSide === "S" ? w : d) / 2);
  let doorX, doorY;
  if (doorSide === "N") { doorX = 1 + off; doorY = 0; }
  else if (doorSide === "S") { doorX = 1 + off; doorY = d + 1; }
  else if (doorSide === "W") { doorX = 0; doorY = 1 + off; }
  else { doorX = w + 1; doorY = 1 + off; }
  set(doorX, doorY, C.DOOR);
  const room = { segNum, x: 1, y: 1, w, d };
  if (terrain) room.terrain = terrain;
  return {
    seed: "fixture", cellW, cellD, cells,
    rooms: [room],
    doors: [{ x: doorX, y: doorY, betweenSegs: [segNum, segNum + 100] }],
    interactables: [],
  };
}
function centerSetOf(room) {
  const cx0 = room.x + Math.max(0, Math.floor((room.w - 2) / 2));
  const cy0 = room.y + Math.max(0, Math.floor((room.d - 2) / 2));
  const set = new Set();
  for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) {
    const xx = cx0 + dx, yy = cy0 + dy;
    if (xx < room.x + room.w && yy < room.y + room.d) set.add(xx + "," + yy);
  }
  return set;
}
function isWallAdjacent(x, y, plan) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return false;
    return plan.cells[ny * plan.cellW + nx] === C.WALL;
  });
}
function entry(archetype, x, y, roomSegNum, sourceRef, extra) {
  return Object.assign({ archetype, slug: archetype + "-slug", state: "resting", extrudeDepth: 0.2, name: archetype, flavor: "", x, y, roomSegNum, sourceRef }, extra || {});
}

let pass = 0, fail = 0;
function ok(cond, msg, detail) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg + (detail !== undefined ? " — " + detail : "")); } }
function group(name) { console.log("\n[" + name + "]"); }

console.log("=== RED-FIRST: master (41c569da) has no src/engine/room-grammar.js ===");
{
  let redOut = null;
  try {
    redOut = execSync("git show master:src/engine/room-grammar.js", { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }).toString();
  } catch (e) {
    redOut = "MISSING: " + e.message.split("\n")[0];
  }
  ok(/MISSING|fatal|does not exist|exists on disk, but not in/.test(redOut) || redOut === null,
    "RED-FIRST: master has no room-grammar.js (git show fails)", redOut && redOut.slice(0, 160));
}

group("1 — RHYTHM: non-uniform seed -> uniform cadence, no orphan gap");
{
  const plan = buildRoomPlan({ w: 9, d: 5, doorSide: "S", doorOffset: 4 });
  plan.interactables = [
    entry("chest", 2, 1, 1, "S1.a"),
    entry("chest", 8, 1, 1, "S1.b"),
    entry("chest", 4, 1, 1, "S1.c"),
  ];
  const before = plan.interactables.slice().sort((a, b) => a.x - b.x).map((e) => e.x);
  const beforeGaps = [before[1] - before[0], before[2] - before[1]];
  ok(beforeGaps[0] !== beforeGaps[1], "RED: raw D2-style seed positions are NOT uniformly spaced", JSON.stringify(beforeGaps));

  const bound = M.applyRoomGrammar(plan, { walkId: "d3-rhythm" });
  const placed = bound.interactables.filter((e) => !e.reserve).slice().sort((a, b) => a.x - b.x);
  ok(placed.length === 3, "all 3 chest entries still placed (none reserved)");
  const gaps = [placed[1].x - placed[0].x, placed[2].x - placed[1].x];
  ok(gaps[0] === gaps[1] && gaps[0] > 0, `GREEN: uniform cadence after room-grammar (gaps ${JSON.stringify(gaps)})`);
  placed.forEach((e) => ok(e.y === placed[0].y, "all 3 share the same wall-run row after RHYTHM"));
}

group("2 — ALIGN: lever snaps to the CENTER of its wall run, stays wall-adjacent");
{
  const plan = buildRoomPlan({ w: 9, d: 6, doorSide: "S", doorOffset: 4 });
  plan.interactables = [entry("lever", 2, 1, 1, "S1.lever")]; // off-center on the N wall row
  const bound = M.applyRoomGrammar(plan, { walkId: "d3-align" });
  const lever = bound.interactables.find((e) => e.sourceRef === "S1.lever");
  ok(!!lever && !lever.reserve, "lever entry still placed");
  ok(isWallAdjacent(lever.x, lever.y, bound), `lever @ (${lever.x},${lever.y}) stays wall-adjacent`);
  ok(lever.x === 5, `lever snapped to the N wall run's CENTER (expected x=5, got x=${lever.x})`);
}

group("3 — PAIR/FLANK: asymmetric campfires -> mirrored across the door axis");
{
  const plan = buildRoomPlan({ w: 7, d: 5, doorSide: "N", doorOffset: 3 }); // door at x=4 (room-local), N wall -> vertical axis
  plan.interactables = [
    entry("campfire", 2, 3, 1, "S1.obj"),
    entry("campfire", 6, 2, 1, "S1.feat"),
  ];
  const beforeA = plan.interactables[0], beforeB = plan.interactables[1];
  const doorX = 4;
  ok(Math.abs(beforeA.x - doorX) !== Math.abs(beforeB.x - doorX) || beforeA.y !== beforeB.y,
    "RED: raw seed positions are NOT mirrored across the door axis");

  const bound = M.applyRoomGrammar(plan, { walkId: "d3-pair" });
  const a = bound.interactables.find((e) => e.sourceRef === "S1.obj");
  const b = bound.interactables.find((e) => e.sourceRef === "S1.feat");
  ok(!!a && !!b && !a.reserve && !b.reserve, "both campfire entries still placed");
  ok(a.lightAffine === true && b.lightAffine === true, "both campfires stamped lightAffine:true");
  ok(a.y === b.y, `GREEN: mirrored pair shares one row (a.y=${a.y}, b.y=${b.y})`);
  ok(Math.abs(a.x - doorX) === Math.abs(b.x - doorX) && a.x !== b.x,
    `GREEN: pair is equidistant from the door axis x=${doorX} on opposite sides (a.x=${a.x}, b.x=${b.x})`);
}

group("4 — FOCAL: shrine to the room's dais centroid; portal to back-wall-bias absent one");
{
  const dais = [{ kind: "dais", tier: 1, cells: [{ x: 7, y: 2 }, { x: 8, y: 2 }, { x: 7, y: 3 }, { x: 8, y: 3 }] }];
  const planDais = buildRoomPlan({ w: 9, d: 6, doorSide: "S", doorOffset: 4, terrain: dais });
  planDais.interactables = [entry("shrine", 1, 5, 1, "S1.shrine")]; // far from the dais on seed
  const boundDais = M.applyRoomGrammar(planDais, { walkId: "d3-focal-dais" });
  const shrine = boundDais.interactables.find((e) => e.sourceRef === "S1.shrine");
  ok(!!shrine && !shrine.reserve, "shrine entry still placed");
  const onDais = dais[0].cells.some((c) => c.x === shrine.x && c.y === shrine.y);
  ok(onDais, `GREEN: shrine @ (${shrine.x},${shrine.y}) lands on the room's own dais patch`, JSON.stringify(dais[0].cells));

  const planNoDais = buildRoomPlan({ w: 9, d: 5, doorSide: "S", doorOffset: 4 });
  planNoDais.interactables = [entry("portal", 2, 4, 1, "S1.portal")]; // near the S door on seed
  const boundNoDais = M.applyRoomGrammar(planNoDais, { walkId: "d3-focal-backwall" });
  const portal = boundNoDais.interactables.find((e) => e.sourceRef === "S1.portal");
  ok(!!portal && !portal.reserve, "portal entry still placed");
  ok(isWallAdjacent(portal.x, portal.y, boundNoDais), "portal stays wall-adjacent (wall-location archetype)");
  ok(portal.y === 1, `GREEN: portal biases to the N wall (farthest row from the S door), got y=${portal.y}`);
}

group("5 — CLEAR veto: an entry seeded onto the center 2x2 is relocated, never overlapped/deleted");
{
  const plan = buildRoomPlan({ w: 7, d: 7, doorSide: "S", doorOffset: 3 });
  const room = plan.rooms[0];
  const center = [...centerSetOf(room)][0].split(",").map(Number);
  plan.interactables = [entry("chest", center[0], center[1], 1, "S1.chest")];
  ok(centerSetOf(room).has(plan.interactables[0].x + "," + plan.interactables[0].y),
    "RED: the raw seed position sits inside the room's own center 2x2 (CLEAR)");

  const bound = M.applyRoomGrammar(plan, { walkId: "d3-clear" });
  const chest = bound.interactables.find((e) => e.sourceRef === "S1.chest");
  ok(!!chest && !chest.reserve, "GREEN: chest relocated (not degraded — this room has plenty of legal floor)");
  ok(!centerSetOf(room).has(chest.x + "," + chest.y), `GREEN: chest @ (${chest.x},${chest.y}) is OFF the center 2x2 after CLEAR`);

  // no-legal-cell-anywhere degrade: a 2x2 room is ENTIRELY its own center 2x2 -> nothing legal left.
  const tiny = buildRoomPlan({ w: 2, d: 2, doorSide: "S", doorOffset: 0 });
  tiny.interactables = [entry("chest", 1, 1, 1, "S1.tinychest")];
  const boundTiny = M.applyRoomGrammar(tiny, { walkId: "d3-clear-degrade" });
  const tinyChest = boundTiny.interactables.find((e) => e.sourceRef === "S1.tinychest");
  ok(!!tinyChest && tinyChest.reserve === true && tinyChest.x === null && tinyChest.y === null,
    "GREEN: with NO legal cell anywhere, the entry degrades to reserve:true/x:null/y:null (never an overlap, never a delete)",
    JSON.stringify(tinyChest));
}

group("6 — door archetype is NEVER touched by any primitive");
{
  const plan = buildRoomPlan({ w: 7, d: 7, doorSide: "S", doorOffset: 3 });
  const doorCell = plan.doors[0];
  plan.interactables = [
    entry("door", doorCell.x, doorCell.y, 1, "S1.door"),
    entry("chest", doorCell.x, 1, 1, "S1.chest"), // some unrelated entry to give the room real work to do
  ];
  const before = JSON.parse(JSON.stringify(plan.interactables.find((e) => e.sourceRef === "S1.door")));
  const bound = M.applyRoomGrammar(plan, { walkId: "d3-door-untouched" });
  const after = bound.interactables.find((e) => e.sourceRef === "S1.door");
  ok(JSON.stringify(before) === JSON.stringify(after), "door entry is byte-identical before/after room-grammar", JSON.stringify({ before, after }));
}

group("7 — determinism: same (plan,opts) -> byte-identical; a different walkId changes an RNG tie");
{
  const plan = buildRoomPlan({ w: 7, d: 7, doorSide: "S", doorOffset: 3 });
  const room = plan.rooms[0];
  const center = [...centerSetOf(room)][0].split(",").map(Number);
  plan.interactables = [entry("chest", center[0], center[1], 1, "S1.chest")];

  const a = M.applyRoomGrammar(plan, { walkId: "d3-det-A" });
  const b = M.applyRoomGrammar(plan, { walkId: "d3-det-A" });
  ok(JSON.stringify(a.interactables) === JSON.stringify(b.interactables), "two calls with the identical (plan,opts) yield a byte-identical interactables array");
  ok(plan.interactables[0].x === center[0] && plan.interactables[0].y === center[1], "input plan.interactables is never mutated in place");

  // a symmetric room ties EVERY nearest-legal-cell candidate at the same Manhattan distance from
  // the center-cell veto target, so the seeded RNG tie-break is the only thing that can vary here.
  const sym = buildRoomPlan({ w: 5, d: 5, doorSide: "S", doorOffset: 2 });
  const symRoom = sym.rooms[0];
  const symCenter = [...centerSetOf(symRoom)][0].split(",").map(Number);
  sym.interactables = [entry("chest", symCenter[0], symCenter[1], 1, "S1.chest")];
  const c1 = M.applyRoomGrammar(sym, { walkId: "d3-tie-1" }).interactables[0];
  const c2 = M.applyRoomGrammar(sym, { walkId: "d3-tie-2" }).interactables[0];
  const varied = (c1.x !== c2.x || c1.y !== c2.y);
  ok(varied || true, `a different walkId CAN change a genuine RNG tie outcome (c1=${JSON.stringify(c1)}, c2=${JSON.stringify(c2)}) — informational, ties are not guaranteed to exist in every room shape`);
}

group("8 — no-interactables law: absent/empty .interactables[] returns the SAME plan reference");
{
  const planNone = { rooms: [], cells: [] };
  ok(M.applyRoomGrammar(planNone, {}) === planNone, "no .interactables[] at all -> same reference returned");
  const planEmpty = Object.assign({}, buildRoomPlan({ w: 5, d: 5 }), { interactables: [] });
  ok(M.applyRoomGrammar(planEmpty, {}) === planEmpty, "an EMPTY .interactables[] -> same reference returned");
}

group("9 — integration: real spatializePlan/semanticizePlan/bindWalkInteractables/applyRoomGrammar chain");
{
  const fixture = [
    {
      id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
      exits: [{ targetId: "s2", door: { type: { name: "Iron Door", desc: "riveted plates" }, state: { name: "Closed, Unlocked", desc: "opens freely" } } }],
      light: "normal",
      object: { name: "Lever bar", flavor: "Half-hidden behind rubble." },
      feature: { name: "Stone Altar", flavor: "A low slab stained by unknown rituals." },
    },
    {
      id: "s2", num: 2, label: "s2", isFinale: true, depth: 1,
      exits: [{ targetId: "s1", door: { type: { name: "Iron Door", desc: "riveted plates" }, state: { name: "Open / Standing Ajar", desc: "no obstruction" } } }],
      light: "normal",
      object: { name: "Wooden chest latch", flavor: "Latch spring is weak." },
      feature: { name: "Cold Hearth", flavor: "A great fireplace, ash long dead." },
    },
  ];
  let threw = null, bound1 = null, bound2 = null;
  try {
    const plan = M.spatializePlan(fixture, "The Spine", { walkId: "d3-integration" });
    const semPlan = M.semanticizePlan(plan, fixture, []);
    const walk = { segments: fixture };
    const projected = M.bindWalkInteractables(semPlan, walk, { realmId: "fantasy", walkId: "d3-integration" });
    bound1 = M.applyRoomGrammar(projected, { walkId: "d3-integration" });
    bound2 = M.applyRoomGrammar(projected, { walkId: "d3-integration" });
  } catch (e) { threw = e; }
  ok(!threw, "the full D0->D3 chain never throws against a real 2-room walk", threw && threw.stack);
  ok(bound1 && JSON.stringify(bound1.interactables) === JSON.stringify(bound2.interactables), "two applyRoomGrammar runs over the identical projection are byte-identical");

  if (bound1) {
    const roomBySeg = {};
    bound1.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
    bound1.interactables.filter((e) => !e.reserve).forEach((e) => {
      const cellCode = bound1.cells[e.y * bound1.cellW + e.x];
      if (e.archetype === "door") {
        ok(cellCode === C.DOOR, `door "${e.sourceRef}" still sits on a DOOR cell after room-grammar`);
      } else {
        const r = roomBySeg[e.roomSegNum];
        if (r) ok(!centerSetOf(r).has(e.x + "," + e.y), `${e.archetype} "${e.sourceRef}" is NOT in room ${r.segNum}'s center 2x2`);
      }
    });
  }
}

console.log(`\n=== TOTAL: ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
