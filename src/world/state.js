/* GENESIS MODULE — src/world/state.js — persistence + the World Spine (ledger · clock · node-graph map)
   Carved from genesis.html monolith on 2026-06-20 (Pass 4, logic-by-domain: world state).
   Classic <script> (shared global scope). The live mutable globals `U` (universe) and `SEED`
   stay app-owned in genesis.html; these functions read/write them at call-time. */

/* ---------- persistence: the universe ---------- */
const KEY="genesis-universe-v2";
function loadU(){try{return JSON.parse(localStorage.getItem(KEY))||{worlds:{},activeWorldId:null};}catch(e){return {worlds:{},activeWorldId:null};}}
function saveU(u){localStorage.setItem(KEY,JSON.stringify(u));}

function activeWorld(){return U.activeWorldId?U.worlds[U.activeWorldId]:null;}
function logEvent(w,text){w.log.unshift({t:Date.now(),text});}

/* ============================================================
   THE WORLD SPINE — World State Ledger · clock · node-graph map
   (Track A — the persistent skeleton; docs/DESIGN.md Locked 2026-06-18)
   ============================================================ */
function slug(s){return (s||"").toString().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"x";}
function pad2(n){return String(n).padStart(2,"0");}

/* --- in-world clock: advances ONLY on DM-declared transitions, never per-scene --- */
function clockOf(w){return w.clock||(w.clock={day:1,min:360});}
function fmtTime(min){return pad2(Math.floor(min/60))+":"+pad2(min%60);}
function timeOfDay(min){const h=Math.floor(min/60);
  if(h<5)return"deep night";if(h<7)return"dawn";if(h<11)return"morning";if(h<13)return"midday";
  if(h<17)return"afternoon";if(h<20)return"dusk";if(h<23)return"night";return"deep night";}
/* Player perceives the day + the light (early morning, dusk) — but NOT the exact minute,
   unless they carry a timepiece or stand by a clock (w.knowsTime; future: set by item/class). */
function fmtClock(w){const c=clockOf(w);return `Day ${c.day} · ${timeOfDay(c.min)}`+(w&&w.knowsTime?` · ${fmtTime(c.min)}`:"");}
function fmtClockFull(w){const c=clockOf(w);return `Day ${c.day} · ${fmtTime(c.min)} · ${timeOfDay(c.min)}`;} // DM-side (exact)

/* ---------- the Curve of Revelation (docs/NEW-GAME-FLOW.md §8) ----------
   First-time players wake into a minimal world; panels reveal on first relevance,
   each with a fading-guide line. What a player has learned persists across worlds
   (U.revealed); veterans (3rd world+, or "reveal all") wake with everything open. */
const REVEAL_KEYS=["powers","map","ledger","gaz"];
function isRevealed(w,k){return !!(w&&w.revealed&&w.revealed[k]);}
function allRevealed(w){return REVEAL_KEYS.every(k=>isRevealed(w,k));}
function reveal(w,k,text){if(!w.revealed)w.revealed={};if(w.revealed[k])return;
  w.revealed[k]=true;U.revealed=U.revealed||{};U.revealed[k]=true;if(text)toast(text);}
function showAllPanels(){const w=activeWorld();if(!w)return;if(!w.revealed)w.revealed={};
  REVEAL_KEYS.forEach(k=>w.revealed[k]=true);U.showAll=true;saveU(U);renderWorld();}
function advanceClock(w,minutes){const c=clockOf(w);const total=c.min+minutes;
  c.day+=Math.floor(total/1440);c.min=((total%1440)+1440)%1440;return c;}

/* --- the World State Ledger: ONE append-only home for all change-over-time.
   types: canon (write-once facts) · transition (time jumps) · spatial (routes)
        · clock (faction/world) · drift · npc-life · outcome (spicy) · session --- */
function ledgerOf(w){return w.ledger||(w.ledger=[]);}
function addLedger(w,type,data,text){const c=clockOf(w);
  const e={id:uid(),t:Date.now(),type,day:c.day,min:c.min,session:w.session||0,data:data||{},text:text||""};
  ledgerOf(w).push(e);return e;}

/* --- the DM chronicle: the narration feed (player turns + DM replies) for the DM Bridge.
   Persisted on the world so the story survives a reload. State CHANGES still go through the
   ledger (above) via applyEvent; this is the prose conversation. (docs/DM-BRIDGE.md) --- */
function dmLogOf(w){return w.dmlog||(w.dmlog=[]);}
function pushDmLog(w,role,text,meta){const e=Object.assign({role,text:text||"",t:Date.now()},meta||{});dmLogOf(w).push(e);return e;}

/* --- primitive node-graph map: places=nodes, traveled routes=weighted edges.
   spatial facts are write-once canon — never silently contradicted --- */
const BEARINGS=["N","NE","E","SE","S","SW","W","NW"];
function mapOf(w){return w.map||(w.map={nodes:{},edges:[]});}
function addNode(w,name,type){const m=mapOf(w);const id=slug(name);
  if(!m.nodes[id])m.nodes[id]={id,name,type:type||"Place"};return id;}
