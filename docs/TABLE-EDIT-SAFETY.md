---
type: system-spec
project: Genesis
status: locked
created: 2026-07-03
related:
  - "[[DESIGN]]"
  - "[[SPICE-CURVE]]"
---

# Table-Edit Safety — hand-editing the Engine table corpus without cascading bugs

Adam hand-edits `Engine/03. _Tables/**/*.md` directly and often — adding rows, removing rows,
rewording bands. This doc is the safety net: what validates a hand-edit before it becomes a
runtime bug, in what order, and — investigated honestly below — what actually happens today if a
hand-edit slips past every validator anyway.

## The workflow

1. **Edit the markdown source.** `Engine/03. _Tables/**/*.md` (or `Asset Library/**/*.md`) — the
   pipe-table body, per `Engine/01. _Templates/_Table Frontmatter Schema.md`.
2. **`python3 build/lint-tables.py`** — fast, stdlib-only, no compile. Catches roll-range gaps/
   overlaps, band-order regressions, malformed rows, and duplicate rows in the SOURCE, before
   touching the compiler. Exits 1 on hard errors. Run `--warn-only` to see findings without
   failing (useful mid-edit, before a table is finished).
3. **`python3 "Engine/00. _System/compile-tables.py" --emit`** — the real compile step. Regenerates
   `tables.json` + `tables.js` from every table markdown file. Also re-validates coverage (its own
   "REAL bugs" report) and runs the content-safety denylist gate first (`build/safety-denylist.json`
   — aborts the whole compile, no partial write, on a banned term anywhere in the source roots).
4. **Run the named smoke harnesses for the table family you touched** — see the table below. These
   are jsdom `dev/verify-*.mjs` scripts that load the real `genesis.html` + all modules + the
   freshly compiled `tables.js`, and actually roll on the tables through the real engine code
   (`rollTable`/`walkPick`/etc.), not a mock.
5. **Commit source + artifacts together** — the hand-edited `.md`, the regenerated `tables.json` +
   `tables.js`, in the same commit. (Per `CLAUDE.md`'s edit-source→compile-artifact discipline:
   never hand-edit the compiled files; never let them drift out of sync with source by committing
   one without the other.)

## What each validator catches

