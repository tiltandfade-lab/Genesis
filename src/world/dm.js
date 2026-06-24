/* GENESIS MODULE — src/world/dm.js — the DM Bridge client + the EVENT-CONTRACT runtime.
   Spec: docs/DM-BRIDGE.md (+ docs/EVENT-CONTRACT.md). Established 2026-06-21.

   Two jobs, both squarely in the world/orchestration layer:

   1. THE BRIDGE CLIENT — dmDigest() builds the scoped state digest (the structured JSON twin of
      handToDM's prose); sendTurn() POSTs the player's action + open rolls + digest; pollResponse()
      polls /response (204 pending → 200 ready) with a "the DM is considering…" indicator;
      applyResponse() renders the narration + applies the returned events + handles rollRequest/ask.

   2. applyEvent(w,e) — THE EVENT-CONTRACT RUNTIME. A switch on the EVENT-CONTRACT.md event types
      that dispatches to the app's REAL mutators (addLedger / addNode / faction+front clocks). The
      DM never writes U; it returns typed events and the app applies them HERE. Unknown types log
      and no-op (forward-compatible). This runtime is the first piece of the event plumbing that
      ADVANCEMENT.md / DIFFICULTY.md reuse — two birds (DM-BRIDGE.md §"State ownership").

   Anti-drift: ONE implementation of the mutators (in-browser). The bridge is a dumb mailbox.
   Classic <script>, shared global scope. Reads U/GS + world.state mutators at call-time. */

const DM_BASE = "";          // same origin: dev/dm-bridge.py serves the app AND the mailbox
const DM_POLL_MS = 1200;     // /response poll cadence while the DM is considering

/* ============================================================
   1. THE BRIDGE CLIENT
   ============================================================ */

/* The scoped state digest — the JSON twin of handToDM (anti-drift: relevance-scoped, not the
   whole universe). dmOnly fields carry the hidden layer the DM already gets in the prose handoff. */
function dmDigest(){
  const w=activeWorld(); if(!w) return null;
  const s=w.seed, c=clockOf(w);
  const cur=w.characters.filter(x=>x.status==="living").slice(-1)[0]||null;
  const sh=cur&&cur.sheet;
  return {
    worldId:w.id, worldName:w.name,
    clock:{ day:c.day, min:c.min, band:timeOfDay(c.min), exact:fmtTime(c.min), session:w.session||0, knowsTime:!!w.knowsTime },
    location:nodeName(w,w.currentNodeId),
    setting:{ name:s.master.name, desc:s.master.desc,
              smell:s.smell.name, sound:s.sound.name, arch:s.arch.name,
              taboo:{name:s.taboo.name,desc:s.taboo.desc},
              myth:{name:s.myth.name,desc:s.myth.desc} },
    pc: cur ? {
      name:cur.name, headline:cur.headline||cur.spark, pronouns:cur.pronouns,
      species:sh?sh.species:null, class:sh?sh.class:null, background:sh?sh.background:null,
      level:(sh&&sh.level)||1, hp:sh?sh.hp:null, ac:sh?sh.ac:null, profBonus:sh?sh.profBonus:null,
      scores:sh?sh.scores:null, mods:sh?sh.mods:null,
      saveProfs:sh?sh.saveProfs:[], skillProfs:sh?sh.skillProfs:[],
      conditions:cur.conditions||[], feat:sh?sh.feat:null
    } : null,
    powers:(w.factions||[]).map(f=>({
      id:slug(f.name), faction:f.name, dominant:!!f.dominant, agenda:f.agenda, method:f.method,
      tags:f.tags||[], clock:f.clock.filled+"/"+f.clock.size
    })),
    fronts:(w.pressures||[]).map(p=>({
      id:slug(p.danger||p.kind), kind:p.kind, danger:p.danger, impersonal:p.impersonal||null,
      clock:p.clock.filled+"/"+p.clock.size, closed:!!p.closed,
      dmOnly:{ truth:p.real?p.real.text:null, doom:p.doom||null }
    })),
    recentLedger:ledgerOf(w).slice(-6).map(e=>({type:e.type, day:e.day, min:e.min, text:e.text})),
    gazetteer:w.gazetteer.slice(-8).map(g=>({type:g.type, name:g.name, desc:g.desc})),
    revealed:REVEAL_KEYS.filter(k=>isRevealed(w,k))
  };
}

/* Post the player's action (+ any open rolls) as a turn; poll for the DM's reply.
   rolls travel INTO the turn — the DM narrates FROM them and never fabricates them. */
