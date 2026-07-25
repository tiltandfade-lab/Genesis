/* GENESIS MODULE — src/engine/clay-room.js
   C1A-CLAY-ROOM (docs/C1A-CLAY-ROOM.md) — CLAY-PROOF-LADDER §C1A / BATTLEMAP-TOWNTRAY-COMPOSITION
   §11.1 / SLICE-1-GATE-MATRIX. Classic <script> (shared global scope), engine-pure like
   src/engine/walk-scene.js — NOT an ES module. No THREE, no DOM, no Math.random()/Date.now() at
   call time (the one non-determinism a caller could introduce, `seed`, is a plain passthrough
   field — see clayRoomRecordFrom's own header), no world reads/writes.

   Proves ONE canonical clay room compiles to a stable, frozen record — exact cells, full
   perimeter walls, one portal, one crate, one goblin citizen, through the SAME owners the game
   uses (SPRITE_BY_BESTIARY_ID -> SPRITE_REGISTRY for the citizen's BodyForm) — never a parallel
   room compiler. 1 cell = 5 ft, GRID LAW (src/engine/combat.js cmGridFromCells's own header:
   "mint emits dims:{w,d} in cells, 1 tile = 1 cell = 5 ft").

   D6 (docs/C1A-CLAY-ROOM.md) derivation-path note: the record's CANONICAL GEOMETRY (the cell
   grid, its perimeter walls, and the portal/crate/citizen cell placements) is authored HERE, not
   derived through walkSceneFrom(src/engine/walk-scene.js) — walkSceneFrom classifies an ALREADY-
   ROLLED dungeon segment's prose fields (areaType/dims/side/exits) into WalkScene fact entries; it
   never lays out a cell/wall GRID (that is place-spatialize.js's spatializePlan, which operates on
   a full multi-room dungeon-walk plan, not a single pinned room fixture) — so D6 path (a) ("the
   real walkSceneFrom path with a pinned minimal input") cannot by itself produce this record's
   grid shape; a hand-rolled fake `segment`/`walk` fixture fed to the real function would still
   need the grid authored separately afterward, making the "real path" no more grounded than
   authoring it directly. D6 path (b) is what's implemented: the record's provenance re-uses
   walk-scene's OWN documented structure-fact SHAPE ({role, sourceRef, value} — walk-scene.js:172,
   `wsEmitField(scene, ctx, "dims", "structure", "structure", { value: s.dims }, "area")`; sourceRef
   itself is wsSourceRef's shape, walk-scene.js:32-40: {walkId, segmentNum, fieldPath, tableId,
   roll, overlayRef}) with PINNED fixture sourceRefs (walkId "clay-c1a", segmentNum 1, tableId/roll
   both null — no table was actually consulted) rather than calling the function. A later pass
   (see the "C1B seam" marker below) swaps these pinned sourceRefs for the output of a real rolled
   dungeon segment once C1B's move/preview-commit work gives this room somewhere to be rolled FROM.
*/

// CL-R1 lighting recipes no longer live in this fixture. The compatibility symbol
// CLAY_C1A_LIGHT_PROFILE is projected by src/engine/light-recipes.js from the same
// compiled lock that seeds the Light Lab.

/* ─── CL-R0 — CLAY_DIAGNOSTIC_SURFACE_RECIPE (docs/CLAYROOM-RESET-LADDER.md §CL-R0) ───────────────
   The diagnostic-clay surface selection is DATA, not renderer code. The renderer executes routes;
   this table decides them. It carries its own `id`/`version` so a capture receipt can name the
   exact recipe that produced a frame (recipe identity, alongside the record's fixture identity).

   Why a recipe at all: before CL-R0 the clay look was two hand-written material sweeps in
   theater-boot.js keyed off a hardcoded four-kind whitelist, applied ONCE at mount. Every kind the
   whitelist forgot (skirt, portal, room-shell, kit-shell) silently kept its production dungeon
   material, and every asynchronous rebuild silently restored the ones it did cover. A table plus a
   census makes both failures machine-visible instead of eye-visible.

   ROUTES
     diagnostic-clay  the surface is claimed by the fixture and rendered as flat neutral clay (or,
                      in "role-id" mode, as this role's own flat identifying colour)
     passthrough      the surface is DELIBERATELY left as production authored it, because the
                      fixture's own question depends on seeing it honestly — the citizen's sprite
                      art (CL-R2 measures its colour), a light emitter body (CL-R1 requires a
                      visible physical source), the door leaf's own state colour (D12b)
     unclaimed        no recipe entry matched. NEVER silently left alone: painted the loud
                      UNCLAIMED colour and reported by clayRoomSurfaceCensus, so a newly-introduced
                      interior kind cannot quietly reintroduce site material into the fixture.

   The role vocabulary is CL-R0's own required list (floor, wall, riser, trim, portal, furniture,
   emitter, sprite) plus the kinds this engine actually emits today. Roles with no geometry in the
   fixture (riser/trim) are declared anyway: the recipe is the contract for the whole fixture
   family (CL-F01..CL-F06), not for one room. */
var CLAY_DIAGNOSTIC_SURFACE_RECIPE = Object.freeze({
  id: "clay-diagnostic-surface",
  version: 1,
  modes: Object.freeze(["clay", "role-id"]),
  defaultMode: "clay",
  clayColor: "#8a8a8a",       // D7's own flat clay-grey, unchanged
  unclaimedColor: "#ff00ff",  // loud: an unrouted surface must be impossible to mistake for clay
  // D12a's seam grid is part of the diagnostic surface, so its colour belongs to the same recipe.
  // It was authored WHITE against a near-black regressed floor; once CL-R0 made the floor legible
  // clay, white-on-#8a8a8a stopped reading at all. A dark line is the contrast-correct choice
  // against clay, and against the brighter role-id fills too. Opacity stays inside D12a's own
  // 0.25-0.35 law.
  gridColor: "#141414",
  gridOpacity: 0.3,
  roles: Object.freeze({
    floor:     Object.freeze({ route: "diagnostic-clay", roleColor: "#5f8fbf" }),
    wall:      Object.freeze({ route: "diagnostic-clay", roleColor: "#bf6f6f" }),
    riser:     Object.freeze({ route: "diagnostic-clay", roleColor: "#bf8f4f" }),
    trim:      Object.freeze({ route: "diagnostic-clay", roleColor: "#8fbf5f" }),
    doorframe: Object.freeze({ route: "diagnostic-clay", roleColor: "#bfbf5f" }),
    portal:    Object.freeze({ route: "diagnostic-clay", roleColor: "#5fbf9f" }),
    pillar:    Object.freeze({ route: "diagnostic-clay", roleColor: "#9f6fbf" }),
    skirt:     Object.freeze({ route: "diagnostic-clay", roleColor: "#4f5f6f" }),
    furniture: Object.freeze({ route: "diagnostic-clay", roleColor: "#bf9f6f" }),
    emitter:   Object.freeze({ route: "passthrough",     roleColor: "#ffd88a" }),
    sprite:    Object.freeze({ route: "passthrough",     roleColor: "#ff5fbf" }),
    door:      Object.freeze({ route: "passthrough",     roleColor: "#ffffff" }),
    // Found by the CL-R0 census itself: the first routed capture reported nine UNCLAIMED surfaces —
    // the citizen's own soft contact pool (addInteriorContactBlob, userData.contactBlob) and eight
    // atmosphere motes (interiorBuildMotes, userData.motePiece). Neither is site material, so neither
    // is a CR-1 defect; both were simply outside the old four-kind whitelist's imagination. They route
    // to passthrough because CL-R2's contact/shadow contract must be judged on the REAL pool, not a
    // grey stand-in. OPEN for CL-R1: whether the diagnostic modes should suppress atmosphere entirely
    // (motes are additive ember quads — honest production output, but noise in a measurement rig).
    "contact-shadow": Object.freeze({ route: "passthrough", roleColor: "#5fbfbf" }),
    mote:             Object.freeze({ route: "passthrough", roleColor: "#bf5f5f" })
  })
});

