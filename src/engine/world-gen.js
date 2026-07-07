/* GENESIS MODULE — src/engine/world-gen.js — starting-state roll-chains (factions, pressures, entry bridge, faction turn)
   Carved from genesis.html monolith on 2026-06-20 (Pass 3, logic-by-domain: engine).
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   Reads carved data (SS data; rollTbl/concretize/ebRoll/fragAt from engine.tables; rollDie/lookup/uid from engine.core; addLedger/ledgerOf/logEvent from app) at call-time. */

function rollFaction(name,isDominant){
  const tags=[];const tn=rollDie(2);for(let i=0;i<tn;i++){const t=rollTbl(SS.fTag).text;if(tags.indexOf(t)<0)tags.push(t);}
  return {id:uid(),name,dominant:!!isDominant,agenda:rollTbl(SS.fAgenda).text,method:rollTbl(SS.fMethod).text,
    tags,rel:isDominant?null:rollTbl(SS.fRel).text,clock:{size:6,filled:0}};}
// REGIONS-NAMES.md §2: an "external" pressure is a doom with a geography — "it comes from the
// northwest" — stamped with a rim-ward compass bearing (regionRimBearing, null-safe/optional `w`;
// at world-creation time no node/region coords exist yet, so it resolves around plane origin, still
// a stable deterministic direction). Internal pressures (the world's own rot, not an external front)
// don't get a bearing — only kind==="external" matches §2's "new/escalating external fronts".
function rollPressure(kind,w){
  const src=rollTbl(SS.pSource);const p=rollTbl(kind==="internal"?SS.pInternal:SS.pExternal);
  let impersonal=null,concTag=p.tag;
  if(src.tag==="impersonal"){const im=rollTbl(SS.pImpersonal);impersonal=im.text;if(im.tag)concTag=im.tag;}
  const portents=[rollTbl(SS.grimPortent).text,rollTbl(SS.grimPortent).text];
  const doom=rollTbl(SS.doom).text;
  const real=(concTag&&(SS_CONC[concTag]||concTag==="beast"))?concretize(concTag):null;
  const bearing=(kind==="external"&&typeof regionRimBearing==="function")?regionRimBearing(w):null;
  return {kind,source:src.text,sourceTag:src.tag,danger:p.text,dangerFrag:fragAt(kind==="internal"?"pInternal":"pExternal",p.idx),impersonal,portents,doom,clock:{size:6,filled:0},real,bearing};}
function rollStartingState(w){
  const dom=rollFaction(w.seed.faction.name,true);
  const n=rollDie(3);const rivals=[];const used={[dom.name]:1};
  for(let i=0;i<n;i++){let nm,t=0;do{nm=lookup("faction").name;t++;}while(used[nm]&&t<6);used[nm]=1;rivals.push(rollFaction(nm,false));}
  w.factions=[dom,...rivals];
  w.pressures=[rollPressure("internal",w),rollPressure("external",w)];
  // CROWNING §3.1/Q4 — the EXTERNAL front is the world's Impending Doom (a doom with a geography).
  // A flag, not a roll: the revelation is DM-paced (P4 slow drip), the flag is engine-state from day 1.
  (w.pressures.find(p=>p.kind==="external")||{}).isDoom=true;
  w.factions.forEach(f=>{
    addLedger(w,"canon",{kind:"faction",name:f.name,agenda:f.agenda,method:f.method,tags:f.tags,dominant:f.dominant},
      `${f.name} — ${f.dominant?"the dominant power":"a rival ("+f.rel+")"}; means to ${f.agenda}, through ${f.method}.`);
    addLedger(w,"clock",{kind:"faction-agenda",faction:f.name,size:f.clock.size,filled:0},`${f.name}'s agenda clock set — 0/${f.clock.size}.`);});
  w.pressures.forEach(p=>{
    addLedger(w,"drift",{kind:"pressure",scope:p.kind,danger:p.danger,impersonal:p.impersonal,real:p.real?p.real.text:null,doom:p.doom},
      `A ${p.kind} pressure stands over the land — ${p.danger}${p.real?" [DM: "+p.real.text+"]":""}.`);});}
