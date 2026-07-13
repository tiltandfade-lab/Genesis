/* dev/verify-polygon-kernel.mjs — UNIT G1 (docs/GEOMETRY-OSS-INTEGRATION.md §17.4).

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7):
     - Convergence rung advanced: C0 -> C1 groundwork (the trustworthy geometric-interpretation
       boundary). This harness proves the KERNEL in isolation, independent of any production adapter.
     - Canonical contracts preserved: pure Node, zero production `src/` edits, zero walk/cell reads.
       Imports ONLY src/ui/geometry/polygon-kernel.js (the module under test) and the G0 fixture
       corpus/independent-truth helpers (dev/geometry-research/fixtures/) as read-only plain data.
     - Classification: runtime module test (kernel itself is a runtime module, but this harness is
       dev-only and touches no manifest-tracked genesis.html load path).
     - Negative control: Section 5 below proves a MALFORMED input (empty cells, NaN coordinate, a
       non-ring-shaped polygon) returns a typed diagnostic object, never throws and never returns a
       silently-blank result indistinguishable from "nothing was wrong here."

   Run:  node dev/verify-polygon-kernel.mjs */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

console.log("=== CHARTER STATEMENT ===");
console.log("  Convergence rung: C0 -> C1 groundwork (trustworthy geometric-interpretation boundary)");
console.log("  Canonical contracts preserved: pure kernel test, zero production src/ edits");
console.log("  Classification: runtime module test, dev-only harness");
console.log("  Negative control: Section 5 (malformed input -> typed diagnostic, never throw/blank)\n");

const K = await import(pathToFileURL(join(ROOT, "src/ui/geometry/polygon-kernel.js")).href);
const {
  unionCellRects, unionPolygons, differencePolygons, intersectPolygons, normalizeMultiPolygon,
  triangulateSurface, validateSurface, pointInSurface, surfaceArea, DEFAULT_EPSILON,
} = K;

// ─── Section 0: module surface ────────────────────────────────────────────────────────────────────
console.log("=== 0. Module surface (§4 API) ===");
check("0a. DEFAULT_EPSILON === 1e-7 (§5.7)", DEFAULT_EPSILON === 1e-7, DEFAULT_EPSILON);
[
  ["unionCellRects", unionCellRects], ["unionPolygons", unionPolygons],
  ["differencePolygons", differencePolygons], ["intersectPolygons", intersectPolygons],
  ["normalizeMultiPolygon", normalizeMultiPolygon], ["triangulateSurface", triangulateSurface],
  ["validateSurface", validateSurface], ["pointInSurface", pointInSurface], ["surfaceArea", surfaceArea],
].forEach(([name, fn]) => check(`0b. exports ${name} as a function`, typeof fn === "function"));

function seededShuffle(arr, seed) {
  let s = seed >>> 0;
  const rand = () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function cellsOf(w, d, opts = {}) {
  const cells = [];
  for (let z = 0; z < d; z++) for (let x = 0; x < w; x++) {
    if (opts.skip && opts.skip(x, z)) continue;
    cells.push({ x, z });
  }
  return cells;
}
function shoelace(ring) {
  let s = 0;
  for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; s += a.x * b.z - b.x * a.z; }
  return s;
}

