---
version: 1.1 (loot remap 2026-06-18)
---

# Treasure System

> **v1.1 — remapped to D&D rarity + 4 tiers.** Budget drives how-many + what-rarity; Composition is now a presentation wrapper; the standalone Tier table is retired. Rationale: `LOOT-REMAP.md`.
>
> 1 chest per segment unless an event calls for more.
> Only 1 chest per segment may roll Legendary or higher. If another chest hits that range, downgrade one tier.
> Boss room always receives the dungeon's top-rarity slot.

## Step 1 — Budget the dungeon (how many items, what rarity)
Pick the budget table for the party's **tier of play**, read the row for the **dungeon size**, and allocate items to rooms by depth (boss → rarest; deepest non-boss → next; remaining item-rooms → down the ladder; all other rooms → coin only).

- Tier 1 (Lv 1–4): [[Dungeon Loot Budget T1]]
- Tier 2 (Lv 5–10): [[Dungeon Loot Budget T2]]
- Tier 3 (Lv 11–16): [[Dungeon Loot Budget T3]]
- Tier 4 (Lv 17–20): [[Dungeon Loot Budget T4]]

**Rarity-by-tier gate:** Common/Uncommon any tier · Rare T2+ · Very Rare T3+ · Legendary T3+ · Artifact T4 / story only.

## Step 2 — Presentation (for each allocated item)
Roll [[Dungeon Loot Composition]] to decide how the item is bundled (lone / +coin / +consumable / overlooked / small hoard / guarded / hidden).
`dice: [[Dungeon Loot Composition#^dungeon-loot-composition]]`

Rooms with **no** allocated item:
[[Dungeon Loot - Coin Cache]]

## Step 3 — Roll the item on its rarity table
| Rarity | Table |
|---|---|
| Common | [[Dungeon Loot - Common]] |
| Uncommon | [[Dungeon Loot - Uncommon]] |
| Rare | [[Dungeon Loot - Rare]] |
| Very Rare | [[Dungeon Loot - Very Rare]] |
| Legendary | [[Dungeon Loot - Legendary]] (true D&D Legendary, 32 SRD items) |
| Artifact | [[Dungeon Loot - Artifact]] (story placement, not random) |

Flavor / off-axis sub-tables (use as garnish or rare events, not budgeted rarity):
- [[Dungeon Loot - Minor Wondrous]] — curated whimsical wondrous items (internal power Tier 1–8)
- [[Dungeon Loot - Junk]] — non-magical junk (may become treasure via attachment)
- [[Dungeon Loot - Outlandish]] — otherworldly intrusion (rare event; power-band + level-gate pending, NEXT-STEPS L4)

> Boss-room override: +10 to any roll where a brush with the otherworldly fits the scene (capped).