/* ─── CL-R1 / CL-F02 — LIGHTING BENCH FIXTURE ──────────────────────────────────────────────────
   The room-truth fixture answers architecture/movement questions. This second fixture answers one
   narrower question: what does a named light recipe do to neutral form as distance, face direction,
   and elevation change? It is fixture DATA only. theater-boot.js projects these descriptors through
   the already-mounted production Theater scene; no light, camera, exposure rule, or second renderer
   lives here.

   Coordinates are offsets from the spatialized room centre in tabletop world units (1 u = 5 ft).
   The three boxes form one continuous staircase in Z, so each tread is exactly one cell-depth third
   (1/3 u) deep: the same depth target Adam set for eventual natural standee supports on stairs.
   Sphere/cube are deliberately matte and similarly sized so highlight shape and face transitions can
   be compared without material noise. The retained approved goblin is moved beside them through the
   ordinary board.pieces path so sprite response stays in the same frame. */
var CLAY_LIGHTING_BENCH_FIXTURE = Object.freeze({
  id: "cl-f02-lighting-bench",
  version: 1,
  label: "CL-F02 lighting bench",
  question: "Do diagnostic and rolled light recipes produce controlled, motivated light?",
  spriteCell: Object.freeze({ x: 10, z: 7 }),
  primitives: Object.freeze([
    Object.freeze({
      id: "bench-step-low", primitive: "box", role: "riser",
      size: Object.freeze({ x: 2.4, y: 0.24, z: 1 / 3 }),
      offset: Object.freeze({ x: -1.5, z: 1 / 3 })
    }),
    Object.freeze({
      id: "bench-step-mid", primitive: "box", role: "riser",
      size: Object.freeze({ x: 2.4, y: 0.48, z: 1 / 3 }),
      offset: Object.freeze({ x: -1.5, z: 0 })
    }),
    Object.freeze({
      id: "bench-step-high", primitive: "box", role: "riser",
      size: Object.freeze({ x: 2.4, y: 0.72, z: 1 / 3 }),
      offset: Object.freeze({ x: -1.5, z: -1 / 3 })
    }),
    Object.freeze({
      id: "bench-matte-cube", primitive: "box", role: "furniture",
      size: Object.freeze({ x: 1.15, y: 1.15, z: 1.15 }),
      offset: Object.freeze({ x: 0.45, z: 0 })
    }),
    Object.freeze({
      id: "bench-matte-sphere", primitive: "sphere", role: "furniture",
      radius: 0.66,
      offset: Object.freeze({ x: 2.05, z: 0 })
    })
  ]),
  overlays: Object.freeze({
    position: "emitter crosshair + floor drop",
    range: "25/50/100 percent physical-range rings",
    shadow: "wire shadow volume (point) or frustum (spot)"
  })
});

// clayRoomLightingBenchFixtureFrom(record) -> the immutable CL-F02 input. The minimum-size guard is
// loud because silently clipping the comparison forms against a smaller room would make the bench
// appear valid while changing the question it answers.
function clayRoomLightingBenchFixtureFrom(record){
  if(!record || !record.dims){
    throw new Error("clayRoomLightingBenchFixtureFrom: record with dims required");
  }
  if(record.dims.w < 9 || record.dims.d < 9){
    throw new Error("clayRoomLightingBenchFixtureFrom: CL-F02 requires at least a 9x9 room — got " +
      record.dims.w + "x" + record.dims.d);
  }
  return CLAY_LIGHTING_BENCH_FIXTURE;
}

/* ─── CL-R2 / CL-F03 — SPRITE CITIZENSHIP FIXTURE ──────────────────────────────────────────────
   The lineup deliberately spans the live pixel corpus rather than repeating the room-truth goblin.
   Coordinates are local cells inside the 15×15 C1B room. They advance along a camera-horizontal
   diagonal so true-scale silhouettes compare in one frame without changing the fixed production
   camera. `tacticalSpanCells` is gameplay truth; the visible support under the art is presentation
   geometry and never becomes collision/occupancy authority.

   The 60-foot Kraken is intentionally retained despite its review-fail/prototype-admitted state:
   Adam asked to see the actual largest creature beside a human and to flag overly wide big art for
   taller/upright regeneration. Hiding it behind the already-approved subset would defeat that test.
   The 1–30-foot cap is the preferred PRESENTATION SCALE. True scale remains available as an honest
   size-spectrum check; neither view mutates registry worldHeight or tactical occupancy. */
var CLAY_SPRITE_CITIZENSHIP_FIXTURE = Object.freeze({
  id: "cl-f03-sprite-citizenship",
  version: 1,
  label: "CL-F03 sprite citizenship",
  question: "Do live pixel sprites remain physical, readable citizens across the true scale range?",
  selectedSlug: "spr-pc-human-fighter-female",
  candidatePresentationCap: Object.freeze({
    minFeet: 1,
    maxFeet: 30,
    label: "preferred presentation scale — canonical height and tactical footprint stay unchanged"
  }),
  stair: Object.freeze({
    id: "sprite-stair-fit",
    treadDepth: 1 / 3,
    treadWidth: 2.4,
    riserHeight: 0.24,
    steps: 3
  }),
  cast: Object.freeze([
    Object.freeze({
      slug: "spr-fantasy-dungeon-animal-blind-cave-rat-pale-sightless-thrives-in-total-dark-first-sign-something-s-been-dug-through",
      label: "Blind cave rat", stress: "smallest live height", tacticalSpanCells: 0.5,
      lineupCell: Object.freeze({ x: 1, z: 13 })
    }),
    Object.freeze({
      slug: "spr-fantasy-winged-kobold-urd",
      label: "Winged kobold", stress: "small dark fantasy creature", tacticalSpanCells: 1,
      lineupCell: Object.freeze({ x: 3, z: 11 })
    }),
    Object.freeze({
      slug: "spr-pc-human-fighter-female",
      label: "Human fighter", stress: "human reference · skin/cloth/metal", tacticalSpanCells: 1,
      lineupCell: Object.freeze({ x: 5, z: 9 })
    }),
    Object.freeze({
      slug: "spr-fantasy-flaming-skeleton",
      label: "Flaming skeleton", stress: "pale/highlight clipping", tacticalSpanCells: 1,
      lineupCell: Object.freeze({ x: 7, z: 7 })
    }),
    Object.freeze({
      slug: "spr-fantasy-wraith",
      label: "Wraith", stress: "dark/irregular alpha edge", tacticalSpanCells: 1,
      lineupCell: Object.freeze({ x: 9, z: 5 })
    }),
    Object.freeze({
      slug: "spr-fantasy-treant",
      label: "Treant", stress: "tall Huge silhouette", tacticalSpanCells: 3,
      lineupCell: Object.freeze({ x: 11, z: 3 })
    }),
    Object.freeze({
      slug: "spr-fantasy-kraken",
      label: "Kraken", stress: "largest live height · width/regeneration test", tacticalSpanCells: 4,
      lineupCell: Object.freeze({ x: 13, z: 1 })
    })
  ])
});

