/* GENESIS MODULE — src/engine/resources.js — the LIVE CONSUMABLE RESOURCE ECONOMY (deterministic).
   Specs: docs/EVENT-CONTRACT.md (the resource events) + docs/ADVANCEMENT.md (CLASS_PROGRESSION is the
   max source). Established 2026-06-24.

   The character sheet ships only STATIC maxes from the creator (hp, ac, slot/resource scalers).
   This module adds the CURRENT (spent-down) layer the DM Bridge needs to track a real economy:
   current HP, spell slots per level, pact slots, and per-class pools (Rage, Bardic Inspiration,
   Channel Divinity, Focus/Ki, Sorcery Points, Action Surge). Maxes are DERIVED from CLASS_PROGRESSION
   (anti-drift: never hand-entered) — current is stored on the sheet and mutated only through here.

   Ownership: the ENGINE owns the numbers (deterministic mechanical work); the DM only emits typed
   events (applyEvent in src/world/dm.js dispatches here). Rest recovery rides passTime (src/world/play.js).
   Classic <script>, shared global scope. Reads CLASS_PROGRESSION at call-time. */

/* The CONSUMABLE class pools (spent in play, restored on rest) and how each recovers:
     "long"  — full only on a Long Rest
     "short" — full on a Short OR Long Rest
     "rage"  — regain 1 on a Short Rest, all on a Long Rest (2024 Barbarian)
   `key` is the CLASS_PROGRESSION level-entry field; bardicInspiration is special-cased (the
   progression carries only the die size, so its count = max(1, CHA modifier)). */
const RESOURCE_POOLS={
  rages:            {label:"Rage",               recover:"rage"},
  bardicInspiration:{label:"Bardic Inspiration", recover:"long"},
  channelDivinity:  {label:"Channel Divinity",   recover:"short"},
  focusPoints:      {label:"Focus",              recover:"short"},
  sorceryPoints:    {label:"Sorcery Points",     recover:"long"},
  actionSurge:      {label:"Action Surge",       recover:"short"},
};

/* Friendly aliases the DM may use for a pool key in a resource_spent event. */
const RESOURCE_ALIASES={
  rage:"rages", rages:"rages",
  bardic:"bardicInspiration", bardicinspiration:"bardicInspiration", inspiration:"bardicInspiration",
  channeldivinity:"channelDivinity", channel:"channelDivinity",
  ki:"focusPoints", focus:"focusPoints", focuspoints:"focusPoints",
  sorcerypoints:"sorceryPoints", sorcery:"sorceryPoints",
  actionsurge:"actionSurge",
};
function resourceKey(k){const s=String(k||"").toLowerCase().replace(/[\s_-]/g,"");return RESOURCE_ALIASES[s]||(RESOURCE_POOLS[k]?k:s);}

/* The CLASS_PROGRESSION level entry for this sheet (falls back to L1, then null). */
function progLevel(cls,level){
  const C=(typeof CLASS_PROGRESSION!=="undefined")&&CLASS_PROGRESSION[cls];
  if(!C||!C.levels)return null;
  return C.levels[String(level||1)]||C.levels["1"]||null;
}

/* Derive the MAX side of the economy from CLASS_PROGRESSION for a given sheet:
     { slotsMax:[9], pact:{max,level}|null, pools:{ key:{max,die?} } }   */
function deriveResources(sh){
  const out={slotsMax:[0,0,0,0,0,0,0,0,0],pact:null,pools:{}};
  if(!sh)return out;
  const L=progLevel(sh.class,sh.level||1);if(!L)return out;
  const md=sh.mods||{};
  if(Array.isArray(L.slots))for(let i=0;i<L.slots.length&&i<9;i++)out.slotsMax[i]=L.slots[i]||0;
  if(L.pactSlots)out.pact={max:L.pactSlots,level:L.pactSlotLevel||1};
  for(const key in RESOURCE_POOLS){
    if(key==="bardicInspiration")continue;
    if(typeof L[key]==="number"&&L[key]>0)out.pools[key]={max:L[key]};
  }
  if(L.bardicInspirationDie)out.pools.bardicInspiration={max:Math.max(1,md.cha||0),die:L.bardicInspirationDie};
  return out;
}

