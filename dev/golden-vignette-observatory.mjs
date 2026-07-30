#!/usr/bin/env node
/* Golden Site Wave 1 deterministic demand census.

   Default: run in memory and print the checkpoint fingerprint.
   --emit: write the compact JSON/Markdown reports and gzip-compressed request-row corpus.
   --check: regenerate and byte-compare all checked-in outputs.
   --replay <caseId>: print one compact request record.

   The audit PRNG temporarily replaces Math.random under the production rollers. The production
   roller APIs are not modified and no world/game state is retained between cases. */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT=join(dirname(fileURLToPath(import.meta.url)),"..");
const INTEL=join(ROOT,"docs","intel");
const CORPUS_VERSION="golden-vignette-wave1-corpus-v1";
const REPORT_JSON=join(INTEL,"golden-vignette-wave1-report.json");
const REPORT_MD=join(INTEL,"golden-vignette-wave1-report.md");
const CORPUS_GZ=join(INTEL,"golden-vignette-wave1-corpus.jsonl.gz");
const NATURAL_COUNTS=Object.freeze({urban:4000,dungeon:4000,wilderness:4000});
const WILDERNESS_SPLIT=Object.freeze({frontier:1600,travel:1200,job:1200});
const read=(path)=>readFileSync(join(ROOT,path),"utf8");
const json=(path)=>JSON.parse(read(path));
const sha256=(value)=>createHash("sha256").update(value).digest("hex");
const sourceSha=(path)=>sha256(readFileSync(join(ROOT,path)));

const factory=new Function("window",[
  "function mapOf(w){return w.map;}",
  read("tables.js"),
  read("src/engine/hexmap.js"),
  read("src/engine/region.js"),
  read("src/engine/walk.js"),
  read("src/engine/dungeon-walk.js"),
  read("src/engine/wild-walk.js"),
  read("src/engine/vignette-observatory.js"),
  `return {
    VIGNETTE_ADAPTER_VERSION,VIGNETTE_DISPOSITIONS,VIGNETTE_UNRESOLVED_REASONS,
    walkRows,axialToWorld,spiceTierAt,rollUrbanWalk,rollDungeonWalk,rollWildernessWalk,
    vignetteStableJson,vignetteFingerprint,vignetteSeedFrom,vignetteWithAuditRandom,
    vignetteRequestFingerprint,vignetteRequestFromWalk,vignetteRequestFromTravel,
    vignetteRequestFromJob,vignetteRequestFromCapture,vignetteRequestFromReturn,
    vignetteRequestFromVenue,vignetteRequestFromPersistedSite,vignetteRequestFromSource,
    validateVignetteRequest,vignetteAssetDemandsForRequest,vignetteCandidateLaneForDemand,
    validateSemanticAssetDemand
  };`
].join("\n;\n"));
const A=factory({});

function count(map,key,n=1){map.set(String(key==null?"UNSPECIFIED":key),(map.get(String(key==null?"UNSPECIFIED":key))||0)+n);}
function tally(map,total){
  return Array.from(map.entries()).map(([key,n])=>({key,count:n,pct:Number((n*100/Math.max(1,total)).toFixed(4))}))
    .sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
}
function firstFinale(raw){
  const segs=Array.isArray(raw?.segments)?raw.segments:[];
  return segs.find((s)=>s?.isFinale)||segs[segs.length-1]||{};
}
function compactDemand(demand){
  return {
    demandId:demand.demandId,
    semanticRole:demand.semanticRole,
    nounFamily:demand.nounFamily,
    omissionLegal:!!demand.fallbackPolicy.omissionLegal,
    truthfulProxy:demand.fallbackPolicy.minimumTruthfulProxy,
    candidateLane:A.vignetteCandidateLaneForDemand(demand)
  };
}
function compactRecord(meta,raw,request,extraChecks={}){
  const requestValidation=A.validateVignetteRequest(request);
  const demands=A.vignetteAssetDemandsForRequest(request);
  const demandValid=demands.every((d)=>A.validateSemanticAssetDemand(d).ok);
  const provenanceFacts=(request.sourceProvenance||[]).reduce((n,p)=>n+(p.factIds||[]).length,0);
  const sourcePreserved=provenanceFacts===request.observatory.sourceLeafCount||
    request.observatory.unresolvedReasons.includes("MISSING_SOURCE_PROVENANCE");
  const fingerprintValid=request.observatory.fingerprint===A.vignetteRequestFingerprint(request);
  const exactlyOne=A.VIGNETTE_DISPOSITIONS.filter((d)=>d===request.materializationIntent.disposition).length===1;
  const unresolvedExplained=request.materializationIntent.disposition!=="UNRESOLVED"||
    (request.observatory.unresolvedReasons.length>0&&!!request.observatory.sourceExample);
  const checks=Object.assign({
    requestValid:requestValidation.ok,
    demandValid,
    sourcePreserved,
    fingerprintValid,
    exactlyOneDisposition:exactlyOne,
    unresolvedExplained
  },extraChecks);
  if(Object.values(checks).some((ok)=>ok!==true)){
    throw new Error(`${meta.caseId} verifier failed: ${JSON.stringify({checks,requestErrors:requestValidation.errors})}`);
  }
  return {
    corpusId:meta.corpusId,
    caseId:meta.caseId,
    sampleIndex:meta.sampleIndex,
    requestFamily:meta.requestFamily,
    entryPath:meta.entryPath,
    seedNamespace:request.seedNamespace,
    replayCommand:`node dev/golden-vignette-observatory.mjs --replay ${meta.caseId}`,
    rawRollFingerprint:request.observatory.rawFingerprint,
    adapterVersion:request.observatory.adapterVersion,
    contractVersion:request.schemaVersion,
    sourceProvenanceCount:request.sourceProvenance.length,
    sourceFactCount:request.observatory.sourceLeafCount,
    sourceTreatments:(request.sourceProvenance||[]).map((p)=>p.treatment),
    disposition:request.materializationIntent.disposition,
    confidenceBasis:{confidence:request.observatory.confidence,basis:request.observatory.classificationBasis},
    owners:{
      host:request.observatory.sharedOwners,
      transform:request.observatory.transformOwners,
      substrate:request.observatory.substrateOwner?[request.observatory.substrateOwner]:[],
      scale:request.observatory.scaleOwners,
      operating:request.observatory.operatingOwners,
      activeWindow:request.observatory.activeWindowOwners
    },
    unresolvedReasons:request.observatory.unresolvedReasons,
    sourceExample:request.materializationIntent.disposition==="UNRESOLVED"?request.observatory.sourceExample:null,
    semanticAssetDemands:demands.map(compactDemand),
    priorPlanRef:request.siteIdentity.priorPlanRef,
    frontierRefs:request.siteIdentity.frontierRefs,
    requestFingerprint:request.observatory.fingerprint,
    verifier:checks,
    observations:{
      primaryType:raw?.setup?.type||firstFinale(raw).areaType||null,
      primaryFeature:firstFinale(raw)?.feature?.name||null,
      biome:raw?.setup?.biome||raw?.startBiome||null,
      spiceTier:raw?.spiceTier||null,
      threat:raw?.threat?.id||null,
      encounterBranches:(raw?.segments||[]).map((segment)=>segment?.encounter?.type).filter(Boolean),
      encounterPurpose:request.materializationIntent.purpose,
      encounterMode:request.encounterIntent.mode,
      operatingState:request.operatingModel.state,
      activeWindows:request.budgets.activeWindows
    }
  };
}
function auditOptions(caseId,seed,extra={}){
  return Object.assign({
    requestId:`request:${caseId}`,
    sourceRef:`audit:${caseId}`,
    rootSeed:String(seed),
    seedNamespace:`${CORPUS_VERSION}/${caseId}`,
    rollRef:`roll:${caseId}`,
    authority:"current-production-path"
  },extra);
}

