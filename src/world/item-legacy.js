/* GENESIS MODULE — src/world/item-legacy.js — the item lifecycle contract
   (docs/ITEM-LEGACY.md). Classic <script>, shared global scope (CLAUDE.md).

   When the PC dies, their best item does not vanish or sit inert: it can be
   looted, scavenged, faction-claimed, carried by an enemy, or recovered by a
   successor. The seven GPT lifecycle fields live on the CODEX item record under
   one block `r.legacy` (§1) — the inventory instance gains ZERO new fields; the
   existing `inst.codexId` link is the only seam. INFERENCE COST: ZERO — every
   transition is a typed event or a deterministic lazy check (SPEED-DOCTRINE).

   Reads at call-time: magicDef, codexGet, codexAdd, codexUpdate, codexLink,
   codexTouch, codexOf, clockOf, addLedger, uid, slug, rollDie, applyEvent,
   corpseStatus, prepCastId. Registered in manifest.json (world.item-legacy);
   loaded immediately after src/world/rebirth.js. */

/* §1 — the nine loss states. "cached" is the parked-Bastion seam (§1.1 ruling):
   the enum member exists; no v1 code path ever SETS it (item_claimed refuses it,
   §7.3). CROWNING-BASTION B1 will flip that refusal later. */
const LEGACY_LOSS_STATES = ["held","dropped","on-corpse","claimed-npc","claimed-creature",
                            "claimed-faction","cached","destroyed","unknown"];

/* §1.2 — which instances are legacy-grade (verbatim predicate). A legacy string
   item never qualifies; anything with a codex record is storied; any enchanted,
   non-consumable, non-stack instance is opt-out-proof. */
function legacyGrade(inst){
  if(!inst || typeof inst!=="object") return false;
  if(inst.codexId) return true;
  if(inst.ench){
    const md=(typeof magicDef==="function")?magicDef(inst.name):null;
    if(md && md.consumable) return false;                 // potions/oils burn — they don't legacy
    if(inst.qty && inst.qty>1) return false;              // stacks are never legacy-grade
    return true;
  }
  return false;
}

/* §3 — deep snapshot of what the thing IS (the re-mint source of truth, §4.3).
   JSON-deep-copies ench so a later mutation on the live instance can't bleed into
   the snapshot (or vice versa). */
function legacySnapshot(inst){
  const s={ name:inst.name };
  if(inst.base) s.base=inst.base;
  if(inst.ench) s.ench=JSON.parse(JSON.stringify(inst.ench));
  if(inst.qty!=null) s.qty=inst.qty;
  return s;
}

/* §1.3 — origin.how derivation from record evidence (set ONCE, never overwritten). */
function legacyDeriveOrigin(r, originHow){
  if(originHow) return { how:originHow, ref:null };
  const src=r && r.source;
  if(src && src.type==="plot") return { how:"plot", ref:src.ref||null };
  if(src && src.type==="loot") return { how:"loot", ref:src.ref||null };
  return { how:"unknown", ref:null };
}

/* §3 — ensure the codex item record + its r.legacy block exist. `inst.codexId`
   set → codexGet it (mint at that id if the record is missing). No codexId →
   codexAdd a rolled item record and write inst.codexId back. Then default
   r.legacy if absent. Returns the record. */
function legacyEnsureRecord(w, inst, opts){
  opts=opts||{};
  let r=null;
  if(inst.codexId){
    r=codexGet(w, inst.codexId);
    if(!r){
      r=codexAdd(w, { id:inst.codexId, kind:"item", name:inst.name, provenance:"rolled",
        fields:{ object:inst.name }, status:{ known:true, at:opts.at||null } });
    }
  } else {
    const id="item:"+slug(inst.name);
    r=codexAdd(w, { id, kind:"item", name:inst.name, provenance:"rolled",
      fields:{ object:inst.name }, status:{ known:true, at:opts.at||null } });
    inst.codexId=r.id;                                     // write the durable link back onto the instance
  }
  if(r && !r.legacy){
    r.legacy={
      origin: legacyDeriveOrigin(r, opts.originHow),
      claimant: { kind:"pc", ref:opts.pcId||null, name:opts.pcName||null },
      lastSeen: { nodeId:opts.at||null, day:(typeof clockOf==="function")?clockOf(w).day:0 },
      lossState: "held",
      recoveryHookId: null,
      factionInterest: null,
      decayRef: null,
      instSnapshot: legacySnapshot(inst)
    };
    if(typeof codexTouch==="function") codexTouch(codexOf(w), r);
  }
  return r;
}

/* §3 — the ONLY writer of r.legacy after ensure. `patch` sub-objects are replaced
   whole (claimant/lastSeen); origin is never overwritten; instSnapshot only when
   patch.instSnapshot is given. Touches the record (delta-digest ride-along — NOTE
   codexTouch takes the CONTAINER, so codexOf(w), §3 signature note) + appends one
   ledger line. Returns r.legacy. */