function clayRoomSpriteCitizenshipFixtureFrom(record){
  if(!record || !record.dims){
    throw new Error("clayRoomSpriteCitizenshipFixtureFrom: record with dims required");
  }
  if(record.dims.w < 15 || record.dims.d < 15){
    throw new Error("clayRoomSpriteCitizenshipFixtureFrom: CL-F03 requires the 15x15 scale room — got " +
      record.dims.w + "x" + record.dims.d);
  }
  return CLAY_SPRITE_CITIZENSHIP_FIXTURE;
}

/* clayDiagnosticRoleForKind(kind) -> a normalized recipe role, or null.
   Maps the renderer's OWN `userData.interiorKind` vocabulary (theater-boot.js's
   interiorBuildInstancedMesh / room-shell / kit-shell tags) onto the recipe's role names. Pure
   string work, deliberately in the engine module so the vocabulary is reviewable as data rather
   than buried in a traversal. A `-ghost` suffix (the cutaway copy of a solid kind) resolves to the
   SAME role as its solid: a ghosted wall is still a wall for diagnostic purposes. */
function clayDiagnosticRoleForKind(kind){
  if(!kind || typeof kind !== "string") return null;
  var k = kind.replace(/-ghost$/, "");
  if(k === "room-shell-floor" || k === "kit-shell-floor") return "floor";
  if(k === "room-shell-wall-stem" || k === "room-shell-wall-upper" || k === "kit-shell-wall") return "wall";
  if(k === "room-shell-wall-trim") return "trim";
  if(k === "room-shell-riser") return "riser";
  if(CLAY_DIAGNOSTIC_SURFACE_RECIPE.roles[k]) return k;
  return null;
}

/* clayDiagnosticRouteFor(role, mode) -> {role, route, color} — the single resolution the renderer
   consults per surface. An unknown role resolves to the UNCLAIMED route (never to clay), so the
   default answer for "the recipe has never heard of this" is loud, not silent. */
function clayDiagnosticRouteFor(role, mode){
  var m = (mode === "role-id") ? "role-id" : CLAY_DIAGNOSTIC_SURFACE_RECIPE.defaultMode;
  var entry = role ? CLAY_DIAGNOSTIC_SURFACE_RECIPE.roles[role] : null;
  if(!entry){
    return { role: role || null, route: "unclaimed", color: CLAY_DIAGNOSTIC_SURFACE_RECIPE.unclaimedColor };
  }
  if(entry.route === "passthrough") return { role: role, route: "passthrough", color: null };
  return {
    role: role,
    route: "diagnostic-clay",
    color: (m === "role-id") ? entry.roleColor : CLAY_DIAGNOSTIC_SURFACE_RECIPE.clayColor
  };
}

/* clayDiagnosticModeFrom(raw) -> "clay" | "role-id". One place decides how a mode string (a URL
   flag, a console setting) is read, so the renderer never invents a third spelling. */
function clayDiagnosticModeFrom(raw){
  return (raw === "role-id" || raw === "roleid" || raw === "role") ? "role-id" : "clay";
}

// ─── small pure helpers (module-private) ──────────────────────────────────────────────────────
function clayCellId(x, z){ return "c-" + x + "-" + z; }

// wsSourceRef's own literal shape (walk-scene.js:32-40), reproduced inline rather than called —
// wsSourceRef is an internal walk-scene.js helper, not part of that module's manifest-declared
// `owns` (only walkSceneFrom is), so reaching into it would be a layering reach past its public
// surface. Same fields, same defaulting (a missing rollRef/overlayRef reads null, never undefined).
function claySourceRef(fieldPath){
  return Object.freeze({
    walkId: "clay-c1a", segmentNum: 1, fieldPath: fieldPath,
    tableId: null, roll: null, overlayRef: null
  });
}

// The citizen's bestiary id. "goblin" alone (the record shape's own illustrative example in
// docs/C1A-CLAY-ROOM.md) is not a real SPRITE_BY_BESTIARY_ID key — this codebase's bestiary
// register only carries the role-split variants (goblin-warrior/-minion/-boss/-cutter-minion/
// -hexer; dev/model-qa/mm-page-index.json's byBestiaryId confirms all of them join the same MM
// page as the base Goblin block). "goblin-warrior" is the generic foot-soldier variant (role/cr
// both null in SPRITE_REGISTRY — no elite/boss tag), the closest real id to a plain "a goblin
// citizen" — resolved here explicitly rather than left as the non-joining literal "goblin" so D7's
// "loud failure if absent" law is exercised for real (see check 3's mutation test), not tripped by
// a name typo every call.
var CLAY_C1A_CITIZEN_BESTIARY_ID = "goblin-warrior";

// D8 BodyForm v1 — worldHeight/heightSource resolved from the goblin's OWN SPRITE_REGISTRY entry
// via SPRITE_BY_BESTIARY_ID (the one-owner path D7 names), never invented/defaulted here. A missing
// index entry, a missing registry row, or a registry row with no numeric worldHeight/heightSource
// throws — LOUD, never a silent fallback (VQ2-RESPEC.md S6's own worldHeight law, restated for
// this seam).
function clayGoblinBodyForm(){
  var byId = (typeof SPRITE_BY_BESTIARY_ID !== "undefined") ? SPRITE_BY_BESTIARY_ID : null;
  var spriteSlug = byId ? byId[CLAY_C1A_CITIZEN_BESTIARY_ID] : null;
  if(!spriteSlug){
    throw new Error("clayRoomRecordFrom: SPRITE_BY_BESTIARY_ID has no entry for '" + CLAY_C1A_CITIZEN_BESTIARY_ID + "'");
  }
  var registry = (typeof SPRITE_REGISTRY !== "undefined") ? SPRITE_REGISTRY : null;
  var entry = registry ? registry[spriteSlug] : null;
  if(!entry || typeof entry.worldHeight !== "number" || !isFinite(entry.worldHeight) || !entry.heightSource){
    throw new Error("clayRoomRecordFrom: SPRITE_REGISTRY['" + spriteSlug + "'] carries no worldHeight/heightSource — refusing a silent default");
  }
  // D8's exact v1 shape (docs/C1A-CLAY-ROOM.md) — exactly these six fields, nothing more.
  return Object.freeze({
    version: 1,
    bestiaryId: CLAY_C1A_CITIZEN_BESTIARY_ID,
    sizeCategory: "Small",
    occupiedCells: 1,
    worldHeight: entry.worldHeight,
    heightSource: entry.heightSource
  });
}

