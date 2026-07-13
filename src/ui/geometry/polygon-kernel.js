/* src/ui/geometry/polygon-kernel.js — UNIT G1 (docs/GEOMETRY-OSS-INTEGRATION.md §4, §5, §14, §17.4).

   CHARTER STATEMENT (docs/GRAPHICS-CONVERGENCE-CHARTER.md §7, required at the top of every graphics-
   session module/report):
     - Convergence rung advanced: C0 -> C1 groundwork — this is the trustworthy geometric-interpretation
       boundary ("stop owning polygon math") the rest of the geometry-convergence trajectory
       (G2 floor integration, G3 walls/apertures) is built on. It does not itself move a rung; nothing in
       production consumes it yet.
     - Canonical contracts preserved: this module is PURE. Plain {x,z} points in, the Genesis-owned
       {polygons:[...], diagnostics:{...}} / {vertices,indices,trianglePolygonIds,...} shapes out. No
       THREE import, no walk/cell/world-state read or mutation, no Math.random/Date.now. It is Node-
       importable (dev/verify-polygon-kernel.mjs, dev/verify-geometry-fixtures.mjs) and browser-
       importable (a plain relative ES import — see genesis.html's own <script type="module"> tag for
       this file, mirroring the theater-room-mesh.js convention).
     - Classification: runtime module (src/ui/geometry/), but INERT until Unit G2 wires it into
       theater-room-mesh.js's floor pipeline behind the ROOM_SHELL_POLYGON_KERNEL migration switch
       (docs/GEOMETRY-OSS-INTEGRATION.md §15). This unit adds ZERO production call sites.
     - Negative control: dev/verify-geometry-fixtures.mjs's own legacy-adapter baseline
       (dev/geometry-research/fixtures/baseline-report.json) independently found 7 of the 52 corpus
       fixtures RED against the current production ring-tracer (F08/B09 degenerate door-adjacent floor
       triangles, F11/B05 diagonal-vertex-pinch polygon/hole undercount on cave boundaries, F18 hole/
       tier-area mismatch on the row-101 nested-ring case, F26c/B19 malformed input silently producing
       zero diagnostics instead of a typed fallback). dev/verify-polygon-kernel.mjs proves this kernel
       GREEN on exactly those fixtures without regressing any fixture legacy already passes — see that
       harness and this unit's session report for the full before/after delta.

   ARCHITECTURAL BOUNDARY (§4): a pure ESM module, deliberately separate from theater-boot.js (the
   THREE/scene-assembly layer) and theater-room-mesh.js (the current production ring-tracer/triangulator
   this unit does NOT edit — that's G2's job). Only two vendored libraries are imported, both via plain
   relative ES paths (no bare specifier, no import-map entry, no package-manager runtime dependency):
     - vendor/polygon-clipping/polygon-clipping.js — polygon-clipping@0.15.7, the R1-selected boolean
       kernel (dev/geometry-research/bakeoff/ruling.json: "booleanKernel": "polygon-clipping").
     - vendor/earcut/earcut.js — earcut@3.2.3, the R1-selected triangulator
       (ruling.json: "triangulator": "earcut").
   See each vendor directory's own README-GENESIS.md for exact pins/SHAs/licenses. NO library-native
   array/class/geometry/Three/DOM type is ever returned from an exported function of this module — every
   return value is composed of plain objects/arrays of {x,z} pairs and numbers.

   COORDINATE / WINDING / EPSILON LAW (§5, load-bearing — every helper below implements this exactly):
     1. Geometry operates in the horizontal (x,z) plane.
     2. One logical cell (x,z) occupies the closed unit square [x-0.5,x+0.5] x [z-0.5,z+0.5].
     3. Rings are OPEN: the first point is never repeated at the end (adapter boundary only closes rings
        when handing them to polygon-clipping, which requires a closed ring, and immediately re-opens
        polygon-clipping's own output).
     4. Outer rings are wound CCW (Genesis's own convention, verified against
        src/ui/theater-room-mesh.js's signedArea2D + ensureCCW: positive shoelace sum == CCW == outer).
        Holes are wound CW (the opposite winding).
     5. This module — and only this module — converts to/from polygon-clipping's/Earcut's own winding
        and closure conventions; no other Genesis code should ever touch a library-native ring shape.
     6. Quantization: NONE beyond ordinary floating-point epsilon comparisons at DEFAULT_EPSILON. This
        kernel never snaps a coordinate to a grid or introduces an integer-scale factor (unlike
        clipper2-ts, which the R1 bakeoff found REQUIRES an integer CLIPPER_SCALE or it silently no-ops
        sub-1.0-unit deltas — polygon-clipping has no such requirement, see its README-GENESIS.md).
     7. DEFAULT_EPSILON = 1e-7 world units (matches dev/geometry-research/bakeoff/ring-utils.mjs's own
        calibrated value, proven against this exact fixture corpus).
     8. Consecutive-equal points (including a stray repeated closing point) are deduplicated before any
        canonicalization or triangulation.
     9. A ring with fewer than 3 unique points, or whose area is at or below epsilon, is rejected
        (dropped, counted in diagnostics.droppedDegenerateRings) rather than passed through malformed.
    10. Every output ring is rotated to start at its lexicographically smallest (x,z) vertex, with a
        deterministic outgoing-edge tie break — this is what makes output byte-identical for a shuffled
        input (dev/verify-polygon-kernel.mjs's determinism test).
    11. Output polygons are sorted by descending absolute area, then bounds, then vertex sequence.
    12. Holes are sorted by the same rule, scoped to their owning outer ring.

   Never edit vendor/earcut/earcut.js or vendor/polygon-clipping/polygon-clipping.js to make a Genesis
   test pass — every policy/conversion decision lives here, per §14. */

import polygonClippingLib from "../../../vendor/polygon-clipping/polygon-clipping.js";
import earcutDefault, { flatten as earcutFlatten } from "../../../vendor/earcut/earcut.js";
// UNIT G3 (docs/GEOMETRY-OSS-INTEGRATION.md §17.6, docs/STAGE-G3-WALL-RUNS.md) — the R1-selected
// wall-OFFSET kernel (dev/geometry-research/bakeoff/ruling.json: "wallOffset": "clipper2-ts"; adopted
// ADDITIVELY to polygon-clipping — that library has no offset/inflate primitive at all, so this is not
// a replacement of G1's boolean kernel, only a new capability). See
// vendor/clipper2-ts/README-GENESIS.md for exact pin/provenance. offsetRuns() (below) is the ONLY place
// this module's Point64/{x,y} convention is ever touched — no Clipper2-native type escapes this file,
// same rule G1 already established for polygon-clipping/earcut (§4).
import * as Clipper2 from "../../../vendor/clipper2-ts/index.js";

/** DEFAULT_EPSILON — world units, §5.7. Proven against the golden fixture corpus by
    dev/verify-polygon-kernel.mjs and dev/verify-geometry-fixtures.mjs's kernel-adapter section. */
export const DEFAULT_EPSILON = 1e-7;