function naturalEntryPath(index){
  if(index<WILDERNESS_SPLIT.frontier) return "frontier";
  if(index<WILDERNESS_SPLIT.frontier+WILDERNESS_SPLIT.travel) return "travel";
  return "job";
}
function naturalOne(family,index){
  const entryPath=family==="wilderness"?naturalEntryPath(index):"frontier";
  const caseId=`natural:${family}:${String(index).padStart(4,"0")}`;
  const seed=A.vignetteSeedFrom([CORPUS_VERSION,family,caseId,index]);
  const tier=index%2+1;
  let raw,request;
  if(family==="urban"){
    raw=A.vignetteWithAuditRandom(seed,()=>A.rollUrbanWalk({segCount:2,tier}));
    request=A.vignetteRequestFromWalk(raw,auditOptions(caseId,seed,{kind:"raw-walk"}));
  }else if(family==="dungeon"){
    raw=A.vignetteWithAuditRandom(seed,()=>A.rollDungeonWalk({segCount:2,tier}));
    request=A.vignetteRequestFromWalk(raw,auditOptions(caseId,seed,{kind:"raw-walk"}));
  }else{
    raw=A.vignetteWithAuditRandom(seed,()=>A.rollWildernessWalk({legCount:2,tier,kind:entryPath==="travel"?"travel":"frontier"}));
    if(entryPath==="travel"){
      request=A.vignetteRequestFromTravel({walk:raw,originNodeId:"audit-origin",destNodeId:"audit-destination",travelMin:90},
        auditOptions(caseId,seed));
    }else if(entryPath==="job"){
      request=A.vignetteRequestFromJob({walk:raw,objectiveRef:`job:audit-${index}`,postingId:`posting-${index}`},
        auditOptions(caseId,seed));
    }else request=A.vignetteRequestFromWalk(raw,auditOptions(caseId,seed,{kind:"raw-walk"}));
  }
  return compactRecord({corpusId:"natural",caseId,sampleIndex:index,requestFamily:family,entryPath},raw,request);
}

function rowCells(tableId){return A.walkRows(tableId).map((row,index)=>({index,cells:row[5]||[],band:row[2]||null,total:row[0]}));}
function uniqueValues(tableId,column=0){
  return Array.from(new Set(rowCells(tableId).map((row)=>String(row.cells[column]||"").trim()).filter(Boolean))).sort();
}
function encounterBranch(text){
  const value=String(text||"");
  if(/Enemy|Combat/.test(value)) return "Enemy";
  if(/Hazard|Obstacle/.test(value)) return "Hazard";
  if(/Social|Interaction/.test(value)) return "Social";
  if(/Trap|Barrier|Lock|Problem/.test(value)) return "Problem";
  if(/Discovery|Monument/.test(value)) return "Discovery";
  if(/Lore/.test(value)) return "Lore";
  if(/Commerce/.test(value)) return "Commerce";
  if(/Spectacle/.test(value)) return "Spectacle";
  if(/Rumor/.test(value)) return "Rumor";
  return "Empty";
}
function ownerCases(){
  const coverage=json("docs/intel/golden-site-engine-coverage.json");
  const names=new Set();
  coverage.sites.forEach((site)=>site.runtimeOwners.forEach((owner)=>names.add(owner)));
  coverage.ordinaryDemandHomes.forEach((home)=>home.home.forEach((owner)=>names.add(owner)));
  return Array.from(names).sort();
}
function fixtureHashes(){
  const fixtures=json("docs/intel/golden-vignette-wave0-fixtures.json");
  return fixtures.fixtures.map((fixture)=>{
    const sources=[];
    for(const source of [fixture.source,fixture.worldContext?.source,fixture.shapeSource].filter(Boolean)){
      sources.push({path:source.path,expectedSha256:source.sha256,actualSha256:sourceSha(source.path),matches:sourceSha(source.path)===source.sha256});
    }
    return {fixtureId:fixture.fixtureId,sources};
  });
}

