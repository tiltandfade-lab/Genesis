/* GENESIS MODULE — src/creator/sheet.js — the manual charge-sheet UI (bind/cancel/chips/pick + renderCharge)
   Carved from genesis.html monolith on 2026-06-20 (Pass 7, creator domain). AST-extracted (acorn).
   Classic <script>, shared global scope. Transient state lives in GS (GS.CGEN/GS.BARDO/GS.CG_DRAG); data consts
   (STAGES/WORLDBEATS/GUIDE/LIFE_STEP) live in data/creation-flow.js; read at call-time. */

/* Additive sheet fields from the walked creator choices (skills/equipment/spells).
   Shared by cgBind (enter the world) and soulFromCGEN (bank as a Wandering Soul). */
function cgSheetExtras(){const g=GS.CGEN||{},bg=BACKGROUNDS[g.background]||{};
  const fp=g.featPick||{skills:[],cantrips:[],spells:[]};
  const skillProfs=[].concat(bg.skills||[],g.skills||[],fp.skills||[]).filter((v,i,a)=>a.indexOf(v)===i);
  const kit=((typeof CLASS_KIT!=="undefined"&&CLASS_KIT[g.class])||[]).find(o=>o.id===g.kit);
  const cap=(typeof CLASS_CASTING!=="undefined")&&CLASS_CASTING[g.class];
  const fdef=(typeof ORIGIN_FEATS!=="undefined")&&ORIGIN_FEATS[bg.feat];
  const featAbility=(fdef&&fdef.choose&&fdef.choose.kind==="magic")?fdef.choose.ability:null;
  const lifeGp=g.lifeGold||0;  // gold earned across "This Is Your Life" events, banked at roll time
  const tp=g.toolPicks||{};
  /* resolve the background's generic tool ("Musical instrument" → the chosen instrument, etc.) */
  let tool=bg.tool||"";const tl=tool.toLowerCase();
  if(tl==="musical instrument")tool=tp["bg-instrument"]||tool;
  else if(tl==="artisan's tools")tool=tp["bg-artisan"]||tool;
  else if(tl==="gaming set")tool=tp["bg-gaming"]||tool;
  /* resolve any generic kit item ("Musical Instrument (your choice)" → the chosen item) */
  const kitItems=(kit?kit.items.slice():[]).map((it,idx)=>{const v=tp["kit-"+idx];if(!v)return it;
    const low=it.toLowerCase();
    return((low.indexOf("musical instrument")>=0&&low.indexOf("your choice")>=0)||low.indexOf("artisan's tools or musical instrument")>=0)?v:it;});
  // ITEMS (docs/ITEMS.md): expand every kit item string into its real individual instances via the
  // generated KIT_ITEM_EXPANSIONS (data/items.js) — a pack ("Explorer's Pack") becomes its full
  // contents, "4 Handaxes" becomes one Handaxe instance with qty:4. A player-resolved generic item
  // (the musical-instrument substitution above) won't be a KIT_ITEM_EXPANSIONS key — falls back to
  // itself, one instance, exactly like an unindexed name degrades everywhere else in this system.
  const KIE=(typeof KIT_ITEM_EXPANSIONS!=="undefined")?KIT_ITEM_EXPANSIONS:{};
  const inventory=kitItems.reduce((acc,raw)=>{
    const exp=KIE[raw]||[{name:raw}];
    exp.forEach(e=>{const inst={id:uid(),name:e.name,conditions:[]};if(e.qty)inst.qty=e.qty;acc.push(inst);});
    return acc;
  },[]);
  return{skillProfs,classSkills:(g.skills||[]).slice(),tool,languages:(g.languages||[]).slice(),
    inventory,gold:(kit?kit.gp:0)+lifeGp,kit:g.kit||null,
    cantrips:(g.cantrips||[]).slice(),spells:(g.spells||[]).slice(),spellAbility:cap?cap.ability:null,
    featSkills:(fp.skills||[]).slice(),featCantrips:(fp.cantrips||[]).slice(),featSpells:(fp.spells||[]).slice(),featSpellAbility:featAbility};}

