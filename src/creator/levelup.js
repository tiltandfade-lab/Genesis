/* GENESIS MODULE — src/creator/levelup.js — the in-app LEVEL-UP CHOICE PICKER.
   docs/ADVANCEMENT.md: the MECHANICAL recompute (HP / proficiency / spell slots / class pools)
   lands as the `level_applied` event → applyLevelUp. THIS module surfaces the INTERPRETIVE picks
   the engine can't decide — new cantrips, new spells known, the subclass (a reveal; one per class in
   the SRD), an Ability-Score-Improvement-OR-feat slot at L4/L8, and an optional spell swap. It reuses
   the bardo's spell-card visuals + creatorSpells / showSpellTip, but operates on a LIVE world PC sheet,
   not GS.CGEN. Transient state lives in GS.LEVELUP; the picks are applied through a single mutator.

   Per-level data comes from CLASS_PROGRESSION (the spell-count fields are level-specific — the
   bardo's CLASS_CASTING is L1-only, which is why this is a real per-level build). Classic
   <script>, shared global scope. Reads CLASS_PROGRESSION / CLASS_CASTING / progLevel /
   deriveResources / abilMod / ABIL at call-time. */

const ASI_FEATURE = "Ability Score Improvement";

/* which sheet field holds the growing KNOWN-spell list for this class: a Wizard grows a
   spellbook (+2/level), every other caster grows a prepared list. (Matches CLASS_PROGRESSION.) */
function levelSpellField(cls){ return cls==="Wizard" ? "spellbook" : "prepared"; }

/* the highest spell LEVEL this sheet can cast at a given progression entry (1..9), from its slot
   array (warlock reads the pact-slot level). 0 = no leveled slots yet. */
function maxSpellLevel(L){
  if(!L) return 0;
  if(Array.isArray(L.slots)){ let m=0; for(let i=0;i<L.slots.length;i++) if(L.slots[i]>0) m=i+1; if(m) return m; }
  if(L.pactSlotLevel) return L.pactSlotLevel;
  return 0;
}

/* Compute the interactive level-up plan for from→to (a multi-level jump aggregates the deltas).
   Returns {cls, caster, list, ability, term, cantrips:Δ, spells:Δ, spellMaxLevel, asiCount,
   subclassName, subclassDesc, subFeatures:[], gained:[feature names], interactive:bool}. */
function levelUpPlan(sh, from, to){
  const cls=sh.class;
  const cap=(typeof CLASS_CASTING!=="undefined")&&CLASS_CASTING[cls];
  const pf=progLevel(cls,from), pt=progLevel(cls,to), field=levelSpellField(cls);
  const cantrips=Math.max(0, ((pt&&pt.cantrips)||0)-((pf&&pf.cantrips)||0));
  const spellMaxLevel=maxSpellLevel(pt);
  let spells=cap ? Math.max(0, ((pt&&pt[field])||0)-((pf&&pf[field])||0)) : 0;
  if(spellMaxLevel<1) spells=0;                       // can't pick leveled spells with no slots to cast them
  let asiCount=0; const gained=[];
  for(let l=from+1;l<=to;l++){ const L=progLevel(cls,l); if(!L) continue;
    (L.features||[]).forEach(f=>{ if(f.name===ASI_FEATURE) asiCount++; gained.push(f.name); });
  }
  // subclass: the SRD ships one per class — REVEAL its grant + the features gained in this span
  // (deterministic, no choice; recorded on the sheet). Grant level = the lowest level it has features.
  const sub=(typeof SUBCLASS_PROGRESSION!=="undefined") && SUBCLASS_PROGRESSION[cls];
  let subclassName=null, subclassDesc=null; const subFeatures=[];
  if(sub && sub.levels){
    for(let l=from+1; l<=to; l++)
      (sub.levels[String(l)]||[]).forEach(f=>subFeatures.push({level:l, name:f.name, text:f.text}));
    const grant=Math.min(...Object.keys(sub.levels).map(Number));
    if(from<grant && to>=grant){ subclassName=sub.name; subclassDesc=sub.desc; }   // newly chosen this span
  }
  const interactive = cantrips>0 || spells>0 || asiCount>0 || subFeatures.length>0;
  return {cls, caster:((typeof CLASS_PROGRESSION!=="undefined"&&CLASS_PROGRESSION[cls])||{}).caster||null,
    list:cap?cap.list:null, ability:cap?cap.ability:null, term:cap?cap.term:null,
    cantrips, spells, spellMaxLevel, asiCount, gained,
    subclassName, subclassDesc, subFeatures, interactive};
}

