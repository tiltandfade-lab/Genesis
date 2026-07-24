/* dev/verify-floor-congruence.mjs — STAGE C4.1c (docs/STAGE-C4.1c-FLOOR-CONGRUENCE.md): C4.1a mitered
   the OUTER octagon wall (Phase 0), but a multi-tier room's own INNER floor + tier risers still
   stairstepped on the raw cell grid — visibly incongruent against the now-mitered wall (the row-101
   Grand Octagon: sunken arena + raised ring). Two root causes in src/ui/theater-room-mesh.js:
     1. a complex (multi-ring, e.g. annular) tier's floor fell back to buildFloorCells — one
        axis-aligned quad per raw cell — even when smoothShape asked for a mitered/rounded contour
        (:1098-1099 on the PRE_FIX_COMMIT pin below).
     2. diagonalizeStaircaseRing only ever qualified 'wall' segments into a chamferable run — a tier
        boundary traced as 'riser' segments never chamfered, so an inner ring's own staircase (even
        directly under a now-mitered outer wall) stayed axis-aligned.
   This unit's own fix (PARTs 1/2, this file's own header comments) makes both the floor body and the
   riser boundary of a diagonal/radial-tagged tier share the SAME mitered/rounded contour the walls use.
   RENDER-ONLY: logical cells, cellTriangleMap coverage, tier elevations, riser loTier/hiTier/height,
   combat geometry, and door placement are all preserved — see checks 4/5/6 below.

   Pure, THREE-free harness (plain Node import), same convention dev/verify-octagon-miter.mjs and
   dev/verify-stage-c3b-circle-smooth.mjs already established for this module.

   Checks (⊗ = RED-FIRST, proven against PRE_FIX_COMMIT, this unit's own branch point):
     1. ⊗ Inner floor mitered — an annular (complex) tier's own floor triangle hull carries 45-degree
        diagonal boundary edges (not axis-aligned-only stairstep).
     2. ⊗ Risers mitered — a genuine multi-cell riser staircase run carries 45-degree diagonal segments.
     3. Congruence — the inner (riser) ring's own diagonal direction set matches the outer (wall)
        ring's own diagonal direction set (both trace the SAME underlying octagon flow).
     4. Containment — every logical cell center (every tier, including the annular/complex ones)
        resolves inside a REAL containing floor triangle of its own tier.
     5. Tier heights preserved — floor tier/elevationY set + riser loTier/hiTier/height set are
        BYTE-IDENTICAL pre-fix vs post-fix for the real row-101 fixture (tier grouping/heights are
        never touched by this render-only fix).
     6. No-op guarantee (floor-owned projection since 2026-07-24) — untouched-path fixtures keep
        floor/risers/cellTriangleMap byte-identical to the pre-fix module. Wall buffers are excluded:
        ruled post-baseline wall evolution (C1B 10-ft walls, trim runs) is legitimate and has its own
        harnesses; this unit only ever owned the floor/riser miter paths.
     7. Determinism — same cells + opts -> byte-identical buffers across two independent compiles.

   Run:  node dev/verify-floor-congruence.mjs */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync, unlinkSync } from "node:fs";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// this unit's own branch point — the C4.1c spec-merge commit, BEFORE this unit's own theater-room-
// mesh.js fix landed (mirrors verify-octagon-miter.mjs's own PRE_FIX_COMMIT convention).
const PRE_FIX_COMMIT = "f126bc31";
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

const mod = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
const { compileRoomShellData } = mod;
check("0. compileRoomShellData is exported and callable", typeof compileRoomShellData === "function");

async function loadPreFixModule() {
  const src = execSync(`git show ${PRE_FIX_COMMIT}:src/ui/theater-room-mesh.js`, { cwd: ROOT, encoding: "utf-8" });
  const tmpPath = join(ROOT, "src/ui/_verify-floor-congruence-prefix-baseline.js");
  writeFileSync(tmpPath, src);
  try {
    return await import(pathToFileURL(tmpPath).href + "?bust=" + Date.now());
  } finally {
    unlinkSync(tmpPath);
  }
}

