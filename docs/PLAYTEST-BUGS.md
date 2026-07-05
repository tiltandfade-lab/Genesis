---
type: reference
project: Genesis
status: living — the running list of bugs & fixes caught in playtest
updated: 2026-07-05
---

# Playtest Bugs & Future Fixes — the running list

Bugs and design gaps caught **in play** (model-in-the-loop), starting with the first
bridgeless Layer-1 session, **"The Shimmering Maw"** (2026-07-05, PC: Sella Voss "the Seam").

**This file is a ledger, not a work order.** Per Adam (2026-07-05): *aside from the harness and
testing process itself, we are not building anything right now — everything here is a FUTURE fix.*
The only things built for this were the harness (`dev/playtest-bridgeless.mjs`) and the regression
probes (`dev/playtest-bug-probes.mjs`).

Every `BUG-*` below has a deterministic probe in **`dev/playtest-bug-probes.mjs`** that reports
whether it still reproduces. Workflow: fix on a branch → `node dev/playtest-bug-probes.mjs` → the
probe should flip **PRESENT → resolved**. A resolved probe going PRESENT again = a regression.

Run the suite any time: `node dev/playtest-bug-probes.mjs`

---

## Bugs (caught, reproduce today)

### BUG-01 · CRITICAL · roll-branch consequences silently vanish
- **Symptom:** every pre-authored `rollRequest.branches` event no-ops — a check resolves with its
  narration but none of its mechanical effects (HP, faction clocks, codex adds, epithets) apply.
- **Root cause:** `resolveBranch` (src/world/dm.js) stamps branch events `source:"branch"`; the newer
  DM-Seam `validateEvent` only accepts `"detected"|"declared"` and rejects everything else, so
  `applyEvent` no-ops them. The two merged features (ROLL-BRANCHES + DM-SEAM typed contracts) are
  incompatible as shipped.
- **Why the unit tests miss it:** `verify-roll-branches.mjs` asserts `events[0].source === "branch"`
  (the *label*), never that `applyEvent` mutated state; `verify-dm-seam.mjs` tests `validateEvent` in
  isolation and never feeds it a branch-sourced event. Classic mutation-test gap — assert the effect,
  not the label.
- **Blast radius:** in the Shimmering Maw session this dropped the consequences of **all 7 checks**;
  each had to be re-applied by hand via the harness `patch` route-around.
- **Intended fix (options):** add `"branch"` to `validateEvent`'s allowed `source` set (simplest); OR
  have `resolveBranch` stamp `source:"declared"` and carry `branch:true` in a separate field for
  provenance. Then extend `verify-roll-branches` to assert the branch actually mutated state.
- **Probe:** BUG-01.

### BUG-02 · HIGH · the world clock never advances from a DM event  *(hotfix candidate)*
- **Symptom:** time sits still. In the session it stayed Day 1, 06:00 for six turns despite travel and
  a fight; the "dusk deadline" only arrived because the harness advanced the clock by hand.
- **Root cause:** no event type advances `w.clock`. `walk_advance` moves a *walk-segment cursor*; the
  `rest` event restores resources; clock advance lives only in the UI's `passTime` (player-triggered).
  A purely DM-narrated session has no lever to pass time.
- **Design intent (Adam, 2026-07-05):** *the clock should always be ticking.* Combat = **≥6 seconds
  per turn/round** at minimum. Distance travelled and any DM hand-wave ("hours pass") should advance
  it too. Candidate for a real hotfix rather than a deferred fix.
- **Intended fix:** a DM-reachable clock event (e.g. `advance_clock {minutes}` or make `walk_advance`
  /`round_tick`/`combat` tick the clock: 6s per combat round, distance-scaled for travel), plus a
  hand-wave/montage minutes path.
- **Probe:** BUG-02.

### BUG-03 · HIGH · digest hides current HP
- **Symptom:** the DM narrated a life-or-death fight while the digest reported the PC at full HP.
- **Root cause:** `dmDigest` ships `sheet.hp` (max), never `sheet.hpCur`. The DM has no visibility into
  how hurt its player is — it calibrated danger by fiction alone.
- **Intended fix:** ship both `hp` (max) and `hpCur` (current) in `digest.pc`; the DM narrates wounds
  from the real number instead of guessing.
- **Probe:** BUG-03.

### BUG-04 · HIGH · no non-lethal knockout
- **Symptom:** a *declared capture* that takes the PC to 0 HP wrongly starts death saves (dying),
  contradicting the fiction. In the session the damage had to be capped at 1 HP to keep her captured
  rather than dying.
- **Root cause:** `hp_changed` to ≤0 always routes into the death-save / dying track; there's no
  "non-lethal" flag for a knockout-to-unconscious-but-stable (5e: non-lethal 0 HP = stable
  unconscious).
- **Intended fix:** a `payload.nonlethal` (or `capture`) flag on `hp_changed`/`combat_end` that lands
  the PC at 0-and-stable (unconscious, no death saves) instead of dying.
- **Probe:** BUG-04.

### BUG-05 · MED · `discovery makeNode` doesn't move the PC
- **Symptom:** the DM narrated travel to a new place; the node was created but the PC stayed put
  (`currentNodeId` unchanged), so the leave-and-return spine didn't fire on its own.
