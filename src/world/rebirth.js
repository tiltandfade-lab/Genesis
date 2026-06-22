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
