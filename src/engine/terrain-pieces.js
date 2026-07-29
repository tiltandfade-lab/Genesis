/* ─── R1-01 … R1-13 · THE THIRTEEN PIECES AS PARAMETER SETS ───────────────────────────────────
   docs/TERRAIN-PROGRAM.md §2.1 + §3.5. These are PRESETS OVER THE CHASSIS, not thirteen
   generators: every `build` below returns nothing but named chassis ops with named morph
   parameters. If a piece ever needs its own geometry code, the §2.0 chassis claim is false and
   the honest move is to say so, not to add a branch here.

   Each preset carries `construction` — the one-sentence real-world construction restatement the
   3D ruling requires before any geometry is written. It is data, not a comment, so the receipt can
   print it beside the frame and Adam can check the claim against the picture.

   Engine layer. Call-time deps: terrainOpApply's op vocabulary (src/engine/terrain-field.js). */

var TERRAIN_R1_PRESETS = Object.freeze({

  "R1-01": Object.freeze({
    pieceId: "R1-01", name: "cliff", adamNamed: true,
    construction: "Two pieces of ground at different datums meeting at an edge where the material is competent enough to stand vertically, with a talus of its own debris at the foot.",
    tacticalRole: "Total cover at the foot, three-quarters from the top down, an absolute sightline break, and a back to the tray.",
    morphParams: Object.freeze(["riseH", "edgePolyline", "runLengthCells", "faceBatter", "topOverhang",
      "ledgeSet", "notchSet", "talusApron", "jointSpacing", "beddingThickness"]),
    defaults: Object.freeze({ riseH: 8, runLengthCells: 8, faceBatter: 0, topOverhang: 0,
      ledgeSet: Object.freeze([]), notchSet: Object.freeze([]), talusApron: 1 }),
    build: function(p, ctx){
      var line = p.edgePolyline || [{ x: 0, y: ctx.ey * 0.35 }, { x: ctx.ex - 1, y: ctx.ey * 0.35 }];
      /* HALF-PLANE, not a ridge: the top and the foot are two grounds at different datums meeting
         at an edge. A symmetric band here would build a mesa, which is a different landform. */
      var ops = [{
        type: "ridge", mode: "max",
        params: { polyline: line, halfPlane: true, plateauSide: p.plateauSide == null ? 1 : p.plateauSide,
          heightH: p.riseH, baseH: p.baseH || 0, slopeClamp: Infinity, kind: "ground" }
      }];
      /* A ledge is a bench cut into the face on the LOW side, one or two cells out from the edge —
         where water got into a joint and took a chunk out. */
      (p.ledgeSet || []).forEach(function(ledge){
        ops.push({ type: "ridge", mode: "max", params: {
          polyline: terrainOffsetPolyline(line, (ledge.offsetCells == null ? 1 : ledge.offsetCells)
            * (p.plateauSide == null ? 1 : p.plateauSide)),
          halfWidthCells: (ledge.widthCells || 1) / 2, heightH: ledge.atH,
          crestWidthCells: ledge.widthCells || 1, baseH: p.baseH || 0,
          slopeClamp: Infinity, kind: "ground" } });
      });
      /* The talus is the face's own debris, so it sits at the foot on the low side and is walkable
         difficult terrain — never a second cliff. */
      if(p.talusApron) ops.push({ type: "radial", mode: "max", params: {
        cx: (line[0].x + line[line.length - 1].x) / 2,
        cy: line[0].y + (1 + p.talusApron) * (p.plateauSide == null ? 1 : p.plateauSide),
        radius: 1 + p.talusApron, peakH: 1, profile: "concave", baseH: p.baseH || 0,
        slopeClamp: 1, kind: "ground" } });
      return ops;
    },
    footprintCells: function(p, ctx){ return (p.runLengthCells || 8) * 3; },
    shrink: function(p){ return p.runLengthCells > 3 ? Object.assign({}, p, { runLengthCells: p.runLengthCells - 2 }) : null; }
  }),

  "R1-02": Object.freeze({
    pieceId: "R1-02", name: "hill", adamNamed: true,
    construction: "A pile of material at or below its angle of repose, crown eroded flat, one flank long and shallow and the other short and steep, the foot blending into the ground rather than meeting it at a line.",
    tacticalRole: "The elevation GRADIENT — high ground you spend movement to earn instead of a binary you are on or off.",
    morphParams: Object.freeze(["crestHeightH", "footprintRadiusCells", "asymmetry", "crownFlatCells",
      "flankProfile", "flankNoiseH", "spurCount", "saddleTo"]),
    defaults: Object.freeze({ crestHeightH: 4, footprintRadiusCells: 4, asymmetry: 0.25,
      crownFlatCells: 2, flankProfile: "convex", spurCount: 0 }),
    build: function(p, ctx){
      var ops = [{
        type: "radial", mode: "max",
        params: { cx: p.cx == null ? (ctx.ex - 1) / 2 : p.cx, cy: p.cy == null ? (ctx.ey - 1) / 2 : p.cy,
          radius: p.footprintRadiusCells, peakH: p.crestHeightH, profile: p.flankProfile,
          asymmetry: p.asymmetry, crownFlatCells: p.crownFlatCells, baseH: p.baseH || 0,
          slopeClamp: p.slopeClamp == null ? 1 : p.slopeClamp, kind: "ground" }
      }];
      for(var s = 0; s < (p.spurCount || 0); s++){
        var ang = (s / Math.max(1, p.spurCount)) * Math.PI * 2;
        ops.push({ type: "ridge", mode: "max", params: {
          polyline: [{ x: (p.cx == null ? (ctx.ex - 1) / 2 : p.cx), y: (p.cy == null ? (ctx.ey - 1) / 2 : p.cy) },
            { x: (p.cx == null ? (ctx.ex - 1) / 2 : p.cx) + Math.cos(ang) * p.footprintRadiusCells,
              y: (p.cy == null ? (ctx.ey - 1) / 2 : p.cy) + Math.sin(ang) * p.footprintRadiusCells }],
          halfWidthCells: 1, heightH: Math.max(1, p.crestHeightH - 2), crestWidthCells: 2,
          baseH: p.baseH || 0, slopeClamp: p.slopeClamp == null ? 1 : p.slopeClamp, kind: "ground" } });
      }
      return ops;
    },
    footprintCells: function(p){ return Math.round(Math.PI * p.footprintRadiusCells * p.footprintRadiusCells); },
    shrink: function(p){ return p.footprintRadiusCells > 2 ? Object.assign({}, p, { footprintRadiusCells: p.footprintRadiusCells - 1 }) : null; }
  }),

  "R1-03": Object.freeze({
    pieceId: "R1-03", name: "crevice", adamNamed: true,
    construction: "A joint in bedrock widened by frost and water into a slot with two near-parallel walls and a debris-choked floor, often narrowing or closing overhead where the walls lean together.",
    tacticalRole: "The only rung-1 piece that gives cover from ABOVE and a ceiling: a bottleneck with a roof, and the roof bridges are a route over the people inside it.",
    morphParams: Object.freeze(["widthCells", "lengthCells", "wallHeightH", "pathSinuosity",
      "floorProfile", "roofBridgeCells", "wallConvergence", "openings"]),
    defaults: Object.freeze({ widthCells: 1, lengthCells: 3, wallHeightH: 4, pathSinuosity: 1,
      floorProfile: "debris-choked", roofBridgeCells: Object.freeze([]), wallConvergence: 0 }),
    build: function(p, ctx){
      var x0 = p.cx == null ? (ctx.ex - 1) / 2 : p.cx, y0 = p.cy == null ? 1 : p.cy;
      var line = [{ x: x0, y: y0 }];
      /* pathSinuosity 0 is a shooting gallery; >=1 dog-leg is what converts it from difficult
         terrain into a sightline break (d50 row 16 Blind Corner is this parameter at value 1). */
      var legs = 1 + (p.pathSinuosity || 0);
      var runPerLeg = Math.max(1, Math.round(p.lengthCells / legs));
      var cx0 = x0, cy0 = y0;
      for(var i = 0; i < legs; i++){
        cy0 += runPerLeg;
        line.push({ x: cx0, y: cy0 });
        if(i + 1 < legs){
          cx0 += (p.dogLegCells == null ? 2 : p.dogLegCells) * (i % 2 === 0 ? 1 : -1);
          line.push({ x: cx0, y: cy0 });
        }
      }
      return [
        { type: "ridge", mode: "max", params: { polyline: line,
          halfWidthCells: (p.widthCells / 2) + 1.2, heightH: p.wallHeightH, crestWidthCells: 2,
          baseH: p.baseH || 0, slopeClamp: Infinity, kind: "ground" } },
        { type: "slot", mode: "set", params: { polyline: line, widthCells: p.widthCells,
          depthH: 0, floorProfile: p.floorProfile, baseH: p.baseH || 0,
          slopeClamp: Infinity, kind: "ground" } }
      ];
    },
    footprintCells: function(p){ return Math.round((p.widthCells + 2.4) * p.lengthCells); },
    shrink: function(p){ return p.lengthCells > 2 ? Object.assign({}, p, { lengthCells: p.lengthCells - 1 }) : null; }
  }),

  "R1-04": Object.freeze({
    pieceId: "R1-04", name: "chasm", adamNamed: true,
    construction: "The ground stops and resumes: both rims are cliff faces pointed at each other, the floor is far below or lost in dark, and where the cave roof did not fully collapse a natural land bridge survives.",
    tacticalRole: "The route-forcing piece. It does not slow you down, it says no. Every plan is about the crossings.",
    morphParams: Object.freeze(["widthCells", "lengthCells", "pathPolyline", "depthH", "bottomless",
      "rimCondition", "spanSet", "rimLedges"]),
    defaults: Object.freeze({ widthCells: 2, lengthCells: 8, depthH: 12, bottomless: false,
      rimCondition: "crumbling", spanSet: Object.freeze([]), rimLedges: Object.freeze([]) }),
    build: function(p, ctx){
      var line = p.pathPolyline || [{ x: 0, y: (ctx.ey - 1) / 2 }, { x: ctx.ex - 1, y: (ctx.ey - 1) / 2 }];
      var ops = [{ type: "slot", mode: "set", params: { polyline: line, widthCells: p.widthCells,
        depthH: p.bottomless ? 40 : p.depthH, baseH: p.baseH || 0, slopeClamp: Infinity,
        void: true, kind: "void" } }];
      (p.spanSet || []).forEach(function(span){
        ops.push({ type: "ridge", mode: "max", params: {
          polyline: [{ x: span.atCell.x, y: span.atCell.y - p.widthCells / 2 - 0.5 },
            { x: span.atCell.x, y: span.atCell.y + p.widthCells / 2 + 0.5 }],
          halfWidthCells: (span.widthCells || 1) / 2, heightH: 0, crestWidthCells: span.widthCells || 1,
          baseH: p.baseH || 0, slopeClamp: 1, kind: "ground" } });
      });
      return ops;
    },
    footprintCells: function(p){ return (p.widthCells + 2) * p.lengthCells; },
    shrink: function(p){ return p.lengthCells > 3 ? Object.assign({}, p, { lengthCells: p.lengthCells - 2 })
      : (p.widthCells > 2 ? Object.assign({}, p, { widthCells: p.widthCells - 1 }) : null); }
  }),

  "R1-05": Object.freeze({
    pieceId: "R1-05", name: "pond", adamNamed: true,
    construction: "A depression that intersects the water table, so the water surface is a horizontal plane at a fixed datum and the shoreline is not drawn but is simply wherever the terrain crosses that plane.",
    tacticalRole: "Not a wall — a movement-cost gradient. Ranged attackers unaffected, melee punished, heavy armour punished more.",
    morphParams: Object.freeze(["basinRadiusCells", "maxDepthH", "waterDatumH", "shoreProfile",
      "clarity", "marginVegetationCells", "outflowCell"]),
    defaults: Object.freeze({ basinRadiusCells: 3, maxDepthH: 3, waterDatumH: -1,
      shoreProfile: "gentle-wade", clarity: "opaque", marginVegetationCells: 1 }),
    build: function(p, ctx){
      return [{ type: "basin", mode: "min", params: {
        cx: p.cx == null ? (ctx.ex - 1) / 2 : p.cx, cy: p.cy == null ? (ctx.ey - 1) / 2 : p.cy,
        radius: p.basinRadiusCells, maxDepthH: p.maxDepthH, shoreProfile: p.shoreProfile,
        baseH: p.baseH || 0, slopeClamp: 1, kind: "ground" } }];
    },
    waterDatumH: function(p){ return p.waterDatumH; },
    footprintCells: function(p){ return Math.round(Math.PI * p.basinRadiusCells * p.basinRadiusCells); },
    shrink: function(p){ return p.basinRadiusCells > 1 ? Object.assign({}, p, { basinRadiusCells: p.basinRadiusCells - 1 }) : null; }
  }),

  "R1-06": Object.freeze({
    pieceId: "R1-06", name: "puddle", adamNamed: true,
    construction: "Rainwater lying in cell-scale depressions on ground it cannot soak into, an inch or two deep, drying from the edges inward so an old one is a dark ring around a shrinking bright centre.",
    tacticalRole: "An INFORMATION system, not a hazard (design call, §2.1 R1-06): it reflects, records tracks, announces a fast crossing, and only conducts as the exception.",
    morphParams: Object.freeze(["patchSet", "depthInches", "spread", "reflectivity", "disturbance", "substrate"]),
    defaults: Object.freeze({ depthInches: 2, spread: "scattered", reflectivity: 0.7,
      disturbance: "still", substrate: "clay", patchCount: 3, patchSizeCells: 2 }),
    build: function(p, ctx){
      var cells = [];
      var rng = ctx.rng;
      for(var k = 0; k < (p.patchCount || 3); k++){
        var px = 1 + Math.floor(rng() * Math.max(1, ctx.ex - 2));
        var py = 1 + Math.floor(rng() * Math.max(1, ctx.ey - 2));
        for(var dx = 0; dx < (p.patchSizeCells || 2); dx++)
          for(var dy = 0; dy < (p.patchSizeCells || 2); dy++) cells.push({ x: px + dx, y: py + dy });
      }
      return [{ type: "patch", mode: "set", surfaceKind: "puddle",
        params: { cells: cells, surfaceKind: "puddle" } }];
    },
    footprintCells: function(p){ return (p.patchCount || 3) * (p.patchSizeCells || 2) * (p.patchSizeCells || 2); },
    shrink: function(p){ return p.patchCount > 1 ? Object.assign({}, p, { patchCount: p.patchCount - 1 }) : null; }
  }),

  "R1-07": Object.freeze({
    pieceId: "R1-07", name: "mountainside", adamNamed: true,
    construction: "Not a mountain but a SIDE: a bench of workable ground cut by a stream or a road crew, the slope rising out of sight above it, a talus apron of everything that fell off it below, and gullies incising the face at intervals as the only ways up.",
    tacticalRole: "It REMOVES a direction. One or two tray edges stop being escape routes and start being walls.",
    morphParams: Object.freeze(["edgesOccupied", "benchWidthCells", "riseRate", "talusApronCells",
      "gullySet", "snowlineH", "treelineH", "hazeGradient"]),
    defaults: Object.freeze({ edgesOccupied: Object.freeze(["n"]), benchWidthCells: 3, riseRate: 3,
      talusApronCells: 2, gullySet: Object.freeze([{ atCell: 4, climbDc: 15 }]) }),
    build: function(p, ctx){
      var ops = [{ type: "apron", mode: "max", params: {
        edgesOccupied: p.edgesOccupied, benchWidthCells: p.benchWidthCells,
        riseRateH: p.riseRate, depthCells: 4, baseH: p.baseH || 0, slopeClamp: Infinity } }];
      /* At least one gully must exist unless the scene explicitly wants a dead end — the
         non-flying-route rule made into geometry rather than a promise. */
      (p.gullySet || []).forEach(function(g){
        ops.push({ type: "slot", mode: "min", params: {
          polyline: [{ x: g.atCell, y: 0 }, { x: g.atCell, y: p.benchWidthCells + 4 }],
          widthCells: 1, depthH: 0, baseH: p.baseH || 0, slopeClamp: 1, kind: "ground" } });
      });
      if(p.talusApronCells) ops.push({ type: "patch", mode: "set", surfaceKind: "scree", params: {
        cells: (function(){
          var out = [];
          for(var x = 0; x < ctx.ex; x++)
            for(var y = p.benchWidthCells - p.talusApronCells; y < p.benchWidthCells; y++)
              if(y >= 0) out.push({ x: x, y: y });
          return out;
        })(), surfaceKind: "scree" } });
      return ops;
    },
    footprintCells: function(p, ctx){ return (p.benchWidthCells + 4) * ((ctx && ctx.ex) || 8) * (p.edgesOccupied || ["n"]).length; },
    shrink: function(p){ return (p.edgesOccupied || []).length > 1
      ? Object.assign({}, p, { edgesOccupied: p.edgesOccupied.slice(0, p.edgesOccupied.length - 1) })
      : (p.benchWidthCells > 1 ? Object.assign({}, p, { benchWidthCells: p.benchWidthCells - 1 }) : null); }
  }),

  "R1-08": Object.freeze({
    pieceId: "R1-08", name: "berm-trench", adamNamed: false,
    construction: "One operation: you dig a ditch and the spoil goes beside it, so the bank IS the hole's material — which is why d50 row 1 and row 5 are the same piece with a sign flip.",
    tacticalRole: "The cheapest cover in the kit; half cover standing, total cover prone; the gaps in it are the routes.",
    morphParams: Object.freeze(["pathPolyline", "heightH", "crestWidthCells", "pairedDitch",
      "ditchDepthH", "ditchWidthCells", "gapSet", "revetment", "erosion"]),
    defaults: Object.freeze({ heightH: 1, crestWidthCells: 1, pairedDitch: true, ditchDepthH: 1,
      ditchWidthCells: 2, gapSet: Object.freeze([]), revetment: "sod", erosion: 0.2 }),
    build: function(p, ctx){
      var line = p.pathPolyline || [{ x: 1, y: (ctx.ey - 1) / 2 }, { x: ctx.ex - 2, y: (ctx.ey - 1) / 2 }];
      return [{ type: "ridge", mode: "max", params: {
        polyline: line, halfWidthCells: Math.max(0.5, (p.crestWidthCells || 1) / 2),
        heightH: p.heightH, crestWidthCells: p.crestWidthCells,
        pairedDitch: p.pairedDitch, ditchDepthH: p.ditchDepthH, ditchWidthCells: p.ditchWidthCells,
        ditchSide: -1, baseH: p.baseH || 0,
        /* A bare berm is a 1h walkable lip. A berm WITH its ditch is a 2h step from ditch floor to
           crest — d50 row 5's own "5 extra feet of movement to climb out". Guarded, so the clamp
           does not flatten the earthwork into a stripe. */
        slopeClamp: p.pairedDitch ? Infinity : 1, kind: "ground" } }];
    },
    footprintCells: function(p, ctx){ return ((p.crestWidthCells || 1) + (p.pairedDitch ? p.ditchWidthCells : 0)) * ((ctx && ctx.ex) || 8); },
    shrink: function(p){ return p.pairedDitch ? Object.assign({}, p, { pairedDitch: false }) : null; }
  }),

  "R1-09": Object.freeze({
    pieceId: "R1-09", name: "terrace-bench", adamNamed: false,
    construction: "A slope converted into a staircase of flats, each held by a short retaining face 1h-2h tall because that is what you can build without engineering, and where a face fails it becomes a ramp of its own material.",
    tacticalRole: "The elevation ladder one advantage step at a time — every single step is a decision about whether gaining a tier is worth the movement.",
    morphParams: Object.freeze(["stepCount", "riseHPerStep", "treadDepthCells", "planCurve",
      "faceMaterial", "breachSet", "drainageChannels"]),
    defaults: Object.freeze({ stepCount: 3, riseHPerStep: 1, treadDepthCells: 2,
      planCurve: "straight", faceMaterial: "dry-stone", breachSet: Object.freeze([]) }),
    build: function(p, ctx){
      var ops = [{ type: "terrace", mode: "max", params: {
        stepCount: p.stepCount, riseHPerStep: p.riseHPerStep, treadDepthCells: p.treadDepthCells,
        axis: p.axis || "y", originCell: p.originCell || { x: 0, y: 0 },
        widthCells: p.widthCells || ctx.ex, baseH: p.baseH || 0,
        slopeClamp: p.riseHPerStep >= 2 ? Infinity : 1, kind: "ground" } }];
      (p.breachSet || []).forEach(function(br){
        ops.push({ type: "ridge", mode: "min", params: {
          polyline: [{ x: br.atCell, y: 0 }, { x: br.atCell, y: p.stepCount * p.treadDepthCells }],
          halfWidthCells: 0.5, heightH: 0, crestWidthCells: 1, baseH: p.baseH || 0,
          slopeClamp: 1, kind: "ground" } });
      });
      return ops;
    },
    footprintCells: function(p, ctx){ return p.stepCount * p.treadDepthCells * (p.widthCells || (ctx && ctx.ex) || 8); },
    shrink: function(p){ return p.stepCount > 2 ? Object.assign({}, p, { stepCount: p.stepCount - 1 }) : null; }
  }),

  "R1-10": Object.freeze({
    pieceId: "R1-10", name: "scree-fan", adamNamed: false,
    construction: "The pile of broken rock at the foot of a face, sorted fines near the apex and the big blocks that bounced furthest at the bottom, sitting at its 35-38 degree angle of repose so a live fan is not walkable at all.",
    tacticalRole: "The unstable-ground piece: terrain that punishes SPEED specifically. Dash here and the ground takes a vote.",
    morphParams: Object.freeze(["fanRadiusCells", "riseH", "apexCell", "grainSize", "stability", "sortingGradient"]),
    defaults: Object.freeze({ fanRadiusCells: 3, riseH: 2, grainSize: "gravel", stability: "settled",
      sortingGradient: 0.6 }),
    build: function(p, ctx){
      var apex = p.apexCell || { x: (ctx.ex - 1) / 2, y: 1 };
      var ops = [{ type: "radial", mode: "max", params: {
        cx: apex.x, cy: apex.y, radius: p.fanRadiusCells, peakH: p.riseH, profile: "concave",
        baseH: p.baseH || 0, slopeClamp: p.stability === "live" ? Infinity : 1, kind: "ground" } }];
      ops.push({ type: "patch", mode: "set", surfaceKind: "scree", params: {
        cells: (function(){
          var out = [];
          for(var x = Math.max(0, Math.round(apex.x - p.fanRadiusCells)); x <= Math.min(ctx.ex - 1, Math.round(apex.x + p.fanRadiusCells)); x++)
            for(var y = Math.max(0, Math.round(apex.y)); y <= Math.min(ctx.ey - 1, Math.round(apex.y + p.fanRadiusCells)); y++){
              var dx = x - apex.x, dy = y - apex.y;
              if(Math.sqrt(dx * dx + dy * dy) <= p.fanRadiusCells) out.push({ x: x, y: y });
            }
          return out;
        })(), surfaceKind: "scree" } });
      return ops;
    },
    /* grainSize CHANGES THE RAW: dust/gravel is row 15's Dash check, cobble is plain difficult
       terrain, a block field becomes row 23 Shattered Debris. */
    rawFor: function(p){
      return p.grainSize === "block-field" ? "d50-23-shattered-debris"
        : (p.grainSize === "cobble" ? "difficult-terrain" : "d50-15-dash-dc12-acrobatics");
    },
    footprintCells: function(p){ return Math.round(Math.PI * p.fanRadiusCells * p.fanRadiusCells / 2); },
    shrink: function(p){ return p.fanRadiusCells > 1 ? Object.assign({}, p, { fanRadiusCells: p.fanRadiusCells - 1 }) : null; }
  }),

  "R1-11": Object.freeze({
    pieceId: "R1-11", name: "boulder-cluster", adamNamed: false,
    construction: "Blocks that came off a face in events rather than continuously, embedded to a third of their height with soil banked on the uphill side, never evenly spaced — the gaps are as much of the formation as the rocks.",
    tacticalRole: "The cover vocabulary at three heights: below waist, chest, and above head, where the last is three-quarters cover AND a line-of-sight block.",
    morphParams: Object.freeze(["count", "arrangement", "spacingCells", "spacingJitter",
      "gapWidthCells", "heightRangeH", "embedDepth", "uphillSoilBank", "donorFamily"]),
    defaults: Object.freeze({ count: 5, arrangement: "scattered", spacingCells: 3, spacingJitter: 1,
      gapWidthCells: 1, heightRangeH: Object.freeze([1, 3]), embedDepth: 0.3,
      uphillSoilBank: true, donorFamily: null }),
    build: function(p, ctx){
      return [{ type: "scatter", mode: "max", params: {
        cx: p.cx == null ? (ctx.ex - 1) / 2 : p.cx, cy: p.cy == null ? (ctx.ey - 1) / 2 : p.cy,
        count: p.count, arrangement: p.arrangement, spacingCells: p.spacingCells,
        spacingJitter: p.spacingJitter, gapWidthCells: p.gapWidthCells,
        heightRangeH: p.heightRangeH, baseH: p.baseH || 0, slopeClamp: Infinity } }];
    },
    footprintCells: function(p){ return p.count * 2; },
    shrink: function(p){ return p.count > 2 ? Object.assign({}, p, { count: p.count - 1 }) : null; }
  }),

  "R1-12": Object.freeze({
    pieceId: "R1-12", name: "bank", adamNamed: false,
    construction: "A steep earthen or snow face about one storey tall, too steep to walk and too short and soft to be a cliff, with no bedding planes so it slumps rather than fracturing and grows a vegetation lip that hangs over.",
    tacticalRole: "The SURMOUNTABLE wall. It says 'not this way, quickly' rather than 'not this way', and finding its slump is a real exploration beat.",
    morphParams: Object.freeze(["heightH", "edgePolyline", "faceAngle", "slumpSet", "lipOverhang",
      "undercut", "vegetationLip"]),
    defaults: Object.freeze({ heightH: 4, faceAngle: 55, slumpSet: Object.freeze([]),
      lipOverhang: 0.3, undercut: false, vegetationLip: 0.5 }),
    build: function(p, ctx){
      var line = p.edgePolyline || [{ x: 0, y: 2 }, { x: ctx.ex - 1, y: 2 }];
      /* Same half-plane construction as the cliff — a bank is a step, not a ridge. What separates
         it from R1-01 is the MATERIAL: no bedding planes, so it slumps rather than fracturing, it
         is one storey rather than several, and it is climbable in a single check. */
      var side = p.plateauSide == null ? 1 : p.plateauSide;
      var ops = [{ type: "ridge", mode: "max", params: {
        polyline: line, halfPlane: true, plateauSide: side, heightH: p.heightH,
        baseH: p.baseH || 0, slopeClamp: Infinity, kind: "ground" } }];
      /* Every bank has at least one place where it has slumped into a scramble. A slump is a
         walkable ramp of the bank's own material, so it is written with the walkable clamp and it
         cuts DOWN into the face (mode min) rather than piling on top of it. */
      (p.slumpSet || []).forEach(function(sl){
        /* One place where the face has collapsed into a scramble: a strip crossing the face,
           cut down to half the bank's height. That halves the climb (a 2h step instead of the
           full 4h face) without pretending a 5-cell bay can hold a 4-cell walkable ramp. */
        ops.push({ type: "ridge", mode: "min", params: {
          polyline: [{ x: sl.atCell, y: line[0].y - 2 }, { x: sl.atCell, y: line[0].y + 2 }],
          halfWidthCells: Math.max(0.5, (sl.widthCells || 1) / 2),
          heightH: Math.max(1, Math.round(p.heightH / 2)), crestWidthCells: sl.widthCells || 1,
          baseH: p.baseH || 0, slopeClamp: Infinity, kind: "ground" } });
      });
      return ops;
    },
    footprintCells: function(p, ctx){ return 3 * ((ctx && ctx.ex) || 8); },
    shrink: function(p){ return p.heightH > 2 ? Object.assign({}, p, { heightH: p.heightH - 1 }) : null; }
  }),

  "R1-13": Object.freeze({
    pieceId: "R1-13", name: "root-branch-bridge", adamNamed: true,
    construction: "A beam with an anchor at each end: soil washes out from under a surface root and leaves it spanning the void, and a low branch does exactly the same thing in the air.",
    tacticalRole: "Route, elevation, and cover simultaneously — a span crosses what the ground cannot, its climb sits on the banded ladder, and the underside of an arch is total cover from above.",
    morphParams: Object.freeze(["anchorSet", "spanCount", "junctionCount", "lengthCells", "diameterFt",
      "sagRatio", "taper", "heightAboveDatumH", "barkCondition", "wornTread",
      "undercutDepthH", "buttressFlareCells"]),
    defaults: Object.freeze({ spanCount: 1, junctionCount: 0, diameterFt: 2, sagRatio: 0,
      taper: 0.25, heightAboveDatumH: 0, barkCondition: "sound", wornTread: true,
      undercutDepthH: 1, buttressFlareCells: 1 }),
    /* Chassis-level hooks only in this pass — see terrainSpanNetwork(). The BEAM is not written
       into the heightfield: a beam is not graded ground, and pretending it is would mint a false
       5-ft footprint in the support graph. What IS ground is the piece's ground relationship —
       `undercutDepthH`, the soil that washed out from under the root. That is what makes an arch a
       bridge instead of a bump, so the chassis owns it and the renderer owns the beam. */
    build: function(p, ctx){
      if(!p.undercutDepthH) return [];
      var cx = p.cx == null ? (ctx.ex - 1) / 2 : p.cx;
      var cy = p.cy == null ? (ctx.ey - 1) / 2 : p.cy;
      var len = p.lengthCells || 2;
      return [{ type: "slot", mode: "min", params: {
        polyline: [{ x: cx - len / 2, y: cy }, { x: cx + len / 2, y: cy }],
        widthCells: p.undercutWidthCells || 1, depthH: p.undercutDepthH,
        baseH: p.baseH || 0, slopeClamp: Infinity, kind: "ground" } }];
    },
    footprintCells: function(p){ return (p.spanCount || 1) * ((p.lengthCells || 2) + 1); },
    shrink: function(p){ return p.spanCount > 1 ? Object.assign({}, p, { spanCount: p.spanCount - 1 }) : null; }
  })
});

