/* GENESIS MODULE — src/engine/place-semantics.js — DUNGEON-GRAPH U2: semantics + scale domains
   (docs/DUNGEON-GRAPH.md "Build units" U2). Classic <script> (shared global scope). Registered
   in manifest.json; validated by build/check-manifest.py.

   WHY A SIBLING MODULE (not folded into place-spatialize.js): U1 owns pure GEOMETRY (graph →
   cell-grid). U2 owns pure SEMANTICS layered on top of that geometry (roles/bands/scale
   domains) — a materially different concern the spec itself splits into a separate build unit
   with its own acceptance + red-first harness. Keeping it a sibling file mirrors that unit
   boundary 1:1, keeps place-spatialize.js from growing past its one job, and lets U2 be
   red-first/verified independently (dev/verify-dungeon-semantics.mjs) without re-testing U1's
   geometry. It still depends on `SPATIAL_CELL` — a classic-script shared global place-spatialize.js
   already defines — so load order matters (registered directly after place-spatialize.js in
   manifest.json + genesis.html), same convention as every other engine module pair here.

   semanticizePlan(plan, segments, residents) → an EXTENDED SpatialPlan (docs/DUNGEON-GRAPH.md
   "Shared data shape"): `plan` is U1's spatializePlan() output; `segments` is the walk's segment
   array (walk.js:593-625 shape) — kept as a spec-mandated input parameter, though this module's
   own graph traversal is self-sufficient from `plan.rooms`/`plan.corridors` (which are 1:1 with
   `segments`' nodes/exits per U1's law "never invent an edge"), so `segments` is read only for
   completeness/future-proofing, not required for correctness; `residents` is the optional
   `[{segNum, sizeBand, scaleVsHuman, apex:bool}]` array DUNGEON-GRAPH.md U2 describes. Never
   mutates the input `plan` — returns a new plan object with cloned rooms/corridors/doors/cells,
   preserving engine-layer purity (no w/U/render/DOM) and letting callers diff before/after.

   Stages (per DUNGEON-GRAPH.md U2, in order):
     1. ROOM ROLES from the graph — entrance (entry segment) / finale (isFinale segment) / path
        (on the critical path, entry→finale, the shortest route through the corridor graph) /
        pocket (degree-1 dead end, non-finale — HOOK-WALKS §4's parked branch-node idea's honest
        home: a room you can see and skip) / side (everything else).
     2. DIFFICULTY BANDS from depth — shallow (depth 0-1, always) / mid / deep, otherwise a
        tertile split of [0, maxDepth]. Because `room.band` is a non-decreasing function of
        `room.depth`, and a true BFS shortest path's depth increases by exactly 1 per hop, bands
        along the critical path are monotone non-decreasing by construction (asserted anyway,
        honest-fail on a regression rather than trusting the math silently).
     3. SCALE DOMAINS (law §2, docs/DUNGEON-GRAPH.md: "a room that merely fits its monster is a
        prison") — every resident with scaleVsHuman >= 2.0 claims a domain: its own room plus
        adjacent path/side rooms (patrol radius 1). An apex:true resident with scaleVsHuman >= 4.0
        claims the ENTIRE dungeon instead. Domain rooms get scaleDomain = max(current, resident
        scale). FIT TEST: any domain room whose dims are below ceil(scale)+2 cells per axis gets
        GROWN (re-carved, centered on its prior anchor) and the whole plan's `cells` buffer is
        rebuilt from the (possibly grown) rooms + the unmoved corridor/door cell lists, then BFS
        reachability is re-verified from scratch — never a hand-patched plan (same honest-fail
        discipline as U1). Corridors whose both endpoints share a >1.0 scaleDomain get width>=2 +
        heightScale; doors whose two rooms sit in DIFFERENT scaleDomains get transition:true +
        squeeze:true (squeeze = geometry/DM hand-wave per Adam's ruling — no sprite, no render
        work here).
     4. plan.domains[] — one {scale, segNums, transitions:[doorIdx]} per distinct scale group
        (residual human-scale 1.0 rooms get their own group too, unless an apex claim consumed
        every room, in which case only the one all-encompassing domain remains — the boundary
        math naturally yields zero transitions for it, no special-casing needed).

   DETERMINISM LAW: this module needs no RNG at all — every stage is a deterministic function of
   its (already-deterministic) inputs. No Math.random/Date.now anywhere in this file.

   Internal helpers are `dsm`-prefixed (mirrors `dsp`- in place-spatialize.js / `dwalk`- in
   dungeon-walk.js) so nothing here collides with another module's globals. */

