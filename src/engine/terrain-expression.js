/* ─── TERRAIN EXPRESSION — the dressing chassis (docs/TERRAIN-EXPRESSION-BUILD.md) ─────────────
   Adam, 2026-07-28: "we gotta have a world that isn't just big chonky blocks, we need some
   subtlety, even if it's just dressing or trickery."

   THE PARTITION this module exists to enforce (§0 of the build spec): SHAPE BELONGS ON THE FACES,
   DRESSING BELONGS ON THE FLOOR, AND THE ARRIS CARRIES BOTH. Three independent measurements say a
   walkable cell top must stay almost flat:

     1. the standee protected area is a disc of 0.932 wu — 93% of the cell (TERRAIN_STANDEE_CONTRACT
        below, measured off the real THREE.ExtrudeGeometry the game builds);
     2. TERRAIN_WALK_NOISE_BUDGET_H.perCellH = 0.0774h = 2.32 inches of relief per walkable cell;
     3. FFT keeps walkable tops flat or gently graded and spends its expression at the edges.

   So every device here is RENDER-ONLY by construction. Nothing in this file writes a height, a
   standable flag, a walk edge, a cover value or an occupancy. The instrument that PROVES that is
   terrainWalkFingerprint() — a fingerprint over the field's current occupancy, walking, climbing,
   movement-cost, face, and entry facts, so "cosmetic" is one comparable string instead of a claim.

   Engine layer. No THREE, no DOM, no camera. Heights are in QUANTA (h) exactly like
   terrain-field.js; the standee-contract numbers are in WORLD UNITS (wu) because that is the space
   the plinth is built in. Both are labelled at every boundary.

   Deterministic: seeded off terrainHash32 like the rest of the chassis, never Math.random. */

/* ─── the three dressing bins, plus the one that leaves this module ──────────────────────────
   GOLDEN-SITES-CATALOG's site pipeline step 3 and URBAN-STUDY-BRIEF lane 2. `geometry` is named so
   a device that is secretly a shape change cannot hide in a dressing bin. */
var TERRAIN_EXPRESSION_BINS = Object.freeze(["material", "decal", "prop", "geometry"]);

/* ─── THE DEVICE REGISTRY ─────────────────────────────────────────────────────────────────────
   Every device is independently switchable so the proof can isolate it (§2). `gameplay:false` is
   an assertion this file's own gate re-proves per device, never a promise. */
var TERRAIN_EXPRESSION_DEVICES = Object.freeze([
  Object.freeze({ id: "A1", key: "jitter", bin: "prop", rung: "A",
    label: "per-instance sink / tilt / yaw jitter", gameplay: false,
    grounds: "GRID-BREAKING-STUDY §4 rank 1 — the defect is identical posing, not repetition." }),
  Object.freeze({ id: "A2", key: "rollover", bin: "material", rung: "A",
    label: "material roll-over at the arris", gameplay: false,
    grounds: "FFT-SURFACE-GRAMMAR §3 rank 1 — the #1 Minecraft-breaking device in the corpus." }),
  Object.freeze({ id: "A3", key: "chamfer", bin: "geometry", rung: "A",
    label: "the arris chamfer (cap overhang, strictly below the top plane)", gameplay: false,
    grounds: "STANDEE-CONTRACT §5 — corner softening below the top plane intrudes 0.000 wu." }),
  Object.freeze({ id: "A4", key: "joint", bin: "material", rung: "A",
    label: "the two-frequency joint (fine unit + one coarse course at cell pitch)", gameplay: false,
    grounds: "GRID-BREAKING-STUDY §2.1 — hide the grid by making the grid diegetic." }),
  Object.freeze({ id: "A5", key: "occluders", bin: "prop", rung: "A",
    label: "edge-biased occluders", gameplay: false,
    grounds: "FFT-SURFACE-GRAMMAR §3 rank 2 — break the grid with something not on the grid." }),
  Object.freeze({ id: "A6", key: "wash", bin: "material", rung: "A",
    label: "cavity-darken + curvature-lighten", gameplay: false,
    grounds: "GRID-BREAKING-STUDY §2.8 — wash and drybrush, driven off the real height channel." }),
  Object.freeze({ id: "B1", key: "slopeplinth", bin: "geometry", rung: "B",
    label: "the plinth tilts to the cell's declared stand plane", gameplay: false,
    grounds: "STANDEE-CONTRACT §3(d) — the only option with zero error at every yaw." }),
  Object.freeze({ id: "B2", key: "nosing", bin: "geometry", rung: "B",
    label: "cell-scale stair nosing (the tread overhangs its riser)", gameplay: false,
    grounds: "FFT-SURFACE-GRAMMAR §2.4 — the nosing is what stops a run reading as stacked cubes." }),
  Object.freeze({ id: "B4", key: "fold", bin: "geometry", rung: "B",
    label: "feature-scoped interior relief over the responsive FFT facets", gameplay: false,
    grounds: "local berm/root/scree relief only; it is zero at the cell centre and perimeter." }),
  Object.freeze({ id: "C1", key: "shallowgrade", bin: "geometry", rung: "C",
    label: "the render-only grade ladder (g3 continuity default; g2 FFT comparison)",
    gameplay: false,
    grounds: "FFT-SURFACE-GRAMMAR §2.2 — Genesis's only legal slope is 26.565 deg; FFT's common one is 18." }),
  /* R2 round, Adam's R6 ruling. GEOMETRY, not decal — the affordance is proud rock, and it rides
     the MATERIAL rung on purpose so it is present in the frame Adam already said he prefers. It is
     also the one device in this registry whose `gameplay` flag is honestly TRUE-pending: the relief
     is render-only today, but the eased DC band it expresses is a gameplay proposal awaiting a
     founder ruling, and saying so here is cheaper than discovering it later. */
  Object.freeze({ id: "R6", key: "climbease", bin: "geometry", rung: "R2",
    label: "climbable rock bits on an eased face (the visible half of the eased DC band)",
    gameplay: false,
    gameplayPending: "the eased climb DC is PROPOSED — TERRAIN_CLIMB_EASED, awaiting Adam",
    grounds: "Adam 2026-07-28 — 'some edges where there are little rock bits that maybe a character can climb with a low or auto DC check vs the standard.'" })
]);

var TERRAIN_EXPRESSION_DEVICE_KEYS = Object.freeze(
  TERRAIN_EXPRESSION_DEVICES.map(function(d){ return d.key; }));

/* ─── THE LADDER (§5) ─────────────────────────────────────────────────────────────────────────
   naked -> +material -> retired-decal compatibility control -> +prop -> all -> jitter-disabled
   negative control. The geometry
   devices (chamfer / plinth tilt / nosing / fold / grade) ride the MATERIAL rung, because the whole
   point of the ladder is bin isolation and a geometry-only rung would isolate nothing Adam is
   ruling on. They are still bin-labelled `geometry` in the registry so that choice stays visible
   rather than laundered. */
var TERRAIN_EXPRESSION_RUNGS = Object.freeze([
  Object.freeze({ id: "naked", index: 0, label: "A0 · NAKED",
    bins: Object.freeze([]),
    claim: "chassis + base material + the ruled grid overlay. Big chonky blocks, photographed honestly." }),
  Object.freeze({ id: "material", index: 1, label: "A1 · MATERIAL BIN ONLY",
    bins: Object.freeze(["material", "geometry"]),
    claim: "can the material bin alone do it? If yes the prop spend never has to happen." }),
  /* Kept as a URL-compatible comparison rung because historical capture packets name `decal`.
     It intentionally adds nothing now: Adam rejected A7's regular sedimentary face bands, and an
     old capture URL must not be able to resurrect them. */
  Object.freeze({ id: "decal", index: 2, label: "A2 · RETIRED FACE-BAND CONTROL",
    bins: Object.freeze(["material", "geometry", "decal"]),
    claim: "historical URL control; identical to material after regular face banding was removed." }),
  Object.freeze({ id: "prop", index: 3, label: "A3 · + PROP BIN",
    bins: Object.freeze(["material", "geometry", "decal", "prop"]),
    claim: "what props buy over material." }),
  Object.freeze({ id: "all", index: 4, label: "A4 · ALL THREE",
    bins: Object.freeze(["material", "geometry", "decal", "prop"]),
    claim: "the answer to the actual question." }),
  Object.freeze({ id: "nojitter", index: 5, label: "A5 · NEGATIVE CONTROL",
    bins: Object.freeze(["material", "geometry", "decal", "prop"]),
    disable: Object.freeze(["jitter"]),
    claim: "all three bins, jitter disabled. If this reads as well as A4, the cheap dozen's #1 is wrong." })
]);

var TERRAIN_EXPRESSION_RUNG_IDS = Object.freeze(
  TERRAIN_EXPRESSION_RUNGS.map(function(r){ return r.id; }));

/* Resolve a rung id (plus optional explicit per-device overrides) into a flat flags object. An
   unknown rung is a build error, not a silent fallback to naked — a capture labelled `prop` that
   quietly rendered naked is exactly the class of lie the light-recipe round already cost us. */
function terrainExpressionFlags(rungId, overrides){
  var id = rungId == null ? "naked" : String(rungId);
  var rung = TERRAIN_EXPRESSION_RUNGS.filter(function(r){ return r.id === id; })[0];
  if(!rung) throw new Error("terrainExpressionFlags: unknown rung " + id);
  var flags = { rungId: rung.id, rungIndex: rung.index, rungLabel: rung.label, on: [], off: [] };
  TERRAIN_EXPRESSION_DEVICES.forEach(function(d){
    var on = rung.bins.indexOf(d.bin) >= 0;
    if(on && rung.disable && rung.disable.indexOf(d.key) >= 0) on = false;
    if(overrides && Object.prototype.hasOwnProperty.call(overrides, d.key)) on = !!overrides[d.key];
    flags[d.key] = on;
    (on ? flags.on : flags.off).push(d.id);
  });
  /* R2 R4 — WHICH RUNG OF THE GRADE LADDER this render carries. Same discipline as the rung id: an
     unknown grade throws rather than falling back, because a frame labelled `g4` that quietly
     rendered `g2` is the identical class of lie. Omitted = the ladder's own declared default.
     The continuity repair promotes that default to g3: it is the only rung that consumes an
     authored one-quantum-per-cell run without leaving a residual riser or inventing height. */
  var gradeId = (overrides && overrides.gradeId != null)
    ? String(overrides.gradeId) : TERRAIN_GRADE_LADDER_DEFAULT;
  var grade = terrainGradeById(gradeId);
  flags.gradeId = grade.id;
  flags.gradeScale = grade.gradeH;
  flags.gradeDeg = grade.deg;
  flags.gradeMode = grade.mode;
  flags.anyDevice = flags.on.length > 0;
  return flags;
}