var TERRAIN_R1_PIECE_IDS = Object.freeze(Object.keys(TERRAIN_R1_PRESETS));

function terrainPieceDefaults(pieceId){
  var preset = TERRAIN_R1_PRESETS[pieceId];
  if(!preset) throw new Error("terrainPieceDefaults: unknown piece " + pieceId);
  return Object.assign({}, preset.defaults);
}

/* One entry point for "give me this piece at these parameters, as chassis ops". Every one of the
   thirteen goes through here; nothing downstream may special-case a piece id. */
function terrainPieceOps(pieceId, params, ctx){
  var preset = TERRAIN_R1_PRESETS[pieceId];
  if(!preset) throw new Error("terrainPieceOps: unknown piece " + pieceId);
  var p = Object.assign({}, preset.defaults, params || {});
  var rng = (ctx && ctx.rng) || terrainRng(terrainHash32(pieceId));
  var ops = preset.build(p, { ex: (ctx && ctx.ex) || 12, ey: (ctx && ctx.ey) || 16, rng: rng });
  return { pieceId: pieceId, params: p, ops: ops,
    waterDatumH: preset.waterDatumH ? preset.waterDatumH(p) : null };
}

function terrainPieceFootprintCells(request){
  var preset = TERRAIN_R1_PRESETS[request.pieceId];
  if(!preset) return 0;
  var p = Object.assign({}, preset.defaults, request.params || {});
  return preset.footprintCells(p, request.extentCells
    ? { ex: request.extentCells.x, ey: request.extentCells.y } : null);
}

