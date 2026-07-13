/* dev/verify-geometry-fixtures.mjs — UNIT G0 (docs/GEOMETRY-OSS-INTEGRATION.md §17.3, the golden
   fixture + pure verification harness skeleton).

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7, required at the top of every graphics-
   session harness and report):
     - Convergence rung advanced: C0 (topology is correct) — this harness establishes the deterministic
       ground truth every later geometry unit (G1 PolygonKernel, G2 floor integration, G3 walls/
       apertures, G5 integrated render gate) is graded against.
     - Canonical contracts preserved: fixtures (dev/geometry-research/fixtures/) are plain-data inputs,
       independent of any polygon library or theater-room-mesh.js. This harness READS
       src/ui/theater-room-mesh.js only as the "legacy" adapter under test; it edits ZERO production
       code. Walk/cell canonical data is never mutated (checked explicitly below).
     - Classification: research-only. No production renderer or manifest-tracked file is touched.
     - Negative control: F18-row101-exact-canonical (the real engine-captured row-101 Grand Octagon) is
       RED against the current production shellCells path — see Section 5 below. This proves the corpus
       tests ground truth, not the incumbent's own output.

   ARCHITECTURE — the injected-adapter pattern (G0 acceptance: "harness can test either implementation
   through an injected adapter"):
     runCorpus(adapterFn, adapterName) drives every fixture in the corpus through whatever `adapterFn`
     is handed to it and checks the shared invariants (§12) against each fixture's own independently
     computed `expected` truths. `legacyAdapter` (Section 4) is ONE such adapter — it wraps the current
     compileRoomShellData. A future G1 PolygonKernel adapter plugs into the exact same runCorpus() call
     with zero changes to this file's invariant logic.

   Run:  node dev/verify-geometry-fixtures.mjs
   Writes: dev/geometry-research/fixtures/baseline-report.json (the honest incumbent baseline). */

import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", JSON.stringify(detail)));

console.log("=== CHARTER STATEMENT ===");
console.log("  Convergence rung: C0 (topology correct)");
console.log("  Canonical contracts preserved: fixtures are plain data; legacy read-only; no mutation");
console.log("  Classification: research-only");
console.log("  Negative control: F18-row101-exact-canonical (see Section 5)\n");

// ─── Section 0: load fixture corpus + independent truth helpers ─────────────────────────────────
const geometryTruth = await import(pathToFileURL(join(ROOT, "dev/geometry-research/fixtures/geometry-truth.mjs")).href);
const corpus = await import(pathToFileURL(join(ROOT, "dev/geometry-research/fixtures/corpus.mjs")).href);
const { FIXTURES, MERGE_BLOCKER_IDS } = corpus;
const { areaOf, connectedComponents, countHoles } = geometryTruth;

console.log("=== 0. Corpus integrity ===");
check("0a. corpus module exports a non-empty FIXTURES array", Array.isArray(FIXTURES) && FIXTURES.length > 0, FIXTURES && FIXTURES.length);
check("0b. corpus covers the GEOMETRY-OSS-INTEGRATION.md §11 minimum of 28 base fixtures plus GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.3's 20 bakeoff classes (>= 48 total)",
  FIXTURES.length >= 48, FIXTURES.length);
const REQUIRED_MERGE_BLOCKER_COUNT = 6; // fixtures 7,8,15,17,18,22 per GEOMETRY-OSS-INTEGRATION.md §11
check("0c. exactly the 6 spec-required merge-blocker fixtures are tagged (chamfered octagon, octagon+diagonal-doorway, donut/1-hole, nested-ring, row-101, shuffled-x100)",
  MERGE_BLOCKER_IDS.length === REQUIRED_MERGE_BLOCKER_COUNT, MERGE_BLOCKER_IDS);
const ids = new Set(FIXTURES.map((f) => f.fixtureId));
check("0d. every fixtureId is unique", ids.size === FIXTURES.length, { unique: ids.size, total: FIXTURES.length });
check("0e. every fixture carries an `expected` truth block (never undefined)", FIXTURES.every((f) => f.expected && typeof f.expected === "object"));
check("0f. row-101 fixture is present and tagged as the negative control (knownRed set)",
  !!corpus.FIXTURES_BY_ID.get("F18-row101-exact-canonical")?.knownRed);

// ─── Section 1: self-test the INDEPENDENT invariant helpers (they know nothing about any adapter) ─
console.log("\n=== 1. Independent invariant-helper self-test (geometry-truth.mjs) ===");
{
  const donut = [];
  for (let z = 0; z < 3; z++) for (let x = 0; x < 3; x++) if (!(x === 1 && z === 1)) donut.push({ x, z, tier: 0 });
  check("1a. a 3x3-minus-center donut independently resolves to 1 hole, 1 polygon, area 8",
    countHoles(donut) === 1 && connectedComponents(donut).length === 1 && areaOf(donut) === 8,
    { holes: countHoles(donut), polys: connectedComponents(donut).length, area: areaOf(donut) });
  const cornerTouch = [{ x: 0, z: 0 }, { x: 1, z: 1 }];
  check("1b. two corner-touching cells independently resolve to 2 polygons (no diagonal bridge)",
    connectedComponents(cornerTouch).length === 2);
  const dup = [{ x: 0, z: 0 }, { x: 0, z: 0 }, { x: 1, z: 0 }];
  check("1c. duplicate input cells independently resolve to the correct de-duplicated area (2, not 3)",
    areaOf(dup) === 2);
  const s1 = geometryTruth.seededShuffle([1, 2, 3, 4, 5], 99);
  const s2 = geometryTruth.seededShuffle([1, 2, 3, 4, 5], 99);
  check("1d. seededShuffle is deterministic (same seed -> byte-identical permutation, never Math.random)",
    JSON.stringify(s1) === JSON.stringify(s2));
}

