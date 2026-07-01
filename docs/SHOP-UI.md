---
type: system-spec
project: Genesis
status: specced-queued
created: 2026-07-01
author: Opus (frontier spec) — for Sonnet execution, Opus review
depends_on:
  - docs/IN-SESSION-UI.md   # the new panel system this hooks into — MUST be merged first
  - docs/ECONOMY.md         # the engine API this drives — MUST be merged first
note: >
  Drafted against the SPEC'd interfaces of the two dependencies before they merged. At dispatch time,
  RECONCILE the symbol names below against the merged reality (the UI redesign may have renamed panel
  helpers; the economy spine may have adjusted return shapes). Treat §1's "as-built check" as step zero.
---

# Shop UI — the buy/sell panel (marries the economy spine to the new panel system)

**One-line:** add a **contextual shop panel** to the redesigned in-session UI that renders a merchant's
stock (buy) and the player's sellable inventory (sell), driving the economy engine's `previewBuy`/
`previewSell` and applying the resulting `item_changed` events. This is the piece that makes the money
loop *felt* — `loot → buy gear + potions → consumables drain → need gold` becomes clickable.

**This unit edits `src/world/render.js` + `genesis.html` + `src/world/dm.js`** — which is why it is QUEUED
to run only after the UI-redesign branch (`feat/in-session-ui`) and the economy branch
(`feat/economy-spine`) are both reviewed-green and merged to master. It would collide with the UI redesign
if run concurrently.

---

## 0. Ground rules

- Classic-script globals; run `check-manifest` after edits; register any new file. Read files before
  assuming shapes (CLAUDE.md).
- **Engine owns numbers, UI owns interaction.** The panel does NOT compute prices, sell values, or stock —
  it *calls* the economy engine (`itemPrice`/`sellValue`/`previewBuy`/`previewSell`) and *applies* the
  returned `item_changed` event via the existing `applyEvent` runtime. No pricing logic in the UI layer.
- **Never mutate the sheet directly.** All gear/coin changes go through `applyEvent(w, event)` where
  `event` is what `previewBuy`/`previewSell` returned. The shop record's own `stock`/`coin` are updated
  from the helper's returned deltas.
- Match the established parchment/gold skin (see IN-SESSION-UI.md §7 + the wireframe).

---

## 1. As-built reconciliation (step zero — do this before coding)

Both dependencies are merged by now. Confirm the real symbols before wiring:
- **Panel system** (from IN-SESSION-UI.md): find how panels are dispatched — `gamePanelContent(w,cur,panel)`
  and `openPanel(name)` (toggles `GS.gamePanel`). Confirm their final names. The shop is a new panel key.
- **Economy engine** (from ECONOMY.md): confirm the real signatures/return shapes of `itemPrice`,
  `sellValue`, `makeShop`, `rollShopStock`, `merchantCoin`, `previewBuy`, `previewSell` — especially whether
  `previewBuy/Sell` return `{ok, event, price/payout, stockDelta, coinDelta, reason}`. Wire to what's there.
- If either drifted from the spec, adapt this spec's calls; do not force the old names.

---

## 2. Shop persistence & opening

### 2a. Shops live on the world (persist across a session)
A merchant's coin depletes as the player sells, and stock depletes as they buy — so shops are **stateful
and persisted**, not transient. Store a registry on the world:
```
w.shops = { [shopId]: shopRecord }     // shopRecord shape per ECONOMY.md §3a
```
- `migrateWorld` (src/world/state.js) backfills `w.shops = w.shops || {}` for old saves. `saveU` already
  persists `w`, so shops survive reload for free.
- The currently-open shop is transient UI state: `GS.activeShopId` (new field on GS, src/state.js).
  `GS.gamePanel === 'shop'` + `GS.activeShopId` → the shop panel renders that shop.

### 2b. Opening a shop — the `open_shop` event (new, small EVENT-CONTRACT addition)
Add to `applyEvent` (src/world/dm.js) and document in `docs/EVENT-CONTRACT.md`:
```
open_shop  payload: { shopId?, codexId?, tier?, archetype?, nodeId?, name? }
```
- If `shopId` names an existing `w.shops` entry → open it (re-visiting a known merchant; its depleted
  coin/stock persist).
- Else **mint** one: `shop = makeShop({tier, archetype, nodeId, name, rng})`, assign a stable id
  (`shopId` or derive from codexId/name), store in `w.shops`, link `codexId` if given.