// ─── fixture builders ────────────────────────────────────────────────────────────────────────────
// octagonRoom(w,d,k) — IDENTICAL construction to dev/verify-octagon-miter.mjs's own octagonRoom (same
// chamfer corner-clip), parameterized on `k` (the chamfer band) so a bigger room can carry a bigger,
// unambiguous 3+-cell corner run.
function octagonRoom(w, d, k) {
  k = k || Math.max(1, Math.floor(Math.min(w, d) * 0.3));
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
    const cTL = x + z < k, cTR = (w - 1 - x) + z < k, cBL = x + (d - 1 - z) < k, cBR = (w - 1 - x) + (d - 1 - z) < k;
    if (!(cTL || cTR || cBL || cBR)) cells.push({ x, z });
  }
  return cells;
}

// tieredOctagon() — a 16x16 outer octagon (tier 0, an ANNULAR/complex tier once its own middle is
// carved out) around an 8x8 inner octagon hole (tier -1) centered inside it — BOTH octagon-shaped at
// the same aspect, so the outer wall boundary and the inner riser boundary both carry a genuine 3+
// cell diagonal corner run at each of the 4 corners (this unit's own primary red/green fixture for
// checks 1-3; a controlled, hand-built analog of the row-101 Grand Octagon's own "raised ring around
// a sunken arena" topology, sized so BOTH boundaries clear diagonalizeStaircaseRing's own runLen>=3
// scoping threshold — the REAL row-101 roll's own ring erosion band, checked live below in the
// row-101 section, happens to stay under that threshold at its own corners, so it alone cannot
// red/green-prove Part 1; this fixture can and does).
function tieredOctagon() {
  const outer = octagonRoom(16, 16, 5);
  const innerOffset = 4;
  const inner = octagonRoom(8, 8, 3).map((c) => ({ x: c.x + innerOffset, z: c.z + innerOffset }));
  const innerKeys = new Set(inner.map((c) => c.x + "," + c.z));
  return outer.map((c) => {
    const key = c.x + "," + c.z;
    return { x: c.x, z: c.z, tier: innerKeys.has(key) ? -1 : 0 };
  });
}

// row101Fixture() — the REAL Grand Octagon row 101 roll ("30' x 30' sunken central arena (5 ft below
// the surrounding level); 10' wide raised ring walkway with iron railing"), run through the ACTUAL
// engine (spatializePlan, Engine/03. _Tables/.../Dungeon Area Type.md's own row 101 text — same table
// row dev/verify-stage-c-terrain.mjs's own ROW_101_GRAND_OCTAGON fixture cites, same construction
// dev/battle-gate/capture-stage-c3-shapes.mjs's own octagon scene uses), then converted to shellCells
// DIRECTLY off room.terrain (mirrors verify-stage-c-terrain.mjs's own Check 8 shellCellsFor helper —
// bypasses theater-boot.js's own separate `f.sy>0` floor-list fallback gate, a distinct, pre-existing,
// OUT-OF-SCOPE bug this unit's own report flags: a sunken terrain patch's negative sy currently
// collapses to the same fallback bucket as plain floor in the REAL render path — never touched here).
function loadEngineSandbox() {
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(read("src/engine/place-spatialize.js") + "\n;this.__spatializePlan=spatializePlan;", sandbox, { filename: "place-spatialize.js" });
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
    ...(list[i].areaType !== undefined ? { areaType: list[i].areaType } : {}),
  }));
}
const ROW_101_GRAND_OCTAGON = {
  areaType: "Grand Octagon", dims: "60' x 60'",
  side: "30' x 30' sunken central arena (5 ft below the surrounding level); 10' wide raised ring walkway with iron railing.",
};
const ROOM_SHELL_TIER_QUANTUM = 0.2, ITR_FLOOR_HEIGHT = 0.2, ITR_DAIS_STEP = 0.2, ITR_FLOOR_BASE_Y = -0.5;
function row101Fixture() {
  const src = read("Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Area Type.md");
  const isRealTableRow = /30' x 30' sunken central arena.*10' wide raised ring walkway/.test(src);
  const eng = loadEngineSandbox();
  const plan = eng.__spatializePlan(chainFixture([{}, ROW_101_GRAND_OCTAGON]), "The Spine", { walkId: "c41c-row101-congruence" });
  const room = plan.rooms.find((r) => r.segId === "s2");
  const arena = room.terrain.find((t) => t.tier < 0);
  const ring = room.terrain.find((t) => t.footprint === "ring");
  const arenaKeys = new Set(arena.cells.map((c) => c.x + "," + c.y));
  const ringKeys = new Set(ring.cells.map((c) => c.x + "," + c.y));
  const shellCells = room.cells.map((c) => {
    const key = c.x + "," + c.y;
    let terrainTier = 0;
    if (arenaKeys.has(key)) terrainTier = arena.tier;
    else if (ringKeys.has(key)) terrainTier = ring.tier;
    const sy = ITR_FLOOR_HEIGHT + terrainTier * ITR_DAIS_STEP;
    return { x: c.x - room.x, z: c.y - room.y, tier: Math.round(sy / ROOM_SHELL_TIER_QUANTUM), elevationY: ITR_FLOOR_BASE_Y + sy };
  });
  return { shellCells, room, isRealTableRow, activeRoomShape: room.shape };
}

