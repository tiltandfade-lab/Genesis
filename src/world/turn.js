/* GENESIS MODULE — src/world/turn.js — THE WORLD TURN (docs/WORLD-TURN.md).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The world advances by script-rolled Turns at defined triggers (§1): T1 long-elapse (passTime
   "montage", extends ssFactionTurn's faction-turn+pressure-tick), T2 the session seam (beginSession/
   endSession, unwired here — the seam module already owns carry-forward), T3 revisit-after-absence
   (the core: `elapsed = clock.day − node.lastVisitDay` resolved LAZILY on arrival). Everything the Turn
   rolls lands in the ledger as `drift`/`npc-life`/`clock`/`outcome` entries + matching codex updates;
   the DM narrates FROM rolled change, never invents it (§0).

   Tables `place-drift` / `npc-life-event` / `faction-outcome` are NOT YET COMPILED (BATCH2-GUARDRAILS
   H2 gates the voice-critical two on Adam's sample review) — every roll here is NULL-SAFE: rollTable()
   returns null for an uncompiled id and every call site degrades to a no-op (logged, never invented
   prose). Once the tables land this file needs no changes — same posture as WALK-REFRESH's skin wiring.

   Reads addLedger/ledgerOf/clockOf/mapOf/nodeName (world.state), codexOf/codexAdd/codexUpdate/
   codexLinksOf (world.codex), rollFaction (engine.world-gen), rollTable (engine.compiled),
   seamSalienceOf (world.seam) at call-time. */

/* ============================================================
   §1/§6 step 1 — node.lastVisitDay stamping + the orchestrator
   ============================================================ */

/* stamp the node the party now stands on with the CURRENT clock day — call this at every real
   arrival/departure site: prep_contact enter (both the departure node AND the destination),
   walkComplete travel-arrive (both pn.originNodeId on departure AND pn.destNodeId on arrival),
   the legacy explore() degrade path (fromId on departure AND toId on arrival), and world genesis's
   origin stamp. Idempotent; a same-day re-stamp is a no-op read. */
function turnStampVisit(w, nodeId){
  if(!nodeId) return;
  const n=mapOf(w).nodes[nodeId]; if(!n) return;
  n.lastVisitDay=clockOf(w).day;
}

/* THE ORCHESTRATOR (§6 step 1) — one entry point per trigger, pattern of ssFactionTurn (which T1
   subsumes/extends). Returns a small report object for callers/tests; every step is independently
   guarded so a missing table/helper degrades a STEP, never the whole Turn.
   trigger: "montage" (T1) | "revisit" (T3, ctx:{nodeId}) | "session" (T2, no-op here — seam.js owns it). */