- Set `GS.activeShopId = shop.id; GS.gamePanel = 'shop';` then `renderWorld()`.
- This is how the **DM opens a merchant in-fiction** (the bridge emits `open_shop` when the player enters a
  shop / talks to a merchant). Keep it detected-not-declared: the DM decides WHEN a shop opens; the engine
  owns the stock/prices.

### 2c. Dev entry (test without the bridge)
Add a **⚙ Menu › Dev tools › "Open test shop"** affordance that emits
`open_shop{tier:2, archetype:'general', name:'Test Market'}` — so the panel is exercisable in a plain
static server with no live DM (needed for the browser walk in §6). Dev-gated, same as the other dev tools.

---

## 3. The shop panel — `shopPanel(w, cur, shop)` in `src/world/render.js`

New panel branch in `gamePanelContent`: `case 'shop': return shopPanel(w, cur, shopOf(w, GS.activeShopId))`.
Keep the standard `.panel-close` × (→ `openPanel(null)`). Layout (wireframe-consistent, two stacked or
side-by-side sections):

**Header:**
- Merchant name + archetype label + location.
- **Your gold:** `sh.gold` gp. **Merchant's coin:** `shop.coin` gp (so the player sees the saturation cap).

**BUY section — the merchant's stock:**
- One row per `shop.stock` entry: item name (+ qty if >1) · `itemPrice(name).gp` gp · a **Buy** button.
- **Consumables/potions visually flagged** (the keystone sink — they should read as the thing you keep
  coming back for). Reuse the condition/enchant tag styling family.
- **Buy button disabled** (with a reason tooltip) when `sh.gold < price` (unaffordable) or the item is
  unpriceable. `onclick="buyItem('${shop.id}', '${escaped name}')"`.

