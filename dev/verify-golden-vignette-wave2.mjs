/* Golden Site Wave 2 executable gate.

   Verifies the shared Tavern/Guard compiler, AF-GV-1/2/3/8 minimum slices, exact Wave-0 negative
   controls, changed seeds, SceneTray/BattleMap identity, arrival/play/exit/return flows, and one
   deterministic PC-versus-enemy combat start/round against the committed Guard footprint.

   Run: node dev/verify-golden-vignette-wave2.mjs
*/
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const ENGINE_FILES = [
  "src/engine/vignette-observatory.js",
  "src/engine/terrain-field.js",
  "src/engine/terrain-pieces.js",
  "src/engine/terrain-features.js",
  "src/engine/terrain-expression.js",
  "src/engine/architecture-forms.js",
  "src/engine/vignette-synthesizer.js"
];
const context = vm.createContext({
  console, Math, JSON, Array, Object, Number, String, Boolean, Date, RegExp, Set, Map,
  Infinity, NaN, Uint8Array, Uint32Array, Int32Array, Float32Array, Float64Array
});
for (const path of ENGINE_FILES) vm.runInContext(read(path), context, { filename: path });
const evaluate = (source) => vm.runInContext(source, context);

let pass = 0;
let fail = 0;
const failures = [];
function check(name, condition, detail = null) {
  if (condition) {
    pass++;
    console.log("  ✓", name);
  } else {
    fail++;
    failures.push({ name, detail });
    console.log("  ✗", name, detail == null ? "" : "— " + JSON.stringify(detail));
  }
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function compile(kind, seed) {
  context.__request = evaluate(`goldenVignetteWave2FixtureRequest(${JSON.stringify(kind)}, ${seed})`);
  return evaluate("goldenVignetteCompile(__request)");
}
function validate(compilation) {
  context.__compilation = compilation;
  return evaluate("goldenVignetteValidateCompilation(__compilation)");
}
function hasError(compilation, id) {
  return validate(compilation).errors.includes(id);
}

console.log("\nWave 2 · shared compiler and contracts");
const tavern = compile("tavern", 301847567);
const guard = compile("guard-post", 19);
const guardReplay = compile("guard-post", 19);
const guardChangedA = compile("guard-post", 101);
const guardChangedB = compile("guard-post", 202);
context.__guardPlan = guard.plan;
const guardVisualProfile = evaluate(
  'goldenVignetteGuardVisualProfile(__guardPlan, 19, "institutional-frontier")');
const institutionalGuardScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 19, '
    + '{visualProfileId:"institutional-frontier"})');
const v016GroundGuardScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 19, '
    + '{visualProfileId:"institutional-frontier",groundCandidate:"v016",'
    + 'groundMetersPerRepeat:9.9})');
const v017GroundGuardScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 19, '
    + '{visualProfileId:"institutional-frontier",groundCandidate:"v017",'
    + 'groundMetersPerRepeat:9.9})');
const v018GroundGuardScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 19, '
    + '{visualProfileId:"institutional-frontier",groundCandidate:"v018",'
    + 'groundMetersPerRepeat:9.9})');
const institutionalGuardNightScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-night", 19, '
    + '{visualProfileId:"institutional-frontier"})');
const v015GuardScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 19, '
    + '{visualProfileId:"institutional-frontier",masonryCandidate:"v015",'
    + 'conditionCandidate:"v015"})');
const partyProofGuardScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 19, '
    + '{visualProfileId:"institutional-frontier",masonryCandidate:"v015",'
    + 'conditionCandidate:"v015",worldPixelDensityProof:"party-guards"})');
const partyProofGuardChangedA = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 101, '
    + '{visualProfileId:"institutional-frontier",masonryCandidate:"v015",'
    + 'conditionCandidate:"v015",worldPixelDensityProof:"party-guards"})');
const partyProofGuardChangedB = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 202, '
    + '{visualProfileId:"institutional-frontier",masonryCandidate:"v015",'
    + 'conditionCandidate:"v015",worldPixelDensityProof:"party-guards"})');
const uplandGuardScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 19, '
    + '{visualProfileId:"upland-vernacular"})');
const daubGuardScene = evaluate(
  'goldenVignetteWave2SceneBuild("gv-w2-guard-post-day", 19, {'
    + 'visualProfileId:"institutional-frontier",signifierState:{'
    + 'schema:"WorldSignifierStateV1",'
    + 'truthStatus:"NON_CANONICAL_FIXTURE_PLACEHOLDER",'
    + 'worldTruthRef:"guard-post-proof:occupation-daub-01",'
    + 'paletteRef:"guard-post-proof:dried-red",medium:"surface-daub"}})');

check("Tavern request and compilation validate", validate(tavern).ok, validate(tavern));
check("Guard request and compilation validate", validate(guard).ok, validate(guard));
check("same Guard request + seed is byte-equivalent",
  JSON.stringify(guard) === JSON.stringify(guardReplay));
check("same-seed plan and receipt fingerprints replay",
  guard.plan.planFingerprint === guardReplay.plan.planFingerprint
    && guard.receipt.receiptFingerprint === guardReplay.receipt.receiptFingerprint);
check("runtime grammar is shared typed-owner dispatch",
  tavern.plan.grammar.id === "public-service-venue"
    && guard.plan.grammar.id === "shoulder-route-control");
check("four initial candidates are retained plus repaired evidence",
  guard.receipt.candidates.filter((row) => row.parentCandidateId == null).length === 4
    && guard.receipt.repairs.length >= 1
    && guard.receipt.candidates.some((row) => !row.hardPass));
check("named route repair turns a recorded failure into a legal child",
  guard.receipt.repairs.some((repair) =>
    repair.operator === "WIDEN_GRADED_ROUTE"
      && repair.before.rejectionIds.includes("DISCONNECTED_REQUIRED_CIRCUIT")
      && repair.after.rejectionIds.length === 0));
check("component scoring is exposed and opaque quality score is absent",
  guard.receipt.scoring.opaqueQualityScore === null
    && Object.keys(guard.receipt.scoring.selectedComponents).sort().join(",")
      === [
        "assetCost", "compositionHierarchy", "continuity", "fourBearingLegibility",
        "identity", "quietSpace", "routeChoice", "tacticalTension"
      ].sort().join(","));
check("complete SynthesisReceiptV1 sections exist",
  [
    "seedChain", "sourceLineage", "candidates", "hardRejections", "scoring", "repairs",
    "relaxations", "assetDecisions", "omissions", "unresolved", "validation",
    "performance", "evidence", "fingerprints"
  ].every((key) => Object.prototype.hasOwnProperty.call(guard.receipt, key)));

console.log("\nWave 2 · Tavern identity microfixture");
const tavernRoles = new Set(tavern.plan.zones.map((zone) => zone.role));
check("all nine Tavern identity/program obligations have zones",
  [
    "public-arrival", "public-common", "service-threshold", "supply-waste",
    "responsible-host", "quiet-social-floor", "source-backed-light",
    "former-use-work-trace", "retreat"
  ].every((role) => tavernRoles.has(role)));
check("Tavern has separate social, service, and dormant tactical circuits",
  tavern.plan.circuits.social.length > 1
    && tavern.plan.circuits.service.length > 1
    && tavern.plan.circuits.tacticalDormant.length > 1);
context.__compilation = tavern;
const tavernTray = evaluate("goldenVignetteProjectSceneTray(__compilation, {bearing: 2})");
const tavernBattle = evaluate("goldenVignetteProjectBattleMap(__compilation, {bearing: 2})");
check("Tavern social-to-combat promotion preserves plan and mechanics",
  tavernTray.planRef === tavernBattle.planRef
    && tavernTray.mechanicsFingerprint === tavernBattle.mechanicsFingerprint
    && tavernBattle.geometryRegenerated === false);
context.__compilation = tavern;
const tavernFlow = evaluate(
  "goldenVignetteSimulateFlow(__compilation, 'plan-forceful-escalation')");
check("Tavern arrival → escalation → exit → return is playable and identity-stable",
  tavernFlow.routePlayable && tavernFlow.arrivalExitReturnIdentity
    && tavernFlow.phases.map((phase) => phase.phase).join(">")
      === "arrival>decision>play>exit>return");

console.log("\nWave 2 · Guard terrain, construction, and tactics");
const guardRoles = new Set(guard.plan.zones.map((zone) => zone.role));
check("all eleven Guard zones exist",
  [
    "entry", "quiet-approach", "through-road", "controlled-threshold", "guardroom",
    "work-readiness", "observation-face", "flat-deck", "defensive-edge",
    "secondary-flank", "exit-retreat"
  ].every((role) => guardRoles.has(role)));
const field = guard.plan.terrainPlan.field;
check("Guard carries 25+ feet of relief with no height cap",
  field.metrics.maxH - field.metrics.minH >= 10);
check("natural ground is legal and connected for non-flying actors",
  field.metrics.illegalWalkEdges === 0
    && field.metrics.walkableCellsOverSlopeLimit === 0
    && field.metrics.unreachableStandableNonFlying === 0);
check("one localized hard cut exists without unowned faces",
  field.metrics.faces >= 1 && field.metrics.faces <= 90 && field.metrics.unownedFaces === 0);
check("responsive surface continuity passes without flattening variation",
  guard.plan.terrainPlan.continuityReport.ok
    && guard.plan.terrainPlan.variationReport.ok
    && guard.plan.terrainPlan.variationReport.distinctTangentPlanes >= 10
    && guard.plan.terrainPlan.variationReport.responsiveJoinedPairs > 0);
const guardOps = guard.plan.terrainPlan.spec.pieces.flatMap((piece) => piece.ops);
check("terrain is macro-authored, with exactly one bounded causal ridge break",
  guardOps.filter((op) => op.type === "ridge").length === 1
    && guardOps.filter((op) => op.type === "ridge")
      .every((op) => op.params.halfPlane && op.params.bounds)
    && guardOps.every((op) =>
      ["control-surface", "graded-path", "patch", "ridge"].includes(op.type)));
check("through-road and terrain flank both traverse meaningful height",
  guard.plan.terrainPlan.routeReport.road.ok
    && guard.plan.terrainPlan.routeReport.road.verticalTravelH >= 4
    && guard.plan.terrainPlan.routeReport.flank.ok
    && guard.plan.terrainPlan.routeReport.flank.verticalTravelH >= 8);
check("front, flank, and deck plans are all legal with distinct costs",
  guard.plan.tacticalPlans.every((plan) => Number.isFinite(plan.routeCost) && plan.route.length > 1)
    && new Set(guard.plan.tacticalPlans.map((plan) => plan.routeCost)).size === 3);
check("terrain flank is longer than the checkpoint approach",
  guard.plan.tacticalPlans.find((plan) => plan.id === "plan-terrain-flank").routeCost
    > guard.plan.tacticalPlans.find((plan) => plan.id === "plan-front-checkpoint").routeCost);
check("constructed roles are negotiated into the same plan",
  ["guardroom", "observation-deck", "retaining-wall", "road-barrier"].every((role) =>
    guard.plan.constructionPlan.some((structure) => structure.role === role)));
const guardroom = guard.plan.constructionPlan.find((structure) => structure.role === "guardroom");
const guardroomHeights = [];
for (let y = guardroom.footprint.y; y < guardroom.footprint.y + guardroom.footprint.d; y++) {
  for (let x = guardroom.footprint.x; x < guardroom.footprint.x + guardroom.footprint.w; x++) {
    guardroomHeights.push(field.cells[y * field.extent.x + x].h);
  }
}
check("guardroom foundation contact is level and plan-owned",
  new Set(guardroomHeights).size === 1 && guardroom.baseH === guardroomHeights[0],
  { baseH: guardroom.baseH, support: guardroomHeights });