function legacyStamp(w, r, patch, prose){
  const L=r.legacy; if(!L) return null;
  patch=patch||{};
  if(patch.claimant) L.claimant=patch.claimant;
  if(patch.lastSeen) L.lastSeen=patch.lastSeen;
  if(patch.lossState!=null) L.lossState=patch.lossState;
  if(patch.factionInterest!==undefined) L.factionInterest=patch.factionInterest;
  if(patch.recoveryHookId!==undefined) L.recoveryHookId=patch.recoveryHookId;
  if(patch.decayRef!==undefined) L.decayRef=patch.decayRef;
  if(patch.instSnapshot) L.instSnapshot=patch.instSnapshot;
  // origin: never overwritten (same posture as codexAdd's origin tag).
  if(typeof codexTouch==="function") codexTouch(codexOf(w), r);
  if(typeof addLedger==="function")
    addLedger(w,"outcome",{ kind:"item-claimed", codexId:r.id, name:r.name,
      lossState:L.lossState, claimant:L.claimant, factionInterest:L.factionInterest },
      prose||("⚑ "+r.name+" — "+L.lossState+"."));
  return L;
}

/* §5 — recovery-hook thread. Mirrors dm.js:2037–2047 (the Outlandish intrusion
   thread) verbatim. One open hook max per record. Returns the thread id. */
function legacyMintHook(w, r, why){
  if(r.legacy.recoveryHookId){
    const ex=codexGet(w, r.legacy.recoveryHookId);
    if(ex && ex.status && ex.status.condition!=="resolved") return r.legacy.recoveryHookId;
  }
  const tid=(typeof prepCastId==="function")?prepCastId(w,"thread",r.name+" — where it lies now")
    :("thread:"+slug(r.name)+"-recovery-"+uid());
  const t=codexAdd(w,{ id:tid, kind:"thread", provenance:"rolled",
    name:r.name+" — where it lies now",
    fields:{ desc:why, itemCodexId:r.id },
    dm:{ legs:"thread-seed", pool:"item-legacy",
         castHolder:(r.legacy.claimant.ref==null && r.legacy.claimant.kind!=="corpse") },
    status:{ known:false, soft:true, at:(r.legacy.lastSeen&&r.legacy.lastSeen.nodeId)||null } });
  if(t && typeof codexLink==="function") codexLink(w, t.id, "part-of", r.id);
  r.legacy.recoveryHookId=t?t.id:null;
  return r.legacy.recoveryHookId;
}

/* the fixed why-vocabulary (§5) — prose the DM may read aloud when the thread surfaces. */
function legacyHookWhy(lossState, r, fellWhere, faction){
  const where=fellWhere||"parts unknown";
  switch(lossState){
    case "on-corpse":        return "It lies with "+((r.legacy.claimant&&r.legacy.claimant.name)||"the fallen")+"'s body at "+where+".";
    case "claimed-npc":      return "Someone walked away from "+where+" carrying it.";
    case "claimed-creature": return "Something dragged it off toward its den.";
    case "claimed-faction":  return (faction||"A faction")+" holds it now, and knows what it has.";
    case "unknown":          return "The trail went cold at "+where+".";
    default:                 return "Where "+r.name+" went is not yet known.";
  }
}

/* §4.1 — killCharacter stamps every legacy-grade carried item on-corpse. Returns
   the count stamped. Auto-promotes an enchanted item with no codex record. */
function corpseLegacyStamp(w, c){
  if(!c || !c.corpse || !Array.isArray(c.corpse.items)) return 0;
  const at=w.currentNodeId||null;
  let n=0;
  c.corpse.items.forEach(function(inst){
    if(!legacyGrade(inst)) return;
    const r=legacyEnsureRecord(w, inst, { at, pcId:c.id, pcName:c.name, originHow:"start" });
    if(!r) return;
    n++;
    // emit the detected custody event (the ledger line + claimant write ride this)
    if(typeof applyEvent==="function")
      applyEvent(w,{ type:"item_claimed", source:"detected", payload:{
        codexId:inst.codexId, by:{ kind:"corpse", ref:c.id, name:c.name },
        lossState:"on-corpse", at } });
    // fold in the decay pointer (one ledger line per item, not two — done via a
    // direct legacyStamp of just the pointer, no lossState change) + mint the hook.
    legacyStamp(w, r, { decayRef:{ kind:"corpse", charId:c.id } },
      "⚑ "+r.name+" rests with "+c.name+"'s body — recoverable while the corpse lasts.");
    legacyMintHook(w, r, legacyHookWhy("on-corpse", r, c.fellWhere));
  });
  return n;
}

