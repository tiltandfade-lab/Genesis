---
type: playtest-report
project: Genesis
status: first live exercise of the chase loop — complete
created: 2026-07-04
branch: playtest/chase-0704
---

# Chase-loop playtest — 2026-07-04 (first live exercise)

**Unit:** the FIRST live exercise of the chase loop (`GS.chase` / `src/world/gap-wiring.js` /
COMBAT-LIFECYCLE.md §3d). Built, never run in play before this session.

## Method — and a deviation from AUTOMATED-PLAYTEST.md, disclosed up front

The standard rig (`docs/AUTOMATED-PLAYTEST.md` §2) drives the **real app in Chrome** so the live
`dmDigest()`/UI pipeline builds the digest and a Sonnet Player reads rendered narration. That path
was **unavailable in this environment**:

- **Claude-in-Chrome**: the extension was unreachable (`tabs_context_mcp` returned "not connected")
  across two retries.
- **Preview MCP** (`preview_start`): crashed on launch — the traceback shows it invoked
  `python3 -m http.server ... --directory` (the CommandLineTools system Python, not
  `dev/dm-bridge.py` as configured in `.claude/launch.json`), and that invocation itself hit a
  sandboxed `PermissionError`. This reproduces the standing memory note ("Preview MCP... can't spawn
  the server") for this repo.

Per the mission's own instruction ("route around it if play can continue"), I ran `python3
dev/dm-bridge.py` on port **5179** (5176 was occupied by another executor's session; the mission's
stated occupied set was 5176-5178) to confirm the bridge itself is healthy (`GET /dm/health` → ok),
then **routed around the browser layer**: a jsdom harness (`dev/playtest-chase-0704-driver.mjs`)
loads the real `genesis.html` + every `manifest.json` module in load order — the **exact technique
`dev/verify-combat-lifecycle.mjs` and `dev/verify-dm-events.mjs` already use to prove production
code** — and calls the real `applyEvent(world, event)` / `dmDigest()` / `renderWorld()` functions
directly. I authored both seats turn-by-turn as a live session would unfold (player in-character
choices; DM narration/events per DM-CHARTER lane obedience), with every player die genuinely rolled
(`Math.random`-backed `d20()`/`dN()`) and handed to "the DM" — never fabricated.

**What this covers:** the chase MECHANICS + the COMBAT-LIFECYCLE seam under real `applyEvent`/
`dmDigest` — this unit's actual target. **What it does NOT cover:** the bridge HTTP transport, Chrome
rendering, or the two-call loop-latency protocol (already covered by the shakedown/rotation runs).
`respondedInSec` in the log is **synthetic** (jsdom is instant; no model call ran in this loop) —
it is NOT a real DM-latency measurement and should not be aggregated with the real bridge runs'
latency data.

The bridge server was started and left running read-only during the session (never touched
`verify-bridge.py`, never reset `.dm/`); it was not the transport actually exercised. Stopped at the
end of the session.

## Branch + provenance

- Branch: `playtest/chase-0704`, created off `origin/master` @ `ba83288` (the fetched remote tip;
  the local integration checkout at `~/Desktop/Work/projects/Genesis` was one merge ahead at
  `8f802f1`, not yet pushed — branching off the remote tip per "off master").
- Driver: `dev/playtest-chase-0704-driver.mjs` (committed — reproducible; run with `node` from
  `~/.genesis-jsdom` per the CLAUDE.md jsdom convention).
- Turn log: `dev/playtest-chase-0704.jsonl` (37 turns, same `{n,action,respondedInSec,note}` shape
  as `dev/playtest-player-*.jsonl`).
- Raw run transcript: `dev/playtest-chase-0704-run.log`.
- Structured findings dump: `dev/playtest-chase-0704-findings.raw.json`.
- **Not merged** (per instructions).

## Session shape — 3 encounters, both chase directions, both endings

| Encounter | Direction | Trigger | Outcome | Rounds |
|---|---|---|---|---|
| A | PC flees, foe pursues (non-canonical direction — see Finding 1) | player-declared flee mid-fight | **away** (organic) | 8 |
| B | PC pursues a morale-broken fleeing foe (the canonical, spec-intended direction) | `foe_morale` breaks the lone foe to "flee" | **away** (organic) | 6 |
| C | Same as B, determinism control | forced `pursuerWon:true` every round (documented control, not an organic beat — mirrors the existing harness convention of forcing `d20:20` for a guaranteed hit) | **contact** | 2 |

**Both endings reached:** away (A, B — organic) and contact (C — forced control, since two honest
attempts both resolved away; see Finding 6 on why "away" kept winning). Turn count: 37 (`n` in the
log), spanning 3 `combat_start`s, 2 `chase_start`s that survived to a real gap-clock loop + 1 more
attempted, 2 reopened `combat_start`s on contact, 1 `chase_yield`.

## Findings, ranked by severity

### 1. HIGH — §3d ordering contract breaks for the single most common trigger: a solo foe fleeing

**COMBAT-LIFECYCLE.md §3d says:** "the DM emits `chase_start` **before** `combat_end`... `chaseInit`
copies only the fid string, so `GS.chase` survives the combat teardown." This holds when OTHER foes
are still alive. It does **not** hold when the fleeing foe is the **last live foe in the fight**:

- `foe_morale`'s flee-application branch ends by calling `cmMaybeAutoEnd(w)` (§3b's detected
  auto-end).
- `cmMaybeAutoEnd` checks `foes.every(f=>f.down||f.fled||f.surrendered)` — true the instant the
  ONLY foe flees — and immediately fires `combat_end` **from inside the `foe_morale` case itself**,
  synchronously, before the DM's next tool call.
- By the time the DM's next turn tries to emit `chase_start`, `GS.combat` is already `null`.

**Isolated repro** (`applyEvent(combat_start, {foes:[1 foe]})` → `applyEvent(foe_morale, forces
flee)` → `GS.combat` is already `null`):
```
pre-morale GS.combat: true
foe_morale result: {"ok":true,"held":false, ... "disposition":"flee", ...}
POST-morale GS.combat: null
Is fid still resolvable via GS.combat.foes? null
```
Reproduced **twice independently** in the full session (Encounter B, turn 20-22 in the log; and
Encounter C, turn 31) — not a one-off RNG fluke.

**Consequence:** `chase_start` still returns `{ok:true}` (it doesn't hard-fail), but it silently
degrades — see Finding 2. A real DM session following the doc's own instructed order ("emit
chase_start before combat_end") would find combat_end has, in effect, **already happened** by the
time morale resolved, for exactly the encounter type (a lone guard/lookout/scout breaking and
running) that is arguably the most common chase trigger in actual play — multi-foe fights where one
foe flees and others fight on are comparatively rarer.

**This is the single most important finding of the session** — the built ordering contract is
correct for multi-foe fights and silently wrong for solo-foe fights.

### 2. WRONG — the degrade loses the foe's identity in the ledger

Direct consequence of #1: `chase_start`'s case (`src/world/dm.js:2345`) resolves the quarry's name
via `const foe=opts.targetFid&&GS.combat?(GS.combat.foes||[]).find(...)` — guarded on `GS.combat`
truthiness. When `GS.combat` is already `null` (Finding 1), `foe` is `null`, and the code falls back
to the literal string `"the quarry"`. Observed twice in the log (turns 22, 31):

```
"» The chase is on — the quarry runs; the gap holds at 2."
```
instead of `"» The chase is on — Cartel Lookout runs..."`. This is worse than a hard error: it's a
silent quality regression that would visibly confuse a real DM/player mid-session (the ledger loses
the fled NPC's name at the exact moment it matters most).

### 3. CALIBRATION — solo-foe fights have no built-in morale-checkpoint trigger

`moraleTrigger(foe, combat)` (`src/engine/monster-tactics.js:124`) only auto-derives a trigger from
`side-bloodied` (`live.length*2 <= foes.length`) or `bloodied-outnumbered`/`fear-effect` — the first
two formulas are **mathematically unreachable when `foes.length===1`** (a lone foe can never be
"half the side down" or "outnumbered" by definition). A bare `foe_morale{foe:fid}` call against a
solo foe returns `{ok:false,reason:"no-trigger"}` — confirmed in an early attempt this session. The
DM-legitimate workaround (supplying `p.trigger:"first-blood"` by hand) works, but it means every
solo-foe fight requires the DM to invent the trigger label from scratch — a coherence gap next to
the multi-foe triggers that DO auto-fire.

### 4. WRONG — bestiary CR-fallback resolution produces flavor-incoherent foes, reproducibly

`resolveCreature()` (`src/engine/combat.js:116`), when a `combat_start` foe name has no exact/slug
bestiary match (true for any freeform DM-invented name like "Cartel Enforcer" / "Cartel Lookout" /
"Cartel Runner"), falls through to `cmPickByCR` — a **random** pick from the nearest CR band with
NO type/theme filter unless `role`/`habitat`/`faction` hints are supplied (which the DM-BRIDGE
runbook doesn't emphasize supplying). Observed **twice, independently, across two runs**:
- "Cartel Runner" (a human smuggler) → **pseudodragon** (`statId:"pseudodragon"`, a tiny magical
  dragon with its own custom "What the Pseudodragon Wants" d20 table).
- "Cartel Runner" (same fixture, different run) → **axe-beak** (a giant flightless bird monstrosity).

Both are CR 0.25 matches, both are wildly flavor-incoherent for a human faction goon. This is
"working as designed" per the resolver's own comment ("CR-band fallback... keeping the rolled name
as a label") but the practical effect is that **any DM who doesn't discipline themselves to always
supply `role`/`habitat`/`faction` hints on `combat_start` will get monster stat blocks that
contradict their own narration** — a real friction point worth a runbook callout, not just an
engine footnote.

### 5. WRONG (UI) — the panel "restore" on `combat_end` defaults to the map panel, not to "no panel"

`src/world/render.js:250-251`: `GS.gamePanel = GS.prevPanel || "map"`. When the fight opened with no
panel open (`GS.gamePanel===null`, the common case — the player was just reading narration, not in
any specific panel), `GS.prevPanel` is `null`, and `||"map"` silently substitutes the **map panel**
rather than restoring "no panel." Observed on every `combat_end` in this session (`GS.gamePanel`
read `"map"` after all 3 fight closes, even though `GS.gamePanel` was `null`/not `"map"` before each
fight opened). Not a crash — the panel does close and the game IS interactable again — but it is a
real behavior change (silently opening the map) that doesn't match "restore to the pre-fight panel"
as COMBAT-LIFECYCLE.md §3a.5 describes it. Low-to-medium severity; a one-line fix
(`GS.prevPanel===null ? null : (GS.prevPanel||"map")`, or treat `undefined` vs `null` distinctly).

### 6. CALIBRATION — the gap-clock's Grounded-band complications carry no mechanical bite, so chases can run long

`chase-complications` rows are mostly flavor-only at the Grounded band (no roll modifier, no forced
segment loss) — the actual gap movement is 100% determined by the caller-supplied `pursuerWon`
boolean, so the complications table currently narrates texture but never drives outcome variance.
Combined with `CHASE_GAP_SIZE=3`/`CHASE_AWAY_MULT=2` (contact at gap 0, away at gap 6, starting at
gap 2 — the midpoint), a **near-50/50 opposed check is a symmetric random walk with no forcing
function toward resolution**. Encounter A ran the full 12-round safety cap this session on one
attempt (oscillating gap 1–4 the whole time) before I had to route around it with a declared
`chase_yield` — a legitimate DM move, but the underlying finding stands: nothing in the mechanics
itself signals "this chase is dragging, force a decision," unlike, say, a lair-action clock or a
scene-pressure timer elsewhere in the design. Worth a look from the table-tuning pass alongside the
already-known chase-complications authoring work.

### 7. HIGH-VALUE, NOT A BUG — the "away" ending does not, in fact, leave a codex soft-recall

`docs/TABLE-GAPS-070126.md §1` documents the intent: "gap opened ×3 (away — the fled foe persists
soft, recall fodder)." I checked this directly against the actual code: **there is no codex
mutation anywhere in `chase_start`/`chase_round`/`chase_yield`** (`src/world/dm.js:2339-2376`) — the
only codex touch in the whole case-block is a **read** (`codexGet`, only used when the quarry was
already an npcId, never for a `targetFid` combat-foe quarry). Confirmed empirically: after both
"away" endings this session, `dmDigest().codexRoster` was `[]` — the escaped foe leaves **only** a
static ledger prose line ("the quarry slips the leash and is gone... [complication]"), never a
codex-linked, revisitable NPC record. Since `distant-word`'s recall pool (`gap-wiring.js §2`) and the
`digest.echo` "world rhymes with itself" mechanic both pull from codex/ledger entries carrying a
`nodeId`, and a bare combat-foe object has neither a codex id nor a `nodeId`, **the escaped Cartel
enforcer/lookout is, mechanically, gone forever** — not "recall fodder" in any queryable sense, just
prose that scrolls off. This is the single clearest gap between the spec's stated intent and the
built system: chase "away" is currently a narrative dead end, not a soft thread for the world to
pull later. Not this unit's job to fix, but load-bearing for anyone planning to actually use
escaped foes as recurring antagonists.

### 8. INFO — the built chase system has no explicit "PC-as-quarry" mode

`chase_start`'s payload is `{targetFid|npcId, terrain}` — the quarry is always a foe fid or a codex
npc id. There is no field for "the PC is the one being chased." `docs/TABLE-GAPS-070126.md §1`
itself frames the whole system from morale-flee ("MONSTER-TACTICS made morale-flee binding —
fleeing foes now happen every fight... nothing rolls when someone runs"), i.e. the canonical
direction is always "the party chases a fleeing NPC/foe." Encounter A (PC flees, foe pursues) had to
be played by pointing `chase_start.targetFid` at the CHASING foe and manually inverting the
semantics of `pursuerWon` (treating "pursuerWon:true" as the foe closing the gap on the fleeing PC).
It worked mechanically (the gap clock doesn't care which side "pursuerWon" conceptually represents),
but the ledger prose is written from the "quarry runs, pursuer chases" framing regardless — e.g.
turn 6's line ("the lead enforcer curses and gives chase") had to be authored by the DM to make
narrative sense of a mechanically-identical-but-conceptually-inverted event, and nothing in the
digest/ledger actually distinguishes "PC pursues" from "PC flees" chases. Not a bug (the system may
be intentionally scoped to the canonical direction only), but worth a decision: is "foes chase a
fleeing PC" in scope at all, or should the runbook say explicitly that this system only models
"party pursues," and PC-flees-combat should stay pure prose with no `GS.chase` engagement?

## What worked cleanly (don't bury the good news)

- **`combat_start` → `combat_end` → `chase_start`(multi-foe case, implicitly exercised in Encounter
  A where a second foe stayed in the fight and did NOT auto-end it) → gap-clock loop → `contact`
  reopening a fresh `combat_start`** all ran with zero crashes across 3 encounters.
- **The gap-clock loop itself is solid**: `chaseRound`/`chase_round` correctly shifted the gap on
  every `pursuerWon` boolean, rolled exactly one `chase-complications` result per round (never zero,
  never more than one — confirmed non-empty complication text on every round across all 3
  encounters, contradicting my own early hypothesis that the table might be failing silently), and
  graded the end state correctly at both the 0 (contact) and gapSize×2=6 (away) boundaries.
- **Contact correctly reopens combat.** Both contact endings (Encounter C, and Encounter B's earlier
  attempt logic) cleanly re-ran `combat_start` with the pursued foe re-statted as a fresh
  encounter — no leftover chase/combat state collision (`GS.chase===null`, fresh `GS.combat` object).
- **`combat_end` reliably clears `GS.combat` to `null`** in every case tested (declared fled,
  declared surrender, auto-detected), and the XP/faction-clock escalation on the very first fight
  (2 enforcers, one hit-and-fled) fired correctly (`+50 XP`, clock line in the ledger).
- **The chase's own state (`GS.chase`) genuinely survives combat teardown** in the multi-foe case
  (Encounter A) exactly as §3d contracts — the bug is specifically the solo-foe race (Finding 1),
  not the general survival mechanism.

## Deviations from the mission brief

1. Drove the session via jsdom + direct `applyEvent`/`dmDigest` calls rather than the real app in
   Chrome (both Claude-in-Chrome and Preview MCP were unavailable in this environment) — disclosed
   in full above. This means UI-rendering claims (does the battle stage visually close and the
   panel visually restore) are backed by `GS.gamePanel` state assertions, not a rendered screenshot.
   Finding 5's panel-restore bug is a state-level finding; whether it's visually jarring in the real
   Theater/battle-stage UI would need a Chrome-driven follow-up.
2. Encounter C's "contact" ending is a declared determinism control (forced `pursuerWon:true` every
   round), not an organic persona decision — both organic attempts (A, B) resolved "away." Logged
   plainly as a control both in the driver source and the turn log itself (turn 30's note says so
   explicitly), never presented as an organic beat.
3. One `chase_yield` was used to unblock Encounter A after it hit the 12-round safety cap without
   resolving (Finding 6) — a legitimate DM-narrated "call off the chase" beat, not a fabricated
   result (the gap-clock's own state was real; the yield just closed out a chase that mechanics
   alone weren't resolving).
