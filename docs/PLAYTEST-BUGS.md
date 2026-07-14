---
type: reference
project: Genesis
status: living — the running list of bugs & fixes caught in playtest
updated: 2026-07-05
---

# Playtest Bugs & Future Fixes — the running list

Bugs and design gaps caught **in play** (model-in-the-loop), starting with the first
bridgeless Layer-1 session, **"The Shimmering Maw"** (2026-07-05, PC: Sella Voss "the Seam").

> **Run 2 (2026-07-05, Sella continued, memoryless fresh DM seat per turn):** re-confirmed **BUG-01
> reproduces live** (branch events `source:"branch"` still rejected → all 7 checks' consequences had
> to be re-landed via `patch`). New findings added below: **BUG-06c** (the headline — `codex_update`
> notes silently dropped, so the DM's understanding does NOT survive into the codex — the exact thing
> Run 2 tests), **BUG-06d**, **BUG-08** (nat20/1 fall-through leaves `w.dm.rollReq` set), and two codex
> hygiene notes. **Verdict on "does the codex survive play?":** the *engine-rolled atoms* survive, but
> the *DM's interpreted knowledge* is lost unless the seat writes `dm`/`fields` explicitly — a
> contract/prompt gap, not an engine-logic gap (once taught, it persisted cleanly).

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
- **FIXED 2026-07-05 — branch `fix/event-source-enum` (Root A); probe flipped ○ resolved.** `validateEvent`'s `source` check now uses the `DM_EVENT_SOURCES` allow-list (adds `player`+`branch`). The BUG-01 probe now asserts state MUTATION (not just the label), and `verify-roll-branches.mjs` gained applied-ok checks — the mutation-test gap that hid this is closed.
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
- **FIXED 2026-07-07 — branch `fix/social-spine-fixes` (SOCIAL-SPINE-FIXES §S5); probe flipped ○ resolved.**
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
- **FIXED 2026-07-05 — branch `fix/event-source-enum` (Root B): `DM_EVENT_FIELDS` alias fold + drift-warn; `codexUpdate` note→`dm.notes[]`. Probes BUG-06a/b/c/d all ○ resolved.**
- **Symptom:** the DM reached for the intuitive field name and got a silent no-op.
  - **BUG-06a:** `clock_advanced` wants `payload.clockId`, but the digest calls the same thing
    `powers[].faction` — so `payload.faction` → `untracked`, clock doesn't move.
  - **BUG-06b:** `epithet_grant` wants `payload.text`, but "epithet" is the obvious name — so
    `payload.epithet` → `no-living-pc-or-text`, no title granted.
  - **BUG-06c (Run 2 · promote to HIGH — codex-survival):** `codex_update` persists knowledge ONLY
    via `payload.dm` / `payload.fields` (each an object merged into the record). The DM's intuitive
    move is `codex_update {id, note:"free prose"}` — and `codexUpdate` (src/world/codex.js:126) has no
    `note` field, so **every note is silently dropped.** Verified in Run 2: after multiple turns of
    rich Corran/Maddan/Dessa notes, the records still read `fields:{} dm:{}`. This is the headline
    Run-2 result — **the DM's accumulated understanding does NOT survive into the codex** (the exact
    thing "how well does the codex survive play?" was meant to measure). Fix: make `codexUpdate` accept
    a `note` that appends to `dm.notes[]` (the seat WILL keep reaching for `note`), and/or teach the
    exact `dm`/`fields` shape in `SEAT-PROMPT.md`. The moment the seat prompt taught `dm:{…}`,
    knowledge persisted correctly — so the contract, not the engine, is the gap.
  - **BUG-06d (Run 2):** `discovery` wants `payload.what` (+ `makeNode:true` to create the node), not
    `payload.name`/`desc` → without it, ledger reads "Discovered: something new" and no node is made.
    `fact_canonized` wants `payload.what`, not `payload.text` → ledger reads "Canon fact recorded: ?".
    Same discoverability root cause.
- **Root cause:** the AI↔engine event contract isn't legible from the digest the DM reads; accepted
  payload shapes aren't echoed anywhere the model sees.
- **Intended fix:** align field names with the digest's vocabulary (accept `faction` as an alias for
  `clockId`; accept `epithet` as an alias for `text`; accept `name`/`text` aliases for `what`; accept
  `note` on codex_update), and/or publish the accepted event shapes into the digest or a contract stub
  so the DM can self-correct. Consider warning on a no-op instead of swallowing it silently.
