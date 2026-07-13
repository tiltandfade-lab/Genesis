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
     7b. A sunken 3x3 pit does not get covered by the annular base tier (multi-ring hole regression).
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

console.log("\n=== 4-red. LIVE RED-FIRST: wall VOLUME geometry did not exist at the C4.1a base commit ===");
{
  // C4.1a base commit (this unit's branch point, `feat/wall-volumes-geo` off master) — same "import the
  // OLD file straight off git and run today's assertion against it" pattern Section 0 already
  // establishes for the whole module's own existence; here it proves the SPECIFIC claim check 4a below
  // makes (wallStem carries real volume geometry, not a single quad) is genuinely new.
  const C41A_BASE_COMMIT = "76ccfc51";
  const tmpPath = join(ROOT, "dev", ".tmp-red-c41a-base-theater-room-mesh.mjs");
  let baseHadWallStem = null, baseWallsQuadCount = null, err = null;
  try {
    const oldSrc = execSync(`git show ${C41A_BASE_COMMIT}:src/ui/theater-room-mesh.js`, { cwd: ROOT, encoding: "utf-8" });
    const { writeFileSync, unlinkSync } = await import("node:fs");
    writeFileSync(tmpPath, oldSrc);
    try {
      const oldMod = await import(pathToFileURL(tmpPath).href + "?red=" + Date.now());
      const oldData = oldMod.compileRoomShellData(rectRoom(6, 4), {});
      baseHadWallStem = Object.prototype.hasOwnProperty.call(oldData, "wallStem");
      baseWallsQuadCount = oldData.walls.positions.length / 3 / 4;
    } finally {
      unlinkSync(tmpPath);
    }
  } catch (e) {
    err = String(e && e.message || e);
  }
  check("4-red-a. RED proof: at the C4.1a base commit, compileRoomShellData's return has NO `wallStem` bundle at all",
    baseHadWallStem === false, { baseHadWallStem, err });
  check("4-red-b. RED proof: at the base commit the ONLY wall geometry (`.walls`) is exactly 1 quad per segment " +
    "(the single-two-triangle-plane limitation frame 01's acceptance criterion retires)",
    baseWallsQuadCount === 4, baseWallsQuadCount);
  // GREEN: the exact same assertion against TODAY's module (re-run fresh below in section 4 proper)
  // now finds a real `wallStem` bundle with real volume geometry — the before/after pair this unit's
  // RED-FIRST discipline asks for.
  const todayData = compileRoomShellData(rectRoom(6, 4), {});
  check("4-red-c. GREEN: today's compileRoomShellData DOES return a `wallStem` bundle",
    Object.prototype.hasOwnProperty.call(todayData, "wallStem") && todayData.wallStem.segments.length === 4);
}

