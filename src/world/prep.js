/* GENESIS MODULE — src/world/prep.js — Session-Prep state: soft canon · binding · lock-on-contact
   (docs/SESSION-PREP.md #3+#5; SYNTHESIS-CONTRACT.md). Classic <script>, shared global scope.
   Registered in manifest.json; validated by build/check-manifest.py.

   The world-state layer for prep. On a new session it assembles the multi-environment bundle
   (engine.prep-bundle), binds each environment to a SOFT "rumored frontier" node on the node-graph
   (with a soft edge from where the PC stands — the quest hook leading there), and stashes the walk +
   hook on the node. A frontier is **soft until contact** (Charter §8.4): entering it LOCKS it to hard
   canon. The DM's synthesis overlays (run over the Bridge) are applied back via applyPrep to enrich
   the frontiers + write soft new-canon. Unvisited soft prep from a prior session is recycled. Reads/
   writes the live world `w` at call-time; reuses state.js (addNode/addLedger/mapOf) + engine rollers. */

function prepOf(w){ const P = w.prep || (w.prep={ session:0, bundle:null, overlays:{}, harvest:null, nodes:{}, debt:[] });
  // WALK-CONSUMPTION (docs/WALK-CONSUMPTION.md): the active walk the party is ON + the per-walk
  // provenance log. Back-fill on older saves so the digest/seam readers never see undefined.
  if(P.activeWalkId===undefined) P.activeWalkId=null;
  if(!Array.isArray(P.walkLog)) P.walkLog=[];
  return P;
}

/* ON-DEMAND-GEN §6 / BATCH-GUARDRAILS G4 — the shared inhabited-node predicate (reused verbatim by
   ECONOMY-SINKS; do not fork a second heuristic). True iff: the node is the world's START node, OR
   ≥1 codex npc record has status.at===nodeId, OR the node's type/name matches a settlement pattern. */
function nodeInhabited(w, nodeId){
  if(!nodeId) return false;
  if(w.startNodeId && nodeId===w.startNodeId) return true;
  if(typeof codexOf==="function"){
    const recs=codexOf(w).records||{};
    if(Object.values(recs).some(r=>r.kind==="npc" && r.status && r.status.at===nodeId)) return true;
  }
  const nn=mapOf(w).nodes[nodeId];
  const re=/town|village|city|hamlet|settlement|port|market/i;
  return !!(nn && (re.test(nn.type||"") || re.test(nn.name||"")));
}

/* ECONOMY-SINKS §A — the lodging place-tier lookup. World nodes carry no `tier` field anywhere in
   this codebase (shop.tier is DM-declared per open_shop, never derived from a node — see
   docs/ECONOMY-SINKS.md executor note + uncertainties). The only existing per-node tier signal is a
   shop record already minted at that node (open_shop persists `shop.tier`); reuse it rather than
   invent a second tier heuristic. No shop at the node → tier 0 (hamlet), the lowest/safest default. */
function nodeLodgingTier(w, nodeId){
  if(!nodeId || !w.shops) return 0;
  const shop=Object.values(w.shops).find(s=>s && s.nodeId===nodeId);
  return (shop && typeof shop.tier==="number") ? shop.tier : 0;
}

/* ECONOMY-SINKS §A — the owner tint source: any codex NPC co-located at nodeId (codexWitnessesAt's
   query, reused — no second "who lives here" lookup). First match wins (v1 has no explicit innkeeper
   role yet — the gen handshake that mints one is future work, docs/ECONOMY-SINKS.md §A "Owner tint").
   No NPC at the node → untinted (att 0), same as shopAttitude's no-codexId case. */
function nodeOwnerAttitude(w, nodeId){
  if(!nodeId || typeof codexWitnessesAt!=="function" || typeof codexGetAttitude!=="function") return 0;
  const ids=codexWitnessesAt(w, nodeId, null);
  if(!ids.length) return 0;
  const att=codexGetAttitude(w, ids[0]);
  return (att && typeof att.value==="number") ? att.value : 0;
}

/* ON-DEMAND-GEN §6 — the ambient pool: inhabited locations always have rolled handles (3 soft NPCs,
   status.at the node, provenance:"rolled") so a freehand-named shopkeeper is never the only option.
   Interiors are NOT pre-cast (the on-demand handshake is the lazy path, §6). No-op if codex/rollNPC
   aren't loaded, or the node is already stocked (idempotent — safe to call every startPrep). */
const AMBIENT_POOL_SIZE = 3;
// TAROT-SESSION.md §1: a Cups-domain draw (social/NPC) nudges THIS session's ambient casts +1 (court
// cards +2) — a session-local addend to the loop count below, never a change to the G4-locked
// AMBIENT_POOL_SIZE constant itself (the "already>=" idempotency check still reads the base 3, so a
// re-visit within the same session doesn't keep minting past the bonus once it's satisfied once).
function prepAmbientTarget(w){
  const bonus=(typeof tarotAmbientBonus==="function" && typeof tarotVectorOf==="function") ? tarotAmbientBonus(tarotVectorOf(w)) : 0;
  return Math.max(1, AMBIENT_POOL_SIZE + (bonus|0));
}
function prepCastAmbient(w, nodeId){
  if(!nodeId || typeof codexAdd!=="function" || typeof rollNPC!=="function") return null;
  const target=prepAmbientTarget(w);
  if(typeof codexOf==="function"){
    const recs=codexOf(w).records||{};
    const already=Object.values(recs).filter(r=>r.kind==="npc" && r.status && r.status.at===nodeId && r.dm && r.dm.ambient).length;
    if(already>=target) return { minted:0, already };
  }
  // REGIONS-NAMES.md §3: the node's region blends its culture banks into ambient-NPC names (70/30).
  const ambientRegion=(typeof regionForNode==="function")?regionForNode(w,nodeId):null;
  const minted=[];
  for(let i=0;i<target;i++){
    // NPC-PRESENCE-AND-HOOKS.md Component 2: ambient/walk-on NPCs are LAZY archetype stubs — walkOn:true
    // forces pickCoherence's cheap override (never reconcile weird atoms for a 10-second background
    // face), composing with the already-merged coherence dial rather than re-deriving a fray-band roll.
    const payload=rollNPC({ region:ambientRegion, walkOn:true });
    // G4 "exactly 3" hard number: codexAdd keys un-id'd records by codexKeyId(kind,name), so two rolls
    // sharing a name (single-first-name draws are common) would silently MERGE the second into the
    // first instead of minting a new record. prepCastId's base+"-2"/"-3" disambiguation (same guard
    // prepCastFrontier already relies on) guarantees this loop always mints AMBIENT_POOL_SIZE distinct
    // records regardless of name collisions.
    const rec=codexAdd(w, Object.assign({}, payload, {
      id:prepCastId(w, payload.kind||"npc", payload.name),
      status:Object.assign({ soft:true, at:nodeId }, payload.status||{}),
      dm:Object.assign({}, payload.dm, { ambient:true })
    }));
    if(rec) minted.push(rec.id);
  }
  // NPC-PRESENCE-AND-HOOKS.md Component 3.1 "guaranteed scene hook" — never an empty room: ONE NPC in
  // this node's ambient pool always carries a hook. ensureSceneHook is idempotent (skips if ANY ambient
  // NPC here already carries dm.hook), so a re-visit within the cap doesn't re-roll or double-hook.
  if(typeof codexOf==="function" && typeof ensureSceneHook==="function"){
    const pool=Object.values(codexOf(w).records||{}).filter(r=>r.kind==="npc" && r.status && r.status.at===nodeId && r.dm && r.dm.ambient && !r.dm.partial);
    ensureSceneHook(pool);
  }
  // ANIMAL-SOCIAL.md §1/§6 U2 — node-level animal population, keyed by the node's env band. Additive
  // to the generic NPC pool above; never touches it.
  if(typeof prepCastEnvAnimals==="function") prepCastEnvAnimals(w, nodeId);
  return { minted:minted.length, ids:minted };
}

/* ANIMAL-SOCIAL.md §1 — node-level env-band animal population (frequency map). Per-draw gated chance
   + a fixed draw ceiling per band, same grammar as SCENE_PARTIALS below (a miss ends the draws — no
   forced count). Numbers are engine implementation-fill straight from the spec's own table; the
   shape (wilderness ≈ always, dungeon ≈ almost never) is the law, not the exact figures. */
const ENV_PARTIALS = {
  wilderness: { animal:0.9, draws:3 },
  rural:      { animal:0.7, draws:2 },
  village:    { animal:0.5, draws:2 },
  city:       { animal:0.25, draws:2 },
  dungeon:    { animal:0.08, draws:1 },
};
/* nodeEnvBand(w, nodeId) -> one of ENV_PARTIALS' 5 keys, or null if the node carries no prep env yet
   (soft/unprepped nodes, or a node this session never bound). P.nodes[id].env carries the raw band —
   "wilderness"/"urban"/"dungeon" (§1) — urban resolves to rural/village/city via the node's
   settlement tier: reuses nodeLodgingTier's existing PLACE_TIERS lookup (0 hamlet/1 village/2-3
   town-city) rather than inventing a second "how big is this place" heuristic — tier 0 -> rural,
   tier 1 -> village, tier >=2 -> city (§1: "smallest settlements read rural, mid read village, large
   read city"). */
function nodeEnvBand(w, nodeId){
  const P=(typeof prepOf==="function")?prepOf(w):null;
  const pn=P && P.nodes && P.nodes[nodeId];
  const raw=pn && pn.env;
  if(!raw) return null;
  if(raw==="wilderness" || raw==="dungeon") return raw;
  if(raw==="urban"){
    const tier=nodeLodgingTier(w, nodeId);
    if(tier<=0) return "rural";
    if(tier===1) return "village";
    return "city";
  }
  return null;
}
/* prepCastEnvAnimals(w, nodeId) — ANIMAL-SOCIAL.md §1/§6 U2: mints this node's ambient animal
   population per ENV_PARTIALS' draw grammar (rollPartial('animal',{env:band}), U1's weighted-pool
   selection). Idempotent — skips if the node already carries an env-cast animal partial (a re-visit
   within the same session doesn't re-roll or double-mint, same posture as prepCastAmbient's own
   `already>=target` guard above).
   §5 territory-holder: the wilderness band's FIRST draw is minted NON-ambient (`dm.ambient:false`,
   `dm.territoryHolder:true`) — the node's residence anchor / named-record promotion candidate, not a
   disposable walk-on; every other draw (any band) stays a normal ambient partial. Null-safe: no
   codex/rollPartial, or the node carries no prep env yet -> no-op.
   ANIMAL-SOCIAL.md §5/§6 U6 — "each wilderness node's ENV_PARTIALS cast INCLUDES one territory-
   holder" (§5, stated as a guarantee, not a maybe) + the guaranteed-scene-hook law extended to
   wilderness pools ("the hook rides the territory-holder's tell") together require the wilderness
   band's i===0 draw to be UNCONDITIONAL — the ordinary per-draw chance gate below still governs
   every other draw (any band), but a wilderness node's territory-holder/hook-anchor can never
   silently fail to mint on an unlucky roll (U2's own chance gate applied to i===0 too, which could
   leave a wilderness node hookless — the accept criterion below closes that gap). DEVIATION from
   U2's original draw loop, scoped narrowly to i===0 of the wilderness band only. */