const guardArchitecture = guard.architectureAssembly;
check("Site 1 marriage preserves the previously committed plan, mechanics, and receipt",
  guard.plan.planFingerprint === "vgo1-248d20d1"
    && guard.plan.mechanicsFingerprint === "vgo1-fc125840"
    && guard.receipt.receiptFingerprint === "vgo1-3d8fda9b"
    && guardArchitecture.sourcePlanRef === guard.plan.planFingerprint
    && guardArchitecture.sourceMechanicsRef === guard.plan.mechanicsFingerprint);
check("Guard construction is now a strict engine-owned architecture assembly",
  guardArchitecture.schema === "ArchitectureAssemblyPlanV1"
    && guardArchitecture.phase === "procedural-vignette-realization"
    && guardArchitecture.validation.ok
    && guardArchitecture.validation.rendererOwnsGeometry === false
    && guardArchitecture.assemblyClearancePolicy === "strict",
  guardArchitecture.validation);
check("five sparse operational and defensive prop demands bind to engine-owned sockets",
  guardArchitecture.propDemandBindings
    && guardArchitecture.propDemandBindings.length === 5
    && guardArchitecture.assetSockets.length === 5
    && [
      "signal-cluster", "work-cluster", "supply-cluster",
      "repair-witness", "defensive-reinforcement"
    ].every((demandId) => {
      const binding = guardArchitecture.propDemandBindings.find((row) =>
        row.demandId === demandId);
      const socket = binding && guardArchitecture.assetSockets.find((row) =>
        row.id === binding.socketId);
      return binding
        && socket
        && binding.placementAuthority === "engine-owned-asset-socket"
        && binding.mechanicalEffect === "none"
        && binding.maximumClusters === 1
        && [
          "engine-plan",
          "route-control-drainage-repair",
          "route-control-retaining-old-near"
        ].includes(socket.collisionAuthority)
        && socket.stateOwner === "site-runtime";
    })
    && guardArchitecture.assetSockets.some((socket) =>
      socket.id === "route-control-lookout-stores"
        && socket.allowedSlugs.join(",") === "camp-kitchen-stores")
    && guardArchitecture.assetSockets.some((socket) =>
      socket.id === "route-control-drainage-repair-brace"
        && socket.allowedSlugs.join(",") === "timber-repair-brace"
        && socket.collisionAuthority === "route-control-drainage-repair")
    && guardArchitecture.assetSockets.some((socket) =>
      socket.id === "route-control-retaining-near-gabion"
        && socket.allowedSlugs.join(",") === "gabion-stone-basket"
        && socket.collisionAuthority === "route-control-retaining-old-near"));
const institutionalPropContext =
  institutionalGuardScene.architecturePlan.operationalPropMaterialContext;
const uplandPropContext = uplandGuardScene.architecturePlan.operationalPropMaterialContext;
check("operational citizens inherit deterministic culture-aware material families",
  institutionalPropContext.wood === "oak"
    && institutionalPropContext.iron === "blackened-iron"
    && institutionalPropContext.ceramic === "earthenware"
    && uplandPropContext.wood === "creosote-pine"
    && uplandPropContext.iron === "rusted-iron"
    && uplandPropContext.ceramic === "earthenware"
    && JSON.stringify(institutionalPropContext) !== JSON.stringify(uplandPropContext)
    && institutionalGuardScene.architecturePlan.assetSockets.every((socket) =>
      JSON.stringify(socket.materialContext) === JSON.stringify(institutionalPropContext))
    && uplandGuardScene.architecturePlan.assetSockets.every((socket) =>
      JSON.stringify(socket.materialContext) === JSON.stringify(uplandPropContext))
    && institutionalGuardScene.compilation.plan.mechanicsFingerprint
      === uplandGuardScene.compilation.plan.mechanicsFingerprint);
const meshyRuntimeIndex = JSON.parse(
  read("assets/models-normalized/meshy-genesis/index.json"));
const terrainOccluderPresentation =
  institutionalGuardScene.visualProfile.terrainOccluderPresentation;
check("terrain occluders use a citizen authored form without moving their engine-owned sites",
  terrainOccluderPresentation
    && terrainOccluderPresentation.catalog === "meshy-genesis"
    && terrainOccluderPresentation.allowedSlugs.join("|")
      === "low-cover-boulder-cluster"
    && meshyRuntimeIndex["low-cover-boulder-cluster"]
    && meshyRuntimeIndex["low-cover-boulder-cluster"].admissionClass
      === "DIRECT_MODULATED"
    && terrainOccluderPresentation.placementAuthority === "terrainOccluderSites"
    && terrainOccluderPresentation.transformAuthority === "terrainExpressionJitter"
    && terrainOccluderPresentation.collisionAuthority
      === "terrain-expression-site-no-battle-collision"
    && terrainOccluderPresentation.selectionBudget.everyNthEdge === 7
    && terrainOccluderPresentation.selectionBudget.maximumSites === 24
    && terrainOccluderPresentation.fallback
      === "renderer-icosahedron-preserving-declared-site-envelope"
    && terrainOccluderPresentation.mechanicalEffect === "none");
const guardNightArchitecture = institutionalGuardNightScene.architecturePlan;
check("night Guard Post light pools have visible, source-backed practicals",
  institutionalGuardScene.architecturePlan.presentationLightMode === "day"
    && institutionalGuardScene.architecturePlan.lightSockets.length === 0
    && !institutionalGuardScene.architecturePlan.motivatedPracticalAudit
    && guardNightArchitecture.presentationLightMode === "night"
    && institutionalGuardNightScene.lightRecipeId === "moonlit"
    && guardNightArchitecture.lightSockets.length === 3
    && guardNightArchitecture.lightSockets.every((socket) =>
      Number.isFinite(socket.at.x)
        && Number.isFinite(socket.at.y)
        && Number.isFinite(socket.at.z)
        && socket.intensity >= 16
        && socket.distance >= 6.2)
    && guardNightArchitecture.motivatedPracticalAudit
    && guardNightArchitecture.motivatedPracticalAudit.sourceBacked === true
    && guardNightArchitecture.motivatedPracticalAudit.mechanicalEffect === "none"
    && guardNightArchitecture.motivatedPracticalAudit.fixtureMemberIds.length === 8
    && guardNightArchitecture.motivatedPracticalAudit.lightSocketIds.every((id) =>
      guardNightArchitecture.lightSockets.some((socket) =>
        socket.id === id
          && guardNightArchitecture.compiledMembers.some((member) =>
            member.id === socket.supportId && member.role === "practical-emitter")))
    && institutionalGuardNightScene.compilation.plan.planFingerprint
      === institutionalGuardScene.compilation.plan.planFingerprint
    && institutionalGuardNightScene.compilation.plan.mechanicsFingerprint
      === institutionalGuardScene.compilation.plan.mechanicsFingerprint);
check("complete guardroom shell owns a true door, observation shutter, and closed hip roof",
  guardArchitecture.wallRuns.filter((run) => run.id.startsWith("route-control-guard-")).length === 4
    && guardArchitecture.openings.some((opening) =>
      opening.id === "route-control-guard-door" && opening.access === "walk")
    && guardArchitecture.openings.some((opening) =>
      opening.id === "route-control-observation-shutter" && opening.observation)
    && guardArchitecture.roofs.some((roof) =>
      roof.id === "route-control-guard-hip-roof"
        && roof.enclosure === "enclosed" && roof.closureExpected === 4)
    && guardArchitecture.validation.counts.roofJunctions === 4);
const guardHipRoof = guardArchitecture.roofs.find((roof) =>
  roof.id === "route-control-guard-hip-roof");
check("guard hip-roof fascia is one closed loop with culture-ready corner sockets",
  guardHipRoof
    && guardHipRoof.eaveCornerClosure
    && guardHipRoof.eaveCornerClosure.strategy === "wfc-compatible-mitered-run-loop"
    && guardHipRoof.eaveCornerClosure.memberIds.length === 4
    && guardHipRoof.eaveCornerClosure.memberIds.every((memberId) =>
      guardArchitecture.compiledMembers.some((member) => member.id === memberId))
    && guardHipRoof.eaveCornerClosure.expressionSockets.length === 4
    && guardHipRoof.eaveCornerClosure.topologyInvariant
      === "weather-envelope-remains-closed-under-cultural-expression"
    && guardHipRoof.innerEaveFlashingClosure
    && guardHipRoof.innerEaveFlashingClosure.strategy
      === "manifold-ring-with-four-inner-miter-aprons"
    && guardHipRoof.innerEaveFlashingClosure.memberIds.length === 5
    && guardHipRoof.innerEaveFlashingClosure.memberIds.every((memberId) =>
      guardArchitecture.compiledMembers.some((member) => member.id === memberId))
    && guardHipRoof.edgeInfillClosure
    && guardHipRoof.edgeInfillClosure.strategy
      === "wfc-compatible-mitered-run-loop"
    && guardHipRoof.edgeInfillClosure.memberIds.length === 4
    && guardHipRoof.edgeInfillClosure.junctionSockets.length === 4
    && guardHipRoof.edgeInfillClosure.terminalCaps.length === 0
    && guardHipRoof.edgeInfillClosure.memberIds.every((memberId) =>
      guardArchitecture.compiledMembers.some((member) => member.id === memberId)));
const guardLookoutClosure = guardArchitecture.orthogonalRunClosures.find((closure) =>
  closure.id === "route-control-lookout-edge");
const guardCorniceClosure = institutionalGuardScene.architecturePlan.orthogonalRunClosures.find((closure) =>
  closure.id === "route-control-culture-institutional-cornice");
check("cornice and lookout parapet close every non-intentional right-angle junction",
  guardCorniceClosure
    && guardCorniceClosure.strategy === "wfc-compatible-mitered-run-loop"
    && guardCorniceClosure.memberIds.length === 4
    && guardCorniceClosure.junctionSockets.length === 4
    && guardCorniceClosure.terminalCaps.length === 0
    && guardLookoutClosure
    && guardLookoutClosure.strategy === "wfc-compatible-mitered-open-band"
    && guardLookoutClosure.memberIds.length === 3
    && guardLookoutClosure.junctionSockets.length === 2
    && guardLookoutClosure.terminalCaps.length === 2
    && guardLookoutClosure.terminalCaps.every((cap) => cap.polygonVertices === 4
      && guardLookoutClosure.includedSides.includes(cap.side))
    && guardLookoutClosure.intentionalOpenSides.length === 1
    && guardLookoutClosure.intentionalOpenSides[0] === "south"
    && !guardLookoutClosure.includedSides.includes("south")
    && [guardCorniceClosure, guardLookoutClosure].every((closure) =>
      closure.memberIds.every((memberId) =>
        (closure === guardCorniceClosure
          ? institutionalGuardScene.architecturePlan.compiledMembers
          : guardArchitecture.compiledMembers
        ).some((member) => member.id === memberId))));
const guardFarRoadCorner = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-guard-structural-corner-far-road");
const guardStreetFirstBay = guardArchitecture.compiledMembers.find((member) =>
  member.id.startsWith("route-control-guard-street-wall:bay:"));
const guardFarWallBay = guardArchitecture.compiledMembers.find((member) =>
  member.id.startsWith("route-control-guard-far-return:bay:"));
check("neutral guard shell closes every wall corner before culture adds posts or quoins",
  guardArchitecture.guardCornerClosure
    && guardArchitecture.guardCornerClosure.strategy
      === "butt-jointed-structural-corner-posts"
    && guardArchitecture.guardCornerClosure.cultureIndependent === true
    && guardArchitecture.guardCornerClosure.memberIds.length === 4
    && guardArchitecture.guardCornerClosure.memberIds.every((memberId) =>
      guardArchitecture.compiledMembers.some((member) => member.id === memberId))
    && guardFarRoadCorner && guardStreetFirstBay && guardFarWallBay
    && Math.abs(
      guardFarRoadCorner.center.x + guardFarRoadCorner.size.x / 2
      - (guardStreetFirstBay.center.x + guardStreetFirstBay.size.z / 2)
    ) < 0.0001
    && Math.abs(
      guardFarRoadCorner.center.z - guardFarRoadCorner.size.z / 2
      - (guardFarWallBay.center.z - guardFarWallBay.size.z / 2)
    ) < 0.0001);
