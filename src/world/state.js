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
function migrateAll(){Object.values(U.worlds||{}).forEach(migrateWorld);if(!U.souls)U.souls=[];seedCanonSouls();saveU(U);}