function cgBind(){
  const w=activeWorld();if(!w||!GS.CGEN)return;
  const d=cgDerived();if(!d){toast("Roll ability scores first");return;}
  if(!GS.CGEN.class||!GS.CGEN.background){toast("Choose a class & background first");return;}
  const name=((GS.CGEN.name||(document.getElementById("cgName")||{}).value)||"").trim()||"the Stranger";
  const bg=BACKGROUNDS[GS.CGEN.background]||{};const ex=cgSheetExtras();
  // Adam's ruling 2026-07-26: hometown = where you're from. bornWhere resolves to the bardo
  // hometown roll (world.seed.hometown.setting, via hometownSettingName — src/world/play.js) ahead
  // of the world's master-setting/start node; GS.CGEN.spawnWhere (an explicit override some flows
  // pass, e.g. a rebirth successor waking in a named distant region — rollCharacter(spawnWhere))
  // still wins when set. Falls back to w.seed.master.name only when no hometown roll exists —
  // legacy saves predating the hometown beat, or the manual charge-sheet flow (rollCharacter with
  // no spawnWhere), which never rolls one.
  const c={id:uid(),name,pronouns:GS.CGEN.pronouns||"they",status:"living",bornAt:Date.now(),bornWhere:GS.CGEN.spawnWhere||hometownSettingName(w)||w.seed.master.name,
    sheet:{species:GS.CGEN.species,class:GS.CGEN.class,background:GS.CGEN.background,feat:bg.feat||"",tool:ex.tool,languages:ex.languages,
      level:1,xp:0,   // advancement spine (docs/ADVANCEMENT.md): XP accrues here, levels up on a rest (capped at Tier 2 / L10)
      scores:GS.CGEN.scores,mods:d.mods,hp:d.hp,ac:d.ac,profBonus:d.pb,passivePerception:d.pp,
      hitDie:"d"+d.hd,saveProfs:d.saves,skillProfs:ex.skillProfs,classSkills:ex.classSkills,
      inventory:ex.inventory,gold:ex.gold,kit:ex.kit,cantrips:ex.cantrips,spells:ex.spells,spellAbility:ex.spellAbility,
      featSkills:ex.featSkills,featCantrips:ex.featCantrips,featSpells:ex.featSpells,featSpellAbility:ex.featSpellAbility},
    life:GS.CGEN.life||null};
  if(typeof ensureResources==="function")ensureResources(c.sheet); // seed the live economy: current HP / slots / pools = max
  // ITEMS (docs/ITEMS.md): wear the starting gear — auto-equip armor/shield/primary weapon and DERIVE AC
  // from it (a 5e PC wears their kit armor; the old flat 10+DEX ignored it). Falls back to d.ac if the
  // resolvers aren't loaded (headless data-less harness).
  if(typeof defaultEquip==="function"){
    c.sheet.equipped=defaultEquip(c.sheet.inventory);
    if(typeof cmSheetAC==="function")c.sheet.ac=cmSheetAC(c.sheet);
  }
  c.headline=cgHeadline(c);c.spark=c.headline; // back-compat with legacy renders
  w.characters.push(c);
  addLedger(w,"canon",{kind:"character",char:c.id,name:c.name},`${c.name} was rolled into being — ${c.headline}.`);
  c.seeds=seedFromLife(w,c);
  // TIYL-DEEPENING §3.3: back-fill every TIYL-seeded person with a full rollNPC atom (ensureCodex
  // already ran inside bindWorld, which always runs before cgBind — see world/play.js bardoFound).
  if(typeof tiylBackfillPeople==="function")tiylBackfillPeople(w,c);
  rollEntry(w,c); // the PC↔world bridge — why here, foot in the door, standing, opening tension
  refreshSaga(w,c); // seed the Saga (their significant entities) — grows through play, read at death
  if(typeof heirloomEcho==="function") heirloomEcho(w,c);   // CROWNING/B2 §5.1 — a New Game+ heirloom of a finished world
  logEvent(w,`<strong style="color:var(--bone)">${c.name}</strong> was rolled into being — ${c.headline}${GS.CGEN.spawnWhere?` — entering at ${GS.CGEN.spawnWhere}`:""}.`);
  saveU(U);GS.CGEN=null;wakeIntoWorld();   // §9: fade out of creation into the DM's opening words
}

