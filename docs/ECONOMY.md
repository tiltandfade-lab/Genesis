---
type: system-spec
project: Genesis
status: specced
created: 2026-07-01
author: Opus (frontier spec) — for Sonnet execution, Opus review
scope: v1 buy+sell ENGINE + DATA spine only — NO UI (the shop panel rides the in-session UI redesign later)
decided_in: docs/DESIGN.md 2026-06-27 · auto-memory project-genesis-economy-currency
---

# Economy v1 — Buy/Sell Spine (engine + data)

**One-line:** build the money loop's mechanical spine — a pricing model, a shop/merchant model with
place-tier stock, and buy/sell transaction helpers that validate then emit the existing `item_changed`
event — as **pure logic in NEW files only**. **Zero edits to `src/world/render.js` or `genesis.html`**
so this runs fully parallel to the in-session UI redesign. The shop *UI* is a deliberate follow-on that
will ride the new panel system once the UI redesign merges.

**The one loop this must nail (memory `project-genesis-economy-currency`):**
`loot → buy gear + potions → consumables drain → need gold`. Consumables/potions are the keystone sink.

---

## 0. Ground rules (do not violate)

- **Classic-script globals only.** New files are `<script>`-loaded modules of top-level `function`/`const`
  globals (CLAUDE.md contract). No ES modules, no build step.
- **Engine owns numbers; DM/UI owns meaning.** These functions compute prices, stock, and validated
  transactions; they **do not narrate** and **do not apply** state — they return `item_changed` event
  payloads for a caller to apply via the existing `applyEvent` runtime. (Anti-drift: mechanize the number,
  let the DM surface it as fiction — same detected-not-declared split as XP.)
- **No parallel pricing system.** Prices derive from what already exists: `data/items.js` SRD `cost` for
  mundane gear, and the magic-item **rarity → value band** (§2) for magic gear. Do not invent per-item
  magic prices.
- **`item_changed` is the ONLY event that touches gear/coin** (EVENT-CONTRACT.md; handler
  `src/world/dm.js:693`). Buy/sell MUST route through it. Do not write a second inventory/gold mutator.
- **Register new files in `manifest.json`** with their `owns`; add `<script>` tags in `genesis.html` in
  the correct `loadOrder` slot (data before engine; economy engine after `engine.combat`/`items` since it
  reads `itemDef`/`magicDef`). Run `python3 build/check-manifest.py` → must be clean.
- **T1/T2 scope only** (docs/TIER-SCOPE.md). Very Rare+/Legendary pricing constants may exist in the band
  table (harmless), but stock generation must not surface rarities the tier gate forbids (§4).

---

## 1. The transaction API this plugs into (read first)

`item_changed` payload (dm.js:693–744), the seam these helpers emit into:
```
{ add?:[{name, qty?, base?, ench?, bonus?, codexId?}],   // mint into inventory (magic overlay auto-mints from MAGIC_ITEMS_BY_NAME)
  removeIds?:[instanceId],                                // remove specific instances (by id, not name)
  gold?: <signed delta>,                                  // +earn / -spend, clamped at 0
  force?, note? }
```
Return shape: `{ok, removed, added, gold, inventory}` — or `{ok:false, reason:"over-capacity"|...}`.
- A **buy** = `{ add:[{name}], gold:-price }`.
- A **sell** = `{ removeIds:[id], gold:+payout }`.
The handler already: mints the congruent magic overlay, enforces the STR×30 hard cap (buys refused if
over — `force` overrides), clamps gold ≥ 0, and writes the ledger. **Do not duplicate any of that.**

---

## 2. Pricing — `src/engine/economy.js`

Owns (add to manifest): `itemPrice`, `isConsumable`, `sellValue`, `rollShopStock`, `merchantCoin`,
`shopStockValue`, `previewBuy`, `previewSell` (names indicative; keep them global functions).

### 2a. `itemPrice(name) → { gp:Number|null, consumable:Bool, source:"srd"|"rarity"|null }`
- **Mundane** (`itemDef(name)` resolves and has `cost`): `gp = cost.value` (convert non-gp units to gp:
  1 gp = 10 sp = 100 cp; 1 pp = 10 gp). `cost:null` items (art/quest) → `gp:null` (unpriceable in v1).
