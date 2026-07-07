---
id: table-frontmatter-schema
type: manual
domain: Templates
status: source
---

# Table Frontmatter Schema (the convention)

Every content file under `Engine/03. _Tables/` and `Asset Library/` carries a YAML frontmatter block. The schema is **lean**: it stores only what a machine can't compute. `die`, row count, and the spice distribution are **derived from the table body by the compiler** (and validated) — never written here, so they can't drift (the locked *edit-source → compile-artifact* rule, `[[DESIGN]]`).

Stamped across the corpus 2026-06-19 by `Engine/00. _System/stamp-frontmatter.py` (idempotent — re-run it after adding files; it fills any missing frontmatter and leaves existing fields untouched).

## Fields

| Field | Who sets it | Values |
| --- | --- | --- |
| `id` | derived (the table's `^block-anchor`, pinned; or filename slug) — **never rename**, procedures reference it as `[[File#^id]]` | kebab-case |
| `type` | derived from content/path | `table` · `table-set` · `name-bank` · `creature` · `adventure` · `encounter` · `faction` · `manual` · `stub` |
| `domain` | derived from folder path | e.g. `World Building / Place Generation` |
| `status` | derived | `source` · `stub` · `retired` |
| `table_class` | **judgment** (only on `table`/`table-set`) — the spice ceiling, per `[[SPICE-CURVE]]` §4 | `Spark` (flavor, ≤ Textured) · `Fork` (may reach Strange) · `Commitment` (may reach Volatile/Mythic) |
| `player_facing` | **judgment** (table/table-set) | `reveal` (player rolls it openly) · `plumbing` (engine auto-resolves it) |
| `voice_critical` | **judgment** (table/table-set) | `true` if fragment-generation needs the frontier model; else `false` |
| `table_family` | **judgment (optional)** — the row-test family, `[[TABLE-ROW-CONTRACT]]` §2/§3 | `situation` · `item` · `place` · `journey` · `rumor` (+ aliases: `npc`/`social`→situation, `hook`/`omen`→rumor, `walk`/`hazard`/`breach`→journey) |
| `row_contract` | **judgment (optional)** — `[[TABLE-ROW-CONTRACT]]` §3 | `draft` (missing required role = WARN, the worklist state) · `enforced` (missing required role = hard ERROR, blocks `--emit`) |
| `remembers` | **judgment (optional)** — the state bucket(s) the row-test's question 6 points at, `[[TABLE-ROW-CONTRACT]]` §3 | comma list from: `codex` · `ledger` · `clock` · `faction` · `item` · `map` · `walk` · `none` |

Optional extras a file may keep: `procedure`, `spice`, `note`, `subtype`, etc. — preserved, not required.

> **`table_family`/`row_contract`/`remembers` are opt-in and untouched by the stamper** (`Engine/00. _System/stamp-frontmatter.py` never auto-seeds them). Untagged files run zero family-lint checks. Tagging a file changes zero bytes of the compiled `tables.json` (the compiler reads only `table_class`/`player_facing`/`voice_critical`/`domain` from frontmatter) — these three fields exist purely for `build/lint-tables.py`'s family checks. See `[[TABLE-ROW-CONTRACT]]` for the full schema + lint spec.
>
> **The five families cover RUNTIME CONTENT ROWS only — not every table (doctrine, 2026-07-07).** Lens/motif tables (Walk Skin/Breach/Nightmare, atmosphere overlays), pointer tables (Plot Item/Lock), mechanic/result tables (crit, morale, consequence ladders), generator-grammar tables (names, fragments, model parts), and contract/vocabulary tables stay UNTAGGED unless a dedicated mini-family lands (`[[TABLE-ROW-CONTRACT]]` §Appendix). The `walk`→journey alias means walk BEAT tables, never Walk Skin — do not tag an exempt table to "finish the migration"; an untagged table is a correct state, not a gap.

> **Judgment fields were auto-seeded by heuristic** at stamp time (Spark/Fork/Commitment guessed from name + domain; `player_facing: reveal`, `voice_critical` = true for Spark).
> - **`table_class` — REVIEWED + corrected 2026-06-19.** The keyword heuristic over-applied Commitment (44 → tightened to **11**); Commitment now means *only* tables that genuinely roll high-spice narrative outcomes (Mythic Events, the Starting State set incl. the Opening Bundle, `life-origins`, and explicit doom/curse/becoming/intrusion tables). Loot plumbing, quest structure, NPC detail, background events were demoted to Fork; flavor/name tables to Spark. Current spread: Fork 204 · Commitment 11 · Spark 32.
> - **`player_facing` / `voice_critical` — still heuristic defaults, not yet reviewed** (`reveal` / Spark-only). Correct as needed when the fragment-routing + reveal/plumbing pacing work lands. Correcting one is just editing the value.

## Copy-paste block for a NEW table

```yaml
---
id: my-new-table              # match the table's ^block-anchor
type: table                   # table | table-set | name-bank | ...
domain: World Building / X
status: source
table_class: Fork             # Spark | Fork | Commitment
player_facing: reveal         # reveal | plumbing
voice_critical: false
---
```

Then author the table body in the standard pipe format (`| dN | Band | Result |`, ranges as `lo-hi`), and let the compiler derive die/rows/spice. Or just run the stamper — it'll fill the frontmatter for you.

## Dice expressions / bell-curve tables

The compiler (`Engine/00. _System/compile-tables.py`) is **dice-aware**. Most tables are flat `dN` (values `1..N`, uniform). A **bell-curve or mixed-dice** table (e.g. trinket = **2d20** → 2–40, urban encounters = **d12 + d8** → 2–20) rolls *non-uniformly* and can't produce its lowest values — so it must NOT be rolled flat or the distribution is wrong.

Declare the roll in the **table heading**, in parentheses: `### One Distinct Object (2d20)`, `### Random Urban Encounters (d12 + d8)`. The compiler reads it, **but only honours it if the declared min..max matches the table's actual row range** — so a `(2d4)` note that means "roll 2d4 for *how many* items" can't mislabel a flat d100 index. The compiler records `dice` (the roll expression) and `bell` (true if >1 die) per table; the engine rolls the expression. Coverage is validated against the declared range (a 2d6 table must cover 2–12, not 1–12). `00`-notation d100 tables (rows `00–99` or `00`=100) are recognized automatically.

If a table starts above 1 with **no** matching dice declaration, the compiler flags it `starts-high` for review (it's either a malformed header eating row 1, or an undeclared bell table — add the `(NdM)` to the heading to resolve).
