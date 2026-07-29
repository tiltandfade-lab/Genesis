/* ─── AUTHORED TERRAIN FEATURE BOOK ───────────────────────────────────────────────────────────
   docs/TERRAIN-FEATURE-BOOK.md. This is the quality baseline BEFORE procedural transformation:
   named, hand-composed landforms built from the terrain chassis vocabulary. A seed may change
   render dressing later, but it does not rearrange the feature or independently randomize cells.

   The small/large studies establish coherent natural form. The two defensive scenes apply the
   integrated Golden Site 9 and FFT findings:
     * a lengthened entrance may be earth, masonry, timber, or snow;
     * the gate window is one gate mass, one committed rising approach, one water/void obstacle;
     * most of a fortification plate is terrain and quiet ground;
     * tall masses belong in the camera-far band unless a later composition proves an exception.

   Engine layer. No THREE, DOM, camera object, or renderer. */

var TERRAIN_DEFENSIVE_CAMERA_LAW = Object.freeze({
  cameraGroundVector: Object.freeze([1, 1]),
  farCorner: Object.freeze({ x: 0, y: 0 }),
  nearCorner: "positive x + positive y (the Clayroom production camera faces -x/-z)",
  tallStoreysFrom: 3,
  maxTallDepth01: 0.42,
  depthMeasure: "camera-nearest footprint edge, normalized along the diagonal ground vector",
  statement: "Three-storey-and-taller masses stay in the far camera-depth band by default; "
    + "height is not capped at two storeys."
});

function terrainFeatureOp(type, mode, params, surfaceKind){
  var op = { type: type, mode: mode || "max", params: params || {} };
  if(surfaceKind) op.surfaceKind = surfaceKind;
  return op;
}

function terrainFeaturePiece(id, pieceId, label, ops, params, waterDatumH, waterBounds){
  return {
    id: id,
    pieceId: pieceId,
    label: label,
    params: params || null,
    ops: ops || [],
    waterDatumH: waterDatumH == null ? null : waterDatumH,
    waterBounds: waterBounds || null
  };
}

function terrainFeatureSpecBase(id, seed, extent, pieces, extra){
  return Object.assign({
    id: id,
    segmentId: "terrain-feature:" + id,
    seed: seed >>> 0,
    extentCells: { x: extent.x, y: extent.y },
    shape: "rect",
    baseDatumH: 0,
    slopeClamp: 1,
    /* The authored centre-height network owns the form. Random per-cell relief is deliberately
       zero in this baseline; the expression layer may still dress the same committed surface. */
    noiseAmplitudeH: 0,
    noiseScale: 3,
    pieces: pieces
  }, extra || {});
}

function terrainFeaturePatchRect(x, y, w, d){
  var out = [];
  for(var yy = y; yy < y + d; yy++) for(var xx = x; xx < x + w; xx++){
    out.push({ x: xx, y: yy });
  }
  return out;
}

/* Each recipe is an authored composition, not a parameter range. `qualityLock` names the thing
   procedural transforms must preserve after this pass. */
