---
type: system-spec
branch: Genesis
status: built
created: 2026-06-30
updated: 2026-06-30
related:
  - "[[EVENT-CONTRACT]]"
  - "[[COMBAT]]"
  - "[[LOOT-REMAP]]"
  - "[[CODEX]]"
  - "[[DESIGN]]"
---

# Items — type/instance split (the bestiary pattern, applied to gear)

**Status: BUILT (2026-06-30), all four phases, same session as the spec.** Gates: `check-manifest` OK
(56 modules) · **`verify-items.mjs` 42/42** (new) · zero regressions across `verify-dm-events` (36),
`verify-triage` (27), `verify-combat` (51), `verify-bridge` (29), `verify-levelup` (90),
`verify-advancement` (35), `verify-wake-prep` (47), `verify-social` (97), `verify-prep` (43),
`verify-codex` (57), `verify-rebirth-flow` (19) — 599 checks total, 0 failed. Surfaced live during the
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
- **No interactive equip button.** Render shows what's equipped (read-only); a click-to-equip UI was
  not one of the five resolved asks and is a clean, separately-scoped follow-up.
- **No dedicated `wand.png`-style icon work** or other purely cosmetic polish — out of scope here.
