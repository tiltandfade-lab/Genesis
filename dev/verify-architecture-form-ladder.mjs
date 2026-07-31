/* CL-F09 architecture form ladder executable gate.

   This proves engine ownership and form diversity. It does not award a visual pass; the labeled
   capture sheet remains the admission gate.

   Run: node dev/verify-architecture-form-ladder.mjs
*/
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");
const context = vm.createContext({
  console, Math, JSON, Array, Object, Number, String, Boolean, Date, RegExp, Set, Map,
  Infinity, NaN, Uint8Array, Uint32Array, Int32Array, Float32Array, Float64Array
});
[
  "src/engine/terrain-field.js",
  "src/engine/architecture-forms.js"
].forEach((path) => vm.runInContext(read(path), context, { filename: path }));
const evaluate = (source) => vm.runInContext(source, context);
const clone = (value) => JSON.parse(JSON.stringify(value));

let pass = 0;
let fail = 0;
function check(name, condition, detail = null) {
  if (condition) {
    pass++;
    console.log("  ✓", name);
  } else {
    fail++;
    console.log("  ✗", name, detail == null ? "" : "— " + JSON.stringify(detail));
  }
}

const ids = clone(evaluate("ARCHITECTURE_FORM_SCENE_IDS"));
const plans = ids.map((id) => clone(evaluate(`architectureFormPlan(${JSON.stringify(id)}, 19)`)));
const replays = ids.map((id) => clone(evaluate(`architectureFormPlan(${JSON.stringify(id)}, 19)`)));
const gate = clone(evaluate("architectureFormGateReport(19)"));
const suite1Ids = clone(evaluate(
  "ARCHITECTURE_FORM_PROOF_FIXTURE.scenes.map(function(scene){ return scene.id; })"));
const suite2Ids = clone(evaluate(
  "ARCHITECTURE_FORM_SUITE2_FIXTURE.scenes.map(function(scene){ return scene.id; })"));
const monumentalIds = clone(evaluate(
  "ARCHITECTURE_FORM_MONUMENTAL_FIXTURE.scenes.map(function(scene){ return scene.id; })"));
const megainteriorIds = clone(evaluate(
  "ARCHITECTURE_FORM_MEGAINTERIOR_FIXTURE.scenes.map(function(scene){ return scene.id; })"));
const precinctIds = clone(evaluate(
  "ARCHITECTURE_FORM_PRECINCT_FIXTURE.scenes.map(function(scene){ return scene.id; })"));

console.log("\nCL-F09 · architecture form ladder");
check("two eight-form ladders, four monumental forms, a megainterior, and a real-roll precinct are registered",
  ids.length === 22 && suite1Ids.length === 8 && suite2Ids.length === 8
    && monumentalIds.length === 4 && megainteriorIds.length === 1
    && precinctIds.length === 1, ids);
check("all sixteen compact forms remain eligible miniature/overview vocabulary",
  evaluate(`Object.keys(ARCHITECTURE_FORM_PROJECTION_ROLES)
    .filter((id) => Number(id.slice(3)) <= 16)
    .every((id) => ARCHITECTURE_FORM_PROJECTION_ROLES[id]
      .includes("miniature-overview-capable"))`));
check("rejected machinery remains only as non-production negative controls",
  evaluate(`ARCHITECTURE_REJECTED_MACHINERY_REGISTRY.length >= 6
    && ARCHITECTURE_REJECTED_MACHINERY_REGISTRY.every((row) =>
      row.status === "diagnostic-negative-control"
        && row.productionSelectable === false
        && row.failure && row.retainedAs)`));
check("every plan passes the engine-owned assembly validator",
  plans.every((plan) => plan.validation.ok),
  plans.filter((plan) => !plan.validation.ok).map((plan) => plan.validation.failures));
check("same scene and seed compile byte-identically",
  JSON.stringify(plans) === JSON.stringify(replays));
check("the library exposes at least twelve distinct construction profiles",
  new Set(plans.map((plan) => plan.constructionProfile)).size >= 12);
check("every form publishes program topology and an access graph",
  plans.every((plan) => plan.programTopology.length && plan.accessGraph.length));
check("renderer geometry ownership remains false in all receipts",
  plans.every((plan) => plan.validation.rendererOwnsGeometry === false));