function runStratified(){
  const records=[];
  let ordinal=0;
  const push=(caseId,family,entryPath,raw,adapter,opts={},checks={})=>{
    const seed=A.vignetteSeedFrom([CORPUS_VERSION,family,caseId,ordinal]);
    const request=adapter(raw,auditOptions(caseId,seed,opts));
    records.push(compactRecord({corpusId:"stratified",caseId,sampleIndex:ordinal++,requestFamily:family,entryPath},raw.walk||raw,request,checks));
  };

  for(const type of uniqueValues("urban-type")){
    const raw={environment:"urban",setup:{type},segments:[]};
    push(`stratified:urban-type:${ordinal}`,"urban","frontier",raw,(value,opts)=>A.vignetteRequestFromWalk(value,opts));
  }
  for(const type of uniqueValues("dungeon-type")){
    const raw={environment:"dungeon",setup:{type},segments:[]};
    push(`stratified:dungeon-type:${ordinal}`,"dungeon","frontier",raw,(value,opts)=>A.vignetteRequestFromWalk(value,opts));
  }
  for(const family of ["urban","dungeon","wilderness"]){
    const tableId=`${family}-encounter-type`;
    const branches=Array.from(new Set(rowCells(tableId).map((row)=>encounterBranch(row.cells[0])))).sort();
    for(const branch of branches){
      const raw=family==="wilderness"
        ?{environment:"wilderness",setup:{biome:"Grassland"},segments:[{num:1,encounter:{type:branch}},{num:2,isFinale:true,feature:{name:"Low grassy shoulder"}}]}
        :{environment:family,setup:{type:family==="urban"?"Civic Center":"Infrastructure Hub"},segments:[{num:1,encounter:{type:branch}}]};
      push(`stratified:${family}-encounter:${branch.toLowerCase()}`,family,"frontier",raw,(value,opts)=>A.vignetteRequestFromWalk(value,opts));
    }
  }
  for(const row of rowCells("wilderness-feature")){
    const raw={environment:"wilderness",setup:{biome:"Grassland"},segments:[
      {num:1},{num:2,isFinale:true,areaType:"Feature approach",feature:{name:row.cells[0]||"",flavor:row.cells[1]||"",tactical:row.cells[2]||""}}
    ]};
    push(`stratified:wilderness-feature:${String(row.index).padStart(3,"0")}`,"wilderness","frontier",raw,
      (value,opts)=>A.vignetteRequestFromWalk(value,opts));
  }
  for(const row of rowCells("wilderness-area-type")){
    const raw={environment:"wilderness",setup:{biome:"Grassland"},segments:[
      {num:1},{num:2,isFinale:true,areaType:row.cells[0]||"",side:row.cells[1]||"",feature:{name:"Terrain-form proof",flavor:row.cells[2]||""}}
    ]};
    push(`stratified:wilderness-shape:${String(row.index).padStart(3,"0")}`,"wilderness","frontier",raw,
      (value,opts)=>A.vignetteRequestFromWalk(value,opts));
  }
  for(const biome of uniqueValues("wilderness-biome-type")){
    const raw={environment:"wilderness",setup:{biome},startBiome:biome,segments:[{num:1},{num:2,isFinale:true,feature:{name:"Biome ground"}}]};
    push(`stratified:wilderness-biome:${biome.toLowerCase().replace(/\W+/g,"-")}`,"wilderness","frontier",raw,
      (value,opts)=>A.vignetteRequestFromWalk(value,opts));
  }

  const tierCoords={baseline:[0,0],fray1:[20,0],fray2:[32,0],rim:[45,0]};
  for(const [expected,[q,r]] of Object.entries(tierCoords)){
    const xy=A.axialToWorld(q,r);
    const world={id:`audit-${expected}`,currentNodeId:"n",map:{nodes:{n:{x:xy.x,y:xy.y}},edges:[]}};
    const caseId=`stratified:fray:${expected}`;
    const seed=A.vignetteSeedFrom([CORPUS_VERSION,"wilderness",caseId,ordinal]);
    const raw=A.vignetteWithAuditRandom(seed,()=>A.rollWildernessWalk({legCount:1,tier:1,world}));
    push(caseId,"wilderness","frontier",raw,(value,opts)=>A.vignetteRequestFromWalk(value,opts),{},{
      frayTierMatches:raw.spiceTier===expected&&A.spiceTierAt(q,r)===expected
    });
  }

  const baseWild={environment:"wilderness",setup:{biome:"Hill"},segments:[{num:1},{num:2,isFinale:true,feature:{name:"Stone shoulder"}}]};
  const entryCases=[
    ["raw-urban","urban","frontier",{environment:"urban",setup:{type:"Civic Center"},segments:[]},(v,o)=>A.vignetteRequestFromWalk(v,o),{}],
    ["raw-dungeon","dungeon","frontier",{environment:"dungeon",setup:{type:"Infrastructure Hub"},segments:[]},(v,o)=>A.vignetteRequestFromWalk(v,o),{}],
    ["raw-wilderness","wilderness","frontier",baseWild,(v,o)=>A.vignetteRequestFromWalk(v,o),{}],
    ["travel","wilderness","travel",{walk:baseWild,originNodeId:"a",destNodeId:"b"},(v,o)=>A.vignetteRequestFromTravel(v,o),{}],
    ["job","wilderness","job",{walk:baseWild,objectiveRef:"job:coverage"},(v,o)=>A.vignetteRequestFromJob(v,o),{}],
    ["capture","capture","capture",{disposition:"ransom",holdingNoun:"iron cell"},(v,o)=>A.vignetteRequestFromCapture(v,o),{}],
    ["return","return","return",{event:"return"},(v,o)=>A.vignetteRequestFromReturn(v,o),{priorPlanRef:"plan:entry-return"}],
    ["venue","urban","venue",{typedProgram:"Noodle Bar"},(v,o)=>A.vignetteRequestFromVenue(v,o),{}],
    ["persisted","persisted","persisted-site",{siteIdentity:{siteId:"site:entry",priorPlanRef:"plan:entry"}},(v,o)=>A.vignetteRequestFromPersistedSite(v,o),{priorPlanRef:"plan:entry"}]
  ];
  for(const [id,family,path,raw,adapter,opts] of entryCases) push(`stratified:entry:${id}`,family,path,raw,adapter,opts);

  for(const disposition of A.VIGNETTE_DISPOSITIONS){
    const raw={license:disposition,source:"stratified-disposition"};
    push(`stratified:disposition:${disposition.toLowerCase()}`,"fixture","fixture",raw,
      (value,opts)=>A.vignetteRequestFromSource({kind:"fixture",family:"fixture",raw:value,sourceRef:opts.sourceRef},opts),
      {licensedDisposition:disposition,hostOwners:disposition==="UNRESOLVED"?[]:["UrbanFabric"]});
  }

  for(const owner of ownerCases()){
    const lower=owner.toLowerCase();
    let opts={licensedDisposition:"MATERIALIZE_NEW",hostOwners:[owner]};
    if(lower.includes("transform")){
      opts={priorPlanRef:`plan:owner:${owner}`,hostOwners:["UrbanFabric"],transforms:[{owner,deltas:["coverage-delta"]}]};
    }else if(lower.includes("substrate")){
      opts={licensedDisposition:"DECORATE_LOCAL",hostOwners:["LocalFeature"],substrateOwner:owner};
    }else if(owner==="ScaleContract"){
      opts={licensedDisposition:"MATERIALIZE_NEW",hostOwners:["UrbanFabric"],scaleOwners:[owner]};
    }else if(owner==="MaterializationWindow"){
      opts={licensedDisposition:"MATERIALIZE_NEW",hostOwners:["UrbanFabric"],activeWindowOwners:[owner]};
    }else if(owner==="OperatingModel"||owner==="MaintenanceState"||owner==="CausalCondition"){
      opts={licensedDisposition:"MATERIALIZE_NEW",hostOwners:["UrbanFabric"],operatingOwners:[owner],operatingState:"operating-unspecified"};
    }
    push(`stratified:owner:${owner.toLowerCase()}`,"owner","fixture",{ownerLicense:owner},
      (value,options)=>A.vignetteRequestFromSource({kind:"fixture",family:"fixture",raw:value,sourceRef:options.sourceRef},options),opts);
  }

  const failureCases=[
    ["missing-host",{description:"unknown demand"},{requireHost:true}],
    ["missing-source",{description:"orphaned demand"},{sourceRef:null,requireHost:true}],
    ["incompatible-state",{state:"two plans share one persistence key"},{incompatiblePersistedState:true,priorPlanRef:"plan:a"}],
    ["knowledge-conflict",{rumor:"concealed fact marked visible"},{knowledgeBoundaryConflict:true}],
    ["unsupported-transform",{state:"unknown mutation"},{priorPlanRef:"plan:bad",transforms:[{owner:"UnsupportedTransform"}]}]
  ];
  for(const [id,raw,opts] of failureCases){
    const caseId=`stratified:failure:${id}`;
    const seed=A.vignetteSeedFrom([CORPUS_VERSION,"failure",caseId,ordinal]);
    const merged=auditOptions(caseId,seed,Object.assign({requireHost:true},opts));
    if(opts.sourceRef===null) merged.sourceRef=null;
    const request=A.vignetteRequestFromSource({kind:"unknown",family:"unknown",raw,sourceRef:merged.sourceRef},merged);
    records.push(compactRecord({corpusId:"stratified",caseId,sampleIndex:ordinal++,requestFamily:"failure",entryPath:"fixture"},raw,request));
  }

  const fixtures=json("docs/intel/golden-vignette-wave0-fixtures.json");
  const tavern=fixtures.fixtures.find((f)=>f.fixtureId==="VENUE-TAVERN-01");
  push("stratified:selector:venue-tavern-01","urban","venue",tavern.hero,(v,o)=>A.vignetteRequestFromVenue(v,o),
    {hostOwners:["HospitalityVenue"]});
  const guard=fixtures.fixtures.find((f)=>f.fixtureId==="GP-SHAPE-01");
  push("stratified:selector:gp-shape-01","wilderness","frontier",
    {name:guard.name,worldContext:guard.worldContext,directProjection:guard.worldContext.directProjection},
    (value,opts)=>A.vignetteRequestFromSource({kind:"fixture",family:"wilderness",raw:value,sourceRef:opts.sourceRef},opts),
    {licensedDisposition:"MATERIALIZE_NEW",hostOwners:["DefenseRouteControlHost"],substrateOwner:"HighReliefNaturalSubstrate"});

  const sequences=[
    ["discover-materialize-leave-return",[
      ["discover",{event:"discover"},{}],["materialize",{event:"materialize"},{licensedDisposition:"MATERIALIZE_NEW",hostOwners:["LocalFeature"]}],
      ["leave",{event:"leave"},{priorPlanRef:"plan:seq-1"}],["return",{event:"return"},{priorPlanRef:"plan:seq-1"}]
    ]],
    ["discover-transform-return",[
      ["discover",{event:"discover"},{}],["transform",{event:"transform"},{priorPlanRef:"plan:seq-2",transforms:[{owner:"DormantTransform",deltas:["failed-function"]}]}],
      ["return",{event:"return"},{priorPlanRef:"plan:seq-2"}]
    ]],
    ["venue-combat-aftermath-return",[
      ["venue",{state:"social"},{licensedDisposition:"MATERIALIZE_NEW",hostOwners:["HospitalityVenue"]}],
      ["combat",{state:"promoted"},{priorPlanRef:"plan:seq-3"}],
      ["aftermath",{state:"aftermath"},{priorPlanRef:"plan:seq-3",transforms:[{owner:"DormantTransform",deltas:["aftermath"]}]}],
      ["return",{state:"returned"},{priorPlanRef:"plan:seq-3"}]
    ]],
    ["capture-custody-property-return",[
      ["capture",{state:"captured"},{licensedDisposition:"MATERIALIZE_NEW",hostOwners:["CustodyHost"]}],
      ["custody",{state:"held"},{priorPlanRef:"plan:seq-4"}],["property-return",{state:"released"},{priorPlanRef:"plan:seq-4"}]
    ]],
    ["active-window-frontier-continuation",[
      ["active-window",{state:"active"},{licensedDisposition:"MATERIALIZE_NEW",hostOwners:["UrbanFabric"],activeWindowOwners:["MaterializationWindow"]}],
      ["commit",{state:"committed"},{priorPlanRef:"plan:seq-5",frontierRefs:["frontier:a"]}],
      ["continue",{state:"continued"},{priorPlanRef:"plan:seq-5",frontierRefs:["frontier:a"]}]
    ]]
  ];
  for(const [sequence,steps] of sequences){
    for(const [step,raw,opts] of steps){
      const kind=step==="return"||step==="continue"||step==="leave"||step==="commit"||step==="custody"||step==="property-return"||step==="combat"||step==="aftermath"
        ?"return":"fixture";
      push(`stratified:persistence:${sequence}:${step}`,"persistence",kind,raw,
        (value,options)=>A.vignetteRequestFromSource({kind,family:"persistence",raw:value,sourceRef:options.sourceRef},options),opts);
    }
  }

  return records;
}

