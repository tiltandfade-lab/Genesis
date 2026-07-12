/* dev/verify-room-shell.mjs — ROOM-SHELL COMPILER (docs/ROOM-SHELL-COMPILER.md), the PURE geometry
   core. Plain-Node ESM harness for src/ui/theater-room-mesh.js's compileRoomShellData (and the small
   named helper functions it's built from) — a real `import` of the production file, same convention
   dev/verify-theater-shot.mjs already established for a THREE-DECOUPLED-CORE sibling module (this
   file DOES also import THREE for its thin BufferGeometry assembler at the bottom, but every function
   this harness actually calls — compileRoomShellData and everything it's built from — never touches
   THREE, so a plain Node import + a require()-able "three" package on disk is enough; no jsdom/Chrome).

   RED-FIRST (checked live against base commit be0d7100, the master tip this unit branched from):
   `git show be0d7100:src/ui/theater-room-mesh.js` -> "fatal: path ... does not exist" — the module
   did not exist before this unit; re-checked live below, not just cited.

   Sections:
     0. RED-FIRST proof.
     1. Rectangular room -> exactly 4 simplified wall segments (not one per cell) — the concrete
        "not a grid" proof at the PURE-geometry layer (dev/verify-room-shell-render.mjs proves the
        analogous claim against the live GL mesh count).
     2. A door aperture survives simplification as its OWN segment (never merged into a neighboring
        wall run) — ⊗ RED-FIRST: a rigged fixture with the door cell moved to a DIFFERENT edge
        position proves the harness tracks the actual door, not a hardcoded index.
     3. Floor triangulation covers the full walkable polygon (planar area sums to the cell count,
        the main body + its own bevel ribbon exactly cancelling out — see the module's own comment).
     4. World-UVs are continuous across two ADJACENT (non-ring-closure) wall segments — the shared
        vertex resolves to the identical `u` from either segment's own quad.
     5. The cell<->triangle map resolves EVERY walkable cell to a real floor triangle (point-in-
        triangle containment, not just "some index exists").
     6. Determinism: the same cells run twice -> byte-identical geometry (JSON deep-equal).
     7. Structural elevation: a 3x3 dais in a 5x5 room produces its own floor tier + exactly 4 riser
        segments (one per side of the square dais), and still resolves all 25 cells.
     8. Negative/edge cases: an irregular (non-rectangular) footprint still traces to a closed,
        correctly-wound (positive-area) simple polygon; a single-cell room degrades without throwing.
     9. check-manifest.py (run live).

   Run:  node dev/verify-room-shell.mjs */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_COMMIT = "be0d7100";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

