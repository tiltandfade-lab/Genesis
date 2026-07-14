/* dev/geometry-research/bakeoff/adapters.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §13.4,
   §4.1-4.2, §1.2). P0-P3 behind ONE common function signature: `adapter(fixture) -> sharedOutput`.

     P0  legacy contour + ear clip + naive per-segment wall-outer-face endpoint offset (CURRENT production)
     P1  polygon-clipping floors + Earcut triangulation + SAME naive per-segment wall offset (P0's)
     P2  P1's floor, wall offset swapped to Clipper2 Strategy A (whole-ring offset correspondence)
     P3  Clipper2 booleans + Clipper2 CDT triangulation + Clipper2 Strategy A wall offset

   SCOPE NOTE (read before grading a fixture with renderShape set): this spike compares the underlying
   boolean/triangulation/offset PRIMITIVES on CANONICAL (grid-faithful, unsmoothed) ring topology only.
   diagonalizeStaircaseRing/radialSmoothRing (STAGE-C3b's render-transform pass, applied AFTER the
   canonical ring exists) is legacy-only in THIS spike — P1-P3 do not run it. That pass belongs to G2/G3
   (Phase 2 floor/wall integration per docs/GRAPHICS-CONVERGENCE-PLAN.md), not R1's job of picking the
   underlying kernel. Every fixture's `expected.area/tiers` in dev/geometry-research/fixtures/corpus.mjs
   is the RAW (unsmoothed) cell-derived truth, so P1-P3 are graded at the STRICT epsilon tolerance, never
   the loosened 5% smoothing band corpus.mjs reserves for smoothed renderShapes. P0 (which DOES run the
   smoothing pass, matching real production) is graded with the fixture's own declared tolerance. This is
   flagged again, per-path, in every correctness report row — never silently normalized away. */

import {
  loadLegacyMeshModule, legacyUnionCells, legacyTriangulate,
  polygonClippingUnionCells, clipper2UnionCells, earcutTriangulate, clipper2Triangulate,
} from "./floor-backends.mjs";
import { recoverSegmentsFromRing, genesisSegmentExtrusionOffset, clipper2StrategyA } from "./wall-backends.mjs";
import { triangulatedArea } from "./ring-utils.mjs";

let _mesh = null;
async function mesh() {
  if (!_mesh) _mesh = await loadLegacyMeshModule();
  return _mesh;
}

function groupByTier(cells) {
  const map = new Map();
  for (const c of cells) {
    const t = typeof c.tier === "number" ? c.tier : 0;
    if (!map.has(t)) map.set(t, []);
    map.get(t).push(c);
  }
  return map;
}

/** runAdapter(pathId, fixture) -> shared output contract (GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.2).
    Never mutates `fixture`. Never throws for a well-formed fixture; malformed fixtures get a typed
    diagnostic entry instead of an uncaught exception (§4.4's "typed failure behavior" requirement). */