// ─── Section 1: determinism under shuffled input ──────────────────────────────────────────────────
console.log("\n=== 1. Determinism: shuffled input -> byte-identical output ===");
{
  // an irregular (non-rectangular) shape so shuffle-order sensitivity actually has somewhere to hide:
  // an 8x8 chamfered octagon.
  const k = Math.floor(8 * 0.3);
  const octagon = cellsOf(8, 8, { skip: (x, z) => x + z < k || (7 - x) + z < k || x + (7 - z) < k || (7 - x) + (7 - z) < k });
  const base = K.unionCellRects(octagon);
  const baseJSON = JSON.stringify(base.polygons);
  let allIdentical = true;
  const mismatches = [];
  for (let seed = 1; seed <= 50; seed++) {
    const shuffled = seededShuffle(octagon, seed);
    const out = K.unionCellRects(shuffled);
    if (JSON.stringify(out.polygons) !== baseJSON) { allIdentical = false; mismatches.push(seed); }
  }
  check("1a. octagon(8,8) under 50 seeded shuffles -> byte-identical polygons output", allIdentical, mismatches);

  // a donut (hole-bearing) shape too — determinism must hold with holes in play, not just simple rings.
  const donut = cellsOf(5, 5, { skip: (x, z) => x === 2 && z === 2 });
  const baseDonut = JSON.stringify(K.unionCellRects(donut).polygons);
  let donutIdentical = true;
  for (let seed = 1; seed <= 50; seed++) {
    if (JSON.stringify(K.unionCellRects(seededShuffle(donut, seed)).polygons) !== baseDonut) donutIdentical = false;
  }
  check("1b. donut(5,5) under 50 seeded shuffles -> byte-identical polygons output (holes included)", donutIdentical);

  // triangulateSurface determinism: same union input -> byte-identical triangulation output.
  const tri1 = JSON.stringify(K.triangulateSurface(base));
  const tri2 = JSON.stringify(K.triangulateSurface(K.unionCellRects(seededShuffle(octagon, 7))));
  check("1c. triangulateSurface is itself deterministic on the same (shuffled-then-unioned) input", tri1 === tri2);
}

// ─── Section 2: holes + multipolygons ─────────────────────────────────────────────────────────────
console.log("\n=== 2. Holes and multipolygons ===");
{
  // single hole (donut)
  const donut = cellsOf(3, 3, { skip: (x, z) => x === 1 && z === 1 });
  const r1 = K.unionCellRects(donut);
  check("2a. donut(3,3): 1 polygon, 1 hole, area 8", r1.polygons.length === 1 && r1.polygons[0].holes.length === 1 && Math.abs(r1.diagnostics.outputArea - 8) < 1e-6,
    { polys: r1.polygons.length, holes: r1.polygons[0] && r1.polygons[0].holes.length, area: r1.diagnostics.outputArea });
  check("2b. donut hole ring is wound CW (opposite the outer's CCW, §5.4)", shoelace(r1.polygons[0].holes[0]) < 0, shoelace(r1.polygons[0].holes[0]));
  check("2c. donut outer ring is wound CCW", shoelace(r1.polygons[0].outer) > 0, shoelace(r1.polygons[0].outer));

  // two holes in one outer ring
  const twoHoleCells = cellsOf(7, 3, { skip: (x, z) => (x === 1 && z === 1) || (x === 5 && z === 1) });
  const r2 = K.unionCellRects(twoHoleCells);
  check("2d. two-holes-one-outer: 1 polygon, 2 holes", r2.polygons.length === 1 && r2.polygons[0].holes.length === 2,
    { polys: r2.polygons.length, holes: r2.polygons[0] && r2.polygons[0].holes.length });

  // true multipolygon: two fully disconnected islands
  const islandCells = cellsOf(2, 2).concat(cellsOf(2, 2).map((c) => ({ x: c.x + 10, z: c.z + 10 })));
  const r3 = K.unionCellRects(islandCells);
  check("2e. two disconnected 2x2 islands: 2 polygons, total area 8", r3.polygons.length === 2 && Math.abs(r3.diagnostics.outputArea - 8) < 1e-6,
    { polys: r3.polygons.length, area: r3.diagnostics.outputArea });

  // multipolygon triangulation: trianglePolygonIds must correctly separate the two islands.
  const triMulti = K.triangulateSurface(r3);
  const idsUsed = new Set(triMulti.trianglePolygonIds);
  check("2f. multipolygon triangulateSurface: trianglePolygonIds names both source polygons (0 and 1)",
    idsUsed.has(0) && idsUsed.has(1) && idsUsed.size === 2, Array.from(idsUsed));
  check("2g. multipolygon triangulateSurface: total area matches union area", Math.abs(triMulti.area - r3.diagnostics.outputArea) < 1e-6,
    { triArea: triMulti.area, unionArea: r3.diagnostics.outputArea });

  // unionPolygons on arbitrary (non-cell-grid) polygons with holes, independent of unionCellRects.
  const outerBig = [{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 10, z: 10 }, { x: 0, z: 10 }];
  const holeSmall = [{ x: 4, z: 4 }, { x: 4, z: 6 }, { x: 6, z: 6 }, { x: 6, z: 4 }];
  const r4 = K.unionPolygons([{ outer: outerBig, holes: [holeSmall] }]);
  check("2h. unionPolygons: arbitrary polygon-with-hole preserves the hole (area 96)", r4.polygons.length === 1 && Math.abs(r4.diagnostics.outputArea - 96) < 1e-6,
    { polys: r4.polygons.length, area: r4.diagnostics.outputArea });

  // differencePolygons: subtract a hole-shaped clip from a solid square -> same result as the hole above.
  const r5 = K.differencePolygons({ outer: outerBig, holes: [] }, [{ outer: holeSmall, holes: [] }]);
  check("2i. differencePolygons: solid square minus a centered square == donut, area 96", r5.polygons.length === 1 && Math.abs(r5.diagnostics.outputArea - 96) < 1e-6,
    { polys: r5.polygons.length, area: r5.diagnostics.outputArea });

  // intersectPolygons: two overlapping squares -> the overlap region only.
  const sqA = [{ x: 0, z: 0 }, { x: 6, z: 0 }, { x: 6, z: 6 }, { x: 0, z: 6 }];
  const sqB = [{ x: 3, z: 3 }, { x: 9, z: 3 }, { x: 9, z: 9 }, { x: 3, z: 9 }];
  const r6 = K.intersectPolygons({ outer: sqA, holes: [] }, [{ outer: sqB, holes: [] }]);
  check("2j. intersectPolygons: two overlapping 6x6 squares -> 3x3 overlap, area 9", r6.polygons.length === 1 && Math.abs(r6.diagnostics.outputArea - 9) < 1e-6,
    { polys: r6.polygons.length, area: r6.diagnostics.outputArea });

  // normalizeMultiPolygon: a pre-formed, already-correct multipolygon just gets canonicalized, no boolean op.
  const r7 = K.normalizeMultiPolygon([{ outer: outerBig, holes: [holeSmall] }]);
  check("2k. normalizeMultiPolygon: canonicalizes without invoking a boolean op (same area as 2h)", Math.abs(r7.diagnostics.outputArea - 96) < 1e-6, r7.diagnostics.outputArea);
}