function worldTurn(w, trigger, ctx){
  if(!w) return {ok:false, reason:"no-world"};
  ctx=ctx||{};
  const report={trigger, drift:null, factionOutcome:null, lifeEvent:null, renownFade:null, jobBoardExpired:null};
  if(trigger==="montage"){
    // wasFull snapshot BEFORE ssFactionTurn ticks — mirrors dm.js's clock_advanced/clock_fired
    // transition guard. Only a faction that CROSSES to full this montage fires; a faction whose
    // fired outcome leaves its clock at/above size (takeover/splinter/merge/default all do — only
    // advance/setback reset it) must NOT re-fire on every subsequent montage just for sitting full.
    const wasFullIds=new Set((w.factions||[]).filter(f=>f.clock&&f.clock.filled>=f.clock.size).map(f=>f.name));
    if(typeof ssFactionTurn==="function") ssFactionTurn(w);          // existing T1 faction-turn + pressure tick
    // §3: "when an agenda clock FIRES" — ssFactionTurn increments at most one faction's clock by 1;
    // detect the just-crossed-full transition here (script-side, no new DM event) and roll the
    // real outcome.
    const justFired=(w.factions||[]).find(f=>f.clock&&f.clock.filled>=f.clock.size&&!wasFullIds.has(f.name));
    if(justFired) report.factionOutcome=turnFactionOutcome(w, justFired.name);
    report.lifeEvent=turnLifeEvent(w, w.currentNodeId, {monthsLong:true});
    // REPUTATION.md §2/§4 interlock: "world-turn builds worldTurn() FIRST; reputation's fade hooks
    // into it" (BATCH2-GUARDRAILS H3). A montage is mechanically ONE DAY (play.js passTime
    // "montage" advances the clock exactly 1440 min), not one month — §2's decay is stated
    // "per in-world month elapsed", so the fade tick here passes 1/30 month (one day's worth of
    // fade) rather than a full month per montage. A review caught the original `repuFadeTick(w,1)`
    // over-fading renown ~30x too fast.
    if(typeof repuFadeTick==="function") report.renownFade=repuFadeTick(w, 1/30);
    // JOB-WALKS.md §3: unclaimed postings resolve WITHOUT the player after their TTL elapses — the
    // mutation check this guards against is "persist forever" (BATCH-GUARDRAILS J1). One sweep per
    // montage, same wiring shape as repuFadeTick above.
    if(typeof jobBoardTick==="function") report.jobBoardExpired=jobBoardTick(w);
    // REPUTATION.md §3: "hunted flag flips pressure bearing" (WORLD-TURN rim-bearing machinery,
    // pointed inward). NOT WIRED — w.pressures carries no structured faction link (only freeform
    // `danger` prose; rollPressure/rollFaction mint independently, no factionId), so pricing which
    // pressure belongs to a hunting faction would be a guessed string-match heuristic, not a real
    // read (BATCH2-GUARDRAILS G9: never guess). repuHuntedBy(w) is BUILT and ready for a future
    // pressure↔faction link to consume; see uncertainties.
  } else if(trigger==="revisit"){
    const nodeId=ctx.nodeId; if(!nodeId) return {ok:false, reason:"no-node"};
    const n=mapOf(w).nodes[nodeId];
    const prevDay=n&&n.lastVisitDay;
    turnStampVisit(w, nodeId);
    if(prevDay!=null){
      const elapsed=clockOf(w).day-prevDay;
      report.drift=turnDriftOnRevisit(w, nodeId, elapsed);
      if(elapsed>=14) report.lifeEvent=turnLifeEvent(w, nodeId, {elapsed});
    }
  }
  return Object.assign({ok:true}, report);
}

/* ============================================================
   §2 — drift on revisit: conservative curve, canon override
   ============================================================ */

/* Adam's band table (§2): <3d no roll · 3–13d 1 roll Grounded-weighted · 14–89d 1–2 rolls normal curve
   · 90d+ 2–3 rolls full curve. "Grounded-weighted"/"normal curve"/"full curve live" are DM-voice framing
   over the SAME place-drift table (one d100 roll always samples the whole band spread the table author
   wrote in) — the band controls ROLL COUNT here; a future authored weighting hook is out of this unit's
   scope (rollTable has no band-bias parameter today). */
function turnDriftRollCount(elapsed){
  if(elapsed<3) return 0;
  if(elapsed<14) return 1;
  if(elapsed<90) return 1+rollDie(2)-1;   // 1-2, uniform
  return 2+rollDie(2)-1;                  // 2-3, uniform
}

/* the escalation override (§2 "Adam's rule"): does this node carry canon that FORCES drift to
   manifest rather than invent? (a) a bound faction/front clock >= 2/3 full, (b) a fired clock not yet
   manifested (ledger clock_fired/clock entry with fired:true and no matching drift entry since),
   (c) a DM-held doom targeting the node (pressure.doom is always DM-only text — presence = targeting
   once a pressure names this node via dmOnly.real/doom; conservatively: any pressure with a doom string
   is a standing doom, node-scoping isn't modeled yet so this reads world-wide doom presence), (d) prior
   ledger canon marking instability (a "drift" entry already on this node's ledger trail). Returns
   {escalate:boolean, cause:string|null, firedDoom:object|null} — firedDoom carries the verbatim already-
   rolled outcome text so turnDriftOnRevisit can MANIFEST it rather than re-roll (§2: "a FIRED clock's
   drift roll doesn't re-decide the outcome — it manifests the already-rolled doom"). */