var TERRAIN_AUTHORED_FEATURES = Object.freeze({
  "AF-S01": Object.freeze({
    id: "AF-S01", slug: "root-lifted-hummock", scale: "small",
    name: "Root-lifted hummock",
    construction: "A broad root plate pushes one shoulder of the earth upward while runoff "
      + "removes a narrow strip beneath the exposed root.",
    tacticalRead: "A low changing-angle rise with one sheltered undercut and one readable route.",
    qualityLock: "one coherent shoulder; the undercut belongs to the rise instead of being a hole "
      + "dropped beside it",
    extent: Object.freeze({ x: 9, y: 9 }),
    build: function(seed){
      return terrainFeatureSpecBase("af-s01-root-lifted-hummock", seed, this.extent, [
        terrainFeaturePiece("af-s01-earth", "R1-02", "root-pushed earth", [
          terrainFeatureOp("radial", "max", {
            cx: 4.0, cy: 4.2, radius: 4.0, peakH: 2, profile: "sigmoid",
            asymmetry: -0.32, crownFlatCells: 0, baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 5.8, cy: 3.0, radius: 2.6, peakH: 1, profile: "convex",
            asymmetry: 0.2, crownFlatCells: 0, baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ]),
        terrainFeaturePiece("af-s01-root", "R1-13", "exposed root undercut", [
          terrainFeatureOp("slot", "min", {
            polyline: [{ x: 1.5, y: 4.7 }, { x: 6.8, y: 4.0 }],
            widthCells: 1, depthH: 2, baseH: 0, slopeClamp: Infinity, kind: "ground"
          })
        ], { spanCount: 1, heightAboveDatumH: 1, undercutDepthH: 2 })
      ], { featureId: this.id, featureScale: this.scale, qualityLock: this.qualityLock });
    }
  }),

  "AF-S02": Object.freeze({
    id: "AF-S02", slug: "sunken-runoff-lane", scale: "small",
    name: "Sunken runoff lane",
    construction: "Repeated traffic and stormwater lower a bending lane; spoil and root-bound soil "
      + "remain as uneven shoulders rather than two ruler-straight walls.",
    tacticalRead: "A covered low route whose ends return gradually to the surrounding datum.",
    qualityLock: "the floor, both shoulders, and both exits read as one eroded event",
    extent: Object.freeze({ x: 10, y: 12 }),
    build: function(seed){
      var line = [{ x: 2.0, y: 0.5 }, { x: 3.0, y: 3.5 }, { x: 6.2, y: 7.0 }, { x: 7.4, y: 11.0 }];
      return terrainFeatureSpecBase("af-s02-sunken-runoff-lane", seed, this.extent, [
        terrainFeaturePiece("af-s02-landform", "R1-02", "eroded lane and shoulders", [
          terrainFeatureOp("slot", "min", {
            polyline: line, widthCells: 1.6, depthH: 1, baseH: 0,
            slopeClamp: 1, kind: "ground", floorProfile: "rising"
          }),
          terrainFeatureOp("ridge", "max", {
            polyline: terrainOffsetPolyline(line, 1.55), halfWidthCells: 0.8,
            heightH: 1, crestWidthCells: 0, baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("ridge", "max", {
            polyline: terrainOffsetPolyline(line, -1.45), halfWidthCells: 0.7,
            heightH: 1, crestWidthCells: 0, baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ])
      ], { featureId: this.id, featureScale: this.scale, qualityLock: this.qualityLock });
    }
  }),

  "AF-S03": Object.freeze({
    id: "AF-S03", slug: "impact-hollow-and-spoil", scale: "small",
    name: "Impact hollow and spoil",
    construction: "A shallow impact or uprooting event presses a bowl into the ground and throws "
      + "more spoil onto one side than the other.",
    tacticalRead: "A concealing dip with a low firing lip and an intentionally weaker escape side.",
    qualityLock: "the lip is asymmetric and causally belongs to the bowl",
    extent: Object.freeze({ x: 9, y: 9 }),
    build: function(seed){
      return terrainFeatureSpecBase("af-s03-impact-hollow-and-spoil", seed, this.extent, [
        terrainFeaturePiece("af-s03-hollow", "R1-05", "impact bowl", [
          terrainFeatureOp("basin", "min", {
            cx: 4.1, cy: 4.3, radius: 3.3, maxDepthH: 2,
            shoreProfile: "gentle-wade", baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ]),
        terrainFeaturePiece("af-s03-spoil", "R1-02", "thrown spoil shoulder", [
          terrainFeatureOp("radial", "max", {
            cx: 2.1, cy: 3.2, radius: 2.6, peakH: 1, profile: "concave",
            asymmetry: -0.35, baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 6.8, cy: 5.8, radius: 1.8, peakH: 1, profile: "convex",
            asymmetry: 0.2, baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ])
      ], { featureId: this.id, featureScale: this.scale, qualityLock: this.qualityLock });
    }
  }),

  "AF-S04": Object.freeze({
    id: "AF-S04", slug: "slumped-bank-crossing", scale: "small",
    name: "Slumped bank crossing",
    construction: "An oblique earthen shoulder rises from two connected swells; one saturated "
      + "patch has slumped down and lengthened the climb instead of forming a staircase.",
    tacticalRead: "A natural rise with a broad easy side and a narrower sheltered scramble.",
    qualityLock: "the changing tile angles continue across the rise; only the actual bank shoulder "
      + "may read as a curb",
    extent: Object.freeze({ x: 10, y: 10 }),
    build: function(seed){
      return terrainFeatureSpecBase("af-s04-slumped-bank-crossing", seed, this.extent, [
        terrainFeaturePiece("af-s04-bank", "R1-02", "connected earthen rise", [
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: -1.0, y: 1.0 }, { x: 3.8, y: 2.5 }, { x: 10.0, y: 4.8 }],
            halfWidthCells: 3.2, heightH: 3, crestWidthCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 7.8, cy: 3.2, radius: 3.8, peakH: 2, profile: "convex",
            asymmetry: 0.25, crownFlatCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("basin", "min", {
            cx: 5.2, cy: 3.0, radius: 2.2, maxDepthH: 1,
            shoreProfile: "gentle-wade", baseH: 2, slopeClamp: 1, kind: "ground"
          })
        ])
      ], { featureId: this.id, featureScale: this.scale, qualityLock: this.qualityLock });
    }
  }),

  "AF-L01": Object.freeze({
    id: "AF-L01", slug: "compound-hill-shoulder", scale: "large",
    name: "Compound hill shoulder",
    construction: "Two overlapping swells and one lower spur share material, producing a long "
      + "ascent, a short lee flank, a saddle, and a crest that is not centred on the footprint.",
    tacticalRead: "Several coherent ways up one hill rather than a radial mound with equal flanks.",
    qualityLock: "convex rise, saddle, rolling shoulder, and fall remain mutually connected",
    extent: Object.freeze({ x: 14, y: 16 }),
    build: function(seed){
      return terrainFeatureSpecBase("af-l01-compound-hill-shoulder", seed, this.extent, [
        terrainFeaturePiece("af-l01-landform", "R1-02", "compound hill", [
          terrainFeatureOp("radial", "max", {
            cx: 6.0, cy: 6.2, radius: 7.4, peakH: 5, profile: "sigmoid",
            asymmetry: -0.28, crownFlatCells: 1, baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 9.7, cy: 9.3, radius: 5.0, peakH: 4, profile: "convex",
            asymmetry: 0.34, crownFlatCells: 0, baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 4.5, y: 6.0 }, { x: 2.0, y: 11.5 }],
            halfWidthCells: 1.4, heightH: 3, crestWidthCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ])
      ], { featureId: this.id, featureScale: this.scale, qualityLock: this.qualityLock });
    }
  }),

  "AF-L02": Object.freeze({
    id: "AF-L02", slug: "reverse-slope-ridge", scale: "large",
    name: "Reverse-slope ridge",
    construction: "A broad natural ridge presents a long attacking slope and drops into a shallow "
      + "reverse hollow behind the crest.",
    tacticalRead: "The crest grants observation; the reverse hollow hides reserves without a wall.",
    qualityLock: "approach, crest, and reverse slope remain one landform with no repeated ridge bands",
    extent: Object.freeze({ x: 16, y: 18 }),
    build: function(seed){
      return terrainFeatureSpecBase("af-l02-reverse-slope-ridge", seed, this.extent, [
        terrainFeaturePiece("af-l02-ridge", "R1-02", "natural defended ridge", [
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 1, y: 5.4 }, { x: 7.0, y: 4.4 }, { x: 14, y: 5.8 }],
            halfWidthCells: 2.4, heightH: 4, crestWidthCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("basin", "min", {
            cx: 8, cy: 2.0, radius: 3.5, maxDepthH: 1,
            shoreProfile: "gentle-wade", baseH: 1, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 11, y: 5.0 }, { x: 14.5, y: 11.0 }],
            halfWidthCells: 1.1, heightH: 2, crestWidthCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ])
      ], { featureId: this.id, featureScale: this.scale, qualityLock: this.qualityLock });
    }
  }),

  "AF-L03": Object.freeze({
    id: "AF-L03", slug: "breached-ditch-rampart", scale: "large",
    name: "Breached ditch and rampart",
    construction: "Spoil from one forward ditch forms a low rampart beside it; the earthwork is "
      + "built in two runs so the crossing is a real construction gap, not a painted doorway.",
    tacticalRead: "Strong linear cover with one obvious crossing and two expensive end-runs.",
    qualityLock: "ditch, spoil bank, and breach retain one-to-one causality",
    extent: Object.freeze({ x: 16, y: 18 }),
    build: function(seed){
      function run(id, a, b){
        return terrainFeaturePiece(id, "R1-08", "ditch and spoil run", [
          terrainFeatureOp("ridge", "max", {
            polyline: [a, b], halfWidthCells: 0.75, heightH: 2, crestWidthCells: 1,
            pairedDitch: true, ditchDepthH: 2, ditchWidthCells: 2, ditchSide: -1,
            baseH: 0, slopeClamp: Infinity, kind: "ground"
          })
        ]);
      }
      return terrainFeatureSpecBase("af-l03-breached-ditch-rampart", seed, this.extent, [
        run("af-l03-west", { x: 0.5, y: 7.0 }, { x: 6.5, y: 6.4 }),
        run("af-l03-east", { x: 9.5, y: 6.4 }, { x: 15.0, y: 7.5 }),
        terrainFeaturePiece("af-l03-rear-step", "R1-02", "rear firing shoulder", [
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 2, y: 4.0 }, { x: 13, y: 4.3 }],
            halfWidthCells: 1, heightH: 1, crestWidthCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ])
      ], { featureId: this.id, featureScale: this.scale, qualityLock: this.qualityLock });
    }
  }),

  "AF-L04": Object.freeze({
    id: "AF-L04", slug: "terraced-bluff-approach", scale: "large",
    name: "Terraced bluff approach",
    construction: "A competent bluff carries a high shelf, while one central route has been cut "
      + "into broad climbing treads; rockfall gathers at the foot instead of repeating on the face.",
    tacticalRead: "A committed climb under overlook, with a real plateau and flanking hard faces.",
    qualityLock: "curbs occur on the built approach and bluff only; the surrounding ground remains natural",
    extent: Object.freeze({ x: 16, y: 18 }),
    build: function(seed){
      var leftBounds = { x: 0, y: 0, w: 6, d: 7 };
      var rightBounds = { x: 10, y: 0, w: 6, d: 7 };
      return terrainFeatureSpecBase("af-l04-terraced-bluff-approach", seed, this.extent, [
        terrainFeaturePiece("af-l04-left-bluff", "R1-01", "left bluff shelf", [
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 0, y: 5 }, { x: 15, y: 5 }],
            halfPlane: true, plateauSide: 1, heightH: 4, baseH: 0,
            slopeClamp: Infinity, kind: "ground", bounds: leftBounds
          })
        ]),
        terrainFeaturePiece("af-l04-right-bluff", "R1-01", "right bluff shelf", [
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 0, y: 5 }, { x: 15, y: 5 }],
            halfPlane: true, plateauSide: 1, heightH: 4, baseH: 0,
            slopeClamp: Infinity, kind: "ground", bounds: rightBounds
          })
        ]),
        terrainFeaturePiece("af-l04-stair", "R1-09", "broad cut approach", [
          terrainFeatureOp("terrace", "set", {
            stepCount: 5, riseHPerStep: -1, treadDepthCells: 1,
            axis: "y", originCell: { x: 6, y: 1 }, widthCells: 4,
            baseH: 4, slopeClamp: 1, kind: "ground",
            bounds: { x: 6, y: 1, w: 4, d: 8 }
          })
        ]),
        terrainFeaturePiece("af-l04-talus", "R1-10", "single talus fan", [
          terrainFeatureOp("radial", "max", {
            cx: 12.5, cy: 7.0, radius: 3.2, peakH: 2, profile: "concave",
            baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ])
      ], { featureId: this.id, featureScale: this.scale, qualityLock: this.qualityLock });
    }
  })
});