// ─── PUBLIC — clayRoomRecordFrom(seed) -> the frozen C1A record ───────────────────────────────
// "Canonical" per the pass's own name: the geometry (dims/cells/walls/portal/object/citizen cell
// placements) is FIXED — this is one reference room, not a re-rolled one — so `seed` is carried as
// a plain provenance/determinism field rather than driving any dice. Determinism (check 1) holds
// by construction: no Math.random()/Date.now(), no world reads, so two calls with the same seed
// always produce byte-identical JSON, and two different seeds always differ (the embedded `seed`
// field alone already guarantees that, honestly — the geometry underneath truly doesn't vary,
// which is the whole point of a canonical fixture room).
function clayRoomRecordFrom(seed){
  // C1B founder ruling (2026-07-24): 5x5 could not prove the standard 30-ft movement highlight
  // against a distinct Dash extension. The retained deterministic room is now a 15x15 movement
  // lab: twelve 5-ft steps fit between the staged actor's lawful detour and the north threshold.
  // That gives the primary six-cell range and the next six-cell Dash band both real territory.
  var dims = Object.freeze({ w: 15, d: 15 });

  var cells = [];
  for(var z = 0; z < dims.d; z++){
    for(var x = 0; x < dims.w; x++){
      cells.push(Object.freeze({ id: clayCellId(x, z), x: x, z: z }));
    }
  }
  cells = Object.freeze(cells);

  // Full perimeter: one wall entry per boundary cell PER edge it touches (a corner cell earns two
  // entries, one per exterior face — architecturally honest, never a single shared corner entry
  // that would leave one of its two faces unwalled). n/s scan the x axis, w/e scan the z axis.
  var walls = [];
  for(var wx = 0; wx < dims.w; wx++){
    walls.push(Object.freeze({ id: "w-n-" + wx, edge: "n", cells: Object.freeze([clayCellId(wx, 0)]) }));
    walls.push(Object.freeze({ id: "w-s-" + wx, edge: "s", cells: Object.freeze([clayCellId(wx, dims.d - 1)]) }));
  }
  for(var wz = 0; wz < dims.d; wz++){
    walls.push(Object.freeze({ id: "w-w-" + wz, edge: "w", cells: Object.freeze([clayCellId(0, wz)]) }));
    walls.push(Object.freeze({ id: "w-e-" + wz, edge: "e", cells: Object.freeze([clayCellId(dims.w - 1, wz)]) }));
  }
  walls = Object.freeze(walls);

  // Portal: north edge at c-6-0 — that cell is ALSO a north wall cell, so "portal on the north
  // edge at a wall cell" holds by construction. The slight off-centre placement is the exact cell
  // the real pinned SpatialPlan carves for this 15x15 fixture (see CLAY_ROOM_WALK_ATTEMPT).
  // D12b (Adam's founder redline, capture packet #1, 2026-07-23 — "i can't tell if that door is
  // supposed to be open or closed or if it's just janky and completely broken"): the record now
  // carries an explicit `state` fact so the door's rendered pose is a PROJECTION of a canonical
  // fact, never an unstated default a render layer has to invent. C1A only ever authors "closed"
  // (this fixture room has no state-change verb yet — that's C1B+ scope); record stays version 1
  // (an added field, not a shape-breaking migration).
  var connection = Object.freeze({
    id: "connection-clay-north",
    version: 1,
    kind: "hinged-door",
    state: "shut",
    clearanceSize: "Medium",
    endpointSceneIds: Object.freeze(["clay-room", "clay-beyond"])
  });
  // portal.state is an explicit text/render projection of connection.state. Connection is the
  // sole mechanical state owner; the portal never rolls or owns an independent half-door.
  var portal = Object.freeze({
    id: "portal-c1a",
    connectionId: connection.id,
    connectionVersion: connection.version,
    edge: "n",
    cell: clayCellId(6, 0),
    state: connection.state === "shut" ? "closed" : connection.state
  });

  // The real production crate blocks the center line. East and west detours are both lawful; the
  // west shoulder is difficult terrain, making the two route receipts materially different.
  var object = Object.freeze({ id: "obj-crate-c1a", kind: "crate", cell: clayCellId(6, 7) });

  // Citizen: another distinct interior cell.
  var bodyForm = clayGoblinBodyForm();
  var citizen = Object.freeze({
    id: "cit-goblin-c1a",
    bestiaryId: CLAY_C1A_CITIZEN_BESTIARY_ID,
    cell: clayCellId(6, 10),
    bodyForm: bodyForm
  });
  var movement = Object.freeze({
    version: 1,
    pass: "C1B",
    speedFt: 30,
    difficultCells: Object.freeze([clayCellId(5, 7)]),
    routeWaypoints: Object.freeze({
      east: clayCellId(7, 7),
      west: clayCellId(5, 7)
    })
  });

  // Provenance — see this file's own header for why derivation is "structure-fact-shape" (D6 path
  // b), not "walk-scene". C1B SEAM: once a real dungeon-walk segment can be rolled and handed to
  // walkSceneFrom for a room this size, these five pinned sourceRefs are the ones to replace —
  // marker: C1B-LIVE-SEGMENT-INTEGRATION.
  var sourceRefs = Object.freeze([
    Object.freeze({ role: "structure", sourceRef: claySourceRef("dims"), value: dims }),
    Object.freeze({ role: "structure", sourceRef: claySourceRef("walls"), value: walls.length }),
    Object.freeze({ role: "structure", sourceRef: claySourceRef("portal"), value: portal }),
    Object.freeze({ role: "connection", sourceRef: claySourceRef("connection"), value: connection }),
    Object.freeze({ role: "structure", sourceRef: claySourceRef("object"), value: object }),
    Object.freeze({ role: "structure", sourceRef: claySourceRef("citizen.bodyForm"), value: bodyForm }),
    Object.freeze({ role: "movement", sourceRef: claySourceRef("movement"), value: movement })
  ]);

  var record = {
    id: "clay-c1a",
    version: 1,
    tier: "test",
    seed: (seed == null ? null : seed),
    dims: dims,
    cells: cells,
    walls: walls,
    connection: connection,
    portal: portal,
    object: object,
    citizen: citizen,
    movement: movement,
    // D15 (docs/C1A-CLAY-ROOM.md re-wire addendum): "spatialize-plan" — the RENDER geometry a theater
    // mount projects from this record now compiles through the real spatializer (clayRoomBoardFrom/
    // clayRoomWalkFixtureFrom, below), not a hand-assembled board-data shim. This does NOT reverse the
    // D6 header's own reasoning above (a hand-rolled fixture fed to spatializePlan would be no more
    // grounded than authoring the grid directly) — record.cells/.walls stay hand-authored in a simple
    // local 0..4 frame, exactly as D6 argues; "spatialize-plan" documents that a DOWNSTREAM consumer
    // (the theater mount) now derives ITS OWN geometry from this record's fields (dims/portal.edge/
    // seed) via a real spatializePlan()/interiorBuildBoard() run, never that the record's own cells/
    // walls arrays were re-derived from that run. version stays 1 (an added consumption path, not a
    // shape-breaking migration).
    provenance: Object.freeze({
      pass: "C1A",
      derivation: "spatialize-plan",
      sourceRefs: sourceRefs,
      created: "2026-07-23"
    })
  };
  return Object.freeze(record);
}

