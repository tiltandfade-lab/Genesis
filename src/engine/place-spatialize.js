/* GENESIS MODULE — src/engine/place-spatialize.js — DUNGEON-GRAPH U1: the spatializer
   (docs/DUNGEON-GRAPH.md "Build units" U1). Classic <script> (shared global scope).
   Registered in manifest.json; validated by build/check-manifest.py.

   spatializePlan(segments, topologyName, opts) turns a walk's segment graph (rooms=nodes,
   exits=edges — the exact shape src/engine/walk.js:593-625 builds, e.g. rollDungeonWalk's
   output) into a walkable cell-grid floor plan (the `SpatialPlan` shape DUNGEON-GRAPH.md
   "Shared data shape" defines). Engine-layer purity: this file never touches `w`/`U`/render/
   DOM — pure data in, pure data out.

   DETERMINISM LAW: no un-seeded Math.random / Date.now anywhere in this file. The seed is
   derived by hashing `opts.walkId` (a small string-hash → mulberry32 PRNG, the same reference
   pattern src/ui/theater-boot.js's mulberry32 uses) — same walk id + same segments/topology
   ⇒ byte-identical `cells` buffer. DEVIATION FROM SPEC TEXT (documented, not silent): the walk
   object itself carries no single top-level id field today (only per-segment ids exist) — the
   spec's own §"Shared data shape" block lists `seed` as a plan output, implying the caller
   supplies or the module derives one. `opts.walkId` is the seam U2/U3/U4 (and world.prep, which
   already owns the walk's storage key) pass the walk's real identity through; when omitted this
   module falls back to hashing a deterministic fingerprint of the topology + segment ids/exits
   so the "same input twice ⇒ same plan" law still holds without a caller-supplied id.

   Stages (per DUNGEON-GRAPH.md U1): per-topology layout seed → room rect placement → AABB
   separation → corridor carving along EXITS ONLY → rasterize (walls auto-derive; doors at
   corridor/room-perimeter meets) → BFS reachability verify from the entry segment's room →
   on fail, mutate seed and retry (≤5 more attempts) → honest-fail (throw naming topology+seed,
   never a hand-patched plan).

   Internal helpers are `dsp`-prefixed (mirrors the `dwalk`-prefix convention in
   src/engine/dungeon-walk.js) so nothing here collides with another module's globals. */

const SPATIAL_CELL = Object.freeze({ VOID: 0, FLOOR: 1, WALL: 2, DOOR: 3, WATER: 4 });

// ─── seeded RNG (mulberry32 — same reference pattern as src/ui/theater-boot.js) ──────────────
function dspHashStr(s) {
  // djb2-ish string hash → unsigned 32-bit int. Pure, deterministic, no Math.random/Date.now.
  let h = 5381;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}
function dspMulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── topology → layout family (DUNGEON-GRAPH.md U1 stage 1) ─────────────────────────────────
const DSP_TOPOLOGY_GROUP = {
  "The Hub": "hub", "The Stronghold": "hub",
  "The Onion": "onion",
  "The Spine": "linear", "The Cascade": "linear", "The Ruin": "linear",
  "The Convergence": "linear", "The Figure-8": "linear",
  "The Loop": "loop",
  "The Branch": "tree",
  "The Web": "web", "The Labyrinth Fragment": "web",
};

function dspTopologyGroup(topologyName) {
  return DSP_TOPOLOGY_GROUP[topologyName] || "linear";
}

// radial layout shared by Hub (tight center, spokes evenly spread — check §3's >60° spread
// assertion) and Onion (wider rings per BFS depth = concentric shells).
function dspRadialByDepth(sorted, rng, ringGap) {
  const byDepth = {};
  sorted.forEach((s) => { (byDepth[s.depth] = byDepth[s.depth] || []).push(s); });
  const anchors = {};
  const baseAngle = rng() * Math.PI * 2;
  Object.keys(byDepth).map(Number).sort((a, b) => a - b).forEach((d) => {
    const arr = byDepth[d];
    const radius = d === 0 ? 0 : ringGap * d;
    arr.forEach((s, i) => {
      const angle = baseAngle + (2 * Math.PI * i) / arr.length + d * 0.15;
      anchors[s.id] = { ax: radius * Math.cos(angle), ay: radius * Math.sin(angle) };
    });
  });
  return anchors;
}