var TERRAIN_AUTHORED_FEATURE_IDS = Object.freeze(Object.keys(TERRAIN_AUTHORED_FEATURES));

function terrainFeatureRecipe(featureId){
  var recipe = TERRAIN_AUTHORED_FEATURES[featureId];
  if(!recipe) throw new Error("terrainFeatureRecipe: unknown feature " + featureId);
  return recipe;
}

function terrainFeatureBuild(featureId, seed){
  var recipe = terrainFeatureRecipe(featureId);
  var s = seed == null ? terrainSeedFrom("terrain-feature:" + featureId) : (seed >>> 0);
  var spec = recipe.build(s);
  var field = terrainFieldBuild(spec);
  return { recipe: recipe, spec: spec, field: field };
}

function terrainDefensiveRidgeworksSpec(seed){
  function earthwork(id, line){
    return terrainFeaturePiece(id, "R1-08", "split ditch-and-bank line", [
      terrainFeatureOp("ridge", "max", {
        polyline: line, halfWidthCells: 0.65,
        heightH: 2, crestWidthCells: 1, pairedDitch: true,
        ditchDepthH: 1, ditchWidthCells: 1.8, ditchSide: -1,
        baseH: 0, slopeClamp: Infinity, kind: "ground"
      })
    ]);
  }
  var pieces = [
    terrainFeaturePiece("df-ridge-glacis", "R1-02", "broad natural glacis", [
      terrainFeatureOp("ridge", "max", {
        polyline: [{ x: 0.5, y: 5.0 }, { x: 8, y: 4.2 }, { x: 17, y: 5.4 }],
        halfWidthCells: 3.0, heightH: 3, crestWidthCells: 0,
        baseH: 0, slopeClamp: 1, kind: "ground"
      })
    ]),
    earthwork("df-ridge-outer-west",
      [{ x: 0.5, y: 8.2 }, { x: 3.4, y: 9.0 }, { x: 7.0, y: 7.5 }]),
    earthwork("df-ridge-outer-east",
      [{ x: 10.0, y: 7.4 }, { x: 13.7, y: 6.7 }, { x: 17.0, y: 8.4 }]),
    earthwork("df-ridge-inner-west",
      [{ x: 0.5, y: 4.2 }, { x: 2.4, y: 3.4 }, { x: 4.0, y: 4.0 }]),
    earthwork("df-ridge-inner-east",
      [{ x: 7.0, y: 4.0 }, { x: 10.5, y: 5.3 }, { x: 14.0, y: 4.1 },
        { x: 17.0, y: 4.8 }])
  ];
  return terrainFeatureSpecBase("df-ridgeworks-turning-entry", seed, { x: 18, y: 22 }, pieces, {
    featureId: "DF-01",
    featureScale: "defensive-site",
    goldenSiteSource: "Site 9 lengthened entrance + Maiden Castle earthwork overlap",
    tacticalGrammar: {
      profile: "turning-earthwork-entry",
      outerGap: { x0: 7, x1: 10, y: 8 },
      innerGap: { x0: 4, x1: 7, y: 4 },
      committedApproach: "outer breach then westward turn to the offset inner breach",
      quietGroundMinimumShare: 0.45
    }
  });
}

