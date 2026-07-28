/* ─── CL-F07 terrain-bench — the rung-1 proof fixture (PROPOSED) ──────────────────────────────
   docs/TERRAIN-PROGRAM.md §4.1 / §4.3. CL-F07 is PROPOSED as an extension of the CL-F00…CL-F06
   family and must be adopted through docs/CLAYROOM-RESET-LADDER.md, not declared here. This file
   specifies what it builds; the ladder document remains the adopting authority.

   Seven scenes, exactly the seven CL-F07a captures. Each scene is DATA — a field spec the chassis
   builds — so the renderer never authors terrain and the harness can prove every geometric claim
   without a browser. Primary question: does generated ground carry tactical meaning at the fixed
   camera? Front-end verdict is Adam's; this file only produces the evidence.

   Engine layer. Call-time deps: terrainFieldBuild, terrainPieceOps, terrainOpsTranslate,
   terrainResolveBoundary, terrainWalkDown, terrainRouteSolve, terrainSupportGraphReport,
   terrainAnchorSet, terrainSpanNetwork. */

var CL_F07_TERRAIN_BENCH = Object.freeze({
  id: "cl-f07-terrain-bench",
  version: 1,
  label: "CL-F07 terrain bench",
  status: "PROPOSED — adoption belongs to docs/CLAYROOM-RESET-LADDER.md",
  question: "Does generated ground carry tactical meaning at the fixed camera?",
  ladderPosition: "after CL-R3 (construction grammar) and CL-R4 (material routing); before Guard Post 1",
  proof: "CL-F07a",
  witnessSlug: "spr-pc-human-fighter-female",
  witnessEnvelopes: Object.freeze([
    Object.freeze({ slug: "spr-fantasy-winged-kobold-urd", envelope: "Small" }),
    Object.freeze({ slug: "spr-pc-human-fighter-female", envelope: "Medium · the six-foot witness" }),
    Object.freeze({ slug: "spr-fantasy-treant", envelope: "Huge" })
  ]),
  cameras: Object.freeze(["production", "strategic-72"]),
  scenes: Object.freeze([
    Object.freeze({ id: "thirteen-piece-sheet", capture: 1, label: "The thirteen-piece sheet",
      lightRecipeId: "daylit",
      claim: "every rung-1 piece exists, on one field, at both cameras, with the witness on each" }),
    Object.freeze({ id: "one-clamp-proof", capture: 2, label: "The one-clamp proof",
      lightRecipeId: "daylit",
      claim: "a hill and a cliff from the SAME parameter set with only slopeClamp changed" }),
    Object.freeze({ id: "boundary-sheet", capture: 3, label: "The boundary sheet",
      lightRecipeId: "daylit",
      claim: "all six wilderness-area-type boundary strings as the perimeter of one 60x80 kidney" }),
    Object.freeze({ id: "route-proof", capture: 4, label: "The route proof",
      lightRecipeId: "daylit",
      claim: "a real area-type row's named entry resolves to a walkable edge cell; two terrain-caused plans" }),
    Object.freeze({ id: "walk-down-16", capture: 5, label: "The walk-down proof",
      lightRecipeId: "daylit",
      claim: "the 16-cell tray asked for a chasm it cannot hold walks down and records degradedFrom" }),
    Object.freeze({ id: "support-graph", capture: 6, label: "The support-graph proof",
      lightRecipeId: "daylit",
      claim: "the CL-R3 traversability grid projected; zero standable surfaces unreachable without flight" }),
    Object.freeze({ id: "dark", capture: 7, label: "Dark", lightRecipeId: "dark",
      neutralizeHostRig: true,
      claim: "terrain in darkness — the edge must stay findable by something diegetic" })
  ]),
  /* The census median arrival: 60'x80' = 12x16 cells = 192. The sheet needs the 80'x80' maximum
     (16x16 = 256) because thirteen pieces need thirteen bays. Both are real rolled tray sizes. */
  medianTray: Object.freeze({ x: 12, y: 16, feet: "60x80", cells: 192 }),
  maxTray: Object.freeze({ x: 16, y: 16, feet: "80x80", cells: 256 }),
  minTray: Object.freeze({ x: 4, y: 4, feet: "20x20", cells: 16 }),
  /* DECLARED DEVIATION (2026-07-27). §4.1 names the census median (12x16 = 96 cells at 10-ft
     granularity / 192 five-foot cells) as the fixture's field. Thirteen pieces cannot be legible on
     it — five usable cells per bay is already the minimum at which a 3h hill can reach its crest
     without the clamp shaving it, and 13 bays of that size is 24x24. So capture 1 (the sheet) uses
     a 24x24 BENCH field and says so, while captures 3, 4 and 6 — the ones whose claim is about an
     arrival — use the median 12x16 kidney exactly. The arrival-sized proof is kept where it is
     load-bearing rather than pretended everywhere. */
  sheetBayCells: 6,
  sheetField: Object.freeze({ x: 24, y: 24, cells: 576,
    note: "bench sheet, not an arrival — see sheetBayCells rationale" }),
  /* The real rows this bench is built against — never invented parameters. */
  sourceRows: Object.freeze({
    boundarySheet: "wilderness-area-type 259-264 (60' x 80' Kidney Shape × all six boundaries)",
    routeProof: "wilderness-area-type 260 — 60' x 80' Kidney Shape · Steep 10-foot earthen/snow banks · \"20' wide paths at both ends; a 20'x20' raised platform at the center.\"",
    walkDown: "wilderness-area-type 001 footprint (20' x 20' = 16 cells) asked for wilderness-feature 144's chasm-with-landbridge",
    tacticalTerrain: "wilderness-tactical-terrain d50, all 50 rows",
    footing: "wilderness-footing d200 Coverage Area column"
  })
});

