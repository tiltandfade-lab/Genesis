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
    const payload=rollNPC({ region:ambientRegion });
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
  return { minted:minted.length, ids:minted };
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
   silently collapse two distinct cast entities into one. Disambiguate so each cast record is its own. */
function prepCastId(w, kind, name){
  const base=codexKeyId(kind, name); let id=base, i=2;
  while(codexGet(w,id)) id=base+"-"+(i++);
  return id;
}
/* CODEX Phase 3 (docs/CODEX.md §4) — mint a frontier's rolled cast as SOFT prep records, bind the
   location to the frontier node, and place the NPCs there. The engine deals the cast; the DM's synthesis
   CONNECTS it (assigns kin/holders/dramatic links). No-op if the codex/rollers aren't loaded. */
function prepCastFrontier(w, nodeId, env){
  if(!env.cast || typeof codexAdd!=="function") return null;
  const m=mapOf(w), nn=m.nodes[nodeId], pn=prepOf(w).nodes[nodeId];
  const loc=env.cast.location;
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
    const ir=codexAdd(w, Object.assign({}, env.cast.item, { id:prepCastId(w,env.cast.item.kind||"item",env.cast.item.name), provenance:"prep",
      status:Object.assign({}, env.cast.item.status, locId?{ at:locId }:{}) }));
    itemIds.push(ir.id);
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
  const bundle=assemblePrepBundle(Object.assign({ world:w }, opts||{}));
  P.session=w.session||0; P.bundle=bundle; P.overlays={}; P.harvest=null;
  const from=w.currentNodeId, m=mapOf(w);
  bundle.environments.forEach((env,i)=>{
    // explicit per-session id — frontier labels can repeat across sessions (same skin/biome),
    // and a slug-of-name collision would resurrect a recycled rumor. Unique id avoids that.
    const id=`frontier-s${w.session||0}-${i}`;
    m.nodes[id]={ id, name:prepNodeLabel(env), type:"Frontier", soft:true, prep:{ env:env.kind, idx:i } };
    P.nodes[id]={ env:env.kind, idx:i, soft:true, locked:false, hook:env.hook };
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

/* set the active walk when a frontier is contacted. Idempotent: re-entering a walk the party already
   walks just resumes its cursor. Opens a walkLog entry the provenance report reads (Step C). */
function walkSetActive(w, nodeId){
  const P=prepOf(w), pn=P.nodes&&P.nodes[nodeId], walk=walkOfFrontier(w,nodeId);
  if(!pn || !walk) return {ok:false, reason:"no-walk"};
  P.activeWalkId=nodeId;
  if(!pn.cursor){ const e=walkEntrySeg(walk); pn.cursor={ current:e, touched:[e], done:false }; }
  // one walkLog entry per frontier (keyed by nodeId) — created on first contact, updated as it's walked.
  // TRAVEL-WALKS §3 step 5: kind stamps "travel" vs "frontier" so walkProvenanceReport can bucket them.
  if(!P.walkLog.some(l=>l.walkId===nodeId)){
    P.walkLog.push({ walkId:nodeId, env:walk.environment, topology:walk.topology||null, kind:pn.kind||"frontier",
      segCount:walk.segCount, touched:pn.cursor.touched.slice(), finaleReached:false, session:w.session||0 });
  }
  return {ok:true, current:pn.cursor.current};
}

// sync the open walkLog entry to the live cursor (best-effort; provenance only)
function walkLogSync(w, nodeId){
  const P=prepOf(w), pn=P.nodes&&P.nodes[nodeId]; if(!pn||!pn.cursor) return;
  const l=P.walkLog.find(x=>x.walkId===nodeId); if(l) l.touched=pn.cursor.touched.slice();
}

/* advance the cursor to a segment the party has moved into. Permissive on the target (topologies branch;
   we record where they are, we do not police the route). Reaching a finale segment does NOT complete the
   walk — completion is its own beat (walkComplete).
   TRAVEL-WALKS (§1 step 5 / G5): a `kind:"travel"` walk also advances the WORLD CLOCK per segment —
   Math.round(travelMin/segCount) per walk_advance; walkComplete adds the rounding remainder so the
   total elapsed across the whole trip === the original travelMin exactly. `elapsed` tracks minutes
   already advanced so the remainder is computable at completion regardless of how many segs were touched. */
function walkAdvance(w, toSeg, nodeId){
  const P=prepOf(w); nodeId=nodeId||P.activeWalkId;
  const pn=P.nodes&&P.nodes[nodeId], walk=walkOfFrontier(w,nodeId);
  if(!pn||!pn.cursor||!walk) return {ok:false, reason:"no-active-walk"};
  const seg=walk.segments.find(s=>s.num===toSeg);
  if(!seg) return {ok:false, reason:"no-such-segment:"+toSeg};
  pn.cursor.current=toSeg;
  if(pn.cursor.touched.indexOf(toSeg)<0) pn.cursor.touched.push(toSeg);
  walkLogSync(w,nodeId);
  if(pn.kind==="travel" && typeof advanceClock==="function"){
    const per=Math.round((pn.travelMin||0)/(walk.segCount||1));
    advanceClock(w, per);
    pn.elapsedMin=(pn.elapsedMin||0)+per;
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
  const P=prepOf(w); if(!P.activeWalkId) return null;
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
      // arrival: add the rounding remainder so total elapsed === the original travelMin exactly
      const remainder=(pn.travelMin||0)-(pn.elapsedMin||0);
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
  const l=P.walkLog.find(x=>x.walkId===nodeId);
  if(l){ l.finaleReached=!opts.abandoned; if(pn.cursor) l.touched=pn.cursor.touched.slice(); }
  P.activeWalkId=null;
  const m=mapOf(w), here=w.currentNodeId;
  const walk=walkOfFrontier(w,nodeId);
  addLedger(w,"session",{kind:"walk-complete",nodeId,env:walk?walk.environment:null,
    topology:walk?walk.topology:null,abandoned:!!opts.abandoned,source:"play"},
    opts.abandoned?`The road is left unwalked — ${(walk&&walk.topology)||"that path"} fades behind.`
                  :`One road ends — ${(walk&&walk.topology)||"the way"} is walked through.`);
  const next=walkPromoteNext(w, nodeId, here);
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