check("lookout deck bears on the crown and has one clear grounded stair",
  guardArchitecture.levels.some((level) => level.id === "route-control-lookout-deck")
    && guardArchitecture.stairs.length === 1
    && guardArchitecture.stairs[0].supportMode === "grounded-solid"
    && guardArchitecture.validation.stairClearanceAudit.ok);
check("retaining history includes one real drainage void and a causal repair card",
  guardArchitecture.openings.some((opening) =>
    opening.id === "route-control-drain-outfall"
      && opening.kind === "drainage-outfall")
    && guardArchitecture.repairCard.id === "downhill-drainage-splice"
    && guardArchitecture.compiledMembers.some((member) => member.role === "repair"));
const oldFarRetaining = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-retaining-old-far");
const oldNearRetaining = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-retaining-old-near");
const drainageRepairRun = guardArchitecture.wallRuns.find((run) =>
  run.id === "route-control-drainage-repair");
check("old retaining masonry meets the repair flush instead of leaving air slots",
  oldFarRetaining && oldNearRetaining && drainageRepairRun
    && Math.abs(
      oldFarRetaining.center.z + oldFarRetaining.size.x / 2
      - drainageRepairRun.start.z) < 0.0001
    && Math.abs(
      oldNearRetaining.center.z - oldNearRetaining.size.x / 2
      - drainageRepairRun.end.z) < 0.0001);
const retainingFootingMember = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-retaining-continuous-gravel-footing");
check("responsive retaining wall bears on one terrain-embedded gravel footing",
  retainingFootingMember && guardArchitecture.retainingFooting
    && guardArchitecture.retainingFooting.schema === "TerrainEmbeddedRunFootingV1"
    && guardArchitecture.retainingFooting.memberId === retainingFootingMember.id
    && guardArchitecture.retainingFooting.embedDepth >= 0.36
    && guardArchitecture.retainingFooting.topY > oldNearRetaining.center.y
      - oldNearRetaining.size.y / 2
    && retainingFootingMember.supportedBy.includes("ground")
    && oldNearRetaining.supportedBy.includes(retainingFootingMember.id)
    && oldFarRetaining.supportedBy.includes(retainingFootingMember.id)
    && guardVisualProfile.materialBindings.architecture["foundation-gravel"]
      === "foundation-gravel-contact");
const runoffProjection = guardArchitecture.conditionProjection
  && guardArchitecture.conditionProjection.find((row) =>
    row.id === "route-control-drainage-water-history");
const lowerWallProjection = guardArchitecture.conditionProjection
  && guardArchitecture.conditionProjection.find((row) =>
    row.id === "route-control-lower-wall-history");
const retainingFootingReceiver = lowerWallProjection
  && lowerWallProjection.receiverBands.find((band) =>
    band.id === "retaining-continuous-footing-contact");
check("embedded gravel footing conditions its exposed sides and upward support surface",
  retainingFootingReceiver
    && retainingFootingReceiver.receiverFaceMode === "vertical-and-upward-support");
const cornerIvyProjection = guardArchitecture.conditionProjection
  && guardArchitecture.conditionProjection.find((row) =>
    row.id === "route-control-corner-ivy-history");
const guardFoundationMember = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-guard-foundation");
const guardStreetGrime = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-grime-guard-street-old-base");
const guardFarGrime = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-grime-guard-far-old-base");
const guardNearGrime = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-grime-guard-near-old-base");
const guardUphillGrime = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-grime-guard-uphill-old-base");
const foundationGrimeClosure = lowerWallProjection && lowerWallProjection.foundationClosure;
const ivyStreetFace = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-ivy-guard-far-road-street-face");
const ivyReturnFace = guardArchitecture.compiledMembers.find((member) =>
  member.id === "route-control-ivy-guard-far-road-return-face");
check("condition grammar carries three TS-readable scales from contact edges",
  lowerWallProjection
    && lowerWallProjection.placementGrammar === "broad-lower-band"
    && lowerWallProjection.faceCoverageRule === "edge-origin-not-edge-confined"
    && lowerWallProjection.visibilityRule === "readable-at-gameplay-scale"
    && lowerWallProjection.geometryMemberIds.includes("route-control-grime-guard-street-old-base")
    && runoffProjection
    && runoffProjection.placementGrammar === "edge-origin-with-outward-spread"
    && runoffProjection.faceCoverageRule === "mid-scale-unequal-pockets"
    && runoffProjection.geometryMemberIds.includes("route-control-moss-outfall-left-pocket")
    && runoffProjection.geometryMemberIds.includes("route-control-moss-channel-left-lip")
    && cornerIvyProjection
    && cornerIvyProjection.placementGrammar === "contact-rooted-silhouette-cluster"
    && cornerIvyProjection.geometryMemberIds.includes(
      "route-control-ivy-guard-far-road-street-face")
    && cornerIvyProjection.geometryMemberIds.includes(
      "route-control-ivy-guard-far-road-return-face"),
  guardArchitecture.conditionProjection);
check("building condition crosses the wall seam onto the true ground-contact foundation",
  guardFoundationMember && guardStreetGrime && guardFarGrime
    && guardNearGrime && guardUphillGrime && foundationGrimeClosure
    && lowerWallProjection.supportContactRule
      === "condition-crosses-wall-foundation-seam-to-true-support-bottom"
    && Math.abs(
      guardStreetGrime.center.y - guardStreetGrime.size.y / 2
      - (guardFoundationMember.center.y - guardFoundationMember.size.y / 2 + 0.004)
    ) < 0.0001
    && Math.abs(
      guardFarGrime.center.y - guardFarGrime.size.y / 2
      - (guardFoundationMember.center.y - guardFoundationMember.size.y / 2 + 0.004)
    ) < 0.0001
    && guardStreetGrime.supportedBy.includes("route-control-guard-foundation")
    && guardFarGrime.supportedBy.includes("route-control-guard-foundation")
    && guardNearGrime.supportedBy.includes("route-control-guard-foundation")
    && guardUphillGrime.supportedBy.includes("route-control-guard-foundation")
    && foundationGrimeClosure.strategy === "wfc-compatible-mitered-run-loop"
    && foundationGrimeClosure.memberIds.length === 4
    && foundationGrimeClosure.junctionSockets.length === 4
    && foundationGrimeClosure.memberIds.every((memberId) =>
      lowerWallProjection.geometryMemberIds.includes(memberId)
      && guardArchitecture.compiledMembers.some((member) => member.id === memberId)));
check("paired ivy faces meet at one outer-corner anchor without a uniform seam gap",
  cornerIvyProjection
    && cornerIvyProjection.cornerContinuityRule
      === "both-face-receivers-share-one-outer-corner-endpoint"
    && ivyStreetFace && ivyReturnFace
    && Math.abs(
      ivyStreetFace.center.z - ivyStreetFace.size.x / 2
      - cornerIvyProjection.sharedCornerAnchor.z
    ) < 0.0001
    && Math.abs(
      ivyReturnFace.center.x + ivyReturnFace.size.x / 2
      - cornerIvyProjection.sharedCornerAnchor.x
    ) < 0.0001
    && cornerIvyProjection.rootSupportRef === "ground"
    && cornerIvyProjection.rootReceiverRef === "route-control-guard-foundation"
    && cornerIvyProjection.rootRule
      === "growth-first-visible-at-gravel-foundation-contact-then-crosses-foundation-wall-seam");
check("condition art stays parent-independent and receiver-local",
  ["lower-wall-grime", "seam-moss", "corner-ivy-face-a", "corner-ivy-face-b"]
    .every((materialId) => {
    const definition = guardVisualProfile.materialDefinitions[materialId];
    return definition
      && definition.parentBlend
      && definition.parentBlend.mode === "source-over-parent"
      && !definition.maps.normal
      && !definition.maps.orm;
  })
    && guardVisualProfile.materialDefinitions["lower-wall-grime"].projection
      === "receiver-local-trim"
    && guardVisualProfile.materialDefinitions["lower-wall-grime"].wrapMode
      === "repeat-x-clamp-y"
    && !guardVisualProfile.materialDefinitions["lower-wall-grime"].atlasSlot
    && guardVisualProfile.materialDefinitions["lower-wall-grime"].maps.albedo
      === "/assets/materials/golden/guard-post/v013/"
        + "lower-wall-readable-ground-contact-grime-albedo-alpha.png"
    && guardVisualProfile.materialDefinitions["foundation-gravel-contact"]
    && guardVisualProfile.materialDefinitions["foundation-gravel-contact"].conditionBlend
    && guardVisualProfile.materialDefinitions["foundation-gravel-contact"].maps.conditionAlbedo
      === "/assets/materials/golden/guard-post/v013/"
        + "lower-wall-readable-ground-contact-grime-albedo-alpha.png"
    && guardVisualProfile.materialDefinitions["foundation-gravel-contact"]
      .maps.growthTopConditionAlbedo
      === "/assets/materials/golden/guard-post/v014/"
        + "foundation-top-algae-authored-alpha-512.png"
    && guardVisualProfile.materialDefinitions["foundation-gravel-contact"]
      .conditionBlend.growthTopStrength === 1
    && guardVisualProfile.materialDefinitions["foundation-gravel-contact"]
      .conditionBlend.growthContactApron === 0.86
    && guardVisualProfile.materialBindings.architecture["foundation-gravel"]
      === "foundation-gravel-contact"
    && guardVisualProfile.materialDefinitions["seam-moss"].projection
      === "receiver-local-decal"
    && guardVisualProfile.materialDefinitions["corner-ivy-face-a"].atlasSlot.id
      === "corner-ivy-face-a"
    && guardVisualProfile.materialDefinitions["corner-ivy-face-a"].atlasSlot.sampleInsetPx === 0.5
    && guardVisualProfile.materialDefinitions["corner-ivy-face-b"].atlasSlot.id
      === "corner-ivy-face-b"
    && guardVisualProfile.materialPackRef
      === "assets/materials/golden/guard-post/v018/manifest.json"
    && guardVisualProfile.groundCalibration
    && guardVisualProfile.groundCalibration.candidate === "v018"
    && guardVisualProfile.groundCalibration.metersPerRepeat === 9.9
    && guardVisualProfile.groundCalibration.cellsPerRepeat === 6
    && guardVisualProfile.groundCalibration.pixelsPerFoot === 32
    && guardVisualProfile.groundCalibration.physicalRepeatFeet === 30
    && JSON.stringify(guardVisualProfile.groundCalibration.exactPixelSize)
      === "[960,960]"
    && guardVisualProfile.groundCalibration.mechanicalEffect === "none"
    && guardVisualProfile.materialSourcePacks
      .includes("assets/materials/golden/guard-post/v009/manifest.json")
    && guardVisualProfile.materialSourcePacks
      .includes("assets/materials/golden/guard-post/v012/manifest.json")
    && guardVisualProfile.materialSourcePacks
      .includes("assets/materials/golden/guard-post/v013/manifest.json")
    && guardVisualProfile.materialSourcePacks
      .includes("assets/materials/golden/guard-post/v014/manifest.json"));
check("default Guard Post ground is the selected technical v018 parent, not an approval",
  guardVisualProfile.materialDefinitions["ground-upland-field"].maps.albedo
      === "/assets/materials/golden/guard-post/v018/"
        + "ground-upland-turf-30ft-32ppf-albedo.png"
    && guardVisualProfile.materialSourcePacks
      .includes("assets/materials/golden/guard-post/v018/manifest.json"));
