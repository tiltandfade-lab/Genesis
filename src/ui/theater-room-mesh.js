/* GENESIS MODULE — src/ui/theater-room-mesh.js — ROOM-SHELL COMPILER (docs/ROOM-SHELL-COMPILER.md,
   docs/GRAPHICS-NORTH-STAR.md Stage C unit C4, the Codex directive ui-sketches/mock-frames/
   vq-battle-scenes/CLAUDE-IMPLEMENTATION-HANDOFF.md §4.1's nine-step algorithm). THE MAP-FEEL FIX:
   today's interior renderer (theater-boot.js's interiorBuildInstancedMesh) draws ONE unit box PER
   CELL for floor/wall — the square-cell origin always shows, so even a well-framed room reads as "a
   cell on a rolled map." This module compiles the active room's walkable cells into a CONTINUOUS
   architectural shell (one triangulated floor polygon per elevation tier, wall QUAD-STRIPS from
   boundary segments — not one box per wall cell, world-aligned UVs so texture continues across
   surfaces instead of restarting per cell) before the GL layer ever sees it.

   ARCHITECTURE (mirrors theater-shot.js's pure-core discipline, ROOM-SHELL-COMPILER.md's own mandate):
   the GEOMETRY MATH — contour trace, collinear simplify, ear-clip triangulation, world-UV assignment,
   cell<->triangle mapping — is PURE, THREE-free, plain-Node-importable (every function above the
   "THREE ASSEMBLER" divider). THREE is imported ONLY for the thin BufferGeometry assembly at the
   bottom (`compileRoomShell`), which turns the pure core's plain position/normal/uv/index arrays into
   real geometry. Materials are NOT built here — the caller (theater-boot.js) supplies/reuses its own
   already-built floor/wall material (GRAPHICS-NORTH-STAR's "do not change materials — that's Stage
   E"); this module hands back geometry + a logical cell<->triangle map only.

   INPUT CONTRACT — compileRoomShellData(cells, opts):
     cells: Array<{x, z, tier?, isDoor?}> — the ACTIVE ROOM's own walkable cell set (FLOOR/DOOR/WATER
       cells, already trimmed to one room by A1's keep-set — theater-boot.js builds this straight off
       `data.instances.floor`/`doorframe`, no new plan-reading needed). One world unit per cell,
       cell (x,z) spans [x-0.5,x+0.5] x [z-0.5,z+0.5] (theater-interior.js's own "1 SpatialPlan cell =
       1 world unit" grid law). `tier` (default 0) is a DISCRETE elevation-tier id (dais/pit structural
       steps — BW2-5's finale dais, NOT VP3's per-cell jitter, which this compiler deliberately does
       not chase into separate tiers; see ROOM_SHELL_TIER_QUANTUM's own header note on why). `isDoor`
       marks an aperture cell (its outward-facing boundary edge must survive simplification as its own
       segment and gets no wall quad — the portal/corridor throat opening).
     opts: {
       tierHeights: Map<tier:number, worldY:number> | plain object — floor TOP height per tier (the
         SAME derivation theater-boot.js's interiorFloorTopAt already uses: ITR_FLOOR_BASE_Y + sy).
         Computed from `cells` automatically (per-tier average) when omitted.
       wallHeight: number — uniform wall height for this room's exterior ring (default 2.4, mirrors
         theater-interior.js's ITR_WALL_HEIGHT_BASE fallback).
       wallHeightForSegment(segMeta) -> number — OPTIONAL per-segment override (segMeta:
         {a,b,mid:{x,z},kind,tier}). Lets the caller apply camera-relative parapet cutaway (the
         existing focusRect near-wall shortening) to compiled segments without this pure module ever
         importing a camera concept. Defaults to a constant `opts.wallHeight` for every segment.
       bevelWidth/bevelDrop: shallow chamfer dimensions at floor/wall and floor/riser seams
         (default 0.06 / 0.03 world units — "shallow", never a visible slope from normal play distance).
       uvDensity: world units per texture repeat (default 1 — "ONE texture tile per 5ft cell", matching
         BW2-3 §2b's existing floor convention, but genuinely continuous here since UV = world position
         rather than a per-instance-shared repeat multiplier).
     }
   Returns a plain-data bundle (positions/normals/uvs/indices per surface class + the logical map) —
   see this file's own header on `compileRoomShellData`'s return shape below.

   DETERMINISM: every function here is a pure fn of its inputs — no Math.random/Date.now anywhere.
   Same `cells` (+ same opts) always yields byte-identical geometry arrays (CLAUDE.md's determinism
   law; dev/verify-room-shell.mjs's own determinism check deep-equals two independent compiles).

   Registered in manifest.json as `ui.theater-room-mesh` (type:"module"); loaded via its own
   <script type="module"> tag in genesis.html BEFORE theater-boot.js's tag (theater-boot imports this
   module directly, ROOM-SHELL-COMPILER.md's own wire-in instruction), same convention theater-shot.js
   already established one unit up. */

// ════════════════════════════════════════════════════════════════════════════════════════════════
// PURE GEOMETRY CORE — no THREE, no DOM, no window. Plain-Node importable (dev/verify-room-shell.mjs
// drives every function below directly against a fixture cell set, RED-FIRST, no browser needed).
// ════════════════════════════════════════════════════════════════════════════════════════════════

// ROOM_SHELL_TIER_QUANTUM: quantizes a cell's own floor height into a discrete tier id. Chosen so
// VP3's per-cell jitter (theater-interior.js ITR_STEP_MIN/MAX = 0.04-0.08 world units either side of
// the ITR_FLOOR_HEIGHT=0.2 nominal, i.e. real sy in [0.12,0.28]) ALWAYS rounds to the SAME tier bucket
// (0.12/0.2=0.6 -> round 1; 0.28/0.2=1.4 -> round 1 — both land on 1, comfortable margin under the
// 0.1-wide rounding half-band) while BW2-5's deliberate finale dais steps (ITR_DAIS_STEP=0.2 per ring,
// so ring sy=0.4 -> round 2, top sy=0.6 -> round 3) land on their OWN distinct buckets. This is a
// scoped engineering choice, not a rediscovery of theater-interior.js's own constants (this module
// stays decoupled from that file) — if ITR_STEP_MAX or ITR_DAIS_STEP ever change, re-check this margin.
const ROOM_SHELL_TIER_QUANTUM = 0.2;
const DEFAULT_WALL_HEIGHT = 2.4; // mirrors theater-interior.js's ITR_WALL_HEIGHT_BASE fallback (kept in sync by comment, not import — pure module stays decoupled)
const DEFAULT_BEVEL_WIDTH = 0.06;
const DEFAULT_BEVEL_DROP = 0.03;
const DEFAULT_UV_DENSITY = 1;

