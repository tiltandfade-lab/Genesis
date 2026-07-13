/* dev/geometry-research/bakeoff/floor-backends.mjs — UNIT R1 (docs/GEOMETRY-ACCELERATION-TOOLCHAIN.md
   §13.4, §4.1-4.2). Per-tier floor UNION + TRIANGULATION backends, one function pair per library, all
   normalized to the SAME plain-data shape so adapters.mjs can swap them freely:

     unionCells(cellsOfOneTier) -> { polygons: [{outer,holes}], diagnostics }   (canonicalized, §5)
     triangulate(polygonWithHoles) -> { vertices:[{x,z}], indices:[a,b,c,...], diagnostics }

   No library-native type ever leaves these functions — every return is plain {x,z} points / index
   arrays, per GEOMETRY-OSS-INTEGRATION.md §4's "no library-native arrays, classes, geometry objects...
   may escape this module." */

import { cellSquareRing, canonicalizePolygonSet, DEFAULT_EPSILON } from "./ring-utils.mjs";
import { loadPolygonClipping, loadEarcut, loadClipper2 } from "./require-lib-tools.mjs";

// ─── legacy (P0): theater-room-mesh.js's own traceTierContour + chainEdgesIntoRings + simplifySegments
//     + ensureCCW ring-tracer, and its own triangulatePolygon ear-clip (with C4.1c hole-bridging). ────
export async function loadLegacyMeshModule() {
  const { pathToFileURL } = await import("node:url");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
  return import(pathToFileURL(join(ROOT, "src/ui/theater-room-mesh.js")).href);
}

export function legacyUnionCells(cellsOfOneTier, tier, allIndex, mesh) {
  const { buildCellIndex, traceTierContour, chainEdgesIntoRings, simplifySegments, ringToPolygon,
    signedArea2D, ensureCCW, polygonContainsPoint } = mesh;
  const tierIndex = buildCellIndex(cellsOfOneTier);
  const rawEdges = traceTierContour(cellsOfOneTier, allIndex || tierIndex, tier);
  const rings = chainEdgesIntoRings(rawEdges);
  const built = rings.map((ring) => {
    const segments = simplifySegments(ring);
    let poly = ringToPolygon(segments);
    const rawArea = signedArea2D(poly);
    const fixed = ensureCCW(poly, segments);
    return { poly: fixed.poly, segments: fixed.segments, isOuter: rawArea > 0 };
  });
  const outers = built.filter((r) => r.isOuter);
  const holes = built.filter((r) => !r.isOuter);
  // legacy's own ensureCCW forces EVERY unmerged ring (outer AND hole) to positive/CCW winding
  // internally — bridgePolygonWithHoles re-flips a hole to CW only at consumption time. The shared
  // output contract (GEOMETRY-OSS-INTEGRATION.md §5.4: "outer rings use one Genesis-owned winding;
  // holes use the opposite winding") wants holes CW on the way OUT of this adapter, so flip here.
  const polygons = outers.map((o, i) => {
    const owned = holes.filter((h) => polygonContainsPoint(o.poly, h.poly[0]));
    return { outer: o.poly, holes: owned.map((h) => h.poly.slice().reverse()) };
  });
  return { polygons, diagnostics: { source: "traceTierContour+chainEdgesIntoRings+simplifySegments" }, rawBuilt: built };
}

export function legacyTriangulate(polygonWithHoles, mesh) {
  const { triangulatePolygon, bridgePolygonWithHoles } = mesh;
  const poly = polygonWithHoles.holes.length
    ? bridgePolygonWithHoles([polygonWithHoles.outer], polygonWithHoles.holes)[0]
    : polygonWithHoles.outer;
  const tris = triangulatePolygon(poly);
  const indices = [];
  tris.forEach((t) => indices.push(t[0], t[1], t[2]));
  return { vertices: poly, indices, diagnostics: { source: "triangulatePolygon(+bridgePolygonWithHoles)" } };
}

// ─── polygon-clipping (P1/P3-floor-candidate): union of per-cell unit squares ────────────────────────
export async function polygonClippingUnionCells(cellsOfOneTier) {
  const { pc } = await loadPolygonClipping();
  const multi = cellsOfOneTier.map((c) => {
    const ring = cellSquareRing(c);
    return [ring.map((p) => [p.x, p.z]).concat([[ring[0].x, ring[0].z]])];
  });
  const t0 = performance.now();
  const result = pc.union(multi);
  const libMs = performance.now() - t0;
  const polygons = [];
  for (const poly of result) {
    const rings = poly.map((ring) => ring.slice(0, -1).map(([x, z]) => ({ x, z })));
    polygons.push({ outer: rings[0], holes: rings.slice(1) });
  }
  const canon = canonicalizePolygonSet(polygons);
  return { polygons: canon.polygons, diagnostics: { source: "polygon-clipping@union", libMs, ...canon }, };
}

