/* GENESIS MODULE — src/creator/life.js — the Life chain (lookups, person-desc, origins/path/events, headline, seedFromLife)
   Carved from genesis.html monolith on 2026-06-20 (Pass 7, creator domain). AST-extracted (acorn).
   Classic <script>, shared global scope. Transient state lives in GS (GS.CGEN/GS.BARDO/GS.CG_DRAG); data consts
   (STAGES/WORLDBEATS/GUIDE/LIFE_STEP) live in data/creation-flow.js; read at call-time. */

function cgRollN(n,sides){let t=0;for(let i=0;i<n;i++)t+=rollDie(sides);return t;}

function cgLookup(key,mod){const tb=CG[key];const n=tb.d||1;const base=cgRollN(n,tb.die);const total=base+(mod||0);
  let row=tb.rows.find(r=>total>=r[0]&&total<=r[1]);if(!row)row=tb.rows[tb.rows.length-1];
  const extra=row[3];return {roll:base,total,text:row[2],tag:(typeof extra==="string"?extra:""),mod:(typeof extra==="number"?extra:0)};}

function parseCount(str){const m=/(\d+)d(\d+)(?:\+(\d+))?/.exec(str);if(!m)return parseInt(str)||0;
  let t=0,n=+m[1],s=+m[2];for(let i=0;i<n;i++)t+=rollDie(s);return t+(m[3]?+m[3]:0);}

/* Roll a dice notation (NdM+K) and return the breakdown so the INNER roll can be SURFACED to the player,
   not just the total (Adam: show every inner roll, every time). `.show` is a one-line trace, e.g.
   "1d4+1 → 3+1 = 4" or "2d6 → 4+5 = 9". Returns null when `str` carries no dice. */
function rollDetail(str){const m=/(\d+)d(\d+)(?:\+(\d+))?/.exec(str||"");if(!m)return null;
  const n=+m[1],s=+m[2],plus=m[3]?+m[3]:0,rolls=[];let t=0;for(let i=0;i<n;i++){const r=rollDie(s);rolls.push(r);t+=r;}
  return {total:t+plus,rolls,plus,n,sides:s,notation:`${n}d${s}${plus?`+${plus}`:""}`,
    show:`${n}d${s}${plus?`+${plus}`:""} → ${rolls.join("+")}${plus?`+${plus}`:""} = ${t+plus}`};}

/* SD-004 fix: cgPersonDesc used to return a bare description string, so the species word it rolled
   (race.text, e.g. "dwarf") only ever lived inside that prose — nothing downstream (tiylBackfillPeople's
   independent rollNPC({}) call) ever read it back out, so the codex record's fields.species came from a
   SECOND, unrelated race roll and could mismatch the prose ("a elf sailor" minted onto a Dwarf record).
   Now returns {desc, species}: desc is the same prose as before, species is the canonical species name
   (via npcSpeciesFromRace, the SAME classifier rollNPC itself uses internally) so a caller that needs to
   bind a codex record can pass the SAME species through instead of re-rolling one. Also fixes the a/an
   article: "elf"/"orc"/"of an uncommon kind" all need "an" — the old code hardcoded "a" for every race. */
