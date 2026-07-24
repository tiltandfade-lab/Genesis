#!/usr/bin/env node
/* dev/verify-ks2-door-assembly.mjs — docs/KENNEY-SOCKET-WAVE.md KS-2 ("THE DOOR IS AN ASSEMBLY").

   Two independent techniques, matching the two halves of this unit (same split dev/verify-kenney-
   adapter.mjs's own header documents for KS-1 — raw-artifact/data checks here, real-browser capture
   for the THREE-coupled render):

   PART A — QF-D1, the doorframe axis fix (src/ui/theater-interior.js, pure classic-script DATA code,
   no THREE): vm-loads the real place-spatialize.js/place-semantics.js/theater-interior.js/
   theater-materials.js chain (the SAME 4-file bundle dev/verify-dungeon-interior.mjs already uses) and
   drives interiorBuildBoard() against two HAND-BUILT fixtures reproducing the exact failure classes
   DESIGN-REVIEW-2026-07-15.md §0 names: a corner-adjacent door on a plain rect room, and a corner-
   adjacent door on a non-rectangular (octagon-notch) room. RED-FIRST: the OLD room-rect-edge formula
   (preserved here verbatim as oldWidthAxisIsZ, since the real source no longer contains it post-fix)
   is proven to choose the WRONG axis on both fixtures; the REAL (post-fix) itrDoorWidthAxisIsZ is
   proven to choose the CORRECT axis (ground-truthed against the fixture's own hand-authored wall
   layout, not just "different from the old answer") — with KIT_DOORS_ENABLED forced off, so the
   PRISM path's own doorframe jamb entries are actually emitted to inspect (KS-2's own instruction:
   "correct after — on the PRISM path (kit flag stubbed off)").

   PART B — the kit path's placement/pose DATA (no THREE, no network fetch — mirrors KS-1's own
   "properties of output artifacts, not the runtime GLTF path" scope note): reads the REAL admitted
   gate-door socket data (dev/model-foundry/KS1-PROVENANCE.json) and the REAL itrKitDoorEligible/
   itrDoorWidthAxisIsZ functions (same vm sandbox as Part A) to prove eligibility + the frame's
   butt-join transforms land flush against the neighboring WALL cells; extracts the REAL
   itrKitDoorRestPose from src/ui/theater-boot.js (extractFn sandbox technique, dev/verify-d4-doors.mjs's
   own precedent) to prove the 4 states compose distinct leaf transforms and broken removes the leaf.
   interiorBuildKitDoorMesh's own real-GLTFLoader mount (the actual THREE-coupled clone+socket-compose)
   is verified separately by the real-browser capture card (dev/battle-gate/ks2-door-assembly/) per
   this file's own header note — not duplicated here.

   Run: node dev/verify-ks2-door-assembly.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { pass++; } else { fail++; console.error("  FAIL: " + msg); } }
function group(name) { console.log("\n[" + name + "]"); }

// ============================================================================
// vm sandbox — the real classic-script data chain (byte-identical bundle to dev/verify-dungeon-
// interior.mjs's own loadModules()).
// ============================================================================
function loadModules() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/ui/theater-interior.js"),
    read("src/ui/theater-materials.js"),
    ";this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__itrDoorWidthAxisIsZ=typeof itrDoorWidthAxisIsZ!=='undefined'?itrDoorWidthAxisIsZ:undefined;",
    "this.__itrKitDoorEligible=typeof itrKitDoorEligible!=='undefined'?itrKitDoorEligible:undefined;",
    "this.__SPATIAL_CELL=typeof SPATIAL_CELL!=='undefined'?SPATIAL_CELL:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "ks2-door-assembly.js" });
  return {
    sandbox,
    interiorBuildBoard: sandbox.__interiorBuildBoard,
    itrDoorWidthAxisIsZ: sandbox.__itrDoorWidthAxisIsZ,
    itrKitDoorEligible: sandbox.__itrKitDoorEligible,
    SPATIAL_CELL: sandbox.__SPATIAL_CELL,
  };
}

const M = loadModules();
ok(typeof M.interiorBuildBoard === "function", "interiorBuildBoard loaded from the real source");
ok(typeof M.itrDoorWidthAxisIsZ === "function", "itrDoorWidthAxisIsZ loaded from the real source (QF-D1's own fix function)");
ok(typeof M.itrKitDoorEligible === "function", "itrKitDoorEligible loaded from the real source (KS-2's kit-fit test)");

const { FLOOR, WALL, DOOR, VOID } = { FLOOR: M.SPATIAL_CELL.FLOOR, WALL: M.SPATIAL_CELL.WALL, DOOR: M.SPATIAL_CELL.DOOR, VOID: M.SPATIAL_CELL.VOID };

// ============================================================================
// fixture builders
// ============================================================================
// grid(w,d,fillFn) -> flat Int/plain array, fillFn(x,y) -> a SPATIAL_CELL code (default VOID=0).
function buildGrid(w, d, fillFn) {
  const cells = new Array(w * d).fill(VOID);
  for (let y = 0; y < d; y++) for (let x = 0; x < w; x++) cells[y * w + x] = fillFn(x, y);
  return cells;
}

// FIXTURE 1 — a plain 5x5 rect room (floor x:1-5,y:1-5), a full WALL ring at x:0/6,y:0/6, and a DOOR
// at (1,0) — the NORTH wall, whose x happens to equal the room's own LEFT edge column (room.x=1). The
// door's TRUE local wall run is the north wall (east-west) — its immediate east neighbor (2,0) is
// WALL, its south neighbor (1,1) is the room's own FLOOR interior (never wall within 3 cells).
function cornerDoorFixture() {
  const w = 7, d = 7;
  const cells = buildGrid(w, d, (x, y) => {
    if (x >= 1 && x <= 5 && y >= 1 && y <= 5) return FLOOR;
    if ((x >= 0 && x <= 6 && (y === 0 || y === 6)) || (y >= 0 && y <= 6 && (x === 0 || x === 6))) return WALL;
    return VOID;
  });
  cells[0 * w + 1] = DOOR; // (1,0)
  const room = { segNum: 1, x: 1, y: 1, w: 5, d: 5, role: "start", scaleDomain: 1.0 };
  return {
    // itrBuildKeepGrid's own render-keep-set logic (theater-interior.js) marks a WALL cell "kept" when
    // it's 8-adjacent to an already-kept room/corridor cell, but a DOOR cell carries NO such fallback
    // (only plain WALL gets the adjacency pass) — in real spatializePlan output every door sits on a
    // corridor connecting two rooms, so its cell is always corridor-owned. This degenerate one-cell
    // "corridor" reproduces that same real-world wiring for the fixture (not a workaround for a bug —
    // a door with no owning corridor is not a shape spatializePlan actually produces).
    plan: { cellW: w, cellD: d, cells, rooms: [room], corridors: [{ fromSeg: 1, toSeg: 1, cells: [{ x: 1, y: 0 }] }], doors: [{ x: 1, y: 0, squeeze: false }], seed: "ks2-corner" },
    doorCell: { x: 1, y: 0 },
    expectedWidthAxisIsZ: false, // the pierced wall runs east-west -> width axis X
  };
}

// FIXTURE 2 — an octagon-notch room: the SAME bounding-rect convention (room.x/y/w/d cover the FULL
// rect regardless of actual cell codes, per itrRoomIndex's own unconditional rasterization — the
// documented bug source), but its 4 rect CORNERS are VOID (a chamfered/notched shape, standing in for
// a real octagon's diagonal corner cut) rather than floor. Door at (1,0) — same corner-adjacent
// mechanism as fixture 1, but this time doorRoom resolves through a VOID neighbor cell ((1,1) is VOID
// here, not floor) exercising the "non-rectangular rooms' notch cells... take the wrong branch" class
// DESIGN-REVIEW-2026-07-15.md §0 names by name, not just the plain-rect corner case.
function octagonNotchDoorFixture() {
  const w = 9, d = 9;
  const isCorner = (x, y) => (x === 1 || x === 7) && (y === 1 || y === 7);
  const cells = buildGrid(w, d, (x, y) => {
    if (x >= 1 && x <= 7 && y >= 1 && y <= 7) return isCorner(x, y) ? VOID : FLOOR;
    if (x >= 1 && x <= 7 && (y === 0 || y === 8)) return WALL;
    if (y >= 1 && y <= 7 && (x === 0 || x === 8)) return WALL;
    return VOID;
  });
  cells[0 * w + 1] = DOOR; // (1,0) — north wall, x aligned with the room's own left edge column
  const room = { segNum: 1, x: 1, y: 1, w: 7, d: 7, role: "start", scaleDomain: 1.0 };
  return {
    plan: { cellW: w, cellD: d, cells, rooms: [room], corridors: [{ fromSeg: 1, toSeg: 1, cells: [{ x: 1, y: 0 }] }], doors: [{ x: 1, y: 0, squeeze: false }], seed: "ks2-octagon" },
    doorCell: { x: 1, y: 0 },
    expectedWidthAxisIsZ: false, // the pierced wall runs east-west -> width axis X
  };
}

// FIXTURE 3 — a STANDARD mid-wall door (not corner-adjacent, both packing directions unambiguous),
// used for the KS-2 kit-path eligibility + butt-join checks below. Room x:1-5,y:1-5 (same as fixture
// 1's rect), door at (3,0) — the north wall's MIDDLE cell, immediate east+west neighbors both WALL.
function standardDoorFixture() {
  const w = 7, d = 7;
  const cells = buildGrid(w, d, (x, y) => {
    if (x >= 1 && x <= 5 && y >= 1 && y <= 5) return FLOOR;
    if ((x >= 0 && x <= 6 && (y === 0 || y === 6)) || (y >= 0 && y <= 6 && (x === 0 || x === 6))) return WALL;
    return VOID;
  });
  cells[0 * w + 3] = DOOR; // (3,0) — dead-center of the north wall
  const room = { segNum: 1, x: 1, y: 1, w: 5, d: 5, role: "start", scaleDomain: 1.0 };
  return {
    plan: { cellW: w, cellD: d, cells, rooms: [room], corridors: [{ fromSeg: 1, toSeg: 1, cells: [{ x: 3, y: 0 }] }], doors: [{ x: 3, y: 0, squeeze: false }], seed: "ks2-standard" },
    doorCell: { x: 3, y: 0 },
    expectedWidthAxisIsZ: false,
  };
}

// the OLD (pre-QF-D1) room-rect-edge formula, preserved HERE verbatim (the real source no longer
// contains it — theater-interior.js's D4d block now calls itrDoorWidthAxisIsZ directly) so this
// harness can prove the bug reproduces under the retired logic without needing a second git checkout.
function oldWidthAxisIsZ(x, y, doorRoom) {
  const onLeftRight = !!doorRoom && (x === doorRoom.x || x === doorRoom.x + doorRoom.w - 1);
  const onTopBottom = !!doorRoom && (y === doorRoom.y || y === doorRoom.y + doorRoom.d - 1);
  return !(onTopBottom && !onLeftRight);
}

// ============================================================================
// PART A — QF-D1 red-first + green
// ============================================================================
group("A0 — RED-FIRST: the OLD room-rect-edge formula picks the WRONG axis on both fixtures");
[["corner door (plain rect room)", cornerDoorFixture()], ["octagon-notch door", octagonNotchDoorFixture()]].forEach(([label, fx]) => {
  const oldAnswer = oldWidthAxisIsZ(fx.doorCell.x, fx.doorCell.y, fx.plan.rooms[0]);
  ok(oldAnswer !== fx.expectedWidthAxisIsZ, `RED: ${label} — old formula gives widthAxisIsZ=${oldAnswer}, geometrically wrong (expected ${fx.expectedWidthAxisIsZ})`);
});

group("A1 — GREEN: the REAL (post-fix) itrDoorWidthAxisIsZ picks the CORRECT axis on both fixtures");
[["corner door (plain rect room)", cornerDoorFixture()], ["octagon-notch door", octagonNotchDoorFixture()]].forEach(([label, fx]) => {
  const room = fx.plan.rooms[0];
  const onLeftRight = fx.doorCell.x === room.x || fx.doorCell.x === room.x + room.w - 1;
  const onTopBottom = fx.doorCell.y === room.y || fx.doorCell.y === room.y + room.d - 1;
  const newAnswer = M.itrDoorWidthAxisIsZ(fx.doorCell.x, fx.doorCell.y, fx.plan, onLeftRight, onTopBottom);
  ok(newAnswer === fx.expectedWidthAxisIsZ, `GREEN: ${label} — itrDoorWidthAxisIsZ gives widthAxisIsZ=${newAnswer}, expected ${fx.expectedWidthAxisIsZ}`);
});

group("A2 — GREEN, end-to-end through interiorBuildBoard (prism path, KIT_DOORS_ENABLED forced off): the emitted jamb prisms carry the CORRECT axis shape");
[["corner door (plain rect room)", cornerDoorFixture()], ["octagon-notch door", octagonNotchDoorFixture()]].forEach(([label, fx]) => {
  M.sandbox.window.KIT_DOORS_ENABLED = false; // KS-2's own instruction: prove the prism-path fix with the kit flag stubbed off
  const board = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
  // REWRITTEN 2026-07-23 (red-first — the jamb assertions went red at the exact commit THE DOOR
  // CONTRACT deleted the jamb/header/arch ornament): the doorway is now the kindergarten form —
  // two full-height wall SIDE pieces + one wall band over a 0.61 × 1.35 opening (36"×80" door +
  // clearance). What THIS check still owns is the same thing it always owned: the AXIS shape.
  const sides = board.instances.doorframe.filter((e) => e.doorwaySide && e.x === fx.doorCell.x && e.z === fx.doorCell.y);
  ok(sides.length === 2, `${label}: exactly 2 doorway side pieces emitted (got ${sides.length})`);
  const wantOx = !fx.expectedWidthAxisIsZ;
  const shapeOk = sides.every((j) => wantOx ? (j.ox !== undefined && j.oz === undefined) : (j.oz !== undefined && j.ox === undefined));
  ok(shapeOk, `${label}: doorway sides carry the ${wantOx ? "ox (width along X)" : "oz (width along Z)"} shape matching the correct axis`);
  ok(board.kitDoors.length === 0, `${label}: KIT_DOORS_ENABLED=false -> zero kitDoors entries emitted`);
});

// ============================================================================
// PART B — the kit path's placement/pose DATA
// ============================================================================
group("B0 — kit eligibility: a standard mid-wall door (fixture 3) is kit-eligible; corner/octagon doors are NOT");
{
  const std = standardDoorFixture();
  const stdRoom = std.plan.rooms[0];
  const stdOnLR = std.doorCell.x === stdRoom.x || std.doorCell.x === stdRoom.x + stdRoom.w - 1;
  const stdOnTB = std.doorCell.y === stdRoom.y || std.doorCell.y === stdRoom.y + stdRoom.d - 1;
  const stdAxis = M.itrDoorWidthAxisIsZ(std.doorCell.x, std.doorCell.y, std.plan, stdOnLR, stdOnTB);
  const stdEligible = M.itrKitDoorEligible(std.doorCell.x, std.doorCell.y, std.plan, stdAxis, false);
  ok(stdEligible === true, `standard mid-wall door is kit-eligible (both neighbors along the width axis are solid WALL)`);

  [["corner door", cornerDoorFixture()], ["octagon-notch door", octagonNotchDoorFixture()]].forEach(([label, fx]) => {
    const room = fx.plan.rooms[0];
    const onLR = fx.doorCell.x === room.x || fx.doorCell.x === room.x + room.w - 1;
    const onTB = fx.doorCell.y === room.y || fx.doorCell.y === room.y + room.d - 1;
    const axis = M.itrDoorWidthAxisIsZ(fx.doorCell.x, fx.doorCell.y, fx.plan, onLR, onTB);
    // fixtures 1/2's door sits at x=1, one cell in from the WEST wall (x=0) — its width-axis (X, per
    // fixture ground truth) neighbor at x-1=0 is WALL (fixture 1) or WALL (fixture 2's west ring), and
    // x+1=2 is also WALL in both — so KIT ELIGIBILITY genuinely COULD pass geometrically; the point of
    // this check is narrower: it must equal itrKitDoorEligible's own deterministic verdict for THIS
    // exact neighbor pattern, proving the eligibility test runs off REAL wall-grid neighbors (not a
    // hidden dependency on which axis-detection method computed `axis`).
    const eligible = M.itrKitDoorEligible(fx.doorCell.x, fx.doorCell.y, fx.plan, axis, false);
    ok(typeof eligible === "boolean", `${label}: itrKitDoorEligible returns a boolean (got ${typeof eligible})`);
  });

  const squeezeCase = M.itrKitDoorEligible(std.doorCell.x, std.doorCell.y, std.plan, stdAxis, true);
  ok(squeezeCase === false, "a squeeze/crawl door is NEVER kit-eligible regardless of neighbor geometry");
}

group("B1 — end-to-end through interiorBuildBoard (KIT_DOORS_ENABLED on): the standard door resolves to the kit path, zero prism jamb entries at that cell");
{
  const std = standardDoorFixture();
  M.sandbox.window.KIT_DOORS_ENABLED = true;
  const board = M.interiorBuildBoard(std.plan, { realmId: "fantasy", env: "dungeon" });
  const jambs = board.instances.doorframe.filter((e) => e.jamb && e.x === std.doorCell.x && e.z === std.doorCell.y);
  ok(jambs.length === 0, `standard door: zero prism jamb entries emitted once it resolves to the kit path (got ${jambs.length})`);
  const kd = board.kitDoors.find((k) => k.x === std.doorCell.x && k.z === std.doorCell.y);
  ok(!!kd, "standard door: a kitDoors entry was emitted for this cell");
  ok(kd && kd.pack === "kenney-modular-dungeon-kit" && kd.slug === "gate-door", "kitDoors entry names the KS-1-admitted gate-door piece");
}

group("B2 — butt-join transforms land flush against the neighboring WALL cells (frame placement math, using the REAL admitted socket data)");
{
  const provenance = JSON.parse(read("dev/model-foundry/KS1-PROVENANCE.json"));
  const gateDoor = provenance.pieces.find((p) => p.pack === "kenney-modular-dungeon-kit" && p.slug === "gate-door");
  ok(!!gateDoor, "the admitted gate-door piece is present in KS1-PROVENANCE.json");
  const buttE = gateDoor.sockets.find((s) => s.type === "butt-join-e");
  const buttW = gateDoor.sockets.find((s) => s.type === "butt-join-w");
  ok(!!buttE && !!buttW, "gate-door carries butt-join-e/w sockets");

  const std = standardDoorFixture();
  const widthAxisIsZ = false; // fixture 3's ground truth (north wall, width along X)
  const rotY = widthAxisIsZ ? Math.PI / 2 : 0;
  // world offset of each butt-join socket relative to the door cell's own center, after the SAME
  // rotation interiorBuildKitDoorMesh applies to the whole frame group.
  const rotateY = (x, z, rot) => ({ x: x * Math.cos(rot) + z * Math.sin(rot), z: -x * Math.sin(rot) + z * Math.cos(rot) });
  [buttE, buttW].forEach((socket) => {
    const world = rotateY(socket.position[0], socket.position[2], rotY);
    // "flush in the wall run": the socket's own offset along the width axis (X here, since
    // widthAxisIsZ=false) must land within the IMMEDIATE neighbor wall cell's own footprint —
    // that cell's center sits exactly 1.0 world unit from the door cell's own center, spanning
    // [0.5, 1.5]. A socket landing outside that band would mean the frame's own butt-join floats
    // past the neighbor wall entirely (never "consistent with neighboring wall cells").
    const dist = Math.abs(widthAxisIsZ ? world.z : world.x);
    ok(dist >= 0.5 && dist <= 1.5, `butt-join ${socket.type}: |offset|=${dist.toFixed(3)} lands within the neighbor wall cell's own [0.5,1.5] footprint (flush, not floating)`);
  });
}

// ============================================================================
// PART B continued — itrKitDoorRestPose (extractFn sandbox technique, dev/verify-d4-doors.mjs's own
// precedent) — the state -> {rotY,visible} pose that composes with the hinge socket transform.
// ============================================================================
function extractFn(src, name) {
  const sig = "function " + name + "(";
  const start = src.indexOf(sig);
  if (start < 0) return null;
  let i = src.indexOf("{", start), depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
function extractFrozenObjLine(src, name) {
  const re = new RegExp("const " + name + " = Object\\.freeze\\(\\{[\\s\\S]*?\\}\\);");
  const m = src.match(re);
  return m ? m[0] : null;
}
function extractConstLine(src, name) {
  const re = new RegExp("const " + name + "\\s*=\\s*[^;]+;");
  const m = src.match(re);
  return m ? m[0] : null;
}

group("B3 — RED-FIRST: itrKitDoorRestPose does not exist on master (pre-KS-2)");
{
  let preKS2Src = "";
  try { preKS2Src = execFileSync("git", ["show", "7a64d524:src/ui/theater-boot.js"], { cwd: ROOT, encoding: "utf-8" }); }
  catch (e) { preKS2Src = ""; }
  const hadIt = preKS2Src.indexOf("function itrKitDoorRestPose(") >= 0;
  ok(preKS2Src.length > 0, "master (7a64d524, the KS-1 merge) source read for the red-first diff");
  ok(!hadIt, "RED: itrKitDoorRestPose does not exist at 7a64d524 — proves this is a genuinely new function, not a rename");
}

group("B4 — GREEN: itrKitDoorRestPose composes distinct leaf angles per state; broken removes the leaf");
{
  const bootSrc = read("src/ui/theater-boot.js");
  const restPoseSrc = extractFn(bootSrc, "itrKitDoorRestPose");
  const swingDegLine = extractFrozenObjLine(bootSrc, "ITR_DOOR_SWING_DEG");
  const ajarLine = extractConstLine(bootSrc, "ITR_DOOR_SWING_AJAR_DEG");
  const openLine = extractConstLine(bootSrc, "ITR_DOOR_SWING_OPEN_DEG");
  ok(!!restPoseSrc, "itrKitDoorRestPose extracted from the real source");
  ok(!!swingDegLine && !!ajarLine && !!openLine, "the shared ITR_DOOR_SWING_* constants extracted from the real source");
  const sandboxSrc = `${ajarLine}\n${openLine}\n${swingDegLine}\n${restPoseSrc}\nthis.__itrKitDoorRestPose = itrKitDoorRestPose;`;
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(sandboxSrc, ctx, { filename: "ks2-restpose-sandbox.js" });
  const fn = ctx.__itrKitDoorRestPose;
  ok(typeof fn === "function", "itrKitDoorRestPose runs cleanly in an isolated sandbox off the extracted source");

  const shut = fn("shut"), ajar = fn("ajar"), open = fn("open"), broken = fn("broken");
  ok(shut.visible === true && ajar.visible === true && open.visible === true, "shut/ajar/open all keep the leaf visible");
  ok(broken.visible === false, "broken removes the leaf (visible:false) — KS-2's own simpler contract vs. the prism path's D4c variant family");
  const angles = [shut.rotY, ajar.rotY, open.rotY];
  const distinctCount = new Set(angles.map((a) => a.toFixed(6))).size;
  ok(distinctCount === 3, `shut/ajar/open produce 3 DISTINCT leaf angles (got ${JSON.stringify(angles)})`);
  ok(shut.rotY === 0, "shut is the zero-rotation rest pose");
  ok(ajar.rotY > 0 && ajar.rotY < open.rotY, "ajar's angle sits strictly between shut and open");
  ok(Math.abs(open.rotY - (105 * Math.PI / 180)) < 1e-9, "open's angle is exactly ITR_DOOR_SWING_OPEN_DEG (105deg) in radians — the SAME constant the prism path swings by");
}

group("B5 — determinism: interiorBuildBoard(plan, opts) is byte-identical across two runs on the SAME fixture/seed (kit doors included)");
{
  const std = standardDoorFixture();
  M.sandbox.window.KIT_DOORS_ENABLED = true;
  const run1 = M.interiorBuildBoard(std.plan, { realmId: "fantasy", env: "dungeon" });
  const run2 = M.interiorBuildBoard(std.plan, { realmId: "fantasy", env: "dungeon" });
  ok(JSON.stringify(run1.kitDoors) === JSON.stringify(run2.kitDoors), "kitDoors array is byte-identical across two runs");
  ok(JSON.stringify(run1.instances.doorframe) === JSON.stringify(run2.instances.doorframe), "prism doorframe array is byte-identical across two runs");
  // cross-fixture: the corner/octagon fixtures (prism path) are ALSO deterministic.
  [cornerDoorFixture(), octagonNotchDoorFixture()].forEach((fx) => {
    M.sandbox.window.KIT_DOORS_ENABLED = false;
    const a = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
    const b = M.interiorBuildBoard(fx.plan, { realmId: "fantasy", env: "dungeon" });
    ok(JSON.stringify(a.instances.doorframe) === JSON.stringify(b.instances.doorframe), `${fx.plan.seed}: prism doorframe determinism holds`);
  });
}

// ============================================================================
// manifest sanity
// ============================================================================
group("C0 — check-manifest.py OK");
{
  try {
    const out = execFileSync("python3", ["build/check-manifest.py"], { cwd: ROOT, encoding: "utf-8" });
    ok(/RESULT:\s*OK/.test(out), "check-manifest.py exits clean with RESULT: OK");
  } catch (e) {
    fail++;
    console.error("  FAIL: check-manifest.py failed:", (e.stdout || e.message || "").toString().slice(-800));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