// ─── shared geometry helpers (mirrors verify-octagon-miter.mjs's own conventions) ─────────────────
function segLen(s) { return Math.hypot(s.b.x - s.a.x, s.b.z - s.a.z); }
function segDir(s) { const l = segLen(s) || 1; return { dx: (s.b.x - s.a.x) / l, dz: (s.b.z - s.a.z) / l }; }
function isDiagonal45(dir) { return Math.abs(Math.abs(dir.dx) - Math.abs(dir.dz)) < 1e-6 && Math.abs(dir.dx) > 1e-6; }
function dirKey(dir) { return dir.dx.toFixed(3) + "," + dir.dz.toFixed(3); }

// floorBoundaryEdges(data, tier) -> the HULL edges (used by exactly one triangle) of a given tier's
// own floor triangle range — the floor buffer's OWN boundary, independent of walls/risers metadata,
// so check 1 tests the actual rendered floor surface rather than just the segments that fed it.
function floorBoundaryEdges(data, tier) {
  const meta = data.floor.tiers.find((t) => t.tier === tier);
  if (!meta) return [];
  const pos = data.floor.positions, idx = data.floor.indices;
  const vKey = (i) => pos[i * 3].toFixed(4) + "," + pos[i * 3 + 2].toFixed(4);
  const edgeCount = new Map();
  const edgeVerts = new Map();
  for (let t = meta.triStart; t < meta.triStart + meta.triCount; t++) {
    const tri = [idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]];
    for (let e = 0; e < 3; e++) {
      const a = tri[e], b = tri[(e + 1) % 3];
      const key = [vKey(a), vKey(b)].sort().join("|");
      edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
      if (!edgeVerts.has(key)) edgeVerts.set(key, { a: { x: pos[a * 3], z: pos[a * 3 + 2] }, b: { x: pos[b * 3], z: pos[b * 3 + 2] } });
    }
  }
  const hull = [];
  edgeCount.forEach((count, key) => { if (count === 1) hull.push(edgeVerts.get(key)); });
  return hull;
}

// ─── 0-red: LIVE RED-FIRST against the pinned pre-fix commit ───────────────────────────────────────
console.log("\n=== 0-red. LIVE RED-FIRST: the stairstep bug at the pinned pre-fix commit " + PRE_FIX_COMMIT + " ===");
let preFix = null, preFixErr = null;
try { preFix = await loadPreFixModule(); } catch (e) { preFixErr = String((e && e.message) || e); }
check("0a. pre-fix module loads cleanly", !!preFix, preFixErr);

const tieredOct = tieredOctagon();
if (preFix) {
  const preData = preFix.compileRoomShellData(tieredOct, { smoothShape: "octagon" });
  const preRiserDiag = preData.risers.segments.filter((s) => isDiagonal45(segDir(s)));
  check("0b. ⊗ RED: PRE-FIX riser segments are axis-aligned-only (zero diagonal risers) on the tiered-octagon fixture",
    preRiserDiag.length === 0, { diagCount: preRiserDiag.length, total: preData.risers.segments.length });
  const preOuterHull = floorBoundaryEdges(preData, 0);
  const preOuterDiag = preOuterHull.filter((e) => isDiagonal45(segDir(e)));
  check("0c. ⊗ RED: PRE-FIX complex (annular) tier's own floor triangle hull is axis-aligned-only (buildFloorCells stairstep, zero diagonal hull edges)",
    preOuterDiag.length === 0, { diagHullEdges: preOuterDiag.length, hullEdges: preOuterHull.length });
  // sanity: the fixture's WALL ring (already fixed by C4.1a/Phase-0, pre-dates this unit) DOES
  // chamfer at the pinned commit — proves 0b/0c are measuring the RISER/FLOOR gap specifically, not
  // a fixture that never chamfers anything at all.
  const preWallDiag = preData.walls.segments.filter((s) => isDiagonal45(segDir(s)));
  check("0d. sanity: PRE-FIX WALL ring already chamfers (C4.1a predates this unit) — confirms 0b/0c isolate the riser/floor gap",
    preWallDiag.length > 0, preWallDiag.length);
}

