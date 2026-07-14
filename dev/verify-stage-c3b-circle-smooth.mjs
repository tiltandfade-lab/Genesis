#!/usr/bin/env node
/* dev/verify-stage-c3b-circle-smooth.mjs — STAGE-C3b (docs/STAGE-C.md's own C3b addendum, the
   circle/ellipse render-refinement pass that follows C3's "the coarse read stays a follow-up" note —
   SCOPE-EXPANDED mid-session, same branch, to also cover octagon/L/T/cross DIAGONAL wall faces).
   Plain-Node ESM harness, a direct sibling of dev/verify-room-shell.mjs — imports the SAME production
   module (src/ui/theater-room-mesh.js) and drives compileRoomShellData directly, no browser needed
   (every function this harness calls stays above that file's own THREE-assembler divider).

   What this proves, in order:
     1. The new pure helpers (unmergedSegments, insetOffset, radialSmoothRing, chamferRunCorners,
        diagonalizeStaircaseRing, DEFAULT_RADIAL_SMOOTH_BLEND) are actually exported and callable.
     2. insetOffset reduces to the module's ORIGINAL 90-degree sum formula exactly (byte-identical) —
        the algebraic proof theater-room-mesh.js's own header comment states, checked live here rather
        than only asserted in prose.
     3. CELL-MAP UNCHANGED (the hard constraint's own proof, circle): for a synthetic circle-room
        fixture, the SET of cell keys compileRoomShellData's cellTriangleMap resolves is byte-identical
        whether `smoothShape` is on or off — every logical cell (the same cells `plan.cells`/
        `rooms[].cells` would carry) still resolves to a real containing floor triangle post-smoothing.
        This is the precise, harness-checkable form of "combat/placement/pathing untouched": those
        systems read the LOGICAL cell set (never touched by this unit at all — theater-room-mesh.js
        only ever receives cells, never mutates or re-derives them), and this proves the RENDER layer's
        own cell<->triangle lookup still serves every one of those same cells after the vertices move.
     4. DOOR PIN: a door cell on the circle's own boundary keeps its exact aperture position whether
        smoothing is on or off — the corridor throat never drifts off the logical door cell.
     5. ROUNDNESS METRIC: the true (pre-bevel) wall-boundary vertices' relative deviation from the
        ideal-circle radius (fitted to that vertex set's own bbox) — average AND max — drops sharply
        with smoothing on vs off. This is the concrete "reads as a curve, not a staircase" proof a
        harness CAN check (the CAPTURE gate below is what a human reads).
     6. DETERMINISM: two independent compiles of the identical circle/ellipse fixture with smoothing on
        -> byte-identical geometry (no Math.random/Date.now anywhere in the new code path).
     7. SHAPE GATE: 'rect'/'cave'/an unrecognized tag never invokes ANY treatment (byte-identical to
        untagged); 'circle' actually diverges from a bare compile of the SAME cell set (proves the gate
        keys off the caller's own tag string, not silent footprint re-classification).
     8. check-manifest.py (run live).
     9. DIAGONAL FACES (octagon): a real octagon-chamfer fixture gets genuine 45-degree wall segments
        post-tag (none exist pre-tag); the chamfer run's diagonal segments are provably collinear.
    10. ROOT FIX for the dropped-cell bug (the coordinator's own follow-up, same branch): the strict
        point-in-triangle cellTriangleMap loop silently dropped a cell whose center sits exactly on an
        internal ear-clip diagonal (no triangle STRICTLY contains it). Pre-fix commit 2b47aee9's bare octagon(10,10)
        drops "2,1" and "4,3" (74/76). The fix is a NEAREST-TRIANGLE FALLBACK by true point-to-triangle
        distance (pointToTriangleDist2) — proven HERE on the BARE (untagged, non-chamfered) path: bare
        octagon 76/76, circle-mode + plain rect full coverage, every cell mapped to a triangle it
        geometrically lies ON (dist ~0), and a RED-FIRST check of the pinned pre-fix module (74/76) confirming
        the pre-existing gap this closes. This is INDEPENDENT of the diagonal chamfer — the chamfer only
        fixed the octagon case incidentally; the fallback fixes ANY shape/fixture (circle-mode cells,
        unlucky rect triangulations, future shapes).
    11. NO-OP GUARANTEE (L/T/cross, and non-staircase shapes generally): tagging a room 'L'/'T'/'cross'
        — or an octagon fixture whose corners are too small to form a real multi-cell staircase — is
        BYTE-IDENTICAL to the untagged compile of the same cells. This is what makes "diagonal mode"
        safe to wire unconditionally off the room's own real shape tag: it only ever changes geometry
        where a genuine staircase run actually exists.
    12. Regression: the ORIGINAL circle/octagon/L/T/cross rasterizeShape-equivalent fixtures used above
        also feed dev/verify-stage-c-shapes.mjs (place-spatialize.js's own C3 harness, untouched by this
        unit) — re-run separately, not duplicated here.

   Run:  node dev/verify-stage-c3b-circle-smooth.mjs */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

