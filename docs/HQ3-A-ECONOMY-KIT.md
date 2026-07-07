---
type: system-spec
project: Genesis
status: specced — Sonnet-ready, not built
updated: 2026-07-07
owns-none: spec only (no new module)
source-findings: SET-05-F1, SET-04-F1, SET-04-F2 (dev/playtest-0707/FINDINGS.md); RV-1 (docs/PLAYTEST-BUGS.md)
---

# HQ3-A — Economy / Kit cluster

Three engine fixes off the marathon economy runs. A fresh PC is born over-encumbered and can
never pick up loot (A1); the memoryless seat is blind to the PC's purse (A2); the engine won't
enforce affordability even when told a purchase overdraws (A3). All three are load-bearing for
theme-B (economy) play.

**Boundary law (CLAUDE.md):** the only payload *normalization* here is `gold→number`, which already
lives in `DM_EVENT_FIELDS` (`item_changed: { … num:["gold"] }`, dm.js:1458). Capacity and affordability
are **handler business-logic, not coercion** — they correctly live in the `item_changed` handler, never
in `dmFoldPayload`. No new coercion is added by this spec.

---

## Adam's ledger (defaults taken, overridable)

1. **A1 bundle mechanism = a `bundle:true` def flag** (weight is the whole-bag total; **qty is
   ignored for weight**). NOT per-unit division, NOT a qty→1 rewrite. This keeps the fiction qty
   (a bag of *1000* bearings, *20* caltrops) intact while fixing the weight. **Bundle set =
   `{Ball Bearings, Caltrops}`** — the two SRD "bag of N" *Adventuring Gear* rows whose table weight
   is a bag total (Arrows are already correctly per-unit via `load_ammunition`; Pitons/Rations are
   genuinely per-unit and stay so).
