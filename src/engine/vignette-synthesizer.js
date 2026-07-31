/* GENESIS MODULE — src/engine/vignette-synthesizer.js
   Golden Site Wave 2: first shared end-to-end compact vignette compiler.

   Pure engine data. No DOM, THREE, camera state, world mutation, Math.random, or production asset
   lookup. Typed program grammars contribute relational obligations; the shared compiler owns the
   bounded candidate/score/repair, surface-demand, proxy resolution, projection, and receipt path.

   Call-time deps: vignette-observatory.js, terrain-field.js, terrain-features.js,
   terrain-expression.js. */

const GOLDEN_VIGNETTE_SYNTH_VERSION = "golden-vignette-synthesizer/1";
const GOLDEN_VIGNETTE_RECEIPT_VERSION = 1;
const GOLDEN_VIGNETTE_MAX_CANDIDATES = 4;
const GOLDEN_VIGNETTE_MAX_REPAIR_PASSES = 1;

const GOLDEN_VIGNETTE_HARD_REJECTIONS = Object.freeze([
  "INVALID_REQUEST",
  "UNSUPPORTED_PROGRAM_GRAMMAR",
  "MISSING_REQUIRED_ROLE",
  "MISSING_REQUIRED_ZONE",
  "DISCONNECTED_REQUIRED_CIRCUIT",
  "INSUFFICIENT_PLAN_CHOICE",
  "SPRAWLING_MATERIALIZATION_WINDOW",
  "INDEPENDENT_TILE_TERRAIN",
  "DIAGONAL_ZIPPER",
  "HEIGHT_FLATTENED",
  "UNOWNED_HARD_FACE",
  "ILLEGAL_WALK_EDGE",
  "UNREACHABLE_REQUIRED_ZONE",
  "NATURAL_CONTINUITY_FAILURE",
  "FOUR_BEARING_FAILURE",
  "FALSE_CONTEXT_ROUTE",
  "TRANSFORM_REPLACED_HOST",
  "RANDOM_CONDITION",
  "WHOLE_SITE_DONOR",
  "CAMERA_MUTATED_PLAN",
  "COMBAT_REGENERATED_PLAN"
]);

const GOLDEN_VIGNETTE_REPAIR_OPERATORS = Object.freeze([
  "WIDEN_GRADED_ROUTE",
  "MOVE_TALL_MASS_FAR",
  "OPEN_REQUIRED_THRESHOLD",
  "RESTORE_QUIET_GROUND"
]);

const GOLDEN_VIGNETTE_SURFACE_ROLES = Object.freeze([
  "WALKABLE_TOP",
  "NATURAL_SLOPE",
  "CUT_FACE",
  "RETAINING_FACE",
  "WALL_FIELD",
  "CROWN_COPING",
  "JAMB_REVEAL",
  "ROOF_DECK",
  "WATERLINE_EDGE",
  "UNDERSIDE_SUPPORT",
  "MOUNT_FACE",
  "SCENERY_FACE"
]);

const GOLDEN_VIGNETTE_WAVE2_SCENES = Object.freeze([
  Object.freeze({
    id: "gv-w2-guard-post-day",
    label: "Guard Post · shoulder overlook · day",
    lightRecipeId: "golden-site-daylit",
    presentationLightMode: "day",
    neutralizeHostRig: false
  }),
  Object.freeze({
    id: "gv-w2-guard-post-night",
    label: "Guard Post · shoulder overlook · night",
    lightRecipeId: "moonlit",
    presentationLightMode: "night",
    neutralizeHostRig: false
  })
]);

const GOLDEN_VIGNETTE_WAVE2_SCENE_IDS = Object.freeze(
  GOLDEN_VIGNETTE_WAVE2_SCENES.map(function(scene){ return scene.id; }));

const GOLDEN_VIGNETTE_WAVE2_FIXTURE = Object.freeze({
  id: "golden-vignette-wave2",
  version: 1,
  status: "ACTIVE — GATE W2",
  proof: "AF-GV-8",
  question: "Can one shared compiler preserve Tavern identity and synthesize a compact Guard Post?",
  scenes: GOLDEN_VIGNETTE_WAVE2_SCENES
});

