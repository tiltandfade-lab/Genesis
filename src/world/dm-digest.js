/* GENESIS MODULE — src/world/dm-digest.js — beat-shaped DM context.
   Spec: docs/MECHANIZATION-INTERPRETATION-BOUNDARY.md §3.6 / §5.

   dmDigest() remains the complete compatibility/bootstrap/debug snapshot. This module derives the
   ordinary TURN packet from that truth without mutating it: a small invariant core plus exactly one
   primary view (scene | inventory | combat | travel | social). Selection changes what the DM sees,
   never who is allowed to resolve an action; dmRoute still owns execution authority.

   The packet is sparse by design. An omitted key means "not selected for this beat", never false or
   absent from canon. Mentioned off-scene nouns are retrieved deterministically from the Codex before
   projection, so the model does not need the whole roster merely to recall one named person. */

const DM_BEAT_DIGEST_SCHEMA = "beat-digest/v1";
const DM_BEAT_KINDS = ["scene", "inventory", "combat", "travel", "social"];
const DM_BEAT_TARGET_BYTES = 3072;
const DM_BEAT_DIGEST_KEYS = ["schema","view","slices","worldId","worldName","clock","location","setting","pc","powers","fronts","recentLedger","gazetteer","codex","minted","revealed","sessionLean","tarot","activeWalk","ambientPresence","combat","prepPending","levelUp","arrivalBrief","itemLegacy","itemCustody","bastion","pendingSituation","retrieval"];

const DM_BEAT_SOCIAL_RE = /\b(?:say|ask|tell|greet|speak|talk|chat|whisper|shout|reply|answer|persuade|deceive|lie|intimidate|plead|bargain|parley|question|interview)\b/;
const DM_BEAT_TRAVEL_RE = /\b(?:travel|walk|go|head|ride|march|leave|enter|return|follow|cross|climb|descend|advance|continue|journey|road|path|trail|door)\b/;
const DM_BEAT_INVENTORY_RE = /\b(?:inventory|pack|backpack|pouch|satchel|bag|belongings|possessions|supplies|gear|equipment|weapon|armor|potion|item|carry|carrying|wield|equip|unequip|draw|sheathe|give|drop|place|put|set|offer|throw|drink)\b/;
const DM_BEAT_INVENTORY_WHOLE_RE = /\b(?:inventory|pack|backpack|pouch|satchel|bag|belongings|possessions|supplies|gear|equipment)\b/;
const DM_BEAT_LEGACY_RE = /\b(?:lost|missing|stolen|confiscated|recover|reclaim|legacy)\b/;
// Prior-beat records are useful for real anaphora ("put it away", "the sender"), but carrying
// them into every newly named conversation both bloats the packet and biases the DM toward the old
// beat. Personal pronouns are intentionally absent: "I ask Katherine what she thinks" is resolved
// by Katherine's explicit identity and is not a request to revive every actor from the prior beat.
const DM_BEAT_CONTINUITY_RE = /\b(?:it|(?:the|this|that) (?:(?:[a-z0-9-]+)\s+){0,2}(?:report|message|sender|object|item|thing|device|tube)|this one|that one|same one|former|latter)\b/i;
const DM_BEAT_MENTION_STOP = new Set(["the","this","that","with","from","into","onto","over","under","old","road","town","home","place","item"]);

function dmBeatClone(v){
  try{ return v==null?v:JSON.parse(JSON.stringify(v)); }
  catch(_){ return null; }
}

function dmBeatBytes(v){
  try{ return JSON.stringify(v).length; }
  catch(_){ return 0; }
}

function dmBeatNorm(v){
  return String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}

function dmBeatMentions(action, candidate){
  const hay=" "+dmBeatNorm(action)+" ", phrase=dmBeatNorm(candidate);
  if(!phrase) return false;
  if(phrase.length>=4 && hay.indexOf(" "+phrase+" ")>=0) return true;
  const words=phrase.split(" ").filter(w=>w.length>=4&&!DM_BEAT_MENTION_STOP.has(w));
  return words.some(w=>hay.indexOf(" "+w+" ")>=0);
}

/* Exact multi-word identity outranks a shared title/token. Without this tier, "Captain Fenn" tied
   every "Captain …" record at the fuzzy-word score and final byte fitting could retain the faction
   row while dropping the one person the player actually named. */
function dmBeatExactMention(action, candidate){
  const hay=" "+dmBeatNorm(action)+" ", phrase=dmBeatNorm(candidate);
  return !!(phrase&&phrase.indexOf(" ")>=0&&hay.indexOf(" "+phrase+" ")>=0);
}

/* A player naturally shortens "Tessa Rill" to "Tessa" after contact. Treat a name token as an
   exact retrieval key only when it identifies ONE canonical record in this world. Shared titles
   such as "Captain" remain fuzzy and cannot displace the person actually addressed. */