// ─── clipper2-ts booleans (P3-floor): union of per-cell unit squares, INTEGER-SCALED per CLIPPER_SCALE.
//     CRITICAL FINDING (see docs report): clipper2-ts's offset math silently no-ops on sub-1.0 deltas
//     fed as raw floats (verified live: inflatePaths([1x1 square], 0.22, Miter, Polygon) returns the
//     UNCHANGED input — no error, no warning). Integer scaling is therefore MANDATORY, not optional,
//     for every clipper2-ts operation this bakeoff performs, matching upstream native Clipper2's own
//     Int64-coordinate contract. ─────────────────────────────────────────────────────────────────────
export function clipperScaleFns(scale) {
  const toC = (v) => Math.round(v * scale);
  const fromC = (v) => v / scale;
  return { toC, fromC, scale };
}

export async function clipper2UnionCells(cellsOfOneTier, scale = 4096) {
  const { C } = await loadClipper2();
  const { toC, fromC } = clipperScaleFns(scale);
  const paths = cellsOfOneTier.map((c) => {
    const ring = cellSquareRing(c);
    return C.makePath(ring.flatMap((p) => [toC(p.x), toC(p.z)]));
  });
  const t0 = performance.now();
  const result = C.union(paths, C.FillRule.NonZero);
  const libMs = performance.now() - t0;
  // clipper2-ts returns a FLAT array of rings (Paths64), not grouped into polygon/holes — classify by
  // signed area (matches Genesis CCW-outer/CW-hole convention directly, verified against library
  // output live) then assign each hole to the outer ring whose bbox contains it (multi-outer tiers are
  // rare but must not silently misassign a hole to the wrong outer — bbox+point test, same law as
  // legacy's own polygonContainsPoint ownership rule).
  const rings = result.map((ring) => ring.map((p) => ({ x: fromC(p.x), z: fromC(p.y) })));
  const withArea = rings.map((ring) => ({ ring, area: shoelace(ring) }));
  const outers = withArea.filter((r) => r.area >= 0);
  const holes = withArea.filter((r) => r.area < 0);
  const polygons = outers.map((o) => {
    const owned = holes.filter((h) => pointInRing(h.ring[0], o.ring));
    return { outer: o.ring, holes: owned.map((h) => h.ring) };
  });
  const canon = canonicalizePolygonSet(polygons);
  return { polygons: canon.polygons, diagnostics: { source: "clipper2-ts@union", libMs, scale, ...canon } };
}

function shoelace(ring) {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    s += a.x * b.z - b.x * a.z;
  }
  return s / 2;
}
function pointInRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].x, zi = ring[i].z, xj = ring[j].x, zj = ring[j].z;
    const intersect = ((zi > pt.z) !== (zj > pt.z)) &&
      (pt.x < (xj - xi) * (pt.z - zi) / (zj - zi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// ─── Earcut (P1/P2-triangulator): one outer contour + holes ──────────────────────────────────────────
export async function earcutTriangulate(polygonWithHoles) {
  const { earcut, flatten } = await loadEarcut();
  const rings = [polygonWithHoles.outer, ...polygonWithHoles.holes];
  const flat = flatten(rings.map((r) => r.map((p) => [p.x, p.z])));
  const t0 = performance.now();
  const tris = earcut(flat.vertices, flat.holes, flat.dimensions);
  const libMs = performance.now() - t0;
  const vertices = [];
  for (let i = 0; i < flat.vertices.length; i += 2) vertices.push({ x: flat.vertices[i], z: flat.vertices[i + 1] });
  const dev = earcut.deviation ? null : null; // deviation computed by caller if desired (needs holes too)
  return { vertices, indices: tris, diagnostics: { source: "earcut", libMs, flatVertexCount: vertices.length } };
}

// ─── Clipper2 constrained Delaunay triangulation (P3-triangulator) ───────────────────────────────────
export async function clipper2Triangulate(polygonWithHoles, scale = 4096) {
  const { C } = await loadClipper2();
  const { toC, fromC } = clipperScaleFns(scale);
  const outerPath = C.makePath(polygonWithHoles.outer.flatMap((p) => [toC(p.x), toC(p.z)]));
  const holePaths = polygonWithHoles.holes.map((h) => C.makePath(h.flatMap((p) => [toC(p.x), toC(p.z)])));
  const t0 = performance.now();
  const res = C.triangulate([outerPath, ...holePaths]);
  const libMs = performance.now() - t0;
  if (res.result !== 0 || !Array.isArray(res.solution)) {
    return { vertices: [], indices: [], diagnostics: { source: "clipper2-ts@triangulate", libMs, error: `result=${res.result}` } };
  }
  // Delaunay's own solution is a flat array of independent triangles (each a 3-point path) — no shared
  // vertex buffer. Build one by exact-coordinate dedup (post-unscale) so cellTriangleMap-style indexing
  // is possible downstream, same shape contract as earcutTriangulate's output.
  const vertMap = new Map();
  const vertices = [];
  const indices = [];
  const keyOf = (p) => `${p.x.toFixed(9)},${p.z.toFixed(9)}`;
  for (const tri of res.solution) {
    if (tri.length !== 3) continue;
    for (const p of tri) {
      const world = { x: fromC(p.x), z: fromC(p.y) };
      const k = keyOf(world);
      if (!vertMap.has(k)) { vertMap.set(k, vertices.length); vertices.push(world); }
      indices.push(vertMap.get(k));
    }
  }
  return { vertices, indices, diagnostics: { source: "clipper2-ts@triangulate(Delaunay)", libMs, scale, triangleCount: res.solution.length } };
}

export { DEFAULT_EPSILON };