/* THE LIGHT CASE EVERY SCENE DECLARES. `daylit` is the standard clay production-capture
   illumination — the recipe CL-F01/CL-F04/CL-F05 open on (theater-clay-room's own
   initialLightRecipeId) and the one the known-good construction-bench captures were banked under.
   Scene 7 declares `dark`, the §4.2 hostile case: darkness may be dark, but the edge must still be
   findable.

   ABSENCE IS A BUILD ERROR, NOT A FALLBACK. Round 1 scoped rig-neutralisation to "scenes that
   declare a light case" while leaving the production scenes declaring nothing — so they kept the
   neutralisation and got no substitute, and every one of them rendered as an unlit silhouette.
   A scene with no declared light case must now fail loudly at build time instead of quietly
   rendering black. */
function terrainBenchSceneLightRecipe(sceneId){
  var scene = CL_F07_TERRAIN_BENCH.scenes.filter(function(s){ return s.id === sceneId; })[0];
  if(!scene) throw new Error("terrainBenchSceneLightRecipe: unknown scene " + sceneId);
  if(!scene.lightRecipeId){
    throw new Error("terrainBenchSceneLightRecipe: scene " + sceneId + " declares no light case");
  }
  return scene.lightRecipeId;
}

/* Only a scene whose whole point is the absence of light may take the host rig down. Every other
   scene keeps it — that rig is what lights the clay. */
function terrainBenchSceneNeutralizesRig(sceneId){
  var scene = CL_F07_TERRAIN_BENCH.scenes.filter(function(s){ return s.id === sceneId; })[0];
  return !!(scene && scene.neutralizeHostRig);
}

/* Thirteen bays over the 16x16 maximum tray. Each piece is built in its own 4x4 local bay and
   translated — the same piece, moved, which is what a chassis makes possible. */
function terrainBenchSheetSpec(seed){
  var bay = CL_F07_TERRAIN_BENCH.sheetBayCells;
  var ex = bay * 4, ey = bay * 4;
  var pieces = [];
  var order = TERRAIN_R1_PIECE_IDS.slice();
  order.forEach(function(pieceId, index){
    var bx = (index % 4) * bay, by = Math.floor(index / 4) * bay;
    var built = terrainPieceOps(pieceId, terrainBenchSheetParams(pieceId),
      { ex: bay - 1, ey: bay - 1, rng: terrainSubRng(seed, "sheet:" + pieceId) });
    /* Every op is BOUNDED to its own bay. Without this a piece that legitimately reaches past its
       own footprint (a mountainside apron, a cliff's half-plane) paints the whole sheet, and the
       "does it exist" frame proves nothing. */
    var moved = terrainOpsTranslate(built.ops, bx, by).map(function(op){
      return Object.assign({}, op, { params: Object.assign({}, op.params,
        { bounds: { x: bx, y: by, w: bay - 1, d: bay - 1 } }) });
    });
    pieces.push({
      id: pieceId, pieceId: pieceId,
      label: TERRAIN_R1_PRESETS[pieceId].name,
      construction: TERRAIN_R1_PRESETS[pieceId].construction,
      bay: { x: bx, y: by, w: bay, d: bay },
      params: built.params,
      ops: moved,
      /* Each water body is its own plane at its own datum, governing its own bay. A pond and a
         stream cut on one tray do not share a water table. */
      waterDatumH: built.waterDatumH,
      waterBounds: built.waterDatumH == null ? null : { x: bx, y: by, w: bay - 1, d: bay - 1 },
      witnessCell: { x: bx + bay - 2, y: by + bay - 2 }
    });
  });
  /* THE BAYS ARE THIRTEEN SEPARATE SITES displayed side by side, not one continuous piece of
     ground. Without saying so, the 1-cell gutter at the base datum clamps every bay's crest down
     to its distance from that gutter — a 3h terrace one cell from 0h is illegal and the chassis
     correctly refuses it. Marking the gutter clamp-exempt states the truth (this is a bench, each
     bay is its own site edge) instead of shaving thirteen pieces to make one field legal. Recorded
     in the receipt as gutterClampExempt so the frame is never read as a continuous arrival. */
  var gutterCells = [];
  for(var gy = 0; gy < ey; gy++) for(var gx = 0; gx < ex; gx++){
    if((gx % bay) === bay - 1 || (gy % bay) === bay - 1) gutterCells.push({ x: gx, y: gy });
  }
  pieces.push({ id: "bench-gutter", pieceId: null, label: "bench gutter — site edges",
    gutter: true, params: null,
    ops: [{ type: "patch", mode: "set", params: { cells: gutterCells, setClamp: Infinity } }] });

  return {
    id: "cl-f07a-thirteen-piece-sheet",
    gutterClampExempt: true,
    segmentId: "cl-f07a:sheet",
    seed: seed,
    extentCells: { x: ex, y: ey },
    shape: "rect",
    baseDatumH: 0,
    slopeClamp: 1,
    noiseAmplitudeH: 0.06,
    noiseScale: 2,
    pieces: pieces
  };
}