function turnDriftEscalation(w, nodeId){
  const twoThirds=arr=>arr.find(x=>x.clock && x.clock.size>0 && (x.clock.filled||0)/x.clock.size>=(2/3));
  const boundClock=twoThirds(w.factions||[]) || twoThirds(w.pressures||[]);
  if(boundClock) return {escalate:true, cause:"bound-clock-two-thirds", firedDoom:null};

  // a fired clock not yet manifested: the most recent clock_fired ledger entry for this node with no
  // later drift entry referencing the same clockId/factionId.
  const log=ledgerOf(w);
  const fires=log.filter(e=>e.type==="clock"&&e.data&&e.data.fired);
  for(let i=fires.length-1;i>=0;i--){
    const f=fires[i];
    const manifested=log.some(d=>d.type==="drift"&&d.data&&d.data.manifestsClockId===(f.data.clockId||f.data.factionId));
    if(!manifested) return {escalate:true, cause:"fired-clock-unmanifested", firedDoom:f};
  }

  const doomPressure=(w.pressures||[]).find(p=>p.doom);
  if(doomPressure) return {escalate:true, cause:"dm-held-doom", firedDoom:null};

  const priorInstability=log.some(e=>e.type==="drift"&&e.data&&e.data.nodeId===nodeId);
  if(priorInstability) return {escalate:true, cause:"prior-instability-canon", firedDoom:null};

  return {escalate:false, cause:null, firedDoom:null};
}

/* resolve drift for a node just re-entered after `elapsed` days away (§2). Rolls 0-3 `place-drift`
   entries (band-gated), applies the escalation override (+1 roll, spice floor→Textured, and a fired-
   but-unmanifested doom MANIFESTS verbatim rather than re-rolling), writes a `drift` ledger entry +
   codex update per roll, and returns the `arrivalBrief` shape the digest surfaces (dmOnly until
   narrated). NULL-SAFE: place-drift isn't compiled yet — rollTable("place-drift") returns null, and
   this degrades to a manifested-doom-only (or empty) brief rather than inventing prose. */
function turnDriftOnRevisit(w, nodeId, elapsed){
  let n=turnDriftRollCount(elapsed);
  if(n<=0 && elapsed<3) return null;   // <3 days: no roll, no brief (§2 band 1)
  const esc=turnDriftEscalation(w, nodeId);
  if(esc.escalate) n+=1;
  const entries=[];

  // the escalation override's manifest path: a fired-unmanifested clock's outcome is CANON already
  // rolled — narrate it verbatim, never re-roll a fresh place-drift result for this slot.
  if(esc.firedDoom){
    const clockId=esc.firedDoom.data.clockId||esc.firedDoom.data.factionId||null;
    const text=esc.firedDoom.text||"The clock's agenda has come due.";
    const e=addLedger(w,"drift",{kind:"manifest",nodeId,manifestsClockId:clockId,escalated:true,cause:esc.cause},
      "◆ "+text+" — the change has reached "+nodeName(w,nodeId)+".");
    entries.push(e);
    n=Math.max(0,n-1);
  }

  for(let i=0;i<n;i++){
    const roll=(typeof rollTable==="function")?rollTable("place-drift"):null;
    if(!roll){ console.warn("[world-turn] place-drift not compiled — drift roll skipped (null-safe)"); continue; }
    // spice floor: the escalation override raises the floor to Textured (§2) — a Grounded/none-band
    // roll under escalation re-rolls once toward the floor rather than reporting a softened result
    // (drift may never contradict or soften established canon).
    let r=roll;
    if(esc.escalate && SPICE_ORDER.indexOf(r.band)<SPICE_ORDER.indexOf("Textured")){
      const r2=rollTable("place-drift"); if(r2 && SPICE_ORDER.indexOf(r2.band)>=SPICE_ORDER.indexOf(r.band)) r=r2;
    }
    const e=addLedger(w,"drift",{kind:"place",nodeId,band:r.band,escalated:esc.escalate,cause:esc.cause},
      "◆ "+r.text+" — "+nodeName(w,nodeId)+" has changed since you were last here.");
    // codex updates (§2): mark the location record's status.condition + a gazetteer note, so the
    // change is queryable canon, not just a ledger line. Best-effort: no codex/location → ledger only.
    if(typeof codexOf==="function"){
      const nn=mapOf(w).nodes[nodeId];
      if(nn&&nn.codexId&&typeof codexUpdate==="function") codexUpdate(w,nn.codexId,{status:{condition:r.band}});
    }
    entries.push(e);
  }
  if(!entries.length) return null;
  return { nodeId, entries:entries.map(e=>({id:e.id,type:e.type,text:e.text,day:e.day})), revealed:false };
}