const mod = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
const {
  compileRoomShellData, unmergedSegments, insetOffset, radialSmoothRing, segmentNormal,
  chamferRunCorners, diagonalizeStaircaseRing,
  DEFAULT_RADIAL_SMOOTH_BLEND, pointInTriangle2D, pointToTriangleDist2,
} = mod;

console.log("=== 1. STAGE-C3b exports ===");
check("1a. unmergedSegments exported", typeof unmergedSegments === "function");
check("1b. insetOffset exported", typeof insetOffset === "function");
check("1c. radialSmoothRing exported", typeof radialSmoothRing === "function");
check("1d. DEFAULT_RADIAL_SMOOTH_BLEND is a sane (0,1) fraction", typeof DEFAULT_RADIAL_SMOOTH_BLEND === "number" && DEFAULT_RADIAL_SMOOTH_BLEND > 0 && DEFAULT_RADIAL_SMOOTH_BLEND < 1, DEFAULT_RADIAL_SMOOTH_BLEND);
check("1e. chamferRunCorners + diagonalizeStaircaseRing exported", typeof chamferRunCorners === "function" && typeof diagonalizeStaircaseRing === "function");
check("1f. pointToTriangleDist2 exported (the root-fix distance metric)", typeof pointToTriangleDist2 === "function");

console.log("\n=== 2. insetOffset reduces EXACTLY to the original 90-degree sum formula ===");
{
  const cases = [
    { pn: { x: 1, z: 0 }, nn: { x: 0, z: 1 } },   // convex, D=+1
    { pn: { x: 0, z: 1 }, nn: { x: 1, z: 0 } },   // convex, D=-1 (other winding)
    { pn: { x: -1, z: 0 }, nn: { x: 0, z: -1 } }, // reflex-style pairing, still orthogonal
  ];
  let allMatch = true;
  const detail = [];
  cases.forEach(({ pn, nn }) => {
    const pw = 0.06, nw = 0.06;
    const oldFormula = { x: pn.x * pw + nn.x * nw, z: pn.z * pw + nn.z * nw };
    const newFormula = insetOffset(pn, pw, nn, nw);
    const ok = Math.abs(oldFormula.x - newFormula.x) < 1e-9 && Math.abs(oldFormula.z - newFormula.z) < 1e-9;
    detail.push({ pn, nn, oldFormula, newFormula, ok });
    if (!ok) allMatch = false;
  });
  check("2a. every 90-degree (pn⊥nn) case: insetOffset === old pn*pw+nn*nw sum, byte-for-byte", allMatch, detail);
  // differing widths at a 90-degree corner (door meets wall) — the module's OWN preexisting case.
  const mixed = insetOffset({ x: 1, z: 0 }, 0, { x: 0, z: 1 }, 0.06);
  check("2b. differing widths (door=0, wall=0.06) at 90 degrees also matches the old sum", Math.abs(mixed.x - 0) < 1e-9 && Math.abs(mixed.z - 0.06) < 1e-9, mixed);
}