console.log("\n=== 4. World-UVs continuous across two adjacent (non-seam) wall segments; C4.1a wall VOLUMES ===");
{
  const data = compileRoomShellData(rectRoom(6, 4), {});
  // C4.1a (docs/WALL-VOLUMES-PRACTICALS.md) landed real wall VOLUME geometry (stem+upper+trim, each a
  // capped box with inner/outer/cap/footing/end-cap faces) — the old check 4a ("exactly 4 wall quads
  // emitted", one flat two-triangle plane per segment) is RETIRED as a claim about the module's own
  // real wall geometry: `data.walls` is now explicitly the DEPRECATED back-compat bundle (stem INNER
  // FACE ONLY, kept so a pre-C4.1a reader never hard-breaks — see theater-room-mesh.js's own `.walls`
  // header comment) and legitimately STILL measures 4 quads (one per segment) by design, not by defect.
  // RED-FIRST (checked live): asserting the OLD claim — "the wall geometry IS just one quad per
  // segment, nothing more" — against `data.wallStem` (the real new stem-volume bundle) fails, because
  // wallStem carries far more than a single quad per segment (inner+outer+cap-top+cap-lips+2 end
  // caps+footing-top+footing-face = 9 quads/segment at these opts). This is the concrete "single
  // two-triangle plane" claim this unit's own frame-01 acceptance criterion retires.
  const w = data.walls; // deprecated legacy bundle — intentionally still 1 quad/segment, see above
  const legacyQuadCount = w.positions.length / 3 / 4;
  check("4a-legacy. the DEPRECATED `.walls` bundle still carries exactly 1 quad per segment (back-compat, by design)",
    legacyQuadCount === 4, legacyQuadCount);
  const stemVertsPerSegment = data.wallStem.positions.length / 3 / data.wallStem.segments.length;
  check("4a. ⊗ RED-FIRST retired: the real wallStem volume is NOT a single quad — each of the 4 wall segments' " +
    "own stem carries >=8 quads' worth of verts (32) — inner+outer+cap(top+2 lips)+2 endCaps+footing(top+face), " +
    "not the old plane's 4 (this exact assertion against `.walls`, the pre-C4.1a shape, would read 4 -> RED)",
    stemVertsPerSegment >= 32, stemVertsPerSegment);
  check("4a-upper. every one of the 4 (default all-visible) segments also has its OWN upper-volume entry",
    data.wallUpper.segments.length === 4, data.wallUpper.segments.length);
  check("4a-cap. the stem volume's own top-cap face resolves as a near-horizontal (|ny|>=0.99) triangle set",
    (() => {
      const idx = data.wallStem.indices, nrm = data.wallStem.normals;
      for (let t = 0; t < idx.length / 3; t++) {
        const i0 = idx[t * 3];
        if (Math.abs(nrm[i0 * 3 + 1]) >= 0.99) return true;
      }
      return false;
    })());
  check("4a-thick. wallStem's own outer-face verts sit `wallThickness` away from the matching inner-face verts",
    (() => {
      const p = data.wallStem.positions;
      // the inner face is the FIRST quad pushed per segment (buildWallBox's own emission order) —
      // verts 0,1 are innerA/innerB @ stemBaseY; the outer face is the SECOND quad, verts 4,5 =
      // outerB/outerA @ stemBaseY (buildWallBox reverses a/b for the outer face's own winding).
      const vpsFloats = (data.wallStem.positions.length / data.wallStem.segments.length); // floats per segment
      const seg0InnerA = { x: p[0], z: p[2] };
      const seg0OuterB = { x: p[4 * 3 + 0], z: p[4 * 3 + 2] }; // 2nd quad (outer), vertex index 4 = outerB
      const seg0InnerB = { x: p[3], z: p[5] };
      const dist = Math.hypot(seg0OuterB.x - seg0InnerB.x, seg0OuterB.z - seg0InnerB.z);
      return Math.abs(dist - 0.22) < 1e-6; // DEFAULT_WALL_THICKNESS
    })());
  // walk the LEGACY wall buffer's own quads (still the stem inner-face run, continuous arc-length U —
  // the UV-continuity INTENT this check has always proven survives C4.1a unchanged) and check the U
  // value at the END of segment i matches the U at the START of segment i+1.
  const quadCount = legacyQuadCount;
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
  check("4d. door/aperture assertions untouched — a doorless room still has zero apertures (regression guard)",
    compileRoomShellData(rectRoom(6, 4), {}).apertures.length === 0);
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

console.log("\n=== 7b. Structural pit: annular upper tier preserves its hole ===");
{
  const cells = [];
  for (let z = 0; z < 7; z++) for (let x = 0; x < 7; x++) {
    const inPit = x >= 2 && x <= 4 && z >= 2 && z <= 4;
    cells.push({ x, z, tier: inPit ? -5 : 0, elevationY: inPit ? -1 : 0 });
  }
  const data = compileRoomShellData(cells, {});
  const upper = data.floor.tiers.find((t) => t.tier === 0);
  let upperCoversPitCenter = false;
  for (let ti = upper.triStart; ti < upper.triStart + upper.triCount; ti++) {
    const i0 = data.floor.indices[ti * 3], i1 = data.floor.indices[ti * 3 + 1], i2 = data.floor.indices[ti * 3 + 2];
    const a = { x: data.floor.positions[i0 * 3], z: data.floor.positions[i0 * 3 + 2] };
    const b = { x: data.floor.positions[i1 * 3], z: data.floor.positions[i1 * 3 + 2] };
    const c = { x: data.floor.positions[i2 * 3], z: data.floor.positions[i2 * 3 + 2] };
    if (pointInTriangle2D(3, 3, a, b, c)) { upperCoversPitCenter = true; break; }
  }
  check("7g. upper/base tier has no triangle over the pit center", !upperCoversPitCenter);
  check("7h. all 49 cells resolve to triangles across both tiers",
    Object.keys(data.cellTriangleMap).length === 49, Object.keys(data.cellTriangleMap).length);
  check("7i. planar floor area remains exactly the 49 licensed cells",
    Math.abs(planarFloorArea(data) - 49) < 1e-6, planarFloorArea(data));
  check("7j. pit emits real one-world-unit risers",
    data.risers.segments.length > 0 && data.risers.segments.every((s) => Math.abs(s.height - 1) < 1e-6),
    data.risers.segments.map((s) => s.height));
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