function cgPersonDesc(){let occ=cgLookup("occupation").text;
  if(occ==="Adventurer"||/\(roll/i.test(occ))occ=cgLookup("npcClass").text;  // "Wanderer (roll Kind & calling again)" → roll a class now
  const race=cgLookup("race").text,rel=cgLookup("relationship").text,st=cgLookup("status");
  const raceLc=race.toLowerCase(),art=/^[aeiou]/.test(raceLc)?"an":"a";
  const species=(typeof npcSpeciesFromRace==="function")?npcSpeciesFromRace(race):null;
  return {desc:`${art} ${raceLc} ${occ.toLowerCase()}, ${rel}, ${st.text}`,species};}

/* Resolve inline dice in a life-event line AT ROLL TIME — roll each NdM(+K), substitute the rolled
   value into the text, and total any "gp" so starting gold reflects the life lived. Returns {text, gp}.
   (Resolve once when the event is rolled, never on re-render, or the numbers would change.) */
function cgResolveInlineDice(str){
  if(!str)return{text:str||"",gp:0,rolls:[]};let gp=0;const rolls=[];
  const text=str.replace(/(\+?)(\s*)(\d+d\d+(?:\+\d+)?)(\s*gp)?/gi,(m,plus,ws,dice,gpu)=>{
    const d=rollDetail(dice);const r=d?d.total:parseCount(dice);if(d)rolls.push(d.show+(gpu?" gp":""));
    const lead=(plus||"")+(ws||"");if(gpu){gp+=r;return lead+r+gpu;}return lead+r;});
  return{text,gp,rolls};}

/* Resolve choose-one branches written as {a | b | c} in life prose AT ROLL TIME — roll uniformly
   among the options and bake the single chosen outcome into the text, so no ambiguous "or" menu
   ("jailed, at the oar, or hard labor — or you escaped") ever reaches the player to interpret.
   Run BEFORE cgResolveInlineDice so any dice inside the chosen option (e.g. "1d4 years") still roll.
   Resolve once when the event is rolled, never on re-render. */
function cgResolveBranch(str){
  if(!str||str.indexOf("{")<0)return str||"";
  return str.replace(/\{([^{}]+)\}/g,(m,body)=>{
    const opts=body.split("|").map(s=>s.trim()).filter(Boolean);
    return opts.length?opts[rollDie(opts.length)-1]:m;});
}

/* Build one resolved life event from a lifeEvents roll — people/threads seeds + sub-table detail,
   inline dice rolled, gp banked into GS.CGEN.lifeGold. The single source for all three life paths. */
function cgMakeEvent(ev){
  const seeds=[];let detail="";const tag=ev.tag;
  if(tag==="enemy"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"An enemy made in the past",desc:p.desc,species:p.species,relTag:tag});detail=`Your enemy is ${p.desc}.`;}
  else if(tag==="friend"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"A friend from the past",desc:p.desc,species:p.species,relTag:tag});detail=`Your friend is ${p.desc}.`;}
  else if(tag==="important"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"Someone important you met",desc:p.desc,species:p.species,relTag:tag});detail=`They are ${p.desc}.`;}
  else if(tag==="love"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"A love or spouse",desc:p.desc,species:p.species,relTag:tag});detail=`Your love is ${p.desc}.`;}
  else if(tag&&CG[tag]){const sec=cgLookup(tag);detail=sec.text+cgHandleSec(sec,seeds);
    if(tag==="crime"){const pun=cgLookup("punishment");detail=`${sec.text} — ${pun.text}`;if(pun.tag==="wanted")seeds.push({kind:"thread",text:`Wanted for ${sec.text.toLowerCase()} where the crime occurred`});}}
  const rs=cgResolveInlineDice(cgResolveBranch(ev.text)),rd=cgResolveInlineDice(cgResolveBranch(detail));
  const gp=rs.gp+rd.gp;if(gp)GS.CGEN.lifeGold=(GS.CGEN.lifeGold||0)+gp;
  const summary=rs.text,hook=summary.replace(/^You /,"").replace(/\.$/,"").toLowerCase();
  // TIYL-DEEPENING §3.1 fix: a "mark" seed's text must come from the SAME resolved pass as `detail`
  // (rd.text), not a second independent cgResolveBranch/cgResolveInlineDice roll — otherwise the mark
  // seed can pick a different {a|b|c} branch than the biography detail, and it never gets its inline
  // dice (e.g. "1d3 fingers") rolled at all, shipping a raw dice literal to the DM and the sheet.
  // detail===sec.text for the mark case (cgHandleSec returns "" for tag "mark"), so rd.text IS the
  // fully-resolved mark clause; reuse it in place of the mark seed's own pre-resolution text.
  seeds.forEach(sd=>{if(sd.kind==="mark")sd.text=rd.text;});
  return{roll:ev.total,summary,detail:rd.text,hook,seeds,sub:[].concat(rs.rolls||[],rd.rolls||[])};}

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
  if(t==="lostlove"){seeds.push({kind:"npc",role:"A vanished lover",desc:"disappeared without a trace",relTag:t});seeds.push({kind:"thread",text:"Searching for a lover who vanished without a trace"});}
  else if(t==="lifedebt"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"A life-debt companion",desc:p.desc,species:p.species,relTag:t});}
  else if(t==="wanted")seeds.push({kind:"thread",text:"Wanted by the authorities where the crime occurred"});
  else if(t==="thread")seeds.push({kind:"thread",text:sec.text});
  else if(t==="hostile"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"A former friend, now hostile",desc:p.desc,species:p.species,relTag:t});}
  else if(t==="important"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"A former employer",desc:p.desc,species:p.species,relTag:t});}
  else if(t==="enemy"){const p=cgPersonDesc();seeds.push({kind:"npc",role:"An enemy made",desc:p.desc,species:p.species,relTag:t});}
  // TIYL-DEEPENING §3.1: a rolled "mark" (scar / gray hair / cough / …) was never seeded anywhere —
  // the sub-table row text (sec.text) carries the actual mark wording. Push a placeholder here (this
  // runs BEFORE cgMakeEvent's branch/dice resolution pass); cgMakeEvent backfills sd.text from the
  // SAME resolved `detail` (rd.text) it computes for the biography, so the mark can never diverge
  // from the biography's {a|b|c} pick and never ships an un-rolled NdM literal (e.g. "1d3 fingers").
  else if(t==="mark")seeds.push({kind:"mark",text:sec.text});
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
    // SD-004/SD-005: carry the rolled species + the TIYL relationship tag (sd.relTag, e.g. "hostile") through
    // onto the ledger entry so tiylBackfillPeople can bind the SAME species (not re-roll one) and open the
    // codex NPC's attitude at the stance the biography already declared, instead of shipping both as
    // independent randoms the prose never agreed with.
    if(sd.kind==="npc"){const e=addLedger(w,"npc-life",{role:sd.role,desc:sd.desc,species:sd.species||null,relTag:sd.relTag||null,fromChar:c.id,source:"char-genesis"},
        `From ${c.name}'s past — ${sd.role.toLowerCase()}: ${sd.desc}.`);
      w.gazetteer.push({type:"NPC",name:sd.role,desc:`${sd.desc} — from ${c.name}'s past.`,cat:"",discoveredAt:Date.now()});ids.push(e.id);}
    else if(sd.kind==="thread"){const e=addLedger(w,"canon",{kind:"thread",text:sd.text,fromChar:c.id,source:"char-genesis"},
        `Open thread (from ${c.name}'s past) — ${sd.text}.`);ids.push(e.id);}
    // TIYL-DEEPENING §3.1: marks (scars/gray hair/coughs — rolled but never landing anywhere) go
    // straight onto the sheet as a permanent, DM-narratable list. No PC codex record exists anywhere
    // in this codebase (the PC lives on w.characters[] only — confirmed, not a gap this unit invents
    // a fix for; a PC codex record would also ride codexDigest's "all records but region" filter every
    // turn, which is exactly the byte-bloat DIGEST-DIET fought to remove). sheet.marks[] is the real,
    // load-bearing fix; the "+ codex record" half of §3.1 is flagged in this build's uncertainties.
    else if(sd.kind==="mark"){(c.sheet.marks=c.sheet.marks||[]).push(sd.text);}
  }));return ids;}