/* the spice-band order (Grounded < Textured < Strange < Volatile < Mythic) — shared ordinal for the
   escalation floor comparison. Matches SPICE-CURVE.md's canonical band list. */
const SPICE_ORDER=["Grounded","Textured","Strange","Volatile","Mythic"];

/* §5/digest surface — the unrevealed drift entries for a node, dmOnly until the DM narrates the
   return. Reads the ledger directly (no separate arrivalBrief store) so a reload never loses it;
   "unrevealed" = never referenced by a later dmlog turn — v1 marks revealed via turnRevealDrift. */
function turnArrivalBrief(w, nodeId){
  if(!nodeId) return null;
  const entries=ledgerOf(w).filter(e=>e.type==="drift"&&e.data&&e.data.nodeId===nodeId&&!e.data.revealed);
  if(!entries.length) return null;
  return { nodeId, entries:entries.map(e=>({id:e.id,text:e.text,day:e.day})) };
}
/* mark a node's drift entries revealed (the DM has narrated the return) — called once the turn's
   response lands, mirroring the mint-spotlight clear-on-response pattern in applyResponse. */
function turnRevealDrift(w, nodeId){
  if(!nodeId) return 0;
  let n=0;
  ledgerOf(w).forEach(e=>{ if(e.type==="drift"&&e.data&&e.data.nodeId===nodeId&&!e.data.revealed){ e.data.revealed=true; n++; } });
  return n;
}

/* ============================================================
   §3 — faction turns grow teeth: the faction-outcome roll + real mutations
   ============================================================ */

/* roll `faction-outcome` (d20, provisional) for a faction whose agenda clock just FIRED. Mutates
   w.factions/codex per the result (§3): advance (permanent canon mark + re-roll a fresh agenda,
   identity persists) · setback (clock resets, method hardens) · splinter (mint a rival off SS.f* —
   rollFaction — parent loses a tag) · merge (absorb the weakest rival) · takeover (dominant flag
   moves) · collapse (→historical; codex record persists as recall fodder). Ledgers as `clock`+
   `outcome`, veiled (the reveal arc as usual — factions stay hidden until `reveal(w,'powers')` fires
   elsewhere). NULL-SAFE: faction-outcome isn't compiled — degrades to a no-op (logged) so a fired
   clock is never silently invented into an outcome. */
