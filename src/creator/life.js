/* GENESIS MODULE — src/creator/life.js — the Life chain (lookups, person-desc, origins/path/events, headline, seedFromLife)
   Carved from genesis.html monolith on 2026-06-20 (Pass 7, creator domain). AST-extracted (acorn).
   Classic <script>, shared global scope. Transient state lives in GS (GS.CGEN/GS.BARDO/GS.CG_DRAG); data consts
   (STAGES/WORLDBEATS/GUIDE/LIFE_STEP) stay app-owned in genesis.html; referenced at call-time. */

function cgRollN(n,sides){let t=0;for(let i=0;i<n;i++)t+=rollDie(sides);return t;}

function cgLookup(key,mod){const tb=CG[key];const n=tb.d||1;const base=cgRollN(n,tb.die);const total=base+(mod||0);
  let row=tb.rows.find(r=>total>=r[0]&&total<=r[1]);if(!row)row=tb.rows[tb.rows.length-1];
  const extra=row[3];return {roll:base,total,text:row[2],tag:(typeof extra==="string"?extra:""),mod:(typeof extra==="number"?extra:0)};}

function parseCount(str){const m=/(\d+)d(\d+)(?:\+(\d+))?/.exec(str);if(!m)return parseInt(str)||0;
  let t=0,n=+m[1],s=+m[2];for(let i=0;i<n;i++)t+=rollDie(s);return t+(m[3]?+m[3]:0);}

function cgPersonDesc(){let occ=cgLookup("occupation").text;
  if(occ==="Adventurer"||/\(roll/i.test(occ))occ=cgLookup("npcClass").text;  // "Wanderer (roll Kind & calling again)" → roll a class now
  const race=cgLookup("race").text,rel=cgLookup("relationship").text,st=cgLookup("status");
  return `a ${race.toLowerCase()} ${occ.toLowerCase()}, ${rel}, ${st.text}`;}

/* Resolve inline dice in a life-event line AT ROLL TIME — roll each NdM(+K), substitute the rolled
   value into the text, and total any "gp" so starting gold reflects the life lived. Returns {text, gp}.
   (Resolve once when the event is rolled, never on re-render, or the numbers would change.) */
function cgResolveInlineDice(str){
  if(!str)return{text:str||"",gp:0};let gp=0;
  const text=str.replace(/(\+?)\s*(\d+d\d+(?:\+\d+)?)(\s*gp)?/gi,(m,plus,dice,gpu)=>{
    const r=parseCount(dice);if(gpu){gp+=r;return(plus||"")+r+gpu;}return(plus||"")+r;});
  return{text,gp};}

/* Build one resolved life event from a lifeEvents roll — people/threads seeds + sub-table detail,
   inline dice rolled, gp banked into GS.CGEN.lifeGold. The single source for all three life paths. */
function cgMakeEvent(ev){
  const seeds=[];let detail="";const tag=ev.tag;
  if(tag==="enemy"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"An enemy made in the past",desc:p});detail=`Your enemy is ${p}.`;}
  else if(tag==="friend"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"A friend from the past",desc:p});detail=`Your friend is ${p}.`;}
  else if(tag==="important"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"Someone important you met",desc:p});detail=`They are ${p}.`;}
  else if(tag==="love"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"A love or spouse",desc:p});detail=`Your love is ${p}.`;}
  else if(tag&&CG[tag]){const sec=cgLookup(tag);detail=sec.text+cgHandleSec(sec,seeds);
    if(tag==="crime"){const pun=cgLookup("punishment");detail=`${sec.text} — ${pun.text}`;if(pun.tag==="wanted")seeds.push({kind:"thread",text:`Wanted for ${sec.text.toLowerCase()} where the crime occurred`});}}
  const rs=cgResolveInlineDice(ev.text),rd=cgResolveInlineDice(detail);
  const gp=rs.gp+rd.gp;if(gp)GS.CGEN.lifeGold=(GS.CGEN.lifeGold||0)+gp;
  const summary=rs.text,hook=summary.replace(/^You /,"").replace(/\.$/,"").toLowerCase();
  return{roll:ev.total,summary,detail:rd.text,hook,seeds};}