/* Bay-scale parameter sets. Each is a resize of the preset's own default, which is the point: the
   sheet proves thirteen PARAMETER SETS, not thirteen assets. */
function terrainBenchSheetParams(pieceId){
  /* Five usable cells per bay (bay 6 minus a 1-cell gutter). Sizes are chosen so each piece can
     actually REACH its stated height inside the bay: with the walkable clamp, a crest H needs H
     cells of run to the surrounding datum, so a 3h hill at radius 2 centred 2 cells from the
     gutter is the honest maximum here. Where a piece is guarded (cliff, bank, boulder, apron) the
     clamp does not apply and the full height stands. */
  var byPiece = {
    "R1-01": { riseH: 6, runLengthCells: 5, plateauSide: 1,
      edgePolyline: [{ x: 0, y: 1.5 }, { x: 4, y: 1.5 }],
      ledgeSet: [{ atH: 3, widthCells: 1, runCells: 4, offsetCells: 1 }], talusApron: 1 },
    "R1-02": { crestHeightH: 3, footprintRadiusCells: 3, asymmetry: 0.25, crownFlatCells: 1,
      flankProfile: "convex", cx: 2, cy: 2 },
    "R1-03": { widthCells: 1, lengthCells: 4, wallHeightH: 3, pathSinuosity: 1, dogLegCells: 2,
      cx: 1, cy: 0 },
    "R1-04": { widthCells: 2, lengthCells: 5, depthH: 8, rimCondition: "crumbling",
      pathPolyline: [{ x: 0, y: 2 }, { x: 4, y: 2 }],
      spanSet: [{ kind: "stone-arch", atCell: { x: 3, y: 2 }, widthCells: 1, integrity: "sound" }] },
    "R1-05": { basinRadiusCells: 2.4, maxDepthH: 3, waterDatumH: -1, shoreProfile: "gentle-wade",
      clarity: "opaque", cx: 2, cy: 2 },
    "R1-06": { patchCount: 6, patchSizeCells: 1, reflectivity: 0.8, substrate: "clay", spread: "scattered" },
    "R1-07": { edgesOccupied: ["n"], benchWidthCells: 2, riseRate: 3, talusApronCells: 1,
      gullySet: [{ atCell: 2, climbDc: 15 }] },
    "R1-08": { heightH: 1, crestWidthCells: 1, pairedDitch: true, ditchDepthH: 1, ditchWidthCells: 1,
      pathPolyline: [{ x: 0, y: 2 }, { x: 4, y: 2 }] },
    "R1-09": { stepCount: 3, riseHPerStep: 1, treadDepthCells: 1, widthCells: 5, axis: "y",
      originCell: { x: 0, y: 0 } },
    "R1-10": { fanRadiusCells: 3, riseH: 2, grainSize: "gravel", stability: "settled",
      apexCell: { x: 2, y: 0 } },
    "R1-11": { count: 5, arrangement: "paired-gate", gapWidthCells: 1, spacingCells: 1.5,
      heightRangeH: [1, 3], cx: 2, cy: 1 },
    "R1-12": { heightH: 4, faceAngle: 55, plateauSide: 1,
      edgePolyline: [{ x: 0, y: 1.5 }, { x: 4, y: 1.5 }],
      slumpSet: [{ atCell: 3, widthCells: 1 }], vegetationLip: 0.6 },
    "R1-13": { spanCount: 2, junctionCount: 1, diameterFt: 2, lengthCells: 3,
      heightAboveDatumH: 2, barkCondition: "sound", undercutDepthH: 2,
      undercutWidthCells: 1, cx: 2, cy: 2 }
  };
  return byPiece[pieceId] || {};
}