/* §4.4 — the enemy-gets-your-gear path. Lazy, deterministic, ONE roll per corpse
   EVER, engine-owned d6. Returns null | {taken:codexId|null, by:{...}}. */
const SCAVENGE_TEETH={ den:3, travelled:2, wild:1, sealed:0 };   // rollDie(6) <= teeth ⇒ scavenged

function corpseScavengeResolve(w, c){
  if(!c || !c.corpse || c.corpse.looted || c.corpse.scav) return null;
  if(typeof corpseStatus!=="function") return null;
  const st=corpseStatus(w,c);
  if(st!=="disturbed" && st!=="gone") return null;
  c.corpse.scav={ rolled:true, taken:null };               // stamp first — never re-rolls, even on early exit
  const items=c.corpse.items||[];
  const tag=(c.corpse.context&&c.corpse.context.tag)||"wild";
  const teeth=(SCAVENGE_TEETH[tag]!=null)?SCAVENGE_TEETH[tag]:1;
  const roll=(typeof rollDie==="function")?rollDie(6):6;
  const at=(typeof slug==="function")?slug(c.fellWhere||""):null;

  const goneSweep=function(){
    // §4.4 step 4 — a "gone" corpse: every REMAINING legacy item's trail goes cold.
    if(corpseStatus(w,c)!=="gone") return;
    items.forEach(function(inst){
      if(!legacyGrade(inst) || !inst.codexId) return;
      if(typeof applyEvent==="function")
        applyEvent(w,{ type:"item_claimed", source:"detected", payload:{
          codexId:inst.codexId, by:{ kind:"none", ref:null, name:null },
          lossState:"unknown", at } });
    });
  };

  if(roll>teeth){
    // a miss. On "disturbed" ONLY, note the undisturbed body; a "gone" miss still sweeps.
    if(st==="disturbed" && typeof addLedger==="function")
      addLedger(w,"drift",{ kind:"corpse-undisturbed", char:c.id },
        "◇ "+c.name+"'s body lies picked-over but its best piece is still there.");
    goneSweep();
    return c.corpse.scav;
  }

  // a hit — pick ONE victim: the legacy-grade instance with ench (first by array order); else the
  // first legacy-grade instance; none → nothing lifecycle-tracked.
  let victim=items.find(function(it){ return legacyGrade(it) && it.ench; });
  if(!victim) victim=items.find(legacyGrade);
  if(!victim){ goneSweep(); return c.corpse.scav; }

  const vi=items.indexOf(victim);
  if(vi>=0) items.splice(vi,1);                            // remove by identity

  const r=victim.codexId?codexGet(w, victim.codexId):null;
  const faction=(r&&r.legacy&&r.legacy.factionInterest)||null;
  let by, lossState;
  if(faction){ by={ kind:"faction", ref:(typeof slug==="function"?slug(faction):faction), name:faction }; lossState="claimed-faction"; }
  else if(tag==="den" || tag==="wild"){ by={ kind:"creature", ref:null, name:null }; lossState="claimed-creature"; }
  else { by={ kind:"npc", ref:null, name:null }; lossState="claimed-npc"; }   // travelled (and any fallthrough)

  if(victim.codexId && typeof applyEvent==="function")
    applyEvent(w,{ type:"item_claimed", source:"detected", payload:{
      codexId:victim.codexId, by, lossState, at } });

  c.corpse.scav.taken=victim.codexId||null;
  goneSweep();                                             // the rest of a "gone" body still goes cold
  return c.corpse.scav;
}

/* §6 — the DM digest slice. null when empty (digest diet — zero bytes on the
   common turn), else an array capped at 5, sorted by lastSeen.day descending.
   Selection: every codex item record whose lossState is not held/destroyed. */
function legacyDigest(w){
  const C=(typeof codexOf==="function")?codexOf(w):null;
  if(!C || !C.records) return null;
  const rows=[];
  Object.keys(C.records).forEach(function(id){
    const r=C.records[id];
    if(!r || r.kind!=="item" || !r.legacy || !r.legacy.lossState) return;
    if(r.legacy.lossState==="held" || r.legacy.lossState==="destroyed") return;
    const L=r.legacy;
    rows.push({ codexId:r.id, name:r.name, lossState:L.lossState,
      claimant:{ kind:L.claimant&&L.claimant.kind, name:(L.claimant&&L.claimant.name)||null },
      lastSeenAt:(L.lastSeen&&L.lastSeen.nodeId)||null, lastSeenDay:(L.lastSeen&&L.lastSeen.day)||0,
      hookId:L.recoveryHookId||null, factionInterest:L.factionInterest||null,
      ench:!!(L.instSnapshot&&L.instSnapshot.ench) });
  });
  if(!rows.length) return null;
  rows.sort(function(a,b){ return b.lastSeenDay-a.lastSeenDay; });
  return rows.slice(0,5);
}