/* ─── R4 · THE GRADE LADDER (Adam 2026-07-28: "we just need to change our own rules") ──────────
   *"i think we literally can express what FFT does, we just need to change our own rules… none of
   the angles look particularly impossible… though the steepest ones look like they should be the
   max."*

   The R1 build had ONE render-only grade, 0.65 quanta per cell = 18.00 deg. This is that single
   step turned into a declared ladder, so Adam can see every angle beside every other one and rule.

   HOW TO READ `gradeH`. It is the maximum response a tile may spend while connecting its authored
   centre to the shared edge/corner network. At g3, a natural 1h neighbour pair meets exactly at its
   shared midpoint and the surrounding tiles can resolve as inclines, convex crests, concave
   hollows, saddles, or rolling transitions. G1/g2 remain comparison registers: because their
   declared angle is too shallow to bridge integer centres one cell apart, they retain the
   unspent difference as a curb rather than lying about the angle. `edgeDeg` remains comparison
   metadata from the R2 study.

   EVERY RUNG IS RENDER-ONLY. The integer heightfield, the walkable census, cover and LOS do not
   move for any of them — terrainWalkFingerprint is byte-identical across the whole ladder and that
   is gated, not claimed. Whether Genesis ADOPTS any of these as a logical grade (a real
   half-quantum height, which changes walkability) is a founder decision and is NOT taken here. */
var TERRAIN_GRADE_LADDER = Object.freeze([
  Object.freeze({ id: "g0", gradeH: 0, deg: 0, edgeDeg: 0, mode: "render-only",
    label: "flat — the chassis as it has always drawn it",
    grounds: "the control. A cell top with no grade at all; every rung below is measured against it." }),
  Object.freeze({ id: "g1", gradeH: 0.325, deg: 9.2299, edgeDeg: 4.6451, mode: "render-only",
    label: "the gentle grade",
    grounds: "half of FFT's common walkable grade — the register a 1h step across TWO cells implies, and the shallowest fold the eye still reads as a slope rather than as a flat." }),
  Object.freeze({ id: "g2", gradeH: 0.65, deg: 18.0042, edgeDeg: 9.2299, mode: "render-only",
    label: "the corpus grade (R1's shipped default)",
    grounds: "FFT-SURFACE-GRAMMAR §2.2 — the grade the 22-map corpus uses most, measured off image2's move-range quads. This is TERRAIN_SHALLOW_GRADE_H from the R1 build, unchanged." }),
  Object.freeze({ id: "g3", gradeH: 1.0, deg: 26.5651, edgeDeg: 14.0362, mode: "render-only",
    label: "the walkable step — Genesis's only currently LEGAL slope",
    grounds: "1 quantum across 1 cell = TERRAIN_GRID_LAW.walkableStepQuanta. Everything at or under this is already walkable by the one geometric law; rendering it costs no permission at all." }),
  Object.freeze({ id: "g4", gradeH: 1.1547, deg: 30.0000, edgeDeg: 16.1021, mode: "render-only",
    label: "PROPOSED MAXIMUM — the stated walk limit",
    grounds: "TERRAIN_GRID_LAW.maxWalkableSlopeDeg = 30, and TERRAIN_WALK_NOISE_BUDGET_H.maxRenderedStepH = tan(30)*5/2.5 = 1.1547h is already the chassis's own RENDERED ceiling — the number the walkable noise budget is derived from. Nothing steeper can be rendered without contradicting a constant the engine already publishes." })
]);

/* The default is the one grade that can join a genuine 1h-per-cell run without either inventing
   height or leaving a residual riser. g2 remains the common FFT *visual* register and stays in the
   comparison ladder, but applying 0.65 independently to neighbouring integer tiers necessarily
   leaves 0.35h between them. The production default therefore uses the chassis's own legal 1h
   grade; shallower authored ramps need a longer logical run rather than an angle multiplier. */
var TERRAIN_GRADE_LADDER_DEFAULT = "g3";

/* THE MAXIMUM, PROPOSED (R4 asks for a proposal with evidence, never a silent adoption).

   Adam: *"the steepest ones look like they should be the max."* Two candidates answer that, and
   they are 3.4 deg apart:

     26.565 deg (g3) — the walkable STEP. One quantum across one cell. It is what the Lipschitz
       clamp already guarantees between two walk-connected cell centres, so a render at this angle
       can never overstate what the walk graph permits. Conservative, and provably free.
     30.000 deg (g4) — the stated LIMIT. TERRAIN_GRID_LAW.maxWalkableSlopeDeg has read 30 since the
       chassis was written, and TERRAIN_WALK_NOISE_BUDGET_H exists precisely because 30 deg leaves
       0.1547h of sub-quantum headroom OVER the 1h step — headroom the budget then spends on
       rendered relief. A rendered 30 deg therefore spends headroom the engine has already
       published and already licensed, rather than inventing any.

   PROPOSED: g4, 30.000 deg. Grounds: it is the engine's own published limit rather than a new
   number; the corpus's steepest measures ~31 deg (FFT-SURFACE-GRAMMAR §2.2), so 30 sits just
   INSIDE what FFT itself does rather than past it; and "the steepest ones look like they should be
   the max" points at the top of the range, which g3 is not — g3 is the middle of the ladder and is
   already legal, so adopting it as the ceiling would make the ruling a no-op. Adam rules. */
var TERRAIN_GRADE_MAX_PROPOSED = Object.freeze({
  id: "g4", deg: 30.0000, gradeH: 1.1547,
  status: "PROPOSED — founder ruling required",
  alternative: "g3 / 26.5651 deg — the walkable step, the conservative reading",
  logicalAdoption: "NOT TAKEN. Every rung of the ladder is render-only; a LOGICAL grade changes walkability and is a gameplay change requiring Adam's sign-off."
});

function terrainGradeById(gradeId){
  var id = gradeId == null ? TERRAIN_GRADE_LADDER_DEFAULT : String(gradeId);
  var g = TERRAIN_GRADE_LADDER.filter(function(r){ return r.id === id; })[0];
  if(!g) throw new Error("terrainGradeById: unknown grade " + id);
  return g;
}

/* ─── F11 · THE GAMEPLAY FINGERPRINT ───────────────────────────────────────────────────────────
   terrainFieldFingerprint folds surface labels and other render facts, so it moves for a purely
   visual edit and cannot answer "was this cosmetic?". This instrument folds every CURRENT
   traversal/occupancy fact instead: integer height, standability, difficult-terrain state, cell
   kind, the walk graph, the climb graph, face climb facts, and entries.

   The first version omitted `climbAdj`, `difficult`, and the face's climbable/DC fields. A dressing
   pass could therefore change non-flying reachability or movement cost while the named gameplay
   invariance gate stayed green. Those are the seventh-through-ninth mutations the six-mutation
   proof never tried. Byte-identical across a change declared cosmetic, or the change was not
   cosmetic. */
function terrainWalkFingerprint(field){
  var parts = [];
  var n = field.cells.length;
  for(var i = 0; i < n; i++){
    var c = field.cells[i];
    var adj = field.walkAdj[i] ? field.walkAdj[i].slice().sort(function(a, b){ return a - b; }) : [];
    var climb = field.climbAdj && field.climbAdj[i]
      ? field.climbAdj[i].slice().sort(function(a, b){ return a - b; }) : [];
    parts.push(field.heights[i] + ":" + (c.standable ? 1 : 0) + ":" + (c.inPlayfield ? 1 : 0)
      + ":" + (c.guarded ? 1 : 0) + ":" + (c.difficult ? 1 : 0) + ":" + c.kind
      + ":w" + adj.join(".") + ":c" + climb.join("."));
  }
  parts.push("faces=" + field.faces.map(function(f){
    return f.highIndex + ">" + f.lowIndex + "@" + f.deltaH
      + ":" + (f.climbable ? 1 : 0) + ":" + (f.climbDc == null ? "-" : f.climbDc);
  }).join(","));
  parts.push("entries=" + field.entryCells.join(","));
  return terrainHash32(parts.join("|")).toString(16).padStart(8, "0")
    + "-" + terrainHash32(parts.reverse().join("|")).toString(16).padStart(8, "0");
}

/* ─── THE STANDEE CONTRACT, in world units ────────────────────────────────────────────────────
   Measured 2026-07-28 against the real THREE.ExtrudeGeometry interiorBaseGeoFor builds (the
   rendered bbox, NOT the nominal rectangle — the bevel adds 0.036 on both axes and 0.012 below).
   FREE-yaw protected area is the circumscribed circle of that bbox, because the plinth is a plain
   child of the figure group and therefore turns with the camera-facing yaw. */
var TERRAIN_STANDEE_CONTRACT = Object.freeze({
  note: "world units; 1 wu = 1 cell = 5 ft. bbox = the rendered ExtrudeGeometry bounding box.",
  baseHeight: 0.09,
  bevelThickness: 0.012,
  bevelSize: 0.018,
  /* the plinth's real bottom sits 0.102 below the figure origin, not 0.09 */
  bottomBelowOrigin: 0.102,
  /* production contact law: figure.position.y = floorTop + 0.096 -> the plinth is EMBEDDED 0.006 */
  contactLift: 0.096,
  nominalEmbed: 0.006,
  envelopes: Object.freeze({
    tiny: Object.freeze({ bboxW: 0.2570, bboxD: 0.1940, span: 0.5, witness: "blind cave rat" }),
    small: Object.freeze({ bboxW: 0.4697, bboxD: 0.2856, span: 1, witness: "winged kobold urd" }),
    medium: Object.freeze({ bboxW: 0.7441, bboxD: 0.3693, span: 1, witness: "human fighter" }),
    mediumCap: Object.freeze({ bboxW: 0.8560, bboxD: 0.3693, span: 1, witness: "wraith / flaming skeleton" }),
    large: Object.freeze({ bboxW: 1.6760, bboxD: 0.3693, span: 2, witness: "—" }),
    huge: Object.freeze({ bboxW: 2.4960, bboxD: 0.3693, span: 3, witness: "treant" }),
    gargantuan: Object.freeze({ bboxW: 3.3160, bboxD: 0.3693, span: 4, witness: "kraken" })
  })
});

/* The protected disc: the circumscribed circle of the plinth's rendered bbox, which is what the
   rectangle sweeps once it turns with the camera. 0.932 wu for the worst Medium — 93% of a cell,
   leaving a free ring 0.034 wu wide. That number is why every sub-cell idea in the corpus study
   dies at the top plane and lives below it. */