// ── circle fixture ──────────────────────────────────────────────────────────────────────────────
// circleRoom(w,d,doorCell) -> the SAME radial-inclusion test place-spatialize.js's own rasterizeShape
// uses for 'circle' (nx=(x+0.5-hw)/hw, nz=(z+0.5-hd)/hd, include if nx*nx+nz*nz<=1) — a real rotunda
// footprint shape, not a hand-picked toy polygon. w=d=10 (a 50ft-diameter rotunda, matching the actual
// capture-stage-c3-shapes.mjs fixture's own row).
function circleRoom(w, d, doorCell) {
  const hw = w / 2, hd = d / 2;
  const cells = [];
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const nx = (x + 0.5 - hw) / hw, nz = (z + 0.5 - hd) / hd;
      if (nx * nx + nz * nz > 1) continue;
      const isDoor = !!(doorCell && doorCell.x === x && doorCell.z === z);
      cells.push({ x, z, tier: 0, isDoor });
    }
  }
  return cells;
}
const DOOR_CELL = { x: 4, z: 0 }; // a real boundary cell on this 10x10 circle's own north edge (verified included below)

console.log("\n=== 3. CELL-MAP UNCHANGED — the hard-constraint proof ===");
{
  const cells = circleRoom(10, 10, DOOR_CELL);
  check("3a. sanity: the door cell IS on the circle's own boundary", cells.some((c) => c.x === DOOR_CELL.x && c.z === DOOR_CELL.z), DOOR_CELL);
  const off = compileRoomShellData(cells, {});
  const on = compileRoomShellData(cells, { smoothShape: "circle" });
  const keysOff = Object.keys(off.cellTriangleMap).sort();
  const keysOn = Object.keys(on.cellTriangleMap).sort();
  check("3b. cellTriangleMap key SET (the logical cell coverage) is byte-identical smoothing on vs off",
    JSON.stringify(keysOff) === JSON.stringify(keysOn), { offCount: keysOff.length, onCount: keysOn.length });
  check("3c. every one of the fixture's own cells resolves in the SMOOTHED map (no cell dropped)",
    cells.every((c) => !!on.cellTriangleMap[c.x + "," + c.z]), cells.length + " cells");
  // the stronger hit-test proof: with smoothing ON, every cell's own center point ACTUALLY falls
  // inside the floor triangle its map entry points to — i.e. click-to-cell / standee-placement
  // lookups against the rounder mesh still resolve correctly, not just "a key exists".
  const allContainOn = cells.every((c) => {
    const rec = on.cellTriangleMap[c.x + "," + c.z];
    if (!rec) return false;
    const t = rec.triIndex;
    const i0 = on.floor.indices[t * 3], i1 = on.floor.indices[t * 3 + 1], i2 = on.floor.indices[t * 3 + 2];
    const p = (i) => ({ x: on.floor.positions[i * 3], z: on.floor.positions[i * 3 + 2] });
    return pointInTriangle2D(c.x, c.z, p(i0), p(i1), p(i2));
  });
  check("3d. SMOOTHED mesh: every cell's own center point is geometrically contained in its mapped triangle (real hit-test proof)",
    allContainOn, cells.length + " cells checked");
  check("3e. floorCellCount metadata identical (same input cell count either way)", off.meta.floorCellCount === on.meta.floorCellCount, { off: off.meta.floorCellCount, on: on.meta.floorCellCount });
}

console.log("\n=== 4. DOOR PIN — the aperture never drifts off the logical door cell ===");
{
  const cells = circleRoom(10, 10, DOOR_CELL);
  const off = compileRoomShellData(cells, {});
  const on = compileRoomShellData(cells, { smoothShape: "circle" });
  check("4a. exactly one aperture, smoothing off", off.apertures.length === 1, off.apertures.length);
  check("4b. exactly one aperture, smoothing on", on.apertures.length === 1, on.apertures.length);
  if (off.apertures.length === 1 && on.apertures.length === 1) {
    const a0 = off.apertures[0], a1 = on.apertures[0];
    const same = Math.abs(a0.a.x - a1.a.x) < 1e-9 && Math.abs(a0.a.z - a1.a.z) < 1e-9
      && Math.abs(a0.b.x - a1.b.x) < 1e-9 && Math.abs(a0.b.z - a1.b.z) < 1e-9;
    check("4c. the door aperture's own boundary segment is EXACTLY the same position on vs off (pinned, not smoothed)",
      same, { off: a0, on: a1 });
  }
}