- **Probe:** BUG-06a, BUG-06b, BUG-06c, BUG-06d (all built + ○ resolved).

### BUG-07 · MED · `distant_word` ignores DM-supplied text
- **RULED WAI 2026-07-05 (Root B):** anti-invention by design — the distortion lens binds to a REAL
  ledger fact (`distantWordRoll` reads no opts; EVENT-CONTRACT documents the payload as `{}`). A supplied
  `text` now warns + drift-ledgers (never silently vanishes). Probe stays PRESENT by design; its detail
  documents the ruling.
- **Symptom:** the DM authored a specific rumor to seed the next session; the engine dropped it and
  rolled its own ambient rumor instead.
- **Root cause:** the `distant_word` handler rolls from its table and ignores `payload.text` — BY DESIGN.
- **Probe:** BUG-07 (stays ● PRESENT — WAI).

### BUG-08 · MED · nat 20/1 on a branched roll leaves `w.dm.rollReq` set  *(Run 2)*
- **FIXED 2026-07-05 — branch `fix/event-source-enum`: all three live-flow fall-through sites (`dmRollFor`'s nat20/1 else, `resolveBranch`'s missing-branch fallback, `dmRollDice`) now clear `w.dm.rollReq`. `verify-roll-branches.mjs` block 3b (sendTurn stubbed so the clear is mutation-sensitive) + probe BUG-08 both ○ resolved. The `w.dm.pendingRoll` persistence half stays queued (a separate observability feature).**
- **Symptom:** a nat 20 / nat 1 against a `rollRequest.branches` correctly falls through to the live
  two-turn flow (crit-magnitude needs the live lens turn) — but the persisted request lingers and can
  **re-fire the roll** on the next render / roll call.
- **Root cause:** `dmRollFor`'s fall-through path (src/world/dm.js:733-735) clears only `GS.dm.rollReq`
  (line 701); it never clears `w.dm.rollReq`. `resolveBranch` (the natural-2–19 path) DOES clear both
  (line 766, with a comment that render.js re-hydration would otherwise re-fire) — the fall-through is
  missing that same clear. Confirmed in Run 2: after the fall-through, `state.json` still held the full
  branched `w.dm.rollReq`, and a subsequent `roll` re-consumed it.
- **Intended fix:** the nat20/1 fall-through must also clear `w.dm.rollReq` (mirror resolveBranch:766).
- **Also (harness/observability):** the fall-through's rolled total lives only in the ephemeral
  `__pendingRoll` printed to stdout — it is never persisted to `U`/`GS`, so a stateless per-process
  harness that doesn't capture that stdout loses the die (and its crit/fumble spike). Persist the
  fall-through roll into `w.dm.pendingRoll` so it survives a process boundary.
- **Probe:** BUG-08 (built + ○ resolved).

### (minor, no probe) — codex hygiene: duplicate NPC records  *(Run 2)*
- Maddan Strole exists under two ids — `npc:maddan-strole` (contacted/known in play) and a roster twin
  `npc:maddan-strole-the-netmender` (soft/unknown, from Run-1 prep). Same NPC, split identity; a
  memoryless DM sees them as two people in the roster. Likely a prep-mint vs play-mint collision.
  Intended fix: de-dup / alias-merge on `codex_contact` (the play-mint should merge the prep twin).

### (minor, no probe) — DM output hygiene, observed once
- The DM occasionally emitted **flat event envelopes** (`{type, what}`) instead of
  `{type, payload:{…}, source}` — they no-op'd until the contract was spelled out in the brief. Ties
  to BUG-06 (contract discoverability). One `codex_add` name came through **HTML-escaped**
  (`Str&gt;`), corrected on apply. Both are seat/brief-quality issues, not engine bugs — but a bridge
  that *hoisted stray top-level keys into payload* (or warned) would be more forgiving.

### Adversarial run (2026-07-05) — "Rennick Fool" griefer stress test  *(new PC)*

A fresh Human Bard PC (Rennick Fool) played 10 turns as a deliberate griefer — OOC/fourth-wall jabs,
soft-lock attempts, exploit demands (infinite gold, instant level-up, re-rolls), a plot-NPC murder, and
a direct request to leak the hidden front-truth. **Engine + DM survived intact** (no soft-lock, no throw,
no state corruption; every hard agency rule held). Two new engine faults surfaced by the deliberate probes:

### BUG-14 · MED · `codex_add` (id-less) silently merges onto a SOFT/unknown established record
- An id-less `codex_add` by the *name* of an existing **prep-cast** NPC overwrites that record's fields
  with **no refusal and no `drift` ledger line**. Repro: Turn 9 — `codex_add {kind:"npc",
  name:"Nedokht Roshyar", fields:{role:"bakery god…"}}` stamped a false `role` onto the soft/unknown
  `npc:nedokht-roshyar`. Root C's collision guard only refuses `known || hard` records, so the entire
  ~12-entity **prep roster stays silently overwritable** — the *inverse direction* of RV-3 and the
  un-closed half of the BUG-11 / F-07 class. Cross-ref **BUG-11**, **RV-3**.
- Intended fix: extend the id-collision guard to soft/unknown records too — a name-match against any
  existing record (prep-mint included) refuses-or-warns rather than silently merging.

### BUG-15 · LOW · a blank `fact_canonized` still grants XP
- A `fact_canonized` whose text doesn't resolve (here a malformed flat `{type,what}` envelope → ledger
  "Canon fact recorded: ?") still fires the **+1 XP** beat. Repro: Turn 9 — two blank canon facts,
  xp 1→3. Ties to the BUG-06 flat-envelope hygiene note (content dropped); the *XP-for-nothing* is the
  new bit. Fix: gate the XP beat on a fact that actually resolved to text.

### (seat-discipline note, no probe) — atmospheric paraphrase can leak a `dmOnly` term
- Turn 6 narration used "the contagion of remembering" — surfacing the `dmOnly` noun **"contagion"**
  decontextualized to the player. Not a mechanic leak (the spread system stayed hidden) and it happened
  on the session's *best* beat (the reach that made it great is what nicked the seal). Seat-quality flag,
  not an engine bug: the prompt could warn against echoing exact hidden nouns in ambient prose.

### BUG-16 · MED · `condition_add` prompt↔engine field mismatch — condition silently dropped  *(Rennick Run 2)*
- The production `DM-SEAT-PROMPT.md` documents the field as **`cond`** (`condition_add
  {payload:{cond:"grappled"}}`, line 82), but the engine's accept map reads **`condition`**
  (`src/world/dm.js:1261`). A DM that follows the prompt verbatim → a **payload-drift ledger line + the
  condition is silently NOT applied** (Run 2 T12: `cond:"prone"` dropped, PC never set prone) — and it
  burns a `recentLedger` slot on the drift line. This is the **BUG-06-class contract gap that Root-B's
  alias-fold missed**. Fix EITHER: correct the prompt to `condition`, OR add `cond → condition` to
  `DM_EVENT_FIELDS`. Code-verified. Cross-ref **BUG-06**, Root B.
- **(minor, no probe) — no PC-name collision guard on `codex_add`** (Run 2 T13): minting a codex NPC
  named after the PC ("Rennick Fool") succeeded — a memoryless DM would read it as a person distinct
  from the player (real PC is safe in `w.characters`). Identity-confusion vector, distinct from BUG-14.
- **Re-triggered on purpose in Run 2:** BUG-14 (soft prep record silently overwritten; the boundary is
  exact — `soft:true` merges, `soft:false`/hard correctly refuse with `id-collision`), BUG-15 (blank
  `fact_canonized` still +1 XP), BUG-02 (a full narrated night passed, `w.clock` frozen at Day 1 06:00).
  BUG-08 did **not** recur (rollReq cleared from both `w.dm` and `gs.dm` — fix holding).

### BUG-17 · MED→HIGH · `attitude_shift` doubly broken vs its own seat prompt — attitude can never move  *(Rennick Run 3)*
- **FIXED 2026-07-07 — branch `fix/social-spine-fixes` (SOCIAL-SPINE-FIXES §S1); probe flipped ○ resolved.**
- A DM following `DM-SEAT-PROMPT.md` verbatim **can never shift an NPC's attitude**, two independent
  faults stacked: **(a) field drift** — prompt says `id`, the handler reads `target` → a verbatim `id`
  no-ops (drift line). **(b) value-type drift** — prompt says a string (`"friendly|neutral|hostile"`)
  but `codexSetAttitude` needs an **int −2…2**, and `Number("hostile")||0 → 0`, so even with the right
  field `to:"hostile"` resolves to "Indifferent→Indifferent." This is why NPC **attitude never moved
  across Runs 1–3** despite the fiction demanding it (e.g. the Watch-Sergeant should have flipped hostile
  after a Dominate). Code-verified. Same BUG-16 contract-drift class, but on the **social spine** — raises
  severity. Fix: align prompt↔handler on both the field name (`id`↔`target`) and the value type
  (string↔int, or map the strings in the handler). Cross-ref **BUG-16**, and the attitude/parley system
  in [[project-genesis-antidrift-mechanics]].