function terrainProtectedDiameter(envelopeKey){
  var e = TERRAIN_STANDEE_CONTRACT.envelopes[envelopeKey];
  if(!e) throw new Error("terrainProtectedDiameter: unknown envelope " + envelopeKey);
  return Math.sqrt(e.bboxW * e.bboxW + e.bboxD * e.bboxD);
}

function terrainProtectedRadius(envelopeKey){ return terrainProtectedDiameter(envelopeKey) / 2; }

/* ─── THE CELL'S DECLARED STAND PLANE ─────────────────────────────────────────────────────────
   The rider STANDEE-CONTRACT §3(d) names: "the field must publish a PLANE per cell, not a scalar
   height". This is that publication, and it is a pure derivation of the integer heightfield —
   nothing here can move a height.

   ONE function, read by BOTH the renderer (to draw the top) and the standee mount (to tilt the
   plinth). Two derivations would be two truths and the plinth would float on one of them.

   Grade, in quanta per cell. Under rung C the grade is scaled by TERRAIN_SHALLOW_GRADE_H so a 1h
   step across one cell renders at 18.0 deg — the corpus's common walkable grade, and the register
   Genesis's integer field cannot otherwise say. With C off the plane is horizontal, exactly as the
   chassis has always drawn it. */
var TERRAIN_SHALLOW_GRADE_H = 0.65;   /* 0.65 quanta over one cell = atan(0.325) = 18.00 deg */

function terrainCellNeighbourH(field, x, y, fallbackH){
  if(x < 0 || y < 0 || x >= field.extent.x || y >= field.extent.y) return fallbackH;
  var c = field.cells[y * field.extent.x + x];
  if(!c || c.kind === "void" || !c.inPlayfield) return fallbackH;
  return c.h;
}

/* ─── FFT-STYLE RESPONSIVE SURFACE TOPOLOGY ───────────────────────────────────────────────────
   FFT does not choose between "flat cells" and "one long uniform ramp". Its terrain record lets a
   tile be FLAT, INCLINE, CONVEX or CONCAVE by declaring which corners are high. Neighbouring tiles
   share the relevant corner heights; a black contour/riser is reserved for a deliberate break.

   Genesis starts from logical heights at CELL CENTRES, so the equivalent is a dual mesh:
     * every cell keeps its authored centre datum;
     * every natural edge owns one shared midpoint;
     * every natural vertex owns one shared corner height;
     * the centre, four edge midpoints and four corners make eight broad facets per tile.

   A crest therefore becomes a convex tile, a hollow becomes concave, and a changing hillside
   naturally changes its angle from tile to tile without opening a crack. Curbs, retaining steps,
   cliffs, canyon walls and root undercuts intentionally split the shared nodes. */
var TERRAIN_FFT_SURFACE_LAW = Object.freeze({
  tileTypes: Object.freeze(["flat", "incline", "convex", "concave", "saddle", "rolling"]),
  /* Only pieces whose 1h relationship is itself constructed as a retaining step force a curb.
     Cliffs, crevices, chasms, and root undercuts already classify as `cliff` at 2h+; leaving them
     out of this list lets a softened 1h rim or root-pushed shoulder grade naturally. */
  hardBreakPieceIds: Object.freeze(["R1-09", "R1-12"]),
  fullResponseGradeH: 1,
  statement: "cell centres author the landform; natural neighbours share edge and corner nodes; "
    + "explicit structure and faces keep a riser"
});

function terrainCellPieceId(field, index){
  var c = field.cells[index];
  if(!c) return null;
  var pieces = field.pieces || [];
  for(var i = 0; i < pieces.length; i++){
    if(pieces[i].id === c.owner) return pieces[i].pieceId || null;
  }
  return null;
}

function terrainSurfaceCellDatumH(field, index){
  var c = field.cells[index];
  /* The old `sub` channel is independently random per cell. It remains field data for historical
     receipts, but it is not a surface node: natural relief must come from a shared landform, not
     from nudging every tile to an unrelated datum. */
  return c ? c.h : 0;
}

/* Semantic edge classification. A 1h difference is normally the walkable material BETWEEN two
   centres and therefore grades. It stays a curb only where the authoring piece itself describes a
   retaining/vertical break. A 2h+ difference is always the chassis's owned face. */
function terrainSurfaceEdgeKind(field, aIndex, bIndex){
  var a = field.cells[aIndex], b = field.cells[bIndex];
  if(!a || !b || a.kind === "void" || b.kind === "void" || !a.inPlayfield || !b.inPlayfield){
    return "boundary";
  }
  if(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) !== 1) return "separate";
  var dh = Math.abs(b.h - a.h);
  if(dh >= TERRAIN_GRID_LAW.faceStepQuanta) return "cliff";
  if(dh === 0) return "continuous";
  if(dh !== TERRAIN_GRID_LAW.walkableStepQuanta) return "separate";
  var ap = terrainCellPieceId(field, aIndex), bp = terrainCellPieceId(field, bIndex);
  var hard = TERRAIN_FFT_SURFACE_LAW.hardBreakPieceIds;
  if(a.guarded || b.guarded || hard.indexOf(ap) >= 0 || hard.indexOf(bp) >= 0) return "curb";
  return "grade";
}

function terrainGradeResponseH(flags){
  if(!flags || !flags.shallowgrade) return 0;
  return flags.gradeScale != null
    ? flags.gradeScale : terrainGradeById(TERRAIN_GRADE_LADDER_DEFAULT).gradeH;
}

function terrainCellsJoinAsSurface(field, aIndex, bIndex, flags){
  var kind = terrainSurfaceEdgeKind(field, aIndex, bIndex);
  if(kind === "continuous") return true;
  return kind === "grade"
    && terrainGradeResponseH(flags) >= TERRAIN_FFT_SURFACE_LAW.fullResponseGradeH - 1e-9;
}

/* The caller's claim at an edge midpoint. At full response, two natural 1h neighbours each travel
   half the rise and meet. A comparison rung below g3 deliberately leaves a residual curb; a hard
   break never spends any of the rise in the cap. */
function terrainSurfaceEdgeClaimH(field, index, dx, dy, flags){
  var c = field.cells[index];
  var nx = c.x + dx, ny = c.y + dy;
  var own = terrainSurfaceCellDatumH(field, index);
  if(nx < 0 || ny < 0 || nx >= field.extent.x || ny >= field.extent.y) return own;
  var j = ny * field.extent.x + nx;
  var kind = terrainSurfaceEdgeKind(field, index, j);
  if(kind === "continuous") return (own + terrainSurfaceCellDatumH(field, j)) / 2;
  if(kind !== "grade") return own;
  var response = Math.max(0, Math.min(0.5, terrainGradeResponseH(flags) / 2));
  return own + (terrainSurfaceCellDatumH(field, j) - own) * response;
}

/* A corner can touch four tiles. Split those tiles into smooth components using the same edge law
   and average only the component containing the caller. This is what lets a ramp run into a crest
   while a cliff sharing that vertex keeps its own upper and lower corner claims. */
function terrainSurfaceCornerH(field, index, sx, sy, flags){
  var c = field.cells[index];
  var xs = sx < 0 ? [c.x - 1, c.x] : [c.x, c.x + 1];
  var ys = sy < 0 ? [c.y - 1, c.y] : [c.y, c.y + 1];
  var candidates = [];
  for(var yi = 0; yi < ys.length; yi++) for(var xi = 0; xi < xs.length; xi++){
    var x = xs[xi], y = ys[yi];
    if(x < 0 || y < 0 || x >= field.extent.x || y >= field.extent.y) continue;
    var idx = y * field.extent.x + x;
    var cell = field.cells[idx];
    if(cell && cell.kind !== "void" && cell.inPlayfield) candidates.push(idx);
  }
  var allowed = {}, queue = [index];
  allowed[index] = true;
  while(queue.length){
    var cur = queue.shift(), cc = field.cells[cur];
    candidates.forEach(function(next){
      if(allowed[next]) return;
      var nn = field.cells[next];
      if(Math.abs(cc.x - nn.x) + Math.abs(cc.y - nn.y) !== 1) return;
      if(terrainCellsJoinAsSurface(field, cur, next, flags)){
        allowed[next] = true; queue.push(next);
      }
    });
  }
  var rows = candidates.filter(function(idx){ return allowed[idx]; });
  if(!rows.length) return terrainSurfaceCellDatumH(field, index);
  var lo = Infinity, hi = -Infinity;
  rows.forEach(function(idx){
    var h = terrainSurfaceCellDatumH(field, idx);
    lo = Math.min(lo, h); hi = Math.max(hi, h);
  });
  /* Midrange, not arithmetic mean. In a 2x2 corner with datums 0/0/1/2, a mean of 0.75 pulls the
     h2 tile down by 1.25h and creates a needle even though every orthogonal edge is legal. The
     midrange is 1h: the unique shared value that keeps every incident centre within one quantum,
     matching FFT's binary high/low corner grammar. */
  return (lo + hi) / 2;
}

/* Ring order: NW, N, NE, E, SE, S, SW, W. It is the renderable FFT grammar in one record. */
function terrainCellSurfaceNodes(field, index, flags){
  var centre = terrainSurfaceCellDatumH(field, index);
  var nw = terrainSurfaceCornerH(field, index, -1, -1, flags);
  var ne = terrainSurfaceCornerH(field, index, 1, -1, flags);
  var se = terrainSurfaceCornerH(field, index, 1, 1, flags);
  var sw = terrainSurfaceCornerH(field, index, -1, 1, flags);
  var n = terrainSurfaceEdgeClaimH(field, index, 0, -1, flags);
  var e = terrainSurfaceEdgeClaimH(field, index, 1, 0, flags);
  var s = terrainSurfaceEdgeClaimH(field, index, 0, 1, flags);
  var w = terrainSurfaceEdgeClaimH(field, index, -1, 0, flags);
  return {
    centre: centre,
    corners: [nw, ne, se, sw],
    edges: { n: n, e: e, s: s, w: w },
    ring: [
      [-0.5, -0.5, nw], [0, -0.5, n], [0.5, -0.5, ne], [0.5, 0, e],
      [0.5, 0.5, se], [0, 0.5, s], [-0.5, 0.5, sw], [-0.5, 0, w]
    ]
  };
}