check("natural-field grade reserves encounter values without repainting the v018 source",
  guardVisualProfile.materialDefinitions["ground-upland-field"].tint === "#a6acb5"
    && uplandGuardScene.visualProfile.materialDefinitions["ground-upland-field"].tint
      === "#9cabb0"
    && guardVisualProfile.materialDefinitions["ground-upland-field"].maps.albedo
      === uplandGuardScene.visualProfile.materialDefinitions["ground-upland-field"].maps.albedo
    && institutionalGuardScene.compilation.plan.mechanicsFingerprint
      === uplandGuardScene.compilation.plan.mechanicsFingerprint);
const v016GroundManifest = JSON.parse(
  read("assets/materials/golden/guard-post/v016/manifest.json"));
const v016GroundDefinition = v016GroundGuardScene.visualProfile
  && v016GroundGuardScene.visualProfile.materialDefinitions["ground-upland-field"];
check("v016 resolves the selected six-cell ground parent at exact 32px per foot",
  v016GroundManifest.status === "TECHNICAL_CANDIDATE_NOT_APPROVED"
    && v016GroundManifest.physicalEnvelope.widthFeet === 30
    && v016GroundManifest.physicalEnvelope.heightFeet === 30
    && v016GroundManifest.physicalEnvelope.pixelsPerFoot === 32
    && JSON.stringify(v016GroundManifest.physicalEnvelope.exactPixelSize)
      === "[960,960]"
    && v016GroundManifest.seamLock.exactBoundaryMatch === true
    && v016GroundManifest.contentLaw.cameraNeutral === true
    && v016GroundManifest.contentLaw.bakedUprightTufts === false
    && v016GroundGuardScene.compilation.plan.planFingerprint
      === institutionalGuardScene.compilation.plan.planFingerprint
    && v016GroundGuardScene.compilation.plan.mechanicsFingerprint
      === institutionalGuardScene.compilation.plan.mechanicsFingerprint
    && v016GroundGuardScene.visualProfile.groundCalibration.candidate === "v016"
    && v016GroundGuardScene.visualProfile.groundCalibration.cellsPerRepeat === 6
    && v016GroundGuardScene.visualProfile.groundCalibration.pixelsPerFoot === 32
    && v016GroundGuardScene.visualProfile.groundCalibration.physicalRepeatFeet === 30
    && JSON.stringify(v016GroundGuardScene.visualProfile.groundCalibration.exactPixelSize)
      === "[960,960]"
    && v016GroundDefinition.maps.albedo
      === "/assets/materials/golden/guard-post/v016/"
        + "ground-upland-turf-30ft-32ppf-albedo.png"
    && v016GroundDefinition.maps.normal
      === "/assets/materials/golden/guard-post/v016/"
        + "ground-upland-turf-30ft-32ppf-normal.png"
    && v016GroundDefinition.maps.orm
      === "/assets/materials/golden/guard-post/v016/"
        + "ground-upland-turf-30ft-32ppf-orm.png");
const v017GroundManifest = JSON.parse(
  read("assets/materials/golden/guard-post/v017/manifest.json"));
const v017GroundDefinition = v017GroundGuardScene.visualProfile
  && v017GroundGuardScene.visualProfile.materialDefinitions["ground-upland-field"];
check("v017 preserves the same 32px/ft envelope as a distinct visual candidate",
  v017GroundManifest.status === "TECHNICAL_CANDIDATE_NOT_APPROVED"
    && v017GroundManifest.physicalEnvelope.pixelsPerFoot === 32
    && JSON.stringify(v017GroundManifest.physicalEnvelope.exactPixelSize)
      === "[960,960]"
    && v017GroundManifest.seamLock.exactBoundaryMatch === true
    && v017GroundGuardScene.compilation.plan.planFingerprint
      === institutionalGuardScene.compilation.plan.planFingerprint
    && v017GroundGuardScene.compilation.plan.mechanicsFingerprint
      === institutionalGuardScene.compilation.plan.mechanicsFingerprint
    && v017GroundGuardScene.visualProfile.groundCalibration.candidate === "v017"
    && v017GroundGuardScene.visualProfile.groundCalibration.pixelsPerFoot === 32
    && v017GroundDefinition.maps.albedo.startsWith(
      "/assets/materials/golden/guard-post/v017/"));
const v018GroundManifest = JSON.parse(
  read("assets/materials/golden/guard-post/v018/manifest.json"));
const v018GroundDefinition = v018GroundGuardScene.visualProfile
  && v018GroundGuardScene.visualProfile.materialDefinitions["ground-upland-field"];
check("v018 locks v011 macro composition while adding bounded 32px/ft articulation",
  v018GroundManifest.status === "TECHNICAL_CANDIDATE_NOT_APPROVED"
    && v018GroundManifest.visualVerdict.status
      === "SELECTED_TECHNICAL_PARENT_PENDING_FAMILY_PROOF"
    && v018GroundManifest.visualVerdict.evidence
      === "artifacts/golden-site-1-ground-density-v018/"
        + "01-v011-v018-ground-density-comparison.png"
    && v018GroundManifest.macroAuthority
      === "assets/materials/golden/guard-post/v011/ground-upland-turf-albedo.png"
    && v018GroundManifest.detailContribution.highPassStrength === 0.28
    && v018GroundManifest.physicalEnvelope.pixelsPerFoot === 32
    && JSON.stringify(v018GroundManifest.physicalEnvelope.exactPixelSize)
      === "[960,960]"
    && v018GroundManifest.seamLock.exactBoundaryMatch === true
    && v018GroundGuardScene.compilation.plan.planFingerprint
      === institutionalGuardScene.compilation.plan.planFingerprint
    && v018GroundGuardScene.compilation.plan.mechanicsFingerprint
      === institutionalGuardScene.compilation.plan.mechanicsFingerprint
    && v018GroundGuardScene.visualProfile.groundCalibration.candidate === "v018"
    && v018GroundGuardScene.visualProfile.groundCalibration.pixelsPerFoot === 32
    && v018GroundDefinition.maps.albedo.startsWith(
      "/assets/materials/golden/guard-post/v018/"));
const terrainConditionField = guardVisualProfile.terrainConditionFields
  && guardVisualProfile.terrainConditionFields.find((field) =>
    field.id === "route-control-outfall-downhill-damp");
check("angled ground uses an engine-authored mesh-conformal moisture field, not flat decals",
  terrainConditionField
    && terrainConditionField.projection === "mesh-conformal-shared-vertex-field"
    && terrainConditionField.coordinateDomain === "continuous-terrain-field"
    && terrainConditionField.distributionRule
      === "least-uphill-drainage-walk-plus-concavity"
    && terrainConditionField.pathCells.length >= 3
    && terrainConditionField.weights.length === guard.plan.terrainPlan.field.cells.length
    && terrainConditionField.weights.every((weight) => weight >= 0 && weight <= 1)
    && terrainConditionField.maximumWeight > 0.5
    && terrainConditionField.mechanicalEffect === "none"
    && guardVisualProfile.materialDefinitions["ground-upland-field"]
      .maps.conditionAlbedo.endsWith("seam-moss-runtime-albedo-alpha.png"),
  terrainConditionField);
const roughCourse = guardVisualProfile.materialDefinitions["masonry-rough"];
const ashlarCourse = guardVisualProfile.materialDefinitions["masonry-ashlar"];
const institutionalTrim =
  guardVisualProfile.materialDefinitions["masonry-institutional-trim"];
check("selected defensive masonry keeps large horizontal blocks and exact one-foot courses",
  roughCourse
    && roughCourse.metersPerRepeatX === 2.75
    && roughCourse.worldUnitsPerRepeatX === 1.6666667
    && roughCourse.worldUnitsPerRepeatY === 1.2
    && roughCourse.masonryCourse.courseRowsPerTile === 6
    && roughCourse.masonryCourse.courseHeightFeet === 1
    && roughCourse.masonryCourse.courseHeightWorldUnits === 0.2
    && roughCourse.masonryCourse.verticalRule === "five-courses-per-five-feet"
    && Math.abs(roughCourse.worldUnitsPerRepeatY
      / roughCourse.masonryCourse.courseRowsPerTile - 0.2) < 1e-10
    && ashlarCourse
    && ashlarCourse.metersPerRepeatX === 2.75
    && ashlarCourse.worldUnitsPerRepeatX === 1.6666667
    && ashlarCourse.worldUnitsPerRepeatY === 2.4
    && ashlarCourse.masonryCourse.courseRowsPerTile === 12
    && Math.abs(ashlarCourse.worldUnitsPerRepeatY
      / ashlarCourse.masonryCourse.courseRowsPerTile - 0.2) < 1e-10,
  {
    rough: roughCourse && roughCourse.masonryCourse,
    ashlar: ashlarCourse && ashlarCourse.masonryCourse
  });
check("institutional attachment geometry has one readable trim material language",
  institutionalTrim
    && institutionalTrim.family === "institutional-edge-and-opening-language"
    && institutionalTrim.contextVerdict === "PENDING_GUARD_POST_REVIEW"
    && guardVisualProfile.materialBindings.architecture["masonry-edge"]
      === "masonry-institutional-trim"
    && uplandGuardScene.visualProfile.materialBindings.architecture["masonry-edge"]
      === "masonry-ashlar");
const reusableSourceKitV015 = JSON.parse(
  read("assets/materials/golden/guard-post/v015/manifest.json"));
console.log("\nWave 2 · reusable ImageGen source candidates");
check("v015 retains specific forms while governing their production and selection budget",
  reusableSourceKitV015.status === "SOURCE_CANDIDATE_NOT_RUNTIME_ADMITTED"
    && reusableSourceKitV015.specificityLaw
      === "specific forms are retained; production volume and default procedural eligibility "
        + "decrease as specificity increases"
    && reusableSourceKitV015.maskSheets.some((sheet) =>
      sheet.utilityTier === "mixed-universal-family-and-specific-accent")
    && reusableSourceKitV015.maskSheets.every((sheet) =>
      sheet.productionBudget && sheet.status === "SOURCE_CANDIDATE_NOT_RUNTIME_ADMITTED"));
check("all reusable mask candidates are binary-alpha and visibly magenta-free",
  reusableSourceKitV015.hardChecks.allMasksBinaryAlpha
    && reusableSourceKitV015.hardChecks.allMasksVisibleMagentaFree
    && reusableSourceKitV015.maskSheets.every((sheet) =>
      sheet.partialAlphaPixels === 0
        && sheet.visibleMagentaFamilyPixels === 0
        && sheet.alphaMode === "binary-threshold-128"));
check("source sheets compile into placement-ready primitives without admitting every form",
  reusableSourceKitV015.hardChecks.runtimePrimitivesBinaryAlpha
    && reusableSourceKitV015.hardChecks.runtimePrimitivesVisibleMagentaFree
    && reusableSourceKitV015.hardChecks.runtimePrimitivesHavePlacementSockets
    && reusableSourceKitV015.runtimePrimitives.length >= 8
    && reusableSourceKitV015.runtimePrimitives.every((primitive) =>
      primitive.status === "RUNTIME_CANDIDATE_NOT_APPROVED"
        && primitive.partialAlphaPixels === 0
        && primitive.visibleMagentaFamilyPixels === 0
        && primitive.placementSocket)
    && reusableSourceKitV015.runtimePrimitives.some((primitive) =>
      primitive.id === "contact-grime-apron-tileable-mask-512x128"
        && primitive.utilityTier === "universal-primitive")
    && reusableSourceKitV015.runtimePrimitives.some((primitive) =>
      primitive.id === "architectural-relief-band-mask-320x96"
        && primitive.utilityTier === "universal-join-primitive"));
const institutionalTerrainDressing = institutionalGuardScene.visualProfile
  && institutionalGuardScene.visualProfile.terrainDressing;
