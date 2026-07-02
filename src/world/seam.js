/* GENESIS MODULE — src/world/seam.js — the SESSION SEAM: carry-forward harvest + the session-shape
   pacing model (docs/CONSEQUENCE-LADDER.md §7.1–§7.2). Classic <script>, shared global scope.
   Registered in manifest.json; validated by build/check-manifest.py.

   The session boundary is the PROMOTION TICK. endSession HARVESTS a carry-forward (open handles +
   interaction-salience + front/faction clocks + last shape); startSession prep WEAVES it
   (trivialize / sustain / escalate) — subordinate to the proposed next-session SHAPE.

   The pacing model is the scaffold the AI exercises taste within (§7.2): the escalate decision is
   EDITORIAL (what should next session feel like — "to be continued"), not a threshold. The engine
   PROPOSES a ranked shape from honest heuristics (contrast the last shape · pay off salience · fire
   near clocks · keep it deadly); the DM makes the final pick, captured. The player never sees it.

   seamHarvest reads `w` (returns a fresh object, never mutates); seamProposeShape / seamWeave are PURE
   on the carry-forward. All internals `seam`/`SESSION_`-prefixed. v1 heuristics — tune in play. */

/* §7.2 — the episode types the next session is shaped toward. */
const SESSION_SHAPES = [
  { id:"battle",   label:"Battle",                 mode:"combat",  intensity:3 },
  { id:"conflict", label:"Conflict / Intrigue",    mode:"social",  intensity:2 },
  { id:"boon",     label:"Boon / Triumph",         mode:"reward",  intensity:1 },
  { id:"rest",     label:"Rest / Downtime",        mode:"rest",    intensity:0 },
  { id:"mystery",  label:"Mystery / Revelation",   mode:"mystery", intensity:2 },
  { id:"turn",     label:"Turn (campaign-shaper)", mode:"turn",    intensity:4 },
];

/* which shape an open thread of a given archetype/kind most wants to be paid off as. */
const SEAM_KIND_TO_SHAPE = {
  watcher:"mystery", passage:"mystery", oracle:"boon", omen:"conflict",
  predation:"battle", containment:"turn", identity:"conflict",
};

/* §7.1 — salience from LOGGED INTERACTION, not AI inference: did the player engage the handle?
   (locked to canon / known / examined / rolled its effect die). Defensive on absent flags. */
function seamSalienceOf(e){
  if(!e) return 0;
  const st = (e.status && typeof e.status === "object") ? e.status : {};
  let s = 0;
  if(e.hard || e.locked || st.hard || st.soft === false) s += 2;   // locked to canon (no longer soft) = engaged
  if(e.known || st.known) s += 1;
  if(e.examined || st.examined || (e.interactions|0) > 0) s += 2;  // explicit interaction (wired as logging grows)
  if(e.effectRolled || st.effectRolled) s += 2;                    // rolled its effect die — strong engagement
  return s;
}

/* clock proximity 0..1 (how near a thread/front is to firing). */
function seamProximity(it){
  if(!it) return 0;
  if(it.size > 0)     return Math.max(0, Math.min(1, (it.filled||0) / it.size));
  if(it.clockMax > 0) return Math.max(0, Math.min(1, (it.clock||0)  / it.clockMax));
  return 0;
}

/* §7.1 — HARVEST: read the world, return a fresh carry-forward. Reads consequence handles off the
   codex (legs/pool tags — populated as the wiring lands) + the live faction/pressure clocks. */