function cellKey(x, z) { return x + "," + z; }

function buildCellIndex(cells) {
  const map = new Map();
  (cells || []).forEach((c) => { if (c) map.set(cellKey(c.x, c.z), c); });
  return map;
}

// tierOf(cell) — the discrete elevation-tier id a raw cell resolves to when the caller didn't already
// stamp one (theater-boot.js normally stamps `tier` explicitly off its own sy math; this fallback lets
// a bare {x,z} fixture — e.g. a harness — still resolve a sane single-tier room).
function tierOf(cell) { return (typeof cell.tier === "number") ? cell.tier : 0; }

// per-side unit-edge vertex pairs for a cell (x,z) spanning [x-0.5,x+0.5]x[z-0.5,z+0.5]. Ordering
// chosen so a plain rectangle's own boundary chains start-to-end into ONE consistently-wound (CCW in
// the x,z plane, verified by this file's own signedArea2D on a 1-cell fixture) ring with no extra
// bookkeeping — see this file's own design note in the module header for the derivation.
function edgeVertsFor(x, z, side) {
  switch (side) {
    case "+x": return [{ x: x + 0.5, z: z - 0.5 }, { x: x + 0.5, z: z + 0.5 }];
    case "-x": return [{ x: x - 0.5, z: z + 0.5 }, { x: x - 0.5, z: z - 0.5 }];
    case "+z": return [{ x: x + 0.5, z: z + 0.5 }, { x: x - 0.5, z: z + 0.5 }];
    case "-z": return [{ x: x - 0.5, z: z - 0.5 }, { x: x + 0.5, z: z - 0.5 }];
    default: return [{ x, z }, { x, z }];
  }
}
const NEIGHBOR_SIDES = [
  { dx: 1, dz: 0, side: "+x" }, { dx: -1, dz: 0, side: "-x" },
  { dx: 0, dz: 1, side: "+z" }, { dx: 0, dz: -1, side: "-z" },
];

// traceTierContour(tierCells, allIndex, myTier) -> raw directed edges bounding EXACTLY this tier's own
// cell footprint (directive step 1) — this tier's OWN complete boundary, so its own floor polygon
// always triangulates even when every one of its cells is fully interior (e.g. a dais TOP, ringed
// entirely by the dais RING tier, never touching the void). Each edge is tagged by what's across it:
//   - nothing at all (any tier)         -> kind:'wall' (or 'door' when the owning cell isDoor)
//   - a walkable cell of a DIFFERENT tier -> kind:'riser' {loTier:min, hiTier:max} — emitted from
//     BOTH tiers' own passes (each tier needs this edge in ITS OWN polygon boundary + gets its own
//     bevel chamfer at its own elevation), but the actual vertical riser QUAD is only ever built once,
//     by the caller checking `tier === seg.loTier` (see compileRoomShellData) — never a duplicate face.
//   - a walkable cell of the SAME tier   -> not a boundary edge at all
function traceTierContour(tierCells, allIndex, myTier) {
  const tierIndex = buildCellIndex(tierCells);
  const raw = [];
  tierIndex.forEach((cell, key) => {
    const parts = key.split(",");
    const x = Number(parts[0]), z = Number(parts[1]);
    NEIGHBOR_SIDES.forEach(({ dx, dz, side }) => {
      const nKey = cellKey(x + dx, z + dz);
      if (tierIndex.has(nKey)) return; // same tier -> interior, no boundary
      const neighbor = allIndex.get(nKey);
      const [a, b] = edgeVertsFor(x, z, side);
      if (neighbor) {
        const nTier = tierOf(neighbor);
        raw.push({ a, b, kind: "riser", loTier: Math.min(myTier, nTier), hiTier: Math.max(myTier, nTier) });
      } else {
        raw.push({ a, b, kind: cell.isDoor ? "door" : "wall", tier: myTier });
      }
    });
  });
  return raw;
}

function vKey(v) { return v.x.toFixed(3) + "," + v.z.toFixed(3); }

// chainEdgesIntoRings(edges) -> Array<Array<edge>>: walks the directed edge soup (each edge's `b`
// should equal exactly one other edge's `a`, for the simple orthogonal polygons this module targets)
// into ordered closed rings. Total-function: an edge whose chain dead-ends (degenerate/disconnected
// input) just terminates its own ring early rather than throwing — never crashes a caller.
function chainEdgesIntoRings(edges) {
  const byStart = new Map();
  edges.forEach((e, i) => {
    const k = vKey(e.a);
    if (!byStart.has(k)) byStart.set(k, []);
    byStart.get(k).push(i);
  });
  const used = new Array(edges.length).fill(false);
  const rings = [];
  for (let i = 0; i < edges.length; i++) {
    if (used[i]) continue;
    const ring = [];
    let cur = i;
    while (cur != null && !used[cur]) {
      used[cur] = true;
      ring.push(edges[cur]);
      const nextKey = vKey(edges[cur].b);
      const candidates = (byStart.get(nextKey) || []).filter((idx) => !used[idx]);
      cur = candidates.length ? candidates[0] : null;
    }
    if (ring.length) rings.push(ring);
  }
  return rings;
}

function directionOf(e) {
  const dx = e.b.x - e.a.x, dz = e.b.z - e.a.z;
  const len = Math.hypot(dx, dz) || 1;
  return { dx: dx / len, dz: dz / len };
}

// mergeKeyFor(edge) — two consecutive ring edges only ever collapse into one simplified segment when
// this key matches (directive step 2's "preserve door/aperture edges as their own segments" — a door
// edge's key is unique per its own position, so it NEVER accidentally merges with a neighboring plain
// wall edge; two ADJACENT door edges of one wide aperture legitimately merge into one opening).
function mergeKeyFor(e) {
  if (e.kind === "riser") return "riser:" + e.loTier + ":" + e.hiTier;
  if (e.kind === "door") return "door";
  return "wall";
}

// findSegmentStart(ring) — picks a walk-start index that already sits at a real corner or a kind
// change, so the single simplify pass below never needs a wrap-around merge (guarantees a plain
// rectangle collapses to exactly 4 segments regardless of which raw edge the tracer happened to visit
// first — dev/verify-room-shell.mjs's own "4 long segments" RED-FIRST check).
function findSegmentStart(ring) {
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const prev = ring[(i - 1 + n) % n];
    const cur = ring[i];
    if (mergeKeyFor(prev) !== mergeKeyFor(cur)) return i;
    const dPrev = directionOf(prev), dCur = directionOf(cur);
    if (Math.abs(dPrev.dx - dCur.dx) > 1e-6 || Math.abs(dPrev.dz - dCur.dz) > 1e-6) return i;
  }
  return 0;
}