function sendTurn(action,rolls,opts){
  const w=activeWorld(); if(!w) return Promise.reject("no world");
  const turn={ turnId:"t-"+uid(), worldId:w.id, action:action, rolls:rolls||[], digest:dmDigest() };
  if(!(opts&&opts.hidden)) pushDmLog(w,"player",action,{rolls:rolls||[]});   // hidden = meta turns (e.g. the auto-opening) don't show as a player line
  w.dm=w.dm||{}; w.dm.rollReq=null; w.dm.ask=null; w.dm.pendingTurnId=turn.turnId;   // persist the in-flight turn so a reload resumes the poll
  saveU(U);
  postState();                                   // so the DM can read full state if the digest isn't enough
  GS.dm.pending=true; GS.dm.turnId=turn.turnId; GS.dm.rollReq=null; GS.dm.ask=null; renderWorld();
  return fetch(DM_BASE+"/turn",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(turn)})
    .then(r=>{ if(!r.ok) throw new Error("bridge "+r.status); return r.json(); })
    .then(j=>{ GS.dm.turnId=j.turnId; pollResponse(j.turnId); return j.turnId; })
    .catch(e=>{ dmBridgeDown(e); throw e; });
}

const DM_POLL_TIMEOUT = 300000;  // wait up to 5 min — a live DM (Claude) composing a turn can take a while; only give up if truly no one's watching

function pollResponse(turnId){
  if(GS.dm.poll) clearTimeout(GS.dm.poll);
  let waited=0;
  const tick=()=>{
    fetch(DM_BASE+"/response?turnId="+encodeURIComponent(turnId)).then(r=>{
      if(r.status===204){
        waited+=DM_POLL_MS;
        if(waited>=DM_POLL_TIMEOUT){ dmNoAnswer(); return null; }   // the bridge is up, but nobody is playing DM
        GS.dm.poll=setTimeout(tick,DM_POLL_MS); return null;
      }
      if(!r.ok) throw new Error("bridge "+r.status);
      return r.json().then(applyResponse);
    }).catch(dmBridgeDown);
  };
  GS.dm.poll=setTimeout(tick,DM_POLL_MS);
}

/* The bridge served the turn, but no DM session answered within the window — don't spin forever
   on "considering". Surface what's wrong + the fallbacks. (The mailbox being up ≠ a DM watching it.) */
function dmNoAnswer(){
  const w=activeWorld(); GS.dm.pending=false; GS.dm.poll=null; GS.dm.turnId=null;
  if(w) pushDmLog(w,"dm","(No DM answered. The bridge is running, but a DM session needs to be watching it — start one per docs/DM-BRIDGE.md, ideally on Sonnet for speed. Or use ✦ Copy world for the clipboard hand-off.)",{system:true});
  if(w&&w.dm) w.dm.pendingTurnId=null;            // gave up on this turn — don't resume it on reload
  saveU(U); renderWorld(); wakeReveal();          // never strand the player on the prep cinematic
}

/* Render the narration + APPLY the events through the real mutators + surface rollRequest/ask. */
function applyResponse(r){
  const w=activeWorld(); if(!w||!r) return;
  GS.dm.pending=false; GS.dm.poll=null; GS.dm.turnId=null;
  const applied=(r.events||[]).map(e=>({type:e.type, res:applyEvent(w,e)}));
  pushDmLog(w,"dm",r.narration||"(the DM was silent)",{events:r.events||[], applied, dmNotes:r.dmNotes||null});
  GS.dm.rollReq=r.rollRequest||null;
  GS.dm.ask=r.ask||null;
  w.dm={rollReq:GS.dm.rollReq, ask:GS.dm.ask, pendingTurnId:null};   // turn answered — persist pending roll-request/ask, clear the in-flight turn (GS is transient)
  saveU(U); renderWorld(); postState();          // the DM sees post-event state next turn
  wakeReveal();                                  // first words have landed — lift the prep cinematic
}

/* The app posts a fresh full-U snapshot the DM can consult (read-only; never mutated by the bridge). */
function postState(){
  fetch(DM_BASE+"/state",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(U)}).catch(()=>{});
}

function dmBridgeDown(e){
  GS.dm.pending=false; if(GS.dm.poll){clearTimeout(GS.dm.poll);GS.dm.poll=null;}
  toast("DM bridge unreachable — run: python3 dev/dm-bridge.py");
  renderWorld(); wakeReveal();                     // never strand the player on the prep cinematic
}

/* ---------- player-facing actions (wired to inline handlers in the World view) ---------- */

