/* GENESIS MODULE — src/engine/room-grammar.js
   docs/STAGE-D-WAVE-SPECS.md D3 (Placement grammar) = docs/ROOM-GRAMMAR.md promoted into
   BEAUTY-WAVE-5.md unit IA-3. applyRoomGrammar(plan, opts) -> a shallow clone of a
   bindWalkInteractables() output (src/engine/walk-interactables.js, D2) whose plan.interactables[]
   entries are REFINED in place (same array length/contents, only {x,y,reserve,lightAffine} may
   change) — "the roll owns the nouns; the GRAMMAR owns the arrangement" (ROOM-GRAMMAR.md's own
   law). D2 already picked WHICH cell each entry lands on via an independent seeded pick per room;
   this module composes those picks into a deliberate arrangement using the 5 primitives below,
   applied in a fixed order, CLEAR always last (it vetoes everything the earlier primitives did).

   §1 THE PRIMITIVES (docs/ROOM-GRAMMAR.md §1, scoped to this repo's real 8-archetype roster —
   door/chest/lever/shrine/campfire/trap/portal/container, data/interactables.js's own
   INTERACTABLE_ARCHETYPE_STATES keys; there is no separate "torch" interactable archetype, torches
   are place-dressing.js's own light-prop roster, out of this module's scope):
     - ALIGN   — `lever` (the one wall-location archetype FOCAL doesn't already own) snaps to the
       CENTER of the wall run it's already adjacent to (D2 already guarantees wall-adjacency via its
       own `location` lookup; ALIGN turns "some wall-adjacent cell" into "flush/centered on that
       wall segment").
     - PAIR/FLANK — when a room's TWO entries share a light-affine archetype (campfire, this repo's
       only light-affine interactable per D1), mirror them across the room's door axis (braziers
       flanking a door, ROOM-GRAMMAR.md §2). Requires a door cell to define the axis; degrades to a
       no-op (leaves the pair where D2 put it) when the room has none, or when the door sits in a
       corner (axis ambiguous — same "never a bad guess" discipline as D1/D2's own honest gaps).
     - FOCAL — `shrine`/`portal` move to the room's own composition anchor: the room's `dais`
       terrain patch (place-spatialize.js's Stage-C `room.terrain=[{cells,tier,kind}]`, C2) when one
       exists, else a back-wall-bias cell (the wall-adjacent floor cell FARTHEST from every door,
       Manhattan distance — an approximation of "the far wall", the same kind of stand-in
       place-distribution.js's own door-apron formula already normalizes as this data layer's honest
       ceiling on room-geometry awareness).
     - RHYTHM — any OTHER same-archetype group of 2+ entries in a room (a fixture with 3+ chests,
       say — the common real case of 2 archetypes per room rarely repeats, this exists for when it
       does) spread at a uniform cadence along whichever wall run (or the general floor pool,
       absent one) can hold the whole group, so consecutive entries sit an equal number of cells
       apart — "no orphan gap" (ROOM-GRAMMAR.md §1). Degrades to a no-op (leaves entries at their D2
       cells) when the room's free-cell pool is smaller than the group or produces a same-cell
       collision under uniform sampling.
     - CLEAR — runs LAST, vetoes everything above: any non-door entry whose current cell falls
       inside this room's CLEAR set (its center 2x2 `dpCenter2x2` + every DOOR cell + that door's own
       floor "apron" cell, mirroring place-distribution.js's `pldDoorApronCells` stand-in for a real
       door-swing-arc model — this data layer has no aisle/swing-arc model either, same documented
       ceiling) gets RELOCATED to the nearest still-legal, still-unoccupied cell (wall-adjacent cells
       preferred for wall-family archetypes) — never deleted. No legal cell anywhere in the room ->
       the entry degrades to `reserve:true, x:null, y:null` (Law 5's "staging reserve, never a
       discard lane", same vocabulary D2 already uses for budget overflow), never an overlap.
     The `door` archetype is NEVER touched by any primitive (it is a structural fact of the room
     graph, not a composition choice — same law D2's own header keeps) and is EXCLUDED from every
     room's occupied-cell set the other primitives search around, exactly as D2 already treats it.

   §2 LIGHT-AFFINE STAMP: `campfire` entries are stamped `lightAffine:true` (mirroring
   place-dressing.js's own plan.dressing[] convention, `entry.lightAffine` truthy — see
   src/engine/theater-data.js's own `dressedPlan.dressing.filter(d=>d&&d.lightAffine)` practical-
   seeding read) so a FUTURE render pass that walks plan.interactables[] for real light sources
   the same way it already walks plan.dressing[] needs zero new wiring. This module does NOT touch
   any render/mount code itself (out of scope — D4).

   §3 DETERMINISM: pure function of (plan, opts) — never mutates plan/plan.interactables (every
   entry is shallow-cloned before this module ever assigns to it). Ties among otherwise-equal legal
   cells (CLEAR's relocation target, FOCAL's back-wall-bias pick) resolve via an INDEPENDENT
   dspMulberry32 stream seeded off "room-grammar:v1:"+fingerprint+":"+roomSegNum+":"+sourceRef+":"+
   tag (mirrors walk-interactables.js's/place-distribution.js's own seed-formula convention
   verbatim, off engine.place-spatialize's shared dspHashStr/dspMulberry32 globals) — never
   Math.random, never an ordinal-dependent shared stream. Every other choice (ALIGN's wall-run
   center, RHYTHM's cadence, FOCAL's dais centroid / farthest-wall pick) is fully geometric —
   sorted by (y,x) before any reduction — so it needs no seed at all; ties are the ONLY place
   randomness could enter, and those are the only places this module ever calls the RNG.

   §4 EMPTY-INPUT LAW: a plan with no `.interactables[]` at all (or an empty one) returns THE SAME
   `plan` reference, untouched — dev/verify-room-grammar.mjs's own byte-proof that landing this
   module changes nothing for every walk built before D2/D3 existed. Absent room geometry
   (`plan.rooms`/`plan.cells`) degrades the same way D2 does: never throws, entries whose room can't
   be found are left exactly as D2 placed them. */

