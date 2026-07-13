/* dev/geometry-research/fuzz/adapters.mjs — UNIT R2 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §13.5).

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7):
     - Rung: C0 (topology correct) — stressed beyond hand fixtures via generated cases.
     - Canonical contracts preserved: this module READS src/ui/theater-room-mesh.js only, as the
       adapter under test (exactly G0's own posture). It never edits production code, never mutates
       narrative RNG, never rolls game content.
     - Classification: research-only, dev-only.

   This is the SAME legacyAdapter / reconstructRings / productionShellCellsAdapter logic G0's
   dev/verify-geometry-fixtures.mjs authored (that file is a top-level script with no exports, so it
   can't be `import`ed as a module — see that file's own header). Per the orchestration instruction to
   "reuse G0's legacyAdapter," this module re-derives the IDENTICAL adapter contract from the same
   read-only production source (src/ui/theater-room-mesh.js) rather than forking new adapter logic —
   any drift between this copy and G0's is a real risk, flagged in dev/geometry-research/fuzz/README.md,
   not hidden. G0's file is never edited to make this possible. */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const mesh = await import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
export const {
  compileRoomShellData, buildCellIndex, tierOf, traceTierContour, chainEdgesIntoRings,
  simplifySegments, ringToPolygon, signedArea2D, ensureCCW, polygonContainsPoint,
  segmentsProperlyIntersect, pointInTriangle2D, ROOM_SHELL_TIER_QUANTUM,
} = mesh;

// ─── reconstructRings — VERBATIM port of dev/verify-geometry-fixtures.mjs Section 3 ────────────────
export function reconstructRings(cells) {
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
      const rawArea = signedArea2D(poly);
      const fixed = ensureCCW(poly, segments);
      return { poly: fixed.poly, segments: fixed.segments, isOuter: rawArea > 0, rawArea };
    });
    const outers = built.filter((r) => r.isOuter);
    const holes = built.filter((r) => !r.isOuter);
    const holeOwners = holes.map((h) => {
      const owner = outers.find((o) => polygonContainsPoint(o.poly, h.poly[0]));
      return { hole: h, ownerIndex: owner ? outers.indexOf(owner) : -1 };
    });
    perTier[tier] = { outers, holes, holeOwners, tierCells };
  });
  return perTier;
}

function mapRenderShapeToSmoothShape(renderShape) {
  if (renderShape === "octagon" || renderShape === "L" || renderShape === "T" || renderShape === "cross") return renderShape;
  if (renderShape === "radial" || renderShape === "circle" || renderShape === "ellipse") return "ellipse";
  return null;
}

// ─── legacyAdapter — VERBATIM port of dev/verify-geometry-fixtures.mjs Section 4 ───────────────────
// Shared input contract (GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.1) -> shared output contract (§4.2).
// `scenario.wallProfile` (if present) is threaded through as compileRoomShellData opts — G0's original
// legacyAdapter didn't need this (its fixtures all shared one REFERENCE_WALL_PROFILE), but R2's
// wallProfileArbitrary generates one per case, so this port adds that one pass-through (never changing
// the shared behavior when wallProfile is absent).
export function legacyAdapter(scenario) {
  const cells = scenario.cells.map((c) => ({ x: c.x, z: c.z, tier: c.tier, isDoor: !!c.isDoor }));
  const smoothShape = mapRenderShapeToSmoothShape(scenario.renderShape);
  const opts = smoothShape ? { smoothShape } : {};
  if (scenario.wallProfile) {
    const wp = scenario.wallProfile;
    if (typeof wp.thickness === "number") opts.wallThickness = wp.thickness;
    if (typeof wp.stemHeight === "number") opts.wallStemHeight = wp.stemHeight;
    if (typeof wp.capHeight === "number") opts.wallCapHeight = wp.capHeight;
    if (typeof wp.capOverhang === "number") opts.wallCapOverhang = wp.capOverhang;
    if (typeof wp.footing === "number") opts.wallFooting = wp.footing;
  }
  const t0 = performance.now();
  let data, threw = null;
  try {
    data = compileRoomShellData(cells, opts);
  } catch (e) {
    threw = String((e && e.stack) || e);
  }
  const buildMs = performance.now() - t0;
  if (threw) {
    return { surfaces: [], walls: [], cellTriangleMap: {}, diagnostics: [{ level: "error", message: threw }], timings: { buildMs }, raw: null };
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
    apertureIds: [], // KNOWN GAP (same as G0): legacy doesn't carry apertureIds on wall segments today.
    mountSlots: [],
    tier: seg.tier, kind: seg.kind,
  }));
  return {
    surfaces, walls, cellTriangleMap: data.cellTriangleMap,
    diagnostics: [], timings: { buildMs },
    raw: data,
  };
}

