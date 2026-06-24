/* GENESIS MODULE — src/creator/bardo.js — the spirit-guide guided creator flow + helpers + renderBardo
   Carved from genesis.html monolith on 2026-06-20 (Pass 7, creator domain). AST-extracted (acorn).
   Classic <script>, shared global scope. Transient state lives in GS (GS.CGEN/GS.BARDO/GS.CG_DRAG); data consts
   (STAGES/WORLDBEATS/GUIDE/LIFE_STEP) live in data/creation-flow.js; read at call-time. */

function buildBardoSeq(){
  // No separate "threshold"/"soul" click-gates — the start screen's "Begin" IS the threshold;
  // we land straight on the first real choice (no "say begin three times"). The escape is the
  // start screen's "return to your worlds". (Playtest 2026-06-21.)
  return [
    {t:"choose",field:"species"},{t:"choose",field:"class"},{t:"choose",field:"background"},{t:"scores"},
    {t:"skills"},{t:"equipment"},{t:"spells"},{t:"feat"},
    {t:"life"},
    {t:"hometown",beat:"setting",id:"place-master-setting",key:"ht_setting"},
    {t:"hometown",beat:"history",id:"place-history",key:"ht_history"},
    {t:"hometown",beat:"myth",id:"place-mythology",key:"ht_myth"},
    ...WORLDBEATS.map(b=>({t:"world",key:b.key,table:b.t,triad:b.triad})),
    {t:"found"}];
}

function bardoRegister(){return Math.min((GS.BARDO&&GS.BARDO.passage)||0,2);}

function guideLine(key){const g=GUIDE[key];return g?g[Math.min(bardoRegister(),g.length-1)]:"";}

function worldsForgedCount(){return Object.keys((typeof U!=="undefined"&&U.worlds)||{}).length;}

function catBand(c){return {"Less Grounded":"Textured","Textured":"Textured","Strange":"Strange","Volatile":"Volatile","Mythic":"Mythic"}[c]||"Grounded";}

function bandOfRolled(res){const order=["Grounded","Textured","Strange","Volatile","Mythic"];
  if(Array.isArray(res))return res.map(p=>catBand(p.cat)).sort((a,b)=>order.indexOf(b)-order.indexOf(a))[0];
  return catBand(res.cat);}

function spinePips(total,now){let s="";for(let k=0;k<total;k++)s+=`<span class="bardo-pip ${k<now?'done':k===now?'now':''}"></span>`;return s;}

function bardoCur(){return GS.BARDO.seq[GS.BARDO.i];}

function bardoSpine(){const ct=["choose","scores","skills","equipment","spells","feat","life","hometown","world"];
  const flat=GS.BARDO.seq.map((b,idx)=>({b,idx})).filter(x=>ct.includes(x.b.t));
  const now=flat.filter(x=>x.idx<GS.BARDO.i).length;return spinePips(flat.length,now);}

function startBardo(){
  GS.CGEN={spawnWhere:null,species:null,class:null,background:null,pronouns:"they",rolledScores:null,scores:null,life:null,name:null,scoreRolls:[],assigned:false,life_origins:false,life_path:false,life_events:false,skills:[],kit:null,cantrips:[],spells:[],scoreBreak:[],featPick:{skills:[],cantrips:[],spells:[]}};
  GS.BARDO={seq:buildBardoSeq(),i:0,rolled:{},rerolls:3,passage:worldsForgedCount()};
  showTab("bardo");renderBardo();
}

function bardoBegin(){GS.BARDO.i=1;renderBardo();}

function bardoAdvance(){if(GS.BARDO.i<GS.BARDO.seq.length-1){GS.BARDO.i++;renderBardo();}}

function bardoBack(){const c=GS.BARDO.seq[GS.BARDO.i];
  if(c&&c.t==="life"&&GS.CGEN.lifeQ&&GS.CGEN.lifeI>0){GS.CGEN.lifeI--;renderBardo();return;}
  if(GS.BARDO.i>0){GS.BARDO.i--;renderBardo();}}

function bardoSetName(v){GS.CGEN.name=v;}

function cgChoose(field,val){GS.CGEN[field]=val;renderBardo();}

