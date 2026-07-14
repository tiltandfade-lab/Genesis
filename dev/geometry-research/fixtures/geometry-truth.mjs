/* dev/geometry-research/fixtures/geometry-truth.mjs — UNIT G0 (docs/GEOMETRY-OSS-INTEGRATION.md §17.3).

   INDEPENDENT invariant helpers for the golden-fixture corpus. These functions know nothing about
   theater-room-mesh.js, polygon-clipping, Earcut, or any adapter under test. They operate ONLY on the
   plain cell-grid data that IS the shared input contract (GEOMETRY-ACCELERATION-TOOLCHAIN.md §4.1:
   `cells: [{x,z,tier,isDoor,sourceRef}]`), using the coordinate law from GEOMETRY-OSS-INTEGRATION.md §5:
   one logical cell (x,z) occupies the closed unit square [x-0.5,x+0.5] x [z-0.5,z+0.5], so cell AREA is
   always exactly 1 world-unit^2 and total floor area is always exactly the unique-cell count.

   This is deliberately grid combinatorics, not polygon math — a fixture's "expected" truths computed
   here are NOT snapshots of what any polygon library or theater-room-mesh.js produces; they are
   independently re-derivable from the cell SET alone. Any implementation under test (legacy Earcut/
   ring-tracer today, a future PolygonKernel) is graded against these, never against each other.

   Pure, deterministic, no Math.random, no THREE, no DOM. */

/** cellKey(x,z) -> stable string key, the ONE canonical (x,z) identity used across this module. */
export function cellKey(x, z) {
  return `${x},${z}`;
}

/** uniqueCells(cells) -> de-duplicated cell array (first occurrence wins), keyed by (x,z) only — proves
    a fixture with duplicate input rows (corpus fixture #21) still resolves to the SAME logical set. */
export function uniqueCells(cells) {
  const seen = new Map();
  for (const c of cells) {
    const k = cellKey(c.x, c.z);
    if (!seen.has(k)) seen.set(k, c);
  }
  return Array.from(seen.values());
}

/** areaOf(cells) -> unique-cell count == total floor area in world-unit^2 (coordinate law §5.2). */
export function areaOf(cells) {
  return uniqueCells(cells).length;
}

/** boundingBox(cells) -> {minX,maxX,minZ,maxZ} over (x,z); null for an empty set. */
export function boundingBox(cells) {
  if (!cells.length) return null;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const c of cells) {
    if (c.x < minX) minX = c.x;
    if (c.x > maxX) maxX = c.x;
    if (c.z < minZ) minZ = c.z;
    if (c.z > maxZ) maxZ = c.z;
  }
  return { minX, maxX, minZ, maxZ };
}

const NEI = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** connectedComponents(cells) -> Array<Array<cell>>, groups of EDGE-adjacent cells (4-connectivity).
    Per GEOMETRY-OSS-INTEGRATION.md §7.1: "Corner-touching cells may produce separate polygons; the
    adapter must not invent a diagonal bridge. Edge-touching cells must merge." This is exactly that
    law, computed independently of any polygon union library — a flood fill over the cell SET using
    only the 4 edge-adjacent offsets, never the 4 diagonals. Component order is deterministic: sorted by
    each component's own (minZ,minX) so it never depends on input array order. */
export function connectedComponents(cells) {
  const unique = uniqueCells(cells);
  const index = new Map(unique.map((c) => [cellKey(c.x, c.z), c]));
  const visited = new Set();
  const components = [];
  // deterministic scan order regardless of input order (canonicalization law §5.10-11 spirit).
  const ordered = unique.slice().sort((a, b) => (a.z - b.z) || (a.x - b.x));
  for (const start of ordered) {
    const startKey = cellKey(start.x, start.z);
    if (visited.has(startKey)) continue;
    const stack = [start];
    visited.add(startKey);
    const comp = [];
    while (stack.length) {
      const cur = stack.pop();
      comp.push(cur);
      for (const [dx, dz] of NEI) {
        const nk = cellKey(cur.x + dx, cur.z + dz);
        if (index.has(nk) && !visited.has(nk)) {
          visited.add(nk);
          stack.push(index.get(nk));
        }
      }
    }
    components.push(comp.sort((a, b) => (a.z - b.z) || (a.x - b.x)));
  }
  return components.sort((a, b) => (a[0].z - b[0].z) || (a[0].x - b[0].x));
}