/* the live (world, character, sheet) for the open picker. */
function luCtx(){
  const lu=GS.LEVELUP; if(!lu) return {};
  const w=(typeof U!=="undefined")&&U.worlds&&U.worlds[lu.worldId];
  const c=w&&(w.characters||[]).find(x=>x.id===lu.charId);
  return {w, c, sh:c&&c.sheet, lu};
}

/* The level a sheet has FINALIZED its interpretive picks up to — `choicesLevel`. It lags `level`
   (the mechanical level, which the rest-gate grows immediately) whenever a level-up's spells/ASI
   haven't been chosen yet. The gap between them is the unfinalized obligation: a level-up must NOT
   be silently lost (Adam, 2026-06-26 — a level-up is a big event), so this marker PERSISTS on the
   sheet (saved with the world) and a banner + auto-open keep surfacing the picker until it's
   finalized. Seeded for legacy/new sheets in ensureResources. */
function picksFrom(sh){ return (sh && sh.choicesLevel!=null) ? sh.choicesLevel : (sh && sh.level) || 1; }

/* Does this sheet owe interpretive picks? (an interactive span between choicesLevel and level). */
function pendingChoices(sh){
  if(!sh) return false;
  const from=picksFrom(sh), to=sh.level||1;
  return to>from && levelUpPlan(sh, from, to).interactive;
}

/* Open the level-up picker for the choices owed (choicesLevel → level). The MECHANICAL recompute has
   already happened (level_applied → applyLevelUp); this collects the interpretive picks. If the owed
   span grants no interactive choice it FINALIZES immediately (advances choicesLevel) and returns
   false; ditto when there's no DOM (headless) — but there the marker is LEFT pending so a real UI
   surfaces it later. Re-entrant: re-opening after an accidental close reads the same persistent
   marker, so nothing is lost. */
function openLevelUp(w, c){
  if(!w || !c || !c.sheet) return false;
  const sh=c.sheet, from=picksFrom(sh), to=sh.level||1;
  if(to<=from) return false;                                   // nothing owed
  const plan=levelUpPlan(sh, from, to); plan.from=from; plan.to=to;
  if(!plan.interactive){ sh.choicesLevel=to; return false; }   // pure-feature span → finalize, no modal
  const host=(typeof document!=="undefined") && document.getElementById("levelBody");
  if(!host) return false;                                      // headless: leave the marker pending
  GS.LEVELUP={ worldId:(w.id||U.activeWorldId), charId:c.id, from, to, plan,
    picks:{ cantrips:[], spells:[], swap:{drop:null,add:null},
      slots:Array.from({length:plan.asiCount},()=>({kind:null,mode:null,abils:[],featId:null,featAbil:null})) } };
  renderLevelUp();
  const modal=document.getElementById("levelModal"); if(modal) modal.classList.add("show");
  return true;
}

/* Open the picker for the active world's living PC if picks are owed and one isn't already open.
   The banner's button and renderWorld's auto-open both route through here. */
function openLevelUpForActive(){
  if(GS.LEVELUP) return false;
  const w=(typeof activeWorld==="function") && activeWorld(); if(!w) return false;
  const c=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0];
  return (c && pendingChoices(c.sheet)) ? openLevelUp(w,c) : false;
}

/* LEVELUP-PICKER §1: "the DM's next digest carries `levelUp: {picks…}` so it can narrate the
   ceremony". Derived from PERSISTED sheet state only (choicesLevel/level/subclass/feats/spells/
   scores) — never from GS.LEVELUP (transient client UI state; a headless/DM-side reader has no
   access to it, and a reload must not lose the digest). Two shapes:
   - pending picks owed (choicesLevel<level, interactive span): {status:"pending", from, to,
     cantrips, spells, asiCount, subclassName} — so the DM knows a ceremony is coming, not yet cast.
   - freshly settled this call (choicesLevel just caught up to level, i.e. finalized off-digest
     since the last read — confirmLevelUp/skipLevelUp both bump choicesLevel): reported via the
     ledger (kind:"level-choices") already; digest doesn't need a second copy. null in the common
     case (nothing owed, nothing to narrate) — ~0 B most turns, matching the prepPending pattern. */
function levelUpDigest(w){
  const cur=w && (w.characters||[]).filter(x=>x.status==="living").slice(-1)[0];
  const sh=cur&&cur.sheet; if(!sh) return null;
  if(!pendingChoices(sh)) return null;
  const from=picksFrom(sh), to=sh.level||1, plan=levelUpPlan(sh, from, to);
  return { status:"pending", from, to,
    cantrips:plan.cantrips, spells:plan.spells, asiCount:plan.asiCount,
    subclassName:plan.subclassName||null };
}