| validator | catches | does NOT catch |
|---|---|---|
| `build/lint-tables.py` | roll-range gaps/overlaps (hard error); band/tier order regressions — isolated dips as hard errors, sustained multi-row resets as warnings (Adam's spice invariant, `docs/SPICE-CURVE.md`); duplicate row text (warning — repeated-outcome weighting is legitimate authoring, so never hard-failed); ragged rows / empty Band cells (warning) | anything semantic beyond roll-range + band ordering — it doesn't know if a row's *prose* is good, only its *shape* |
| `compile-tables.py` (no `--emit`, i.e. plain report mode) | the same roll-range coverage bug class, reported as counts ("REAL bugs: N") — but only as a summary line, not file:line findings, and it runs this validation as a side effect of every compile rather than as a fast pre-check | band ordering (never checked at all); duplicate rows (never checked); malformed rows (silently tolerated — see below) |
| `compile-tables.py` (safety gate, `safety_scan()`) | real-world slurs anywhere in the source roots — aborts the ENTIRE compile, no `tables.json` write, regardless of `--emit` | everything else — it's a denylist scan, not a table-shape check |
| `dev/verify-*.mjs` smoke harnesses (per table family, below) | whether the ACTUAL engine code that rolls on a table still works after the edit — end-to-end through `rollTable`/`walkPick`/`rollWalkSkin` against the real compiled `tables.js` | table-shape bugs that don't happen to be exercised by that harness's specific fixture rolls (these are integration smoke tests, not exhaustive coverage) |

### Named smoke harnesses per table family

Grepped `dev/verify-*.mjs` for the `GENESIS_TABLES["<id>"]` / `walkPick(...)` / `rollWalkSkin(...)`
call sites that read compiled tables, to build this honestly rather than guess:

| table family | consuming harness(es) |
|---|---|
| `mythic-success-lenses`, `mythic-failure-lenses`, `myth-seeds` | `dev/verify-crit.mjs` |
| `plot-item`, `plot-lock`, `building-interior` (the d300 Phase-5 tables) | `dev/verify-codex-roll.mjs` |
| `art-depiction` | `dev/verify-consequence.mjs` |
| `tavern-name`, `tavern-in-media-res` | `dev/verify-urban-fabric.mjs` |
| `place-drift`, `npc-life-event`, `faction-outcome` | `dev/verify-world-turn.mjs` (uses fixture rows for the assertion, but also loads the real compiled tables at boot) |
| `distant-word` | `dev/verify-touched-npcs.mjs` |
| `dungeon-loot-outlandish` | `dev/verify-outlandish-realms.mjs`, `dev/verify-economy-sinks.mjs`, `dev/verify-gen.mjs`, `dev/verify-loose-ends.mjs` |
| `walk-skin-*` / `walk-breach-*` / `walk-nightmare-*` (the Grants/Motif-tagged walk tables) | `dev/verify-walk-refresh.mjs` (4 direct `walkPick`/`rollWalkSkin` call sites), `dev/verify-skin-grants.mjs`, `dev/verify-breach.mjs` |
| the Realm Items family (`realm-items-*`) and other Outlandish/region loot tables | `dev/verify-outlandish-realms.mjs`, `dev/verify-regions.mjs` |
| tarot/oracle tables | `dev/verify-tarot.mjs` |
| "This Is Your Life" character-genesis tables | `dev/verify-tiyl.mjs` |

If you touched a table not listed above, there may not be a dedicated harness yet — the general
regression check is still `python3 build/check-manifest.py` (module wiring) plus a manual smoke
via `python3 -m http.server 5175` and exercising the relevant screen. Consider that a gap, not a
green light — if you're adding real coverage for a new table family, a new `dev/verify-*.mjs`
following the existing pattern (jsdom, load the real `genesis.html`, assert against the real
compiled `tables.js`) is the right shape.

## How consumers degrade on unknown/new rows today (investigated, not assumed)

Adam's two questions: *does a new row in a walk table flow through walk rollers safely?* and
*does removing a row break any hardcoded index?* Answered by reading the actual runtime code
(`src/engine/compiled.js`, `src/engine/walk.js`, `src/world/wiring-a.js`, `data/character-genesis.js`,
`data/world-tables.js`), not by inference:

- **The core roll mechanism is range-based, not index-based.** `rollTable(id)`
  (`src/engine/compiled.js:15-23`) does
  `t.rows.find(r=>total>=r[0]&&total<=r[1])||t.rows[t.rows.length-1]` — it searches for the row
  whose `[lo,hi]` bounds contain the rolled total, and falls back to the **last row** if nothing
  matches (never throws, never returns `undefined`). `walkPick`/`rollWalkSkin` in
  `src/engine/walk.js` and `rollTbl` in `src/engine/tables.js` follow the identical pattern. This
  means: **adding a row (renumbering the ranges around it) is safe** — the lookup re-derives
  positions from the freshly compiled `lo`/`hi` bounds every time, it never assumes a row's array
  index means anything. **Removing a row is equally safe** by the same logic, *provided the
  surrounding ranges are re-closed* (which is exactly what `lint-tables.py`'s gap check exists to
  catch if you forget).
- **No hardcoded numeric row index was found anywhere in the compiled-table consumption path.**
  Grepped `src/**/*.js` + `data/**/*.js` for literal `.rows[N]` indices: the one hit,
  `src/world/wiring-a.js:302` (`rows[0][5]`), is a defensive fallback reached only if a roll
  function failed to load — it grabs *some* row as a degrade-gracefully default, not a semantic
  position, so it isn't a row-count hazard.
- **Grants/Motif/legs/arch tag columns are presence-guarded, not position-assumed.** `rollTable()`
  returns `grants:row[8]||"", motif:row[9]||""` etc. — always defaults to an empty string when a
  table doesn't carry those optional columns, or when a specific row's cell is blank. A brand-new
  walk table without Grants/Motif, or an existing row missing one, degrades to `""`, never an
  array-index crash.
- **Walk rollers specifically:** `rollWalkSkin(envKind)` (`src/engine/walk.js`) is documented
  in-code as "GRACEFUL UNTIL AUTHORED" — an absent or not-yet-compiled table returns `null`,
  checked by every caller, rather than throwing.
- **The one real index-based fragility in the codebase is OUTSIDE this pipeline's scope.**
  `data/character-genesis.js` (`CG_BG`/`CG_CLASS`) and `data/world-tables.js` (the `FRAG`
  fragment-oracle arrays, explicitly commented "aligned to `T`/`SS` row order") are hand-authored
  parallel JS arrays, not generated from `Engine/03. _Tables` markdown —
  `compile-tables.py`'s own `ROOTS` (`Engine/03. _Tables`, `Asset Library`) never touches
  `data/*.js`. Editing an Engine table's markdown source cannot desync these; they're a distinct,
  real fragility if Adam ever hand-edits *those* files' row counts directly, worth knowing about
  but out of scope for "editing Engine table markdown."
- **No runtime code infers band from roll position instead of reading the row's own Band cell.**
  Every band read found (`rollTable()`'s `band:row[2]`, `dungeon-walk.js`'s tag matching, etc.)
  reads the matched row's own compiled `band` field directly. `walkSpiceBand()`
  (`src/engine/walk.js`) is a *separate*, independent d100 spice roll, explicitly commented as
  independent of any single compiled table's row-band — not a monotonicity assumption over a
  specific table's rows. **Conclusion: an out-of-order band row (the thing `lint-tables.py`'s
  Check 2 catches) violates Adam's design invariant and will read wrong to a player, but it will
  not crash or misroute anything at runtime** — every consumer trusts the row's own Band cell,
  never the roll number, to decide what band a result belongs to.