function prepCastEnvAnimals(w, nodeId){
  if(!nodeId || typeof codexAdd!=="function" || typeof rollPartial!=="function") return {minted:0};
  const band=nodeEnvBand(w, nodeId);
  if(!band) return {minted:0};
  if(typeof codexOf==="function"){
    const recs=codexOf(w).records||{};
    const already=Object.values(recs).some(r=>r.status && r.status.at===nodeId && r.dm && r.dm.envCast && isAnimalPartial(r));
    if(already) return {minted:0, already:true};
  }
  const cfg=ENV_PARTIALS[band]||{};
  const chance=cfg.animal||0, draws=cfg.draws||0;
  const region=(typeof regionForNode==="function")?regionForNode(w,nodeId):null;
  // ANIMAL-SOCIAL-HQ.md HQ-1 (D3): the live active realm, the exact resolver prep.js's own
  // hookDiscoveryChance (prep.js:378) already uses — reaches rollPartial's realm-skin overlay
  // (data/animal-realm-skins.js) so a realm-skin-tagged row can mint its skinned text in production.
  const realmId=(typeof activeRealmsFor==="function")?((activeRealmsFor(null,w)||[])[0]||null):null;
  // ANIMAL-SOCIAL-HQ.md HQ-1 (D2): the living PC, the dm.js:1048 livingSheet inline pattern —
  // never import/call livingSheet itself (world.dm-owned; prep must not gain an upward dep).
  const pc=(w.characters||[]).filter(c=>c&&c.status==="living").slice(-1)[0];
  const pcClass=(pc&&pc.sheet&&pc.sheet.class)||null;
  // ANIMAL-SOCIAL.md §3/§4/§6 U5 — cruelty memory: a Terrified-overshoot on THIS node (stamped by
  // dm.js's social_check, w.map.nodes[nodeId].animalCruelty) opens every animal minted here one step
  // colder from now on ("the farm dogs talk"). HQ-7 item 2: the node lookup + penalty now lives
  // inside mintAnimalPartial (keyed off the same nodeId, passed through as atId).
  const minted=[];
  for(let i=0;i<draws;i++){
    const isTerritoryHolderDraw=(band==="wilderness" && i===0);
    if(!isTerritoryHolderDraw && (typeof Math.random==="function"?Math.random():1) >= chance) break;   // a miss ends the draws
    const p=rollPartial("animal", { env:band, region, realm:realmId, pcClass });
    const isHolder=(band==="wilderness" && i===0);
    // ANIMAL-SOCIAL-HQ.md HQ-7 item 2: the mint-tail (landmark derivation, name fallback, soft/ambient/
    // promoted/named/homeNodeId stamps, cruelty-penalized codexAttitudeOpen) is now the shared
    // mintAnimalPartial helper below — this caller's genuine differences ({band, isHolder}) ride opts.
    const rec=mintAnimalPartial(w, p, nodeId, { band, isHolder });
    if(rec) minted.push(rec.id);
  }
  // ANIMAL-SOCIAL.md §5/§6 U6 — the guaranteed-scene-hook law, extended over wilderness animal pools
  // ("the hook rides the territory-holder's tell", matching interiors' own ensureSceneHook call in
  // prepCastAmbient above). Idempotent (ensureSceneHook itself skips a pool that already carries a
  // hooked record) — a re-visit within the session's idempotency cap never re-rolls. Anchored on the
  // territory-holder when this call minted one (the wilderness i===0 guarantee above); falls back to
  // ensureSceneHook's own recs[0] default for bands with no holder concept (rural/village/city/
  // dungeon), so the guarantee isn't wilderness-exclusive even though the spec text names wilderness.
  if(minted.length && typeof codexOf==="function" && typeof ensureSceneHook==="function"){
    const pool=minted.map(id=>codexOf(w).records[id]).filter(Boolean);
    const holder=pool.find(r=>r.dm && r.dm.territoryHolder) || null;
    ensureSceneHook(pool, holder);
  }
  return { minted:minted.length, ids:minted, band };
}

/* ANIMAL-SOCIAL.md §4/§6 U5 — a provisional name for a row-12 landmark animal (DM confirms later,
   same posture as rollPartial's child-name comment). Deterministic pick off a small local pool —
   never invents a fact beyond "this landmark animal has a name." */
const ANIMAL_LANDMARK_NAMES={
  wilderness:["Old Bramble","Thornback","Moss","Greywind","The Antler King"],
};
const ANIMAL_LANDMARK_NAMES_DEFAULT=["Juniper","Ash","Whisper","Thistle","Old Bell"];
function animalLandmarkName(band){
  const pool=ANIMAL_LANDMARK_NAMES[band]||ANIMAL_LANDMARK_NAMES_DEFAULT;
  return pool[Math.floor((typeof Math.random==="function"?Math.random():0)*pool.length)];
}

/* ANIMAL-SOCIAL-HQ.md HQ-7 item 2 — mintAnimalPartial(w, p, atId, opts): the six mint-tail rules
   duplicated between prepCastEnvAnimals and prepCastAmbientScene's animal branch, extracted into one
   helper. `p` is a rollPartial("animal",...) result; `atId` is the node/scene placement id (nodeId for
   the env caster, atId for the scene caster — same accessor, different variable name at the call
   site). `opts` carries each caller's GENUINE differences:
     - env caster:   { band, isHolder }         (wilderness territory-holder draw, envCast/envBand tag)
     - scene caster: { sceneBucket }            (market/tavern/shop/shrine tag, no holder concept)
   The six rules, now byte-identical for both callers (assert via JSON.stringify fixture, HQ-7 report):
     1. cruelty penalty       — nn.animalCruelty at atId -> -1 opening penalty, else 0.
     2. landmark derivation   — isLandmark = !!(p.dm && p.dm.landmark) (row-12 landmark draw).
     3. landmark-name fallback— animalLandmarkName(opts.band||null): the env caster passes its real
        band (wilderness's own name pool); the scene caster passes no band at all (opts.band
        undefined -> null), same as its old inline animalLandmarkName(null) call — NOT sceneBucket.
     4. soft:!isLandmark.
     5. promoted/named/homeNodeId stamps (+ ambient/territoryHolder/envCast/envBand vs sceneBucket —
        the one caller-specific dm-field set, folded in via extraDm below).
     6. codexAttitudeOpen (opening attitude = p.dm.attitude (default 0) + the cruelty penalty).
   Returns the minted record (or null/undefined if codexAdd declines), same as the old inline calls. */
function mintAnimalPartial(w, p, atId, opts){
  opts=opts||{};
  const isHolder=!!opts.isHolder;
  const isLandmark=!!(p.dm && p.dm.landmark);
  const nn=(typeof mapOf==="function")?mapOf(w).nodes[atId]:null;
  const crueltyPenalty=(nn && nn.animalCruelty)?-1:0;
  // the ONE caller-specific dm-field set: env casts tag envCast/envBand/territoryHolder; scene casts
  // tag sceneBucket. opts.sceneBucket is only ever supplied by the scene caster (the env caster never
  // sets it), so this discriminates the two callers without a separate "which caller" flag.
  const extraDm=(opts.sceneBucket!=null)
    ? { sceneBucket:opts.sceneBucket }
    : { envCast:true, envBand:opts.band, territoryHolder:isHolder||undefined };
  const rec=codexAdd(w, Object.assign({}, p, { kind:"npc",
    id:prepCastId(w, "npc", p.name||"animal-partial"),
    name:isLandmark?(p.name||animalLandmarkName(opts.band||null)):p.name,
    status:{ soft:!isLandmark, at:atId },
    dm:Object.assign({}, p.dm, { ambient:!(isHolder||isLandmark), partial:true, partialKind:p.partialKind },
      extraDm,
      { promoted:isLandmark||undefined, named:isLandmark||undefined, homeNodeId:isLandmark?atId:undefined })
  }));
  if(rec && typeof codexAttitudeOpen==="function"){
    const base=(p.dm && p.dm.attitude!=null) ? p.dm.attitude : 0;
    codexAttitudeOpen(w, rec.id, base+crueltyPenalty, { cause:"animal-opening" });
  }
  return rec;
}

/* ============================================================================
   NPC-PRESENCE-AND-HOOKS.md Component 2/3 — scene-typed ambient population + the guaranteed hook,
   for a SPECIFIC typed scene (a tavern/temple/shop's interior — world.urban's buildingApproach is the
   real call site; sceneTypeForBuildingKit maps its 12 kit ids onto the doc's four buckets). Distinct
   from prepCastAmbient's own generic node-level pool above (unchanged, byte-identical default path) —
   this is additive, opt-in machinery for callers that actually know their scene's type.
   ============================================================================ */

// scene-type -> base dice (docs/NPC-PRESENCE-AND-HOOKS.md Component 2's table, verbatim).
const AMBIENT_SCENE_BASE = { shrine:"d2", shop:"d3", tavern:"2d4", market:"3d6" };
// temperature band -> ambient-count multiplier — this file's implementation-fill (the doc sets the
// SHAPE, "mayhem realms run hot... shoulder to shoulder", not exact numbers, same posture as
// codex-roll.js's COHERENCE_LEVER_POOL comment): a sleepy hamlet's market is sparse, a breached/
// mayhem one runs dense.
const AMBIENT_SCENE_TEMP_MULT = { sleepy:0.5, ordinary:1, uneasy:1.25, strained:1.6, breached:2.25 };
// scene-bucket -> per-kind partial draw chance (NPC-PARTIALS.md "a market has kids + dogs"). Each
// kind gets up to 2 draws, each independently gated by this chance (a miss ends that kind's draws —
// no forced count). shrine/shop stay mostly adult-only; market/tavern carry the Amblin texture.
const SCENE_PARTIALS = {
  shrine: { child:0.10, animal:0.05 },
  shop:   { child:0.15, animal:0.10 },
  tavern: { child:0.10, animal:0.25 },
  market: { child:0.50, animal:0.50 },
};
/* ambientSceneCount(bucket, band) -> base-dice roll × temperature multiplier, rounded, floor 0.
   Unknown bucket -> "shop" (the doc's safest small-interior default, never a wider guess). */
