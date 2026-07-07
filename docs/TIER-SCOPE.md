---
type: system-spec
project: Genesis
status: locked
created: 2026-06-26
related:
  - "[[ADVANCEMENT]]"
  - "[[DIFFICULTY]]"
  - "[[LOOT-REMAP]]"
  - "[[DESIGN]]"
---

# Genesis — Tier Scope (this version caps at Tier 2)

## The decision

**This version ships Tiers 1–2 only — a level-10 ceiling.** Tiers 3–4 (levels 11–20) are deferred to a
future expansion/DLC. The goal is a genuinely **solid, complete T1–T2 experience** rather than a thin
spread across all four tiers. (D&D 5e tiers: **T1 = levels 1–4, T2 = 5–10**, T3 = 11–16, T4 = 17–20.)

Rationale (Adam, 2026-06-26): the content is already balanced for T1–T2; T3/T4 has essentially nothing,
and building it well (threat tables, loot banding, boss rosters, encounter content) is several major
authoring passes. Cap now, prove the product, expand later.

**Reaching level 10 = plateau & continue** — the forever-default. XP stops accruing levels at 10; the PC
keeps playing at full T2 power. Ongoing play comes from the persistent world + the death→rebirth loop (a
new soul on a world that has drifted) — not a *mandatory* retirement ceremony. *(Amended 2026-07-07,
Adam's Q1 ruling on `CROWNING-BASTION.md`: the Crowning now exists as an earned, opt-in, dangerous exit
that retires a finished world as a legend object. Nobody is ever forced to crown; the un-crowned
level-10 sandbox life stays fully supported.)*

## How the cap is enforced (defense in depth)

1. **`levelForXp` clamps to `LEVEL_CEILING=10`** (`src/engine/advancement.js`) — the PRIMARY enforcement.
   The single un-cap point: raise `LEVEL_CEILING` (with the T3/T4 content) and the rest follows.
2. **`level_applied`** (`src/world/dm.js`) does `Math.min(LEVEL_CEILING, …)` — a buggy/over-emitting DM
   can't push a PC past 10.
3. **`TIER_CAP=2`** (`src/engine/prep-bundle.js`) clamps the bundle tier regardless of level; the bundle
   `meta` carries `tierCap:2`, `levelCeiling:10`, `crCeiling:10` for the DM to honor.
4. **Generator clamps** — `rollDungeonWalk` / `rollUrbanWalk` / `rollWildernessWalk` clamp `opts.tier ≤ 2`
   (a T3+ input yields T2 content, never T1, never a T3 reach).

The XP threshold table itself (`XP_THRESHOLDS`) carries the **full SRD L1–20** rows, so the expansion is a
one-constant un-cap; only `levelForXp` gates them.

## What's deferred (authored-but-inert — do not wire)

These exist, are correct, and are reachable only when the expansion lifts the cap:
- **Loot:** `Dungeon Loot Budget T3` / `T4`, `Dungeon Loot - Legendary`, `Dungeon Loot - Artifact`. The
  in-game loot path (`dwalkLootSlot`) maps only Common/Uncommon/Rare/Very Rare — a verify guard asserts the
  deferred bands never surface. The **Outlandish d300** power-banding (NEXT-STEPS L4) also defers here
  (it has no in-game roller today, so it is latent, not a live risk).
- **Monsters:** the CR 11+ stat blocks (T3/T4) exist but no `*-threat-identity-t3/-t4` tables route to
  them; the generators can't reach them.
- **`CLASS_PROGRESSION` levels 11–20** stay dormant (nothing reads past the capped level).
- **Encounter Template** T3/T4 sections.

## Open within T1–T2 (to make it solid)

- **Wilderness threat tables** — `wilderness-threat-identity-t1/-t2` (queued for a sample-review authoring
  pass, per the table-pass discipline). The wiring + fiction-only danger-signaling is built (Phase D); the
  richer threat content lands with the tables.
- **CR 9–10 capstone density** — ~14 stat blocks (verify-monster-density flags it). Authoring a few more
  is a content-backlog item, not a blocker.
- **Level-up choice passage** — ☑ BUILT + COMPLETE 2026-06-26 (`src/creator/levelup.js`). The in-app picker
  fires on the rest-gated level-up (`passTime` → `openLevelUp`) after the mechanical recompute, computing
  per-level deltas from `CLASS_PROGRESSION`. It now covers the **whole** level-up: new cantrips/spells, the
  **subclass** reveal+record (`data/subclass-progression.js`, one per class in the SRD), an **ASI-or-feat**
  slot (original IP-clean general feats in `data/feats.js`), and an optional **spell swap**. **A level-up
  can't be accidentally skipped** — a persistent `sheet.choicesLevel` marker + a re-open banner + auto-open
  keep surfacing the picker until finalized (survives reloads). `dev/verify-levelup.mjs` 87/87; live-verified
  in-browser. (Open: the feat set is a draft for Adam to balance-tune.)
- **5 rarity-spanning variant items** (LOOT-REMAP L3b) — Belt/Figurine/Feather Token/Potion of Giant
  Strength/Potions of Healing. Minor; deferred.
