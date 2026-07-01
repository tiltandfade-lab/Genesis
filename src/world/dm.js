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
// ITEMS (docs/ITEMS.md): the three named equip slots. NOT a single pointer — two-weapon fighting
// needs mainHand + offHand equipped at once, which a single "equipped weapon" field can't represent.
const EQUIP_SLOTS = ["mainHand", "offHand", "armor"];

/* ============================================================
   1. THE BRIDGE CLIENT
   ============================================================ */

/* WALK-CONSUMPTION (docs/WALK-CONSUMPTION.md, Step A) — the walk the party is ON, carried EVERY turn
   so the DM stops forgetting it until it's walked out. Compact (walks are 3–7 segs): full segment list
   with a cursor (here / behind / ahead) + the DM's reskin overlay by ref + the pre-cast frontier cast.
   A SOFT prior — player intent and the live situation override it; the DM does not steer the party
   down it. Returns null when no walk is active (party in town / between walks). */
function activeWalkDigest(w){
  if(typeof prepOf!=="function"||typeof walkOfFrontier!=="function") return null;
  const P=prepOf(w), id=P.activeWalkId; if(!id) return null;
  const pn=P.nodes&&P.nodes[id], walk=walkOfFrontier(w,id); if(!pn||!walk) return null;
  const ov=pn.segments||null;                            // the DM's Stage-2 reskin overlay (roll-keyed), if applied
  const cur=pn.cursor||{ current:1, touched:[], done:false };
  return {
    nodeId:id, place:(mapOf(w).nodes[id]||{}).name||null,
    environment:walk.environment, topology:walk.topology||null, briefing:pn.briefing||null,
    cursor:{ current:cur.current, touched:cur.touched, done:!!cur.done, total:walk.segCount },
    segments:(walk.segments||[]).map(s=>({
      num:s.num, label:s.label, isFinale:!!s.isFinale,
      gist:s.isFinale ? ((s.finale&&(s.finale.track||s.finale.revelation))||s.areaType||"arrival")
                      : [s.segType||s.areaType||s.biome, s.encounter&&s.encounter.type].filter(Boolean).join(" / "),
      reskin: ov ? (ov.find(o=>o.ref===("S"+s.num))||null) : null,
      state: (cur.touched||[]).indexOf(s.num)>=0 ? (s.num===cur.current?"here":"behind") : "ahead"
    })),
    cast:pn.cast||null,
    rule:"The walk the party is ON. Narrate the CURRENT segment; the rest is the road ahead/behind. "+
         "Honor the rolls (reskin by ref, never rewrite). A SOFT prior — player intent and the live "+
         "situation override it; you track where they are, you don't steer them down it. Clear a "+
         "segment → emit {type:'walk_advance',payload:{toSeg:N}}; at the finale → {type:'walk_complete'}."
  };
}

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
      resources:(sh&&typeof resourceDigest==="function")?resourceDigest(sh):null,
      // ITEMS (docs/ITEMS.md): identity only (id/name/qty/conditions) — the DM references an item by
      // id in condition_add/equip/item_split; it doesn't need the full mechanical lookup to narrate.
      inventory:sh?(sh.inventory||[]).map(it=>({id:it.id,name:it.name,qty:it.qty,conditions:it.conditions||[]})):[],
      equipped:sh?(sh.equipped||null):null,
      // the actual fix for "the DM has to recall the weapon's dice from memory" (docs/ITEMS.md): the
      // objective damage spec for whatever's equipped, resolved against data/items.js — narrate FROM
      // this, never invent a die. null per slot when nothing's equipped or it doesn't resolve.
      equippedWeapons:(sh&&typeof cmEquippedDamage==="function")?{
        mainHand:cmEquippedDamage(sh.equipped,sh.inventory,sh.mods,"mainHand"),
        offHand:cmEquippedDamage(sh.equipped,sh.inventory,sh.mods,"offHand")
      }:null
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
    } : null,
    activeWalk:(typeof activeWalkDigest==="function")?activeWalkDigest(w):null   // WALK-CONSUMPTION (Step A)
  };
}

/* Post the player's action (+ any open rolls) as a turn; poll for the DM's reply.
   rolls travel INTO the turn — the DM narrates FROM them and never fabricates them. */
function sendTurn(action,rolls,opts){
  const w=activeWorld(); if(!w) return Promise.reject("no world");
  // HYBRID FAST-LANE TRIAGE (docs/DM-BRIDGE.md): stamp the script-owned lane so the DM loop routes
  // routine beats to the fast model and memorable ones to Opus — without re-deciding per turn.
  const tri=(typeof dmTriage==="function")?dmTriage(w,action):null;
  const turn={ turnId:"t-"+uid(), worldId:w.id, action:action, rolls:rolls||[], digest:dmDigest(),
               lane:tri?tri.lane:null, laneModel:tri?tri.model:null, laneReasons:tri?tri.reasons:null };
  if(!(opts&&opts.hidden)) pushDmLog(w,"player",action,{rolls:rolls||[]});   // hidden = meta turns (e.g. the auto-opening) don't show as a player line
  w.dm=w.dm||{}; w.dm.rollReq=null; w.dm.ask=null; w.dm.pendingTurnId=turn.turnId;   // persist the in-flight turn so a reload resumes the poll
  saveU(U);
  postState();                                   // so the DM can read full state if the digest isn't enough
  GS.dm.pending=true; GS.dm.turnId=turn.turnId; GS.dm.turnStart=Date.now(); GS.dm.rollReq=null; GS.dm.ask=null; renderWorld();
  return fetch(DM_BASE+"/turn",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(turn)})
    .then(r=>{ if(!r.ok) throw new Error("bridge "+r.status); return r.json(); })
    .then(j=>{ GS.dm.turnId=j.turnId; pollResponse(j.turnId); return j.turnId; })
    .catch(e=>{ dmBridgeDown(e); throw e; });
}

