/* GENESIS MODULE — src/world/urban.js — URBAN FABRIC (docs/URBAN-FABRIC.md). Classic <script>,
   shared global scope. Registered in manifest.json; validated by build/check-manifest.py.

   §1 rollBuilding(type, opts) — the typed-building roller: building-interior base roll + a TYPE
   KIT (data/building-kits.js). Shop kinds (smithy/apothecary/general/arcanist) DELEGATE to makeShop
   (the kit adds the room around the counter — economy.js stays the sole stock/pricing owner).
   The proprietor mints via the SAME ambient-pool path prepCastAmbient uses (BATCH3-GUARDRAILS J2:
   "rollBuilding proprietors mint via the ambient-pool path, soft, at the node") — never a freehand
   name; every typed building has a rolled person behind the counter.

   §2 district fabric (Settlement 1.1, distilled) — mintDistricts(w, nodeId) mints write-once codex
   `kind:"district"` records linked `part-of` the node, ONCE per node (J2), count derived from
   PLACE_TIERS tier via districtCount: hamlet 0 · village 1 · town 1d2 · city 1d3+1. Each district
   rolls `urban-district-type` (the compiled Function-refiner content) for its character line.

   §3 building lifecycle — soft mint on approach (buildingApproach), lock on contact
   (buildingContact) — reuses codex soft/hard exactly like every other entity (codexContact).

   §4 the tavern's three system-surfaces (docs/URBAN-FABRIC.md §1): contact fires a Distant Word
   roll (tavernContactFire, reuses gap-wiring's distantWordRoll — no new mechanism); Downtime carouse
   already resolves generically via downtimeIntent (gap-wiring §3) — a tavern building is simply
   WHERE a player declares "carouse", no separate venue gate needed (closing an open question rather
   than inventing a second downtime path); the proprietor IS the lodging owner NPC (nodeOwnerAttitude,
   prep.js, already reads "any codex NPC co-located at the node" — a tavern's minted proprietor
   satisfies that for free once minted `at` the node).

   Reads BUILDING_KITS/BUILDING_KIT_TYPES (data.building-kits), rollTable (engine.compiled),
   rollDie/pick/slug (engine.core), rollBuildingInterior/rollNPC (engine.codex-roll), makeShop
   (engine.economy), codexAdd/codexGet/codexLink/codexContact (world.codex), mapOf/nodeName
   (world.state), PLACE_TIERS (data.economy), distantWordRoll (world.gap-wiring), nodeLodgingTier
   (world.prep) at call-time — all null-safe degrades, matching WORLD-TURN's convention. */

/* ============================================================================
   §1 — rollBuilding: the typed building roller
   ============================================================================ */

/* rollBuilding(type, opts) -> {ok:true, kit, interior, name, shop?} | {ok:false, reason}.
   opts: {nodeId, name?, rng?, tier?}. Unknown type -> {ok:false, reason:"unknown-type"} (never
   invents a 13th kit — BATCH-GUARDRAILS G9). Shop kinds route through makeShop AND still carry the
   base building-interior roll (the room around the counter) — the kit never duplicates stock logic. */
function rollBuilding(type, opts){
  opts=opts||{};
  const kits=(typeof BUILDING_KITS!=="undefined")?BUILDING_KITS:null;
  if(!kits || !kits[type]) return {ok:false, reason:"unknown-type"};
  const kit=kits[type];
  const interior=(typeof rollBuildingInterior==="function") ? rollBuildingInterior({kind:type}) : null;
  let name=opts.name||null;
  if(!name && kit.namePattern && typeof rollTable==="function"){
    const r=rollTable(kit.namePattern);
    if(r && r.cells && r.cells.length>=2) name="The "+r.cells[0].replace(/^The\s+/i,"")+" "+r.cells[1];
    else if(r) name=r.text;
  }
  const out={ ok:true, type, kit:Object.assign({label:kit.label},kit), interior, name:name||kit.label };
  if(kit.delegatesToShop && typeof makeShop==="function"){
    out.shop=makeShop({ tier:opts.tier, archetype:kit.delegatesToShop, nodeId:opts.nodeId, name:out.name, rng:opts.rng });
  }
  return out;
}

