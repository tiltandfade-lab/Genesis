/* GENESIS MODULE — src/world/shop.js — the shop TRANSACTION layer (docs/SHOP-UI.md §4).
   Keeps render.js lean: owns shop record lookup, tab/selection UI state, and the buy/sell handlers
   that call the economy engine (previewBuy/previewSell) then apply the result via the existing
   applyEvent runtime — the ONE event that touches gear/coin (no parallel mutator). Engine owns
   numbers, this module owns interaction; no pricing math lives here. */

// TRANSITION-CONTRACT.md §2 — a completed shop transaction ticks a small flat amount (haggling,
// counting coin, wrapping goods); no extra ledger line (the item_changed line + the header clock
// are the record).
const SHOP_TXN_MIN=5;

function shopOf(w, id){ return (w&&w.shops&&id) ? (w.shops[id]||null) : null; }

/* shopAttitude(w, shop) → the clamped attitude rung driving §3b's price tint. Resolved ONCE per
   render/transaction from the shop's linked codex NPC (codexGetAttitude); no codexId (or an
   unlinked/soft-pool NPC codexGet can't find) → 0, the untinted case. The render path (shopPanel)
   and the transaction path (buyItem/sellItem) both call this so the confirmed price always matches
   what was displayed. */
function shopAttitude(w, shop){
  if(!shop || !shop.codexId) return 0;
  const att=(typeof codexGetAttitude==="function") ? codexGetAttitude(w, shop.codexId) : null;
  return att && typeof att.value==="number" ? att.value : 0;
}

/* setShopTab(t) — Buy|Sell tab switch (§3 Ruling 1). Clears the confirm-on-plaque selection so a
   stale row-expand from the other tab never lingers. */
function setShopTab(t){ GS.shopTab=t; GS.shopSel=null; renderWorld(); }

/* selectShopRow(kind, key) — confirm-on-plaque row toggle (§3 Ruling 2). Clicking the already-
   selected row collapses it; selecting another row replaces it (never two expanded at once). */
function selectShopRow(kind, key){
  const sel=GS.shopSel;
  GS.shopSel=(sel && sel.kind===kind && sel.key===key) ? null : { kind, key };
  renderWorld();
}

/* Refusal → toast copy (§4 — every refusal surfaces, never a silent no-op). */
function buyRefusalMsg(reason){
  return reason==="insufficient-gold" ? "Not enough gold."
    : reason==="out-of-stock" ? "That's out of stock."
    : reason==="unpriceable" ? "Can't be priced."
    : "Could not buy that.";
}
function sellRefusalMsg(reason){
  return reason==="not-held" ? "You don't have that."
    : reason==="unsellable" ? "Can't be priced."
    : reason==="merchant-broke" ? "Their purse is empty."
    : "Could not sell that.";
}

/* applyStockDelta(shop, r) — decrement shop.stock qty by previewBuy's returned stockDelta (never
   below 0; a line at 0 stays listed as out-of-stock rather than vanishing mid-render-cycle). */
function applyStockDelta(shop, r){
  if(!shop || !r || !r.stockDelta || !Array.isArray(shop.stock)) return;
  const line=shop.stock.find(l=>l.name===r.stockDelta.name);
  if(line) line.qty=Math.max(0, (line.qty||0)+r.stockDelta.qty);
}
/* addToShopStock(shop, r) — the sold item becomes buyable again (§4, "optional: restock"). Folds
   into an existing line if present, else opens a new one at the sold qty. */
function addToShopStock(shop, r){
  if(!shop || !r || !r.stockDelta || !Array.isArray(shop.stock)) return;
  const line=shop.stock.find(l=>l.name===r.stockDelta.name);
  if(line) line.qty=(line.qty||0)+r.stockDelta.qty;
  else shop.stock.push({ name:r.stockDelta.name, qty:r.stockDelta.qty });
}

/* buyItem(shopId, name) — validate → apply → deplete stock → persist → re-render (§4). att is
   resolved once here so the charged price matches shopPanel's displayed (tinted) price. */
function buyItem(shopId, name){
  const w=activeWorld(); if(!w) return;
  const t=(typeof livingSheet==="function") ? livingSheet(w) : null; if(!t) return;
  const sh=t.sh, shop=shopOf(w, shopId); if(!shop) return;
  const att=shopAttitude(w, shop);
  const r=previewBuy(sh, shop, name, att);
  if(!r.ok){ toast(buyRefusalMsg(r.reason)); return; }
  const applied=applyEvent(w, r.event);
  if(!applied.ok){ toast(applied.note || "Could not carry that."); return; }
  if(typeof advanceClock==="function") advanceClock(w,SHOP_TXN_MIN);
  applyStockDelta(shop, r);
  GS.shopSel=null;
  saveU(U); renderWorld();
}

/* sellItem(shopId, instanceId) — validate → apply → deplete merchant coin → persist → re-render (§4). */
function sellItem(shopId, instanceId){
  const w=activeWorld(); if(!w) return;
  const t=(typeof livingSheet==="function") ? livingSheet(w) : null; if(!t) return;
  const sh=t.sh, shop=shopOf(w, shopId); if(!shop) return;
  const att=shopAttitude(w, shop);
  const r=previewSell(sh, shop, instanceId, att);
  if(!r.ok){ toast(sellRefusalMsg(r.reason)); return; }
  const applied=applyEvent(w, r.event);
  if(!applied.ok){ toast("Sale failed."); return; }
  if(typeof advanceClock==="function") advanceClock(w,SHOP_TXN_MIN);
  shop.coin=Math.max(0, (shop.coin||0) - r.payout);
  addToShopStock(shop, r);
  GS.shopSel=null;
  saveU(U); renderWorld();
}
