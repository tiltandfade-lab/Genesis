---
type: loot-overhaul-spec
branch: Genesis
created: 2026-06-18
status: L1/L2/L3/L5/L6 done 2026-06-18; L4 (outlandish banding) + L3b (variant items) + L7 (registry regen) pending
related:
  - "[[NEXT-STEPS]]"
  - "[[DESIGN]]"
---

# Loot System Remap — L1/L2 Spec

Locked with Adam 2026-06-18. The loot overhaul (NEXT-STEPS L1–L6). This doc is the source-of-truth for the remap; tables are edited to match it.

## Why
- 258 SRD magic items (`Reference/SRD-Data/magic-items.json`) weren't in any loot table.
- The system had **three non-agreeing entry points** (Dungeon Loot Tier / Composition / Budget) on **two rarity axes** — flavor-tiers vs D&D rarity.
- **Key bug:** the per-item `Uncommon` (d50) and `Very Rare` (d20) tables existed but were **orphaned** — neither Tier nor Composition ever routed to them (only the Budget path used them).
- The "Legendary" table was mislabeled — actually whimsical *minor wondrous* items (Ever-Smoking Pipe, Coin of Fair Odds) with an internal Tier 1–3 column. No true Legendary or Artifact table existed.
- Outlandish (d300) is flat/unbanded — the "only scales to ~L8" pain (L4, deferred).

## Decisions
1. **Per-item tables already use correct D&D rarity** (Common d30 / Uncommon d50 / Rare d40 / Very Rare d20) — keep as-is, just wire the orphaned ones into the entry layer.
2. **Rename** whimsical "Dungeon Loot - Legendary" → **"Dungeon Loot - Minor Wondrous"**; build a **true Legendary** table from the 32 SRD Legendary items + an **Artifact** table (Dragon Orb + story slot). *(Adam approved.)*
3. **Budget drives** how-many + what-rarity per tier; **Composition becomes the flavor/presentation wrapper** (rarity-agnostic bundling); **retire the standalone Tier table**. *(Adam approved — "we'll see how it plays"; provisional, originals archived.)*
4. **Defer to published guidance** where it exists (Adam's call). Tier numbers from DMG 2024.

## Rarity axis (final)
| Table | D&D rarity | Notes |
|---|---|---|
| Junk | (non-item) | flavor junk |
| Minor Resource | Common consumables / coin | rename "Consumables & Coin" (later) |
| Common (d30) | Common | as-is |
| Uncommon (d50) | Uncommon | as-is — **wire into entry** |
| Rare (d40) | Rare | as-is |
| Very Rare (d20) | Very Rare | as-is — **wire into entry** |
| Minor Wondrous (d100) | (off-axis whimsy) | renamed from "Legendary"; whimsical low-stakes items, internal Tier 1–3 |
| **Legendary (new)** | Legendary | 32 SRD items; pointers into magic-items.json |
| **Artifact (new)** | Artifact | Dragon Orb + story slot |
| Outlandish (d300) | off-axis | power-band + level-gate later (L4) |

## Tiers of play (DMG 2024 — per-party cumulative targets)
| Tier | Levels | Common | Uncommon | Rare | Very Rare | Legendary |
|---|---|---|---|---|---|---|
| T1 | 1–4 | 6 | 4 | 1 | – | – |
| T2 | 5–10 | 10 | 17 | 6 | 1 | – |
| T3 | 11–16 | 5 | 7 | 4 | 2 | 2 |
| T4 | 17–20 | 5 | 7 | 6 | 5 | 3 |

**Rarity-by-tier gate:** Common/Uncommon any tier · Rare T2+ · Very Rare T3+ · Legendary T3+ · Artifact T4/story.
*(T1/T2 match Adam's existing budgets; T3/T4 are the extension. Numbers are DMG-tracker, not in the SRD — sanity-check against the DMG copy.)*

## New treasure flow (Treasure Generator)
1. **Budget** (by tier + dungeon size) allocates item count + rarity to rooms; boss → rarest; deepest rooms → next; remaining rooms → coin only.
2. For each allocated item, roll **Composition** for *presentation* (lone / +coin / +consumable / hoard / guarded / hidden).
3. Roll on the **rarity's item table** for the item itself.

Standalone Tier table retired (its job — pick rarity by d100 — is now the Budget's).