function terrainPieceShrink(request){
  var preset = TERRAIN_R1_PRESETS[request.pieceId];
  if(!preset) return null;
  var p = Object.assign({}, preset.defaults, request.params || {});
  var smaller = preset.shrink(p);
  if(!smaller) return null;
  return Object.assign({}, request, { params: smaller,
    variantId: (request.pieceId) + "-" + JSON.stringify(smaller).length });
}

/* ─── the six boundary strings (§1.2A) ───────────────────────────────────────────────────────
   Exactly six boundary kinds; the live table carries SEVEN distinct strings because row 006 adds a
   parenthetical. All seven resolve; the receipt reports both counts rather than pretending the
   table is tidier than it is. */
var TERRAIN_BOUNDARY_KINDS = Object.freeze([
  Object.freeze({ kind: "sheer-cliff", string: "20-foot high sheer rock / ice cliffs.",
    pieceId: "R1-01", heightFeet: 20, heightH: 8, blocksMovement: true, blocksSight: true,
    params: Object.freeze({ riseH: 8, faceBatter: 0, talusApron: 1 }) }),
  Object.freeze({ kind: "earthen-bank", string: "Steep 10-foot earthen/snow banks.",
    pieceId: "R1-12", heightFeet: 10, heightH: 4, blocksMovement: true, blocksSight: true,
    params: Object.freeze({ heightH: 4, faceAngle: 55, vegetationLip: 0.6 }) }),
  Object.freeze({ kind: "water-mud", string: "Deep, rushing water / hazardous mud.",
    pieceId: "R1-05", heightFeet: 0, heightH: 0, blocksMovement: true, blocksSight: false,
    params: Object.freeze({ maxDepthH: 4, waterDatumH: 0, shoreProfile: "undercut-bank", clarity: "opaque" }) }),
  Object.freeze({ kind: "thorn-thicket", string: "Impassable thorny brush / razor-sharp coral.",
    pieceId: "R1-11", heightFeet: 8, heightH: 3, blocksMovement: true, blocksSight: true,
    volume: "vegetation", params: Object.freeze({ arrangement: "scattered", heightRangeH: Object.freeze([2, 3]) }) }),
  Object.freeze({ kind: "trunk-field", string: "Dense, impassable tree/stalagmite trunks.",
    pieceId: "R1-11", heightFeet: 25, heightH: 10, blocksMovement: true, blocksSight: true,
    volume: "trunks", params: Object.freeze({ arrangement: "scattered", heightRangeH: Object.freeze([6, 10]) }) }),
  Object.freeze({ kind: "fog-volume", string: "Thick, choking fog / spore clouds.",
    pieceId: "R1-06", heightFeet: 15, heightH: 6, blocksMovement: false, blocksSight: true,
    volume: "obscurement", params: Object.freeze({ spread: "sheet" }) })
]);

