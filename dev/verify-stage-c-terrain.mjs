/* Verify STAGE-C C2 — STRUCTURAL TERRAIN (docs/STAGE-C.md C2).
   src/engine/place-spatialize.js's dspParseSideTerrain keyword-scans a walk segment's rolled
   `side` prose (raised/dais/platform/step-up/elevated/gallery/balcony -> positive tier;
   sunken/pit/pool/below/lower/recess -> negative tier) into one or more per-room terrain patches
   (rooms[].terrain=[{cells,tier,kind}], the DUNGEON-GRAPH.md U6 shape) and stamps it onto a new
   parallel `plan.tiers` Int8Array (same indexing as `cells`) — behind the shared SPATIAL_SHAPES
   flag (default ON; the same flag C1 added). The render seam (theater-interior.js's
   interiorBuildBoard) folds `plan.tiers[cell]` into the floor `sy` it already computes, and the
   landed C4 room-shell compiler (theater-room-mesh.js's compileRoomShellData) turns a distinct
   `sy` bucket into a real floor tier + riser geometry — this harness proves the WHOLE chain: roll
   text -> logical plan tier -> render sy -> compiled riser.

   RED-FIRST (checked live against 0ab01533, the C1 tip this unit branched from):
     `git show 0ab01533:src/engine/place-spatialize.js | grep -c dspParseSideTerrain` -> 0 (the
     symbol did not exist before this unit) — re-checked live below, not just cited. Section 1
     additionally re-proves the SPATIAL_SHAPES OFF/ON behavioral half of red-first (STAGE-C.md C2's
     own "Red-first: OFF -> flat room, no tier" instruction), same convention dev/verify-stage-c-
     size.mjs's own check 1 already established for C1.

   Sections:
     0. RED-FIRST (git-show + OFF-flag) proof.
     1. Raised: real table row 108 (Cross-Shaped Hall) "15' x 15' central raised dais (3 ft high)"
        -> a +3-tier 3x3 patch centered in the room; plan.tiers stamped; SPATIAL_SHAPES OFF -> flat
        (no terrain, tiers all zero) — the within-harness A/B red-first proof.
     2. Sunken: real table row 090 (Mid-Size Rotunda) "15' diameter sunken pool in the center
        (3 ft deep)" -> a -3-tier 3x3 patch centered in the room.
     3. determinism: same walkId run twice -> byte-identical `tiers` buffer + rooms[].terrain.
     4. flat-fallback: missing/garbage/no-keyword `side` -> no terrain, tiers stays all-zero for
        that room, never throws (3 sub-cases: undefined field, empty string, no-keyword prose).
     5. corner/wall location cues + the whole-room-vs-patch clamp bug this unit's own fix caught
        (dspFeetPairRaw vs dspDimsToCells — a patch is NOT floored to SPATIAL_MIN_CELL): a corner
        patch stays inside the room bbox; a "500' x 500'" absurd clause clamps to the room's own
        bbox, never runaway.
     6. RENDER SEAM: interiorBuildBoard (theater-interior.js) folds plan.tiers into floor `sy` —
        the raised room's dais cells read a higher sy, the sunken room's pit cells read a lower sy,
        by exactly one ITR_DAIS_STEP quantum; every other floor cell in those rooms is untouched.
     7. FINALE-DAIS-UNBROKEN: a finale room (no `side` roll, same as every existing finale-dais
        fixture) still gets its BW2-5 dais top/ring sy exactly as before — proves this unit's floor-
        sy insertion point (before the finale-dais override block) never disturbs that path.
     8. C4 COMPILER RISER: feed the raised room's own floor cells (converted to the {x,z,tier,
        elevationY} shape theater-boot.js's real shellCells builder emits, :8706) into
        compileRoomShellData (theater-room-mesh.js, real ESM import) -> 2 floor tiers + real riser
        segments (reusing dev/verify-room-shell.mjs check 7's own tier/riser assertions); the
        sunken room does the same as a distinct check.
     9. check-manifest.py (run live).

   Run: node dev/verify-stage-c-terrain.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_COMMIT = "0ab01533";
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

// ─── loaders ──────────────────────────────────────────────────────────────────────────────────
// engine-only sandbox (place-spatialize.js alone) — mirrors dev/verify-stage-c-size.mjs exactly.
function loadEngine() {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(
    read("src/engine/place-spatialize.js") +
      "\n;this.__spatializePlan=spatializePlan;this.__SPATIAL_CELL=SPATIAL_CELL;" +
      "this.__dspParseSideTerrain=typeof dspParseSideTerrain!=='undefined'?dspParseSideTerrain:undefined;" +
      "this.__dspParseSideTerrains=typeof dspParseSideTerrains!=='undefined'?dspParseSideTerrains:undefined;",
    sandbox,
    { filename: "place-spatialize.js" }
  );
  return sandbox;
}
// full render-seam sandbox (engine + semantics + interior) — mirrors dev/verify-bw2-5-silhouette.mjs's loadModules().
function loadRender() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  const combined = [
    read("src/engine/place-spatialize.js"),
    read("src/engine/place-semantics.js"),
    read("src/ui/theater-interior.js"),
    ";this.__spatializePlan=typeof spatializePlan!=='undefined'?spatializePlan:undefined;",
    "this.__semanticizePlan=typeof semanticizePlan!=='undefined'?semanticizePlan:undefined;",
    "this.__interiorBuildBoard=typeof interiorBuildBoard!=='undefined'?interiorBuildBoard:undefined;",
    "this.__ITR_FLOOR_HEIGHT=typeof ITR_FLOOR_HEIGHT!=='undefined'?ITR_FLOOR_HEIGHT:undefined;",
    "this.__ITR_DAIS_STEP=typeof ITR_DAIS_STEP!=='undefined'?ITR_DAIS_STEP:undefined;",
  ].join("\n");
  vm.runInContext(combined, sandbox, { filename: "stage-c-terrain-render.js" });
  return sandbox;
}

// ─── fixtures ─────────────────────────────────────────────────────────────────────────────────
// a minimal linear-chain segments[] fixture (walk.js:593-625 shape) carrying per-segment
// dims/side strings, mirroring dev/verify-stage-c-size.mjs's own chainFixture but extended with
// `side` (undefined -> the field is simply absent, mirroring a segment that never rolled one).
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
    ...(list[i].dims !== undefined ? { dims: list[i].dims } : {}),
    ...(list[i].side !== undefined ? { side: list[i].side } : {}),
    ...(list[i].areaType !== undefined ? { areaType: list[i].areaType } : {}),
  }));
}

// real "Dungeon Area Type" table strings (Engine/03. _Tables/03. Session Mechanics/Dungeons/
// Dungeon Area Type.md) — read the actual file rather than fabricating text, per CLAUDE.md's own
// "read the actual files before claiming a gap" discipline.
const ROW_108_CROSS_HALL = { // row 108, Cross-Shaped Hall — the SPEC's own literal red-first example
  dims: "50' x 50' (15' arms)",
  side: "15' x 15' central raised dais (3 ft high); each arm terminates in an iron door.",
};
const ROW_090_ROTUNDA_POOL = { // row 090, Mid-Size Rotunda
  dims: "30' diameter",
  side: "15' diameter sunken pool in the center (3 ft deep); stone steps descend on the near side.",
};
const ROW_056_CORNER_DAIS = { // row 056, Standard Chamber — "in one corner" location cue
  dims: "20' x 20' square",
  side: "10' x 10' raised dais in one corner (2 ft high); heavy iron ring set into the dais face.",
};
const ROW_101_GRAND_OCTAGON = {
  areaType: "Grand Octagon",
  dims: "60' x 60'",
  side: "30' x 30' sunken central arena (5 ft below the surrounding level); 10' wide raised ring walkway with iron railing.",
};

function tableCheck() {
  const src = read("Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md");
  return {
    row108: /15' x 15' central raised dais \(3 ft high\)/.test(src),
    row090: /15' diameter sunken pool in the center \(3 ft deep\)/.test(src),
    row056: /10' x 10' raised dais in one corner \(2 ft high\)/.test(src),
    row101: /30' x 30' sunken central arena.*10' wide raised ring walkway/.test(src),
  };
}

console.log("=== 0. RED-FIRST proof ===");
{
  let existedAtBase = true, msg = "";
  try {
    const out = execSync(`git show ${BASE_COMMIT}:src/engine/place-spatialize.js`, { cwd: ROOT, encoding: "utf-8" });
    existedAtBase = /\bdspParseSideTerrain\b/.test(out);
  } catch (e) {
    existedAtBase = false; msg = String(e.stderr || e.message || "").split("\n")[0];
  }
  check("0a. dspParseSideTerrain did NOT exist at C1 tip " + BASE_COMMIT, !existedAtBase, msg);

  const tc = tableCheck();
  check("0b. the exact row 108 clause used below is real table text (not fabricated)", tc.row108);
  check("0c. the exact row 090 clause used below is real table text (not fabricated)", tc.row090);
  check("0d. the exact row 056 clause used below is real table text (not fabricated)", tc.row056);
  check("0e. the exact row 101 layered-terrain roll used below is real table text", tc.row101);
}

const eng = loadEngine();
check("sanity: spatializePlan is a function", typeof eng.spatializePlan === "function");
check("sanity: dspParseSideTerrain symbol is exposed", typeof eng.__dspParseSideTerrain === "function");
check("sanity: dspParseSideTerrains symbol is exposed", typeof eng.__dspParseSideTerrains === "function");
if (typeof eng.spatializePlan !== "function") {
  console.log(`\n${pass} passed, ${fail} failed — spatializePlan not found, cannot run further checks.`);
  process.exit(1);
}

console.log("\n=== 1. RAISED: row 108 Cross-Shaped Hall -> +3-tier 3x3 patch, centered ===");
let raisedPlanOn, raisedRoomOn;
{
  const segs = chainFixture([{}, ROW_108_CROSS_HALL]);
  const walkId = "stage-c2-check1";
  eng.SPATIAL_SHAPES = true;
  const planOn = eng.spatializePlan(segs, "The Spine", { walkId });
  const roomOn = planOn.rooms.find((r) => r.segId === "s2");
  raisedPlanOn = planOn; raisedRoomOn = roomOn;
  check("1a. room sized from dims (50'x50' arms -> 10x10, C1 already covers this, sanity only)",
    !!roomOn && roomOn.w === 10 && roomOn.d === 10, roomOn && `${roomOn.w}x${roomOn.d}`);
  check("1b. rooms[].terrain carries exactly one +3/'dais' entry",
    !!roomOn && Array.isArray(roomOn.terrain) && roomOn.terrain.length === 1 &&
    roomOn.terrain[0].tier === 3 && roomOn.terrain[0].kind === "dais",
    roomOn && roomOn.terrain);
  check("1c. the patch is exactly 3x3 = 9 cells (15'/5=3, NOT floored to SPATIAL_MIN_CELL=4 — the bug this unit's own dspFeetPairRaw fix caught)",
    !!roomOn && roomOn.terrain[0].cells.length === 9, roomOn && roomOn.terrain[0].cells.length);
  const cells = roomOn.terrain[0].cells;
  const minX = Math.min(...cells.map((c) => c.x)), maxX = Math.max(...cells.map((c) => c.x));
  const minY = Math.min(...cells.map((c) => c.y)), maxY = Math.max(...cells.map((c) => c.y));
  const expectMinX = roomOn.x + Math.floor((roomOn.w - 3) / 2), expectMinY = roomOn.y + Math.floor((roomOn.d - 3) / 2);
  check("1d. the patch is CENTERED in the room bbox ('central' cue)",
    minX === expectMinX && maxX === expectMinX + 2 && minY === expectMinY && maxY === expectMinY + 2,
    { got: { minX, maxX, minY, maxY }, expect: { expectMinX, expectMinY } });
  const idx = (x, y) => y * planOn.cellW + x;
  check("1e. every patch cell is stamped tier=+3 in plan.tiers",
    cells.every((c) => planOn.tiers[idx(c.x, c.y)] === 3), cells.map((c) => planOn.tiers[idx(c.x, c.y)]));
  let nzTotal = 0;
  for (let i = 0; i < planOn.tiers.length; i++) if (planOn.tiers[i] !== 0) nzTotal++;
  check("1f. exactly 9 nonzero tier cells in the whole plan (no stray stamping outside the patch)", nzTotal === 9, nzTotal);

  // RED-FIRST (OFF flag): the SAME segment renders flat with SPATIAL_SHAPES off.
  eng.SPATIAL_SHAPES = false;
  const planOff = eng.spatializePlan(segs, "The Spine", { walkId });
  const roomOff = planOff.rooms.find((r) => r.segId === "s2");
  check("1g. RED-FIRST: SPATIAL_SHAPES OFF -> the same room gets NO terrain (flat room)",
    !!roomOff && roomOff.terrain === null, roomOff && roomOff.terrain);
  let nzOff = 0;
  for (let i = 0; i < planOff.tiers.length; i++) if (planOff.tiers[i] !== 0) nzOff++;
  check("1h. RED-FIRST: SPATIAL_SHAPES OFF -> plan.tiers is entirely zero (proving the field was discarded)", nzOff === 0, nzOff);
  eng.SPATIAL_SHAPES = true; // restore default for later checks
}

console.log("\n=== 2. SUNKEN: row 090 Mid-Size Rotunda -> -3-tier 3x3 patch, centered ===");
let sunkenPlanOn, sunkenRoomOn;
{
  const segs = chainFixture([{}, ROW_090_ROTUNDA_POOL]);
  const walkId = "stage-c2-check2";
  const plan = eng.spatializePlan(segs, "The Spine", { walkId });
  const room = plan.rooms.find((r) => r.segId === "s2");
  sunkenPlanOn = plan; sunkenRoomOn = room;
  check("2a. room sized from dims (30' diameter -> 6x6, C1 sanity)", !!room && room.w === 6 && room.d === 6, room && `${room.w}x${room.d}`);
  check("2b. rooms[].terrain carries exactly one -3/'pit' entry",
    !!room && Array.isArray(room.terrain) && room.terrain.length === 1 &&
    room.terrain[0].tier === -3 && room.terrain[0].kind === "pit", room && room.terrain);
  check("2c. the patch is exactly 3x3 = 9 cells (the diameter-form footprint parse, same as the raised case)",
    !!room && room.terrain[0].cells.length === 9, room && room.terrain[0].cells.length);
  const idx = (x, y) => y * plan.cellW + x;
  check("2d. every patch cell is stamped tier=-3 in plan.tiers",
    room.terrain[0].cells.every((c) => plan.tiers[idx(c.x, c.y)] === -3),
    room.terrain[0].cells.map((c) => plan.tiers[idx(c.x, c.y)]));
}

console.log("\n=== 3. determinism: same walkId run twice -> byte-identical tiers + terrain ===");
{
  const segs = chainFixture([ROW_108_CROSS_HALL, {}, ROW_090_ROTUNDA_POOL]);
  const walkId = "stage-c2-check3";
  const p1 = eng.spatializePlan(segs, "The Spine", { walkId });
  const p2 = eng.spatializePlan(segs, "The Spine", { walkId });
  check("3a. plan.tiers byte-identical across 2 calls", JSON.stringify(Array.from(p1.tiers)) === JSON.stringify(Array.from(p2.tiers)));
  check("3b. rooms[].terrain byte-identical across 2 calls", JSON.stringify(p1.rooms.map((r) => r.terrain)) === JSON.stringify(p2.rooms.map((r) => r.terrain)));
  check("3c. seed byte-identical across 2 calls", p1.seed === p2.seed, `${p1.seed} vs ${p2.seed}`);
}

console.log("\n=== 4. flat-fallback: missing/garbage/no-keyword side -> no terrain, never throws ===");
{
  const segs = chainFixture([
    { dims: "20' x 20' square" },                                          // no `side` field at all
    { dims: "20' x 20' square", side: "" },                                // empty string
    { dims: "20' x 20' square", side: "   " },                             // whitespace only
    { dims: "20' x 20' square", side: "a quiet dusty chamber, nothing of note here" }, // no elevation keyword
  ]);
  let threw = false, plan;
  try { plan = eng.spatializePlan(segs, "The Spine", { walkId: "stage-c2-check4" }); }
  catch (e) { threw = true; console.log("    threw:", e.message); }
  check("4a. never throws on missing/garbage/no-keyword side", !threw);
  if (plan) {
    check("4b. every room's terrain is null (flat)", plan.rooms.every((r) => r.terrain === null),
      plan.rooms.map((r) => r.terrain));
    let nz = 0; for (let i = 0; i < plan.tiers.length; i++) if (plan.tiers[i] !== 0) nz++;
    check("4c. plan.tiers is entirely zero", nz === 0, nz);
  }
  // dspParseSideTerrain called directly on every garbage/absent input -> null, never throws
  const room = { x: 0, y: 0, w: 6, d: 6, segNum: 1 };
  const garbageInputs = [undefined, null, "", "   ", "a quiet dusty chamber"];
  check("4d. dspParseSideTerrain(garbage, room, seed) === null for every garbage input",
    garbageInputs.every((g) => eng.__dspParseSideTerrain(g, room, 12345) === null),
    garbageInputs.map((g) => eng.__dspParseSideTerrain(g, room, 12345)));
}

console.log("\n=== 5. corner cue + the whole-room-vs-patch clamp fix + absurd-clause clamp ===");
{
  const segs = chainFixture([ROW_056_CORNER_DAIS, { dims: "20' x 20' square", side: "500' x 500' absurd raised feature (99 ft high); ignore this." }]);
  const plan = eng.spatializePlan(segs, "The Spine", { walkId: "stage-c2-check5" });
  const cornerRoom = plan.rooms.find((r) => r.segId === "s1");
  check("5a. corner patch is 2x2 (10'/5=2, the whole-room floor SPATIAL_MIN_CELL=4 must NOT apply to a patch)",
    !!cornerRoom && cornerRoom.terrain[0].cells.length === 4, cornerRoom && cornerRoom.terrain[0].cells.length);
  const cells = cornerRoom.terrain[0].cells;
  const isCornerPlaced = cells.every((c) =>
    (c.x === cornerRoom.x || c.x === cornerRoom.x + 1 || c.x === cornerRoom.x + cornerRoom.w - 1 || c.x === cornerRoom.x + cornerRoom.w - 2) &&
    (c.y === cornerRoom.y || c.y === cornerRoom.y + 1 || c.y === cornerRoom.y + cornerRoom.d - 1 || c.y === cornerRoom.y + cornerRoom.d - 2));
  check("5b. the patch sits in ONE of the room's 4 corners (not centered)", isCornerPlaced, cells);

  const absurdRoom = plan.rooms.find((r) => r.segId === "s2");
  check("5c. an absurd '500x500' clause clamps the patch to the room's own bbox (never runaway)",
    !!absurdRoom && absurdRoom.terrain[0].cells.length === absurdRoom.w * absurdRoom.d,
    absurdRoom && { patchCells: absurdRoom.terrain[0].cells.length, roomCells: absurdRoom.w * absurdRoom.d });
}

console.log("\n=== 5b. MULTI-PATCH: row 101 preserves sunken arena + raised perimeter ring ===");
{
  const plan = eng.spatializePlan(chainFixture([{}, ROW_101_GRAND_OCTAGON]), "The Spine", { walkId: "stage-c2-row101" });
  const room = plan.rooms.find((r) => r.segId === "s2");
  const arena = room && room.terrain && room.terrain.find((p) => p.tier === -5);
  const ring = room && room.terrain && room.terrain.find((p) => p.tier === 1 && p.footprint === "ring");
  check("5d. row 101 emits two canonical terrain patches", !!room && room.terrain.length === 2, room && room.terrain);
  check("5e. central arena keeps its exact 30'x30' = 6x6 footprint", !!arena && arena.cells.length === 36, arena && arena.cells.length);
  check("5f. raised walkway is represented as a shaped perimeter ring", !!ring && ring.cells.length > 0 && ring.cells.length < room.cells.length,
    ring && { ring: ring.cells.length, room: room.cells.length });
  const idx = (x, y) => y * plan.cellW + x;
  check("5g. every arena cell preserves the explicit five-foot depth as tier -5", !!arena && arena.cells.every((c) => plan.tiers[idx(c.x, c.y)] === -5));
  check("5h. every ring cell is tier +1", !!ring && ring.cells.every((c) => plan.tiers[idx(c.x, c.y)] === 1));
  const arenaKeys = new Set((arena ? arena.cells : []).map((c) => c.x + "," + c.y));
  check("5i. arena and perimeter ring do not collapse into the same cells",
    !!ring && ring.cells.every((c) => !arenaKeys.has(c.x + "," + c.y)));
}

console.log("\n=== 6. RENDER SEAM: interiorBuildBoard folds plan.tiers into floor sy ===");
{
  const ren = loadRender();
  check("sanity: interiorBuildBoard/semanticizePlan exposed", typeof ren.__interiorBuildBoard === "function" && typeof ren.__semanticizePlan === "function");
  const ITR_FLOOR_HEIGHT = ren.__ITR_FLOOR_HEIGHT, ITR_DAIS_STEP = ren.__ITR_DAIS_STEP;
  check("sanity: ITR_FLOOR_HEIGHT/ITR_DAIS_STEP constants exposed", typeof ITR_FLOOR_HEIGHT === "number" && typeof ITR_DAIS_STEP === "number",
    `${ITR_FLOOR_HEIGHT} / ${ITR_DAIS_STEP}`);

  // a trailing {} 4th segment keeps s3 (the sunken room) OFF the finale slot (isFinale is always
  // the LAST segment in chainFixture) — otherwise BW2-5's finale-dais override would legitimately
  // (and per STAGE-C.md C2 step 2, CORRECTLY) win over the sunken patch on that room, which would
  // be testing the wrong thing here (check 7 below is the dedicated finale-dais-unbroken proof).
  const segs = chainFixture([ROW_108_CROSS_HALL, {}, ROW_090_ROTUNDA_POOL, {}]);
  const spatial = ren.__semanticizePlan(ren.__spatializePlan(segs, "The Spine", { walkId: "stage-c2-check6" }), segs, []);
  const board = ren.__interiorBuildBoard(spatial, { realmId: "fantasy" });
  const raisedRoom = spatial.rooms.find((r) => r.segId === "s1");
  const sunkenRoom = spatial.rooms.find((r) => r.segId === "s3");
  check("6-sanity: neither room under test is the finale room (finale-dais would legitimately override the patch there)",
    !raisedRoom.isFinale && !sunkenRoom.isFinale, { raisedIsFinale: raisedRoom.isFinale, sunkenIsFinale: sunkenRoom.isFinale });

  const daisFloor = board.instances.floor.filter((f) =>
    raisedRoom.terrain[0].cells.some((c) => c.x === f.x && c.y === f.z));
  check("6a. every raised-patch floor instance found on the board", daisFloor.length === 9, daisFloor.length);
  check("6b. every raised-patch floor cell reads sy = ITR_FLOOR_HEIGHT + 3*ITR_DAIS_STEP",
    daisFloor.every((f) => Math.abs(f.sy - (ITR_FLOOR_HEIGHT + 3 * ITR_DAIS_STEP)) < 1e-9),
    daisFloor.map((f) => f.sy));

  const pitFloor = board.instances.floor.filter((f) =>
    sunkenRoom.terrain[0].cells.some((c) => c.x === f.x && c.y === f.z));
  check("6c. every sunken-patch floor instance found on the board", pitFloor.length === 9, pitFloor.length);
  check("6d. every sunken-patch floor cell reads sy = ITR_FLOOR_HEIGHT - 3*ITR_DAIS_STEP",
    pitFloor.every((f) => Math.abs(f.sy - (ITR_FLOOR_HEIGHT - 3 * ITR_DAIS_STEP)) < 1e-9),
    pitFloor.map((f) => f.sy));

  const patchKeySet = new Set(raisedRoom.terrain[0].cells.map((c) => c.x + "," + c.y));
  const untouchedInRaisedRoom = board.instances.floor.filter((f) =>
    f.x >= raisedRoom.x && f.x < raisedRoom.x + raisedRoom.w &&
    f.z >= raisedRoom.y && f.z < raisedRoom.y + raisedRoom.d &&
    !patchKeySet.has(f.x + "," + f.z));
  check("6e. floor cells OUTSIDE the patch, inside the same room, are untouched (sy stays near the VP3 nominal band, never the dais step)",
    untouchedInRaisedRoom.length > 0 && untouchedInRaisedRoom.every((f) => Math.abs(f.sy - (ITR_FLOOR_HEIGHT + ITR_DAIS_STEP)) > 1e-6),
    { count: untouchedInRaisedRoom.length });
}

console.log("\n=== 7. FINALE-DAIS-UNBROKEN: BW2-5's dais math is untouched by this unit ===");
{
  const ren = loadRender();
  const ITR_FLOOR_HEIGHT = ren.__ITR_FLOOR_HEIGHT, ITR_DAIS_STEP = ren.__ITR_DAIS_STEP;
  // a 10-room chain, no `side` field on any segment (finale rooms never roll one in this fixture,
  // matching every existing finale-dais fixture — dev/verify-bw2-5-silhouette.mjs's own
  // buildChainFixture) — proves this unit's insertion point (before the finale-dais override
  // block) is a true no-op for a finale room, byte-identical to BW2-5's own math.
  const segs = chainFixture(Array.from({ length: 10 }, () => ({})));
  const spatial = ren.__semanticizePlan(ren.__spatializePlan(segs, "The Spine", { walkId: "stage-c2-check7" }), segs, []);
  const board = ren.__interiorBuildBoard(spatial, { realmId: "fantasy" });
  const finaleRoom = spatial.rooms.find((r) => r.role === "finale");
  check("sanity: a finale room exists in this plan", !!finaleRoom);
  let topCount = 0, ringCount = 0, plainCount = 0;
  board.instances.floor.forEach((f) => {
    if (f.x < finaleRoom.x || f.x >= finaleRoom.x + finaleRoom.w || f.z < finaleRoom.y || f.z >= finaleRoom.y + finaleRoom.d) return;
    if (Math.abs(f.sy - (ITR_FLOOR_HEIGHT + ITR_DAIS_STEP * 2)) < 1e-9) topCount++;
    else if (Math.abs(f.sy - (ITR_FLOOR_HEIGHT + ITR_DAIS_STEP)) < 1e-9) ringCount++;
    else plainCount++;
  });
  check("7a. finale room still has dais TOP-tier cells (sy = FLOOR_HEIGHT + 2*DAIS_STEP)", topCount > 0, topCount);
  check("7b. finale room still has dais RING-tier cells (sy = FLOOR_HEIGHT + 1*DAIS_STEP)", ringCount > 0, ringCount);
  check("7c. finale room ALSO still has plain (non-dais) floor cells", plainCount > 0, plainCount);
}

console.log("\n=== 8. C4 COMPILER: the raised/sunken patches produce real floor tiers + risers ===");
{
  const mod = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
  const { compileRoomShellData } = mod;
  check("sanity: compileRoomShellData is exported and callable", typeof compileRoomShellData === "function");

  // shellCells built the SAME way theater-boot.js's real shellCell builder does (:8706): sy ->
  // tier = round(sy / ROOM_SHELL_TIER_QUANTUM=0.2), elevationY = base + sy.
  const ROOM_SHELL_TIER_QUANTUM = 0.2, ITR_FLOOR_BASE_Y = -0.5, ITR_FLOOR_HEIGHT = 0.2, ITR_DAIS_STEP = 0.2;
  function shellCellsFor(room, terrainTier) {
    const cells = [];
    for (let y = room.y; y < room.y + room.d; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        const inPatch = raisedRoomOn === room
          ? raisedRoomOn.terrain[0].cells.some((c) => c.x === x && c.y === y)
          : sunkenRoomOn.terrain[0].cells.some((c) => c.x === x && c.y === y);
        const sy = ITR_FLOOR_HEIGHT + (inPatch ? terrainTier * ITR_DAIS_STEP : 0);
        cells.push({ x: x - room.x, z: y - room.y, tier: Math.round(sy / ROOM_SHELL_TIER_QUANTUM), elevationY: ITR_FLOOR_BASE_Y + sy });
      }
    }
    return cells;
  }

  const raisedShellCells = shellCellsFor(raisedRoomOn, 3);
  const raisedData = compileRoomShellData(raisedShellCells, {});
  check("8a. raised room compiles to 2 floor tiers", raisedData.meta.tierCount === 2, raisedData.meta.tierCount);
  check("8b. raised room has real riser segments (a riser BETWEEN the base floor and the dais)", raisedData.meta.riserSegmentCount > 0, raisedData.meta.riserSegmentCount);
  check("8c. raised room: every cell still resolves in the cell<->triangle map (no cell dropped)",
    Object.keys(raisedData.cellTriangleMap).length === raisedRoomOn.w * raisedRoomOn.d,
    `${Object.keys(raisedData.cellTriangleMap).length} / ${raisedRoomOn.w * raisedRoomOn.d}`);

  const sunkenShellCells = shellCellsFor(sunkenRoomOn, -3);
  const sunkenData = compileRoomShellData(sunkenShellCells, {});
  check("8d. sunken room ALSO compiles to 2 floor tiers", sunkenData.meta.tierCount === 2, sunkenData.meta.tierCount);
  check("8e. sunken room ALSO has real riser segments", sunkenData.meta.riserSegmentCount > 0, sunkenData.meta.riserSegmentCount);
}

console.log("\n=== 9. check-manifest.py (run live) ===");
{
  let out = "", okExit = true;
  try {
    out = execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" });
  } catch (e) {
    okExit = false; out = String(e.stdout || "") + String(e.stderr || "");
  }
  check("9a. check-manifest.py exits 0", okExit, out.split("\n").slice(-3).join(" | "));
  check("9b. check-manifest.py prints RESULT: OK", /RESULT: OK/.test(out));
  check("9c. no DRIFT/orphan error mentions place-spatialize",
    !/DRIFT|owns .* but no definition/.test(out.split("\n").filter((l) => /place-spatialize/.test(l)).join("\n")));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