function nodeName(w,id){if(!id)return"an unmapped place";const n=mapOf(w).nodes[id];return n?n.name:id;}
function findEdge(w,a,b){return mapOf(w).edges.find(e=>(e.from===a&&e.to===b)||(e.from===b&&e.to===a));}
function addEdge(w,from,to,route){const ex=findEdge(w,from,to);
  if(ex)return ex; // write-once: an established route is canon, never re-rolled
  const e={from,to,bearing:route.bearing,travelMin:route.travelMin,leagues:route.leagues};
  mapOf(w).edges.push(e);return e;}
function rollRoute(){const travelMin=pick([90,120,180,240,300,360,480]);
  return {bearing:pick(BEARINGS),travelMin,leagues:Math.max(1,Math.round(travelMin/45))};}

/* ---- the connected plane (docs/DEATH-AND-REBIRTH.md step 6) ----
   All worlds are REGIONS of one shared plane. Each world carries a coarse region coordinate
   (axial, distinct from its internal node coords); the nth region spirals outward from the centre,
   so later regions sit farther out. A successor spawns in a region distant from where they fell —
   far from the old drama, on the same plane. Additive + non-destructive: existing saves are tagged,
   never reset or geometrically merged. */
function regionRingPos(n){ // nth cell of an outward hex spiral (n=0 → centre)
  if(n<=0)return {q:0,r:0};
  const dirs=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];let count=0;
  for(let k=1;k<4096;k++){let q=dirs[4][0]*k,r=dirs[4][1]*k;
    for(let i=0;i<6;i++)for(let j=0;j<k;j++){count++;if(count===n)return {q,r};q+=dirs[i][0];r+=dirs[i][1];}}
  return {q:0,r:0};
}
function regionTaken(){ // "q,r" coords already occupied by a placed world
  const s=new Set();Object.values(U.worlds||{}).forEach(w=>{if(w.region)s.add(w.region.q+","+w.region.r);});return s;}
function nextRegionPos(){ // the lowest spiral slot not already in use (robust to destroyed worlds / mixed saves)
  const taken=regionTaken();
  for(let n=0;n<100000;n++){const p=regionRingPos(n);if(!taken.has(p.q+","+p.r))return p;}
  return {q:0,r:0};
}
function placeRegion(w){ // assign the next free region slot on the plane (never collides with a live world)
  if(w.region)return w.region;
  w.region=nextRegionPos();return w.region;
}
function regionDistance(a,b){ // hex distance between two worlds' region coordinates
  if(!a||!b||!a.region||!b.region)return Infinity;
  return hexDist(a.region.q-b.region.q,a.region.r-b.region.r);
}
function farthestRegion(w){ // the existing (placed) world most distant from w on the plane (null if none)
  let best=null,bd=-1;
  Object.values(U.worlds||{}).forEach(o=>{if(o.id===w.id||!o.region)return;const d=regionDistance(w,o);if(d>bd){bd=d;best=o;}});
  return best;
}

/* --- migration: bring legacy saves up to the spine (additive, idempotent) --- */
function migrateWorld(w){
  if(!w.ledger)w.ledger=[];
  if(!w.clock)w.clock={day:1,min:360};
  if(w.session==null)w.session=0;
  if(!w.map){
    w.map={nodes:{},edges:[]};
    (w.gazetteer||[]).forEach(g=>{if(g.type==="Setting"||g.type==="Place")addNode(w,g.name,g.type);});
  }
  if(w.currentNodeId===undefined||w.currentNodeId===null){
    const set=(w.gazetteer||[]).find(g=>g.type==="Setting");
    w.currentNodeId=set?slug(set.name):(Object.keys(mapOf(w).nodes)[0]||null);
  }
  // backfill the live resource economy on pre-tracking saves (current=max where absent — never resets spent)
  if(typeof ensureResources==="function")(w.characters||[]).forEach(c=>{if(c&&c.sheet)ensureResources(c.sheet);});
  return w;
}
/* Seed the CANON wandering souls (data/souls-canon.js) into the roster — idempotent.
   Adds each canon soul not already present (by stable id), so Adam's shipped
   characters always appear while end-users' own banked souls are left untouched.
   Skips a legacy same-named seed (e.g. the old random-uid Robin) so it never duplicates. */
function seedCanonSouls(){
  if(!U.souls)U.souls=[];
  if(typeof CANON_SOULS==="undefined")return;
  const byId=new Set(U.souls.map(s=>s.id));
  const seedNames=new Set(U.souls.filter(s=>s.seed).map(s=>s.name));
  CANON_SOULS.forEach(c=>{
    if(byId.has(c.id)||seedNames.has(c.name))return;
    U.souls.push(JSON.parse(JSON.stringify(c))); // deep-clone so the canon source isn't mutated at runtime
  });
}
function migrateAll(){Object.values(U.worlds||{}).forEach(migrateWorld);
  // the connected plane (step 6): place any world that predates regions in the next free slot
  // (reads occupancy live each call, so already-placed worlds are never collided with)
  Object.values(U.worlds||{}).forEach(w=>{if(!w.region)w.region=nextRegionPos();});
  if(!U.plane)U.plane={version:3}; // marks the connected-plane era (additive; v2 storage kept)
  if(!U.souls)U.souls=[];seedCanonSouls();saveU(U);}