function terrainResolveBoundary(boundaryString){
  var raw = String(boundaryString || "").trim();
  for(var i = 0; i < TERRAIN_BOUNDARY_KINDS.length; i++){
    var b = TERRAIN_BOUNDARY_KINDS[i];
    if(raw === b.string) return b;
    /* Row 006's parenthetical variant — same boundary, extra prose. Normalize by stripping the
       parenthetical rather than adding a seventh kind that does not exist. */
    if(raw.replace(/\s*\([^)]*\)\s*\.?$/, ".") === b.string) return b;
  }
  return null;
}

/* ─── all 50 wilderness-tactical-terrain rows (§1.2B) ────────────────────────────────────────
   Every row resolves to a piece + parameter set, OR is declared non-terrain WITH A REASON. A row
   declared non-terrain is not a failure — it is an honest statement that the row authors an effect
   volume, a light state, or an acoustic property rather than ground. */
var TERRAIN_D50_RESOLUTION = Object.freeze({
  1:  { pieceId: "R1-08", params: { heightH: 1, crestWidthCells: 1, pairedDitch: false }, footprintCells: 4, note: "Earthen Berm / Low Ridge — 5' wide, 20' long" },
  2:  { pieceId: "R1-11", params: { count: 1, heightRangeH: [3, 3] }, footprintCells: 1, note: "Thick-Trunked Tree / Stout Monolith — 5'x5'" },
  3:  { pieceId: "R1-11", params: { count: 5, arrangement: "scattered", spacingCells: 1.5, heightRangeH: [1, 3] }, footprintCells: 9, note: "Copse / Rock Cluster — 15'x15'" },
  4:  { nonTerrain: true, reason: "tactical CEILING — an overhead volume, not ground; owned by the canopy/overhang volume system (§3.3), not by the heightfield" },
  5:  { pieceId: "R1-08", params: { heightH: 0, pairedDitch: true, ditchDepthH: 1, ditchWidthCells: 2 }, footprintCells: 12, note: "Natural Trench / Dry Creek — 10' wide, 30' long; the SIGN FLIP of row 1" },
  6:  { pieceId: "R1-13", params: { spanCount: 1, diameterFt: 3, heightAboveDatumH: 0, undercutDepthH: 0 }, footprintCells: 3, note: "Fallen Log / Toppled Pillar — a beam lying on the ground" },
  7:  { pieceId: "R1-11", params: { count: 4, heightRangeH: [1, 1] }, surface: "thicket", footprintCells: 4, note: "Heavy Brush / Thickets — 10'x10'" },
  8:  { nonTerrain: true, reason: "obscurement VOLUME (15' radius sphere) — blocks sight, occupies no ground; boundary kind fog-volume covers its perimeter form" },
  9:  { nonTerrain: true, reason: "hanging curtain from ABOVE — a vegetation drape, no ground state, does not impede movement by its own RAW" },
  10: { pieceId: "R1-05", params: { basinRadiusCells: 2, maxDepthH: 0, waterDatumH: null }, surface: "reeds", footprintCells: 16, note: "Tall Reeds / Deep Snow — 20'x20' yielding surface" },
  11: { pieceId: "R1-01", params: { riseH: 6, runLengthCells: 1, ledgeSet: [{ atH: 6, widthCells: 1, runCells: 1 }] }, footprintCells: 3, note: "Sniper's Perch — 5'x5' platform 15' up" },
  12: { pieceId: "R1-11", params: { count: 2, arrangement: "paired-gate", gapWidthCells: 1, heightRangeH: [3, 4] }, footprintCells: 4, note: "Choke Point — the gap is a SPACING parameter, not a mesh" },
  13: { pieceId: "R1-03", params: { widthCells: 1, lengthCells: 3, wallHeightH: 4, pathSinuosity: 0 }, footprintCells: 9, note: "Narrow Crevice / Fissure — 5' wide, 15' long, Medium squeezes" },
  14: { pieceId: "R1-09", params: { stepCount: 3, riseHPerStep: 1, treadDepthCells: 1, widthCells: 1 }, footprintCells: 3, note: "Terraced Steps — three 5' wide rows" },
  15: { pieceId: "R1-10", params: { fanRadiusCells: 3, riseH: 2, grainSize: "gravel", stability: "settled" }, footprintCells: 9, note: "Steep Scree / Icy Slope — 15'x15'" },
  16: { pieceId: "R1-03", params: { widthCells: 2, lengthCells: 4, wallHeightH: 4, pathSinuosity: 1 }, footprintCells: 12, note: "Blind Corner — pathSinuosity at value 1, exactly" },
  17: { pieceId: "R1-05", params: { basinRadiusCells: 1, maxDepthH: 2, waterDatumH: null }, footprintCells: 4, note: "Sinkhole / Crater — 10' diameter, 5' deep" },
  18: { pieceId: "R1-11", params: { count: 4, arrangement: "linear-fall", spacingCells: 2, heightRangeH: [0, 0] }, footprintCells: 4, note: "Stepping Stones — 1d4+2 5' spaces over a hazard" },
  19: { pieceId: "R1-10", params: { fanRadiusCells: 2, riseH: 0, grainSize: "block-field" }, surface: "razor-rock", footprintCells: 4, note: "Briar Patch / Razor Rock — 10'x10'" },
  20: { pieceId: "R1-05", params: { basinRadiusCells: 2, maxDepthH: 1, waterDatumH: 0, shoreProfile: "gentle-wade" }, surface: "mud", footprintCells: 9, note: "Sucking Mud / Deep Drifts — 15'x15'" },
  21: { nonTerrain: true, reason: "WIND corridor — an air-column effect over whatever ground is there; the corridor form is the crevice's own geometry when one is present" },
  22: { pieceId: "R1-03", params: { widthCells: 1, lengthCells: 3, wallHeightH: 2, roofBridgeCells: [1, 2, 3] }, footprintCells: 6, note: "Hollow Tunnel — a crevice with a full roof" },
  23: { pieceId: "R1-10", params: { fanRadiusCells: 3, riseH: 0, grainSize: "block-field", stability: "settled" }, footprintCells: 16, note: "Shattered Debris / Rubble — 20'x20'; grainSize block-field IS this row" },
  24: { pieceId: "R1-13", params: { spanCount: 1, diameterFt: 3, lengthCells: 4, heightAboveDatumH: 0, undercutDepthH: 4 }, footprintCells: 5, note: "Natural Bridge — 5' wide, 20' long span over a drop" },
  25: { pieceId: "R1-05", params: { basinRadiusCells: 2, maxDepthH: 4, waterDatumH: 0, clarity: "opaque" }, footprintCells: 9, note: "Deep Water / Thick Acid — 15'x15' pool" },
  26: { pieceId: "R1-06", params: { patchCount: 1, patchSizeCells: 2, reflectivity: 1, disturbance: "still" }, footprintCells: 4, note: "Glaring Surface — the reflective end of the puddle's own reflectivity dial" },
  27: { nonTerrain: true, reason: "biological haze VOLUME (10' radius sphere) — a reaction-denial effect in air, no ground state" },
  28: { pieceId: "R1-10", params: { fanRadiusCells: 2, riseH: 0, grainSize: "dust", stability: "live" }, surface: "unstable-crust", footprintCells: 4, note: "Unstable Crust — trapdoor terrain; stability 'live' carries the countable trigger" },
  29: { nonTerrain: true, reason: "MAGICAL dampening field — a light/magic property of a region, no geometry and no movement cost" },
  30: { pieceId: "R1-05", params: { basinRadiusCells: 2, maxDepthH: 2, waterDatumH: null }, footprintCells: 16, note: "Echoing Hollow — a dry bowl; the acoustics are the basin's own shape" },
  31: { nonTerrain: true, reason: "adhesive VOLUME with its own object stats (AC 10, 5 HP) — an interactable, not ground" },
  32: { pieceId: "R1-05", params: { basinRadiusCells: 1, maxDepthH: 1, waterDatumH: null }, footprintCells: 4, note: "Concealing Depression — a shallow dip; the Stealth advantage is the dip plus ground cover" },
  33: { nonTerrain: true, reason: "ACTIVE flora that grapples — a creature-adjacent hazard volume, not a ground state" },
  34: { nonTerrain: true, reason: "MAGNETIC ground property — changes movement cost for metal armour only; a material routing fact (M12), not geometry" },
  35: { nonTerrain: true, reason: "falling WATER CURTAIN — a vertical volume; its ledge/cliff host is R1-01, the curtain itself is VFX" },
  36: { pieceId: "R1-11", params: { count: 4, arrangement: "linear-fall", spacingCells: 1, heightRangeH: [2, 2] }, footprintCells: 4, note: "Rampart of Bone/Fossil — slotted cover; the slots are the spacing" },
  37: { pieceId: "R1-06", params: { patchCount: 1, patchSizeCells: 1, substrate: "rock", depthInches: 3 }, surface: "thermal", footprintCells: 1, note: "Boiling Puddle / Magma Seep — 5'x5'; the puddle's one hazard case" },
  38: { nonTerrain: true, reason: "electrically CHARGED flora — a damage trigger on movement, no ground geometry of its own" },
  39: { pieceId: "R1-01", params: { riseH: 6, runLengthCells: 4, ledgeSet: [{ atH: 3, widthCells: 1, runCells: 4 }] }, footprintCells: 4, note: "Slippery Ledge — 5' wide, 20' long: exactly one ledgeSet entry on a cliff" },
  40: { pieceId: "R1-10", params: { fanRadiusCells: 2, riseH: 0, grainSize: "cobble" }, surface: "caltrops", footprintCells: 4, note: "Scattered Caltrops — 10'x10' surface hazard" },
  41: { pieceId: "R1-10", params: { fanRadiusCells: 3, riseH: 4, grainSize: "cobble", stability: "settled" }, footprintCells: 6, note: "Rubble Ramp — a scree fan that reaches 10' without a climb check" },
  42: { pieceId: "R1-05", params: { basinRadiusCells: 2, maxDepthH: 4, waterDatumH: 0, shoreProfile: "stepped-shelf" }, footprintCells: 2, note: "Submerged Drop-off — shoreProfile stepped-shelf IS the hidden hazard" },
  43: { pieceId: "R1-10", params: { fanRadiusCells: 3, riseH: 2, grainSize: "dust", stability: "settled" }, footprintCells: 9, note: "Shifting Dunes / Loose Dust — 15'x15' granular incline" },
  44: { pieceId: "R1-11", params: { count: 2, arrangement: "scattered", spacingCells: 1, heightRangeH: [1, 2] }, footprintCells: 2, note: "Crystalline Outcropping — 5'x10'; destructible cover" },
  45: { nonTerrain: true, reason: "persistent DIM LIGHT over an area — a lighting-recipe fact (CL-R1), not ground" },
  46: { pieceId: "R1-11", params: { count: 1, arrangement: "scattered", heightRangeH: [4, 4] }, footprintCells: 4, note: "Floating Earth Mote — 10'x10' at 10' up; the engine owns the platform, the float is VFX" },
  47: { nonTerrain: true, reason: "forced-movement VORTEX — a per-turn pull effect, no surface and no walkability change" },
  48: { pieceId: "R1-10", params: { fanRadiusCells: 3, riseH: 0, grainSize: "gravel", stability: "live" }, surface: "pumice", footprintCells: 9, note: "Porous Pumice / Hollow Crust — 15'x15'; live stability, damage-triggered" },
  49: { pieceId: "R1-12", params: { heightH: 4, faceAngle: 75, slumpSet: [] }, footprintCells: 4, note: "Overgrown Ruin Wall — 10' tall, 20' long; a bank at its steepest legal angle" },
  50: { pieceId: "R1-09", params: { stepCount: 2, riseHPerStep: 2, treadDepthCells: 2, planCurve: "concentric" }, footprintCells: 16, note: "Perfect Ambush Ring — a concentric terrace around an exposed 20'x20' centre" }
});