/* Send a free-text action. `forced` lets an `ask` option button submit its own text. */
function dmSend(forced){
  const ta=document.getElementById("dmAction");
  const action=(forced!=null?forced:(ta?ta.value:"")||"").trim();
  if(!action){ toast("Say or do something first."); return; }
  if(ta&&forced==null) ta.value="";
  GS.dm.ask=null;
  sendTurn(action,[]).catch(()=>{});
}

/* The roll handshake: the DM REQUESTED a check, so the player rolls openly here, and the result
   rides the NEXT turn. We never let the DM resolve it. d20 + ability mod + (prof if skill-proficient). */
function dmRollFor(skill,ability){
  const w=activeWorld(); if(!w) return;
  const cur=w.characters.filter(c=>c.status==="living").slice(-1)[0]; const sh=cur&&cur.sheet;
  const aMod=(sh&&sh.mods&&ability&&typeof sh.mods[ability]==="number")?sh.mods[ability]:0;
  const prof=(sh&&sh.skillProfs&&skill&&sh.skillProfs.indexOf(skill)>=0)?(sh.profBonus||0):0;
  const die=rollDie(20), total=die+aMod+prof;
  const mods=(aMod>=0?"+":"")+aMod+(prof?(" +"+prof+" prof"):"");
  const el=document.getElementById("dmDie"); if(el) dieRoll(el,{result:die,faces:20});
  GS.dm.rollReq=null;
  toast(skill+": d20="+die+" "+mods+" = "+total);
  sendTurn("(I roll "+skill+": "+total+")",[{label:skill,die:"d20",result:die,mods:mods,total:total}]).catch(()=>{});
}

/* ============================================================
   2. THE EVENT-CONTRACT RUNTIME — applyEvent(w,e)
   Dispatch a typed DM event to the app's real mutators. Reused by ADVANCEMENT/DIFFICULTY later.
   ============================================================ */

/* Fuzzy-match a clockId to a faction or a front (v1 declared events; no stable ids on the web yet).
   clockId is a slug like "tide-wardens" or "tide-wardens:recover-ledger" or a front's danger slug. */
function findClockTarget(w,clockId){
  const id=slug(clockId||"");
  const fac=(w.factions||[]).find(f=>{const fs=slug(f.name); return fs===id||id.indexOf(fs)===0||fs.indexOf(id)===0;});
  if(fac) return {kind:"faction", obj:fac, label:fac.name, clock:fac.clock};
  const fr=(w.pressures||[]).find(p=>{const ps=slug(p.danger||p.kind); return ps===id||id.indexOf(ps)===0||ps.indexOf(id)===0;});
  if(fr) return {kind:"front", obj:fr, label:fr.danger||fr.kind, clock:fr.clock};
  return null;
}

