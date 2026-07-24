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
       wallThickness: number — inward-normal-relative extrusion depth of the wall's own outer face,
         i.e. how far the outer face sits OUTSIDE (away from the room interior from) the inner face
         (default 0.22, realm/material band 0.15-0.32).
       wallStemHeight: number — the persistent capped-stem body height, always emitted opaque regardless
         of camera (default 0.28, band 0.22-0.40).
       wallCapHeight: number — top-cap slab thickness, at both the stem's own top AND the upper's own
         top when visible (default 0.06).
       wallCapOverhang: number — cap projection past each face (inner and outer) per side (default
         0.035, band 0.025-0.06).
       wallFooting: number — base-course skirt projection past the outer face, STEM band only (default
         0.06, band 0.04-0.10).
       wallTrim: boolean — emit baseCourse+cornice trim ribbons (default true); false -> `wallTrim` in
         the return bundle is null.
       upperVisibleForSegment(segMeta) -> boolean — OPTIONAL per-segment show/hide for the UPPER band
         (default () => true, every segment's upper renders). REPLACES wallHeightForSegment's old role
         as the camera-relative parapet-cut mechanism: a hidden segment renders its full-thickness
         capped STEM only (no squashed-height quad) — see this file's own C4.1a wall-branch comment.
         Pure module: no camera concept crosses into this file: the caller (theater-boot.js) resolves
         its own near/far test and hands back a plain boolean per segment.
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

// UNIT G2 (docs/GEOMETRY-OSS-INTEGRATION.md §15, §17.5) — the PolygonKernel adapter (G1,
// src/ui/geometry/polygon-kernel.js) is imported here, at the top of the PURE core, because using it
// stays pure (no THREE/DOM/window, no Math.random/Date.now — see that module's own header): it is
// composed into the floor pipeline below exactly like any other pure helper this file already calls
// (insetPolygon, triangulatePolygon, etc.), never crossing the "THREE ASSEMBLER" divider further down.
// This import adds ZERO behavior change on its own — it is inert until ROOM_SHELL_POLYGON_KERNEL (or
// an explicit opts.roomShellPolygonKernel) selects "oss"/"oss-compare" below.
import * as PolygonKernel from "./geometry/polygon-kernel.js";

// ROOM_SHELL_POLYGON_KERNEL — the §15 migration switch: "legacy" (DEFAULT, current production output,
// byte-identical) | "oss-compare" (render legacy, compute both, emit parity diagnostics) | "oss"
// (render the PolygonKernel floor path). NEVER flip this default — promotion is a separate, later,
// explicitly-gated decision (§15's own 10-step promotion sequence), not something this unit performs.
// theater-boot.js owns its own copy of this same three-value switch (a `let` near ITR_ROOM_SHELL,
// test-seam-settable via window.Theater._setRoomShellPolygonKernel) and threads it through as
// opts.roomShellPolygonKernel on every compileRoomShell(...) call; this exported constant is the
// canonical default a caller falls back to when it omits the option entirely (dev/verify-room-shell.mjs
// fixtures, any bare compileRoomShellData(cells) call with no opts).
const ROOM_SHELL_POLYGON_KERNEL = "legacy";

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

// ── C4.1a WALL VOLUME GEOMETRY (docs/WALL-VOLUMES-PRACTICALS.md, Unit C4.1a) — every boundary wall
// segment becomes a heavy architectural volume (capped stem + independently-hideable upper + optional
// trim + inner-face mount slots) instead of a single two-triangle plane. Defaults per the spec's own
// "Suggested initial dimensions at one world unit = five feet" table; all overridable per-opts, all
// PURE (no camera/THREE concept below this line — the near/far show-or-hide decision is a caller-
// supplied BOOLEAN predicate, `opts.upperVisibleForSegment`, never computed here).
const DEFAULT_WALL_THICKNESS = 0.22;      // 0.15-0.32 realm/material band
const DEFAULT_WALL_STEM_HEIGHT = 0.28;    // 0.22-0.40 band — the persistent capped-stem body height
const DEFAULT_WALL_CAP_HEIGHT = 0.06;     // top-cap slab thickness
const DEFAULT_WALL_CAP_OVERHANG = 0.035;  // 0.025-0.06 band — cap projection past each face per side
const DEFAULT_WALL_FOOTING = 0.06;        // 0.04-0.10 band — base-course projection past the outer face
const DEFAULT_WALL_MOUNT_EYE_HEIGHT = 1.4; // world Y of a default inner-face mount slot ("eye-height band")
// THE DOOR / DOOR-FRAME SPLIT (Adam, 2026-07-23): these are the clear dimensions of the rectangular
// SOCKET cut into the wall body, not dimensions of a separate frame object. At 1 world unit = 60 in,
// the independently-rendered 36"×80" leaf is 0.6×4/3 u; the extra clearance belongs to the wall hole.
const DEFAULT_DOOR_OPENING_WIDTH = 0.61;
const DEFAULT_DOOR_OPENING_HEIGHT = 1.35;

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

// lineIntersect2D(p1, d1, p2, d2) -> the point where the INFINITE line through p1 (direction d1) meets
// the infinite line through p2 (direction d2), or null when the lines are parallel/degenerate (a
// genuinely synthetic fixture no real rasterized room produces — chamferRunCorners' own caller falls
// back to the pre-miter endpoint rather than silently dropping geometry when this returns null).
function lineIntersect2D(p1, d1, p2, d2) {
  const denom = d1.dx * d2.dz - d1.dz * d2.dx;
  if (Math.abs(denom) < 1e-9) return null;
  const dx = p2.x - p1.x, dz = p2.z - p1.z;
  const t = (dx * d2.dz - dz * d2.dx) / denom;
  return { x: p1.x + d1.dx * t, z: p1.z + d1.dz * t };
}

/* chamferRunCorners(run, prevSeg, nextSeg) -> run: >=3 consecutive UNIT 'wall' segments whose
   directions strictly alternate between two perpendicular unit vectors (a genuine multi-step staircase
   — see diagonalizeStaircaseRing's own run-detection, below, for what qualifies). Replaces every
   INTERNAL corner (between run[i] and run[i+1]) with a diagonal connecting the two adjacent edges' own
   MIDPOINTS, instead of routing through the original sharp grid corner. `prevSeg`/`nextSeg` (the ring's
   own straight-wall segments immediately BEFORE/AFTER this run — null when unavailable) let the
   diagonal chain MITER cleanly into them (see PHASE 0 below) instead of stopping at a stub.

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
   face, not a finer zigzag.

   PHASE 0 FIX (docs/WALL-VOLUMES-PRACTICALS.md coordination note, 2026-07-12 — Codex diagnosis): the
   run's own two UNCHAMFERED endpoints used to keep a short AXIS-ALIGNED half-edge stub (run[0].a ->
   mids[0], mids[n-1] -> run[n-1].b) — a visible dogleg where the diagonal met the neighboring straight
   wall through TWO bends instead of one clean miter. Fixed by EXTENDING the diagonal's own line (through
   mids[0]/mids[n-1], direction proven collinear above) out to its intersection with `prevSeg`'s /
   `nextSeg`'s own line (lineIntersect2D, above — an exact 2D line-line solve, the SAME kind of exact
   construction insetOffset already uses for the floor bevel's own miter join) and TRIMMING the neighbor
   segment's own shared endpoint to that SAME point (the caller, diagonalizeStaircaseRing, applies that
   trim to prevSeg/nextSeg — this function only computes and returns it). The result: [straight, TRIMMED]
   -> [one straight 45-degree diagonal, now reaching all the way to the miter] -> [straight, TRIMMED],
   meeting at clean single-bend vertices — no intermediate axis-aligned stub anywhere. This MOVES the
   contour strictly OUTWARD in the trimmed span (the diagonal at 45 degrees reaches farther from the
   room's own center than the old axis-aligned stub did over the same span) — it can only ADD floor
   area, never clip a cell, preserving every existing containment guarantee above. Falls back to the
   OLD stub endpoint when no `prevSeg`/`nextSeg` is supplied or the lines are parallel/degenerate (never
   silently drops geometry).

   C4.1c PART 1 (docs/STAGE-C4.1c-FLOOR-CONGRUENCE.md): `run` is no longer guaranteed all-'wall' —
   diagonalizeStaircaseRing now also qualifies real multi-cell 'riser' staircase runs (a tier
   boundary IS architecturally a wall). `chamferMetaFor(seg)` carries each run segment's own kind
   forward onto the emitted diagonal chain — `tier` for a wall run, `loTier`/`hiTier` for a riser
   run (so the caller's `tier === seg.loTier` riser-quad-ownership test, and the riser's own
   loY/hiY height lookup, still resolve correctly post-chamfer) — never a mix within one run (the
   caller only ever hands this function a same-family run; see diagonalizeStaircaseRing's own
   run-qualification). */
function chamferMetaFor(seg) {
  return seg.kind === "riser" ? { kind: "riser", loTier: seg.loTier, hiTier: seg.hiTier } : { kind: "wall", tier: seg.tier };
}
function chamferRunCorners(run, prevSeg, nextSeg) {
  const n = run.length;
  const mids = run.map((s) => midpointOf(s.a, s.b));
  const diagDir = directionOf({ a: mids[0], b: mids[n - 1] });

  const prevDir = prevSeg ? directionOf(prevSeg) : null;
  const startMiter = (prevSeg && prevDir) ? lineIntersect2D(mids[0], diagDir, prevSeg.a, prevDir) : null;
  const diagStart = startMiter || run[0].a;

  const nextDir = nextSeg ? directionOf(nextSeg) : null;
  const endMiter = (nextSeg && nextDir) ? lineIntersect2D(mids[n - 1], diagDir, nextSeg.a, nextDir) : null;
  const diagEnd = endMiter || run[n - 1].b;

  const out = [];
  out.push(Object.assign({ a: diagStart, b: mids[0] }, chamferMetaFor(run[0])));
  for (let i = 0; i < n - 1; i++) out.push(Object.assign({ a: mids[i], b: mids[i + 1] }, chamferMetaFor(run[i])));
  out.push(Object.assign({ a: mids[n - 1], b: diagEnd }, chamferMetaFor(run[n - 1])));
  // trimmedPrevB/trimmedNextA: null when no miter was computed — the caller then leaves prevSeg/nextSeg
  // untouched (the pre-Phase-0 fallback shape, still geometrically valid, just the old dogleg).
  return { segments: out, trimmedPrevB: startMiter, trimmedNextA: endMiter };
}

// diagonalRunQualifies(seg) -> true when `seg` can ever be PART of a chamferable staircase run: unit
// length, AND kind 'wall' OR 'riser' (C4.1c PART 1 — a tier boundary is architecturally a wall too;
// 'door' segments never qualify, staying hard run-breaks per this file's own door-pin convention).
function diagonalRunQualifies(seg) {
  return (seg.kind === "wall" || seg.kind === "riser") && Math.abs(segLen2D(seg) - 1) < 1e-6;
}
// diagonalSameRunFamily(a, b) -> true when `a`/`b` may chamfer together in ONE run: same `kind`, and
// for 'riser' ALSO the same {loTier,hiTier} pair (C4.1c PART 1's own "never merge risers spanning
// different tier pairs" guard — a riser between tier 0/1 never merges into a run with a riser between
// tier 1/2, even if both happen to be unit-length and alternate direction).
function diagonalSameRunFamily(a, b) {
  if (a.kind !== b.kind) return false;
  return a.kind !== "riser" || (a.loTier === b.loTier && a.hiTier === b.hiTier);
}

// findDiagonalSafeStart(segments) -> the index of the first segment GUARANTEED not part of any
// staircase run (fails diagonalRunQualifies) — PHASE 0's wraparound fix: rotating the scan to start
// here means a run can never need to "wrap" past the array end back to index 0 for its own continuation
// (index 0 itself can never be mid-run after this rotation), so diagonalizeStaircaseRing's single
// forward pass sees every run as ONE contiguous slice even when the room's own raw boundary trace
// happened to start mid-corner. Falls back to 0 (unrotated) for the degenerate all-unit-wall ring no
// real rasterized room produces (never infinite-loops or throws).
function findDiagonalSafeStart(segments) {
  for (let i = 0; i < segments.length; i++) {
    if (!diagonalRunQualifies(segments[i])) return i;
  }
  return 0;
}

/* diagonalizeStaircaseRing(poly, segments) -> STAGE-C3b's diagonal-face sibling of radialSmoothRing:
   scans `segments` (already unmergedSegments' full per-cell-edge resolution) for maximal RUNS of >=3
   consecutive unit 'wall' OR 'riser' segments whose directions strictly alternate between two
   perpendicular unit vectors (a real multi-cell staircase — e.g. an octagon's own chamfered corner,
   rasterizeShape's `octagon` branch, OR C4.1c PART 1's own tier-boundary riser staircase — the SAME
   annular tier's inner ring following that same octagon flow) and replaces each qualifying run with
   chamferRunCorners (above), MITERING it into its own straight neighbors (PHASE 0, chamferRunCorners'
   own header). A run shorter than 3 segments — a single ordinary 90-degree turn (an L/T/cross room's
   own genuine architectural corner, OR a degenerate 1-cell octagon chamfer indistinguishable from one
   without extra shape metadata) — is intentionally left UNTOUCHED, crisp: this is the scoping rule
   that keeps L/T/cross (and small octagon corners) reading exactly as before (Adam's own "octagon and
   L read great" baseline), while a REAL multi-cell staircase run gets the diagonal treatment. Door
   segments are ALWAYS hard run-breaks (a run never spans across an aperture); a 'wall' run and a
   'riser' run (or two risers of differing {loTier,hiTier}) never merge into each other's run either
   (diagonalSameRunFamily, above) — mirrors radialSmoothRing's own door-pin discipline (a door's own
   two boundary segments are never touched).
   PHASE 0: the ring's own array-wraparound seam is now handled (findDiagonalSafeStart, above) — a
   corner landing exactly at the raw trace's own start index chamfers as ONE clean run, not two
   truncated fragments (the prior "SCOPED LIMITATION", closed). */
function diagonalizeStaircaseRing(poly, segments) {
  const startIdx = findDiagonalSafeStart(segments);
  const rotated = startIdx === 0 ? segments.slice() : segments.slice(startIdx).concat(segments.slice(0, startIdx));
  const n = rotated.length;
  const out = [];
  // anyChamfered: NO-OP GUARANTEE (L/T/cross, a too-small octagon chamfer) — the rotation above is
  // needed ONLY to correctly scan a run that straddles the array seam; when this ring never actually
  // qualifies a single run (every segment falls through to the plain `else` push below), the rotation
  // would otherwise still be an OBSERVABLE reordering of `segments`' own output order relative to the
  // untagged path (which never rotates at all) — breaking "tagged with no real chamfer -> byte-
  // identical to untagged". Tracked so the final return can bypass the rotated/rebuilt result entirely
  // and hand back the ORIGINAL (poly, segments) unchanged whenever nothing was actually chamfered.
  let anyChamfered = false;
  let i = 0;
  while (i < n) {
    const cur = rotated[i];
    if (!diagonalRunQualifies(cur)) { out.push(cur); i++; continue; }
    const dirA = directionOf(cur);
    let dirB = null;
    let j = i + 1;
    while (j < n) {
      const nxt = rotated[j];
      if (!diagonalRunQualifies(nxt) || !diagonalSameRunFamily(cur, nxt)) break;
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
    if (runLen >= 3 && dirB) {
      anyChamfered = true;
      // prevSeg: the ring's own straight-wall neighbor already pushed to `out` (findDiagonalSafeStart
      // guarantees i>0 whenever a run starts, so out is never empty here). nextSeg: the ring's own
      // straight-wall neighbor still ahead in `rotated` — or, when the run reaches the literal array
      // end (j===n), the rotation-start segment itself (out[0]) via the ring's own wraparound, since
      // findDiagonalSafeStart guarantees rotated[0] can never be mid-run.
      const prevSeg = out[out.length - 1];
      const nextSeg = j < n ? rotated[j] : rotated[0];
      const chamfered = chamferRunCorners(rotated.slice(i, j), prevSeg, nextSeg);
      if (chamfered.trimmedPrevB) {
        out[out.length - 1] = Object.assign({}, prevSeg, { b: chamfered.trimmedPrevB });
      }
      out.push(...chamfered.segments);
      if (chamfered.trimmedNextA) {
        if (j < n) {
          rotated[j] = Object.assign({}, rotated[j], { a: chamfered.trimmedNextA });
        } else if (out.length) {
          // wraparound: nextSeg IS out[0] (already pushed) — trim that already-emitted copy directly,
          // since `rotated[0]` itself is no longer read again this pass.
          out[0] = Object.assign({}, out[0], { a: chamfered.trimmedNextA });
        }
      }
      i = j;
    } else { out.push(cur); i++; }
  }
  if (!anyChamfered) return { poly, segments }; // NO-OP GUARANTEE — see the header comment above.
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

// ── C4.1c PART 2 (docs/STAGE-C4.1c-FLOOR-CONGRUENCE.md) — HOLE-BRIDGING for an annular (complex,
// multi-ring) tier's floor, e.g. a raised perimeter ring tier that carves a sunken arena hole out of
// its own middle. Decisions: "keep triangulatePolygon the single ear-clip; bridge holes into the
// outer loop rather than maintain a second triangulation path" — every function below only ever
// PREPARES a single simple (possibly "weakly simple", i.e. touching itself at a thin bridge) polygon
// for the SAME triangulatePolygon above; no new triangulator. ──────────────────────────────────────

// polygonContainsPoint(poly, pt) -> standard even-odd ray-casting point-in-polygon test. Used ONLY to
// decide which OUTER ring a given hole ring belongs to when a tier has more than one outer boundary
// loop (e.g. this unit's own row-101 fixture pre-fix state, where a since-fixed upstream bug once
// left two disjoint same-tier islands) — never used for the cellTriangleMap containment guarantee
// itself (that stays pointInTriangle2D/pointToTriangleDist2 against the final real triangles, entirely
// unchanged by this addition).
function polygonContainsPoint(poly, pt) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, zi = poly[i].z, xj = poly[j].x, zj = poly[j].z;
    const intersect = ((zi > pt.z) !== (zj > pt.z)) && (pt.x < ((xj - xi) * (pt.z - zi)) / (zj - zi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// segCross/segmentsProperlyIntersect/bridgeVisible — a plain segment-segment PROPER-crossing test
// (shared-endpoint touches don't count) used only to pick a hole-bridge anchor pair that doesn't cut
// across the outer boundary or the hole's own boundary (bridgeHoleIntoOuter's own visibility check).
function segCross(o, a, b) { return (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x); }
function segmentsProperlyIntersect(p1, p2, p3, p4) {
  const d1 = segCross(p3, p4, p1), d2 = segCross(p3, p4, p2);
  const d3 = segCross(p1, p2, p3), d4 = segCross(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
function bridgeVisible(a, b, poly, skipIdx) {
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    if (i === skipIdx || j === skipIdx) continue;
    if (segmentsProperlyIntersect(a, b, poly[i], poly[j])) return false;
  }
  return true;
}
// HOLE_BRIDGE_EPS — the perpendicular separation between a bridge's own "entry" edge (outer vertex ->
// hole vertex) and its "return" edge (hole vertex -> outer vertex), so the two bridge edges are a
// real (if hair-thin) two-sided corridor rather than one exactly-duplicated zero-width slit. Purely a
// numerical-robustness device for the ear-clip below (an EXACT duplicate point pair defeats
// triangulatePolygon's own "does any other vertex sit inside this candidate ear" containment test,
// which treats an on-edge/on-vertex point as contained — see this unit's own report for the measured
// failure) — 1e-4 world units (~0.02 real inches, 1 world unit = 5 ft) is far below anything visible.
const HOLE_BRIDGE_EPS = 1e-4;

// bridgeHoleIntoOuter(outerPoly, holePolyRaw) -> splices `holePolyRaw` (a hole inside `outerPoly`, ANY
// winding on input — normalized here) into `outerPoly`'s own boundary via a thin two-edge bridge (the
// standard "polygon-with-a-hole -> one ear-clippable simple polygon" technique: connect the hole's own
// rightmost vertex to a mutually-visible outer vertex), so the caller can hand the RESULT straight to
// triangulatePolygon. Never mutates its inputs. Total-function: returns `outerPoly` unchanged on a
// degenerate (<3-vertex) input rather than throwing.
function bridgeHoleIntoOuter(outerPoly, holePolyRaw) {
  const n = outerPoly.length;
  let hole = holePolyRaw.slice();
  if (n < 3 || hole.length < 3) return outerPoly;
  // a hole ring must wind OPPOSITE the (CCW) outer for a correct polygon-with-hole fill — force it,
  // regardless of whatever winding it arrived in (this file's own ring-processing loop always hands
  // every ring through ensureCCW first, so both outer and hole insets arrive CCW/positive-area here).
  if (signedArea2D(hole) > 0) hole = hole.slice().reverse();
  const m = hole.length;

  // bridge anchor: the hole's own rightmost vertex (max x, tie-break max z) — the classic "a hole's
  // rightmost point always sees SOME point of the enclosing boundary to its own east" construction,
  // guaranteeing a real (non-crossing) bridge exists for any simple polygon-with-hole.
  let hIdx = 0;
  for (let i = 1; i < m; i++) {
    if (hole[i].x > hole[hIdx].x || (hole[i].x === hole[hIdx].x && hole[i].z > hole[hIdx].z)) hIdx = i;
  }
  const H = hole[hIdx];
  const order = outerPoly.map((_, i) => i).sort((a, b) => {
    const da = (outerPoly[a].x - H.x) * (outerPoly[a].x - H.x) + (outerPoly[a].z - H.z) * (outerPoly[a].z - H.z);
    const db = (outerPoly[b].x - H.x) * (outerPoly[b].x - H.x) + (outerPoly[b].z - H.z) * (outerPoly[b].z - H.z);
    return da - db;
  });
  let oIdx = order.length ? order[0] : 0;
  for (let k = 0; k < order.length; k++) {
    const cand = order[k];
    const O = outerPoly[cand];
    if (!bridgeVisible(H, O, outerPoly, cand)) continue;
    if (!bridgeVisible(H, O, hole, hIdx)) continue;
    oIdx = cand;
    break;
  }
  const O = outerPoly[oIdx];

  // HOLE_BRIDGE_EPS-separated "return" copies of O/H (see that constant's own header) — the entry
  // edge (O -> H, exact) and the return edge (H2 -> O2, offset) form a real thin corridor instead of
  // one exactly-duplicated slit.
  const dx = O.x - H.x, dz = O.z - H.z, len = Math.hypot(dx, dz) || 1;
  const px = -dz / len, pz = dx / len; // unit perpendicular to the bridge direction
  const O2 = { x: O.x - px * HOLE_BRIDGE_EPS, z: O.z - pz * HOLE_BRIDGE_EPS };
  const H2 = { x: H.x - px * HOLE_BRIDGE_EPS, z: H.z - pz * HOLE_BRIDGE_EPS };

  const rotatedHole = hole.slice(hIdx).concat(hole.slice(0, hIdx)); // starts at H exactly
  const result = [];
  for (let i = 0; i <= oIdx; i++) result.push(outerPoly[i]);
  rotatedHole.forEach((v) => result.push(v)); // H -> ... -> (hole vertex just before H again)
  result.push(H2);
  result.push(O2);
  for (let i = oIdx + 1; i < n; i++) result.push(outerPoly[i]);
  return result;
}

// bridgePolygonWithHoles(outerInsets, holeInsets) -> Array<poly> — sequentially bridges every hole
// (from `holeInsets`) into whichever outer polygon (from `outerInsets`) actually contains it, then
// returns the resulting list of (possibly hole-bridged) simple polygons, one per outer. A tier with
// zero outers (should never happen for a tier with real area — see this unit's own report) falls back
// to treating every ring as its own independent outer rather than dropping geometry.
function bridgePolygonWithHoles(outerInsets, holeInsets) {
  if (!outerInsets.length) return holeInsets.slice();
  const bridged = outerInsets.map((p) => p.slice());
  holeInsets.forEach((hole) => {
    if (hole.length < 3) return;
    let targetIdx = 0;
    for (let i = 0; i < bridged.length; i++) {
      if (polygonContainsPoint(bridged[i], hole[0])) { targetIdx = i; break; }
    }
    bridged[targetIdx] = bridgeHoleIntoOuter(bridged[targetIdx], hole);
  });
  return bridged;
}

// triangleHasPositiveArea(poly, tri) -> true when the [i,j,k] triangle index-triple (into `poly`) has
// a strictly positive signed area — the correct CCW winding this file's floor triangles always carry.
// Used only as validateHollowFloorTriangulation's own per-triangle safety check, below.
function triangleHasPositiveArea(poly, tri) {
  const a = poly[tri[0]], b = poly[tri[1]], c = poly[tri[2]];
  return ((b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x)) > 1e-9;
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

// pushWallVerticalFace(buf, aBottom, bBottom, aTop, bTop, normal, u0, u1, v0, v1, color) — a thin
// wrapper over pushQuad for the common "vertical band between two world points at two heights" shape
// every wall-volume face (inner/outer/cap-lip/end-cap/footing-face) reduces to; keeps the a->b->bTop->
// aTop winding + uv0..uv3 assembly in exactly ONE place so every C4.1a face shares the same convention.
function pushWallVerticalFace(buf, aBottom, bBottom, aTop, bTop, normal, u0, u1, v0, v1, color) {
  pushQuad(buf, aBottom, bBottom, bTop, aTop, normal,
    { u: u0, v: v0 }, { u: u1, v: v0 }, { u: u1, v: v1 }, { u: u0, v: v1 }, color);
}

/* buildWallBox(buf, p) — C4.1a's core primitive: pushes ONE vertical architectural band [p.yBase,p.yTop]
   of a wall segment into `buf` as a real capped box (inner face, outer face, an overhanging top-cap
   slab, two end caps closing the box's own thickness cross-section, and an optional footing skirt at
   the base) — replacing the old "one two-triangle plane" wall quad. Pure geometry, no THREE/camera.

   p: { innerA, innerB, outerA, outerB — {x,z} world points (outer = inner offset -n*wallThickness,
         computed by the caller so this function stays a dumb box-builder), n — inward unit normal,
         tX, tZ — unit tangent (b-a direction), yBase, yTop — the band's own vertical extent, capHeight,
         capOverhang, footing (0 = no footing skirt — only the STEM band gets one), color, u0, u1 (this
         segment's own ring-perimeter arc-length span, reused verbatim as the vertical faces' own U),
         uvDensity (world-unit texture repeat, for the two horizontal faces: cap top + footing ledge),
         capInA, capInB, capOutA, capOutB, footOutA, footOutB — OPTIONAL explicit lip point overrides (UNIT G3,
         docs/STAGE-G3-WALL-RUNS.md's "build the stem, upper, cap, footing, and trim from the SAME run
         contour"). When omitted (every legacy call site, byte-identical), derived internally exactly as
         before (innerA/innerB and outerA/outerB offset by n*capOverhang / n*footing). When supplied (the oss wall-run
         path only), used VERBATIM instead — this is what lets a run-mitered corner's cap/footing outer
         lip ALSO land on one shared point instead of re-introducing the corner-gap defect one dimension
         out (a plain per-segment n*capOverhang offset would still gap at a corner even after outerA/
         outerB themselves were corrected to a true miter — capOutA/capOutB/footOutA/footOutB let the
         caller hand this function an already-corner-correct lip point instead). }

   SCOPING SIMPLIFICATION (documented — C4.1a's own "a few long quads" mandate, no exact corner miter
   chased BY THIS FUNCTION ITSELF): each segment's own end caps are built independently of its ring
   neighbors (no shared-corner miter solve here, unlike insetOffset's exact 2D miter for the FLOOR
   bevel) — at a real 90-degree room corner this leaves a measured ~0.31-world-unit GAP (not overlap —
   docs/STAGE-G3-WALL-RUNS.md's own ruling corrects this file's earlier, wrong, claim that it was an
   invisible overlap) between two adjacent segments' own independently-computed outer-corner geometry
   UNLESS the caller supplies pre-mitered outerA/outerB/capInA/capInB/capOutA/capOutB/footOutA/footOutB (the oss wall-
   run path, compileRoomShellData's own kernelMode==="oss" branch, below). */
function buildWallBox(buf, p) {
  const { innerA, innerB, outerA, outerB, n, tX, tZ, yBase, yTop, capHeight, capOverhang, footing, color, u0, u1, uvDensity } = p;
  const h = yTop - yBase;
  // inner face — faces the room interior, normal = n (the SAME a->b/n convention the pre-C4.1a single
  // wall quad already used, so a visible-upper segment's inner face at [stemHeight,wallHeight] reads
  // identically to the old full-height quad's own upper portion).
  pushWallVerticalFace(buf,
    { x: innerA.x, y: yBase, z: innerA.z }, { x: innerB.x, y: yBase, z: innerB.z },
    { x: innerA.x, y: yTop, z: innerA.z }, { x: innerB.x, y: yTop, z: innerB.z },
    { x: n.x, y: 0, z: n.z }, u0, u1, 0, h, color);
  // outer face — faces away from the room (the NEW C4.1a surface no single-quad wall ever had), normal
  // = -n; a/b reversed so the quad's own winding faces outward (mirrors ensureCCW's own "reverse both
  // in lockstep" convention this file already uses for a CW-traced ring).
  pushWallVerticalFace(buf,
    { x: outerB.x, y: yBase, z: outerB.z }, { x: outerA.x, y: yBase, z: outerA.z },
    { x: outerB.x, y: yTop, z: outerB.z }, { x: outerA.x, y: yTop, z: outerA.z },
    { x: -n.x, y: 0, z: -n.z }, u1, u0, 0, h, color);
  // top cap — a slab overhanging capOverhang past BOTH inner and outer faces, capHeight thick, closed
  // by a horizontal top face (the |ny|~=1 silhouette-producing surface frame 01 calls "visible wall
  // thickness at the top") plus two vertical lip faces so the overhang itself has real depth, not a
  // zero-thickness flap.
  const capInA = p.capInA || { x: innerA.x + n.x * capOverhang, z: innerA.z + n.z * capOverhang };
  const capInB = p.capInB || { x: innerB.x + n.x * capOverhang, z: innerB.z + n.z * capOverhang };
  const capOutA = p.capOutA || { x: outerA.x - n.x * capOverhang, z: outerA.z - n.z * capOverhang };
  const capOutB = p.capOutB || { x: outerB.x - n.x * capOverhang, z: outerB.z - n.z * capOverhang };
  const capTopY = yTop + capHeight;
  pushQuad(buf,
    { x: capOutA.x, y: capTopY, z: capOutA.z }, { x: capOutB.x, y: capTopY, z: capOutB.z },
    { x: capInB.x, y: capTopY, z: capInB.z }, { x: capInA.x, y: capTopY, z: capInA.z },
    { x: 0, y: 1, z: 0 },
    { u: capOutA.x * uvDensity, v: capOutA.z * uvDensity }, { u: capOutB.x * uvDensity, v: capOutB.z * uvDensity },
    { u: capInB.x * uvDensity, v: capInB.z * uvDensity }, { u: capInA.x * uvDensity, v: capInA.z * uvDensity }, color);
  pushWallVerticalFace(buf, // cap's own outward lip (closes the overhang's outward edge)
    { x: outerB.x, y: yTop, z: outerB.z }, { x: outerA.x, y: yTop, z: outerA.z },
    { x: capOutB.x, y: capTopY, z: capOutB.z }, { x: capOutA.x, y: capTopY, z: capOutA.z },
    { x: -n.x, y: 0, z: -n.z }, u1, u0, 0, capHeight, color);
  pushWallVerticalFace(buf, // cap's own inward lip
    { x: innerA.x, y: yTop, z: innerA.z }, { x: innerB.x, y: yTop, z: innerB.z },
    { x: capInA.x, y: capTopY, z: capInA.z }, { x: capInB.x, y: capTopY, z: capInB.z },
    { x: n.x, y: 0, z: n.z }, u0, u1, 0, capHeight, color);
  // end caps — close the box's own thickness cross-section at BOTH 'a' and 'b' (frame 01's "exposed
  // ends"): every wall segment gets both unconditionally (see this function's own header for why no
  // neighbor-aware skip is needed post-simplification — a door-adjacent end IS the jamb face).
  pushWallVerticalFace(buf,
    { x: outerA.x, y: yBase, z: outerA.z }, { x: innerA.x, y: yBase, z: innerA.z },
    { x: outerA.x, y: yTop, z: outerA.z }, { x: innerA.x, y: yTop, z: innerA.z },
    { x: -tX, y: 0, z: -tZ }, 0, 1, 0, h, color);
  pushWallVerticalFace(buf,
    { x: innerB.x, y: yBase, z: innerB.z }, { x: outerB.x, y: yBase, z: outerB.z },
    { x: innerB.x, y: yTop, z: innerB.z }, { x: outerB.x, y: yTop, z: outerB.z },
    { x: tX, y: 0, z: tZ }, 0, 1, 0, h, color);
  // footing skirt — a projecting ledge courses OUT past the outer face at the band's own base (only
  // ever passed a nonzero `footing` for the STEM band; the upper band never re-foots itself).
  if (footing > 0) {
    const footOutA = p.footOutA || { x: outerA.x - n.x * footing, z: outerA.z - n.z * footing };
    const footOutB = p.footOutB || { x: outerB.x - n.x * footing, z: outerB.z - n.z * footing };
    const footH = Math.min(capHeight, h);
    pushQuad(buf, // top ledge (horizontal)
      { x: footOutB.x, y: yBase, z: footOutB.z }, { x: footOutA.x, y: yBase, z: footOutA.z },
      { x: outerA.x, y: yBase, z: outerA.z }, { x: outerB.x, y: yBase, z: outerB.z },
      { x: 0, y: 1, z: 0 },
      { u: footOutB.x * uvDensity, v: footOutB.z * uvDensity }, { u: footOutA.x * uvDensity, v: footOutA.z * uvDensity },
      { u: outerA.x * uvDensity, v: outerA.z * uvDensity }, { u: outerB.x * uvDensity, v: outerB.z * uvDensity }, color);
    pushWallVerticalFace(buf, // the footing's own outward kick face
      { x: footOutB.x, y: yBase - footH, z: footOutB.z }, { x: footOutA.x, y: yBase - footH, z: footOutA.z },
      { x: footOutB.x, y: yBase, z: footOutB.z }, { x: footOutA.x, y: yBase, z: footOutA.z },
      { x: -n.x, y: 0, z: -n.z }, u1, u0, 0, footH, color);
  }
}

// buildWallPrismFaces — a CLEAN wall-volume primitive used for a doorway's subdivisions. Unlike
// buildWallBox it adds no decorative cap slab, footing, or unconditional internal end faces. That is
// deliberate: a doorway is one wall volume with a hole, not three standalone architectural boxes.
// Callers choose exactly which closure faces are physically exposed; buildWallTopCap then adds one
// continuous cap over the whole owner segment instead of one overlapping cap per subdivision.
function buildWallPrismFaces(buf, p) {
  const { innerA, innerB, outerA, outerB, n, tX, tZ, yBase, yTop, color, u0, u1, uvDensity } = p;
  const h = yTop - yBase;
  pushWallVerticalFace(buf,
    { x: innerA.x, y: yBase, z: innerA.z }, { x: innerB.x, y: yBase, z: innerB.z },
    { x: innerA.x, y: yTop, z: innerA.z }, { x: innerB.x, y: yTop, z: innerB.z },
    { x: n.x, y: 0, z: n.z }, u0, u1, 0, h, color);
  pushWallVerticalFace(buf,
    { x: outerB.x, y: yBase, z: outerB.z }, { x: outerA.x, y: yBase, z: outerA.z },
    { x: outerB.x, y: yTop, z: outerB.z }, { x: outerA.x, y: yTop, z: outerA.z },
    { x: -n.x, y: 0, z: -n.z }, u1, u0, 0, h, color);
  if (p.closeTop) {
    pushQuad(buf,
      { x: outerA.x, y: yTop, z: outerA.z }, { x: outerB.x, y: yTop, z: outerB.z },
      { x: innerB.x, y: yTop, z: innerB.z }, { x: innerA.x, y: yTop, z: innerA.z },
      { x: 0, y: 1, z: 0 },
      { u: outerA.x * uvDensity, v: outerA.z * uvDensity }, { u: outerB.x * uvDensity, v: outerB.z * uvDensity },
      { u: innerB.x * uvDensity, v: innerB.z * uvDensity }, { u: innerA.x * uvDensity, v: innerA.z * uvDensity }, color);
  }
  if (p.closeBottom) {
    pushQuad(buf,
      { x: outerB.x, y: yBase, z: outerB.z }, { x: outerA.x, y: yBase, z: outerA.z },
      { x: innerA.x, y: yBase, z: innerA.z }, { x: innerB.x, y: yBase, z: innerB.z },
      { x: 0, y: -1, z: 0 },
      { u: outerB.x * uvDensity, v: outerB.z * uvDensity }, { u: outerA.x * uvDensity, v: outerA.z * uvDensity },
      { u: innerA.x * uvDensity, v: innerA.z * uvDensity }, { u: innerB.x * uvDensity, v: innerB.z * uvDensity }, color);
  }
  if (p.closeA) {
    pushWallVerticalFace(buf,
      { x: outerA.x, y: yBase, z: outerA.z }, { x: innerA.x, y: yBase, z: innerA.z },
      { x: outerA.x, y: yTop, z: outerA.z }, { x: innerA.x, y: yTop, z: innerA.z },
      { x: -tX, y: 0, z: -tZ }, 0, 1, 0, h, color);
  }
  if (p.closeB) {
    pushWallVerticalFace(buf,
      { x: innerB.x, y: yBase, z: innerB.z }, { x: outerB.x, y: yBase, z: outerB.z },
      { x: innerB.x, y: yTop, z: innerB.z }, { x: outerB.x, y: yTop, z: outerB.z },
      { x: tX, y: 0, z: tZ }, 0, 1, 0, h, color);
  }
}

function buildWallTopCap(buf, p) {
  const { innerA, innerB, outerA, outerB, n, yTop, capHeight, capOverhang, color, u0, u1, uvDensity } = p;
  const capInA = { x: innerA.x + n.x * capOverhang, z: innerA.z + n.z * capOverhang };
  const capInB = { x: innerB.x + n.x * capOverhang, z: innerB.z + n.z * capOverhang };
  const capOutA = { x: outerA.x - n.x * capOverhang, z: outerA.z - n.z * capOverhang };
  const capOutB = { x: outerB.x - n.x * capOverhang, z: outerB.z - n.z * capOverhang };
  const capTopY = yTop + capHeight;
  pushQuad(buf,
    { x: capOutA.x, y: capTopY, z: capOutA.z }, { x: capOutB.x, y: capTopY, z: capOutB.z },
    { x: capInB.x, y: capTopY, z: capInB.z }, { x: capInA.x, y: capTopY, z: capInA.z },
    { x: 0, y: 1, z: 0 },
    { u: capOutA.x * uvDensity, v: capOutA.z * uvDensity }, { u: capOutB.x * uvDensity, v: capOutB.z * uvDensity },
    { u: capInB.x * uvDensity, v: capInB.z * uvDensity }, { u: capInA.x * uvDensity, v: capInA.z * uvDensity }, color);
  pushWallVerticalFace(buf,
    { x: outerB.x, y: yTop, z: outerB.z }, { x: outerA.x, y: yTop, z: outerA.z },
    { x: capOutB.x, y: capTopY, z: capOutB.z }, { x: capOutA.x, y: capTopY, z: capOutA.z },
    { x: -n.x, y: 0, z: -n.z }, u1, u0, 0, capHeight, color);
  pushWallVerticalFace(buf,
    { x: innerA.x, y: yTop, z: innerA.z }, { x: innerB.x, y: yTop, z: innerB.z },
    { x: capInA.x, y: capTopY, z: capInA.z }, { x: capInB.x, y: capTopY, z: capInB.z },
    { x: n.x, y: 0, z: n.z }, u0, u1, 0, capHeight, color);
}

/* buildBevelBridgeParams(cornerPoint, outA, outB) -> buildWallBox params for the small notch-filling box
   a G3 ACUTE corner needs (docs/STAGE-G3-WALL-RUNS.md's "bevel for acute/unstable" branch). At an
   ordinary MITER corner, segment j's own outerB and segment j+1's own outerA already coincide (one
   shared point) — buildWallBox's own unconditional per-segment end caps land back-to-back on that single
   point and close the corner with no extra geometry needed (the SAME redundant-but-harmless coincident-
   face pattern every existing miter corner already relies on). At a BEVEL corner they are instead the
   two DISTINCT endpoints of the short bevel edge Clipper2 injected (offsetOneRun's own ring-adjacency
   detection, polygon-kernel.js) — leaving a real notch between segment j's own end cap (which reaches
   only to outA.outerB) and segment j+1's own end cap (which reaches only to outB.outerA) UNLESS a third,
   tiny box bridges exactly that gap. This is that box's own params.

   `cornerPoint` — the shared, UNOFFSET inner vertex (segments[segA].b === segments[segB].a); both ends
   of the bridge's own degenerate zero-length "inner" edge (a bevel is purely an OUTER-face phenomenon —
   the inner boundary never moves, so the bridge's inner face is a zero-area filler, harmless). `outA`/
   `outB` — the computeOssWallOuterOffsets `outByIndex` entries for the two neighbor segments (segA,
   segB). The bridge's own cap/foot/trim lip points are NOT recomputed — they are outA's own B-side
   points and outB's own A-side points VERBATIM, because outA.capOutB (etc.) was already derived as
   `innerB(segA) + (outerB(segA)-innerB(segA)) * capRatio`, and innerB(segA) === cornerPoint === innerA
   (segB) — i.e. outA.capOutB IS ALREADY the bridge's own capOutA, scaled from the identical corner point
   along the identical vector. Reusing it verbatim (rather than a second independent offset) is what
   keeps the cap/foot lips watertight through the notch on every band, matching the stem's own bevel edge
   exactly instead of merely approximating it. */
function buildBevelBridgeParams(cornerPoint, outA, outB) {
  const innerPt = { x: cornerPoint.x, z: cornerPoint.z };
  const dx = outB.outerA.x - outA.outerB.x, dz = outB.outerA.z - outA.outerB.z;
  const len = Math.hypot(dx, dz) || 1;
  const tX = dx / len, tZ = dz / len;
  const n = { x: -tZ, z: tX }; // same 90-degree rotation segmentNormal/runLeftNormal already use
  return {
    innerA: innerPt, innerB: innerPt, outerA: outA.outerB, outerB: outB.outerA, n, tX, tZ,
    capInA: outA.capInB, capInB: outB.capInA,
    capOutA: outA.capOutB, capOutB: outB.capOutA,
    footOutA: outA.footOutB, footOutB: outB.footOutA,
    trimOutA: outA.trimOutB, trimOutB: outB.trimOutA,
  };
}

// sliceBufferForSegment(buf, segRef) -> a standalone {positions,normals,uvs,colors,indices} bundle for
// ONE wall segment's own vertex range out of a larger shared buffer (segRef: {vertStart,vertCount,
// idxStart,idxCount}, stamped per-segment by compileRoomShellData's own wallUpper emission below).
// Indices are re-based (- vertStart) so the slice is immediately BufferGeometry-ready on its own — this
// is what lets compileRoomShell hand C4.1a's "one geometry per wall segment" preference (spec's own
// per-segment-upper-mesh decision, for an independent per-segment show/hide handle) a real standalone
// geometry per segment without a second THREE-aware pass. Pure array slicing, no THREE.
function sliceBufferForSegment(buf, segRef) {
  const { vertStart, vertCount, idxStart, idxCount } = segRef;
  return {
    positions: buf.positions.slice(vertStart * 3, (vertStart + vertCount) * 3),
    normals: buf.normals.slice(vertStart * 3, (vertStart + vertCount) * 3),
    uvs: buf.uvs.slice(vertStart * 2, (vertStart + vertCount) * 2),
    colors: buf.colors.slice(vertStart * 3, (vertStart + vertCount) * 3),
    indices: buf.indices.slice(idxStart, idxStart + idxCount).map((i) => i - vertStart),
  };
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

// ── UNIT G2 (docs/GEOMETRY-OSS-INTEGRATION.md §7, §15, §17.5) — PolygonKernel floor integration ──
// Everything in this section is pure and INERT in "legacy" mode (compileRoomShellData's default):
// none of these functions are ever called unless opts.roomShellPolygonKernel resolves to "oss" or
// "oss-compare". They exist to replace exactly two things for "oss" mode, and nothing else:
//   1. ring TOPOLOGY discovery (traceTierContour+chainEdgesIntoRings, naive raw-edge walking) ->
//      unionCellRects (a real, vetted boolean-union library) — this is what corrects F11's diagonal-
//      vertex-pinch polygon/hole undercount and row-101's (F18) annular hole/ring topology.
//   2. floor-body TRIANGULATION (triangulatePolygon + bridgeHoleIntoOuter's hand-rolled hole bridge)
//      -> triangulateSurface (Earcut, native holes) — this is what corrects F08/B09's degenerate
//      door-adjacent triangles.
// Everything ELSE in the per-ring loop (simplifySegments/unmergedSegments, diagonalizeStaircaseRing,
// radialSmoothRing, insetPolygon, the bevel ribbon, the door-threshold flush quad, buildWallBox, the
// riser quad, mount slots) is completely UNCHANGED code, reused verbatim for oss mode too — this
// section's job is only to hand that unchanged code the SAME shape of input (a raw kind-tagged unit-
// edge ring) it already consumes, sourced from the kernel instead of chainEdgesIntoRings.

// unitStepClassifyRing(ring, allIndex, tier) -> {raw, diagnostics}. `ring`: a CLOSED-topology, OPEN
// (no repeated closing point), already-canonicalized polygon ring straight off PolygonKernel
// (unionCellRects' own output convention: outer CCW, hole CW, axis-aligned, unit-grid-cornered,
// collinear runs already merged into single long edges — proven empirically against this exact
// vendored kernel, see this unit's own report). Because the kernel merges collinear straight runs
// (a 3-cell corridor union comes back as ONE 4-vertex rectangle, not 3 unit squares' worth of raw
// edges), a ring edge here can span several world units — this function "un-collapses" each edge back
// into unit-length steps and classifies EACH step exactly the way traceTierContour does (same
// neighbor-lookup, same wall/door/riser rule), so a door cell sitting mid-run — or a riser boundary
// whose neighbor tier changes partway along an otherwise-straight run — still yields its own distinct
// raw edge, never silently merged away by the kernel's purely geometric union (the kernel has no
// concept of "door"/"tier" at all; that classification is strictly this adapter's own responsibility,
// per docs/GEOMETRY-OSS-INTEGRATION.md §9's "aperture ownership is preserved before collinear
// simplification"). Uses `segmentNormal` on each UNIT sub-edge (not the merged edge) — segmentNormal's
// own "interior on the left of CCW travel" convention holds for BOTH an outer ring (CCW) and a hole
// ring (CW) here, because Genesis's own outer-CCW/hole-CW convention is chosen precisely so "left of
// travel" always points toward the tier's own filled material on either ring kind (verified
// algebraically against a concrete hole fixture in this unit's own report — never assumed).
function unitStepClassifyRing(ring, allIndex, tier) {
  const raw = [];
  const diagnostics = [];
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const a = ring[i], b = ring[(i + 1) % n];
    const dx = b.x - a.x, dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (!(len > 1e-9)) continue; // degenerate edge (shouldn't survive kernel canonicalization) — skip, never crash
    const steps = Math.max(1, Math.round(len));
    const ux = dx / steps, uz = dz / steps;
    for (let s = 0; s < steps; s++) {
      const subA = { x: a.x + ux * s, z: a.z + uz * s };
      const subB = { x: a.x + ux * (s + 1), z: a.z + uz * (s + 1) };
      const midX = (subA.x + subB.x) / 2, midZ = (subA.z + subB.z) / 2;
      const nrm = segmentNormal({ a: subA, b: subB });
      const insideKey = cellKey(Math.round(midX + nrm.x * 0.5), Math.round(midZ + nrm.z * 0.5));
      const outsideKey = cellKey(Math.round(midX - nrm.x * 0.5), Math.round(midZ - nrm.z * 0.5));
      const insideCell = allIndex.get(insideKey);
      const outsideCell = allIndex.get(outsideKey);
      if (!outsideCell) {
        raw.push({ a: subA, b: subB, kind: (insideCell && insideCell.isDoor) ? "door" : "wall", tier });
      } else {
        const nTier = tierOf(outsideCell);
        if (nTier !== tier) {
          raw.push({ a: subA, b: subB, kind: "riser", loTier: Math.min(tier, nTier), hiTier: Math.max(tier, nTier) });
        } else {
          // defensive-only: a correctly-unioned single-tier boundary edge should never border another
          // cell of the SAME tier (that would be an interior edge, not a boundary one) — recorded as a
          // diagnostic rather than silently misclassified or thrown, per this module's own never-throw
          // discipline; treated as a wall (the conservative, always-solid choice) so geometry stays
          // watertight even if this branch is ever actually hit by a real fixture.
          diagnostics.push({
            level: "warn", typed: "unexpected-same-tier-boundary", tier,
            message: `tier ${tier} boundary edge at (${midX.toFixed(2)},${midZ.toFixed(2)}) borders another cell of the SAME tier — treated as wall`,
          });
          raw.push({ a: subA, b: subB, kind: "wall", tier });
        }
      }
    }
  }
  return { raw, diagnostics };
}

// deriveKernelRingsForTier(tierCells, allIndex, tier, kernelApi) -> {rings, diagnostics}. Replaces
// traceTierContour+chainEdgesIntoRings for oss mode: unions this tier's own cells via the kernel (the
// robust topology fix for F11/row-101), then re-derives a kind-tagged raw-edge ring (via
// unitStepClassifyRing, above) for the OUTER ring and EVERY hole of every resulting polygon — flattened
// into the exact same `Array<Array<edge>>` shape chainEdgesIntoRings already returns, so the entire
// existing `rings.forEach(...)` loop in compileRoomShellData (simplify/smooth/inset/bevel/wall/riser/
// mount-slot emission) runs UNCHANGED against either source.
function deriveKernelRingsForTier(tierCells, allIndex, tier, kernelApi) {
  const cellsXZ = tierCells.map((c) => ({ x: c.x, z: c.z }));
  const union = kernelApi.unionCellRects(cellsXZ);
  const diagnostics = (union.diagnostics.issues || []).map((issue) => Object.assign({ tier }, issue));
  const rings = [];
  union.polygons.forEach((poly) => {
    const outerC = unitStepClassifyRing(poly.outer, allIndex, tier);
    diagnostics.push(...outerC.diagnostics);
    if (outerC.raw.length) rings.push(outerC.raw);
    (poly.holes || []).forEach((hole) => {
      const holeC = unitStepClassifyRing(hole, allIndex, tier);
      diagnostics.push(...holeC.diagnostics);
      if (holeC.raw.length) rings.push(holeC.raw);
    });
  });
  return { rings, diagnostics, unionDiagnostics: union.diagnostics };
}

// validateRenderTransform(prePoly, postPoly, postSegments, opts) -> {valid, reasons}. §7.3's own
// validation gate for a render-only transform (diagonalizeStaircaseRing/radialSmoothRing) applied to a
// kernel-sourced ring, in oss mode ONLY (legacy mode never calls this — it always applies the transform
// unconditionally, unchanged). Checks: degenerate/zero-area result, winding inversion, declared
// area-drift tolerance, ring self-intersection/pinch (via the kernel's own validateSurface), AND §7.3's
// own named "a wall segment shorter than the minimum cap/miter requirement" case — a real, measured
// defect this check exists specifically to catch: diagonalizeStaircaseRing's own chamfer-miter can
// leave a very short residual segment immediately adjacent to a door boundary (measured live on the
// F08 fixture's own octagon+door: a 0.085-world-unit segment, well under 2x the default 0.06 bevel
// width), which downstream insetPolygon then collapses into a genuinely degenerate (repeated-vertex)
// bevel-ribbon quad — this is the actual root cause of the "F08 degenerate door-adjacent triangle"
// class this unit's own charter statement names, not the old ear-clip triangulator (the kernel's own
// triangulateSurface diagnostics confirm ZERO degenerate/reversed triangles in the MAIN FLOOR BODY on
// every affected fixture; see this unit's own report). A too-short segment fails this check and the
// caller falls back to the untransformed contour for the WHOLE ring, which removes the short residual
// (the untransformed grid-staircase boundary never produces a segment shorter than 1 world unit).
// SCOPED, documented gap: this checks ONE ring in isolation — it does not check hole-escape or
// hole/outer-contact (those need the ring's sibling holes/outer for context, not available at this
// per-ring call site). On any failure the caller keeps the PRE-transform (already kernel-topology-
// correct, still CCW-normalized) ring and records a diagnostic — "fall back to the untransformed
// normalized contour", per §7.3, never malformed geometry pushed downstream.
const DEFAULT_RENDER_TRANSFORM_AREA_TOLERANCE = 0.2; // 20% — generous by design; diagonalize/radial are SUPPOSED to move area (chamfer cuts corners, radial rounds them) — this catches a transform gone badly wrong, not ordinary smoothing.
function validateRenderTransform(prePoly, postPoly, postSegments, opts) {
  const tolerance = typeof (opts && opts.renderTransformAreaTolerance) === "number" ? opts.renderTransformAreaTolerance : DEFAULT_RENDER_TRANSFORM_AREA_TOLERANCE;
  const bevelWidth = typeof (opts && opts.bevelWidth) === "number" ? opts.bevelWidth : DEFAULT_BEVEL_WIDTH;
  const minSegmentLength = Math.max(1e-6, 2 * bevelWidth);
  const reasons = [];
  if (!postPoly || postPoly.length < 3) {
    reasons.push("degenerate-post-transform-ring");
    return { valid: false, reasons };
  }
  const preArea = Math.abs(signedArea2D(prePoly));
  const postArea = Math.abs(signedArea2D(postPoly));
  if (!(postArea > 1e-9)) reasons.push("zero-area-post-transform");
  else if (preArea > 1e-9 && Math.abs(postArea - preArea) / preArea > tolerance) reasons.push(`area-drift-exceeds-tolerance(${tolerance})`);
  if (signedArea2D(postPoly) < 0) reasons.push("winding-inversion");
  (postSegments || []).forEach((seg) => {
    if (seg.kind === "door") return; // a door's own aperture span is legitimately its own segment length, never chamfered
    if (segLen2D(seg) < minSegmentLength) reasons.push(`segment-shorter-than-cap-miter-minimum(${minSegmentLength})`);
  });
  const check = PolygonKernel.validateSurface({ outer: postPoly, holes: [] });
  if (!check.valid) reasons.push("kernel-validateSurface-invalid:" + JSON.stringify(check.issues));
  // MEASURED FINDING (this unit's own report, F08-octagon-diagonal-doorway): the exact bevel-inset
  // miter join (insetOffset/insetPolygon, unchanged shared code this unit does not redesign) can place
  // an inset vertex through a near-degenerate solve at a SHARP corner where an octagon chamfer's own
  // diagonal meets a door's own zero-width neighbor — producing a self-intersecting/near-coincident
  // inset ring that then feeds a genuinely degenerate bevel-ribbon or door-threshold quad downstream.
  // Since insetPolygon/insetOffset are NOT this unit's to redesign (§17.5's own "preserve the bevel/
  // inset... logic"), this validates their OUTPUT instead — the same self-intersection/degenerate-ring
  // check applied to postPoly above, applied here to the INSET polygon the wall/bevel/door-threshold
  // emission is about to consume, so a bad miter join falls back to the untransformed contour (whose
  // grid-staircase corners never produce this failure mode) rather than shipping a degenerate quad.
  if (reasons.length === 0) {
    const widthForSegment = (seg) => (seg.kind === "door" ? 0 : bevelWidth);
    const insetPreview = insetPolygon(postPoly, postSegments, widthForSegment);
    const insetCheck = PolygonKernel.validateSurface({ outer: insetPreview, holes: [] });
    if (!insetCheck.valid) reasons.push("inset-polygon-invalid:" + JSON.stringify(insetCheck.issues));
  }
  return { valid: reasons.length === 0, reasons };
}

// groupInsetsForKernelTriangulation(outers, holes) -> Array<{outer,holes}> — the oss-mode sibling of
// bridgePolygonWithHoles (above): assigns each hole's own (already bevel-inset) polygon to whichever
// outer inset polygon actually contains it, via the SAME polygonContainsPoint containment test
// bridgePolygonWithHoles already uses — but returns GROUPED polygons for triangulateSurface (which
// triangulates holes natively via Earcut) instead of hand-bridging a thin corridor into one simple
// polygon. A tier with zero outers (should never happen for a tier with real area) falls back to
// treating every ring as its own independent outer, mirroring bridgePolygonWithHoles's own fallback —
// never silently drops geometry.
function groupInsetsForKernelTriangulation(outers, holes) {
  if (!outers.length) return holes.map((h) => ({ outer: h, holes: [] }));
  const groups = outers.map((o) => ({ outer: o, holes: [] }));
  holes.forEach((hole) => {
    if (hole.length < 3) return;
    let targetIdx = 0;
    for (let i = 0; i < outers.length; i++) {
      if (polygonContainsPoint(outers[i], hole[0])) { targetIdx = i; break; }
    }
    groups[targetIdx].holes.push(hole);
  });
  return groups;
}

// ── parity-diagnostic helpers (oss-compare mode, §15's own semantic-invariant list: area; polygon/
// hole count; covered canonical cells; aperture intervals; wall boundary length; tier ownership;
// triangle validity; output bounds — "the compare mode must compare semantic invariants, not raw
// vertex order"). Pure, read-only over compileRoomShellData's own already-built plain-data bundle. ──

function floorAreaOfBundle(data) {
  let area = 0;
  const idx = data.floor.indices, pos = data.floor.positions;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    area += Math.abs((pos[b] - pos[a]) * (pos[c + 2] - pos[a + 2]) - (pos[c] - pos[a]) * (pos[b + 2] - pos[a + 2])) / 2;
  }
  return area;
}
function floorBoundsOfBundle(data) {
  let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
  const pos = data.floor.positions;
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], z = pos[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  return { minX, minZ, maxX, maxZ };
}
function triangleValidityOfBundle(data) {
  let degenerate = 0, nonFinite = 0;
  const idx = data.floor.indices, pos = data.floor.positions;
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    const ax = pos[a], az = pos[a + 2], bx = pos[b], bz = pos[b + 2], cx = pos[c], cz = pos[c + 2];
    if (![ax, az, bx, bz, cx, cz].every(Number.isFinite)) { nonFinite++; continue; }
    const area2 = Math.abs((bx - ax) * (cz - az) - (cx - ax) * (bz - az));
    if (!(area2 > 1e-9)) degenerate++;
  }
  return { triangleCount: idx.length / 3, degenerate, nonFinite };
}

// buildParityDiagnostics(legacyData, ossData, cells) -> a single structured per-room parity record
// (§15/§16's own capture-report shape informs the field names, though this is the pure-math record,
// not the render capture sidecar). `divergent` is a single roll-up boolean the caller can log/gate on;
// the sub-records are what let a human (or a future R4-style regression) see WHERE legacy and oss
// disagree — this is deliberately the row-101/F08/F11 SURFACE where a real divergence is expected and
// desired (oss correcting a legacy defect), not a bug in this diagnostic itself.
// UNIT G3 (§17.6, docs/STAGE-G3-WALL-RUNS.md's own "oss-compare parity diagnostics: legacy vs oss wall
// outer-corner gap... provenance match rate, unintended-join count") — summarizes the "wall-run-offset"
// typed entries computeOssWallOuterOffsets already pushes into ossDiagnosticsOut (present on `ossData.
// ossDiagnostics` for any non-"legacy" compile) into ONE aggregate record. `legacyFormulaGapAt90deg` is
// the deterministic, wallThickness-only constant the R1 bakeoff measured and dev/verify-wall-runs-oss.mjs
// independently reproduces (wallThickness*sqrt(2) — invariant across every room using this thickness;
// re-deriving it per-room from wallSegmentsOut would require reconstructing ring adjacency this bundle
// doesn't preserve, for no additional truth this closed-form doesn't already carry).
function wallCornerGapDiagnostics(ossData, wallThickness) {
  const entries = (ossData && Array.isArray(ossData.ossDiagnostics) ? ossData.ossDiagnostics : []).filter((d) => d.typed === "wall-run-offset");
  const totalSegments = entries.reduce((s, e) => s + (e.segmentCount || 0), 0);
  const matchedSegments = entries.reduce((s, e) => s + (e.matchedSegments || 0), 0);
  const degradedRuns = entries.filter((e) => e.degraded).length;
  const unintendedJoinCount = entries.reduce((s, e) => s + (e.joinGapCount || 0), 0);
  const maxJoinGap = entries.reduce((m, e) => Math.max(m, e.maxJoinGap || 0), 0);
  return {
    legacyFormulaGapAt90deg: wallThickness * Math.SQRT2,
    runsConsidered: entries.length,
    degradedRuns,
    provenanceMatchRate: totalSegments > 0 ? matchedSegments / totalSegments : null,
    unintendedJoinCount,
    ossMaxCornerGap: maxJoinGap,
    barMet: entries.length > 0 && degradedRuns === 0 && unintendedJoinCount === 0 && matchedSegments === totalSegments,
  };
}

function buildParityDiagnostics(legacyData, ossData, cells, wallThickness) {
  const legacyArea = floorAreaOfBundle(legacyData), ossArea = floorAreaOfBundle(ossData);
  const legacyTiers = (legacyData.floor.tiers || []).map((t) => t.tier).sort((a, b) => a - b);
  const ossTiers = (ossData.floor.tiers || []).map((t) => t.tier).sort((a, b) => a - b);
  const legacyCells = Object.keys(legacyData.cellTriangleMap || {}).sort();
  const ossCells = Object.keys(ossData.cellTriangleMap || {}).sort();
  const cellCoverageMatches = legacyCells.length === ossCells.length && legacyCells.every((k, i) => k === ossCells[i]);
  const legacyBounds = floorBoundsOfBundle(legacyData), ossBounds = floorBoundsOfBundle(ossData);
  const legacyTri = triangleValidityOfBundle(legacyData), ossTri = triangleValidityOfBundle(ossData);
  const segLen = (w) => Math.hypot(w.b.x - w.a.x, w.b.z - w.a.z);
  const legacyWallLen = (legacyData.walls.segments || []).reduce((s, w) => s + segLen(w), 0);
  const ossWallLen = (ossData.walls.segments || []).reduce((s, w) => s + segLen(w), 0);
  const legacyApertureCount = (legacyData.apertures || []).length;
  const ossApertureCount = (ossData.apertures || []).length;
  const areaDelta = ossArea - legacyArea;
  const tierOwnershipMatches = JSON.stringify(legacyTiers) === JSON.stringify(ossTiers);
  const apertureCountMatches = legacyApertureCount === ossApertureCount;
  const areaWithinTolerance = legacyArea <= 1e-9 || Math.abs(areaDelta) <= Math.max(1e-6, legacyArea * 0.05);
  return {
    roomCellCount: (cells || []).length,
    area: { legacy: legacyArea, oss: ossArea, delta: areaDelta, deltaPct: legacyArea > 1e-9 ? areaDelta / legacyArea : null },
    tierOwnership: { legacy: legacyTiers, oss: ossTiers, matches: tierOwnershipMatches },
    coveredCells: { legacy: legacyCells.length, oss: ossCells.length, matches: cellCoverageMatches },
    apertures: { legacy: legacyApertureCount, oss: ossApertureCount, matches: apertureCountMatches },
    wallBoundaryLength: { legacy: legacyWallLen, oss: ossWallLen, delta: ossWallLen - legacyWallLen },
    triangleValidity: { legacy: legacyTri, oss: ossTri },
    bounds: { legacy: legacyBounds, oss: ossBounds },
    wallCornerGap: wallCornerGapDiagnostics(ossData, typeof wallThickness === "number" ? wallThickness : DEFAULT_WALL_THICKNESS),
    divergent: !cellCoverageMatches || !tierOwnershipMatches || !apertureCountMatches || !areaWithinTolerance || ossTri.degenerate > 0 || ossTri.nonFinite > 0,
  };
}

// ── UNIT G3 (docs/GEOMETRY-OSS-INTEGRATION.md §8, §17.6, docs/STAGE-G3-WALL-RUNS.md) — the oss wall-run
// outer-offset path. INERT in "legacy"/"oss-compare"'s own rendered branch — only called from the
// kernelMode==="oss" branch of the per-ring wall loop, below. Splits a ring's own final `segments` array
// (already simplified/diagonalized/radial-smoothed — whatever "final" means for THIS ring, exactly the
// same array the legacy per-segment offset already consumes) into maximal contiguous 'wall'-kind runs,
// offsets each run ONCE through PolygonKernel.wallOffset (a true run-wide Clipper2 miter, §8's "every
// interior corner within that run receives a true joined miter"), and returns a per-segment-index map of
// {outerA,outerB,capOutA,capOutB,footOutA,footOutB} for buildWallBox to consume VERBATIM (§8's "build the
// stem, upper, cap, footing, and trim from the SAME run contour" — capOutA/footOutA etc. are derived by
// scaling the ALREADY-mitered outerA vector from its own inner vertex by (thickness+capOverhang)/
// thickness or (thickness+wallFooting)/thickness respectively; at an interior run corner this keeps the
// cap/footing lip on the SAME bisector ray the stem's own miter already resolved, so they land on one
// shared point too instead of re-introducing the corner-gap defect one dimension further out. At a run
// ENDPOINT (jamb, no corner), the "miter vector" is just the plain perpendicular offset, so scaling it
// this way reduces to the ordinary butt-jamb cap/footing extension — no special-case needed).
// A door/riser/open edge is a hard break between runs (never bridged, §9's own aperture law); a ring
// with NO non-wall segment at all (fully solid, no aperture anywhere) is offset as ONE CLOSED run
// (PolygonKernel.wallOffset's own `closed:true` mode — the wraparound corner needs a real miter too,
// and there is no aperture on this ring to make that ambiguous the way a whole-ring offset would be on
// an aperture-bearing ring, docs/GEOMETRY-OSS-INTEGRATION.md §17.6's own note on Strategy A's door-
// adjacency failure).
function computeOssWallOuterOffsets(segments, wallThickness, wallCapOverhang, wallFooting, kernelApi) {
  const n = segments.length;
  const outByIndex = new Array(n).fill(null);
  const diagnostics = [];
  // UNIT G3 ACUTE-BEVEL — `bevels`: {segA,segB} pairs (GLOBAL `segments` indices) for every interior
  // join PolygonKernel classified `bevel` rather than `miter` (a genuine Clipper2 miter-limit bevel edge,
  // docs/STAGE-G3-WALL-RUNS.md's own "bevel for acute/unstable corners" branch) — segA's own outByIndex
  // .outerB and segB's own outByIndex.outerA are the bevel edge's two DISTINCT endpoints; the caller
  // (compileRoomShellData's oss wall-run path) bridges the resulting notch with one small extra wall box
  // per band via buildBevelBridgeParams. Always empty outside oss mode / on every ordinary-corner run.
  const bevels = [];
  if (!n) return { outByIndex, diagnostics, bevels };
  const capRatio = wallThickness > 0 ? (wallThickness + wallCapOverhang) / wallThickness : 1;
  // A cap projects on BOTH sides of the wall. The original G3 path joined only the outer lip; the
  // inner lip still used buildWallBox's legacy per-segment normal offset, leaving a triangular hole
  // in the cap top while the harness reported "cap continuity" from capOut alone. Reflect the joined
  // outer-miter vector through the source corner to derive the matching joined inner lip.
  const capInRatio = wallThickness > 0 ? -wallCapOverhang / wallThickness : 0;
  const footRatio = wallThickness > 0 ? (wallThickness + wallFooting) / wallThickness : 1;
  // trimProud matches the wall branch's own `wallCapOverhang * 0.5` formula exactly (kept in sync here
  // rather than threaded as a 5th parameter, since it's a fixed derivation of capOverhang, not an
  // independent knob any caller has ever varied).
  const trimRatio = wallThickness > 0 ? (wallThickness + wallCapOverhang * 0.5) / wallThickness : 1;

  function applyRun(runIndices, edges, corners, runDiag, runLabel) {
    runIndices.forEach((segIdx, k) => {
      const seg = segments[segIdx];
      const { outerA, outerB } = edges[k];
      const innerA = seg.a, innerB = seg.b;
      const vecA = { x: outerA.x - innerA.x, z: outerA.z - innerA.z };
      const vecB = { x: outerB.x - innerB.x, z: outerB.z - innerB.z };
      outByIndex[segIdx] = {
        outerA, outerB,
        capInA: { x: innerA.x + vecA.x * capInRatio, z: innerA.z + vecA.z * capInRatio },
        capInB: { x: innerB.x + vecB.x * capInRatio, z: innerB.z + vecB.z * capInRatio },
        capOutA: { x: innerA.x + vecA.x * capRatio, z: innerA.z + vecA.z * capRatio },
        capOutB: { x: innerB.x + vecB.x * capRatio, z: innerB.z + vecB.z * capRatio },
        footOutA: { x: innerA.x + vecA.x * footRatio, z: innerA.z + vecA.z * footRatio },
        footOutB: { x: innerB.x + vecB.x * footRatio, z: innerB.z + vecB.z * footRatio },
        trimOutA: { x: innerA.x + vecA.x * trimRatio, z: innerA.z + vecA.z * trimRatio },
        trimOutB: { x: innerB.x + vecB.x * trimRatio, z: innerB.z + vecB.z * trimRatio },
      };
    });
    (corners || []).forEach((c) => {
      if (c.type !== "bevel") return;
      bevels.push({ segA: runIndices[c.at], segB: runIndices[(c.at + 1) % runIndices.length] });
    });
    diagnostics.push({
      level: runDiag.degraded ? "warn" : "info", typed: "wall-run-offset", run: runLabel,
      segmentCount: runIndices.length, matchedSegments: runDiag.matchedSegments,
      joinGapCount: runDiag.joinGapCount, maxJoinGap: runDiag.maxJoinGap,
      degraded: runDiag.degraded, reason: runDiag.reason,
      bevelCount: runDiag.bevelCount || 0, maxBevelGap: runDiag.maxBevelGap || 0,
    });
  }

  const hasNonWall = segments.some((s) => s.kind !== "wall");
  if (!hasNonWall) {
    const points = segments.map((s) => ({ x: s.a.x, z: s.a.z }));
    const result = kernelApi.wallOffset({ points, closed: true }, { thickness: wallThickness });
    if (result.edges && result.edges.length === n) applyRun(segments.map((_, i) => i), result.edges, result.corners, result.diagnostics, "closed-ring");
    else diagnostics.push({ level: "warn", typed: "wall-run-offset", run: "closed-ring", segmentCount: n, matchedSegments: 0, joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: "closed-ring offsetRuns returned an unusable edge count" });
    return { outByIndex, diagnostics, bevels };
  }

  const firstBreak = segments.findIndex((s) => s.kind !== "wall");
  const order = [];
  for (let k = 0; k < n; k++) order.push((firstBreak + 1 + k) % n);
  let currentRun = [];
  const flushRun = () => {
    if (!currentRun.length) return;
    const first = segments[currentRun[0]];
    const points = [{ x: first.a.x, z: first.a.z }];
    currentRun.forEach((idx) => points.push({ x: segments[idx].b.x, z: segments[idx].b.z }));
    const result = kernelApi.wallOffset({ points }, { thickness: wallThickness });
    if (result.edges && result.edges.length === currentRun.length) {
      applyRun(currentRun.slice(), result.edges, result.corners, result.diagnostics, `open-run@${currentRun[0]}`);
    } else {
      diagnostics.push({ level: "warn", typed: "wall-run-offset", run: `open-run@${currentRun[0]}`, segmentCount: currentRun.length, matchedSegments: 0, joinGapCount: 0, maxJoinGap: 0, degraded: true, reason: "open-run offsetRuns returned an unusable edge count" });
    }
    currentRun = [];
  };
  order.forEach((idx) => {
    if (segments[idx].kind === "wall") currentRun.push(idx);
    else flushRun();
  });
  flushRun();
  return { outByIndex, diagnostics, bevels };
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

  // UNIT G2 (§15) — the migration switch. Resolves to "legacy" for anything except the two literal
  // opt-in strings, so a caller that omits the option (every existing production call site and every
  // pre-G2 test) takes EXACTLY the pre-G2 code path below — no new branch is ever entered, and the
  // returned bundle carries no new keys (see the `if (kernelMode !== "legacy")` guards at the very end
  // of this function). This is what makes "the DEFAULT render stays byte-identical" a property of the
  // code, not just a promise: every single new branch this unit adds is gated on `kernelMode === "oss"`
  // (or the oss-compare block below), never on absence-of-guard.
  const kernelMode = (opts.roomShellPolygonKernel === "oss" || opts.roomShellPolygonKernel === "oss-compare")
    ? opts.roomShellPolygonKernel
    : (opts.roomShellPolygonKernel === "legacy" ? "legacy" : ROOM_SHELL_POLYGON_KERNEL);

  // "oss-compare": render legacy (the real returned geometry — §15's own "render legacy, compute
  // both"), but ALSO run the oss path purely for its diagnostic value, and attach the resulting
  // parity record to the (otherwise byte-identical-to-legacy) returned bundle as `.parityDiagnostics`.
  // Two full compiles per call — acceptable: this mode is a migration/stabilization-window diagnostic,
  // never the render-critical path (that's plain "legacy" today, "oss" only after an explicit later
  // promotion this unit does not perform). If the oss path itself throws, that failure is captured as
  // a diagnostic rather than breaking the (legacy, always-correct) render this mode promises.
  if (kernelMode === "oss-compare") {
    const legacyResult = compileRoomShellData(cells, Object.assign({}, opts, { roomShellPolygonKernel: "legacy" }));
    let ossResult = null, ossThrew = null;
    try {
      ossResult = compileRoomShellData(cells, Object.assign({}, opts, { roomShellPolygonKernel: "oss" }));
    } catch (e) {
      ossThrew = String((e && e.stack) || e);
    }
    const wallThicknessForDiag = typeof opts.wallThickness === "number" ? opts.wallThickness : DEFAULT_WALL_THICKNESS;
    legacyResult.parityDiagnostics = ossResult
      ? buildParityDiagnostics(legacyResult, ossResult, cells, wallThicknessForDiag)
      : { error: "oss path threw during oss-compare", detail: ossThrew };
    legacyResult.ossDiagnostics = ossResult ? (ossResult.ossDiagnostics || []) : [];
    return legacyResult;
  }

  const bevelWidth = typeof opts.bevelWidth === "number" ? opts.bevelWidth : DEFAULT_BEVEL_WIDTH;
  const bevelDrop = typeof opts.bevelDrop === "number" ? opts.bevelDrop : DEFAULT_BEVEL_DROP;
  const uvDensity = typeof opts.uvDensity === "number" ? opts.uvDensity : DEFAULT_UV_DENSITY;
  const wallHeight = typeof opts.wallHeight === "number" ? opts.wallHeight : DEFAULT_WALL_HEIGHT;
  const wallHeightForSegment = typeof opts.wallHeightForSegment === "function"
    ? opts.wallHeightForSegment : function () { return wallHeight; };
  // C4.1a — wall VOLUME dimensions (all overridable; defaults per docs/WALL-VOLUMES-PRACTICALS.md's own
  // "suggested initial dimensions at 1 world unit = 5ft" table). `upperVisibleForSegment` REPLACES
  // wallHeightForSegment's old role as the parapet-cut mechanism: it's a plain BOOLEAN (show/hide the
  // upper band), not a height fraction, so a "cut" near wall renders a full-thickness capped STEM
  // instead of a squashed thin quad — wallHeightForSegment itself stays available for genuine
  // structural height variance (a licensed low/ruined wall roll), never camera-driven cuts.
  const wallThickness = typeof opts.wallThickness === "number" ? opts.wallThickness : DEFAULT_WALL_THICKNESS;
  const wallStemHeight = typeof opts.wallStemHeight === "number" ? opts.wallStemHeight : DEFAULT_WALL_STEM_HEIGHT;
  const wallCapHeight = typeof opts.wallCapHeight === "number" ? opts.wallCapHeight : DEFAULT_WALL_CAP_HEIGHT;
  const wallCapOverhang = typeof opts.wallCapOverhang === "number" ? opts.wallCapOverhang : DEFAULT_WALL_CAP_OVERHANG;
  const wallFooting = typeof opts.wallFooting === "number" ? opts.wallFooting : DEFAULT_WALL_FOOTING;
  const doorOpeningWidth = typeof opts.doorOpeningWidth === "number"
    ? opts.doorOpeningWidth : DEFAULT_DOOR_OPENING_WIDTH;
  const doorOpeningHeight = typeof opts.doorOpeningHeight === "number"
    ? opts.doorOpeningHeight : DEFAULT_DOOR_OPENING_HEIGHT;
  const wallTrimOn = typeof opts.wallTrim === "boolean" ? opts.wallTrim : true;
  const upperVisibleForSegment = typeof opts.upperVisibleForSegment === "function"
    ? opts.upperVisibleForSegment : function () { return true; };
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

  // C4.1a: `wallBuf`/`wallSegmentsOut` is now the DEPRECATED legacy `.walls` bundle — kept populated
  // (stem INNER FACE ONLY, see the wall branch below) purely so a pre-C4.1a reader of `.walls` doesn't
  // hard-break; new code should read `wallStem`/`wallUpper`/`wallTrim` below instead. `wallSegmentsOut`
  // itself (the a/b/tier/height METADATA list, not geometry) is unchanged and still shared as the
  // `ownerSegIndex` cross-reference every new bundle below keys off.
  const wallBuf = makeBuffer();
  const wallSegmentsOut = [];
  const wallStemBuf = makeBuffer();
  const wallStemSegmentsOut = [];
  const wallUpperBuf = makeBuffer();
  const wallUpperSegmentsOut = [];
  const wallTrimBuf = wallTrimOn ? makeBuffer() : null;
  const wallTrimSegmentsOut = wallTrimOn ? [] : null;
  const mountSlotsOut = [];
  const riserBuf = makeBuffer();
  const riserSegmentsOut = [];
  const aperturesOut = [];
  // UNIT G2: oss-mode-only diagnostics accumulator (§7.2/§7.3 fallback records, kernel union issues).
  // Stays an empty array and is NEVER attached to the returned bundle in "legacy" mode — see the
  // `if (kernelMode !== "legacy")` guard at this function's own return statement, below.
  const ossDiagnosticsOut = [];

  tiers.forEach((tier) => {
    const tierCells = byTier.get(tier);
    const elevationY = tierHeights[tier];
    // UNIT G2 (§15, §17.5): ring TOPOLOGY source. "legacy" keeps the original raw-edge walk
    // (traceTierContour -> chainEdgesIntoRings), byte-identical. "oss" replaces it with the
    // PolygonKernel union (deriveKernelRingsForTier, above) — the fix for F11's diagonal-vertex-pinch
    // undercount and row-101's (F18) annular hole/ring topology. Either way, `rings` ends up the exact
    // same shape (Array<Array<{a,b,kind,tier|loTier,hiTier}>>) the rest of this per-tier block already
    // consumes — every line below this is unaware of which source produced it.
    let rings;
    if (kernelMode === "oss") {
      const derived = deriveKernelRingsForTier(tierCells, allIndex, tier, PolygonKernel);
      rings = derived.rings;
      if (derived.diagnostics.length) ossDiagnosticsOut.push(...derived.diagnostics);
    } else {
      const rawEdges = traceTierContour(tierCells, allIndex, tier);
      rings = chainEdgesIntoRings(rawEdges);
    }
    const triStart = floorBuf.indices.length / 3;
    const complexTier = rings.length > 1;
    // C4.1c PART 2 — a complex (multi-ring) tier tagged with a real smoothMode (diagonal/radial)
    // triangulates its floor from the SAME mitered/rounded ring contours the walls use (hole-bridged
    // polygon-with-holes, below) instead of the old buildFloorCells per-cell stairstep fallback.
    // Decisions: "retire buildFloorCells for smoothMode diagonal/radial only... rect default keeps
    // it" — an untagged/'rect'/'cave' complex tier (smoothMode === null, e.g. today's BW2-5 finale
    // dais ring) stays on buildFloorCells, byte-identical to before this unit.
    const hollowFloorMode = complexTier && smoothMode !== null;
    // UNIT G2: "oss" mode ALWAYS triangulates the floor body through the kernel at tier-end (below,
    // replacing triangulatePolygon/bridgeHoleIntoOuter AND buildFloorCells uniformly — §17.5's own
    // "replace floor triangulation with Earcut in oss mode"), so it never takes the legacy
    // buildFloorCells branch here. "legacy" mode is completely unchanged (byte-identical guard).
    if (kernelMode !== "oss" && complexTier && !hollowFloorMode) buildFloorCells(floorBuf, tierCells, elevationY, uvDensity, floorColorAt);
    // floorDetailOn: the bevel ribbon + door-threshold flush quad (both per-segment perimeter strips
    // that attach to whatever floor body this tier ends up with) run whenever the floor actually gets
    // a real mitered/rounded body — every simple tier (always did) PLUS a complex tier now that
    // hollowFloorMode gives it one too. Stays OFF for the untagged complex-tier/buildFloorCells path
    // (byte-identical to before this unit). "oss" mode always gets a real mitered/rounded body (kernel
    // triangulation, tier-end, below), so it's unconditionally on.
    const floorDetailOn = kernelMode === "oss" ? true : (!complexTier || hollowFloorMode);
    // ringFloorParts: each ring's own final (mitered/rounded, bevel-inset) polygon + its NATURAL
    // pre-ensureCCW winding sign (outer vs hole classification, below) — the floor body itself is
    // built ONCE for the whole tier, after every ring's own wall/riser/bevel/door geometry has already
    // been emitted by the loop below. Legacy mode collects only in hollowFloorMode (unchanged); "oss"
    // mode collects unconditionally (every ring, always — §17.5's own uniform kernel-triangulation path).
    const ringFloorParts = [];

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
      // C4.1c PART 2: capture this ring's own NATURAL winding (its raw signed area BEFORE ensureCCW
      // forces it positive) — the deterministic signal, fixed by traceTierContour/edgeVertsFor's own
      // directed-edge construction (not an artifact of which raw edge the tracer happened to start
      // from — rotation never reverses a chain), that tells a tier's TRUE outer boundary (natural
      // CCW/positive raw area) apart from an inner hole boundary (natural CW/negative raw area, e.g.
      // the riser ring facing a sunken arena carved out of a raised tier's own middle).
      const ringRawArea = signedArea2D(poly);
      const fixed = ensureCCW(poly, segments);
      poly = fixed.poly; segments = fixed.segments;
      if (smoothMode === "radial") {
        // render-only: pulls THIS ring's own vertices toward the ellipse fitted to its own bbox,
        // door-adjacent vertices pinned — see radialSmoothRing's own header. Never touches `cells`/
        // `tierCells`/`allIndex` (the logical grid this ring was traced from), only the local poly/
        // segments arrays about to feed the floor triangulation + wall/riser quads below.
        const smoothed = radialSmoothRing(poly, segments, radialSmoothBlend);
        // UNIT G2 (§7.3): oss mode validates the transform result before accepting it — legacy mode
        // is completely unchanged (unconditional accept, exactly as before this unit).
        if (kernelMode === "oss") {
          const v = validateRenderTransform(poly, smoothed.poly, smoothed.segments, opts);
          if (v.valid) { poly = smoothed.poly; segments = smoothed.segments; }
          else ossDiagnosticsOut.push({ level: "warn", typed: "render-transform-fallback", tier, transformKind: "radial-smooth", reasons: v.reasons });
        } else {
          poly = smoothed.poly; segments = smoothed.segments;
        }
      } else if (smoothMode === "diagonal") {
        // render-only: chamfers only the REAL multi-cell staircase runs this ring's own boundary
        // contains into a flat diagonal face — see diagonalizeStaircaseRing's own header. Same "never
        // touches the logical cell set" guarantee as the radial path.
        const diagonalized = diagonalizeStaircaseRing(poly, segments);
        if (kernelMode === "oss") {
          const v = validateRenderTransform(poly, diagonalized.poly, diagonalized.segments, opts);
          if (v.valid) { poly = diagonalized.poly; segments = diagonalized.segments; }
          else ossDiagnosticsOut.push({ level: "warn", typed: "render-transform-fallback", tier, transformKind: "diagonalize", reasons: v.reasons });
        } else {
          poly = diagonalized.poly; segments = diagonalized.segments;
        }
      }
      if (poly.length < 3) return;

      // UNIT G3 (§17.6, docs/STAGE-G3-WALL-RUNS.md) — the oss wall-run outer offset. Computed against
      // THIS ring's own FINAL `segments` (post simplify/diagonalize/radial-smooth, identical to what the
      // legacy per-segment offset below already consumes) — so it inherits every existing shape
      // transform automatically instead of duplicating that logic. Inert (empty map, zero cost beyond an
      // array alloc) outside "oss" mode.
      let ossWallOuterByIndex = null;
      let ossWallBevels = [];
      if (kernelMode === "oss") {
        const wallRunResult = computeOssWallOuterOffsets(segments, wallThickness, wallCapOverhang, wallFooting, PolygonKernel);
        ossWallOuterByIndex = wallRunResult.outByIndex;
        ossWallBevels = wallRunResult.bevels || [];
        if (wallRunResult.diagnostics.length) ossDiagnosticsOut.push(...wallRunResult.diagnostics);
      }

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
      if (kernelMode === "oss" || hollowFloorMode) {
        // C4.1c PART 2 / UNIT G2: don't triangulate THIS ring's own inset alone (an inner hole ring
        // has no floor of its own — it's a hole cut OUT of the tier) — collect it, the whole tier's
        // floor gets built ONCE after every ring here has contributed its own inset + winding sign
        // (below). "oss" mode always collects (kernel triangulation is uniform, §17.5); legacy mode
        // collects only in hollowFloorMode (unchanged).
        ringFloorParts.push({ inset, rawArea: ringRawArea });
      } else {
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
      }

      // U for wall/riser/bevel vertical surfaces: one continuous arc-length walk around THIS ring
      // (directive step 8's vertical-surface case).
      const arcU = ringPerimeterU(segments);

      segments.forEach((seg, i) => {
        const n = segmentNormal(seg);
        const { u0, u1 } = arcU[i];
        const insetA = inset[i], insetB = inset[(i + 1) % inset.length];

        if (seg.kind === "door") {
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
          if (floorDetailOn) {
            pushQuad(floorBuf, trueA, flushInnerA, flushInnerB, trueB, { x: 0, y: 1, z: 0 },
              { u: trueA.x * uvDensity, v: trueA.z * uvDensity }, { u: flushInnerA.x * uvDensity, v: flushInnerA.z * uvDensity },
              { u: flushInnerB.x * uvDensity, v: flushInnerB.z * uvDensity }, { u: trueB.x * uvDensity, v: trueB.z * uvDensity },
              floorColorAt ? hexToRgb01(nearestFloorColor(seg)) : null);
          }

          // THE DOOR / DOOR-FRAME SPLIT (Adam, 2026-07-23): a doorway is a rectangular SOCKET in
          // this wall segment's own continuous body. It therefore inherits the wall's inner plane,
          // outer plane, thickness, top and material. The independently-rendered hinged leaf consumes
          // the opening; there is no separate proud "doorway object" on the compiled-shell path.
          //
          // No CSG is required for today's one-cell boundary aperture: split this one volume into two
          // narrow wall bands beside the opening plus the wall band above it. These are subdivisions
          // of ONE owner segment (one wallSegmentsOut row / one upper visibility handle), not three
          // renderer instances. Their hole-facing end faces and the lintel underside are the reveal
          // surfaces of the wall thickness itself.
          const segMeta = {
            a: seg.a, b: seg.b,
            mid: { x: (seg.a.x + seg.b.x) / 2, z: (seg.a.z + seg.b.z) / 2 },
            kind: "doorway", tier,
          };
          const h = wallHeightForSegment(segMeta);
          const baseY = elevationY - (floorDetailOn ? bevelDrop : 0);
          const wallColor = wallColorForSegment ? hexToRgb01(wallColorForSegment(segMeta)) : null;
          const tangent = directionOf(seg);
          const segLength = Math.max(1e-9, Math.hypot(seg.b.x - seg.a.x, seg.b.z - seg.a.z));
          const clearW = Math.max(0.05, Math.min(doorOpeningWidth, segLength - 0.04));
          const clearH = Math.max(0.05, Math.min(doorOpeningHeight, (baseY + h) - elevationY - 0.02));
          const sideLen = (segLength - clearW) / 2;
          const openingStartT = sideLen / segLength;
          const openingEndT = 1 - openingStartT;
          const pointAt = (t) => ({
            x: seg.a.x + (seg.b.x - seg.a.x) * t,
            z: seg.a.z + (seg.b.z - seg.a.z) * t,
          });
          const innerA = pointAt(0), openingInnerA = pointAt(openingStartT);
          const openingInnerB = pointAt(openingEndT), innerB = pointAt(1);
          const outward = (p) => ({ x: p.x - n.x * wallThickness, z: p.z - n.z * wallThickness });
          const outerA = outward(innerA), openingOuterA = outward(openingInnerA);
          const openingOuterB = outward(openingInnerB), outerB = outward(innerB);
          const openingU0 = u0 + (u1 - u0) * openingStartT;
          const openingU1 = u0 + (u1 - u0) * openingEndT;
          const openingBottomY = elevationY;
          const openingTopY = openingBottomY + clearH;

          const ownerSegIndex = wallSegmentsOut.length;
          wallSegmentsOut.push({
            a: seg.a, b: seg.b, tier, height: h, kind: "doorway",
            opening: {
              width: clearW, height: clearH,
              bottomY: openingBottomY, topY: openingTopY,
            },
          });
          aperturesOut.push({
            a: seg.a, b: seg.b, tier, ownerSegIndex,
            openingWidth: clearW, openingHeight: clearH,
            openingBottomY, openingTopY,
          });

          const prismBase = {
            n, tX: tangent.dx, tZ: tangent.dz,
            color: wallColor, uvDensity,
          };
          const buildLeft = (buf, yBase, yTop, closure) => buildWallPrismFaces(buf, Object.assign({}, prismBase, {
            innerA, innerB: openingInnerA, outerA, outerB: openingOuterA,
            yBase, yTop, u0, u1: openingU0,
          }, closure));
          const buildRight = (buf, yBase, yTop, closure) => buildWallPrismFaces(buf, Object.assign({}, prismBase, {
            innerA: openingInnerB, innerB, outerA: openingOuterB, outerB,
            yBase, yTop, u0: openingU1, u1,
          }, closure));

          // Persistent lower wall body: only the two jamb-side bands exist. Nothing crosses the
          // rectangular opening at floor/stem height. These are clean prisms with one plain closure
          // face each — no footing or cap overhangs protruding into/from the aperture.
          const stemBaseY = baseY, stemTopY = baseY + wallStemHeight;
          buildLeft(wallStemBuf, stemBaseY, stemTopY, { closeTop: true, closeA: true, closeB: true });
          buildRight(wallStemBuf, stemBaseY, stemTopY, { closeTop: true, closeA: true, closeB: true });
          wallStemSegmentsOut.push({ ownerSegIndex, tier });
          pushWallVerticalFace(wallBuf,
            { x: innerA.x, y: stemBaseY, z: innerA.z }, { x: openingInnerA.x, y: stemBaseY, z: openingInnerA.z },
            { x: innerA.x, y: stemTopY, z: innerA.z }, { x: openingInnerA.x, y: stemTopY, z: openingInnerA.z },
            { x: n.x, y: 0, z: n.z }, u0, openingU0, 0, wallStemHeight, wallColor);
          pushWallVerticalFace(wallBuf,
            { x: openingInnerB.x, y: stemBaseY, z: openingInnerB.z }, { x: innerB.x, y: stemBaseY, z: innerB.z },
            { x: openingInnerB.x, y: stemTopY, z: openingInnerB.z }, { x: innerB.x, y: stemTopY, z: innerB.z },
            { x: n.x, y: 0, z: n.z }, openingU1, u1, 0, wallStemHeight, wallColor);

          // Independently suppressible upper: both side bands continue to wall-top and the lintel is
          // the SAME wall volume above the clear opening. One slice contains all three subdivisions.
          const upperVisible = upperVisibleForSegment(segMeta);
          const upperHeight = Math.max(0, h - wallStemHeight);
          if (upperVisible && upperHeight > 1e-9) {
            const vertStart = wallUpperBuf.positions.length / 3, idxStart = wallUpperBuf.indices.length;
            // Only the segment's two OUTER ends close here. Hole-facing jamb reveals stop exactly at
            // openingTopY; they do not continue as hidden/coplanar faces inside the lintel solid.
            buildLeft(wallUpperBuf, stemTopY, baseY + h, { closeA: true });
            buildRight(wallUpperBuf, stemTopY, baseY + h, { closeB: true });
            const revealTopY = Math.min(openingTopY, baseY + h);
            if (revealTopY > stemTopY + 1e-9) {
              pushWallVerticalFace(wallUpperBuf, // left jamb reveal, faces into the opening
                { x: openingInnerA.x, y: stemTopY, z: openingInnerA.z },
                { x: openingOuterA.x, y: stemTopY, z: openingOuterA.z },
                { x: openingInnerA.x, y: revealTopY, z: openingInnerA.z },
                { x: openingOuterA.x, y: revealTopY, z: openingOuterA.z },
                { x: tangent.dx, y: 0, z: tangent.dz }, 0, 1, 0, revealTopY - stemTopY, wallColor);
              pushWallVerticalFace(wallUpperBuf, // right jamb reveal
                { x: openingOuterB.x, y: stemTopY, z: openingOuterB.z },
                { x: openingInnerB.x, y: stemTopY, z: openingInnerB.z },
                { x: openingOuterB.x, y: revealTopY, z: openingOuterB.z },
                { x: openingInnerB.x, y: revealTopY, z: openingInnerB.z },
                { x: -tangent.dx, y: 0, z: -tangent.dz }, 0, 1, 0, revealTopY - stemTopY, wallColor);
            }
            if (openingTopY < baseY + h - 1e-9) {
              buildWallPrismFaces(wallUpperBuf, Object.assign({}, prismBase, {
                innerA: openingInnerA, innerB: openingInnerB,
                outerA: openingOuterA, outerB: openingOuterB,
                yBase: openingTopY, yTop: baseY + h, closeBottom: true,
                u0: openingU0, u1: openingU1,
              }));
            }
            // ONE continuous wall cap for the owner segment. The previous implementation called
            // buildWallBox three times (left/right/lintel), creating overlapping cap slabs and
            // internal end faces — the live "fragments shooting out the back / bits in the door."
            buildWallTopCap(wallUpperBuf, {
              innerA, innerB, outerA, outerB, n, yTop: baseY + h,
              capHeight: wallCapHeight, capOverhang: wallCapOverhang,
              color: wallColor, u0, u1, uvDensity,
            });
            const vertCount = wallUpperBuf.positions.length / 3 - vertStart;
            const idxCount = wallUpperBuf.indices.length - idxStart;
            wallUpperSegmentsOut.push({ ownerSegIndex, tier, vertStart, vertCount, idxStart, idxCount });
          }

          // No applied trim on the doorway owner. Adjacent wall courses terminate at the opening;
          // adding independent doorway trim is exactly how a wall socket turns back into a frame.
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
        if (floorDetailOn) {
          pushQuad(floorBuf, outerA, innerA, innerB, outerB, { x: 0, y: 1, z: 0 },
            { u: outerA.x * uvDensity, v: outerA.z * uvDensity }, { u: innerA.x * uvDensity, v: innerA.z * uvDensity },
            { u: innerB.x * uvDensity, v: innerB.z * uvDensity }, { u: outerB.x * uvDensity, v: outerB.z * uvDensity },
            floorColorAt ? hexToRgb01(nearestFloorColor(seg)) : null);
          bevelTriCount += 2;
        }

        if (seg.kind === "wall") {
          // C4.1a — WALL VOLUME (docs/WALL-VOLUMES-PRACTICALS.md Unit C4.1a): a heavy architectural
          // volume (capped stem + independently-hideable upper + optional trim + inner-face mount
          // slots), not a single two-triangle plane. `h` stays wallHeightForSegment's own result — a
          // legitimate STRUCTURAL full height (a licensed low/ruined wall roll), never a camera-driven
          // cut; the camera-relative near/far show-or-hide now flows through `upperVisibleForSegment`
          // (a boolean predicate) instead of squashing this number.
          const segMeta = { a: seg.a, b: seg.b, mid: { x: (seg.a.x + seg.b.x) / 2, z: (seg.a.z + seg.b.z) / 2 }, kind: "wall", tier };
          const h = wallHeightForSegment(segMeta);
          // C4.1c: the wall's own base sits BELOW elevationY by bevelDrop whenever a real bevel
          // ribbon exists to meet it (floorDetailOn — every simple tier, PLUS a hollow-floor complex
          // tier now that it gets a real bevel too), else flush with the flat buildFloorCells top
          // (the untagged complex-tier path, unchanged).
          const baseY = elevationY - (floorDetailOn ? bevelDrop : 0);
          const wallColor = wallColorForSegment ? hexToRgb01(wallColorForSegment(segMeta)) : null;
          const tangent = directionOf(seg);
          const innerA = { x: seg.a.x, z: seg.a.z };
          const innerB = { x: seg.b.x, z: seg.b.z };
          // outer face = inner face extruded AWAY from the room interior (opposite the inward normal
          // `n`) — grows the wall's own thickness into the "solid rock" beyond the boundary rather than
          // eating into the licensed floor footprint; mount slots (below) stay on the INNER face, so
          // this choice never moves a fixture's own anchor point.
          // UNIT G3: "oss" mode substitutes the run-mitered outer/cap/footing points computed above
          // (ossWallOuterByIndex[i]) whenever this segment landed a clean run offset; a segment that
          // degraded (see computeOssWallOuterOffsets' own diagnostics) falls through to the SAME plain
          // per-segment formula legacy always used — never a hole, never thrown geometry. "legacy" mode
          // never enters this branch (ossWallOuterByIndex is null), so it is BYTE IDENTICAL to before
          // this unit.
          const ossOuter = ossWallOuterByIndex ? ossWallOuterByIndex[i] : null;
          const outerA = ossOuter ? ossOuter.outerA : { x: innerA.x - n.x * wallThickness, z: innerA.z - n.z * wallThickness };
          const outerB = ossOuter ? ossOuter.outerB : { x: innerB.x - n.x * wallThickness, z: innerB.z - n.z * wallThickness };

          const ownerSegIndex = wallSegmentsOut.length;
          wallSegmentsOut.push({ a: seg.a, b: seg.b, tier, height: h });

          // ── STEM — always opaque, always emitted, the persistent capped tray-edge body ──
          const stemBaseY = baseY, stemTopY = baseY + wallStemHeight;
          buildWallBox(wallStemBuf, {
            innerA, innerB, outerA, outerB, n, tX: tangent.dx, tZ: tangent.dz,
            yBase: stemBaseY, yTop: stemTopY, capHeight: wallCapHeight, capOverhang: wallCapOverhang,
            footing: wallFooting, color: wallColor, u0, u1, uvDensity,
            capInA: ossOuter && ossOuter.capInA, capInB: ossOuter && ossOuter.capInB,
            capOutA: ossOuter && ossOuter.capOutA, capOutB: ossOuter && ossOuter.capOutB,
            footOutA: ossOuter && ossOuter.footOutA, footOutB: ossOuter && ossOuter.footOutB,
          });
          wallStemSegmentsOut.push({ ownerSegIndex, tier });
          // DEPRECATED legacy `.walls` bundle — stem INNER FACE ONLY (see wallBuf's own header comment
          // above), so a pre-C4.1a reader of `.walls` geometry degrades to a short capped-tray-edge
          // quad instead of hard-breaking; `wallSegmentsOut`'s own a/b/height metadata is UNCHANGED
          // (still the full structural height `h`, not the stem height) for readers that only ever
          // consumed `.walls.segments`, not its geometry.
          pushWallVerticalFace(wallBuf,
            { x: innerA.x, y: stemBaseY, z: innerA.z }, { x: innerB.x, y: stemBaseY, z: innerB.z },
            { x: innerA.x, y: stemTopY, z: innerA.z }, { x: innerB.x, y: stemTopY, z: innerB.z },
            { x: n.x, y: 0, z: n.z }, u0, u1, 0, wallStemHeight, wallColor);

          // ── UPPER — conditional, per-segment (C4.1b's future fade handle) ──
          const upperVisible = upperVisibleForSegment(segMeta);
          const upperHeight = Math.max(0, h - wallStemHeight);
          if (upperVisible && upperHeight > 1e-9) {
            const vertStart = wallUpperBuf.positions.length / 3, idxStart = wallUpperBuf.indices.length;
            buildWallBox(wallUpperBuf, {
              innerA, innerB, outerA, outerB, n, tX: tangent.dx, tZ: tangent.dz,
              yBase: stemTopY, yTop: baseY + h, capHeight: wallCapHeight, capOverhang: wallCapOverhang,
              footing: 0, color: wallColor, u0, u1, uvDensity,
              capInA: ossOuter && ossOuter.capInA, capInB: ossOuter && ossOuter.capInB,
              capOutA: ossOuter && ossOuter.capOutA, capOutB: ossOuter && ossOuter.capOutB,
            });
            const vertCount = wallUpperBuf.positions.length / 3 - vertStart;
            const idxCount = wallUpperBuf.indices.length - idxStart;
            wallUpperSegmentsOut.push({ ownerSegIndex, tier, vertStart, vertCount, idxStart, idxCount });
          }

          // ── TRIM — optional, cosmetic base-course + cornice ribbons ──
          if (wallTrimOn) {
            const trimHeight = Math.min(0.05, wallStemHeight * 0.25);
            const trimProud = wallCapOverhang * 0.5;
            // UNIT G3: same substitution as the stem's own capOutA/footOutA — a corner-mitered trim lip
            // in oss mode, plain per-segment offset (byte-identical) in legacy.
            const trimOuterA = (ossOuter && ossOuter.trimOutA) || { x: outerA.x - n.x * trimProud, z: outerA.z - n.z * trimProud };
            const trimOuterB = (ossOuter && ossOuter.trimOutB) || { x: outerB.x - n.x * trimProud, z: outerB.z - n.z * trimProud };
            pushWallVerticalFace(wallTrimBuf, // baseCourse — at the footing line
              { x: trimOuterA.x, y: stemBaseY, z: trimOuterA.z }, { x: trimOuterB.x, y: stemBaseY, z: trimOuterB.z },
              { x: trimOuterA.x, y: stemBaseY + trimHeight, z: trimOuterA.z }, { x: trimOuterB.x, y: stemBaseY + trimHeight, z: trimOuterB.z },
              { x: -n.x, y: 0, z: -n.z }, u0, u1, 0, trimHeight, wallColor);
            pushWallVerticalFace(wallTrimBuf, // cornice — at the stem/upper seam
              { x: trimOuterA.x, y: stemTopY - trimHeight / 2, z: trimOuterA.z }, { x: trimOuterB.x, y: stemTopY - trimHeight / 2, z: trimOuterB.z },
              { x: trimOuterA.x, y: stemTopY + trimHeight / 2, z: trimOuterA.z }, { x: trimOuterB.x, y: stemTopY + trimHeight / 2, z: trimOuterB.z },
              { x: -n.x, y: 0, z: -n.z }, u0, u1, 0, trimHeight, wallColor);
            wallTrimSegmentsOut.push({ ownerSegIndex, tier });
          }

          // ── MOUNT SLOT(s) — inner-face candidate transforms, DATA only (E0 consumes them) ──
          mountSlotsOut.push({
            slotId: "wall-slot-" + ownerSegIndex + "-mid",
            ownerSegIndex, u: 0.5,
            worldPos: { x: (seg.a.x + seg.b.x) / 2, y: elevationY + DEFAULT_WALL_MOUNT_EYE_HEIGHT, z: (seg.a.z + seg.b.z) / 2 },
            normal: { x: n.x, y: 0, z: n.z },
            tangent: { x: tangent.dx, y: 0, z: tangent.dz },
          });
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

      // UNIT G3 ACUTE-BEVEL (docs/STAGE-G3-WALL-RUNS.md's own "bevel for acute/unstable" branch) — a
      // corner computeOssWallOuterOffsets classified 'bevel' left segA's own end cap and segB's own
      // start cap reaching two DISTINCT outer points (the bevel edge's own two ends) instead of one
      // shared miter vertex — bridge that notch with one small extra wall box per band, built from the
      // SAME lip points those two segments already computed (buildBevelBridgeParams's own header). Runs
      // AFTER the segment loop above (so every real segment's own wallUpperSegmentsOut vertStart/
      // vertCount slice is already captured before any bridge geometry is appended to the shared
      // buffers) — inert (empty list, zero cost) outside "oss" mode and on every fixture with no acute
      // corner at all (every production-shaped room the fuzz corpus generates).
      if (kernelMode === "oss" && ossWallBevels.length) {
        ossWallBevels.forEach(({ segA, segB }) => {
          const outA = ossWallOuterByIndex[segA], outB = ossWallOuterByIndex[segB];
          const segRefA = segments[segA], segRefB = segments[segB];
          if (!outA || !outB || !segRefA || !segRefB || segRefA.kind !== "wall" || segRefB.kind !== "wall") return;
          const bridge = buildBevelBridgeParams(segRefA.b, outA, outB);
          const segMetaA = { a: segRefA.a, b: segRefA.b, mid: { x: (segRefA.a.x + segRefA.b.x) / 2, z: (segRefA.a.z + segRefA.b.z) / 2 }, kind: "wall", tier };
          const h = wallHeightForSegment(segMetaA);
          const baseY = elevationY - (floorDetailOn ? bevelDrop : 0);
          const wallColor = wallColorForSegment ? hexToRgb01(wallColorForSegment(segMetaA)) : null;
          const bu0 = arcU[segA] ? arcU[segA].u1 : 0, bu1 = arcU[segB] ? arcU[segB].u0 : bu0;
          const stemBaseY = baseY, stemTopY = baseY + wallStemHeight;
          buildWallBox(wallStemBuf, Object.assign({}, bridge, {
            yBase: stemBaseY, yTop: stemTopY, capHeight: wallCapHeight, capOverhang: wallCapOverhang,
            footing: wallFooting, color: wallColor, u0: bu0, u1: bu1, uvDensity,
          }));
          const upperVisible = upperVisibleForSegment(segMetaA);
          const upperHeight = Math.max(0, h - wallStemHeight);
          if (upperVisible && upperHeight > 1e-9) {
            buildWallBox(wallUpperBuf, Object.assign({}, bridge, {
              yBase: stemTopY, yTop: baseY + h, capHeight: wallCapHeight, capOverhang: wallCapOverhang,
              footing: 0, color: wallColor, u0: bu0, u1: bu1, uvDensity,
            }));
          }
          if (wallTrimOn) {
            const trimHeight = Math.min(0.05, wallStemHeight * 0.25);
            pushWallVerticalFace(wallTrimBuf, // baseCourse
              { x: bridge.trimOutA.x, y: stemBaseY, z: bridge.trimOutA.z }, { x: bridge.trimOutB.x, y: stemBaseY, z: bridge.trimOutB.z },
              { x: bridge.trimOutA.x, y: stemBaseY + trimHeight, z: bridge.trimOutA.z }, { x: bridge.trimOutB.x, y: stemBaseY + trimHeight, z: bridge.trimOutB.z },
              { x: -bridge.n.x, y: 0, z: -bridge.n.z }, bu0, bu1, 0, trimHeight, wallColor);
            pushWallVerticalFace(wallTrimBuf, // cornice
              { x: bridge.trimOutA.x, y: stemTopY - trimHeight / 2, z: bridge.trimOutA.z }, { x: bridge.trimOutB.x, y: stemTopY - trimHeight / 2, z: bridge.trimOutB.z },
              { x: bridge.trimOutA.x, y: stemTopY + trimHeight / 2, z: bridge.trimOutA.z }, { x: bridge.trimOutB.x, y: stemTopY + trimHeight / 2, z: bridge.trimOutB.z },
              { x: -bridge.n.x, y: 0, z: -bridge.n.z }, bu0, bu1, 0, trimHeight, wallColor);
          }
        });
      }
    });

    if (kernelMode !== "oss" && hollowFloorMode && ringFloorParts.length) {
      // C4.1c PART 2: classify each ring's own inset by its natural pre-ensureCCW winding — an
      // outer boundary (rawArea > 0) is a filled region; a hole (rawArea <= 0) is carved OUT of
      // whichever outer ring's polygon actually contains it (bridgePolygonWithHoles, above) — then
      // ear-clip each resulting (possibly hole-bridged) simple polygon via the SAME triangulatePolygon
      // a simple tier's own floor body already uses.
      const outers = ringFloorParts.filter((p) => p.rawArea > 0).map((p) => p.inset);
      const holes = ringFloorParts.filter((p) => p.rawArea <= 0).map((p) => p.inset);
      const bridgedPolys = bridgePolygonWithHoles(outers, holes);
      // SAFETY NET (never sacrifice containment/correct winding for congruence): a bridged polygon
      // is, in the rare pathological case (a perfectly axis/diagonal-symmetric hole whose bridge
      // anchor lands exactly collinear with an unrelated vertex — measured in this unit's own report,
      // never hit by any real octagon/rotunda fixture this file's own harnesses exercise), capable of
      // tripping the ear-clip's unsafe last-resort fallback into a wrongly-wound triangle. Validate
      // every triangle of every bridged polygon actually has the correct positive (CCW) winding
      // before committing any of them; if even one doesn't, this tier falls back to the OLD, always-
      // correct buildFloorCells stairstep rather than ship broken/backwards floor geometry — a
      // congruence regression for that one tier, never a correctness one.
      const trisPerPoly = bridgedPolys.map((op) => (op.length >= 3 ? triangulatePolygon(op) : []));
      const allValid = bridgedPolys.every((op, i) => trisPerPoly[i].every((tri) => triangleHasPositiveArea(op, tri)));
      if (allValid) {
        bridgedPolys.forEach((op, i) => {
          const tris = trisPerPoly[i];
          if (!tris.length) return;
          const baseIdx = floorBuf.positions.length / 3;
          op.forEach((v) => pushVert(floorBuf, v.x, elevationY, v.z, 0, 1, 0, v.x * uvDensity, v.z * uvDensity));
          // WINDING: same (iPrev,iCur,iNext) -> (iPrev,iNext,iCur) j/k swap as the simple-tier ear-clip
          // above (triangulatePolygon's own CCW-input/-Y-normal quirk — see that branch's own header).
          tris.forEach(([i2, j2, k2]) => pushTri(floorBuf, baseIdx + i2, baseIdx + k2, baseIdx + j2));
        });
      } else {
        buildFloorCells(floorBuf, tierCells, elevationY, uvDensity, floorColorAt);
      }
    }

    // UNIT G2 (§17.5): "oss" mode's own uniform tier-end triangulation — REPLACES the ear-clip +
    // C4.1c hand-rolled hole-bridging above with the kernel's Earcut (triangulateSurface, outer +
    // holes natively, no bridge corridor needed). Runs for EVERY oss-mode tier (simple or complex —
    // §17.5's own "replace floor triangulation with Earcut in oss mode" is unconditional), grouping
    // each ring's own bevel-inset polygon into {outer,holes} sets via groupInsetsForKernelTriangulation
    // (the non-bridging sibling of bridgePolygonWithHoles, above) before handing them to the kernel.
    if (kernelMode === "oss" && ringFloorParts.length) {
      const outers = ringFloorParts.filter((p) => p.rawArea > 0).map((p) => p.inset);
      const holes = ringFloorParts.filter((p) => p.rawArea <= 0).map((p) => p.inset);
      const groups = groupInsetsForKernelTriangulation(outers, holes);
      let triResult = null, triOk = false, triThrew = null;
      try {
        triResult = PolygonKernel.triangulateSurface({ polygons: groups });
        const hasErrorIssue = (triResult.diagnostics.issues || []).some((i) => i.level === "error");
        // MEASURED (this unit's own report, F18-row101-exact-canonical tier 2, the octagon-chamfered
        // outer ring around the sunken arena): Earcut can legitimately emit a SMALL number of
        // zero-area triangles at a near-collinear boundary vertex (here: exactly 1 of 36, from the
        // diagonalized octagon chamfer) even when every upstream ring/inset passed validateSurface
        // cleanly — a zero-area triangle contributes no visible geometry and doesn't corrupt the mesh
        // (unlike a REVERSED triangle, a real backwards-normal visual defect, or a hard error
        // diagnostic). Gating the whole tier's fallback on zeroAreaTriangles too would silently
        // discard row-101's own correctly-recovered annular hole over one harmless sliver — gate only
        // on the two invariants that actually indicate broken geometry.
        triOk = !hasErrorIssue && triResult.indices.length > 0 && triResult.diagnostics.reversedTriangles === 0;
      } catch (e) {
        triThrew = String((e && e.stack) || e);
      }
      if (triOk) {
        const baseIdx = floorBuf.positions.length / 3;
        triResult.vertices.forEach((v) => {
          const rgb = floorColorAt ? hexToRgb01(floorColorAt(Math.round(v.x), Math.round(v.z))) : null;
          pushVert(floorBuf, v.x, elevationY, v.z, 0, 1, 0, v.x * uvDensity, v.z * uvDensity, rgb ? rgb.r : 1, rgb ? rgb.g : 1, rgb ? rgb.b : 1);
        });
        // WINDING: PolygonKernel's own triangulateSurface, fed a CCW outer, is measured (this unit's
        // own report) to emit the SAME "-Y facing" raw index order triangulatePolygon does above — the
        // identical (i,j,k)->(i,k,j) swap is required to match this floor's explicit +Y-up normal.
        for (let ti = 0; ti < triResult.indices.length; ti += 3) {
          pushTri(floorBuf, baseIdx + triResult.indices[ti], baseIdx + triResult.indices[ti + 2], baseIdx + triResult.indices[ti + 1]);
        }
        ossDiagnosticsOut.push({
          level: "info", typed: "oss-triangulation-ok", tier, triangleCount: triResult.indices.length / 3,
          zeroAreaTriangles: triResult.diagnostics.zeroAreaTriangles, // recorded, never silenced — see this branch's own triOk comment
        });
      } else {
        // FALLBACK (§15): "if Earcut fails unexpectedly, emit diagnostics and use the validated legacy
        // triangulator only during the stabilization window... never render an empty room silently."
        // buildFloorCells is the always-correct universal fallback (works for any topology, no
        // ear-clip/bridge assumptions) — the SAME one legacy's own hollow-floor safety net falls back
        // to above.
        buildFloorCells(floorBuf, tierCells, elevationY, uvDensity, floorColorAt);
        ossDiagnosticsOut.push({
          level: "error", typed: "oss-triangulation-fallback", tier,
          message: "kernel triangulateSurface failed validation for this tier; fell back to buildFloorCells",
          issues: triResult ? triResult.diagnostics.issues : [], threw: triThrew,
        });
      }
    }

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

  // UNIT G2: assemble the return bundle. In "legacy" mode this object has EXACTLY the same keys/
  // values it always did — `ossDiagnosticsOut` is only ever non-empty when kernelMode !== "legacy"
  // (every push site above is itself gated on kernelMode), and the field is only ATTACHED to the
  // bundle below when kernelMode !== "legacy" too, so a legacy caller's `JSON.stringify(result)` is
  // byte-identical to before this unit existed.
  const resultBundle = {
    floor: { positions: floorBuf.positions, normals: floorBuf.normals, uvs: floorBuf.uvs, colors: floorBuf.colors, indices: floorBuf.indices, tiers: floorTierMeta, bevelTriCount },
    // DEPRECATED — stem INNER FACE ONLY (C4.1a); use wallStem/wallUpper/wallTrim for new code. Kept so
    // a pre-C4.1a reader of `.walls` geometry never hard-breaks. `.walls.segments` (a/b/tier/height
    // metadata, NOT geometry) is unchanged and shared as the ownerSegIndex cross-reference below.
    walls: { positions: wallBuf.positions, normals: wallBuf.normals, uvs: wallBuf.uvs, colors: wallBuf.colors, indices: wallBuf.indices, segments: wallSegmentsOut },
    // C4.1a — the real wall VOLUME bundles (docs/WALL-VOLUMES-PRACTICALS.md). wallStem: one merged,
    // always-opaque bundle. wallUpper: one merged buffer, but each `segments[i]` additionally carries
    // {vertStart,vertCount,idxStart,idxCount} so compileRoomShell can slice out a STANDALONE per-segment
    // geometry (sliceBufferForSegment) — the spec's own "prefer per-segment upper meshes" choice, the
    // independent per-segment show/hide handle C4.1b's future occlusion fade needs. A hidden segment
    // (upperVisibleForSegment -> false, or zero remaining height) simply has NO entry in
    // wallUpper.segments. wallTrim: null when opts.wallTrim===false.
    wallStem: { positions: wallStemBuf.positions, normals: wallStemBuf.normals, uvs: wallStemBuf.uvs, colors: wallStemBuf.colors, indices: wallStemBuf.indices, segments: wallStemSegmentsOut },
    wallUpper: { positions: wallUpperBuf.positions, normals: wallUpperBuf.normals, uvs: wallUpperBuf.uvs, colors: wallUpperBuf.colors, indices: wallUpperBuf.indices, segments: wallUpperSegmentsOut },
    wallTrim: wallTrimOn ? { positions: wallTrimBuf.positions, normals: wallTrimBuf.normals, uvs: wallTrimBuf.uvs, colors: wallTrimBuf.colors, indices: wallTrimBuf.indices, segments: wallTrimSegmentsOut } : null,
    mountSlots: mountSlotsOut,
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
  if (kernelMode !== "legacy") resultBundle.ossDiagnostics = ossDiagnosticsOut;
  return resultBundle;
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
  // C4.1a: one standalone THREE.BufferGeometry per wall-upper segment (sliceBufferForSegment, the pure
  // slicer above) — the caller (theater-boot.js) builds one THREE.Mesh per entry so each segment gets
  // its own independent visibility/opacity handle (C4.1a: hard .visible toggle; C4.1b: tweened opacity).
  const wallUpperMeshes = (data.wallUpper.segments || []).map((seg) => ({
    ownerSegIndex: seg.ownerSegIndex, tier: seg.tier,
    geometry: bufferGeometryFrom(sliceBufferForSegment(data.wallUpper, seg)),
  }));
  return {
    floorGeometry: data.floor.indices.length ? bufferGeometryFrom(data.floor) : null,
    // DEPRECATED — stem inner-face-only geometry; see compileRoomShellData's own `.walls` comment.
    wallGeometry: data.walls.indices.length ? bufferGeometryFrom(data.walls) : null,
    wallStemGeometry: data.wallStem.indices.length ? bufferGeometryFrom(data.wallStem) : null,
    wallUpperMeshes, // [{ownerSegIndex, tier, geometry}] — per-segment, C4.1a's own preferred shape
    wallTrimGeometry: (data.wallTrim && data.wallTrim.indices.length) ? bufferGeometryFrom(data.wallTrim) : null,
    mountSlots: data.mountSlots,
    riserGeometry: data.risers.indices.length ? bufferGeometryFrom(data.risers) : null,
    cellTriangleMap: data.cellTriangleMap,
    apertures: data.apertures,
    floorTiers: data.floor.tiers,
    wallSegments: data.walls.segments,
    riserSegments: data.risers.segments,
    meta: Object.assign({}, data.meta, { bevelTriCount: data.floor.bevelTriCount }),
    // UNIT G2: null in "legacy" mode (data.parityDiagnostics/data.ossDiagnostics are only ever set by
    // compileRoomShellData when kernelMode !== "legacy" — see that function's own return-assembly
    // comment), so this adds two always-present-but-usually-null keys, never a legacy value change.
    parityDiagnostics: data.parityDiagnostics || null,
    ossDiagnostics: data.ossDiagnostics || null,
  };
}

export {
  // pure core (dev/verify-room-shell.mjs's own direct import surface)
  cellKey, buildCellIndex, tierOf, edgeVertsFor, traceTierContour, chainEdgesIntoRings,
  directionOf, mergeKeyFor, findSegmentStart, simplifySegments, unmergedSegments, ringToPolygon, signedArea2D,
  ensureCCW, segmentNormal, insetOffset, insetPolygon, radialSmoothRing,
  chamferRunCorners, chamferMetaFor, diagonalizeStaircaseRing, diagonalRunQualifies, diagonalSameRunFamily,
  findDiagonalSafeStart, lineIntersect2D,
  pointInTriangle2D, pointToSegmentDist2, pointToTriangleDist2,
  triangulatePolygon, ringPerimeterU,
  hexToRgb01, polygonBBox, isAxisAlignedRectPolygon, buildAxisGrid, buildFloorGrid, buildFloorCells,
  // C4.1c PART 2 hole-bridging (dev/verify-floor-congruence.mjs's own direct import surface)
  polygonContainsPoint, segmentsProperlyIntersect, bridgeVisible, bridgeHoleIntoOuter,
  bridgePolygonWithHoles, triangleHasPositiveArea, HOLE_BRIDGE_EPS,
  // C4.1a wall-volume geometry (dev/verify-wall-volumes.mjs's own direct import surface)
  pushWallVerticalFace, buildWallBox, sliceBufferForSegment,
  compileRoomShellData,
  ROOM_SHELL_TIER_QUANTUM, DEFAULT_WALL_HEIGHT, DEFAULT_BEVEL_WIDTH, DEFAULT_BEVEL_DROP, DEFAULT_UV_DENSITY,
  DEFAULT_RADIAL_SMOOTH_BLEND,
  DEFAULT_WALL_THICKNESS, DEFAULT_WALL_STEM_HEIGHT, DEFAULT_WALL_CAP_HEIGHT, DEFAULT_WALL_CAP_OVERHANG,
  DEFAULT_WALL_FOOTING, DEFAULT_WALL_MOUNT_EYE_HEIGHT,
  DEFAULT_DOOR_OPENING_WIDTH, DEFAULT_DOOR_OPENING_HEIGHT,
  // UNIT G2 — PolygonKernel floor integration (dev/verify-room-shell-oss.mjs's own direct import surface)
  ROOM_SHELL_POLYGON_KERNEL, unitStepClassifyRing, deriveKernelRingsForTier, validateRenderTransform,
  DEFAULT_RENDER_TRANSFORM_AREA_TOLERANCE, groupInsetsForKernelTriangulation, buildParityDiagnostics,
  floorAreaOfBundle, floorBoundsOfBundle, triangleValidityOfBundle,
  // UNIT G3 — aperture-delimited-run wall offsetting (dev/verify-wall-runs-oss.mjs's own direct import surface)
  computeOssWallOuterOffsets, buildBevelBridgeParams,
  // THREE assembler (theater-boot.js's own import surface)
  compileRoomShell,
};