// ─── 1. ⊗ Inner floor mitered ───────────────────────────────────────────────────────────────
console.log("\n=== 1. ⊗ Inner floor mitered — an annular tier's own floor hull carries 45-degree diagonals ===");
{
  const data = compileRoomShellData(tieredOct, { smoothShape: "octagon" });
  const outerHull = floorBoundaryEdges(data, 0);
  const outerDiag = outerHull.filter((e) => isDiagonal45(segDir(e)));
  check("1a. GREEN (this branch): the annular (complex) outer tier's own floor hull carries real 45-degree diagonal edges",
    outerDiag.length > 0, { diagHullEdges: outerDiag.length, hullEdges: outerHull.length });
  check("1b. sanity: the outer tier is genuinely annular/complex (2 rings — not a simple single-ring tier)",
    data.meta.tierCount === 2);
}

// ─── 2. ⊗ Risers mitered ───────────────────────────────────────────────────────────────────
console.log("\n=== 2. ⊗ Risers mitered — a genuine multi-cell riser staircase run carries 45-degree diagonals ===");
{
  const data = compileRoomShellData(tieredOct, { smoothShape: "octagon" });
  const riserDiag = data.risers.segments.filter((s) => isDiagonal45(segDir(s)));
  check("2a. GREEN (this branch): riser segments include real 45-degree diagonal segments",
    riserDiag.length > 0, { diagCount: riserDiag.length, total: data.risers.segments.length });
  check("2b. sanity: untagged (no smoothShape) compile of the SAME fixture has zero diagonal risers (isolates the fix to the tagged path)",
    compileRoomShellData(tieredOct, {}).risers.segments.filter((s) => isDiagonal45(segDir(s))).length === 0);
}

// ─── 3. Congruence ──────────────────────────────────────────────────────────────────────────────
console.log("\n=== 3. Congruence — the riser ring's own diagonal directions match the wall ring's own diagonal directions ===");
{
  const data = compileRoomShellData(tieredOct, { smoothShape: "octagon" });
  const wallDirs = new Set(data.walls.segments.filter((s) => isDiagonal45(segDir(s))).map((s) => dirKey(segDir(s))));
  const riserDirs = new Set(data.risers.segments.filter((s) => isDiagonal45(segDir(s))).map((s) => dirKey(segDir(s))));
  check("3a. both the wall ring and the riser ring produced all 4 octagon corner diagonal directions",
    wallDirs.size === 4 && riserDirs.size === 4, { wallDirs: Array.from(wallDirs), riserDirs: Array.from(riserDirs) });
  const sharedDirs = Array.from(riserDirs).filter((d) => wallDirs.has(d));
  check("3b. every riser diagonal direction is ALSO a wall diagonal direction (same underlying octagon flow, not an independent/mismatched chamfer)",
    sharedDirs.length === riserDirs.size, { shared: sharedDirs.length, riserDirCount: riserDirs.size });
}

// ─── 4. Containment ─────────────────────────────────────────────────────────────────────────────
console.log("\n=== 4. Containment — every logical cell center (all tiers) resolves inside a real floor triangle ===");
{
  const { pointInTriangle2D, pointToTriangleDist2 } = mod;
  function checkContainment(label, cells, opts) {
    const data = compileRoomShellData(cells, opts);
    let missing = 0, notStrictlyContained = 0;
    cells.forEach((c) => {
      const entry = data.cellTriangleMap[c.x + "," + c.z];
      if (!entry) { missing++; return; }
      const t = entry.triIndex;
      const i0 = data.floor.indices[t * 3], i1 = data.floor.indices[t * 3 + 1], i2 = data.floor.indices[t * 3 + 2];
      const a = { x: data.floor.positions[i0 * 3], z: data.floor.positions[i0 * 3 + 2] };
      const b = { x: data.floor.positions[i1 * 3], z: data.floor.positions[i1 * 3 + 2] };
      const cc = { x: data.floor.positions[i2 * 3], z: data.floor.positions[i2 * 3 + 2] };
      const strictlyIn = pointInTriangle2D(c.x, c.z, a, b, cc);
      const dist2 = pointToTriangleDist2(c.x, c.z, a, b, cc);
      if (!strictlyIn && dist2 > 1e-6) notStrictlyContained++;
    });
    check(`4-${label}. every cell resolves to a real (strictly-containing or edge-touching) triangle — 0 missing, 0 mis-resolved`,
      missing === 0 && notStrictlyContained === 0, { total: cells.length, missing, notStrictlyContained });
  }
  checkContainment("tiered-octagon", tieredOct, { smoothShape: "octagon" });
  const row101 = row101Fixture();
  checkContainment("row101-real-fixture", row101.shellCells, { smoothShape: row101.activeRoomShape });
}