// ─── stage 1: room roles ─────────────────────────────────────────────────────────────────────
function dsmBuildAdjacency(rooms, corridors) {
  const adj = {};
  rooms.forEach((r) => { adj[r.segNum] = new Set(); });
  corridors.forEach((c) => {
    if (adj[c.fromSeg] != null && adj[c.toSeg] != null) {
      adj[c.fromSeg].add(c.toSeg);
      adj[c.toSeg].add(c.fromSeg);
    }
  });
  return adj;
}

function dsmFindEntry(rooms) {
  return rooms.slice().sort((a, b) => a.depth - b.depth || a.segNum - b.segNum)[0];
}
function dsmFindFinale(rooms) {
  return rooms.find((r) => r.isFinale)
    || rooms.slice().sort((a, b) => b.depth - a.depth || a.segNum - b.segNum)[0];
}

// deterministic BFS shortest path entry->finale (sorted-neighbor traversal — same input always
// yields the same path). Falls back to just [entry] if the graph is disconnected (never invents
// a route that doesn't exist in the corridor graph).
function dsmCriticalPath(adj, entry, finale) {
  if (entry.segNum === finale.segNum) return [entry.segNum];
  const parent = {};
  const visited = new Set([entry.segNum]);
  const q = [entry.segNum];
  let head = 0;
  while (head < q.length) {
    const cur = q[head++];
    if (cur === finale.segNum) break;
    const nbrs = Array.from(adj[cur] || []).sort((a, b) => a - b);
    for (const nb of nbrs) {
      if (visited.has(nb)) continue;
      visited.add(nb); parent[nb] = cur; q.push(nb);
    }
  }
  if (!visited.has(finale.segNum)) return [entry.segNum];
  const path = [finale.segNum];
  let cur = finale.segNum;
  while (cur !== entry.segNum) { cur = parent[cur]; path.push(cur); }
  return path.reverse();
}

function dsmAssignRoles(rooms, adj, entry, finale, pathSet) {
  rooms.forEach((r) => {
    if (r.segNum === entry.segNum) { r.role = "entrance"; return; }
    if (r.segNum === finale.segNum) { r.role = "finale"; return; }
    if (pathSet.has(r.segNum)) { r.role = "path"; return; }
    const degree = (adj[r.segNum] || new Set()).size;
    r.role = degree <= 1 ? "pocket" : "side";
  });
}

// ─── stage 2: difficulty bands ───────────────────────────────────────────────────────────────
function dsmBandFor(depth, maxDepth) {
  if (depth <= 1) return "shallow"; // spec floor: depth 0-1 is always shallow
  if (maxDepth <= 0) return "shallow";
  const t1 = maxDepth / 3, t2 = (2 * maxDepth) / 3;
  if (depth <= t1) return "shallow";
  if (depth <= t2) return "mid";
  return "deep";
}
function dsmAssignBands(rooms) {
  const maxDepth = rooms.reduce((m, r) => Math.max(m, r.depth), 0);
  rooms.forEach((r) => { r.band = dsmBandFor(r.depth, maxDepth); });
  return maxDepth;
}

// ─── stage 3: scale domains ──────────────────────────────────────────────────────────────────
const DSM_ROLE_PATROLLABLE = new Set(["path", "side"]);

// patrol radius 1: the resident's own room + directly-adjacent path/side rooms only (never
// pockets/entrance/finale — those stay honest, human-scale beats even next to a lair).
function dsmLocalDomainSegNums(roomSegNum, adj, roleOf) {
  const set = new Set([roomSegNum]);
  Array.from(adj[roomSegNum] || []).forEach((nb) => {
    if (DSM_ROLE_PATROLLABLE.has(roleOf[nb])) set.add(nb);
  });
  return set;
}