function bardoRollScore(){if(GS.CGEN.scoreRolls.length>=6)return;const b=roll4d6breakdown();
  GS.CGEN.scoreRolls.push(b.total);(GS.CGEN.scoreBreak=GS.CGEN.scoreBreak||[]).push(b);
  renderBardo();bardoDieFx(document.getElementById("scoreDie"),"4d6",6);}

function bardoScoreReroll(){if(GS.BARDO.rerolls<=0)return;GS.BARDO.rerolls--;GS.CGEN.scoreRolls=[];GS.CGEN.scoreBreak=[];GS.CGEN.assigned=false;GS.CGEN.scores=null;renderBardo();}

function bardoAssign(mode){GS.CGEN.rolledScores=GS.CGEN.scoreRolls.slice();
  if(mode==="best"){cgAssign();}
  else{const b={};ABIL.forEach((a,i)=>b[a]=GS.CGEN.scoreRolls[i]);GS.CGEN.base=b;cgFinalScores();}
  GS.CGEN.assigned=true;renderBardo();}

function bardoLifeRoll(){cgLifeStepRoll();renderBardo();const lg=GS.CGEN.lifeLog[GS.CGEN.lifeI];bardoDieFx(document.getElementById("lifeDie"),lg.roll,lg.dieMax);}

function bardoLifeReroll(){if(GS.BARDO.rerolls<=0)return;GS.BARDO.rerolls--;GS.CGEN.lifeLog[GS.CGEN.lifeI]=null;bardoLifeRoll();}

function bardoLifeStepNext(){if(GS.CGEN.lifeI<GS.CGEN.lifeQ.length-1){GS.CGEN.lifeI++;renderBardo();}else{GS.CGEN.life_done=true;bardoAdvance();}}

function bardoRollWorld(){const b=bardoCur();GS.BARDO.rolled[b.key]=b.triad?[lookup(b.table),lookup(b.table)]:lookup(b.table);renderBardo(true);bardoFx();}

function bardoWorldReroll(){if(GS.BARDO.rerolls<=0)return;GS.BARDO.rerolls--;bardoRollWorld();}

function bardoRollHometown(){const b=bardoCur();const res=rollTable(b.id);if(!res)return;
  GS.BARDO.rolled[b.key]=res;renderBardo(true);
  bardoDieFx(document.getElementById("hometownDie"),res.total,100,res.band);}

function bardoHometownReroll(){if(GS.BARDO.rerolls<=0)return;GS.BARDO.rerolls--;
  GS.BARDO.rolled[bardoCur().key]=null;bardoRollHometown();}