/** DEFAULT_CLIPPER_SCALE — the mandatory integer quantization factor for offsetRuns()'s Clipper2 calls
    (§5.6's own note: "unlike clipper2-ts, which the R1 bakeoff found REQUIRES an integer CLIPPER_SCALE
    or it silently no-ops sub-1.0-unit deltas"). 4096 matches the R1 bakeoff's own default
    (dev/geometry-research/bakeoff/wall-offset-mapping-report.json's `clipperScaleComparison`: 1024/
    4096/65536 all produced visually indistinguishable, correctly-offset geometry on every tested
    fixture; 4096 is "a reasonable default for its round proportion to the 0.22 default wall thickness
    (901 integer units)", not because larger/smaller scales measurably underperformed). Overflow margin
    at this scale for a translated-far coordinate of 100000 world units is ~1,374,389x under
    Number.MAX_SAFE_INTEGER (same report) — comfortable for Genesis's actual room-scale coordinates. */
export const DEFAULT_CLIPPER_SCALE = 4096;

/** DEFAULT_MITER_LIMIT — Clipper2's own miterLimit parameter for offsetRuns()'s inflatePaths calls.
    4 matches the R1 bakeoff's own wallProfile.miterLimit default (wall-backends.mjs); ordinary 90-
    degree Genesis grid corners and 45-degree octagon chamfers sit far under this limit's blowup
    threshold (which only clamps very acute — near-parallel-reversal — angles to a bevel). */
export const DEFAULT_MITER_LIMIT = 4;

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Internal: plain-number guards
// ─────────────────────────────────────────────────────────────────────────────────────────────────

function isFiniteNum(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function isPointLike(p) {
  return !!p && isFiniteNum(p.x) && isFiniteNum(p.z);
}

function isRingLike(ring) {
  return Array.isArray(ring) && ring.every(isPointLike);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Internal: coordinate/winding/epsilon primitives (§5)
// ─────────────────────────────────────────────────────────────────────────────────────────────────

/** signedArea2D(ring) -> Genesis's own shoelace sign convention (positive == CCW), matching
    src/ui/theater-room-mesh.js's own signedArea2D exactly. Accepts an OPEN ring. */
function signedArea2D(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    sum += a.x * b.z - b.x * a.z;
  }
  return sum / 2;
}

function ringArea(ring) {
  return Math.abs(signedArea2D(ring));
}

/** dedupeConsecutive(ring, eps) -> §5.8: drop consecutive-equal points (incl. a repeated closing
    point). Input may be open or closed; output is always open. Never mutates the input. */
function dedupeConsecutive(ring, eps) {
  const out = [];
  for (const p of ring) {
    const prev = out[out.length - 1];
    if (!prev || Math.abs(prev.x - p.x) > eps || Math.abs(prev.z - p.z) > eps) out.push({ x: p.x, z: p.z });
  }
  while (out.length > 1) {
    const first = out[0], last = out[out.length - 1];
    if (Math.abs(first.x - last.x) <= eps && Math.abs(first.z - last.z) <= eps) out.pop();
    else break;
  }
  return out;
}

function ensureWinding(ring, wantCCW) {
  const isCCW = signedArea2D(ring) >= 0;
  if (isCCW === wantCCW) return ring.slice();
  return ring.slice().reverse();
}

function lexLess(a, b) {
  return a.x !== b.x ? a.x < b.x : a.z < b.z;
}

/** rotateToCanonicalStart(ring) -> §5.10: rotate to the lexicographically smallest (x,z) vertex, with
    a deterministic outgoing-edge tie break. Ring must already be deduped. */
function rotateToCanonicalStart(ring) {
  if (ring.length < 2) return ring.slice();
  let bestIdx = 0;
  for (let i = 1; i < ring.length; i++) {
    if (lexLess(ring[i], ring[bestIdx])) bestIdx = i;
  }
  const minPt = ring[bestIdx];
  const candidates = [];
  for (let i = 0; i < ring.length; i++) {
    if (Math.abs(ring[i].x - minPt.x) < 1e-12 && Math.abs(ring[i].z - minPt.z) < 1e-12) candidates.push(i);
  }
  if (candidates.length > 1) {
    candidates.sort((a, b) => {
      const na = ring[(a + 1) % ring.length], nb = ring[(b + 1) % ring.length];
      return lexLess(na, nb) ? -1 : lexLess(nb, na) ? 1 : 0;
    });
    bestIdx = candidates[0];
  }
  return ring.slice(bestIdx).concat(ring.slice(0, bestIdx));
}

/** canonicalizeRing(ring, wantCCW, eps) -> the full §5 pipeline for ONE ring: dedupe -> reject if
    degenerate -> enforce winding -> rotate to canonical start. Returns null (never throws) for a ring
    that fails §5.9 (< 3 unique points or area at/below epsilon). */
function canonicalizeRing(ring, wantCCW, eps) {
  const deduped = dedupeConsecutive(ring, eps);
  if (deduped.length < 3) return null;
  const area = ringArea(deduped);
  if (!(area > eps)) return null;
  const wound = ensureWinding(deduped, wantCCW);
  return rotateToCanonicalStart(wound);
}

function boundsOf(ring) {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  for (const p of ring) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.z < minZ) minZ = p.z;
    if (p.z > maxZ) maxZ = p.z;
  }
  return { minX, minZ, maxX, maxZ };
}

function vertexSeqKey(ring) {
  return ring.map((p) => `${p.x.toFixed(9)},${p.z.toFixed(9)}`).join("|");
}

/** comparePolygonsCanonical(a, b) -> §5.11-12 deterministic sort: descending abs area, then bounds,
    then vertex sequence. `a`/`b` are canonicalized rings. */
function comparePolygonsCanonical(a, b) {
  const areaDiff = ringArea(b) - ringArea(a);
  if (Math.abs(areaDiff) > 1e-9) return areaDiff > 0 ? 1 : -1;
  const ba = boundsOf(a), bb = boundsOf(b);
  if (ba.minX !== bb.minX) return ba.minX - bb.minX;
  if (ba.minZ !== bb.minZ) return ba.minZ - bb.minZ;
  if (ba.maxX !== bb.maxX) return ba.maxX - bb.maxX;
  if (ba.maxZ !== bb.maxZ) return ba.maxZ - bb.maxZ;
  const ka = vertexSeqKey(a), kb = vertexSeqKey(b);
  return ka < kb ? -1 : ka > kb ? 1 : 0;
}

/** canonicalizePolygonWithHoles({outer,holes}, eps, diag) -> canonicalizes the outer ring CCW and
    every hole CW, sorts holes by the §5.12 rule, drops degenerate holes/outer (diagnostics-countable
    via the shared `diag` accumulator). Returns null if the outer ring itself is degenerate. */
function canonicalizePolygonWithHoles(polygon, eps, diag) {
  const rawOuterDeduped = dedupeConsecutive(polygon.outer, eps);
  const rawOuterWasCCW = signedArea2D(rawOuterDeduped) >= 0;
  const outer = canonicalizeRing(polygon.outer, true, eps);
  if (!outer) {
    diag.droppedDegenerateRings += 1 + (polygon.holes ? polygon.holes.length : 0);
    return null;
  }
  if (!rawOuterWasCCW) diag.repairedWinding++;
  const holes = [];
  for (const h of polygon.holes || []) {
    const rawHoleDeduped = dedupeConsecutive(h, eps);
    if (rawHoleDeduped.length < 3) { diag.droppedDegenerateRings++; continue; }
    const rawHoleWasCCW = signedArea2D(rawHoleDeduped) >= 0;
    const c = canonicalizeRing(h, false, eps);
    if (!c) { diag.droppedDegenerateRings++; continue; }
    if (rawHoleWasCCW) diag.repairedWinding++; // was CCW, needed a flip to CW
    holes.push(c);
  }
  holes.sort(comparePolygonsCanonical);
  const area = ringArea(outer) - holes.reduce((s, h) => s + ringArea(h), 0);
  return { outer, holes, area, bounds: boundsOf(outer) };
}