console.log("\nRoad threshold and vertical range");
const checkpoint = plans.find((plan) => plan.formId === "AF-01");
const tower = plans.find((plan) => plan.formId === "AF-08");
check("diagonal checkpoint barrier is road-normal",
  checkpoint.barrierAudit.orthogonal && Math.abs(checkpoint.barrierAudit.dot) <= 0.001,
  checkpoint.barrierAudit);
check("checkpoint preserves a clear tread at least as wide as its road",
  checkpoint.barrierAudit.passageClear);
check("the proof ladder has no two-storey height cap",
  tower.validation.maxTopY >= 8 && gate.tallForms.includes("AF-08"),
  { maxTopY: tower.validation.maxTopY, tallForms: gate.tallForms });
check("ruin and operating state remain independent axes",
  tower.physicalState === "ruined" && tower.operatingState === "reoccupied");

console.log("\nOpenings, support, and traversal");
check("true openings are engine-compiled across five or more forms",
  plans.filter((plan) => plan.openings.length > 0).length >= 5);
check("every compiled member names at least one support",
  plans.every((plan) => plan.compiledMembers.every((member) => member.supportedBy.length > 0)));
check("every form that promises stair access compiles physical stairs",
  plans.filter((plan) => plan.accessGraph.some((edge) => edge.kind === "stair"))
    .every((plan) => plan.stairs.length > 0));
check("the suite includes open frame, enclosed, courtyard, pass-through, and ruined postures",
  ["AF-02", "AF-03", "AF-05", "AF-07", "AF-08"]
    .every((formId) => plans.some((plan) => plan.formId === formId)));
check("every pitched roof declares its enclosure posture and exact closure count",
  plans.every((plan) => plan.roofs.every((roof) =>
    ["open-frame", "partial", "enclosed"].includes(roof.enclosure)
      && plan.roofJunctions.filter((junction) => junction.roofId === roof.id).length
        === roof.closureExpected)));
check("every enclosed pitched roof has engine-owned wall partials",
  plans.every((plan) => plan.roofs.filter((roof) => roof.enclosure === "enclosed")
    .every((roof) => plan.roofJunctions.filter((junction) => junction.roofId === roof.id).length
      >= (roof.family === "gable" ? 2 : 4))));
check("every hip roof closes its fascia loop and exposes cultural junction sockets",
  plans.every((plan) => plan.roofs.filter((roof) => roof.family === "hip")
    .every((roof) => roof.eaveCornerClosure
      && roof.eaveCornerClosure.strategy === "wfc-compatible-mitered-run-loop"
      && roof.eaveCornerClosure.memberIds.length === 4
      && roof.eaveCornerClosure.junctionSockets.length === 4
      && roof.eaveCornerClosure.terminalCaps.length === 0
      && roof.eaveCornerClosure.memberIds.every((memberId) =>
        plan.compiledMembers.some((member) => member.id === memberId))
      && roof.eaveCornerClosure.expressionSockets.length === 4
      && roof.eaveCornerClosure.topologyInvariant
        === "weather-envelope-remains-closed-under-cultural-expression"
      && roof.innerEaveFlashingClosure
      && roof.innerEaveFlashingClosure.strategy
        === "manifold-ring-with-four-inner-miter-aprons"
      && roof.innerEaveFlashingClosure.memberIds.length === 5
      && roof.innerEaveFlashingClosure.memberIds.every((memberId) =>
        plan.compiledMembers.some((member) => member.id === memberId)))));
check("all registered orthogonal run closures own their missing outer-corner solids",
  plans.every((plan) => plan.orthogonalRunClosures.every((closure) =>
    closure.memberIds.length > 0
      && closure.memberIds.every((memberId) =>
        plan.compiledMembers.some((member) => member.id === memberId))
      && (!closure.intentionalOpenSides.length
        || (closure.strategy === "wfc-compatible-mitered-open-band"
          && closure.memberIds.length === 3
          && closure.junctionSockets.length === 2
          && closure.terminalCaps.length === 2
          && closure.terminalCaps.every((cap) => cap.polygonVertices === 4
            && closure.includedSides.includes(cap.side))
          && closure.intentionalOpenSides.every((side) =>
            !closure.includedSides.includes(side))))
      && closure.topologyInvariant === "closure-survives-cultural-junction-expression")));
check("the ladder explicitly distinguishes interior, exterior precinct, and justified hybrid maps",
  new Set(plans.map((plan) => plan.battleSpaceMode)).size === 3,
  plans.map((plan) => [plan.formId, plan.battleSpaceMode]));