/* CAPTURE 2 — THE ONE-CLAMP PROOF. One base parameter object, used twice, with slopeClamp the ONLY
   difference. If these two ever need different parameters, the §2.0 chassis claim is false and the
   correct response is to STOP and report it, not to tune one side until the picture looks right. */
var TERRAIN_ONE_CLAMP_BASE = Object.freeze({
  pieceId: "R1-02",
  params: Object.freeze({
    crestHeightH: 6, footprintRadiusCells: 4, asymmetry: 0.3, crownFlatCells: 2,
    flankProfile: "convex", spurCount: 0, cx: 4, cy: 4
  })
});

function terrainBenchOneClampSpecs(seed){
  function spec(variant, clamp){
    var built = terrainPieceOps(TERRAIN_ONE_CLAMP_BASE.pieceId,
      Object.assign({}, TERRAIN_ONE_CLAMP_BASE.params, { slopeClamp: clamp }),
      { ex: 9, ey: 9, rng: terrainSubRng(seed, "one-clamp") });
    return {
      id: "cl-f07a-one-clamp-" + variant,
      segmentId: "cl-f07a:one-clamp:" + variant,
      seed: seed,
      extentCells: { x: 9, y: 9 },
      shape: "rect",
      baseDatumH: 0,
      slopeClamp: clamp,
      noiseAmplitudeH: 0.06,
      noiseScale: 2,
      variant: variant,
      pieces: [{ id: "one-clamp-" + variant, pieceId: TERRAIN_ONE_CLAMP_BASE.pieceId,
        label: variant, slopeClamp: clamp, params: built.params, ops: built.ops }]
    };
  }
  return { hill: spec("hill", 1), cliff: spec("cliff", Infinity) };
}

/* The measurement that makes the claim falsifiable rather than decorative. */
function terrainOneClampProof(seed){
  var specs = terrainBenchOneClampSpecs(seed);
  var hill = terrainFieldBuild(specs.hill);
  var cliff = terrainFieldBuild(specs.cliff);
  var hillParams = JSON.stringify(specs.hill.pieces[0].params, function(k, v){
    return k === "slopeClamp" ? undefined : v; });
  var cliffParams = JSON.stringify(specs.cliff.pieces[0].params, function(k, v){
    return k === "slopeClamp" ? undefined : v; });
  var lowered = 0, i;
  for(i = 0; i < hill.heights.length; i++) if(hill.heights[i] < cliff.heights[i]) lowered++;
  return {
    sameGenerator: hill.chassis === cliff.chassis && hill.chassis === "terrain-field-r1",
    sameParametersExceptClamp: hillParams === cliffParams,
    parameterDiff: hillParams === cliffParams ? ["slopeClamp"] : ["PARAMETER DRIFT — proof invalid"],
    hill: { maxWalkStepH: hill.metrics.maxWalkStepH, maxWalkSlopeDeg: hill.metrics.maxWalkSlopeDeg,
      faces: hill.metrics.faces, maxH: hill.metrics.maxH, fingerprint: hill.fingerprint },
    cliff: { maxWalkStepH: cliff.metrics.maxWalkStepH, maxWalkSlopeDeg: cliff.metrics.maxWalkSlopeDeg,
      faces: cliff.metrics.faces, maxH: cliff.metrics.maxH, fingerprint: cliff.fingerprint },
    cellsLoweredByClamp: lowered,
    hillHasNoFaces: hill.metrics.faces === 0,
    cliffHasFaces: cliff.metrics.faces > 0,
    verdict: (hill.chassis === cliff.chassis && hillParams === cliffParams
      && hill.metrics.maxWalkStepH <= 1 && cliff.metrics.faces > 0 && lowered > 0)
      ? "ONE CHASSIS — hill and cliff differ only by slopeClamp"
      : "CHASSIS CLAIM FAILED — stop and report"
  };
}

/* CAPTURE 3 — THE BOUNDARY SHEET. Six frames, ONE layout: the same 60'x80' kidney playfield with
   each of the six boundary strings built as its perimeter. Highest-value capture in the program:
   it discharges the 33.3%-unbuilt finding directly. */
