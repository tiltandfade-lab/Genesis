---
type: doctrine
status: locked 2026-07-02; clarified by Adam 2026-08-04 — BINDING on every future spec
created: 2026-07-02
related:
  - "[[DIGEST-DIET]]"
  - "[[ROLL-BRANCHES]]"
  - "[[DM-SEAT]]"
  - "[[DESIGN-GUIDE]]"
---

# The Speed Doctrine — the AI does only what only AI can do

## The thesis (Adam, 2026-07-02)

Genesis is built ahead of the compute curve ON PURPOSE: the script-owned world (tables, rollers,
walks, drift, economy, combat — the permanent half) never gets slower or costlier; inference (the
rented half) deflates ~10× every ~18 months. A design that reduces per-turn AI work rides the
curve; one that leans on AI is priced by it. **The specs must stay inference-elastic:** when
compute cheapens, the same architecture buys deeper lanes, richer synthesis, prefetch — with
zero redesign.

## The division (the locked doctrine, restated as a test)

**AI does generation constrained by structured input** — its comparative advantage:
reskin · recontextualize · find the throughline across disparate rolls · voice · interpretive
meaning. Grounded input = low drift, high magic.
**The script does everything with a right answer:** rolls, applicable-rule execution, state,
memory, arithmetic, simulation, selection, placement, pricing. The phrase “rules” does **not**
authorize a closed verb parser: for novel fiction, the AI DM still decides intent, whether a rule
applies, what check/DC/advantage/stakes fit, and when an exception is warranted. Once applicability
is settled, the engine owns the numbers and accepted mutation.

**The test for every future spec:** *"Is the AI doing an AI job?"* If a proposed feature puts a
model call inside a mechanical loop, prices a rule, or remembers state — it's mis-assigned.

## The inference ledger (designed state)

Per-turn AI: ONE narration/adjudication call max (fast/deep quality lane selected separately), and
only on turns that need interpretation or voice. Zero-inference interactions include exact factual
display/recall and explicit UI mechanics with no dramatic consequence. Mechanics-first interactions
such as rest resolve without inference but may spend one call afterward when the settled receipt
deserves narration. Freeform attacks, travel, searches, purchases, item uses, and object interactions
are **not** zero-inference merely because an engine resolver exists; ambiguous applicability stays
with the DM. Session-scoped AI: Stage-2 synthesis (background, once) — the
throughline-finding that IS the AI's best job. One-time AI: fragments, omens, table authoring.
Rare riders (effect dice, epithets, breach voice) travel inside responses already being written
— never extra calls.

## The budget (at 2026 prices)

Routine total prompt ≈ 3–4k tokens in, with a TurnRequest narration budget of 60 target / 75 max
words (50/70 for pre-resolved mechanics; 110/160 for deep beats). The steady-state
`beat-digest/v1` portion now targets **1–3 KiB**, with the stable prompt/bootstrap/history accounting
for the rest. The exact provider price remains a bake-off measurement, not a fixed doctrine number.
A four-hour session target remains roughly **$1–2 all-in** at the earlier 2026 price assumptions.
Daily play ≈ $40–50/mo — before the DM seat's prompt caching and before the curve. The $400/mo
failure mode was the pre-DIET fat digest; it is dead, and `session-cost-report.py` is the
tripwire that keeps it dead.

## Standing rules (binding)

1. Every new spec MUST state its inference cost (per-turn / per-session / one-time / zero).
2. No model call inside a mechanical loop, ever. Riders attach to existing calls.
3. Heavy AI work runs prep-time or background (fire-and-continue), never blocking a turn.
4. Latency-reducing spend (prefetch P2) stays OFF until cost data says otherwise.
5. Execution route and model-quality lane are separate. `dmRoute` may bypass only exact facts or
   declared mechanics with a complete resolver/receipt; unknown free text remains open. `dmTriage`
   sets a quality floor and never grants execution authority.
6. `session-cost-report.py` runs after every playtest; a cost regression is a P1 bug.
7. The full `dmDigest()` is bootstrap/debug truth, not the ordinary per-turn payload. Turn context
   uses one sparse beat view and deterministic named-noun retrieval; omitted state remains canon and
   may never be invented. Increasing the 3 KiB ordinary target requires replay evidence, not a
   convenience bump.
8. **THE LATENCY LAW (Adam, 2026-07-03; tightened 2026-08-04):** the older ≤15s routine-completion
   launch bar remains an outer ceiling, but it is not the desired experience. Target meaningful
   feedback within **4s**; **8s with no real feedback is a failure signal**. This is an evidence gate,
   not a promise that current providers meet it. A response may finish later if narration is already
   streaming or the player is engaged reading/rolling. Measure route, mechanics, digest, request ack,
   first token/meaningful feedback, response completion, and input unlock separately; report
   distributions before claiming a ceiling. Latency is a first-class inference cost.
9. Timeout or bridge loss pauses the exact persisted TurnRequest. It does not reject the id, unlock
   a replacement action, or contaminate the following turn. Resume reuses the id; only explicit
   Abandon closes it.

## The moon-shot line

The landmark isn't "an AI that answers fast" — it's a game where **most moments don't need an
answer** because the dice already spoke, and when the AI does speak, it's doing the one thing
only it can: making a hundred scattered rolls mean something.
