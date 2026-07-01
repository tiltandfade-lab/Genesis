/* ECONOMY (docs/ECONOMY.md) — the money loop's mechanical spine: PRICING, the shop/merchant
   model, and buy/sell TRANSACTION VALIDATORS. PURE + DETERMINISTIC (mirrors engine.combat/
   engine.social): these functions compute prices, roll stock, and return validated `item_changed`
   event payloads — they never narrate and never apply state. The caller (future UI/DM) applies
   the returned event via the existing applyEvent runtime (src/world/dm.js) and folds in any
   `stockDelta`/`coinDelta`. No parallel pricing system: mundane gear prices off data/items.js's
   ITEMS_BY_NAME `cost` (via itemDef); magic gear prices off the RARITY_VALUE band (data/economy.js).
   Added 2026-07-01. */

/* itemKey/itemDef/magicDef live in engine.combat (data/items.js's lookup layer) — economy.js is a
   pure CONSUMER of that resolver, never a second index. */

/* itemPrice(name) → {gp, consumable, source} (docs/ECONOMY.md §2a).
   Mundane first (itemDef resolves + has cost): gp = cost converted to gp (1gp=10sp=100cp,
   1pp=10gp). A cost:null mundane item (art/quest) → gp:null (unpriceable in v1).
   Else magic (magicDef resolves + has rarity): gp = RARITY_VALUE[rarity], halved if isConsumable.
   Unknown name → {gp:null, consumable:false, source:null} — never throw (unindexed-item discipline,
   docs/ITEMS.md). */
function ecCostToGp(cost){
  if(!cost || typeof cost.n!=="number") return null;
  const unit=String(cost.unit||"gp").toLowerCase();
  const RATE={ pp:10, gp:1, sp:0.1, cp:0.01 };
  const rate=(unit in RATE)?RATE[unit]:1;
  return cost.n*rate;
}

function isConsumable(name){
  const md=(typeof magicDef==="function")?magicDef(name):null;
  const n=String(name||"").trim();
  // Name-pattern detection first (docs/ECONOMY.md §2b) — robust even for names the catalog
  // doesn't carry a clean category for.
  if(/^potion of\b/i.test(n)) return true;
  if(/^spell scroll\b/i.test(n)) return true;
  if(/^scroll of\b/i.test(n)) return true;
  // Fall back to the magic catalog's category field when present.
  if(md && (md.category==="Potion" || md.category==="Scroll")) return true;
  return false;   // ambiguous → not consumable (full price) per spec — err toward NOT guessing
}

function itemPrice(name){
  const mundane=(typeof itemDef==="function")?itemDef(name):null;
  if(mundane){
    if(mundane.cost==null) return { gp:null, consumable:false, source:"srd" };
    const gp=ecCostToGp(mundane.cost);
    return { gp:(gp==null?null:gp), consumable:isConsumable(name), source:"srd" };
  }
  const magic=(typeof magicDef==="function")?magicDef(name):null;
  if(magic && magic.rarity){
    const band=(typeof RARITY_VALUE!=="undefined")?RARITY_VALUE[magic.rarity]:undefined;
    if(band==null) return { gp:null, consumable:isConsumable(name), source:"rarity" };   // Artifact / unknown rarity — priceless
    const cons=isConsumable(name);
    const gp=cons ? Math.floor(band/2) : band;
    return { gp, consumable:cons, source:"rarity" };
  }
  return { gp:null, consumable:false, source:null };   // unknown name — degrade, never throw
}

/* sellValue(name, merchant) → {gp, capped} (docs/ECONOMY.md §2c). Base sell = floor(price*SELL_RATIO).
   Capped to the merchant's remaining coin (the saturation guard) when merchant is supplied.
   Unpriceable → {gp:null}. */
function sellValue(name, merchant){
  const p=itemPrice(name);
  if(p.gp==null) return { gp:null, capped:false };
  const ratio=(typeof SELL_RATIO==="number")?SELL_RATIO:0.5;
  let gp=Math.floor(p.gp*ratio);
  let capped=false;
  const coin=merchant&&typeof merchant.coin==="number" ? merchant.coin : null;
  if(coin!=null && gp>coin){ gp=coin; capped=true; }
  return { gp, capped };
}