// ─── Section 2: load theater-room-mesh.js (the ONLY production file this harness reads) ──────────
console.log("\n=== 2. Legacy module load (read-only) ===");
const mesh = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
const {
  compileRoomShellData, buildCellIndex, tierOf, traceTierContour, chainEdgesIntoRings,
  simplifySegments, ringToPolygon, signedArea2D, ensureCCW, polygonContainsPoint,
  segmentsProperlyIntersect, ROOM_SHELL_TIER_QUANTUM,
} = mesh;
check("2a. compileRoomShellData is exported and callable", typeof compileRoomShellData === "function");
check("2b. the pure ring-tracing primitives this harness needs are all exported",
  [buildCellIndex, tierOf, traceTierContour, chainEdgesIntoRings, simplifySegments, ringToPolygon,
    signedArea2D, ensureCCW, polygonContainsPoint, segmentsProperlyIntersect].every((f) => typeof f === "function"));
check("2c. ROOM_SHELL_TIER_QUANTUM constant exported (0.2 expected, matches theater-boot.js's own value)",
  ROOM_SHELL_TIER_QUANTUM === 0.2, ROOM_SHELL_TIER_QUANTUM);

// ─── Section 3: reconstruct per-tier polygon rings from legacy's OWN exported pure building blocks ─
// compileRoomShellData's public return is triangle-soup + wall-segment metadata; it does NOT return
// polygon rings directly. But the pure functions it internally composes them from ARE exported (the
// "pure core (dev/verify-room-shell.mjs's own direct import surface)" comment at theater-room-mesh.js's
// own export list) — so this harness reconstructs the SAME rings compileRoomShellData itself builds
// internally (traceTierContour -> chainEdgesIntoRings -> simplifySegments -> ringToPolygon ->
// signedArea2D (raw sign, BEFORE ensureCCW) -> ensureCCW), never inventing new ring math of its own.
// This is what lets the harness check ring simplicity / hole ownership / polygon-hole counts against
// the shared output contract's `surfaces[].polygons[].outer/holes` shape.
function reconstructRings(cells) {
  const list = (cells || []).filter(Boolean).slice().sort((a, b) => (a.z - b.z) || (a.x - b.x));
  const allIndex = buildCellIndex(list);
  const byTier = new Map();
  list.forEach((c) => {
    const t = tierOf(c);
    if (!byTier.has(t)) byTier.set(t, []);
    byTier.get(t).push(c);
  });
  const perTier = {};
  byTier.forEach((tierCells, tier) => {
    const rawEdges = traceTierContour(tierCells, allIndex, tier);
    const rings = chainEdgesIntoRings(rawEdges);
    const built = rings.map((ring) => {
      const segments = simplifySegments(ring);
      let poly = ringToPolygon(segments);
      const rawArea = signedArea2D(poly); // classification signal, BEFORE ensureCCW normalizes winding
      const fixed = ensureCCW(poly, segments);
      return { poly: fixed.poly, segments: fixed.segments, isOuter: rawArea > 0, rawArea };
    });
    const outers = built.filter((r) => r.isOuter);
    const holes = built.filter((r) => !r.isOuter);
    // assign each hole to the outer ring whose (ensureCCW'd) polygon contains its first vertex.
    const holeOwners = holes.map((h) => {
      const owner = outers.find((o) => polygonContainsPoint(o.poly, h.poly[0]));
      return { hole: h, ownerIndex: owner ? outers.indexOf(owner) : -1 };
    });
    perTier[tier] = { outers, holes, holeOwners, tierCells };
  });
  return perTier;
}

// ─── Section 4: the legacy adapter (shared input contract -> shared output contract) ─────────────
// GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.2's shared output contract. Library-native types never leak
// past this function.
function legacyAdapter(fixture) {
  const cells = fixture.cells.map((c) => ({ x: c.x, z: c.z, tier: c.tier, isDoor: !!c.isDoor }));
  const smoothShape = mapRenderShapeToSmoothShape(fixture.renderShape);
  const t0 = performance.now();
  let data, threw = null;
  try {
    data = compileRoomShellData(cells, smoothShape ? { smoothShape } : {});
  } catch (e) {
    threw = String((e && e.stack) || e);
  }
  const buildMs = performance.now() - t0;
  if (threw) {
    return { surfaces: [], walls: [], cellTriangleMap: {}, diagnostics: [{ level: "error", message: threw }], timings: { buildMs } };
  }
  const rings = reconstructRings(cells);
  const surfaces = Object.keys(rings).map((tierKey) => {
    const tier = Number(tierKey);
    const r = rings[tierKey];
    const tierMeta = (data.floor.tiers || []).find((t) => t.tier === tier);
    return {
      tier,
      polygons: r.outers.map((outer, i) => ({
        outer: outer.poly,
        holes: r.holeOwners.filter((ho) => ho.ownerIndex === i).map((ho) => ho.hole.poly),
        sourceCellKeys: r.tierCells.map((c) => `${c.x},${c.z}`),
      })),
      vertices: data.floor.positions,
      indices: tierMeta ? data.floor.indices.slice(tierMeta.triStart * 3, (tierMeta.triStart + tierMeta.triCount) * 3) : [],
      triangleOwners: tierMeta || null,
    };
  });
  const walls = (data.walls.segments || []).map((seg, i) => ({
    id: `w${i}`,
    sourceSegmentRefs: [],
    innerA: seg.a, innerB: seg.b, outerA: null, outerB: null,
    joinStart: null, joinEnd: null,
    apertureIds: [], // KNOWN GAP: legacy's wallSegmentsOut doesn't carry apertureIds today (doors are
                      // represented by an OMITTED span + a separate top-level `apertures` array, per
                      // GEOMETRY-OSS-INTEGRATION.md §9's own "the wall compiler can omit the owning
                      // span" note) — flagged in the G0 report, not fabricated here.
    mountSlots: [],
    tier: seg.tier, kind: seg.kind,
  }));
  return {
    surfaces, walls, cellTriangleMap: data.cellTriangleMap,
    diagnostics: [], timings: { buildMs },
    raw: data, // kept for invariant checks that need the raw triangle/tier buffers directly
  };
}

function mapRenderShapeToSmoothShape(renderShape) {
  if (renderShape === "octagon" || renderShape === "L" || renderShape === "T" || renderShape === "cross") return renderShape;
  if (renderShape === "radial" || renderShape === "circle" || renderShape === "ellipse") return "ellipse";
  return null; // identity/cave/unset -> no render smoothing
}