/* ---- the Entry bridge (Step 3): assemble the opening from canon, fresh-roll only what's empty ----
   Preference order per slot: PC backstory seeds → factions → pressures → fresh (EB). */
function entrySeeds(w,c){ // harvest the people + threads char-genesis already wrote to the ledger
  const npcs=[],threads=[];
  ledgerOf(w).forEach(e=>{const d=e.data||{};if(d.fromChar!==c.id)return;
    if(e.type==="npc-life"&&d.role)npcs.push({role:d.role,desc:d.desc||""});
    else if(e.type==="canon"&&d.kind==="thread"&&d.text)threads.push(d.text);});
  return {npcs,threads};
}
function pickTension(w,adversarial){ // which standing pressure becomes the Opening Tension
  const ps=w.pressures||[];if(!ps.length)return null;
  let t=adversarial?ps.find(p=>p.sourceTag==="faction"):null; // 1) connects to the PC (faction trouble, PC at odds with the power)
  if(!t)t=ps.find(p=>p.real);                                  // 2) the higher-spice (concretized Strange+) one
  if(!t)t=ps.find(p=>p.kind==="internal")||ps[0];             // 3) else the local, immediate one
  return t;
}
/* Faction proximity (docs/DEATH-AND-REBIRTH.md step 4): the character is born near a local power.
   factionKind reads a faction's archetype from its Method; rollFactionProximity rolls the
   relationship (tie > member > none) and, if any, picks WHICH faction — weighted toward the class's
   archetypal kind, but any class can land near any power. Lets a successor begin inside a rival of
   the dead PC's allies. */