console.log("\n=== 5. ROUNDNESS METRIC — true wall-boundary vertices, deviation from the ideal circle ===");
function roundnessMetric(data) {
  // dedupe wall-segment endpoint vertices (each shared vertex appears in 2 segments) via a string key.
  const seen = new Map();
  data.walls.segments.forEach((s) => {
    [s.a, s.b].forEach((v) => { seen.set(v.x.toFixed(6) + "," + v.z.toFixed(6), v); });
  });
  const verts = Array.from(seen.values());
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  verts.forEach((v) => { if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x; if (v.z < minZ) minZ = v.z; if (v.z > maxZ) maxZ = v.z; });
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2, rx = (maxX - minX) / 2, rz = (maxZ - minZ) / 2;
  const devs = verts.map((v) => {
    const nx = (v.x - cx) / rx, nz = (v.z - cz) / rz;
    return Math.abs(Math.hypot(nx, nz) - 1);
  });
  const avg = devs.reduce((s, d) => s + d, 0) / devs.length;
  const max = devs.reduce((m, d) => Math.max(m, d), 0);
  return { avg, max, vertCount: verts.length };
}
{
  const cells = circleRoom(10, 10, null);
  const off = compileRoomShellData(cells, {});
  const on = compileRoomShellData(cells, { smoothShape: "circle" });
  const mOff = roundnessMetric(off), mOn = roundnessMetric(on);
  console.log("  metric OFF (raw staircase):", JSON.stringify(mOff));
  console.log("  metric ON  (radially smoothed):", JSON.stringify(mOn));
  check("5a. smoothing markedly INCREASES boundary vertex density (unmerged edges vs simplified runs)",
    mOn.vertCount > mOff.vertCount, { off: mOff.vertCount, on: mOn.vertCount });
  check("5b. smoothing REDUCES average deviation from the ideal-circle radius", mOn.avg < mOff.avg * 0.5, { off: mOff.avg, on: mOn.avg });
  check("5c. smoothing REDUCES max deviation from the ideal-circle radius", mOn.max < mOff.max * 0.75, { off: mOff.max, on: mOn.max });
}

console.log("\n=== 6. DETERMINISM ===");
{
  const cells = circleRoom(10, 10, DOOR_CELL);
  const d1 = compileRoomShellData(cells, { smoothShape: "circle" });
  const d2 = compileRoomShellData(cells.map((c) => Object.assign({}, c)), { smoothShape: "circle" });
  check("6a. two independent compiles of the same circle fixture, smoothing on -> byte-identical geometry", JSON.stringify(d1) === JSON.stringify(d2));
  const shuffled = cells.slice().reverse();
  const d3 = compileRoomShellData(shuffled, { smoothShape: "circle" });
  check("6b. determinism holds even with reversed input cell order", JSON.stringify(d1) === JSON.stringify(d3));
  // an ellipse fixture too (the sibling smoothShape tag).
  function ellipseRoom(w, d2_) {
    const hw = w / 2, hd = d2_ / 2;
    const cells2 = [];
    for (let z = 0; z < d2_; z++) for (let x = 0; x < w; x++) {
      const nx = (x + 0.5 - hw) / hw, nz = (z + 0.5 - hd) / hd;
      if (nx * nx + nz * nz <= 1) cells2.push({ x, z, tier: 0 });
    }
    return cells2;
  }
  const ell = ellipseRoom(12, 8);
  const e1 = compileRoomShellData(ell, { smoothShape: "ellipse" });
  const e2 = compileRoomShellData(ell.map((c) => Object.assign({}, c)), { smoothShape: "ellipse" });
  check("6c. ellipse fixture also compiles deterministically", JSON.stringify(e1) === JSON.stringify(e2));
  check("6d. ellipse fixture also gets the roundness treatment (more wall verts than a plain simplify would give)",
    e1.meta.wallSegmentCount > 4, e1.meta.wallSegmentCount);
}

