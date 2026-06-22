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
- **Leveling applies on a rest** — short rest is enough. Never mid-combat.
- **Creativity is NOT on the XP axis** (see "Rewarding play" — it corrupts the container).

## What generates XP

XP is priced from events, not narrated. Award values below are **draft** and will be tuned;
the *structure* is the point.

| event | XP basis | notes |
|---|---|---|
| `front_closed` | the front's stake (size × tier) | the meat of the economy |
| `clock_fired` (for the player) | per-clock award | a faction goal resolved in the PC's favor |
| `choice_logged(major)` | flat major-choice award | only fires when it forecloses something |
| `discovery` / `fact_canonized` | small | rewards exploration + lazy-history engagement |
| `encounter_resolved`, combat | CR-based bonus **only if `objectiveRef` is set** | a fight that advances a tension |
| `encounter_resolved`, combat, no objective | ~0 | raw kills tied to nothing barely pay |

**Why combat is gated to objectives:** it kills the grind incentive without *forbidding* the
playstyle. A murder-hobo can still fight forever — they just don't level from it efficiently,
and `DIFFICULTY.md` answers the behavior with escalation. Combined with a **fixed world (finite
grindable targets)**, grinding self-limits: you run the region dry, then the consequence arrives.

## Leveling

- **Thresholds:** a per-level XP table (draft: SRD 5.2.1 thresholds, or a compressed custom
  curve — TBD; lives as a compile-ready markdown table → JSON, same pipeline as `tables.json`).
- **Proficiency bonus, spell slots, features by level:** parse the SRD `classes.md` Features
  tables into structured `CLASS_PROGRESSION` data (the level-1 treatment in `data/srd-creator.js`,
  extended to 20). Until then, only L1 is wired (see "Open").
- **The level-up beat:** when accumulated XP crosses a threshold, the script flags it; on the
  next rest the DM offers the **level-up passage**, which re-walks the same choices the creator
  bardo already does — new spells, ASI/feat at the right levels, subclass at the right level —
  via the existing creator machinery (`cgSheetExtras` + the bardo step renderers). Reuse, don't
  rebuild.
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
- `CLASS_PROGRESSION` data (levels 2–20) is unbuilt — only L1 exists today. This is the load-bearing
  data task before any real leveling ships.
- Milestone override: should the DM be able to *also* grant a milestone level for a story climax,
  on top of thresholds? (Leaning no — keep one mechanism — but flagged.)