// ─── PUBLIC — clayRoomProse(record) -> plain text (D9, GEN-LAW-3/TEXT-FIRST) ──────────────────
// Every canonical fact, in plain prose — the overlay's Facts tab (theater-boot.js wire-in) shows
// this string VERBATIM, never a re-derivation, so the two are same-facts-equivalent by construction
// (the whole point of a prose twin: nothing the player/tester can see through the render channel
// says something the text channel doesn't also say).
function clayRoomProse(record){
  if(!record) return "";
  var lines = [];
  lines.push("Clay room " + record.id + " (seed " + record.seed + ", tier " + record.tier + ").");
  lines.push("A " + record.dims.w + " by " + record.dims.d + " cell room (" + record.cells.length + " cells total; 1 cell = 5 ft).");
  var edgeCounts = { n: 0, s: 0, e: 0, w: 0 };
  (record.walls || []).forEach(function(w){ if(edgeCounts[w.edge] != null) edgeCounts[w.edge]++; });
  lines.push("Walls run the full perimeter: " + edgeCounts.n + " north, " + edgeCounts.s + " south, " + edgeCounts.e + " east, " + edgeCounts.w + " west segments.");
  lines.push("Portal " + record.portal.id + " sits on the " + record.portal.edge + " edge at cell " + record.portal.cell + " — the door is " + record.portal.state + ".");
  lines.push("Canonical connection " + record.connection.id + " version " + record.connection.version + " owns that door's " + record.connection.state + " state and joins " + record.connection.endpointSceneIds.join(" to ") + ".");
  lines.push("A crate (" + record.object.id + ") sits at cell " + record.object.cell + ".");
  lines.push("A goblin citizen (" + record.citizen.id + ") stands at cell " + record.citizen.cell +
    ", " + record.citizen.bodyForm.worldHeight + " ft tall (height source: " + record.citizen.bodyForm.heightSource + ").");
  lines.push("Movement proof: " + record.movement.speedFt + " ft speed; east waypoint " +
    record.movement.routeWaypoints.east + "; west waypoint " + record.movement.routeWaypoints.west +
    " is difficult terrain; Dash extends the primary range by another " + record.movement.speedFt + " ft.");
  return lines.join("\n");
}

// ─── PUBLIC — clayRoomExplain(record) -> plain text (D11 workbench floor v0) ───────────────────
function clayRoomExplain(record){
  if(!record) return "";
  var lines = [];
  lines.push("What this is: the C1A clay-pass canonical room record — a frozen, deterministic fixture (docs/C1A-CLAY-ROOM.md), not a live rolled room.");
  lines.push("Provenance: pass " + record.provenance.pass + ", derivation \"" + record.provenance.derivation + "\", created " + record.provenance.created + ".");
  lines.push("Source refs (" + record.provenance.sourceRefs.length + "):");
  record.provenance.sourceRefs.forEach(function(sr){
    lines.push("  - " + sr.sourceRef.fieldPath + " <- walkId=" + sr.sourceRef.walkId + " segmentNum=" + sr.sourceRef.segmentNum);
  });
  lines.push("What consumes it: the theater-boot.js clay-room mount (interior board/room builders, the citizen figure path) and this Explain tab.");
  lines.push("The citizen's height/heightSource are read straight off data/sprite-registry.js's SPRITE_REGISTRY, joined via SPRITE_BY_BESTIARY_ID.");
  lines.push("Generated sources are never hand-edited: data/sprite-registry.js and this record itself are both regenerate-or-recompute, never patch-in-place.");
  return lines.join("\n");
}

// ─── PUBLIC — clayRoomEditRefusal(field) -> the D11 typed refusal ──────────────────────────────
// Every BodyForm field this record ever exposes (worldHeight, heightSource, sizeCategory,
// occupiedCells, bestiaryId) traces to the SAME single generated source (data/sprite-registry.js)
// — the refusal is identical regardless of which field an edit affordance names; `field` is kept
// as the function's own documented parameter (docs/C1A-CLAY-ROOM.md D11) for a future per-source
// branch, unused today since there is only the one source.
function clayRoomEditRefusal(field){
  return { refused: true, reason: "generated-artifact", source: "data/sprite-registry.js" };
}

/* ─── D15 (docs/C1A-CLAY-ROOM.md re-wire addendum) — clayRoomWalkFixtureFrom / clayRoomDoorEdgeFor /
   clayRoomBoardFrom: the ADAPTER that replaces theater-boot.js's old hand-assembled board-data shim
   (clayRoomBoardDataFrom, deleted this unit) with the REAL production compile chain — a pinned
   synthetic walk/segment fixture -> spatializePlan (src/engine/place-spatialize.js) ->
   interiorBuildBoard (src/ui/theater-interior.js). Still pure (no THREE, no DOM): spatializePlan and
   interiorBuildBoard are BOTH pure data functions (their own manifest.json desc strings: "no w/U/
   render/DOM" / "no THREE/canvas/DOM"), and the KIT_SHELL_ENABLED/KIT_DOORS_ENABLED globals this
   toggles are plain booleans. Precedent for an "engine" module calling straight into interiorBuildBoard
   (a ui.theater-interior-owned symbol): src/engine/theater-data.js's own trayFrom does the identical
   thing today (`interiorBuildBoard(dressedPlan, {...})`, that file's {kind:"interior",plan} branch) —
   this is not a new layering shape, just the same one clay-room.js now also uses.

   THE PINNED FIXTURE: a 2-segment chain (the clay room itself, "clay-room", + a stub target room,
   "clay-beyond", that exists ONLY so spatializePlan has somewhere to carve the corridor/door FROM —
   nothing about "clay-beyond" is ever rendered; interiorBuildBoard's own focusSegNum trim keeps only
   the clay room's own cells+its own exit-door cell, see clayRoomBoardFrom below). Dims/areaType are
   derived FROM the record (record.dims.w*5 feet, a plain "N' x N'" string dspDimsToCells parses back
   to the SAME cell count — GRID LAW round-trip); "Square Chamber" as areaType carries no
   SPATIAL_SHAPE_RULES keyword (shapeForArchetype's own fallback), so the room rasterizes as a plain
   rect — the ONE shape this adapter is built for (a non-square/non-rect record throws rather than
   silently drifting, see the guard below).

   THE PINNED WALKID/TOPOLOGY: place-spatialize.js's own room-to-room layout (dspLayoutFor) has no
   notion of compass direction — a 2-node chain's default ("linear"/"tree" groups) drifts EAST, and
   "hub"/"onion"/"loop"/"web" groups pick a layout angle off `rng()`, itself seeded from
   dspHashStr(opts.walkId). Landing the clay room's own exit door on record.portal.edge ("n") is
   therefore a search-and-pin exercise, not a formula — CLAY_ROOM_WALK_TOPOLOGY/CLAY_ROOM_WALK_ATTEMPT
   below are the result of exactly that search (topology "The Hub", walkId
   "clay-room:clay-c1a:113311726:48" — record.seed 0x6c0ffee === 113311726 decimal — verified against
   this file's own tip via a node/vm probe: `spatializePlan` produces a 15x15 room at plan
   coords (4,20)-(18,34) whose sole exit door lands at (10,20), local c-6-0). PINNED, not
   searched at runtime (mirrors D6's own "pinned fixture sourceRefs" precedent) — but never trusted
   blindly either: clayRoomBoardFrom asserts the resolved door edge against record.portal.edge every
   call and throws loudly if place-spatialize.js's own layout math ever drifts this pin off-course
   (CLAUDE.md's "loud failure over silent default" law), rather than silently rendering a door on the
   wrong wall. */
var CLAY_ROOM_WALK_TOPOLOGY = "The Hub";
// ATTEMPT 48 — re-pinned when the founder-expanded C1B fixture moved from 5x5 to 15x15. It puts the
// real carved north door at local c-6-0 exactly. The exact-cell assert below remains the authority;
// any later spatializer drift throws instead of letting prose and render disagree.
var CLAY_ROOM_WALK_ATTEMPT = 48;