/* Claim an EARNED level RIGHT NOW from the character sheet — the un-gated path (no rest required;
   Adam 2026-06-28: "you don't have to rest in BG3 to level up"). Runs the same mechanical recompute
   as the rest path (level_applied → applyLevelUp) then opens the interpretive picker. The rest-gate
   in advanceTime (world/play.js) remains as a convenience trigger; this is the primary, immediate one.
   No-op unless the living PC actually has an earned level pending. */
function claimLevelUp(){
  const w=(typeof activeWorld==="function") && activeWorld(); if(!w) return false;
  const c=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0];
  if(!c || !c.sheet) return false;
  if(typeof pendingLevelUp!=="function" || !pendingLevelUp(c.sheet)) return false;
  const to=levelForXp(c.sheet.xp||0);
  const lr=(typeof applyEvent==="function") && applyEvent(w,{type:"level_applied",payload:{to},source:"player"});
  if(lr && lr.ok){
    if(typeof logEvent==="function")
      logEvent(w,`<strong style="color:var(--gold)">${escHtml(c.name)}</strong> grows to level ${lr.to}.`);
    openLevelUp(w,c);   // interpretive picks (pure-feature / headless spans finalize themselves)
  }
  if(typeof saveU==="function") saveU(U);
  if(typeof renderWorld==="function") renderWorld();
  return true;
}

/* The persistent, glowing re-open banner — shown in the world view whenever the living PC owes
   picks (so an accidental close / reload can always be recovered). "" when nothing is owed. */
function levelUpBannerHTML(w, cur){
  if(!cur || !cur.sheet || !pendingChoices(cur.sheet)) return "";
  const to=cur.sheet.level||1;
  return `<div class="levelup-banner" onclick="openLevelUpForActive()" title="Choose your level-up powers">
    <span class="lub-mark">✦</span>
    <span class="lub-text"><b>${escHtml(cur.name)}</b> has come into <b>level ${to}</b> — new powers await your choosing.</span>
    <button class="btn primary sm" onclick="event.stopPropagation();openLevelUpForActive()">Choose your powers →</button>
  </div>`;
}

/* Close the modal WITHOUT finalizing — leaves the persistent marker so it re-surfaces. (There is no
   close button wired to this; it exists for completeness. Accidental loss = a reload, which the
   marker + banner recover.) */
function closeLevelUp(){
  const modal=(typeof document!=="undefined")&&document.getElementById("levelModal");
  if(modal) modal.classList.remove("show");
  GS.LEVELUP=null;
}

/* ---- pick toggles (mutate GS.LEVELUP.picks, then re-render) ---- */

/* spell options of `level` (0 = cantrips) for the class list, minus what's already known and the
   feat-granted picks — so the player only ever picks genuinely NEW magic. */
function luSpellOpts(level){
  const {sh,lu}=luCtx(); if(!sh||!lu.plan.list) return [];
  const known=new Set([].concat(level===0?(sh.cantrips||[]):(sh.spells||[]),
    (sh.featCantrips||[]),(sh.featSpells||[])));
  return creatorSpells(lu.plan.list, level).filter(s=>!known.has(s.name));
}

function luToggleCantrip(name){
  const lu=GS.LEVELUP; if(!lu) return; const arr=lu.picks.cantrips, i=arr.indexOf(name);
  if(i>=0) arr.splice(i,1); else if(arr.length<lu.plan.cantrips) arr.push(name);
  renderLevelUp();
}
function luToggleSpell(name){
  const lu=GS.LEVELUP; if(!lu) return; const arr=lu.picks.spells, i=arr.indexOf(name);
  if(i>=0) arr.splice(i,1); else if(arr.length<lu.plan.spells) arr.push(name);
  renderLevelUp();
}
function luAutoMagic(){
  const lu=GS.LEVELUP; if(!lu) return;
  if(lu.plan.cantrips>0) lu.picks.cantrips=luSpellOpts(0).slice(0,lu.plan.cantrips).map(s=>s.name);
  if(lu.plan.spells>0){
    const pool=[]; for(let lv=1; lv<=lu.plan.spellMaxLevel; lv++) pool.push(...luSpellOpts(lv));
    lu.picks.spells=pool.slice(0,lu.plan.spells).map(s=>s.name);
  }
  renderLevelUp();
}

/* an ASI ability is pickable only if the bump won't push it over 20. Baseline 10 matches the
   apply path (applyLevelChoices) so the headroom check and the written value never disagree. */
function luAsiHeadroom(ab, amount){ const {sh}=luCtx(); return sh ? (((sh.scores||{})[ab]||10)+amount)<=20 : false; }