/* SD-005 fix: TIYL relationship words (cgHandleSec/cgMakeEvent's sub-table `tag`, carried through onto
   the ledger entry as d.relTag by seedFromLife) → the initial Standing-ladder rung the backfilled codex
   NPC opens at, instead of every TIYL person shipping the lazy Indifferent/0 default no matter what the
   biography said ("former friend, now hostile" reading Indifferent — SD-005's exact finding). Mapping is
   deliberately narrow (only the tags this codebase's life tables actually roll — see data/character-
   genesis.js's tragedies/adventures/boons rows): hostile→Hostile (-2, an exact match), enemy→Unfriendly
   (-1, the "rival" analog — adversarial but the biography never called them HOSTILE), friend/love/lifedebt
   →Friendly (+1, the friend/ally family — a fast friend, a spouse, a life-debt companion who travels with
   you). Every other tag (important/lostlove/none) is left unmapped — codexAttitudeOpen is simply not
   called, so the record keeps the ordinary lazy Indifferent default, same as any other codex NPC. */
const TIYL_REL_ATTITUDE={hostile:-2, enemy:-1, friend:1, love:1, lifedebt:1};

/* TIYL-DEEPENING §3.3 — "people get atoms": every TIYL-seeded person (npc-life ledger entries
   seedFromLife just wrote, fromChar===c.id) is back-filled with a full rollNPC() payload at bind
   time, so a backstory figure is a pushable, statted codex handle from turn one instead of a stub
   the DM has to invent from scratch. TIYL never rolled the person a proper NAME (only a role label
   + cgPersonDesc() prose) — rollNPC always mints a fresh one (opts.name is for the rarer case a
   caller already HAS a name to preserve; there isn't one here, so this is the "opts.name absent"
   path, reconciled against the real rollNPC signature). The seeded role/desc becomes the record's
   connecting identity: fields.tiylRole carries the exact ledger role text (what the DM narrates them
   AS — "an enemy made in the past"), and status.at is left null (unplaced — the DM/prep places them
   on first contact, same as any other soft record). provenance:"rolled" (rollNPC's own default) so
   this reads identically to every other engine-minted NPC everywhere else in the codex. No-op if the
   codex/rollNPC aren't loaded (headless data-less harness) — never a throw, never a partial write.
   SD-004 fix: d.species (the species seedFromLife carried through from the SAME cgPersonDesc() roll
   that wrote the tiylDesc prose) is passed as opts.species so rollNPC binds the record to that species
   instead of independently re-rolling npc-race-weighted — the prose and the record can no longer
   disagree on what this person is ("a elf sailor" minted onto a Dwarf record).
   SD-005 fix: d.relTag (the TIYL relationship word) opens the record's attitude via codexAttitudeOpen
   at TIYL_REL_ATTITUDE[d.relTag] when mapped — done AFTER codexAdd so it operates on the real record id,
   and guarded by typeof codexAttitudeOpen (a world.codex export, not this module's own) so a harness
   that loads codexAdd/rollNPC but not the social layer still mints the record without throwing. */
