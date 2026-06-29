---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-21
---

# Advancement — XP Economy & Leveling

How a character earns advancement and gains levels. Consumes the events defined in
`EVENT-CONTRACT.md`; the difficulty/world side of the same coin is `DIFFICULTY.md`.

## Decisions (locked 2026-06-21)

- **One ledger-spine economy, not two pools.** XP is earned by *resolved tension* — changes
  to the World State Ledger. Combat is a **modifier on tension-resolution**, not a parallel
  economy. (BG3-style "combat feeds the total over time" — but rationed, see below.)
- **Leveling = XP thresholds** (accumulate to the next threshold), not pure milestone. Keeps
  the number visible and gives the DM a hard container: it can't level the PC early or late.
- **Leveling is claimed by the player, not gated on a rest** (Adam, 2026-06-28: "you don't
  have to rest in BG3 to level up"). When earned XP crosses a threshold, the character menu
  surfaces a **Level Up** button (`claimLevelUp`, src/creator/levelup.js) that runs the
  mechanical recompute immediately and opens the interpretive picker. A rest still applies a
  pending level as a *convenience* trigger (the rest-gate in `advanceTime`), but it is no
  longer required. Never auto-levels mid-combat — the player chooses when to claim.
- **Creativity is NOT on the XP axis** (see "Rewarding play" — it corrupts the container).

## What generates XP

XP is priced from events, not narrated. Award values below are **draft** and will be tuned;
the *structure* is the point.

| event | XP basis | notes |
|---|---|---|
| `front_closed` | the front's stake (size × tier) | the meat of the economy |
| `clock_fired` (for the player) | per-clock award | a faction goal resolved in the PC's favor |
| `choice_logged(major)` | flat major-choice award | only fires when it forecloses something |
| `discovery` / `fact_canonized` | small (10), **capped per in-world day** (`DISCOVERY_XP_PER_DAY` = 30) | rewards exploration + lazy-history engagement; the cap stops the DM from leveling the PC by narrating many facts |
| `encounter_resolved`, combat | CR-based bonus **only if `objectiveRef` is set** | a fight that advances a tension |
| `encounter_resolved`, combat, no objective | ~0 | raw kills tied to nothing barely pay |

**Why discovery is small + day-capped (tuned 2026-06-28):** `fact_canonized` fires per narrated
fact, so it's the one award the DM can inflate just by being descriptive. A playtest social binge
canonized 19 facts → 950 XP → level 3 off two interactions. Fix: drop the per-fact value to 10 and
have the *script* cap discovery XP at 30/in-world-day (then $0), so investigation stays rewarding
but can never substitute for resolving tension. Dice rolls pay no XP at all — they feed narration,
not the economy. The level-drivers are `front_closed` / `clock_fired` (uncapped).

**Why combat is gated to objectives:** it kills the grind incentive without *forbidding* the
playstyle. A murder-hobo can still fight forever — they just don't level from it efficiently,
and `DIFFICULTY.md` answers the behavior with escalation. Combined with a **fixed world (finite
grindable targets)**, grinding self-limits: you run the region dry, then the consequence arrives.

## Leveling

- **Thresholds:** ☑ BUILT 2026-06-26 — SRD 5.2.1 thresholds (decided exactly, no compression). They
  live as the in-code constant `XP_THRESHOLDS` in `src/engine/advancement.js` (full L1–20; the Tier-2
  ceiling is enforced by `levelForXp` clamping to `LEVEL_CEILING=10`). **Decision (revises the earlier
  "compile-ready markdown → JSON" note):** XP thresholds are a *non-rolled* class-independent lookup of
  SRD-canon numbers, so they follow the **canonical-constant-in-code** pattern (the same way
  `build/gen-class-progression.py` embeds canonical spell-slot matrices and `data/srd-creator.js` holds
  `CLASS_CASTING`), **not** the rolled-table compile pipeline (which is for dice tables). The expansion
  un-caps by raising `LEVEL_CEILING` alone. See `docs/TIER-SCOPE.md`.
- **Proficiency bonus, spell slots, features by level:** parse the SRD `classes.md` Features
  tables into structured `CLASS_PROGRESSION` data (the level-1 treatment in `data/srd-creator.js`,
  extended to 20). Until then, only L1 is wired (see "Open").
- **The level-up beat:** ☑ BUILT 2026-06-26 (`src/creator/levelup.js`). When accumulated XP crosses a
  threshold, the script flags it; on the next rest (`passTime`) the mechanical recompute lands
  (`level_applied` → `applyLevelUp`), then `openLevelUp` raises the **level-up picker** for the
  interpretive choices the engine can't decide. It computes the per-level deltas from `CLASS_PROGRESSION`
  (the creator bardo's `CLASS_CASTING` is L1-only, so this is a real per-level build, not a straight bardo
  reuse — though it borrows the bardo's spell-card visuals + `creatorSpells`/`showSpellTip`). The picker
  now covers the **complete** level-up (2026-06-26, "complete the feature" pass):
  - **New cantrips / spells known** (per-level deltas; Wizard spellbook vs prepared; spellMaxLevel gate).
  - **Subclass** — the SRD ships one per class (`data/subclass-progression.js`, generated from the SRD
    markdown), so it's a **reveal-and-record** step ("✦ Your path: College of Lore") that surfaces the
    subclass + its features at L3 / L6 / L10 and writes `sh.subclass` + `sh.subclassFeatures`.
  - **Advancement slot = ASI _or_ a feat** (2024 model) at L4/L8 — either +2/+1+1 (20-cap) or an
    original IP-clean **general feat** (`data/feats.js`, since the SRD ships almost none). Half-feats add
    +1 to a chosen ability; `applyFeat` applies the mechanical grant (ability / HP / AC / speed / save /
    skill) + records it; situational text is DM-adjudicated.
  - **Spell swap** — optionally replace one known spell (2024).
  `applyLevelChoices` is the single mutator: deduped spells, the swap, the ASI/feat, the subclass record,
  and it ripples HP(CON)/AC(DEX)/PP(WIS) + any casting-stat-derived pool max. A "Decide with my DM" button
  always defers cleanly, and pure-feature spans with no choices auto-finalize without a modal.
- **A level-up cannot be accidentally skipped (persistent).** The picks are gated behind a persistent
  marker on the sheet — **`sheet.choicesLevel`**, the level up to which interpretive picks have actually
  been finalized. It lags `sheet.level` (which the rest-gate grows immediately) whenever a level-up's
  spells/ASI are still owed; the gap is the unfinalized obligation, and it is **saved with the world**. A
  glowing **re-open banner** shows in the world view while picks are owed, and `renderWorld` **auto-opens**
  the picker — so an accidental close or a reload always re-surfaces it. Only **Confirm** or the deliberate
  **Decide with my DM** advances `choicesLevel` (finalizing); a pure-feature span auto-finalizes (nothing
  to choose). `ensureResources` seeds `choicesLevel = level` on legacy/new sheets (no retroactive demand).
- Player-paced advancement is correct for a sandbox, but it means the *world* doesn't scale to
  keep the PC challenged — that requirement is owned by `DIFFICULTY.md` (fixed bands + threat
  signaling), not here.

## Rewarding play (the second axis — deliberately off XP)

The moment the DM has to judge "was that creative enough?" and award XP, the container is gone.
So advancement (world-impact) and play-quality (how you played) stay on separate axes:

- **Inspiration** (SRD 5.2.1, already in the rules) — a bounded, binary "advantage later" token
  the DM grants for great play. `inspiration_granted` event. Capped (likely 1) so it can't inflate.
- **Better outcomes need no judgment call** — a clever approach resolves the front *without* the
  fight, in fewer rounds, or reveals more world. The reward is efficiency, survival, and discovery,
  all self-evident from outcomes. This is the main creativity reward.
- **Failure-as-engagement** — when a bold attempt *fails the roll but still moves a clock*, award
  partial credit. Rewards trying interesting things without the DM grading creativity directly.
  (Quietly serves the "reward creative thinking" goal through the back door.)

## Companions / solo

Genesis is solo (one PC, optional companions). v1: companions advance with the PC (shared level),
no separate XP pool. Revisit if companion autonomy deepens.

## Worked examples (test fixtures)

1. **Close a front by negotiation, no fight:** `front_closed` award, no combat bonus, possible
   Inspiration for the clever play. Same XP as closing it by force — the economy rewards the
   *resolution*, not the method.
2. **Grind goblins in a cleared dungeon:** near-zero XP (no objective), and the world doesn't
   refill — finite targets. No level gain; if civilians/authority were among them, `DIFFICULTY.md`
   escalates.
3. **Cross a threshold mid-fight:** XP recorded now, `level_applied` deferred until the next
   short/long rest, then the level-up passage fires.

## Open questions

- ~~**Threshold curve:** SRD numbers vs a custom compressed curve.~~ **RESOLVED 2026-06-21 —
  use SRD 5.2.1 numbers exactly**, no compression. The slow climb is intended: with death expected
  (`DEATH-AND-REBIRTH.md`), most lives end well short of L20, so there's no rush to late levels.
  Author the SRD thresholds as a compile-ready markdown table → JSON. Revisit only if play proves
  it paces badly.
- **Combat award values:** deferred until `COMBAT.md` firms up (don't price events the engine
  can't yet emit cleanly).
- ~~`CLASS_PROGRESSION` data (levels 2–20) is unbuilt.~~ **RESOLVED — `data/class-progression.js`
  ships all 12 classes × L1–20** (generated; see CLAUDE.md). The mechanical level-up + the in-app
  interpretive picker both read it.
- ~~**Subclass + general-feat picks** are DM-narrated.~~ **RESOLVED 2026-06-26** — the picker is now
  complete: subclass reveal (`data/subclass-progression.js`), an ASI-_or_-feat slot with original
  IP-clean general feats (`data/feats.js`), and spell swapping. Open: the feat set is a **draft**
  (Adam to tune balance/names); Magic-Initiate-style feats with a nested spell pick are deferred (the
  current feats apply a flat grant or a single +1, no nested picker).
- Milestone override: should the DM be able to *also* grant a milestone level for a story climax,
  on top of thresholds? (Leaning no — keep one mechanism — but flagged.)