/* merchantCoin(tier) → the starting/replenished coin pool for a place tier (data/economy.js
   PLACE_TIERS). Falls back to the hamlet (tier 0) figure for an unknown tier. */
function merchantCoin(tier){
  const tiers=(typeof PLACE_TIERS!=="undefined")?PLACE_TIERS:[];
  const row=tiers.find(t=>t.tier===tier) || tiers[0];
  return row ? row.coin : 25;
}

/* ecPlaceTier(tier) — resolve a PLACE_TIERS row, defaulting to the lowest (hamlet) for an
   out-of-range/unknown tier so rollShopStock never silently over-grants a high-tier rarity. */
function ecPlaceTier(tier){
  const tiers=(typeof PLACE_TIERS!=="undefined")?PLACE_TIERS:[];
  return tiers.find(t=>t.tier===tier) || tiers[0] || { tier:0, name:"hamlet", rarities:["Common"], stockSize:{min:3,max:5}, coin:25 };
}

/* ecRng(rng) — normalizes the injectable RNG: accepts a 0..1 generator function (default
   Math.random), matching docs/ECONOMY.md §4's "accept an rng param defaulting to Math.random". */
function ecRng(rng){ return (typeof rng==="function") ? rng : Math.random; }
function ecPick(arr, rng){ if(!arr||!arr.length) return null; return arr[Math.floor(ecRng(rng)()*arr.length)]; }
function ecInt(rng, min, max){ return min + Math.floor(ecRng(rng)()*(max-min+1)); }

/* rollShopStock(tier, archetype, rng) → [{name, qty}] (docs/ECONOMY.md §4).
   Deterministic given rng. Gates rarity by place tier (mundane items are always in-scope; magic
   items must have a rarity present in the tier's `rarities` list — Very Rare+ NEVER surfaces,
   since no PLACE_TIERS row ever lists it, T1/T2 scope). Apothecary stock is weighted toward
   consumables — guarantees at least one Potion of Healing line (the keystone sink must be
   reliably buyable). */
function rollShopStock(tier, archetype, rng){
  const arch=(typeof SHOP_ARCHETYPES!=="undefined") ? SHOP_ARCHETYPES[archetype] : null;
  if(!arch) return [];
  const tierRow=ecPlaceTier(tier);
  const allowedRarities=tierRow.rarities||["Common"];

  // Candidate pool: mundane names in this archetype's categories.
  const mundaneNames=(typeof ITEMS_BY_NAME!=="undefined")
    ? Object.values(ITEMS_BY_NAME).filter(d=>d && arch.categories.includes(d.category) && d.cost!=null).map(d=>d.name)
    : [];
  // Candidate pool: magic names in this archetype's magicKinds, rarity-gated to the tier.
  const magicNames=(typeof MAGIC_ITEMS_BY_NAME!=="undefined")
    ? Object.values(MAGIC_ITEMS_BY_NAME).filter(d=>d && arch.magicKinds.includes(d.category) && allowedRarities.includes(d.rarity)).map(d=>d.name)
    : [];

  const stock=[];
  const size=ecInt(rng, tierRow.stockSize.min, tierRow.stockSize.max);
  const seen=new Set();

  // Apothecary guarantee (docs/ECONOMY.md §4) — always stock the canonical healing consumable
  // first, before any random draw, so it's never crowded out by the rng.
  if(arch.consumables && typeof APOTHECARY_HEALING_GUARANTEE!=="undefined" && APOTHECARY_HEALING_GUARANTEE){
    const healName=(typeof HEALING_POTION_NAME!=="undefined") ? HEALING_POTION_NAME : "Potion of Healing";
    if(!seen.has(healName)){ stock.push({ name:healName, qty:ecInt(rng,2,5) }); seen.add(healName); }
  }

  const pool = arch.consumables
    ? mundaneNames.concat(magicNames, magicNames)   // weight consumable-carrying archetypes toward the magic (potion) side
    : mundaneNames.concat(magicNames);

  let guard=0;
  while(stock.length<size && pool.length && guard<size*20){
    guard++;
    const name=ecPick(pool, rng);
    if(!name || seen.has(name)) continue;
    seen.add(name);
    stock.push({ name, qty: ecInt(rng,1,3) });
  }
  return stock;
}