// groups residents into { apexScale, domainsBySeg: Map<scale, Set<segNum>> } — law §2: only
// scaleVsHuman >= 2.0 claims a domain at all; apex:true + scaleVsHuman >= 4.0 claims everything.
function dsmBuildDomains(rooms, adj, roleOf, residents) {
  const roomBySeg = {}; rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
  let apexScale = null;
  const domainsBySeg = new Map();

  (residents || []).forEach((res) => {
    if (!res || res.segNum == null || !roomBySeg[res.segNum]) return;
    const scale = Number(res.scaleVsHuman);
    if (!Number.isFinite(scale) || scale < 2.0) return;
    if (res.apex && scale >= 4.0) {
      apexScale = apexScale == null ? scale : Math.max(apexScale, scale);
      return;
    }
    const segs = dsmLocalDomainSegNums(res.segNum, adj, roleOf);
    if (!domainsBySeg.has(scale)) domainsBySeg.set(scale, new Set());
    const set = domainsBySeg.get(scale);
    segs.forEach((s) => set.add(s));
  });

  if (apexScale != null) {
    const all = new Set(rooms.map((r) => r.segNum));
    const m = new Map(); m.set(apexScale, all);
    return { apexScale, domainsBySeg: m };
  }
  return { apexScale: null, domainsBySeg };
}

// full-cells rebuild from rooms + corridors[].cells + doors — used after any room regrowth.
// Rooms/corridor-cell coordinates are never renumbered, only the room rects grow, so this is a
// straight re-rasterize (same algorithm as place-spatialize.js's own carve/rasterize stage),
// not an incremental patch — honest, no partial-state drift.
function dsmRebuildCells(out) {
  let maxX = 0, maxY = 0;
  out.rooms.forEach((r) => { maxX = Math.max(maxX, r.x + r.w); maxY = Math.max(maxY, r.y + r.d); });
  out.corridors.forEach((c) => {
    (c.cells || []).forEach((cell) => { maxX = Math.max(maxX, cell.x + 1); maxY = Math.max(maxY, cell.y + 1); });
  });
  const cellW = maxX + 3, cellD = maxY + 3;
  const cells = new Uint8Array(cellW * cellD);
  const idx = (x, y) => y * cellW + x;

  out.rooms.forEach((r) => {
    for (let yy = r.y; yy < r.y + r.d; yy++) {
      for (let xx = r.x; xx < r.x + r.w; xx++) {
        if (xx >= 0 && yy >= 0 && xx < cellW && yy < cellD) cells[idx(xx, yy)] = SPATIAL_CELL.FLOOR;
      }
    }
  });
  out.corridors.forEach((c) => {
    (c.cells || []).forEach((cell) => {
      if (cell.x >= 0 && cell.y >= 0 && cell.x < cellW && cell.y < cellD) {
        if (cells[idx(cell.x, cell.y)] === SPATIAL_CELL.VOID) cells[idx(cell.x, cell.y)] = SPATIAL_CELL.FLOOR;
      }
    });
  });
  out.doors.forEach((d) => {
    if (d.x >= 0 && d.y >= 0 && d.x < cellW && d.y < cellD) cells[idx(d.x, d.y)] = SPATIAL_CELL.DOOR;
  });

  // rasterize: any VOID cell 8-adjacent to a passable (FLOOR/DOOR/WATER) cell becomes WALL.
  const passable = new Set([SPATIAL_CELL.FLOOR, SPATIAL_CELL.DOOR, SPATIAL_CELL.WATER]);
  const toWall = [];
  for (let y = 0; y < cellD; y++) {
    for (let x = 0; x < cellW; x++) {
      if (cells[idx(x, y)] !== SPATIAL_CELL.VOID) continue;
      let adjacent = false;
      for (let dy = -1; dy <= 1 && !adjacent; dy++) {
        for (let dx = -1; dx <= 1 && !adjacent; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= cellW || ny >= cellD) continue;
          if (passable.has(cells[idx(nx, ny)])) adjacent = true;
        }
      }
      if (adjacent) toWall.push(idx(x, y));
    }
  }
  toWall.forEach((i) => { cells[i] = SPATIAL_CELL.WALL; });

  out.cellW = cellW; out.cellD = cellD; out.cells = cells;
}

