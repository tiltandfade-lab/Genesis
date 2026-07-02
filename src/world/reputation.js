/* GENESIS MODULE — src/world/reputation.js — REPUTATION: the world remembers what it SAW
   (docs/REPUTATION.md). Classic <script>, shared global scope. Registered in manifest.json;
   validated by check-manifest.py.

   §0 Adam's forks (LOCKED 2026-07-01):
     Source — witnessed or CLAIMED only. Deeds earn renown when seen by survivors, or when the
       player claims them (claim_deed). Stealth stays anonymous; infamy requires witnesses.
     Decay  — slow fade, legends stick. Ordinary renown drifts toward 0 over in-world months (a
       World-Turn tick); deeds above a magnitude threshold mint PERMANENT epithets.

   Pure ledger math — zero DM invention. The twin of `recall` (world.turn): recall makes the
   world rhyme; reputation makes it remember YOU.

   w.renown = { factions:{slug:{score,epithets:[]}}, regions:{regionId:{score,epithets:[]}} }
   (score float, ±; epithets [{text,deedRef,day}]).

   Reads addLedger/clockOf/slug (world.state), codexWitnessesAt/codexGetAttitude/codexSetAttitude
   (world.codex), regionPeekNode (engine.region), crXp/encounterUnit (engine.advancement),
   nodeInhabited (world.prep) at call-time. */

const RENOWN_FADE   = 0.9;   // §2: per-in-world-month decay multiplier on |score|
const RENOWN_ZERO   = 0.5;   // §2: |score| below this snaps to 0 after a fade tick
const EPITHET_MULT  = 2;     // §2: epithet mints at |delta| >= this × a level-appropriate E(L)-derived unit
                              //     (compared on the RAW XP-scale weight, not the normalized score — see repuApplyDeed)
const RENOWN_STEP   = 2;     // §3: score points per ±1 opening-attitude rung — `score` is stored in
                              //     small renown units (repuApplyDeed normalizes each deed's raw XP-scale
                              //     weight by repuUnit(w)), so ~2 ordinary CR-appropriate deeds = 1 rung
const HUNTED_AT      = -6;   // §3: score <= this marks the PC hunted by that faction — ~6 ordinary
                              //     hostile deeds on the normalized scale, not one

function repuOf(w){
  if(!w.renown) w.renown={ factions:{}, regions:{} };
  if(!w.renown.factions) w.renown.factions={};
  if(!w.renown.regions) w.renown.regions={};
  return w.renown;
}
function repuBucket(store, key){
  if(!key) return null;
  if(!store[key]) store[key]={ score:0, epithets:[] };
  return store[key];
}

/* the epithet-mint magnitude unit — a level-appropriate E(L) (docs §2: "2× a level-appropriate
   E(L) weight"). Reuses engine.advancement's encounterUnit (derived from CR_XP, never a copied
   table); falls back to a flat constant if advancement isn't loaded (never throws). */
function repuUnit(w){
  const t=(typeof livingSheet==="function")?livingSheet(w):null;
  const level=(t&&t.sh&&t.sh.level)||1;
  return (typeof encounterUnit==="function") ? encounterUnit(level) : 200;
}
function repuEpithetMin(w){ return EPITHET_MULT * repuUnit(w); }

/* §1 witness inference (script default): a deed is witnessed iff —
     (a) surviving codex NPCs co-located at the deed's node (codexWitnessesAt), OR
     (b) the node is inhabited (nodeInhabited — ON-DEMAND-GEN §6's shared predicate), OR
     (c) a foe FLED alive this encounter (MONSTER-TACTICS morale-flee marks foe.fled=true on
         GS.combat foes — the fled survivor is the attribution vector).
   `opts.witnessed` (from payload.witnessed) OVERRIDES the inference entirely — the DM adjudicates
   the fiction per-event; the script default only covers the forgetting problem when it's silent. */
