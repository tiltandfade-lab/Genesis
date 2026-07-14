/* GENESIS MODULE — src/engine/place-distribution.js — PHASE-3-WAVE-1-SPECS.md unit P3-1a
   (GP-3a Poisson `place-distribution.js`), source of truth docs/GRAPHICS-PRODUCTION-RESEARCH-
   WAVE.md §6 (R5: Poisson visual realization). Classic <script> (shared global scope) — pure
   engine-layer DATA code, no THREE/canvas/DOM, no Math.random/Date.now (ENGINE PURITY LAW, same
   discipline src/engine/place-dressing.js's own header keeps).

   placeDistribute(dressedPlan, opts) is a seeded realization pass that runs AFTER dressPlan +
   projected-canonical-card concatenation are frozen (the seam this unit's spec pins to
   src/engine/theater-data.js's trayFrom, right after the `projectedDressing` concat block and
   right before `interiorBuildBoard`). At that point nouns, counts, source refs, home rooms,
   canonical anchors, and overloaded-room decisions are already decided — this pass may ONLY
   reposition already-selected INCIDENTAL FILLER dressing inside its own room's legal region. It
   may never move a canonical anchor, add/remove a dressing entry, or consume the noun-selection
   RNG stream (it runs its own independent seeded stream per entry, per §6.1's exact seed formula).

   Eligibility (spec's own contract, "when in doubt, LEAVE IT"): an entry is eligible for
   repositioning iff `entry.primary === "floor"` — dpPlaceRoom's own filler/seam-softening output
   (src/engine/place-dressing.js) and trayFrom's own non-centerpiece projected cards both tag
   incidental floor dressing this way. Every other primary (`focal`, `setPiece`, `blocker`,
   `wall-hang`, `light`) is a canonical/functional anchor and is NEVER touched — copied through
   byte-identical, including its `{x,y}`.

   Legal region (§6.2): this room's own FLOOR cells, minus the room's generic center 2x2 CLEAR
   (dpCenter2x2 — engine.place-dressing's own global, reused rather than reimplemented: ENGINE
   PURITY LAW is about src/engine/* never reaching into src/ui/*, not about two engine files
   sharing a formula), minus this room's column cell if the independent column-formula rolls one
   this seed (dpRoomColumnCell, same reuse), minus every cell an anchor (non-eligible) dressing
   entry already occupies, minus every DOOR cell and its immediate floor-side "apron" cell (the
   one FLOOR neighbor of a DOOR cell, standing in for "swing cells" — this data layer has no swing-
   arc/aisle/combat-occupant model to subtract more precisely than that; per the spec's own "if room
   geometry needed is not on dressedPlan here, degrade to leaving the entry at its input position"
   rule, anything this file cannot see (template aisles, focal approaches, live combat occupants)
   is simply not modeled — the fallback-to-input-position path covers the gap safely). A cell whose
   erosion margin (half the object's footprint radius + 0.08 cell) would require pulling more than
   0.08 cell away from a WALL neighbor is also excluded — see plDistErodeMargin below.

   Determinism: every realized entry seeds its own independent mulberry32 stream off the exact
   string PLD_SEED_PREFIX+walkId+":"+roomSegNum+":"+(sourceRef||slug+":"+originalOrdinal) (§6.1,
   verbatim) — reusing engine.place-spatialize's dspHashStr/dspMulberry32 globals (already loaded
   before this file — see manifest.json loadOrder / genesis.html script order: place-spatialize.js
   -> place-semantics.js -> place-dressing.js -> place-distribution.js -> theater-data.js). Adding
   one unrelated card anywhere else can never perturb an already-seeded entry's own draw (no shared
   stream, no ordinal dependency beyond that entry's OWN room+identity).

   ROOM_PLACE_DISTRIBUTE (module-level const, default false) is the legacy/oss-style staging flag:
   OFF keeps every render byte-identical to pre-this-unit (placeDistribute degrades to an identity
   clone when its caller doesn't even check the flag, and the caller in theater-data.js guards the
   call on this flag before ever invoking it) — mirrors ROOM_SHELL_POLYGON_KERNEL's legacy/oss
   staging discipline (src/ui/theater-room-mesh.js's own header note). Flipping it ON in production
   is explicitly OUT OF SCOPE for this unit (a separate follow-up flip, per the spec). */

