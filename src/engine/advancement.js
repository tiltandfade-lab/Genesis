/* GENESIS MODULE — src/engine/advancement.js — the XP economy + leveling spine (docs/ADVANCEMENT.md,
   docs/TIER-SCOPE.md). Classic <script>, shared global scope. Registered in manifest.json; validated by
   check-manifest.py. Reads CLASS_PROGRESSION + CLASSES at call-time; reuses deriveResources/ensureResources
   (engine.resources) for the level-up recompute.

   XP is earned by RESOLVED TENSION (ledger change), priced from events — never narrated (ADVANCEMENT.md).
   It accrues on the living sheet (`sh.xp`); when it crosses a threshold the sheet is flagged; on the next
   REST the mechanical level-up applies (HP / proficiency bonus / spell slots / class pools grow). The
   interpretive picks (new spells, ASI/feat, subclass) are DM-narrated in v1 (the in-app picker is a
   fast-follow). This VERSION caps at Tier 2: `levelForXp` clamps to LEVEL_CEILING — the single un-cap
   point for the future expansion. The engine owns the numbers; the DM only emits typed events. */

const LEVEL_CEILING = 10;      // Tier-2 ceiling. Bump to 20 (with the T3/T4 content) for the expansion.

/* SRD 5.2.1 cumulative XP thresholds — class-independent canon (the same pattern as the canonical
   spell-slot matrices in build/gen-class-progression.py: SRD numbers asserted/used directly, not rolled).
   Indexed by level; XP_THRESHOLDS[L] is the floor for level L. Full L1–20 table present; the ceiling is
   enforced in levelForXp so the expansion un-caps by raising LEVEL_CEILING alone. */