"use strict";

// mirror-safety net ONLY for when walk-interactables.js's own WI_LOCATION_FALLBACK (or the D1
// registry it prefers) is absent from this load — see this module's own header §3 "never throws"
// law. Location is realm-invariant (walk-interactables.js's own comment), so a fixed per-archetype
// table is safe to keep as a second-line fallback here too.
const ROOM_GRAMMAR_LOCATION_FALLBACK = Object.freeze({
  door: "door-cell", lever: "wall", shrine: "wall", portal: "wall",
  campfire: "floor", chest: "floor", container: "floor", trap: "floor",
});
const ROOM_GRAMMAR_LIGHT_AFFINE = Object.freeze(["campfire"]);
const ROOM_GRAMMAR_ALIGN_ARCHETYPES = Object.freeze(["lever"]);
const ROOM_GRAMMAR_FOCAL_ARCHETYPES = Object.freeze(["shrine", "portal"]);

function rgLocationFor(archetype) {
  if (typeof WI_LOCATION_FALLBACK !== "undefined" && WI_LOCATION_FALLBACK && WI_LOCATION_FALLBACK[archetype]) {
    return WI_LOCATION_FALLBACK[archetype];
  }
  return ROOM_GRAMMAR_LOCATION_FALLBACK[archetype] || "floor";
}
function rgIsWallFamily(archetype) {
  return rgLocationFor(archetype) === "wall";
}

function rgSeed(fingerprint, segNum, sourceRef, tag) {
  return dspHashStr("room-grammar:v1:" + fingerprint + ":" + segNum + ":" + sourceRef + ":" + tag);
}

