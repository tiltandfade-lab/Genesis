---
type: system-spec
status: specced 2026-07-01 night — build-ready (overnight batch). Valuables table = PROVISIONAL until Adam's craft pass.
created: 2026-07-01
related:
  - "[[ECONOMY]]"
  - "[[SHOP-UI]]"
  - "[[ITEMS]]"
  - "[[LOOT-REMAP]]"
---

# Economy Sinks & Sell Content — lodging + valuables

## §0. Scope (staleness correction included)

`open_shop` is **already built** (`src/world/dm.js:1289` — mints/loads `w.shops`, opens the
panel; NEXT-STEPS was stale). The two REAL fast-follows from `ECONOMY.md §8`:
**(A) the lodging/rest sink** — resting costs nothing today (`passTime`, `src/world/play.js:237`,
has no gold hook) — and **(B) valuable-loot sell content** — the sell system has nothing to sell
(SRD ships no gems/art/trade goods). Adam's calls (2026-07-01): lodging uses the already-decided
**"shelter has an owner"** model; the valuables table is **Sonnet-drafted tonight, PROVISIONAL
until his craft review**.

## §A. The lodging sink

- **`LODGING_GP` in `data/economy.js`**, keyed by PLACE_TIERS tier — one night, meals included:
  tier 0 (hamlet) **1 gp** · tier 1 (village) **1 gp** · tier 2 (town) **2 gp** · tier 3 (city)
  **4 gp**. Script owns the number; a tunable constant, not a roll.
- **Trigger:** `passTime("dawn")` and `passTime("montage")` **at an inhabited node** (reuse
  whatever inhabited/settlement check the ambient-pool work uses — reconcile; a travel walk or
  wilderness node charges nothing, camping is free v1). Short rests are free everywhere.
- **Charge:** emit the existing `item_changed {gold:-price}` path + a ledger line
  ("Lodging at <place> — 2 gp"). **Insufficient gold:** the rest still happens (never
  hard-block sleep), charge `min(gold, price)`, and the ledger notes the shortfall as unpaid —
  DM material with teeth, not a wall.
- **Owner tint:** if the node has a bound owner/innkeeper codex NPC (the gen handshake will mint
  these), apply the shop attitude tint (`ecAtt`, ±10%/rung) to the price. No owner = flat price.
- **UI:** the rest buttons (`render.js:317–319`) show the price when it applies —
  `☾ Rest until dawn · 2 gp` — so the sink is visible before it bites.

## §B. Valuables — the sell-content table + plumbing

- **New source table (PROVISIONAL):**
  `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Loot - Valuables.md` — d100,
  spice-graded to `SPICE-CURVE` bands (Grounded 1–66 · Textured 67–86 · Strange 87–95 ·
  Volatile 96–99 · Mythic 100), columns: **Band | Item | Value (gp) | Note**. Gems, art
  objects, trade goods, curios; Grounded rows are honest mundane value (5–50 gp), the high tail
  is where value entangles with story (a signet someone's looking for; a gem that hums).
  Frontmatter `status: draft` + a `> PROVISIONAL — Adam craft pass pending` callout. Follow
  `REAUTHORING-RUBRIC.md` voice standards; this is a draft FOR review, not canon. Compile it
  (`compile-tables.py --emit`) — coverage must be clean.
- **Instance plumbing:** valuable instances carry an explicit **`value` (gp)** on the item
  instance (minted via `item_changed` add or the loot path). `previewSell` honors
  `instance.value` as a price override before `itemPrice(name)` lookup (they're not in the SRD
  catalog). Merchant coin cap + attitude tint apply unchanged.
- **Loot wiring:** `dwalkLoot`'s coin slot occasionally upgrades to a valuable — on loot rolls
  where the coin roll maxes (reconcile `dwalkCoin`'s shape; ~top-third result), roll
  `dungeon-loot-valuables` and attach it alongside coin. Deterministic, no new budget math.
- **`rollLoot` (ON-DEMAND-GEN §5) gains `opts.kind:"valuable"`** → one valuables roll (the DM
  can hand the party a fenceable prize on demand).

## §C. Build plan

1. `LODGING_GP` + the `passTime` charge hook + shortfall ledger + owner tint (§A).
2. Rest-button price labels (§A).
3. The valuables table (draft, `status: draft`) + compile + coverage check (§B).
4. `instance.value` override in `previewSell` + the loot-slot upgrade + `rollLoot` kind (§B).
5. `dev/verify-economy-sinks.mjs`.
6. `check-manifest` + full sweep.

## §D. Verification

1. Dawn rest at a tier-2 town: gold −2, ledger line present; same rest at a wilderness node:
   gold unchanged. Short rest: free everywhere.
2. Gold 1, price 2 → gold 0, rest happens, ledger notes 1 gp unpaid (mutation check: make
   shortfall hard-block the rest, harness fails — sleep is never walled).
3. Owner NPC at attitude +2 → price ×0.8 (rounded, min 1); no owner → flat.
4. Valuables table compiles clean, full 1..100 coverage, band shares match the spice curve.
5. A valuable instance with `value: 40` sells for `floor(40×0.5)` ± attitude, capped by merchant
   coin; a no-value valuable falls back to `itemPrice`/refusal exactly as today.
6. Maxed coin roll attaches a valuable alongside coin; ordinary rolls don't.
7. Regression: `verify-economy` 43/43 + `verify-shop-ui` 46/46 stay green.

## §E. Acceptance (felt)

Money leaves. A week of town living costs real gold; consumables + lodging together make the
wallet a live constraint (the keystone-sink philosophy applied to rest). And the sell tab
finally has a reason to exist — the party fences a garnet, not a fifth shortsword.
