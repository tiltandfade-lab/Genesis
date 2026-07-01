/* GENESIS MODULE — src/world/inventory.js — the player-facing inventory ACTIONS (docs/ITEMS.md).
   The interactive layer the character panel's read-only render was missing: equip/unequip a slot and
   use a consumable, driven from inline onclick handlers (classic <script>, shared global scope). Each
   handler is a thin shell — it dispatches the real EVENT-CONTRACT event through applyEvent (world/dm.js),
   which owns every mutation + ledger write, then persists (saveU) and re-renders. The engine owns the
   numbers (which slot fits, whether the item is consumable); this file only wires the click. Reads
   activeWorld/saveU (world.state), livingSheet/applyEvent (world.dm), baseDef/magicDef (engine.combat),
   toast/renderWorld (ui) at call-time. */

/* the equip slot an item belongs in, from its resolved base kind (armor→armor, shield→offHand, weapon→
   mainHand). A caller may override (a Light weapon into the off-hand for dual-wield). null = not equippable. */
function slotForItem(inst){
  const def=(typeof baseDef==="function")?baseDef(inst):null;
  if(!def)return null;
  if(def.kind==="armor")return "armor";
  if(def.kind==="shield")return "offHand";
  if(def.kind==="weapon")return "mainHand";
  return null;
}

function equipItem(itemId, slotOverride){
  const w=(typeof activeWorld==="function")&&activeWorld(); if(!w)return;
  const t=(typeof livingSheet==="function")&&livingSheet(w); if(!t)return;
  const inst=(t.sh.inventory||[]).find(x=>x.id===itemId); if(!inst)return;
  const slot=slotOverride||slotForItem(inst);
  if(!slot){ if(typeof toast==="function")toast("That can't be equipped."); return; }
  const r=applyEvent(w,{type:"equip",payload:{itemId,slot},source:"player"});
  if(r&&r.ok){ if(typeof toast==="function")toast("Equipped "+inst.name+(r.ac!=null?" — AC "+r.ac:"")+"."); saveU(U); renderWorld(); }
  else if(typeof toast==="function")toast("Can't equip "+inst.name+(r&&r.reason?(" ("+r.reason+")"):"")+".");
}

function unequipSlot(slot){
  const w=(typeof activeWorld==="function")&&activeWorld(); if(!w)return;
  const r=applyEvent(w,{type:"unequip",payload:{slot},source:"player"});
  if(r&&r.ok){ if(typeof toast==="function")toast("Unequipped ("+slot+")"+(r.ac!=null?" — AC "+r.ac:"")+"."); saveU(U); renderWorld(); }
}

function setGrip(grip){
  const w=(typeof activeWorld==="function")&&activeWorld(); if(!w)return;
  const r=applyEvent(w,{type:"set_grip",payload:{grip},source:"player"});
  if(r&&r.ok){ if(typeof toast==="function")toast(grip==="2h"?"Gripped in both hands.":"Gripped one-handed."); saveU(U); renderWorld(); }
  else if(typeof toast==="function")toast(r&&r.reason==="off-hand-occupied"?"Free your off-hand to two-hand it.":"Can't change grip.");
}

function attuneItem(itemId){
  const w=(typeof activeWorld==="function")&&activeWorld(); if(!w)return;
  const t=(typeof livingSheet==="function")&&livingSheet(w); if(!t)return;
  const inst=(t.sh.inventory||[]).find(x=>x.id===itemId); if(!inst)return;
  const r=applyEvent(w,{type:"attune",payload:{itemId},source:"player"});
  if(r&&r.ok){ if(typeof toast==="function")toast("Attuned to "+inst.name+"."); saveU(U); renderWorld(); }
  else if(typeof toast==="function")toast(r&&r.reason==="attunement-cap"?"Attunement is full (3/3) — release one first.":("Can't attune "+inst.name+"."));
}

function unattuneItem(itemId){
  const w=(typeof activeWorld==="function")&&activeWorld(); if(!w)return;
  const r=applyEvent(w,{type:"unattune",payload:{itemId},source:"player"});
  if(r&&r.ok){ if(typeof toast==="function")toast("Attunement ended."); saveU(U); renderWorld(); }
}

function useItem(itemId){
  const w=(typeof activeWorld==="function")&&activeWorld(); if(!w)return;
  const t=(typeof livingSheet==="function")&&livingSheet(w); if(!t)return;
  const inst=(t.sh.inventory||[]).find(x=>x.id===itemId); if(!inst)return;
  const r=applyEvent(w,{type:"item_use",payload:{itemId},source:"player"});
  if(r&&r.ok){
    const e=r.effect||{};
    const msg=(e.kind==="heal")?("Drank "+inst.name+" — healed "+e.healed+" (HP "+e.hp+").")
      :(e.kind==="buff")?("Used "+inst.name+" — "+(e.buff&&e.buff.name||"effect")+(e.buff&&e.buff.duration?(" for "+e.buff.duration):"")+". Tell your DM.")
      :("Used "+inst.name+".");
    if(typeof toast==="function")toast(msg); saveU(U); renderWorld();
  } else if(typeof toast==="function")toast("Can't use "+inst.name+(r&&r.reason==="not-consumable"?" — nothing to trigger":"")+".");
}
