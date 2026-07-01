---
type: system-spec
project: Genesis
status: BUILT 2026-07-01 (Sonnet-executed, Opus-reviewed, live-walked; verify-shop-ui 46/46)
created: 2026-07-01
author: Opus (frontier spec) — for Sonnet execution, Opus review
depends_on:
  - docs/IN-SESSION-UI.md   # merged (feat/in-session-ui)
  - docs/ECONOMY.md         # merged (feat/economy-spine)
note: >
  Adam's four design rulings (2026-07-01) are folded in below and OVERRIDE the original §3/§7 text
  where they conflict: (1) tabbed Buy|Sell panel; (2) confirm-on-plaque transaction flow; (3)
  attitude-tinted prices (±10%/rung off the merchant's codex attitude — engine-owned); (4) stock
  counts shown, merchant coin pool HIDDEN (soft warning only). §1 symbols are reconciled as-built.
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

## 1. As-built reconciliation (RESOLVED 2026-07-01 — these are the real symbols)

- **Panel system:** `gamePanelContent(w,cur,panel)` (src/world/render.js:330) dispatches panel bodies;
  `openPanel(name)` (render.js:803) toggles `GS.gamePanel`. Tab bars render via `panelTabBar(tabs,
  active, setterName)` (see `renderActionsPanel` for the pattern + a `setActionsTab`-style setter).
- **Economy engine** (src/engine/economy.js, all confirmed): `itemPrice(name)→{gp,consumable,source}` ·
  `sellValue(name,merchant)→{gp,capped}` · `merchantCoin(tier)` · `makeShop({tier,archetype,nodeId,name,
  id?,codexId?,rng})` · `previewBuy(sh,shop,itemName)→{ok,price,stockDelta,event}|{ok:false,reason}` ·
  `previewSell(sh,shop,instanceId)→{ok,payout,capped,coinDelta,stockDelta,event}|{ok:false,reason}`.
  Reasons: `out-of-stock|unpriceable|insufficient-gold` / `not-held|unsellable|merchant-broke`.
- **Attitude read:** `codexGetAttitude(w, codexId)` (see src/world/dm.js:1019ff usage) → attitude object;
  effective rung = its `.value`, clamp to [−2,2]; missing/unlinked → 0.
- **GS fields:** add `activeShopId:null`, `shopTab:"buy"`, `shopSel:null` to the `var GS` initializer
  (src/state.js:12) with one-line comments matching its style.

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

## 3. The shop panel — `shopPanel(w, cur, shop)` in `src/world/render.js` (RULINGS 1/2/4 APPLIED)

New panel branch in `gamePanelContent`: `case 'shop': return shopPanel(w, cur, shopOf(w, GS.activeShopId))`.
Keep the standard `.panel-close` × (→ `openPanel(null)`; also clear `GS.activeShopId` + `GS.shopSel`).

**RULING 1 — tabbed panel.** Structure mirrors `renderActionsPanel`: a `panelTabBar([["buy","Buy"],
["sell","Sell"]], GS.shopTab||"buy", "setShopTab")` over one body. `setShopTab(t)` sets `GS.shopTab`,
clears `GS.shopSel`, re-renders. No side-by-side sections.

**Header (above the tabs) — RULING 4:**
- Merchant name (Cinzel) + archetype label + location line.
- **Your gold:** `sh.gold` gp. **Do NOT render `shop.coin`** — the merchant's pool is hidden; it
  surfaces only as the soft warnings below.

**RULING 2 — confirm-on-plaque (both tabs).** Rows are selectable, not one-click transactional:
- `GS.shopSel = {kind:"buy"|"sell", key}` (key = item name for buy, instanceId for sell). Clicking a
  row toggles selection (`selectShopRow(kind, key)`); clicking again or selecting another row collapses it.
- The selected row expands with a detail strip: price/payout line + a gold **Confirm** plaque button
  (`.shop-confirm`, framed-plaque styling in the `.rl.on` family). Confirm calls `buyItem(shopId, name)` /
  `sellItem(shopId, instanceId)` and clears `GS.shopSel`.
- When the transaction is invalid, the Confirm plaque renders **disabled** with the reason inline
  (not a tooltip): "Not enough gold" / "Can't be priced" / "Their purse is empty".

**BUY tab — the merchant's stock:**
- One row per `shop.stock` entry with `qty>0`: item name · **qty shown** (RULING 4, e.g. "×3") ·
  effective price (see §3b tinting) in gp.
- **Consumables/potions visually flagged** (the keystone sink) — reuse the tag styling family.
- Unaffordable rows still select (the player can look), but Confirm is disabled per above.

**SELL tab — the player's inventory:**
- One row per `sh.inventory` instance: name · effective payout (§3b) in gp; unsellable (`gp==null`)
  rows show "—" and select with a disabled Confirm ("Can't be priced").
- **Capped payout (RULING 4 soft warning):** when `capped`, show the reduced figure with the inline
  note "they can't pay full price" on the expanded strip. When `previewSell` refuses `merchant-broke`,
  the Confirm disables with "Their purse is empty." The pool number itself never renders.
- Equipped items show an "equipped" tag; selling one is allowed (the confirm step IS the guard).

**Empty states:** no stock → "The merchant has nothing left to sell." No inventory → "You have nothing
they'll buy."

## 3b. Attitude-tinted prices (RULING 3 — engine-owned, src/engine/economy.js)

The social attitude ladder pays off at the till. **±10% per rung**, engine-computed:
- `itemPrice` is untouched (pure base). Add an optional clamped-int `att` param (default 0) to:
  - `sellValue(name, merchant, att)` → base becomes `Math.floor(p.gp * ratio * (1 + 0.10*att))`,
    THEN the coin cap applies (unchanged order: tint, then cap).
  - `previewBuy(sh, shop, itemName, att)` → effective price `Math.max(1, Math.round(price.gp *
    (1 - 0.10*att)))`; the affordability check and the returned `price`/`event.payload.gold` all use
    the effective price.
  - `previewSell(sh, shop, instanceId, att)` → passes `att` through to `sellValue`.
- Clamp `att = Math.max(-2, Math.min(2, att|0))` inside the engine (one shared `ecAtt(att)` helper).
- **Zero-regression invariant:** `att` omitted/0 must produce byte-identical results to today —
  `verify-economy` passes UNMODIFIED before any new tests are added.
- The UI resolves the rung once per render: `shopAttitude(w, shop)` (in src/world/shop.js) =
  `codexGetAttitude(w, shop.codexId)?.value ?? 0` when `shop.codexId` is set, else 0 — and passes it
  to every engine call. No pricing math in the UI.
- Display: when `att≠0`, the effective price renders with a hue cue — favorable (att>0) in
  `--grounded`, gouged (att<0) in `--blood` — no numeric breakdown (the fiction explains it).

---

## 4. Transaction handlers — `src/world/shop.js` (NEW module, keeps render.js lean)

Owns: `shopOf`, `openShopRecord` (helper for the event), `shopAttitude`, `setShopTab`, `selectShopRow`,
`buyItem`, `sellItem`. Register in manifest + `<script>` tag (world layer, after render/dm).
`buyItem`/`sellItem` resolve `att = shopAttitude(w, shop)` and pass it to `previewBuy`/`previewSell`
(§3b) — the render path and the transaction path MUST use the same `att` so the confirmed price is
the displayed price.

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
   with known gold, emit `open_shop{tier:2, archetype:'general'}`, assert `GS.gamePanel==='shop'`, the
   Buy|Sell tab bar renders, the BUY tab lists stock **with qty markers**, the header shows the player's
   gold and **does NOT contain `shop.coin`'s figure** (RULING 4), and no row has a direct Buy/Sell
   onclick — transactions only via the expanded Confirm plaque (`selectShopRow` → `.shop-confirm`). Then:
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
   - **Attitude tint (§3b):** link the shop to a codex NPC at attitude +2 → assert the rendered buy price
     is `round(base*0.8)` and `buyItem` charges exactly that; set −2 → `round(base*1.2)`; sell payout at
     +2 = `floor(base*ratio*1.2)` pre-cap. With NO codexId → prices byte-match the untinted engine.
   - **Engine zero-regression:** `verify-economy` green UNMODIFIED (att defaults preserve old outputs).
4. **7th check — mutation guards:** break (a) the affordability disable (unaffordable buy must then wrongly
   succeed → test RED), (b) the `saveU()` after a transaction (persistence test RED), (c) the `shop.coin`
   decrement on sell (merchant-broke test RED) — confirm each goes red, then restore → green.
5. **Live browser walk (required here — it's UI):** serve the app, use the dev "Open test shop", and walk
   it: buy a Potion of Healing (watch gold + inventory + stock update), sell a mundane item (watch gold +
   merchant coin update), hit the merchant-broke and can't-afford disabled states. Screenshot the panel.
   Confirm the page never scrolls (only the feed/list does) and the skin matches the wireframe.

---

## 7. Out of scope

- **Active haggling** (a Persuasion contest at the till) — deferred; RULING 3's passive attitude tint is
  the v1 social-pricing hook. Dynamic supply/demand, regional prices, restocking-over-time (a shop's
  stock is fixed for the session in v1) — deferred expansions.
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