console.log("=== 0. RED-FIRST proof (re-checked live) ===");
{
  let existedAtBase = true, msg = "";
  try {
    execSync(`git show ${BASE_COMMIT}:src/ui/theater-room-mesh.js`, { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
  } catch (e) {
    existedAtBase = false; msg = String(e.stderr || e.message || "").split("\n")[0];
  }
  check("0a. src/ui/theater-room-mesh.js did NOT exist at base commit " + BASE_COMMIT, !existedAtBase, msg);
}

const mod = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
const {
  compileRoomShellData, traceTierContour, chainEdgesIntoRings, simplifySegments, findSegmentStart,
  ringToPolygon, signedArea2D, ensureCCW, segmentNormal, insetPolygon, pointInTriangle2D,
  triangulatePolygon, ringPerimeterU, buildCellIndex,
} = mod;

check("0b. compileRoomShellData is exported and callable", typeof compileRoomShellData === "function");

// ── fixtures ─────────────────────────────────────────────────────────────────────────────────────
function rectRoom(w, d, doorCell) {
  const cells = [];
  for (let z = 0; z < d; z++) {
    for (let x = 0; x < w; x++) {
      const isDoor = !!(doorCell && doorCell.x === x && doorCell.z === z);
      cells.push({ x, z, tier: 0, isDoor });
    }
  }
  return cells;
}
function triArea2D(p0, p1, p2) {
  return Math.abs((p1[0] - p0[0]) * (p2[2] - p0[2]) - (p2[0] - p0[0]) * (p1[2] - p0[2])) / 2;
}
function planarFloorArea(data) {
  let area = 0;
  for (let t = 0; t < data.floor.indices.length / 3; t++) {
    const i0 = data.floor.indices[t * 3], i1 = data.floor.indices[t * 3 + 1], i2 = data.floor.indices[t * 3 + 2];
    const p = (i) => [data.floor.positions[i * 3], data.floor.positions[i * 3 + 1], data.floor.positions[i * 3 + 2]];
    area += triArea2D(p(i0), p(i1), p(i2));
  }
  return area;
}

console.log("\n=== 1. Rectangular room -> exactly 4 simplified wall segments ===");
{
  const cells = rectRoom(6, 5);
  const data = compileRoomShellData(cells, {});
  check("1a. no-door 6x5 room -> exactly 4 wall segments (not 22 per-cell edges)",
    data.meta.wallSegmentCount === 4, data.meta.wallSegmentCount);
  check("1b. zero riser segments on a single-tier room", data.meta.riserSegmentCount === 0, data.meta.riserSegmentCount);
  check("1c. zero apertures on a doorless room", data.apertures.length === 0, data.apertures.length);
  // scale up: an 18x12 room (216 cells, ~56 perimeter wall CELLS in the old per-cell system) still
  // collapses to exactly 4 segments — segment count is independent of room size (the map-feel proof).
  const big = compileRoomShellData(rectRoom(18, 12), {});
  check("1d. an 18x12 room ALSO collapses to exactly 4 wall segments (segment count independent of room size)",
    big.meta.wallSegmentCount === 4, big.meta.wallSegmentCount);
}

console.log("\n=== 2. Door aperture survives simplification as its own segment ===");
{
  const doorAtStart = compileRoomShellData(rectRoom(6, 5, { x: 2, z: 0 }), {});
  check("2a. one door on the north wall -> 5 wall segments (one wall run split in two) + 1 aperture",
    doorAtStart.meta.wallSegmentCount === 5 && doorAtStart.apertures.length === 1,
    { walls: doorAtStart.meta.wallSegmentCount, apertures: doorAtStart.apertures.length });
  // RED-FIRST: move the door to a DIFFERENT edge (east wall) and confirm the harness tracks the
  // ACTUAL door position, not a hardcoded index/count.
  const doorMoved = compileRoomShellData(rectRoom(6, 5, { x: 5, z: 2 }), {});
  check("2b. door relocated to the east wall -> aperture segment sits on x=5.5 (the east boundary), not the north wall",
    Math.abs(doorMoved.apertures[0].a.x - 5.5) < 1e-6 && Math.abs(doorMoved.apertures[0].b.x - 5.5) < 1e-6,
    doorMoved.apertures[0]);
  check("2c. door segment excluded from the wall quad list (no wall quad spans across the door's own z=2 center)",
    doorMoved.walls.segments.every((s) => {
      if (Math.abs(s.a.x - 5.5) > 1e-6 || Math.abs(s.b.x - 5.5) > 1e-6) return true; // not on the east wall run at all
      const lo = Math.min(s.a.z, s.b.z), hi = Math.max(s.a.z, s.b.z);
      return !(lo <= 2 && hi >= 2); // no solid wall segment covers the door's own center z=2
    }),
    doorMoved.walls.segments);
}

console.log("\n=== 3. Floor triangulation covers the full walkable polygon ===");
{
  const cells = rectRoom(6, 5);
  const data = compileRoomShellData(cells, {});
  const area = planarFloorArea(data);
  check("3a. total floor-surface planar area (main body + bevel ribbon) equals the cell count (30)",
    Math.abs(area - 30) < 1e-6, area);
  const withDoor = compileRoomShellData(rectRoom(6, 5, { x: 2, z: 0 }), {});
  check("3b. area check still holds with a door notch present", Math.abs(planarFloorArea(withDoor) - 30) < 1e-6, planarFloorArea(withDoor));
}

console.log("\n=== 4. World-UVs continuous across two adjacent (non-seam) wall segments ===");
{
  const data = compileRoomShellData(rectRoom(6, 4), {});
  // walk the wall buffer's own quads (4 verts each, in emission order) and check the U value at the
  // END of segment i matches the U at the START of segment i+1 (a real adjacency check, not a
  // position-keyed global grouping — that would also flag the one expected ring-closure seam).
  const w = data.walls;
  const quadCount = w.positions.length / 3 / 4;
  check("4a. exactly 4 wall quads emitted", quadCount === 4, quadCount);
  let continuous = true;
  const detail = [];
  for (let i = 0; i < quadCount - 1; i++) {
    const uEndOfI = w.uvs[(i * 4 + 1) * 2];      // vertex 1 of quad i = the "b" (end) corner, base height
    const uStartOfNext = w.uvs[((i + 1) * 4 + 0) * 2]; // vertex 0 of quad i+1 = its "a" (start) corner
    const ok = Math.abs(uEndOfI - uStartOfNext) < 1e-6;
    detail.push({ i, uEndOfI, uStartOfNext, ok });
    if (!ok) continuous = false;
  }
  check("4b. shared-edge UV continuity holds for every adjacent (non-wraparound) segment pair", continuous, detail);
  // the ONE expected ring-closure seam: last segment's end U != first segment's start U (0) — this is
  // the documented, unavoidable single seam any closed-loop UV unwrap has (module header comment).
  const uEndOfLast = w.uvs[((quadCount - 1) * 4 + 1) * 2];
  check("4c. the ring-closure seam exists exactly once (last segment's end U is the full perimeter length, not wrapped to 0)",
    uEndOfLast > 1e-6 && Math.abs(uEndOfLast - (2 * (6 + 4))) < 1e-6, uEndOfLast);
}

console.log("\n=== 5. Cell<->triangle map resolves every walkable cell ===");
{
  const cells = rectRoom(7, 6, { x: 3, z: 0 });
  const data = compileRoomShellData(cells, {});
  const allResolved = cells.every((c) => {
    const rec = data.cellTriangleMap[c.x + "," + c.z];
    if (!rec) return false;
    const t = rec.triIndex;
    const i0 = data.floor.indices[t * 3], i1 = data.floor.indices[t * 3 + 1], i2 = data.floor.indices[t * 3 + 2];
    const p = (i) => ({ x: data.floor.positions[i * 3], z: data.floor.positions[i * 3 + 2] });
    return pointInTriangle2D(c.x, c.z, p(i0), p(i1), p(i2));
  });
  check("5a. every one of 42 walkable cells resolves to a floor triangle that ACTUALLY contains its center point",
    allResolved, Object.keys(data.cellTriangleMap).length + "/" + cells.length);
}

console.log("\n=== 6. Determinism: same cells twice -> byte-identical geometry ===");
{
  const cells = rectRoom(6, 5, { x: 2, z: 0 });
  const d1 = compileRoomShellData(cells, {});
  const d2 = compileRoomShellData(cells.map((c) => Object.assign({}, c)), {}); // fresh objects, same values
  check("6a. deep-equal across two independent compiles of the same cell set", JSON.stringify(d1) === JSON.stringify(d2));
  // shuffled input ORDER must still produce the identical result (determinism law: no dependence on
  // caller iteration order, which the byTier grouping's own sort guards).
  const shuffled = cells.slice().reverse();
  const d3 = compileRoomShellData(shuffled, {});
  check("6b. deep-equal even when the caller hands cells in reverse order", JSON.stringify(d1) === JSON.stringify(d3));
}

console.log("\n=== 7. Structural elevation: dais tier + risers ===");
{
  const cells = [];
  for (let z = 0; z < 5; z++) {
    for (let x = 0; x < 5; x++) {
      const inDais = x >= 1 && x <= 3 && z >= 1 && z <= 3;
      cells.push({ x, z, tier: inDais ? 1 : 0, elevationY: inDais ? 0.2 : 0 });
    }
  }
  const data = compileRoomShellData(cells, {});
  check("7a. two floor tiers compiled", data.meta.tierCount === 2, data.meta.tierCount);
  check("7b. dais top tier triangulates to nonzero triangles", data.floor.tiers[1].triCount > 0, data.floor.tiers[1]);
  check("7c. exactly 4 riser segments (one per side of the square dais, no duplicate quad)",
    data.meta.riserSegmentCount === 4, data.meta.riserSegmentCount);
  check("7d. every riser segment's height equals the tier gap (0.2)",
    data.risers.segments.every((s) => Math.abs(s.height - 0.2) < 1e-6), data.risers.segments.map((s) => s.height));
  check("7e. all 25 cells (base ring + dais top) resolve in the cell<->triangle map",
    Object.keys(data.cellTriangleMap).length === 25, Object.keys(data.cellTriangleMap).length);
  // VP3 jitter tolerance: per-cell height noise within ITR_STEP_MIN/MAX (0.04-0.08 either side of the
  // 0.2 nominal) must NOT fragment into spurious extra tiers (ROOM_SHELL_TIER_QUANTUM's own header note).
  const jittered = [];
  for (let z = 0; z < 4; z++) for (let x = 0; x < 4; x++) {
    const jitter = ((x * 3 + z * 7) % 5 - 2) * 0.03; // deterministic pseudo-jitter in [-0.06,0.06]
    jittered.push({ x, z, tier: Math.round((0.2 + jitter) / 0.2), elevationY: 0.2 + jitter });
  }
  const jd = compileRoomShellData(jittered, {});
  check("7f. per-cell VP3-style height jitter collapses to a SINGLE tier (no spurious riser fragmentation)",
    jd.meta.tierCount === 1 && jd.meta.riserSegmentCount === 0, jd.meta);
}

console.log("\n=== 8. Negative/edge cases ===");
{
  // an L-shaped (non-rectangular) footprint: a 4x4 block with the top-right 2x2 quadrant removed.
  const lShape = [];
  for (let z = 0; z < 4; z++) for (let x = 0; x < 4; x++) {
    if (x >= 2 && z >= 2) continue; // remove the top-right 2x2 quadrant
    lShape.push({ x, z, tier: 0 });
  }
  const lData = compileRoomShellData(lShape, {});
  check("8a. L-shaped footprint still triangulates (nonzero triangles)", lData.floor.indices.length > 0, lData.floor.indices.length);
  check("8b. L-shaped footprint's cell<->triangle map resolves every one of its 12 cells",
    Object.keys(lData.cellTriangleMap).length === 12, Object.keys(lData.cellTriangleMap).length);
  check("8c. L-shaped footprint area equals its cell count (12)", Math.abs(planarFloorArea(lData) - 12) < 1e-6, planarFloorArea(lData));

  const single = compileRoomShellData([{ x: 0, z: 0, tier: 0 }], {});
  check("8d. single-cell room never throws and produces a valid 1-cell floor", Math.abs(planarFloorArea(single) - 1) < 1e-6, planarFloorArea(single));
  check("8e. empty cell list degrades to empty geometry, never throws", (() => {
    try { const e = compileRoomShellData([], {}); return e.floor.indices.length === 0 && e.meta.floorCellCount === 0; }
    catch (_e) { return false; }
  })());
  // NO CELL EVER DROPPED (STAGE-C3b root fix, 2026-07-12): the cellTriangleMap loop's nearest-triangle
  // fallback (pointToTriangleDist2) guarantees EVERY floor cell resolves, even when its center sits
  // exactly on an internal ear-clip triangulation diagonal (no triangle STRICTLY contains it). A real
  // octagon(10,10) fixture (76 cells) was the concrete repro — its "2,1"/"4,3" cells dropped pre-fix
  // (74/76). This is the untagged/bare compile (NO diagonal chamfer runs), so it proves the fallback
  // itself, not the chamfer.
  const octRing = (() => {
    const w = 10, d = 10, short = 10, k = Math.max(1, Math.floor(short * 0.3)), cells = [];
    for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
      const cTL = x + z < k, cTR = (w - 1 - x) + z < k, cBL = x + (d - 1 - z) < k, cBR = (w - 1 - x) + (d - 1 - z) < k;
      if (!(cTL || cTR || cBL || cBR)) cells.push({ x, z, tier: 0 });
    }
    return cells;
  })();
  const octData = compileRoomShellData(octRing, {});
  check("8f. BARE octagon(10,10): cellTriangleMap resolves ALL 76 cells (nearest-triangle fallback — no cell dropped on an internal diagonal)",
    Object.keys(octData.cellTriangleMap).length === octRing.length,
    { mapped: Object.keys(octData.cellTriangleMap).length, total: octRing.length });
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
  check("9c. ui.theater-room-mesh is registered (no orphan/drift/missing-tag error mentions it)",
    !/theater-room-mesh/.test(out.split("\n").filter((l) => l.includes("ERROR")).join("\n")));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