const strictClearancePlans = plans.filter((plan) => plan.assemblyClearancePolicy === "strict");
check("every strict modular assembly has an empty swept stair/headroom volume",
  strictClearancePlans.length >= 2
    && strictClearancePlans.every((plan) => plan.validation.stairClearanceAudit.ok),
  strictClearancePlans.map((plan) =>
    [plan.formId, plan.validation.stairClearanceAudit.conflicts]));
check("legacy forms retain a visible clearance census instead of being silently grandfathered",
  plans.filter((plan) => plan.assemblyClearancePolicy === "audit-only")
    .some((plan) => !plan.validation.stairClearanceAudit.ok));

console.log("\nSecond-suite operating programs");
const frontage = plans.find((plan) => plan.formId === "AF-09");
const custody = plans.find((plan) => plan.formId === "AF-10");
const shaft = plans.find((plan) => plan.formId === "AF-11");
const commune = plans.find((plan) => plan.formId === "AF-12");
const bridgehouse = plans.find((plan) => plan.formId === "AF-13");
const inn = plans.find((plan) => plan.formId === "AF-14");
const stairStreet = plans.find((plan) => plan.formId === "AF-15");
const hall = plans.find((plan) => plan.formId === "AF-16");
check("party-wall frontage retains three public and three service thresholds",
  frontage.openings.filter((opening) => opening.kind === "door").length === 3
    && frontage.openings.filter((opening) => opening.kind === "service-door").length === 3);
check("custody block compiles four controlled cell apertures",
  custody.openings.filter((opening) => opening.kind === "barred-cell-door").length === 4);
check("shaft-head leaves a hazard center under a supported hoist frame",
  shaft.compiledMembers.some((member) =>
    member.id === "shaft-dark-depth" && member.access === "hazard")
    && shaft.compiledMembers.some((member) => member.id === "shaft-hoist-bearing")
    && shaft.assetSockets.some((socket) => socket.allowedSlugs.includes("hand-windlass")));
check("terraced commune uses three datums and two independent ascent families",
  new Set(commune.levels.map((level) => level.topY)).size === 3
    && commune.stairs.length === 3);
check("bridgehouse preserves water, crossing, work deck, and wheel mechanism",
  bridgehouse.compiledMembers.some((member) => member.role === "site-water")
    && bridgehouse.accessGraph.some((edge) => edge.id === "bridge-public-crossing")
    && bridgehouse.compiledMembers.filter((member) =>
      member.ownerId === "bridgehouse-water-wheel").length >= 16);
check("inn/manor keeps four hip facets in one closed roof shell",
  inn.roofs.some((roof) => roof.family === "hip"
    && roof.facetSemanticIds.length === 4
    && roof.shellMemberId)
    && inn.compiledMembers.filter((member) =>
      member.shape === "polyhedron" && member.role === "roof-field").length === 1);
check("hillside street exceeds the former height ceiling and retains two vertical routes",
  stairStreet.validation.maxTopY >= 9 && stairStreet.stairs.length === 2);
check("great hall remains one tall volume with repeated structural trusses and a gallery route",
  hall.primarySpatialSentence.includes("single-volume")
    && hall.compiledMembers.filter((member) => member.id.includes("hall-truss-")).length >= 20
    && hall.accessGraph.some((edge) => edge.to === "end-gallery"));
check("great-hall presentation cutaway exposes structure without declaring physical ruin",
  hall.physicalState === "intact"
    && hall.roofs.some((roof) => roof.cutawaySide === "east")
    && hall.cutawayGroups.some((group) =>
      group.id === "hall-camera-side-section" && group.mode === "presentation-cutaway"));

console.log("\nMeshy inventory and promotion boundary");
const census = clone(evaluate("ARCHITECTURE_ASSET_PROMOTION_CENSUS"));
check("runtime citizens and generated non-citizens are counted separately",
  census.runtimeCitizens.length === 18
    && census.generatedAdjudicatedNotCitizens.length === 13
    && census.runtimeCitizens.length + census.generatedAdjudicatedNotCitizens.length === 31);
check("processed connective and organic candidates are retained",
  census.processedConnectiveNotCitizens.length === 12
    && census.processedOrganicNotCitizens.length === 2
    && census.organicSourceGlbCount === 14);
check("the 300-row slate is not mistaken for 300 generated models",
  census.productionManifestRows === 300
    && census.productionManifestAcceptedRows === 18
    && census.productionManifestPlannedOnlyRows === 268);
const promotionIds = plans.flatMap((plan) =>
  plan.assetSockets.flatMap((socket) => socket.promotionCandidates.map((row) => row.jobId)));
