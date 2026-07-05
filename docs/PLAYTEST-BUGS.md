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
- **Probe:** BUG-06a, BUG-06b. *(06c/06d: probes TODO — not built, per no-build directive.)*

### BUG-07 · MED · `distant_word` ignores DM-supplied text
- **Symptom:** the DM authored a specific rumor to seed the next session; the engine dropped it and
  rolled its own ambient rumor instead.
- **Root cause:** the `distant_word` handler rolls from its table and ignores `payload.text`.
- **Intended fix:** use `payload.text` when supplied; fall back to the roll only when it's absent.
- **Probe:** BUG-07.

### BUG-08 · MED · nat 20/1 on a branched roll leaves `w.dm.rollReq` set  *(Run 2)*
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
- **Probe:** TODO (not built, per no-build directive).

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
- The digest names the clock key `id` (`powers[].id`/`fronts[].id`, dm.js:315,319) but the handler reads
  `payload.clockId` (dm.js:2508). A DM copying the digest's `id` → `findClockTarget(w,undefined)` → the
  **untracked branch returns `{ok:true, untracked:true}`** + a plausible ledger line: the clock never
  moves and the DM sees success. The *values* already match (`id` = `slug(name)` = what findClockTarget
  matches, 805-816) — the mismatch is purely the key name, so the fix is shallow: accept `id` as an
  alias for `clockId`, or rename the digest key to `clockId`. **Probe:** TODO.

### BUG-11 · HIGH · `codex_add` silently merges onto an existing id — no distinct-record guard (F-07 root)
- The `codex_add` case calls `codexAdd(w,p)` directly (dm.js:2322-24). An omitted id derives
  `codexKeyId(kind,name)`; if that id already exists, `codexAdd` (codex.js:66-92) **`Object.assign`-merges
  onto the existing record with no known/hard check and no ledger/warn** — so a warm DM minting a *new*
  "Ospra" silently overwrites the established tanner (the F-07 collision). Prep de-collides via
  `prepCastId` (prep.js:153-157); the DM seam does not. **Fix = Root C.** **Probe:** TODO.

### Lower-severity confirmed (Fable-verified)
- **BUG-12 · MED — `gift` codex half no-ops on natural field names.** Reads `p.target`/`p.given`/`p.what`
  (dm.js:2646-56); a `{to,item}` payload moves renown but silently skips the NPC gift-memory. `gift`
  isn't in EVENT-CONTRACT.md's table. Fix: alias `to→target` (Root B).
- **BUG-08 residual — DOWNGRADED to MED.** The nat20/1 fall-through desync is masked in production
  (`sendTurn` clears `w.dm.rollReq` at dm.js:410 before its render at 418); real window = a throw between
  dm.js:701 and 410, plus harness/process-boundary contexts (where Run 2 empirically hit it).
  `dmSend`/`dmRollDice` share the shape. One-line hardening still worth it (clear `w.dm.rollReq` at 701).
- **BUG-13 · LOW — `codexUpdate` on a missing id → bare `{ok:false}`**, no reason, no ledger
  (dm.js:2332 → codex.js:127). Return `{ok:false,reason:"no-record:"+id}`.
- **F-04 mechanism confirmed** — `prepNameTaken` is exact-slug only (prep.js:164-168), so "Maddan
  Strole" vs "Maddan Strole the Netmender" mint two full records (the duplicate twins).
- **Clock-family key split (LOW)** — `front_closed` accepts `ledgerId||frontId` (2552) but
  `clock_advanced`/`clock_fired` accept only `clockId` — the inconsistency teaches the DM wrong.

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
2. **Root B — payload vocabulary drift + no-warn-on-ignored-keys.** A declarative per-event accepted+alias
   map folded after `validateEvent` (`id→clockId`, `text→what`, `note→fields.note` (or append
   `dm.notes[]`), `to→target`); `console.warn` + a drift-ledger line on any unconsumed payload key; rename
   the digest clock key `id→clockId`. Also regenerate/anti-drift-check EVENT-CONTRACT.md against the map
   (the doc itself mis-teaches: fact_canonized `{factId}` vs real `what`; discovery missing `makeNode`).
3. **Root C — codex identity.** At the `codex_add` case, a fresh mint whose derived id resolves to an
   existing known/hard record routes through `prepCastId` disambiguation (or returns
   `{ok:false,reason:"id-collision",existing}`); emit a `drift` ledger line on ANY merge into a known
   record (put it in `codexAdd` so every direct caller — urban.js, job-walks.js, capture.js, region.js,
   the gen mint dm.js:623 — inherits it).
- **Amplifier — observability (why NONE of these had failing tests).** Every failure returns `{ok:false}`
  (read as an ordinary refusal) or `{ok:true,untracked:true}` (read as success). **The one harness check
  that catches most of the class:** after each scripted turn, assert zero `applyEvent` results with
  `ok:false` or a degradation flag (`untracked`/`unknownType`/empty-merge). Stronger variant (also catches
  BUG-06c note-drop + BUG-11 silent merge, which return `ok:true`): diff the mutated slice of `U`
  before/after and fail any mutating event type that produced a zero diff. Land the weak form with Root A.

*(Aside, out of class: `GS.combat` has no `w` mirror at all → mid-fight state is lost on reload. A
durability gap, not a desync — separate ledger item.)*

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