function repuWitnessed(w, opts){
  opts=opts||{};
  if(opts.witnessed===true || opts.witnessed===false) return opts.witnessed;
  const at=(opts.at!=null)?opts.at:w.currentNodeId;
  if(typeof codexWitnessesAt==="function"){
    const ws=codexWitnessesAt(w, at, opts.exceptId||null);
    if(ws && ws.length) return true;
  }
  if(typeof nodeInhabited==="function" && nodeInhabited(w, at)) return true;
  const foes=(typeof GS!=="undefined" && GS.combat && GS.combat.foes) || [];
  if(foes.some(f=>f && f.fled)) return true;
  return false;
}

/* resolve a deed's faction attribution key: the deed's OWN faction (positive valence) + every
   OTHER faction (a rival, at half weight, opposite sign — §1 "killing a faction's people = negative
   with them, positive with their rivals at half weight"). No structured rival-pair map exists in
   this codebase (w.factions carries only f.rel, free DM-voice text like "at odds") — every non-
   dominant OTHER faction is treated as a rival proxy for the half-weight valence. Returns
   [{key, sign, mult}] — key is slug(faction.name), sign flips the deed's raw valence for rivals. */
function repuFactionTargets(w, factionKey, sign){
  const out=[];
  const facs=w.factions||[];
  // factionKey arrives as EITHER an already-slugged key OR a raw DM-declared faction name (the SAME
  // shape findClockTarget accepts, e.g. kill's p.factionId) — try slug-match first, then raw-name
  // match, so a caller never has to pre-slug. The final key is ALWAYS the slug (bucket keys stay
  // consistent regardless of which form the caller passed).
  const primary=facs.find(f=>slug(f.name)===factionKey || f.name===factionKey || f===factionKey);
  const primaryKey=primary?slug(primary.name):(factionKey?slug(factionKey):null);
  if(primaryKey) out.push({ key:primaryKey, sign, mult:1 });
  facs.forEach(f=>{
    const k=slug(f.name);
    if(k===primaryKey) return;
    out.push({ key:k, sign:-sign, mult:0.5 });   // rival proxy — see note above
  });
  return out;
}

/* §2 epithet contract: mint a PERMANENT epithet on the PC's record when |delta| >= repuEpithetMin.
   Generated by the DM to a contract (Hungering-Stone §8 pattern: <=4 words, deed-specific, world-
   voiced) — the script only REQUESTS it (dm.needsEpithet, mirroring dm.needsEffectDie's mint-flag/
   codex_update round-trip) and captures the text once the DM supplies it (repuGrantEpithet). Never
   invents the text itself. */
function repuRequestEpithet(w, deedRef){
  w.dm=w.dm||{};
  w.dm.needsEpithet={ deedRef, day:(typeof clockOf==="function")?clockOf(w).day:null };
}
/* capture path for the DM-generated epithet text — mirrors codex_update's {dm:{effectDie}} round
   trip, but the PC carries no codex record, so this writes directly to the living character
   (cur.epithets), the same object dmDigest's `pc` block reads (cur.headline/cur.conditions
   precedent). Never fades (§2 "epithets never fade; they ride Distant Word"). */
function repuGrantEpithet(w, text){
  if(!text) return null;
  const t=(typeof livingSheet==="function")?livingSheet(w):null; if(!t) return null;
  t.c.epithets=t.c.epithets||[];
  const req=(w.dm&&w.dm.needsEpithet)||{};
  const rec={ text:String(text).trim(), deedRef:req.deedRef||null, day:(typeof clockOf==="function")?clockOf(w).day:req.day||null };
  t.c.epithets.push(rec);
  if(w.dm) w.dm.needsEpithet=null;
  if(typeof addLedger==="function") addLedger(w,"canon",{kind:"epithet",text:rec.text,deedRef:rec.deedRef},
    "◆ "+t.c.name+" is now known as “"+rec.text+"”.");
  return rec;
}