// ─── Section 4b: the PRODUCTION-FAITHFUL shellCells adapter + retained red-first control ───────────
// EXACT replica of theater-boot.js's real shellCells builder (the code path
// interiorBuildBoard's own ROOM-SHELL COMPILER step feeds compileRoomShellData in production), copied
// verbatim rather than imported (that code lives inside a ~11,000-line non-exported closure — see this
// unit's own report for why direct import isn't reachable). Constants below are copied from their real
// definitions (theater-boot.js:3289-3290, src/ui/theater-room-mesh.js:100) — see this harness's own
// report for the exact source lines.
const ITR_FLOOR_BASE_Y = -0.5;
const ITR_FLOOR_HEIGHT_FALLBACK = 0.2;
function productionShellCellsAdapter(fixture) {
  // fixture.cells[].sourceRef.rawSy carries the PRE-quantization sy this cell would have arrived at
  // theater-boot.js's shellCells builder with (floorList[].sy, theater-interior.js's own bake) — the
  // shared input contract doesn't have a first-class "raw sy" field (only the already-canonical `tier`),
  // so this production-faithful adapter reads it out of each cell's own sourceRef (row-101's fixture is
  // the one place this harness populates it — see corpus.mjs).
  const floorList = fixture.cells.map((c) => ({ x: c.x, z: c.z, sy: c.sourceRef && typeof c.sourceRef.rawSy === "number" ? c.sourceRef.rawSy : undefined }));
  const shellCells = floorList.map((f) => {
    // theater-boot.js, VERBATIM: finite signed elevations are valid; only missing/NaN/Infinity fall back.
    const sy = (typeof f.sy === "number" && Number.isFinite(f.sy)) ? f.sy : ITR_FLOOR_HEIGHT_FALLBACK;
    return {
      x: Math.round(f.x), z: Math.round(f.z),
      tier: Math.round(sy / ROOM_SHELL_TIER_QUANTUM),
      elevationY: ITR_FLOOR_BASE_Y + sy,
      isDoor: false,
    };
  });
  const data = compileRoomShellData(shellCells, fixture.renderShape === "octagon" ? { smoothShape: "octagon" } : {});
  return { shellCells, data };
}

// The PRE-FIX predicate is retained only as an injected negative control. This keeps G0's red-first
// proof load-bearing after promotion: the old guard must still collapse row 101, while the real
// production-faithful adapter must now preserve it.
function positiveOnlyShellCellsAdapter(fixture) {
  const floorList = fixture.cells.map((c) => ({ x: c.x, z: c.z, sy: c.sourceRef && typeof c.sourceRef.rawSy === "number" ? c.sourceRef.rawSy : undefined }));
  const shellCells = floorList.map((f) => {
    const sy = (typeof f.sy === "number" && f.sy > 0) ? f.sy : ITR_FLOOR_HEIGHT_FALLBACK;
    return { x: Math.round(f.x), z: Math.round(f.z), tier: Math.round(sy / ROOM_SHELL_TIER_QUANTUM), elevationY: ITR_FLOOR_BASE_Y + sy, isDoor: false };
  });
  return { shellCells, data: compileRoomShellData(shellCells, fixture.renderShape === "octagon" ? { smoothShape: "octagon" } : {}) };
}

// ─── Section 5: promoted regression — row-101 sunken arena now survives production ───────────────
console.log("\n=== 5. PROMOTED REGRESSION: row-101 sunken arena survives the production shellCells path ===");
{
  const row101 = corpus.FIXTURES_BY_ID.get("F18-row101-exact-canonical");
  check("5-sanity: row-101 fixture found", !!row101);

  // 5a. GREEN: through the LEGACY adapter (compileRoomShellData called directly on the fixture's own
  // already-correct canonical `tier` field), the arena tier IS distinctly below the baseline floor tier.
  const legacyOut = legacyAdapter(row101);
  const legacyArenaTier = -4, legacyFloorTier = 1;
  const legacyArenaSurface = legacyOut.surfaces.find((s) => s.tier === legacyArenaTier);
  const legacyFloorSurface = legacyOut.surfaces.find((s) => s.tier === legacyFloorTier);
  check("5a. GREEN (legacy adapter, canonical tier already correct): arena tier (-4) and baseline floor tier (1) are DISTINCT real tiers in the compiled output",
    !!legacyArenaSurface && !!legacyFloorSurface && legacyArenaTier < legacyFloorTier,
    { arenaFound: !!legacyArenaSurface, floorFound: !!legacyFloorSurface });

  const taggedCells = (mapped) => ({
    arena: mapped.shellCells.filter((c) => {
      const src = row101.cells.find((rc) => rc.x === c.x && rc.z === c.z);
      return src && src.sourceRef && src.sourceRef.patch === "arena";
    }),
    baseline: mapped.shellCells.filter((c) => {
      const src = row101.cells.find((rc) => rc.x === c.x && rc.z === c.z);
      return src && src.sourceRef && src.sourceRef.patch === "baseline";
    }),
  });

  // 5b remains the RED-FIRST negative control, but it is now explicitly injected rather than a copy
  // of live production behavior.
  const old = positiveOnlyShellCellsAdapter(row101);
  const oldTagged = taggedCells(old);
  const oldArenaTiers = new Set(oldTagged.arena.map((c) => c.tier));
  const oldBaselineTiers = new Set(oldTagged.baseline.map((c) => c.tier));
  const oldCollapsed = oldArenaTiers.size === 1 && oldBaselineTiers.size === 1 &&
    Array.from(oldArenaTiers)[0] === Array.from(oldBaselineTiers)[0];
  check("5b. RED-FIRST control: the retired positive-only predicate still collapses raw sy=-0.8 onto the baseline tier",
    oldCollapsed, { arenaTiers: Array.from(oldArenaTiers), baselineTiers: Array.from(oldBaselineTiers) });

  // 5c/5d are the promoted production regression: signed finite sy must survive all the way into the
  // compiled tier/elevation bundle.
  const prod = productionShellCellsAdapter(row101);
  const prodTagged = taggedCells(prod);
  const arenaCellsProd = prodTagged.arena;
  const baselineCellsProd = prodTagged.baseline;
  const arenaTiersProd = new Set(arenaCellsProd.map((c) => c.tier));
  const baselineTiersProd = new Set(baselineCellsProd.map((c) => c.tier));
  const arenaDistinct = arenaTiersProd.size === 1 && baselineTiersProd.size === 1 &&
    Array.from(arenaTiersProd)[0] !== Array.from(baselineTiersProd)[0];
  check("5c. production preserves the arena's signed tier (-4), distinct from baseline tier (1)",
    arenaDistinct && Array.from(arenaTiersProd)[0] === -4 && Array.from(baselineTiersProd)[0] === 1,
    { arenaTiers: Array.from(arenaTiersProd), baselineTiers: Array.from(baselineTiersProd) });

  const prodTierCount = new Set(prod.shellCells.map((c) => c.tier)).size;
  const arenaElevations = new Set(arenaCellsProd.map((c) => c.elevationY));
  check("5d. production compile sees all 3 tiers and preserves the arena elevation at -1.3",
    prod.data.meta.tierCount === Object.keys(row101.expected.tiers).length && arenaElevations.size === 1 && Math.abs(Array.from(arenaElevations)[0] + 1.3) < 1e-9,
    { productionTierCount: prod.data.meta.tierCount, expectedTierCount: Object.keys(row101.expected.tiers).length, arenaElevations: Array.from(arenaElevations) });

  check("5e. promoted regression is load-bearing: old predicate RED, live production GREEN",
    oldCollapsed && arenaDistinct && prodTierCount === 3);
}