// simplifySegments(ring) -> the directive step 2 collinear merge. Returns [{a,b,kind,tier?,loTier?,hiTier?}].
function simplifySegments(ring) {
  if (!ring.length) return [];
  const n = ring.length;
  const start = findSegmentStart(ring);
  const segments = [];
  let cur = ring[start];
  let curStart = cur.a, curEnd = cur.b, curKey = mergeKeyFor(cur), curDir = directionOf(cur), curMeta = cur;
  for (let k = 1; k < n; k++) {
    const e = ring[(start + k) % n];
    const key = mergeKeyFor(e);
    const dir = directionOf(e);
    const sameRun = key === curKey && Math.abs(dir.dx - curDir.dx) < 1e-6 && Math.abs(dir.dz - curDir.dz) < 1e-6;
    if (sameRun) { curEnd = e.b; continue; }
    segments.push(finishSegment(curStart, curEnd, curMeta));
    curStart = e.a; curEnd = e.b; curKey = key; curDir = dir; curMeta = e;
  }
  segments.push(finishSegment(curStart, curEnd, curMeta));
  return segments;
}
function finishSegment(a, b, meta) {
  const seg = { a, b, kind: meta.kind };
  if (meta.kind === "riser") { seg.loTier = meta.loTier; seg.hiTier = meta.hiTier; }
  else seg.tier = meta.tier;
  return seg;
}

// ringToPolygon(segments) -> ordered [{x,z}...] vertex loop (segment[i].b === segment[i+1].a by
// construction, so the polygon is just each segment's own start point, in order).
function ringToPolygon(segments) { return segments.map((s) => s.a); }

function signedArea2D(poly) {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    sum += a.x * b.z - b.x * a.z;
  }
  return sum / 2;
}

// ensureCCW(poly, segments) -> ensures a positive-area (CCW in the x,z plane) winding, reversing both
// the polygon AND its parallel segment list in lockstep when the traced ring came out CW (can happen
// depending on which raw edge the tracer started from) — every downstream normal/inset/UV derivation
// assumes CCW-with-interior-on-the-left, so this is the one place that invariant gets enforced.
function ensureCCW(poly, segments) {
  if (signedArea2D(poly) >= 0) return { poly, segments };
  const revPoly = poly.slice().reverse();
  // reversing the vertex loop also reverses segment direction+order; rebuild segments consistently
  // (segment i now runs revPoly[i] -> revPoly[i+1]), carrying each original segment's own kind/tier
  // metadata along in reverse order.
  const revSegs = segments.slice().reverse().map((s, i) => Object.assign({}, s, { a: revPoly[i], b: revPoly[(i + 1) % revPoly.length] }));
  return { poly: revPoly, segments: revSegs };
}

// segmentNormal(seg) -> the INWARD horizontal unit normal (points toward the polygon's own interior,
// valid once the ring is CCW — "interior on the left of travel direction", verified against a 1-cell
// fixture in this module's own design note). Used for the bevel inset and for wall/riser face normals.
function segmentNormal(seg) {
  const dx = seg.b.x - seg.a.x, dz = seg.b.z - seg.a.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: -dz / len, z: dx / len };
}

// insetPolygon(poly, segments, widthForSegment) -> a per-vertex inward offset, exact (no miter-length
// correction needed) because every corner this module ever produces is a 90 or 270 degree grid corner:
// summing the two adjacent edges' own (orthogonal, unit-length) inward normals lands exactly on the
// correct diagonal inset point. `widthForSegment(seg)` returns 0 for a door segment (the aperture stays
// flush — no bevel lip across a doorway) and `bevelWidth` for wall/riser segments.
function insetPolygon(poly, segments, widthForSegment) {
  const n = poly.length;
  return poly.map((v, i) => {
    const prevSeg = segments[(i - 1 + n) % n];
    const nextSeg = segments[i];
    const pn = segmentNormal(prevSeg), nn = segmentNormal(nextSeg);
    const pw = widthForSegment(prevSeg), nw = widthForSegment(nextSeg);
    return { x: v.x + pn.x * pw + nn.x * nw, z: v.z + pn.z * pw + nn.z * nw };
  });
}

function pointInTriangle2D(px, pz, a, b, c) {
  const d1 = (px - b.x) * (a.z - b.z) - (a.x - b.x) * (pz - b.z);
  const d2 = (px - c.x) * (b.z - c.z) - (b.x - c.x) * (pz - c.z);
  const d3 = (px - a.x) * (c.z - a.z) - (c.x - a.x) * (pz - a.z);
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(hasNeg && hasPos);
}

