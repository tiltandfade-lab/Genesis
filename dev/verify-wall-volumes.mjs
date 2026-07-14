/* dev/verify-wall-volumes.mjs — WALL VOLUME GEOMETRY (docs/WALL-VOLUMES-PRACTICALS.md, Unit C4.1a).
   Plain-Node ESM harness, same convention dev/verify-room-shell.mjs already established for this
   module: a real `import` of src/ui/theater-room-mesh.js's PURE core (compileRoomShellData and the
   small named helpers it's built from — none of which touch THREE), no browser/jsdom needed.

   Checks (spec's own numbering, docs/WALL-VOLUMES-PRACTICALS.md "Verification (C4.1a)"), ⊗ = RED-FIRST
   (each proven to fail against a deliberately old/naive fixture before the real assertion runs green):
     1. ⊗ Thickness exists — inner+outer faces separated by wallThickness along the inward normal.
     2. ⊗ Top cap — a near-horizontal (|ny|>=0.99) cap slab exists spanning inner<->outer with overhang.
     3. ⊗ Footing — a base skirt projects wallFooting past the outer face at y~=0.
     4. Stem/upper separability — distinct bundles, same ownerSegIndex keying.
     5. ⊗ Upper omission — upperVisibleForSegment=()=>false empties wallUpper, wallStem stays intact.
     6. Mount slots — every wall segment yields >=1 inner-face slot; door segments yield ZERO.
     7. Segment-count invariant preserved — a no-door 6x5 room and an 18x12 room both -> 4 wall segments.
     8. Determinism — same cells+opts -> byte-identical buffers across two independent builds.

   Run:  node dev/verify-wall-volumes.mjs */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

const mod = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
const {
  compileRoomShellData, segmentNormal, directionOf,
  DEFAULT_BEVEL_DROP, DEFAULT_WALL_THICKNESS, DEFAULT_WALL_STEM_HEIGHT, DEFAULT_WALL_CAP_HEIGHT,
  DEFAULT_WALL_CAP_OVERHANG, DEFAULT_WALL_FOOTING,
} = mod;
check("0. compileRoomShellData is exported and callable", typeof compileRoomShellData === "function");
// baseY for a simple (non-complex-tier) rect room at tier 0: elevationY(=0) - bevelDrop — the SAME
// `baseY` compileRoomShellData's own wall branch computes; hardcoding 0 here would silently mismatch
// the real geometry by exactly DEFAULT_BEVEL_DROP (this harness's own first-draft bug, caught live).
const BASE_Y = -DEFAULT_BEVEL_DROP;

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

// a NORTH wall segment of a 6x4 room (z=0 edge, a=(-0.5,-0.5)..b=(5.5,-0.5) in the traced boundary —
// exact endpoints don't matter, only that it's a real simplified 'wall' segment) — used to derive n/t
// for the synthetic single-quad RED fixtures below, so the RED proofs test the SAME geometric segment
// the GREEN real-code assertions do, not an unrelated hand-picked line.
function firstWallSegment(data) { return data.walls.segments[0]; }

function nearestVertexDist(positions, target) {
  let best = Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const dx = positions[i] - target.x, dy = positions[i + 1] - target.y, dz = positions[i + 2] - target.z;
    const d = Math.hypot(dx, dy, dz);
    if (d < best) best = d;
  }
  return best;
}
function hasHorizontalTriangle(positions, normals, indices, minNy) {
  for (let t = 0; t < indices.length / 3; t++) {
    const i0 = indices[t * 3];
    if (Math.abs(normals[i0 * 3 + 1]) >= minNy) return true;
  }
  return false;
}

// synthetic "old single-quad wall" fixture — exactly what the pre-C4.1a `.walls` bundle looked like
// (ONE two-triangle plane, inner face only, no outer/cap/footing/end-caps at all) — the concrete RED
// stand-in every ⊗ check below runs its assertion against FIRST, to prove the assertion can actually
// fail, before running the identical assertion against the real compileRoomShellData output.
function syntheticSingleQuadWall(seg, baseY, h) {
  const n = segmentNormal(seg);
  const positions = [
    seg.a.x, baseY, seg.a.z,
    seg.b.x, baseY, seg.b.z,
    seg.b.x, baseY + h, seg.b.z,
    seg.a.x, baseY + h, seg.a.z,
  ];
  const normals = [n.x, 0, n.z, n.x, 0, n.z, n.x, 0, n.z, n.x, 0, n.z];
  const indices = [0, 1, 2, 0, 2, 3];
  return { positions, normals, indices };
}