// MUTATION-TESTABLE GUARD (dev/verify-place-distribution.mjs check 8 + its RED-FIRST proof):
// default false = identity/byte-stable production behavior. A follow-up unit flips this once the
// realization pass has been reviewed live; this unit only builds + proves the pass, never flips it.
const ROOM_PLACE_DISTRIBUTE = false;

// size-class -> minimum clearance radius, in cell units (spec's own suggested minima). "increased
// by footprint" per the spec — this data layer has no separate footprint metadata beyond cardKind,
// so cardKind (small/medium/large) IS the footprint proxy; an unknown/absent cardKind falls back to
// medium (never throws, never silently zero-radius).
const PLD_MIN_RADIUS_BY_SIZE = Object.freeze({ small: 0.28, medium: 0.42, large: 0.70 });
const PLD_DEFAULT_RADIUS = PLD_MIN_RADIUS_BY_SIZE.medium;
function pldRadiusFor(cardKind) {
  return PLD_MIN_RADIUS_BY_SIZE[cardKind] != null ? PLD_MIN_RADIUS_BY_SIZE[cardKind] : PLD_DEFAULT_RADIUS;
}

// half-footprint + 0.08 cell erosion margin (§6.2) for a given radius.
function pldErodeMargin(radius) {
  return radius / 2 + 0.08;
}

// an entry is eligible for repositioning iff its primary marks it incidental floor filler. Every
// other primary (focal/setPiece/blocker/wall-hang/light) is a canonical/functional anchor — NEVER
// touched, per the spec's own "when in doubt, LEAVE IT" identity-preserving default.
function pldIsEligible(entry) {
  return !!entry && entry.primary === "floor";
}

// the DOOR-adjacent "apron" cell(s): a DOOR cell's own FLOOR neighbors — the nearest this data
// layer can get to "swing cells" without a swing-arc model. Returns a Set of "x,y" keys.
function pldDoorApronCells(room, plan) {
  const out = new Set();
  for (let yy = room.y; yy < room.y + room.d; yy++) {
    for (let xx = room.x; xx < room.x + room.w; xx++) {
      if (xx < 0 || yy < 0 || xx >= plan.cellW || yy >= plan.cellD) continue;
      if (plan.cells[yy * plan.cellW + xx] !== SPATIAL_CELL.DOOR) continue;
      out.add(xx + "," + yy);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = xx + dx, ny = yy + dy;
        if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return;
        if (plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.FLOOR) out.add(nx + "," + ny);
      });
    }
  }
  return out;
}

// a cell is wall-adjacent (reused ad hoc rather than importing place-dressing's dpAdjacentToWall,
// which is itself a global already loaded before this file — call it directly to avoid a second
// definition of the identical formula; kept as a thin defensive wrapper in case load order ever
// changes so this file never throws if that global is briefly absent).
function pldAdjacentToWall(x, y, plan) {
  if (typeof dpAdjacentToWall === "function") return dpAdjacentToWall(x, y, plan);
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return deltas.some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return false;
    return plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.WALL;
  });
}

/* builds this room's legal region: an array of {x,y,marginClamp} candidate FLOOR cells, already
   minus center-2x2 / column / anchor-occupied / door+apron cells. `marginClamp` is later combined
   with each entry's own radius-derived erosion margin (a cell adjacent to a wall gets a smaller
   usable jitter box than an interior cell) — never invented per-entry, purely geometric. Returns
   null (never an empty-array false-negative) only when the room itself can't be found on
   dressedPlan.rooms, so the caller can cleanly degrade to "leave every entry at its input
   position" per the spec's own "if room geometry needed is not on dressedPlan here" rule. */