/* §1/§4 THE DEED HOOK — price + apply a witnessed-or-claimed deed's renown. `opts`:
     weight      — the deed's raw magnitude (XP-unit scale; caller derives per event kind)
     factionKey  — slug or faction object the deed targets (null = region-only / untracked)
     regionId    — a region record's `key` (engine.region) the deed's node resolves to
     witnessed   — explicit override (bypasses repuWitnessed's inference)
     at          — the node the deed happened at (defaults w.currentNodeId)
     claimed     — true when this call rides claim_deed (renown applies regardless of witness)
     source      — ledger provenance tag
   Returns {applied:boolean, reason?, factions:[{key,delta,to}], region:{id,delta,to}|null,
            epithetRequested:boolean}. NEVER applies anything for an unwitnessed, unclaimed deed —
   this is the load-bearing gate (BATCH2-GUARDRAILS H1's mutation check targets exactly this).

   SCALE RECONCILIATION (fixing the §1-vs-§3 conflict a review caught): `weight` arrives on the
   crXp/E(L) XP-unit scale (hundreds+), but the §3 consumer thresholds (RENOWN_STEP, HUNTED_AT)
   and the §3 standing-word bands are authored on a small-integer "renown unit" scale (a
   CR-appropriate deed should read as roughly ±1 renown unit). `score` is stored in THAT small
   unit — every weight is divided by `repuUnit(w)` (the same level-appropriate E(L) the epithet
   threshold already uses) before it touches a bucket, so one ordinary CR-appropriate deed no
   longer saturates every consumer at once. The epithet check stays on the RAW XP-scale (`mag`
   vs `repuEpithetMin`, both un-normalized) since that threshold was already internally
   consistent on that scale. */
function repuApplyDeed(w, opts){
  opts=opts||{};
  const out={ applied:false, factions:[], region:null, epithetRequested:false };
  if(!opts.claimed && !repuWitnessed(w, opts)) return out;
  const R=repuOf(w);
  const weight=(typeof opts.weight==="number")?opts.weight:0;
  if(!weight) return out;
  const sign=weight>0?1:-1;
  const mag=Math.abs(weight);
  const unit=repuUnit(w)||1;
  const scoreMag=mag/unit;   // normalize XP-scale magnitude into the small renown-score unit

  if(opts.factionKey){
    repuFactionTargets(w, opts.factionKey, sign).forEach(t=>{
      const b=repuBucket(R.factions, t.key); if(!b) return;
      const delta=t.sign*scoreMag*t.mult;
      b.score += delta;
      out.factions.push({ key:t.key, delta, to:b.score });
    });
  }
  if(opts.regionId){
    const b=repuBucket(R.regions, opts.regionId);
    if(b){ const delta=sign*scoreMag; b.score+=delta; out.region={ id:opts.regionId, delta, to:b.score }; }
  }
  out.applied = out.factions.length>0 || !!out.region;
  if(!out.applied) return out;

  const min=repuEpithetMin(w);
  if(mag>=min){
    repuRequestEpithet(w, opts.deedRef||opts.source||null);
    out.epithetRequested=true;
  }
  if(typeof addLedger==="function" && out.applied){
    addLedger(w,"outcome",{kind:"renown",weight,claimed:!!opts.claimed,factions:out.factions,region:out.region,source:opts.source||"detected"},
      "✦ The tale spreads"+(opts.claimed?" — claimed":"")+".");
  }
  return out;
}

/* §2 the CLAIM verb: the player announces authorship of an UNWITNESSED deed. Applies renown from
   THIS day (not retroactive to the deed's original day — the deed only starts counting once the
   world hears it), and marks the deed Distant-Word-eligible (the ledger entry itself, tagged
   claimed:true, is the fodder — no separate store). `ledgerRef` is informational (the deed the
   player is claiming authorship of); the actual weight/targets ride the SAME payload shape as any
   other deed (weight/factionKey/regionId) since the script has no independent memory of the
   original unwitnessed deed's magnitude beyond what the caller re-supplies. */
function repuClaimDeed(w, opts){
  opts=Object.assign({}, opts||{}, { claimed:true, witnessed:true });
  return repuApplyDeed(w, opts);
}

/* §2 fade tick — called from worldTurn's montage trigger (T1). Every faction/region score drifts
   toward 0 by RENOWN_FADE per elapsed in-world month; |score| < RENOWN_ZERO snaps to 0. Epithets
   are UNTOUCHED (permanent — §2 "epithets never fade"). monthsElapsed defaults to 1 (one montage
   tick = roughly one long-elapse step; the caller may pass a larger span). */