/** canonicalizePolygonSet(polygons, eps, diag) -> array of canonicalizePolygonWithHoles results,
    sorted by the §5.11 polygon order. Drops fully-degenerate polygons (diag-countable). */
function canonicalizePolygonSet(polygons, eps, diag) {
  const out = [];
  for (const p of polygons || []) {
    const c = canonicalizePolygonWithHoles(p, eps, diag);
    if (c) out.push(c);
  }
  out.sort((a, b) => comparePolygonsCanonical(a.outer, b.outer));
  return out;
}

function countDedupeDrops(ringsFlat, eps, diag) {
  for (const ring of ringsFlat) {
    const before = ring.length;
    const after = dedupeConsecutive(ring, eps).length;
    diag.droppedDuplicatePoints += Math.max(0, before - after);
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Internal: ray-casting point-in-ring + a real (non-adjacent) ring self-intersection scan, shared by
// the union family's own self-check, validateSurface, and pointInSurface.
// ─────────────────────────────────────────────────────────────────────────────────────────────────

function pointInRing(pt, ring, eps) {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i].x, zi = ring[i].z, xj = ring[j].x, zj = ring[j].z;
    const denom = zj - zi;
    if (Math.abs(denom) < eps) continue; // horizontal edge contributes no crossing
    const intersect = zi > pt.z !== zj > pt.z && pt.x < (xj - xi) * (pt.z - zi) / denom + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function orient(p, q, r) {
  return (q.x - p.x) * (r.z - p.z) - (q.z - p.z) * (r.x - p.x);
}

function onSegBBox(p, q, r, eps) {
  return Math.min(p.x, r.x) - eps <= q.x && q.x <= Math.max(p.x, r.x) + eps &&
    Math.min(p.z, r.z) - eps <= q.z && q.z <= Math.max(p.z, r.z) + eps;
}

function segmentsIntersect(a1, a2, b1, b2, eps) {
  const o1 = orient(a1, a2, b1), o2 = orient(a1, a2, b2);
  const o3 = orient(b1, b2, a1), o4 = orient(b1, b2, a2);
  if ((o1 > eps && o2 < -eps || o1 < -eps && o2 > eps) && (o3 > eps && o4 < -eps || o3 < -eps && o4 > eps)) return true;
  if (Math.abs(o1) <= eps && onSegBBox(a1, b1, a2, eps)) return true;
  if (Math.abs(o2) <= eps && onSegBBox(a1, b2, a2, eps)) return true;
  if (Math.abs(o3) <= eps && onSegBBox(b1, a1, b2, eps)) return true;
  if (Math.abs(o4) <= eps && onSegBBox(b1, a2, b2, eps)) return true;
  return false;
}

/** ringSelfIntersections(ring, eps) -> list of {i,j} non-adjacent edge-index pairs that cross or
    touch — a genuine geometric self-intersection/pinch-point scan (O(n^2), fine at Genesis room
    scale), not a canned assumption. Adjacent edges (which always share exactly one endpoint) are
    always skipped. */
function ringSelfIntersections(ring, eps) {
  const found = [];
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue; // adjacent edges share an endpoint by construction
      const a1 = ring[i], a2 = ring[(i + 1) % n], b1 = ring[j], b2 = ring[(j + 1) % n];
      if (segmentsIntersect(a1, a2, b1, b2, eps)) found.push({ i, j });
    }
  }
  return found;
}

