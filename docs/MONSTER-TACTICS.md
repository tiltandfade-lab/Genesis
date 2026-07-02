---
type: system-spec
status: specced 2026-07-01 late night — build-ready (day-2+; rides GS.combat + the bestiary; pairs with COMBAT-TRACKER)
created: 2026-07-01
related:
  - "[[COMBAT]]"
  - "[[COMBAT-TRACKER]]"
  - "[[WALK-REFRESH]]"
  - "[[DM-BRIDGE]]"
---

# Monster Tactics — the script proposes, trash plays itself, morale binds

## §0. Adam's forks (2026-07-01)

| Fork | Call |
| --- | --- |
| Morale | **BINDING — the script owns the number.** Morale is a creature's save against fear: the script rolls it, the outcome (fight on / flee / surrender / parley) is mechanical fact; the DM owns HOW it plays out in fiction. Monsters stop fighting to the death because dice say so. |
| Trash autoplay | **YES.** Foes below the CR threshold with no custom d10 table auto-resolve their turns through the built combat resolver (attack + damage rolled openly in the feed); the DM narrates results. Bosses + Adam's custom-table creatures stay DM-driven. |

## §1. `proposeTactic(foe, combat)` — every foe turn gets a rolled intent

Source priority (the anti-drift ladder):
1. **The creature's own custom d10 table** (Adam's 95, carried verbatim in `data/bestiary.js`) —
   roll it; the row IS the tactic.
2. **The walk archetype's Behavior hook** (the encounter's rolled behavior text — already on the
   encounter object) — reuse it as the standing disposition.
3. **The state machine** (fallback): `bloodied → morale check pending` · `pack + ally adjacent →
   flank/knock prone` · `ambusher + not yet seen → hold/hide` · `leader down → morale` ·
   `ranged + PC closed → retreat a band` · else `press the attack`.

Output: `{action, targetHint, rationale, source}` — rides `digest.combat.proposals[]` (DM-facing;
the tracker panel does NOT show it to the player). The DM narrates from it or overrides freely —
**proposals are advisory; only morale (§2) binds.**

## §2. Morale — binding, script-rolled

- **Triggers** (once each per fight per side/foe): side bloodied (≥half its number down) ·
  leader/boss down · an individual foe bloodied while outnumbered · a Volatile+ fear effect.
- **The roll:** WIS-based save vs `MORALE_DC` (init 10; ±2 for discipline/fanaticism derived from
  type tags — undead/constructs auto-pass, beasts falter early; one small `MORALE_MODS` map).
  Rolled openly in the feed like enemy attacks ("the pack's nerve: 7 — breaks").
- **Outcomes** (mechanical fact): pass = fights on (immune to that trigger) · fail = roll
  disposition d6: 1–3 **flee** (disengage toward an exit band) · 4–5 **surrender/withdraw with
  intent** (parley door opens — feeds the SOCIAL attitude system) · 6 **rout-panic** (drops
  weapon/loot, provokes). The DM narrates the how; a fled foe persists as a codex soft record
  (it can come back — recall fodder).
- `combatOutcomeEvents` already banks flee-XP; a routed fight resolves as encounter_resolved
  with the objective state as-is.

## §3. Trash autoplay

- **Eligible:** foe CR ≤ `AUTOPLAY_CR_MAX` (init: CR 1) AND no custom d10 table AND not the
  encounter's named leader.
- On its turn: `proposeTactic` picks the action → the resolver rolls attack/damage vs the PC
  exactly as the built combat spine does (open rolls, feed chips, dice trace) → results land as
  the normal events; the DM's next turn narrates AROUND already-resolved mechanics (the same
  narrate-FROM-rolls contract as player dice).
- The DM can flag any foe `dm.noAutoplay` via `codex_update`/response note when a trash foe
  becomes story-relevant mid-fight.
- **This is the third latency leg's cousin:** in a 5-goblin fight, 4 turns resolve without an
  inference.

## §4. Build plan + verification

1. `proposeTactic` + source ladder + `digest.combat.proposals` (DM-only). 2. Morale triggers +
roll + disposition + once-per-trigger memory (`GS.combat.moraleFlags`). 3. `MORALE_MODS` /
`MORALE_DC` / `AUTOPLAY_CR_MAX` constants (provisional, tune with `xpReport` sessions).
4. Autoplay loop in the foe-turn path. 5. Frontier prose: DM-BRIDGE register for proposals
(advisory) vs morale (binding) — mirrors the §8.3b "DM judges WHEN, script owns THE number" split.
6. `dev/verify-monster-tactics.mjs`: custom-d10 creature always uses its table (mutation check:
break the ladder, harness fails) · morale fires once per trigger, undead auto-pass · a failed
morale mechanically moves the foe band/state · autoplay refuses bosses/custom/`noAutoplay` ·
proposals never render in the player DOM · regression `verify-combat` green.

## §5. Acceptance

Fights get texture without inference cost: wolves flank, ambushers hold, goblins break and RUN
when the leader drops — and a surrender opens a parley instead of a grind to zero. The DM
narrates a battle it no longer has to bookkeep.