/* CROWNING-BASTION.md §7.B2 — the New Game+ heirloom echo. The seam where the ending (§3, the
   Crowning) and the vault (§4, the Bastion) are one system (§5.1): when a NEW world is rolled and a
   CROWNED world with a non-empty bastion vault exists on the plane, character creation gains one
   low-probability origin echo drawing ONE item from a crowned bastion's vault into the new PC's
   opening inventory, with its full r.legacy trail. The item MOVES (removed from the source vault,
   item_claimed both sides) — the plane holds one of each thing; legends migrate, they don't
   photocopy. Zero new model calls: a rollDie gate + a deterministic draw, engine-owned (the player
   picks the source world; the die picks the item). No new module — a small additive step at the
   creation-bind seam. */

// worlds that are crowned AND hold a non-empty bastion vault (excluding the world being born into)
function heirloomSourceWorlds(newWorldId){
  return Object.values(U.worlds||{}).filter(w=>w && w.id!==newWorldId
    && w.crowned && w.bastion && Array.isArray(w.bastion.vault) && w.bastion.vault.length>0);
}

const HEIRLOOM_ECHO_CHANCE = 3;   // rollDie(HEIRLOOM_ECHO_CHANCE)===1 ⇒ the echo fires (~1-in-3 when a
    // crowned vault exists). PROVISIONAL — Adam's taste dial; the crown's generosity (§5.1). If NO
    // crowned vault exists on the plane, the echo NEVER fires (guarded before the roll).