function terrainSurfaceTileProfile(field, index, flags){
  var nodes = terrainCellSurfaceNodes(field, index, flags);
  var ringH = nodes.ring.map(function(p){ return p[2]; });
  var all = ringH.concat([nodes.centre]);
  var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
  var meanCorner = nodes.corners.reduce(function(a, b){ return a + b; }, 0) / 4;
  var curvature = nodes.centre - ringH.reduce(function(a, b){ return a + b; }, 0) / 8;
  var dx = nodes.edges.e - nodes.edges.w, dz = nodes.edges.s - nodes.edges.n;
  var type = "rolling", orientation = null, eps = 0.04;
  if(max - min < eps) type = "flat";
  else if(curvature > 0.16) type = "convex";
  else if(curvature < -0.16) type = "concave";
  else {
    var high = [], low = [];
    nodes.corners.forEach(function(h, i){
      if(h > meanCorner + eps) high.push(i);
      else if(h < meanCorner - eps) low.push(i);
    });
    var names = ["NW", "NE", "SE", "SW"];
    if(high.length === 1 && low.length >= 2){ type = "convex"; orientation = names[high[0]]; }
    else if(low.length === 1 && high.length >= 2){ type = "concave"; orientation = names[low[0]]; }
    else if(high.length === 2){
      var opposite = Math.abs(high[0] - high[1]) === 2;
      type = opposite ? "saddle" : "incline";
      orientation = names[high[0]] + "-" + names[high[1]];
    } else if(Math.sqrt(dx * dx + dz * dz) > eps){
      type = "incline";
      orientation = Math.abs(dx) >= Math.abs(dz) ? (dx > 0 ? "E" : "W") : (dz > 0 ? "S" : "N");
    }
  }
  return {
    type: type, orientation: orientation, centreH: nodes.centre,
    minH: min, maxH: max, dHdx: dx, dHdz: dz, curvatureH: curvature
  };
}

function terrainCellGradient(field, index, flags){
  /* Callers that ask for the logical/render gradient without a ladder flag mean the production
     responsive surface, not the naked control. */
  var resolved = flags || { shallowgrade: true, gradeScale: 1 };
  var p = terrainSurfaceTileProfile(field, index, resolved);
  return { dx: p.dHdx, dz: p.dHdz };
}

/* The standee follows the tangent through the authored centre. A convex crest or concave hollow
   can bend away outside the protected centre while still declaring one support plane for the
   miniature; the skirt covers the bounded difference exactly as before. */
function terrainCellStandPlane(field, index, flags){
  var c = field.cells[index];
  var on = !!(flags && flags.shallowgrade);
  var profile = on ? terrainSurfaceTileProfile(field, index, flags)
    : { dHdx: 0, dHdz: 0 };
  var dx = profile.dHdx, dz = profile.dHdz;
  var ceiling = on ? terrainGradeResponseH(flags) : 0;
  var mag = Math.sqrt(dx * dx + dz * dz);
  var capped = false;
  if(ceiling > 0 && mag > ceiling + 1e-12){
    var k = ceiling / mag;
    dx *= k; dz *= k; mag = ceiling; capped = true;
  }
  var q = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  return {
    gradeId: (flags && flags.gradeId) || null,
    gradeCapped: capped,
    centreH: terrainSurfaceCellDatumH(field, index),
    dHdx: dx, dHdz: dz,
    dYdx: dx * q, dYdz: dz * q,
    slopeDeg: terrainSlopeDegForStepH(mag),
    tileType: on ? profile.type : "flat",
    normal: (function(){
      var nx = -dx * q, ny = 1, nz = -dz * q;
      var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      return [nx / len, ny / len, nz / len];
    })()
  };
}

/* B4 survives only as LOCAL FEATURE RELIEF. It is not sprayed randomly over the whole grid. Berms,
   scree and root ground may spend a third of the sub-quantum budget, and the sign comes from the
   tile's actual convex/concave response rather than a hash. */
function terrainCellFoldDiagonal(field, index, flags){
  var p = terrainSurfaceTileProfile(field, index, flags);
  if(Math.abs(p.dHdx) + Math.abs(p.dHdz) > 1e-9) return p.dHdx * p.dHdz >= 0 ? 1 : 0;
  return Math.abs(p.dHdx) >= Math.abs(p.dHdz) ? 1 : 0;
}

function terrainCellFoldOffset(field, index, u, v, flags){
  if(!flags || !flags.fold) return 0;
  var pieceId = terrainCellPieceId(field, index);
  var c = field.cells[index];
  if(pieceId !== "R1-08" && pieceId !== "R1-10" && pieceId !== "R1-13"
      && c.surface !== "scree") return 0;
  var p = terrainSurfaceTileProfile(field, index, flags);
  if(Math.abs(p.curvatureH) < 0.04) return 0;
  var diag = terrainCellFoldDiagonal(field, index, flags);
  var along = diag ? (u + v) : (u - v);
  var crease = Math.max(-1, 1 - Math.abs(along) * Math.SQRT2);
  var r = Math.min(1, Math.max(Math.abs(u), Math.abs(v)) / 0.5);
  var interiorBell = 4 * r * (1 - r);
  var sign = p.curvatureH > 0 ? 1 : -1;
  return sign * crease * TERRAIN_WALK_NOISE_BUDGET_H.perCellH * 0.35 * interiorBell;
}

/* Piecewise-linear interpolation over the eight FFT-style facets. The same ring nodes are consumed
   by both neighbouring cells, so the entire shared edge—not merely three test points—matches. */
function terrainCellLocalTopH(field, index, u, v, flags){
  var nodes = terrainCellSurfaceNodes(field, index, flags);
  var eps = 1e-9;
  if(Math.abs(u) < eps && Math.abs(v) < eps) return nodes.centre;
  for(var i = 0; i < nodes.ring.length; i++){
    var a = nodes.ring[i], b = nodes.ring[(i + 1) % nodes.ring.length];
    var den = a[0] * b[1] - b[0] * a[1];
    if(Math.abs(den) < eps) continue;
    var wa = (u * b[1] - b[0] * v) / den;
    var wb = (a[0] * v - u * a[1]) / den;
    var wc = 1 - wa - wb;
    if(wa >= -eps && wb >= -eps && wc >= -eps){
      return wc * nodes.centre + wa * a[2] + wb * b[2]
        + terrainCellFoldOffset(field, index, u, v, flags);
    }
  }
  return nodes.centre + terrainCellFoldOffset(field, index, u, v, flags);
}

function terrainCellSharedBoundaryH(field, index, u, v, flags){
  return terrainCellLocalTopH(field, index, u, v, flags);
}

function terrainCellTopH(field, index, u, v, flags){
  return terrainCellLocalTopH(field, index, u, v, flags);
}

/* Executable continuity plus variation instruments. Zero cracks is necessary, but a field whose
   only response is "flatten everything" now fails the separate variation proposition below. */
function terrainSurfaceContinuityReport(field, flags){
  var checked = 0, failed = 0, maxGapH = 0, samples = [];
  field.cells.forEach(function(c){
    if(!c || c.kind === "void" || !c.inPlayfield) return;
    [[1, 0], [0, 1]].forEach(function(dir){
      var nx = c.x + dir[0], ny = c.y + dir[1];
      if(nx >= field.extent.x || ny >= field.extent.y) return;
      var j = ny * field.extent.x + nx;
      if(!terrainCellsJoinAsSurface(field, c.index, j, flags)) return;
      [-0.5, -0.25, 0, 0.25, 0.5].forEach(function(t){
        var ah = dir[0] ? terrainCellTopH(field, c.index, 0.5, t, flags)
          : terrainCellTopH(field, c.index, t, 0.5, flags);
        var bh = dir[0] ? terrainCellTopH(field, j, -0.5, t, flags)
          : terrainCellTopH(field, j, t, -0.5, flags);
        var gap = Math.abs(ah - bh);
        checked++;
        if(gap > maxGapH) maxGapH = gap;
        if(gap > 1e-9){
          failed++;
          if(samples.length < 12) samples.push({ a: c.index, b: j, gapH: Number(gap.toFixed(8)) });
        }
      });
    });
  });
  return {
    law: "continuous FFT-style tiles share their full edge curve; explicit breaks retain a riser",
    gradeId: flags && flags.gradeId || null,
    samplesChecked: checked, failures: failed,
    maxGapH: Number(maxGapH.toFixed(8)),
    ok: checked > 0 && failed === 0, sampleFailures: samples
  };
}

function terrainSurfaceVariationReport(field, flags){
  var types = {}, planes = {}, sloped = 0, responsivePairs = 0;
  var edgeKinds = { continuous: 0, grade: 0, curb: 0, cliff: 0, boundary: 0, separate: 0 };
  field.cells.forEach(function(c){
    if(!c || c.kind === "void" || !c.inPlayfield) return;
    var p = terrainSurfaceTileProfile(field, c.index, flags);
    types[p.type] = (types[p.type] || 0) + 1;
    var planeKey = p.dHdx.toFixed(3) + "," + p.dHdz.toFixed(3);
    planes[planeKey] = true;
    if(Math.sqrt(p.dHdx * p.dHdx + p.dHdz * p.dHdz) > 0.04 || Math.abs(p.curvatureH) > 0.08){
      sloped++;
    }
    [[1, 0], [0, 1]].forEach(function(dir){
      var nx = c.x + dir[0], ny = c.y + dir[1];
      if(nx >= field.extent.x || ny >= field.extent.y) return;
      var j = ny * field.extent.x + nx;
      var kind = terrainSurfaceEdgeKind(field, c.index, j);
      edgeKinds[kind] = (edgeKinds[kind] || 0) + 1;
      if(!terrainCellsJoinAsSurface(field, c.index, j, flags)) return;
      var q = terrainSurfaceTileProfile(field, j, flags);
      if(Math.abs(p.dHdx - q.dHdx) + Math.abs(p.dHdz - q.dHdz)
          + Math.abs(p.curvatureH - q.curvatureH) > 0.08) responsivePairs++;
    });
  });
  return {
    law: "continuity must preserve local angular response rather than flatten it",
    tileTypes: types, distinctTangentPlanes: Object.keys(planes).length,
    responsiveJoinedPairs: responsivePairs, shapedCells: sloped, edgeKinds: edgeKinds,
    ok: sloped > 0 && Object.keys(planes).length > 2 && responsivePairs > 0
  };
}

/* A4's fine material joint must never mint a second tactical lattice. Fine seams stop inside the
   cell and use running-bond head joints; only the coarse ring reaches the 1-cell boundary. */