function terrainDefensiveGateworksSpec(seed){
  var ex = 18, ey = 22;
  var causeway = terrainFeaturePatchRect(7, 7, 4, 6);
  var pieces = [
    terrainFeaturePiece("df-gate-natural-rise", "R1-02", "gate-seat shoulder", [
      terrainFeatureOp("radial", "max", {
        cx: 8.3, cy: 4.0, radius: 6.3, peakH: 3, profile: "sigmoid",
        asymmetry: -0.15, crownFlatCells: 1, baseH: 0, slopeClamp: 1, kind: "ground"
      })
    ]),
    terrainFeaturePiece("df-gate-seat", "R1-01", "far gate seat", [
      terrainFeatureOp("ridge", "max", {
        polyline: [{ x: 0, y: 3 }, { x: 13.5, y: 3 }],
        halfPlane: true, plateauSide: 1, heightH: 4, baseH: 0,
        slopeClamp: Infinity, kind: "ground", bounds: { x: 0, y: 0, w: 14, d: 4 }
      })
    ]),
    terrainFeaturePiece("df-gate-stair", "R1-09", "rising committed approach", [
      terrainFeatureOp("terrace", "set", {
        stepCount: 5, riseHPerStep: -1, treadDepthCells: 1,
        axis: "y", originCell: { x: 7, y: 3 }, widthCells: 4,
        baseH: 4, slopeClamp: 1, kind: "ground",
        bounds: { x: 7, y: 3, w: 4, d: 7 }
      })
    ]),
    terrainFeaturePiece("df-gate-moat-west", "R1-05", "west moat", [
      terrainFeatureOp("slot", "min", {
        polyline: [{ x: 0, y: 10 }, { x: 5.8, y: 9.2 }],
        widthCells: 3, depthH: 3, baseH: 0, slopeClamp: Infinity, kind: "ground"
      })
    ], null, -1, { x: 0, y: 7, w: 7, d: 6 }),
    terrainFeaturePiece("df-gate-moat-east", "R1-05", "east moat", [
      terrainFeatureOp("slot", "min", {
        polyline: [{ x: 12.2, y: 9.2 }, { x: 17, y: 10.4 }],
        widthCells: 3, depthH: 3, baseH: 0, slopeClamp: Infinity, kind: "ground"
      })
    ], null, -1, { x: 11, y: 7, w: 7, d: 6 }),
    terrainFeaturePiece("df-gate-causeway", "R1-09", "broken causeway surface", [
      terrainFeatureOp("patch", "set", {
        cells: causeway, surfaceKind: "stone-causeway"
      }, "stone-causeway")
    ])
  ];
  var structures = [
    {
      id: "df-gatehouse-four-storey", role: "gatehouse", storeys: 4,
      footprint: { x: 5, y: 0, w: 6, d: 3 }, baseH: 4,
      construction: "four-storey diagnostic gate mass; passage and control room remain later structure work"
    },
    {
      id: "df-west-tower-three-storey", role: "tower", storeys: 3,
      footprint: { x: 1, y: 0, w: 3, d: 3 }, baseH: 4,
      construction: "three-storey point deck behind the far line"
    },
    {
      id: "df-east-tower-three-storey", role: "tower", storeys: 3,
      footprint: { x: 9, y: 0, w: 3, d: 3 }, baseH: 4,
      construction: "three-storey flank mass kept inside the diagonal camera-far band"
    }
  ];
  return terrainFeatureSpecBase("df-gateworks-rising-causeway", seed, { x: ex, y: ey }, pieces, {
    featureId: "DF-02",
    featureScale: "defensive-site",
    waterDatumH: null,
    structures: structures,
    cameraLaw: TERRAIN_DEFENSIVE_CAMERA_LAW,
    goldenSiteSource: "FFT Igros + Riovanes gate windows; Site 9 gate-window profile",
    tacticalGrammar: {
      profile: "gate-mass-rising-causeway",
      gateMassId: "df-gatehouse-four-storey",
      obstaclePieceIds: ["df-gate-moat-west", "df-gate-moat-east"],
      committedApproachPieceId: "df-gate-stair",
      approachChangesLevel: true,
      quietGroundMinimumShare: 0.45
    }
  });
}