function terrainBenchBoundarySpec(boundaryString, seed, opts){
  var resolved = terrainResolveBoundary(boundaryString);
  if(!resolved) throw new Error("terrainBenchBoundarySpec: unresolved boundary " + boundaryString);
  var ex = CL_F07_TERRAIN_BENCH.medianTray.x, ey = CL_F07_TERRAIN_BENCH.medianTray.y;
  var mask = terrainShapeMask("kidney", ex, ey);
  /* The boundary is the perimeter of the PLAYFIELD, not of the rectangle: it is built on every
     cell outside the kidney that touches it. That is what "enclosed by" means on a shaped tray. */
  var ring = [];
  for(var y = 0; y < ey; y++) for(var x = 0; x < ex; x++){
    var i = y * ex + x;
    if(mask[i]) continue;
    var touches = false;
    [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(function(nb){
      if(nb[0] < 0 || nb[1] < 0 || nb[0] >= ex || nb[1] >= ey) return;
      if(mask[nb[1] * ex + nb[0]]) touches = true;
    });
    if(touches) ring.push({ x: x, y: y });
  }
  /* Every one of rows 259-264 carries "20' wide paths at both ends" verbatim, so the two 4-cell
     openings are part of the ROLLED ROW, not a convenience: a perimeter with no way in would fail
     the named-entry rejection rule on every one of the six frames. */
  var gapCells = (opts && opts.pathGaps === false) ? [] : (function(){
    /* 20 ft = exactly 4 cells, and the path enters at the playfield's own end rows — not at the
       bounding box's, which on a kidney would gut the narrow cap instead of opening a door. */
    var out = [];
    function endRowGap(rowY){
      var cols = [];
      for(var xx = 0; xx < ex; xx++) if(mask[rowY * ex + xx]) cols.push(xx);
      if(!cols.length) return;
      var mid = (cols[0] + cols[cols.length - 1]) / 2;
      var lo = Math.round(mid - 2), hi = lo + 3;
      ring.forEach(function(c){
        if(c.x >= lo && c.x <= hi && Math.abs(c.y - rowY) <= 1) out.push(c);
      });
    }
    var minY = -1, maxY = -1;
    for(var yy = 0; yy < ey; yy++) for(var xx2 = 0; xx2 < ex; xx2++){
      if(!mask[yy * ex + xx2]) continue;
      if(minY < 0) minY = yy;
      maxY = yy;
    }
    if(minY >= 0){ endRowGap(minY); endRowGap(maxY); }
    return out;
  })();
  function inGap(c){
    for(var g = 0; g < gapCells.length; g++) if(gapCells[g].x === c.x && gapCells[g].y === c.y) return true;
    return false;
  }
  ring = ring.filter(function(c){ return !inGap(c); });

  var ops;
  if(resolved.volume){
    ops = [{ type: "patch", mode: "set",
      surfaceKind: resolved.volume === "vegetation" ? "thicket"
        : (resolved.volume === "trunks" ? "trunk-field" : "fog"),
      params: { cells: ring } }];
  } else if(resolved.kind === "water-mud"){
    ops = [{ type: "patch", mode: "set", surfaceKind: "water-edge", params: { cells: ring, surfaceKind: "water-edge" } }];
  } else {
    ops = ring.map(function(cell){
      return { type: "radial", mode: "max", params: { cx: cell.x, cy: cell.y, radius: 0.7,
        peakH: resolved.heightH, profile: "convex", crownFlatCells: 1, baseH: 0,
        slopeClamp: Infinity, kind: "ground" } };
    });
  }
  return {
    id: "cl-f07a-boundary-" + resolved.kind,
    segmentId: "cl-f07a:boundary:" + resolved.kind,
    seed: seed,
    extentCells: { x: ex, y: ey },
    shape: "kidney",
    baseDatumH: 0,
    slopeClamp: 1,
    waterDatumH: resolved.kind === "water-mud" ? -1 : null,
    noiseAmplitudeH: 0.06,
    noiseScale: 2,
    boundary: resolved,
    pathGaps: gapCells,
    pieces: [{ id: "boundary-" + resolved.kind, pieceId: resolved.pieceId,
      label: resolved.string, slopeClamp: Infinity, params: resolved.params, ops: ops }]
  };
}

/* CAPTURE 4 — THE ROUTE PROOF. A real area-type row, its named entry landing on a walkable edge
   cell, and two meaningfully different TERRAIN-CAUSED plans. */
var TERRAIN_ROUTE_PROOF_ROW = Object.freeze({
  d300: 260,
  shape: "60' x 80' Kidney Shape",
  boundary: "Steep 10-foot earthen/snow banks.",
  features: "20' wide paths at both ends; a 20'x20' raised platform at the center."
});

function terrainBenchRouteSpec(seed){
  var base = terrainBenchBoundarySpec(TERRAIN_ROUTE_PROOF_ROW.boundary, seed);
  var ex = base.extentCells.x, ey = base.extentCells.y;
  /* "a 20'x20' raised platform at the center" — 4x4 cells. Built as a terrace bench so the
     platform is climbable by construction and reads as graded ground, not a dropped box. */
  var platform = terrainPieceOps("R1-09",
    { stepCount: 2, riseHPerStep: 1, treadDepthCells: 2, widthCells: 4,
      axis: "y", originCell: { x: 0, y: 0 } },
    { ex: 4, ey: 4, rng: terrainSubRng(seed, "route:platform") });
  /* One covered approach the other plan uses: a berm along the western flank. */
  var berm = terrainPieceOps("R1-08",
    { heightH: 1, crestWidthCells: 1, pairedDitch: true, ditchDepthH: 1, ditchWidthCells: 1,
      pathPolyline: [{ x: 1, y: 3 }, { x: 1, y: 12 }] },
    { ex: ex, ey: ey, rng: terrainSubRng(seed, "route:berm") });
  var spec = Object.assign({}, base, {
    id: "cl-f07a-route-proof",
    segmentId: "cl-f07a:route",
    sourceRow: TERRAIN_ROUTE_PROOF_ROW,
    pieces: base.pieces.concat([
      { id: "centre-platform", pieceId: "R1-09", label: "20'x20' raised platform at the center",
        slopeClamp: 1, params: platform.params,
        ops: terrainOpsTranslate(platform.ops, Math.round(ex / 2) - 2, Math.round(ey / 2) - 2) },
      { id: "west-berm", pieceId: "R1-08", label: "covered approach along the western flank",
        slopeClamp: 1, params: berm.params, ops: berm.ops }
    ])
  });
  return spec;
}

function terrainBenchRouteProof(seed){
  var field = terrainFieldBuild(terrainBenchRouteSpec(seed));
  var ex = field.extent.x, ey = field.extent.y;
  function nearest(targetX, targetY, list){
    var best = null, bestD = Infinity;
    list.forEach(function(i){
      var x = i % ex, y = (i - (i % ex)) / ex;
      var d = (x - targetX) * (x - targetX) + (y - targetY) * (y - targetY);
      if(d < bestD){ bestD = d; best = i; }
    });
    return best;
  }
  /* "20' wide paths at both ends" — the named entries. Both must land on a walkable edge cell. */
  var northEntry = nearest(ex / 2, 0, field.entryCells);
  var southEntry = nearest(ex / 2, ey - 1, field.entryCells);
  /* The objective is the platform crown. */
  var objective = null, bestH = -Infinity;
  field.cells.forEach(function(c){
    if(!c.standable) return;
    var cxd = Math.abs(c.x - (ex - 1) / 2), cyd = Math.abs(c.y - (ey - 1) / 2);
    if(cxd > 2.5 || cyd > 2.5) return;
    if(c.h > bestH){ bestH = c.h; objective = c.index; }
  });
  var approach = northEntry != null && objective != null ? terrainRouteSolve(field, northEntry, objective) : null;
  var retreat = objective != null && southEntry != null ? terrainRouteSolve(field, objective, southEntry) : null;
  var deployment = field.entryCells.filter(function(i){
    var y = (i - (i % ex)) / ex; return y <= 2;
  }).slice(0, 8);
  return {
    sourceRow: TERRAIN_ROUTE_PROOF_ROW,
    field: field,
    namedEntries: [
      { name: "north 20' path", cell: northEntry, walkableEdgeCell: northEntry != null },
      { name: "south 20' path", cell: southEntry, walkableEdgeCell: southEntry != null }
    ],
    approach: approach, deployment: deployment, objective: objective, retreat: retreat,
    /* Item 6: two meaningfully different viable plans, and for terrain they must be TERRAIN-CAUSED. */
    plans: [
      { id: "plan-a-high-flank",
        name: "Take the platform's low step from the north and fight downhill",
        terrainCause: "the terrace's north face is 1h, so it is walkable — you can reach the crown without a check",
        tradeoff: "you cross the open centre in the open; every bank-top position sees you the whole way" },
      { id: "plan-b-covered-gully",
        name: "Run the western berm's ditch, then take the platform's east step",
        terrainCause: "the paired ditch gives half cover standing and total cover prone for the whole flank",
        tradeoff: "5 extra feet each way to cross the berm, and you arrive on the far side one at a time" }
    ]
  };
}

/* CAPTURE 5 — THE WALK-DOWN. The 16-cell tray asked for a chasm that needs 6 cells on the crossing
   axis. It must walk down and record degradedFrom, never produce an illegal board. */
function terrainBenchWalkDownProof(seed){
  var tray = CL_F07_TERRAIN_BENCH.minTray;
  var request = {
    pieceId: "R1-04",
    params: { widthCells: 3, lengthCells: 6, depthH: 12, rimCondition: "crumbling",
      pathPolyline: [{ x: 0, y: 1.5 }, { x: 5, y: 1.5 }] },
    extentCells: { x: tray.x, y: tray.y },
    variantId: "R1-04-chasm-6-cell-crossing"
  };
  var resolved = terrainWalkDown(request);
  var built = terrainPieceOps(resolved.pieceId, resolved.params,
    { ex: tray.x, ey: tray.y, rng: terrainSubRng(seed, "walkdown") });
  var spec = {
    id: "cl-f07a-walk-down-16",
    segmentId: "cl-f07a:walk-down",
    seed: seed,
    extentCells: { x: tray.x, y: tray.y },
    shape: "rect",
    baseDatumH: 0,
    slopeClamp: 1,
    noiseAmplitudeH: 0.04,
    noiseScale: 2,
    degradedFrom: resolved.degradedFrom || null,
    pieces: [{ id: "walk-down-chasm", pieceId: resolved.pieceId, label: "chasm, walked down",
      slopeClamp: 1, params: built.params, ops: built.ops }]
  };
  var field = terrainFieldBuild(spec);
  return {
    request: request,
    resolved: resolved,
    degradedFrom: resolved.degradedFrom || null,
    requestedFootprintCells: terrainPieceFootprintCells(request),
    finalFootprintCells: terrainPieceFootprintCells(resolved),
    trayCells: tray.x * tray.y,
    occupancyLimit: TERRAIN_TRAY_OCCUPANCY_LIMIT,
    legalBoard: field.metrics.walkableCellsOverSlopeLimit === 0
      && field.metrics.unreachableStandableNonFlying === 0,
    field: field
  };
}

/* One entry point the renderer and the harness share, so the frame and the receipt can never
   disagree about what was built. */
function terrainBenchSceneBuild(sceneId, seed, opts){
  var s = seed == null ? terrainSeedFrom("cl-f07a") : (seed >>> 0);
  if(sceneId === "thirteen-piece-sheet" || sceneId === "dark"){
    var spec = terrainBenchSheetSpec(s);
    if(sceneId === "dark") spec = Object.assign({}, spec, { id: "cl-f07a-dark", segmentId: "cl-f07a:dark" });
    var field = terrainFieldBuild(spec);
    return { sceneId: sceneId, spec: spec, fields: [field], primary: field,
      lightRecipeId: sceneId === "dark" ? "dark" : null };
  }
  if(sceneId === "one-clamp-proof"){
    var specs = terrainBenchOneClampSpecs(s);
    var hill = terrainFieldBuild(specs.hill), cliff = terrainFieldBuild(specs.cliff);
    return { sceneId: sceneId, spec: specs, fields: [hill, cliff], primary: hill,
      proof: terrainOneClampProof(s) };
  }
  if(sceneId === "boundary-sheet"){
    /* §4.3 capture 3 is "Six frames, ONE layout" — six separate frames of the same 60x80 kidney,
       not six fields crammed into one. Laying them side by side made an 82-cell strip that no
       governed camera can frame, and the 72-degree read came back empty. `frameIndex` selects
       which boundary this frame carries; the layout is identical across all six. */
    var kinds = TERRAIN_BOUNDARY_KINDS;
    var idx = (opts && opts.frameIndex != null) ? opts.frameIndex : null;
    var fields = (idx == null ? kinds : [kinds[idx % kinds.length]]).map(function(b){
      return terrainFieldBuild(terrainBenchBoundarySpec(b.string, s));
    });
    return { sceneId: sceneId, spec: null, fields: fields, primary: fields[0],
      frameIndex: idx, frameCount: kinds.length,
      boundary: idx == null ? null : kinds[idx % kinds.length] };
  }
  if(sceneId === "route-proof"){
    var route = terrainBenchRouteProof(s);
    return { sceneId: sceneId, spec: terrainBenchRouteSpec(s), fields: [route.field],
      primary: route.field, route: route };
  }
  if(sceneId === "walk-down-16"){
    var wd = terrainBenchWalkDownProof(s);
    return { sceneId: sceneId, spec: null, fields: [wd.field], primary: wd.field, walkDown: wd };
  }
  if(sceneId === "support-graph"){
    var rspec = terrainBenchRouteSpec(s);
    var rfield = terrainFieldBuild(rspec);
    return { sceneId: sceneId, spec: rspec, fields: [rfield], primary: rfield,
      support: terrainSupportGraphReport(rfield) };
  }
  throw new Error("terrainBenchSceneBuild: unknown scene " + sceneId);
}

/* ─── THE EXECUTABLE GATE (§4.3, verbatim) ────────────────────────────────────────────────────
   Seven back-end gates, mine to prove per the Teeth Law. This function IS the gate: the harness
   and the capture receipt both call it, so there is one number, not two. */
function terrainBenchGateReport(seed){
  var s = seed == null ? terrainSeedFrom("cl-f07a") : (seed >>> 0);
  var scenes = ["thirteen-piece-sheet", "one-clamp-proof", "boundary-sheet", "route-proof",
    "walk-down-16", "support-graph", "dark"];
  var allFields = [];
  scenes.forEach(function(id){
    terrainBenchSceneBuild(id, s).fields.forEach(function(f){ allFields.push(f); });
  });

  var walkableOverLimit = 0, unownedFaces = 0, unreachable = 0, illegalWalkEdges = 0;
  var maxSlopeDeg = 0;
  allFields.forEach(function(f){
    walkableOverLimit += f.metrics.walkableCellsOverSlopeLimit;
    unownedFaces += f.metrics.unownedFaces;
    unreachable += f.metrics.unreachableStandableNonFlying;
    illegalWalkEdges += f.metrics.illegalWalkEdges;
    if(f.metrics.maxWalkSlopeDeg > maxSlopeDeg) maxSlopeDeg = f.metrics.maxWalkSlopeDeg;
  });

  var boundaryStrings = TERRAIN_BOUNDARY_KINDS.map(function(b){ return b.string; })
    .concat(["Thick, choking fog / spore clouds (heavily obscured)."]);
  var boundaryResolved = boundaryStrings.filter(function(str){ return !!terrainResolveBoundary(str); });

  var d50Terrain = [], d50NonTerrain = [], d50Unresolved = [];
  for(var d = 1; d <= 50; d++){
    var row = terrainResolveTacticalRow(d);
    if(!row) d50Unresolved.push(d);
    else if(row.nonTerrain) d50NonTerrain.push({ d50: d, reason: row.reason });
    else d50Terrain.push({ d50: d, pieceId: row.pieceId });
  }

  var coverageStrings = TERRAIN_COVERAGE_CANONICAL_FORMS.concat([
    "One 10x10 patch", "One 5x5 patch", "One 20x20 patch", "Two 5x5 patches", "10x20 patch"
  ]);
  var coveragePlaced = [], coverageFailed = [];
  coverageStrings.forEach(function(str){
    var placed = terrainResolveCoverage(str, 12, 16, terrainSubRng(s, "coverage:" + str));
    if(placed && placed.cells.length > 0) coveragePlaced.push({ coverage: str, cells: placed.cellCount });
    else coverageFailed.push(str);
  });

  var oneClamp = terrainOneClampProof(s);
  var walkDown = terrainBenchWalkDownProof(s);

  return {
    fixture: CL_F07_TERRAIN_BENCH.id,
    fixtureVersion: CL_F07_TERRAIN_BENCH.version,
    proof: CL_F07_TERRAIN_BENCH.proof,
    seed: s,
    fieldsMeasured: allFields.length,
    gates: {
      walkableCellsAbove30Deg: walkableOverLimit,
      maxWalkableSlopeDeg: Number(maxSlopeDeg.toFixed(4)),
      illegalWalkEdges: illegalWalkEdges,
      unownedFacesAt2hPlus: unownedFaces,
      unreachableStandableSurfaces: unreachable,
      boundaryStringsResolved: boundaryResolved.length,
      boundaryStringsTotal: boundaryStrings.length,
      boundaryKinds: TERRAIN_BOUNDARY_KINDS.length,
      d50Terrain: d50Terrain.length,
      d50NonTerrainDeclared: d50NonTerrain.length,
      d50Unresolved: d50Unresolved.length,
      d50Total: d50Terrain.length + d50NonTerrain.length,
      coveragePlaced: coveragePlaced.length,
      coverageTotal: coverageStrings.length,
      coverageCanonicalForms: TERRAIN_COVERAGE_CANONICAL_FORMS.length,
      coverageFailed: coverageFailed
    },
    oneClamp: oneClamp,
    walkDown: { degraded: !!walkDown.degradedFrom, legalBoard: walkDown.legalBoard,
      requestedFootprintCells: walkDown.requestedFootprintCells,
      finalFootprintCells: walkDown.finalFootprintCells, trayCells: walkDown.trayCells },
    d50NonTerrain: d50NonTerrain,
    fingerprints: allFields.map(function(f){ return { id: f.id, fingerprint: f.fingerprint }; })
  };
}