function turnFactionOutcome(w, factionName){
  const f=(w.factions||[]).find(x=>x.name===factionName); if(!f) return {ok:false, reason:"no-faction"};
  const roll=(typeof rollTable==="function")?rollTable("faction-outcome"):null;
  if(!roll){ console.warn("[world-turn] faction-outcome not compiled — outcome skipped (null-safe)"); return {ok:false, reason:"no-table"}; }
  const outcome=(roll.cells&&roll.cells[0])||turnOutcomeFromText(roll.text);
  let result={ok:true, outcome, faction:f.name};

  switch(outcome){
    case "advance":{
      f.clock.filled=f.clock.size;
      const oldAgenda=f.agenda;
      f.agenda=(typeof rollTbl==="function"&&typeof SS!=="undefined")?rollTbl(SS.fAgenda).text:f.agenda;
      f.clock={size:6,filled:0};
      addLedger(w,"canon",{kind:"faction-advance",faction:f.name,oldAgenda,newAgenda:f.agenda},
        `◆ ${f.name} achieves its aim — ${oldAgenda}. Now it means to ${f.agenda}.`);
      break;
    }
    case "setback":{
      f.clock.filled=0;
      f.method=(typeof rollTbl==="function"&&typeof SS!=="undefined")?rollTbl(SS.fMethod).text:f.method;
      addLedger(w,"outcome",{kind:"faction-setback",faction:f.name,method:f.method},
        `✦ ${f.name} suffers a setback — its agenda clock resets; its method hardens toward ${f.method}.`);
      break;
    }
    case "splinter":{
      if(typeof rollFaction==="function"){
        const rival=rollFaction((typeof lookup==="function")?lookup("faction").name:f.name+" Splinter", false);
        w.factions.push(rival);
        if(f.tags&&f.tags.length) f.tags=f.tags.slice(0,-1);
        addLedger(w,"canon",{kind:"faction-splinter",parent:f.name,child:rival.name},
          `◆ A splinter breaks from ${f.name} — ${rival.name} rises, ${rival.rel||"at odds"} with its former house.`);
        result.child=rival.name;
      }
      break;
    }
    case "merge":{
      const rivals=(w.factions||[]).filter(x=>x!==f&&!x.dominant);
      if(rivals.length){
        const weakest=rivals.reduce((a,b)=>((a.clock.filled/a.clock.size)<=(b.clock.filled/b.clock.size)?a:b));
        f.tags=Array.from(new Set([].concat(f.tags||[],weakest.tags||[])));
        w.factions=w.factions.filter(x=>x!==weakest);
        addLedger(w,"canon",{kind:"faction-merge",absorbed:weakest.name,into:f.name},
          `◆ ${f.name} absorbs ${weakest.name} — its tags and its people, folded in.`);
        result.absorbed=weakest.name;
      }
      break;
    }
    case "takeover":{
      const oldDom=(w.factions||[]).find(x=>x.dominant);
      if(oldDom) oldDom.dominant=false;
      f.dominant=true;
      addLedger(w,"canon",{kind:"faction-takeover",faction:f.name,displaced:oldDom?oldDom.name:null},
        `◆ ${f.name} seizes the dominant seat${oldDom?(" from "+oldDom.name):""}.`);
      break;
    }
    case "collapse":{
      w.factions=(w.factions||[]).filter(x=>x!==f);
      if(typeof codexOf==="function"){
        const id="faction:"+slug(f.name);
        if(typeof codexUpdate==="function"&&codexGet(w,id)) codexUpdate(w,id,{status:{condition:"historical"}});
        else if(typeof codexAdd==="function") codexAdd(w,{id,kind:"faction",name:f.name,provenance:"authored",
          fields:{agenda:f.agenda,method:f.method,dominant:false,historical:true},status:{known:true,soft:false,condition:"historical"}});
      }
      addLedger(w,"canon",{kind:"faction-collapse",faction:f.name},
        `◆ ${f.name} collapses — its name passes into history, its record kept for what still remembers it.`);
      break;
    }
    default:
      addLedger(w,"outcome",{kind:"faction-turn-unresolved",faction:f.name,rolled:roll.text},
        `✦ ${f.name}'s agenda comes due — ${roll.text}`);
  }
  return result;
}

/* best-effort text→outcome-key mapper for when the compiled table ships bare text (no dm cells) —
   a defensive fallback; the real table SHOULD carry the outcome key in cells[0] per the spec's
   d20 columns (Result key | text). Never invents an outcome not in the fixed vocabulary. */
function turnOutcomeFromText(text){
  const t=(text||"").toLowerCase();
  if(/advance|achiev/.test(t)) return "advance";
  if(/setback|falter/.test(t)) return "setback";
  if(/splinter|breaks? (away|from)/.test(t)) return "splinter";
  if(/merge|absorb/.test(t)) return "merge";
  if(/takeover|seize|supplant/.test(t)) return "takeover";
  if(/collapse|dissolve|falls?/.test(t)) return "collapse";
  return null;
}

/* ============================================================
   §4 — NPC life-events: known faces move through time
   ============================================================ */