function dsmVerifyReachability(out) {
  const passable = new Set([SPATIAL_CELL.FLOOR, SPATIAL_CELL.DOOR, SPATIAL_CELL.WATER]);
  const entryRoom = out.rooms.find((r) => r.role === "entrance") || out.rooms[0];
  const idx = (x, y) => y * out.cellW + x;
  const sx = Math.min(out.cellW - 1, Math.max(0, entryRoom.x + Math.floor(entryRoom.w / 2)));
  const sy = Math.min(out.cellD - 1, Math.max(0, entryRoom.y + Math.floor(entryRoom.d / 2)));
  if (!passable.has(out.cells[idx(sx, sy)])) return { ok: false, unreachable: -1 };
  const seen = new Uint8Array(out.cellW * out.cellD);
  const q = [[sx, sy]]; seen[idx(sx, sy)] = 1; let head = 0;
  while (head < q.length) {
    const [cx, cy] = q[head++];
    for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
      if (nx < 0 || ny < 0 || nx >= out.cellW || ny >= out.cellD) continue;
      const ii = idx(nx, ny);
      if (seen[ii] || !passable.has(out.cells[ii])) continue;
      seen[ii] = 1; q.push([nx, ny]);
    }
  }
  let unreachable = 0;
  for (let i = 0; i < out.cells.length; i++) if (out.cells[i] === SPATIAL_CELL.FLOOR && !seen[i]) unreachable++;
  return { ok: unreachable === 0, unreachable };
}

// fit test (law §2): any room whose scaleDomain > 1.0 must have dims >= ceil(scale)+2 per axis,
// else it's a "prison" — GROW it (re-centered on its prior anchor, clamped >=0) and rebuild the
// whole plan's cells buffer + re-verify BFS reachability. Honest-fail if regrowth still leaves
// the plan unreachable (never a hand-patched plan).
function dsmFitTestAndGrow(out) {
  const needsGrowth = [];
  out.rooms.forEach((r) => {
    if (r.scaleDomain <= 1.0) return;
    const minDim = Math.ceil(r.scaleDomain) + 2;
    if (r.w < minDim || r.d < minDim) needsGrowth.push({ room: r, minDim });
  });
  if (!needsGrowth.length) return out;

  needsGrowth.forEach(({ room, minDim }) => {
    const newW = Math.max(room.w, minDim), newD = Math.max(room.d, minDim);
    const dw = newW - room.w, dd = newD - room.d;
    room.x = Math.max(0, room.x - Math.floor(dw / 2));
    room.y = Math.max(0, room.y - Math.floor(dd / 2));
    room.w = newW; room.d = newD;
  });

  dsmFitTestAndGrow_rebuild(out); // GROWTH-APPLY: rebuild cells + re-verify BFS (mutation-test seam below)
  return out;
}
// split into its own named step so the mutation-test harness can neutralize JUST the
// rebuild+re-verify call (dev/verify-dungeon-semantics.mjs greps for `dsmFitTestAndGrow(out)`
// itself, so this helper keeps the room-growth loop above intact and only disables the
// rebuild/re-verify half when mutated — either way the harness's OWN independent fit-test check
// (never trusting this module) is what actually proves the prison case gets caught).
function dsmFitTestAndGrow_rebuild(out) {
  dsmRebuildCells(out);
  const reach = dsmVerifyReachability(out);
  if (!reach.ok) {
    throw new Error(`semanticizePlan: BFS unreachable after scale-domain regrowth (${reach.unreachable} FLOOR cells unreached)`);
  }
}

/** semanticizePlan(plan, segments, residents) → extended SpatialPlan (docs/DUNGEON-GRAPH.md
 *  "Shared data shape" + U2 fields: room.role/room.band/room.scaleDomain, corridor.heightScale,
 *  door.transition/door.squeeze/door.heightScale, plan.domains[]). `plan` is U1's
 *  spatializePlan() output; `segments` is the walk's segment array (kept for parity with the
 *  spec's stated input shape — see header); `residents` is the optional
 *  [{segNum, sizeBand, scaleVsHuman, apex}] array. Never mutates `plan`. */
