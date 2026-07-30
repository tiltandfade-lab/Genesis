#!/usr/bin/env node
/* Golden Site Wave 1 focused verifier.
   Loads the real current rollers and read-only observatory into one classic-script scope. */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..");
const read=(path)=>readFileSync(join(ROOT,path),"utf8");
const exportsList=[
  "VIGNETTE_SCHEMA_VERSION","VIGNETTE_ADAPTER_VERSION","VIGNETTE_DISPOSITIONS",
  "VIGNETTE_SOURCE_TREATMENTS","VIGNETTE_UNRESOLVED_REASONS",
  "vignetteStableJson","vignetteFingerprint","vignetteSeedFrom","vignetteWithAuditRandom",
  "vignetteLeafFacts","vignetteClassify","vignetteRequestFingerprint",
  "vignetteRequestFromWalk","vignetteRequestFromTravel","vignetteRequestFromJob",
  "vignetteRequestFromCapture","vignetteRequestFromReturn","vignetteRequestFromVenue",
  "vignetteRequestFromPersistedSite","vignetteRequestFromSource","validateVignetteRequest",
  "vignetteAssetDemandsForRequest","vignetteCandidateLaneForDemand","validateSemanticAssetDemand",
  "rollUrbanWalk","rollDungeonWalk","rollWildernessWalk"
];
const factory=new Function("window",[
  read("tables.js"),
  read("src/engine/walk.js"),
  read("src/engine/dungeon-walk.js"),
  read("src/engine/wild-walk.js"),
  read("src/engine/vignette-observatory.js"),
  `return {${exportsList.join(",")}};`
].join("\n;\n"));
const A=factory({});

let pass=0,fail=0;
const failures=[];
function check(ok,label,detail){
  if(ok){pass++;return;}
  fail++; failures.push(detail===undefined?label:`${label}: ${JSON.stringify(detail)}`);
}
function disposition(request){return request.materializationIntent.disposition;}
function requestOptions(id,extra={}){
  return Object.assign({requestId:id,sourceRef:`verify:${id}`,rootSeed:"verify-v1"},extra);
}
function sha256(path){return createHash("sha256").update(readFileSync(join(ROOT,path))).digest("hex");}

check(A.VIGNETTE_SCHEMA_VERSION===1,"schema version frozen");
check(A.VIGNETTE_ADAPTER_VERSION==="vignette-observatory/1","adapter version frozen");
check(A.VIGNETTE_DISPOSITIONS.length===6&&new Set(A.VIGNETTE_DISPOSITIONS).size===6,"six unique dispositions");
check(A.VIGNETTE_SOURCE_TREATMENTS.length===4,"four source treatments");
check(A.VIGNETTE_UNRESOLVED_REASONS.includes("MISSING_HOST_PROGRAM"),"unresolved vocabulary loaded");

// Isolated replay uses production rollers without teaching them seed arguments.
const beforeRandom=Math.random;
const seed=A.vignetteSeedFrom(["wave1","urban","replay",0]);
const urbanA=A.vignetteWithAuditRandom(seed,()=>A.rollUrbanWalk({segCount:3,tier:1}));
check(Math.random===beforeRandom,"audit RNG restores Math.random after success");
const urbanB=A.vignetteWithAuditRandom(seed,()=>A.rollUrbanWalk({segCount:3,tier:1}));
check(A.vignetteStableJson(urbanA)===A.vignetteStableJson(urbanB),"same named seed replays production urban roller");
try{A.vignetteWithAuditRandom(seed,()=>{throw new Error("expected");});}catch{}
check(Math.random===beforeRandom,"audit RNG restores Math.random after throw");
const urbanC=A.vignetteWithAuditRandom(seed+1,()=>A.rollUrbanWalk({segCount:3,tier:1}));
check(A.vignetteFingerprint(urbanA)!==A.vignetteFingerprint(urbanC),"changed seed changes raw roll");

const rawClone=JSON.parse(JSON.stringify(urbanA));
const urbanReq=A.vignetteRequestFromWalk(urbanA,requestOptions("urban"));
check(A.vignetteStableJson(urbanA)===A.vignetteStableJson(rawClone),"walk adapter does not mutate raw source");
check(A.validateVignetteRequest(urbanReq).ok,"urban request validates",A.validateVignetteRequest(urbanReq).errors);
const leaves=A.vignetteLeafFacts(urbanA,"verify:urban");
check(urbanReq.observatory.sourceLeafCount===leaves.length,"all raw leaves counted");
check(urbanReq.sourceProvenance[0].factIds.length===leaves.length,"all raw leaves retained in provenance");
check(new Set(urbanReq.observatory.sourceLeafPaths).size===urbanReq.observatory.sourceLeafPaths.length,"source paths unique");
check(urbanReq.observatory.fingerprint===A.vignetteRequestFingerprint(urbanReq),"request fingerprint self-verifies");
const malformed=JSON.parse(JSON.stringify(urbanReq));
delete malformed.worldContext.portalRefs;
check(!A.validateVignetteRequest(malformed).ok,"nested request-field deletion fails validation");