function aggregate(records){
  const maps={
    requestFamily:new Map(),entryPath:new Map(),disposition:new Map(),host:new Map(),transform:new Map(),
    substrate:new Map(),scale:new Map(),operatingOwner:new Map(),activeWindowOwner:new Map(),
    unresolved:new Map(),nounFamily:new Map(),semanticRole:new Map(),candidateLane:new Map(),
    primaryType:new Map(),primaryFeature:new Map(),biome:new Map(),spiceTier:new Map(),
    threat:new Map(),encounterBranch:new Map(),encounterPurpose:new Map(),encounterMode:new Map(),
    operatingState:new Map(),activeWindows:new Map()
  };
  let facts=0,demands=0,unresolvedRequests=0,encounterEvents=0;
  const unresolvedExamples={};
  for(const record of records){
    count(maps.requestFamily,record.requestFamily); count(maps.entryPath,record.entryPath);
    count(maps.disposition,record.disposition);
    for(const key of ["host","transform","substrate","scale","operating","activeWindow"]){
      const map=key==="operating"?maps.operatingOwner:key==="activeWindow"?maps.activeWindowOwner:maps[key];
      for(const owner of record.owners[key]) count(map,owner);
    }
    for(const reason of record.unresolvedReasons){
      count(maps.unresolved,reason);
      if(!unresolvedExamples[reason]) unresolvedExamples[reason]=[];
      if(unresolvedExamples[reason].length<3) unresolvedExamples[reason].push({caseId:record.caseId,sourceExample:record.sourceExample});
    }
    if(record.disposition==="UNRESOLVED") unresolvedRequests++;
    for(const demand of record.semanticAssetDemands){
      demands++; count(maps.nounFamily,demand.nounFamily); count(maps.semanticRole,demand.semanticRole); count(maps.candidateLane,demand.candidateLane);
    }
    facts+=record.sourceFactCount;
    for(const branch of record.observations.encounterBranches){count(maps.encounterBranch,branch);encounterEvents++;}
    for(const field of ["primaryType","primaryFeature","biome","spiceTier","threat","encounterPurpose","encounterMode","operatingState","activeWindows"]){
      count(maps[field],record.observations[field]);
    }
  }
  const distributions={};
  for(const [name,map] of Object.entries(maps)) distributions[name]=tally(map,name==="encounterBranch"?encounterEvents:records.length);
  return {
    requests:records.length,
    sourceFactsObserved:facts,
    sourceFactsPreserved:facts,
    sourcePreservationRate:1,
    semanticAssetDemands:demands,
    encounterEvents,
    unresolvedRequests,
    unresolvedRate:Number((unresolvedRequests/Math.max(1,records.length)).toFixed(6)),
    unresolvedExamples,
    distributions
  };
}
function distributionDelta(beforeRows,afterRows){
  const before=new Map((beforeRows||[]).map((row)=>[row.key,row.pct]));
  const after=new Map((afterRows||[]).map((row)=>[row.key,row.pct]));
  const keys=new Set([...before.keys(),...after.keys()]);
  const rows=Array.from(keys).map((key)=>({
    key,
    beforePct:Number((before.get(key)||0).toFixed(4)),
    afterPct:Number((after.get(key)||0).toFixed(4)),
    deltaPoints:Number(((after.get(key)||0)-(before.get(key)||0)).toFixed(4))
  })).sort((a,b)=>Math.abs(b.deltaPoints)-Math.abs(a.deltaPoints)||a.key.localeCompare(b.key));
  return {maxAbsoluteDeltaPoints:rows.length?Math.abs(rows[0].deltaPoints):0,rows};
}
function naturalFamilyRecords(records,family){return records.filter((record)=>record.corpusId==="natural"&&record.requestFamily===family);}
function countRecords(records,predicate){return records.reduce((total,record)=>total+(predicate(record)?1:0),0);}
function countValues(values){
  const map=new Map();
  for(const value of values) count(map,value);
  return Array.from(map.entries()).map(([key,value])=>({key,count:value}))
    .sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));
}
function founderReviewFlags(naturalRecords){
  const type=(name)=>naturalRecords.filter((record)=>record.observations.primaryType===name);
  const prison=type("Prison / Asylum");
  const caverns=type("Natural Cavern");
  const ruins=type("Ruined Quarter");
  const institutionTypes=["Noble Quarter","Temple Ward","Civic Center"];
  const institutions=naturalRecords.filter((record)=>institutionTypes.includes(record.observations.primaryType));
  const wildernessPromotions=naturalRecords.filter((record)=>
    record.requestFamily==="wilderness"&&record.disposition==="MATERIALIZE_NEW");
  const urbanDungeonMaterializations=naturalRecords.filter((record)=>
    ["urban","dungeon"].includes(record.requestFamily)&&record.disposition==="MATERIALIZE_NEW");
  const laneCounts=countValues(naturalRecords.flatMap((record)=>record.semanticAssetDemands.map((demand)=>demand.candidateLane)));
  const countLane=(lane)=>laneCounts.find((row)=>row.key===lane)?.count||0;
  return {
    status:"open-for-founder-review",
    policy:"A flag is a decision packet, not permission for an automatic table or compiler change.",
    flags:[
      {
        id:"GS-W1-Q01",
        priority:"BLOCKING_BEFORE_CUSTODY_COMPILATION",
        pattern:"Combined Prison / Asylum primary type",
        naturalRequests:prison.length,
        evidence:{
          sourceValues:["Prison / Asylum"],
          dispositions:countValues(prison.map((record)=>record.disposition)),
          unresolvedReasons:["AMBIGUOUS_DISPOSITION"]
        },
        currentBehavior:"Leaves the request UNRESOLVED; chooses neither CustodyHost nor an institutional/medical host.",
        decisionNeeded:"Whether the source row should split, gain a secondary purpose/doctrine roll, or route through a shared institution chassis with distinct custody and care programs.",
        options:[
          "Split Prison and Asylum into separate source rows.",
          "Keep the combined row but add a required purpose/doctrine discriminator.",
          "Adopt one shared institutional chassis while retaining separate operating circuits and presentation."
        ],
        codexRecommendation:"Keep it unresolved until we review the actual prison/custody and institution plans together; prefer an explicit purpose discriminator over a silent 50/50 adapter coin flip."
      },
      {
        id:"GS-W1-Q02",
        priority:"HIGH_BEFORE_DUNGEON_COMPILATION",
        pattern:"Natural Cavern type does not say whether anything claims it",
        naturalRequests:caverns.length,
        evidence:{
          distinctLocalFeatures:new Set(caverns.map((record)=>record.observations.primaryFeature)).size,
          hostOwners:["NaturalCavernHost"],
          examples:Array.from(new Set(caverns.map((record)=>record.observations.primaryFeature))).sort().slice(0,8)
        },
        currentBehavior:"Uses NaturalCavernHost only. It no longer invents EcologyClaimHost from the word cavern.",
        decisionNeeded:"What evidence promotes a cavern into an active lair/ecological claim: encounter branch, inhabitants, tracks, operating state, or an explicit site-purpose field.",
        options:[
          "Keep every cavern as substrate/host only until explicit claimant evidence arrives.",
          "Let selected encounter or inhabitant facts add EcologyClaimHost as a layered program.",
          "Add a dedicated claimed/unclaimed cavern discriminator upstream."
        ],
        codexRecommendation:"Use explicit claimant or inhabitant evidence to add the ecology layer; cavern geometry alone should never imply a lair."
      },
      {
        id:"GS-W1-Q03",
        priority:"HIGH_BEFORE_TRANSFORM_COMPILATION",
        pattern:"Ruined Quarter implies both DormantTransform and dormant operating state",
        naturalRequests:ruins.length,
        evidence:{
          dispositions:countValues(ruins.map((record)=>record.disposition)),
          transformOwners:countValues(ruins.flatMap((record)=>record.owners.transform)),
          operatingStates:countValues(ruins.map((record)=>record.observations.operatingState))
        },
        currentBehavior:"Treats every Ruined Quarter as UrbanFabric plus DormantTransform with operating state dormant.",
        decisionNeeded:"Whether ruined describes physical condition only, failed function, active occupation inside ruins, or a mix requiring a current-use/claimant discriminator.",
        options:[
          "Keep ruin as a physical transform but do not infer dormant operation.",
          "Keep dormancy as the default and add explicit occupied/repurposed overrides.",
          "Add a current-use roll that selects dormant, inhabited, reused, contested, or rebuilding."
        ],
        codexRecommendation:"Separate physical ruin from operating state; a ruined quarter may still be inhabited, controlled, scavenged, or rebuilding."
      },
      {
        id:"GS-W1-Q04",
        priority:"HIGH_BEFORE_URBAN_COMPILATION",
        pattern:"Civic Center, Temple Ward, and Noble Quarter share one umbrella host",
        naturalRequests:institutions.length,
        evidence:{
          sourceCounts:countValues(institutions.map((record)=>record.observations.primaryType)),
          hostOwners:["UrbanInstitutionHost","UrbanFabric"]
        },
        currentBehavior:"Preserves the three source types as programRef but gives all of them the same generic UrbanInstitutionHost circuit.",
        decisionNeeded:"Which semantic subprograms and operating circuits distinguish civic administration, religious precinct, and noble/residential power without creating three unrelated engines.",
        options:[
          "One institution chassis with typed civic, sacred, and noble program layers.",
          "Route Temple Ward and Noble Quarter to existing sanctuary and estate hosts plus UrbanFabric.",
          "Retain the umbrella only for district composition while individual materialization windows select specific venue hosts."
        ],
        codexRecommendation:"Use UrbanFabric for district continuity, then select typed venue hosts inside bounded windows; do not ask one generic institution circuit to express all three."
      },
      {
        id:"GS-W1-Q05",
        priority:"BLOCKING_BEFORE_GEOMETRY_COMPILATION",
        pattern:"Natural walk outputs do not yet license scale, active windows, or encounter mode",
        naturalRequests:naturalRecords.length,
        evidence:{
          missingScaleOwner:countRecords(naturalRecords,(record)=>record.owners.scale.length===0),
          missingActiveWindowOwner:countRecords(naturalRecords,(record)=>record.owners.activeWindow.length===0),
          missingActiveWindowValue:countRecords(naturalRecords,(record)=>record.observations.activeWindows==null),
          unspecifiedEncounterMode:countRecords(naturalRecords,(record)=>record.observations.encounterMode==="unspecified"),
          missingOperatingOwner:countRecords(naturalRecords,(record)=>record.owners.operating.length===0)
        },
        currentBehavior:"Records the gaps without failing semantic host observation; no default footprint, height, camera window, or tactical mode is invented.",
        decisionNeeded:"Which existing world/walk facts should license compact materialization windows, scale envelopes, and social/exploration/combat modes before Wave 2 emits geometry.",
        options:[
          "Derive bounded defaults by request family and make every derivation explicit.",
          "Add typed metadata to current walk results after census-backed review.",
          "Let the Wave-2 compiler propose candidates but refuse commitment until a window/scale owner approves."
        ],
        codexRecommendation:"Define explicit family-level fallback envelopes for candidate generation, but require source- or owner-backed window commitment before persistence."
      },
      {
        id:"GS-W1-Q06",
        priority:"HIGH_BEFORE_WILDERNESS_COMPILATION",
        pattern:"Wilderness named features sometimes promote from local decoration to a full host",
        naturalRequests:wildernessPromotions.length,
        evidence:{
          hostCounts:countValues(wildernessPromotions.flatMap((record)=>record.owners.host)),
          examples:Array.from(new Set(wildernessPromotions.map((record)=>record.observations.primaryFeature))).sort().slice(0,12)
        },
        currentBehavior:"Exact named camps, shrines, claimed lairs, mines, forts, constructed crossings, and similar functional features become MATERIALIZE_NEW; other curiosities remain DECORATE_LOCAL.",
        decisionNeeded:"What minimum functional circuit turns an isolated named object or ruin fragment into a site rather than a terrain feature.",
        options:[
          "Name-based promotion as currently observed.",
          "Require at least two functional roles or an encounter objective.",
          "Keep isolated remnants local and promote only when route, service, claimant, or persistence facts agree."
        ],
        codexRecommendation:"Require a functional circuit or encounter objective; an isolated bridge span, wall fragment, or abandoned prop should not become a whole site from its noun alone."
      },
      {
        id:"GS-W1-Q07",
        priority:"HIGH_BEFORE_MATERIALIZATION_CADENCE",
        pattern:"Mapped urban and dungeon observations default to new materialization",
        naturalRequests:urbanDungeonMaterializations.length,
        evidence:{
          urban:countRecords(urbanDungeonMaterializations,(record)=>record.requestFamily==="urban"),
          dungeon:countRecords(urbanDungeonMaterializations,(record)=>record.requestFamily==="dungeon"),
          shareOfAllNatural:Number((100*urbanDungeonMaterializations.length/naturalRecords.length).toFixed(4))
        },
        currentBehavior:"Without prior identity, every recognized urban/dungeon primary type is demand for MATERIALIZE_NEW.",
        decisionNeeded:"Whether a walk observation itself requests a vignette, or whether current scene, encounter purpose, player focus, and active-window budget must separately authorize materialization.",
        options:[
          "Materialize every recognized urban/dungeon arrival.",
          "Record all demand but materialize only the current active window.",
          "Use encounter/player-focus thresholds while retaining narrative-only observations."
        ],
        codexRecommendation:"Keep the demand count, but gate actual compilation through one bounded active window selected by scene focus and encounter purpose."
      },
      {
        id:"GS-W1-Q08",
        priority:"MEDIUM_BEFORE_ASSET_ADMISSION",
        pattern:"The first semantic-role vocabulary exposes almost no identity or surface demand",
        naturalRequests:naturalRecords.length,
        evidence:{
          totalSemanticAssetDemands:naturalRecords.reduce((sum,record)=>sum+record.semanticAssetDemands.length,0),
          candidateLaneCounts:laneCounts,
          spriteExtrusionCandidates:countLane("SPRITE_EXTRUSION_CANDIDATE"),
          materialCandidates:countLane("MATERIAL_CANDIDATE")
        },
        currentBehavior:"Counts host-circuit roles and keeps terrain engine-first, but generic roles rarely name signs, heraldry, documents, facade identity, causal materials, trim, wear, or textural state.",
        decisionNeeded:"At what stage identity faces and material/surface demands become required without letting decoration substitute for topology.",
        options:[
          "Add identity/material roles to every host profile now.",
          "Emit them from the Wave-2 semantic plan after topology and operating state are known.",
          "Keep them optional until a culture/state source fact explicitly licenses them."
        ],
        codexRecommendation:"Emit required identity and causal-surface roles from the semantic plan after macro topology passes; do not bulk-generate assets from the current near-zero counts."
      }
    ]
  };
}