/* ---- advancement slots: each ASI-level slot is EITHER an ability bump OR a feat (2024 model) ---- */
function luSetSlotKind(i, kind){
  const lu=GS.LEVELUP; if(!lu||!lu.picks.slots[i]) return;
  lu.picks.slots[i]={kind, mode:null, abils:[], featId:null, featAbil:null}; renderLevelUp();
}
function luSetAsiMode(i, mode){
  const lu=GS.LEVELUP; const s=lu&&lu.picks.slots[i]; if(!s) return;
  s.kind="asi"; s.mode=mode; s.abils=[]; renderLevelUp();
}
function luToggleAsiAbil(i, ab){
  const lu=GS.LEVELUP; const s=lu&&lu.picks.slots[i]; if(!s||s.kind!=="asi"||!s.mode) return;
  const cap=s.mode==="+2"?1:2, per=s.mode==="+2"?2:1, j=s.abils.indexOf(ab);
  if(j>=0){ s.abils.splice(j,1); }
  else if(s.abils.length<cap && luAsiHeadroom(ab, per)) s.abils.push(ab);
  renderLevelUp();
}
function luAutoAsi(i){
  const lu=GS.LEVELUP; const s=lu&&lu.picks.slots[i]; if(!s) return; const {sh}=luCtx(); if(!sh) return;
  const cls=CLASSES[sh.class], arr=cls?cls.arr:null;
  const order=ABIL.slice().sort((x,y)=>((arr?arr[y]:0)-(arr?arr[x]:0)));   // class priority
  const top=order.find(ab=>luAsiHeadroom(ab,2));
  if(top){ Object.assign(s,{kind:"asi",mode:"+2",abils:[top]}); }
  else { Object.assign(s,{kind:"asi",mode:"+1+1",abils:order.filter(ab=>luAsiHeadroom(ab,1)).slice(0,2)}); }
  renderLevelUp();
}
/* feat side of a slot */
function luSetFeat(i, id){
  const lu=GS.LEVELUP; const s=lu&&lu.picks.slots[i]; if(!s) return;
  s.kind="feat"; s.featId=id; s.featAbil=null;
  const def=(typeof GENERAL_FEATS!=="undefined")&&GENERAL_FEATS[id];
  if(def&&def.kind==="half"&&def.abilities&&def.abilities.length===1) s.featAbil=def.abilities[0];  // single-option = auto
  renderLevelUp();
}
function luSetFeatAbil(i, ab){
  const lu=GS.LEVELUP; const s=lu&&lu.picks.slots[i]; if(!s||s.kind!=="feat") return;
  s.featAbil=(s.featAbil===ab)?null:ab; renderLevelUp();
}

function luSlotDone(s){
  if(!s||!s.kind) return false;
  if(s.kind==="asi") return !!s.mode && s.abils.length===(s.mode==="+2"?1:2);
  if(s.kind==="feat"){ const def=(typeof GENERAL_FEATS!=="undefined")&&GENERAL_FEATS[s.featId];
    return !!def && (def.kind!=="half" || !!s.featAbil); }
  return false;
}
/* spell swap (optional): valid when BOTH or NEITHER of drop/add are set */
function luSwapValid(){ const sw=GS.LEVELUP&&GS.LEVELUP.picks.swap; return !sw || (!sw.drop===!sw.add); }
function luToggleSwapDrop(name){ const sw=GS.LEVELUP&&GS.LEVELUP.picks.swap; if(!sw) return; sw.drop=(sw.drop===name)?null:name; renderLevelUp(); }
function luToggleSwapAdd(name){ const sw=GS.LEVELUP&&GS.LEVELUP.picks.swap; if(!sw) return; sw.add=(sw.add===name)?null:name; renderLevelUp(); }

function luComplete(){
  const lu=GS.LEVELUP; if(!lu) return false;
  return lu.picks.cantrips.length===lu.plan.cantrips
      && lu.picks.spells.length===lu.plan.spells
      && lu.picks.slots.every(luSlotDone)
      && luSwapValid();
}

/* apply one chosen feat to the sheet: the mechanical grant + record it; situational text is the DM's.
   (Called from applyLevelChoices BEFORE luRecomputeFromScores, so a half-feat's +1 ripples correctly.) */
