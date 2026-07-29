/* ─── R1-00 · THE TERRAIN FIELD — the rung-1 chassis ───────────────────────────────────────────
   docs/TERRAIN-PROGRAM.md §2.0 (Genesis-clayspec lane, 2026-07-27). ONE procedural heightfield
   generator. Not thirteen generators — one field plus a shaping vocabulary plus ONE clamp.

   REAL-WORLD CONSTRUCTION FIRST (the standing 3D ruling): this is graded ground. A surveyor sets a
   datum and every point on the site is a whole number of steps above or below it. That is how a
   site plan is actually drawn and it is why cut-and-fill balances. So the field is an INTEGER array
   of n x h, never a float surface that gets rounded at render time.

   THE ONE GEOMETRIC LAW (§2.0, verbatim intent): a rise of <=1h across one 5-ft cell is walkable
   (atan 2.5/5 = 26.57 deg, inside the 30 deg limit). A rise of >1h across one cell is a FACE —
   guarded, climbable, never walked. Hills and cliffs are the same generator with one clamp changed.

   HOW THE CLAMP IS IMPLEMENTED, and why this shape was chosen (decision, grounds recorded in
   docs/DESIGN.md 2026-07-27): the clamp is a MIN-PLUS LIPSCHITZ LOWER ENVELOPE, not an iterative
   smoother. For a uniform clamp c the result is exactly

       h_final[cell] = min over every cell d of ( h_demand[d] + c * manhattan(cell, d) )

   computed by alternating forward/backward chamfer sweeps to a fixed point. Two consequences that
   an iterative smoother does not give:
     * it is order-independent and terminates, so the same spec is byte-identical every run;
     * it CANNOT emit an illegal slope. §2.1 R1-02 names the >1h walkable step as "the single most
       likely place this system lies". Under a Lipschitz envelope that lie is structurally
       impossible rather than merely tested for.
   Edge cost is max(clamp[a], clamp[b]): an edge that touches a guarded cell is free, which is
   exactly the statement "a face is permitted here, and the guarded piece owns it".

   Engine layer. No THREE, no DOM, no camera. Renderer projection lives in
   src/ui/theater-terrain-bench.js; the piece presets live in src/engine/terrain-pieces.js. */

/* Quanta are NOT re-derived here. They are the STRUCTURE-KIT-CATALOG §2 grid law (ruled
   2026-07-24, redline R1 LOCKED) restated as terrain-side constants so this module has no load
   order dependency on the clay fixture file. dev/verify-terrain-bench.mjs asserts the two are
   equal, so drift is caught rather than trusted. */
var TERRAIN_GRID_LAW = Object.freeze({
  cellFeet: 5,
  cellWorldUnits: 1,
  verticalQuantumFeet: 2.5,
  verticalQuantumWorldUnits: 0.5,
  storeyQuanta: 4,
  storeyFeet: 10,
  maxWalkableSlopeDeg: 30,
  walkableStepQuanta: 1,
  faceStepQuanta: 2,
  climbDcBands: Object.freeze([12, 15, 17]),
  source: "docs/STRUCTURE-KIT-CATALOG.md §2 via docs/TERRAIN-PROGRAM.md §2.0"
});

/* Infinity is the spec's own notation for "faces permitted". Arithmetic stays finite. */
var TERRAIN_CLAMP_FREE = 1000000;

/* The walkable step is 1h across one cell = 26.565 deg. The 30 deg limit therefore leaves a
   sub-quantum headroom of tan(30 deg)*cellFeet/verticalQuantumFeet - 1 = 0.1547h between two
   walk-connected cell centres. Surface break-up on a walkable cell may spend at most half of that
   per cell; a guarded cell has no walk obligation and spends the full requested amplitude. */
var TERRAIN_WALK_NOISE_BUDGET_H = Object.freeze({
  maxRenderedStepH: Math.tan(30 * Math.PI / 180) * 5 / 2.5,
  perCellH: (Math.tan(30 * Math.PI / 180) * 5 / 2.5 - 1) / 2
});

function terrainSlopeDegForStepH(stepH){
  return Math.atan2(Math.abs(stepH) * TERRAIN_GRID_LAW.verticalQuantumFeet,
    TERRAIN_GRID_LAW.cellFeet) * 180 / Math.PI;
}

/* ─── determinism ─────────────────────────────────────────────────────────────────────────────
   A segment id is a string. The same segment id must produce a byte-identical heightfield in two
   separate page loads — that is a hard gate (§4.3). So: FNV-1a over the id for the seed, mulberry32
   for the stream, integer state throughout, no Math.random anywhere in this file. */