function htMarkdown(s){return(s||"").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");}

function bardoWake(){const cn=document.getElementById("charName");if(cn&&cn.value.trim())GS.CGEN.name=cn.value.trim();bardoFound();}

function bardoFound(){const f=document.getElementById("wakeFade");if(f)f.classList.add("on");  // black out, then assemble world+soul behind it (§9 waking — no flash)
  GS.SEED=GS.BARDO.rolled;bindWorld();cgBind();GS.BARDO=null;}

function bardoDieFx(el,settle,faceMax,band){dieRoll(el,{result:settle,faces:faceMax||100,band:band});}

function bardoFx(){const die=document.getElementById("bardoDie");if(!die)return;
  const b=bardoCur(),res=GS.BARDO.rolled[b.key],roll=Array.isArray(res)?res[0].roll:res.roll,max=+die.dataset.die||100;
  dieRoll(die,{result:roll,faces:max,band:bandOfRolled(res)});}

function bardoRollName(){const el=document.getElementById("worldName");if(el)el.value=randomWorldName();}

function bardoRollCharName(){const el=document.getElementById("charName");if(el)el.value=randomCharName(GS.CGEN&&GS.CGEN.species);}

/* Spell full-text tooltip — a single fixed element positioned beside the hovered card and CLAMPED
   to the viewport, so the whole spell is always readable (the CSS hover-popover kept clipping long
   spells like Unseen Servant off the bottom edge). Reads the card's hidden .opt-full text. */
function showSpellTip(card){
  const tip=document.getElementById("spellTip"),full=card.querySelector(".opt-full");
  if(!tip||!full)return;
  tip.textContent=full.textContent;tip.style.display="block";
  const r=card.getBoundingClientRect(),tw=320,vw=window.innerWidth,vh=window.innerHeight,m=12;
  let left=r.right+8;if(left+tw>vw-m)left=r.left-tw-8;if(left<m)left=m;   // prefer right of the card, else left
  tip.style.left=left+"px";tip.style.maxHeight=(vh-2*m)+"px";
  const th=tip.offsetHeight;let top=r.top;if(top+th>vh-m)top=Math.max(m,vh-m-th);
  tip.style.top=top+"px";
}
function hideSpellTip(){const t=document.getElementById("spellTip");if(t)t.style.display="none";}

function bardoLog(){
  const rows=[];
  if(GS.CGEN&&GS.CGEN.name)rows.push(["Soul",GS.CGEN.name]);
  if(GS.CGEN&&GS.CGEN.species)rows.push(["Kind",GS.CGEN.species]);
  if(GS.CGEN&&GS.CGEN.class)rows.push(["Calling",GS.CGEN.class]);
  if(GS.CGEN&&GS.CGEN.background)rows.push(["Background",GS.CGEN.background]);
  if(GS.CGEN&&GS.CGEN.skills&&GS.CGEN.skills.length)rows.push(["Skills",GS.CGEN.skills.join(", ")]);
  if(GS.CGEN&&GS.CGEN.kit){const k=(typeof CLASS_KIT!=="undefined"&&CLASS_KIT[GS.CGEN.class]||[]).find(o=>o.id===GS.CGEN.kit);if(k)rows.push(["Kit","Option "+k.id]);}
  if(GS.CGEN&&((GS.CGEN.cantrips&&GS.CGEN.cantrips.length)||(GS.CGEN.spells&&GS.CGEN.spells.length)))rows.push(["Spells",[].concat(GS.CGEN.cantrips||[],GS.CGEN.spells||[]).join(", ")]);
  if(GS.CGEN&&GS.CGEN.featPick){const fp=GS.CGEN.featPick,fb=[].concat(fp.skills||[],fp.cantrips||[],fp.spells||[]);if(fb.length)rows.push(["Feat",fb.join(", ")]);}
  if(GS.CGEN&&GS.CGEN.scores){const top=ABIL.slice().sort((a,b)=>GS.CGEN.scores[b]-GS.CGEN.scores[a])[0];rows.push(["Body",`${ABIL_LABEL[top]} ${GS.CGEN.scores[top]} strongest`]);}
  // the "This Is Your Life" chain — each roll shown as it lands (not a buried summary)
  if(GS.CGEN&&GS.CGEN.lifeLog&&GS.CGEN.lifeLog.some(Boolean)){
    GS.CGEN.lifeLog.forEach(l=>{if(l&&l.text)rows.push([l.label,l.text]);});
  } else if(GS.CGEN&&GS.CGEN.life&&GS.CGEN.life.events&&GS.CGEN.life.events.length){
    rows.push(["Life",GS.CGEN.life.events.map(e=>e.hook).slice(0,3).join("; ")]);
  }
  const htLabels={ht_setting:"Hometown",ht_history:"Founded",ht_myth:"Town Myth"};
  ["ht_setting","ht_history","ht_myth"].forEach(k=>{if(GS.BARDO.rolled[k]){
    const r=GS.BARDO.rolled[k],txt=(r.text||"").replace(/\*\*([^*]+)\*\*/g,"$1");
    rows.push([htLabels[k],txt.slice(0,72)+(txt.length>72?"…":"")]);
  }});
  WORLDBEATS.forEach(b=>{if(GS.BARDO.rolled[b.key]){const r=GS.BARDO.rolled[b.key],fr=Array.isArray(r)?r.map(p=>p.frag||p.name).join("; "):(r.frag||r.name);rows.push([T[b.t].label,fr]);}});
  if(!rows.length)return"";
  return `<div class="bardo-log">${rows.map(r=>`<div class="bardo-log-row"><span class="bardo-log-cat">${r[0]}</span><span class="bardo-log-frag">${r[1]}</span></div>`).join("")}</div>`;}

/* ---- creator steps: skills / equipment / spells (SRD-walked choices, each with a "choose for me") ---- */
function creatorSpells(listKey,level){return (typeof SPELLS_SLIM!=="undefined"?SPELLS_SLIM:[]).filter(s=>s.level===level&&s.classes.indexOf(listKey)>=0);}

/* class skills the player may pick, minus any the background already grants (2024 no-duplicate rule) */
function cgSkillOpen(){const cs=(typeof CLASS_SKILLS!=="undefined")&&CLASS_SKILLS[GS.CGEN.class];if(!cs)return{n:0,opts:[],have:[]};
  const bgSk=(BACKGROUNDS[GS.CGEN.background]||{}).skills||[];
  const all=cs.from==="all"?ALL_SKILLS:cs.from;
  return{n:cs.n,opts:all.filter(s=>bgSk.indexOf(s)<0),have:bgSk};}
function cgSkillToggle(s){const cs=cgSkillOpen(),arr=GS.CGEN.skills,i=arr.indexOf(s);
  if(i>=0)arr.splice(i,1);else if(arr.length<cs.n)arr.push(s);renderBardo();}
function cgSkillAuto(){const cs=cgSkillOpen();GS.CGEN.skills=cs.opts.slice(0,cs.n);renderBardo();}

function cgKitPick(id){GS.CGEN.kit=id;renderBardo();}
function cgKitAuto(){const k=(typeof CLASS_KIT!=="undefined")&&CLASS_KIT[GS.CGEN.class];GS.CGEN.kit=k?k[0].id:null;renderBardo();}

function cgSpellToggle(name,level){const cap=(typeof CLASS_CASTING!=="undefined")&&CLASS_CASTING[GS.CGEN.class];if(!cap)return;
  const arr=level===0?GS.CGEN.cantrips:GS.CGEN.spells,max=level===0?cap.cantrips:cap.spells,i=arr.indexOf(name);
  if(i>=0)arr.splice(i,1);else if(arr.length<max)arr.push(name);renderBardo();}
function cgSpellsAuto(){const cap=(typeof CLASS_CASTING!=="undefined")&&CLASS_CASTING[GS.CGEN.class];if(!cap)return;
  GS.CGEN.cantrips=creatorSpells(cap.list,0).slice(0,cap.cantrips).map(s=>s.name);
  GS.CGEN.spells=creatorSpells(cap.list,1).slice(0,cap.spells).map(s=>s.name);renderBardo();}

/* origin feat (from background) — present + resolve any choice it carries */
function cgFeatDef(){const f=(BACKGROUNDS[GS.CGEN.background]||{}).feat;return{name:f,def:(typeof ORIGIN_FEATS!=="undefined"&&ORIGIN_FEATS[f])||null};}
function cgFeatSkillOpts(){const bg=BACKGROUNDS[GS.CGEN.background]||{};const used=[].concat(bg.skills||[],GS.CGEN.skills||[]);return ALL_SKILLS.filter(s=>used.indexOf(s)<0);}
function cgFeatSkill(s){const f=cgFeatDef();if(!f.def||!f.def.choose||f.def.choose.kind!=="skills")return;
  const arr=GS.CGEN.featPick.skills,i=arr.indexOf(s);if(i>=0)arr.splice(i,1);else if(arr.length<f.def.choose.n)arr.push(s);renderBardo();}
function cgFeatSpellToggle(name,level){const f=cgFeatDef();if(!f.def||!f.def.choose||f.def.choose.kind!=="magic")return;
  const c=f.def.choose,arr=level===0?GS.CGEN.featPick.cantrips:GS.CGEN.featPick.spells,max=level===0?c.cantrips:c.spells,i=arr.indexOf(name);
  if(i>=0)arr.splice(i,1);else if(arr.length<max)arr.push(name);renderBardo();}
function cgFeatAuto(){const f=cgFeatDef();if(!f.def||!f.def.choose)return;const c=f.def.choose;
  if(c.kind==="skills")GS.CGEN.featPick.skills=cgFeatSkillOpts().slice(0,c.n);
  else if(c.kind==="magic"){GS.CGEN.featPick.cantrips=creatorSpells(c.list,0).slice(0,c.cantrips).map(s=>s.name);
    GS.CGEN.featPick.spells=creatorSpells(c.list,1).slice(0,c.spells).map(s=>s.name);}
  renderBardo();}

function renderBardo(animate){
  const host=document.getElementById("bardoView");if(!host||!GS.BARDO)return;
  const cur=bardoCur(),t=cur.t;
  const rrBtn=(fn)=>`<button class="btn ghost sm" onclick="${fn}" ${GS.BARDO.rerolls>0?'':'disabled style="opacity:.4;cursor:not-allowed"'}>↩ turn back</button><span class="bardo-rr">${GS.BARDO.rerolls} left</span>`;
  const backBtn=GS.BARDO.i>0?`<button class="btn ghost" onclick="bardoBack()">↩</button>`:"";
  const shell=(inner,key)=>{const log=bardoLog();
    return `<div class="bardo-layout"><div class="bardo" id="bardoCard"><div class="bardo-spine">${bardoSpine()}</div>${key?`<div class="bardo-guide">${guideLine(key)}</div>`:""}${inner}</div>`+
      (log?`<aside class="bardo-aside"><div class="ba-title">So far</div>${log}</aside>`:"")+`</div>`;};

  if(t==="threshold"){
    host.innerHTML=`<div class="bardo"><div class="bardo-guide">${guideLine("threshold")}</div>
      <div class="bardo-nav"><button class="btn primary" onclick="bardoBegin()">Begin</button>
        <button class="btn ghost" onclick="showTab('universe')">Not yet</button></div></div>`;return;}

  if(t==="soul"){
    host.innerHTML=shell(`<div class="bardo-nav">${backBtn}<button class="btn primary" onclick="bardoAdvance()">Take shape →</button></div>`,"soul");
    return;}

  if(t==="choose"){
    const field=cur.field,src=field==="species"?SPECIES:field==="class"?CLASSES:BACKGROUNDS;
    const opts=Object.keys(src).map(k=>`<button class="bardo-opt ${GS.CGEN[field]===k?'sel':''}" onclick="cgChoose('${field}','${k.replace(/'/g,"\\'")}')"><span class="opt-title">${k}</span>${(TIP[field]&&TIP[field][k])?`<span class="opt-desc">${TIP[field][k]}</span>`:""}</button>`).join("");
    const next=GS.CGEN[field]?`<button class="btn primary" onclick="bardoAdvance()">Next →</button>`:"";
    host.innerHTML=shell(`<div class="bardo-opts grid">${opts}</div><div class="bardo-nav">${backBtn}${next}</div>`,field);
    return;}

  if(t==="scores"){
    const brk=GS.CGEN.scoreBreak||[];
    const slots=ABIL.map((a,idx)=>{const v=GS.CGEN.scoreRolls[idx];
      return `<div class="score-slot ${v?'filled':''}"><div class="score-ab">${ABIL_LABEL[a]}</div><div class="score-val">${v||"—"}</div>${v?miniDice(brk[idx]):""}</div>`;}).join("");
    let action;
    if(GS.CGEN.scoreRolls.length<6){
      action=`<div class="bardo-die" id="scoreDie" onclick="bardoRollScore()">4d6</div><div class="bardo-dienote">roll 4d6, drop the lowest — ${GS.CGEN.scoreRolls.length}/6</div>`;
    }else if(!GS.CGEN.assigned){
      action=`<div class="bardo-dienote">six rolled. how do they fall?</div>
        <div class="bardo-nav"><button class="btn primary" onclick="bardoAssign('best')">Best for ${GS.CGEN.class||'class'}</button>
          <button class="btn ghost" onclick="bardoAssign('rolled')">As they fell</button></div>`;
    }else{
      const d=cgDerived();
      action=`<div class="bardo-frag" style="opacity:1;font-size:18px">${ABIL.map(a=>`${ABIL_LABEL[a]} <strong style="color:var(--bone)">${GS.CGEN.scores[a]}</strong>`).join(" · ")}<span class="bardo-dienote" style="display:block;margin-top:6px">HP ${d.hp} · AC ${d.ac}</span></div>
        <div class="bardo-nav">${backBtn}${rrBtn("bardoScoreReroll()")}<button class="btn primary" onclick="bardoAdvance()">Next →</button></div>`;
    }
    const navTop=GS.CGEN.scoreRolls.length<6?`<div class="bardo-nav" style="margin-top:10px">${backBtn}${GS.CGEN.scoreRolls.length?rrBtn("bardoScoreReroll()"):""}</div>`:"";
    host.innerHTML=shell(`<div class="score-row">${slots}</div>${action}${navTop}`,"scores");
    return;}

  if(t==="skills"){
    const cs=cgSkillOpen();
    if(!cs.opts.length){host.innerHTML=shell(`<div class="bardo-dienote">No skill choices for this calling.</div><div class="bardo-nav">${backBtn}<button class="btn primary" onclick="bardoAdvance()">Next →</button></div>`,"skills");return;}
    const chosen=GS.CGEN.skills,done=chosen.length===cs.n;
    const opts=cs.opts.map(s=>{const sel=chosen.indexOf(s)>=0,full=chosen.length>=cs.n&&!sel;
      return `<button class="bardo-opt ${sel?'sel':''}" ${full?'disabled':''} onclick="cgSkillToggle('${s.replace(/'/g,"\\'")}')"><span class="opt-title">${s}</span></button>`;}).join("");
    const have=cs.have.length?`<div class="bardo-dienote">Already yours, from your background: ${cs.have.join(", ")}</div>`:"";
    const head=`<div class="bardo-beat">Choose ${cs.n} · ${chosen.length}/${cs.n}</div>`;
    const nav=`<div class="bardo-nav">${backBtn}<button class="btn ghost sm" onclick="cgSkillAuto()">🎲 choose for me</button>${done?`<button class="btn primary" onclick="bardoAdvance()">Next →</button>`:""}</div>`;
    host.innerHTML=shell(`${head}${have}<div class="bardo-opts grid">${opts}</div>${nav}`,"skills");return;}

  if(t==="equipment"){
    const kit=(typeof CLASS_KIT!=="undefined"&&CLASS_KIT[GS.CGEN.class])||[];
    if(!kit.length){host.innerHTML=shell(`<div class="bardo-dienote">No starting kit for this calling.</div><div class="bardo-nav">${backBtn}<button class="btn primary" onclick="bardoAdvance()">Next →</button></div>`,"equipment");return;}
    const opts=kit.map(o=>{const sel=GS.CGEN.kit===o.id;
      const desc=o.items.length?o.items.join(", ")+` · ${o.gp} GP`:`${o.gp} GP — buy your own gear`;
      return `<button class="bardo-opt ${sel?'sel':''}" onclick="cgKitPick('${o.id}')"><span class="opt-title">Option ${o.id}</span><span class="opt-desc">${escHtml(desc)}</span></button>`;}).join("");
    const done=!!GS.CGEN.kit;
    const nav=`<div class="bardo-nav">${backBtn}<button class="btn ghost sm" onclick="cgKitAuto()">🎲 choose for me</button>${done?`<button class="btn primary" onclick="bardoAdvance()">Next →</button>`:""}</div>`;
    host.innerHTML=shell(`<div class="bardo-opts grid">${opts}</div>${nav}`,"equipment");return;}

  if(t==="spells"){
    const cap=(typeof CLASS_CASTING!=="undefined")&&CLASS_CASTING[GS.CGEN.class];
    if(!cap){host.innerHTML=shell(`<div class="bardo-dienote">Your calling channels no spells at level 1.</div><div class="bardo-nav">${backBtn}<button class="btn primary" onclick="bardoAdvance()">Next →</button></div>`,"spells");return;}
    const grp=(title,list,level,chosen,max)=> max<=0?"":`<div class="bardo-beat" style="margin-top:8px">${title} · ${chosen.length}/${max}</div><div class="bardo-opts grid">`+
      list.map(s=>{const sel=chosen.indexOf(s.name)>=0,full=chosen.length>=max&&!sel;
        return `<button class="bardo-opt spell-opt ${sel?'sel':''}" ${full?'disabled':''} onclick="cgSpellToggle('${s.name.replace(/'/g,"\\'")}',${level})" onmouseenter="showSpellTip(this)" onmouseleave="hideSpellTip()" onfocus="showSpellTip(this)" onblur="hideSpellTip()">`+
          `<span class="opt-title">${s.name}</span>`+
          `<span class="opt-meta">${level===0?'Cantrip':'Level 1'}${s.school?' · '+s.school:''}</span>`+
          `<span class="opt-desc">${escHtml(s.flavor||'')}</span>`+
          (s.text?`<span class="opt-full">${escHtml(s.text)}</span>`:'')+
        `</button>`;}).join("")+`</div>`;
    const cBlock=grp("Cantrips",creatorSpells(cap.list,0),0,GS.CGEN.cantrips,cap.cantrips);
    const sBlock=grp(cap.term==="spellbook"?"Spellbook (level 1)":"Level-1 spells",creatorSpells(cap.list,1),1,GS.CGEN.spells,cap.spells);
    const done=GS.CGEN.cantrips.length===cap.cantrips&&GS.CGEN.spells.length===cap.spells;
    const nav=`<div class="bardo-nav">${backBtn}<button class="btn ghost sm" onclick="cgSpellsAuto()">🎲 choose for me</button>${done?`<button class="btn primary" onclick="bardoAdvance()">Next →</button>`:""}</div>`;
    host.innerHTML=shell(`${cBlock}${sBlock}${nav}`,"spells");return;}

  if(t==="feat"){
    const f=cgFeatDef();
    if(!f.name||!f.def){host.innerHTML=shell(`<div class="bardo-dienote">No origin feat for this background.</div><div class="bardo-nav">${backBtn}<button class="btn primary" onclick="bardoAdvance()">Next →</button></div>`,"feat");return;}
    const head=`<div class="bardo-beat">${f.name}</div><div class="bardo-frag" style="opacity:1;font-size:18px">${f.def.blurb}</div>`;
    let body="",done=true,auto="";
    const ch=f.def.choose;
    if(ch&&ch.kind==="skills"){
      const opts=cgFeatSkillOpts(),chosen=GS.CGEN.featPick.skills;done=chosen.length===ch.n;auto=`<button class="btn ghost sm" onclick="cgFeatAuto()">🎲 choose for me</button>`;
      const list=opts.map(s=>{const sel=chosen.indexOf(s)>=0,full=chosen.length>=ch.n&&!sel;
        return `<button class="bardo-opt ${sel?'sel':''}" ${full?'disabled style="opacity:.4"':''} onclick="cgFeatSkill('${s.replace(/'/g,"\\'")}')">${s}</button>`;}).join("");
      body=`<div class="bardo-beat" style="margin-top:8px">Choose ${ch.n} · ${chosen.length}/${ch.n}</div><div class="bardo-opts">${list}</div>`;
    }else if(ch&&ch.kind==="magic"){
      auto=`<button class="btn ghost sm" onclick="cgFeatAuto()">🎲 choose for me</button>`;
      const grp=(title,arr2,level,chosen,max)=>`<div class="bardo-beat" style="margin-top:8px">${title} · ${chosen.length}/${max}</div><div class="bardo-opts">`+
        arr2.map(s=>{const sel=chosen.indexOf(s.name)>=0,full=chosen.length>=max&&!sel;
          return `<button class="bardo-opt ${sel?'sel':''}" ${full?'disabled style="opacity:.4"':''} onclick="cgFeatSpellToggle('${s.name.replace(/'/g,"\\'")}',${level})" title="${(s.flavor||'').replace(/"/g,'&quot;')}">${s.name}</button>`;}).join("")+`</div>`;
      const cB=grp("Cantrips",creatorSpells(ch.list,0),0,GS.CGEN.featPick.cantrips,ch.cantrips);
      const sB=grp("Level-1 spell",creatorSpells(ch.list,1),1,GS.CGEN.featPick.spells,ch.spells);
      done=GS.CGEN.featPick.cantrips.length===ch.cantrips&&GS.CGEN.featPick.spells.length===ch.spells;
      body=`${cB}${sB}`;
    }
    const nav=`<div class="bardo-nav">${backBtn}${auto}${done?`<button class="btn primary" onclick="bardoAdvance()">Next →</button>`:""}</div>`;
    host.innerHTML=shell(`${head}${body}${nav}`,"feat");return;}

  if(t==="life"){
    if(!GS.CGEN.lifeQ)cgLifeBegin();
    const i=GS.CGEN.lifeI,key=GS.CGEN.lifeQ[i],meta=LIFE_STEP[key],rolled=!!GS.CGEN.lifeLog[i],die=lifeDieLabel(key);
    const stepNo=i+1,stepTot=GS.CGEN.lifeQ.length;
    let body;
    if(!rolled){
      body=`<div class="bardo-beat">${meta.label} · ${stepNo}/${stepTot}</div>
        <div class="bardo-die" id="lifeDie" onclick="bardoLifeRoll()">${die}</div><div class="bardo-dienote">${meta.guide}</div>
        <div class="bardo-nav">${backBtn}</div>`;
    }else{
      const last=i>=GS.CGEN.lifeQ.length-1;
      body=`<div class="bardo-beat">${meta.label} · ${stepNo}/${stepTot}</div>
        <div class="bardo-die done" id="lifeDie">${GS.CGEN.lifeLog[i].roll}</div>
        <div class="bardo-frag" style="opacity:1;font-size:20px">${GS.CGEN.lifeLog[i].text}</div>
        <div class="bardo-nav">${backBtn}${rrBtn("bardoLifeReroll()")}<button class="btn primary" onclick="bardoLifeStepNext()">${last?'Onward →':'Next →'}</button></div>`;
    }
    host.innerHTML=shell(body,null);return;}

  if(t==="hometown"){
    const res=GS.BARDO.rolled[cur.key],rolled=!!res;
    const beatLabel={setting:"Your hometown",history:"How it began",myth:"What they believe"}[cur.beat]||cur.beat;
    let body;
    if(!rolled){
      body=`<div class="bardo-beat">${beatLabel}</div>
        <div class="bardo-die" id="hometownDie" onclick="bardoRollHometown()">d100</div>
        <div class="bardo-dienote">roll to discover</div>
        <div class="bardo-nav">${backBtn}</div>`;
    }else{
      const txt=htMarkdown(res.text||"");
      body=`<div class="bardo-beat">${beatLabel}</div>
        <div class="bardo-die done" id="hometownDie">${res.total}</div>
        <div class="bardo-frag ${animate?"show":""}" id="bardoFrag" ${animate?"":"style=\"opacity:1\""}>${txt}</div>
        <div class="bardo-nav">${backBtn}${rrBtn("bardoHometownReroll()")}<button class="btn primary" onclick="bardoAdvance()">Next →</button></div>`;
    }
    host.innerHTML=shell(body,cur.key);return;}

  if(t==="world"){
    const res=GS.BARDO.rolled[cur.key],rolled=!!res,dieN=T[cur.table].die;
    let dieHtml,fragHtml="";
    if(rolled){
      const fr=Array.isArray(res)?res.map(p=>p.frag||p.name).join("<br>"):(res.frag||res.name);
      const roll=Array.isArray(res)?res[0].roll:res.roll;
      dieHtml=`<div class="bardo-die done" id="bardoDie" data-die="${dieN}">${roll}</div>`;
      fragHtml=`<div class="bardo-frag ${animate?'show':''}" id="bardoFrag" ${animate?'':'style="opacity:1"'}>${fr}</div>`;
    }else dieHtml=`<div class="bardo-die" id="bardoDie" data-die="${dieN}" onclick="bardoRollWorld()">d${dieN}</div><div class="bardo-dienote">click to roll</div>`;
    const nav=`<div class="bardo-nav">${backBtn}${rolled?rrBtn("bardoWorldReroll()"):""}${rolled?`<button class="btn primary" onclick="bardoAdvance()">Next →</button>`:""}</div>`;
    host.innerHTML=shell(`<div class="bardo-beat">${T[cur.table].label}</div>${dieHtml}${fragHtml}${nav}`,cur.key);  // use the shared two-column shell so the layout doesn't revert
    return;}

  if(t==="found"){
    const ist="width:100%;max-width:320px;margin:2px auto;box-sizing:border-box;padding:9px 12px;text-align:center;background:var(--vellum-2);border:1px solid var(--edge);border-radius:8px;color:var(--bone);font-size:20px";
    host.innerHTML=shell(`
      <div class="bardo-namelbl">the soul, now that you know it, is called…</div>
      <input id="charName" type="text" placeholder="a name for the soul…" maxlength="40" value="${GS.CGEN.name||""}" style="${ist}">
      <div><button class="btn ghost sm" onclick="bardoRollCharName()">🎲 name the soul for me</button></div>
      <div class="bardo-namelbl" style="margin-top:12px">…and goes by</div>
      <div>${cgPronounPicker()}</div>
      <div class="bardo-namelbl" style="margin-top:12px">…and the world it falls toward,</div>
      <input id="worldName" type="text" placeholder="a name for the world…" maxlength="40" style="${ist}">
      <div><button class="btn ghost sm" onclick="bardoRollName()">🎲 name the world for me</button></div>
      <div class="bardo-nav">${backBtn}<button class="btn ghost" onclick="bankSoul()">↯ Bank as a Wandering Soul</button><button class="btn primary" onclick="bardoWake()">✦ Open your eyes (play this one)</button></div>`,"found");
    return;}
}