/* ============================================================================
   §2 — DISTRICT FABRIC (Settlement 1.1, distilled)
   ============================================================================ */

/* districtCount(tier) -> the district count by PLACE_TIERS tier (BATCH3-GUARDRAILS J2, FINAL):
   hamlet(0) 0 · village(1) 1 · town(2) 1d2 · city(3) 1d3+1. A tier outside 0-3 clamps to the
   nearest known tier rather than guessing (never invents a 5th tier bucket). */
function districtCount(tier){
  const t=(typeof tier==="number") ? Math.max(0,Math.min(3,tier)) : 0;
  const d=(n)=>(typeof rollDie==="function")?rollDie(n):(1+Math.floor(Math.random()*n));
  if(t===0) return 0;
  if(t===1) return 1;
  if(t===2) return d(2);
  return d(3)+1;   // city
}

/* districtsOf(w) -> the write-once per-world district ledger, keyed by nodeId -> [codex ids]. */
function districtsOf(w){ return w.urban || (w.urban={ districtsByNode:{} }); }

/* mintDistricts(w, nodeId, opts) — mint districts for `nodeId` ONCE (idempotent: a second call on
   an already-minted node is a no-op, returning the existing ids — BATCH3-GUARDRAILS J1 mutation
   check: "re-entry re-mints, fails"). opts.tier (PLACE_TIERS index) selects the count; omitted ->
   nodeLodgingTier(w,nodeId) if available, else 0 (hamlet — 0 districts, "the place is one fabric").
   Each district record: kind:"district", fields:{type: the urban-district-type roll's label},
   status:{soft:true}, linked part-of the node. Returns {ids, minted:bool}. */
function mintDistricts(w, nodeId, opts){
  opts=opts||{};
  const U=districtsOf(w);
  if(U.districtsByNode[nodeId]) return {ids:U.districtsByNode[nodeId], minted:false};
  const tier=(opts.tier!=null) ? opts.tier : ((typeof nodeLodgingTier==="function") ? nodeLodgingTier(w,nodeId) : 0);
  const count=districtCount(tier);
  const ids=[];
  for(let i=0;i<count;i++){
    const roll=(typeof rollTable==="function") ? rollTable("urban-district-type") : null;
    const cells=(roll&&roll.cells)||[];
    const typeLabel=cells[0]||(roll?roll.text:("District "+(i+1)));
    const tierLabel=cells[1]||null;
    const desc=cells[2]||null;
    const name=typeLabel+" District";
    // WIRING-SWEEP-B §4 (docs/WIRING-MAP.md item 13, world.wiring-b): urban-environment-skin rolled
    // a SECOND jurisdiction — the district's own atmosphere line, distinct from the WALK skin the
    // same table already serves at engine.walk's assembly (the collision ruling: walk-skin owns the
    // walk, environment-skin also serves the district). Null-safe.
    const skin=(typeof districtSkinRoll==="function") ? districtSkinRoll() : null;
    const id=(typeof codexAdd==="function") ? codexAdd(w, {
      kind:"district", name,
      provenance:"rolled",
      rolled:{ type:typeLabel, tierLabel, desc, skin, ref: roll?("urban-district-type#"+roll.total):null },
      fields:{ type:typeLabel, tierLabel, desc, skin },
      status:{ soft:true, at:nodeId }
    }).id : null;
    if(id){
      ids.push(id);
      if(typeof codexLink==="function") codexLink(w, id, "part-of", nodeId);
    }
  }
  U.districtsByNode[nodeId]=ids;
  return {ids, minted:true};
}

/* ============================================================================
   §3 — BUILDING LIFECYCLE: soft on approach, lock on contact
   ============================================================================ */

/* buildingsOf(w) -> per-world building registry, keyed by codex id -> {nodeId, type}. */
function buildingsOf(w){ return w.urban ? (w.urban.buildings || (w.urban.buildings={})) : (districtsOf(w).buildings={}); }