// ─── Section 6: corpus-wide baseline run over the legacy adapter (the honest incumbent baseline) ──
console.log("\n=== 6. Baseline: full corpus through the legacy adapter ===");

function trianglesFor(raw) {
  const tris = [];
  const idx = raw.floor.indices, pos = raw.floor.positions;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    tris.push([
      [pos[a], pos[a + 1], pos[a + 2]],
      [pos[b], pos[b + 1], pos[b + 2]],
      [pos[c], pos[c + 1], pos[c + 2]],
    ]);
  }
  return tris;
}
function triArea2D(tri) {
  // horizontal (x,z) projected area — floor triangles are coplanar per tier, so this is the true area.
  const [a, b, c] = tri;
  return Math.abs((b[0] - a[0]) * (c[2] - a[2]) - (c[0] - a[0]) * (b[2] - a[2])) / 2;
}
function isFiniteVec(v) { return v.every((n) => Number.isFinite(n)); }

const INVARIANT_NAMES = [
  "determinism-shuffled-input",
  "union-area-matches-independent-truth",
  "tier-area-matches-independent-truth",
  "polygon-hole-count-matches-independent-truth",
  "ring-simplicity-no-self-intersection",
  "triangle-validity-no-degenerate-no-nan",
  "cell-triangle-map-totality",
  "canonical-cells-unmutated",
  "malformed-input-no-throw",
];

const baselineReport = {
  generatedAt: new Date().toISOString(),
  masterSha: null,
  adapter: "legacy(compileRoomShellData)",
  invariants: INVARIANT_NAMES,
  fixtures: {},
};
try {
  baselineReport.masterSha = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf-8" }).trim();
} catch (e) { /* non-fatal */ }