var TERRAIN_FINE_JOINT_LAW = Object.freeze({
  pattern: "staggered-running-bond",
  coursesPerCell: 4,
  edgeInsetCells: 0.04,
  fineValueMultiplier: 0.97,
  continuousTacticalValueMultiplier: 0.91,
  reliefBoundaryValueMultiplier: 0.58,
  maxFineSpanCells: 0.92,
  tacticalPitchCells: 1,
  statement: "fine seams stop inside cells; each tactical edge draws once, softly on one surface "
    + "and strongly only where it names real relief"
});

function terrainFineJointSegments(field, index){
  var c = field.cells[index];
  var law = TERRAIN_FINE_JOINT_LAW;
  var inset = law.edgeInsetCells;
  var min = -0.5 + inset, max = 0.5 - inset;
  var out = [];
  for(var k = 1; k < law.coursesPerCell; k++){
    var v = -0.5 + k / law.coursesPerCell;
    out.push([min, v, max, v]);                 /* bed joint, clipped before the tactical ring */
  }
  for(var course = 0; course < law.coursesPerCell; course++){
    var v0 = -0.5 + course / law.coursesPerCell + inset * 0.5;
    var v1 = -0.5 + (course + 1) / law.coursesPerCell - inset * 0.5;
    var stagger = ((c.x + c.y + course) & 1) ? -0.22 : 0.22;
    out.push([stagger, v0, stagger, v1]);       /* head joint terminates at each bed */
  }
  return out;
}

/* ─── A1 · PER-INSTANCE JITTER ────────────────────────────────────────────────────────────────
   "Six matching ruins with the same broken corner are still six matching pieces." One seeded draw
   per instance key: sink, tilt about both horizontal axes, yaw, and a tone multiplier.

   THE TWO CLAMPS ARE THE WHOLE LICENCE (GRID-BREAKING-STUDY §2.5): tilt must preserve the declared
   footprint and sink must preserve the cover class. On a WALKABLE cell the sink is additionally
   capped at the noise budget, so jitter can never spend more relief than the walk law allows. */
function terrainExpressionJitter(seed, key, opts){
  var o = opts || {};
  var maxSink = o.maxSinkH == null ? TERRAIN_WALK_NOISE_BUDGET_H.perCellH : o.maxSinkH;
  var maxTilt = o.maxTiltDeg == null ? 9 : o.maxTiltDeg;
  var h = terrainHash32(String(seed) + ":jitter:" + String(key));
  var r = terrainRng(h);
  var sink = r() * maxSink;                       /* quanta, always downward — things settle */
  var tiltX = (r() * 2 - 1) * maxTilt;
  var tiltZ = (r() * 2 - 1) * maxTilt;
  var yaw = r() * 360;
  var tone = 0.86 + r() * 0.28;                   /* per-instance value jitter, inside the funnel */
  var scale = 0.82 + r() * 0.36;
  return {
    sinkH: sink, tiltXDeg: tiltX, tiltZDeg: tiltZ, yawDeg: yaw, tone: tone, scale: scale,
    clamped: { maxSinkH: maxSink, maxTiltDeg: maxTilt,
      law: "tilt preserves the declared footprint; sink preserves the cover class" }
  };
}

/* ─── A5 · THE EDGE-BIASED OCCLUDER PLACEMENT LAW ─────────────────────────────────────────────
   The rule is the product, not the props. Bias scatter toward risers, arrises and concave corners
   so a piece straddles a cell boundary — break the grid with something that is NOT on the grid.

   THE ONE HARD RULE: an occluder may never occupy the standee disc of a walkable cell. Straddling
   a riser is fine, because a face is not walked. Sites are emitted ON the boundary between a high
   cell and a low one, at the midpoint of the shared edge, so every piece is by construction half on
   one cell and half on the other and its centre is 0.5 wu from either stand point — outside the
   0.466 protected radius of the worst Medium by 0.034 wu, which is the ring the contract leaves. */
function terrainOccluderSites(field, flags, opts){
  if(!flags || !flags.occluders) return [];
  var o = opts || {};
  var everyNth = o.everyNthEdge == null ? 3 : o.everyNthEdge;
  var maxSites = o.maxSites == null ? 64 : o.maxSites;
  var ex = field.extent.x, ey = field.extent.y;
  var sites = [];
  var considered = 0;
  function push(a, b, kind){
    if(sites.length >= maxSites) return;
    considered++;
    if(considered % everyNth !== 0) return;
    var ca = field.cells[a], cb = field.cells[b];
    var hi = ca.h >= cb.h ? ca : cb, lo = ca.h >= cb.h ? cb : ca;
    var r = terrainRng(terrainHash32(field.seed + ":occl:" + a + "-" + b));
    sites.push({
      key: "occl-" + a + "-" + b,
      kind: kind,
      /* cell-space centre: exactly on the shared edge */
      u: (ca.x + cb.x) / 2 + 0.5,
      v: (ca.y + cb.y) / 2 + 0.5,
      highIndex: hi.index, lowIndex: lo.index,
      seatH: lo.h,                                  /* it sits at the FOOT of the face */
      deltaH: Math.abs(ca.h - cb.h),
      sizeCells: 0.26 + r() * 0.22,
      straddles: true
    });
  }
  for(var i = 0; i < field.cells.length; i++){
    var c = field.cells[i];
    if(c.kind === "void") continue;
    var x = i % ex, y = (i - (i % ex)) / ex;
    if(x + 1 < ex){
      var e = field.cells[i + 1];
      if(e.kind !== "void" && e.h !== c.h) push(i, i + 1, Math.abs(e.h - c.h) >= 2 ? "face-foot" : "riser");
    }
    if(y + 1 < ey){
      var s = field.cells[i + ex];
      if(s.kind !== "void" && s.h !== c.h) push(i, i + ex, Math.abs(s.h - c.h) >= 2 ? "face-foot" : "riser");
    }
  }
  return sites;
}

/* ─── A6 · CAVITY-DARKEN + CURVATURE-LIGHTEN ──────────────────────────────────────────────────
   Wash and drybrush, translated. Driven off the REAL height channel (the canon guard: painted
   lighting must not become false relief) — a cell whose neighbours stand above it is a cavity and
   darkens; a cell that stands above its neighbours is curvature and lightens. Returns a multiplier
   around 1.0 that the renderer applies to the cell's own base colour. */
function terrainCellWashFactor(field, index, flags){
  if(!flags || !flags.wash) return 1;
  var c = field.cells[index];
  var sum = 0, n = 0;
  [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function(d){
    var h = terrainCellNeighbourH(field, c.x + d[0], c.y + d[1], null);
    if(h == null) return;
    sum += h - c.h; n++;
  });
  if(!n) return 1;
  var rel = sum / n;                              /* >0 = neighbours higher = a cavity */
  var t = Math.max(-1, Math.min(1, rel / 2));
  return 1 - t * 0.22;                            /* cavity 0.78x .. curvature 1.22x */
}

/* ─── R3 · THE OVERHANG LICENCE — overhang needs RULES ────────────────────────────────────────
   Adam, 2026-07-28, on the three-rung ladder: *"of the three the second one is preferable, though i
   don't want EVERY single top level plane to overhang… specially on cliffsides, but it doesn't make
   sense on every single terrain surface… the 3rd image where every single block has an overhang is
   absolute overkill."*

   So A3's cap overhang stops being a property of every exposed side and becomes a LICENCE a side
   has to earn. The rule is the deliverable; the geometry is unchanged.

   A SIDE EARNS AN OVERHANG when all four hold:
     1. it is EXPOSED — the neighbour is lower, void, or off-field. An interior side is a seam
        between two equal grounds and must stay welded shut or the ground reads as loose tiles.
     2. the drop below it is a FACE — at least TERRAIN_GRID_LAW.faceStepQuanta (2h = 5 ft). This is
        the whole of "specially on cliffsides": a face is the thing the engine already calls a
        cliff, it is guarded, it is never walked, and it is exactly where a coping/cornice reads.
        A 1h riser is a TREAD and belongs to B2's nosing, which is a different device with a
        different look — that is the rule that stops every stacked block growing a lip.
     3. the cell is not a BOULDER. A rounded mass has no coping; a cornice on one reads as a hat.
     4. the cell is not under water and carries no occupancy volume (thicket / trunk-field). A
        thicket edge is vegetation, not masonry.

   AND THE SCENE CAP. Even a field that is all cliff may not be all overhang, or the rule collapses
   back into the universal case Adam rejected. At most `maxSceneShare` of a field's non-void cells
   may carry an overhang on any side; when the licensed set is larger, the licence is withdrawn
   from the SHALLOWEST faces first (sort by the cell's deepest licensed drop descending, then by
   cell index ascending — deterministic, and it keeps the tall faces, which is the bias Adam named).

   Returns per-side booleans plus the reason, so a frame can be interrogated rather than trusted. */
var TERRAIN_OVERHANG_LAW = Object.freeze({
  earnsAt: "an exposed side whose drop is >= faceStepQuanta (2h) — a face, i.e. a cliffside",
  forbidden: Object.freeze([
    "interior sides (the neighbour is the same height or higher) — the seam stays welded",
    "1h risers — that drop is a tread and belongs to B2's nosing",
    "boulder cells — a rounded mass carries no coping",
    "cells under water (depthH > 0)",
    "cells carrying an occupancy volume (thicket / trunk-field)"
  ]),
  /* PROPOSED. Derived from the measured licensed share across the seven CL-F07 scenes (see
     docs/DESIGN.md) rather than picked round: the cap sits above every scene's rule-only share so
     the rule alone governs on real fields, and far enough below 1.0 that the universal case Adam
     called "absolute overkill" is structurally unreachable. */
  maxSceneShare: 0.34,
  status: "PROPOSED — the share is Adam's to move; the rule above is ruled"
});

/* Which sides of one cell are EXPOSED, and by how much. Engine-side twin of the renderer's own
   clayTerrainExposedSides, kept here so the licence can be decided without a scene graph. 99 means
   "off-field or void" — a full-depth drop, which is exactly what a chasm wall is. */
function terrainCellExposedSides(field, index){
  var c = field.cells[index];
  var ex = field.extent.x, ey = field.extent.y;
  function drop(dx, dy){
    var nx = c.x + dx, ny = c.y + dy;
    if(nx < 0 || ny < 0 || nx >= ex || ny >= ey) return 99;
    var n = field.cells[ny * ex + nx];
    if(!n || n.kind === "void") return 99;
    return c.h - n.h;
  }
  return { w: drop(-1, 0), e: drop(1, 0), n: drop(0, -1), s: drop(0, 1) };
}

