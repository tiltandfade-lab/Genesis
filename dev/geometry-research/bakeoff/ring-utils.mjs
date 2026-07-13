/* dev/geometry-research/bakeoff/ring-utils.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md §13.4).

   Shared, library-independent plain-data ring/polygon utilities used by every P0-P3 adapter and by the
   correctness scorer. Implements the coordinate/winding/epsilon law from
   docs/GEOMETRY-OSS-INTEGRATION.md §5:
     1. (x,z) plane. 2. one cell occupies [x-0.5,x+0.5]x[z-0.5,z+0.5]. 3. adapter rings omit the
     duplicated closing point. 4. outer rings CCW, holes CW (Genesis-owned winding). 5. adapters convert
     to/from each library's own winding/closure convention. 6-7. DEFAULT_EPSILON = 1e-7 world units,
     quantization only at the adapter boundary. 8. dedupe consecutive equal points + trailing repeat.
     9. reject rings with <3 unique points or area<epsilon. 10. rotate to lexicographically smallest
     vertex, deterministic tie break. 11-12. sort polygons/holes by descending abs area, then bounds,
     then vertex sequence.

   Genesis's OWN winding sign (verified against src/ui/theater-room-mesh.js's signedArea2D + ensureCCW,
   read directly — not assumed): signedArea2D(poly) = sum(a.x*b.z - b.x*a.z)/2; ensureCCW keeps a ring
   iff signedArea2D(poly) >= 0. So POSITIVE Genesis area == CCW == outer-ring winding. */

export const DEFAULT_EPSILON = 1e-7;

/** cellSquareRing(cell) -> OPEN CCW ring (4 points, Genesis winding) for one logical cell's unit square,
    per OSS §5.2's [x-0.5,x+0.5]x[z-0.5,z+0.5] coordinate law. */
export function cellSquareRing(cell) {
  const { x, z } = cell;
  return [
    { x: x - 0.5, z: z - 0.5 },
    { x: x + 0.5, z: z - 0.5 },
    { x: x + 0.5, z: z + 0.5 },
    { x: x - 0.5, z: z + 0.5 },
  ];
}

/** signedArea2D(ring) -> Genesis's own shoelace sign convention (positive == CCW). Accepts an OPEN ring. */
export function signedArea2D(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    sum += a.x * b.z - b.x * a.z;
  }
  return sum / 2;
}

export function ringArea(ring) {
  return Math.abs(signedArea2D(ring));
}

/** triangulatedArea(vertices, indices) -> total floor area from a triangle-soup buffer, via a SIGNED
    per-triangle sum with ONE final abs() at the end — never Math.abs() per triangle. A hole-bridged
    polygon's ear-clip decomposition legitimately produces a few near-degenerate/negative-signed
    triangles right at the bridge slit (verified live against legacy's own bridgePolygonWithHoles
    output: a 3x3-minus-center donut's bridged 10-vertex polygon ear-clips into 8 triangles, one of
    which has SIGNED area -1 — summing |area| per triangle inflates the total by 2x that slit area,
    10.00007 instead of the correct 8.00007; summing signed area first cancels the slit exactly).
    `indices` is a flat [a,b,c,a,b,c,...] array indexing into `vertices:[{x,z},...]`. */
export function triangulatedArea(vertices, indices) {
  let signedSum = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const a = vertices[indices[i]], b = vertices[indices[i + 1]], c = vertices[indices[i + 2]];
    signedSum += (b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z);
  }
  return Math.abs(signedSum) / 2;
}

/** ensureWinding(ring, wantCCW) -> ring reversed iff its current winding doesn't match `wantCCW`. */
export function ensureWinding(ring, wantCCW) {
  const isCCW = signedArea2D(ring) >= 0;
  if (isCCW === wantCCW) return ring.slice();
  return ring.slice().reverse();
}

/** dedupeConsecutive(ring, eps) -> drops consecutive equal points (incl. a repeated closing point) per
    OSS §5.8. Input may be open or closed; output is always open (no repeated first/last point). */
export function dedupeConsecutive(ring, eps = DEFAULT_EPSILON) {
  const out = [];
  for (const p of ring) {
    const prev = out[out.length - 1];
    if (!prev || Math.abs(prev.x - p.x) > eps || Math.abs(prev.z - p.z) > eps) out.push(p);
  }
  while (out.length > 1) {
    const first = out[0], last = out[out.length - 1];
    if (Math.abs(first.x - last.x) <= eps && Math.abs(first.z - last.z) <= eps) out.pop();
    else break;
  }
  return out;
}

/** rotateToCanonicalStart(ring) -> OSS §5.10: rotate to the lexicographically smallest (x,z) vertex,
    with a deterministic outgoing-edge tie break (smallest next-vertex (x,z) if duplicate min points
    exist — degenerate/malformed input only). Ring must already be deduped. */