check("camera-neutral turf dressing is sparse, semantic, and physically authored at 32px per foot",
  institutionalTerrainDressing
    && institutionalTerrainDressing.sourceAsset
      === "/assets/materials/golden/guard-post/v015/runtime/radial-grass-tuft-mask-160.png"
    && institutionalTerrainDressing.pixelsPerFoot === 32
    && institutionalTerrainDressing.sourceEnvelope === "F5D5"
    && JSON.stringify(institutionalTerrainDressing.sourceSizePixels) === "[160,160]"
    && institutionalTerrainDressing.projection === "two-crossed-slope-rooted-planes"
    && institutionalTerrainDressing.placements.length >= 4
    && institutionalTerrainDressing.placements.length <= 6
    && new Set(institutionalTerrainDressing.placements.map((placement) =>
      placement.sourceZoneId)).size === institutionalTerrainDressing.placements.length
    && institutionalTerrainDressing.placements.every((placement) =>
      placement.mechanicalEffect === "none"
        && institutionalGuardScene.compilation.plan.terrainPlan.field
          .cells[placement.cell.index].surface !== "guard-through-road"
        && placement.cell.x >= 1 && placement.cell.y >= 1
        && placement.cell.x
          < institutionalGuardScene.compilation.plan.terrainPlan.field.extent.x - 1
        && placement.cell.y
          < institutionalGuardScene.compilation.plan.terrainPlan.field.extent.y - 1)
    && institutionalTerrainDressing.placements.every((placement, index, placements) =>
      placements.every((other, otherIndex) => index === otherIndex
        || Math.max(Math.abs(placement.cell.x - other.cell.x),
          Math.abs(placement.cell.y - other.cell.y)) >= 3))
    && institutionalTerrainDressing.planRef
      === institutionalGuardScene.compilation.plan.planFingerprint
    && institutionalTerrainDressing.mechanicsRef
      === institutionalGuardScene.compilation.plan.mechanicsFingerprint
    && institutionalTerrainDressing.mechanicalEffect === "none");
const partyGuardSpritePack = JSON.parse(
  read("assets/sprites-golden/guard-post-v001/manifest.json"));
const partyGuardProof = partyProofGuardScene.visualProfile
  && partyProofGuardScene.visualProfile.worldPixelDensityDemonstration;
check("32 px/ft party and guard pack rejects clipped or contaminated silhouettes",
  partyGuardSpritePack.targetPixelsPerFoot === 32
    && partyGuardSpritePack.members.length === 8
    && partyGuardSpritePack.hardChecks.eightMembers
    && partyGuardSpritePack.hardChecks.allExact32PixelsPerFoot
    && partyGuardSpritePack.hardChecks.allBinaryAlpha
    && partyGuardSpritePack.hardChecks.allVisibleMagentaFree
    && partyGuardSpritePack.hardChecks.allSilhouettesIsolated
    && partyGuardSpritePack.hardChecks.allCanvasEdgesPadded
    && partyGuardSpritePack.hardChecks.allDeclaredEquipmentPreserved
    && partyGuardSpritePack.members.every((member) =>
      member.minimumTransparentPaddingPixels >= 6
        && member.unintendedCanvasEdgeContact === false
        && member.declaredEquipmentPreserved === true));
check("party-versus-guards density proof is opt-in and preserves committed mechanics",
  !institutionalGuardScene.visualProfile.worldPixelDensityDemonstration
    && partyProofGuardScene.compilation.plan.planFingerprint
      === institutionalGuardScene.compilation.plan.planFingerprint
    && partyProofGuardScene.compilation.plan.mechanicsFingerprint
      === institutionalGuardScene.compilation.plan.mechanicsFingerprint
    && JSON.stringify(partyProofGuardScene.architecturePlan)
      === JSON.stringify(institutionalGuardScene.architecturePlan)
    && partyGuardProof
    && partyGuardProof.mechanicalEffect === "none"
    && partyGuardProof.planRef
      === partyProofGuardScene.compilation.plan.planFingerprint
    && partyGuardProof.mechanicsRef
      === partyProofGuardScene.compilation.plan.mechanicsFingerprint);
const goldenRendererSource = read("src/ui/theater-clay-room.js");
check("Golden Site beauty frames cannot inherit clipped terrain-diagnostic sprites",
  goldenRendererSource.includes("} else if(!goldenScene) {")
    && goldenRendererSource.includes("no-implicit-terrain-diagnostic-witnesses")
    && goldenRendererSource.includes("explicit-governed-population-proof-only"));
const theaterBootSource = read("src/ui/theater-boot.js");
const terrainCaptureSource = read("dev/capture-clay-terrain-bench.cjs");
check("party-proof closeups measure real standee bounds and reject frame-edge clipping",
  goldenRendererSource.includes("figure.userData.interiorWidth = built.width")
    && theaterBootSource.includes("new THREE.Box3().setFromObject")
    && theaterBootSource.includes("bounds: { left: minX, top: minY, right: maxX, bottom: maxY }")
    && terrainCaptureSource.includes("partyProofFrameGuard")
    && terrainCaptureSource.includes("clippedCount: clipped.length")
    && terrainCaptureSource.includes("marginPhysicalPixels: 24"));
check("architecture-focused closeups reject real geometry crossing the frame",
  theaterBootSource.includes("window.Theater.__architectureScreenRect")
    && theaterBootSource.includes("data.clayArchitectureAsset")
    && terrainCaptureSource.includes("architectureFrameGuard")
    && terrainCaptureSource.includes("architectureClipped")
    && terrainCaptureSource.includes("clipped.length || architectureClipped"));
check("density proof places four PCs and four guards on distinct legal cells",
  partyGuardProof
    && partyGuardProof.actorCount === 8
    && partyGuardProof.actors.filter((actor) => actor.side === "pc").length === 4
    && partyGuardProof.actors.filter((actor) => actor.side === "guard").length === 4
    && new Set(partyGuardProof.actors.map((actor) => actor.cell.index)).size === 8
    && partyGuardProof.architectureExclusionRule
      === "terrain-mounted-cast-excludes-all-constructed-footprints-plus-two-cell-presentation-apron"
    && partyGuardProof.architecturePresentationApronCells === 2
    && partyGuardProof.architectureSightlineRule
      === "all-four-governed-diagonal-rays-clear-all-construction-masses-except-threshold-barrier"
    && partyGuardProof.architectureSightlineOccluders.length
      === partyProofGuardScene.compilation.plan.constructionPlan.filter((item) =>
        item && item.footprint && item.role !== "road-barrier").length
    && partyGuardProof.architectureExclusions.length
      === partyProofGuardScene.compilation.plan.constructionPlan.length
    && partyGuardProof.actorSilhouetteClearanceRule
      === "one-cell-presentation-halo-between-terrain-mounted-standee-centres"
    && partyGuardProof.actorSilhouetteClearanceCells === 1
    && partyGuardProof.actors.every((actor, actorIndex, actors) =>
      actors.every((other, otherIndex) => actorIndex === otherIndex
        || Math.max(Math.abs(actor.cell.x - other.cell.x),
          Math.abs(actor.cell.y - other.cell.y)) > 1))
    && partyGuardProof.actors.every((actor) =>
      guard.plan.terrainPlan.field.cells[actor.cell.index].standable
        && !partyGuardProof.architectureExclusions.some((exclusion) =>
          actor.cell.x >= exclusion.x0 && actor.cell.x <= exclusion.x1
            && actor.cell.y >= exclusion.y0 && actor.cell.y <= exclusion.y1)
        && actor.pixelsPerFoot === 32
        && actor.bodySubjectHeightPixels === Math.round(actor.worldHeightFeet * 32)
        && actor.standeeExtrusion
        && actor.supportStyle === "terrain-integrated-shadow-plinth"
        && actor.supportTrimHex === 0x29251f
        && actor.supportVisualScale.x === 0.62
        && actor.supportVisualScale.z === 0.72
        && actor.mechanicalEffect === "none"));
check("engine density-proof metadata matches the packaged sprite sources",
  partyGuardProof
    && partyGuardProof.actors.every((actor) => {
      const packaged = partyGuardSpritePack.members.find((member) =>
        member.id === actor.id);
      return packaged
        && actor.asset === packaged.asset
        && actor.bodySubjectHeightPixels === packaged.bodySubjectHeightPixels
        && actor.worldHeightFeet === packaged.worldHeightFeet
        && actor.canvasSize.join("x") === packaged.canvasSize.join("x")
        && actor.footX === packaged.footX
        && actor.footY === packaged.footY;
    }));
check("architecture-aware cast allocation survives changed Guard Post seeds",
  [partyProofGuardChangedA, partyProofGuardChangedB].every((changedScene) => {
    const changedProof = changedScene.visualProfile
      && changedScene.visualProfile.worldPixelDensityDemonstration;
    return changedProof
      && changedProof.actorCount === 8
      && new Set(changedProof.actors.map((actor) => actor.cell.index)).size === 8
      && changedProof.actors.every((actor) =>
        changedScene.compilation.plan.terrainPlan.field.cells[actor.cell.index].standable
          && !changedProof.architectureExclusions.some((exclusion) =>
            actor.cell.x >= exclusion.x0 && actor.cell.x <= exclusion.x1
              && actor.cell.y >= exclusion.y0 && actor.cell.y <= exclusion.y1))
      && changedProof.mechanicsRef
        === changedScene.compilation.plan.mechanicsFingerprint
      && changedProof.mechanicalEffect === "none";
  }));
check("new defensive masonry parent is physically authored at 32px per foot",
  reusableSourceKitV015.hardChecks.masonryW5H5Exact160
    && reusableSourceKitV015.hardChecks.masonryFiveExact32pxCourses
    && reusableSourceKitV015.masonry[0].physicalEnvelope === "W5H5"
    && reusableSourceKitV015.masonry[0].size.join("x") === "160x160"
    && reusableSourceKitV015.masonry[0].pixelsPerFoot === 32
    && reusableSourceKitV015.masonry[0].courseCount === 5
    && reusableSourceKitV015.masonry[0].pixelsPerCourse === 32);
check("masonry pack provides shared-socket W5H5 variants and linked larger envelopes",
  reusableSourceKitV015.hardChecks.masonryHasThreeSharedSocketBondVariants
    && reusableSourceKitV015.hardChecks.masonryHasLinkedW5H10AndW10H10Proofs
    && reusableSourceKitV015.masonry.filter((map) => map.variant).length === 3
    && reusableSourceKitV015.masonry.some((map) =>
      map.physicalEnvelope === "W5H10" && map.size.join("x") === "160x320")
    && reusableSourceKitV015.masonry.some((map) =>
      map.physicalEnvelope === "W10H10" && map.size.join("x") === "320x320"));
check("v015 masonry and condition remain opt-in while its governed tuft primitive is reusable",
  reusableSourceKitV015.masonry.every((map) =>
    map.status === "TECHNICAL_CANDIDATE_NOT_APPROVED")
    && guardVisualProfile.materialSourcePacks
      .includes("assets/materials/golden/guard-post/v015/manifest.json")
    && guardVisualProfile.materialBindings.architecture["masonry-wall"]
      !== "masonry-defensive-v015"
    && guardVisualProfile.conditionCalibration.candidate !== "v015"
    && guardVisualProfile.terrainDressing.sourceAsset.endsWith(
      "/runtime/radial-grass-tuft-mask-160.png"));
const v015VisualProfile = v015GuardScene.visualProfile;
const v015Masonry = v015VisualProfile
  && v015VisualProfile.materialDefinitions["masonry-defensive-v015"];
check("opt-in v015 masonry changes presentation without changing the committed battlefield",
  v015GuardScene.compilation.plan.planFingerprint
      === institutionalGuardScene.compilation.plan.planFingerprint
    && v015GuardScene.compilation.plan.mechanicsFingerprint
      === institutionalGuardScene.compilation.plan.mechanicsFingerprint
    && JSON.stringify(v015GuardScene.architecturePlan)
      === JSON.stringify(institutionalGuardScene.architecturePlan)
    && v015VisualProfile.materialBindings.architecture["masonry-wall"]
      === "masonry-defensive-v015"
    && v015VisualProfile.materialSourcePacks
      .includes("assets/materials/golden/guard-post/v015/manifest.json"));