console.log("\n=== 1. ⊗ Thickness exists — inner+outer faces separated by wallThickness along -n ===");
{
  const cells = rectRoom(6, 4);
  const data = compileRoomShellData(cells, {});
  const seg = firstWallSegment(data);
  const n = segmentNormal(seg);
  const wallThickness = DEFAULT_WALL_THICKNESS;
  const outerTargetFromA = { x: seg.a.x - n.x * wallThickness, y: BASE_Y, z: seg.a.z - n.z * wallThickness };

  // RED: the synthetic single-quad fixture (the pre-C4.1a `.walls` shape) has NO outer face at all —
  // the nearest vertex to the expected outer-offset point is far away (not ~0), so the assertion FAILS.
  const synth = syntheticSingleQuadWall(seg, BASE_Y, DEFAULT_WALL_STEM_HEIGHT);
  const redDist = nearestVertexDist(synth.positions, outerTargetFromA);
  check("1a. ⊗ RED: a synthetic single-quad wall has NO vertex at the inner-minus-thickness outer offset",
    redDist > 0.05, redDist);

  // GREEN: the real wallStem bundle DOES carry a vertex at exactly that offset (the outer face).
  const greenDist = nearestVertexDist(data.wallStem.positions, outerTargetFromA);
  check("1b. GREEN: wallStem has a real outer-face vertex at innerA - n*wallThickness",
    greenDist < 1e-6, greenDist);

  // and the SAME holds for every other wall segment, not just segment 0 (a general property, not a
  // one-segment coincidence).
  const allSegsHaveOuter = data.walls.segments.every((s) => {
    const sn = segmentNormal(s);
    const target = { x: s.a.x - sn.x * wallThickness, y: BASE_Y, z: s.a.z - sn.z * wallThickness };
    return nearestVertexDist(data.wallStem.positions, target) < 1e-6;
  });
  check("1c. every wall segment's own stem carries a matching outer-face vertex", allSegsHaveOuter);
}

console.log("\n=== 2. ⊗ Top cap — near-horizontal cap slab spans inner<->outer with capOverhang ===");
{
  const cells = rectRoom(6, 4);
  const data = compileRoomShellData(cells, {});
  const seg = firstWallSegment(data);

  // RED: the synthetic single-quad wall's own (only) triangle set has a purely VERTICAL normal
  // (|ny|=0, a plain wall plane) — no near-horizontal (|ny|>=0.99) triangle exists at all.
  const synth = syntheticSingleQuadWall(seg, BASE_Y, DEFAULT_WALL_STEM_HEIGHT);
  check("2a. ⊗ RED: the synthetic single-quad wall has NO near-horizontal (|ny|>=0.99) triangle",
    !hasHorizontalTriangle(synth.positions, synth.normals, synth.indices, 0.99));

  // GREEN: the real wallStem bundle's own top-cap face IS a near-horizontal triangle set.
  check("2b. GREEN: wallStem carries a real near-horizontal (|ny|>=0.99) cap triangle",
    hasHorizontalTriangle(data.wallStem.positions, data.wallStem.normals, data.wallStem.indices, 0.99));

  // the visible upper (default all-visible) gets its OWN top cap too, at the full wall height.
  check("2c. GREEN: wallUpper (default all-visible) also carries a real near-horizontal cap triangle",
    hasHorizontalTriangle(data.wallUpper.positions, data.wallUpper.normals, data.wallUpper.indices, 0.99));

  // the cap genuinely overhangs both faces (capOverhang > 0): some cap-band vertex (y within
  // [stemHeight, stemHeight+capHeight]) sits FARTHER from the segment's own inner line than the plain
  // inner-face verts do, by roughly the capOverhang distance.
  const n = segmentNormal(seg);
  const capInnerTarget = {
    x: seg.a.x + n.x * DEFAULT_WALL_CAP_OVERHANG,
    y: BASE_Y + DEFAULT_WALL_STEM_HEIGHT + DEFAULT_WALL_CAP_HEIGHT,
    z: seg.a.z + n.z * DEFAULT_WALL_CAP_OVERHANG,
  };
  check("2d. cap slab overhangs INWARD past the plain inner face by ~capOverhang",
    nearestVertexDist(data.wallStem.positions, capInnerTarget) < 1e-6);
}

