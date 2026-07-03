# Table-order survey — 2026-07-03

Follow-up to `fix/place-drift-order` (Place Drift.md had 54/100 rows out of
roll-ascending band order — a scrambled single-axis d100 ladder). This surveys
the other 37 PROVISIONAL-flagged Engine tables for the **same defect**: a
declared single-axis Band/Tier/Rarity ladder whose rows are not sorted
band-ascending with roll ranges ascending monotonically.

Method: for every `grep -rl PROVISIONAL Engine/` hit (38 files, minus Place
Drift itself = 37), locate a Band/Tier/Rarity column, extract (roll, band) per
data row, rank bands (Grounded<Textured<Strange<Volatile<Mythic, and the
Common..Artifact / Minor..Major / Low..Extreme equivalents), and flag any row
whose band rank is lower than the row before it.

## Result: 0 genuine offenders

No table in this set has Place Drift's defect (a single declared ladder with
rows scrambled out of order). One file trips the raw rank-decrease heuristic
but is a **false positive** — verified by reading the file, not just the
grep — because it has a different, deliberately-declared multi-axis shape:

### False positive — NOT an offender

- **`Engine/03. _Tables/03. Session Mechanics/Pressure/In-Building
  Complications.md`** — heuristic flags ~27 rank-decrease points (e.g. line
  33 roll 9 Grounded following line 32 roll 8 Textured). Read the file: its
  own frontmatter declares **Building is the primary sort key, Band is
  secondary/interleaved within each building block**: "Building-type row
  spans: Residence 1–50 · Religious 51–60 · Tavern/Club 61–75 · Warehouse
  76–85 · Shop 86–100." Within each block, bands are intentionally mixed
  (matches the *global* 66/20/9/4/1 share, not a per-row monotonic order).
  This is a different, declared table shape — not the same bug. Left as-is.

### Also considered, also not offenders (different declared shapes)

- **`Engine/03. _Tables/05. Realms/Realm Items - {Ash, Bright-Kingdom,
  Chrome, Cosmic, Frontier, Gloom, High-Seas, Lost-World, Noir,
  Suburb, Theater}.md`** (10 files) — heuristic flags 2 rank-decrease
  points each (e.g. roll 27 Mythic → roll 28 Grounded). Read one in full
  (Ash): this is a **compound structure by design** — a complete
  Grounded→Mythic ladder (rows 1–27), then a second complete
  Grounded→Volatile/Strange ladder (rows 28–48/49), then a short
  Consumables tail (Grounded only). All 10 siblings share the identical
  12/8/4/2/1 + 6/6/8/1 + 2 block shape. Frontmatter confirms: "Rank ladders
  sit on enchanted + signature rows," with a separate `**Consumable**`
  category called out. Not a scramble — two ladders plus a tail, each
  internally ordered correctly. Left as-is.
- **`Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Loot -
  Outlandish.md`** — has a `Band` column, but its values are
  `utility`/`combat`/`high-power`/`reality-breaking` (a DM-only
  at-a-glance power heuristic per its own frontmatter), not the
  Grounded→Mythic spice ladder, and it is explicitly NOT roll-ordered by
  design (a d300 pop-culture grab-bag; "power-banding pending" per project
  memory). No monotonic-order invariant applies here. Left as-is.
- **`Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Loot -
  Valuables.md`** — has a `**Band**` column (bold markdown, missed by the
  first regex pass, caught on manual recheck). Checked directly: 66
  Grounded / 20 Textured / 9 Strange / 4 Volatile / 1 Mythic, in a single
  contiguous ascending block matching its own declared ranges exactly. Not
  an offender.
- **`Engine/03. _Tables/01. World Building/Mythic Events/Truth vs
  False.md`** — a d20 "truth gradient" Status column, no Band/Tier axis at
  all. N/A.
- Remaining `no-band-column` files (`World Name Patterns.md`, `Faction
  Outcome.md`, `Name Cultures.md`, `Genesis Backgrounds.md`, `Dungeon
  Dressing Mega Table.md`, `Dungeon Reinforcements.md`) — no Band/Tier/
  Rarity column present; the invariant doesn't apply.

### Confirmed correctly-ordered (single contiguous ladder, band-ascending)

Downtime Ledger, Walk Nightmare - Urban, Shrine and Omen, Walk Breach -
Dungeon, Walk Skin - Dungeon, Distant Word, Walk Skin - Urban, Walk
Nightmare - Dungeon, Walk Breach - Urban, NPC Life Event, Walk Breach -
Wilderness, Festival and Holy Days, Walk Skin - Wilderness, Chase
Complications, Walk Nightmare - Wilderness, Region Identity, Dungeon Loot -
Valuables — 17 tables, all clean.

## Caveat

This is a targeted heuristic (band-rank monotonicity on a detected roll+band
column pair), not a full hand-audit of all 37 files' internal logic. Adam is
mid-review of these PROVISIONAL tables per the project's craft-pass discipline
— no edits were made here per the task instructions. If a future pass wants
to hand-verify the two multi-axis families above (In-Building Complications'
building-block interleave; the 10 Realm Items compound ladders) against their
own declared invariants line-by-line, that's the next-level check; this
survey only confirms none of them exhibit Place Drift's specific defect
(a single declared ladder, scrambled).