function repuFadeTick(w, monthsElapsed){
  const R=repuOf(w);
  const months=Math.max(0, monthsElapsed==null?1:monthsElapsed);
  if(!months) return { faded:0 };
  const factor=Math.pow(RENOWN_FADE, months);
  let n=0;
  [R.factions, R.regions].forEach(store=>{
    Object.keys(store).forEach(k=>{
      const b=store[k];
      const before=b.score;
      b.score *= factor;
      if(Math.abs(b.score)<RENOWN_ZERO) b.score=0;
      if(b.score!==before) n++;
    });
  });
  return { faded:n };
}

/* §3 consumer: faction members' OPENING attitude shift — feeds codexGetAttitude's lazy init (the
   parley system prices the rest). Caps at +-2 (a full attitude rung swing either way), stepped by
   RENOWN_STEP score points per rung. Pure read — never writes attitude itself (the caller/opening
   path does that, same as any other opening bias). */
function repuOpeningAttitudeShift(w, factionKey){
  const R=repuOf(w);
  const b=(factionKey && R.factions[factionKey])||null;
  if(!b) return 0;
  const raw=Math.sign(b.score)*Math.min(2, Math.floor(Math.abs(b.score)/RENOWN_STEP));
  return raw;
}

/* §3 consumer: hunted flag — score <= HUNTED_AT marks the PC hunted by that faction (biases
   WORLD-TURN's rim-bearing pressure machinery toward the PC's location, pointed inward — the
   actual bearing math lives in engine.region/world-gen; this is the pure predicate read). */
function repuHunted(w, factionKey){
  const R=repuOf(w);
  const b=(factionKey && R.factions[factionKey])||null;
  return !!(b && b.score<=HUNTED_AT);
}
/* every faction currently hunting the PC (score <= HUNTED_AT) — the WORLD-TURN consumer walks
   this list to bias pressure bearings toward the PC (§3). */
function repuHuntedBy(w){
  const R=repuOf(w);
  return Object.keys(R.factions).filter(k=>R.factions[k].score<=HUNTED_AT);
}

/* §3 player surface: a coarse standing WORD per faction — never the raw number (the score is
   dm-only). hated/wary/neutral/known/honored, five bands over the same +-N scale RENOWN_STEP
   steps attitude by (so "honored" ~= Helpful-equivalent magnitude). Returns null for an
   unestablished (never-touched) faction — the caller only renders revealed factions anyway. */
const RENOWN_WORDS=["hated","wary","neutral","known","honored"];
function repuStandingWord(w, factionKey){
  const R=repuOf(w);
  const b=(factionKey && R.factions[factionKey])||null;
  if(!b) return null;
  const rung=Math.sign(b.score)*Math.min(2, Math.floor(Math.abs(b.score)/RENOWN_STEP));
  return RENOWN_WORDS[rung+2];
}

/* §3 player surface: claimed/witnessed epithets on the living PC — the sheet reads this list
   directly (cur.epithets, written by repuGrantEpithet). Thin accessor for render call sites. */
function repuEpithetsOf(w){
  const t=(typeof livingSheet==="function")?livingSheet(w):null;
  return (t && t.c.epithets) || [];
}

/* §3 consumer helper: which faction (slug key) an NPC codex record belongs to, via the existing
   member-of/serves/leads link vocabulary (codex.js §8b) — first match wins (an NPC serving two
   factions is a DM-voice nuance this pure read doesn't adjudicate). Returns null if unlinked or
   codex/links unavailable (never throws — the opening-attitude call site degrades to no bias). */
function repuFactionOf(w, npcId){
  if(typeof codexLinksOf!=="function" || !npcId) return null;
  const rels=["member-of","serves","leads"];
  const links=codexLinksOf(w, npcId) || [];
  const hit=links.find(l=>l.dir==="out" && rels.includes(l.rel) && String(l.to||"").indexOf("faction:")===0);
  return hit ? hit.to.slice("faction:".length) : null;
}
