---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-21
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
  "rollRequest": null,             // OR { "skill": "Stealth", "ability": "dex", "dcHidden": true }
  "ask":         null,             // OR { "prompt": "...", "options": ["A","B","C"], "orElse": true }
  "dmNotes": "adjudication: treated the shrine as difficult terrain; precedent logged"
}
```
- `events[]` use the **exact `EVENT-CONTRACT.md` envelope** (`type` / `payload` / `source` /
  clocks / `ledgerRefs`). The app validates + applies each via `applyEvent`.
- `rollRequest` — when the DM needs a check, it **asks**; the app prompts the player to roll
  openly (real dice engine, `ui.dice`); the result rides the **next** TurnRequest's `rolls`.
  The DM never resolves the roll itself.
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
