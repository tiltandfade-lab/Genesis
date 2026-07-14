---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
created: 2026-07-06
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
related:
  - "[[DM-SEAT]]"
  - "[[DM-BRIDGE]]"
  - "[[EVENT-CONTRACT]]"
  - "[[DM-CONTRACT-ARTIFACT]]"
  - "[[SPEED-DOCTRINE]]"
---

# SEAT-ADAPTER — make `/seat` the true adapter boundary

**One sentence:** the browser always sends the provider-agnostic Genesis shape
`{turnId, lane, system, messages}`; the bridge's `/seat` route owns EVERYTHING
provider-shaped — lane→model mapping, wire dialect, key injection, provider extras,
normalized SSE frames, usage/cost logging — so bridge/harness assumptions can never leak
into the production seat (GPT-5.5 outside read, `GPT-5.5-advice-for-Claude/README.md`
§Seat-Specific Notes; recommendation ADOPTED).

**PROVISIONAL flags for Adam: none.** Every fork below is resolved. Inference cost delta:
**zero** (this is transport plumbing; no model call is added anywhere — SPEED-DOCTRINE
compliant; the seat's one-call-per-turn + one-corrective-retry budget is unchanged from
DM-SEAT.md §1/§3).

---

## §0 Why this spec exists — the divergence is total, and only a mock hides it

The two halves of the seat were built by separate units against different readings of
DM-SEAT.md §5.2, and **the current seat path has never been runnable against a real
provider**. All verifiers are green (verify-seat 35/35, verify-bridge 43/43) because the
browser side is tested against a stub `/seat` and the bridge side against a mock upstream
that ignores the request body. The halves have never met. This spec makes them meet, on
the browser's terms.

### §0.1 The current divergence, exactly (every ref verified 2026-07-06)

| # | Site | What it does today | Why it's wrong |
|---|------|--------------------|----------------|
| D1 | `src/world/seat.js:383-388` (`seatPostAndStream`) | POSTs `Object.assign({}, assembled, { lane, turnId })` where `assembled = {system, messages}` — i.e. the wire body is exactly `{system, messages, lane, turnId}`. **No `model`, no `stream` key.** | This half is CORRECT (it already speaks the Genesis shape). It is the fixed point; the bridge moves to it. |
| D2 | `dev/dm-bridge.py:267-336` (`_do_seat`) | Pops `turnId` (line 277) and `lane` (line 278), reads `model = body.get("model", "unknown")` (line 279), then forwards the **remaining body verbatim** to `SEAT_BASE_URL + "/chat/completions"` (lines 281-283). | The forwarded body is `{system, messages}` — a real OpenAI-compatible upstream 400s it (no `model`, no `stream`, and `system` is not a chat-completions field). The bridge is an OpenAI-passthrough for a body the browser never sends. |
| D3 | `dev/dm-bridge.py:27` (header env docs) | "`SEAT_MODEL_DEEP` … (informational only; **the app picks the model in its request body**)" | Directly contradicts `src/world/seat.js:348-352`: "the actual env-var resolution lives **bridge-side** … the app just names the lane." Two modules, two owners on record; neither implements it. |
| D4 | `dev/dm-bridge.py:300-311` (relay loop) | Relays the upstream SSE **byte-for-byte** ("never parses/edits narration", lines 264-266). | The browser reader `seatConsumeSSELine` (`src/world/seat.js:300-326`) expects normalized frames: a `{"delta":"…"}`/`{"text":"…"}` payload, or a metadata frame whose sole top-level keys are in `SEAT_SSE_WRAPPER_KEYS` (`seat.js:299` — `["usage","ping","keepalive"]`). A raw OpenAI chunk `{"choices":[{"delta":{"content":"Hello"}}]}` has sole key `choices` — not a wrapper key — so it falls through and **streams raw provider JSON into the player's feed as narration**, and the concatenated raw chunks then fail `seatExtractJson` (`seat.js:204-218`), burning the one retry and landing the stutter envelope every turn. |
| D5 | `dev/verify-bridge.py:133-137, 148-151` | The seat test body carries `model: "glm-5.2"` and `stream: True`, and the fidelity check asserts relayed bytes `== CANNED_SSE` verbatim. | The test suite **encodes the passthrough assumption** — it keeps the wrong contract green. The mock upstream (`verify-bridge.py:82-97`) discards the request body, so D2's missing-model bug is invisible. |
| D6 | `src/world/seat.js:181-193` (`seatEventVocabulary`) | Derives the event vocabulary by regexing `Function.prototype.toString.call(applyEvent)` for `case "…":` labels. | Superseded by the explicit registry: `DM_EVENT_TYPES` (`src/world/dm.js:1218`, 87 entries) is already held in lockstep with `applyEvent`'s switch by a RED-FIRST parity test (`dev/verify-dm-seam.mjs:99-121`). The regex is a second derivation of the same truth — exactly the duplicate-source drift this codebase forbids — and it breaks under minification/refactor (GPT read, adopted). |

