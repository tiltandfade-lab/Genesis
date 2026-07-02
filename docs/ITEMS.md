---
type: system-spec
branch: Genesis
status: built
created: 2026-06-30
updated: 2026-07-01
related:
  - "[[EVENT-CONTRACT]]"
  - "[[COMBAT]]"
  - "[[LOOT-REMAP]]"
  - "[[CODEX]]"
  - "[[DESIGN]]"
---

# Items — type/instance split (the bestiary pattern, applied to gear)

**Status: BUILT (2026-06-30 Part I; 2026-07-01 Part II — the whole of Part II now landed).** Gates:
`check-manifest` OK (57 modules) · **`verify-items.mjs` 117/117** · zero regressions across the full
suite (verify-combat 51, verify-dm-events 36, verify-walk 2798, verify-social 97, verify-levelup 90,
+14 more — all 0 failed).

**Part II BUILT 2026-07-01 (this session — all six decisions now resolved AND built):** ① the **congruent
item model (§E)** — a magic instance resolves BASE mechanics off `ITEMS_BY_NAME` via `inst.base` and carries
per-copy magic in `inst.ench` (`{bonus, damageRider, acBonus, charges:{max,cur}, attunement, rarity}`) + an
optional `inst.codexId` link; `MAGIC_ITEMS_BY_NAME` (261 items, generated from `magic-items.json`) is the
reference catalog + default overlay; `cmEquippedDamage`/`cmEquippedAC`/`defaultEquip` all honor the overlay.
② **all 27 potions mechanized (Decision 2)** — `item_use` fires the numeric heal tiers in-engine and stamps
every other potion as a structured `buff` the DM honors; ③ **charges** — `charge_spend`/`charge_restore` +
long-rest auto-refill; ④ the **live attack path** — `pcAttack`→`resolveAttack` driven by the equipped weapon
via the new `attack` event; ⑤ the **interactive inventory UI** — `equipItem`/`unequipSlot`/`useItem`/`setGrip`/
`attuneItem`/`unattuneItem` (`src/world/inventory.js`) with per-item Equip/Use/Grip/Attune buttons + ench/
charge/attunement badges. ⑥ **Decision 1 — Versatile two-handed grip**: the weapon index carries a
`versatile{n,die}`; `sheet.equipped.grip` (1h/2h, default 2h when the off-hand is free) swaps the die in
`cmEquippedDamage`; `set_grip` + the wield toggle drive it. ⑦ **Decision 4 — encumbrance ON**: `carryState`
(STR×15 soft → Speed 5, STR×30 hard); `item_changed` refuses an over-hard-cap pickup (`force` overrides);
the Carrying bar shows amber/red. ⑧ **Attunement cap** — `attune`/`unattune` enforce the SRD max-3; a
requires-attunement item's overlay is dormant (`enchActive`) until attuned. Conditions trimmed
(`frozen`/`waterlogged` cut, `rusted` parked). **Nothing from Part II remains open.**

Surfaced live during the
fast-lane playtest: fixing
the inventory-confiscation bug (`item_changed`, `EVENT-CONTRACT.md`) exposed that `sheet.inventory` is
a flat array of **plain strings** — `"Scimitar"`, `"Studded Leather Armor"` — with no mechanical content
behind the name. Three concrete asks fell out of that observation (Adam, same session): can items be
disambiguated for add/remove like the bestiary disambiguates monsters; can the engine know a weapon's
actual damage/type instead of the DM recalling it; can an item carry a status (on fire, poisoned,
cursed, dropped). All three point at the same fix. **All open questions resolved with Adam same
session** — see "Decisions" below (formerly "Open questions"); the build is now in progress.

## The central decision — type/instance split (the bestiary pattern, reapplied)

Genesis already solved this exact problem once, for monsters (`COMBAT.md` Layer 1–2): a generated
index (`data/bestiary.js`) holds the **type** (a Goblin's stat block, mechanically objective, SRD-or-
authored), and a live combat object holds the **instance** (this specific goblin, mid-fight, at 4 HP,
prone). The index is shared and read-only at runtime; the instance is the only thing that mutates.