function factionKind(f){
  const m=((f&&f.method)||"").toLowerCase();
  if(typeof METHOD_KIND!=="undefined")for(let i=0;i<METHOD_KIND.length;i++){if(METHOD_KIND[i][0].test(m))return METHOD_KIND[i][1];}
  return "civic";
}
function rollFactionProximity(w,c){
  const facs=(w.factions||[]);if(!facs.length)return {relationship:"none"};
  const r=rollDie(100);                                  // tie most likely > member > a real chance of none
  const relationship=r<=55?"tie":(r<=80?"member":"none");
  if(relationship==="none")return {relationship:"none"};
  const cls=(c.sheet&&c.sheet.class)||"";
  const pref=(typeof CLASS_FACTION_AFFINITY!=="undefined"&&CLASS_FACTION_AFFINITY[cls])||[];
  const weighted=[];                                     // weight each faction by class→kind affinity (4× top, 2× other listed, 1× rest)
  facs.forEach(f=>{const i=pref.indexOf(factionKind(f));const wt=i===0?4:(i>0?2:1);for(let j=0;j<wt;j++)weighted.push(f);});
  const f=weighted[rollDie(weighted.length)-1];
  return {relationship,faction:f.name,kind:factionKind(f),dominant:!!f.dominant};
}
function rollEntry(w,c){
  const {npcs,threads}=entrySeeds(w,c);
  const dom=(w.factions||[]).find(f=>f.dominant),rivals=(w.factions||[]).filter(f=>!f.dominant);
  const B={enemies:[],friends:[],complications:[],things:[],places:[]},promoted=[];
  const add=(slot,text,src)=>{if(B[slot].length<2)B[slot].push({text,src});};

  // 1) backstory people → slots by role; anchor them "here"
  npcs.forEach(n=>{const r=n.role.toLowerCase(),line=`${n.role}${n.desc?" — "+n.desc:""}`;
    const slot=/hostile|enemy/.test(r)?"enemies":/lover|companion|life-debt|employer/.test(r)?"friends":"complications";
    add(slot,line,"past");promoted.push(n.role);});

  // 2) backstory threads → complications (and one may drive Why-Here)
  const searchThread=threads.find(t=>/search/i.test(t));
  threads.forEach(t=>add("complications",t,"past"));

  // 3) factions → enemy/friend by the PC's standing; a rivalry as a complication
  const standing=rollTbl(SS.eStanding).text;
  const adversarial=/enemy|wanted|watched|marked/.test(standing);
  if(dom)add(adversarial?"enemies":"friends",`${dom.name} (the dominant power) — means to ${dom.agenda}`,"power");
  if(rivals[0])add("complications",`${rivals[0].name} stands ${rivals[0].rel||"at odds"} with ${dom?dom.name:"the power"}`,"power");

  // 3b) faction proximity (DEATH-AND-REBIRTH step 4): born with a tie/membership to a local power
  const prox=rollFactionProximity(w,c);
  if(prox.relationship!=="none"&&prox.faction)
    add("friends",`${prox.faction} — you are ${prox.relationship==="member"?"a sworn member of":"tied to"} them`,"proximity");

  // 4) pressures → the Opening Tension (kept as the headline) + contested Places from the gazetteer
  const tp=pickTension(w,adversarial);
  (w.gazetteer||[]).filter(g=>g.type==="Place").slice(0,2).forEach(g=>add("places",g.name,"place"));

  // 5) Option C — any still-empty slot is filled by the script from the fresh tables (never punt to the DM)
  ["enemies","friends","complications","things","places"].forEach(s=>{if(!B[s].length)B[s].push(ebRoll(s));});

  const why=searchThread?"searching for someone you lost":rollTbl(SS.eWhyHere).text;
  const foot=rollTbl(SS.eFoot).text;
  const standingFaction=dom?dom.name:"the local power";
  c.entry={why,foot,standing,standingFaction,proximity:prox,bundle:B,
    tension:tp?{danger:tp.danger,dangerFrag:tp.dangerFrag,kind:tp.kind,doomDM:tp.doom,realDM:tp.real?tp.real.text:null}:null};

  if(prox.relationship!=="none"&&prox.faction)addLedger(w,"canon",{kind:"proximity",char:c.id,faction:prox.faction,relationship:prox.relationship,factionKind:prox.kind},
    `${c.name} is ${prox.relationship==="member"?"a sworn member of":"tied to"} ${prox.faction} (${prox.kind}).`);
  if(promoted.length)addLedger(w,"canon",{kind:"anchor",char:c.id,roles:promoted,place:c.bornWhere},
    `Anchored to ${c.bornWhere}: ${promoted.join("; ")} — present at the opening.`);
  addLedger(w,"canon",{kind:"entry",char:c.id},
    `${c.name} arrives ${why}; to ${standingFaction}, ${standing}.${c.entry.tension?" Opening tension: "+c.entry.tension.danger+".":""}`);}
function ssFactionTurn(w){
  if(!w.factions||!w.factions.length)return;
  const f=w.factions[rollDie(w.factions.length)-1];const t=rollTbl(SS.fTurn);
  if(t.total<=2)f.clock.filled=Math.min(f.clock.size,f.clock.filled+1);
  addLedger(w,"npc-life",{kind:"faction-turn",faction:f.name},`The web turns — ${f.name} ${t.text}.`);
  logEvent(w,`The web turns: ${f.name} ${t.text}.`);
  if(w.pressures&&w.pressures.length&&rollDie(2)===1){const p=w.pressures[rollDie(w.pressures.length)-1];
    if((p.clock.filled||0)<p.clock.size){p.clock.filled=(p.clock.filled||0)+1;
      addLedger(w,"drift",{kind:"pressure-tick",scope:p.kind},`The ${p.kind} pressure worsens — ${rollTbl(SS.grimPortent).text} (${p.clock.filled}/${p.clock.size}).`);}}}