function heirloomEcho(w,c){
  const sources=heirloomSourceWorlds(w.id);
  if(!sources.length) return null;                         // no finished world to inherit from — no echo
  if(rollDie(HEIRLOOM_ECHO_CHANCE)!==1) return null;       // the low-probability gate
  // player picks the source world (a prompt in v1 — a small UI; blind-playable list); die picks the item
  const src=heirloomPickWorld(sources);                    // §B2.3 — defaults to the first if UI absent
  if(!src) return null;
  const vaultIds=src.bastion.vault.slice();
  const codexId=vaultIds[rollDie(vaultIds.length)-1];      // the die picks the item
  const r=(typeof codexGet==="function")?codexGet(src,codexId):null;
  if(!r || r.kind!=="item"){ return null; }
  // 1) mint the instance on the NEW PC from the source record's instSnapshot (the true item)
  const snap=(r.legacy&&r.legacy.instSnapshot)||{name:r.name};
  const inst={ id:uid(), name:snap.name, conditions:[], codexId:codexId,
    base:snap.base, ench:snap.ench?JSON.parse(JSON.stringify(snap.ench)):undefined, qty:snap.qty };
  Object.keys(inst).forEach(k=>inst[k]===undefined&&delete inst[k]);
  c.sheet.inventory=(c.sheet.inventory||[]).concat([inst]);
  // 2b) the DESTINATION-side twin (HOTFIX-QUEUE-2026-07-07 HQ2-7; CROWNING §7.B2): mint the item
  // record in the NEW world behind inst.codexId, carrying the crowned-heirloom origin + a full
  // r.legacy block, so codexGet(w,codexId) resolves NOW (not null until death) and a later death
  // (corpseLegacyStamp -> legacyEnsureRecord, which only defaults r.legacy when it's absent) never
  // lazily re-mints it as origin:"start" — losing the crowned-heirloom provenance. Mirrors the exact
  // r.legacy shape item-legacy.js's legacyEnsureRecord builds (origin/claimant/lastSeen/lossState/
  // recoveryHookId/factionInterest/instSnapshot) — codexAdd's rec whitelist drops an inline `legacy:`
  // key for a brand-new record (world/codex.js:102-106 does not copy it), so it's assigned onto the
  // record codexAdd returns, same as legacyEnsureRecord itself does. Built by hand here (not by
  // calling legacyEnsureRecord) so `origin.ref` can point at the SOURCE world (legacyEnsureRecord's
  // originHow path always hardcodes ref:null, and creator.sheet is a lower layer than world.item-legacy
  // — docs/SCALING.md's layer-direction check) — no legacy keys invented, only origin.ref filled in.
  // Only world-portable fields copy forward (lossState/instSnapshot/origin); decayRef/factionInterest
  // are SOURCE-world entities and would dangle the other way — the heirloom gets a fresh start.
  if(typeof codexAdd==="function" && !(typeof codexGet==="function" && codexGet(w,codexId))){
    const destRec=codexAdd(w,{ id:codexId, kind:"item", provenance:"rolled", name:r.name,
      fields:Object.assign({}, r.fields||{}), status:{known:true} });
    destRec.legacy={ origin:{ how:"heirloom", ref:src.id },
      claimant:{ kind:"pc", ref:c.id, name:c.name },
      lastSeen:{ nodeId:w.currentNodeId||null, day:(typeof clockOf==="function")?clockOf(w).day:0 },
      lossState:"held", recoveryHookId:null, factionInterest:null, decayRef:null, instSnapshot:snap };
  }
  // 2) it MOVES — leave the source vault, cross-world item_claimed pair (§5.1). `by.worldId` self-
  // documents which world now holds it (HQ2-7 secondary fix) — a dangling ref otherwise (c.id belongs
  // to w.characters, not src's); dm.js's item_claimed handler whitelists claimant to kind/ref/name and
  // is explicitly out of scope for this unit, so worldId lives on the event payload, not a persisted
  // codex field.
  applyEvent(src,{type:"item_claimed",source:"detected",payload:{codexId, lossState:"held",
    by:{kind:"pc",ref:c.id,worldId:w.id,name:c.name}, note:c.name+" carried it into a new world."}});   // out of the source
  // (the item_changed-add overlay path already spliced it from src.bastion.vault via B1.4;
  //  belt-and-braces: ensure it's gone)
  const vi=(src.bastion.vault||[]).indexOf(codexId); if(vi>=0) src.bastion.vault.splice(vi,1);
  // 3) the heirloom thread in the NEW world — where it came from (reuse ITEM-LEGACY's hook pattern)
  const tid="thread:heirloom-"+slug(r.name)+"-"+uid();
  if(typeof codexAdd==="function") codexAdd(w,{ id:tid, kind:"thread", provenance:"rolled",
    name:r.name+" — an heirloom of "+src.name,
    fields:{ desc:"Carried out of "+src.name+", a world someone finished. "+(src.crowned&&src.crowned.legend?src.crowned.legend.text:""), fromWorldId:src.id, itemName:r.name },
    dm:{ legs:"thread-seed", pool:"heirloom" }, status:{known:false, soft:true} });
  addLedger(w,"canon",{kind:"heirloom",item:r.name,fromWorld:src.name,char:c.id},
    "✧ "+c.name+" carries "+r.name+" — an heirloom of "+src.name+", a world that was crowned.");
  return {codexId, from:src.name};
}

/* §B2.3 — the source-world pick (blind-playable): a small prompt/list of crowned world names. In a
   UI-less/headless context (no window.prompt / harness), defaults to sources[0]. Under 12 lines. */