- **Magic** (`magicDef(name)` resolves, has `rarity`): `gp = RARITY_VALUE[rarity]`, then **halve if the
  item is a consumable** (§2b). `source:"rarity"`.
- Unknown name → `{gp:null, consumable:false, source:null}` (never throw — degrade, matching the
  unindexed-item discipline in ITEMS).

### 2b. `RARITY_VALUE` (in `data/economy.js`) — the authored magic band
IP-clean, genericized (memory: DMG-derived structure, our numbers — never paste any source table):
```
Common: 100 · Uncommon: 400 · Rare: 4000 · Very Rare: 40000 · Legendary: 200000 · Artifact: null (priceless)
```
`isConsumable(name)` — true for potions & scrolls. Detect via the magic catalog: a name beginning
`"Potion of"`, or `"Spell Scroll"` / a name beginning `"Scroll of"`, or (if the catalog carries a usable
`category`/`type` field indicating a consumable) that flag. Spell Scroll pricing = ½ of a non-consumable
of its rarity — which the "halve consumables" rule already yields; no separate branch needed. If detection
is ambiguous for an item, err toward **not** consumable (full price) and note it — do not guess wildly.

### 2c. `sellValue(name, merchant) → { gp, capped:Bool }`
- Base sell = `Math.floor(itemPrice(name).gp * SELL_RATIO)` where **`SELL_RATIO = 0.5`** (SRD half-value
  baseline; merchants pay below value). `data/economy.js` owns `SELL_RATIO`.
