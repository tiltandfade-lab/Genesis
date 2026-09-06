/* GENESIS MODULE — src/engine/walk-interactables.js
   docs/STAGE-D-WAVE-SPECS.md D2 (Walk→coordinate binding) = BEAUTY-WAVE-5.md IA-2 verbatim (its
   riders are LAW). Turns the walk's text-only interactable rolls (dungeon-walk.js's per-room
   object/feature/door fields, plus their WDV-2 rollRefs provenance — docs/WALK-NATIVE-A.md) into a
   placed thing: bindWalkInteractables(plan, walk, opts) -> a shallow clone of a spatializePlan()/
   semanticizePlan() output with a NEW plan.interactables[] sibling to place-dressing.js's own
   plan.dressing[] — {archetype, slug, state, extrudeDepth, name, flavor, x, y, roomSegNum,
   sourceRef, reserve?}.

   LAW 5 (BEAUTY-WAVE-5.md, "the walk record is canon; the frame is selective"): this module never
   mutates walk/segment/plan inputs, only reads them — the raw segment stays byte-unchanged no
   matter what this file does (dev/verify-walk-binding.mjs's own red-first proof). LAW 2 ("never
   invent a noun"): every projected archetype/name/flavor is read straight off the walk's own roll,
   never fabricated.

   ARCHETYPE RESOLUTION (HONEST GAP — same "the real data wins over doc prose" discipline D1's own
   docstring, data/interactables.js, already keeps): the dungeon-walk table set does NOT roll
   archetype nouns directly. Dungeon Interactable Object rolls texture/mechanism flavor ("loose
   floorboard", "pressure plate", "lever bar"...) and Dungeon Feature rolls terrain/landmark flavor
   ("Stone Altar", "Cold Hearth"...) — neither table is the objects-dg-03 8-archetype roster
   (door/chest/lever/shrine/campfire/trap/portal/container, BEAUTY-WAVE-5.md SEAM 1's own table)
   verbatim. WI_ARCHETYPE_KEYWORDS below reads each rolled name for a keyword match against that
   8-archetype roster; a roll whose text matches nothing projects NOTHING for that field — Law 5
   means that's fine: the flavor text stays fully intact and readable on the raw segment either way,
   never discarded, never re-rolled, never forced into a bad archetype guess. Doors are the ONE
   archetype resolved WITHOUT keyword-matching: the door archetype is a structural fact of the room
   graph itself (segment.exits[0].door, dungeon-walk.js's WDV-2 rollRefs.door provenance), never a
   text guess.

   STARTING STATE: read a rolled field when one exists (the door's own Dungeon Door State roll,
   mapped through WI_DOOR_STATE_KEYWORDS onto the door archetype's shut/ajar/open/broken vocabulary)
   else the archetype's D1-authored resting default (INTERACTABLE_ARCHETYPE_STATES[archetype][0], the
   SAME lookup dm.js's dmEntityState (D0) already uses). Object/feature rolls carry no state of
   their own -> always the resting default. This module NEVER re-rolls a state — matches D0's own
   "the renderer never makes a fresh state roll" law.

   BUDGET & RESERVE (Law 5's "walk-backed staging reserve, never a discard lane"): opts.budgetPerRoom
   (default Infinity — "default-empty screen budget" means nothing is force-reserved unless a caller
   actually asks for a cap) caps how many of a room's resolved candidates get a real (x,y); the
   remainder are pushed into the SAME plan.interactables[] array with `reserve:true` and x:null/
   y:null — still source-referenced, still fully described, never dropped/rerolled/promoted.

   PLACEMENT: door archetype binds to one of the room's own DOOR cells (plan.doors, filtered by
   betweenSegs including the room's own segNum — engine.place-spatialize's own door-list shape); D1's
   per-archetype `location` (wall/floor/door-cell) binds every other archetype to a wall-adjacent or
   general floor cell within the room, off the combat-space center 2x2 (dpCenter2x2/dpRoomFloorCells/
   dpAdjacentToWall — engine.place-dressing's own globals, reused rather than reimplemented: ENGINE
   PURITY LAW is about src/engine/* never reaching into src/ui/*, not about two engine files sharing
   a formula — place-distribution.js's own header note keeps the identical discipline). No registry
   (typeof-guard) degrades to an EMPTY projection (slug/extrudeDepth null, WI_LOCATION_FALLBACK
   supplies just enough location to still place the entry) rather than throwing or inventing art.

   DETERMINISM (GRAPHICS-ENGINE.md law 7, same discipline as dressPlan/placeDistribute): pure
   function of (plan, walk, opts); every placed entry's own cell pick seeds an INDEPENDENT
   dspMulberry32 stream off "walk-interactable:v1:"+walkId+":"+segNum+":"+sourceRef (mirrors
   place-distribution.js's OWN seed-formula convention verbatim, off engine.place-spatialize's shared
   dspHashStr/dspMulberry32 globals) — never Math.random, never a shared/ordinal-dependent stream.

   PERSISTENCE: reconcileWalkInteractableState(prepNode, interactables) owns the small durable seam
   between this pure projection and world state. The walk remains the content record; prepNode keeps
   only {sourceRef,archetype,state}. Prep calls reconciliation when it binds a spatial plan, so object
   identity exists in Story mode without requiring the Theater projection to run. Theater may call
   the same owner again while re-deriving coordinates; it restores persisted state idempotently. */