function terrainResolveTacticalRow(d50){
  var row = TERRAIN_D50_RESOLUTION[d50];
  if(!row) return null;
  return Object.assign({ d50: d50 }, row);
}

/* ─── the footing coverage grammar (§1.2D) ───────────────────────────────────────────────────
   The spec names 13 canonical forms. The live Wilderness Footing table carries 18 DISTINCT
   strings (it says "One 10x10 patch" as well as "10x10 patch", and adds "10x20 patch" once). The
   resolver places all 18. Reporting only the 13 would be satisfying the gate rather than doing the
   job — see CLAUDE.md's "validators preserve the thing's job". */
var TERRAIN_COVERAGE_CANONICAL_FORMS = Object.freeze([
  "100% of Area", "50% of Area", "25% of Area", "5-foot wide path", "10-foot wide strip",
  "15-foot wide strip", "10x10 patch", "20x20 patch", "1d4 5x5 patches", "1d4 10x10 patches",
  "1d6 5x5 patches", "Two 10x10 patches", "Outer Perimeter"
]);

function terrainResolveCoverage(coverageString, ex, ey, rng){
  var raw = String(coverageString || "").trim();
  var roll = rng || terrainRng(terrainHash32(raw));
  var cells = [], x, y;
  function rect(x0, y0, w, d){
    var out = [];
    for(var yy = y0; yy < y0 + d; yy++) for(var xx = x0; xx < x0 + w; xx++){
      if(xx >= 0 && yy >= 0 && xx < ex && yy < ey) out.push({ x: xx, y: yy });
    }
    return out;
  }
  function patches(count, sizeCells){
    var out = [];
    for(var k = 0; k < count; k++){
      var px = Math.floor(roll() * Math.max(1, ex - sizeCells + 1));
      var py = Math.floor(roll() * Math.max(1, ey - sizeCells + 1));
      out = out.concat(rect(px, py, sizeCells, sizeCells));
    }
    return out;
  }
  var m;
  if(raw === "100% of Area"){ cells = rect(0, 0, ex, ey); }
  else if((m = raw.match(/^(\d+)% of Area$/))){
    var frac = Number(m[1]) / 100, want = Math.round(ex * ey * frac);
    var order = [];
    for(y = 0; y < ey; y++) for(x = 0; x < ex; x++) order.push({ x: x, y: y, k: roll() });
    order.sort(function(a, b){ return a.k - b.k || (a.y - b.y) || (a.x - b.x); });
    cells = order.slice(0, want).map(function(c){ return { x: c.x, y: c.y }; });
  }
  else if((m = raw.match(/^(\d+)-foot wide (path|strip)$/))){
    var widthCells = Math.max(1, Math.round(Number(m[1]) / 5));
    var vertical = roll() < 0.5;
    if(vertical){ var sx = Math.floor(roll() * Math.max(1, ex - widthCells + 1)); cells = rect(sx, 0, widthCells, ey); }
    else { var sy = Math.floor(roll() * Math.max(1, ey - widthCells + 1)); cells = rect(0, sy, ex, widthCells); }
  }
  else if((m = raw.match(/^(?:One\s+)?(\d+)x(\d+) patch$/))){
    var pw = Math.max(1, Math.round(Number(m[1]) / 5)), pd = Math.max(1, Math.round(Number(m[2]) / 5));
    cells = rect(Math.floor(roll() * Math.max(1, ex - pw + 1)), Math.floor(roll() * Math.max(1, ey - pd + 1)), pw, pd);
  }
  else if((m = raw.match(/^1d(\d+) (\d+)x(\d+) patches$/))){
    var n = 1 + Math.floor(roll() * Number(m[1]));
    cells = patches(n, Math.max(1, Math.round(Number(m[2]) / 5)));
  }
  else if((m = raw.match(/^Two (\d+)x(\d+) patches$/))){
    cells = patches(2, Math.max(1, Math.round(Number(m[1]) / 5)));
  }
  else if(raw === "Outer Perimeter"){
    for(y = 0; y < ey; y++) for(x = 0; x < ex; x++){
      if(x === 0 || y === 0 || x === ex - 1 || y === ey - 1) cells.push({ x: x, y: y });
    }
  }
  else return null;
  return { coverage: raw, cells: cells, cellCount: cells.length,
    canonicalForm: TERRAIN_COVERAGE_CANONICAL_FORMS.indexOf(raw) >= 0 };
}

