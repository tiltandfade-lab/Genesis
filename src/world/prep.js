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

function prepOf(w){ return w.prep || (w.prep={ session:0, bundle:null, overlays:{}, harvest:null, nodes:{}, debt:[] }); }

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
  return n;
}

/* stage prep for the current session: assemble + bind soft frontiers. Returns the DM handoff text. */
function startPrep(w, opts){
  if(!w || typeof assemblePrepBundle!=="function") return "(prep engine unavailable)";
  const P=prepOf(w);
  prepRecycleStale(w);                                   // clear last session's untouched rumors
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
  });
  addLedger(w,"session",{kind:"prep",session:w.session,envs:bundle.environments.map(e=>e.kind)},
    `Prep staged — ${bundle.environments.length} frontiers rumored on the edge of the map.`);
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
    const nn=m.nodes[id]; if(nn) nn.brief=ov.briefing||null;
  });
  let canonN=0;
  Object.keys(overlays).forEach(env=>{ (overlays[env].newCanon||[]).forEach(nc=>{
    addLedger(w,"canon",{kind:nc.type||"fact",name:nc.name,soft:true,source:"prep"},
      `◆ (soft) ${nc.name||nc.type||"fact"}${nc.detail?(" — "+nc.detail):""}`); canonN++; }); });
  return {ok:true, enriched:Object.keys(overlays).length, softCanon:canonN};
}

/* the player makes contact with a rumored frontier → it locks to hard canon (Charter §8.4).
   returns the frontier's prepped walk so the DM can run it. */
function lockOnContact(w, nodeId){
  const P=prepOf(w), m=mapOf(w), nn=m.nodes[nodeId], pn=P.nodes&&P.nodes[nodeId];
  if(!nn) return {ok:false, reason:"no-node"};
  if(!nn.soft) return {ok:true, already:true, walk:walkOfFrontier(w,nodeId)};
  nn.soft=false; if(pn) pn.locked=true;
  nn.name=nn.name.replace(/\s*\(rumored\)\s*$/,"");   // the rumor becomes a real place
  m.edges.forEach(e=>{ if((e.to===nodeId||e.from===nodeId)&&e.soft) e.soft=false; });
  addLedger(w,"canon",{kind:"prep-contact",nodeId,source:"play"},`◆ ${nn.name.replace(/\s*\(rumored\)\s*$/,"")} — entered; the rumor is now real.`);
  return {ok:true, node:nn, walk:walkOfFrontier(w,nodeId), overlay:pn?P.overlays[pn.env]:null};
}

function walkOfFrontier(w, nodeId){
  const P=prepOf(w), pn=P.nodes&&P.nodes[nodeId];
  if(!pn || !P.bundle || !P.bundle.environments[pn.idx]) return null;
  return P.bundle.environments[pn.idx].walk;
}

/* note a frontier the player headed to that prep didn't cover — covered next cycle. */
function logPrepDebt(w, frontier){
  prepOf(w).debt.push({ frontier, session:w.session||0, t:Date.now() });
  addLedger(w,"session",{kind:"prep-debt",frontier},`Prep debt: "${frontier}" was unprepped — cover it next cycle.`);
  return {ok:true};
}
