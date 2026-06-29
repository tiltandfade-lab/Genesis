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
      conditions:cur.conditions||[], feat:sh?sh.feat:null,
      resources:(sh&&typeof resourceDigest==="function")?resourceDigest(sh):null
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
    codex:(typeof codexDigest==="function")?(ensureCodex(w), codexDigest(w)):null,   // the all-seeing entity store (DM-facing)
    revealed:REVEAL_KEYS.filter(k=>isRevealed(w,k)),
    // SESSION SEAM (CONSEQUENCE-LADDER §7.1–§7.2): the next-session LEAN + the weave plan. A SOFT prior,
    // never a mandate — the rule below is part of the payload so the DM can't read it as a railroad.
    sessionLean:(w.carryForward && w.carryForward.nextShape) ? {
      lean:w.carryForward.nextShape,
      weave:(w.carryForward.weavePlan||[]).filter(p=>p&&p.decision!=="sustain")
              .map(p=>({ id:p.id, decision:p.decision, why:p.reason })),
      rule:"A LEAN for lulls only — what the world offers when the player drifts (Charter §10.1/§10.2). Override hierarchy is absolute: player intent → situation → lean. Never steer toward this shape; a dungeon makes its own battles and a driven player sets their own shape. You may ignore it entirely. The player never sees it."
    } : null
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
  GS.dm.animate=true;   // stream this fresh narration word-by-word (renderWorld → streamDMText)
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
  const rolls=[{label:skill,die:"d20",result:die,mods:mods,total:total}];
  // CRIT-MAGNITUDE (§5 dice are open): a nat 20/1 demands a second open d20 — the magnitude die. The
  // engine maps it to a lens vector the DM narrates FROM; we never let the DM fabricate the spike.
  let crit=null;
  if((die===20||die===1) && typeof rollCritMagnitude==="function"){
    crit=rollCritMagnitude(die,{magnitude:rollDie(20)});
    if(crit) rolls.push({label:(crit.success?"crit-magnitude":"fumble-magnitude"),die:"d20",result:crit.magnitude,total:crit.magnitude,crit});
  }
  // one toast — always shows the base check math; appends the spike when a crit fired (base info stays
  // visible exactly on the most dramatic rolls).
  toast(crit
    ? (crit.success?"CRIT! ":"FUMBLE! ")+skill+" d20="+die+" ("+total+") · magnitude "+crit.magnitude+" → "+crit.tier+(crit.lensCount?(" — "+crit.lensCount+" lens"+(crit.lensCount===1?"":"es")):"")
    : skill+": d20="+die+" "+mods+" = "+total);
  sendTurn("(I roll "+skill+": "+total+")",rolls).catch(()=>{});
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

/* The current living PC's sheet — the subject of resource events (HP / slots / pools). */
function livingSheet(w){const c=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0];return c&&c.sheet?{c:c,sh:c.sheet}:null;}

/* DETECTED XP (ADVANCEMENT.md): price a resolved-tension event + accrue it on the living sheet. XP is
   never DM-declared — it's a side effect of the events the script already applies. Flags a pending
   level-up (claimed on the next rest, in world.play passTime). No-op if advancement isn't loaded. */
function grantXp(w, type, p, extra){
  if(typeof awardXp!=="function" || typeof xpForEvent!=="function") return null;
  const t=livingSheet(w); if(!t) return null;
  let n=xpForEvent(type, p, t.sh.level||1, extra); if(!n) return null;
  // The discovery side-channel (per narrated fact) is the one award the DM can spam, so the script
  // BOUNDS it: discovery/fact_canonized XP is capped per in-world day; past the ceiling it pays $0
  // (no XP, no ledger line) no matter how many facts get canonized. Resolved tension is the real
  // level-driver (front_closed / clock_fired), which is uncapped. See docs/ADVANCEMENT.md.
  if(type==="discovery" || type==="fact_canonized"){
    const day=(typeof clockOf==="function" ? clockOf(w).day : 0);
    if(!w.xpDiscovery || w.xpDiscovery.day!==day) w.xpDiscovery={day, used:0};
    const cap=(typeof DISCOVERY_XP_PER_DAY!=="undefined") ? DISCOVERY_XP_PER_DAY : 30;
    n=Math.min(n, Math.max(0, cap - w.xpDiscovery.used));
    if(!n) return null;                       // daily discovery ceiling hit — pay nothing further today
    w.xpDiscovery.used += n;
  }
  const r=awardXp(t.sh, n);
  addLedger(w,"outcome",{kind:"xp",amount:n,reason:type,xp:r.xp,pending:r.pending,source:"detected"},
    `✦ +${n} XP — ${r.xp} total${r.pending?" · a level waits to be claimed on your next rest":""}.`);
  return r;
}