const DM_POLL_TIMEOUT = 300000;  // wait up to 5 min — a live DM (Claude) composing a turn can take a while; only give up if truly no one's watching
const DM_LONGPOLL_S = 25;        // how long the bridge holds each /response open before returning 204 (then we re-issue)

/* LONG-POLL: each /response request blocks server-side until the DM answers (or DM_LONGPOLL_S elapses),
   so the reply surfaces the instant it lands — not on the next fixed poll tick. We re-issue immediately
   after a 204, tracking wall-clock for the give-up timeout. */
function pollResponse(turnId){
  if(GS.dm.poll){clearTimeout(GS.dm.poll);GS.dm.poll=null;}
  const started=Date.now();
  const tick=()=>{
    fetch(DM_BASE+"/response?turnId="+encodeURIComponent(turnId)+"&wait="+DM_LONGPOLL_S).then(r=>{
      if(r.status===204){
        if(Date.now()-started>=DM_POLL_TIMEOUT){ dmNoAnswer(); return null; }   // bridge up, but nobody is playing DM
        GS.dm.poll=setTimeout(tick,120); return null;                           // long-poll lapsed → re-arm at once
      }
      if(!r.ok) throw new Error("bridge "+r.status);
      return r.json().then(applyResponse);
    }).catch(dmBridgeDown);
  };
  tick();   // fire immediately — the request itself holds open until the answer is ready
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
  const latencyMs=(GS.dm.turnStart?Date.now()-GS.dm.turnStart:null); GS.dm.turnStart=null;   // turn round-trip (player send → DM answer)
  pushDmLog(w,"dm",r.narration||"(the DM was silent)",{events:r.events||[], applied, dmNotes:r.dmNotes||null, latencyMs});
  GS.dm.animate=true;   // stream this fresh narration word-by-word (renderWorld → streamDMText)
  GS.dm.rollReq=r.rollRequest||null;
  GS.dm.ask=r.ask||null;
  // turn answered — persist pending roll-request/ask, clear the in-flight turn (GS is transient). Mark
  // the current node "narrated" so triage only deep-lanes the FIRST contact with a place — but ONLY when
  // the scene was actually delivered: a response that hands back a rollRequest is mid-beat (the reveal
  // rides the roll-submit turn), so we KEEP the old marker and let that turn deep-lane the real arrival.
  const sceneDelivered=!GS.dm.rollReq;
  const narratedNode=sceneDelivered?w.currentNodeId:((w.dm&&w.dm.lastNarratedNodeId)||null);
  w.dm={rollReq:GS.dm.rollReq, ask:GS.dm.ask, pendingTurnId:null, lastNarratedNodeId:narratedNode};
  saveU(U); renderWorld(); postState();          // the DM sees post-event state next turn
  wakeReveal();                                  // first words have landed — lift the prep cinematic
}

/* The app posts a fresh state snapshot the DM can consult (read-only; never mutated by the bridge).
   Scoped to the world IN PLAY — the DM never needs the other saved worlds, so we don't ship them
   (smaller payload to read if the DM consults /state beyond the digest). */
function postState(){
  const w=activeWorld();
  const snap=w?Object.assign({},U,{worlds:{[w.id]:w}}):U;
  fetch(DM_BASE+"/state",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(snap)}).catch(()=>{});
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
   rides the NEXT turn. We never let the DM resolve it. d20 + ability mod + (prof if skill-proficient).
   `adv` is the DM-declared circumstance ("advantage"/"disadvantage") — we roll 2d20 keep highest/lowest,
   so the dice actually reflect the call (the script owns the mechanic; the DM owns whether it applies). */
function dmRollFor(skill,ability,adv){
  const w=activeWorld(); if(!w) return;
  const cur=w.characters.filter(c=>c.status==="living").slice(-1)[0]; const sh=cur&&cur.sheet;
  const aMod=(sh&&sh.mods&&ability&&typeof sh.mods[ability]==="number")?sh.mods[ability]:0;
  const prof=(sh&&sh.skillProfs&&skill&&sh.skillProfs.indexOf(skill)>=0)?(sh.profBonus||0):0;
  const mode=(adv==="advantage"||adv==="disadvantage")?adv:null;
  const d1=rollDie(20), d2=mode?rollDie(20):null;
  const die=mode==="advantage"?Math.max(d1,d2):mode==="disadvantage"?Math.min(d1,d2):d1;
  const pair=mode?[d1,d2]:null, total=die+aMod+prof;
  const advTag=mode==="advantage"?" (adv)":mode==="disadvantage"?" (disadv)":"";
  const mods=(aMod>=0?"+":"")+aMod+(prof?(" +"+prof+" prof"):"");
  const el=document.getElementById("dmDie"); if(el) dieRoll(el,{result:die,faces:20});
  GS.dm.rollReq=null;
  const rolls=[{label:skill+advTag,die:"d20",result:die,mods:mods,total:total,adv:mode,pair:pair}];
  // CRIT-MAGNITUDE (§5 dice are open): a nat 20/1 demands a second open d20 — the magnitude die. The
  // engine maps it to a lens vector the DM narrates FROM; we never let the DM fabricate the spike.
  let crit=null;
  if((die===20||die===1) && typeof rollCritMagnitude==="function"){
    crit=rollCritMagnitude(die,{magnitude:rollDie(20)});
    if(crit) rolls.push({label:(crit.success?"crit-magnitude":"fumble-magnitude"),die:"d20",result:crit.magnitude,total:crit.magnitude,crit});
  }
  const pairStr=pair?` [${pair.join(",")}]${mode==="advantage"?"↑":"↓"}`:"";
  // one toast — always shows the base check math; appends the spike when a crit fired (base info stays
  // visible exactly on the most dramatic rolls).
  toast(crit
    ? (crit.success?"CRIT! ":"FUMBLE! ")+skill+advTag+" d20="+die+" ("+total+") · magnitude "+crit.magnitude+" → "+crit.tier+(crit.lensCount?(" — "+crit.lensCount+" lens"+(crit.lensCount===1?"":"es")):"")
    : skill+advTag+": d20="+die+pairStr+" "+mods+" = "+total);
  sendTurn("(I roll "+skill+advTag+": "+total+")",rolls).catch(()=>{});
}