/* Lazy, idempotent initialiser — fills CURRENT=MAX wherever the live fields are absent, leaving any
   already-spent values untouched. Safe to call on every read (digest/render) AND on migrate; it only
   writes when a field is missing (so existing saves — e.g. Pendleton in localStorage — heal in lazily
   at full, never resetting a spent slot). Returns true if it changed the sheet (callers may persist). */
function ensureResources(sh){
  if(!sh)return false;
  const d=deriveResources(sh);let changed=false;
  if(sh.level==null){sh.level=1;changed=true;}   // advancement migration: pre-leveling saves heal to L1 / 0 XP
  if(sh.xp==null){sh.xp=0;changed=true;}
  if(sh.choicesLevel==null){sh.choicesLevel=sh.level;changed=true;}   // interpretive-picks marker: seed = current level (no retroactive demand on legacy/new sheets) — docs/ADVANCEMENT.md

  if(sh.hpCur==null){sh.hpCur=sh.hp;changed=true;}
  if(!Array.isArray(sh.slotsMax)){sh.slotsMax=d.slotsMax.slice();changed=true;}
  if(!Array.isArray(sh.slots)){sh.slots=d.slotsMax.slice();changed=true;}
  if(d.pact){if(!sh.pact){sh.pact={cur:d.pact.max,max:d.pact.max,level:d.pact.level};changed=true;}}
  if(!sh.pools){sh.pools={};changed=true;}
  for(const key in d.pools){
    if(!sh.pools[key]){sh.pools[key]={cur:d.pools[key].max,max:d.pools[key].max};if(d.pools[key].die)sh.pools[key].die=d.pools[key].die;changed=true;}
  }
  return changed;
}

/* Grow each derived class pool's MAX to the level's value, carrying the positive delta into current
   (and creating any missing pool at full). Shared by applyLevelUp (a level grows the pools) and the
   level-up choice picker's ASI step (a casting-stat bump raises a derived max, e.g. Bardic Inspiration
   = max(1,CHA)). Like the slot/pact growth, it only ever raises — never shrinks a spent pool. */
function growPools(sh){
  if(!sh)return;
  const d=deriveResources(sh);sh.pools=sh.pools||{};
  for(const k in d.pools){const dm=d.pools[k];
    if(!sh.pools[k]){sh.pools[k]={cur:dm.max,max:dm.max};if(dm.die)sh.pools[k].die=dm.die;}
    else{sh.pools[k].cur+=Math.max(0,dm.max-sh.pools[k].max);sh.pools[k].max=dm.max;if(dm.die)sh.pools[k].die=dm.die;}}
}

/* ---------- mutators (the only writers of the current layer) ---------- */

function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,n));}

/* Damage/heal. delta<0 = damage, delta>0 = heal. Clamps to [0, max HP]. Returns {from,to,max,dropped}. */
function applyHpDelta(sh,delta){
  ensureResources(sh);
  const max=sh.hp||0,from=(sh.hpCur==null?max:sh.hpCur);
  const to=clamp(from+(delta||0),0,max);
  sh.hpCur=to;
  return {from,to,max,delta:delta||0,dropped:to===0&&from>0};
}

/* Spend one spell slot of `level` (1-9). Prefers a true Vancian slot; falls back to the warlock's
   Pact slot when it matches the pact level. Returns {ok, kind, level, remaining} (ok:false if none). */
