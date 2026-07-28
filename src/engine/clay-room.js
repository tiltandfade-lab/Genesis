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
  // v2 (2026-07-25, visual-correction checkpoint 1 — Adam: "there's no sprite shadow cast on the
  // standee base itself"): the standee BASE previously inherited the sprite family's passthrough
  // and kept its near-black production trim, which swallowed the card's real cast shadow
  // (measured: the shadow lands; the albedo hides it). In a diagnostic clay studio the base is a
  // physical surface under test like any other — it now routes to clay so cast shadows and AO
  // read on it. The sprite ART stays passthrough, untouched.
  version: 5,
  modes: Object.freeze(["clay", "role-id"]),
  defaultMode: "clay",
  clayColor: "#8a8a8a",       // D7's own flat clay-grey, unchanged
  unclaimedColor: "#ff00ff",  // loud: an unrouted surface must be impossible to mistake for clay
  // D12a's seam grid is part of the diagnostic surface, so its colour belongs to the same recipe.
  // It was authored WHITE against a near-black regressed floor; once CL-R0 made the floor legible
  // clay, white-on-#8a8a8a stopped reading at all. A dark line is the contrast-correct choice
  // against clay, and against the brighter role-id fills too. Opacity stays inside D12a's own
  // 0.25-0.35 law.
  // v5: 1 px WebGL lines still vanished over detailed albedo at the governed review zoom even when
  // the receipt correctly named the surface. The renderer now turns every surface-clipped segment
  // into a narrow world-space strip and alpha-weights a multiply blend, so texture remains visible
  // underneath while the grid remains visible in the final pixels.
  gridColor: "#26313b",
  gridOpacity: 0.34,
  gridStripWidth: 0.025,
  gridBlendContract: "alpha-weighted-multiply",
  roles: Object.freeze({
    floor:     Object.freeze({ route: "diagnostic-clay", roleColor: "#5f8fbf" }),
    wall:      Object.freeze({ route: "diagnostic-clay", roleColor: "#bf6f6f" }),
    riser:     Object.freeze({ route: "diagnostic-clay", roleColor: "#bf8f4f" }),
    foundation:Object.freeze({ route: "diagnostic-clay", roleColor: "#70584a" }),
    trim:      Object.freeze({ route: "diagnostic-clay", roleColor: "#8fbf5f" }),
    doorframe: Object.freeze({ route: "diagnostic-clay", roleColor: "#bfbf5f" }),
    portal:    Object.freeze({ route: "diagnostic-clay", roleColor: "#5fbf9f" }),
    pillar:    Object.freeze({ route: "diagnostic-clay", roleColor: "#9f6fbf" }),
    skirt:     Object.freeze({ route: "diagnostic-clay", roleColor: "#4f5f6f" }),
    furniture: Object.freeze({ route: "diagnostic-clay", roleColor: "#bf9f6f" }),
    emitter:   Object.freeze({ route: "passthrough",     roleColor: "#ffd88a" }),
    sprite:    Object.freeze({ route: "passthrough",     roleColor: "#ff5fbf" }),
    // v2: the standee's physical support strip — clay like every other surface under test, so the
    // sprite's own cast shadow and the contact AO are readable on it (the sprite ART stays above).
    "standee-base": Object.freeze({ route: "diagnostic-clay", roleColor: "#6fbfbf" }),
    door:      Object.freeze({ route: "passthrough",     roleColor: "#ffffff" }),
    // Found by the CL-R0 census itself: the first routed capture reported nine UNCLAIMED surfaces —
    // the citizen's own soft contact pool (addInteriorContactBlob, userData.contactBlob) and eight
    // atmosphere motes (interiorBuildMotes, userData.motePiece). Neither is site material, so neither
    // is a CR-1 defect; both were simply outside the old four-kind whitelist's imagination. They route
    // to passthrough because CL-R2's contact/shadow contract must be judged on the REAL pool, not a
    // grey stand-in. OPEN for CL-R1: whether the diagnostic modes should suppress atmosphere entirely
    // (motes are additive ember quads — honest production output, but noise in a measurement rig).
    "contact-shadow": Object.freeze({ route: "passthrough", roleColor: "#5fbfbf" }),
    mote:             Object.freeze({ route: "passthrough", roleColor: "#bf5f5f" }),
    // CL-R3 diagnostic overlays (socket axes, access faces, negative-control rejection) are
    // intentionally coloured truth aids, not architecture. They bypass the neutral-clay swap.
    "diagnostic-overlay": Object.freeze({ route: "passthrough", roleColor: "#6fcfff" }),
    // CL-R4b is an isolated material-integration fixture. These specimens carry the two candidate
    // sprite-first parents and compiled PBR maps, so the diagnostic clay sweep must leave them
    // intact. This dev-only route does not promote the candidate into production selection.
    "material-proof": Object.freeze({ route: "passthrough", roleColor: "#d4b86a" }),
    // CL-F06 is the real Assetforge ground-field candidate mounted through the production
    // interior/Clayroom realizer. Its compiled albedo + roughness are the subject under test, so
    // repainting it diagnostic grey would erase the question the fixture exists to answer.
    "ground-field-proof": Object.freeze({ route: "passthrough", roleColor: "#7f9f69" }),
    // CL-R5 composes those approved parents with the admitted h6-v1 trim family. Body and trim
    // materials remain independently switchable inside the retained fixture; the ordinary clay
    // diagnostic sweep must therefore leave the complete structure proof intact.
    "trim-proof": Object.freeze({ route: "passthrough", roleColor: "#c7b58c" })
  })
});

/* ─── Bench preview clock for celestial recipes (Adam's 2026-07-25 ruling: shadows fall from the
   clock-mapped sun) — the clay fixtures carry no live walk clock, so each celestial recipe previews
   at one FIXED, named bench time. The renderer derives direction from the shared celestial arc
   (clock -> direction, the one owner); these numbers only choose WHICH moment the bench shows.
   486 = 08:06 morning sun (oblique, warm, off the camera axis) · 1290 = 21:30 early-night moon. */
var CLAY_CELESTIAL_PREVIEW_CLOCK = Object.freeze({
  daylit: 486,
  overcast: 486,
  moonlit: 1290
});

/* ─── CL-R3 LIGHTING STUDY — SOURCE + ROOM-MOOD PAIRS ───────────────────────────────────────────
   The production recipe remains the physical/narrative source of truth. These bounded layers add
   a bounded ambient/hemisphere field plus a restrained void/fog tint. Neither light type can cast
   a shadow, and the combined authored intensity stays below the source-plus-mood energy cap. The
   field is deliberately strong enough to expose the room as a volume: the early XCOM, gloom, and
   overgrown-chamber visions use practicals as punctuation inside readable coloured ambience, not
   as the sole exposure for every surface.
   This is data so a later room/theme compiler can select it without copying UI constants. */