const urbanReqAgain=A.vignetteRequestFromWalk(urbanB,requestOptions("urban"));
check(A.vignetteStableJson(urbanReq)===A.vignetteStableJson(urbanReqAgain),"same raw source emits byte-equivalent request");
const cameraLeft=A.vignetteRequestFromWalk(urbanA,requestOptions("camera",{cameraBearing:"northwest"}));
const cameraRight=A.vignetteRequestFromWalk(urbanA,requestOptions("camera",{cameraBearing:"southeast"}));
check(A.vignetteStableJson(cameraLeft)===A.vignetteStableJson(cameraRight),"camera bearing cannot mutate request identity");

const changed=JSON.parse(JSON.stringify(urbanA));
changed.setup.type=changed.setup.type+" changed";
const changedReq=A.vignetteRequestFromWalk(changed,requestOptions("urban"));
check(urbanReq.observatory.fingerprint!==changedReq.observatory.fingerprint,"changed source fact changes request fingerprint");

// All required adapter entry paths.
const dungeon=A.vignetteWithAuditRandom(A.vignetteSeedFrom(["wave1","dungeon","adapter",0]),()=>A.rollDungeonWalk({segCount:2,tier:1}));
const wilderness=A.vignetteWithAuditRandom(A.vignetteSeedFrom(["wave1","wilderness","adapter",0]),()=>A.rollWildernessWalk({legCount:2,tier:1}));
const adapterRequests=[
  A.vignetteRequestFromWalk(dungeon,requestOptions("dungeon")),
  A.vignetteRequestFromTravel(wilderness,requestOptions("travel")),
  A.vignetteRequestFromJob({walk:wilderness,objectiveRef:"job:j1"},requestOptions("job")),
  A.vignetteRequestFromCapture({disposition:"ransom",holdingNoun:"a black-iron cell"},requestOptions("capture")),
  A.vignetteRequestFromReturn({state:"returned"},requestOptions("return",{priorPlanRef:"plan:return"})),
  A.vignetteRequestFromVenue({typedProgram:"Noodle Bar",venue:"The Golden Dolphin"},requestOptions("venue")),
  A.vignetteRequestFromPersistedSite({siteIdentity:{siteId:"site:p1",priorPlanRef:"plan:p1"},state:"operating"},
    requestOptions("persisted",{priorPlanRef:"plan:p1"}))
];
check(adapterRequests.every((r)=>A.validateVignetteRequest(r).ok),"all eight entry-path adapters validate");
check(adapterRequests[2].observatory.sourceLeafPaths.some((path)=>path.includes("/entryContext/job/objectiveRef")),
  "job adapter preserves wrapper objective provenance");
check(disposition(adapterRequests[3])==="MATERIALIZE_NEW"&&adapterRequests[3].hostProgram.owner==="CustodyHost","capture enters custody host");
check(disposition(adapterRequests[4])==="CONTINUE_EXISTING","return continues persisted identity");
check(disposition(adapterRequests[6])==="CONTINUE_EXISTING","persisted site continues");

// Six-way disposition partition.
for(const d of A.VIGNETTE_DISPOSITIONS){
  const r=A.vignetteRequestFromSource({kind:"fixture",family:"fixture",raw:{license:d},sourceRef:`verify:disposition:${d}`},
    requestOptions(`disposition-${d}`,{licensedDisposition:d,hostOwners:d==="UNRESOLVED"?[]:["UrbanFabric"]}));
  check(disposition(r)===d,`explicit ${d} remains exactly one disposition`);
  check(A.validateVignetteRequest(r).ok,`${d} fixture validates`,A.validateVignetteRequest(r).errors);
}

// Frozen negative controls from the Wave 1 brief.
const balanced=A.vignetteRequestFromWalk({
  environment:"wilderness",setup:{biome:"Highland"},segments:[
    {num:1,feature:{name:"wind-bent grass"}},{num:2,isFinale:true,areaType:"Rocky shoulder",feature:{name:"Balanced rock",flavor:"one weathered stone"}}
  ]
},requestOptions("balanced-rock"));
check(disposition(balanced)==="DECORATE_LOCAL"&&balanced.hostProgram.owner==="LocalFeature","balanced rock is local, not a site");

const bridgeRumor=A.vignetteRequestFromWalk({
  environment:"wilderness",setup:{biome:"River valley"},segments:[
    {num:1},{num:2,isFinale:true,feature:{name:"Rumor of a bridge closure",flavor:"said to be blocked beyond the ridge"}}
  ]
},requestOptions("bridge-rumor"));
check(disposition(bridgeRumor)==="NARRATIVE_ONLY","bridge-closure rumor does not license visible bridge");