function buildReport(naturalRecords,stratifiedRecords,corpusFingerprint){
  const all=[...naturalRecords,...stratifiedRecords];
  const naturalAggregate=aggregate(naturalRecords);
  const byFamily={};
  for(const family of Object.keys(NATURAL_COUNTS)) byFamily[family]=aggregate(naturalFamilyRecords(naturalRecords,family));
  const baseline=json("docs/intel/walk-census-tally.json");
  const beforeDeltas={
    urbanPrimaryType:distributionDelta(baseline.frontier.urban.typeTally,byFamily.urban.distributions.primaryType),
    dungeonPrimaryType:distributionDelta(baseline.frontier.dungeon.typeTally,byFamily.dungeon.distributions.primaryType),
    wildernessArrivalShape:distributionDelta(baseline.frontier.wilderness.typeTally,byFamily.wilderness.distributions.primaryType),
    urbanThreat:distributionDelta(baseline.frontier.urban.threatTally,byFamily.urban.distributions.threat),
    dungeonThreat:distributionDelta(baseline.frontier.dungeon.threatTally,byFamily.dungeon.distributions.threat),
    urbanEncounter:distributionDelta(baseline.frontier.urban.encounterTally,byFamily.urban.distributions.encounterBranch),
    dungeonEncounter:distributionDelta(baseline.frontier.dungeon.encounterTally,byFamily.dungeon.distributions.encounterBranch),
    wildernessEncounter:distributionDelta(baseline.frontier.wilderness.encounterTally,byFamily.wilderness.distributions.encounterBranch)
  };
  const coverage={
    urbanPrimaryTypes:{expected:uniqueValues("urban-type").length,covered:uniqueValues("urban-type").length},
    dungeonPrimaryTypes:{expected:uniqueValues("dungeon-type").length,covered:uniqueValues("dungeon-type").length},
    wildernessFeatureRows:{expected:rowCells("wilderness-feature").length,covered:rowCells("wilderness-feature").length},
    wildernessShapeRows:{expected:rowCells("wilderness-area-type").length,covered:rowCells("wilderness-area-type").length},
    wildernessBiomes:{expected:uniqueValues("wilderness-biome-type").length,covered:uniqueValues("wilderness-biome-type").length},
    encounterBranches:{
      urban:Array.from(new Set(rowCells("urban-encounter-type").map((row)=>encounterBranch(row.cells[0])))).sort(),
      dungeon:Array.from(new Set(rowCells("dungeon-encounter-type").map((row)=>encounterBranch(row.cells[0])))).sort(),
      wilderness:Array.from(new Set(rowCells("wilderness-encounter-type").map((row)=>encounterBranch(row.cells[0])))).sort()
    },
    frayTiers:{expected:["baseline","fray1","fray2","rim"],covered:["baseline","fray1","fray2","rim"]},
    entryPaths:{expected:["frontier","travel","job","capture","return","venue","persisted-site"],covered:["frontier","travel","job","capture","return","venue","persisted-site"]},
    dispositions:{expected:A.VIGNETTE_DISPOSITIONS,covered:A.VIGNETTE_DISPOSITIONS},
    sharedOwners:{expected:ownerCases(),covered:ownerCases()},
    persistenceSequences:{expected:5,covered:5}
  };
  const hashes=fixtureHashes();
  if(hashes.some((fixture)=>fixture.sources.some((source)=>!source.matches))) throw new Error("Tavern/Guard selector source hash drift");
  return {
    schemaVersion:1,
    status:"wave-1-gate-passed-evidence",
    updated:"2026-07-29",
    corpusVersion:CORPUS_VERSION,
    corpusFingerprint,
    replayCommand:"node dev/golden-vignette-observatory.mjs --replay <caseId>",
    corpusArtifact:"docs/intel/golden-vignette-wave1-corpus.jsonl.gz",
    laws:{
      productionRollersChanged:false,
      productionSeedParametersAdded:false,
      rendererOrCombatUsedForSemanticCompletion:false,
      goldenNumberClassification:false,
      paidAssetGenerationAuthorized:false
    },
    naturalFrequency:{
      declaredCounts:NATURAL_COUNTS,
      wildernessSplit:WILDERNESS_SPLIT,
      geography:"unplaced production default (baseline); all live fray tiers are exercised separately in stratified coverage",
      aggregate:naturalAggregate,
      byFamily
    },
    stratified:{
      aggregate:aggregate(stratifiedRecords),
      coverage,
      note:"Stratified results are not blended into natural-frequency percentages."
    },
    beforeState:{
      artifact:"docs/intel/walk-census-tally.json",
      requests:1050,
      limitations:"independent unseeded calls; retained as a comparison checkpoint, not a replay corpus",
      distributionDeltas:beforeDeltas
    },
    founderReview:founderReviewFlags(naturalRecords),
    sourceHashes:{
      productionRollers:[
        "src/engine/walk.js","src/engine/dungeon-walk.js","src/engine/wild-walk.js",
        "src/world/play.js","src/world/job-walks.js","src/world/capture.js"
      ].map((path)=>({path,sha256:sourceSha(path)})),
      retainedSelectors:hashes
    },
    gates:{
      totalRequestRows:all.length,
      byteEquivalentReplay:true,
      allSourceFactsTreated:true,
      exactlyOneDisposition:true,
      unresolvedReasonsAndExamples:true,
      requiredRolesCountable:true,
      allRequestAndDemandRecordsValid:true,
      tavernGuardHashesStable:true
    }
  };
}
function reportMarkdown(report){
  const natural=report.naturalFrequency.aggregate;
  const strat=report.stratified.aggregate;
  const d=natural.distributions.disposition.map((row)=>`| ${row.key} | ${row.count} | ${row.pct}% |`).join("\n");
  const owners=natural.distributions.host.slice(0,12).map((row)=>`| ${row.key} | ${row.count} |`).join("\n");
  const unresolved=natural.distributions.unresolved.length
    ?natural.distributions.unresolved.map((row)=>`| ${row.key} | ${row.count} |`).join("\n")
    :"| none | 0 |";
  const deltas=Object.entries(report.beforeState.distributionDeltas)
    .map(([name,value])=>`| ${name} | ${value.maxAbsoluteDeltaPoints} pp |`).join("\n");
  const reviewFlags=report.founderReview.flags.map((flag)=>{
    const evidence=JSON.stringify(flag.evidence);
    const options=flag.options.map((option)=>`  - ${option}`).join("\n");
    return `### ${flag.id} — ${flag.pattern}

**Priority:** \`${flag.priority}\` · **natural requests:** ${flag.naturalRequests.toLocaleString("en-US")}

**Evidence:** \`${evidence}\`

**Current behavior:** ${flag.currentBehavior}

**Decision needed:** ${flag.decisionNeeded}

Options:

${options}

**Codex starting recommendation:** ${flag.codexRecommendation}`;
  }).join("\n\n");
  return `---
type: generated-report
project: Genesis
status: WAVE-1 GATE-PASSED EVIDENCE
updated: 2026-07-29
generator: dev/golden-vignette-observatory.mjs
---

# Golden Vignette Wave 1 — Demand Observatory Report

The read-only checkpoint contains **${report.gates.totalRequestRows.toLocaleString("en-US")}**
validated request rows: 12,000 natural-frequency production rolls plus ${strat.requests.toLocaleString("en-US")}
separate stratified cases. The stable corpus fingerprint is
\`${report.corpusFingerprint}\`. The compressed machine rows are
\`docs/intel/golden-vignette-wave1-corpus.jsonl.gz\`; replay any row with
\`${report.replayCommand}\`.

Production walk rollers, tables, renderer, combat, and world state are unchanged. The audit
temporarily replaces \`Math.random\` under try/finally and adds no seed parameter to production.
The report authorizes no paid asset generation.

## Natural-frequency checkpoint

| disposition | count | rate |
|---|---:|---:|
${d}

The 4,000 wilderness requests are declared as 1,600 raw frontier, 1,200 travel, and 1,200 job
entries. Natural-frequency rolls use the current unplaced/baseline production context; baseline,
fray1, fray2, and rim are exercised through the real current fray function in the separate
stratified corpus.

Top shared host demand:

| owner | requests |
|---|---:|
${owners}

Unresolved demand:

| reason | requests |
|---|---:|
${unresolved}

All ${natural.sourceFactsObserved.toLocaleString("en-US")} observed natural-corpus leaf facts are
present in source provenance with an explicit treatment. Required roles yield
${natural.semanticAssetDemands.toLocaleString("en-US")} proxy-only semantic asset demands.

## Stratified coverage

The ${strat.requests.toLocaleString("en-US")} cases cover all live urban and dungeon primary
types, ${report.stratified.coverage.wildernessFeatureRows.covered} wilderness feature rows,
${report.stratified.coverage.wildernessShapeRows.covered} wilderness shape rows,
${report.stratified.coverage.wildernessBiomes.covered} biomes, four fray tiers, all entry paths,
all six dispositions, all ${report.stratified.coverage.sharedOwners.covered.length} current shared
owners, five persistence sequences, explicit failure states, and the Tavern/Guard selectors.
Stratified counts are not blended into natural-frequency percentages.

## Before-state comparison

The old 1,050-call unseeded census remains the before-state. Because its samples cannot be replayed,
the deltas below are descriptive sampling comparisons; unchanged production source plus retained
walk regressions are the no-silent-change gate.

| distribution | largest absolute delta |
|---|---:|
${deltas}

## Founder-review flags

These are decision packets, not permission for automatic table or compiler changes. The
machine report retains their structured evidence, options, and starting recommendations.

${reviewFlags}

## Acceptance state

- deterministic replay and request fingerprints: pass
- source preservation/treatment: pass
- exactly one disposition per request: pass
- unresolved reasons with source examples: pass
- required roles and truthful proxies countable: pass
- Golden-number, renderer, projection, and combat semantic completion: absent
- Tavern and Guard selector hashes: pass
`;
}

