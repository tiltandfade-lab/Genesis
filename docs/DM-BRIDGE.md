---
type: system-spec
branch: Genesis
status: implemented (v1)
created: 2026-06-21
implemented: 2026-06-21
---

# DM Bridge — the local integration harness (Claude Code as the dev DM)

A development/playtest harness that closes the play loop: the app and an **AI DM run together**
over a tiny local bridge, instead of the clipboard back-and-forth. The DM is **Claude Code**,
which — running on a Claude subscription, not an API key — costs **no metered API tokens**. This
is a *dev/test* surface, **not the shipped product**: when Genesis ships, "Claude Code in the
loop" is swapped for an API call against the **same turn/response contract** defined here.

## Why this exists

Testing the app today means: play in the browser → `handToDM` copies a digest to the clipboard
→ paste into a chat → read narration → manually re-enter what changed. The human is the bus.
That's an awful long-term loop and it doesn't exercise the real architecture. The bridge makes
the transfer a **structured file/HTTP handshake both sides can see**, with the DM emitting
**typed events** the script applies — so playtesting the loop also tests `EVENT-CONTRACT.md`.

This is not a new direction — it's the locked design made runnable. `DESIGN.md`'s anti-drift
north star already says the app *"serves a small, relevance-scoped state digest each beat"*;
`handToDM` (`src/world/handoff.js`) already assembles exactly that digest. The bridge just sends
it as JSON to an endpoint and renders the structured reply, instead of `navigator.clipboard`.

## Principles inherited (do not relitigate)

- **Script owns state; the DM only interprets.** The DM never writes `U`. It returns narration +
  typed events; the **app applies the events through its own existing mutators** (`addLedger`,
  `advanceClock`, `addNode`/`addEdge`, clock changes). (`DESIGN.md`, `EVENT-CONTRACT.md`.)
- **detected > declared.** v1 accepts DM-*declared* events (pragmatic); the migration path to
  *detected-from-state-delta* is owned by `EVENT-CONTRACT.md`, not redesigned here.
- **Scoped digest, not the whole universe** each beat (anti-drift).
- **Dice transparency + DM-agency.** The **player rolls all dice, openly**, in-app; the DM
  narrates *from* those results and **never fabricates or rolls them**. The protocol enforces
  this structurally (rolls travel *into* the turn; the DM can only *request* a roll, never
  resolve one). The DM exerts will only through NPCs; presents three options + "or something
  else" at decision points (`feedback_dm_three_options`, `feedback_dm_agency`).

## Architecture — three actors

```
┌─────────────┐   POST /turn        ┌────────────┐   reads .dm/turn-*.json   ┌──────────────┐
│  THE APP    │ ──────────────────▶ │ THE BRIDGE │ ────────────────────────▶ │  CLAUDE CODE │
│ genesis.html│   (action+digest+   │  mailbox + │                           │   (the DM)   │
│  (browser)  │     player rolls)   │  snapshot  │ ◀──────────────────────── │  /loop watch │
│             │ ◀────────────────── │  store     │   writes .dm/response-*   │              │
└─────────────┘   GET /response     └────────────┘                           └──────────────┘
  applies events                      serves the app                          narration + events[]
  via its OWN mutators                + /state snapshot
```

1. **The app** — produces a turn (the player's action + the scoped digest + any dice the player
   just rolled), polls for the response, renders narration in the chronicle, and **applies the
   returned events** with its real mutators, then re-renders ledger/clock/map and persists.
2. **The bridge** (`dev/dm-bridge.py`) — a tiny local HTTP server that *also* serves the static
   app (one command runs everything; replaces `python3 -m http.server`). It is a **dumb mailbox
   + a read-only state snapshot** — it holds turn/response files and the latest `U` snapshot the
   app posts. **No game logic lives here** (see "State ownership").
3. **The DM** (Claude Code) — a `/loop` watch on the turn file: read it (+ `/state` if needed),
   compose narration + typed events following the DM-agency rules, the SRD lookups
   (`Reference/SRD-Data/`), and `CLASS_PROGRESSION`; write the response file.

