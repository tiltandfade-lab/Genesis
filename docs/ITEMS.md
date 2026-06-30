---
type: system-spec
branch: Genesis
status: spec
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

**Status: spec (drafted 2026-06-30), not built.** Surfaced live during the fast-lane playtest: fixing
the inventory-confiscation bug (`item_changed`, `EVENT-CONTRACT.md`) exposed that `sheet.inventory` is
a flat array of **plain strings** — `"Scimitar"`, `"Studded Leather Armor"` — with no mechanical content
behind the name. Three concrete asks fell out of that observation (Adam, same session): can items be
disambiguated for add/remove like the bestiary disambiguates monsters; can the engine know a weapon's
actual damage/type instead of the DM recalling it; can an item carry a status (on fire, poisoned,
cursed, dropped). All three point at the same fix.

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
- `conditions`: a string array, same shape as `cur.conditions` — `"on-fire"`, `"poisoned"`, `"cursed"`,
  `"dropped"`, `"broken"`. No fixed vocabulary yet (see Open questions); the DM declares them via event,
  same way it declares PC conditions today.
- Display name override is **deferred** (a named heirloom is a codex-Item concern — link the instance
  `id` to a codex record rather than growing every inventory entry's shape for the rare case).

## EVENT-CONTRACT changes

`item_changed` (built 2026-06-30) currently matches `remove`/`add` by name. This is a **breaking
change to that event's payload** — acceptable because it shipped same-session, nothing depends on the
old shape yet:

| event | payload | change from current |
|---|---|---|
| `item_changed` | `{removeAll?, removeIds?:[id], add?:[{name,qty?}], gold?:delta, note?}` | `remove` → `removeIds` (id-targeted, unambiguous); `add` now takes objects so a qty can be set on mint |
| `condition_add` *(new)* | `{itemId, condition}` | mirrors the PC condition pattern, scoped to one inventory instance |
| `condition_remove` *(new)* | `{itemId, condition}` | — |

`removeAll` still works unchanged (a searched/bound prisoner doesn't need per-id precision — it's
already total). The DM only needs an id when removing/tagging *one specific* item among several —
which `dmDigest`'s PC block should start including (`pc.inventory` mirrors `pc.resources` today) so the
DM can reference ids without inventing them.

## Build phases (don't do this in one pass)

1. **P1 — the type index alone.** `build/gen-items.py` + `data/items.js`, registered in the manifest,
   zero runtime wiring. Buildable today, zero risk — proves the data, nothing depends on it yet.
2. **P2 — instance migration.** `sheet.inventory` becomes the `{id,name,conditions}` array; a
   `migrateWorld` step upgrades old string-array saves (the same additive-migration pattern
   `state.js` already uses for clock/map/currentNodeId backfills — never destructive). `item_changed`
   gains `removeIds`; render.js's inventory panel reads `.name` instead of the bare string.
3. **P3 — combat wiring.** `resolveAttack`'s `o.dmg` resolves from `ITEMS_BY_NAME` for the PC's
   equipped weapon instead of being DM-supplied — the actual fix for ask #2. (Equipped-weapon tracking
   doesn't exist yet either; this phase needs to decide whether "equipped" is its own instance flag or
   inferred from a single `sheet.weapon`/`sheet.armor` pointer — flagged as an open question below.)
4. **P4 — conditions.** `condition_add`/`condition_remove` wired through `applyEvent`; rendering shows
   a condition badge on the inventory row (same visual language as PC condition badges).

Each phase is independently shippable and gated (`check-manifest` + a `verify-items.mjs` harness in the
same style as `verify-triage.mjs`). **Do not build P3/P4 before P1/P2 land and are played** — per the
project's standing discipline, spec the mechanics, but let one playtest validate the instance model
before wiring combat and conditions on top of it.

## Open questions

- **"Equipped" — a flag or a pointer?** Combat needs to know *which* weapon/armor instance is active.
  An `equipped:true` flag on the instance, or a separate `sheet.equippedWeaponId`/`sheet.equippedArmorId`
  pointer? The pointer is simpler (no "two things equipped" ambiguity) but doesn't generalize to two-
  weapon fighting. Leaning pointer for v1 (single-weapon assumption already implicit in the current
  sheet), array later if dual-wield needs it.
- **Condition vocabulary — fixed enum or DM-free-text?** PC conditions use SRD's fixed list
  (`Reference/SRD-Data/conditions.json` — Blinded, Poisoned, Prone, ...). Items want a different,
  smaller vocabulary (on-fire, coated-in-poison, cursed, broken, soaked) that SRD doesn't define as a
  formal list. Fixed enum keeps it mechanizable (the engine can react — "on-fire" items might deal
  damage on contact); free-text keeps it flexible but un-mechanizable beyond display. Lean fixed enum,
  small and hand-authored, expand on demand.
- **Does `qty` ever need to split?** "I drop 5 of my 20 arrows" — does that mint a second instance with
  its own id, or does `qty` just decrement on the one instance and a *different* event mints a new
  ground-item codex record? Probably the latter (the dropped arrows become world-state, not still-PC-
  inventory) — but the event shape for "split a stack" isn't designed yet.
- **Weight/encumbrance — wired now or deferred?** The index carries `weight`, but nothing currently
  sums it or gates anything on it. Pure data until the economy track (or a future encumbrance system)
  reads it — fine to ship inert, flagged so it doesn't silently rot unused.
- **Pack contents (`PACK_CONTENTS`) — fold into the index or stay separate?** A pack ("Explorer's
  Pack") expands into many sub-items on the inventory render already (`packOf()` in `render.js`). Does
  P1's generator also emit pack→contents, replacing the current hand-literal `PACK_CONTENTS`, or is
  that a distinct migration left for later? Lean fold-in (P1 is already touching `equipment.md`/
  `PACK_CONTENTS` consolidation) — confirm with Adam before scoping P1's size.

## Relationship to the economy track (`NEXT-STEPS.md` ⭐ ECONOMY)

The buy/sell spine already needs prices ("derived from the existing loot rarity axis... + SRD base
prices") and a mutator (already has one: `item_changed`). P1's `cost` field is exactly the SRD-base-
price source that track was missing — buy/sell composes `item_changed.add`/`removeIds` with a price
lookup against `ITEMS_BY_NAME.cost`, no new mutator needed. **P1 should land before or alongside the
economy track's build**, not after — it's a shared dependency, not a parallel one.