// ─── productionShellCellsAdapter — VERBATIM port of dev/verify-geometry-fixtures.mjs Section 4b ────
// Replicates theater-boot.js:8887-8895's real shellCells builder (copied verbatim, same as G0, because
// that code lives inside a ~11,000-line non-exported closure). Constants are copied from their real
// definitions (theater-boot.js:3289-3290, src/ui/theater-room-mesh.js:100) — same citation as G0's.
const ITR_FLOOR_BASE_Y = -0.5;
const ITR_FLOOR_HEIGHT_FALLBACK = 0.2;
export function productionShellCellsAdapter(scenario) {
  const floorList = scenario.cells.map((c) => ({
    x: c.x, z: c.z,
    sy: c.sourceRef && typeof c.sourceRef.rawSy === "number" ? c.sourceRef.rawSy : undefined,
  }));
  const shellCells = floorList.map((f) => {
    // theater-boot.js, VERBATIM — finite signed elevations survive; only invalid/missing values fall back.
    const sy = (typeof f.sy === "number" && Number.isFinite(f.sy)) ? f.sy : ITR_FLOOR_HEIGHT_FALLBACK;
    return {
      x: Math.round(f.x), z: Math.round(f.z),
      tier: Math.round(sy / ROOM_SHELL_TIER_QUANTUM),
      elevationY: ITR_FLOOR_BASE_Y + sy,
      isDoor: false,
    };
  });
  let data, threw = null;
  try {
    data = compileRoomShellData(shellCells, scenario.renderShape === "octagon" ? { smoothShape: "octagon" } : {});
  } catch (e) {
    threw = String((e && e.stack) || e);
  }
  return { shellCells, data, threw };
}

/** positiveOnlyShellCellsAdapter retains the retired predicate solely as R2's load-bearing red-first
    control. Production must never call this adapter. */
export function positiveOnlyShellCellsAdapter(scenario) {
  const floorList = scenario.cells.map((c) => ({
    x: c.x, z: c.z,
    sy: c.sourceRef && typeof c.sourceRef.rawSy === "number" ? c.sourceRef.rawSy : undefined,
  }));
  const shellCells = floorList.map((f) => {
    const sy = (typeof f.sy === "number" && f.sy > 0) ? f.sy : ITR_FLOOR_HEIGHT_FALLBACK;
    return { x: Math.round(f.x), z: Math.round(f.z), tier: Math.round(sy / ROOM_SHELL_TIER_QUANTUM), elevationY: ITR_FLOOR_BASE_Y + sy, isDoor: false };
  });
  let data, threw = null;
  try { data = compileRoomShellData(shellCells, scenario.renderShape === "octagon" ? { smoothShape: "octagon" } : {}); }
  catch (e) { threw = String((e && e.stack) || e); }
  return { shellCells, data, threw };
}

export const PRODUCTION_SY_GUARD_NOTE =
  "the production shellCells boundary accepts every finite signed f.sy via Number.isFinite; the " +
  "retired f.sy > 0 predicate is retained only in positiveOnlyShellCellsAdapter as the red-first control.";
