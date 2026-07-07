---
type: exhibit
status: DRAFT for Fable's prose polish — code-ref accuracy binds
consumer: technical hiring audience (POSITIONING.md Door B) · Opus orchestrator + Sonnet executors keep the numbers honest
thesis: "the script owns reality, the AI owns interpretation" — made concrete on ONE real turn
---

# DM-TURN-WALKTHROUGH — one turn, end to end

*The single killer artifact from `docs/POSITIONING.md` §"The single killer artifact": walk one real
DM turn from the player's keystroke to the persisted mutation, annotated with **where cost lives,
where determinism lives, where the latency budget sits**. This is the exhibit that proves the thesis
better than any resume line — because every number here is either lifted from a real session row or
computed by the exact function in the shipped code, and this document says which is which.*

> **Reviewer's one-line takeaway:** the language model wrote **one paragraph of prose and four typed
> JSON events**. Everything that changed the world — the codex records, the reveal, the faction link,
> the ledger line, the persisted save — was executed by **deterministic browser code the model never
> touched**. That division is the whole product.

---

## 0. Provenance of the numbers — read this first

Two things are true at once, and honesty about the seam is part of the exhibit:

1. **The turn is real.** It is turn `t-mr59t9kwhseaq`, lane `fast`, from the `rot1-attempt2`
   bridge playtest — the Bog-Iron Camp session where the DM introduced **Beabella Saladdi** and the
   vanished debtor **Costtore Barvino**. The turn-id, lane, player action, narration beats, and the
   ~65-second round-trip are drawn from the session logs
   (`dev/playtest-scribe-rot1-attempt2.jsonl` line for `t-mr59t9kwhseaq`;
   `dev/playtest-player-rot1-attempt2.jsonl` turn n=1, `respondedInSec: 65`).
   **⚠ VERIFY BEFORE PUBLIC USE:** the scribe log for this session was written **2026-07-03**; the
   player log **2026-07-04**. Re-confirm the pairing (and re-timestamp) against the source files
   before this exhibit is shown outside the repo.

2. **The `DMTurnTelemetry` byte/cost row is RECONSTRUCTED, not sampled.** The structured-logging sink
   (`logDmTurn` → `POST /telemetry` → `.dm/telemetry.jsonl`) landed the same day it was specced
   (`feat/dm-seam`, POSITIONING.md §"Immediate") and **no live session has written a row to it yet**
   — `.dm/telemetry.jsonl` is empty on disk as of this draft. So every byte/token/dollar figure below
   is computed **by the exact shipped formula** (`jsonBytes`, `dmEstimateCost` in `src/world/dm.js`),
   not read from a captured invoice. Each such number is tagged **[computed]**. Each session-real
   number is tagged **[real]**. The digest byte figure leans on the merged-reality measurement
   already recorded in code — `dmDigest` compact ≈ **48,540 B** on a rich turn, per the DIGEST-DIET §3
   reconciliation comment at `src/world/dm.js:378-384`, and the ~9 KB median digest cited in
   POSITIONING.md §4 — tagged **[measured-elsewhere]**.

> **The honest version of this exhibit ships the day the first live session writes a real
> `.dm/telemetry.jsonl` row.** Until then it is structurally exact and numerically reconstructed —
> which is still a stronger claim than any competitor can make about their agent, because the
> *shape* of the row is enforced by a typed contract and 38 seam assertions
> (`dev/verify-dm-seam.mjs`).

---

## 1. The turn at a glance

| stage | owner | what happens | artifact |
|---|---|---|---|
| player input | **player** | types a free-text action | the sheet + a string |
| digest assembly | **script** | scopes a bounded payload | `dmDigest()` → `turn.digest` |
| turn request | **script** | POSTs the envelope | `sendTurn()` → `POST /turn` |
| triage | **script** | picks the model lane | `dmTriage()` → `lane:"fast"` |
| narration + events | **AI** | writes prose + typed JSON | `TurnResponse` |
| validation | **script** | machine-checks the shapes | `validateTurnResponse` / `validateEvent` |
| mutation | **script** | applies each event | `applyEvent()` switch |
| ledger + codex + UI | **script** | records + renders | `addLedger` / `codexAdd` / `renderWorld` |
| telemetry | **script** | logs one cost/latency row | `logDmTurn()` |
| persist | **script** | saves the universe | `saveU(U)` |