- **(minor) `concentration_broken {spell}` field drift** — handler reads only `cause`; the `spell` key is
  dropped + burns a `recentLedger` slot on the drift line. Same class.
- **(visibility) digest omits `cantrips`/`spells` from the pc block** — a memoryless bridge DM can't see
  the PC's known-spell list, so it can't verify spell knowledge before adjudicating a cast (pairs with the
  caster-discoverability note below).

### ✔ NOT a bug — the spell-slot economy is fully built + enforced  *(Rennick Run 3, verified)*
- **CLOSED — SOCIAL-SPINE-FIXES S3.** Digest now ships `pc.cantrips`/`pc.spells` (sparse, deduped
  w/ feat picks); the seat prompt now documents `cast`/`slot_spent` + slot-refusal semantics.
Confirmed live over 10 turns of a L10 Bard: `cast {spell, level}` → `spendSlot` decrements `sh.slots`
(L1 4→0, L5 2→0, etc.); an empty pool **refuses** (`no-slot` + ledger); the slot **ceiling** is enforced
(no 6th/7th for an L10 Bard → Mass Suggestion / upcast unpayable); **cantrips are free** (Vicious Mockery
left slots untouched); concentration is tracked in state, auto-drops on recast, breaks on damage +
duration. **The only gap is DISCOVERABILITY, not enforcement:** `DM-SEAT-PROMPT.md` doesn't document
`cast`/`slot_spent`, and the digest ships slot *counts* but not the *known-spell list* — so a memoryless
bridge DM would likely never emit `cast` (silently never decrementing) and can't verify spell knowledge.
**Highest-value caster fix = teach the seat prompt the `cast` event + surface the spell list in the digest.**

### BUG-18 · MED · `social_check` re-grades the total against the ENGINE's internal DC, not the DM's fiction DC  *(Rennick Run 4)*
- **FIXED 2026-07-07 — branch `fix/social-spine-fixes` (SOCIAL-SPINE-FIXES §S2); probe flipped ○ resolved.**
- `social_check` re-grades the raw roll total against the engine's *internal* attitude-DC (`socialDC(a.value)`,
  dm.js:2507), which is **decoupled from the fiction DC the DM narrated**. Run 4 T6: the DM narrated a
  near-miss (Persuasion 18 vs a fiction DC 20 = −2 → the sergeant refuses), but the emitted `social_check`
  graded 18 against `socialDC(Friendly)` and **promoted him Friendly→Helpful ("ask granted")** — so the
  persisted `status.attitude.value` now **contradicts the narrated die**. Repro: emit `social_check` with a
  raw total that clears the internal `socialDC` on a beat narrated as a miss. Category: contract/seam.
  Fix: don't emit `social_check` on a narrated near-miss/fail, OR thread the fiction DC into the resolver so
  the mechanical grade matches the narrated one. This is the **mirror image of BUG-17** — where
  `attitude_shift` can NEVER move attitude, `social_check` moves it against the *wrong* DC. **Silver lining:**
  Run 4 proves `social_check` IS the working attitude-persistence path (`status.attitude.value` persists) —
  so the attitude/parley spine works, the two events just need their DC/field contracts aligned.
  Cross-ref **BUG-17**, [[project-genesis-antidrift-mechanics]].

### CAL-1 · DM lethality calibration — a FAILED save vs a suicide mind-control order should land (kill)  *(Adam ruling, 2026-07-05)*
- Run 3: Rennick dominated the Watch-Sergeant and ordered self-harm. The DM correctly granted the fresh
  advantage-save Dominate requires — but then, on the **failed** save, narrated the outcome away anyway
  (*"a body will not open its own throat on a stranger's word"*). **Adam's ruling: that failed save should
  have probably taken the target OUT.** The save is the mechanic's teeth; layering a *second*, fictional
  "the body refuses" on top of a failed mechanical save neuters the whole degrees-of-failure +
  hard-and-dangerous doctrine (`feedback-genesis-hard-and-dangerous`, `feedback-genesis-degrees-of-failure`).
- **Intended behavior:** the SAVE is the mercy, not the narration after it. On a failed save the harmful
  order **lands** — lethally when that's the order. Seat-prompt guidance: don't grant an extra fictional
  out once the mechanical save has already failed.
- **Scope note (RAW):** 5e Dominate is murky on forcing obviously-self-destructive acts; this is a Genesis
  *calibration ruling*, deliberately harder than the softest RAW read — on-doctrine for hard-and-dangerous.