function spendSlot(sh,level){
  ensureResources(sh);
  const lv=clamp(parseInt(level,10)||1,1,9),idx=lv-1;
  if(Array.isArray(sh.slots)&&sh.slots[idx]>0){sh.slots[idx]-=1;return {ok:true,kind:"slot",level:lv,remaining:sh.slots[idx],max:(sh.slotsMax||[])[idx]||0};}
  if(sh.pact&&sh.pact.cur>0&&(sh.pact.level===lv||lv<=sh.pact.level)){sh.pact.cur-=1;return {ok:true,kind:"pact",level:sh.pact.level,remaining:sh.pact.cur,max:sh.pact.max};}
  return {ok:false,reason:"no-slot",level:lv};
}

/* Spend N from a class pool (rage / sorceryPoints / channelDivinity / …). Clamps at 0.
   Returns {ok, key, label, spent, remaining, max} (ok:false if the sheet has no such pool). */
function spendResource(sh,key,n){
  ensureResources(sh);
  const k=resourceKey(key),pool=sh.pools&&sh.pools[k];
  if(!pool)return {ok:false,reason:"no-pool",key:k};
  const want=Math.max(1,parseInt(n,10)||1),spent=Math.min(want,pool.cur);
  pool.cur=clamp(pool.cur-want,0,pool.max);
  return {ok:true,key:k,label:(RESOURCE_POOLS[k]||{}).label||k,spent,remaining:pool.cur,max:pool.max};
}

/* Rest recovery. kind="long" → full reset (HP, all slots, pact, every pool). kind="short" → pact
   slots + short-rest pools (Channel Divinity, Focus, Action Surge) + 1 Rage; HP/Vancian slots and
   long-rest pools (Bardic Inspiration, Sorcery Points) are unchanged (SRD: short-rest HP is the
   player spending Hit Dice — left to an explicit hp_changed). Returns a short summary string. */
function restRecover(sh,kind){
  ensureResources(sh);
  const long=kind==="long";
  const parts=[];
  if(long&&sh.hpCur!==sh.hp){sh.hpCur=sh.hp;parts.push("HP full");}
  if(long&&Array.isArray(sh.slots)&&Array.isArray(sh.slotsMax)){
    const had=sh.slots.some((v,i)=>v<(sh.slotsMax[i]||0));
    sh.slots=sh.slotsMax.slice();if(had)parts.push("spell slots");
  }
  if(sh.pact&&sh.pact.cur<sh.pact.max){sh.pact.cur=sh.pact.max;parts.push("pact slots");}
  for(const k in (sh.pools||{})){
    const pool=sh.pools[k],def=RESOURCE_POOLS[k]||{};
    if(pool.cur>=pool.max)continue;
    if(long){pool.cur=pool.max;parts.push((def.label||k));}
    else if(def.recover==="short"){pool.cur=pool.max;parts.push((def.label||k));}
    else if(def.recover==="rage"){if(pool.cur<pool.max){pool.cur=Math.min(pool.max,pool.cur+1);parts.push((def.label||k)+" +1");}}
  }
  return parts.length?parts.join(", "):"nothing to restore";
}

/* ---------- read-side views (digest + UI) ---------- */

/* Compact live-economy snapshot for dmDigest — only what's non-trivial (nonzero maxes). */
function resourceDigest(sh){
  if(!sh)return null;
  ensureResources(sh);
  const out={hp:{cur:sh.hpCur,max:sh.hp}};
  const slots={};(sh.slotsMax||[]).forEach((m,i)=>{if(m>0)slots[i+1]=(sh.slots[i]||0)+"/"+m;});
  if(Object.keys(slots).length)out.slots=slots;
  if(sh.pact)out.pactSlots=sh.pact.cur+"/"+sh.pact.max+" (level "+sh.pact.level+")";
  const pools={};for(const k in (sh.pools||{})){const p=sh.pools[k],lab=(RESOURCE_POOLS[k]||{}).label||k;pools[lab]=p.cur+"/"+p.max+(p.die?(" ("+p.die+")"):"");}
  if(Object.keys(pools).length)out.pools=pools;
  return out;
}
