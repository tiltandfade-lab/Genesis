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
  const addG=(type,o)=>gaz.push({type,name:o.name,desc:o.desc,cat:o.cat||"",discoveredAt:Date.now()});
  addG("Setting",GS.SEED.master);
  (GS.SEED.nearby||[]).forEach(p=>addG("Place",p));
  addG("Myth",GS.SEED.myth); addG("Faction",GS.SEED.faction);
  const world={
    id,name,createdAt:Date.now(),
    seed:{master:GS.SEED.master,smell:GS.SEED.smell,sound:GS.SEED.sound,arch:GS.SEED.arch,pressure:GS.SEED.pressure,taboo:GS.SEED.taboo,myth:GS.SEED.myth,faction:GS.SEED.faction},
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
  const fade=document.getElementById("wakeFade");
  const land=()=>{renderWorld();showTab('world');autoOpenScene();};
  if(!fade){land();return;}
  fade.classList.add("on");
  setTimeout(()=>{ land(); requestAnimationFrame(()=>fade.classList.remove("on")); },850);
}

/* On first waking, if the DM bridge is reachable, ask the DM to narrate the opening scene so the
   player wakes into the DM's words (not a dashboard). Silent no-op if the bridge isn't running —
   the rolled opening (renderOpening) stands in. */
function autoOpenScene(){
  const w=activeWorld();if(!w)return;
  const cur=w.characters.filter(c=>c.status==="living").slice(-1)[0];
  if(!cur||(w.dmlog&&w.dmlog.length))return;
  fetch(DM_BASE+"/dm/health").then(r=>{if(r&&r.ok)sendTurn("(OPENING — I open my eyes in this world for the first time. Narrate the opening scene: where I stand, the world and the situation I've entered, grounded in the senses. Then offer me a set of options (an `ask` with 3 choices + \"or something else\") so I can act without being prompted.)",[],{hidden:true});}).catch(()=>{});
}

function fmtDate(t){const d=new Date(t);return d.toLocaleDateString(undefined,{month:"short",day:"numeric"})+" "+d.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});}

function explore(table,type){
  const w=activeWorld();if(!w)return;
  let res,tries=0;
  do{res=lookup(table);tries++;}while(w.gazetteer.some(g=>g.name===res.name)&&tries<8); // avoid immediate dupes
  w.gazetteer.push({type,name:res.name,desc:res.desc,cat:res.cat||"",discoveredAt:Date.now()});
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
  saveU(U);renderWorld();toast(`Session ${w.session} begins`);}

function passTime(kind){const w=activeWorld();if(!w)return;let min,label;
  if(kind==="short"){min=60;label="A short rest (+1h)";}
  else if(kind==="dawn"){const c=clockOf(w);min=((360-c.min)+1440)%1440||1440;label="Rest until dawn";}
  else if(kind==="montage"){min=1440;label="A montage — a day passes";}
  else return;
  advanceClock(w,min);
  addLedger(w,"transition",{kind,advanceMin:min},`${label} — now Day ${clockOf(w).day}, ${timeOfDay(clockOf(w).min)}.`);
  logEvent(w,`${label}. It is now Day ${clockOf(w).day}, ${timeOfDay(clockOf(w).min)}.`);
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
