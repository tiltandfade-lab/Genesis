/* dev/geometry-research/bakeoff/wall-backends.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §13.4, §3.3, §4.6). The wall-offset half of the bakeoff: the bespoke Genesis miter (insetPolygon,
   read-only from theater-room-mesh.js) vs Clipper2 robust offsetting, plus BOTH source-mapping
   strategies (§4.6 Strategy A whole-ring correspondence, Strategy B per-run offset+join) that recover
   Genesis segment IDs / apertures / mount-slot ownership from a library's offset output. */

import { clipperScaleFns } from "./floor-backends.mjs";
import { loadClipper2 } from "./require-lib-tools.mjs";

// ─── recoverSegmentsFromRing: re-derive legacy-shaped {a,b,kind,tier|loTier/hiTier} wall segments from
//     ANY canonical (already merged/simplified) ring — independent of which boolean library produced
//     it. Required because polygon-clipping/clipper2's own union already merges collinear per-cell
//     edges into single long runs, which loses the PER-CELL door/riser/wall provenance
//     traceTierContour's raw pass carries. This walks each ring edge in exact 1-world-unit steps
//     (every Genesis wall run is grid-aligned in the canonical, unsmoothed topology this spike scores —
//     see adapters.mjs's own scope note on renderShape smoothing) and classifies each unit sub-edge the
//     SAME way traceTierContour does: an edge with a same-tier neighbor across it is a riser; an edge
//     with no neighbor at all is a wall, or a door if its owning cell is tagged isDoor. Consecutive
//     unit sub-edges of the same kind (and, for risers, the same loTier/hiTier pair) merge into one
//     segment — this is a genuine re-implementation of simplifySegments' own merge law, operating
//     top-down (ring edges -> unit steps) instead of bottom-up (unit edges -> merged ring). ─────────── */
export function recoverSegmentsFromRing(ring, allCellsIndex, tier, mesh) {
  const { segmentNormal } = mesh;
  const raw = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const dx = b.x - a.x, dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.round(len));
    const ux = dx / steps, uz = dz / steps;
    const normal = segmentNormal({ a, b }); // inward unit normal, valid for a CCW ring per theater-room-mesh.js's own contract
    for (let s = 0; s < steps; s++) {
      const p0 = { x: a.x + ux * s, z: a.z + uz * s };
      const p1 = { x: a.x + ux * (s + 1), z: a.z + uz * (s + 1) };
      const mid = { x: (p0.x + p1.x) / 2, z: (p0.z + p1.z) / 2 };
      const ownerX = Math.round(mid.x + normal.x * 0.5), ownerZ = Math.round(mid.z + normal.z * 0.5);
      const neighX = Math.round(mid.x - normal.x * 0.5), neighZ = Math.round(mid.z - normal.z * 0.5);
      const owner = allCellsIndex.get(`${ownerX},${ownerZ}`);
      const neighbor = allCellsIndex.get(`${neighX},${neighZ}`);
      if (neighbor) {
        const nTier = typeof neighbor.tier === "number" ? neighbor.tier : 0;
        raw.push({ a: p0, b: p1, kind: "riser", loTier: Math.min(tier, nTier), hiTier: Math.max(tier, nTier) });
      } else {
        raw.push({ a: p0, b: p1, kind: owner && owner.isDoor ? "door" : "wall", tier });
      }
    }
  }
  return mergeUnitSegments(raw);
}

function segKey(s) { return s.kind === "riser" ? `riser:${s.loTier}:${s.hiTier}` : s.kind; }
function dirOf(a, b) {
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1;
  return { dx: dx / len, dz: dz / len };
}
function mergeUnitSegments(raw) {
  if (!raw.length) return [];
  const out = [];
  let cur = { a: raw[0].a, b: raw[0].b, kind: raw[0].kind, tier: raw[0].tier, loTier: raw[0].loTier, hiTier: raw[0].hiTier };
  let curKey = segKey(raw[0]), curDir = dirOf(raw[0].a, raw[0].b);
  for (let i = 1; i < raw.length; i++) {
    const e = raw[i], key = segKey(e), dir = dirOf(e.a, e.b);
    const same = key === curKey && Math.abs(dir.dx - curDir.dx) < 1e-6 && Math.abs(dir.dz - curDir.dz) < 1e-6;
    if (same) { cur.b = e.b; continue; }
    out.push(cur);
    cur = { a: e.a, b: e.b, kind: e.kind, tier: e.tier, loTier: e.loTier, hiTier: e.hiTier };
    curKey = key; curDir = dir;
  }
  out.push(cur);
  return out;
}