/* roll ONE salience-weighted KNOWN npc at `nodeId` on `npc-life-event` (§4). Eligible = status.known
   only (soft NPCs recycle as today, no biography). Weighting: attitude-touched/known records with a
   HIGHER touchedSeq (more recently engaged) weigh more, via a simple recency-rank pick — a full
   probability model isn't needed for "ONE npc, thin v1". Death/vanishing of a THREAD-LINKED npc
   (codexLinksOf has any entry) mints a successor thread (§4 "the mortality rule"). NULL-SAFE:
   npc-life-event isn't compiled — degrades to a no-op. */
function turnLifeEvent(w, nodeId, opts){
  opts=opts||{};
  if(!nodeId || typeof codexOf!=="function") return null;
  const known=Object.values(codexOf(w).records).filter(r=>r.kind==="npc"&&r.status&&r.status.known&&r.status.at===nodeId&&r.status.condition!=="dead"&&r.status.condition!=="vanished");
  if(!known.length) return null;
  // salience-weighted draw: sort by touchedSeq desc (most recently engaged first), weight the top
  // half 2x by duplicating it into the draw pool — thin v1, no external randomness library needed.
  const sorted=known.slice().sort((a,b)=>(b.touchedSeq||0)-(a.touchedSeq||0));
  const half=Math.max(1,Math.ceil(sorted.length/2));
  const pool=sorted.slice(0,half).concat(sorted.slice(0,half)).concat(sorted);
  const npc=pool[rollDie(pool.length)-1];

  const roll=(typeof rollTable==="function")?rollTable("npc-life-event"):null;
  if(!roll){ console.warn("[world-turn] npc-life-event not compiled — life-event skipped (null-safe)"); return null; }
  const fate=(roll.cells&&roll.cells[0])||turnFateFromText(roll.text);
  addLedger(w,"npc-life",{kind:"life-event",npcId:npc.id,name:npc.name,fate,band:roll.band,monthsLong:!!opts.monthsLong},
    "◆ "+npc.name+" — "+roll.text);
  if(typeof codexUpdate==="function"){
    if(fate==="died"||fate==="vanished") codexUpdate(w,npc.id,{status:{condition:fate}});
    else codexUpdate(w,npc.id,{fields:{lastLifeEvent:roll.text}});
  }

  let successor=null;
  if((fate==="died"||fate==="vanished") && typeof codexLinksOf==="function"){
    const links=codexLinksOf(w,npc.id);
    if(links.length){
      successor=turnMintSuccessorThread(w, npc, fate);
    }
  }
  return { npcId:npc.id, name:npc.name, fate, text:roll.text, successor };
}

function turnFateFromText(text){
  const t=(text||"").toLowerCase();
  if(/died|death|attends? their own grave/.test(t)) return "died";
  if(/vanish/.test(t)) return "vanished";
  if(/married/.test(t)) return "married";
  if(/ill|fever/.test(t)) return "ill";
  if(/prosper/.test(t)) return "prospered";
  if(/ruin/.test(t)) return "ruined";
  if(/promot/.test(t)) return "promoted";
  if(/moved/.test(t)) return "moved";
  return null;
}

/* §4 "the mortality rule" — death/vanishing of a THREAD-LINKED npc auto-mints a successor thread
   handle (cause-shape/what-remains/who-inherits), linked to the deceased's record. Nothing
   load-bearing disappears without leaving a door. Returns the new codex thread record's id, or null
   if codexAdd/codexLink aren't loaded. */
function turnMintSuccessorThread(w, npc, fate){
  if(typeof codexAdd!=="function") return null;
  const causeShape=fate==="died"?"a death that wants an heir or an avenger":"a vanishing that wants an explanation";
  const whatRemains=(typeof rollTbl==="function"&&typeof SS!=="undefined"&&SS.pImpersonal)?rollTbl(SS.pImpersonal).text:"an unanswered question";
  const id=(typeof prepCastId==="function")?prepCastId(w,"thread",npc.name+" — successor"):("thread:"+slug(npc.name)+"-successor-"+uid());
  const rec=codexAdd(w,{ id, kind:"thread", name:npc.name+" — what remains",
    provenance:"rolled",
    fields:{ desc:causeShape+"; "+whatRemains, npc:npc.name, fate },
    dm:{ legs:"thread-seed", pool:"npc-life", causeShape, whatRemains, inherits:null },
    status:{ known:false, soft:true, at:npc.status.at||null } });
  if(rec && typeof codexLink==="function") codexLink(w, rec.id, "part-of", npc.id);
  addLedger(w,"npc-life",{kind:"successor-thread",npcId:npc.id,threadId:rec?rec.id:null,fate},
    "◆ What "+npc.name+" leaves behind: "+causeShape+".");
  return rec?rec.id:null;
}