/* Free-dice roll: the player rolls an arbitrary expression (damage, healing, a wild die — "2d6+3",
   "1d8", "4d6") openly and it rides the next turn, exactly like a check. Used by a DM `rollRequest.dice`
   prompt AND the player's own dice tray. `label` is the flavor ("fire damage"); defaults to the expr. */
function dmRollDice(expr,label){
  const w=activeWorld(); if(!w) return;
  const r=(typeof rollDiceExpr==="function")?rollDiceExpr(expr):null;
  if(!r||!r.ok){ toast("Couldn't read those dice: "+expr); return; }
  const lab=(label&&String(label).trim())||r.expr;
  const lastDie=(r.terms||[]).filter(t=>t.rolls).slice(-1)[0];
  const el=document.getElementById("dmDie"); if(el) dieRoll(el,{result:r.total,faces:lastDie?lastDie.sides:20});
  GS.dm.rollReq=null;
  const rolls=[{label:lab,die:r.expr,result:r.total,total:r.total,expr:r.expr,breakdown:r.show}];
  toast(lab+": "+r.show);
  sendTurn("(I roll "+lab+": "+r.show+")",rolls).catch(()=>{});
}

/* Roll the expression typed into the dice-tray input (the free-roll path). */
function dmRollExprInput(){
  const el=document.getElementById("diceExpr"); if(!el) return;
  const v=(el.value||"").trim(); if(!v){ toast("Type some dice — e.g. 2d6+3"); return; }
  el.value=""; dmRollDice(v,v);
}

/* ============================================================
   2. THE EVENT-CONTRACT RUNTIME — applyEvent(w,e)
   Dispatch a typed DM event to the app's real mutators. Reused by ADVANCEMENT/DIFFICULTY later.
   ============================================================ */

/* Fuzzy-match a clockId to a faction or a front (v1 declared events; no stable ids on the web yet).
   clockId is a slug like "tide-wardens" or "tide-wardens:recover-ledger" or a front's danger slug. */