function applyEvent(w,e){
  if(!w||!e||!e.type) return {ok:false, reason:"malformed"};
  const p=e.payload||{}, src=e.source||"declared";
  switch(e.type){

    case "hp_changed":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const r=applyHpDelta(t.sh,typeof p.delta==="number"?p.delta:0);
      const sign=r.delta>0?"healed "+r.delta:(r.delta<0?"took "+(-r.delta)+" damage":"unchanged");
      addLedger(w,"outcome",{kind:"hp",pc:t.c.name,delta:r.delta,from:r.from,to:r.to,max:r.max,dropped:r.dropped,source:src},
        "✦ "+t.c.name+" "+sign+" — HP "+r.from+"→"+r.to+"/"+r.max+(r.dropped?" (down)":"")+".");
      return {ok:true,hp:r.to+"/"+r.max,dropped:r.dropped};
    }

    case "slot_spent":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const r=spendSlot(t.sh,p.level||1);
      if(!r.ok){addLedger(w,"outcome",{kind:"slot",pc:t.c.name,level:r.level,empty:true,source:src},
        "✦ "+t.c.name+" has no level-"+r.level+" slot to spend.");return r;}
      addLedger(w,"outcome",{kind:"slot",pc:t.c.name,level:r.level,slotKind:r.kind,remaining:r.remaining,max:r.max,source:src},
        "✦ "+t.c.name+" spends a "+(r.kind==="pact"?"pact ":"")+"level-"+r.level+" slot — "+r.remaining+"/"+r.max+" left.");
      return {ok:true,remaining:r.remaining+"/"+r.max};
    }

    case "resource_spent":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const r=spendResource(t.sh,p.key,p.n);
      if(!r.ok){addLedger(w,"outcome",{kind:"resource",pc:t.c.name,key:p.key,missing:true,source:src},
        "✦ "+t.c.name+" has no "+(p.key||"resource")+" pool.");return r;}
      addLedger(w,"outcome",{kind:"resource",pc:t.c.name,key:r.key,label:r.label,spent:r.spent,remaining:r.remaining,max:r.max,source:src},
        "✦ "+t.c.name+" spends "+r.spent+" "+r.label+" — "+r.remaining+"/"+r.max+" left.");
      return {ok:true,remaining:r.remaining+"/"+r.max};
    }

    case "rest":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const kind=(p.kind==="long")?"long":"short";
      const summary=restRecover(t.sh,kind);
      addLedger(w,"outcome",{kind:"rest",pc:t.c.name,rest:kind,restored:summary,source:src},
        "✦ "+t.c.name+" takes a "+kind+" rest — restored: "+summary+".");
      return {ok:true,rest:kind,restored:summary};
    }

    case "fact_canonized":
      addLedger(w,"canon",{factId:p.factId,what:p.what,source:src},
        p.what?("◆ "+p.what):("Canon fact recorded: "+(p.factId||"?")));
      grantXp(w,"fact_canonized",p);
      return {ok:true};

    /* ---- CODEX (docs/CODEX.md): the relational entity store. The script owns it; the DM only emits. ---- */
    case "codex_add":{                               // mint/merge an NPC/Location/Item/Faction record
      if(typeof codexAdd!=="function") return {ok:false,reason:"codex-unavailable"};
      const r=codexAdd(w,p); return {ok:true, id:r.id};
    }
    case "codex_link":{                              // typed relationship (wikilink)
      if(typeof codexLink!=="function") return {ok:false,reason:"codex-unavailable"};
      codexLink(w,p.from,p.rel,p.to); return {ok:true};
    }
    case "codex_update":{                            // revise interpreted fields / status (condition, at, …)
      if(typeof codexUpdate!=="function") return {ok:false,reason:"codex-unavailable"};
      const r=codexUpdate(w,p.id,p); return {ok:!!r};
    }
    case "codex_reveal":{                            // slow drip — the player now knows of this entity
      if(typeof codexReveal!=="function") return {ok:false,reason:"codex-unavailable"};
      codexReveal(w,p.id); reveal(w,'gaz'); return {ok:true};
    }
    case "codex_contact":{                           // player TOUCHED it → lock to canon forever (§8b)
      if(typeof codexContact!=="function") return {ok:false,reason:"codex-unavailable"};
      const r=codexContact(w,p.id);
      if(r) addLedger(w,"canon",{kind:"codex-contact",id:p.id,source:"play"},`◆ ${r.name} — encountered; locked to canon.`);
      return {ok:!!r};
    }

    /* ---- SOCIAL (docs/SOCIAL.md §5): attitude / parley / morale — the social analog of combat. The DM
       DECLARES the open roll (skill + total + visible levers); the SCRIPT prices the DC from CURRENT
       attitude (§2) and COMPUTES the shift — the DM can only report the dice, never inflate the result
       (§5 anti-drift). Committed only through the codex writers; the DM narrates TO the returned delta. ---- */
    case "social_check":{                            // declared open roll → resolver → committed attitude shift
      if(typeof resolveSocialCheck!=="function"||typeof codexGetAttitude!=="function") return {ok:false,reason:"social-unavailable"};
      const a=codexGetAttitude(w,p.target); if(!a) return {ok:false,reason:"no-target:"+(p.target||"?")};
      const levers=p.levers||(p.lever?[p.lever]:[]);
      const lev=applyLeverage(socialDC(a.value), levers);
      const clk=clockOf(w).day;
      let res;
      if(lev.autoShift){                             // decisive leverage — the lever IS the answer, no roll (§2.1)
        const to=attitudeClampInt(a.value+1, a.floor, a.ceiling);
        res={outcome:"auto-shift", from:a.value, to, shift:to-a.value, terrified:false, granted:true};
      } else {
        res=resolveSocialCheck({ value:a.value, floor:a.floor, ceiling:a.ceiling, skill:p.skill,
          total:p.total, dc:lev.dc, caughtLie:p.caughtLie, overshoot:p.overshoot });
      }
      if(res.terrified) codexSetTerrified(w,p.target,true,clk);
      else if(res.to!==res.from) codexSetAttitude(w,p.target,res.to,p.cause||p.skill||"social",clk);
      const rec=codexGet(w,p.target), nm=rec?rec.name:p.target;
      const verb = res.terrified?"is cowed by fear"
        : res.outcome==="wall"?"will not be moved — a wall"
        : res.shift>0?"warms":(res.shift<0?"hardens":"holds");
      addLedger(w,"outcome",{kind:"social",target:p.target,name:nm,skill:p.skill,from:res.from,to:res.to,
        outcome:res.outcome,granted:res.granted,leverMod:lev.mod,dc:lev.dc,source:src},
        `✦ ${nm} ${verb} — ${attitudeLabel(res.from)} → ${attitudeLabel(res.to)}${res.granted?" (ask granted)":" (refused)"}.`);
      return {ok:true, from:res.from, to:res.to, shift:res.shift, outcome:res.outcome, granted:res.granted, terrified:res.terrified, dc:lev.dc};
    }
    case "attitude_shift":{                          // a DECLARED shift (group cascade / story beat) or a DETECTED one — absolute set
      if(typeof codexSetAttitude!=="function"||typeof codexGetAttitude!=="function") return {ok:false,reason:"social-unavailable"};
      const a=codexGetAttitude(w,p.target); if(!a) return {ok:false,reason:"no-target:"+(p.target||"?")};
      const to=(p.to!=null)?p.to:a.value;
      const r=codexSetAttitude(w,p.target,to,p.cause||"shift",clockOf(w).day);
      const rec=codexGet(w,p.target), nm=rec?rec.name:p.target;
      addLedger(w,"outcome",{kind:"social",target:p.target,name:nm,from:a.value,to:r.value,cause:p.cause||null,source:src},
        `✦ ${nm} — ${attitudeLabel(a.value)} → ${attitudeLabel(r.value)}${p.cause?(" ("+p.cause+")"):""}.`);
      return {ok:true, from:a.value, to:r.value};
    }
    case "morale_check":{                            // the DM rolls the creature's Wis save in the OPEN; the script verdicts held/broke
      if(typeof resolveMorale!=="function") return {ok:false,reason:"social-unavailable"};
      const dc=(p.dc!=null)?p.dc:moraleDC(p.trigger,p.mods);
      const v=resolveMorale({save:p.save,dc});
      const route=v.held?"fights-on":(p.outcome||null);   // broke → DM supplies the Morale Outcome route (flee/surrender/parley)
      addLedger(w,"outcome",{kind:"morale",creature:p.creature||null,trigger:p.trigger,dc,save:p.save,held:v.held,outcome:route,source:src},
        `✦ Morale (${p.trigger||"?"}, DC ${dc}): ${p.creature||"the creature"} ${v.held?"holds — fights on":("breaks → "+(route||"routs"))}.`);
      return {ok:true, held:v.held, dc, outcome:route};
    }
    case "parley_open":{                             // open the §2 loop on a creature/NPC — stamp the rolled opening ONCE (§1.1)
      if(typeof codexAttitudeOpen!=="function") return {ok:false,reason:"social-unavailable"};
      const target=p.target||p.npc||p.creature;
      const a=codexAttitudeOpen(w,target,(p.openingAttitude!=null?p.openingAttitude:0),
        {cause:"parley",clock:clockOf(w).day,floor:p.floor,ceiling:p.ceiling});
      if(!a) return {ok:false,reason:"no-target:"+(target||"?")};
      const rec=codexGet(w,target), nm=rec?rec.name:target;
      addLedger(w,"outcome",{kind:"parley",target,name:nm,want:p.want||null,opening:a.value,source:src},
        `✦ Parley — ${nm} opens ${attitudeLabel(a.value)}${p.want?(", wants: "+p.want):""}.`);
      return {ok:true, opening:a.value};
    }
    case "insight_read":{                            // §6 — the PLAYER's open Insight roll vs the (hidden) scaled DC reveals current attitude
      if(typeof insightReadDC!=="function"||typeof codexMarkAttitudeRead!=="function") return {ok:false,reason:"social-unavailable"};
      const a=codexGetAttitude(w,p.target); if(!a) return {ok:false,reason:"no-target:"+(p.target||"?")};
      const dc=(p.dc!=null)?p.dc:insightReadDC({guarded:p.guarded,masking:p.masking,mentalMods:p.mentalMods,bestMentalMod:p.bestMentalMod});
      const read=(Number(p.total)||0)>=dc;
      if(read) codexMarkAttitudeRead(w,p.target,true);       // flips the player-view tell on (codexPlayerView gates on known && read)
      const rec=codexGet(w,p.target), nm=rec?rec.name:p.target;
      addLedger(w,"outcome",{kind:"insight",target:p.target,name:nm,dc,total:p.total,read,source:src},
        read?`✦ ${nm} — you read their disposition: ${attitudeLabel(a.value)}.`:`✦ ${nm} — you can't get a clear read on them.`);
      return {ok:true, read, dc, attitude: read?{value:a.value, label:attitudeLabel(a.value)}:null};
    }

    case "discovery":{
      let nodeId=p.nodeId||null;
      if(p.makeNode&&p.what){ nodeId=addNode(w,p.what,"Place"); reveal(w,'map'); }
      addLedger(w,"canon",{kind:"discovery",what:p.what,nodeId:nodeId,source:src},"Discovered: "+(p.what||"something new"));
      reveal(w,'gaz');
      grantXp(w,"discovery",p);
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
      grantXp(w,"clock_fired",p);
      return {ok:true};
    }

    case "front_closed":{
      const tgt=findClockTarget(w,p.ledgerId||p.frontId);
      if(tgt&&tgt.kind==="front") tgt.obj.closed=true;
      addLedger(w,"outcome",{kind:"front_closed",ledgerId:p.ledgerId||p.frontId,how:p.how,source:src},
        "✦ A front closes"+((tgt&&tgt.label)?(" — "+tgt.label):"")+(p.how?(" ("+p.how+")"):"")+".");
      grantXp(w,"front_closed",p,{size:(tgt&&tgt.clock&&tgt.clock.size)||6});   // stake = front clock size × tier
      return {ok:true};
    }

    case "encounter_resolved":{
      const foes=p.foes||[];
      addLedger(w,"outcome",{kind:"encounter",foes:foes,method:p.method,objectiveRef:p.objectiveRef||null,outcome:p.outcome||null,source:src},
        "✦ Encounter "+(p.outcome||"resolved")+" ("+(p.method||"?")+") — "+foes.length+" foe"+(foes.length===1?"":"s")+".");
      grantXp(w,"encounter_resolved",p);           // pays ONLY when objectiveRef is set (ADVANCEMENT.md anti-grind)
      return {ok:true};
    }

    case "kill":{
      addLedger(w,"outcome",{kind:"kill",victimClass:p.victimClass,factionId:p.factionId||null,source:src},
        "✦ A "+(p.victimClass||"being")+" was slain"+(p.factionId?(" — "+p.factionId+" will remember"):"")+".");
      // DETECTED social cost (SOCIAL §5 / DIFFICULTY murder-hobo answer): a CIVILIAN kill near witnesses
      // turns every co-located codex NPC Hostile — no DM report; the script remembers who saw. (The
      // faction-member GROUP cascade stays DECLARED via attitude_shift for now — §7 scope guard.)
      if(typeof codexWitnessesAt==="function" && typeof codexSetAttitude==="function"
         && /civilian|innocent|bystander|commoner|noncombatant/i.test(p.victimClass||"")){
        const at=(p.at!=null)?p.at:w.currentNodeId;
        const witnesses=codexWitnessesAt(w,at,p.victimId);
        witnesses.forEach(id=>codexSetAttitude(w,id,ATTITUDE_MIN,"witnessed a killing",clockOf(w).day));
        if(witnesses.length) addLedger(w,"outcome",{kind:"social",detected:true,witnesses:witnesses.length,at,source:"detected"},
          `✦ ${witnesses.length} witness${witnesses.length===1?"":"es"} turn Hostile — the killing was seen.`);
      }
      return {ok:true};
    }

    case "choice_logged":
      addLedger(w,"canon",{kind:"choice",weight:p.weight,forecloses:p.forecloses||[],source:src},
        "◆ Choice ("+(p.weight||"minor")+") logged"+(p.forecloses&&p.forecloses.length?(" — forecloses: "+p.forecloses.join(", ")):"")+".");
      grantXp(w,"choice_logged",p);                // pays only on a major choice (ADVANCEMENT.md)
      return {ok:true};

    case "inspiration_granted":
      addLedger(w,"outcome",{kind:"inspiration",pc:p.pc,reason:p.reason,source:src},
        "✦ Inspiration — "+(p.reason||"a moment of brilliance")+".");
      return {ok:true};

    case "crit_outcome":{                            // CRIT-MAGNITUDE §3 — a Mythic spike persists as canon
      const tier=p.tier||"standard", canon=(tier==="mythic");
      const lensTxt=(p.lenses||[]).map(l=>(l&&(l.lens||l))||null).filter(Boolean).join("; ");
      const head = canon
        ? (p.natural===1 ? "A mythic disaster scars the world" : "A mythic triumph is woven into the world")
        : (p.natural===1 ? "A crit failure leaves its mark" : "A crit success leaves its mark");
      addLedger(w, canon?"canon":"outcome",
        {kind:"crit", natural:p.natural, magnitude:p.magnitude, tier, scope:p.scope||null,
         lenses:p.lenses||[], placeHandoff:!!p.placeHandoff, mythSeed:p.mythSeed||null, source:src},
        (canon?"◆ ":"✦ ")+head+(lensTxt?(" — "+lensTxt):"")+".");
      return {ok:true, canon, tier};
    }

    case "adjudication":
      addLedger(w,"canon",{kind:"adjudication",situation:p.situation,ruling:p.ruling,precedentId:p.precedentId||slug(p.situation||"")||uid(),source:src},
        "⚖ Ruling — "+(p.situation||"?")+" → "+(p.ruling||"?")+".");
      return {ok:true};

    case "level_applied":{                          // ADVANCEMENT.md: the mechanical recompute (capped at the ceiling)
      const t=livingSheet(w); if(!t) return {ok:false,reason:"no-pc"};
      if(typeof applyLevelUp!=="function") return {ok:false,reason:"advancement-unavailable"};
      const r=applyLevelUp(t.sh, typeof p.to==="number"?p.to:(t.sh.level||1)+1);
      if(!r.ok) return r;
      // interpretive-picks marker (docs/ADVANCEMENT.md): applyLevelUp grew the numbers + (via
      // ensureResources) seeded choicesLevel at the OLD level, so the choicesLevel→to span is now the
      // owed picks. Auto-finalize a pure-feature span (no spells/ASI to choose) so it leaves no false
      // "pending"; an interactive span stays pending until the player finalizes (persistent — the
      // picker can't be accidentally skipped).
      if(t.sh.choicesLevel==null) t.sh.choicesLevel=r.from;
      if(typeof levelUpPlan==="function" && !levelUpPlan(t.sh, t.sh.choicesLevel, r.to).interactive)
        t.sh.choicesLevel=r.to;
      addLedger(w,"outcome",{kind:"level",pc:t.c.name,from:r.from,to:r.to,hpGain:r.hpGain,pb:r.pb,source:src},
        `✦ ${t.c.name} advances ${r.from}→${r.to} — +${r.hpGain} HP (now ${t.sh.hp}), proficiency +${r.pb}. New spells / feat / subclass: choose with your DM.`);
      return {ok:true, from:r.from, to:r.to};
    }

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