- **Root cause:** the `discovery` handler creates+reveals a node but never relocates the PC; the only
  PC-move event is `prep_contact` (for rumored frontiers). No general "travel to node N".
- **Intended fix:** a `payload.enter:true` on `discovery` (or a dedicated `move_node`/`travel` event)
  that sets `currentNodeId`, stamps the departure, and runs `worldTurn("revisit")` for drift.
- **Probe:** BUG-05.

### BUG-06 · MED · event field-names not discoverable from the digest
- **Symptom:** the DM reached for the intuitive field name and got a silent no-op.
  - **BUG-06a:** `clock_advanced` wants `payload.clockId`, but the digest calls the same thing
    `powers[].faction` — so `payload.faction` → `untracked`, clock doesn't move.
  - **BUG-06b:** `epithet_grant` wants `payload.text`, but "epithet" is the obvious name — so
    `payload.epithet` → `no-living-pc-or-text`, no title granted.
- **Root cause:** the AI↔engine event contract isn't legible from the digest the DM reads; accepted
  payload shapes aren't echoed anywhere the model sees.
- **Intended fix:** align field names with the digest's vocabulary (accept `faction` as an alias for
  `clockId`; accept `epithet` as an alias for `text`), and/or publish the accepted event shapes into
  the digest or a contract stub so the DM can self-correct. Consider warning on a no-op instead of
  swallowing it silently.
- **Probe:** BUG-06a, BUG-06b.

### BUG-07 · MED · `distant_word` ignores DM-supplied text
- **Symptom:** the DM authored a specific rumor to seed the next session; the engine dropped it and
  rolled its own ambient rumor instead.
- **Root cause:** the `distant_word` handler rolls from its table and ignores `payload.text`.
- **Intended fix:** use `payload.text` when supplied; fall back to the roll only when it's absent.
- **Probe:** BUG-07.

### (minor, no probe) — DM output hygiene, observed once
- The DM occasionally emitted **flat event envelopes** (`{type, what}`) instead of
  `{type, payload:{…}, source}` — they no-op'd until the contract was spelled out in the brief. Ties
  to BUG-06 (contract discoverability). One `codex_add` name came through **HTML-escaped**
  (`Str&gt;`), corrected on apply. Both are seat/brief-quality issues, not engine bugs — but a bridge
  that *hoisted stray top-level keys into payload* (or warned) would be more forgiving.

---

## Future features / fixes (design captured, not built)

### FIX-A · world-seed variety + bardo reincarnation
- **Flag:** "The Shimmering Maw" rolled in two consecutive played sessions. Probe VARIETY measured
  **~30 distinct settings in 60 rolls with a mild skew** (one setting at 5×/60 ≈ 8% vs ~3% uniform).
  Not deterministic-broken, but the pool is smaller/more weighted than "a different name and context
  every game" wants.
- **Intent (Adam, 2026-07-05):** a fresh game should **almost always** roll a different setting name
  *and* context. **Exception — the bardo:** when reincarnating from death, there should be a *chance*
  of waking in the **same location, or a location already explored** (reincarnation is the only
  intended repeat path). So: (1) widen/re-weight the `master` setting table for variety; (2) audit the
  roll for uniformity; (3) build the bardo-reincarnation "same/known location" chance as a distinct
  path (not a fresh roll).
- **Probe:** VARIETY (characterization only; flips to OK when the pool is wider/flatter).

### FIX-B · clock always ticking → see BUG-02 (hotfix candidate)
Combat ≥6s/round, distance advances the clock, hand-waves pass minutes. Called out separately because
it's the highest-value time-fix and a candidate for a real hotfix.

### FIX-C · action-economy visualization (UI feature)
- **Intent (Adam, 2026-07-05):** show the PC's action economy in play — a **movement counter**
  (remaining / total), and **icons for action & bonus action** (available vs spent), plus a
  **movement bar** (the kind of teammate action-economy readout you see in multiplayer games).
- **Reference & IP note:** BG3 uses a green dot (action) + orange triangle (bonus action) + orange
  movement bar. **Game *mechanics and systems are not copyrightable*** — the action/bonus/movement
  economy is D&D's rule, and the *convention* of "a dot for action, a triangle for bonus, a bar for
  movement" is a functional UI idiom that's free to use. What you must **not** copy is BG3's *specific
  icon artwork / exact assets* (protectable as art/trade dress). So: adopt the same **system and
  layout**, render **our own** dot/triangle/bar in the Genesis (Ivalice-bible) style. Safe and on-doctrine
  (§II.0b "all art is placeholder"). *(Practical read, not legal advice — if it ever ships commercially,
  a quick IP check is cheap.)*
- **Dependency:** the engine doesn't yet track per-turn action/bonus/movement (this session's
  ball-bearings-dump + bolt + rope-cut was adjudicated narratively as one turn, not economy-checked).
  The viz needs an action-economy model underneath it first.

---

## How these were found

Bridgeless Layer-1 playtest: two sealed Sonnet seats (Player + DM) played a full session through the
real engine loaded headless in jsdom (`dev/playtest-bridgeless.mjs`), Opus as clerk/analyst. The
mechanical gauntlet (Layer 0) can't catch any of BUG-01…07 because it never calls a model — exactly
the layer separation `docs/AUTOMATED-PLAYTEST.md` predicts. Session report + full recap:
the "Shimmering Maw" artifact.