function heirloomPickWorld(sources){
  if(typeof prompt!=="function") return sources[0];
  const names=sources.map(s=>s.name+(s.crowned&&s.crowned.legend?" — "+s.crowned.legend.text:"")).join("\n");
  const chosen=prompt("An heirloom of a finished world calls to you. Which world?\n"+names, sources[0].name);
  if(!chosen) return sources[0];
  const found=sources.find(s=>s.name===chosen);
  return found||sources[0];
}

function cgCancel(){GS.CGEN=null;showTab('world');}

function cgChips(field,opts){return opts.map(o=>{const sel=GS.CGEN[field]===o;
  return `<button class="btn sm ${sel?'primary':'ghost'}" style="margin:2px" onclick="cgPick('${field}','${o}')">${escHtml(o)}</button>`;}).join("");}

function cgPick(field,val){GS.CGEN[field]=val;if(field==='class')cgAssign();else if(field==='background')cgFinalScores();renderCharge();}

/* Pronoun picker — buttons for the PRONOUN_SETS, used in both the bardo and the Sheet.
   cgSetPronouns toggles the active button via the DOM (no full re-render) so it never
   clobbers an unsaved name/world input sitting in the same view. */
function cgPronounPicker(){const cur=(GS.CGEN&&GS.CGEN.pronouns)||"they";
  return PRONOUN_SETS.map(p=>`<button type="button" data-pronoun="${p.id}" class="btn sm ${cur===p.id?'primary':'ghost'}" style="margin:2px" onclick="cgSetPronouns('${p.id}')">${p.label}</button>`).join("");}
function cgSetPronouns(id){if(!GS.CGEN)return;GS.CGEN.pronouns=id;
  document.querySelectorAll("[data-pronoun]").forEach(b=>{const on=b.dataset.pronoun===id;b.classList.toggle("primary",on);b.classList.toggle("ghost",!on);});}