"use strict";

// ─── archetype resolution (HONEST GAP — see header) ─────────────────────────────────────────────
// Order matters: first match wins, most specific/least-ambiguous nouns first.
const WI_ARCHETYPE_KEYWORDS = Object.freeze([
  { archetype: "chest", words: Object.freeze(["chest", "lockbox"]) },
  { archetype: "lever", words: Object.freeze(["lever"]) },
  { archetype: "trap", words: Object.freeze(["pressure plate", "tripwire", "trap"]) },
  { archetype: "shrine", words: Object.freeze(["shrine", "altar"]) },
  { archetype: "campfire", words: Object.freeze(["campfire", "hearth", "fireplace"]) },
  { archetype: "portal", words: Object.freeze(["portal", "portcullis", "fracture", "rift"]) },
  { archetype: "container", words: Object.freeze(["crate", "barrel", "jar", "sack", "urn", "cistern", "bucket"]) },
]);
function wiResolveArchetype(text) {
  if (!text) return null;
  const low = String(text).toLowerCase();
  for (let i = 0; i < WI_ARCHETYPE_KEYWORDS.length; i++) {
    const row = WI_ARCHETYPE_KEYWORDS[i];
    if (row.words.some((w) => low.indexOf(w) >= 0)) return row.archetype;
  }
  return null;
}

// Dungeon Door State (Engine/03. _Tables/.../Dungeon Door State.md) -> the door archetype's own
// shut/ajar/open/broken vocabulary. Order matters: damage/collapse phrasing must win over the
// generic "closed" read (row 13 "Partially Collapsed" is broken, not shut, even though the door
// itself is nominally still in the frame).
const WI_DOOR_STATE_KEYWORDS = Object.freeze([
  { state: "broken", words: Object.freeze(["collapsed", "blocked", "destroyed", "shattered"]) },
  { state: "open", words: Object.freeze(["open", "ajar"]) },
  { state: "shut", words: Object.freeze(["closed", "locked", "barred", "jammed", "stuck", "spiked", "chained", "sealed", "held", "closing", "trapped"]) },
]);
function wiResolveDoorState(text, fallback) {
  if (!text) return fallback;
  const low = String(text).toLowerCase();
  for (let i = 0; i < WI_DOOR_STATE_KEYWORDS.length; i++) {
    const row = WI_DOOR_STATE_KEYWORDS[i];
    if (row.words.some((w) => low.indexOf(w) >= 0)) return row.state;
  }
  return fallback;
}

// mirror-safety net ONLY for when INTERACTABLES_REGISTRY (D1) is absent — every realm's real
// registry entry already carries this same per-archetype value (location is realm-invariant); this
// fallback never overrides a real registry value, it only fills the gap when there is none.
const WI_LOCATION_FALLBACK = Object.freeze({
  door: "door-cell", lever: "wall", shrine: "wall", portal: "wall",
  campfire: "floor", chest: "floor", container: "floor", trap: "floor",
});

function wiArchetypeStates(archetype) {
  if (typeof INTERACTABLE_ARCHETYPE_STATES === "undefined" || !INTERACTABLE_ARCHETYPE_STATES) return null;
  const list = INTERACTABLE_ARCHETYPE_STATES[archetype];
  return Array.isArray(list) ? list : null;
}
function wiRegistryEntry(realmId, archetype, state) {
  if (typeof INTERACTABLES_REGISTRY === "undefined" || !INTERACTABLES_REGISTRY) return null;
  const fallbackRealm = (typeof DRESSING_DEFAULT_REALM !== "undefined") ? DRESSING_DEFAULT_REALM : "chrome";
  const realmReg = INTERACTABLES_REGISTRY[realmId] || INTERACTABLES_REGISTRY[fallbackRealm];
  if (!realmReg) return null;
  return realmReg[archetype + "@" + state] || null;
}

