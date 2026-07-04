# CHASE-CONTRACT-FIX — solo-foe auto-end must not outrace chase_start

```
type: system-spec
status: SPECCED (locked 2026-07-04; from dev/playtest-chase-0704-findings.md — the first live
chase exercise. Findings #1/#2/#5 fixed here; #3/#4/#6/#7/#8 ride Adam's evening ledger.)
consumer: Sonnet executor; orchestrator gates
```

## The bug (finding #1, HIGH — reproduced twice, minimal repro in the findings file)

COMBAT-LIFECYCLE §3d contracts: pursuit ⇒ DM emits `chase_start` BEFORE `combat_end`. But when
the LAST unresolved foe breaks morale and flees, `foe_morale`'s handler calls
`cmMaybeAutoEnd(w)` in the same applyEvent pass (src/world/dm.js:1671; also reachable via
:1073/:1717), which auto-fires a detected `combat_end` — the DM's next turn arrives to a torn-
down `GS.combat` and `chase_start` degrades to `"the quarry"` (finding #2). The most common
chase trigger (the fight's last foe running) is therefore structurally unable to honor the
contract.

## Decision (recorded — doctrine: script owns detection, DM owns the END decision)

`cmMaybeAutoEnd` (src/world/dm.js:799-807) splits by outcome:
- **All foes `down`** → auto-fire detected `combat_end {outcome:"resolved"}` — UNCHANGED.
- **All resolved but ≥1 merely `fled`/`surrendered`** → do NOT auto-fire. Instead set
  `GS.combat.resolvable = {outcome:"fled", since: GS.combat.round}` (new transient field,
  cleared with GS.combat) and surface it in the DM digest combat slice (`dmDigest`,
  src/world/dm.js:168 area) as
  `resolvable: "all foes fled/surrendered — declare combat_end, or chase_start first if pursued"`.
  The DM then declares `chase_start` (foe still live in GS.combat → real name, real fid) and/or
  `combat_end` per the existing contract. No new event types.

## Behavior

1. `cmMaybeAutoEnd`: compute `allResolved` and `allDown` as today; auto-end ONLY when
   `allDown`; else when `allResolved`, set the `resolvable` flag (idempotent — don't re-set if
   present) and return without emitting. Guard: flag cleanup needs no code — `GS.combat=null`
   at combat_end disposes it.
2. `dmDigest` combat slice carries `resolvable` (string or absent). One ledger line when the
   flag first sets: "— The fight is yours to end: every foe is fled or yielded." (prose twin
   parity for free via the ledger).
3. `chase_start` handler: no change needed once #1 lands (foe alive at emit time) — but add the
   guard the race exposed: if `targetFid` resolves nothing, fall back to the fled foe's name
   when exactly one foe is fled, else "the quarry" (kill finding #2's silent degrade).
4. Finding #5 (one line, same unit since the playtest exposed it in this flow):
   src/world/render.js:268 `GS.gamePanel=GS.prevPanel||"map"` — a pre-fight `null` panel
   (chat-only) must restore to `null`, not "map": change to
   `GS.gamePanel=(GS.prevPanel===undefined?"map":GS.prevPanel)`; the mid-fight sentinel stays
   `undefined` (line 266 only stores when entering).
5. DM-BRIDGE.md "Running a fight" paragraph gains one sentence documenting the resolvable flag
   (the DM-facing contract surface). docs/COMBAT-LIFECYCLE.md §3b/§3d updated to match.

## Out of scope

Solo-foe morale trigger derivation (finding #3, calibration — ledger) · CR-fallback flavor
coherence (finding #4 — ledger) · gap-clock bite tuning (finding #6 — ledger) · codex
soft-recall on "away" (finding #7 — documented-but-unbuilt, own unit later) · PC-as-quarry
modeling (finding #8 — design).

## Verification (dev/verify-chase-contract.mjs, jsdom, manifest load order)

1. ⊗ RED-FIRST (the playtest's minimal repro, automated): combat with ONE foe; drive
   `foe_morale` to a flee disposition; assert `GS.combat` is still non-null, `resolvable` set,
   and NO combat_end in the event log — red on current master (auto-end fires today).
2. All-down path unchanged: two foes, both driven to `down` via `attack` — detected
   combat_end auto-fires with outcome "resolved" exactly as today.
3. Contract sequence: after check 1's state, emit `chase_start {targetFid}` then
   `combat_end {outcome:"fled"}` — chase carries the foe's REAL name; combat tears down; panel
   restore honors a `null` pre-fight panel (finding #5 case asserted here).
4. ⊗ MUTATION: revert the cmMaybeAutoEnd split (restore unconditional auto-end) → checks 1 and
   3 red; re-apply → green. Record both runs.
5. Digest: `dmDigest` output contains `resolvable` when flagged, absent otherwise.
6. `python3 build/check-manifest.py` → RESULT: OK; full dev/verify-*.mjs sweep by exit code
   (verify-combat-lifecycle and verify-dm-events named — event surface changed);
   `node dev/gauntlet-fuzz-events.mjs` + `node dev/gauntlet-monkey.mjs` (0 harness-aborted).