function renderCharge(){
  const host=document.getElementById("chargeBody");if(!host||!GS.CGEN)return;
  const d=cgDerived();const bg=BACKGROUNDS[GS.CGEN.background];
  /* Step 1 — the sheet */
  let scoresHtml;
  if(GS.CGEN.scores&&d){
    scoresHtml=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0">`+ABIL.map(a=>{
      const v=GS.CGEN.scores[a],m=d.mods[a],base=GS.CGEN.base?GS.CGEN.base[a]:v,sel=GS.CGEN.swapSel===a;
      let bump="";if(bg){if(bg.abils[0]===a)bump="+2";else if(bg.abils[1]===a)bump="+1";}
      return `<div draggable="true" ondragstart="cgDragStart('${a}')" ondragover="event.preventDefault()" ondrop="cgDrop('${a}')" onclick="cgSlotClick('${a}')"
        title="drag onto another ability, or tap two, to swap"
        style="border:${sel?'2px solid var(--gold)':'1px solid var(--edge)'};border-radius:8px;background:${sel?'#241d15':'var(--vellum-2)'};padding:6px 10px;text-align:center;min-width:62px;cursor:grab;user-select:none">
        <div style="font-size:13px;letter-spacing:.1em;color:var(--ink-dim)">${ABIL_LABEL[a]}</div>
        <div style="font-size:23px;color:var(--bone);font-weight:600">${v}</div>
        <div style="font-size:14px;color:var(--gold-soft)">${m>=0?'+':''}${m}</div>
        <div style="font-size:12px;color:var(--ink-dim)">rolled ${base}${bump?` <span style="color:var(--gold-soft)">${bump}</span>`:""}</div></div>`;}).join("")+`</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:2px 0 6px">
        <button class="btn sm ${GS.CGEN.scoreMode==='best'?'primary':'ghost'}" onclick="cgScoreMode('best')">Best for ${GS.CGEN.class||'class'}</button>
        <button class="btn sm ${GS.CGEN.scoreMode==='rolled'?'primary':'ghost'}" onclick="cgScoreMode('rolled')">As rolled</button>
        ${GS.CGEN.scoreMode==='custom'?`<span style="font-size:14px;color:var(--gold-soft)">custom (your swaps)</span>`:''}
        <span style="font-size:14px;color:var(--ink-dim)">Drag a score onto another — or tap two — to reassign.${bg?` Background bonus stays on ${ABIL_LABEL[bg.abils[0]]} +2 / ${ABIL_LABEL[bg.abils[1]]} +1.`:""}</span></div>
      ${GS.CGEN.scoreBreak?`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 6px;align-items:center"><span style="font-size:13px;color:var(--ink-dim);letter-spacing:.06em">YOUR ROLLS</span>`+GS.CGEN.scoreBreak.map(b=>`<span style="display:inline-flex;gap:3px;align-items:center;border:1px solid var(--edge);border-radius:6px;padding:2px 6px"><b style="color:var(--bone);font-size:16px">${b.total}</b>${miniDice(b)}</span>`).join("")+`</div>`:""}
      <div style="font-size:16px;color:var(--ink)">HP <b>${d.hp}</b> · AC <b>${d.ac}</b> · Prof <b>+${d.pb}</b> · Passive Per <b>${d.pp}</b> · Hit Die <b>d${d.hd}</b> · Saves <b>${d.saves.map(x=>ABIL_LABEL[x]).join(" / ")||"—"}</b></div>
      ${bg?`<div style="font-size:16px;color:var(--ink-dim);margin-top:3px">Feat: <b style="color:var(--ink)">${bg.feat}</b> · Skills: ${bg.skills.join(", ")}${bg.tool?` · Tool: ${bg.tool}`:""}</div>`:""}
      <div style="font-size:14px;color:var(--ink-dim);margin-top:5px;font-style:italic">Skills, starting gear, and spells are walked one at a time in the guided creator (New Game). Class features come from the SRD at the table.</div>`;
  } else {
    scoresHtml=`<div style="font-size:16px;color:var(--ink-dim)">Choose a class first, then roll your six scores in the open (4d6, drop the lowest). They're assigned by your class's priority — your DM can help you rearrange.</div>`;
  }
  const sheetSec=`<div class="section"><h3>1 · The Sheet <span style="color:var(--ink-dim);font-size:14px;letter-spacing:0;text-transform:none">choose your shape · roll openly</span></h3>
    <div style="font-size:16px;color:var(--ink-dim);margin-bottom:2px">Species</div><div>${cgChips('species',Object.keys(SPECIES))}</div>
    <div style="font-size:16px;color:var(--ink-dim);margin:6px 0 2px">Class</div><div>${cgChips('class',Object.keys(CLASSES))}</div>
    <div style="font-size:16px;color:var(--ink-dim);margin:6px 0 2px">Background <span style="opacity:.7">(grants your origin feat)</span></div><div>${cgChips('background',Object.keys(BACKGROUNDS))}</div>
    <div style="margin-top:10px"><button class="btn sm ${GS.CGEN.class?'primary':'ghost'}" onclick="cgRollScores()">⚅ ${GS.CGEN.scores?'Reroll':'Roll'} ability scores</button></div>
    ${scoresHtml}</div>`;
  /* Step 2 — the life */
  let lifeSec;
  if(GS.CGEN.life){
    const L=GS.CGEN.life,O=L.origins;
    const o=[`Born: ${O.birthplace.text}${O.parents.total>95?" · parents unknown":""}`,
      `Family: raised by ${O.family.text.replace(/^An? /,'')}${O.absent?` — ${O.absent.text.replace(/^A parent /,'a parent who ')}`:""}`,
      `Siblings: ${O.siblings.text}${O.siblings.birthOrder?` (${O.siblings.birthOrder.toLowerCase()})`:""}`,
      `Upbringing: ${O.lifestyle.text.toLowerCase()} — ${O.childhoodHome.text.toLowerCase()}`,
      `“${O.childhoodMemory.text}”`].map(x=>`<div class="led-text" style="margin:2px 0">• ${x}</div>`).join("");
    const dec=`<div class="led-text" style="margin:2px 0">• ${L.decisions.background.text}</div><div class="led-text" style="margin:2px 0">• ${L.decisions.classTraining.text}</div>`;
    const evs=L.events.map(e=>`<div class="gaz-item"><div class="gi-top"><span class="gtype">event</span><span class="gn">${e.summary}</span></div>${e.detail?`<div class="gd">${e.detail}</div>`:""}</div>`).join("");
    const seeds=L.events.flatMap(e=>e.seeds||[]);
    const seedHtml=seeds.length?`<div style="margin-top:8px;border-top:1px solid var(--edge);padding-top:6px">
      <div style="font-size:14px;color:var(--gold-soft);letter-spacing:.06em;text-transform:uppercase">Writes into the world (${seeds.length})</div>`+
      seeds.map(s=>`<div class="led-text" style="margin:2px 0;color:var(--ink-dim)">${s.kind==='npc'?'☖':'✦'} ${s.kind==='npc'?s.role+' — '+s.desc:s.text}</div>`).join("")+`</div>`:"";
    lifeSec=`<div class="section"><h3>2 · The Life <span style="color:var(--ink-dim);font-size:14px;letter-spacing:0;text-transform:none">age: ${L.age} · ${L.events.length} life event${L.events.length>1?'s':''}</span></h3>
      <div style="font-size:14px;color:var(--ink-dim);text-transform:uppercase;letter-spacing:.06em;margin-bottom:2px">Origins</div>${o}
      <div style="font-size:14px;color:var(--ink-dim);text-transform:uppercase;letter-spacing:.06em;margin:8px 0 2px">Why this path</div>${dec}
      <div style="font-size:14px;color:var(--ink-dim);text-transform:uppercase;letter-spacing:.06em;margin:8px 0 4px">Life events</div>${evs}
      ${seedHtml}
      <div style="margin-top:10px"><button class="btn ghost sm" onclick="cgRollLife()">↻ Reroll the life</button></div></div>`;
  } else {
    lifeSec=`<div class="section"><h3>2 · The Life <span style="color:var(--ink-dim);font-size:14px;letter-spacing:0;text-transform:none">Xanathar's "This Is Your Life"</span></h3>
      <div style="font-size:16px;color:var(--ink-dim);margin-bottom:8px">Roll your past into being — parents, childhood, and the formative events that shaped you. Whatever you roll becomes canon in the world: enemies, lost loves, and the dead are written into the Ledger for your DM to bring back.</div>
      <button class="btn sm ${GS.CGEN.class&&GS.CGEN.background?'primary':'ghost'}" onclick="cgRollLife()">⚅ Roll your life into being</button></div>`;
  }
  /* Step 3 — bind */
  const ready=!!(GS.CGEN.scores&&GS.CGEN.class&&GS.CGEN.background);
  const bindSec=`<div class="section"><h3>3 · Breathe it in</h3>
    <div class="bindbar" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <input id="cgName" type="text" placeholder="Name this soul…" maxlength="40" value="${GS.CGEN.name||''}" oninput="GS.CGEN.name=this.value">
      <span style="font-size:14px;color:var(--ink-dim)">goes by</span>${cgPronounPicker()}
      <button class="btn ghost" onclick="cgCancel()">Cancel</button>
      <button class="btn primary" ${ready?'':'disabled style="opacity:.5;cursor:not-allowed"'} onclick="cgBind()">✦ Breathe this soul into being</button>
    </div>
    ${ready?'':'<div style="font-size:14px;color:var(--ink-dim);margin-top:4px">Choose species, class, background, and roll your scores to continue. The life is optional but recommended.</div>'}</div>`;
  host.innerHTML=sheetSec+lifeSec+bindSec;
}