function collectSelfTouchIssues(polygons, eps) {
  const issues = [];
  polygons.forEach((poly, pi) => {
    const outerHits = ringSelfIntersections(poly.outer, eps);
    if (outerHits.length) {
      issues.push({
        level: "warn", typed: "ring-self-touch", polygonIndex: pi, ringKind: "outer",
        message: `outer ring self-touches/pinches at ${outerHits.length} non-adjacent edge pair(s)`,
      });
    }
    poly.holes.forEach((h, hi) => {
      const hits = ringSelfIntersections(h, eps);
      if (hits.length) {
        issues.push({
          level: "warn", typed: "ring-self-touch", polygonIndex: pi, ringKind: "hole", ringIndex: hi,
          message: `hole ring self-touches/pinches at ${hits.length} non-adjacent edge pair(s)`,
        });
      }
    });
  });
  return issues;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Internal: polygon-clipping conversion boundary (§4/§5.5 — the ONLY place library winding/closure
// conventions are touched). polygon-clipping's own Polygon shape is [ring0, ring1, ...] where ring0 is
// always the exterior and ring1.. are always holes BY ARGUMENT POSITION, not by inferred winding — so
// no winding conversion is required going IN; only ring closure (open -> closed) is.
// ─────────────────────────────────────────────────────────────────────────────────────────────────

function toLibRing(ring) {
  const closed = ring.map((p) => [p.x, p.z]);
  closed.push([ring[0].x, ring[0].z]);
  return closed;
}

function polygonToLibPolygon(poly) {
  return [toLibRing(poly.outer), ...(poly.holes || []).map(toLibRing)];
}

function cellToLibPolygon(cell) {
  const { x, z } = cell;
  const ring = [
    { x: x - 0.5, z: z - 0.5 },
    { x: x + 0.5, z: z - 0.5 },
    { x: x + 0.5, z: z + 0.5 },
    { x: x - 0.5, z: z + 0.5 },
  ];
  return [toLibRing(ring)];
}

/** libMultiPolygonToPolygons(libResult) -> plain {outer,holes} list, ring closure reopened (closing
    point dropped). Winding is NOT yet Genesis-canonicalized here — canonicalizePolygonSet (called by
    every public function immediately after this) owns that, per §5.5. */
function libMultiPolygonToPolygons(libResult) {
  const out = [];
  for (const libPoly of libResult || []) {
    const rings = libPoly.map((ring) => {
      const pts = ring.map(([x, z]) => ({ x, z }));
      if (pts.length > 1) {
        const first = pts[0], last = pts[pts.length - 1];
        if (Math.abs(first.x - last.x) < 1e-9 && Math.abs(first.z - last.z) < 1e-9) pts.pop();
      }
      return pts;
    });
    out.push({ outer: rings[0] || [], holes: rings.slice(1) });
  }
  return out;
}

function totalPolygonSetArea(polys) {
  return polys.reduce((s, p) => s + p.area, 0);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Internal: typed-diagnostic, never-throw result shapes (§4's contract + the "malformed input gets a
// typed diagnostic, never a throw/blank" negative control this unit fixes over legacy).
// ─────────────────────────────────────────────────────────────────────────────────────────────────

function emptyUnionResult(message) {
  return {
    polygons: [],
    diagnostics: {
      droppedDuplicatePoints: 0, droppedDegenerateRings: 0, repairedWinding: 0,
      inputArea: 0, outputArea: 0, areaDelta: 0,
      issues: message ? [{ level: "error", typed: "malformed-input", message }] : [],
    },
  };
}

function emptyTriResult(message) {
  return {
    vertices: [], indices: [], trianglePolygonIds: [], area: 0,
    diagnostics: {
      zeroAreaTriangles: 0, reversedTriangles: 0, centroidOutsideSurface: 0, centroidInsideHole: 0,
      areaDelta: 0,
      issues: message ? [{ level: "error", typed: "malformed-input", message }] : [],
    },
  };
}

/** normalizeSurfaceInput(surface) -> a plain polygon list from any of the three accepted surface
    shapes ({polygons:[...]}, a bare polygon array, or one bare {outer,holes} polygon), or null with a
    reason string if the input matches none of them. Shared by every function whose `surface` param is
    polymorphic per §4 (triangulateSurface/validateSurface/pointInSurface/surfaceArea all accept the
    same three shapes for caller convenience). */
function normalizeSurfaceInput(surface) {
  if (surface && Array.isArray(surface.polygons)) return { list: surface.polygons, reason: null };
  if (Array.isArray(surface)) return { list: surface, reason: null };
  if (surface && Array.isArray(surface.outer)) return { list: [surface], reason: null };
  return { list: null, reason: "input is not a polygon, a polygon array, or a {polygons:[...]} surface" };
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// Public API (docs/GEOMETRY-OSS-INTEGRATION.md §4)
// ─────────────────────────────────────────────────────────────────────────────────────────────────

/** unionCellRects(cells, options) -> {polygons:[{outer,holes,area,bounds}], diagnostics}.
    `cells`: [{x,z}, ...] — each cell is unioned as its own closed unit square, per §5.2. Duplicate
    (x,z) cells are deduplicated before union (never double-count area). Corner-touching cells produce
    separate polygons (no invented diagonal bridge); edge-touching cells merge. Never throws — a
    malformed/empty input returns a typed diagnostic and an empty polygon list. */
export function unionCellRects(cells, options = {}) {
  const eps = typeof options.epsilon === "number" ? options.epsilon : DEFAULT_EPSILON;
  try {
    if (!Array.isArray(cells) || cells.length === 0) return emptyUnionResult("unionCellRects: empty or missing cells array");
    for (const c of cells) {
      if (!c || !isFiniteNum(c.x) || !isFiniteNum(c.z)) {
        return emptyUnionResult("unionCellRects: a cell has a non-finite or missing x/z");
      }
    }
    const seen = new Map();
    for (const c of cells) seen.set(`${c.x},${c.z}`, c);
    const uniqueCells = Array.from(seen.values());
    const inputArea = uniqueCells.length; // §5.2: one cell == exactly 1 world-unit^2

    let libResult;
    try {
      libResult = polygonClippingLib.union(uniqueCells.map(cellToLibPolygon));
    } catch (e) {
      return emptyUnionResult(`unionCellRects: polygon-clipping union threw: ${String((e && e.message) || e)}`);
    }

    const diag = { droppedDuplicatePoints: 0, droppedDegenerateRings: 0, repairedWinding: 0 };
    const rawPolys = libMultiPolygonToPolygons(libResult);
    countDedupeDrops(rawPolys.flatMap((p) => [p.outer, ...p.holes]), eps, diag);
    const polygons = canonicalizePolygonSet(rawPolys, eps, diag);
    const outputArea = totalPolygonSetArea(polygons);
    const issues = collectSelfTouchIssues(polygons, eps);

    return {
      polygons,
      diagnostics: {
        droppedDuplicatePoints: diag.droppedDuplicatePoints,
        droppedDegenerateRings: diag.droppedDegenerateRings,
        repairedWinding: diag.repairedWinding,
        inputArea, outputArea, areaDelta: outputArea - inputArea,
        issues,
      },
    };
  } catch (e) {
    return emptyUnionResult(`unionCellRects threw unexpectedly: ${String((e && e.stack) || e)}`);
  }
}

/** unionPolygons(polygons, options) -> same return shape as unionCellRects. `polygons`:
    [{outer,holes}, ...] — arbitrary polygons-with-holes, unioned together. */
export function unionPolygons(polygons, options = {}) {
  const eps = typeof options.epsilon === "number" ? options.epsilon : DEFAULT_EPSILON;
  try {
    if (!Array.isArray(polygons) || polygons.length === 0) return emptyUnionResult("unionPolygons: empty or missing polygons array");
    for (const p of polygons) {
      if (!p || !isRingLike(p.outer) || p.outer.length < 3) return emptyUnionResult("unionPolygons: a polygon has an invalid outer ring");
      if (p.holes && (!Array.isArray(p.holes) || p.holes.some((h) => !isRingLike(h)))) {
        return emptyUnionResult("unionPolygons: a polygon has an invalid hole ring");
      }
    }
    const inputArea = polygons.reduce((s, p) => s + ringArea(p.outer) - (p.holes || []).reduce((s2, h) => s2 + ringArea(h), 0), 0);

    let libResult;
    try {
      libResult = polygonClippingLib.union(polygons.map(polygonToLibPolygon));
    } catch (e) {
      return emptyUnionResult(`unionPolygons: polygon-clipping union threw: ${String((e && e.message) || e)}`);
    }

    const diag = { droppedDuplicatePoints: 0, droppedDegenerateRings: 0, repairedWinding: 0 };
    const rawPolys = libMultiPolygonToPolygons(libResult);
    countDedupeDrops(rawPolys.flatMap((p) => [p.outer, ...p.holes]), eps, diag);
    const canon = canonicalizePolygonSet(rawPolys, eps, diag);
    const outputArea = totalPolygonSetArea(canon);
    const issues = collectSelfTouchIssues(canon, eps);

    return {
      polygons: canon,
      diagnostics: {
        droppedDuplicatePoints: diag.droppedDuplicatePoints,
        droppedDegenerateRings: diag.droppedDegenerateRings,
        repairedWinding: diag.repairedWinding,
        inputArea, outputArea, areaDelta: outputArea - inputArea,
        issues,
      },
    };
  } catch (e) {
    return emptyUnionResult(`unionPolygons threw unexpectedly: ${String((e && e.stack) || e)}`);
  }
}

/** differencePolygons(subject, clips, options) -> subject minus every polygon in `clips` (a single
    polygon or an array of polygons). Same return shape as unionCellRects. */
export function differencePolygons(subject, clips, options = {}) {
  const eps = typeof options.epsilon === "number" ? options.epsilon : DEFAULT_EPSILON;
  try {
    if (!subject || !isRingLike(subject.outer) || subject.outer.length < 3) {
      return emptyUnionResult("differencePolygons: subject has an invalid outer ring");
    }
    const clipList = Array.isArray(clips) ? clips : clips ? [clips] : [];
    for (const c of clipList) {
      if (!c || !isRingLike(c.outer) || c.outer.length < 3) return emptyUnionResult("differencePolygons: a clip polygon has an invalid outer ring");
    }
    const inputArea = ringArea(subject.outer) - (subject.holes || []).reduce((s, h) => s + ringArea(h), 0);

    let libResult;
    try {
      libResult = polygonClippingLib.difference(polygonToLibPolygon(subject), ...clipList.map(polygonToLibPolygon));
    } catch (e) {
      return emptyUnionResult(`differencePolygons: polygon-clipping difference threw: ${String((e && e.message) || e)}`);
    }

    const diag = { droppedDuplicatePoints: 0, droppedDegenerateRings: 0, repairedWinding: 0 };
    const rawPolys = libMultiPolygonToPolygons(libResult);
    countDedupeDrops(rawPolys.flatMap((p) => [p.outer, ...p.holes]), eps, diag);
    const canon = canonicalizePolygonSet(rawPolys, eps, diag);
    const outputArea = totalPolygonSetArea(canon);
    const issues = collectSelfTouchIssues(canon, eps);

    return {
      polygons: canon,
      diagnostics: {
        droppedDuplicatePoints: diag.droppedDuplicatePoints,
        droppedDegenerateRings: diag.droppedDegenerateRings,
        repairedWinding: diag.repairedWinding,
        inputArea, outputArea, areaDelta: outputArea - inputArea,
        issues,
      },
    };
  } catch (e) {
    return emptyUnionResult(`differencePolygons threw unexpectedly: ${String((e && e.stack) || e)}`);
  }
}

/** intersectPolygons(subject, clips, options) -> subject intersected with every polygon in `clips`.
    Same return shape as unionCellRects. */
export function intersectPolygons(subject, clips, options = {}) {
  const eps = typeof options.epsilon === "number" ? options.epsilon : DEFAULT_EPSILON;
  try {
    if (!subject || !isRingLike(subject.outer) || subject.outer.length < 3) {
      return emptyUnionResult("intersectPolygons: subject has an invalid outer ring");
    }
    const clipList = Array.isArray(clips) ? clips : clips ? [clips] : [];
    for (const c of clipList) {
      if (!c || !isRingLike(c.outer) || c.outer.length < 3) return emptyUnionResult("intersectPolygons: a clip polygon has an invalid outer ring");
    }
    const inputArea = ringArea(subject.outer) - (subject.holes || []).reduce((s, h) => s + ringArea(h), 0);

    let libResult;
    try {
      libResult = polygonClippingLib.intersection(polygonToLibPolygon(subject), ...clipList.map(polygonToLibPolygon));
    } catch (e) {
      return emptyUnionResult(`intersectPolygons: polygon-clipping intersection threw: ${String((e && e.message) || e)}`);
    }

    const diag = { droppedDuplicatePoints: 0, droppedDegenerateRings: 0, repairedWinding: 0 };
    const rawPolys = libMultiPolygonToPolygons(libResult);
    countDedupeDrops(rawPolys.flatMap((p) => [p.outer, ...p.holes]), eps, diag);
    const canon = canonicalizePolygonSet(rawPolys, eps, diag);
    const outputArea = totalPolygonSetArea(canon);
    const issues = collectSelfTouchIssues(canon, eps);

    return {
      polygons: canon,
      diagnostics: {
        droppedDuplicatePoints: diag.droppedDuplicatePoints,
        droppedDegenerateRings: diag.droppedDegenerateRings,
        repairedWinding: diag.repairedWinding,
        inputArea, outputArea, areaDelta: outputArea - inputArea,
        issues,
      },
    };
  } catch (e) {
    return emptyUnionResult(`intersectPolygons threw unexpectedly: ${String((e && e.stack) || e)}`);
  }
}

/** normalizeMultiPolygon(input, options) -> the §5 canonicalization pipeline WITHOUT any boolean
    operation — for already-correct/disjoint multipolygon data (e.g. rolled terrain patches) that just
    needs dedup/winding/rotation/sort, not a union pass. Accepts a {polygons:[...]} surface, a bare
    polygon array, or a single {outer,holes} polygon. Same return shape as unionCellRects. */
export function normalizeMultiPolygon(input, options = {}) {
  const eps = typeof options.epsilon === "number" ? options.epsilon : DEFAULT_EPSILON;
  try {
    const { list, reason } = normalizeSurfaceInput(input);
    if (!list) return emptyUnionResult(`normalizeMultiPolygon: ${reason}`);
    for (const p of list) {
      if (!p || !isRingLike(p.outer)) return emptyUnionResult("normalizeMultiPolygon: an element is missing a valid outer ring");
    }
    const inputArea = list.reduce((s, p) => s + ringArea(p.outer) - (p.holes || []).reduce((s2, h) => s2 + ringArea(h), 0), 0);

    const diag = { droppedDuplicatePoints: 0, droppedDegenerateRings: 0, repairedWinding: 0 };
    countDedupeDrops(list.flatMap((p) => [p.outer, ...(p.holes || [])]), eps, diag);
    const canon = canonicalizePolygonSet(list, eps, diag);
    const outputArea = totalPolygonSetArea(canon);
    const issues = collectSelfTouchIssues(canon, eps);

    return {
      polygons: canon,
      diagnostics: {
        droppedDuplicatePoints: diag.droppedDuplicatePoints,
        droppedDegenerateRings: diag.droppedDegenerateRings,
        repairedWinding: diag.repairedWinding,
        inputArea, outputArea, areaDelta: outputArea - inputArea,
        issues,
      },
    };
  } catch (e) {
    return emptyUnionResult(`normalizeMultiPolygon threw unexpectedly: ${String((e && e.stack) || e)}`);
  }
}

/** triangulateSurface(surface, options) -> {vertices,indices,trianglePolygonIds,area,diagnostics}.
    Accepts a {polygons:[...]} surface, a bare polygon array, or a single {outer,holes} polygon.
    Earcut-triangulates EACH polygon (outer + holes) independently, then concatenates into one shared
    vertex/index buffer with `trianglePolygonIds[i]` naming which input polygon triangle `i` came from
    (source-polygon-id, §4's own worked return-type example). Winding is corrected to earcut's expected
    convention (outer CCW, holes CW — the SAME relative convention Genesis already uses, §5.4) before
    triangulating, independent of whatever winding the caller's `surface` happens to carry. Never
    throws — a polygon that fails to triangulate contributes zero triangles and is reflected in
    diagnostics.areaDelta, never a partial/corrupt buffer. */
export function triangulateSurface(surface, options = {}) {
  const eps = typeof options.epsilon === "number" ? options.epsilon : DEFAULT_EPSILON;
  try {
    const { list, reason } = normalizeSurfaceInput(surface);
    if (!list) return emptyTriResult(`triangulateSurface: ${reason}`);

    const vertices = [];
    const indices = [];
    const trianglePolygonIds = [];
    let zeroAreaTriangles = 0, reversedTriangles = 0, centroidOutsideSurface = 0, centroidInsideHole = 0;
    let signedAreaSum = 0;
    let inputArea = 0;

    list.forEach((poly, polyIdx) => {
      if (!poly || !isRingLike(poly.outer)) return; // skip a malformed entry rather than abort the whole surface
      const outer = canonicalizeRing(poly.outer, true, eps);
      if (!outer) return; // degenerate outer -> zero triangles for this polygon, counted via areaDelta
      const holes = (poly.holes || []).map((h) => canonicalizeRing(h, false, eps)).filter(Boolean);
      inputArea += ringArea(outer) - holes.reduce((s, h) => s + ringArea(h), 0);

      const ringsForEarcut = [outer, ...holes];
      let flat, tris;
      try {
        flat = earcutFlatten(ringsForEarcut.map((r) => r.map((p) => [p.x, p.z])));
        tris = earcutDefault(flat.vertices, flat.holes, flat.dimensions);
      } catch (e) {
        return; // typed via areaDelta (this polygon's area never lands in the output total)
      }

      const base = vertices.length;
      for (let i = 0; i < flat.vertices.length; i += 2) vertices.push({ x: flat.vertices[i], z: flat.vertices[i + 1] });
      for (let i = 0; i < tris.length; i += 3) {
        const ia = tris[i], ib = tris[i + 1], ic = tris[i + 2];
        const a = vertices[base + ia], b = vertices[base + ib], c = vertices[base + ic];
        const signed = ((b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z)) / 2;
        signedAreaSum += signed;
        if (Math.abs(signed) < eps) zeroAreaTriangles++;
        else if (signed < 0) reversedTriangles++; // outer was fed CCW (positive) to earcut
        const cx = (a.x + b.x + c.x) / 3, cz = (a.z + b.z + c.z) / 3;
        const centroid = { x: cx, z: cz };
        if (!pointInRing(centroid, outer, eps)) centroidOutsideSurface++;
        else if (holes.some((h) => pointInRing(centroid, h, eps))) centroidInsideHole++;
        indices.push(base + ia, base + ib, base + ic);
        trianglePolygonIds.push(polyIdx);
      }
    });

    const area = Math.abs(signedAreaSum);
    return {
      vertices, indices, trianglePolygonIds, area,
      diagnostics: {
        zeroAreaTriangles, reversedTriangles, centroidOutsideSurface, centroidInsideHole,
        areaDelta: area - inputArea,
        issues: [],
      },
    };
  } catch (e) {
    return emptyTriResult(`triangulateSurface threw unexpectedly: ${String((e && e.stack) || e)}`);
  }
}

/** validateSurface(surface, options) -> {valid, polygonCount, holeCount, issues:[...]}. Accepts a
    {polygons:[...]} surface, a bare polygon array, or a single {outer,holes} polygon. Checks: minimum
    vertex count, minimum area, ring self-intersection/pinch, and hole-inside-outer containment. Never
    throws — an unrecognized input shape is reported as `valid:false` with a typed issue, never an
    exception. */
export function validateSurface(surface, options = {}) {
  const eps = typeof options.epsilon === "number" ? options.epsilon : DEFAULT_EPSILON;
  try {
    const { list, reason } = normalizeSurfaceInput(surface);
    if (!list) return { valid: false, polygonCount: 0, holeCount: 0, issues: [{ level: "error", typed: "malformed-input", message: `validateSurface: ${reason}` }] };

    const issues = [];
    let polygonCount = 0, holeCount = 0;
    list.forEach((poly, pi) => {
      if (!poly || !Array.isArray(poly.outer)) {
        issues.push({ level: "error", polygonIndex: pi, message: "missing or invalid outer ring" });
        return;
      }
      polygonCount++;
      const outerDeduped = dedupeConsecutive(poly.outer, eps);
      if (outerDeduped.length < 3) {
        issues.push({ level: "error", polygonIndex: pi, ringKind: "outer", message: "outer ring has fewer than 3 unique points after dedup" });
        return;
      }
      if (ringArea(outerDeduped) <= eps) {
        issues.push({ level: "error", polygonIndex: pi, ringKind: "outer", message: "outer ring area is at or below epsilon" });
        return;
      }
      const outerHits = ringSelfIntersections(outerDeduped, eps);
      if (outerHits.length) {
        issues.push({ level: "warn", polygonIndex: pi, ringKind: "outer", message: `outer ring self-intersects/pinches at ${outerHits.length} non-adjacent edge pair(s)` });
      }
      (poly.holes || []).forEach((h, hi) => {
        holeCount++;
        const hDeduped = dedupeConsecutive(h, eps);
        if (hDeduped.length < 3) {
          issues.push({ level: "error", polygonIndex: pi, ringKind: "hole", ringIndex: hi, message: "hole ring has fewer than 3 unique points after dedup" });
          return;
        }
        if (ringArea(hDeduped) <= eps) {
          issues.push({ level: "error", polygonIndex: pi, ringKind: "hole", ringIndex: hi, message: "hole ring area is at or below epsilon" });
          return;
        }
        const hHits = ringSelfIntersections(hDeduped, eps);
        if (hHits.length) {
          issues.push({ level: "warn", polygonIndex: pi, ringKind: "hole", ringIndex: hi, message: `hole ring self-intersects/pinches at ${hHits.length} non-adjacent edge pair(s)` });
        }
        const anyOutside = hDeduped.some((p) => !pointInRing(p, outerDeduped, eps));
        if (anyOutside) {
          issues.push({ level: "error", polygonIndex: pi, ringKind: "hole", ringIndex: hi, message: "hole ring has a vertex outside its owning outer ring" });
        }
      });
    });

    const valid = !issues.some((i) => i.level === "error");
    return { valid, polygonCount, holeCount, issues };
  } catch (e) {
    return { valid: false, polygonCount: 0, holeCount: 0, issues: [{ level: "error", typed: "malformed-input", message: `validateSurface threw unexpectedly: ${String((e && e.stack) || e)}` }] };
  }
}

/** pointInSurface(point, surface, epsilon) -> boolean. True iff `point` is inside some polygon's
    outer ring and not inside any of that polygon's holes. Accepts the same three `surface` shapes as
    triangulateSurface/validateSurface. Never throws — any malformed input resolves to `false`. */
export function pointInSurface(point, surface, epsilon = DEFAULT_EPSILON) {
  try {
    if (!isPointLike(point)) return false;
    const { list } = normalizeSurfaceInput(surface);
    if (!list) return false;
    for (const poly of list) {
      if (!poly || !isRingLike(poly.outer) || poly.outer.length < 3) continue;
      if (!pointInRing(point, poly.outer, epsilon)) continue;
      const inHole = (poly.holes || []).some((h) => isRingLike(h) && pointInRing(point, h, epsilon));
      if (!inHole) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/** surfaceArea(surface) -> total signed-consistent area (sum of each polygon's outer area minus its
    holes' areas). Accepts the same three `surface` shapes as triangulateSurface. Never throws — a
    malformed input resolves to 0. */
export function surfaceArea(surface) {
  try {
    const { list } = normalizeSurfaceInput(surface);
    if (!list) return 0;
    let total = 0;
    for (const poly of list) {
      if (!poly || !isRingLike(poly.outer)) continue;
      total += ringArea(poly.outer) - (poly.holes || []).filter(isRingLike).reduce((s, h) => s + ringArea(h), 0);
    }
    return total;
  } catch (e) {
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// UNIT G3 (docs/GEOMETRY-OSS-INTEGRATION.md §8, §17.6, docs/STAGE-G3-WALL-RUNS.md) — offsetRuns(): the
// aperture-delimited-run wall-offset primitive. A "run" is a maximal contiguous OPEN polyline of solid-
// wall boundary points (the CALLER splits the boundary at door/open/riser hard breaks BEFORE calling
// this — offsetRuns has no aperture concept of its own, matching §4's "PolygonKernel is pure geometry,
// policy lives in the caller" boundary). Convention (§5, matches theater-room-mesh.js's own
// segmentNormal/ensureCCW exactly): `run.points` is an ordered polyline walking the SAME direction as a
// CCW-wound ring, i.e. the run's own interior side is to the LEFT of travel — offsetRuns always offsets
// to the RIGHT (outward, away from the interior) by `thickness`.
// ─────────────────────────────────────────────────────────────────────────────────────────────────

function runLeftNormal(a, b) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: -dz / len, z: dx / len }; // inward, same formula as theater-room-mesh.js's segmentNormal
}

function runToClipperPath(points, scale) {
  return points.map((p) => ({ x: Math.round(p.x * scale), y: Math.round(p.z * scale) }));
}

function fromClipperPoint(p, scale) {
  return { x: p.x / scale, z: p.y / scale };
}

/** naiveRunOffset(points, thickness) -> the plain per-segment endpoint offset (§8's own documented
    legacy baseline formula, `outerA = innerA - n*wallThickness`, computed independently per segment —
    NOT a true miter). Used ONLY as offsetRuns' own last-resort per-run fallback when Clipper2's offset
    can't be matched 1:1 to every source segment (a genuine miter-limit bevel injection, or a degenerate
    run) — never silently substituted for a run that DID offset cleanly. */
function naiveRunOffset(points, thickness) {
  const n = points.length;
  const out = new Array(n);
  for (let i = 0; i < n - 1; i++) {
    const nrm = runLeftNormal(points[i], points[i + 1]);
    const outerA = { x: points[i].x - nrm.x * thickness, z: points[i].z - nrm.z * thickness };
    const outerB = { x: points[i + 1].x - nrm.x * thickness, z: points[i + 1].z - nrm.z * thickness };
    out[i] = outerA;
    out[i + 1] = outerB; // last writer wins at interior vertices — this IS the naive per-segment gap
  }
  return out;
}

/** offsetOneRun(points, thickness, scale, miterLimit, closed) -> {outerPoints, diagnostics} for ONE
    run. `closed` (default false): a run with NO aperture/riser break anywhere on its owning ring at all
    (a fully solid boundary, e.g. a windowless octagon) has no true jamb endpoint to butt-cap against —
    the caller passes `closed:true` and `points` WITHOUT a repeated closing point (matching every other
    ring convention in this module, §5.3), and this offsets the WHOLE RING as one closed Clipper2 polygon
    (EndType.Polygon) instead of an open Butt path, so the wraparound corner gets a real miter too
    (exactly Strategy A's whole-ring technique, dev/geometry-research/bakeoff/wall-backends.mjs — proven
    cornerJoinsUnclaimed=0 on every non-door fixture the bakeoff tested — legitimate here specifically
    BECAUSE there is no aperture anywhere on this ring to make Strategy A's own door-adjacency failure
    mode possible). A closed-ring Clipper2 Polygon offset already returns ONLY the one wanted (outward)
    side directly — no inner/outer side-classification is needed the way the open-run Butt case requires.

    Algorithm for the open (run) case (docs/STAGE-G3-WALL-RUNS.md's own "offset each complete run with
    Clipper2… every interior corner within that run receives a true joined miter"):
      1. Offset the WHOLE run as one open Clipper2 path (EndType.Butt — no cap overshoot past the run's
         own true endpoints, §8's "butt/square jamb termination, no bridging the opening"). This is what
         gives INTERIOR corners a real single-point miter join (unlike a naive per-segment offset, which
         independently computes each segment's own endpoint and never asks Clipper2 to resolve a shared
         corner at all).
      2. Clipper2's open-path offset returns BOTH sides of the polyline (a closed "sausage" ring) — for
         each of the run's K segments, find the ONE ring edge that's parallel to and near that segment's
         own naive outward offset (Strategy A's own matching technique — reused here scoped to a SINGLE
         run, where it is unambiguous by construction: no door/other-run edges ever compete for a match,
         which is exactly what made whole-ring Strategy A's source match rate degrade to 33-60% near
         doors and this run-scoped version doesn't inherit).
      3. Chain the K matched edges in original segment order: if edge[j]'s "B" endpoint coincides with
         edge[j+1]'s "A" endpoint within epsilon, that shared point IS the true joined miter (join gap
         0). If it doesn't (a genuine bevel/round injection from an acute corner beyond miterLimit, or a
         matching failure), the WHOLE RUN falls back to naiveRunOffset (never a partial/mixed result) —
         recorded as `degraded:true` with a reason, never silently hidden. The `closed` case follows the
         SAME matching/chaining logic, just against every one of the ring's K segments (K === points.length,
         no separate endpoint) with the join check wrapping from segment K-1 back to segment 0 too. */
function offsetOneRun(points, thickness, scale, miterLimit, closed) {
  const K = closed ? points.length : points.length - 1; // segment count
  const minPts = closed ? 3 : 2;
  if (points.length < minPts || !(thickness > 0)) {
    return {
      outerPoints: points.map((p) => ({ x: p.x, z: p.z })),
      diagnostics: { matchedSegments: 0, totalSegments: Math.max(0, K), joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: `run has fewer than ${minPts} points or non-positive thickness` },
    };
  }
  let offsetPaths;
  try {
    const path = runToClipperPath(points, scale);
    offsetPaths = closed
      ? Clipper2.inflatePaths([path], Math.round(thickness * scale), Clipper2.JoinType.Miter, Clipper2.EndType.Polygon, miterLimit)
      : Clipper2.inflatePaths([path], Math.round(thickness * scale), Clipper2.JoinType.Miter, Clipper2.EndType.Butt, miterLimit);
  } catch (e) {
    return {
      outerPoints: naiveRunOffset(closed ? points.concat([points[0]]) : points, thickness).slice(0, points.length),
      diagnostics: { matchedSegments: 0, totalSegments: K, joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: `Clipper2 inflatePaths threw: ${String((e && e.message) || e)}` },
    };
  }
  const fallbackOuter = () => closed
    ? naiveRunOffset(points.concat([points[0]]), thickness).slice(0, points.length)
    : naiveRunOffset(points, thickness);
  if (!offsetPaths || !offsetPaths.length || offsetPaths[0].length < (closed ? 3 : 4)) {
    // fewer points than the minimum viable offset shape — degrade rather than guess. (A run whose
    // Clipper2 result TRIMS a truly-collinear interior vertex, e.g. two same-direction segments that
    // simplifySegments upstream would ordinarily already have merged into one, still safely resolves
    // below: both segments independently best-match the SAME merged ring edge — no exclusivity
    // constraint forces a distinct edge per segment, since two genuinely distinct segments in every real
    // fixture this spec covers already sit at spatially distinct expected positions and never contend
    // for the same best match in practice.)
    return {
      outerPoints: fallbackOuter(),
      diagnostics: { matchedSegments: 0, totalSegments: K, joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: "empty or under-shaped Clipper2 offset result" },
    };
  }
  const ring = offsetPaths[0].map((p) => fromClipperPoint(p, scale));
  const ringEdges = ring.map((a, i) => ({ a, b: ring[(i + 1) % ring.length] }));
  const matchedEdges = new Array(K).fill(null);
  for (let j = 0; j < K; j++) {
    const a = points[j], b = points[(j + 1) % points.length];
    const nrm = runLeftNormal(a, b);
    const expA = { x: a.x - nrm.x * thickness, z: a.z - nrm.z * thickness };
    const expB = { x: b.x - nrm.x * thickness, z: b.z - nrm.z * thickness };
    const expMid = { x: (expA.x + expB.x) / 2, z: (expA.z + expB.z) / 2 };
    const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1;
    const expDir = { x: dx / len, z: dz / len };
    // distance tolerance scales with the segment's own half-length (a long run segment's true miter
    // point can legitimately sit further from a naive midpoint than the R1 whole-ring bakeoff's fixed
    // constant assumed — that constant was tuned for cross-door ring-wide disambiguation, a concern that
    // doesn't apply at run scope; also covers the case where Clipper2 trims a truly-collinear interior
    // vertex a caller passed by mistake, merging what should already have been one segment).
    const distTolerance = Math.max(0.5, thickness + 0.25, len / 2 + 0.05);
    let best = null, bestScore = Infinity;
    ringEdges.forEach((e) => {
      const edx = e.b.x - e.a.x, edz = e.b.z - e.a.z, elen = Math.hypot(edx, edz) || 1;
      const eDir = { x: edx / elen, z: edz / elen };
      // SIGNED direction match only (not abs) — the outward-offset side of a Butt-open-path offset
      // always runs in the SAME direction as its source segment; the inward-offset side (never wanted)
      // runs reversed. Requiring a positive dot excludes it structurally, not just by distance luck.
      // (The closed-ring Polygon case has no inner side at all, but the same signed test is harmless
      // and keeps this loop body identical between the two modes.)
      const parallel = eDir.x * expDir.x + eDir.z * expDir.z;
      const eMid = { x: (e.a.x + e.b.x) / 2, z: (e.a.z + e.b.z) / 2 };
      const dist = Math.hypot(eMid.x - expMid.x, eMid.z - expMid.z);
      if (parallel > 0.9 && dist < distTolerance) {
        const score = dist + (1 - parallel);
        if (score < bestScore) { bestScore = score; best = { e, dist }; }
      }
    });
    if (!best) continue; // leaves matchedEdges[j] null -> degrade below
    // nearest-endpoint pairing (dev/geometry-research/bakeoff/wall-backends.mjs Strategy B's own proven
    // technique) — unambiguous because outerA/outerB of a thin offset rectangle are NOT equidistant from
    // an arbitrary target the way both corners are from the segment midpoint.
    const dA = Math.hypot(best.e.a.x - expA.x, best.e.a.z - expA.z);
    const dB = Math.hypot(best.e.b.x - expA.x, best.e.b.z - expA.z);
    matchedEdges[j] = dA <= dB ? { outerA: best.e.a, outerB: best.e.b } : { outerA: best.e.b, outerB: best.e.a };
  }
  const matchedCount = matchedEdges.filter(Boolean).length;
  if (matchedCount < K) {
    return {
      outerPoints: fallbackOuter(),
      diagnostics: { matchedSegments: matchedCount, totalSegments: K, joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: `only ${matchedCount}/${K} segments matched a Clipper2 offset edge` },
    };
  }
  const outerPoints = new Array(points.length);
  let joinGapCount = 0, maxJoinGap = 0;
  const joinChecks = closed ? K : K - 1; // open run: K-1 interior joins; closed ring: K joins (incl. wraparound)
  for (let j = 0; j < joinChecks; j++) {
    const cur = matchedEdges[j], next = matchedEdges[(j + 1) % K];
    const gap = Math.hypot(cur.outerB.x - next.outerA.x, cur.outerB.z - next.outerA.z);
    if (gap > maxJoinGap) maxJoinGap = gap;
    if (gap > 1e-6) joinGapCount++;
  }
  if (joinGapCount > 0) {
    // a genuine miter-limit bevel (or other join defect) — the run offset a clean single-side chain per
    // segment, but at least one interior join didn't land on one shared point. §STAGE-G3-WALL-RUNS.md's
    // bar is ZERO unclaimed/ungapped joins, so this run degrades to the naive fallback rather than
    // silently reporting a "matched" run that still has a gap.
    return {
      outerPoints: fallbackOuter(),
      diagnostics: { matchedSegments: matchedCount, totalSegments: K, joinGapCount, maxJoinGap, degraded: true, reason: "one or more interior joins exceeded epsilon (likely a miter-limit bevel injection)" },
    };
  }
  if (closed) {
    for (let j = 0; j < K; j++) outerPoints[j] = matchedEdges[j].outerA;
  } else {
    outerPoints[0] = matchedEdges[0].outerA;
    for (let j = 0; j < K; j++) outerPoints[j + 1] = matchedEdges[j].outerB;
  }
  return {
    outerPoints,
    diagnostics: { matchedSegments: matchedCount, totalSegments: K, joinGapCount: 0, maxJoinGap: 0, degraded: false, reason: null },
  };
}

/** offsetRuns(runs, options) -> {results:[{outerPoints,diagnostics}, ...], diagnostics:{...summary}}.
    `runs`: Array<{points: Array<{x,z}>}> — each a maximal contiguous solid-wall boundary run (the
    caller splits at aperture/riser/open hard breaks; §STAGE-G3-WALL-RUNS.md steps 1/3/4). `options`:
    {thickness (required, world units, >0), scale (CLIPPER_SCALE, default DEFAULT_CLIPPER_SCALE),
    miterLimit (default DEFAULT_MITER_LIMIT)}. `results[i].outerPoints.length === runs[i].points.length`
    ALWAYS (1:1 correspondence with the run's own inner points — §8's "preserve source provenance…
    carry ownership forward from the original inner segments", never a rediscovered/projected count) —
    a run whose Clipper2 offset can't be cleanly matched 1:1 (an acute-corner bevel injection, or a
    Clipper2 failure) degrades that ONE run to the plain per-segment offset (naiveRunOffset) rather than
    ever guessing or dropping geometry, and reports this via `results[i].diagnostics.degraded`. Never
    throws — a malformed `runs`/`options` input returns an empty-results typed diagnostic. */
export function offsetRuns(runs, options = {}) {
  try {
    if (!Array.isArray(runs)) {
      return { results: [], diagnostics: { totalRuns: 0, degradedRuns: 0, totalJoinGapCount: 0, issues: [{ level: "error", typed: "malformed-input", message: "offsetRuns: runs is not an array" }] } };
    }
    const thickness = typeof options.thickness === "number" ? options.thickness : NaN;
    const scale = Number.isInteger(options.scale) && options.scale > 0 ? options.scale : DEFAULT_CLIPPER_SCALE;
    const miterLimit = typeof options.miterLimit === "number" ? options.miterLimit : DEFAULT_MITER_LIMIT;
    if (!(thickness > 0)) {
      return { results: runs.map(() => ({ outerPoints: [], diagnostics: { matchedSegments: 0, totalSegments: 0, joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: "options.thickness must be a positive number" } })), diagnostics: { totalRuns: runs.length, degradedRuns: runs.length, totalJoinGapCount: 0, issues: [{ level: "error", typed: "malformed-input", message: "offsetRuns: options.thickness must be a positive number" }] } };
    }
    const results = runs.map((run) => {
      const closed = !!(run && run.closed);
      const minPts = closed ? 3 : 2;
      if (!run || !isRingLike(run.points) || run.points.length < minPts) {
        return { outerPoints: (run && Array.isArray(run.points)) ? run.points.map((p) => ({ x: p.x, z: p.z })) : [], diagnostics: { matchedSegments: 0, totalSegments: 0, joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: `run.points is missing or has fewer than ${minPts} valid {x,z} points` } };
      }
      return offsetOneRun(run.points, thickness, scale, miterLimit, closed);
    });
    const degradedRuns = results.filter((r) => r.diagnostics.degraded).length;
    const totalJoinGapCount = results.reduce((s, r) => s + (r.diagnostics.joinGapCount || 0), 0);
    return { results, diagnostics: { totalRuns: runs.length, degradedRuns, totalJoinGapCount, issues: [] } };
  } catch (e) {
    return { results: [], diagnostics: { totalRuns: 0, degradedRuns: 0, totalJoinGapCount: 0, issues: [{ level: "error", typed: "malformed-input", message: `offsetRuns threw unexpectedly: ${String((e && e.stack) || e)}` }] } };
  }
}

/** wallOffset(run, options) -> convenience single-run wrapper over offsetRuns (§17.6's "add an
    offsetRuns/wallOffset method" — this IS that method; wallOffset is the one-run ergonomic entry
    point theater-room-mesh.js's own per-run loop calls, offsetRuns is the batch primitive it wraps).
    Returns the SAME {outerPoints, diagnostics} shape as one offsetRuns() result element. */
export function wallOffset(run, options = {}) {
  const { results } = offsetRuns([run], options);
  return results[0] || { outerPoints: [], diagnostics: { matchedSegments: 0, totalSegments: 0, joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: "wallOffset: offsetRuns returned no result" } };
}