function applyFeat(sh, fp){
  const def=(typeof GENERAL_FEATS!=="undefined")&&GENERAL_FEATS[fp&&fp.id]; if(!def||!sh) return null;
  const g=def.grant||{};
  if(g.ability && fp.featAbil){ sh.scores[fp.featAbil]=Math.min(20,(sh.scores[fp.featAbil]||10)+1); }
  if(g.hpPerLevel){ const add=g.hpPerLevel*(sh.level||1); sh.hp=(sh.hp||0)+add; if(sh.hpCur!=null) sh.hpCur=Math.min(sh.hp,(sh.hpCur==null?sh.hp:sh.hpCur)+add); }   // ==null, not ||: a downed PC (hpCur 0) gains the HP, isn't revived to full
  if(g.ac){ sh.acBonus=(sh.acBonus||0)+g.ac; }   // a flat AC feat (Iron Skin) — a tracked bonus, folded in by cmSheetAC (docs/ITEMS.md)
  if(g.speed){ sh.speed=(sh.speed||30)+g.speed; }
  if(Array.isArray(g.skillProfs)){ sh.skillProfs=sh.skillProfs||[]; g.skillProfs.forEach(s=>{ if(sh.skillProfs.indexOf(s)<0) sh.skillProfs.push(s); }); }
  if(g.saveProfFromAbility && fp.featAbil){ sh.saveProfs=sh.saveProfs||[]; if(sh.saveProfs.indexOf(fp.featAbil)<0) sh.saveProfs.push(fp.featAbil); }
  sh.feats=sh.feats||[]; sh.feats.push({id:fp.id, name:def.name, ability:fp.featAbil||null});
  return {label: def.name + (fp.featAbil?` (+1 ${ABIL_LABEL[fp.featAbil]})`:"")};
}

/* ---- apply: the single mutator that writes the picks onto the live sheet ---- */

/* recompute ability mods from sh.scores and ripple the score-derived stats the sheet tracks
   (HP from CON, AC from equipped armor + DEX, passive Perception from WIS). No-op when unchanged. */
function luRecomputeFromScores(sh){
  const old=Object.assign({}, sh.mods||{});
  const nm={}; ABIL.forEach(a=>nm[a]=abilMod(sh.scores[a]||10));
  const conD=(nm.con||0)-(old.con||0), dexD=(nm.dex||0)-(old.dex||0), wisD=(nm.wis||0)-(old.wis||0);
  sh.mods=nm;
  if(conD){ const add=conD*(sh.level||1); sh.hp=(sh.hp||0)+add; if(sh.hpCur!=null) sh.hpCur=Math.max(0,Math.min(sh.hp, sh.hpCur+add)); }
  // AC always re-derives from current armor + DEX + bonuses (docs/ITEMS.md) — idempotent, and the only
  // way to get it right: a DEX bump must NOT add to AC for a no-DEX heavy / DEX-capped medium wearer,
  // which the old flat `sh.ac+=dexD` got wrong. Fall back to the unarmored 10+DEX+bonus model only when
  // the resolver isn't loaded (a data-less headless harness).
  sh.ac=(typeof cmSheetAC==="function")?cmSheetAC(sh):(10+(nm.dex||0)+(sh.acBonus||0));
  if(wisD) sh.passivePerception=(sh.passivePerception||10)+wisD;
}

