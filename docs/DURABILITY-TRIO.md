---
type: system-spec
status: specced 2026-07-01 night — three small build-ready units: world export/import · environmental rust · Chronicle⇐Ledger. Day-2/3.
created: 2026-07-01
related:
  - "[[ITEMS]]"
  - "[[WORLD-TURN]]"
  - "[[ECONOMY-SINKS]]"
---

# The Durability Trio — export/import · rust · one history

## §1. World export/import (the "forever" promise, insured)

"Worlds persist forever" currently means *forever in one browser's localStorage*. Fix:
- **Export:** ⚙ Menu gains "Export universe" (full `U` → pretty JSON download,
  `genesis-universe-<date>.json`) and "Export this world" (one world wrapped in a minimal `U`).
- **Import:** file picker → validate (`version` key + `worlds` shape) → **merge by world id**
  with a conflict prompt (imported world exists locally → duplicate-as-copy with a new id; NEVER
  silently overwrite). `migrateWorld` runs on every import (old saves upgrade on the way in).
- No server, no cloud — a file in the player's hand. Verify (≥5/0): round-trip
  export→wipe→import = deep-equal world · version-less file rejected with a readable error ·
  conflict duplicates instead of overwriting (mutation check: allow overwrite, harness fails) ·
  legacy-save import migrates.

## §2. Environmental rust (Adam's call: everyone, gentle, weapons AND armor)

- **Trigger:** a non-magical METAL weapon/armor (ITEMS metadata — reconcile the material/category
  fields; magic gear immune) used or worn through a qualifying exposure: combat in rain/storm
  weather, submersion (travel water crossing, underwater fighting), acid/slime contact
  (hazard/condition events). The exposure is detected from EXISTING signals (walk weather,
  terrain water, hazard events) — never DM bookkeeping.
- **Progression — tell first, teeth second:** first qualifying exposure sets instance condition
  `rusting` (a TELL: the feed chip + narration hook "a bloom of orange at the fuller"); the
  SECOND un-maintained exposure upgrades to `rusted`: weapon damage die steps down one size ·
  armor AC −1. Never worse than `rusted` (gentle, not a death spiral).
- **Maintenance = the ritual sink:** a **whetstone & oil kit** (new mundane item, 1 gp, 5 uses)
  clears `rusting`/`rusted` during any rest; a smith (economy) clears it for 1 gp flat. Downtime
  "work" weeks auto-maintain everything carried.
- Verify (≥6/0): rain-combat rusts an iron sword but not a staff or a +1 blade (mutation check:
  let magic rust, harness fails) · two exposures step the die down · kit/rest clears · AC math ·
  chips render · regression: `verify-items` 123/123.

## §3. Chronicle ⇐ Ledger (the oldest deferred gotcha, Track A 2026-06-18)

The prose Chronicle (`world.log`) and the structured ledger are parallel stores written in
tandem. Collapse them:
- **Render the Chronicle FROM the ledger:** a `chronicleLine(entry)` formatter per entry type
  (most entries already carry their prose `text`; the formatter is mostly passthrough + styling),
  rendered newest-first with the existing Chronicle UI.
- **Migration:** legacy `world.log` lines that lack a ledger twin are preserved by importing them
  as `session`-type ledger entries once (idempotent, stamped) — then `world.log` writes STOP
  (reads remain for old saves until migrated).
- **Payoff:** WORLD-TURN drift/npc-life entries, REPUTATION epithets, and travel arrivals become
  narrated history automatically — one store, no tandem-write drift, and the DIET's ledger
  windows feed the same lines the player reads.
- Verify (≥5/0): every ledger type renders a line · legacy log imports once, idempotent
  (mutation check: run twice, no duplicates) · new events write NO `world.log` lines · the
  Chronicle view byte-matches expected fixtures · reveal gating unchanged.