/* makeShop({tier, archetype, nodeId, name, rng}) → shop record (docs/ECONOMY.md §3a). */
function makeShop(opts){
  opts=opts||{};
  const tier=(typeof opts.tier==="number")?opts.tier:0;
  const archetype=opts.archetype||"general";
  return {
    id: opts.id || ("shop-"+Math.random().toString(36).slice(2,10)),
    name: opts.name || ((typeof SHOP_ARCHETYPES!=="undefined" && SHOP_ARCHETYPES[archetype]) ? SHOP_ARCHETYPES[archetype].label : "Shop"),
    archetype,
    tier,
    codexId: opts.codexId || null,
    nodeId: opts.nodeId || null,
    stock: rollShopStock(tier, archetype, opts.rng),
    coin: merchantCoin(tier),
  };
}

/* shopStockValue(shop) → total gp value of a shop's current stock (sum of itemPrice*qty; an
   unpriceable line contributes 0, never throws/NaNs the total). */
function shopStockValue(shop){
  if(!shop || !Array.isArray(shop.stock)) return 0;
  return shop.stock.reduce((sum,line)=>{
    const p=itemPrice(line.name);
    if(p.gp==null) return sum;
    return sum + p.gp*(line.qty||1);
  }, 0);
}

/* previewBuy(sh, shop, itemName) → {ok, price, event?, reason?} (docs/ECONOMY.md §5). Pure
   validator — returns the item_changed payload for the caller to apply; does NOT mutate sh/shop.
   The caller, after applying the event successfully, should also decrement shop.stock qty
   (stockDelta is returned so the harness/caller can do that without re-deriving it). */
function previewBuy(sh, shop, itemName){
  const line=(shop&&Array.isArray(shop.stock)) ? shop.stock.find(l=>l.name===itemName && (l.qty||0)>0) : null;
  if(!line) return { ok:false, reason:"out-of-stock" };
  const price=itemPrice(itemName);
  if(price.gp==null) return { ok:false, reason:"unpriceable" };
  const gold=(sh&&typeof sh.gold==="number")?sh.gold:0;
  if(gold<price.gp) return { ok:false, reason:"insufficient-gold", price:price.gp };
  return {
    ok:true,
    price:price.gp,
    stockDelta:{ name:itemName, qty:-1 },
    event:{ type:"item_changed", payload:{ add:[{ name:itemName }], gold:-price.gp, note:"Bought "+itemName+"." } },
  };
}

/* previewSell(sh, shop, instanceId) → {ok, payout, capped, event?, reason?} (docs/ECONOMY.md §5).
   Finds the held instance by id in sh.inventory (the PC's sheet), not shop.inventory — a shop has
   no PC-facing "inventory" field; the spec's wording is the PC's held instance. Returns the
   coinDelta the caller applies to shop.coin (the stateful saturation guard) and a stockDelta the
   caller may use to restock the shop with the sold item. */
function previewSell(sh, shop, instanceId){
  const inv=(sh&&Array.isArray(sh.inventory))?sh.inventory:[];
  const inst=inv.find(it=>it.id===instanceId);
  if(!inst) return { ok:false, reason:"not-held" };
  const sv=sellValue(inst.name, shop);
  if(sv.gp==null) return { ok:false, reason:"unsellable" };
  // Zero-payout guard: a broke merchant (coin capped the payout to 0) would otherwise take the
  // player's item for NOTHING when the caller applies the removeIds event. Refuse the sale — no
  // event. Strictly gp<=0: a LOW-but-nonzero coin still completes the sale at the capped (reduced)
  // payout (the partial-payout case stays valid); only an exact-0 payout is refused.
  if(sv.gp<=0) return { ok:false, reason:"merchant-broke" };
  return {
    ok:true,
    payout:sv.gp,
    capped:!!sv.capped,
    coinDelta:-sv.gp,
    stockDelta:{ name:inst.name, qty:1 },
    event:{ type:"item_changed", payload:{ removeIds:[instanceId], gold:sv.gp, note:"Sold "+inst.name+"." } },
  };
}