// ─── 5. Tier heights preserved (row 101) ───────────────────────────────────────────────────────
console.log("\n=== 5. Tier heights preserved — row 101 floor tier/elevationY + riser loTier/hiTier/height byte-identical pre/post fix ===");
{
  const row101 = row101Fixture();
  check("5-sanity. the row 101 table text used to build this fixture is real (not fabricated)", row101.isRealTableRow);
  check("5-sanity2. the row 101 fixture resolved as a real octagon room via the real engine", row101.activeRoomShape === "octagon");
  const arenaCells = row101.shellCells.filter((c) => c.tier < 0);
  const ringCells = row101.shellCells.filter((c) => c.tier > 0 && c.tier !== Math.round(ITR_FLOOR_HEIGHT / ROOM_SHELL_TIER_QUANTUM));
  check("5a. row 101 resolves a genuinely sunken arena tier (negative) and a genuinely raised ring tier (distinct positive)",
    arenaCells.length > 0 && ringCells.length > 0, { arenaCells: arenaCells.length, ringCells: ringCells.length });

  const postData = compileRoomShellData(row101.shellCells, { smoothShape: row101.activeRoomShape });
  if (preFix) {
    const preData = preFix.compileRoomShellData(row101.shellCells, { smoothShape: row101.activeRoomShape });
    const tierSet = (data) => data.floor.tiers.map((t) => `${t.tier}:${t.elevationY.toFixed(6)}`).sort();
    check("5b. floor tier IDs + elevationY set is BYTE-IDENTICAL pre-fix vs post-fix (tier grouping/heights untouched by this render-only unit)",
      JSON.stringify(tierSet(preData)) === JSON.stringify(tierSet(postData)), { pre: tierSet(preData), post: tierSet(postData) });
    const riserSet = (data) => data.risers.segments.map((s) => `${s.loTier}:${s.hiTier}:${s.height.toFixed(6)}`).sort();
    const preRiserKeys = new Set(riserSet(preData)), postRiserKeys = new Set(riserSet(postData));
    check("5c. every pre-fix riser loTier/hiTier/height COMBINATION still appears post-fix (heights preserved; segment COUNT may differ — mitering can split/merge segments, never change their height)",
      Array.from(preRiserKeys).every((k) => postRiserKeys.has(k)), { pre: Array.from(preRiserKeys), post: Array.from(postRiserKeys) });
    check("5d. meta.tierCount is byte-identical pre/post (same 3 tiers: arena / ring / outer margin)",
      preData.meta.tierCount === postData.meta.tierCount, { pre: preData.meta.tierCount, post: postData.meta.tierCount });
  }
}