function terrainCameraDepth01(structure, extent){
  var fp = structure.footprint;
  /* Judge the whole mass, not its forgiving centroid. Positive local x/y are camera-near, so the
     footprint's positive edge is the point most likely to hide tactical ground. */
  var nearX = fp.x + fp.w, nearY = fp.y + fp.d;
  var nx = nearX / Math.max(1, extent.x);
  var ny = nearY / Math.max(1, extent.y);
  return Math.max(0, Math.min(1, (nx + ny) / 2));
}

function terrainDefensiveCameraReport(structures, extent, law){
  var activeLaw = law || TERRAIN_DEFENSIVE_CAMERA_LAW;
  var rows = (structures || []).map(function(s){
    var depth = terrainCameraDepth01(s, extent);
    var tall = s.storeys >= activeLaw.tallStoreysFrom;
    return {
      id: s.id, storeys: s.storeys, tall: tall,
      cameraDepth01: Number(depth.toFixed(4)),
      inFarBand: !tall || depth <= activeLaw.maxTallDepth01
    };
  });
  return {
    law: activeLaw,
    rows: rows,
    tallStructures: rows.filter(function(r){ return r.tall; }).length,
    maxStoreys: rows.reduce(function(m, r){ return Math.max(m, r.storeys); }, 0),
    violations: rows.filter(function(r){ return r.tall && !r.inFarBand; }),
    ok: rows.every(function(r){ return r.inFarBand; })
  };
}