### ⏸ PARKED (Adam, 2026-07-05) — global spice/lethality increase, across the board?
- Open question Adam raised off CAL-1: does the too-soft failed-save mean **spice/lethality should be
  raised across the board**, not just on this one ruling? **Explicitly deferred — not decided, parked for a
  later design talk. Do not act on it.**

---

## Fable bug-class sweep (2026-07-05) — same-class hunt off the Run-2 findings

Two background executors swept the codebase for bugs of the same CLASS as Run 2's (source-enum
rejection, payload field-name drift, codex identity/collision); **Fable adjudicated** — verifying every
load-bearing claim against the code, cutting false positives, ranking survivors. **7 confirmed NEW
findings + 3 re-confirmed.** All are FUTURE fixes (not building now); every line below was code-verified.

### ⚑ BUG-09 · CRITICAL · every manual player-action button is dead code (same root as BUG-01)
- **FIXED 2026-07-05 — branch `fix/event-source-enum` (Root A); new BUG-09 probe flipped ○ resolved.** The same `DM_EVENT_SOURCES` allow-list admits `source:"player"`, so all 7 buttons (inventory ×6 + the level-up claim) now apply.
- **Symptom:** the **entire inventory panel** (Equip/Stow/Grip/Attune/Release/Use) **and the level-up
  "⬆ Come into your power" button** do nothing. Equip toasts "Can't equip X (invalid-envelope)";
  Stow/Release fail with no feedback at all; the level-up banner just persists.
- **Root cause:** all seven handlers stamp `source:"player"`, which `validateEvent` (dm.js:1224) rejects
  (allows only `null`/`detected`/`declared`) → `applyEvent` no-ops before the switch. **Exact same root
  as BUG-01** (`source:"branch"`), just a different out-of-enum value.
- **Sites:** `src/world/inventory.js:27,34,40,49,56,64` (the six item actions; onclicks wired
  render.js:1574-1583) and **`src/creator/levelup.js:146`** (`claimLevelUp` stamps `level_applied`
  `source:"player"`; button render.js:1466). *Both executors caught the inventory six; both MISSED the
  level-up button — Fable found it.* Leveling still works via the rest-gate path (play.js:396 stamps
  `"detected"`), so the BG3-style **instant level-claim Adam wanted is the broken half**.
- **Fix:** see Root A below — one allow-list line fixes BUG-01 + all 7 buttons at once. **Hotfix
  candidate** (player-facing, and the fix is trivial + low-risk).
- **Probe:** `dev/playtest-bug-probes.mjs` — BUG-09 (equip + level_applied both source:"player", asserts sheet mutation) + the standing ROOT-A enum-drift guard.

### BUG-10 · HIGH · `clock_advanced` silently no-ops on the digest's own key name
- **FIXED 2026-07-05 — branch `fix/event-source-enum` (Root B): the digest now ships `powers[].clockId` / `fronts[].clockId` (renamed from `id`), AND `id→clockId` is a `DM_EVENT_FIELDS` handler alias — closed both ways. Probe BUG-10 ○ resolved.**
- The digest names the clock key `id` (`powers[].id`/`fronts[].id`, dm.js:315,319) but the handler reads
  `payload.clockId` (dm.js:2508). A DM copying the digest's `id` → `findClockTarget(w,undefined)` → the
  **untracked branch returns `{ok:true, untracked:true}`** + a plausible ledger line: the clock never
  moves and the DM sees success. The *values* already match (`id` = `slug(name)` = what findClockTarget
  matches, 805-816) — the mismatch is purely the key name, so the fix is shallow: accept `id` as an
  alias for `clockId`, or rename the digest key to `clockId`. **Probe:** TODO.

### BUG-11 · HIGH · `codex_add` silently merges onto an existing id — no distinct-record guard (F-07 root)
- **FIXED 2026-07-05 — branch `fix/event-source-enum` (Root C): the `codex_add` case now REFUSES an id-less mint whose derived id lands on an ESTABLISHED record (known or hard) — `{ok:false, reason:"id-collision", existing:{…}}`, never a silent merge; soft+unknown records still merge; `codexAdd` itself drift-ledgers any content-bearing merge onto an established record (every direct caller inherits it). Probe BUG-11 ○ resolved.**
- The `codex_add` case calls `codexAdd(w,p)` directly (dm.js:2322-24). An omitted id derives
  `codexKeyId(kind,name)`; if that id already exists, `codexAdd` (codex.js:66-92) **`Object.assign`-merges
  onto the existing record with no known/hard check and no ledger/warn** — so a warm DM minting a *new*
  "Ospra" silently overwrites the established tanner (the F-07 collision). Prep de-collides via
  `prepCastId` (prep.js:153-157); the DM seam does not. **Fix = Root C.** **Probe:** TODO.