function applyEvent(w,e){
  if(!w||!e||!e.type) return {ok:false, reason:"malformed"};
  const p=e.payload||{}, src=e.source||"declared";
  switch(e.type){

    case "fact_canonized":
      addLedger(w,"canon",{factId:p.factId,what:p.what,source:src},
        p.what?("◆ "+p.what):("Canon fact recorded: "+(p.factId||"?")));
      return {ok:true};

    case "discovery":{
      let nodeId=p.nodeId||null;
      if(p.makeNode&&p.what){ nodeId=addNode(w,p.what,"Place"); reveal(w,'map'); }
      addLedger(w,"canon",{kind:"discovery",what:p.what,nodeId:nodeId,source:src},"Discovered: "+(p.what||"something new"));
      reveal(w,'gaz');
      // slow drip: flip Powers/Pressures the player has now LEARNED of from hidden → known (player-facing
      // gating in render.initKnown). payload.reveal = { factions:[name|id…], pressures:[danger|id…] }.
      const rv=p.reveal||{};
      (rv.factions||[]).forEach(nm=>{const f=(w.factions||[]).find(x=>x.name===nm||x.id===nm); if(f){f.known=true; reveal(w,'powers');}});
      (rv.pressures||[]).forEach(nm=>{const x=(w.pressures||[]).find(y=>y.danger===nm||y.dangerFrag===nm||y.id===nm); if(x){x.known=true; reveal(w,'powers');}});
      return {ok:true, nodeId:nodeId};
    }

    case "clock_advanced":{
      const tgt=findClockTarget(w,p.clockId), d=(typeof p.delta==="number"?p.delta:1);
      if(tgt){
        tgt.clock.filled=Math.max(0,Math.min(tgt.clock.size,(tgt.clock.filled||0)+d));
        const fired=tgt.clock.filled>=tgt.clock.size;
        addLedger(w,"clock",{clockId:p.clockId,delta:d,filled:tgt.clock.filled,size:tgt.clock.size,fired:fired,source:src},
          "☼ "+tgt.label+": clock "+tgt.clock.filled+"/"+tgt.clock.size+(fired?" — FILLED":"")+".");
        reveal(w,'powers');
        return {ok:true, fired:fired, clock:tgt.clock.filled+"/"+tgt.clock.size};
      }
      addLedger(w,"clock",{clockId:p.clockId,delta:d,untracked:true,source:src},
        "☼ Clock "+(p.clockId||"?")+" advanced "+d+" (untracked — no matching faction/front).");
      return {ok:true, untracked:true};
    }

    case "clock_fired":{
      const tgt=findClockTarget(w,p.clockId);
      if(tgt) tgt.clock.filled=tgt.clock.size;
      addLedger(w,"clock",{clockId:p.clockId,fired:true,factionId:p.factionId,forPlayer:!!p.forPlayer,source:src},
        "☼ "+((tgt&&tgt.label)||p.clockId||"A clock")+": the clock fills — its agenda comes due.");
      reveal(w,'powers');
      return {ok:true};
    }

    case "front_closed":{
      const tgt=findClockTarget(w,p.ledgerId||p.frontId);
      if(tgt&&tgt.kind==="front") tgt.obj.closed=true;
      addLedger(w,"outcome",{kind:"front_closed",ledgerId:p.ledgerId||p.frontId,how:p.how,source:src},
        "✦ A front closes"+((tgt&&tgt.label)?(" — "+tgt.label):"")+(p.how?(" ("+p.how+")"):"")+".");
      return {ok:true};
    }

    case "encounter_resolved":{
      const foes=p.foes||[];
      addLedger(w,"outcome",{kind:"encounter",foes:foes,method:p.method,objectiveRef:p.objectiveRef||null,outcome:p.outcome||null,source:src},
        "✦ Encounter "+(p.outcome||"resolved")+" ("+(p.method||"?")+") — "+foes.length+" foe"+(foes.length===1?"":"s")+".");
      return {ok:true};                            // XP award deferred to ADVANCEMENT (not yet built)
    }

    case "kill":
      addLedger(w,"outcome",{kind:"kill",victimClass:p.victimClass,factionId:p.factionId||null,source:src},
        "✦ A "+(p.victimClass||"being")+" was slain"+(p.factionId?(" — "+p.factionId+" will remember"):"")+".");
      return {ok:true};

    case "choice_logged":
      addLedger(w,"canon",{kind:"choice",weight:p.weight,forecloses:p.forecloses||[],source:src},
        "◆ Choice ("+(p.weight||"minor")+") logged"+(p.forecloses&&p.forecloses.length?(" — forecloses: "+p.forecloses.join(", ")):"")+".");
      return {ok:true};

    case "inspiration_granted":
      addLedger(w,"outcome",{kind:"inspiration",pc:p.pc,reason:p.reason,source:src},
        "✦ Inspiration — "+(p.reason||"a moment of brilliance")+".");
      return {ok:true};

    case "adjudication":
      addLedger(w,"canon",{kind:"adjudication",situation:p.situation,ruling:p.ruling,precedentId:p.precedentId||slug(p.situation||"")||uid(),source:src},
        "⚖ Ruling — "+(p.situation||"?")+" → "+(p.ruling||"?")+".");
      return {ok:true};

    case "level_applied":
      addLedger(w,"outcome",{kind:"level",pc:p.pc,from:p.from,to:p.to,source:src},
        "✦ "+(p.pc||"The hero")+" advances "+p.from+"→"+p.to+".");
      return {ok:true, deferred:true};             // actual sheet recompute is ADVANCEMENT's job

    case "prep_applied":                            // DM's synthesis result → enrich the soft frontiers (SESSION-PREP)
      return (typeof applyPrep==="function") ? applyPrep(w,p) : {ok:false, reason:"prep-unavailable"};

    case "prep_contact":{                           // player enters a rumored frontier → lock it to canon
      if(typeof lockOnContact!=="function") return {ok:false, reason:"prep-unavailable"};
      const r=lockOnContact(w,p.nodeId); if(r.ok&&p.enter) w.currentNodeId=p.nodeId; return r;
    }

    default:
      console.warn("[dm] unknown event type — no-op (forward-compatible):",e.type,e);
      return {ok:false, reason:"unknown-type:"+e.type};
  }
}
