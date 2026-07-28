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
   terrainWalkFingerprint() — a fingerprint over (standable, walkAdj) and nothing else, so
   "cosmetic" is one comparable string instead of a claim (the F11 signal).

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
  Object.freeze({ id: "A7", key: "facedress", bin: "decal", rung: "A",
    label: "seam and face dressing (horizontal banding on exposed faces)", gameplay: false,
    grounds: "XCOM §1.2 — the volume behind a thin face is free; FFT device #7, face banding." }),
  Object.freeze({ id: "B1", key: "slopeplinth", bin: "geometry", rung: "B",
    label: "the plinth tilts to the cell's declared stand plane", gameplay: false,
    grounds: "STANDEE-CONTRACT §3(d) — the only option with zero error at every yaw." }),
  Object.freeze({ id: "B2", key: "nosing", bin: "geometry", rung: "B",
    label: "cell-scale stair nosing (the tread overhangs its riser)", gameplay: false,
    grounds: "FFT-SURFACE-GRAMMAR §2.4 — the nosing is what stops a run reading as stacked cubes." }),
  Object.freeze({ id: "B4", key: "fold", bin: "geometry", rung: "B",
    label: "tri-split fold as sub-quantum relief over one declared stand plane", gameplay: false,
    grounds: "STANDEE-CONTRACT §4(A) — a Medium does not fit in a half-cell triangle at any yaw." }),
  Object.freeze({ id: "C1", key: "shallowgrade", bin: "geometry", rung: "C",
    label: "the render-only shallow grade (18.0 deg, the corpus's common walkable grade)",
    gameplay: false,
    grounds: "FFT-SURFACE-GRAMMAR §2.2 — Genesis's only legal slope is 26.565 deg; FFT's common one is 18." })
]);

var TERRAIN_EXPRESSION_DEVICE_KEYS = Object.freeze(
  TERRAIN_EXPRESSION_DEVICES.map(function(d){ return d.key; }));

/* ─── THE LADDER (§5) ─────────────────────────────────────────────────────────────────────────
   naked -> +material -> +decal -> +prop -> all -> jitter-disabled negative control. The geometry
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
  Object.freeze({ id: "decal", index: 2, label: "A2 · + DECAL/PAINT BIN",
    bins: Object.freeze(["material", "geometry", "decal"]),
    claim: "what the flat-mark bin adds on its own." }),
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
  flags.anyDevice = flags.on.length > 0;
  return flags;
}

/* ─── F11 · THE WALK-ONLY FINGERPRINT ─────────────────────────────────────────────────────────
   terrainFieldFingerprint folds kind, surface and depthH, so it moves for a purely visual edit and
   cannot answer "was this cosmetic?". This one folds ONLY the two things gameplay reads off the
   field: which cells are standable, and which cells are walk-adjacent to which. Byte-identical
   across a change declared cosmetic, or the change was not cosmetic.

   Cover and line of sight are not separately folded because on this chassis both are DERIVED from
   the same two arrays plus the integer heights: cover comes from the 2h+ face rule
   (terrain-field.js pushFace) and LOS from the heightfield itself. So heights are folded too, and
   the three claims collapse into one string. */
