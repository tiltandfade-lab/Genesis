---
type: system-spec
status: SPECCED 2026-07-03 — promoted from the 2026-07-01 sketch (its sequencing gate is satisfied); build-ready, forks resolved below
created: 2026-07-01
promoted: 2026-07-03 (Fable — Adam's call: "spec out the remaining work to get a seat working")
related:
  - "[[DESIGN-GUIDE]]"
  - "[[DM-BRIDGE]]"
  - "[[DM-CHARTER]]"
  - "[[SPEED-DOCTRINE]]"
---

# DM-SEAT — the API-direct DM (the launch-unlock, now affordable)

## §0 Why now (what changed since the sketch)

The sketch's own gate — *"DIET → ROLL-BRANCHES → ON-DEMAND-GEN → live playtest on the lean
stack → then the seat, with real cost/latency data steering the forks"* — is **satisfied**: the
2026-07-03 shakedown validated all three live (digest median 9.0KB, zero-second roll branches,
clean gen mint+bind), and the latency decomposition became law (the 170s deep turns were
**loop tax, not model time**; DM-BRIDGE.md §two-call). New since: **the cost measurement.**
Priced off measured payloads (digest ≈3k tokens/turn, narration 110–260 words, ~100–160 turns
per 4-hour session), a GLM-powered seat runs **~$1/hour** (GLM-5.2 $1.40/$0.26-cached/$4.40 per
M tokens; GLM-5/4.7 cheaper). Adam 2026-07-03: *"I can totally afford $1/hr and that's really
when the app becomes playable."* COMBAT-LIFECYCLE also landed same day — fights are now
reachable, so the seat arrives with the full game surface.

## §1 The shape (sketch architecture, kept)

**The app calls the provider API directly through a thin bridge proxy; the mailbox demotes to a
dev harness + loop-DM fallback.** Same contract everywhere: the seat consumes the SAME
TurnRequest/TurnResponse envelope (digest in; narration + events + rollRequest/gen out) — DIET,
ROLL-BRANCHES, ON-DEMAND-GEN transfer unchanged.

```
src/world/seat.js  (new app module — owns assembly + validation + streaming)
   assemble messages → POST /seat (bridge) → provider (GLM / Anthropic) → SSE stream back
   → narration streams into the feed → TurnResponse JSON validated → the existing applyEvent path
dev/dm-bridge.py   (+~60 lines): /seat route = key-inject passthrough proxy + cost logger
.dm/ mailbox       — unchanged; fixtures/verify/replay + the /loop DM stay drop-in swappable
```

### The five forks, resolved

| # | Fork (sketch) | Resolution | Why |
|---|---|---|---|
| 1 | Key custody | **Bridge `/seat` proxy route injects the key** (env `SEAT_API_KEY`; never committed, logged, or sent to the browser) | Same-origin (no CORS problem), no new process, browser never holds the key. The bridge stays *dumb*: it assembles nothing — pure auth-injecting passthrough |
| 2 | Cache keep-alive pings | **Skip in v1** | The DIET made the prefix small; GLM's cached-input rate ($0.26/M) makes cold re-reads cheap. Revisit only if telemetry says otherwise |
| 3 | Tool access | **Pure-JSON contract v1** | The gen[] handshake already covers on-demand rolls; real tool calls are a clean later upgrade on the same route |
| 4 | Session memory | **Rolling window (~12 exchanges) + evict-to-summary** via one FAST-model call per eviction (≤300 tokens); durable memory stays the digest's job (ledger/codex/prep) | Monotonic append preserves the cache prefix; the seam/wrap précis machinery is reusable here |
| 5 | Cost telemetry | **In from day one**: the proxy appends `{turnId, lane, model, tokensIn, tokensCached, tokensOut, ms, usd}` to `.dm/seat-costs.jsonl`; `session-cost-report.py --seat` reads it | The latency law got measured into existence; cost gets the same treatment. The $1/hr claim stays continuously re-measured |

### Providers & lanes

- **OpenAI-compatible adapter first (GLM via z.ai)**: env `SEAT_BASE_URL`, `SEAT_MODEL_DEEP`
  (default `glm-5.2`), `SEAT_MODEL_FAST` (default `glm-4.7`). An `SEAT_PROVIDER=anthropic`
  variant for A/B — same assembly, different wire shape.
- **Lane routing is already solved:** `dmTriage` stamps every turn; `fast` → FAST model, `deep`
  → DEEP. Upgrade-only override (mirror the loop rule). *The fast lane becomes a model parameter
  instead of runbook discipline* — the script owns the routing it already computes.
- **One call per turn.** The two-call protocol was loop-tax amortization; it retires for the
  seat (the runbook section stays, for loop DMs).
- **Streaming**: narration streams into the feed as it generates — first words ~1–2s. The
  TurnResponse is parsed/validated when the stream closes; events apply then (never mid-stream).

## §2 Prompt assembly (app-side, `src/world/seat.js`)

```
[system]   docs/SEAT-PROMPT.md          — static file, fetched once, byte-identical every call
[user 1]   session bootstrap            — prep handoff (⎘) + opening digest, once per session
[...]      rolling window               — last ~12 raw exchanges; older turns as the summary block
[user k]   this turn                    — digest JSON + player text verbatim + lane stamp + roll results
```

**`docs/SEAT-PROMPT.md` is a FRONTIER-AUTHORED unit** (Fable/Opus — the distillation is judgment
work; SPEED-DOCTRINE: GLM only ever *runs* it): DM-CHARTER distilled (voice, agency rules, slow
drip, §8.3b XP ladder, §8.5 capture, §9.3a prejudice line) + the runbook's mechanical contract
(TurnResponse shape, the ~15 most-used event payload shapes, roll-request discipline, morale
binding / tactics advisory, `digest.combat` + `digest.activeWalk` reading, gen[] handshake).
Target ≤12k tokens, ending with two `dev/fixtures/` exchanges as worked examples. Cache
discipline: no timestamps/randomness in the prefix; history appended monotonically.

## §3 Validation (the seat's firewall, app-side)

1. Stream closes → extract the first `{...}` JSON block (tolerate fences/prose slips). Parse
   fail → ONE corrective retry ("Reply with ONLY the TurnResponse JSON"). Second fail → in-voice
   stutter envelope (`events:[]`, `dmNotes:"seat-parse-fail"`); the session never crashes.
2. Schema-gate: required keys; every `events[].type` checked against the live vocabulary
   **derived at runtime** (the module builds the list from `applyEvent`'s own dispatch — no
   hand-copy to drift). Unknown types DROPPED with a `dmNotes` note (applyEvent is
   fuzz-hardened; garbage still dies at the seat).
3. Player-facing honesty unchanged: dice stay open rolls via `rollRequest`; the seat never rolls
   the player's dice (charter law, enforced by the same contract the loop obeyed).

## §4 Acceptance gates (build order, each RED-first)

1. **`dev/verify-seat.mjs`** (jsdom, mock endpoint): assembly (prefix byte-stability across
   turns, window slide, digest inclusion), validation (retry, error envelope, unknown-event
   drop), lane→model mapping, stream-then-apply ordering. No key needed.
2. **`verify-bridge.py` grows /seat cases** (mock upstream): key injection (and key ABSENCE in
   anything logged), passthrough fidelity, SSE relay, cost-line append. (Same rule as ever:
   never run against a live session's `.dm/`.)
3. **`dev/seat-replay.py`** (needs `SEAT_API_KEY`; dev script, not CI): the 4 fixtures against
   real GLM → 4/4 valid envelopes, events in-vocabulary, **routine-turn latency ≤15s (the LAW,
   measured end-to-end at last)**.
4. **Voice gate:** `dev/dm-eval` rubric over the replay narrations — threshold: parity with the
   shakedown-era Sonnet fast-lane scores. The judge stays frontier.
5. **A live seat session** — Adam plays a real hour on GLM (combat included), the playtest rig
   catching what gates can't. Then the lane read: does GLM-4.7 hold the fast lane? If not,
   `SEAT_MODEL_FAST=glm-5.2` — still ~$1/hr.

## §5 Build units (1–3 Sonnet-executable per the rubric; 4 frontier)

1. `feat/seat-app-module` — `src/world/seat.js` + settings toggle (seat ⇄ mailbox) + `verify-seat.mjs`.
2. `feat/seat-bridge-proxy` — the `/seat` route + cost telemetry + verify-bridge cases.
3. `chore/seat-cost-report` — `session-cost-report.py --seat`.
4. **`docs/SEAT-PROMPT.md`** — frontier distillation + `seat-replay.py` + the dm-eval voice gate.
5. The live session (§4.5) → lane tuning → this doc's status flips to BUILT.

## Explicitly kept from the sketch

`handToDM` clipboard stays the manual fallback; the mailbox + /loop DM stay drop-in swappable
(the rotation rig still runs on them); streaming lands with the seat, not before.
