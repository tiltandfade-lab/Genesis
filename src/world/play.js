/* GENESIS MODULE — src/world/play.js — world-flow: the world-genesis ritual, session/exploration loop, enter/spawn/destroy
   Carved from genesis.html monolith on 2026-06-20 (Pass 8, app-core). AST-extracted (acorn).
   Classic <script>, shared global scope. Reads GS.* state + data consts (STAGES/WORLDBEATS/...) at call-time. */

function newWorld(){startBardo();}

function startGenesis(){
  document.getElementById("bindbar").style.display="none";
  document.getElementById("worldName").value="";
  const host=document.getElementById("stages");host.innerHTML="";
  GS.SEED={};
  STAGES.forEach((s,i)=>{
    const card=document.createElement("div");card.className="stage";card.id="stage-"+s.key;host.appendChild(card);
    setTimeout(()=>{
      card.classList.add("show");
      if(s.triad)rollTriad(s,card); else rollStage(s,card);
      if(i===STAGES.length-1)setTimeout(()=>{document.getElementById("bindbar").style.display="flex";},520);
    },i*200);
  });
}

function rollStage(s,card){const res=lookup(s.t);GS.SEED[s.key]=res;paintCard(s,card,res);animateDie(card,res.roll,T[s.t].die);}

function rollTriad(s,card){
  const picks=[lookup(s.t),lookup(s.t)];GS.SEED[s.key]=picks;
  card.innerHTML=`<div class="stage-head"><div class="die">d${T[s.t].die}</div>
    <div class="stage-label">${T[s.t].label} — two rumored nearby</div>
    <button class="reroll" title="Reroll" onclick="rollTriad(STAGES.find(x=>x.key==='${s.key}'),document.getElementById('stage-${s.key}'))">↻</button></div>
    <div class="stage-body triad">${picks.map(p=>`<div class="row"><div class="name">${p.frag||p.name}</div><div class="desc dim" style="font-style:italic">a fragment · the DM knows</div></div>`).join("")}</div>`;
}

function paintCard(s,card,res){
  const catTag=res.cat?`<span class="cat ${res.cat.replace(/\s/g,'')}">${res.cat}</span>`:"";
  card.innerHTML=`<div class="stage-head"><div class="die" id="die-${s.key}">d${T[s.t].die}</div>
    <div class="stage-label">${T[s.t].label}</div>${catTag}
    <button class="reroll" title="Reroll" onclick="rollStage(STAGES.find(x=>x.key==='${s.key}'),document.getElementById('stage-${s.key}'))">↻</button></div>
    <div class="stage-body"><div class="name">${res.frag||res.name}</div><div class="desc dim" style="font-style:italic">a fragment · your DM knows what it is</div></div>`;
}

function animateDie(card,final,max){dieRoll(card&&card.querySelector(".die"),{result:final,faces:max,done:false});}

