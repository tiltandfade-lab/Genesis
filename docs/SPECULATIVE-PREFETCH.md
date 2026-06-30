---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-30
related:
  - "[[SESSION-PREP]]"
  - "[[SYNTHESIS-CONTRACT]]"
  - "[[DM-BRIDGE]]"
  - "[[CONSEQUENCE-LADDER]]"
  - "[[CODEX]]"
  - "[[DESIGN]]"
---

# Genesis — Speculative Prefetch (spec v1, draft)

Hide DM latency by compiling the *next* turn's assets **during the idle window** — the 10–60s the player
spends reading the last turn and typing the next. When the player acts, the supporting material is already
staged, so the turn is a lean read instead of a 100-second derive. Unused speculation is **never wasted**:
it is meaning-soft and recycles into whatever actually happens.

## 0. The problem & the insight

Per-turn latency is dominated by the DM (a) generating narration and (b) re-deriving supporting assets
mid-turn (monster stat blocks from the 56k-line `data/bestiary.js`, NPC records, location detail, the next
beat's atoms). The fast-lane (`DM-BRIDGE.md`) and the prep fan-out (`prep-fanout.workflow.js`) attack (b)
at session start. This spec extends that to **every turn, continuously, in the gap the player gives us for
free.**

The cardinal insight — the reason this avoids classic speculative-execution waste:

> **Prefetch ASSETS, never NARRATION.**
> Narration depends on the player's exact action — speculate it and a wrong guess is thrown away.
> Assets (stat blocks, NPC/location records, rolled atoms) are **meaning-soft**: an asset prepped for a
> branch the player didn't take is not waste — it recontextualizes into whatever they *did* do, because
> the engine rolls atoms and the AI assigns meaning on contact. **Unused = recycled, not discarded.**

This is not a new mechanism — it is the **generalization of the soft-cast → lock-on-contact → recycle
model** (`SESSION-PREP`, `prepRecycleStale`, `lockOnContact`) from *once per session* to *continuously,
between turns*. Half of this feature already exists; this spec adds the *timing* and the *targeting*.

## 1. The idle window

The trigger is `applyResponse` (`src/world/dm.js`) — the instant the DM's turn lands and the player begins
reading/typing. At that moment the app fires a **low-priority speculative pass** (it must never contend
with or delay a real turn the player submits). The window closes when the player submits their next turn;
in-flight speculation either completes into the pool or is abandoned harmlessly.

## 2. The `anticipate` protocol

The DM already ends a turn on an open handoff or an `ask`. It adds one OPTIONAL field to its TurnResponse:

```jsonc
"anticipate": [
  { "branch": "opens the north door",  "needs": ["location:flooded-undercroft", "creature:gray-ooze"] },
  { "branch": "presses the priest",    "needs": ["npc:vorn-the-warden"] },
  { "branch": "fights",                "needs": ["creature:cultist x3"] }
]
```

2–4 entries, the most likely next moves and the assets each needs. This is a HINT, never a rail — the
player may do none of them (§5 handles that). Omitting it falls back to the deterministic lane (§3a) only.

## 3. Two prefetch lanes

- **(a) Deterministic reserve — cheap, no LLM, in-grain, do anytime.** The engine pre-rolls the *atoms*
  for likely next beats (an NPC, an encounter, a place — the soft cast) into a **speculative reserve**,
  exactly as `prepCastFrontier` rolls soft cast today. Instant. Always safe (atoms are meaning-neutral).
  This is Phase 1 and needs no bridge or DM-loop change.
- **(b) LLM asset compile — the real perceived-latency win.** During the idle window a background **Sonnet
  subagent** compiles the assets named in `anticipate.needs` (or, absent hints, the reserve's atoms):
  full stat blocks, NPC records, location reskins — keyed by id into the **speculative pool**. This is the
  prep fan-out (`prep-fanout.workflow.js`) fired incrementally per turn instead of once per session.

## 4. The speculative pool

A bounded, evictable store of prefetched assets, keyed by stable id (`creature:gray-ooze`,
`npc:vorn-the-warden`, `location:flooded-undercroft`). Model it on the **soft codex pool** the codex
already bounds and evicts (`prep.js` eviction of orphaned soft cast). Entries are SOFT until drawn.
Bound the size; evict oldest-unused beyond the cap. Persisted on the world so a reload keeps the reserve.

## 5. Draw-on-match / recycle-on-miss

When the player's real turn arrives:

- **Match** — the action hits an anticipated branch (or needs a pooled asset): the DM **draws it from the
  pool instantly** and locks it to canon (the `lockOnContact` analogue). No lookup, no wait — the turn is
  lean. This is the win.
- **Miss** — the player did something else: the prefetched assets **stay soft in the pool** and are
  **recontextualized** later. A stat block rolled for "the ooze behind the north door" becomes the next
  creature the fiction needs; an NPC record becomes the next stranger. The atoms carry no committed
  meaning until drawn, so re-skinning is free — the same property that lets `prepRecycleStale` recycle
  unvisited rumors today.

There is no "wrong guess penalty," because we never committed narration to the guess.

## 6. Why nothing is wasted (cache validity)

Classic prefetch invalidates on a mispredict. Here there is nothing to invalidate: assets are
context-free until contact. The only true waste is *tokens spent compiling an asset that is never drawn
and eventually evicted* — bounded by the pool cap and mitigated by running lane (b) on Sonnet. Acceptable:
the player's idle time is otherwise pure dead wall-clock, and a generous fraction of prefetches will hit.

## 7. Bridge protocol additions

- TurnResponse gains optional `anticipate[]` (§2).
- A new **speculative turn kind** the app POSTs at idle: `{ kind:"speculate", afterTurnId, anticipate }`
  — the DM loop answers it on the fast/background lane, writing assets to the pool via a new
  `pool_staged` event (or reusing `prep_applied` with a `speculative:true` flag). It must be
  distinguishable from a real turn so it never renders as narration and never blocks the player.
- The speculative pass is **preemptible**: if a real turn arrives mid-speculation, the real turn wins.

## 8. Phasing

1. **P1 — deterministic reserve (no LLM, no bridge change).** Maintain a replenished speculative reserve
   of pre-rolled atoms the DM draws from and recycles. Pure groundwork, low risk. *(Buildable now.)*
2. **P2 — idle-window LLM asset compile.** App fires the `speculate` turn on `applyResponse`; DM loop runs
   the background compile (reuse `prep-fanout`); assets land in the pool. The perceived-latency payoff.
3. **P3 — `anticipate`-driven targeting + hit-rate telemetry.** DM emits branch hints; measure draw hit
   rate (reuse the per-turn latency timer) and tune pool size / how many branches to compile.

## 9. Open questions

- **Pool cap & eviction policy** — size, and LRU vs. relevance-weighted (distance from the PC, clock
  pressure).
- **How many branches to compile** per idle window (cost vs. hit rate) — settle empirically in P3.
- **Persisted vs. session-only pool** — persisting survives reloads but risks staleness; lean persisted
  with a session stamp.
- **DM-loop participation** — P2/P3 require the DM session to answer `speculate` turns; document in the
  runbook and gate behind a flag so a plain DM loop still works without it.

## 10. Anti-drift alignment

This is anti-drift-positive, not a risk: it moves work *out* of the live turn (where the DM is most
tempted to invent under time pressure) and *into* pre-rolled atoms the script owns. The pool is soft
canon until contact; meaning is only ever assigned on draw, through the same lock-on-contact gate as the
rest of the codex. "Can the script own this?" — yes: the reserve, the pool, the keying, the recycle are
all mechanical. The AI only ever assigns meaning on contact, never sooner.