// ─── 6. No-op guarantee ─────────────────────────────────────────────────────────────────────────
console.log("\n=== 6. No-op guarantee — rect/complex-rect/L-shaped rooms stay byte-identical to the pre-fix module ===");
if (preFix) {
  function rectRoom(w, d) {
    const cells = [];
    for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) cells.push({ x, z, tier: 0 });
    return cells;
  }
  function lShapeRoom(w, d) {
    const cells = [];
    for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) { if (x >= w / 2 && z >= d / 2) continue; cells.push({ x, z, tier: 0 }); }
    return cells;
  }
  // a COMPLEX (multi-ring, annular) RECT room with NO smoothShape tag — Decisions: "retire
  // buildFloorCells for smoothMode diagonal/radial only... rect default keeps it" — this is the
  // load-bearing no-op case for Part 2's own gate (hollowFloorMode = complexTier && smoothMode!==null).
  function complexRectRoom() {
    const cells = [];
    for (let z = 0; z < 10; z++) for (let x = 0; x < 10; x++) {
      const inHole = x >= 4 && x <= 5 && z >= 4 && z <= 5;
      cells.push({ x, z, tier: inHole ? 1 : 0 });
    }
    return cells;
  }

  // FLOOR-OWNED PROJECTION (2026-07-24): this unit was a render-only FLOOR/RISER miter fix, and
  // group 6's original whole-output byte-diff silently policed the WALL buffers too. Ruled changes
  // then landed on walls after the pinned baseline (C1B: Adam's 10-foot wall ruling changed wall
  // height 2.4->2.0 u; the wall-trim runs grew) and the whole-output diff began failing on
  // legitimate, recorded evolution — not on this unit's own surface. The no-op guarantee now
  // compares exactly what the unit owned: floor + risers + cellTriangleMap. Wall geometry has its
  // own harnesses (room-shell, wall-runs, octagon-miter).
  const floorOwned = (d) => ({ floor: d.floor, risers: d.risers, cellTriangleMap: d.cellTriangleMap });
  const sameFloor = (a, b) => JSON.stringify(floorOwned(a)) === JSON.stringify(floorOwned(b));

  const rect = rectRoom(8, 8);
  const rectPre = preFix.compileRoomShellData(rect, {});
  const rectPost = compileRoomShellData(rect, {});
  check("6a. plain rect room (no smoothShape): floor/riser output byte-identical pre-fix vs post-fix", sameFloor(rectPre, rectPost));

  const complexRect = complexRectRoom();
  const complexRectPre = preFix.compileRoomShellData(complexRect, {});
  const complexRectPost = compileRoomShellData(complexRect, {});
  check("6b. COMPLEX (annular) rect room, smoothShape===null: floor/riser output byte-identical pre-fix vs post-fix (the buildFloorCells rect-default path this unit's own Decisions say must stay untouched)",
    sameFloor(complexRectPre, complexRectPost));
  check("6b-sanity. the complex-rect fixture genuinely has >1 tier and the hole tier is annular (2 rings)",
    complexRectPre.meta.tierCount === 2);

  const lCells = lShapeRoom(8, 8);
  const lBarePre = preFix.compileRoomShellData(lCells, {});
  const lBarePost = compileRoomShellData(lCells, {});
  check("6c. L-shaped room, untagged: floor/riser output byte-identical pre-fix vs post-fix", sameFloor(lBarePre, lBarePost));
  const lTaggedPre = preFix.compileRoomShellData(lCells, { smoothShape: "L" });
  const lTaggedPost = compileRoomShellData(lCells, { smoothShape: "L" });
  check("6d. L-shaped room tagged 'L' (no qualifying staircase run — a genuine architectural corner only): floor/riser output byte-identical pre-fix vs post-fix",
    sameFloor(lTaggedPre, lTaggedPost));

  const octPre = preFix.compileRoomShellData(octagonRoom(12, 12), { smoothShape: "octagon" });
  const octPost = compileRoomShellData(octagonRoom(12, 12), { smoothShape: "octagon" });
  check("6e. simple (non-annular) tagged octagon room (C4.1a's own Phase-0 wall-miter fixture): floor/riser output byte-identical pre-fix vs post-fix (this unit never touches a simple single-ring tier's own floor path)",
    sameFloor(octPre, octPost));
}

// ─── 7. Determinism ─────────────────────────────────────────────────────────────────────────────
console.log("\n=== 7. Determinism — same cells+opts -> byte-identical buffers across two independent compiles ===");
{
  const d1 = compileRoomShellData(tieredOct, { smoothShape: "octagon" });
  const d2 = compileRoomShellData(tieredOct.map((c) => Object.assign({}, c)), { smoothShape: "octagon" });
  check("7a. tiered-octagon fixture: two independent compiles are byte-identical", JSON.stringify(d1) === JSON.stringify(d2));

  const row101 = row101Fixture();
  const r1 = compileRoomShellData(row101.shellCells, { smoothShape: row101.activeRoomShape });
  const r2 = compileRoomShellData(row101.shellCells.map((c) => Object.assign({}, c)), { smoothShape: row101.activeRoomShape });
  check("7b. row 101 real fixture: two independent compiles are byte-identical", JSON.stringify(r1) === JSON.stringify(r2));
}

// ─── 8. check-manifest.py (run live) ───────────────────────────────────────────────────────────
console.log("\n=== 8. check-manifest.py (run live) ===");
{
  let out = "", okExit = true;
  try {
    out = execSync("python3 build/check-manifest.py", { cwd: ROOT, encoding: "utf-8" });
  } catch (e) {
    okExit = false; out = String(e.stdout || "") + String(e.stderr || "");
  }
  check("8a. check-manifest.py exits 0", okExit, out.split("\n").slice(-3).join(" | "));
  check("8b. check-manifest.py prints RESULT: OK", /RESULT: OK/.test(out));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