2. **Weight math is unified** through one new global `instWeight(inst)` in `src/engine/combat.js`,
   called by BOTH `carryTotals` and the `item_changed` add-weight reducer — this also kills the
   existing duplicate reduce (anti-drift; the boundary law's "one implementation" posture).
3. **Refusals surface via the existing `drift` ledger channel** (`addLedger(w,"drift",…)`), NOT a
   new digest slice. A drift line rides `recentLedger` (digest ships `slice(-6)`), so the memoryless
   seat sees the refusal on its next turn — same mechanism as the payload-drift lines. This closes
   RV-1 for these two refusal shapes.
4. **A3 = REFUSE, atomically** (neither item nor coin moves), NOT flag-and-continue. **Scope: only a
   PURCHASE** — an `item_changed` with a non-empty `add[]` AND a negative `gold` that would overdraw.
   A **gold-only** negative (no `add[]` — a fine / theft / bribe / tax) keeps the existing
   `Math.max(0,…)` clamp: that's a DM-narrated deduction, not a purchase the PC must "afford".
   **`force:true` overrides affordability** too (mirrors the cap override at dm.js:2324).
5. **A2 = a top-level `pc.gold` integer**, shipped every turn like `pc.hp`. **Gold is the only coin
   field** the sheet models (economy v1 is gold-only; `sh.gold` is the sole currency — grep-verified).
   No sp/cp. It is NOT duplicated into `resourceDigest` — one source of truth.
6. **A1 audit result (part c): no kit quantity needs changing.** The bundle-weight bug was the ONLY
   over-cap driver; fixing it at the weight layer drops the Burglar's Pack from 2039.5 lb → 41.5 lb.
   The kit `qty` values (incl. `Ball Bearings ×1000`) stay as-authored.

---

## Verified anchors (line numbers re-checked 2026-07-07)

| symbol | file:line | note |
|---|---|---|
| `carryTotals(inventory)` | `src/engine/combat.js:562` | `sum + ((d&&d.weight)||0)*(it.qty||1)` — the qty×unit bug locus |
| `carryCapacity` / `carryState` | `src/engine/combat.js:565-572` | hard = STR×30; unchanged |
| `itemDef` / `baseDef` | `src/engine/combat.js:389,404` | `baseDef(inst)=itemDef(inst.base||inst.name)` |
| `item_changed` case | `src/world/dm.js:2318` | the one gear/coin mutator |
| over-capacity guard | `src/world/dm.js:2324-2331` | returns `{ok:false,reason:"over-capacity"}` — **no ledger line today** |
| add-weight reducer | `src/world/dm.js:2326-2328` | duplicate of `carryTotals`' per-instance math |
| gold clamp | `src/world/dm.js:2421` | `sh.gold=Math.max(0, before+p.gold)` — the A3 locus |
| `bastion_claim` afford guard | `src/world/dm.js:3900-3901` | `if(gold<price) return {ok:false,reason:"cannot-afford:"+price}` — the mirror |
| `dmDigest` pc block | `src/world/dm.js:334-370` | `pc.hp` at :340 — the A2 insertion neighbour |
| `DM_EVENT_FIELDS.item_changed` | `src/world/dm.js:1458` | `num:["gold"]` already present; no change |
| `ITEMS_BY_NAME["ball bearings"]` | `data/items.js:165-175` | `weight:2.0` (bag total), `stackable:false` |
| `ITEMS_BY_NAME["caltrops"]` | `data/items.js:406-416` | `weight:2.0` (bag total) |
| `PACK_EXPANSIONS["Burglar's Pack"]` | `data/items.js:5493` | `{name:"Ball Bearings",qty:1000}` |
| gen source | `build/gen-items.py` (`load_adventuring_gear` ~217; `_SKIP_GEAR_ROWS` ~201) | items.js is **generated — edit here + regenerate** |

---

## HQ3-A1 — starter-kit carry-cap brick (HIGH)

### Problem
`carryTotals` and the `item_changed` add-reducer compute `weight × qty`. Ball Bearings' def weight
`2.0` is the SRD **bag total**, but the kit mints `qty:1000` → 2000 lb, blowing the STR×30 hard cap
(360 lb for Sella at STR 12). Every `item_changed {add}` is then refused `over-capacity`, and through
the roll-branch path the refusal is **silent** (no ledger line). Audit (below) confirms this is the
only pack that breaks the cap.

### Fix — three parts

**(a) `bundle:true` def flag + a unified `instWeight`.**

*Source edit (edit-source→compile-artifact):* in `build/gen-items.py`, add a bundle set and stamp the
flag in `load_adventuring_gear`:

```python
# bag-of-N Adventuring Gear whose table weight is the BAG total, not per-unit (the kit mints qty=N).
_BUNDLE_ITEMS = {"ball bearings", "caltrops"}
...
items[key] = {
    "name": name, "kind": "gear", "category": "Adventuring Gear",
    "weight": parse_weight(weight_s), "cost": parse_cost(cost_s),
    "stackable": False,
    **({"bundle": True} if key in _BUNDLE_ITEMS else {}),
}
```
Then regenerate: `python3 build/gen-items.py` → `data/items.js` gains `"bundle": true` on those two
defs. (Do NOT hand-edit items.js.)

*Engine edit* — `src/engine/combat.js`, replace the `carryTotals` body (562-564) with a shared helper:

```js
// weight of ONE inventory instance — bundle items (bag-of-N gear) weigh their fixed bag total,
// qty ignored; everything else is per-unit × qty. THE one place instance-weight is computed.
function instWeight(inst){
  const d = baseDef(inst); if(!d) return 0;
  const w = (typeof d.weight === "number") ? d.weight : 0;
  return d.bundle ? w : w * (inst.qty || 1);
}
function carryTotals(inventory){
  return (inventory || []).reduce((sum, it) => sum + instWeight(it), 0);
}
```
(`instWeight` is a top-level `function` → global, like its neighbours; `manifest.json` `owns` for
combat.js already covers `carryTotals`/`carryState` — add `instWeight` to that list. Run
`check-manifest.py`.)

*Handler edit* — `src/world/dm.js:2326-2328`, route the add-reducer through the SAME helper (a spec is
shape-compatible: it carries `name`, optional `base`, optional `qty`):

```js
// BEFORE
const addW=(p.add||[]).reduce((s,spec)=>{ const nm=String((spec&&spec.name!=null?spec.name:spec)||"").trim();
  const d=itemDef((spec&&spec.base)||nm); const q=(spec&&typeof spec.qty==="number"&&spec.qty>0)?spec.qty:1;
  return s+((d&&d.weight)||0)*q; },0);
// AFTER
const addW=(p.add||[]).reduce((s,spec)=>{ const nm=String((spec&&spec.name!=null?spec.name:spec)||"").trim();
  const q=(spec&&typeof spec.qty==="number"&&spec.qty>0)?spec.qty:1;
  return s+((typeof instWeight==="function")?instWeight({base:(spec&&spec.base)||undefined,name:nm,qty:q}):0); },0);
```
(Guard `carryState`/`itemDef` at 2324 stays; add `instWeight` to that `typeof` guard so a lean headless
context still skips cleanly.)

**(b) Surface the over-capacity refusal.** `src/world/dm.js:2329-2330`, add a drift line before the
early return so `recentLedger` carries it to the next seat:

```js
if(cur.weight+addW>hard){
  addLedger(w,"drift",{kind:"over-capacity",pc:t.c.name,weight:cur.weight,add:addW,hard:hard,source:src},
    "◇ "+t.c.name+" can't carry that — "+Math.round(cur.weight+addW)+" lb would exceed the "+hard+" lb hard cap. The pickup is refused.");
  return {ok:false,reason:"over-capacity",weight:cur.weight,add:addW,hard:hard,
    note:t.c.name+" can't carry that much — over the "+hard+" lb hard cap."};
}
```
The `applied[].res` path in `applyResponse` (dm.js:551,566) already carries `{ok:false,reason}` into
dmlog; the drift line is the seat-visible half (digest).

**(c) Audit — all pack/kit default quantities vs the cap (STR 12 → hard 360 lb):**

| pack | total (before) | heaviest line | total (after bundle fix) |
|---|---|---|---|
| Explorer's Pack | 54.0 | Rations ×10 (20) | 54.0 |
| Dungeoneer's Pack | 55.5 | Rations ×10 (20) | 55.5 |
| Priest's Pack | 24.0 | Backpack (5) | 24.0 |
| **Burglar's Pack** | **2039.5** | **Ball Bearings ×1000 (2000)** | **41.5** ✅ |
| Entertainer's Pack | 38.0 | Rations ×5 (10) | 38.0 |
| Scholar's Pack | 11.3 | Backpack (5) | 11.3 |
| Diplomat's Pack | 34.0 | Chest (25) | 34.0 |

Conclusion: **only the Burglar's Pack broke the cap, via the bundle-weight bug alone.** Post-fix every
pack is ≤55.5 lb + kit weapons/armor — comfortably under a STR-8 wizard's 240 lb. No `qty` edits needed.

---

## HQ3-A2 — ship `pc.gold` in the digest (HIGH)

### Problem
`dmDigest.pc` has hp / slots / pools / inventory but **no coin field** — the memoryless seat can't
adjudicate affordability or overspend. Mirrors BUG-03 (hp was hidden).

### Fix
`src/world/dm.js`, in the `pc` object, right after the `hp:` line (:340), add:

```js
hp:sh?Object.assign({cur:(sh.hpCur!=null?sh.hpCur:sh.hp), max:(sh.hp||0)},(sh.tempHp>0?{temp:sh.tempHp}:{})):null,
// gold is the only coin the sheet models (economy v1 is gold-only). Ships every turn like hp — a
// small int, and the seat MUST see the purse before adjudicating any buy/afford beat (SET-04-F1).
gold:sh?(sh.gold||0):null,
```
No change to `resourceDigest` (single source). No byte-budget concern (an int; well inside the
digest-diet guard).

---

## HQ3-A3 — affordability backstop on `item_changed` (HIGH)

### Problem
`sh.gold=Math.max(0, before+p.gold)` (dm.js:2421) *clamps* to 0 instead of refusing when a purchase's
negative gold exceeds the purse — so a 75-gp warhorse lands for a 9-gp PC. The gate rests entirely on
seat fiction. `bastion_claim` already has the correct shape (`cannot-afford:<price>`, dm.js:3901).

### Fix
`src/world/dm.js`, insert **after** the over-capacity guard (after :2331) and **before** the mutation
(`const removed=[]`, :2332) — an atomic early return, same posture as the cap guard:

```js
// AFFORDABILITY (SET-04-F2): a PURCHASE (non-empty add[]) whose negative gold would overdraw the
// purse is REFUSED atomically — neither item nor coin moves — mirroring bastion_claim's cannot-afford
// guard (dm.js:3901). A gold-ONLY negative (no add[]: a fine/theft/bribe) still clamps at 2421 (a
// DM-narrated deduction, not a purchase to "afford"). force:true overrides (DM's call). p.gold is a
// number-or-null (coerced in dmFoldPayload, num:["gold"]) — NO handler-side coercion (boundary law).
if((p.add||[]).length && typeof p.gold==="number" && p.gold<0 && !p.force){
  const have=sh.gold||0, need=-p.gold;
  if(have + p.gold < 0){
    addLedger(w,"drift",{kind:"cannot-afford",pc:t.c.name,have,need,source:src},
      "◇ "+t.c.name+" can't afford that — "+need+" gp needed, "+have+" in purse. The purchase is refused.");
    return {ok:false,reason:"cannot-afford:"+need,have,need};
  }
}
```
Seat-visible result shape: `{ok:false, reason:"cannot-afford:<need>", have, need}` (in
`applied[].res`) **plus** the drift line in `recentLedger`. The `Math.max(0,…)` at 2421 is unchanged
(it still handles the legitimate gold-only-deduction clamp and any covered purchase).

---

## Acceptance criteria

- **A1a** `carryTotals([{name:"Ball Bearings",qty:1000}]) === 2` (bag, not 2000). Caltrops ×20 → 2.
- **A1a** A fresh Rogue (Burglar's Pack, STR 12) is under the 360 lb hard cap; `item_changed {add:[…]}`
  for a normal loot item **succeeds** (`ok:true`, item in inventory).
- **A1a** Per-unit items unaffected: `carryTotals([{name:"Plate Armor"}])===65`; Arrows ×20 → 1 lb.
- **A1b** An over-cap `item_changed {add}` returns `ok:false, reason:"over-capacity"` AND writes a
  `drift`/`over-capacity` ledger entry that appears in `dmDigest().recentLedger`.
- **A2** `dmDigest().pc.gold` is an integer equal to `sh.gold` (0 when empty), present every turn.
- **A3** `item_changed {add:[warhorse], gold:-75}` with `sh.gold=9` → `ok:false,
  reason:"cannot-afford:75"`, **item NOT added, `sh.gold` still 9**, drift line present.
- **A3** `item_changed {gold:-75}` (no add[]) with `sh.gold=9` → clamps to 0, `ok:true` (fine/theft
  path unchanged). `force:true` purchase over-draw → applies (override).
- **Gate:** `python3 build/check-manifest.py` OK (after adding `instWeight` to combat.js `owns`);
  `python3 build/gen-items.py` re-run leaves a clean diff (only the two `bundle:true` additions).

## Verify plan

- **Extend `dev/verify-items.mjs`** (encumbrance block, ~558-573):
  - `instWeight`/`carryTotals`: `Ball Bearings ×1000 === 2` and `Caltrops ×20 === 2` (bundle); Plate
    ×1 === 65 and Arrow ×20 === 1 (per-unit) as regression anchors.
  - Burglar's-Pack expansion summed through `carryTotals` is `< 90` (i.e. ≤ a STR-3 hard cap), proving
    a fresh burglar can carry the kit.
  - Over-cap `item_changed {add}` → `ok:false` **and** the last `recentLedger`/ledger entry is
    `kind:"over-capacity"` (the A1b surfacing).
- **Extend `dev/verify-economy.mjs`** (affordability): with `mkWorld(9)` —
  `item_changed {add:[{name:"Warhorse"|any 70lb-safe item}], gold:-75}` → `ok:false`,
  `reason==="cannot-afford:75"`, `sh.gold===9`, item **absent**; the gold-only `{gold:-75}` still
  clamps to 0; `force:true` purchase over-draw applies.
- **Extend `dev/verify-digest-diet.mjs`**: assert `digest.pc.gold` is a number and equals `sh.gold`;
  confirm it doesn't breach the diet budget.
- **Add probes to `dev/playtest-bug-probes.mjs`** (deterministic PRESENT→resolved): `SET-05-F1`
  (bundle weight + over-cap add succeeds + refusal ledgered), `SET-04-F1` (`pc.gold` in digest),
  `SET-04-F2` (purchase over-draw refused, gold unchanged).

## Mutation-test regression checks (what breaks RED if reverted)

- Revert **A1a** (`bundle` flag / `instWeight`) → `carryTotals(Ball Bearings ×1000)` = 2000; the
  verify-items bundle check + the burglar-under-cap check go RED; the SET-05-F1 probe flips PRESENT.
- Revert **A1b** (drift line) → the "over-capacity refusal appears in recentLedger" check goes RED
  (the return `{ok:false}` alone is invisible to the seat — the exact RV-1 gap).
- Revert **A2** (`pc.gold`) → `verify-digest-diet` "pc.gold present" goes RED; SET-04-F1 probe PRESENT.
- Revert **A3** (afford guard) → the over-draw clamps to 0 and the item lands; verify-economy
  "purchase refused / gold unchanged / item absent" goes RED; SET-04-F2 probe PRESENT.

## Coherence touch-ups (same change)

- `docs/EVENT-CONTRACT.md` — note the two seat-visible `item_changed` refusal reasons
  (`over-capacity`, `cannot-afford:<n>`) and that both drift-ledger.
- `docs/SEAT-PROMPT.md` — one line: the digest ships `pc.gold`; a purchase the PC can't afford (or a
  pickup over the carry cap) is refused, surfaced as a drift ledger line — re-narrate, don't assume it
  landed. (Documentation only; not a code change.)
- `docs/DESIGN.md` + `docs/NEXT-STEPS.md` + the Cowork auto-memory: record the HQ3-A close per CLAUDE.md.