function applyLevelChoices(w, c, picks, plan){
  const sh=c&&c.sheet; if(!sh) return {ok:false, reason:"no-sheet"};
  sh.cantrips=sh.cantrips||[]; sh.spells=sh.spells||[];
  // spell swap (2024: replace one known spell on level-up) — drop first, so the slot frees for the add
  const swap=picks.swap;
  if(swap && swap.drop && swap.add){ const i=sh.spells.indexOf(swap.drop); if(i>=0) sh.spells.splice(i,1); }
  picks.cantrips.forEach(n=>{ if(sh.cantrips.indexOf(n)<0) sh.cantrips.push(n); });
  picks.spells.forEach(n=>{ if(sh.spells.indexOf(n)<0) sh.spells.push(n); });
  if(swap && swap.drop && swap.add && sh.spells.indexOf(swap.add)<0) sh.spells.push(swap.add);
  // each ASI-level slot is either an ability bump OR a feat (2024 model)
  const asiBits=[], featBits=[];
  (picks.slots||[]).forEach(s=>{
    if(!luSlotDone(s)) return;
    if(s.kind==="asi"){ const amt=s.mode==="+2"?2:1;
      s.abils.forEach(ab=>{ sh.scores[ab]=Math.min(20,(sh.scores[ab]||10)+amt); asiBits.push(`${ABIL_LABEL[ab]} ${sh.scores[ab]}`); });
    } else if(s.kind==="feat"){ const r=applyFeat(sh,{id:s.featId,featAbil:s.featAbil}); if(r&&r.label) featBits.push(r.label); }
  });
  luRecomputeFromScores(sh);   // ripple mods + HP/AC/PP (no-op if no score change)
  if(typeof growPools==="function") growPools(sh);   // a casting-stat bump may raise a derived pool max (engine.resources)
  // subclass — deterministic (one per class in the SRD): record the path + the features gained this span
  if(plan.subclassName) sh.subclass=plan.subclassName;
  if(plan.subFeatures && plan.subFeatures.length)
    sh.subclassFeatures=(sh.subclassFeatures||[]).concat(plan.subFeatures.map(f=>({level:f.level,name:f.name})));
  const bits=[];
  if(plan.subclassName)     bits.push(`path — ${plan.subclassName}`);
  if(picks.cantrips.length) bits.push(`cantrips — ${picks.cantrips.join(", ")}`);
  if(picks.spells.length)   bits.push(`${plan.term==="spellbook"?"spellbook":"spells"} — ${picks.spells.join(", ")}`);
  if(swap && swap.drop && swap.add) bits.push(`swapped ${swap.drop} → ${swap.add}`);
  if(asiBits.length)        bits.push(`scores — ${asiBits.join(", ")}`);
  if(featBits.length)       bits.push(`feat — ${featBits.join(", ")}`);
  if(typeof addLedger==="function")
    addLedger(w,"outcome",{kind:"level-choices",pc:c.name,from:plan.from,to:plan.to,subclass:plan.subclassName||null,
      cantrips:picks.cantrips.slice(),spells:picks.spells.slice(),asi:asiBits.slice(),feats:featBits.slice(),
      swap:(swap&&swap.drop&&swap.add)?{drop:swap.drop,add:swap.add}:null},
      `✦ ${c.name} comes into level ${plan.to}${bits.length?` — ${bits.join(" · ")}`:""}.`);
  if(typeof logEvent==="function")
    logEvent(w,`<strong style="color:var(--gold)">${c.name}</strong> settles into level ${plan.to}${bits.length?`: ${bits.join("; ")}`:""}.`);
  return {ok:true};
}

function confirmLevelUp(){
  const {w,c,lu}=luCtx(); if(!w||!c||!lu){ closeLevelUp(); return; }
  if(!luComplete()){ if(typeof toast==="function") toast("Finish your choices first."); return; }
  applyLevelChoices(w, c, lu.picks, lu.plan);
  c.sheet.choicesLevel=lu.to;                 // FINALIZE — clears the persistent pending marker
  if(typeof saveU==="function") saveU(U);
  closeLevelUp();
  if(typeof renderWorld==="function") renderWorld();
}

/* The deliberate "Decide with my DM" path — an explicit, informed choice to handle the picks in
   narration (subclass/feats already are). It FINALIZES the marker (this is a conscious decision, not
   the accidental close we guard against), so the banner stops nagging. The level_applied ledger line
   already records that spells/feat/subclass are owed to the DM. */
function skipLevelUp(){
  const {w,c,lu}=luCtx();
  if(w&&c&&lu){
    // the subclass isn't a CHOICE (one per class in the SRD) — record it even when the player defers the
    // interpretive picks to the DM, so the sheet always reflects their path.
    if(lu.plan.subclassName) c.sheet.subclass=lu.plan.subclassName;
    if(lu.plan.subFeatures&&lu.plan.subFeatures.length)
      c.sheet.subclassFeatures=(c.sheet.subclassFeatures||[]).concat(lu.plan.subFeatures.map(f=>({level:f.level,name:f.name})));
    if(typeof logEvent==="function")
      logEvent(w,`${c.name} will choose their level-${lu.to} spells / improvements with the DM.`);
    c.sheet.choicesLevel=lu.to;               // finalize: an explicit deferral is still a decision
  }
  if(typeof saveU==="function") saveU(U);
  closeLevelUp();
  if(typeof renderWorld==="function") renderWorld();
}