// clayRoomWalkFixtureFrom(record) -> {segments, topology, walkId, focusSegNum} — the synthetic walk
// fixture's OWN fields (dims/exits/areaType) derived from the record's dims + id + seed, per D15
// point 2. Throws on a non-square record.dims (the only shape this pinned fixture/search covers).
function clayRoomWalkFixtureFrom(record){
  if(!record) throw new Error("clayRoomWalkFixtureFrom: record required");
  if(!record.dims || record.dims.w !== record.dims.d){
    throw new Error("clayRoomWalkFixtureFrom: only a square room (record.dims.w === record.dims.d) is supported by this pinned fixture — got " + JSON.stringify(record && record.dims));
  }
  var feet = record.dims.w * 5; // GRID LAW: 1 cell = 5 ft (src/engine/combat.js cmGridFromCells)
  var dimsStr = feet + "' x " + feet + "'";
  var roomId = "clay-room", beyondId = "clay-beyond";
  var segments = [
    { id: roomId, num: 1, label: roomId, isFinale: false, depth: 0,
      exits: [{ targetId: beyondId }], light: "normal", dims: dimsStr, areaType: "Square Chamber" },
    { id: beyondId, num: 2, label: beyondId, isFinale: false, depth: 1,
      exits: [{ targetId: roomId }], light: "normal", dims: dimsStr, areaType: "Square Chamber" }
  ];
  var walkId = "clay-room:" + record.id + ":" + record.seed + ":" + CLAY_ROOM_WALK_ATTEMPT;
  return { segments: segments, topology: CLAY_ROOM_WALK_TOPOLOGY, walkId: walkId, focusSegNum: 1 };
}

// clayRoomDoorEdgeFor(door, room) -> "n"|"s"|"e"|"w"|null — which of a SpatialPlan room rect's four
// edges a door cell {x,y} sits on. Mirrors the record's OWN edge convention (clayRoomRecordFrom's
// w-n-*/w-s-*/w-w-*/w-e-* wall rows: "n" = the smallest z/y row, "s" = the largest, "w" = the smallest
// x column, "e" = the largest) so a plan-space door and a record-space portal.edge are directly
// comparable. Pure geometry, no THREE.
function clayRoomDoorEdgeFor(door, room){
  if(!door || !room) return null;
  if(door.y === room.y) return "n";
  if(door.y === room.y + room.d - 1) return "s";
  if(door.x === room.x) return "w";
  if(door.x === room.x + room.w - 1) return "e";
  return null; // a genuinely interior/degenerate cell — never expected for this pinned rect fixture
}