/* ─── R1-13 chassis hooks (§3.5) ─────────────────────────────────────────────────────────────
   THIS PASS SHIPS THE HOOKS AND THE SPAN SOLVER, NOT THE FULL NETWORK. Anchors derive from the
   rung-1 field; a span is a beam between two anchors with its tread width DERIVED from diameter;
   collapse is a declared property with a countable trigger. What is deliberately NOT here: the
   junction pathfinder that routes 3+ spans into a multi-level highway, and the renderer's beam
   bodies. Declared, not hidden — docs/DESIGN.md carries the deferral. */
function terrainAnchorSet(field){
  var anchors = [];
  var ex = field.extent.x, ey = field.extent.y;
  field.faces.forEach(function(f){
    var hx = f.highIndex % ex, hy = (f.highIndex - (f.highIndex % ex)) / ex;
    var lx = f.lowIndex % ex, ly = (f.lowIndex - (f.lowIndex % ex)) / ex;
    anchors.push({ kind: "face-top", at: { x: hx, y: hy }, atH: field.heights[f.highIndex], faceId: f.id, owner: f.owner });
    anchors.push({ kind: "face-foot", at: { x: lx, y: ly }, atH: field.heights[f.lowIndex], faceId: f.id, owner: f.owner });
  });
  field.cells.forEach(function(c){
    if(c.kind === "boulder") anchors.push({ kind: "boulder-crown", at: { x: c.x, y: c.y }, atH: c.h, owner: c.owner });
  });
  field.entryCells.forEach(function(i){
    anchors.push({ kind: "tray-edge", at: { x: i % ex, y: (i - (i % ex)) / ex }, atH: field.heights[i], owner: "tray" });
  });
  return anchors;
}