check("the failed barrier remains explicit while three useful candidates became citizens",
  promotionIds.includes("M024-A")
    && ["M025-A", "M047-A", "M075-A"].every((id) => census.runtimeCitizens.includes(id)),
  { promotionIds, runtimeCitizens: census.runtimeCitizens });
check("every asset socket has a citizen, promotion request, or planned candidate plus fallback",
  plans.every((plan) => plan.assetSockets.every((socket) =>
    (socket.allowedSlugs.length || socket.promotionCandidates.length
      || socket.plannedCandidates.length) && socket.fallback)));
check("the engine gate passes but correctly withholds visual approval",
  gate.ok && gate.visualStatus === "REQUIRES LABELED CAPTURE REVIEW", gate);

console.log("\nBounded reviewed variants");
const boundedIds = suite1Ids.concat(suite2Ids);
const variants = boundedIds.map((id) =>
  clone(evaluate(`architectureFormVariantPlan(${JSON.stringify(id)}, 730)`)));
const variantReplays = suite1Ids.concat(suite2Ids).map((id) =>
  clone(evaluate(`architectureFormVariantPlan(${JSON.stringify(id)}, 730)`)));
const variantSiblings = suite1Ids.concat(suite2Ids).map((id) =>
  clone(evaluate(`architectureFormVariantPlan(${JSON.stringify(id)}, 731)`)));
const stressFailures = clone(evaluate(`(function(){
  var failures = [];
  for(var seed = 0; seed < 256; seed++){
    ARCHITECTURE_FORM_PROOF_FIXTURE.scenes
      .concat(ARCHITECTURE_FORM_SUITE2_FIXTURE.scenes)
      .forEach(function(scene){
      var id = scene.id;
      var plan = architectureFormVariantPlan(id, seed);
      if(!plan.validation.ok){
        failures.push({ id: id, seed: seed, failures: plan.validation.failures });
      }
    });
  }
  return failures;
})()`));
check("all sixteen changed-seed siblings pass the same structural validator",
  variants.every((plan) => plan.validation.ok),
  variants.filter((plan) => !plan.validation.ok).map((plan) => plan.validation.failures));
check("4,096 bounded plans across 256 seeds pass structural validation",
  stressFailures.length === 0, stressFailures.slice(0, 8));
check("bounded variation is byte-deterministic",
  JSON.stringify(variants) === JSON.stringify(variantReplays));
check("every bounded request actually transforms its canonical form",
  variants.every((plan) => plan.variation
    && plan.variation.beforeFingerprint !== plan.variation.afterFingerprint),
  variants.map((plan) => ({ formId: plan.formId, variation: plan.variation })));
check("adjacent seeds produce structurally distinct siblings in most families",
  variants.filter((plan, index) =>
    plan.variation.afterFingerprint !== variantSiblings[index].variation.afterFingerprint).length >= 12);
check("variation preserves member ids and support ownership",
  variants.every((plan, index) =>
    JSON.stringify(plan.compiledMembers.map((member) =>
      [member.id, member.ownerId, member.supportedBy]))
    === JSON.stringify(plans[index].compiledMembers.map((member) =>
      [member.id, member.ownerId, member.supportedBy]))));
check("variation preserves program and access topology",
  variants.every((plan, index) =>
    JSON.stringify(plan.programTopology) === JSON.stringify(plans[index].programTopology)
    && JSON.stringify(plan.accessGraph) === JSON.stringify(plans[index].accessGraph)));
check("variation preserves opening ownership, kind, and access",
  variants.every((plan, index) =>
    JSON.stringify(plan.openings.map((opening) =>
      [opening.id, opening.wallRunId, opening.kind, opening.access, opening.observation]))
    === JSON.stringify(plans[index].openings.map((opening) =>
      [opening.id, opening.wallRunId, opening.kind, opening.access, opening.observation]))));
check("variation preserves asset purpose and candidate identity",
  variants.every((plan, index) =>
    JSON.stringify(plan.assetSockets.map((socket) =>
      [socket.id, socket.ownerId, socket.purpose, socket.allowedSlugs,
        socket.promotionCandidates, socket.plannedCandidates]))
    === JSON.stringify(plans[index].assetSockets.map((socket) =>
      [socket.id, socket.ownerId, socket.purpose, socket.allowedSlugs,
        socket.promotionCandidates, socket.plannedCandidates]))));
