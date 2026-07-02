---
type: system-spec
status: specced 2026-07-01 late night — STRUCTURE locked; NUMBERS are named tunables, provisional until 2–3 lean-stack playtests feed the telemetry (§4). Builds day-2+.
created: 2026-07-01
related:
  - "[[ADVANCEMENT]]"
  - "[[COMBAT]]"
  - "[[DIFFICULTY]]"
  - "[[TIER-SCOPE]]"
  - "[[EVENT-CONTRACT]]"
---

# Advancement Re-Tune — the spine flip (framework now, numbers from play)

## §0. Adam's forks (2026-07-01)

| Fork | Call |
| --- | --- |
| Kill gate | **Open kill XP with diminishing trash returns.** Every real fight pays — combat is the fun; you earn by surviving danger. Anti-farm decay: repeat kills of the same CR-band at the same place within a session pay full → half → quarter. The objective tie flips from GATE to BONUS (objective-linked encounters pay ×`XP_TUNE.objBonus`, init 1.25). |
| Pace target | **~2 sessions/level early → ~4 late** (target curve §4; the whole L1→10 arc ≈ 25–30 sessions). Early levels come fast — hook the run, deaths restart often anyway; drag rises with tier. |
| Milestone demotion | **Garnish ≈ 25% of a typical session's earn.** Danger carries ~75% of pace; discovery/facts/choices still visibly tick. |

**The "don't tune twice" discipline holds:** this spec locks the STRUCTURE; every number below is a
named constant in one `XP_TUNE` block, stamped provisional, re-set from §4 telemetry after 2–3
post-batch sessions. Tune once, from evidence.

## §1. The spine flip

- `encounter_resolved` (CR-priced, built) becomes the PRIMARY earn: **un-gate** (remove the
  objective requirement), apply the decay guard, apply the objective BONUS when `objectiveRef`
  present.
- **Decay guard:** track per-session kill credits by `(crBand, nodeId)` (world-side, cleared at
  `beginSession`): 1st encounter of a band-at-place = ×1.0, 2nd = ×0.5, 3rd+ = ×0.25. Fresh
  danger always pays full; grinding the same warren doesn't.
- Flee-and-bank (built) unchanged — survival banks the earned share.

## §2. One currency — re-price everything in encounter-units

Define `E(L)` = the XP of a level-appropriate MEDIUM encounter (derived from `CR_XP` + the
DIFFICULTY budgets — a function, not a table copy). Re-price (initial values, all `XP_TUNE`):
- `front_closed` = **1.0 × E(L)** (closing a front = beating a real encounter's worth of world).
- `clock_fired`-survived = **0.5 × E(L)** (the world hit you and you're still here).
- `discovery` / `fact_canonized` / `choice` keep the §8.3b firing ladder (DM judges WHEN, script
  owns the number) but re-size so a typical session's milestone take ≈ **25%** of total
  (init: discovery 1, fact 2, choice 3 → re-derive from E(L)/session-shape after telemetry).
- **The daily cap applies to the milestone garnish ONLY — combat XP is uncapped.** Danger is
  self-limiting: the cap on grinding is death. (Hard-and-dangerous, mechanized.)

## §3. Unchanged

`applyLevelUp` + the rest-gate (`passTime`) + SRD-exact curve + `LEVEL_CEILING` + DM-narrated
interpretive picks. This re-tune moves the EARN, not the SPEND.

## §4. The instrument — tune from evidence

`seamHarvest` gains `xpReport`: `{ total, bySource: {combat%, milestone%, front%},
decayLost, paceThisLevel: sessionsAtCurrentLevel, paceTarget }` where the target curve is
**L1–2: 2 · L3–4: 2.5 · L5–6: 3 · L7–8: 3.5 · L9–10: 4 sessions/level** (`XP_TUNE.paceCurve`).
After 2–3 sessions: if combat% drifts far from ~75 or pace strays >±1 session from target,
adjust `XP_TUNE` once, in one commit, citing the reports. (Rides the session-cost-report
morning-read habit — one wrap, two instruments.)

## §5. Build plan + verification

1. `XP_TUNE` block (one object, `src/engine/advancement.js`) — every constant above, header-marked
   provisional. 2. Un-gate + decay guard + objective bonus in the `encounter_resolved` path.
3. Re-price `front_closed`/`clock_fired` via `E(L)`. 4. Cap scoping (milestone-only).
5. `xpReport` in `seamHarvest`. 6. `dev/verify-xp-retune.mjs`: decay sequence ×1.0/×0.5/×0.25 by
band+place, resets at `beginSession` (mutation check: break the reset, harness fails) · fresh
band-or-place pays full · objective bonus applies only with `objectiveRef` · `front_closed` scales
with level via `E(L)` · combat XP ignores the daily cap, milestones respect it · `xpReport`
percentages sum to 100 · regression: `verify-advancement`/`verify-combat` green.

## §6. Acceptance

A session that braves two real fights and closes a front levels noticeably; a pure-talk session
still ticks but doesn't keep pace — and nobody can farm rats to 10. After three sessions the
`xpReport` either confirms the curve or tells us exactly which constant to move.
