---
id: dungeon-loot-composition
type: table
domain: Session Mechanics / Dungeons
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
---

# Dungeon Loot — Composition (Presentation Wrapper)
> **Remapped 2026-06-18.** Composition no longer picks *rarity* — the **Budget** (by tier + dungeon size) decides which rooms get items and at what rarity. Composition only rolls **how an awarded item is presented/bundled** (rarity-agnostic). Old rarity-picking version archived as `ARCHIVE Dungeon Loot Composition v1 (pre-remap 2026-06-18)`.

For each item the Budget allocates to a room, roll d100:

| d100 | Presentation | Recipe |
|------|--------------|--------|
| 1–35 | **Lone Item** | Just the item. |
| 36–55 | **Item + Coin** | Item + 1 roll on [[Dungeon Loot - Coin Cache]]. |
| 56–70 | **Item + Consumable** | Item + 1 [[Dungeon Loot - Minor Resource]]. |
| 71–80 | **Overlooked** | Item buried in 1 [[Dungeon Loot - Junk]] (easy to miss — Investigation to spot). |
| 81–90 | **Small Hoard** | Item + 1 Coin + 1 Minor Resource. |
| 91–97 | **Guarded / Trapped** | Item behind a guardian or trap (roll the dungeon's encounter/trap step). |
| 98–100 | **Hidden / Locked** | Item requires a check to find or open (DC by depth). |

> Rooms the Budget did **not** allocate an item to receive coin only (see [[Dungeon Loot - Coin Cache]]).
> **Outlandish intrusion** (off-axis otherworldly, [[Dungeon Loot - Outlandish]]) is a rare *event*, not a normal presentation — fire it sparingly per world tone; power-banding + level-gating pending (NEXT-STEPS L4).
^dungeon-loot-composition