// ─── candidate extraction — fixed [object, feature, door] order, never RNG, never mutates segment.
function wiCandidatesForRoom(segment) {
  const out = [];
  if (segment && segment.object && segment.object.name) {
    const archetype = wiResolveArchetype(segment.object.name);
    if (archetype) out.push({ fieldKey: "object", archetype, rolledState: null, name: segment.object.name, flavor: segment.object.flavor || "" });
  }
  if (segment && segment.feature && segment.feature.name) {
    const archetype = wiResolveArchetype(segment.feature.name);
    if (archetype) out.push({ fieldKey: "feature", archetype, rolledState: null, name: segment.feature.name, flavor: segment.feature.flavor || "" });
  }
  if (segment && Array.isArray(segment.exits) && segment.exits[0] && segment.exits[0].door && segment.exits[0].door.type) {
    const door = segment.exits[0].door;
    out.push({
      fieldKey: "door", archetype: "door",
      rolledState: (door.state && door.state.name) || null,
      name: door.type.name || "", flavor: door.type.desc || "",
    });
  }
  return out;
}

// ─── room-cell helpers — reuse place-dressing.js's globals when present (ENGINE PURITY LAW: engine-
// to-engine reuse is fine, only src/engine/* -> src/ui/* is forbidden); thin defensive fallbacks
// mirror place-distribution.js's own "never throw if a global is briefly absent" discipline.
function wiRoomFloorCells(room, plan) {
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
function wiAdjacentToWall(x, y, plan) {
  if (typeof dpAdjacentToWall === "function") return dpAdjacentToWall(x, y, plan);
  const deltas = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return deltas.some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= plan.cellW || ny >= plan.cellD) return false;
    return plan.cells[ny * plan.cellW + nx] === SPATIAL_CELL.WALL;
  });
}
function wiCenter2x2(room) {
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
function wiRoomDoorCells(room, plan) {
  if (!plan || !Array.isArray(plan.doors)) return [];
  // QF-A3 ROOT CAUSE (PLAY-LENS ledger P0 #3 — pl-011/pl-016, "door leaf floats unanchored in real
  // rolled rooms"): engine.place-spatialize's own doors.push (src/engine/place-spatialize.js) stamps
  // TWO entries per room-to-room doorway, ONE per side — {x,y} is the cell INSIDE the pushing room,
  // `toSeg` is the OTHER room's segNum ("this door leads TO toSeg FROM here"). betweenSegs is the
  // SAME pair on both entries, so filtering on betweenSegs alone (the pre-existing check just below)
  // keeps BOTH sides for a room whose doorway connects it to a neighbor — including the neighbor's
  // OWN entry, whose {x,y} is a cell inside the NEIGHBOR room, not this one. bindWalkInteractables'
  // seeded pick (see its own header) could then land on that foreign cell, placing the door leaf at a
  // coordinate that belongs to a different room entirely — no wall aperture anywhere near it in the
  // room actually being rendered, exactly the reported defect. A door entry's {x,y} is inside THIS
  // room precisely when `toSeg` points AWAY from it (toSeg !== room.segNum, per place-spatialize's own
  // push order above) — the missing second half of the filter.
  return plan.doors
    .filter((d) => d && Array.isArray(d.betweenSegs) && d.betweenSegs.indexOf(room.segNum) >= 0 && d.toSeg !== room.segNum)
    .map((d) => ({ x: d.x, y: d.y }));
}
// candidate cell pool for a resolved D1 `location` value — floor is the default for an unknown/
// absent location (never throws on a location this file doesn't recognize).
function wiCandidateCellsFor(location, room, plan) {
  if (location === "door-cell") return wiRoomDoorCells(room, plan);
  const centerSet = wiCenter2x2(room);
  const floor = wiRoomFloorCells(room, plan).filter((c) => !centerSet.has(c.x + "," + c.y));
  if (location === "wall") {
    const wallAdjacent = floor.filter((c) => wiAdjacentToWall(c.x, c.y, plan));
    return wallAdjacent.length ? wallAdjacent : floor; // degrade to any floor cell rather than vanish
  }
  return floor; // "floor" or unrecognized
}

/** bindWalkInteractables(plan, walk, opts) -> plan.interactables = [{archetype, slug, state,
 * extrudeDepth, name, flavor, x, y, roomSegNum, sourceRef, reserve?}]
 * `plan` is a spatializePlan()/semanticizePlan() output (room.segNum/x/y/w/d/plan.doors[]/
 * plan.cells). `walk` supplies `.segments[]` (dungeon-walk.js room records, matched to plan.rooms
 * by `.num`===room.segNum) — the object/feature/exits[0].door fields this projection reads.
 * `opts`: { realmId, walkId, budgetPerRoom }. budgetPerRoom (default Infinity — "default-empty
 * screen budget": nothing is force-reserved unless a caller asks for a cap) caps how many of a
 * room's resolved candidates get a real (x,y); the rest become reserve:true entries (x:null,y:null).
 * Pure: never mutates plan/walk/segment; the same (plan,walk,opts) snapshot always yields a
 * byte-identical interactables array (DETERMINISM LAW). */
function bindWalkInteractables(plan, walk, opts) {
  opts = opts || {};
  if (!plan || !Array.isArray(plan.rooms) || !plan.rooms.length || !plan.cells) {
    throw new Error("bindWalkInteractables: plan.rooms[]/plan.cells are required (spatializePlan/semanticizePlan output expected)");
  }
  const realmId = opts.realmId || (typeof DRESSING_DEFAULT_REALM !== "undefined" ? DRESSING_DEFAULT_REALM : "chrome");
  const fingerprint = opts.walkId != null ? String(opts.walkId) : String(plan.seed || "");
  const budgetPerRoom = Number.isFinite(opts.budgetPerRoom) ? Math.max(0, opts.budgetPerRoom) : Infinity;

  const segByNum = {};
  (walk && Array.isArray(walk.segments) ? walk.segments : []).forEach((s) => {
    if (s && s.num != null) segByNum[s.num] = s;
  });

  const interactables = [];

  plan.rooms.forEach((room) => {
    const segment = segByNum[room.segNum];
    if (!segment) return; // no walk data for this room -> nothing to project, never a fabricated entry

    const candidates = wiCandidatesForRoom(segment);
    if (!candidates.length) return;

    const occupied = new Set();
    let placedCount = 0;

    candidates.forEach((cand) => {
      const states = wiArchetypeStates(cand.archetype);
      const restingDefault = (states && states.length) ? states[0] : null;
      let state = (cand.fieldKey === "door") ? wiResolveDoorState(cand.rolledState, restingDefault) : restingDefault;
      if (states && state != null && states.indexOf(state) < 0) state = restingDefault; // never an invalid state
      const registryEntry = wiRegistryEntry(realmId, cand.archetype, state);
      const location = (registryEntry && registryEntry.location) || WI_LOCATION_FALLBACK[cand.archetype] || "floor";
      const sourceRef = "S" + room.segNum + "." + cand.fieldKey;

      const base = {
        archetype: cand.archetype,
        slug: registryEntry ? registryEntry.slug : null,
        state: state,
        extrudeDepth: registryEntry ? registryEntry.extrudeDepth : null,
        name: cand.name,
        flavor: cand.flavor,
        roomSegNum: room.segNum,
        sourceRef: sourceRef,
      };

      if (placedCount >= budgetPerRoom) {
        interactables.push(Object.assign({}, base, { x: null, y: null, reserve: true }));
        return;
      }

      const cellPool = wiCandidateCellsFor(location, room, plan).filter((c) => !occupied.has(c.x + "," + c.y));
      if (!cellPool.length) {
        // no legal cell left this room -> staging reserve, never a fabricated position.
        interactables.push(Object.assign({}, base, { x: null, y: null, reserve: true }));
        return;
      }

      const seed = dspHashStr("walk-interactable:v1:" + fingerprint + ":" + room.segNum + ":" + sourceRef);
      const rng = dspMulberry32(seed);
      const cell = cellPool[Math.floor(rng() * cellPool.length) % cellPool.length];
      occupied.add(cell.x + "," + cell.y);
      placedCount++;

      interactables.push(Object.assign({}, base, { x: cell.x, y: cell.y }));
    });
  });

  return Object.assign({}, plan, { interactables: interactables });
}

/* Persist only stable identity + mutable state, then restore that state onto a fresh projection.
   This deliberately knows nothing about DOM, THREE, or presentation mode: state_transition and the
   DM digest can address an object even when no visual surface has ever mounted. */
function reconcileWalkInteractableState(prepNode, interactables){
  if(!prepNode || !Array.isArray(interactables) || !interactables.length) return interactables;
  const store=Array.isArray(prepNode.interactables)?prepNode.interactables:(prepNode.interactables=[]);
  const bySourceRef={};
  store.forEach(rec=>{ if(rec&&rec.sourceRef!=null) bySourceRef[rec.sourceRef]=rec; });
  interactables.forEach(entry=>{
    if(!entry||entry.sourceRef==null) return;
    const persisted=bySourceRef[entry.sourceRef];
    if(persisted) entry.state=persisted.state;
    else {
      const rec={sourceRef:entry.sourceRef,archetype:entry.archetype,state:entry.state};
      store.push(rec); bySourceRef[entry.sourceRef]=rec;
    }
  });
  return interactables;
}

// ─── ES-module bridge (mirrors place-dressing.js's own convention: top-level `const` never auto-
// attaches to `window`; a sealed ES-module scope can only reach in via `window.`) ────────────────
window.bindWalkInteractables = bindWalkInteractables;
window.reconcileWalkInteractableState = reconcileWalkInteractableState;