console.log("\n=== 3. ⊗ Footing — a base skirt projects wallFooting past the outer face at y~=0 ===");
{
  const cells = rectRoom(6, 4);
  const data = compileRoomShellData(cells, {});
  const seg = firstWallSegment(data);
  const n = segmentNormal(seg);
  const wallThickness = DEFAULT_WALL_THICKNESS, wallFooting = DEFAULT_WALL_FOOTING;
  const outerTarget = { x: seg.a.x - n.x * wallThickness, y: BASE_Y, z: seg.a.z - n.z * wallThickness };
  const footingTarget = { x: outerTarget.x - n.x * wallFooting, y: BASE_Y, z: outerTarget.z - n.z * wallFooting };

  // RED: the synthetic single-quad wall has no outer face, so certainly no footing skirt past it.
  const synth = syntheticSingleQuadWall(seg, BASE_Y, DEFAULT_WALL_STEM_HEIGHT);
  check("3a. ⊗ RED: the synthetic single-quad wall has NO vertex at the footing offset",
    nearestVertexDist(synth.positions, footingTarget) > 0.05);

  // GREEN: the real wallStem bundle's own footing skirt DOES carry a vertex there.
  check("3b. GREEN: wallStem's own footing skirt has a vertex wallFooting past the outer face, y~=0",
    nearestVertexDist(data.wallStem.positions, footingTarget) < 1e-6);

  // the upper band never re-foots itself (footing is a STEM-only base-course concept).
  check("3c. wallUpper carries NO footing-offset vertex (footing is stem-only)",
    nearestVertexDist(data.wallUpper.positions, footingTarget) > 0.01);
}

console.log("\n=== 4. Stem/upper separability ===");
{
  const cells = rectRoom(6, 4, { x: 2, z: 0 });
  const data = compileRoomShellData(cells, {});
  check("4a. wallStem and wallUpper are distinct bundles (different object identity, different arrays)",
    data.wallStem !== data.wallUpper && data.wallStem.positions !== data.wallUpper.positions);
  const stemOwners = new Set(data.wallStem.segments.map((s) => s.ownerSegIndex));
  const upperOwners = new Set(data.wallUpper.segments.map((s) => s.ownerSegIndex));
  const legacyWallCount = data.walls.segments.length;
  check("4b. every one of the " + legacyWallCount + " wall segments appears in wallStem.segments",
    data.walls.segments.every((_, i) => stemOwners.has(i)), Array.from(stemOwners));
  check("4c. (default all-visible) every wall segment ALSO appears in wallUpper.segments",
    data.walls.segments.every((_, i) => upperOwners.has(i)), Array.from(upperOwners));
  check("4d. ownerSegIndex is the shared key — wallStem.segments and wallUpper.segments reference the SAME index space",
    JSON.stringify(Array.from(stemOwners).sort()) === JSON.stringify(Array.from(upperOwners).sort()));
}

console.log("\n=== 5. ⊗ Upper omission — upperVisibleForSegment=()=>false empties wallUpper ===");
{
  const cells = rectRoom(6, 4);
  const allVisible = compileRoomShellData(cells, {}); // default: () => true

  // RED: naively asserting "wallUpper is empty" against the DEFAULT (all-visible) build fails — proves
  // the check is a real, falsifiable claim and not a tautology.
  check("5a. ⊗ RED: the DEFAULT (all-visible) build's wallUpper is NOT empty — proves 5b is a real test",
    allVisible.wallUpper.segments.length > 0, allVisible.wallUpper.segments.length);

  // GREEN: with the predicate forced false for every segment, wallUpper truly empties out while
  // wallStem (cap included) stays fully intact.
  const noneVisible = compileRoomShellData(cells, { upperVisibleForSegment: () => false });
  check("5b. GREEN: upperVisibleForSegment=()=>false -> wallUpper.segments is EMPTY",
    noneVisible.wallUpper.segments.length === 0, noneVisible.wallUpper.segments.length);
  check("5c. GREEN: wallStem stays fully intact (same segment count) regardless of upper visibility",
    noneVisible.wallStem.segments.length === allVisible.wallStem.segments.length);
  check("5d. GREEN: wallStem's own cap survives too (top-cap triangle still present)",
    hasHorizontalTriangle(noneVisible.wallStem.positions, noneVisible.wallStem.normals, noneVisible.wallStem.indices, 0.99));

  // a MIXED predicate (only the north-side segments hidden) hides exactly the targeted subset, not
  // an all-or-nothing toggle.
  const mixed = compileRoomShellData(cells, {
    upperVisibleForSegment: (segMeta) => segMeta.mid.z > 0, // hide only the z<0 (north) run
  });
  check("5e. a per-segment predicate hides only the targeted segments (partial omission, not all-or-nothing)",
    mixed.wallUpper.segments.length > 0 && mixed.wallUpper.segments.length < mixed.wallStem.segments.length,
    { upper: mixed.wallUpper.segments.length, stem: mixed.wallStem.segments.length });
}

