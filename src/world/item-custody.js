/* GENESIS MODULE — src/world/item-custody.js — durable portable-item custody.
   -------------------------------------------------------------------------
   Inventory owns items carried by a character. Corpse state owns items still on a body. This
   module owns the small third case: a portable item deliberately placed with an NPC, creature,
   faction, container, place, or scene object. The record is gameplay state, never presentation
   state, so Story mode and a future node-map/renderer read the same truth.

   `item_transfer` in world.dm moves an already-owned instance; `item_placed` originates newly
   revealed scene loot directly at a stable holder. This module supplies their destination
   vocabulary, the lazy persistent store, collision reads, and a current-scene digest. It never
   interprets player prose and never moves an item itself.

   Persistent shape (additive on the world; old saves need no eager migration):
     w.itemCustody = { version:2, items:{
       [instanceId]: { item:<full instance>, holder:{kind,ref,name?},
                       from:{kind,ref,name?}, at:{nodeId,walkId?,seg?,day,min}, intent, note? }
     }}

   An instance exists in exactly one physical owner: a sheet inventory, corpse.items, or this
   registry. The registry therefore holds the full instance rather than a second snapshot. */

"use strict";

const ITEM_CUSTODY_VERSION = 2;
const ITEM_TRANSFER_DESTINATION_KINDS = Object.freeze([
  "pc", "npc", "creature", "faction", "container", "corpse", "place", "object"
]);
const ITEM_TRANSFER_INTENTS = Object.freeze([
  "transfer", "entrust", "gift", "loan", "place", "confiscated", "stolen", "lost"
]);

function itemTransferIntent(raw){
  const intent=String(raw||"transfer").trim().toLowerCase();
  return ITEM_TRANSFER_INTENTS.indexOf(intent)>=0?intent:null;
}

function itemTransferInvoluntary(intent){
  return intent==="confiscated"||intent==="stolen"||intent==="lost";
}

function itemCustodyIntentFromNote(note){
  const s=String(note||"").toLowerCase();
  if(/\bentrust(?:s|ed|ing)?\b/.test(s))return "entrust";
  if(/\b(?:gift|gives?|gave|donat(?:e|es|ed|ing))\b/.test(s))return "gift";
  if(/\b(?:loan|lend|lends|lent)\b/.test(s))return "loan";
  if(/\b(?:place|places|placed|put|puts|set|sets|leave|leaves|left)\b/.test(s))return "place";
  if(/\b(?:confiscat|seiz|stole|stolen|theft|lost)\w*\b/.test(s))return "confiscated";
  return null;
}

function itemCustodyOf(w){
  if(!w.itemCustody) w.itemCustody={version:ITEM_CUSTODY_VERSION,items:{}};
  if(!w.itemCustody.items || typeof w.itemCustody.items!=="object" || Array.isArray(w.itemCustody.items))
    w.itemCustody.items={};
  if(w.itemCustody.version==null) w.itemCustody.version=ITEM_CUSTODY_VERSION;
  return w.itemCustody;
}

/* Version-1 custody recorded every NPC handoff as a hostile claim because it had no intent field.
   Migrate only when the saved note itself proves a voluntary handoff; ambiguous old transfers retain
   their old legacy state. This repairs the Brineglass entrustment without rewriting genuine theft. */
function itemCustodyMigrate(w){
  const C=w&&w.itemCustody;
  if(!C||!C.items||typeof C.items!=="object")return C||null;
  if((C.version||1)>=ITEM_CUSTODY_VERSION)return C;
  Object.keys(C.items).forEach(id=>{
    const rec=C.items[id];if(!rec||!rec.item)return;
    const inferred=itemCustodyIntentFromNote(rec.note);
    rec.intent=inferred||rec.intent||"transfer";
    if(!inferred||itemTransferInvoluntary(inferred)||!rec.item.codexId||typeof codexGet!=="function")return;
    const item=codexGet(w,rec.item.codexId), legacy=item&&item.legacy;
    if(!legacy||!/^(?:claimed-|dropped$)/.test(legacy.lossState||""))return;
    if(legacy.recoveryHookId&&typeof codexUpdate==="function")
      codexUpdate(w,legacy.recoveryHookId,{status:{condition:"resolved"},note:"voluntary custody; no recovery required"});
    legacy.lossState="transferred";legacy.recoveryHookId=null;
    if(typeof codexTouch==="function")codexTouch(codexOf(w),item);
  });
  C.version=ITEM_CUSTODY_VERSION;
  return C;
}

/* Read without ensuring: failure paths in item_transfer use this so a rejected operation remains
   byte-identical, including on a vintage world that has never needed a custody store. */
function itemCustodyFind(w,itemId){
  const C=w&&w.itemCustody;
  return C&&C.items&&typeof C.items==="object" ? (C.items[itemId]||null) : null;
}

function itemCustodyIdExists(w,itemId,ignoreItem){
  if(!w || !itemId) return false;
  const foundCharacter=(w.characters||[]).some(c=>{
    const inv=c&&c.sheet&&Array.isArray(c.sheet.inventory)?c.sheet.inventory:[];
    const corpse=c&&c.corpse&&Array.isArray(c.corpse.items)?c.corpse.items:[];
    return inv.concat(corpse).some(it=>it!==ignoreItem && it && it.id===itemId);
  });
  const custody=itemCustodyFind(w,itemId);
  return foundCharacter || !!(custody && custody.item!==ignoreItem);
}

/* Only current-scene custody rides the ordinary turn digest. A placement made on an active walk is
   scoped to that exact walk segment while a walk is active; node-only legacy records retain the old
   current-node behavior. Once no walk is active, completed/abandoned segment objects remain physical
   residue at their node and become node-wide discoverable again — closing a walk must not make its
   strongbox, evidence, or dropped gear disappear. Derive the live scope read-only when callers omit
   it so every digest/snapshot caller agrees. */
function itemCustodyDigest(w,opts){
  const C=w&&w.itemCustody;
  if(!C || !C.items || typeof C.items!=="object") return null;
  opts=opts||{};
  const here=opts.nodeId!==undefined?opts.nodeId:(w.currentNodeId||null);
  const P=w&&w.prep, activeWalk=opts.walkId!==undefined?opts.walkId:(P&&P.activeWalkId||null);
  const activePn=activeWalk&&P&&P.nodes&&P.nodes[activeWalk];
  const activeSeg=opts.seg!==undefined?opts.seg:(activePn&&activePn.cursor?activePn.cursor.current:null);
  const cap=Math.max(1,Math.floor(Number(opts.cap)||8));
  const rows=Object.keys(C.items).map(id=>C.items[id]).filter(rec=>{
    if(!rec || !rec.item || !rec.holder) return false;
    const at=rec.at&&rec.at.nodeId;
    if(!(here==null ? at==null : at===here)) return false;
    if(rec.at&&rec.at.walkId!=null&&activeWalk!=null){
      if(activeWalk!==rec.at.walkId) return false;
      if(rec.at.seg!=null && activeSeg!==rec.at.seg) return false;
    }
    return true;
  }).slice(-cap).map(rec=>({
    item:{id:rec.item.id||null,name:rec.item.name||rec.item.base||"Item",qty:rec.item.qty||1,
      conditions:(rec.item.conditions||[]).slice(),codexId:rec.item.codexId||null},
    holder:{kind:rec.holder.kind,ref:rec.holder.ref,name:rec.holder.name||null},
    intent:rec.intent||"transfer",
    note:rec.note||null
  }));
  return rows.length?rows:null;
}