**The AI touches exactly one row of that table.** Read down the "owner" column: that is the
determinism border.

---

## 2. Player input — the smallest possible surface

The player, playing a lone PC at Bog-Iron Camp at dawn, types:

> *"I thank Beabella for the bread and ask her who the figure in miner's grey was, and where they
> went so fast."* **[real]**

No dice attached this turn (a pure social/inquiry beat). The action enters `sendTurn(action, rolls)`
(`src/world/dm.js:385`). Note what the player did **not** have to do: no menu of options, no
mechanical bookkeeping, no "roll persuasion" prompt. The engine's rule (CLAUDE.md §Disciplines) is
**never roll the player's dice, never decide the PC's actions** — so the input surface is a single
sentence.

---

## 3. Digest assembly — the cost lever

Before anything is sent, the script builds a **bounded, scoped** payload with `dmDigest()`
(`src/world/dm.js:270-374`). This is where **cost lives**: the digest is the single largest thing
shipped per turn, so its byte budget *is* the inference bill.

The digest is not "the world." It is a curated projection. The slices actually assembled for this
turn (each verified in `dmDigest`):

| slice | source line | what rides | this turn |
|---|---|---|---|
| `clock` | `dm.js:282` | day/min/band/exact time | dawn, band `night`→`dawn` |
| `location` | `dm.js:283` | current node name | *Bog-Iron Camp* |
| `setting` | `dm.js:284-287` | master/taboo/myth — **founding turn only** | `null` (not founding) |
| `pc` | `dm.js:288-313` | sheet identity, hp/ac, inventory *ids only*, equipped weapon dice | the PC's live sheet |
| `powers` / `fronts` | `dm.js:314-322` | faction + pressure clocks, `filled/size` | the Color-Miners front |
| `recentLedger` | `dm.js:323` | **last 6** ledger lines only | bounded window |
| `gazetteer` | `dm.js:324` | **last 8** places | bounded window |
| `codex` / `codexRoster` | `dm.js:328` | two-tier: here-and-now full + one-liner roster | scene-bounded, not world-bounded |
| `minted` | `dm.js:332` | mint spotlight ids | *(empty — mints come THIS turn)* |
| `tarot` / `sessionLean` | `dm.js:338-357` | session card + carry-forward lean | DM-only |
| `activeWalk` / `combat` / `prepPending` / `levelUp` | `dm.js:358-368` | present only when active | all `null` this turn |
| `arrivalBrief` | `dm.js:372` | unrevealed drift for this node | `null` |

**Two design moves that are the exhibit's whole point about cost:**

- **Send-once slices.** `setting` (~393 B) and the full rolled `life` block ship **only on the
  founding turn** (`foundingTurn = !(w.dmlog && w.dmlog.length)`, `dm.js:279`). Every subsequent turn
  pays **zero marginal bytes** for information the DM already has. This is SPEED-DOCTRINE as code, not
  aspiration.
- **Bounded windows, not unbounded history.** `recentLedger` is `.slice(-6)`; `gazetteer` is
  `.slice(-8)`; the `codex` block is scoped to *scene size, not world size* (DIGEST-DIET §1-2). A
  world that persists forever does **not** grow the per-turn payload — the digest is O(scene), not
  O(history). That is what makes "worlds persist forever" economically viable.

**Bytes on this turn:**
- `digestBytes` ≈ **48,540 B** compact **[measured-elsewhere]** (rich-turn figure from the
  DIGEST-DIET §3 reconciliation, `dm.js:378-384`; the POSITIONING median is ~9 KB **[measured-
  elsewhere]** — this Bog-Iron turn is a fat one because the codex here-set is large).
- The whole turn envelope (`turnId`/`worldId`/`action`/`rolls`/`lane*` wrapping the digest) adds only
  **~200–350 B** — the same `dm.js:378-384` comment records that the once-alleged "14.8 KB outside the
  digest" was an indent-vs-compact measurement error, not a stowaway field. **[measured-elsewhere]**