function cgRollLife(){
  if(!GS.CGEN.class||!GS.CGEN.background){toast("Choose a class & background first");return;}
  const chaM=abilMod((GS.CGEN.scores&&GS.CGEN.scores.cha)||10);
  const L={origins:{},decisions:{},events:[],age:""};const O=L.origins;
  O.parents=cgLookup("parents");
  O.birthplace=cgLookup("birthplace");
  const sn=cgLookup("siblingsNum");const sc=sn.text==="None"?0:parseCount(sn.text);
  O.siblings={text:sn.text,count:sc,birthOrder:sc>0?cgLookup("birthOrder").text:null};
  const fam=cgLookup("family");O.family=fam;
  if(O.parents.total<=95&&fam.text!=="Mother and father")O.absent=cgLookup("absentParent");
  const ls=cgLookup("lifestyle");O.lifestyle=ls;
  O.childhoodHome=cgLookup("childhoodHome",ls.mod);
  O.childhoodMemory=cgLookup("childhoodMemory",chaM);
  const bgRoll=rollDie(6),clRoll=rollDie(6);
  L.decisions.background={roll:bgRoll,text:CG_BG[GS.CGEN.background][bgRoll-1]};
  L.decisions.classTraining={roll:clRoll,text:CG_CLASS[GS.CGEN.class][clRoll-1]};
  GS.CGEN.lifeGold=0;
  const age=cgLookup("lifeByAge");L.age=age.text;
  const num=Math.max(1,parseCount(age.tag));
  for(let i=0;i<num;i++)L.events.push(cgMakeEvent(cgLookup("lifeEvents")));
  GS.CGEN.life=L;renderCharge();
}

function cgHandleSec(sec,seeds){const t=sec.tag;
  if(t==="death"){const cod=cgLookup("causeOfDeath");seeds.push({kind:"npc",role:"A loved one, lost",desc:`now dead — ${cod.text.toLowerCase()}`});return ` (cause of death: ${cod.text})`;}
  if(t==="lostlove"){seeds.push({kind:"npc",role:"A vanished lover",desc:"disappeared without a trace"});seeds.push({kind:"thread",text:"Searching for a lover who vanished without a trace"});}
  else if(t==="lifedebt")seeds.push({kind:"npc",role:"A life-debt companion",desc:cgPersonDesc()});
  else if(t==="wanted")seeds.push({kind:"thread",text:"Wanted by the authorities where the crime occurred"});
  else if(t==="thread")seeds.push({kind:"thread",text:sec.text});
  else if(t==="hostile")seeds.push({kind:"npc",role:"A former friend, now hostile",desc:cgPersonDesc()});
  else if(t==="important")seeds.push({kind:"npc",role:"A former employer",desc:cgPersonDesc()});
  else if(t==="enemy")seeds.push({kind:"npc",role:"An enemy made",desc:cgPersonDesc()});
  return "";
}

function cgLifeInit(){if(!GS.CGEN.life)GS.CGEN.life={origins:{},decisions:{},events:[],age:""};}

function cgLifeOrigins(){cgLifeInit();const chaM=abilMod((GS.CGEN.scores&&GS.CGEN.scores.cha)||10);const O=GS.CGEN.life.origins;
  O.parents=cgLookup("parents");O.birthplace=cgLookup("birthplace");
  const sn=cgLookup("siblingsNum");const sc=sn.text==="None"?0:parseCount(sn.text);
  O.siblings={text:sn.text,count:sc,birthOrder:sc>0?cgLookup("birthOrder").text:null};
  const fam=cgLookup("family");O.family=fam;
  if(O.parents.total<=95&&fam.text!=="Mother and father")O.absent=cgLookup("absentParent");
  const ls=cgLookup("lifestyle");O.lifestyle=ls;
  O.childhoodHome=cgLookup("childhoodHome",ls.mod);O.childhoodMemory=cgLookup("childhoodMemory",chaM);}

function cgLifePath(){cgLifeInit();const bgRoll=rollDie(6),clRoll=rollDie(6);
  GS.CGEN.life.decisions.background={roll:bgRoll,text:CG_BG[GS.CGEN.background][bgRoll-1]};
  GS.CGEN.life.decisions.classTraining={roll:clRoll,text:CG_CLASS[GS.CGEN.class][clRoll-1]};}

function cgLifeEvents(){cgLifeInit();const L=GS.CGEN.life;L.events=[];GS.CGEN.lifeGold=0;
  const age=cgLookup("lifeByAge");L.age=age.text;const num=Math.max(1,parseCount(age.tag));
  for(let i=0;i<num;i++)L.events.push(cgMakeEvent(cgLookup("lifeEvents")));}

function cgHeadline(c){const ev=c.life&&c.life.events&&c.life.events[0];const hook=ev?ev.hook:"";
  return `a ${c.sheet.background} ${c.sheet.species} ${c.sheet.class}${hook?` who ${hook}`:""}`;}

function seedFromLife(w,c){const ids=[];if(!c.life)return ids;
  (c.life.events||[]).forEach(ev=>(ev.seeds||[]).forEach(sd=>{
    if(sd.kind==="npc"){const e=addLedger(w,"npc-life",{role:sd.role,desc:sd.desc,fromChar:c.id,source:"char-genesis"},
        `From ${c.name}'s past — ${sd.role.toLowerCase()}: ${sd.desc}.`);
      w.gazetteer.push({type:"NPC",name:sd.role,desc:`${sd.desc} — from ${c.name}'s past.`,cat:"",discoveredAt:Date.now()});ids.push(e.id);}
    else if(sd.kind==="thread"){const e=addLedger(w,"canon",{kind:"thread",text:sd.text,fromChar:c.id,source:"char-genesis"},
        `Open thread (from ${c.name}'s past) — ${sd.text}.`);ids.push(e.id);}
  }));return ids;}

