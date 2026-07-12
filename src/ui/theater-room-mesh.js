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
       smoothShape: the STAGE-C C3 shapeForArchetype tag (STAGE-C3b, docs/STAGE-C.md's own C3b
         addendum — undefined/'rect'/'cave' = OFF, the original simplify path). 'circle'/'ellipse' ->
         every non-door boundary vertex is pulled toward the ellipse fitted to that ring's own bbox
         (radialSmoothRing), so the shell reads as a curve instead of C3's staircase. 'octagon'/'L'/
         'T'/'cross' -> real multi-cell staircase runs (an octagon's own chamfered corners; L/T/cross
         structurally never have one) get chamfered into a flat 45-degree diagonal face
         (diagonalizeStaircaseRing) instead of staying axis-aligned stairs. RENDER-ONLY either way:
         never reads/touches `cells` beyond what every other shape already does; `plan.cells`/
         `rooms[].cells` (combat/placement/pathing) are untouched by this option existing at all.
       radialSmoothBlend: 0..1 override for DEFAULT_RADIAL_SMOOTH_BLEND ("radial" mode only, test-only knob).
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
// STAGE-C3b (docs/STAGE-C.md C3b addendum — the circle/ellipse render-refinement pass that follows
// C3's own "staircased orthogonal approximation" ruling): how far a circle/ellipse room's own boundary
// vertex gets pulled, per tier ring, from its raw grid-staircase position toward the ideal ellipse
// fitted to THAT ring's own bbox (radialSmoothRing, below) — 0 = untouched staircase, 1 = the vertex
// lands exactly ON the ideal ellipse. Tuned (not guessed): 1.0 was tried first and rejected — it reads
// as a mathematically PERFECT ellipse with zero relationship to the underlying cell footprint (every
// tier's ring, including a tiny 3-cell dais, snaps to a suspiciously smooth curve regardless of scale),
// which stopped reading as "an architectural room" and started reading as a vector-art ellipse pasted
// over the floor. 0.88 keeps the curve doing essentially all of the rounding work (the staircase read
// is gone) while leaving a small, deliberate residual tie back to the actual rasterized footprint —
// see dev/verify-stage-c3b-circle-smooth.mjs's own roundness-metric before/after for the measured gap
// this closes, and this unit's own report for the visual comparison.
const DEFAULT_RADIAL_SMOOTH_BLEND = 0.88;

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