function gvsClone(value){
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function gvsUnique(values){
  return Array.from(new Set((values || []).filter(function(value){
    return value != null && value !== "";
  })));
}

function gvsClamp(value, low, high){
  return Math.max(low, Math.min(high, value));
}

function gvsRound(value, places){
  var n = Math.pow(10, places == null ? 4 : places);
  return Math.round(value * n) / n;
}

function gvsSubSeed(rootSeed, label){
  return vignetteSeedFrom([GOLDEN_VIGNETTE_SYNTH_VERSION, String(rootSeed >>> 0), label]);
}

function gvsSubRng(rootSeed, label){
  return vignetteAuditRng(gvsSubSeed(rootSeed, label));
}

function gvsSourceFactRefs(request){
  var refs = [];
  (request.sourceProvenance || []).forEach(function(source){
    (source.factIds || []).forEach(function(factId){ refs.push(factId); });
  });
  return gvsUnique(refs);
}

function goldenVignettePlanFingerprint(plan){
  var copy = gvsClone(plan) || {};
  delete copy.planFingerprint;
  return vignetteFingerprint(copy);
}

function goldenVignetteReceiptFingerprint(receipt){
  var copy = gvsClone(receipt) || {};
  delete copy.receiptFingerprint;
  return vignetteFingerprint(copy);
}

/* Fixture constructors are audit/dev inputs, not synthesis branches. Runtime compilation below
   sees only VignetteRequestV1 owners and obligations. */
function goldenVignetteWave2FixtureRequest(fixtureKind, seed, opts){
  var s = seed >>> 0;
  var options = opts || {};
  if(fixtureKind === "tavern"){
    var tavernRaw = {
      environment: "urban",
      setup: { type: "Tavern / Noodle Bar", district: "The Dorsal Market" },
      venue: "The Golden Dolphin",
      typedProgram: "Noodle Bar",
      formerUse: "self-working workshop",
      realm: options.realm || "chrome"
    };
    return vignetteRequestFromVenue(tavernRaw, {
      requestId: options.requestId || "wave2:tavern:" + s,
      rootSeed: s,
      seedNamespace: "wave2/tavern/" + s,
      sourceRef: options.sourceRef || "Reference/Tavern-Study/ROLL-RECEIPTS.json#TVR-CHROME-04",
      sourceTreatment: "HARD_CANON",
      siteId: options.siteId || "venue-the-golden-dolphin",
      persistenceKey: options.persistenceKey || "venue-the-golden-dolphin",
      programRef: "Noodle Bar",
      operatingState: "operating",
      substrateOwner: "UrbanGroundSubstrate",
      scaleOwners: ["HumanScale"],
      requiredRoles: [
        "public-arrival", "public-common", "service-threshold", "supply-waste",
        "responsible-host", "quiet-social-floor", "source-backed-light",
        "former-use-work-trace", "retreat"
      ],
      optionalRoles: ["lodging"],
      purpose: "ordinary-venue-social-and-escalation",
      quietSpace: true,
      encounterMode: "social-with-forceful-escalation",
      objectiveRefs: ["responsible-host", "service-threshold"],
      deploymentRefs: ["public-arrival"],
      retreatRequired: true,
      promotionPolicy: "promote-committed-plan-without-regeneration",
      presentationExtent: "compact-interior-window",
      bodyEnvelopes: ["Small", "Medium", "Large"],
      verticalUnit: "2.5-foot-h",
      budgets: {
        cells: 120, activeWindows: 1, maxCandidates: 4, maxRepairPasses: 1,
        geometry: "proxy-first", assets: "proxy-first", lights: 3, drawCalls: 40,
        camera: {
          permittedBearings: [0, 1, 2, 3],
          pitchEnvelope: "production-quarter-turn",
          distanceEnvelope: "compact-vignette",
          protectedApproachSilhouettes: ["public-arrival", "service-threshold"],
          occlusionLimits: "required-circuits-remain-readable"
        }
      }
    });
  }
  if(fixtureKind === "guard-post"){
    var guardRaw = {
      environment: "wilderness",
      setup: { type: "mist-shrouded mountain pass", biome: "upland mountain pass" },
      segments: [{
        isFinale: true,
        feature: {
          name: "Guard Post",
          flavor: "Old operating fortification controlling a through-road on an uphill shoulder"
        },
        areaType: "through-road shoulder overlook"
      }],
      context: {
        fortification: true,
        construction: "Bone & Sinew",
        operatingState: "old operating post"
      }
    };
    return vignetteRequestFromWalk(guardRaw, {
      kind: "raw-walk",
      family: "wilderness",
      requestId: options.requestId || "wave2:guard-post:" + s,
      rootSeed: s,
      seedNamespace: "wave2/guard-post/" + s,
      sourceRef: options.sourceRef
        || "Reference/Golden-Site-World-Context/ROLL-RECEIPTS.json#CTX-GP-19",
      sourceTreatment: "HARD_CANON",
      siteId: options.siteId || ("guard-post-" + s),
      persistenceKey: options.persistenceKey || ("guard-post-" + s),
      programRef: "route-control shoulder overlook",
      operatingState: "operating-old-maintained",
      substrateOwner: "HighReliefNaturalSubstrate",
      scaleOwners: ["HumanScale", "CompactBattlefieldScale"],
      requiredRoles: [
        "entry", "quiet-approach", "through-road", "controlled-threshold", "guardroom",
        "work-readiness", "observation-face", "flat-deck", "defensive-edge",
        "secondary-flank", "exit-retreat"
      ],
      optionalRoles: ["alarm-signal", "maintenance-store"],
      purpose: "route-control-arrival-and-battle",
      quietSpace: true,
      encounterMode: "arrival-social-or-tactical",
      objectiveRefs: ["controlled-threshold", "flat-deck"],
      deploymentRefs: ["entry", "secondary-flank"],
      retreatRequired: true,
      promotionPolicy: "promote-committed-plan-without-regeneration",
      requiredSubstrateFeatures: [
        "connected-upland-shoulder", "graded-through-road", "localized-cut-face"
      ],
      forbiddenSubstrateFeatures: [
        "independent-tile-relief", "regular-sedimentary-bands", "diagonal-zipper"
      ],
      approachFacts: ["through-road climbs into old operating checkpoint"],
      connectionRefs: ["road-near", "road-far"],
      presentationExtent: "compact-outdoor-vignette",
      bodyEnvelopes: ["Small", "Medium", "Large"],
      verticalUnit: "2.5-foot-h",
      budgets: {
        cells: 440, activeWindows: 1, maxCandidates: 4, maxRepairPasses: 1,
        geometry: "field-plus-program-construction", assets: "proxy-first",
        lights: 5, drawCalls: 90,
        camera: {
          permittedBearings: [0, 1, 2, 3],
          pitchEnvelope: "production-quarter-turn",
          distanceEnvelope: "compact-vignette",
          protectedApproachSilhouettes: ["through-road", "controlled-threshold", "flat-deck"],
          occlusionLimits: "no-bearing-loses-all-three-plans"
        }
      }
    });
  }
  throw new Error("goldenVignetteWave2FixtureRequest: unknown fixture kind " + fixtureKind);
}

function gvsProgramGrammar(request){
  var owner = request && request.hostProgram && request.hostProgram.owner;
  if(owner === "DefenseRouteControlHost"){
    return {
      id: "shoulder-route-control",
      kind: "outdoor-terrain-construction",
      requiredZoneRoles: [
        "entry", "quiet-approach", "through-road", "controlled-threshold", "guardroom",
        "work-readiness", "observation-face", "flat-deck", "defensive-edge",
        "secondary-flank", "exit-retreat"
      ],
      minimumPlans: 3,
      minimumReliefH: 8,
      maximumWindowCells: 440
    };
  }
  if(owner === "HospitalityEntertainmentVenue" || owner === "HospitalityVenue"){
    return {
      id: "public-service-venue",
      kind: "interior-program",
      requiredZoneRoles: [
        "public-arrival", "public-common", "service-threshold", "supply-waste",
        "responsible-host", "quiet-social-floor", "source-backed-light",
        "former-use-work-trace", "retreat"
      ],
      minimumPlans: 2,
      minimumReliefH: 0,
      maximumWindowCells: 120
    };
  }
  return null;
}

function goldenVignetteIdentityReservations(request){
  var grammar = gvsProgramGrammar(request);
  if(!grammar) return [];
  var factRefs = gvsSourceFactRefs(request);
  return grammar.requiredZoneRoles.map(function(role, index){
    var priority = /arrival|threshold|road|deck|public-common/.test(role) ? "hero"
      : /light|host|observation|guardroom|former-use/.test(role) ? "supporting" : "ordinary";
    return {
      reservationId: request.requestId + ":identity:" + String(index + 1).padStart(2, "0")
        + ":" + role,
      planRef: "uncommitted:" + request.requestId,
      sourceFactRefs: factRefs.slice(),
      semanticRole: role,
      communicationObligation: "make " + role + " recognizable without inventing a new mechanic",
      visibilityPriority: priority,
      interactionPriority: /threshold|host|light|barrier|deck/.test(role) ? "interactive" : "readable",
      eligibleProjectionKinds: ["GEOMETRY", "MATERIAL", "TRIM", "DECAL", "SPRITE", "PROXY"],
      fallbackRequirement: "truthful labeled proxy preserving role, envelope, contact, and access"
    };
  });
}

function gvsRectCells(x, y, w, d){
  var out = [];
  for(var yy = y; yy < y + d; yy++) for(var xx = x; xx < x + w; xx++){
    out.push({ x: xx, y: yy });
  }
  return out;
}

function gvsManhattanPath(from, to, horizontalFirst){
  var out = [{ x: from.x, y: from.y }];
  var x = from.x, y = from.y;
  function walkX(){
    while(x !== to.x){ x += x < to.x ? 1 : -1; out.push({ x: x, y: y }); }
  }
  function walkY(){
    while(y !== to.y){ y += y < to.y ? 1 : -1; out.push({ x: x, y: y }); }
  }
  if(horizontalFirst){ walkX(); walkY(); } else { walkY(); walkX(); }
  return out;
}

function gvsTavernCandidate(request, seed, index, repair){
  var rng = gvsSubRng(seed, "candidate:" + index + (repair ? ":repair" : ""));
  var ex = 10, ey = 8;
  var serviceLeft = rng() < 0.5;
  var serviceWidth = 3 + (rng() > 0.72 ? 1 : 0);
  var publicDepth = 4 + (rng() > 0.48 ? 1 : 0);
  var sx = serviceLeft ? 0 : ex - serviceWidth;
  var publicX = serviceLeft ? serviceWidth : 0;
  var publicW = ex - serviceWidth;
  var arrivalX = publicX + Math.floor(publicW / 2);
  var hostX = serviceLeft ? serviceWidth - 1 : ex - serviceWidth;
  var serviceDoor = { x: hostX, y: 3 };
  var publicDoor = { x: arrivalX, y: ey - 1 };
  var backDoor = { x: serviceLeft ? 1 : ex - 2, y: 0 };
  var zones = [
    { id: "zone-public-arrival", role: "public-arrival", cells: [publicDoor] },
    { id: "zone-public-common", role: "public-common",
      cells: gvsRectCells(publicX, ey - publicDepth, publicW, publicDepth) },
    { id: "zone-service-threshold", role: "service-threshold", cells: [serviceDoor] },
    { id: "zone-supply-waste", role: "supply-waste",
      cells: gvsRectCells(sx, 0, serviceWidth, 2) },
    { id: "zone-responsible-host", role: "responsible-host",
      cells: [{ x: hostX, y: 4 }] },
    { id: "zone-quiet-social-floor", role: "quiet-social-floor",
      cells: gvsRectCells(publicX + 1, Math.max(2, ey - publicDepth), Math.max(2, publicW - 2), 2) },
    { id: "zone-source-backed-light", role: "source-backed-light",
      cells: [{ x: publicX + Math.floor(publicW / 2), y: 4 }] },
    { id: "zone-former-use-work-trace", role: "former-use-work-trace",
      cells: [{ x: serviceLeft ? 1 : ex - 2, y: 2 }] },
    { id: "zone-retreat", role: "retreat", cells: [backDoor, publicDoor] }
  ];
  var social = gvsManhattanPath(publicDoor, { x: hostX, y: 4 }, false);
  var service = gvsManhattanPath(backDoor, serviceDoor, false);
  var escalation = gvsManhattanPath(publicDoor, backDoor, index % 2 === 0);
  var plans = [
    {
      id: "plan-public-host",
      name: "Enter the common room and deal with the responsible host",
      route: social,
      routeCost: social.length - 1,
      tradeoff: "public and observed; direct access to the venue's social purpose"
    },
    {
      id: "plan-service-retreat",
      name: "Use the service circuit and back threshold",
      route: service,
      routeCost: service.length - 1,
      tradeoff: "narrow and controlled; preserves a distinct supply and retreat circuit"
    },
    {
      id: "plan-forceful-escalation",
      name: "Promote the committed floor to tactical use",
      route: escalation,
      routeCost: escalation.length - 1,
      tradeoff: "crosses the public floor; activates reservations without regenerating rooms"
    }
  ];
  return {
    candidateId: request.requestId + ":candidate:" + index + (repair ? ":repair" : ""),
    grammarId: "public-service-venue",
    topologyFamily: "public-room-with-service-spine",
    seed: gvsSubSeed(seed, "candidate:" + index + (repair ? ":repair" : "")),
    window: {
      id: request.requestId + ":window",
      extentCells: { x: ex, y: ey },
      cellCount: ex * ey,
      activeObligations: zones.map(function(zone){ return zone.role; }),
      quietSpaceRole: "quiet-social-floor",
      stableFrontiers: ["public-arrival", "service-back-threshold"]
    },
    parameters: {
      serviceSide: serviceLeft ? "left" : "right",
      serviceWidth: serviceWidth,
      publicDepth: publicDepth
    },
    terrain: null,
    structures: [{
      id: "venue-shell",
      role: "venue-shell",
      storeys: 2,
      baseH: 0,
      footprint: { x: 0, y: 0, w: ex, d: ey },
      openings: ["public-arrival", "service-back-threshold"]
    }],
    zones: zones,
    circuits: {
      social: social,
      service: service,
      tacticalDormant: escalation
    },
    plans: plans,
    causalState: [{
      id: "former-use-work-trace",
      causeRefs: gvsSourceFactRefs(request),
      expression: "localized retained workshop trace at the service edge"
    }]
  };
}

function gvsGuardCandidate(request, seed, index, repair){
  var rng = gvsSubRng(seed, "candidate:" + index + (repair ? ":repair" : ""));
  var extent = { x: 20, y: 22 };
  var roadShift = Math.floor(rng() * 3) - 1;
  var crownLift = rng() > 0.68 ? 1 : 0;
  var flankHook = Math.floor(rng() * 3) - 1;
  var roomShift = rng() > 0.5 ? 1 : 0;
  /* Family mutation is a bounded spatial sentence, not a scatter value. These three envelopes
     preserve the same operated-threshold obligations while materially changing the watchhouse
     proportion and crown-deck silhouette. The namespace is independent of candidate/repair order,
     so a route repair cannot silently turn one building family into another. */
  var familyLayoutVariant = gvsSubSeed(seed, "guard-family-layout-v67") % 3;
  /* One-cell differences passed the structural-distinctness gate but collapsed to nearly the
     same isometric silhouette. Keep the committed square hero untouched; changed-family variants
     now add a complete two-cell bay along ONE axis. That is still a bounded watchhouse rather than
     a second building, but it changes wall rhythm, roof proportion, room depth, foundation contact,
     and the relationship to its crown deck as one architectural sentence. */
  var guardWidthCells = [4, 4, 6][familyLayoutVariant];
  var guardDepthCells = [4, 6, 4][familyLayoutVariant];
  var guardFootprintX = 10 + roomShift - guardWidthCells;
  var guardFootprintY = guardDepthCells > 4 ? 3 : 4;
  var deckLayouts = [
    { x: 2 + roomShift, y: 1, w: 6, d: 3, sentence: "balanced crown deck" },
    { x: 1 + roomShift, y: 1, w: 8, d: 3, sentence: "long signal gallery" },
    { x: 3 + roomShift, y: 0, w: 5, d: 5, sentence: "deep compact crown terrace" }
  ];
  var deckLayout = deckLayouts[familyLayoutVariant];
  var widthBonus = repair ? 0.8 : 0;
  var shoulderBonus = repair ? 0.7 : 0;
  /* Candidate zero deliberately tests the compact edge of the flank envelope. It is not a bad
     seed patch: every request's bounded search gets the same aggressive proposal, and the ordinary
     route validator decides whether the named widening repair is required. */
  var flankWidth = index === 0 && !repair ? 0.18 : 1.4 + widthBonus * 0.35;

  var road = [
    { x: 12 + roadShift, y: 21, h: 0, widthCells: 2.8 + widthBonus },
    { x: 13 + roadShift, y: 17, h: 0, widthCells: 2.6 + widthBonus },
    { x: 13 + roadShift, y: 13, h: 1, widthCells: 2.5 + widthBonus },
    { x: 12 + roadShift, y: 10, h: 2, widthCells: 2.35 + widthBonus },
    { x: 13 + roadShift, y: 6, h: 3, widthCells: 2.45 + widthBonus },
    { x: 12 + roadShift, y: 0, h: 4, widthCells: 2.7 + widthBonus }
  ];
  var flank = [
    { x: 3 + flankHook, y: 21, h: 0, widthCells: flankWidth },
    { x: 4 + flankHook, y: 17, h: 1, widthCells: flankWidth },
    { x: 3 + flankHook, y: 14, h: 2, widthCells: flankWidth },
    { x: 5 + flankHook, y: 11, h: 4, widthCells: flankWidth + 0.08 },
    { x: 4 + flankHook, y: 8, h: 5, widthCells: flankWidth + 0.08 },
    { x: 6 + flankHook, y: 5, h: 7, widthCells: flankWidth + 0.14 },
    { x: 4 + flankHook, y: 2, h: 9 + crownLift, widthCells: flankWidth + 0.22 }
  ];
  road = road.map(function(point){
    return Object.assign({}, point, { x: gvsClamp(point.x, 1, extent.x - 2) });
  });
  flank = flank.map(function(point){
    return Object.assign({}, point, { x: gvsClamp(point.x, 1, 8) });
  });

  var shoulderHeights = [
    [10 + crownLift, 10 + crownLift, 8 + crownLift, 4, 3, 2],
    [9 + crownLift, 9 + crownLift, 7 + crownLift, 3, 3, 2],
    [7, 7, 6, 3, 2, 1],
    [4, 5, 4, 2, 1, 1],
    [2, 2, 2, 1, 0, 0],
    [0, 0, 0, 0, 0, 0]
  ];
  var retainingCells = gvsRectCells(10 + roomShift, 6, 1, 7);
  var pieces = [
    terrainFeaturePiece("gv-shoulder-mass", "R1-07", "connected upland shoulder", [
      terrainFeatureOp("control-surface", "set", {
        columns: [0, 4, 8, 12, 16, 19],
        rows: [0, 4, 8, 12, 16, 21],
        heightsH: shoulderHeights,
        slopeClamp: 1,
        kind: "ground"
      })
    ], {
      macroNodes: ["lower-approach", "road-cut", "working-shelf", "observation-crown"],
      qualityLock: "one connected shoulder, never independent tile relief"
    }),
    /* One causal break where the road excavation meets the uphill shoulder. It ends before both
       routes, so it cannot become a contour-wide curb or a repeated sedimentary band. */
    terrainFeaturePiece("gv-localized-road-cut", "R1-07", "localized exposed shoulder cut", [
      terrainFeatureOp("ridge", "max", {
        polyline: [
          { x: -1, y: 9.2 }, { x: 3.6, y: 8.6 },
          { x: 7.2, y: 9.0 }, { x: 9.2, y: 8.1 }
        ],
        halfPlane: true,
        plateauSide: -1,
        heightH: 9 + crownLift,
        baseH: 0,
        slopeClamp: Infinity,
        kind: "ground",
        bounds: { x: 0, y: 5, w: 9, d: 6 }
      })
    ], {
      qualityLock: "one broken road-cut face only; never repeat it as parallel strata",
      routeRelationship: "through-road passes the open right end; flank rounds the left shoulder"
    }),
    terrainFeaturePiece("gv-guardroom-foundation", "R1-09",
      "localized level bearing shelf negotiated into the shoulder", [
      terrainFeatureOp("control-surface", "set", {
        columns: [0, 19],
        rows: [0, 21],
        heightsH: [
          [7 + crownLift, 7 + crownLift],
          [7 + crownLift, 7 + crownLift]
        ],
        slopeClamp: Infinity,
        kind: "ground",
        bounds: {
          x: guardFootprintX,
          y: guardFootprintY,
          w: guardWidthCells,
          d: guardDepthCells + 1
        }
      })
    ], {
      construction: "one compact foundation shelf; the landform continues around it",
      qualityLock: "never extend the pad into a contour-wide terrace"
    }),
    terrainFeaturePiece("gv-through-road", "R1-07", "graded through-road cut into the shoulder", [
      terrainFeatureOp("graded-path", "set", {
        polyline: road,
        widthCells: 2.5 + widthBonus,
        shoulderCells: 1.5 + shoulderBonus,
        surfaceKind: "guard-through-road",
        slopeClamp: 1,
        kind: "ground"
      }, "guard-through-road")
    ], {
      routeType: "through-road",
      qualityLock: "road bends and narrows at the checkpoint; it is not painted beside the post"
    }),
    terrainFeaturePiece("gv-terrain-flank", "R1-07", "terrain flank around the shoulder", [
      terrainFeatureOp("graded-path", "set", {
        polyline: flank,
        widthCells: flankWidth,
        shoulderCells: 1.1 + shoulderBonus,
        surfaceKind: "guard-terrain-flank",
        slopeClamp: 1,
        kind: "ground"
      }, "guard-terrain-flank")
    ], {
      routeType: "terrain flank",
      qualityLock: "longer narrow timing route tied to the same shoulder"
    }),
    terrainFeaturePiece("gv-retaining-contact", "R1-09", "localized retained working shelf", [
      terrainFeatureOp("patch", "set", {
        cells: retainingCells,
        surfaceKind: "guard-retained-shelf"
      }, "guard-retained-shelf")
    ], {
      construction: "localized retaining contact only; no contour-wide curb"
    })
  ];
  if(familyLayoutVariant !== 0){
    /* The wider/deeper family envelopes overlap a different portion of the graded shoulder. The
       ordinary road and flank operations are allowed to reshape the surrounding terrain, but they
       may not re-sculpt the load-bearing footprint after it has been negotiated. This final bounded
       bearing operation exists only for non-hero family mutations; variant zero remains byte-for-
       byte the committed Site 1 plan. */
    pieces.push(terrainFeaturePiece(
      "gv-guardroom-foundation-family-bearing",
      "R1-09",
      "family-sized level bearing shelf after route negotiation",
      [
        terrainFeatureOp("control-surface", "set", {
          columns: [0, 19],
          rows: [0, 21],
          heightsH: [
            [7 + crownLift, 7 + crownLift],
            [7 + crownLift, 7 + crownLift]
          ],
          slopeClamp: Infinity,
          kind: "ground",
          bounds: {
            x: guardFootprintX,
            y: guardFootprintY,
            w: guardWidthCells,
            d: guardDepthCells
          }
        })
      ],
      {
        construction: "family-sized bearing correction after route grading",
        qualityLock: "only the occupied footprint is level; surrounding shoulder remains continuous"
      }
    ));
  }
  var spec = terrainFeatureSpecBase("gv-shoulder-route-control", seed, extent, pieces, {
    featureId: "GV-W2-GUARD",
    featureScale: "compact-vignette",
    quietSurfaceMinimumShare: 0.16,
    macroGraph: {
      nodes: [
        { id: "lower-approach", heightBandH: [0, 1], role: "entry and quiet deployment" },
        { id: "road-cut", heightBandH: [1, 4], role: "through-road and controlled threshold" },
        { id: "working-shelf", heightBandH: [4, 7], role: "guardroom and readiness" },
        { id: "observation-crown", heightBandH: [8, 11], role: "deck and defensive edge" }
      ],
      routes: [
        { id: "guard-through-road", from: "lower-approach", to: "road-cut", kind: "front/checkpoint" },
        { id: "guard-terrain-flank", from: "lower-approach", to: "observation-crown", kind: "terrain flank" }
      ]
    },
    tacticalGrammar: {
      profile: "shoulder-overlook-through-road",
      verticalTravelH: 9 + crownLift,
      routeSurfaces: [
        { id: "guard-through-road", minimumTravelH: 4 },
        { id: "guard-terrain-flank", minimumTravelH: 8 }
      ],
      minimumFaces: 1,
      maximumFaces: 90
    }
  });
  var field = terrainFieldBuild(spec);
  var roadReport = terrainMarkedRouteReport(field, "guard-through-road");
  var flankReport = terrainMarkedRouteReport(field, "guard-terrain-flank");
  var quietReport = terrainQuietSurfaceReport(field);

  function routeCells(surfaceKind){
    return field.cells.filter(function(cell){
      return cell.inPlayfield && cell.standable && cell.surface === surfaceKind;
    }).sort(function(a, b){ return b.y - a.y || a.x - b.x; });
  }
  var roadCells = routeCells("guard-through-road");
  var flankCells = routeCells("guard-terrain-flank");
  function nearestCell(x, y, filter){
    var best = null, bestDistance = Infinity;
    field.cells.forEach(function(cell){
      if(!cell.inPlayfield || !cell.standable || (filter && !filter(cell))) return;
      var distance = Math.abs(cell.x - x) + Math.abs(cell.y - y);
      if(distance < bestDistance || (distance === bestDistance && cell.index < best.index)){
        best = cell;
        bestDistance = distance;
      }
    });
    return best;
  }
  function ref(cell){ return cell ? { cellIndex: cell.index, x: cell.x, y: cell.y, h: cell.h } : null; }
  var roadNear = roadCells.length ? roadCells[0] : nearestCell(12, 21);
  var roadFar = roadCells.length ? roadCells[roadCells.length - 1] : nearestCell(12, 0);
  var flankNear = flankCells.length ? flankCells[0] : nearestCell(3, 21);
  var flankHigh = flankCells.length ? flankCells.reduce(function(a, b){ return b.h > a.h ? b : a; })
    : nearestCell(4, 2);
  var threshold = nearestCell(12 + roadShift, 10, function(cell){
    return cell.surface === "guard-through-road";
  });
  var guardRightX = guardFootprintX + guardWidthCells;
  var workShelf = familyLayoutVariant === 0
    ? nearestCell(10 + roomShift, 8)
    : nearestCell(guardRightX, guardFootprintY + guardDepthCells);
  var deckCell = familyLayoutVariant === 0
    ? nearestCell(4 + roomShift, 3)
    : nearestCell(
      deckLayout.x + Math.floor(deckLayout.w / 2),
      deckLayout.y + Math.floor(deckLayout.d / 2));
  var observationCell = familyLayoutVariant === 0
    ? nearestCell(7 + roomShift, 4)
    : nearestCell(guardRightX - 1, guardFootprintY);
  var defensiveEdge = familyLayoutVariant === 0
    ? nearestCell(7 + roomShift, 2)
    : nearestCell(deckLayout.x + deckLayout.w - 1, deckLayout.y);
  var guardroomCell = familyLayoutVariant === 0
    ? nearestCell(7 + roomShift, 6)
    : nearestCell(
      guardFootprintX + Math.floor(guardWidthCells / 2),
      guardFootprintY + Math.floor(guardDepthCells / 2));
  var roadPath = roadNear && roadFar ? terrainRouteSolve(field, roadNear.index, roadFar.index) : null;
  var frontPath = roadNear && threshold ? terrainRouteSolve(field, roadNear.index, threshold.index) : null;
  var flankPath = flankNear && flankHigh ? terrainRouteSolve(field, flankNear.index, flankHigh.index) : null;
  var deckPath = roadNear && deckCell ? terrainRouteSolve(field, roadNear.index, deckCell.index) : null;
  var zones = [
    { id: "zone-entry", role: "entry", cell: ref(roadNear) },
    { id: "zone-quiet-approach", role: "quiet-approach", cell: ref(nearestCell(15, 19)) },
    { id: "zone-through-road", role: "through-road", cell: ref(nearestCell(13 + roadShift, 14)) },
    { id: "zone-controlled-threshold", role: "controlled-threshold", cell: ref(threshold) },
    { id: "zone-guardroom", role: "guardroom", cell: ref(guardroomCell) },
    { id: "zone-work-readiness", role: "work-readiness", cell: ref(workShelf) },
    { id: "zone-observation-face", role: "observation-face", cell: ref(observationCell) },
    { id: "zone-flat-deck", role: "flat-deck", cell: ref(deckCell) },
    { id: "zone-defensive-edge", role: "defensive-edge", cell: ref(defensiveEdge) },
    { id: "zone-secondary-flank", role: "secondary-flank", cell: ref(flankNear) },
    { id: "zone-exit-retreat", role: "exit-retreat", cell: ref(roadFar) }
  ];
  function footprintMinimumH(footprint, fallback){
    var heights = [];
    for(var fy = footprint.y; fy < footprint.y + footprint.d; fy++){
      for(var fx = footprint.x; fx < footprint.x + footprint.w; fx++){
        var cell = field.cells[fy * field.extent.x + fx];
        if(cell && cell.inPlayfield) heights.push(cell.h);
      }
    }
    return heights.length ? Math.min.apply(null, heights) : fallback;
  }
  var guardFootprint = {
    x: guardFootprintX, y: guardFootprintY, w: guardWidthCells, d: guardDepthCells
  };
  var deckFootprint = {
    x: deckLayout.x, y: deckLayout.y, w: deckLayout.w, d: deckLayout.d
  };
  var retainingFootprint = { x: 10 + roomShift, y: 6, w: 1, d: 7 };
  var barrierFootprint = { x: 10 + roadShift, y: 9, w: 5, d: 1 };
  var guardBase = footprintMinimumH(guardFootprint, guardroomCell ? guardroomCell.h : 6);
  var deckBase = footprintMinimumH(deckFootprint, deckCell ? deckCell.h : 9);
  var structures = [
    {
      id: "guardroom",
      role: "guardroom",
      storeys: 2,
      baseH: guardBase,
      footprint: guardFootprint,
      opening: "road-and-apron-facing",
      conditionCause: "old operating post with maintained repairs"
    },
    {
      id: "observation-deck",
      role: "observation-deck",
      storeys: 1,
      baseH: deckBase,
      footprint: deckFootprint,
      opening: "road-facing-shuttered-observation",
      counterplay: "terrain flank reaches the crown behind the defensive edge"
    },
    {
      id: "retaining-run",
      role: "retaining-wall",
      storeys: 1,
      baseH: footprintMinimumH(retainingFootprint, Math.max(2, guardBase - 3)),
      footprint: retainingFootprint,
      opening: "localized breaks at road and flank landings"
    },
    {
      id: "controlled-barrier",
      role: "road-barrier",
      storeys: 1,
      baseH: footprintMinimumH(barrierFootprint, threshold ? threshold.h : 2),
      footprint: barrierFootprint,
      opening: "operable road barrier"
    }
  ];
  var cameraReport = terrainDefensiveCameraReport(structures, extent, TERRAIN_DEFENSIVE_CAMERA_LAW);
  var plans = [
    {
      id: "plan-front-checkpoint",
      name: "Take the front road through the controlled checkpoint",
      route: frontPath,
      routeCost: frontPath ? frontPath.length - 1 : Infinity,
      verticalTravelH: roadReport.verticalTravelH,
      tradeoff: "shortest and widest; observed by the guardroom and deck"
    },
    {
      id: "plan-terrain-flank",
      name: "Climb the shoulder flank and arrive behind the retained shelf",
      route: flankPath,
      routeCost: flankPath ? flankPath.length - 1 : Infinity,
      verticalTravelH: flankReport.verticalTravelH,
      tradeoff: "longer and narrower; exchanges speed for less threshold exposure"
    },
    {
      id: "plan-deck-timing",
      name: "Contest the observation crown by timing the road-to-deck ascent",
      route: deckPath,
      routeCost: deckPath ? deckPath.length - 1 : Infinity,
      verticalTravelH: deckPath && deckPath.length
        ? Math.abs(field.cells[deckPath[deckPath.length - 1]].h - field.cells[deckPath[0]].h) : 0,
      tradeoff: "highest commitment; the flank provides counterplay and a second arrival timing"
    }
  ];
  return {
    candidateId: request.requestId + ":candidate:" + index + (repair ? ":repair" : ""),
    grammarId: "shoulder-route-control",
    topologyFamily: "connected-shoulder-road-cut-working-shelf-crown",
    seed: gvsSubSeed(seed, "candidate:" + index + (repair ? ":repair" : "")),
    window: {
      id: request.requestId + ":window",
      extentCells: extent,
      cellCount: extent.x * extent.y,
      activeObligations: zones.map(function(zone){ return zone.role; }),
      quietSpaceRole: "quiet-approach",
      stableFrontiers: ["road-near", "road-far"]
    },
    parameters: {
      roadShift: roadShift,
      crownLiftH: crownLift,
      flankHook: flankHook,
      roomShift: roomShift,
      routeWidthRepair: widthBonus,
      flankWidthCells: flankWidth
    },
    terrain: {
      spec: spec,
      field: field,
      routeReport: { road: roadReport, flank: flankReport },
      quietSurfaceReport: quietReport,
      continuityReport: null,
      variationReport: null
    },
    structures: structures,
    cameraReport: cameraReport,
    zones: zones,
    circuits: {
      road: roadPath,
      flank: flankPath,
      deck: deckPath
    },
    plans: plans,
    causalState: [{
      id: "maintained-repair-chronology",
      causeRefs: gvsSourceFactRefs(request),
      expression: "localized retaining repair and replaced barrier members at active work surfaces"
    }]
  };
}

function gvsCandidateFor(request, grammar, seed, index, repair){
  var candidate;
  if(grammar.id === "public-service-venue"){
    candidate = gvsTavernCandidate(request, seed, index, repair);
  } else if(grammar.id === "shoulder-route-control"){
    candidate = gvsGuardCandidate(request, seed, index, repair);
  } else {
    throw new Error("gvsCandidateFor: unsupported grammar " + grammar.id);
  }
  var factRefs = gvsSourceFactRefs(request);
  candidate.plans.forEach(function(plan){ plan.sourceFactRefs = factRefs.slice(); });
  return candidate;
}

function gvsPathValid(path){
  if(!Array.isArray(path) || path.length < 2) return false;
  for(var i = 0; i + 1 < path.length; i++){
    if(typeof path[i] === "number" && typeof path[i + 1] === "number") continue;
    var a = path[i], b = path[i + 1];
    if(!a || !b || Math.abs(a.x - b.x) + Math.abs(a.y - b.y) !== 1) return false;
  }
  return true;
}

function gvsCandidateValidation(request, grammar, candidate, reservations){
  var rejections = [];
  var requestValidation = validateVignetteRequest(request);
  if(!requestValidation.ok) rejections.push("INVALID_REQUEST");
  if(candidate.window.cellCount > grammar.maximumWindowCells
      || (request.budgets.cells != null && candidate.window.cellCount > request.budgets.cells)){
    rejections.push("SPRAWLING_MATERIALIZATION_WINDOW");
  }
  var zoneRoles = candidate.zones.map(function(zone){ return zone.role; });
  grammar.requiredZoneRoles.forEach(function(role){
    var zone = candidate.zones.filter(function(item){ return item.role === role; })[0];
    if(!zone) rejections.push("MISSING_REQUIRED_ZONE");
    else if(candidate.terrain && !zone.cell) rejections.push("UNREACHABLE_REQUIRED_ZONE");
  });
  (request.materializationIntent.requiredRoles || []).forEach(function(role){
    if(zoneRoles.indexOf(role) < 0 && (request.hostProgram.requiredRoles || []).indexOf(role) >= 0
        && grammar.requiredZoneRoles.indexOf(role) >= 0){
      rejections.push("MISSING_REQUIRED_ROLE");
    }
  });
  if(reservations.length !== grammar.requiredZoneRoles.length) rejections.push("MISSING_REQUIRED_ROLE");
  var viablePlans = candidate.plans.filter(function(plan){
    return Number.isFinite(plan.routeCost) && gvsPathValid(plan.route);
  });
  if(viablePlans.length < grammar.minimumPlans) rejections.push("INSUFFICIENT_PLAN_CHOICE");
  if(candidate.terrain){
    var field = candidate.terrain.field;
    var reliefH = field.metrics.maxH - field.metrics.minH;
    if(reliefH < grammar.minimumReliefH) rejections.push("HEIGHT_FLATTENED");
    if(field.metrics.unownedFaces > 0) rejections.push("UNOWNED_HARD_FACE");
    if(field.metrics.illegalWalkEdges > 0) rejections.push("ILLEGAL_WALK_EDGE");
    if(field.metrics.unreachableStandableNonFlying > 0) rejections.push("UNREACHABLE_REQUIRED_ZONE");
    if(!candidate.terrain.routeReport.road.ok || !candidate.terrain.routeReport.flank.ok){
      rejections.push("DISCONNECTED_REQUIRED_CIRCUIT");
    }
    var allowedOps = ["control-surface", "graded-path", "patch", "ridge"];
    var terrainOps = [];
    (candidate.terrain.spec.pieces || []).forEach(function(piece){
      (piece.ops || []).forEach(function(op){ terrainOps.push(op.type); });
    });
    var ridgeOps = [];
    (candidate.terrain.spec.pieces || []).forEach(function(piece){
      (piece.ops || []).forEach(function(op){ if(op.type === "ridge") ridgeOps.push(op); });
    });
    if(terrainOps.some(function(type){ return allowedOps.indexOf(type) < 0; })
        || ridgeOps.length > 1
        || ridgeOps.some(function(op){ return !op.params.halfPlane || !op.params.bounds; })){
      rejections.push("INDEPENDENT_TILE_TERRAIN");
    }
    var flags = typeof terrainExpressionFlags === "function"
      ? terrainExpressionFlags("material", { shallowgrade: true, gradeId: "g3" }) : null;
    var continuity = flags && typeof terrainSurfaceContinuityReport === "function"
      ? terrainSurfaceContinuityReport(field, flags) : { ok: true, maxSharedBoundaryDelta: 0 };
    var variation = flags && typeof terrainSurfaceVariationReport === "function"
      ? terrainSurfaceVariationReport(field, flags) : {
        ok: true, distinctTangentPlanes: 1, responsiveJoinedPairs: 1
      };
    candidate.terrain.continuityReport = continuity;
    candidate.terrain.variationReport = variation;
    if(!continuity.ok) rejections.push("NATURAL_CONTINUITY_FAILURE");
    if(!variation.ok || variation.distinctTangentPlanes < 2) rejections.push("INDEPENDENT_TILE_TERRAIN");
    if(!candidate.cameraReport || !candidate.cameraReport.ok) rejections.push("FOUR_BEARING_FAILURE");
  }
  return {
    ok: rejections.length === 0,
    rejectionIds: gvsUnique(rejections),
    requestErrors: requestValidation.errors,
    viablePlanCount: viablePlans.length
  };
}

function gvsCandidateScores(grammar, candidate, reservations, validation){
  var plans = candidate.plans.filter(function(plan){ return Number.isFinite(plan.routeCost); });
  var costs = plans.map(function(plan){ return plan.routeCost; });
  var distinctCosts = gvsUnique(costs).length;
  var routeChoice = gvsClamp((validation.viablePlanCount / Math.max(1, grammar.minimumPlans))
    * (0.75 + 0.25 * distinctCosts / Math.max(1, plans.length)), 0, 1);
  var verticalBands = gvsUnique(plans.map(function(plan){ return plan.verticalTravelH || 0; })).length;
  var tacticalTension = gvsClamp(0.45 + 0.18 * Math.max(0, plans.length - 1)
    + 0.12 * Math.max(0, verticalBands - 1), 0, 1);
  var compositionHierarchy = candidate.terrain
    ? gvsClamp((candidate.terrain.field.metrics.maxH - candidate.terrain.field.metrics.minH) / 10, 0, 1)
    : gvsClamp((candidate.zones.length - 5) / 5, 0, 1);
  var quietSpace = candidate.terrain
    ? gvsClamp(candidate.terrain.quietSurfaceReport.quietShare / 0.2, 0, 1)
    : (candidate.zones.some(function(zone){ return zone.role === "quiet-social-floor"; }) ? 1 : 0);
  var identity = gvsClamp(reservations.length / Math.max(1, grammar.requiredZoneRoles.length), 0, 1);
  var fourBearing = candidate.terrain ? (candidate.cameraReport && candidate.cameraReport.ok ? 1 : 0.4) : 1;
  var continuity = candidate.terrain
    ? (candidate.terrain.continuityReport && candidate.terrain.continuityReport.ok ? 1 : 0)
    : 1;
  var assetCost = gvsClamp(1 - (candidate.structures.length * 0.055
    + grammar.requiredZoneRoles.length * 0.008), 0, 1);
  return {
    routeChoice: gvsRound(routeChoice),
    tacticalTension: gvsRound(tacticalTension),
    compositionHierarchy: gvsRound(compositionHierarchy),
    quietSpace: gvsRound(quietSpace),
    identity: gvsRound(identity),
    fourBearingLegibility: gvsRound(fourBearing),
    continuity: gvsRound(continuity),
    assetCost: gvsRound(assetCost)
  };
}

function gvsCandidateSummary(candidate, validation, scores, parentId, repairOperator){
  var field = candidate.terrain && candidate.terrain.field;
  return {
    candidateId: candidate.candidateId,
    parentCandidateId: parentId || null,
    repairOperator: repairOperator || null,
    topologyFamily: candidate.topologyFamily,
    hardPass: validation.ok,
    rejectionIds: validation.rejectionIds.slice(),
    measures: {
      windowCells: candidate.window.cellCount,
      zoneCount: candidate.zones.length,
      viablePlanCount: validation.viablePlanCount,
      routeCosts: candidate.plans.map(function(plan){
        return Number.isFinite(plan.routeCost) ? plan.routeCost : null;
      }),
      reliefH: field ? field.metrics.maxH - field.metrics.minH : 0,
      maximumHeightH: field ? field.metrics.maxH : 0,
      faces: field ? field.metrics.faces : 0,
      quietShare: candidate.terrain ? gvsRound(candidate.terrain.quietSurfaceReport.quietShare) : 1,
      distinctTangentPlanes: candidate.terrain && candidate.terrain.variationReport
        ? candidate.terrain.variationReport.distinctTangentPlanes : 0
    },
    scoreComponents: scores
  };
}

function gvsSelectionTuple(entry){
  var s = entry.scores;
  return [
    entry.validation.ok ? 1 : 0,
    entry.validation.viablePlanCount,
    s.routeChoice,
    s.tacticalTension,
    s.compositionHierarchy,
    s.quietSpace,
    s.identity,
    s.fourBearingLegibility,
    s.continuity,
    s.assetCost
  ];
}

function gvsTupleGreater(a, b){
  for(var i = 0; i < a.length; i++){
    if(a[i] > b[i]) return true;
    if(a[i] < b[i]) return false;
  }
  return false;
}

function goldenVignetteCandidateSet(request, opts){
  var options = opts || {};
  var grammar = gvsProgramGrammar(request);
  if(!grammar) return {
    grammar: null,
    reservations: [],
    candidates: [],
    summaries: [],
    repairs: [],
    selected: null,
    hardFailure: "UNSUPPORTED_PROGRAM_GRAMMAR"
  };
  var seed = Number(options.seed == null ? request.seedNamespace.rootSeed : options.seed) >>> 0;
  var reservations = goldenVignetteIdentityReservations(request);
  var maxCandidates = Math.min(
    request.budgets.maxCandidates || GOLDEN_VIGNETTE_MAX_CANDIDATES,
    GOLDEN_VIGNETTE_MAX_CANDIDATES
  );
  var entries = [];
  var summaries = [];
  var repairs = [];
  for(var index = 0; index < maxCandidates; index++){
    var candidate = gvsCandidateFor(request, grammar, seed, index, false);
    var validation = gvsCandidateValidation(request, grammar, candidate, reservations);
    var scores = gvsCandidateScores(grammar, candidate, reservations, validation);
    entries.push({ candidate: candidate, validation: validation, scores: scores });
    summaries.push(gvsCandidateSummary(candidate, validation, scores));
    if(!validation.ok && (request.budgets.maxRepairPasses || GOLDEN_VIGNETTE_MAX_REPAIR_PASSES) > 0
        && validation.rejectionIds.some(function(id){
          return id === "DISCONNECTED_REQUIRED_CIRCUIT"
            || id === "INSUFFICIENT_PLAN_CHOICE"
            || id === "UNREACHABLE_REQUIRED_ZONE";
        })){
      var repaired = gvsCandidateFor(request, grammar, seed, index, true);
      var repairedValidation = gvsCandidateValidation(request, grammar, repaired, reservations);
      var repairedScores = gvsCandidateScores(grammar, repaired, reservations, repairedValidation);
      entries.push({
        candidate: repaired,
        validation: repairedValidation,
        scores: repairedScores,
        parentCandidateId: candidate.candidateId,
        repairOperator: "WIDEN_GRADED_ROUTE"
      });
      summaries.push(gvsCandidateSummary(repaired, repairedValidation, repairedScores,
        candidate.candidateId, "WIDEN_GRADED_ROUTE"));
      repairs.push({
        operator: "WIDEN_GRADED_ROUTE",
        parentCandidateId: candidate.candidateId,
        childCandidateId: repaired.candidateId,
        before: { routeWidthRepair: 0, rejectionIds: validation.rejectionIds.slice() },
        after: {
          routeWidthRepair: repaired.parameters.routeWidthRepair,
          rejectionIds: repairedValidation.rejectionIds.slice()
        }
      });
    }
  }
  var passing = entries.filter(function(entry){ return entry.validation.ok; });
  var selected = null;
  passing.forEach(function(entry){
    if(!selected || gvsTupleGreater(gvsSelectionTuple(entry), gvsSelectionTuple(selected))) selected = entry;
  });
  return {
    grammar: grammar,
    reservations: reservations,
    candidates: entries,
    summaries: summaries,
    repairs: repairs,
    selected: selected,
    hardFailure: selected ? null : "NO_LEGAL_CANDIDATE"
  };
}

function gvsSurfaceRecord(id, role, source, mechanicRefs, localFrame, materialHint){
  return {
    surfaceId: id,
    role: role,
    source: source,
    mechanicTruthRefs: mechanicRefs || [],
    localFrame: Object.assign({
      origin: [0, 0, 0],
      normal: [0, 1, 0],
      tangent: [1, 0, 0],
      bitangent: [0, 0, 1],
      boundary: null,
      mask: "full-face"
    }, localFrame || {}),
    materialHint: materialHint || null
  };
}

function gvsSurfaceAssembly(candidate){
  var surfaces = [];
  if(candidate.terrain){
    var field = candidate.terrain.field;
    function firstCell(predicate){
      return field.cells.filter(function(cell){
        return cell.inPlayfield && cell.standable && predicate(cell);
      })[0] || null;
    }
    function cellSurface(id, role, cell, hint){
      if(!cell) return;
      surfaces.push(gvsSurfaceRecord(id, role,
        { kind: "terrain-cell", fieldId: field.id, cellIndex: cell.index },
        ["terrain-cell:" + cell.index + ":h=" + cell.h],
        {
          origin: [cell.x + 0.5, cell.h, cell.y + 0.5],
          normal: [0, 1, 0],
          boundary: { cellIndex: cell.index }
        }, hint));
    }
    cellSurface("surface-natural-top", "WALKABLE_TOP",
      firstCell(function(cell){ return cell.surface == null; }), "upland-natural-top");
    cellSurface("surface-through-road", "WALKABLE_TOP",
      firstCell(function(cell){ return cell.surface === "guard-through-road"; }), "graded-road-top");
    cellSurface("surface-natural-slope", "NATURAL_SLOPE",
      firstCell(function(cell){ return cell.localSlopeDeg > 0; }), "upland-natural-slope");
    var cutFace = field.faces[0] || null;
    if(cutFace){
      var high = field.cells[cutFace.highIndex], low = field.cells[cutFace.lowIndex];
      var nx = high.x === low.x ? 0 : (high.x > low.x ? 1 : -1);
      var nz = high.y === low.y ? 0 : (high.y > low.y ? 1 : -1);
      surfaces.push(gvsSurfaceRecord("surface-localized-cut", "CUT_FACE",
        { kind: "terrain-face", fieldId: field.id, faceId: cutFace.id },
        ["terrain-face:" + cutFace.id, "riseH:" + cutFace.deltaH],
        {
          origin: [(high.x + low.x + 1) / 2, (high.h + low.h) / 2, (high.y + low.y + 1) / 2],
          normal: [nx, 0, nz],
          tangent: nz ? [1, 0, 0] : [0, 0, 1],
          bitangent: [0, 1, 0],
          boundary: { highIndex: cutFace.highIndex, lowIndex: cutFace.lowIndex }
        }, "exposed-upland-cut"));
    }
    candidate.structures.forEach(function(structure){
      var fp = structure.footprint;
      var role = structure.role === "retaining-wall" ? "RETAINING_FACE"
        : structure.role === "observation-deck" ? "ROOF_DECK"
        : structure.role === "road-barrier" ? "MOUNT_FACE"
        : "WALL_FIELD";
      surfaces.push(gvsSurfaceRecord("surface-" + structure.id, role,
        { kind: "construction", structureId: structure.id, faceRef: "primary" },
        ["structure:" + structure.id + ":footprint", "structure:" + structure.id + ":baseH"],
        {
          origin: [fp.x + fp.w / 2, structure.baseH, fp.y + fp.d / 2],
          normal: role === "ROOF_DECK" ? [0, 1, 0] : [1, 0, 0],
          tangent: role === "ROOF_DECK" ? [1, 0, 0] : [0, 0, 1],
          bitangent: role === "ROOF_DECK" ? [0, 0, 1] : [0, 1, 0],
          boundary: gvsClone(fp)
        }, structure.role));
    });
    surfaces.push(gvsSurfaceRecord("surface-guardroom-coping", "CROWN_COPING",
      { kind: "construction", structureId: "guardroom", faceRef: "crown" },
      ["structure:guardroom:storeys"], {
        origin: [5.5, candidate.structures[0].baseH + 8, 4],
        normal: [0, 1, 0],
        boundary: gvsClone(candidate.structures[0].footprint)
      }, "maintained-coping"));
  } else {
    candidate.zones.forEach(function(zone){
      var first = zone.cells && zone.cells[0];
      if(!first) return;
      var role = zone.role === "service-threshold" ? "JAMB_REVEAL"
        : zone.role === "source-backed-light" ? "MOUNT_FACE"
        : /public|quiet/.test(zone.role) ? "WALKABLE_TOP" : "WALL_FIELD";
      surfaces.push(gvsSurfaceRecord("surface-" + zone.role, role,
        { kind: "program-zone", zoneId: zone.id, faceRef: "primary" },
        ["zone:" + zone.id],
        {
          origin: [first.x + 0.5, 0, first.y + 0.5],
          normal: role === "WALKABLE_TOP" ? [0, 1, 0] : [1, 0, 0],
          tangent: role === "WALKABLE_TOP" ? [1, 0, 0] : [0, 0, 1],
          bitangent: role === "WALKABLE_TOP" ? [0, 0, 1] : [0, 1, 0],
          boundary: { zoneId: zone.id }
        }, zone.role));
    });
  }
  return {
    version: "surface-assembly-plan/1",
    surfaces: surfaces,
    fingerprint: vignetteFingerprint(surfaces)
  };
}

function gvsCommittedPlan(request, candidateSet){
  var selected = candidateSet.selected.candidate;
  var reservations = candidateSet.reservations.map(function(reservation){
    return Object.assign({}, reservation, { planRef: request.requestId + ":committed-plan" });
  });
  var surfaceAssembly = gvsSurfaceAssembly(selected);
  var plan = {
    schemaVersion: 1,
    engineVersion: GOLDEN_VIGNETTE_SYNTH_VERSION,
    requestRef: request.requestId,
    hostOwner: request.hostProgram.owner,
    grammar: gvsClone(candidateSet.grammar),
    materializationWindow: gvsClone(selected.window),
    identityReservations: reservations,
    topology: {
      family: selected.topologyFamily,
      parameters: gvsClone(selected.parameters)
    },
    terrainPlan: selected.terrain ? {
      spec: selected.terrain.spec,
      field: selected.terrain.field,
      routeReport: selected.terrain.routeReport,
      quietSurfaceReport: selected.terrain.quietSurfaceReport,
      continuityReport: selected.terrain.continuityReport,
      variationReport: selected.terrain.variationReport
    } : null,
    constructionPlan: gvsClone(selected.structures),
    zones: gvsClone(selected.zones),
    circuits: gvsClone(selected.circuits),
    tacticalPlans: gvsClone(selected.plans),
    causalState: gvsClone(selected.causalState),
    surfaceAssemblyPlan: surfaceAssembly,
    projectionLaw: {
      sceneTray: "committed-plan-social-or-arrival-view",
      battleMap: "same-committed-plan-tactical-reservations-active",
      permittedBearings: [0, 1, 2, 3],
      cameraMayMutatePlan: false
    }
  };
  var mechanicsRecord = {
    topology: plan.topology,
    terrain: plan.terrainPlan ? {
      fieldFingerprint: plan.terrainPlan.field.fingerprint,
      routeReport: plan.terrainPlan.routeReport
    } : null,
    construction: plan.constructionPlan,
    zones: plan.zones,
    circuits: plan.circuits,
    tacticalPlans: plan.tacticalPlans
  };
  plan.mechanicsFingerprint = vignetteFingerprint(mechanicsRecord);
  plan.planFingerprint = goldenVignettePlanFingerprint(plan);
  return plan;
}

/* Route-control architecture is one function of the shared vignette engine, not a renderer recipe.
   It consumes the already committed structure envelopes and terrain datums, expands them into a
   supported ArchitectureAssemblyPlanV1, and never moves a road, route, zone, objective, or battle
   cell. The committed mechanics fingerprint therefore remains the authority while the renderer is
   reduced to projecting these members. */
/* WALL FACE MODULE COMPILER · reusable visual planning function.
   Callers pass already-authoritative wall runs. This function may partition their visible faces,
   link authored modules, and name visual sockets; it never changes the runs, their openings,
   collision, cover, support, or mechanics. */
function goldenVignetteWallFaceModuleCompile(wallRuns, options){
  options = options || {};
  var sourceWallRuns = wallRuns || [];
  var presentationSeed = Number(options.presentationSeed || 0) >>> 0;
  var pixelsPerFoot = Math.max(8, Number(options.pixelsPerFoot) || 32);
  var authoredExpressionProfile =
    options.authoredExpressionProfile || "authored-pixel-standard";
  var cultureId = options.cultureId || "neutral-structural";
  var cultureFeatureWallRunId = options.cultureFeatureWallRunId || null;
  var cultureMedia = options.cultureMedia || {};
  var signifierState = options.signifierState || {
    truthStatus: "NON_CANONICAL_FIXTURE_PLACEHOLDER",
    worldTruthRef: "wall-face-module-proof:placeholder"
  };
  var sourcePlanRef = options.sourcePlanRef || null;
  var sourceMechanicsRef = options.sourceMechanicsRef || null;
  var authoredFeaturesByRunId = options.authoredFeaturesByRunId || {};
  var endpointIncidents = {};
  var allEndpointIncidents = [];
  var endpointKey = function(point){
    return Math.round(Number(point.x) * 10000) + ":"
      + Math.round(Number(point.z) * 10000);
  };
  sourceWallRuns.forEach(function(run){
    var frame = architectureRunFrame(run.start, run.end);
    [
      { side: "left", point: run.start },
      { side: "right", point: run.end }
    ].forEach(function(endpoint){
      var key = endpointKey(endpoint.point);
      if(!endpointIncidents[key]) endpointIncidents[key] = [];
      endpointIncidents[key].push({
        wallRunId: run.id,
        side: endpoint.side,
        axis: gvsClone(frame.axis),
        point: gvsClone(endpoint.point),
        thickness: Math.max(0, Number(run.thickness) || 0)
      });
      allEndpointIncidents.push(endpointIncidents[key][endpointIncidents[key].length - 1]);
    });
  });
  var plans = sourceWallRuns.map(function(run){
    var frame = architectureRunFrame(run.start, run.end);
    var lengthFeet = frame.length * 5;
    var heightFeet = run.height * 5;
    /* Architecture transforms can produce 9.999999-foot faces. Keep those on the exact 10-foot
       module boundary instead of inventing a hairline remainder and a phantom solver column. */
    var boundaryEpsilonFeet = 0.0001;
    var columns = Math.max(1,
      Math.ceil((lengthFeet - boundaryEpsilonFeet) / 5));
    var rows = Math.max(1,
      Math.ceil((heightFeet - boundaryEpsilonFeet) / 5));
    var slots = [];
    for(var row = 0; row < rows; row++){
      for(var column = 0; column < columns; column++){
        var slotSeed = gvsSubSeed(presentationSeed,
          "wall-face:" + run.id + ":" + column + ":" + row);
        slots.push({
          id: run.id + ":slot:" + column + ":" + row,
          column: column,
          row: row,
          envelope: "W5H5",
          variant: slotSeed % 7 === 0 ? "quiet-W5H5" : "plain-W5H5",
          source: "deterministic-wall-face-module-selection",
          mechanicalEffect: "none"
        });
      }
    }
    var apertures = (run.openings || []).map(function(opening){
      return {
        id: opening.id,
        stationFeet: +(opening.station * 5).toFixed(4),
        widthFeet: +(opening.width * 5).toFixed(4),
        bottomFeet: +(opening.bottom * 5).toFixed(4),
        heightFeet: +(opening.height * 5).toFixed(4),
        kind: opening.kind,
        moduleRole: "real-aperture-surround",
        geometryTruthRef: opening.id
      };
    });
    var linkedModules = [];
    apertures.forEach(function(aperture){
      var left = aperture.stationFeet - aperture.widthFeet / 2;
      var right = aperture.stationFeet + aperture.widthFeet / 2;
      var top = aperture.bottomFeet + aperture.heightFeet;
      var minColumn = Math.max(0, Math.floor(left / 5));
      var maxColumn = Math.min(columns - 1,
        Math.floor(Math.max(left, right - 0.0001) / 5));
      var minRow = Math.max(0, Math.floor(aperture.bottomFeet / 5));
      var maxRow = Math.min(rows - 1,
        Math.floor(Math.max(aperture.bottomFeet, top - 0.0001) / 5));
      var spanColumns = maxColumn - minColumn + 1;
      var spanRows = maxRow - minRow + 1;
      var envelope = spanColumns >= 2 && spanRows >= 2 ? "W10H10"
        : spanRows >= 2 ? "W5H10" : "W5H5";
      var linkedId = run.id + ":module:aperture:" + aperture.id;
      linkedModules.push({
        id: linkedId,
        envelope: envelope,
        role: "real-aperture-surround",
        cells: {
          minColumn: minColumn, maxColumn: maxColumn,
          minRow: minRow, maxRow: maxRow
        },
        geometryTruthRef: aperture.geometryTruthRef,
        mechanicalEffect: "none"
      });
      slots.forEach(function(slot){
        if(slot.column >= minColumn && slot.column <= maxColumn
            && slot.row >= minRow && slot.row <= maxRow){
          slot.linkedModuleRef = linkedId;
          slot.socket = "aperture-adjacent";
        }
      });
    });
    var fullColumns = Math.floor((lengthFeet + boundaryEpsilonFeet) / 5);
    var fullRows = Math.floor((heightFeet + boundaryEpsilonFeet) / 5);
    var quietCandidates = [];
    if(fullRows >= 2){
      for(var quietColumn = 0; quietColumn < fullColumns; quietColumn++){
        var lower = slots.find(function(slot){
          return slot.column === quietColumn && slot.row === 0;
        });
        var upper = slots.find(function(slot){
          return slot.column === quietColumn && slot.row === 1;
        });
        if(lower && upper && !lower.linkedModuleRef && !upper.linkedModuleRef){
          quietCandidates.push({ column: quietColumn, lower: lower, upper: upper });
        }
      }
    }
    if(quietCandidates.length){
      var quietPick = quietCandidates[gvsSubSeed(
        presentationSeed, "wall-face-linked-quiet:" + run.id) % quietCandidates.length];
      var quietLinkedId = run.id + ":module:quiet-W5H10:" + quietPick.column;
      quietPick.lower.variant = "quiet-W5H10:lower";
      quietPick.upper.variant = "quiet-W5H10:upper";
      quietPick.lower.linkedModuleRef = quietLinkedId;
      quietPick.upper.linkedModuleRef = quietLinkedId;
      linkedModules.push({
        id: quietLinkedId,
        envelope: "W5H10",
        role: "quiet-authored-variation",
        cells: {
          minColumn: quietPick.column, maxColumn: quietPick.column,
          minRow: 0, maxRow: 1
        },
        mechanicalEffect: "none"
      });
    }
    var widthRemainder = lengthFeet - fullColumns * 5;
    var heightRemainder = heightFeet - fullRows * 5;
    if(Math.abs(widthRemainder) <= boundaryEpsilonFeet) widthRemainder = 0;
    if(Math.abs(heightRemainder) <= boundaryEpsilonFeet) heightRemainder = 0;
    var remainder = {
      widthFeet: +Math.max(0, widthRemainder).toFixed(4),
      heightFeet: +Math.max(0, heightRemainder).toFixed(4),
      rightSocket: widthRemainder === 0
        ? "exact-module-boundary" : "capped-remainder",
      topSocket: heightRemainder === 0
        ? "exact-module-boundary" : "capped-remainder"
    };
    var topologyEdges = [
      { side: "left", point: run.start },
      { side: "right", point: run.end }
    ].map(function(endpoint){
      var neighbours = (endpointIncidents[endpointKey(endpoint.point)] || [])
        .filter(function(incident){ return incident.wallRunId !== run.id; });
      /* Closed wall shells often stop each run at the face of an architecture-owned structural
         corner post. Their centreline endpoints are therefore separated by the two half-wall
         thicknesses rather than numerically identical. Treat only endpoints whose physical
         thickness envelopes touch as incident; this preserves isolated end caps while allowing
         the visual module plan to inherit the shell's real butt-jointed corner. */
      if(!neighbours.length){
        var runHalfThickness = Math.max(0, Number(run.thickness) || 0) / 2;
        neighbours = allEndpointIncidents.filter(function(incident){
          if(incident.wallRunId === run.id) return false;
          var dx = Number(incident.point.x) - Number(endpoint.point.x);
          var dz = Number(incident.point.z) - Number(endpoint.point.z);
          var contactDistance = runHalfThickness + incident.thickness / 2 + 0.0001;
          return Math.sqrt(dx * dx + dz * dz) <= contactDistance;
        });
      }
      var socketKind = "flush-end-cap";
      if(neighbours.length === 1){
        var neighbourAxis = neighbours[0].axis;
        var axisDot = Math.abs(
          frame.axis.x * neighbourAxis.x + frame.axis.z * neighbourAxis.z);
        socketKind = axisDot >= 0.999
          ? "seamless-continuation" : "matched-miter-corner";
      } else if(neighbours.length > 1){
        socketKind = "multi-run-junction";
      }
      return {
        side: endpoint.side,
        socketKind: socketKind,
        connectedWallRunIds: neighbours.map(function(incident){
          return incident.wallRunId;
        }).sort(),
        surfaceTreatment: socketKind === "flush-end-cap"
          ? "four-polygon-cap-transition"
          : socketKind === "matched-miter-corner"
            ? "culture-ready-miter-transition"
            : socketKind === "multi-run-junction"
              ? "junction-pier-transition" : "continuous-parent",
        geometryAuthority: "architecture-wall-run-topology",
        mechanicalEffect: "none"
      };
    });
    var authoredFeatures = (authoredFeaturesByRunId[run.id] || [])
      .filter(function(feature){
        return feature && feature.id && feature.kind && feature.constructionTruthRef;
      })
      .map(function(feature){
        var bottomFeet = Math.max(0, Number(feature.bottomFeet) || 0);
        var featureHeight = Math.max(0.125, Number(feature.heightFeet) || 0.5);
        var featureWidth = feature.widthFeet == null
          ? lengthFeet : Math.max(0.125, Number(feature.widthFeet) || 0.125);
        var stationFeet = feature.stationFeet == null
          ? lengthFeet * 0.5 : Number(feature.stationFeet);
        return {
          id: feature.id,
          kind: feature.kind,
          stationFeet: +stationFeet.toFixed(4),
          bottomFeet: +bottomFeet.toFixed(4),
          widthFeet: +Math.min(featureWidth, lengthFeet).toFixed(4),
          heightFeet: +Math.min(featureHeight, heightFeet).toFixed(4),
          constructionTruthRef: feature.constructionTruthRef,
          paletteRole: feature.paletteRole || "parent-derived-authored-feature",
          mechanicalEffect: "none"
        };
      });
    var cultureFeature = run.id === cultureFeatureWallRunId
      ? {
          id: run.id + ":culture-surface-placeholder",
          medium: cultureMedia[cultureId] || cultureMedia.default || "neutral-surface-inset",
          truthStatus: signifierState.truthStatus,
          worldTruthRef: signifierState.worldTruthRef,
          mechanicalEffect: "none"
        } : null;
    var cultureRelief = cultureId === "institutional-frontier" && apertures.length === 0
      ? {
          id: run.id + ":institutional-authored-relief-panel",
          source: "/assets/materials/golden/guard-post/v015/runtime/"
            + "architectural-relief-band-mask-320x96.png",
          sourceCropPx: { x: 0, y: 16, width: 160, height: 64 },
          physicalEnvelopeFeet: { width: 5, height: 2 },
          placement: "repeat-on-full-W5-upper-band",
          maximumPerFace: Math.floor(lengthFeet / 5),
          cultureRef: cultureId,
          constructionTruthRef: run.id,
          sampling: "nearest-no-mipmap",
          mechanicalEffect: "none"
        } : null;
    var modulePlan = {
      schema: "WallFaceModulePlanV1",
      compiler: "WallFaceModuleCompilerV1",
      wallRunId: run.id,
      memberPrefix: run.id + ":",
      parentMaterialRole: run.role,
      constructionDatum: {
        start: gvsClone(run.start),
        axis: gvsClone(frame.axis),
        baseY: run.baseY,
        feetPerWorldUnit: 5
      },
      physicalExtent: {
        lengthWorldUnits: +frame.length.toFixed(4),
        heightWorldUnits: +run.height.toFixed(4),
        lengthFeet: +lengthFeet.toFixed(4),
        heightFeet: +heightFeet.toFixed(4)
      },
      moduleGrid: {
        cellFeet: 5,
        columns: columns,
        rows: rows,
        pixelsPerFoot: pixelsPerFoot,
        albedoSampling: "nearest-no-mipmap"
      },
      authoredExpressionProfile: authoredExpressionProfile,
      remainder: remainder,
      topologyEdges: topologyEdges,
      slots: slots,
      linkedModules: linkedModules,
      apertures: apertures,
      authoredFeatures: authoredFeatures,
      cultureFeature: cultureFeature,
      cultureRelief: cultureRelief,
      layers: [
        "continuous-parent",
        "authored-W5H5-quiet-variation",
        "real-aperture-surround",
        "topology-derived-corner-or-end-transition",
        "construction-fact-authored-feature",
        cultureRelief ? "culture-authored-relief" : null,
        "world-truth-culture-placeholder",
        "causal-condition"
      ].filter(Boolean),
      normalOrmStatus:
        "parent-normal-orm-retained; authored-alpha-derives-restrained-feature-normal-roughness",
      mechanicalEffect: "none",
      sourcePlanRef: sourcePlanRef,
      sourceMechanicsRef: sourceMechanicsRef
    };
    modulePlan.fingerprint = vignetteFingerprint(modulePlan);
    return modulePlan;
  });
  return {
    plans: plans,
    receipt: {
      schema: "WallFaceModuleCompilerReceiptV1",
      compiler: "WallFaceModuleCompilerV1",
      physicalStandardRef: "docs/PHYSICAL-TEXTURE-MODULE-STANDARD.md",
      planCount: plans.length,
      pixelsPerFoot: pixelsPerFoot,
      authoredExpressionProfile: authoredExpressionProfile,
      envelopes: ["W5H5", "W5H10", "W10H10"],
      linkedModuleCount: plans.reduce(function(sum, face){
        return sum + face.linkedModules.length;
      }, 0),
      topologySocketCounts: plans.reduce(function(counts, face){
        face.topologyEdges.forEach(function(edge){
          counts[edge.socketKind] = (counts[edge.socketKind] || 0) + 1;
        });
        return counts;
      }, {}),
      authoredFeatureCount: plans.reduce(function(sum, face){
        return sum + face.authoredFeatures.length;
      }, 0),
      authoredFeatureKinds: plans.reduce(function(kinds, face){
        face.authoredFeatures.forEach(function(feature){
          if(kinds.indexOf(feature.kind) < 0) kinds.push(feature.kind);
        });
        return kinds;
      }, []).sort(),
      linkedEnvelopeCounts: plans.reduce(function(counts, face){
        face.linkedModules.forEach(function(module){
          counts[module.envelope] = (counts[module.envelope] || 0) + 1;
        });
        return counts;
      }, {}),
      apertureAuthority: "architecture-engine-real-openings-only",
      rendererAuthority: "compose-albedo-on-existing-wall-receivers",
      mechanicalEffect: "none",
      planFingerprints: plans.map(function(face){ return face.fingerprint; })
    }
  };
}

function gvsRouteControlArchitectureAssembly(plan, request){
  if(!plan || !plan.grammar || plan.grammar.id !== "shoulder-route-control"){
    throw new Error("gvsRouteControlArchitectureAssembly: shoulder-route-control plan required");
  }
  var structures = {};
  plan.constructionPlan.forEach(function(structure){ structures[structure.role] = structure; });
  ["guardroom", "observation-deck", "retaining-wall", "road-barrier"].forEach(function(role){
    if(!structures[role]){
      throw new Error("gvsRouteControlArchitectureAssembly: missing " + role);
    }
  });
  var q = TERRAIN_GRID_LAW.verticalQuantumWorldUnits;
  var extent = plan.materializationWindow.extentCells;
  var presentationSeed = Number(request && request.seedNamespace
    && request.seedNamespace.rootSeed || 0) >>> 0;
  var presentationCultureId = request && request.presentationCultureId
    ? request.presentationCultureId : "neutral-structural";
  var presentationLightMode = request && request.presentationLightMode === "night"
    ? "night" : "day";
  /* Runtime citizens must inherit the same material language as the architecture around them.
     These are presentation-only donor-family variants: the socket still owns placement and the
     engine still owns collision/state. Keeping the context at assembly scope makes the choice
     deterministic, inspectable, and reusable by every admitted operational prop. */
  var operationalPropMaterialContext = presentationCultureId === "upland-vernacular"
    ? { wood: "creosote-pine", iron: "rusted-iron", ceramic: "earthenware" }
    : presentationCultureId === "institutional-frontier"
      ? { wood: "oak", iron: "blackened-iron", ceramic: "earthenware" }
      : { wood: "oak", iron: "wrought-iron", ceramic: "earthenware" };
  var presentationSignifierState = request && request.presentationSignifierState
    ? gvsClone(request.presentationSignifierState)
    : {
        schema: "WorldSignifierStateV1",
        truthStatus: "NON_CANONICAL_FIXTURE_PLACEHOLDER",
        worldTruthRef: "guard-post-proof:faction-placeholder-01",
        paletteRef: "guard-post-proof:crimson-ochre",
        medium: presentationCultureId === "upland-vernacular"
          ? "pole-flag" : "hanging-banner"
      };
  function localFootprint(structure){
    var fp = structure.footprint;
    return {
      x: fp.x + fp.w / 2 - extent.x / 2,
      z: fp.y + fp.d / 2 - extent.y / 2,
      w: fp.w,
      d: fp.d,
      baseY: structure.baseH * q
    };
  }
  var guard = localFootprint(structures.guardroom);
  var deck = localFootprint(structures["observation-deck"]);
  var retaining = localFootprint(structures["retaining-wall"]);
  var barrier = localFootprint(structures["road-barrier"]);
  var def = {
    id: "route-control-architecture:" + plan.requestRef,
    formId: "ROUTE-CONTROL",
    label: "OPERATED SHOULDER THRESHOLD",
    scale: "compact-exterior-precinct",
    fixtureId: GOLDEN_VIGNETTE_WAVE2_FIXTURE.id
  };
  var assembly = architecturePlanBase(def, {
    seed: presentationSeed,
    extentCells: gvsClone(extent),
    primarySpatialSentence:
      "A complete guardroom, retained shoulder, working barrier, and reachable crown jointly command one through-road.",
    programTopology: [
      "entry-continuation", "quiet-approach", "road-narrowing", "controlled-threshold",
      "guardroom-frontage", "work-apron", "observation-opening", "lookout-deck",
      "terrain-flank", "exit-continuation"
    ],
    constructionProfile: "terrain-fitted-operating-post-with-causal-drainage-repair",
    physicalState: "maintained-repaired",
    operatingState: "operating",
    battleSpaceMode: ARCHITECTURE_BATTLE_SPACE_MODES.EXTERIOR_PRECINCT.id,
    occupantProfile: "upright-medium",
    assemblyClearancePolicy: "strict",
    visualLocks: [
      "guardroom is a complete exterior boundary, never an open proxy cube",
      "roof closes to every wall",
      "road, barrier, observation opening, and deck read as one operated threshold",
      "one dressed-stone drainage splice records recent repair",
      "lookout slab bears directly on the crown and is not a stair-connector platform"
    ],
    gameplayLocks: [
      "committed road and flank remain unchanged",
      "front, flank, and deck/timing plans retain their costs",
      "shutter has real approach sight",
      "deck remains reachable and counterplay remains open"
    ]
  });
  assembly.phase = "procedural-vignette-realization";
  assembly.sourcePlanRef = plan.planFingerprint;
  assembly.sourceMechanicsRef = plan.mechanicsFingerprint;
  assembly.sourceFactRefs = gvsSourceFactRefs(request);
  assembly.cultureProfileId = presentationCultureId;
  assembly.presentationLightMode = presentationLightMode;
  assembly.operationalPropMaterialContext = gvsClone(operationalPropMaterialContext);
  assembly.repairCard = {
    id: "downhill-drainage-splice",
    cause: "slope pressure and runoff at the working shelf",
    expression: "new dressed drain opening and coping interrupt older retaining masonry"
  };
  assembly.defensiveEdgeCard = {
    id: "neutral-half-cover-envelope",
    coverClass: "half-cover",
    futureProfiles: ["institutional-parapet", "upland-fitted-stone-and-timber-crib"]
  };

  /* Guardroom: a complete, inaccessible-depth exterior shell. The street wall contains two true
     voids—a controlled door and a deep observation shutter—and the low hip roof closes to all four
     walls. The battle is outside; this proof does not peel the room into a dollhouse. */
  var guardHalfW = guard.w / 2;
  var guardHalfD = guard.d / 2;
  var guardFoundationTop = guard.baseY + 0.22;
  var guardFoundationThickness = 0.34;
  var guardFoundationBottom = guardFoundationTop - guardFoundationThickness;
  var guardWallBase = guardFoundationTop;
  var familyLayoutVariant = gvsSubSeed(
    presentationSeed, "guard-family-layout-v67") % 3;
  /* Mutation changes the whole massing sentence. The deep road lodge stays lower and calmer;
     the broad watchhouse rises above the road; the committed square hero remains untouched.
     These dimensions still compile through the same 5ft wall-module grid and capped remainders. */
  var guardWallHeight = [2.68, 2.46, 3.08][familyLayoutVariant];
  var guardRoofPitchDeg = [36, 30, 38][familyLayoutVariant];
  var guardStreetWallThickness = 0.42;
  var guardUphillWallThickness = 0.48;
  var guardReturnWallThickness = 0.44;
  var guardDoorStation = guard.d - 0.92;
  var guardMiddleStation = guard.d / 2 + 0.1;
  assembly.familyLayout = {
    schema: "GuardPostFamilyLayoutV1",
    variantIndex: familyLayoutVariant,
    guardroomSentence: [
      "compact square watchhouse",
      "deep road lodge",
      "broad watchhouse"
    ][familyLayoutVariant],
    lookoutSentence: [
      "balanced crown deck",
      "long signal gallery",
      "deep compact crown terrace"
    ][familyLayoutVariant],
    wallHeightWorldUnits: guardWallHeight,
    roofPitchDeg: guardRoofPitchDeg,
    guardroomFootprint: gvsClone(structures.guardroom.footprint),
    lookoutFootprint: gvsClone(structures["observation-deck"].footprint),
    sourcePlanRef: plan.planFingerprint,
    sourceMechanicsRef: plan.mechanicsFingerprint
  };
  /* The foundation follows the actual outer wall planes. The earlier proof shifted this slab
     0.08wu uphill while adding only 0.46wu of width, which left the street wall overhanging its
     support by 0.06wu. That undercut read as a clean air line beneath the condition band. */
  architectureAddSlab(assembly, "route-control-guard-foundation",
    { x: guard.x - 0.015, z: guard.z },
    { x: guard.w + 0.45, z: guard.d + 0.44 },
    guardFoundationTop, guardFoundationThickness, "foundation", ["ground"], "none");
  /* The neutral shell is watertight before culture touches it. Each post occupies the exact
     rectangular intersection of its two wall thicknesses, so adjacent outer faces terminate on
     one closed corner. Institutional quoins and Upland timber posts may later wrap these bearings,
     but they are expression—not emergency plugs for missing base geometry. */
  var guardCornerPostIds = [];
  [
    { id: "far-road", x: guard.x + guardHalfW, z: guard.z - guardHalfD,
      sx: guardStreetWallThickness, sz: guardReturnWallThickness },
    { id: "near-road", x: guard.x + guardHalfW, z: guard.z + guardHalfD,
      sx: guardStreetWallThickness, sz: guardReturnWallThickness },
    { id: "far-uphill", x: guard.x - guardHalfW, z: guard.z - guardHalfD,
      sx: guardUphillWallThickness, sz: guardReturnWallThickness },
    { id: "near-uphill", x: guard.x - guardHalfW, z: guard.z + guardHalfD,
      sx: guardUphillWallThickness, sz: guardReturnWallThickness }
  ].forEach(function(corner){
    var member = architectureAddBox(assembly,
      "route-control-guard-structural-corner-" + corner.id,
      {
        x: corner.x,
        y: guardWallBase + guardWallHeight / 2,
        z: corner.z
      },
      { x: corner.sx, y: guardWallHeight, z: corner.sz },
      "masonry-wall", ["route-control-guard-foundation"], {
        ownerId: "route-control-guard-foundation",
        condition: "intact-load-bearing-corner"
      });
    guardCornerPostIds.push(member.id);
  });
  assembly.guardCornerClosure = {
    schema: "ArchitectureCornerClosureV1",
    strategy: "butt-jointed-structural-corner-posts",
    memberIds: guardCornerPostIds,
    cultureIndependent: true,
    closureRule:
      "post-outer-faces-coincide-with-wall-outer-faces-and-wall-ends-butt-without-overlap",
    sourcePlanRef: plan.planFingerprint,
    sourceMechanicsRef: plan.mechanicsFingerprint
  };
  var guardReturnHalfThickness = guardReturnWallThickness / 2;
  var guardStreetHalfThickness = guardStreetWallThickness / 2;
  var guardUphillHalfThickness = guardUphillWallThickness / 2;
  architectureAddWallRun(assembly, {
    id: "route-control-guard-street-wall",
    start: {
      x: guard.x + guardHalfW,
      z: guard.z - guardHalfD + guardReturnHalfThickness
    },
    end: {
      x: guard.x + guardHalfW,
      z: guard.z + guardHalfD - guardReturnHalfThickness
    },
    baseY: guardWallBase, height: guardWallHeight, thickness: guardStreetWallThickness,
    supportedBy: ["route-control-guard-foundation"],
    openings: [
      { id: "route-control-observation-shutter",
        station: 1.0 - guardReturnHalfThickness, width: 1.34,
        bottom: 1.12, height: 1.02, kind: "shuttered-observation", observation: true },
      { id: "route-control-guard-door",
        station: guardDoorStation - guardReturnHalfThickness, width: 1.08,
        bottom: 0, height: 1.9, kind: "controlled-door", access: "walk" }
    ]
  });
  architectureAddWallRun(assembly, {
    id: "route-control-guard-uphill-wall",
    start: {
      x: guard.x - guardHalfW,
      z: guard.z + guardHalfD - guardReturnHalfThickness
    },
    end: {
      x: guard.x - guardHalfW,
      z: guard.z - guardHalfD + guardReturnHalfThickness
    },
    baseY: guardWallBase, height: guardWallHeight, thickness: guardUphillWallThickness,
    supportedBy: ["route-control-guard-foundation"]
  });
  architectureAddWallRun(assembly, {
    id: "route-control-guard-far-return",
    start: {
      x: guard.x - guardHalfW + guardUphillHalfThickness,
      z: guard.z - guardHalfD
    },
    end: {
      x: guard.x + guardHalfW - guardStreetHalfThickness,
      z: guard.z - guardHalfD
    },
    baseY: guardWallBase, height: guardWallHeight, thickness: guardReturnWallThickness,
    supportedBy: ["route-control-guard-foundation"]
  });
  architectureAddWallRun(assembly, {
    id: "route-control-guard-near-return",
    start: {
      x: guard.x + guardHalfW - guardStreetHalfThickness,
      z: guard.z + guardHalfD
    },
    end: {
      x: guard.x - guardHalfW + guardUphillHalfThickness,
      z: guard.z + guardHalfD
    },
    baseY: guardWallBase, height: guardWallHeight, thickness: guardReturnWallThickness,
    supportedBy: ["route-control-guard-foundation"]
  });
  var guardWallTop = guardWallBase + guardWallHeight;
  var guardRoofSupports = [
    "route-control-guard-street-wall", "route-control-guard-uphill-wall",
    "route-control-guard-far-return", "route-control-guard-near-return"
  ].concat(guardCornerPostIds);
  architectureAddHipRoof(assembly, {
    id: "route-control-guard-hip-roof",
    center: { x: guard.x, z: guard.z },
    width: guard.w, depth: guard.d,
    eaveY: guardWallTop + 0.12, pitchDeg: guardRoofPitchDeg,
    overhang: 0.38, thickness: 0.19, enclosure: "enclosed",
    supportedBy: guardRoofSupports,
    edgeInfills: [
      { id: "route-control-guard-roof:north", edge: "north",
        width: guard.w, depth: guard.d, wallTopY: guardWallTop,
        thickness: guardReturnWallThickness,
        supportedBy: ["route-control-guard-far-return"],
        ownerId: "route-control-guard-far-return" },
      { id: "route-control-guard-roof:south", edge: "south",
        width: guard.w, depth: guard.d, wallTopY: guardWallTop,
        thickness: guardReturnWallThickness,
        supportedBy: ["route-control-guard-near-return"],
        ownerId: "route-control-guard-near-return" },
      { id: "route-control-guard-roof:west", edge: "west",
        width: guard.w, depth: guard.d, wallTopY: guardWallTop,
        thickness: guardUphillWallThickness,
        supportedBy: ["route-control-guard-uphill-wall"],
        ownerId: "route-control-guard-uphill-wall" },
      { id: "route-control-guard-roof:east", edge: "east",
        width: guard.w, depth: guard.d, wallTopY: guardWallTop,
        thickness: guardStreetWallThickness,
        supportedBy: ["route-control-guard-street-wall"],
        ownerId: "route-control-guard-street-wall" }
    ]
  });
  architectureAddRunPrism(assembly, "route-control-shutter-sill",
    { x: guard.x + guardHalfW + 0.04, z: guard.z - guardHalfD + 0.3 },
    { x: guard.x + guardHalfW + 0.04, z: guard.z - guardHalfD + 1.7 },
    guardWallBase + 1.02, 0.16, 0.54, "masonry-edge",
    ["route-control-guard-street-wall"], {
      ownerId: "route-control-guard-street-wall", cover: "half-cover"
    });
  architectureAddBox(assembly, "route-control-door-step",
    { x: guard.x + guardHalfW + 0.36, y: guardWallBase - 0.03,
      z: guard.z - guardHalfD + guardDoorStation },
    { x: 0.72, y: 0.22, z: 1.16 }, "masonry-edge",
    ["route-control-guard-foundation"], { access: "walk" });

  /* The crown deck is a purposeful lookout bearing on the landform. Its south edge stays open for
     one grounded stair, and its other three edges provide the neutral half-cover envelope later
     re-expressed by the Institutional and Upland construction profiles. */
  var deckTop = Math.max(deck.baseY + 0.24, guard.baseY + 1.2);
  var deckBearingHeight = Math.max(0.2, deckTop - deck.baseY);
  architectureAddPosts(assembly, "route-control-lookout-bearers", [
    { x: deck.x - deck.w / 2 + 0.35, z: deck.z - deck.d / 2 + 0.35 },
    { x: deck.x, z: deck.z - deck.d / 2 + 0.35 },
    { x: deck.x + deck.w / 2 - 0.35, z: deck.z - deck.d / 2 + 0.35 },
    { x: deck.x - deck.w / 2 + 0.35, z: deck.z + deck.d / 2 - 0.35 },
    { x: deck.x, z: deck.z + deck.d / 2 - 0.35 },
    { x: deck.x + deck.w / 2 - 0.35, z: deck.z + deck.d / 2 - 0.35 }
  ], deck.baseY, deckBearingHeight, 0.28, "timber-structure", ["ground"]);
  architectureAddRunPrism(assembly, "route-control-lookout-far-bearer",
    { x: deck.x - deck.w / 2 + 0.2, z: deck.z - deck.d / 2 + 0.35 },
    { x: deck.x + deck.w / 2 - 0.2, z: deck.z - deck.d / 2 + 0.35 },
    deckTop - 0.18, 0.2, 0.24, "timber-structure",
    ["route-control-lookout-bearers"]);
  architectureAddRunPrism(assembly, "route-control-lookout-near-bearer",
    { x: deck.x - deck.w / 2 + 0.2, z: deck.z + deck.d / 2 - 0.35 },
    { x: deck.x + deck.w / 2 - 0.2, z: deck.z + deck.d / 2 - 0.35 },
    deckTop - 0.18, 0.2, 0.24, "timber-structure",
    ["route-control-lookout-bearers"]);
  architectureAddSlab(assembly, "route-control-lookout-deck",
    { x: deck.x, z: deck.z }, { x: deck.w, z: deck.d },
    deckTop, 0.34, "timber-surface",
    ["route-control-lookout-far-bearer", "route-control-lookout-near-bearer"], "walk");
  architectureAddParapetRect(assembly, "route-control-lookout-edge",
    { x: deck.x, z: deck.z }, deck.w, deck.d,
    deckTop, 0.78, 0.34, ["route-control-lookout-deck"], "south");
  /* Keep the signal support a device-scale yoke, not a deck-wide portal frame. The latter
     reads as an unfinished storey at gameplay distance and overwhelms the actual bell citizen. */
  var signalHalfSpan = Math.min(0.72, Math.max(0.52, deck.w * 0.13));
  var signalZ = deck.z - deck.d / 2 + 0.52;
  architectureAddPosts(assembly, "route-control-signal-posts", [
    { x: deck.x - signalHalfSpan, z: signalZ },
    { x: deck.x + signalHalfSpan, z: signalZ }
  ], deckTop, 1.62, 0.22, "timber-structure", ["route-control-lookout-deck"]);
  architectureAddRunPrism(assembly, "route-control-signal-crossbeam",
    { x: deck.x - signalHalfSpan, z: signalZ },
    { x: deck.x + signalHalfSpan, z: signalZ },
    deckTop + 1.42, 0.2, 0.2, "timber-structure",
    ["route-control-signal-posts"], { ownerId: "route-control-signal-posts" });
  var deckStairX = Math.min(deck.x + 0.2, guard.x - guardHalfW - 1.05);
  var deckStairTopZ = deck.z + deck.d / 2;
  var deckStairBaseY = Math.min(guard.baseY + 0.05, deckTop - 0.9);
  architectureAddStair(assembly, {
    id: "route-control-deck-stair",
    start: { x: deckStairX, z: deckStairTopZ + 2.35 },
    end: { x: deckStairX, z: deckStairTopZ },
    baseY: deckStairBaseY, topY: deckTop, width: 1.16, steps: 6,
    lowerLandingId: "zone-work-readiness",
    upperLandingId: "route-control-lookout-deck",
    supportedBy: [
      "ground", "route-control-lookout-deck", "route-control-lookout-bearers",
      "route-control-lookout-near-bearer"
    ],
    foundationBaseY: deckStairBaseY - 0.12,
    supportMode: "grounded-solid", cheeks: true, role: "masonry-edge"
  });

  /* The old retaining run is split only where construction history requires it. The middle repair
     is new dressed work with a real drainage void; unequal older runs follow the working shelf
     without becoming repeated contour strata. */
  var retainingStartZ = retaining.z - retaining.d / 2;
  var retainingEndZ = retaining.z + retaining.d / 2;
  var retainingBreakA = retainingStartZ + retaining.d * 0.36;
  var retainingBreakB = retainingStartZ + retaining.d * 0.71;
  var repairThickness = Math.max(0.48, retaining.w);
  var drainOutfallZ = retainingBreakA + (retainingBreakB - retainingBreakA) * 0.58;
  var retainingFootingEmbed = Math.max(0.36, q * 0.76);
  var retainingFooting = architectureAddTerrainEmbeddedRunFooting(assembly, {
    id: "route-control-retaining-continuous-gravel-footing",
    start: { x: retaining.x, z: retainingStartZ },
    end: { x: retaining.x, z: retainingEndZ },
    bearingY: retaining.baseY,
    embedDepth: retainingFootingEmbed,
    overlap: 0.045,
    thickness: Math.max(0.58, retaining.w + 0.12),
    role: "foundation-gravel",
    supportedBy: ["ground"],
    ownerId: "route-control-retaining-wall"
  });
  architectureAddRunPrism(assembly, "route-control-retaining-old-far",
    { x: retaining.x, z: retainingStartZ },
    { x: retaining.x, z: retainingBreakA },
    retaining.baseY, 2.22, Math.max(0.46, retaining.w),
    "masonry-wall", ["ground", retainingFooting.memberId], { cover: "full-cover" });
  architectureAddRunPrism(assembly, "route-control-retaining-old-far-coping",
    { x: retaining.x, z: retainingStartZ },
    { x: retaining.x, z: retainingBreakA },
    retaining.baseY + 2.22, 0.16, Math.max(0.58, retaining.w + 0.14),
    "masonry-edge", ["route-control-retaining-old-far"]);
  architectureAddWallRun(assembly, {
    id: "route-control-drainage-repair",
    start: { x: retaining.x, z: retainingBreakA },
    end: { x: retaining.x, z: retainingBreakB },
    baseY: retaining.baseY, height: 1.92, thickness: repairThickness,
    role: "repair", supportedBy: ["ground", retainingFooting.memberId],
    openings: [{
      id: "route-control-drain-outfall",
      station: (retainingBreakB - retainingBreakA) * 0.58,
      width: 0.48, bottom: 0, height: 0.44,
      kind: "drainage-outfall", access: "none"
    }]
  });
  architectureAddRunPrism(assembly, "route-control-drainage-repair-coping",
    { x: retaining.x, z: retainingBreakA },
    { x: retaining.x, z: retainingBreakB },
    retaining.baseY + 1.92, 0.17, Math.max(0.6, retaining.w + 0.16),
    "repair", ["route-control-drainage-repair"]);
  architectureAddRunPrism(assembly, "route-control-retaining-old-near",
    { x: retaining.x, z: retainingBreakB },
    { x: retaining.x, z: retainingEndZ },
    retaining.baseY, 1.48, Math.max(0.46, retaining.w),
    "masonry-wall", ["ground", retainingFooting.memberId], { cover: "half-cover" });
  architectureAddRunPrism(assembly, "route-control-retaining-old-near-coping",
    { x: retaining.x, z: retainingBreakB },
    { x: retaining.x, z: retainingEndZ },
    retaining.baseY + 1.48, 0.15, Math.max(0.58, retaining.w + 0.14),
    "masonry-edge", ["route-control-retaining-old-near"]);
  architectureAddRunPrism(assembly, "route-control-drain-channel",
    { x: retaining.x - 0.04, z: drainOutfallZ },
    { x: retaining.x + 1.28, z: drainOutfallZ },
    retaining.baseY + 0.04, 0.12, 0.42, "repair",
    ["ground", "route-control-drainage-repair"]);
  assembly.retainingFooting = retainingFooting;

  /* CONDITION IS EDGE-ORIGIN, NOT EDGE-CONFINED. The Whiteholm reference has three readable
     scales of surface history: a broad dirty/damp lower-wall band, mid-sized moss islands spreading
     from wet seams, and large ivy masses rooted where walls, columns, and ground meet. Parent
     masonry still owns construction rhythm, normal, ORM, and lighting response; these paper-thin
     presentation receivers own only condition color and alpha. New repair coping remains cleaner.
     All coordinates derive from committed architecture facts, so mutations move the condition
     grammar without changing collision, access, cover, or the mechanics fingerprint. */
  var runoffFaceX = retaining.x + repairThickness / 2 + 0.025;
  var outfallHalfWidth = 0.24;
  var outfallLeftZ = drainOutfallZ - outfallHalfWidth;
  var outfallRightZ = drainOutfallZ + outfallHalfWidth;
  var conditionPresentation = {
    access: "none",
    presentationOnly: true,
    mechanicalEffect: "none"
  };
  var lowerWallGrimeIds = [];
  function addLowerWallGrime(id, start, end, baseY, height, supportId){
    var supportIds = Array.isArray(supportId) ? supportId.slice() : [supportId];
    var member = architectureAddRunPrism(assembly, id, start, end,
      baseY, height, 0.035, "condition-lower-wall-grime", supportIds,
      Object.assign({}, conditionPresentation, {
        ownerId: supportIds[0], condition: "age-damp-and-ground-contact"
      }));
    lowerWallGrimeIds.push(member.id);
    return member;
  }
  /* The support itself is the moisture origin. A closed mitered receiver wraps the complete
     exposed foundation before any higher wall stain is added, so every bearing sees condition
     running flush to the true contact datum and every foundation corner shares one exact seam.
     This replaces the rejected behavior where only two upper-wall faces carried decorative grime
     while the gravel-contact plinth stayed uniformly clean. */
  var foundationConditionOuter = {
    minX: guard.x - (guard.w + 0.45) / 2 - 0.018,
    maxX: guard.x + (guard.w + 0.45) / 2 + 0.018,
    minZ: guard.z - (guard.d + 0.44) / 2 - 0.018,
    maxZ: guard.z + (guard.d + 0.44) / 2 + 0.018
  };
  var foundationConditionInner = {
    minX: guard.x - (guard.w + 0.45) / 2 + 0.017,
    maxX: guard.x + (guard.w + 0.45) / 2 - 0.017,
    minZ: guard.z - (guard.d + 0.44) / 2 + 0.017,
    maxZ: guard.z + (guard.d + 0.44) / 2 - 0.017
  };
  var foundationGrimeLoop = architectureAddMiteredRectLoop(assembly, {
    id: "route-control-grime-guard-foundation-contact-loop",
    outerBounds: foundationConditionOuter,
    innerBounds: foundationConditionInner,
    baseY: guardFoundationBottom + 0.004,
    height: guardFoundationThickness - 0.008,
    role: "condition-lower-wall-grime",
    supportedBy: ["route-control-guard-foundation"],
    ownerId: "route-control-guard-foundation",
    presentationOnly: true,
    mechanicalEffect: "none"
  });
  lowerWallGrimeIds = lowerWallGrimeIds.concat(foundationGrimeLoop.memberIds);
  addLowerWallGrime("route-control-grime-retaining-old-far",
    { x: runoffFaceX, z: retainingStartZ + 0.08 },
    { x: runoffFaceX, z: retainingBreakA - 0.14 },
    retaining.baseY + 0.018, 0.78, "route-control-retaining-old-far");
  addLowerWallGrime("route-control-grime-retaining-old-near",
    { x: runoffFaceX, z: retainingBreakB + 0.14 },
    { x: runoffFaceX, z: retainingEndZ - 0.08 },
    retaining.baseY + 0.018, 0.62, "route-control-retaining-old-near");
  var guardStreetFaceX = guard.x + guardHalfW + 0.225;
  var guardFarFaceZ = guard.z - guardHalfD - 0.235;
  var guardUphillFaceX = guard.x - guardHalfW - 0.245;
  var guardNearFaceZ = guard.z + guardHalfD + 0.235;
  if(presentationLightMode === "night"){
    /* Two source-backed practicals, no ambient fairy light: one identifies the operated shutter,
       one identifies the controlled road mechanism. Their visible bodies and PointLight sockets
       share coordinates and supports, so every pool has a readable physical cause. */
    var shutterLampZ = guard.z - guardHalfD + 1.02;
    architectureAddBox(assembly, "route-control-shutter-lamp-bracket",
      {
        x: guardStreetFaceX + 0.02,
        y: guardWallBase + 2.52,
        z: shutterLampZ
      },
      { x: 0.18, y: 0.38, z: 0.28 }, "practical-housing",
      ["route-control-guard-street-wall"], {
        presentationOnly: true, mechanicalEffect: "none"
      });
    architectureAddBox(assembly, "route-control-shutter-lamp-emitter",
      {
        x: guardStreetFaceX + 0.13,
        y: guardWallBase + 2.48,
        z: shutterLampZ
      },
      { x: 0.14, y: 0.2, z: 0.18 }, "practical-emitter",
      ["route-control-shutter-lamp-bracket"], {
        presentationOnly: true, mechanicalEffect: "none"
      });
    architectureAddLightSocket(assembly, {
      id: "route-control-shutter-practical",
      purpose: "operated-observation-and-door-threshold",
      supportId: "route-control-shutter-lamp-emitter",
      at: {
        x: guardStreetFaceX + 0.18,
        y: guardWallBase + 2.48,
        z: shutterLampZ
      },
      color: 0xffb35f, intensity: 22, distance: 7.2, decay: 2
    });

    var barrierLampX = barrier.x + (barrier.w / 2 - 0.36);
    architectureAddBox(assembly, "route-control-barrier-lamp-housing",
      {
        x: barrierLampX,
        y: barrier.baseY + 1.78,
        z: barrier.z
      },
      { x: 0.28, y: 0.08, z: 0.28 }, "practical-housing",
      ["route-control-barrier-post-east"], {
        presentationOnly: true, mechanicalEffect: "none"
      });
    architectureAddBox(assembly, "route-control-barrier-lamp-emitter",
      {
        x: barrierLampX,
        y: barrier.baseY + 1.91,
        z: barrier.z
      },
      { x: 0.18, y: 0.2, z: 0.18 }, "practical-emitter",
      ["route-control-barrier-lamp-housing"], {
        presentationOnly: true, mechanicalEffect: "none"
      });
    architectureAddBox(assembly, "route-control-barrier-lamp-cap",
      {
        x: barrierLampX,
        y: barrier.baseY + 2.05,
        z: barrier.z
      },
      { x: 0.24, y: 0.07, z: 0.24 }, "practical-housing",
      ["route-control-barrier-lamp-emitter"], {
        presentationOnly: true, mechanicalEffect: "none"
      });
    architectureAddLightSocket(assembly, {
      id: "route-control-barrier-practical",
      purpose: "controlled-road-mechanism",
      supportId: "route-control-barrier-lamp-emitter",
      at: {
        x: barrierLampX,
        y: barrier.baseY + 1.92,
        z: barrier.z
      },
      color: 0xff9b4a, intensity: 16, distance: 6.2, decay: 2
    });
    var lookoutLampX = deck.x + deck.w / 2 - 0.62;
    var lookoutLampZ = deck.z - deck.d / 2 + 0.58;
    architectureAddBox(assembly, "route-control-lookout-lamp-housing",
      { x: lookoutLampX, y: deckTop + 0.72, z: lookoutLampZ },
      { x: 0.24, y: 0.46, z: 0.24 }, "practical-housing",
      ["route-control-lookout-edge"], {
        presentationOnly: true, mechanicalEffect: "none"
      });
    architectureAddBox(assembly, "route-control-lookout-lamp-emitter",
      { x: lookoutLampX, y: deckTop + 0.74, z: lookoutLampZ },
      { x: 0.16, y: 0.24, z: 0.16 }, "practical-emitter",
      ["route-control-lookout-lamp-housing"], {
        presentationOnly: true, mechanicalEffect: "none"
      });
    architectureAddBox(assembly, "route-control-lookout-lamp-cap",
      { x: lookoutLampX, y: deckTop + 0.99, z: lookoutLampZ },
      { x: 0.28, y: 0.08, z: 0.28 }, "practical-housing",
      ["route-control-lookout-lamp-housing"], {
        presentationOnly: true, mechanicalEffect: "none"
      });
    architectureAddLightSocket(assembly, {
      id: "route-control-lookout-practical",
      purpose: "occupied-lookout-and-signal-readiness",
      supportId: "route-control-lookout-lamp-emitter",
      at: { x: lookoutLampX, y: deckTop + 0.76, z: lookoutLampZ },
      color: 0xffc777, intensity: 18, distance: 6.8, decay: 2
    });
    assembly.motivatedPracticalAudit = {
      schema: "MotivatedPracticalAuditV1",
      mode: "night-only",
      fixtureMemberIds: [
        "route-control-shutter-lamp-bracket",
        "route-control-shutter-lamp-emitter",
        "route-control-barrier-lamp-housing",
        "route-control-barrier-lamp-emitter",
        "route-control-barrier-lamp-cap",
        "route-control-lookout-lamp-housing",
        "route-control-lookout-lamp-emitter",
        "route-control-lookout-lamp-cap"
      ],
      lightSocketIds: [
        "route-control-shutter-practical",
        "route-control-barrier-practical",
        "route-control-lookout-practical"
      ],
      sourceBacked: true,
      mechanicalEffect: "none"
    };
  }
  addLowerWallGrime("route-control-grime-guard-street-old-base",
    { x: guardStreetFaceX, z: guard.z - guardHalfD + 0.06 },
    { x: guardStreetFaceX, z: guard.z - guardHalfD + 2.46 },
    guardFoundationBottom + 0.004,
    guardFoundationThickness + 0.714,
    ["route-control-guard-street-wall", "route-control-guard-foundation"]);
  addLowerWallGrime("route-control-grime-guard-far-old-base",
    { x: guard.x - guardHalfW + 0.08, z: guardFarFaceZ },
    { x: guard.x + guardHalfW - 0.08, z: guardFarFaceZ },
    guardFoundationBottom + 0.004,
    guardFoundationThickness + 0.594,
    ["route-control-guard-far-return", "route-control-guard-foundation"]);
  addLowerWallGrime("route-control-grime-guard-near-old-base",
    { x: guard.x + guardHalfW - 0.08, z: guardNearFaceZ },
    { x: guard.x - guardHalfW + 0.08, z: guardNearFaceZ },
    guardWallBase - 0.006, 0.52,
    ["route-control-guard-near-return", "route-control-guard-foundation"]);
  addLowerWallGrime("route-control-grime-guard-uphill-old-base",
    { x: guardUphillFaceX, z: guard.z + guardHalfD - 0.08 },
    { x: guardUphillFaceX, z: guard.z - guardHalfD + 0.08 },
    guardWallBase - 0.006, 0.46,
    ["route-control-guard-uphill-wall", "route-control-guard-foundation"]);

  var seamMossIds = [];
  function addSeamMoss(id, start, end, baseY, height, thickness, supportId, ownerId){
    var member = architectureAddRunPrism(assembly, id, start, end,
      baseY, height, thickness, "condition-seam-moss", [supportId],
      Object.assign({}, conditionPresentation, {
        ownerId: ownerId || supportId, condition: "causal-damp-growth"
      }));
    seamMossIds.push(member.id);
    return member;
  }
  addSeamMoss("route-control-moss-outfall-left-pocket",
    { x: runoffFaceX + 0.003, z: outfallLeftZ - 0.5 },
    { x: runoffFaceX + 0.003, z: outfallLeftZ + 0.05 },
    retaining.baseY + 0.02, 0.72, 0.038,
    "route-control-drainage-repair", "route-control-drain-outfall");
  addSeamMoss("route-control-moss-outfall-right-pocket",
    { x: runoffFaceX + 0.003, z: outfallRightZ - 0.05 },
    { x: runoffFaceX + 0.003, z: outfallRightZ + 0.42 },
    retaining.baseY + 0.02, 0.58, 0.038,
    "route-control-drainage-repair", "route-control-drain-outfall");
  addSeamMoss("route-control-moss-channel-left-lip",
    { x: retaining.x + 0.03, z: drainOutfallZ - 0.13 },
    { x: retaining.x + 0.62, z: drainOutfallZ - 0.13 },
    retaining.baseY + 0.177, 0.028, 0.15,
    "route-control-drain-channel", "route-control-drain-channel");
  addSeamMoss("route-control-moss-channel-right-lip",
    { x: retaining.x + 0.03, z: drainOutfallZ + 0.13 },
    { x: retaining.x + 0.46, z: drainOutfallZ + 0.13 },
    retaining.baseY + 0.177, 0.028, 0.15,
    "route-control-drain-channel", "route-control-drain-channel");

  var cornerIvyIds = [];
  function addCornerIvy(id, start, end, baseY, height, supportId, faceRole){
    var member = architectureAddRunPrism(assembly, id, start, end,
      baseY, height, 0.036, faceRole,
      [supportId, "route-control-guard-foundation"],
      Object.assign({}, conditionPresentation, {
        ownerId: supportId, condition: "corner-rooted-ivy"
      }));
    cornerIvyIds.push(member.id);
    return member;
  }
  var ivyOuterCorner = {
    x: guardStreetFaceX + 0.004,
    z: guardFarFaceZ - 0.004
  };
  addCornerIvy("route-control-ivy-guard-far-road-street-face",
    { x: ivyOuterCorner.x, z: ivyOuterCorner.z },
    { x: ivyOuterCorner.x, z: guard.z - guardHalfD + 0.3 },
    guardFoundationBottom + 0.004, guardFoundationThickness + 1.996,
    "route-control-guard-street-wall",
    "condition-corner-ivy-a");
  addCornerIvy("route-control-ivy-guard-far-road-return-face",
    { x: ivyOuterCorner.x - 1.72, z: ivyOuterCorner.z },
    { x: ivyOuterCorner.x, z: ivyOuterCorner.z },
    guardFoundationBottom + 0.004, guardFoundationThickness + 2.176,
    "route-control-guard-far-return",
    "condition-corner-ivy-b");

  architectureAddRunPrism(assembly, "route-control-runoff-channel-wet-cap",
    { x: retaining.x + 0.08, z: drainOutfallZ },
    { x: retaining.x + 1.18, z: drainOutfallZ },
    retaining.baseY + 0.155, 0.035, 0.34, "condition-wet-stone",
    ["route-control-drain-channel"], {
      ownerId: "route-control-drain-channel",
      access: "none", condition: "causal-runoff"
    });
  assembly.conditionProjection = [
    {
      id: "route-control-lower-wall-history",
      causeRefs: [
        "route-control-retaining-old-far", "route-control-retaining-old-near",
        "route-control-guard-street-wall", "route-control-guard-uphill-wall",
        "route-control-guard-far-return", "route-control-guard-near-return",
        "route-control-guard-foundation"
      ],
      cleanInterruptionRefs: [
        "route-control-drainage-repair", "route-control-drainage-repair-coping"
      ],
      materialRoles: ["condition-lower-wall-grime"],
      geometryMemberIds: lowerWallGrimeIds,
      projection: "wall-ground-origin-with-irregular-upward-fade",
      placementGrammar: "broad-lower-band",
      faceCoverageRule: "edge-origin-not-edge-confined",
      supportContactRule: "condition-crosses-wall-foundation-seam-to-true-support-bottom",
      foundationClosure: foundationGrimeLoop,
      receiverBands: [
        {
          id: "guardroom-complete-contact-envelope",
          memberPrefixes: [
            "route-control-guard-foundation",
            "route-control-guard-street-wall",
            "route-control-guard-uphill-wall",
            "route-control-guard-far-return",
            "route-control-guard-near-return",
            "route-control-guard-structural-corner"
          ],
          rootMode: "terrain-contact-line",
          rootY: +(guardFoundationBottom + 0.004).toFixed(4),
          riseWorldHeight: 1.8,
          horizontalRepeatWorldLength: 1.65
        },
        {
          id: "retaining-continuous-footing-contact",
          memberPrefixes: ["route-control-retaining-continuous-gravel-footing"],
          rootMode: "terrain-contact-line",
          rootY: +(retaining.baseY - retainingFootingEmbed).toFixed(4),
          riseWorldHeight: +(retainingFootingEmbed + 0.4).toFixed(4),
          horizontalRepeatWorldLength: 1.65,
          receiverFaceMode: "vertical-and-upward-support"
        },
        {
          id: "retaining-old-far-contact",
          memberPrefixes: ["route-control-retaining-old-far"],
          rootMode: "terrain-contact-line",
          rootY: +(retaining.baseY + 0.018).toFixed(4),
          riseWorldHeight: 1.05,
          horizontalRepeatWorldLength: 1.65
        },
        {
          id: "retaining-old-near-contact",
          memberPrefixes: ["route-control-retaining-old-near"],
          rootMode: "terrain-contact-line",
          rootY: +(retaining.baseY + 0.018).toFixed(4),
          riseWorldHeight: 0.95,
          horizontalRepeatWorldLength: 1.65
        }
      ],
      visibilityRule: "readable-at-gameplay-scale",
      mechanicalEffect: "none",
      mutationLaw: "derive-from-old-wall-and-ground-contact-facts"
    },
    {
      id: "route-control-drainage-water-history",
      causeRefs: ["route-control-drain-outfall", "route-control-drain-channel"],
      cleanInterruptionRefs: ["route-control-drainage-repair-coping"],
      materialRoles: ["condition-seam-moss", "condition-wet-stone"],
      geometryMemberIds: seamMossIds.concat(["route-control-runoff-channel-wet-cap"]),
      projection: "outfall-origin-to-readable-seam-islands",
      placementGrammar: "edge-origin-with-outward-spread",
      faceCoverageRule: "mid-scale-unequal-pockets",
      visibilityRule: "readable-at-gameplay-scale",
      mechanicalEffect: "none",
      mutationLaw: "derive-from-repair-and-outfall-facts"
    },
    {
      id: "route-control-corner-ivy-history",
      causeRefs: [
        "route-control-guard-foundation", "route-control-guard-street-wall",
        "route-control-guard-far-return"
      ],
      cleanInterruptionRefs: ["route-control-guard-door", "route-control-shutter-sill"],
      materialRoles: ["condition-corner-ivy"],
      geometryMemberIds: cornerIvyIds,
      projection: "two-face-wall-floor-corner-wrap",
      placementGrammar: "contact-rooted-silhouette-cluster",
      faceCoverageRule: "large-growth-mass-with-negative-gaps",
      sharedCornerAnchor: ivyOuterCorner,
      cornerContinuityRule: "both-face-receivers-share-one-outer-corner-endpoint",
      rootSupportRef: "ground",
      rootReceiverRef: "route-control-guard-foundation",
      rootDatumY: guard.baseY,
      rootRule:
        "growth-first-visible-at-gravel-foundation-contact-then-crosses-foundation-wall-seam",
      visibilityRule: "readable-at-gameplay-scale",
      mechanicalEffect: "none",
      mutationLaw: "derive-from-supported-wall-corner-facts"
    }
  ];

  /* The controlled barrier remains road-normal and visually permeable: two grounded sockets,
     timber uprights, one operable beam, and a visible counterbrace. */
  var barrierBottom = barrier.baseY;
  var barrierPostX = barrier.w / 2 - 0.36;
  [-1, 1].forEach(function(sign){
    var side = sign < 0 ? "west" : "east";
    architectureAddBox(assembly, "route-control-barrier-socket-" + side,
      { x: barrier.x + sign * barrierPostX, y: barrierBottom + 0.24, z: barrier.z },
      { x: 0.62, y: 0.48, z: 0.72 }, "foundation", ["ground"]);
    architectureAddBox(assembly, "route-control-barrier-post-" + side,
      { x: barrier.x + sign * barrierPostX, y: barrierBottom + 1.03, z: barrier.z },
      { x: 0.3, y: 1.58, z: 0.34 }, "timber-structure",
      ["route-control-barrier-socket-" + side]);
  });
  architectureAddRunPrism(assembly, "route-control-barrier-beam",
    { x: barrier.x - barrierPostX + 0.14, z: barrier.z },
    { x: barrier.x + barrierPostX - 0.14, z: barrier.z },
    barrierBottom + 0.86, 0.27, 0.24, "timber-structure",
    ["route-control-barrier-post-west", "route-control-barrier-post-east"], {
      ownerId: "route-control-barrier", access: "controlled"
    });
  architectureAddBeam3D(assembly, "route-control-barrier-counterbrace",
    { x: barrier.x - barrierPostX, y: barrierBottom + 0.42, z: barrier.z },
    { x: barrier.x - barrierPostX + 1.2, y: barrierBottom + 1.38, z: barrier.z },
    0.18, "timber-structure",
    ["route-control-barrier-socket-west", "route-control-barrier-post-west"], {
      ownerId: "route-control-barrier"
    });
  assembly.barrierAudit = {
    orthogonal: true,
    passageClear: true,
    controlledWidth: barrier.w,
    roadMarkedCells: plan.terrainPlan.routeReport.road.markedCells,
    sourceStructureId: structures["road-barrier"].id
  };

  /* Sparse operational witnesses answer the profile's semantic prop demands. They sit only at
     engine-owned, clearance-audited locations: the bell on the lookout deck and the windlass
     outside the controlled road. Donors never own the barrier state, route, collision, support,
     terrain, or signal logic; omission therefore leaves the complete compiled site intact. */
  architectureAddAssetSocket(assembly, {
    id: "route-control-lookout-signal",
    ownerId: "route-control-lookout-deck",
    purpose: "lookout-operation-signal-cluster",
    allowedSlugs: ["alarm-bell-yoke"],
    at: {
      x: deck.x,
      y: deckTop + 0.05,
      z: deck.z - deck.d / 2 + 0.52
    },
    yaw: 0,
    scale: 0.9,
    materialContext: gvsClone(operationalPropMaterialContext),
    collisionAuthority: "engine-plan",
    stateOwner: "site-runtime",
    fallback: {
      kind: "compiled-members",
      memberIds: ["route-control-signal-posts", "route-control-signal-crossbeam"],
      reason: "the operated lookout remains legible without its optional bell citizen"
    }
  });
  architectureAddAssetSocket(assembly, {
    id: "route-control-barrier-windlass",
    ownerId: "route-control-barrier-socket-west",
    purpose: "barrier-and-repair-work-cluster",
    allowedSlugs: ["hand-windlass"],
    at: {
      x: barrier.x - barrier.w / 2 - 0.82,
      y: barrierBottom + 0.05,
      z: barrier.z + 0.92
    },
    yaw: Math.PI / 2,
    scale: 0.9,
    materialContext: gvsClone(operationalPropMaterialContext),
    collisionAuthority: "engine-plan",
    stateOwner: "site-runtime",
    fallback: {
      kind: "omit",
      reason: "optional work witness outside the committed road clearance"
    }
  });
  architectureAddAssetSocket(assembly, {
    id: "route-control-lookout-stores",
    ownerId: "route-control-lookout-deck",
    purpose: "guard-occupation-supply-cluster",
    allowedSlugs: ["camp-kitchen-stores"],
    at: {
      x: deck.x + deck.w / 2 - 0.68,
      y: deckTop + 0.05,
      z: deck.z - deck.d / 2 + 0.72
    },
    yaw: Math.PI,
    scale: 0.72,
    materialContext: gvsClone(operationalPropMaterialContext),
    collisionAuthority: "engine-plan",
    stateOwner: "site-runtime",
    fallback: {
      kind: "omit",
      reason: "optional stores witness; lookout support and parapet remain complete without donor"
    }
  });
  /* Two defensive witnesses attach to construction facts that already own collision and support.
     They enrich the retaining story without scattering generic clutter or turning donor bounds
     into new gameplay: one timber brace explains the drainage repair, one gabion reinforces the
     old near retaining run. */
  architectureAddAssetSocket(assembly, {
    id: "route-control-drainage-repair-brace",
    ownerId: "route-control-drainage-repair",
    purpose: "causal-retaining-repair-witness",
    allowedSlugs: ["timber-repair-brace"],
    at: {
      x: retaining.x + repairThickness / 2 + 0.38,
      y: retaining.baseY + 0.04,
      z: drainOutfallZ
    },
    yaw: Math.PI / 2,
    scale: 0.72,
    materialContext: gvsClone(operationalPropMaterialContext),
    collisionAuthority: "route-control-drainage-repair",
    stateOwner: "site-runtime",
    fallback: {
      kind: "omit",
      reason: "the compiled repair infill and coping retain the complete construction truth"
    }
  });
  architectureAddAssetSocket(assembly, {
    id: "route-control-retaining-near-gabion",
    ownerId: "route-control-retaining-old-near",
    purpose: "defensive-retaining-reinforcement",
    allowedSlugs: ["gabion-stone-basket"],
    at: {
      x: retaining.x + retaining.w / 2 + 0.48,
      y: retaining.baseY + 0.04,
      z: (retainingBreakB + retainingEndZ) / 2
    },
    yaw: 0,
    scale: 0.66,
    materialContext: gvsClone(operationalPropMaterialContext),
    collisionAuthority: "route-control-retaining-old-near",
    stateOwner: "site-runtime",
    fallback: {
      kind: "omit",
      reason: "the compiled retaining run remains the full-cover authority"
    }
  });
  assembly.propDemandBindings = [
    {
      demandId: "signal-cluster",
      socketId: "route-control-lookout-signal",
      semanticRef: "lookout-operation",
      maximumClusters: 1
    },
    {
      demandId: "work-cluster",
      socketId: "route-control-barrier-windlass",
      semanticRef: "barrier-and-repair",
      maximumClusters: 1
    },
    {
      demandId: "supply-cluster",
      socketId: "route-control-lookout-stores",
      semanticRef: "guard-occupation",
      maximumClusters: 1
    },
    {
      demandId: "repair-witness",
      socketId: "route-control-drainage-repair-brace",
      semanticRef: "drainage-repair-history",
      maximumClusters: 1
    },
    {
      demandId: "defensive-reinforcement",
      socketId: "route-control-retaining-near-gabion",
      semanticRef: "retaining-defense",
      maximumClusters: 1
    }
  ].map(function(binding){
    return Object.assign(binding, {
      placementAuthority: "engine-owned-asset-socket",
      mechanicalEffect: "none"
    });
  });

  architectureAddAccess(assembly, "route-control-road",
    "entry-continuation", "exit-continuation", "controlled-road", 2.5);
  architectureAddAccess(assembly, "route-control-guard-door-access",
    "work-apron", "guardroom-frontage", "door", 1.08);
  architectureAddAccess(assembly, "route-control-deck-access",
    "work-apron", "lookout-deck", "stair", 1.16);
  architectureAddAccess(assembly, "route-control-terrain-flank",
    "quiet-approach", "lookout-deck", "ramp", 1.7);
  architectureRegisterClearanceEnvelope(assembly, {
    id: "route-control-upright-medium",
    profileId: "upright-medium",
    zoneIds: ["work-apron", "guardroom-frontage", "lookout-deck"],
    portalOpeningIds: ["route-control-guard-door"],
    accessEdgeIds: ["route-control-guard-door-access", "route-control-deck-access"],
    routeWidth: 1.16, turnDiameter: 1.6, verticalMode: "stair"
  });
  architectureRegisterClearanceEnvelope(assembly, {
    id: "route-control-broad-medium-road",
    profileId: "broad-medium",
    zoneIds: ["entry-continuation", "controlled-threshold", "exit-continuation"],
    portalOpeningIds: [],
    accessEdgeIds: ["route-control-road", "route-control-terrain-flank"],
    routeWidth: 2.5, turnDiameter: 2.6, verticalMode: "ramp"
  });
  architectureRegisterClearanceEnvelope(assembly, {
    id: "route-control-long-medium-road",
    profileId: "long-medium",
    zoneIds: ["entry-continuation", "controlled-threshold", "exit-continuation"],
    portalOpeningIds: [],
    accessEdgeIds: ["route-control-road", "route-control-terrain-flank"],
    routeWidth: 2.5, turnDiameter: 3.1, verticalMode: "ramp"
  });

  /* CULTURE MORPHOLOGY IS ENGINE-OWNED PRESENTATION GEOMETRY. It may wrap, brace, hood, or trim
     the committed shell, but it has `mechanicalEffect:none`: no member moves a route, opening,
     support datum, cover fact, stair, or collision authority. Stable seed variation selects a
     reviewed attachment arrangement rather than scattering independent pieces. */
  var cultureVariantIndex = gvsSubSeed(
    presentationSeed, "guard-culture-morphology:" + presentationCultureId) % 5;
  var cultureStyleIndex = [0, 1, 2, 2, 0][cultureVariantIndex];
  var cultureRoofOverhang = 0.38;
  var cultureRoofEaveY = guardWallTop + 0.12;
  var cultureRoofWidth = guard.w + cultureRoofOverhang * 2;
  var cultureRoofDepth = guard.d + cultureRoofOverhang * 2;
  var cultureRoofRidgeLength = Math.max(0.55, cultureRoofWidth - cultureRoofDepth);
  var cultureRoofRidgeY = cultureRoofEaveY
    + cultureRoofDepth / 2 * Math.tan(guardRoofPitchDeg * Math.PI / 180);
  var cultureMemberIds = [];
  function cultureExtra(extra){
    return Object.assign({
      presentationOnly: true,
      mechanicalEffect: "none",
      cultureRef: presentationCultureId,
      variantRef: "guard-culture-v" + cultureVariantIndex
    }, extra || {});
  }
  function rememberCulture(member){
    if(member) cultureMemberIds.push(member.id);
    return member;
  }
  if(presentationCultureId === "institutional-frontier"){
    var institutionalQuoin = [0.24, 0.28, 0.32][cultureStyleIndex];
    [
      { id: "far-uphill", x: guard.x - guardHalfW, z: guard.z - guardHalfD },
      { id: "far-road", x: guard.x + guardHalfW, z: guard.z - guardHalfD },
      { id: "near-road", x: guard.x + guardHalfW, z: guard.z + guardHalfD },
      { id: "near-uphill", x: guard.x - guardHalfW, z: guard.z + guardHalfD }
    ].forEach(function(corner){
      /* Institutional corners read as a deliberate coursed quoin stack, not a skinny emergency
         post. Six alternating dressed blocks share the closed neutral corner underneath, giving
         the culture a visible cadence at gameplay distance without changing collision or support. */
      var quoinCourses = 6;
      var quoinCourseHeight = guardWallHeight / quoinCourses;
      for(var quoinIndex = 0; quoinIndex < quoinCourses; quoinIndex++){
        var quoinBreadth = institutionalQuoin
          + (quoinIndex % 2 === 0 ? 0.18 : 0.08);
        rememberCulture(architectureAddBox(assembly,
          "route-control-culture-institutional-quoin-" + corner.id
            + "-course-" + quoinIndex,
          {
            x: corner.x,
            y: guardWallBase + quoinCourseHeight * (quoinIndex + 0.5),
            z: corner.z
          },
          {
            x: quoinBreadth,
            y: quoinCourseHeight + 0.018,
            z: quoinBreadth
          },
          "masonry-edge", ["route-control-guard-foundation"],
          cultureExtra({ ownerId: "route-control-guard-foundation" })));
      }
    });
    var institutionalCornice = architectureAddMiteredRectLoop(assembly, {
      id: "route-control-culture-institutional-cornice",
      outerBounds: {
        minX: guard.x - guardHalfW - 0.30,
        maxX: guard.x + guardHalfW + 0.28,
        minZ: guard.z - guardHalfD - 0.28,
        maxZ: guard.z + guardHalfD + 0.28
      },
      innerBounds: {
        minX: guard.x - guardHalfW + 0.26,
        maxX: guard.x + guardHalfW - 0.24,
        minZ: guard.z - guardHalfD + 0.24,
        maxZ: guard.z + guardHalfD - 0.24
      },
      baseY: guardWallTop - 0.22,
      height: 0.18,
      role: "masonry-edge",
      supportedBy: [
        "route-control-guard-street-wall", "route-control-guard-uphill-wall",
        "route-control-guard-far-return", "route-control-guard-near-return"
      ],
      ownerId: "route-control-guard-foundation",
      presentationOnly: true,
      mechanicalEffect: "none",
      cultureRef: presentationCultureId,
      variantRef: "guard-culture-v" + cultureVariantIndex
    });
    institutionalCornice.memberIds.forEach(function(memberId){
      cultureMemberIds.push(memberId);
    });
    institutionalCornice.includedSides = ["north", "south", "west", "east"];
    institutionalCornice.intentionalOpenSides = [];
    assembly.orthogonalRunClosures.push(institutionalCornice);
    /* A roof hue and one banner are not a culture. Institutional construction repeats one dressed
       stone datum around the WHOLE envelope: a continuous mid-wall string course that aligns the
       quoins and opening surrounds. It is deliberately the masonry analogue of the Upland timber
       belt below, so the two cultures differ by attachment practice while sharing the same closed
       neutral wall shell and mechanics. */
    var institutionalStringCourse = architectureAddMiteredOpenRectBand(assembly, {
      id: "route-control-culture-institutional-string-course",
      center: { x: guard.x, z: guard.z },
      width: guard.w + 0.28,
      depth: guard.d + 0.28,
      thickness: 0.24,
      /* The east/street face owns the real door and shutter. Its course is intentionally absent
         and its two returns are quad-capped; opening hoods and quoins carry that elevation instead.
         A future authored street-face module may add course fragments around exact apertures. */
      openSide: "east",
      baseY: guardWallBase + 1.14,
      height: 0.16,
      role: "masonry-edge",
      supportedBy: [
        "route-control-guard-street-wall", "route-control-guard-uphill-wall",
        "route-control-guard-far-return", "route-control-guard-near-return"
      ],
      ownerId: "route-control-guard-foundation",
      presentationOnly: true,
      mechanicalEffect: "none",
      cultureRef: presentationCultureId,
      variantRef: "guard-culture-v" + cultureVariantIndex
    });
    institutionalStringCourse.memberIds.forEach(function(memberId){
      cultureMemberIds.push(memberId);
    });
    assembly.orthogonalRunClosures.push(institutionalStringCourse);
    var institutionalHoods = cultureStyleIndex === 0
      ? [{ id: "door", station: guardDoorStation, width: 1.42, depth: 0.82, y: 2.13 }]
      : (cultureStyleIndex === 1
        ? [{ id: "shutter", station: 1.0, width: 1.72, depth: 0.66, y: 2.28 }]
        : [
          { id: "door", station: guardDoorStation, width: 1.34, depth: 0.72, y: 2.13 },
          { id: "shutter", station: 1.0, width: 1.58, depth: 0.58, y: 2.27 }
        ]);
    institutionalHoods.forEach(function(hood){
      rememberCulture(architectureAddBox(assembly,
        "route-control-culture-institutional-" + hood.id + "-hood",
        {
          x: guard.x + guardHalfW + hood.depth / 2 - 0.02,
          y: guardWallBase + hood.y,
          z: guard.z - guardHalfD + hood.station
        },
        { x: hood.depth, y: 0.14, z: hood.width }, "masonry-edge",
        ["route-control-guard-street-wall"],
        cultureExtra({
          ownerId: "route-control-guard-street-wall",
          rotation: { x: 0, y: 0, z: -0.08 }
        })));
    });
    if(cultureStyleIndex !== 2){
      var chimneyNear = cultureStyleIndex === 0;
      var roofHalfDepth = cultureRoofDepth / 2;
      var chimneyZ = guard.z + (chimneyNear ? 1 : -1) * (guardHalfD - 0.48);
      var chimneyDistanceFromEave = chimneyNear
        ? (guard.z + roofHalfDepth - chimneyZ)
        : (chimneyZ - (guard.z - roofHalfDepth));
      var chimneyBaseY = cultureRoofEaveY
        + chimneyDistanceFromEave * Math.tan(guardRoofPitchDeg * Math.PI / 180) - 0.08;
      var chimneySupport = "route-control-guard-hip-roof:unified-roof-shell";
      var chimneyId = "route-control-culture-institutional-chimney";
      rememberCulture(architectureAddBox(assembly, chimneyId,
        {
          x: guard.x - guardHalfW + 0.58,
          y: chimneyBaseY + 0.48,
          z: chimneyZ
        },
        { x: 0.42, y: 0.96, z: 0.42 }, "masonry-wall", [chimneySupport],
        cultureExtra({ ownerId: chimneySupport })));
      rememberCulture(architectureAddBox(assembly, chimneyId + "-cap",
        {
          x: guard.x - guardHalfW + 0.58,
          y: chimneyBaseY + 1.0,
          z: chimneyZ
        },
        { x: 0.54, y: 0.12, z: 0.54 }, "masonry-edge", [chimneyId],
        cultureExtra({ ownerId: chimneyId })));
    }
    if(cultureStyleIndex === 0){
      var institutionalBeaconPlinth = "route-control-culture-institutional-roof-beacon-plinth";
      rememberCulture(architectureAddBox(assembly, institutionalBeaconPlinth,
        {
          x: guard.x,
          y: cultureRoofRidgeY + 0.11,
          z: guard.z
        },
        { x: 0.72, y: 0.22, z: 0.72 }, "masonry-edge",
        ["route-control-guard-hip-roof:unified-roof-shell"],
        cultureExtra({ ownerId: "route-control-guard-hip-roof:unified-roof-shell" })));
      rememberCulture(architectureAddBox(assembly,
        "route-control-culture-institutional-roof-beacon-finial",
        {
          x: guard.x,
          y: cultureRoofRidgeY + 0.57,
          z: guard.z
        },
        { x: 0.12, y: 0.82, z: 0.12 }, "signifier-support",
        [institutionalBeaconPlinth],
        cultureExtra({ ownerId: institutionalBeaconPlinth })));
    }
  } else if(presentationCultureId === "upland-vernacular"){
    var uplandPost = [0.3, 0.34, 0.38][cultureStyleIndex];
    [
      { id: "far-uphill", x: guard.x - guardHalfW, z: guard.z - guardHalfD },
      { id: "far-road", x: guard.x + guardHalfW, z: guard.z - guardHalfD },
      { id: "near-road", x: guard.x + guardHalfW, z: guard.z + guardHalfD },
      { id: "near-uphill", x: guard.x - guardHalfW, z: guard.z + guardHalfD }
    ].forEach(function(corner){
      rememberCulture(architectureAddBox(assembly,
        "route-control-culture-upland-wall-post-" + corner.id,
        {
          x: corner.x,
          y: guardWallBase + guardWallHeight / 2,
          z: corner.z
        },
        { x: uplandPost, y: guardWallHeight + 0.16, z: uplandPost },
        "timber-structure", ["route-control-guard-foundation"],
        cultureExtra({ ownerId: "route-control-guard-foundation" })));
    });
    var uplandBelt = architectureAddMiteredRectLoop(assembly, {
      id: "route-control-culture-upland-wall-belt",
      outerBounds: {
        minX: guard.x - guardHalfW - 0.10,
        maxX: guard.x + guardHalfW + 0.10,
        minZ: guard.z - guardHalfD - 0.10,
        maxZ: guard.z + guardHalfD + 0.10
      },
      innerBounds: {
        minX: guard.x - guardHalfW + 0.10,
        maxX: guard.x + guardHalfW - 0.10,
        minZ: guard.z - guardHalfD + 0.10,
        maxZ: guard.z + guardHalfD - 0.10
      },
      baseY: guardWallBase + 1.12,
      height: 0.18,
      role: "timber-structure",
      supportedBy: [
        "route-control-guard-street-wall", "route-control-guard-uphill-wall",
        "route-control-guard-far-return", "route-control-guard-near-return"
      ],
      ownerId: "route-control-guard-foundation",
      presentationOnly: true,
      mechanicalEffect: "none",
      cultureRef: presentationCultureId,
      variantRef: "guard-culture-v" + cultureVariantIndex
    });
    uplandBelt.memberIds.forEach(function(memberId){ cultureMemberIds.push(memberId); });
    uplandBelt.includedSides = ["north", "south", "west", "east"];
    uplandBelt.intentionalOpenSides = [];
    assembly.orthogonalRunClosures.push(uplandBelt);
    rememberCulture(architectureAddRunPrism(assembly,
      "route-control-culture-upland-roof-ridge-pole",
      {
        x: guard.x - cultureRoofRidgeLength / 2 - 0.34,
        z: guard.z
      },
      {
        x: guard.x + cultureRoofRidgeLength / 2 + 0.34,
        z: guard.z
      },
      cultureRoofRidgeY + 0.015, 0.16, 0.16, "timber-structure",
      ["route-control-guard-hip-roof:unified-roof-shell"],
      cultureExtra({ ownerId: "route-control-guard-hip-roof:unified-roof-shell" })));
    rememberCulture(architectureAddBox(assembly,
      "route-control-culture-upland-wall-post-middle",
      {
        x: guard.x + guardHalfW + 0.225,
        y: guardWallBase + guardWallHeight / 2,
        z: guard.z - guardHalfD + guardMiddleStation
      },
      { x: 0.24, y: guardWallHeight + 0.12, z: 0.24 },
      "timber-structure", ["route-control-guard-street-wall"],
      cultureExtra({ ownerId: "route-control-guard-street-wall" })));
    [
      {
        id: "street", start: { x: guard.x + guardHalfW + 0.05, z: guard.z - guardHalfD - 0.14 },
        end: { x: guard.x + guardHalfW + 0.05, z: guard.z + guardHalfD + 0.14 },
        support: "route-control-guard-street-wall"
      },
      {
        id: "uphill", start: { x: guard.x - guardHalfW - 0.05, z: guard.z + guardHalfD + 0.14 },
        end: { x: guard.x - guardHalfW - 0.05, z: guard.z - guardHalfD - 0.14 },
        support: "route-control-guard-uphill-wall"
      },
      {
        id: "far", start: { x: guard.x - guardHalfW - 0.14, z: guard.z - guardHalfD - 0.05 },
        end: { x: guard.x + guardHalfW + 0.14, z: guard.z - guardHalfD - 0.05 },
        support: "route-control-guard-far-return"
      },
      {
        id: "near", start: { x: guard.x + guardHalfW + 0.14, z: guard.z + guardHalfD + 0.05 },
        end: { x: guard.x - guardHalfW - 0.14, z: guard.z + guardHalfD + 0.05 },
        support: "route-control-guard-near-return"
      }
    ].forEach(function(eave){
      rememberCulture(architectureAddRunPrism(assembly,
        "route-control-culture-upland-heavy-eave-" + eave.id,
        eave.start, eave.end, guardWallTop - 0.05, 0.24, 0.28,
        "timber-structure", [eave.support],
        cultureExtra({ ownerId: eave.support })));
    });
    [
      {
        id: "far-lower", start: retainingStartZ + 0.08, end: retainingBreakA - 0.12,
        baseY: retaining.baseY + 0.43, support: "route-control-retaining-old-far"
      },
      {
        id: "far-upper", start: retainingStartZ + 0.14, end: retainingBreakA - 0.18,
        baseY: retaining.baseY + 1.26, support: "route-control-retaining-old-far"
      },
      {
        id: "near-lower", start: retainingBreakB + 0.12, end: retainingEndZ - 0.06,
        baseY: retaining.baseY + 0.36, support: "route-control-retaining-old-near"
      },
      {
        id: "near-upper", start: retainingBreakB + 0.18, end: retainingEndZ - 0.12,
        baseY: retaining.baseY + 0.91, support: "route-control-retaining-old-near"
      }
    ].forEach(function(crib){
      rememberCulture(architectureAddRunPrism(assembly,
        "route-control-culture-upland-crib-" + crib.id,
        { x: retaining.x + repairThickness / 2 + 0.09, z: crib.start },
        { x: retaining.x + repairThickness / 2 + 0.09, z: crib.end },
        crib.baseY, 0.18, 0.22, "timber-structure", [crib.support],
        cultureExtra({ ownerId: crib.support })));
    });
    [
      {
        id: "far", z: (retainingStartZ + retainingBreakA) / 2,
        baseY: retaining.baseY + 0.34, height: 1.28,
        support: "route-control-retaining-old-far"
      },
      {
        id: "near", z: (retainingBreakB + retainingEndZ) / 2,
        baseY: retaining.baseY + 0.26, height: 0.94,
        support: "route-control-retaining-old-near"
      }
    ].forEach(function(pin){
      rememberCulture(architectureAddBox(assembly,
        "route-control-culture-upland-crib-pin-" + pin.id,
        {
          x: retaining.x + repairThickness / 2 + 0.1,
          y: pin.baseY + pin.height / 2,
          z: pin.z
        },
        { x: 0.2, y: pin.height, z: 0.22 }, "timber-structure", [pin.support],
        cultureExtra({ ownerId: pin.support })));
    });
    var uplandCanopyStation = [guardDoorStation, 1.0, guardMiddleStation][cultureStyleIndex];
    var uplandCanopyWidth = [1.56, 1.86, 2.2][cultureStyleIndex];
    rememberCulture(architectureAddBox(assembly,
      "route-control-culture-upland-weather-hood",
      {
        x: guard.x + guardHalfW + 0.35,
        y: guardWallBase + 2.18,
        z: guard.z - guardHalfD + uplandCanopyStation
      },
      { x: 0.76, y: 0.11, z: uplandCanopyWidth }, "roof-field",
      ["route-control-guard-street-wall"],
      cultureExtra({
        ownerId: "route-control-guard-street-wall",
        rotation: { x: 0, y: 0, z: -0.16 }
      })));
    rememberCulture(architectureAddRunPrism(assembly,
      "route-control-culture-upland-weather-hood-beam",
      {
        x: guard.x + guardHalfW + 0.68,
        z: guard.z - guardHalfD + uplandCanopyStation - uplandCanopyWidth / 2
      },
      {
        x: guard.x + guardHalfW + 0.68,
        z: guard.z - guardHalfD + uplandCanopyStation + uplandCanopyWidth / 2
      },
      guardWallBase + 2.06, 0.16, 0.18, "timber-structure",
      ["route-control-culture-upland-weather-hood"],
      cultureExtra({ ownerId: "route-control-culture-upland-weather-hood" })));
    [-1, 1].forEach(function(side){
      var bracketZ = guard.z - guardHalfD + uplandCanopyStation
        + side * (uplandCanopyWidth / 2 - 0.2);
      rememberCulture(architectureAddBeam3D(assembly,
        "route-control-culture-upland-weather-hood-bracket-"
          + (side < 0 ? "far" : "near"),
        {
          x: guard.x + guardHalfW + 0.235,
          y: guardWallBase + 1.98,
          z: bracketZ
        },
        {
          x: guard.x + guardHalfW + 0.64,
          y: guardWallBase + 2.08,
          z: bracketZ
        },
        0.1, "timber-structure", ["route-control-guard-street-wall"],
        cultureExtra({ ownerId: "route-control-guard-street-wall" })));
    });
  }
  assembly.cultureMorphology = {
    schema: "GuardPostCultureMorphologyV1",
    cultureId: presentationCultureId,
    seed: presentationSeed,
    variantIndex: cultureVariantIndex,
    styleIndex: cultureStyleIndex,
    memberIds: cultureMemberIds,
    presentationOnly: true,
    mechanicalEffect: "none",
    sourcePlanRef: plan.planFingerprint,
    sourceMechanicsRef: plan.mechanicsFingerprint
  };
  /* CULTURE CHOOSES HOW A MESSAGE CAN BE DISPLAYED; WORLD TRUTH CHOOSES THE MESSAGE. The fixture
     state below is loudly non-canonical. It demonstrates the attachment channels without claiming
     that this seed belongs to a faction. Runtime world truth may supply palette/emblem/occupation
     and select banner, flag, or surface mark while the culture profile supplies legal sockets. */
  var signifierMemberIds = [];
  function signifierExtra(signifierRef, supportId){
    return {
      ownerId: supportId,
      presentationOnly: true,
      mechanicalEffect: "none",
      cultureRef: presentationCultureId,
      variantRef: presentationSignifierState.medium,
      worldTruthRef: presentationSignifierState.worldTruthRef,
      signifierRef: signifierRef,
      placeholderState: presentationSignifierState.truthStatus
    };
  }
  function rememberSignifier(member){
    if(member) signifierMemberIds.push(member.id);
    return member;
  }
  var signifierSockets = presentationCultureId === "upland-vernacular"
    ? [
        { id: "signal-pole-flag", medium: "pole-flag", supportId: "route-control-signal-posts" },
        { id: "beam-pennant", medium: "pennant", supportId: "route-control-signal-crossbeam" },
        { id: "ritual-daub-wall", medium: "surface-daub",
          supportId: "route-control-guard-far-return" }
      ]
    : [
        { id: "street-banner-drop", medium: "hanging-banner",
          supportId: "route-control-guard-street-wall" },
        { id: "lookout-standard", medium: "standard",
          supportId: "route-control-lookout-edge" },
        { id: "occupation-mark-wall", medium: "surface-daub",
          supportId: "route-control-guard-far-return" }
      ];
  if(presentationSignifierState.medium === "pole-flag"){
    var flagPostX = deck.x - deck.w / 2 + 0.28;
    var flagPostZ = deck.z - deck.d / 2 + 0.28;
    var flagStaffId = "route-control-signifier-flag-staff";
    rememberSignifier(architectureAddBox(assembly, flagStaffId,
      { x: flagPostX, y: deckTop + 2.08, z: flagPostZ },
      { x: 0.09, y: 1.38, z: 0.09 }, "signifier-support",
      ["route-control-signal-posts"],
      signifierExtra("signal-pole-flag", "route-control-signal-posts")));
    rememberSignifier(architectureAddBox(assembly, "route-control-signifier-flag-primary",
      { x: flagPostX + 0.43, y: deckTop + 2.35, z: flagPostZ },
      { x: 0.82, y: 0.58, z: 0.035 }, "signifier-cloth-primary", [flagStaffId],
      signifierExtra("signal-pole-flag", flagStaffId)));
    rememberSignifier(architectureAddBox(assembly, "route-control-signifier-flag-secondary",
      { x: flagPostX + 0.43, y: deckTop + 2.15, z: flagPostZ - 0.004 },
      { x: 0.82, y: 0.13, z: 0.04 }, "signifier-cloth-secondary", [flagStaffId],
      signifierExtra("signal-pole-flag", flagStaffId)));
  } else if(presentationSignifierState.medium === "surface-daub"){
    [
      {
        id: "left", start: { x: guardStreetFaceX + 0.012, y: guardWallBase + 0.62,
          z: guard.z - guardHalfD + 1.86 },
        end: { x: guardStreetFaceX + 0.012, y: guardWallBase + 1.54,
          z: guard.z - guardHalfD + 2.22 }
      },
      {
        id: "right", start: { x: guardStreetFaceX + 0.013, y: guardWallBase + 1.46,
          z: guard.z - guardHalfD + 2.22 },
        end: { x: guardStreetFaceX + 0.013, y: guardWallBase + 0.58,
          z: guard.z - guardHalfD + 2.52 }
      }
    ].forEach(function(mark){
      rememberSignifier(architectureAddBeam3D(assembly,
        "route-control-signifier-surface-daub-" + mark.id,
        mark.start, mark.end, 0.075, "signifier-surface-mark",
        ["route-control-guard-street-wall"],
        signifierExtra("surface-daub", "route-control-guard-street-wall")));
    });
  } else {
    var bannerSupport = "route-control-guard-street-wall";
    var bannerStation = 2.1;
    rememberSignifier(architectureAddRunPrism(assembly, "route-control-signifier-banner-rod",
      { x: guardStreetFaceX + 0.05, z: guard.z - guardHalfD + bannerStation - 0.42 },
      { x: guardStreetFaceX + 0.05, z: guard.z - guardHalfD + bannerStation + 0.42 },
      guardWallBase + 2.25, 0.08, 0.08, "signifier-support", [bannerSupport],
      signifierExtra("street-banner-drop", bannerSupport)));
    rememberSignifier(architectureAddBox(assembly, "route-control-signifier-banner-primary",
      {
        x: guardStreetFaceX + 0.032,
        y: guardWallBase + 1.68,
        z: guard.z - guardHalfD + bannerStation
      },
      { x: 0.04, y: 1.08, z: 0.66 }, "signifier-cloth-primary", [bannerSupport],
      signifierExtra("street-banner-drop", bannerSupport)));
    rememberSignifier(architectureAddBox(assembly, "route-control-signifier-banner-secondary",
      {
        x: guardStreetFaceX + 0.025,
        y: guardWallBase + 1.27,
        z: guard.z - guardHalfD + bannerStation
      },
      { x: 0.045, y: 0.2, z: 0.67 }, "signifier-cloth-secondary", [bannerSupport],
      signifierExtra("street-banner-drop", bannerSupport)));
  }
  assembly.worldSignifierLayer = {
    schema: "GuardPostWorldSignifierLayerV1",
    truthStatus: presentationSignifierState.truthStatus,
    worldTruthRef: presentationSignifierState.worldTruthRef,
    paletteRef: presentationSignifierState.paletteRef,
    activeMedium: presentationSignifierState.medium,
    cultureAttachmentProfile: presentationCultureId,
    sockets: signifierSockets,
    memberIds: signifierMemberIds,
    presentationOnly: true,
    mechanicalEffect: "none",
    sourcePlanRef: plan.planFingerprint,
    sourceMechanicsRef: plan.mechanicsFingerprint
  };
  /* WALL FACE MODULE COMPILER · first production slice.
     Architecture remains authoritative for solids, apertures, support and mechanics. This plan
     exposes exact physical face coordinates to a visual compositor so authored 5ft modules can
     enrich the existing receivers without painting fake openings or adding coplanar geometry. */
  var wallModuleCompilation = goldenVignetteWallFaceModuleCompile(
    assembly.wallRuns.filter(function(run){
      return run.id.indexOf("route-control-guard-") === 0;
    }), {
      presentationSeed: presentationSeed,
      pixelsPerFoot: 32,
      authoredExpressionProfile: "authored-pixel-bold",
      cultureId: presentationCultureId,
      cultureFeatureWallRunId: "route-control-guard-street-wall",
      cultureMedia: {
        "institutional-frontier": "dressed-stone-heraldic-inset",
        "upland-vernacular": "ochre-limewash-mark",
        "neutral-structural": "neutral-surface-inset"
      },
      signifierState: presentationSignifierState,
      sourcePlanRef: plan.planFingerprint,
      sourceMechanicsRef: plan.mechanicsFingerprint
    });
  assembly.wallFaceModulePlans = wallModuleCompilation.plans;
  assembly.wallFaceModuleCompilerReceipt = wallModuleCompilation.receipt;
  assembly.validation = architectureFormValidatePlan(assembly);
  return assembly;
}

function goldenVignetteArchitectureAssembly(plan, request){
  if(!plan || !plan.grammar) return null;
  if(plan.grammar.id === "shoulder-route-control"){
    return gvsRouteControlArchitectureAssembly(plan, request);
  }
  return null;
}

function goldenVignetteSurfaceDemandCandidates(plan, request){
  var factRefs = gvsSourceFactRefs(request);
  return plan.surfaceAssemblyPlan.surfaces.map(function(surface, index){
    var natural = surface.role === "WALKABLE_TOP" || surface.role === "NATURAL_SLOPE"
      || surface.role === "CUT_FACE";
    var construction = surface.materialHint || "";
    var family = natural ? (surface.materialHint || "natural-ground")
      : /deck/.test(construction) ? "working-deck"
      : /barrier/.test(construction) ? "barrier-member"
      : /retaining/.test(construction) ? "retaining-masonry"
      : "program-construction";
    return {
      schemaVersion: 1,
      demandId: plan.planFingerprint + ":surface:" + String(index + 1).padStart(2, "0"),
      planRef: plan.planFingerprint,
      surfaceRef: surface.surfaceId,
      faceRef: surface.source.faceId || surface.source.faceRef
        || ("cell:" + (surface.source.cellIndex == null ? "aggregate" : surface.source.cellIndex)),
      role: surface.role,
      localFrame: gvsClone(surface.localFrame),
      sourceFactRefs: factRefs.slice(),
      mechanicTruthRefs: surface.mechanicTruthRefs.slice(),
      realm: request && request.hostProgram.owner === "DefenseRouteControlHost" ? "fantasy" : "chrome",
      culture: request && request.hostProgram.owner === "DefenseRouteControlHost"
        ? "Bone & Sinew" : "market hospitality",
      construction: natural ? "connected natural substrate" : construction,
      materialFamily: family,
      conditionChannels: (plan.causalState || []).map(function(state){ return state.id; }),
      texelScale: natural ? "world-consistent-5ft-cell" : "construction-member-consistent",
      projectionPolicy: natural ? "world-surface-triplanar-or-local-frame"
        : "face-local-frame-with-trim-reservations",
      trimReservations: surface.role === "CROWN_COPING" || surface.role === "JAMB_REVEAL"
        ? [surface.role.toLowerCase()] : [],
      decalReservations: [],
      shallowReliefReservations: natural ? ["sub-quantum-only-no-mechanics-change"] : [],
      causeRefs: (plan.causalState || []).map(function(state){ return state.id; }),
      candidateLanes: ["TRUTHFUL_PROXY", "MATERIAL_MAKER_1_3", "ADMITTED_EXISTING_FAMILY"],
      fallbackPolicy: {
        minimumTruthfulProxy: "role-colored-clay-with-stable-local-frame",
        omissionLegal: false
      }
    };
  });
}

function goldenVignetteMaterialFamilyPlan(plan, demands){
  var families = {};
  demands.forEach(function(demand){
    var key = demand.materialFamily;
    if(!families[key]){
      families[key] = {
        familyId: "gv-material-family:" + key,
        materialFamily: key,
        roles: [],
        surfaces: [],
        authority: "existing-specialist-or-truthful-proxy",
        materialMakerVersion: "1.3",
        textureStateOwnsHistory: false
      };
    }
    families[key].roles.push(demand.role);
    families[key].surfaces.push(demand.surfaceRef);
  });
  var rows = Object.keys(families).sort().map(function(key){
    families[key].roles = gvsUnique(families[key].roles);
    families[key].surfaces = gvsUnique(families[key].surfaces);
    return families[key];
  });
  return {
    version: "af-gv-2/1",
    planRef: plan.planFingerprint,
    families: rows,
    fingerprint: vignetteFingerprint(rows)
  };
}

function goldenVignetteWorldSurfaceProjection(plan, demands, materialFamilyPlan){
  var familyByName = {};
  materialFamilyPlan.families.forEach(function(family){ familyByName[family.materialFamily] = family; });
  var bindings = demands.map(function(demand){
    var family = familyByName[demand.materialFamily];
    return {
      bindingId: "gv-surface-binding:" + demand.surfaceRef,
      planRef: plan.planFingerprint,
      surfaceRef: demand.surfaceRef,
      faceRef: demand.faceRef,
      role: demand.role,
      localFrame: gvsClone(demand.localFrame),
      familyId: family.familyId,
      projectionPolicy: demand.projectionPolicy,
      texelScale: demand.texelScale,
      proxy: {
        id: "proxy:" + demand.materialFamily,
        preserves: ["role", "face", "local-frame", "contact", "mechanic-truth"],
        omission: false
      }
    };
  });
  return {
    version: "af-gv-3/1",
    planRef: plan.planFingerprint,
    materialFamilyFingerprint: materialFamilyPlan.fingerprint,
    bindings: bindings,
    fingerprint: vignetteFingerprint(bindings)
  };
}

function gvsAssetDecisions(request, plan, surfaceDemands, surfaceProjection){
  var semantic = vignetteAssetDemandsForRequest(request).map(function(demand){
    return {
      demandId: demand.demandId,
      semanticRole: demand.semanticRole,
      decision: "TRUTHFUL_PROXY",
      resolvedId: demand.fallbackPolicy.minimumTruthfulProxy,
      omission: false,
      preserves: ["semantic-role", "envelope-to-be-plan-bound", "interaction-obligation"]
    };
  });
  var surfaces = surfaceDemands.map(function(demand){
    var binding = surfaceProjection.bindings.filter(function(row){
      return row.surfaceRef === demand.surfaceRef;
    })[0];
    return {
      demandId: demand.demandId,
      semanticRole: demand.role,
      decision: "TRUTHFUL_PROXY",
      resolvedId: binding.proxy.id,
      omission: false,
      preserves: binding.proxy.preserves.slice()
    };
  });
  return semantic.concat(surfaces);
}

function goldenVignetteProjectSceneTray(compilation, opts){
  var bearing = opts && opts.bearing != null ? opts.bearing & 3 : 0;
  var plan = compilation.plan;
  var projection = {
    schemaVersion: 1,
    projectionKind: "SceneTray",
    planRef: plan.planFingerprint,
    mechanicsFingerprint: plan.mechanicsFingerprint,
    bearing: bearing,
    activeCircuits: plan.grammar.id === "public-service-venue"
      ? ["social", "service"] : ["road", "flank"],
    dormantCircuits: plan.grammar.id === "public-service-venue" ? ["tacticalDormant"] : [],
    zones: plan.zones.map(function(zone){ return zone.id; }),
    geometryRegenerated: false
  };
  projection.projectionFingerprint = vignetteFingerprint(projection);
  return projection;
}

function goldenVignetteProjectBattleMap(compilation, opts){
  var bearing = opts && opts.bearing != null ? opts.bearing & 3 : 0;
  var plan = compilation.plan;
  var projection = {
    schemaVersion: 1,
    projectionKind: "BattleMap",
    planRef: plan.planFingerprint,
    mechanicsFingerprint: plan.mechanicsFingerprint,
    bearing: bearing,
    activeCircuits: Object.keys(plan.circuits),
    dormantCircuits: [],
    zones: plan.zones.map(function(zone){ return zone.id; }),
    tacticalPlans: plan.tacticalPlans.map(function(tacticalPlan){ return tacticalPlan.id; }),
    geometryRegenerated: false
  };
  projection.projectionFingerprint = vignetteFingerprint(projection);
  return projection;
}

function goldenVignetteSimulateFlow(compilation, planId){
  var plan = compilation.plan;
  var tacticalPlan = plan.tacticalPlans.filter(function(row){ return row.id === planId; })[0]
    || plan.tacticalPlans[0];
  var route = tacticalPlan && tacticalPlan.route || [];
  var retreat = plan.zones.filter(function(zone){
    return zone.role === "retreat" || zone.role === "exit-retreat";
  })[0] || null;
  var phases = [
    { phase: "arrival", at: route.length ? route[0] : null, planRef: plan.planFingerprint },
    { phase: "decision", planId: tacticalPlan.id, routeCost: tacticalPlan.routeCost,
      tradeoff: tacticalPlan.tradeoff, planRef: plan.planFingerprint },
    { phase: "play", visited: route.slice(), planRef: plan.planFingerprint },
    { phase: "exit", at: retreat, planRef: plan.planFingerprint },
    { phase: "return", restoredPlanRef: plan.planFingerprint,
      restoredMechanicsFingerprint: plan.mechanicsFingerprint }
  ];
  return {
    simulationId: "gv-flow:" + plan.planFingerprint + ":" + tacticalPlan.id,
    planRef: plan.planFingerprint,
    planId: tacticalPlan.id,
    phases: phases,
    arrivalExitReturnIdentity: phases.every(function(phase){
      return (phase.planRef || phase.restoredPlanRef) === plan.planFingerprint;
    }),
    routePlayable: gvsPathValid(route) && Number.isFinite(tacticalPlan.routeCost),
    fingerprint: vignetteFingerprint(phases)
  };
}

function goldenVignetteBattleContract(compilation){
  var plan = compilation.plan;
  var window = plan.materializationWindow.extentCells;
  var deck = plan.zones.filter(function(zone){
    return zone.role === "flat-deck" || zone.role === "quiet-social-floor";
  })[0];
  var threshold = plan.zones.filter(function(zone){
    return zone.role === "controlled-threshold" || zone.role === "service-threshold";
  })[0];
  var projection = goldenVignetteProjectBattleMap(compilation, { bearing: 0 });
  return {
    contractVersion: "gv-battle-contract/1",
    planRef: plan.planFingerprint,
    mechanicsFingerprint: plan.mechanicsFingerprint,
    segmentId: plan.planFingerprint,
    cellDims: { w: window.x, d: window.y },
    objectiveRef: deck ? deck.id : (threshold ? threshold.id : null),
    scene: {
      cover: {},
      hazards: [],
      exits: plan.zones.filter(function(zone){
        return zone.role === "retreat" || zone.role === "exit-retreat";
      }).map(function(zone){ return zone.id; }),
      elevZones: deck ? ["far:L"] : [],
      hazardZones: [],
      zoneCover: threshold ? { "near:C": "half", "far:L": "half" } : {}
    },
    projectionFingerprint: projection.projectionFingerprint,
    geometryRegenerated: false
  };
}

function goldenVignetteProofPackage(compilation){
  var plan = compilation.plan;
  var bearings = [0, 1, 2, 3].map(function(bearing){
    var sceneTray = goldenVignetteProjectSceneTray(compilation, { bearing: bearing });
    var battleMap = goldenVignetteProjectBattleMap(compilation, { bearing: bearing });
    return {
      bearing: bearing,
      planRef: plan.planFingerprint,
      sceneTrayProjection: sceneTray.projectionFingerprint,
      battleMapProjection: battleMap.projectionFingerprint,
      planIdentityPreserved: sceneTray.planRef === battleMap.planRef
        && sceneTray.mechanicsFingerprint === battleMap.mechanicsFingerprint
    };
  });
  var packageRecord = {
    version: "af-gv-8/1",
    planRef: plan.planFingerprint,
    requiredViews: [
      "neutral-clay", "four-quarter-turn-bearings", "gameplay-scale", "contact-sheet",
      "grayscale-hierarchy", "material-identity-overlay", "changed-seed-siblings"
    ],
    bearings: bearings,
    materialOverlayRef: compilation.surfaceProjection.fingerprint,
    identityOverlayRefs: plan.identityReservations.map(function(row){ return row.reservationId; }),
    pendingFounderJudgment: true
  };
  packageRecord.fingerprint = vignetteFingerprint(packageRecord);
  return packageRecord;
}

function gvsReceipt(request, candidateSet, plan, surfaceDemands, materialFamilies,
  surfaceProjection, assetDecisions, evidence){
  var selected = candidateSet.selected;
  var receipt = {
    schemaVersion: GOLDEN_VIGNETTE_RECEIPT_VERSION,
    receiptId: "synthesis-receipt:" + plan.planFingerprint,
    requestRef: request.requestId,
    planRef: plan.planFingerprint,
    engineVersions: {
      synthesizer: GOLDEN_VIGNETTE_SYNTH_VERSION,
      observatory: request.seedNamespace.adapterVersion,
      terrain: plan.terrainPlan ? plan.terrainPlan.field.version : null,
      surfaceDemand: "af-gv-1/1",
      materialFamily: materialFamilies.version,
      worldSurfaceProjection: surfaceProjection.version,
      proofPackage: "af-gv-8/1"
    },
    seedChain: [{
      label: "request-root",
      seed: Number(request.seedNamespace.rootSeed) >>> 0,
      derivation: request.seedNamespace.namespace
    }].concat(candidateSet.summaries.map(function(candidate){
      return {
        label: candidate.candidateId,
        seed: candidateSet.candidates.filter(function(entry){
          return entry.candidate.candidateId === candidate.candidateId;
        })[0].candidate.seed,
        derivation: "vignetteSeedFrom(version, rootSeed, bounded candidate label)"
      };
    })),
    sourceLineage: (request.sourceProvenance || []).map(function(source){
      return {
        sourceRef: source.sourceRef,
        adapter: request.seedNamespace.adapterVersion,
        treatment: source.treatment,
        consumedOutputIds: source.factIds.slice()
      };
    }),
    candidates: gvsClone(candidateSet.summaries),
    selectedCandidateId: selected.candidate.candidateId,
    hardRejections: candidateSet.summaries.filter(function(candidate){
      return !candidate.hardPass;
    }).map(function(candidate){
      return { candidateId: candidate.candidateId, rejectionIds: candidate.rejectionIds.slice() };
    }),
    scoring: {
      selectionRule: [
        "hard-pass", "required-circuit-count", "route-choice", "tactical-tension",
        "composition-hierarchy", "quiet-space", "identity", "four-bearing-legibility",
        "continuity", "lower-asset-cost"
      ],
      selectedComponents: gvsClone(selected.scores),
      opaqueQualityScore: null
    },
    repairs: gvsClone(candidateSet.repairs),
    relaxations: [],
    assetDecisions: gvsClone(assetDecisions),
    omissions: [],
    unresolved: [],
    validation: {
      semantic: validateVignetteRequest(request),
      spatial: {
        windowWithinBudget: plan.materializationWindow.cellCount <= candidateSet.grammar.maximumWindowCells,
        requiredZones: candidateSet.grammar.requiredZoneRoles.every(function(role){
          return plan.zones.some(function(zone){ return zone.role === role; });
        })
      },
      tactical: {
        viablePlanCount: selected.validation.viablePlanCount,
        minimumPlanCount: candidateSet.grammar.minimumPlans,
        planChoicePass: selected.validation.viablePlanCount >= candidateSet.grammar.minimumPlans
      },
      camera: {
        permittedBearings: plan.projectionLaw.permittedBearings.slice(),
        bearingMutatesPlan: false,
        report: selected.candidate.cameraReport || { ok: true, rows: [] }
      },
      continuity: selected.candidate.terrain
        ? selected.candidate.terrain.continuityReport : { ok: true, interior: true },
      persistence: {
        sceneTrayBattleMapIdentityRequired: true,
        saveLoadFingerprint: plan.planFingerprint
      },
      projection: {
        surfaceDemandCount: surfaceDemands.length,
        bindingCount: surfaceProjection.bindings.length,
        everySurfaceBound: surfaceDemands.length === surfaceProjection.bindings.length
      }
    },
    performance: {
      windowCells: plan.materializationWindow.cellCount,
      fieldCells: plan.terrainPlan ? plan.terrainPlan.field.cells.length : 0,
      constructionMasses: plan.constructionPlan.length,
      surfaceBindings: surfaceProjection.bindings.length,
      proxyAssetCount: assetDecisions.length
    },
    evidence: evidence || [],
    fingerprints: {
      request: vignetteRequestFingerprint(request),
      committedPlan: plan.planFingerprint,
      mechanicsPlan: plan.mechanicsFingerprint,
      surfaceAssembly: plan.surfaceAssemblyPlan.fingerprint,
      assetResolution: vignetteFingerprint(assetDecisions),
      worldSurfaceProjection: surfaceProjection.fingerprint,
      sceneTray: null,
      battleMap: null
    }
  };
  return receipt;
}

function goldenVignetteCompile(request, opts){
  var candidateSet = goldenVignetteCandidateSet(request, opts);
  if(!candidateSet.selected){
    var error = new Error("goldenVignetteCompile: " + candidateSet.hardFailure);
    error.candidateSet = candidateSet;
    throw error;
  }
  var plan = gvsCommittedPlan(request, candidateSet);
  var surfaceDemands = goldenVignetteSurfaceDemandCandidates(plan, request);
  var materialFamilies = goldenVignetteMaterialFamilyPlan(plan, surfaceDemands);
  var surfaceProjection = goldenVignetteWorldSurfaceProjection(plan, surfaceDemands,
    materialFamilies);
  var assetDecisions = gvsAssetDecisions(request, plan, surfaceDemands, surfaceProjection);
  var architectureAssembly = goldenVignetteArchitectureAssembly(plan, request);
  var compilation = {
    version: GOLDEN_VIGNETTE_SYNTH_VERSION,
    request: request,
    plan: plan,
    architectureAssembly: architectureAssembly,
    surfaceDemands: surfaceDemands,
    materialFamilies: materialFamilies,
    surfaceProjection: surfaceProjection,
    assetDecisions: assetDecisions,
    receipt: null,
    proofPackage: null
  };
  compilation.receipt = gvsReceipt(request, candidateSet, plan, surfaceDemands,
    materialFamilies, surfaceProjection, assetDecisions, []);
  var sceneTray = goldenVignetteProjectSceneTray(compilation, { bearing: 0 });
  var battleMap = goldenVignetteProjectBattleMap(compilation, { bearing: 0 });
  compilation.receipt.fingerprints.sceneTray = sceneTray.projectionFingerprint;
  compilation.receipt.fingerprints.battleMap = battleMap.projectionFingerprint;
  compilation.proofPackage = goldenVignetteProofPackage(compilation);
  compilation.receipt.evidence.push({
    evidenceId: compilation.proofPackage.fingerprint,
    kind: "AF-GV-8-governed-proof-package",
    status: "capture-pending",
    planRef: plan.planFingerprint
  });
  compilation.receipt.receiptFingerprint = goldenVignetteReceiptFingerprint(compilation.receipt);
  return compilation;
}

function goldenVignetteValidateCompilation(compilation){
  var errors = [];
  if(!compilation || !compilation.plan || !compilation.receipt){
    return { ok: false, errors: ["compilation, plan, and receipt are required"] };
  }
  var plan = compilation.plan;
  var receipt = compilation.receipt;
  var grammar = gvsProgramGrammar(compilation.request);
  var sceneTray = goldenVignetteProjectSceneTray(compilation, { bearing: 0 });
  var battleMap = goldenVignetteProjectBattleMap(compilation, { bearing: 0 });
  if(sceneTray.planRef !== battleMap.planRef) errors.push("COMBAT_REGENERATED_PLAN");
  if(sceneTray.mechanicsFingerprint !== battleMap.mechanicsFingerprint){
    errors.push("COMBAT_REGENERATED_PLAN");
  }
  if(receipt.omissions.length) errors.push("MISSING_REQUIRED_ROLE");
  if(receipt.assetDecisions.some(function(decision){ return decision.omission; })){
    errors.push("MISSING_REQUIRED_ROLE");
  }
  if(receipt.assetDecisions.some(function(decision){
    return decision.decision === "WHOLE_SITE_DONOR"
      || /whole-site-donor/i.test(String(decision.resolvedId || ""));
  })) errors.push("WHOLE_SITE_DONOR");
  if((plan.causalState || []).some(function(state){
    return !Array.isArray(state.causeRefs) || !state.causeRefs.length;
  })) errors.push("RANDOM_CONDITION");
  if((plan.tacticalPlans || []).some(function(tacticalPlan){
    return !Array.isArray(tacticalPlan.sourceFactRefs) || !tacticalPlan.sourceFactRefs.length;
  })) errors.push("FALSE_CONTEXT_ROUTE");
  if(!grammar || plan.hostOwner !== compilation.request.hostProgram.owner
      || plan.grammar.id !== grammar.id){
    errors.push("TRANSFORM_REPLACED_HOST");
  }
  if(grammar && plan.materializationWindow.cellCount > grammar.maximumWindowCells){
    errors.push("SPRAWLING_MATERIALIZATION_WINDOW");
  }
  if(plan.terrainPlan){
    if(plan.terrainPlan.field.metrics.maxH - plan.terrainPlan.field.metrics.minH
        < plan.grammar.minimumReliefH) errors.push("HEIGHT_FLATTENED");
    if(!plan.terrainPlan.continuityReport || !plan.terrainPlan.continuityReport.ok){
      errors.push("NATURAL_CONTINUITY_FAILURE");
    }
    if(!plan.terrainPlan.variationReport || !plan.terrainPlan.variationReport.ok){
      errors.push("INDEPENDENT_TILE_TERRAIN");
    }
  }
  if(receipt.scoring.opaqueQualityScore != null) errors.push("OPAQUE_QUALITY_SCORE");
  if(goldenVignettePlanFingerprint(plan) !== plan.planFingerprint){
    errors.push("PLAN_FINGERPRINT_MISMATCH");
  }
  if(goldenVignetteReceiptFingerprint(receipt) !== receipt.receiptFingerprint){
    errors.push("RECEIPT_FINGERPRINT_MISMATCH");
  }
  if(!receipt.validation.spatial.requiredZones) errors.push("MISSING_REQUIRED_ZONE");
  if(!receipt.validation.tactical.planChoicePass) errors.push("INSUFFICIENT_PLAN_CHOICE");
  if(!receipt.validation.projection.everySurfaceBound) errors.push("MISSING_SURFACE_BINDING");
  if(plan.grammar && plan.grammar.id === "shoulder-route-control"){
    if(!compilation.architectureAssembly){
      errors.push("MISSING_ARCHITECTURE_ASSEMBLY");
    } else if(!compilation.architectureAssembly.validation
      || !compilation.architectureAssembly.validation.ok){
      errors.push("ARCHITECTURE_ASSEMBLY_INVALID");
    } else if(compilation.architectureAssembly.sourcePlanRef !== plan.planFingerprint
      || compilation.architectureAssembly.sourceMechanicsRef !== plan.mechanicsFingerprint){
      errors.push("ARCHITECTURE_ASSEMBLY_SOURCE_DRIFT");
    }
  }
  [0, 1, 2, 3].forEach(function(bearing){
    var tray = goldenVignetteProjectSceneTray(compilation, { bearing: bearing });
    var battle = goldenVignetteProjectBattleMap(compilation, { bearing: bearing });
    if(tray.planRef !== plan.planFingerprint || battle.planRef !== plan.planFingerprint){
      errors.push("CAMERA_MUTATED_PLAN");
    }
  });
  return {
    ok: errors.length === 0,
    errors: gvsUnique(errors),
    planFingerprint: plan.planFingerprint,
    receiptFingerprint: receipt.receiptFingerprint
  };
}

function goldenVignetteWave2SceneDefinition(sceneId){
  return GOLDEN_VIGNETTE_WAVE2_SCENES.filter(function(scene){ return scene.id === sceneId; })[0] || null;
}

function goldenVignetteWave2SceneLightRecipe(sceneId){
  var scene = goldenVignetteWave2SceneDefinition(sceneId);
  if(!scene) throw new Error("goldenVignetteWave2SceneLightRecipe: unknown scene " + sceneId);
  return scene.lightRecipeId;
}

function goldenVignetteWave2SceneNeutralizesRig(sceneId){
  var scene = goldenVignetteWave2SceneDefinition(sceneId);
  return !!(scene && scene.neutralizeHostRig);
}

/* PRESENTATION DRESSES THE COMMITTED PLAN; it does not get a second vote on the battlefield.
   These profiles bind the best current sprite-derived parents to semantic roles, but their state
   remains explicit: a B04 parent that survived its own proof is still only a starting parent in a
   Guard Post. `neutral-clay` is a governed comparison mode and deliberately emits no profile. */
const GOLDEN_GUARD_VISUAL_PROFILE_IDS = Object.freeze([
  "institutional-frontier",
  "upland-vernacular",
  "neutral-clay"
]);

function gvsGuardMaterialDefinition(id, family, state, maps, tint, options){
  var opts = options || {};
  var definition = {
    id: id,
    family: family,
    state: state,
    maps: gvsClone(maps),
    tint: tint,
    roughness: opts.roughness == null ? 0.92 : opts.roughness,
    metalness: opts.metalness == null ? 0 : opts.metalness,
    normalScale: opts.normalScale == null ? 0 : opts.normalScale,
    aoIntensity: opts.aoIntensity == null ? 0 : opts.aoIntensity,
    alphaTest: opts.alphaTest == null ? 0 : opts.alphaTest,
    opacity: opts.opacity == null ? 1 : opts.opacity,
    transparent: !!opts.transparent,
    depthWrite: opts.depthWrite !== false,
    alphaToCoverage: !!opts.alphaToCoverage,
    shadowLift: opts.shadowLift == null ? 0 : opts.shadowLift,
    metersPerRepeat: opts.metersPerRepeat == null ? 1.65 : opts.metersPerRepeat,
    metersPerRepeatX: opts.metersPerRepeatX == null
      ? (opts.metersPerRepeat == null ? 1.65 : opts.metersPerRepeat)
      : opts.metersPerRepeatX,
    metersPerRepeatY: opts.metersPerRepeatY == null
      ? (opts.metersPerRepeat == null ? 1.65 : opts.metersPerRepeat)
      : opts.metersPerRepeatY,
    worldUnitsPerRepeatX: opts.worldUnitsPerRepeatX == null ? null : opts.worldUnitsPerRepeatX,
    worldUnitsPerRepeatY: opts.worldUnitsPerRepeatY == null ? null : opts.worldUnitsPerRepeatY,
    feetPerWorldUnit: 5,
    metersPerWorldUnit: 1.65,
    projection: opts.projection || "world-dominant-planar",
    wrapMode: opts.wrapMode || "repeat",
    sourceKind: opts.sourceKind || "sprite-derived",
    contextVerdict: opts.contextVerdict || "PENDING_GUARD_POST_REVIEW"
  };
  if(opts.surfaceBlend) definition.surfaceBlend = gvsClone(opts.surfaceBlend);
  if(opts.conditionBlend) definition.conditionBlend = gvsClone(opts.conditionBlend);
  if(opts.parentBlend) definition.parentBlend = gvsClone(opts.parentBlend);
  if(opts.atlasSlot) definition.atlasSlot = gvsClone(opts.atlasSlot);
  if(opts.masonryCourse) definition.masonryCourse = gvsClone(opts.masonryCourse);
  if(opts.repeatWorldLength != null) definition.repeatWorldLength = opts.repeatWorldLength;
  if(opts.faceLocalModuleFeet != null){
    definition.faceLocalModuleFeet = opts.faceLocalModuleFeet;
  }
  return definition;
}

/* Angled terrain cannot borrow architecture's flat decal receivers. The engine therefore emits a
   shared scalar field over the committed heightfield. Its centreline walks from the authored drain
   source through the least-uphill neighbouring cells, then a bounded continuous falloff turns that
   path into damp/moss coverage. The renderer may interpolate these weights on the real cap
   triangles, but it may not choose the path, invent moisture, or change a height. */
function goldenVignetteGuardTerrainConditionFields(plan){
  var field = plan && plan.terrainPlan && plan.terrainPlan.field;
  var extent = plan && plan.materializationWindow && plan.materializationWindow.extentCells;
  var guardStructure = plan && (plan.constructionPlan || []).filter(function(structure){
    return structure.role === "guardroom";
  })[0];
  var retainingStructure = plan && (plan.constructionPlan || []).filter(function(structure){
    return structure.role === "retaining-wall";
  })[0];
  if(!field || !extent || !retainingStructure || !guardStructure) return [];
  var fp = retainingStructure.footprint;
  var retaining = {
    x: fp.x + fp.w / 2 - extent.x / 2,
    z: fp.y + fp.d / 2 - extent.y / 2,
    w: fp.w,
    d: fp.d
  };
  var retainingStartZ = retaining.z - retaining.d / 2;
  var retainingBreakA = retainingStartZ + retaining.d * 0.36;
  var retainingBreakB = retainingStartZ + retaining.d * 0.71;
  var sourceLocal = {
    x: retaining.x + Math.max(0.72, retaining.w / 2 + 0.28),
    z: retainingBreakA + (retainingBreakB - retainingBreakA) * 0.58
  };
  function liveCellAt(x, y){
    if(x < 0 || y < 0 || x >= field.extent.x || y >= field.extent.y) return null;
    var cell = field.cells[y * field.extent.x + x];
    return cell && cell.kind !== "void" ? cell : null;
  }
  var sourceGrid = {
    x: sourceLocal.x + extent.x / 2 - 0.5,
    y: sourceLocal.z + extent.y / 2 - 0.5
  };
  var source = field.cells.reduce(function(best, cell){
    if(!cell || cell.kind === "void") return best;
    var distance = Math.pow(cell.x - sourceGrid.x, 2) + Math.pow(cell.y - sourceGrid.y, 2);
    return !best || distance < best.distance ? { cell: cell, distance: distance } : best;
  }, null);
  if(!source) return [];
  var path = [source.cell];
  var visited = {};
  visited[source.cell.index] = true;
  var directions = [
    [1, 0], [1, -1], [1, 1], [0, -1], [0, 1], [-1, 0], [-1, -1], [-1, 1]
  ];
  for(var step = 0; step < 5; step++){
    var current = path[path.length - 1];
    var candidates = [];
    directions.forEach(function(direction, order){
      var candidate = liveCellAt(current.x + direction[0], current.y + direction[1]);
      if(!candidate || visited[candidate.index]) return;
      var rise = Math.max(0, candidate.h - current.h);
      var reversePenalty = direction[0] < 0 ? 4.5 : (direction[0] === 0 ? 0.55 : 0);
      var roadPenalty = candidate.surface === "guard-through-road" ? 1.4 : 0;
      var lateralPenalty = Math.abs(direction[1]) * 0.18;
      candidates.push({
        cell: candidate,
        score: rise * 6 + reversePenalty + roadPenalty + lateralPenalty
          + candidate.h * 0.035 + order * 0.0001
      });
    });
    if(!candidates.length) break;
    candidates.sort(function(a, b){ return a.score - b.score; });
    visited[candidates[0].cell.index] = true;
    path.push(candidates[0].cell);
  }
  var weights = field.cells.map(function(cell){
    if(!cell || cell.kind === "void") return 0;
    var closest = path.reduce(function(best, pathCell, pathIndex){
      var distance = Math.sqrt(
        Math.pow(cell.x - pathCell.x, 2) + Math.pow(cell.y - pathCell.y, 2));
      return !best || distance < best.distance
        ? { distance: distance, pathIndex: pathIndex } : best;
    }, null);
    var pathWeight = Math.max(0, 1 - closest.distance / 1.58)
      * Math.max(0.58, 1 - closest.pathIndex * 0.075);
    var neighbours = directions.map(function(direction){
      return liveCellAt(cell.x + direction[0], cell.y + direction[1]);
    }).filter(Boolean);
    var neighbourAverage = neighbours.length
      ? neighbours.reduce(function(sum, neighbour){ return sum + neighbour.h; }, 0)
        / neighbours.length
      : cell.h;
    var concavity = Math.max(0.82, Math.min(1.2, 1 + (neighbourAverage - cell.h) * 0.08));
    var trafficMaintenance = cell.surface === "guard-through-road" ? 0.38 : 1;
    return +Math.max(0, Math.min(1, pathWeight * concavity * trafficMaintenance)).toFixed(4);
  });
  var guardFootprint = guardStructure.footprint;
  var guardContactWeights = field.cells.map(function(cell){
    if(!cell || cell.kind === "void") return 0;
    var centerX = cell.x + 0.5;
    var centerY = cell.y + 0.5;
    var right = guardFootprint.x + guardFootprint.w;
    var bottom = guardFootprint.y + guardFootprint.d;
    var outsideX = Math.max(guardFootprint.x - centerX, 0, centerX - right);
    var outsideY = Math.max(guardFootprint.y - centerY, 0, centerY - bottom);
    var inside = centerX >= guardFootprint.x && centerX <= right
      && centerY >= guardFootprint.y && centerY <= bottom;
    var distance = inside
      ? Math.min(centerX - guardFootprint.x, right - centerX,
        centerY - guardFootprint.y, bottom - centerY)
      : Math.sqrt(outsideX * outsideX + outsideY * outsideY);
    var perimeterWeight = Math.max(0, 1 - distance / 1.82);
    var neighbours = directions.map(function(direction){
      return liveCellAt(cell.x + direction[0], cell.y + direction[1]);
    }).filter(Boolean);
    var neighbourAverage = neighbours.length
      ? neighbours.reduce(function(sum, neighbour){ return sum + neighbour.h; }, 0)
        / neighbours.length
      : cell.h;
    var concavity = Math.max(0.88, Math.min(1.18,
      1 + (neighbourAverage - cell.h) * 0.065));
    var roadMaintenance = cell.surface === "guard-through-road" ? 0.54 : 1;
    return +Math.max(0, Math.min(1,
      perimeterWeight * concavity * roadMaintenance)).toFixed(4);
  });
  return [{
    schema: "TerrainConditionFieldV1",
    id: "route-control-outfall-downhill-damp",
    fieldRef: field.fingerprint,
    sourceFactRefs: ["route-control-drain-outfall", "route-control-drain-channel"],
    sourceLocal: {
      x: +sourceLocal.x.toFixed(4),
      z: +sourceLocal.z.toFixed(4)
    },
    pathCells: path.map(function(cell){
      return {
        index: cell.index, x: cell.x, y: cell.y, h: cell.h,
        localX: +(cell.x + 0.5 - extent.x / 2).toFixed(4),
        localZ: +(cell.y + 0.5 - extent.y / 2).toFixed(4)
      };
    }),
    weights: weights,
    projection: "mesh-conformal-shared-vertex-field",
    coordinateDomain: "continuous-terrain-field",
    distributionRule: "least-uphill-drainage-walk-plus-concavity",
    materialMap: "seam-moss-runtime-albedo-alpha",
    parentOwns: ["terrain-shape", "base-albedo", "normal", "ORM", "lighting-response"],
    conditionOwns: ["coverage-weight", "damp-moss-color"],
    maximumWeight: Math.max.apply(null, weights),
    weightFingerprint: vignetteFingerprint(weights),
    mechanicalEffect: "none"
  }, {
    schema: "TerrainConditionFieldV1",
    id: "route-control-guard-foundation-contact-damp",
    fieldRef: field.fingerprint,
    sourceFactRefs: [
      "route-control-guard-foundation",
      "route-control-guard-street-wall",
      "route-control-guard-far-return",
      "route-control-guard-near-return",
      "route-control-guard-uphill-wall"
    ],
    sourceLocal: {
      x: +(guardFootprint.x + guardFootprint.w / 2 - extent.x / 2).toFixed(4),
      z: +(guardFootprint.y + guardFootprint.d / 2 - extent.y / 2).toFixed(4)
    },
    sourceFootprint: gvsClone(guardFootprint),
    pathCells: [],
    weights: guardContactWeights,
    projection: "mesh-conformal-shared-vertex-field",
    coordinateDomain: "continuous-terrain-field",
    distributionRule: "foundation-perimeter-contact-apron-plus-concavity",
    materialMap: "lower-wall-readable-ground-contact-grime-albedo-alpha",
    parentOwns: ["terrain-shape", "base-albedo", "normal", "ORM", "lighting-response"],
    conditionOwns: ["foundation-contact-coverage", "soil-grime-color"],
    maximumWeight: Math.max.apply(null, guardContactWeights),
    weightFingerprint: vignetteFingerprint(guardContactWeights),
    mechanicalEffect: "none"
  }];
}

function goldenVignetteGuardWorldPixelDensityProof(plan, opts){
  if(!opts || opts.worldPixelDensityProof !== "party-guards") return null;
  var field = plan && plan.terrainPlan && plan.terrainPlan.field;
  if(!field || !field.cells) return null;
  var zoneByRole = {};
  (plan.zones || []).forEach(function(zone){ zoneByRole[zone.role] = zone; });
  var sourceRoot = "assets/sprites-golden/guard-post-v001/";
  var specifications = [
    {
      id: "pc-vanguard", label: "PC Vanguard", side: "pc", role: "pc-frontline",
      zoneRole: "entry", offset: [0, 0], feet: 6, subjectPixels: 192,
      canvas: [192, 224], footX: 0.5, footY: 0.955357
    },
    {
      id: "pc-caster", label: "PC Caster", side: "pc", role: "pc-control",
      zoneRole: "quiet-approach", offset: [0, 0], feet: 5.7, subjectPixels: 182,
      canvas: [128, 224], footX: 0.5, footY: 0.955357
    },
    {
      id: "pc-scout", label: "PC Scout", side: "pc", role: "pc-ranged",
      zoneRole: "entry", offset: [-1, -1], feet: 5.8, subjectPixels: 186,
      canvas: [160, 224], footX: 0.5, footY: 0.955357
    },
    {
      id: "pc-support", label: "PC Support", side: "pc", role: "pc-support",
      zoneRole: "quiet-approach", offset: [-1, 1], feet: 5.9, subjectPixels: 189,
      canvas: [160, 224], footX: 0.5, footY: 0.955357
    },
    {
      id: "guard-captain", label: "Guard Captain", side: "guard",
      role: "guard-threshold", zoneRole: "controlled-threshold", offset: [0, 0],
      feet: 6.1, subjectPixels: 195, canvas: [160, 256],
      footX: 0.5, footY: 0.960938
    },
    {
      id: "guard-crossbow", label: "Guard Crossbow", side: "guard",
      role: "guard-lookout", zoneRole: "defensive-edge", offset: [2, 0],
      feet: 5.8, subjectPixels: 186, canvas: [128, 224],
      footX: 0.5, footY: 0.955357
    },
    {
      id: "guard-heavy", label: "Guard Heavy", side: "guard",
      role: "guard-barrier", zoneRole: "controlled-threshold", offset: [2, 0],
      feet: 6.25, subjectPixels: 200, canvas: [160, 320],
      footX: 0.5, footY: 0.96875
    },
    {
      id: "guard-runner", label: "Guard Runner", side: "guard",
      role: "guard-signal", zoneRole: "work-readiness", offset: [0, 0],
      feet: 5.7, subjectPixels: 182, canvas: [96, 224],
      footX: 0.5, footY: 0.955357
    }
  ];
  var occupied = {};
  var extent = field.extent;
  var architectureExclusions = (plan.constructionPlan || []).filter(function(item){
    return item && item.footprint;
  }).map(function(item){
    /* Terrain-mounted standees cannot occupy a constructed floor merely because the terrain below
       it is standable. Nor may a wide sprite card sit in a nominally-free nearby cell while its
       silhouette is reduced to a misleading fragment behind a retaining wall, gallery, eave, or
       operable barrier in one of the governed quarter turns. Two cells is a PRESENTATION-PROOF
       apron, not gameplay clearance: one cell covers the physical card/eave envelope and the
       second keeps a complete readable silhouette beside that envelope at the isometric pitch.
       A future architecture-socket actor may opt into a constructed surface; this proof
       deliberately remains on terrain-owned supports. */
    return {
      id: item.id,
      role: item.role,
      x0: item.footprint.x - 2,
      y0: item.footprint.y - 2,
      x1: item.footprint.x + item.footprint.w + 1,
      y1: item.footprint.y + item.footprint.d + 1
    };
  });
  var architectureSightlineOccluders = (plan.constructionPlan || []).filter(function(item){
    /* This is a governed CAST-READABILITY proof, not a battle occlusion simulation. Even a low
       retaining wall can cut boots, a weapon, or the lower third of a sprite at one quarter turn;
       that was the exact defect the first party proof let through. Every authored construction
       mass therefore participates in the four-bearing sightline rejection. The road barrier is
       the one exception: it is the encounter's deliberate threshold and would divide the entire
       map into mutually invisible halves if treated as an infinite proof veto. Its two-cell local
       exclusion still prevents a figure being planted against it. Normal battle actors retain
       honest world occlusion because this allocator only exists behind the opt-in proof flag. */
    return item && item.footprint && item.role !== "road-barrier";
  }).map(function(item){
    return {
      id: item.id,
      role: item.role,
      /* The ray represents a sprite silhouette rather than a dimensionless point. At the
         governed 35° pitch a one-cell-tall building edge can cover the lower half of a character
         whose centre ray only just misses the footprint, so carry a 0.85-cell screen-safe flank. */
      x0: item.footprint.x - 0.85,
      y0: item.footprint.y - 0.85,
      x1: item.footprint.x + item.footprint.w + 0.85,
      y1: item.footprint.y + item.footprint.d + 0.85
    };
  });
  function architectureExclusionFor(cell){
    for(var i = 0; i < architectureExclusions.length; i++){
      var exclusion = architectureExclusions[i];
      if(cell.x >= exclusion.x0 && cell.x <= exclusion.x1
          && cell.y >= exclusion.y0 && cell.y <= exclusion.y1){
        return exclusion;
      }
    }
    return null;
  }
  /* A source-safe PNG can still look "clipped" when a proof placer parks it directly in an
     architecture silhouette from one quarter turn. Test the four governed isometric sightlines
     against the declared construction footprints. This is deliberately conservative and applies
     only to the opt-in density proof; normal battle actors keep honest world occlusion. */
  function rayIntersectsRect(originX, originY, directionX, directionY, rectangle){
    var tMinimum = 0;
    var tMaximum = Infinity;
    var axes = [
      [originX, directionX, rectangle.x0, rectangle.x1],
      [originY, directionY, rectangle.y0, rectangle.y1]
    ];
    for(var axisIndex = 0; axisIndex < axes.length; axisIndex++){
      var axis = axes[axisIndex];
      if(Math.abs(axis[1]) < 1e-9){
        if(axis[0] < axis[2] || axis[0] > axis[3]) return false;
        continue;
      }
      var t0 = (axis[2] - axis[0]) / axis[1];
      var t1 = (axis[3] - axis[0]) / axis[1];
      if(t0 > t1){ var swap = t0; t0 = t1; t1 = swap; }
      tMinimum = Math.max(tMinimum, t0);
      tMaximum = Math.min(tMaximum, t1);
      if(tMaximum < tMinimum) return false;
    }
    return tMaximum > 0.01 && tMaximum >= tMinimum;
  }
  function hasFourBearingArchitectureOcclusion(cell){
    var originX = cell.x + 0.5;
    var originY = cell.y + 0.5;
    var directions = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    return directions.some(function(direction){
      return architectureSightlineOccluders.some(function(occluder){
        return rayIntersectsRect(
          originX, originY, direction[0], direction[1], occluder);
      });
    });
  }
  function resolveCell(spec){
    var zone = zoneByRole[spec.zoneRole];
    if(!zone || !zone.cell) return null;
    var targetX = zone.cell.x + spec.offset[0];
    var targetY = zone.cell.y + spec.offset[1];
    var candidates = [];
    field.cells.forEach(function(cell){
      if(!cell.standable) return;
      if(architectureExclusionFor(cell)) return;
      if(hasFourBearingArchitectureOcclusion(cell)) return;
      /* Distinct tactical cells were insufficient: adjacent camera-facing cards can intersect in
         depth and look as though one sprite was cropped. This proof is about evaluating complete
         silhouettes, so reserve a one-cell presentation halo around every cast member. It changes
         no battle occupancy or mechanics because the entire cast remains opt-in proof data. */
      var presentationConflict = false;
      for(var oy = -1; oy <= 1 && !presentationConflict; oy++){
        for(var ox = -1; ox <= 1; ox++){
          if(occupied[(cell.x + ox) + ":" + (cell.y + oy)]){
            presentationConflict = true;
            break;
          }
        }
      }
      if(presentationConflict) return;
      var distance = Math.abs(cell.x - targetX) + Math.abs(cell.y - targetY);
      /* Readability wins over semantic proximity in this opt-in census. A long retaining run can
         consume every four-bearing-clear cell near the defensive-edge anchor; the previous
         eleven-cell leash then silently dropped the crossbow guard. Eighteen cells still keeps
         the actor on this compact 20×22 encounter while allowing the allocator to choose a whole
         silhouette instead of a locally faithful clipped one. */
      if(distance > 18) return;
      candidates.push({ cell: cell, distance: distance });
    });
    candidates.sort(function(a, b){
      return a.distance - b.distance
        || Math.abs(a.cell.h - zone.cell.h) - Math.abs(b.cell.h - zone.cell.h)
        || a.cell.index - b.cell.index;
    });
    var selected = candidates.length ? candidates[0].cell : null;
    if(selected) occupied[selected.x + ":" + selected.y] = true;
    return selected;
  }
  var actors = specifications.map(function(spec){
    var cell = resolveCell(spec);
    if(!cell) return null;
    return {
      id: spec.id,
      label: spec.label,
      side: spec.side,
      role: spec.role,
      zoneRole: spec.zoneRole,
      asset: sourceRoot + spec.id + "-32ppf.png",
      worldHeightFeet: spec.feet,
      pixelsPerFoot: 32,
      bodySubjectHeightPixels: spec.subjectPixels,
      bodyAxis: "authored-head-to-feet-excluding-equipment",
      canvasSize: spec.canvas.slice(),
      footX: spec.footX,
      footY: spec.footY,
      alphaCutoff: 0.5,
      standeeExtrusion: true,
      supportStyle: "terrain-integrated-shadow-plinth",
      supportTrimHex: 0x29251f,
      supportVisualScale: { x: 0.62, z: 0.72 },
      cell: { index: cell.index, x: cell.x, y: cell.y, h: cell.h },
      mechanicalEffect: "none"
    };
  }).filter(Boolean);
  var proof = {
    schema: "GuardPostWorldPixelDensityPartyProofV1",
    id: "guard-post-party-guards-32ppf",
    status: "GOLDEN_SITE_DENSITY_PROOF_CANDIDATE",
    targetPixelsPerFoot: 32,
    combatTileFeet: 5,
    tilePixels: 160,
    sourceManifest: "assets/sprites-golden/guard-post-v001/manifest.json",
    placementRule: "zone-role-nearest-distinct-standable-cell",
    architectureExclusionRule:
      "terrain-mounted-cast-excludes-all-constructed-footprints-plus-two-cell-presentation-apron",
    architecturePresentationApronCells: 2,
    architectureSightlineRule:
      "all-four-governed-diagonal-rays-clear-all-construction-masses-except-threshold-barrier",
    architectureSightlineOccluders: architectureSightlineOccluders.map(function(occluder){
      return gvsClone(occluder);
    }),
    actorSilhouetteClearanceRule:
      "one-cell-presentation-halo-between-terrain-mounted-standee-centres",
    actorSilhouetteClearanceCells: 1,
    architectureExclusions: architectureExclusions.map(function(exclusion){
      return gvsClone(exclusion);
    }),
    actorCount: actors.length,
    actors: actors,
    planRef: plan.planFingerprint,
    mechanicsRef: plan.mechanicsFingerprint,
    extentCells: { x: extent.x, y: extent.y },
    mechanicalEffect: "none"
  };
  proof.fingerprint = vignetteFingerprint(proof);
  return proof;
}

/* Sparse, camera-neutral ground dressing. This is not per-tile decoration: every cluster is
   allocated from a named spatial role in the committed plan, rejects the traffic ribbon and
   construction envelopes, and reserves enough quiet field between clusters to remain a
   compositional accent. The renderer receives cells and physical envelopes only; it never chooses
   where grass belongs. */
function goldenVignetteGuardTerrainDressing(plan, seed){
  var field = plan && plan.terrainPlan && plan.terrainPlan.field;
  if(!field || !field.cells) return null;
  var zoneByRole = {};
  (plan.zones || []).forEach(function(zone){ zoneByRole[zone.role] = zone; });
  var constructionAprons = (plan.constructionPlan || []).filter(function(item){
    return item && item.footprint;
  }).map(function(item){
    return {
      id: item.id,
      x0: item.footprint.x - 1,
      y0: item.footprint.y - 1,
      x1: item.footprint.x + item.footprint.w,
      y1: item.footprint.y + item.footprint.d
    };
  });
  var occupied = [];
  var roles = [
    "quiet-approach", "secondary-flank", "exit-retreat",
    "defensive-edge", "entry", "observation-face"
  ];
  function excluded(cell){
    return constructionAprons.some(function(apron){
      return cell.x >= apron.x0 && cell.x <= apron.x1
        && cell.y >= apron.y0 && cell.y <= apron.y1;
    });
  }
  function spaced(cell){
    return occupied.every(function(other){
      return Math.max(Math.abs(cell.x - other.x), Math.abs(cell.y - other.y)) >= 3;
    });
  }
  var placements = [];
  roles.forEach(function(role, roleIndex){
    var zone = zoneByRole[role];
    if(!zone || !zone.cell) return;
    var candidates = field.cells.filter(function(cell){
      return cell.inPlayfield && cell.standable
        && cell.x >= 1 && cell.y >= 1
        && cell.x < field.extent.x - 1 && cell.y < field.extent.y - 1
        && cell.surface !== "guard-through-road"
        && !excluded(cell) && spaced(cell);
    }).map(function(cell){
      return {
        cell: cell,
        distance: Math.abs(cell.x - zone.cell.x) + Math.abs(cell.y - zone.cell.y),
        tie: gvsSubSeed(seed, "guard-terrain-tuft:" + role + ":" + cell.index)
      };
    }).filter(function(candidate){ return candidate.distance <= 6; });
    candidates.sort(function(a, b){
      return a.distance - b.distance || a.tie - b.tie || a.cell.index - b.cell.index;
    });
    if(!candidates.length) return;
    var cell = candidates[0].cell;
    occupied.push(cell);
    var variant = gvsSubSeed(seed, "guard-terrain-tuft-scale:" + roleIndex) % 3;
    placements.push({
      id: "terrain-tuft-" + role,
      role: role,
      sourceZoneId: zone.id,
      cell: { index: cell.index, x: cell.x, y: cell.y, h: cell.h },
      scaleWorldUnits: [0.38, 0.46, 0.54][variant],
      yawDegrees: gvsSubSeed(seed, "guard-terrain-tuft-yaw:" + roleIndex) % 120,
      mechanicalEffect: "none"
    });
  });
  var dressing = {
    schema: "GuardPostTerrainDressingV1",
    id: "guard-post-semantic-camera-neutral-tufts",
    status: "RUNTIME_CANDIDATE_NOT_APPROVED",
    sourceAsset:
      "/assets/materials/golden/guard-post/v015/runtime/radial-grass-tuft-mask-160.png",
    sourceManifest: "assets/materials/golden/guard-post/v015/manifest.json",
    materialId: "terrain-tuft",
    pixelsPerFoot: 32,
    sourceEnvelope: "F5D5",
    sourceSizePixels: [160, 160],
    projection: "two-crossed-slope-rooted-planes",
    placementRule:
      "named-zone-nearest-nontraffic-interior-cell-outside-construction-apron-with-three-cell-spacing",
    excludedSurface: "guard-through-road",
    constructionApronCells: 1,
    minimumClusterSpacingCells: 3,
    placements: placements,
    planRef: plan.planFingerprint,
    mechanicsRef: plan.mechanicsFingerprint,
    mechanicalEffect: "none"
  };
  dressing.fingerprint = vignetteFingerprint(dressing);
  return dressing;
}

function goldenVignetteGuardVisualProfile(plan, seed, profileId, opts){
  opts = opts || {};
  var requested = GOLDEN_GUARD_VISUAL_PROFILE_IDS.indexOf(profileId) >= 0
    ? profileId : "institutional-frontier";
  if(requested === "neutral-clay") return null;
  var root = "/assets/materials/golden/guard-post/v001/";
  var groundRoot = "/assets/materials/golden/guard-post/v004/";
  var conditionRoot = "/assets/materials/golden/guard-post/v009/";
  var conditionSourceRoot = "/assets/materials/golden/guard-post/v008/";
  var studyPaletteRoot = "/assets/materials/golden/guard-post/v010/";
  var masonryCandidate = opts.masonryCandidate === "v015" ? "v015" : "v010";
  var masonryCandidateRoot = "/assets/materials/golden/guard-post/v015/";
  var conditionCandidate = opts.conditionCandidate === "v015" ? "v015" : "v013";
  var conditionCandidateRoot = "/assets/materials/golden/guard-post/v015/runtime/";
  /* The v015 contact-grime sheet remains a reusable source candidate, but its extracted apron
     reads as repeated clipped wedges on long wall runs even after a low-profile recompilation.
     Keep the proven v013 tileable grime parent for broad contact discoloration while v015 supplies
     the paired ivy/corner vocabulary. A condition candidate is a governed composition, not an
     obligation to promote every asset generated in the same batch. */
  var lowerWallConditionAlbedo = "/assets/materials/golden/guard-post/v013/"
    + "lower-wall-readable-ground-contact-grime-albedo-alpha.png";
  var turfCandidate = ["v010", "v011", "v016", "v017", "v018"]
    .indexOf(opts.groundCandidate) >= 0
    ? opts.groundCandidate : "v018";
  var turfAlbedoRoot = "/assets/materials/golden/guard-post/" + turfCandidate + "/";
  var turfPhysical32 = turfCandidate === "v016"
    || turfCandidate === "v017" || turfCandidate === "v018";
  var turfAlbedo = turfPhysical32
    ? turfAlbedoRoot + "ground-upland-turf-30ft-32ppf-albedo.png"
    : turfAlbedoRoot + "ground-upland-turf-albedo.png";
  var turfNormal = turfPhysical32
    ? turfAlbedoRoot + "ground-upland-turf-30ft-32ppf-normal.png"
    : groundRoot + "ground-upland-turf-normal.png";
  var turfOrm = turfPhysical32
    ? turfAlbedoRoot + "ground-upland-turf-30ft-32ppf-orm.png"
    : groundRoot + "ground-upland-turf-orm.png";
  var groundRepeat = [4.95, 6.6, 8.25, 9.9].indexOf(Number(opts.groundMetersPerRepeat)) >= 0
    ? Number(opts.groundMetersPerRepeat) : 9.9;
  var groundContactConditionRoot = "/assets/materials/golden/guard-post/v013/";
  var foundationTopGrowthRoot = "/assets/materials/golden/guard-post/v014/";
  var upland = requested === "upland-vernacular";
  var worldPixelDensityProof = goldenVignetteGuardWorldPixelDensityProof(plan, opts);
  var terrainDressing = goldenVignetteGuardTerrainDressing(plan, seed);
  var definitions = {
    "ground-upland-field": gvsGuardMaterialDefinition(
      "ground-upland-field", "natural-traffic-field", "technical-candidate",
      {
        albedo: turfAlbedo,
        secondaryAlbedo: studyPaletteRoot + "ground-upland-road-albedo.png",
        normal: turfNormal,
        secondaryNormal: groundRoot + "ground-upland-road-normal.png",
        orm: turfOrm,
        secondaryOrm: groundRoot + "ground-upland-road-orm.png",
        conditionAlbedo: conditionSourceRoot + "seam-moss-runtime-albedo-alpha.png",
        foundationConditionAlbedo: groundContactConditionRoot
          + "lower-wall-readable-ground-contact-grime-albedo-alpha.png"
      },
      /* Preserve the selected authored v018 source, but reserve the brightest values for the
         controlled road, masonry and encounter cast. This restrained whole-parent grade is
         deterministic and culture-aware; it does not choose colours per tile or repaint the
         source asset. */
      upland ? "#9cabb0" : "#a6acb5",
      {
        roughness: 0.94,
        normalScale: 0.54,
        aoIntensity: 0.3,
        metersPerRepeat: groundRepeat,
        surfaceBlend: {
          secondarySurfaces: ["guard-through-road"],
          transition: "cell-centre-bilinear-continuous",
          macroScaleWorldUnits: 7.5,
          macroStrength: 0.12,
          seedNamespace: "guard-post-ground-field-v1"
        }
      }
    ),
    "ground-meadow": gvsGuardMaterialDefinition(
      "ground-meadow", "natural-substrate", "technical-candidate",
      { albedo: root + "ground-meadow-albedo.png" },
      upland ? "#a3b5ae" : "#aabbb4",
      { roughness: 1, metersPerRepeat: 6.6 }
    ),
    "ground-road": gvsGuardMaterialDefinition(
      "ground-road", "traffic-surface", "technical-candidate",
      { albedo: root + "ground-road-albedo.png" },
      upland ? "#849bad" : "#8ea4b5",
      { roughness: 0.98, metersPerRepeat: 6.6 }
    ),
    "ground-scree": gvsGuardMaterialDefinition(
      "ground-scree", "natural-substrate", "technical-candidate",
      { albedo: studyPaletteRoot + "ground-scree-albedo.png" },
      upland ? "#a8aaa8" : "#b3b4b0",
      { roughness: 1, metersPerRepeat: 3.3, shadowLift: 0.09 }
    ),
    "ground-scree-conditioned": gvsGuardMaterialDefinition(
      "ground-scree-conditioned", "terrain-exposed-face-contact-history",
      "technical-candidate",
      {
        albedo: studyPaletteRoot + "ground-scree-albedo.png",
        secondaryAlbedo: studyPaletteRoot + "ground-scree-albedo.png",
        conditionAlbedo: conditionSourceRoot + "seam-moss-runtime-albedo-alpha.png",
        foundationConditionAlbedo: groundContactConditionRoot
          + "lower-wall-readable-ground-contact-grime-albedo-alpha.png"
      },
      upland ? "#a8aaa8" : "#b3b4b0",
      {
        roughness: 1,
        metersPerRepeat: 3.3,
        shadowLift: 0.09,
        surfaceBlend: {
          secondarySurfaces: [],
          transition: "identity-parent-with-independent-causal-condition-fields",
          macroScaleWorldUnits: 7.5,
          macroStrength: 0.04,
          seedNamespace: "guard-post-exposed-face-field-v1"
        }
      }
    ),
    "terrain-tuft": gvsGuardMaterialDefinition(
      "terrain-tuft", "camera-neutral-semantic-ground-dressing",
      "runtime-candidate-not-approved",
      {
        albedo: masonryCandidateRoot + "runtime/radial-grass-tuft-mask-160.png"
      },
      upland ? "#596d3b" : "#647b42",
      {
        roughness: 1,
        metersPerRepeat: 1.65,
        alphaTest: 0.46,
        transparent: true,
        depthWrite: true,
        alphaToCoverage: true,
        projection: "two-crossed-slope-rooted-planes",
        physicalEnvelope: "F5D5",
        pixelsPerFoot: 32
      }
    ),
    "foundation-gravel-contact": gvsGuardMaterialDefinition(
      "foundation-gravel-contact", "terrain-embedded-construction-support",
      "technical-candidate",
      {
        albedo: studyPaletteRoot + "ground-scree-albedo.png",
        conditionAlbedo: groundContactConditionRoot
          + "lower-wall-readable-ground-contact-grime-albedo-alpha.png",
        growthConditionAlbedo: conditionSourceRoot
          + "seam-moss-runtime-albedo-alpha.png",
        growthTopConditionAlbedo: foundationTopGrowthRoot
          + "foundation-top-algae-authored-alpha-512.png"
      },
      upland ? "#a8aaa8" : "#b3b4b0",
      {
        roughness: 1,
        metersPerRepeat: 3.3,
        shadowLift: 0.09,
        conditionBlend: {
          id: "causal-ground-contact-grime",
          mode: "source-over-parent-fragment",
          strength: 0.94,
          tint: "#403725",
          growthStrength: 1,
          growthTopStrength: 1,
          growthContactApron: 0.86,
          minimumNormalizedHeight: -4,
          coordinateSource: "engine-authored-receiver-band"
        }
      }
    ),
    "diorama-cut-face": gvsGuardMaterialDefinition(
      "diorama-cut-face", "presentation-cut-face", "technical-candidate",
      { albedo: studyPaletteRoot + "ground-scree-albedo.png" },
      upland ? "#706b65" : "#81776e",
      {
        roughness: 1,
        metersPerRepeat: 3.3,
        projection: "world-dominant-planar",
        shadowLift: 0.17
      }
    ),
    "lower-wall-grime": gvsGuardMaterialDefinition(
      "lower-wall-grime", "age-damp-ground-contact-condition",
      conditionCandidate === "v015"
        ? "runtime-candidate-not-approved" : "technical-candidate",
      {
        albedo: lowerWallConditionAlbedo
      },
      "#697066",
      {
        roughness: 0.96,
        metersPerRepeat: 1.65,
        alphaTest: 0.018,
        opacity: 0.54,
        transparent: true,
        depthWrite: false,
        alphaToCoverage: true,
        projection: "receiver-local-trim",
        wrapMode: "repeat-x-clamp-y",
        repeatWorldLength: 3.3,
        parentBlend: {
          mode: "source-over-parent",
          parentOwns: ["construction-rhythm", "normal", "ORM", "lighting-response"],
          overlayOwns: ["lower-wall-grime-color", "damp-discoloration", "coverage-alpha"]
        }
      }
    ),
    "seam-moss": gvsGuardMaterialDefinition(
      "seam-moss", "causal-damp-seam-growth", "technical-candidate",
      {
        albedo: conditionRoot + "guard-post-condition-trim-h4-v1-albedo-alpha-512.png"
      },
      "#ffffff",
      {
        roughness: 0.98,
        metersPerRepeat: 1.65,
        alphaTest: 0.045,
        transparent: true,
        depthWrite: false,
        alphaToCoverage: true,
        projection: "receiver-local-decal",
        wrapMode: "clamp",
        atlasSlot: {
          id: "seam-moss-pocket", u: 0.125, v: 0.5, w: 0.75, h: 0.25,
          textureSizePx: 512, sampleInsetPx: 0.5
        },
        parentBlend: {
          mode: "source-over-parent",
          parentOwns: ["construction-rhythm", "normal", "ORM", "lighting-response"],
          overlayOwns: ["moss-color", "organic-silhouette", "coverage-alpha"]
        }
      }
    ),
    "corner-ivy-face-a": gvsGuardMaterialDefinition(
      "corner-ivy-face-a", "contact-rooted-vegetation",
      conditionCandidate === "v015"
        ? "runtime-candidate-not-approved" : "technical-candidate",
      {
        albedo: conditionCandidate === "v015"
          ? conditionCandidateRoot + "ivy-corner-face-a-shared-left-mask-256.png"
          : conditionRoot + "guard-post-condition-trim-h4-v1-albedo-alpha-512.png"
      },
      conditionCandidate === "v015" ? "#4f6f3d" : "#ffffff",
      {
        roughness: 0.96,
        metersPerRepeat: 1.65,
        alphaTest: 0.055,
        transparent: true,
        depthWrite: false,
        alphaToCoverage: true,
        projection: "receiver-local-decal",
        wrapMode: "clamp",
        atlasSlot: conditionCandidate === "v015" ? null : {
          id: "corner-ivy-face-a", u: 0.125, v: 0.25, w: 0.25, h: 0.25,
          textureSizePx: 512, sampleInsetPx: 0.5, sharedEdge: "left",
          bottomAligned: true
        },
        parentBlend: {
          mode: "source-over-parent",
          parentOwns: ["construction-rhythm", "normal", "ORM", "lighting-response"],
          overlayOwns: ["leaf-color", "vine-silhouette", "coverage-alpha"]
        }
      }
    ),
    "corner-ivy-face-b": gvsGuardMaterialDefinition(
      "corner-ivy-face-b", "contact-rooted-vegetation",
      conditionCandidate === "v015"
        ? "runtime-candidate-not-approved" : "technical-candidate",
      {
        albedo: conditionCandidate === "v015"
          ? conditionCandidateRoot + "ivy-corner-face-b-shared-right-mask-256.png"
          : conditionRoot + "guard-post-condition-trim-h4-v1-albedo-alpha-512.png"
      },
      conditionCandidate === "v015" ? "#4f6f3d" : "#ffffff",
      {
        roughness: 0.96,
        metersPerRepeat: 1.65,
        alphaTest: 0.055,
        transparent: true,
        depthWrite: false,
        alphaToCoverage: true,
        projection: "receiver-local-decal",
        wrapMode: "clamp",
        atlasSlot: conditionCandidate === "v015" ? null : {
          id: "corner-ivy-face-b", u: 0.625, v: 0.25, w: 0.25, h: 0.25,
          textureSizePx: 512, sampleInsetPx: 0.5, sharedEdge: "right",
          bottomAligned: true
        },
        parentBlend: {
          mode: "source-over-parent",
          parentOwns: ["construction-rhythm", "normal", "ORM", "lighting-response"],
          overlayOwns: ["leaf-color", "vine-silhouette", "coverage-alpha"]
        }
      }
    ),
    "runoff-wet-stone": gvsGuardMaterialDefinition(
      "runoff-wet-stone", "causal-water-condition", "technical-candidate",
      {
        albedo: studyPaletteRoot + "masonry-rough-albedo.png",
        normal: root + "masonry-rough-normal.png",
        orm: root + "masonry-rough-orm.png"
      },
      upland ? "#768073" : "#7f897a",
      { roughness: 0.66, normalScale: 0.24, aoIntensity: 0.26, metersPerRepeat: 1.65 }
    ),
    "masonry-rough": gvsGuardMaterialDefinition(
      "masonry-rough", "primary-construction", "best-starting-parent",
      {
        albedo: studyPaletteRoot + "masonry-rough-albedo.png",
        normal: root + "masonry-rough-normal.png",
        orm: root + "masonry-rough-orm.png",
        conditionAlbedo: lowerWallConditionAlbedo,
        growthConditionAlbedo: conditionSourceRoot
          + "seam-moss-runtime-albedo-alpha.png"
      },
      upland ? "#c5bcaf" : "#ddd6cc",
      {
        roughness: 1,
        normalScale: 0.44,
        aoIntensity: 0.36,
        metersPerRepeat: 2.75,
        metersPerRepeatX: 2.75,
        metersPerRepeatY: 1.98,
        worldUnitsPerRepeatX: 1.6666667,
        worldUnitsPerRepeatY: 1.2,
        masonryCourse: {
          schema: "MasonryCourseCalibrationV1",
          courseHeightFeet: 1,
          courseHeightMeters: 0.3048,
          courseHeightWorldUnits: 0.2,
          courseRowsPerTile: 6,
          horizontalTasteSelection: "large-defensive-masonry",
          horizontalRelativeToPrior: 1.6667,
          verticalRule: "five-courses-per-five-feet"
        },
        shadowLift: 0.035,
        conditionBlend: {
          id: "causal-ground-contact-grime",
          mode: "source-over-parent-fragment",
          strength: 0.94,
          tint: "#4b3825",
          growthStrength: 0.52,
          growthContactApron: 0.46,
          coordinateSource: "engine-authored-receiver-band"
        }
      }
    ),
    "masonry-defensive-v015": gvsGuardMaterialDefinition(
      "masonry-defensive-v015", "primary-construction",
      "technical-candidate-not-approved",
      {
        albedo: masonryCandidateRoot
          + "defensive-masonry-W10H10-bond-proof-320-albedo.png",
        normal: masonryCandidateRoot
          + "defensive-masonry-W10H10-bond-proof-320-normal.png",
        orm: masonryCandidateRoot
          + "defensive-masonry-W10H10-bond-proof-320-orm.png",
        conditionAlbedo: lowerWallConditionAlbedo,
        growthConditionAlbedo: conditionSourceRoot
          + "seam-moss-runtime-albedo-alpha.png"
      },
      upland ? "#d4cabc" : "#eee8df",
      {
        roughness: 0.94,
        normalScale: 0.32,
        aoIntensity: 0.42,
        metersPerRepeat: 3.3,
        metersPerRepeatX: 3.3,
        metersPerRepeatY: 3.3,
        worldUnitsPerRepeatX: 2,
        worldUnitsPerRepeatY: 2,
        faceLocalModuleFeet: 10,
        masonryCourse: {
          schema: "MasonryCourseCalibrationV1",
          courseHeightFeet: 1,
          courseHeightMeters: 0.3048,
          courseHeightWorldUnits: 0.2,
          courseRowsPerTile: 10,
          horizontalTasteSelection: "socketed-W5H5-bond-variants",
          horizontalRelativeToPrior: 1,
          verticalRule: "five-courses-per-five-feet"
        },
        shadowLift: 0.025,
        conditionBlend: {
          id: "causal-ground-contact-grime",
          mode: "source-over-parent-fragment",
          strength: 0.98,
          tint: "#493822",
          growthStrength: 0.58,
          growthContactApron: 0.52,
          coordinateSource: "engine-authored-receiver-band"
        }
      }
    ),
    "masonry-ashlar": gvsGuardMaterialDefinition(
      "masonry-ashlar", "primary-construction", "best-starting-parent",
      {
        albedo: studyPaletteRoot + "masonry-ashlar-albedo.png",
        normal: root + "masonry-ashlar-normal.png",
        orm: root + "masonry-ashlar-orm.png",
        conditionAlbedo: lowerWallConditionAlbedo,
        growthConditionAlbedo: conditionSourceRoot
          + "seam-moss-runtime-albedo-alpha.png",
        growthTopConditionAlbedo: foundationTopGrowthRoot
          + "foundation-top-algae-authored-alpha-512.png"
      },
      upland ? "#d0c8bd" : "#eee8df",
      {
        roughness: 0.94,
        normalScale: 0.38,
        aoIntensity: 0.32,
        metersPerRepeat: 2.75,
        metersPerRepeatX: 2.75,
        metersPerRepeatY: 3.96,
        worldUnitsPerRepeatX: 1.6666667,
        worldUnitsPerRepeatY: 2.4,
        masonryCourse: {
          schema: "MasonryCourseCalibrationV1",
          courseHeightFeet: 1,
          courseHeightMeters: 0.3048,
          courseHeightWorldUnits: 0.2,
          courseRowsPerTile: 12,
          horizontalTasteSelection: "large-defensive-masonry",
          horizontalRelativeToPrior: 1.6667,
          verticalRule: "five-courses-per-five-feet"
        },
        conditionBlend: {
          id: "causal-ground-contact-grime",
          mode: "source-over-parent-fragment",
          strength: 0.98,
          tint: "#493822",
          growthStrength: 0.62,
          growthTopStrength: 0.86,
          growthContactApron: 0.58,
          coordinateSource: "engine-authored-receiver-band"
        }
      }
    ),
    "masonry-institutional-trim": gvsGuardMaterialDefinition(
      "masonry-institutional-trim", "institutional-edge-and-opening-language",
      "technical-candidate-not-approved",
      {
        albedo: studyPaletteRoot + "masonry-ashlar-albedo.png",
        normal: root + "masonry-rough-normal.png",
        orm: root + "masonry-rough-orm.png"
      },
      "#b7aa98",
      {
        roughness: 0.92,
        normalScale: 0.3,
        aoIntensity: 0.38,
        metersPerRepeat: 2.75,
        metersPerRepeatX: 2.75,
        metersPerRepeatY: 3.96,
        worldUnitsPerRepeatX: 1.6666667,
        worldUnitsPerRepeatY: 2.4,
        expressionRule:
          "warm dressed-stone contrast makes quoins, cornice, hoods, caps, and thresholds read as one institutional attachment practice",
        mechanicalEffect: "none"
      }
    ),
    "timber-structural": gvsGuardMaterialDefinition(
      "timber-structural", "supporting-timber", "technical-candidate",
      { albedo: root + "timber-structural-albedo.png" },
      upland ? "#765f49" : "#806850",
      { roughness: 0.91, metersPerRepeat: 1.65 }
    ),
    "roof-slate": gvsGuardMaterialDefinition(
      "roof-slate", "roof-weather-surface", "technical-candidate",
      { albedo: root + "roof-slate-albedo.png" },
      "#d5dbe2",
      { roughness: 0.82, metersPerRepeat: 1.65 }
    ),
    "roof-timber-shingle": gvsGuardMaterialDefinition(
      "roof-timber-shingle", "roof-weather-surface", "technical-candidate",
      { albedo: root + "roof-timber-shingle-albedo.png" },
      "#b5a9a0",
      { roughness: 0.94, metersPerRepeat: 1.65 }
    ),
    "signifier-cloth-primary": gvsGuardMaterialDefinition(
      "signifier-cloth-primary", "world-truth-signifier-placeholder",
      "noncanonical-fixture-placeholder",
      {
        albedo: masonryCandidateRoot + "runtime/signifier-banner-long-mask-160x320.png"
      },
      "#8f3044",
      {
        roughness: 0.88,
        metersPerRepeat: 1.65,
        alphaTest: 0.46,
        transparent: true,
        depthWrite: true,
        alphaToCoverage: true,
        projection: "receiver-local-decal",
        wrapMode: "clamp",
        sourceKind: "recolorable-authored-mask-fixture-placeholder",
        contextVerdict: "NON_CANONICAL_FIXTURE_PLACEHOLDER"
      }
    ),
    "signifier-cloth-secondary": gvsGuardMaterialDefinition(
      "signifier-cloth-secondary", "world-truth-signifier-placeholder",
      "noncanonical-fixture-placeholder", {}, "#d3ad58",
      {
        roughness: 0.84,
        metersPerRepeat: 1.65,
        sourceKind: "scalar-fixture-placeholder",
        contextVerdict: "NON_CANONICAL_FIXTURE_PLACEHOLDER"
      }
    ),
    "signifier-surface-mark": gvsGuardMaterialDefinition(
      "signifier-surface-mark", "world-truth-signifier-placeholder",
      "noncanonical-fixture-placeholder", {}, "#59242d",
      {
        roughness: 0.96,
        metersPerRepeat: 1.65,
        sourceKind: "scalar-fixture-placeholder",
        contextVerdict: "NON_CANONICAL_FIXTURE_PLACEHOLDER"
      }
    ),
    "iron-dark": gvsGuardMaterialDefinition(
      "iron-dark", "restrained-accent", "technical-candidate",
      {},
      "#3f4547",
      { roughness: 0.68, metalness: 0.38, metersPerRepeat: 1.65 }
    )
  };
  var profile = {
    schema: "GuardPostVisualProfileV1",
    version: 1,
    profileId: requested,
    cultureId: requested,
    seed: seed >>> 0,
    planRef: plan.planFingerprint,
    mechanicsRef: plan.mechanicsFingerprint,
    materialPackRef: "assets/materials/golden/guard-post/" + turfCandidate + "/manifest.json",
    materialSourcePacks: [
      "assets/materials/golden/guard-post/v001/manifest.json",
      "assets/materials/golden/guard-post/v003/manifest.json",
      "assets/materials/golden/guard-post/v004/manifest.json",
      "assets/materials/golden/guard-post/v007/manifest.json",
      "assets/materials/golden/guard-post/v008/manifest.json",
      "assets/materials/golden/guard-post/v009/manifest.json",
      "assets/materials/golden/guard-post/v010/manifest.json",
      "assets/materials/golden/guard-post/v011/manifest.json",
      "assets/materials/golden/guard-post/v012/manifest.json",
      "assets/materials/golden/guard-post/v013/manifest.json",
      "assets/materials/golden/guard-post/v014/manifest.json"
    ].concat(
      turfCandidate === "v011" ? [] :
        ["assets/materials/golden/guard-post/" + turfCandidate + "/manifest.json"],
      ["assets/materials/golden/guard-post/v015/manifest.json"]
    ),
    groundCalibration: {
      candidate: turfCandidate,
      metersPerRepeat: groundRepeat,
      combatTileMeters: 1.65,
      cellsPerRepeat: +(groundRepeat / 1.65).toFixed(4),
      pixelsPerFoot: turfPhysical32 ? 32 : null,
      physicalRepeatFeet: turfPhysical32 ? 30 : null,
      exactPixelSize: turfPhysical32 ? [960, 960] : null,
      mechanicalEffect: "none"
    },
    masonryCalibration: {
      candidate: masonryCandidate,
      pixelsPerFoot: masonryCandidate === "v015" ? 32 : null,
      parentEnvelope: masonryCandidate === "v015" ? "W10H10" : "legacy-physical-repeat",
      mechanicalEffect: "none"
    },
    conditionCalibration: {
      candidate: conditionCandidate,
      parentIndependentMasks: conditionCandidate === "v015",
      placementSockets: conditionCandidate === "v015"
        ? [
            "wall-ground-contact-repeat-x",
            "two-face-corner-shared-left-ground-root",
            "two-face-corner-shared-right-ground-root"
          ] : ["legacy-receiver-local-condition"],
      mechanicalEffect: "none"
    },
    terrainOccluderPresentation: {
      schema: "GuardPostTerrainOccluderPresentationV1",
      catalog: "meshy-genesis",
      allowedSlugs: ["low-cover-boulder-cluster"],
      fallback: "renderer-icosahedron-preserving-declared-site-envelope",
      canonicalWorldWidth: 1.15,
      placementAuthority: "terrainOccluderSites",
      transformAuthority: "terrainExpressionJitter",
      selectionBudget: {
        everyNthEdge: 7,
        maximumSites: 24,
        rationale:
          "sparse edge-rooted authored clusters; never a field of repeated prop clones"
      },
      sizeLaw: "donor-width-equals-declared-site-sizeCells",
      collisionAuthority: "terrain-expression-site-no-battle-collision",
      materialContext: {
        stone: upland ? "granite" : "slate"
      },
      admissionClass: "DIRECT_MODULATED",
      mechanicalEffect: "none"
    },
    worldPixelDensityDemonstration: worldPixelDensityProof,
    terrainDressing: terrainDressing,
    materialBindings: {
      architecture: {
        "site-road": "ground-road",
        "site-earthwork": "ground-scree",
        "foundation": "masonry-ashlar",
        "foundation-gravel": "foundation-gravel-contact",
        "masonry-wall": masonryCandidate === "v015"
          ? "masonry-defensive-v015" : "masonry-rough",
        "masonry-edge": upland ? "masonry-ashlar" : "masonry-institutional-trim",
        "timber-structure": "timber-structural",
        "timber-surface": "timber-structural",
        "roof-field": upland ? "roof-timber-shingle" : "roof-slate",
        "metal-mechanism": "iron-dark",
        "repair": "masonry-ashlar",
        "cutaway-cap": "masonry-ashlar",
        "condition-lower-wall-grime": "lower-wall-grime",
        "condition-seam-moss": "seam-moss",
        "condition-corner-ivy-a": "corner-ivy-face-a",
        "condition-corner-ivy-b": "corner-ivy-face-b",
        "condition-wet-stone": "runoff-wet-stone",
        "signifier-support": "iron-dark",
        "signifier-cloth-primary": "signifier-cloth-primary",
        "signifier-cloth-secondary": "signifier-cloth-secondary",
        "signifier-surface-mark": "signifier-surface-mark"
      },
      terrain: {
        "natural-top": "ground-upland-field",
        "traffic-top": "ground-upland-field",
        "exposed-face": "ground-scree-conditioned",
        "tray-wall": "diorama-cut-face",
        "boulder": "ground-scree"
      },
      terrainSurface: {
        "guard-through-road": "ground-upland-field",
        "guard-terrain-flank": "ground-upland-field",
        "guard-retained-shelf": "ground-upland-field"
      }
    },
    materialDefinitions: definitions,
    worldSignifierDemonstration: {
      schema: "WorldSignifierDemonstrationV1",
      truthStatus: "NON_CANONICAL_FIXTURE_PLACEHOLDER",
      worldTruthRef: "guard-post-proof:faction-placeholder-01",
      paletteRef: "guard-post-proof:crimson-ochre",
      separationRule:
        "culture supplies attachment tradition and sockets; world truth supplies polity, palette, emblem, occupation, and meaning",
      supportedMedia: ["hanging-banner", "pole-flag", "surface-daub"],
      mechanicalEffect: "none"
    },
    terrainConditionFields: goldenVignetteGuardTerrainConditionFields(plan),
    conditionLayers: [
      { id: "traffic", causeRefs: ["guard-through-road", "threshold", "barrier", "stair", "deck"] },
      {
        id: "lower-wall-grime",
        causeRefs: [
          "route-control-retaining-old-far", "route-control-retaining-old-near",
          "route-control-guard-street-wall", "route-control-guard-far-return"
        ],
        projection: "wall-ground-origin-with-irregular-upward-fade",
        placementGrammar: "broad-lower-band",
        faceCoverageRule: "edge-origin-not-edge-confined",
        visibilityRule: "readable-at-gameplay-scale",
        materialRoles: ["condition-lower-wall-grime"],
        cleanlinessRule:
          "new repair and coping interrupt broad grime carried by older wall bases",
        mechanicalEffect: "none"
      },
      {
        id: "seam-moss",
        causeRefs: ["route-control-drain-outfall", "route-control-drain-channel"],
        projection: "outfall-origin-to-readable-seam-islands",
        placementGrammar: "edge-origin-with-outward-spread",
        faceCoverageRule: "mid-scale-unequal-pockets",
        visibilityRule: "readable-at-gameplay-scale",
        materialRoles: ["condition-seam-moss", "condition-wet-stone"],
        cleanlinessRule:
          "new coping stays cleaner; moss spreads visibly from lower corners and channel lips",
        mechanicalEffect: "none"
      },
      {
        id: "corner-ivy",
        causeRefs: [
          "route-control-guard-foundation", "route-control-guard-street-wall",
          "route-control-guard-far-return"
        ],
        projection: "two-face-wall-floor-corner-wrap",
        placementGrammar: "contact-rooted-silhouette-cluster",
        faceCoverageRule: "large-growth-mass-with-negative-gaps",
        visibilityRule: "readable-at-gameplay-scale",
        materialRoles: ["condition-corner-ivy-a", "condition-corner-ivy-b"],
        cleanlinessRule:
          "cluster avoids controlled door and observation sill while wrapping a shaded old corner",
        mechanicalEffect: "none"
      },
      {
        id: "terrain-damp-moss",
        causeRefs: ["route-control-drain-outfall", "route-control-drain-channel"],
        projection: "mesh-conformal-shared-vertex-field",
        placementGrammar: "least-uphill-drainage-walk-plus-concavity",
        faceCoverageRule: "continuous-across-shared-terrain-vertices",
        visibilityRule: "readable-at-gameplay-scale",
        materialRoles: ["terrain-condition-seam-moss"],
        cleanlinessRule:
          "maintained traffic surface suppresses growth without flattening the moisture field",
        mechanicalEffect: "none"
      },
      { id: "repair", causeRefs: ["drainage-repair"] }
    ],
    accentFamily: "restrained-iron-and-signal",
    propDemands: [
      { id: "signal-cluster", relation: "lookout-operation", maximumClusters: 1 },
      { id: "work-cluster", relation: "barrier-and-repair", maximumClusters: 1 },
      { id: "supply-cluster", relation: "guard-occupation", maximumClusters: 1 },
      { id: "repair-witness", relation: "drainage-repair-history", maximumClusters: 1 },
      {
        id: "defensive-reinforcement",
        relation: "retaining-defense",
        maximumClusters: 1
      }
    ],
    spriteDemands: worldPixelDensityProof
      ? worldPixelDensityProof.actors.map(function(actor){
          return {
            id: actor.id,
            role: actor.role,
            side: actor.side,
            asset: actor.asset,
            cell: gvsClone(actor.cell),
            pixelsPerFoot: actor.pixelsPerFoot,
            worldHeightFeet: actor.worldHeightFeet,
            mechanicalEffect: "none"
          };
        }) : [],
    lightIntent: "daylight-base-art-first; motivated-practicals-only-at-night",
    contextIntent: "near-adjacency-truth; far-premise-without-false-route",
    fallbackLadder: [
      "admitted-for-context",
      "best-starting-parent-with-candidate-receipt",
      "sprite-albedo-plus-scalar-roughness",
      "role-colored-truthful-proxy",
      "explicitly-optional-omission"
    ]
  };
  profile.fingerprint = vignetteFingerprint(profile);
  return profile;
}

function goldenVignetteWave2SceneBuild(sceneId, seed, opts){
  var definition = goldenVignetteWave2SceneDefinition(sceneId);
  if(!definition) return null;
  var s = seed == null ? vignetteSeedFrom(["gv-w2-guard-post"]) : seed >>> 0;
  var profileId = opts && opts.visualProfileId
    ? opts.visualProfileId : "institutional-frontier";
  var request = goldenVignetteWave2FixtureRequest("guard-post", s, opts || {});
  request.presentationCultureId = profileId;
  request.presentationLightMode = definition.presentationLightMode || "day";
  if(opts && opts.signifierState){
    request.presentationSignifierState = gvsClone(opts.signifierState);
  }
  var compilation = goldenVignetteCompile(request, { seed: s });
  var plan = compilation.plan;
  var field = plan.terrainPlan.field;
  var visualProfile = goldenVignetteGuardVisualProfile(plan, s, profileId, opts || {});
  return {
    sceneId: sceneId,
    featureBook: GOLDEN_VIGNETTE_WAVE2_FIXTURE,
    featureId: "GV-W2-GUARD",
    spec: plan.terrainPlan.spec,
    fields: [field],
    primary: field,
    structures: plan.constructionPlan,
    architectureFixture: GOLDEN_VIGNETTE_WAVE2_FIXTURE,
    architecturePlan: compilation.architectureAssembly,
    cameraLaw: TERRAIN_DEFENSIVE_CAMERA_LAW,
    tacticalGrammar: plan.terrainPlan.spec.tacticalGrammar,
    macroGraph: plan.terrainPlan.spec.macroGraph,
    routeReport: plan.terrainPlan.routeReport,
    quietSurfaceReport: plan.terrainPlan.quietSurfaceReport,
    cameraReport: compilation.receipt.validation.camera.report,
    lightRecipeId: definition.lightRecipeId,
    visualProfile: visualProfile,
    visualProfileRequested: profileId,
    compilation: compilation
  };
}
