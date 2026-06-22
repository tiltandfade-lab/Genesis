/* GENESIS MODULE — src/world/rebirth.js — the death→rebirth loop (bardo gap · visions · corpse).
   Built 2026-06-21 for Death & Rebirth (docs/DEATH-AND-REBIRTH.md). Grows across build steps:
     step 2 (here): the bardo gap — a 0–49 in-world-day bell roll that advances the world clock
       and drifts the faction web over the time the hero is gone.
     step 3 (later): the 14 peaceful/wrathful vision-rolls against the dead PC's Saga.
     step 5 (later): the corpse + loot decay.
   Classic <script>, shared global scope. Reads rollDie (engine.core), advanceClock/clockOf/addLedger/
   logEvent/timeOfDay (world.state), ssFactionTurn (engine.world-gen) at call-time.
   This is the NEW death flow; the legacy src/world/fate.js spawn-back is retired at build step 7. */

const BARDO_MAX_DAYS=49; // Tibetan Bardo Thodol — the full 7×7 window between death and rebirth

/* Roll the gap, 0..49 in-world days, bell-shaped (triangular via the mean of 2d50): the mode lands
   near 3–4 weeks, with the rare instant exit and the rare full 49-day tail the spec calls for. */
function rollBardoGap(){
  const d=Math.round((rollDie(50)+rollDie(50))/2)-1; // 1..50 triangular → 0..49
  return Math.max(0,Math.min(BARDO_MAX_DAYS,d));
}

/* Advance the world across the bardo gap: move the clock forward `days`, and turn the faction web
   once per elapsed week (min 1 if any time passed) so the successor wakes into a genuinely later
   world — the same drift machinery a montage uses. Returns {days,turns,fromDay,toDay}. */
function bardoGap(w,days){
  if(!w)return null;
  const g=(days==null)?rollBardoGap():Math.max(0,Math.min(BARDO_MAX_DAYS,days|0));
  const fromDay=clockOf(w).day;
  advanceClock(w,g*1440);
  const toDay=clockOf(w).day;
  addLedger(w,"transition",{kind:"bardo",advanceMin:g*1440,days:g},
    g>0?`The bardo — ${g} day${g===1?"":"s"} pass between lives. It is now Day ${toDay}, ${timeOfDay(clockOf(w).min)}.`
       :`The bardo passes in an instant — a new soul enters the same hour the last departed.`);
  let turns=0;
  if(g>0){
    turns=Math.max(1,Math.round(g/7)); // one turning of the web per week gone
    for(let i=0;i<turns;i++)ssFactionTurn(w);
  }
  logEvent(w,`The wheel turns — ${g} day${g===1?"":"s"} of bardo; the world moved on${turns?` (${turns} faction turn${turns===1?"":"s"})`:""}.`);
  return {days:g,turns,fromDay,toDay};
}

/* ============================================================
   Step 3 — the 14 vision-rolls (Chönyi Bardo: 7 peaceful + 7 wrathful days).
   Each of the dead PC's Saga entities gets one peaceful + one wrathful vision; a ~50% roll
   decides whether it comes to pass. A fired vision MUTATES an existing structure (faction clock,
   NPC/place fate, thread resolution) + writes the truth to the ledger (DM-side canon), and the
   player sees only a 6–10 word Fragment — a hint that baits a return visit.
   DRAFT FLAVOR (the vocabulary below) is meant to be revised/expanded into a proper authored
   spice-graded vision table later (docs/DEATH-AND-REBIRTH.md "Author a full vision table").
   ============================================================ */

// %s = the entity's name. The line is the DM-side truth; the frag is what the player sees.
const VISION_OUTCOMES={
  faction:{
    peaceful:[{frag:"a banner you knew flies higher now",line:"%s rises in your absence — its agenda gains ground."},
              {frag:"distant bells ring for a victory",line:"%s wins a quiet victory while you are gone."}],
    wrathful:[{frag:"smoke over a hall that once stood proud",line:"%s is broken — a defeat, a betrayal, ground lost."},
              {frag:"a banner you knew lies in the mud",line:"%s falters, and a rival moves into the gap."}],
  },
  npc:{
    peaceful:[{frag:"a familiar face, lifted up and laughing",line:"%s prospers — risen in fortune or station."},
              {frag:"a hearth you knew, warmer than before",line:"%s finds peace and good fortune in your absence."}],
    wrathful:[{frag:"an empty chair where a friend once sat",line:"%s falls — ruined, taken, or dead."},
              {frag:"a name spoken in past tense",line:"%s comes to grief while you are gone."}],
  },
  enemy:{
    peaceful:[{frag:"the one who wronged you wears a crown",line:"%s — your enemy — ascends, unpunished."},
              {frag:"a hated name, spoken now with awe",line:"%s grows into a power, your death their making."}],
    wrathful:[{frag:"the one who wronged you, bones in a ditch",line:"%s — your enemy — is undone in your absence."},
              {frag:"a hated name, now spoken with scorn",line:"%s falls from grace while you are gone."}],
  },
  place:{
    peaceful:[{frag:"a green valley you once crossed, thriving",line:"%s prospers — a good season, a kind turn."},
              {frag:"lamps lit warm in a town you knew",line:"%s flourishes in your absence."}],
    wrathful:[{frag:"a skyline you knew, broken and burning",line:"%s is ruined — razed, plagued, or emptied."},
              {frag:"a road home that no longer leads home",line:"%s falls to ruin while you are gone."}],
  },
  thread:{
    peaceful:[{frag:"a thread you left, gently tied off",line:"An old thread resolves kindly: %s."},
              {frag:"a question you carried, softly answered",line:"What you left unfinished finds grace: %s."}],
    wrathful:[{frag:"a thread you left, snapped in the dark",line:"An old thread resolves in grief: %s."},
              {frag:"a debt you left, come due in blood",line:"What you left unfinished turns bitter: %s."}],
  },
};
// shown when a vision does NOT come to pass — keeps the 14-beat rhythm, no mutation
const VISION_QUIET={
  peaceful:["a still place, untroubled and waiting","calm water, holding its breath","a quiet that asks nothing of you"],
  wrathful:["a shadow that passes without falling","a held breath that does not break","a darkness that turns away, this time"],
};