// ─── room-geometry helpers — reuse place-dressing.js's globals when present, same defensive-
// fallback discipline walk-interactables.js/place-distribution.js already keep (ENGINE PURITY LAW
// is engine->ui, not engine-to-engine reuse).
function rgRoomFloorCells(room, plan) {
  if (typeof dpRoomFloorCells === "function") return dpRoomFloorCells(room, plan);
  const cells = [];
  for (let yy = room.y; yy < room.y + room.d; yy++) {
    for (let xx = room.x; xx < room.x + room.w; xx++) {
      if (xx < 0 || yy < 0 || xx >= plan.cellW || yy >= plan.cellD) continue;
      if (plan.cells[yy * plan.cellW + xx] === SPATIAL_CELL.FLOOR) cells.push({ x: xx, y: yy });
    }
  }
  return cells;
}
function rgAdjacentToWall(x, y, plan) {
  if (typeof dpAdjacentToWall === "function") return dpAdjacentToWall(x, y, plan);
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return deltas.some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return false;
    return plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.WALL;
  });
}
function rgCenter2x2(room) {
  if (typeof dpCenter2x2 === "function") return dpCenter2x2(room);
  const set = new Set();
  const cx0 = room.x + Math.max(0, Math.floor((room.w - 2) / 2));
  const cy0 = room.y + Math.max(0, Math.floor((room.d - 2) / 2));
  for (let dx = 0; dx < 2; dx++) {
    for (let dy = 0; dy < 2; dy++) {
      const xx = cx0 + dx, yy = cy0 + dy;
      if (xx < room.x + room.w && yy < room.y + room.d) set.add(xx + "," + yy);
    }
  }
  return set;
}
function rgRoomDoorCells(room, plan) {
  if (!plan || !Array.isArray(plan.doors)) return [];
  return plan.doors
    .filter((d) => d && Array.isArray(d.betweenSegs) && d.betweenSegs.indexOf(room.segNum) >= 0)
    .map((d) => ({ x: d.x, y: d.y }));
}
// door-swing stand-in (mirrors place-distribution.js's pldDoorApronCells verbatim): a DOOR cell
// plus its own FLOOR neighbor(s) — the nearest this data layer gets to a real swing-arc model.
function rgDoorApronCells(room, plan) {
  const out = new Set();
  rgRoomDoorCells(room, plan).forEach((d) => {
    out.add(d.x + "," + d.y);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = d.x + dx, ny = d.y + dy;
      if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return;
      if (plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.FLOOR) out.add(nx + "," + ny);
    });
  });
  return out;
}
// this room's CLEAR set (ROOM-GRAMMAR.md §1: "door swing cells, aisle cells, and center 2x2" —
// this data layer has no separate aisle/occupant model, same honest ceiling place-distribution.js
// already documents, so CLEAR here is center2x2 UNION door-cell UNION door-apron).
function rgClearSet(room, plan) {
  const set = new Set();
  rgCenter2x2(room).forEach((k) => set.add(k));
  rgDoorApronCells(room, plan).forEach((k) => set.add(k));
  return set;
}
// which of the room's 4 sides (if any) is (x,y) adjacent to a WALL cell on — fixed N/S/E/W check
// order for determinism (a corner cell adjacent to two walls always resolves the same side).
function rgWallSide(x, y, plan) {
  const dirs = [["N", 0, -1], ["S", 0, 1], ["E", 1, 0], ["W", -1, 0]];
  for (let i = 0; i < dirs.length; i++) {
    const nx = x + dirs[i][1], ny = y + dirs[i][2];
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) continue;
    if (plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.WALL) return dirs[i][0];
  }
  return null;
}

// nearest still-legal, still-unoccupied cell to (tx,ty) among `pool` (Manhattan distance, sorted
// (y,x) before reduction for a stable first-encountered winner); a genuine multi-cell tie resolves
// via the seeded stream `seedFn()` supplies (dspHashStr+dspMulberry32, §3) — never Math.random.
function rgNearestLegalCell(tx, ty, pool, occupied, seedFn) {
  const free = pool.filter((c) => !occupied.has(c.x + "," + c.y)).slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
  if (!free.length) return null;
  let bestDist = Infinity;
  free.forEach((c) => { const d = Math.abs(c.x - tx) + Math.abs(c.y - ty); if (d < bestDist) bestDist = d; });
  const tied = free.filter((c) => (Math.abs(c.x - tx) + Math.abs(c.y - ty)) === bestDist);
  if (tied.length === 1 || typeof seedFn !== "function") return tied[0];
  const rng = dspMulberry32(seedFn());
  return tied[Math.floor(rng() * tied.length) % tied.length];
}