/* The rule, applied to ONE cell, before the scene cap. */
function terrainOverhangRuleForCell(field, index){
  var c = field.cells[index];
  var out = { w: false, e: false, n: false, s: false, any: false, deepest: 0, reason: null };
  if(!c || c.kind === "void"){ out.reason = "void"; return out; }
  if(c.kind === "boulder"){ out.reason = "boulder — a rounded mass carries no coping"; return out; }
  if(c.depthH > 0){ out.reason = "under water"; return out; }
  if(c.surface === "thicket" || c.surface === "trunk-field"){
    out.reason = "occupancy volume — vegetation, not masonry"; return out;
  }
  var sides = terrainCellExposedSides(field, index);
  var face = TERRAIN_GRID_LAW.faceStepQuanta;
  ["w", "e", "n", "s"].forEach(function(k){
    var d = sides[k];
    if(d >= face){ out[k] = true; out.any = true; out.deepest = Math.max(out.deepest, d); }
  });
  if(!out.any) out.reason = "no exposed side drops a full face (2h+)";
  return out;
}

/* The rule PLUS the scene cap, for a whole field. One pass, deterministic, no scene graph. */
function terrainOverhangCensus(field, flags){
  var on = !!(flags && flags.chamfer);
  var cells = field.cells.length;
  var live = 0, licensed = [], perCell = new Array(cells);
  for(var i = 0; i < cells; i++){
    var c = field.cells[i];
    if(!c || c.kind === "void"){ perCell[i] = null; continue; }
    live++;
    var r = terrainOverhangRuleForCell(field, i);
    perCell[i] = r;
    if(r.any) licensed.push(i);
  }
  var ruleShare = live ? licensed.length / live : 0;
  var cap = TERRAIN_OVERHANG_LAW.maxSceneShare;
  var maxCells = Math.floor(live * cap);
  var withdrawn = [];
  if(licensed.length > maxCells){
    /* keep the TALL faces: deepest drop first, cell index as the deterministic tiebreak */
    var ranked = licensed.slice().sort(function(a, b){
      var da = perCell[a].deepest, db = perCell[b].deepest;
      if(db !== da) return db - da;
      return a - b;
    });
    withdrawn = ranked.slice(maxCells);
    withdrawn.forEach(function(idx){
      perCell[idx] = { w: false, e: false, n: false, s: false, any: false,
        deepest: perCell[idx].deepest, reason: "withdrawn by the scene cap" };
    });
  }
  var finalCells = licensed.length - withdrawn.length;
  return {
    on: on,
    liveCells: live,
    ruleLicensedCells: licensed.length,
    ruleShare: Number(ruleShare.toFixed(5)),
    capShare: cap,
    capCells: maxCells,
    withdrawnCells: withdrawn.length,
    overhangCells: on ? finalCells : 0,
    finalShare: on && live ? Number((finalCells / live).toFixed(5)) : 0,
    perCell: perCell,
    obeysCap: !on || !live || (finalCells / live) <= cap + 1e-9
  };
}

/* What the renderer asks, per cell: which sides carry a cap overhang under this field's licence.
   The census is computed once per field and handed back in, so the scene cap is a field-wide fact
   rather than something each cell re-derives (which could not see the cap at all). */
function terrainOverhangSides(census, index){
  if(!census || !census.on) return { w: false, e: false, n: false, s: false, any: false };
  var r = census.perCell[index];
  return r || { w: false, e: false, n: false, s: false, any: false };
}

/* ─── R5 · THE MEDIUM-ACCESSIBILITY LAW (NEW) ─────────────────────────────────────────────────
   Adam, 2026-07-28: *"the medium base not being able to fit everywhere is a real stage design
   issue… There absolutely should be some places where they cant fit, small and tiny creatures
   should get the advantages in those areas and that's by design, but the majority of most of the
   map should still be accessible to medium size creatures… i don't think anywhere it is stated
   that medium creatures need to be able to get around too."*

   He is right that nothing states it. The nearest existing law is docs/DUNGEON-GRAPH.md §2's
   SCALE-DOMAIN RULE — "a room that merely fits its monster is a prison" — which grows rooms UP to
   a large resident (src/engine/place-semantics.js dsmFitTestAndGrow). That law is about dungeon
   ROOMS and about the LARGEST occupant. It says nothing about terrain and nothing about the
   ordinary Medium body, which is the party. This is the missing floor.

   WHAT "ADMITS A MEDIUM" MEANS, measured rather than asserted: the cell is standable AND the
   largest disc that can be centred on its stand point without leaving the cell's own usable top or
   striking a declared intrusion is at least the Medium protected radius. The protected radius is
   the CIRCUMSCRIBED circle of the plinth's rendered bbox, because the plinth turns with the camera
   — 0.4155 wu for the ordinary Medium and 0.4660 for the Medium-CAP width the worst witnesses
   wear. The cap number is the one gated, because a law that only holds for the average body is not
   a law.

   AND CONNECTIVITY, which is the half a bare percentage cannot see. A field could report 90%
   Medium-admitting while every admitting cell is an island. So the floor has two clauses: the
   SHARE, and the requirement that the Medium-admitting cells form ONE walk-connected component
   that contains every entry cell. A Small/Tiny-only pocket is then legal and bounded BY
   CONSTRUCTION: it is what is left over outside the main component. */
var TERRAIN_MEDIUM_ACCESS_LAW = Object.freeze({
  statement: "A generated field must admit the Medium protected disc on at least minShare of its "
    + "standable cells (SHARE); the largest walk-connected admitting component must be at least "
    + "minShare of the largest walk-connected STANDABLE component, so the floor never shatters "
    + "connectivity the terrain itself provides (COHESION); and every standable entry cell must "
    + "admit a Medium (ENTRY). The remainder is legal, bounded, and desirable — it is where Small "
    + "and Tiny earn their advantage.",
  /* PROPOSED. Measured share across all seven CL-F07 scenes is 100.00% today (see docs/DESIGN.md),
     so any floor at or under 1.0 costs the chassis nothing now; the number has to be chosen for
     what it PERMITS later. 0.85 leaves 15% — on the census-median 60x80 arrival (192 cells) that
     is up to 28 cells, enough for two to four pockets of 7-14 cells, which is the size at which a
     pocket reads as a place a Small creature can use rather than as one odd square. Below ~0.75 a
     12x16 arrival can lose a whole quadrant to Small-only ground, which is no longer "the majority
     of most of the map". Adam's number to move; the two clauses are the law. */
  minShare: 0.85,
  mediumProtectedDiameter: 0.8308,
  mediumCapProtectedDiameter: 0.9320,
  gatedAgainst: "mediumCap — the worst-case plinth width (0.856 wu) that wraiths and flaming skeletons wear",
  status: "PROPOSED — the share is Adam's; that a floor must exist at all is the new law"
});

/* The largest disc, in wu, that can be centred on a cell's stand point without leaving the cell's
   own usable top. On this chassis a standable cell's top is the full 1x1 plane, so the answer is
   0.5 wu of radius unless a DECLARED INTRUSION eats into it. Intrusions are supplied by the caller
   (an occluder site, a prop footprint, a sub-cell corner block, a tread narrower than the cell) —
   that is the seam through which every future device has to declare what it costs the body that
   has to stand there, instead of shrinking the usable top silently while still reporting
   standable:true. That silent shrink is the "green lie" §6 of the R1 build spec named. */
function terrainCellUsableTopRadius(field, index, intrusions){
  var c = field.cells[index];
  if(!c || !c.standable) return 0;
  var r = 0.5;                                     /* half a cell — the full top plane */
  if(Array.isArray(intrusions)){
    for(var i = 0; i < intrusions.length; i++){
      var it = intrusions[i];
      if(it == null || it.cell !== index) continue;
      /* an intrusion is declared as {cell, du, dv, radius} in CELL SPACE, du/dv from the stand
         point. The usable radius is the distance from the stand point to the intrusion's near
         edge; an intrusion that covers the stand point leaves nothing. */
      var d = Math.sqrt(it.du * it.du + it.dv * it.dv) - (it.radius || 0);
      r = Math.min(r, Math.max(0, d));
    }
  }
  return r;
}

/* The census. Returns per-field shares plus the connectivity clause, and it never touches a height,
   a standable flag or a walk edge — it READS them. */
function terrainMediumAccessCensus(field, opts){
  var o = opts || {};
  var need = o.radius == null
    ? TERRAIN_MEDIUM_ACCESS_LAW.mediumCapProtectedDiameter / 2 : o.radius;
  var intrusions = o.intrusions || null;
  var n = field.cells.length;
  var admits = new Uint8Array(n);
  var standable = 0, admitting = 0;
  var radii = [];
  for(var i = 0; i < n; i++){
    var c = field.cells[i];
    if(!c || !c.standable) continue;
    standable++;
    var r = terrainCellUsableTopRadius(field, i, intrusions);
    radii.push(r);
    if(r >= need - 1e-9){ admits[i] = 1; admitting++; }
  }
  /* THE COHESION CLAUSE, and why it is a RATIO rather than "one component".
     A first cut demanded that every admitting cell sit in one component containing every entry.
     Measured against the real fixture that is simply wrong: the 24x24 bench SHEET is thirteen
     separate bays and the 16-cell tray is a field split by its own chasm, so their standable sets
     are ALREADY several components before any body is considered. Requiring one component would
     have failed three CL-F07 fields for having the topology they were built to have — a gate
     failing the fixture rather than the defect.
     What the law actually cares about is whether the MEDIUM FLOOR SHATTERS what already exists. So
     compare like with like: the largest ADMITTING component against the largest STANDABLE one. A
     field the terrain already split stays passing; a field that a body-sized intrusion cuts into
     stripes does not. */
  function largestComponent(pred){
    var seen = new Uint8Array(n), best = 0;
    for(var s = 0; s < n; s++){
      if(!pred(s) || seen[s]) continue;
      var queue = [s], head = 0, size = 0;
      seen[s] = 1;
      while(head < queue.length){
        var cur = queue[head++];
        size++;
        var adj = field.walkAdj[cur] || [];
        for(var k = 0; k < adj.length; k++){
          var j = adj[k];
          if(pred(j) && !seen[j]){ seen[j] = 1; queue.push(j); }
        }
      }
      if(size > best) best = size;
    }
    return best;
  }
  var largestAdmitting = largestComponent(function(i){ return admits[i] === 1; });
  var largestStandable = largestComponent(function(i){
    var c = field.cells[i]; return !!(c && c.standable);
  });
  var entries = (field.entryCells || []).filter(function(idx){
    var c = field.cells[idx]; return !!(c && c.standable);
  });
  var entriesBlocked = entries.filter(function(idx){ return !admits[idx]; });
  var share = standable ? admitting / standable : 1;
  var cohesion = largestStandable ? largestAdmitting / largestStandable : 1;
  var minShare = TERRAIN_MEDIUM_ACCESS_LAW.minShare;
  var shareOk = share >= minShare - 1e-9;
  var cohesionOk = cohesion >= minShare - 1e-9;
  var entryOk = entriesBlocked.length === 0;
  return {
    law: "R5 — the Medium-accessibility floor",
    fieldId: field.id,
    needRadius: Number(need.toFixed(4)),
    standableCells: standable,
    mediumAdmittingCells: admitting,
    mediumShare: Number(share.toFixed(5)),
    largestStandableComponent: largestStandable,
    largestAdmittingComponent: largestAdmitting,
    cohesion: Number(cohesion.toFixed(5)),
    smallTinyOnlyCells: standable - admitting,
    smallTinyOnlyShare: Number((standable ? (standable - admitting) / standable : 0).toFixed(5)),
    minUsableRadius: radii.length ? Number(Math.min.apply(null, radii).toFixed(4)) : null,
    entryCells: entries.length,
    entriesBlockedToMedium: entriesBlocked.length,
    /* ALL THREE clauses. A share that passes while the admitting set is shattered is exactly the
       failure a bare percentage cannot see, so the verdict folds them together. */
    shareOk: shareOk,
    cohesionOk: cohesionOk,
    entryOk: entryOk,
    ok: shareOk && cohesionOk && entryOk
  };
}