function ambientSceneCount(bucket, band){
  const dice=AMBIENT_SCENE_BASE[bucket]||AMBIENT_SCENE_BASE.shop;
  const base=(typeof rollExpr==="function")?rollExpr(dice):1;
  const mult=(AMBIENT_SCENE_TEMP_MULT[band]!=null)?AMBIENT_SCENE_TEMP_MULT[band]:1;
  return Math.max(0, Math.round(base*mult));
}
/* sceneHookRoll() -> {text,pressure,ifIgnored,tags,band,ref} off the npc-hook d300 (cells shape per
   the table's own columns: [Band, Hook, Pressure/Clock, If Ignored, Tags] — verified against the
   compiled table + its source markdown header row, "Engine/03. _Tables/02. Social/Sentient NPCs/NPC
   Hook.md"). null when the table isn't compiled (null-safe, never fabricates). This is THE load-
   bearing shape Component 5 (world.wiring-a's turnIgnoredCheck) reads back via r.dm.hook.ifIgnored. */
function sceneHookRoll(){
  const roll=(typeof rollTable==="function")?rollTable("npc-hook"):null;
  if(!roll) return null;
  const cells=roll.cells||[];
  return { text:cells[1]||roll.text||null, pressure:cells[2]||null, ifIgnored:cells[3]||null,
           tags:cells[4]||null, band:roll.band||null, ref:"npc-hook#"+roll.total };
}
/* ensureSceneHook(recs, anchor?) — Component 3.1: if NONE of `recs` already carries dm.hook, draws ONE
   npc-hook and attaches it to `anchor` (or recs[0] absent one) — "never an empty room: the incurious
   player always has >=1 hook." Idempotent (a pool that already has a hooked NPC is left alone — never
   re-rolls, per ON-DEMAND-GEN's "immutable once revealed"). Returns the hooked record, or null (no
   candidate / table uncompiled). */
function ensureSceneHook(recs, anchor){
  const pool=(recs||[]).filter(Boolean);
  if(pool.some(r=>r.dm&&r.dm.hook)) return null;
  const target=anchor||pool[0];
  if(!target) return null;
  const hook=sceneHookRoll();
  if(!hook) return null;
  target.dm=target.dm||{}; target.dm.hook=hook;
  return target;
}
/* prepCastAmbientScene(w, nodeId, sceneBucket, opts) — mint a scene-typed ambient population + its
   guaranteed hook. opts: {atId? (status.at override, default nodeId — matches the existing proprietor
   placement convention in world.urban's buildingApproach, not a new per-building location scope),
   anchor? (the hook's preferred carrier, e.g. a building's proprietor record), realm? (an already-
   resolved live realm id, e.g. activeRealmsFor(null,w)[0] — see sceneTemperature's header)}.
   Null-safe: no codex/rollNPC -> {minted:0}. */
function prepCastAmbientScene(w, nodeId, sceneBucket, opts){
  if(!nodeId || typeof codexAdd!=="function" || typeof rollNPC!=="function") return {minted:0};
  opts=opts||{};
  const atId=opts.atId||nodeId;
  const region=(typeof regionForNode==="function")?regionForNode(w,nodeId):null;
  const realmId=opts.realm||(region&&region.realm)||null;
  const band=(typeof sceneTemperature==="function")?sceneTemperature(region,realmId):"ordinary";
  const bucket=AMBIENT_SCENE_BASE[sceneBucket]?sceneBucket:"shop";
  const count=ambientSceneCount(bucket, band);
  const minted=[];
  for(let i=0;i<count;i++){
    const payload=rollNPC({ region, walkOn:true });
    const rec=codexAdd(w, Object.assign({}, payload, {
      id:prepCastId(w, payload.kind||"npc", payload.name),
      status:Object.assign({ soft:true, at:atId }, payload.status||{}),
      dm:Object.assign({}, payload.dm, { ambient:true, sceneBucket:bucket })
    }));
    if(rec) minted.push(rec);
  }
  // scene-typed partials (NPC-PARTIALS.md) — kept OUT of the guaranteed-hook anchor pool: children
  // carry their own d50 `dm.saw` hook-analog (rollPartial's own already-built mechanism), animals a
  // `dm.tell` pointer — neither is the npc-hook d300 system, so ensureSceneHook must never touch them.
  const partials=[];
  if(typeof rollPartial==="function"){
    const pc=SCENE_PARTIALS[bucket]||{};
    // ANIMAL-SOCIAL-HQ.md HQ-1 (D2): the living PC (dm.js:1048 livingSheet inline pattern) — same
    // lookup as prepCastEnvAnimals, named livingChar here since `pc` above already means "partial
    // config" (SCENE_PARTIALS[bucket]), not "player character".
    const livingChar=(w.characters||[]).filter(c=>c&&c.status==="living").slice(-1)[0];
    const pcClass=(livingChar&&livingChar.sheet&&livingChar.sheet.class)||null;
    ["child","animal"].forEach(kind=>{
      const chance=pc[kind]||0;
      for(let i=0;i<2;i++){
        if((typeof Math.random==="function"?Math.random():1) >= chance) break;   // a miss ends this kind's draws
        // ANIMAL-SOCIAL-HQ.md HQ-1 (Change 2): forward realm + pcClass to rollPartial for every
        // scene-typed kind — rollPartial only reads opts.realm/opts.pcClass on its "animal" branch
        // (verified: src/engine/codex-roll.js:355-396, the "child" branch never reads them), so this
        // is harmless for kind==="child".
        const p=rollPartial(kind, { region, realm:realmId, pcClass });
        // ANIMAL-SOCIAL-HQ.md HQ-7 item 2: the animal branch's mint-tail now runs through the shared
        // mintAnimalPartial helper (same one prepCastEnvAnimals uses) — this caller's genuine
        // difference is {sceneBucket:bucket}, no {band, isHolder}. Child partials are OUT of scope
        // for the helper (mintAnimalPartial is animal-only; children never derive a landmark or run
        // the attitude ladder) — their own inline mint stays exactly as it was.
        const rec=(kind==="animal")
          ? mintAnimalPartial(w, p, atId, { sceneBucket:bucket })
          : codexAdd(w, Object.assign({}, p, { kind:"npc",
              id:prepCastId(w, "npc", p.name||(kind+"-partial")),
              name:p.name,
              status:{ soft:true, at:atId },
              dm:Object.assign({}, p.dm, { ambient:true, partial:true, partialKind:p.partialKind, sceneBucket:bucket,
                promoted:undefined, named:undefined, homeNodeId:undefined })
            }));
        if(rec) partials.push(rec);
      }
    });
  }
  const anchor=opts.anchor||minted[0];
  const anchorPool=opts.anchor ? minted.concat([opts.anchor]) : minted;
  const hooked=(typeof ensureSceneHook==="function") ? ensureSceneHook(anchorPool, anchor) : null;
  return { minted:minted.length, ids:minted.map(r=>r.id), partialIds:partials.map(r=>r.id),
           band, count, hookedId: hooked?hooked.id:null };
}

/* ============================================================================
   NPC-PRESENCE-AND-HOOKS.md Component 3.2 — hook discovery on interaction. Called from dm.js's
   codex_contact case (the real "player touched this NPC" seam) — NOT rolled at mint (demand-driven:
   "hooks cost nothing until the player's curiosity spends them"). Discovery chance rides the SAME
   sceneTemperature band the ambient population above reads.
   ============================================================================ */

// temperature band -> hook-discovery chance (docs/NPC-PRESENCE-AND-HOOKS.md Component 3's table
// verbatim; breached/mayhem's "~95-100%" implemented as this file's own midpoint fill, 97.5%).
const HOOK_DISCOVERY_CHANCE = { sleepy:0.30, ordinary:0.50, uneasy:0.65, strained:0.80, breached:0.975 };
/* hookDiscoveryChance(w, rec) -> the discovery chance for THIS npc record, read off its own status.at
   node's region + the live active realm (activeRealmsFor(null,w) — the marooned-in-a-realm signal;
   engine.dungeon-walk, already the shared resolver every other realm-aware consumer uses). No node/
   region -> "ordinary" (the documented default temperature, same fallback coherenceTemperature uses). */
function hookDiscoveryChance(w, rec){
  const nodeId=rec && rec.status && rec.status.at;
  const region=(nodeId && typeof regionForNode==="function") ? regionForNode(w, nodeId) : null;
  const activeRealms=(typeof activeRealmsFor==="function") ? activeRealmsFor(null, w) : [];
  const realmId=(activeRealms && activeRealms[0]) || null;
  const band=(typeof sceneTemperature==="function") ? sceneTemperature(region, realmId) : "ordinary";
  return (HOOK_DISCOVERY_CHANCE[band]!=null) ? HOOK_DISCOVERY_CHANCE[band] : HOOK_DISCOVERY_CHANCE.ordinary;
}
/* hookDiscoveryRoll(w, rec) — ONE discovery attempt for an ambient NPC's hook, per Component 3.2:
   success draws a REAL npc-hook (attached to rec.dm.hook — immutable once revealed, the caller must
   never call this twice on the same record); failure -> the NPC stays texture, their one want carries
   the beat (no retry, no partial reveal). Returns {found:bool, hook?, chance}. Never rolls when `rec`
   already carries a hook (guaranteed-scene-hook may have beaten discovery to it) — reports
   {found:true, preExisting:true} instead of double-hooking. */
function hookDiscoveryRoll(w, rec){
  if(!rec) return {found:false};
  if(rec.dm && rec.dm.hook) return {found:true, preExisting:true};
  const chance=hookDiscoveryChance(w, rec);
  const roll=(typeof Math.random==="function")?Math.random():1;
  if(roll>=chance) return {found:false, chance};
  const hook=(typeof sceneHookRoll==="function")?sceneHookRoll():null;
  if(!hook) return {found:false, chance};
  rec.dm=rec.dm||{}; rec.dm.hook=hook;
  return {found:true, hook, chance};
}