// ─── ALIGN — snap a lever entry to the CENTER of the wall run it's already adjacent to.
function rgAlignToWallCenter(x, y, room, plan, legalFloor, occupied) {
  const side = rgWallSide(x, y, plan);
  if (!side) return null;
  const alongY = (side === "N" || side === "S");
  const run = legalFloor.filter((c) => rgWallSide(c.x, c.y, plan) === side && (alongY ? c.y === y : c.x === x));
  const free = run.filter((c) => !occupied.has(c.x + "," + c.y) || (c.x === x && c.y === y));
  if (free.length <= 1) return null; // nothing to align against — leave the entry where D2 put it
  const coordOf = (c) => (alongY ? c.x : c.y);
  const coords = free.map(coordOf);
  const mid = (Math.min.apply(null, coords) + Math.max.apply(null, coords)) / 2;
  const sorted = free.slice().sort((a, b) => Math.abs(coordOf(a) - mid) - Math.abs(coordOf(b) - mid) || (a.y - b.y) || (a.x - b.x));
  return sorted[0];
}

// ─── PAIR/FLANK — mirror two light-affine entries across the room's door axis.
function rgMirrorPairAcrossDoorAxis(group, out, room, plan, legalFloor, occupied, fingerprint) {
  const doorCells = rgRoomDoorCells(room, plan);
  if (doorCells.length !== 1) return null; // ambiguous/absent axis -> degrade, no mirror attempted
  const doorCell = doorCells[0];
  const onNS = (doorCell.y === room.y || doorCell.y === room.y + room.d - 1);
  const onEW = (doorCell.x === room.x || doorCell.x === room.x + room.w - 1);
  const e1 = group[0], e2 = group[1];
  const p1 = { x: out[e1].x, y: out[e1].y }, p2 = { x: out[e2].x, y: out[e2].y };
  let target1, target2;
  if (onNS && !onEW) {
    const sharedY = Math.round((p1.y + p2.y) / 2);
    const offset = Math.max(1, Math.round((Math.abs(p1.x - doorCell.x) + Math.abs(p2.x - doorCell.x)) / 2));
    target1 = { x: doorCell.x - offset, y: sharedY };
    target2 = { x: doorCell.x + offset, y: sharedY };
  } else if (onEW) {
    const sharedX = Math.round((p1.x + p2.x) / 2);
    const offset = Math.max(1, Math.round((Math.abs(p1.y - doorCell.y) + Math.abs(p2.y - doorCell.y)) / 2));
    target1 = { x: sharedX, y: doorCell.y - offset };
    target2 = { x: sharedX, y: doorCell.y + offset };
  } else {
    return null; // corner door — axis ambiguous, never a bad guess
  }
  const c1 = rgNearestLegalCell(target1.x, target1.y, legalFloor, occupied, () => rgSeed(fingerprint, room.segNum, out[e1].sourceRef, "pair"));
  if (!c1) return null;
  const occupiedPlusC1 = new Set(occupied); occupiedPlusC1.add(c1.x + "," + c1.y);
  const c2 = rgNearestLegalCell(target2.x, target2.y, legalFloor, occupiedPlusC1, () => rgSeed(fingerprint, room.segNum, out[e2].sourceRef, "pair"));
  if (!c2) return null;
  return [c1, c2];
}

// ─── FOCAL — shrine/portal to the room's dais (centroid) when one exists, else the wall-adjacent
// floor cell FARTHEST (Manhattan) from every door cell (back-wall bias).
function rgFocalCell(entry, room, plan, legalFloor, occupied, fingerprint) {
  const dais = Array.isArray(room.terrain) ? room.terrain.find((t) => t && t.kind === "dais") : null;
  if (dais && Array.isArray(dais.cells) && dais.cells.length) {
    const cx = dais.cells.reduce((s, c) => s + c.x, 0) / dais.cells.length;
    const cy = dais.cells.reduce((s, c) => s + c.y, 0) / dais.cells.length;
    return rgNearestLegalCell(cx, cy, legalFloor, occupied, () => rgSeed(fingerprint, room.segNum, entry.sourceRef, "focal-dais"));
  }
  const doorCells = rgRoomDoorCells(room, plan);
  const wallAdjacent = legalFloor.filter((c) => rgAdjacentToWall(c.x, c.y, plan) && !occupied.has(c.x + "," + c.y));
  const pool = wallAdjacent.length ? wallAdjacent : legalFloor.filter((c) => !occupied.has(c.x + "," + c.y));
  if (!pool.length) return null;
  const sorted = pool.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
  let best = null, bestDist = -1;
  sorted.forEach((c) => {
    const d = doorCells.length ? Math.min.apply(null, doorCells.map((dc) => Math.abs(dc.x - c.x) + Math.abs(dc.y - c.y))) : 0;
    if (d > bestDist) { bestDist = d; best = c; }
  });
  return best;
}