function bindWorld(){
  if(!GS.SEED)return;
  const name=(document.getElementById("worldName").value||"").trim()||GS.SEED.master.name;
  const id=uid();
  const gaz=[];
  // Preserve the dice that produced each entry — lookup() returns {roll,idx,cat,desc,...}. Carrying it as
  // a verbatim `rolled` payload lets world-gen PLACES migrate into the codex as MECHANICAL, drift-proof
  // records (the AI's later interpretation can never silently drift from the pinned dice). docs/CODEX.md.
  const rolledOf=(o,table)=>(o&&o.roll!=null)?{table:table||null,roll:o.roll,idx:o.idx,cat:o.cat||null,name:o.name,desc:o.desc}:null;
  const addG=(type,o,table)=>gaz.push({type,name:o.name,desc:o.desc,cat:o.cat||"",discoveredAt:Date.now(),rolled:rolledOf(o,table)});
  addG("Setting",GS.SEED.master,"master");
  (GS.SEED.nearby||[]).forEach(p=>addG("Place",p,"nearby"));
  addG("Myth",GS.SEED.myth,"myth"); addG("Faction",GS.SEED.faction,"faction");
  const world={
    id,name,createdAt:Date.now(),
    seed:{master:GS.SEED.master,smell:GS.SEED.smell,sound:GS.SEED.sound,arch:GS.SEED.arch,pressure:GS.SEED.pressure,taboo:GS.SEED.taboo,myth:GS.SEED.myth,faction:GS.SEED.faction,
         ...(GS.SEED.ht_setting?{hometown:{setting:GS.SEED.ht_setting,history:GS.SEED.ht_history,myth:GS.SEED.ht_myth}}:{})},
    gazetteer:gaz, characters:[], log:[],
    ledger:[], clock:{day:1,min:360}, session:1, map:{nodes:{},edges:[]}, currentNodeId:null
  };
  // seed the node-graph from the genesis skeleton — setting is the origin & current location
  const originId=addNode(world,GS.SEED.master.name,"Setting");
  world.currentNodeId=originId;
  setNodeXY(world,originId,0,0);
  (GS.SEED.nearby||[]).forEach((p,i)=>{const nid=addNode(world,p.name,"Place");const a=(-90+i*73)*Math.PI/180,rad=3+(i%2);setNodeXY(world,nid,Math.cos(a)*rad,Math.sin(a)*rad);});
  // founding ledger entries (the spine's first writes)
  addLedger(world,"canon",{fact:`${GS.SEED.master.name} — ${GS.SEED.master.desc}`,origin:true},`${name} was rolled into being at ${GS.SEED.master.name}.`);
  if(GS.SEED.ht_setting&&GS.SEED.ht_history&&GS.SEED.ht_myth){
    const strip=s=>(s||"").replace(/\*\*([^*]+)\*\*/g,"$1");
    const stg=strip(GS.SEED.ht_setting.text),hist=strip(GS.SEED.ht_history.text),myth=strip(GS.SEED.ht_myth.text);
    addLedger(world,"canon",{fact:`Hometown — ${stg}`,origin:true},`Hometown: ${stg} · Origin: ${hist} · Myth: ${myth}.`);
  }
  rollStartingState(world); // the standing situation: a faction web + one internal + one external pressure, written as fronts
  addLedger(world,"transition",{kind:"genesis",advanceMin:0},`Session 1 begins — Day 1, ${fmtTime(world.clock.min)}.`);
  logEvent(world,`The world of ${name} was rolled into being.`);
  // Curve of Revelation: a veteran (3rd world+ or opted-in) wakes with all panels;
  // otherwise wake minimal, carrying forward whatever this player has already learned.
  const vet=(Object.keys(U.worlds||{}).length>=2)||U.showAll;
  world.revealed=vet?{powers:1,map:1,ledger:1,gaz:1}:Object.assign({},U.revealed||{});
  placeRegion(world); // position this world as a region on the shared plane (step 6)
  U.worlds[id]=world; U.activeWorldId=id; saveU(U);
  toast("A new world enters the universe ✦");
  renderWorld(); showTab('world');
}

function enterWorld(id){U.activeWorldId=id;saveU(U);GS.gamePanel=null;renderWorld();showTab('world');}

/* The waking cinematic (NEW-GAME-FLOW §9): the bardo dissolves into the chat-first view. Fade to
   black, drop into the Story view (no clutter — the Curve of Revelation keeps the rail minimal),
   fade back up, and — if the DM bridge is live — auto-open the scene with the DM's first words. */
function wakeIntoWorld(){
  GS.gamePanel=null;
  const w=activeWorld();
  // Auto-run Session-Prep on first waking (docs/SESSION-PREP.md) so the world's soft frontiers are
  // staged before the DM narrates the opening. Idempotent — only if this world isn't prepped yet.
  try{ if(w && typeof startPrep==="function" && !(w.prep&&w.prep.bundle)) startPrep(w); }catch(e){ console.warn("[prep] wake startPrep failed",e); }
  saveU(U);
  renderWorld();showTab('world');
  const prep=document.getElementById("wakePrep");
  if(prep){
    // The prep cinematic: hold a loading screen ("the world is taking shape") over the freshly
    // rendered world, ask the DM to open the scene, and lift the screen only when the DM's first
    // words actually arrive (wakeReveal, fired from applyResponse) — so the player fades from the
    // loading screen straight into narration, never the raw opening data.
    GS.wakePrep=true; wakeShowPrep(w); autoOpenScene(); return;
  }
  // Legacy shell (no prep overlay) → the original quick fade.
  const fade=document.getElementById("wakeFade");
  const land=()=>{renderWorld();showTab('world');autoOpenScene();};
  if(!fade){land();return;}
  fade.classList.add("on");
  setTimeout(()=>{ land(); requestAnimationFrame(()=>fade.classList.remove("on")); },850);
}

/* Raise the prep/loading cinematic, titled with the world's name. */
function wakeShowPrep(w){
  const prep=document.getElementById("wakePrep");if(!prep)return;
  const t=prep.querySelector("#wpTitle"),s=prep.querySelector("#wpSub");
  if(t)t.textContent=(w&&w.name)?w.name:"Entering the world…";
  if(s)s.textContent="The DM is dreaming your arrival…";
  prep.classList.add("on");
}

/* Lift the prep cinematic, fading the chat in beneath it. Safe to call anytime — a no-op unless a
   prep screen is actually up (GS.wakePrep). Fired on the DM's first words (applyResponse) and on any
   terminal fallback (no DM answered / bridge down) so the loading screen never sticks. */