/* MONSTER-PARLEY §3 — a befriended creature (attitude >= Friendly, +1) joins the prep pre-cast pool,
   SAME eligibility as a known NPC: it can recur as an ally, get cast into a walk's frontier, or stand
   as a questgiver ("the wolf that led you to the den mouth"). Pure read — never mutates the codex;
   startPrep/the frontier-cast logic decides whether/how to actually place one. Degrades to [] if the
   codex or attitude reader isn't loaded (never throws, never fabricates eligibility). */
function prepEligibleCompanionCreatures(w){
  if(typeof codexOf!=="function" || typeof codexGetAttitude!=="function") return [];
  const recs=Object.values(codexOf(w).records||{}).filter(r=>r.kind==="creature");
  return recs.filter(r=>{
    const a=codexGetAttitude(w, r.id);
    return a && typeof a.value==="number" && a.value>=1;
  });
}

// evocative-but-vague label for a soft frontier (reskinned by the DM on contact)
function prepNodeLabel(envEntry){
  const wk=envEntry.walk, su=wk.setup||{};
  if(envEntry.kind==="urban")      return `${su.skin||su.type||"A quarter"} (rumored)`;
  if(envEntry.kind==="dungeon")    return `${su.type||"A deep place"} (rumored)`;
  if(envEntry.kind==="wilderness") return `The ${wk.startBiome||"far"} reaches (rumored)`;
  return `A frontier (rumored)`;
}

// drop a prior session's UNVISITED soft prep (recycle) so the map stays clean
function prepRecycleStale(w){
  const P=prepOf(w), m=mapOf(w); let n=0;
  Object.keys(P.nodes||{}).forEach(id=>{
    const pn=P.nodes[id];
    if(pn && pn.soft && !pn.locked && m.nodes[id]){
      delete m.nodes[id];
      m.edges = m.edges.filter(e=>e.from!==id && e.to!==id);
      delete P.nodes[id]; n++;
    }
  });
  if(n) addLedger(w,"session",{kind:"prep-recycle",n},`${n} unvisited rumor${n===1?"":"s"} from last session fade — recycled into the next prep.`);
  // bound the soft codex pool: the cast of recycled frontiers is now orphaned. Evict the oldest beyond
  // the cap, protecting any record still bound to a surviving node (locked frontiers / real places).
  if(typeof codexEvictSoft==="function"){
    const keep=[];
    Object.keys(m.nodes).forEach(id=>{ const nn=m.nodes[id]; if(nn&&nn.codexId) keep.push(nn.codexId); });
    Object.keys(P.nodes||{}).forEach(id=>{ const pc=P.nodes[id]&&P.nodes[id].cast; if(!pc) return;
      if(pc.locId) keep.push(pc.locId); (pc.npcIds||[]).forEach(x=>keep.push(x)); (pc.itemIds||[]).forEach(x=>keep.push(x)); (pc.artIds||[]).forEach(x=>keep.push(x)); });
    const ev=codexEvictSoft(w,{keepIds:keep});
    if(ev) addLedger(w,"session",{kind:"codex-evict",n:ev},`${ev} unmet ${ev===1?"figure":"figures"} from old rumors fade from memory.`);
  }
  return n;
}

/* a codex id that won't collide with an existing record — two cast entities can roll the same name
   (place-master-setting is a d300, but a session casts several), and codexAdd merges on id, which would
   silently collapse two distinct cast entities into one. Disambiguate so each cast record is its own.
   This is the LAST-RESORT fallback (id-only, name still duplicate) — prepCastNoDupe (below) rerolls the
   actual draw first so the -N suffix path is rarely hit for locations/items. */
function prepCastId(w, kind, name){
  const base=codexKeyId(kind, name); let id=base, i=2;
  while(codexGet(w,id)) id=base+"-"+(i++);
  return id;
}

/* PREP-NAME-COLLISIONS fix: true iff a codex record of the same `kind` already carries this exact
   `name` (case/whitespace-insensitive — codexKeyId's own slug already normalizes this way, matched
   here so "The Tide That Stopped" vs "the tide that stopped" both count as the same name). */
function prepNameTaken(w, kind, name){
  if(!name || typeof codexOf!=="function") return false;
  const key=slug(name);
  return Object.values(codexOf(w).records||{}).some(r=>r.kind===kind && slug(r.name||"")===key);
}

/* reroll a cast payload (bounded retries) when its name collides with a same-kind record already in
   THIS world's codex — same table path (engine owns the nouns; never invent a name in code), never a
   silent code-side rename. `reroller` re-runs the exact roll (rollPlace/rollItem) that produced
   `payload`; called again on each retry so a fresh table draw is what breaks the tie, not a suffix.
   Bounded at 5 rerolls: if the table keeps handing back the same name after 5 honest draws, that's the
   dice — prepCastId's -N suffix is the deliberate fallback, not a first resort. */
function prepCastNoDupe(w, kind, payload, reroller){
  if(!payload || typeof reroller!=="function") return payload;
  let cur=payload, tries=0;
  while(cur && prepNameTaken(w, kind, cur.name) && tries<5){ cur=reroller(); tries++; }
  return cur||payload;
}

/* CODEX Phase 3 (docs/CODEX.md §4) — mint a frontier's rolled cast as SOFT prep records, bind the
   location to the frontier node, and place the NPCs there. The engine deals the cast; the DM's synthesis
   CONNECTS it (assigns kin/holders/dramatic links). No-op if the codex/rollers aren't loaded. */
function prepCastFrontier(w, nodeId, env){
  if(!env.cast || typeof codexAdd!=="function") return null;
  const m=mapOf(w), nn=m.nodes[nodeId], pn=prepOf(w).nodes[nodeId];
  // PREP-NAME-COLLISIONS: reroll the location on a same-kind name collision (bounded, same table path)
  // before minting — catches both a re-drawn table row AND two frontiers in this pass landing on the
  // same named place. Falls back to prepCastId's -N suffix only if 5 honest rerolls still collide.
  // PLACE-GEN §5 unit 2 rider (ADDENDUM §4): thread the node's realm into the reroll draw, same
  // node->realm derivation buildingApproach/mintDistricts use (U6) — regionForNode(w,nodeId).realm,
  // default 'frontier' inside rollPlace itself when null. Never overrides an opts.realm the caller
  // already supplied (there is none here — this is the reroll-on-collision path only).
  const frontierRealm=(typeof regionForNode==="function")
    ? (function(){ const r=regionForNode(w,nodeId); return r&&r.realm; })() : null;
  let loc=env.cast.location;
  if(loc && typeof rollPlace==="function") loc=prepCastNoDupe(w,"location",loc,()=>rollPlace({ art:true, realm:frontierRealm||undefined }));
  let locId=null;
  if(loc){
    const lr=codexAdd(w, Object.assign({}, loc, { id:prepCastId(w,loc.kind||"location",loc.name), provenance:"prep" }));
    locId=lr.id; if(nn) nn.codexId=lr.id; if(pn) pn.locId=lr.id;
  }
  const npcIds=[];
  (env.cast.npcs||[]).forEach(npc=>{
    const nr=codexAdd(w, Object.assign({}, npc, { id:prepCastId(w,npc.kind||"npc",npc.name), provenance:"prep",
      status:Object.assign({}, npc.status, locId?{ at:locId }:{}) }));
    npcIds.push(nr.id);
  });
  const itemIds=[];
  if(env.cast.item){                                        // the macguffin — placed at the location; the DM links who holds it
    // PREP-NAME-COLLISIONS: same reroll guard as the location, above. A table that genuinely rolls the
    // same item twice (after 5 honest tries) is the dice — kept, not suffixed-and-hidden.
    let item=env.cast.item;
    const wantLock=!!(item.rolled&&item.rolled.lock);
    if(typeof rollItem==="function") item=prepCastNoDupe(w,"item",item,()=>rollItem({ lock:wantLock }));
    // PLOT-ITEM-RECURRENCE (dev/top-band-uniqueness-report.md #53/#54): a Mythic plot-item fire carries
    // `origin:"plot-item:<row>"` — the SAME row minting a second time in this world (via prep's frontier
    // cast, same as genApply's live gen[] path) is the legendary thing resurfacing, not a fresh mint.
    // codexAdd always allocates item.id fresh here (prepCastId), so unlike genApply this path would
    // otherwise mint a byte-identical duplicate under a new id — check first, same as the gen[] seam.
    const existingItem=(item&&item.origin&&typeof codexFindByOrigin==="function")
      ? codexFindByOrigin(w, item.origin, "item") : null;
    if(existingItem){
      itemIds.push(existingItem.id);
    } else {
      const ir=codexAdd(w, Object.assign({}, item, { id:prepCastId(w,item.kind||"item",item.name), provenance:"prep",
        status:Object.assign({}, item.status, locId?{ at:locId }:{}) }));
      itemIds.push(ir.id);
    }
  }
  // CONSEQUENCE LADDER (§11): hook/thread-seed art on the location becomes its own SOFT codex HANDLE,
  // linked part-of the place. Tags live in `dm` (codexAdd preserves dm, drops unknown top-level fields);
  // `needsEffectDie` is the prep-time generation REQUEST — the DM generates the bespoke die (§8) and a
  // capture event fills `dm.effectDie` (clResolveStoredEffect reads it). seamHarvest reads dm.legs/pool.
  const artIds=[];
  if(locId && loc && loc.dm && Array.isArray(loc.dm.artHandles)){
    loc.dm.artHandles.forEach(a=>{
      const title=((a.text||"").split(":")[0]||"A painting").trim();
      // placement via status.at (like NPCs/items) — NOT a link: codexEvictSoft protects linked records,
      // so a link would make these throwaway flavor handles un-evictable and leak the soft pool.
      const ar=codexAdd(w, { kind:"art", name:title, provenance:"prep",
        fields:{ desc:a.text||null, band:a.band||null },
        dm:{ legs:a.legs||null, pool:a.pool||null, band:a.band||null, effectDie:null,
             needsEffectDie:(a.legs==="hook"||a.legs==="thread-seed") },
        status:locId?{ at:locId }:{} });
      if(ar&&ar.id) artIds.push(ar.id);
    });
  }
  if(pn) pn.cast={ locId, npcIds, itemIds, artIds };
  return { locId, npcIds, itemIds, artIds };
}