function seamHarvest(w){
  w = w || {};
  const records = (w.codex && w.codex.records) ? Object.keys(w.codex.records).map(k=>w.codex.records[k]) : [];
  // consequence tags live top-level (future) OR in `dm` (codexAdd preserves dm, drops unknown top-level fields).
  const legsOf = (e)=> e.legs || (e.dm && e.dm.legs) || "";
  const poolOf = (e)=> e.pool || e.archetype || (e.dm && e.dm.pool) || "";
  const openThreads = records
    .filter(e => { const l = legsOf(e); return e && (l==="hook" || l==="thread-seed") && !e.resolved; })
    .map(e => ({ id:e.id, kind:String(poolOf(e)), legs:legsOf(e),
                 salience:seamSalienceOf(e), clock:(e.clock&&e.clock.val)||0, clockMax:(e.clock&&e.clock.max)||0 }));
  const fronts = []
    .concat((w.factions  || []).map(f => ({ id:f.id || ("faction:"+(f.name||"")), label:f.name, kind:f.dominant?"faction-dominant":"faction",
              filled:(f.clock&&f.clock.filled)||0, size:(f.clock&&f.clock.size)||0, salience:0 })))
    .concat((w.pressures || []).map(p => ({ id:p.id || ("front:"+(p.kind||p.danger||"")), label:p.danger||p.kind, kind:String(p.kind||"front"),
              filled:(p.clock&&p.clock.filled)||0, size:(p.clock&&p.clock.size)||0, salience:0 })));
  return {
    session: w.session || 0,
    lastShape: (w.carryForward && w.carryForward.nextShape) || null,  // what this session was shaped toward
    openThreads, fronts,
    walkProvenance: walkProvenanceReport(w),                          // WALK-CONSUMPTION (Step C): which walks actually ran
    sessionProvenance: sessionProvenanceReport(w, records),           // ON-DEMAND-GEN §8: rolled-vs-freehand THIS session
    xpReport: xpReportOf(w),                                          // ADVANCEMENT-RETUNE.md §4: the tuning instrument
  };
}

/* ADVANCEMENT-RETUNE.md §4 — the tuning instrument: {total, bySource:{combat%,milestone%,front%},
   decayLost, paceThisLevel, paceTarget}. Reads THIS session's XP ledger lines (addLedger stamps every
   entry with `session:w.session`) + w.xpDecay.lost (the decay guard's running tax, reset at
   beginSession alongside the counters it shares the object with). Percentages are rounded but always
   SUM to 100 (the remainder folds into the largest bucket) — never invented, always read off real
   ledger data; an XP-less session reports zeros, not NaN. */
const XP_REASON_BUCKET = {
  encounter_resolved:"combat",
  front_closed:"front", clock_fired:"front",
  discovery:"milestone", fact_canonized:"milestone", choice_logged:"milestone",
};
function xpReportOf(w){
  w = w || {};
  const session = w.session || 0;
  const lines = (w.ledger||[]).filter(e => e && e.type==="outcome" && e.data && e.data.kind==="xp" && (e.session||0)===session);
  const raw = { combat:0, milestone:0, front:0 };
  let total = 0;
  lines.forEach(e => {
    const amt = e.data.amount||0; total += amt;
    const bucket = XP_REASON_BUCKET[e.data.reason] || "milestone";
    raw[bucket] += amt;
  });
  const bySource = {};
  if(total > 0){
    const keys = Object.keys(raw);
    let assigned = 0, biggest = keys[0];
    keys.forEach(k => { if(raw[k] > raw[biggest]) biggest = k; });
    keys.forEach(k => {
      if(k === biggest) return;
      const pct = Math.round((raw[k]/total)*100);
      bySource[k+"%"] = pct; assigned += pct;
    });
    bySource[biggest+"%"] = 100 - assigned;                            // remainder folds into the largest bucket — guarantees a 100 sum
  } else {
    bySource.combat = 0; bySource.milestone = 0; bySource.front = 0;   // no XP-suffixed keys when there's nothing to report — zeros, not NaN
  }
  // pace: sessions spent at the sheet's CURRENT level. Walk backward from the last `level` ledger line
  // (level_applied's recompute) for the living PC; no level-up yet → pace counts from session 1.
  const t = (typeof livingSheet==="function") ? livingSheet(w) : null;
  const lastLevelUp = (w.ledger||[]).filter(e => e && e.type==="outcome" && e.data && e.data.kind==="level").slice(-1)[0];
  const paceThisLevel = Math.max(1, session - (lastLevelUp ? (lastLevelUp.session||0) : 0));
  const level = t ? (t.sh.level||1) : 1;
  const paceTarget = (typeof XP_TUNE!=="undefined" && XP_TUNE.paceCurve && XP_TUNE.paceCurve[String(level)]) || null;
  return {
    total,
    bySource,
    decayLost: (w.xpDecay && w.xpDecay.lost) || 0,
    paceThisLevel,
    paceTarget,
  };
}