const infra=A.vignetteRequestFromWalk({environment:"dungeon",setup:{type:"Infrastructure Hub"},segments:[]},requestOptions("infra"));
check(infra.hostProgram.owner==="InfrastructureWorksHost"&&!infra.hostProgram.family.includes("ExtractionWorkHost"),"infrastructure hub is not a mine");
const harbor=A.vignetteRequestFromWalk({environment:"urban",setup:{type:"Harborfront"},segments:[]},requestOptions("harbor"));
check(harbor.substratePlan.family==="WaterEdgeSubstrate","harborfront directly earns water-edge substrate");
const underworks=A.vignetteRequestFromWalk({environment:"urban",setup:{type:"Underworks"},segments:[]},requestOptions("underworks"));
check(underworks.substratePlan.family==="SubterraneanSubstrate","underworks directly earns subterranean substrate");
const lowWard=A.vignetteRequestFromWalk({environment:"urban",setup:{type:"Slums / Low Ward"},segments:[]},requestOptions("low-ward"));
check(lowWard.observatory.operatingOwners.includes("OperatingMaintenanceState"),"low ward retains operating/maintenance owner");
const naturalCavern=A.vignetteRequestFromWalk({environment:"dungeon",setup:{type:"Natural Cavern"},segments:[]},requestOptions("natural-cavern"));
check(naturalCavern.hostProgram.owner==="NaturalCavernHost"&&!naturalCavern.hostProgram.family.includes("EcologyClaimHost"),
  "natural cavern does not invent an ecological claimant");
const ambiguousCustody=A.vignetteRequestFromWalk({environment:"dungeon",setup:{type:"Prison / Asylum"},segments:[]},requestOptions("custody-ambiguous"));
check(disposition(ambiguousCustody)==="UNRESOLVED"&&ambiguousCustody.observatory.unresolvedReasons.includes("AMBIGUOUS_DISPOSITION"),
  "combined prison/asylum row stays unresolved rather than inventing one program");
const unknownUrban=A.vignetteRequestFromWalk({environment:"urban",setup:{type:"Unknown District"},segments:[]},requestOptions("unknown-urban"));
check(disposition(unknownUrban)==="UNRESOLVED","unknown urban type gets no generic fantasy host");

const physicalFeature=(id,name)=>A.vignetteRequestFromWalk({
  environment:"wilderness",setup:{biome:"Hill"},segments:[{isFinale:true,feature:{name}}]
},requestOptions(id));
check(disposition(physicalFeature("brimstone","Brimstone Pillar: Yellow-streaked, foul-smelling rock."))==="DECORATE_LOCAL",
  "physical feature with smell remains visible local terrain");
check(disposition(physicalFeature("whispering","Whispering Stone: Megalith with a natural hole."))==="DECORATE_LOCAL",
  "whispering physical feature is not erased into narrative");
check(physicalFeature("dinner","Perfectly Set Dinner Table: Fine china and chairs in the wild.").hostProgram.owner==="LocalFeature",
  "dinner does not substring-match inn");
check(physicalFeature("wooden","Pyre: Charred wooden stake surrounded by ash.").hostProgram.owner==="LocalFeature",
  "wooden does not substring-match den");
check(physicalFeature("holding","Mirror of the Sky: A stone frame holding a water-mirror.").hostProgram.owner==="LocalFeature",
  "descriptive holding does not invent custody");
check(physicalFeature("towering","Fungal Bloom: Towering, 20-foot-tall mushrooms.").hostProgram.owner==="LocalFeature",
  "towering does not invent a fortification");
check(physicalFeature("luminescent","Bioluminescent Grove: Flora glowing neon blue/green.").hostProgram.owner==="LocalFeature",
  "bioluminescent does not substring-match mine");

const crypt=A.vignetteRequestFromWalk({environment:"dungeon",setup:{type:"Subterranean Crypt"},segments:[]},
  requestOptions("crypt",{operatingState:"operating"}));
check(crypt.hostProgram.owner==="FuneraryMortuaryHost"&&crypt.operatingModel.state==="operating"&&crypt.transformStack.length===0,
  "operating crypt is not silently abandoned");

const layered=A.vignetteRequestFromVenue({typedProgram:"Checkpoint inn"},requestOptions("layered",{
  hostOwners:["HospitalityVenue"],priorPlanRef:"plan:inn",transforms:[{owner:"LayeredControlTransform",deltas:["permission-delta"]}]
}));
check(disposition(layered)==="TRANSFORM_EXISTING"&&layered.hostProgram.owner==="HospitalityVenue"&&
  layered.transformStack[0].owner==="LayeredControlTransform","layered control preserves its host");