/* stage prep for the current session: assemble + bind soft frontiers. Returns the DM handoff text. */
function startPrep(w, opts){
  if(!w || typeof assemblePrepBundle!=="function") return "(prep engine unavailable)";
  const P=prepOf(w);
  // ON-DEMAND-GEN §8: the session-provenance watermark — captured BEFORE this session's own casting
  // (ambient/frontier/gen mints) runs, so seamHarvest's sessionProvenance counts everything minted this
  // session (record.seq > watermark), including prep's own casts.
  w.dm=w.dm||{}; w.dm.sessionSeqWatermark=(typeof codexOf==="function")?(codexOf(w).seq||0):(w.dm.sessionSeqWatermark||0);
  if(typeof ensureCodex==="function") ensureCodex(w);    // migrate gazetteer/factions → codex first
  prepRecycleStale(w);                                   // clear last session's untouched rumors
  if(P.activeWalkId && !mapOf(w).nodes[P.activeWalkId]) P.activeWalkId=null;   // WALK-CONSUMPTION: drop a dangling active walk
  // ON-DEMAND-GEN §6: the CURRENT node's ambient pool, cast BEFORE frontiers (so the soft-cap raise
  // below already accounts for it when frontier casts run their own eviction bookkeeping).
  if(typeof nodeInhabited==="function" && typeof prepCastAmbient==="function" && nodeInhabited(w,w.currentNodeId)){
    prepCastAmbient(w, w.currentNodeId);
  }
  // A bundle is session-scoped, but a contacted/suspended walk is world history. Freeze any legacy
  // bundle-backed walk onto its prep node before replacing P.bundle; new nodes below store their walk
  // directly from birth. This is additive save migration and makes any number of walks resumable.
  if(P.bundle&&Array.isArray(P.bundle.environments)) Object.keys(P.nodes||{}).forEach(id=>{
    const pn=P.nodes[id], env=pn&&P.bundle.environments[pn.idx];
    if(pn&&!pn.walk&&env&&env.walk) pn.walk=env.walk;
  });
  const bundle=assemblePrepBundle(Object.assign({ world:w }, opts||{}));
  P.session=w.session||0; P.bundle=bundle; P.overlays={}; P.harvest=null;
  const from=w.currentNodeId, m=mapOf(w);
  bundle.environments.forEach((env,i)=>{
    // explicit per-session id — frontier labels can repeat across sessions (same skin/biome),
    // and a slug-of-name collision would resurrect a recycled rumor. Unique id avoids that.
    const id=`frontier-s${w.session||0}-${i}`;
    m.nodes[id]={ id, name:prepNodeLabel(env), type:"Frontier", soft:true, prep:{ env:env.kind, idx:i } };
    P.nodes[id]={ env:env.kind, idx:i, soft:true, locked:false, hook:env.hook, walk:env.walk };
    prepAttachSpatialPlan(w,id);                          // text-first object identity exists before synthesis or any visual mount
    if(from && from!==id && !findEdge(w,from,id)){
      m.edges.push({ from, to:id, soft:true, hook:true, bearing:"?", travelMin:0, leagues:0 });
    }
    prepCastFrontier(w, id, env);                        // CODEX: cast the soft entities for this frontier
  });
  const cast=bundle.environments.reduce((n,e)=>n+(e.cast?1+(e.cast.npcs||[]).length+(e.cast.item?1:0):0),0);
  addLedger(w,"session",{kind:"prep",session:w.session,envs:bundle.environments.map(e=>e.kind),cast},
    `Prep staged — ${bundle.environments.length} frontiers rumored on the edge of the map${cast?`, ${cast} soft entities cast`:""}.`);
  reveal(w,'map',"The map. It grows only where you walk — and now, where rumor points.");
  return prepHandoff(w);
}

/* the DM handoff — what the player copies to run the staged synthesis over the Bridge. */
function prepHandoff(w){
  const P=prepOf(w); if(!P.bundle) return "(no prep staged — begin a session first)";
  const summary=(typeof prepBundleSummary==="function")?prepBundleSummary(P.bundle):P.bundle;
  return [
`PREP HANDOFF — Session ${w.session||0} of "${w.name}".`,
`Run the staged Session-Prep synthesis (docs/SYNTHESIS-CONTRACT.md): Stage 1 (synthesis-harvest) on the`,
`summary below to find the throughline latent in these rolls, then Stage 2 (synthesis-reskin) per`,
`environment on the full walks. Honor the rolls (annotate by ref, never rewrite); the result enriches`,
`the rumored frontiers. Apply it back with a {type:"prep_applied", payload:{harvest, overlays}} event.`,
``,
`— BUNDLE SUMMARY (Stage-1 input) —`,
JSON.stringify(summary,null,1),
``,
`— FULL BUNDLE (Stage-2 input: full walks) —`,
JSON.stringify(P.bundle,null,1),
  ].join("\n");
}

function copyPrepHandoff(){
  const w=activeWorld(); if(!w) return;
  if(!prepOf(w).bundle){ toast("No prep staged — begin a session first"); return; }
  const txt=prepHandoff(w);
  if(navigator&&navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>toast("Prep handoff copied — run it with your DM ✦"),()=>fallbackCopy(txt));
  else fallbackCopy(txt);
}

/* apply the DM's synthesis result back into prep: enrich frontiers + write soft new-canon.
   result: { harvest?, overlays: { <env>: synthesis-overlay/v1 } | [overlay,...] } */
function applyPrep(w, result){
  const P=prepOf(w); if(!P.bundle) return {ok:false, reason:"no-prep"};
  result=result||{};
  let overlays=result.overlays||result;
  if(Array.isArray(overlays)){ const map={}; overlays.forEach(o=>{ if(o&&o.env) map[o.env]=o; }); overlays=map; }
  P.overlays=overlays;
  if(result.harvest){ P.harvest=result.harvest;
    addLedger(w,"session",{kind:"prep-throughline",source:"prep"},
      `Throughline (soft): ${result.harvest.dramaticQuestion||result.harvest.throughline||"set"}.`); }
  const m=mapOf(w);
  Object.keys(P.nodes).forEach(id=>{
    const pn=P.nodes[id], ov=overlays[pn.env]; if(!ov) return;
    pn.briefing=ov.briefing||null; pn.segments=ov.segments||null;
    pn.overlaid=true;                                    // applyPrep ran for this env — set regardless of whether briefing/segments came back null
    if(pn.needsReskin) pn.needsReskin=false;             // WALK-CONSUMPTION (Step B): the promoted frontier is now reskinned
    const nn=m.nodes[id]; if(nn) nn.brief=ov.briefing||null;
    prepAttachSpatialPlan(w, id);                        // DUNGEON-GRAPH.md U4 §1 — dungeon-shaped frontiers get pn.spatial here, same overlay home as pn.segments above
  });
  let canonN=0;
  Object.keys(overlays).forEach(env=>{ (overlays[env].newCanon||[]).forEach(nc=>{
    addLedger(w,"canon",{kind:nc.type||"fact",name:nc.name,soft:true,source:"prep"},
      `◆ (soft) ${nc.name||nc.type||"fact"}${nc.detail?(" — "+nc.detail):""}`); canonN++; }); });
  return {ok:true, enriched:Object.keys(overlays).length, softCanon:canonN};
}

/* PREP-AUTOPILOT (docs/PREP-AUTOPILOT.md §1, BATCH-GUARDRAILS G8) — the digest signal that tells the
   DM loop deep prep synthesis is owed. Present IFF P.bundle exists AND (≥1 prep FRONTIER node lacks an
   overlay [pn.overlaid still falsy — applyPrep never ran for its env] OR has needsReskin [a WALK-
   CONSUMPTION promotion re-anchored a frontier post-synthesis]). `kind:"travel"` nodes are skipped
   entirely — they never receive a briefing overlay (mirrors the travel carve-out walkComplete /
   walkPromoteNext already honor), so counting them as no-overlays would spuriously re-fire the fan-out
   for every active travel leg. Shape EXACTLY {session, frontiers:["id (env)"...],
   reason:"no-overlays"|"needsReskin"} — needsReskin wins when both kinds of node are pending. Absent
   (null) otherwise — its absence is the all-clear the DM loop reads to skip the fan-out. */
function prepPendingDigest(w){
  const P=prepOf(w); if(!P.bundle) return null;
  const noOverlay=[], needsReskin=[];
  Object.keys(P.nodes).forEach(id=>{
    const pn=P.nodes[id];
    if(pn.kind==="travel") return;                        // travel nodes never get a briefing overlay — not a frontier
    if(pn.needsReskin) needsReskin.push(id+" ("+pn.env+")");
    else if(!pn.overlaid) noOverlay.push(id+" ("+pn.env+")");
  });
  if(!noOverlay.length && !needsReskin.length) return null;
  return { session:P.session||0, frontiers:(needsReskin.length?needsReskin:noOverlay),
           reason:needsReskin.length?"needsReskin":"no-overlays" };
}

/* the player makes contact with a rumored frontier → it locks to hard canon (Charter §8.4).
   returns the frontier's prepped walk so the DM can run it. */
function lockOnContact(w, nodeId){
  const P=prepOf(w), m=mapOf(w), nn=m.nodes[nodeId], pn=P.nodes&&P.nodes[nodeId];
  if(!nn) return {ok:false, reason:"no-node"};
  if(!nn.soft){ walkSetActive(w,nodeId); return {ok:true, already:true, walk:walkOfFrontier(w,nodeId)}; }   // re-entry resumes the cursor
  nn.soft=false; if(pn) pn.locked=true;
  nn.name=nn.name.replace(/\s*\(rumored\)\s*$/,"");   // the rumor becomes a real place
  m.edges.forEach(e=>{ if((e.to===nodeId||e.from===nodeId)&&e.soft) e.soft=false; });
  // touch = canon (§8b): the frontier's cast LOCATION locks soft→hard on entry. Its NPCs stay soft
  // (a reusable pool) until the player actually meets one — then the DM emits codex_contact.
  if(nn.codexId && typeof codexContact==="function") codexContact(w, nn.codexId);
  addLedger(w,"canon",{kind:"prep-contact",nodeId,source:"play"},`◆ ${nn.name.replace(/\s*\(rumored\)\s*$/,"")} — entered; the rumor is now real.`);
  walkSetActive(w,nodeId);                              // WALK-CONSUMPTION: the party steps onto this walk
  return {ok:true, node:nn, walk:walkOfFrontier(w,nodeId), overlay:pn?P.overlays[pn.env]:null};
}

function walkOfFrontier(w, nodeId){
  const P=prepOf(w), pn=P.nodes&&P.nodes[nodeId];
  if(!pn) return null;
  if(pn.walk) return pn.walk;               // TRAVEL-WALKS (G5): stored directly on the node's prep slot
  if(!P.bundle || !P.bundle.environments[pn.idx]) return null;
  return P.bundle.environments[pn.idx].walk;
}

