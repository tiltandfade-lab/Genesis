# POSITIONING.md — Genesis as case study, ethos, and pitch

*The career/sales artifact, not a system spec. Purpose: when Adam goes to (A) raise money
to keep building Genesis + hire, or (B) land an AI-engineer job/contract, this is the
prepared narrative and the evidence map. Drawn from the 2026-07-05 Opus + Fable read.
Version-controlled here so the pitch and the proof travel together. Mirror to the Personal
OS when useful.*

**Status:** draft v1 — living doc. Sharpen before each conversation; don't let it drift.

---

## The one line

> An AI system with a **deterministic core**, engineered for **cost, latency, and
> correctness**, built and maintained by an **AI-agent workforce under machine-checkable
> governance**.

Not "a game I made with AI." The game is the demo. **The factory that built it — and the
doctrines that keep it honest — is the case study.**

## The thesis

> The constraint on AI-era software is no longer "can you write code." It's **"can you
> architect trust."** I built a personal engineering organization out of language models,
> and its outputs are **gated, versioned, cost-bounded, and coherent**.

Every client problem in AI right now — hallucination, drift, cost blowout, latency,
unreliable agent output, verification — I had to solve in miniature to make an AI run a
persistent game world without breaking it. Genesis is the world where those solutions were
forged; the solutions are domain-independent.

---

## Two doors this same story opens

Same evidence, two framings. Know which room you're in before you talk.

### Door A — Raise / build / hire ("fund Genesis")
The pitch is **traction + repeatable process**: a 48-system product built solo at
~$1–2/session by a build pipeline that could absorb hired humans *or* more agents without
losing coherence. The ask funds turning a one-person org into a small one. Lead with the
factory's throughput and the unit economics; the game is the beachhead market.

### Door B — Job / contract ("help our dev team build agent-agnostic, trust-first systems")
The pitch is **transferable governance**: I've already built the CI-of-trust, the
agent-management doctrine, the determinism border, the eval instinct — the exact layer your
team is trying to invent. Genesis is proof it works. Lead with the doctrines (below) as
things I'd apply to *their* domain; the game is just where they were battle-tested. This is
the **agent-agnostic, build-trust-into-the-system** contract Adam is targeting for fall 2026.

---

## The five exhibits (the factory)

Each maps a Genesis system to a universal client problem. This is the case-study spine.

1. **The determinism border → "What should the model never touch?"**
   Engine owns nouns/numbers/state; AI owns interpretation only. Markdown tables compile to
   artifacts nobody hand-edits. Playtest mechanical-grounding went from ~20% → ~60–82%.
   *Lesson: hallucination isn't fixed with better prompts — it's fixed by taking work away
   from the model.*

2. **Codex + gazetteer grounding → "How do you stop an AI contradicting itself over time?"**
   A relational entity layer (NPC/Location/Item/Faction, wikilinked) the model must cite;
   worlds that persist forever; anti-drift as a named engineering value. *RAG with teeth, in
   production, over months.*

3. **The multi-agent build pipeline → "How do you get reliable work out of AI agents?"**
   Frontier model writes locked specs → cheaper models execute → orchestrator re-gates every
   unit personally → everything lands as a labeled, revertable `--no-ff` merge. The hard-won
   law: **never trust a subagent's self-reported green.** *This is the AI-workforce operating
   model everyone is trying to invent — documented, with the failure lessons written down.*

4. **SPEED-DOCTRINE + the Latency Law → "How do you make an AI feature economically viable?"**
   ~$1–2/session *by design*. ≤15s/turn as a hard launch gate. No model calls in mechanical
   loops; every spec declares its inference cost; model-tiering chosen off *measured*
   payloads (median digest ~9KB). *Inference treated as a bill of materials — what turns a
   prototype into a product.*

5. **TEXT-FIRST FOREVER + swap-cheap seams + blind-playable → "How do you build so nothing
   load-bearing is fragile?"**
   Event-sourced state IS the game; the PS1 renderer is a replaceable lens; every visual has
   a prose twin; a full screen-reader session is an acceptance gate; all art enters through
   swap-cheap manifest seams. *Architecture that survives its own components — including the
   models — being replaced. Accessibility as an axiom, not a retrofit.*

## The transferable product (the ethos / doctrines)

These are domain-independent and are literally what a client is buying:

- **SPEED-DOCTRINE** — the AI only does AI jobs; mechanical work stays deterministic.
- **Doer/pointer & the coherence laws** — how meaning is assigned without invention sprawl.
- **DIRECTION.md** — a standing trajectory instrument (gates → freeze → soak → build).
- **The spec rubric + Sonnet handoff** — how a frontier spec becomes cheap reliable execution.
- **Gates-before-features** — verification (`check-manifest`, `verify-*`, mutation-regression,
  red-first hard-fails, byte-idempotence) built before the thing it verifies.
- **Docs-as-registry** — DESIGN.md (locked decisions), HANDOFF/NEXT-STEPS, drift named as
  the enemy and fought as a discipline.

---

## The maturity roadmap — "solo build" → "system others can trust"

Unifying theme (Fable): *everything in Genesis currently trusts the builder; production
means the system trusts no one — including Adam, the agents, and the future.* Every item
below is that same move: **encode the governance so the system enforces itself.** And that
encoded-governance layer is itself the sellable product.

**Immediate (Adam named these on 2026-07-05 — BUILT + gated the same day, `feat/dm-seam`):**
- [x] **Structured logging on the DM seat.** ✅ `logDmTurn` writes one `DMTurnTelemetry` row per
      completed turn (latency, lane+model, digest/turn/response bytes, event types applied, mint
      count, an *estimated* token/$ cost off measured bytes) — ring-buffered in `GS.dm.telemetry`
      + shipped to the bridge's new `POST /telemetry` sink (`.dm/telemetry.jsonl`, the mailbox-path
      twin of `seat-costs.jsonl`). Turns cost/latency *discipline* into cost/latency *evidence*: a
      bad turn is now a replayable row, not an anecdote. (dm.js + dev/dm-bridge.py.)
- [x] **Typed contracts at the seams.** ✅ `validateEvent` / `validateTurnResponse` machine-check
      the two inbound shapes against EVENT-CONTRACT.md before the engine trusts them; JSDoc
      `@typedef`s for `DMEvent`/`TurnResponse`/`DMTurnTelemetry`; the full 87-type event vocabulary
      (`DM_EVENT_TYPES`) held in lockstep with `applyEvent`'s switch by a parity test. Forward-
      compatible (unknown-but-well-formed types pass; malformed envelopes no-op, never throw).
      Guards: dev/verify-dm-seam.mjs (38 assertions, incl. a red-first parity + mutation check).

**Next, in the order they'll bite:**
- [ ] **CI — take the gates out of Adam's hands.** GitHub Action runs check-manifest +
      verify-*.mjs on every push; nothing merges ungated by construction. The gates already
      exist — this is a weekend, and it's the jump from "disciplined person" to "disciplined
      system." First thing a technical client looks for.
- [ ] **State migration + schema versioning.** "Worlds persist forever" is an unpriced
      contract: every future change must read or migrate every past world. Versioned events +
      a replay/migration harness *before* strangers own worlds. Biggest sleeping liability.
- [ ] **Failure as a designed state.** Model timeout, bridge jam, half-written state → graceful
      degradation + recovery. TEXT-FIRST is the natural degraded mode — make it engineered,
      not incidental.
- [ ] **Trust boundary for other people's machines.** Sanitize everything the model emits into
      the DOM; real security posture on the bridge; sandbox user/model-generated content.
      Becomes load-bearing the day the UGC/compile-as-validator dream takes a stranger's input.
- [ ] **The bus-factor test (run it as a portfolio piece).** *Can a fresh agent with no memory
      ship a feature end-to-end from the docs alone?* When yes, Genesis stops being a solo
      build and becomes an org with one human in it.

---

## The single killer artifact

**A one-DM-turn walkthrough** (write-up or ~5-min video): roll happens in the engine → event
written → the AI gets a *constrained* payload → narrates → state persists. Annotated with
**where cost lives, where determinism lives, where the latency budget sits.** This one
exhibit proves more than any resume line. Build it once structured logging lands (the log
gives you the real numbers to annotate with).

## The close (don't bury this — lead the ending with it)

The person presenting all of this was painting murals for a living two years ago. The pitch
is not "junior dev, unusual background." It's:

> **The tools changed what one determined person can build, and I am the existence proof —
> with the process artifacts to show it wasn't luck.**

Muralists work at scale, from a design language, under public and permanent constraint.
Genesis is a mural painted in systems.
