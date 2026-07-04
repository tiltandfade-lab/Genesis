---
type: report
project: Genesis
status: ANALYSIS ONLY — no build in this unit; see spec-candidate sizes for follow-on work
updated: 2026-07-04
---

# PLAYTEST FINDINGS — 2026-07-04

**Scope.** Every `dev/playtest-*.jsonl` log on disk as of this branch, read in full:
`playtest-player-{rot1-attempt1,rot1-attempt2,shakedown-run1,shakedown-run2}.jsonl` +
`playtest-scribe-{rot1-attempt1,rot1-attempt2,rot1-reasonable,shakedown-run1,shakedown-run2}.jsonl`.
Cross-referenced against `docs/AUTOMATED-PLAYTEST.md` (the rig spec), `dev/playtest-findings-shakedown.md`
(the prior triage pass — shakedown only, pre-dates rot1), `docs/HANDOFF.md`, `docs/DIGEST-DIET.md`,
and the live source (`src/world/dm.js`, `src/world/render.js`, `src/world/play.js`).

This is the **Critic pass over rot1-attempt2** that HANDOFF's "Do next" item 2 has been waiting on,
folded together with a full re-read of the shakedown findings so nothing gets triaged twice. Analysis
only — nothing in `src/` or `data/` changes in this branch.

**Sessions covered:**

| log pair | persona | world | turns answered | how it ended |
|---|---|---|---|---|
| shakedown-run1 | reasonable | Fraying Bell of Vael (Wymar Brackett) | 1 (opening only) | crash: black-screen overlay never dismissed, turn 2 never posted |
| shakedown-run2 | reasonable | Old Tide (unnamed PC) | 5 | burn-gate stop (median latency 68.1s > 60s gate) |
| rot1-attempt1 | reasonable | Copper's Marsh (Manfred Carrow) | 3 (2 real + 1 duplicate-merge) | abandoned in favor of attempt2 after DM-side latency spike (386s) forced a player retry |
| rot1-attempt2 | reasonable | Copper's Marsh (Manfred Carrow) + 3 other cross-session worlds sharing the mailbox + 5 Saltmarsh fixtures | 27 total (13 on the Copper's Marsh main arc) | turn-14 DM disconnect ("No DM answered") — the DM-side agent stopped answering mid-session |
| rot1-reasonable (scribe only, no matching player log) | reasonable | — | 0 | halted at loop entry — coordinator's `dev/.playtest-stop` was already present |

---

## (a) Every distinct issue observed

### Issue 1 — Composer draft loss / submit-flakiness (confirmed 3x, still open)

**Severity: HIGH** (silent data loss on the player's primary input channel; happened in every
multi-turn session that ran long enough to hit it)

**Evidence:**
- **First incident** — `dev/playtest-findings-shakedown.md` SD-011 (shakedown-run2, 2026-07-03):
  "typed-but-unsent input can be orphaned when a DM reply lands and re-renders the input area."
  Filed 🎨/minor at the time — no repro count yet.
- **Second incident** — `dev/playtest-player-rot1-attempt2.jsonl` turn 11: "first attempt to submit
  this turn silently failed (click+type+Enter did not register, had to retype and click Send button
  explicitly) - possible UI flakiness worth flagging."
- **Third incident** — same file, turn 12: "second submit-flakiness incident this session (text typed
  but did not populate field on first attempt, had to retype+explicit-click Send both times) -
  flagging as a UI bug pattern."