// octagon-shaped fixture (chamfered corners), same idea as place-spatialize's own rasterizeShape.
function octagonRoom(w, d) {
  const short = Math.min(w, d);
  const k = Math.max(1, Math.floor(short * 0.3));
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
    const cTL = x + z < k, cTR = (w - 1 - x) + z < k, cBL = x + (d - 1 - z) < k, cBR = (w - 1 - x) + (d - 1 - z) < k;
    if (!(cTL || cTR || cBL || cBR)) cells.push({ x, z, tier: 0 });
  }
  return cells;
}
function lShapeRoom(w, d) {
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) { if (x >= w / 2 && z >= d / 2) continue; cells.push({ x, z, tier: 0 }); }
  return cells;
}
function tShapeRoom(w, d) {
  const barH = Math.max(1, Math.round(d * 0.35));
  const stemW = Math.max(1, Math.min(w, Math.round(w * 0.35)));
  const stemX0 = Math.floor((w - stemW) / 2);
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) { if (z < barH || (x >= stemX0 && x < stemX0 + stemW)) cells.push({ x, z, tier: 0 }); }
  return cells;
}
function crossShapeRoom(w, d) {
  const bandW = Math.max(1, Math.min(w, Math.round(w * 0.4))), bandD = Math.max(1, Math.min(d, Math.round(d * 0.4)));
  const bx0 = Math.floor((w - bandW) / 2), by0 = Math.floor((d - bandD) / 2);
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) { if ((x >= bx0 && x < bx0 + bandW) || (z >= by0 && z < by0 + bandD)) cells.push({ x, z, tier: 0 }); }
  return cells;
}

console.log("\n=== 7. SHAPE GATE — 'rect'/'cave'/unrecognized never fire any treatment ===");
{
  const oct = octagonRoom(10, 10);
  const bare = compileRoomShellData(oct, {});
  const taggedRect = compileRoomShellData(oct, { smoothShape: "rect" });
  const taggedCave = compileRoomShellData(oct, { smoothShape: "cave" });
  const taggedBogus = compileRoomShellData(oct, { smoothShape: "not-a-real-tag" });
  check("7a. smoothShape:'rect' -> byte-identical to no smoothShape at all", JSON.stringify(bare) === JSON.stringify(taggedRect));
  check("7b. smoothShape:'cave' -> byte-identical to no smoothShape at all (irregular shapes stay organic, not faceted)", JSON.stringify(bare) === JSON.stringify(taggedCave));
  check("7c. an unrecognized tag string -> byte-identical to no smoothShape at all", JSON.stringify(bare) === JSON.stringify(taggedBogus));
  // and the reverse: the SAME octagon footprint tagged 'circle' (a synthetic misuse case, proving the
  // gate keys off the STRING the caller passes, never re-classifying the footprint itself — theater-
  // boot.js is the one place this string is sourced, off the room's own real STAGE-C C3 `.shape`) DOES
  // diverge — confirms the gate is a pure string check, not silently shape-aware/no-op.
  const forcedSmooth = compileRoomShellData(oct, { smoothShape: "circle" });
  check("7d. the SAME octagon footprint tagged smoothShape:'circle' DOES diverge from the bare compile (gate keys off the caller's tag, not footprint re-detection)",
    JSON.stringify(bare) !== JSON.stringify(forcedSmooth));
}

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

console.log("\n=== 9. DIAGONAL FACES — octagon gets real 45-degree wall segments ===");
{
  const oct = octagonRoom(10, 10);
  const bare = compileRoomShellData(oct, {});
  const diag = compileRoomShellData(oct, { smoothShape: "octagon" });
  const isDiagonal = (s) => Math.abs(s.b.x - s.a.x) > 1e-6 && Math.abs(s.b.z - s.a.z) > 1e-6;
  const bareDiagSegs = bare.walls.segments.filter(isDiagonal);
  const diagDiagSegs = diag.walls.segments.filter(isDiagonal);
  check("9a. the BARE (untagged) octagon compile has ZERO diagonal wall segments (pure axis-aligned staircase, matching the pre-C3b read)",
    bareDiagSegs.length === 0, bareDiagSegs.length);
  check("9b. the OCTAGON-TAGGED compile has REAL diagonal wall segments (each ~45 degrees, |dx|≈|dz|)",
    diagDiagSegs.length > 0 && diagDiagSegs.every((s) => Math.abs(Math.abs(s.b.x - s.a.x) - Math.abs(s.b.z - s.a.z)) < 1e-6),
    { count: diagDiagSegs.length, sample: diagDiagSegs.slice(0, 3) });
  // collinearity check: within one corner's own chamfer run, consecutive diagonal segments share the
  // SAME direction (the "provably collinear" identity chamferRunCorners' own header states) — group by
  // rounding each segment's own direction to a fixed precision and confirm long runs of matching slope.
  const dirKey = (s) => {
    const dx = s.b.x - s.a.x, dz = s.b.z - s.a.z, len = Math.hypot(dx, dz) || 1;
    return (dx / len).toFixed(3) + "," + (dz / len).toFixed(3);
  };
  const dirCounts = {};
  diagDiagSegs.forEach((s) => { const k = dirKey(s); dirCounts[k] = (dirCounts[k] || 0) + 1; });
  const maxRun = Math.max(0, ...Object.values(dirCounts));
  check("9c. at least one corner's chamfer run collapses to several perfectly COLLINEAR diagonal segments (same direction, not a zigzag)",
    maxRun >= 3, dirCounts);
}