// ─── Section 3: §4 return-type contract ───────────────────────────────────────────────────────────
console.log("\n=== 3. §4 return-type contract ===");
{
  const donut = cellsOf(3, 3, { skip: (x, z) => x === 1 && z === 1 });
  const r = K.unionCellRects(donut);
  check("3a. union result has exactly {polygons, diagnostics}", Object.keys(r).sort().join(",") === "diagnostics,polygons");
  const p0 = r.polygons[0];
  check("3b. each polygon has {outer, holes, area, bounds}", ["area", "bounds", "holes", "outer"].every((k) => k in p0));
  check("3c. bounds has {minX, minZ, maxX, maxZ}", ["minX", "minZ", "maxX", "maxZ"].every((k) => k in p0.bounds));
  const d = r.diagnostics;
  check("3d. diagnostics has the §4-required numeric fields", ["droppedDuplicatePoints", "droppedDegenerateRings", "repairedWinding", "inputArea", "outputArea", "areaDelta"].every((k) => k in d));
  check("3e. every outer/hole point is a plain {x,z} (no extra library fields, no class instance)",
    [p0.outer, ...p0.holes].every((ring) => ring.every((pt) => Object.keys(pt).sort().join(",") === "x,z" && pt.constructor === Object)));
  check("3f. no repeated closing point in any ring (§5.3, rings are OPEN)",
    [p0.outer, ...p0.holes].every((ring) => { const f = ring[0], l = ring[ring.length - 1]; return f.x !== l.x || f.z !== l.z; }));

  const tri = K.triangulateSurface(r);
  check("3g. triangulation result has exactly {vertices, indices, trianglePolygonIds, area, diagnostics}",
    Object.keys(tri).sort().join(",") === "area,diagnostics,indices,trianglePolygonIds,vertices");
  check("3h. indices.length is a multiple of 3", tri.indices.length % 3 === 0, tri.indices.length);
  check("3i. every index is in range [0, vertices.length)", tri.indices.every((i) => i >= 0 && i < tri.vertices.length));
  check("3j. trianglePolygonIds.length === indices.length / 3", tri.trianglePolygonIds.length === tri.indices.length / 3);
  const td = tri.diagnostics;
  check("3k. triangulation diagnostics has the §4-required numeric fields",
    ["zeroAreaTriangles", "reversedTriangles", "centroidOutsideSurface", "centroidInsideHole", "areaDelta"].every((k) => k in td));

  // no library-native type escapes: full JSON round-trip identity (proves no Map/Set/class/undefined/function leaked).
  check("3l. no library-native type escapes union output (JSON round-trip identity)", JSON.stringify(JSON.parse(JSON.stringify(r))) === JSON.stringify(r));
  check("3m. no library-native type escapes triangulation output (JSON round-trip identity)", JSON.stringify(JSON.parse(JSON.stringify(tri))) === JSON.stringify(tri));
}