console.log("\n=== 6. Mount slots — every wall segment yields >=1 inner-face slot; doors yield ZERO ===");
{
  const cells = rectRoom(6, 4, { x: 2, z: 0 });
  const data = compileRoomShellData(cells, {});
  const wallSegCount = data.walls.segments.length;
  check("6a. mountSlots has >=1 entry per wall segment (" + wallSegCount + " segments)",
    data.mountSlots.length >= wallSegCount, data.mountSlots.length);
  const bySeg = new Map();
  data.mountSlots.forEach((slot) => {
    if (!bySeg.has(slot.ownerSegIndex)) bySeg.set(slot.ownerSegIndex, []);
    bySeg.get(slot.ownerSegIndex).push(slot);
  });
  check("6b. every wall segment index owns at least one slot",
    data.walls.segments.every((_, i) => bySeg.has(i) && bySeg.get(i).length >= 1));
  const normalsMatch = data.walls.segments.every((seg, i) => {
    const n = segmentNormal(seg);
    return bySeg.get(i).every((slot) => Math.abs(slot.normal.x - n.x) < 1e-6 && Math.abs(slot.normal.z - n.z) < 1e-6);
  });
  check("6c. every slot's own normal equals its owning segment's segmentNormal (inward)", normalsMatch);
  const onInnerPlane = data.walls.segments.every((seg, i) => {
    return bySeg.get(i).every((slot) => {
      // the slot's worldPos (x,z) must lie ON the segment's own a->b line (the inner face plane).
      const dx = seg.b.x - seg.a.x, dz = seg.b.z - seg.a.z;
      const len2 = dx * dx + dz * dz || 1;
      const t = ((slot.worldPos.x - seg.a.x) * dx + (slot.worldPos.z - seg.a.z) * dz) / len2;
      const projX = seg.a.x + t * dx, projZ = seg.a.z + t * dz;
      return Math.hypot(slot.worldPos.x - projX, slot.worldPos.z - projZ) < 1e-6;
    });
  });
  check("6d. every slot's own worldPos (x,z) sits ON the segment's inner-face line", onInnerPlane);

  // door segments yield ZERO mount slots — no ownerSegIndex in mountSlots ever points at a door.
  check("6e. exactly one door aperture present in this fixture (sanity)", data.apertures.length === 1, data.apertures.length);
  // a door contributes NO wall segment at all (kind:"door" skips the wall branch entirely, see
  // compileRoomShellData's own door branch) — so there is no ownerSegIndex to even check against; the
  // real assertion is that mountSlots.length never exceeds wall-segment count with door slots mixed in
  // (i.e., mountSlots count == sum of exactly 1 per wall segment here, no extras from the door).
  check("6f. mountSlots count equals exactly 1 per wall segment (no extra door-sourced slots)",
    data.mountSlots.length === wallSegCount, { mountSlots: data.mountSlots.length, wallSegCount });
}

console.log("\n=== 7. Segment-count invariant preserved (C4/C3b collapse logic untouched) ===");
{
  const small = compileRoomShellData(rectRoom(6, 5), {});
  check("7a. no-door 6x5 room -> exactly 4 wall segments", small.meta.wallSegmentCount === 4, small.meta.wallSegmentCount);
  const big = compileRoomShellData(rectRoom(18, 12), {});
  check("7b. 18x12 room ALSO -> exactly 4 wall segments (size-independent)", big.meta.wallSegmentCount === 4, big.meta.wallSegmentCount);
  // and the wall-VOLUME bundles track the SAME invariant (not just the legacy segment metadata).
  check("7c. wallStem.segments count matches meta.wallSegmentCount for both fixtures",
    small.wallStem.segments.length === 4 && big.wallStem.segments.length === 4,
    { small: small.wallStem.segments.length, big: big.wallStem.segments.length });
}

console.log("\n=== 8. Determinism — same cells+opts -> byte-identical buffers across two builds ===");
{
  const cells = rectRoom(6, 5, { x: 2, z: 0 });
  const d1 = compileRoomShellData(cells, {});
  const d2 = compileRoomShellData(cells.map((c) => Object.assign({}, c)), {});
  check("8a. wallStem byte-identical across two independent compiles",
    JSON.stringify(d1.wallStem) === JSON.stringify(d2.wallStem));
  check("8b. wallUpper byte-identical across two independent compiles",
    JSON.stringify(d1.wallUpper) === JSON.stringify(d2.wallUpper));
  check("8c. wallTrim byte-identical across two independent compiles",
    JSON.stringify(d1.wallTrim) === JSON.stringify(d2.wallTrim));
  check("8d. mountSlots byte-identical across two independent compiles",
    JSON.stringify(d1.mountSlots) === JSON.stringify(d2.mountSlots));
  // shuffled caller order must still produce the identical result (the module's own determinism law).
  const shuffled = cells.slice().reverse();
  const d3 = compileRoomShellData(shuffled, {});
  check("8e. wallStem byte-identical even with caller cells in reverse order",
    JSON.stringify(d1.wallStem) === JSON.stringify(d3.wallStem));
  check("8f. mountSlots byte-identical even with caller cells in reverse order",
    JSON.stringify(d1.mountSlots) === JSON.stringify(d3.mountSlots));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