// linear-drift: depth on the x-axis, siblings fanned on the y-axis with a small seeded jitter.
function dspLinearDrift(sorted, rng) {
  const stepX = 9;
  const byDepth = {};
  sorted.forEach((s) => { (byDepth[s.depth] = byDepth[s.depth] || []).push(s); });
  const anchors = {};
  Object.keys(byDepth).map(Number).sort((a, b) => a - b).forEach((d) => {
    const arr = byDepth[d];
    arr.forEach((s, i) => {
      const lateral = (i - (arr.length - 1) / 2) * 7 + (rng() - 0.5) * 2;
      anchors[s.id] = { ax: d * stepX, ay: lateral };
    });
  });
  return anchors;
}

// ring: every node evenly on a circle in num order — also doubles as the Web/Labyrinth
// "planarize" seed (chords between non-adjacent num nodes cross naturally; the crossing-edge
// → bridge:true flag is caught later at corridor-carve time by real cell-overlap detection,
// not a separate geometric predicate).
function dspRingLayout(sorted, rng) {
  const n = Math.max(1, sorted.length);
  const radius = Math.max(8, n * 2);
  const baseAngle = rng() * Math.PI * 2;
  const anchors = {};
  sorted.forEach((s, i) => {
    const angle = baseAngle + (2 * Math.PI * i) / n;
    anchors[s.id] = { ax: radius * Math.cos(angle), ay: radius * Math.sin(angle) };
  });
  return anchors;
}

// tree-drift: recursive fan-out from the entry room; each node's parent is a depth-1 neighbor
// (lowest num wins a tie), children fan across the parent's angular wedge, radius grows by depth.
function dspTreeDrift(sorted, edges, entry, rng) {
  const byId = {}; sorted.forEach((s) => { byId[s.id] = s; });
  const adj = {}; sorted.forEach((s) => { adj[s.id] = []; });
  edges.forEach(({ aId, bId }) => { adj[aId].push(bId); adj[bId].push(aId); });
  const childrenOf = {};
  sorted.forEach((s) => {
    if (s.id === entry.id) return;
    const candidates = (adj[s.id] || [])
      .filter((nid) => byId[nid] && byId[nid].depth === s.depth - 1)
      .sort((a, b) => byId[a].num - byId[b].num);
    const p = candidates[0];
    if (p != null) (childrenOf[p] = childrenOf[p] || []).push(s.id);
  });
  const anchors = { [entry.id]: { ax: 0, ay: 0 } };
  const angleOf = { [entry.id]: 0 };
  const spanOf = { [entry.id]: Math.PI * 2 };
  const radiusStep = 8;
  const queue = [entry.id];
  while (queue.length) {
    const pid = queue.shift();
    const kids = childrenOf[pid] || [];
    if (!kids.length) continue;
    const parentAngle = angleOf[pid], span = spanOf[pid];
    const startAngle = parentAngle - span / 2;
    kids.forEach((kid, i) => {
      const a = kids.length === 1 ? parentAngle : startAngle + (span * (i + 0.5)) / kids.length;
      const jitter = (rng() - 0.5) * 0.3;
      angleOf[kid] = a + jitter;
      spanOf[kid] = Math.max(0.6, span / Math.max(1, kids.length));
      const r = radiusStep * byId[kid].depth;
      anchors[kid] = { ax: r * Math.cos(angleOf[kid]), ay: r * Math.sin(angleOf[kid]) };
      queue.push(kid);
    });
  }
  // any node dspTreeDrift's parent-walk didn't reach (ties/multi-parent edge cases) still needs
  // a deterministic anchor — fall back to a depth-keyed radial placement.
  sorted.forEach((s) => {
    if (!anchors[s.id]) anchors[s.id] = { ax: radiusStep * s.depth, ay: (rng() - 0.5) * radiusStep };
  });
  return anchors;
}

function dspLayoutFor(topologyName, sorted, edges, entry, rng) {
  const group = dspTopologyGroup(topologyName);
  if (group === "hub") return dspRadialByDepth(sorted, rng, 10);
  if (group === "onion") return dspRadialByDepth(sorted, rng, 8);
  if (group === "loop" || group === "web") return dspRingLayout(sorted, rng);
  if (group === "tree") return dspTreeDrift(sorted, edges, entry, rng);
  return dspLinearDrift(sorted, rng); // "linear" group (Spine/Cascade/Ruin/Convergence/Figure-8)
}