- **Merchant coin cap (saturation guard):** a merchant can only pay out up to its remaining coin
  (`merchant.coin`). If `sellValue > merchant.coin`, the payout is capped to `merchant.coin` and
  `capped:true` (the player can't dump a hoard on a village smith). Unpriceable (`gp:null`) → not sellable
  here (return `{gp:null}`).

---

## 3. The shop / merchant model — `src/engine/economy.js` (+ `data/economy.js` archetypes)

A shop is **a merchant codex NPC + a location + an inventory + a coin pool** (memory). v1 models it as a
plain record the DM/prep can mint; the codex linkage is a light `codexId` pointer, not a new subsystem.

### 3a. Shop record shape
```
{ id, name, archetype,        // archetype ∈ SHOP_ARCHETYPES keys (§3b)
  tier,                        // place tier 0..3 (§4) — settlement size, NOT PC level
  codexId?,                    // link to the merchant NPC codex record, if cast
  nodeId?,                     // where it sits
  stock:[ {name, qty} ],       // items for sale (names resolve via itemDef/magicDef)
  coin }                       // remaining gp the merchant can pay when buying from the player
```
`makeShop({tier, archetype, nodeId, name, rng}) → shopRecord` builds one: sets `coin = merchantCoin(tier)`
and `stock = rollShopStock(tier, archetype, rng)`.

### 3b. `SHOP_ARCHETYPES` (in `data/economy.js`)
A small set gating which item categories a shop stocks (categories are `itemDef(...).category` /
magic catalog kinds). At minimum:
- `general` — adventuring gear, tools, ammo, mundane kit.
- `apothecary` — **consumables/potions** (the keystone-sink vendor).
- `smith` — weapons + armor (mundane; magic arms only at higher tiers per §4).
- `arcanist` — spellcasting foci, scrolls, low-rarity magic (tier-gated).

Each archetype = `{ label, categories:[...], magicKinds:[...], consumables:Bool }`. Keep it data-driven so
adding archetypes later needs no code.

---

## 4. Place-tier stock gating — `rollShopStock(tier, archetype, rng)`

**Goods are tiered by PLACE + access, never by PC level** (memory — the world is real, not a theme park
scaling to the PC; escalation falls out diegetically). Since world nodes carry no tier field today, **tier
lives on the shop record** (assigned when the shop is minted). Define `PLACE_TIERS` in `data/economy.js`:

| tier | name | stocks rarities | typical stock size | merchant coin |
|---|---|---|---|---|
| 0 | hamlet | Common only (mundane + basic potions) | small | ~25 gp |
| 1 | village | Common + occasional Uncommon | small–mid | ~100 gp |
| 2 | town | Common/Uncommon, rare Rare | mid | ~500 gp |
| 3 | city | Common/Uncommon/Rare | large | ~2000 gp |

- **Rarity availability gate** mirrors the loot rarity-by-tier ladder (docs/LOOT-REMAP.md) + the SRD
  "spellcasting services gated by settlement size" precedent: Common/Uncommon broadly available; Rare only
  town+; **Very Rare+ never stocked in v1** (T1/T2 scope). Enforce in `rollShopStock`.
- **These numbers (coin, stock size, gate) are BALANCE KNOBS — provisional, tunable after playtest.** Put
  them all in `data/economy.js` as named constants so tuning is one file. Do NOT scatter magic numbers into
  the engine. (Adam's ethos: "we'll see how it plays.")
- `rollShopStock` is deterministic given an `rng` (seeded) so the harness can assert exact stock — follow
  whatever seeded-RNG pattern the existing generators use (`rollTbl`/world-gen). If none is injectable,
  accept an `rng` param defaulting to `Math.random` and let the harness pass a stub.
- Apothecary stock is **weighted toward consumables** (the sink must be reliably buyable) — a town
  apothecary should almost always have Potions of Healing.

---

## 5. Buy/sell transaction helpers — `src/engine/economy.js`

Pure validators that **return an `item_changed` payload + a decision**, never apply it:

### `previewBuy(sh, shop, itemName) → { ok, price, event?, reason? }`
- Refuse if item not in `shop.stock` (or qty 0) → `reason:"out-of-stock"`.
- Refuse if `itemPrice(itemName).gp == null` → `reason:"unpriceable"`.
- Refuse if `(sh.gold||0) < price` → `reason:"insufficient-gold"`.
- (Do NOT pre-check encumbrance — the `item_changed` handler enforces the STR×30 cap and returns
  `over-capacity`; surface that to the caller. Optionally warn, but the handler is the source of truth.)
- Else `event = {type:"item_changed", payload:{ add:[{name:itemName}], gold:-price, note:`Bought ${itemName}` }}`.
  The caller applies it, then decrements `shop.stock` qty and (optionally) the merchant is unaffected on coin.

### `previewSell(sh, shop, instanceId) → { ok, payout, capped, event?, reason? }`
- Find the instance in `sh.inventory` by id → else `reason:"not-held"`.
- Compute `sellValue(instance.name, shop)`; if `gp==null` → `reason:"unsellable"`.
- `event = {type:"item_changed", payload:{ removeIds:[instanceId], gold:+payout, note:`Sold ${name}` }}`.
  Caller applies it, then **decrements `shop.coin` by `payout`** (the merchant spent coin — the saturation
  guard is stateful across a session) and may add the item to `shop.stock`.

> Whether the caller mutates `shop.stock`/`shop.coin` or the helper returns the deltas: return the deltas
> in the result (`stockDelta`, `coinDelta`) so the helper stays pure and the harness can assert them.
> Applying `item_changed` and mutating the shop record is the caller's (future UI/DM) job.

---

## 6. Files (all NEW — no edits to render.js/genesis.html)

- `data/economy.js` — owns: `RARITY_VALUE`, `SELL_RATIO`, `PLACE_TIERS`, `SHOP_ARCHETYPES`
  (+ any named balance constants). Pure data.
- `src/engine/economy.js` — owns: `itemPrice`, `isConsumable`, `sellValue`, `merchantCoin`,
  `rollShopStock`, `makeShop`, `shopStockValue`, `previewBuy`, `previewSell`. Pure functions.
- `dev/verify-economy.mjs` — the headless harness (§7).
- **Register both source files in `manifest.json`** (data layer + engine layer) and add their `<script>`
  tags to `genesis.html` after the items/combat modules. **No behavior in the app changes** — nothing
  calls these yet; they're the spine the future shop UI + DM `open_shop` event will consume.

*(If a bridge/DM `open_shop` or `shop_transaction` event is wanted, that's a small EVENT-CONTRACT addition
— but v1 stops at the engine spine. Note it as the next seam; do not build the event wiring now unless it
falls out trivially.)*

---

## 7. Verification plan (§ mandatory — prove it, don't self-report)

1. **`python3 build/check-manifest.py` → clean** (both new files registered with `owns`; `<script>` tags
   present in the right loadOrder; no orphans/drift).
2. **Full existing harness suite green — 0 regressions.** This adds only new files; no existing test may
   change. Run every `dev/verify-*.mjs`/`.py` + the jsdom load test; report pass counts.
3. **`dev/verify-economy.mjs` (new)** — load `data/items.js` + `data/economy.js` + `src/engine/economy.js`
   (+ `src/engine/combat.js`/items for `itemDef`/`magicDef`) via the repo's headless harness pattern, and
   assert:
   - **Pricing:** a known mundane item returns its SRD `cost` in gp (unit-convert a sp/cp-priced item and
     assert the gp math); a `cost:null` item → `gp:null`. A Common magic item → 100; Uncommon → 400;
     Rare → 4000. A Potion (consumable) → **half** its rarity band. An unknown name → `gp:null` (no throw).
   - **Sell:** `sellValue` = `floor(price*0.5)`; a payout exceeding `merchant.coin` is **capped** and flags
     `capped:true`.
   - **Stock gating:** a tier-0 hamlet shop never stocks Rare; a tier-3 city may; **no shop stocks Very
     Rare+** (T1/T2 scope). Apothecary stock reliably contains a healing consumable.
   - **Transactions (round-trip through the REAL `applyEvent`):** load enough of `src/world/dm.js` to call
     `applyEvent`; set up a living PC with known gold. `previewBuy` → apply its event → assert gold dropped
     by price and the item is in `sh.inventory`. `previewSell` → apply → assert gold rose by payout and the
     instance is gone. `previewBuy` with insufficient gold → `ok:false, reason:"insufficient-gold"` and NO
     event. A buy that breaches STR×30 → the applied `item_changed` returns `over-capacity` (surface it).
   - **Determinism:** `rollShopStock` with a stubbed `rng` yields a fixed stock (assert exact list).
4. **7th check — mutation guards.** Break each of these one at a time and confirm the harness goes RED,
   then restore → GREEN: (a) flip `SELL_RATIO` to 1.0 (sell assertion must fail); (b) remove the consumable
   ½ halving (potion-price assertion must fail); (c) drop the Very-Rare tier gate (stock-gating assertion
   must fail). Report each red→green.

---

## 8. Out of scope (do NOT build now)

- **Any UI** — no shop panel, no buttons, no render.js/genesis.html edits. The shop UI rides the
  in-session UI redesign (docs/IN-SESSION-UI.md) after it merges.
- **Lodging/Lifestyle sink** (decided but separable — the "shelter has an owner" model). Fast-follow, not
  v1. Note it as next.
- **Valuable-loot content** (gem/art/trade-goods tables) — the sell-system's content fast-follow; SRD
  ships none. Not v1.
- **Other currencies** (Knowledge/Standing/Heat/Holdings), haggling, dynamic supply/demand, regional
  prices, hirelings/services/crafting, black markets — all deferred expansions.
- **T3/T4 pricing surfacing** — Legendary/Artifact bands may exist as constants but must never be stocked.

---

## 9. Definition of done

- `data/economy.js` + `src/engine/economy.js` + `dev/verify-economy.mjs` exist, registered, `<script>`-wired.
- `itemPrice`/`sellValue`/`isConsumable` correct against SRD cost + the rarity band + the consumable ½ rule.
- `makeShop`/`rollShopStock`/`merchantCoin` produce place-tier-gated stock (no Very Rare+ in v1),
  deterministic under a stub rng, with the apothecary reliably stocking a healing consumable.
- `previewBuy`/`previewSell` validate (gold, stock, coin cap, held-instance) and emit correct
  `item_changed` payloads that round-trip cleanly through the real `applyEvent`.
- `check-manifest` clean · full suite green (0 regressions) · `verify-economy` green · the three mutation
  guards demonstrated red→green.
- **No app behavior changed** (the spine is inert until the future UI/DM consumes it) — confirm the app
  still boots and all existing flows work (jsdom load test).
