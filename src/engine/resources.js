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
  // HQ3-C1 — Hit-Dice pool: max = character level, die size from the class table (fallback: parse
  // sh.hitDie, else 8). Computed BEFORE the CLASS_PROGRESSION lookup below so it's present even for a
  // class the progression table doesn't know — hit dice are level/class-table derived, not progression-gated.
  const hdDie = (typeof CLASSES!=="undefined" && CLASSES[sh.class] && CLASSES[sh.class].hd)
    || (sh.hitDie ? (parseInt(String(sh.hitDie).replace(/\D/g,""),10)||8) : 8);
  out.hitDiceMax = sh.level||1;
  out.hitDie = hdDie;
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
  // HQ3-C1 — Hit-Dice pool: cur=max on a fresh/legacy sheet (heals in at full, same posture as slots).
  if(!sh.hitDice){ sh.hitDice={cur:d.hitDiceMax, max:d.hitDiceMax, die:d.hitDie}; changed=true; }
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

/* Spend N from a class pool (rage / sorceryPoints / channelDivinity / …). Refuses an over-spend (you
   can't pay what you don't have) so the caller can tell "couldn't afford" from "paid in full" — same
   ok:false contract as spendSlot. Returns {ok, key, label, spent, remaining, max}; on refusal
   {ok:false, reason:"no-pool"|"insufficient", have, want}. */
function spendResource(sh,key,n){
  ensureResources(sh);
  const k=resourceKey(key),pool=sh.pools&&sh.pools[k],label=(RESOURCE_POOLS[k]||{}).label||k;
  if(!pool)return {ok:false,reason:"no-pool",key:k,label};
  const want=Math.max(1,parseInt(n,10)||1);
  if(want>pool.cur)return {ok:false,reason:"insufficient",key:k,label,have:pool.cur,want,remaining:pool.cur,max:pool.max};
  pool.cur=clamp(pool.cur-want,0,pool.max);
  return {ok:true,key:k,label,spent:want,remaining:pool.cur,max:pool.max};
}

/* HQ3-C1 (SET-07-F2) — spend up to n hit dice on a short rest: roll (die + CON mod, floored at 0)
   each, sum, heal, decrement the pool. rolls[] (optional) lets a transparent client pass the
   player's own dice (mirrors item_use's payload.roll). Returns {ok, spent, healed, hp, cur, max}
   or {ok:false, reason}. Pure mutator on sh (the only writer of sh.hitDice.cur besides restRecover). */
function spendHitDice(sh, n, rolls){
  ensureResources(sh);
  const want = Math.max(0, Math.floor(Number(n)||0));
  if(want<=0) return {ok:false, reason:"none-requested"};
  const have = (sh.hitDice&&sh.hitDice.cur)||0;
  if(have<=0) return {ok:false, reason:"no-hit-dice", cur:0, max:(sh.hitDice&&sh.hitDice.max)||0};
  const spend = Math.min(want, have);
  const die = (sh.hitDice&&sh.hitDice.die)||8;
  const con = (sh.mods&&sh.mods.con)||0;
  let healed=0;
  for(let i=0;i<spend;i++){
    const roll = (Array.isArray(rolls)&&typeof rolls[i]==="number") ? rolls[i]
               : (typeof rollDie==="function"? rollDie(die) : Math.ceil((die+1)/2));
    healed += Math.max(0, roll + con);        // per-die floor 0 (a negative CON never drains HP)
  }
  sh.hitDice.cur = have - spend;
  const r = applyHpDelta(sh, healed);
  return {ok:true, spent:spend, healed:r.delta, hp:r.to+"/"+r.max, cur:sh.hitDice.cur, max:sh.hitDice.max};
}

/* Rest recovery. kind="long" → full reset (HP, all slots, pact, every pool, ⌊level/2⌋ min 1 hit dice
   regained — HQ3-C1). kind="short" → pact slots + short-rest pools (Channel Divinity, Focus, Action
   Surge) + 1 Rage; HP/Vancian slots are unchanged (SRD: short-rest HP is the player spending Hit
   Dice — spendHitDice above, wired from the `rest` handler). Returns a short summary string. */
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
  if(long && sh.hitDice){
    const back = Math.max(1, Math.floor((sh.level||1)/2));
    const before = sh.hitDice.cur;
    sh.hitDice.cur = Math.min(sh.hitDice.max, sh.hitDice.cur + back);
    if(sh.hitDice.cur>before) parts.push("hit dice");
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
  // HQ3-C1 — the short-rest heal budget (pc.resources.hitDice {cur,max,die}); always shipped for a
  // real PC (max>0), sparse-safe otherwise.
  if(sh.hitDice && sh.hitDice.max>0) out.hitDice={cur:sh.hitDice.cur, max:sh.hitDice.max, die:sh.hitDice.die};
  return out;
}

/* HQ2-8a — the one place base+feat spell lists merge (dm.js digest AND the live Spells tab agree).
   Deduped by name — the digest already did this; the UI (render.js) did not until this unit.
   Returns {cantrips:[…], spells:[…]}, always arrays (callers decide what "empty" means to them). */
function spellListsOf(sh){
  const cat=(a,b)=>{ const out=[]; (a||[]).concat(b||[]).forEach(n=>{ if(n && out.indexOf(n)<0) out.push(n); }); return out; };
  return { cantrips:cat(sh&&sh.cantrips, sh&&sh.featCantrips), spells:cat(sh&&sh.spells, sh&&sh.featSpells) };
}

/* SOCIAL-SPINE-FIXES §S3 — known-spell NAME lists for dmDigest (caster discoverability). Names
   only, deduped across the creator's class lists and feat picks (bardo.js:157 concatenates the
   same way for the sheet display). SPARSE: null for martials / empty lists — the digest spreads
   {} and ships zero bytes. Mechanics (slots/DCs/spell text) deliberately excluded — the DM
   verifies KNOWLEDGE here and reads costs from resources.slots; it never needs the spell body. */
function spellDigest(sh){
  if(!sh) return null;
  const { cantrips:c, spells:s }=spellListsOf(sh);
  const out={};
  if(c.length) out.cantrips=c;
  if(s.length) out.spells=s;
  return (out.cantrips||out.spells)?out:null;
}