function terrainWalkFingerprint(field){
  var parts = [];
  var n = field.cells.length;
  for(var i = 0; i < n; i++){
    var c = field.cells[i];
    var adj = field.walkAdj[i] ? field.walkAdj[i].slice().sort(function(a, b){ return a - b; }) : [];
    parts.push(field.heights[i] + ":" + (c.standable ? 1 : 0) + ":" + (c.inPlayfield ? 1 : 0)
      + ":" + (c.guarded ? 1 : 0) + ":" + adj.join("."));
  }
  parts.push("faces=" + field.faces.map(function(f){
    return f.highIndex + ">" + f.lowIndex + "@" + f.deltaH;
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

/* The gradient of the walkable neighbourhood, in quanta per cell, clamped to the walkable step so
   a rendered plane can never claim a grade the walk law forbids. A face (2h+) contributes its
   CLAMPED share only: the drop past one quantum is the face's business, not the top plane's. */
function terrainCellGradient(field, index){
  var c = field.cells[index];
  var step = TERRAIN_GRID_LAW.walkableStepQuanta;
  function clampStep(v){ return Math.max(-step, Math.min(step, v)); }
  var w = clampStep(terrainCellNeighbourH(field, c.x - 1, c.y, c.h) - c.h);
  var e = clampStep(terrainCellNeighbourH(field, c.x + 1, c.y, c.h) - c.h);
  var n = clampStep(terrainCellNeighbourH(field, c.x, c.y - 1, c.h) - c.h);
  var s = clampStep(terrainCellNeighbourH(field, c.x, c.y + 1, c.h) - c.h);
  /* central difference over one cell: (east - west) / 2 gives quanta per cell */
  return { dx: (e - w) / 2, dz: (s - n) / 2 };
}

/* The declared stand plane for a cell, in quanta. `y` is the cell-centre height and NEVER moves —
   that is what keeps the standee's foot height, the walk graph, occupancy, cover and reach
   untouched (FFT-SURFACE-GRAMMAR option A's own guarantee). Only the gradient is new. */
function terrainCellStandPlane(field, index, flags){
  var c = field.cells[index];
  var on = !!(flags && flags.shallowgrade);
  var g = on ? terrainCellGradient(field, index) : { dx: 0, dz: 0 };
  var scale = on ? TERRAIN_SHALLOW_GRADE_H : 0;
  var dx = g.dx * scale, dz = g.dz * scale;
  var q = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  /* the steepest rise the plane expresses across one cell, as a slope in degrees */
  var riseH = Math.sqrt(dx * dx + dz * dz);
  return {
    centreH: c.h + c.sub,
    dHdx: dx, dHdz: dz,                        /* quanta per cell */
    dYdx: dx * q, dYdz: dz * q,                /* world units per cell */
    slopeDeg: terrainSlopeDegForStepH(riseH),
    /* unit normal in world space (y up), for the F9 pool-normal check */
    normal: (function(){
      var nx = -dx * q, ny = 1, nz = -dz * q;
      var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      return [nx / len, ny / len, nz / len];
    })()
  };
}

/* ─── B4 · THE TRI-SPLIT FOLD ─────────────────────────────────────────────────────────────────
   Honestly: a Medium standee cannot stand inside one half-cell triangle at any yaw (inscribed disc
   0.586 against 0.831 needed), so the fold is NOT two surfaces. The cell declares ONE stand plane
   and the fold is sub-quantum relief over it — the mechanism TERRAIN_WALK_NOISE_BUDGET_H already
   provides, budgeted so it can never change a tier.

   Two extra guarantees this implementation adds beyond the budget:
     * the fold is ZERO at the stand point and reaches full amplitude only at the cell rim (a radial
       attenuation), so the plinth's own footprint is never sitting on a ridge or over a trough;
     * the diagonal is a deterministic per-cell bit, so a saddle cell gets the crease that serves it
       rather than whichever way the quad happened to triangulate. */
function terrainCellFoldDiagonal(field, index){
  var c = field.cells[index];
  return (terrainHash32(field.seed + ":fold:" + c.x + "," + c.y) & 1) ? 1 : 0;
}

/* u, v in [-0.5, 0.5] across the cell. Returns a height offset in QUANTA. */
function terrainCellFoldOffset(field, index, u, v, flags){
  if(!flags || !flags.fold) return 0;
  var budget = TERRAIN_WALK_NOISE_BUDGET_H.perCellH;
  var c = field.cells[index];
  var diag = terrainCellFoldDiagonal(field, index);
  /* the crease runs corner to corner; the ridge/valley sign is the fold bit */
  var along = diag ? (u + v) : (u - v);
  var crease = 1 - Math.abs(along) * Math.SQRT2;      /* 1 on the diagonal, 0 at the far corners */
  var sign = (terrainHash32(field.seed + ":foldsign:" + c.x + "," + c.y) & 2) ? 1 : -1;
  /* radial attenuation: zero under the stand point, full at the rim */
  var r = Math.min(1, Math.sqrt(u * u + v * v) / 0.5);
  return sign * crease * budget * (r * r);
}

/* The full rendered top, in QUANTA, at a point inside the cell. The renderer builds its cap from
   this and the standee mount reads terrainCellStandPlane — the fold is deliberately NOT in the
   stand plane, because relief under a miniature is cobblestone, not support. */
function terrainCellTopH(field, index, u, v, flags){
  var plane = terrainCellStandPlane(field, index, flags);
  return plane.centreH + plane.dHdx * u + plane.dHdz * v
    + terrainCellFoldOffset(field, index, u, v, flags);
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
  /* F7 — the sprite must NOT tilt with the base; it holds the camera-pitch value and nothing else */
  spriteTiltDeg: 0.5,
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
   Across all six rungs the walkable census, cover set, occupancy and LOS must be byte-identical.
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