const missing=A.vignetteRequestFromSource({kind:"unknown",family:"unknown",raw:{description:"something is here"},sourceRef:"verify:missing"},
  requestOptions("missing",{requireHost:true}));
check(disposition(missing)==="UNRESOLVED"&&missing.observatory.unresolvedReasons.includes("MISSING_HOST_PROGRAM"),"missing host remains unresolved");
check(!!missing.observatory.sourceExample,"unresolved request carries source example");

const rendererCannot=A.vignetteRequestFromVenue({typedProgram:"Noodle Bar"},requestOptions("renderer-cannot",{
  hostOwners:["HospitalityVenue"],rendererRoles:["invented-approach","invented-service"]
}));
check(!rendererCannot.materializationIntent.requiredRoles.includes("invented-approach"),"renderer cannot invent/complete required roles");
const explicitRole=A.vignetteRequestFromVenue({typedProgram:"Noodle Bar"},requestOptions("required-role",{
  hostOwners:["HospitalityVenue"],requiredRoles:["public-sign"]
}));
check(explicitRole.materializationIntent.requiredRoles.includes("public-sign"),"source-required role survives normalization");

const goldenIgnored=A.vignetteRequestFromVenue({typedProgram:"Noodle Bar",goldenSiteId:999},requestOptions("golden-ignored",{
  hostOwners:["HospitalityVenue"]
}));
check(goldenIgnored.hostProgram.owner==="HospitalityVenue"&&!goldenIgnored.hostProgram.family.includes("999"),"Golden number never selects runtime owner");

// Role demand remains countable and proxy-only.
const demands=A.vignetteAssetDemandsForRequest(layered);
check(demands.length===layered.materializationIntent.requiredRoles.length&&demands.length>0,"every required role creates countable demand");
check(demands.every((d)=>A.validateSemanticAssetDemand(d).ok),"all semantic asset demands validate");
const malformedDemand=JSON.parse(JSON.stringify(demands[0]));
delete malformedDemand.tactical.cover;
check(!A.validateSemanticAssetDemand(malformedDemand).ok,"nested demand-field deletion fails validation");
check(demands.every((d)=>d.fallbackPolicy.omissionLegal===false&&d.fallbackPolicy.minimumTruthfulProxy),"required demand has truthful non-omission proxy");
check(demands.every((d)=>!Object.hasOwn(d,"assetId")&&!Object.hasOwn(d,"vendor")),"Wave 1 demand selects no asset or vendor");
check(demands.every((d)=>typeof A.vignetteCandidateLaneForDemand(d)==="string"),"candidate lanes are analysis-only and countable");
const balancedDemands=A.vignetteAssetDemandsForRequest(balanced);
check(balancedDemands.filter((d)=>d.nounFamily==="natural-feature").every((d)=>A.vignetteCandidateLaneForDemand(d)==="ENGINE_RECIPE"),
  "natural terrain demand stays engine-first rather than defaulting to Meshy");

// Stateful continuity cases remain identity-preserving records, not regenerated spaces.
const discovered=A.vignetteRequestFromWalk(wilderness,requestOptions("persist-discover",{siteId:"site:seq"}));
const returned=A.vignetteRequestFromReturn({event:"return"},requestOptions("persist-return",{
  siteId:"site:seq",priorPlanRef:"plan:seq",returnStateRef:"return:1"
}));
const transformed=A.vignetteRequestFromReturn({event:"aftermath"},requestOptions("persist-transform",{
  siteId:"site:seq",priorPlanRef:"plan:seq",transforms:[{owner:"DormantTransform",deltas:["failed-function"]}]
}));
check(disposition(discovered)!=="CONTINUE_EXISTING","discovery is not false continuation");
check(disposition(returned)==="CONTINUE_EXISTING"&&returned.siteIdentity.priorPlanRef==="plan:seq","return preserves prior plan");
check(disposition(transformed)==="TRANSFORM_EXISTING"&&transformed.siteIdentity.priorPlanRef==="plan:seq","transform preserves prior host plan");

// Wave-0 fixture selectors still point to stable source bytes.
const fixtures=JSON.parse(read("docs/intel/golden-vignette-wave0-fixtures.json"));
for(const fixture of fixtures.fixtures){
  const source=fixture.source||fixture.worldContext?.source;
  if(source){
    check(sha256(source.path)===source.sha256,`${fixture.fixtureId} source hash loads and matches`);
  }
  if(fixture.shapeSource){
    check(sha256(fixture.shapeSource.path)===fixture.shapeSource.sha256,`${fixture.fixtureId} shape hash loads and matches`);
  }
}

console.log(`${fail===0?"PASS":"FAIL"} vignette observatory — ${pass} passed, ${fail} failed`);
if(fail){
  failures.forEach((message)=>console.error("  -",message));
  process.exit(1);
}