Both byte counts are measured through `jsonBytes()` (`dm.js:1389`), the crash-proof
`JSON.stringify(v).length` the telemetry row uses so a bad turn yields `0`, never a throw.

**Prose twin (blind-playable parity):** the digest is a machine payload with no player-facing surface,
so it has no visual to mirror. Its player-facing consequence — the *narration* — is the prose the
screen reader reads aloud in §7. The cost annotations in this section are a **developer** surface; the
in-app developer twin is the telemetry ring buffer (`GS.dm.telemetry`) rendered in the DM-seat cost
panel, whose accessible form is a plain-text row-per-turn table.

---

## 4. Triage — the latency lever (script-owned)

`dmTriage(w, action)` (`sendTurn` calls it at `dm.js:396`) stamps a **script-owned lane** onto the
turn so the DM loop routes routine beats to the fast model and memorable ones to Opus **without
re-deciding per turn**. For this turn:

- `lane: "fast"` **[real]** (the scribe log records `t-mr59t9kwhseaq | fast`).

This is where the **latency budget sits**. The LATENCY LAW (POSITIONING.md §4; MEMORY) is a hard
launch gate: **no launch until routine turns ≤ 15 s**. A "who was that figure" inquiry is a routine
beat → fast lane → cheap model → inside budget. The model *does not choose its own lane* — the script
does, off the action text, deterministically. The lane and its chosen model are stamped into the turn
envelope (`turn.lane`, `turn.laneModel`, `dm.js:401`) and stashed for the telemetry row
(`GS.dm.lastTurnMeta`, `dm.js:416-417`).