check("opt-in v015 masonry declares exact 32px-per-foot face-local W10H10 calibration",
  v015VisualProfile.masonryCalibration
    && v015VisualProfile.masonryCalibration.candidate === "v015"
    && v015VisualProfile.masonryCalibration.pixelsPerFoot === 32
    && v015VisualProfile.masonryCalibration.parentEnvelope === "W10H10"
    && v015VisualProfile.masonryCalibration.mechanicalEffect === "none"
    && v015Masonry
    && v015Masonry.state === "technical-candidate-not-approved"
    && v015Masonry.faceLocalModuleFeet === 10
    && v015Masonry.worldUnitsPerRepeatX === 2
    && v015Masonry.worldUnitsPerRepeatY === 2
    && v015Masonry.masonryCourse.courseRowsPerTile === 10
    && v015Masonry.masonryCourse.courseHeightFeet === 1
    && v015Masonry.maps.albedo.endsWith(
      "defensive-masonry-W10H10-bond-proof-320-albedo.png"));
const v015IvyA = v015VisualProfile.materialDefinitions["corner-ivy-face-a"];
const v015IvyB = v015VisualProfile.materialDefinitions["corner-ivy-face-b"];
check("opt-in v015 conditions use parent-independent grime and paired corner sockets",
  v015VisualProfile.conditionCalibration
    && v015VisualProfile.conditionCalibration.candidate === "v015"
    && v015VisualProfile.conditionCalibration.parentIndependentMasks
    && v015VisualProfile.conditionCalibration.mechanicalEffect === "none"
    && v015VisualProfile.conditionCalibration.placementSockets.length === 3
    && v015Masonry.maps.conditionAlbedo.endsWith(
      "v013/lower-wall-readable-ground-contact-grime-albedo-alpha.png")
    && !v015Masonry.maps.conditionAlbedo.includes(
      "contact-grime-apron-tileable-mask")
    && v015IvyA.maps.albedo.endsWith(
      "runtime/ivy-corner-face-a-shared-left-mask-256.png")
    && v015IvyB.maps.albedo.endsWith(
      "runtime/ivy-corner-face-b-shared-right-mask-256.png")
    && !v015IvyA.atlasSlot
    && !v015IvyB.atlasSlot);
const v015RoughMasonry = v015VisualProfile.materialDefinitions["masonry-rough"];
const v015Ashlar = v015VisualProfile.materialDefinitions["masonry-ashlar"];
check("parent masonry carries visible causal grime and growth without promoting the rejected wedge apron",
  v015RoughMasonry.maps.conditionAlbedo.endsWith(
    "v013/lower-wall-readable-ground-contact-grime-albedo-alpha.png")
    && v015RoughMasonry.maps.growthConditionAlbedo.endsWith(
      "v008/seam-moss-runtime-albedo-alpha.png")
    && v015RoughMasonry.conditionBlend.growthStrength === 0.52
    && v015RoughMasonry.conditionBlend.growthContactApron === 0.46
    && v015Masonry.conditionBlend.growthStrength === 0.58
    && v015Masonry.conditionBlend.growthContactApron === 0.52
    && v015Ashlar.maps.growthTopConditionAlbedo.endsWith(
      "v014/foundation-top-algae-authored-alpha-512.png")
    && v015Ashlar.conditionBlend.growthStrength === 0.62
    && v015Ashlar.conditionBlend.growthTopStrength === 0.86
    && v015Ashlar.conditionBlend.growthContactApron === 0.58);
const institutionalWallFaces =
  institutionalGuardScene.architecturePlan.wallFaceModulePlans;
const uplandWallFaces = uplandGuardScene.architecturePlan.wallFaceModulePlans;
const institutionalStreetFace = institutionalWallFaces.find((face) =>
  face.wallRunId === "route-control-guard-street-wall");
const uplandStreetFace = uplandWallFaces.find((face) =>
  face.wallRunId === "route-control-guard-street-wall");
check("WallFaceModuleCompiler emits deterministic physical W5H5 plans for every guardroom wall",
  institutionalGuardScene.architecturePlan.wallFaceModuleCompilerReceipt
    && institutionalGuardScene.architecturePlan.wallFaceModuleCompilerReceipt.compiler
      === "WallFaceModuleCompilerV1"
    && institutionalGuardScene.architecturePlan.wallFaceModuleCompilerReceipt.planCount === 4
    && institutionalGuardScene.architecturePlan.wallFaceModuleCompilerReceipt.pixelsPerFoot === 32
    && institutionalGuardScene.architecturePlan.wallFaceModuleCompilerReceipt
      .authoredExpressionProfile === "authored-pixel-bold"
    && institutionalGuardScene.architecturePlan.wallFaceModuleCompilerReceipt
      .linkedEnvelopeCounts.W5H10 >= 3
    && institutionalGuardScene.architecturePlan.wallFaceModuleCompilerReceipt
      .linkedEnvelopeCounts.W10H10 >= 2
    && institutionalWallFaces.length === 4
    && institutionalWallFaces.every((face) =>
      face.schema === "WallFaceModulePlanV1"
      && face.moduleGrid.cellFeet === 5
      && face.moduleGrid.pixelsPerFoot === 32
      && face.moduleGrid.albedoSampling === "nearest-no-mipmap"
      && face.authoredExpressionProfile === "authored-pixel-bold"
      && face.slots.length === face.moduleGrid.columns * face.moduleGrid.rows
      && face.slots.every((slot) =>
        slot.envelope === "W5H5" && slot.mechanicalEffect === "none")
      && face.linkedModules.every((module) =>
        ["W5H5", "W5H10", "W10H10"].includes(module.envelope)
        && module.mechanicalEffect === "none")
      && face.slots.filter((slot) => slot.linkedModuleRef).every((slot) =>
        face.linkedModules.some((module) => module.id === slot.linkedModuleRef))
      && face.normalOrmStatus
        === "parent-normal-orm-retained; "
          + "authored-alpha-derives-restrained-feature-normal-roughness"
      && face.mechanicalEffect === "none"
      && face.sourceMechanicsRef
        === institutionalGuardScene.compilation.plan.mechanicsFingerprint));
check("authored aperture modules bind to real opening dimensions rather than painting fake voids",
  institutionalStreetFace
    && institutionalStreetFace.apertures.length === 2
    && institutionalStreetFace.apertures.every((aperture) => {
      const real = institutionalGuardScene.architecturePlan.openings.find((opening) =>
        opening.id === aperture.id);
      return real
        && aperture.geometryTruthRef === real.id
        && Math.abs(aperture.widthFeet - real.width * 5) < 0.0001
        && Math.abs(aperture.heightFeet - real.height * 5) < 0.0001
        && institutionalStreetFace.linkedModules.some((module) =>
          module.role === "real-aperture-surround"
          && module.geometryTruthRef === real.id
          && module.envelope === "W10H10");
    }));
check("institutional closed elevations consume one authored 5ft relief module",
  institutionalWallFaces.filter((face) => face.cultureRelief).length === 3
    && !institutionalStreetFace.cultureRelief
    && institutionalWallFaces.filter((face) => face.cultureRelief).every((face) =>
      face.cultureRelief.source.endsWith(
        "runtime/architectural-relief-band-mask-320x96.png")
        && face.cultureRelief.physicalEnvelopeFeet.width === 5
        && face.cultureRelief.physicalEnvelopeFeet.height === 2
        && face.cultureRelief.placement === "repeat-on-full-W5-upper-band"
        && face.cultureRelief.maximumPerFace
          === Math.floor(face.physicalExtent.lengthFeet / 5)
        && face.cultureRelief.sampling === "nearest-no-mipmap"
        && face.cultureRelief.constructionTruthRef === face.wallRunId
        && face.cultureRelief.mechanicalEffect === "none")
    && uplandWallFaces.every((face) => !face.cultureRelief)
    && goldenRendererSource.includes("clayGuardWallReliefImage")
    && goldenRendererSource.includes("context.drawImage(image"));

console.log("\nWave 2 · reusable physical wall-dimension compiler");
const wallDimensionRuns = [
  {
    id: "proof-W5H5", role: "proof-primary-construction",
    start: { x: 0, z: 0 }, end: { x: 1, z: 0 }, baseY: 0, height: 1,
    openings: []
  },
  {
    id: "proof-W5H10", role: "proof-primary-construction",
    start: { x: 0, z: 2 }, end: { x: 1, z: 2 }, baseY: 0, height: 2,
    openings: []
  },
  {
    id: "proof-W10H10-aperture", role: "proof-primary-construction",
    start: { x: 0, z: 4 }, end: { x: 2, z: 4 }, baseY: 0, height: 2,
    openings: [{
      id: "proof-real-aperture", station: 1, width: 1,
      bottom: 0, height: 2, kind: "observation-aperture"
    }]
  },
  {
    id: "proof-W25H15-wide", role: "proof-defensive-construction",
    start: { x: 0, z: 6 }, end: { x: 5, z: 6 }, baseY: 0, height: 3,
    openings: []
  },
  {
    id: "proof-W17_5H12_5-remainder", role: "proof-remainder-construction",
    start: { x: 0, z: 8 }, end: { x: 3.5, z: 8 }, baseY: 0, height: 2.5,
    openings: []
  },
  {
    id: "proof-near-exact-epsilon", role: "proof-boundary-tolerance",
    start: { x: 0, z: 10 }, end: { x: 2.00001, z: 10 }, baseY: 0, height: 2.00001,
    openings: []
  }
];
context.__wallDimensionRuns = wallDimensionRuns;
const wallDimensionOptions = {
  presentationSeed: 42019,
  pixelsPerFoot: 32,
  authoredExpressionProfile: "authored-pixel-bold",
  sourcePlanRef: "wall-dimension-proof-plan",
  sourceMechanicsRef: "wall-dimension-proof-mechanics",
  authoredFeaturesByRunId: {
    "proof-W25H15-wide": [
      {
        id: "proof-declared-repair",
        kind: "repair-infill",
        stationFeet: 6.5,
        bottomFeet: 1.5,
        widthFeet: 4.5,
        heightFeet: 5,
        constructionTruthRef: "proof-construction-fact:dated-repair"
      },
      {
        id: "proof-declared-storey-band",
        kind: "storey-band",
        stationFeet: 12.5,
        bottomFeet: 9.7,
        widthFeet: 25,
        heightFeet: 0.8,
        constructionTruthRef: "proof-construction-fact:upper-floor-bearing"
      },
      {
        id: "proof-rejected-unowned-feature",
        kind: "repair-infill",
        stationFeet: 20,
        bottomFeet: 2,
        widthFeet: 2,
        heightFeet: 2
      }
    ]
  }
};
context.__wallDimensionOptions = wallDimensionOptions;
const wallDimensionCompilation = evaluate(
  "goldenVignetteWallFaceModuleCompile("
    + "__wallDimensionRuns, __wallDimensionOptions)");
const wallDimensionReplay = evaluate(
  "goldenVignetteWallFaceModuleCompile("
    + "__wallDimensionRuns, __wallDimensionOptions)");
const wallDimensionById = new Map(
  wallDimensionCompilation.plans.map((plan) => [plan.wallRunId, plan]));
check("generic compiler maps exact physical dimensions to governed 5ft solver grids",
  wallDimensionById.get("proof-W5H5").moduleGrid.columns === 1
    && wallDimensionById.get("proof-W5H5").moduleGrid.rows === 1
    && wallDimensionById.get("proof-W5H10").moduleGrid.columns === 1
    && wallDimensionById.get("proof-W5H10").moduleGrid.rows === 2
    && wallDimensionById.get("proof-W10H10-aperture").moduleGrid.columns === 2
    && wallDimensionById.get("proof-W10H10-aperture").moduleGrid.rows === 2
    && wallDimensionById.get("proof-W25H15-wide").moduleGrid.columns === 5
    && wallDimensionById.get("proof-W25H15-wide").moduleGrid.rows === 3);