function wakeReveal(){
  if(!GS.wakePrep)return;
  GS.wakePrep=false;
  const prep=document.getElementById("wakePrep");
  if(prep)prep.classList.remove("on");
}

/* On first waking, if the DM bridge is reachable, ask the DM to narrate the opening scene so the
   player wakes into the DM's words (not a dashboard). If the bridge isn't reachable (or there's
   nothing to open), lift the prep screen and let the world stand — the feed prompts the player to
   start a DM session. */
function autoOpenScene(){
  const w=activeWorld();if(!w){wakeReveal();return;}
  const cur=w.characters.filter(c=>c.status==="living").slice(-1)[0];
  if(!cur||(w.dmlog&&w.dmlog.length)){wakeReveal();return;}
  fetch(DM_BASE+"/dm/health").then(r=>{
    if(r&&r.ok){sendTurn("(OPENING — I open my eyes in this world for the first time. Narrate the opening scene: where I stand, the world and the situation I've entered, grounded in the senses. Then offer me a set of options (an `ask` with 3 choices + \"or something else\") so I can act without being prompted.)",[],{hidden:true});}
    else{wakeReveal();}
  }).catch(()=>{wakeReveal();});
}

function fmtDate(t){const d=new Date(t);return d.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" "+d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});}

function explore(table,type){
  const w=activeWorld();if(!w)return;
  let res,tries=0;
  do{res=lookup(table);tries++;}while(w.gazetteer.some(g=>g.name===res.name)&&tries<8); // avoid immediate dupes
  w.gazetteer.push({type,name:res.name,desc:res.desc,cat:res.cat||"",discoveredAt:Date.now(),known:true}); // the player just found it — known
  if(type==="Place"){
    // travel is a DM-declared transition: new node + weighted route edge + the clock moves
    const fromId=w.currentNodeId, toId=addNode(w,res.name,"Place");
    const route=rollRoute();
    if(fromId&&fromId!==toId){addEdge(w,fromId,toId,route);placeTravelNode(w,fromId,toId,route);}
    advanceClock(w,route.travelMin);
    w.currentNodeId=toId;
    const hrs=(route.travelMin/60).toFixed(1);
    // the journey = a series of encounters across the terrain the route crosses (Wilderness Encounter Generator)
    const tc=worldToAxial((nodeXY(w,toId)||{x:0}).x,(nodeXY(w,toId)||{y:0}).y),terr=terrainAt(w,tc.q,tc.r),encN=Math.max(1,Math.round(route.leagues/2));
    addLedger(w,"spatial",{from:fromId,to:toId,bearing:route.bearing,travelMin:route.travelMin,leagues:route.leagues,terrain:terr.name},
      `Route mapped: ${nodeName(w,fromId)} → ${res.name}, bearing ${route.bearing}, ~${route.leagues} leagues (${hrs}h) across ${terr.name} country.`);
    addLedger(w,"transition",{kind:"travel",advanceMin:route.travelMin,encounters:encN,terrain:terr.name},
      `Travelled ${route.bearing} to ${res.name} — ${hrs}h pass across ${terr.name}; ~${encN} encounter${encN>1?'s':''} en route. Now Day ${w.clock.day}, ${timeOfDay(w.clock.min)}.`);
    logEvent(w,`Travelled ${route.bearing} to <strong style="color:var(--bone)">${res.name}</strong> across ${terr.name} country (~${encN} encounter${encN>1?'s':''}) — ${res.desc}`);
  } else {
    // information discovered — write-once canon; no time passes (a scene, not a transition)
    addLedger(w,"canon",{kind:type.toLowerCase(),name:res.name,desc:res.desc},`Learned of ${res.name} (${type}) — ${res.desc}`);
    logEvent(w,`Discovered <strong style="color:var(--bone)">${res.name}</strong> — ${res.desc}`);
  }
  if(type==="Place"){reveal(w,'map',"The map. It grows only where you walk.");reveal(w,'gaz');}
  else reveal(w,'gaz',"What you learn of this world gathers here — the gazetteer.");
  saveU(U);renderWorld();toast(`${res.name} is now part of ${w.name}`);
}