// ─── RHYTHM — spread a same-archetype group (size>=2) at a uniform cadence along one wall run
// (preferred) or the general free-floor pool. Returns null (degrade, leave entries as-is) when the
// free pool can't hold the whole group or uniform sampling would collide two picks onto one cell.
function rgRhythmCells(count, room, plan, legalFloor, occupied) {
  const free = legalFloor.filter((c) => !occupied.has(c.x + "," + c.y));
  if (free.length < count) return null;
  const bySide = {};
  free.forEach((c) => {
    const side = rgWallSide(c.x, c.y, plan);
    if (side) (bySide[side] = bySide[side] || []).push(c);
  });
  let pool = null;
  Object.keys(bySide).sort().forEach((side) => {
    if (bySide[side].length >= count && (!pool || bySide[side].length > pool.length)) pool = bySide[side];
  });
  if (!pool) pool = free;
  const xs = pool.map((c) => c.x), ys = pool.map((c) => c.y);
  const spreadX = Math.max.apply(null, xs) - Math.min.apply(null, xs);
  const spreadY = Math.max.apply(null, ys) - Math.min.apply(null, ys);
  const sorted = pool.slice().sort((a, b) => (spreadX >= spreadY ? ((a.x - b.x) || (a.y - b.y)) : ((a.y - b.y) || (a.x - b.x))));
  if (sorted.length === count) return sorted;
  const picks = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.round(i * (sorted.length - 1) / (count - 1));
    picks.push(sorted[idx]);
  }
  const seen = new Set();
  for (let i = 0; i < picks.length; i++) {
    const key = picks[i].x + "," + picks[i].y;
    if (seen.has(key)) return null; // uniform sampling collided on a short pool -> degrade
    seen.add(key);
  }
  return picks;
}

/** applyRoomGrammar(plan, opts) -> a shallow clone of `plan` whose `.interactables[]` entries have
 * had ALIGN -> PAIR/FLANK -> FOCAL -> RHYTHM -> CLEAR (last) applied, room by room. `plan` is a
 * bindWalkInteractables() output (plan.interactables[], plan.rooms[], plan.cells, plan.doors[]).
 * `opts`: { walkId } — same fingerprint convention D2/place-distribution use for their own seeded
 * streams (falls back to plan.seed). Pure: never mutates plan/plan.interactables; a plan with no
 * (or an empty) `.interactables[]` returns the SAME `plan` reference, untouched (§4). */