Items want the identical split, and for the identical reason — anti-drift (`CLAUDE.md`: *the engine
does deterministic mechanical work; the AI does only the DM's interpretive job*):

| The TYPE (a generated index, like the bestiary) owns | The INSTANCE (in `sheet.inventory`) owns |
|---|---|
| Damage dice + type, AC bonus, weight, cost, properties — objective, SRD-derived | Which specific copy this is (a stable `id`) |
| Mastery property (5.5e), category (martial/simple, light/medium/heavy) | Quantity, if stackable (`qty`) |
| Whether it's stackable (20 Arrows) vs. unique (one Scimitar) | **Conditions** — on fire, poisoned-coated, cursed, dropped, broken |
| — never mutates at runtime | Custom display name override (a named heirloom blade) |
| — shared across every save that references it by name | — unique to one character's one copy |

**This is NOT "every item becomes a stored object."** A `"Mace"` string today is genuinely fine for
flavor-only background dressing. The split only pays for itself where the engine needs to *read*
something objective off an item (combat damage) or something needs to persist *per copy* (this dagger,
not daggers-in-general, is poisoned). Both of those are real, current gaps — see "Why now" below.

## Why now (the three asks, mapped to the fix)

1. **"Easier to add/remove from inventory?"** Today's `item_changed.remove` (`EVENT-CONTRACT.md`,
   built 2026-06-30) matches by **normalized name string, first hit** — it cannot distinguish two
   Maces, and can't target "the cursed one" specifically. A stable instance `id` fixes this directly:
   `remove` (and the new `condition_add`/`condition_remove`, below) target an id, never a name.
2. **"Objective damage/function?"** Confirmed gap: `src/engine/combat.js`'s `resolveAttack(o)` takes a
   caller-supplied `o.dmg` — for a **monster**, that's resolved from the bestiary
   (`cmFoeFrom`/`resolveCreature`); for the **PC's own weapon**, nothing resolves it. The DM has to
   recall "Scimitar = 1d6 slashing, Finesse" from memory every single attack — exactly the kind of
   invention Charter §8.5 says to mechanize first when the script *can* own it. It can: SRD weapon/armor
   data already exists, structured, in `Reference/SRD-Data/equipment-weapons-armor.json` (38 weapons,
   13 armor — name/category/damage/properties/mastery/weight/cost), unused by the engine today.