function visionPick(arr){return arr[rollDie(arr.length)-1];}

/* Mutate the live structure a fired vision targets (best-effort; the ledger holds the canon either way). */
function applyVision(w,ent,val){
  if(ent.type==="faction"){
    const f=(w.factions||[]).find(x=>x.name===ent.name);
    if(f){f.clock=f.clock||{size:6,filled:0};
      f.clock.filled=(val==="peaceful")?Math.min(f.clock.size,f.clock.filled+1):Math.max(0,f.clock.filled-1);}
  } else if(ent.type==="npc"||ent.type==="enemy"){
    const g=(w.gazetteer||[]).find(x=>x.type==="NPC"&&x.name===ent.name);
    if(g)g.fate=(val==="peaceful")?"risen":"fallen";
  } else if(ent.type==="place"){
    const g=(w.gazetteer||[]).find(x=>x.name===ent.name);
    if(g)g.fate=(val==="peaceful")?"prospered":"ruined";
  } // thread: no structure to move — the ledger entry is the record
}

/* Roll one vision against one Saga entity. Returns the player-facing fragment + DM-side truth. */
function rollVision(w,c,ent,val){
  const fired=rollDie(2)===1; // ~50% — a chance of good (peaceful) / ill (wrathful) coming to pass
  if(!fired) return {entity:{type:ent.type,name:ent.name},valence:val,fired:false,
    fragment:visionPick(VISION_QUIET[val]),truth:null,ledgerId:null};
  const o=visionPick((VISION_OUTCOMES[ent.type]||VISION_OUTCOMES.npc)[val]);
  applyVision(w,ent,val);
  const truth=o.line.replace("%s",ent.name);
  const e=addLedger(w,"drift",{kind:"bardo-vision",valence:val,entType:ent.type,entName:ent.name,fromChar:c.id},
    `Bardo vision (${val}) — ${truth}`);
  return {entity:{type:ent.type,name:ent.name},valence:val,fired:true,fragment:o.frag,truth,ledgerId:e.id};
}

/* The full Chönyi passage: 7 peaceful + 7 wrathful visions across the dead PC's Saga (padded to 7
   entities from the faction web / gazetteer if the life was short). Peaceful days precede wrathful. */
function bardoVisions(w,c){
  if(!w||!c)return [];
  let saga=(c.saga&&c.saga.length)?c.saga.slice():computeSaga(w,c);
  if(saga.length<7){ // pad from the standing world so there are always 7 entities to dream of
    const have=new Set(saga.map(s=>s.key));
    (w.factions||[]).forEach(f=>{const k="faction:"+slug(f.name);if(saga.length<7&&!have.has(k)){saga.push({key:k,type:"faction",name:f.name});have.add(k);}});
    (w.gazetteer||[]).forEach(g=>{if(g.type==="Place"||g.type==="Setting"){const k="place:"+slug(g.name);if(saga.length<7&&!have.has(k)){saga.push({key:k,type:"place",name:g.name});have.add(k);}}});
  }
  saga=saga.slice(0,7);
  const visions=[];
  saga.forEach(ent=>{visions.push(rollVision(w,c,ent,"peaceful"));visions.push(rollVision(w,c,ent,"wrathful"));});
  visions.sort((a,b)=>(a.valence===b.valence)?0:(a.valence==="peaceful"?-1:1)); // 7 peaceful, then 7 wrathful
  return visions;
}

/* The orchestrated bardo: refresh the dead PC's Saga (now incl. where they fell), pass the gap
   (time + faction drift), then dream the 7+7 visions over the Saga. Stored on c.visions for the
   successor's passage to surface. The entry point build step 7 (fate.js rework) wires deaths to. */
function runBardo(w,c){
  if(!w||!c)return null;
  refreshSaga(w,c);
  const gap=bardoGap(w);
  const visions=bardoVisions(w,c);
  c.visions=visions;
  return {gap,visions};
}