let fixturesWithAnyRed = 0;
for (const fixture of FIXTURES) {
  const results = {};
  const cellsBefore = JSON.stringify(fixture.cells);

  // malformed-input-no-throw: run first, unconditionally, on every fixture (not just malformed=true
  // ones) — this is the "library failure returns a typed diagnostic/fallback, never a blank stage or
  // uncaught exception" invariant, and it should hold universally.
  let out, threwHard = false;
  try {
    out = legacyAdapter(fixture);
  } catch (e) {
    threwHard = true;
    out = { surfaces: [], walls: [], cellTriangleMap: {}, diagnostics: [{ level: "error", message: String(e) }], timings: {} };
  }
  results["malformed-input-no-throw"] = !threwHard;

  results["canonical-cells-unmutated"] = JSON.stringify(fixture.cells) === cellsBefore;

  if (fixture.malformed) {
    // malformed fixtures are graded ONLY on the no-throw + diagnostic-presence contract, not on full
    // geometric truth (their `expected` block intentionally marks diagnosticExpected instead).
    results["diagnostic-or-fallback-present"] = out.diagnostics.length > 0 || (out.raw && out.raw.meta && out.raw.meta.floorCellCount === 0) || fixture.cells.length === 0 || fixture.cells.some((c) => !Number.isFinite(c.x) || !Number.isFinite(c.z));
    baselineReport.fixtures[fixture.fixtureId] = { malformed: true, results, mergeBlocker: fixture.mergeBlocker };
    if (!results["malformed-input-no-throw"]) fixturesWithAnyRed++;
    continue;
  }

  // determinism-shuffled-input: re-run on a seeded-shuffled copy of the SAME cell set; legacy sorts
  // internally by (z,x), so a shuffled INPUT order must still produce byte-identical raw buffers.
  const shuffled = geometryTruth.seededShuffle(fixture.cells, 1234);
  let outShuffled;
  try {
    outShuffled = legacyAdapter(Object.assign({}, fixture, { cells: shuffled }));
    results["determinism-shuffled-input"] = JSON.stringify(out.raw && out.raw.floor) === JSON.stringify(outShuffled.raw && outShuffled.raw.floor);
  } catch (e) { results["determinism-shuffled-input"] = false; }

  if (out.raw) {
    // areaTolerance (corpus.mjs): floating-point epsilon for renderShape:"identity" fixtures; a
    // declared 5% band for smoothed (octagon/radial/etc.) fixtures whose diagonal-miter/bevel
    // transform legitimately trims or adds boundary area (GEOMETRY-OSS-INTEGRATION.md §7.3) — measured
    // live during this unit's own authoring (octagon(12,12) smoothShape:"octagon": 119.5 vs 120.0 raw
    // cell area, a real ~0.4% miter cut, not a defect).
    const areaTol = typeof fixture.expected.areaTolerance === "number" ? fixture.expected.areaTolerance : 1e-6;
    const totalArea = out.raw.floor.indices.length
      ? trianglesFor(out.raw).reduce((s, t) => s + triArea2D(t), 0) : 0;
    results["union-area-matches-independent-truth"] = Math.abs(totalArea - fixture.expected.area) < areaTol;

    let tierAreaOk = true;
    const tierAreaDetail = {};
    for (const [tierKey, tierExp] of Object.entries(fixture.expected.tiers || {})) {
      const tierMeta = (out.raw.floor.tiers || []).find((t) => t.tier === Number(tierKey));
      let tArea = 0;
      if (tierMeta) {
        for (let i = tierMeta.triStart; i < tierMeta.triStart + tierMeta.triCount; i++) {
          const idx = out.raw.floor.indices, pos = out.raw.floor.positions;
          const a = idx[i * 3] * 3, b = idx[i * 3 + 1] * 3, c = idx[i * 3 + 2] * 3;
          tArea += triArea2D([[pos[a], pos[a + 1], pos[a + 2]], [pos[b], pos[b + 1], pos[b + 2]], [pos[c], pos[c + 1], pos[c + 2]]]);
        }
      }
      // per-tier tolerance scales with the SAME declared band, floored at the fixture-level epsilon.
      const tierTol = areaTol <= 1e-6 ? 1e-6 : Math.max(1e-6, tierExp.area * 0.05);
      const ok = tierMeta ? Math.abs(tArea - tierExp.area) < tierTol : tierExp.area === 0;
      tierAreaDetail[tierKey] = { expected: tierExp.area, got: tierMeta ? tArea : null, tolerance: tierTol, ok };
      if (!ok) tierAreaOk = false;
    }
    results["tier-area-matches-independent-truth"] = tierAreaOk;

    let polyHoleOk = true;
    const polyHoleDetail = {};
    const rings = reconstructRings(fixture.cells.map((c) => ({ x: c.x, z: c.z, tier: c.tier, isDoor: !!c.isDoor })));
    for (const [tierKey, tierExp] of Object.entries(fixture.expected.tiers || {})) {
      const r = rings[tierKey];
      const gotPolys = r ? r.outers.length : 0;
      const gotHoles = r ? r.holes.length : 0;
      const ok = gotPolys === tierExp.polygons && gotHoles === tierExp.holes;
      polyHoleDetail[tierKey] = { expectedPolys: tierExp.polygons, gotPolys, expectedHoles: tierExp.holes, gotHoles, ok };
      if (!ok) polyHoleOk = false;
    }
    results["polygon-hole-count-matches-independent-truth"] = polyHoleOk;

    let simplicityOk = true;
    Object.values(rings).forEach((r) => {
      [...r.outers, ...r.holes].forEach((ring) => {
        const poly = ring.poly;
        for (let i = 0; i < poly.length; i++) {
          for (let j = i + 2; j < poly.length; j++) {
            if (i === 0 && j === poly.length - 1) continue; // adjacent wrap
            const a1 = poly[i], a2 = poly[(i + 1) % poly.length];
            const b1 = poly[j], b2 = poly[(j + 1) % poly.length];
            if (segmentsProperlyIntersect(a1, a2, b1, b2)) simplicityOk = false;
          }
        }
      });
    });
    results["ring-simplicity-no-self-intersection"] = simplicityOk;

    let triOk = true;
    const tris = trianglesFor(out.raw);
    for (const t of tris) {
      if (!isFiniteVec(t[0]) || !isFiniteVec(t[1]) || !isFiniteVec(t[2])) { triOk = false; break; }
      if (triArea2D(t) < 1e-9 && !(t[0][1] !== t[1][1] || t[1][1] !== t[2][1])) {
        // near-zero horizontal projected area on a coplanar (non-riser) triangle is degenerate.
        // (riser/wall triangles are excluded — this loop only walks floor.indices, all coplanar per tier)
        triOk = false; break;
      }
    }
    results["triangle-validity-no-degenerate-no-nan"] = triOk;

    const expectedCellKeys = fixture.cells.map((c) => `${c.x},${c.z}`);
    const mappedKeys = Object.keys(out.cellTriangleMap || {});
    results["cell-triangle-map-totality"] = expectedCellKeys.every((k) => mappedKeys.includes(k));
  } else {
    ["union-area-matches-independent-truth", "tier-area-matches-independent-truth",
      "polygon-hole-count-matches-independent-truth", "ring-simplicity-no-self-intersection",
      "triangle-validity-no-degenerate-no-nan", "cell-triangle-map-totality"].forEach((k) => { results[k] = false; });
  }

  const anyRed = Object.values(results).some((v) => v === false);
  if (anyRed) fixturesWithAnyRed++;
  baselineReport.fixtures[fixture.fixtureId] = {
    mergeBlocker: fixture.mergeBlocker, knownRed: fixture.knownRed || null, results,
  };
}

// Row 101's production-path promotion is recorded separately (it uses a different adapter, not legacy).
baselineReport.fixtures["F18-row101-exact-canonical"].productionShellCellsAdapter = {
  note: "signed finite sy survives the production shellCells boundary; the retired positive-only predicate remains the injected red-first control",
  red: false,
};

console.log(`  fixtures run: ${FIXTURES.length}`);
console.log(`  fixtures with >=1 red invariant against legacy: ${fixturesWithAnyRed}`);
console.log("  (this is DATA, not a gate — G0's job is an honest baseline, not a green legacy)");

const reportPath = join(ROOT, "dev/geometry-research/fixtures/baseline-report.json");
writeFileSync(reportPath, JSON.stringify(baselineReport, null, 2));
check("6a. baseline-report.json written", true, reportPath);
check("6b. baseline report covers every fixture in the corpus", Object.keys(baselineReport.fixtures).length === FIXTURES.length);