/** countHoles(cells) -> number of enclosed empty regions inside a cell set's own bounding box, computed
    by a border flood fill: every empty grid cell reachable from OUTSIDE the bbox (via a 1-cell margin)
    is "outside space"; whatever empty bbox cell is never reached is interior — i.e. a hole. Holes are
    themselves grouped into connected components (4-connectivity) so a donut with one physical gap
    reports exactly 1 hole, not one hole per empty cell.
    This mirrors GEOMETRY-OSS-INTEGRATION.md §12 "every hole belongs to exactly one outer polygon" and
    is completely independent of any ring-tracing/triangulation implementation — pure grid flood fill. */
export function countHoles(cells) {
  const unique = uniqueCells(cells);
  if (!unique.length) return 0;
  const occupied = new Set(unique.map((c) => cellKey(c.x, c.z)));
  const bbox = boundingBox(unique);
  const minX = bbox.minX - 1, maxX = bbox.maxX + 1, minZ = bbox.minZ - 1, maxZ = bbox.maxZ + 1;
  const outside = new Set();
  const stack = [[minX, minZ]];
  outside.add(cellKey(minX, minZ));
  while (stack.length) {
    const [x, z] = stack.pop();
    for (const [dx, dz] of NEI) {
      const nx = x + dx, nz = z + dz;
      if (nx < minX || nx > maxX || nz < minZ || nz > maxZ) continue;
      const nk = cellKey(nx, nz);
      if (occupied.has(nk) || outside.has(nk)) continue;
      outside.add(nk);
      stack.push([nx, nz]);
    }
  }
  // interior empty cells: inside the padded bbox, not occupied, not reached from outside.
  const interiorEmpty = [];
  for (let z = minZ; z <= maxZ; z++) {
    for (let x = minX; x <= maxX; x++) {
      const k = cellKey(x, z);
      if (!occupied.has(k) && !outside.has(k)) interiorEmpty.push({ x, z });
    }
  }
  if (!interiorEmpty.length) return 0;
  return connectedComponents(interiorEmpty).length;
}

/** tierGroups(cells) -> Map<tier, cell[]>, grouping the INPUT cells by their own `tier` field. Tier
    membership is itself input truth (assigned by the fixture author / upstream engine), never derived
    from geometry — this helper only organizes it for per-tier invariant checks (area-by-tier, per-tier
    polygon/hole counts). */
export function tierGroups(cells) {
  const map = new Map();
  for (const c of cells) {
    const t = typeof c.tier === "number" ? c.tier : 0;
    if (!map.has(t)) map.set(t, []);
    map.get(t).push(c);
  }
  return map;
}

/** tierTruth(cells) -> per-tier {area, polygons, holes} — the independent per-tier structural truth a
    fixture declares, using the SAME connectedComponents/countHoles grid logic scoped to just that
    tier's own cell subset (a lower tier peeking through a raised tier's own hole is a DIFFERENT tier's
    own cell set, so it never counts as a "hole" of its own tier — it is real floor at its own
    elevation, matching GEOMETRY-OSS-INTEGRATION.md §7.2's "the sunken arena must remain visible inside
    that hole" law). */
export function tierTruth(cells) {
  const groups = tierGroups(cells);
  const out = {};
  for (const [tier, tierCells] of groups) {
    const comps = connectedComponents(tierCells);
    out[tier] = {
      area: areaOf(tierCells),
      polygons: comps.length,
      holes: comps.reduce((sum, comp) => sum + countHoles(comp), 0),
    };
  }
  return out;
}

/** isSimplePolygonCells(cells) -> true if the cell set forms a single connected 4-adjacency component
    (a sanity precondition many "one polygon" fixtures assert — a real ring-simplicity check on the
    OUTPUT vertex loop still belongs to the harness, which has the adapter's actual ring data; this is
    the cell-grid-level analogue). */
export function isSimpleSingleComponent(cells) {
  return connectedComponents(cells).length === 1;
}

/** seededShuffle(arr, seed) -> deterministic pseudo-random permutation of arr (new array, arr
    untouched). Uses the mulberry32 PRNG (public-domain, tiny, deterministic across Node versions) so
    "shuffled cell order x100 seeded permutations" (corpus fixture #22 / bakeoff class 16) never touches
    Math.random, per GEOMETRY-ACCELERATION-TOOLCHAIN.md's determinism requirement. */
export function seededShuffle(arr, seed) {
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