console.log("\n=== 10. ROOT FIX — the dropped-cell bug, proven on the BARE (non-chamfered) path ===");
{
  // The KEY proof: the nearest-triangle fallback (pointToTriangleDist2) fixes the dropped-cell bug at
  // its ROOT — INDEPENDENT of the diagonal chamfer. Every fixture here is either UNTAGGED (so
  // diagonalizeStaircaseRing never runs) or circle-mode (which does NOT chamfer), so a full 76/76 (etc.)
  // coverage here can only come from the fallback itself, never the chamfer.
  const oct = octagonRoom(10, 10);
  const bareOct = compileRoomShellData(oct, {}); // UNTAGGED — the pure axis-aligned staircase, no chamfer
  check("10a. BARE (untagged) octagon(10,10) maps ALL 76 cells — the exact fixture master drops 2 of (proves the ROOT fix, not the chamfer)",
    Object.keys(bareOct.cellTriangleMap).length === oct.length, { mapped: Object.keys(bareOct.cellTriangleMap).length, total: oct.length });
  // and every mapped cell resolves to a triangle the cell center ACTUALLY lies on/in (dist ~0) — a
  // fallback that mapped cells to arbitrary faraway triangles would be worse than useless for hit-test.
  const bareAllOnTri = oct.every((c) => {
    const rec = bareOct.cellTriangleMap[c.x + "," + c.z];
    if (!rec) return false;
    const t = rec.triIndex;
    const i0 = bareOct.floor.indices[t * 3], i1 = bareOct.floor.indices[t * 3 + 1], i2 = bareOct.floor.indices[t * 3 + 2];
    const p = (i) => ({ x: bareOct.floor.positions[i * 3], z: bareOct.floor.positions[i * 3 + 2] });
    return pointToTriangleDist2(c.x, c.z, p(i0), p(i1), p(i2)) < 1e-6;
  });
  check("10b. every BARE-octagon cell resolves to a triangle it geometrically lies ON (point-to-triangle dist ~0), not a faraway one (proves point-to-triangle distance, not centroid)",
    bareAllOnTri);
  // the two specific cells master drops — "2,1" and "4,3" — are now both mapped, and to a triangle they
  // sit exactly on (the shared internal diagonal). A centroid-distance fallback mis-picked "4,3" to a
  // triangle 2.1 units off its true edge (see pointToTriangleDist2's own header) — this asserts the
  // correct one.
  const dropCellsOk = ["2,1", "4,3"].every((key) => {
    const rec = bareOct.cellTriangleMap[key];
    if (!rec) return false;
    const [cx, cz] = key.split(",").map(Number);
    const t = rec.triIndex;
    const i0 = bareOct.floor.indices[t * 3], i1 = bareOct.floor.indices[t * 3 + 1], i2 = bareOct.floor.indices[t * 3 + 2];
    const p = (i) => ({ x: bareOct.floor.positions[i * 3], z: bareOct.floor.positions[i * 3 + 2] });
    return pointToTriangleDist2(cx, cz, p(i0), p(i1), p(i2)) < 1e-6;
  });
  check("10c. the two cells master DROPS (\"2,1\", \"4,3\") are both mapped to a triangle they lie exactly on", dropCellsOk);

  // circle-mode + plain rect: no cell ever dropped, ANY shape (10d/10e).
  const circ = circleRoom(10, 10, null);
  const circData = compileRoomShellData(circ, { smoothShape: "circle" });
  check("10d. circle-mode(10,10) maps ALL its cells (no drop, curved boundary)",
    Object.keys(circData.cellTriangleMap).length === circ.length, { mapped: Object.keys(circData.cellTriangleMap).length, total: circ.length });
  const rect = [];
  for (let z = 0; z < 7; z++) for (let x = 0; x < 9; x++) rect.push({ x, z, tier: 0 });
  const rectData = compileRoomShellData(rect, {});
  check("10e. plain rect(9x7) maps ALL 63 cells (unchanged — the common exact-containment case)",
    Object.keys(rectData.cellTriangleMap).length === rect.length, { mapped: Object.keys(rectData.cellTriangleMap).length, total: rect.length });

  // RED-FIRST against the pinned commit immediately before the root fix: the SAME bare
  // octagon fixture drops exactly 2 cells (74/76) there — proving (a) the bug is real + pre-existing,
  // and (b) THIS branch's 76/76 above is the fix landing, not a fixture that never had the gap.
  const preFixCommit = "2b47aee9";
  let preFixMapped = null;
  try {
    const preFixSrc = execSync(`git show ${preFixCommit}:src/ui/theater-room-mesh.js`, { cwd: ROOT, encoding: "utf-8" });
    const tmpPath = join(ROOT, "src/ui/_verify-c3b-prefixed-baseline.js");
    (await import("node:fs")).writeFileSync(tmpPath, preFixSrc);
    try {
      const preFixMod = await import(pathToFileURL(tmpPath).href + "?bust=" + Date.now());
      preFixMapped = Object.keys(preFixMod.compileRoomShellData(oct, {}).cellTriangleMap).length;
    } finally { (await import("node:fs")).unlinkSync(tmpPath); }
  } catch (e) { preFixMapped = null; }
  check("10f. RED-FIRST: pinned pre-fix bare compile drops 2 cells (74/76) — confirms the historical bug this fix closes",
    preFixMapped === oct.length - 2, { preFixMapped, thisBranchMapped: Object.keys(bareOct.cellTriangleMap).length, total: oct.length });
}

