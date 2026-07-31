/* ─── CL-F09 · ARCHITECTURE FORM LADDER ───────────────────────────────────────────────────────
   docs/ARCHITECTURE-CLAYROOM-FORM-LADDER.md. Engine-owned neutral-clay building plans.

   The renderer receives compiledMembers and assetSockets. It may project those records; it may
   not infer a building from footprint/role/storeys or author a wall, roof, stair, opening, support,
   barrier, or condition edit. These first eight forms are curated proof fixtures. Procedural
   mutation promotes only after their visual relationships pass review.

   Classic script: no DOM, THREE, camera, world singleton, Math.random, or runtime asset loading. */

var ARCHITECTURE_FORM_PROOF_FIXTURE = Object.freeze({
  id: "cl-f09-architecture-form-ladder",
  version: 1,
  status: "ACTIVE PREREQUISITE",
  source: "docs/ARCHITECTURE-CLAYROOM-FORM-LADDER.md",
  question: "Can one engine-owned assembly grammar produce unlike, believable tactical buildings?",
  scenes: Object.freeze([
    Object.freeze({ id: "arch-af01-road-checkpoint", formId: "AF-01", label: "ROAD CHECKPOINT",
      scale: "infrastructure", capture: 1, lightRecipeId: "daylit" }),
    Object.freeze({ id: "arch-af02-roadside-shelter", formId: "AF-02", label: "ROADSIDE SHELTER",
      scale: "small", capture: 2, lightRecipeId: "daylit" }),
    Object.freeze({ id: "arch-af03-embedded-guardroom", formId: "AF-03", label: "EMBEDDED GUARDROOM",
      scale: "small-medium", capture: 3, lightRecipeId: "daylit" }),
    Object.freeze({ id: "arch-af04-workshop-shed", formId: "AF-04", label: "WORKSHOP SHED",
      scale: "medium", capture: 4, lightRecipeId: "daylit" }),
    Object.freeze({ id: "arch-af05-courtyard-range", formId: "AF-05", label: "COURTYARD RANGE",
      scale: "medium", capture: 5, lightRecipeId: "daylit" }),
    Object.freeze({ id: "arch-af06-market-hall", formId: "AF-06", label: "MARKET HALL",
      scale: "medium-large", capture: 6, lightRecipeId: "daylit" }),
    Object.freeze({ id: "arch-af07-gatehouse", formId: "AF-07", label: "FORTIFIED GATEHOUSE",
      scale: "large", capture: 7, lightRecipeId: "daylit" }),
    Object.freeze({ id: "arch-af08-watchtower-ruin", formId: "AF-08", label: "WATCHTOWER · RUINED",
      scale: "tall", capture: 8, lightRecipeId: "daylit" })
  ])
});

var ARCHITECTURE_FORM_SUITE2_FIXTURE = Object.freeze({
  id: "cl-f10-architecture-program-form-ladder",
  version: 1,
  status: "ACTIVE PREREQUISITE",
  source: "docs/ARCHITECTURE-CLAYROOM-FORM-LADDER.md",
  question: "Can the shared assembly grammar express unlike operating programs and terrain relations?",
  scenes: Object.freeze([
    Object.freeze({ id: "arch-af09-party-wall-frontage", formId: "AF-09",
      label: "PARTY-WALL FRONTAGE", scale: "medium", capture: 9, lightRecipeId: "daylit",
      fixtureId: "cl-f10-architecture-program-form-ladder" }),
    Object.freeze({ id: "arch-af10-keeper-cell-block", formId: "AF-10",
      label: "KEEPER + CELL BLOCK", scale: "medium", capture: 10, lightRecipeId: "daylit",
      fixtureId: "cl-f10-architecture-program-form-ladder" }),
    Object.freeze({ id: "arch-af11-shaft-head-hoist", formId: "AF-11",
      label: "SHAFT-HEAD + HOIST", scale: "medium", capture: 11, lightRecipeId: "daylit",
      fixtureId: "cl-f10-architecture-program-form-ladder" }),
    Object.freeze({ id: "arch-af12-terraced-commune", formId: "AF-12",
      label: "TERRACED COMMUNE", scale: "large", capture: 12, lightRecipeId: "daylit",
      fixtureId: "cl-f10-architecture-program-form-ladder" }),
    Object.freeze({ id: "arch-af13-bridgehouse-waterwork", formId: "AF-13",
      label: "BRIDGEHOUSE + WATERWORK", scale: "large", capture: 13, lightRecipeId: "daylit",
      fixtureId: "cl-f10-architecture-program-form-ladder" }),
    Object.freeze({ id: "arch-af14-inn-manor-hip", formId: "AF-14",
      label: "INN / MANOR · HIP ROOF", scale: "medium-large", capture: 14,
      lightRecipeId: "daylit", fixtureId: "cl-f10-architecture-program-form-ladder" }),
    Object.freeze({ id: "arch-af15-hillside-stair-street", formId: "AF-15",
      label: "HILLSIDE STAIR STREET", scale: "large", capture: 15, lightRecipeId: "daylit",
      fixtureId: "cl-f10-architecture-program-form-ladder" }),
    Object.freeze({ id: "arch-af16-great-hall", formId: "AF-16",
      label: "GREAT HALL / LONGHOUSE", scale: "large", capture: 16, lightRecipeId: "daylit",
      fixtureId: "cl-f10-architecture-program-form-ladder" })
  ])
});

var ARCHITECTURE_FORM_MONUMENTAL_FIXTURE = Object.freeze({
  id: "cl-f11-monumental-fantasy-architecture",
  version: 1,
  status: "ACTIVE PREREQUISITE",
  source: "docs/ARCHITECTURE-CLAYROOM-FORM-LADDER.md",
  question: "Can the same assembly grammar express elite civic scale, luxury, and historical wonder?",
  scenes: Object.freeze([
    Object.freeze({ id: "arch-af17-sanctuary-nave", formId: "AF-17",
      label: "SANCTUARY NAVE · STAINED WALL", scale: "monumental-interior",
      capture: 34, lightRecipeId: "daylit",
      fixtureId: "cl-f11-monumental-fantasy-architecture" }),
    Object.freeze({ id: "arch-af18-palace-processional-court", formId: "AF-18",
      label: "PALACE PROCESSIONAL COURT", scale: "monumental-exterior",
      capture: 35, lightRecipeId: "daylit",
      fixtureId: "cl-f11-monumental-fantasy-architecture" }),
    Object.freeze({ id: "arch-af19-arcane-civic-aqueduct", formId: "AF-19",
      label: "ARCANE CIVIC AQUEDUCT", scale: "monumental-exterior",
      capture: 36, lightRecipeId: "daylit",
      fixtureId: "cl-f11-monumental-fantasy-architecture" }),
    Object.freeze({ id: "arch-af20-star-archive-rotunda", formId: "AF-20",
      label: "STAR ARCHIVE ROTUNDA", scale: "monumental-interior",
      capture: 37, lightRecipeId: "daylit",
      fixtureId: "cl-f11-monumental-fantasy-architecture" })
  ])
});

var ARCHITECTURE_FORM_MEGAINTERIOR_FIXTURE = Object.freeze({
  id: "cl-f12-megainterior-materialization-window",
  version: 1,
  status: "ACTIVE PREREQUISITE",
  source: "docs/ARCHITECTURE-CLAYROOM-FORM-LADDER.md",
  question: "Can a battle map occupy only one cropped corner of a far larger grand interior?",
  scenes: Object.freeze([
    Object.freeze({ id: "arch-af21-grand-concourse-corner", formId: "AF-21",
      label: "GIANT CONCOURSE RUIN · ONE CORNER",
      scale: "antediluvian-giant-megainterior-fragment",
      capture: 38, lightRecipeId: "daylit",
      fixtureId: "cl-f12-megainterior-materialization-window" })
  ])
});

var ARCHITECTURE_FORM_PRECINCT_FIXTURE = Object.freeze({
  id: "cl-f13-real-roll-urban-precinct",
  version: 1,
  status: "ACTIVE REAL-REQUEST PROOF",
  source: "docs/GOLDEN-SITES-PROOF-QUEUE.md#2026-07-30-architecture-ruling-preflight",
  question: "Can connected natural terrain and constructed urban frontage form one FFT-like exterior battle precinct?",
  sourceRequest: Object.freeze({
    caseId: "natural:urban:0001",
    requestFingerprint: "vgo1-5c6f5a06",
    rootSeed: "2047493461",
    primaryType: "Market Ward",
    threat: "Dockside Enforcers",
    encounterBranches: Object.freeze(["Rumor", "Enemy"]),
    sourceCorpus: "docs/intel/golden-vignette-wave1-corpus.jsonl.gz"
  }),
  scenes: Object.freeze([
    Object.freeze({ id: "arch-af22-market-hillside-precinct", formId: "AF-22",
      label: "MARKET WARD · HILLSIDE ALLEY PRECINCT",
      scale: "civic-exterior-precinct", capture: 39, lightRecipeId: "daylit",
      fixtureId: "cl-f13-real-roll-urban-precinct" })
  ])
});

var ARCHITECTURE_FORM_SCENE_IDS = Object.freeze(
  ARCHITECTURE_FORM_PROOF_FIXTURE.scenes
    .concat(ARCHITECTURE_FORM_SUITE2_FIXTURE.scenes)
    .concat(ARCHITECTURE_FORM_MONUMENTAL_FIXTURE.scenes)
    .concat(ARCHITECTURE_FORM_MEGAINTERIOR_FIXTURE.scenes)
    .concat(ARCHITECTURE_FORM_PRECINCT_FIXTURE.scenes)
    .map(function(scene){ return scene.id; }));

var ARCHITECTURE_FORM_MATERIAL_ROLES = Object.freeze([
  "site-road", "site-earthwork", "site-water", "foundation", "masonry-wall", "masonry-edge",
  "timber-structure", "timber-surface", "roof-field", "metal-mechanism", "repair",
  "cutaway-cap", "ornamental-stone", "stained-glass", "luxury-floor", "arcane-residue",
  "gilded-metal", "signifier-support", "signifier-cloth-primary",
  "signifier-cloth-secondary", "signifier-surface-mark",
  "practical-housing", "practical-emitter"
]);

/* A visual rejection is scoped to one projection/job. The compact early forms remain useful
   battle grammar AND intentionally reusable miniature vocabulary for TownTray, overworld,
   neighborhood, estate, and fortress-overview projections. They are not overwritten when a later
   proof demonstrates a larger battle-scale interior. */
var ARCHITECTURE_FORM_PROJECTION_ROLES = Object.freeze({
  "AF-01": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-02": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-03": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-04": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-05": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-06": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-07": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-08": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-09": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-10": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-11": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-12": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-13": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-14": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-15": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-16": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-17": Object.freeze(["battle-window-capable"]),
  "AF-18": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-19": Object.freeze(["battle-window-capable", "miniature-overview-capable"]),
  "AF-20": Object.freeze(["battle-window-capable"]),
  "AF-21": Object.freeze(["battle-window-capable"]),
  "AF-22": Object.freeze(["battle-window-capable"])
});

/* Retain the lesson without retaining the failure as a production candidate. These records point
   to generic machinery or past evidence; `productionSelectable:false` is the hard boundary. A
   negative control may be replayed in a diagnostic harness or reviewed from its archived frame,
   but the synthesizer may never select it for a live materialization. */
var ARCHITECTURE_REJECTED_MACHINERY_REGISTRY = Object.freeze([
  Object.freeze({
    id: "independent-member-scatter",
    status: "diagnostic-negative-control",
    failure: "each module receives an unrelated random transform and the building loses program",
    retainedAs: "bounded-variant negative control and source history",
    productionSelectable: false
  }),
  Object.freeze({
    id: "uniform-affine-building-growth",
    status: "diagnostic-negative-control",
    failure: "scaling a complete building changes dimensions but does not add rooms, storeys, or circulation",
    retainedAs: "variant evidence; reviewed growth operators supersede it for production growth",
    productionSelectable: false
  }),
  Object.freeze({
    id: "inclined-roof-daylight-gap",
    status: "diagnostic-negative-control",
    failure: "roof planes meet wall tops without real gable or edge closure members",
    retainedAs: "round-05 before-state capture and roof-junction validator",
    productionSelectable: false
  }),
  Object.freeze({
    id: "arbitrary-stair-connector-platform",
    status: "diagnostic-negative-control",
    failure: "a platform conceals disconnected stair endpoints instead of forming one exact seam",
    retainedAs: "AF-21 before-state capture and stair-seam validator",
    productionSelectable: false
  }),
  Object.freeze({
    id: "unsupported-upper-stair",
    status: "diagnostic-negative-control",
    failure: "a higher flight begins at an upper datum without declared support to a foundation",
    retainedAs: "AF-21 before-state capture and stair-support validator",
    productionSelectable: false
  }),
  Object.freeze({
    id: "presentation-hidden-collision",
    status: "diagnostic-negative-control",
    failure: "a cutaway or camera hide masks intersecting physical modules",
    retainedAs: "assembly-clearance negative control",
    productionSelectable: false
  })
]);

/* A vignette chooses one of these before massing. Dedicated interiors are room graphs with an
   exterior-context projection, not buildings peeled open by default. Exterior precincts use
   complete/inaccessible building depth as their battlefield boundary. Hybrid exposure is reserved
   for a causal breach, ruin, courtyard, open hall, or story transition that needs both domains. */
var ARCHITECTURE_BATTLE_SPACE_MODES = Object.freeze({
  DEDICATED_INTERIOR: Object.freeze({
    id: "dedicated-interior",
    playableDomain: "room-and-interior-circulation",
    boundaryLaw: "opaque-or-cutaway-projected-shell",
    exteriorDepth: "context-only-unless-threshold-transition"
  }),
  EXTERIOR_PRECINCT: Object.freeze({
    id: "exterior-architectural-precinct",
    playableDomain: "street-court-roof-and-exterior-works",
    boundaryLaw: "complete-facade-with-inaccessible-depth",
    interiorDepth: "latent-unless-a-separate-interior-window-is-committed"
  }),
  JUSTIFIED_HYBRID: Object.freeze({
    id: "causally-justified-hybrid",
    playableDomain: "named-interior-exterior-transition",
    boundaryLaw: "breach-ruin-court-open-hall-or-scripted-threshold",
    interiorDepth: "only-the-exposed-and-validated-program-slice"
  })
});

/* `Medium` is a gameplay size band, not a human silhouette. These profiles keep a common tactical
   occupancy class while giving portals, turns, stairs, and service routes honest morphology. */
var ARCHITECTURE_CREATURE_SCALE_PROFILES = Object.freeze({
  "upright-medium": Object.freeze({
    id: "upright-medium", bodyPlan: "upright-biped-or-compact-quadruped",
    bodyWidth: 0.8, bodyLength: 0.8, bodyHeight: 1.9,
    minPortalWidth: 1.0, minPortalHeight: 1.85, minRouteWidth: 1.0,
    minTurnDiameter: 1.25, verticalModes: Object.freeze(["stair", "ramp", "ladder"])
  }),
  "broad-medium": Object.freeze({
    id: "broad-medium", bodyPlan: "broad-shouldered-hunched-or-wing-folded",
    bodyWidth: 1.3, bodyLength: 1.05, bodyHeight: 2.15,
    minPortalWidth: 1.5, minPortalHeight: 2.1, minRouteWidth: 1.6,
    minTurnDiameter: 2.15, verticalModes: Object.freeze(["broad-stair", "ramp"])
  }),
  "long-medium": Object.freeze({
    id: "long-medium", bodyPlan: "long-bodied-quadruped-or-serpentine",
    bodyWidth: 1.05, bodyLength: 2.15, bodyHeight: 1.65,
    minPortalWidth: 1.45, minPortalHeight: 1.7, minRouteWidth: 1.65,
    minTurnDiameter: 2.85, verticalModes: Object.freeze(["ramp", "switchback-ramp"])
  })
});

/* A runtime catalog is not an inventory census. Genesis currently has useful generated Meshy
   geometry on both sides of the citizenship boundary. The architecture compiler names those states
   explicitly so a proof can request promotion without either (a) pretending a queued prompt is a
   model or (b) reaching into Reference/source-archive at runtime. Counts are audited against
   Reference/Meshy-Premium-Month-1 on 2026-07-29. */
var ARCHITECTURE_ASSET_PROMOTION_CENSUS = Object.freeze({
  schema: "ArchitectureAssetPromotionCensusV1",
  auditedAt: "2026-07-29",
  runtimePack: "meshy-genesis",
  runtimeCitizens: Object.freeze([
    "M001-A", "M019-A", "M035-A", "M049-D", "M052-A", "M053-A", "M054-A", "M055-A",
    "M056-A", "M057-A", "M058-A", "M059-A", "M062-B", "M064-B", "M068-A",
    "M025-A", "M047-A", "M075-A"
  ]),
  generatedAdjudicatedNotCitizens: Object.freeze([
    "M005-A", "M020-A", "M021-A", "M022-A", "M023-A", "M024-A", "M069-A",
    "M070-A", "M071-A", "M072-A", "M073-A", "M073-D", "M074-A"
  ]),
  processedConnectiveNotCitizens: Object.freeze([
    "CP001", "CP002", "CP003", "CP004", "CP006", "CP008",
    "CP009", "CP011", "CP012", "CP013", "CP015", "CP016"
  ]),
  processedOrganicNotCitizens: Object.freeze(["M012-A", "M012-C"]),
  organicSourceGlbCount: 14,
  productionManifestRows: 300,
  productionManifestAcceptedRows: 18,
  productionManifestPlannedOnlyRows: 268,
  policy: "Runtime citizens may load; generated candidates may request promotion; planned rows may not load."
});

function architectureRound(n){ return +Number(n).toFixed(5); }
function architectureVec2(x, z){ return { x: Number(x), z: Number(z) }; }
function architectureDot(a, b){ return a.x * b.x + a.z * b.z; }
function architectureLen(v){ return Math.sqrt(v.x * v.x + v.z * v.z); }
function architectureUnit(v){
  var len = architectureLen(v);
  if(len <= 0.000001) throw new Error("architectureUnit: zero vector");
  return { x: v.x / len, z: v.z / len };
}

function architectureSceneDefinition(sceneId){
  var scenes = ARCHITECTURE_FORM_PROOF_FIXTURE.scenes
    .concat(ARCHITECTURE_FORM_SUITE2_FIXTURE.scenes)
    .concat(ARCHITECTURE_FORM_MONUMENTAL_FIXTURE.scenes)
    .concat(ARCHITECTURE_FORM_MEGAINTERIOR_FIXTURE.scenes)
    .concat(ARCHITECTURE_FORM_PRECINCT_FIXTURE.scenes);
  for(var i = 0; i < scenes.length; i++){
    if(scenes[i].id === sceneId){
      return scenes[i];
    }
  }
  return null;
}

function architectureFixtureForScene(sceneId){
  var def = architectureSceneDefinition(sceneId);
  if(def && def.fixtureId === ARCHITECTURE_FORM_SUITE2_FIXTURE.id){
    return ARCHITECTURE_FORM_SUITE2_FIXTURE;
  }
  if(def && def.fixtureId === ARCHITECTURE_FORM_MONUMENTAL_FIXTURE.id){
    return ARCHITECTURE_FORM_MONUMENTAL_FIXTURE;
  }
  if(def && def.fixtureId === ARCHITECTURE_FORM_MEGAINTERIOR_FIXTURE.id){
    return ARCHITECTURE_FORM_MEGAINTERIOR_FIXTURE;
  }
  if(def && def.fixtureId === ARCHITECTURE_FORM_PRECINCT_FIXTURE.id){
    return ARCHITECTURE_FORM_PRECINCT_FIXTURE;
  }
  return ARCHITECTURE_FORM_PROOF_FIXTURE;
}

function architecturePlanBase(def, opts){
  opts = opts || {};
  return {
    schema: "ArchitectureAssemblyPlanV1",
    version: 1,
    fixtureId: def.fixtureId || ARCHITECTURE_FORM_PROOF_FIXTURE.id,
    sceneId: def.id,
    formId: def.formId,
    label: def.label,
    scale: def.scale,
    phase: "curated-form-proof",
    seed: opts.seed == null ? 0 : opts.seed >>> 0,
    extentCells: opts.extentCells || { x: 18, y: 18 },
    primarySpatialSentence: opts.primarySpatialSentence || "",
    programTopology: opts.programTopology || [],
    constructionProfile: opts.constructionProfile || "mixed",
    physicalState: opts.physicalState || "intact",
    operatingState: opts.operatingState || "operating",
    battleSpaceMode: opts.battleSpaceMode
      || ARCHITECTURE_BATTLE_SPACE_MODES.EXTERIOR_PRECINCT.id,
    occupantProfile: opts.occupantProfile || "upright-medium",
    assemblyClearancePolicy: opts.assemblyClearancePolicy || "audit-only",
    frame: opts.frame || {
      origin: { x: 0, y: 0, z: 0 },
      forward: { x: 0, z: -1 }, right: { x: 1, z: 0 }, up: { x: 0, y: 1, z: 0 }
    },
    levels: [],
    wallRuns: [],
    openings: [],
    stairs: [],
    roofs: [],
    thresholds: [],
    assetSockets: [],
    accessGraph: [],
    cutawayGroups: [],
    roofJunctions: [],
    orthogonalRunClosures: [],
    clearanceEnvelopes: [],
    lightSockets: [],
    presentation: { hiddenMemberIds: [], cutawayGroups: [] },
    compiledMembers: [],
    barrierAudit: null,
    visualLocks: opts.visualLocks || [],
    gameplayLocks: opts.gameplayLocks || [],
    materialRoleBindings: ARCHITECTURE_FORM_MATERIAL_ROLES.slice()
  };
}

function architectureAddMember(plan, spec){
  var member = {
    id: String(spec.id),
    ownerId: String(spec.ownerId || spec.id),
    shape: spec.shape || "box",
    role: spec.role || "masonry-wall",
    center: {
      x: architectureRound(spec.center.x),
      y: architectureRound(spec.center.y),
      z: architectureRound(spec.center.z)
    },
    size: {
      x: architectureRound(spec.size.x),
      y: architectureRound(spec.size.y),
      z: architectureRound(spec.size.z)
    },
    rotation: {
      x: architectureRound(spec.rotation && spec.rotation.x || 0),
      y: architectureRound(spec.rotation && spec.rotation.y || 0),
      z: architectureRound(spec.rotation && spec.rotation.z || 0)
    },
    supportedBy: (spec.supportedBy && spec.supportedBy.length
      ? spec.supportedBy : ["ground"]).slice(),
    cutawayGroup: spec.cutawayGroup || null,
    access: spec.access || null,
    cover: spec.cover || null,
    condition: spec.condition || "intact"
  };
  if(spec.presentationOnly != null) member.presentationOnly = !!spec.presentationOnly;
  if(spec.mechanicalEffect != null) member.mechanicalEffect = String(spec.mechanicalEffect);
  if(spec.cultureRef != null) member.cultureRef = String(spec.cultureRef);
  if(spec.variantRef != null) member.variantRef = String(spec.variantRef);
  if(spec.worldTruthRef != null) member.worldTruthRef = String(spec.worldTruthRef);
  if(spec.signifierRef != null) member.signifierRef = String(spec.signifierRef);
  if(spec.placeholderState != null) member.placeholderState = String(spec.placeholderState);
  if(spec.vertices){
    member.vertices = spec.vertices.map(function(vertex){
      return {
        x: architectureRound(vertex.x),
        y: architectureRound(vertex.y),
        z: architectureRound(vertex.z)
      };
    });
  }
  if(spec.triangles){
    member.triangles = spec.triangles.map(function(triangle){ return triangle.slice(); });
  }
  plan.compiledMembers.push(member);
  return member;
}

function architectureAddBox(plan, id, center, size, role, supportedBy, extra){
  return architectureAddMember(plan, Object.assign({
    id: id, center: center, size: size, role: role, supportedBy: supportedBy
  }, extra || {}));
}

/* Exact engine-authored low-poly surface. The renderer receives explicit vertices/triangles and
   performs only generic projection. This is used where boxes cannot express an honest silhouette
   (first: hip-roof trapezoids/triangles), without granting the renderer a building-type branch. */
function architectureAddPolyhedron(plan, id, vertices, triangles, role, supportedBy, extra){
  var min = { x: Infinity, y: Infinity, z: Infinity };
  var max = { x: -Infinity, y: -Infinity, z: -Infinity };
  vertices.forEach(function(vertex){
    min.x = Math.min(min.x, vertex.x); min.y = Math.min(min.y, vertex.y);
    min.z = Math.min(min.z, vertex.z); max.x = Math.max(max.x, vertex.x);
    max.y = Math.max(max.y, vertex.y); max.z = Math.max(max.z, vertex.z);
  });
  return architectureAddMember(plan, Object.assign({
    id: id,
    shape: "polyhedron",
    center: {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2
    },
    size: {
      x: Math.max(0.001, max.x - min.x),
      y: Math.max(0.001, max.y - min.y),
      z: Math.max(0.001, max.z - min.z)
    },
    rotation: { x: 0, y: 0, z: 0 },
    vertices: vertices,
    triangles: triangles,
    role: role,
    supportedBy: supportedBy
  }, extra || {}));
}

function architectureAddRegularPrism(plan, id, center, radius, baseY, height, sides, role,
  supportedBy, extra){
  var vertices = [];
  for(var layer = 0; layer < 2; layer++){
    for(var i = 0; i < sides; i++){
      var angle = -Math.PI / 2 + i * Math.PI * 2 / sides;
      vertices.push({
        x: center.x + Math.cos(angle) * radius,
        y: baseY + layer * height,
        z: center.z + Math.sin(angle) * radius
      });
    }
  }
  var triangles = [];
  for(var face = 1; face < sides - 1; face++){
    triangles.push([0, face + 1, face]);
    triangles.push([sides, sides + face, sides + face + 1]);
  }
  for(var edge = 0; edge < sides; edge++){
    var next = (edge + 1) % sides;
    triangles.push([edge, next, next + sides], [edge, next + sides, edge + sides]);
  }
  return architectureAddPolyhedron(plan, id, vertices, triangles, role, supportedBy, extra);
}

/* A wall partial is a real solid, not a decorative triangle painted behind the roof. Profiles are
   authored in one horizontal axis plus Y, then extruded through the owning wall thickness. This
   generic primitive closes gables and shed-roof wedges without giving the renderer a roof or
   building special case. */
function architectureAddExtrudedProfile(plan, id, profile, axis, at, thickness, role,
  supportedBy, extra){
  if(axis !== "x" && axis !== "z"){
    throw new Error("architectureAddExtrudedProfile: invalid axis " + axis);
  }
  if(!profile || profile.length < 3){
    throw new Error("architectureAddExtrudedProfile: profile needs three points");
  }
  var half = thickness / 2;
  var vertices = [];
  [-half, half].forEach(function(offset){
    profile.forEach(function(point){
      vertices.push(axis === "x"
        ? { x: point.u, y: point.y, z: at + offset }
        : { x: at + offset, y: point.y, z: point.u });
    });
  });
  var n = profile.length, triangles = [];
  for(var face = 1; face < n - 1; face++){
    triangles.push([0, face + 1, face]);
    triangles.push([n, n + face, n + face + 1]);
  }
  for(var edge = 0; edge < n; edge++){
    var next = (edge + 1) % n;
    triangles.push([edge, next, next + n], [edge, next + n, edge + n]);
  }
  return architectureAddPolyhedron(plan, id, vertices, triangles, role || "masonry-wall",
    supportedBy, extra);
}

function architectureRoofClosureRecord(plan, roofId, memberId, kind, ownerId){
  plan.roofJunctions.push({
    roofId: roofId,
    memberId: memberId,
    kind: kind,
    ownerId: ownerId || memberId,
    sealed: true
  });
}

function architectureAddGableEndInfill(plan, spec, closure, ridgeY){
  var pitch = spec.pitchDeg * Math.PI / 180;
  var wallWidth = closure.width || spec.width;
  var wallHalf = wallWidth / 2;
  var roofOuterHalf = spec.width / 2 + spec.overhang;
  var roofAtWall = spec.eaveY + Math.max(0, roofOuterHalf - wallHalf) * Math.tan(pitch)
    - spec.thickness * 0.48;
  var baseY = Math.min(closure.wallTopY - 0.04, roofAtWall - 0.04);
  var memberId = closure.id || (spec.id + ":gable-infill:" + closure.side);
  architectureAddExtrudedProfile(plan, memberId, [
    { u: spec.center.x - wallHalf, y: baseY },
    { u: spec.center.x + wallHalf, y: baseY },
    { u: spec.center.x + wallHalf, y: roofAtWall },
    { u: spec.center.x, y: ridgeY - spec.thickness * 0.48 },
    { u: spec.center.x - wallHalf, y: roofAtWall }
  ], "x", closure.at, closure.thickness || 0.34,
  closure.role || "masonry-wall", closure.supportedBy || spec.supportedBy, {
    ownerId: closure.ownerId || memberId,
    cutawayGroup: closure.cutawayGroup || spec.cutawayGroup || null
  });
  architectureRoofClosureRecord(plan, spec.id, memberId, "gable-end-infill",
    closure.ownerId || memberId);
}

function architectureShedFrame(spec){
  var highEdge = spec.highEdge || "west";
  var runAxis = highEdge === "north" || highEdge === "south" ? "z" : "x";
  var spanAxis = runAxis === "x" ? "z" : "x";
  var runLength = runAxis === "x" ? spec.width : spec.depth;
  var spanLength = runAxis === "x" ? spec.depth : spec.width;
  var runCenter = runAxis === "x" ? spec.center.x : spec.center.z;
  var spanCenter = spanAxis === "x" ? spec.center.x : spec.center.z;
  var highSign = highEdge === "west" || highEdge === "north" ? -1 : 1;
  var pitch = spec.pitchDeg * Math.PI / 180;
  var outerHalf = runLength / 2 + spec.overhang;
  function roofYAt(offset){
    var distanceFromLow = highSign < 0 ? outerHalf - offset : offset + outerHalf;
    return spec.eaveY + Math.max(0, distanceFromLow) * Math.tan(pitch)
      - spec.thickness * 0.48;
  }
  return {
    highEdge: highEdge,
    runAxis: runAxis,
    spanAxis: spanAxis,
    runLength: runLength,
    spanLength: spanLength,
    runCenter: runCenter,
    spanCenter: spanCenter,
    highSign: highSign,
    pitch: pitch,
    roofYAt: roofYAt
  };
}

function architectureAddShedEndInfill(plan, spec, closure, frame){
  var runLength = closure.runLength || frame.runLength;
  var halfRun = runLength / 2;
  var lowU = frame.runCenter - halfRun;
  var highU = frame.runCenter + halfRun;
  var lowRoof = frame.roofYAt(-halfRun);
  var highRoof = frame.roofYAt(halfRun);
  var baseY = Math.min(closure.wallTopY - 0.04, lowRoof - 0.04, highRoof - 0.04);
  var memberId = closure.id || (spec.id + ":shed-end-infill:" + closure.side);
  architectureAddExtrudedProfile(plan, memberId, [
    { u: lowU, y: baseY },
    { u: highU, y: baseY },
    { u: highU, y: highRoof },
    { u: lowU, y: lowRoof }
  ], frame.runAxis, closure.at, closure.thickness || 0.32,
  closure.role || "masonry-wall", closure.supportedBy || spec.supportedBy, {
    ownerId: closure.ownerId || memberId,
    cutawayGroup: closure.cutawayGroup || null
  });
  architectureRoofClosureRecord(plan, spec.id, memberId, "shed-end-infill",
    closure.ownerId || memberId);
}

function architectureAddShedEdgeInfill(plan, spec, closure, frame){
  var edge = closure.edge;
  var sign = edge === "west" || edge === "north" ? -1 : 1;
  var offset = sign * frame.runLength / 2;
  var roofY = frame.roofYAt(offset);
  var baseY = Math.min(closure.wallTopY - 0.04, roofY - 0.04);
  var memberId = closure.id || (spec.id + ":shed-edge-infill:" + edge);
  var halfSpan = (closure.spanLength || frame.spanLength) / 2;
  var runCoordinate = frame.runCenter + offset;
  var start, end;
  if(frame.runAxis === "x"){
    start = { x: runCoordinate, z: frame.spanCenter - halfSpan };
    end = { x: runCoordinate, z: frame.spanCenter + halfSpan };
  } else {
    start = { x: frame.spanCenter - halfSpan, z: runCoordinate };
    end = { x: frame.spanCenter + halfSpan, z: runCoordinate };
  }
  architectureAddRunPrism(plan, memberId, start, end, baseY, roofY - baseY,
    closure.thickness || 0.32, closure.role || "masonry-wall",
    closure.supportedBy || spec.supportedBy, {
      ownerId: closure.ownerId || memberId,
      cutawayGroup: closure.cutawayGroup || null
    });
  architectureRoofClosureRecord(plan, spec.id, memberId, "shed-edge-infill",
    closure.ownerId || memberId);
}

function architectureRunFrame(start, end){
  var delta = { x: end.x - start.x, z: end.z - start.z };
  var length = architectureLen(delta), axis = architectureUnit(delta);
  return {
    length: length, axis: axis,
    yaw: -Math.atan2(axis.z, axis.x),
    midpoint: { x: (start.x + end.x) / 2, z: (start.z + end.z) / 2 }
  };
}

function architectureAddRunPrism(plan, id, start, end, baseY, height, thickness, role,
  supportedBy, extra){
  var frame = architectureRunFrame(start, end);
  return architectureAddMember(plan, Object.assign({
    id: id,
    center: { x: frame.midpoint.x, y: baseY + height / 2, z: frame.midpoint.z },
    size: { x: frame.length, y: height, z: thickness },
    rotation: { x: 0, y: frame.yaw, z: 0 },
    role: role, supportedBy: supportedBy
  }, extra || {}));
}

/* A wall bearing on responsive terrain cannot terminate at one nominal flat datum and hope every
   adjacent slope happens to meet it. This reusable footing preserves the authored wall top while
   extending a materially distinct support below the nominal bearing plane. Any portion exposed by
   a local terrain fall reads as foundation instead of a black air wedge. */
function architectureAddTerrainEmbeddedRunFooting(plan, spec){
  var embedDepth = Math.max(0.04, Number(spec.embedDepth) || 0);
  var overlap = Math.max(0.004, Number(spec.overlap) || 0.02);
  var member = architectureAddRunPrism(plan, spec.id, spec.start, spec.end,
    spec.bearingY - embedDepth, embedDepth + overlap, spec.thickness,
    spec.role || "foundation-gravel", spec.supportedBy || ["ground"], {
      ownerId: spec.ownerId || spec.id,
      condition: "terrain-embedded-bearing-footing",
      mechanicalEffect: "none"
    });
  return {
    schema: "TerrainEmbeddedRunFootingV1",
    memberId: member.id,
    bearingY: spec.bearingY,
    embedDepth: embedDepth,
    overlap: overlap,
    topY: spec.bearingY + overlap,
    supportRule: "footing-extends-below-responsive-terrain-and-overlaps-supported-wall",
    materialRole: member.role
  };
}

/* Perpendicular run prisms meeting at a shared centreline point do not fill the outer quadrant of
   the joint. This helper owns that missing solid explicitly. It is deliberately separate from the
   visible expression layer: culture may sheath/reshape/ornament the junction, but the underlying
   envelope must remain closed. */
function architectureCloseRectRunCorners(plan, spec){
  var included = spec.includedSides || ["north", "south", "west", "east"];
  var present = {};
  included.forEach(function(side){ present[side] = true; });
  var thickness = spec.sideThickness || {};
  function t(side){ return thickness[side] || spec.thickness; }
  var corners = [
    { name: "north-west", x: spec.center.x - spec.width / 2,
      z: spec.center.z - spec.depth / 2, sides: ["north", "west"] },
    { name: "north-east", x: spec.center.x + spec.width / 2,
      z: spec.center.z - spec.depth / 2, sides: ["north", "east"] },
    { name: "south-east", x: spec.center.x + spec.width / 2,
      z: spec.center.z + spec.depth / 2, sides: ["south", "east"] },
    { name: "south-west", x: spec.center.x - spec.width / 2,
      z: spec.center.z + spec.depth / 2, sides: ["south", "west"] }
  ];
  var memberIds = [];
  corners.forEach(function(corner){
    if(!present[corner.sides[0]] || !present[corner.sides[1]]) return;
    var verticalSide = corner.sides[1];
    var horizontalSide = corner.sides[0];
    var member = architectureAddBox(plan, spec.id + ":corner:" + corner.name, {
      x: corner.x, y: spec.baseY + spec.height / 2, z: corner.z
    }, {
      x: t(verticalSide), y: spec.height, z: t(horizontalSide)
    }, spec.role, spec.supportedBy, Object.assign({}, spec.extra || {}, {
      ownerId: spec.ownerId || spec.id,
      condition: "closed-orthogonal-run-junction",
      junctionExpressionSocket: spec.id + ":junction:" + corner.name,
      junctionExpressionPosture: spec.expressionPosture || "neutral-closed"
    }));
    memberIds.push(member.id);
  });
  var receipt = {
    id: spec.id,
    strategy: "explicit-outer-quadrant-solids",
    memberIds: memberIds,
    includedSides: included.slice(),
    intentionalOpenSides: ["north", "south", "west", "east"]
      .filter(function(side){ return !present[side]; }),
    closureRule: "every-present-perpendicular-run-pair-shares-one-solid-outer-corner",
    topologyInvariant: "closure-survives-cultural-junction-expression"
  };
  plan.orthogonalRunClosures.push(receipt);
  return receipt;
}

/* One manifold rectangular band. Use this where a visible continuous course would otherwise be
   assembled from overlapping run prisms: overlaps are structurally solid but their internal faces
   create false black AO seams that read as open corners. */
function architectureAddRectRing(plan, spec){
  var outer = spec.outerBounds || {
    minX: spec.center.x - spec.outerWidth / 2,
    maxX: spec.center.x + spec.outerWidth / 2,
    minZ: spec.center.z - spec.outerDepth / 2,
    maxZ: spec.center.z + spec.outerDepth / 2
  };
  var inner = spec.innerBounds || {
    minX: outer.minX + spec.bandThickness,
    maxX: outer.maxX - spec.bandThickness,
    minZ: outer.minZ + spec.bandThickness,
    maxZ: outer.maxZ - spec.bandThickness
  };
  if(inner.maxX <= inner.minX || inner.maxZ <= inner.minZ){
    throw new Error("architectureAddRectRing: band consumes " + spec.id);
  }
  var topY = spec.baseY + spec.height;
  function corners(bounds, y){
    return [
      { x: bounds.minX, y: y, z: bounds.minZ },
      { x: bounds.maxX, y: y, z: bounds.minZ },
      { x: bounds.maxX, y: y, z: bounds.maxZ },
      { x: bounds.minX, y: y, z: bounds.maxZ }
    ];
  }
  var vertices = corners(outer, topY)
    .concat(corners(inner, topY))
    .concat(corners(outer, spec.baseY))
    .concat(corners(inner, spec.baseY));
  var triangles = [];
  for(var i = 0; i < 4; i++){
    var next = (i + 1) % 4;
    triangles.push([i, next, 4 + next], [i, 4 + next, 4 + i]);
    triangles.push([8 + i, 12 + next, 8 + next], [8 + i, 12 + i, 12 + next]);
    triangles.push([i, 8 + next, next], [i, 8 + i, 8 + next]);
    triangles.push([4 + i, 4 + next, 12 + next], [4 + i, 12 + next, 12 + i]);
  }
  return architectureAddPolyhedron(plan, spec.id, vertices, triangles, spec.role,
    spec.supportedBy, {
      ownerId: spec.ownerId || spec.id,
      condition: spec.condition || "continuous-manifold-ring",
      presentationOnly: spec.presentationOnly,
      mechanicalEffect: spec.mechanicalEffect,
      cultureRef: spec.cultureRef,
      variantRef: spec.variantRef
    });
}

/* A connective member between two real 3D bearings. This is the architecture equivalent of the
   terrain continuity rule: braces, rakes, corbels, and stair cheeks meet the things they support
   instead of appearing as decorative diagonal marks on unrelated boxes. */
function architectureAddBeam3D(plan, id, start, end, thickness, role, supportedBy, extra){
  var dx = end.x - start.x, dy = end.y - start.y, dz = end.z - start.z;
  var horizontal = Math.sqrt(dx * dx + dz * dz);
  var length = Math.sqrt(horizontal * horizontal + dy * dy);
  if(length <= 0.000001) throw new Error("architectureAddBeam3D: zero member " + id);
  return architectureAddMember(plan, Object.assign({
    id: id,
    center: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2, z: (start.z + end.z) / 2 },
    size: { x: length, y: thickness, z: thickness },
    rotation: {
      x: 0,
      y: -Math.atan2(dz, dx),
      z: Math.atan2(dy, Math.max(horizontal, 0.000001))
    },
    role: role || "timber-structure",
    supportedBy: supportedBy || ["ground"]
  }, extra || {}));
}

/* Continuous wall authority. The ENGINE splits true voids into solids. The renderer sees only the
   resulting prisms and therefore cannot paint an opening onto a solid wall or invent a lintel. */
function architectureAddWallRun(plan, spec){
  var frame = architectureRunFrame(spec.start, spec.end);
  var openings = (spec.openings || []).slice().sort(function(a, b){ return a.station - b.station; });
  var run = {
    id: spec.id, start: spec.start, end: spec.end, baseY: spec.baseY || 0,
    height: spec.height, thickness: spec.thickness, role: spec.role || "masonry-wall",
    supportedBy: (spec.supportedBy || ["ground"]).slice(),
    openings: openings,
    endpointTreatments: spec.endpointTreatments || ["resolved", "resolved"],
    cutawayGroup: spec.cutawayGroup || null
  };
  plan.wallRuns.push(run);
  var cursor = 0, segment = 0;
  function pointAt(station){
    return {
      x: spec.start.x + frame.axis.x * station,
      z: spec.start.z + frame.axis.z * station
    };
  }
  function solid(a, b, bottom, top, suffix, role){
    if(b - a <= 0.005 || top - bottom <= 0.005) return;
    architectureAddRunPrism(plan, spec.id + ":" + suffix + ":" + (segment++),
      pointAt(a), pointAt(b), (spec.baseY || 0) + bottom, top - bottom, spec.thickness,
      role || run.role, run.supportedBy, {
        ownerId: spec.id, cutawayGroup: run.cutawayGroup,
        condition: spec.condition || "intact"
      });
  }
  openings.forEach(function(opening){
    var left = opening.station - opening.width / 2;
    var right = opening.station + opening.width / 2;
    if(left > cursor) solid(cursor, left, 0, spec.height, "bay", run.role);
    if(opening.bottom > 0) solid(left, right, 0, opening.bottom, "sill", "masonry-edge");
    var top = opening.bottom + opening.height;
    if(top < spec.height) solid(left, right, top, spec.height, "head", "masonry-edge");
    var jamb = Math.min(0.16, Math.max(0.08, spec.thickness * 0.5));
    solid(left, Math.min(right, left + jamb), opening.bottom, top, "jamb-left", "masonry-edge");
    solid(Math.max(left, right - jamb), right, opening.bottom, top, "jamb-right", "masonry-edge");
    plan.openings.push({
      id: opening.id, wallRunId: spec.id, station: opening.station, width: opening.width,
      bottom: opening.bottom, height: opening.height, depth: spec.thickness,
      kind: opening.kind || "opening", access: opening.access || "none",
      observation: !!opening.observation
    });
    cursor = right;
  });
  if(cursor < frame.length) solid(cursor, frame.length, 0, spec.height, "bay", run.role);
  return run;
}

function architectureAddSlab(plan, id, center, size, topY, thickness, role, supportedBy, access){
  plan.levels.push({ id: id, topY: topY, footprint: {
    x: center.x, z: center.z, w: size.x, d: size.z
  }, access: access || "walk" });
  return architectureAddBox(plan, id, { x: center.x, y: topY - thickness / 2, z: center.z },
    { x: size.x, y: thickness, z: size.z }, role || "foundation", supportedBy || ["ground"],
    { access: access || "walk" });
}

function architectureAddPosts(plan, id, points, baseY, height, width, role, supportedBy){
  points.forEach(function(p, index){
    architectureAddBox(plan, id + ":" + index,
      { x: p.x, y: baseY + height / 2, z: p.z },
      { x: width, y: height, z: width }, role || "timber-structure", supportedBy || ["ground"],
      { ownerId: id });
  });
}

function architectureAddFootprintPrism(plan, spec){
  if(!spec.footprint || spec.footprint.length !== 4){
    throw new Error("architectureAddFootprintPrism: four-point footprint required for " + spec.id);
  }
  var topY = spec.baseY + spec.height;
  var vertices = spec.footprint.map(function(point){
    return { x: point.x, y: topY, z: point.z };
  }).concat(spec.footprint.map(function(point){
    return { x: point.x, y: spec.baseY, z: point.z };
  }));
  var triangles = [[0, 1, 2], [0, 2, 3], [6, 5, 4], [7, 6, 4]];
  for(var i = 0; i < 4; i++){
    var next = (i + 1) % 4;
    triangles.push([i, next, next + 4], [i, next + 4, i + 4]);
  }
  return architectureAddPolyhedron(plan, spec.id, vertices, triangles, spec.role,
    spec.supportedBy, {
      ownerId: spec.ownerId || spec.id,
      cover: spec.cover || null,
      condition: spec.condition || "mitered-run-module",
      presentationOnly: spec.presentationOnly,
      mechanicalEffect: spec.mechanicalEffect,
      cultureRef: spec.cultureRef,
      variantRef: spec.variantRef
    });
}

/* Four independent modules with exact shared diagonal faces. This is the production-friendly
   counterpart to a monolithic ring: WFC may choose each compatible junction profile, while the
   geometry has neither an empty outer quadrant nor overlapping internal faces. */
function architectureAddMiteredRectLoop(plan, spec){
  var outer = spec.outerBounds;
  var inner = spec.innerBounds;
  var points = {
    onw: { x: outer.minX, z: outer.minZ },
    one: { x: outer.maxX, z: outer.minZ },
    ose: { x: outer.maxX, z: outer.maxZ },
    osw: { x: outer.minX, z: outer.maxZ },
    inw: { x: inner.minX, z: inner.minZ },
    ine: { x: inner.maxX, z: inner.minZ },
    ise: { x: inner.maxX, z: inner.maxZ },
    isw: { x: inner.minX, z: inner.maxZ }
  };
  var modules = [
    ["north", [points.onw, points.one, points.ine, points.inw]],
    ["east", [points.one, points.ose, points.ise, points.ine]],
    ["south", [points.ose, points.osw, points.isw, points.ise]],
    ["west", [points.osw, points.onw, points.inw, points.isw]]
  ];
  var memberIds = [], memberIdBySide = {};
  modules.forEach(function(row){
    var member = architectureAddFootprintPrism(plan, {
      id: spec.id + ":mitered-run:" + row[0],
      footprint: row[1],
      baseY: spec.baseY,
      height: spec.height,
      role: spec.role,
      supportedBy: spec.supportedBy,
      ownerId: spec.ownerId,
      cover: spec.cover,
      condition: "wfc-mitered-run",
      presentationOnly: spec.presentationOnly,
      mechanicalEffect: spec.mechanicalEffect,
      cultureRef: spec.cultureRef,
      variantRef: spec.variantRef
    });
    memberIds.push(member.id);
    memberIdBySide[row[0]] = member.id;
  });
  return {
    id: spec.id,
    strategy: "wfc-compatible-mitered-run-loop",
    memberIds: memberIds,
    memberIdBySide: memberIdBySide,
    junctionSockets: [
      { corner: "north-west", a: "north", b: "west" },
      { corner: "north-east", a: "north", b: "east" },
      { corner: "south-east", a: "south", b: "east" },
      { corner: "south-west", a: "south", b: "west" }
    ].map(function(socket){
      socket.memberAId = memberIdBySide[socket.a];
      socket.memberBId = memberIdBySide[socket.b];
      socket.profile = "exact-shared-miter-plane";
      socket.sectionConstraint = "equal-height-with-shared-inner-and-outer-corner";
      return socket;
    }),
    terminalCaps: [],
    closureRule: "straight-runs-end-on-shared-miter-planes-without-gap-or-overlap",
    topologyInvariant: "closure-survives-cultural-junction-expression"
  };
}

function architectureAddMiteredOpenRectBand(plan, spec){
  var openSide = spec.openSide;
  var turns = openSide === "south" ? 0 : (openSide === "east" ? 1
    : (openSide === "north" ? 2 : 3));
  var templateW = turns % 2 ? spec.depth : spec.width;
  var templateD = turns % 2 ? spec.width : spec.depth;
  var hw = templateW / 2, hd = templateD / 2, t = spec.thickness;
  var p = {
    onw: { x: -hw, z: -hd }, one: { x: hw, z: -hd },
    ose: { x: hw, z: hd }, osw: { x: -hw, z: hd },
    inw: { x: -hw + t, z: -hd + t }, ine: { x: hw - t, z: -hd + t },
    eastCap: { x: hw - t, z: hd }, westCap: { x: -hw + t, z: hd }
  };
  function rotate(point){
    var x = point.x, z = point.z;
    for(var turn = 0; turn < turns; turn++){
      var nextX = z; z = -x; x = nextX;
    }
    return { x: spec.center.x + x, z: spec.center.z + z };
  }
  var rows = [
    ["north", [p.onw, p.one, p.ine, p.inw]],
    ["east", [p.one, p.ose, p.eastCap, p.ine]],
    ["west", [p.osw, p.onw, p.inw, p.westCap]]
  ];
  var sideRotation = ["north", "east", "south", "west"];
  function rotatedSide(side){
    return sideRotation[(sideRotation.indexOf(side) - turns + 4) % 4];
  }
  var memberIds = [], memberIdBySide = {};
  rows.forEach(function(row){
    var side = rotatedSide(row[0]);
    var member = architectureAddFootprintPrism(plan, {
      id: spec.id + ":mitered-run:" + side,
      footprint: row[1].map(rotate),
      baseY: spec.baseY,
      height: spec.height,
      role: spec.role,
      supportedBy: spec.supportedBy,
      ownerId: spec.ownerId,
      cover: spec.cover,
      condition: "wfc-mitered-run-with-terminal-cap",
      presentationOnly: spec.presentationOnly,
      mechanicalEffect: spec.mechanicalEffect,
      cultureRef: spec.cultureRef,
      variantRef: spec.variantRef
    });
    memberIds.push(member.id);
    memberIdBySide[side] = member.id;
  });
  var presentSides = Object.keys(memberIdBySide);
  var cornerClockwise = {
    "north-west": "south-west",
    "south-west": "south-east",
    "south-east": "north-east",
    "north-east": "north-west"
  };
  function rotatedCorner(corner){
    for(var turn = 0; turn < turns; turn++) corner = cornerClockwise[corner];
    return corner;
  }
  return {
    id: spec.id,
    strategy: "wfc-compatible-mitered-open-band",
    memberIds: memberIds,
    memberIdBySide: memberIdBySide,
    junctionSockets: [
      {
        corner: rotatedCorner("north-west"),
        a: rotatedSide("north"), b: rotatedSide("west")
      },
      {
        corner: rotatedCorner("north-east"),
        a: rotatedSide("north"), b: rotatedSide("east")
      }
    ].map(function(socket){
      socket.memberAId = memberIdBySide[socket.a];
      socket.memberBId = memberIdBySide[socket.b];
      socket.profile = "exact-shared-miter-plane";
      socket.sectionConstraint = "equal-height-with-shared-inner-and-outer-corner";
      return socket;
    }),
    terminalCaps: [
      { side: rotatedSide("west"), adjacentOpenSide: openSide, polygonVertices: 4 },
      { side: rotatedSide("east"), adjacentOpenSide: openSide, polygonVertices: 4 }
    ],
    includedSides: presentSides,
    intentionalOpenSides: [openSide],
    closureRule: "two-mitered-corners-plus-two-four-vertex-terminal-caps",
    topologyInvariant: "closure-survives-cultural-junction-expression"
  };
}

/* One U-shaped manifold band with a named access side. It replaces three overlapping parapet
   boxes and their corner patches, so the two real right-angle returns have no internal faces while
   the two free ends remain intentionally capped. */
function architectureAddOpenRectBand(plan, spec){
  var openSide = spec.openSide;
  if(["north", "south", "west", "east"].indexOf(openSide) < 0){
    throw new Error("architectureAddOpenRectBand: invalid open side " + openSide);
  }
  var turns = openSide === "south" ? 0 : (openSide === "east" ? 1
    : (openSide === "north" ? 2 : 3));
  var templateW = turns % 2 ? spec.depth : spec.width;
  var templateD = turns % 2 ? spec.width : spec.depth;
  var minX = -templateW / 2, maxX = templateW / 2;
  var minZ = -templateD / 2, maxZ = templateD / 2;
  var innerMinX = minX + spec.thickness, innerMaxX = maxX - spec.thickness;
  var innerMinZ = minZ + spec.thickness;
  var points = [
    { x: minX, z: minZ }, { x: maxX, z: minZ },
    { x: maxX, z: maxZ }, { x: innerMaxX, z: maxZ },
    { x: innerMaxX, z: innerMinZ }, { x: innerMinX, z: innerMinZ },
    { x: innerMinX, z: maxZ }, { x: minX, z: maxZ }
  ];
  function rotate(point){
    var x = point.x, z = point.z;
    for(var turn = 0; turn < turns; turn++){
      var nextX = z;
      z = -x;
      x = nextX;
    }
    return { x: spec.center.x + x, z: spec.center.z + z };
  }
  points = points.map(rotate);
  var topY = spec.baseY + spec.height;
  var vertices = points.map(function(point){ return { x: point.x, y: topY, z: point.z }; })
    .concat(points.map(function(point){
      return { x: point.x, y: spec.baseY, z: point.z };
    }));
  var topTriangles = [
    [0, 1, 4], [0, 4, 5],
    [1, 2, 3], [1, 3, 4],
    [0, 5, 6], [0, 6, 7]
  ];
  var triangles = topTriangles.slice();
  topTriangles.forEach(function(triangle){
    triangles.push([triangle[2] + 8, triangle[1] + 8, triangle[0] + 8]);
  });
  for(var i = 0; i < 8; i++){
    var next = (i + 1) % 8;
    triangles.push([i, next, next + 8], [i, next + 8, i + 8]);
  }
  return architectureAddPolyhedron(plan, spec.id, vertices, triangles, spec.role,
    spec.supportedBy, {
      ownerId: spec.ownerId || spec.id,
      cover: spec.cover || "half-cover",
      condition: "continuous-manifold-open-band"
    });
}

function architectureAddStair(plan, spec){
  var axis = architectureUnit({ x: spec.end.x - spec.start.x, z: spec.end.z - spec.start.z });
  var totalRun = architectureLen({ x: spec.end.x - spec.start.x, z: spec.end.z - spec.start.z });
  var tread = totalRun / spec.steps, rise = (spec.topY - spec.baseY) / spec.steps;
  var side = { x: -axis.z, z: axis.x };
  var foundationBaseY = spec.foundationBaseY == null ? spec.baseY : spec.foundationBaseY;
  var supportMode = spec.supportMode || (foundationBaseY < spec.baseY - 0.001
    ? "grounded-solid" : "bearing-on-lower-structure");
  plan.stairs.push({
    id: spec.id, start: spec.start, end: spec.end, baseY: spec.baseY, topY: spec.topY,
    width: spec.width, steps: spec.steps, lowerLandingId: spec.lowerLandingId || "ground",
    upperLandingId: spec.upperLandingId, access: "walk",
    supportedBy: (spec.supportedBy || ["ground"]).slice(),
    clearanceHeight: spec.clearanceHeight || 1.95,
    foundationBaseY: foundationBaseY,
    supportMode: supportMode
  });
  for(var i = 0; i < spec.steps; i++){
    var runStart = i * tread;
    var remaining = totalRun - runStart;
    var cx = spec.start.x + axis.x * (runStart + remaining / 2);
    var cz = spec.start.z + axis.z * (runStart + remaining / 2);
    var treadTopY = spec.baseY + rise * (i + 1);
    var h = treadTopY - foundationBaseY;
    architectureAddMember(plan, {
      id: spec.id + ":step:" + i, ownerId: spec.id, role: spec.role || "masonry-edge",
      center: { x: cx, y: foundationBaseY + h / 2, z: cz },
      size: { x: remaining, y: h, z: spec.width },
      rotation: { x: 0, y: -Math.atan2(axis.z, axis.x), z: 0 },
      supportedBy: spec.supportedBy || ["ground"], access: "walk"
    });
  }
  if(spec.cheeks){
    [-1, 1].forEach(function(sign){
      architectureAddBeam3D(plan, spec.id + ":cheek:" + sign,
        { x: spec.start.x + side.x * sign * (spec.width / 2 + 0.09),
          y: spec.baseY + 0.16, z: spec.start.z + side.z * sign * (spec.width / 2 + 0.09) },
        { x: spec.end.x + side.x * sign * (spec.width / 2 + 0.09),
          y: spec.topY + 0.16, z: spec.end.z + side.z * sign * (spec.width / 2 + 0.09) },
        0.18, spec.role || "masonry-edge", spec.supportedBy || ["ground"],
        { ownerId: spec.id });
    });
  }
}

function architecturePointSegmentProjection(point, start, end){
  var delta = { x: end.x - start.x, z: end.z - start.z };
  var lengthSquared = delta.x * delta.x + delta.z * delta.z;
  var t = lengthSquared <= 0.000001 ? 0 : Math.max(0, Math.min(1,
    ((point.x - start.x) * delta.x + (point.z - start.z) * delta.z) / lengthSquared));
  var projected = { x: start.x + delta.x * t, z: start.z + delta.z * t };
  return {
    t: t,
    station: Math.sqrt(lengthSquared) * t,
    distance: architectureLen({ x: point.x - projected.x, z: point.z - projected.z })
  };
}

function architectureStairWallOpeningClears(run, projection, walkY, halfWidth, headroom){
  return run.openings.some(function(opening){
    var horizontalClear = projection.station - halfWidth >= opening.station - opening.width / 2 - 0.02
      && projection.station + halfWidth <= opening.station + opening.width / 2 + 0.02;
    var relativeWalkY = walkY - run.baseY;
    var verticalClear = relativeWalkY >= opening.bottom - 0.02
      && relativeWalkY + headroom <= opening.bottom + opening.height + 0.02;
    return horizontalClear && verticalClear;
  });
}

function architectureStairPointInsideMemberSweep(point, walkY, halfWidth, headroom, member){
  var bottom = member.center.y - member.size.y / 2;
  var top = member.center.y + member.size.y / 2;
  if(top <= walkY + 0.12 || bottom >= walkY + headroom - 0.02) return false;
  var yaw = member.rotation && member.rotation.y || 0;
  var dx = point.x - member.center.x, dz = point.z - member.center.z;
  var cos = Math.cos(yaw), sin = Math.sin(yaw);
  var localX = dx * cos - dz * sin;
  var localZ = dx * sin + dz * cos;
  return Math.abs(localX) < member.size.x / 2 + halfWidth - 0.05
    && Math.abs(localZ) < member.size.z / 2 + halfWidth - 0.05;
}

/* A modular stair is accepted only if its whole circulation prism is empty. Contact with its
   declared supports and landings is legal; tunnelling through an unrelated wall, pier, tower, or
   another module is not. Wall crossings additionally need a real opening that clears both the
   walking width and the required headroom. This audit is intentionally engine-side: a renderer
   cannot repair a bad assembly by hiding the intersection. */
function architectureStairClearanceAudit(plan){
  var conflicts = [];
  var wallOwnerIds = {};
  plan.wallRuns.forEach(function(run){ wallOwnerIds[run.id] = true; });
  var directSeamNeighbors = {};
  plan.stairs.forEach(function(lower){
    plan.stairs.forEach(function(upper){
      if(lower.id === upper.id || !lower.upperLandingId
        || lower.upperLandingId !== upper.lowerLandingId) return;
      var positionGap = architectureLen({
        x: lower.end.x - upper.start.x,
        z: lower.end.z - upper.start.z
      });
      if(positionGap > 0.001 || Math.abs(lower.topY - upper.baseY) > 0.001
        || Math.abs(lower.width - upper.width) > 0.001) return;
      directSeamNeighbors[lower.id] = directSeamNeighbors[lower.id] || {};
      directSeamNeighbors[upper.id] = directSeamNeighbors[upper.id] || {};
      directSeamNeighbors[lower.id][upper.id] = "end";
      directSeamNeighbors[upper.id][lower.id] = "start";
    });
  });
  var collisionRoles = {
    "masonry-wall": true, "masonry-edge": true, "timber-structure": true,
    "ornamental-stone": true, "repair": true, "cutaway-cap": true
  };
  var seen = {};
  function conflict(stair, kind, obstacleId, sample){
    var key = stair.id + ":" + kind + ":" + obstacleId;
    if(seen[key]) return;
    seen[key] = true;
    conflicts.push({
      stairId: stair.id, kind: kind, obstacleId: obstacleId,
      sample: architectureRound(sample)
    });
  }
  plan.stairs.forEach(function(stair){
    var supports = {};
    (stair.supportedBy || []).concat([
      stair.lowerLandingId, stair.upperLandingId
    ]).filter(Boolean).forEach(function(id){ supports[id] = true; });
    var halfWidth = stair.width / 2;
    var headroom = stair.clearanceHeight || 1.95;
    var stairAxis = architectureUnit({
      x: stair.end.x - stair.start.x,
      z: stair.end.z - stair.start.z
    });
    var stairSide = { x: -stairAxis.z, z: stairAxis.x };
    for(var sampleIndex = 1; sampleIndex <= 24; sampleIndex++){
      var t = 0.06 + sampleIndex * (0.86 / 25);
      var point = {
        x: stair.start.x + (stair.end.x - stair.start.x) * t,
        z: stair.start.z + (stair.end.z - stair.start.z) * t
      };
      var walkY = stair.baseY + (stair.topY - stair.baseY) * t;
      plan.wallRuns.forEach(function(run){
        if(supports[run.id]) return;
        var runAxis = architectureUnit({
          x: run.end.x - run.start.x,
          z: run.end.z - run.start.z
        });
        var runNormal = { x: -runAxis.z, z: runAxis.x };
        /* Project the oriented stair width onto the wall axes. Treating halfWidth as a radius
           falsely reports an orthogonal stair well before it reaches its named wall opening. */
        var normalExtent = Math.abs(stairSide.x * runNormal.x
          + stairSide.z * runNormal.z) * halfWidth + 0.06;
        var stationExtent = Math.abs(stairSide.x * runAxis.x
          + stairSide.z * runAxis.z) * halfWidth + 0.06;
        var projection = architecturePointSegmentProjection(point, run.start, run.end);
        if(projection.distance >= normalExtent + run.thickness / 2 - 0.04) return;
        var runBottom = run.baseY, runTop = run.baseY + run.height;
        if(runTop <= walkY + 0.12 || runBottom >= walkY + headroom - 0.02) return;
        if(!architectureStairWallOpeningClears(
          run, projection, walkY, stationExtent, headroom)){
          conflict(stair, "wall-run", run.id, t);
        }
      });
      plan.compiledMembers.forEach(function(member){
        if(member.ownerId === stair.id || member.id.indexOf(stair.id + ":") === 0) return;
        if(wallOwnerIds[member.ownerId] || wallOwnerIds[member.id]) return;
        if(supports[member.id] || supports[member.ownerId]) return;
        if(!collisionRoles[member.role]) return;
        var seamSide = directSeamNeighbors[stair.id]
          && directSeamNeighbors[stair.id][member.ownerId];
        if((seamSide === "end" && t >= 0.78) || (seamSide === "start" && t <= 0.22)) return;
        if(/(?:rail|parapet|coping|fascia)(?::|$|-)/.test(member.id)) return;
        if(architectureStairPointInsideMemberSweep(point, walkY, halfWidth, headroom, member)){
          conflict(stair, "compiled-member", member.id, t);
        }
      });
    }
  });
  return { ok: conflicts.length === 0, conflicts: conflicts };
}

function architectureStairSeamAudit(plan){
  var seamIds = {};
  plan.stairs.forEach(function(stair){
    [stair.lowerLandingId, stair.upperLandingId].forEach(function(id){
      if(id && /stair-seam$/.test(id)) seamIds[id] = true;
    });
  });
  var failures = [], rows = [];
  Object.keys(seamIds).forEach(function(seamId){
    var lower = plan.stairs.filter(function(stair){
      return stair.upperLandingId === seamId;
    });
    var upper = plan.stairs.filter(function(stair){
      return stair.lowerLandingId === seamId;
    });
    if(lower.length !== 1 || upper.length !== 1){
      failures.push("stair-seam-cardinality:" + seamId);
      return;
    }
    var a = lower[0], b = upper[0];
    var positionGap = architectureLen({
      x: a.end.x - b.start.x, z: a.end.z - b.start.z
    });
    var riseGap = Math.abs(a.topY - b.baseY);
    var widthGap = Math.abs(a.width - b.width);
    var row = {
      id: seamId, lowerStairId: a.id, upperStairId: b.id,
      positionGap: architectureRound(positionGap),
      riseGap: architectureRound(riseGap),
      widthGap: architectureRound(widthGap),
      seamless: positionGap <= 0.001 && riseGap <= 0.001 && widthGap <= 0.001
    };
    rows.push(row);
    if(!row.seamless) failures.push("stair-seam-disconnected:" + seamId);
  });
  return { ok: failures.length === 0, failures: failures, rows: rows };
}

function architectureAddGableRoof(plan, spec){
  var pitch = spec.pitchDeg * Math.PI / 180;
  var halfRun = spec.width / 2 + spec.overhang;
  var slopeLength = halfRun / Math.cos(pitch);
  var rise = halfRun * Math.tan(pitch);
  var depth = spec.depth + spec.overhang * 2;
  plan.roofs.push({
    id: spec.id, family: "gable", pitchDeg: spec.pitchDeg, ridgeAxis: "z",
    eaveY: spec.eaveY, ridgeY: spec.eaveY + rise, drainage: ["west", "east"],
    cutawaySide: spec.cutawaySide || null,
    enclosure: spec.enclosure || "open-frame",
    closureExpected: (spec.endInfills || []).length
  });
  if(spec.cutawaySide !== "west"){
    architectureAddMember(plan, {
      id: spec.id + ":west-plane", ownerId: spec.id, role: "roof-field",
      center: { x: spec.center.x - halfRun / 2, y: spec.eaveY + rise / 2, z: spec.center.z },
      size: { x: slopeLength, y: spec.thickness, z: depth },
      rotation: { x: 0, y: 0, z: pitch },
      supportedBy: spec.supportedBy,
      cutawayGroup: spec.cutawayGroup || null
    });
  }
  if(spec.cutawaySide !== "east"){
    architectureAddMember(plan, {
      id: spec.id + ":east-plane", ownerId: spec.id, role: "roof-field",
      center: { x: spec.center.x + halfRun / 2, y: spec.eaveY + rise / 2, z: spec.center.z },
      size: { x: slopeLength, y: spec.thickness, z: depth },
      rotation: { x: 0, y: 0, z: -pitch },
      supportedBy: spec.supportedBy,
      cutawayGroup: spec.cutawayGroup || null
    });
  }
  architectureAddRunPrism(plan, spec.id + ":ridge",
    { x: spec.center.x, z: spec.center.z - depth / 2 },
    { x: spec.center.x, z: spec.center.z + depth / 2 },
    spec.eaveY + rise - spec.thickness / 2, spec.thickness * 1.6, spec.thickness * 1.8,
    "masonry-edge", spec.supportedBy, { ownerId: spec.id });
  [-1, 1].forEach(function(sign){
    var edgeX = spec.center.x + sign * halfRun;
    architectureAddRunPrism(plan, spec.id + ":eave:" + sign,
      { x: edgeX, z: spec.center.z - depth / 2 },
      { x: edgeX, z: spec.center.z + depth / 2 },
      spec.eaveY - spec.thickness * 0.2, spec.thickness * 1.4, spec.thickness * 1.2,
      "timber-structure", spec.supportedBy, { ownerId: spec.id });
    [-1, 1].forEach(function(endSign){
      architectureAddBeam3D(plan, spec.id + ":rake:" + sign + ":" + endSign,
        { x: edgeX, y: spec.eaveY, z: spec.center.z + endSign * depth / 2 },
        { x: spec.center.x, y: spec.eaveY + rise, z: spec.center.z + endSign * depth / 2 },
        spec.thickness * 1.15, "timber-structure", spec.supportedBy, { ownerId: spec.id });
    });
  });
  (spec.endInfills || []).forEach(function(closure){
    architectureAddGableEndInfill(plan, spec, closure, spec.eaveY + rise);
  });
}

function architectureAddShedRoof(plan, spec){
  var frame = architectureShedFrame(spec);
  var run = frame.runLength + spec.overhang * 2;
  var span = frame.spanLength + spec.overhang * 2;
  var slopeLength = run / Math.cos(frame.pitch);
  var rise = run * Math.tan(frame.pitch);
  plan.roofs.push({
    id: spec.id, family: "shed", pitchDeg: spec.pitchDeg,
    highEdge: frame.highEdge, slopeAxis: frame.runAxis,
    eaveY: spec.eaveY, highY: spec.eaveY + rise,
    enclosure: spec.enclosure || "open-frame",
    closureExpected: (spec.endInfills || []).length + (spec.edgeInfills || []).length
  });
  var planeSize = frame.runAxis === "x"
    ? { x: slopeLength, y: spec.thickness, z: span }
    : { x: span, y: spec.thickness, z: slopeLength };
  var planeRotation = frame.runAxis === "x"
    ? { x: 0, y: 0, z: frame.highSign < 0 ? -frame.pitch : frame.pitch }
    : { x: frame.highSign < 0 ? frame.pitch : -frame.pitch, y: 0, z: 0 };
  architectureAddMember(plan, {
    id: spec.id + ":plane", ownerId: spec.id, role: "roof-field",
    center: { x: spec.center.x, y: spec.eaveY + rise / 2, z: spec.center.z },
    size: planeSize,
    rotation: planeRotation,
    supportedBy: spec.supportedBy
  });
  [-1, 1].forEach(function(sign){
    var runCoordinate = frame.runCenter + sign * run / 2;
    var edgeY = spec.eaveY + (sign === frame.highSign ? rise : 0);
    var start, end;
    if(frame.runAxis === "x"){
      start = { x: runCoordinate, z: frame.spanCenter - span / 2 };
      end = { x: runCoordinate, z: frame.spanCenter + span / 2 };
    } else {
      start = { x: frame.spanCenter - span / 2, z: runCoordinate };
      end = { x: frame.spanCenter + span / 2, z: runCoordinate };
    }
    architectureAddRunPrism(plan, spec.id + ":fascia:" + sign, start, end,
      edgeY - spec.thickness * 0.45, spec.thickness * 1.4, spec.thickness * 1.15,
      "timber-structure", spec.supportedBy, { ownerId: spec.id });
  });
  (spec.endInfills || []).forEach(function(closure){
    architectureAddShedEndInfill(plan, spec, closure, frame);
  });
  (spec.edgeInfills || []).forEach(function(closure){
    architectureAddShedEdgeInfill(plan, spec, closure, frame);
  });
}

function architectureAddRoofFacet(plan, id, topVertices, topTriangles, thickness, supportedBy){
  var vertices = topVertices.concat(topVertices.map(function(vertex){
    return { x: vertex.x, y: vertex.y - thickness, z: vertex.z };
  }));
  var n = topVertices.length;
  var triangles = topTriangles.map(function(triangle){ return triangle.slice(); });
  topTriangles.forEach(function(triangle){
    triangles.push([triangle[2] + n, triangle[1] + n, triangle[0] + n]);
  });
  for(var i = 0; i < n; i++){
    var next = (i + 1) % n;
    triangles.push([i, next, next + n], [i, next + n, i + n]);
  }
  return architectureAddPolyhedron(plan, id, vertices, triangles, "roof-field", supportedBy);
}

/* Four explicit low-poly facets around one short ridge. The engine owns every roof vertex; the
   generic renderer only uploads the triangles. This gives the second suite a true hip silhouette
   instead of crossing gables or a pyramid made from overlapping boxes. */
function architectureAddHipRoof(plan, spec){
  var pitch = spec.pitchDeg * Math.PI / 180;
  var width = spec.width + spec.overhang * 2;
  var depth = spec.depth + spec.overhang * 2;
  var ridgeLength = Math.max(0.55, width - depth);
  var halfW = width / 2, halfD = depth / 2, halfRidge = ridgeLength / 2;
  var ridgeY = spec.eaveY + halfD * Math.tan(pitch);
  var cx = spec.center.x, cz = spec.center.z;
  var roofRecord = {
    id: spec.id, family: "hip", pitchDeg: spec.pitchDeg, ridgeAxis: "x",
    eaveY: spec.eaveY, ridgeY: ridgeY,
    drainage: ["north", "south", "west", "east"],
    enclosure: spec.enclosure || "open-frame",
    closureExpected: (spec.edgeInfills || []).length,
    facetSemanticIds: ["north", "south", "west", "east"]
  };
  plan.roofs.push(roofRecord);
  var roofTop = [
    { x: cx - halfW, y: spec.eaveY, z: cz - halfD },
    { x: cx + halfW, y: spec.eaveY, z: cz - halfD },
    { x: cx + halfW, y: spec.eaveY, z: cz + halfD },
    { x: cx - halfW, y: spec.eaveY, z: cz + halfD },
    { x: cx - halfRidge, y: ridgeY, z: cz },
    { x: cx + halfRidge, y: ridgeY, z: cz }
  ];
  var roofVertices = roofTop.concat(roofTop.map(function(vertex){
    return { x: vertex.x, y: vertex.y - spec.thickness, z: vertex.z };
  }));
  var roofTopTriangles = [
    [0, 1, 5], [0, 5, 4],
    [3, 4, 5], [3, 5, 2],
    [0, 4, 3], [2, 5, 1]
  ];
  var roofTriangles = roofTopTriangles.slice();
  roofTopTriangles.forEach(function(triangle){
    roofTriangles.push([triangle[2] + 6, triangle[1] + 6, triangle[0] + 6]);
  });
  [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(function(edge){
    roofTriangles.push(
      [edge[0], edge[1], edge[1] + 6],
      [edge[0], edge[1] + 6, edge[0] + 6]
    );
  });
  var unifiedRoofShell = architectureAddPolyhedron(plan, spec.id + ":unified-roof-shell",
    roofVertices, roofTriangles, "roof-field", spec.supportedBy, {
      ownerId: spec.id,
      condition: "single-closed-hip-roof-volume"
    });
  roofRecord.shellMemberId = unifiedRoofShell.id;
  architectureAddRunPrism(plan, spec.id + ":ridge",
    { x: cx - halfRidge, z: cz }, { x: cx + halfRidge, z: cz },
    ridgeY - spec.thickness * 0.5, spec.thickness * 1.5, spec.thickness * 1.5,
    "masonry-edge", spec.supportedBy, { ownerId: spec.id });
  var eaveBaseY = spec.eaveY - spec.thickness * 0.5;
  var eaveHeight = spec.thickness * 1.35;
  var eaveThickness = spec.thickness * 1.15;
  /* The exposed roof-edge course is a second concentric envelope loop, not part of the outer
     timber fascia. Give it its own continuous flashing geometry so the four separately extruded
     hip facets cannot read as a black/open V immediately inside an otherwise closed fascia. */
  var flashingThickness = spec.thickness * 0.72;
  /* Its top must lap above the rising roof plane at the inner edge. The former 0.58 section sat
     fractionally below the 36-degree hip at the corners, so the roof occluded the closure and
     recreated a black V even though the ring was manifold. */
  var flashingHeight = spec.thickness * 0.78;
  var flashingBaseY = spec.eaveY - spec.thickness * 0.08;
  var flashingMember = architectureAddRectRing(plan, {
    id: spec.id + ":inner-eave-flashing-ring",
    center: { x: cx, z: cz },
    outerWidth: width - eaveThickness,
    outerDepth: depth - eaveThickness,
    bandThickness: flashingThickness,
    baseY: flashingBaseY,
    height: flashingHeight,
    role: "masonry-edge",
    supportedBy: spec.supportedBy,
    ownerId: spec.id,
    condition: "continuous-inner-eave-flashing"
  });
  /* Chamfer the four INNER corners of the flashing opening. Without these aprons, the very dark
     roof field begins at a mathematically sharp concave point and reads as a triangular hole even
     though the ring itself is closed. The aprons meet (rather than overlap) the ring top and make
     the roof/edge contact visually explicit. */
  var flashingOuterHalfW = (width - eaveThickness) / 2;
  var flashingOuterHalfD = (depth - eaveThickness) / 2;
  var flashingInnerHalfW = flashingOuterHalfW - flashingThickness;
  var flashingInnerHalfD = flashingOuterHalfD - flashingThickness;
  var apronLeg = flashingThickness * 1.45;
  var flashingApronIds = [];
  [
    ["north-west", -1, -1], ["north-east", 1, -1],
    ["south-east", 1, 1], ["south-west", -1, 1]
  ].forEach(function(row){
    var cornerX = cx + row[1] * flashingInnerHalfW;
    var cornerZ = cz + row[2] * flashingInnerHalfD;
    var top = flashingBaseY + flashingHeight + 0.002;
    var apronVertices = [
      { x: cornerX, y: top, z: cornerZ },
      { x: cornerX - row[1] * apronLeg, y: top, z: cornerZ },
      { x: cornerX, y: top, z: cornerZ - row[2] * apronLeg },
      { x: cornerX, y: flashingBaseY, z: cornerZ },
      { x: cornerX - row[1] * apronLeg, y: flashingBaseY, z: cornerZ },
      { x: cornerX, y: flashingBaseY, z: cornerZ - row[2] * apronLeg }
    ];
    var apron = architectureAddPolyhedron(plan,
      spec.id + ":inner-eave-flashing-apron:" + row[0], apronVertices, [
        [0, 1, 2], [5, 4, 3],
        [0, 3, 4], [0, 4, 1],
        [1, 4, 5], [1, 5, 2],
        [2, 5, 3], [2, 3, 0]
      ], "masonry-edge", spec.supportedBy, {
        ownerId: spec.id,
        condition: "closed-inner-eave-chamfer"
      });
    flashingApronIds.push(apron.id);
  });
  roofRecord.innerEaveFlashingClosure = {
    strategy: "manifold-ring-with-four-inner-miter-aprons",
    memberIds: [flashingMember.id].concat(flashingApronIds),
    expressionSockets: [
      spec.id + ":inner-eave-junction:north-west",
      spec.id + ":inner-eave-junction:north-east",
      spec.id + ":inner-eave-junction:south-east",
      spec.id + ":inner-eave-junction:south-west"
    ],
    closureRule: "continuous-outer-loop-and-chamfered-inner-contact-without-black-v",
    topologyInvariant: "closure-survives-cultural-junction-expression"
  };
  var eaveLoop = architectureAddMiteredRectLoop(plan, {
    id: spec.id + ":eave-loop",
    outerBounds: {
      minX: cx - halfW - eaveThickness / 2,
      maxX: cx + halfW + eaveThickness / 2,
      minZ: cz - halfD - eaveThickness / 2,
      maxZ: cz + halfD + eaveThickness / 2
    },
    innerBounds: {
      minX: cx - halfW + eaveThickness / 2,
      maxX: cx + halfW - eaveThickness / 2,
      minZ: cz - halfD + eaveThickness / 2,
      maxZ: cz + halfD - eaveThickness / 2
    },
    baseY: eaveBaseY,
    height: eaveHeight,
    role: "timber-structure",
    supportedBy: spec.supportedBy,
    ownerId: spec.id
  });
  roofRecord.eaveCornerClosure = Object.assign({}, eaveLoop, {
    closureRule: "four-fascia-runs-share-exact-diagonal-miter-planes",
    topologyInvariant: "weather-envelope-remains-closed-under-cultural-expression",
    expressionOwnership: "culture-selects-junction-profile-world-truth-selects-symbolic-content",
    allowedExpressionFamilies: [
      "square-mitre", "rounded-return", "swept-upturn", "corbel",
      "gargoyle-or-guardian", "finial", "painted-binding", "monolithic-packed-join"
    ],
    expressionSockets: eaveLoop.junctionSockets.map(function(socket){
      return spec.id + ":eave-junction:" + socket.corner;
    })
  });
  var hipEdgeInfills = spec.edgeInfills || [];
  var hipEdgeByName = {};
  hipEdgeInfills.forEach(function(closure){ hipEdgeByName[closure.edge] = closure; });
  var hasCompleteEdgeLoop = ["north", "south", "west", "east"].every(function(edge){
    return !!hipEdgeByName[edge];
  });
  if(hasCompleteEdgeLoop){
    var roofAtWall = spec.eaveY + spec.overhang * Math.tan(pitch)
      - spec.thickness * 0.48;
    var edgeBaseY = Math.min.apply(Math, hipEdgeInfills.map(function(closure){
      return Math.min(closure.wallTopY - 0.04, roofAtWall - 0.04);
    }));
    var north = hipEdgeByName.north, south = hipEdgeByName.south;
    var west = hipEdgeByName.west, east = hipEdgeByName.east;
    var northT = north.thickness || 0.34, southT = south.thickness || 0.34;
    var westT = west.thickness || 0.34, eastT = east.thickness || 0.34;
    var wallHalfW = Math.min((west.width || spec.width) / 2,
      (east.width || spec.width) / 2);
    var wallHalfD = Math.min((north.depth || spec.depth) / 2,
      (south.depth || spec.depth) / 2);
    var edgeSupports = [];
    hipEdgeInfills.forEach(function(closure){
      (closure.supportedBy || spec.supportedBy || []).forEach(function(supportId){
        if(edgeSupports.indexOf(supportId) < 0) edgeSupports.push(supportId);
      });
    });
    var edgeLoop = architectureAddMiteredRectLoop(plan, {
      id: spec.id + ":edge-infill-loop",
      outerBounds: {
        minX: cx - wallHalfW - westT / 2,
        maxX: cx + wallHalfW + eastT / 2,
        minZ: cz - wallHalfD - northT / 2,
        maxZ: cz + wallHalfD + southT / 2
      },
      innerBounds: {
        minX: cx - wallHalfW + westT / 2,
        maxX: cx + wallHalfW - eastT / 2,
        minZ: cz - wallHalfD + northT / 2,
        maxZ: cz + wallHalfD - southT / 2
      },
      baseY: edgeBaseY,
      height: roofAtWall - edgeBaseY,
      role: "masonry-wall",
      supportedBy: edgeSupports,
      ownerId: spec.id
    });
    roofRecord.edgeInfillClosure = edgeLoop;
    hipEdgeInfills.forEach(function(closure){
      architectureRoofClosureRecord(plan, spec.id,
        edgeLoop.memberIdBySide[closure.edge], "hip-edge-infill:" + closure.edge,
        closure.ownerId || edgeLoop.memberIdBySide[closure.edge]);
    });
  } else hipEdgeInfills.forEach(function(closure){
    var edge = closure.edge;
    var roofAtWall = spec.eaveY + spec.overhang * Math.tan(pitch)
      - spec.thickness * 0.48;
    var baseY = Math.min(closure.wallTopY - 0.04, roofAtWall - 0.04);
    var memberId = closure.id || (spec.id + ":hip-edge-infill:" + edge);
    var start, end;
    if(edge === "north" || edge === "south"){
      var z = cz + (edge === "north" ? -1 : 1) * (closure.depth || spec.depth) / 2;
      var w = closure.width || spec.width;
      start = { x: cx - w / 2, z: z };
      end = { x: cx + w / 2, z: z };
    } else {
      var x = cx + (edge === "west" ? -1 : 1) * (closure.width || spec.width) / 2;
      var d = closure.depth || spec.depth;
      start = { x: x, z: cz - d / 2 };
      end = { x: x, z: cz + d / 2 };
    }
    architectureAddRunPrism(plan, memberId, start, end, baseY, roofAtWall - baseY,
      closure.thickness || 0.34, closure.role || "masonry-wall",
      closure.supportedBy || spec.supportedBy, {
        ownerId: closure.ownerId || memberId,
        cutawayGroup: closure.cutawayGroup || null
      });
    architectureRoofClosureRecord(plan, spec.id, memberId, "hip-edge-infill",
      closure.ownerId || memberId);
  });
}

function architectureAddParapetRect(plan, id, center, w, d, baseY, height, thickness, supportedBy,
  openSide){
  var closure = openSide ? architectureAddMiteredOpenRectBand(plan, {
    id: id + ":parapet",
    center: center,
    width: w,
    depth: d,
    baseY: baseY,
    height: height,
    thickness: thickness,
    role: "masonry-edge",
    supportedBy: supportedBy,
    ownerId: id,
    openSide: openSide,
    cover: "half-cover"
  }) : architectureAddMiteredRectLoop(plan, {
    id: id + ":parapet",
    outerBounds: {
      minX: center.x - w / 2 - thickness / 2,
      maxX: center.x + w / 2 + thickness / 2,
      minZ: center.z - d / 2 - thickness / 2,
      maxZ: center.z + d / 2 + thickness / 2
    },
    innerBounds: {
      minX: center.x - w / 2 + thickness / 2,
      maxX: center.x + w / 2 - thickness / 2,
      minZ: center.z - d / 2 + thickness / 2,
      maxZ: center.z + d / 2 - thickness / 2
    },
    baseY: baseY,
    height: height,
    role: "masonry-edge",
    supportedBy: supportedBy,
    ownerId: id,
    cover: "half-cover"
  });
  closure.id = id;
  plan.orthogonalRunClosures.push(closure);
}

function architectureAddAssetSocket(plan, spec){
  plan.assetSockets.push({
    id: spec.id,
    ownerId: spec.ownerId,
    purpose: spec.purpose,
    required: !!spec.required,
    catalog: spec.catalog || "meshy-genesis",
    allowedSlugs: (spec.allowedSlugs || []).slice(),
    promotionCandidates: (spec.promotionCandidates || []).map(function(candidate){
      return {
        jobId: candidate.jobId,
        intendedSlug: candidate.intendedSlug || null,
        inventoryState: candidate.inventoryState || "generated-adjudicated-not-citizen",
        purpose: candidate.purpose || spec.purpose
      };
    }),
    plannedCandidates: (spec.plannedCandidates || []).map(function(candidate){
      return {
        jobId: candidate.jobId,
        intendedSlug: candidate.intendedSlug || null,
        inventoryState: "planned-manifest-row-only",
        purpose: candidate.purpose || spec.purpose
      };
    }),
    at: { x: spec.at.x, y: spec.at.y, z: spec.at.z },
    yaw: spec.yaw || 0,
    scale: spec.scale == null ? 1 : spec.scale,
    materialContext: spec.materialContext || null,
    collisionAuthority: spec.collisionAuthority || "engine-plan",
    stateOwner: spec.stateOwner || "site-runtime",
    fallback: spec.fallback || { kind: "omit", reason: "optional-detail" }
  });
}

function architectureAddAccess(plan, id, from, to, kind, width){
  plan.accessGraph.push({ id: id, from: from, to: to, kind: kind, width: width });
}

function architectureAddLightSocket(plan, spec){
  plan.lightSockets.push({
    id: spec.id,
    at: { x: spec.at.x, y: spec.at.y, z: spec.at.z },
    color: spec.color,
    intensity: spec.intensity,
    distance: spec.distance,
    decay: spec.decay == null ? 2 : spec.decay,
    supportId: spec.supportId,
    purpose: spec.purpose
  });
}

function architectureBuildRoadCheckpoint(def, seed){
  var angle = 26 * Math.PI / 180;
  var tangent = architectureVec2(Math.cos(angle), Math.sin(angle));
  var normal = architectureVec2(-tangent.z, tangent.x);
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 16, y: 16 },
    primarySpatialSentence: "A diagonal road passes through one operable, orthogonal control line.",
    programTopology: ["entry-continuation", "controlled-threshold", "exit-continuation"],
    constructionProfile: "timber-mechanism-on-stone-feet",
    visualLocks: ["road reads as region", "barrier spans road normal", "passage remains visible"],
    gameplayLocks: ["clear road tread", "operable barrier", "secondary denial outside passage"]
  });
  plan.frame.roadThreshold = { center: { x: 0, z: 0 }, tangent: tangent, normal: normal,
    roadWidth: 3.2, clearWidth: 3.4 };
  architectureAddMember(plan, {
    id: "checkpoint-road", role: "site-road",
    center: { x: 0, y: 0.035, z: 0 }, size: { x: 19, y: 0.07, z: 3.2 },
    rotation: { x: 0, y: -Math.atan2(tangent.z, tangent.x), z: 0 },
    supportedBy: ["ground"], access: "walk"
  });
  var postOffset = 3.4 / 2 + 0.27;
  [-1, 1].forEach(function(sign){
    var p = { x: normal.x * postOffset * sign, z: normal.z * postOffset * sign };
    architectureAddBox(plan, "checkpoint-post:" + sign,
      { x: p.x, y: 0.95, z: p.z }, { x: 0.48, y: 1.9, z: 0.48 },
      "timber-structure", ["ground"], { ownerId: "checkpoint-frame" });
    architectureAddBox(plan, "checkpoint-foot:" + sign,
      { x: p.x, y: 0.14, z: p.z }, { x: 0.82, y: 0.28, z: 0.82 },
      "foundation", ["ground"], { ownerId: "checkpoint-frame" });
  });
  var beamStart = { x: normal.x * -postOffset, z: normal.z * -postOffset };
  var beamEnd = { x: normal.x * postOffset, z: normal.z * postOffset };
  architectureAddRunPrism(plan, "checkpoint-boom", beamStart, beamEnd, 1.02, 0.28, 0.32,
    "timber-structure", ["checkpoint-post:-1", "checkpoint-post:1"], {
      ownerId: "checkpoint-barrier", access: "none", condition: "intact"
    });
  architectureAddBox(plan, "checkpoint-counterweight",
    { x: beamStart.x - normal.x * 0.45, y: 0.87, z: beamStart.z - normal.z * 0.45 },
    { x: 0.55, y: 0.55, z: 0.55 }, "metal-mechanism", ["checkpoint-post:-1"],
    { ownerId: "checkpoint-barrier" });
  plan.thresholds.push({
    id: "checkpoint-threshold", roadTangent: tangent, roadNormal: normal,
    barrierAxis: normal, clearWidth: 3.4, roadWidth: 3.2, state: "closed", pivotPost: -1
  });
  plan.barrierAudit = {
    roadTangent: tangent, barrierAxis: normal,
    dot: architectureRound(architectureDot(tangent, normal)),
    orthogonal: Math.abs(architectureDot(tangent, normal)) <= 0.001,
    passageClear: 3.4 >= 3.2
  };
  architectureAddAssetSocket(plan, {
    id: "checkpoint-signal", ownerId: "checkpoint-post:1", purpose: "audible-control-signal",
    allowedSlugs: ["alarm-bell-yoke"], at: { x: normal.x * postOffset, y: 1.9, z: normal.z * postOffset },
    yaw: -Math.atan2(tangent.z, tangent.x), scale: 0.8
  });
  architectureAddAssetSocket(plan, {
    id: "checkpoint-boom-donor", ownerId: "checkpoint-barrier",
    purpose: "recognizable-counterweighted-road-control",
    allowedSlugs: [],
    promotionCandidates: [{
      jobId: "M024-A", intendedSlug: "counterweighted-road-barrier",
      purpose: "replace the neutral mechanism shell without taking pivot/state authority"
    }],
    at: { x: 0, y: 0, z: 0 }, yaw: -Math.atan2(normal.z, normal.x), scale: 1,
    fallback: { kind: "compiled-members", memberIds: [
      "checkpoint-post:-1", "checkpoint-post:1", "checkpoint-boom", "checkpoint-counterweight"
    ], reason: "generated donor is not yet a runtime citizen" }
  });
  architectureAddAssetSocket(plan, {
    id: "checkpoint-secondary-denial", ownerId: "checkpoint-road",
    purpose: "portable-half-cover-outside-clear-passage",
    allowedSlugs: ["movable-timber-barricade"], at: {
      x: normal.x * (postOffset + 1.35) + tangent.x * -1.1, y: 0.08,
      z: normal.z * (postOffset + 1.35) + tangent.z * -1.1
    }, yaw: -Math.atan2(normal.z, normal.x), scale: 0.82
  });
  architectureAddAccess(plan, "road-through", "entry-continuation", "exit-continuation", "walk", 3.2);
  return plan;
}

function architectureBuildRoadsideShelter(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 16, y: 16 },
    primarySpatialSentence: "A one-bay weather shelter opens toward the road and closes against wind.",
    programTopology: ["road-edge", "open-protected-bay", "service-corner"],
    constructionProfile: "post-and-beam-with-wattle-weather-wall",
    visualLocks: ["one broad shed roof", "open public face", "supported corners"],
    gameplayLocks: ["clear entrance", "covered standing room", "service edge"]
  });
  architectureAddSlab(plan, "shelter-floor", { x: 0, z: 0 }, { x: 5.4, z: 4.0 },
    0.22, 0.22, "timber-surface", ["ground"], "walk");
  architectureAddWallRun(plan, {
    id: "shelter-weather-wall", start: { x: -2.7, z: -2 }, end: { x: 2.7, z: -2 },
    baseY: 0.22, height: 1.8, thickness: 0.24, role: "timber-structure",
    supportedBy: ["shelter-floor"], openings: [{
      id: "shelter-high-window", station: 3.5, width: 1.25, bottom: 0.7, height: 0.65,
      kind: "window", observation: true
    }]
  });
  architectureAddWallRun(plan, {
    id: "shelter-service-wall", start: { x: 2.7, z: -2 }, end: { x: 2.7, z: 0.25 },
    baseY: 0.22, height: 1.65, thickness: 0.24, role: "timber-structure",
    supportedBy: ["shelter-floor"]
  });
  architectureAddPosts(plan, "shelter-posts", [
    { x: -2.45, z: -1.72 }, { x: 2.45, z: -1.72 },
    { x: -2.45, z: 1.72 }, { x: 2.45, z: 1.72 }
  ], 0.22, 2.55, 0.34, "timber-structure", ["shelter-floor"]);
  architectureAddRunPrism(plan, "shelter-front-beam", { x: -2.55, z: 1.72 },
    { x: 2.55, z: 1.72 }, 2.35, 0.3, 0.3, "timber-structure",
    ["shelter-posts"], { ownerId: "shelter-frame" });
  architectureAddRunPrism(plan, "shelter-back-beam", { x: -2.55, z: -1.72 },
    { x: 2.55, z: -1.72 }, 2.65, 0.3, 0.3, "timber-structure",
    ["shelter-posts", "shelter-weather-wall"], { ownerId: "shelter-frame" });
  [
    [{ x: -2.42, y: 1.62, z: 1.7 }, { x: -1.62, y: 2.34, z: 1.7 }],
    [{ x: 2.42, y: 1.62, z: 1.7 }, { x: 1.62, y: 2.34, z: 1.7 }],
    [{ x: -2.42, y: 1.78, z: -1.7 }, { x: -1.68, y: 2.58, z: -1.7 }],
    [{ x: 2.42, y: 1.78, z: -1.7 }, { x: 1.68, y: 2.58, z: -1.7 }]
  ].forEach(function(pair, index){
    architectureAddBeam3D(plan, "shelter-knee-brace:" + index, pair[0], pair[1], 0.2,
      "timber-structure", ["shelter-posts"], { ownerId: "shelter-frame" });
  });
  architectureAddShedRoof(plan, {
    id: "shelter-shed-roof", center: { x: 0, z: 0 }, width: 5.7, depth: 4.3,
    eaveY: 2.55, pitchDeg: 9, overhang: 0.35, thickness: 0.18, highEdge: "west",
    enclosure: "open-frame",
    supportedBy: ["shelter-front-beam", "shelter-back-beam"]
  });
  architectureAddAssetSocket(plan, {
    id: "shelter-screen", ownerId: "shelter-service-wall", purpose: "weather-and-privacy-infill",
    allowedSlugs: ["wattle-screen"], at: { x: 1.9, y: 0.24, z: -1.72 },
    yaw: 0, scale: 0.9
  });
  architectureAddAssetSocket(plan, {
    id: "shelter-stores", ownerId: "shelter-floor", purpose: "service-supply",
    allowedSlugs: ["camp-kitchen-stores"], at: { x: 1.5, y: 0.24, z: -0.7 },
    yaw: Math.PI / 2, scale: 0.82
  });
  architectureAddAccess(plan, "shelter-entry", "road-edge", "open-protected-bay", "walk", 3.8);
  return plan;
}

function architectureBuildEmbeddedGuardroom(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 18, y: 18 },
    primarySpatialSentence: "A masonry guardroom is inserted into a retaining shoulder above its apron.",
    programTopology: ["road-apron", "guard-threshold", "guardroom", "roof-lookout"],
    constructionProfile: "embedded-masonry-with-timber-repair",
    physicalState: "repaired",
    visualLocks: ["shoulder plinth", "deep observation opening", "walkable roof edge"],
    gameplayLocks: ["apron entry", "roof access", "observation over approach"]
  });
  architectureAddBox(plan, "guard-shoulder",
    { x: 0, y: 0.6, z: -2.25 }, { x: 8.4, y: 1.2, z: 3.7 },
    "site-earthwork", ["ground"], { access: "walk" });
  architectureAddSlab(plan, "guard-plinth", { x: 0, z: -0.6 }, { x: 6.4, z: 4.8 },
    1.02, 0.34, "foundation", ["guard-shoulder"], "walk");
  architectureAddWallRun(plan, {
    id: "guard-back-wall", start: { x: -3.05, z: -2.7 }, end: { x: 3.05, z: -2.7 },
    baseY: 1.02, height: 2.25, thickness: 0.38, supportedBy: ["guard-plinth"],
    openings: [{
      id: "guard-observation", station: 3.05, width: 2.1, bottom: 0.9, height: 0.72,
      kind: "observation-window", observation: true
    }]
  });
  architectureAddWallRun(plan, {
    id: "guard-west-wall", start: { x: -3.05, z: -2.7 }, end: { x: -3.05, z: 1.65 },
    baseY: 1.02, height: 2.25, thickness: 0.38, supportedBy: ["guard-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "guard-east-wall", start: { x: 3.05, z: -2.7 }, end: { x: 3.05, z: 0.35 },
    baseY: 1.02, height: 2.25, thickness: 0.38, supportedBy: ["guard-plinth"],
    cutawayGroup: "camera-near-shell"
  });
  architectureAddWallRun(plan, {
    id: "guard-front-piers", start: { x: -3.05, z: 1.65 }, end: { x: 3.05, z: 1.65 },
    baseY: 1.02, height: 2.25, thickness: 0.38, supportedBy: ["guard-plinth"],
    cutawayGroup: "camera-near-shell",
    openings: [{
      id: "guard-door", station: 3.95, width: 1.25, bottom: 0, height: 1.75,
      kind: "door", access: "walk"
    }, {
      id: "guard-open-front", station: 1.4, width: 1.45, bottom: 0.25, height: 1.65,
      kind: "cutaway-opening", access: "none"
    }]
  });
  architectureAddSlab(plan, "guard-roof-deck", { x: 0, z: -0.6 }, { x: 6.55, z: 4.95 },
    3.32, 0.24, "timber-surface",
    ["guard-back-wall", "guard-west-wall", "guard-east-wall", "guard-front-piers"], "walk");
  architectureAddParapetRect(plan, "guard-roof-parapet", { x: 0, z: -0.6 }, 6.35, 4.75,
    3.32, 0.68, 0.28, ["guard-roof-deck"], "south");
  architectureAddStair(plan, {
    id: "guard-roof-stair", start: { x: 4.2, z: 1.25 }, end: { x: 3.05, z: -1.15 },
    baseY: 1.02, topY: 3.32, width: 1.05, steps: 7, upperLandingId: "guard-roof-deck",
    supportedBy: ["guard-plinth"], cheeks: true
  });
  architectureAddAssetSocket(plan, {
    id: "guard-repair", ownerId: "guard-east-wall", purpose: "causal-structural-repair",
    allowedSlugs: ["timber-repair-brace"], at: { x: 3.25, y: 1.02, z: -1.55 },
    yaw: Math.PI / 2, scale: 1.05, materialContext: { wood: "oak", stone: "granite" }
  });
  architectureAddAssetSocket(plan, {
    id: "guard-bell", ownerId: "guard-roof-deck", purpose: "signal-station",
    allowedSlugs: ["alarm-bell-yoke"], at: { x: -2.0, y: 3.36, z: -1.9 }, yaw: 0, scale: 0.8
  });
  plan.cutawayGroups.push({
    id: "camera-near-shell", mode: "bearing-derived", preserves: ["collision", "wall-run", "cap"]
  });
  architectureAddAccess(plan, "guard-entry", "road-apron", "guardroom", "walk", 1.25);
  architectureAddAccess(plan, "guard-roof-route", "guardroom", "roof-lookout", "stair", 1.05);
  return plan;
}

function architectureBuildWorkshop(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 18, y: 18 },
    primarySpatialSentence: "A broad gabled work bay hangs from a masonry service spine and side lean-to.",
    programTopology: ["goods-apron", "wide-work-bay", "service-spine", "covered-side-yard"],
    constructionProfile: "hybrid-masonry-and-heavy-timber",
    visualLocks: ["clear gable silhouette", "wide goods opening", "uncluttered work volume"],
    gameplayLocks: ["wide entry", "clear work floor", "side service route"]
  });
  architectureAddSlab(plan, "workshop-floor", { x: -0.6, z: 0 }, { x: 8.4, z: 5.6 },
    0.26, 0.26, "foundation", ["ground"], "walk");
  architectureAddWallRun(plan, {
    id: "workshop-back", start: { x: -4.8, z: -2.8 }, end: { x: 3.6, z: -2.8 },
    baseY: 0.26, height: 2.65, thickness: 0.34, supportedBy: ["workshop-floor"],
    openings: [{
      id: "workshop-back-window", station: 5.7, width: 1.3, bottom: 0.9, height: 0.85,
      kind: "window"
    }]
  });
  architectureAddWallRun(plan, {
    id: "workshop-west", start: { x: -4.8, z: -2.8 }, end: { x: -4.8, z: 2.8 },
    baseY: 0.26, height: 2.65, thickness: 0.34, supportedBy: ["workshop-floor"]
  });
  architectureAddWallRun(plan, {
    id: "workshop-east-service", start: { x: 3.6, z: -2.8 }, end: { x: 3.6, z: 1.0 },
    baseY: 0.26, height: 2.4, thickness: 0.34, supportedBy: ["workshop-floor"],
    openings: [{
      id: "workshop-service-door", station: 2.7, width: 1.1, bottom: 0, height: 1.8,
      kind: "door", access: "walk"
    }]
  });
  architectureAddWallRun(plan, {
    id: "workshop-front", start: { x: -4.8, z: 2.8 }, end: { x: 3.6, z: 2.8 },
    baseY: 0.26, height: 2.5, thickness: 0.34, supportedBy: ["workshop-floor"],
    cutawayGroup: "camera-near-shell",
    openings: [{
      id: "workshop-goods-opening", station: 4.15, width: 3.45, bottom: 0, height: 2.15,
      kind: "goods-opening", access: "walk"
    }]
  });
  architectureAddPosts(plan, "workshop-primary-posts", [
    { x: -4.35, z: -2.35 }, { x: -4.35, z: 2.35 },
    { x: -0.6, z: -2.35 }, { x: -0.6, z: 2.35 },
    { x: 3.15, z: -2.35 }, { x: 3.15, z: 2.35 }
  ], 0.26, 3.05, 0.38, "timber-structure", ["workshop-floor"]);
  architectureAddGableRoof(plan, {
    id: "workshop-gable", center: { x: -0.6, z: 0 }, width: 8.9, depth: 5.9,
    eaveY: 3.08, pitchDeg: 22, overhang: 0.38, thickness: 0.18,
    enclosure: "enclosed",
    supportedBy: ["workshop-primary-posts", "workshop-back", "workshop-west"],
    endInfills: [{
      id: "workshop-gable:north-infill", side: "north", at: -2.8,
      width: 8.4, wallTopY: 2.91, thickness: 0.34,
      supportedBy: ["workshop-back"], ownerId: "workshop-back"
    }, {
      id: "workshop-gable:south-infill", side: "south", at: 2.8,
      width: 8.4, wallTopY: 2.76, thickness: 0.34,
      supportedBy: ["workshop-front"], ownerId: "workshop-front",
      cutawayGroup: "camera-near-shell"
    }]
  });
  architectureAddPosts(plan, "workshop-lean-posts", [
    { x: 4.4, z: -2.2 }, { x: 4.4, z: 0.4 }, { x: 6.2, z: -2.2 }, { x: 6.2, z: 0.4 }
  ], 0, 2.15, 0.28, "timber-structure", ["ground"]);
  architectureAddShedRoof(plan, {
    id: "workshop-lean-roof", center: { x: 5.3, z: -0.9 }, width: 2.2, depth: 3.3,
    eaveY: 2.05, pitchDeg: 12, overhang: 0.25, thickness: 0.15, highEdge: "west",
    enclosure: "open-frame",
    supportedBy: ["workshop-lean-posts", "workshop-east-service"]
  });
  architectureAddAssetSocket(plan, {
    id: "workshop-forge", ownerId: "workshop-floor", purpose: "program-operating-witness",
    allowedSlugs: ["compact-field-forge"], at: { x: 1.8, y: 0.28, z: -1.5 },
    yaw: -Math.PI / 2, scale: 0.95
  });
  architectureAddAssetSocket(plan, {
    id: "workshop-lift", ownerId: "workshop-primary-posts",
    purpose: "heavy-work-lifting-mechanism",
    allowedSlugs: ["hand-windlass"],
    at: { x: -1.4, y: 0.3, z: -1.65 }, yaw: Math.PI / 2, scale: 0.86,
    fallback: { kind: "omit", reason: "the work hall must read without optional machinery" }
  });
  plan.cutawayGroups.push({ id: "camera-near-shell", mode: "bearing-derived",
    preserves: ["goods-opening", "lintel", "collision"] });
  architectureAddAccess(plan, "workshop-goods-entry", "goods-apron", "wide-work-bay", "walk", 3.45);
  architectureAddAccess(plan, "workshop-service-route", "covered-side-yard", "service-spine", "walk", 1.1);
  return plan;
}

function architectureBuildCourtyard(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 20, y: 20 },
    primarySpatialSentence: "Three covered ranges wrap a quiet court and rise to one processional head.",
    programTopology: ["arrival-stair", "court", "covered-range", "raised-head-room"],
    constructionProfile: "dressed-masonry-with-timber-arcade",
    visualLocks: ["court remains empty", "three-sided enclosure", "repeated broad bays"],
    gameplayLocks: ["court circulation", "covered perimeter route", "raised destination"]
  });
  architectureAddSlab(plan, "court-paving", { x: 0, z: 0.8 }, { x: 7.2, z: 6.5 },
    0.18, 0.18, "masonry-edge", ["ground"], "walk");
  architectureAddSlab(plan, "court-back-range", { x: 0, z: -3.5 }, { x: 10.5, z: 2.8 },
    0.45, 0.45, "foundation", ["ground"], "walk");
  architectureAddSlab(plan, "court-west-range", { x: -4.0, z: 0.3 }, { x: 2.5, z: 7.6 },
    0.35, 0.35, "foundation", ["ground"], "walk");
  architectureAddSlab(plan, "court-east-range", { x: 4.0, z: 0.3 }, { x: 2.5, z: 7.6 },
    0.35, 0.35, "foundation", ["ground"], "walk");
  architectureAddWallRun(plan, {
    id: "court-back-outer", start: { x: -5.25, z: -4.9 }, end: { x: 5.25, z: -4.9 },
    baseY: 0.45, height: 2.3, thickness: 0.32, supportedBy: ["court-back-range"],
    openings: [
      { id: "court-back-window-w", station: 2.5, width: 1.1, bottom: 0.8, height: 0.8, kind: "window" },
      { id: "court-back-door", station: 5.25, width: 1.2, bottom: 0, height: 1.75, kind: "door", access: "walk" },
      { id: "court-back-window-e", station: 8.0, width: 1.1, bottom: 0.8, height: 0.8, kind: "window" }
    ]
  });
  architectureAddWallRun(plan, {
    id: "court-west-outer", start: { x: -5.25, z: -4.9 }, end: { x: -5.25, z: 4.1 },
    baseY: 0.35, height: 2.2, thickness: 0.32, supportedBy: ["court-west-range"],
    openings: [{ id: "court-west-door", station: 6.8, width: 1.1, bottom: 0, height: 1.75,
      kind: "door", access: "walk" }]
  });
  architectureAddWallRun(plan, {
    id: "court-east-outer", start: { x: 5.25, z: -4.9 }, end: { x: 5.25, z: 4.1 },
    baseY: 0.35, height: 2.2, thickness: 0.32, supportedBy: ["court-east-range"],
    openings: [{ id: "court-east-door", station: 6.8, width: 1.1, bottom: 0, height: 1.75,
      kind: "door", access: "walk" }]
  });
  var arcade = [];
  [-3.7, -1.85, 0, 1.85, 3.7].forEach(function(x){ arcade.push({ x: x, z: -2.18 }); });
  [-3.0, -0.9, 1.2, 3.3].forEach(function(z){
    arcade.push({ x: -2.72, z: z }); arcade.push({ x: 2.72, z: z });
  });
  architectureAddPosts(plan, "court-arcade-posts", arcade, 0.35, 2.05, 0.3,
    "timber-structure", ["court-back-range", "court-west-range", "court-east-range"]);
  architectureAddRunPrism(plan, "court-back-arcade-beam", { x: -4.3, z: -2.18 },
    { x: 4.3, z: -2.18 }, 2.2, 0.26, 0.28, "timber-structure",
    ["court-arcade-posts"], { ownerId: "court-arcade" });
  architectureAddRunPrism(plan, "court-west-arcade-beam", { x: -2.72, z: -2.18 },
    { x: -2.72, z: 4.1 }, 2.15, 0.26, 0.28, "timber-structure",
    ["court-arcade-posts"], { ownerId: "court-arcade" });
  architectureAddRunPrism(plan, "court-east-arcade-beam", { x: 2.72, z: -2.18 },
    { x: 2.72, z: 4.1 }, 2.15, 0.26, 0.28, "timber-structure",
    ["court-arcade-posts"], { ownerId: "court-arcade" });
  architectureAddShedRoof(plan, {
    id: "court-back-roof", center: { x: 0, z: -3.55 }, width: 10.8, depth: 3.0,
    eaveY: 2.48, pitchDeg: 10, overhang: 0.25, thickness: 0.16, highEdge: "north",
    enclosure: "partial",
    supportedBy: ["court-back-outer", "court-back-arcade-beam"],
    edgeInfills: [{
      id: "court-back-roof:outer-crown", edge: "north", wallTopY: 2.75,
      spanLength: 10.5, thickness: 0.32,
      supportedBy: ["court-back-outer"], ownerId: "court-back-outer"
    }]
  });
  architectureAddShedRoof(plan, {
    id: "court-west-roof", center: { x: -4.0, z: 0.4 }, width: 2.7, depth: 7.9,
    eaveY: 2.38, pitchDeg: 10, overhang: 0.25, thickness: 0.16, highEdge: "west",
    enclosure: "partial",
    supportedBy: ["court-west-outer", "court-west-arcade-beam"],
    edgeInfills: [{
      id: "court-west-roof:outer-crown", edge: "west", wallTopY: 2.55,
      spanLength: 7.6, thickness: 0.32,
      supportedBy: ["court-west-outer"], ownerId: "court-west-outer"
    }]
  });
  architectureAddShedRoof(plan, {
    id: "court-east-roof", center: { x: 4.0, z: 0.4 }, width: 2.7, depth: 7.9,
    eaveY: 2.38, pitchDeg: 10, overhang: 0.25, thickness: 0.16, highEdge: "east",
    enclosure: "partial",
    supportedBy: ["court-east-outer", "court-east-arcade-beam"],
    edgeInfills: [{
      id: "court-east-roof:outer-crown", edge: "east", wallTopY: 2.55,
      spanLength: 7.6, thickness: 0.32,
      supportedBy: ["court-east-outer"], ownerId: "court-east-outer"
    }]
  });
  architectureAddSlab(plan, "court-head-terrace", { x: 0, z: -3.45 }, { x: 4.2, z: 2.25 },
    2.85, 0.22, "masonry-edge", ["court-back-outer", "court-arcade-posts"], "walk");
  architectureAddStair(plan, {
    id: "court-head-stair", start: { x: 0, z: 1.1 }, end: { x: 0, z: -2.25 },
    baseY: 0.18, topY: 2.85, width: 1.55, steps: 8, upperLandingId: "court-head-terrace",
    supportedBy: ["court-paving"], cheeks: true
  });
  architectureAddAssetSocket(plan, {
    id: "court-records", ownerId: "court-head-terrace", purpose: "institutional-records",
    allowedSlugs: ["archive-lectern"], at: { x: 1.15, y: 2.88, z: -3.45 },
    yaw: Math.PI, scale: 0.9
  });
  architectureAddAccess(plan, "court-arrival", "outside", "court", "stair", 1.55);
  architectureAddAccess(plan, "court-wrap", "court", "covered-range", "walk", 1.4);
  architectureAddAccess(plan, "court-head-route", "court", "raised-head-room", "stair", 1.55);
  return plan;
}

function architectureBuildMarketHall(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 20, y: 20 },
    primarySpatialSentence: "A broad open trading hall carries a partial records gallery under one roof.",
    programTopology: ["public-apron", "clear-trading-floor", "service-edge", "upper-gallery"],
    constructionProfile: "heavy-timber-hall-on-masonry-plinth",
    visualLocks: ["clear-span hall", "partial upper gallery", "one broad gable"],
    gameplayLocks: ["two public entries", "gallery access", "unblocked trading floor"]
  });
  architectureAddSlab(plan, "market-plinth", { x: 0, z: 0 }, { x: 10.8, z: 7.4 },
    0.38, 0.38, "foundation", ["ground"], "walk");
  var posts = [];
  [-4.65, -1.55, 1.55, 4.65].forEach(function(x){
    posts.push({ x: x, z: -3.0 }); posts.push({ x: x, z: 3.0 });
  });
  architectureAddPosts(plan, "market-primary-posts", posts, 0.38, 4.35, 0.42,
    "timber-structure", ["market-plinth"]);
  architectureAddRunPrism(plan, "market-north-beam", { x: -5, z: -3.0 }, { x: 5, z: -3.0 },
    3.9, 0.36, 0.36, "timber-structure", ["market-primary-posts"], { ownerId: "market-frame" });
  architectureAddRunPrism(plan, "market-south-beam", { x: -5, z: 3.0 }, { x: 5, z: 3.0 },
    3.9, 0.36, 0.36, "timber-structure", ["market-primary-posts"], { ownerId: "market-frame" });
  architectureAddWallRun(plan, {
    id: "market-service-wall", start: { x: -5.0, z: -3.25 }, end: { x: 5.0, z: -3.25 },
    baseY: 0.38, height: 2.35, thickness: 0.3, role: "masonry-wall",
    supportedBy: ["market-plinth"],
    openings: [
      { id: "market-service-door-w", station: 2.0, width: 1.2, bottom: 0, height: 1.8,
        kind: "door", access: "walk" },
      { id: "market-service-window", station: 5.0, width: 2.0, bottom: 0.75, height: 0.9,
        kind: "service-window" },
      { id: "market-service-door-e", station: 8.0, width: 1.2, bottom: 0, height: 1.8,
        kind: "door", access: "walk" }
    ]
  });
  architectureAddSlab(plan, "market-gallery", { x: 0, z: -2.05 }, { x: 10.0, z: 2.1 },
    2.7, 0.24, "timber-surface", ["market-primary-posts", "market-service-wall"], "walk");
  architectureAddParapetRect(plan, "market-gallery-rail", { x: 0, z: -2.05 }, 9.8, 1.9,
    2.7, 0.62, 0.18, ["market-gallery"], "north");
  architectureAddStair(plan, {
    id: "market-gallery-stair", start: { x: 5.65, z: 2.6 }, end: { x: 4.5, z: -0.55 },
    baseY: 0.38, topY: 2.7, width: 1.15, steps: 8, upperLandingId: "market-gallery",
    supportedBy: ["market-plinth"], cheeks: false, role: "timber-surface"
  });
  architectureAddGableRoof(plan, {
    id: "market-gable", center: { x: 0, z: 0 }, width: 11.3, depth: 7.8,
    eaveY: 4.55, pitchDeg: 24, overhang: 0.45, thickness: 0.2,
    enclosure: "open-frame",
    supportedBy: ["market-primary-posts", "market-north-beam", "market-south-beam"]
  });
  architectureAddAssetSocket(plan, {
    id: "market-notice", ownerId: "market-plinth", purpose: "public-information-edge",
    allowedSlugs: ["public-notice-signal-board"], at: { x: -4.35, y: 0.4, z: 3.55 },
    yaw: 0, scale: 0.86
  });
  architectureAddAssetSocket(plan, {
    id: "market-records", ownerId: "market-gallery", purpose: "weights-records-authority",
    allowedSlugs: ["archive-lectern"], at: { x: 2.7, y: 2.74, z: -2.0 },
    yaw: Math.PI, scale: 0.82
  });
  architectureAddAssetSocket(plan, {
    id: "market-stall-west", ownerId: "market-plinth", purpose: "exchange-bay-chassis",
    allowedSlugs: ["market-stall-chassis"],
    at: { x: -2.5, y: 0.4, z: 1.0 }, yaw: 0, scale: 1.15,
    fallback: { kind: "omit", reason: "the market hall must read before stalls furnish it" }
  });
  architectureAddAssetSocket(plan, {
    id: "market-stall-east", ownerId: "market-plinth", purpose: "exchange-bay-chassis",
    allowedSlugs: ["market-stall-chassis"],
    at: { x: 1.45, y: 0.4, z: 1.0 }, yaw: Math.PI, scale: 1.1,
    fallback: { kind: "omit", reason: "the market hall must read before stalls furnish it" }
  });
  architectureAddAccess(plan, "market-public-west", "public-apron-west", "clear-trading-floor", "walk", 3.0);
  architectureAddAccess(plan, "market-public-east", "public-apron-east", "clear-trading-floor", "walk", 3.0);
  architectureAddAccess(plan, "market-gallery-route", "clear-trading-floor", "upper-gallery", "stair", 1.15);
  return plan;
}

function architectureBuildGatehouse(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 20, y: 20 },
    primarySpatialSentence: "A pass-through road runs between occupied piers under a defended crossing.",
    programTopology: ["approach", "gate-passage", "guard-piers", "upper-crossing", "wall-walk", "exit"],
    constructionProfile: "fortified-masonry-with-timber-gateworks",
    visualLocks: ["true passage void", "unequal occupied masses", "supported upper crossing"],
    gameplayLocks: ["passage remains open", "upper route reachable", "portable defenses outside tread"]
  });
  architectureAddMember(plan, {
    id: "gate-road", role: "site-road", center: { x: 0, y: 0.04, z: 0 },
    size: { x: 3.2, y: 0.08, z: 14.5 }, rotation: { x: 0, y: 0, z: 0 },
    supportedBy: ["ground"], access: "walk"
  });
  architectureAddSlab(plan, "gate-west-plinth", { x: -3.2, z: 0 }, { x: 3.2, z: 6.2 },
    0.42, 0.42, "foundation", ["ground"], "walk");
  architectureAddSlab(plan, "gate-east-plinth", { x: 3.2, z: 0 }, { x: 3.2, z: 6.2 },
    0.42, 0.42, "foundation", ["ground"], "walk");
  [
    ["gate-west-back", { x: -4.8, z: -3.1 }, { x: -1.6, z: -3.1 }, "gate-west-plinth"],
    ["gate-west-outer", { x: -4.8, z: -3.1 }, { x: -4.8, z: 3.1 }, "gate-west-plinth"],
    ["gate-west-inner", { x: -1.6, z: -3.1 }, { x: -1.6, z: 3.1 }, "gate-west-plinth"],
    ["gate-east-back", { x: 1.6, z: -3.1 }, { x: 4.8, z: -3.1 }, "gate-east-plinth"],
    ["gate-east-outer", { x: 4.8, z: -3.1 }, { x: 4.8, z: 3.1 }, "gate-east-plinth"],
    ["gate-east-inner", { x: 1.6, z: -3.1 }, { x: 1.6, z: 3.1 }, "gate-east-plinth"]
  ].forEach(function(row){
    architectureAddWallRun(plan, {
      id: row[0], start: row[1], end: row[2], baseY: 0.42,
      height: row[0].indexOf("west") >= 0 ? 4.9 : 4.25, thickness: 0.42,
      supportedBy: [row[3]], cutawayGroup: row[0].indexOf("inner") >= 0 ? "passage-cutaway" : null,
      openings: row[0].indexOf("outer") >= 0 ? [{
        id: row[0] + ":arrow", station: 3.0, width: 0.42, bottom: 1.5, height: 1.0,
        kind: "arrow-slit", observation: true
      }] : []
    });
  });
  architectureAddSlab(plan, "gate-upper-crossing", { x: 0, z: -0.15 }, { x: 3.2, z: 3.0 },
    3.25, 0.34, "masonry-edge",
    ["gate-west-inner", "gate-east-inner"], "walk");
  [
    [{ x: -2.25, y: 2.2, z: -1.4 }, { x: -1.45, y: 3.18, z: -1.4 }],
    [{ x: 2.25, y: 2.2, z: -1.4 }, { x: 1.45, y: 3.18, z: -1.4 }],
    [{ x: -2.25, y: 2.2, z: 1.1 }, { x: -1.45, y: 3.18, z: 1.1 }],
    [{ x: 2.25, y: 2.2, z: 1.1 }, { x: 1.45, y: 3.18, z: 1.1 }]
  ].forEach(function(pair, index){
    architectureAddBeam3D(plan, "gate-crossing-corbels:" + index, pair[0], pair[1], 0.32,
      "masonry-edge", ["gate-west-inner", "gate-east-inner"],
      { ownerId: "gate-upper-crossing" });
  });
  architectureAddRunPrism(plan, "gate-crossing-north-parapet", { x: -1.6, z: -1.65 },
    { x: 1.6, z: -1.65 }, 3.25, 0.75, 0.34, "masonry-edge",
    ["gate-upper-crossing"], { ownerId: "gate-crossing-edge", cover: "half-cover" });
  architectureAddRunPrism(plan, "gate-crossing-south-parapet", { x: -1.6, z: 1.35 },
    { x: 1.6, z: 1.35 }, 3.25, 0.75, 0.34, "masonry-edge",
    ["gate-upper-crossing"], { ownerId: "gate-crossing-edge", cover: "half-cover" });
  architectureAddSlab(plan, "gate-west-walk", { x: -3.2, z: 0 }, { x: 3.05, z: 5.9 },
    4.95, 0.24, "masonry-edge", ["gate-west-back", "gate-west-outer", "gate-west-inner"], "walk");
  architectureAddSlab(plan, "gate-east-walk", { x: 3.2, z: 0 }, { x: 3.05, z: 5.9 },
    4.3, 0.24, "masonry-edge", ["gate-east-back", "gate-east-outer", "gate-east-inner"], "walk");
  architectureAddParapetRect(plan, "gate-west-parapet", { x: -3.2, z: 0 }, 3.0, 5.8,
    4.95, 0.7, 0.28, ["gate-west-walk"], "east");
  architectureAddParapetRect(plan, "gate-east-parapet", { x: 3.2, z: 0 }, 3.0, 5.8,
    4.3, 0.7, 0.28, ["gate-east-walk"], "west");
  architectureAddStair(plan, {
    id: "gate-west-stair", start: { x: -6.25, z: 2.65 }, end: { x: -4.55, z: -1.9 },
    baseY: 0, topY: 4.95, width: 1.25, steps: 12, upperLandingId: "gate-west-walk",
    supportedBy: ["ground"], cheeks: true
  });
  architectureAddStair(plan, {
    id: "gate-east-stair", start: { x: 6.1, z: 2.45 }, end: { x: 4.55, z: -1.45 },
    baseY: 0, topY: 4.3, width: 1.15, steps: 11, upperLandingId: "gate-east-walk",
    supportedBy: ["ground"], cheeks: true
  });
  plan.thresholds.push({
    id: "gate-passage", roadTangent: { x: 0, z: 1 }, roadNormal: { x: 1, z: 0 },
    clearWidth: 3.2, roadWidth: 3.2, state: "open", upperCrossingId: "gate-upper-crossing"
  });
  architectureAddAssetSocket(plan, {
    id: "gate-bell", ownerId: "gate-west-walk", purpose: "fortress-alarm",
    allowedSlugs: ["alarm-bell-yoke"], at: { x: -3.15, y: 5.0, z: -1.8 }, yaw: 0, scale: 0.9
  });
  architectureAddAssetSocket(plan, {
    id: "gate-gabion", ownerId: "gate-east-plinth", purpose: "field-repair-cover-outside-passage",
    allowedSlugs: ["gabion-stone-basket"], at: { x: 5.55, y: 0.05, z: 3.65 },
    yaw: Math.PI / 2, scale: 0.95
  });
  architectureAddAssetSocket(plan, {
    id: "gate-chevaux", ownerId: "gate-road", purpose: "portable-denial-outside-committed-tread",
    allowedSlugs: ["chevaux-de-frise"], at: { x: -4.15, y: 0.05, z: 4.65 },
    yaw: 0, scale: 0.86
  });
  plan.cutawayGroups.push({ id: "passage-cutaway", mode: "bearing-derived",
    preserves: ["passage", "pier-load", "collision"] });
  architectureAddAccess(plan, "gate-through", "approach", "exit", "walk", 3.2);
  architectureAddAccess(plan, "gate-west-route", "approach", "gate-west-walk", "stair", 1.25);
  architectureAddAccess(plan, "gate-east-route", "approach", "gate-east-walk", "stair", 1.15);
  architectureAddAccess(plan, "gate-crossing-route", "gate-west-walk", "gate-east-walk", "walk", 2.5);
  return plan;
}

function architectureBuildPartyWallFrontage(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 22, y: 22 },
    primarySpatialSentence: "Three narrow owners share party walls while retaining distinct public and service thresholds.",
    programTopology: ["street", "three-frontages", "public-thresholds", "upper-workrooms",
      "rear-service-lane"],
    constructionProfile: "masonry-party-walls-with-owned-timber-roofs",
    visualLocks: ["three ownership rhythms", "continuous street edge", "separate roof drainage"],
    gameplayLocks: ["two street continuations", "rear service route", "reachable upper room"]
  });
  architectureAddMember(plan, {
    id: "frontage-street", role: "site-road", center: { x: 0, y: 0.04, z: 4.6 },
    size: { x: 15.5, y: 0.08, z: 3.0 }, rotation: { x: 0, y: 0, z: 0 },
    supportedBy: ["ground"], access: "walk"
  });
  architectureAddSlab(plan, "frontage-plinth", { x: 0, z: 0 }, { x: 11.2, z: 6.3 },
    0.32, 0.32, "foundation", ["ground"], "walk");
  var units = [
    { id: "west", x0: -5.25, x1: -1.75, eave: 3.75, high: "west" },
    { id: "center", x0: -1.75, x1: 1.75, eave: 4.2, high: "east" },
    { id: "east", x0: 1.75, x1: 5.25, eave: 3.9, high: "west" }
  ];
  units.forEach(function(unit, index){
    var width = unit.x1 - unit.x0;
    architectureAddWallRun(plan, {
      id: "frontage-" + unit.id + "-public",
      start: { x: unit.x0, z: 2.75 }, end: { x: unit.x1, z: 2.75 },
      baseY: 0.32, height: unit.eave - 0.32, thickness: 0.3,
      supportedBy: ["frontage-plinth"],
      openings: [
        { id: "frontage-" + unit.id + "-door", station: 0.72, width: 0.95,
          bottom: 0, height: 1.8, kind: "door", access: "walk" },
        { id: "frontage-" + unit.id + "-display", station: 2.35, width: 1.25,
          bottom: 0.72, height: 1.05, kind: "display-window", observation: true }
      ]
    });
    architectureAddWallRun(plan, {
      id: "frontage-" + unit.id + "-rear",
      start: { x: unit.x1, z: -2.75 }, end: { x: unit.x0, z: -2.75 },
      baseY: 0.32, height: unit.eave - 0.32, thickness: 0.3,
      supportedBy: ["frontage-plinth"],
      openings: [{
        id: "frontage-" + unit.id + "-service-door", station: width * 0.5,
        width: 0.85, bottom: 0, height: 1.72, kind: "service-door", access: "walk"
      }]
    });
    architectureAddSlab(plan, "frontage-" + unit.id + "-upper-floor",
      { x: (unit.x0 + unit.x1) / 2, z: -0.25 }, { x: width - 0.28, z: 4.75 },
      2.32, 0.2, "timber-surface",
      ["frontage-" + unit.id + "-public", "frontage-" + unit.id + "-rear"], "walk");
    architectureAddShedRoof(plan, {
      id: "frontage-" + unit.id + "-roof",
      center: { x: (unit.x0 + unit.x1) / 2, z: 0 }, width: width + 0.15, depth: 5.7,
      eaveY: unit.eave, pitchDeg: 13 + index * 2, highEdge: unit.high,
      overhang: 0.28, thickness: 0.17, enclosure: "enclosed",
      supportedBy: ["frontage-" + unit.id + "-public", "frontage-" + unit.id + "-rear"],
      endInfills: [{
        id: "frontage-" + unit.id + "-roof:north-infill", side: "north", at: -2.75,
        runLength: width, wallTopY: unit.eave, thickness: 0.3,
        supportedBy: ["frontage-" + unit.id + "-rear"],
        ownerId: "frontage-" + unit.id + "-rear"
      }, {
        id: "frontage-" + unit.id + "-roof:south-infill", side: "south", at: 2.75,
        runLength: width, wallTopY: unit.eave, thickness: 0.3,
        supportedBy: ["frontage-" + unit.id + "-public"],
        ownerId: "frontage-" + unit.id + "-public"
      }],
      edgeInfills: [{
        id: "frontage-" + unit.id + "-roof:west-infill", edge: "west",
        wallTopY: unit.eave, spanLength: 5.5, thickness: 0.34,
        supportedBy: ["frontage-party-wall-" + index],
        ownerId: "frontage-party-wall-" + index
      }, {
        id: "frontage-" + unit.id + "-roof:east-infill", edge: "east",
        wallTopY: unit.eave, spanLength: 5.5, thickness: 0.34,
        supportedBy: ["frontage-party-wall-" + (index + 1)],
        ownerId: "frontage-party-wall-" + (index + 1)
      }]
    });
  });
  [-5.25, -1.75, 1.75, 5.25].forEach(function(x, index){
    architectureAddWallRun(plan, {
      id: "frontage-party-wall-" + index,
      start: { x: x, z: -2.75 }, end: { x: x, z: 2.75 },
      baseY: 0.32, height: index === 2 ? 3.88 : 3.48, thickness: 0.34,
      supportedBy: ["frontage-plinth"]
    });
  });
  architectureAddStair(plan, {
    id: "frontage-rear-stair", start: { x: 0, z: -4.2 }, end: { x: 0, z: -1.45 },
    baseY: 0.04, topY: 2.32, width: 1.05, steps: 8,
    upperLandingId: "frontage-center-upper-floor", supportedBy: ["ground", "frontage-plinth"],
    cheeks: true, role: "timber-surface"
  });
  architectureAddAssetSocket(plan, {
    id: "frontage-market-stall", ownerId: "frontage-plinth", purpose: "licensed-street-trade-bay",
    allowedSlugs: ["market-stall-chassis"], at: { x: -3.4, y: 0.34, z: 3.45 },
    yaw: Math.PI, scale: 0.86
  });
  architectureAddAssetSocket(plan, {
    id: "frontage-service-cart", ownerId: "frontage-plinth", purpose: "rear-supply-and-waste-route",
    allowedSlugs: [], promotionCandidates: [{
      jobId: "M020-A", intendedSlug: "two-wheel-handcart",
      purpose: "prove parking/tow orientation without owning the service route"
    }],
    at: { x: 3.6, y: 0.06, z: -3.65 }, yaw: Math.PI / 2, scale: 0.9,
    fallback: { kind: "omit", reason: "service lane and thresholds remain engine-owned" }
  });
  architectureAddAccess(plan, "frontage-street-through", "street-west", "street-east", "walk", 3.0);
  architectureAddAccess(plan, "frontage-service-through", "service-west", "service-east", "walk", 1.5);
  architectureAddAccess(plan, "frontage-upper-route", "rear-service-lane", "center-upper-workroom",
    "stair", 1.05);
  return plan;
}

function architectureBuildKeeperCellBlock(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 22, y: 22 },
    primarySpatialSentence: "A raised keeper landing controls four real cells, intake, property, and a rear service release.",
    programTopology: ["public-intake", "keeper-landing", "secure-corridor", "four-cells",
      "property-store", "rear-service-release"],
    constructionProfile: "masonry-custody-shell-with-timber-control-landing",
    visualLocks: ["keeper oversees cell thresholds", "cells are apertures not labels",
      "service release differs from public intake"],
    gameplayLocks: ["secure corridor", "four capacity cells", "property circuit",
      "inside and outside route opportunities"]
  });
  architectureAddSlab(plan, "custody-plinth", { x: 0, z: 0 }, { x: 10.8, z: 8.0 },
    0.36, 0.36, "foundation", ["ground"], "walk");
  architectureAddWallRun(plan, {
    id: "custody-back-wall", start: { x: -5.4, z: -4 }, end: { x: 5.4, z: -4 },
    baseY: 0.36, height: 2.8, thickness: 0.38, supportedBy: ["custody-plinth"],
    openings: [{
      id: "custody-rear-release", station: 9.45, width: 0.9, bottom: 0,
      height: 1.75, kind: "secure-service-door", access: "controlled"
    }]
  });
  architectureAddWallRun(plan, {
    id: "custody-west-wall", start: { x: -5.4, z: -4 }, end: { x: -5.4, z: 4 },
    baseY: 0.36, height: 2.8, thickness: 0.38, supportedBy: ["custody-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "custody-east-wall", start: { x: 5.4, z: 4 }, end: { x: 5.4, z: -4 },
    baseY: 0.36, height: 2.8, thickness: 0.38, supportedBy: ["custody-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "custody-intake-wall", start: { x: -5.4, z: 4 }, end: { x: 5.4, z: 4 },
    baseY: 0.36, height: 2.35, thickness: 0.34, supportedBy: ["custody-plinth"],
    openings: [
      { id: "custody-public-door", station: 1.35, width: 1.05, bottom: 0,
        height: 1.82, kind: "public-door", access: "walk" },
      { id: "custody-intake-window", station: 4.4, width: 1.55, bottom: 0.8,
        height: 0.9, kind: "intake-window", observation: true },
      { id: "custody-property-door", station: 8.55, width: 0.9, bottom: 0,
        height: 1.72, kind: "property-door", access: "controlled" }
    ]
  });
  var cellWidth = 2.35;
  architectureAddWallRun(plan, {
    id: "custody-cell-front", start: { x: -4.7, z: -1.05 }, end: { x: 4.7, z: -1.05 },
    baseY: 0.36, height: 2.45, thickness: 0.32, role: "masonry-wall",
    supportedBy: ["custody-plinth"],
    openings: [0, 1, 2, 3].map(function(index){
      return {
        id: "custody-cell-door-" + index, station: 0.92 + index * cellWidth,
        width: 0.82, bottom: 0, height: 1.72, kind: "barred-cell-door", access: "controlled"
      };
    })
  });
  [-4.7, -2.35, 0, 2.35, 4.7].forEach(function(x, index){
    architectureAddWallRun(plan, {
      id: "custody-cell-partition-" + index,
      start: { x: x, z: -4 }, end: { x: x, z: -1.05 },
      baseY: 0.36, height: 2.45, thickness: 0.28, supportedBy: ["custody-plinth"]
    });
  });
  [0, 1, 2, 3].forEach(function(cell){
    var cx = -3.525 + cell * cellWidth;
    [-0.24, 0, 0.24].forEach(function(offset, bar){
      architectureAddBox(plan, "custody-cell-bars-" + cell + ":" + bar,
        { x: cx + offset, y: 1.22, z: -1.02 }, { x: 0.08, y: 1.72, z: 0.1 },
        "metal-mechanism", ["custody-cell-front"], { ownerId: "custody-cell-door-" + cell });
    });
  });
  architectureAddSlab(plan, "custody-keeper-landing", { x: 0, z: 1.2 }, { x: 5.4, z: 1.8 },
    0.82, 0.22, "timber-surface", ["custody-plinth"], "walk");
  architectureAddStair(plan, {
    id: "custody-landing-stair", start: { x: -3.3, z: 2.2 }, end: { x: -2.2, z: 1.2 },
    baseY: 0.36, topY: 0.82, width: 1.0, steps: 4,
    upperLandingId: "custody-keeper-landing", supportedBy: ["custody-plinth"],
    cheeks: false, role: "timber-surface"
  });
  architectureAddShedRoof(plan, {
    id: "custody-cell-roof", center: { x: 0, z: -2.5 }, width: 10.9, depth: 3.4,
    eaveY: 3.2, pitchDeg: 11, highEdge: "north", overhang: 0.25, thickness: 0.18,
    enclosure: "enclosed",
    supportedBy: ["custody-back-wall", "custody-cell-front"],
    endInfills: [{
      id: "custody-cell-roof:west-infill", side: "west", at: -5.4,
      runLength: 2.95, wallTopY: 3.16, thickness: 0.38,
      supportedBy: ["custody-west-wall"], ownerId: "custody-west-wall"
    }, {
      id: "custody-cell-roof:east-infill", side: "east", at: 5.4,
      runLength: 2.95, wallTopY: 3.16, thickness: 0.38,
      supportedBy: ["custody-east-wall"], ownerId: "custody-east-wall"
    }],
    edgeInfills: [{
      id: "custody-cell-roof:north-crown", edge: "north", wallTopY: 3.16,
      spanLength: 10.8, thickness: 0.38,
      supportedBy: ["custody-back-wall"], ownerId: "custody-back-wall"
    }, {
      id: "custody-cell-roof:south-crown", edge: "south", wallTopY: 2.81,
      spanLength: 9.4, thickness: 0.32,
      supportedBy: ["custody-cell-front"], ownerId: "custody-cell-front"
    }]
  });
  architectureAddShedRoof(plan, {
    id: "custody-intake-roof", center: { x: 0, z: 2.6 }, width: 10.9, depth: 2.9,
    eaveY: 2.75, pitchDeg: 9, highEdge: "south", overhang: 0.25, thickness: 0.18,
    enclosure: "partial",
    supportedBy: ["custody-intake-wall", "custody-east-wall", "custody-west-wall"],
    endInfills: [{
      id: "custody-intake-roof:west-infill", side: "west", at: -5.4,
      runLength: 2.9, wallTopY: 3.16, thickness: 0.38,
      supportedBy: ["custody-west-wall"], ownerId: "custody-west-wall"
    }, {
      id: "custody-intake-roof:east-infill", side: "east", at: 5.4,
      runLength: 2.9, wallTopY: 3.16, thickness: 0.38,
      supportedBy: ["custody-east-wall"], ownerId: "custody-east-wall"
    }],
    edgeInfills: [{
      id: "custody-intake-roof:south-crown", edge: "south", wallTopY: 2.71,
      spanLength: 10.8, thickness: 0.34,
      supportedBy: ["custody-intake-wall"], ownerId: "custody-intake-wall"
    }]
  });
  architectureAddAssetSocket(plan, {
    id: "custody-records", ownerId: "custody-keeper-landing", purpose: "intake-and-case-records",
    allowedSlugs: ["archive-lectern"], at: { x: 1.25, y: 0.84, z: 1.25 },
    yaw: Math.PI, scale: 0.86
  });
  architectureAddAssetSocket(plan, {
    id: "custody-debtors-pen", ownerId: "custody-plinth", purpose: "temporary-holding-overflow",
    allowedSlugs: ["timber-holding-cage"], at: { x: 4.15, y: 0.38, z: 2.1 },
    yaw: Math.PI / 2, scale: 0.9
  });
  architectureAddAccess(plan, "custody-intake-route", "public-intake", "keeper-landing", "stair", 1.0);
  architectureAddAccess(plan, "custody-control-route", "keeper-landing", "secure-corridor", "walk", 1.35);
  architectureAddAccess(plan, "custody-release-route", "secure-corridor", "rear-service-release",
    "controlled", 0.9);
  return plan;
}

function architectureBuildShaftHead(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 20, y: 20 },
    primarySpatialSentence: "A raised four-sided landing leaves a true central shaft beneath a supported hoist frame.",
    programTopology: ["haul-approach", "raised-landing", "shaft-void", "hoist-frame",
      "operator-side", "spoil-exit"],
    constructionProfile: "masonry-shaft-curb-with-heavy-timber-headframe",
    visualLocks: ["central void remains open", "hoist bearings span the shaft", "haul line reaches landing"],
    gameplayLocks: ["safe landing edge", "operator side", "cart approach", "vertical hazard"]
  });
  architectureAddMember(plan, {
    id: "shaft-haul-road", role: "site-road", center: { x: 0, y: 0.04, z: 4.2 },
    size: { x: 3.3, y: 0.08, z: 8.8 }, rotation: { x: 0, y: 0, z: 0 },
    supportedBy: ["ground"], access: "walk"
  });
  [
    ["north", { x: 0, z: -2.2 }, { x: 7.2, z: 2.0 }],
    ["south", { x: 0, z: 2.2 }, { x: 7.2, z: 2.0 }],
    ["west", { x: -2.3, z: 0 }, { x: 2.0, z: 2.4 }],
    ["east", { x: 2.3, z: 0 }, { x: 2.0, z: 2.4 }]
  ].forEach(function(row){
    architectureAddBox(plan, "shaft-platform-" + row[0],
      { x: row[1].x, y: 0.62, z: row[1].z },
      { x: row[2].x, y: 0.24, z: row[2].z }, "timber-surface",
      ["shaft-foundation-" + row[0]], { access: "walk" });
    architectureAddBox(plan, "shaft-foundation-" + row[0],
      { x: row[1].x, y: 0.3, z: row[1].z },
      { x: row[2].x, y: 0.6, z: row[2].z }, "foundation", ["ground"]);
  });
  architectureAddBox(plan, "shaft-dark-depth",
    { x: 0, y: 0.08, z: 0 }, { x: 2.55, y: 0.14, z: 2.55 },
    "metal-mechanism", ["ground"], { access: "hazard" });
  [
    ["north", { x: -1.45, z: -1.45 }, { x: 1.45, z: -1.45 }],
    ["south", { x: 1.45, z: 1.45 }, { x: -1.45, z: 1.45 }],
    ["west", { x: -1.45, z: 1.45 }, { x: -1.45, z: -1.45 }],
    ["east", { x: 1.45, z: -1.45 }, { x: 1.45, z: 1.45 }]
  ].forEach(function(row){
    architectureAddRunPrism(plan, "shaft-curb-" + row[0], row[1], row[2],
      0.74, 0.58, 0.34, "masonry-edge", ["shaft-platform-" + row[0]],
      { cover: "half-cover" });
  });
  architectureAddPosts(plan, "shaft-headframe-posts", [
    { x: -2.2, z: -1.8 }, { x: 2.2, z: -1.8 }, { x: -2.2, z: 1.8 }, { x: 2.2, z: 1.8 }
  ], 0.74, 4.2, 0.44, "timber-structure",
  ["shaft-platform-north", "shaft-platform-south", "shaft-platform-west", "shaft-platform-east"]);
  architectureAddRunPrism(plan, "shaft-headframe-west-cap",
    { x: -2.2, z: -1.8 }, { x: -2.2, z: 1.8 }, 4.7, 0.38, 0.4,
    "timber-structure", ["shaft-headframe-posts"]);
  architectureAddRunPrism(plan, "shaft-headframe-east-cap",
    { x: 2.2, z: -1.8 }, { x: 2.2, z: 1.8 }, 4.7, 0.38, 0.4,
    "timber-structure", ["shaft-headframe-posts"]);
  architectureAddRunPrism(plan, "shaft-hoist-bearing",
    { x: -2.35, z: 0 }, { x: 2.35, z: 0 }, 3.75, 0.46, 0.46,
    "timber-structure", ["shaft-headframe-posts"]);
  architectureAddBeam3D(plan, "shaft-west-brace",
    { x: -2.2, y: 0.9, z: 1.8 }, { x: -2.2, y: 4.75, z: -1.8 },
    0.24, "timber-structure", ["shaft-headframe-posts"]);
  architectureAddBeam3D(plan, "shaft-east-brace",
    { x: 2.2, y: 0.9, z: -1.8 }, { x: 2.2, y: 4.75, z: 1.8 },
    0.24, "timber-structure", ["shaft-headframe-posts"]);
  architectureAddStair(plan, {
    id: "shaft-landing-stair", start: { x: -3.3, z: 3.65 }, end: { x: -2.25, z: 2.15 },
    baseY: 0.04, topY: 0.74, width: 1.1, steps: 5,
    upperLandingId: "shaft-platform-south", supportedBy: ["ground", "shaft-foundation-south"],
    cheeks: true, role: "timber-surface"
  });
  [-0.62, 0.62].forEach(function(x, index){
    architectureAddRunPrism(plan, "shaft-rail-" + index,
      { x: x, z: 7.8 }, { x: x, z: 2.7 }, 0.11, 0.12, 0.12,
      "metal-mechanism", ["ground", "shaft-haul-road"]);
  });
  architectureAddAssetSocket(plan, {
    id: "shaft-windlass", ownerId: "shaft-hoist-bearing", purpose: "shaft-lifting-mechanism",
    allowedSlugs: ["hand-windlass"], at: { x: 0, y: 3.95, z: 0 },
    yaw: 0, scale: 1.0
  });
  architectureAddAssetSocket(plan, {
    id: "shaft-ore-cart", ownerId: "shaft-haul-road", purpose: "haul-circuit-witness",
    allowedSlugs: [], promotionCandidates: [{
      jobId: "M021-A", intendedSlug: "mine-ore-cart",
      purpose: "prove rail registration and containment collision"
    }],
    at: { x: 0, y: 0.08, z: 5.5 }, yaw: 0, scale: 0.9,
    fallback: { kind: "omit", reason: "rails and shaft circuit remain legible without a cart" }
  });
  architectureAddAccess(plan, "shaft-haul-route", "haul-approach", "raised-landing", "stair", 1.1);
  architectureAddAccess(plan, "shaft-operator-route", "raised-landing", "operator-side", "walk", 1.2);
  return plan;
}

function architectureBuildTerracedCommune(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 22, y: 22 },
    primarySpatialSentence: "Three offset construction terraces climb to a communal hall while one court and two circulation paths remain continuous.",
    programTopology: ["formal-arrival", "lower-gallery", "middle-court", "service-ascent",
      "upper-hall", "authority-deck"],
    constructionProfile: "terraced-masonry-substructure-with-timber-communal-ranges",
    visualLocks: ["offset datums not ziggurat rings", "court remains open", "upper hall crowns ascent"],
    gameplayLocks: ["two ascent routes", "reachable authority deck", "retaining edges give cover"]
  });
  architectureAddSlab(plan, "commune-lower-terrace", { x: 0, z: 2.7 }, { x: 12.5, z: 5.8 },
    0.35, 0.35, "foundation", ["ground"], "walk");
  architectureAddSlab(plan, "commune-middle-terrace", { x: 0.6, z: -0.55 }, { x: 10.8, z: 4.4 },
    1.55, 1.55, "foundation", ["ground"], "walk");
  architectureAddSlab(plan, "commune-upper-terrace", { x: 1.35, z: -3.15 }, { x: 8.3, z: 3.2 },
    2.85, 2.85, "foundation", ["ground"], "walk");
  architectureAddWallRun(plan, {
    id: "commune-middle-retaining", start: { x: -4.8, z: 1.65 }, end: { x: 6.0, z: 1.65 },
    baseY: 0.35, height: 1.2, thickness: 0.42, role: "masonry-wall",
    supportedBy: ["commune-lower-terrace"],
    openings: [{
      id: "commune-lower-passage", station: 5.15, width: 1.35, bottom: 0,
      height: 1.1, kind: "covered-passage", access: "walk"
    }]
  });
  architectureAddWallRun(plan, {
    id: "commune-upper-retaining", start: { x: -2.8, z: -1.55 }, end: { x: 5.5, z: -1.55 },
    baseY: 1.55, height: 1.3, thickness: 0.42, role: "masonry-wall",
    supportedBy: ["commune-middle-terrace"]
  });
  architectureAddPosts(plan, "commune-lower-gallery-posts", [
    { x: -5.3, z: 3.9 }, { x: -2.65, z: 3.9 }, { x: 0, z: 3.9 }
  ], 0.35, 2.35, 0.38, "timber-structure", ["commune-lower-terrace"]);
  architectureAddWallRun(plan, {
    id: "commune-lower-range-back", start: { x: -5.8, z: 1.9 }, end: { x: 0.6, z: 1.9 },
    baseY: 0.35, height: 2.05, thickness: 0.32, supportedBy: ["commune-lower-terrace"],
    openings: [{
      id: "commune-service-door", station: 4.8, width: 1.0, bottom: 0,
      height: 1.7, kind: "service-door", access: "walk"
    }]
  });
  architectureAddShedRoof(plan, {
    id: "commune-lower-gallery-roof", center: { x: -2.6, z: 2.9 },
    width: 6.9, depth: 2.5, eaveY: 2.48, pitchDeg: 12, highEdge: "north",
    overhang: 0.3, thickness: 0.17, enclosure: "partial",
    supportedBy: ["commune-lower-gallery-posts", "commune-lower-range-back"],
    edgeInfills: [{
      id: "commune-lower-gallery-roof:north-crown", edge: "north", wallTopY: 2.4,
      spanLength: 6.4, thickness: 0.32,
      supportedBy: ["commune-lower-range-back"], ownerId: "commune-lower-range-back"
    }]
  });
  architectureAddWallRun(plan, {
    id: "commune-upper-hall-back", start: { x: -2.8, z: -4.6 }, end: { x: 5.5, z: -4.6 },
    baseY: 2.85, height: 2.55, thickness: 0.38, supportedBy: ["commune-upper-terrace"],
    openings: [{
      id: "commune-archive-window", station: 4.25, width: 1.6, bottom: 0.78,
      height: 1.05, kind: "archive-window", observation: true
    }]
  });
  architectureAddWallRun(plan, {
    id: "commune-upper-hall-west", start: { x: -2.8, z: -4.6 }, end: { x: -2.8, z: -1.8 },
    baseY: 2.85, height: 2.55, thickness: 0.38, supportedBy: ["commune-upper-terrace"]
  });
  architectureAddWallRun(plan, {
    id: "commune-upper-hall-east", start: { x: 5.5, z: -1.8 }, end: { x: 5.5, z: -4.6 },
    baseY: 2.85, height: 2.55, thickness: 0.38, supportedBy: ["commune-upper-terrace"]
  });
  architectureAddPosts(plan, "commune-upper-front-posts", [
    { x: -2.5, z: -1.95 }, { x: 1.35, z: -1.95 }, { x: 5.2, z: -1.95 }
  ], 2.85, 2.55, 0.42, "timber-structure", ["commune-upper-terrace"]);
  architectureAddGableRoof(plan, {
    id: "commune-upper-hall-roof", center: { x: 1.35, z: -3.2 }, width: 8.9, depth: 3.4,
    eaveY: 5.5, pitchDeg: 25, overhang: 0.35, thickness: 0.19,
    enclosure: "partial",
    supportedBy: ["commune-upper-hall-back", "commune-upper-front-posts"],
    endInfills: [{
      id: "commune-upper-hall-roof:north-infill", side: "north", at: -4.6,
      width: 8.3, wallTopY: 5.4, thickness: 0.38,
      supportedBy: ["commune-upper-hall-back"], ownerId: "commune-upper-hall-back"
    }]
  });
  architectureAddStair(plan, {
    id: "commune-formal-stair", start: { x: 3.7, z: 5.4 }, end: { x: 3.7, z: 0.75 },
    baseY: 0.35, topY: 1.55, width: 1.35, steps: 7,
    upperLandingId: "commune-middle-terrace", supportedBy: ["commune-lower-terrace"],
    cheeks: true, role: "masonry-edge"
  });
  architectureAddStair(plan, {
    id: "commune-upper-stair", start: { x: -2.8, z: 0.9 }, end: { x: -1.35, z: -2.15 },
    baseY: 1.55, topY: 2.85, width: 1.15, steps: 7,
    upperLandingId: "commune-upper-terrace", supportedBy: ["commune-middle-terrace"],
    cheeks: true, role: "masonry-edge"
  });
  architectureAddStair(plan, {
    id: "commune-service-stair", start: { x: 6.4, z: 1.2 }, end: { x: 5.25, z: -2.25 },
    baseY: 1.55, topY: 2.85, width: 0.95, steps: 7,
    upperLandingId: "commune-upper-terrace", supportedBy: ["commune-middle-terrace"],
    cheeks: false, role: "timber-surface"
  });
  architectureAddParapetRect(plan, "commune-authority-edge", { x: 1.35, z: -3.15 },
    8.1, 3.0, 2.85, 0.62, 0.22, ["commune-upper-terrace"], "south");
  architectureAddAssetSocket(plan, {
    id: "commune-bell", ownerId: "commune-upper-front-posts", purpose: "shared-time-and-alarm",
    allowedSlugs: ["alarm-bell-yoke"], at: { x: 4.3, y: 4.7, z: -1.9 },
    yaw: 0, scale: 0.8
  });
  architectureAddAssetSocket(plan, {
    id: "commune-archive", ownerId: "commune-upper-terrace", purpose: "knowledge-authority",
    allowedSlugs: ["archive-lectern"], at: { x: 1.35, y: 2.9, z: -3.55 },
    yaw: 0, scale: 0.82
  });
  architectureAddAccess(plan, "commune-formal-ascent", "formal-arrival", "middle-court", "stair", 1.35);
  architectureAddAccess(plan, "commune-procession", "middle-court", "upper-hall", "stair", 1.15);
  architectureAddAccess(plan, "commune-service-ascent", "service-edge", "upper-hall", "stair", 0.95);
  return plan;
}

function architectureBuildBridgehouse(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 22, y: 22 },
    primarySpatialSentence: "A public bridge crosses a real water band beside an occupied water-work carried by separate bearings.",
    programTopology: ["south-bank", "public-crossing", "bridgehouse", "water-wheel",
      "service-deck", "north-bank"],
    constructionProfile: "masonry-river-piers-with-timber-bridgehouse-and-wheel",
    visualLocks: ["water remains continuous", "public tread remains open",
      "wheel connects to occupied work volume"],
    gameplayLocks: ["two-bank continuation", "bridge cover", "service flank", "water hazard"]
  });
  architectureAddMember(plan, {
    id: "bridge-water-band", role: "site-water", center: { x: 0, y: 0.03, z: 0 },
    size: { x: 15.0, y: 0.06, z: 5.2 }, rotation: { x: 0, y: 0, z: 0 },
    supportedBy: ["ground"], access: "hazard"
  });
  architectureAddSlab(plan, "bridge-south-bank", { x: 0, z: 4.4 }, { x: 14.5, z: 3.4 },
    0.34, 0.34, "site-earthwork", ["ground"], "walk");
  architectureAddSlab(plan, "bridge-north-bank", { x: 0, z: -4.4 }, { x: 14.5, z: 3.4 },
    0.62, 0.62, "site-earthwork", ["ground"], "walk");
  [-2.1, 2.1].forEach(function(z, index){
    architectureAddBox(plan, "bridge-river-pier-" + index,
      { x: 0, y: 0.58, z: z }, { x: 3.15, y: 1.16, z: 0.95 },
      "foundation", ["ground"], { cover: "full-cover" });
  });
  architectureAddBox(plan, "bridge-public-deck",
    { x: 0, y: 1.02, z: 0 }, { x: 2.7, y: 0.28, z: 8.6 },
    "timber-surface", ["bridge-river-pier-0", "bridge-river-pier-1"],
    { access: "walk" });
  architectureAddRunPrism(plan, "bridge-west-rail",
    { x: -1.35, z: -4.25 }, { x: -1.35, z: 4.25 }, 1.14, 0.72, 0.18,
    "timber-structure", ["bridge-public-deck"], { cover: "half-cover" });
  architectureAddRunPrism(plan, "bridge-east-rail-north",
    { x: 1.35, z: -4.25 }, { x: 1.35, z: -1.25 }, 1.14, 0.72, 0.18,
    "timber-structure", ["bridge-public-deck"], { cover: "half-cover" });
  architectureAddRunPrism(plan, "bridge-east-rail-south",
    { x: 1.35, z: 1.35 }, { x: 1.35, z: 4.25 }, 1.14, 0.72, 0.18,
    "timber-structure", ["bridge-public-deck"], { cover: "half-cover" });
  architectureAddBox(plan, "bridgehouse-work-deck",
    { x: 3.25, y: 1.02, z: 0 }, { x: 3.5, y: 0.28, z: 4.2 },
    "timber-surface", ["bridge-river-pier-0", "bridge-river-pier-1"],
    { access: "walk" });
  architectureAddWallRun(plan, {
    id: "bridgehouse-east-wall", start: { x: 4.9, z: -2.05 }, end: { x: 4.9, z: 2.05 },
    baseY: 1.16, height: 2.65, thickness: 0.3,
    supportedBy: ["bridgehouse-work-deck"],
    openings: [{
      id: "bridgehouse-wheel-window", station: 2.05, width: 1.25, bottom: 0.65,
      height: 1.1, kind: "machinery-opening", observation: true
    }]
  });
  architectureAddWallRun(plan, {
    id: "bridgehouse-north-wall", start: { x: 1.55, z: -2.05 }, end: { x: 4.9, z: -2.05 },
    baseY: 1.16, height: 2.65, thickness: 0.3,
    supportedBy: ["bridgehouse-work-deck"]
  });
  architectureAddWallRun(plan, {
    id: "bridgehouse-south-wall", start: { x: 4.9, z: 2.05 }, end: { x: 1.55, z: 2.05 },
    baseY: 1.16, height: 2.65, thickness: 0.3,
    supportedBy: ["bridgehouse-work-deck"],
    openings: [{
      id: "bridgehouse-service-door", station: 1.65, width: 1.0, bottom: 0,
      height: 1.75, kind: "service-door", access: "walk"
    }]
  });
  architectureAddPosts(plan, "bridgehouse-crossing-posts", [
    { x: 1.65, z: -1.75 }, { x: 1.65, z: 1.75 }
  ], 1.16, 2.65, 0.36, "timber-structure", ["bridgehouse-work-deck"]);
  architectureAddShedRoof(plan, {
    id: "bridgehouse-roof", center: { x: 3.25, z: 0 }, width: 3.9, depth: 4.6,
    eaveY: 3.95, pitchDeg: 18, highEdge: "east", overhang: 0.28, thickness: 0.18,
    enclosure: "partial",
    supportedBy: ["bridgehouse-east-wall", "bridgehouse-crossing-posts"],
    endInfills: [{
      id: "bridgehouse-roof:north-infill", side: "north", at: -2.05,
      runLength: 3.35, wallTopY: 3.81, thickness: 0.3,
      supportedBy: ["bridgehouse-north-wall"], ownerId: "bridgehouse-north-wall"
    }, {
      id: "bridgehouse-roof:south-infill", side: "south", at: 2.05,
      runLength: 3.35, wallTopY: 3.81, thickness: 0.3,
      supportedBy: ["bridgehouse-south-wall"], ownerId: "bridgehouse-south-wall"
    }],
    edgeInfills: [{
      id: "bridgehouse-roof:east-crown", edge: "east", wallTopY: 3.81,
      spanLength: 4.1, thickness: 0.3,
      supportedBy: ["bridgehouse-east-wall"], ownerId: "bridgehouse-east-wall"
    }]
  });
  architectureAddRunPrism(plan, "bridgehouse-wheel-axle",
    { x: 3.8, z: 0 }, { x: 6.25, z: 0 }, 2.25, 0.28, 0.28,
    "metal-mechanism", ["bridgehouse-east-wall"]);
  var wheelCenter = { x: 6.05, y: 2.39, z: 0 };
  var wheelRadius = 1.55, wheelPoints = [];
  for(var spoke = 0; spoke < 8; spoke++){
    var angle = spoke * Math.PI / 4;
    var point = {
      x: wheelCenter.x,
      y: wheelCenter.y + Math.cos(angle) * wheelRadius,
      z: wheelCenter.z + Math.sin(angle) * wheelRadius
    };
    wheelPoints.push(point);
    architectureAddBeam3D(plan, "bridgehouse-wheel-spoke-" + spoke,
      wheelCenter, point, 0.16, "timber-structure", ["bridgehouse-wheel-axle"],
      { ownerId: "bridgehouse-water-wheel" });
  }
  wheelPoints.forEach(function(point, index){
    architectureAddBeam3D(plan, "bridgehouse-wheel-rim-" + index,
      point, wheelPoints[(index + 1) % wheelPoints.length], 0.18,
      "timber-structure", ["bridgehouse-wheel-axle"],
      { ownerId: "bridgehouse-water-wheel" });
  });
  architectureAddAssetSocket(plan, {
    id: "bridgehouse-winch", ownerId: "bridgehouse-work-deck", purpose: "sluice-and-load-control",
    allowedSlugs: ["hand-windlass"], at: { x: 3.25, y: 1.18, z: -0.7 },
    yaw: Math.PI / 2, scale: 0.8
  });
  architectureAddAccess(plan, "bridge-public-crossing", "south-bank", "north-bank", "walk", 2.7);
  architectureAddAccess(plan, "bridge-service-route", "public-crossing", "service-deck", "walk", 1.2);
  return plan;
}

function architectureBuildInnManor(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 22, y: 22 },
    primarySpatialSentence: "A hip-roofed two-storey venue separates public arrival, service court, and an occupied upper floor.",
    programTopology: ["public-apron", "common-room", "host-position", "service-threshold",
      "service-court", "upper-rooms"],
    constructionProfile: "plastered-masonry-ground-with-timber-upper-and-true-hip-roof",
    visualLocks: ["four draining roof faces", "public and service doors differ",
      "upper floor reads as occupied volume"],
    gameplayLocks: ["two exits", "reachable upper floor", "clear common room", "service circuit"]
  });
  architectureAddSlab(plan, "inn-plinth", { x: 0, z: 0 }, { x: 10.2, z: 7.2 },
    0.34, 0.34, "foundation", ["ground"], "walk");
  architectureAddWallRun(plan, {
    id: "inn-front-wall", start: { x: -5.1, z: 3.6 }, end: { x: 5.1, z: 3.6 },
    baseY: 0.34, height: 4.55, thickness: 0.36, supportedBy: ["inn-plinth"],
    openings: [
      { id: "inn-public-door", station: 2.0, width: 1.3, bottom: 0,
        height: 1.95, kind: "public-door", access: "walk" },
      { id: "inn-common-window", station: 5.0, width: 2.0, bottom: 0.82,
        height: 1.05, kind: "public-window", observation: true },
      { id: "inn-upper-window-front", station: 7.85, width: 1.25, bottom: 2.75,
        height: 1.0, kind: "upper-window", observation: true }
    ]
  });
  architectureAddWallRun(plan, {
    id: "inn-rear-wall", start: { x: 5.1, z: -3.6 }, end: { x: -5.1, z: -3.6 },
    baseY: 0.34, height: 4.55, thickness: 0.36, supportedBy: ["inn-plinth"],
    openings: [
      { id: "inn-service-door", station: 1.55, width: 1.0, bottom: 0,
        height: 1.8, kind: "service-door", access: "walk" },
      { id: "inn-upper-window-rear", station: 6.6, width: 1.15, bottom: 2.7,
        height: 0.95, kind: "upper-window", observation: true }
    ]
  });
  architectureAddWallRun(plan, {
    id: "inn-west-wall", start: { x: -5.1, z: -3.6 }, end: { x: -5.1, z: 3.6 },
    baseY: 0.34, height: 4.55, thickness: 0.36, supportedBy: ["inn-plinth"],
    openings: [{
      id: "inn-west-window", station: 3.8, width: 1.35, bottom: 0.8,
      height: 1.0, kind: "common-window", observation: true
    }]
  });
  architectureAddWallRun(plan, {
    id: "inn-east-wall", start: { x: 5.1, z: 3.6 }, end: { x: 5.1, z: -3.6 },
    baseY: 0.34, height: 4.55, thickness: 0.36, supportedBy: ["inn-plinth"],
    openings: [{
      id: "inn-east-upper-window", station: 3.7, width: 1.2, bottom: 2.7,
      height: 0.95, kind: "upper-window", observation: true
    }]
  });
  architectureAddSlab(plan, "inn-upper-floor", { x: 0, z: -0.15 }, { x: 9.55, z: 6.65 },
    2.62, 0.22, "timber-surface",
    ["inn-front-wall", "inn-rear-wall", "inn-west-wall", "inn-east-wall"], "walk");
  architectureAddWallRun(plan, {
    id: "inn-service-spine", start: { x: 1.45, z: -3.25 }, end: { x: 1.45, z: 2.25 },
    baseY: 0.34, height: 2.18, thickness: 0.28, supportedBy: ["inn-plinth"],
    openings: [{
      id: "inn-service-crossing", station: 2.9, width: 0.95, bottom: 0,
      height: 1.72, kind: "service-opening", access: "walk"
    }]
  });
  architectureAddStair(plan, {
    id: "inn-upper-stair", start: { x: 3.9, z: 2.75 }, end: { x: 2.0, z: 0.2 },
    baseY: 0.34, topY: 2.62, width: 1.12, steps: 8,
    upperLandingId: "inn-upper-floor", supportedBy: ["inn-plinth"],
    cheeks: true, role: "timber-surface"
  });
  architectureAddHipRoof(plan, {
    id: "inn-hip-roof", center: { x: 0, z: 0 }, width: 10.8, depth: 7.8,
    eaveY: 5.02, pitchDeg: 27, overhang: 0.42, thickness: 0.18,
    enclosure: "enclosed",
    supportedBy: ["inn-front-wall", "inn-rear-wall", "inn-west-wall", "inn-east-wall"],
    edgeInfills: [{
      id: "inn-hip-roof:north-crown", edge: "north", width: 10.2, depth: 7.2,
      wallTopY: 4.89, thickness: 0.36,
      supportedBy: ["inn-rear-wall"], ownerId: "inn-rear-wall"
    }, {
      id: "inn-hip-roof:south-crown", edge: "south", width: 10.2, depth: 7.2,
      wallTopY: 4.89, thickness: 0.36,
      supportedBy: ["inn-front-wall"], ownerId: "inn-front-wall"
    }, {
      id: "inn-hip-roof:west-crown", edge: "west", width: 10.2, depth: 7.2,
      wallTopY: 4.89, thickness: 0.36,
      supportedBy: ["inn-west-wall"], ownerId: "inn-west-wall"
    }, {
      id: "inn-hip-roof:east-crown", edge: "east", width: 10.2, depth: 7.2,
      wallTopY: 4.89, thickness: 0.36,
      supportedBy: ["inn-east-wall"], ownerId: "inn-east-wall"
    }]
  });
  architectureAddBox(plan, "inn-service-court-wall",
    { x: 5.65, y: 0.82, z: -2.0 }, { x: 0.28, y: 1.3, z: 3.0 },
    "masonry-wall", ["ground"], { cover: "half-cover" });
  architectureAddAssetSocket(plan, {
    id: "inn-kitchen", ownerId: "inn-plinth", purpose: "service-cook-and-store-circuit",
    allowedSlugs: ["camp-kitchen-stores"], at: { x: 3.15, y: 0.36, z: -2.35 },
    yaw: -Math.PI / 2, scale: 0.9
  });
  architectureAddAssetSocket(plan, {
    id: "inn-public-board", ownerId: "inn-plinth", purpose: "public-identity-and-notice",
    allowedSlugs: ["public-notice-signal-board"], at: { x: -4.2, y: 0.36, z: 4.25 },
    yaw: Math.PI, scale: 0.8
  });
  architectureAddAccess(plan, "inn-public-route", "public-apron", "common-room", "walk", 1.3);
  architectureAddAccess(plan, "inn-service-route", "service-court", "common-room", "walk", 1.0);
  architectureAddAccess(plan, "inn-upper-route", "common-room", "upper-rooms", "stair", 1.12);
  return plan;
}

function architectureBuildHillsideStairStreet(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 22, y: 22 },
    primarySpatialSentence: "A public stair climbs between offset building pads whose thresholds, retaining work, and roofs follow three datums.",
    programTopology: ["lower-street", "stair-spine", "lower-frontage", "middle-frontage",
      "upper-frontage", "roof-route", "upper-continuation"],
    constructionProfile: "retained-hillside-party-wall-street",
    visualLocks: ["street and buildings climb together", "no contour-ring stacking",
      "upper mass occupies camera-far band"],
    gameplayLocks: ["continuous public ascent", "side thresholds", "roof counter-route",
      "retaining cover"]
  });
  architectureAddSlab(plan, "stair-street-lower-pad", { x: -3.7, z: 3.25 },
    { x: 5.1, z: 4.0 }, 0.38, 0.38, "foundation", ["ground"], "walk");
  architectureAddSlab(plan, "stair-street-middle-pad", { x: 3.55, z: 0.2 },
    { x: 5.3, z: 4.1 }, 1.75, 1.75, "foundation", ["ground"], "walk");
  architectureAddSlab(plan, "stair-street-upper-pad", { x: -3.15, z: -3.25 },
    { x: 5.9, z: 4.2 }, 3.45, 3.45, "foundation", ["ground"], "walk");
  architectureAddStair(plan, {
    id: "stair-street-public-spine", start: { x: 0, z: 5.6 }, end: { x: 0, z: -5.15 },
    baseY: 0.12, topY: 3.45, width: 2.05, steps: 14,
    upperLandingId: "stair-street-upper-pad",
    supportedBy: ["ground", "stair-street-lower-pad", "stair-street-middle-pad"],
    cheeks: true, role: "masonry-edge"
  });
  var buildings = [
    { id: "lower", x0: -6.0, x1: -1.45, z0: 1.45, z1: 5.05, base: 0.38, height: 2.45,
      pad: "stair-street-lower-pad", high: "west" },
    { id: "middle", x0: 1.35, x1: 5.95, z0: -1.75, z1: 2.15, base: 1.75, height: 2.55,
      pad: "stair-street-middle-pad", high: "east" },
    { id: "upper", x0: -5.9, x1: -0.35, z0: -5.25, z1: -1.25, base: 3.45, height: 3.15,
      pad: "stair-street-upper-pad", high: "west" }
  ];
  buildings.forEach(function(building){
    var width = building.x1 - building.x0, depth = building.z1 - building.z0;
    architectureAddWallRun(plan, {
      id: "stair-street-" + building.id + "-street-wall",
      start: { x: building.x1, z: building.z0 }, end: { x: building.x1, z: building.z1 },
      baseY: building.base, height: building.height, thickness: 0.32,
      supportedBy: [building.pad],
      openings: [{
        id: "stair-street-" + building.id + "-door", station: depth * 0.52,
        width: 0.95, bottom: 0, height: 1.78, kind: "street-door", access: "walk"
      }]
    });
    architectureAddWallRun(plan, {
      id: "stair-street-" + building.id + "-back-wall",
      start: { x: building.x0, z: building.z1 }, end: { x: building.x0, z: building.z0 },
      baseY: building.base, height: building.height, thickness: 0.34,
      supportedBy: [building.pad]
    });
    architectureAddWallRun(plan, {
      id: "stair-street-" + building.id + "-north-wall",
      start: { x: building.x0, z: building.z0 }, end: { x: building.x1, z: building.z0 },
      baseY: building.base, height: building.height, thickness: 0.32,
      supportedBy: [building.pad]
    });
    architectureAddWallRun(plan, {
      id: "stair-street-" + building.id + "-south-wall",
      start: { x: building.x1, z: building.z1 }, end: { x: building.x0, z: building.z1 },
      baseY: building.base, height: building.height, thickness: 0.32,
      supportedBy: [building.pad],
      openings: [{
        id: "stair-street-" + building.id + "-rear-window", station: width * 0.5,
        width: 1.2, bottom: 0.75, height: 0.9, kind: "rear-window", observation: true
      }]
    });
    architectureAddShedRoof(plan, {
      id: "stair-street-" + building.id + "-roof",
      center: { x: (building.x0 + building.x1) / 2, z: (building.z0 + building.z1) / 2 },
      width: width + 0.2, depth: depth + 0.2,
      eaveY: building.base + building.height + 0.12, pitchDeg: building.id === "upper" ? 20 : 15,
      highEdge: building.high, overhang: 0.3, thickness: 0.17, enclosure: "enclosed",
      supportedBy: ["stair-street-" + building.id + "-street-wall",
        "stair-street-" + building.id + "-back-wall"],
      endInfills: [{
        id: "stair-street-" + building.id + "-roof:north-infill",
        side: "north", at: building.z0, runLength: width,
        wallTopY: building.base + building.height, thickness: 0.32,
        supportedBy: ["stair-street-" + building.id + "-north-wall"],
        ownerId: "stair-street-" + building.id + "-north-wall"
      }, {
        id: "stair-street-" + building.id + "-roof:south-infill",
        side: "south", at: building.z1, runLength: width,
        wallTopY: building.base + building.height, thickness: 0.32,
        supportedBy: ["stair-street-" + building.id + "-south-wall"],
        ownerId: "stair-street-" + building.id + "-south-wall"
      }],
      edgeInfills: [{
        id: "stair-street-" + building.id + "-roof:west-infill", edge: "west",
        wallTopY: building.base + building.height, spanLength: depth, thickness: 0.34,
        supportedBy: ["stair-street-" + building.id + "-back-wall"],
        ownerId: "stair-street-" + building.id + "-back-wall"
      }, {
        id: "stair-street-" + building.id + "-roof:east-infill", edge: "east",
        wallTopY: building.base + building.height, spanLength: depth, thickness: 0.32,
        supportedBy: ["stair-street-" + building.id + "-street-wall"],
        ownerId: "stair-street-" + building.id + "-street-wall"
      }]
    });
  });
  architectureAddSlab(plan, "stair-street-upper-roof-route",
    { x: -3.15, z: -2.0 }, { x: 4.8, z: 1.1 }, 6.72, 0.2,
    "timber-surface", ["stair-street-upper-street-wall", "stair-street-upper-back-wall"], "walk");
  architectureAddStair(plan, {
    id: "stair-street-roof-stair", start: { x: -0.55, z: -1.55 },
    end: { x: -2.0, z: -2.0 }, baseY: 3.45, topY: 6.72, width: 0.95, steps: 9,
    upperLandingId: "stair-street-upper-roof-route", supportedBy: ["stair-street-upper-pad"],
    cheeks: false, role: "timber-surface"
  });
  architectureAddAssetSocket(plan, {
    id: "stair-street-stall", ownerId: "stair-street-middle-pad",
    purpose: "hillside-public-trade-threshold", allowedSlugs: ["market-stall-chassis"],
    at: { x: 3.5, y: 1.77, z: 2.55 }, yaw: Math.PI, scale: 0.82
  });
  architectureAddAssetSocket(plan, {
    id: "stair-street-lantern", ownerId: "stair-street-upper-street-wall",
    purpose: "upper-stair-practical-light", allowedSlugs: [],
    promotionCandidates: [{
      jobId: "M070-A", intendedSlug: "hanging-lantern",
      purpose: "mount to an explicit upper-street wall bracket"
    }],
    at: { x: -0.25, y: 5.25, z: -3.1 }, yaw: -Math.PI / 2, scale: 0.75,
    fallback: { kind: "omit", reason: "daylit form proof owns no unlicensed practical light" }
  });
  architectureAddAccess(plan, "stair-street-through", "lower-street", "upper-continuation",
    "stair", 2.05);
  architectureAddAccess(plan, "stair-street-roof-route-edge", "upper-frontage", "roof-route",
    "stair", 0.95);
  return plan;
}

/* CL-F13 · first real-roll exterior precinct.

   AF-15 remains the compact miniature/building-language proof. AF-22 is additive: it spends the
   materialization window on ONE connected hillside, public circulation, retaining construction,
   and complete inaccessible façades. The terrain owns the hill and two routes; architecture owns
   only the structures, stairs, thresholds, supports, and fixtures negotiated into it. */
function architectureBuildMarketHillsidePrecinct(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed,
    extentCells: { x: 24, y: 26 },
    primarySpatialSentence: "A Market Ward alley climbs one connected hillside between complete party-wall frontages, turning stairs, a service ramp, and a tall far civic threshold.",
    programTopology: [
      "lower-market-arrival", "public-stair-alley", "lower-frontage",
      "middle-turn", "middle-frontage", "service-ramp", "upper-civic-threshold",
      "upper-continuation", "roof-and-balcony-overwatch"
    ],
    constructionProfile: "terrain-cut-market-alley-with-party-wall-frontages",
    battleSpaceMode: ARCHITECTURE_BATTLE_SPACE_MODES.EXTERIOR_PRECINCT.id,
    occupantProfile: "upright-medium",
    assemblyClearancePolicy: "strict",
    visualLocks: [
      "one connected hillside rather than three floating pads",
      "constructed masses bound the alley and continue beyond the frame",
      "stairs turn with exact seams and no generic connector platform",
      "tallest wall remains in the camera-far band",
      "natural ground stays smoothly responsive outside localized foundations"
    ],
    gameplayLocks: [
      "public stair route", "longer service-ramp route", "three fighting datums",
      "door and balcony sightline pressure", "lower and upper retreat",
      "complete inaccessible building depth"
    ]
  });

  plan.sourceRequest = {
    caseId: ARCHITECTURE_FORM_PRECINCT_FIXTURE.sourceRequest.caseId,
    requestFingerprint: ARCHITECTURE_FORM_PRECINCT_FIXTURE.sourceRequest.requestFingerprint,
    rootSeed: ARCHITECTURE_FORM_PRECINCT_FIXTURE.sourceRequest.rootSeed,
    primaryType: ARCHITECTURE_FORM_PRECINCT_FIXTURE.sourceRequest.primaryType,
    threat: ARCHITECTURE_FORM_PRECINCT_FIXTURE.sourceRequest.threat,
    encounterBranches: ARCHITECTURE_FORM_PRECINCT_FIXTURE.sourceRequest.encounterBranches.slice(),
    disposition: "MATERIALIZE_NEW",
    battleSpaceMode: "EXTERIOR_ARCHITECTURAL_PRECINCT"
  };
  plan.materializationWindowPolicy = {
    exteriorVisible: true,
    interiorVisible: false,
    inaccessibleDepthIsBoundary: true,
    continuations: ["lower-market-street", "upper-market-street", "west-neighborhood",
      "east-service-quarter"]
  };
  plan.terrainRelations = [
    { id: "lower-range-cut", structureId: "precinct-lower-plinth", relation: "CUT_INTO",
      terrainPieceId: "af22-lower-foundation-shelf" },
    { id: "middle-range-retains", structureId: "precinct-middle-plinth", relation: "RETAINS",
      terrainPieceId: "af22-middle-foundation-shelf" },
    { id: "upper-range-pins", structureId: "precinct-upper-plinth", relation: "PINS",
      terrainPieceId: "af22-upper-foundation-shelf" },
    { id: "stair-follows-grade", structureId: "precinct-stair-flight-a", relation: "RESTS_ON",
      terrainPieceId: "af22-public-subgrade" }
  ];

  /* Lower west range: two storeys continue beyond the west board edge. */
  architectureAddSlab(plan, "precinct-lower-plinth", { x: -8.0, z: 7.25 },
    { x: 7.5, z: 7.1 }, 1.0, 0.72, "foundation", ["ground"], "none");
  architectureAddWallRun(plan, {
    id: "precinct-lower-street-wall",
    start: { x: -4.25, z: 3.7 }, end: { x: -4.25, z: 10.8 },
    baseY: 1.0, height: 4.45, thickness: 0.38,
    supportedBy: ["precinct-lower-plinth"],
    openings: [
      { id: "precinct-lower-market-door", station: 1.55, width: 1.65, bottom: 0,
        height: 2.2, kind: "market-door", access: "controlled" },
      { id: "precinct-lower-market-window", station: 4.05, width: 2.15, bottom: 0.88,
        height: 1.25, kind: "shutter-counter", observation: true },
      { id: "precinct-lower-upper-window", station: 6.15, width: 1.25, bottom: 2.72,
        height: 1.05, kind: "upper-window", observation: true }
    ]
  });
  architectureAddWallRun(plan, {
    id: "precinct-lower-back-wall",
    start: { x: -11.75, z: 10.8 }, end: { x: -11.75, z: 3.7 },
    baseY: 1.0, height: 4.45, thickness: 0.4,
    supportedBy: ["precinct-lower-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "precinct-lower-south-return",
    start: { x: -11.75, z: 10.8 }, end: { x: -4.25, z: 10.8 },
    baseY: 1.0, height: 4.45, thickness: 0.38,
    supportedBy: ["precinct-lower-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "precinct-lower-north-return",
    start: { x: -4.25, z: 3.7 }, end: { x: -11.75, z: 3.7 },
    baseY: 1.0, height: 4.45, thickness: 0.38,
    supportedBy: ["precinct-lower-plinth"]
  });
  architectureAddHipRoof(plan, {
    id: "precinct-lower-hip-roof", center: { x: -8.0, z: 7.25 },
    width: 7.5, depth: 7.1, eaveY: 5.62, pitchDeg: 24,
    overhang: 0.38, thickness: 0.18, enclosure: "enclosed",
    supportedBy: ["precinct-lower-street-wall", "precinct-lower-back-wall",
      "precinct-lower-south-return", "precinct-lower-north-return"],
    edgeInfills: [
      { id: "precinct-lower-roof:north", edge: "north", width: 7.5, depth: 7.1,
        wallTopY: 5.45, thickness: 0.38, supportedBy: ["precinct-lower-north-return"],
        ownerId: "precinct-lower-north-return" },
      { id: "precinct-lower-roof:south", edge: "south", width: 7.5, depth: 7.1,
        wallTopY: 5.45, thickness: 0.38, supportedBy: ["precinct-lower-south-return"],
        ownerId: "precinct-lower-south-return" },
      { id: "precinct-lower-roof:west", edge: "west", width: 7.5, depth: 7.1,
        wallTopY: 5.45, thickness: 0.4, supportedBy: ["precinct-lower-back-wall"],
        ownerId: "precinct-lower-back-wall" },
      { id: "precinct-lower-roof:east", edge: "east", width: 7.5, depth: 7.1,
        wallTopY: 5.45, thickness: 0.38, supportedBy: ["precinct-lower-street-wall"],
        ownerId: "precinct-lower-street-wall" }
    ]
  });

  /* Middle east range: a taller service/market frontage bears on a real retained shelf. */
  architectureAddSlab(plan, "precinct-middle-plinth", { x: 8.0, z: 0.7 },
    { x: 7.3, z: 8.0 }, 3.0, 1.72, "foundation", ["ground"], "none");
  architectureAddWallRun(plan, {
    id: "precinct-middle-street-wall",
    start: { x: 4.35, z: 4.7 }, end: { x: 4.35, z: -3.3 },
    baseY: 3.0, height: 5.25, thickness: 0.4,
    supportedBy: ["precinct-middle-plinth"],
    openings: [
      { id: "precinct-middle-market-door", station: 1.55, width: 1.65, bottom: 0,
        height: 2.25, kind: "service-market-door", access: "controlled" },
      { id: "precinct-middle-arcade-window", station: 4.15, width: 2.3, bottom: 0.9,
        height: 1.35, kind: "public-window", observation: true },
      { id: "precinct-middle-upper-window", station: 6.75, width: 1.35, bottom: 3.05,
        height: 1.2, kind: "upper-window", observation: true }
    ]
  });
  architectureAddWallRun(plan, {
    id: "precinct-middle-back-wall",
    start: { x: 11.65, z: -3.3 }, end: { x: 11.65, z: 4.7 },
    baseY: 3.0, height: 5.25, thickness: 0.42,
    supportedBy: ["precinct-middle-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "precinct-middle-south-return",
    start: { x: 4.35, z: 4.7 }, end: { x: 11.65, z: 4.7 },
    baseY: 3.0, height: 5.25, thickness: 0.4,
    supportedBy: ["precinct-middle-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "precinct-middle-north-return",
    start: { x: 11.65, z: -3.3 }, end: { x: 4.35, z: -3.3 },
    baseY: 3.0, height: 5.25, thickness: 0.4,
    supportedBy: ["precinct-middle-plinth"]
  });
  architectureAddHipRoof(plan, {
    id: "precinct-middle-hip-roof", center: { x: 8.0, z: 0.7 },
    width: 7.3, depth: 8.0, eaveY: 8.42, pitchDeg: 28,
    overhang: 0.42, thickness: 0.2, enclosure: "enclosed",
    supportedBy: ["precinct-middle-street-wall", "precinct-middle-back-wall",
      "precinct-middle-south-return", "precinct-middle-north-return"],
    edgeInfills: [
      { id: "precinct-middle-roof:north", edge: "north", width: 7.3, depth: 8.0,
        wallTopY: 8.25, thickness: 0.4, supportedBy: ["precinct-middle-north-return"],
        ownerId: "precinct-middle-north-return" },
      { id: "precinct-middle-roof:south", edge: "south", width: 7.3, depth: 8.0,
        wallTopY: 8.25, thickness: 0.4, supportedBy: ["precinct-middle-south-return"],
        ownerId: "precinct-middle-south-return" },
      { id: "precinct-middle-roof:west", edge: "west", width: 7.3, depth: 8.0,
        wallTopY: 8.25, thickness: 0.4, supportedBy: ["precinct-middle-street-wall"],
        ownerId: "precinct-middle-street-wall" },
      { id: "precinct-middle-roof:east", edge: "east", width: 7.3, depth: 8.0,
        wallTopY: 8.25, thickness: 0.42, supportedBy: ["precinct-middle-back-wall"],
        ownerId: "precinct-middle-back-wall" }
    ]
  });

  /* Far civic range: a tall complete boundary, not a dollhouse. Its depth leaves the board. */
  architectureAddSlab(plan, "precinct-upper-plinth", { x: -2.5, z: -9.0 },
    { x: 12.2, z: 6.0 }, 5.5, 2.2, "foundation", ["ground"], "none");
  architectureAddWallRun(plan, {
    id: "precinct-upper-civic-wall",
    start: { x: -8.6, z: -6.0 }, end: { x: 3.6, z: -6.0 },
    baseY: 5.5, height: 7.25, thickness: 0.5,
    supportedBy: ["precinct-upper-plinth"],
    openings: [
      { id: "precinct-upper-civic-arch", station: 6.1, width: 2.4, bottom: 0,
        height: 3.35, kind: "civic-arch", access: "walk" },
      { id: "precinct-upper-gallery-window-west", station: 2.25, width: 1.45,
        bottom: 3.45, height: 2.0, kind: "gallery-window", observation: true },
      { id: "precinct-upper-gallery-window-east", station: 9.95, width: 1.45,
        bottom: 3.45, height: 2.0, kind: "gallery-window", observation: true }
    ]
  });
  architectureAddWallRun(plan, {
    id: "precinct-upper-back-wall",
    start: { x: 3.6, z: -12.0 }, end: { x: -8.6, z: -12.0 },
    baseY: 5.5, height: 7.25, thickness: 0.5,
    supportedBy: ["precinct-upper-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "precinct-upper-west-return",
    start: { x: -8.6, z: -12.0 }, end: { x: -8.6, z: -6.0 },
    baseY: 5.5, height: 7.25, thickness: 0.48,
    supportedBy: ["precinct-upper-plinth"]
  });
  architectureAddWallRun(plan, {
    id: "precinct-upper-east-return",
    start: { x: 3.6, z: -6.0 }, end: { x: 3.6, z: -12.0 },
    baseY: 5.5, height: 7.25, thickness: 0.48,
    supportedBy: ["precinct-upper-plinth"]
  });
  architectureAddGableRoof(plan, {
    id: "precinct-upper-gable-roof", center: { x: -2.5, z: -9.0 },
    width: 12.2, depth: 6.0, eaveY: 12.92, pitchDeg: 30,
    overhang: 0.45, thickness: 0.22, enclosure: "enclosed",
    supportedBy: ["precinct-upper-civic-wall", "precinct-upper-back-wall",
      "precinct-upper-west-return", "precinct-upper-east-return"],
    endInfills: [
      { id: "precinct-upper-roof:north-infill", side: "north", at: -12.0,
        width: 12.2, wallTopY: 12.75, thickness: 0.5,
        supportedBy: ["precinct-upper-back-wall"], ownerId: "precinct-upper-back-wall" },
      { id: "precinct-upper-roof:south-infill", side: "south", at: -6.0,
        width: 12.2, wallTopY: 12.75, thickness: 0.5,
        supportedBy: ["precinct-upper-civic-wall"], ownerId: "precinct-upper-civic-wall" }
    ]
  });
  architectureAddSlab(plan, "precinct-upper-balcony", { x: -2.5, z: -5.55 },
    { x: 7.6, z: 1.2 }, 9.15, 0.24, "masonry-edge",
    ["precinct-upper-civic-wall"], "walk");
  architectureAddRunPrism(plan, "precinct-upper-balcony-rail",
    { x: -6.3, z: -4.98 }, { x: 1.3, z: -4.98 }, 9.15, 0.86, 0.18,
    "masonry-edge", ["precinct-upper-balcony"], { cover: "half-cover" });

  /* Three grounded flights share two exact seams. There is no masking platform. Each higher
     flight carries solid body to the common low foundation datum. */
  architectureAddStair(plan, {
    id: "precinct-stair-flight-a",
    start: { x: 5.5, z: 10.5 }, end: { x: 1.0, z: 5.0 },
    baseY: 0.5, topY: 2.0, width: 2.2, steps: 8,
    lowerLandingId: "lower-market-arrival",
    upperLandingId: "precinct-turn-a-stair-seam",
    supportedBy: ["ground"], foundationBaseY: 0, supportMode: "grounded-solid",
    cheeks: true, role: "masonry-edge"
  });
  architectureAddStair(plan, {
    id: "precinct-stair-flight-b",
    start: { x: 1.0, z: 5.0 }, end: { x: -2.0, z: 0.0 },
    baseY: 2.0, topY: 4.0, width: 2.2, steps: 8,
    lowerLandingId: "precinct-turn-a-stair-seam",
    upperLandingId: "precinct-turn-b-stair-seam",
    supportedBy: ["ground"], foundationBaseY: 0, supportMode: "grounded-solid",
    cheeks: true, role: "masonry-edge"
  });
  architectureAddStair(plan, {
    id: "precinct-stair-flight-c",
    start: { x: -2.0, z: 0.0 }, end: { x: -2.5, z: -6.0 },
    baseY: 4.0, topY: 5.5, width: 2.2, steps: 9,
    lowerLandingId: "precinct-turn-b-stair-seam",
    upperLandingId: "precinct-upper-plinth",
    supportedBy: ["ground", "precinct-upper-plinth"],
    foundationBaseY: 0, supportMode: "grounded-solid",
    cheeks: true, role: "masonry-edge"
  });

  architectureAddBox(plan, "precinct-lower-retaining-return",
    { x: -3.9, y: 0.6, z: 6.6 }, { x: 0.45, y: 1.2, z: 4.0 },
    "masonry-wall", ["ground"], { cover: "half-cover" });
  architectureAddBox(plan, "precinct-middle-retaining-return",
    { x: 4.05, y: 1.55, z: 2.9 }, { x: 0.5, y: 3.1, z: 2.4 },
    "masonry-wall", ["ground"], { cover: "full-cover" });
  architectureAddBox(plan, "precinct-upper-retaining-return",
    { x: -6.8, y: 2.8, z: -5.7 }, { x: 3.6, y: 5.6, z: 0.52 },
    "masonry-wall", ["ground"], { cover: "full-cover" });

  architectureAddAssetSocket(plan, {
    id: "precinct-lower-stall", ownerId: "precinct-lower-plinth",
    purpose: "market-threshold-and-cover",
    allowedSlugs: ["market-stall-chassis"],
    at: { x: -3.35, y: 1.04, z: 8.8 }, yaw: -Math.PI / 2, scale: 0.82
  });
  architectureAddAssetSocket(plan, {
    id: "precinct-upper-notice", ownerId: "precinct-upper-civic-wall",
    purpose: "authority-and-public-message",
    allowedSlugs: ["public-notice-signal-board"],
    at: { x: -6.6, y: 5.55, z: -5.72 }, yaw: 0, scale: 0.8
  });
  architectureAddLightSocket(plan, {
    id: "precinct-middle-lantern", purpose: "middle-turn-practical",
    supportId: "precinct-middle-street-wall",
    at: { x: 4.05, y: 5.45, z: 1.4 },
    color: 0xffb56b, intensity: 1.1, distance: 5.5, decay: 2
  });
  architectureAddLightSocket(plan, {
    id: "precinct-upper-arch-light", purpose: "upper-threshold-practical",
    supportId: "precinct-upper-civic-wall",
    at: { x: -2.5, y: 8.25, z: -5.65 },
    color: 0xffc27d, intensity: 1.35, distance: 6.5, decay: 2
  });

  architectureAddAccess(plan, "precinct-public-stair-route",
    "lower-market-arrival", "upper-civic-threshold", "stair", 2.2);
  architectureAddAccess(plan, "precinct-service-ramp-route",
    "lower-market-arrival", "upper-continuation", "ramp", 1.8);
  architectureAddAccess(plan, "precinct-lower-threshold-route",
    "public-stair-alley", "lower-frontage", "walk", 1.65);
  architectureAddAccess(plan, "precinct-middle-threshold-route",
    "middle-turn", "middle-frontage", "walk", 1.65);
  architectureAddAccess(plan, "precinct-upper-threshold-route",
    "upper-civic-threshold", "upper-continuation", "walk", 2.4);

  architectureRegisterClearanceEnvelope(plan, {
    id: "precinct-upright-route", profileId: "upright-medium",
    zoneIds: ["lower-market-arrival", "public-stair-alley", "upper-civic-threshold"],
    portalOpeningIds: ["precinct-lower-market-door", "precinct-middle-market-door",
      "precinct-upper-civic-arch"],
    accessEdgeIds: ["precinct-public-stair-route", "precinct-upper-threshold-route"],
    routeWidth: 2.2, turnDiameter: 2.35, verticalMode: "stair"
  });
  architectureRegisterClearanceEnvelope(plan, {
    id: "precinct-broad-route", profileId: "broad-medium",
    zoneIds: ["lower-market-arrival", "public-stair-alley", "upper-civic-threshold"],
    portalOpeningIds: ["precinct-lower-market-door", "precinct-middle-market-door",
      "precinct-upper-civic-arch"],
    accessEdgeIds: ["precinct-public-stair-route", "precinct-upper-threshold-route"],
    routeWidth: 2.2, turnDiameter: 2.35, verticalMode: "broad-stair"
  });
  architectureRegisterClearanceEnvelope(plan, {
    id: "precinct-long-service-route", profileId: "long-medium",
    zoneIds: ["lower-market-arrival", "service-ramp", "upper-continuation"],
    portalOpeningIds: [],
    accessEdgeIds: ["precinct-service-ramp-route"],
    routeWidth: 1.8, turnDiameter: 3.0, verticalMode: "switchback-ramp"
  });
  return plan;
}

function architectureMarketHillsideTerrainSpec(seed){
  var extent = { x: 24, y: 26 };
  var pieces = [
    terrainFeaturePiece("af22-connected-hillside", "R1-07", "connected urban hillside", [
      terrainFeatureOp("control-surface", "set", {
        columns: [0, 4, 8, 12, 16, 20, 23],
        rows: [0, 4, 8, 12, 16, 20, 25],
        heightsH: [
          [11, 12, 12, 11, 10, 9, 8],
          [10, 11, 11, 10, 9, 8, 8],
          [8, 9, 10, 9, 8, 7, 6],
          [6, 7, 8, 7, 6, 5, 5],
          [4, 5, 6, 5, 4, 3, 3],
          [2, 3, 3, 3, 2, 2, 1],
          [0, 0, 1, 1, 0, 0, 0]
        ],
        slopeClamp: 1,
        kind: "ground"
      })
    ], {
      qualityLock: "one responsive hillside; no independent tile relief and no contour bands"
    }),
    terrainFeaturePiece("af22-lower-foundation-shelf", "R1-09",
      "localized lower frontage cut", [
        terrainFeatureOp("control-surface", "set", {
          columns: [0, 23], rows: [0, 25],
          heightsH: [[2, 2], [2, 2]], slopeClamp: Infinity, kind: "ground",
          bounds: { x: 0, y: 17, w: 8, d: 9 }
        })
      ], { qualityLock: "localized building bearing only" }),
    terrainFeaturePiece("af22-middle-foundation-shelf", "R1-09",
      "localized retained market shelf", [
        terrainFeatureOp("control-surface", "set", {
          columns: [0, 23], rows: [0, 25],
          heightsH: [[6, 6], [6, 6]], slopeClamp: Infinity, kind: "ground",
          bounds: { x: 17, y: 9, w: 7, d: 10 }
        })
      ], { qualityLock: "localized building bearing only" }),
    terrainFeaturePiece("af22-upper-foundation-shelf", "R1-09",
      "localized civic foundation pinned into the crown", [
        terrainFeatureOp("control-surface", "set", {
          columns: [0, 23], rows: [0, 25],
          heightsH: [[11, 11], [11, 11]], slopeClamp: Infinity, kind: "ground",
          bounds: { x: 3, y: 0, w: 13, d: 7 }
        })
      ], { qualityLock: "one far civic bearing; never a tray-wide terrace" }),
    terrainFeaturePiece("af22-public-subgrade", "R1-07",
      "graded public stair subgrade", [
        terrainFeatureOp("graded-path", "set", {
          polyline: [
            { x: 17.5, y: 23.5, h: 1, widthCells: 2.2 },
            { x: 13.0, y: 18.0, h: 4, widthCells: 2.2 },
            { x: 10.0, y: 13.0, h: 8, widthCells: 2.2 },
            { x: 9.5, y: 7.0, h: 11, widthCells: 2.2 }
          ],
          widthCells: 2.2, shoulderCells: 1.35,
          surfaceKind: "market-public-stair-subgrade",
          slopeClamp: 1, kind: "ground"
        }, "market-public-stair-subgrade")
      ], { routeType: "direct public stair", qualityLock: "one continuous turning ascent" }),
    terrainFeaturePiece("af22-service-ramp", "R1-07",
      "longer edge service ramp", [
        terrainFeatureOp("graded-path", "set", {
          polyline: [
            { x: 22.2, y: 24.0, h: 0, widthCells: 1.8 },
            { x: 21.5, y: 19.0, h: 2, widthCells: 1.8 },
            { x: 22.0, y: 14.0, h: 5, widthCells: 1.8 },
            { x: 20.5, y: 9.0, h: 8, widthCells: 1.8 },
            { x: 18.0, y: 3.0, h: 11, widthCells: 1.8 }
          ],
          widthCells: 1.8, shoulderCells: 1.5,
          surfaceKind: "market-service-ramp",
          slopeClamp: 1, kind: "ground"
        }, "market-service-ramp")
      ], { routeType: "service ramp", qualityLock: "long-bodied alternate route" })
  ];
  return terrainFeatureSpecBase("af22-market-hillside-precinct", seed, extent, pieces, {
    featureId: "AF-22-PRECINCT-TERRAIN",
    featureScale: "compact-urban-battle-window",
    quietSurfaceMinimumShare: 0.16,
    macroGraph: {
      nodes: [
        { id: "lower-market-arrival", heightBandH: [0, 2], role: "deployment and retreat" },
        { id: "middle-turn", heightBandH: [4, 8], role: "route crossing and frontage pressure" },
        { id: "upper-civic-threshold", heightBandH: [10, 12], role: "objective and continuation" }
      ],
      routes: [
        { id: "market-public-stair-subgrade", from: "lower-market-arrival",
          to: "upper-civic-threshold", kind: "public stair" },
        { id: "market-service-ramp", from: "lower-market-arrival",
          to: "upper-civic-threshold", kind: "service ramp" }
      ]
    }
  });
}

function architectureBuildGreatHall(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 22, y: 22 },
    primarySpatialSentence: "A tall single-volume hall carries a cross-aisle, dais, and reachable end gallery beneath repeated roof trusses.",
    programTopology: ["public-entry", "cross-aisle", "great-volume", "hearth-service",
      "dais", "end-gallery", "rear-exit"],
    constructionProfile: "masonry-end-walls-with-heavy-timber-aisles-and-trusses",
    visualLocks: ["one tall room not two floors", "trusses express span", "dais anchors far end"],
    gameplayLocks: ["clear central floor", "two exits", "reachable gallery", "side cover rhythm"]
  });
  architectureAddSlab(plan, "hall-plinth", { x: 0, z: 0 }, { x: 7.6, z: 12.4 },
    0.34, 0.34, "foundation", ["ground"], "walk");
  architectureAddWallRun(plan, {
    id: "hall-north-end", start: { x: -3.8, z: -6.2 }, end: { x: 3.8, z: -6.2 },
    baseY: 0.34, height: 4.65, thickness: 0.4, supportedBy: ["hall-plinth"],
    openings: [{
      id: "hall-rear-door", station: 6.35, width: 1.05, bottom: 0,
      height: 1.9, kind: "rear-door", access: "walk"
    }]
  });
  architectureAddWallRun(plan, {
    id: "hall-south-end", start: { x: 3.8, z: 6.2 }, end: { x: -3.8, z: 6.2 },
    baseY: 0.34, height: 4.65, thickness: 0.4, supportedBy: ["hall-plinth"],
    openings: [
      { id: "hall-public-door", station: 3.8, width: 1.6, bottom: 0,
        height: 2.2, kind: "public-double-door", access: "walk" },
      { id: "hall-entry-window", station: 1.05, width: 0.75, bottom: 1.0,
        height: 1.4, kind: "high-window", observation: true }
    ]
  });
  architectureAddWallRun(plan, {
    id: "hall-west-wall", start: { x: -3.8, z: 6.2 }, end: { x: -3.8, z: -6.2 },
    baseY: 0.34, height: 3.55, thickness: 0.34, supportedBy: ["hall-plinth"],
    openings: [-4.2, -1.4, 1.4, 4.2].map(function(z, index){
      return {
        id: "hall-west-window-" + index, station: 6.2 - z, width: 0.85,
        bottom: 1.05, height: 1.3, kind: "clerestory", observation: true
      };
    })
  });
  architectureAddWallRun(plan, {
    id: "hall-east-cutaway-stub", start: { x: 3.8, z: -6.2 }, end: { x: 3.8, z: 6.2 },
    baseY: 0.34, height: 0.78, thickness: 0.34, supportedBy: ["hall-plinth"],
    cutawayGroup: "hall-camera-side-section", cover: "half-cover"
  });
  var trussStations = [-4.7, -2.35, 0, 2.35, 4.7];
  trussStations.forEach(function(z, index){
    architectureAddPosts(plan, "hall-truss-posts-" + index, [
      { x: -3.35, z: z }, { x: 3.35, z: z }
    ], 0.34, 4.45, 0.4, "timber-structure", ["hall-plinth"]);
    architectureAddBeam3D(plan, "hall-truss-west-rafter-" + index,
      { x: -3.45, y: 4.7, z: z }, { x: 0, y: 6.35, z: z },
      0.24, "timber-structure", ["hall-truss-posts-" + index]);
    architectureAddBeam3D(plan, "hall-truss-east-rafter-" + index,
      { x: 3.45, y: 4.7, z: z }, { x: 0, y: 6.35, z: z },
      0.24, "timber-structure", ["hall-truss-posts-" + index]);
    architectureAddRunPrism(plan, "hall-truss-tie-" + index,
      { x: -3.45, z: z }, { x: 3.45, z: z }, 4.15, 0.28, 0.25,
      "timber-structure", ["hall-truss-posts-" + index]);
  });
  architectureAddGableRoof(plan, {
    id: "hall-gable-roof", center: { x: 0, z: 0 }, width: 8.2, depth: 13.0,
    eaveY: 4.9, pitchDeg: 27, overhang: 0.38, thickness: 0.2,
    supportedBy: trussStations.map(function(z, index){ return "hall-truss-posts-" + index; }),
    enclosure: "enclosed",
    cutawaySide: "east", cutawayGroup: "hall-camera-side-section",
    endInfills: [{
      id: "hall-gable-roof:north-infill", side: "north", at: -6.2,
      width: 7.6, wallTopY: 4.99, thickness: 0.4,
      supportedBy: ["hall-north-end"], ownerId: "hall-north-end"
    }, {
      id: "hall-gable-roof:south-infill", side: "south", at: 6.2,
      width: 7.6, wallTopY: 4.99, thickness: 0.4,
      supportedBy: ["hall-south-end"], ownerId: "hall-south-end",
      cutawayGroup: "hall-camera-side-section"
    }]
  });
  architectureAddSlab(plan, "hall-dais", { x: 0, z: -4.7 }, { x: 4.5, z: 2.0 },
    0.68, 0.34, "timber-surface", ["hall-plinth"], "walk");
  architectureAddSlab(plan, "hall-end-gallery", { x: 0, z: -5.25 }, { x: 6.4, z: 1.45 },
    2.95, 0.22, "timber-surface", ["hall-north-end", "hall-truss-posts-0"], "walk");
  architectureAddStair(plan, {
    id: "hall-gallery-stair", start: { x: 3.1, z: -3.65 }, end: { x: 2.4, z: -5.0 },
    baseY: 0.34, topY: 2.95, width: 1.0, steps: 8,
    upperLandingId: "hall-end-gallery", supportedBy: ["hall-plinth", "hall-dais"],
    cheeks: false, role: "timber-surface"
  });
  architectureAddRunPrism(plan, "hall-gallery-rail",
    { x: -3.1, z: -4.5 }, { x: 1.8, z: -4.5 }, 2.95, 0.72, 0.16,
    "timber-structure", ["hall-end-gallery"], { cover: "half-cover" });
  architectureAddAssetSocket(plan, {
    id: "hall-service-stores", ownerId: "hall-plinth", purpose: "hearth-side-service",
    allowedSlugs: ["camp-kitchen-stores"], at: { x: -2.45, y: 0.36, z: 2.2 },
    yaw: Math.PI / 2, scale: 0.88
  });
  plan.cutawayGroups.push({
    id: "hall-camera-side-section", mode: "presentation-cutaway",
    preserves: ["complete-west-roof-slope", "east-eave-line", "five-complete-trusses",
      "dais", "end-gallery", "two-exit-program"]
  });
  architectureAddAssetSocket(plan, {
    id: "hall-bell", ownerId: "hall-end-gallery", purpose: "assembly-and-alarm-signal",
    allowedSlugs: ["alarm-bell-yoke"], at: { x: -2.1, y: 3.0, z: -5.25 },
    yaw: 0, scale: 0.76
  });
  architectureAddAccess(plan, "hall-public-route", "public-entry", "great-volume", "walk", 1.6);
  architectureAddAccess(plan, "hall-rear-route", "great-volume", "rear-exit", "walk", 1.05);
  architectureAddAccess(plan, "hall-gallery-route", "great-volume", "end-gallery", "stair", 1.0);
  return plan;
}

function architectureBuildSanctuaryNave(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 28, y: 30 },
    primarySpatialSentence: "A processional nave climbs toward one enormous stained sanctuary wall beneath exposed ribs and a suspended pre-cataclysm rose.",
    programTopology: ["processional-entry", "nave-floor", "side-aisles", "column-cover",
      "raised-sanctuary", "end-gallery", "service-exit"],
    constructionProfile: "elite-cut-stone-nave-with-stained-glass-and-ribbed-timber-vault",
    battleSpaceMode: ARCHITECTURE_BATTLE_SPACE_MODES.DEDICATED_INTERIOR.id,
    visualLocks: ["one monumental stained wall", "deep floor procession",
      "repeated structural ribs", "luxury survives without prop clutter"],
    gameplayLocks: ["three longitudinal lanes", "column cover rhythm",
      "raised objective", "two exit families", "gallery height"]
  });
  architectureAddSlab(plan, "sanctuary-floor", { x: 0, z: 0 }, { x: 14.0, z: 21.0 },
    0.42, 0.42, "luxury-floor", ["ground"], "walk");
  [-4.6, 0, 4.6].forEach(function(x, index){
    architectureAddBox(plan, "sanctuary-floor-inlay-long-" + index,
      { x: x, y: 0.445, z: 0.4 }, { x: index === 1 ? 0.44 : 0.24, y: 0.05, z: 19.2 },
      "ornamental-stone", ["sanctuary-floor"]);
  });
  [-6.7, -2.2, 2.2, 6.7].forEach(function(z, index){
    architectureAddBox(plan, "sanctuary-floor-inlay-cross-" + index,
      { x: 0, y: 0.447, z: z }, { x: 12.6, y: 0.055, z: 0.22 },
      "arcane-residue", ["sanctuary-floor"]);
  });
  architectureAddWallRun(plan, {
    id: "sanctuary-north-wall", start: { x: -7, z: -10.5 }, end: { x: 7, z: -10.5 },
    baseY: 0.42, height: 10.0, thickness: 0.58, supportedBy: ["sanctuary-floor"],
    openings: [
      { id: "sanctuary-west-lancet", station: 2.6, width: 2.0, bottom: 2.15,
        height: 5.7, kind: "stained-lancet", observation: true },
      { id: "sanctuary-great-lancet", station: 7.0, width: 2.8, bottom: 1.85,
        height: 6.4, kind: "great-stained-lancet", observation: true },
      { id: "sanctuary-east-lancet", station: 11.4, width: 2.0, bottom: 2.15,
        height: 5.7, kind: "stained-lancet", observation: true }
    ]
  });
  [
    ["sanctuary-west-glass", -4.4, 2.0, 5.7, 2.15],
    ["sanctuary-great-glass", 0, 2.8, 6.4, 1.85],
    ["sanctuary-east-glass", 4.4, 2.0, 5.7, 2.15]
  ].forEach(function(row){
    architectureAddBox(plan, row[0],
      { x: row[1], y: 0.42 + row[4] + row[3] / 2, z: -10.47 },
      { x: row[2] - 0.12, y: row[3] - 0.12, z: 0.13 },
      "stained-glass", ["sanctuary-north-wall"], { ownerId: row[0] });
  });
  [-6.25, -2.45, 2.45, 6.25].forEach(function(x, index){
    architectureAddBox(plan, "sanctuary-wall-tracery-" + index,
      { x: x, y: 6.0, z: -10.12 }, { x: 0.34, y: 9.7, z: 0.36 },
      "ornamental-stone", ["sanctuary-north-wall"],
      { ownerId: "sanctuary-north-wall" });
  });
  architectureAddWallRun(plan, {
    id: "sanctuary-west-wall", start: { x: -7, z: -10.5 }, end: { x: -7, z: 10.5 },
    baseY: 0.42, height: 7.45, thickness: 0.48, supportedBy: ["sanctuary-floor"],
    openings: [{
      id: "sanctuary-service-exit", station: 4.0, width: 1.4, bottom: 0,
      height: 2.2, kind: "service-door", access: "walk"
    }]
  });
  architectureAddWallRun(plan, {
    id: "sanctuary-east-wall", start: { x: 7, z: 10.5 }, end: { x: 7, z: -10.5 },
    baseY: 0.42, height: 7.45, thickness: 0.48, supportedBy: ["sanctuary-floor"],
    openings: [{
      id: "sanctuary-east-aisle-door", station: 16.8, width: 1.6, bottom: 0,
      height: 2.3, kind: "aisle-door", access: "walk"
    }]
  });
  architectureAddWallRun(plan, {
    id: "sanctuary-south-wall", start: { x: 7, z: 10.5 }, end: { x: -7, z: 10.5 },
    baseY: 0.42, height: 7.45, thickness: 0.52, supportedBy: ["sanctuary-floor"],
    openings: [{
      id: "sanctuary-processional-door", station: 7.0, width: 3.4, bottom: 0,
      height: 4.2, kind: "processional-door", access: "walk"
    }]
  });
  [-4.75, 4.75].forEach(function(x, sideIndex){
    [-7.2, -3.6, 0, 3.6, 7.2].forEach(function(z, bayIndex){
      var id = "sanctuary-column-" + sideIndex + "-" + bayIndex;
      architectureAddBox(plan, id, { x: x, y: 4.05, z: z },
        { x: 0.72, y: 7.25, z: 0.72 }, "ornamental-stone",
        ["sanctuary-floor"], { cover: "full-cover" });
      architectureAddBox(plan, id + ":capital", { x: x, y: 7.82, z: z },
        { x: 1.18, y: 0.32, z: 1.18 }, "ornamental-stone", [id],
        { ownerId: id });
    });
  });
  [-7.2, -3.6, 0, 3.6, 7.2].forEach(function(z, index){
    var westRib = [
      { x: -4.75, y: 7.95, z: z }, { x: -3.65, y: 9.15, z: z },
      { x: -2.25, y: 10.25, z: z }, { x: -0.85, y: 11.0, z: z },
      { x: 0, y: 11.25, z: z }
    ];
    var eastRib = westRib.map(function(point){
      return { x: -point.x, y: point.y, z: point.z };
    });
    [westRib, eastRib].forEach(function(points, side){
      for(var ribPiece = 0; ribPiece < points.length - 1; ribPiece++){
        architectureAddBeam3D(plan, "sanctuary-vault-" + side + "-" + index
          + "-" + ribPiece, points[ribPiece], points[ribPiece + 1],
        0.27, "ornamental-stone", ["sanctuary-column-" + side + "-" + index],
        { ownerId: "sanctuary-vault-rib-" + index });
      }
    });
  });
  architectureAddGableRoof(plan, {
    id: "sanctuary-roof", center: { x: 0, z: 0 }, width: 14.8, depth: 21.6,
    eaveY: 8.05, pitchDeg: 28, overhang: 0.4, thickness: 0.22,
    enclosure: "enclosed",
    supportedBy: ["sanctuary-west-wall", "sanctuary-east-wall",
      "sanctuary-north-wall", "sanctuary-south-wall"],
    endInfills: [{
      id: "sanctuary-roof:north-infill", side: "north", at: -10.5,
      width: 14, wallTopY: 10.42, thickness: 0.58,
      supportedBy: ["sanctuary-north-wall"], ownerId: "sanctuary-north-wall"
    }, {
      id: "sanctuary-roof:south-infill", side: "south", at: 10.5,
      width: 14, wallTopY: 7.87, thickness: 0.52,
      supportedBy: ["sanctuary-south-wall"], ownerId: "sanctuary-south-wall"
    }]
  });
  architectureAddSlab(plan, "sanctuary-dais", { x: 0, z: -7.8 }, { x: 8.4, z: 3.7 },
    0.92, 0.5, "luxury-floor", ["sanctuary-floor"], "walk");
  architectureAddStair(plan, {
    id: "sanctuary-dais-stair", start: { x: 0, z: -5.65 }, end: { x: 0, z: -6.35 },
    baseY: 0.42, topY: 0.92, width: 5.8, steps: 3,
    upperLandingId: "sanctuary-dais", supportedBy: ["sanctuary-floor"],
    cheeks: true, role: "ornamental-stone"
  });
  architectureAddSlab(plan, "sanctuary-end-gallery", { x: 0, z: -9.6 },
    { x: 11.8, z: 1.25 }, 4.15, 0.28, "ornamental-stone",
    ["sanctuary-north-wall", "sanctuary-column-0-0", "sanctuary-column-1-0"], "walk");
  architectureAddStair(plan, {
    id: "sanctuary-gallery-stair", start: { x: -6.1, z: -5.2 },
    end: { x: -5.2, z: -9.1 }, baseY: 0.92, topY: 4.15,
    width: 1.35, steps: 10, upperLandingId: "sanctuary-end-gallery",
    supportedBy: ["sanctuary-floor", "sanctuary-west-wall"],
    cheeks: true, role: "ornamental-stone"
  });
  var roseCenter = { x: 0, y: 8.9, z: -10.12 };
  var rosePoints = [];
  for(var rose = 0; rose < 12; rose++){
    var roseAngle = rose * Math.PI * 2 / 12;
    rosePoints.push({
      x: roseCenter.x + Math.cos(roseAngle) * 1.65,
      y: roseCenter.y + Math.sin(roseAngle) * 1.65,
      z: roseCenter.z
    });
  }
  rosePoints.forEach(function(point, index){
    architectureAddBeam3D(plan, "sanctuary-rose-ring-" + index, point,
      rosePoints[(index + 1) % rosePoints.length], 0.17,
      "arcane-residue", ["sanctuary-north-wall"],
      { ownerId: "sanctuary-suspended-rose" });
    if(index % 2 === 0){
      architectureAddBeam3D(plan, "sanctuary-rose-spoke-" + index,
        roseCenter, point, 0.12, "stained-glass", ["sanctuary-north-wall"],
        { ownerId: "sanctuary-suspended-rose" });
    }
  });
  architectureAddAccess(plan, "sanctuary-procession", "processional-entry",
    "raised-sanctuary", "walk", 3.4);
  architectureAddAccess(plan, "sanctuary-service-route", "side-aisles",
    "service-exit", "walk", 1.4);
  architectureAddAccess(plan, "sanctuary-gallery-route", "raised-sanctuary",
    "end-gallery", "stair", 1.35);
  architectureRegisterClearanceEnvelope(plan, {
    id: "sanctuary-broad-medium-procession", profileId: "broad-medium",
    zoneIds: ["processional-entry", "nave-floor", "raised-sanctuary"],
    portalOpeningIds: ["sanctuary-processional-door"],
    accessEdgeIds: ["sanctuary-procession"], routeWidth: 3.4,
    turnDiameter: 4.2, verticalMode: "broad-stair"
  });
  architectureApplyDollhouseCutaway(plan, {
    id: "sanctuary-camera-dollhouse",
    wallRunIds: ["sanctuary-east-wall", "sanctuary-south-wall"],
    memberPrefixes: ["sanctuary-roof:east-plane"],
    preserves: ["great-stained-wall", "five-vault-bays", "processional-axis",
      "physical-enclosure"]
  });
  plan.wonderSignature = {
    id: "pre-cataclysm-suspended-rose",
    tell: "a stained stone rose hangs proud of the sanctuary wall without visible bearings",
    historyDemand: "named planar intervention or lost craft lineage"
  };
  return plan;
}

function architectureBuildPalaceCourt(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 32, y: 30 },
    primarySpatialSentence: "A broad processional stair rises through an inlaid court to a towering palace face, balcony, and unequal ceremonial towers.",
    programTopology: ["lower-arrival", "processional-stair", "raised-court", "side-ramps",
      "palace-threshold", "state-balcony", "tower-walks", "service-return"],
    constructionProfile: "elite-dressed-stone-palace-court-with-glazed-state-face",
    battleSpaceMode: ARCHITECTURE_BATTLE_SPACE_MODES.EXTERIOR_PRECINCT.id,
    assemblyClearancePolicy: "strict",
    visualLocks: ["palace face fills far band", "court remains tactically open",
      "luxury is floor-wall composition not prop count", "unequal tower crowns"],
    gameplayLocks: ["central ascent", "two side routes", "balcony fire lane",
      "tower-height contest", "retreat to lower arrival"]
  });
  architectureAddMember(plan, {
    id: "palace-arrival-apron", role: "site-road",
    center: { x: 0, y: 0.05, z: 9.5 }, size: { x: 18, y: 0.1, z: 7.0 },
    rotation: { x: 0, y: 0, z: 0 }, supportedBy: ["ground"], access: "walk"
  });
  architectureAddSlab(plan, "palace-raised-court", { x: 0, z: -2.5 },
    { x: 22, z: 13.5 }, 3.2, 3.2, "foundation", ["ground"], "walk");
  architectureAddStair(plan, {
    id: "palace-processional-stair", start: { x: 0, z: 10.0 },
    end: { x: 0, z: 4.25 }, baseY: 0.05, topY: 3.2, width: 6.2, steps: 12,
    upperLandingId: "palace-raised-court", supportedBy: ["ground"],
    cheeks: true, role: "ornamental-stone"
  });
  architectureAddStair(plan, {
    id: "palace-west-return-stair", start: { x: -10.2, z: 7.8 },
    end: { x: -8.8, z: 2.8 }, baseY: 0.05, topY: 3.2, width: 1.8, steps: 10,
    upperLandingId: "palace-raised-court", supportedBy: ["ground"],
    cheeks: true, role: "masonry-edge"
  });
  architectureAddStair(plan, {
    id: "palace-east-return-stair", start: { x: 10.2, z: 7.8 },
    end: { x: 8.8, z: 2.8 }, baseY: 0.05, topY: 3.2, width: 1.8, steps: 10,
    upperLandingId: "palace-raised-court", supportedBy: ["ground"],
    cheeks: true, role: "masonry-edge"
  });
  [-7.0, 0, 7.0].forEach(function(x, index){
    architectureAddBox(plan, "palace-court-inlay-" + index,
      { x: x, y: 3.225, z: -1.4 }, { x: index === 1 ? 0.52 : 0.26, y: 0.05, z: 10.2 },
      index === 1 ? "arcane-residue" : "luxury-floor", ["palace-raised-court"]);
  });
  architectureAddWallRun(plan, {
    id: "palace-state-face", start: { x: -11, z: -9.25 }, end: { x: 11, z: -9.25 },
    baseY: 3.2, height: 9.0, thickness: 0.62, supportedBy: ["palace-raised-court"],
    openings: [
      { id: "palace-west-window", station: 4.0, width: 2.0, bottom: 2.4,
        height: 3.8, kind: "state-window", observation: true },
      { id: "palace-great-door", station: 11.0, width: 3.6, bottom: 0,
        height: 5.1, kind: "state-door", access: "walk" },
      { id: "palace-east-window", station: 18.0, width: 2.0, bottom: 2.4,
        height: 3.8, kind: "state-window", observation: true }
    ]
  });
  [-7, 7].forEach(function(x, index){
    architectureAddBox(plan, "palace-state-glass-" + index,
      { x: x, y: 3.2 + 2.4 + 1.9, z: -9.2 }, { x: 1.82, y: 3.62, z: 0.14 },
      "stained-glass", ["palace-state-face"]);
  });
  [-10.2, -7.1, -3.8, 0, 3.8, 7.1, 10.2].forEach(function(x, index){
    architectureAddBox(plan, "palace-facade-pilaster-" + index,
      { x: x, y: 7.9, z: -8.85 }, { x: 0.62, y: 9.4, z: 0.75 },
      "ornamental-stone", ["palace-raised-court"],
      { ownerId: "palace-state-face" });
  });
  architectureAddSlab(plan, "palace-state-balcony", { x: 0, z: -8.45 },
    { x: 12.6, z: 2.25 }, 8.25, 0.32, "ornamental-stone",
    ["palace-state-face"], "walk");
  architectureAddParapetRect(plan, "palace-balcony-rail", { x: 0, z: -8.45 },
    12.3, 2.0, 8.25, 0.78, 0.24, ["palace-state-balcony"], "north");
  architectureAddHipRoof(plan, {
    id: "palace-state-wing-roof", center: { x: 0, z: -11.25 },
    width: 17.6, depth: 4.0, eaveY: 12.45, pitchDeg: 31,
    overhang: 0.42, thickness: 0.2, enclosure: "partial",
    supportedBy: ["palace-state-face"],
    edgeInfills: [{
      id: "palace-state-wing-roof:south-crown", edge: "south",
      width: 17.2, depth: 4.0, wallTopY: 12.2, thickness: 0.58,
      supportedBy: ["palace-state-face"], ownerId: "palace-state-face"
    }]
  });
  [-9.4, 9.4].forEach(function(x, index){
    var height = index === 0 ? 12.8 : 11.0;
    architectureAddBox(plan, "palace-tower-" + index,
      { x: x, y: 3.2 + height / 2, z: -7.6 },
      { x: 4.6, y: height, z: 5.4 }, "masonry-wall",
      ["palace-raised-court"], { ownerId: "palace-tower-" + index });
    architectureAddSlab(plan, "palace-tower-walk-" + index,
      { x: x, z: -7.6 }, { x: 4.45, z: 5.2 }, 3.2 + height,
      0.26, "ornamental-stone", ["palace-tower-" + index], "walk");
    architectureAddParapetRect(plan, "palace-tower-parapet-" + index,
      { x: x, z: -7.6 }, 4.3, 5.05, 3.2 + height, 0.85, 0.28,
      ["palace-tower-walk-" + index], index === 0 ? "east" : "west");
    architectureAddHipRoof(plan, {
      id: "palace-tower-roof-" + index, center: { x: x, z: -7.6 },
      width: 4.75, depth: 5.55, eaveY: 3.2 + height + 0.18,
      pitchDeg: index === 0 ? 35 : 31, overhang: 0.34, thickness: 0.18,
      enclosure: "enclosed", supportedBy: ["palace-tower-" + index],
      edgeInfills: [{
        id: "palace-tower-roof-" + index + ":north-crown", edge: "north",
        width: 4.6, depth: 5.4, wallTopY: 3.2 + height, thickness: 0.42,
        supportedBy: ["palace-tower-" + index], ownerId: "palace-tower-" + index
      }, {
        id: "palace-tower-roof-" + index + ":south-crown", edge: "south",
        width: 4.6, depth: 5.4, wallTopY: 3.2 + height, thickness: 0.42,
        supportedBy: ["palace-tower-" + index], ownerId: "palace-tower-" + index
      }, {
        id: "palace-tower-roof-" + index + ":west-crown", edge: "west",
        width: 4.6, depth: 5.4, wallTopY: 3.2 + height, thickness: 0.42,
        supportedBy: ["palace-tower-" + index], ownerId: "palace-tower-" + index
      }, {
        id: "palace-tower-roof-" + index + ":east-crown", edge: "east",
        width: 4.6, depth: 5.4, wallTopY: 3.2 + height, thickness: 0.42,
        supportedBy: ["palace-tower-" + index], ownerId: "palace-tower-" + index
      }]
    });
  });
  architectureAddStair(plan, {
    id: "palace-balcony-stair", start: { x: 4.9, z: -3.9 },
    end: { x: 4.9, z: -7.9 }, baseY: 3.2, topY: 8.25, width: 1.55,
    steps: 13, upperLandingId: "palace-state-balcony",
    supportedBy: ["palace-raised-court", "palace-state-face"],
    cheeks: true, role: "ornamental-stone"
  });
  architectureAddBox(plan, "palace-impossible-lintel",
    { x: 0, y: 10.2, z: -8.72 }, { x: 6.4, y: 0.48, z: 0.5 },
    "arcane-residue", ["palace-state-face"], {
      ownerId: "palace-great-door", condition: "repaired"
    });
  architectureAddAccess(plan, "palace-central-route", "lower-arrival",
    "palace-threshold", "stair", 6.2);
  architectureAddAccess(plan, "palace-west-route", "lower-arrival",
    "raised-court", "stair", 1.8);
  architectureAddAccess(plan, "palace-east-route", "lower-arrival",
    "raised-court", "stair", 1.8);
  architectureAddAccess(plan, "palace-balcony-route", "raised-court",
    "state-balcony", "stair", 1.55);
  architectureRegisterClearanceEnvelope(plan, {
    id: "palace-broad-medium-procession", profileId: "broad-medium",
    zoneIds: ["lower-arrival", "processional-stair", "raised-court", "palace-threshold"],
    portalOpeningIds: ["palace-great-door"], accessEdgeIds: ["palace-central-route"],
    routeWidth: 6.2, turnDiameter: 4.0, verticalMode: "broad-stair"
  });
  plan.wonderSignature = {
    id: "gravity-released-state-lintel",
    tell: "the portal lintel floats between pilasters whose damage records an older magical siege",
    historyDemand: "elite repair culture preserved a planar exception instead of rebuilding it"
  };
  return plan;
}

function architectureBuildArcaneAqueduct(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 34, y: 26 },
    primarySpatialSentence: "A civic aqueduct crosses the battlefield on five immense bays before its water climbs an unsupported arcane lift.",
    programTopology: ["lower-road", "arch-bays", "pier-cover", "end-stairs",
      "elevated-waterwalk", "arcane-lift", "far-continuation"],
    constructionProfile: "monumental-civic-masonry-with-planar-water-lift",
    battleSpaceMode: ARCHITECTURE_BATTLE_SPACE_MODES.EXTERIOR_PRECINCT.id,
    visualLocks: ["five readable bays", "walkable water crown", "one impossible rising span",
      "infrastructure scale dominates props"],
    gameplayLocks: ["ground weave through arches", "pier cover", "two crown accesses",
      "elevated fire lane", "water hazard edge"]
  });
  architectureAddMember(plan, {
    id: "aqueduct-lower-road", role: "site-road",
    center: { x: 0, y: 0.05, z: 0 }, size: { x: 30, y: 0.1, z: 8.5 },
    rotation: { x: 0, y: 0, z: 0 }, supportedBy: ["ground"], access: "walk"
  });
  architectureAddWallRun(plan, {
    id: "aqueduct-bearing-wall", start: { x: -14, z: 0 }, end: { x: 14, z: 0 },
    baseY: 0.1, height: 8.7, thickness: 1.5, supportedBy: ["ground"],
    openings: [2.8, 8.4, 14, 19.6, 25.2].map(function(station, index){
      return {
        id: "aqueduct-bay-" + index, station: station, width: 3.65,
        bottom: 0, height: 6.25, kind: "civic-arch", access: "walk"
      };
    })
  });
  [-14, -11.2, -8.4, -5.6, -2.8, 0, 2.8, 5.6, 8.4, 11.2, 14]
    .forEach(function(x, index){
      if(index % 2 === 0){
        architectureAddBox(plan, "aqueduct-pier-buttress-" + index,
          { x: x, y: 3.3, z: 0.95 }, { x: 1.15, y: 6.4, z: 1.1 },
          "masonry-edge", ["ground"], { ownerId: "aqueduct-bearing-wall",
            cover: "full-cover" });
      }
    });
  [-11.2, -5.6, 0, 5.6, 11.2].forEach(function(x, bayIndex){
    var points = [];
    for(var segment = 0; segment <= 6; segment++){
      var angle = Math.PI - segment * Math.PI / 6;
      points.push({
        x: x + Math.cos(angle) * 2.0,
        y: 5.8 + Math.sin(angle) * 1.7,
        z: 0.84
      });
    }
    for(var piece = 0; piece < points.length - 1; piece++){
      architectureAddBeam3D(plan, "aqueduct-voussoir-" + bayIndex + "-" + piece,
        points[piece], points[piece + 1], 0.34, "ornamental-stone",
        ["aqueduct-bearing-wall"], { ownerId: "aqueduct-arch-ring-" + bayIndex });
    }
  });
  architectureAddSlab(plan, "aqueduct-crown-walk", { x: -3.4, z: 0 },
    { x: 21.2, z: 2.65 }, 9.0, 0.32, "ornamental-stone",
    ["aqueduct-bearing-wall"], "walk");
  architectureAddBox(plan, "aqueduct-water-channel",
    { x: -3.4, y: 9.18, z: 0 }, { x: 20.5, y: 0.24, z: 1.05 },
    "site-water", ["aqueduct-crown-walk"], { access: "hazard" });
  architectureAddRunPrism(plan, "aqueduct-north-coping", { x: -14, z: -1.2 },
    { x: 7.2, z: -1.2 }, 9.0, 0.72, 0.28, "ornamental-stone",
    ["aqueduct-crown-walk"], { cover: "half-cover" });
  architectureAddRunPrism(plan, "aqueduct-south-coping", { x: -14, z: 1.2 },
    { x: 7.2, z: 1.2 }, 9.0, 0.72, 0.28, "ornamental-stone",
    ["aqueduct-crown-walk"], { cover: "half-cover" });
  architectureAddStair(plan, {
    id: "aqueduct-west-stair", start: { x: -15.7, z: 4.0 },
    end: { x: -12.8, z: 1.2 }, baseY: 0.05, topY: 9.0, width: 1.7,
    steps: 18, upperLandingId: "aqueduct-crown-walk",
    supportedBy: ["ground", "aqueduct-bearing-wall"], cheeks: true,
    role: "masonry-edge"
  });
  architectureAddStair(plan, {
    id: "aqueduct-east-stair", start: { x: 9.1, z: 4.1 },
    end: { x: 6.8, z: 1.15 }, baseY: 0.05, topY: 9.0, width: 1.7,
    steps: 18, upperLandingId: "aqueduct-crown-walk",
    supportedBy: ["ground", "aqueduct-bearing-wall"], cheeks: true,
    role: "masonry-edge"
  });
  architectureAddBeam3D(plan, "aqueduct-rising-water",
    { x: 6.7, y: 9.18, z: 0 }, { x: 11.1, y: 11.85, z: 0 },
    0.58, "site-water", ["aqueduct-crown-walk"],
    { ownerId: "aqueduct-planar-water-lift", access: "hazard" });
  architectureAddBeam3D(plan, "aqueduct-lift-rail-north",
    { x: 6.7, y: 9.0, z: -0.72 }, { x: 11.1, y: 11.67, z: -0.72 },
    0.25, "arcane-residue", ["aqueduct-bearing-wall"],
    { ownerId: "aqueduct-planar-water-lift" });
  architectureAddBeam3D(plan, "aqueduct-lift-rail-south",
    { x: 6.7, y: 9.0, z: 0.72 }, { x: 11.1, y: 11.67, z: 0.72 },
    0.25, "arcane-residue", ["aqueduct-bearing-wall"],
    { ownerId: "aqueduct-planar-water-lift" });
  architectureAddSlab(plan, "aqueduct-floating-continuation", { x: 12.5, z: 0 },
    { x: 5.0, z: 2.65 }, 11.7, 0.32, "ornamental-stone",
    ["aqueduct-planar-water-lift"], "walk");
  architectureAddBox(plan, "aqueduct-floating-water",
    { x: 12.5, y: 11.88, z: 0 }, { x: 4.5, y: 0.24, z: 1.05 },
    "site-water", ["aqueduct-floating-continuation"], { access: "hazard" });
  architectureAddAccess(plan, "aqueduct-ground-weave", "lower-road",
    "far-continuation", "walk", 3.65);
  architectureAddAccess(plan, "aqueduct-west-crown-route", "lower-road",
    "elevated-waterwalk", "stair", 1.7);
  architectureAddAccess(plan, "aqueduct-east-crown-route", "lower-road",
    "elevated-waterwalk", "stair", 1.7);
  plan.wonderSignature = {
    id: "planar-water-lift",
    tell: "municipal water rises through open air onto a physically disconnected continuation",
    historyDemand: "a civic magical utility maintained as infrastructure, not decorative spectacle"
  };
  return plan;
}

function architectureBuildStarArchive(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 30, y: 30 },
    primarySpatialSentence: "An octagonal archive wraps a sunken star floor, high gallery, and axleless suspended orrery beneath a cutaway dome.",
    programTopology: ["archive-entry", "sunken-star-floor", "outer-reading-ring",
      "column-ring", "high-gallery", "orrery-control", "service-exit"],
    constructionProfile: "elite-octagonal-archive-with-glazed-dome-and-axleless-orrery",
    battleSpaceMode: ARCHITECTURE_BATTLE_SPACE_MODES.DEDICATED_INTERIOR.id,
    visualLocks: ["octagonal room remains legible", "central quiet floor",
      "two complete gallery arcs", "orrery owns vertical center"],
    gameplayLocks: ["outer ring circulation", "central low objective", "gallery crossfire",
      "two ascent routes", "column cover"]
  });
  architectureAddRegularPrism(plan, "archive-octagonal-floor", { x: 0, z: 0 },
    10.2, 0, 0.42, 8, "luxury-floor", ["ground"], { access: "walk" });
  architectureAddRegularPrism(plan, "archive-star-floor", { x: 0, z: 0 },
    3.25, 0.42, 0.2, 12, "arcane-residue", ["archive-octagonal-floor"],
    { access: "walk" });
  for(var spoke = 0; spoke < 8; spoke++){
    var spokeAngle = spoke * Math.PI * 2 / 8;
    architectureAddBeam3D(plan, "archive-floor-spoke-" + spoke,
      { x: Math.cos(spokeAngle) * 1.0, y: 0.67, z: Math.sin(spokeAngle) * 1.0 },
      { x: Math.cos(spokeAngle) * 8.8, y: 0.67, z: Math.sin(spokeAngle) * 8.8 },
      0.15, "ornamental-stone", ["archive-octagonal-floor"]);
  }
  var wallIds = [];
  var wallPoints = [];
  for(var point = 0; point < 8; point++){
    var pointAngle = -Math.PI / 2 + point * Math.PI * 2 / 8;
    wallPoints.push({ x: Math.cos(pointAngle) * 9.6, z: Math.sin(pointAngle) * 9.6 });
  }
  wallPoints.forEach(function(start, index){
    var end = wallPoints[(index + 1) % wallPoints.length];
    var wallId = "archive-outer-wall-" + index;
    wallIds.push(wallId);
    var length = architectureRunFrame(start, end).length;
    architectureAddWallRun(plan, {
      id: wallId, start: start, end: end, baseY: 0.42, height: 7.2,
      thickness: 0.48, supportedBy: ["archive-octagonal-floor"],
      openings: [{
        id: "archive-glazed-bay-" + index, station: length / 2,
        width: index === 4 ? 2.6 : 1.65, bottom: index === 4 ? 0 : 2.0,
        height: index === 4 ? 3.2 : 3.4,
        kind: index === 4 ? "archive-entry-door" : "glazed-archive-bay",
        access: index === 4 ? "walk" : "none", observation: index !== 4
      }]
    });
    if(index !== 4){
      var frame = architectureRunFrame(start, end);
      var half = 0.74;
      var center = frame.midpoint;
      var a = {
        x: center.x - frame.axis.x * half, z: center.z - frame.axis.z * half
      };
      var b = {
        x: center.x + frame.axis.x * half, z: center.z + frame.axis.z * half
      };
      architectureAddRunPrism(plan, "archive-glass-" + index, a, b,
        2.42, 3.25, 0.12, "stained-glass", [wallId], { ownerId: wallId });
    }
  });
  var columns = [];
  for(var column = 0; column < 8; column++){
    var columnAngle = column * Math.PI * 2 / 8;
    var p = { x: Math.cos(columnAngle) * 6.8, z: Math.sin(columnAngle) * 6.8 };
    columns.push(p);
    architectureAddBox(plan, "archive-column-" + column,
      { x: p.x, y: 4.35, z: p.z }, { x: 0.72, y: 7.85, z: 0.72 },
      "ornamental-stone", ["archive-octagonal-floor"], { cover: "full-cover" });
  }
  columns.forEach(function(start, index){
    var end = columns[(index + 1) % columns.length];
    architectureAddRunPrism(plan, "archive-gallery-" + index, start, end,
      4.55, 0.28, 1.55, "ornamental-stone",
      ["archive-column-" + index, "archive-column-" + ((index + 1) % 8)],
      { access: "walk" });
    architectureAddRunPrism(plan, "archive-gallery-rail-" + index, start, end,
      4.83, 0.72, 0.18, "masonry-edge", ["archive-gallery-" + index],
      { cover: "half-cover" });
  });
  architectureAddStair(plan, {
    id: "archive-west-gallery-stair", start: { x: -8.0, z: 4.8 },
    end: { x: -6.25, z: 0.8 }, baseY: 0.42, topY: 4.55, width: 1.35,
    steps: 11, upperLandingId: "archive-gallery-4",
    supportedBy: ["archive-octagonal-floor", "archive-column-4"],
    cheeks: true, role: "ornamental-stone"
  });
  architectureAddStair(plan, {
    id: "archive-east-gallery-stair", start: { x: 8.0, z: 4.8 },
    end: { x: 6.25, z: 0.8 }, baseY: 0.42, topY: 4.55, width: 1.35,
    steps: 11, upperLandingId: "archive-gallery-0",
    supportedBy: ["archive-octagonal-floor", "archive-column-0"],
    cheeks: true, role: "ornamental-stone"
  });
  for(var facet = 0; facet < 8; facet++){
    var a0 = -Math.PI / 2 + facet * Math.PI * 2 / 8;
    var a1 = -Math.PI / 2 + (facet + 1) * Math.PI * 2 / 8;
    architectureAddRoofFacet(plan, "archive-dome-facet-" + facet, [
      { x: Math.cos(a0) * 9.9, y: 8.0, z: Math.sin(a0) * 9.9 },
      { x: Math.cos(a1) * 9.9, y: 8.0, z: Math.sin(a1) * 9.9 },
      { x: Math.cos(a1) * 2.2, y: 12.25, z: Math.sin(a1) * 2.2 },
      { x: Math.cos(a0) * 2.2, y: 12.25, z: Math.sin(a0) * 2.2 }
    ], [[0, 1, 2], [0, 2, 3]], 0.2,
    ["archive-column-" + facet, "archive-column-" + ((facet + 1) % 8)]);
  }
  [2.2, 3.6].forEach(function(radius, ringIndex){
    var ringPoints = [];
    for(var ringPoint = 0; ringPoint < 16; ringPoint++){
      var angle = ringPoint * Math.PI * 2 / 16;
      ringPoints.push({
        x: Math.cos(angle) * radius,
        y: 6.8 + ringIndex * 1.45 + Math.sin(angle * (ringIndex + 1)) * 0.35,
        z: Math.sin(angle) * radius
      });
    }
    ringPoints.forEach(function(p, index){
      architectureAddBeam3D(plan, "archive-orrery-" + ringIndex + "-" + index,
        p, ringPoints[(index + 1) % ringPoints.length], 0.15,
        ringIndex ? "arcane-residue" : "metal-mechanism",
        ["archive-column-" + (index % 8)], { ownerId: "archive-axleless-orrery" });
    });
  });
  architectureAddAccess(plan, "archive-entry-route", "archive-entry",
    "outer-reading-ring", "walk", 2.6);
  architectureAddAccess(plan, "archive-west-gallery-route", "outer-reading-ring",
    "high-gallery", "stair", 1.35);
  architectureAddAccess(plan, "archive-east-gallery-route", "outer-reading-ring",
    "high-gallery", "stair", 1.35);
  architectureRegisterClearanceEnvelope(plan, {
    id: "archive-broad-medium-entry", profileId: "broad-medium",
    zoneIds: ["archive-entry", "outer-reading-ring", "sunken-star-floor"],
    portalOpeningIds: ["archive-glazed-bay-4"], accessEdgeIds: ["archive-entry-route"],
    routeWidth: 2.6, turnDiameter: 4.2, verticalMode: "ramp"
  });
  architectureApplyDollhouseCutaway(plan, {
    id: "archive-camera-dollhouse",
    wallRunIds: ["archive-outer-wall-3", "archive-outer-wall-4", "archive-outer-wall-5"],
    memberPrefixes: ["archive-dome-facet-3", "archive-dome-facet-4", "archive-dome-facet-5"],
    preserves: ["five-dome-facets", "complete-far-gallery", "orrery", "physical-enclosure"]
  });
  plan.wonderSignature = {
    id: "axleless-orrery",
    tell: "two charting rings hold position and precess without a central axle",
    historyDemand: "the archive was built around a persistent planar instrument"
  };
  return plan;
}

function architectureScaleMegainteriorAssembly(plan, horizontalScale, verticalScale){
  function scalePoint(point){
    point.x = architectureRound(point.x * horizontalScale);
    point.y = architectureRound((point.y || 0) * verticalScale);
    point.z = architectureRound(point.z * horizontalScale);
  }
  plan.compiledMembers.forEach(function(member){
    scalePoint(member.center);
    member.size.x = architectureRound(member.size.x * horizontalScale);
    member.size.y = architectureRound(member.size.y * verticalScale);
    member.size.z = architectureRound(member.size.z * horizontalScale);
    (member.vertices || []).forEach(scalePoint);
  });
  plan.levels.forEach(function(level){
    level.topY = architectureRound(level.topY * verticalScale);
    level.footprint.x = architectureRound(level.footprint.x * horizontalScale);
    level.footprint.z = architectureRound(level.footprint.z * horizontalScale);
    level.footprint.w = architectureRound(level.footprint.w * horizontalScale);
    level.footprint.d = architectureRound(level.footprint.d * horizontalScale);
  });
  plan.wallRuns.forEach(function(run){
    run.start.x = architectureRound(run.start.x * horizontalScale);
    run.start.z = architectureRound(run.start.z * horizontalScale);
    run.end.x = architectureRound(run.end.x * horizontalScale);
    run.end.z = architectureRound(run.end.z * horizontalScale);
    run.baseY = architectureRound(run.baseY * verticalScale);
    run.height = architectureRound(run.height * verticalScale);
    run.thickness = architectureRound(run.thickness * horizontalScale);
    run.openings.forEach(function(opening){
      opening.station = architectureRound(opening.station * horizontalScale);
      opening.width = architectureRound(opening.width * horizontalScale);
      opening.bottom = architectureRound(opening.bottom * verticalScale);
      opening.height = architectureRound(opening.height * verticalScale);
    });
  });
  plan.openings.forEach(function(opening){
    opening.station = architectureRound(opening.station * horizontalScale);
    opening.width = architectureRound(opening.width * horizontalScale);
    opening.bottom = architectureRound(opening.bottom * verticalScale);
    opening.height = architectureRound(opening.height * verticalScale);
    opening.depth = architectureRound(opening.depth * horizontalScale);
  });
  plan.stairs.forEach(function(stair){
    stair.start.x = architectureRound(stair.start.x * horizontalScale);
    stair.start.z = architectureRound(stair.start.z * horizontalScale);
    stair.end.x = architectureRound(stair.end.x * horizontalScale);
    stair.end.z = architectureRound(stair.end.z * horizontalScale);
    stair.baseY = architectureRound(stair.baseY * verticalScale);
    stair.topY = architectureRound(stair.topY * verticalScale);
    stair.foundationBaseY = architectureRound(stair.foundationBaseY * verticalScale);
    stair.width = architectureRound(stair.width * horizontalScale);
    stair.clearanceHeight = architectureRound(stair.clearanceHeight * verticalScale);
  });
  plan.accessGraph.forEach(function(edge){
    edge.width = architectureRound(edge.width * horizontalScale);
  });
  plan.clearanceEnvelopes.forEach(function(envelope){
    envelope.routeWidth = architectureRound(envelope.routeWidth * horizontalScale);
    envelope.turnDiameter = architectureRound(envelope.turnDiameter * horizontalScale);
  });
  plan.lightSockets.forEach(function(socket){
    scalePoint(socket.at);
    socket.distance = architectureRound(socket.distance * horizontalScale);
  });
}

function architectureBuildGrandConcourseCorner(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 52, y: 52 },
    primarySpatialSentence: "One cropped corner of a ten-thousand-year-old giant concourse survives as human-scale terrain beneath broken galleries, colossal glazing, and vaults that continue beyond the battle window.",
    programTopology: ["south-concourse-continuation", "east-concourse-continuation",
      "ground-crossing", "grand-stair", "first-gallery", "upper-gallery",
      "window-wall", "clock-objective", "service-arcade"],
    constructionProfile: "antediluvian-giant-transit-concourse-with-human-reoccupation-works",
    physicalState: "ruined",
    operatingState: "reoccupied",
    battleSpaceMode: ARCHITECTURE_BATTLE_SPACE_MODES.DEDICATED_INTERIOR.id,
    assemblyClearancePolicy: "strict",
    visualLocks: ["no exterior silhouette", "north and west architecture leave the frame",
      "human figures read as tiny", "giant circulation reads as terrain",
      "three playable levels", "broken colossal glazing controls color and light",
      "one corner implies a much larger whole", "later timber occupation stays human-scaled"],
    gameplayLocks: ["two ground continuations", "broad main ascent", "secondary upper ascent",
      "gallery crossfire", "column cover", "central quiet crossing"]
  });
  architectureAddSlab(plan, "concourse-floor", { x: 0, z: 0 }, { x: 27, z: 27 },
    0.42, 0.42, "luxury-floor", ["ground"], "walk");
  [-9, -3, 3, 9].forEach(function(x, index){
    architectureAddBox(plan, "concourse-floor-north-line-" + index,
      { x: x, y: 0.455, z: 0 }, { x: 0.24, y: 0.07, z: 26.0 },
      index === 1 ? "arcane-residue" : "ornamental-stone", ["concourse-floor"]);
    architectureAddBox(plan, "concourse-floor-west-line-" + index,
      { x: 0, y: 0.458, z: x }, { x: 26.0, y: 0.075, z: 0.24 },
      index === 2 ? "gilded-metal" : "ornamental-stone", ["concourse-floor"]);
  });
  architectureAddWallRun(plan, {
    id: "concourse-north-wall", start: { x: -13.5, z: -13.5 },
    end: { x: 13.5, z: -13.5 }, baseY: 0.42, height: 22.0,
    thickness: 0.72, supportedBy: ["concourse-floor"],
    openings: [4.5, 13.5, 22.5].map(function(station, index){
      return {
        id: "concourse-north-great-window-" + index, station: station,
        width: 5.8, bottom: 7.0, height: 11.5,
        kind: "monumental-glazed-window", observation: true
      };
    })
  });
  [-9, 0, 9].forEach(function(x, index){
    architectureAddBox(plan, "concourse-north-glass-" + index,
      { x: x, y: 0.42 + 7.0 + 5.75, z: -13.44 },
      { x: 5.55, y: 11.25, z: 0.16 }, "stained-glass",
      ["concourse-north-wall"], { ownerId: "concourse-north-wall" });
  });
  architectureAddWallRun(plan, {
    id: "concourse-west-wall", start: { x: -13.5, z: 13.5 },
    end: { x: -13.5, z: -13.5 }, baseY: 0.42, height: 22.0,
    thickness: 0.72, supportedBy: ["concourse-floor"],
    openings: [4.5, 13.5, 22.5].map(function(station, index){
      return {
        id: "concourse-west-great-window-" + index, station: station,
        width: 5.8, bottom: 7.0, height: 11.5,
        kind: "monumental-glazed-window", observation: true
      };
    })
  });
  [-9, 0, 9].forEach(function(z, index){
    architectureAddBox(plan, "concourse-west-glass-" + index,
      { x: -13.44, y: 0.42 + 7.0 + 5.75, z: z },
      { x: 0.16, y: 11.25, z: 5.55 }, "stained-glass",
      ["concourse-west-wall"], { ownerId: "concourse-west-wall" });
  });
  [-13.0, -6.0, 1.0, 8.0, 13.0].forEach(function(x, index){
    architectureAddBox(plan, "concourse-north-pier-" + index,
      { x: x, y: 10.8, z: -12.85 }, { x: 1.2, y: 20.75, z: 1.25 },
      "ornamental-stone", ["concourse-floor"],
      { ownerId: "concourse-north-colonnade", cover: "full-cover" });
    architectureAddBox(plan, "concourse-north-pier-" + index + ":capital",
      { x: x, y: 21.3, z: -12.85 }, { x: 1.9, y: 0.55, z: 1.9 },
      "gilded-metal", ["concourse-north-pier-" + index],
      { ownerId: "concourse-north-colonnade" });
  });
  [-13.0, -6.0, 1.0, 8.0, 13.0].forEach(function(z, index){
    architectureAddBox(plan, "concourse-west-pier-" + index,
      { x: -12.85, y: 10.8, z: z }, { x: 1.25, y: 20.75, z: 1.2 },
      "ornamental-stone", ["concourse-floor"],
      { ownerId: "concourse-west-colonnade", cover: "full-cover" });
    architectureAddBox(plan, "concourse-west-pier-" + index + ":capital",
      { x: -12.85, y: 21.3, z: z }, { x: 1.9, y: 0.55, z: 1.9 },
      "gilded-metal", ["concourse-west-pier-" + index],
      { ownerId: "concourse-west-colonnade" });
  });
  architectureAddSlab(plan, "concourse-north-gallery", { x: 0, z: -11.35 },
    { x: 26.2, z: 3.6 }, 7.65, 0.34, "ornamental-stone",
    ["concourse-north-wall", "concourse-north-colonnade"], "walk");
  architectureAddSlab(plan, "concourse-west-gallery", { x: -11.35, z: 0 },
    { x: 3.6, z: 26.2 }, 7.65, 0.34, "ornamental-stone",
    ["concourse-west-wall", "concourse-west-colonnade"], "walk");
  architectureAddRunPrism(plan, "concourse-north-gallery-rail",
    { x: -13.1, z: -9.75 }, { x: 13.1, z: -9.75 },
    7.65, 0.92, 0.25, "gilded-metal", ["concourse-north-gallery"],
    { cover: "half-cover" });
  architectureAddRunPrism(plan, "concourse-west-gallery-rail",
    { x: -9.75, z: 13.1 }, { x: -9.75, z: -13.1 },
    7.65, 0.92, 0.25, "gilded-metal", ["concourse-west-gallery"],
    { cover: "half-cover" });
  architectureAddSlab(plan, "concourse-north-upper-gallery", { x: 0, z: -12.2 },
    { x: 26.2, z: 1.75 }, 13.35, 0.3, "ornamental-stone",
    ["concourse-north-wall", "concourse-north-colonnade"], "walk");
  architectureAddSlab(plan, "concourse-west-upper-gallery", { x: -12.2, z: 0 },
    { x: 1.75, z: 26.2 }, 13.35, 0.3, "ornamental-stone",
    ["concourse-west-wall", "concourse-west-colonnade"], "walk");
  architectureAddRunPrism(plan, "concourse-north-upper-rail",
    { x: -13.1, z: -11.35 }, { x: 13.1, z: -11.35 },
    13.35, 0.82, 0.22, "gilded-metal", ["concourse-north-upper-gallery"],
    { cover: "half-cover" });
  architectureAddRunPrism(plan, "concourse-west-upper-rail",
    { x: -11.35, z: 13.1 }, { x: -11.35, z: -13.1 },
    13.35, 0.82, 0.22, "gilded-metal", ["concourse-west-upper-gallery"],
    { cover: "half-cover" });
  architectureAddStair(plan, {
    id: "concourse-grand-stair", start: { x: 4.2, z: 8.8 },
    end: { x: 4.2, z: -9.4 }, baseY: 0.42, topY: 7.65,
    width: 4.6, steps: 22, upperLandingId: "concourse-north-gallery",
    supportedBy: ["concourse-floor", "concourse-north-gallery"],
    cheeks: true, role: "ornamental-stone"
  });
  architectureAddStair(plan, {
    id: "concourse-upper-stair", start: { x: -10.2, z: 10.4 },
    end: { x: -10.2, z: 1.8 }, baseY: 7.65, topY: 13.35,
    width: 2.2, steps: 17, lowerLandingId: "concourse-west-gallery",
    upperLandingId: "concourse-west-upper-gallery",
    supportedBy: ["concourse-west-gallery", "concourse-west-wall"],
    cheeks: true, role: "ornamental-stone"
  });
  [
    [{ x: -6.0, y: 20.8, z: -12.7 }, { x: -2.0, y: 24.4, z: -8.8 }],
    [{ x: 1.0, y: 20.8, z: -12.7 }, { x: 5.0, y: 24.4, z: -8.8 }],
    [{ x: -12.7, y: 20.8, z: -6.0 }, { x: -8.8, y: 24.4, z: -2.0 }],
    [{ x: -12.7, y: 20.8, z: 1.0 }, { x: -8.8, y: 24.4, z: 5.0 }]
  ].forEach(function(pair, index){
    architectureAddBeam3D(plan, "concourse-vault-spring-" + index,
      pair[0], pair[1], 0.42, "ornamental-stone",
      [index < 2 ? "concourse-north-wall" : "concourse-west-wall"],
      { ownerId: "concourse-unseen-vault" });
  });
  var clockCenter = { x: -5.6, y: 16.7, z: -11.9 };
  var clockPoints = [];
  for(var clock = 0; clock < 16; clock++){
    var clockAngle = clock * Math.PI * 2 / 16;
    clockPoints.push({
      x: clockCenter.x + Math.cos(clockAngle) * 2.4,
      y: clockCenter.y + Math.sin(clockAngle) * 2.4,
      z: clockCenter.z
    });
  }
  clockPoints.forEach(function(point, index){
    architectureAddBeam3D(plan, "concourse-celestial-clock-ring-" + index,
      point, clockPoints[(index + 1) % clockPoints.length], 0.22,
      "gilded-metal", ["concourse-north-wall"],
      { ownerId: "concourse-celestial-clock" });
    if(index % 4 === 0){
      architectureAddBeam3D(plan, "concourse-celestial-clock-spoke-" + index,
        clockCenter, point, 0.15, "arcane-residue", ["concourse-north-wall"],
        { ownerId: "concourse-celestial-clock" });
    }
  });
  [
    { id: "north-window-light-west", at: { x: -8.5, y: 13.0, z: -10.8 },
      color: 0x7fc7de, intensity: 4.2, distance: 20,
      supportId: "concourse-north-wall", purpose: "cold-monumental-window-wash" },
    { id: "north-window-light-east", at: { x: 8.5, y: 13.0, z: -10.8 },
      color: 0x7fc7de, intensity: 4.2, distance: 20,
      supportId: "concourse-north-wall", purpose: "cold-monumental-window-wash" },
    { id: "west-window-light", at: { x: -10.8, y: 13.0, z: 7.0 },
      color: 0x779dcc, intensity: 3.6, distance: 18,
      supportId: "concourse-west-wall", purpose: "cool-side-window-wash" },
    { id: "concourse-warm-chandelier-a", at: { x: 3.0, y: 11.5, z: 2.0 },
      color: 0xffb766, intensity: 5.0, distance: 17,
      supportId: "concourse-unseen-vault", purpose: "warm-civic-pool" },
    { id: "concourse-warm-chandelier-b", at: { x: -5.0, y: 10.5, z: 6.5 },
      color: 0xffc47a, intensity: 4.3, distance: 15,
      supportId: "concourse-unseen-vault", purpose: "warm-crossing-pool" }
  ].forEach(function(light){ architectureAddLightSocket(plan, light); });
  architectureAddAccess(plan, "concourse-ground-crossing", "south-concourse-continuation",
    "east-concourse-continuation", "walk", 8.0);
  architectureAddAccess(plan, "concourse-main-ascent", "ground-crossing",
    "first-gallery", "stair", 4.6);
  architectureAddAccess(plan, "concourse-upper-ascent", "first-gallery",
    "upper-gallery", "stair", 2.2);
  architectureRegisterClearanceEnvelope(plan, {
    id: "concourse-broad-medium-ground", profileId: "broad-medium",
    zoneIds: ["south-concourse-continuation", "ground-crossing",
      "east-concourse-continuation"], portalOpeningIds: [],
    accessEdgeIds: ["concourse-ground-crossing"], routeWidth: 8.0,
    turnDiameter: 6.5, verticalMode: "ramp"
  });
  plan.materializationWindow = {
    schema: "ArchitectureMegainteriorWindowV1",
    representedFraction: "one-corner-only",
    exteriorVisible: false,
    continuations: [
      { edge: "south", kind: "same-concourse-ground-and-unseen-vault" },
      { edge: "east", kind: "same-concourse-ground-and-unseen-vault" },
      { edge: "up", kind: "vault-and-institution-continue-beyond-camera" }
    ],
    forbiddenRead: "complete-building-or-dollhouse-object"
  };
  plan.wonderSignature = {
    id: "giant-concourse-celestial-clock",
    tell: "a building-sized destination clock still tracks planes and seasons without an axle",
    historyDemand: "a giant transit culture normalized planar travel as public infrastructure ten thousand years before human reoccupation"
  };
  architectureScaleMegainteriorAssembly(plan, 1.55, 1.75);
  plan.scaleRegime = {
    schema: "ArchitectureCivilizationScaleRegimeV1",
    originalBuilder: "giant",
    originalOccupantHeight: 8.5,
    currentOccupantProfile: "broad-medium",
    currentOccupantHeight: 2.15,
    ageYears: 10000,
    giantCirculationUse: "tactical-landform-and-climbable-ruin",
    currentCirculationUse: "human-scale-reoccupation-stairs-bridges-and-scaffolds",
    uniformScaleForbidden: true
  };
  plan.occupantProfile = "broad-medium";
  plan.compiledMembers.forEach(function(member){
    if(member.id.indexOf("concourse-north-wall") === 0
      || member.id.indexOf("concourse-west-wall") === 0
      || member.id.indexOf("concourse-north-pier") === 0
      || member.id.indexOf("concourse-west-pier") === 0
      || member.id.indexOf("concourse-vault-spring") === 0){
      member.condition = "ruined";
    }
  });
  /* Missing glass and vault fragments are actual absences, not a dollhouse projection. */
  plan.compiledMembers = plan.compiledMembers.filter(function(member){
    return [
      "concourse-north-glass-2", "concourse-west-glass-0",
      "concourse-vault-spring-1", "concourse-vault-spring-3"
    ].indexOf(member.id) < 0;
  });
  [
    { id: "concourse-fallen-capital-a", center: { x: 15.8, y: 1.2, z: -17.2 },
      size: { x: 4.4, y: 1.7, z: 3.5 }, rotation: { x: 0.15, y: 0.38, z: 0.22 } },
    { id: "concourse-fallen-vault-a", center: { x: -13.8, y: 1.5, z: 8.4 },
      size: { x: 7.2, y: 2.2, z: 2.8 }, rotation: { x: -0.12, y: -0.52, z: 0.18 } },
    { id: "concourse-fallen-pier-drum-a", center: { x: -2.4, y: 1.45, z: -9.0 },
      size: { x: 3.6, y: 2.7, z: 3.6 }, rotation: { x: 0.18, y: 0.14, z: 0.32 } }
  ].forEach(function(rubble){
    architectureAddBox(plan, rubble.id, rubble.center, rubble.size, "ornamental-stone",
      ["concourse-floor"], {
        ownerId: "concourse-ruin-fall", rotation: rubble.rotation,
        condition: "ruined", cover: "full-cover"
      });
  });
  /* A later occupation layer gives present-day bodies an honest route through the giant datum.
     Its narrow switchback is intentionally distinct in material and proportion from the original
     ceremonial stair, which remains oversized tactical terrain. */
  architectureAddStair(plan, {
    id: "concourse-reoccupation-lower-stair",
    start: { x: -4.2, z: 12.2 }, end: { x: -4.2, z: 0 },
    baseY: 0.74, topY: 6.85, width: 2.15, steps: 22,
    upperLandingId: "concourse-reoccupation-stair-seam",
    supportedBy: ["concourse-floor"],
    foundationBaseY: 0.42, supportMode: "grounded-solid",
    clearanceHeight: 2.2, cheeks: true, role: "repair"
  });
  architectureAddStair(plan, {
    id: "concourse-reoccupation-upper-stair",
    start: { x: -4.2, z: 0 }, end: { x: -4.2, z: -14.7 },
    baseY: 6.85, topY: 13.3875, width: 2.15, steps: 24,
    lowerLandingId: "concourse-reoccupation-stair-seam",
    upperLandingId: "concourse-north-gallery",
    supportedBy: ["concourse-floor", "concourse-north-gallery"],
    foundationBaseY: 0.42, supportMode: "grounded-solid",
    clearanceHeight: 2.2, cheeks: true, role: "repair"
  });
  architectureAddAccess(plan, "concourse-reoccupation-lower-route",
    "ground-crossing", "reoccupation-stair-seam", "stair", 2.15);
  architectureAddAccess(plan, "concourse-reoccupation-upper-route",
    "reoccupation-stair-seam", "first-gallery", "stair", 2.15);
  architectureRegisterClearanceEnvelope(plan, {
    id: "concourse-current-medium-route", profileId: "broad-medium",
    zoneIds: ["ground-crossing", "reoccupation-stair-seam", "first-gallery"],
    portalOpeningIds: [],
    accessEdgeIds: ["concourse-reoccupation-lower-route",
      "concourse-reoccupation-upper-route"],
    routeWidth: 2.15, turnDiameter: 3.4, verticalMode: "broad-stair"
  });
  return plan;
}

function architectureBuildWatchtower(def, seed){
  var plan = architecturePlanBase(def, {
    seed: seed, extentCells: { x: 18, y: 18 },
    primarySpatialSentence: "A four-level watchtower retains one load-bearing corner and an exposed stair spine.",
    programTopology: ["ground-entry", "stacked-landings", "watch-crown", "ruined-near-quarter"],
    constructionProfile: "masonry-watchtower-with-timber-floor-spine",
    physicalState: "ruined",
    operatingState: "reoccupied",
    visualLocks: ["four-storey silhouette", "former enclosure remains legible", "causal missing quarter"],
    gameplayLocks: ["stacked route", "contestable crown", "cutaway does not erase support"]
  });
  architectureAddSlab(plan, "tower-plinth", { x: 0, z: 0 }, { x: 5.5, z: 5.5 },
    0.48, 0.48, "foundation", ["ground"], "walk");
  var levelTop = [2.35, 4.25, 6.15, 8.05];
  var widths = [5.0, 4.75, 4.5, 4.25];
  for(var level = 0; level < 4; level++){
    var base = level === 0 ? 0.48 : levelTop[level - 1];
    var top = levelTop[level], w = widths[level], half = w / 2;
    /* The ruin retains an L-shaped joist deck against the two surviving load walls, not four
       complete square plates. Complete plates made the cutaway read as open shelving and claimed
       more playable floor than the ruin could causally support. The registered level is the rear
       deck; the west return and isolated stair landing share its owner/support identity. */
    architectureAddSlab(plan, "tower-floor-" + level,
      { x: 0, z: -half + 0.7 }, { x: w - 0.45, z: 1.4 },
      top, 0.2, "timber-surface",
      level === 0 ? ["tower-plinth"] : ["tower-back-" + level, "tower-west-" + level], "walk");
    architectureAddBox(plan, "tower-floor-" + level + ":west-return",
      { x: -half + 0.7, y: top - 0.1, z: 0.38 },
      { x: 1.4, y: 0.2, z: Math.max(1.6, w - 1.65) },
      "timber-surface",
      level === 0 ? ["tower-plinth"] : ["tower-west-" + level],
      { ownerId: "tower-floor-" + level, access: "walk", condition: "ruined" });
    if(level === 0){
      architectureAddBox(plan, "tower-floor-0:east-landing",
        { x: 1.6, y: top - 0.1, z: 0.62 }, { x: 1.35, y: 0.2, z: 1.35 },
        "timber-surface", ["tower-east-fragment-0", "tower-back-0"],
        { ownerId: "tower-floor-0", access: "walk", condition: "repaired" });
      architectureAddBeam3D(plan, "tower-floor-0:east-corbelling",
        { x: 1.6, y: 1.35, z: -0.05 }, { x: 1.6, y: 2.22, z: 0.62 },
        0.2, "timber-structure", ["tower-east-fragment-0"],
        { ownerId: "tower-floor-0", condition: "repaired" });
    }
    architectureAddWallRun(plan, {
      id: "tower-back-" + level, start: { x: -half, z: -half }, end: { x: half, z: -half },
      baseY: base, height: top - base, thickness: 0.38,
      supportedBy: level === 0 ? ["tower-plinth"] : ["tower-floor-" + (level - 1)],
      condition: level >= 2 ? "ruined" : "intact",
      openings: level === 0 ? [{
        id: "tower-entry", station: w * 0.72, width: 1.1, bottom: 0, height: 1.65,
        kind: "door", access: "walk"
      }] : [{
        id: "tower-slit-" + level, station: w * 0.42, width: 0.42, bottom: 0.75,
        height: 0.85, kind: "arrow-slit", observation: true
      }]
    });
    architectureAddWallRun(plan, {
      id: "tower-west-" + level, start: { x: -half, z: -half }, end: { x: -half, z: half },
      baseY: base, height: top - base, thickness: 0.38,
      supportedBy: level === 0 ? ["tower-plinth"] : ["tower-floor-" + (level - 1)],
      condition: level >= 2 ? "ruined" : "intact"
    });
    if(level < 3){
      architectureAddWallRun(plan, {
        id: "tower-east-fragment-" + level,
        start: { x: half, z: -half },
        end: { x: half, z: level === 0 ? 0.8 : (level === 1 ? -0.15 : -1.15) },
        baseY: base,
        height: (top - base) * (level === 0 ? 0.92 : (level === 1 ? 0.68 : 0.52)),
        thickness: 0.38,
        supportedBy: level === 0 ? ["tower-plinth"] : ["tower-floor-" + (level - 1)],
        condition: "ruined", cutawayGroup: "tower-missing-quarter"
      });
    }
    if(level === 0){
      architectureAddWallRun(plan, {
        id: "tower-south-fragment", start: { x: -half, z: half }, end: { x: 0.45, z: half },
        baseY: base, height: 1.25, thickness: 0.38, supportedBy: ["tower-plinth"],
        condition: "ruined", cutawayGroup: "tower-missing-quarter"
      });
    }
  }
  architectureAddBox(plan, "tower-west-back-buttress-lower",
    { x: -2.58, y: 2.05, z: -2.58 }, { x: 0.92, y: 4.1, z: 0.92 },
    "masonry-wall", ["tower-plinth"], { condition: "intact" });
  architectureAddBox(plan, "tower-west-back-buttress-upper",
    { x: -2.42, y: 5.15, z: -2.42 }, { x: 0.66, y: 2.1, z: 0.66 },
    "masonry-wall", ["tower-west-back-buttress-lower"], { condition: "ruined" });
  architectureAddParapetRect(plan, "tower-crown-parapet", { x: 0, z: 0 }, 4.15, 4.15,
    8.05, 0.78, 0.3, ["tower-floor-3"], "south");
  var stairRows = [
    { id: "tower-stair-0", start: { x: 1.6, z: 2.8 }, end: { x: 1.6, z: 0.72 },
      baseY: 0.48, topY: 2.35, landing: "tower-floor-0" },
    { id: "tower-stair-1", start: { x: 1.42, z: 0.5 }, end: { x: -1.42, z: 0.5 },
      baseY: 2.35, topY: 4.25, landing: "tower-floor-1" },
    { id: "tower-stair-2", start: { x: -1.38, z: 0.3 }, end: { x: -1.38, z: -1.5 },
      baseY: 4.25, topY: 6.15, landing: "tower-floor-2" },
    { id: "tower-stair-3", start: { x: -1.12, z: -1.42 }, end: { x: 1.12, z: -1.42 },
      baseY: 6.15, topY: 8.05, landing: "tower-floor-3" }
  ];
  stairRows.forEach(function(row){
    architectureAddStair(plan, {
      id: row.id, start: row.start, end: row.end, baseY: row.baseY, topY: row.topY,
      width: 0.92, steps: 7, upperLandingId: row.landing,
      supportedBy: [row.baseY <= 0.5 ? "tower-plinth" : "tower-floor-" + (Number(row.id.slice(-1)) - 1)],
      role: "timber-surface", cheeks: false
    });
  });
  architectureAddAssetSocket(plan, {
    id: "tower-brace", ownerId: "tower-west-0", purpose: "reoccupation-repair",
    allowedSlugs: ["timber-repair-brace"], at: { x: -2.85, y: 0.5, z: 0.9 },
    yaw: -Math.PI / 2, scale: 1.1
  });
  architectureAddAssetSocket(plan, {
    id: "tower-signal", ownerId: "tower-floor-3", purpose: "watch-signal",
    allowedSlugs: ["beacon-signal-fire-basket", "alarm-bell-yoke"],
    at: { x: 1.0, y: 8.1, z: -0.9 },
    yaw: 0, scale: 0.86
  });
  plan.cutawayGroups.push({ id: "tower-missing-quarter", mode: "physical-ruin",
    preserves: ["back-wall", "west-load-corner", "stacked-route"] });
  architectureAddAccess(plan, "tower-entry-route", "ground-entry", "tower-floor-0", "stair", 0.92);
  architectureAddAccess(plan, "tower-level-1", "tower-floor-0", "tower-floor-1", "stair", 0.92);
  architectureAddAccess(plan, "tower-level-2", "tower-floor-1", "tower-floor-2", "stair", 0.92);
  architectureAddAccess(plan, "tower-crown-route", "tower-floor-2", "watch-crown", "stair", 0.92);
  return plan;
}

/* ─── REVIEWED DISCRETE GROWTH PROOFS ────────────────────────────────────────────────────────
   These operators are the next rung after bounded affine siblings. They add complete rooms,
   storeys, circulation, roof closures, and morphology-clear routes. Each operation is reviewed as
   a named relationship; none scatters individual wall/roof members or asks the renderer to infer a
   building. */
var ARCHITECTURE_FORM_GROWTH_LAW = Object.freeze({
  schema: "ArchitectureFormGrowthLawV1",
  mode: "reviewed-discrete-growth",
  allowedOperators: Object.freeze([
    "append-room-bay", "append-service-wing", "add-complete-storey",
    "add-program-partition", "add-morphology-clear-route", "presentation-dollhouse-cutaway"
  ]),
  invariants: Object.freeze([
    "original-program-topology-retained", "support-graph-explicit",
    "roof-wall-junctions-sealed", "access-edge-for-every-added-room",
    "physical-state-independent-from-presentation-cutaway",
    "battle-space-mode-chosen-before-presentation"
  ]),
  forbidden: Object.freeze([
    "random-member-scatter", "floating-annex", "roof-gap", "unreachable-room",
    "uniform-scale-as-creature-access", "hybrid-by-default", "renderer-authored-cutaway"
  ])
});

function architectureBattleSpaceModeForForm(formId){
  if(["AF-04", "AF-10", "AF-14", "AF-16", "AF-17", "AF-20", "AF-21"].indexOf(formId) >= 0){
    return ARCHITECTURE_BATTLE_SPACE_MODES.DEDICATED_INTERIOR.id;
  }
  if(["AF-03", "AF-06", "AF-08"].indexOf(formId) >= 0){
    return ARCHITECTURE_BATTLE_SPACE_MODES.JUSTIFIED_HYBRID.id;
  }
  return ARCHITECTURE_BATTLE_SPACE_MODES.EXTERIOR_PRECINCT.id;
}

function architectureCreatureScaleProfile(profileId){
  var profile = ARCHITECTURE_CREATURE_SCALE_PROFILES[profileId];
  if(!profile) throw new Error("architectureCreatureScaleProfile: unknown " + profileId);
  return profile;
}

function architectureRegisterClearanceEnvelope(plan, spec){
  var profile = architectureCreatureScaleProfile(spec.profileId);
  var envelope = {
    id: spec.id,
    profileId: profile.id,
    zoneIds: (spec.zoneIds || []).slice(),
    portalOpeningIds: (spec.portalOpeningIds || []).slice(),
    accessEdgeIds: (spec.accessEdgeIds || []).slice(),
    routeWidth: spec.routeWidth,
    turnDiameter: spec.turnDiameter,
    verticalMode: spec.verticalMode || "ramp"
  };
  plan.clearanceEnvelopes.push(envelope);
  return envelope;
}

function architectureRoomSideFrame(spec, side){
  var halfW = spec.width / 2, halfD = spec.depth / 2;
  if(side === "north") return {
    start: { x: spec.center.x - halfW, z: spec.center.z - halfD },
    end: { x: spec.center.x + halfW, z: spec.center.z - halfD }, length: spec.width
  };
  if(side === "south") return {
    start: { x: spec.center.x + halfW, z: spec.center.z + halfD },
    end: { x: spec.center.x - halfW, z: spec.center.z + halfD }, length: spec.width
  };
  if(side === "west") return {
    start: { x: spec.center.x - halfW, z: spec.center.z + halfD },
    end: { x: spec.center.x - halfW, z: spec.center.z - halfD }, length: spec.depth
  };
  return {
    start: { x: spec.center.x + halfW, z: spec.center.z - halfD },
    end: { x: spec.center.x + halfW, z: spec.center.z + halfD }, length: spec.depth
  };
}

function architectureAddRoomModule(plan, spec){
  var baseY = spec.baseY;
  var floorId = spec.id + ":floor";
  var wallTopY = baseY + spec.wallHeight;
  var floorSupports = spec.floorSupportedBy || ["ground"];
  architectureAddSlab(plan, floorId, spec.center, { x: spec.width, z: spec.depth },
    baseY, spec.floorThickness || 0.3, spec.floorRole || "foundation", floorSupports, "walk");
  var wallIds = {};
  ["north", "south", "west", "east"].forEach(function(side){
    var frame = architectureRoomSideFrame(spec, side);
    var wallId = spec.id + ":" + side + "-wall";
    wallIds[side] = wallId;
    var openings = [];
    if(side === spec.doorSide){
      openings.push({
        id: spec.id + ":portal", station: frame.length / 2,
        width: spec.doorWidth || 1.05, bottom: 0, height: spec.doorHeight || 1.85,
        kind: spec.doorKind || "connecting-door", access: "walk"
      });
    }
    architectureAddWallRun(plan, {
      id: wallId, start: frame.start, end: frame.end, baseY: baseY,
      height: spec.wallHeight, thickness: spec.wallThickness || 0.32,
      role: spec.wallRole || "masonry-wall", supportedBy: [floorId],
      openings: openings
    });
  });
  var roofId = spec.id + ":roof";
  var roofSupportedBy = [wallIds.north, wallIds.south, wallIds.west, wallIds.east];
  if(spec.roofFamily === "shed"){
    architectureAddShedRoof(plan, {
      id: roofId, center: spec.center, width: spec.width + 0.18, depth: spec.depth + 0.18,
      eaveY: wallTopY + 0.12, pitchDeg: spec.pitchDeg || 15,
      highEdge: spec.highEdge || "west", overhang: 0.28, thickness: 0.17,
      enclosure: "enclosed", supportedBy: roofSupportedBy,
      endInfills: [{
        id: roofId + ":north-infill", side: "north",
        at: spec.center.z - spec.depth / 2, runLength: spec.width,
        wallTopY: wallTopY, thickness: spec.wallThickness || 0.32,
        supportedBy: [wallIds.north], ownerId: wallIds.north
      }, {
        id: roofId + ":south-infill", side: "south",
        at: spec.center.z + spec.depth / 2, runLength: spec.width,
        wallTopY: wallTopY, thickness: spec.wallThickness || 0.32,
        supportedBy: [wallIds.south], ownerId: wallIds.south
      }],
      edgeInfills: [{
        id: roofId + ":west-infill", edge: "west", wallTopY: wallTopY,
        spanLength: spec.depth, thickness: spec.wallThickness || 0.32,
        supportedBy: [wallIds.west], ownerId: wallIds.west
      }, {
        id: roofId + ":east-infill", edge: "east", wallTopY: wallTopY,
        spanLength: spec.depth, thickness: spec.wallThickness || 0.32,
        supportedBy: [wallIds.east], ownerId: wallIds.east
      }]
    });
  } else {
    architectureAddGableRoof(plan, {
      id: roofId, center: spec.center, width: spec.width + 0.18, depth: spec.depth + 0.18,
      eaveY: wallTopY + 0.12, pitchDeg: spec.pitchDeg || 23,
      overhang: 0.3, thickness: 0.18, enclosure: "enclosed",
      supportedBy: roofSupportedBy,
      endInfills: [{
        id: roofId + ":north-infill", side: "north",
        at: spec.center.z - spec.depth / 2, width: spec.width,
        wallTopY: wallTopY, thickness: spec.wallThickness || 0.32,
        supportedBy: [wallIds.north], ownerId: wallIds.north
      }, {
        id: roofId + ":south-infill", side: "south",
        at: spec.center.z + spec.depth / 2, width: spec.width,
        wallTopY: wallTopY, thickness: spec.wallThickness || 0.32,
        supportedBy: [wallIds.south], ownerId: wallIds.south
      }]
    });
  }
  var accessId = spec.id + ":access";
  architectureAddAccess(plan, accessId, spec.accessFrom || "existing-program",
    spec.accessTo || spec.id, "walk", spec.routeWidth || spec.doorWidth || 1.05);
  plan.programTopology.push(spec.accessTo || spec.id);
  return {
    id: spec.id, floorId: floorId, wallIds: wallIds, roofId: roofId,
    portalId: spec.id + ":portal", accessId: accessId
  };
}

function architectureRemoveRoof(plan, roofId){
  var closureIds = {};
  plan.roofJunctions.forEach(function(junction){
    if(junction.roofId === roofId) closureIds[junction.memberId] = true;
  });
  plan.compiledMembers = plan.compiledMembers.filter(function(member){
    return member.id.indexOf(roofId + ":") !== 0 && !closureIds[member.id];
  });
  plan.roofs = plan.roofs.filter(function(roof){ return roof.id !== roofId; });
  plan.roofJunctions = plan.roofJunctions.filter(function(junction){
    return junction.roofId !== roofId;
  });
}

/* Physical members remain in the assembly/collision plan. The engine names an explicit hidden set
   for projection and adds low wall stubs; the renderer only obeys those ids. This prevents a
   dollhouse view from silently becoming a ruin or from changing the playable room graph. */
function architectureApplyDollhouseCutaway(plan, spec){
  var hidden = {};
  var wallIds = spec.wallRunIds || [];
  plan.compiledMembers.forEach(function(member){
    if(wallIds.indexOf(member.ownerId) >= 0) hidden[member.id] = true;
    (spec.memberPrefixes || []).forEach(function(prefix){
      if(member.id.indexOf(prefix) === 0) hidden[member.id] = true;
    });
  });
  wallIds.forEach(function(wallId){
    var run = plan.wallRuns.filter(function(row){ return row.id === wallId; })[0];
    if(!run) throw new Error("architectureApplyDollhouseCutaway: missing wall " + wallId);
    run.cutawayGroup = spec.id;
    architectureAddRunPrism(plan, spec.id + ":" + wallId + ":stub",
      run.start, run.end, run.baseY, spec.stubHeight || 0.62, run.thickness,
      "cutaway-cap", run.supportedBy, {
        ownerId: wallId + ":presentation-stub", cutawayGroup: spec.id,
        cover: "half-cover"
      });
  });
  Object.keys(hidden).forEach(function(id){
    if(plan.presentation.hiddenMemberIds.indexOf(id) < 0){
      plan.presentation.hiddenMemberIds.push(id);
    }
  });
  var group = {
    id: spec.id, mode: "presentation-dollhouse",
    wallRunIds: wallIds.slice(), hiddenMemberIds: Object.keys(hidden),
    preserves: (spec.preserves || ["collision", "room-topology", "physical-state"]).slice()
  };
  plan.presentation.cutawayGroups.push(group);
  plan.cutawayGroups.push(group);
  return group;
}

function architectureGrowthBegin(plan){
  plan.growth = {
    schema: ARCHITECTURE_FORM_GROWTH_LAW.schema,
    mode: ARCHITECTURE_FORM_GROWTH_LAW.mode,
    beforeFingerprint: architectureVariantFingerprint(plan),
    afterFingerprint: null,
    operations: [],
    invariants: ARCHITECTURE_FORM_GROWTH_LAW.invariants.slice()
  };
  plan.phase = "reviewed-discrete-growth-proof";
}

function architectureGrowSecondSuite(plan){
  architectureGrowthBegin(plan);
  var module;
  if(plan.formId === "AF-09"){
    module = architectureAddRoomModule(plan, {
      id: "frontage-rear-stock-wing", center: { x: 3.5, z: -5.0 },
      width: 3.3, depth: 4.0, baseY: 0.32, wallHeight: 2.75,
      doorSide: "south", doorWidth: 1.1, doorHeight: 1.9,
      roofFamily: "shed", highEdge: "east", accessFrom: "service-lane",
      accessTo: "rear-stock-room", routeWidth: 1.1
    });
    plan.growth.operations.push("append-room-bay:rear-stock-wing");
  } else if(plan.formId === "AF-10"){
    module = architectureAddRoomModule(plan, {
      id: "custody-broad-intake-annex", center: { x: 7.35, z: 1.2 },
      width: 3.4, depth: 5.2, baseY: 0.36, wallHeight: 2.8,
      doorSide: "west", doorWidth: 1.6, doorHeight: 2.2,
      roofFamily: "shed", highEdge: "east", accessFrom: "keeper-landing",
      accessTo: "broad-medium-intake-room", routeWidth: 1.7
    });
    architectureRegisterClearanceEnvelope(plan, {
      id: "custody-broad-medium-clearance", profileId: "broad-medium",
      zoneIds: ["broad-medium-intake-room"], portalOpeningIds: [module.portalId],
      accessEdgeIds: [module.accessId], routeWidth: 1.7, turnDiameter: 2.3,
      verticalMode: "ramp"
    });
    architectureApplyDollhouseCutaway(plan, {
      id: "custody-south-dollhouse", wallRunIds: ["custody-intake-wall"],
      memberPrefixes: ["custody-intake-roof:plane", "custody-intake-roof:fascia:1"],
      preserves: ["cell-roof", "secure-corridor", "keeper-landing", "physical-enclosure"]
    });
    plan.growth.operations.push("append-service-wing:broad-medium-intake",
      "add-morphology-clear-route:broad-medium", "presentation-dollhouse-cutaway:south");
  } else if(plan.formId === "AF-11"){
    module = architectureAddRoomModule(plan, {
      id: "shaft-long-medium-service-bay", center: { x: -4.25, z: 0.2 },
      width: 3.4, depth: 5.0, baseY: 0.24, wallHeight: 2.65,
      doorSide: "east", doorWidth: 1.5, doorHeight: 1.85,
      roofFamily: "shed", highEdge: "west", accessFrom: "haul-approach",
      accessTo: "long-medium-service-bay", routeWidth: 1.7
    });
    architectureRegisterClearanceEnvelope(plan, {
      id: "shaft-long-medium-clearance", profileId: "long-medium",
      zoneIds: ["long-medium-service-bay"], portalOpeningIds: [module.portalId],
      accessEdgeIds: [module.accessId], routeWidth: 1.7, turnDiameter: 3.0,
      verticalMode: "switchback-ramp"
    });
    plan.growth.operations.push("append-service-wing:long-medium-haul-bay",
      "add-morphology-clear-route:long-medium");
  } else if(plan.formId === "AF-12"){
    module = architectureAddRoomModule(plan, {
      id: "commune-upper-east-wing", center: { x: 7.25, z: -3.2 },
      width: 3.2, depth: 4.0, baseY: 2.85, wallHeight: 2.55,
      floorSupportedBy: ["commune-upper-terrace"],
      doorSide: "west", doorWidth: 1.5, doorHeight: 2.15,
      roofFamily: "gable", accessFrom: "upper-hall",
      accessTo: "broad-medium-council-room", routeWidth: 1.65
    });
    architectureRegisterClearanceEnvelope(plan, {
      id: "commune-broad-medium-clearance", profileId: "broad-medium",
      zoneIds: ["broad-medium-council-room"], portalOpeningIds: [module.portalId],
      accessEdgeIds: [module.accessId], routeWidth: 1.65, turnDiameter: 2.2,
      verticalMode: "broad-stair"
    });
    plan.growth.operations.push("append-room-bay:upper-east-wing",
      "add-morphology-clear-route:broad-medium");
  } else if(plan.formId === "AF-13"){
    module = architectureAddRoomModule(plan, {
      id: "bridgehouse-south-service-wing", center: { x: 3.25, z: 3.9 },
      width: 3.4, depth: 3.4, baseY: 1.16, wallHeight: 2.65,
      floorSupportedBy: ["bridge-river-pier-1"],
      doorSide: "north", doorWidth: 1.55, doorHeight: 2.15,
      roofFamily: "shed", highEdge: "east", accessFrom: "service-deck",
      accessTo: "broad-medium-waterwork-bay", routeWidth: 1.65
    });
    architectureRegisterClearanceEnvelope(plan, {
      id: "bridgehouse-broad-medium-clearance", profileId: "broad-medium",
      zoneIds: ["broad-medium-waterwork-bay"], portalOpeningIds: [module.portalId],
      accessEdgeIds: [module.accessId], routeWidth: 1.65, turnDiameter: 2.2,
      verticalMode: "ramp"
    });
    plan.growth.operations.push("append-service-wing:waterwork-bay",
      "add-morphology-clear-route:broad-medium");
  } else if(plan.formId === "AF-14"){
    architectureRemoveRoof(plan, "inn-hip-roof");
    architectureAddSlab(plan, "inn-third-floor", { x: 0, z: 0 },
      { x: 9.35, z: 6.45 }, 4.92, 0.22, "timber-surface",
      ["inn-front-wall", "inn-rear-wall", "inn-west-wall", "inn-east-wall"], "walk");
    [
      ["north", { x: -4.4, z: -3.0 }, { x: 4.4, z: -3.0 }],
      ["south", { x: 4.4, z: 3.0 }, { x: -4.4, z: 3.0 }],
      ["west", { x: -4.4, z: 3.0 }, { x: -4.4, z: -3.0 }],
      ["east", { x: 4.4, z: -3.0 }, { x: 4.4, z: 3.0 }]
    ].forEach(function(row){
      architectureAddWallRun(plan, {
        id: "inn-third-" + row[0] + "-wall", start: row[1], end: row[2],
        baseY: 4.92, height: 2.25, thickness: 0.34,
        supportedBy: ["inn-third-floor"],
        openings: [{
          id: "inn-third-" + row[0] + "-window",
          station: (row[0] === "north" || row[0] === "south") ? 4.4 : 3.0,
          width: 1.15, bottom: 0.72, height: 1.0, kind: "upper-window",
          observation: true
        }]
      });
    });
    architectureAddWallRun(plan, {
      id: "inn-third-room-partition", start: { x: -0.6, z: -2.7 },
      end: { x: -0.6, z: 2.7 }, baseY: 4.92, height: 2.15, thickness: 0.26,
      supportedBy: ["inn-third-floor"],
      openings: [{
        id: "inn-third-room-door", station: 2.7, width: 1.0, bottom: 0,
        height: 1.85, kind: "room-door", access: "walk"
      }]
    });
    architectureAddStair(plan, {
      id: "inn-third-stair", start: { x: -3.8, z: 2.4 }, end: { x: -2.0, z: 0.1 },
      baseY: 2.62, topY: 4.92, width: 1.15, steps: 8,
      upperLandingId: "inn-third-floor", supportedBy: ["inn-upper-floor"],
      cheeks: true, role: "timber-surface"
    });
    architectureAddHipRoof(plan, {
      id: "inn-third-roof", center: { x: 0, z: 0 }, width: 9.4, depth: 6.6,
      eaveY: 7.3, pitchDeg: 29, overhang: 0.38, thickness: 0.18,
      enclosure: "enclosed",
      supportedBy: ["inn-third-north-wall", "inn-third-south-wall",
        "inn-third-west-wall", "inn-third-east-wall"],
      edgeInfills: [{
        id: "inn-third-roof:north-crown", edge: "north", width: 8.8, depth: 6.0,
        wallTopY: 7.17, thickness: 0.34,
        supportedBy: ["inn-third-north-wall"], ownerId: "inn-third-north-wall"
      }, {
        id: "inn-third-roof:south-crown", edge: "south", width: 8.8, depth: 6.0,
        wallTopY: 7.17, thickness: 0.34,
        supportedBy: ["inn-third-south-wall"], ownerId: "inn-third-south-wall"
      }, {
        id: "inn-third-roof:west-crown", edge: "west", width: 8.8, depth: 6.0,
        wallTopY: 7.17, thickness: 0.34,
        supportedBy: ["inn-third-west-wall"], ownerId: "inn-third-west-wall"
      }, {
        id: "inn-third-roof:east-crown", edge: "east", width: 8.8, depth: 6.0,
        wallTopY: 7.17, thickness: 0.34,
        supportedBy: ["inn-third-east-wall"], ownerId: "inn-third-east-wall"
      }]
    });
    architectureAddAccess(plan, "inn-third-route", "upper-rooms", "third-storey-rooms",
      "stair", 1.15);
    plan.programTopology.push("third-storey-rooms", "third-storey-partition");
    architectureApplyDollhouseCutaway(plan, {
      id: "inn-south-dollhouse",
      wallRunIds: ["inn-front-wall", "inn-third-south-wall"],
      memberPrefixes: ["inn-third-roof:unified-roof-shell", "inn-third-roof:eave:south"],
      preserves: ["public-door", "service-spine", "two-stairs", "physical-enclosure"]
    });
    plan.growth.operations.push("add-complete-storey:third-storey",
      "add-program-partition:third-storey-rooms", "presentation-dollhouse-cutaway:south");
  } else if(plan.formId === "AF-15"){
    architectureRemoveRoof(plan, "stair-street-middle-roof");
    architectureAddSlab(plan, "stair-street-middle-upper-floor",
      { x: 3.65, z: 0.2 }, { x: 4.25, z: 3.55 }, 4.32, 0.22,
      "timber-surface", ["stair-street-middle-street-wall",
        "stair-street-middle-back-wall"], "walk");
    [
      ["north", { x: 1.55, z: -1.55 }, { x: 5.75, z: -1.55 }],
      ["south", { x: 5.75, z: 1.95 }, { x: 1.55, z: 1.95 }],
      ["west", { x: 1.55, z: 1.95 }, { x: 1.55, z: -1.55 }],
      ["east", { x: 5.75, z: -1.55 }, { x: 5.75, z: 1.95 }]
    ].forEach(function(row){
      architectureAddWallRun(plan, {
        id: "stair-street-middle-upper-" + row[0], start: row[1], end: row[2],
        baseY: 4.32, height: 2.3, thickness: 0.3,
        supportedBy: ["stair-street-middle-upper-floor"],
        openings: row[0] === "east" ? [{
          id: "stair-street-middle-upper-window", station: 1.75,
          width: 1.2, bottom: 0.72, height: 0.95, kind: "street-window",
          observation: true
        }] : []
      });
    });
    architectureAddStair(plan, {
      id: "stair-street-middle-upper-stair",
      start: { x: 5.15, z: 1.45 }, end: { x: 3.75, z: -0.55 },
      baseY: 1.75, topY: 4.32, width: 1.0, steps: 8,
      upperLandingId: "stair-street-middle-upper-floor",
      supportedBy: ["stair-street-middle-pad"], cheeks: true,
      role: "timber-surface"
    });
    architectureAddShedRoof(plan, {
      id: "stair-street-middle-upper-roof", center: { x: 3.65, z: 0.2 },
      width: 4.4, depth: 3.7, eaveY: 6.74, pitchDeg: 19,
      highEdge: "east", overhang: 0.3, thickness: 0.17, enclosure: "enclosed",
      supportedBy: ["stair-street-middle-upper-north", "stair-street-middle-upper-south",
        "stair-street-middle-upper-west", "stair-street-middle-upper-east"],
      endInfills: [{
        id: "stair-street-middle-upper-roof:north-infill", side: "north",
        at: -1.55, runLength: 4.2, wallTopY: 6.62, thickness: 0.3,
        supportedBy: ["stair-street-middle-upper-north"],
        ownerId: "stair-street-middle-upper-north"
      }, {
        id: "stair-street-middle-upper-roof:south-infill", side: "south",
        at: 1.95, runLength: 4.2, wallTopY: 6.62, thickness: 0.3,
        supportedBy: ["stair-street-middle-upper-south"],
        ownerId: "stair-street-middle-upper-south"
      }],
      edgeInfills: [{
        id: "stair-street-middle-upper-roof:west-infill", edge: "west",
        wallTopY: 6.62, spanLength: 3.5, thickness: 0.3,
        supportedBy: ["stair-street-middle-upper-west"],
        ownerId: "stair-street-middle-upper-west"
      }, {
        id: "stair-street-middle-upper-roof:east-infill", edge: "east",
        wallTopY: 6.62, spanLength: 3.5, thickness: 0.3,
        supportedBy: ["stair-street-middle-upper-east"],
        ownerId: "stair-street-middle-upper-east"
      }]
    });
    architectureAddAccess(plan, "stair-street-middle-upper-route",
      "middle-frontage", "middle-upper-room", "stair", 1.0);
    plan.programTopology.push("middle-upper-room");
    plan.growth.operations.push("add-complete-storey:middle-frontage");
  } else if(plan.formId === "AF-16"){
    module = architectureAddRoomModule(plan, {
      id: "hall-west-service-wing", center: { x: -5.65, z: 1.5 },
      width: 3.3, depth: 4.8, baseY: 0.34, wallHeight: 2.8,
      doorSide: "east", doorWidth: 1.55, doorHeight: 2.15,
      roofFamily: "gable", accessFrom: "hearth-service",
      accessTo: "broad-medium-service-room", routeWidth: 1.65
    });
    architectureRegisterClearanceEnvelope(plan, {
      id: "hall-broad-medium-clearance", profileId: "broad-medium",
      zoneIds: ["broad-medium-service-room"], portalOpeningIds: [module.portalId],
      accessEdgeIds: [module.accessId], routeWidth: 1.65, turnDiameter: 2.2,
      verticalMode: "ramp"
    });
    plan.growth.operations.push("append-service-wing:west-room",
      "add-morphology-clear-route:broad-medium");
  } else {
    throw new Error("architectureGrowSecondSuite: no reviewed growth proof for " + plan.formId);
  }
  plan.extentCells = {
    x: Math.max(plan.extentCells.x, 24),
    y: Math.max(plan.extentCells.y, 24)
  };
  plan.growth.afterFingerprint = architectureVariantFingerprint(plan);
  return plan;
}

/* ─── REVIEWED FORM VARIATION ────────────────────────────────────────────────────────────────
   The first mutation rung moves complete relationships, never individual members. A seed may
   quarter-turn or mirror a reviewed form and may adjust its two horizontal proportion axes inside
   a narrow band. The same affine transform is applied to compiled geometry, wall/opening stations,
   levels, stairs, thresholds, frames, and sockets. IDs, support ownership, program topology, access
   topology, physical/operating state, and asset candidates are immutable.

   This deliberately stops short of adding/removing bays or changing a roof/stair family. Those
   operators require their own reviewed sibling forms before admission. */
var ARCHITECTURE_FORM_VARIATION_LAW = Object.freeze({
  schema: "ArchitectureFormVariationLawV1",
  mode: "bounded-reviewed-affine",
  allowedOperators: Object.freeze(["quarter-turn-complete-form", "mirror-complete-form",
    "bounded-horizontal-proportion"]),
  scaleXBand: Object.freeze([0.94, 1, 1.08]),
  scaleZBand: Object.freeze([0.96, 1, 1.06]),
  invariants: Object.freeze([
    "member-and-owner-ids", "support-graph", "program-topology", "access-topology",
    "opening-kind-and-owner", "asset-socket-purpose-and-candidates",
    "physical-and-operating-state", "barrier-road-orthogonality"
  ]),
  forbidden: Object.freeze([
    "member-scatter", "opening-invention", "support-reparenting", "raw-cell-mutation",
    "roof-family-swap", "stair-family-swap", "seed-specific-rescue"
  ])
});

function architectureVariantHash(seed, text){
  var h = (2166136261 ^ (seed >>> 0)) >>> 0;
  for(var i = 0; i < text.length; i++){
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  return h >>> 0;
}

function architectureVariationSpec(formId, seed){
  var h = architectureVariantHash(seed, formId + ":reviewed-affine:v1");
  var q = h & 3;
  var mirrorX = !!(h & 4);
  var scaleX = ARCHITECTURE_FORM_VARIATION_LAW.scaleXBand[(h >>> 3) % 3];
  var scaleZ = ARCHITECTURE_FORM_VARIATION_LAW.scaleZBand[(h >>> 7) % 3];
  /* A checkpoint's defining proof is exact road/barrier orthogonality. An anisotropic affine
     stretch would mathematically shear that right angle, so this family licenses only complete
     mirrors and quarter turns until a separate road-frame-aware width/length operator is reviewed. */
  if(formId === "AF-01"){ scaleX = 1; scaleZ = 1; }
  /* Every bounded-variant request must exercise at least one operator. This is a law of the mode,
     not a seed exception: an identity draw deterministically advances to a complete-form mirror. */
  if(q === 0 && !mirrorX && scaleX === 1 && scaleZ === 1) mirrorX = true;
  return {
    mode: ARCHITECTURE_FORM_VARIATION_LAW.mode,
    seed: seed >>> 0,
    quarterTurn: q,
    mirrorX: mirrorX,
    scaleX: scaleX,
    scaleZ: scaleZ
  };
}

function architectureVariantPoint(point, spec){
  var x = point.x * spec.scaleX;
  var z = point.z * spec.scaleZ;
  if(spec.mirrorX) x = -x;
  for(var i = 0; i < spec.quarterTurn; i++){
    var priorX = x;
    x = -z;
    z = priorX;
  }
  var out = { x: architectureRound(x), z: architectureRound(z) };
  if(point.y != null) out.y = architectureRound(point.y);
  return out;
}

function architectureVariantVector(vector, spec){
  var x = vector.x * spec.scaleX;
  var z = vector.z * spec.scaleZ;
  if(spec.mirrorX) x = -x;
  for(var i = 0; i < spec.quarterTurn; i++){
    var priorX = x;
    x = -z;
    z = priorX;
  }
  return { x: x, z: z };
}

function architectureVariantUnitVector(vector, spec){
  return architectureUnit(architectureVariantVector(vector, spec));
}

function architectureVariantAxisScale(vector, spec){
  var transformed = architectureVariantVector(architectureUnit(vector), spec);
  return architectureLen(transformed);
}

function architectureVariantYaw(yaw, spec){
  var axis = { x: Math.cos(yaw), z: -Math.sin(yaw) };
  var transformed = architectureVariantVector(axis, spec);
  return architectureRound(-Math.atan2(transformed.z, transformed.x));
}

function architectureVariantCardinal(cardinal, spec){
  var vectors = {
    north: { x: 0, z: -1 }, south: { x: 0, z: 1 },
    west: { x: -1, z: 0 }, east: { x: 1, z: 0 }
  };
  var v = architectureVariantUnitVector(vectors[cardinal] || vectors.north, spec);
  if(Math.abs(v.x) > Math.abs(v.z)) return v.x < 0 ? "west" : "east";
  return v.z < 0 ? "north" : "south";
}

function architectureVariantFingerprint(plan){
  var payload = JSON.stringify({
    formId: plan.formId,
    members: plan.compiledMembers.map(function(member){
      return [member.id, member.center, member.size, member.rotation, member.supportedBy,
        member.vertices || null, member.triangles || null];
    }),
    openings: plan.openings.map(function(opening){
      return [opening.id, opening.wallRunId, opening.station, opening.width, opening.height];
    }),
    stairs: plan.stairs.map(function(stair){
      return [stair.id, stair.start, stair.end, stair.width, stair.lowerLandingId, stair.upperLandingId];
    }),
    access: plan.accessGraph
  });
  var hash = architectureVariantHash(plan.seed, payload);
  return ("00000000" + hash.toString(16)).slice(-8);
}

function architectureApplyReviewedVariation(plan, spec){
  var beforeFingerprint = architectureVariantFingerprint(plan);
  var openingScaleById = {};
  plan.compiledMembers.forEach(function(member){
    if(member.shape === "polyhedron" && member.vertices){
      member.vertices = member.vertices.map(function(vertex){
        return architectureVariantPoint(vertex, spec);
      });
      var min = { x: Infinity, y: Infinity, z: Infinity };
      var max = { x: -Infinity, y: -Infinity, z: -Infinity };
      member.vertices.forEach(function(vertex){
        min.x = Math.min(min.x, vertex.x); min.y = Math.min(min.y, vertex.y);
        min.z = Math.min(min.z, vertex.z); max.x = Math.max(max.x, vertex.x);
        max.y = Math.max(max.y, vertex.y); max.z = Math.max(max.z, vertex.z);
      });
      member.center = {
        x: architectureRound((min.x + max.x) / 2),
        y: architectureRound((min.y + max.y) / 2),
        z: architectureRound((min.z + max.z) / 2)
      };
      member.size = {
        x: architectureRound(Math.max(0.001, max.x - min.x)),
        y: architectureRound(Math.max(0.001, max.y - min.y)),
        z: architectureRound(Math.max(0.001, max.z - min.z))
      };
      return;
    }
    member.center = architectureVariantPoint(member.center, spec);
    /* Cardinal shed planes may pitch on local Z (rotation.x) while gables and east/west sheds
       pitch on local X (rotation.z). Normalize either roof plane to a transformed local-X slope so
       quarter turns preserve the actual high edge instead of flattening or twisting north/south
       roofs. This branch is still complete-member affine transformation, not roof rebuilding. */
    var rx = member.rotation.x || 0;
    var rz = member.rotation.z || 0;
    if(member.role === "roof-field" && (Math.abs(rx) > 0.000001 || Math.abs(rz) > 0.000001)){
      var roofYaw = member.rotation.y || 0;
      var localX = { x: Math.cos(roofYaw), z: -Math.sin(roofYaw) };
      var localZ = { x: Math.sin(roofYaw), z: Math.cos(roofYaw) };
      var pitchMagnitude, highVector, spanVector, runSize, spanSize;
      if(Math.abs(rz) > 0.000001){
        pitchMagnitude = Math.abs(rz);
        highVector = { x: localX.x * (rz < 0 ? -1 : 1),
          z: localX.z * (rz < 0 ? -1 : 1) };
        spanVector = localZ; runSize = member.size.x; spanSize = member.size.z;
      } else {
        pitchMagnitude = Math.abs(rx);
        highVector = { x: localZ.x * (rx > 0 ? -1 : 1),
          z: localZ.z * (rx > 0 ? -1 : 1) };
        spanVector = localX; runSize = member.size.z; spanSize = member.size.x;
      }
      var transformedHigh = architectureVariantVector(highVector, spec);
      var transformedSpan = architectureVariantVector(spanVector, spec);
      var runScale = architectureLen(transformedHigh);
      var spanScale = architectureLen(transformedSpan);
      var cosRoofPitch = Math.cos(pitchMagnitude), sinRoofPitch = Math.sin(pitchMagnitude);
      member.size.x = architectureRound(runSize * Math.sqrt(
        cosRoofPitch * cosRoofPitch * runScale * runScale
        + sinRoofPitch * sinRoofPitch));
      member.size.z = architectureRound(spanSize * spanScale);
      member.rotation.x = 0;
      member.rotation.y = architectureRound(
        -Math.atan2(transformedHigh.z, transformedHigh.x));
      member.rotation.z = architectureRound(Math.atan2(
        sinRoofPitch, Math.max(0.000001, cosRoofPitch * runScale)));
      return;
    }
    var yaw = member.rotation.y || 0;
    var pitch = member.rotation.z || 0;
    var horizontalAxis = { x: Math.cos(yaw), z: -Math.sin(yaw) };
    var horizontalPerp = { x: Math.sin(yaw), z: Math.cos(yaw) };
    var transformedAxis = architectureVariantVector(horizontalAxis, spec);
    var horizontalScale = architectureLen(transformedAxis);
    var perpendicularScale = architectureVariantAxisScale(horizontalPerp, spec);
    var cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    var longScale = Math.sqrt(
      cosPitch * cosPitch * horizontalScale * horizontalScale + sinPitch * sinPitch);
    member.size.x = architectureRound(member.size.x * longScale);
    member.size.z = architectureRound(member.size.z * perpendicularScale);
    member.rotation.y = architectureRound(-Math.atan2(transformedAxis.z, transformedAxis.x));
    member.rotation.z = architectureRound(
      Math.atan2(sinPitch, Math.max(0.000001, cosPitch * horizontalScale)));
  });
  plan.wallRuns.forEach(function(run){
    var oldStart = run.start, oldEnd = run.end;
    var oldFrame = architectureRunFrame(oldStart, oldEnd);
    var oldPerp = { x: -oldFrame.axis.z, z: oldFrame.axis.x };
    run.start = architectureVariantPoint(oldStart, spec);
    run.end = architectureVariantPoint(oldEnd, spec);
    var ratio = architectureRunFrame(run.start, run.end).length / oldFrame.length;
    run.thickness = architectureRound(run.thickness * architectureVariantAxisScale(oldPerp, spec));
    run.openings.forEach(function(opening){
      opening.station = architectureRound(opening.station * ratio);
      opening.width = architectureRound(opening.width * ratio);
      openingScaleById[opening.id] = {
        along: ratio,
        depth: architectureVariantAxisScale(oldPerp, spec)
      };
    });
  });
  plan.openings.forEach(function(opening){
    var scale = openingScaleById[opening.id] || { along: 1, depth: 1 };
    opening.station = architectureRound(opening.station * scale.along);
    opening.width = architectureRound(opening.width * scale.along);
    opening.depth = architectureRound(opening.depth * scale.depth);
  });
  plan.levels.forEach(function(level){
    var center = architectureVariantPoint({ x: level.footprint.x, z: level.footprint.z }, spec);
    var w = level.footprint.w * spec.scaleX;
    var d = level.footprint.d * spec.scaleZ;
    level.footprint.x = center.x;
    level.footprint.z = center.z;
    level.footprint.w = architectureRound(spec.quarterTurn % 2 ? d : w);
    level.footprint.d = architectureRound(spec.quarterTurn % 2 ? w : d);
  });
  plan.stairs.forEach(function(stair){
    var oldStart = stair.start, oldEnd = stair.end;
    var oldAxis = architectureUnit({ x: oldEnd.x - oldStart.x, z: oldEnd.z - oldStart.z });
    var oldPerp = { x: -oldAxis.z, z: oldAxis.x };
    stair.start = architectureVariantPoint(oldStart, spec);
    stair.end = architectureVariantPoint(oldEnd, spec);
    stair.width = architectureRound(stair.width * architectureVariantAxisScale(oldPerp, spec));
  });
  plan.roofs.forEach(function(roof){
    var runScale = roof.family === "gable" || roof.family === "shed" ? spec.scaleX : 1;
    if(roof.pitchDeg != null){
      roof.pitchDeg = architectureRound(
        Math.atan(Math.tan(roof.pitchDeg * Math.PI / 180) / runScale) * 180 / Math.PI);
    }
    if(roof.ridgeAxis) roof.ridgeAxis = spec.quarterTurn % 2
      ? (roof.ridgeAxis === "x" ? "z" : "x") : roof.ridgeAxis;
    if(roof.highEdge) roof.highEdge = architectureVariantCardinal(roof.highEdge, spec);
    if(roof.drainage){
      roof.drainage = roof.drainage.map(function(side){
        return architectureVariantCardinal(side, spec);
      });
    }
  });
  function transformFrame(frame){
    if(frame.origin) frame.origin = architectureVariantPoint(frame.origin, spec);
    if(frame.forward) frame.forward = architectureVariantUnitVector(frame.forward, spec);
    if(frame.right) frame.right = architectureVariantUnitVector(frame.right, spec);
  }
  transformFrame(plan.frame);
  if(plan.frame.roadThreshold){
    var thresholdFrame = plan.frame.roadThreshold;
    if(thresholdFrame.center) thresholdFrame.center = architectureVariantPoint(thresholdFrame.center, spec);
    var oldNormal = thresholdFrame.normal;
    thresholdFrame.tangent = architectureVariantUnitVector(thresholdFrame.tangent, spec);
    thresholdFrame.normal = architectureVariantUnitVector(oldNormal, spec);
    var widthScale = architectureVariantAxisScale(oldNormal, spec);
    thresholdFrame.roadWidth = architectureRound(thresholdFrame.roadWidth * widthScale);
    thresholdFrame.clearWidth = architectureRound(thresholdFrame.clearWidth * widthScale);
  }
  plan.thresholds.forEach(function(threshold){
    var oldNormal = threshold.roadNormal;
    if(threshold.center) threshold.center = architectureVariantPoint(threshold.center, spec);
    if(threshold.roadTangent){
      threshold.roadTangent = architectureVariantUnitVector(threshold.roadTangent, spec);
    }
    if(oldNormal){
      var widthScale = architectureVariantAxisScale(oldNormal, spec);
      threshold.roadNormal = architectureVariantUnitVector(oldNormal, spec);
      if(threshold.barrierAxis){
        threshold.barrierAxis = architectureVariantUnitVector(threshold.barrierAxis, spec);
      }
      if(threshold.clearWidth != null){
        threshold.clearWidth = architectureRound(threshold.clearWidth * widthScale);
      }
      if(threshold.roadWidth != null){
        threshold.roadWidth = architectureRound(threshold.roadWidth * widthScale);
      }
    }
  });
  plan.assetSockets.forEach(function(socket){
    socket.at = architectureVariantPoint(socket.at, spec);
    socket.yaw = architectureVariantYaw(socket.yaw, spec);
    socket.scale = architectureRound(socket.scale * Math.sqrt(spec.scaleX * spec.scaleZ));
  });
  if(plan.barrierAudit){
    var auditTangent = plan.thresholds[0].roadTangent;
    var auditAxis = plan.thresholds[0].barrierAxis;
    plan.barrierAudit = {
      roadTangent: auditTangent,
      barrierAxis: auditAxis,
      dot: architectureRound(architectureDot(auditTangent, auditAxis)),
      orthogonal: Math.abs(architectureDot(auditTangent, auditAxis)) <= 0.001,
      passageClear: plan.thresholds[0].clearWidth >= plan.thresholds[0].roadWidth
    };
  }
  var originalExtent = { x: plan.extentCells.x, y: plan.extentCells.y };
  var transformedX = spec.quarterTurn % 2
    ? originalExtent.y * spec.scaleZ : originalExtent.x * spec.scaleX;
  var transformedY = spec.quarterTurn % 2
    ? originalExtent.x * spec.scaleX : originalExtent.y * spec.scaleZ;
  plan.extentCells = {
    x: Math.max(originalExtent.x, Math.ceil(transformedX)),
    y: Math.max(originalExtent.y, Math.ceil(transformedY))
  };
  plan.phase = "bounded-reviewed-variant";
  plan.variation = {
    schema: ARCHITECTURE_FORM_VARIATION_LAW.schema,
    mode: spec.mode,
    seed: spec.seed,
    operators: {
      quarterTurn: spec.quarterTurn,
      mirrorX: spec.mirrorX,
      scaleX: spec.scaleX,
      scaleZ: spec.scaleZ
    },
    invariants: ARCHITECTURE_FORM_VARIATION_LAW.invariants.slice(),
    beforeFingerprint: beforeFingerprint,
    afterFingerprint: null
  };
  plan.variation.afterFingerprint = architectureVariantFingerprint(plan);
  return plan;
}

function architectureFormPlan(sceneId, seed){
  var def = architectureSceneDefinition(sceneId);
  if(!def) throw new Error("architectureFormPlan: unknown scene " + sceneId);
  var s = seed == null
    ? (typeof terrainSeedFrom === "function" ? terrainSeedFrom(sceneId) : 0)
    : seed >>> 0;
  var plan;
  if(def.formId === "AF-01") plan = architectureBuildRoadCheckpoint(def, s);
  else if(def.formId === "AF-02") plan = architectureBuildRoadsideShelter(def, s);
  else if(def.formId === "AF-03") plan = architectureBuildEmbeddedGuardroom(def, s);
  else if(def.formId === "AF-04") plan = architectureBuildWorkshop(def, s);
  else if(def.formId === "AF-05") plan = architectureBuildCourtyard(def, s);
  else if(def.formId === "AF-06") plan = architectureBuildMarketHall(def, s);
  else if(def.formId === "AF-07") plan = architectureBuildGatehouse(def, s);
  else if(def.formId === "AF-08") plan = architectureBuildWatchtower(def, s);
  else if(def.formId === "AF-09") plan = architectureBuildPartyWallFrontage(def, s);
  else if(def.formId === "AF-10") plan = architectureBuildKeeperCellBlock(def, s);
  else if(def.formId === "AF-11") plan = architectureBuildShaftHead(def, s);
  else if(def.formId === "AF-12") plan = architectureBuildTerracedCommune(def, s);
  else if(def.formId === "AF-13") plan = architectureBuildBridgehouse(def, s);
  else if(def.formId === "AF-14") plan = architectureBuildInnManor(def, s);
  else if(def.formId === "AF-15") plan = architectureBuildHillsideStairStreet(def, s);
  else if(def.formId === "AF-16") plan = architectureBuildGreatHall(def, s);
  else if(def.formId === "AF-17") plan = architectureBuildSanctuaryNave(def, s);
  else if(def.formId === "AF-18") plan = architectureBuildPalaceCourt(def, s);
  else if(def.formId === "AF-19") plan = architectureBuildArcaneAqueduct(def, s);
  else if(def.formId === "AF-20") plan = architectureBuildStarArchive(def, s);
  else if(def.formId === "AF-21") plan = architectureBuildGrandConcourseCorner(def, s);
  else plan = architectureBuildMarketHillsidePrecinct(def, s);
  plan.battleSpaceMode = architectureBattleSpaceModeForForm(plan.formId);
  plan.validation = architectureFormValidatePlan(plan);
  return plan;
}

function architectureFormVariantPlan(sceneId, seed){
  var plan = architectureFormPlan(sceneId, seed);
  var spec = architectureVariationSpec(plan.formId, plan.seed);
  delete plan.validation;
  architectureApplyReviewedVariation(plan, spec);
  plan.validation = architectureFormValidatePlan(plan);
  return plan;
}

function architectureFormGrowthPlan(sceneId, seed){
  var plan = architectureFormPlan(sceneId, seed);
  if(ARCHITECTURE_FORM_SUITE2_FIXTURE.scenes.map(function(scene){ return scene.id; })
    .indexOf(sceneId) < 0){
    throw new Error("architectureFormGrowthPlan: growth proof is reviewed for AF-09–AF-16");
  }
  delete plan.validation;
  architectureGrowSecondSuite(plan);
  plan.validation = architectureFormValidatePlan(plan);
  return plan;
}

function architectureFormValidatePlan(plan){
  var failures = [];
  var ids = {}, ownerIds = { ground: true };
  plan.compiledMembers.forEach(function(member){
    if(ids[member.id]) failures.push("duplicate-member:" + member.id);
    ids[member.id] = true; ownerIds[member.ownerId] = true; ownerIds[member.id] = true;
    ["x", "y", "z"].forEach(function(axis){
      if(!Number.isFinite(member.center[axis])) failures.push("nonfinite-center:" + member.id + ":" + axis);
      if(!Number.isFinite(member.size[axis]) || member.size[axis] <= 0){
        failures.push("invalid-size:" + member.id + ":" + axis);
      }
    });
    if(!member.supportedBy || !member.supportedBy.length) failures.push("unsupported:" + member.id);
    if(member.shape === "polyhedron"){
      if(!member.vertices || member.vertices.length < 3 || !member.triangles
        || !member.triangles.length){
        failures.push("invalid-polyhedron:" + member.id);
      } else {
        member.vertices.forEach(function(vertex, vertexIndex){
          ["x", "y", "z"].forEach(function(axis){
            if(!Number.isFinite(vertex[axis])){
              failures.push("nonfinite-polyhedron:" + member.id + ":" + vertexIndex + ":" + axis);
            }
          });
        });
        member.triangles.forEach(function(triangle){
          if(triangle.length !== 3 || triangle.some(function(index){
            return index < 0 || index >= member.vertices.length;
          })) failures.push("invalid-polyhedron-index:" + member.id);
        });
      }
    }
  });
  plan.compiledMembers.forEach(function(member){
    member.supportedBy.forEach(function(id){
      if(!ownerIds[id]) failures.push("unknown-support:" + member.id + ":" + id);
    });
  });
  plan.wallRuns.forEach(function(run){
    var length = architectureRunFrame(run.start, run.end).length;
    var previous = 0;
    run.openings.forEach(function(opening){
      var left = opening.station - opening.width / 2;
      var right = opening.station + opening.width / 2;
      if(left < 0 || right > length || left < previous - 0.001){
        failures.push("illegal-opening:" + opening.id);
      }
      if(opening.bottom < 0 || opening.bottom + opening.height > run.height + 0.001){
        failures.push("illegal-opening-height:" + opening.id);
      }
      previous = right;
    });
  });
  var validEnclosures = { "open-frame": true, partial: true, enclosed: true };
  plan.roofs.forEach(function(roof){
    if(!validEnclosures[roof.enclosure]){
      failures.push("invalid-roof-enclosure:" + roof.id);
    }
    var closures = plan.roofJunctions.filter(function(junction){
      return junction.roofId === roof.id;
    });
    if(closures.length !== roof.closureExpected){
      failures.push("roof-closure-count:" + roof.id + ":" + closures.length
        + "/" + roof.closureExpected);
    }
    if(roof.enclosure === "partial" && closures.length < 1){
      failures.push("partial-roof-without-closure:" + roof.id);
    }
    if(roof.enclosure === "enclosed"){
      var required = roof.family === "gable" ? 2 : 4;
      if(closures.length < required){
        failures.push("enclosed-roof-undersealed:" + roof.id + ":" + closures.length
          + "/" + required);
      }
    }
  });
  plan.roofJunctions.forEach(function(junction){
    if(!ids[junction.memberId]){
      failures.push("roof-closure-member-missing:" + junction.memberId);
    }
    if(!ownerIds[junction.ownerId]){
      failures.push("roof-closure-owner-missing:" + junction.memberId + ":" + junction.ownerId);
    }
    if(!junction.sealed){
      failures.push("roof-closure-unsealed:" + junction.memberId);
    }
  });
  var validStairSupportModes = {
    "grounded-solid": true,
    "bearing-on-lower-structure": true,
    "suspended-or-bridged": true
  };
  plan.stairs.forEach(function(stair){
    if(!validStairSupportModes[stair.supportMode]){
      failures.push("invalid-stair-support-mode:" + stair.id);
    }
    if(!Number.isFinite(stair.foundationBaseY) || stair.foundationBaseY > stair.baseY + 0.001){
      failures.push("invalid-stair-foundation:" + stair.id);
    }
    if(stair.supportMode === "grounded-solid"
      && stair.foundationBaseY > stair.baseY + 0.001){
      failures.push("floating-grounded-stair:" + stair.id);
    }
  });
  var validBattleModes = {};
  Object.keys(ARCHITECTURE_BATTLE_SPACE_MODES).forEach(function(key){
    validBattleModes[ARCHITECTURE_BATTLE_SPACE_MODES[key].id] = true;
  });
  if(!validBattleModes[plan.battleSpaceMode]){
    failures.push("invalid-battle-space-mode:" + plan.battleSpaceMode);
  }
  if(!ARCHITECTURE_CREATURE_SCALE_PROFILES[plan.occupantProfile]){
    failures.push("invalid-default-occupant-profile:" + plan.occupantProfile);
  }
  plan.clearanceEnvelopes.forEach(function(envelope){
    var profile = ARCHITECTURE_CREATURE_SCALE_PROFILES[envelope.profileId];
    if(!profile){
      failures.push("invalid-clearance-profile:" + envelope.id + ":" + envelope.profileId);
      return;
    }
    envelope.portalOpeningIds.forEach(function(openingId){
      var opening = plan.openings.filter(function(row){ return row.id === openingId; })[0];
      if(!opening){
        failures.push("clearance-portal-missing:" + envelope.id + ":" + openingId);
      } else {
        if(opening.width + 0.001 < profile.minPortalWidth){
          failures.push("clearance-portal-too-narrow:" + envelope.id + ":" + openingId);
        }
        if(opening.height + 0.001 < profile.minPortalHeight){
          failures.push("clearance-portal-too-low:" + envelope.id + ":" + openingId);
        }
      }
    });
    envelope.accessEdgeIds.forEach(function(accessId){
      var edge = plan.accessGraph.filter(function(row){ return row.id === accessId; })[0];
      if(!edge){
        failures.push("clearance-access-missing:" + envelope.id + ":" + accessId);
      } else if(edge.width + 0.001 < profile.minRouteWidth){
        failures.push("clearance-route-too-narrow:" + envelope.id + ":" + accessId);
      }
    });
    if(envelope.routeWidth + 0.001 < profile.minRouteWidth){
      failures.push("clearance-envelope-route-too-narrow:" + envelope.id);
    }
    if(envelope.turnDiameter + 0.001 < profile.minTurnDiameter){
      failures.push("clearance-turn-too-tight:" + envelope.id);
    }
    if(profile.verticalModes.indexOf(envelope.verticalMode) < 0){
      failures.push("clearance-vertical-mode:" + envelope.id + ":" + envelope.verticalMode);
    }
  });
  var presentationIds = {};
  (plan.presentation.hiddenMemberIds || []).forEach(function(memberId){
    if(presentationIds[memberId]) failures.push("duplicate-presentation-hide:" + memberId);
    presentationIds[memberId] = true;
    if(!ids[memberId]) failures.push("presentation-hide-missing:" + memberId);
  });
  if(!plan.primarySpatialSentence) failures.push("missing-primary-spatial-sentence");
  if(!plan.programTopology.length) failures.push("missing-program-topology");
  if(!plan.accessGraph.length) failures.push("missing-access-graph");
  if(plan.formId === "AF-01"){
    if(!plan.barrierAudit || !plan.barrierAudit.orthogonal) failures.push("barrier-not-road-normal");
    if(!plan.barrierAudit || !plan.barrierAudit.passageClear) failures.push("barrier-passage-too-narrow");
  }
  plan.assetSockets.forEach(function(socket){
    if(!ownerIds[socket.ownerId]) failures.push("asset-owner-missing:" + socket.id);
    if(!socket.allowedSlugs.length && !socket.promotionCandidates.length
      && !socket.plannedCandidates.length) failures.push("asset-candidates-empty:" + socket.id);
    if(!socket.fallback) failures.push("asset-fallback-missing:" + socket.id);
    socket.promotionCandidates.forEach(function(candidate){
      if(ARCHITECTURE_ASSET_PROMOTION_CENSUS.generatedAdjudicatedNotCitizens
        .indexOf(candidate.jobId) < 0){
        failures.push("unknown-promotion-candidate:" + socket.id + ":" + candidate.jobId);
      }
    });
  });
  plan.lightSockets.forEach(function(socket){
    if(!socket.id) failures.push("light-id-missing");
    if(!ownerIds[socket.supportId]) failures.push("light-support-missing:" + socket.id);
    ["x", "y", "z"].forEach(function(axis){
      if(!Number.isFinite(socket.at[axis])) failures.push("light-position:" + socket.id + ":" + axis);
    });
    if(!Number.isFinite(socket.color) || !Number.isFinite(socket.intensity)
      || socket.intensity <= 0 || !Number.isFinite(socket.distance) || socket.distance <= 0){
      failures.push("light-parameters:" + socket.id);
    }
  });
  var stairClearanceAudit = architectureStairClearanceAudit(plan);
  var stairSeamAudit = architectureStairSeamAudit(plan);
  stairSeamAudit.failures.forEach(function(failure){ failures.push(failure); });
  if(plan.assemblyClearancePolicy === "strict"){
    stairClearanceAudit.conflicts.forEach(function(conflictRow){
      failures.push("stair-clearance:" + conflictRow.stairId + ":" + conflictRow.obstacleId);
    });
  }
  return {
    ok: failures.length === 0,
    failures: failures,
    counts: {
      members: plan.compiledMembers.length,
      wallRuns: plan.wallRuns.length,
      openings: plan.openings.length,
      levels: plan.levels.length,
      roofs: plan.roofs.length,
      roofJunctions: plan.roofJunctions.length,
      clearanceEnvelopes: plan.clearanceEnvelopes.length,
      presentationHiddenMembers: plan.presentation.hiddenMemberIds.length,
      stairs: plan.stairs.length,
      stairSeams: stairSeamAudit.rows.length,
      lightSockets: plan.lightSockets.length,
      assetSockets: plan.assetSockets.length,
      accessEdges: plan.accessGraph.length
    },
    stairClearanceAudit: stairClearanceAudit,
    stairSeamAudit: stairSeamAudit,
    maxTopY: architectureRound(plan.compiledMembers.reduce(function(max, member){
      return Math.max(max, member.center.y + member.size.y / 2);
    }, 0)),
    rendererOwnsGeometry: false
  };
}

function architectureFormSceneBuild(sceneId, seed, options){
  options = options || {};
  var plan = options.variant === "bounded"
    ? architectureFormVariantPlan(sceneId, seed)
    : (options.variant === "growth"
      ? architectureFormGrowthPlan(sceneId, seed)
      : architectureFormPlan(sceneId, seed));
  if(!plan.validation.ok){
    throw new Error("architectureFormSceneBuild: invalid " + sceneId + " — "
      + plan.validation.failures.join(", "));
  }
  if(typeof terrainFieldBuild !== "function"){
    throw new Error("architectureFormSceneBuild: terrainFieldBuild unavailable");
  }
  var terrainSpec = plan.formId === "AF-22"
    ? architectureMarketHillsideTerrainSpec(plan.seed)
    : {
      id: sceneId + ":ground",
      segmentId: sceneId + ":ground",
      seed: plan.seed,
      extentCells: plan.extentCells,
      shape: "rect",
      baseDatumH: 0,
      slopeClamp: 1,
      noiseAmplitudeH: 0,
      pieces: []
    };
  var field = terrainFieldBuild(terrainSpec);
  return {
    sceneId: sceneId,
    architectureFixture: architectureFixtureForScene(sceneId),
    architecturePlan: plan,
    spec: terrainSpec,
    fields: [field],
    primary: field,
    lightRecipeId: "daylit"
  };
}

function architectureFormSceneLightRecipe(sceneId){
  var def = architectureSceneDefinition(sceneId);
  if(!def) throw new Error("architectureFormSceneLightRecipe: unknown scene " + sceneId);
  return def.lightRecipeId;
}

function architectureFormSceneNeutralizesRig(sceneId){
  var def = architectureSceneDefinition(sceneId);
  return !!(def && def.neutralizeHostRig);
}

function architectureFormGateReport(seed){
  var rows = ARCHITECTURE_FORM_SCENE_IDS.map(function(sceneId){
    var plan = architectureFormPlan(sceneId, seed);
    return {
      sceneId: sceneId, formId: plan.formId, label: plan.label, scale: plan.scale,
      constructionProfile: plan.constructionProfile,
      physicalState: plan.physicalState, operatingState: plan.operatingState,
      validation: plan.validation
    };
  });
  var failures = [];
  rows.forEach(function(row){
    if(!row.validation.ok){
      row.validation.failures.forEach(function(failure){
        failures.push(row.formId + ":" + failure);
      });
    }
  });
  var distinctProfiles = {};
  rows.forEach(function(row){ distinctProfiles[row.constructionProfile] = true; });
  if(Object.keys(distinctProfiles).length < 6) failures.push("insufficient-construction-variety");
  var tall = rows.filter(function(row){ return row.validation.maxTopY >= 8; });
  if(!tall.length) failures.push("no-tall-form");
  return {
    fixtureId: ARCHITECTURE_FORM_PROOF_FIXTURE.id,
    fixtureVersion: ARCHITECTURE_FORM_PROOF_FIXTURE.version,
    assetPromotionCensus: ARCHITECTURE_ASSET_PROMOTION_CENSUS,
    ok: failures.length === 0,
    failures: failures,
    rows: rows,
    proofCount: rows.length,
    distinctConstructionProfiles: Object.keys(distinctProfiles).length,
    tallForms: tall.map(function(row){ return row.formId; }),
    visualStatus: "REQUIRES LABELED CAPTURE REVIEW"
  };
}