function lifeDieLabel(key){const m=LIFE_STEP[key];return "d"+(m.die||(CG[m.tbl]?CG[m.tbl].die:100));}

function cgLifeBegin(){
  GS.CGEN.life={origins:{},decisions:{},events:[],age:""};GS.CGEN.lifeGold=0;
  GS.CGEN.lifeLog=[];GS.CGEN.lifeI=0;GS.CGEN.lifeExpanded={};
  GS.CGEN.lifeQ=["parents","birthplace","siblings","family","lifestyle","childhoodHome","childhoodMemory","bgDecision","classTraining","age"];
}

function cgLifeStepRoll(){
  const i=GS.CGEN.lifeI,key=GS.CGEN.lifeQ[i];if(GS.CGEN.lifeLog[i])return;
  const O=GS.CGEN.life.origins,chaM=abilMod((GS.CGEN.scores&&GS.CGEN.scores.cha)||10);let text="",roll=null;
  if(key==="parents"){O.parents=cgLookup("parents");roll=O.parents.roll;text=O.parents.total>95?"your parentage is unknown":O.parents.text;}
  else if(key==="birthplace"){O.birthplace=cgLookup("birthplace");roll=O.birthplace.roll;text=O.birthplace.text;}
  else if(key==="siblings"){const sn=cgLookup("siblingsNum");roll=sn.roll;const sc=sn.text==="None"?0:parseCount(sn.text);O.siblings={text:sn.text,count:sc,birthOrder:null};text=sn.text;if(sc>0&&!GS.CGEN.lifeExpanded.sib){GS.CGEN.lifeQ.splice(i+1,0,"birthOrder");GS.CGEN.lifeExpanded.sib=1;}}
  else if(key==="birthOrder"){const bo=cgLookup("birthOrder");roll=bo.roll;O.siblings.birthOrder=bo.text;text=bo.text;}
  else if(key==="family"){O.family=cgLookup("family");roll=O.family.roll;text=O.family.text;if(!GS.CGEN.lifeExpanded.abs&&O.parents&&O.parents.total<=95&&O.family.text!=="Mother and father"){GS.CGEN.lifeQ.splice(i+1,0,"absentParent");GS.CGEN.lifeExpanded.abs=1;}}
  else if(key==="absentParent"){O.absent=cgLookup("absentParent");roll=O.absent.roll;text=O.absent.text;}
  else if(key==="lifestyle"){O.lifestyle=cgLookup("lifestyle");roll=O.lifestyle.roll;text=O.lifestyle.text;}
  else if(key==="childhoodHome"){O.childhoodHome=cgLookup("childhoodHome",(O.lifestyle&&O.lifestyle.mod)||0);roll=O.childhoodHome.roll;text=O.childhoodHome.text;}
  else if(key==="childhoodMemory"){O.childhoodMemory=cgLookup("childhoodMemory",chaM);roll=O.childhoodMemory.roll;text=O.childhoodMemory.text;}
  else if(key==="bgDecision"){const r=rollDie(6);roll=r;GS.CGEN.life.decisions.background={roll:r,text:CG_BG[GS.CGEN.background][r-1]};text=GS.CGEN.life.decisions.background.text;}
  else if(key==="classTraining"){const r=rollDie(6);roll=r;GS.CGEN.life.decisions.classTraining={roll:r,text:CG_CLASS[GS.CGEN.class][r-1]};text=GS.CGEN.life.decisions.classTraining.text;}
  else if(key==="age"){const age=cgLookup("lifeByAge");roll=age.roll;GS.CGEN.life.age=age.text;const num=Math.max(1,parseCount(age.tag));text=age.text;if(!GS.CGEN.lifeExpanded.events){for(let k=0;k<num;k++)GS.CGEN.lifeQ.splice(i+1+k,0,"event");GS.CGEN.lifeExpanded.events=1;}}
  else if(key==="event"){const ev=cgLookup("lifeEvents");roll=ev.roll;const m=cgMakeEvent(ev);
    GS.CGEN.life.events.push(m);text=m.summary+(m.detail?` — ${m.detail}`:"");}
  GS.CGEN.lifeLog[i]={key,label:LIFE_STEP[key].label,text,roll,dieMax:(LIFE_STEP[key].die||(CG[LIFE_STEP[key].tbl]?CG[LIFE_STEP[key].tbl].die:100))};}