/* ─── R6 · THE EASED CLIMB BAND ───────────────────────────────────────────────────────────────
   Adam, 2026-07-28: *"i like the idea of having some edges where there are little rock bits that
   maybe a character can climb with a low or auto DC check vs the standard."*

   TERRAIN_GRID_LAW.climbDcBands is already [12, 15, 17] and — measured, not assumed — NOTHING in
   the engine consumes it: no face carries a DC today. So this authors the mapping AND the eased
   band in one place, and marks the numbers PROPOSED because a DC is a gameplay value.

   THE AFFORDANCE MUST BE VISIBLE. A face that is easier to climb has to LOOK easier — the relief
   is the reason the DC is lower, not a decoration applied afterwards. So the same predicate that
   sets the band is the one the renderer draws from: a face with `eased:true` grows a readable stack
   of climbable rock bits and nothing else does.

   WHICH FACES EARN IT, deterministically: a face of exactly the minimum height (2h — the shortest
   thing the engine calls a face) drawn by a seeded per-face bit at `easedRate`. Short faces, so the
   easy ones are legible as the low ones; seeded, so the same field always has the same easy edges. */
var TERRAIN_CLIMB_EASED = Object.freeze({
  status: "PROPOSED — DC values are Adam's; the band and its visible affordance are built",
  standardBands: TERRAIN_GRID_LAW.climbDcBands,
  bandForDeltaH: "2h -> 12 · 3h -> 15 · 4h+ -> 17 (the existing three, mapped for the first time)",
  easedDc: 10,
  easedAutoAtDeltaH: 2,
  easedRate: 1 / 3,
  affordance: "a stack of proud rock bits up the face — drawn only where the band is eased"
});

function terrainFaceClimb(field, face){
  var d = Math.abs(face.deltaH);
  var bands = TERRAIN_GRID_LAW.climbDcBands;
  var dc = d <= 2 ? bands[0] : (d === 3 ? bands[1] : bands[2]);
  var eligible = d === TERRAIN_GRID_LAW.faceStepQuanta;
  var roll = terrainHash32(field.seed + ":climbease:" + face.id) / 4294967296;
  var eased = eligible && roll < TERRAIN_CLIMB_EASED.easedRate;
  return {
    faceId: face.id,
    deltaH: d,
    standardDc: dc,
    eased: eased,
    dc: eased ? (d <= TERRAIN_CLIMB_EASED.easedAutoAtDeltaH ? 0 : TERRAIN_CLIMB_EASED.easedDc) : dc,
    auto: eased && d <= TERRAIN_CLIMB_EASED.easedAutoAtDeltaH,
    reliefBits: eased ? 2 + (terrainHash32(field.seed + ":climbbits:" + face.id) % 3) : 0
  };
}

function terrainFaceClimbCensus(field){
  var rows = (field.faces || []).map(function(f){ return terrainFaceClimb(field, f); });
  var eased = rows.filter(function(r){ return r.eased; });
  return {
    faces: rows.length,
    easedFaces: eased.length,
    easedShare: rows.length ? Number((eased.length / rows.length).toFixed(5)) : 0,
    autoFaces: eased.filter(function(r){ return r.auto; }).length,
    rows: rows
  };
}

/* A rigid miniature base cannot itself become FFT's convex/concave tile. Size the buried support
   skirt from the actual responsive surface under the worst Medium-cap footprint instead of making
   every tile flatter to accommodate the prop. The 3x3 sample is the same footprint proposition the
   live browser gate measures; the caller may still force zero for the red comparison. */
function terrainStandeeSkirtNeedWU(field, index, flags){
  var p = terrainCellStandPlane(field, index, flags);
  var q = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  var r = terrainProtectedRadius("mediumCap");
  var worst = 0;
  [-r, 0, r].forEach(function(u){
    [-r, 0, r].forEach(function(v){
      var cu = Math.max(-0.5, Math.min(0.5, u));
      var cv = Math.max(-0.5, Math.min(0.5, v));
      var planeH = p.centreH + p.dHdx * cu + p.dHdz * cv;
      var groundH = terrainCellTopH(field, index, cu, cv, flags);
      var daylight = (planeH - groundH) * q - TERRAIN_STANDEE_CONTRACT.nominalEmbed;
      if(daylight > worst) worst = daylight;
    });
  });
  var law = (typeof TERRAIN_BASE_SKIRT === "object") ? TERRAIN_BASE_SKIRT : null;
  var maxDepth = (law && law.maxDepthWU) || 0.20;
  var minDepth = (law && law.minDepthWU) || 0.02;
  var slack = (law && law.sampleSlackWU) || 0.014;
  return Number(Math.min(maxDepth, Math.max(minDepth, worst + slack)).toFixed(4));
}

/* ─── R2 · THE BASE SKIRT ─────────────────────────────────────────────────────────────────────
   Adam, 2026-07-28: *"we might need to extend the base down through the floor, so even on hills the
   base appears to make contact with the full ground, rather than just floating or teetering."*

   The plinth's CONTACT PLANE does not move: the skirt hangs BELOW it, inside the ground, and is
   purely cosmetic. It may not change the contact Y, the walkable census, or any gate's contact
   measurement — the nearest-contact gap keeps measuring the contact plane, which is why the skirt
   is a separate child mesh rather than a taller plinth geometry (a taller geometry would move the
   bounding box the contact probe reads, and the gate would start measuring the skirt).

   A convex/concave tile bends farther away from its centre tangent than the old micro-fold did.
   A single global 0.06-wu depth therefore stopped being an honest bound. The renderer now asks
   terrainStandeeSkirtNeedWU for the actual tile and clamps the answer into [0.02, 0.20] wu. That
   preserves the varied landform instead of flattening it for the miniature. */
var TERRAIN_BASE_SKIRT = Object.freeze({
  depthWU: 0.20,
  minDepthWU: 0.02,
  maxDepthWU: 0.20,
  sampleSlackWU: 0.014,
  minimumColumnDepthWU: 0.50,
  adaptive: true,
  grounds: "sample the responsive rendered tile under the worst Medium-cap footprint; add 0.014 wu "
    + "slack and clamp to 0.02..0.20 wu. The 0.20 maximum remains inside every terrain column's "
    + "minimum 0.50-wu solid depth.",
  cosmeticOnly: "may not change contact Y, the walkable census, or any contact measurement",
  defaultOn: "terrain witnesses only — the flat tabletop and interior boards are unchanged"
});

/* ─── DIORAMA TRAY CLOSURE ────────────────────────────────────────────────────────────────────
   Adam, 2026-07-30: *"the edges of the diorama, instead of just floating and being a single plan
   of ground with nothing underneath it, i was hoping that the highest elevation would have an edge
   plan that renders down to the ground plane, making the entire diorama look like it could fit into
   a flat tray."*

   This is presentation closure, never terrain mechanics. Every live perimeter cell carries its
   rendered silhouette down to ONE common datum below the field minimum. A high boundary therefore
   exposes a proportionally deep cut face instead of the old one-quantum floating skirt. Interior
   relief, void walls, height samples, stand planes, walk edges, and tactical fingerprints do not
   change. */
var TERRAIN_DIORAMA_TRAY_CLOSURE = Object.freeze({
  id: "edge-to-common-tray-datum-v1",
  enabled: true,
  scope: "live-field-perimeter-only",
  baseOffsetH: 1,
  baseDatum: "field.metrics.minH - baseOffsetH",
  surfaceRole: "diorama-cut-face",
  geometryOwner: "renderer-projects-engine-law",
  mechanicalEffect: "none",
  statement: "every live perimeter silhouette closes vertically to one shared flat tray datum"
});

/* ─── F1 / F2 / F3 / F5 · THE STANDEE CONTACT PROBE ───────────────────────────────────────────
   The gate `WITNESS_MAX_GAP` measures the ORIGIN gap, which is 0.096 by construction and cannot
   move — it reads green on a plinth whose uphill corner is 0.217 wu buried and whose downhill
   corner is 0.217 wu airborne. This measures the thing it names: the NEAREST-CONTACT GAP UNDER THE
   PLINTH FOOTPRINT, sampled at the four corners of the plinth's RENDERED bounding box, against the
   support plane evaluated AT each corner.

   All inputs and outputs in WORLD UNITS. `planeAt(x, z)` is a caller-supplied sampler so this stays
   engine-pure — the renderer passes the same terrainCellStandPlane the cap was built from. */
var TERRAIN_CONTACT_THRESHOLDS = Object.freeze({
  /* F2 — daylight under a corner. One bevelThickness is the visibility floor at 35.2 px/wu. */
  maxCornerGap: 0.012,
  /* F1 — a corner buried past the authored 0.006 embed plus a quarter of the plinth's own height */
  minCornerGap: -0.030,
  /* F3 — plinth area hanging past the support polygon */
  overhangWarnFrac: 0.0,
  overhangBlockFrac: 0.02,
  /* F7 — REVERSED BY ADAM'S R1 RULING, 2026-07-28: *"the sprite itself should always be fixed at
     the same angle as its base."* The R1 build (and the standee-contract study it came from) said
     the opposite — tilt the plinth, keep the card vertical — and this threshold enforced that as
     `spriteTiltDeg: 0.5`, i.e. "the sprite must NOT tilt with the base". It now enforces the
     ruling: the ONLY angle between the sprite's world-up and the base's world-up is the constant
     camera-pitch tilt every standee has always carried, and any deviation past this tolerance is
     the two coming apart. A physical miniature on a wedge leans with the wedge; that is the
     tabletop-of-miniatures doctrine applied honestly. */
  spriteBaseAgreementDeg: 0.5,
  spriteBaseAgreementLaw: "angle(spriteWorldUp, baseWorldUp) == the camera-pitch constant, exactly",
  /* F6 — a base tilt past the walk law is a bug, never silently clamped */
  maxBaseTiltDeg: 30
});