const variantCheckpoint = variants.find((plan) => plan.formId === "AF-01");
check("checkpoint variants retain exact road/barrier orthogonality and passage",
  variantCheckpoint.barrierAudit.orthogonal
    && Math.abs(variantCheckpoint.barrierAudit.dot) <= 0.001
    && variantCheckpoint.barrierAudit.passageClear,
  variantCheckpoint.barrierAudit);

console.log("\nMonumental fantasy architecture");
const monumental = plans.filter((plan) => monumentalIds.includes(plan.sceneId));
check("all four monumental forms pass the same structural validator",
  monumental.length === 4 && monumental.every((plan) => plan.validation.ok),
  monumental.map((plan) => [plan.formId, plan.validation.failures]));
check("monumental forms exceed cottage scale without a shared uniform scale-up",
  monumental.every((plan) => plan.validation.maxTopY >= 12)
    && new Set(monumental.map((plan) => plan.constructionProfile)).size === 4,
  monumental.map((plan) => [plan.formId, plan.validation.maxTopY]));
check("monumental rung includes dedicated interiors and exterior precincts",
  monumental.filter((plan) => plan.battleSpaceMode === "dedicated-interior").length === 2
    && monumental.filter((plan) =>
      plan.battleSpaceMode === "exterior-architectural-precinct").length === 2);
check("elite forms carry luxury surfaces as authored construction",
  monumental.every((plan) => plan.compiledMembers.some((member) =>
    ["ornamental-stone", "stained-glass", "luxury-floor"].includes(member.role))));
check("every elite form has one causal historical wonder tell",
  monumental.every((plan) => plan.wonderSignature
    && plan.wonderSignature.id && plan.wonderSignature.tell
    && plan.wonderSignature.historyDemand));
check("sanctuary and archive interiors preserve physical state through dollhouse projection",
  monumental.filter((plan) => plan.battleSpaceMode === "dedicated-interior")
    .every((plan) => plan.physicalState === "intact"
      && plan.presentation.hiddenMemberIds.length
      && plan.presentation.cutawayGroups.some((group) =>
        group.mode === "presentation-dollhouse")));

console.log("\nGiant-built megainterior materialization window");
const giantConcourse = plans.find((plan) => plan.formId === "AF-21");
check("the giant concourse is a cropped interior window with no exterior silhouette",
  giantConcourse.battleSpaceMode === "dedicated-interior"
    && giantConcourse.materializationWindow.exteriorVisible === false
    && giantConcourse.materializationWindow.representedFraction === "one-corner-only"
    && ["south", "east", "up"].every((edge) =>
      giantConcourse.materializationWindow.continuations.some((row) => row.edge === edge)));
check("giant scale is a civilization regime rather than a uniform human-building scale-up",
  giantConcourse.scaleRegime.originalBuilder === "giant"
    && giantConcourse.scaleRegime.ageYears === 10000
    && giantConcourse.scaleRegime.uniformScaleForbidden
    && giantConcourse.scaleRegime.originalOccupantHeight
      >= giantConcourse.scaleRegime.currentOccupantHeight * 3.5);
check("the giant concourse exceeds forty-foot-class human grandeur and remains one corner",
  giantConcourse.validation.maxTopY >= 38
    && giantConcourse.extentCells.x >= 50 && giantConcourse.extentCells.y >= 50,
  { maxTopY: giantConcourse.validation.maxTopY, extent: giantConcourse.extentCells });
check("ancient physical ruin and present-day reoccupation remain independent",
  giantConcourse.physicalState === "ruined"
    && giantConcourse.operatingState === "reoccupied"
    && giantConcourse.compiledMembers.some((member) => member.condition === "ruined")
    && giantConcourse.compiledMembers.some((member) => member.role === "repair"));
check("original giant circulation and current Medium circulation are both physical",
  giantConcourse.stairs.length >= 4
    && giantConcourse.stairs.some((stair) => stair.width >= 6)
    && giantConcourse.stairs.some((stair) => stair.width <= 2.2)
    && giantConcourse.clearanceEnvelopes.some((row) =>
      row.id === "concourse-current-medium-route"
        && row.profileId === "broad-medium"));
const lowerReoccupationStair = giantConcourse.stairs.find((stair) =>
  stair.id === "concourse-reoccupation-lower-stair");
const upperReoccupationStair = giantConcourse.stairs.find((stair) =>
  stair.id === "concourse-reoccupation-upper-stair");