function applyRoomGrammar(plan, opts) {
  opts = opts || {};
  if (!plan || !Array.isArray(plan.interactables) || !plan.interactables.length) return plan;
  if (!Array.isArray(plan.rooms) || !plan.cells) return Object.assign({}, plan);

  const fingerprint = opts.walkId != null ? String(opts.walkId) : String(plan.seed || "");
  const roomBySeg = {};
  plan.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });

  const byRoom = {};
  plan.interactables.forEach((e, idx) => {
    (byRoom[e.roomSegNum] = byRoom[e.roomSegNum] || []).push(idx);
  });

  const out = plan.interactables.map((e) => Object.assign({}, e));

  Object.keys(byRoom).forEach((segKey) => {
    const room = roomBySeg[segKey];
    const idxs = byRoom[segKey];

    idxs.forEach((i) => {
      if (ROOM_GRAMMAR_LIGHT_AFFINE.indexOf(out[i].archetype) >= 0) out[i].lightAffine = true;
    });

    if (!room) return; // no room geometry for this segNum -> leave positions exactly as D2 set them

    const doorIdxs = idxs.filter((i) => out[i].archetype === "door");
    const placeableIdxs = idxs.filter((i) => out[i].archetype !== "door" && !out[i].reserve && Number.isFinite(out[i].x) && Number.isFinite(out[i].y));
    if (!placeableIdxs.length) return;

    const occupied = new Set();
    doorIdxs.forEach((i) => occupied.add(out[i].x + "," + out[i].y));
    placeableIdxs.forEach((i) => occupied.add(out[i].x + "," + out[i].y));
    function moveTo(i, cell) {
      occupied.delete(out[i].x + "," + out[i].y);
      out[i].x = cell.x; out[i].y = cell.y;
      occupied.add(cell.x + "," + cell.y);
    }

    const clearSet = rgClearSet(room, plan);
    const allFloor = rgRoomFloorCells(room, plan);
    const legalFloor = allFloor.filter((c) => !clearSet.has(c.x + "," + c.y));

    // ---- ALIGN ----
    placeableIdxs.forEach((i) => {
      if (ROOM_GRAMMAR_ALIGN_ARCHETYPES.indexOf(out[i].archetype) < 0) return;
      const cell = rgAlignToWallCenter(out[i].x, out[i].y, room, plan, legalFloor, occupied);
      if (cell) moveTo(i, cell);
    });

    // ---- PAIR/FLANK ---- (a group's OWN current cells are freed first — they're legitimate
    // candidates for the group's own new arrangement, not "occupied by someone else"; restored if
    // the primitive degrades to a no-op so nothing is lost)
    const byArchetype = {};
    placeableIdxs.forEach((i) => { (byArchetype[out[i].archetype] = byArchetype[out[i].archetype] || []).push(i); });
    const pairHandled = {};
    Object.keys(byArchetype).forEach((arch) => {
      const group = byArchetype[arch];
      if (group.length === 2 && ROOM_GRAMMAR_LIGHT_AFFINE.indexOf(arch) >= 0) {
        const saved = group.map((i) => out[i].x + "," + out[i].y);
        saved.forEach((k) => occupied.delete(k));
        const mirrored = rgMirrorPairAcrossDoorAxis(group, out, room, plan, legalFloor, occupied, fingerprint);
        if (mirrored) {
          moveTo(group[0], mirrored[0]);
          moveTo(group[1], mirrored[1]);
          pairHandled[arch] = true;
        } else {
          saved.forEach((k) => occupied.add(k));
        }
      }
    });

    // ---- FOCAL ---- (same self-free/self-restore discipline as PAIR/FLANK above)
    placeableIdxs.forEach((i) => {
      if (ROOM_GRAMMAR_FOCAL_ARCHETYPES.indexOf(out[i].archetype) < 0) return;
      const savedKey = out[i].x + "," + out[i].y;
      occupied.delete(savedKey);
      const cell = rgFocalCell(out[i], room, plan, legalFloor, occupied, fingerprint);
      if (cell) moveTo(i, cell); else occupied.add(savedKey);
    });

    // ---- RHYTHM (any remaining same-archetype group of 2+, not already PAIR-handled) ----
    Object.keys(byArchetype).forEach((arch) => {
      const group = byArchetype[arch];
      if (group.length < 2 || pairHandled[arch]) return;
      const saved = group.map((i) => out[i].x + "," + out[i].y);
      saved.forEach((k) => occupied.delete(k));
      const cadenced = rgRhythmCells(group.length, room, plan, legalFloor, occupied);
      if (cadenced && cadenced.length === group.length) {
        group.forEach((i, gi) => moveTo(i, cadenced[gi]));
      } else {
        saved.forEach((k) => occupied.add(k));
      }
    });

    // ---- CLEAR (last — vetoes everything above) ----
    placeableIdxs.forEach((i) => {
      const key = out[i].x + "," + out[i].y;
      if (!clearSet.has(key)) return;
      occupied.delete(key);
      const wallPool = rgIsWallFamily(out[i].archetype) ? legalFloor.filter((c) => rgAdjacentToWall(c.x, c.y, plan)) : null;
      const pool = (wallPool && wallPool.length) ? wallPool : legalFloor;
      const replacement = rgNearestLegalCell(out[i].x, out[i].y, pool, occupied, () => rgSeed(fingerprint, room.segNum, out[i].sourceRef, "clear"));
      if (replacement) {
        out[i].x = replacement.x; out[i].y = replacement.y;
        occupied.add(replacement.x + "," + replacement.y);
      } else {
        out[i].x = null; out[i].y = null; out[i].reserve = true; // never overlap, never delete
      }
    });
  });

  return Object.assign({}, plan, { interactables: out });
}

// ─── ES-module bridge (mirrors walk-interactables.js's own convention: top-level `const` never
// auto-attaches to `window`; a sealed ES-module scope can only reach in via `window.`) ───────────
window.applyRoomGrammar = applyRoomGrammar;