**SELL section — the player's inventory:**
- One row per sellable `sh.inventory` instance: name · `sellValue(name, shop).gp` payout · a **Sell** button.
- Show the **capped** payout when `sellValue(...).capped` (merchant can't pay full) — e.g. "180 (capped)".
- **Sell button disabled** when unsellable (`gp==null`) or `shop.coin <= 0` (merchant is out of coin —
  the saturation guard made visible). `onclick="sellItem('${shop.id}', '${instanceId}')"`.
- Items already equipped: allow selling but confirm (reuse any existing equip state check), or simply show
  an "equipped" tag — do not silently sell the worn armor. (Judgment call: a confirm toast is fine.)

**Empty states:** no stock → "The merchant has nothing to sell." No sellable inventory → "You have nothing
they'll buy."

---

## 4. Transaction handlers — `src/world/shop.js` (NEW module, keeps render.js lean)

Owns: `shopOf`, `openShopRecord` (helper for the event), `buyItem`, `sellItem`. Register in manifest +
`<script>` tag (world layer, after render/dm).

```
function shopOf(w, id){ return (w.shops && w.shops[id]) || null; }

function buyItem(shopId, name){
  const w = activeWorld(); const cur = livingChar(w); const sh = cur.sheet; const shop = shopOf(w, shopId);
  const r = previewBuy(sh, shop, name);
  if(!r.ok){ toast(buyRefusalMsg(r.reason)); return; }        // insufficient-gold / out-of-stock / unpriceable
  const applied = applyEvent(w, r.event);                     // the ONE gear/coin mutator
  if(!applied.ok){ toast(applied.note || 'Could not carry that.'); return; }   // e.g. over-capacity (STR×30)
  applyStockDelta(shop, r);                                   // decrement stock qty (from r.stockDelta or by name)
  saveU(); renderWorld();
}

function sellItem(shopId, instanceId){
  const w = activeWorld(); const cur = livingChar(w); const sh = cur.sheet; const shop = shopOf(w, shopId);
  const r = previewSell(sh, shop, instanceId);
  if(!r.ok){ toast(sellRefusalMsg(r.reason)); return; }       // not-held / unsellable / merchant-broke
  const applied = applyEvent(w, r.event);
  if(!applied.ok){ toast('Sale failed.'); return; }
  shop.coin -= r.payout;                                      // merchant spent coin (saturation guard, stateful)
  addToShopStock(shop, r);                                    // optional: the sold item becomes buyable
  saveU(); renderWorld();
}
```
- Use whatever the merged codebase's real accessors are for "active world" and "living character"
  (`activeWorld()`, the `cur` computation in `renderWorld` — reuse it, don't reinvent). Reconcile at §1.
- Every refusal path surfaces a `toast` — never a silent no-op (the ITEMS discipline: failures are visible).
- `saveU()` after each transaction so a reload preserves the depleted shop + the new inventory/gold.

---

## 5. CSS (genesis.html) + rail/entry

- Add `.shop-panel` styles (header with the two coin readouts, two sections, buy/sell rows, disabled-button
  state, the consumable flag). Match the parchment/gold skin and the panel-tab visual language from the UI
  redesign. Fit the panel height; only its list scrolls if unavoidable (the no-scroll invariant).
- **No standing rail glyph for the shop** — it is contextual (opened by `open_shop`). When
  `GS.gamePanel==='shop'`, the shop panel occupies the slide-in `panel-col` like any other panel; closing
  it (`openPanel(null)`) returns to the feed. (If the merged UI makes it trivial to show a transient "◈ At:
  Merchant" affordance while a shop is active, that's a nice-to-have, not required.)

---

## 6. Verification plan (mandatory)

1. **`check-manifest` clean** — `src/world/shop.js` registered with `owns`; `<script>` tag placed; no drift.
2. **Full existing suite green — 0 regressions** (incl. `verify-economy` from the economy branch, and the
   UI redesign's jsdom assertions). Report pass counts.
3. **New jsdom shop test** (`dev/verify-shop-ui.mjs` or extend the UI test): load the real app, roll a PC
   with known gold, emit `open_shop{tier:2, archetype:'general'}`, assert `GS.gamePanel==='shop'` and the
   panel DOM renders a BUY list + a SELL list + both coin readouts. Then:
   - **Buy:** click-equivalent `buyItem(shopId, name)` for an affordable item → assert `sh.gold` dropped by
     price, the item is in `sh.inventory`, and `shop.stock` qty decremented.
   - **Unaffordable:** set gold below a price → `buyItem` → assert NO change + the button would be disabled
     (assert the disabled attribute in the rendered row).
   - **Over-capacity:** load the PC near the STR×30 cap → buy a heavy item → assert it's refused (applied
     event `over-capacity`) and gold/inventory unchanged.
   - **Sell:** `sellItem(shopId, id)` → assert `sh.gold` rose by payout, instance gone, `shop.coin` dropped.
   - **Merchant broke:** drain `shop.coin` to 0 → assert sell buttons disabled + `sellItem` refused.
   - **Persistence:** after a buy+sell, `saveU()` then reload/`loadU` → assert `w.shops[id].coin`/`stock`
     reflect the transactions (depletion persisted).
4. **7th check — mutation guards:** break (a) the affordability disable (unaffordable buy must then wrongly
   succeed → test RED), (b) the `saveU()` after a transaction (persistence test RED), (c) the `shop.coin`
   decrement on sell (merchant-broke test RED) — confirm each goes red, then restore → green.
5. **Live browser walk (required here — it's UI):** serve the app, use the dev "Open test shop", and walk
   it: buy a Potion of Healing (watch gold + inventory + stock update), sell a mundane item (watch gold +
   merchant coin update), hit the merchant-broke and can't-afford disabled states. Screenshot the panel.
   Confirm the page never scrolls (only the feed/list does) and the skin matches the wireframe.

---

## 7. Out of scope

- Haggling, dynamic supply/demand, regional prices, restocking-over-time (a shop's stock is fixed for the
  session in v1) — deferred expansions.
- Lodging/lifestyle sink (separate feature).
- Valuable-loot content (gems/art) — the sell-content fast-follow; not needed for the panel to work.
- Multi-currency display (CP/SP/EP/PP) — v1 shows gp; the engine's unit conversion already normalizes.

---

## 8. Definition of done

- `open_shop` event mints/loads a persisted `w.shops` record and opens the shop panel; a dev affordance
  opens a test shop without the bridge.
- The shop panel renders buy + sell with live prices/payouts, both coin readouts, consumables flagged,
  and correctly-disabled buttons for unaffordable / unsellable / merchant-broke.
- `buyItem`/`sellItem` route every change through `previewBuy`/`previewSell` → `applyEvent`, deplete the
  shop's stock/coin, `saveU`, and re-render; every refusal toasts.
- `check-manifest` clean · full suite green (0 regressions) · the new shop jsdom test green · mutation
  guards red→green · a live browser walk screenshotted.
- The money loop is now clickable end-to-end: a player can spend loot on potions and feel the drain.