function semanticizePlan(plan, segments, residents) {
  if (!plan || !Array.isArray(plan.rooms) || !plan.rooms.length) {
    throw new Error("semanticizePlan: plan.rooms[] is required and must be non-empty");
  }
  if (!Array.isArray(plan.corridors) || !Array.isArray(plan.doors)) {
    throw new Error("semanticizePlan: plan.corridors[]/plan.doors[] are required (spatializePlan output expected)");
  }

  // clone — never mutate the caller's plan (engine-layer purity/determinism discipline).
  const rooms = plan.rooms.map((r) => Object.assign({}, r, { role: null, band: null, scaleDomain: 1.0 }));
  const corridors = plan.corridors.map((c) => Object.assign({}, c, {
    cells: (c.cells || []).map((p) => ({ x: p.x, y: p.y })),
    heightScale: 1.0,
  }));
  const doors = plan.doors.map((d) => Object.assign({}, d, { transition: false, squeeze: false }));
  const out = Object.assign({}, plan, { rooms, corridors, doors, cells: plan.cells.slice() });

  // ── stage 1: roles ──
  const adj = dsmBuildAdjacency(rooms, corridors);
  const entry = dsmFindEntry(rooms);
  const finale = dsmFindFinale(rooms);
  const pathSegNums = dsmCriticalPath(adj, entry, finale);
  const pathSet = new Set(pathSegNums);
  dsmAssignRoles(rooms, adj, entry, finale, pathSet);
  const roleOf = {}; rooms.forEach((r) => { roleOf[r.segNum] = r.role; });

  // ── stage 2: bands (+ monotone-along-critical-path assertion, honest-fail on regression) ──
  dsmAssignBands(rooms);
  const roomBySeg = {}; rooms.forEach((r) => { roomBySeg[r.segNum] = r; });
  const BAND_RANK = { shallow: 0, mid: 1, deep: 2 };
  for (let i = 1; i < pathSegNums.length; i++) {
    const prevRoom = roomBySeg[pathSegNums[i - 1]], curRoom = roomBySeg[pathSegNums[i]];
    if (BAND_RANK[curRoom.band] < BAND_RANK[prevRoom.band]) {
      throw new Error(`semanticizePlan: band regression along critical path at segNum ${curRoom.segNum} (${prevRoom.band} -> ${curRoom.band})`);
    }
  }

  // ── stage 3: scale domains + fit test ──
  const { apexScale, domainsBySeg } = dsmBuildDomains(rooms, adj, roleOf, residents);
  domainsBySeg.forEach((segSet, scale) => {
    segSet.forEach((segNum) => {
      const r = roomBySeg[segNum];
      if (r) r.scaleDomain = Math.max(r.scaleDomain, scale);
    });
  });

  dsmFitTestAndGrow(out); // FIT-TEST-CALL-SITE — rooms/out.rooms share references — mutates dims + rebuilds out.cells/cellW/cellD

  // corridors inside a domain (both endpoints share the same >1.0 scaleDomain) get width>=2 + heightScale
  corridors.forEach((c) => {
    const ra = roomBySeg[c.fromSeg], rb = roomBySeg[c.toSeg];
    if (!ra || !rb) return;
    if (ra.scaleDomain > 1.0 && rb.scaleDomain > 1.0) {
      const scale = Math.min(ra.scaleDomain, rb.scaleDomain);
      c.width = Math.max(c.width, 2);
      c.heightScale = scale;
    }
  });

  // transition doors — the domain boundary: the two rooms a door sits between have differing
  // scaleDomain. squeeze = geometry/DM hand-wave per Adam's ruling (no sprite/render work here).
  doors.forEach((d) => {
    const segs = d.betweenSegs || [];
    const ra = roomBySeg[segs[0]], rb = roomBySeg[segs[1]];
    if (!ra || !rb) return;
    if (ra.scaleDomain !== rb.scaleDomain) {
      d.transition = true;
      d.squeeze = true;
      d.heightScale = Math.max(ra.scaleDomain, rb.scaleDomain);
    } else if (ra.scaleDomain > 1.0) {
      d.heightScale = ra.scaleDomain;
    }
  });

  // ── stage 4: plan.domains[] — always includes the residual 1.0 human domain (unless an apex
  // claim consumed every room). transitions are re-derived generically from the boundary math —
  // this naturally yields zero transitions for an apex's all-rooms domain, no special-casing. ──
  const domainDescriptors = [];
  if (apexScale != null) {
    domainDescriptors.push({ scale: apexScale, segNums: new Set(rooms.map((r) => r.segNum)) });
  } else {
    domainsBySeg.forEach((segSet, scale) => { domainDescriptors.push({ scale, segNums: new Set(segSet) }); });
    const claimed = new Set();
    domainDescriptors.forEach((dd) => dd.segNums.forEach((s) => claimed.add(s)));
    const residual = rooms.map((r) => r.segNum).filter((s) => !claimed.has(s));
    if (residual.length) domainDescriptors.push({ scale: 1.0, segNums: new Set(residual) });
  }
  out.domains = domainDescriptors.map((dd) => {
    const transitions = [];
    doors.forEach((d, di) => {
      const segs = d.betweenSegs || [];
      const aIn = dd.segNums.has(segs[0]), bIn = dd.segNums.has(segs[1]);
      if (aIn !== bIn) transitions.push(di);
    });
    return { scale: dd.scale, segNums: Array.from(dd.segNums), transitions };
  });

  return out;
}