// ─── AABB separation (iterative push-apart, deterministic) ──────────────────────────────────
function dspSeparateRooms(rooms, minGap, iterations, rng) {
  for (let iter = 0; iter < iterations; iter++) {
    let moved = false;
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const a = rooms[i], b = rooms[j];
        const overlapX = a.x + a.w + minGap > b.x && b.x + b.w + minGap > a.x;
        const overlapY = a.y + a.d + minGap > b.y && b.y + b.d + minGap > a.y;
        if (!(overlapX && overlapY)) continue;
        const acx = a.x + a.w / 2, acy = a.y + a.d / 2;
        const bcx = b.x + b.w / 2, bcy = b.y + b.d / 2;
        let dx = bcx - acx, dy = bcy - acy;
        if (dx === 0 && dy === 0) {
          const ang = rng() * Math.PI * 2;
          dx = Math.cos(ang); dy = Math.sin(ang);
        }
        const dist = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
        const ux = dx / dist, uy = dy / dist;
        const push = 0.75; // sub-cell nudge per iteration — converges over `iterations` passes
        a.x -= ux * push; a.y -= uy * push;
        b.x += ux * push; b.y += uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  rooms.forEach((r) => { r.x = Math.round(r.x); r.y = Math.round(r.y); });
}

function dspNormalizeRooms(rooms, padding) {
  if (!rooms.length) return;
  let minX = Infinity, minY = Infinity;
  rooms.forEach((r) => { minX = Math.min(minX, r.x); minY = Math.min(minY, r.y); });
  const dx = padding - minX, dy = padding - minY;
  rooms.forEach((r) => { r.x += dx; r.y += dy; });
}

// ─── corridor carving (EXITS ONLY — never an invented edge) ─────────────────────────────────
function dspInRect(c, r) { return c.x >= r.x && c.x < r.x + r.w && c.y >= r.y && c.y < r.y + r.d; }

function dspLShapedPath(ra, rb) {
  const ax = ra.x + Math.floor(ra.w / 2), ay = ra.y + Math.floor(ra.d / 2);
  const bx = rb.x + Math.floor(rb.w / 2), by = rb.y + Math.floor(rb.d / 2);
  const path = [];
  const stepX = bx >= ax ? 1 : -1;
  for (let x = ax; x !== bx; x += stepX) path.push({ x, y: ay });
  path.push({ x: bx, y: ay });
  const stepY = by >= ay ? 1 : -1;
  for (let y = ay; y !== by; y += stepY) path.push({ x: bx, y });
  path.push({ x: bx, y: by });
  return path;
}

function dspDedupe(path) {
  const seen = new Set(), out = [];
  path.forEach((c) => { const k = c.x + "," + c.y; if (!seen.has(k)) { seen.add(k); out.push(c); } });
  return out;
}

function dspWidenPath(path, width) {
  if (width <= 1) return dspDedupe(path);
  const map = new Map();
  path.forEach((c) => {
    map.set(c.x + "," + c.y, { x: c.x, y: c.y });
    map.set((c.x + 1) + "," + c.y, { x: c.x + 1, y: c.y });
    map.set(c.x + "," + (c.y + 1), { x: c.x, y: c.y + 1 });
  });
  return Array.from(map.values());
}

function dspExitDoorCell(path, room) {
  let idx = -1;
  path.forEach((c, i) => { if (dspInRect(c, room)) idx = i; });
  return idx >= 0 ? path[idx] : null;
}
function dspEntryDoorCell(path, room) {
  for (let i = 0; i < path.length; i++) if (dspInRect(path[i], room)) return path[i];
  return null;
}

// ─── the single-attempt build (throws on an unreachable plan; caller retries with a new seed) ─
function dspBuildPlanOnce(segments, topologyName, opts, seed) {
  const rng = dspMulberry32(seed);
  const byId = {}; segments.forEach((s) => { byId[s.id] = s; });

  // unique undirected edges — exits are stored symmetrically (walk.js builds adj both ways), so
  // dedupe by an order-independent key. This is the ONLY source of corridors: never invent one.
  const edgeMap = new Map();
  segments.forEach((s) => {
    (s.exits || []).forEach((e) => {
      if (!byId[e.targetId]) return; // never invent an edge to a segment that doesn't exist
      const key = s.id < e.targetId ? s.id + "|" + e.targetId : e.targetId + "|" + s.id;
      if (!edgeMap.has(key)) edgeMap.set(key, { aId: s.id, bId: e.targetId });
    });
  });
  const edges = Array.from(edgeMap.values());

  const entry = segments.find((s) => s.depth === 0)
    || segments.slice().sort((a, b) => a.depth - b.depth || a.num - b.num)[0];
  if (!entry) throw new Error("no entry segment (empty segments[])");

  const sizeClass = opts.sizeClass || {};
  const minW = sizeClass.minW || 4, maxW = Math.max(minW, sizeClass.maxW || 7);
  const minD = sizeClass.minD || 4, maxD = Math.max(minD, sizeClass.maxD || 7);
  const sorted = segments.slice().sort((a, b) => a.num - b.num);
  const sizeOf = {};
  sorted.forEach((s) => {
    const w = minW + Math.floor(rng() * (maxW - minW + 1));
    const d = minD + Math.floor(rng() * (maxD - minD + 1));
    sizeOf[s.id] = { w: Math.max(4, w), d: Math.max(4, d) };
  });

  const anchors = dspLayoutFor(topologyName, sorted, edges, entry, rng);

  const rooms = sorted.map((s) => {
    const sz = sizeOf[s.id];
    const a = anchors[s.id] || { ax: 0, ay: 0 };
    return {
      segNum: s.num, segId: s.id,
      x: a.ax - sz.w / 2, y: a.ay - sz.d / 2, w: sz.w, d: sz.d,
      depth: s.depth, isFinale: !!s.isFinale, role: null, scaleDomain: 1.0,
    };
  });

  dspSeparateRooms(rooms, 2, 60, rng);
  dspNormalizeRooms(rooms, 3);

  let maxX = 0, maxY = 0;
  rooms.forEach((r) => { maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.d); });
  const cellW = maxX + 3, cellD = maxY + 3;
  const cells = new Uint8Array(cellW * cellD);
  const idx = (x, y) => y * cellW + x;

  rooms.forEach((r) => {
    for (let yy = r.y; yy < r.y + r.d; yy++) {
      for (let xx = r.x; xx < r.x + r.w; xx++) {
        if (xx >= 0 && yy >= 0 && xx < cellW && yy < cellD) cells[idx(xx, yy)] = SPATIAL_CELL.FLOOR;
      }
    }
  });

  const roomBySeg = {}; rooms.forEach((r) => { roomBySeg[r.segId] = r; });

  const corridors = [], doors = [], carvedCellSets = [];
  edges.forEach(({ aId, bId }) => {
    const ra = roomBySeg[aId], rb = roomBySeg[bId];
    if (!ra || !rb) return;
    const width = 1 + (rng() < 0.15 ? 1 : 0); // width 1-2 cells, seeded
    const path = dspLShapedPath(ra, rb);
    const widened = dspWidenPath(path, width);
    const cellKeySet = new Set(widened.map((c) => c.x + "," + c.y));

    // Web/Labyrinth planarize law: a crossing edge emits bridge:true instead of overlapping —
    // detected here as a REAL cell-overlap against every already-carved corridor (not a topology
    // special-case), so it fires for any topology whose layout happens to cross, honestly.
    let bridge = false;
    for (const prior of carvedCellSets) {
      for (const k of cellKeySet) { if (prior.has(k)) { bridge = true; break; } }
      if (bridge) break;
    }
    carvedCellSets.push(cellKeySet);

    widened.forEach((c) => {
      if (c.x >= 0 && c.y >= 0 && c.x < cellW && c.y < cellD) {
        if (cells[idx(c.x, c.y)] === SPATIAL_CELL.VOID) cells[idx(c.x, c.y)] = SPATIAL_CELL.FLOOR;
      }
    });

    const doorA = dspExitDoorCell(path, ra);
    const doorB = dspEntryDoorCell(path, rb);
    if (doorA && doorA.x >= 0 && doorA.y >= 0 && doorA.x < cellW && doorA.y < cellD) {
      cells[idx(doorA.x, doorA.y)] = SPATIAL_CELL.DOOR;
      doors.push({ x: doorA.x, y: doorA.y, betweenSegs: [ra.segNum, rb.segNum], heightScale: 1.0 });
    }
    if (doorB && doorB.x >= 0 && doorB.y >= 0 && doorB.x < cellW && doorB.y < cellD) {
      cells[idx(doorB.x, doorB.y)] = SPATIAL_CELL.DOOR;
      doors.push({ x: doorB.x, y: doorB.y, betweenSegs: [ra.segNum, rb.segNum], heightScale: 1.0 });
    }

    corridors.push({ fromSeg: ra.segNum, toSeg: rb.segNum, cells: widened, width, bridge });
  });

  // rasterize: any VOID cell 8-adjacent to a passable (FLOOR/DOOR/WATER) cell becomes WALL.
  const passable = new Set([SPATIAL_CELL.FLOOR, SPATIAL_CELL.DOOR, SPATIAL_CELL.WATER]);
  const toWall = [];
  for (let y = 0; y < cellD; y++) {
    for (let x = 0; x < cellW; x++) {
      if (cells[idx(x, y)] !== SPATIAL_CELL.VOID) continue;
      let adj = false;
      for (let dy = -1; dy <= 1 && !adj; dy++) {
        for (let dx = -1; dx <= 1 && !adj; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellD) continue;
          if (passable.has(cells[idx(nx, ny)])) adj = true;
        }
      }
      if (adj) toWall.push(idx(x, y));
    }
  }
  toWall.forEach((i) => { cells[i] = SPATIAL_CELL.WALL; });

  // BFS reachability verify from the entry segment's room.
  const entryRoom = roomBySeg[entry.id];
  if (!entryRoom) throw new Error("no entry room placed");
  const startX = Math.min(cellW - 1, Math.max(0, entryRoom.x + Math.floor(entryRoom.w / 2)));
  const startY = Math.min(cellD - 1, Math.max(0, entryRoom.y + Math.floor(entryRoom.d / 2)));
  if (!passable.has(cells[idx(startX, startY)])) throw new Error("entry cell not passable");
  const seen = new Uint8Array(cellW * cellD);
  const q = [[startX, startY]]; seen[idx(startX, startY)] = 1;
  let head = 0;
  while (head < q.length) {
    const [cx, cy] = q[head++];
    const nbrs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
    for (const [nx, ny] of nbrs) {
      if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellD) continue;
      const ii = idx(nx, ny);
      if (seen[ii] || !passable.has(cells[ii])) continue;
      seen[ii] = 1; q.push([nx, ny]);
    }
  }
  let unreachable = 0;
  for (let i = 0; i < cells.length; i++) if (cells[i] === SPATIAL_CELL.FLOOR && !seen[i]) unreachable++;
  if (unreachable > 0) throw new Error(`unreachable FLOOR cells: ${unreachable} of ${cells.length}`);

  const domains = [{ scale: 1.0, segNums: rooms.map((r) => r.segNum), transitions: [] }];

  return { seed, topology: topologyName, cellW, cellD, cells, rooms, corridors, doors, domains };
}

