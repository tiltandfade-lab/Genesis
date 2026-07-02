---
type: system-spec
status: specced 2026-07-01 night — build-ready (day-3; scout-grounded). World-name pattern table = small, samples not required (mechanical register); presentation = Claude's UI lane.
created: 2026-07-01
related:
  - "[[CHAR-CREATION]]"
  - "[[REGIONS-NAMES]]"
  - "[[ON-DEMAND-GEN]]"
  - "[[SESSION-PREP]]"
---

# This Is Your Life — deepening (names · presentation · the prep bridge)

## §0. Scout findings (2026-07-01; the ground truth)

The ritual bones are good (card-per-step, die FX, back/reroll/next, a bardo-log summary). The
gaps: world naming is free-text + one random fallback (`bardoRollName` → `randomWorldName`);
**rolled MARKS (scars/gray hair/coughs) are never seeded anywhere**; **`GS.CGEN.lifeGold` is
computed but never lands on the sheet**; TIYL people reach the ledger as stubs (role+desc), not
statted NPCs; only hook summaries ride `charHandoff` — the biography's texture is dropped.

## §1. World-name options (Adam's ask)

- New small **`world-name-pattern`** table (mechanical register — d20 patterns like
  `«root»'s «noun»` / `The «adjective» «geography»` / `«culture-root»«suffix»`), drawing roots
  from the REGIONS-NAMES culture banks.
- The found screen offers **three rolled options** + 🎲 reroll + free text (free text always
  wins). Same treatment for the PC-name step: 3 options from the species×(start-region culture)
  blend + free text.

## §2. Presentation (UI lane — the ritual it deserves)

- Apply the existing `show` fade class consistently to every result reveal (it exists, used once).
- Result text paces in via a light `streamDMText`-style reveal on Strange+ rows only (the big
  beats breathe; Grounded rows land instantly — pacing mirrors the spice curve).
- **The Life page:** the full `lifeLog` renders as a permanent, revisitable biography subpanel on
  the character sheet (the keepsake — currently the log dies with the creator). Chronological
  cards, the same visual language as the bardo-log.

## §3. The prep bridge — nothing rolled hits the floor

1. **Marks → the sheet + codex:** `{kind:"mark"}` entries land in `sheet.marks[]` and the PC's
   codex record `fields.marks` (the DM narrates the scar it rolled; NPCs can recognize it).
2. **`lifeGold` → `sheet.gold`** at bind (plus a ledger line). This is a straight dropped-ball
   fix.
3. **People get atoms:** at `bindWorld`, every TIYL-seeded person is back-filled with a full
   `rollNPC` payload (ON-DEMAND-GEN machinery; `opts.name` preserves the seeded identity,
   `provenance:"rolled"`, soft, `status.at` per their story) — backstory people become pushable
   handles, not stubs.
4. **Threads feed prep:** `entrySeeds` threads register as salience-weighted open threads
   (seam/recall fodder), and `assemblePrepBundle` biases ONE first-session frontier hook toward a
   TIYL thread when one exists (the first walk rhymes with the life that just rolled).
5. **The biography rides the handoff ONCE:** `charHandoff` carries a compact full-life digest
   (step → result one-liners) in the prep handoff (send-once — DIET-compatible), so the DM knows
   the whole life, not just the hooks.

## §4. Build + verify

1. Pattern table + name options UI. 2. Presentation pass (§2). 3. Bridge fixes 1–5.
4. `dev/verify-tiyl.mjs` (≥7/0): marks land on sheet+codex · lifeGold lands (mutation check:
break the bind write, harness fails) · every seeded person has rolled atoms post-bind · a TIYL
thread biases a frontier hook when present · handoff carries the life digest once · name options
render 3 + free text wins · regression: `verify-capture`/creator suites unchanged.