/* ---- render ---- */
function renderLevelUp(){
  const host=(typeof document!=="undefined")&&document.getElementById("levelBody");
  const {sh,lu}=luCtx(); if(!host||!sh||!lu) return;
  const p=lu.plan;
  const card=(s,sel,full,onclick)=>
    `<button class="bardo-opt spell-opt ${sel?'sel':''}" ${full?'disabled':''} onclick="${onclick}"`+
    ` onmouseenter="showSpellTip(this)" onmouseleave="hideSpellTip()" onfocus="showSpellTip(this)" onblur="hideSpellTip()">`+
    `<span class="opt-title">${escHtml(s.name)}</span>`+
    `<span class="opt-meta">${s.level===0?'Cantrip':'Level '+s.level}${s.school?' · '+s.school:''}</span>`+
    `<span class="opt-desc">${escHtml(s.flavor||'')}</span>`+
    (s.text?`<span class="opt-full">${escHtml(s.text)}</span>`:'')+`</button>`;

  let body="";

  // subclass REVEAL (deterministic — one per class in the SRD; recorded on confirm, not chosen)
  if(p.subclassName || (p.subFeatures&&p.subFeatures.length)){
    const feats=(p.subFeatures||[]).map(f=>
      `<div class="bardo-opt" style="cursor:default;text-align:left">`+
        `<span class="opt-title">${escHtml(f.name)}</span>`+
        `<span class="opt-meta">Level ${f.level}</span>`+
        `<span class="opt-desc">${escHtml((f.text||'').split('\n')[0])}</span></div>`).join("");
    body+=`<div class="bardo-beat" style="margin-top:6px">${p.subclassName?`✦ Your path: ${escHtml(p.subclassName)}`:"Your path deepens"}</div>`+
      (p.subclassDesc?`<div class="bardo-dienote" style="margin-bottom:4px">${escHtml(p.subclassDesc)}</div>`:"")+
      `<div class="bardo-opts grid">${feats}</div>`;
  }

  // cantrips
  if(p.cantrips>0){
    const opts=luSpellOpts(0), chosen=lu.picks.cantrips;
    body+=`<div class="bardo-beat" style="margin-top:10px">New cantrips · ${chosen.length}/${p.cantrips}</div>`+
      `<div class="bardo-opts grid">`+opts.map(s=>card(s, chosen.indexOf(s.name)>=0,
        chosen.length>=p.cantrips&&chosen.indexOf(s.name)<0, `luToggleCantrip('${s.name.replace(/'/g,"\\'")}')`)).join("")+`</div>`;
  }
  // leveled spells (grouped by spell level, one shared counter)
  if(p.spells>0){
    const chosen=lu.picks.spells, label=p.term==="spellbook"?"Add to spellbook":"New spells known";
    body+=`<div class="bardo-beat" style="margin-top:10px">${label} · ${chosen.length}/${p.spells}</div>`;
    const swapAdd=lu.picks.swap&&lu.picks.swap.add;   // a spell chosen as the swap-target can't also be a new pick (would lose a spell + waste the pick)
    for(let lv=1; lv<=p.spellMaxLevel; lv++){
      const opts=luSpellOpts(lv).filter(s=>s.name!==swapAdd); if(!opts.length) continue;
      body+=`<div class="bardo-opts grid">`+opts.map(s=>card(s, chosen.indexOf(s.name)>=0,
        chosen.length>=p.spells&&chosen.indexOf(s.name)<0, `luToggleSpell('${s.name.replace(/'/g,"\\'")}')`)).join("")+`</div>`;
    }
  }
  // optional spell swap (2024: replace one known leveled spell) — only for casters with a known spell
  if(p.list && (sh.spells||[]).length>0 && p.spellMaxLevel>=1){
    const sw=lu.picks.swap;
    body+=`<div class="bardo-beat" style="margin-top:12px">Swap a known spell <span style="color:var(--ink-dim);font-weight:400">· optional</span>${sw.drop&&sw.add?' · <span style="color:var(--gold-soft)">set</span>':''}</div>`;
    body+=`<div class="bardo-dienote">Drop one you know…</div><div class="bardo-opts grid">`+
      (sh.spells||[]).map(n=>`<button class="bardo-opt ${sw.drop===n?'sel':''}" onclick="luToggleSwapDrop('${n.replace(/'/g,"\\'")}')"><span class="opt-title">${escHtml(n)}</span></button>`).join("")+`</div>`;
    if(sw.drop){
      const picked=new Set([].concat(sh.spells||[], lu.picks.spells||[]));
      const repl=[]; for(let lv=1; lv<=p.spellMaxLevel; lv++) repl.push(...luSpellOpts(lv).filter(s=>!picked.has(s.name)));
      body+=`<div class="bardo-dienote">…and learn one instead</div><div class="bardo-opts grid">`+
        repl.map(s=>card(s, sw.add===s.name, false, `luToggleSwapAdd('${s.name.replace(/'/g,"\\'")}')`)).join("")+`</div>`;
    }
  }
  // advancement slots: each is EITHER an ability bump OR a feat
  lu.picks.slots.forEach((s,i)=>{
    const head=`<div class="bardo-beat" style="margin-top:12px">Advancement${p.asiCount>1?` (${i+1}/${p.asiCount})`:""}`+
      `${luSlotDone(s)?' · <span style="color:var(--gold-soft)">set</span>':''}</div>`;
    const kindToggle=`<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">`+
      `<button class="btn sm ${s.kind==="asi"?'primary':'ghost'}" style="margin:2px" onclick="luSetSlotKind(${i},'asi')">Improve abilities</button>`+
      `<button class="btn sm ${s.kind==="feat"?'primary':'ghost'}" style="margin:2px" onclick="luSetSlotKind(${i},'feat')">Take a feat</button></div>`;
    let inner="";
    if(s.kind==="asi"){
      const mode=s.mode;
      const modeBtn=(m,t)=>`<button class="btn sm ${mode===m?'primary':'ghost'}" style="margin:2px" onclick="luSetAsiMode(${i},'${m}')">${t}</button>`;
      let abils="";
      if(mode){ const per=mode==="+2"?2:1, cap=mode==="+2"?1:2;
        abils=`<div class="bardo-opts grid" style="margin-top:6px">`+ABIL.map(ab=>{
          const sel=s.abils.indexOf(ab)>=0, blocked=!sel&&(s.abils.length>=cap||!luAsiHeadroom(ab,per));
          return `<button class="bardo-opt ${sel?'sel':''}" ${blocked?'disabled':''} onclick="luToggleAsiAbil(${i},'${ab}')">`+
            `<span class="opt-title">${ABIL_LABEL[ab]}</span><span class="opt-meta">${sh.scores[ab]||10}${sel?` → ${Math.min(20,(sh.scores[ab]||10)+per)}`:""}</span></button>`;
        }).join("")+`</div>`;
      }
      inner=`<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-top:4px">${modeBtn("+2","+2 to one")}${modeBtn("+1+1","+1 to two")}`+
        `<button class="btn ghost sm" style="margin:2px" onclick="luAutoAsi(${i})">🎲 choose for me</button></div>${abils}`;
    } else if(s.kind==="feat"){
      const defs=(typeof GENERAL_FEATS!=="undefined")?GENERAL_FEATS:{};
      const featCards=Object.keys(defs).map(id=>{const d=defs[id], sel=s.featId===id;
        return `<button class="bardo-opt spell-opt ${sel?'sel':''}" onclick="luSetFeat(${i},'${id}')"`+
          ` onmouseenter="showSpellTip(this)" onmouseleave="hideSpellTip()">`+
          `<span class="opt-title">${escHtml(d.name)}</span>`+
          `<span class="opt-meta">${d.kind==="half"?"Half feat":"Feat"} · ${escHtml(d.summary||'')}</span>`+
          `<span class="opt-full">${escHtml(d.text||'')}</span></button>`;}).join("");
      inner=`<div class="bardo-opts grid" style="margin-top:6px">${featCards}</div>`;
      const def=defs[s.featId];
      if(def&&def.kind==="half"&&(def.abilities||[]).length>1){
        inner+=`<div class="bardo-dienote" style="margin-top:4px">+1 to which ability?</div><div class="bardo-opts grid">`+
          def.abilities.map(ab=>`<button class="bardo-opt ${s.featAbil===ab?'sel':''}" ${(((sh.scores[ab]||10)>=20)&&s.featAbil!==ab)?'disabled':''} onclick="luSetFeatAbil(${i},'${ab}')"><span class="opt-title">${ABIL_LABEL[ab]}</span><span class="opt-meta">${sh.scores[ab]||10}${s.featAbil===ab?` → ${Math.min(20,(sh.scores[ab]||10)+1)}`:""}</span></button>`).join("")+`</div>`;
      }
    }
    body+=head+kindToggle+inner;
  });

  const autoMagic=(p.cantrips>0||p.spells>0)
    ? `<button class="btn ghost sm" onclick="luAutoMagic()">🎲 choose magic for me</button>` : "";
  const done=luComplete();
  const nav=`<div class="bardo-nav" style="margin-top:14px">`+
    `<button class="btn ghost" onclick="skipLevelUp()">Decide with my DM</button>${autoMagic}`+
    `<button class="btn primary" ${done?'':'disabled style="opacity:.5;cursor:not-allowed"'} onclick="confirmLevelUp()">✦ Come into your power</button></div>`;

  const gained=p.gained.filter((v,j,arr)=>arr.indexOf(v)===j);
  const gainLine=gained.length
    ? `<div class="bardo-dienote" style="margin-top:2px">Gained: ${gained.map(escHtml).join(" · ")}</div>` : "";

  host.innerHTML=
    `<h3>Level ${p.from} → ${p.to}</h3>`+
    `<div class="bardo-gap" style="margin-bottom:4px">${escHtml((luCtx().c||{}).name||"The soul")} grows stronger. Your numbers have already risen; now choose what you've learned.</div>`+
    gainLine + body + nav;
}