function tiylBackfillPeople(w,c){
  if(!w||!c||typeof ledgerOf!=="function"||typeof codexAdd!=="function"||typeof rollNPC!=="function")return [];
  const ids=[];
  ledgerOf(w).forEach(e=>{
    if(e.type!=="npc-life")return;const d=e.data||{};if(d.fromChar!==c.id||!d.role)return;
    const payload=rollNPC(d.species?{species:d.species}:{});
    payload.fields=Object.assign({},payload.fields,{tiylRole:d.role,tiylDesc:d.desc||null});
    payload.dm=Object.assign({},payload.dm,{tiylFromChar:c.id,tiylLedgerId:e.id});
    const id=(typeof prepCastId==="function")?prepCastId(w,"npc",payload.name):undefined;
    const rec=codexAdd(w,Object.assign({},payload,id?{id}:{}));
    if(rec){
      ids.push(rec.id);
      const opening=d.relTag&&TIYL_REL_ATTITUDE[d.relTag];
      if(opening!=null&&typeof codexAttitudeOpen==="function")
        codexAttitudeOpen(w,rec.id,opening,{cause:"tiyl-relationship:"+d.relTag});
    }
  });
  return ids;
}

function lifeDieLabel(key){const m=LIFE_STEP[key];return "d"+(m.die||(CG[m.tbl]?CG[m.tbl].die:100));}

function cgLifeBegin(){
  GS.CGEN.life={origins:{},decisions:{},events:[],age:""};GS.CGEN.lifeGold=0;
  GS.CGEN.lifeLog=[];GS.CGEN.lifeI=0;GS.CGEN.lifeExpanded={};
  GS.CGEN.lifeQ=["parents","birthplace","siblings","family","lifestyle","childhoodHome","childhoodMemory","bgDecision","classTraining","age"];
}