// triangulatePolygon(poly) -> ear-clipping triangulation of a simple CCW polygon (poly: [{x,z}...]) ->
// Array<[i,j,k]> index triples into `poly`. O(n^2) worst case — fine at room scale (a handful to a few
// dozen vertices after simplification). Total-function safety net: if a full pass finds no legal ear
// (degenerate/duplicate-point input), clips the current first vertex anyway rather than looping forever
// — never hangs a caller, though a well-formed simple polygon (every shape this compiler itself builds)
// never hits that branch.
function triangulatePolygon(poly) {
  if (poly.length < 3) return [];
  let idxs = poly.map((_, i) => i);
  const tris = [];
  let guard = poly.length * poly.length + 8;
  while (idxs.length > 3 && guard-- > 0) {
    let clipped = false;
    for (let i = 0; i < idxs.length; i++) {
      const iPrev = idxs[(i - 1 + idxs.length) % idxs.length];
      const iCur = idxs[i];
      const iNext = idxs[(i + 1) % idxs.length];
      const a = poly[iPrev], b = poly[iCur], c = poly[iNext];
      const cross = (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
      if (cross <= 1e-9) continue; // reflex/degenerate vertex at b -> not a valid ear
      let containsOther = false;
      for (let j = 0; j < idxs.length; j++) {
        const pj = idxs[j];
        if (pj === iPrev || pj === iCur || pj === iNext) continue;
        if (pointInTriangle2D(poly[pj].x, poly[pj].z, a, b, c)) { containsOther = true; break; }
      }
      if (containsOther) continue;
      tris.push([iPrev, iCur, iNext]);
      idxs.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) { tris.push([idxs[0], idxs[1], idxs[2]]); idxs.splice(1, 1); } // safety net, see header
  }
  if (idxs.length === 3) tris.push([idxs[0], idxs[1], idxs[2]]);
  return tris;
}

// ringPerimeterU(segments) -> [{u0,u1}, ...] parallel to `segments`: a running world-distance ("arc
// length") coordinate walked once around the WHOLE ring (wall + door + riser segments alike, so the
// flanking wall segments on either side of a door keep correct relative spacing even though the door
// itself draws no quad). This is directive step 8's "world-aligned UV" for vertical surfaces: because
// it's a pure function of position along the ring (never reset per segment), two adjacent segments'
// SHARED vertex resolves to the identical `u` value from either segment's own quad — dev/verify-room-
// shell.mjs's own shared-edge UV-continuity check. Exactly ONE seam survives per closed ring — where
// the walk closes back on itself, u wraps from the full perimeter length back to 0 (the same single
// unavoidable seam any closed-loop UV unwrap has, e.g. a cylinder's seam line) — a world of
// improvement over the pre-compiler system's per-CELL restart, and the honest, standard result.
function ringPerimeterU(segments) {
  const out = [];
  let u = 0;
  segments.forEach((s) => {
    const len = Math.hypot(s.b.x - s.a.x, s.b.z - s.a.z);
    out.push({ u0: u, u1: u + len });
    u += len;
  });
  return out;
}

// ── mesh-buffer accumulator: a tiny shared helper so floor/wall/riser each build their own flat
// positions/normals/uvs/indices/colors arrays with one consistent running-vertex-count convention.
// `colors` (GRAPHICS-NORTH-STAR.md Stage E's own "vertex/AO perimeter darkening", pulled forward into
// THIS unit's fix — docs/ROOM-SHELL-COMPILER.md's brightness-regression close) is a per-vertex RGB
// TINT multiplier (1,1,1 = untinted, the default for every caller that never supplies a color — so
// every PRE-EXISTING call site in this file stays byte-identical unless it explicitly opts in). ──────
function makeBuffer() { return { positions: [], normals: [], uvs: [], colors: [], indices: [] }; }
function pushVert(buf, x, y, z, nx, ny, nz, u, v, r, g, b) {
  buf.positions.push(x, y, z);
  buf.normals.push(nx, ny, nz);
  buf.uvs.push(u, v);
  buf.colors.push(typeof r === "number" ? r : 1, typeof g === "number" ? g : 1, typeof b === "number" ? b : 1);
  return (buf.positions.length / 3) - 1;
}
function pushTri(buf, i0, i1, i2) { buf.indices.push(i0, i1, i2); }
function pushQuad(buf, p0, p1, p2, p3, n, uv0, uv1, uv2, uv3, color) {
  // p0..p3 in order around the quad (p0->p1->p2->p3->p0); n = {x,y,z} shared face normal. `color`
  // (optional {r,g,b} in 0..1) is a single FLAT tint shared by all 4 corners — every existing bevel/
  // door/wall/riser quad is one uniform material patch, never a gradient within itself (the gradient
  // lives in the floor's own grid tessellation, below); omitted -> white (1,1,1), unchanged from before
  // this unit.
  const r = color ? color.r : 1, g = color ? color.g : 1, b = color ? color.b : 1;
  const i0 = pushVert(buf, p0.x, p0.y, p0.z, n.x, n.y, n.z, uv0.u, uv0.v, r, g, b);
  const i1 = pushVert(buf, p1.x, p1.y, p1.z, n.x, n.y, n.z, uv1.u, uv1.v, r, g, b);
  const i2 = pushVert(buf, p2.x, p2.y, p2.z, n.x, n.y, n.z, uv2.u, uv2.v, r, g, b);
  const i3 = pushVert(buf, p3.x, p3.y, p3.z, n.x, n.y, n.z, uv3.u, uv3.v, r, g, b);
  pushTri(buf, i0, i1, i2);
  pushTri(buf, i0, i2, i3);
}

// hexToRgb01(hex) -> {r,g,b} in 0..1 — the pure-core-safe hex parser (this file stays THREE-free
// above the assembler divider; theater-interior.js's itrDarkenHex parses hex the same way, no THREE
// needed for this). Falls back to white (untinted) on a missing/malformed hex, never throws.
function hexToRgb01(hex) {
  const h = String(hex || "#ffffff").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const v = Number.isFinite(n) ? n : 0xffffff;
  return { r: ((v >> 16) & 255) / 255, g: ((v >> 8) & 255) / 255, b: (v & 255) / 255 };
}

// polygonBBox(poly) -> the axis-aligned bounding box + its own area (width*depth) — the "is this
// polygon secretly just a rectangle" test below compares THIS against the polygon's own shoelace area.
function polygonBBox(poly) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  poly.forEach((p) => {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.z < minZ) minZ = p.z; if (p.z > maxZ) maxZ = p.z;
  });
  return { minX, maxX, minZ, maxZ, area: (maxX - minX) * (maxZ - minZ) };
}

// isAxisAlignedRectPolygon(poly) -> the polygon's own bbox when `poly`'s shoelace area equals its
// bbox's area (i.e. it fills its own bounding box exactly — a plain axis-aligned rectangle, TOLERANT
// of extra COLLINEAR vertices along one side, e.g. a wall run a door segment split into wall-door-wall
// — those still trace a rectangle, just with more than 4 polygon points on that one side), else null.
// THIS is the gate for the floor's own grid-tessellation path below: "today's RECTANGULAR cell rooms"
// (ROOM-SHELL-COMPILER.md's own stated scope) — an irregular/L-shaped footprint degrades to the plain
// ear-clip triangulation (untouched, no vertex-color gradient), never mis-grids a non-rectangular room.
function isAxisAlignedRectPolygon(poly) {
  if (!poly || poly.length < 4) return null;
  const bbox = polygonBBox(poly);
  if (!(bbox.area > 1e-9)) return null;
  const area = Math.abs(signedArea2D(poly));
  if (Math.abs(area - bbox.area) > 1e-6) return null;
  return bbox;
}