function dmBeatUniqueNamedRecords(action, records){
  const hay=" "+dmBeatNorm(action)+" ", rows=(records||[]).filter(r=>r&&r.name&&
    (r.kind==="npc"||r.kind==="creature")), counts={};
  // Only the FIRST significant name token acts as a shortened identity ("Tessa" → Tessa Rill).
  // Treating every unique token as identity made ordinary nouns in compound place names dangerous:
  // "glass-bee" incorrectly pinned Amber-Glass Quay because "glass" happened to be unique.
  const tokens=r=>Array.from(new Set(dmBeatNorm(r.name).split(" ")
    .filter(x=>x.length>=4&&!DM_BEAT_MENTION_STOP.has(x)))).slice(0,1);
  rows.forEach(r=>tokens(r).forEach(x=>{counts[x]=(counts[x]||0)+1;}));
  return rows.filter(r=>tokens(r).some(x=>counts[x]===1&&hay.indexOf(" "+x+" ")>=0));
}

function dmBeatItemTokenMentioned(hay,token){
  if(!token)return false;
  const forms=[token];
  if(/[^aeiou]y$/.test(token))forms.push(token.slice(0,-1)+"ies");
  else if(/(?:s|x|z|ch|sh)$/.test(token))forms.push(token+"es");
  else forms.push(token+"s");
  return forms.some(x=>hay.indexOf(" "+x+" ")>=0);
}

function dmBeatItemMentioned(action, item, items){
  if(!item)return false;
  const hay=" "+dmBeatNorm(action)+" ", phrase=dmBeatNorm(item.name), idPhrase=dmBeatNorm(item.id);
  if((phrase&&hay.indexOf(" "+phrase+" ")>=0)||(idPhrase&&hay.indexOf(" "+idPhrase+" ")>=0))return true;
  const tokens=phrase.split(" ").filter(x=>x.length>=4&&!DM_BEAT_MENTION_STOP.has(x));
  const hits=tokens.filter(x=>dmBeatItemTokenMentioned(hay,x));
  if(hits.length>=2)return true;
  if(hits.length!==1||hits[0]!==tokens[tokens.length-1])return false;
  // A single head noun is a natural carried-item shorthand ("the tube", "my javelin") only when
  // it identifies one inventory row. An adjective/middle word such as "answer" must not summon
  // The First Answer Tube merely because the player asks someone for an honest answer.
  return (items||[item]).filter(it=>{
    const ts=dmBeatNorm(it&&it.name).split(" ").filter(x=>x.length>=4&&!DM_BEAT_MENTION_STOP.has(x));
    return ts[ts.length-1]===hits[0];
  }).length===1;
}

/* Context selection is conservative retrieval, not intent resolution. Combat gets priority because
   omitting live tactical state is unsafe; explicit dialogue then wins over incidental item/travel
   words. A trusted route slice can select inventory, but no keyword here can mechanize an action. */
function dmBeatInventoryRelevant(action,route,full){
  const txt=String(action||""), routeSlices=(route&&route.relevantSlices)||[];
  const inventoryRouted=routeSlices.some(s=>s==="inventory"||s==="pc-inventory"||s==="item-custody");
  const items=(full&&full.pc&&full.pc.inventory)||[];
  return inventoryRouted||DM_BEAT_INVENTORY_RE.test(txt.toLowerCase())||
    items.some(it=>dmBeatItemMentioned(txt,it,items));
}