3. **"Statuses — on fire, poisoned, cursed, dropped?"** Cannot live in a flat string array at all; needs
   a per-instance home. This is structurally identical to how **PC conditions already work**
   (`cur.conditions: []`, read by `dmTriage`'s `pc-condition` signal and others) — items get the same
   shape, one level down. Not a new pattern, the existing one applied to a new noun.

## Data model

### The type index — `data/items.js` (generated, like `data/bestiary.js`)

```js
ITEMS_BY_NAME = {
  "scimitar": { name:"Scimitar", kind:"weapon", category:"Martial Melee Weapons",
                damage:{n:1,die:6,type:"slashing"}, properties:["Finesse","Light"],
                mastery:"Nick", weight:3, cost:{n:25,unit:"gp"}, stackable:false },
  "20-arrows": { name:"20 Arrows", kind:"gear", weight:1, cost:{n:1,unit:"gp"}, stackable:true, qtyDefault:20 },
  ...
}
```

- **Generator:** `build/gen-items.py`, parsing `Reference/SRD-Data/equipment-weapons-armor.json`
  (weapons + armor — already structured JSON, no markdown-table parsing needed, unlike the bestiary)
  plus a hand-authored supplement for adventuring gear / packs (rope, rations, torches — currently only
  living as prose in `equipment.md` and as `PACK_CONTENTS` literals scattered in `src/creator/*.js`;
  this generator is the chance to consolidate them into one real index instead of three copies).
- **Lookup key:** normalized name (same `norm()` — trim + lowercase — `item_changed` already uses for
  `remove` matching), so existing inventory strings resolve against it with zero migration cost.
  **Unindexed names degrade gracefully** — `ITEMS_BY_NAME[norm(name)]` returns `undefined`, and every
  reader (rendering, combat) falls back to "flavor-only, no mechanical content" exactly like today.
  Nothing breaks if the index is incomplete; it only ever *adds* capability.
- **Magic items stay OUT of this index.** `LOOT-REMAP.md`'s rarity tables + the codex `Item` kind
  (`CODEX.md` — "items are pointers, never copies," `source:{type,ref}`) already own narratively
  significant objects; `data/items.js` is the mundane-gear floor underneath them, same relationship
  the bestiary has to a named, storied monster (the index gives the baseline stats; the codex/ledger
  carries what makes *this* one matter).

### The instance — `sheet.inventory` (a breaking but small format change)

```js
// before:
sheet.inventory = ["Mace", "Shield", "Studded Leather Armor"]

// after:
sheet.inventory = [
  { id:"inv-a1b2", name:"Mace", conditions:[] },
  { id:"inv-c3d4", name:"Shield", conditions:[] },
  { id:"inv-e5f6", name:"Studded Leather Armor", conditions:["singed"] },
  { id:"inv-g7h8", name:"Arrow", qty:20, conditions:[] },
]
```

- `id`: stable, assigned on mint (`uid()`, already used everywhere else in the codebase). Never reused.
- `name`: resolves against `ITEMS_BY_NAME` for mechanical facts; free text otherwise (flavor-only items
  keep working exactly as they do today — no forced migration of every existing save).
- `qty`: present only on stackable types (arrows, rations, gold-adjacent consumables); absent = 1.
  **Splittable** (decided below) — `item_split` mints a second instance carrying part of the stack.
- `conditions`: a string array, same shape as `cur.conditions`, drawn from the fixed `ITEM_CONDITIONS`
  vocabulary (decided below). The DM declares them via event, same way it declares PC conditions today.
- Display name override is **deferred** (a named heirloom is a codex-Item concern — link the instance
  `id` to a codex record rather than growing every inventory entry's shape for the rare case).

### Equip slots — `sheet.equipped` (decided: named slots, not a single pointer)

```js
sheet.equipped = { mainHand:"inv-a1b2", offHand:"inv-c3d4", armor:"inv-e5f6" }
```

Three named slots, each holding an instance `id` or `null`. **Two-weapon fighting needs two
simultaneously-equipped weapons** (`mainHand`+`offHand`), so a single `equippedWeaponId` pointer (the
spec's original lean) was wrong — it can't represent dual-wield at all. Named slots generalize cleanly:
`offHand` can hold a second weapon *or* a shield (SRD: shield only grants its AC bonus with training,
already tracked elsewhere — out of scope here) but never both. `armor` is body armor; shields are an
`offHand` occupant, not a fourth slot. A weapon is `offHand`-eligible only if its `properties` includes
`"Light"` (SRD base two-weapon-fighting rule, `equipment.md` "Light" property: *the bonus-action extra
attack must be made with a different Light weapon* — `combat.js` validates this at resolve time, not at
equip time, so equipping is never blocked, only the attack math reflects the rule).

## EVENT-CONTRACT changes

`item_changed` (built 2026-06-30) currently matches `remove`/`add` by name. This is a **breaking
change to that event's payload** — acceptable because it shipped same-session, nothing depends on the
old shape yet:

| event | payload | change from current |
|---|---|---|
| `item_changed` | `{removeAll?, removeIds?:[id], add?:[{name,qty?}], gold?:delta, note?}` | `remove` → `removeIds` (id-targeted, unambiguous); `add` now takes objects so a qty can be set on mint |
| `condition_add` *(new)* | `{itemId, condition}` | mirrors the PC condition pattern, scoped to one inventory instance; `condition` must be in `ITEM_CONDITIONS` |
| `condition_remove` *(new)* | `{itemId, condition}` | — |
| `item_split` *(new)* | `{itemId, qty}` | splits `qty` off a stackable instance into a new instance with its own id (e.g. "drop 5 of 20 arrows") |
| `equip` *(new)* | `{itemId, slot: mainHand\|offHand\|armor}` | points the slot at the instance; clears whatever was there (one occupant per slot) |
| `unequip` *(new)* | `{slot}` | clears the slot |

`removeAll` still works unchanged (a searched/bound prisoner doesn't need per-id precision — it's
already total). The DM only needs an id when removing/tagging *one specific* item among several —
which `dmDigest`'s PC block should start including (`pc.inventory` mirrors `pc.resources` today) so the
DM can reference ids without inventing them.

## Build phases — ALL FOUR BUILT (2026-06-30)

1. **☑ P1 — the type index.** `build/gen-items.py` + `data/items.js`: 38 weapons + 13 armor/shield
   (from `equipment-weapons-armor.json`) and 78 adventuring-gear + 5 ammunition entries (from
   `equipment.md`'s real "Adventuring Gear"/"Ammunition" tables, regex-parsed) — 134 items total.
   `ITEM_CONDITIONS` (8: on-fire/frozen/poisoned-coated/cursed/broken/dropped/waterlogged/rusted).
   `PACK_EXPANSIONS` (all 7 SRD packs → real `{name,qty}` line items, 54/66 lines mechanically
   resolved, the rest flavor-only by honest degradation — Mess Kit, Pitons, etc. aren't in core SRD
   gear). `KIT_ITEM_EXPANSIONS` (generalizes the same parsing to every `CLASS_KIT` item string, not
   just packs — "4 Handaxes" splits to `{name:"Handaxe",qty:4}` too).
2. **☑ P2 — instance migration.** `sheet.inventory` is `{id,name,qty?,conditions:[]}`;
   `migrateWorld` (`src/world/state.js`) upgrades old string-array saves, idempotently; character
   creation (`cgSheetExtras`, `src/creator/sheet.js`) expands every kit item via
   `KIT_ITEM_EXPANSIONS` — a pack becomes its full individual contents, never one bundled string;
   `item_changed` uses `removeIds` (id-targeted); `item_split` mints a second instance off a stack;
   `renderCharacterPanel` shows real instances + total weight vs. carrying capacity (`STR×15`,
   informational only, per the SRD's own GM-invoked framing) + condition badges.
3. **☑ P3 — combat + equip wiring.** `sheet.equipped = {mainHand,offHand,armor}` (named slots — the
   `equip`/`unequip` events). `cmEquippedDamage` (`src/engine/combat.js`) resolves the PC's objective
   weapon damage from `ITEMS_BY_NAME` via the equipped instance — Finesse weapons use the better of
   STR/DEX, ranged uses DEX; the off-hand Light-weapon attack honors the SRD base dual-wield rule (no
   ability mod unless negative). `dmDigest.pc.equippedWeapons` surfaces the resolved spec every turn —
   this is the actual fix for "the DM has to recall the weapon's dice from memory," since
   `resolveAttack` itself isn't wired into a live runtime path yet (combat is still theater-of-mind
   per `COMBAT.md` — `cmEquippedDamage` is also the ready resolver for whenever the Fable-era tracker
   UI calls `resolveAttack` live).
4. **☑ P4 — conditions.** `condition_add`/`condition_remove` wired through `applyEvent` (validates
   against `ITEM_CONDITIONS` — an unknown condition is rejected, not silently accepted); a condition
   badge (`.item-cond`) on the inventory row.
5. **☑ P5 — AC from worn armor (post-review, 2026-06-30).** `cmEquippedAC` derives AC from the equipped
   armor (Light = base+DEX, Medium = base+min(DEX,2), Heavy = base, +shield), and `cmSheetAC` folds in
   flat feat bonuses (`sheet.acBonus`, e.g. Iron Skin's +1). The ONE canonical recompute fires at every
   AC write site: the `equip`/`unequip` events, character creation (auto-equips the kit's armor/shield/
   weapon via `defaultEquip`), the `migrateWorld` backfill (one-time, for pre-feature saves — also
   reconstructs `acBonus` from `sheet.feats`), and the level-up score ripple (`luRecomputeFromScores`
   now re-derives AC instead of blindly adding the DEX delta — which was wrong for no-DEX heavy / capped
   medium armor). Before this, `sh.ac` was a flat `10+DEX` that ignored armor entirely.

Built all four in one session (Adam's call, 2026-06-30) rather than gating P3/P4 behind a playtest of
P1/P2 — the decisions below removed the design ambiguity that justified waiting. Gated throughout:
`check-manifest` + the new `dev/verify-items.mjs` (42 checks spanning all four phases) + zero
regressions across 11 other full-app verifiers (599 checks total).

## Decisions (resolved with Adam, 2026-06-30)

- **Equipped — named slots, not a pointer.** `sheet.equipped = {mainHand, offHand, armor}`, each an
  instance id or `null`. Dual-wield needs two weapons equipped at once; a single pointer couldn't
  represent that. See "Equip slots" above.
- **Condition vocabulary — fixed, hand-authored enum.** `ITEM_CONDITIONS` ships with P1: `on-fire`,
  `frozen`, `poisoned-coated`, `cursed`, `broken`, `dropped`, `waterlogged`, `rusted`. Small and
  expandable on demand, not exhaustive — mirrors the lean already taken for PC conditions (a fixed list
  keeps it mechanizable; free text wouldn't be).
- **`qty` is splittable.** `item_split{itemId,qty}` mints a new instance carrying part of a stack (its
  own id, same `name`, the remainder qty on each). Symmetric with `item_changed.add{qty}` re-merging
  isn't auto-stacked — two same-name instances can coexist (one dropped, one carried); that's correct,
  not a bug, since they may carry different `conditions`.
- **Weight is wired now, not deferred.** Every inventory render shows total weight (`Σ weight×qty`
  across resolved instances) against carrying capacity (`STR score × 15 lb`, SRD's Small/Medium row —
  Genesis PCs don't span other sizes). This is **informational, not a hard gate** — SRD's own carrying-
  capacity rule is GM-invoked, not an automatic Speed penalty (`core-rules.md`: *"you can usually carry
  your gear... without worrying about the weight"*); enforcing an actual encumbrance penalty is a
  separate, deferred decision, not bundled into this build.
- **Pack contents become individual items, not a bundled display string.** "Explorer's Pack" no longer
  exists as one inventory entry with a `<details>` flavor-dropdown (`render.js`'s old `packOf()`); the
  generator's `PACK_EXPANSIONS` resolves each pack to its real line items (a Backpack, a Bedroll, a
  Tinderbox, 10 Torches → `qty:10` Torch, 10 days Rations → `qty:10` Rations, etc.), and character
  creation mints each as its own instance. They arrived together; they're independently their own
  things from the moment they're in the sheet — each carries its own weight/cost/conditions.

## Relationship to the economy track (`NEXT-STEPS.md` ⭐ ECONOMY) — dependency now satisfied

The buy/sell spine needs prices ("derived from the existing loot rarity axis... + SRD base prices")
and a mutator. Both now exist: `ITEMS_BY_NAME.cost` is the SRD-base-price source (134 items, real GP/
SP/CP values parsed from the SRD tables), and `item_changed`/`item_split` are the mutators — buy/sell
composes `item_changed.add`/`removeIds` with a price lookup, no new event needed. The economy track's
build is unblocked on this front; its remaining open calls (the flat sell ratio, merchant/shop codex
wiring, the buy/sell UI shape) are unrelated to this spec.

## Fast-follows (not built, flagged honestly)

- **No live combat runtime path.** `cmEquippedDamage` is ready, but `resolveAttack` itself still isn't
  called from anywhere in the running app (`COMBAT.md`'s tracker UI is a deferred Fable fast-follow,
  unrelated to this build) — combat stays theater-of-mind; the digest surfacing is today's real fix.
- **`cmEquippedDamage` ignores Versatile two-handed.** A Versatile weapon (Longsword 1d6/1d10) reports
  its one-handed die even with an empty off-hand — there's no "wielding two-handed" signal. Minor; the
  digest under-reports the larger die. *(Same review.)*
- **No interactive equip button.** Render shows what's equipped (read-only); a click-to-equip UI is the
  subject of the **Inventory UI overhaul** spec below.
- **Index completeness — largely resolved (2026-06-30, second pass).** The generator now also parses the
  SRD Tools table (23 tools) and ships a hand-authored supplement (foci by form + the 2014-style pack
  items the 2024 SRD prices only inside bundles), so **173 items** are indexed and pack/kit resolution is
  ~99% (65/66 pack lines, 89/91 kit lines). The only intentional non-resolves are the two pick-placeholders
  ("Musical Instrument (your choice)", "Artisan's Tools or Musical Instrument" — resolved by the player's
  pick before they become instances) and "Map/Scroll Cases" (a container the SRD names differently).
- **No dedicated `wand.png`-style icon work** or other purely cosmetic polish — out of scope here.

---

# Part II — completeness, wiring, and the inventory UI (spec, 2026-06-30)

*Authored after the build, at Adam's request: "index any remaining items, spec any missing fields, make
sure there's a solid plan to wire everything up, spec an inventory UI overhaul." Part I above is BUILT;
everything in Part II is **spec, not built** — the open calls are gathered in "§Latent decisions" at the
very end for Adam to resolve.*

## §A. Item fields — what exists, what's missing

### What `ITEMS_BY_NAME[*]` carries today (built)
`name`, `kind` (`weapon`/`armor`/`shield`/`gear`/`tool`/`focus`), `category`, `weight`, `cost {n,unit}`,
`stackable` (+ `qtyDefault`). Weapons add `damage {n,die,bonus,type}`, `properties[]` (raw SRD strings
like `"Finesse"`, `"Versatile (1d10)"`), `mastery`. Armor adds `ac {base,dexMod,dexCap}` or
`{shieldBonus}`, `strengthReq`, `stealthDisadvantage`.

### Missing fields, by the wiring that needs them
Each is a *proposed* generator-emitted field (the index is the right home — objective, per-type, generated):

| field | on | why it's needed | source |
|---|---|---|---|
| `versatile {n,die}` | weapons | the two-handed damage die (Longsword 1d8→1d10) — `cmEquippedDamage` under-reports without it | parse the `Versatile (1dX)` property string the SRD already gives |
| `props {finesse,light,heavy,thrown,twoHanded,reach,loading,ammunition}` | weapons | structured booleans so combat/equip don't substring-match the raw `properties[]` strings | derive from `properties[]` at generate time |
| `range {normal,long}` | ranged/thrown | range-band checks in the eventual combat runtime | parse `Range 150/600` out of the property string |
| `tool {ability,utilize,craft}` | tools | a tool's check ability + what it can do (the SRD tools table carries all three) | already in the SRD tool blocks — parse them |
| `focusFor[]` | foci | which casters may use it (`arcane`→sorc/warlock/wiz, `druidic`→druid/ranger, `holy`→cleric/paladin) | the SRD focus prose states it |
| `consumable {use,effect}` | potions/scrolls/oil/holy water | what firing the item *does* — the hook for a future "use" action | a small hand-authored table (SRD effect text is prose) |
| `container {capacity}` | backpack/pouch/sack/chest | if weight ever nests or the UI groups by container | SRD weights imply it; capacity is hand-authored |
| `acBonus` | non-armor AC items (Ring of Protection, Cloak) | folds into `cmSheetAC` the same way a feat bonus does — but these are **magic items** (see below) | the codex/loot layer, not this index |
| `slot` | weapons/armor/shields | the equip slot(s) an item is eligible for — currently *inferred* from `kind` in `applyEvent`'s equip guard; making it explicit data removes the inference | derive from `kind` |
| `rarity`, `attunement` | magic items | economy pricing + the attunement cap | **out of scope for `data/items.js`** — magic items stay in `LOOT-REMAP`/the codex (see §Latent decision 5) |

**Principle:** structured-derived fields (`versatile`, `props`, `range`, `slot`, `focusFor`) are pure
generator work off data the SRD already provides — low-risk, do them with the wiring that needs them.
`consumable`/`container` need a *small hand-authored table* (like `ITEM_CONDITIONS`/`EXTRA_ITEMS`), so
they wait on the decision to build the feature that reads them.

## §B. The wiring plan — what's left, in order

Everything in Part I is wired (creation→migration→events→digest→render→AC). What remains, each a
self-contained unit gated by `verify-items.mjs`:

1. **Versatile two-handed (S, do-now).** Emit `versatile {n,die}`; `cmEquippedDamage` uses it when the
   off-hand is empty and the weapon is Versatile. Pure, ~10 lines, closes the one known combat-damage gap.
2. **Structured `props` + `range` + `slot` (S).** Generator-only; replaces the substring-matching in
   `cmEquippedDamage` (`"Finesse"`/`"Light"`) and the kind-inference in the equip guard with clean data.
   Unblocks 3 and 4.
3. **The live combat runtime path (L — the big one).** `resolveAttack` currently takes a DM-supplied
   `o.dmg`; wire it to read the PC's equipped weapon via `cmEquippedDamage` so the *resolver* (not just the
   digest) uses real numbers. This is gated on the combat **tracker UI** (`COMBAT.md`'s deferred Fable
   fast-follow) — it's where attacks are actually rolled. Until then the digest surfacing is the fix.
4. **Economy buy/sell (M).** Compose `item_changed.add`/`removeIds` with a price read off
   `ITEMS_BY_NAME.cost`. Already unblocked (Part I §"economy"); the open calls are the *economy's* (sell
   ratio, shop wiring, UI), not this spec's. Pairs naturally with the inventory UI (§C) — a shop *is* an
   inventory view with prices.
5. **Consumables on use (M).** A `use` action (UI button + an `item_use` event) → the item's
   `consumable.effect` fires (heal, light, +save, …) → `item_changed.removeIds` consumes it. Needs the
   `consumable` field (§A) and the effect-vocabulary decision (§Latent 2).
6. **Condition effects (M).** Today item conditions are display + DM-readable only. Mechanizing them
   (on-fire deals damage on contact, cursed can't be unequipped, broken can't be used) is the
   anti-drift win — but needs the per-condition effect decision (§Latent 3). Until then they're honest
   flavor the DM adjudicates.
7. **Tool proficiency + container/weight nesting (M/L, optional).** Owned/equipped tools granting a
   proficiency bonus on tool checks; container capacity for weight grouping. Both depend on §Latent 4
   (does weight ever become mechanical?).

**Critical path:** 1→2 are cheap and unlock 3 (combat) and 4 (economy), the two highest-value tracks.
5/6/7 are feature-gated on the latent decisions below.

## §C. Inventory UI overhaul (spec)

### Today
`renderCharacterPanel` shows a flat **read-only** list (name ×qty, weight hint, condition badges), a
"Carrying X / Y lb" line, and a read-only "Equipped" line. No interaction — equipping is DM-event-only.

### The overhaul — an interactive inventory panel (its own rail tab, `openPanel('inventory')`)
Charter-safe: §3's no-menu rule is *narrative* (the DM doesn't hand the player option-lists in the
fiction); a character-sheet inventory UI is plumbing, explicitly fine (same call as the economy/shop UI).

**Layout — three zones:**
1. **Equipped loadout (top).** The three slots (Main hand / Off hand / Armor) as drop-targets showing the
   equipped item + its live stat (weapon: the resolved `dmg`; armor: its AC contribution; the resulting
   **AC** and **attack** lines pulled from `cmSheetAC`/`cmEquippedDamage`). Each slot has an unequip (✕).
2. **The pack (middle).** The inventory list, now **interactive** per row: an **Equip** affordance (only
   to kind-valid slots — greys out armor for a hand), **Use** (consumables only), **Split** (stackables),
   **Drop**. Group/sort toggle (by kind / weight / value / name). Condition badges inline (Part I).
   Unindexed flavor items render plainly (no stats, no equip) — they degrade exactly as today.
3. **Encumbrance (footer).** A **weight bar** (Σ vs `STR×15`) that fills and turns amber past capacity;
   total value (Σ `cost`) as a secondary read. Informational unless §Latent 4 makes weight mechanical.

**Item detail.** Click/hover a row → a card: full resolved stats (damage/AC/properties/weight/cost),
conditions, and the equip/use/split/drop actions. Mirrors the spell-card hover already in the Spells panel.

**Every action routes through an EVENT-CONTRACT event** (the same ones Part I built — `equip`/`unequip`/
`item_split`/`item_changed`) so the script stays the sole mutator and the UI is a thin view. New: a small
`item_use` event for consumables (§B.5). No state lives in the UI.

**Phasing.** UI-P1: the equipped loadout zone + equip/unequip buttons (read the most value from Part I's
events immediately). UI-P2: use/split/drop + sort. UI-P3: the detail card + the weight bar visual + value.
Each is a render-only change gated by a DOM check in `verify-dm-events`/a new `verify-inventory-ui` harness.

## §Decisions (resolved with Adam, 2026-07-01)

1. **Two-handed grip — EXPLICIT, not inferred (Adam's call: "inference isn't enough").** A Versatile weapon
   carries an explicit grip: `sheet.equipped.grip ∈ {"1h","2h"}` (default `"2h"` when the off-hand is empty,
   `"1h"` when it holds a shield/weapon — but the player can override via a **wield toggle** the inventory UI
   shows on a Versatile main-hand). `cmEquippedDamage` uses `def.versatile {n,die}` when `grip==="2h"`. Set
   by a `grip` param on the `equip` event (or a small `set_grip` event). *Needs the `versatile` field (§A).*
   **BUILT 2026-07-01:** `versatile{n,die}` in the weapon index; `set_grip` event + wield toggle; the die
   swaps in `cmEquippedDamage`; an occupied off-hand forces 1h.
2. **Consumables — mechanize ALL potions we're aware of (Adam's call).** Every SRD potion/oil (24 in
   `Reference/SRD-Data/magic-items.json`) gets a `consumable {effect}` and a `use` action (`item_use` event
   → effect fires → `item_changed.removeIds` consumes it). Effect fidelity by type: **numeric effects fire
   in-engine** (the four Potions of Healing tiers `2d4+2`/`4d4+4`/`8d4+8`/`10d4+20`, Potion of Resistance,
   Potion/Elixir of Health, Potion of Giant Strength's STR-set); **duration buffs** (Flying, Invisibility,
   Gaseous Form, Speed, Heroism, …) mechanize the *consumption* + emit a structured `buff {name,duration}`
   the DM honors in narration (they touch too many systems to fully auto-resolve pre-combat-engine). This is
   the same "script owns the number, DM owns the interpretation" split as everything else.
3. **Item conditions — MECHANICAL, with an elemental-effects map (Adam's call: "on fire should do fire
   damage etc").** See **§D** below. Grounded in the SRD where it exists (2024 **Burning** glossary state;
   **Basic Poison**) and Genesis-authored — flagged — where the SRD is silent (5.5e has *no* general
   elemental-status system; "Damage types have no rules of their own," per the glossary).
4. **Encumbrance — ON (Adam's call: "No barrelmancers allowed").** Wire the already-computed weight total to
   the **canonical SRD Carrying Capacity** rule (no variant needed): carrying over **STR×15 lb** drops Speed
   to **5 ft**; you **cannot lift/drag/push over STR×30 lb** at all (the hard cap — the anvil/barrel simply
   won't budge). `item_changed.add`/loot refuses a pickup that would exceed STR×30 (surfaced, not silent);
   over STR×15 stamps a `speed` penalty the movement/combat layer reads. The "Carrying X / Y lb" bar turns
   amber at ×15 and red at ×30.
   **BUILT 2026-07-01:** `carryState(sh)` (soft/hard tiers + `speedCap:5`); `item_changed` refuses an
   over-hard-cap pickup (`force:true` overrides); the Carrying bar shows amber (encumbered) / red (over-hard).
5. **Magic items — RECOMMEND CONGRUENCE (Adam's hunch: "keep all items congruent"; I agree — argued in §E).**
   Supersedes the earlier "hold the split" lean. One instance shape, one lookup; magic items are indexed too
   (a magic index generated from `Reference/SRD-Data/magic-items.json`, SRD-clean — 258 items). Narrative
   significance is a **codex link** any instance may carry, not a separate storage path. Full argument + the
   three-layer model in **§E**. *(Recorded as the recommendation; ship the mundane tracks first — this lands
   when the first magic wearable needs to affect AC/attack.)*
6. ~~Inventory UI v1 scope~~ — **withdrawn** (Adam: "I don't understand this question"). It wasn't a design
   fork, just a sequencing worry; there's no decision here. The UI ships in phases (§C), equipped-loadout
   panel first. Nothing to decide.

## §D. The item-condition effects map (resolves Decision 3)

5.5e (2024) has **no unified elemental-status system** — the glossary is explicit: "Damage types have no
rules of their own." So this map is **grounded where the SRD has a real rule, and Genesis-authored (flagged)
where it doesn't**, each row picked to *feel* like its damage type. An item's condition is read at the
moment it's relevant (a hit, the start of a turn, an equip attempt) — the DM narrates, the script owns the
number.

| `ITEM_CONDITIONS` | mechanical effect | source |
|---|---|---|
| `on-fire` | **Burning**: the item (and, if worn/held, the bearer) takes **1d4 fire at the start of each turn**; ends when doused/submerged or the bearer drops Prone and rolls. Sustained burning degrades the item → may become `broken`. | **Canonical** — 2024 *Burning* glossary state |
| `poisoned-coated` | the next Piercing/Slashing hit deals **+1d4 poison**; consumed after that hit or 1 minute. | **Canonical** — *Basic Poison* (equipment) |
| `broken` | can't be equipped or used; a weapon adds no damage, armor grants no AC. Repair = a smith / mending. | Canonical-ish — SRD damaged-object rules |
| `cursed` | can't be unequipped without *Remove Curse* (or the DM's out); may compel use. | **Canonical** — SRD cursed-item behavior |
| `rusted` | **WIRED** (docs/DURABILITY-TRIO.md §2, 2026-07-02): a metal weapon's damage die steps down one size (`rustSteppedDie`); metal armor/shield is −1 AC (`cmRustAcPenalty`). Gentle — never worse than `rusted` (a `rusting` TELL precedes it on first exposure; a second un-maintained exposure upgrades). A whetstone & oil kit or a smith clears it; any rest also auto-maintains everything carried (`rustMaintainAll`). | Genesis-authored (now specced — see DURABILITY-TRIO.md; supersedes this row's original "−1 to hit" sketch, which the spec resolved as a damage-die step instead) |
| `dropped` | not in hand → not equipped (no attack/AC benefit until re-equipped). | trivial state |

**Cut 2026-07-01:** `frozen` and `waterlogged` were removed from the vocab — invented conditions with no
SRD basis that Adam didn't want. `rusted` is now wired (see above, 2026-07-02); its precursor tell
`rusting` is a runtime-local addition (src/world/durability.js) not present in the generated
`ITEM_CONDITIONS` array — written directly to `inst.conditions`, bypassing the `condition_add` event's
`ITEM_CONDITIONS` gate.

**Vocabulary tie-in:** the *active* conditions map to real SRD rules — `on-fire`→**Burning** (fire),
`poisoned-coated`→**Basic Poison**, `cursed`/`broken`→SRD item rules. Effects that reduce to a die/number
(fire 1d4, poison +1d4) are engine-owned; the *when it triggers* stays the DM's read (Charter §8.5).
`condition_add` already exists (Part I); these effects are consumed by combat/equip at read time, no new
event needed except `item_use` (§2) and a movement hook for `on-fire`.

## §E. The congruent item model (Decision 5 — recommendation)

**The logic of the *old* split** (mundane→`data/items.js`, magic→codex/`LOOT-REMAP`) was: (a) magic items
are per-copy/narrative (this Flametongue has a history), which is the codex's job; (b) they already live in
the `LOOT-REMAP` rarity tables; (c) an IP wariness about baking WotC magic items into a shipped data file.

**Why congruence is better (and (a)–(c) don't actually require a split):** the type/instance split *already*
generalizes — a magic item is not a different *kind of thing*, it's the same instance with more layers.
Three **orthogonal** layers ride on one instance:

1. **Base type** — the SRD definition (a Longsword: 1d8 slashing, versatile, weight, cost). Lives in the
   index. A "+1 Longsword" still resolves its base off `itemDef("Longsword")`.
2. **Enchantment overlay** — per-instance magic: `{bonus:+1, damageRider:{n:2,die:6,type:"fire"}, acBonus,
   charges, attunement, rarity}`. Generated for SRD magic items from `magic-items.json` (SRD-clean text,
   258 items — same provenance discipline as the mundane index); a bespoke/DM-invented enchantment is
   captured to the instance the same way (Charter §8.5). `cmEquippedDamage`/`cmSheetAC` just add the rider.
3. **Narrative** — a **codex `Item` link** (`instance.codexId`) that *any* instance may carry, mundane or
   magic (an heirloom dagger deserves a codex record too). The codex is a *link*, **not a storage path** —
   which is the key correction: it was never the right home for a magic item's *mechanics*, only its story.

**Payoff:** combat, economy, the inventory UI, and AC all resolve **one** item shape through **one** lookup,
regardless of mundane/magic/narrative. `LOOT-REMAP` becomes the *drop-table* layer (what appears, at what
rarity) that mints instances into this one model — not a parallel item system. IP: SRD magic items are
generatable from `magic-items.json` exactly like the mundane index; non-SRD ones are DM-authored per-instance
(never shipped), same as any invented content.

**Cost / when:** it's a real build (a magic-item generator + the enchantment overlay in
`cmEquippedDamage`/`cmSheetAC` + the codex-link field). Ship the mundane tracks (Versatile, encumbrance,
potions, the UI) first; land congruence when the **first magic wearable/weapon needs to affect AC or
attack** — at which point this model is ready and cheaper than bolting on a second system.

> **CONFIRMED + BUILT 2026-07-01.** Adam locked congruence (charges stored; the item library grows into a
> real catalog by design). Built ahead of the "first magic wearable" trigger: `MAGIC_ITEMS_BY_NAME` +
> the `inst.base`/`inst.ench`/`inst.codexId` overlay + engine wiring + charges. The one flagged deferral
> is **charges/attunement enforcement** (the attunement cap isn't policed yet — the field is stored and
> surfaced; a "max 3 attuned" gate is a future mini-track). See the status header for the full build list.