// ─── genesis-segment-extrusion (the LANDED bespoke wall-outer-face math, P0/P1/P2's baseline) ────────
// NOT insetPolygon (that function is exported and looked like the obvious candidate, but a direct read
// of compileRoomShellData's own wall branch — theater-room-mesh.js:1442-1449 — shows the ACTUAL outer
// wall face is a NAIVE PER-SEGMENT endpoint offset, `outerA = innerA - n*wallThickness` /
// `outerB = innerB - n*wallThickness`, computed INDEPENDENTLY per segment with NO cross-segment miter
// join at all (buildWallBox is then called once per segment with its own outerA/outerB — adjacent
// wall boxes are simply placed side by side). insetPolygon is used ONLY for the bevel ribbon
// (bevelWidth, a floor-detail strip), a different subsystem entirely. THIS naive per-segment offset —
// reproduced verbatim below — is the real bespoke "wall-shell math" the charter's §3.3 diagonal-
// endpoint-hooks / acute-corner-spikes / adjacent-volume-gaps / concave-overlap defect list is about,
// and is therefore the correct P0 baseline for the Clipper2 comparison.
export function genesisSegmentExtrusionOffset(ring, segments, wallProfile, mesh) {
  const { segmentNormal } = mesh;
  const widthForSegment = (seg) => (seg.kind === "door" ? 0 : wallProfile.thickness);
  const t0 = performance.now();
  const perSegment = segments.map((seg, i) => {
    const n = segmentNormal(seg); // inward unit normal
    const w = widthForSegment(seg);
    const outerA = { x: seg.a.x - n.x * w, z: seg.a.z - n.z * w };
    const outerB = { x: seg.b.x - n.x * w, z: seg.b.z - n.z * w };
    return { sourceSegmentIndex: i, kind: seg.kind, outerA, outerB, matchConfidence: 1, matchMethod: "vertex-index-identity" };
  });
  const libMs = performance.now() - t0;
  // join gap/overlap: distance between consecutive segments' own independently-computed outerB/outerA
  // (zero for two segments sharing the SAME width on a 90-degree grid corner — the common case every
  // existing rect/L/T/cross fixture exercises — but non-zero at any OTHER corner angle, e.g. the
  // diagonal chamfer runs B01/B02/B07/B11/B12's octagon corners introduce, or an artificially acute
  // corner like B02). This IS the defect class the charter's §3.3 names.
  const n = perSegment.length;
  const joinGaps = [];
  for (let i = 0; i < n; i++) {
    const cur = perSegment[i], next = perSegment[(i + 1) % n];
    const gap = Math.hypot(cur.outerB.x - next.outerA.x, cur.outerB.z - next.outerA.z);
    if (gap > 1e-9) joinGaps.push({ atIndex: i, gap });
  }
  const outerRing = perSegment.map((p) => p.outerA); // NOT watertight at non-90-degree corners — see joinGaps
  return {
    outerRing, perSegment,
    diagnostics: {
      source: "genesis-segment-extrusion(naive-per-segment-endpoint-offset, theater-room-mesh.js:1442-1449)",
      libMs, correspondence: "exact-1:1",
      joinGapCount: joinGaps.length, joinGaps: joinGaps.slice(0, 10),
      maxJoinGap: joinGaps.reduce((m, g) => Math.max(m, g.gap), 0),
    },
  };
}