function beginSession(){const w=activeWorld();if(!w)return;
  w.session=(w.session||0)+1;
  addLedger(w,"session",{n:w.session},`Session ${w.session} begins — Day ${clockOf(w).day}, ${timeOfDay(clockOf(w).min)}.`);
  logEvent(w,`— Session ${w.session} begins —`);
  (w.characters||[]).forEach(c=>{if(c.status==="living")refreshSaga(w,c);}); // keep each living PC's Saga current
  reveal(w,'ledger',"Everything that happens is written here — the world does not forget.");
  // SESSION PREP (docs/SESSION-PREP.md): stage the multi-environment bundle + soft frontiers.
  let prepN=0; try{ if(typeof startPrep==="function"){ startPrep(w); prepN=(prepOf(w).bundle?prepOf(w).bundle.environments.length:0); } }catch(e){ console.warn("[prep] startPrep failed",e); }
  saveU(U);renderWorld();
  toast(prepN?`Session ${w.session} — ${prepN} frontiers rumored · ⎘ Prep handoff to synthesize`:`Session ${w.session} begins`);}

/* ── The session frame (CODEX Phase 4, docs/CODEX.md §4) ──────────────────────
   Start Session is the explicit front door: enter the world → beginSession (casts the codex via
   startPrep) → raise the prep/loading cinematic → fade into chat once the cast is hard data → the DM
   opens the scene. By the time the chat appears, the cast EXISTS as records — the DM reads them, never
   memorizes lines. End Session closes cleanly + recycles unvisited soft prep + returns to world-select. */
function startSession(id){
  if(id){U.activeWorldId=id;saveU(U);}
  const w=activeWorld();if(!w)return;
  GS.gamePanel=null;
  // set the flag BEFORE beginSession: if beginSession throws past its inner catch, w.session is already
  // incremented — leaving sessionLive false would let the next Start double-increment + re-cast.
  if(!w.sessionLive){ w.sessionLive=true; beginSession(); saveU(U); }   // beginSession casts the codex
  wakeIntoWorld();                                                       // cinematic → DM opens the scene
}
function endSession(){
  const w=activeWorld();if(!w)return;
  w.sessionLive=false;
  addLedger(w,"session",{kind:"session-end",n:w.session||0},`Session ${w.session||0} ends — the world holds its breath.`);
  logEvent(w,`— Session ${w.session||0} ends —`);
  if(typeof prepRecycleStale==="function") prepRecycleStale(w);          // unvisited rumors fade
  saveU(U);
  showTab('universe');renderShelf();
  toast(`Session ${w.session||0} ended — the world waits.`);
}

function passTime(kind){const w=activeWorld();if(!w)return;let min,label,rest;
  if(kind==="short"){min=60;label="A short rest (+1h)";rest="short";}
  else if(kind==="dawn"){const c=clockOf(w);min=((360-c.min)+1440)%1440||1440;label="Rest until dawn";rest="long";}
  else if(kind==="montage"){min=1440;label="A montage — a day passes";rest="long";}
  else return;
  advanceClock(w,min);
  // restore the live economy on the resting PC (slots/HP/per-rest pools — docs/EVENT-CONTRACT.md "rest")
  let restored=null;
  if(rest&&typeof restRecover==="function"){const cur=(w.characters||[]).filter(c=>c.status==="living").slice(-1)[0];
    if(cur&&cur.sheet){restored=restRecover(cur.sheet,rest);
      addLedger(w,"outcome",{kind:"rest",pc:cur.name,rest,restored},`✦ ${cur.name} takes a ${rest} rest — restored: ${restored}.`);}}
  addLedger(w,"transition",{kind,advanceMin:min},`${label} — now Day ${clockOf(w).day}, ${timeOfDay(clockOf(w).min)}.`);
  logEvent(w,`${label}. It is now Day ${clockOf(w).day}, ${timeOfDay(clockOf(w).min)}.${restored?` (${restored})`:""}`);
  if(kind==="montage")ssFactionTurn(w); // the web turns when the world drifts
  reveal(w,'ledger',"Everything that happens is written here — the world does not forget.");
  if(kind==="montage")reveal(w,'powers',"Time moved, and so did they. These are the powers in the land.");
  saveU(U);renderWorld();toast(label);}

function rollCharacter(spawnWhere){
  const w=activeWorld();if(!w)return;
  GS.CGEN={spawnWhere:spawnWhere||null,species:"Human",class:null,background:null,pronouns:"they",rolledScores:null,scores:null,life:null,skills:[],kit:null,cantrips:[],spells:[],scoreBreak:null,featPick:{skills:[],cantrips:[],spells:[]}};
  showTab('charge');renderCharge();
}

function destroyWorld(id){
  const w=U.worlds[id];if(!w)return;
  if(prompt(`Destroying "${w.name}" erases it and everything in it, forever. Type DESTROY to confirm.`)==="DESTROY"){
    delete U.worlds[id];
    if(U.activeWorldId===id)U.activeWorldId=Object.keys(U.worlds)[0]||null;
    saveU(U);toast(`${w.name} is unmade.`);renderShelf();showTab('universe');
  }
}