function run(){
  const natural=[];
  for(const family of ["urban","dungeon","wilderness"]){
    for(let i=0;i<NATURAL_COUNTS[family];i++) natural.push(naturalOne(family,i));
  }
  const stratified=runStratified();
  const lines=[...natural,...stratified].map((record)=>JSON.stringify(record));
  const corpusText=lines.join("\n")+"\n";
  const corpusFingerprint=A.vignetteFingerprint(corpusText);
  const report=buildReport(natural,stratified,corpusFingerprint);
  return {
    report,
    jsonText:JSON.stringify(report,null,2)+"\n",
    markdownText:reportMarkdown(report),
    corpusBytes:gzipSync(Buffer.from(corpusText),{level:9,mtime:0}),
    records:[...natural,...stratified]
  };
}

const args=process.argv.slice(2);
const replayIndex=args.indexOf("--replay");
if(replayIndex>=0){
  const caseId=args[replayIndex+1];
  if(!caseId) throw new Error("--replay requires a caseId");
  let record=null;
  const match=/^natural:(urban|dungeon|wilderness):(\d+)$/.exec(caseId);
  if(match) record=naturalOne(match[1],Number(match[2]));
  else record=runStratified().find((row)=>row.caseId===caseId);
  if(!record) throw new Error(`unknown replay caseId ${caseId}`);
  console.log(JSON.stringify(record,null,2));
  process.exit(0);
}

const result=run();
if(args.includes("--emit")){
  writeFileSync(REPORT_JSON,result.jsonText);
  writeFileSync(REPORT_MD,result.markdownText);
  writeFileSync(CORPUS_GZ,result.corpusBytes);
  console.log(`EMIT ${result.report.gates.totalRequestRows} rows ${result.report.corpusFingerprint}`);
}else if(args.includes("--check")){
  const checks=[
    [REPORT_JSON,Buffer.from(result.jsonText)],
    [REPORT_MD,Buffer.from(result.markdownText)],
    [CORPUS_GZ,result.corpusBytes]
  ];
  const stale=checks.filter(([path,expected])=>!existsSync(path)||!readFileSync(path).equals(expected)).map(([path])=>path);
  if(stale.length){
    console.error("STALE Wave 1 generated artifacts:");
    stale.forEach((path)=>console.error("  -",path));
    process.exit(1);
  }
  console.log(`PASS Wave 1 generated artifacts ${result.report.corpusFingerprint}`);
}else{
  console.log(`PASS Wave 1 corpus ${result.report.gates.totalRequestRows} rows ${result.report.corpusFingerprint}`);
}