## State ownership — the one real decision (recommended: app owns it; bridge is a mailbox)

**The app remains the sole owner and applier of state.** The bridge stores a *read-only snapshot*
for the DM's benefit; it never mutates `U`. Rationale — the anti-drift cardinal rule is *one
implementation of the mutators*. They live in-browser (`world.state`); re-implementing them in a
Node/Python bridge would fork them and invite drift. So:

- The app applies the DM's `events[]` with its existing mutators (the `applyEvent(e)` runtime
  below), persists to `localStorage` as today, and POSTs a fresh snapshot so the DM can read full
  state next turn.
- The bridge stays trivial → **Python is fine** (no logic to duplicate).

> **Synergy worth noting:** the client-side `applyEvent(e)` runtime this build needs — a switch on
> the `EVENT-CONTRACT.md` event types dispatching to the real mutators — **is** the first piece of
> the event-contract plumbing that `ADVANCEMENT.md` / `DIFFICULTY.md` require anyway. Building the
> bridge lands it in the right place. Two birds.

*(Rejected alternative: a Node bridge that owns state and applies events server-side — needs the
classic-script modules loaded outside the browser or a re-implemented applier. More friction, real
drift risk. Don't.)*

## The contract (the durable artifact — reused by the shipped API DM)

### TurnRequest — `POST /turn` → `{ turnId }`

```jsonc
{
  "turnId":  "t-<uid>",
  "worldId": "<U world id>",
  "action":  "I search the collapsed shrine for the missing ledger.",
  "rolls": [                       // the player's OPEN rolls; the DM narrates FROM these
    { "label": "Investigation", "die": "d20", "result": 14, "mods": "+5", "total": 19 }
  ],
  "digest": {                      // the scoped state digest (the JSON twin of handToDM's prose)
    "clock":   { "day": 2, "band": "morning", "exact": "07:14", "session": 3 },
    "location": "Saltmarsh Shrine",
    "scene":   { "tension": "...", "present": ["NPC: Brother Vael"] },
    "pc":      { "name": "...", "species": "...", "class": "...", "level": 3,
                 "hp": "19/24", "ac": 15, "conditions": [], "skillProfs": ["..."] },
    "powers":  [ { "faction": "Tide-Wardens", "agenda": "...", "clock": "3/6" } ],
    "fronts":  [ { "kind": "...", "danger": "...", "clock": "2/4",
                   "dmOnly": { "truth": "...", "doom": "..." } } ],
    "recentLedger": [ "...last ~6 entries..." ],
    "revealed": ["map", "ledger"]
  }
}
```
The `digest` is assembled by extending `handToDM` into a structured `dmDigest()` (the prose
version stays for the manual/clipboard fallback). `dmOnly` fields carry the hidden layer the DM
already gets today.

### TurnResponse — `GET /response?turnId=…` → `200` when ready, `204` while pending

```jsonc
{
  "turnId":  "t-<uid>",
  "narration": "The shrine's collapsed nave still smells of brine and old incense...",
  "events": [                      // EVENT-CONTRACT.md envelope, verbatim
    { "type": "fact_canonized", "payload": { "factId": "...", "what": "the ledger was taken, not lost" },
      "source": "declared", "ledgerRefs": [] },
    { "type": "clock_advanced", "payload": { "clockId": "tide-wardens:recover-ledger", "delta": 1 },
      "source": "declared", "ledgerRefs": [] }
  ],
  "rollRequest": null,             // a CHECK: { "skill": "Stealth", "ability": "dex", "dcHidden": true, "adv": "advantage" }
                                   // OR a DICE roll: { "dice": "2d6+3", "label": "fire damage" }  (any NdM±K combo)
  "ask":         null,             // OR { "prompt": "...", "options": ["A","B","C"], "orElse": true }
  "dmNotes": "adjudication: treated the shrine as difficult terrain; precedent logged"
}
```
- `events[]` use the **exact `EVENT-CONTRACT.md` envelope** (`type` / `payload` / `source` /
  clocks / `ledgerRefs`). The app validates + applies each via `applyEvent`.
- `rollRequest` — when the DM needs a check, it **asks**; the app prompts the player to roll
  openly (real dice engine, `ui.dice`); the result rides the **next** TurnRequest's `rolls`.
  The DM never resolves the roll itself.
- `rollRequest.adv` — **OPTIONAL** `"advantage"` / `"disadvantage"`. The DM ADJUDICATES the
  circumstance (cover, prone, aid, hidden, restrained…); the app rolls `2d20` keep-highest/lowest so
  the dice reflect the call. Omit/`null` = a straight d20. The script owns the mechanic; the DM owns
  whether it applies.
- `rollRequest.dice` — a **DICE roll** instead of a d20 check: any `NdM±K` expression (`"2d6+3"`,
  `"1d8"`, `"4d6"`, `"2d6+1d4"`). Use it whenever the PLAYER should roll non-d20 dice — **weapon/spell
  damage, healing, hit dice, a random-table die**. The app rolls it openly, shows the trace
  (`fire damage: 2d6[4,5]+3 = 12`), and it rides the next turn. `label` is the flavor. The player also
  has a free dice tray (any combo) under the input, so they can roll whatever a moment calls for.

### Mechanics the DM MUST fire (the script owns the numbers — but only if the DM declares them)

The app shows every mechanical effect as a chip in the feed *and* speaks it through your prose — but
it can only apply what you send. Each turn, after narrating, fire the matching event(s):

- **Damage / healing → `hp_changed`** `{payload:{delta:-7}}` (negative = damage). **Say the number in
  the narration too** — "the blade bites deep; you lose **7**" — players want to hear the cost out loud,
  not discover it on the sheet. The app applies it and shows a `−7 HP → 5/12` chip.
- **A leveled spell is cast → `slot_spent`** `{payload:{level:1}}` (Detect Magic, Cure Wounds, …). The
  slot is NOT consumed unless you fire this. **Cantrips cost no slot** — never fire it for them.
- **A class resource is used → `resource_spent`** `{payload:{key:"rage",n:1}}` (Rage, Bardic
  Inspiration, Channel Divinity, Ki/Focus, Sorcery Points…).
- **Enemy / NPC rolls** — you roll those in the OPEN in your narration (the player only rolls their
  own dice). Apply advantage/disadvantage to them yourself and **state it** ("with the high ground, it
  strikes at advantage — **18** to hit"). Player checks use `rollRequest.adv` instead.
- `ask` — the structured three-options-plus-"or something else" offer.

### Endpoints
| method · path | purpose |
|---|---|
| `GET /` + assets | serve the app (one command runs the whole thing) |
| `POST /turn` | store the turn; return `{turnId}` |
| `GET /response?turnId` | `200` TurnResponse when ready, else `204` |
| `POST /state` | app posts the latest `U` snapshot after applying events |
| `GET /state` | the DM reads full current state when the digest isn't enough |
| `POST /reset` | (test) clear the mailbox / load a fixture world |

## App-side wiring

- New module **`src/world/dm.js`** (logic layer): `dmDigest()` (structured twin of `handToDM`),
  `sendTurn(action, rolls)` → `POST /turn`, `pollResponse(turnId)` (interval poll → `204`/`200`)
  with a **"the DM is considering…"** indicator, and `applyResponse(r)` → render narration +
  `r.events.forEach(applyEvent)` + handle `rollRequest`/`ask`.
- New `applyEvent(e)` (the EVENT-CONTRACT runtime) — `switch(e.type)` dispatching to the existing
  mutators; unknown types log + no-op (forward-compatible). Lives in `src/world/` (state-owning
  layer). **This is reused by advancement later.**
- The natural home for the narration feed + action input is the **chat-first World view**
  (`NEW-GAME-FLOW.md §9`, build-lane B) — so this build *seeds* lane B rather than competing with
  it. Minimum v1 can render into a simple scrolling chronicle; the column-slide polish can follow.

## The Claude Code DM loop

- Driven by the **`/loop`** skill (self-paced): watch `.dm/` for a pending turn, respond, repeat.
- Each turn the DM loads: the **DM-agency rules** (memories `feedback_dm_agency`,
  `feedback_dm_three_options`, slow-lore-drip, patch-canon-before-inventing), the **SRD lookups**
  (`Reference/SRD-Data/` — spells/monsters/rules), and **`CLASS_PROGRESSION`** for the PC's level.
- It composes narration grounded in the digest, **narrating from `rolls`** (never fabricating
  them), emits `EVENT-CONTRACT.md` events for anything that changed state, requests a roll via
  `rollRequest` when a check is needed, and logs adjudications as precedent (`adjudication` event)
  so rulings stay consistent across the session.

## Build order (next session)

1. **Lock the contract** (this doc) + write 2–3 example turn/response **fixtures** (one combat-ish,
   one social, one travel) — they double as the integration test.
2. **`dev/dm-bridge.py`** — static serve + `/turn` `/response` `/state` `/reset` mailbox. Tiny.
3. **App wiring** — `src/world/dm.js` (`dmDigest`/`sendTurn`/`pollResponse`/`applyResponse`) +
   `applyEvent` runtime; a "DM is considering…" state; render into a chronicle feed. Register in
   `manifest.json` + `genesis.html`; `check-manifest`.
4. **The DM loop** — a documented `/loop` "DM session" runbook + the rules/lookups it loads.
5. **Verify** — a scripted 3-turn scenario (curl- or jsdom-driven against the bridge) asserting
   the round-trip, event application through real mutators, and state coherence (clock advanced,
   ledger appended, no `U` written by the DM).

## Scope / non-goals

- **Dev/test only.** Localhost, single player, single world, no auth. Not shipped.
- **v1 = declared events**; detected-from-state-delta migration is `EVENT-CONTRACT.md`'s job.
- **Not the lane-B UI polish** — but it shares the chronicle/action surface and should converge.
- The **production DM** (API, metered, per `DESIGN.md` cost posture) is out of scope here — it
  reuses this contract with an API call replacing the Claude-Code watch loop.

## As built (v1 — 2026-06-21)

Shipped exactly to the contract above. Files:

- **`dev/dm-bridge.py`** — the mailbox + static server (stdlib only, no deps). Serves the app and
  holds `.dm/turn-*.json` / `.dm/response-*.json` / `.dm/state.json`. Routes as specced, plus
  `GET /dm/turns` (lists pending turns for the loop) and `GET /dm/health`. **No game logic.**
  Serves everything `Cache-Control: no-store` — Genesis loads ~30 classic `<script>` files, and a
  stale cached `state.js`/`render.js` after an edit silently breaks the app (a tab looks dead); the
  dev server kills that whole trap, with no per-edit version strings to bump.
- **`src/world/dm.js`** (`world.dm`, layer 4) — the bridge client (`dmDigest` / `sendTurn` /
  `pollResponse` / `applyResponse` / `postState` / `dmSend` / `dmRollFor`) **and** the
  EVENT-CONTRACT runtime **`applyEvent(w,e)`** — a `switch` on every `EVENT-CONTRACT.md` type
  dispatching to the real mutators; unknown types `console.warn` + no-op (forward-compatible).
- **`src/world/state.js`** — added `dmLogOf` / `pushDmLog` (the persisted narration feed, on `w.dmlog`).
- **`src/world/render.js`** — `renderDMFeed(w)` + `escHtml`; the **"The DM"** section in the World
  view (scrolling chronicle · "considering…" indicator · the roll-handshake button · the
  three-options `ask` · the action box). Rendered only once a soul is in play.
- **`src/state.js`** — `GS.dm` transient (`turnId/pending/poll/rollReq/ask`).
- **Tests:** `dev/fixtures/` (4 pairs: social / travel / combat / combat-resolve) double as the
  corpus; `dev/verify-bridge.py` (28 checks — transport + contract conformance, dependency-free);
  `dev/verify-dm-events.mjs` (21 checks — full-app jsdom load: `applyEvent` through the real
  mutators + the DM-feed render).

**Known v1 gaps (by design):** there is **no time-advance event** — the in-world clock still moves
only via the existing transition controls (Travel / Rest / Montage), so a DM that narrates travel
should tell the player to take the transition. Events are **declared** (the `detected` migration is
`EVENT-CONTRACT.md`'s job). `clockId` is **fuzzy-matched** to a faction (by name slug) or a front
(by danger slug) — fine for v1; stable clock ids land with the detected-event work.

## Runbook — running a DM session (the `/loop` watch)

**One terminal — start the bridge (replaces `python3 -m http.server`):**
```
cd "<repo>" && python3 dev/dm-bridge.py        # → http://127.0.0.1:5175/genesis.html
```
Open the URL, enter a world, get a soul in play. The **"The DM"** panel appears in the World view;
type an action and Send. (If the bridge is down, Send toasts a reminder and falls back to nothing —
the clipboard `handToDM` still works as the manual path.)

**Second terminal / session — be the DM with `/loop`, on Sonnet for speed:**
```
/model sonnet        ← the DM turns are latency-sensitive; Sonnet is much faster than Opus
/loop  watch the Genesis DM bridge: GET http://127.0.0.1:5175/dm/turns; for each pending turnId,
read .dm/turn-<id>.json, compose narration + EVENT-CONTRACT events, write .dm/response-<id>.json
(or POST /response). Then wait for the next.
```
> **Run the DM on Sonnet.** Narration is latency-sensitive — the player is staring at "the DM is
> considering…". Set the DM session to `/model sonnet` (or, from an Opus orchestrator, dispatch each
> turn to a `model: sonnet` subagent). Without a DM session watching, the app gives up after **5 min**
> (`DM_POLL_TIMEOUT` in `src/world/dm.js`) and tells the player to start one (it no longer spins
> forever) — generous because a live Claude DM composing a turn can legitimately take a while.

### Hybrid fast-lane (keep Opus quality, lose the drag on routine turns)

If you run the DM on Opus/fast-mode Opus for narration quality (Adam's setup), don't pay the 20–30s
Opus cost on turns that don't need it. The loop **triages each turn by stakes** and routes the cheap
ones to a fast model — snappy routine beats, full richness where it counts.

**The lane is SCRIPT-OWNED — you don't re-decide it per turn.** `dmTriage` (`src/world/triage.js`, wired
into `sendTurn`) stamps every `.dm/turn-<id>.json` with:

```json
"lane": "fast" | "deep",
"laneModel": "sonnet" | "opus",
"laneReasons": ["new-place", "combat-action", ...]
```

Read `turn.lane` and obey it:

- **`"fast"` → dispatch to a `model: sonnet` subagent** (or run the loop session on Sonnet). These are
  travel/movement, time passing / rests, look-around, inventory/shop chatter, a lone check's follow-up —
  anything `dmTriage` saw no danger, new place, or jeopardy in (`laneReasons` ends in `routine:…` or
  `default-fast`). Tell the subagent to return the same `{narration, events[], rollRequest, ask}` contract.
- **`"deep"` → compose on Opus yourself.** The classifier deep-lanes on signals it can see *before* you
  write: `combat-active` / `combat-action`, `new-place` (first contact), `pc-downed` / `pc-bloodied` /
  `pc-condition`, `clock-due`, `no-living-pc`. These earn the 20 seconds.

**The one override — UPGRADE only, never downgrade.** Some deep beats aren't knowable from the player's
action (a Mythic crit, a major revelation, a hard pivot you're about to spring). If a `fast`-stamped turn
turns out to be one of those *as you compose it*, lift it to Opus yourself. Never push a `deep` turn down
to Sonnet — the script's deep verdict is a floor. Script owns the floor; the DM owns the ceiling.

The contract is identical either way (same `/response` shape, same EVENT-CONTRACT events), so the app
neither knows nor cares which model answered — only the wall-clock changes. The classifier already biases
toward fast (a player would rather a quick good turn than a slow great one for "I check the door"), so when
`turn.lane` says fast, trust it unless your own compose surfaces a ceiling beat.

### Deep prep fan-out — front-load the slow work so live turns are fast

The biggest live-turn drag is the DM re-deriving things mid-turn: looking up monster stat blocks in the
huge `data/bestiary.js`, re-reading SRD rules, re-synthesizing the scene. **Move all of that into prep**,
which is off the player's critical path (waiting for a deep prep is fine; waiting 100s for "I open the
door" is not). A thorough prep also just makes a better session — enough pieces staged to actually play.

The synthesis is already designed to fan out: `SYNTHESIS-CONTRACT.md` Stage 2 (reskin) is **one call per
environment, parallelizable**. The workflow `dev/prep-fanout.workflow.js` does exactly this:

1. At session start, get the prep bundle (`prepHandoff` / the digest's prep block).
2. `Workflow({ scriptPath: "dev/prep-fanout.workflow.js" }, bundle)` — Stage-1 harvest (one pass) → **fan
   out Stage-2 reskin across one subagent per environment in parallel**, each also **extracting the full
   stat block of every creature in its walk** so the live DM never re-reads the bestiary mid-combat.
3. Apply the result back with one event: `{ type:"prep_applied", payload:{ harvest, overlays } }`.

Net effect: live turns become **lean reads** of pre-compiled material (scene reskin, cast, stat blocks
already in the world) instead of expensive lookups — the real fix for the 100s+ turn. Run it on Sonnet
subagents for speed; the player isn't waiting on it. Pair with the fast-lane above and the slow turns
mostly disappear.

Each turn, the DM loads and honors:
- **DM-agency rules** — memories `feedback_dm_agency`, `feedback_dm_three_options`, the
  slow-lore-drip and patch-canon-before-inventing disciplines. Never roll the player's dice;
  **narrate FROM `turn.rolls`**; when a check is needed, return a `rollRequest` (never resolve it);
  offer three options + "or something else" at decision points via `ask`.
- **The margin ladder** (`DIFFICULTY.md` "Degrees of success & failure") — resolve every check by
  `total − DC`, not pass/fail. **Wiggle room ("near miss", partial credit) is ONLY for a −1/−2 miss;
  missing by 3+ is a real failure that bites, and a −5 is NOT a "near failure."** State the consequence.
- **SRD lookups** — `Reference/SRD-Data/` (spells / conditions / rules / items) + the monster files
  in `Asset Library/Monsters & Enemies/` for precise mid-scene numbers.
- **`CLASS_PROGRESSION`** (`data/class-progression.js`) for the PC's level features/resources.
- **The digest** (`turn.digest`) is the scoped state; `GET /state` gives full `U` if more is needed.

Emit an `EVENT-CONTRACT.md` event for **anything that changed state**, and log adjudications as
`adjudication` events so rulings stay consistent across the session. The app applies them through
its own mutators (`applyEvent`) and re-renders — the DM never writes `U`.

## Open questions

- **Snapshot vs. event-replay** for `/state`: post a full `U` snapshot each turn (simple) vs. let
  the DM replay the ledger. Start with snapshot.
- **Polling vs. SSE/long-poll** for `/response`: start polling; upgrade if it feels laggy.
- **Digest scope tuning** — how much of `handToDM` to send (start = its current content as JSON;
  trim/expand by feel).
- **Multi-turn roll handshake ergonomics** — does a `rollRequest` block the chronicle, or render
  inline as a "roll to continue" affordance? (Lean inline.)
- **Where `applyEvent` validation lives** — reuse a shared validator with the future detected-event
  path so declared/detected converge.
```