const XP_THRESHOLDS = [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

/* draft award values (ADVANCEMENT.md: "Award values below are draft and will be tuned; the structure is
   the point"). Tuned in playtest. */
const XP_AWARDS = {
  frontClosedPerStakeTier: 50,   // a front's stake = clock size × tier — the meat of the economy
  clockFiredPerTier:       200,  // a faction goal resolved in the PC's favor
  choiceMajor:             100,  // a major choice that forecloses something
  discovery:               1,    // exploration / lazy-history engagement (discovery + fact_canonized) — a rounding error, not a level
  encounterObjectivePerTier: 100 // a fight that advances a tension (only when objectiveRef is set)
};

/* The discovery side-channel is a SMALL trickle, never a level-driver (resolved tension is — see
   ADVANCEMENT.md). It's also the one award the DM can spam, since it fires per narrated fact. So the
   script BOUNDS it: discovery/fact_canonized XP is capped per in-world day; past the ceiling it pays
   $0 no matter how many facts the DM canonizes. Enforced in grantXp (world/dm.js).
   Tuned 2026-06-28 (50→10) after a 19-fact social binge paid 950 XP (→ level 3). Re-tuned 2026-06-30
   (10→1; cap held at 30) — a chatty day now tops out at 30 XP = 1/10 of a single level, so clue-hunting
   and dice-roll wins read as flavour, never advancement (Adam: "should be ~10% of its old value"). The
   DM was ALSO mis-firing milestone events on conversational beats — see DM-CHARTER §8.3b. */
const DISCOVERY_XP_PER_DAY = 30;

/* Standardized SRD 5.2.1 CR→XP — class-independent canon (same canonical-constant-in-code pattern as
   XP_THRESHOLDS). The combat resolver (engine.combat) prices `encounter_resolved` from the real CRs of
   the foes defeated (docs/COMBAT.md, Layer 4). CR 0 → 10 XP (the value the stat blocks print). ⚑ This
   build keeps the objective-gate; un-gating CR-XP into the PRIMARY advancement spine + the milestone-
   economy re-tune is the explicitly-deferred re-tune (COMBAT.md Open questions — don't tune twice). */
const CR_XP = {
  0:10, 0.125:25, 0.25:50, 0.5:100,
  1:200, 2:450, 3:700, 4:1100, 5:1800, 6:2300, 7:2900, 8:3900, 9:5000, 10:5900,
  11:7200, 12:8400, 13:10000, 14:11500, 15:13000, 16:15000, 17:18000, 18:20000, 19:22000, 20:25000,
  21:33000, 22:41000, 23:50000, 24:62000, 25:75000, 26:90000, 27:105000, 28:120000, 29:135000, 30:155000
};
/* the XP a single foe of challenge `cr` is worth (accepts a number or "1/4"-style string; 0 if unknown). */
function crXp(cr){
  if(cr==null || cr==="") return 0;
  let n = (typeof cr==="number") ? cr
        : ({"1/8":0.125,"1/4":0.25,"1/2":0.5})[String(cr).trim()];
  if(n==null) n = parseFloat(cr);
  if(!isFinite(n)) return 0;
  if(CR_XP[n]!=null) return CR_XP[n];
  let best=0;                                   // defensive: fall to the nearest defined CR at or below n
  for(const k of Object.keys(CR_XP).map(Number).sort((a,b)=>a-b)){ if(k<=n) best=CR_XP[k]; }
  return best;
}

function advTier(level){ return (level && level>=5) ? 2 : 1; }   // T1 = 1–4, T2 = 5–10 (the only tiers this version ships)

/* the level a given XP total grants — clamped to LEVEL_CEILING (the cap's PRIMARY enforcement). */
function levelForXp(xp){
  let lvl=1;
  for(let l=2; l<=LEVEL_CEILING; l++){ if((xp||0) >= XP_THRESHOLDS[l]) lvl=l; else break; }
  return lvl;
}
function xpForLevel(level){ const l=Math.max(1,Math.min(20, level|0)); return XP_THRESHOLDS[l]; }
function pbForLevel(level){ return 2 + Math.floor((Math.max(1,level)-1)/4); }

/* has the sheet earned a level it hasn't applied yet? (applied on rest, never mid-play) */
function pendingLevelUp(sh){ return !!sh && levelForXp(sh.xp||0) > (sh.level||1); }

/* the XP an event is worth (0 = doesn't pay). `extra` carries case data the payload lacks (e.g. a
   front's clock size). Combat pays ONLY when tied to an objective (ADVANCEMENT.md anti-grind). */
function xpForEvent(type, p, level, extra){
  p=p||{}; extra=extra||{}; const tier=advTier(level);
  switch(type){
    case "front_closed":   return Math.round((extra.size||6) * tier * XP_AWARDS.frontClosedPerStakeTier);
    case "clock_fired":    return p.forPlayer ? XP_AWARDS.clockFiredPerTier*tier : 0;
    case "choice_logged":  return p.weight==="major" ? XP_AWARDS.choiceMajor : 0;
    case "discovery":
    case "fact_canonized": return XP_AWARDS.discovery;
    case "encounter_resolved": {
      if(!p.objectiveRef) return 0;                       // objective-gated (anti-grind) — interim policy, see CR_XP note
      const foes=Array.isArray(p.foes)?p.foes:[];
      const sum=foes.reduce((s,f)=> s + crXp(f && f.cr), 0);
      return sum || (XP_AWARDS.encounterObjectivePerTier*tier);   // real foe CR-XP, or the flat fallback when foes carry no CR
    }
    default: return 0;
  }
}

/* accrue XP on a sheet. Returns {xp, gained, pending}. Pure mutator on the passed sheet (like resources). */
function awardXp(sh, n){
  if(!sh || !n) return { xp:(sh&&sh.xp)||0, gained:0, pending:!!sh&&pendingLevelUp(sh) };
  sh.xp = (sh.xp||0) + n;
  return { xp:sh.xp, gained:n, pending:pendingLevelUp(sh) };
}

/* the fixed HP a level grants for this sheet's class — SRD "average" (hit die/2 + 1) + CON mod. */
function hpGainPerLevel(sh){
  const hd=(typeof CLASSES!=="undefined" && CLASSES[sh.class] && CLASSES[sh.class].hd) || 8;
  const con=(sh.mods && sh.mods.con) || 0;
  return Math.floor(hd/2) + 1 + con;
}

/* THE RECOMPUTE — apply a level-up to the sheet (clamped to the ceiling). Grows HP / proficiency bonus /
   spell slots / pact / class pools from CLASS_PROGRESSION. Crucial: ensureResources only FILLS MISSING
   fields, so it cannot raise an existing max — this re-derives and GROWS each max by its delta (and tops
   current to the new max, since a level-up coincides with a rest). Interpretive picks are DM-narrated (v1).
   Returns {ok, from, to, hpGain, pb}. */
function applyLevelUp(sh, toLevel){
  if(!sh) return { ok:false, reason:"no-sheet" };
  const from=sh.level||1;
  const to=Math.max(from, Math.min(LEVEL_CEILING, toLevel|0));
  if(to<=from) return { ok:false, from, to:from, reason:"no-op" };
  if(typeof ensureResources==="function") ensureResources(sh);   // make sure the live layer exists at the old level
  const prevHpCur=(sh.hpCur==null ? sh.hp : sh.hpCur);            // current HP before the level-up (sh.hp is still the OLD max)
  let hpGain=0; for(let l=from+1; l<=to; l++) hpGain += hpGainPerLevel(sh);
  sh.level=to;
  sh.hp=(sh.hp||0)+hpGain;
  const L=(typeof progLevel==="function") ? progLevel(sh.class,to) : null;
  sh.profBonus=(L && L.pb) || pbForLevel(to);                     // canonical pb from CLASS_PROGRESSION; formula is the fallback
  if(typeof deriveResources==="function"){
    const d=deriveResources(sh);                                  // maxes at the NEW level (sh.level already bumped)
    if(Array.isArray(sh.slotsMax) && Array.isArray(sh.slots)){
      for(let i=0;i<d.slotsMax.length;i++){ const add=Math.max(0,(d.slotsMax[i]||0)-(sh.slotsMax[i]||0));
        if(add){ sh.slotsMax[i]=(sh.slotsMax[i]||0)+add; sh.slots[i]=(sh.slots[i]||0)+add; } }
    }
    if(d.pact){ if(!sh.pact) sh.pact={cur:d.pact.max,max:d.pact.max,level:d.pact.level};
      else { sh.pact.cur+=Math.max(0,d.pact.max-sh.pact.max); sh.pact.max=d.pact.max; sh.pact.level=d.pact.level; } }
    if(typeof growPools==="function") growPools(sh);   // shared pool-grow (engine.resources) — see luRegrowPools' twin
  }
  sh.hpCur=Math.min(sh.hp, prevHpCur + hpGain);                  // gain the new HP into current — but don't full-heal (a short rest doesn't)
  return { ok:true, from, to, hpGain, pb:sh.profBonus };
}