function terrainHash32(text){
  var h = 0x811c9dc5;
  var s = String(text == null ? "" : text);
  for(var i = 0; i < s.length; i++){
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

function terrainSeedFrom(segmentId){ return terrainHash32(segmentId); }

function terrainRng(seed){
  var a = (seed >>> 0) || 0x9e3779b9;
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* A named sub-stream. Two pieces on the same field must not be able to shift each other's rolls by
   being reordered, so each draws from hash(seed + ":" + name) rather than from a shared cursor. */
function terrainSubRng(seed, name){
  return terrainRng(terrainHash32(String(seed) + ":" + name));
}

/* ─── playfield outlines ─────────────────────────────────────────────────────────────────────
   The 50 area-type shapes reduce to a handful of outlines. Only the ones rung 1 needs are here;
   an unknown shape falls back to the full rectangle and says so in the receipt. */
function terrainShapeMask(shape, ex, ey){
  var mask = new Uint8Array(ex * ey);
  var cx = (ex - 1) / 2, cy = (ey - 1) / 2;
  var i, x, y;
  function set(x, y, v){ mask[y * ex + x] = v ? 1 : 0; }
  for(y = 0; y < ey; y++){
    for(x = 0; x < ex; x++){
      /* Normalize so the extreme cell CENTRES land at +-1: an outline that never reaches its own
         bounding box reads as a blob, not as the rolled shape. */
      var nx = (x - cx) / Math.max(0.5, (ex - 1) / 2), ny = (y - cy) / Math.max(0.5, (ey - 1) / 2);
      var keep = true;
      if(shape === "oval"){
        keep = (nx * nx + ny * ny) <= 1.0;
      } else if(shape === "kidney"){
        /* A kidney is an oval with one flank pushed in: the indentation is a second, smaller disc
           subtracted from the west flank at mid-height. Both paths at the ends stay open, which is
           what rows 259-264 mean by "20' wide paths at both ends". */
        /* A kidney is an oval with one flank pushed in — a smaller disc subtracted from the west
           flank at mid-height. Both ends stay open, which is what rows 259-264 mean by "20' wide
           paths at both ends". */
        var inOval = (nx * nx + ny * ny) <= 1.0;
        var bx = (x - (cx - (ex - 1) * 0.52)) / Math.max(0.5, (ex - 1) * 0.40);
        var by = (y - cy) / Math.max(0.5, (ey - 1) * 0.30);
        var inBite = (bx * bx + by * by) <= 1;
        keep = inOval && !inBite;
      } else if(shape === "circle"){
        var r = Math.min(ex, ey) / 2;
        keep = ((x - cx) * (x - cx) + (y - cy) * (y - cy)) <= r * r;
      } else if(shape === "diamond"){
        keep = (Math.abs(nx) + Math.abs(ny)) <= 1.0;
      }
      set(x, y, keep);
    }
  }
  /* A mask that disconnects the playfield is a bug, not a shape. Keep only the largest 4-connected
     component so "paths at both ends" always belong to one board. */
  var comp = new Int32Array(ex * ey).fill(-1);
  var best = -1, bestSize = 0, next = 0;
  for(i = 0; i < mask.length; i++){
    if(!mask[i] || comp[i] >= 0) continue;
    var id = next++, stack = [i], size = 0;
    comp[i] = id;
    while(stack.length){
      var c = stack.pop(); size++;
      var cxx = c % ex, cyy = (c - cxx) / ex;
      var nb = [[cxx - 1, cyy], [cxx + 1, cyy], [cxx, cyy - 1], [cxx, cyy + 1]];
      for(var k = 0; k < 4; k++){
        var px = nb[k][0], py = nb[k][1];
        if(px < 0 || py < 0 || px >= ex || py >= ey) continue;
        var pi = py * ex + px;
        if(!mask[pi] || comp[pi] >= 0) continue;
        comp[pi] = id; stack.push(pi);
      }
    }
    if(size > bestSize){ bestSize = size; best = id; }
  }
  for(i = 0; i < mask.length; i++) if(mask[i] && comp[i] !== best) mask[i] = 0;
  return mask;
}

/* ─── the shaping vocabulary ─────────────────────────────────────────────────────────────────
   §2.0: "one heightfield plus thirteen ways of shaping and cutting it". These are the ways. Each
   op writes a DEMAND in h units plus a per-cell clamp; the thirteen pieces are parameter sets that
   select ops and values, never new generators. Every op is pure and takes its randomness from a
   named sub-stream. */
var TERRAIN_CHASSIS_OPS = Object.freeze(["radial", "ridge", "basin", "slot", "terrace", "apron", "scatter", "patch"]);

function terrainOpApply(op, ctx){
  var ex = ctx.ex, ey = ctx.ey;
  var demand = ctx.demand, clamp = ctx.clamp, owner = ctx.owner, kind = ctx.kind;
  var p = op.params || {};
  var rng = ctx.rng;
  var x, y, i, d;

  /* Every op may be BOUNDED to a rectangle. Thirteen pieces on one sheet each need their own bay,
     and an op that silently paints the whole field is the bug that makes a bench unreadable. */
  var bnd = p.bounds || null;
  /* R3 authored-form projection. A ridge, bank, or runoff cut needs to know where it is along
     its whole path, not only how far it is from the nearest segment. That permits broad-to-narrow
     shoulders and entrances/exits that fade into the field instead of ending as vertical walls.
     Kept local to the op evaluator so this remains one shaping vocabulary, not a second generator. */
  function polylineProjection(points, px, py){
    var total = 0, lengths = [];
    for(var si = 0; si + 1 < points.length; si++){
      var svx = points[si + 1].x - points[si].x;
      var svy = points[si + 1].y - points[si].y;
      var sl = Math.sqrt(svx * svx + svy * svy);
      lengths.push(sl);
      total += sl;
    }
    var best = Infinity, side = 1, along = 0, before = 0;
    for(var sj = 0; sj + 1 < points.length; sj++){
      var a = points[sj], b = points[sj + 1];
      var vx = b.x - a.x, vy = b.y - a.y;
      var len2 = vx * vx + vy * vy || 1;
      var tt = Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / len2));
      var qx = a.x + tt * vx, qy = a.y + tt * vy;
      var dd = Math.sqrt((px - qx) * (px - qx) + (py - qy) * (py - qy));
      if(dd < best){
        best = dd;
        side = ((px - qx) * vy - (py - qy) * vx) >= 0 ? 1 : -1;
        along = before + tt * (lengths[sj] || 0);
      }
      before += lengths[sj] || 0;
    }
    return {
      distance: best, side: side, along: along, total: total,
      t01: total > 0 ? Math.max(0, Math.min(1, along / total)) : 0
    };
  }
  function lerpParam(start, end, fallback, t){
    var a = start == null ? fallback : start;
    var b = end == null ? a : end;
    return a + (b - a) * t;
  }
  function endFade(proj, fadeCells){
    if(!(fadeCells > 0) || !(proj.total > 0)) return 1;
    return Math.max(0, Math.min(1,
      proj.along / fadeCells,
      (proj.total - proj.along) / fadeCells));
  }
  function write(x, y, value, cellClamp, cellKind, modeOverride){
    if(x < 0 || y < 0 || x >= ex || y >= ey) return;
    if(bnd && (x < bnd.x || y < bnd.y || x >= bnd.x + bnd.w || y >= bnd.y + bnd.d)) return;
    i = y * ex + x;
    var mode = modeOverride || op.mode;
    if(mode === "max"){ if(value > demand[i]) demand[i] = value; }
    else if(mode === "min"){ if(value < demand[i]) demand[i] = value; }
    else demand[i] = value;
    clamp[i] = Math.max(clamp[i], cellClamp == null ? ctx.slopeClamp : cellClamp);
    owner[i] = op.ownerId || ctx.ownerId;
    if(cellKind) kind[i] = cellKind;
  }

  if(op.type === "radial"){
    /* A pile of material: peak at the centre, falling to zero at the footprint radius. `asymmetry`
       pushes the crest off-centre, which is what makes one flank steep and the other long — the
       windward and lee sides of a real hill are never the same. `radiusX/radiusY/rotationDeg`
       extend that same mass into an authored shoulder or spur; they do not add per-cell noise. */
    var rrx = p.radiusX || p.radius || 1;
    var rry = p.radiusY || p.radius || 1;
    var rang = (p.rotationDeg || 0) * Math.PI / 180;
    var rcos = Math.cos(rang), rsin = Math.sin(rang);
    var ashift = (p.asymmetry || 0) * rrx * 0.5;
    var acx = p.cx + ashift * rcos;
    var acy = p.cy + ashift * rsin
      + (p.rotationDeg == null ? (p.asymmetry || 0) * (p.radius || 1) * 0.25 : 0);
    for(y = 0; y < ey; y++) for(x = 0; x < ex; x++){
      var dx = (x - acx), dy = (y - acy);
      var rlx = dx * rcos + dy * rsin;
      var rly = -dx * rsin + dy * rcos;
      var r = Math.sqrt((rlx * rlx) / Math.max(0.001, rrx * rrx)
        + (rly * rly) / Math.max(0.001, rry * rry));
      if(r > 1) continue;
      var t = 1 - r;
      var prof = p.profile === "concave" ? (t * t)
        : p.profile === "sigmoid" ? (t * t * (3 - 2 * t))
        : t;                                        /* convex/default: linear fall */
      var flatR = (p.crownFlatCells || 0) / Math.max(0.001, Math.min(rrx, rry)) / 2;
      if(flatR > 0 && r <= flatR) prof = 1;
      write(x, y, (p.baseH || 0) + prof * (p.peakH || 0), p.slopeClamp, p.kind || "ground");
    }
    return;
  }

  if(op.type === "ridge"){
    /* Dig a ditch and the spoil goes beside it: the bank IS the hole's material. One polyline, one
       half-width, and an optional sign flip for the paired ditch. */
    var pts = p.polyline || [];
    for(y = 0; y < ey; y++) for(x = 0; x < ex; x++){
      var ridgeProj = polylineProjection(pts, x, y);
      var best = ridgeProj.distance, side = ridgeProj.side;
      var hw = lerpParam(p.halfWidthStartCells, p.halfWidthEndCells,
        p.halfWidthCells == null ? 0.5 : p.halfWidthCells, ridgeProj.t01);
      var ridgeHeight = lerpParam(p.heightStartH, p.heightEndH, p.heightH || 0, ridgeProj.t01);
      var ridgeFade = endFade(ridgeProj, p.endFadeCells);
      /* A CLIFF or a BANK is not a ridge: it is two grounds at different datums meeting at an edge.
         `halfPlane` builds that — everything on the plateau side of the polyline stands at the
         upper datum and everything on the other side stays at the lower one. A ridge (berm) is the
         symmetric case and keeps the original path. Same op, one named parameter. */
      if(p.halfPlane){
        if(side === (p.plateauSide == null ? -1 : p.plateauSide)){
          write(x, y, (p.baseH || 0) + ridgeHeight, p.slopeClamp, p.kind || "ground");
        }
      } else if(best <= hw){
        var falloff;
        if(p.crossProfile){
          var crestHalf = Math.max(0, p.crestHalfWidthCells || 0);
          var rr = Math.max(0, Math.min(1,
            (best - crestHalf) / Math.max(0.001, hw - crestHalf)));
          falloff = rr <= 0 ? 1 : (p.crossProfile === "smooth"
            ? 1 - rr * rr * (3 - 2 * rr)
            : (p.crossProfile === "concave" ? (1 - rr) * (1 - rr) : 1 - rr));
        } else {
          falloff = p.crestWidthCells >= 1 ? 1 : Math.max(0, 1 - (best / Math.max(0.001, hw)));
        }
        write(x, y, (p.baseH || 0) + ridgeHeight * falloff * ridgeFade,
          p.slopeClamp, p.kind || "ground");
      } else {
        var ditchWidth = lerpParam(p.ditchWidthStartCells, p.ditchWidthEndCells,
          p.ditchWidthCells || 1, ridgeProj.t01);
        if(p.pairedDitch && best <= hw + ditchWidth && side === (p.ditchSide || -1)){
          var ditchDepth = lerpParam(p.ditchDepthStartH, p.ditchDepthEndH,
            p.ditchDepthH || 1, ridgeProj.t01);
          write(x, y, (p.baseH || 0) - ditchDepth * ridgeFade,
            p.slopeClamp, p.kind || "ground", "min");
        }
      }
    }
    return;
  }

  if(op.type === "basin"){
    /* A depression that intersects the water table. This op cuts the HOLE only. The water surface
       is a separate horizontal plane at waterDatumH and the shoreline is DERIVED — never drawn —
       so raising the datum floods outward for free, correctly, following the real ground. */
    for(y = 0; y < ey; y++) for(x = 0; x < ex; x++){
      var bdx = x - p.cx, bdy = y - p.cy;
      var brx = p.radiusX || p.radius || 1;
      var bry = p.radiusY || p.radius || 1;
      var bang = (p.rotationDeg || 0) * Math.PI / 180;
      var bcos = Math.cos(bang), bsin = Math.sin(bang);
      var blx = bdx * bcos + bdy * bsin;
      var bly = -bdx * bsin + bdy * bcos;
      var br = Math.sqrt((blx * blx) / Math.max(0.001, brx * brx)
        + (bly * bly) / Math.max(0.001, bry * bry));
      if(br > 1) continue;
      var depth = p.shoreProfile === "undercut-bank" ? (br < 0.85 ? 1 : (1 - br) / 0.15)
        : p.shoreProfile === "stepped-shelf" ? Math.min(1, Math.ceil((1 - br) * 3) / 3)
        : (1 - br);                                  /* gentle-wade */
      write(x, y, (p.baseH || 0) - Math.round((p.maxDepthH || 0) * depth), p.slopeClamp,
        p.kind || "ground");
    }
    return;
  }

  if(op.type === "slot"){
    /* A joint in bedrock widened by frost and water: two near-parallel walls and a floor. Cut a
       band along the polyline down to floorH; the walls either side are faces by construction, so
       the slot carries its own free clamp. */
    var spts = p.polyline || [];
    for(y = 0; y < ey; y++) for(x = 0; x < ex; x++){
      var slotProj = polylineProjection(spts, x, y);
      var sbest = slotProj.distance;
      var slotWidth = lerpParam(p.widthStartCells, p.widthEndCells, p.widthCells || 1,
        slotProj.t01);
      var shw = slotWidth / 2;
      if(sbest <= shw){
        var slotDepth = lerpParam(p.depthStartH, p.depthEndH, p.depthH || 0,
          slotProj.t01) * endFade(slotProj, p.endFadeCells);
        var floorH = (p.baseH || 0) - slotDepth;
        if(p.floorProfile === "rising") floorH += Math.round((p.depthH || 0) * 0.4);
        write(x, y, floorH, p.slopeClamp, p.void ? "void" : (p.kind || "ground"));
      }
    }
    return;
  }

  if(op.type === "terrace"){
    /* A slope converted into a staircase of flats, each held by a short retaining face. The tread
       is wide and the face is 1h-2h because that is what you can build without engineering. */
    var steps = p.stepCount || 3, rise = p.riseHPerStep || 1, tread = p.treadDepthCells || 2;
    for(y = 0; y < ey; y++) for(x = 0; x < ex; x++){
      var along = p.axis === "x" ? (x - (p.originCell ? p.originCell.x : 0))
        : (y - (p.originCell ? p.originCell.y : 0));
      if(along < 0) continue;
      var step = Math.floor(along / tread);
      if(step >= steps) step = steps - 1;
      var across = p.axis === "x" ? y - (p.originCell ? p.originCell.y : 0)
        : x - (p.originCell ? p.originCell.x : 0);
      if(across < 0 || across >= (p.widthCells || ex)) continue;
      write(x, y, (p.baseH || 0) + step * rise, p.slopeClamp, p.kind || "ground");
    }
    return;
  }

  if(op.type === "apron"){
    /* An edge condition, not an object: the slope rises out of sight beyond a bench of workable
       ground. riseRate above 1h/cell is guarded slope by definition. */
    var edges = p.edgesOccupied || ["n"];
    /* "Edge" means the edge of this piece's own region — its bay on a sheet, or the tray when it
       has the tray to itself. Measuring from the raw field would make one bench piece claim every
       border on the board. */
    var rx = bnd ? bnd.x : 0, ry = bnd ? bnd.y : 0;
    var rw = bnd ? bnd.w : ex, rd = bnd ? bnd.d : ey;
    for(y = ry; y < ry + rd; y++) for(x = rx; x < rx + rw; x++){
      var inward = Infinity;
      if(edges.indexOf("n") >= 0) inward = Math.min(inward, y - ry);
      if(edges.indexOf("s") >= 0) inward = Math.min(inward, ry + rd - 1 - y);
      if(edges.indexOf("w") >= 0) inward = Math.min(inward, x - rx);
      if(edges.indexOf("e") >= 0) inward = Math.min(inward, rx + rw - 1 - x);
      var bench = p.benchWidthCells == null ? 2 : p.benchWidthCells;
      if(inward >= bench + (p.depthCells || 3)) continue;
      if(inward >= bench){
        var up = (inward - bench + 1) * (p.riseRateH || 2);
        write(x, y, (p.baseH || 0) + up, p.slopeClamp, "guarded-slope");
      }
    }
    return;
  }

  if(op.type === "scatter"){
    /* Blocks that fell off something in events, not continuously, embedded to a third of their
       height with soil banked uphill. The tactical content is the ARRANGEMENT, so spacing and gap
       are parameters and the rock body is not this module's business. */
    var n = p.count || 3;
    var placed = [];
    for(var b = 0; b < n; b++){
      var bx, by;
      if(p.arrangement === "paired-gate"){
        var gap = p.gapWidthCells || 1;
        bx = Math.round(p.cx + (b % 2 === 0 ? -1 : 1) * (gap / 2 + 1));
        by = Math.round(p.cy + Math.floor(b / 2) * (p.spacingCells || 2));
      } else if(p.arrangement === "ring"){
        var ang = (b / n) * Math.PI * 2;
        bx = Math.round(p.cx + Math.cos(ang) * (p.spacingCells || 2));
        by = Math.round(p.cy + Math.sin(ang) * (p.spacingCells || 2));
      } else if(p.arrangement === "linear-fall"){
        bx = Math.round(p.cx + b * (p.spacingCells || 2));
        by = Math.round(p.cy + (rng() - 0.5) * (p.spacingJitter || 0) * 2);
      } else {
        bx = Math.round(p.cx + (rng() - 0.5) * 2 * (p.spacingCells || 3));
        by = Math.round(p.cy + (rng() - 0.5) * 2 * (p.spacingCells || 3));
      }
      var lo = (p.heightRangeH && p.heightRangeH[0]) || 1;
      var hi = (p.heightRangeH && p.heightRangeH[1]) || 2;
      var hh = lo + Math.floor(rng() * (hi - lo + 1));
      placed.push({ x: bx, y: by, heightH: hh });
      write(bx, by, (p.baseH || 0) + hh, p.slopeClamp, "boulder");
    }
    op.placed = placed;
    return;
  }

  if(op.type === "patch"){
    /* Sub-quantum ground state — a film of water, a coverage band, a material change. It never
       moves a cell's tier, which is why it writes to the surface layer and not to demand. */
    var cells = p.cells || [];
    for(d = 0; d < cells.length; d++){
      var pc = cells[d];
      if(pc.x < 0 || pc.y < 0 || pc.x >= ex || pc.y >= ey) continue;
      var pi = pc.y * ex + pc.x;
      if(op.surfaceKind || p.surfaceKind) ctx.surface[pi] = op.surfaceKind || p.surfaceKind;
      if(p.surfaceOwner) owner[pi] = p.surfaceOwner;
      if(p.setClamp != null){
        clamp[pi] = p.setClamp === Infinity ? TERRAIN_CLAMP_FREE : p.setClamp;
      }
    }
    return;
  }

  throw new Error("terrainOpApply: unknown op type " + op.type);
}

/* Translate a piece's ops into a bay on a bigger field. Laying thirteen pieces on one sheet must
   not require thirteen bespoke coordinate systems, and a piece built in its own local bay and then
   moved is the same piece — which is the point of a chassis. Deform/stretch stay the presets' own
   named morph parameters; this only moves. */
function terrainOpsTranslate(ops, dx, dy){
  return (ops || []).map(function(op){
    var p = Object.assign({}, op.params);
    if(p.cx != null) p.cx += dx;
    if(p.cy != null) p.cy += dy;
    if(p.apexCell) p.apexCell = { x: p.apexCell.x + dx, y: p.apexCell.y + dy };
    if(p.originCell) p.originCell = { x: p.originCell.x + dx, y: p.originCell.y + dy };
    if(p.polyline) p.polyline = p.polyline.map(function(pt){ return { x: pt.x + dx, y: pt.y + dy }; });
    if(p.cells) p.cells = p.cells.map(function(c){ return { x: c.x + dx, y: c.y + dy }; });
    if(p.bounds) p.bounds = { x: p.bounds.x + dx, y: p.bounds.y + dy, w: p.bounds.w, d: p.bounds.d };
    return Object.assign({}, op, { params: p });
  });
}

/* Offset a polyline along its own normal — a ledge cut into a face, a ditch beside a bank, a rim
   path inside a chasm. One helper, so no preset hand-rolls perpendicular arithmetic. */
function terrainOffsetPolyline(points, distance){
  if(!points || points.length < 2) return points;
  var a = points[0], b = points[points.length - 1];
  var vx = b.x - a.x, vy = b.y - a.y;
  var len = Math.sqrt(vx * vx + vy * vy) || 1;
  var nx = -vy / len, ny = vx / len;
  return points.map(function(pt){ return { x: pt.x + nx * distance, y: pt.y + ny * distance }; });
}

/* ─── THE ONE CLAMP ───────────────────────────────────────────────────────────────────────────
   Min-plus Lipschitz lower envelope over the 4-connected grid. Edge cost = max(clamp[a], clamp[b]),
   so an edge touching a guarded cell is free. Alternating chamfer sweeps to a fixed point; integer
   arithmetic; fixed sweep order; therefore deterministic and byte-identical across page loads. */
function terrainApplyClamp(heights, clampPerCell, ex, ey){
  var passes = 0, changed = true, i, x, y, cost;
  var maxPasses = ex + ey + 4;
  var touched = 0;
  var before = heights.slice();
  while(changed && passes < maxPasses){
    changed = false; passes++;
    for(y = 0; y < ey; y++) for(x = 0; x < ex; x++){
      i = y * ex + x;
      if(x > 0){ cost = Math.max(clampPerCell[i], clampPerCell[i - 1]);
        if(heights[i] > heights[i - 1] + cost){ heights[i] = heights[i - 1] + cost; changed = true; } }
      if(y > 0){ cost = Math.max(clampPerCell[i], clampPerCell[i - ex]);
        if(heights[i] > heights[i - ex] + cost){ heights[i] = heights[i - ex] + cost; changed = true; } }
    }
    for(y = ey - 1; y >= 0; y--) for(x = ex - 1; x >= 0; x--){
      i = y * ex + x;
      if(x < ex - 1){ cost = Math.max(clampPerCell[i], clampPerCell[i + 1]);
        if(heights[i] > heights[i + 1] + cost){ heights[i] = heights[i + 1] + cost; changed = true; } }
      if(y < ey - 1){ cost = Math.max(clampPerCell[i], clampPerCell[i + ex]);
        if(heights[i] > heights[i + ex] + cost){ heights[i] = heights[i + ex] + cost; changed = true; } }
    }
  }
  for(i = 0; i < heights.length; i++) if(heights[i] !== before[i]) touched++;
  return { passes: passes, cellsLowered: touched, converged: !changed };
}

/* ─── the build ──────────────────────────────────────────────────────────────────────────────── */
function terrainFieldBuild(spec){
  if(!spec) throw new Error("terrainFieldBuild: spec required");
  var ex = Math.max(1, (spec.extentCells && spec.extentCells.x) || 1);
  var ey = Math.max(1, (spec.extentCells && spec.extentCells.y) || 1);
  var n = ex * ey;
  var seed = spec.seed != null ? (spec.seed >>> 0) : terrainSeedFrom(spec.segmentId || spec.id || "terrain");
  var baseDatumH = spec.baseDatumH || 0;
  var fieldClamp = spec.slopeClamp === Infinity || spec.slopeClamp == null
    ? TERRAIN_GRID_LAW.walkableStepQuanta : spec.slopeClamp;
  if(spec.slopeClamp === Infinity) fieldClamp = TERRAIN_CLAMP_FREE;

  var demand = new Float64Array(n).fill(baseDatumH);
  var clampPerCell = new Float64Array(n).fill(fieldClamp);
  var owner = new Array(n).fill(spec.id || "field");
  var kind = new Array(n).fill("ground");
  var surface = new Array(n).fill(null);
  var mask = terrainShapeMask(spec.shape || "rect", ex, ey);

  var ops = [];
  (spec.pieces || []).forEach(function(piece){
    (piece.ops || []).forEach(function(op){
      var resolved = {
        type: op.type,
        mode: op.mode || "max",
        surfaceKind: op.surfaceKind || (op.params && op.params.surfaceKind) || null,
        ownerId: piece.id,
        params: Object.assign({}, op.params, {
          slopeClamp: op.params && op.params.slopeClamp === Infinity ? TERRAIN_CLAMP_FREE
            : (op.params && op.params.slopeClamp != null ? op.params.slopeClamp
              : (piece.slopeClamp === Infinity ? TERRAIN_CLAMP_FREE
                : (piece.slopeClamp != null ? piece.slopeClamp : fieldClamp)))
        })
      };
      ops.push({ piece: piece, op: resolved });
    });
  });

  ops.forEach(function(entry, index){
    terrainOpApply(entry.op, {
      ex: ex, ey: ey, demand: demand, clamp: clampPerCell, owner: owner, kind: kind,
      surface: surface, ownerId: entry.piece.id, slopeClamp: fieldClamp,
      rng: terrainSubRng(seed, entry.piece.id + "#" + index)
    });
  });

  /* Quantize BEFORE clamping — the datum is whole steps, so the clamp reasons about the same
     integers the walk graph will. The residue becomes the sub-quantum surface break-up. */
  var heights = new Int32Array(n);
  var residue = new Float64Array(n);
  var i;
  for(i = 0; i < n; i++){
    heights[i] = Math.round(demand[i]);
    residue[i] = demand[i] - heights[i];
  }
  var preClamp = Int32Array.from(heights);
  var clampReport = terrainApplyClamp(heights, clampPerCell, ex, ey);

  /* Sub-quantum break-up. Budgeted, not global (decision, 2026-07-27): a walkable cell may spend at
     most the 30 deg headroom, a guarded cell spends the full requested amplitude. Noise NEVER
     changes a cell's tier, so the walk graph is unaffected by construction. */
  var amp = spec.noiseAmplitudeH || 0;
  var noiseScale = spec.noiseScale || 3;
  var sub = new Float64Array(n);
  var noiseRng = terrainSubRng(seed, "surface-noise");
  var noiseTable = new Float64Array(1024);
  for(i = 0; i < noiseTable.length; i++) noiseTable[i] = noiseRng() * 2 - 1;
  for(i = 0; i < n; i++){
    var cx = i % ex, cy = (i - (i % ex)) / ex;
    var s = noiseTable[(terrainHash32(Math.floor(cx / noiseScale) + "," + Math.floor(cy / noiseScale)
      + "," + cx + "," + cy) & 1023)];
    var guarded = clampPerCell[i] > TERRAIN_GRID_LAW.walkableStepQuanta;
    var budget = guarded ? amp : Math.min(amp, TERRAIN_WALK_NOISE_BUDGET_H.perCellH);
    sub[i] = s * budget + residue[i] * 0;
  }

  /* Water is a PLANE at a datum, not a heightfield edit (§2.1 R1-05). The shoreline is derived, so
     raising a datum floods outward for free, correctly, following the real ground.
     A field may carry MORE THAN ONE water body — a pond and a stream cut on the same tray do not
     share a water table, and perched water tables are ordinary geology. Each body is still a flat
     plane at a fixed datum; what is per-body is which cells it governs. */
  var waterDatumH = spec.waterDatumH == null ? null : spec.waterDatumH;
  var waterPlane = new Float64Array(n).fill(NaN);
  if(waterDatumH != null) waterPlane.fill(waterDatumH);
  (spec.pieces || []).forEach(function(piece){
    if(piece.waterDatumH == null) return;
    var b = piece.waterBounds;
    for(var wy = 0; wy < ey; wy++) for(var wx = 0; wx < ex; wx++){
      if(b && (wx < b.x || wy < b.y || wx >= b.x + b.w || wy >= b.y + b.d)) continue;
      waterPlane[wy * ex + wx] = piece.waterDatumH;
    }
  });
  var depthH = new Float64Array(n);
  for(i = 0; i < n; i++){
    depthH[i] = isNaN(waterPlane[i]) ? 0 : Math.max(0, waterPlane[i] - heights[i]);
  }

  /* Cells. `standable` = a figure can occupy the cell's top surface. Deep water is not standable;
     a void is not standable; a guarded slope is visible and never standable. */
  var cells = new Array(n);
  for(i = 0; i < n; i++){
    var x = i % ex, y = (i - (i % ex)) / ex;
    var inPlay = !!mask[i];
    var blocked = kind[i] === "void" || kind[i] === "guarded-slope" || kind[i] === "boulder"
      || surface[i] === "thicket" || surface[i] === "trunk-field";
    var wading = depthH[i] > 0 && depthH[i] <= 1;
    var swimming = depthH[i] > 1;
    cells[i] = {
      x: x, y: y, index: i,
      h: heights[i], sub: sub[i],
      preClampH: preClamp[i],
      inPlayfield: inPlay,
      kind: kind[i],
      surface: surface[i],
      owner: owner[i],
      guarded: clampPerCell[i] > TERRAIN_GRID_LAW.walkableStepQuanta && kind[i] === "guarded-slope",
      depthH: depthH[i],
      standable: inPlay && !blocked && !swimming,
      difficult: wading || surface[i] === "scree" || surface[i] === "reeds" || surface[i] === "mud"
    };
  }

  /* Faces. §2.0 rejection rule: a cell whose height differs from an orthogonal neighbour by 2h+
     MUST own a face piece. The owner is the piece that produced the HIGHER cell — the cliff owns
     its own face, exactly as a retaining run owns its outer skin in CL-R3. */
  var faces = [];
  var unownedFaces = 0;
  function pushFace(a, b){
    var d = heights[a] - heights[b];
    if(Math.abs(d) < TERRAIN_GRID_LAW.faceStepQuanta) return;
    var hi = d > 0 ? a : b, lo = d > 0 ? b : a;
    var ownerId = owner[hi];
    if(!ownerId) unownedFaces++;
    faces.push({
      id: "face-" + hi + "-" + lo,
      highIndex: hi, lowIndex: lo,
      deltaH: Math.abs(d),
      riseFeet: Math.abs(d) * TERRAIN_GRID_LAW.verticalQuantumFeet,
      owner: ownerId || null,
      storeys: Math.ceil(Math.abs(d) / TERRAIN_GRID_LAW.storeyQuanta),
      climbDc: Math.abs(d) >= 8 ? 17 : (Math.abs(d) >= 4 ? 15 : 12),
      climbable: kind[hi] !== "void" && kind[lo] !== "void"
    });
  }
  for(i = 0; i < n; i++){
    var fx = i % ex, fy = (i - (i % ex)) / ex;
    if(fx + 1 < ex) pushFace(i, i + 1);
    if(fy + 1 < ey) pushFace(i, i + ex);
  }

  /* Walk graph + support graph. A walk edge exists between two standable in-play cells whose tiers
     differ by <=1h. A climb edge exists across a face that is climbable. Reachability is measured
     TWICE — walk-only, and non-flying (walk union climb) — and the gate is the non-flying number. */
  function neighbours(i){
    var out = [], x = i % ex, y = (i - (i % ex)) / ex;
    if(x > 0) out.push(i - 1);
    if(x + 1 < ex) out.push(i + 1);
    if(y > 0) out.push(i - ex);
    if(y + 1 < ey) out.push(i + ex);
    return out;
  }
  var walkEdges = 0, illegalWalkEdges = 0, maxWalkStepH = 0;
  var walkAdj = new Array(n); for(i = 0; i < n; i++) walkAdj[i] = [];
  var climbAdj = new Array(n); for(i = 0; i < n; i++) climbAdj[i] = [];
  for(i = 0; i < n; i++){
    if(!cells[i].standable) continue;
    neighbours(i).forEach(function(j){
      if(j < i) return;
      if(!cells[j].standable) return;
      var step = Math.abs(heights[i] - heights[j]);
      if(step <= TERRAIN_GRID_LAW.walkableStepQuanta){
        walkAdj[i].push(j); walkAdj[j].push(i); walkEdges++;
        if(step > maxWalkStepH) maxWalkStepH = step;
        if(step > TERRAIN_GRID_LAW.walkableStepQuanta) illegalWalkEdges++;
      } else {
        climbAdj[i].push(j); climbAdj[j].push(i);
      }
    });
  }

  /* Entry cells: standable cells on the playfield boundary. 94.3% of area-type rows name an entry
     and every one of them must land on a walkable edge cell (§2.0 rejection rule 3). */
  var entryCells = [];
  function outsideBlocks(outIdx, inIdx){
    var k = kind[outIdx], sf = surface[outIdx];
    if(k === "void" || k === "guarded-slope" || k === "boulder") return true;
    if(sf === "thicket" || sf === "trunk-field" || sf === "water-edge") return true;
    return Math.abs(heights[outIdx] - heights[inIdx]) >= TERRAIN_GRID_LAW.faceStepQuanta;
  }
  for(i = 0; i < n; i++){
    if(!cells[i].standable) continue;
    var ex0 = i % ex, ey0 = (i - (i % ex)) / ex;
    var isEntry = false;
    if(ex0 === 0 || ey0 === 0 || ex0 === ex - 1 || ey0 === ey - 1) isEntry = true;
    var nb = neighbours(i);
    for(var q = 0; q < nb.length; q++){
      if(mask[nb[q]]) continue;
      if(!outsideBlocks(nb[q], i)) isEntry = true;
    }
    if(isEntry) entryCells.push(i);
  }

  function reach(adjA, adjB, roots){
    var seen = new Uint8Array(n), stack = roots.slice(), c;
    roots.forEach(function(r){ seen[r] = 1; });
    while(stack.length){
      c = stack.pop();
      var list = adjA[c].concat(adjB ? adjB[c] : []);
      for(var k = 0; k < list.length; k++) if(!seen[list[k]]){ seen[list[k]] = 1; stack.push(list[k]); }
    }
    return seen;
  }
  var roots = entryCells.length ? entryCells.slice() : (function(){
    for(var k = 0; k < n; k++) if(cells[k].standable) return [k];
    return [];
  })();
  var seenWalk = reach(walkAdj, null, roots);
  var seenAny = reach(walkAdj, climbAdj, roots);
  var standableCount = 0, unreachableWalk = 0, unreachableNonFlying = 0, unreachableList = [];
  for(i = 0; i < n; i++){
    if(!cells[i].standable) continue;
    standableCount++;
    if(!seenWalk[i]) unreachableWalk++;
    if(!seenAny[i]){ unreachableNonFlying++; if(unreachableList.length < 40) unreachableList.push(i); }
    cells[i].reachableWalk = !!seenWalk[i];
    cells[i].reachableNonFlying = !!seenAny[i];
  }

  var maxWalkSlopeDeg = terrainSlopeDegForStepH(maxWalkStepH);
  var walkableCellsOverLimit = 0;
  for(i = 0; i < n; i++){
    if(!cells[i].standable) continue;
    var localMax = 0;
    walkAdj[i].forEach(function(j){
      var s = Math.abs((heights[i] + sub[i]) - (heights[j] + sub[j]));
      if(s > localMax) localMax = s;
    });
    cells[i].localSlopeDeg = terrainSlopeDegForStepH(localMax);
    if(cells[i].localSlopeDeg > TERRAIN_GRID_LAW.maxWalkableSlopeDeg + 1e-9) walkableCellsOverLimit++;
  }

  var field = {
    chassis: "terrain-field-r1",
    chassisVersion: 1,
    id: spec.id || "terrain-field",
    segmentId: spec.segmentId || null,
    seed: seed,
    extent: { x: ex, y: ey },
    shape: spec.shape || "rect",
    baseDatumH: baseDatumH,
    slopeClamp: spec.slopeClamp === Infinity ? "Infinity" : fieldClamp,
    waterDatumH: waterDatumH,
    waterPlane: waterPlane,
    heights: heights,
    sub: sub,
    mask: mask,
    cells: cells,
    faces: faces,
    entryCells: entryCells,
    walkAdj: walkAdj,
    climbAdj: climbAdj,
    pieces: (spec.pieces || []).map(function(p){
      return { id: p.id, pieceId: p.pieceId, label: p.label, params: p.params || null,
        slopeClamp: p.slopeClamp === Infinity ? "Infinity" : (p.slopeClamp == null ? fieldClamp : p.slopeClamp) };
    }),
    degradedFrom: spec.degradedFrom || null,
    metrics: {
      cells: n,
      inPlayfieldCells: (function(){ var c = 0; for(var k = 0; k < n; k++) if(mask[k]) c++; return c; })(),
      standableCells: standableCount,
      walkEdges: walkEdges,
      faces: faces.length,
      unownedFaces: unownedFaces,
      illegalWalkEdges: illegalWalkEdges,
      maxWalkStepH: maxWalkStepH,
      maxWalkSlopeDeg: maxWalkSlopeDeg,
      walkableCellsOverSlopeLimit: walkableCellsOverLimit,
      unreachableStandableWalkOnly: unreachableWalk,
      unreachableStandableNonFlying: unreachableNonFlying,
      unreachableSample: unreachableList,
      entryCells: entryCells.length,
      minH: (function(){ var m = Infinity; for(var k = 0; k < n; k++) if(mask[k]) m = Math.min(m, heights[k]); return m === Infinity ? 0 : m; })(),
      maxH: (function(){ var m = -Infinity; for(var k = 0; k < n; k++) if(mask[k]) m = Math.max(m, heights[k]); return m === -Infinity ? 0 : m; })(),
      clampPasses: clampReport.passes,
      clampCellsLowered: clampReport.cellsLowered,
      clampConverged: clampReport.converged,
      noiseBudgetH: TERRAIN_WALK_NOISE_BUDGET_H.perCellH,
      noiseAmplitudeH: amp
    }
  };
  field.fingerprint = terrainFieldFingerprint(field);
  return field;
}

/* The determinism gate's own instrument: a fingerprint over the heightfield BYTES plus the derived
   surface, so "same segment id -> byte-identical heightfield" is a single comparable string rather
   than an eyeballed grid. Sub-quantum values are folded at fixed precision so float printing can
   never make two identical fields look different. */
function terrainFieldFingerprint(field){
  var parts = [];
  var h = field.heights, s = field.sub, m = field.mask;
  for(var i = 0; i < h.length; i++){
    /* Surface state is chassis output too — a thicket boundary and a fog boundary leave the
       heightfield identical, and a fingerprint that cannot tell them apart is not a receipt. */
    parts.push(h[i] + ":" + (m[i] ? 1 : 0) + ":" + s[i].toFixed(6)
      + ":" + (field.cells[i].surface || "-") + ":" + field.cells[i].kind
      + ":" + field.cells[i].depthH.toFixed(4));
  }
  parts.push("faces=" + field.faces.map(function(f){
    return f.highIndex + ">" + f.lowIndex + "@" + f.deltaH + "/" + (f.owner || "-");
  }).join(","));
  return terrainHash32(parts.join("|")).toString(16).padStart(8, "0")
    + "-" + terrainHash32(parts.reverse().join("|")).toString(16).padStart(8, "0");
}

/* Walk-down (§2.0 rejection rule 4, borrowed verbatim from room-elevation-profile's own proven
   law): a piece that would occupy more than 60% of the tray's cells walks down to its next-smaller
   variant and records `degradedFrom`. Returns the spec to build, never mutates the request. */
var TERRAIN_TRAY_OCCUPANCY_LIMIT = 0.6;

function terrainWalkDown(request){
  var ex = request.extentCells.x, ey = request.extentCells.y;
  var trayCells = ex * ey;
  var chain = [];
  var current = Object.assign({}, request);
  var guard = 0;
  while(guard++ < 12){
    var demandCells = terrainPieceFootprintCells(current);
    if(demandCells <= trayCells * TERRAIN_TRAY_OCCUPANCY_LIMIT) break;
    var smaller = terrainPieceShrink(current);
    if(!smaller) break;
    chain.push({
      variant: current.variantId || current.pieceId,
      footprintCells: demandCells,
      trayCells: trayCells,
      occupancy: Number((demandCells / trayCells).toFixed(4)),
      limit: TERRAIN_TRAY_OCCUPANCY_LIMIT,
      reason: "footprint exceeds " + (TERRAIN_TRAY_OCCUPANCY_LIMIT * 100) + "% of the tray"
    });
    current = smaller;
  }
  if(chain.length){
    current.degradedFrom = {
      law: "room-elevation-profile walk-down, TERRAIN-PROGRAM §2.0 rejection rule 4",
      steps: chain,
      finalVariant: current.variantId || current.pieceId,
      finalFootprintCells: terrainPieceFootprintCells(current)
    };
  }
  return current;
}

/* ─── overlays the proof captures need ────────────────────────────────────────────────────────
   These derive FROM the field. They never author a second truth. */
function terrainSupportGraphReport(field){
  var standable = [], guarded = [], unreachable = [];
  field.cells.forEach(function(c){
    if(c.standable) standable.push(c.index);
    if(c.kind === "guarded-slope" || c.guarded) guarded.push(c.index);
    if(c.standable && !c.reachableNonFlying) unreachable.push(c.index);
  });
  return {
    contract: "every-standable-surface-reachable-without-flight",
    standableCells: standable.length,
    guardedSlopeCells: guarded.length,
    faceCells: field.faces.length,
    unreachableStandable: unreachable.length,
    unreachableIndices: unreachable,
    walkEdges: field.metrics.walkEdges,
    entryCells: field.metrics.entryCells,
    subCellSurfaces: 0,
    note: "one cell = one 5-ft footprint; no sub-cell surface mints a footprint in rung 1"
  };
}

function terrainRouteSolve(field, fromIndex, toIndex){
  var prev = new Int32Array(field.cells.length).fill(-1);
  var seen = new Uint8Array(field.cells.length);
  var queue = [fromIndex]; seen[fromIndex] = 1;
  var head = 0;
  while(head < queue.length){
    var c = queue[head++];
    if(c === toIndex) break;
    var list = field.walkAdj[c];
    for(var k = 0; k < list.length; k++){
      var j = list[k];
      if(seen[j]) continue;
      seen[j] = 1; prev[j] = c; queue.push(j);
    }
  }
  if(!seen[toIndex]) return null;
  var path = [toIndex], cur = toIndex;
  while(cur !== fromIndex && prev[cur] >= 0){ cur = prev[cur]; path.push(cur); }
  path.reverse();
  return path;
}
