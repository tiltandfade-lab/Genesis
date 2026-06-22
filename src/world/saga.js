/* GENESIS MODULE — src/world/saga.js — the Saga: a character's most significant entities.
   Built 2026-06-21 for the Death & Rebirth loop (docs/DEATH-AND-REBIRTH.md, build step 1).
   The dead PC's Saga (top ~7 entities — NPCs / enemies / factions / places / threads) is what the
   14 bardo vision-rolls act on, and the seed for the world's drift while the hero is gone.
   Pure read over the world ledger + gazetteer + faction web; ranks each entity by
   stake × frequency × recency, then keeps the top SAGA_MAX.
   Classic <script>, shared global scope. Reads ledgerOf/nodeName/slug (world.state) at call-time. */

const SAGA_MAX=7;

/* one stable key per entity, so the same name from many ledger lines accumulates into one Saga node */
function sagaKey(type,name){return type+":"+slug(name||"");}

/* Derive a character's Saga from current world state. Returns a ranked array of
   {key,type,name,desc,score,mentions,refs[]} — does NOT mutate (refreshSaga stores it). */
function computeSaga(w,c){
  if(!w||!c)return [];
  const led=ledgerOf(w),cand={};
  const N=led.length||1;
  const bump=(type,name,desc,stake,refId,recency)=>{
    if(!name)return;
    const k=sagaKey(type,name);
    let e=cand[k];
    if(!e)e=cand[k]={key:k,type,name,desc:desc||"",score:0,mentions:0,refs:[]};
    if(desc&&!e.desc)e.desc=desc;
    e.mentions++;
    e.score+=stake+(recency||0);
    if(refId&&e.refs.indexOf(refId)<0)e.refs.push(refId);
  };
  led.forEach((ent,i)=>{
    const d=ent.data||{},rec=(i+1)/N*3;            // 0..3 — later entries weigh more (recency)
    const mine=(d.fromChar===c.id);                 // tied to THIS character's own life
    if(ent.type==="npc-life"&&d.role){              // people from the PC's past
      const isEnemy=/enem|hostile|rival|nemesis/i.test(d.role);
      bump(isEnemy?"enemy":"npc",d.role,d.desc,(mine?5:1)+(isEnemy?2:0),ent.id,rec);
    } else if(ent.type==="canon"&&d.kind==="thread"&&d.text){   // open hooks (lost love, wanted, a search)
      bump("thread",d.text,"",(mine?5:2),ent.id,rec);
    } else if(ent.type==="canon"&&d.kind==="faction"&&d.name){  // the standing faction web
      bump("faction",d.name,d.agenda?("means to "+d.agenda):"",d.dominant?3:2,ent.id,rec);
    } else if(ent.type==="npc-life"&&d.kind==="faction-turn"&&d.faction){ // the web in motion
      bump("faction",d.faction,"",1,ent.id,rec);
    } else if(ent.type==="clock"&&d.kind==="faction-agenda"&&d.faction){
      bump("faction",d.faction,"",0.5,ent.id,rec);
    } else if(ent.type==="canon"&&d.kind==="place"&&d.name){    // places learned of
      bump("place",d.name,d.desc,1,ent.id,rec);
    }
  });
  // places that matter to the body of a life: birthplace, where they stand, the gazetteer
  (w.gazetteer||[]).forEach(g=>{if(g.type==="Place"||g.type==="Setting")bump("place",g.name,g.desc,g.type==="Setting"?2:1,null,1.5);});
  if(c.bornWhere)bump("place",c.bornWhere,"where they entered the world",3,null,2);
  if(c.fellWhere)bump("place",c.fellWhere,"where they fell",4,null,3);   // set once dead
  if(w.currentNodeId)bump("place",nodeName(w,w.currentNodeId),"",2,null,2.5);
  // the PC at odds with a power = high stake (the rivalry a successor may be born into)
  const st=c.entry&&c.entry.standing;
  if(st&&/enemy|wanted|watched|marked/i.test(st)&&c.entry.standingFaction)
    bump("faction",c.entry.standingFaction,"the power you stand against",4,null,2.5);
  return Object.values(cand).sort((a,b)=>b.score-a.score).slice(0,SAGA_MAX);
}

/* Compute + persist onto the character (c.saga). Called when a character is born (cgBind),
   refreshed at session start, and re-run at death before the bardo visions roll against it. */
function refreshSaga(w,c){if(!w||!c)return [];c.saga=computeSaga(w,c);return c.saga;}