check("the two reoccupation flights share one exact seam without a masking platform",
  giantConcourse.validation.stairSeamAudit.ok
    && giantConcourse.validation.stairSeamAudit.rows.length === 1
    && lowerReoccupationStair.end.x === upperReoccupationStair.start.x
    && lowerReoccupationStair.end.z === upperReoccupationStair.start.z
    && lowerReoccupationStair.topY === upperReoccupationStair.baseY
    && !giantConcourse.compiledMembers.some((member) =>
      member.id === "concourse-reoccupation-landing"));
check("the higher reoccupation flight carries solid support to the concourse floor",
  upperReoccupationStair.supportMode === "grounded-solid"
    && upperReoccupationStair.foundationBaseY === 0.42
    && giantConcourse.compiledMembers
      .filter((member) => member.ownerId === upperReoccupationStair.id
        && member.id.includes(":step:"))
      .every((member) =>
        member.center.y - member.size.y / 2 <= upperReoccupationStair.foundationBaseY + 0.001));
check("local color-and-light direction is engine-authored and supported",
  giantConcourse.lightSockets.length >= 5
    && giantConcourse.compiledMembers.some((member) => member.role === "stained-glass")
    && giantConcourse.compiledMembers.some((member) => member.role === "gilded-metal"));

console.log("\nReviewed discrete growth and creature clearance");
const growthIds = suite2Ids;
const growthPlans = growthIds.map((id) =>
  clone(evaluate(`architectureFormGrowthPlan(${JSON.stringify(id)}, 911)`)));
const growthReplays = growthIds.map((id) =>
  clone(evaluate(`architectureFormGrowthPlan(${JSON.stringify(id)}, 911)`)));
check("all eight reviewed growth proofs pass the structural validator",
  growthPlans.every((plan) => plan.validation.ok),
  growthPlans.filter((plan) => !plan.validation.ok)
    .map((plan) => [plan.formId, plan.validation.failures]));
check("discrete growth is deterministic and changes every canonical form",
  JSON.stringify(growthPlans) === JSON.stringify(growthReplays)
    && growthPlans.every((plan) =>
      plan.growth.beforeFingerprint !== plan.growth.afterFingerprint));
check("every growth proof adds a complete room or storey plus an access edge",
  growthPlans.every((plan) => plan.growth.operations.some((operation) =>
    operation.startsWith("append-room-bay")
      || operation.startsWith("append-service-wing")
      || operation.startsWith("add-complete-storey"))
    && plan.accessGraph.length > plans.find((canonical) =>
      canonical.formId === plan.formId).accessGraph.length));
check("multi-storey growth replaces the old roof and adds reachable supported floors",
  growthPlans.filter((plan) => ["AF-14", "AF-15"].includes(plan.formId))
    .every((plan) => plan.growth.operations.some((operation) =>
      operation.startsWith("add-complete-storey"))
      && plan.stairs.length > plans.find((canonical) =>
        canonical.formId === plan.formId).stairs.length
      && plan.roofs.every((roof) =>
        plan.roofJunctions.filter((junction) => junction.roofId === roof.id).length
          === roof.closureExpected)));
check("dollhouse views hide only engine-named presentation members",
  growthPlans.filter((plan) => plan.presentation.cutawayGroups.length)
    .every((plan) => plan.physicalState === "intact"
      && plan.presentation.hiddenMemberIds.length > 0
      && plan.presentation.cutawayGroups.every((group) =>
        group.mode === "presentation-dollhouse")));
check("Medium-scale flexibility covers upright, broad, and long body plans",
  Object.keys(clone(evaluate("ARCHITECTURE_CREATURE_SCALE_PROFILES"))).length === 3
    && growthPlans.some((plan) =>
      plan.clearanceEnvelopes.some((envelope) => envelope.profileId === "broad-medium"))
    && growthPlans.some((plan) =>
      plan.clearanceEnvelopes.some((envelope) => envelope.profileId === "long-medium")));
check("creature flexibility is proved through portals, routes, turns, and vertical modes",
  growthPlans.every((plan) => plan.clearanceEnvelopes.every((envelope) => {
    const profile = clone(evaluate(
      `ARCHITECTURE_CREATURE_SCALE_PROFILES[${JSON.stringify(envelope.profileId)}]`));
    return envelope.routeWidth >= profile.minRouteWidth
      && envelope.turnDiameter >= profile.minTurnDiameter
      && profile.verticalModes.includes(envelope.verticalMode);
  })));

console.log(`\nArchitecture form ladder: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