function cgLifeStepRoll(){
  const i=GS.CGEN.lifeI,key=GS.CGEN.lifeQ[i];if(GS.CGEN.lifeLog[i])return;
  const O=GS.CGEN.life.origins,chaM=abilMod((GS.CGEN.scores&&GS.CGEN.scores.cha)||10);let text="",roll=null,sub=null;
  if(key==="parents"){O.parents=cgLookup("parents");roll=O.parents.roll;text=O.parents.total>95?"your parentage is unknown":O.parents.text;}
  else if(key==="birthplace"){O.birthplace=cgLookup("birthplace");roll=O.birthplace.roll;text=O.birthplace.text;}
  else if(key==="siblings"){const sn=cgLookup("siblingsNum");roll=sn.roll;let sc=0;if(sn.text!=="None"){const d=rollDetail(sn.text);sc=d?d.total:parseCount(sn.text);if(d)sub=`siblings: ${d.show}`;}const sLbl=sc===0?"None — an only child":`${sc} sibling${sc===1?"":"s"}`;O.siblings={text:sc===0?"None":String(sc),count:sc,birthOrder:null,sub};text=sLbl;if(sc>0&&!GS.CGEN.lifeExpanded.sib){GS.CGEN.lifeQ.splice(i+1,0,"birthOrder");GS.CGEN.lifeExpanded.sib=1;}}
  else if(key==="birthOrder"){const bo=cgLookup("birthOrder");roll=bo.roll;O.siblings.birthOrder=bo.text;text=bo.text;}
  else if(key==="family"){O.family=cgLookup("family");roll=O.family.roll;text=O.family.text;if(!GS.CGEN.lifeExpanded.abs&&O.parents&&O.parents.total<=95&&O.family.text!=="Mother and father"){GS.CGEN.lifeQ.splice(i+1,0,"absentParent");GS.CGEN.lifeExpanded.abs=1;}}
  else if(key==="absentParent"){O.absent=cgLookup("absentParent");roll=O.absent.roll;text=O.absent.text;}
  else if(key==="lifestyle"){O.lifestyle=cgLookup("lifestyle");roll=O.lifestyle.roll;text=O.lifestyle.text;}
  else if(key==="childhoodHome"){O.childhoodHome=cgLookup("childhoodHome",(O.lifestyle&&O.lifestyle.mod)||0);roll=O.childhoodHome.roll;text=O.childhoodHome.text;}
  else if(key==="childhoodMemory"){O.childhoodMemory=cgLookup("childhoodMemory",chaM);roll=O.childhoodMemory.roll;text=O.childhoodMemory.text;}
  else if(key==="bgDecision"){const r=rollDie(6);roll=r;GS.CGEN.life.decisions.background={roll:r,text:CG_BG[GS.CGEN.background][r-1]};text=GS.CGEN.life.decisions.background.text;}
  else if(key==="classTraining"){const r=rollDie(6);roll=r;GS.CGEN.life.decisions.classTraining={roll:r,text:CG_CLASS[GS.CGEN.class][r-1]};text=GS.CGEN.life.decisions.classTraining.text;}
  else if(key==="age"){const age=cgLookup("lifeByAge");roll=age.roll;GS.CGEN.life.age=age.text;const d=rollDetail(age.tag);const num=Math.max(1,d?d.total:parseCount(age.tag));if(d)sub=`life events: ${d.show}`;text=age.text;if(!GS.CGEN.lifeExpanded.events){for(let k=0;k<num;k++)GS.CGEN.lifeQ.splice(i+1+k,0,"event");GS.CGEN.lifeExpanded.events=1;}}
  else if(key==="event"){const ev=cgLookup("lifeEvents");roll=ev.roll;const m=cgMakeEvent(ev);
    GS.CGEN.life.events.push(m);text=m.summary+(m.detail?` — ${m.detail}`:"");if(m.sub&&m.sub.length)sub=m.sub.join(" · ");}
  GS.CGEN.lifeLog[i]={key,label:LIFE_STEP[key].label,text,roll,sub,dieMax:(LIFE_STEP[key].die||(CG[LIFE_STEP[key].tbl]?CG[LIFE_STEP[key].tbl].die:100))};}