function pldLegalRegionFor(room, plan, anchorOccupied) {
  if (!room || !plan || !plan.cells) return null;
  const centerSet = (typeof dpCenter2x2 === "function") ? dpCenter2x2(room) : new Set();
  const columnCell = (typeof dpRoomColumnCell === "function") ? dpRoomColumnCell(room, plan) : null;
  const columnKey = columnCell ? columnCell.x + "," + columnCell.y : null;
  const doorApron = pldDoorApronCells(room, plan);
  const cells = [];
  for (let yy = room.y; yy < room.y + room.d; yy++) {
    for (let xx = room.x; xx < room.x + room.w; xx++) {
      if (xx < 0 || yy < 0 || xx >= plan.cellW || yy >= plan.cellD) continue;
      if (plan.cells[yy * plan.cellW + xx] !== SPATIAL_CELL.FLOOR) continue;
      const key = xx + "," + yy;
      if (centerSet.has(key)) continue;
      if (columnKey === key) continue;
      if (doorApron.has(key)) continue;
      if (anchorOccupied.has(key)) continue;
      cells.push({ x: xx, y: yy, wallAdjacent: pldAdjacentToWall(xx, yy, plan) });
    }
  }
  return cells;
}

// deterministic Fisher-Yates over a plain candidate array using the CALLER's own rng stream (same
// convention place-dressing.js's dpShuffle keeps) — never a shared/global stream.
function pldShuffle(list, rng) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = out[i]; out[i] = out[j]; out[j] = t;
  }
  return out;
}

function pldDist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/* placeDistribute(dressedPlan, opts) -> a shallow clone of dressedPlan with a rebuilt `dressing`
   array. `opts`: { walkId, focusSegNum } (focusSegNum is accepted per this unit's theater-data.js
   call-site contract but unused here — every room in dressedPlan.rooms is realized, not only the
   focused one, since a walk can pan across already-dressed neighbor rooms without re-calling this
   pass). Pure: never mutates dressedPlan or any entry in place; every eligible entry gets a fresh
   object, every anchor entry is copied through byte-identical (same object reference is fine since
   nothing downstream mutates dressing entries in place — but a fresh array is still returned per
   the spec's own "shallow-cloned plan" contract). */