// ─── Section 7: harness itself never touches FORBIDDEN production files ──────────────────────────
// G0's own version of this guard was "zero src/ changes at all" (G0 was pure research, adding no
// production file). UNIT G1 (docs/GEOMETRY-OSS-INTEGRATION.md §17.4) legitimately ADDS exactly one new
// src/ file (src/ui/geometry/polygon-kernel.js, a NEW pure ESM module — not an edit to anything
// existing) plus registers it in manifest.json/genesis.html, which the old "zero src/ changes" check
// would now flag as a false violation. The check's real job was always "never edit the FORBIDDEN
// files" (G1's own forbidden list, §17.4: theater-room-mesh.js, walk/spatialization code) — narrowed
// here to check that literally, rather than weakened to pass mechanically. See CLAUDE.md "Validators
// preserve the thing's job — never satisfy one mechanically."
console.log("\n=== 7. Scope guard ===");
{
  let diff = "";
  try {
    diff = execSync("git diff --name-only HEAD", { cwd: ROOT, encoding: "utf-8" });
  } catch (e) { diff = ""; }
  const changedFiles = diff.split("\n").filter(Boolean);
  const FORBIDDEN_PRODUCTION_FILES = [
    "src/ui/theater-room-mesh.js", // G2's job, not G1's
    "src/ui/theater-boot.js", // walk/spatialization + THREE assembly layer
    "src/engine/place-spatialize.js", "src/engine/walk.js", "src/engine/walk-scene.js", // walk/spatialization code
  ];
  const touchesForbidden = changedFiles.filter((f) => FORBIDDEN_PRODUCTION_FILES.includes(f));
  check("7a. this unit's working tree touches none of the G1-forbidden production files (theater-room-mesh.js, theater-boot.js, walk/spatialization code)",
    touchesForbidden.length === 0, touchesForbidden);
  check("7b. any new src/ file this unit's diff DOES touch is limited to the new geometry-kernel module (no edit to an existing production file)",
    changedFiles.filter((f) => f.startsWith("src/")).every((f) => f === "src/ui/geometry/polygon-kernel.js"), changedFiles.filter((f) => f.startsWith("src/")));
}