check("changed dimensions produce distinct plans without stretching authored pixel density",
  new Set(wallDimensionCompilation.plans.map((plan) => plan.fingerprint)).size
    === wallDimensionCompilation.plans.length
    && wallDimensionCompilation.plans.every((plan) =>
      plan.moduleGrid.cellFeet === 5
        && plan.moduleGrid.pixelsPerFoot === 32
        && plan.moduleGrid.albedoSampling === "nearest-no-mipmap"
        && plan.slots.length === plan.moduleGrid.columns * plan.moduleGrid.rows));
check("partial faces expose explicit capped remainder sockets",
  wallDimensionById.get("proof-W17_5H12_5-remainder").remainder.widthFeet === 2.5
    && wallDimensionById.get("proof-W17_5H12_5-remainder").remainder.heightFeet === 2.5
    && wallDimensionById.get("proof-W17_5H12_5-remainder").remainder.rightSocket
      === "capped-remainder"
    && wallDimensionById.get("proof-W17_5H12_5-remainder").remainder.topSocket
      === "capped-remainder");
check("near-boundary floating-point transforms do not invent hairline remainder cells",
  wallDimensionById.get("proof-near-exact-epsilon").moduleGrid.columns === 2
    && wallDimensionById.get("proof-near-exact-epsilon").moduleGrid.rows === 2
    && wallDimensionById.get("proof-near-exact-epsilon").remainder.widthFeet === 0
    && wallDimensionById.get("proof-near-exact-epsilon").remainder.heightFeet === 0
    && wallDimensionById.get("proof-near-exact-epsilon").remainder.rightSocket
      === "exact-module-boundary"
    && wallDimensionById.get("proof-near-exact-epsilon").remainder.topSocket
      === "exact-module-boundary");
check("real aperture spanning two columns and rows links one W10H10 authored module",
  wallDimensionById.get("proof-W10H10-aperture").linkedModules.some((module) =>
    module.envelope === "W10H10"
      && module.role === "real-aperture-surround"
      && module.geometryTruthRef === "proof-real-aperture"));
check("isolated wall fixtures expose two flush four-polygon-cap transition sockets",
  wallDimensionCompilation.receipt.topologySocketCounts["flush-end-cap"] === 12
    && wallDimensionCompilation.plans.every((plan) =>
      plan.topologyEdges.length === 2
        && plan.topologyEdges.every((edge) =>
          edge.socketKind === "flush-end-cap"
            && edge.surfaceTreatment === "four-polygon-cap-transition"
            && edge.mechanicalEffect === "none")));
check("closed Guard wall topology emits matched miter transitions instead of open corners",
  institutionalWallFaces.every((plan) =>
    plan.topologyEdges.length === 2
      && plan.topologyEdges.every((edge) =>
        edge.socketKind === "matched-miter-corner"
          && edge.surfaceTreatment === "culture-ready-miter-transition"
          && edge.connectedWallRunIds.length === 1)));
check("repair and storey modules require explicit construction facts",
  wallDimensionCompilation.receipt.authoredFeatureCount === 2
    && wallDimensionCompilation.receipt.authoredFeatureKinds.join("|")
      === "repair-infill|storey-band"
    && wallDimensionById.get("proof-W25H15-wide").authoredFeatures.length === 2
    && wallDimensionById.get("proof-W25H15-wide").authoredFeatures.every((feature) =>
      feature.constructionTruthRef
        && feature.mechanicalEffect === "none")
    && !wallDimensionById.get("proof-W25H15-wide").authoredFeatures.some((feature) =>
      feature.id === "proof-rejected-unowned-feature"));
check("dimension compilation is deterministic and passes mechanics authority through unchanged",
  JSON.stringify(wallDimensionCompilation) === JSON.stringify(wallDimensionReplay)
    && wallDimensionCompilation.plans.every((plan) =>
      plan.mechanicalEffect === "none"
        && plan.sourceMechanicsRef === "wall-dimension-proof-mechanics")
    && wallDimensionCompilation.receipt.mechanicalEffect === "none");

check("culture changes authored surface expression while preserving the same wall mechanics",
  institutionalStreetFace && uplandStreetFace
    && institutionalStreetFace.cultureFeature.medium
      === "dressed-stone-heraldic-inset"
    && uplandStreetFace.cultureFeature.medium === "ochre-limewash-mark"
    && institutionalStreetFace.sourceMechanicsRef === uplandStreetFace.sourceMechanicsRef
    && institutionalStreetFace.physicalExtent.lengthFeet
      === uplandStreetFace.physicalExtent.lengthFeet
    && institutionalStreetFace.apertures.map((opening) => opening.geometryTruthRef).join("|")
      === uplandStreetFace.apertures.map((opening) => opening.geometryTruthRef).join("|"));
const institutionalStringCourse =
  institutionalGuardScene.architecturePlan.orthogonalRunClosures.find((closure) =>
    closure.id === "route-control-culture-institutional-string-course");
const institutionalQuoinCourses =
  institutionalGuardScene.architecturePlan.compiledMembers.filter((member) =>
    member.id.startsWith("route-control-culture-institutional-quoin-"));
check("institutional culture owns a closed mid-wall attachment datum beyond roof color",
  institutionalStringCourse
    && institutionalStringCourse.strategy === "wfc-compatible-mitered-open-band"
    && institutionalStringCourse.includedSides.length === 3
    && institutionalStringCourse.intentionalOpenSides.join("|") === "east"
    && institutionalStringCourse.terminalCaps.length === 2
    && institutionalStringCourse.terminalCaps.every((cap) =>
      cap.polygonVertices === 4)
    && institutionalStringCourse.memberIds.length === 3
    && institutionalStringCourse.memberIds.every((memberId) =>
      institutionalGuardScene.architecturePlan.cultureMorphology.memberIds
        .includes(memberId))
    && institutionalQuoinCourses.length === 24
    && institutionalQuoinCourses.every((member) =>
      member.presentationOnly
        && member.mechanicalEffect === "none"
        && institutionalGuardScene.architecturePlan.cultureMorphology.memberIds
          .includes(member.id)));
const institutionalSignifiers = institutionalGuardScene.architecturePlan.worldSignifierLayer;
const uplandSignifiers = uplandGuardScene.architecturePlan.worldSignifierLayer;
const institutionalSignifierMembers = institutionalGuardScene.architecturePlan.compiledMembers
  .filter((member) => institutionalSignifiers.memberIds.includes(member.id));
check("culture supplies signifier sockets while fixture world truth supplies noncanonical content",
  institutionalSignifiers
    && institutionalSignifiers.truthStatus === "NON_CANONICAL_FIXTURE_PLACEHOLDER"
    && institutionalSignifiers.activeMedium === "hanging-banner"
    && institutionalSignifiers.sockets.some((socket) => socket.medium === "surface-daub")
    && institutionalSignifierMembers.length === institutionalSignifiers.memberIds.length
    && institutionalSignifierMembers.every((member) =>
      member.presentationOnly
        && member.mechanicalEffect === "none"
        && member.worldTruthRef === "guard-post-proof:faction-placeholder-01"
        && member.placeholderState === "NON_CANONICAL_FIXTURE_PLACEHOLDER"),
  institutionalSignifiers);
check("culture profiles demonstrate different attachment traditions without changing mechanics",
  institutionalGuardScene.architecturePlan.cultureProfileId === "institutional-frontier"
    && uplandGuardScene.architecturePlan.cultureProfileId === "upland-vernacular"
    && institutionalSignifiers.activeMedium === "hanging-banner"
    && uplandSignifiers.activeMedium === "pole-flag"
    && institutionalSignifiers.memberIds.join(",") !== uplandSignifiers.memberIds.join(",")
    && institutionalGuardScene.compilation.plan.mechanicsFingerprint
      === uplandGuardScene.compilation.plan.mechanicsFingerprint
    && institutionalGuardScene.compilation.plan.planFingerprint
      === uplandGuardScene.compilation.plan.planFingerprint);
check("surface daub is a selectable world-truth medium, not a culture hardcode",
  daubGuardScene.architecturePlan.worldSignifierLayer.activeMedium === "surface-daub"
    && daubGuardScene.architecturePlan.worldSignifierLayer.worldTruthRef
      === "guard-post-proof:occupation-daub-01"
    && daubGuardScene.architecturePlan.worldSignifierLayer.memberIds.every((memberId) =>
      memberId.startsWith("route-control-signifier-surface-daub-"))
    && daubGuardScene.compilation.plan.mechanicsFingerprint
      === institutionalGuardScene.compilation.plan.mechanicsFingerprint
    && daubGuardScene.compilation.plan.planFingerprint
      === institutionalGuardScene.compilation.plan.planFingerprint);
check("signifier materials remain explicit noncanonical placeholders with reusable authored cloth",
  guardVisualProfile.worldSignifierDemonstration
    && guardVisualProfile.worldSignifierDemonstration.truthStatus
      === "NON_CANONICAL_FIXTURE_PLACEHOLDER"
    && ["signifier-cloth-primary", "signifier-cloth-secondary", "signifier-surface-mark"]
      .every((role) => {
        const materialId = guardVisualProfile.materialBindings.architecture[role];
        const definition = guardVisualProfile.materialDefinitions[materialId];
        return definition
          && definition.contextVerdict === "NON_CANONICAL_FIXTURE_PLACEHOLDER";
      })
    && guardVisualProfile.materialDefinitions["signifier-cloth-primary"].sourceKind
      === "recolorable-authored-mask-fixture-placeholder"
    && guardVisualProfile.materialDefinitions["signifier-cloth-primary"].maps.albedo
      .endsWith("runtime/signifier-banner-long-mask-160x320.png")
    && guardVisualProfile.materialDefinitions["signifier-cloth-primary"].projection
      === "receiver-local-decal"
    && ["signifier-cloth-secondary", "signifier-surface-mark"].every((role) =>
      guardVisualProfile.materialDefinitions[role].sourceKind
        === "scalar-fixture-placeholder"));
for (const plan of guard.plan.tacticalPlans) {
  context.__compilation = guard;
  context.__planId = plan.id;
  const flow = evaluate("goldenVignetteSimulateFlow(__compilation, __planId)");
  check(`Guard ${plan.id} arrival → play → exit → return`,
    flow.routePlayable && flow.arrivalExitReturnIdentity);
}

console.log("\nWave 2 · AF-GV-1 / 2 / 3 / 8");
const surfaceRoles = new Set(guard.surfaceDemands.map((demand) => demand.role));
check("AF-GV-1 derives demands from stable real faces/surfaces",
  ["WALKABLE_TOP", "NATURAL_SLOPE", "CUT_FACE", "RETAINING_FACE", "WALL_FIELD",
    "CROWN_COPING", "ROOF_DECK", "MOUNT_FACE"].every((role) => surfaceRoles.has(role))
    && guard.surfaceDemands.every((demand) =>
      demand.planRef === guard.plan.planFingerprint
        && demand.surfaceRef && demand.faceRef && demand.localFrame));
check("AF-GV-2 groups related families without owning history",
  guard.materialFamilies.families.length >= 5
    && guard.materialFamilies.families.every((family) =>
      family.materialMakerVersion === "1.3" && family.textureStateOwnsHistory === false));
check("AF-GV-3 binds every demand to a stable local frame and truthful proxy",
  guard.surfaceProjection.bindings.length === guard.surfaceDemands.length
    && guard.surfaceProjection.bindings.every((binding) =>
      binding.localFrame && binding.proxy && binding.proxy.omission === false));
check("fallback preserves every required semantic and surface role",
  guard.receipt.assetDecisions.length > 0
    && guard.receipt.assetDecisions.every((decision) =>
      decision.decision === "TRUTHFUL_PROXY"
        && decision.omission === false && decision.preserves.length > 0));
check("AF-GV-8 declares all governed views and four identity-stable bearings",
  guard.proofPackage.requiredViews.length === 7
    && guard.proofPackage.bearings.length === 4
    && guard.proofPackage.bearings.every((bearing) => bearing.planIdentityPreserved));