/* ON-DEMAND-GEN §8 — the session provenance slice: records minted THIS session (record.seq beyond the
   watermark startPrep captures at w.dm.sessionSeqWatermark) bucketed by provenance — mechanical
   (rolled/prep/recontextualized) vs invented (declared/authored, incl. a freehand codex_add) — plus the
   ratio. The instrument that answers "is the rolled path actually primary" for THIS session specifically
   (codexProvenanceReport, by contrast, is the whole-world lifetime figure). */
const SEAM_MECH_PROV = ["rolled","prep","recontextualized"];
function sessionProvenanceReport(w, records){
  const watermark=(w.dm && w.dm.sessionSeqWatermark)||0;
  const thisSession=(records||[]).filter(r=>typeof r.seq==="number" && r.seq>watermark);
  const byProvenance={}; let mech=0;
  thisSession.forEach(r=>{
    byProvenance[r.provenance]=(byProvenance[r.provenance]||0)+1;
    if(SEAM_MECH_PROV.indexOf(r.provenance)>=0) mech++;
  });
  const total=thisSession.length;
  return { total, mechanical:mech, invented:total-mech,
    ratio: total? +(mech/total).toFixed(3) : 0,
    byProvenance };
}

/* §7.2 — PROPOSE the next-session LEAN (a soft prior, NOT a pick). The DM leans into it ONLY in a lull;
   the override hierarchy player→situation→lean is absolute, and the DM may ignore it entirely (the digest
   states this). `cf.pref` = the player's revealed preference (a shape they gravitate to) — it dominates,
   dampening the contrast nudge so no variety is forced on someone who wants the same beat. Returns
   {shape (=the top lean), reason, ranked (the full distribution), lean:true}. */
function seamProposeShape(cf){
  cf = cf || {};
  const last    = cf.lastShape || null;
  const pref    = cf.pref || null;                                             // 0) revealed preference
  const fronts  = cf.fronts || [];
  const threads = cf.openThreads || [];
  const hotFront  = fronts.find(f => seamProximity(f) >= 0.66);                 // a clock near firing
  const topThread = threads.slice().sort((a,b)=>(b.salience||0)-(a.salience||0))[0];
  const score = {};
  SESSION_SHAPES.forEach(s => { score[s.id] = 1; });                            // base
  if (pref && score[pref] != null) score[pref] += 2;                            // 0) preference dominates
  if (last && score[last] != null && last !== pref) score[last] -= 1;           // 1) GENTLE contrast, yields to pref
  if (hotFront) { score.turn += 2; score.battle += 1.5; score.conflict += 1; }  // 3) fire near clocks → decisive
  if (topThread && (topThread.salience||0) >= 2) {                              // 2) pay off the player's investment
    const m = SEAM_KIND_TO_SHAPE[(topThread.kind||"").toLowerCase()] || "mystery";
    score[m] = (score[m]||0) + 2;
  }
  if (!hotFront && !(topThread && (topThread.salience||0) >= 2) && !pref) {     // nothing hot, no pref → a breather
    score.rest += 1; score.mystery += 1;
  }
  const ranked = SESSION_SHAPES.map(s => ({ id:s.id, label:s.label, score:score[s.id] }))
                               .sort((a,b)=> b.score - a.score);
  const chosen = ranked[0].id;
  let reason = "variety";
  if (pref && chosen === pref) reason = "the player's revealed preference ("+pref+")";
  else if (hotFront && (chosen==="turn"||chosen==="battle"||chosen==="conflict")) reason = "a clock is near firing ("+hotFront.label+")";
  else if (topThread && (topThread.salience||0) >= 2) reason = "pay off the player's investment ("+(topThread.id||topThread.kind)+")";
  else if (last) reason = "contrast the last shape ("+last+")";
  return { shape:chosen, reason, ranked, lean:true };
}