export async function runAdapter(pathId, fixture) {
  const t0 = performance.now();
  const diagnostics = [];
  try {
    const cells = (fixture.cells || []).filter(Boolean).map((c) => ({
      x: c.x, z: c.z, tier: typeof c.tier === "number" ? c.tier : 0, isDoor: !!c.isDoor,
    }));
    if (!cells.length || cells.some((c) => !Number.isFinite(c.x) || !Number.isFinite(c.z) || !Number.isFinite(c.tier))) {
      return {
        surfaces: [], walls: [], cellTriangleMap: {},
        diagnostics: [{ level: "error", message: "empty or non-finite cell input", typed: "malformed-input" }],
        timings: { buildMs: performance.now() - t0 },
      };
    }
    const m = await mesh();
    const allIndex = m.buildCellIndex(cells);
    const byTier = groupByTier(cells);
    const wallProfile = fixture.wallProfile || {};
    const surfaces = [];
    const walls = [];
    const cellTriangleMap = {};

    for (const [tier, tierCells] of byTier) {
      // ─ floor union ─
      let unionResult, unionErr = null;
      try {
        if (pathId === "P0" || pathId === "P1" || pathId === "P2") {
          unionResult = pathId === "P0"
            ? legacyUnionCells(tierCells, tier, allIndex, m)
            : await polygonClippingUnionCells(tierCells);
        } else {
          unionResult = await clipper2UnionCells(tierCells, fixture._clipperScale || 4096);
        }
      } catch (e) { unionErr = String((e && e.stack) || e); }
      if (unionErr) {
        diagnostics.push({ level: "error", message: unionErr, typed: "boolean-op-failure", tier });
        continue;
      }

      const polygons = [];
      for (const poly of unionResult.polygons) {
        // ─ triangulation ─
        let triResult, triErr = null;
        try {
          triResult = pathId === "P0" ? legacyTriangulate(poly, m)
            : pathId === "P3" ? await clipper2Triangulate(poly, fixture._clipperScale || 4096)
            : await earcutTriangulate(poly);
        } catch (e) { triErr = String((e && e.stack) || e); }
        if (triErr) {
          diagnostics.push({ level: "error", message: triErr, typed: "triangulation-failure", tier });
          continue;
        }
        const triStart = surfaces.reduce((s, sf) => s + (sf.indices ? sf.indices.length / 3 : 0), 0);
        const sourceCellKeys = tierCells.map((c) => `${c.x},${c.z}`);
        polygons.push({
          outer: poly.outer, holes: poly.holes, sourceCellKeys,
          _tri: triResult, _area: triangulatedArea(triResult.vertices, triResult.indices),
        });
        sourceCellKeys.forEach((k) => {
          if (!cellTriangleMap[k]) cellTriangleMap[k] = [];
          cellTriangleMap[k].push({ tier, polyIndex: polygons.length - 1 });
        });
      }

      const vertices = [];
      const indices = [];
      polygons.forEach((p) => {
        const base = vertices.length;
        p._tri.vertices.forEach((v) => vertices.push(v));
        p._tri.indices.forEach((i) => indices.push(i + base));
      });
      surfaces.push({
        tier,
        polygons: polygons.map((p) => ({ outer: p.outer, holes: p.holes, sourceCellKeys: p.sourceCellKeys, area: p._area })),
        vertices, indices,
        triangleOwners: { tier, triCount: indices.length / 3 },
      });

      // ─ walls: recover per-tier ring segments (uniform across all 4 paths, including P0 — verified
      //   byte-identical to legacy's own traceTierContour-derived segments) then offset. ─
      for (const poly of unionResult.polygons) {
        const rings = [{ ring: poly.outer, isHole: false }, ...poly.holes.map((h) => ({ ring: h, isHole: true }))];
        for (const { ring, isHole } of rings) {
          // recoverSegmentsFromRing expects a CCW ring (its inward-normal convention assumes CCW,
          // matching segmentNormal's own documented contract); a hole ring is CW by the shared
          // contract's own winding law, so reverse it before recovery, then reverse the recovered
          // segment list's direction back for hole-owned wall records (kept internally consistent —
          // downstream correctness scoring only reads segment KIND/tier/gap, not absolute direction).
          const ccwRing = isHole ? ring.slice().reverse() : ring;
          let segments;
          try {
            segments = recoverSegmentsFromRing(ccwRing, allIndex, tier, m);
          } catch (e) {
            diagnostics.push({ level: "error", message: String(e), typed: "segment-recovery-failure", tier });
            continue;
          }
          let offsetResult, offsetErr = null;
          try {
            if (pathId === "P0" || pathId === "P1") {
              offsetResult = genesisSegmentExtrusionOffset(ccwRing, segments, wallProfile, m);
            } else {
              offsetResult = await clipper2StrategyA(ccwRing, segments, wallProfile, { mesh: m, scale: fixture._clipperScale || 4096 });
            }
          } catch (e) { offsetErr = String((e && e.stack) || e); }
          if (offsetErr) {
            diagnostics.push({ level: "error", message: offsetErr, typed: "wall-offset-failure", tier });
            continue;
          }
          segments.forEach((seg, i) => {
            const match = offsetResult.perSegment[i] || {};
            walls.push({
              id: `w${walls.length}`,
              sourceSegmentRefs: [`${tier}:${isHole ? "hole" : "outer"}:${i}`],
              innerA: seg.a, innerB: seg.b,
              outerA: match.outerA || null, outerB: match.outerB || null,
              joinStart: null, joinEnd: null,
              apertureIds: seg.kind === "door" ? [`${tier}:door:${i}`] : [],
              mountSlots: seg.kind === "wall" ? [`${tier}:mount:${i}`] : [],
              tier, kind: seg.kind,
              matchConfidence: match.matchConfidence ?? null, matchMethod: match.matchMethod || null,
            });
          });
          diagnostics.push({ level: "info", typed: "wall-offset-diagnostics", tier, isHole, detail: offsetResult.diagnostics });
        }
      }
    }

    return { surfaces, walls, cellTriangleMap, diagnostics, timings: { buildMs: performance.now() - t0 } };
  } catch (e) {
    return {
      surfaces: [], walls: [], cellTriangleMap: {},
      diagnostics: [{ level: "error", message: String((e && e.stack) || e), typed: "adapter-threw" }],
      timings: { buildMs: performance.now() - t0 },
    };
  }
}

export const PATHS = ["P0", "P1", "P2", "P3"];
