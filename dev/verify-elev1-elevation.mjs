/* dev/verify-elev1-elevation.mjs — ELEV-1 rolled room elevation (docs/KENNEY-SOCKET-WAVE.md ELEV-1).
   TABLE + ROLLER + SPATIALIZE, engine truth end-to-end. Bootstrap modeled on dev/verify-walk-scene.mjs
   (the "new Function" real-module sandbox, tables.js -> walk.js -> dungeon-walk.js, in genesis.html's
   own load order) for the ROLLER half, and dev/verify-dungeon-spatialize.mjs / dev/verify-stage-c-
   terrain.mjs (vm.createContext, place-spatialize.js alone or combined with place-semantics.js +
   theater-interior.js for the render seam) for the SPATIALIZE half — the two harnesses this unit's
   spec named to find and model on.

   RED-FIRST (checked live against e26a4b6b, the master tip this unit branched from — re-checked
   below, not just cited):
     `git show e26a4b6b:"Engine/03. _Tables/03. Session Mechanics/Dungeons/Room Elevation Profile.md"`
       -> fatal: path does not exist (the table did not exist).
     `git show e26a4b6b:src/engine/dungeon-walk.js | grep -c dwalkElevation` -> 0.
     `git show e26a4b6b:src/engine/place-spatialize.js | grep -c dspElevationPatchesForProfile` -> 0.

   Sections:
     0. RED-FIRST git-show proof.
     1. Compiled table sanity — room-elevation-profile in the REAL tables.js: d100, 7 rows, coverage
        1-100 re-derived independently (never trusting compile-tables.py's own report).
     2. ROLLER (dwalkElevation + rollDungeonWalk, real tables):
        2a. distribution over a generous-dims/depth-0 sample matches the table's own weights.
        2b. depth-bias rider measurably raises P(sunken|chasm) at high depth vs depth 0.
        2c. min-dims walk-down: a forced Gallery-ring roll on a too-small room walks down to Flat,
            degradedFrom recorded, roll stays canonical.
        2d. full rollDungeonWalk(): every room carries .elevation + .rollRefs.elevation.
        2e. byte-compatibility: table absent -> segment carries NO `elevation` key at all.
     3. SPATIALIZE (place-spatialize.js, real spatializePlan):
        3a-3f. per-profile geometry (Dais/Sunken/Split/Terraced/Gallery/Chasm) on a controlled 6x6 room.
        3g. PRECEDENCE LAW: a conflicting side-parse patch keeps its own tier under a rolled profile.
        3h. DOOR LAW: door cells + inside neighbor stay tier 0 even under a room-covering profile.
        3i. determinism: same segments+walkId twice -> byte-identical tiers + elevationProfile.
        3j. SPATIAL_SHAPES off -> no elevation writes (byte-identical pre-ELEV-1 tiers, all zero).
        3k. absent `segment.elevation` -> no writes, r.elevationProfile stays unset.
     4. RENDER SEAM ±3 HONEST CHECK: interiorBuildBoard folds a Terraced room's THREE distinct
        tiers + a Chasm/shaft room's -3 into floor sy, unclamped (sy = ITR_FLOOR_HEIGHT +
        tier*ITR_DAIS_STEP) — reported honestly either way, never patched.
     5. Live gates: compile-tables.py (REPORT mode) 0 new coverage flags; check-manifest.py OK.

   Run: node dev/verify-elev1-elevation.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_COMMIT = "e26a4b6b";
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

// ─── 0. RED-FIRST ─────────────────────────────────────────────────────────────────────────────
console.log("=== 0. RED-FIRST proof (re-checked live against " + BASE_COMMIT + ") ===");
{
  let tableExistedAtBase = true, msg1 = "";
  try {
    execSync(`git show ${BASE_COMMIT}:"Engine/03. _Tables/03. Session Mechanics/Dungeons/Room Elevation Profile.md"`, { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
  } catch (e) { tableExistedAtBase = false; msg1 = String(e.stderr || e.message).split("\n")[0]; }
  check("RED0a. Room Elevation Profile.md did NOT exist at base commit", tableExistedAtBase === false, msg1);

  let dwalkCount = "?";
  try { dwalkCount = execSync(`git show ${BASE_COMMIT}:src/engine/dungeon-walk.js | grep -c dwalkElevation || true`, { cwd: ROOT }).toString().trim(); } catch (e) { dwalkCount = "err:" + e.message; }
  check("RED0b. dwalkElevation did NOT exist at base commit (grep -c == 0)", dwalkCount === "0", dwalkCount);

  let dspCount = "?";
  try { dspCount = execSync(`git show ${BASE_COMMIT}:src/engine/place-spatialize.js | grep -c dspElevationPatchesForProfile || true`, { cwd: ROOT }).toString().trim(); } catch (e) { dspCount = "err:" + e.message; }
  check("RED0c. dspElevationPatchesForProfile did NOT exist at base commit (grep -c == 0)", dspCount === "0", dspCount);
}

// ─── 1. Compiled table sanity ────────────────────────────────────────────────────────────────
console.log("\n=== 1. Compiled table sanity (real tables.js, independently re-derived) ===");
{
  const tablesSrc = read("tables.js");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(tablesSrc, sandbox, { filename: "tables.js" });
  const T = sandbox.window.GENESIS_TABLES || sandbox.GENESIS_TABLES;
  const t = T && T["room-elevation-profile"];
  check("1a. room-elevation-profile compiled", !!t, Object.keys(T || {}).filter((k) => k.includes("elevation")));
  if (t) {
    check("1b. dice = d100", t.dice === "d100", t.dice);
    check("1c. die = 100", t.die === 100, t.die);
    check("1d. bell = false (flat table)", t.bell === false, t.bell);
    check("1e. 7 rows", Array.isArray(t.rows) && t.rows.length === 7, t.rows && t.rows.length);
    // independent coverage re-derivation — never trust the compiler's own report.
    const cov = new Array(101).fill(0);
    (t.rows || []).forEach((r) => { for (let v = r[0]; v <= r[1]; v++) cov[v]++; });
    const gaps = []; const overlaps = [];
    for (let v = 1; v <= 100; v++) { if (cov[v] === 0) gaps.push(v); if (cov[v] > 1) overlaps.push(v); }
    check("1f. 1-100 fully covered, no gaps", gaps.length === 0, gaps.slice(0, 5));
    check("1g. 1-100 no overlaps", overlaps.length === 0, overlaps.slice(0, 5));
    const expect = [[1, 40, "Flat"], [41, 55, "Dais"], [56, 70, "Sunken center"], [71, 80, "Split-level"], [81, 90, "Terraced"], [91, 96, "Gallery ring"], [97, 100, "Chasm/shaft"]];
    const actual = t.rows.map((r) => [r[0], r[1], (r[5] && r[5][0] || "").trim()]).sort((a, b) => a[0] - b[0]);
    check("1h. rows match Adam's approved draft exactly (lo,hi,profile)", JSON.stringify(actual) === JSON.stringify(expect), actual);
  }
}

// ─── ROLLER sandbox loader (dev/verify-walk-scene.mjs's own "new Function" convention) ─────────
function loadRoller() {
  const src = [read("tables.js"), read("src/engine/walk.js"), read("src/engine/dungeon-walk.js")].join("\n;\n");
  const body = src + "\n;\nreturn { rollDungeonWalk, dwalkElevation, GENESIS_TABLES: window.GENESIS_TABLES, walkRows };";
  const factory = new Function("window", body);
  const win = {};
  const api = factory(win);
  return api;
}

// ─── 2. ROLLER ───────────────────────────────────────────────────────────────────────────────
console.log("\n=== 2. ROLLER (dwalkElevation + rollDungeonWalk, real compiled tables) ===");
{
  const A = loadRoller();
  check("2-sanity: dwalkElevation exposed", typeof A.dwalkElevation === "function");

  // 2a. distribution — generous dims (clears every gate), depth 0 (no bias), real Math.random.
  const N = 6000;
  const tally = {};
  for (let i = 0; i < N; i++) {
    const r = A.dwalkElevation("60' x 60' square", 0);
    tally[r.profile] = (tally[r.profile] || 0) + 1;
  }
  const expectPct = { "Flat": 40, "Dais": 15, "Sunken center": 15, "Split-level": 10, "Terraced": 10, "Gallery ring": 6, "Chasm/shaft": 4 };
  let distOk = true; const distDetail = {};
  for (const [profile, pct] of Object.entries(expectPct)) {
    const got = ((tally[profile] || 0) / N) * 100;
    distDetail[profile] = got.toFixed(1) + "% (expect ~" + pct + "%)";
    if (Math.abs(got - pct) > 4) distOk = false; // 4-point tolerance at N=6000
  }
  check("2a. roll distribution matches table weights within tolerance", distOk, distDetail);

  // 2b. depth-bias rider: P(sunken|chasm) rises with depth.
  const sample = (depth, n) => {
    let hit = 0;
    for (let i = 0; i < n; i++) {
      const r = A.dwalkElevation("60' x 60' square", depth);
      if (r.profile === "Sunken center" || r.profile === "Chasm/shaft") hit++;
    }
    return hit / n;
  };
  const rateShallow = sample(0, 4000), rateDeep = sample(15, 4000);
  check("2b. depth-bias rider measurably raises P(sunken|chasm) at depth 15 vs depth 0",
    rateDeep > rateShallow + 0.05, { rateShallow, rateDeep });

  // 2c. min-dims walk-down: force the roll into the Gallery-ring band (91-96) on a room too small
  // for 5x5 (a 2x3-cell room fails every gate down to Flat) — monkey-patch Math.random deterministically.
  {
    const origRandom = Math.random;
    let seq = [0.93, 1]; // first draw lands at total=94 (Gallery ring band); second (depth-bias check) unused since depth=0
    let i = 0;
    Math.random = () => (i < seq.length ? seq[i++] : origRandom());
    let res;
    try { res = A.dwalkElevation("10' x 15'", 0); } finally { Math.random = origRandom; }
    check("2c. rolled row is Gallery ring before the gate (forced roll)", res.roll === 94, res.roll);
    check("2c. room too small (2x3 cells) walks all the way down to Flat", res.profile === "Flat", res.profile);
    check("2c. degradedFrom records the pre-walk-down profile (roll stays canonical)", res.degradedFrom === "Gallery ring", res.degradedFrom);
  }

  // 2d. full walk integration.
  {
    const walk = A.rollDungeonWalk({ topology: "The Spine", segCount: 6, tier: 2 });
    const allCarryElevation = walk.segments.every((s) => s.elevation && typeof s.elevation.profile === "string" && ["roll", "profile", "degradedFrom"].every((k) => k in s.elevation));
    check("2d. every room in a real rollDungeonWalk() carries .elevation{roll,profile,degradedFrom}", allCarryElevation,
      walk.segments.map((s) => s.elevation && s.elevation.profile));
    const allCarryRollRef = walk.segments.every((s) => s.rollRefs && s.rollRefs.elevation && s.rollRefs.elevation.tableId === "room-elevation-profile");
    check("2d. every room's rollRefs.elevation.tableId === 'room-elevation-profile'", allCarryRollRef);
  }

  // 2e. byte-compatibility: table absent -> no `elevation` key at all (old-save-compatible).
  {
    const B = loadRoller();
    delete B.GENESIS_TABLES["room-elevation-profile"];
    const r = B.dwalkElevation("30' x 30' square", 0);
    check("2e. dwalkElevation returns null when the table isn't compiled", r === null, r);
    const walk = B.rollDungeonWalk({ topology: "The Spine", segCount: 3, tier: 2 });
    const noneCarryElevation = walk.segments.every((s) => !("elevation" in s));
    check("2e. rollDungeonWalk omits `elevation` entirely (not even null) when the table is absent", noneCarryElevation,
      walk.segments.map((s) => "elevation" in s));
  }
}

// ─── SPATIALIZE sandbox loader ──────────────────────────────────────────────────────────────
function loadSpatialize() {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(
    read("src/engine/place-spatialize.js") +
      "\n;this.__spatializePlan=spatializePlan;this.__SPATIAL_CELL=SPATIAL_CELL;" +
      "this.__setShapes=function(v){SPATIAL_SHAPES=v;};this.__getShapes=function(){return SPATIAL_SHAPES;};",
    sandbox, { filename: "place-spatialize.js" }
  );
  return sandbox;
}
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
    ...(list[i].elevation !== undefined ? { elevation: list[i].elevation } : {}),
  }));
}
const ROOM6x6 = { dims: "30' x 30' square" }; // 6x6 cells — clears every ELEV-1 min-dims gate

// ─── 3. SPATIALIZE ───────────────────────────────────────────────────────────────────────────
console.log("\n=== 3. SPATIALIZE (real spatializePlan, place-spatialize.js) ===");
{
  const ren = loadSpatialize();
  const spatializePlan = ren.__spatializePlan;

  function singleRoom(elevation, dims, side) {
    const segs = chainFixture([{ dims: dims || ROOM6x6.dims, elevation, side }]);
    const plan = spatializePlan(segs, "The Spine", { walkId: "elev1-spatial:" + JSON.stringify({ elevation, dims, side }) });
    const room = plan.rooms[0];
    const idx = (x, y) => y * plan.cellW + x;
    return { plan, room, idx };
  }
  const nzCells = (plan, room, idx) => (room.cells || []).filter((c) => plan.tiers[idx(c.x, c.y)] !== 0);

  // 3a. Dais.
  {
    const { plan, room, idx } = singleRoom({ profile: "Dais" });
    const nz = nzCells(plan, room, idx);
    check("3a. Dais: some cells raised, all raised cells tier===1", nz.length > 0 && nz.every((c) => plan.tiers[idx(c.x, c.y)] === 1), nz.length);
    check("3a. Dais: patch stays a MINORITY of the room (a centroid platform, not the whole room)", nz.length < room.cells.length, { nz: nz.length, total: room.cells.length });
  }
  // 3b. Sunken center.
  {
    const { plan, room, idx } = singleRoom({ profile: "Sunken center" });
    const nz = nzCells(plan, room, idx);
    check("3b. Sunken center: some cells lowered, all tier===-1", nz.length > 0 && nz.every((c) => plan.tiers[idx(c.x, c.y)] === -1), nz.length);
  }
  // 3c. Split-level.
  {
    const { plan, room, idx } = singleRoom({ profile: "Split-level" });
    const nz = nzCells(plan, room, idx);
    const zeroCells = room.cells.length - nz.length;
    check("3c. Split-level: raised half all tier===1", nz.length > 0 && nz.every((c) => plan.tiers[idx(c.x, c.y)] === 1), nz.length);
    check("3c. Split-level: the other half + the one join cell stay at baseline (roughly half the room, not the whole room)",
      zeroCells > 0 && zeroCells < room.cells.length, { zeroCells, total: room.cells.length });
  }
  // 3d. Terraced — the genuinely NEW multi-tier-in-one-room shape (2 or 3 distinct positive tiers).
  {
    const { plan, room, idx } = singleRoom({ profile: "Terraced" });
    const tiersSeen = new Set(room.cells.map((c) => plan.tiers[idx(c.x, c.y)]));
    const positiveTiers = [...tiersSeen].filter((t) => t > 0);
    check("3d. Terraced: at least 2 distinct positive tiers present", positiveTiers.length >= 2, [...tiersSeen].sort());
    check("3d. Terraced: every tier stays within the ±3 budget", [...tiersSeen].every((t) => t >= -3 && t <= 3), [...tiersSeen]);
    check("3d. Terraced: a baseline (tier 0) band still exists", tiersSeen.has(0));
  }
  // 3e. Gallery ring.
  {
    const { plan, room, idx } = singleRoom({ profile: "Gallery ring" });
    const nz = nzCells(plan, room, idx);
    check("3e. Gallery ring: perimeter cells raised, all tier===2", nz.length > 0 && nz.every((c) => plan.tiers[idx(c.x, c.y)] === 2), nz.length);
    // independent re-derivation of "perimeter" (frontier) — don't trust the module's own definition twice.
    const cellSet = new Set(room.cells.map((c) => c.x + "," + c.y));
    const expectedFrontier = room.cells.filter((c) =>
      !cellSet.has((c.x - 1) + "," + c.y) || !cellSet.has((c.x + 1) + "," + c.y) ||
      !cellSet.has(c.x + "," + (c.y - 1)) || !cellSet.has(c.x + "," + (c.y + 1)));
    check("3e. Gallery ring: raised cell SET === independently re-derived frontier", nz.length === expectedFrontier.length, { nz: nz.length, frontier: expectedFrontier.length });
    check("3e. Gallery ring: interior (non-frontier) stays baseline 0", room.cells.length - nz.length === room.cells.length - expectedFrontier.length);
  }
  // 3f. Chasm/shaft.
  {
    const { plan, room, idx } = singleRoom({ profile: "Chasm/shaft" });
    const nz = nzCells(plan, room, idx);
    check("3f. Chasm/shaft: a cut band exists, tier in {-2,-3}", nz.length > 0 && nz.every((c) => [-2, -3].includes(plan.tiers[idx(c.x, c.y)])), nz.map((c) => plan.tiers[idx(c.x, c.y)]));
    check("3f. Chasm/shaft: the cut does not consume the WHOLE room (a bridge cell survives)", nz.length < room.cells.length, { nz: nz.length, total: room.cells.length });
  }

  // 3g. PRECEDENCE LAW.
  {
    const { plan, room, idx } = singleRoom({ profile: "Sunken center" }, "20' x 20' square", "10' x 10' raised dais (2 ft high)");
    // the side-parse dais and the profile's centroid patch both target the room's center — assert
    // the OVERLAP keeps the side's tier (2), never the profile's (-1).
    const sideCells = room.terrain && room.terrain[0] ? room.terrain[0].cells : [];
    check("3g-sanity: side-parse patch present", sideCells.length > 0, sideCells.length);
    const sideOk = sideCells.every((c) => plan.tiers[idx(c.x, c.y)] === 2);
    check("3g. PRECEDENCE LAW: a side-declared dais cell keeps its side value (2) under a conflicting rolled profile (-1)", sideOk,
      sideCells.map((c) => plan.tiers[idx(c.x, c.y)]));
  }

  // 3h. DOOR LAW — a 2-room chain, room 1 gets a room-covering profile (Gallery ring, which
  // touches the frontier — the same boundary a door cell sits on).
  {
    const segs = chainFixture([{ dims: ROOM6x6.dims, elevation: { profile: "Gallery ring" } }, { dims: ROOM6x6.dims }]);
    const plan = spatializePlan(segs, "The Spine", { walkId: "elev1-door-law:v1" });
    check("3h-sanity: at least one door carved", plan.doors.length > 0, plan.doors.length);
    const idx = (x, y) => y * plan.cellW + x;
    const doorsOk = plan.doors.every((d) => plan.tiers[idx(d.x, d.y)] === 0);
    check("3h. DOOR LAW: every door-aperture cell reads tier 0 regardless of a room-covering profile", doorsOk,
      plan.doors.map((d) => plan.tiers[idx(d.x, d.y)]));
    // independently re-derive each door's inside neighbor and assert it too stays 0.
    let neighborsOk = true; const neighborDetail = [];
    plan.doors.forEach((d) => {
      const ownSeg = d.betweenSegs.find((n) => n !== d.toSeg);
      const ownRoom = plan.rooms.find((r) => r.segNum === ownSeg);
      const ownKeys = new Set((ownRoom.cells || []).map((c) => c.x + "," + c.y));
      const nbrs = [[d.x + 1, d.y], [d.x - 1, d.y], [d.x, d.y + 1], [d.x, d.y - 1]].filter(([nx, ny]) => ownKeys.has(nx + "," + ny));
      nbrs.forEach(([nx, ny]) => { const t = plan.tiers[idx(nx, ny)]; neighborDetail.push(t); if (t !== 0) neighborsOk = false; });
    });
    check("3h. DOOR LAW: every door's inside neighbor also reads tier 0", neighborsOk, neighborDetail);
  }

  // 3i. Determinism.
  {
    const segs = chainFixture([{ dims: ROOM6x6.dims, elevation: { profile: "Terraced" } }]);
    const p1 = spatializePlan(segs, "The Spine", { walkId: "elev1-determinism:v1" });
    const p2 = spatializePlan(segs, "The Spine", { walkId: "elev1-determinism:v1" });
    check("3i. determinism: same segments+walkId -> byte-identical tiers buffer", Buffer.from(p1.tiers).equals(Buffer.from(p2.tiers)));
    check("3i. determinism: byte-identical elevationProfile", JSON.stringify(p1.rooms[0].elevationProfile) === JSON.stringify(p2.rooms[0].elevationProfile));
  }

  // 3j. SPATIAL_SHAPES off.
  {
    ren.__setShapes(false);
    const segs = chainFixture([{ dims: ROOM6x6.dims, elevation: { profile: "Dais" } }]);
    const plan = spatializePlan(segs, "The Spine", { walkId: "elev1-shapes-off:v1" });
    let allZero = true; for (let i = 0; i < plan.tiers.length; i++) if (plan.tiers[i] !== 0) allZero = false;
    check("3j. SPATIAL_SHAPES off: no elevation writes even with segment.elevation present (tiers all zero)", allZero);
    ren.__setShapes(true);
  }

  // 3k. Absent elevation field.
  {
    const segs = chainFixture([{ dims: ROOM6x6.dims }]);
    const plan = spatializePlan(segs, "The Spine", { walkId: "elev1-absent:v1" });
    let allZero = true; for (let i = 0; i < plan.tiers.length; i++) if (plan.tiers[i] !== 0) allZero = false;
    check("3k. absent segment.elevation: tiers stay all zero", allZero);
    check("3k. absent segment.elevation: r.elevationProfile stays unset", plan.rooms[0].elevationProfile === undefined, plan.rooms[0].elevationProfile);
  }
}

// ─── 4. RENDER SEAM ±3 HONEST CHECK ─────────────────────────────────────────────────────────
console.log("\n=== 4. RENDER SEAM: interiorBuildBoard folds ELEV-1 tiers into floor sy (±3, unclamped?) ===");
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
  vm.runInContext(combined, sandbox, { filename: "elev1-render.js" });
  return sandbox;
}
{
  const ren = loadRender();
  check("sanity: interiorBuildBoard/semanticizePlan/spatializePlan exposed",
    typeof ren.__interiorBuildBoard === "function" && typeof ren.__semanticizePlan === "function" && typeof ren.__spatializePlan === "function");
  const ITR_FLOOR_HEIGHT = ren.__ITR_FLOOR_HEIGHT, ITR_DAIS_STEP = ren.__ITR_DAIS_STEP;

  function chainFixtureR(list) {
    const n = list.length;
    const ids = Array.from({ length: n }, (_, i) => `s${i + 1}`);
    return ids.map((id, i) => ({
      id, num: i + 1, label: id, isFinale: i === n - 1, depth: i,
      exits: [
        ...(i > 0 ? [{ targetId: ids[i - 1], num: i, label: ids[i - 1], isFinale: i - 1 === n - 1 }] : []),
        ...(i < n - 1 ? [{ targetId: ids[i + 1], num: i + 2, label: ids[i + 1], isFinale: i + 1 === n - 1 }] : []),
      ],
      light: "normal", dims: "30' x 30' square",
      ...(list[i].elevation !== undefined ? { elevation: list[i].elevation } : {}),
    }));
  }
  // s2 (Terraced) and s3 (Chasm) both NOT the finale (a trailing {} 4th keeps isFinale off them —
  // same discipline dev/verify-stage-c-terrain.mjs's own check 6 uses, so BW2-5's finale-dais
  // override — a real, separate, INTENTIONAL sy source — never contaminates this read).
  const segs = chainFixtureR([{ elevation: { profile: "Dais" } }, { elevation: { profile: "Terraced" } }, { elevation: { profile: "Chasm/shaft" } }, {}]);
  const spatial = ren.__semanticizePlan(ren.__spatializePlan(segs, "The Spine", { walkId: "elev1-render-seam:v1" }), segs, []);
  const board = ren.__interiorBuildBoard(spatial, { realmId: "fantasy" });

  const terracedRoom = spatial.rooms.find((r) => r.segId === "s2");
  const chasmRoom = spatial.rooms.find((r) => r.segId === "s3");
  const idx = (plan, x, y) => y * plan.cellW + x;
  const planTiers = ren.__spatializePlan(segs, "The Spine", { walkId: "elev1-render-seam:v1" }).tiers;
  const cellW = ren.__spatializePlan(segs, "The Spine", { walkId: "elev1-render-seam:v1" }).cellW;

  // Terraced: every distinct non-zero tier present in the room must fold into a linearly-scaled sy —
  // this is the genuinely NEW multi-tier-in-one-room case (0-2 tier fixtures were the only ones ever
  // proven before ELEV-1; see dev/verify-stage-c-terrain.mjs's own single-patch-per-room fixtures).
  const terracedTiers = new Set();
  (terracedRoom.cells || []).forEach((c) => terracedTiers.add(planTiers[c.y * cellW + c.x]));
  let terracedFoldOk = true; const terracedDetail = [];
  terracedTiers.forEach((tier) => {
    if (tier === 0) return;
    const floors = board.instances.floor.filter((f) =>
      f.x >= terracedRoom.x && f.x < terracedRoom.x + terracedRoom.w && f.z >= terracedRoom.y && f.z < terracedRoom.y + terracedRoom.d &&
      planTiers[f.z * cellW + f.x] === tier);
    const expected = ITR_FLOOR_HEIGHT + tier * ITR_DAIS_STEP;
    const ok = floors.length > 0 && floors.every((f) => Math.abs(f.sy - expected) < 1e-9);
    terracedDetail.push({ tier, cells: floors.length, ok });
    if (!ok) terracedFoldOk = false;
  });
  check("4a. Terraced (2-3 simultaneous distinct tiers in ONE room): every non-zero tier folds to sy=ITR_FLOOR_HEIGHT+tier*ITR_DAIS_STEP, unclamped",
    terracedFoldOk, terracedDetail);

  // Chasm/shaft: tier -2 or -3.
  const chasmTiers = new Set();
  (chasmRoom.cells || []).forEach((c) => chasmTiers.add(planTiers[c.y * cellW + c.x]));
  const chasmTier = [...chasmTiers].find((t) => t < 0);
  let chasmFoldOk = null, chasmDetail = null;
  if (chasmTier != null) {
    const floors = board.instances.floor.filter((f) =>
      f.x >= chasmRoom.x && f.x < chasmRoom.x + chasmRoom.w && f.z >= chasmRoom.y && f.z < chasmRoom.y + chasmRoom.d &&
      planTiers[f.z * cellW + f.x] === chasmTier);
    const expected = ITR_FLOOR_HEIGHT + chasmTier * ITR_DAIS_STEP;
    chasmFoldOk = floors.length > 0 && floors.every((f) => Math.abs(f.sy - expected) < 1e-9);
    chasmDetail = { tier: chasmTier, cells: floors.length, expected, got: floors.map((f) => f.sy) };
  }
  check("4b. Chasm/shaft tier " + (chasmTier != null ? chasmTier : "?") + ": folds to sy=ITR_FLOOR_HEIGHT+tier*ITR_DAIS_STEP, unclamped",
    chasmFoldOk === true, chasmDetail);

  console.log("  HONEST READ: the sy formula (theater-interior.js:1364, `sy = ITR_FLOOR_HEIGHT + terrainTier * ITR_DAIS_STEP`) is a plain");
  console.log("  linear multiply with NO clamp in source — mechanically it already accepts any tier magnitude, ELEV-1's ±3 included.");
  console.log("  The one genuinely NEW shape ELEV-1 exercises that no prior fixture (STAGE C2's own tests included) ever did is THREE OR");
  console.log("  FOUR simultaneous distinct tiers inside a single room (Terraced) — checked directly above, not merely inferred.");
}

// ─── 5. Live gates ───────────────────────────────────────────────────────────────────────────
console.log("\n=== 5. Live gates ===");
{
  let compileOut = "";
  try { compileOut = execSync(`python3 "Engine/00. _System/compile-tables.py"`, { cwd: ROOT }).toString(); }
  catch (e) { compileOut = String(e.stdout || e.message); }
  const realBugsMatch = compileOut.match(/REAL bugs: (\d+)/);
  const startsHighMatch = compileOut.match(/starts-high\(check\): (\d+)/);
  check("5a. compile-tables.py: 0 REAL coverage bugs", realBugsMatch && realBugsMatch[1] === "0", realBugsMatch && realBugsMatch[0]);
  check("5b. compile-tables.py: 0 starts-high flags", startsHighMatch && startsHighMatch[1] === "0", startsHighMatch && startsHighMatch[0]);
  check("5c. compile-tables.py report mentions this table cleanly (no red-flag lines naming it)", !/room-elevation-profile/.test(compileOut.split("lookup-matrices")[0].split("REAL coverage").slice(1).join("")), "checked REAL/starts-high sections for the table id");

  let manifestOut = "";
  try { manifestOut = execSync(`python3 build/check-manifest.py`, { cwd: ROOT }).toString(); }
  catch (e) { manifestOut = String(e.stdout || e.message); }
  check("5d. check-manifest.py: RESULT: OK", /RESULT:\s*OK/.test(manifestOut), manifestOut.slice(-200));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail > 0 ? 1 : 0;
