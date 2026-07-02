---
type: system-spec
status: SKETCH 2026-07-01 — design direction only; a roadmap tier (DESIGN-GUIDE "pluggable DM seat"), talk-through with Adam before any build
created: 2026-07-01
related:
  - "[[DESIGN-GUIDE]]"
  - "[[DM-BRIDGE]]"
  - "[[DIGEST-DIET]]"
  - "[[ROLL-BRANCHES]]"
---

# The DM Seat — in-app DM, API-direct (sketch)

## Why (the last latency leg)

After the DIGEST-DIET and ROLL-BRANCHES land, the remaining turn-time floor is **the loop tax**:
a polling file mailbox + a `/loop` Claude session that wakes, re-reads, and re-orients. The
DESIGN-GUIDE already locks "pluggable DM seat" as the destination — this sketch records what that
buys and the shape, so the cost/latency work above steers toward it instead of around it.

## The shape

- **The app calls the Claude API directly** (`fetch` from the browser or a thin local relay for
  key custody — fork to resolve). One conversation per session: a **stable cached prefix**
  (DM charter + runbook + world bootstrap, in fixed order) + appended turns. Turns inside the
  cache TTL prefill at ~10% cost and start ~instantly; the lean digest (DIET) makes even cold
  re-reads cheap.
- **Streaming** straight into the feed — first words in ~1–2s instead of after a full compose.
- **The fast lane becomes a model parameter** (`dmTriage` → `model:` per call) instead of runbook
  discipline — the script owns the routing it already computes.
- **The mailbox demotes to a dev harness** (fixtures, verify-*, replay) — it stays; it's the test
  seam. `handToDM` clipboard stays as the manual fallback.
- Same contract everywhere: the seat consumes the SAME TurnRequest/TurnResponse envelope
  (digest in, narration+events+rollRequest/gen out) — DIET, ROLL-BRANCHES, and ON-DEMAND-GEN all
  transfer unchanged. Over the seat, `gen`/`peek` become plain tool calls (the async workarounds
  in those specs are bridge-era ergonomics, explicitly designed to be discardable).

## Forks to talk through with Adam (before any build)

1. **Key custody**: browser-held key (localStorage, dev-grade) vs a tiny local relay process
   (safer, one more moving part) vs the existing bridge process growing a `/api` proxy route.
2. **Cache economics**: keep-alive pings to hold the prefix warm between slow player turns —
   worth it only if the prefix is big; with the DIET it may not be.
3. **Tool access**: does the seated DM get tools (peek-state, SRD-by-key, gen) as real tool calls
   v1, or stay pure-JSON contract first?
4. **Session memory**: compaction policy when the conversation grows (the seat can self-summarize
   into a session précis — the seam/wrap machinery already produces one).
5. **Cost telemetry**: the seat can report exact token usage per turn → feed
   `dev/session-cost-report.py` real numbers instead of byte-estimates.

## Explicitly not now

Not build-queued. Sequence stands: DIGEST-DIET → ROLL-BRANCHES → ON-DEMAND-GEN deep run → live
playtest on the lean stack → *then* the seat, with real cost/latency data steering the forks.