// ─── PUBLIC — clayRoomBoardFrom(record) -> {board, room, plan, fixture} (D15 wire-in) ─────────────
// The full re-wired chain: clayRoomWalkFixtureFrom(record) -> spatializePlan -> assert the exit door
// lands on record.portal.edge (loud failure otherwise) -> interiorBuildBoard (KIT_SHELL_ENABLED/
// KIT_DOORS_ENABLED forced off for this one synchronous build — see the inline note) -> crate+citizen
// staged onto board.furniture/board.pieces (the SAME plain caller-set fields src/engine/theater-data.js's
// own trayFrom sets on every real production board, theater-boot.js's own "a plain field the caller
// sets directly on the board object" convention for both), positioned from the record's own local
// cell coordinates offset by the spatialized room's REAL rect (room.x/room.y) — the record's cells
// stay authored in their simple 0..4 local frame; this offset is the one arithmetic step reconciling
// that frame with wherever the spatializer's own layout actually placed the room. board.interactables/
// board.dressing are left EMPTY (never hand-built) — see the door-leaf note in this function's body
// and this unit's own build report for why, and CLAUDE.md's "an untagged/exempt/red state that tells
// the truth beats a green that lies" for why that gap is reported, not patched.
function clayRoomBoardFrom(record, opts){
  if(!record) throw new Error("clayRoomBoardFrom: record required");
  opts = opts || {};
  var doSpatialize = (typeof spatializePlan !== "undefined") ? spatializePlan : null;
  var doBuildBoard = (typeof interiorBuildBoard !== "undefined") ? interiorBuildBoard : null;
  if(!doSpatialize) throw new Error("clayRoomBoardFrom: spatializePlan is not loaded (src/engine/place-spatialize.js must load before this call)");
  if(!doBuildBoard) throw new Error("clayRoomBoardFrom: interiorBuildBoard is not loaded (src/ui/theater-interior.js must load before this call)");

  var fixture = clayRoomWalkFixtureFrom(record);
  var plan = doSpatialize(fixture.segments, fixture.topology, { walkId: fixture.walkId });

  var room = null;
  (plan.rooms || []).forEach(function(r){ if(r.segNum === fixture.focusSegNum) room = r; });
  if(!room) throw new Error("clayRoomBoardFrom: spatializePlan produced no room for segNum " + fixture.focusSegNum);
  if(room.w !== record.dims.w || room.d !== record.dims.d){
    throw new Error("clayRoomBoardFrom: spatialized room is " + room.w + "x" + room.d +
      ", expected " + record.dims.w + "x" + record.dims.d + " (record.dims) — a SPATIAL_MIN_CELL/MAX_CELL clamp or a dims-string parse drift");
  }

  var roomDoor = null;
  (plan.doors || []).forEach(function(d){
    if(roomDoor) return;
    if(!d || d.betweenSegs.indexOf(fixture.focusSegNum) < 0) return;
    if(d.x < room.x || d.x >= room.x + room.w || d.y < room.y || d.y >= room.y + room.d) return;
    roomDoor = d;
  });
  if(!roomDoor) throw new Error("clayRoomBoardFrom: spatialized plan carries no door on the clay room's own exit — the pinned walkId/topology no longer carves one");
  var doorEdge = clayRoomDoorEdgeFor(roomDoor, room);
  if(doorEdge !== record.portal.edge){
    throw new Error("clayRoomBoardFrom: pinned fixture (topology '" + fixture.topology + "', attempt " + CLAY_ROOM_WALK_ATTEMPT +
      ") now resolves the exit door to edge '" + doorEdge + "', expected '" + record.portal.edge +
      "' (record.portal.edge) — place-spatialize.js's own layout math drifted; re-derive CLAY_ROOM_WALK_ATTEMPT");
  }
  // DOOR TRANCHE (2026-07-23): the EDGE check above proved insufficient — attempt 11 passed it while
  // carving the door two cells from record.portal.cell, so the prose twin named a cell the render
  // never showed. The assert is now exact: the carved cell must BE the record's cell.
  var portalCellMatch = String(record.portal.cell).match(/^c-(\d+)-(\d+)$/);
  var portalPlanX = room.x + Number(portalCellMatch[1]);
  var portalPlanY = room.y + Number(portalCellMatch[2]);
  if(roomDoor.x !== portalPlanX || roomDoor.y !== portalPlanY){
    throw new Error("clayRoomBoardFrom: pinned fixture carved the door at plan (" + roomDoor.x + "," + roomDoor.y +
      ") but record.portal.cell '" + record.portal.cell + "' is plan (" + portalPlanX + "," + portalPlanY +
      ") — the prose twin would lie about WHERE the door is; re-derive CLAY_ROOM_WALK_ATTEMPT");
  }

  // KIT_SHELL_ENABLED/KIT_DOORS_ENABLED: theater-interior.js's OWN documented dev/harness escape
  // hatch ("so a live session or a harness can flip it") — flipped OFF only for this one synchronous
  // build so the clay pass stays in the plain prism/InstancedMesh family (D2 step 3's "never a
  // bespoke material... SAME InstancedMesh/BoxGeometry construction" law): a kit-shelled wall/floor
  // module is a donor-piece GLTF assembly, not a vertex-colored prism, and can't be flattened to clay
  // grey the way every other structural mesh can (theater-boot.js's clayRoomFlattenStructure). Saved
  // and restored around the call — this build is synchronous, and `board` is a fully-resolved plain-
  // data snapshot the instant doBuildBoard returns, so no other board (this mount's own later async
  // replays included) is ever affected by the flags being back at their prior values.
  var priorKitShell = (typeof KIT_SHELL_ENABLED !== "undefined") ? KIT_SHELL_ENABLED : true;
  var priorKitDoors = (typeof KIT_DOORS_ENABLED !== "undefined") ? KIT_DOORS_ENABLED : true;
  var board;
  try {
    KIT_SHELL_ENABLED = false;
    KIT_DOORS_ENABLED = false;
    board = doBuildBoard(plan, { env: "dungeon", realmId: "ash", focusSegNum: fixture.focusSegNum });
  } finally {
    KIT_SHELL_ENABLED = priorKitShell;
    KIT_DOORS_ENABLED = priorKitDoors;
  }

  // CL-R1 — select a named recipe from the shared compiled registry. The default remains the
  // opposing-pair diagnostic, but the workbench may rebuild this same production board with neutral
  // truth or a lore-native rolled recipe. No Clayroom-only light values remain here.
  var lightRecipeId = opts.lightRecipeId || "clay-opposing-pair";
  var lightRecipe = opts.lightRecipe || lightRecipeFor(lightRecipeId);
  if(!lightRecipe || lightRecipe.id !== lightRecipeId){
    throw new Error("clayRoomBoardFrom: light recipe id mismatch for '" + lightRecipeId + "'");
  }
  var fixtureTemplate = board.lights && board.lights[0];
  if(lightRecipe.lights.length && !fixtureTemplate){
    throw new Error("clayRoomBoardFrom: production interiorBuildBoard produced no fixture template for the CL-R1 opposing pair");
  }
  var roomCx = room.x + (room.w - 1) / 2;
  var roomCz = room.y + (room.d - 1) / 2;
  var roomHalfX = (room.w - 1) / 2 + 1;
  var roomHalfZ = (room.d - 1) / 2 + 1;
  board.lights = lightRecipe.lights.filter(function(p){ return p.enabled !== false; }).map(function(p){
    var fixtureId = p.fixtureId || fixtureTemplate.fixtureId;
    var kind = fixtureId && fixtureId.indexOf("torch") >= 0 ? "torch" : "lamp";
    return Object.assign({}, fixtureTemplate, {
      id: p.id,
      sourceRef: p.id,
      recipeMode: lightRecipe.mode,
      sourceClass: lightRecipe.source.class,
      visibleEmitterRequired: lightRecipe.source.visibleEmitterRequired,
      x: roomCx + p.pos.x * roomHalfX,
      z: roomCz + p.pos.z * roomHalfZ,
      y: p.pos.y,
      lightType: p.type,
      temperatureK: p.temperatureK,
      colorOverride: p.colorOverride,
      color: p.color,
      intensity: p.physicalIntensity,
      intensityUnit: p.physicalIntensityUnit,
      positionStrategy: p.positionStrategy,
      // Preserve the already-reviewed diagnostic exposure exactly. Production practicals keep the
      // ordinary relative-intensity × shared-gain path.
      renderIntensity: lightRecipe.mode === "diagnostic-studio" ? p.physicalIntensity : undefined,
      distance: p.rangeM / 1.524,
      // Adam accepted the torch's local brightness and reviewed successive reach extensions. Mark
      // only that exception so the renderer does not also widen moonlight, lava, or diagnostic rigs.
      authoredRange: lightRecipe.id === "torchlit",
      decay: p.falloff,
      castShadow: p.shadow.cast,
      shadowBias: p.shadow.bias,
      shadowNormalBias: p.shadow.normalBias,
      shadowMapSize: p.shadow.mapSize,
      shadowBudgetPriority: p.shadow.budgetPriority,
      spot: p.spot,
      azimuthDeg: p.azimuthDeg,
      elevationDeg: p.elevationDeg,
      kind: kind,
      fixtureId: fixtureId,
      mount: p.mount || fixtureTemplate.mount,
      emitterLocal: p.emitterLocal || fixtureTemplate.emitterLocal,
      state: p.state || "steady",
      flicker: {
        seed: p.flicker.seed || ("clay-c1a:" + lightRecipe.id + ":" + p.id),
        amplitude: p.flicker.amplitude,
        cadenceMs: p.flicker.cadenceMs,
        intervalJitter: p.flicker.intervalJitter,
        directionAmplitude: p.flicker.directionAmplitude
      },
      forceVisiblePractical: true
    });
  });
  board.lightRecipeLock = {
    id: lightRecipe.id,
    mode: lightRecipe.mode,
    source: lightRecipe.source,
    lockSetId: LIGHT_PROFILE_LOCKS_COMPILED.id,
    lockSetVersion: LIGHT_PROFILE_LOCKS_COMPILED.version
  };

  var cellById = {};
  (record.cells || []).forEach(function(c){ cellById[c.id] = c; });
  var objectCell = cellById[record.object.cell];
  var citizenCell = cellById[record.citizen.cell];
  // D7/D2 step 4 — crate + goblin stage via their EXISTING production paths (data.furniture/
  // data.pieces), positioned from the record: local cell coords + the room's real (room.x,room.y).
  board.furniture = objectCell ? [{
    slug: record.object.id, kind: record.object.kind, realmId: null,
    x: room.x + objectCell.x, y: room.y + objectCell.z, roomSegNum: fixture.focusSegNum
  }] : [];
  board.pieces = citizenCell ? [{
    id: record.citizen.id,
    sourceRef: record.citizen.id,
    fid: record.citizen.id,
    slug: record.citizen.bestiaryId,
    cellX: room.x + citizenCell.x,
    cellY: room.y + citizenCell.z
  }] : [];
  // DOOR TRANCHE (2026-07-23, supersedes D15 point 1's "left empty" — RL-1 discharged): the leaf
  // mounts from a data.interactables entry, and this adapter now derives that entry FROM THE RECORD,
  // exactly the way it already stages the crate (board.furniture) and the citizen (board.pieces)
  // from record fields. This is canonical board DATA derived in the engine layer — not the
  // hand-built render-layer geometry D15 banned (that ban stands; theater-boot builds nothing here).
  //   state: the record's prose fact is "closed"; the production state vocabulary is shut/open/
  //     broken, and walk-interactables' own word list (wiResolveDoorState, src/engine/
  //     walk-interactables.js — "closed" sits in the shut row) is the mapping authority. Mirrored
  //     inline rather than called: wiResolveDoorState is that module's private helper (its manifest
  //     `owns` is bindWalkInteractables alone), the same layering precedent as claySourceRef.
  //   slug/extrudeDepth: read from the SAME generated registry production reads
  //     (INTERACTABLES_REGISTRY, data/interactables.js), realm row first, chrome fallback —
  //     mirroring wiRegistryEntry's own lookup; absent rows degrade to nulls and the consumer's
  //     documented ITR_DOOR_FALLBACK_DEPTH path, exactly production's degrade.
  //   x/y: the CARVED door cell — which the exact-cell assert above just proved IS the record's
  //     portal cell, so record fact, prose twin, and render agree on where the door is.
  var doorState = (record.portal.state === "closed") ? "shut" : record.portal.state;
  var doorReg = null;
  if(typeof INTERACTABLES_REGISTRY !== "undefined" && INTERACTABLES_REGISTRY){
    var doorRealmReg = INTERACTABLES_REGISTRY["ash"] || INTERACTABLES_REGISTRY["chrome"];
    doorReg = doorRealmReg ? (doorRealmReg["door@" + doorState] || null) : null;
  }
  board.interactables = [{
    archetype: "door",
    state: doorState,
    slug: doorReg ? doorReg.slug : null,
    extrudeDepth: doorReg ? doorReg.extrudeDepth : null,
    name: "door",
    x: roomDoor.x, y: roomDoor.y,
    roomSegNum: fixture.focusSegNum,
    sourceRef: record.portal.id,
    connectionId: record.connection.id,
    connectionVersion: record.connection.version
  }];
  board.dressing = [];

  return {
    board: board,
    room: room,
    plan: plan,
    fixture: fixture,
    lightRecipeId: lightRecipe.id,
    lightRecipeMode: lightRecipe.mode
  };
}