/* WALK-CONSUMPTION (docs/WALK-CONSUMPTION.md, Step C) — the anti-drift ratio for walks: how many of the
   rolled walks/segments the DM actually RAN this session. Mirrors codexProvenanceReport (the codex's
   mechanical-vs-invented test). Reads the per-walk log maintained by walkSetActive/walkAdvance/walkComplete
   on w.prep. This is the instrument that proves the digest's active-walk is being consumed, not freehanded.
   TRAVEL-WALKS (docs/TRAVEL-WALKS.md §1 step 7 / §3 step 5): travel walks count under their OWN `travel`
   bucket (they're not part of the session-prep bundle, so `planned`/`walked`/`consumption` above stay
   frontier-only — unchanged shape/values for existing callers/regression). */
function walkProvenanceReport(w){
  w=w||{};
  const P=(w.prep)||{}, log=Array.isArray(P.walkLog)?P.walkLog:[];
  const frontierLog=log.filter(l=>l.kind!=="travel"), travelLog=log.filter(l=>l.kind==="travel");
  const planned=(P.bundle&&P.bundle.environments)?P.bundle.environments.length:0;
  const walked=frontierLog.length;
  const segs=frontierLog.reduce((a,l)=>({ touched:a.touched+((l.touched||[]).length), total:a.total+(l.segCount||0) }), {touched:0,total:0});
  const travelSegs=travelLog.reduce((a,l)=>({ touched:a.touched+((l.touched||[]).length), total:a.total+(l.segCount||0) }), {touched:0,total:0});
  return {
    session:P.session||0,
    planned, walked,                                                   // e.g. 3 rolled, 1 actually walked
    finales:frontierLog.filter(l=>l.finaleReached).length,
    segmentsTouched:segs.touched, segmentsRolled:segs.total,
    consumption: segs.total ? Math.round((segs.touched/segs.total)*100)/100 : 0,   // 0..1 — the headline ratio
    walks: frontierLog.map(l=>({ env:l.env, topology:l.topology, ran:`${(l.touched||[]).length}/${l.segCount}`, finale:!!l.finaleReached })),
    travel: {
      count: travelLog.length,
      arrivals: travelLog.filter(l=>l.finaleReached).length,
      segmentsTouched: travelSegs.touched, segmentsRolled: travelSegs.total,
      consumption: travelSegs.total ? Math.round((travelSegs.touched/travelSegs.total)*100)/100 : 0,
      trips: travelLog.map(l=>({ ran:`${(l.touched||[]).length}/${l.segCount}`, arrived:!!l.finaleReached })),
    },
  };
}

/* does the chosen shape want this item's kind escalated now? */
function seamShapeFavors(shapeId, it){
  if (shapeId==="turn" || shapeId==="battle") return true;       // decisive shapes escalate broadly
  return SEAM_KIND_TO_SHAPE[String(it.kind||"").toLowerCase()] === shapeId;
}

/* §7.1 — WEAVE: classify each open thread/front for the next session, subordinate to the shape.
   PURE. Returns a plan [{id, decision: trivialize|sustain|escalate, reason}]. The AI executes the
   texture (bind-first → invent-and-capture); this owns the decision. */
function seamWeave(cf, shapeId){
  cf = cf || {};
  const plan = [];
  const items = [].concat(cf.openThreads || [], cf.fronts || []);
  for (const it of items){
    const prox = seamProximity(it), sal = it.salience || 0;
    let decision = "sustain", reason = "carried forward";
    if (prox >= 0.66) { decision = "escalate"; reason = "clock near firing"; }
    else if (sal >= 2 && seamShapeFavors(shapeId, it)) { decision = "escalate"; reason = "player invested + fits the "+shapeId+" shape"; }
    else if (sal <= 0 && prox < 0.34) { decision = "trivialize"; reason = "untouched + clock cold"; }
    plan.push({ id:it.id, decision, reason });
  }
  return plan;
}