var CL_F08_TERRAIN_FEATURE_BOOK = Object.freeze({
  id: "cl-f08-terrain-feature-book",
  version: 1,
  status: "AUTHORED QUALITY BASELINE — procedural transforms intentionally deferred",
  question: "Does each terrain feature read as one continuous, tactically useful landform?",
  proof: "CL-F08a",
  featureIds: TERRAIN_AUTHORED_FEATURE_IDS,
  sources: Object.freeze([
    "docs/TERRAIN-PROGRAM.md",
    "docs/intel-terrain/FFT-SURFACE-GRAMMAR.md",
    "docs/SITE-9-CONTESTED-FORTRESS-SPEC.md",
    "Reference/Contested-Fortress-Study-0727/lane-3-fft-cohort.md"
  ]),
  scenes: Object.freeze([
    Object.freeze({
      id: "authored-feature-book", capture: 8, label: "Authored feature book",
      lightRecipeId: "daylit", frameCount: TERRAIN_AUTHORED_FEATURE_IDS.length,
      claim: "four small and four large features, one authored landform per frame"
    }),
    Object.freeze({
      id: "defensive-ridgeworks", capture: 9, label: "Turning ridgeworks",
      lightRecipeId: "daylit",
      claim: "two offset ditch-and-bank breaches lengthen the entrance without a masonry wall"
    }),
    Object.freeze({
      id: "defensive-gateworks", capture: 10, label: "Rising gateworks",
      lightRecipeId: "daylit",
      claim: "one far gate mass, one committed rising approach, one split water obstacle"
    })
  ])
});