function findClockTarget(w,clockId){
  const id=slug(clockId||""); if(!id) return null;
  // Exact slug first; fall back to a prefix match ONLY when it's unambiguous (exactly one). A both-ways
  // prefix test that returns the FIRST hit can silently land a clock advance on the wrong front when two
  // powers share a name-stem — so an ambiguous prefix resolves to null (untracked) rather than a guess.
  const resolve=(arr,keyOf,wrap)=>{
    const exact=arr.find(x=>keyOf(x)===id); if(exact) return wrap(exact);
    const pre=arr.filter(x=>{const s=keyOf(x); return s && (id.indexOf(s)===0||s.indexOf(id)===0);});
    return pre.length===1 ? wrap(pre[0]) : null;
  };
  const fac=resolve(w.factions||[], f=>slug(f.name), f=>({kind:"faction", obj:f, label:f.name, clock:f.clock}));
  if(fac) return fac;
  return resolve(w.pressures||[], p=>slug(p.danger||p.kind), p=>({kind:"front", obj:p, label:p.danger||p.kind, clock:p.clock}));
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
  const wkStamp=(typeof walkStamp==="function")?walkStamp(w):null;   // WALK-CONSUMPTION (Step C): which walk/segment this beat came from
  switch(e.type){

    case "hp_changed":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const r=applyHpDelta(t.sh,typeof p.delta==="number"?p.delta:0);
      const sign=r.delta>0?"healed "+r.delta:(r.delta<0?"took "+(-r.delta)+" damage":"unchanged");
      addLedger(w,"outcome",{kind:"hp",pc:t.c.name,delta:r.delta,from:r.from,to:r.to,max:r.max,dropped:r.dropped,source:src},
        "✦ "+t.c.name+" "+sign+" — HP "+r.from+"→"+r.to+"/"+r.max+(r.dropped?" (down)":"")+".");
      return {ok:true,hp:r.to+"/"+r.max,dropped:r.dropped};
    }

    case "attack":{                                  // THE LIVE ATTACK PATH (docs/ITEMS.md) — resolve a PC swing
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};        // with the EQUIPPED weapon (pcAttack → resolveAttack).
      if(typeof pcAttack!=="function")return {ok:false,reason:"combat-unavailable"};  // p.d20 = the player's open roll (dice transparency).
      const res=pcAttack(t.sh,{d20:p.d20,targetAC:p.targetAC,slot:p.slot,cover:p.cover,advantage:p.advantage,crit:p.crit});
      if(!res)return {ok:false,reason:"no-weapon"};   // no INDEXED weapon in the slot — the DM resolves manually (o.dmg), by design
      const line=res.fullCover?(t.c.name+" — no line to the target (full cover)")
        :res.hit?(t.c.name+" hits with "+res.weaponName+(res.crit?" — CRITICAL":"")+" for "+res.damage+" damage")
        :(t.c.name+" misses with "+res.weaponName+" ("+res.natural+"+"+res.atkBonus+"="+res.total+" vs AC "+res.targetAC+")");
      addLedger(w,"outcome",{kind:"attack",pc:t.c.name,weapon:res.weaponName,hit:res.hit,crit:res.crit,damage:res.damage,
        natural:res.natural,total:res.total,targetAC:res.targetAC,breakdown:res.breakdown,source:src},"⚔ "+line+".");
      return {ok:true,result:res};
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
      if(!r.ok){const msg=(r.reason==="insufficient")
          ? "✦ "+t.c.name+" can't spend "+r.want+" "+r.label+" — only "+r.have+" left."
          : "✦ "+t.c.name+" has no "+(p.key||"resource")+" pool.";
        addLedger(w,"outcome",{kind:"resource",pc:t.c.name,key:p.key,reason:r.reason,have:r.have,want:r.want,source:src},msg);return r;}
      addLedger(w,"outcome",{kind:"resource",pc:t.c.name,key:r.key,label:r.label,spent:r.spent,remaining:r.remaining,max:r.max,source:src},
        "✦ "+t.c.name+" spends "+r.spent+" "+r.label+" — "+r.remaining+"/"+r.max+" left.");
      return {ok:true,remaining:r.remaining+"/"+r.max};
    }

    case "rest":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const kind=(p.kind==="long")?"long":"short";
      const summary=restRecover(t.sh,kind);
      // a long rest also refills magic-item charges to max (docs/ITEMS.md §E — the canonical dawn recharge,
      // simplified to "full on a long rest"; per-item recharge dice are a DM call via charge_restore).
      let recharged=0;
      if(kind==="long"){ (t.sh.inventory||[]).forEach(it=>{ if(it.ench&&it.ench.charges&&it.ench.charges.cur!==it.ench.charges.max){ it.ench.charges.cur=it.ench.charges.max; recharged++; } }); }
      addLedger(w,"outcome",{kind:"rest",pc:t.c.name,rest:kind,restored:summary,recharged:recharged,source:src},
        "✦ "+t.c.name+" takes a "+kind+" rest — restored: "+summary+(recharged?("; "+recharged+" item"+(recharged>1?"s":"")+" recharged"):"")+".");
      return {ok:true,rest:kind,restored:summary};
    }

    case "item_changed":{                            // INVENTORY mutation — the ONE event that touches gear/coin
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // (confiscation / loot / buy-sell / consume). Removed items are
      const sh=t.sh; sh.inventory=sh.inventory||[];                          // RECOVERABLE: the ledger records exactly what left, so a later add[] restores it.
      // ENCUMBRANCE HARD CAP (docs/ITEMS.md Decision 4 — "no barrelmancers"): a pickup that would push the
      // load past STR×30 is refused outright (surfaced, not silent). Skipped when the DM forces it (p.force)
      // or when the item's weight is unknown (unindexed → 0, never invents). Removes/confiscation are never blocked.
      if((p.add||[]).length && !p.force && typeof carryState==="function" && typeof itemDef==="function"){
        const cur=carryState(sh), hard=cur.hard;
        const addW=(p.add||[]).reduce((s,spec)=>{ const nm=String((spec&&spec.name!=null?spec.name:spec)||"").trim();
          const d=itemDef((spec&&spec.base)||nm); const q=(spec&&typeof spec.qty==="number"&&spec.qty>0)?spec.qty:1;
          return s+((d&&d.weight)||0)*q; },0);
        if(cur.weight+addW>hard) return {ok:false,reason:"over-capacity",weight:cur.weight,add:addW,hard:hard,
          note:t.c.name+" can't carry that much — over the "+hard+" lb hard cap."};
      }
      const removed=[], added=[];
      if(p.removeAll){ removed.push.apply(removed, sh.inventory.splice(0)); }   // strip everything (a searched/bound prisoner, a total loss)
      // removeIds (not name-matched — docs/ITEMS.md): a flat name string can't disambiguate two of the
      // same item or target "the cursed one" specifically; the instance id can.
      (p.removeIds||[]).forEach(id=>{ const i=sh.inventory.findIndex(it=>it.id===id); if(i>=0){ removed.push(sh.inventory[i]); sh.inventory.splice(i,1); } });
      // DEPRECATED back-compat: the pre-instance shape removed by NAME (p.remove:[name]). A live DM that
      // learned the old vocabulary would otherwise SILENTLY no-op a confiscation (the exact failure this
      // system was built to fix). Honor it — first instance whose name matches — so a stale emitter still
      // removes something rather than nothing. New emitters use removeIds.
      (p.remove||[]).forEach(name=>{ const n=String(name||"").trim().toLowerCase();
        const i=sh.inventory.findIndex(it=>String(it.name||"").trim().toLowerCase()===n);
        if(i>=0){ removed.push(sh.inventory[i]); sh.inventory.splice(i,1); } });
      (p.add||[]).forEach(spec=>{
        const name=String((spec&&spec.name!=null?spec.name:spec)||"").trim(); if(!name)return;
        const inst={id:uid(),name,conditions:[]};
        if(spec&&typeof spec.qty==="number"&&spec.qty>0)inst.qty=spec.qty;
        // CONGRUENCE (docs/ITEMS.md §E): a magic item mints with a base pointer + an enchantment overlay
        // + an optional codex link. Explicit spec fields win; else the overlay defaults from the magic
        // catalog (MAGIC_ITEMS_BY_NAME). `spec.bonus` is shorthand for choosing a generic +N template's
        // value. Charges initialize full (cur=max) on mint. A mundane item stays a bare {id,name,...}.
        const md=(typeof magicDef==="function")?magicDef(name):null;
        if(spec&&spec.base)inst.base=spec.base;
        let ench=(spec&&spec.ench)?JSON.parse(JSON.stringify(spec.ench)):((md&&md.ench)?JSON.parse(JSON.stringify(md.ench)):null);
        if(spec&&typeof spec.bonus==="number"){ ench=ench||{}; ench.bonus=spec.bonus; delete ench.bonusOptions; }
        if(ench){ if(ench.charges&&ench.charges.cur==null)ench.charges.cur=ench.charges.max; inst.ench=ench; }
        if(spec&&spec.codexId)inst.codexId=spec.codexId;
        sh.inventory.push(inst); added.push(inst);
      });
      let gold=0;
      if(typeof p.gold==="number" && p.gold){ const before=sh.gold||0; sh.gold=Math.max(0, before+p.gold); gold=sh.gold-before; }   // signed delta, clamped at 0
      const label=it=>it.name+(it.qty?(" ×"+it.qty):"");
      const parts=[];
      if(removed.length) parts.push("lost "+removed.map(label).join(", "));
      if(added.length) parts.push("gained "+added.map(label).join(", "));
      if(gold) parts.push((gold>0?"+":"")+gold+" gp");
      addLedger(w,"outcome",{kind:"inventory",pc:t.c.name,removed,added,gold,source:src},
        p.note||("◆ "+t.c.name+" — "+(parts.join("; ")||"inventory unchanged")+"."));
      return {ok:true,removed,added,gold,inventory:sh.inventory.slice()};
    }

    case "item_split":{                              // split `qty` off a stackable instance into a new one
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // (e.g. "drop 5 of my 20 arrows")
      const sh=t.sh; sh.inventory=sh.inventory||[];
      const from=sh.inventory.find(it=>it.id===p.itemId);
      if(!from)return {ok:false,reason:"no-such-item"};
      // Math.floor (not |0): a bitwise OR 32-bit-overflows a huge qty to garbage; reject a non-positive-
      // integer request outright instead of silently splitting 1.
      const have=from.qty||1, want=Math.floor(Number(p.qty));
      if(!(want>=1))return {ok:false,reason:"bad-qty",qty:p.qty};
      if(want>=have)return {ok:false,reason:"insufficient",have};            // splitting "all of it" is removeIds, not a split
      from.qty=have-want;
      const split={id:uid(),name:from.name,qty:want,conditions:(from.conditions||[]).slice()};
      sh.inventory.push(split);
      addLedger(w,"outcome",{kind:"inventory-split",pc:t.c.name,fromId:from.id,toId:split.id,name:from.name,qty:want,source:src},
        "◆ "+t.c.name+" splits "+want+" "+from.name+" off the stack ("+from.qty+" remain).");
      return {ok:true,newId:split.id,remaining:from.qty,inventory:sh.inventory.slice()};
    }

    case "item_use":{                                // CONSUME a consumable (docs/ITEMS.md Decision 2) — a potion/oil.
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // healing tiers heal numerically in-engine;
      const sh=t.sh; const it=(sh.inventory||[]).find(x=>x.id===p.itemId);  // every other potion stamps a structured buff the DM honors.
      if(!it)return {ok:false,reason:"no-such-item"};
      const md=(typeof magicDef==="function")?magicDef(it.name):null;
      const cons=(it.consumable)||(md&&md.consumable)||null;
      if(!cons||!cons.effect)return {ok:false,reason:"not-consumable",name:it.name};
      const eff=cons.effect; const outcome={kind:eff.kind};
      if(eff.kind==="heal"){
        // roll the heal (a potion isn't an attack; p.roll lets a transparent client pass the player's own roll)
        const rolled=(typeof p.roll==="number")?p.roll
          :((typeof cmRollDamage==="function")?cmRollDamage([{n:eff.dice.n,die:eff.dice.die,bonus:eff.dice.bonus,type:null}]).total
            :(eff.dice.n*Math.floor((eff.dice.die+1)/2)+(eff.dice.bonus||0)));
        const r=applyHpDelta(sh,rolled); outcome.healed=r.delta; outcome.roll=rolled; outcome.hp=r.to+"/"+r.max;
      } else if(eff.kind==="buff"){
        sh.buffs=sh.buffs||[];
        const buff={name:eff.name,duration:eff.duration||null,source:it.name}; if(eff.setStr)buff.setStr=true;
        sh.buffs.push(buff); outcome.buff=buff;
      } else if(eff.kind==="harm"){ outcome.harm=eff.note; }          // a trap potion — the DM adjudicates the save/damage
      // consume one: decrement a stack, else remove the instance
      let consumed=false;
      if(it.qty&&it.qty>1){ it.qty-=1; consumed=true; }
      else { const i=sh.inventory.indexOf(it); if(i>=0){ sh.inventory.splice(i,1); consumed=true; } }
      const desc=(eff.kind==="heal")?("heals "+outcome.healed+" — HP "+outcome.hp)
        :(eff.kind==="buff")?("gains "+eff.name+(eff.duration?(" ("+eff.duration+")"):"")):("triggers "+it.name);
      addLedger(w,"outcome",{kind:"item-use",pc:t.c.name,itemId:p.itemId,name:it.name,effect:outcome,consumed,source:src},
        "✦ "+t.c.name+" uses "+it.name+" — "+desc+".");
      return {ok:true,effect:outcome,consumed,inventory:sh.inventory.slice()};
    }

    case "charge_spend":{                            // spend N charges off a magic item's per-instance pool (docs/ITEMS.md §E)
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      const ench=it.ench||null;
      if(!ench||!ench.charges)return {ok:false,reason:"no-charges",name:it.name};
      if(ench.charges.cur==null)ench.charges.cur=ench.charges.max;
      const n=Math.max(1,Math.floor(Number(p.n)||1));
      if(ench.charges.cur<n)return {ok:false,reason:"insufficient-charges",have:ench.charges.cur,want:n};
      ench.charges.cur-=n;
      addLedger(w,"outcome",{kind:"charges",pc:t.c.name,itemId:it.id,name:it.name,spent:n,remaining:ench.charges.cur,max:ench.charges.max,source:src},
        "✦ "+t.c.name+"'s "+it.name+" — "+n+" charge"+(n>1?"s":"")+" spent ("+ench.charges.cur+"/"+ench.charges.max+" left).");
      return {ok:true,charges:Object.assign({},ench.charges)};
    }

    case "charge_restore":{                          // restore charges (a specific N, or omit to refill to max)
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      const ench=it.ench||null;
      if(!ench||!ench.charges)return {ok:false,reason:"no-charges",name:it.name};
      const max=ench.charges.max, cur=(ench.charges.cur==null?max:ench.charges.cur);
      ench.charges.cur=(typeof p.n==="number")?Math.min(max,cur+Math.max(0,Math.floor(p.n))):max;
      addLedger(w,"outcome",{kind:"charges",pc:t.c.name,itemId:it.id,name:it.name,restored:true,remaining:ench.charges.cur,max:max,source:src},
        "✦ "+t.c.name+"'s "+it.name+" recovers charges ("+ench.charges.cur+"/"+max+").");
      return {ok:true,charges:Object.assign({},ench.charges)};
    }

    case "condition_add":{                            // tag ONE inventory instance — on-fire/poisoned/
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // cursed/etc (ITEM_CONDITIONS, data/items.js)
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      const cond=String(p.condition||"").trim().toLowerCase();
      if(typeof ITEM_CONDITIONS!=="undefined" && ITEM_CONDITIONS.indexOf(cond)<0)return {ok:false,reason:"unknown-condition",cond};
      it.conditions=it.conditions||[];
      if(it.conditions.indexOf(cond)<0)it.conditions.push(cond);
      addLedger(w,"outcome",{kind:"item-condition",pc:t.c.name,itemId:it.id,name:it.name,condition:cond,added:true,source:src},
        "◆ "+t.c.name+"'s "+it.name+" is now "+cond+".");
      return {ok:true,conditions:it.conditions.slice()};
    }

    case "condition_remove":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      const cond=String(p.condition||"").trim().toLowerCase();
      it.conditions=(it.conditions||[]).filter(c=>c!==cond);
      addLedger(w,"outcome",{kind:"item-condition",pc:t.c.name,itemId:it.id,name:it.name,condition:cond,added:false,source:src},
        "◆ "+t.c.name+"'s "+it.name+" is no longer "+cond+".");
      return {ok:true,conditions:it.conditions.slice()};
    }

    case "equip":{                                    // sheet.equipped = {mainHand,offHand,armor} — NAMED
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // slots, not a single pointer, so dual-wield (main+off) is real
      if(EQUIP_SLOTS.indexOf(p.slot)<0)return {ok:false,reason:"bad-slot"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      // the slot must fit the item KIND so the slot can't hold nonsense (armor in a hand, a sword as
      // body armor) — checked only for INDEXED items; an unindexed/flavor item is allowed anywhere
      // (we don't know its kind, and refusing it would block legit improvised gear).
      const def=(typeof baseDef==="function")?baseDef(it):((typeof itemDef==="function")?itemDef(it.name):null);  // CONGRUENCE: a magic weapon validates off its base kind
      if(def){ const k=def.kind;
        const ok=(p.slot==="armor")?(k==="armor"||k==="shield"):(k==="weapon"||k==="shield"); // hands take weapons (or a shield off-hand)
        if(!ok)return {ok:false,reason:"slot-kind-mismatch",kind:k,slot:p.slot}; }
      t.sh.equipped=t.sh.equipped||{mainHand:null,offHand:null,armor:null};
      t.sh.equipped[p.slot]=it.id;
      const ac=(typeof cmSheetAC==="function")?(t.sh.ac=cmSheetAC(t.sh)):null;  // re-derive AC from armor + bonuses (docs/ITEMS.md)
      addLedger(w,"outcome",{kind:"equip",pc:t.c.name,slot:p.slot,itemId:it.id,name:it.name,ac:ac,source:src},
        "◆ "+t.c.name+" equips "+it.name+" ("+p.slot+")"+(ac!=null?" — AC "+ac:"")+".");
      return {ok:true,equipped:Object.assign({},t.sh.equipped),ac:ac};
    }

    case "unequip":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(EQUIP_SLOTS.indexOf(p.slot)<0)return {ok:false,reason:"bad-slot"};
      t.sh.equipped=t.sh.equipped||{mainHand:null,offHand:null,armor:null};
      const hadId=t.sh.equipped[p.slot]; t.sh.equipped[p.slot]=null;
      const ac=(typeof cmSheetAC==="function")?(t.sh.ac=cmSheetAC(t.sh)):null;
      if(hadId){ const it=(t.sh.inventory||[]).find(x=>x.id===hadId);
        addLedger(w,"outcome",{kind:"equip",pc:t.c.name,slot:p.slot,itemId:hadId,name:it?it.name:null,ac:ac,source:src},
          "◆ "+t.c.name+" unequips "+(it?it.name:"something")+" ("+p.slot+")"+(ac!=null?" — AC "+ac:"")+"."); }
      return {ok:true,equipped:Object.assign({},t.sh.equipped),ac:ac};
    }

    case "set_grip":{                                // VERSATILE GRIP (docs/ITEMS.md Decision 1) — the player's
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // explicit one-/two-handed wield choice for a Versatile main-hand.
      const grip=(p.grip==="1h")?"1h":"2h";
      t.sh.equipped=t.sh.equipped||{mainHand:null,offHand:null,armor:null};
      if(grip==="2h" && t.sh.equipped.offHand)return {ok:false,reason:"off-hand-occupied"};  // can't two-hand with a full off-hand
      t.sh.equipped.grip=grip;
      const mainId=t.sh.equipped.mainHand, main=mainId&&(t.sh.inventory||[]).find(x=>x.id===mainId);
      addLedger(w,"outcome",{kind:"grip",pc:t.c.name,grip:grip,name:main?main.name:null,source:src},
        "◆ "+t.c.name+" grips "+(main?main.name:"the weapon")+" "+(grip==="2h"?"in both hands":"one-handed")+".");
      return {ok:true,grip:grip};
    }

    case "attune":{                                  // ATTUNEMENT (docs/ITEMS.md §E) — bind to a magic item; the
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // SRD max-3 cap is enforced here. An item's magic is dormant until attuned.
      const sh=t.sh; const it=(sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      const ench=(typeof enchOf==="function")?enchOf(it):(it.ench||null);
      if(!ench||!ench.attunement)return {ok:false,reason:"no-attunement-needed",name:it.name};  // mundane / non-attunement item
      if(it.attuned)return {ok:true,already:true,attuned:true};
      const count=(typeof attunedCount==="function")?attunedCount(sh.inventory):(sh.inventory||[]).filter(x=>x.attuned).length;
      if(count>=3)return {ok:false,reason:"attunement-cap",cap:3,attuned:count};                // the anti-Christmas-tree rule
      it.ench=it.ench||Object.assign({},ench); it.attuned=true;    // materialize the overlay on the instance so the state sticks
      const ac=(typeof cmSheetAC==="function")?(sh.ac=cmSheetAC(sh)):null;    // an attuned +AC item changes the sheet AC
      addLedger(w,"outcome",{kind:"attune",pc:t.c.name,itemId:it.id,name:it.name,attuned:true,ac:ac,source:src},
        "◈ "+t.c.name+" attunes to "+it.name+((count+1>=3)?" (3/3 — attunement is full)":"")+(ac!=null?" — AC "+ac:"")+".");
      return {ok:true,attuned:true,slotsUsed:count+1};
    }

    case "unattune":{
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      const it=(t.sh.inventory||[]).find(x=>x.id===p.itemId);
      if(!it)return {ok:false,reason:"no-such-item"};
      it.attuned=false;
      const ac=(typeof cmSheetAC==="function")?(t.sh.ac=cmSheetAC(t.sh)):null;
      addLedger(w,"outcome",{kind:"attune",pc:t.c.name,itemId:it.id,name:it.name,attuned:false,ac:ac,source:src},
        "◈ "+t.c.name+" ends attunement to "+it.name+(ac!=null?" — AC "+ac:"")+".");
      return {ok:true,attuned:false};
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
      if(lev.terminal && !lev.autoShift){            // already at max friendliness — no rung to climb (§2)
        res={outcome:"already-max", from:a.value, to:a.value, shift:0, terrified:false, granted:true};
      } else if(lev.autoShift){                       // decisive leverage — the lever IS the answer, no roll (§2.1)
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
      if(p.to==null) return {ok:false,reason:"no-target-attitude"};   // a shift with no destination is malformed — don't echo a no-op canon line
      const r=codexSetAttitude(w,p.target,p.to,p.cause||"shift",clockOf(w).day);
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
      addLedger(w,"canon",{kind:"discovery",what:p.what,nodeId:nodeId,walk:wkStamp,source:src},"Discovered: "+(p.what||"something new"));
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
      addLedger(w,"outcome",{kind:"front_closed",ledgerId:p.ledgerId||p.frontId,how:p.how,walk:wkStamp,source:src},
        "✦ A front closes"+((tgt&&tgt.label)?(" — "+tgt.label):"")+(p.how?(" ("+p.how+")"):"")+".");
      grantXp(w,"front_closed",p,{size:(tgt&&tgt.clock&&tgt.clock.size)||6});   // stake = front clock size × tier
      return {ok:true};
    }

    case "encounter_resolved":{
      const foes=p.foes||[];
      addLedger(w,"outcome",{kind:"encounter",foes:foes,method:p.method,objectiveRef:p.objectiveRef||null,outcome:p.outcome||null,walk:wkStamp,source:src},
        "✦ Encounter "+(p.outcome||"resolved")+" ("+(p.method||"?")+") — "+foes.length+" foe"+(foes.length===1?"":"s")+".");
      grantXp(w,"encounter_resolved",p);           // pays ONLY when objectiveRef is set (ADVANCEMENT.md anti-grind)
      return {ok:true};
    }

    case "kill":{
      addLedger(w,"outcome",{kind:"kill",victimClass:p.victimClass,factionId:p.factionId||null,walk:wkStamp,source:src},
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
      // DETECTED escalation (DIFFICULTY.md): killing a faction's person advances THAT faction's clock
      // against the PC by 1 — the spine to clock_fired → an authored named response (bounty / inquisitor /
      // nemesis), never stat-scaled super-guards. A monster kill carries no factionId → no escalation.
      // p.factionId must be a key findClockTarget resolves (faction name / front danger); an unmatched id
      // logs as an untracked advance + no-ops, never a false escalation.
      if(p.factionId){
        const tgt=findClockTarget(w,p.factionId);
        const wasFull=!!(tgt&&tgt.clock&&(tgt.clock.filled||0)>=tgt.clock.size);
        const r=applyEvent(w,{type:"clock_advanced",payload:{clockId:p.factionId,delta:1},source:"detected"});
        // ONLY on the transition to full (not every subsequent kill) promote to clock_fired so the agenda
        // comes due once. forPlayer:false → no PC XP (this clock fills AGAINST the PC).
        if(r&&r.fired&&!wasFull)
          applyEvent(w,{type:"clock_fired",payload:{clockId:p.factionId,factionId:p.factionId,forPlayer:false},source:"detected"});
      }
      return {ok:true};
    }

    case "choice_logged":
      addLedger(w,"canon",{kind:"choice",weight:p.weight,forecloses:p.forecloses||[],source:src},
        "◆ Choice ("+(p.weight||"minor")+") logged"+(p.forecloses&&p.forecloses.length?(" — forecloses: "+p.forecloses.join(", ")):"")+".");
      grantXp(w,"choice_logged",p);                // pays only on a major choice (ADVANCEMENT.md)
      return {ok:true};

    case "inspiration_granted":{                      // HEROIC INSPIRATION (docs/SRD-MECHANIZATION.md §1) — now SETS the
      const t=livingSheet(w);                         // spendable reroll flag (was a play-quality no-op). Bool, no-stack.
      const wasNew=(t&&typeof grantInspiration==="function")?grantInspiration(t.sh):false;
      addLedger(w,"outcome",{kind:"inspiration",pc:p.pc||(t&&t.c.name),reason:p.reason,held:!!(t&&t.sh.inspiration),source:src},
        "✦ Heroic Inspiration — "+(p.reason||"a moment of brilliance")+(wasNew?" (you now hold it)":" (already held)")+".");
      return {ok:true, held:!!(t&&t.sh.inspiration)};
    }

    case "inspiration_spend":{                        // spend the token → reroll the just-resolved check/save/attack (§1)
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};
      if(typeof spendInspiration!=="function")return {ok:false,reason:"check-unavailable"};
      if(!spendInspiration(t.sh))return {ok:false,reason:"no-inspiration"};   // nothing held to spend
      // the reroll d20 rides IN on the payload (the player's open reroll — dice transparency); the caller/UI
      // re-resolves the check with {reroll:p.d20}. Here we just clear the flag + record the spend.
      addLedger(w,"outcome",{kind:"inspiration",pc:t.c.name,on:p.on||null,reroll:p.d20!=null?p.d20:null,spent:true,source:src},
        "✦ "+t.c.name+" spends Heroic Inspiration"+(p.on?(" on the "+p.on):"")+(p.d20!=null?(" — reroll "+p.d20):"")+".");
      return {ok:true, spent:true, reroll:(p.d20!=null?p.d20:null)};
    }

    case "check":{                                    // THE CHECK/SAVE SPINE (docs/SRD-MECHANIZATION.md §1) — the DM
      const t=livingSheet(w);if(!t)return {ok:false,reason:"no-pc"};         // DECLARES the player's open roll; the script GRADES it.
      if(typeof resolveCheck!=="function")return {ok:false,reason:"check-unavailable"};
      const kind=(p.kind==="save")?"save":(p.kind==="ability")?"ability":"skill";  // default skill
      const opts={d20:p.d20,advantage:p.advantage,bonus:p.bonus,reroll:p.reroll};
      let res;
      if(kind==="save") res=resolveSaveCheck(t.sh,p.key,p.dc,opts);
      else if(kind==="ability") res=resolveAbilityCheck(t.sh,p.key,p.dc,opts);
      else res=resolveSkillCheck(t.sh,p.key,p.dc,opts);
      addLedger(w,"outcome",{kind:"check",pc:t.c.name,checkKind:kind,key:p.key,dc:res.dc,total:res.total,
        natural:res.natural,success:res.success,margin:res.margin,degree:res.degree,source:src},
        "✦ "+t.c.name+" — "+kind+" "+(p.key||"")+" DC "+res.dc+": "+res.total+" ("+res.degree+", "+(res.success?"success":"fail")+").");
      return {ok:true, result:res};
    }

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
      const r=lockOnContact(w,p.nodeId); if(r.ok&&p.enter){ w.currentNodeId=p.nodeId; seeNode(w,p.nodeId); } return r;
    }

    case "walk_advance":                            // WALK-CONSUMPTION (Step A): the party clears a segment → move the cursor
      return (typeof walkAdvance==="function") ? walkAdvance(w,p.toSeg,p.nodeId) : {ok:false, reason:"walk-unavailable"};

    case "walk_complete":                           // WALK-CONSUMPTION (Step B): the walk is walked out → promote+reskin the next
      return (typeof walkComplete==="function") ? walkComplete(w,{nodeId:p.nodeId,abandoned:!!p.abandoned}) : {ok:false, reason:"walk-unavailable"};

    case "capture":                                 // WALK-CONSUMPTION (Step E): subdual → re-entry into the active walk's holding
      return (typeof applyCapture==="function") ? applyCapture(w,p) : {ok:false, reason:"capture-unavailable"};

    case "xp_granted":                               // the DM does NOT grant XP (DM-CHARTER §8.3b)
      // XP is detected from the priced beat-events, never DM-declared. The DM judges WHEN a beat
      // lands (emits front_closed / clock_fired / choice_logged / encounter_resolved); the script
      // owns the NUMBER. A raw xp_granted is intentionally a no-op so the door we closed in the
      // 2026-06-28 rebalance can't be re-opened. Surfaced (not silent) so a stray emit is visible.
      console.warn("[dm] xp_granted ignored — XP is detected, not DM-declared (DM-CHARTER §8.3b):",e);
      return {ok:false, reason:"xp-not-dm-granted"};

    default:
      console.warn("[dm] unknown event type — no-op (forward-compatible):",e.type,e);
      return {ok:false, reason:"unknown-type:"+e.type};
  }
}