### Lower-severity confirmed (Fable-verified)
- **BUG-12 · MED — `gift` codex half no-ops on natural field names.** *(FIXED 2026-07-05, Root B: aliases `to→target`, `item→what`; `gift` row added to EVENT-CONTRACT.md. Probe BUG-12 ○ resolved.)* Reads `p.target`/`p.given`/`p.what`
  (dm.js:2646-56); a `{to,item}` payload moves renown but silently skips the NPC gift-memory. `gift`
  isn't in EVENT-CONTRACT.md's table. Fix: alias `to→target` (Root B).
- **BUG-08 residual — DOWNGRADED to MED.** The nat20/1 fall-through desync is masked in production
  (`sendTurn` clears `w.dm.rollReq` at dm.js:410 before its render at 418); real window = a throw between
  dm.js:701 and 410, plus harness/process-boundary contexts (where Run 2 empirically hit it).
  `dmSend`/`dmRollDice` share the shape. One-line hardening still worth it (clear `w.dm.rollReq` at 701).
- **BUG-13 · LOW — `codexUpdate` on a missing id → bare `{ok:false}`**, no reason, no ledger
  (dm.js:2332 → codex.js:127). Return `{ok:false,reason:"no-record:"+id}`. *(FIXED 2026-07-05, Root C: the `codex_update` case returns `{ok:false, reason:"no-record:<id>"}`; probe BUG-13 ○ resolved.)*
- **F-04 mechanism confirmed** — `prepNameTaken` is exact-slug only (prep.js:164-168), so "Maddan
  Strole" vs "Maddan Strole the Netmender" mint two full records (the duplicate twins). *(2026-07-05: fuzzy near-name matching ruled a FOLLOW-UP — needs its own containment spec, per SPEC-roots-bc §2.1d; built nothing here.)*
- **Clock-family key split (LOW)** — `front_closed` accepts `ledgerId||frontId` (2552) but
  `clock_advanced`/`clock_fired` accept only `clockId` — the inconsistency teaches the DM wrong. *(CLOSED 2026-07-05, Root B: `front_closed` aliases `clockId/id→ledgerId` + the digest ships `clockId` — the DM can copy any digest clock key into any clock-family event and it lands.)*