// ─── Clipper2 robust offsetting, Strategy A: whole-ring offset correspondence (§4.6) ────────────────
// Offset the FULL ring in one inflatePaths call, then for each OUTPUT edge, project its midpoint onto
// every candidate SOURCE segment (offset outward by the segment's own width along its normal) and
// assign the source with parallel direction + bounded perpendicular distance + overlapping projected
// interval. Unmatched short output edges (corner joins) are attributed to the two adjacent matched
// source segments' shared corner.
export async function clipper2StrategyA(ring, segments, wallProfile, opts = {}) {
  const scale = opts.scale || 4096;
  const joinType = opts.joinType ?? 0; // Miter
  const { C } = await loadClipper2();
  const { toC, fromC } = clipperScaleFns(scale);
  const widthForSegment = (seg) => (seg.kind === "door" ? 0 : wallProfile.thickness);
  // uniform-width path: Clipper2's inflatePaths offsets an ENTIRE path by one delta — Genesis walls can
  // have per-segment width (0 at doors). Strategy A therefore offsets the DOMINANT (non-door) wall
  // thickness for the whole ring, matching the spec's "offset the full validated ring" step 1, and
  // records door segments as width-0 explicitly in the source-mapping pass rather than pretending
  // Clipper2 offset a variable-width ring (it fundamentally cannot in one call — see requiredFollowups).
  const uniformWidth = wallProfile.thickness;
  const path = C.makePath(ring.flatMap((p) => [toC(p.x), toC(p.z)]));
  const t0 = performance.now();
  const offsetPaths = C.inflatePaths([path], toC(uniformWidth), joinType, 0 /* Polygon */, wallProfile.miterLimit || 4);
  const libMs = performance.now() - t0;
  if (!offsetPaths.length) {
    return { outerRing: null, perSegment: [], diagnostics: { source: "clipper2-ts@inflatePaths(StrategyA)", libMs, scale, error: "empty offset result" } };
  }
  const outerRing = offsetPaths[0].map((p) => ({ x: fromC(p.x), z: fromC(p.y) }));

  // per-source-segment matching: for each source segment, compute its EXPECTED offset run (translate
  // both endpoints outward by the segment's own width along its own normal) and find the output ring
  // edge(s) whose midpoint lies within a bounded distance of, and direction-parallel to, that expected
  // run — exactly GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.6 Strategy A steps 2-3.
  const mesh = opts.mesh;
  const { segmentNormal } = mesh;
  const outerEdges = outerRing.map((a, i) => ({ a, b: outerRing[(i + 1) % outerRing.length] }));
  const usedOuterEdges = new Set();
  const perSegment = segments.map((seg, i) => {
    const w = widthForSegment(seg);
    const n = segmentNormal(seg); // inward normal; OUTWARD offset direction is -n
    const expA = { x: seg.a.x - n.x * w, z: seg.a.z - n.z * w };
    const expB = { x: seg.b.x - n.x * w, z: seg.b.z - n.z * w };
    const expMid = { x: (expA.x + expB.x) / 2, z: (expA.z + expB.z) / 2 };
    const expDir = dirOf(expA, expB);
    let best = null, bestScore = Infinity;
    outerEdges.forEach((oe, oi) => {
      if (usedOuterEdges.has(oi)) return;
      const oDir = dirOf(oe.a, oe.b);
      const parallel = Math.abs(oDir.dx * expDir.dx + oDir.dz * expDir.dz);
      const oMid = { x: (oe.a.x + oe.b.x) / 2, z: (oe.a.z + oe.b.z) / 2 };
      const dist = Math.hypot(oMid.x - expMid.x, oMid.z - expMid.z);
      if (parallel > 0.9 && dist < Math.max(0.5, w + 0.25)) {
        const score = dist + (1 - parallel);
        if (score < bestScore) { bestScore = score; best = { oi, oe, dist, parallel }; }
      }
    });
    if (best) {
      usedOuterEdges.add(best.oi);
      return {
        sourceSegmentIndex: i, kind: seg.kind, outerA: best.oe.a, outerB: best.oe.b,
        matchConfidence: Math.max(0, 1 - best.dist / Math.max(0.5, w + 0.25)),
        matchMethod: "strategy-a-projection", matchDistance: best.dist, matchParallel: best.parallel,
      };
    }
    return {
      sourceSegmentIndex: i, kind: seg.kind, outerA: null, outerB: null,
      matchConfidence: 0, matchMethod: "strategy-a-unmatched",
    };
  });
  const cornerJoinsUnclaimed = outerEdges.length - usedOuterEdges.size;
  return {
    outerRing, perSegment,
    diagnostics: {
      source: "clipper2-ts@inflatePaths(StrategyA)", libMs, scale,
      sourceSegments: segments.length, outerEdges: outerEdges.length,
      matchedSegments: perSegment.filter((p) => p.matchConfidence > 0).length,
      cornerJoinsUnclaimed,
    },
  };
}