### §0.2 Doctrine (binding, from the outside read + Adam's framing)

- **Bridge/mailbox = dev harness.** `POST /turn`, `GET /response`, `/state`, `/dm/turns`,
  `/telemetry`, `/reset` + the `.dm/` files + the `/loop` Claude DM. This is the cheap
  proving harness that tests the AI-DM contract on subscription usage. **It keeps working
  unchanged — it is not deprecated, not the product, and this spec does not touch one
  byte of it.**
- **`/seat` = the production adapter seam.** Provider keys, model routing, wire dialects,
  normalized streaming, cost logs. Everything provider-shaped lives behind it.
- **Shared contract** (both transports, unchanged): digest, TurnResponse, typed `events[]`,
  open player dice via `rollRequest`, `gen[]`. The browser applies state through ONE
  pipeline (`applyResponse` at `src/world/dm.js:457`, `applyEvent` at `dm.js:1412`)
  regardless of transport.

---

## §1 The locked wire contract

### §1.1 Browser → bridge (the Genesis seat shape) — UNCHANGED, now enforced

`src/world/seat.js` already sends this; the bridge now validates it instead of forwarding it.

```json
{
  "turnId":  "t-abc123",
  "lane":    "fast",
  "system":  "<full SEAT-PROMPT.md text>",
  "messages": [ { "role": "user", "content": "..." },
                { "role": "assistant", "content": "..." } ]
}
```

Bridge-side validation in `_do_seat`, in this order, each failure → `400`
`{"error": "bad seat request: <reason>"}` and **nothing forwarded upstream, nothing logged
to seat-costs.jsonl**:

1. `turnId` present and passes the existing `_safe_tid` (`dev/dm-bridge.py:62-64`) —
   reason `"bad turnId"`. (Today `/seat` never validates it; it only reaches the jsonl,
   but the log must not be injectable either.)
2. `lane` — OPTIONAL. Three sub-cases, all NON-fatal (a triage hiccup never fails the
   turn):
   - String `"deep"` or `"fast"` → mapped per §1.2, logged verbatim.
   - Any OTHER string (unrecognized) → mapped to `"fast"`, logged verbatim (the raw
     string is safe jsonl and useful for debugging triage drift).
   - **Missing, or present but NOT a string** (number/object/array/`null`/bool) →
     mapped to `"fast"`, logged as the literal string `"unknown"` (matching today's
     `:278` missing-default). **Never serialize a non-string value into
     `seat-costs.jsonl`** — the log line's `lane` field is always a string. RULING:
     non-string lane is treated exactly like missing, NOT 400'd — lane is advisory
     routing metadata, not part of the request's validity (contrast `system`, which IS
     the payload and hard-fails on wrong type). Pinned by check B13 (§6).
   Ruling: every degraded case fails toward the CHEAP model, never the expensive one.
3. `system` — REQUIRED, type string (empty string allowed; the browser's `seatReady` gate
   at `seat.js:77-80` means it never actually sends empty, but the bridge doesn't crash if
   it does) — reason `"system must be a string"`.
4. `messages` — REQUIRED, non-empty array; every entry must be an object whose `role` is
   in `{"user","assistant"}` and whose `content` is a string — reasons
   `"messages required"` / `"bad message role"` / `"message content must be a string"`.
   Validation is a FIELD check, not a strict shape match: an entry carrying EXTRA keys
   (e.g. `{role, content, name}`) is ACCEPTED if `role`/`content` pass, and the bridge
   forwards upstream ONLY the two-key projection `{"role": …, "content": …}` — extra
   keys are STRIPPED, never forwarded (same posture as §1.1.6's top-level unknown-key
   rule: tolerate in, never relay out). Pinned by check B14 (§6). (The browser only ever
   sends bare two-key entries — `seatWindowPush` at `seat.js:141-148` and the assembly at
   `:156-167` — so the projection is a no-op on the real client; the rule exists so a
   future browser field can't silently leak onto the provider wire.)
5. **FORBIDDEN top-level keys: `model`, `stream`, `stream_options`.** Any present →
   reason `"provider dialect keys are bridge-owned: <key>"`. This is the teeth: the
   passthrough-era assumption becomes impossible to silently reintroduce from either side.
6. Any OTHER unknown top-level key → ignored (forward-compatible), never forwarded.

### §1.2 Lane → model mapping (bridge-owned, env-resolved)

| `lane` | model sent upstream | env | default |
|---|---|---|---|
| `"deep"` | `SEAT_MODEL_DEEP` | already read nowhere today — becomes real | `glm-5.2` |
| `"fast"` (and anything else / missing) | `SEAT_MODEL_FAST` | same | `glm-4.7` |

Read both at startup next to `SEAT_BASE_URL`/`SEAT_API_KEY` (`dev/dm-bridge.py:45-46`).
The cost line's `model` field becomes the **mapped** model (today it logs the browser-sent
model, i.e. `"unknown"` forever under the real browser body). `dmTriage`'s `laneModel`
("sonnet"/"opus", `src/world/triage.js` via `dm.js:401`) stays loop-era-informational
inside the digest message; the bridge never reads it — do NOT rename or repurpose it in
this unit.

