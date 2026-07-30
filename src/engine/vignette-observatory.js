/* GENESIS MODULE — src/engine/vignette-observatory.js
   Golden Site Wave 1 read-only story-to-space boundary.

   This module normalizes existing story/walk state into VignetteRequestV1, classifies semantic
   demand, and emits proxy-only SemanticAssetDemandV1 records. It does not roll content, generate
   geometry, write world state, inspect the renderer, or choose production assets. Audit randomness
   is isolated behind vignetteWithAuditRandom; production roller APIs remain unchanged. */

const VIGNETTE_SCHEMA_VERSION = 1;
const VIGNETTE_ADAPTER_VERSION = "vignette-observatory/1";
const VIGNETTE_DISPOSITIONS = Object.freeze([
  "MATERIALIZE_NEW",
  "CONTINUE_EXISTING",
  "TRANSFORM_EXISTING",
  "DECORATE_LOCAL",
  "NARRATIVE_ONLY",
  "UNRESOLVED"
]);
const VIGNETTE_SOURCE_TREATMENTS = Object.freeze([
  "HARD_CANON",
  "ARRANGEABLE_CANON",
  "DERIVED_SUPPORT",
  "OPTIONAL_CONTEXT"
]);
const VIGNETTE_UNRESOLVED_REASONS = Object.freeze([
  "MISSING_HOST_PROGRAM",
  "MISSING_OPERATING_MODEL",
  "MISSING_SUBSTRATE",
  "MISSING_SCALE_RELATION",
  "MISSING_SOURCE_PROVENANCE",
  "AMBIGUOUS_DISPOSITION",
  "UNSUPPORTED_TRANSFORM",
  "UNSUPPORTED_LOCAL_FEATURE",
  "UNSUPPORTED_REQUIRED_ROLE",
  "INCOMPATIBLE_PERSISTED_STATE",
  "KNOWLEDGE_BOUNDARY_CONFLICT",
  "BUDGET_UNREPRESENTABLE"
]);

const VGO_REQUIRED_REQUEST_FIELDS = Object.freeze([
  "schemaVersion", "requestId", "seedNamespace", "sourceProvenance", "worldContext",
  "walkContext", "siteIdentity", "hostProgram", "operatingModel", "substratePlan",
  "scaleContract", "transformStack", "materializationIntent", "encounterIntent",
  "actors", "knowledge", "budgets"
]);
const VGO_REQUIRED_DEMAND_FIELDS = Object.freeze([
  "schemaVersion", "demandId", "planRef", "sourceFactRefs", "semanticRole", "nounFamily",
  "requiredState", "physicalEnvelope", "supportAndMount", "interactions", "tactical",
  "appearance", "routeConstraints", "priority", "fallbackPolicy"
]);

/* Shared owners and their minimum semantic circuits. These are runtime vocabulary, never Golden
   Site ids. A missing visual asset does not erase a role: every required role becomes demand. */
const VGO_HOST_ROLES = Object.freeze({
  DefenseRouteControlHost:["controlled-route", "threshold", "observation", "support-room", "high-ground", "flank", "retreat"],
  DefenseFortificationHost:["approach", "gate", "wall-route", "observation", "support-room", "service", "retreat"],
  TransientServiceHost:["route-edge", "center", "shelter", "service", "water", "waste", "watch", "departure"],
  CommunalInstitutionHost:["court", "shared-space", "service", "ritual-head", "processional-route", "secondary-access"],
  ExtractionWorkHost:["source", "haul-route", "process", "store", "service", "failure", "recovery"],
  WorkshopProductionHost:["work-floor", "material-input", "process", "store", "service", "egress"],
  InfrastructureWorksHost:["service-route", "works", "access", "maintenance", "support", "egress"],
  CustodyHost:["intake", "holding", "keeper-oversight", "property", "service", "release", "transfer", "escape"],
  EcologyClaimHost:["origin", "body-scaled-mouth", "claim", "nest", "floor-route", "ledge-route", "bolt-hole", "short-exit", "causal-light"],
  NaturalCavernHost:["mouth", "floor-route", "ledge-route", "chamber", "short-exit", "causal-light"],
  UrbanInstitutionHost:["frontage", "public-circuit", "service-circuit", "street-continuity", "egress"],
  HospitalityEntertainmentVenue:["arrival", "public-common", "service-edge", "supply-waste", "egress", "responsible-host"],
  HospitalityVenue:["arrival", "public-common", "service-edge", "supply-waste", "egress", "responsible-host"],
  ServiceInfrastructureHost:["approach", "service-route", "transfer-edge", "support", "maintenance", "egress"],
  FuneraryMortuaryHost:["arrival", "threshold", "mortuary-service", "ritual-route", "holding", "egress"],
  ReligiousSanctuaryHost:["arrival", "ritual-focus", "assembly", "service", "secondary-access"],
  ResidentialEstateHost:["arrival", "household-circuit", "service", "private-zone", "egress"],
  LivingSubstrateHost:["support-mode", "load-route", "agency-boundary", "service", "egress"],
  MegastructureHost:["materialization-window", "approach", "primary-route", "support", "egress"],
  CivicAdministrationHost:["public-frontage", "public-circuit", "records", "service", "egress"],
  MarketExchangeHost:["street-continuity", "public-trading-ground", "service", "supply-waste", "egress"],
  UrbanFabric:["street-continuity", "frontage", "service-edge", "egress"],
  LocalFeature:["approach", "feature-envelope", "ground-contact"],
  HeroFeature:["approach", "feature-envelope", "ground-contact", "silhouette"],
  NarrativeOnly:[],
  UnresolvedHost:[]
});