> ⚠ **This turn's ~65 s round-trip [real] was over the loop-era bridge, not a lane-routed API call.**
> The 65 s is the human-DM-through-the-Claude-Code-loop tax (MEMORY: "loop round-trip tax is the slow
> part, not the model"), not the fast model's own latency. The ≤15 s gate is measured against the
> *seat* path, not the loop harness. Flagged so the number is not misread as a model-latency claim.

---

## 5. The turn request — one POST, then long-poll

`sendTurn` finalizes and ships (`dm.js:400-422`):

```
turn = { turnId, worldId, action, rolls:[], digest, lane:"fast", laneModel, laneReasons, lastResolution }
POST DM_BASE + "/turn"   →   then pollResponse(turnId)   [long-poll, dm.js:431]
```

Before the POST, the script does three durable things (`dm.js:405-412`): pushes the player line to the
DM chronicle (`pushDmLog`), snapshots the codex `pendingAckSeq` watermark (so a crashed turn can't
advance the digest-diet acknowledgment), and **`saveU(U)`** — the player's action is persisted
*before* the AI is even consulted. The world survives a mid-turn crash.

The bridge writes `turn-<turnId>.json` to the `.dm/` mailbox; a DM session (Claude over the `/loop`,
in this harness) reads it, composes a reply, and writes `response-<turnId>.json`. The app's long-poll
(`pollResponse`, `dm.js:431-445`) surfaces the reply the instant it lands. **This is the harness path**
— GPT-5.5's outside read (`GPT-5.5-advice-for-Claude/README.md`) is explicit that the bridge is a
*cheap proving harness*, not the product architecture; the durable architecture is the digest +
`TurnRequest`/`TurnResponse` contract + typed `events[]`, all of which are identical on the eventual
`/seat` path.

---

## 6. The TurnResponse — the AI's entire contribution

The DM answers with a `TurnResponse` (the `@typedef` at `dm.js:1183-1192`). For this turn the model
produced **one paragraph of narration and four typed events**. Reconstructed to the shipped contract
(narration content **[real]** from the session; event envelopes shaped to `DM_EVENT_TYPES` and
`DM_EVENT_FIELDS`, `dm.js:1218` / `1237-1319`):

```json
{
  "turnId": "t-mr59t9kwhseaq",
  "narration": "Beabella wipes her hands on her apron... 'That's Costtore Barvino. Owes the
                Color-Miners more than he'll say. Checks the seep-lines before light — before
                anyone can ask him for it.' She doesn't meet your eye on the word owes.",
  "events": [
    { "type": "codex_add",    "source": "declared",
      "payload": { "kind": "npc", "name": "Costtore Barvino",
                   "fields": { "role": "debtor", "tell": "checks seep-lines before dawn" },
                   "dm": { "secret": "owes the Color-Miners" } } },
    { "type": "codex_reveal", "source": "declared", "payload": { "id": "npc:costtore-barvino" } },
    { "type": "codex_link",   "source": "declared",
      "payload": { "from": "npc:costtore-barvino", "rel": "indebted-to", "to": "faction:color-miners" } },
    { "type": "discovery",    "source": "declared",
      "payload": { "what": "the seep-lines run before dawn", "reveal": "a debt hangs over camp" } }
  ],
  "dmNotes": "seeded the debt thread; NPC left loose per open-handoff"
}
```

**What the AI did:** it *interpreted* the scene — chose a name, a tell, a secret, a relationship, a
hook — and rendered them as prose plus **typed events keyed to a fixed vocabulary it does not get to
invent**. It named an NPC; it did not decide how the codex stores that NPC, whether the reveal is
legal, or what the ledger says. Those are the script's job.

**Response bytes:** `responseBytes = jsonBytes(r)` ≈ **~1,050 B** **[computed]** (narration ~430 chars
+ four compact event envelopes). `narrationChars` ≈ **430** **[computed]**. `eventCount = 4`,
`mintCount = 0` (no `gen[]` this turn) — both read straight off the response in `logDmTurn`'s call site
(`dm.js:479-484`).

---

## 7. Validation → mutation — the determinism border in code

`applyResponse(r)` (`dm.js:457`) runs the whole apply chain **inside a `try/finally`** so no single
event throw can strand the player behind the prep overlay (`dm.js:469` — the SD-001/SD-002 fix). Two
gates fire before any state changes:

1. **`validateTurnResponse(r)`** (`dm.js:473`, def `dm.js:1361-1370`) — machine-checks the whole
   envelope against EVENT-CONTRACT.md. **Non-blocking by design**: it logs violations and applies what
   is valid (resilience > rejection at the narration seam).
2. **`validateEvent(e)`** per event (`dm.js:1348-1357`) — a structural failure (`no type` / bad
   `payload` / bad `source`) no-ops that one event with a structured reason; an **unknown-but-well-
   formed** type still passes (forward-compatible: the taxonomy can grow without a lockstep code
   change).

Then `applyResponse` maps each event through `applyEvent` (`dm.js:475`). Inside `applyEvent`, every
payload is first folded through `dmFoldPayload` (`dm.js:1325-1343`): aliases rewrite to canonical
(e.g. `discovery`'s `name → what`, `dm.js:1284`), unrecognized keys are **kept but made loud**
(`console.warn` + one `drift` ledger line), and only then does the switch run. This is anti-drift at
the field level.

Now the **before → after** for each event, traced through the real mutators:

### Event 1 — `codex_add` (mint an NPC)
`applyEvent` case `codex_add` (`dm.js:2451-2465`) → `codexAdd(w, rec)` (`src/world/codex.js:66-108`).

- **Before:** `codexOf(w).records["npc:costtore-barvino"]` is `undefined`.
- **The determinism guard:** because the payload has no explicit `id`, the script derives one
  (`codexKeyId(kind,name)` → `npc:costtore-barvino`) and checks for a collision with an *established*
  record (`dm.js:2460-2463`). None exists, so the mint proceeds (a warm DM re-minting an established
  "Costtore" would be **refused**, not silently overwritten — ROOT-C).
- **After:** a new record object is created (`codex.js:102-108`): `{ id:"npc:costtore-barvino",
  kind:"npc", name:"Costtore Barvino", fields:{role,tell}, dm:{secret}, status:{ known:false,
  soft:true, at:null, condition:"ok" }, provenance:"authored", seq: C.seq+1 }`. Note `status.known`
  starts **false** — the player does not know this NPC yet just because the DM minted it.
- Returns `{ok:true, id:"npc:costtore-barvino"}`.

### Event 2 — `codex_reveal` (slow drip)
Case `codex_reveal` (`dm.js:2476-2478`) → `codexReveal(w, id)` + `reveal(w,'gaz')`.

- **Before:** `records["npc:costtore-barvino"].status.known === false`.
- **After:** `status.known === true` — the record now rides the *here-and-now* codex slice of future
  digests instead of the roster-only tier. This is the CLAUDE.md "slow drip" made mechanical: minting
  and revealing are **two separate events**, so the DM can know a secret the player doesn't.

### Event 3 — `codex_link` (typed relationship)
Case `codex_link` (`dm.js:2467-2469`) → `codexLink(w, from, rel, to)` (`codex.js:112-119`).

- **Before:** `records["npc:costtore-barvino"].links === []`.
- **After:** `links === [{ rel:"indebted-to", to:"faction:color-miners" }]`, and **both endpoints are
  `codexTouch`ed** (`codex.js:118`) so the far-side faction record rides the next delta digest too.
  The link is stored once on `from` but read both ways by `codexLinksOf`.

### Event 4 — `discovery` (a fact enters the world)
Case `discovery` (`dm.js:2635-2647`). The `name → what` alias has already folded in `dmFoldPayload`
(`dm.js:1284`), so the handler reads the canonical `what`. The handler writes a `canon` ledger line
(`addLedger(w,"canon",…,"Discovered: …")`), fires `reveal(w,'gaz')`, and calls `grantXp(w,"discovery",p)`
— so a learned fact is both audited and (per the XP economy) worth advancement. If `makeNode`/`nodeId`
had been present it would also mint a map node (`addNode` + `reveal(w,'map')`) — not this turn.

### The ledger — the immutable spine
Any of the above that calls `addLedger(w,type,data,text)` (`src/world/state.js:85-87`) appends an
immutable record: `{ id:uid(), t:Date.now(), type, day, min, session, data, text }`. State **changes**
always route through the ledger; the DM chronicle (`pushDmLog`, `state.js` below `dmLogOf`) is the
prose conversation and is separate. This is the event-sourcing backbone: the ledger is the audit trail
that makes every mutation replayable and every world migratable.

---

## 8. Ledger / codex / UI effects + what persisted

After the switch, back in `applyResponse` (`dm.js:486-499`+):

- **DM chronicle:** `pushDmLog(w,"dm", r.narration, {events, applied, dmNotes, latencyMs, turnId})`
  (`dm.js:489`) — the narration + the *applied-results* array join the feed, keyed by `turnId` so
  `session-cost-report.py` can join it to `.dm/turn-*.json`.
- **Streaming render:** `GS.dm.animate = true` (`dm.js:490`) → `renderWorld()` streams the fresh
  narration word-by-word (`streamDMText`).
- **Roll/ask surfaces:** `GS.dm.rollReq` / `GS.dm.ask` are set (`dm.js:491-492`) — `null` this turn (no
  dice asked back).
- **Scene-narrated marker:** because no `rollRequest` came back, `sceneDelivered = true`
  (`dm.js:497`) → the node is marked narrated so triage only deep-lanes *first* contact with a place.
- **Persist:** `saveU(U)` — the two new codex records, the reveal, the link, the discovery, and the
  ledger line are all written to the persistent universe. The player can close the browser and the
  debt thread survives forever.

**Prose twin (blind-playable parity):** every visual effect above has a text-first authority. The
streamed narration is the primary surface and is read verbatim by the screen reader (TEXT-FIRST
FOREVER, POSITIONING.md §5). The codex panel's new "Costtore Barvino" card has a prose-twin record
readable as a plain list (name / role / what-you-know); the faction-link is narrated as a sentence,
not only drawn as an edge. **Acceptance gate** (BLIND-PLAYABLE FULLY, MEMORY): this turn is playable
end-to-end via screen reader with the screen off — the player hears Beabella's answer, and the new
NPC + debt are announced in prose, never only in a graphic.

---

## 9. The telemetry row — discipline becomes evidence

The instant the events are applied, `logDmTurn` writes **one structured row** (`dm.js:477-485`,
def `dm.js:1403-1410`), the `DMTurnTelemetry` shape (`@typedef` `dm.js:1194-1211`). Reconstructed for
this turn:

```json
{
  "turnId": "t-mr59t9kwhseaq",        // [real]
  "worldId": "<bog-iron world id>",
  "t": 1751572000000,                 // client Date.now() — RECONSTRUCTED, re-stamp on real capture
  "session": 0,
  "lane": "fast",                     // [real]
  "laneModel": "<fast lane model>",   // stamped by dmTriage
  "latencyMs": 65000,                 // [real] ~65 s — LOOP-era round-trip, not model latency (see §4)
  "digestBytes": 48540,               // [measured-elsewhere] rich-turn compact digest
  "turnBytes": 48800,                 // [computed] digest + ~260 B envelope
  "responseBytes": 1050,              // [computed] narration + 4 events
  "narrationChars": 430,              // [computed]
  "eventCount": 4,                    // [real] shape
  "eventTypes": ["codex_add","codex_reveal","codex_link","discovery"],
  "mintCount": 0,
  "cost": { "estimated": true, "model": "<fast>", "inTok": 12200, "outTok": 263, "usd": 0.0 },
  "ok": true                          // contract passed
}
```

The `cost` block is computed by `dmEstimateCost(model, inBytes, outBytes)` (`dm.js:1393-1397`):
`inTok = round(turnBytes/4) ≈ 12,200`, `outTok = round(responseBytes/4) ≈ 263`, priced against the
per-token `DM_MODEL_RATES` table (`dm.js:1376-1383`) for the fast lane's model. It is **always flagged
`estimated:true`** — never confused with the metered `usage` figure the `/seat` proxy logs to
`seat-costs.jsonl` (`dm-bridge.py:109`). **[computed]**

This is the exhibit's cost punchline: **a rich four-event turn costs a fraction of a cent of estimated
inference**, and the estimate is a *replayable row* (`GS.dm.telemetry` ring buffer, cap 200,
`dm.js:1385/1405-1406`; shipped to `.dm/telemetry.jsonl` via `POST /telemetry`,
`dm-bridge.py:244-252`). A bad turn is no longer an anecdote — it is a row you can sort by cost or
latency. This is the "disciplined person → disciplined system" jump POSITIONING.md §maturity-roadmap
names as the first thing a technical client looks for.

---

## 10. What this one turn proves (the close)

Trace the ownership one more time. The AI produced **one paragraph and four typed events**. The
script did everything else: scoped the payload (cost), picked the lane (latency), validated the
shapes, executed four deterministic mutations, wrote the immutable ledger line, revealed exactly one
record while keeping a secret, persisted the universe, and logged a cost/latency row.

> **The model narrates and chooses. The engine remembers, prices, validates, and persists.** Every
> hallucination-, drift-, cost-, and latency-risk a client worries about is answered here by *taking
> work away from the model* and giving it to code that cannot lie. That is the transferable product;
> the game is only where it was proved.

---

## Registry updates

*(One-line edits Fable applies to the shared docs when this exhibit lands — this exhibit edits only
its own file.)*

- **docs/DESIGN.md** — add to the registry index: `DM-TURN-WALKTHROUGH (type: exhibit) — the one-turn
  end-to-end killer artifact from POSITIONING §single-killer-artifact; numbers reconstructed until the
  first live .dm/telemetry.jsonl row lands.`
- **docs/NEXT-STEPS.md** — add under the POSITIONING/portfolio track: `Capture a REAL .dm/telemetry.jsonl
  row from a live bridge session and re-anchor DM-TURN-WALKTHROUGH §9 to it (retire the [computed]
  tags); then Fable does the prose-polish pass (DRAFT → final).`
- **docs/README.md** — add to the docs index under the `type: exhibit` line (new taxonomy entry):
  `DM-TURN-WALKTHROUGH.md — one real DM turn traced end-to-end; the POSITIONING Door-B killer exhibit.`
- **docs/POSITIONING.md** — update §"The single killer artifact": `→ drafted at docs/DM-TURN-WALKTHROUGH.md
  (DRAFT; awaiting one live telemetry row to replace reconstructed numbers).`