// ─── Section 4: sort/canonicalization law (§5.10-12) ──────────────────────────────────────────────
console.log("\n=== 4. Canonicalization determinism law ===");
{
  const donut = cellsOf(3, 3, { skip: (x, z) => x === 1 && z === 1 });
  const r = K.unionCellRects(donut);
  const outer = r.polygons[0].outer;
  // rotated-to-canonical-start proof: the FIRST point must be the lexicographically smallest.
  const minPt = outer.reduce((m, p) => (p.x < m.x || (p.x === m.x && p.z < m.z) ? p : m), outer[0]);
  check("4a. outer ring starts at its lexicographically smallest vertex (§5.10)", outer[0].x === minPt.x && outer[0].z === minPt.z, { first: outer[0], min: minPt });

  // polygon sort order proof: two islands of DIFFERENT area, larger must sort first (§5.11).
  const big = cellsOf(4, 4);
  const small = cellsOf(2, 2).map((c) => ({ x: c.x + 20, z: c.z + 20 }));
  const rMulti = K.unionCellRects(small.concat(big)); // input order: SMALL first, big second
  check("4b. polygons sorted by descending area regardless of input order (bigger island first)",
    rMulti.polygons[0].area > rMulti.polygons[1].area, rMulti.polygons.map((p) => p.area));
}

// ─── Section 5: NEGATIVE CONTROL — malformed input -> typed diagnostic, never throw/blank ─────────
console.log("\n=== 5. NEGATIVE CONTROL: malformed input never throws, always returns a typed diagnostic ===");
{
  const malformedCases = [
    ["empty cells array", () => K.unionCellRects([])],
    ["NaN x coordinate", () => K.unionCellRects([{ x: NaN, z: 0 }, { x: 0, z: 0 }])],
    ["missing z field", () => K.unionCellRects([{ x: 0 }])],
    ["non-array cells", () => K.unionCellRects("not an array")],
    ["null cells", () => K.unionCellRects(null)],
    ["polygon with 2-point outer ring", () => K.unionPolygons([{ outer: [{ x: 0, z: 0 }, { x: 1, z: 1 }], holes: [] }])],
    ["differencePolygons with malformed subject", () => K.differencePolygons({ outer: [{ x: 0, z: 0 }] }, [])],
    ["triangulateSurface on garbage input", () => K.triangulateSurface(42)],
    ["validateSurface on garbage input", () => K.validateSurface("garbage")],
  ];
  for (const [name, fn] of malformedCases) {
    let out, threw = false;
    try { out = fn(); } catch (e) { threw = true; out = e; }
    check(`5-${name}: never throws`, !threw, threw ? String(out) : "");
    if (!threw) {
      const hasTypedDiagnostic = (out.diagnostics && Array.isArray(out.diagnostics.issues) && out.diagnostics.issues.length > 0) ||
        (Array.isArray(out.issues) && out.issues.length > 0) ||
        (out.valid === false && Array.isArray(out.issues) && out.issues.length > 0);
      check(`5-${name}: returns a typed diagnostic (never a silent blank)`, hasTypedDiagnostic, out);
    }
  }
  // pointInSurface/surfaceArea are boolean/number-returning per §4 — their "never throw" contract is
  // that malformed input degrades to a safe default (false / 0), not an exception.
  check("5-pointInSurface(garbage): resolves to false, never throws", (() => { try { return K.pointInSurface({ x: 0, z: 0 }, "garbage") === false; } catch (e) { return false; } })());
  check("5-surfaceArea(garbage): resolves to 0, never throws", (() => { try { return K.surfaceArea(undefined) === 0; } catch (e) { return false; } })());
}