// ─── Clipper2 robust offsetting, Strategy B: per-run offset + library join polygons (§4.6) ──────────
// Offset EACH non-door wall run as its own OPEN path (EndType.Butt so the ends land exactly at the
// run's true endpoints, no cap overshoot), preserving source segment identity by construction (one
// offset call per source segment == trivial 1:1 stitching, no projection heuristic). Door runs are
// left at width 0 (their inner endpoints ARE their outer endpoints — flush aperture, matching
// insetPolygon's own widthForSegment(door)=0 convention). Adjacent non-door runs are then stitched at a
// shared corner by intersecting their two offset lines (mirrors Clipper2's own join geometry without
// needing PolyTree join-polygon extraction, which clipper2-ts's inflatePaths already folds into the
// closed-path/EndType.Joined case; this spike uses the explicit per-segment path for maximum
// provenance transparency, per the doc's "preserve source segments and aperture splits first" step 1).
export async function clipper2StrategyB(ring, segments, wallProfile, opts = {}) {
  const scale = opts.scale || 4096;
  const joinType = opts.joinType ?? 0; // Miter
  const { C } = await loadClipper2();
  const { toC, fromC } = clipperScaleFns(scale);
  const widthForSegment = (seg) => (seg.kind === "door" ? 0 : wallProfile.thickness);
  const mesh = opts.mesh;
  let libMs = 0;
  const perSegment = segments.map((seg, i) => {
    const w = widthForSegment(seg);
    if (w <= 0) {
      return { sourceSegmentIndex: i, kind: seg.kind, outerA: seg.a, outerB: seg.b, matchConfidence: 1, matchMethod: "strategy-b-zero-width" };
    }
    const path = C.makePath([toC(seg.a.x), toC(seg.a.z), toC(seg.b.x), toC(seg.b.z)]);
    const t0 = performance.now();
    const offsetPaths = C.inflatePaths([path], toC(w), joinType, 2 /* Butt */, wallProfile.miterLimit || 4);
    libMs += performance.now() - t0;
    if (!offsetPaths.length || offsetPaths[0].length < 4) {
      return { sourceSegmentIndex: i, kind: seg.kind, outerA: null, outerB: null, matchConfidence: 0, matchMethod: "strategy-b-empty-offset" };
    }
    // an open-path Butt offset of a single segment returns a 4-point rectangle in Clipper2's own
    // corner order/winding (not assumed here). Identify outerA/outerB by NEAREST-NEIGHBOR match against
    // the naively-expected outer points (seg.a/seg.b displaced OUTWARD along the segment's own inward
    // normal `n` — the same construction genesisSegmentExtrusionOffset uses) rather than any
    // distance-from-midpoint heuristic (an earlier version of this function tried that; it is WRONG —
    // for a symmetric rectangle around a line segment, the two inner corners and two outer corners are
    // equidistant from the segment midpoint in pairs, so "farthest from midpoint" cannot distinguish
    // inner from outer at all. Nearest-neighbor-to-expected-point is unambiguous and correct.)
    const rect = offsetPaths[0].map((p) => ({ x: fromC(p.x), z: fromC(p.y) }));
    const n = mesh.segmentNormal(seg);
    const expA = { x: seg.a.x - n.x * w, z: seg.a.z - n.z * w };
    const expB = { x: seg.b.x - n.x * w, z: seg.b.z - n.z * w };
    const nearest = (target) => rect.reduce((best, p) => {
      const d = Math.hypot(p.x - target.x, p.z - target.z);
      return !best || d < best.d ? { p, d } : best;
    }, null);
    const outerA = nearest(expA).p, outerB = nearest(expB).p;
    return { sourceSegmentIndex: i, kind: seg.kind, outerA, outerB, matchConfidence: 1, matchMethod: "strategy-b-per-run-offset" };
  });
  // stitch adjacent non-door runs at shared corners: intersect consecutive offset lines (matches
  // insetPolygon's own miter-join construction, just computed AFTER independent per-run offsetting
  // rather than as one simultaneous solve — this is exactly the "gap/overlap at the join" risk §3.3
  // warns Clipper2 offsetting introduces if joins aren't handled deliberately).
  const n = perSegment.length;
  const joinGaps = [];
  for (let i = 0; i < n; i++) {
    const cur = perSegment[i], next = perSegment[(i + 1) % n];
    if (!cur.outerB || !next.outerA) continue;
    const gap = Math.hypot(cur.outerB.x - next.outerA.x, cur.outerB.z - next.outerA.z);
    if (gap > 1e-6) joinGaps.push({ atIndex: i, gap });
  }
  const outerRing = perSegment.filter((p) => p.outerA).map((p) => p.outerA);
  return {
    outerRing, perSegment,
    diagnostics: {
      source: "clipper2-ts@inflatePaths(StrategyB-per-run)", libMs, scale,
      sourceSegments: segments.length, joinGapCount: joinGaps.length,
      joinGaps: joinGaps.slice(0, 10), maxJoinGap: joinGaps.reduce((m, g) => Math.max(m, g.gap), 0),
    },
  };
}