/* TRAVEL-WALKS (docs/TRAVEL-WALKS.md §1, BATCH-GUARDRAILS G5) — mint a travel walk and store it under
   the DESTINATION node's prep slot, matching the frontier shape (P.nodes[id] = {env,soft,locked,hook,
   cursor,...}) plus `kind:"travel"` + the journey's origin/dest/travelMin. Activates it immediately
   (currentNodeId does NOT move — §1 step 4). Returns {ok,walk}. */
function prepStartTravelWalk(w, opts){
  opts=opts||{};
  const { destNodeId, originNodeId, travelMin, walk } = opts;
  if(!destNodeId || !walk) return {ok:false, reason:"bad-opts"};
  const P=prepOf(w);
  P.nodes[destNodeId] = { env:"wilderness", soft:false, locked:false, hook:null,
    kind:"travel", originNodeId:originNodeId||null, destNodeId, travelMin:travelMin||0,
    walk, cursor:null };
  const r=walkSetActive(w, destNodeId);
  return { ok:!!r.ok, walk, current:r.current };
}

/* ============================================================
   WALK CONSUMPTION (docs/WALK-CONSUMPTION.md) — the cursor + provenance layer. The DM is handed the
   active walk every turn (dm.activeWalkDigest) and stops forgetting it until it is walked out. The
   engine owns the cursor (where the party stands); the DM only narrates and emits walk_advance /
   walk_complete. All script-owned state lives on w.prep — never DM memory.
   ============================================================ */

// the first segment of a walk (BFS entry; segments are 1-indexed by `num`)
function walkEntrySeg(walk){
  if(!walk || !walk.segments || !walk.segments.length) return 1;
  const e=walk.segments.find(s=>s.depth===0); return e?e.num:walk.segments[0].num;
}

/* ============================================================
   DUNGEON-GRAPH.md U4 — walk binding. Room-enter == segment-enter: the EXISTING cursor above (pn.cursor)
   IS the room the party stands in once a spatial plan exists — no second consumption path, no new event.
   pn.spatial lives in the SAME prep-node overlay pn.segments already occupies (applyPrep, above);
   attached once at prep time (walkId = the walk's storage key = the P.nodes id, so spatializePlan's
   determinism law — same walkId ⇒ byte-identical cells — holds across re-entries/replays).
   ============================================================ */

/* attach a spatial+semantic plan to a dungeon-shaped frontier's prep-node overlay. Scoped to
   `kind`-less frontier nodes only (never travel/job walks — their env is never "dungeon" for travel,
   and job walks are deliberately excluded so a dungeon-envHint job walk stays untouched, matching
   this unit's literal "prep-node overlay… same home as pn.segments" scope) whose rolled walk is
   actually environment:"dungeon" with a non-empty segment graph. Residents: prep time never rolls
   creature stat data (dwalkEncounter mints archetype/composition strings, not scaleVsHuman) — so this
   always starts from pn.spatialResidents (default []), a pure human-scale plan; prepReSemanticizeSpatial
   is the seam a LATER encounter-roll caller can use to re-derive scale domains once real resident data
   exists (U4 does not invent that data itself, per the unit's own instruction). Every other environment
   is completely untouched (pn.spatial is simply never set) — the BYTE-GATE (walk store shape for
   non-dungeon walks identical before/after this unit) holds because this function returns before any
   write when the guard fails. Honest-fail per U1/U2's own law: a plan/semantics call that can't verify
   throws inside spatializePlan/semanticizePlan — caught here so a mechanically-honest failure never
   crashes prep; pn.spatial simply stays null (identical to "no spatial surface" pre-U4). */
function prepAttachSpatialPlan(w, id){
  const P=prepOf(w), pn=P.nodes&&P.nodes[id];
  if(!pn || pn.kind==="travel" || pn.kind==="job" || pn.env!=="dungeon") return null;
  if(typeof spatializePlan!=="function" || typeof semanticizePlan!=="function") return null;
  const walk=walkOfFrontier(w,id);
  if(!walk || walk.environment!=="dungeon" || !Array.isArray(walk.segments) || !walk.segments.length) return null;
  try{
    const plan0=spatializePlan(walk.segments, walk.topology, { walkId:id });
    pn.spatialResidents=pn.spatialResidents||[];
    pn.spatial=semanticizePlan(plan0, walk.segments, pn.spatialResidents);
    if(typeof bindWalkInteractables==="function" && typeof reconcileWalkInteractableState==="function"){
      const realms=(typeof activeRealmsFor==="function")?activeRealmsFor(walk.skin,w):null;
      const projected=bindWalkInteractables(pn.spatial,walk,{walkId:id,realmId:realms&&realms[0]});
      reconcileWalkInteractableState(pn,projected.interactables||[]);
    }
  }catch(e){
    pn.spatial=null;   // honest-fail, never a hand-patched plan (mirrors U1/U2's own discipline)
  }
  return pn.spatial;
}

/* the re-semanticize seam (U4 §1): callable once real resident data lands (a future encounter-roll
   unit) to re-derive scale domains WITHOUT re-rolling the geometry — spatializePlan is walkId-seeded,
   so re-running it with the SAME walkId reproduces the identical cells buffer; only semanticizePlan's
   residents-driven layer changes. Never invents an encounter roll itself — the caller supplies
   `residents` ([{segNum,sizeBand,scaleVsHuman,apex}], place-semantics.js's own shape). */
function prepReSemanticizeSpatial(w, id, residents){
  const P=prepOf(w), pn=P.nodes&&P.nodes[id];
  if(!pn || !pn.spatial) return null;
  const walk=walkOfFrontier(w,id);
  if(!walk || typeof spatializePlan!=="function" || typeof semanticizePlan!=="function") return null;
  try{
    const plan0=spatializePlan(walk.segments, walk.topology, { walkId:id });
    pn.spatialResidents=residents||[];
    pn.spatial=semanticizePlan(plan0, walk.segments, pn.spatialResidents);
  }catch(e){
    return null;
  }
  return pn.spatial;
}

/* U4 §2 — segment cursor → room mapping. Consumers (U3's tray render + dm.js's combat cell-dims seam)
   ask "which room is the party in" from the EXISTING walk cursor (pn.cursor.current) through this one
   pure lookup — no new consumption path, no walkComplete change. Null-safe: no spatial plan / no
   matching room ⇒ null (never a fabricated room). */
function spatialRoomForSeg(pn, segNum){
  if(!pn || !pn.spatial || !Array.isArray(pn.spatial.rooms)) return null;
  return pn.spatial.rooms.find(r=>r.segNum===segNum) || null;
}

/* BEAUTY-WAVE.md VP6 item 4 — VISIBLE HISTORY. On hit/death the render layer (src/ui/theater-boot.js's
   VP6 decal render pass) drops a seeded blood/scorch decal CARD at the event cell; this is the PERSIST
   half — the codex place remembers its battles across visits, stamped onto the spatial overlay so a
   room's fight history survives a re-render/re-entry the same way pn.spatial.positions (U4 §4, above)
   survives one.
   DEVIATION NOTE (documented, not silent): the VP6 spec text names the persistence field
   "pn.spatial.dressing" — but that name is ALREADY OWNED by src/engine/place-dressing.js's dressPlan(),
   whose own header is explicit that its `plan.dressing` output is a PURE, regenerate-every-call
   derivation (roster cards from REALM_DRESSING, "same (plan,opts) snapshot always yields byte-identical
   dressing arrays"). Persisting mutable combat-decal state onto that same key would either get silently
   stomped the next dressPlan() call or corrupt dressPlan's own purity contract depending on call order —
   a real collision, not a nitpick. This stamps a SIBLING field, `pn.spatial.decals` (keyed by roomSegNum,
   same "which room" addressing spatialRoomForSeg already uses), keeping both channels honest: dressPlan's
   output stays pure-regenerated, decals stay persistent-mutated.
   CAP: max INTERIOR_DECAL_CAP (12) stamps per room, FIFO (oldest evicted first) — persistence is the
   feature, unbounded growth is not (a grinding room across a whole campaign must not accrete forever).
   CHILD CARVE-OUT (MECHANICAL, not tone-of-voice): a decal tagged childTagged:true is NEVER stamped as
   "blood" — silently downgraded to "impact" (dust/scuff, no gore) before it ever reaches the array, so
   there is no code path where a child-tagged entity's death leaves a blood decal, full stop. */
const INTERIOR_DECAL_CAP = 12;
function prepStampInteriorDecal(pn, segNum, decal){
  if(!pn || !pn.spatial || !decal) return null;
  pn.spatial.decals = pn.spatial.decals || {};
  const key = String(segNum);
  const room = pn.spatial.decals[key] = pn.spatial.decals[key] || [];
  const stamped = Object.assign({}, decal);
  if(stamped.childTagged && stamped.kind === "blood") stamped.kind = "impact"; // MECHANICAL carve-out
  room.push(stamped);
  while(room.length > INTERIOR_DECAL_CAP) room.shift(); // FIFO — oldest evicted first
  return stamped;
}
/* companion read: every decal stamped for a room, in FIFO (oldest-first) order — the render layer's own
   consumption point (setInteriorBoard's `data.decals`, sourced by whatever caller resolves the current
   room's pn before building the board — this file stays render-agnostic, same split as spatialRoomForSeg). */
function spatialDecalsForSeg(pn, segNum){
  if(!pn || !pn.spatial || !pn.spatial.decals) return [];
  return pn.spatial.decals[String(segNum)] || [];
}

/* U4 §4 — the mechanical repositioning seam (Adam's ruling, docs/DUNGEON-GRAPH.md status line: desired,
   minimal). Board-piece positions live as DATA on the spatial overlay itself: pn.spatial.positions =
   { <pieceId>: {segNum, x, y, isPlayer} } — a per-piece record naming which room it's in and its
   cell-space (x,y) within that room. spatialRepositionOnTimePass(pn, minutes) is a PURE function of
   its own inputs (pn.spatial.seed — the SAME deterministic seed spatializePlan derived from walkId —
   plus the piece id plus `minutes`): calling it twice with the identical pn.spatial.seed/pieceId/minutes
   always drifts to the identical cell, so a caller re-deriving "where should this piece be at elapsed=X"
   never needs to replay every earlier tick. Every NON-player piece drifts to a uniformly-picked FLOOR
   cell within its OWN room's rect (never a WALL/VOID/DOOR cell, never a different room — this is a
   drift, not a route); the player's piece (isPlayer:true) is NEVER touched — DM-agency law: never move
   the player's own piece. Data-only: no render code, no scheduler wiring (the passTime caller hookup is
   a later unit) — this file only exports the function and lets a caller (or a test) invoke it. Mutates
   pn.spatial.positions in place (matching the store's own "positions live on the overlay" law) and
   returns the same positions map for convenience. No-op (returns null) when there's no spatial plan or
   no positions have been placed yet — this unit does not invent piece placement, only drift once some
   exists. */