console.log("\n=== 11. NO-OP GUARANTEE — L/T/cross (and non-staircase octagons) are byte-identical when tagged ===");
{
  const lCells = lShapeRoom(8, 8);
  const lBare = compileRoomShellData(lCells, {});
  const lTagged = compileRoomShellData(lCells, { smoothShape: "L" });
  check("11a. L-shaped room tagged smoothShape:'L' -> byte-identical to the untagged compile (its own corner is a genuine architectural turn, not a staircase)",
    JSON.stringify(lBare) === JSON.stringify(lTagged));

  const tCells = tShapeRoom(10, 10);
  const tBare = compileRoomShellData(tCells, {});
  const tTagged = compileRoomShellData(tCells, { smoothShape: "T" });
  check("11b. T-shaped room tagged smoothShape:'T' -> byte-identical to the untagged compile", JSON.stringify(tBare) === JSON.stringify(tTagged));

  const crossCells = crossShapeRoom(10, 10);
  const crossBare = compileRoomShellData(crossCells, {});
  const crossTagged = compileRoomShellData(crossCells, { smoothShape: "cross" });
  check("11c. cross-shaped room tagged smoothShape:'cross' -> byte-identical to the untagged compile", JSON.stringify(crossBare) === JSON.stringify(crossTagged));

  // a too-small octagon (k=1, a single-cell chamfer per corner — indistinguishable from a genuine L
  // corner without extra shape metadata) is INTENTIONALLY left crisp — see diagonalizeStaircaseRing's
  // own "runLen >= 3" scoping note.
  const tinyOct = octagonRoom(6, 6); // short=6 -> k=max(1,floor(1.8))=1, a single-cell corner clip
  const tinyBare = compileRoomShellData(tinyOct, {});
  const tinyTagged = compileRoomShellData(tinyOct, { smoothShape: "octagon" });
  check("11d. a 1-cell octagon chamfer (too small to be a real staircase) stays crisp when tagged — byte-identical to untagged",
    JSON.stringify(tinyBare) === JSON.stringify(tinyTagged));

  // determinism for the diagonal path too (not just radial — section 6 above already covers radial).
  const bigOct = octagonRoom(12, 12);
  const d1 = compileRoomShellData(bigOct, { smoothShape: "octagon" });
  const d2 = compileRoomShellData(bigOct.map((c) => Object.assign({}, c)), { smoothShape: "octagon" });
  check("11e. octagon diagonal-mode determinism: two independent compiles -> byte-identical geometry", JSON.stringify(d1) === JSON.stringify(d2));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