var CLAY_ROOM_MOOD_LAYERS = Object.freeze({
  id: "clay-room-mood-layers",
  version: 1,
  defaultId: "none",
  maxCombinedIntensity: 0.85,
  layers: Object.freeze({
    none: Object.freeze({
      id: "none", label: "SOURCE ONLY", themes: Object.freeze(["diagnostic"]),
      ambient: Object.freeze({ color: "#ffffff", intensity: 0 }),
      hemisphere: Object.freeze({ sky: "#ffffff", ground: "#ffffff", intensity: 0 }),
      void: Object.freeze({ color: "#0a0908", mix: 0 })
    }),
    "dawn-violet": Object.freeze({
      id: "dawn-violet", label: "VIOLET DAWN",
      themes: Object.freeze(["dawn", "fantasy", "occupied"]),
      ambient: Object.freeze({ color: "#695777", intensity: 0.055 }),
      hemisphere: Object.freeze({ sky: "#8a7397", ground: "#503d35", intensity: 0.105 }),
      void: Object.freeze({ color: "#23192d", mix: 0.52 })
    }),
    "crypt-violet": Object.freeze({
      id: "crypt-violet", label: "VIOLET CRYPT",
      themes: Object.freeze(["night", "gloom", "dungeon"]),
      ambient: Object.freeze({ color: "#4b4568", intensity: 0.05 }),
      hemisphere: Object.freeze({ sky: "#625c83", ground: "#292237", intensity: 0.09 }),
      void: Object.freeze({ color: "#141124", mix: 0.62 })
    }),
    "dungeon-cold": Object.freeze({
      id: "dungeon-cold", label: "COLD DUNGEON",
      themes: Object.freeze(["dungeon", "torchlit", "occupied"]),
      ambient: Object.freeze({ color: "#615c73", intensity: 0.24 }),
      hemisphere: Object.freeze({ sky: "#76718a", ground: "#312b32", intensity: 0.52 }),
      void: Object.freeze({ color: "#15131d", mix: 0.72 })
    }),
    "spore-haze": Object.freeze({
      id: "spore-haze", label: "SPORE HAZE",
      themes: Object.freeze(["organic", "fungal", "unhinged"]),
      ambient: Object.freeze({ color: "#4b685d", intensity: 0.22 }),
      hemisphere: Object.freeze({ sky: "#66877a", ground: "#2d3440", intensity: 0.46 }),
      void: Object.freeze({ color: "#10201e", mix: 0.6 })
    })
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
      // The stair's right edge is x=-0.3 in this fixture. Cube half-width is 0.575, so x=0.263
      // interlocks the two by 0.012 u: an honest right-angle contact test, not the former 0.175-u
      // exposed-floor gap that looked like an AO light leak at the close diagnostic camera.
      offset: Object.freeze({ x: 0.263, z: 0 })
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

/* ─── CL-R4b / CL-F04 — MATCHED TWO-PARENT MATERIAL INTEGRATION BENCH ──────────────────────────
   Two sprite-first parents are projected over the same minimum architecture under one camera and
   light rig: a true 3x3 floor repeat, vertical walls meeting at 90 degrees, a framed opening, an
   elevation rise, stair treads, risers, and horizontal caps. Each bay owns the same local
   world-space UV phase, so this is a parent comparison rather than a composition comparison.

   Adam accepted the dressed-ashlar SOURCE SCALE as the reference scale for a future white brick;
   that is a scale ruling, not approval of its current palette or promotion into production. Both
   parents remain taste-pending. Exact source sprites remain albedo authority; Material Maker 1.3
   contributes tangent-space normal and Godot-4 ORM channels only. Hashes come from the deterministic
   B04 v003 export receipt so the live capture names immutable admitted lineage. */
var CLAY_MATERIAL_BENCH_MATERIALS = Object.freeze([
  Object.freeze({
    id: "wall-ashlar-dressed",
    label: "Fine ashlar · white-brick scale",
    family: "white-brick-scale-reference",
    tasteStatus: "PENDING",
    scaleStatus: "ACCEPTED AS WHITE-BRICK REFERENCE",
    workflow: "sprite-first albedo + Material Maker depth",
    sourceSprite: "dev/material-lane/source-sprites/b04-masonry-interior-v001/wall-ashlar-dressed-selected-v001.png",
    sourceSha256: "580d9512e87b66a837d54dfdebf1369dc6636384e7d26c64d1030d57bee60cd9",
    graph: "dev/material-lane/graphs/b04-masonry-interior-mm-v003/b04-wall-ashlar-dressed-v003.ptex",
    graphSha256: "278de2cb298fe0f0ec337b1fa153b8ad91493d1a5de9456d88deb40079ba5600",
    exportRoot: "dev/material-lane/exports/b04-masonry-interior-mm-v003/run-a",
    exportStem: "b04-wall-ashlar-dressed-v003",
    exportReceipt: "dev/material-lane/receipts/b04-masonry-interior-mm-v003-export-receipt.json",
    maps: Object.freeze({
      albedo: Object.freeze({
        suffix: "_albedo.png",
        sha256: "362948a3d1e97fa9b3bc600a4aa1371e11edac15cbe5a78492afeed382b15ff8",
        colorSpace: "sRGB"
      }),
      normal: Object.freeze({
        suffix: "_normal.png",
        sha256: "6276d07a557e0c31d4b27aa230a2ba73d8986cb42b6923bdb1414d945a8d08d3",
        colorSpace: "linear"
      }),
      orm: Object.freeze({
        suffix: "_orm.png",
        sha256: "de2893203d364f0b5c0748a61a7b79a4e934b74a0b3e1774cae078e409c76c2b",
        colorSpace: "linear",
        channels: Object.freeze({ r: "ambient-occlusion", g: "roughness", b: "metalness" })
      })
    }),
    normalScale: 1,
    normalNegativeScale: 2.5,
    aoMapIntensity: 0.72,
    roughnessFallback: 0.78,
    metalnessFallback: 0
  }),
  Object.freeze({
    id: "wall-rough-hewn-block",
    label: "Rough-hewn block",
    family: "large-block-masonry",
    tasteStatus: "PENDING",
    scaleStatus: "REVIEW IN MATCHED BAY",
    workflow: "sprite-first albedo + Material Maker depth",
    sourceSprite: "dev/material-lane/source-sprites/b04-masonry-interior-v001/wall-rough-hewn-block-selected-v001.png",
    sourceSha256: "76762f482195e591edc5cd261b9925174c08687ca5d49bdf9f66490cafc89b01",
    graph: "dev/material-lane/graphs/b04-masonry-interior-mm-v003/b04-wall-rough-hewn-block-v003.ptex",
    graphSha256: "8831691cd3b2db6afbd2d9e91a765ac88aadcb1a677b6c6331f58763462f58a3",
    exportRoot: "dev/material-lane/exports/b04-masonry-interior-mm-v003/run-a",
    exportStem: "b04-wall-rough-hewn-block-v003",
    exportReceipt: "dev/material-lane/receipts/b04-masonry-interior-mm-v003-export-receipt.json",
    maps: Object.freeze({
      albedo: Object.freeze({
        suffix: "_albedo.png",
        sha256: "6f2af30d9bfb911d4d3b6b55b820a198902421d2360da99a57ef9b6c4d8807fe",
        colorSpace: "sRGB"
      }),
      normal: Object.freeze({
        suffix: "_normal.png",
        sha256: "e07640ed75b83b9b00070020976455641dd62ce2e071c8eaf5d0054feeb03d69",
        colorSpace: "linear"
      }),
      orm: Object.freeze({
        suffix: "_orm.png",
        sha256: "a92f9b0da981ae9e516e97976259721fb5e1f10bba5e43d2e8dfca4ef1292460",
        colorSpace: "linear",
        channels: Object.freeze({ r: "ambient-occlusion", g: "roughness", b: "metalness" })
      })
    }),
    normalScale: 1,
    normalNegativeScale: 2.5,
    aoMapIntensity: 0.72,
    roughnessFallback: 0.84,
    metalnessFallback: 0
  })
]);
var CLAY_MATERIAL_BENCH_FIXTURE = Object.freeze({
  id: "cl-f04-material-bench",
  version: 3,
  label: "CL-F04 material bench · CL-R4b",
  question: "Do two sprite-first parents retain readable scale, phase, grid contrast, and channel meaning in matched architectural bays?",
  tasteStatus: "PENDING",
  defaultMode: "pbr",
  modes: Object.freeze(["pbr", "albedo-fallback", "clay-control", "normal-negative"]),
  metersPerWorldUnit: 1.524,
  metersPerTile: 1.65,
  repeatProof: Object.freeze({
    x: 3,
    z: 3,
    clearSpanWorldUnits: 3.248031,
    contract: "three-by-three visible field measured inside the wall centerlines"
  }),
  supportFootprint: Object.freeze({
    wallThickness: 0.24,
    underlapSides: Object.freeze(["west", "north"]),
    contract: "floor substrate reaches the outer face of every wall that bears on it"
  }),
  phaseAnchor: Object.freeze({ x: -1.624016, y: 0.18, z: -1.624016 }),
  // `material` remains a compatibility alias for old dev-console readers; all live fixture logic
  // consumes `materials` and `bays`, so no renderer path can accidentally collapse back to one.
  material: CLAY_MATERIAL_BENCH_MATERIALS[0],
  materials: CLAY_MATERIAL_BENCH_MATERIALS,
  bays: Object.freeze([
    Object.freeze({
      id: "white-brick-scale-bay",
      label: "Fine white-brick scale",
      materialId: "wall-ashlar-dressed",
      offset: Object.freeze({ x: -2.05, z: 0 })
    }),
    Object.freeze({
      id: "large-block-bay",
      label: "Large rough-hewn block",
      materialId: "wall-rough-hewn-block",
      offset: Object.freeze({ x: 2.05, z: 0 })
    })
  ]),
  // Offsets are relative to the live room centre; y is measured from the host floor top.
  // 3.248031 world units = 4.95 m = exactly three 1.65 m texture tiles.
  specimens: Object.freeze([
    Object.freeze({
      id: "material-floor-3x3", role: "floor",
      // The visible room field remains exactly 3x3 repeats between wall centerlines. The solid
      // extends another half wall outward on the two bearing sides, so neither wall overhangs the
      // substrate while the open south/east edges retain the reviewed clear-span boundary.
      size: Object.freeze({ x: 3.368031, y: 0.18, z: 3.368031 }),
      offset: Object.freeze({ x: -0.06, y: 0.09, z: -0.06 }),
      traversableTop: true
    }),
    Object.freeze({
      id: "material-wall-west", role: "wall",
      size: Object.freeze({ x: 0.24, y: 2.165354, z: 3.248031 }),
      offset: Object.freeze({ x: -1.624016, y: 1.262677, z: 0 }),
      traversableTop: false
    }),
    Object.freeze({
      id: "material-wall-north-left", role: "opening",
      size: Object.freeze({ x: 1.199016, y: 2.165354, z: 0.24 }),
      offset: Object.freeze({ x: -1.024508, y: 1.262677, z: -1.624016 }),
      traversableTop: false
    }),
    Object.freeze({
      id: "material-wall-north-right", role: "opening",
      size: Object.freeze({ x: 1.199016, y: 2.165354, z: 0.24 }),
      offset: Object.freeze({ x: 1.024508, y: 1.262677, z: -1.624016 }),
      traversableTop: false
    }),
    Object.freeze({
      id: "material-opening-header", role: "opening",
      size: Object.freeze({ x: 0.85, y: 0.665354, z: 0.24 }),
      offset: Object.freeze({ x: 0, y: 2.012677, z: -1.624016 }),
      traversableTop: false
    }),
    Object.freeze({
      id: "material-raised-deck", role: "cap",
      size: Object.freeze({ x: 1.624016, y: 0.54, z: 1.624016 }),
      offset: Object.freeze({ x: 0.812008, y: 0.45, z: 0.812008 }),
      traversableTop: true
    }),
    Object.freeze({
      id: "material-step-low", role: "riser",
      // Nested ground-up stair solids: these two specimens extend beyond the floor slab's footprint,
      // so their bottoms must use the host floor datum rather than the slab-top datum.
      size: Object.freeze({ x: 1.05, y: 0.36, z: 0.54 }),
      offset: Object.freeze({ x: 0.525, y: 0.18, z: 2.434016 }),
      traversableTop: true
    }),
    Object.freeze({
      id: "material-step-high", role: "riser",
      size: Object.freeze({ x: 1.05, y: 0.54, z: 0.54 }),
      offset: Object.freeze({ x: 0.525, y: 0.27, z: 1.894016 }),
      traversableTop: true
    })
  ])
});
function clayRoomMaterialBenchFixtureFrom(record){
  if(!record || !record.dims){
    throw new Error("clayRoomMaterialBenchFixtureFrom: record with dims required");
  }
  if(record.dims.w < 7 || record.dims.d < 7){
    throw new Error("clayRoomMaterialBenchFixtureFrom: CL-F04 requires at least a 7x7 room — got " +
      record.dims.w + "x" + record.dims.d);
  }
  return CLAY_MATERIAL_BENCH_FIXTURE;
}

/* ─── CL-R5 / CL-F05 — MATCHED, FULLY TRIMMED STRUCTURE INTEGRATION BENCH ──────────────────────
   CL-F04 proved the two body parents in isolation. CL-F05 asks the next compositional question:
   can one complete, inhabitable cutaway-room recipe route wall, floor, and the six admitted h6-v1
   trim roles without seams, orphaned corners, scale drift, or tactical changes?

   The two structures are architectural twins. Their body parents swap, while the trim culture
   changes from Institutional to Upland. This prevents a flattering one-off composition from
   disguising a routing failure. Every camera-side wall remains present as Adam's ruled one-foot
   stub; far walls remain full height; the north opening is framed rather than cut into a floating
   panel. Geometry dimensions are fixture data, not procedural generation. */
var CLAY_TRIM_BENCH_SLOTS = Object.freeze([
  Object.freeze({
    id: "plain-band", semanticRole: "plain-band", profileId: "GP-TR-P00",
    rectPx: Object.freeze([0, 16, 1024, 96]), repeatWorldLength: 1
  }),
  Object.freeze({
    id: "base-course", semanticRole: "base-course", profileId: "GP-TR-P01",
    rectPx: Object.freeze([0, 144, 1024, 160]), repeatWorldLength: 1
  }),
  Object.freeze({
    id: "cornice-belt", semanticRole: "cornice-belt", profileId: "GP-TR-P02",
    rectPx: Object.freeze([0, 336, 1024, 160]), repeatWorldLength: 1.25
  }),
  Object.freeze({
    id: "coping-cap", semanticRole: "coping-cap", profileId: "GP-TR-P03",
    rectPx: Object.freeze([0, 528, 1024, 128]), repeatWorldLength: 1
  }),
  Object.freeze({
    id: "stair-nosing", semanticRole: "stair-nosing", profileId: "GP-TR-P04",
    rectPx: Object.freeze([0, 688, 1024, 96]), repeatWorldLength: 0.75
  }),
  Object.freeze({
    id: "curb-retaining", semanticRole: "curb-retaining", profileId: "GP-TR-P05",
    rectPx: Object.freeze([0, 816, 1024, 192]), repeatWorldLength: 1.25
  })
]);
var CLAY_TRIM_BENCH_CULTURES = Object.freeze([
  Object.freeze({
    id: "institutional", label: "Institutional · dressed cut stone",
    atlasRoot: "dev/material-lane/exports/b06-trim-packed-v001/run-a",
    atlasStem: "trim-institutional-h6-v1",
    atlasMetadata: "trim-institutional-h6-v1.trim-sheet.json",
    metadataSha256: "51dbba3c22c4cdceef3122eab48eea3624b6dfcd6279f6832cc5c61c6702d3a7",
    maps: Object.freeze({
      basecolor: Object.freeze({
        file: "trim-institutional-h6-v1-basecolor-512-v001.png",
        sha256: "ce3250778762283669e20249b894b06f1e8514d800479166ee4461f6e05f8170",
        colorSpace: "sRGB"
      }),
      normal: Object.freeze({
        file: "trim-institutional-h6-v1-normal-512-v001.png",
        sha256: "0c75f6bd2a9d0c1790bcedc7a8383d069a666498338c4eef1a516d32d1d4405c",
        colorSpace: "linear"
      }),
      orm: Object.freeze({
        file: "trim-institutional-h6-v1-orm-512-v001.png",
        sha256: "faebcad33ace3740bb8a40e770b2cb08dd9751d12d1e82c39e0a5346b39c5184",
        colorSpace: "linear"
      })
    }),
    coreColor: "#c7bca7"
  }),
  Object.freeze({
    id: "upland", label: "Upland · rugged field stone",
    atlasRoot: "dev/material-lane/exports/b06-trim-packed-v001/run-a",
    atlasStem: "trim-upland-h6-v1",
    atlasMetadata: "trim-upland-h6-v1.trim-sheet.json",
    metadataSha256: "a7f172a85023a525148c7e7e196fc5a811fcb9e31e0562a7f0f15ebedc0105a7",
    maps: Object.freeze({
      basecolor: Object.freeze({
        file: "trim-upland-h6-v1-basecolor-512-v001.png",
        sha256: "7399f4674f4d8f7bc645851244ac5d9ac923f96e2d3e0d6e23a8770b10757d03",
        colorSpace: "sRGB"
      }),
      normal: Object.freeze({
        file: "trim-upland-h6-v1-normal-512-v001.png",
        sha256: "73bf30ba427ee78134124f71d40c8675038e7221f800c73414d59e1a0fec6a5a",
        colorSpace: "linear"
      }),
      orm: Object.freeze({
        file: "trim-upland-h6-v1-orm-512-v001.png",
        sha256: "28a8679c322f81b62951cbdbecee1bc303033f76dcadde0667cd7b7e7c1c89fd",
        colorSpace: "linear"
      })
    }),
    coreColor: "#8f877a"
  })
]);
var CLAY_TRIM_BENCH_FIXTURE = Object.freeze({
  id: "cl-f05-trim-bench",
  version: 1,
  label: "CL-F05 complete trimmed structures · CL-R5",
  question: "Do approved wall/floor parents and all six trim roles compose into complete, believable rooms?",
  tasteStatus: "REVIEW",
  defaultMode: "pbr",
  modes: Object.freeze(["pbr", "trim-debug", "albedo-only", "clay-control"]),
  atlasLayoutId: "h6-v1",
  atlasRuntimeSize: Object.freeze([1024, 1024]),
  atlasSampleSize: Object.freeze([512, 512]),
  exportReceipt: "dev/material-lane/receipts/b06-trim-packed-v001-receipt.json",
  verificationReceipt: "dev/material-lane/receipts/b06-trim-imagegen-mm-v001-verification.json",
  slots: CLAY_TRIM_BENCH_SLOTS,
  cultures: CLAY_TRIM_BENCH_CULTURES,
  architecture: Object.freeze({
    width: 3.34,
    depth: 3.16,
    wallThickness: 0.22,
    wallHeight: 2.28,
    stubHeight: 0.2,
    stubFeet: 1,
    slabThickness: 0.18,
    openingCenterX: -0.62,
    openingWidth: 0.82,
    openingHeight: 1.48,
    platform: Object.freeze({ width: 1.42, depth: 1.18, height: 0.54 }),
    stair: Object.freeze({ width: 1.02, treadDepth: 0.48, lowHeight: 0.18, highHeight: 0.36 }),
    contactEmbed: 0.012,
    trimReliefDepth: 0.04
  }),
  structures: Object.freeze([
    Object.freeze({
      id: "institutional-workroom",
      label: "Institutional workroom",
      cultureId: "institutional",
      wallMaterialId: "wall-ashlar-dressed",
      floorMaterialId: "wall-rough-hewn-block",
      offset: Object.freeze({ x: -2.08, z: -0.12 })
    }),
    Object.freeze({
      id: "upland-guard-room",
      label: "Upland guard room",
      cultureId: "upland",
      wallMaterialId: "wall-rough-hewn-block",
      floorMaterialId: "wall-ashlar-dressed",
      offset: Object.freeze({ x: 2.08, z: -0.12 })
    })
  ]),
  routingContract: Object.freeze({
    bodyParentsPerStructure: 2,
    trimRolesPerStructure: 6,
    cutawayStubFeet: 1,
    grid: "every flat or traversable top; traversal permission remains separate",
    tactics: "fixture presentation only; zero collision, occupancy, or movement-authority mutation"
  })
});
function clayRoomTrimArchitectureAudit(fixture){
  var dims = fixture && fixture.architecture;
  if(!dims) return Object.freeze({ pass: false, reason: "missing-architecture" });
  var epsilon = 0.00001;
  var inner = {
    minX: -dims.width / 2 + dims.wallThickness,
    maxX: dims.width / 2 - dims.wallThickness,
    minZ: -dims.depth / 2 + dims.wallThickness,
    maxZ: dims.depth / 2 - dims.wallThickness
  };
  var platform = dims.platform, stair = dims.stair, embed = dims.contactEmbed;
  var platformCenter = {
    x: inner.maxX - platform.width / 2,
    z: inner.minZ + platform.depth / 2
  };
  var platformBounds = {
    minX: platformCenter.x - platform.width / 2,
    maxX: platformCenter.x + platform.width / 2,
    minZ: platformCenter.z - platform.depth / 2,
    maxZ: platformCenter.z + platform.depth / 2
  };
  var stairDepth = stair.treadDepth + embed * 2;
  var highCenterZ = platformBounds.maxZ + stair.treadDepth / 2 - embed;
  var lowCenterZ = platformBounds.maxZ + stair.treadDepth * 1.5 - embed * 2;
  var stairMinX = platformCenter.x - stair.width / 2;
  var stairMaxX = platformCenter.x + stair.width / 2;
  var highBounds = {
    minX: stairMinX, maxX: stairMaxX,
    minZ: highCenterZ - stairDepth / 2,
    maxZ: highCenterZ + stairDepth / 2
  };
  var lowBounds = {
    minX: stairMinX, maxX: stairMaxX,
    minZ: lowCenterZ - stairDepth / 2,
    maxZ: lowCenterZ + stairDepth / 2
  };
  var door = {
    minX: dims.openingCenterX - dims.openingWidth / 2,
    maxX: dims.openingCenterX + dims.openingWidth / 2
  };
  function inside(bounds){
    return bounds.minX >= inner.minX - epsilon
      && bounds.maxX <= inner.maxX + epsilon
      && bounds.minZ >= inner.minZ - epsilon
      && bounds.maxZ <= inner.maxZ + epsilon;
  }
  var rise = stair.lowHeight;
  var checks = Object.freeze({
    platformInsideRoom: inside(platformBounds),
    highTreadInsideRoom: inside(highBounds),
    lowTreadInsideRoom: inside(lowBounds),
    equalRiseSequence: Math.abs(stair.highHeight - rise * 2) <= epsilon
      && Math.abs(platform.height - rise * 3) <= epsilon,
    highTreadMeetsPlatform: highBounds.minZ <= platformBounds.maxZ + epsilon
      && highBounds.maxZ > platformBounds.maxZ,
    lowTreadMeetsHighTread: lowBounds.minZ <= highBounds.maxZ + epsilon
      && lowBounds.maxZ > highBounds.maxZ,
    curbYieldsStairOpening: stair.width < platform.width - epsilon
      && (platform.width - stair.width) / 2 > epsilon,
    doorwayClearOfPlatform: door.maxX <= platformBounds.minX - 0.05
  });
  var failed = Object.keys(checks).filter(function(key){ return !checks[key]; });
  return Object.freeze({
    pass: failed.length === 0,
    failed: Object.freeze(failed),
    checks: checks,
    innerBounds: Object.freeze(inner),
    platformBounds: Object.freeze(platformBounds),
    highTreadBounds: Object.freeze(highBounds),
    lowTreadBounds: Object.freeze(lowBounds),
    doorBounds: Object.freeze(door),
    contract: "inside-room + equal-rises + contact-overlap + open-curb + clear-doorway"
  });
}
function clayRoomTrimBenchFixtureFrom(record){
  if(!record || !record.dims){
    throw new Error("clayRoomTrimBenchFixtureFrom: record with dims required");
  }
  if(record.dims.w < 11 || record.dims.d < 9){
    throw new Error("clayRoomTrimBenchFixtureFrom: CL-F05 requires at least an 11x9 room — got " +
      record.dims.w + "x" + record.dims.d);
  }
  var architectureAudit = clayRoomTrimArchitectureAudit(CLAY_TRIM_BENCH_FIXTURE);
  if(!architectureAudit.pass){
    throw new Error("clayRoomTrimBenchFixtureFrom: invalid stair/platform integration — " +
      architectureAudit.failed.join(", "));
  }
  return CLAY_TRIM_BENCH_FIXTURE;
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

/* ─── CL-R3 / CL-F01 — STRUCTURE BENCH FIXTURE ─────────────────────────────────────────────────
   The construction grammar is data. theater-boot.js projects these dimensions and sockets through
   the production room-shell compiler and generic part assemblers; this engine file owns no THREE,
   camera, or Guard Post special case. */
var CLAY_STRUCTURE_KIT_CATALOG = Object.freeze({
  id: "genesis-structure-kit",
  version: 3,
  gridLaw: Object.freeze({
    cellFeet: 5, cellWorldUnits: 1,
    verticalQuantumFeet: 2.5, verticalQuantumWorldUnits: 0.5,
    storeyQuanta: 4, storeyFeet: 10, storeyWorldUnits: 2,
    cutawayStubFeet: 1, cutawayStubWorldUnits: 0.2,
    maxWalkableSlopeDeg: 30,
    stairAdapter: Object.freeze({
      footprintCells: 1,
      maxRiseFeet: 5,
      maxRiseWorldUnits: 1,
      examplesFeet: Object.freeze([2, 3, 5]),
      fullStoreyUnits: 2
    })
  }),
  socketTypes: Object.freeze([
    "floor-mount", "wall-mount", "top-surface", "hinge",
    "butt-join-n", "butt-join-e", "butt-join-s", "butt-join-w",
    "walk-surface", "catch", "terrain-join", "roof-pitch-join", "open"
  ]),
  accessKinds: Object.freeze(["walk", "climb-cost", "climb-dc", "none"]),
  climbMechanicsImplemented: true,
  climbLaw: Object.freeze({
    playerD20Required: true,
    defaultAthleticsModifier: 3,
    defaultDc: 15,
    severeFailureMargin: 3,
    tenFootFallDamage: "1d6"
  }),
  provenance: Object.freeze({
    author: "Genesis procedural structure grammar",
    source: "docs/STRUCTURE-KIT-CATALOG.md",
    license: "project-native",
    donorFile: null
  })
});

var CLAY_STRUCTURE_BENCH_FIXTURE = Object.freeze({
  id: "cl-f01-structure-bench",
  version: 4,
  label: "CL-F01 structure bench",
  question: "Can generic construction atoms make believable, mechanically legible architecture?",
  catalogId: CLAY_STRUCTURE_KIT_CATALOG.id,
  defaultView: "assembled",
  views: Object.freeze(["assembled", "stairs", "sockets", "access", "climb", "negative", "strategic"]),
  wallOmission: Object.freeze({
    ruleId: "camera-side-wall-omission",
    version: 1,
    initialState: Object.freeze({ staged: true, latched: true }),
    stagedEvent: "space-entered",
    releaseEvent: "space-left-play",
    doorEventsDoNotRestage: true,
    carveouts: Object.freeze({
      aperture: true,
      structuralMass: true,
      strategicView: true
    })
  }),
  // Notched shell: convex + concave corners. Its north strip holds broad +h and -h slabs.
  shellCells: Object.freeze((function(){
    var rows = [];
    for(var z = 1; z <= 6; z++){
      for(var x = 1; x <= 6; x++){
        if(x >= 5 && z <= 2) continue;
        var tier = (z >= 5 && x <= 3) ? 1 : ((z >= 5 && x >= 4) ? -1 : 0);
        rows.push(Object.freeze({
          x: x, z: z, tier: tier,
          isDoor: z === 1 && x === 3,
          sourceRef: "cl-f01:shell:" + x + "," + z
        }));
      }
    }
    return rows;
  })()),
  pieces: Object.freeze([
    Object.freeze({
      id: "straight-wall", kind: "wall-run", label: "straight wall · endpoint + cap",
      at: Object.freeze({ x: 9.5, z: 2 }), axis: "x", length: 3.5, height: 2, thickness: 0.22,
      sockets: Object.freeze([
        Object.freeze({ id: "straight-west", type: "butt-join-w", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "straight-east", type: "butt-join-e", axis: Object.freeze({ x: 1, z: 0 }) })
      ]),
      climbDC: 15,
      access: Object.freeze({ top: "walk", inner: "climb-dc", outer: "climb-dc" }),
      entry: Object.freeze({
        normal: "Athletics climb, then balance",
        small: "Athletics climb, then balance",
        topCheck: "balance"
      })
    }),
    Object.freeze({
      id: "t-junction", kind: "t-junction", label: "T-junction · single owner",
      at: Object.freeze({ x: 10.5, z: 5 }), axis: "x", length: 3, branchLength: 1.45,
      height: 2, thickness: 0.22,
      sockets: Object.freeze([
        Object.freeze({ id: "t-west", type: "butt-join-w", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "t-east", type: "butt-join-e", axis: Object.freeze({ x: 1, z: 0 }) }),
        Object.freeze({ id: "t-branch", type: "butt-join-s", axis: Object.freeze({ x: 0, z: 1 }) })
      ]),
      access: Object.freeze({ top: "none", mainInner: "none", branchInner: "none" })
    }),
    Object.freeze({
      id: "one-cell-stair", kind: "stair", label: "5×5 stair · 5 ft maximum rise",
      at: Object.freeze({ x: 11.2, z: 8.5 }), width: 1, run: 1, rise: 1, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "stair-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "stair-high", type: "top-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "two-foot-stair", kind: "stair", label: "5×5 stair · 2 ft rise",
      at: Object.freeze({ x: 8.2, z: 8.5 }), width: 1, run: 1, rise: 0.4, steps: 2,
      sockets: Object.freeze([
        Object.freeze({ id: "two-foot-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "two-foot-high", type: "top-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "three-foot-stair", kind: "stair", label: "5×5 stair · 3 ft rise",
      at: Object.freeze({ x: 9.7, z: 8.5 }), width: 1, run: 1, rise: 0.6, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "three-foot-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "three-foot-high", type: "top-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "wide-stair", kind: "stair", label: "wide 5×5 stair · 5 ft rise",
      at: Object.freeze({ x: 13.1, z: 8.5 }), width: 2, run: 1, rise: 1, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "wide-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "wide-high", type: "top-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "inside-corner-stair", kind: "stair-inner-corner", label: "inside-corner stair",
      at: Object.freeze({ x: 8.3, z: 10.6 }), width: 1.35, run: 1.35, rise: 0.6, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "inside-corner-low", type: "walk-surface", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "inside-corner-high", type: "top-surface", axis: Object.freeze({ x: 0, z: 1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "outside-corner-stair", kind: "stair-outer-corner", label: "outside-corner stair",
      at: Object.freeze({ x: 10.4, z: 10.6 }), width: 1.35, run: 1.35, rise: 0.6, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "outside-corner-low", type: "walk-surface", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "outside-corner-high", type: "top-surface", axis: Object.freeze({ x: 0, z: 1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "shallow-ramp", kind: "ramp", label: "shallow ramp · 26.565°",
      at: Object.freeze({ x: 13, z: 10.6 }), width: 1.2, run: 1, rise: 0.5,
      sockets: Object.freeze([
        Object.freeze({ id: "ramp-low", type: "terrain-join", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "ramp-high", type: "top-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ top: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "half-height-blocker", kind: "blocker", label: "half-height blocker / parapet base",
      at: Object.freeze({ x: 8.6, z: 12.5 }), axis: "x", length: 2.2, height: 0.5, thickness: 0.34,
      sockets: Object.freeze([
        Object.freeze({ id: "blocker-floor", type: "floor-mount", axis: Object.freeze({ x: 0, z: 0 }) }),
        Object.freeze({ id: "blocker-top", type: "top-surface", axis: Object.freeze({ x: 0, z: 0 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-cost" })
    }),
    Object.freeze({
      id: "square-support", kind: "support-square", label: "square support",
      at: Object.freeze({ x: 10.8, z: 12.5 }), width: 0.55, height: 2,
      sockets: Object.freeze([
        Object.freeze({ id: "square-floor", type: "floor-mount", axis: Object.freeze({ x: 0, z: 0 }) }),
        Object.freeze({ id: "square-top", type: "top-surface", axis: Object.freeze({ x: 0, z: 0 }) })
      ]),
      access: Object.freeze({ shaft: "climb-dc", top: "walk" }),
      climbDC: 15,
      entry: Object.freeze({
        normal: "climb or exceptional jump, then balance",
        small: "climb, then balance",
        topCheck: "balance"
      })
    }),
    Object.freeze({
      id: "round-support", kind: "support-round", label: "round support",
      at: Object.freeze({ x: 12.4, z: 12.5 }), radius: 0.31, height: 2,
      sockets: Object.freeze([
        Object.freeze({ id: "round-floor", type: "floor-mount", axis: Object.freeze({ x: 0, z: 0 }) }),
        Object.freeze({ id: "round-top", type: "top-surface", axis: Object.freeze({ x: 0, z: 0 }) })
      ]),
      access: Object.freeze({ shaft: "climb-dc", top: "walk" }),
      climbDC: 15,
      entry: Object.freeze({
        normal: "climb or exceptional jump, then balance",
        small: "climb, then balance",
        topCheck: "balance"
      })
    }),
    /* THE ASSEMBLED EXAMPLE. The shell's ordinary floor is already +0.5 world units above the site
       datum and the raised terrace is +1.0; every lift below is therefore an absolute offset from
       the fixture floor, not a tier ordinal. The terrace stair starts on +0.5 and lands on +1.0.
       Its parapet sits on +1.0. A separate straight proof uses two adjacent ordinary 5x5 stair
       atoms to reach an occupied 10-ft second floor; a three-cell L proof adds one turning landing. */
    Object.freeze({
      id: "assembly-approach-stair", kind: "stair", label: "ASSEMBLY · terrace stair",
      assembly: true, lift: 0.5,
      at: Object.freeze({ x: 2, z: 4 }), width: 2, run: 1, rise: 0.5, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "approach-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: -1 }) }),
        Object.freeze({ id: "approach-high", type: "top-surface", axis: Object.freeze({ x: 0, z: 1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "assembly-parapet", kind: "blocker", label: "ASSEMBLY · terrace parapet base",
      assembly: true, lift: 1,
      at: Object.freeze({ x: 2, z: 6.35 }), axis: "x", length: 2.7, height: 0.4, thickness: 0.26,
      sockets: Object.freeze([
        Object.freeze({ id: "parapet-west", type: "butt-join-w", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "parapet-east", type: "butt-join-e", axis: Object.freeze({ x: 1, z: 0 }) }),
        Object.freeze({ id: "parapet-seat", type: "top-surface", axis: Object.freeze({ x: 0, z: 0 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-cost" }),
      entry: Object.freeze({ normal: "balance", small: "walk", topCheck: "balance" })
    }),
    Object.freeze({
      id: "assembly-return-west", kind: "blocker", label: "ASSEMBLY · west corner return",
      assembly: true, lift: 1,
      at: Object.freeze({ x: 0.65, z: 5.4 }), axis: "z", length: 1.9, height: 0.4, thickness: 0.26,
      sockets: Object.freeze([
        Object.freeze({ id: "return-west-south", type: "butt-join-s", axis: Object.freeze({ x: 0, z: -1 }) }),
        Object.freeze({ id: "return-west-north", type: "butt-join-n", axis: Object.freeze({ x: 0, z: 1 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-cost" })
    }),
    Object.freeze({
      id: "assembly-return-east", kind: "blocker", label: "ASSEMBLY · east corner return",
      assembly: true, lift: 1,
      at: Object.freeze({ x: 3.35, z: 5.4 }), axis: "z", length: 1.9, height: 0.4, thickness: 0.26,
      sockets: Object.freeze([
        Object.freeze({ id: "return-east-south", type: "butt-join-s", axis: Object.freeze({ x: 0, z: -1 }) }),
        Object.freeze({ id: "return-east-north", type: "butt-join-n", axis: Object.freeze({ x: 0, z: 1 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-cost" })
    }),
    Object.freeze({
      id: "assembly-post-west", kind: "support-square", label: "terrace post W · diagnostic",
      assembly: false, lift: 0.5,
      at: Object.freeze({ x: 0.75, z: 4.55 }), width: 0.45, height: 1.1,
      sockets: Object.freeze([
        Object.freeze({ id: "post-w-floor", type: "floor-mount", axis: Object.freeze({ x: 0, z: 0 }) }),
        Object.freeze({ id: "post-w-top", type: "top-surface", axis: Object.freeze({ x: 0, z: 0 }) })
      ]),
      access: Object.freeze({ shaft: "climb-dc", top: "walk" }),
      climbDC: 12,
      entry: Object.freeze({ normal: "climb, then balance", small: "climb, then balance", topCheck: "balance" })
    }),
    Object.freeze({
      id: "assembly-post-east", kind: "support-square", label: "terrace post E · diagnostic",
      assembly: false, lift: 0.5,
      at: Object.freeze({ x: 3.25, z: 4.55 }), width: 0.45, height: 1.1,
      sockets: Object.freeze([
        Object.freeze({ id: "post-e-floor", type: "floor-mount", axis: Object.freeze({ x: 0, z: 0 }) }),
        Object.freeze({ id: "post-e-top", type: "top-surface", axis: Object.freeze({ x: 0, z: 0 }) })
      ]),
      access: Object.freeze({ shaft: "climb-dc", top: "walk" }),
      climbDC: 12,
      entry: Object.freeze({ normal: "climb, then balance", small: "climb, then balance", topCheck: "balance" })
    }),
    Object.freeze({
      id: "assembly-story-lower-stair", kind: "stair", label: "ASSEMBLY · storey stair 1 of 2",
      assembly: true,
      proofFamily: "straight-storey",
      direction: -1,
      at: Object.freeze({ x: 10, z: 10 }), width: 1, run: 1, rise: 1, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "story-lower-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "story-lower-high", type: "top-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "assembly-story-landing", kind: "platform", label: "DIAGNOSTIC · optional 5 ft landing",
      assembly: false, lift: 1,
      at: Object.freeze({ x: 13, z: 10 }), width: 1, depth: 1, thickness: 0.18,
      sockets: Object.freeze([
        Object.freeze({ id: "story-landing-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "story-landing-high", type: "walk-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-cost" })
    }),
    Object.freeze({
      id: "assembly-story-upper-stair", kind: "stair", label: "ASSEMBLY · storey stair 2 of 2",
      assembly: true, proofFamily: "straight-storey", lift: 1, direction: -1,
      at: Object.freeze({ x: 10, z: 9 }), width: 1, run: 1, rise: 1, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "story-upper-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "story-upper-high", type: "top-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "assembly-second-floor", kind: "platform", label: "ASSEMBLY · occupied second floor",
      assembly: true, proofFamily: "straight-storey", lift: 2,
      at: Object.freeze({ x: 10, z: 7.5 }), width: 3, depth: 2, thickness: 0.2,
      sockets: Object.freeze([
        Object.freeze({ id: "second-floor-entry", type: "walk-surface", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "second-floor-top", type: "top-surface", axis: Object.freeze({ x: 0, z: 0 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-dc" }),
      climbDC: 15,
      entry: Object.freeze({ normal: "two stair units or Athletics climb", small: "two stair units or Athletics climb", topCheck: "none" })
    }),
    Object.freeze({
      id: "l-storey-lower-stair", kind: "stair", label: "L STOREY · lower flight",
      assembly: false, proofFamily: "l-storey", direction: -1,
      at: Object.freeze({ x: 13, z: 11 }), width: 1, run: 1, rise: 1, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "l-storey-lower-low", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "l-storey-lower-high", type: "top-surface", axis: Object.freeze({ x: 0, z: -1 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "l-storey-landing", kind: "platform", label: "L STOREY · turning landing",
      assembly: false, proofFamily: "l-storey", lift: 1,
      at: Object.freeze({ x: 13, z: 10 }), width: 1, depth: 1, thickness: 0.18,
      sockets: Object.freeze([
        Object.freeze({ id: "l-storey-landing-south", type: "walk-surface", axis: Object.freeze({ x: 0, z: 1 }) }),
        Object.freeze({ id: "l-storey-landing-west", type: "walk-surface", axis: Object.freeze({ x: -1, z: 0 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-cost" })
    }),
    Object.freeze({
      id: "l-storey-upper-stair", kind: "stair", label: "L STOREY · upper turning flight",
      assembly: false, proofFamily: "l-storey", lift: 1, axis: "x", direction: -1,
      at: Object.freeze({ x: 12, z: 10 }), width: 1, run: 1, rise: 1, steps: 3,
      sockets: Object.freeze([
        Object.freeze({ id: "l-storey-upper-low", type: "walk-surface", axis: Object.freeze({ x: 1, z: 0 }) }),
        Object.freeze({ id: "l-storey-upper-high", type: "top-surface", axis: Object.freeze({ x: -1, z: 0 }) })
      ]),
      access: Object.freeze({ treads: "walk", sides: "climb-cost", underside: "none" })
    }),
    Object.freeze({
      id: "l-storey-second-floor", kind: "platform", label: "L STOREY · occupied second floor",
      assembly: false, proofFamily: "l-storey", lift: 2,
      at: Object.freeze({ x: 10.5, z: 10 }), width: 2, depth: 2, thickness: 0.2,
      sockets: Object.freeze([
        Object.freeze({ id: "l-storey-deck-east", type: "walk-surface", axis: Object.freeze({ x: 1, z: 0 }) }),
        Object.freeze({ id: "l-storey-deck-top", type: "top-surface", axis: Object.freeze({ x: 0, z: 0 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-dc" }),
      climbDC: 15,
      entry: Object.freeze({ normal: "two flights plus turning landing", small: "two flights plus turning landing", topCheck: "none" })
    }),
    Object.freeze({
      id: "assembly-workroom-back-west", kind: "wall-run", label: "ASSEMBLY · workroom back wall W",
      assembly: true,
      at: Object.freeze({ x: 9, z: 8.5 }), axis: "x", length: 1, height: 2, thickness: 0.22,
      sockets: Object.freeze([
        Object.freeze({ id: "workroom-back-west", type: "butt-join-w", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "workroom-back-door-w", type: "open", axis: Object.freeze({ x: 1, z: 0 }) })
      ]),
      climbDC: 15,
      access: Object.freeze({ top: "walk", inner: "climb-dc", outer: "climb-dc" }),
      entry: Object.freeze({ normal: "Athletics climb, then balance", small: "Athletics climb, then balance", topCheck: "balance" })
    }),
    Object.freeze({
      id: "assembly-workroom-back-east", kind: "wall-run", label: "ASSEMBLY · workroom back wall E",
      assembly: true,
      at: Object.freeze({ x: 11, z: 8.5 }), axis: "x", length: 1, height: 2, thickness: 0.22,
      sockets: Object.freeze([
        Object.freeze({ id: "workroom-back-door-e", type: "open", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "workroom-back-east", type: "butt-join-e", axis: Object.freeze({ x: 1, z: 0 }) })
      ]),
      climbDC: 15,
      access: Object.freeze({ top: "walk", inner: "climb-dc", outer: "climb-dc" }),
      entry: Object.freeze({ normal: "Athletics climb, then balance", small: "Athletics climb, then balance", topCheck: "balance" })
    }),
    Object.freeze({
      id: "assembly-workroom-west", kind: "wall-run", label: "ASSEMBLY · workroom west wall",
      assembly: true,
      at: Object.freeze({ x: 8.5, z: 7.5 }), axis: "z", length: 2, height: 2, thickness: 0.22,
      sockets: Object.freeze([
        Object.freeze({ id: "workroom-west-south", type: "butt-join-s", axis: Object.freeze({ x: 0, z: -1 }) }),
        Object.freeze({ id: "workroom-west-north", type: "butt-join-n", axis: Object.freeze({ x: 0, z: 1 }) })
      ]),
      climbDC: 15,
      access: Object.freeze({ top: "walk", inner: "climb-dc", outer: "climb-dc" }),
      entry: Object.freeze({ normal: "Athletics climb, then balance", small: "Athletics climb, then balance", topCheck: "balance" })
    }),
    Object.freeze({
      id: "assembly-workroom-east", kind: "wall-run", label: "ASSEMBLY · workroom east wall",
      assembly: true,
      at: Object.freeze({ x: 11.5, z: 7.5 }), axis: "z", length: 2, height: 2, thickness: 0.22,
      sockets: Object.freeze([
        Object.freeze({ id: "workroom-east-south", type: "butt-join-s", axis: Object.freeze({ x: 0, z: -1 }) }),
        Object.freeze({ id: "workroom-east-north", type: "butt-join-n", axis: Object.freeze({ x: 0, z: 1 }) })
      ]),
      climbDC: 15,
      access: Object.freeze({ top: "walk", inner: "climb-dc", outer: "climb-dc" }),
      entry: Object.freeze({ normal: "Athletics climb, then balance", small: "Athletics climb, then balance", topCheck: "balance" })
    }),
    Object.freeze({
      id: "assembly-second-parapet-west", kind: "blocker", label: "ASSEMBLY · second-floor parapet W",
      assembly: true, lift: 2,
      at: Object.freeze({ x: 8.95, z: 8.35 }), axis: "x", length: 0.8, height: 0.4, thickness: 0.26,
      sockets: Object.freeze([
        Object.freeze({ id: "second-parapet-west", type: "butt-join-w", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "second-parapet-door-w", type: "open", axis: Object.freeze({ x: 1, z: 0 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-cost" })
    }),
    Object.freeze({
      id: "assembly-second-parapet-east", kind: "blocker", label: "ASSEMBLY · second-floor parapet E",
      assembly: true, lift: 2,
      at: Object.freeze({ x: 11.05, z: 8.35 }), axis: "x", length: 0.8, height: 0.4, thickness: 0.26,
      sockets: Object.freeze([
        Object.freeze({ id: "second-parapet-door-e", type: "open", axis: Object.freeze({ x: -1, z: 0 }) }),
        Object.freeze({ id: "second-parapet-east", type: "butt-join-e", axis: Object.freeze({ x: 1, z: 0 }) })
      ]),
      access: Object.freeze({ top: "walk", faces: "climb-cost" })
    })
  ]),
  opening: Object.freeze({
    id: "hinged-opening", state: "ajar", width: 0.72, height: 1.6, threshold: true,
    socket: Object.freeze({ id: "opening-hinge", type: "hinge", axis: Object.freeze({ x: 1, z: 0 }) }),
    access: Object.freeze({ threshold: "walk", leaf: "none", frame: "none" }),
    swingClearanceDeg: 90
  }),
  // One production standee behind one production pillar forces the existing sightline classifier
  // to demonstrate the remaining dynamic cutaway/ghost path. It is a scale/cutaway witness, not a
  // new structure atom and not a second occlusion algorithm.
  cutawayWitness: Object.freeze({
    id: "structure-cutaway-witness",
    pieceSlug: "spr-pc-human-fighter-female",
    pieceCell: Object.freeze({ x: 6.7, z: 8.8 }),
    occluder: Object.freeze({
      id: "structure-cutaway-pillar",
      at: Object.freeze({ x: 7.6, z: 9.7 }),
      sx: 0.7, sy: 2, sz: 0.7, profile: "square"
    })
  }),
  negativeControl: Object.freeze({
    id: "wrong-axis-join", label: "wrong-axis socket · must reject",
    at: Object.freeze({ x: 12.2, z: 5.6 }),
    source: Object.freeze({ id: "bad-source-east", type: "butt-join-e", axis: Object.freeze({ x: 1, z: 0 }) }),
    candidate: Object.freeze({ id: "bad-candidate-north", type: "butt-join-n", axis: Object.freeze({ x: 0, z: -1 }) }),
    expectedReason: "socket-axis-mismatch"
  })
});

/* CL-R3 ACCESS RESOLUTION. Geometry and selection stay renderer-owned, but the check is a pure,
   deterministic rule answer. Like TacticalQueryKernel's uncertain traversals, the caller supplies
   the player's open d20; this function never rolls or reads mutable world state. */
function clayStructureClimbResolve(target, input){
  input = input || {};
  var law = CLAY_STRUCTURE_KIT_CATALOG.climbLaw;
  var access = target && target.access || {};
  var climbClass = access.shaft || access.faces || access.inner || access.outer || null;
  if(climbClass !== "climb-dc"){
    return Object.freeze({
      ok: false,
      reason: climbClass === "climb-cost" ? "climb-cost-no-check" : "target-not-check-climbable"
    });
  }
  if(!Number.isInteger(input.d20) || input.d20 < 1 || input.d20 > 20){
    return Object.freeze({
      ok: false,
      reason: "player-d20-required",
      min: 1,
      max: 20
    });
  }
  var dc = Number.isFinite(Number(target.climbDC)) ? Number(target.climbDC) : law.defaultDc;
  var modifier = Number.isFinite(Number(input.athleticsModifier))
    ? Number(input.athleticsModifier)
    : law.defaultAthleticsModifier;
  var total = input.d20 + modifier;
  var passed = total >= dc;
  var missBy = passed ? 0 : dc - total;
  var severe = !passed && missBy >= law.severeFailureMargin;
  return Object.freeze({
    ok: true,
    targetId: String(target.id || "climb-target"),
    skill: "athletics",
    d20: input.d20,
    modifier: modifier,
    total: total,
    dc: dc,
    passed: passed,
    outcome: passed ? "perched" : (severe ? "fell" : "lost-grip"),
    fall: severe,
    prone: severe,
    fallFeet: severe ? 10 : 0,
    damage: severe ? law.tenFootFallDamage : "none",
    movementWasted: !passed,
    balanceRequired: passed && !!(target.entry && target.entry.topCheck === "balance")
  });
}

/* The wall-omission latch is scene truth, not door-angle truth. The C1B connection state machine
   supplies door-state events, but those events deliberately preserve this latch: opening a door
   does not reveal an entire room, and closing it does not erase actors who have already entered.
   Only explicit staging/release events change the room's participation in play. */
function clayStructureStagingLatchTransition(state, event){
  var prior = state && typeof state === "object" ? state : { staged: false, latched: false };
  var next = {
    staged: !!prior.staged,
    latched: !!prior.latched,
    lastEvent: prior.lastEvent || "initial-sealed",
    doorState: prior.doorState || "shut"
  };
  var type = event && event.type;
  if(type === CLAY_STRUCTURE_BENCH_FIXTURE.wallOmission.stagedEvent){
    next.staged = true;
    next.latched = true;
  } else if(type === CLAY_STRUCTURE_BENCH_FIXTURE.wallOmission.releaseEvent){
    next.staged = false;
    next.latched = false;
  } else if(type === "door-state"){
    var doorState = String(event.state || "");
    if(["shut", "ajar", "open"].indexOf(doorState) < 0){
      throw new Error("clayStructureStagingLatchTransition: unknown door state " + doorState);
    }
    next.doorState = doorState;
  } else {
    throw new Error("clayStructureStagingLatchTransition: unknown event " + String(type));
  }
  next.lastEvent = type;
  return Object.freeze(next);
}

function clayStructureSocketJoinAssessment(source, candidate){
  if(!source || !candidate) return Object.freeze({ accepted: false, reason: "socket-missing" });
  var a = source.axis || {}, b = candidate.axis || {};
  var opposing = Number(a.x || 0) + Number(b.x || 0) === 0
    && Number(a.z || 0) + Number(b.z || 0) === 0;
  if(!opposing) return Object.freeze({ accepted: false, reason: "socket-axis-mismatch" });
  var sourceButt = String(source.type || "").indexOf("butt-join-") === 0;
  var candidateButt = String(candidate.type || "").indexOf("butt-join-") === 0;
  if(sourceButt !== candidateButt) return Object.freeze({ accepted: false, reason: "socket-type-mismatch" });
  return Object.freeze({ accepted: true, reason: "compatible" });
}

function clayRoomStructureBenchFixtureFrom(record){
  if(!record || !record.dims){
    throw new Error("clayRoomStructureBenchFixtureFrom: record with dims required");
  }
  if(record.dims.w < 15 || record.dims.d < 15){
    throw new Error("clayRoomStructureBenchFixtureFrom: CL-F01 requires the 15x15 construction room — got " +
      record.dims.w + "x" + record.dims.d);
  }
  var bad = CLAY_STRUCTURE_BENCH_FIXTURE.negativeControl;
  var assessment = clayStructureSocketJoinAssessment(bad.source, bad.candidate);
  if(assessment.accepted || assessment.reason !== bad.expectedReason){
    throw new Error("clayRoomStructureBenchFixtureFrom: negative control did not reject by " + bad.expectedReason);
  }
  return CLAY_STRUCTURE_BENCH_FIXTURE;
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
  if(k === "clay-diagnostic-overlay") return "diagnostic-overlay";
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
  var object = Object.freeze({
    id: "obj-crate-c1a",
    kind: "crate",
    cell: clayCellId(6, 7),
    access: Object.freeze({
      top: "walk",
      faces: "climb-cost",
      smallEntry: "relaxed step/clamber",
      normalEntry: "ordinary climb"
    })
  });

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
      recipeId: lightRecipe.id,
      // Adam's ruling (2026-07-25): "the shadows should fall relative to the actual position of
      // the sun since its position is mapped to the actual clock." The celestial arc
      // (clock -> sun/moon direction) is the ONE owner of celestial light direction; a celestial
      // light therefore carries its world clock so the renderer derives direction from the arc
      // instead of a second authored-azimuth authority. The clay fixtures have no live walk clock,
      // so each celestial recipe previews at a fixed bench time (morning sun, late-evening moon —
      // oblique angles that keep cast shadows readable under the fixed production camera).
      clockMin: (lightRecipe.source && lightRecipe.source.class === "celestial"
        && CLAY_CELESTIAL_PREVIEW_CLOCK[lightRecipe.id] != null)
        ? CLAY_CELESTIAL_PREVIEW_CLOCK[lightRecipe.id] : null,
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
      // Checkpoint 2 (2026-07-25): EVERY recipe light carries its authored, validated reach. The
      // renderer's small-pool safety cap (ITR_LIGHT_DISTANCE_CAP) exists for generic GENERATED
      // interior lights; a lock-registry recipe range is reviewed data by definition, and capping
      // it silently was the root cause of the warm/cool pair dying half a room short of the
      // subjects while the readout kept printing the authored 18.288 m (root-cause notes §2).
      authoredRange: true,
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