function terrainFeatureSceneDefinition(sceneId){
  for(var i = 0; i < CL_F08_TERRAIN_FEATURE_BOOK.scenes.length; i++){
    if(CL_F08_TERRAIN_FEATURE_BOOK.scenes[i].id === sceneId){
      return CL_F08_TERRAIN_FEATURE_BOOK.scenes[i];
    }
  }
  return null;
}

function terrainFeatureSceneBuild(sceneId, seed, opts){
  var def = terrainFeatureSceneDefinition(sceneId);
  if(!def) return null;
  var s = seed == null ? terrainSeedFrom("cl-f08a") : (seed >>> 0);
  if(sceneId === "authored-feature-book"){
    var frameIndex = opts && opts.frameIndex != null ? Math.max(0, opts.frameIndex | 0) : 0;
    var featureId = TERRAIN_AUTHORED_FEATURE_IDS[frameIndex % TERRAIN_AUTHORED_FEATURE_IDS.length];
    var built = terrainFeatureBuild(featureId, s);
    return {
      sceneId: sceneId, featureBook: CL_F08_TERRAIN_FEATURE_BOOK,
      feature: built.recipe, featureId: featureId,
      frameIndex: frameIndex, frameCount: TERRAIN_AUTHORED_FEATURE_IDS.length,
      spec: built.spec, fields: [built.field], primary: built.field,
      structures: [], cameraLaw: TERRAIN_DEFENSIVE_CAMERA_LAW
    };
  }
  var spec = sceneId === "defensive-ridgeworks"
    ? terrainDefensiveRidgeworksSpec(s) : terrainDefensiveGateworksSpec(s);
  var field = terrainFieldBuild(spec);
  return {
    sceneId: sceneId, featureBook: CL_F08_TERRAIN_FEATURE_BOOK,
    featureId: spec.featureId, spec: spec, fields: [field], primary: field,
    structures: spec.structures || [], cameraLaw: spec.cameraLaw || TERRAIN_DEFENSIVE_CAMERA_LAW,
    tacticalGrammar: spec.tacticalGrammar || null,
    cameraReport: terrainDefensiveCameraReport(spec.structures || [], spec.extentCells,
      spec.cameraLaw || TERRAIN_DEFENSIVE_CAMERA_LAW)
  };
}