/** spatializePlan(segments, topologyName, opts) → SpatialPlan (docs/DUNGEON-GRAPH.md
 *  "Shared data shape"). `segments` is a walk's segment array (walk.js:593-625 shape: id/num/
 *  label/isFinale/depth/exits[]/light). `opts.walkId` seeds determinism; `opts.sizeClass`
 *  ({minW,maxW,minD,maxD}) is the optional GRID-LAW room-size override. Honest-fail: after the
 *  first attempt + up to 5 seed-mutated retries still can't verify reachability, throws naming
 *  the topology and the seed that failed — never returns a hand-patched plan. */
function spatializePlan(segments, topologyName, opts) {
  opts = opts || {};
  if (!Array.isArray(segments) || !segments.length) {
    throw new Error("spatializePlan: segments[] is required and must be non-empty");
  }
  const fingerprint = opts.walkId != null
    ? String(opts.walkId)
    : topologyName + "|" + segments.map((s) => s.id + ":" + s.num + ":" + (s.exits || []).map((e) => e.targetId).join(",")).join("|");
  let seed = dspHashStr(fingerprint);
  const originalSeed = seed;
  let lastErr = null;
  const MAX_ATTEMPTS = 6; // first try + 5 retries
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return dspBuildPlanOnce(segments, topologyName, opts, seed);
    } catch (e) {
      lastErr = e;
      seed = dspHashStr(seed + ":retry:" + attempt); // mutate seed, deterministic re-hash
    }
  }
  throw new Error(
    `spatializePlan: topology "${topologyName}" seed ${originalSeed} failed to verify after ${MAX_ATTEMPTS} attempts — ${lastErr ? lastErr.message : "unknown"}`
  );
}