// unmergedSegments(ring) -> simplifySegments' own NO-MERGE sibling: one segment per RAW cell-edge,
// in the ring's own already-deterministic walk order (chainEdgesIntoRings always starts a ring from
// the lowest-sorted unused raw edge — see compileRoomShellData's own cell-sort comment — so this needs
// no findSegmentStart equivalent; there's no merge boundary to normalize). STAGE-C3b's own smoothing
// pass (radialSmoothRing, below) wants FULL cell-boundary vertex density on a circle/ellipse ring —
// simplifySegments' collinear-run collapse would otherwise leave long straight chords (e.g. the flat
// top of a wide circle) that a 2-endpoint pull toward the ideal ellipse can't bow outward mid-chord.
function unmergedSegments(ring) {
  return ring.map((e) => finishSegment(e.a, e.b, e));
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

// insetOffset(pn, pw, nn, nw) -> the vertex displacement solving the exact 2D miter join: d such that
// d·pn = pw AND d·nn = nw (the shared vertex moves inward by pw along the PREV segment's own normal
// and nw along the NEXT segment's own normal, simultaneously). Solved via Cramer's rule on the 2x2
// system (D = pn×nn, the 2D cross product of the two unit normals):
//   dx = (pw*nn.z - nw*pn.z) / D,  dz = (pn.x*nw - nn.x*pw) / D
// At a 90-degree grid corner (pn⊥nn, so pn·nn=0, D=±1) this reduces to EXACTLY the module's original
// `pn*pw + nn*nw` sum (verified algebraically: D=1 case gives dx=pw*nn.z-nw*pn.z, which for an
// orthonormal pair equals pn.x*pw+nn.x*nw) — every existing rect/octagon/L/T/cross/cave fixture (all
// still traced on 90/270-degree grid corners) is BYTE-IDENTICAL to before this helper existed. It only
// diverges — correctly — at the near-straight (large-obtuse-angle) corners STAGE-C3b's own unmerged,
// radially-smoothed circle/ellipse rings introduce, where the old sum formula over-inset by up to ~2x
// (two nearly-parallel unit normals summing toward 2x magnitude instead of the correct ~1x for a
// nearly-flat run). `D` near zero (truly parallel adjacent normals — a straight run, or two segments
// of DIFFERING width that happen to share one direction, an existing-but-rare case e.g. a wall run
// unmerged straight into a same-direction riser run) falls back to the original sum, the same
// approximation this module always made for that shape.
function insetOffset(pn, pw, nn, nw) {
  const D = pn.x * nn.z - pn.z * nn.x;
  if (Math.abs(D) < 1e-9) return { x: pn.x * pw + nn.x * nw, z: pn.z * pw + nn.z * nw };
  return { x: (pw * nn.z - nw * pn.z) / D, z: (pn.x * nw - nn.x * pw) / D };
}

// insetPolygon(poly, segments, widthForSegment) -> a per-vertex inward offset via insetOffset (above)
// — an exact miter join for ANY corner angle (not just the 90/270-degree grid corners this module used
// to assume; see insetOffset's own header for the byte-identical-at-90-degrees proof). `widthForSegment
// (seg)` returns 0 for a door segment (the aperture stays flush — no bevel lip across a doorway) and
// `bevelWidth` for wall/riser segments.
function insetPolygon(poly, segments, widthForSegment) {
  const n = poly.length;
  return poly.map((v, i) => {
    const prevSeg = segments[(i - 1 + n) % n];
    const nextSeg = segments[i];
    const pn = segmentNormal(prevSeg), nn = segmentNormal(nextSeg);
    const pw = widthForSegment(prevSeg), nw = widthForSegment(nextSeg);
    const off = insetOffset(pn, pw, nn, nw);
    return { x: v.x + off.x, z: v.z + off.z };
  });
}

// radialSmoothRing(poly, segments, blend) -> STAGE-C3b's own render-only rounding pass: pulls every
// NON-door-adjacent vertex `blend` of the way from its raw grid-staircase position toward the ideal
// ellipse fitted to THIS ring's own bbox (cx/cz = bbox center, rx/rz = bbox half-extents — "the bbox
// half-extents give you the ideal radius", per this unit's own directive). Door-adjacent vertices
// (either endpoint of a 'door' segment) are PINNED (never moved) so the aperture stays exactly where
// dspBuildPlanOnce's own polygon-face door placement (STAGE-C.md C3 step 3) put it — a corridor still
// meets the room at the true logical door cell, never drifting off it for a cosmetic curve. Purely a
// vertex-position nudge on the RETURNED polygon/segments; the `cells` this ring was traced from (and
// therefore `plan.cells`/`rooms[].cells`, the combat/placement/pathing grid) are never read or mutated
// here — this function doesn't even see the cell set, only the already-traced boundary.
function radialSmoothRing(poly, segments, blend) {
  const n = poly.length;
  if (n < 3 || !(blend > 0)) return { poly, segments };
  const bbox = polygonBBox(poly);
  const cx = (bbox.minX + bbox.maxX) / 2, cz = (bbox.minZ + bbox.maxZ) / 2;
  const rx = (bbox.maxX - bbox.minX) / 2, rz = (bbox.maxZ - bbox.minZ) / 2;
  if (!(rx > 1e-6) || !(rz > 1e-6)) return { poly, segments }; // degenerate ring (a 1-wide sliver) — leave untouched
  const pinned = new Array(n).fill(false);
  segments.forEach((s, i) => {
    if (s.kind === "door") { pinned[i] = true; pinned[(i + 1) % n] = true; }
  });
  const smoothPoly = poly.map((v, i) => {
    if (pinned[i]) return v;
    const nx = (v.x - cx) / rx, nz = (v.z - cz) / rz;
    const len = Math.hypot(nx, nz) || 1;
    const idealX = cx + (nx / len) * rx, idealZ = cz + (nz / len) * rz;
    return { x: v.x + (idealX - v.x) * blend, z: v.z + (idealZ - v.z) * blend };
  });
  const smoothSegments = segments.map((s, i) => Object.assign({}, s, { a: smoothPoly[i], b: smoothPoly[(i + 1) % n] }));
  return { poly: smoothPoly, segments: smoothSegments };
}

// ── STAGE-C3b SCOPE EXPANSION (Adam's own direction, same session): DIAGONAL WALL FACES for the
// staircased archetypes that have a genuine multi-cell straight-line approximation baked into their
// rasterization (octagon's own chamfered corners — rasterizeShape's `cornerTL/TR/BL/BR` bands, a
// classic unit "Bresenham" staircase) — vs. rounding a circle/ellipse's own true CURVE (radialSmoothRing,
// above). L/T/cross are funneled through this SAME path too (see diagonalizeStaircaseRing's own gate
// below) — their rasterization is a single right-angle quadrant/band subtraction with NO multi-cell
// staircase in it at all, so the run-detector below finds nothing to chamfer and they stay byte-
// identical/crisp automatically; this is a safety-net inclusion, not new geometry for those shapes.

function midpointOf(a, b) { return { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }; }
function segLen2D(s) { return Math.hypot(s.b.x - s.a.x, s.b.z - s.a.z); }
function perpendicularUnit(d1, d2) { return Math.abs(d1.dx * d2.dx + d1.dz * d2.dz) < 1e-6; }

/* chamferRunCorners(run) -> run: >=3 consecutive UNIT 'wall' segments whose directions strictly
   alternate between two perpendicular unit vectors (a genuine multi-step staircase — see
   diagonalizeStaircaseRing's own run-detection, below, for what qualifies). Replaces every INTERNAL
   corner (between run[i] and run[i+1]) with a diagonal connecting the two adjacent edges' own
   MIDPOINTS, instead of routing through the original sharp grid corner.

   WHY MIDPOINTS, AND WHY THIS IS SAFE (derived + checked, not guessed):
   Chamfering a SINGLE unit-cell corner by cutting from one adjacent edge's midpoint to the other's
   is a fixed 0.5x0.5-leg right-triangle clip. For ANY unit cell, the perpendicular distance from that
   cell's own CENTER to its own corner-chamfer line is exactly 0.5/sqrt(2) ≈ 0.354 world units — a
   universal constant of the construction, independent of position or which of the 4 corners — so a
   convex (outward-bulging) stairstep corner's chamfer can only ever clip AWAY the cell's own outer
   0.354-radius corner sliver, nowhere near its center; a concave (inward-notched) corner's identical
   construction ADDS a sliver of floor into the void notch instead of removing anything. Every included
   cell along a chamfered run therefore keeps a real, comfortable margin inside the resulting floor
   polygon — this unit's own dev/verify-stage-c3b-circle-smooth.mjs checks this directly (every cell's
   OWN center still resolves inside a real containing triangle post-chamfer, not just "a map key
   exists").
   WHY IT READS AS ONE STRAIGHT DIAGONAL: for a perfect 1-cell-per-step staircase (exactly what
   unmergedSegments hands this function — every segment here is unit length by construction), chaining
   consecutive edge-MIDPOINTS together is a provable geometric identity: they are EXACTLY COLLINEAR
   (verified algebraically in this unit's own report, and empirically by the harness's own direction-
   consistency check on the resulting diagonal segments) — so the whole run reads as one flat 45-degree
   face, not a finer zigzag. Only the run's own two UNCHAMFERED endpoints (where it meets the
   surrounding non-staircase wall, not internal to the run) keep a short axis-aligned half-edge stub. */
function chamferRunCorners(run) {
  const n = run.length;
  const mids = run.map((s) => midpointOf(s.a, s.b));
  const out = [];
  out.push({ a: run[0].a, b: mids[0], kind: "wall", tier: run[0].tier });
  for (let i = 0; i < n - 1; i++) out.push({ a: mids[i], b: mids[i + 1], kind: "wall", tier: run[i].tier });
  out.push({ a: mids[n - 1], b: run[n - 1].b, kind: "wall", tier: run[n - 1].tier });
  return out;
}

/* diagonalizeStaircaseRing(poly, segments) -> STAGE-C3b's diagonal-face sibling of radialSmoothRing:
   scans `segments` (already unmergedSegments' full per-cell-edge resolution) for maximal RUNS of >=3
   consecutive unit 'wall' segments whose directions strictly alternate between two perpendicular unit
   vectors (a real multi-cell staircase — e.g. an octagon's own chamfered corner, rasterizeShape's
   `octagon` branch) and replaces each qualifying run with chamferRunCorners (above). A run shorter
   than 3 segments — a single ordinary 90-degree turn (an L/T/cross room's own genuine architectural
   corner, OR a degenerate 1-cell octagon chamfer indistinguishable from one without extra shape
   metadata) — is intentionally left UNTOUCHED, crisp: this is the scoping rule that keeps L/T/cross
   (and small octagon corners) reading exactly as before (Adam's own "octagon and L read great"
   baseline), while a REAL multi-cell staircase run gets the diagonal treatment. Door/riser segments
   are hard run-breaks (a run never spans across an aperture or an elevation change) — mirrors
   radialSmoothRing's own door-pin discipline (a door's own two boundary segments are never touched).
   SCOPED LIMITATION (documented, not a correctness risk): does not scan across the ring's own
   wraparound seam — in the worst case this leaves ONE of a shape's corners un-chamfered rather than
   mis-chamfering geometry (this unit's own report notes it; a fast-follow could special-case it). */
function diagonalizeStaircaseRing(poly, segments) {
  const n = segments.length;
  const out = [];
  let i = 0;
  while (i < n) {
    const cur = segments[i];
    if (cur.kind !== "wall" || Math.abs(segLen2D(cur) - 1) > 1e-6) { out.push(cur); i++; continue; }
    const dirA = directionOf(cur);
    let dirB = null;
    let j = i + 1;
    while (j < n) {
      const nxt = segments[j];
      if (nxt.kind !== "wall" || Math.abs(segLen2D(nxt) - 1) > 1e-6) break;
      const d = directionOf(nxt);
      const wantA = ((j - i) % 2 === 0);
      if (wantA) {
        if (Math.abs(d.dx - dirA.dx) > 1e-6 || Math.abs(d.dz - dirA.dz) > 1e-6) break;
      } else if (dirB === null) {
        if (!perpendicularUnit(dirA, d)) break;
        dirB = d;
      } else if (Math.abs(d.dx - dirB.dx) > 1e-6 || Math.abs(d.dz - dirB.dz) > 1e-6) break;
      j++;
    }
    const runLen = j - i;
    if (runLen >= 3 && dirB) { out.push(...chamferRunCorners(segments.slice(i, j))); i = j; }
    else { out.push(cur); i++; }
  }
  return { poly: ringToPolygon(out), segments: out };
}

function pointInTriangle2D(px, pz, a, b, c) {
  const d1 = (px - b.x) * (a.z - b.z) - (a.x - b.x) * (pz - b.z);
  const d2 = (px - c.x) * (b.z - c.z) - (b.x - c.x) * (pz - c.z);
  const d3 = (px - a.x) * (c.z - a.z) - (c.x - a.x) * (pz - a.z);
  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(hasNeg && hasPos);
}

// pointToSegmentDist2(px,pz, ax,az, bx,bz) -> squared distance from a point to a line SEGMENT (clamped
// to the segment's own endpoints) — the primitive the triangle-distance fallback below is built from.
function pointToSegmentDist2(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const L2 = dx * dx + dz * dz;
  let t = L2 > 0 ? ((px - ax) * dx + (pz - az) * dz) / L2 : 0;
  t = t < 0 ? 0 : (t > 1 ? 1 : t);
  const cx = ax + t * dx, cz = az + t * dz;
  return (px - cx) * (px - cx) + (pz - cz) * (pz - cz);
}

// pointToTriangleDist2(px,pz, a,b,c) -> squared distance from a point to the CLOSEST point of a solid
// triangle: 0 when the point is inside or exactly on an edge (pointInTriangle2D true), else the min
// squared distance to its three edges. This is the correct nearest-triangle metric for the dropped-
// cell fallback (compileRoomShellData's cellTriangleMap loop): a cell center sitting float-epsilon off
// an internal ear-clip diagonal fails the strict containment test for BOTH triangles sharing it, yet
// its true point-to-triangle distance to each is ~0 — so this picks a triangle the point ACTUALLY lies
// on, which a centroid-distance heuristic does NOT (a centroid can be arbitrarily far from a long thin
// triangle's own shared edge, wrongly ranking an unrelated triangle closer — measured: it mis-picked
// the octagon(10,10) fixture's "4,3" cell to a triangle 2.1 units off, not the edge-sharing one). Pure,
// deterministic.
function pointToTriangleDist2(px, pz, a, b, c) {
  if (pointInTriangle2D(px, pz, a, b, c)) return 0;
  const e1 = pointToSegmentDist2(px, pz, a.x, a.z, b.x, b.z);
  const e2 = pointToSegmentDist2(px, pz, b.x, b.z, c.x, c.z);
  const e3 = pointToSegmentDist2(px, pz, c.x, c.z, a.x, a.z);
  return Math.min(e1, e2, e3);
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

// A tier can be annular (a base floor around a pit, or a raised perimeter ring). Ear-clipping each
// traced ring as an independent simple polygon fills the hole and places an occluding floor over the
// lower tier. For any tier with multiple boundary rings, emit one coplanar quad per actual tier cell.
// This remains a single material/mesh surface, preserves world UVs and exact logical coverage, and is
// deliberately used only where the simple-polygon path cannot represent topology with holes.
function buildFloorCells(floorBuf, tierCells, elevationY, uvDensity, colorAt) {
  (tierCells || []).forEach((c) => {
    const x0 = c.x - 0.5, x1 = c.x + 0.5, z0 = c.z - 0.5, z1 = c.z + 0.5;
    const rgb = colorAt ? hexToRgb01(colorAt(c.x, c.z)) : null;
    const r = rgb ? rgb.r : 1, g = rgb ? rgb.g : 1, b = rgb ? rgb.b : 1;
    const iA = pushVert(floorBuf, x0, elevationY, z0, 0, 1, 0, x0 * uvDensity, z0 * uvDensity, r, g, b);
    const iB = pushVert(floorBuf, x1, elevationY, z0, 0, 1, 0, x1 * uvDensity, z0 * uvDensity, r, g, b);
    const iC = pushVert(floorBuf, x1, elevationY, z1, 0, 1, 0, x1 * uvDensity, z1 * uvDensity, r, g, b);
    const iD = pushVert(floorBuf, x0, elevationY, z1, 0, 1, 0, x0 * uvDensity, z1 * uvDensity, r, g, b);
    pushTri(floorBuf, iA, iD, iC);
    pushTri(floorBuf, iA, iC, iB);
  });
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
  // STAGE-C3b: `opts.smoothShape` — the STAGE-C C3 `shapeForArchetype` tag straight off the active
  // room's `rooms[].shape` (theater-boot.js threads it through unchanged) — picks a per-ring render
  // treatment by MODE:
  //   'circle'/'ellipse' -> "radial"   (radialSmoothRing: bow the boundary into a true curve)
  //   'octagon'/'L'/'T'/'cross' -> "diagonal" (diagonalizeStaircaseRing: chamfer real multi-cell
  //      staircase runs into a flat 45-degree face; L/T/cross structurally never HAVE a qualifying
  //      run — see diagonalizeStaircaseRing's own header — so this is a safety-net inclusion, not new
  //      geometry, for those two tags; only 'octagon' actually produces one in practice today)
  //   anything else (undefined/null/'rect'/'cave') -> null (the ORIGINAL simplifySegments path,
  //      byte-identical to before this unit — every existing pure-core test never sets this option;
  //      'cave' is deliberately excluded — an irregular noise blob should stay organically rough, not
  //      diagonal-faceted).
  // `opts.radialSmoothBlend` overrides DEFAULT_RADIAL_SMOOTH_BLEND (test-only knob — production
  // callers never set it); irrelevant to "diagonal" mode (chamferRunCorners has no blend parameter —
  // it's a fixed, provably-safe geometric construction, not a tunable nudge).
  const smoothShapeTag = opts.smoothShape || null;
  const smoothMode = (smoothShapeTag === "circle" || smoothShapeTag === "ellipse") ? "radial"
    : (smoothShapeTag === "octagon" || smoothShapeTag === "L" || smoothShapeTag === "T" || smoothShapeTag === "cross") ? "diagonal"
    : null;
  const radialSmoothBlend = typeof opts.radialSmoothBlend === "number" ? opts.radialSmoothBlend : DEFAULT_RADIAL_SMOOTH_BLEND;
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
    const complexTier = rings.length > 1;
    if (complexTier) buildFloorCells(floorBuf, tierCells, elevationY, uvDensity, floorColorAt);

    rings.forEach((ring) => {
      // STAGE-C3b: "radial" mode (circle/ellipse) needs FULL per-cell-edge boundary resolution
      // (unmergedSegments, no collinear-run collapse) — radialSmoothRing bows a flat multi-cell run
      // into a curve, and a single 2-endpoint chord under-represents that (see radialSmoothRing's own
      // header). "diagonal" mode does NOT: simplifySegments already NEVER merges two consecutive edges
      // of differing direction — by definition, a genuine alternating staircase run has no two
      // consecutive same-direction edges, so it survives simplify() as individual unit segments
      // already, right alongside its neighboring straight runs correctly merged. Routing 'diagonal'
      // mode through simplifySegments (not unmergedSegments) means an L/T/cross tag (or a too-small
      // octagon chamfer that never clears diagonalizeStaircaseRing's own 3-segment run threshold) with
      // NO qualifying staircase is BYTE-IDENTICAL to the untagged/off path — diagonalizeStaircaseRing
      // becomes a pure no-op rather than needlessly fragmenting every straight wall into unit quads.
      let segments = (smoothMode === "radial") ? unmergedSegments(ring) : simplifySegments(ring);
      let poly = ringToPolygon(segments);
      const fixed = ensureCCW(poly, segments);
      poly = fixed.poly; segments = fixed.segments;
      if (smoothMode === "radial") {
        // render-only: pulls THIS ring's own vertices toward the ellipse fitted to its own bbox,
        // door-adjacent vertices pinned — see radialSmoothRing's own header. Never touches `cells`/
        // `tierCells`/`allIndex` (the logical grid this ring was traced from), only the local poly/
        // segments arrays about to feed the floor triangulation + wall/riser quads below.
        const smoothed = radialSmoothRing(poly, segments, radialSmoothBlend);
        poly = smoothed.poly; segments = smoothed.segments;
      } else if (smoothMode === "diagonal") {
        // render-only: chamfers only the REAL multi-cell staircase runs this ring's own boundary
        // contains into a flat diagonal face — see diagonalizeStaircaseRing's own header. Same "never
        // touches the logical cell set" guarantee as the radial path.
        const diagonalized = diagonalizeStaircaseRing(poly, segments);
        poly = diagonalized.poly; segments = diagonalized.segments;
      }
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
      if (!complexTier && rectBBox) {
        buildFloorGrid(floorBuf, rectBBox,
          Math.round(rectBBox.minX), Math.round(rectBBox.maxX), Math.round(rectBBox.minZ), Math.round(rectBBox.maxZ),
          elevationY, uvDensity, floorColorAt);
      } else if (!complexTier) {
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
          if (!complexTier) {
            pushQuad(floorBuf, trueA, flushInnerA, flushInnerB, trueB, { x: 0, y: 1, z: 0 },
              { u: trueA.x * uvDensity, v: trueA.z * uvDensity }, { u: flushInnerA.x * uvDensity, v: flushInnerA.z * uvDensity },
              { u: flushInnerB.x * uvDensity, v: flushInnerB.z * uvDensity }, { u: trueB.x * uvDensity, v: trueB.z * uvDensity },
              floorColorAt ? hexToRgb01(nearestFloorColor(seg)) : null);
          }
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
        if (!complexTier) {
          pushQuad(floorBuf, outerA, innerA, innerB, outerB, { x: 0, y: 1, z: 0 },
            { u: outerA.x * uvDensity, v: outerA.z * uvDensity }, { u: innerA.x * uvDensity, v: innerA.z * uvDensity },
            { u: innerB.x * uvDensity, v: innerB.z * uvDensity }, { u: outerB.x * uvDensity, v: outerB.z * uvDensity },
            floorColorAt ? hexToRgb01(nearestFloorColor(seg)) : null);
          bevelTriCount += 2;
        }

        if (seg.kind === "wall") {
          const h = wallHeightForSegment({ a: seg.a, b: seg.b, mid: { x: (seg.a.x + seg.b.x) / 2, z: (seg.a.z + seg.b.z) / 2 }, kind: "wall", tier });
          const baseY = elevationY - (complexTier ? 0 : bevelDrop);
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
    // ROOT FIX (STAGE-C3b, 2026-07-12 — the dropped-cell bug): a strict point-in-triangle test alone
    // silently DROPPED a cell whose center sits exactly ON (or a float-epsilon off) an internal ear-
    // clip triangulation diagonal — NO triangle strictly contains it, so the `break` never fired and
    // the cell got no map entry. Measured live on master: a real octagon(10,10) fixture dropped cells
    // "2,1" and "4,3" (76 cells -> 74 mapped) — a latent render-layer hit-test gap independent of the
    // C3b smoothing work (the diagonal chamfer merely fixed the OCTAGON case incidentally). The robust,
    // shape-agnostic fix: a NEAREST-TRIANGLE FALLBACK by true POINT-TO-TRIANGLE distance. Keep the
    // strictly-containing triangle when one exists (the common, exact case — behavior unchanged);
    // otherwise fall back to the triangle whose SOLID-TRIANGLE distance to the cell center is smallest
    // (pointToTriangleDist2 — 0 when the point is on an edge). Because a dropped cell sits on a shared
    // internal diagonal, that distance is ~0 for BOTH triangles owning the diagonal, so the fallback
    // resolves to a triangle the point ACTUALLY lies on (a correct hit-test answer) — NOT the wrong
    // faraway triangle a centroid-distance heuristic would pick (measured: centroid mis-picked "4,3" to
    // a triangle 2.1 units off its true edge). Fixed iteration order + strict `<` on the distance =>
    // deterministic, no RNG, pure. It is now IMPOSSIBLE for a floor cell to be left unmapped, any shape.
    tierCells.forEach((c) => {
      let contained = -1;
      let nearestTri = -1, nearestD2 = Infinity;
      for (let t = triStart; t < triStart + triCount; t++) {
        const i0 = floorBuf.indices[t * 3], i1 = floorBuf.indices[t * 3 + 1], i2 = floorBuf.indices[t * 3 + 2];
        const a = { x: floorBuf.positions[i0 * 3], z: floorBuf.positions[i0 * 3 + 2] };
        const b = { x: floorBuf.positions[i1 * 3], z: floorBuf.positions[i1 * 3 + 2] };
        const cc = { x: floorBuf.positions[i2 * 3], z: floorBuf.positions[i2 * 3 + 2] };
        if (pointInTriangle2D(c.x, c.z, a, b, cc)) { contained = t; break; }
        // running nearest by true solid-triangle distance, computed in the SAME pass so the fallback
        // costs nothing extra unless the strict test never hits (the rare on-diagonal float case).
        const d2 = pointToTriangleDist2(c.x, c.z, a, b, cc);
        if (d2 < nearestD2) { nearestD2 = d2; nearestTri = t; }
      }
      const resolved = contained >= 0 ? contained : nearestTri;
      if (resolved >= 0) cellTriangleMap[cellKey(c.x, c.z)] = { tier, triIndex: resolved };
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
  directionOf, mergeKeyFor, findSegmentStart, simplifySegments, unmergedSegments, ringToPolygon, signedArea2D,
  ensureCCW, segmentNormal, insetOffset, insetPolygon, radialSmoothRing,
  chamferRunCorners, diagonalizeStaircaseRing, pointInTriangle2D, pointToSegmentDist2, pointToTriangleDist2,
  triangulatePolygon, ringPerimeterU,
  hexToRgb01, polygonBBox, isAxisAlignedRectPolygon, buildAxisGrid, buildFloorGrid,
  compileRoomShellData,
  ROOM_SHELL_TIER_QUANTUM, DEFAULT_WALL_HEIGHT, DEFAULT_BEVEL_WIDTH, DEFAULT_BEVEL_DROP, DEFAULT_UV_DENSITY,
  DEFAULT_RADIAL_SMOOTH_BLEND,
  // THREE assembler (theater-boot.js's own import surface)
  compileRoomShell,
};