### §1.3 Provider dialects (`SEAT_PROVIDER` env: `"openai"` default, `"anthropic"` A/B)

**openai** (GLM via z.ai — the v1 target, DM-SEAT.md §1 "Providers & lanes"):

- URL: `SEAT_BASE_URL.rstrip("/") + "/chat/completions"` (unchanged, `:281`).
- Headers: unchanged (`Authorization: Bearer <SEAT_API_KEY>`, `Accept: text/event-stream`).
- Body built by the bridge:

```json
{
  "model": "<mapped per §1.2>",
  "messages": [ { "role": "system", "content": "<system>" },
                ...browser messages in order, each projected to
                exactly {"role", "content"} per §1.1.4... ],
  "stream": true,
  "stream_options": { "include_usage": true }
}
```

- Upstream frame parse: each `data:` line → JSON → `obj.choices[0].delta.content`
  (string, may be absent on the usage-only final chunk) → one normalized delta frame.
  `obj.usage` (dict) wherever it appears → captured for the usage frame (last one seen
  wins, same tolerance as today's `_extract_usage`, `:86-105`).

**anthropic** (the A/B variant; same assembly, different wire shape — DM-SEAT.md §1):

- URL: `SEAT_BASE_URL.rstrip("/") + "/v1/messages"`.
- Headers: `x-api-key: <SEAT_API_KEY>` (NOT `Authorization`), `anthropic-version: 2023-06-01`,
  `Content-Type: application/json`, `Accept: text/event-stream`.
- Body: `{"model": <mapped>, "system": <system>, "messages": <browser messages in order,
  each projected to exactly {"role","content"} per §1.1.4>, "max_tokens": 8192,
  "stream": true}`. (`max_tokens` 8192: narration is 110–260 words +
  the TurnResponse JSON — DM-SEAT.md §0 measurements; 8192 is a mechanical ceiling with
  headroom, not a taste call.)
- Upstream frame parse: `content_block_delta` events → `delta.text` → delta frames;
  usage assembled from `message_start` (`usage.input_tokens`,
  `usage.cache_read_input_tokens`, `usage.cache_creation_input_tokens`) + the final
  `message_delta` (`usage.output_tokens`). Normalization: `prompt_tokens = input_tokens +
  cache_read_input_tokens + cache_creation_input_tokens`, `cached_tokens =
  cache_read_input_tokens`, `completion_tokens = output_tokens`.
- Pricing: models not in `SEAT_PRICING_PER_M` (`dev/dm-bridge.py:51-56`) fall to
  `SEAT_PRICING_DEFAULT` — existing behavior, kept. Add real Anthropic rows only when the
  A/B actually runs (a data edit, dated per the table's own comment discipline, `:48-50`).

### §1.4 Bridge → browser: the normalized Genesis SSE dialect

The bridge emits ONLY these three frame shapes, each written and **flushed immediately**
as its source data arrives (never buffered to stream-end — see §5 LATENCY LAW):

```
data: {"delta":"<narration/JSON text chunk>"}\n\n     — zero or more, in order
data: {"usage":{"prompt_tokens":N,"cached_tokens":N,"completion_tokens":N}}\n\n
                                                      — exactly once, after the last delta
                                                        (all-zeros if upstream reported none)
data: [DONE]\n\n                                      — exactly once, always last, ALWAYS
                                                        emitted by the bridge itself
                                                        (upstream's own [DONE] is consumed,
                                                        never relayed)
```

Why JSON-wrapped deltas and not raw text: (a) delta text containing `\n` would break SSE
line framing raw; JSON escaping makes every frame one line; (b) `seatConsumeSSELine`
(`src/world/seat.js:300-326`) already prefers `{"delta":…}`, already treats a sole-key
`{"usage":…}` frame as metadata (line 299 allowlist), and already ends on `[DONE]`
(`:311`) — **zero browser reader changes**. The reader's fall-through path (unrecognized
JSON streamed as literal text, `:320-322`) becomes what it was designed to be: a safety
net, not the main path.

HTTP mechanics: status 200, `Content-Type: text/event-stream`, `Cache-Control: no-store`,
CORS `*`, no `Content-Length` — connection-close delimits the stream, exactly as the
verbatim relay works today (`BaseHTTPRequestHandler` HTTP/1.0 default; `verify-bridge.py`
already reads to close). No change to transfer framing.

### §1.5 Usage / cost logging

`_seat_log_cost` (`dev/dm-bridge.py:108-125`) keeps its exact line shape
`{turnId, lane, model, tokensIn, tokensCached, tokensOut, ms, usd}` and its key-free
guarantee. Changes of VALUE only: `model` = mapped model (§1.2), tokens from the
normalized usage (`tokensIn = prompt_tokens − cached_tokens`, floor 0 — same arithmetic
as today's `:329-335`). `_extract_usage` (`:86-105`) is DELETED — the normalization loop
captures usage in the same single pass it relays frames (no second scan of a buffered
byte blob, which also removes the only reason the bridge held the whole stream in memory).

**Ruling — cost lines are per-CALL, not per-turn:** the browser's one corrective retry
(`seatResolveResponse`, `seat.js:407-420`) re-POSTs with the SAME `turnId`; that yields
two jsonl lines with one `turnId`. Correct — both calls cost money. The future
`session-cost-report.py --seat` (DM-SEAT §5 unit 3, unbuilt — no `--seat` flag exists in
`dev/session-cost-report.py` today, verified) must SUM by `turnId`; noted here so that
unit inherits the ruling.

### §1.6 Error dialect (bridge → browser, non-stream failures)

| condition | response |
|---|---|
| seat env unset | `503 {"error":"seat not configured (SEAT_BASE_URL/SEAT_API_KEY unset)"}` — unchanged (`:268-271`) |
| bad request (§1.1) | `400 {"error":"bad seat request: <reason>"}` |
| upstream HTTP error | `<upstream status>` with body `{"error":"seat upstream <status>: <first 500 chars of upstream body text>"}` — NORMALIZED, replacing today's verbatim relay (`:312-323`). Provider dialect must not leak to the browser even in errors; 500 chars keeps quota/model messages legible without an unbounded splat. |
| upstream unreachable | `502 {"error":"seat upstream unreachable: <ExceptionName>"}` — unchanged (`:324-325`) |
| upstream dies MID-stream (connection drop after 200) | emit the usage frame (zeros if none seen) + `[DONE]`, close cleanly. The browser then treats the truncated text like any parse failure — retry once, then stutter envelope (`seat.js:407-420`). Never a half-open hang. |

Browser side needs no change: `seatPostAndStream` already throws on `!r.ok` (`seat.js:387`)
into `seatBridgeDown` (`:431-437`). Upstream timeout stays 120s (`:294`) — the ≤15s law
gates ROUTINE turns at the replay harness (§5), not deep-lane worst cases at the socket.

---

## §2 Event-vocabulary validation — registry, not regex (D6)

**Change `seatEventVocabulary` (`src/world/seat.js:181-193`) to read the explicit
registry `DM_EVENT_TYPES` (`src/world/dm.js:1218`) directly. Delete the
`Function.prototype.toString` regex derivation entirely** — keeping it as a fallback
would be a second source of the same truth, and the registry is already parity-locked to
`applyEvent`'s switch by `dev/verify-dm-seam.mjs:99-121` (RED-FIRST, mutation-proven).
Load order is safe: `dm.js` is script 1317, `seat.js` 1318 in `genesis.html` (verified).

New body (signature, cache, and `force` semantics preserved — callers at `seat.js:231`
and the test harness don't change):

```js
let _seatEventVocabCache = null;
function seatEventVocabulary(force){
  if(_seatEventVocabCache && !force) return _seatEventVocabCache;
  _seatEventVocabCache = (typeof DM_EVENT_TYPES !== "undefined" && Array.isArray(DM_EVENT_TYPES))
    ? DM_EVENT_TYPES.slice()
    : [];
  return _seatEventVocabCache;
}
```

Also update the module's §3.2-quoting header comment at `seat.js:175-180` (it currently
cites the regex approach as the spec) and the `manifest.json` `world.seat` module `desc`
(entry starts at `manifest.json:2786`; the `desc` field is at `manifest.json:2834` and
DOES cite the derivation — "seatEventVocabulary() derives the valid events[].type set by
scanning applyEvent's own switch source via Function.prototype.toString" — rewrite that
clause to "seatEventVocabulary() reads the explicit DM_EVENT_TYPES registry
(dm.js:1218)"; verified 2026-07-06, this edit is REQUIRED, not conditional).

**Coherence dividend:** TRANSITION-CONTRACT.md (spec-locked tonight) grows
`DM_EVENT_TYPES` 87 → 92 (`docs/TRANSITION-CONTRACT.md:306`); the seat's accept-list now
inherits new events the moment that unit lands, with the seam parity test as the single
drift guard.

**DM-CONTRACT-ARTIFACT dependency (named):** `docs/DM-CONTRACT-ARTIFACT.md` (drafted
tonight, same batch) owns generating `dm-contract.json` from `DM_EVENT_TYPES` /
`DM_EVENT_FIELDS` (`dm.js:1218` / `:1237`) + digest shape + examples. **Binding
constraint recorded here:** any out-of-browser seat validator — specifically the future
`dev/seat-replay.py` (DM-SEAT.md §5 unit 4, unbuilt) and any provider eval scored on
state hygiene — MUST read `dm-contract.json`, never a hand-copied vocabulary and never a
source regex. In-browser, the live globals remain the runtime truth (the artifact is
generated FROM them). Build-order: this spec's units A1/A2 have **no dependency** on
DM-CONTRACT-ARTIFACT; only the later seat-replay unit consumes it.

---

## §3 Harness/product boundary — the explicit law

1. **The mailbox is untouched.** No edit in this spec may change behavior of `/turn`,
   `/response`, `/state`, `/dm/turns`, `/telemetry`, `/reset`, the `.dm/turn-*.json` /
   `response-*.json` / `state.json` / `telemetry.jsonl` files, or the long-poll (`:180-199`).
   The mailbox section of `verify-bridge.py` (its first 29 checks) must pass UNMODIFIED —
   that is the "loop bridge keeps working" gate, mechanically enforced.
2. **`/seat` touches exactly one file:** `.dm/seat-costs.jsonl`. It never reads or writes
   any mailbox file. (True today; now law.)
3. **The browser never speaks provider dialect** — no `model`, no `stream`, no provider
   frame parsing beyond the normalized dialect (§1.4). Enforced both ways: bridge 400s
   forbidden keys (§1.1.5); verify-seat asserts the POST body shape (§6 check V1).
4. **The bridge never speaks GAME dialect.** It does not parse narration, does not
   validate `events[]`, does not know `DM_EVENT_TYPES`. The app is the sole firewall
   (DM-SEAT §3) and sole state owner (DM-BRIDGE "State ownership"). Event validation
   bridge-side would be a second implementation of the contract — forbidden.
5. **Transports stay drop-in swappable** through `sendTurn`'s single branch
   (`src/world/dm.js:385-393`): `w.dm.transport === "seat"` → `seatSend`; anything else →
   the mailbox path byte-for-byte unchanged. This spec adds no second branch point.
6. Live-session discipline unchanged: never run `verify-bridge.py` against a live `.dm/`
   (it resets the mailbox — the standing gotcha), and don't edit `docs/DM-BRIDGE.md`
   mid-live-session.

---

## §4 Build units (both Sonnet-executable; A1 ∥ A2 — no shared files, either order)

### Unit A1 — `fix/seat-adapter-bridge` (`dev/dm-bridge.py` + `dev/verify-bridge.py`)

1. Add env reads `SEAT_MODEL_DEEP` (default `"glm-5.2"`), `SEAT_MODEL_FAST` (default
   `"glm-4.7"`), `SEAT_PROVIDER` (default `"openai"`) beside `:45-46`; extend the startup
   banner's seat line (`:350`) with the provider + both models (never the key).
2. Rewrite `_do_seat` (`:267-336`) per §1: validate (§1.1) → map lane (§1.2) → build the
   dialect body (§1.3) → stream-parse upstream lines incrementally, emitting normalized
   frames with per-frame flush (§1.4) → capture usage in-pass → emit usage frame +
   `[DONE]` → `_seat_log_cost` with the mapped model (§1.5). Errors per §1.6. Delete
   `_extract_usage`. Line-buffering rule: split upstream bytes on `\n`, hold the trailing
   partial line — the same discipline `seatReadSSE` uses browser-side (`seat.js:279-283`).
3. Correct the header docs: `:8-9` ("assembles nothing … relays the SSE stream back
   verbatim" → the adapter description), `:23-28` (env table: model vars are no longer
   "informational only"; add `SEAT_PROVIDER`), `:262-266` (the passthrough comment block →
   adapter contract, citing this doc).
4. Update `verify-bridge.py` seat cases per §6 (B-checks): Genesis-shape bodies, a
   body-recording mock upstream, normalized-relay + boundary-400 + latency checks.

**Worked before → after (D2, the core site):**

Before (today, `dev/dm-bridge.py:277-283`): browser body `{"turnId":"t-9","lane":"deep",
"system":"You are the DM…","messages":[{"role":"user","content":"{\"turnId\":\"t-9\"…}"}]}`
→ pops turnId/lane, `model="unknown"` → upstream receives
`{"system":"You are the DM…","messages":[…]}` → real GLM endpoint: **HTTP 400, no model**
→ browser `seatBridgeDown` toast. Cost line (mock runs only): `"model":"unknown"`.

After: same browser body → validation passes → lane `deep` → `glm-5.2` → upstream receives
`{"model":"glm-5.2","messages":[{"role":"system","content":"You are the DM…"},
{"role":"user","content":"{\"turnId\":\"t-9\"…}"}],"stream":true,
"stream_options":{"include_usage":true}}` → upstream chunk
`data: {"choices":[{"delta":{"content":"The seam "}}]}` relays to the browser as
`data: {"delta":"The seam "}` the moment it arrives → after upstream EOF:
`data: {"usage":{"prompt_tokens":3120,"cached_tokens":2200,"completion_tokens":410}}` +
`data: [DONE]` → cost line `{"turnId":"t-9","lane":"deep","model":"glm-5.2",
"tokensIn":920,"tokensCached":2200,"tokensOut":410,"ms":6210,"usd":0.003664}`.

### Unit A2 — `fix/seat-vocab-registry` (`src/world/seat.js` + `dev/verify-seat.mjs` + manifest desc)

1. Replace `seatEventVocabulary` per §2 (delete the regex + the `applyEvent` toString
   read; registry read + cache + `force`).
2. Update the header comment `seat.js:175-180` and the `world.seat` desc in
   `manifest.json` (`:2834` — required, per §2).
3. Add verify-seat checks V1–V4 (§6). Run `python3 build/check-manifest.py` after the
   module edit (must end `RESULT: OK`).

**Worked before → after (D6):**

Before (`seat.js:184-192`): `seatEventVocabulary()` regexes `applyEvent`'s source; if a
test deletes `"kill"` from `DM_EVENT_TYPES` via `win.eval`, the vocabulary **still
contains** `"kill"` (it never read the registry), and
`seatValidate({narration:"x",events:[{type:"kill",payload:{}}]})` keeps the event
(`dropped.length === 0`).

After: same registry mutation → `seatEventVocabulary(true)` length 87 → 86, `"kill"`
absent → the same `seatValidate` call drops it (`dropped.length` 0 → 1, event stripped
before `applyEvent`). The value MOVED — the BUG-01 lesson applied.

---

## §5 LATENCY LAW (≤15s routine turns — the launch gate) — how this design serves it

1. **One provider call per routine turn, zero loop tax.** The adapter adds exactly one
   same-origin localhost hop (sub-millisecond) between browser and provider. The two-call
   protocol was loop-tax amortization and stays retired for the seat (DM-SEAT §1).
2. **Normalize-and-flush, never buffer.** Frames are parsed and re-emitted per upstream
   line with an immediate `flush()` (§1.4). Whole-stream buffering before relay is
   FORBIDDEN — it would push time-to-first-word from ~1–2s to the full turn duration,
   which is the difference between a turn that FEELS ≤15s and one that feels dead.
   Deleting `_extract_usage`'s post-hoc scan (§1.5) removes the one design pull toward
   buffering. Enforced by check B12 (§6): a staggered mock proves the first delta reaches
   the client before the upstream finishes.
3. **The measurement instrument rides every turn:** `ms` in `seat-costs.jsonl` is
   wall-clock upstream time per call; the ≤15s gate itself is asserted end-to-end by
   `dev/seat-replay.py` (DM-SEAT §4.3, unchanged, future unit) — this spec keeps that
   number honest by ensuring the bridge contributes parse-relay overhead only (target:
   the bridge adds <50ms over the raw upstream stream; no gate on this number in v1, the
   B12 ordering check is the structural guarantee).
4. Lane mapping failing cheap (§1.1.2) means a triage hiccup can never silently route a
   routine turn to the slow expensive model.

---

## §6 Regression checks — RED-FIRST, mutation-asserting, exact counts

Baselines verified green on the current tree (2026-07-06):
`node dev/verify-seat.mjs` → **"✓ seat: 35 passed, 0 failed"** ·
`python3 dev/verify-bridge.py` → **"43 passed, 0 failed"**.

### verify-bridge.py (unit A1) — seat section reworked: 2 checks modified in place, 12 added → **55 passed, 0 failed**

Mock upstream grows: records each request BODY (JSON) alongside the auth header; serves
per-dialect canned streams; gains a no-`[DONE]` variant and a staggered-timing variant.
Test bodies become Genesis-shaped: `{"turnId":"seat-t1","lane":"deep","system":"SYS",
"messages":[{"role":"user","content":"probe turn"}]}` (no `model`, no `stream`). Test env
sets `SEAT_MODEL_DEEP=glm-5.2`, `SEAT_MODEL_FAST=glm-4.7` explicitly (pricing checks stay
deterministic AND the mapping is proven by mutation, not defaults).

Modified in place (RED against the fixed bridge if un-updated; both currently encode the
passthrough):
- M1 "passthrough fidelity" → **"normalized relay: concatenated `delta` frames == mock
  narration"** (`"Hello, traveler."` reconstructed from `{"delta":…}` frames ONLY; raw
  `choices` chunks reaching the client = fail).
- M2 "cost line has turnId/lane/model" → model asserted as the MAPPED `glm-5.2` (RED
  against un-fixed bridge, which logs `"unknown"` for a body with no model key — the
  value moves `"unknown"` → `"glm-5.2"`).

Added (each RED against the un-fixed bridge, shown failing before the A1 code change lands
— executor must run the suite once mid-unit with only the tests updated to record the
red state):
- B1 upstream body `model == "glm-5.2"` for lane `deep` (red: no model key forwarded today).
- B2 **mutation:** second call with lane `fast` → upstream body model `glm-4.7`; assert
  `bodies[0].model != bodies[1].model` (the mapping MOVED with the lane).
- B3 upstream body has `stream === true` and `stream_options.include_usage === true`.
- B4 upstream `messages[0] == {"role":"system","content":"SYS"}` and the browser messages
  follow in order (red: `system` forwarded as a top-level field today).
- B5 upstream body contains NO `turnId`/`lane`/`system` top-level keys.
- B6 POST with top-level `"model"` → 400, mock saw zero requests, no cost line.
- B7 POST with top-level `"stream"` → 400.
- B8 POST with `messages: []` → 400.
- B9 POST with `turnId: "../x"` → 400 (red: today `/seat` accepts it).
- B10 usage frame normalized: client received exactly one
  `{"usage":{"prompt_tokens":1000,"cached_tokens":400,"completion_tokens":200}}` frame
  (from the canned OpenAI usage chunk of `verify-bridge.py:77-78`).
- B11 no-`[DONE]` mock variant: client stream still ends `usage` frame + `data: [DONE]`
  (bridge-emitted terminal).
- B12 staggered mock (two deltas, 1.2s apart, reading the response incrementally): first
  `delta` frame arrives ≥1.0s before stream close (red against any buffered
  implementation; guards §5.2 forever).

Untouched and REQUIRED green: all 29 mailbox checks; key-injection, key-absent-from-disk,
key-absent-from-body, 503-unset, cost-append, tokens/usd arithmetic checks (usd math
unchanged: `600*1.40 + 400*0.26 + 200*4.40 / 1e6`).

### verify-seat.mjs (unit A2) — 4 added → **"✓ seat: 39 passed, 0 failed"**

- V1 (boundary ratchet, green pre-fix, locks D1): the recorded `/seat` POST body's key set
  is exactly `{system, messages, lane, turnId}` — asserts `!("model" in body)` and
  `!("stream" in body)` explicitly.
- V2 (ratchet): `seatEventVocabulary(true)` is set-equal to `win.DM_EVENT_TYPES` (87
  entries today; count asserted as `=== win.DM_EVENT_TYPES.length`, not a literal, so
  TRANSITION-CONTRACT's 92 lands green).
- V3 (**RED-FIRST + mutation**, the D6 proof): `win.eval` splices `"kill"` out of
  `DM_EVENT_TYPES` → `seatEventVocabulary(true)` length drops by exactly 1 and lacks
  `"kill"`. FAILS on current code (regex ignores the registry) — record the red run
  before applying the §2 change.
- V4 (**mutation, downstream**): with the splice still in place,
  `seatValidate({narration:"x",events:[{type:"kill",payload:{}}]})` yields
  `dropped.length === 1` where the identical call pre-splice yielded `0` (assert BOTH
  values — the drop count moved, not just a label). Restore the registry
  (`seatEventVocabulary(true)` re-read) before subsequent checks.

### Manifest gate (unit A2)

`python3 build/check-manifest.py` → final line **`RESULT: OK`** (run after ANY module edit
— CLAUDE.md discipline).

---

## §7 Edge cases — enumerated rulings

| # | Case | Ruling |
|---|---|---|
| E1 | `lane` missing or an unknown string | Map to FAST model; log lane as received (missing → `"unknown"`). Never fail the turn on a triage hiccup; never fail toward the expensive model. |
| E2 | Corrective-retry re-POST, same `turnId` | Accepted; two cost lines, one turnId (§1.5 ruling — per-call accounting; the future `--seat` report sums by turnId). |
| E3 | Upstream reports no usage block | Emit all-zeros usage frame; cost line logs zeros, `usd: 0.0`. Never skip the frame (frame count is part of the dialect). |
| E4 | Browser disconnects mid-stream | Stop relaying on `BrokenPipeError`/`ConnectionResetError` (today's `:309-310` behavior), keep consuming upstream to capture usage, still log the cost line — money was spent whether or not the client stayed. |
| E5 | Upstream connection drops mid-stream | Usage frame (zeros if unseen) + `[DONE]`, clean close (§1.6 last row). Browser-side retry/stutter machinery owns recovery. |
| E6 | Delta text contains `\n`, `"data:"`, or `"[DONE]"` | Safe by construction — JSON-escaped single-line frames (§1.4). No sentinel collision is possible inside a JSON string payload. |
| E7 | Upstream sends its own `data: [DONE]` | Consumed by the bridge parser, never relayed; bridge emits its own terminal after the usage frame. Exactly one `[DONE]` ever reaches the browser. |
| E8 | `SEAT_PROVIDER` set to an unknown value | Startup: print a warning line and treat as `"openai"`. A typo'd env var must not brick the dev loop. |
| E9 | Empty-string `system` | Forwarded as an empty system message (openai) / empty `system` field (anthropic). The browser's `seatReady` gate makes this unreachable in practice; the bridge stays total anyway. |
| E10 | Multiple usage blocks in one upstream stream | Last one wins (today's `_extract_usage` tolerance, preserved in the in-pass capture). |
| E11 | `messages` containing a `system` role from the browser | 400 `"bad message role"` — the system prompt travels ONLY in the `system` field; two channels for the same thing is drift bait. |
| E12 | Unknown top-level request keys (future fields) | Ignored, not forwarded, not an error — forward-compatible except the three forbidden provider keys (§1.1.5-6). |

---

## §8 Blind-playable parity (doctrine gate)

**No new visual surface.** The adapter changes transport bytes only. Streamed narration
already renders through the existing feed (the `GS.seat.streamText` block,
`src/world/render.js:186-191`, into the same `.dm-txt` prose line every DM reply uses,
finalized via `streamDMText`, `render.js:539`) — the prose feed IS the prose twin, and it
is unchanged. No panel, no prose-twin path to add; parity holds by construction.

---

## §9 Don't-touch list

- **Generated files — never hand-edit:** `tables.json`, `tables.js`, `data/bestiary.js`,
  `data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js` (spec generator
  edits only; none are needed here).
- **The mailbox** (§3.1): every non-`/seat` route and `.dm/` file behavior in
  `dev/dm-bridge.py`; the 29 mailbox checks in `verify-bridge.py`.
- `src/world/dm.js` — no edits. `applyEvent`, `applyResponse`, `sendTurn`'s branch,
  `DM_EVENT_TYPES`/`DM_EVENT_FIELDS`/`DM_EVENT_SOURCES` are read, never written, by this
  spec. (TRANSITION-CONTRACT owns tonight's registry growth.)
- `docs/SEAT-PROMPT.md` — frontier-authored unit (DM-SEAT §5.4), not touched, still absent
  by design; `seatBoot`'s clean degrade (`seat.js:86-101`) is the intended behavior.
- `docs/DM-BRIDGE.md` / `docs/DM-SEAT.md` bodies — registry-update one-liners only (§10),
  applied by Fable, never mid-live-session.
- `.dm/` of any live session; never point verifiers at port 5175.
- `dev/session-cost-report.py` — the `--seat` flag remains DM-SEAT §5 unit 3's job; this
  spec only hands it the E2 summing ruling.

---

## §10 Registry updates (Fable applies; listed only — NOT applied by this spec's executors)

- `docs/DESIGN.md` (decision registry): add — "2026-07-06 · SEAT-ADAPTER: `/seat` is the
  true adapter boundary — browser speaks Genesis shape `{turnId, lane, system, messages}`
  only; bridge owns lane→model, provider dialect (`SEAT_PROVIDER`), key injection,
  normalized SSE (`{"delta"}`/`{"usage"}`/`[DONE]`), cost logging; seat event vocabulary
  reads `DM_EVENT_TYPES`, regex derivation retired; mailbox = harness, untouched
  (docs/SEAT-ADAPTER.md)."
- `docs/NEXT-STEPS.md`: queue units `fix/seat-adapter-bridge` (A1) and
  `fix/seat-vocab-registry` (A2) — parallel-safe, no deps on each other; both precede any
  real-provider seat run; `dev/seat-replay.py` (DM-SEAT §5.4) gains the "validate against
  `dm-contract.json`" constraint (blocks on DM-CONTRACT-ARTIFACT build).
- `docs/README.md` (docs index): add `SEAT-ADAPTER.md` under `type: system-spec` — "the
  /seat adapter boundary: Genesis wire shape, provider dialects, normalized SSE, cost
  telemetry; harness/product boundary law."
- `docs/DM-SEAT.md`: annotate §5.2 — "the /seat route is an ADAPTER, not a passthrough —
  superseding detail in docs/SEAT-ADAPTER.md" (the fork-1 'bridge stays dumb: pure
  auth-injecting passthrough' wording is superseded on the wire-shape point; key custody
  + same-origin reasoning stand).
- `docs/DM-BRIDGE.md`: one line in the routes table row for `POST /seat` → "adapter per
  docs/SEAT-ADAPTER.md (Genesis shape in, normalized SSE out)". Apply between sessions only.
- `docs/DM-CONTRACT-ARTIFACT.md` (tonight's sibling spec): cross-note that
  `dev/seat-replay.py` + provider evals are named consumers of `dm-contract.json`
  (constraint originates here, §2).
