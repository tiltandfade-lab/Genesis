---
type: doctrine
status: locked 2026-07-02 afternoon (Adam's speed mandate) — BINDING on every future spec
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
**The script does everything with a right answer:** rolls, rules, state, memory, arithmetic,
simulation, selection, placement, pricing.

**The test for every future spec:** *"Is the AI doing an AI job?"* If a proposed feature puts a
model call inside a mechanical loop, prices a rule, or remembers state — it's mis-assigned.

## The inference ledger (designed state)

Per-turn AI: ONE narration call max (Sonnet fast lane, 80–120 words; Opus deep beats only), and
only on turns that need a voice. Zero-inference interactions: branched checks · all
shop/economy · lodging/rest · level-ups · trash foe turns · morale · chases · travel assembly ·
drift/faction turns/life events · gen mints · recalls · job postings · the battlemap ·
tarot draws. Session-scoped AI: Stage-2 synthesis (Haiku, background, once) — the
throughline-finding that IS the AI's best job. One-time AI: fragments, omens, table authoring.
Rare riders (effect dice, epithets, breach voice) travel inside responses already being written
— never extra calls.

## The budget (at 2026 prices)

Routine turn ≈ 3–4k in / ~200 out on Sonnet ≈ $0.01–0.02. A 4-hour session ≈ **$1–2 all-in**.
Daily play ≈ $40–50/mo — before the DM seat's prompt caching and before the curve. The $400/mo
failure mode was the pre-DIET fat digest; it is dead, and `session-cost-report.py` is the
tripwire that keeps it dead.

## Standing rules (binding)

1. Every new spec MUST state its inference cost (per-turn / per-session / one-time / zero).
2. No model call inside a mechanical loop, ever. Riders attach to existing calls.
3. Heavy AI work runs prep-time or background (fire-and-continue), never blocking a turn.
4. Latency-reducing spend (prefetch P2) stays OFF until cost data says otherwise.
5. The fast/deep lane split is sacred: routine beats never pay frontier prices.
6. `session-cost-report.py` runs after every playtest; a cost regression is a P1 bug.

## The moon-shot line

The landmark isn't "an AI that answers fast" — it's a game where **most moments don't need an
answer** because the dice already spoke, and when the AI does speak, it's doing the one thing
only it can: making a hundred scattered rolls mean something.