function terrainStandeeContactProbe(opts){
  var halfW = opts.bboxW / 2, halfD = opts.bboxD / 2;
  var yaw = opts.yawRad || 0;
  var cos = Math.cos(yaw), sin = Math.sin(yaw);
  var originY = opts.originY;
  var bottom = originY - (opts.bottomBelowOrigin == null
    ? TERRAIN_STANDEE_CONTRACT.bottomBelowOrigin : opts.bottomBelowOrigin);
  /* the plinth's own tilt, if B1 is on: the bottom face rotates with the base child */
  var tiltDx = opts.planeDYdx || 0, tiltDz = opts.planeDYdz || 0;
  var corners = [[-halfW, -halfD], [halfW, -halfD], [halfW, halfD], [-halfW, halfD]];
  var gaps = [], pts = [];
  var outside = 0;
  var supportHalfX = opts.supportHalfX == null ? 0.5 : opts.supportHalfX;
  var supportHalfZ = opts.supportHalfZ == null ? 0.5 : opts.supportHalfZ;
  /* MEASURED, not modelled, when the caller can supply it: `cornersWorld` is the plinth's four
     rendered bbox corners taken straight off the live scene graph (base.localToWorld), so a
     rotation-order mistake in the tilt shows up as a gap instead of cancelling out of both sides of
     the arithmetic. The analytic path below is the engine-side fallback the jsdom demonstration
     uses, where there is no scene graph to measure. */
  var measured = Array.isArray(opts.cornersWorld) && opts.cornersWorld.length === 4;
  for(var i = 0; i < corners.length; i++){
    var wx, wz, cornerY;
    if(measured){
      wx = opts.cornersWorld[i][0]; cornerY = opts.cornersWorld[i][1]; wz = opts.cornersWorld[i][2];
    } else {
      /* three.js YXZ yaw: x' = x cos + z sin, z' = -x sin + z cos */
      var lx = corners[i][0], lz = corners[i][1];
      wx = opts.standX + lx * cos + lz * sin;
      wz = opts.standZ + (-lx * sin + lz * cos);
      cornerY = bottom + (opts.tilted ? (wx - opts.standX) * tiltDx + (wz - opts.standZ) * tiltDz : 0);
    }
    var groundY = opts.planeAt(wx, wz);
    gaps.push(cornerY - groundY);
    pts.push([Number(wx.toFixed(4)), Number(wz.toFixed(4))]);
    if(Math.abs(wx - opts.standX) > supportHalfX + 1e-9
      || Math.abs(wz - opts.standZ) > supportHalfZ + 1e-9) outside++;
  }
  var minGap = Math.min.apply(null, gaps);
  var maxGap = Math.max.apply(null, gaps);
  /* F3 — the fraction of the plinth's rectangle that hangs past the support polygon, computed as
     the exact axis-aligned rectangle overlap of the ROTATED bbox's own extent against the support.
     A rotated rectangle's axis-aligned extent is the honest conservative reading here: it is the
     footprint the collision sweep and the contact pool both already use. */
  var extX = Math.abs(halfW * cos) + Math.abs(halfD * sin);
  var extZ = Math.abs(halfW * sin) + Math.abs(halfD * cos);
  var insideX = Math.max(0, Math.min(extX, supportHalfX));
  var insideZ = Math.max(0, Math.min(extZ, supportHalfZ));
  var area = 4 * extX * extZ;
  var overlap = 4 * insideX * insideZ;
  var overhangFrac = area > 0 ? (area - overlap) / area : 0;
  return {
    cornerGaps: gaps.map(function(g){ return Number(g.toFixed(5)); }),
    cornerPoints: pts,
    nearestContactGap: Number(minGap.toFixed(5)),
    maxCornerGap: Number(maxGap.toFixed(5)),
    minCornerGap: Number(minGap.toFixed(5)),
    cornerSpread: Number((maxGap - minGap).toFixed(5)),
    overhangFrac: Number(overhangFrac.toFixed(5)),
    cornersOutsideSupport: outside,
    measuredFromScene: measured,
    /* the LEGACY reading, printed beside the new one so the receipt shows the old gate
       reading 0.096-green on a frame the new signals fail (the argument for replacing it) */
    legacyOriginGap: Number((originY - opts.planeAt(opts.standX, opts.standZ)).toFixed(5)),
    fires: {
      F1: minGap < TERRAIN_CONTACT_THRESHOLDS.minCornerGap,
      F2: maxGap > TERRAIN_CONTACT_THRESHOLDS.maxCornerGap,
      F3: overhangFrac > TERRAIN_CONTACT_THRESHOLDS.overhangBlockFrac
    }
  };
}

/* ─── §3 B3 · THE FOUR SURFACE CASES A STANDEE MUST SURVIVE ───────────────────────────────────
   The build spec asks for the envelopes proved "on slope / stair / chamfered cell / folded cell".
   Measured against the chassis, those four names collapse into FOUR CELL CLASSES, and saying so is
   more honest than pretending they are four fixtures:

     flat     gradient 0, no exposed side — the control, and the case the chamfer/fold devices are
              proved on, since both apply to every cell rather than to a special one
     edge     one neighbour exactly 1h down: the arris case. This is where A2's roll-over, A3's cap
              overhang and B2's nosing all land.
     run      neighbours 1h down on one side and 1h up on the other: a stair run and a graded slope
              are THE SAME CELL CLASS in an integer heightfield. FFT's cell-scale stair is tread =
              1 cell, riser = 1 quantum — which is exactly this. Only the render differs.
     facetop  a 2h+ drop beside it: the cell that owns a guarded face. The steepest render, and the
              one where a plinth is nearest to real daylight.

   Picks are spread by at least `minSpacing` cells so a Huge envelope's own footprint can never
   overlap the next witness's. Deterministic: lowest cell index wins every tie. */
function terrainContractCellClass(field, index){
  var c = field.cells[index];
  if(!c || !c.standable || c.kind === "void") return null;
  var step = TERRAIN_GRID_LAW.walkableStepQuanta;
  var drops = [[-1, 0], [1, 0], [0, -1], [0, 1]].map(function(d){
    var nx = c.x + d[0], ny = c.y + d[1];
    if(nx < 0 || ny < 0 || nx >= field.extent.x || ny >= field.extent.y) return null;
    var n = field.cells[ny * field.extent.x + nx];
    if(!n || n.kind === "void") return null;
    return c.h - n.h;
  });
  var known = drops.filter(function(d){ return d != null; });
  if(known.some(function(d){ return Math.abs(d) >= TERRAIN_GRID_LAW.faceStepQuanta; })) return "facetop";
  var g = terrainCellGradient(field, index);
  var mag = Math.max(Math.abs(g.dx), Math.abs(g.dz));
  if(mag >= step - 1e-9) return "run";
  if(known.some(function(d){ return d === step; })) return "edge";
  if(known.every(function(d){ return d === 0; }) && known.length === 4) return "flat";
  return null;
}

function terrainContractCellPicks(field, opts){
  var o = opts || {};
  var perClass = o.perClass == null ? 3 : o.perClass;
  var minSpacing = o.minSpacing == null ? 4 : o.minSpacing;
  var classes = { flat: [], edge: [], run: [], facetop: [] };
  var taken = [];
  function farEnough(c){
    for(var i = 0; i < taken.length; i++){
      if(Math.abs(taken[i].x - c.x) < minSpacing && Math.abs(taken[i].y - c.y) < minSpacing) return false;
    }
    return true;
  }
  for(var i = 0; i < field.cells.length; i++){
    var cls = terrainContractCellClass(field, i);
    if(!cls || classes[cls].length >= perClass) continue;
    var c = field.cells[i];
    if(!farEnough(c)) continue;
    classes[cls].push(i);
    taken.push(c);
  }
  return classes;
}

/* ─── §5 · THE GAMEPLAY-INVARIANCE GATE ───────────────────────────────────────────────────────
   Across all six URL-compatible rungs the walkable census, cover set, occupancy and LOS must be
   byte-identical. The retired `decal` control intentionally matches `material`.
   That is what makes this provably a dressing pass and not a silent gameplay change.

   `buildScene(rungId)` is supplied by the caller so this works from jsdom and from the browser
   against exactly the same code path. */
function terrainExpressionInvarianceProof(buildScene){
  var rows = [];
  TERRAIN_EXPRESSION_RUNG_IDS.forEach(function(rungId){
    var scene = buildScene(rungId);
    var fields = scene.fields || [scene];
    rows.push({
      rung: rungId,
      flags: terrainExpressionFlags(rungId).on.join("+") || "(none)",
      walkFingerprints: fields.map(function(f){ return terrainWalkFingerprint(f); }),
      fullFingerprints: fields.map(function(f){ return f.fingerprint; }),
      standableCells: fields.reduce(function(a, f){ return a + f.metrics.standableCells; }, 0),
      walkEdges: fields.reduce(function(a, f){ return a + f.metrics.walkEdges; }, 0),
      faces: fields.reduce(function(a, f){ return a + f.metrics.faces; }, 0),
      entryCells: fields.reduce(function(a, f){ return a + f.metrics.entryCells; }, 0)
    });
  });
  var base = JSON.stringify(rows[0].walkFingerprints);
  var diverged = rows.filter(function(r){ return JSON.stringify(r.walkFingerprints) !== base; });
  return {
    contract: "walkable census + cover set + occupancy + LOS byte-identical across every rung",
    instrument: "terrainWalkFingerprint — (heights, standable, inPlayfield, guarded, walkAdj, faces, entries)",
    rungs: rows,
    identical: diverged.length === 0,
    divergedRungs: diverged.map(function(r){ return r.rung; }),
    verdict: diverged.length === 0
      ? "COSMETIC — every rung reports the same walk-only fingerprint"
      : "GAMEPLAY CHANGE — " + diverged.map(function(r){ return r.rung; }).join(",")
  };
}