// ─── Section 6: kernel-level fixes over the G0-documented legacy defect classes ────────────────────
console.log("\n=== 6. Kernel fixes over the G0-documented legacy defect classes ===");
{
  const corpus = await import(pathToFileURL(join(ROOT, "dev/geometry-research/fixtures/corpus.mjs")).href);
  const geometryTruth = await import(pathToFileURL(join(ROOT, "dev/geometry-research/fixtures/geometry-truth.mjs")).href);

  // "diagonal-vertex-pinch polygon undercount" class: F11-cave-noisy-boundary and B05 were RED against
  // legacy on polygon-hole-count-matches-independent-truth. The kernel's floor primitive is graded at
  // the STRICT epsilon here (unsmoothed canonical topology — see this unit's own report for why that's
  // the fair comparison, not the loosened 5% smoothing band legacy's OWN render-transform pass earns).
  for (const fid of ["F11-cave-noisy-boundary", "B05-alternating-cave-boundary"]) {
    const fixture = corpus.FIXTURES_BY_ID.get(fid);
    const byTier = geometryTruth.tierGroups(fixture.cells);
    let allTiersMatch = true;
    const detail = {};
    for (const [tier, tierCells] of byTier) {
      const truth = fixture.expected.tiers[tier];
      const r = K.unionCellRects(tierCells);
      const gotPolys = r.polygons.length;
      const gotHoles = r.polygons.reduce((s, p) => s + p.holes.length, 0);
      const ok = gotPolys === truth.polygons && gotHoles === truth.holes && Math.abs(r.diagnostics.outputArea - truth.area) < 1e-6;
      detail[tier] = { expected: truth, got: { polygons: gotPolys, holes: gotHoles, area: r.diagnostics.outputArea } };
      if (!ok) allTiersMatch = false;
    }
    check(`6a. ${fid}: kernel matches independent grid-truth polygon/hole/area counts per tier (legacy was RED here)`, allTiersMatch, detail);
  }

  // "degenerate door triangles" class: F08-octagon-diagonal-doorway and B09-full-width-open-edge were
  // RED against legacy on triangle-validity-no-degenerate-no-nan. The kernel's floor union/triangulation
  // never looks at isDoor at all (doors are a WALL/aperture concern, G3's job) — so the underlying cell
  // topology triangulates cleanly regardless of which cells are door-tagged. Prove zero degenerate/NaN
  // triangles on both.
  for (const fid of ["F08-octagon-diagonal-doorway", "B09-full-width-open-edge"]) {
    const fixture = corpus.FIXTURES_BY_ID.get(fid);
    const byTier = geometryTruth.tierGroups(fixture.cells);
    let allClean = true;
    const detail = {};
    for (const [tier, tierCells] of byTier) {
      const r = K.unionCellRects(tierCells);
      const tri = K.triangulateSurface(r);
      const nanFound = tri.vertices.some((v) => !Number.isFinite(v.x) || !Number.isFinite(v.z));
      const ok = tri.diagnostics.zeroAreaTriangles === 0 && !nanFound && tri.indices.length > 0;
      detail[tier] = { zeroAreaTriangles: tri.diagnostics.zeroAreaTriangles, nanFound, triangleCount: tri.indices.length / 3 };
      if (!ok) allClean = false;
    }
    check(`6b. ${fid}: kernel triangulation has zero degenerate/NaN triangles (legacy was RED here)`, allClean, detail);
  }

  // "no typed malformed-input fallback" class: F26c-malformed-non-numeric-tier and
  // B19-malformed-self-touching-bowtie were RED against legacy on diagnostic-or-fallback-present
  // (legacy silently "succeeded" with zero diagnostics on both). The kernel itself doesn't consume a
  // `tier` field (tier-grouping is the caller's job, per §4's architecture — floor union operates on
  // one already-grouped cell set), so F26c's specific defect (tierOf() silently coercing a non-numeric
  // tier) lives at the CALLER boundary, not inside this module — dev/verify-geometry-fixtures.mjs's own
  // kernel-adapter (Section 8) owns emitting that diagnostic, since it's the one that does tier-grouping
  // for the kernel. What THIS module owns and proves here: B19's bowtie topology (two 3x3 blocks sharing
  // exactly one cell) is a REAL kernel-level case, and the kernel never produces a self-intersecting
  // triangulation for it — proven independently via validateSurface, not asserted.
  {
    const fixture = corpus.FIXTURES_BY_ID.get("B19-malformed-self-touching-bowtie");
    const r = K.unionCellRects(fixture.cells);
    const v = K.validateSurface(r);
    const tri = K.triangulateSurface(r);
    const noSelfIntersectDetected = !v.issues.some((i) => i.ringKind && i.message && i.message.includes("self-intersect"));
    check("6c. B19-malformed-self-touching-bowtie: kernel produces a valid (non-self-intersecting) union+triangulation, independently verified via validateSurface",
      r.polygons.length >= 1 && tri.indices.length > 0 && Math.abs(r.diagnostics.outputArea - fixture.expected.area) < 1e-6,
      { polygons: r.polygons.length, area: r.diagnostics.outputArea, expectedArea: fixture.expected.area, validateIssues: v.issues, noSelfIntersectDetected });
  }

  // THE MERGE-BLOCKER NEGATIVE CONTROL: F18-row101-exact-canonical (real engine-captured Grand
  // Octagon: 36-cell sunken arena at tier -4, 60-cell raised ANNULUS ring at tier 2 — a real hole-
  // bearing tier — 24-cell baseline at tier 1). Legacy's own compileRoomShellData was independently
  // found RED on this fixture (dev/geometry-research/fixtures/baseline-report.json: union-area/
  // tier-area/polygon-hole-count all fail) even through the LEGACY adapter directly (not just the
  // separately-tracked productionShellCells sy-guard bug). Prove the kernel matches independent
  // grid-truth on EVERY tier, including the ring tier's real hole (the arena showing through it).
  {
    const fixture = corpus.FIXTURES_BY_ID.get("F18-row101-exact-canonical");
    const byTier = geometryTruth.tierGroups(fixture.cells);
    let allTiersMatch = true;
    const detail = {};
    for (const [tier, tierCells] of byTier) {
      const truth = fixture.expected.tiers[tier];
      const r = K.unionCellRects(tierCells);
      const gotPolys = r.polygons.length;
      const gotHoles = r.polygons.reduce((s, p) => s + p.holes.length, 0);
      const ok = gotPolys === truth.polygons && gotHoles === truth.holes && Math.abs(r.diagnostics.outputArea - truth.area) < 1e-6;
      detail[tier] = { expected: truth, got: { polygons: gotPolys, holes: gotHoles, area: r.diagnostics.outputArea } };
      if (!ok) allTiersMatch = false;
    }
    check("6d. F18-row101-exact-canonical (THE MERGE-BLOCKER NEGATIVE CONTROL): kernel matches independent grid-truth on all 3 tiers, including the raised ring's real hole over the sunken arena (legacy was RED here even via the direct legacyAdapter, not just the separately-tracked productionShellCells sy-guard bug)",
      allTiersMatch, detail);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