// buildAxisGrid(bboxMin, bboxMax, cellMin, cellMax) -> {coords, cellsTouching} — one grid LINE per
// actual cell boundary along one axis: the two OUTER lines sit at the true (possibly bevel-inset)
// bbox edges (bordered by exactly ONE cell, `cellsTouching` = [cellMin]/[cellMax]); every INTERIOR
// line sits at a cell-to-cell boundary (c+0.5, bordered by BOTH neighboring cells, `cellsTouching` =
// [c, c+1] — a 2-way average at that seam, the smooth-blend half of the "no per-cell hard edge" law).
// `cellMin`/`cellMax` are recovered by the caller via Math.round(bbox.minX/maxX) — bevelWidth (default
// 0.06) is far smaller than the 0.5 half-cell margin, so rounding the inset bbox edge always recovers
// the TRUE cell index reliably.
// DOUBLE-RESOLUTION AMENDMENT (measured, docs/ROOM-SHELL-COMPILER.md brightness-close): a grid with
// ONLY boundary-line vertices bilinearly BLENDS every cell's own color with its neighbors' even at
// that cell's own CENTER (a quad's midpoint = the average of its 4 corners) — diluting a strongly
// darkened corner cell toward its brighter neighbors right at the exact point the diegetic-light gate
// samples. Adding a CELL-CENTER line (weight = that cell alone, no blending) between every pair of
// boundary lines fixes this: interpolation stays smooth across the seam between two cells (the
// boundary vertex is still a 2-cell average — "no visible per-cell wall"), but the cell's own CENTER
// now resolves to its true, unblended tone (a "hat" profile per cell) — verified against the per-cell
// InstancedMesh path directly (this unit's own before/after luminance table).
function buildAxisGrid(bboxMin, bboxMax, cellMin, cellMax) {
  const coords = [bboxMin];
  const cellsTouching = [[cellMin]];
  for (let c = cellMin; c <= cellMax; c++) {
    coords.push(c); cellsTouching.push([c]);
    if (c < cellMax) { coords.push(c + 0.5); cellsTouching.push([c, c + 1]); }
  }
  coords.push(bboxMax);
  cellsTouching.push([cellMax]);
  return { coords, cellsTouching };
}

// buildFloorGrid(floorBuf, bbox, cellMinX, cellMaxX, cellMinZ, cellMaxZ, elevationY, uvDensity,
// colorAt) — the floor MAIN BODY's grid-tessellated alternative to a single flat ear-clipped polygon,
// used ONLY when the caller supplies a real `colorAt(x,z)->hex` (opt-in — every existing pure-core
// test never passes this, so their geometry/triangle-count stays byte-identical). One grid quad per
// actual floor CELL (not sub-cell — "low-frequency", never VP3's per-cell jitter), each of its 4
// corners' own vertex color BILINEARLY averaged from the 1-4 real cells meeting at that corner (via
// buildAxisGrid's own cellsTouching) — this is what lets the SAME uniform texture/material read a real
// smooth AO/perimeter gradient (dark at the room's own edges, full value mid-room) across ONE
// continuous surface, with zero visible per-cell seam (BW2-3's own map-feel law, unbroken: texture and
// SHADING both stay continuous, only the underlying vertex density grew for lighting's sake). Winding:
// reversed-cyclic (A,D,C)+(A,C,B) per corner order A(i,j) B(i+1,j) C(i+1,j+1) D(i,j+1) — the SAME +Y
// fix this file's own ear-clip path already documents (verified against this exact corner layout by
// right-hand-rule cross product on a concrete unit-square fixture).
function buildFloorGrid(floorBuf, bbox, cellMinX, cellMaxX, cellMinZ, cellMaxZ, elevationY, uvDensity, colorAt) {
  const xAxis = buildAxisGrid(bbox.minX, bbox.maxX, cellMinX, cellMaxX);
  const zAxis = buildAxisGrid(bbox.minZ, bbox.maxZ, cellMinZ, cellMaxZ);
  const nx = xAxis.coords.length, nz = zAxis.coords.length;
  const vertIdx = [];
  for (let j = 0; j < nz; j++) {
    const row = [];
    for (let i = 0; i < nx; i++) {
      const x = xAxis.coords[i], z = zAxis.coords[j];
      let rs = 0, gs = 0, bs = 0, cnt = 0;
      xAxis.cellsTouching[i].forEach((cx) => zAxis.cellsTouching[j].forEach((cz) => {
        const rgb = hexToRgb01(colorAt(cx, cz));
        rs += rgb.r; gs += rgb.g; bs += rgb.b; cnt++;
      }));
      const r = cnt ? rs / cnt : 1, g = cnt ? gs / cnt : 1, b = cnt ? bs / cnt : 1;
      row.push(pushVert(floorBuf, x, elevationY, z, 0, 1, 0, x * uvDensity, z * uvDensity, r, g, b));
    }
    vertIdx.push(row);
  }
  let triCount = 0;
  for (let j = 0; j < nz - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const iA = vertIdx[j][i], iB = vertIdx[j][i + 1], iC = vertIdx[j + 1][i + 1], iD = vertIdx[j + 1][i];
      pushTri(floorBuf, iA, iD, iC);
      pushTri(floorBuf, iA, iC, iB);
      triCount += 2;
    }
  }
  return triCount;
}

/* compileRoomShellData(cells, opts) — the top-level pure orchestrator; directive steps 1-9 end to end,
   returns a plain-data bundle (no THREE):
   {
     floor:  { positions,normals,uvs,indices, tiers:[{tier,elevationY,triStart,triCount}], bevelTriCount },
     walls:  { positions,normals,uvs,indices, segments:[{a,b,tier,height}] },
     risers: { positions,normals,uvs,indices, segments:[{a,b,loTier,hiTier,height}] },
     apertures: [{a,b,tier}],           // door segments — no quad, kept for portal-card alignment
     cellTriangleMap: { "x,z": {tier, triIndex} },   // triIndex = GLOBAL floor triangle index (floor.indices[triIndex*3..+3])
     meta: { floorCellCount, tierCount, wallSegmentCount, wallCellSideCount, riserSegmentCount }
   } */