function placeDistribute(dressedPlan, opts) {
  opts = opts || {};
  if (!dressedPlan || !Array.isArray(dressedPlan.dressing) || !Array.isArray(dressedPlan.rooms) || !dressedPlan.cells) {
    // degrade cleanly — never throw on a malformed/partial plan (identity-preserving default).
    return dressedPlan;
  }
  const walkId = opts.walkId != null ? String(opts.walkId) : String(dressedPlan.seed || "");
  const roomBySeg = {};
  dressedPlan.rooms.forEach((r) => { roomBySeg[r.segNum] = r; });

  // group dressing entries by roomSegNum, preserving original order (ordinal = index within its
  // own room's original entry list — the seed formula's own "originalOrdinal" fallback term).
  const byRoom = {};
  dressedPlan.dressing.forEach((entry, idx) => {
    const seg = entry && entry.roomSegNum;
    (byRoom[seg] = byRoom[seg] || []).push({ entry, idx });
  });

  const nextDressing = new Array(dressedPlan.dressing.length);

  Object.keys(byRoom).forEach((segKey) => {
    const bucket = byRoom[segKey];
    const room = roomBySeg[segKey];

    // anchors (non-eligible entries) occupy their own cell — never available to an eligible entry,
    // and their own positions are the fixed "already placed" set clearance is checked against.
    const anchors = [];
    const anchorOccupied = new Set();
    bucket.forEach(({ entry }) => {
      if (!pldIsEligible(entry)) {
        anchors.push(entry);
        if (Number.isFinite(entry.x) && Number.isFinite(entry.y)) anchorOccupied.add(Math.round(entry.x) + "," + Math.round(entry.y));
      }
    });

    const legalCells = room ? pldLegalRegionFor(room, dressedPlan, anchorOccupied) : null;

    // clearance is checked against every OTHER eligible entry in this room, not just already-
    // resolved ones: an entry processed early must not crowd a spot a LATER entry's own original
    // (never-yet-touched) position already occupies, because that later entry may itself fall back
    // to its input position (insufficient-fit -> identity-preserving default) — an order-dependent
    // "only check what's resolved so far" pass would let an early pick collide with a later
    // fallback's untouched position. otherPositionFor(k, ordinal) returns the position + radius
    // that entry k contributes to the clearance check AT THE TIME entry `ordinal` is being placed:
    // its final resolved position if k was processed earlier (k < ordinal), else its still-
    // unrealized original input position (k > ordinal) — conservative in both directions, so
    // clearance never depends on iteration order.
    function otherPositionFor(k, ordinal) {
      const item = bucket[k];
      if (!pldIsEligible(item.entry)) return null; // covered by `anchors` already
      const pos = k < ordinal ? nextDressing[item.idx] : item.entry;
      if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return null;
      return { x: pos.x, y: pos.y, radius: pldRadiusFor(item.entry.cardKind) };
    }

    bucket.forEach(({ entry, idx }, ordinal) => {
      if (!pldIsEligible(entry)) {
        nextDressing[idx] = entry; // anchor: byte-identical passthrough, never touched.
        return;
      }
      if (!legalCells || !legalCells.length) {
        // no room geometry / no legal cells at all -> identity-preserving default: leave at input.
        nextDressing[idx] = entry;
        return;
      }

      const sourceRef = entry.sourceRef || (entry.slug + ":" + ordinal);
      const seedStr = "place-realize:v1:" + walkId + ":" + segKey + ":" + sourceRef;
      const seed = dspHashStr(seedStr);
      const rng = dspMulberry32(seed);
      const radius = pldRadiusFor(entry.cardKind);
      const margin = pldErodeMargin(radius);

      // candidates whose wall proximity (if any) still leaves room for this entry's own erosion
      // margin — an interior (non-wall-adjacent) cell always qualifies; a wall-adjacent cell only
      // qualifies when the margin is small enough (<=0.42 cell, i.e. it doesn't need to pull more
      // than a small fraction away from the wall face to clear itself).
      const eligible = legalCells.filter((c) => !c.wallAdjacent || margin <= 0.42);
      const candidates = eligible.length ? eligible : legalCells;
      const shuffled = pldShuffle(candidates, rng);

      // anchors (canonical focal/setPiece/blocker/wall-hang/light cards) carry their own real
      // footprint too — a repositioned filler must clear an anchor's own cardKind-derived radius,
      // not just its own, or a small filler could land visually inside a large setPiece's footprint.
      const others = anchors.map((a) => ({ x: a.x, y: a.y, radius: pldRadiusFor(a.cardKind) }));
      for (let k = 0; k < bucket.length; k++) {
        if (k === ordinal) continue;
        const o = otherPositionFor(k, ordinal);
        if (o) others.push(o);
      }

      let chosen = null;
      const maxAttempts = Math.min(shuffled.length, 24);
      for (let i = 0; i < maxAttempts; i++) {
        const c = shuffled[i];
        // jitter within the cell's own unit square, biased away from any wall edge by `margin`
        // (clamped so the usable box never inverts on a very large object in a tight cell).
        const half = Math.max(0, 0.5 - Math.min(margin, 0.45));
        const jx = c.x + (rng() * 2 - 1) * half;
        const jy = c.y + (rng() * 2 - 1) * half;
        const candidatePos = { x: jx, y: jy };
        const violatesClearance = others.some((o) => pldDist(candidatePos, o) < (radius + o.radius));
        if (!violatesClearance) { chosen = candidatePos; break; }
      }

      if (!chosen) {
        // insufficient fit anywhere this room's own budget of attempts allows -> identity-
        // preserving default: leave this entry at its input position (never invent a worse spot,
        // never drop the card — the spec's own "canonical card stays" reasoning applied to filler:
        // the SAFEST behavior on failure-to-fit is no-op, not a forced overlap).
        nextDressing[idx] = entry;
        return;
      }

      nextDressing[idx] = Object.assign({}, entry, {
        x: chosen.x,
        y: chosen.y,
        sourceRef: sourceRef,
        realizationIndex: ordinal,
        realizationSeed: seed,
        algorithmVersion: "v1",
        anchor: { x: entry.x, z: entry.y },
        regionKind: legalCells === eligible ? "eroded" : "eroded-fallback-wide",
      });
    });
  });

  return Object.assign({}, dressedPlan, { dressing: nextDressing });
}

window.placeDistribute = placeDistribute;
window.ROOM_PLACE_DISTRIBUTE = ROOM_PLACE_DISTRIBUTE;