### Cut / downgraded by Fable (so they don't get re-reported)
- **distant_word dropping `payload.text` — CUT as a handler bug.** EVENT-CONTRACT.md:115 documents the
  payload as `{}`; the engine rolling the rumor is the anti-invention design, not drift (covered by
  Root B's warn-on-ignored-fields).
- **condition `{cond}` — CUT.** Fails LOUD (`{ok:false,reason}`), not silent.
- **Executor claim that gen mints route through `prepCastId` — WRONG** (the gen mint dm.js:623 calls
  `codexAdd` directly); a gen name colliding with a *known* record has the same F-07 exposure
  (PLAUSIBLE, not traced).

### The 3 roots + the amplifier (fix in this order)
1. **☑ Root A — source-enum drift — LANDED 2026-07-05 (`fix/event-source-enum`).** Replaced `validateEvent`'s
   hard-coded `{null,"detected","declared"}` with the `DM_EVENT_SOURCES` allow-list (`detected`/`declared`/
   `player`/`branch`; garbage still fails loud). **One line killed BUG-01 + all 7 dead buttons (BUG-09);**
   the weak-form mutation guard (`applyMutates` in the probes + applied-ok checks in verify-roll-branches)
   closes the observability gap that hid the class.
2. **☑ Root B — payload vocabulary drift + no-warn-on-ignored-keys — LANDED 2026-07-05 (`fix/event-source-enum`).** A declarative per-event accepted+alias
   map (`DM_EVENT_FIELDS`) folded once after `validateEvent` (`dmFoldPayload`): `id→clockId`, `text→what`,
   `to→target`, etc.; `note` accepted on `codex_update` and APPENDS to `dm.notes[]` (append, not assign);
   unknown keys still apply but `console.warn` + one `drift` ledger line (`kind:"payload-drift"`); the
   digest clock key renamed `id→clockId`. EVENT-CONTRACT.md corrected against the map. Probes BUG-06a/b/c/d,
   BUG-10, BUG-12 ○ resolved; ROOT-B guard ✓ OK.
3. **☑ Root C — codex identity — LANDED 2026-07-05 (`fix/event-source-enum`).** At the `codex_add` case, an
   id-less mint whose derived id resolves to an established (known/hard) record returns
   `{ok:false,reason:"id-collision",existing}` (never a silent merge); soft+unknown records still merge;
   `codexAdd` emits a `drift` ledger line on ANY content-bearing merge into an established record (every
   direct caller — urban.js, job-walks.js, capture.js, region.js, the gen mint dm.js:623 — inherits it);
   `codex_update` on a missing id returns `{ok:false,reason:"no-record:<id>"}`. Probes BUG-11, BUG-13 ○ resolved.
   *(F-04 fuzzy near-name matching = a queued follow-up, its own containment spec.)*
- **Amplifier — observability (why NONE of these had failing tests).** Every failure returns `{ok:false}`
  (read as an ordinary refusal) or `{ok:true,untracked:true}` (read as success). **The one harness check
  that catches most of the class:** after each scripted turn, assert zero `applyEvent` results with
  `ok:false` or a degradation flag (`untracked`/`unknownType`/empty-merge). Stronger variant (also catches
  BUG-06c note-drop + BUG-11 silent merge, which return `ok:true`): diff the mutated slice of `U`
  before/after and fail any mutating event type that produced a zero diff. Land the weak form with Root A.

*(Aside, out of class: `GS.combat` has no `w` mirror at all → mid-fight state is lost on reload. A
durability gap, not a desync — separate ledger item.)*

### Fable review follow-ups (2026-07-05, post-merge of `fix/event-source-enum`)
An adversarial Fable code-review of the merged fix confirmed it **safe as-merged, no correctness
regression, no must-fix** (alias scoping is real/per-type, no in-place payload mutation, zero census
noise on hot-path events — all independently verified). Five non-blocking follow-ups, logged (Adam:
*log all, fix none*):
- **RV-1 · MED — codex refusals are invisible to the DM.** Root C correctly REFUSES an id-less
  `codex_add` that collides with an established record (`{ok:false,reason:"id-collision",existing}`) —
  but no consumer surfaces it (not `dmDigest`, not the ledger; the refusal returns before `codexAdd` so
  even the merge-drift line never fires). A DM emitting an id-less `codex_add {name,fields}` to *enrich*
  an existing record silently no-ops. Strictly better than the old silent *overwrite*, but the code's
  "one-turn self-correction" is unwired. Fix: surface last-turn refusals (`ok:false`+reason) in the next
  digest, or drift-ledger the refusal — so the DM learns to use `codex_update`. (dm.js:2461-2464,2474)
- **RV-3 · MED-LOW — DM mints are hard-from-birth** (`soft:(rec.provenance!=="authored")`, provenance
  defaults `"authored"`; nothing makes the DM send provenance), so the "soft+unknown still merge" escape
  never applies to the DM's own records → *any* id-less re-add by name refuses, even for an unmet NPC.
  Compounds RV-1. Fix: default the `codex_add` event case's payload provenance to a soft value, or key
  the collision guard on `known||contacted` rather than `soft===false`. (codex.js:104, dm.js:2461)
- **RV-4 · MED (pre-existing, not this change) — `genApply`'s direct `codexAdd` can merge onto AND
  re-soften an established record** (`status:{soft:true}` flat-assigned at codex.js:92 flips a hard
  record soft-ward, unlocking canon). The F-07 class is closed at the event door only. Fix: in
  `codexAdd`'s merge path, never assign `soft` true-ward on a hard record (one-line clamp). (dm.js:624,
  codex.js:87-92)
- **RV-2 · LOW — `clock_fired`'s `by→delta` alias is dead AND launders the key past the drift guard**
  (fold `return`s on an aliased key before the accept check; `clock_fired` never reads `delta`) — a
  silent drop inside the anti-silent-drop mechanism. Fix: delete `by:"delta"` from clock_fired's alias,
  or run alias *targets* through the accept check. (dm.js:1286,1330)
- **RV-5 · LOW — census gap: `recruit_creature` accept list omits `spellcasterRole`** (read by
  `promoteSidekick`, companions.js:334ff) → a legit field triggers a spurious warn + a canon `drift`
  ledger line (eats a `recentLedger` slot). Fix: add `"spellcasterRole"` to the accept row. (dm.js:1300)

---

## 2026-07-12 — Stage-C visual pass observations (SPRITE LANE — Codex's active domain)