function vignetteCanonicalize(value) {
  if(value === undefined) return null;
  if(value === null || typeof value !== "object") {
    if(typeof value === "number" && !Number.isFinite(value)) return String(value);
    return value;
  }
  if(Array.isArray(value)) return value.map(vignetteCanonicalize);
  const out={};
  Object.keys(value).sort().forEach(function(key){
    if(value[key] !== undefined) out[key]=vignetteCanonicalize(value[key]);
  });
  return out;
}
function vignetteStableJson(value){ return JSON.stringify(vignetteCanonicalize(value)); }
function vignetteHash32(value) {
  const text=typeof value === "string" ? value : vignetteStableJson(value);
  let hash=2166136261;
  for(let i=0;i<text.length;i++){
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function vignetteFingerprint(value){ return "vgo1-"+vignetteHash32(value).toString(16).padStart(8, "0"); }
function vignetteSeedFrom(parts){ return vignetteHash32(Array.isArray(parts)?parts.join("\u001f"):parts); }
function vignetteAuditRng(seed) {
  let a=(Number(seed)>>>0)||0x6d2b79f5;
  return function(){
    a=(a+0x6d2b79f5)>>>0;
    let t=a;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function vignetteWithAuditRandom(seed, fn) {
  if(typeof fn !== "function") throw new Error("vignetteWithAuditRandom requires a function");
  const before=Math.random;
  Math.random=vignetteAuditRng(seed);
  try { return fn(); }
  finally { Math.random=before; }
}

function vgoPathEscape(value){ return String(value).replace(/~/g,"~0").replace(/\//g,"~1"); }
function vgoLeafWalk(value, path, out) {
  if(value === null || typeof value !== "object"){
    out.push({ path:path||"/", value:value===undefined?null:value });
    return;
  }
  if(Array.isArray(value)){
    if(!value.length) out.push({path:path||"/", value:[]});
    value.forEach(function(item,index){ vgoLeafWalk(item,(path||"")+"/"+index,out); });
    return;
  }
  const keys=Object.keys(value).sort();
  if(!keys.length){ out.push({path:path||"/",value:{}}); return; }
  keys.forEach(function(key){ vgoLeafWalk(value[key],(path||"")+"/"+vgoPathEscape(key),out); });
}
function vignetteLeafFacts(source, sourceRef) {
  const leaves=[];
  vgoLeafWalk(source,"",leaves);
  const ref=sourceRef||"source:missing";
  return leaves.map(function(leaf,index){
    return { factId:ref+"#"+leaf.path, path:leaf.path, value:leaf.value, ordinal:index };
  });
}
function vgoText(value){ return value == null ? "" : typeof value === "string" ? value : vignetteStableJson(value); }
function vgoUnique(values){ return Array.from(new Set((values||[]).filter(function(v){return v!=null&&v!=="";}))); }
function vgoClone(value){ return value==null?value:JSON.parse(JSON.stringify(value)); }
function vgoSlug(value){
  return String(value||"unknown").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"unknown";
}
function vgoHas(text, pattern){ return pattern.test(String(text||"")); }
function vgoPrimaryFeature(raw) {
  const segs=raw&&Array.isArray(raw.segments)?raw.segments:[];
  const arrival=segs.find(function(s){return s&&s.isFinale;})||segs[segs.length-1]||{};
  const regular=segs.find(function(s){return s&&!s.isFinale&&s.feature;})||{};
  return {
    name:vgoText((arrival.feature&&arrival.feature.name)||arrival.areaType||(regular.feature&&regular.feature.name)||""),
    flavor:vgoText((arrival.feature&&arrival.feature.flavor)||(regular.feature&&regular.feature.flavor)||""),
    areaType:vgoText(arrival.areaType||regular.areaType||""),
    segment:arrival
  };
}
function vgoSubstrateFor(raw, opts) {
  if(opts&&opts.substrateOwner) return opts.substrateOwner;
  const biome=vgoText((opts&&opts.biome)||(raw&&raw.setup&&raw.setup.biome)||(raw&&raw.startBiome));
  const primaryType=vgoText(raw&&raw.setup&&raw.setup.type);
  const text=(biome+" "+primaryType).toLowerCase();
  if(/coast|shore|harbor|river|lake|marsh|swamp|bog|wetland|flood/.test(text)) return "WaterEdgeSubstrate";
  if(/cave|cavern|underworks|subterr|tunnel|crypt/.test(text)) return "SubterraneanSubstrate";
  if(/mountain|alpine|ridge|cliff|highland/.test(text)) return "HighReliefNaturalSubstrate";
  if(/forest|wood|jungle|grove/.test(text)) return "RootedNaturalSubstrate";
  if(/desert|dune|badland/.test(text)) return "ErodedNaturalSubstrate";
  if(biome) return "NaturalTerrainSubstrate";
  if(raw&&raw.environment==="urban") return "UrbanGroundSubstrate";
  if(raw&&raw.environment==="dungeon") return "SubterraneanSubstrate";
  return null;
}
function vgoUrbanOwners(type) {
  const t=String(type||"").toLowerCase();
  if(/entertain|hospital|tavern|inn|theater|arena/.test(t)) return ["HospitalityEntertainmentVenue","UrbanFabric"];
  if(/harbor|quay|ferry|waterfront/.test(t)) return ["ServiceInfrastructureHost","UrbanFabric"];
  if(/slum|low ward/.test(t)) return ["UrbanFabric"];
  if(/industrial|workshop|craft/.test(t)) return ["WorkshopProductionHost","UrbanFabric"];
  if(/underwork|sewer|infrastructure/.test(t)) return ["InfrastructureWorksHost","UrbanFabric"];
  if(/market|exchange/.test(t)) return ["MarketExchangeHost","UrbanFabric"];
  if(/civic|temple|noble|administr|institution/.test(t)) return ["UrbanInstitutionHost","UrbanFabric"];
  if(/ruin/.test(t)) return ["UrbanFabric"];
  return [];
}
function vgoDungeonOwners(type) {
  const t=String(type||"").toLowerCase();
  if(/crypt|mortuar|funerar|tomb/.test(t)) return ["FuneraryMortuaryHost"];
  if(/natural cavern|cave/.test(t)) return ["NaturalCavernHost"];
  if(/\blair\b/.test(t)) return ["EcologyClaimHost","NaturalCavernHost"];
  if(/military|fortif|fortress|bastion/.test(t)) return ["DefenseFortificationHost"];
  if(/infrastructure hub|sewer|aqueduct|cistern/.test(t)) return ["InfrastructureWorksHost"];
  if(/mine|quarry|extraction/.test(t)) return ["ExtractionWorkHost"];
  if(/sunken estate|estate|manor/.test(t)) return ["ResidentialEstateHost"];
  if(/religious|sanctuary|temple|monastery/.test(t)) return ["ReligiousSanctuaryHost"];
  if(/prison.*asylum|asylum.*prison/.test(t)) return [];
  if(/prison|gaol|jail|custody/.test(t)) return ["CustodyHost"];
  if(/asylum/.test(t)) return [];
  if(/laboratory|workshop/.test(t)) return ["WorkshopProductionHost"];
  if(/living hive|living/.test(t)) return ["LivingSubstrateHost"];
  if(/megastructure/.test(t)) return ["MegastructureHost"];
  return [];
}
function vgoFeatureTitle(feature) {
  return vgoText(feature&&feature.name).split(":")[0].trim().toLowerCase();
}
function vgoWildernessOwners(feature) {
  /* Classify the named feature, not arbitrary substrings in its descriptive flavor. Otherwise
     "spinning" becomes an inn, "wooden" becomes a den, "holding" becomes custody, and
     "towering" becomes a tower. Those are audit bugs, not semantic evidence. */
  const title=vgoFeatureTitle(feature);
  if(/\b(?:guard post|watchtower|checkpoint|blockhouse|barricade)\b/.test(title)) return ["DefenseRouteControlHost"];
  if(/\b(?:camp|campsite|caravan|encampment)\b/.test(title)) return ["TransientServiceHost"];
  if(/\b(?:lair|nest|den|hive|roost)\b/.test(title)) return ["EcologyClaimHost"];
  if(/\b(?:mine|quarry|workshop)\b/.test(title)) return ["ExtractionWorkHost"];
  if(/\b(?:monastery|shrine|sanctuary|temple)\b/.test(title)) return ["CommunalInstitutionHost"];
  if(/\b(?:prison|stockade|gaol|jail|detention)\b/.test(title)) return ["CustodyHost"];
  if(/\b(?:fortress|keep|gatehouse|bastion)\b/.test(title)) return ["DefenseFortificationHost"];
  if(/\b(?:aqueduct|ferry|quay|dock|canal)\b/.test(title)||
     /\b(?:stone|rope|wooden|collapsed|broken) bridge\b/.test(title)) return ["ServiceInfrastructureHost"];
  if(/\b(?:tavern|inn|hostel|market)\b/.test(title)) return ["HospitalityVenue"];
  return [];
}
function vgoOperatingOwners(raw, opts) {
  if(opts&&Array.isArray(opts.operatingOwners)) return opts.operatingOwners;
  const type=vgoText(raw&&raw.setup&&raw.setup.type).toLowerCase();
  if(/\b(?:slums?|low ward)\b/.test(type)) return ["OperatingMaintenanceState"];
  return [];
}
function vgoRequiredRoles(owners) {
  const roles=[];
  (owners||[]).forEach(function(owner){ (VGO_HOST_ROLES[owner]||[]).forEach(function(role){roles.push(role);}); });
  return vgoUnique(roles);
}
function vgoOperatingState(raw, opts, owners) {
  if(opts&&opts.operatingState) return opts.operatingState;
  const focus=vgoText((raw&&raw.setup&&raw.setup.type)||(opts&&opts.programRef));
  if(/ruin|abandon|dormant/.test(focus.toLowerCase())) return "dormant";
  if(owners&&owners.length) return "operating-unspecified";
  return "unknown";
}
function vgoTransformStack(raw, opts, sourceRef) {
  const explicit=opts&&Array.isArray(opts.transforms)?opts.transforms:[];
  const focus=vgoText((opts&&opts.transformText)||(raw&&raw.setup&&raw.setup.type)||"");
  const transforms=explicit.slice();
  if(!transforms.length && /ruin|abandon|dormant/.test(focus.toLowerCase())){
    transforms.push({transformId:"DormantTransform",owner:"DormantTransform",phase:"current",sourceRefs:[sourceRef],deltas:["licensed-dormancy"]});
  }
  return transforms.map(function(t,index){
    if(typeof t==="string") return {transformId:t,owner:t,phase:"current",sourceRefs:[sourceRef],deltas:[]};
    return {
      transformId:t.transformId||t.owner||("transform-"+(index+1)),
      owner:t.owner||t.transformId||"UnsupportedTransform",
      phase:t.phase||"current",
      sourceRefs:Array.isArray(t.sourceRefs)?t.sourceRefs:[sourceRef],
      deltas:Array.isArray(t.deltas)?t.deltas:[]
    };
  });
}

function vignetteClassify(source, opts) {
  source=source||{};
  opts=opts||{};
  const raw=source.raw||{};
  const kind=source.kind||opts.kind||"raw-walk";
  const family=source.family||raw.environment||opts.family||"unknown";
  const feature=vgoPrimaryFeature(raw);
  const priorPlanRef=opts.priorPlanRef||(source.siteIdentity&&source.siteIdentity.priorPlanRef)||null;
  const frontierRefs=vgoUnique((opts.frontierRefs||(source.siteIdentity&&source.siteIdentity.frontierRefs)||[]));
  const transformStack=vgoTransformStack(raw,opts,source.sourceRef||"source:missing");
  let owners=[], disposition=null, basis="", reasons=[];

  if(opts.incompatiblePersistedState){
    disposition="UNRESOLVED"; reasons.push("INCOMPATIBLE_PERSISTED_STATE"); basis="persisted-state-incompatible";
  } else if(opts.knowledgeBoundaryConflict){
    disposition="UNRESOLVED"; reasons.push("KNOWLEDGE_BOUNDARY_CONFLICT"); basis="knowledge-boundary-conflict";
  } else if(VIGNETTE_DISPOSITIONS.indexOf(opts.licensedDisposition)>=0){
    disposition=opts.licensedDisposition; basis="explicit-licensed-disposition";
    owners=Array.isArray(opts.hostOwners)?opts.hostOwners.slice():[];
  } else if(kind==="return" || kind==="persisted-site" || frontierRefs.length){
    if(priorPlanRef||frontierRefs.length){ disposition=transformStack.length?"TRANSFORM_EXISTING":"CONTINUE_EXISTING"; basis="persisted-identity"; }
    else { disposition="UNRESOLVED"; reasons.push("INCOMPATIBLE_PERSISTED_STATE"); basis="continuation-without-identity"; }
  } else if(kind==="capture"){
    owners=["CustodyHost"]; disposition=priorPlanRef?"CONTINUE_EXISTING":"MATERIALIZE_NEW"; basis="capture-custody";
  } else if(kind==="venue"){
    owners=Array.isArray(opts.hostOwners)&&opts.hostOwners.length?opts.hostOwners.slice():["HospitalityVenue"];
    disposition=priorPlanRef?"CONTINUE_EXISTING":"MATERIALIZE_NEW"; basis="ordinary-venue";
  } else if(family==="urban"){
    owners=vgoUrbanOwners(raw&&raw.setup&&raw.setup.type);
    disposition=owners.length?(priorPlanRef?"CONTINUE_EXISTING":"MATERIALIZE_NEW"):"UNRESOLVED";
    basis="urban-primary-type";
  } else if(family==="dungeon"){
    owners=vgoDungeonOwners(raw&&raw.setup&&raw.setup.type);
    disposition=owners.length?(priorPlanRef?"CONTINUE_EXISTING":"MATERIALIZE_NEW"):"UNRESOLVED";
    basis="dungeon-primary-type";
    if(!owners.length) reasons.push("AMBIGUOUS_DISPOSITION");
  } else if(family==="wilderness"){
    const featureText=(feature.name+" "+feature.areaType+" "+feature.flavor).toLowerCase();
    const visibleLicense=!!opts.visibleFeatureLicense;
    const rumor=/rumou?r|hearsay|said to|reported/.test(featureText);
    owners=vgoWildernessOwners(feature);
    if(rumor&&!visibleLicense){ owners=["NarrativeOnly"]; disposition="NARRATIVE_ONLY"; basis="unlicensed-rumor"; }
    else if(opts.narrativeOnly===true&&!visibleLicense){ owners=["NarrativeOnly"]; disposition="NARRATIVE_ONLY"; basis="explicit-nonvisual-feature"; }
    else if(owners.length){ disposition=priorPlanRef?(transformStack.length?"TRANSFORM_EXISTING":"CONTINUE_EXISTING"):"MATERIALIZE_NEW"; basis="wilderness-host-feature"; }
    else if(feature.name||feature.areaType){
      owners=[/monument|coloss|wreck|giant|arch|spire/.test(featureText)?"HeroFeature":"LocalFeature"];
      disposition="DECORATE_LOCAL"; basis="wilderness-local-feature";
    } else { disposition="UNRESOLVED"; reasons.push("UNSUPPORTED_LOCAL_FEATURE"); basis="missing-wilderness-feature"; }
  } else {
    disposition="UNRESOLVED"; reasons.push("AMBIGUOUS_DISPOSITION"); basis="unsupported-family";
  }

  if(transformStack.length && priorPlanRef && disposition!=="UNRESOLVED"){
    disposition="TRANSFORM_EXISTING"; basis="licensed-transform-on-persisted-host";
  }
  if(transformStack.some(function(t){return t.owner==="UnsupportedTransform";})){
    disposition="UNRESOLVED"; reasons.push("UNSUPPORTED_TRANSFORM"); basis="unsupported-transform";
  }
  if(opts.requireHost===true && !owners.length){
    disposition="UNRESOLVED"; reasons.push("MISSING_HOST_PROGRAM"); basis="required-host-missing";
  }
  if(disposition==="UNRESOLVED"&&!reasons.length) reasons.push("AMBIGUOUS_DISPOSITION");
  return {
    disposition:disposition,
    basis:basis,
    confidence:(disposition==="UNRESOLVED"?"unresolved":basis.indexOf("explicit")>=0?"explicit":"direct"),
    hostOwners:vgoUnique(owners),
    transformOwners:vgoUnique(transformStack.map(function(t){return t.owner;})),
    substrateOwner:vgoSubstrateFor(raw,opts),
    scaleOwners:vgoUnique((opts.scaleOwners||[])),
    operatingOwners:vgoUnique(vgoOperatingOwners(raw,opts)),
    activeWindowOwners:vgoUnique((opts.activeWindowOwners||[])),
    unresolvedReasons:vgoUnique(reasons),
    transformStack:transformStack,
    feature:feature
  };
}

function vgoDefaultBudgets(opts) {
  const b=(opts&&opts.budgets)||{};
  return {
    cells:b.cells==null?null:b.cells,
    activeWindows:b.activeWindows==null?null:b.activeWindows,
    maxCandidates:b.maxCandidates==null?null:b.maxCandidates,
    maxRepairPasses:b.maxRepairPasses==null?null:b.maxRepairPasses,
    geometry:b.geometry==null?null:b.geometry,
    assets:b.assets==null?null:b.assets,
    lights:b.lights==null?null:b.lights,
    drawCalls:b.drawCalls==null?null:b.drawCalls,
    camera:Object.assign({
      permittedBearings:[],
      pitchEnvelope:null,
      distanceEnvelope:null,
      protectedApproachSilhouettes:[],
      occlusionLimits:null
    },b.camera||{})
  };
}
function vignetteRequestFingerprint(request) {
  const copy=vgoClone(request)||{};
  if(copy.observatory) delete copy.observatory.fingerprint;
  return vignetteFingerprint(copy);
}
function vgoRequestFromSource(source, opts) {
  source=source||{}; opts=opts||{};
  const raw=source.raw||{};
  const sourceRef=source.sourceRef||opts.sourceRef||null;
  const rawFacts=vignetteLeafFacts(raw,sourceRef||"source:missing");
  const facts=sourceRef?rawFacts:[];
  const classification=vignetteClassify(Object.assign({},source,{sourceRef:sourceRef}),opts);
  const requestId=opts.requestId||source.requestId||[
    "vignette", source.kind||"raw-walk", source.family||raw.environment||"unknown",
    vignetteFingerprint({sourceRef:sourceRef,raw:raw,priorPlanRef:opts.priorPlanRef||null})
  ].join(":");
  const roles=vgoUnique(vgoRequiredRoles(classification.hostOwners).concat(opts.requiredRoles||[]));
  const operatingState=vgoOperatingState(raw,opts,classification.hostOwners);
  const missingReasons=classification.unresolvedReasons.slice();
  if(!sourceRef) missingReasons.push("MISSING_SOURCE_PROVENANCE");
  if(opts.requireOperatingModel===true&&operatingState==="unknown") missingReasons.push("MISSING_OPERATING_MODEL");
  if(opts.requireSubstrate===true&&!classification.substrateOwner) missingReasons.push("MISSING_SUBSTRATE");
  if(opts.requireScale===true&&!classification.scaleOwners.length) missingReasons.push("MISSING_SCALE_RELATION");
  if(missingReasons.length) classification.disposition="UNRESOLVED";
  const factIds=facts.map(function(f){return f.factId;});
  const family=source.family||raw.environment||opts.family||"unknown";
  const siteId=opts.siteId||(source.siteIdentity&&source.siteIdentity.siteId)||null;
  const priorPlanRef=opts.priorPlanRef||(source.siteIdentity&&source.siteIdentity.priorPlanRef)||null;
  const frontierRefs=vgoUnique(opts.frontierRefs||(source.siteIdentity&&source.siteIdentity.frontierRefs)||[]);
  const request={
    schemaVersion:1,
    requestId:requestId,
    seedNamespace:{
      rootSeed:String(opts.rootSeed==null?"audit-unset":opts.rootSeed),
      namespace:opts.seedNamespace||requestId,
      adapterVersion:VIGNETTE_ADAPTER_VERSION
    },
    sourceProvenance:sourceRef?[{
      sourceRef:sourceRef,
      factIds:factIds,
      authority:opts.authority||"live-game-source",
      treatment:opts.sourceTreatment||"HARD_CANON"
    }]:[],
    worldContext:{
      planRef:priorPlanRef,
      knownFactIds:vgoUnique(opts.knownFactIds||factIds),
      visibleFactIds:vgoUnique(opts.visibleFactIds||[]),
      portalRefs:vgoUnique(opts.portalRefs||[]),
      supportRefs:vgoUnique(opts.supportRefs||[])
    },
    walkContext:{
      family:family,
      rollRef:opts.rollRef||sourceRef,
      activeSegmentRef:opts.activeSegmentRef||null,
      approachFacts:vgoUnique(opts.approachFacts||[]),
      connectionRefs:vgoUnique(opts.connectionRefs||[]),
      returnStateRef:opts.returnStateRef||null
    },
    siteIdentity:{
      siteId:siteId,
      persistenceKey:opts.persistenceKey||siteId||null,
      priorPlanRef:priorPlanRef,
      frontierRefs:frontierRefs
    },
    hostProgram:{
      owner:classification.hostOwners[0]||null,
      family:classification.hostOwners.length?classification.hostOwners.join("+"):null,
      programRef:opts.programRef||(raw&&raw.setup&&raw.setup.type)||classification.feature.name||null,
      requiredRoles:roles,
      optionalRoles:vgoUnique(opts.optionalRoles||[])
    },
    operatingModel:{
      state:operatingState,
      serviceRefs:vgoUnique(opts.serviceRefs||[]),
      permissionRefs:vgoUnique(opts.permissionRefs||[]),
      scheduleRef:opts.scheduleRef||null,
      claimantRefs:vgoUnique(opts.claimantRefs||[])
    },
    substratePlan:{
      family:classification.substrateOwner,
      datumRef:opts.datumRef||null,
      supportMode:opts.supportMode||"continuous-natural-field",
      requiredFeatures:vgoUnique(opts.requiredSubstrateFeatures||[]),
      forbiddenFeatures:vgoUnique(opts.forbiddenSubstrateFeatures||[])
    },
    scaleContract:{
      bodyEnvelopes:vgoClone(opts.bodyEnvelopes||[]),
      trafficEnvelope:opts.trafficEnvelope||null,
      interactionEnvelope:opts.interactionEnvelope||null,
      verticalUnit:opts.verticalUnit||"world-unit",
      presentationExtent:opts.presentationExtent||null
    },
    transformStack:classification.transformStack,
    materializationIntent:{
      disposition:classification.disposition,
      purpose:opts.purpose||source.kind||"frontier-observation",
      requiredRoles:roles,
      quietSpace:opts.quietSpace==null?null:!!opts.quietSpace,
      continuationPolicy:priorPlanRef||frontierRefs.length?"preserve-committed-identity":"new-identity-if-materialized"
    },
    encounterIntent:{
      mode:opts.encounterMode||"unspecified",
      objectiveRefs:vgoUnique(opts.objectiveRefs||[]),
      deploymentRefs:vgoUnique(opts.deploymentRefs||[]),
      retreatRequired:opts.retreatRequired==null?false:!!opts.retreatRequired,
      promotionPolicy:opts.promotionPolicy||"promote-committed-plan-without-regeneration"
    },
    actors:vgoClone(opts.actors||[]),
    knowledge:{
      audience:opts.audience||"player-and-dm",
      knownFactIds:vgoUnique(opts.knowledgeKnownFactIds||factIds),
      concealedFactIds:vgoUnique(opts.concealedFactIds||[]),
      revealRules:vgoClone(opts.revealRules||[])
    },
    budgets:vgoDefaultBudgets(opts)
  };
  request.observatory={
    adapterVersion:VIGNETTE_ADAPTER_VERSION,
    rawFingerprint:vignetteFingerprint(raw),
    sourceLeafCount:rawFacts.length,
    sourceLeafPaths:rawFacts.map(function(f){return f.path;}),
    classificationBasis:classification.basis,
    confidence:classification.confidence,
    sharedOwners:classification.hostOwners,
    transformOwners:classification.transformOwners,
    substrateOwner:classification.substrateOwner,
    scaleOwners:classification.scaleOwners,
    operatingOwners:classification.operatingOwners,
    activeWindowOwners:classification.activeWindowOwners,
    unresolvedReasons:vgoUnique(missingReasons),
    sourceExample:rawFacts.length?{factId:sourceRef?rawFacts[0].factId:null,path:rawFacts[0].path,value:rawFacts[0].value}:null
  };
  request.observatory.fingerprint=vignetteRequestFingerprint(request);
  return request;
}

function vignetteRequestFromWalk(walk, opts) {
  opts=opts||{};
  return vgoRequestFromSource({
    kind:opts.kind||"raw-walk",
    family:opts.family||(walk&&walk.environment)||"unknown",
    raw:walk||{},
    sourceRef:opts.sourceRef||null,
    requestId:opts.requestId
  },opts);
}
function vgoEntryWalkRaw(entry, entryKey) {
  if(!entry||!entry.walk) return entry||{};
  const context={};
  Object.keys(entry).sort().forEach(function(key){
    if(key!=="walk") context[key]=vgoClone(entry[key]);
  });
  const raw=vgoClone(entry.walk)||{};
  raw.entryContext=raw.entryContext||{};
  raw.entryContext[entryKey]=context;
  return raw;
}
function vignetteRequestFromTravel(travel, opts) {
  return vignetteRequestFromWalk(vgoEntryWalkRaw(travel,"travel"),Object.assign({},opts||{},{kind:"travel",family:"wilderness"}));
}
function vignetteRequestFromJob(job, opts) {
  return vignetteRequestFromWalk(vgoEntryWalkRaw(job,"job"),Object.assign({},opts||{},{kind:"job",purpose:"job-site"}));
}
function vignetteRequestFromCapture(capture, opts) {
  return vgoRequestFromSource({kind:"capture",family:"capture",raw:capture||{},sourceRef:opts&&opts.sourceRef},opts||{});
}
function vignetteRequestFromReturn(state, opts) {
  return vgoRequestFromSource({kind:"return",family:(opts&&opts.family)||"return",raw:state||{},sourceRef:opts&&opts.sourceRef},opts||{});
}
function vignetteRequestFromVenue(venue, opts) {
  return vgoRequestFromSource({kind:"venue",family:"urban",raw:venue||{},sourceRef:opts&&opts.sourceRef},opts||{});
}
function vignetteRequestFromPersistedSite(site, opts) {
  return vgoRequestFromSource({kind:"persisted-site",family:(opts&&opts.family)||"persisted",raw:site||{},
    sourceRef:opts&&opts.sourceRef,siteIdentity:site&&site.siteIdentity},opts||{});
}
function vignetteRequestFromSource(source, opts){ return vgoRequestFromSource(source,opts); }

function vgoValidateObject(value, path, fields, errors) {
  if(!value||typeof value!=="object"||Array.isArray(value)){errors.push(path+" must be an object");return false;}
  fields.forEach(function(field){
    if(!Object.prototype.hasOwnProperty.call(value,field)) errors.push(path+" missing "+field);
  });
  return true;
}
function vgoValidateArray(value, path, errors) {
  if(!Array.isArray(value)){errors.push(path+" must be an array");return false;}
  return true;
}
function validateVignetteRequest(request) {
  const errors=[];
  if(!request||typeof request!=="object") return {ok:false,errors:["request must be an object"]};
  VGO_REQUIRED_REQUEST_FIELDS.forEach(function(field){if(!Object.prototype.hasOwnProperty.call(request,field)) errors.push("missing "+field);});
  if(request.schemaVersion!==1) errors.push("schemaVersion must equal 1");
  if(!request.requestId) errors.push("requestId must be non-empty");
  if(vgoValidateObject(request.seedNamespace,"seedNamespace",["rootSeed","namespace","adapterVersion"],errors)
      &&request.seedNamespace.adapterVersion!==VIGNETTE_ADAPTER_VERSION) errors.push("invalid seedNamespace.adapterVersion");
  vgoValidateObject(request.worldContext,"worldContext",["planRef","knownFactIds","visibleFactIds","portalRefs","supportRefs"],errors);
  vgoValidateObject(request.walkContext,"walkContext",["family","rollRef","activeSegmentRef","approachFacts","connectionRefs","returnStateRef"],errors);
  vgoValidateObject(request.siteIdentity,"siteIdentity",["siteId","persistenceKey","priorPlanRef","frontierRefs"],errors);
  vgoValidateObject(request.hostProgram,"hostProgram",["owner","family","programRef","requiredRoles","optionalRoles"],errors);
  vgoValidateObject(request.operatingModel,"operatingModel",["state","serviceRefs","permissionRefs","scheduleRef","claimantRefs"],errors);
  vgoValidateObject(request.substratePlan,"substratePlan",["family","datumRef","supportMode","requiredFeatures","forbiddenFeatures"],errors);
  vgoValidateObject(request.scaleContract,"scaleContract",["bodyEnvelopes","trafficEnvelope","interactionEnvelope","verticalUnit","presentationExtent"],errors);
  vgoValidateObject(request.materializationIntent,"materializationIntent",["disposition","purpose","requiredRoles","quietSpace","continuationPolicy"],errors);
  vgoValidateObject(request.encounterIntent,"encounterIntent",["mode","objectiveRefs","deploymentRefs","retreatRequired","promotionPolicy"],errors);
  vgoValidateObject(request.knowledge,"knowledge",["audience","knownFactIds","concealedFactIds","revealRules"],errors);
  vgoValidateObject(request.budgets,"budgets",["cells","activeWindows","maxCandidates","maxRepairPasses","geometry","assets","lights","drawCalls","camera"],errors);
  const arrays=[
    ["sourceProvenance",request.sourceProvenance],["transformStack",request.transformStack],["actors",request.actors],
    ["worldContext.knownFactIds",request.worldContext&&request.worldContext.knownFactIds],
    ["worldContext.visibleFactIds",request.worldContext&&request.worldContext.visibleFactIds],
    ["worldContext.portalRefs",request.worldContext&&request.worldContext.portalRefs],
    ["worldContext.supportRefs",request.worldContext&&request.worldContext.supportRefs],
    ["walkContext.approachFacts",request.walkContext&&request.walkContext.approachFacts],
    ["walkContext.connectionRefs",request.walkContext&&request.walkContext.connectionRefs],
    ["siteIdentity.frontierRefs",request.siteIdentity&&request.siteIdentity.frontierRefs],
    ["hostProgram.requiredRoles",request.hostProgram&&request.hostProgram.requiredRoles],
    ["hostProgram.optionalRoles",request.hostProgram&&request.hostProgram.optionalRoles],
    ["operatingModel.serviceRefs",request.operatingModel&&request.operatingModel.serviceRefs],
    ["operatingModel.permissionRefs",request.operatingModel&&request.operatingModel.permissionRefs],
    ["operatingModel.claimantRefs",request.operatingModel&&request.operatingModel.claimantRefs],
    ["substratePlan.requiredFeatures",request.substratePlan&&request.substratePlan.requiredFeatures],
    ["substratePlan.forbiddenFeatures",request.substratePlan&&request.substratePlan.forbiddenFeatures],
    ["scaleContract.bodyEnvelopes",request.scaleContract&&request.scaleContract.bodyEnvelopes],
    ["materializationIntent.requiredRoles",request.materializationIntent&&request.materializationIntent.requiredRoles],
    ["encounterIntent.objectiveRefs",request.encounterIntent&&request.encounterIntent.objectiveRefs],
    ["encounterIntent.deploymentRefs",request.encounterIntent&&request.encounterIntent.deploymentRefs],
    ["knowledge.knownFactIds",request.knowledge&&request.knowledge.knownFactIds],
    ["knowledge.concealedFactIds",request.knowledge&&request.knowledge.concealedFactIds],
    ["knowledge.revealRules",request.knowledge&&request.knowledge.revealRules]
  ];
  arrays.forEach(function(pair){vgoValidateArray(pair[1],pair[0],errors);});
  if(request.budgets&&request.budgets.camera) vgoValidateObject(request.budgets.camera,"budgets.camera",
    ["permittedBearings","pitchEnvelope","distanceEnvelope","protectedApproachSilhouettes","occlusionLimits"],errors);
  const disposition=request.materializationIntent&&request.materializationIntent.disposition;
  if(VIGNETTE_DISPOSITIONS.indexOf(disposition)<0) errors.push("invalid materialization disposition");
  const unresolved=request.observatory&&request.observatory.unresolvedReasons;
  if(disposition==="UNRESOLVED"&&(!Array.isArray(unresolved)||!unresolved.length)) errors.push("UNRESOLVED request requires reason");
  (request.sourceProvenance||[]).forEach(function(p,index){
    if(!p||!p.sourceRef) errors.push("sourceProvenance["+index+"] missing sourceRef");
    if(!p||!Array.isArray(p.factIds)) errors.push("sourceProvenance["+index+"] factIds must be an array");
    if(!p||VIGNETTE_SOURCE_TREATMENTS.indexOf(p.treatment)<0) errors.push("sourceProvenance["+index+"] invalid treatment");
  });
  (request.transformStack||[]).forEach(function(t,index){
    vgoValidateObject(t,"transformStack["+index+"]",["transformId","owner","phase","sourceRefs","deltas"],errors);
    vgoValidateArray(t&&t.sourceRefs,"transformStack["+index+"].sourceRefs",errors);
    vgoValidateArray(t&&t.deltas,"transformStack["+index+"].deltas",errors);
  });
  (request.actors||[]).forEach(function(actor,index){
    vgoValidateObject(actor,"actors["+index+"]",["actorId","bodyEnvelopeRef","side","arrivalRef","capabilityRefs"],errors);
    vgoValidateArray(actor&&actor.capabilityRefs,"actors["+index+"].capabilityRefs",errors);
  });
  return {ok:errors.length===0,errors:errors};
}

function vgoNounFamily(role, owner) {
  if(/route|approach|egress|retreat|circuit|street|transfer/.test(role)) return "connective-route";
  if(/threshold|gate|barrier|holding|cell|aperture/.test(role)) return "controlled-boundary";
  if(/water|waste|service|supply|process|works|maintenance/.test(role)) return "service-fixture";
  if(/observation|watch|signal|high-ground|keeper/.test(role)) return "observation-fixture";
  if(/wall|support|retaining|load/.test(role)) return "structural-member";
  if(/nest|lair|mouth|organic|agency/.test(role)) return "organic-formation";
  if(/sign|recognition|records|property|notice/.test(role)) return "information-face";
  if(owner==="LocalFeature"||owner==="HeroFeature"||/feature|silhouette/.test(role)) return "natural-feature";
  return "program-fixture";
}
function vignetteAssetDemandsForRequest(request) {
  const roles=request&&request.materializationIntent&&Array.isArray(request.materializationIntent.requiredRoles)
    ?request.materializationIntent.requiredRoles:[];
  const owner=request&&request.hostProgram&&request.hostProgram.owner;
  const factRefs=[];
  (request&&request.sourceProvenance||[]).forEach(function(p){(p.factIds||[]).forEach(function(id){factRefs.push(id);});});
  return roles.map(function(role,index){
    const noun=vgoNounFamily(role,owner);
    return {
      schemaVersion:1,
      demandId:(request.requestId||"request")+":asset:"+String(index+1).padStart(2,"0")+":"+vgoSlug(role),
      planRef:(request.siteIdentity&&request.siteIdentity.priorPlanRef)||("uncommitted:"+request.requestId),
      sourceFactRefs:factRefs.slice(),
      semanticRole:role,
      nounFamily:noun,
      requiredState:(request.operatingModel&&request.operatingModel.state)||"unknown",
      physicalEnvelope:{footprint:null,height:null,clearance:null,orientation:null,scale:null},
      supportAndMount:{supportSurface:null,mount:null,load:null,contact:"must-be-resolved-by-plan"},
      interactions:[],
      tactical:{collision:"plan-owned",cover:"plan-owned",sight:"plan-owned",walkability:"plan-owned",hazard:"source-owned",destructibility:"source-owned"},
      appearance:{realm:null,culture:null,construction:null,material:null,condition:null,trim:null,silhouette:role},
      routeConstraints:{permittedLanes:["ENGINE_RECIPE","ADMITTED_ASSET","MESHY_DONOR","SPRITE_EXTRUSION","MATERIAL","TRUTHFUL_PROXY"],forbiddenLanes:[]},
      priority:"required",
      fallbackPolicy:{minimumTruthfulProxy:"labeled-"+noun+"-proxy",omissionLegal:false}
    };
  });
}
function vignetteCandidateLaneForDemand(demand) {
  const noun=demand&&demand.nounFamily;
  if(noun==="connective-route"||noun==="controlled-boundary"||noun==="structural-member"||noun==="natural-feature") return "ENGINE_RECIPE";
  if(noun==="organic-formation") return "MESHY_CANDIDATE";
  if(noun==="information-face") return "SPRITE_EXTRUSION_CANDIDATE";
  if(noun==="service-fixture"||noun==="observation-fixture"||noun==="program-fixture") return "EXISTING_OR_MESHY_CANDIDATE";
  return "MATERIAL_CANDIDATE";
}
function validateSemanticAssetDemand(demand) {
  const errors=[];
  if(!demand||typeof demand!=="object") return {ok:false,errors:["demand must be an object"]};
  VGO_REQUIRED_DEMAND_FIELDS.forEach(function(field){if(!Object.prototype.hasOwnProperty.call(demand,field)) errors.push("missing "+field);});
  if(demand.schemaVersion!==1) errors.push("schemaVersion must equal 1");
  if(!demand.demandId) errors.push("demandId must be non-empty");
  if(!demand.semanticRole) errors.push("semanticRole must be non-empty");
  if(!Array.isArray(demand.sourceFactRefs)) errors.push("sourceFactRefs must be an array");
  vgoValidateObject(demand.physicalEnvelope,"physicalEnvelope",["footprint","height","clearance","orientation","scale"],errors);
  vgoValidateObject(demand.supportAndMount,"supportAndMount",["supportSurface","mount","load","contact"],errors);
  vgoValidateArray(demand.interactions,"interactions",errors);
  vgoValidateObject(demand.tactical,"tactical",["collision","cover","sight","walkability","hazard","destructibility"],errors);
  vgoValidateObject(demand.appearance,"appearance",["realm","culture","construction","material","condition","trim","silhouette"],errors);
  vgoValidateObject(demand.routeConstraints,"routeConstraints",["permittedLanes","forbiddenLanes"],errors);
  vgoValidateArray(demand.routeConstraints&&demand.routeConstraints.permittedLanes,"routeConstraints.permittedLanes",errors);
  vgoValidateArray(demand.routeConstraints&&demand.routeConstraints.forbiddenLanes,"routeConstraints.forbiddenLanes",errors);
  vgoValidateObject(demand.fallbackPolicy,"fallbackPolicy",["minimumTruthfulProxy","omissionLegal"],errors);
  if(!demand.fallbackPolicy||!demand.fallbackPolicy.minimumTruthfulProxy) errors.push("fallbackPolicy needs a truthful proxy");
  return {ok:errors.length===0,errors:errors};
}