function compileRoomShellData(cells, opts) {
  opts = opts || {};
  const bevelWidth = typeof opts.bevelWidth === "number" ? opts.bevelWidth : DEFAULT_BEVEL_WIDTH;
  const bevelDrop = typeof opts.bevelDrop === "number" ? opts.bevelDrop : DEFAULT_BEVEL_DROP;
  const uvDensity = typeof opts.uvDensity === "number" ? opts.uvDensity : DEFAULT_UV_DENSITY;
  const wallHeight = typeof opts.wallHeight === "number" ? opts.wallHeight : DEFAULT_WALL_HEIGHT;
  const wallHeightForSegment = typeof opts.wallHeightForSegment === "function"
    ? opts.wallHeightForSegment : function () { return wallHeight; };
  // BRIGHTNESS-REGRESSION FIX (docs/ROOM-SHELL-COMPILER.md close, 2026-07-12): optional per-cell/
  // per-segment COLOR sources — omitted by every existing pure-core test, so their output stays byte-
  // identical (white/untinted) unless a caller explicitly opts in. `floorColorAt(x,z)->hex` is the
  // SAME already-computed per-cell tone (theater-boot.js's own floorList[].color: VP3 tone/jitter/
  // perimeter-darken + valueScript + rim-vignette, whatever the per-cell InstancedMesh path already
  // used as its own instance-color tint) — reused here as a VERTEX color instead of a per-box one, so
  // the compiled shell's rendered brightness actually matches the per-cell path it replaced (the
  // regression the integration gate caught: a uniform-brightness compiled floor with none of that
  // darkening broke the diegetic-lighting model's far-corner/falloff/anti-clip reads).
  // `wallColorForSegment(segMeta)->hex` is the analogous per-SEGMENT tint (theater-boot.js averages
  // the bordering wall cells' own colors for that segment) — flat per segment (walls don't need a
  // gradient; they're already at the room's own edge by definition).
  const floorColorAt = typeof opts.floorColorAt === "function" ? opts.floorColorAt : null;
  const wallColorForSegment = typeof opts.wallColorForSegment === "function" ? opts.wallColorForSegment : null;
  // nearestFloorColor(seg) -> the hex color of the floor cell just INSIDE this boundary segment (walks
  // 0.5 world units along the segment's own inward normal from its midpoint, then rounds to the
  // nearest cell center) — used to tint the BEVEL RIBBON + DOOR THRESHOLD quads so the floor's own
  // darkening reaches all the way to the true wall/aperture edge (no bright untinted seam right where
  // the old per-cell darkening used to read darkest of all).
  function nearestFloorColor(seg) {
    if (!floorColorAt) return null;
    const n = segmentNormal(seg);
    const midX = (seg.a.x + seg.b.x) / 2, midZ = (seg.a.z + seg.b.z) / 2;
    return floorColorAt(Math.round(midX + n.x * 0.5), Math.round(midZ + n.z * 0.5));
  }

  // sort once, canonically (z then x), so every downstream Map insertion order (byTier grouping,
  // tierIndex, therefore the raw boundary-edge array traceTierContour builds) is a pure function of
  // the CELL SET, never of the caller's own array order — a caller handing the identical cell set in
  // a different order (a real risk: theater-boot.js could hand this a Set-derived or filtered list)
  // still yields byte-identical geometry, not just an equivalent rotation of the same ring.
  const list = (cells || []).filter(Boolean).slice().sort((a, b) => (a.z - b.z) || (a.x - b.x));
  const allIndex = buildCellIndex(list);

  // group by tier (sorted ascending so output ordering — and therefore every index into the shared
  // floor buffer — is deterministic regardless of the CALLER's own array order; determinism law).
  const byTier = new Map();
  list.forEach((c) => {
    const t = tierOf(c);
    if (!byTier.has(t)) byTier.set(t, []);
    byTier.get(t).push(c);
  });
  const tiers = Array.from(byTier.keys()).sort((a, b) => a - b);

  // tierHeights: caller-supplied wins; else the per-tier average of each cell's own elevationY
  // (defaults to ITR_FLOOR_BASE_Y-equivalent 0 + tier*ROOM_SHELL_TIER_QUANTUM when a cell carries no
  // explicit elevationY — a bare {x,z,tier} fixture still resolves a sane flat plane per tier).
  const tierHeights = {};
  tiers.forEach((t) => {
    if (opts.tierHeights && typeof opts.tierHeights[t] === "number") { tierHeights[t] = opts.tierHeights[t]; return; }
    const cellsOfTier = byTier.get(t);
    const withY = cellsOfTier.filter((c) => typeof c.elevationY === "number");
    if (withY.length) tierHeights[t] = withY.reduce((sum, c) => sum + c.elevationY, 0) / withY.length;
    else tierHeights[t] = t * ROOM_SHELL_TIER_QUANTUM;
  });

  const floorBuf = makeBuffer();
  const floorTierMeta = [];
  const cellTriangleMap = {};
  let bevelTriCount = 0;

  const wallBuf = makeBuffer();
  const wallSegmentsOut = [];
  const riserBuf = makeBuffer();
  const riserSegmentsOut = [];
  const aperturesOut = [];

  tiers.forEach((tier) => {
    const tierCells = byTier.get(tier);
    const elevationY = tierHeights[tier];
    const rawEdges = traceTierContour(tierCells, allIndex, tier);
    const rings = chainEdgesIntoRings(rawEdges);
    const triStart = floorBuf.indices.length / 3;

    rings.forEach((ring) => {
      let segments = simplifySegments(ring);
      let poly = ringToPolygon(segments);
      const fixed = ensureCCW(poly, segments);
      poly = fixed.poly; segments = fixed.segments;
      if (poly.length < 3) return;

      const widthForSegment = (seg) => (seg.kind === "door" ? 0 : bevelWidth);
      const inset = insetPolygon(poly, segments, widthForSegment);

      // FLOOR — main flat body, the inset polygon (leaves room for the bevel ribbon outside it),
      // at this tier's own elevation. World-aligned UV = world (x,z) directly (directive step 8):
      // identical formula for every vertex regardless of which tier/triangle it's part of.
      // BRIGHTNESS-REGRESSION FIX: when the caller supplies floorColorAt AND this ring's own inset
      // polygon fills its own bounding box exactly (isAxisAlignedRectPolygon — "today's RECTANGULAR
      // cell rooms", this unit's whole stated scope), tessellate a per-cell GRID instead of one flat
      // ear-clipped polygon, so a real per-vertex AO/perimeter gradient (buildFloorGrid's own header)
      // can ride the SAME continuous surface/texture. Any other shape (L-room, no colorAt supplied —
      // every existing pure-core test) falls straight back to the original single-polygon ear-clip,
      // byte-identical to before this unit.
      const rectBBox = floorColorAt ? isAxisAlignedRectPolygon(inset) : null;
      if (rectBBox) {
        buildFloorGrid(floorBuf, rectBBox,
          Math.round(rectBBox.minX), Math.round(rectBBox.maxX), Math.round(rectBBox.minZ), Math.round(rectBBox.maxZ),
          elevationY, uvDensity, floorColorAt);
      } else {
        const baseIdx = floorBuf.positions.length / 3;
        inset.forEach((v) => {
          pushVert(floorBuf, v.x, elevationY, v.z, 0, 1, 0, v.x * uvDensity, v.z * uvDensity);
        });
        // WINDING: triangulatePolygon emits (iPrev,iCur,iNext) for a polygon that's CCW in the (x,z)
        // shoelace sense (ensureCCW's own convention) — verified (right-hand-rule cross product) that
        // THIS winding's geometric normal points -Y, the OPPOSITE of the floor's own explicit +Y-up
        // normal attribute. Emitting (iPrev,iNext,iCur) instead (j/k swapped) flips it to match — a real,
        // screenshot-caught bug (MeshLambertMaterial defaulted FrontSide-only, so the floor rendered
        // fully culled/invisible before DoubleSide masked it into merely wrong-shaded; this fixes the
        // actual root cause rather than leaning on DoubleSide alone). 2D containment (pointInTriangle2D)
        // and area (shoelace) are winding-agnostic, so this never touches cellTriangleMap correctness.
        const tris = triangulatePolygon(inset);
        tris.forEach(([i, j, k]) => pushTri(floorBuf, baseIdx + i, baseIdx + k, baseIdx + j));
      }

      // U for wall/riser/bevel vertical surfaces: one continuous arc-length walk around THIS ring
      // (directive step 8's vertical-surface case).
      const arcU = ringPerimeterU(segments);

      segments.forEach((seg, i) => {
        const n = segmentNormal(seg);
        const { u0, u1 } = arcU[i];
        const insetA = inset[i], insetB = inset[(i + 1) % inset.length];

        if (seg.kind === "door") {
          aperturesOut.push({ a: seg.a, b: seg.b, tier });
          // A door segment contributes ZERO inset width of its OWN, but its two flanking (wall/riser)
          // neighbor segments still pull insetA/insetB inward by their own bevelWidth (insetPolygon
          // sums BOTH adjacent segments' contributions per vertex) — so the main body's own inset
          // edge does NOT reach all the way out to the true threshold line here. Fill that notch with
          // a FLAT, un-beveled quad at THIS tier's own elevationY (flush with the main body, no drop —
          // a door threshold reads flush, never chamfered) connecting the true boundary to the inset
          // edge, so the floor stays watertight (no gap) right up to the opening.
          const trueA = { x: seg.a.x, y: elevationY, z: seg.a.z };
          const trueB = { x: seg.b.x, y: elevationY, z: seg.b.z };
          const flushInnerA = { x: insetA.x, y: elevationY, z: insetA.z };
          const flushInnerB = { x: insetB.x, y: elevationY, z: insetB.z };
          // WINDING: reversed cyclic order (keep trueA first) — same +Y-normal fix as the main body
          // triangulation above; this quad shares the identical a->b/inward-normal convention that
          // produces a -Y-facing winding otherwise.
          // BRIGHTNESS-REGRESSION FIX: tint the threshold flush with the SAME nearby floor color the
          // bevel ribbon below uses, so a doorway's own flush quad doesn't read as a bright untinted
          // notch inside an otherwise-darkened perimeter.
          pushQuad(floorBuf, trueA, flushInnerA, flushInnerB, trueB, { x: 0, y: 1, z: 0 },
            { u: trueA.x * uvDensity, v: trueA.z * uvDensity }, { u: flushInnerA.x * uvDensity, v: flushInnerA.z * uvDensity },
            { u: flushInnerB.x * uvDensity, v: flushInnerB.z * uvDensity }, { u: trueB.x * uvDensity, v: trueB.z * uvDensity },
            floorColorAt ? hexToRgb01(nearestFloorColor(seg)) : null);
          return;
        }

        // BEVEL RIBBON (directive step 6): the TRUE outer boundary edge sits a hair BELOW the main
        // floor plane (elevationY - bevelDrop); the inset edge (bevelWidth further into the room)
        // matches the main body's own elevationY exactly — a shallow chamfer right where the floor
        // meets a wall or riser, never a visible slope from normal play distance. Reused verbatim for
        // both wall-adjacent and riser-adjacent segments (the one bevel helper the spec's step 6 asks
        // for on "exposed floor, riser... edges").
        const outerA = { x: seg.a.x, y: elevationY - bevelDrop, z: seg.a.z };
        const outerB = { x: seg.b.x, y: elevationY - bevelDrop, z: seg.b.z };
        const innerA = { x: insetA.x, y: elevationY, z: insetA.z };
        const innerB = { x: insetB.x, y: elevationY, z: insetB.z };
        // WINDING: reversed cyclic order (keep outerA first) — same fix as the main body/door-filler
        // quads above (verified via right-hand-rule cross product against the +Y normal on a concrete
        // fixture; this exact quad shape/point order otherwise winds -Y-facing).
        // BRIGHTNESS-REGRESSION FIX: tint the bevel ribbon with the SAME nearby floor color the main
        // grid's own outer row already carries — otherwise this thin strip (right where the OLD per-
        // cell darkening used to read DARKEST of all, wall-adjacent) would render as a bright untinted
        // seam ringing an otherwise-darkened floor.
        pushQuad(floorBuf, outerA, innerA, innerB, outerB, { x: 0, y: 1, z: 0 },
          { u: outerA.x * uvDensity, v: outerA.z * uvDensity }, { u: innerA.x * uvDensity, v: innerA.z * uvDensity },
          { u: innerB.x * uvDensity, v: innerB.z * uvDensity }, { u: outerB.x * uvDensity, v: outerB.z * uvDensity },
          floorColorAt ? hexToRgb01(nearestFloorColor(seg)) : null);
        bevelTriCount += 2;

        if (seg.kind === "wall") {
          const h = wallHeightForSegment({ a: seg.a, b: seg.b, mid: { x: (seg.a.x + seg.b.x) / 2, z: (seg.a.z + seg.b.z) / 2 }, kind: "wall", tier });
          const baseY = elevationY - bevelDrop;
          const wallColor = wallColorForSegment ? hexToRgb01(wallColorForSegment({ a: seg.a, b: seg.b, mid: { x: (seg.a.x + seg.b.x) / 2, z: (seg.a.z + seg.b.z) / 2 }, kind: "wall", tier })) : null;
          const p0 = { x: seg.a.x, y: baseY, z: seg.a.z };
          const p1 = { x: seg.b.x, y: baseY, z: seg.b.z };
          const p2 = { x: seg.b.x, y: baseY + h, z: seg.b.z };
          const p3 = { x: seg.a.x, y: baseY + h, z: seg.a.z };
          pushQuad(wallBuf, p0, p1, p2, p3, { x: n.x, y: 0, z: n.z },
            { u: u0, v: 0 }, { u: u1, v: 0 }, { u: u1, v: h }, { u: u0, v: h }, wallColor);
          wallSegmentsOut.push({ a: seg.a, b: seg.b, tier, height: h });
        } else if (seg.kind === "riser") {
          // built ONCE per physical riser edge — the lower tier's own pass owns the quad (tier ===
          // seg.loTier); the higher tier's own pass over this SAME edge still ran the bevel ribbon
          // above (a legitimate, distinct top-of-riser chamfer) but skips a second, duplicate quad.
          if (tier === seg.loTier) {
            const loY = tierHeights[seg.loTier], hiY = tierHeights[seg.hiTier];
            const h = Math.max(0, hiY - loY);
            const p0 = { x: seg.a.x, y: loY, z: seg.a.z };
            const p1 = { x: seg.b.x, y: loY, z: seg.b.z };
            const p2 = { x: seg.b.x, y: hiY, z: seg.b.z };
            const p3 = { x: seg.a.x, y: hiY, z: seg.a.z };
            pushQuad(riserBuf, p0, p1, p2, p3, { x: n.x, y: 0, z: n.z },
              { u: u0, v: 0 }, { u: u1, v: 0 }, { u: u1, v: h }, { u: u0, v: h });
            riserSegmentsOut.push({ a: seg.a, b: seg.b, loTier: seg.loTier, hiTier: seg.hiTier, height: h });
          }
        }
      });
    });

    const triCount = floorBuf.indices.length / 3 - triStart;
    floorTierMeta.push({ tier, elevationY, triStart, triCount });

    // logical cell<->triangle map (directive step 9): every walkable cell in THIS tier resolves to
    // the floor triangle whose polygon actually contains that cell's own center point.
    tierCells.forEach((c) => {
      for (let t = triStart; t < triStart + triCount; t++) {
        const i0 = floorBuf.indices[t * 3], i1 = floorBuf.indices[t * 3 + 1], i2 = floorBuf.indices[t * 3 + 2];
        const a = { x: floorBuf.positions[i0 * 3], z: floorBuf.positions[i0 * 3 + 2] };
        const b = { x: floorBuf.positions[i1 * 3], z: floorBuf.positions[i1 * 3 + 2] };
        const cc = { x: floorBuf.positions[i2 * 3], z: floorBuf.positions[i2 * 3 + 2] };
        if (pointInTriangle2D(c.x, c.z, a, b, cc)) { cellTriangleMap[cellKey(c.x, c.z)] = { tier, triIndex: t }; break; }
      }
    });
  });

  return {
    floor: { positions: floorBuf.positions, normals: floorBuf.normals, uvs: floorBuf.uvs, colors: floorBuf.colors, indices: floorBuf.indices, tiers: floorTierMeta, bevelTriCount },
    walls: { positions: wallBuf.positions, normals: wallBuf.normals, uvs: wallBuf.uvs, colors: wallBuf.colors, indices: wallBuf.indices, segments: wallSegmentsOut },
    risers: { positions: riserBuf.positions, normals: riserBuf.normals, uvs: riserBuf.uvs, colors: riserBuf.colors, indices: riserBuf.indices, segments: riserSegmentsOut },
    apertures: aperturesOut,
    cellTriangleMap,
    meta: {
      floorCellCount: list.length,
      tierCount: tiers.length,
      wallSegmentCount: wallSegmentsOut.length,
      riserSegmentCount: riserSegmentsOut.length,
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
// THREE ASSEMBLER — the ONE place this module touches THREE, per the spec's own "may import THREE
// only for the thin BufferGeometry assembly" mandate. No materials built here (caller's job).
// ════════════════════════════════════════════════════════════════════════════════════════════════
import * as THREE from "three";

function bufferGeometryFrom(buf) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(buf.positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(buf.normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(buf.uvs, 2));
  // BRIGHTNESS-REGRESSION FIX: the per-vertex AO/perimeter tint (white/1,1,1 when the caller never
  // supplied a color source — pushVert/pushQuad's own default) — the caller's material needs
  // `vertexColors: true` for this to have any visible effect; theater-boot.js's own room-shell
  // floor/wall material construction is the one place that flag gets set.
  geo.setAttribute("color", new THREE.Float32BufferAttribute(buf.colors, 3));
  geo.setIndex(buf.indices);
  return geo;
}

/* compileRoomShell(cells, opts) -> {
     floorGeometry, wallGeometry, riserGeometry (THREE.BufferGeometry, null when that surface has no
       triangles — e.g. a single-tier room has zero riser geometry),
     cellTriangleMap, apertures, meta (byte-identical to compileRoomShellData's own return, plus)
   } Thin wrapper: all the actual math happens in compileRoomShellData above; this only turns the
   plain arrays into real GPU-ready geometry. Called directly by theater-boot.js at the interior build
   step (behind the ITR_ROOM_SHELL flag) — theater-boot.js wraps the returned geometries in its own
   THREE.Mesh with whatever floor/wall material it already resolved (materials/textures unchanged). */
function compileRoomShell(cells, opts) {
  const data = compileRoomShellData(cells, opts);
  return {
    floorGeometry: data.floor.indices.length ? bufferGeometryFrom(data.floor) : null,
    wallGeometry: data.walls.indices.length ? bufferGeometryFrom(data.walls) : null,
    riserGeometry: data.risers.indices.length ? bufferGeometryFrom(data.risers) : null,
    cellTriangleMap: data.cellTriangleMap,
    apertures: data.apertures,
    floorTiers: data.floor.tiers,
    wallSegments: data.walls.segments,
    riserSegments: data.risers.segments,
    meta: Object.assign({}, data.meta, { bevelTriCount: data.floor.bevelTriCount }),
  };
}

export {
  // pure core (dev/verify-room-shell.mjs's own direct import surface)
  cellKey, buildCellIndex, tierOf, edgeVertsFor, traceTierContour, chainEdgesIntoRings,
  directionOf, mergeKeyFor, findSegmentStart, simplifySegments, ringToPolygon, signedArea2D,
  ensureCCW, segmentNormal, insetPolygon, pointInTriangle2D, triangulatePolygon, ringPerimeterU,
  hexToRgb01, polygonBBox, isAxisAlignedRectPolygon, buildAxisGrid, buildFloorGrid,
  compileRoomShellData,
  ROOM_SHELL_TIER_QUANTUM, DEFAULT_WALL_HEIGHT, DEFAULT_BEVEL_WIDTH, DEFAULT_BEVEL_DROP, DEFAULT_UV_DENSITY,
  // THREE assembler (theater-boot.js's own import surface)
  compileRoomShell,
};