export function rotateToCanonicalStart(ring) {
  if (ring.length < 2) return ring.slice();
  let bestIdx = 0;
  for (let i = 1; i < ring.length; i++) {
    if (lexLess(ring[i], ring[bestIdx])) bestIdx = i;
  }
  // tie break: among all indices achieving the min point, pick the one whose NEXT vertex is
  // lexicographically smallest (stable, deterministic, never Math.random/insertion-order dependent).
  const minPt = ring[bestIdx];
  let candidates = [];
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

function lexLess(a, b) {
  if (a.x !== b.x) return a.x < b.x;
  return a.z < b.z;
}

/** canonicalizeRing(ring, wantCCW, eps) -> the full OSS §5 pipeline for ONE ring: dedupe -> reject if
    degenerate -> enforce winding -> rotate to canonical start. Returns null (never throws) for a ring
    that fails the §5.9 minimum (< 3 unique points or area below epsilon) — callers count these as
    `droppedDegenerateRings`, matching GEOMETRY-OSS-INTEGRATION.md §4's diagnostics shape. */
export function canonicalizeRing(ring, wantCCW, eps = DEFAULT_EPSILON) {
  const deduped = dedupeConsecutive(ring, eps);
  if (deduped.length < 3) return null;
  const area = ringArea(deduped);
  if (!(area > eps)) return null;
  const wound = ensureWinding(deduped, wantCCW);
  return rotateToCanonicalStart(wound);
}

/** boundsOf(ring) -> {minX,minZ,maxX,maxZ}, used as the OSS §5.11 polygon sort tie-break key. */
export function boundsOf(ring) {
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

/** comparePolygonsCanonical(a, b) -> OSS §5.11 deterministic polygon sort: descending abs area, then
    bounds, then vertex sequence. `a`/`b` are canonicalized OUTER rings. */
export function comparePolygonsCanonical(a, b) {
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

/** canonicalizePolygonWithHoles({outer,holes}, eps) -> canonicalizes the outer ring CCW and every hole
    CW, sorts holes by the same OSS §5.12 rule, drops degenerate holes (diagnostics-countable). Returns
    null if the outer ring itself is degenerate. */
export function canonicalizePolygonWithHoles(polygon, eps = DEFAULT_EPSILON) {
  const outer = canonicalizeRing(polygon.outer, true, eps);
  if (!outer) return null;
  const holes = (polygon.holes || [])
    .map((h) => canonicalizeRing(h, false, eps))
    .filter(Boolean)
    .sort(comparePolygonsCanonical);
  return { outer, holes, area: ringArea(outer), bounds: boundsOf(outer) };
}

/** canonicalizePolygonSet(polygons, eps) -> array of canonicalizePolygonWithHoles results, sorted by
    the OSS §5.11 polygon order. Drops fully-degenerate polygons; records how many were dropped. */
export function canonicalizePolygonSet(polygons, eps = DEFAULT_EPSILON) {
  let droppedDegenerateRings = 0;
  const out = [];
  for (const p of polygons || []) {
    const before = 1 + (p.holes ? p.holes.length : 0);
    const c = canonicalizePolygonWithHoles(p, eps);
    if (!c) { droppedDegenerateRings += before; continue; }
    droppedDegenerateRings += before - (1 + c.holes.length);
    out.push(c);
  }
  out.sort((a, b) => comparePolygonsCanonical(a.outer, b.outer));
  return { polygons: out, droppedDegenerateRings };
}

// ─── robust-predicates orientXZ wrapper (OSS §5 / GEOMETRY-ACCELERATION-TOOLCHAIN.md §3.4) ──────────
// Calibrated against Genesis's OWN signedArea2D convention (positive == CCW), NOT assumed from
// upstream's documentation. Fixture proof (checked at module load, throws loudly if the sign flips
// under a library upgrade): robust-predicates' orient2d(ax,ay,bx,by,cx,cy) returns POSITIVE for a
// standard math (x,y) CLOCKWISE triple and NEGATIVE for CCW (its own documented convention assumes a
// screen-space y-axis pointing down). Genesis signedArea2D treats (x,z) exactly like standard math
// (x,y) and calls positive-area CCW. So `genesisSign = -1` makes orientXZ agree with Genesis:
// orientXZ(a,b,c) > 0 <=> Genesis-CCW.
const GENESIS_ORIENT_SIGN = -1;

export function makeOrientXZ(orient2d) {
  const orientXZ = (a, b, c) => GENESIS_ORIENT_SIGN * orient2d(a.x, a.z, b.x, b.z, c.x, c.z);
  // calibration fixtures — a Genesis-CCW triangle, a Genesis-CW triangle, a collinear triple.
  const ccw = orientXZ({ x: 0, z: 0 }, { x: 1, z: 0 }, { x: 0, z: 1 });
  const cw = orientXZ({ x: 0, z: 0 }, { x: 0, z: 1 }, { x: 1, z: 0 });
  const collinear = orientXZ({ x: 0, z: 0 }, { x: 1, z: 0 }, { x: 2, z: 0 });
  if (!(ccw > 0)) throw new Error(`orientXZ calibration FAILED: Genesis-CCW triple scored ${ccw}, expected > 0`);
  if (!(cw < 0)) throw new Error(`orientXZ calibration FAILED: Genesis-CW triple scored ${cw}, expected < 0`);
  if (collinear !== 0) throw new Error(`orientXZ calibration FAILED: collinear triple scored ${collinear}, expected 0`);
  orientXZ.calibration = { ccw, cw, collinear, genesisSign: GENESIS_ORIENT_SIGN };
  return orientXZ;
}