/* buildingApproach(w, type, opts) — mint a typed building SOFT at a node (player intent or DM
   `gen`) — never pre-built (docs/URBAN-FABRIC.md §2 "buildings mint soft on approach, lock on
   contact"). Returns the minted codex record (kind:"location") or {ok:false,reason} on an unknown
   type. The proprietor (if the kit calls for one) is drawn via the ambient-pool path: prefer an
   already-minted ambient NPC soft at this node (prepCastAmbient's pool) before rolling a fresh one,
   so a typed building never doubles up on cast when ambient NPCs already stand ready. */
function buildingApproach(w, type, opts){
  opts=opts||{};
  const rolled=rollBuilding(type, opts);
  if(!rolled.ok) return rolled;
  const nodeId=opts.nodeId||w.currentNodeId;
  let proprietorId=null;
  if(typeof codexAdd==="function"){
    let proprietor=null;
    if(typeof codexOf==="function" && nodeId){
      const recs=codexOf(w).records||{};
      proprietor=Object.values(recs).find(r=>r.kind==="npc" && r.status && r.status.soft
        && r.status.at===nodeId && r.dm && r.dm.ambient && !r.dm.assignedBuilding);
    }
    if(!proprietor && typeof rollNPC==="function"){
      const region=(typeof regionForNode==="function") ? regionForNode(w,nodeId) : null;
      const payload=rollNPC({ roleHint:rolled.kit.proprietorRoleHint, region });
      proprietor=codexAdd(w, Object.assign({}, payload, { status:Object.assign({soft:true, at:nodeId}, payload.status||{}) }));
    }
    if(proprietor){
      proprietor.dm=proprietor.dm||{}; proprietor.dm.assignedBuilding=true;
      proprietorId=proprietor.id;
    }
  }
  const rec=(typeof codexAdd==="function") ? codexAdd(w, {
    kind:"location", name:rolled.name,
    provenance:"rolled",
    rolled:{ buildingType:type, kit:rolled.kit.label, interior:rolled.interior?rolled.interior.rolled:null },
    fields:{ desc: rolled.interior?rolled.interior.fields.desc:null, functionLine:rolled.kit.functionLine },
    dm:{ proprietorId, shopId: rolled.shop?rolled.shop.id:null },
    status:{ soft:true, at:nodeId }
  }) : null;
  if(!rec) return {ok:false, reason:"no-codex"};
  if(proprietorId && typeof codexLink==="function") codexLink(w, rec.id, "located-in", nodeId);
  const B=buildingsOf(w);
  B[rec.id]={ nodeId, type, locked:false };
  return {ok:true, id:rec.id, record:rec, proprietorId, shop:rolled.shop||null};
}

/* buildingContact(w, id) — the player TOUCHES the building: lock soft->hard (codexContact, same
   as every other entity) + lock its proprietor too (a building's proprietor is canon the instant
   the building is). Fires the tavern's contact system-surface (§4) when type==="tavern". Returns
   {ok:false,reason} for an unknown/never-approached id (never fabricates a building on contact —
   approach must have happened first). */
function buildingContact(w, id){
  const B=buildingsOf(w);
  const b=B[id];
  if(!b) return {ok:false, reason:"not-approached"};
  if(typeof codexContact==="function") codexContact(w, id);
  const rec=(typeof codexGet==="function") ? codexGet(w, id) : null;
  if(rec && rec.dm && rec.dm.proprietorId && typeof codexContact==="function") codexContact(w, rec.dm.proprietorId);
  b.locked=true;
  const out={ ok:true, id, type:b.type };
  if(b.type==="tavern"){
    out.distantWord=tavernContactFire(w);
    // WIRING-SWEEP-A §6 (docs/WIRING-MAP.md item 5): the tavern kit's ambient lane —
    // tavern-encounters, chance-gated (not guaranteed every contact). Null-safe (no new mechanism).
    if(typeof tavernEncounterRoll==="function") out.ambientEncounter=tavernEncounterRoll();
  }
  return out;
}

/* ============================================================================
   §4 — the tavern's system-surfaces
   ============================================================================ */

/* tavernContactFire(w) — contact with a tavern building fires ONE Distant Word roll (reuses
   gap-wiring's distantWordRoll — no new mechanism). Null-safe: distantWordRoll unavailable/no
   eligible fact -> null (never fabricates). */
function tavernContactFire(w){
  return (typeof distantWordRoll==="function") ? distantWordRoll(w, {}) : null;
}