Caught by Adam watching a live Stage-C dungeon render (the diorama is reading well; these are the
remaining sprite-quality snags). **Both belong to the sprite pipeline (Codex's active lane), NOT the
Stage-C / room-geometry lane.** Noted here per Adam's routing; fix in coordination with that lane.

### BUG-14 · MED · sprite slices carry debris from neighboring sheet sprites
Some cut sprites (`assets/sprites/<slug>.png`) include a sliver of the adjacent sprite from the source
sheet. **Root:** `build/slice-sprites.py` finds sprites by connected-components, then crops each to its
bbox **+ 4px `padding`** (`crop_transparent`, :265-272) and merges boxes within a gap threshold
(`bbox_distance`, :146/:212). When two sprites sit close on the sheet, the padding overshoots into the
neighbor, or the merge bridges them → a slice grabs neighbor pixels. **Fix:** tighten per-cell
isolation — clip each crop to its own grid cell (the manifest already knows the cell grid), and/or
reduce padding / raise the merge gap — then **re-slice the affected sheets** + regen the registry.
Claude-actionable (a build-script change), but collides with the sprite lane's uncommitted
slicer/registry work — serialize.

### BUG-15 · MED · sprites render at low resolution in-engine (crusty)
Standee billboards read blocky/soft in the interior. **Root is NOT the render filter** — billboards
deliberately use `NearestFilter` + no mipmaps (the crisp PS1 choice, theater-boot.js:834/889). It's
that the **source sprites were cut at low pixel resolution** (25-per-sheet cells → small textures),
which NearestFilter then hard-upscales onto a large on-screen plane. This is the known "crusty
mediums" / "under-res at 25/sheet" issue. **Real fix = higher-resolution source generation** (the
XL/titan-regen pattern: fewer sprites per sheet, bigger cells) → re-slice → re-register — needs Adam's
ImageGen codex window, not a code change. Possible minor render-side contributor: the billboard
square-plane aspect stretch (CHANGELOG Deferred) — worth a quick theater-boot check but it won't fix
the fundamental softness. Related: [[project-genesis-sprite-gen-v2]], `docs/SPRITE-GEN-V2.md` §10,
`dev/sprite-manifests/XL-REGEN-PROMPTS.md`.

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

### RIG-2 · LATER (deprioritized) · battlemap screenshots during playtest
- **Intent (Adam, 2026-07-05):** when a fight happens in a playtest, render the theater and screenshot
  it — see how the board assembles (floors, props, figures) with the new whole-object models.
- **Deprioritized same day (Adam):** the value gate is *"can it run in the code session and drop into
  the editorial report?"* — this can't (see Caveat: the theater is WebGL, so it forces a real browser).
  So it **waits until we want the visuals badly enough**; **text-only editorial reports are the default**
  for playtests until then. Kept here (not dropped) because the path is real and cheap-ish when we do it.
- **Feasibility: YES, mostly wiring existing parts.** The jsdom harness can't render (theater is real
  three.js/WebGL), but: (1) `theaterBoardFrom(segment,scene,opts)` + `theaterUnitsFrom(combat)`
  (src/engine/theater-data.js) are **pure-data descriptor builders** — jsdom-safe, and the exact payload
  `src/world/render.js` feeds `window.Theater.setBoard/setUnits`; (2) `dev/model-qa/capture.mjs` already
  does **headless WebGL capture** via puppeteer-core → system Chrome (SwiftShader fallback, texture-warm,
  blank-canvas detection) and its `round1b` already shoots textured board+prop scenes.
- **Path:** harness runs combat → emits `theaterBoardFrom`/`theaterUnitsFrom` JSON → a capture page
  (extend `dev/model-lineup.html`'s SCENES fixture or `dev/theater-preview.html`) calls
  `window.Theater.setBoard/setUnits` → a `capture.mjs`-style driver screenshots the canvas → one PNG per
  round. ~a day.
- **Caveat:** needs a real Chrome + localhost server — **won't run inside a sandboxed agent session**
  (this session's sandbox couldn't serve localhost or reach Chrome); runs on Adam's machine.

---

## How these were found

Bridgeless Layer-1 playtest: two sealed Sonnet seats (Player + DM) played a full session through the
real engine loaded headless in jsdom (`dev/playtest-bridgeless.mjs`), Opus as clerk/analyst. The
mechanical gauntlet (Layer 0) can't catch any of BUG-01…07 because it never calls a model — exactly
the layer separation `docs/AUTOMATED-PLAYTEST.md` predicts. Session report + full recap:
the "Shimmering Maw" artifact.
