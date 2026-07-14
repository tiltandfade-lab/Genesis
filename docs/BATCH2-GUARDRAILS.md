---
type: build-guardrails
status: BINDING addendum to the batch-2 units (2026-07-01 night). Same contract as BATCH-GUARDRAILS.md — G0 + G9 there apply VERBATIM here; this adds batch-2 rulings + gates.
created: 2026-07-01
---

> ⚠ SUPERSEDED IN PART (2026-07-06, `SPICE-RAISE.md`): the 66/20/9/4/1 band-share law is an AUTHORING-COVERAGE floor only — play distribution is tier-weighted (band-first rolling). Gates recorded below stand as-run history.

# Batch-2 Guardrails

**Read `docs/BATCH-GUARDRAILS.md` first — its G0 (don't-touch) and G9 (stop-and-flag) govern every
batch-2 unit too**, with ONE amendment: the table-authoring units MAY create/edit the specific
`Engine/` files named below (and ONLY those), then regenerate via
`python3 "Engine/00. _System/compile-tables.py" --emit`.

## H1. Gates (literal counts in gateSummary; full sweep 0-failed always)

walk-refresh ≥? per spec (`verify-walk-refresh.mjs`, ≥7/0) · world-turn ≥8/0 · xp-retune ≥7/0 ·
monster-tactics ≥6/0 · tables-wave1 + tables-wave2a/b: compile 0 coverage errors, every new table
full-die coverage + band shares 66/20/9/4/1 (±1 row), `corpus-intensity-map` regen clean ·
regions ≥7/0 · tarot ≥6/0 · reputation ≥8/0 · companions ≥10/0 · levelup-picker ≥5/0 ·
tiyl ≥7/0 · durability ≥16/0 (one harness, three sections) · loose-ends ≥5/0 · battlemap ≥12/0 ·
blockwright ≥8/0. Mutation checks per spec, shown RED.

## H2. Table-authoring rulings (units: tables-wave1, tables-wave2a, tables-wave2b)

- **Voice anchors are LAW:** every Adam-approved sample row is included VERBATIM as an actual
  row in its band; the other rows match its register. New-table frontmatter follows
  `Engine/01. _Templates/_Table Frontmatter Schema.md`. Every new table gets a
  `> PROVISIONAL — Adam spot-check pending` callout.
- Wave 1 files: `Walk Skin - Wilderness.md` / `- Dungeon.md` / `- Urban.md` (per WALK-REFRESH §3
  naming, under Session Mechanics) · `Place Drift.md` · `NPC Life Event.md` (WORLD-TURN §2/§4
  locations — Session Mechanics domain).
- Wave 2a files: `Chase Complications.md` · `Distant Word.md` · `Downtime Ledger.md` ·
  `Festival and Holy Days.md` · `Shrine and Omen.md` (TABLE-GAPS §1–5) · `Region Identity.md`
  (REGIONS-NAMES §1) · `World Name Patterns.md` (d20, mechanical register, TIYL §1).
- Wave 2b (maintenance): thin expansions to EXACTLY these dies — `in-building-complications`
  → d100 · the six job tables (crier/pilgrim/river-rat/bog-iron-digger/glass-singer/hearth-watch)
  → d12 each · `dungeon-reinforcements` → d12 · `dungeon-lore-art`/`-content` → d20 each ·
  `myth-truth-vs-false` → d20. `d100-air`: if its body is truly 5 rows, COLLAPSE the die to d6
  (honest die beats fake d100) and flag it. **Outlandish Band tags:** add ONE DM-only `Band`
  column (`utility/combat/high-power/reality-breaking`) to `Dungeon Loot - Outlandish.md` —
  rows byte-untouched otherwise (mutation-style check: diff shows only the new column).
  **Compile hygiene:** stamp the 1-row packed artifacts (`birth-order-spark` class — enumerate
  them from the intensity map's 1-row list) `type: table-set` fix or `status: stub` so they
  leave the compiled set; NEVER delete Adam's files. **Name culture banks:** author
  `Engine/03. _Tables/02. Social/Sentient NPCs/Name Cultures.md` (`type: name-bank` — the dice
  compiler skips it) with the 12 cultures × (female/male/family) ~40 names each, anchored to the
  approved §5 briefs; `build/gen-names.py --cultures` parses it → `data/names-cultures.js`.

## H3. Unit-specific rulings

- **tarot-session:** card IMAGES are DEFERRED (a curated morning task) — render a
  name + suit-glyph placeholder card; the asset key field ships empty. The unit AUTHORS
  `data/tarot.js`: all 78 omens (6–10 words each, FRAG register) + the 44 Major mutators
  anchored VERBATIM to the 5 approved samples (TAROT-SESSION §4). Mutator directives may only
  reference parameters/systems that exist post-merge (clocks, threads, spice nudges, lens
  counts, pool sizes) — an unimplementable directive is a spec bug: flag it, write the nearest
  implementable version.
- **companions:** the Tasha sidekick extraction MUST vision-read (`Read` with `pages`) the PDF in
  `Reference/` — NEVER its text layer. Sanity-gate each class table: PB must follow standard
  level math, features monotone by level; any cell that fails = re-read the page, then flag.
  All feature PROSE re-written original (mechanics faithful; zero verbatim sentences).
- **regions-names:** region geometry constants: centers every 9 hexes (`REGION_CELL=9`),
  `FRAY_D=40`, `FRAY_1=15`, `FRAY_2=28` (hex distance) — provisional constants, named, one place.
- **battlemap:** dims parser = first two integer feet values in the string; band per 25 ft depth
  (min 1, max 4), lane per 20 ft width (min 1, max 3); unparseable → 4×3. Elevation advantage:
  melee only, attacker's zone `elev` > target's.
- **blockwright:** face budget **≤180** rendered face divs (hard); the grep-invariants (no
  img/background-image/filter/box-shadow in the diorama subtree) are verify assertions. Gate is
  now **≥10/0** (the anti-Minecraft invariants were added after Adam's P3 probe verdict): four
  primitives (box/frustum/prism/group), organic props MUST be frustums, every prop gets a
  deterministic seeded ±15° rotY scatter (tiles stay aligned), muted low-saturation palettes
  with one warm accent — the target read is "painted wooden miniatures," never voxels.
- **reputation / world-turn interlock:** world-turn builds `worldTurn()` FIRST (it's earlier in
  the chain); reputation's fade hooks into it — if the hook point differs from the spec's
  assumption, follow the built code.
- **loose-ends:** the gift leverage key must be one the SOCIAL `applyLeverage` already prices —
  reconcile and reuse; do not invent a new lever type.

## H4. Sequencing note (the orchestrator owns this, recorded for the reviewers)

Chain order: walk-refresh → world-turn → xp-retune → monster-tactics → tables-wave1 →
tables-wave2a → tables-wave2b → regions-names → tarot-session → reputation → companions →
levelup-picker → tiyl-deepening → durability-trio → loose-ends → battlemap → blockwright.
Each stacks from the last GREEN tip; a red unit quarantines (next unit stacks from the last
green), and anything depending on a red unit ships its wiring null-safe (the specs are all
written null-safe-until-tables-land already).
