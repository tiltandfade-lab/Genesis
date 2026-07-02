---
type: system-spec
status: specced 2026-07-02 afternoon (Adam's directive: the 300-row job board scales and GENERATES walks — "infinite quests!"). Batch-3 unit (replaces the plain job-board wiring in wiring-sweep-A).
created: 2026-07-02
related:
  - "[[WIRING-MAP]]"
  - "[[TABLE-GAPS-070126]]"
  - "[[SESSION-PREP]]"
  - "[[ECONOMY-SINKS]]"
  - "[[REPUTATION]]"
---

# Job Walks — the notice board that mints adventures

## §0. Adam's directive

The 300-row `npc-job-board` is L1-flavored by default. Re-spec: **jobs SCALE (pay + threat by
tier) and ACCEPTING one GENERATES a walk** — even just 1–2 segments for small jobs. The board
becomes an infinite, self-refreshing quest source: 300 authored rows × tier scaling × district/
region/skin recontextualization = jobs never repeat the same way twice.

## §1. The posting

Rolled at: tavern/board contact, Downtime "seek work," or a prep seed. A posting =
`{ row (the authored job text), tier (place tier ± region econTilt), pay (scaled: base gp ×
TIER_PAY[tier], the row's stakes re-read at tier — "rats in the cellar" at T2 is "something
IN the cellar"), env hint (urban/wilderness/dungeon inferred from the row or rolled), poster
(a ROLLED NPC — the employer; recurring employers become contacts) }`. 2–3 postings per board
read; unclaimed postings persist a few days then resolve WITHOUT you (a `drift`/Distant-Word
line — someone else took it, or nobody did and it got worse).

## §2. Accepting mints a walk

`jobWalk(posting)` → a **1–3 segment walk** via the existing rollers: segments =
`1 + ⌊pay tier⌋` (small coin = one scene; real coin = a real trek), threat = tier, env = the
hint, skin/motif/grants apply (the multiplication machinery makes every job unique), the job's
OBJECTIVE binds the finale (objectiveRef → the combat XP bonus already built). Completion pays
through `item_changed` gold + reputation with the poster's faction + a possible follow-up chain
(the employer's next posting is warmer, bigger — a rolled employment arc). Failure/abandonment:
rep hit + the posting resolves badly in the ledger (consequences, always).

## §3. Guards

Pay scales are `XP_TUNE`-style constants (provisional until felt). Job walks are REAL walks —
provenance, consumption reporting, drift on their nodes; nothing bespoke. A job's walk anchors
OFF-city when the env hint says so — jobs are a road OUT of town as often as an errand inside
it (feeds §4's start-variety rule). Verify (≥8/0): posting tier math · segment count by pay ·
finale carries objectiveRef · unclaimed postings resolve via ledger after TTL (mutation check:
persist forever, fails) · employer recurrence warms attitude · rep pays on completion ·
regression: walk/economy suites.

## §4. Rider (from the same directive set): ADVENTURES DON'T ALWAYS START IN CITIES

The seed dispatch (catalyst/rumor-intel/background-event wiring into prep + TIYL opening) must
guarantee locus variety: **seed anchors roll their environment** — prep's frontier spread
already rolls 3 env kinds; the SEED source may not bias urban. Rule: across any session-prep,
at least one live seed anchors non-urban; the TIYL-biased first frontier (TIYL-DEEPENING §3.4)
may land in the middle of nowhere when the thread says so. (verify: seed-locus distribution
over 1k preps ≈ env-uniform ±10%.)