function spatialRepositionOnTimePass(pn, minutes){
  if(!pn || !pn.spatial || !Array.isArray(pn.spatial.rooms) || !pn.spatial.positions) return null;
  const plan=pn.spatial, positions=plan.positions, cellW=plan.cellW, cells=plan.cells;
  const roomBySeg={}; plan.rooms.forEach(r=>{ roomBySeg[r.segNum]=r; });
  const seedBase=(plan.seed!=null) ? plan.seed : 0;
  const cellCode=(typeof SPATIAL_CELL!=="undefined") ? SPATIAL_CELL.FLOOR : 1;
  // small deterministic string hash + mulberry32 PRNG — same reference pattern place-spatialize.js's
  // dspHashStr/dspMulberry32 use, duplicated here (not shared) so this file stays a pure w-taking
  // module with no cross-file internal-helper dependency (spatializePlan/semanticizePlan are the only
  // cross-module surface this unit reaches for).
  const hashStr=(s)=>{ let h=5381; const str=String(s); for(let i=0;i<str.length;i++) h=((h<<5)+h+str.charCodeAt(i))|0; return h>>>0; };
  const rngFor=(pieceId)=>{ let a=hashStr(seedBase+"|"+pieceId+"|"+minutes)>>>0;
    return function(){ a|=0; a=(a+0x6d2b79f5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; };
  Object.keys(positions).forEach(pieceId=>{
    const piece=positions[pieceId];
    if(!piece || piece.isPlayer) return;                 // DM-agency law: never move the player's piece
    const room=roomBySeg[piece.segNum]; if(!room) return;
    const floorCells=[];
    for(let yy=room.y; yy<room.y+room.d; yy++) for(let xx=room.x; xx<room.x+room.w; xx++){
      const idx=yy*cellW+xx; if(cells[idx]===cellCode) floorCells.push({x:xx,y:yy});
    }
    if(!floorCells.length) return;
    const rng=rngFor(pieceId), pick=floorCells[Math.floor(rng()*floorCells.length)];
    piece.x=pick.x; piece.y=pick.y;
  });
  return positions;
}

/* Compatibility-named lifecycle seam: switching walks SUSPENDS the previous one. Abandonment is an
   explicit story event (`walk_complete{abandoned:true}`), never inferred from attention moving to a
   different frontier. Cursor/touched/ticked/object/overlay state remains on the prep node. */
function walkCloseOrphan(w, exceptNodeId){
  const P=prepOf(w);
  if(!P.activeWalkId || P.activeWalkId===exceptNodeId) return null;
  const pn=P.nodes && P.nodes[P.activeWalkId];
  if(!pn || !pn.cursor || pn.cursor.done) return null;
  pn.walkState="suspended";
  const c=clockOf(w); pn.suspendedAt={day:c.day,min:c.min};
  return {ok:true,suspended:P.activeWalkId,current:pn.cursor.current};
}

/* set the active walk when a frontier is contacted. Idempotent: re-entering a walk the party already
   walks just resumes its cursor. Opens a walkLog entry the provenance report reads (Step C). */
function walkSetActive(w, nodeId){
  walkCloseOrphan(w, nodeId);
  const P=prepOf(w), pn=P.nodes&&P.nodes[nodeId], walk=walkOfFrontier(w,nodeId);
  if(!pn || !walk) return {ok:false, reason:"no-walk"};
  P.activeWalkId=nodeId;
  if(!pn.cursor){ const e=walkEntrySeg(walk); pn.cursor={ current:e, touched:[e], done:false }; }
  if(pn.walkState==="suspended"){
    const c=clockOf(w); pn.resumedAt={day:c.day,min:c.min};
  }
  pn.walkState="active";
  // one walkLog entry per frontier (keyed by nodeId) — created on first contact, updated as it's walked.
  // TRAVEL-WALKS §3 step 5: kind stamps "travel" vs "frontier" so walkProvenanceReport can bucket them.
  if(!P.walkLog.some(l=>l.walkId===nodeId)){
    P.walkLog.push({ walkId:nodeId, env:walk.environment, topology:walk.topology||null, kind:pn.kind||"frontier",
      segCount:walk.segCount, totalSegments:(walk.segments&&walk.segments.length)||walk.segCount||0,
      touched:pn.cursor.touched.slice(), finaleReached:false, session:w.session||0 });
  }
  return {ok:true, current:pn.cursor.current};
}

// sync the open walkLog entry to the live cursor (best-effort; provenance only)
function walkLogSync(w, nodeId){
  const P=prepOf(w), pn=P.nodes&&P.nodes[nodeId]; if(!pn||!pn.cursor) return;
  const l=P.walkLog.find(x=>x.walkId===nodeId); if(l){
    l.touched=pn.cursor.touched.slice();
    const walk=walkOfFrontier(w,nodeId);
    if(walk)l.totalSegments=(walk.segments&&walk.segments.length)||walk.segCount||l.segCount||0;
  }
}

/* advance the cursor to a segment the party has moved into. Permissive on the target (topologies branch;
   we record where they are, we do not police the route). Reaching a finale segment does NOT complete the
   walk — completion is its own beat (walkComplete).
   TRAVEL-WALKS (§1 step 5 / G5): a `kind:"travel"` walk also advances the WORLD CLOCK per segment —
   Math.round(travelMin/segCount) per walk_advance; walkComplete adds the rounding remainder so the
   total elapsed across the whole trip === the original travelMin exactly. `elapsed` tracks minutes
   already advanced so the remainder is computable at completion regardless of how many segs were touched. */
// TRANSITION-CONTRACT.md §2 — non-travel walk_advance ticks per environment (dungeon/urban/wilderness/
// holding); unlisted/unknown environments fall back to 15 (matches "urban" — the mid default).
const WALK_SEG_MIN={dungeon:10,urban:15,wilderness:45,holding:0};

function walkAdvance(w, toSeg, nodeId){
  const P=prepOf(w); nodeId=nodeId||P.activeWalkId;
  const pn=P.nodes&&P.nodes[nodeId], walk=walkOfFrontier(w,nodeId);
  if(!pn||!pn.cursor||!walk) return {ok:false, reason:"no-active-walk"};
  const seg=walk.segments.find(s=>s.num===toSeg);
  if(!seg) return {ok:false, reason:"no-such-segment:"+toSeg};
  // TRANSITION-CONTRACT.md §3.8 E22 — a memoryless DM re-emitting a segment ALREADY TICKED FOR must
  // not inflate the clock. Checked BEFORE any tick; this also closes the latent travel bug where a
  // re-emit inflates elapsedMin and turns the arrival remainder NEGATIVE (advanceClock running the
  // clock BACKWARD) — belt-and-suspenders with walkComplete's remainder clamp (§3.8). `tickedSegs`
  // (distinct from `touched`, which is provenance-only) tracks exactly which segments have already
  // billed the clock — the entry segment hasn't ticked yet at cursor-init, so the FIRST walk_advance
  // onto it (a real "the party is walking leg 1") still ticks; only a genuine re-emit no-ops.
  pn.cursor.tickedSegs=pn.cursor.tickedSegs||[];
  if(pn.cursor.current===toSeg && pn.cursor.tickedSegs.indexOf(toSeg)>=0)
    return {ok:true, current:toSeg, touched:pn.cursor.touched.slice(), atFinale:!!seg.isFinale, noop:true};
  pn.cursor.current=toSeg;
  if(pn.cursor.touched.indexOf(toSeg)<0) pn.cursor.touched.push(toSeg);
  pn.cursor.tickedSegs.push(toSeg);
  if(typeof livingSheet==="function"&&typeof restEffectsAdvanceSegment==="function"){
    const t=livingSheet(w);if(t&&t.sh)restEffectsAdvanceSegment(t.sh,nodeId,toSeg);
  }
  walkLogSync(w,nodeId);
  if(pn.kind==="travel" && typeof advanceClock==="function"){
    const per=Math.round((pn.travelMin||0)/(walk.segCount||1));
    advanceClock(w, per);
    pn.elapsedMin=(pn.elapsedMin||0)+per;
  } else if(typeof advanceClock==="function"){
    const per=(WALK_SEG_MIN[walk.environment]!=null)?WALK_SEG_MIN[walk.environment]:15;
    if(per>0){ advanceClock(w,per); pn.elapsedMin=(pn.elapsedMin||0)+per; }
  }
  return {ok:true, current:toSeg, touched:pn.cursor.touched.slice(), atFinale:!!seg.isFinale};
}

/* ON-DEMAND-GEN §4 / BATCH-GUARDRAILS G4 — {type:"walk_update"} capture: deep-merge {effectDie|
   rolledFace} into the active walk's per-segment overlay entry (pn.segments, keyed by ref "S<num>" —
   the same array applyPrep writes from the Stage-2 synthesis pass). Creates the segment's overlay entry
   if Stage-2 never wrote one (a gen-minted room die can arrive before any reskin exists). Unknown seg
   (no such segment on the active walk) → {ok:false,reason:"no-seg"}. Defaults to the ACTIVE walk's
   current segment when `seg` is omitted (the common "capture what the player is standing in" case). */
function walkUpdateSegment(w, seg, overlay, nodeId){
  const P=prepOf(w); nodeId=nodeId||P.activeWalkId;
  const pn=P.nodes&&P.nodes[nodeId], walk=walkOfFrontier(w,nodeId);
  if(!pn||!walk) return {ok:false, reason:"no-active-walk"};
  const num=(seg!=null)?seg:(pn.cursor&&pn.cursor.current);
  if(!walk.segments.some(s=>s.num===num)) return {ok:false, reason:"no-seg"};
  const ref="S"+num;
  pn.segments=pn.segments||[];
  let entry=pn.segments.find(o=>o.ref===ref);
  if(!entry){ entry={ ref }; pn.segments.push(entry); }
  Object.assign(entry, overlay||{});   // deep-merge is shallow-per-key here — effectDie/rolledFace are the only keys this event ever carries
  return {ok:true, ref, overlay:entry};
}

/* mark a beat's walk provenance (Step C) — {id,seg} for the active walk, or null. */
function walkStamp(w){
  // Read path: applyEvent calls this before it knows whether an event will be accepted. Using prepOf
  // here used to create an empty w.prep even for a rejected event, violating failure atomicity on a
  // vintage save. No active prep store simply means there is no walk provenance to stamp.
  const P=w&&w.prep; if(!P || !P.activeWalkId) return null;
  const pn=P.nodes&&P.nodes[P.activeWalkId]; if(!pn||!pn.cursor) return null;
  return { id:P.activeWalkId, seg:pn.cursor.current };
}

/* WALK-COMPLETE (Step B): the walk is walked out (finale resolved) or abandoned. Finalize provenance,
   clear the active walk, and PROMOTE the next un-walked frontier — re-anchoring its rumor lead from
   where the party now stands and flagging it for the DM to reskin. The three frontiers are already
   bound on the map at startPrep, so promotion re-points a lead; it does not invent a node.
   TRAVEL-WALKS (docs/TRAVEL-WALKS.md §1 step 6 / BATCH-GUARDRAILS G5): a `kind:"travel"` walk does NOT
   promote a prep frontier — it moves currentNodeId to destNodeId (arrival) or leaves it at origin
   (abandoned = turned back), adds the rounding remainder to the clock, and writes its own arrival/
   turn-back ledger line INSTEAD of the frontier walk-complete line. This branch is a guard clause at
   the very top so it's isolable for the mutation check (break the `pn.kind==="travel"` test → frontier
   promotion fires on a travel walk → the harness must fail). */
function walkComplete(w, opts){
  opts=opts||{}; const P=prepOf(w), nodeId=opts.nodeId||P.activeWalkId;
  const pn=P.nodes&&P.nodes[nodeId]; if(!pn) return {ok:false, reason:"no-active-walk"};
  if(pn.kind==="travel"){
    if(pn.cursor) pn.cursor.done=true;
    pn.walkState=opts.abandoned?"abandoned":"completed";
    const l=P.walkLog.find(x=>x.walkId===nodeId);
    if(l){ l.finaleReached=!opts.abandoned; if(pn.cursor) l.touched=pn.cursor.touched.slice(); }
    P.activeWalkId=null;
    const destName=nodeName(w,pn.destNodeId);
    if(opts.abandoned){
      // turn back: currentNodeId unchanged, clock keeps only segments already advanced
      addLedger(w,"transition",{kind:"travel-turnback",nodeId,fromNodeId:pn.originNodeId,toNodeId:pn.destNodeId,source:"play"},
        `turned back on the road to ${destName}`);
    } else {
      // WORLD-TURN §1 T3: stamp the DEPARTURE day at the origin before the clock advances to arrival.
      if(typeof turnStampVisit==="function") turnStampVisit(w,pn.originNodeId);
      // arrival: add the rounding remainder so total elapsed === the original travelMin exactly.
      // TRANSITION-CONTRACT.md §3.8/E23 — clamped >=0 (belt on top of walkAdvance's no-op guard,
      // §3.8 E22): the clock can never run backward on arrival even if elapsedMin somehow overshot.
      const remainder=Math.max(0,(pn.travelMin||0)-(pn.elapsedMin||0));
      if(remainder && typeof advanceClock==="function") advanceClock(w, remainder);
      w.currentNodeId=pn.destNodeId;
      if(typeof seeNode==="function") seeNode(w,pn.destNodeId);
      // WORLD-TURN §1/§3 T3: the core revisit trigger — resolve drift lazily, right on arrival.
      if(typeof worldTurn==="function") worldTurn(w,"revisit",{nodeId:pn.destNodeId});
      addLedger(w,"transition",{kind:"travel-arrive",nodeId,fromNodeId:pn.originNodeId,toNodeId:pn.destNodeId,travelMin:pn.travelMin,source:"play"},
        `Arrived at ${destName} — the road is walked through. Now Day ${clockOf(w).day}, ${timeOfDay(clockOf(w).min)}.`);
      // DURABILITY-TRIO.md §2: a "submersion" exposure — the ONE real signal for it in this codebase is
      // a travel walk whose legs crossed a wet biome (engine.hexmap's terrainAt/travelLegBiomes),
      // detected here off the completed walk's own rolled segments (never DM bookkeeping). Segment
      // .biome is written by rollWildernessWalk({biomes:legBiomes}) where legBiomes are ALREADY mapped
      // through HEX_BIOME_TO_WILDERNESS (play.js) — the hexmap code "water" becomes the Titlecase
      // wilderness label "Coastal" (and "marsh" becomes "Swamp"); segments never carry the raw hex
      // code, so match the wilderness vocabulary the walk actually stores, not the hexmap one.
      // Every carried metal instance rolls one exposure; non-metal/magic/already-rusted no-op internally.
      if(pn.walk && Array.isArray(pn.walk.segments) && pn.walk.segments.some(s=>s&&(s.biome==="Coastal"||s.biome==="Swamp"))
         && typeof applyRustExposure==="function" && typeof livingSheet==="function"){
        const t=livingSheet(w);
        if(t) (t.sh.inventory||[]).forEach(it=>applyRustExposure(w,it.id,"submersion"));
      }
    }
    return {ok:true, completed:nodeId, next:null, arrived:!opts.abandoned, destNodeId:pn.destNodeId};
  }
  /* JOB-WALKS (docs/JOB-WALKS.md §2, BATCH3-GUARDRAILS J1/J2 "job-walks") — a `kind:"job"` walk is
     NOT part of the session-prep bundle either: it does not promote a frontier, and completion pays
     out (gold + poster attitude) instead of writing a frontier walk-complete line. An OFF-city job
     (wilderness/dungeon envHint) minted its own destination node in jobWalkAccept and the party
     travelled there in-fiction the same turn the walk was accepted (no separate travel leg — the
     job walk's OWN segments ARE the trip, per §2's "the job's walk anchors off-city"); on completion
     the party returns to wherever they departed from (originNodeId) rather than lingering at a
     one-off job-site node. An in-town job (urban envHint) never moved currentNodeId in the first
     place (originNodeId is null for those), so there is nothing to restore. Guard clause mirrors the
     travel branch's isolation (a mutation check breaking this `pn.kind==="job"` test falls through to
     frontier promotion firing on a job walk — the harness must fail, same posture as TRAVEL-WALKS'
     own mutation check). */
  if(pn.kind==="job"){
    if(pn.cursor) pn.cursor.done=true;
    pn.walkState=opts.abandoned?"abandoned":"completed";
    const l=P.walkLog.find(x=>x.walkId===nodeId);
    if(l){ l.finaleReached=!opts.abandoned; if(pn.cursor) l.touched=pn.cursor.touched.slice(); }
    P.activeWalkId=null;
    const posting=(typeof jobPostingGet==="function")?jobPostingGet(w, pn.postingId):null;
    const payout=(typeof jobWalkPayout==="function")?jobWalkPayout(w, posting, {abandoned:!!opts.abandoned}):{ok:false};
    if(pn.originNodeId) w.currentNodeId=pn.originNodeId;
    return {ok:true, completed:nodeId, next:null, arrived:!opts.abandoned,
      postingId:pn.postingId, gold:(payout&&payout.gold)||0, payoutApplied:!!(payout&&payout.ok)};
  }
  if(pn.cursor) pn.cursor.done=true;
  pn.walkState=opts.abandoned?"abandoned":"completed";
  const l=P.walkLog.find(x=>x.walkId===nodeId);
  if(l){ l.finaleReached=!opts.abandoned; if(pn.cursor) l.touched=pn.cursor.touched.slice(); }
  P.activeWalkId=null;
  const m=mapOf(w), here=w.currentNodeId;
  const walk=walkOfFrontier(w,nodeId);
  addLedger(w,"session",{kind:"walk-complete",nodeId,env:walk?walk.environment:null,
    topology:walk?walk.topology:null,abandoned:!!opts.abandoned,source:"play"},
    opts.abandoned?`The road is left unwalked — ${(walk&&walk.topology)||"that path"} fades behind.`
                  :`One road ends — ${(walk&&walk.topology)||"the way"} is walked through.`);
  // DE-5: an orphan closure caused by the party choosing a DIFFERENT walk means that other walk IS
  // the next road — promoting a third frontier on top would be noise (decided).
  const next = opts.noPromote ? null : walkPromoteNext(w, nodeId, here);
  return {ok:true, completed:nodeId, next:next?next.id:null};
}

/* pick the next un-walked, un-locked-out frontier, re-anchor a soft rumor lead from the current node,
   and flag it for reskin to the party's new position. Returns the promoted node, or null if none. */
function walkPromoteNext(w, doneId, fromId){
  const P=prepOf(w), m=mapOf(w);
  const cand=Object.keys(P.nodes).filter(id=>{
    if(id===doneId) return false; const pn=P.nodes[id];
    return pn && !(pn.cursor&&pn.cursor.done) && m.nodes[id];   // exists, not already walked through
  });
  if(!cand.length){ if(typeof logPrepDebt==="function") logPrepDebt(w,"no further rumor staged"); return null; }
  // prefer a frontier the just-finished hook plausibly leads toward; else next by session-bind order.
  const donePn=P.nodes[doneId], lead=donePn&&donePn.hook&&donePn.hook.leadsTo;
  let nextId=lead && cand.find(id=>P.nodes[id].env===lead);
  if(!nextId) nextId=cand.sort((a,b)=>(P.nodes[a].idx||0)-(P.nodes[b].idx||0))[0];
  const pn=P.nodes[nextId];
  if(fromId && fromId!==nextId && !findEdge(w,fromId,nextId)){
    m.edges.push({ from:fromId, to:nextId, soft:true, hook:true, bearing:"?", travelMin:0, leagues:0 });
  }
  pn.needsReskin=true;
  const nn=m.nodes[nextId];
  addLedger(w,"session",{kind:"walk-promote",nodeId:nextId,env:pn.env,source:"play"},
    `A new rumor sharpens on the edge of the map — ${(nn&&nn.name)||"a frontier"}.`);
  return { id:nextId, env:pn.env };
}

/* note a frontier the player headed to that prep didn't cover — covered next cycle. */
function logPrepDebt(w, frontier){
  prepOf(w).debt.push({ frontier, session:w.session||0, t:Date.now() });
  addLedger(w,"session",{kind:"prep-debt",frontier},`Prep debt: "${frontier}" was unprepped — cover it next cycle.`);
  return {ok:true};
}