/* ─── C1B MOVEMENT ADAPTER ───────────────────────────────────────────────────────────────────
   clayRoomMovementFixtureFrom(record, compiled) projects the REAL SpatialPlan returned above into
   TacticalQueryKernel input. Geometry still comes only from spatializePlan. The crate contributes
   one occupied blocker, the record's west shoulder contributes difficult terrain, and both carved
   door cells become endpoints of ONE canonical Connection. No independently-authored half-door
   exists: record.connection owns identity/version/state; portal and board.interactables project it.
*/
function clayRoomMovementFixtureFrom(record, compiled){
  if(!record || !record.movement || !record.connection){
    throw new Error("clayRoomMovementFixtureFrom: C1B record with movement and connection required");
  }
  if(!compiled || !compiled.plan || !compiled.room){
    throw new Error("clayRoomMovementFixtureFrom: clayRoomBoardFrom output required");
  }
  if(typeof tqCellId !== "function" || typeof tqSpaceFromSpatialPlan !== "function" || typeof tqStateFrom !== "function"){
    throw new Error("clayRoomMovementFixtureFrom: src/engine/tactical-query.js must load before this call");
  }
  var plan = compiled.plan;
  var room = compiled.room;
  var targetRoom = (plan.rooms || []).find(function(candidate){
    return candidate && candidate.segNum !== compiled.fixture.focusSegNum;
  });
  if(!targetRoom) throw new Error("clayRoomMovementFixtureFrom: target room missing");

  var roomDoor = (plan.doors || []).find(function(door){
    return door
      && door.betweenSegs.indexOf(compiled.fixture.focusSegNum) >= 0
      && door.x >= room.x && door.x < room.x + room.w
      && door.y >= room.y && door.y < room.y + room.d;
  });
  var targetDoor = (plan.doors || []).find(function(door){
    return door
      && door.betweenSegs.indexOf(compiled.fixture.focusSegNum) >= 0
      && door.x >= targetRoom.x && door.x < targetRoom.x + targetRoom.w
      && door.y >= targetRoom.y && door.y < targetRoom.y + targetRoom.d;
  });
  if(!roomDoor || !targetDoor) throw new Error("clayRoomMovementFixtureFrom: both canonical connection endpoints required");

  function localPlanId(localId){
    var match = String(localId || "").match(/^c-(\d+)-(\d+)$/);
    if(!match) throw new Error("clayRoomMovementFixtureFrom: invalid local cell " + localId);
    return tqCellId(room.x + Number(match[1]), room.y + Number(match[2]));
  }
  function outwardId(door, owner){
    var edge = clayRoomDoorEdgeFor(door, owner);
    if(edge === "n") return tqCellId(door.x, door.y - 1);
    if(edge === "s") return tqCellId(door.x, door.y + 1);
    if(edge === "w") return tqCellId(door.x - 1, door.y);
    if(edge === "e") return tqCellId(door.x + 1, door.y);
    throw new Error("clayRoomMovementFixtureFrom: door endpoint is not on its room boundary");
  }
  var passageCellIds = [];
  (plan.corridors || []).forEach(function(corridor){
    if(corridor.fromSeg !== compiled.fixture.focusSegNum && corridor.toSeg !== compiled.fixture.focusSegNum) return;
    (corridor.cells || []).forEach(function(cell){
      var insideCurrent = cell.x >= room.x && cell.x < room.x + room.w
        && cell.y >= room.y && cell.y < room.y + room.d;
      var insideTarget = cell.x >= targetRoom.x && cell.x < targetRoom.x + targetRoom.w
        && cell.y >= targetRoom.y && cell.y < targetRoom.y + targetRoom.d;
      var isEndpoint = (cell.x === roomDoor.x && cell.y === roomDoor.y)
        || (cell.x === targetDoor.x && cell.y === targetDoor.y);
      if((insideCurrent || insideTarget) && !isEndpoint) return;
      var id = tqCellId(cell.x, cell.y);
      if(passageCellIds.indexOf(id) < 0) passageCellIds.push(id);
    });
  });
  var connection = {
    id: record.connection.id,
    version: record.connection.version,
    kind: record.connection.kind,
    state: record.connection.state,
    clearanceSize: record.connection.clearanceSize,
    endpoints: [
      {
        sceneId: "clay-room",
        cellId: tqCellId(roomDoor.x, roomDoor.y),
        outwardCellId: outwardId(roomDoor, room)
      },
      {
        sceneId: "clay-beyond",
        cellId: tqCellId(targetDoor.x, targetDoor.y),
        outwardCellId: outwardId(targetDoor, targetRoom)
      }
    ],
    passageCellIds: passageCellIds,
    checkContracts: [{
      id: "check-clay-warped-frame",
      method: "force-warped-frame",
      skill: "athletics",
      ability: "str",
      dc: 15,
      difficulty: "ordinary consequential uncertainty",
      objective: "force the warped door and cross",
      stakes: "failure leaves the actor at the near threshold and costs time",
      licenses: ["position-change", "time-cost"]
    }],
    alternatives: [
      "use the ordinary working hinge",
      "choose a smaller body form",
      "use another route"
    ]
  };
  var sceneIdBySegNum = {};
  sceneIdBySegNum[compiled.fixture.focusSegNum] = "clay-room";
  sceneIdBySegNum[targetRoom.segNum] = "clay-beyond";
  var space = tqSpaceFromSpatialPlan(plan, {
    id: "space-clay-c1b",
    tier: "test",
    sceneIdBySegNum: sceneIdBySegNum,
    blockedCells: [localPlanId(record.object.cell)],
    difficultCells: record.movement.difficultCells.map(localPlanId),
    connections: [connection]
  });
  var state = tqStateFrom(space, {
    id: "state-clay-c1b",
    tier: "test",
    actors: [{
      id: record.citizen.id,
      sceneId: "clay-room",
      cellId: localPlanId(record.citizen.cell),
      speedFt: record.movement.speedFt,
      bodyForm: record.citizen.bodyForm,
      checkModifiers: { athletics: 2 }
    }],
    connections: [{ id: record.connection.id, state: record.connection.state }]
  });
  return Object.freeze({
    version: 1,
    space: space,
    state: state,
    actorId: record.citizen.id,
    connectionId: record.connection.id,
    localCells: Object.freeze({
      origin: localPlanId(record.citizen.cell),
      portal: localPlanId(record.portal.cell),
      crate: localPlanId(record.object.cell),
      east: localPlanId(record.movement.routeWaypoints.east),
      west: localPlanId(record.movement.routeWaypoints.west)
    }),
    rooms: Object.freeze({
      current: Object.freeze({ sceneId: "clay-room", segNum: room.segNum }),
      beyond: Object.freeze({ sceneId: "clay-beyond", segNum: targetRoom.segNum })
    })
  });
}
