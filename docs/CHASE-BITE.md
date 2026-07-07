# CHASE-BITE — complications get teeth; the gap clock converges

```
type: system-spec
status: SPEC-LOCKED 2026-07-06 — Adam took the RECOMMENDED design (A: loser −2 rider + B:
round-4 quarry stretch) at the Fable-window ruling batch. Build DEFERRED (freeze; executes
post-Fable via Opus-orchestrated Sonnet executors). Originally drafted 2026-07-04 from
dev/playtest-chase-0704-findings.md finding #6; the alternative below is retained for the record.
consumer: Opus orchestrator + Sonnet executor; orchestrator gates
```

## The finding (#6, CALIBRATION — verified against the current tree)

`chaseRound` (src/world/gap-wiring.js:91–107) shifts the gap ±1 purely on the caller-supplied
`pursuerWon` boolean (:93) and rolls one chase-complications row (:94–96) that is narrated but
never drives outcome. With CHASE_GAP_SIZE=3 / CHASE_AWAY_MULT=2 (gap-wiring.js:64–65: absorb
at 0 and 6, start at 2), a near-50/50 opposed check is a symmetric random walk: expected
absorption 8 rounds with a long tail — the playtest's Encounter A oscillated gap 1–4 for 12
rounds and needed a declared `chase_yield`. Nothing signals "this chase is dragging."

## RECOMMENDED design (one rider + one convergence rule)

### A. The complication rider: a flat −2 on the loser's next check

Every complication (band-uniform — one rule, no band-reading code) sets a consumed-once rider:
```js
chase.next = { side: pursuerWon ? "quarry" : "pursuer",   // the round's LOSER carries the burden
               mod: -2, why: complication.text, round: chase.rounds.length }
```
- **Why flat −2, not adv/dis:** the margin ladder is band arithmetic on `total − DC`
  (docs/DIFFICULTY.md:88–99; `checkDegree`, src/engine/check.js:28–37), and −2 is exactly the
  near-miss band width — a rider that visibly moves outcomes one band, auditable as a number.
  It rides `resolveCheck`'s existing `bonus` parameter (check.js:39, applied :84/:93/:101) with
  zero new engine surface, and composes with player-rolls-own-dice: the modifier hits the
  TOTAL, never the die. Adv/dis cannot be applied after a player's single open roll (check.js:45)
  without new two-d20 roll-request UI.
- **Why the LOSER carries it:** streaks resolve chases — the convergence the finding asks for,
  and genre-true. Deterministic; no table re-authoring.
- Consumed-once: the next `chase_round` overwrites `chase.next`; chase end clears with GS.chase.

### B. The convergence rule: after round 4, a quarry win widens by 2

```js
const CHASE_STRETCH_AFTER = 4;                       // beside CHASE_GAP_SIZE, gap-wiring.js:64
const stretch = chase.rounds.length >= CHASE_STRETCH_AFTER;
chase.gap += pursuerWon ? -1 : (stretch ? 2 : 1);    // chaseRound :93
```
- **Grounds for 4:** gapSize+1 — both sides get one full clock of honest ±1 rounds (the
  playtest's organic endings landed in 6 and 8 rounds, untouched); the symmetric walk's
  12+-round tail is what the escalation cuts.
- **Quarry-side only:** escalating both sides makes round 5+ sudden-death and erases earned
  position. A long chase resolving toward "away" is the genre default — and CHASE-SOFT-RECALL
  makes "away" a persistent thread, so the units compose.
- Announce once, first stretch round: "» The chase runs long — the quarry stretches for the
  break (lost ground now costs double)."

### C. Surfacing

- `chase_round`'s return + ledger line (dm.js:2395–2396) gain "— <side> hampered (−2 next check)".
- `dmDigest` gains a compact chase slice gated on `GS.chase && GS.chase.active` (precedent:
  the combat slice's resolvable string, dm.js:177):
  `chase:{ gap, gapSize, awayAt:6, round, stretch:boolean, next:{side,mod,why}|null, rule:"…" }`
- docs/DM-BRIDGE.md one runbook sentence; docs/COMBAT-LIFECYCLE.md §3d row.
- Honesty guard, recorded: `pursuerWon` stays caller-resolved; enforcement = the returned
  `next` shape + digest surfacing; DM arithmetic obedience is a charter/runbook lane.

## The ONE alternative (Adam may pick instead)

**Advantage/disadvantage rider:** `chase.next={side, roll:"dis", why}`; the engine-rolled side
threads adv/dis via cmRollD20 (src/engine/combat.js:61–67). Tradeoffs: 5e-native, reads louder
(±~3.3 EV); but invisible to margin-ladder arithmetic, asymmetric in practice (the player's
open roll needs new two-d20 roll-request UI), harder to audit than a number. Same convergence
rule B either way — B guarantees resolution; A makes complications matter.

## Out of scope

Re-authoring chase-complications rows (Adam's craft sweep) · a hard round cap (the stretch rule
replaces it) · PC-as-quarry (finding #8) · terrain-differentiated math · CHASE-SOFT-RECALL
(sibling, lands independently).

## Verification (when approved: dev/verify-chase-bite.mjs)

1. ⊗ RED-FIRST (convergence stat): 500 simulated chases, fair-coin pursuerWon, direct
   chaseInit/chaseRound loop; assert ≥95% resolve within 12 rounds — RED on current master,
   GREEN with CHASE_STRETCH_AFTER.
2. Rider shape: after a round, chase.next.side is the loser; mod −2; overwritten next round.
3. Stretch math: rounds 1–4 step +1 on quarry win; round 5+ steps +2; pursuer always −1;
   away still grades at gap>=6, contact at <=0.
4. Digest slice present while active, absent when GS.chase null; ledger stretch line fires once.
5. ⊗ MUTATION: revert the stretch step → check 1 red; drop the rider assignment → check 2 red;
   re-apply → green.
6. check-manifest → OK; full sweep — named: verify-chase-contract.mjs,
   verify-chase-soft-recall.mjs, verify-gap-wiring.mjs, verify-gap-callers.mjs,
   verify-digest-diet.mjs; gauntlet-fuzz-events + gauntlet-monkey (0 harness-aborted).
