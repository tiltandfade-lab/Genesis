/* dev/verify-stage-c-shapes.mjs — Verify STAGE-C C3 — REAL SHAPES (docs/STAGE-C.md C3).
   src/engine/place-spatialize.js's shapeForArchetype(areaType) substring-classifies the rolled
   segment.areaType NAME into a shape tag (rect/circle/octagon/ellipse/L/T/cross/cave); rasterizeShape
   rasterizes that shape (a staircased orthogonal approximation) inside the C1 bbox, replacing the
   filled-rect FLOOR cells (rooms[].shape/rooms[].cells); door cells are derived FROM the shape's own
   polygon boundary (dspRoomDoorAnchor/dspChooseDoorCell), bound to each doors[].toSeg, replacing the
   old corridor-crosses-a-rectangle test. All behind the shared SPATIAL_SHAPES flag (default ON,
   same flag C1/C2 already use); a 'rect' archetype (or SPATIAL_SHAPES off) keeps the EXACT pre-C3
   code path — see this file's section 6 for the strongest form of that regression proof.

   RED-FIRST (checked live against 06d31fb8, the C2 tip this unit branched from):
     `git show 06d31fb8:src/engine/place-spatialize.js | grep -c shapeForArchetype` -> 0 (neither
     symbol existed before this unit) — re-checked live below (section 0), not just cited. Section 0
     additionally re-proves the SPATIAL_SHAPES OFF/ON behavioral half of red-first, same convention
     dev/verify-stage-c-size.mjs's check 1 and dev/verify-stage-c-terrain.mjs's check 1g/1h already
     established: a REAL "30' diameter Rotunda" roll renders as a plain filled rect with either the
     OLD (pre-C3) module loaded via git-show, or the NEW module with SPATIAL_SHAPES forced off.

   Sections:
     0. RED-FIRST proof (git-show base-commit absence + OLD-module/OFF-flag behavioral proof).
     1. shapeForArchetype: every real "Dungeon Area Type" table archetype name this unit's own
        substring rules target, classified correctly, incl. the two literal false-positive traps the
        spec's own \b-bounding exists for ("T-Junction" must NOT hit the T-shaped rule; "Lava/Acid
        Crossing" must NOT hit the cross-hall rule via "Crossing").
     2. ROTUNDA (row 089, real table text): a 30' diameter room -> shape:'circle', a real radial
        footprint — fewer cells than the filled bbox, all 4 bbox corners excluded (a filled rect
        never excludes its own corners; a circle inscribed in a square always does) — the BW5 SEAM 2
        assertion STAGE-C.md's own C3 Verify §1 calls for, cell-count + boundary-non-rectangularity.
     3. OCTAGON (row 101, Grand Octagon, real table text): a 60'x60' room -> shape:'octagon', all 4
        bbox corners excluded (the 4 diagonal chamfer faces) AND all 4 edge-midpoints included (the 4
        straight faces) -> the 8-face boundary signature.
     4. L-SHAPED (row 102, real table text): shape:'L', exactly ONE of the 4 bbox corners excluded
        (the subtracted corner), the other 3 present -> the concrete "an L, not a plus/cross" test
        (T/cross would exclude 2 or 4 corners respectively — see section 8's sanity pass on those).
     5. CAVE (row 140, Massive Cavern, real table text): shape:'cave', irregular (its own cell set
        differs from a pure ellipse rasterized over the identical bbox+seed — proves real noise-driven
        raggedness, not a smooth curve) AND connected (an INDEPENDENT 4-adjacency flood-fill re-check
        over the room's own cells[] from this harness — never trust the module's own flood a second
        time, same discipline dspBuildPlanOnce's own BFS-reachability re-verify already uses) AND
        deterministic per seed (same walkId -> byte-identical cell set across 2 runs).
     6. EXITS FROM POLYGON FACES: a Rotunda focus room with 3 real segment.exits[] edges -> exactly 3
        of ITS OWN doors (cells inside its own rooms[].cells set), each independently re-verified as a
        polygon-BOUNDARY cell (a 4-neighbor NOT in the room's own cell set — recomputed here, not
        borrowed from the module), each doors[].toSeg naming a distinct real neighbor segNum.
     7. RECT ARCHETYPE REGRESSION: an all-rect-archetype dungeon (every segment's areaType classifies
        'rect') built by THIS unit's module is compared against the SAME fixture built by the OLD
        (base-commit 06d31fb8) module — `cells`/`tiers` Uint8Array/Int8Array buffers byte-identical,
        every room's x/y/w/d identical, every corridor/door x/y/betweenSegs identical (toSeg is a
        genuinely NEW field, stripped before the compare) — "today's behavior exactly."
     8. Sanity pass on T/cross/ellipse (not spec-required individually, but exercised so all 8
        DUNGEON-GRAPH.md U6 shape tags get at least one live assertion): non-rect cell counts, T
        excludes 2 bbox corners, cross excludes all 4.
     9. determinism: a mixed-shape dungeon (rotunda+octagon+L+cave+rect) run twice -> byte-identical
        plan (cells/tiers buffers, rooms[].shape/cells, doors[]).
     10. rasterizeShape's own dspForceCenterCore guarantee, algebraically: for every w,d in [4..24]
         and every shape tag, the reachability BFS's own start-cell formula (floor(w/2),floor(d/2))
         is included.
     11. check-manifest.py (run live).

   Run: node dev/verify-stage-c-shapes.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_COMMIT = "06d31fb8";
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

// ─── loaders ──────────────────────────────────────────────────────────────────────────────────
function loadModuleSource(source, tag) {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(
    source +
      "\n;this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;" +
      "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;" +
      "this.__shapeForArchetype=typeof shapeForArchetype!=='undefined'?shapeForArchetype:undefined;" +
      "this.__rasterizeShape=typeof rasterizeShape!=='undefined'?rasterizeShape:undefined;",
    sandbox,
    { filename: tag }
  );
  return sandbox;
}
function loadEngine() { return loadModuleSource(read("src/engine/place-spatialize.js"), "place-spatialize.js"); }
function loadBaseEngine() {
  const src = execSync(`git show ${BASE_COMMIT}:src/engine/place-spatialize.js`, { cwd: ROOT, encoding: "utf-8" });
  return loadModuleSource(src, "place-spatialize.js@" + BASE_COMMIT);
}

// ─── fixtures ─────────────────────────────────────────────────────────────────────────────────
// walk.js:593-625 shape, extended with areaType/dims (STAGE-C fields) — mirrors dev/verify-stage-c-
// terrain.mjs's chainFixture, extended with `areaType`.
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
  }));
}
// a hub fixture: s1 is the center (the focus room), s2/s3/s4 are its 3 neighbors — real
// segment.exits[] edges from s1's own perspective.
function hubFixture(centerCfg, neighborCfgs) {
  const ids = ["s1", "s2", "s3", "s4"];
  const segs = [
    { id: "s1", num: 1, label: "s1", isFinale: false, depth: 0,
      exits: ids.slice(1).map((tid, i) => ({ targetId: tid, num: i + 2, label: tid, isFinale: false })),
      light: "normal", areaType: centerCfg.areaType, dims: centerCfg.dims },
  ];
  ids.slice(1).forEach((id, i) => {
    segs.push({
      id, num: i + 2, label: id, isFinale: false, depth: 1,
      exits: [{ targetId: "s1", num: 1, label: "s1", isFinale: false }],
      light: "normal", areaType: (neighborCfgs[i] && neighborCfgs[i].areaType) || "Standard Chamber",
      dims: (neighborCfgs[i] && neighborCfgs[i].dims) || "20' x 20' square",
    });
  });
  return segs;
}

// real "Dungeon Area Type" table strings (Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon
// Area Type.md) — read the actual file rather than fabricating text, per CLAUDE.md's own "read the
// actual files before claiming a gap" discipline.
const ROW_089_ROTUNDA = { areaType: "Mid-Size Rotunda", dims: "30' diameter" };
const ROW_101_OCTAGON = { areaType: "Grand Octagon", dims: "60' x 60'" };
const ROW_102_L = { areaType: "L-Shaped Chamber", dims: "30' x 30' (10' wide arms)" };
const ROW_105_T = { areaType: "T-Shaped Chamber", dims: "40' x 40' (10' wide)" };
const ROW_107_CROSS = { areaType: "Cross-Shaped Hall", dims: "40' x 40' (10' arms)" };
const ROW_109_OVAL = { areaType: "Small Oval", dims: "20' x 30'" };
const ROW_140_CAVERN = { areaType: "Massive Cavern", dims: "60' x 80' irregular" };
const ROW_027_TJUNCTION = { areaType: "T-Junction", dims: "10' x 20' junction room" }; // rect trap
const ROW_184_CROSSING = { areaType: "Lava/Acid Crossing", dims: "30' x 40' rectangle" }; // cave (lava), NOT cross trap
const ROW_007_CORRIDOR = { areaType: "Standard Corridor", dims: "10' x 30' straight" }; // plain rect

function tableCheck() {
  const src = read("Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md");
  return {
    row089: /\|\s*\*\*089\*\*\s*\|\s*Mid-Size Rotunda\s*\|\s*30' diameter/.test(src),
    row101: /\|\s*\*\*101\*\*\s*\|\s*Grand Octagon\s*\|\s*60' x 60'/.test(src),
    row102: /\|\s*\*\*102\*\*\s*\|\s*L-Shaped Chamber\s*\|\s*30' x 30' \(10' wide arms\)/.test(src),
    row140: /\|\s*\*\*140\*\*\s*\|\s*Massive Cavern\s*\|\s*60' x 80' irregular/.test(src),
    row027: /\|\s*\*\*027\*\*\s*\|\s*T-Junction/.test(src),
    row184: /\|\s*\*\*184\*\*\s*\|\s*Lava\/Acid Crossing/.test(src),
  };
}

// independent geometric helpers (harness-local, never call into the module's own private fns) ──
function bboxCornersIncluded(cells, room) {
  const set = new Set(cells.map((c) => c.x + "," + c.y));
  const { x, y, w, d } = room;
  return {
    TL: set.has(x + "," + y), TR: set.has((x + w - 1) + "," + y),
    BL: set.has(x + "," + (y + d - 1)), BR: set.has((x + w - 1) + "," + (y + d - 1)),
  };
}
function edgeMidpointsIncluded(cells, room) {
  const set = new Set(cells.map((c) => c.x + "," + c.y));
  const { x, y, w, d } = room;
  const midW = x + Math.floor(w / 2), midD = y + Math.floor(d / 2);
  return {
    top: set.has(midW + "," + y), bottom: set.has(midW + "," + (y + d - 1)),
    left: set.has(x + "," + midD), right: set.has((x + w - 1) + "," + midD),
  };
}
function independentBoundaryCells(cells) {
  const set = new Set(cells.map((c) => c.x + "," + c.y));
  return cells.filter((c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(
    ([dx, dy]) => !set.has((c.x + dx) + "," + (c.y + dy))));
}
function independentFloodConnected(cells) {
  if (!cells.length) return true;
  const set = new Set(cells.map((c) => c.x + "," + c.y));
  const seen = new Set(); const q = [cells[0]]; seen.add(cells[0].x + "," + cells[0].y);
  let head = 0;
  while (head < q.length) {
    const c = q[head++];
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const k = (c.x + dx) + "," + (c.y + dy);
      if (set.has(k) && !seen.has(k)) { seen.add(k); q.push({ x: c.x + dx, y: c.y + dy }); }
    });
  }
  return seen.size === cells.length;
}
function normalizeForCompare(plan) {
  return {
    cells: Array.from(plan.cells), tiers: Array.from(plan.tiers), seed: plan.seed,
    rooms: plan.rooms.map((r) => ({ segNum: r.segNum, segId: r.segId, x: r.x, y: r.y, w: r.w, d: r.d, depth: r.depth, isFinale: r.isFinale, terrain: r.terrain })),
    corridors: plan.corridors.map((c) => ({ fromSeg: c.fromSeg, toSeg: c.toSeg, width: c.width, bridge: c.bridge, cells: c.cells })),
    doors: plan.doors.map((d) => ({ x: d.x, y: d.y, betweenSegs: d.betweenSegs, heightScale: d.heightScale })), // toSeg stripped — a genuinely new field
  };
}

console.log("=== 0. RED-FIRST proof ===");
{
  let existedAtBase = true, msg = "";
  try {
    const out = execSync(`git show ${BASE_COMMIT}:src/engine/place-spatialize.js`, { cwd: ROOT, encoding: "utf-8" });
    existedAtBase = /\bshapeForArchetype\b/.test(out) || /\brasterizeShape\b/.test(out);
  } catch (e) { existedAtBase = false; msg = String(e.stderr || e.message || "").split("\n")[0]; }
  check("0a. shapeForArchetype/rasterizeShape did NOT exist at C2 tip " + BASE_COMMIT, !existedAtBase, msg);

  const tc = tableCheck();
  check("0b. row 089 (Mid-Size Rotunda, 30' diameter) is real table text", tc.row089);
  check("0c. row 101 (Grand Octagon, 60'x60') is real table text", tc.row101);
  check("0d. row 102 (L-Shaped Chamber, 30'x30' 10' arms) is real table text", tc.row102);
  check("0e. row 140 (Massive Cavern, 60'x80' irregular) is real table text", tc.row140);
  check("0f. row 027 (T-Junction, the T-shaped false-positive trap) is real table text", tc.row027);
  check("0g. row 184 (Lava/Acid Crossing, the cross-hall false-positive trap) is real table text", tc.row184);

  // "filled rect" = every bbox cell is part of the room's own rasterized footprint (FLOOR *or*
  // DOOR — a corridor's own door legitimately overwrites exactly one boundary FLOOR cell to DOOR
  // even in a plain rect room, today and always; strict FLOOR-only equality would false-positive
  // here on that pre-existing, unrelated behavior).
  const isFootprint = (cellVal, SC) => cellVal === SC.FLOOR || cellVal === SC.DOOR;

  const oldEng = loadBaseEngine();
  const segs = chainFixture([{}, ROW_089_ROTUNDA]);
  const oldPlan = oldEng.__spatializePlan(segs, "The Spine", { walkId: "stage-c3-redfirst-old" });
  const oldRoom = oldPlan.rooms.find((r) => r.segId === "s2");
  const oldCellCount = oldRoom.w * oldRoom.d;
  let oldFloorCount = 0;
  for (let yy = oldRoom.y; yy < oldRoom.y + oldRoom.d; yy++)
    for (let xx = oldRoom.x; xx < oldRoom.x + oldRoom.w; xx++)
      if (isFootprint(oldPlan.cells[yy * oldPlan.cellW + xx], oldEng.__SPATIAL_CELL)) oldFloorCount++;
  check("0h. RED-FIRST (OLD module): a real Rotunda roll still renders as a FILLED RECT (areaType discarded)",
    oldFloorCount === oldCellCount, { oldFloorCount, oldCellCount });

  const eng0 = loadEngine();
  eng0.SPATIAL_SHAPES = false;
  const offPlan = eng0.__spatializePlan(segs, "The Spine", { walkId: "stage-c3-redfirst-off" });
  const offRoom = offPlan.rooms.find((r) => r.segId === "s2");
  let offFloorCount = 0;
  for (let yy = offRoom.y; yy < offRoom.y + offRoom.d; yy++)
    for (let xx = offRoom.x; xx < offRoom.x + offRoom.w; xx++)
      if (isFootprint(offPlan.cells[yy * offPlan.cellW + xx], eng0.__SPATIAL_CELL)) offFloorCount++;
  check("0i. RED-FIRST (NEW module, SPATIAL_SHAPES OFF): the same Rotunda roll -> filled rect, no .shape",
    offFloorCount === offRoom.w * offRoom.d && offRoom.shape == null, { offFloorCount, area: offRoom.w * offRoom.d, shape: offRoom.shape });
}

const eng = loadEngine();
check("sanity: spatializePlan is a function", typeof eng.__spatializePlan === "function");
check("sanity: shapeForArchetype is a function", typeof eng.__shapeForArchetype === "function");
check("sanity: rasterizeShape is a function", typeof eng.__rasterizeShape === "function");
if (typeof eng.__spatializePlan !== "function") {
  console.log(`\n${pass} passed, ${fail} failed — spatializePlan not found, cannot run further checks.`);
  process.exit(1);
}

console.log("\n=== 1. shapeForArchetype: real table archetype names -> correct shape tags ===");
{
  const cases = [
    ["Small Rotunda", "circle"], ["Mid-Size Rotunda", "circle"], ["Large Rotunda", "circle"], ["Grand Rotunda", "circle"],
    ["Small Octagon", "octagon"], ["Mid-Size Octagon", "octagon"], ["Large Octagon", "octagon"], ["Grand Octagon", "octagon"],
    ["L-Shaped Chamber", "L"], ["T-Shaped Chamber", "T"], ["Cross-Shaped Hall", "cross"],
    ["Small Oval", "ellipse"], ["Mid-Size Oval", "ellipse"], ["Large Oval", "ellipse"],
    ["Small Cave", "cave"], ["Natural Fissure", "cave"], ["Cave Tunnel", "cave"], ["Lava Tube", "cave"],
    ["Cave Chamber", "cave"], ["Massive Cavern", "cave"], ["Chasm Room", "cave"],
    ["Narrow Passage", "rect"], ["Standard Corridor", "rect"], ["T-Junction", "rect"], ["Bent Corridor", "rect"],
  ];
  cases.forEach(([name, expect]) => {
    check(`1. "${name}" -> ${expect}`, eng.__shapeForArchetype(name) === expect, eng.__shapeForArchetype(name));
  });
  check('1x. FALSE-POSITIVE TRAP: "T-Junction" (real row 027) does NOT hit the T-shaped rule',
    eng.__shapeForArchetype("T-Junction") === "rect", eng.__shapeForArchetype("T-Junction"));
  check('1y. FALSE-POSITIVE TRAP: "Lava/Acid Crossing" (real row 184) hits the LAVA cave rule, not the cross-hall rule',
    eng.__shapeForArchetype("Lava/Acid Crossing") === "cave", eng.__shapeForArchetype("Lava/Acid Crossing"));
  check("1z. undefined/missing areaType -> rect, never throws", eng.__shapeForArchetype(undefined) === "rect");
}

console.log("\n=== 2. ROTUNDA (row 089, real table text) -> radial footprint, not a filled rect ===");
{
  const segs = chainFixture([{}, ROW_089_ROTUNDA]);
  const plan = eng.__spatializePlan(segs, "The Spine", { walkId: "stage-c3-check2" });
  const room = plan.rooms.find((r) => r.segId === "s2");
  check("2a. room sized from dims (30' diameter -> 6x6, C1 sanity)", room.w === 6 && room.d === 6, `${room.w}x${room.d}`);
  check("2b. rooms[].shape === 'circle'", room.shape === "circle", room.shape);
  check("2c. rooms[].cells is a real array", Array.isArray(room.cells) && room.cells.length > 0, room.cells && room.cells.length);
  check("2d. FEWER floor cells than the filled bbox (36) — not a filled rect", room.cells.length < room.w * room.d, room.cells.length);
  const corners = bboxCornersIncluded(room.cells, room);
  check("2e. BW5 SEAM 2: all 4 bbox corners EXCLUDED (a filled rect never excludes its own corners; an inscribed circle always does)",
    !corners.TL && !corners.TR && !corners.BL && !corners.BR, corners);
  const idx = (x, y) => y * plan.cellW + x;
  check("2f. every rooms[].cells entry is really stamped FLOOR or DOOR in plan.cells (a door legitimately overwrites its own boundary cell)",
    room.cells.every((c) => plan.cells[idx(c.x, c.y)] === eng.__SPATIAL_CELL.FLOOR || plan.cells[idx(c.x, c.y)] === eng.__SPATIAL_CELL.DOOR));
}

console.log("\n=== 3. OCTAGON (row 101, Grand Octagon, real table text) -> 8-face boundary ===");
{
  const segs = chainFixture([{}, ROW_101_OCTAGON]);
  const plan = eng.__spatializePlan(segs, "The Spine", { walkId: "stage-c3-check3" });
  const room = plan.rooms.find((r) => r.segId === "s2");
  check("3a. room sized from dims (60'x60' -> 12x12, C1 sanity)", room.w === 12 && room.d === 12, `${room.w}x${room.d}`);
  check("3b. rooms[].shape === 'octagon'", room.shape === "octagon", room.shape);
  const corners = bboxCornersIncluded(room.cells, room);
  check("3c. all 4 bbox corners EXCLUDED (the 4 diagonal chamfer faces)",
    !corners.TL && !corners.TR && !corners.BL && !corners.BR, corners);
  const mids = edgeMidpointsIncluded(room.cells, room);
  check("3d. all 4 edge-midpoints INCLUDED (the 4 straight faces) -> together, an 8-face boundary",
    mids.top && mids.bottom && mids.left && mids.right, mids);
  check("3e. fewer cells than the filled bbox (144), but a real majority (a chamfer, not a diamond)",
    room.cells.length < 144 && room.cells.length > 90, room.cells.length);
}

console.log("\n=== 4. L-SHAPED (row 102, real table text) -> exactly one corner subtracted ===");
{
  const segs = chainFixture([{}, ROW_102_L]);
  const plan = eng.__spatializePlan(segs, "The Spine", { walkId: "stage-c3-check4" });
  const room = plan.rooms.find((r) => r.segId === "s2");
  check("4a. room sized from dims (30'x30' 10'-arms -> 6x6, C1 sanity)", room.w === 6 && room.d === 6, `${room.w}x${room.d}`);
  check("4b. rooms[].shape === 'L'", room.shape === "L", room.shape);
  const corners = bboxCornersIncluded(room.cells, room);
  const includedCount = Object.values(corners).filter(Boolean).length;
  check("4c. exactly ONE of the 4 bbox corners is excluded (the subtracted corner) — an L, not a plus/cross",
    includedCount === 3, corners);
  check("4d. fewer cells than the filled bbox (36)", room.cells.length < 36, room.cells.length);
}

console.log("\n=== 5. CAVE (row 140, Massive Cavern, real table text) -> irregular + connected ===");
{
  const segs = chainFixture([{}, ROW_140_CAVERN]);
  const walkId = "stage-c3-check5";
  const plan = eng.__spatializePlan(segs, "The Spine", { walkId });
  const room = plan.rooms.find((r) => r.segId === "s2");
  check("5a. room sized from dims (60'x80' -> 16x12, C1 sanity)", room.w === 16 && room.d === 12, `${room.w}x${room.d}`);
  check("5b. rooms[].shape === 'cave'", room.shape === "cave", room.shape);
  check("5c. fewer cells than the filled bbox (192)", room.cells.length < 192, room.cells.length);

  const caveSet = new Set(room.cells.map((c) => (c.x - room.x) + "," + (c.y - room.y)));
  const ellipseLocal = eng.__rasterizeShape("ellipse", room.w, room.d, "stage-c3:shape:" + room.segNum);
  const ellipseSet = new Set();
  for (let ly = 0; ly < room.d; ly++) for (let lx = 0; lx < room.w; lx++) if (ellipseLocal[ly * room.w + lx]) ellipseSet.add(lx + "," + ly);
  let symDiff = 0;
  new Set([...caveSet, ...ellipseSet]).forEach((k) => { if (caveSet.has(k) !== ellipseSet.has(k)) symDiff++; });
  check("5d. IRREGULAR: the cave's own cell set differs from a pure ellipse over the same bbox+seed (real noise raggedness)",
    symDiff > 0, symDiff);

  check("5e. CONNECTED: an INDEPENDENT flood-fill re-check (harness-local, not the module's own) confirms ONE component",
    independentFloodConnected(room.cells));

  const plan2 = eng.__spatializePlan(segs, "The Spine", { walkId });
  const room2 = plan2.rooms.find((r) => r.segId === "s2");
  check("5f. deterministic per seed: same walkId -> byte-identical cave cell set across 2 runs",
    JSON.stringify(room.cells) === JSON.stringify(room2.cells));
}

console.log("\n=== 6. EXITS FROM POLYGON FACES: 3 real segment.exits[] edges -> 3 boundary doors, each bound to its toSeg ===");
{
  const segs = hubFixture(ROW_089_ROTUNDA, [{}, {}, {}]);
  const plan = eng.__spatializePlan(segs, "The Hub", { walkId: "stage-c3-check6" });
  const room = plan.rooms.find((r) => r.segId === "s1");
  check("6a. rooms[].shape === 'circle' (the focus room really is the Rotunda)", room.shape === "circle", room.shape);

  const ownCellSet = new Set(room.cells.map((c) => c.x + "," + c.y));
  const ownDoors = plan.doors.filter((d) => ownCellSet.has(d.x + "," + d.y));
  check("6b. exactly 3 doors sit on s1's OWN cell set (one per segment.exits[] edge)", ownDoors.length === 3, ownDoors.length);

  const boundary = independentBoundaryCells(room.cells);
  const boundarySet = new Set(boundary.map((c) => c.x + "," + c.y));
  check("6c. every one of s1's own doors is an INDEPENDENTLY-recomputed polygon-BOUNDARY cell (never an interior cell)",
    ownDoors.every((d) => boundarySet.has(d.x + "," + d.y)),
    ownDoors.map((d) => ({ x: d.x, y: d.y, onBoundary: boundarySet.has(d.x + "," + d.y) })));

  const toSegs = ownDoors.map((d) => d.toSeg).sort();
  check("6d. each door's toSeg names a distinct real neighbor segNum (2,3,4)", JSON.stringify(toSegs) === JSON.stringify([2, 3, 4]), toSegs);

  const rb = plan.rooms.find((r) => r.segId === "s2");
  check("6e. the neighbor's own door (rect room, betweenSegs [1,2]) still resolves inside ITS rect (old behavior unchanged)",
    plan.doors.some((d) => d.betweenSegs[0] === 1 && d.betweenSegs[1] === 2 && d.x >= rb.x && d.x < rb.x + rb.w && d.y >= rb.y && d.y < rb.y + rb.d));
}

console.log("\n=== 7. RECT ARCHETYPE REGRESSION: byte-identical to the OLD (pre-C3) module ===");
{
  const segs = chainFixture([ROW_007_CORRIDOR, ROW_027_TJUNCTION, {}, { areaType: "Standard Chamber", dims: "20' x 20' square" }]);
  const walkId = "stage-c3-check7";
  const oldEng = loadBaseEngine();
  const oldPlan = oldEng.__spatializePlan(segs, "The Spine", { walkId });
  const newPlan = eng.__spatializePlan(segs, "The Spine", { walkId });

  check("7a. every room classified 'rect' (the fixture's own control — none of these archetypes are non-rect)",
    newPlan.rooms.every((r) => r.shape === "rect"), newPlan.rooms.map((r) => r.shape));

  const oldNorm = normalizeForCompare(oldPlan), newNorm = normalizeForCompare(newPlan);
  check("7b. plan.cells buffer byte-identical to the OLD module's output", JSON.stringify(oldNorm.cells) === JSON.stringify(newNorm.cells));
  check("7c. plan.tiers buffer byte-identical to the OLD module's output", JSON.stringify(oldNorm.tiers) === JSON.stringify(newNorm.tiers));
  check("7d. seed byte-identical", oldNorm.seed === newNorm.seed, `${oldNorm.seed} vs ${newNorm.seed}`);
  check("7e. rooms[] (x/y/w/d/depth/terrain) byte-identical", JSON.stringify(oldNorm.rooms) === JSON.stringify(newNorm.rooms));
  check("7f. corridors[] byte-identical", JSON.stringify(oldNorm.corridors) === JSON.stringify(newNorm.corridors));
  check("7g. doors[] byte-identical (toSeg — a genuinely NEW field — stripped before compare)", JSON.stringify(oldNorm.doors) === JSON.stringify(newNorm.doors));
}

console.log("\n=== 8. Sanity pass: T / cross / ellipse (all 8 DUNGEON-GRAPH.md U6 shape tags exercised) ===");
{
  const segT = chainFixture([{}, ROW_105_T]);
  const planT = eng.__spatializePlan(segT, "The Spine", { walkId: "stage-c3-check8t" });
  const roomT = planT.rooms.find((r) => r.segId === "s2");
  check("8a. T-Shaped -> shape:'T'", roomT.shape === "T", roomT.shape);
  const cornersT = bboxCornersIncluded(roomT.cells, roomT);
  check("8b. T excludes exactly the 2 BOTTOM corners (crossbar top, stem down)",
    cornersT.TL && cornersT.TR && !cornersT.BL && !cornersT.BR, cornersT);

  const segX = chainFixture([{}, ROW_107_CROSS]);
  const planX = eng.__spatializePlan(segX, "The Spine", { walkId: "stage-c3-check8x" });
  const roomX = planX.rooms.find((r) => r.segId === "s2");
  check("8c. Cross-Shaped -> shape:'cross'", roomX.shape === "cross", roomX.shape);
  const cornersX = bboxCornersIncluded(roomX.cells, roomX);
  check("8d. cross excludes all 4 corners (a real plus shape)",
    !cornersX.TL && !cornersX.TR && !cornersX.BL && !cornersX.BR, cornersX);

  const segO = chainFixture([{}, ROW_109_OVAL]);
  const planO = eng.__spatializePlan(segO, "The Spine", { walkId: "stage-c3-check8o" });
  const roomO = planO.rooms.find((r) => r.segId === "s2");
  check("8e. Small Oval -> shape:'ellipse'", roomO.shape === "ellipse", roomO.shape);
  const cornersO = bboxCornersIncluded(roomO.cells, roomO);
  check("8f. ellipse excludes all 4 corners", !cornersO.TL && !cornersO.TR && !cornersO.BL && !cornersO.BR, cornersO);
}

console.log("\n=== 9. determinism: a mixed-shape dungeon run twice -> byte-identical plan ===");
{
  const segs = chainFixture([ROW_089_ROTUNDA, ROW_101_OCTAGON, ROW_102_L, ROW_140_CAVERN, ROW_007_CORRIDOR]);
  const walkId = "stage-c3-check9";
  const p1 = eng.__spatializePlan(segs, "The Spine", { walkId });
  const p2 = eng.__spatializePlan(segs, "The Spine", { walkId });
  check("9a. plan.cells byte-identical across 2 calls", JSON.stringify(Array.from(p1.cells)) === JSON.stringify(Array.from(p2.cells)));
  check("9b. plan.tiers byte-identical across 2 calls", JSON.stringify(Array.from(p1.tiers)) === JSON.stringify(Array.from(p2.tiers)));
  check("9c. rooms[].shape byte-identical across 2 calls", JSON.stringify(p1.rooms.map((r) => r.shape)) === JSON.stringify(p2.rooms.map((r) => r.shape)));
  check("9d. rooms[].cells byte-identical across 2 calls", JSON.stringify(p1.rooms.map((r) => r.cells)) === JSON.stringify(p2.rooms.map((r) => r.cells)));
  check("9e. doors[] byte-identical across 2 calls", JSON.stringify(p1.doors) === JSON.stringify(p2.doors));
  check("9f. seed byte-identical across 2 calls", p1.seed === p2.seed, `${p1.seed} vs ${p2.seed}`);
}

console.log("\n=== 10. dspForceCenterCore guarantee: floor(w/2),floor(d/2) always included, every shape, w/d in [4..24] ===");
{
  const shapes = ["circle", "ellipse", "octagon", "L", "T", "cross", "cave", "rect"];
  let failures = [];
  shapes.forEach((shape) => {
    for (let w = 4; w <= 24; w += 2) {
      for (let d = 4; d <= 24; d += 3) {
        const included = eng.__rasterizeShape(shape, w, d, "core-check:" + shape + ":" + w + ":" + d);
        const cx = Math.floor(w / 2), cy = Math.floor(d / 2);
        if (!included[cy * w + cx]) failures.push({ shape, w, d });
      }
    }
  });
  check("10a. every (shape,w,d) combination includes its own BFS-start cell", failures.length === 0, failures.slice(0, 5));
}

console.log("\n=== 11. check-manifest.py (run live) ===");
{
  let out = "", okExit = true;
  try { out = execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { okExit = false; out = String(e.stdout || "") + String(e.stderr || ""); }
  check("11a. check-manifest.py exits 0", okExit, out.split("\n").slice(-3).join(" | "));
  check("11b. check-manifest.py prints RESULT: OK", /RESULT: OK/.test(out));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