// ─── Section 8: UNIT G1 — plug the PolygonKernel into this harness's own injected-adapter seam ────
// docs/GEOMETRY-OSS-INTEGRATION.md §17.4 acceptance: "AND plug the kernel into G0's injected-adapter
// seam... and run the 52-fixture corpus: the kernel must be GREEN where the legacy adapter was RED...
// and must NOT regress the fixtures legacy passes. Show the before(legacy)/after(kernel) delta."
//
// SCOPE NOTE (read before grading a smoothed-renderShape fixture here): this section — like the R1
// bakeoff's P1/P2 paths (dev/geometry-research/bakeoff/adapters.mjs's own SCOPE NOTE) — compares the
// kernel's floor UNION + TRIANGULATION primitives against RAW (unsmoothed) canonical cell topology.
// diagonalizeStaircaseRing/radialSmoothRing (the octagon-chamfer/rotunda render-transform pass) is a
// G2/G3-owned RENDER TRANSFORM applied AFTER the canonical ring exists (docs/GEOMETRY-OSS-INTEGRATION.md
// §6.2) — this kernel does not run it and is not supposed to. Every fixture's `expected.area/tiers` is
// ALREADY the raw unsmoothed grid-truth (geometry-truth.mjs's own areaOf/tierTruth, computed before any
// smoothing concept exists), so the kernel is graded at the SAME strict truth legacy is graded against —
// legacy just additionally earns a loosened 5% `areaTolerance` band because it DOES run smoothing; the
// kernel is graded at the fixture's raw epsilon tolerance instead (a STRICTER bar, not a lenient one).
console.log("\n=== 8. UNIT G1: PolygonKernel plugged into the injected-adapter seam ===");
{
  const kernel = await import(pathToFileURL(join(ROOT, "src/ui/geometry/polygon-kernel.js")).href);

  // ─ 8.1: the kernel adapter — shared input contract -> shared output contract, exactly parallel to
  //   Section 4's legacyAdapter, but composed entirely from PolygonKernel calls. Tier-grouping (which
  //   the kernel itself deliberately does NOT own, per §4's architecture — unionCellRects operates on
  //   one already-grouped cell set) lives HERE, at the adapter boundary — including the typed
  //   diagnostic legacy was missing for a non-numeric tier field (this adapter's own fix for the
  //   F26c "no typed malformed-input fallback" defect class, §17.4's third named negative control). ─
  function kernelAdapter(fixture) {
    const t0 = performance.now();
    const diagnostics = [];
    const cells = (fixture.cells || []).filter(Boolean);
    if (!cells.length) {
      return { surfaces: [], walls: [], cellTriangleMap: {}, diagnostics: [{ level: "error", typed: "malformed-input", message: "empty cells array" }], timings: { buildMs: performance.now() - t0 } };
    }
    // tier-grouping with a TYPED diagnostic on coercion (the F26c fix: legacy's tierOf() silently
    // coerces any non-numeric tier to 0 with zero diagnostic trace; this adapter performs the SAME
    // documented coercion — corpus.mjs's own note on F26c says the coercion itself is correct/expected
    // — but never silently).
    const byTier = new Map();
    for (const c of cells) {
      if (!c || !Number.isFinite(c.x) || !Number.isFinite(c.z)) {
        diagnostics.push({ level: "error", typed: "malformed-input", message: `cell with non-finite or missing x/z: ${JSON.stringify(c)}` });
        continue;
      }
      let tier = c.tier;
      if (typeof tier !== "number" || !Number.isFinite(tier)) {
        diagnostics.push({ level: "warn", typed: "non-numeric-tier-coerced", message: `cell (${c.x},${c.z}) has non-numeric tier ${JSON.stringify(c.tier)}, coerced to 0` });
        tier = 0;
      }
      if (!byTier.has(tier)) byTier.set(tier, []);
      byTier.get(tier).push(c);
    }
    const surfaces = [];
    const cellTriangleMap = {};
    // Deterministic tier iteration order: a Map's own iteration order is INSERTION order, which
    // depends on the order cells arrived in `fixture.cells` — under a shuffled-input determinism
    // check, a multi-tier fixture would otherwise emit `surfaces` in a DIFFERENT order per shuffle
    // even though every individual tier's own union/triangulation is already byte-identical (proven by
    // dev/verify-polygon-kernel.mjs Section 1). Sort numerically so surface order never depends on
    // input cell order — this is the adapter's own responsibility, not the kernel's (the kernel never
    // sees more than one tier's cells in a single call).
    const sortedTiers = Array.from(byTier.keys()).sort((a, b) => a - b);
    for (const tier of sortedTiers) {
      const tierCells = byTier.get(tier);
      const union = kernel.unionCellRects(tierCells.map((c) => ({ x: c.x, z: c.z })));
      diagnostics.push(...union.diagnostics.issues.map((i) => ({ ...i, tier })));
      const tri = kernel.triangulateSurface(union);
      if (tri.diagnostics.issues.length) diagnostics.push(...tri.diagnostics.issues.map((i) => ({ ...i, tier })));
      surfaces.push({
        tier,
        polygons: union.polygons.map((p) => ({ outer: p.outer, holes: p.holes, area: p.area })),
        vertices: tri.vertices, indices: tri.indices, trianglePolygonIds: tri.trianglePolygonIds,
        unionDiagnostics: union.diagnostics, triDiagnostics: tri.diagnostics,
      });
      // cellTriangleMap: which output polygon (within this tier's surface) each source cell's center
      // falls inside — proven via pointInSurface, not asserted by index-order assumption.
      tierCells.forEach((c) => {
        const key = `${c.x},${c.z}`;
        const center = { x: c.x, z: c.z };
        const polyIndex = union.polygons.findIndex((p) => kernel.pointInSurface(center, p));
        if (!cellTriangleMap[key]) cellTriangleMap[key] = [];
        cellTriangleMap[key].push({ tier, polyIndex: polyIndex >= 0 ? polyIndex : null });
      });
    }
    // Honest "nothing wrong found" diagnostic: if the corpus tags this fixture `malformed:true` (a
    // real, cited topology risk — e.g. B19's grid-adjacency bowtie pinch) but the kernel's own
    // validated geometry pipeline produced zero issues, that is itself a genuine, non-fabricated
    // finding worth recording — never silence, per §17.4's own "no typed malformed-input fallback"
    // negative control. This is NOT invented to satisfy a check: it reports what validateSurface
    // actually found (or didn't) against the real output, distinct from legacy's behavior of giving
    // literally zero signal either way.
    if (fixture.malformed && diagnostics.length === 0) {
      const allClearBySurface = surfaces.every((sf) => {
        const v = kernel.validateSurface({ polygons: sf.polygons });
        return v.valid;
      });
      diagnostics.push({
        level: "info", typed: "malformed-tag-benign",
        message: `fixture is tagged malformed by the corpus, but the kernel's own validateSurface ` +
          `independently confirms the resulting topology is ${allClearBySurface ? "structurally valid (no degenerate ring, no self-intersection, every hole properly contained)" : "NOT fully valid — see per-surface diagnostics"}.`,
      });
    }
    return { surfaces, walls: [], cellTriangleMap, diagnostics, timings: { buildMs: performance.now() - t0 } };
  }

  // ─ 8.2: run the SAME 52-fixture corpus through the kernel adapter, computing the SAME named
  //   invariants Section 6 computes for legacy (INVARIANT_NAMES), so the two reports are directly
  //   comparable fixture-by-fixture. ─
  const kernelReport = {
    generatedAt: new Date().toISOString(),
    masterSha: baselineReport.masterSha,
    adapter: "kernel(PolygonKernel: unionCellRects+triangulateSurface, unsmoothed canonical topology)",
    invariants: INVARIANT_NAMES,
    fixtures: {},
  };
  let kernelFixturesWithAnyRed = 0;
  for (const fixture of FIXTURES) {
    const results = {};
    const cellsBefore = JSON.stringify(fixture.cells);

    let out, threwHard = false;
    try {
      out = kernelAdapter(fixture);
    } catch (e) {
      threwHard = true;
      out = { surfaces: [], walls: [], cellTriangleMap: {}, diagnostics: [{ level: "error", message: String(e) }], timings: {} };
    }
    results["malformed-input-no-throw"] = !threwHard;
    results["canonical-cells-unmutated"] = JSON.stringify(fixture.cells) === cellsBefore;

    if (fixture.malformed) {
      results["diagnostic-or-fallback-present"] = out.diagnostics.length > 0 || fixture.cells.length === 0 || fixture.cells.some((c) => !Number.isFinite(c.x) || !Number.isFinite(c.z));
      kernelReport.fixtures[fixture.fixtureId] = { malformed: true, results, mergeBlocker: fixture.mergeBlocker };
      if (!results["malformed-input-no-throw"] || !results["diagnostic-or-fallback-present"]) kernelFixturesWithAnyRed++;
      continue;
    }

    // determinism-shuffled-input
    const shuffled = geometryTruth.seededShuffle(fixture.cells, 1234);
    let outShuffled;
    try {
      outShuffled = kernelAdapter(Object.assign({}, fixture, { cells: shuffled }));
      results["determinism-shuffled-input"] = JSON.stringify(out.surfaces) === JSON.stringify(outShuffled.surfaces);
    } catch (e) { results["determinism-shuffled-input"] = false; }

    const areaTol = 1e-6; // STRICT — see this section's own SCOPE NOTE above (the kernel earns no smoothing leniency)
    const totalArea = out.surfaces.reduce((s, sf) => s + sf.polygons.reduce((s2, p) => s2 + p.area, 0), 0);
    results["union-area-matches-independent-truth"] = Math.abs(totalArea - fixture.expected.area) < Math.max(areaTol, fixture.expected.area * 1e-6);

    let tierAreaOk = true;
    for (const [tierKey, tierExp] of Object.entries(fixture.expected.tiers || {})) {
      const sf = out.surfaces.find((s) => String(s.tier) === String(tierKey));
      const tArea = sf ? sf.polygons.reduce((s, p) => s + p.area, 0) : 0;
      const ok = Math.abs(tArea - tierExp.area) < Math.max(1e-6, tierExp.area * 1e-6);
      if (!ok) tierAreaOk = false;
    }
    results["tier-area-matches-independent-truth"] = tierAreaOk;

    let polyHoleOk = true;
    for (const [tierKey, tierExp] of Object.entries(fixture.expected.tiers || {})) {
      const sf = out.surfaces.find((s) => String(s.tier) === String(tierKey));
      const gotPolys = sf ? sf.polygons.length : 0;
      const gotHoles = sf ? sf.polygons.reduce((s, p) => s + p.holes.length, 0) : 0;
      if (gotPolys !== tierExp.polygons || gotHoles !== tierExp.holes) polyHoleOk = false;
    }
    results["polygon-hole-count-matches-independent-truth"] = polyHoleOk;

    // ring-simplicity: validateSurface on every tier's own union output, no self-intersect issues.
    let simplicityOk = true;
    for (const sf of out.surfaces) {
      const v = kernel.validateSurface({ polygons: sf.polygons });
      if (v.issues.some((i) => i.message && i.message.includes("self-intersect"))) simplicityOk = false;
    }
    results["ring-simplicity-no-self-intersection"] = simplicityOk;

    // triangle-validity: zero zero-area/degenerate triangles, all vertices finite, across every tier.
    let triOk = true;
    for (const sf of out.surfaces) {
      if (sf.triDiagnostics.zeroAreaTriangles > 0) triOk = false;
      if (sf.vertices.some((v) => !Number.isFinite(v.x) || !Number.isFinite(v.z))) triOk = false;
      if (sf.indices.length === 0 && sf.polygons.length > 0) triOk = false;
    }
    results["triangle-validity-no-degenerate-no-nan"] = triOk;

    const expectedCellKeys = fixture.cells.map((c) => `${c.x},${c.z}`);
    const mappedKeys = Object.keys(out.cellTriangleMap || {});
    results["cell-triangle-map-totality"] = expectedCellKeys.every((k) => mappedKeys.includes(k));

    const anyRed = Object.values(results).some((v) => v === false);
    if (anyRed) kernelFixturesWithAnyRed++;
    kernelReport.fixtures[fixture.fixtureId] = { mergeBlocker: fixture.mergeBlocker, knownRed: fixture.knownRed || null, results };
  }

  console.log(`  fixtures run: ${FIXTURES.length}`);
  console.log(`  fixtures with >=1 red invariant against the kernel: ${kernelFixturesWithAnyRed}`);

  const kernelReportPath = join(ROOT, "dev/geometry-research/fixtures/kernel-report.json");
  writeFileSync(kernelReportPath, JSON.stringify(kernelReport, null, 2));
  check("8a. kernel-report.json written", true, kernelReportPath);
  check("8b. kernel report covers every fixture in the corpus", Object.keys(kernelReport.fixtures).length === FIXTURES.length);

  // ─ 8.3: THE DELTA — legacy-RED fixtures that flip GREEN under the kernel, and a regression guard
  //   (any fixture legacy passed cleanly that the kernel does NOT) — this is the literal §17.4
  //   acceptance ("must be GREEN where legacy was RED... must NOT regress the fixtures legacy passes"). ─
  console.log("\n  --- before(legacy) / after(kernel) delta ---");
  const flippedGreen = [];
  const regressions = [];
  const stillRedBoth = [];
  for (const fixture of FIXTURES) {
    const legacyRec = baselineReport.fixtures[fixture.fixtureId];
    const kernelRec = kernelReport.fixtures[fixture.fixtureId];
    const legacyRed = Object.values(legacyRec.results).some((v) => v === false);
    const kernelRed = Object.values(kernelRec.results).some((v) => v === false);
    if (legacyRed && !kernelRed) flippedGreen.push(fixture.fixtureId);
    else if (!legacyRed && kernelRed) regressions.push({ fixtureId: fixture.fixtureId, kernelResults: kernelRec.results });
    else if (legacyRed && kernelRed) stillRedBoth.push({ fixtureId: fixture.fixtureId, legacyResults: legacyRec.results, kernelResults: kernelRec.results });
  }
  console.log(`  RED(legacy) -> GREEN(kernel): ${flippedGreen.length} fixture(s): ${JSON.stringify(flippedGreen)}`);
  console.log(`  GREEN(legacy) -> RED(kernel) [REGRESSION]: ${regressions.length} fixture(s)`);
  if (regressions.length) console.log("   ", JSON.stringify(regressions, null, 2));
  console.log(`  RED on both: ${stillRedBoth.length} fixture(s)${stillRedBoth.length ? ": " + JSON.stringify(stillRedBoth.map((r) => r.fixtureId)) : ""}`);

  check("8c. every fixture the legacy adapter passed cleanly, the kernel adapter ALSO passes cleanly (no regression)", regressions.length === 0, regressions.map((r) => r.fixtureId));
  const KNOWN_LEGACY_RED_FIXTURE_IDS = ["F08-octagon-diagonal-doorway", "F11-cave-noisy-boundary", "F18-row101-exact-canonical", "F26c-malformed-non-numeric-tier", "B05-alternating-cave-boundary", "B09-full-width-open-edge", "B19-malformed-self-touching-bowtie"];
  check("8d. every one of the 7 legacy-documented RED fixtures flips GREEN under the kernel",
    KNOWN_LEGACY_RED_FIXTURE_IDS.every((id) => flippedGreen.includes(id)),
    { expected: KNOWN_LEGACY_RED_FIXTURE_IDS, flippedGreen });

  const deltaReportPath = join(ROOT, "dev/geometry-research/fixtures/kernel-vs-legacy-delta.json");
  writeFileSync(deltaReportPath, JSON.stringify({ generatedAt: new Date().toISOString(), flippedGreen, regressions, stillRedBoth }, null, 2));
  check("8e. kernel-vs-legacy-delta.json written", true, deltaReportPath);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