function terrainFeatureGateReport(seed){
  var s = seed == null ? terrainSeedFrom("cl-f08a") : (seed >>> 0);
  var rows = TERRAIN_AUTHORED_FEATURE_IDS.map(function(id){
    var built = terrainFeatureBuild(id, s);
    return {
      id: id, scale: built.recipe.scale, fingerprint: built.field.fingerprint,
      metrics: built.field.metrics
    };
  });
  var ridge = terrainFeatureSceneBuild("defensive-ridgeworks", s);
  var gate = terrainFeatureSceneBuild("defensive-gateworks", s);
  [ridge, gate].forEach(function(scene){
    rows.push({
      id: scene.featureId, scale: "defensive-site",
      fingerprint: scene.primary.fingerprint, metrics: scene.primary.metrics
    });
  });
  var illegal = rows.filter(function(r){
    return r.metrics.walkableCellsOverSlopeLimit !== 0
      || r.metrics.illegalWalkEdges !== 0
      || r.metrics.unownedFaces !== 0
      || r.metrics.unreachableStandableNonFlying !== 0;
  });
  function quietGroundShare(scene){
    var live = scene.primary.cells.filter(function(c){ return c.inPlayfield; });
    var quiet = live.filter(function(c){
      return c.h === scene.primary.baseDatumH && c.kind === "ground" && !c.surface;
    });
    return live.length ? quiet.length / live.length : 0;
  }
  function structuresGrounded(scene){
    return (scene.structures || []).every(function(structure){
      var fp = structure.footprint;
      for(var y = fp.y; y < fp.y + fp.d; y++) for(var x = fp.x; x < fp.x + fp.w; x++){
        if(scene.primary.heights[y * scene.primary.extent.x + x] !== structure.baseH) return false;
      }
      return true;
    });
  }
  var ridgeQuietShare = quietGroundShare(ridge);
  var gateQuietShare = quietGroundShare(gate);
  var gateApproachH = [3, 4, 5, 6, 7].map(function(y){
    return gate.primary.heights[y * gate.primary.extent.x + 8];
  });
  var smallCount = rows.filter(function(r){ return r.scale === "small"; }).length;
  var largeCount = rows.filter(function(r){ return r.scale === "large"; }).length;
  var defensiveCount = rows.filter(function(r){ return r.scale === "defensive-site"; }).length;
  var uniqueCount = new Set(rows.map(function(r){ return r.fingerprint; })).size;
  var defensive = {
    ridgeQuietGroundShare: Number(ridgeQuietShare.toFixed(4)),
    gateQuietGroundShare: Number(gateQuietShare.toFixed(4)),
    ridgeQuietGroundMinimum: ridge.tacticalGrammar.quietGroundMinimumShare,
    gateQuietGroundMinimum: gate.tacticalGrammar.quietGroundMinimumShare,
    gateApproachH: gateApproachH,
    gateStructuresGrounded: structuresGrounded(gate)
  };
  return {
    fixture: CL_F08_TERRAIN_FEATURE_BOOK.id,
    fixtureVersion: CL_F08_TERRAIN_FEATURE_BOOK.version,
    seed: s,
    authoredFeatures: TERRAIN_AUTHORED_FEATURE_IDS.length,
    smallFeatures: smallCount,
    largeFeatures: largeCount,
    defensiveCompositions: defensiveCount,
    uniqueFingerprints: uniqueCount,
    illegal: illegal,
    camera: gate.cameraReport,
    defensive: defensive,
    rows: rows,
    ok: illegal.length === 0
      && smallCount === 4 && largeCount === 4 && defensiveCount === 2
      && uniqueCount === rows.length
      && ridgeQuietShare >= ridge.tacticalGrammar.quietGroundMinimumShare
      && gateQuietShare >= gate.tacticalGrammar.quietGroundMinimumShare
      && JSON.stringify(gateApproachH) === JSON.stringify([4, 3, 2, 1, 0])
      && defensive.gateStructuresGrounded
      && gate.cameraReport.ok && gate.cameraReport.maxStoreys > 2
  };
}