function terrainSpanNetwork(anchors, params){
  var p = Object.assign({}, TERRAIN_R1_PRESETS["R1-13"].defaults, params || {});
  var spans = [], i;
  var picks = (p.anchorSet && p.anchorSet.length) ? p.anchorSet : anchors.slice(0, (p.spanCount || 1) + 1);
  for(i = 0; i + 1 < picks.length && spans.length < (p.spanCount || 1); i++){
    var a = picks[i], b = picks[i + 1];
    var lengthCells = p.lengthCells != null ? p.lengthCells
      : Math.max(1, Math.round(Math.abs(a.at.x - b.at.x) + Math.abs(a.at.y - b.at.y)));
    /* DERIVED, NOT AUTHORED (§3.5): tread width comes from diameter. */
    var treadWidthFt = p.diameterFt;
    var movement = treadWidthFt < 2 ? "balance-check" : (treadWidthFt >= 5 ? "one-cell-footprint" : "normal");
    spans.push({
      id: "span-" + i,
      from: a, to: b,
      lengthCells: lengthCells, lengthFeet: lengthCells * TERRAIN_GRID_LAW.cellFeet,
      diameterFt: p.diameterFt, treadWidthFt: treadWidthFt, movement: movement,
      sagRatio: p.sagRatio, taper: p.taper,
      heightAboveDatumH: p.heightAboveDatumH,
      role: p.heightAboveDatumH === 0 ? "step-over-difficult-terrain"
        : (p.heightAboveDatumH <= 2 ? "step-on-cover-and-low-route" : "high-ground-with-a-fall-beneath"),
      barkCondition: p.barkCondition,
      wornTread: p.wornTread,
      undercutDepthH: p.undercutDepthH,
      buttressFlareCells: p.buttressFlareCells,
      climbDc: p.barkCondition === "mossy-slick" ? 17 : (p.barkCondition === "dead-brittle" ? 15 : 12),
      /* Collapse is a DECLARED property with a countable trigger — never a DM improvisation. */
      collapse: p.barkCondition === "dead-brittle"
        ? { trigger: "weight", threshold: 2, result: "span-fails", visibleOnInspection: true }
        : null
    });
  }
  var junctions = [];
  for(i = 0; i < (p.junctionCount || 0) && i + 2 < picks.length; i++){
    junctions.push({ id: "junction-" + i, at: picks[i + 1].at, atH: picks[i + 1].atH,
      spanIds: spans.slice(i, i + 3).map(function(s){ return s.id; }),
      standingDecisionPoint: true });
  }
  return { spans: spans, junctions: junctions, spanCount: spans.length,
    junctionCount: junctions.length,
    deferred: "full multi-level junction routing + renderer beam bodies (this pass ships hooks only)" };
}