function dmBeatKind(w, action, route, full){
  const txt=String(action||"");
  const cm=(typeof GS!=="undefined"&&GS&&GS.combat)||null;
  if(cm&&cm.active) return "combat";
  if(typeof combatActionAsserted==="function"&&combatActionAsserted(txt.toLowerCase())) return "combat";
  if(route&&route.mode==="freeform-ruling"&&route.reasons&&route.reasons.indexOf("hidden-scene-turn")>=0) return "scene";
  if(DM_BEAT_SOCIAL_RE.test(txt.toLowerCase())||/[“”"]/u.test(txt)) return "social";
  if(dmBeatInventoryRelevant(txt,route,full)) return "inventory";
  if(DM_BEAT_TRAVEL_RE.test(txt.toLowerCase())||(full&&full.activeWalk)) return "travel";
  return "scene";
}

function dmBeatProfile(w, action, route, full){
  const kind=dmBeatKind(w,action,route,full);
  const inventoryRelevant=dmBeatInventoryRelevant(action,route,full);
  // Before combat_start there is no tactical tracker to ship. A hostile-looking spell/attack may
  // still be happening inside a generated walk scene, so keep the walk's current room and exits
  // alongside combat-capable PC state. Do not guess which spells are inherently hostile.
  const preCombatWalk=kind==="combat"&&full&&full.activeWalk&&!full.combat;
  const slices=["scene","pc","story-pressure","continuity"];
  if(kind!=="scene") slices.push(kind);
  // Explicit dialogue remains the primary social view, but a composite beat such as "check my
  // pouch, then ask the clerk" still needs the authoritative carried-item/custody slice. A single
  // primary view is a shaping preference, not permission to hide truth named by the same action.
  if(inventoryRelevant&&kind!=="inventory")slices.push("inventory");
  if(inventoryRelevant) slices.push("item-custody");
  if(kind==="social") slices.push("local-actors");
  if(kind==="travel") slices.push("active-walk");
  if(kind==="combat") slices.push("combat-state");
  if(preCombatWalk)slices.push("active-walk");
  return {kind,slices,inventoryRelevant};
}

function dmBeatCompactValue(v, depth){
  depth=depth||0;
  if(v==null||typeof v==="number"||typeof v==="boolean") return v;
  if(typeof v==="string") return v.length>240?v.slice(0,237)+"…":v;
  if(depth>=2) return Array.isArray(v)?v.slice(0,4):String(v);
  if(Array.isArray(v)) return v.slice(0,6).map(x=>dmBeatCompactValue(x,depth+1));
  if(typeof v==="object"){
    const out={}; Object.keys(v).slice(0,10).forEach(k=>{out[k]=dmBeatCompactValue(v[k],depth+1);});
    return out;
  }
  return String(v);
}

function dmBeatLimitedObject(src, cap, preferred){
  if(!src||typeof src!=="object"||Array.isArray(src)) return null;
  const keys=Object.keys(src), order=[];
  (preferred||[]).forEach(k=>{if(keys.indexOf(k)>=0&&order.indexOf(k)<0)order.push(k);});
  keys.forEach(k=>{if(order.indexOf(k)<0)order.push(k);});
  const out={};
  order.forEach(k=>{
    if(src[k]==null||(Array.isArray(src[k])&&src[k].length===0))return;
    const v=dmBeatCompactValue(src[k],0), candidate=Object.assign({},out,{[k]:v});
    if(dmBeatBytes(candidate)<=cap) out[k]=v;
  });
  return Object.keys(out).length?out:null;
}

function dmBeatCodexRecord(w, rec, kind){
  if(!rec) return null;
  const social=kind==="social";
  const out={id:rec.id,kind:rec.kind,name:rec.name};
  // A retrieved location must carry the map identity required by move_node/travel_start. Codex ids
  // and map ids are separate namespaces; making the model guess between them produced prose-only
  // travel. Resolve by exact stored id/name against the existing map, never by fuzzy invention.
  if(rec.kind==="location"&&w&&w.map&&w.map.nodes){
    const nodes=w.map.nodes, suffix=String(rec.id||"").replace(/^location:/,"");
    const mapNodeId=Object.keys(nodes).find(id=>id===suffix||
      String((nodes[id]&&nodes[id].name)||"").trim().toLowerCase()===String(rec.name||"").trim().toLowerCase());
    if(mapNodeId)out.mapNodeId=mapNodeId;
  }
  const fields=dmBeatLimitedObject(rec.fields,social?380:280,
    ["role","occupation","summary","desc","description","appearance","voice","manner","activity","doing","need","tell"]);
  const dm=dmBeatLimitedObject(rec.dm,social?420:300,
    ["truth","secret","want","wants","need","goal","motive","tell","voice","notes","flavor","hook"]);
  if(fields)out.fields=fields;
  if(dm)out.dm=dm;
  if(rec.status){out.status={known:!!rec.status.known,soft:!!rec.status.soft};
    if(rec.status.at!=null)out.status.at=rec.status.at;
    if(rec.status.condition&&rec.status.condition!=="ok")out.status.condition=rec.status.condition;}
  if(rec.attitude)out.attitude={value:rec.attitude.value,label:rec.attitude.label,
    terrified:!!rec.attitude.terrified,read:!!rec.attitude.read};
  if(rec.gifts&&rec.gifts.length)out.gifts=rec.gifts.slice(-3).map(dmBeatClone);
  if(rec.witness)out.witness=dmBeatClone(rec.witness);
  if(rec.parleyAbility)out.parleyAbility=rec.parleyAbility;
  if(rec.links&&rec.links.length)out.links=rec.links.slice(0,4).map(l=>({rel:l.rel,to:l.to}));
  return out;
}

function dmBeatCodexSlice(w, action, full, kind){
  const local=(full.codex||[]).slice();
  const storedRecords=(typeof codexOf==="function")?Object.values((codexOf(w).records)||{}):[];
  const pinnedSeed=new Set(), actionSeed=new Set();
  const addStored=function(r,pin,actionPin){
    if(!r)return;
    if(pin)pinnedSeed.add(r.id);
    if(actionPin)actionSeed.add(r.id);
    if(local.some(x=>x&&x.id===r.id))return;
    local.push(typeof codexFullRecord==="function"?codexFullRecord(w,r):r);
  };
  const priorContinuityIds=[];
  ((w.dm&&w.dm.continuityCodexTurns)||[]).forEach(turnIds=>(turnIds||[]).forEach(id=>{
    if(id&&priorContinuityIds.indexOf(id)<0&&priorContinuityIds.length<4)priorContinuityIds.push(id);
  }));
  // Exact identity lookup is allowed to consult the canonical store directly. The founding digest
  // intentionally suppresses the off-scene roster, but a first-turn player utterance may still name
  // someone real; roster suppression must not make that exact noun unretrievable.
  storedRecords.filter(r=>dmBeatExactMention(action,r&&r.name)).forEach(r=>addStored(r,true,true));
  dmBeatUniqueNamedRecords(action,storedRecords).forEach(r=>addStored(r,true,true));
  // A freshly minted noun is an explicit continuity handoff, not a semantic-search suggestion. Pin
  // its exact record before fuzzy relevance so "First Answer Tube" cannot lose to an older tube.
  (full.minted||[]).forEach(m=>{
    const r=m&&((typeof codexGet==="function"&&codexGet(w,m.id))||storedRecords.find(x=>x.id===m.id));
    addStored(r,true,true);
  });
  // A mentioned carried storied item already has its canonical pointer. Pin that pointer directly
  // instead of asking name similarity to rediscover it.
  ((full.pc&&full.pc.inventory)||[]).forEach(it=>{
    const carried=(full.pc&&full.pc.inventory)||[];
    if(!it||!it.codexId||!dmBeatItemMentioned(action,it,carried))return;
    const r=(typeof codexGet==="function")?codexGet(w,it.codexId):storedRecords.find(x=>x.id===it.codexId);
    addStored(r,true,true);
  });
  // A turn with an actual backward reference may need the small prior-beat band for "it/the sender".
  // Noun-free text is not automatically anaphoric: otherwise unrelated observation, travel, and
  // combat beats inherit yesterday's cast as both byte weight and soft narrative pressure. Once the
  // player explicitly pivots to a new canonical noun, revive the old band only for an object-like
  // reference.
  const objectReference=DM_BEAT_CONTINUITY_RE.test(String(action||""));
  let continuityIds=[];
  if(actionSeed.size===0&&objectReference)continuityIds=priorContinuityIds.slice(0,2);
  else if(objectReference){
    // When a newly named actor appears beside "it/the report", prefer one prior non-person referent.
    // This keeps the object definition available without hauling the last conversation's whole cast
    // into the new beat. If no object-like record exists, the explicit nouns already resolve the turn.
    continuityIds=priorContinuityIds.filter(id=>{
      const r=(typeof codexGet==="function")?codexGet(w,id):storedRecords.find(x=>x.id===id);
      return r&&r.kind!=="npc"&&r.kind!=="creature"&&r.kind!=="faction";
    }).slice(0,1);
  }
  continuityIds.forEach(id=>addStored((typeof codexGet==="function")?codexGet(w,id):
    storedRecords.find(x=>x.id===id),true,false));
  const remote=(full.codexRoster||[]).filter(r=>dmBeatMentions(action,r.id)||dmBeatMentions(action,r.name));
  remote.forEach(line=>{
    if(local.some(r=>r&&r.id===line.id)||typeof codexGet!=="function")return;
    const stored=codexGet(w,line.id);
    if(!stored)return;
    local.push(typeof codexFullRecord==="function"?codexFullRecord(w,stored):stored);
  });
  const score=r=>{
    let n=0;
    if(r&&pinnedSeed.has(r.id))n+=2000;
    if(dmBeatExactMention(action,r&&r.name))n+=1000;
    if(dmBeatMentions(action,r&&r.id)||dmBeatMentions(action,r&&r.name))n+=100;
    if(r&&r.status&&(r.status.known||r.status.soft===false))n+=20;
    if(kind==="social"&&r&&(r.kind==="npc"||r.kind==="creature"||r.kind==="faction"))n+=15;
    if(kind==="inventory"&&r&&r.kind==="item")n+=15;
    if(kind==="scene"&&r&&(r.kind==="location"||r.kind==="npc"||r.kind==="object"))n+=10;
    return n;
  };
  const cap=kind==="social"?5:(kind==="combat"||kind==="inventory"?2:4);
  const ordered=local.map((r,i)=>({r,i,s:score(r)})).sort((a,b)=>b.s-a.s||a.i-b.i).map(x=>x.r);
  const selected=ordered.slice(0,cap).map(r=>dmBeatCodexRecord(w,r,kind)).filter(Boolean);
  const pinnedIds=selected.filter(r=>pinnedSeed.has(r.id)||dmBeatExactMention(action,r&&r.name)).map(r=>r.id);
  const selectedIds=new Set(selected.map(r=>r.id));
  return {selected,pinnedIds,actionIds:Array.from(actionSeed).filter(id=>selectedIds.has(id)),
    continuityIds:continuityIds.filter(id=>selectedIds.has(id)),total:local.length,roster:(full.codexRoster||[]).length};
}

function dmBeatSelectedItems(pc, action, kind){
  const items=(pc&&pc.inventory)||[], eq=(pc&&pc.equipped)||{};
  const equippedIds=new Set(Object.keys(eq||{}).map(k=>eq[k]).filter(Boolean));
  const equipmentRelevant=kind==="combat"||kind==="travel"||kind==="scene";
  const scored=items.map((it,i)=>({it,i,s:(dmBeatItemMentioned(action,it,items)?100:0)+
    (equipmentRelevant&&equippedIds.has(it.id)?50:0)}));
  scored.sort((a,b)=>b.s-a.s||a.i-b.i);
  const cap=kind==="inventory"?16:(kind==="combat"?8:4);
  const takeAll=kind==="inventory"&&items.length<=cap;
  const wantsContents=kind==="inventory"&&DM_BEAT_INVENTORY_WHOLE_RE.test(String(action||"").toLowerCase());
  const chosen=(takeAll||wantsContents?scored.slice(0,cap).map(x=>x.it):
    scored.filter(x=>x.s>0).slice(0,cap).map(x=>x.it)).map(it=>{
      // Empty condition arrays are full-snapshot scaffolding, not useful turn context. Preserve every
      // stable identity and non-default state while keeping whole-pouch checks cheap.
      const row={id:it.id,name:it.name};
      if(it.qty!=null)row.qty=it.qty;
      if(it.conditions&&it.conditions.length)row.conditions=dmBeatClone(it.conditions);
      if(it.codexId)row.codexId=it.codexId;
      return row;
    });
  return {items:chosen,total:items.length};
}

function dmBeatPc(pc, action, kind, includeInventory){
  if(!pc)return null;
  const out={id:pc.id||null,name:pc.name,headline:pc.headline||null,pronouns:pc.pronouns||null,
    class:pc.class||null,level:pc.level||1,hp:dmBeatClone(pc.hp),conditions:dmBeatClone(pc.conditions||[])};
  if(pc.ko)out.ko=dmBeatClone(pc.ko);
  if(pc.marks&&pc.marks.length)out.marks=dmBeatClone(pc.marks);
  if(pc.concentration)out.concentration=dmBeatClone(pc.concentration);
  const selected=dmBeatSelectedItems(pc,action,includeInventory?"inventory":kind);
  if(kind==="inventory"){
    out.gold=pc.gold||0; out.inventory=selected.items; out.equipped=dmBeatClone(pc.equipped);
    out.equippedWeapons=dmBeatClone(pc.equippedWeapons);
    if(pc.toolsCharms)out.toolsCharms=dmBeatClone(pc.toolsCharms);
  } else if(kind==="combat"){
    out.ac=pc.ac; out.profBonus=pc.profBonus; out.mods=dmBeatClone(pc.mods); out.saveProfs=dmBeatClone(pc.saveProfs||[]);
    out.skillProfs=dmBeatClone(pc.skillProfs||[]); out.resources=dmBeatClone(pc.resources); out.equipped=dmBeatClone(pc.equipped);
    out.equippedWeapons=dmBeatClone(pc.equippedWeapons); if(selected.items.length)out.inventory=selected.items;
    if(pc.cantrips)out.cantrips=dmBeatClone(pc.cantrips); if(pc.spells)out.spells=dmBeatClone(pc.spells);
  } else if(kind==="social"){
    out.background=pc.background||null; out.gold=pc.gold||0; out.mods=dmBeatClone(pc.mods);
    out.skillProfs=dmBeatClone(pc.skillProfs||[]); if(pc.toolsCharms)out.toolsCharms=dmBeatClone(pc.toolsCharms);
    if(selected.items.length)out.inventory=selected.items;
  } else if(kind==="travel"){
    out.ac=pc.ac; out.resources=dmBeatClone(pc.resources); out.equipped=dmBeatClone(pc.equipped);
    if(selected.items.length)out.inventory=selected.items;
  } else {
    out.background=pc.background||null; out.ac=pc.ac;
    if(selected.items.length)out.inventory=selected.items;
  }
  if(includeInventory&&kind!=="inventory"){
    out.inventory=selected.items; out.equipped=dmBeatClone(pc.equipped);
    if(pc.toolsCharms)out.toolsCharms=dmBeatClone(pc.toolsCharms);
  }
  if(selected.total>selected.items.length&&(includeInventory||kind==="inventory"||selected.items.length))out.inventoryMore=selected.total-selected.items.length;
  return out;
}

function dmBeatClockRatio(x){
  const m=String((x&&x.clock)||"0/1").match(/(\d+)\s*\/\s*(\d+)/);
  return m&&Number(m[2])?Number(m[1])/Number(m[2]):0;
}

function dmBeatPressureSlice(list, action, limit){
  const a=(list||[]).map((x,i)=>({x,i,mention:dmBeatMentions(action,x.clockId)||dmBeatMentions(action,x.faction)||dmBeatMentions(action,x.danger)||dmBeatMentions(action,x.kind),ratio:dmBeatClockRatio(x)}));
  a.sort((p,q)=>(q.mention-p.mention)||(q.ratio-p.ratio)||((q.x.dominant?1:0)-(p.x.dominant?1:0))||p.i-q.i);
  return a.slice(0,limit).map(v=>dmBeatClone(v.x));
}

function dmBeatLedgerSlice(list, action){
  const rows=(list||[]), keep=new Set(); let matched=null;
  rows.slice(-2).forEach(r=>keep.add(r));
  for(let i=rows.length-1;i>=0;i--){if(dmBeatMentions(action,rows[i].text)){matched=rows[i];keep.add(rows[i]);break;}}
  return rows.filter(r=>keep.has(r)).slice(-3).map(r=>Object.assign(dmBeatClone(r),r===matched?{matched:true}:{}));
}

/* Byte fitting must not discard the exact canonical fact the action asked to recall merely because
   a later bookkeeping line (usually XP) is newer. Keep chronology, but prefer a matched row whenever
   the ledger slice is forced down to one or two entries. */
function dmBeatFitLedger(rows,cap){
  rows=rows||[]; if(rows.length<=cap)return rows;
  const matched=rows.filter(r=>r&&r.matched), newest=rows[rows.length-1], keep=[];
  matched.slice(-cap).forEach(r=>keep.push(r));
  if(keep.length<cap&&newest&&keep.indexOf(newest)<0)keep.push(newest);
  for(let i=rows.length-1;keep.length<cap&&i>=0;i--)if(keep.indexOf(rows[i])<0)keep.push(rows[i]);
  const chosen=new Set(keep); return rows.filter(r=>chosen.has(r)).slice(-cap);
}

function dmBeatCustodySlice(list,action){
  const rows=list||[];
  const scored=rows.map((r,i)=>({r,i,s:(dmBeatMentions(action,r&&r.item&&r.item.id)||
    dmBeatMentions(action,r&&r.item&&r.item.name)||dmBeatMentions(action,r&&r.holder&&r.holder.ref)||
    dmBeatMentions(action,r&&r.holder&&r.holder.name))?100:0}));
  scored.sort((a,b)=>b.s-a.s||b.i-a.i);
  const relevant=scored.filter(x=>x.s>0), chosen=(relevant.length?relevant:scored).slice(0,2).map(x=>dmBeatClone(x.r));
  chosen.forEach(r=>{if(r&&typeof r.note==="string"&&r.note.length>160)r.note=r.note.slice(0,157)+"…";});
  return {rows:chosen,total:rows.length};
}

function dmBeatWalkSlice(walk, kind){
  if(!walk)return null;
  const here=(walk.segments||[]).find(s=>s.state==="here")||null;
  const out={nodeId:walk.nodeId,place:walk.place,environment:walk.environment,topology:walk.topology||null,
    skin:dmBeatClone(walk.skin),risk:dmBeatClone(walk.risk),spiceTier:walk.spiceTier||null,
    cursor:dmBeatClone(walk.cursor),segments:[],ambientPresence:dmBeatClone(walk.ambientPresence)};
  if(kind==="travel"){
    out.briefing=typeof walk.briefing==="string"?dmBeatCompactValue(walk.briefing):dmBeatClone(walk.briefing);
    out.segments=(walk.segments||[]).map(dmBeatClone); out.cast=dmBeatClone(walk.cast);
  } else if(here){
    out.cursor={current:walk.cursor&&walk.cursor.current,total:walk.cursor&&walk.cursor.total,done:!!(walk.cursor&&walk.cursor.done)};
    // A social/inventory-heavy action can still cross a walk boundary ("pin the packet, then take
    // the west roof"). Preserve graph-marked immediate exits in every non-combat view; otherwise
    // the view classifier silently strips the exact destination the DM must adjudicate next.
    out.segments=(walk.segments||[]).filter(s=>s&&s.state==="here"||s&&s.approach).map(dmBeatClone);
  }
  return out;
}

function dmBeatNonEmpty(v){
  if(v==null)return false;
  if(Array.isArray(v))return v.length>0;
  if(typeof v==="object")return Object.keys(v).length>0;
  return true;
}

function dmBeatPut(out,key,value){ if(dmBeatNonEmpty(value))out[key]=value; }

/* Last-resort structural fitting removes recall conveniences before live truth. It never removes the
   current location/clock/PC, the newest consequence, the hottest faction/front, a mentioned/local
   entity's first record, combat state, the current walk segment, or a pending situation. */
function dmBeatFitDigest(d, target){
  const out=dmBeatClone(d), bytes=()=>dmBeatBytes(out);
  if(bytes()<=target)return out;
  delete out.gazetteer;
  if(bytes()<=target)return out;
  if(out.recentLedger&&out.recentLedger.length>2)out.recentLedger=dmBeatFitLedger(out.recentLedger,2);
  if(bytes()<=target)return out;
  if(out.sessionLean&&out.sessionLean.echo)delete out.sessionLean.echo;
  if(bytes()<=target)return out;
  if(out.activeWalk&&out.activeWalk.segments&&out.activeWalk.segments.length>3){
    const segs=out.activeWalk.segments, idx=segs.findIndex(s=>s.state==="here");
    // Preserve every immediate graph exit carrying `approach:true`; array neighbors are not the
    // same thing as reachable rooms in Web/Branch topologies. Add one behind stub only when cheap.
    const keep=segs.filter(s=>s&&s.state==="here"||s&&s.approach);
    if(keep.length<3&&idx>0)keep.unshift(segs[idx-1]);
    out.activeWalk.segments=keep;
    out.activeWalk.moreSegments=segs.length-out.activeWalk.segments.length;
  }
  if(bytes()<=target)return out;
  delete out.revealed;
  if(bytes()<=target)return out;
  delete out.ambientPresence;
  if(bytes()<=target)return out;
  delete out.prepPending;
  if(bytes()<=target)return out;
  if(out.powers&&out.powers.length>1)out.powers=out.powers.slice(0,1);
  if(bytes()<=target)return out;
  if(out.recentLedger&&out.recentLedger.length>1)out.recentLedger=dmBeatFitLedger(out.recentLedger,1);
  if(bytes()<=target)return out;
  if(out.codex&&out.codex.length>1){
    const pins=new Set((out.retrieval&&out.retrieval.pinnedCodexIds)||[]);
    const pinned=out.codex.filter(r=>r&&pins.has(r.id));
    const keep=(pinned.length?pinned:out.codex.slice(0,1));
    const removed=out.codex.length-keep.length; out.codex=keep;
    out.retrieval.omitted.codex=(out.retrieval.omitted.codex||0)+removed;
  }
  if(bytes()<=target)return out;
  if(out.pc&&out.pc.inventory&&out.pc.inventory.length>8){
    const removed=out.pc.inventory.length-8; out.pc.inventory=out.pc.inventory.slice(0,8);
    out.pc.inventoryMore=(out.pc.inventoryMore||0)+removed;
  }
  if(bytes()<=target)return out;
  if(out.pc)delete out.pc.headline;
  if(bytes()<=target)return out;
  if(out.pc)delete out.pc.background;
  if(bytes()<=target)return out;
  if(out.pc)delete out.pc.pronouns;
  if(bytes()<=target)return out;
  // Two or more explicitly addressed records can legitimately exceed the cap even after every
  // unrelated slice is gone. Preserve every canonical identity and story-bearing field, but peel
  // mechanical/default flags and reusable casting boilerplate before admitting an oversized turn.
  // Object insertion order puts later play-authored fields after the rolled role/species/demeanor
  // shell, so the fallback below naturally keeps the newest state when a very tight cap demands it.
  if(out.codex&&out.codex.length){
    out.codex.forEach(r=>{
      if(r.dm){delete r.dm.discoveryRolled;delete r.dm.engaged;if(!Object.keys(r.dm).length)delete r.dm;}
      if(r.status){if(r.status.known===true)delete r.status.known;if(r.status.soft===false)delete r.status.soft;
        if(!Object.keys(r.status).length)delete r.status;}
      if(r.attitude){if(!r.attitude.terrified)delete r.attitude.terrified;if(!r.attitude.read)delete r.attitude.read;
        if(!Object.keys(r.attitude).length)delete r.attitude;}
      delete r.gifts;delete r.witness;delete r.links;
    });
  }
  if(bytes()<=target)return out;
  ["species","role","occupation","demeanor","appearance","voice"].forEach(key=>{
    (out.codex||[]).forEach(r=>{if(bytes()>target&&r.fields&&key in r.fields){delete r.fields[key];if(!Object.keys(r.fields).length)delete r.fields;}});
  });
  if(bytes()<=target)return out;
  (out.codex||[]).forEach(r=>{
    while(bytes()>target&&r.fields&&Object.keys(r.fields).length>1){delete r.fields[Object.keys(r.fields)[0]];}
  });
  if(bytes()<=target)return out;
  (out.codex||[]).slice().reverse().forEach(r=>{if(bytes()>target)delete r.attitude;});
  if(bytes()<=target)return out;
  (out.codex||[]).slice().reverse().forEach(r=>{if(bytes()>target)delete r.status;});
  if(bytes()>target)out.retrieval.overTargetBytes=bytes();
  return out;
}

function dmBeatDigest(w, action, route, opts){
  if(!w)return null; opts=opts||{};
  const full=opts.full||((typeof dmDigest==="function")?dmDigest():null); if(!full)return null;
  const profile=dmBeatProfile(w,action,route,full), kind=profile.kind;
  const codex=dmBeatCodexSlice(w,action,full,kind);
  const powerLimit=kind==="scene"||kind==="social"?2:1;
  const frontLimit=kind==="scene"||kind==="travel"?2:1;
  const powers=dmBeatPressureSlice(full.powers,action,powerLimit);
  const fronts=dmBeatPressureSlice((full.fronts||[]).filter(x=>!x.closed||dmBeatMentions(action,x.danger)||dmBeatMentions(action,x.kind)),action,frontLimit);
  const ledger=dmBeatLedgerSlice(full.recentLedger,action);
  const custody=dmBeatCustodySlice(full.itemCustody,action);
  const gazetteer=(full.gazetteer||[]).filter(g=>dmBeatMentions(action,g.name)||dmBeatMentions(action,g.desc)).slice(-2).map(dmBeatClone);
  const out={schema:DM_BEAT_DIGEST_SCHEMA,view:kind,slices:profile.slices,worldId:full.worldId,worldName:full.worldName,
    clock:dmBeatClone(full.clock),location:full.location};
  dmBeatPut(out,"setting",full.setting);
  dmBeatPut(out,"pc",dmBeatPc(full.pc,action,kind,profile.inventoryRelevant));
  dmBeatPut(out,"powers",powers); dmBeatPut(out,"fronts",fronts);
  dmBeatPut(out,"recentLedger",ledger); dmBeatPut(out,"gazetteer",gazetteer);
  dmBeatPut(out,"codex",codex.selected);
  dmBeatPut(out,"minted",(full.minted||[]).slice(0,4).map(dmBeatClone));
  dmBeatPut(out,"revealed",full.revealed);
  if(kind==="scene"||kind==="travel"){
    dmBeatPut(out,"sessionLean",full.sessionLean); dmBeatPut(out,"tarot",full.tarot);
  }
  // A pre-engagement combat-shaped action still needs the generated room and reachable exits. Once
  // combat is live, the tracker owns scene geometry and the lean combat-only packet stays unchanged.
  if(full.activeWalk&&(kind!=="combat"||!full.combat))
    dmBeatPut(out,"activeWalk",dmBeatWalkSlice(full.activeWalk,kind));
  dmBeatPut(out,"ambientPresence",full.ambientPresence);
  if(kind==="combat")dmBeatPut(out,"combat",full.combat);
  dmBeatPut(out,"prepPending",full.prepPending); dmBeatPut(out,"levelUp",full.levelUp);
  dmBeatPut(out,"arrivalBrief",full.arrivalBrief); dmBeatPut(out,"pendingSituation",full.pendingSituation);
  dmBeatPut(out,"itemCustody",custody.rows);
  // The legacy register describes storied items that already left the carried inventory. Merely
  // using a current item must not resurrect every old transfer; retrieve it only when the player is
  // actually asking about a loss, theft, confiscation, recovery, or legacy.
  if(DM_BEAT_LEGACY_RE.test(String(action||"").toLowerCase()))dmBeatPut(out,"itemLegacy",full.itemLegacy);
  if(full.bastion&&(full.bastion.atNow||kind==="inventory"))dmBeatPut(out,"bastion",full.bastion);
  const omitted={};
  const omittedCodex=codex.roster+Math.max(0,codex.total-codex.selected.length); if(omittedCodex)omitted.codex=omittedCodex;
  if((full.powers||[]).length>powers.length)omitted.powers=(full.powers||[]).length-powers.length;
  if((full.fronts||[]).length>fronts.length)omitted.fronts=(full.fronts||[]).length-fronts.length;
  if((full.gazetteer||[]).length>gazetteer.length)omitted.gazetteer=(full.gazetteer||[]).length-gazetteer.length;
  if((full.itemCustody||[]).length>custody.rows.length)omitted.itemCustody=(full.itemCustody||[]).length-custody.rows.length;
  out.retrieval={omitted,rule:"Omitted state remains authoritative. Use supplied ids; never invent an omitted fact."};
  if(codex.pinnedIds.length)out.retrieval.pinnedCodexIds=codex.pinnedIds;
  if(codex.actionIds.length)out.retrieval.actionCodexIds=codex.actionIds;
  if(codex.continuityIds.length)out.retrieval.continuityCodexIds=codex.continuityIds;
  return dmBeatFitDigest(out,opts.targetBytes||DM_BEAT_TARGET_BYTES);
}