- **No exact-string match against table row TEXT was found that would silently misroute on a
  reworded row**, with one caveat: `src/creator/life.js:88,127` does `sn.text==="None"` against a
  specific "This Is Your Life" sibling-count table's row text. If that row's wording changed (e.g.
  "None" → "No siblings"), the equality check would miss — but it happens to degrade harmlessly
  here (`parseCount("None")` already returns `0` via its own fallback, the same practical result),
  not because of an explicit safety contract. This is a narrow, table-specific pattern, not the
  general shape of table consumption — flagged here for completeness, not as a general risk.

**Bottom line: within the actual `Engine/03. _Tables` markdown → `compile-tables.py` →
`GENESIS_TABLES` → `rollTable`/`walkPick` pipeline, adding or removing rows flows through safely
by construction** (range-based lookup, presence-guarded optional columns, graceful-null on missing
tables). The failure modes that exist are (a) a coverage gap/overlap left by an edit that didn't
re-close the surrounding ranges — caught by `lint-tables.py` Check 1 and `compile-tables.py`'s own
report — and (b) a band-order regression that's a **design/tone bug** (a player rolling high but
reading low-stakes flavor), not a **crash** — caught by `lint-tables.py` Check 2. Nothing in this
pipeline hard-crashes on a well-formed new row; the linter exists to catch the ways an edit can be
*malformed* or *tonally wrong*, not to prevent a crash that was never actually possible here.

## The ADDITIONS contract for the model grammar

Investigated: does the DM/model grammar have a fallback for a table row whose content is a NEW
noun the rest of the engine doesn't recognize? Two distinct mechanisms exist, and it's worth being
precise about which one actually applies to hand-edited table rows:

- **`docs/MODEL-GRAMMAR.md` §4b ("Off-bestiary creatures — the shape-hint contract")** covers the
  DM *inventing an original creature live*, tagged with a `shape:{base,size,modules,channels,stance}`
  hint drawn from a closed part vocabulary. An unknown part name "drops to nearest-known," and the
  drop is **logged to a `shape-gaps` ledger line** rather than failing. This is real, and it is a
  genuine "never crash on an unfamiliar noun" contract — but it's scoped to DM-invented creatures,
  not to a hand-edited table row's wording. A table row's own text is a different situation: it's
  not a structured shape-hint the engine parses, it's free-text narration the DM reads and voices —
  there's no separate grammar validating that a table row's phrasing matches a known vocabulary,
  because nothing downstream parses that phrasing structurally (see the exact-string-match caveat
  above — the one place something does, it degrades harmlessly by luck of its own fallback, not
  because of §4b).
- **The shape-gaps ledger's actual job** is to give Adam visibility into which invented-creature
  parts fell through to the fallback, so the part vocabulary can be extended later — it's an
  authoring-feedback mechanism, not a runtime safety net per se (the safety net is the "drop to
  nearest-known" default itself, which never throws).

**Net: new nouns in a hand-edited table row (a new item name, a new NPC detail, a new location
flavor) never crash the engine, because nothing structurally parses table-row prose except the
roll-range/band machinery `lint-tables.py` now validates.** The shape-gaps/§4b fallback is a
different, narrower mechanism for a different situation (live creature invention), not a general
table-row safety net — but the reason table rows don't need one is the same reason walk-table rows
don't: the engine treats row content as opaque narration text, never a structured grammar it
parses and could choke on.

## Design note on band-order checking (why isolated dips are hard errors but sustained resets aren't)

The real corpus contains two different shapes of "a band decreases somewhere as the roll climbs":

- **Isolated dips** — a single row (or a run under 3 rows) drops below an established peak inside
  an otherwise-ascending table. Found in `place-drift` (9 sites — e.g. roll 62 is Grounded right
  after roll 61 was Textured) and `in-building-complications`. These read as authoring noise, not
  design — `lint-tables.py` treats them as **hard errors**.
- **Sustained resets** — a run of 3+ consecutive rows resets to a lower tier and climbs back up.
  The entire `realm-items-*` family (11 tables) does this deliberately: each is a d50 table built
  from two escalation waves (rows 1–27 climb Grounded→Mythic, rows 28–50 open a second wave back at
  Grounded), and each table's own frontmatter documents *why* — a fixed authoring recipe (12
  mundane + 8 enchanted + 4 signature + consumables items) that produces this shape by construction,
  not by accident. `lint-tables.py` reports these as **warnings**, not hard errors — flagged for
  Adam's review, not blocking the gate, because the shape is plausibly (and in this case, provably)
  intentional. See `dev/table-lint-baseline.md` for the current counts (9 isolated-dip errors, 23
  sustained-reset warnings).

This distinction is why gate #4/#5 of this unit run the lint in `--warn-only` mode against the real
corpus rather than fixing anything — some of what it finds needs Adam's judgment, not a mechanical
fix.