console.log("\nWave 2 · changed seeds and projection identity");
check("changed seeds are structurally distinct from the hero and each other",
  new Set([
    guard.plan.terrainPlan.field.fingerprint,
    guardChangedA.plan.terrainPlan.field.fingerprint,
    guardChangedB.plan.terrainPlan.field.fingerprint
  ]).size === 3);
check("Guard Post family mutation changes architectural proportion, not decorative scatter",
  [
    institutionalGuardScene.architecturePlan.familyLayout,
    partyProofGuardChangedA.architecturePlan.familyLayout,
    partyProofGuardChangedB.architecturePlan.familyLayout
  ].map((layout) => layout.variantIndex).join(",") === "0,1,2"
    && new Set([
      institutionalGuardScene.architecturePlan.familyLayout.guardroomSentence,
      partyProofGuardChangedA.architecturePlan.familyLayout.guardroomSentence,
      partyProofGuardChangedB.architecturePlan.familyLayout.guardroomSentence
    ]).size === 3
    && new Set([
      institutionalGuardScene.architecturePlan.familyLayout.lookoutSentence,
      partyProofGuardChangedA.architecturePlan.familyLayout.lookoutSentence,
      partyProofGuardChangedB.architecturePlan.familyLayout.lookoutSentence
    ]).size === 3
    && new Set([
      institutionalGuardScene.architecturePlan.familyLayout.guardroomFootprint,
      partyProofGuardChangedA.architecturePlan.familyLayout.guardroomFootprint,
      partyProofGuardChangedB.architecturePlan.familyLayout.guardroomFootprint
    ].map((footprint) => JSON.stringify(footprint))).size === 3
    && [2.68, 2.46, 3.08].every((height, index) => [
      institutionalGuardScene.architecturePlan.familyLayout,
      partyProofGuardChangedA.architecturePlan.familyLayout,
      partyProofGuardChangedB.architecturePlan.familyLayout
    ][index].wallHeightWorldUnits === height)
    && [36, 30, 38].every((pitch, index) => [
      institutionalGuardScene.architecturePlan.familyLayout,
      partyProofGuardChangedA.architecturePlan.familyLayout,
      partyProofGuardChangedB.architecturePlan.familyLayout
    ][index].roofPitchDeg === pitch));
for (const [label, compilation] of [
  ["changed seed A", guardChangedA],
  ["changed seed B", guardChangedB]
]) {
  check(`${label} remains legal`, validate(compilation).ok, validate(compilation));
  check(`${label} preserves eleven zones, three plans, and 20+ feet relief`,
    compilation.plan.zones.length === 11
      && compilation.plan.tacticalPlans.length === 3
      && compilation.plan.terrainPlan.field.metrics.maxH
        - compilation.plan.terrainPlan.field.metrics.minH >= 8);
  const changedGuardroom = compilation.plan.constructionPlan.find((structure) =>
    structure.role === "guardroom");
  const changedField = compilation.plan.terrainPlan.field;
  const changedSupportHeights = [];
  for (let y = changedGuardroom.footprint.y;
    y < changedGuardroom.footprint.y + changedGuardroom.footprint.d; y++) {
    for (let x = changedGuardroom.footprint.x;
      x < changedGuardroom.footprint.x + changedGuardroom.footprint.w; x++) {
      changedSupportHeights.push(changedField.cells[y * changedField.extent.x + x].h);
    }
  }
  check(`${label} family-sized guardroom retains one level bearing footprint`,
    new Set(changedSupportHeights).size === 1
      && changedGuardroom.baseH === changedSupportHeights[0],
    { baseH: changedGuardroom.baseH, support: changedSupportHeights });
}
context.__compilation = guard;
const bearingRecords = [0, 1, 2, 3].map((bearing) => {
  context.__bearing = bearing;
  return {
    tray: evaluate("goldenVignetteProjectSceneTray(__compilation, {bearing: __bearing})"),
    battle: evaluate("goldenVignetteProjectBattleMap(__compilation, {bearing: __bearing})")
  };
});
check("all four quarter-turn bearings preserve the committed plan",
  bearingRecords.every(({ tray, battle }) =>
    tray.planRef === guard.plan.planFingerprint
      && battle.planRef === guard.plan.planFingerprint
      && tray.mechanicsFingerprint === battle.mechanicsFingerprint));

console.log("\nWave 2 · exact Wave-0 negative controls");
const synthSource = read("src/engine/vignette-synthesizer.js");
const compileSource = evaluate("String(goldenVignetteCompile) + String(gvsProgramGrammar)");
check("NC-GOLDEN-BRANCH: runtime compiler has no Golden/fixture/site/hero-seed branch",
  !/GP-SHAPE|VENUE-TAVERN|Golden Site|fixtureId|siteId|hero seed/i.test(compileSource));

context.__request = guard.request;
context.__candidate = evaluate("gvsGuardCandidate(__request, 19, 1, false)");
context.__grammar = evaluate("gvsProgramGrammar(__request)");
context.__reservations = evaluate("goldenVignetteIdentityReservations(__request)");
context.__candidate.terrain.spec.pieces.push({
  id: "bad-random-tiles",
  ops: [{ type: "scatter", mode: "max", params: { count: 9 } }]
});
const randomTileValidation = evaluate(
  "gvsCandidateValidation(__request, __grammar, __candidate, __reservations)");
check("NC-RANDOM-TILE-TERRAIN: independent scatter proposal is rejected",
  randomTileValidation.rejectionIds.includes("INDEPENDENT_TILE_TERRAIN"));

const claySource = read("src/ui/theater-clay-room.js");
check("NC-DIAGONAL-ZIPPER: renderer uses one centre/edge/corner eight-facet cap, not a micro-grid",
  claySource.includes('capTopology: "fft-centre-edge-corner-8-smooth-cap"')
    && claySource.includes("for(let ri = 0; ri < capRing.length; ri++)")
    && !claySource.includes("new THREE.PlaneGeometry(1, 1, 4, 4)"));

const heightCapped = clone(guard);
heightCapped.plan.terrainPlan.field.metrics.maxH = 2;
check("NC-HEIGHT-CAP: flattened relief is rejected", hasError(heightCapped, "HEIGHT_FLATTENED"));

check("NC-CAMERA-MUTATES-PLAN: bearing changes projection only",
  bearingRecords.every(({ tray }) => tray.planRef === guard.plan.planFingerprint));
check("NC-COMBAT-REGENERATES: SceneTray and BattleMap share mechanics",
  bearingRecords.every(({ tray, battle }) =>
    tray.mechanicsFingerprint === battle.mechanicsFingerprint
      && !battle.geometryRegenerated));

const missingRole = clone(guard);
missingRole.receipt.assetDecisions[0].omission = true;
check("NC-MISSING-REQUIRED-ROLE: omitted proxy role is rejected",
  hasError(missingRole, "MISSING_REQUIRED_ROLE"));

const wholeSite = clone(guard);
wholeSite.receipt.assetDecisions[0].decision = "WHOLE_SITE_DONOR";
wholeSite.receipt.assetDecisions[0].resolvedId = "whole-site-donor:guard-post";
check("NC-WHOLE-SITE-DONOR: connective site donor is rejected",
  hasError(wholeSite, "WHOLE_SITE_DONOR"));

const randomCondition = clone(guard);
randomCondition.plan.causalState[0].causeRefs = [];
check("NC-RANDOM-CONDITION: uncaused state expression is rejected",
  hasError(randomCondition, "RANDOM_CONDITION"));

const falseRoute = clone(guard);
falseRoute.plan.tacticalPlans[0].sourceFactRefs = [];
check("NC-FALSE-CONTEXT-ROUTE: source-free route is rejected",
  hasError(falseRoute, "FALSE_CONTEXT_ROUTE"));

const replacedHost = clone(guard);
replacedHost.plan.grammar.id = "public-service-venue";
check("NC-TRANSFORM-REPLACES-HOST: grammar replacing its host is rejected",
  hasError(replacedHost, "TRANSFORM_REPLACED_HOST"));

const sprawling = clone(guard);
sprawling.plan.materializationWindow.cellCount = 999;
check("NC-SPRAWLING-WINDOW: oversized active window is rejected",
  hasError(sprawling, "SPRAWLING_MATERIALIZATION_WINDOW"));

console.log("\nWave 2 · PC-versus-enemy battle simulation");
for (const path of [
  "src/engine/core.js",
  "data/bestiary.js",
  "src/engine/advancement.js",
  "src/engine/combat.js"
]) vm.runInContext(read(path), context, { filename: path });
context.__compilation = guard;
const battleContract = evaluate("goldenVignetteBattleContract(__compilation)");
context.__battleContract = battleContract;
const battle = evaluate(`combatStart({
  pc: {init: 3, maxHp: 28, hp: 28},
  foes: [
    {name: "Bandit", role: "guard", victimClass: "hostile"},
    {name: "Wolf", role: "skirmisher", victimClass: "hostile"}
  ],
  pcRoll: 16,
  foeRoll: 7,
  segmentId: __battleContract.segmentId,
  cellDims: __battleContract.cellDims,
  objectiveRef: __battleContract.objectiveRef,
  scene: __battleContract.scene
})`);
context.__battle = battle;
const attack = evaluate(`resolveAttack({
  attacker: __battle.pc,
  target: __battle.foes[0],
  targetAC: __battle.foes[0].ac,
  atkBonus: 6,
  d20: 15,
  dmg: [{n: 1, die: 8, bonus: 4, type: "slashing"}],
  range: "melee"
})`);
if (attack.hit) {
  context.__attack = attack;
  evaluate("applyDamage(__battle.foes[0], __attack.damage, 'slashing')");
}
check("combat starts on the committed 20×22-cell footprint",
  battle.grid.bandCount === 4 && battle.grid.laneCount === 3
    && battleContract.cellDims.w === 20 && battleContract.cellDims.d === 22);
check("battle carries the committed objective and deterministic segment identity",
  battle.objectiveRef === battleContract.objectiveRef
    && battleContract.planRef === guard.plan.planFingerprint
    && battleContract.geometryRegenerated === false);
check("PC and two resolved enemies complete a deterministic first exchange",
  battle.active && battle.round === 1 && battle.first === "pc"
    && battle.foes.length === 2 && attack.hit && attack.damage > 0);
check("battle projection remains the same committed mechanics",
  battleContract.mechanicsFingerprint === guard.plan.mechanicsFingerprint);

const summary = {
  gate: "W2",
  result: fail === 0 ? "PASS" : "FAIL",
  passed: pass,
  failed: fail,
  failures,
  fingerprints: {
    tavernPlan: tavern.plan.planFingerprint,
    guardPlan: guard.plan.planFingerprint,
    guardReceipt: guard.receipt.receiptFingerprint,
    guardChangedA: guardChangedA.plan.planFingerprint,
    guardChangedB: guardChangedB.plan.planFingerprint,
    proofPackage: guard.proofPackage.fingerprint,
    battleProjection: battleContract.projectionFingerprint
  },
  guard: {
    extentCells: guard.plan.materializationWindow.extentCells,
    reliefH: field.metrics.maxH - field.metrics.minH,
    reliefFeet: (field.metrics.maxH - field.metrics.minH) * 2.5,
    faces: field.metrics.faces,
    quietShare: guard.plan.terrainPlan.quietSurfaceReport.quietShare,
    candidateRecords: guard.receipt.candidates.length,
    repairs: guard.receipt.repairs.length,
    surfaceDemands: guard.surfaceDemands.length,
    materialFamilies: guard.materialFamilies.families.length,
    surfaceBindings: guard.surfaceProjection.bindings.length
  },
  battle: {
    grid: battle.grid,
    foes: battle.foes.map((foe) => ({ name: foe.name, hp: foe.hp, lane: foe.lane })),
    first: battle.first,
    firstAttack: attack
  }
};
console.log("\n" + JSON.stringify(summary, null, 2));
if (fail) process.exitCode = 1;
