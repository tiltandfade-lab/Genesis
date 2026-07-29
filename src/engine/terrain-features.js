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
            cx: 4.2, cy: 4.3, radiusX: 4.6, radiusY: 2.8, rotationDeg: -18,
            peakH: 1.65, profile: "sigmoid", asymmetry: -0.12, crownFlatCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 5.8, cy: 4.0, radiusX: 2.5, radiusY: 1.7, rotationDeg: -26,
            peakH: 1, profile: "convex", asymmetry: 0.1, crownFlatCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ]),
        terrainFeaturePiece("af-s01-root", "R1-13", "exposed root undercut", [
          terrainFeatureOp("slot", "min", {
            polyline: [{ x: 2.0, y: 5.0 }, { x: 4.1, y: 4.2 }, { x: 6.4, y: 4.3 }],
            widthStartCells: 0.5, widthEndCells: 0.8,
            depthStartH: 0.7, depthEndH: 1.0, endFadeCells: 1.35,
            baseH: 1, slopeClamp: 1, kind: "ground"
          })
        ], {
          spanCount: 1, diameterFt: 1.05, heightAboveDatumH: 0.4, undercutDepthH: 1
        })
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
      var line = [
        { x: 1.8, y: -1.0 }, { x: 2.4, y: 2.2 }, { x: 3.8, y: 5.0 },
        { x: 6.0, y: 8.0 }, { x: 7.7, y: 12.4 }
      ];
      return terrainFeatureSpecBase("af-s02-sunken-runoff-lane", seed, this.extent, [
        terrainFeaturePiece("af-s02-landform", "R1-02", "eroded lane and shoulders", [
          terrainFeatureOp("slot", "min", {
            polyline: line, widthStartCells: 1.45, widthEndCells: 2.35,
            depthStartH: 1.0, depthEndH: 1.35, endFadeCells: 1.5,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 2.0, cy: 4.4, radiusX: 3.1, radiusY: 1.25, rotationDeg: 62,
            peakH: 0.85, profile: "concave", asymmetry: -0.08,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 7.3, cy: 8.5, radiusX: 3.0, radiusY: 1.2, rotationDeg: 56,
            peakH: 0.8, profile: "concave", asymmetry: 0.1,
            baseH: 0, slopeClamp: 1, kind: "ground"
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
            cx: 4.5, cy: 4.1, radiusX: 3.8, radiusY: 2.75, rotationDeg: 24,
            maxDepthH: 1,
            shoreProfile: "gentle-wade", baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ]),
        terrainFeaturePiece("af-s03-spoil", "R1-02", "downrange spoil fan", [
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 0.9, y: 3.0 }, { x: 2.1, y: 5.0 }, { x: 4.2, y: 6.6 }],
            halfWidthStartCells: 0.8, halfWidthEndCells: 1.8,
            heightStartH: 0.55, heightEndH: 1.15,
            crossProfile: "smooth", endFadeCells: 0.9,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 2.2, cy: 5.8, radiusX: 2.7, radiusY: 1.35, rotationDeg: 28,
            peakH: 1, profile: "concave", asymmetry: -0.12,
            baseH: 0, slopeClamp: 1, kind: "ground"
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
          terrainFeatureOp("radial", "max", {
            cx: 4.5, cy: 3.4, radiusX: 6.2, radiusY: 2.8, rotationDeg: 16,
            peakH: 1.45, profile: "sigmoid", asymmetry: -0.1, crownFlatCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 7.5, cy: 5.5, radiusX: 3.8, radiusY: 2.0, rotationDeg: 30,
            peakH: 1.15, profile: "sigmoid", asymmetry: 0.08, crownFlatCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("basin", "min", {
            cx: 5.8, cy: 4.1, radiusX: 2.7, radiusY: 1.65, rotationDeg: 20,
            maxDepthH: 1, shoreProfile: "gentle-wade",
            baseH: 1.2, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("slot", "min", {
            polyline: [{ x: 4.3, y: 3.6 }, { x: 5.7, y: 4.3 }, { x: 7.2, y: 5.2 }],
            widthStartCells: 0.8, widthEndCells: 1.45,
            depthStartH: 0.3, depthEndH: 1, endFadeCells: 0.8,
            baseH: 0.8, slopeClamp: 1, kind: "ground"
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
            cx: 6.8, cy: 7.0, radiusX: 7.5, radiusY: 5.35, rotationDeg: 32,
            peakH: 3.05, profile: "sigmoid", asymmetry: -0.12, crownFlatCells: 0.35,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 9.8, cy: 10.2, radiusX: 5.1, radiusY: 3.5, rotationDeg: -18,
            peakH: 2.35, profile: "sigmoid", asymmetry: 0.1, crownFlatCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 5.7, y: 7.2 }, { x: 3.8, y: 10.0 }, { x: 1.8, y: 13.3 }],
            halfWidthStartCells: 2.5, halfWidthEndCells: 1.15,
            heightStartH: 2.05, heightEndH: 0.8,
            crossProfile: "smooth", endFadeCells: 0.8,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("basin", "min", {
            cx: 8.2, cy: 8.9, radiusX: 2.7, radiusY: 1.6, rotationDeg: -8,
            maxDepthH: 0.45, shoreProfile: "gentle-wade",
            baseH: 2.35, slopeClamp: 1, kind: "ground"
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
            polyline: [{ x: -2, y: 6.8 }, { x: 2.8, y: 5.1 },
              { x: 6.7, y: 6.2 }, { x: 10.4, y: 5.4 },
              { x: 13.5, y: 6.6 }, { x: 17.5, y: 5.1 }],
            halfWidthStartCells: 4.7, halfWidthEndCells: 3.5,
            heightStartH: 1.65, heightEndH: 1.35,
            crossProfile: "smooth", crestHalfWidthCells: 0.1,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 4.5, cy: 5.8, radiusX: 5.3, radiusY: 3.2, rotationDeg: -7,
            peakH: 2.15, profile: "sigmoid", asymmetry: -0.08, crownFlatCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 11.8, cy: 5.9, radiusX: 4.7, radiusY: 2.8, rotationDeg: 12,
            peakH: 1.95, profile: "sigmoid", asymmetry: 0.1, crownFlatCells: 0,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("basin", "min", {
            cx: 8.4, cy: 2.8, radiusX: 4.5, radiusY: 2.3, rotationDeg: -8,
            maxDepthH: 0.65, shoreProfile: "gentle-wade",
            baseH: 1.6, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 10.7, y: 5.8 }, { x: 13.2, y: 8.0 }, { x: 15.2, y: 11.2 }],
            halfWidthStartCells: 2.1, halfWidthEndCells: 1.25,
            heightStartH: 1.4, heightEndH: 0.6,
            crossProfile: "smooth", endFadeCells: 0.8,
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
            polyline: [a, b],
            halfWidthStartCells: 1.25, halfWidthEndCells: 1.05,
            heightStartH: 1.8, heightEndH: 1.45,
            crossProfile: "smooth", crestHalfWidthCells: 0.25, endFadeCells: 1.25,
            pairedDitch: true, ditchDepthH: 1, ditchWidthCells: 1.8, ditchSide: -1,
            baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ]);
      }
      return terrainFeatureSpecBase("af-l03-breached-ditch-rampart", seed, this.extent, [
        run("af-l03-west", { x: -1.2, y: 7.4 }, { x: 6.4, y: 6.2 }),
        run("af-l03-east", { x: 9.6, y: 6.3 }, { x: 16.7, y: 7.6 }),
        terrainFeaturePiece("af-l03-breach-fan", "R1-02", "breach debris fan", [
          terrainFeatureOp("radial", "max", {
            cx: 8.0, cy: 7.1, radiusX: 2.7, radiusY: 1.5, rotationDeg: 4,
            peakH: 1, profile: "concave", asymmetry: 0.05,
            baseH: 0, slopeClamp: 1, kind: "ground"
          })
        ]),
        terrainFeaturePiece("af-l03-rear-step", "R1-02", "rear firing shoulder", [
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: 1.5, y: 3.8 }, { x: 7.0, y: 4.5 }, { x: 14.2, y: 3.8 }],
            halfWidthStartCells: 2.4, halfWidthEndCells: 1.8,
            heightStartH: 1.1, heightEndH: 0.85,
            crossProfile: "smooth", endFadeCells: 1.0,
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
      return terrainFeatureSpecBase("af-l04-terraced-bluff-approach", seed, this.extent, [
        terrainFeaturePiece("af-l04-bluff", "R1-01", "continuous bluff shelf", [
          terrainFeatureOp("ridge", "max", {
            polyline: [{ x: -1, y: 5.7 }, { x: 3.8, y: 4.7 }, { x: 8.2, y: 5.7 },
              { x: 12.3, y: 4.6 }, { x: 17, y: 5.5 }],
            halfPlane: true, plateauSide: 1, heightH: 4, baseH: 0,
            slopeClamp: Infinity, kind: "ground", bounds: { x: 0, y: 0, w: 16, d: 7 }
          })
        ]),
        terrainFeaturePiece("af-l04-stair", "R1-09", "broad cut approach", [
          terrainFeatureOp("terrace", "set", {
            stepCount: 5, riseHPerStep: -1, treadDepthCells: 1,
            axis: "y", originCell: { x: 6, y: 2 }, widthCells: 4,
            baseH: 4, slopeClamp: 1, kind: "ground",
            bounds: { x: 6, y: 2, w: 4, d: 8 }
          })
        ]),
        terrainFeaturePiece("af-l04-talus", "R1-10", "single talus fan", [
          terrainFeatureOp("radial", "max", {
            cx: 12.3, cy: 7.0, radiusX: 3.6, radiusY: 2.0, rotationDeg: -18,
            peakH: 1, profile: "concave", asymmetry: -0.08,
            baseH: 0, slopeClamp: 1, kind: "ground"
          }),
          terrainFeatureOp("radial", "max", {
            cx: 2.7, cy: 6.3, radiusX: 2.7, radiusY: 1.45, rotationDeg: 22,
            peakH: 1, profile: "concave", asymmetry: 0.05,
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
        polyline: line,
        halfWidthStartCells: 1.35, halfWidthEndCells: 1.05,
        heightStartH: 1.8, heightEndH: 1.45,
        crossProfile: "smooth", crestHalfWidthCells: 0.25, endFadeCells: 1.1,
        pairedDitch: true, ditchDepthH: 1, ditchWidthCells: 1.8, ditchSide: -1,
        baseH: 0, slopeClamp: 1, kind: "ground"
      })
    ]);
  }
  var pieces = [
    terrainFeaturePiece("df-ridge-glacis", "R1-02", "broad natural glacis", [
      terrainFeatureOp("ridge", "max", {
        polyline: [{ x: -1.5, y: 5.7 }, { x: 7.5, y: 4.5 }, { x: 18.5, y: 5.8 }],
        halfWidthStartCells: 5.0, halfWidthEndCells: 4.0,
        heightStartH: 2.4, heightEndH: 2.0,
        crossProfile: "smooth", crestHalfWidthCells: 0.45,
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
        cx: 8.2, cy: 4.7, radiusX: 8.2, radiusY: 5.8, rotationDeg: -4,
        peakH: 3, profile: "sigmoid", asymmetry: -0.08, crownFlatCells: 0.6,
        baseH: 0, slopeClamp: 1, kind: "ground"
      })
    ]),
    terrainFeaturePiece("df-gate-seat", "R1-01", "far gate seat", [
      terrainFeatureOp("ridge", "max", {
        polyline: [{ x: -1, y: 3.8 }, { x: 3.8, y: 3.0 },
          { x: 8.4, y: 3.5 }, { x: 13.5, y: 2.9 }, { x: 18.5, y: 3.9 }],
        halfPlane: true, plateauSide: 1, heightH: 4, baseH: 0,
        slopeClamp: Infinity, kind: "ground", bounds: { x: 0, y: 0, w: 18, d: 5 }
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
        polyline: [{ x: -1, y: 9.8 }, { x: 2.8, y: 9.0 }, { x: 6.0, y: 8.2 }],
        widthStartCells: 2.7, widthEndCells: 2.1,
        depthStartH: 2, depthEndH: 1.5, endFadeCells: 1.0,
        baseH: 0, slopeClamp: 1, kind: "ground"
      })
    ], null, -1, { x: 0, y: 7, w: 7, d: 6 }),
    terrainFeaturePiece("df-gate-moat-east", "R1-05", "east moat", [
      terrainFeatureOp("slot", "min", {
        polyline: [{ x: 12.0, y: 8.2 }, { x: 15.0, y: 9.0 }, { x: 18.5, y: 10.0 }],
        widthStartCells: 2.1, widthEndCells: 2.8,
        depthStartH: 1.5, depthEndH: 2, endFadeCells: 1.0,
        baseH: 0, slopeClamp: 1, kind: "ground"
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

/* ─── CL-F09 · THE VERTICAL FFT PROOF ──────────────────────────────────────────────────────────
   This is one retained BATTLEFIELD, not another isolated-form card. Its terrain is authored from
   two reusable macro operations:
     * a sparse control surface establishes low approach, two fighting benches, a saddle and a
       thirty-foot far ridge;
     * graded corridors cut/fill that mass into a long switchback and a shorter gully climb.

   The height is not a spectacle budget. It is tactical distance: twelve quanta are earned across
   several routes and fighting levels, while the high mass stays in the camera-far half. */
function terrainFftHillsideSpec(seed){
  var extent = { x: 20, y: 24 };
  var switchback = [
    { x: 17.5, y: 22.5, h: 0, widthCells: 2.1 },
    { x: 4.0, y: 19.4, h: 3, widthCells: 1.8 },
    { x: 3.2, y: 17.1, h: 3, widthCells: 2.6 },
    { x: 16.4, y: 13.9, h: 6, widthCells: 1.75 },
    { x: 17.0, y: 11.6, h: 6, widthCells: 2.55 },
    { x: 5.0, y: 8.5, h: 9, widthCells: 1.8 },
    { x: 4.2, y: 6.3, h: 9, widthCells: 2.6 },
    { x: 13.6, y: 3.1, h: 12, widthCells: 1.9 },
    { x: 11.0, y: 1.5, h: 12, widthCells: 2.5 }
  ];
  var gully = [
    { x: 19.0, y: 22.0, h: 0, widthCells: 1.15 },
    { x: 18.5, y: 17.5, h: 2, widthCells: 1.15 },
    { x: 18.7, y: 13.5, h: 4, widthCells: 1.15 },
    { x: 18.2, y: 9.5, h: 6, widthCells: 1.15 },
    { x: 18.5, y: 5.5, h: 8, widthCells: 1.15 },
    { x: 18.0, y: 1.0, h: 10, widthCells: 1.15 }
  ];
  var pieces = [
    terrainFeaturePiece("fft-hill-mass", "R1-07", "thirty-foot mountainside", [
      terrainFeatureOp("control-surface", "set", {
        columns: [0, 3, 7, 11, 15, 19],
        rows: [0, 3, 6, 8, 12, 15, 19, 23],
        heightsH: [
          [11, 12, 12, 11, 9, 8],
          [11, 12, 12, 11, 10, 8],
          [10, 11, 11, 10, 8, 7],
          [7, 8, 9, 9, 7, 6],
          [6, 7, 7, 8, 6, 4],
          [4, 4, 6, 6, 4, 2],
          [2, 2, 3, 4, 1, 0],
          [0, 0, 0, 0, 0, 0]
        ],
        /* The massif is continuous walkable ground. A cliff is a later explicit scarp piece, never
           an accidental by-product of quantizing the survey controls or cutting the route. */
        slopeClamp: 1,
        kind: "ground"
      })
    ], {
      macroNodes: ["lower-approach", "lower-bench", "middle-bench", "saddle", "high-overlook"],
      reliefH: 12
    }),
    /* One real face, confined to the middle-left shoulder. The switchback rounds its right-hand
       end, so the scarp creates route meaning without wrapping the mountain in a sedimentary band. */
    terrainFeaturePiece("fft-middle-scarp", "R1-07", "localized middle-shoulder escarpment", [
      terrainFeatureOp("ridge", "max", {
        polyline: [
          { x: -1.0, y: 12.4 }, { x: 3.5, y: 11.7 },
          { x: 8.0, y: 12.3 }, { x: 13.8, y: 11.1 }
        ],
        halfPlane: true,
        plateauSide: 1,
        heightH: 8,
        baseH: 0,
        slopeClamp: Infinity,
        kind: "ground",
        bounds: { x: 0, y: 9, w: 14, d: 5 }
      })
    ], {
      routeRelationship: "the primary switchback rounds the open right end",
      qualityLock: "one broken scarp only; never repeat it as parallel strata"
    }),
    /* R1-07 is intentional here. A mountainside road grades through 1h neighbours; R1-09 is the
       constructed retaining-terrace piece and would turn every legal rise into a curb. */
    terrainFeaturePiece("fft-switchback", "R1-07", "cut-and-fill switchback", [
      terrainFeatureOp("graded-path", "set", {
        polyline: switchback,
        widthCells: 2.4,
        shoulderCells: 2.25,
        surfaceKind: "switchback-trail",
        slopeClamp: 1,
        kind: "ground"
      }, "switchback-trail")
    ], {
      routeType: "switchback",
      hairpins: 3,
      construction: "three uphill traverses, cut/fill shoulders, broad turning landings"
    }),
    terrainFeaturePiece("fft-gully", "R1-03", "direct gully climb", [
      terrainFeatureOp("graded-path", "set", {
        polyline: gully,
        widthCells: 1.15,
        shoulderCells: 1.4,
        surfaceKind: "gully-route",
        slopeClamp: 1,
        kind: "ground"
      }, "gully-route")
    ], {
      routeType: "gully",
      tacticalCost: "shorter and narrower; ends below the crown and requires a final climb"
    })
  ];
  return terrainFeatureSpecBase("fft-hillside-switchback-proof", seed, extent, pieces, {
    featureId: "FFT-H01",
    featureScale: "battlefield",
    quietSurfaceMinimumShare: 0.23,
    macroGraph: {
      nodes: [
        { id: "lower-approach", heightBandH: [0, 1], role: "deployment" },
        { id: "lower-bench", heightBandH: [2, 4], role: "first fighting surface" },
        { id: "middle-bench", heightBandH: [5, 8], role: "reverse-cover and route crossing" },
        { id: "saddle", heightBandH: [9, 10], role: "alternate gully arrival" },
        { id: "high-overlook", heightBandH: [11, 12], role: "objective and observation" }
      ],
      routes: [
        { id: "fft-switchback", from: "lower-approach", to: "high-overlook",
          kind: "walk", hairpins: 3 },
        { id: "fft-gully", from: "lower-approach", to: "saddle",
          kind: "narrow climb", hairpins: 0 }
      ]
    },
    tacticalGrammar: {
      profile: "fft-hillside-switchback",
      verticalTravelH: 12,
      verticalTravelFeet: 30,
      primaryRoutePieceId: "fft-switchback",
      alternateRoutePieceId: "fft-gully",
      fightingElevationZones: 5,
      highMassCameraBand: "far"
    }
  });
}

function terrainMarkedRouteReport(field, surfaceKind){
  var route = field.cells.filter(function(c){
    return c.inPlayfield && c.standable && c.surface === surfaceKind;
  });
  if(!route.length){
    return { surfaceKind: surfaceKind, cells: 0, minH: null, maxH: null,
      verticalTravelH: 0, connectedLowToHigh: false, maxInternalStepH: null, ok: false };
  }
  var routeSet = {};
  route.forEach(function(c){ routeSet[c.index] = true; });
  var minH = route.reduce(function(m, c){ return Math.min(m, c.h); }, Infinity);
  var maxH = route.reduce(function(m, c){ return Math.max(m, c.h); }, -Infinity);
  var roots = route.filter(function(c){ return c.h === minH; }).map(function(c){ return c.index; });
  var seen = {}, stack = roots.slice(), maxStep = 0;
  roots.forEach(function(i){ seen[i] = true; });
  while(stack.length){
    var i = stack.pop();
    (field.walkAdj[i] || []).forEach(function(j){
      if(!routeSet[j]) return;
      maxStep = Math.max(maxStep, Math.abs(field.cells[i].h - field.cells[j].h));
      if(!seen[j]){ seen[j] = true; stack.push(j); }
    });
  }
  var connected = route.some(function(c){ return c.h === maxH && seen[c.index]; });
  return {
    surfaceKind: surfaceKind,
    cells: route.length,
    minH: minH,
    maxH: maxH,
    verticalTravelH: maxH - minH,
    connectedLowToHigh: connected,
    maxInternalStepH: maxStep,
    ok: connected && maxStep <= TERRAIN_GRID_LAW.walkableStepQuanta
  };
}

function terrainQuietSurfaceReport(field){
  var live = field.cells.filter(function(c){ return c.inPlayfield && c.standable; });
  var quiet = live.filter(function(c){ return c.localSlopeDeg <= 0.0001; });
  var byBand = {};
  quiet.forEach(function(c){ byBand[c.h] = (byBand[c.h] || 0) + 1; });
  return {
    standableCells: live.length,
    quietCells: quiet.length,
    quietShare: live.length ? quiet.length / live.length : 0,
    quietHeightBands: Object.keys(byBand).map(Number).sort(function(a, b){ return a - b; }),
    byHeight: byBand
  };
}

function terrainFftHillsideSceneBuild(seed){
  var s = seed == null ? terrainSeedFrom("cl-f09-fft-hillside") : (seed >>> 0);
  var spec = terrainFftHillsideSpec(s);
  var field = terrainFieldBuild(spec);
  var switchback = terrainMarkedRouteReport(field, "switchback-trail");
  var gully = terrainMarkedRouteReport(field, "gully-route");
  var quiet = terrainQuietSurfaceReport(field);
  return {
    sceneId: "fft-hillside-proof",
    featureBook: CL_F08_TERRAIN_FEATURE_BOOK,
    featureId: spec.featureId,
    spec: spec,
    fields: [field],
    primary: field,
    structures: [],
    cameraLaw: TERRAIN_DEFENSIVE_CAMERA_LAW,
    tacticalGrammar: spec.tacticalGrammar,
    macroGraph: spec.macroGraph,
    routeReport: { switchback: switchback, gully: gully },
    quietSurfaceReport: quiet
  };
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
  version: 3,
  status: "AUTHORED FORM-LANGUAGE BASELINE + FFT VERTICAL BATTLEFIELD PROOF",
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
    }),
    Object.freeze({
      id: "fft-hillside-proof", capture: 11, label: "FFT hillside and switchback",
      lightRecipeId: "daylit",
      claim: "thirty feet of vertical travel across five elevation zones, a walkable switchback, "
        + "and a shorter gully climb"
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
  if(sceneId === "fft-hillside-proof") return terrainFftHillsideSceneBuild(s);
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
  var hillside = terrainFeatureSceneBuild("fft-hillside-proof", s);
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
  var quietCells = hillside.primary.cells.filter(function(c){
    return c.inPlayfield && c.standable && c.localSlopeDeg <= 0.0001;
  });
  var zoneCoverage = hillside.macroGraph.nodes.map(function(node){
    var count = quietCells.filter(function(c){
      return c.h >= node.heightBandH[0] && c.h <= node.heightBandH[1];
    }).length;
    return { id: node.id, quietCells: count, covered: count > 0 };
  });
  var hillsideReport = {
    verticalTravelH: hillside.primary.metrics.maxH - hillside.primary.metrics.minH,
    verticalTravelFeet: (hillside.primary.metrics.maxH - hillside.primary.metrics.minH)
      * TERRAIN_GRID_LAW.verticalQuantumFeet,
    switchback: hillside.routeReport.switchback,
    gully: hillside.routeReport.gully,
    quietSurfaceShare: Number(hillside.quietSurfaceReport.quietShare.toFixed(4)),
    quietSurfaceMinimumShare: hillside.spec.quietSurfaceMinimumShare,
    quietHeightBands: hillside.quietSurfaceReport.quietHeightBands,
    zoneCoverage: zoneCoverage,
    faces: hillside.primary.metrics.faces,
    scarpYRange: hillside.primary.faces.reduce(function(range, face){
      var hi = hillside.primary.cells[face.highIndex];
      var lo = hillside.primary.cells[face.lowIndex];
      range[0] = Math.min(range[0], hi.y, lo.y);
      range[1] = Math.max(range[1], hi.y, lo.y);
      return range;
    }, [Infinity, -Infinity])
  };
  var hillsideOk = hillsideReport.verticalTravelH >= 12
    && hillsideReport.switchback.ok && hillsideReport.switchback.verticalTravelH >= 12
    && hillsideReport.gully.ok && hillsideReport.gully.verticalTravelH >= 10
    && hillsideReport.quietSurfaceShare >= hillsideReport.quietSurfaceMinimumShare
    && zoneCoverage.every(function(zone){ return zone.covered; })
    && hillsideReport.faces > 0 && hillsideReport.faces <= 20
    && hillsideReport.scarpYRange[1] - hillsideReport.scarpYRange[0] <= 3;
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
    hillside: hillsideReport,
    rows: rows,
    ok: illegal.length === 0
      && smallCount === 4 && largeCount === 4 && defensiveCount === 2
      && uniqueCount === rows.length
      && ridgeQuietShare >= ridge.tacticalGrammar.quietGroundMinimumShare
      && gateQuietShare >= gate.tacticalGrammar.quietGroundMinimumShare
      && JSON.stringify(gateApproachH) === JSON.stringify([4, 3, 2, 1, 0])
      && defensive.gateStructuresGrounded
      && gate.cameraReport.ok && gate.cameraReport.maxStoreys > 2
      && hillsideOk
  };
}