/* ============================================================
   §5 — recall: the reincorporation oracle
   ============================================================ */

/* salience-weighted draw over KNOWN/hard codex records + ledger canon (§5). weight = seamSalienceOf
   (engagement) + recency decay (touchedSeq rank, newer=higher) + link degree (codexLinksOf length) +
   an open-thread bonus (dm.legs is hook/thread-seed and unresolved). Excludes: soft/unknown records,
   and anything present in the current scene (opts.excludeIds — the caller passes the here-and-now
   ids so recall never re-surfaces what's already on stage). Returns {id,kind,name,why,genRef} shaped
   like digest.minted (genRef.recall:true marks it a recall draw, not a mint) — or null if nothing
   qualifies. */
function turnRecall(w, opts){
  opts=opts||{};
  if(typeof codexOf!=="function") return null;
  const exclude=new Set(opts.excludeIds||[]);
  const all=Object.values(codexOf(w).records);
  const maxSeq=all.reduce((m,r)=>Math.max(m,r.touchedSeq||0),0)||1;
  const candidates=all.filter(r=>r.status && r.status.known && !r.status.soft && !exclude.has(r.id));
  if(!candidates.length) return null;
  const weighted=candidates.map(r=>{
    const sal=(typeof seamSalienceOf==="function")?seamSalienceOf({status:r.status}):0;
    const recency=(r.touchedSeq||0)/maxSeq;                                   // 0..1, newer engagement weighs more
    const degree=(typeof codexLinksOf==="function")?codexLinksOf(w,r.id).length:0;
    const openThread=(r.dm&&(r.dm.legs==="hook"||r.dm.legs==="thread-seed")&&!r.dm.resolved)?2:0;
    const weight=sal+recency*2+Math.min(degree,3)+openThread+0.01;            // +0.01 floor so every known record is drawable
    return {r, weight};
  });
  const total=weighted.reduce((s,x)=>s+x.weight,0);
  let roll=Math.random()*total, chosen=weighted[weighted.length-1].r;
  for(const x of weighted){ roll-=x.weight; if(roll<=0){ chosen=x.r; break; } }
  const why=turnRecallWhy(chosen, w);
  return { id:chosen.id, kind:chosen.kind, name:chosen.name, why, genRef:{recall:true} };
}

/* the WHY a recalled record resurfaces — a short human reason for the digest (§5: `digest.minted`
   form, "unresolved: the lover's passage" style). Best-effort from the record's own dm/fields. */
function turnRecallWhy(r, w){
  if(r.dm){
    if(r.dm.legs==="hook"||r.dm.legs==="thread-seed") return "unresolved: "+(r.fields&&r.fields.desc||r.name);
    if(r.dm.want) return "still wants: "+r.dm.want;
  }
  if(r.kind==="npc") return "a face from before";
  if(r.kind==="location") return "a place that hasn't been visited in a while";
  return "the world rhymes with itself";
}

/* §5 "the lull nudge" — ONE candidate for the digest's sessionLean block, present only when the
   lull machinery is active (dm.js gates sessionLean on w.carryForward.nextShape; echo rides the SAME
   gate per spec — "rides the sessionLean lull machinery"). Compact ({id,name,why}, ~80 bytes). */
function turnEcho(w, opts){
  if(!w || !w.carryForward || !w.carryForward.nextShape) return null;
  const r=turnRecall(w, opts);
  if(!r) return null;
  return { id:r.id, name:r.name, why:r.why };
}