**Root cause (grepped, not guessed):** `renderWorld()` in `src/world/render.js` unconditionally
rebuilds the entire DM panel's HTML on every call, including the composer:
```
src/world/render.js:222  const box=`<div class="dm-input"><textarea id="dmAction" rows="1" ...></textarea>...`
```
`renderWorld()` is invoked ~55 places across `src/world/*.js`, including from `applyResponse()`
(`src/world/dm.js:432`, comment: "ALWAYS re-render — the send button + any stale 'pending' chrome
must reflect GS.dm.pending=false") and from the reload-recovery path
(`src/world/render.js:240-242`, re-attaching `pollResponse` on a pending turn). Every one of these
calls replaces the live `<textarea id="dmAction">` DOM node wholesale. If the player types into the
box (or a browser-automation `fill` populates it) in the window between "the DM's prior reply is
about to land" and "the click/Enter fires", the incoming re-render silently swaps the textarea out
from under them — the typed text vanishes with no visible error, matching all three observed
incidents (each followed a long/slow DM turn: shakedown-run2's SD-011 context, and rot1-attempt2
turns 10-11 which closed a very long 170s exposition beat right before the flakiness hit).

**Spec candidate:** Preserve (and re-apply) the composer's in-flight draft across a `renderWorld()`
call. Two viable shapes, either is Sonnet-executable:
1. **Cheap guard (S):** in `renderWorld()`, before replacing `host.innerHTML`, snapshot
   `document.getElementById("dmAction")?.value` and re-apply it to the freshly rendered textarea
   (and restore cursor focus/position) after the swap. ~10 lines, one function
   (`src/world/render.js`, inside `renderWorld()` around line 231-320 where `host.innerHTML=...` is
   set).
2. **More robust (M):** stop tearing down the composer at all — extract the DM feed
   (`renderDMFeed`, defined above line 200) into its own sub-container that re-renders independently
   of the composer `<div class="dm-input">`, so a feed update never touches the input element's
   identity. Slightly larger diff across `renderWorld()` + `renderDMFeed()`'s call sites, but removes
   the whole failure class rather than papering over it.

Recommend size **S** first (matches SD-011's own suggestion — "a draft-preserving re-render would be
kinder") — it's a targeted, low-risk fix for a bug that has now bitten 3 times in ~35 total logged
turns, a high hit rate for something this disruptive (silent, no error, forces a retype).

### Issue 2 — Turn-14 DM-disconnect timeout: messaging is right, but the failure is a rig gap, not an app bug

**Severity: MEDIUM** (correct behavior, but the underlying cause — a DM agent going silent
mid-session — will recur in every future automated run unless the rig gets a watchdog)

**Evidence:** `dev/playtest-player-rot1-attempt2.jsonl` turn 14 (the last line): "CRITICAL: turn 14
timed out with system message: (No DM answered. The bridge is running, but a DM session needs to be
watching it - start one per docs/DM-BRIDGE.md, ideally on Sonnet for speed. Or use Copy world for the
clipboard hand-off.) - the DM-side agent that was answering turns 1-13 appears to have stopped/
disconnected partway through this session; bridge server itself still up per curl check."

**Analysis (grepped against `src/world/dm.js`):**
- `DM_POLL_TIMEOUT = 300000` (5 minutes, `src/world/dm.js:345`) — the client will long-poll
  (`DM_LONGPOLL_S = 25`s per cycle) for a full 5 minutes of wall-clock silence before giving up and
  calling `dmNoAnswer()` (line 369). That's a deliberately generous, correct choice for a real human
  DM composing a turn — this is NOT a premature-timeout bug.
- `dmNoAnswer()` writes exactly the message the player saw, clears `pendingTurnId` so a reload won't
  resume a dead turn, and — critically — still calls `renderWorld(); wakeReveal()` so **the player is
  never stranded behind the loading cinematic.** This is the right recovery contract: the message
  names the actual cause (no DM watching the mailbox), points at the runbook (`docs/DM-BRIDGE.md`),
  and offers the clipboard-handoff escape valve. Nothing to fix in the app here.
- The real gap is **upstream of the app**: the automated rig (`docs/AUTOMATED-PLAYTEST.md`) has no
  watchdog on the DM-side loop agent itself — when it silently stops (as it did here, mid-rotation,
  presumably session/token limits or an unhandled exception in the `/loop`), the player-side agent has
  no way to know except waiting out the 5-minute client timeout, which then ends the whole run instead
  of restarting the DM loop and continuing. This matches `docs/HANDOFF.md`'s existing framing of the
  rot1-attempt2 ending as "turn-14 DM disconnect" — already logged as the run's true ending, not
  previously root-caused.

**Spec candidate:** Not an app fix — a **rig hardening** item for `docs/AUTOMATED-PLAYTEST.md` / the
`genesis-playtest-rig` skill: add a DM-loop liveness check (e.g. the scribe or a coordinator process
polls whether the `/loop` is still consuming `.dm/turn-*.json` within some N-minute window) and
auto-restart it, OR at minimum have the coordinator flag "DM loop died" as a distinct rig-failure
mode (not a "playtest ended" mode) so the run gets resumed rather than scored as complete. Size **S**
(a watchdog script + a runbook note), lives in `dev/` alongside the existing rig scripts
(`dev/dm-bridge.py`, `dev/verify-bridge.py`) — not in `src/`.

### Issue 3 — Opening-turn digest violates the diet budget (confirmed 2x)

**Severity: MEDIUM** (cost/latency impact, not correctness — but compounds Issue 5 below)

**Evidence:**
- `dev/playtest-scribe-shakedown-run1.jsonl`: opening digest **30,920 bytes**, latency 77.4s.
  Scribe's own note: "digest 30920 > 15000 (DIGEST-DIET violated on the opening turn)... Opening
  digest shipped the FULL prep cast (24 codex records incl. dmOnly secrets for ~11 NPCs, 3 prep
  locations, plot items, art) = 30.9KB."
- `dev/playtest-scribe-shakedown-run2.jsonl`: opening digest **28,268 bytes**, latency 76.7s, then
  drops to a healthy 9,065B steady-state for turns 2-5 (median 9,065B — well under the diet's own
  <12KB target per `docs/DIGEST-DIET.md` line 131).
- `dev/playtest-scribe-rot1-attempt1.jsonl` turns 1-2: **22,610 bytes** each (same duplicate-merge
  pair described above) — a third opening-adjacent instance, though slightly under the other two.
- Already flagged once as SD-003 in the prior shakedown pass, still unresolved as of rot1 (rot1 never
  re-tested a truly fresh opening — attempt2's Copper's Marsh world had already opened in attempt1).

**Analysis:** `docs/DIGEST-DIET.md` is explicit that the two-tier rule (roster one-liners + full
records only for scene/minted) is the intended steady-state, and the steady-state numbers above prove
the diet mechanism works correctly once past the opening. The open question (already surfaced by the
prior shakedown scribe, never adjudicated) is whether the opening turn is *supposed* to be exempt
(full prep-cast ship for first-contact scene-setting) or whether it's a genuine diet leak that should
also apply the two-tier rule from turn 1.

**Spec candidate:** This is a **ruling**, not new engineering — Adam needs to call it (per
`docs/DIGEST-DIET.md`'s own two-tier design intent, the leak reading looks more consistent with the
spec than an intentional exemption). Once ruled, the fix is small: find where the opening's digest is
assembled (grep target: `dmDigest()` in `src/world/dm.js:288` builds `prepPending` via
`prepPendingDigest(w)` — the likely full-cast-shipping call site) and gate it behind the same
scene/minted-only filter the steady-state turns already use. Size **S** once the ruling lands.

### Issue 4 — TIYL/codex data-binding bugs surfaced during play (carried over from shakedown, not yet fixed)

**Severity: MEDIUM** (visible content bugs — species mismatch and a broken attitude inheritance —
that a real player would notice as immersion breaks)

**Evidence (both from `dev/playtest-findings-shakedown.md`, re-verified present, not yet fixed on
this branch — no matching commit found in `git log --all --grep`):**
- **SD-004:** `npc:eberk` is a Dwarf per its rolled species, but its TIYL description says "a elf
  sailor" (wrong species AND the article "a" instead of "an" — the TIYL text was generated without
  reading back the rolled species).
- **SD-005:** `npc:peter-coombe` is described by TIYL as "a former friend, now hostile" but ships
  with attitude value `0` ("Indifferent") — the attitude-initialization path doesn't read the TIYL
  relationship stance at all.

**Spec candidate:** Two small, independent data-binding fixes:
1. TIYL description generation needs to consume the already-rolled `species` field instead of
   re-deriving/guessing it (and fix the "a"/"an" article grammar while touching that code). Grep
   target: wherever `tiylDesc` is generated (search `tiylDesc` across `src/` — likely
   `src/world/codex.js` or a TIYL-specific module per the Codex phase docs). Size **S**.
2. Attitude initialization should read the TIYL-authored relationship stance (e.g. "hostile") into
   the numeric attitude scale instead of defaulting to Indifferent. Grep target: search
   `attitude` init alongside `codexOf`/NPC-minting code. Size **S**.

### Issue 5 — Response-latency: the LATENCY LAW target is being missed by a wide margin

**Severity: HIGH** (this is the standing binding law from the DM-Bridge project memory — "no launch
until routine turns ≤15s" — and every measured session is far outside it)

**Evidence — computed directly from the logs (see §(latency stats) below for the full table):**
Across all sessions with a numeric latency field (`respondedInSec` on the player logs,
`latencyS` on the scribe logs), **0 of 22 timed turns landed at or under 15 seconds.** Median across
every session combined is **~52s**, p90 **~162s**, worst case **386s** (rot1-attempt1 turn 1).

**Analysis:** This is not new information — `docs/AUTOMATED-PLAYTEST.md` and the DM-SEAT memory
already frame this as "loop tax, not model cost" (the scribe's own shakedown-run2 note: "Latency
floor is DM-side loop tax: even fast-lane turns cost 42-71s through Claude-Code tool round-trips
(read/compose/write/scribe). Bridge transport itself is instant. This is leg-3 evidence for
DM-SEAT"). The playtest data in this pass is a clean, reproducible confirmation of that finding
across two independent sessions (shakedown + rot1), not a new discovery — but it's worth stating
plainly as its own numbered finding because the raw numbers hadn't been aggregated across all logs
before this pass, and the gap to the ≤15s law is large enough (0/22, not "close but missing") that it
should stay a first-class tracked metric, not something that quietly falls out of the loop-tax framing.

**Spec candidate:** No new spec — this is the existing case for `docs/DM-SEAT.md` (the API-direct
in-app DM that removes the Claude-Code tool-round-trip tax entirely). This playtest pass adds
confirming evidence, not a new build item. Recommend: when DM-SEAT ships, re-run this exact
aggregation (this doc's §(latency stats) methodology) against a seat-mode session as the acceptance
check for the ≤15s law.

### Issue 6 — `prepPending` unserviced every turn (runbook/environment mismatch, carried over from shakedown as SD-006)

**Severity: LOW-MEDIUM** (degrades content depth, doesn't break anything; already flagged once)

**Evidence:** Every scribe note across shakedown-run1, shakedown-run2, and the full rot1-reasonable
session repeats the same line: "prepPending (reason no-overlays) could not be serviced: the runbook's
Workflow({scriptPath:'dev/prep-fanout.workflow.js'}) harness does not exist in a Claude Code DM
session; skipped silently per runbook." Confirmed as SD-006 in the prior shakedown pass; rot1's
summary line explicitly repeats it as still-standing: "ONE standing flag: prepPending unserviced
every Copper's Marsh turn — no Workflow tool in a plain Claude Code session (SD-006); un-reskinned
walks are the designed fallback and held fine."

**Analysis:** The fallback (un-reskinned walks) is explicitly designed and "held fine" per the
rot1 scribe — this is a depth/richness degradation, not a break. But it fires on literally every turn
across three separate sessions, which is a 100% reproduction rate for a documented runbook mismatch
that's cheap to fix.

**Spec candidate:** Either (a) fix the runbook (`docs/DM-BRIDGE.md`) to stop instructing the DM-loop
agent to call a `Workflow` tool that doesn't exist in a plain Claude Code session — replace with
whatever the actual available mechanism is (or explicitly say "skip prepPending in loop-DM mode, it's
a designed no-op"), or (b) actually build the `dev/prep-fanout.workflow.js` harness so the instruction
is real. (a) is trivially size **S** (a docs edit) and should land regardless of whether (b) ever
happens; (b) is a separate, larger build decision Adam should make explicitly (world-generation
richness vs. build cost), not one to default into here.

### Issue 7 — Cross-session mailbox turn interleaving (observed, not necessarily a bug — flag for awareness)

**Severity: LOW** (the rig handled it correctly; flagging because it's a structural risk worth naming)

**Evidence:** `dev/playtest-scribe-rot1-attempt2.jsonl` summary line 1: "27 turns answered across 4
worlds sharing the mailbox... Turns arrived heavily OUT OF ORDER; each answered from its own digest,
canonical openers given full establishing treatment when they surfaced." The DM successfully
disambiguated four concurrent world-sessions (Copper's Marsh, Old Tide, Fraying Bell of Vael, plus 5
Saltmarsh fixtures) sharing one mailbox, keeping each world's continuity straight (per-world digest
kept them correctly separated; scribe line 8 even caught and self-corrected a minor NPC-naming
divergence: "Beabella minted atoms differ from my earlier cookfire voicing — reconciling softly").

**Analysis:** This worked, but only because the DM was disciplined about reading each turn's own
digest fresh. It's a real structural risk in the automated rig specifically (multiple personas/worlds
sharing one `.dm/` mailbox for practical/parallelism reasons) rather than a normal single-player
risk — a real player only ever has their own world in the mailbox. Not a build item; noting it so a
future rig run doesn't assume this always self-corrects as cleanly (this run had one visible near-miss
on NPC identity that the DM caught, not zero near-misses).

**Spec candidate:** None — rig-awareness note only, not a code fix. Worth a line in
`docs/AUTOMATED-PLAYTEST.md` §2 flagging that shared-mailbox concurrent worlds is a known rig-only
risk factor the DM must actively guard against (it already does, per the evidence, but the discipline
is currently undocumented as a requirement).

---

## (b) Frequency / severity ranking

| # | Issue | Severity | Occurrences (this data set) | Status |
|---|---|---|---|---|
| 1 | Composer draft loss / submit-flakiness | **HIGH** | 3 (SD-011 shakedown + 2x rot1-attempt2 turns 11, 12) | OPEN, not fixed |
| 5 | Latency far above the ≤15s LATENCY LAW | **HIGH** | 22/22 timed turns over 15s (0% pass rate) | OPEN (known, DM-SEAT is the fix) |
| 2 | Turn-14 DM-disconnect ends a session | **MEDIUM** | 1 (rot1-attempt2), but rig has no watchdog so will recur | OPEN, correct app behavior, rig gap |
| 3 | Opening-turn digest violates diet budget | **MEDIUM** | 3 (both shakedown runs + rot1-attempt1's opening pair) | OPEN, awaiting Adam's ruling (exemption vs leak) |
| 4 | TIYL species-mismatch + attitude-inheritance bugs | **MEDIUM** | 2 distinct bugs, each confirmed once (shakedown) | OPEN, not fixed |
| 6 | `prepPending` unserviced (runbook/env mismatch) | **LOW-MEDIUM** | Every turn, 3 sessions (100% reproduction) | OPEN, cheap docs fix available |
| 7 | Cross-session mailbox interleaving risk | **LOW** | Handled correctly this run; flagging as risk | Not a bug — awareness note |

---

## (c) Spec candidates (recap by size)

| Issue | Fix | Size | Likely file(s) |
|---|---|---|---|
| 1 | Preserve composer draft across `renderWorld()` re-render | **S** (guard) / **M** (structural decoupling) | `src/world/render.js` (`renderWorld()`, textarea at line ~222) |
| 2 | DM-loop watchdog / auto-restart for the automated rig | **S** | `dev/` (new watchdog script) + `docs/AUTOMATED-PLAYTEST.md` |
| 3 | Gate opening-turn digest behind the same two-tier diet rule (pending Adam's ruling) | **S** | `src/world/dm.js` (`dmDigest()` / `prepPendingDigest`, line ~288) |
| 4a | Fix TIYL desc to consume rolled species (+ article grammar) | **S** | wherever `tiylDesc` is generated (search `src/world/codex.js` or TIYL module) |
| 4b | Attitude init should read TIYL relationship stance | **S** | NPC-minting/attitude-init code near `codexOf` |
| 6 | Fix or remove the dead `Workflow` instruction in the DM-Bridge runbook | **S** | `docs/DM-BRIDGE.md` |

No item above is **L** — everything here is a targeted, well-grounded fix. The one genuinely open
design question (Issue 3's exemption-vs-leak call) needs Adam's ruling before any code changes, not
more investigation.

---

## (d) What's working well (preserve these)

- **Tab-closure recovery is a real, structural win, not luck.** `dev/playtest-player-rot1-attempt2.jsonl`
  line 14 (the "session interruption" note): a background tab got closed unexpectedly mid-session
  ("tab 854289555 was closed unexpectedly by unrelated background browser activity"), and the player
  recovered "cleanly via new tab + Resume Session (SESSION LIVE badge) - zero progress lost, server-side
  state intact." This checks out against the source: `w.sessionLive` persists in `U` (localStorage,
  `src/world/play.js:303`), `startSession()` is idempotent when `sessionLive` is already true (no
  double-cast, `src/world/play.js:297-305`), and `renderWorld()` re-attaches `pollResponse()` for any
  `w.dm.pendingTurnId` still outstanding (`src/world/render.js:240-242`) — so even an in-flight,
  unanswered turn survives a full tab loss. This is exactly the kind of persistence guarantee the
  "worlds persist forever in the browser" pillar promises, and it held under a real accidental failure,
  not just a clean test. **Worth calling out explicitly as validated, not just assumed.**
- **The slow-drip mystery arc (Copper's Marsh / Manfred Carrow) is genuinely good design in action.**
  Both the player notes and the scribe's own summary independently praise the same arc: spotting
  Costtore burying contraband (a branched Stealth check, near-miss outcome), digging it up, leveraging
  it into a private negotiation, and being handed a full debt-bondage/body-snatcher horror hook
  *without* a doom-dump — "excellent tense dialogue beat," "strong dark hook, well above average
  narrative quality," "excellent pacing/chapter-break design" (player notes, turns 6, 8, 13). The
  scribe's summary independently confirms contract discipline held throughout (margin ladder honored,
  verbatim player dialogue quoted, zero option-menus, zero coached tactics, `fact_canonized` reserved
  for genuine reveals). This is the DM-CHARTER and SPICE-CURVE designs working exactly as intended —
  a near-miss roll produced *texture*, not a binary pass/fail, and the horror reveal was paced across
  four turns instead of dumped in one.
- **The roll-branches / margin-ladder mechanism is validated end-to-end, including a fail branch
  opening real combat.** The Saltmarsh fixture chain (rot1-attempt2 scribe, turns "fixture-combat" →
  "fixture-combat-resolve") shows a Stealth DC13 branch resolving locally to a straight fail (miss by
  6), correctly firing `combat_start` with 3 CR-1/8 foes in a stilt-hut zone — no second model
  inference paid, the degree-of-failure grading (near-miss vs straight fail) landing tight as designed.
- **Digest-diet steady-state numbers prove the mechanism works.** Once past the (separately-flagged)
  opening-turn spike, both shakedown-run2 and rot1-attempt2 hold steady at ~9-10KB per turn — well
  under the <12KB target in `docs/DIGEST-DIET.md`. The two-tier codex design (roster one-liners +
  full records only for scene/minted) is doing its job in steady state.
- **The gen/mint handshake is clean.** `npc:myria-wildheart` minted on schedule with full atoms and a
  clean bind (no name/species pre-committed in prose before the mint landed) — validated live in
  shakedown-run2.
- **`fact_canonized` discipline held.** Genuine reveals only (the buried pigment, the debt-bondage
  reveal, the Changed-NPC reveal) — not fired on routine narration, matching the charter's intent that
  this event stay reserved for real canon-forming moments.

---

## Latency stats (computed directly from the logs, methodology below)

**Method:** pooled every numeric latency field found — `latencyS` from the scribe `.jsonl` files
(DM-side measured latency) and `respondedInSec` from the player `.jsonl` files (player-perceived
latency, used only where no scribe `latencyS` existed for that session — `rot1-attempt2` has no
`latencyS` field in its scribe log, so its 13 real per-turn timings come from the player log; the
`"n":"note"` session-interruption line and the `null`-latency timeout line were excluded as
non-turns, not zero-latency turns).

| Session | n (timed turns) | Median | P90 | Max | Min |
|---|---|---|---|---|---|
| rot1-attempt1 (scribe) | 3 | 169.9s | 342.9s | 386.2s | 28.0s |
| rot1-attempt2 (player, no scribe latencyS) | 13 | 40.0s | 90.0s | 170.0s | 30.0s |
| shakedown-run1 (scribe) | 1 | 77.4s | — | 77.4s | 77.4s |
| shakedown-run2 (scribe) | 5 | 68.1s | 74.4s | 76.7s | 42.6s |
| **All sessions combined** | **22** | **52.3s** | **161.9s** | **386.2s** | **28.0s** |

**Against the LATENCY LAW (routine turns ≤15s): 0 of 22 timed turns (0%) met the target.** Even
restricting to fast-lane-only turns (13 across attempt2 + shakedown-run2, excluding deep-lane/opening
turns): median ~46s, still 0/13 at or under 15s. This is squarely consistent with the standing
DM-SEAT finding (loop tax, not model cost) — nothing here contradicts that diagnosis, it just puts a
clean aggregate number on it across every log currently on disk.

---

## Deviations from instructions

- None from the letter of the assigned steps. One judgment call: `dev/playtest-scribe-rot1-reasonable.jsonl`
  contains a single "bootstrap, then halted at a pre-existing stop-file" entry with zero real turns —
  it's read and accounted for above (in the session table) but contributes no findings of its own since
  no turn was ever served.
- The branch was created off `master` at `1d79145` (not off this worktree's prior HEAD, `ba83288`,
  which was stale relative to the shared repo's actual `master`) — confirmed no other worktree had
  `master` checked out before branching, so this is safe.
