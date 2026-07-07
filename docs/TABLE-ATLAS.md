---
type: system-spec
status: BUILT 2026-07-07 on branch feat/table-atlas (freeze lifted and executed per direct instruction; U0/U1/U2 all landed, verify harnesses green, check-manifest OK). Was: SPEC-LOCKED 2026-07-06 — build DEFERRED (post-Fable).
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
project: Genesis
created: 2026-07-06
related:
  - "[[FABLE-DEV-TOOLS]]"
  - "[[REFERENCE-SHELF]]"
  - "[[BESTIARY-MANUAL]]"
  - "[[TABLE-USAGE-AUDIT]]"
  - "[[FABLE-WINDOW-2026-07-06]]"
---

# TABLE ATLAS — Reference Shelf app #3 (read-only table corpus viewer)

The third Reference Shelf app, beside Monster Manual (#1) and Wiki (#2). A **read-only** dashboard
over the whole compiled table corpus: what tables exist, what rows they hold, what they are wired
to, how spicy each band-strip is, and — the new signal — how often each table actually fires in
play. Answers the two questions raw markdown cannot answer quickly (GPT README §Authoring Tool
Horizon): *what is this table wired to?* and *how often does it fire?*

**Standing order (Adam, FABLE-WINDOW-2026-07-06 §Rulings item 7):** Table Atlas is a Reference Shelf
companion to MM/Wiki; **any** table connection counts as wiring; roll counts come from **test
sessions**; **Fable/executor picks the telemetry seam** as long as total roll count per table
exists; **read-only v1**; the dream endpoint is true in-browser writability; app order is Table
Atlas → NPC Library → Town Builder → Building Builder. This spec locks Table Atlas fully and fences
the other three with GUARDRAIL sections only.

This spec is **SPEC-LOCKED, build DEFERRED**. Nothing here builds until Adam lifts the freeze
post-Fable. Every code reference below was opened and verified 2026-07-06.

---

## Unit map (build in this order; U0 blocks U1)

| unit | what | branch | executor | blocks |
|---|---|---|---|---|
| **U0** | machine-readable table-usage split: `gen-table-usage-audit.py` also emits `data/table-usage.js` | `feat/table-usage-data` | S | U1 |
| **U1** | roll-count telemetry seam: `GS.tableRolls` tally in `rollTable` + `build/gen-roll-counts.py` → `data/roll-counts.js` | `feat/table-roll-telemetry` | S | U2 (soft) |
| **U2** | Table Atlas shelf app: `src/ui/ref-atlas.js` (classic script) + manifest + genesis.html `<script>` tag | `feat/table-atlas` | M | — |

U2 is the only user-visible unit. U0 is a hard dep (U2 reads `TABLE_USAGE` for the wiring column).
U1 is a **soft** dep: if U1 has not landed, U2 renders the roll-count column as `—` (data absent);
U2 must degrade cleanly, never hard-fail, on a missing `ROLL_COUNTS` global.

---

## U0 — machine-readable table-usage split (unit 0, blocks the Atlas)

### Why this is unit 0

`docs/FABLE-DEV-TOOLS.md` §v1-data-seams and the GPT README §Authoring Tool Horizon both say: the
usage audit is markdown-only today; **split its generator output into a machine-readable artifact
before building the app** — "Do not parse raw markdown in the browser for v1."

**Verified state:** `build/gen-table-usage-audit.py` already computes the full machine model in
memory. It builds three structures — `rows`, `filecls`, `file2ids` — and at line 89-90 dumps them
to a *throwaway temp file* (`tempfile.gettempdir()/audit_final.json`), then at line 149 writes only
the human `docs/TABLE-USAGE-AUDIT.md`. The machine data exists; it is simply not committed. U0 is a
tiny emit add, not a re-derivation.

### DECISION — emit `data/table-usage.js` (classic-script const), not JSON

Every other browser-read data artifact in this repo is a classic `<script>` `const` (`WIKI_INDEX`
in `data/wiki.js`; `BESTIARY` in `data/bestiary.js`). Match that: the Atlas reads a bare global, no
`fetch`, no CSP/`file://` friction. (JSON would force a fetch; the repo's whole data layer is
inline consts by CLAUDE.md architecture — "genesis.html runs on INLINE table data.")

### Exact surface — U0

`build/gen-table-usage-audit.py` (spec generator edits this — it is a script, NOT a generated
don't-touch artifact). Add ONE function and ONE call, alongside the existing `_gen_doc()`:

- **New:** `_gen_data()` — writes `data/table-usage.js`.
- **Call site:** after `_gen_doc()` at the current line 151 (end of file), add `_gen_data()`.
- **Do NOT** remove the temp-file dump (line 89-90) or `_gen_doc()` — the markdown audit stays.

`data/table-usage.js` shape (owns `TABLE_USAGE`, a compiled artifact — never hand-edited after this;
regenerate with the audit command):

```js
/* GENERATED — do not hand-edit. Regenerate: python3 build/gen-table-usage-audit.py
   Source: tables.json + Engine/{02._Procedures,03._Tables} + src/ + genesis.html scan.
   Owns TABLE_USAGE: per-compiled-table wiring class + consumer lists (the machine twin of
   docs/TABLE-USAGE-AUDIT.md). */
const TABLE_USAGE = {
  "architecture-material": {
    file: "Engine/03. _Tables/01. World Building/Architectural Details/Architecture Material.md",
    base: "Architecture Material",
    domain: "World Building / Architectural Details",
    cls: "ORACLE-ONLY",                 // WIRED | PROCEDURE | CHAINED | ORACLE-ONLY | UNMAPPED
    consumers: { code: [], procedure: [], chain: [] }  // basenames, straight from filecls[rel].hits
  },
  // …one entry per key in tables.json that maps to a source file
};
```

Field derivation (all already computed in the script; map 1:1, no new logic):
- `file` / `base` / `domain` — from the `rows` list entries (`r["file"]`, `r["base"]`, `r["domain"]`).
- `cls` — `filecls[rel]["cls"]` (the existing four-value classification at lines 76-78, plus
  `UNMAPPED` for a table with no source file, mirroring line 85's
  `fc=filecls.get(rel,{"cls":"UNMAPPED","hits":{}})` default — line 84 is the preceding
  `rel=id2file.get(tid)` lookup).
- `consumers` — `filecls[rel]["hits"]` verbatim (already `{code:[], procedure:[], chain:[]}` sorted
  lists, built at line 79).

**Key = the compiled table id** (the `tables.json` key), so the Atlas joins `TABLE_USAGE[id]` to a
`table-registry.json` entry by id. Registry entries carry no `id` field (verified: keys are
`name/category/sub/die/rows/status/path`), so the Atlas derives the registry-side id from `path` +
`name` the same way the compiler does — see U2 §join.

### Acceptance — U0

```
python3 build/gen-table-usage-audit.py
```
Expected: prints the existing audit lines AND `data/table-usage.js` now exists. Then:
```
node -e "eval(require('fs').readFileSync('data/table-usage.js','utf8')); console.log(Object.keys(TABLE_USAGE).length)"
```
Expected number: **equals the compiled-table count** the script already prints on line 28 as
`compiled tables:` (today the registry counts 354 source tables / `tables.json` has one entry per
compiled sub-table; the number to match is the script's own `len(TABLES)` — assert
`Object.keys(TABLE_USAGE).length === <that printed number>`, not a hardcoded literal, because the
corpus grows). Idempotent: running twice → byte-identical `data/table-usage.js`.

### Regression — U0 (RED-FIRST, mutation-asserting)

`dev/verify-table-usage-data.mjs` (new): eval `data/table-usage.js`, then:
1. **Mutation assert (value moved, not label):** pick a known-WIRED table (e.g. `npc-role`, wired
   via `src/engine/codex-roll.js:108` — verified call site) and assert
   `TABLE_USAGE["npc-role"].cls === "WIRED"` AND `consumers.code` is non-empty and *contains*
   `codex-roll.js`. RED-FIRST proof: before U0, the file does not exist → the harness throws on
   read; that is the red. A label-only test ("has a cls field") would pass on an empty stub — reject
   it; assert the actual classification value and a real consumer basename.
2. Assert every `TABLE_USAGE` key is a real `tables.json` key (join integrity).
3. Assert `cls` ∈ the five-value enum for every entry.

---

## U1 — roll-count telemetry seam (PICK: in-memory tally + dev-script flush)

### The seam decision (Fable's to make per the ruling — DECIDED here)

Adam's only hard requirement: **total roll count per table, from test sessions**. Fable picks where
it lives. Two candidate seams were on the table:

- **(A) Live persistent write** — every `rollTable` call writes to `w`/`localStorage`. **REJECTED.**
  Violates SPEED doctrine ("no model call in mechanical loops" generalizes to *no I/O in the
  mechanical roll loop*); persisting on every dice roll bloats the world blob and couples the roll
  engine to storage.
- **(B) In-memory tally on `GS`, flushed by a dev script off the session ledger/telemetry. CHOSEN.**
  Zero persistent-state cost per roll (one integer increment on a transient object); the existing
  telemetry spine (`GS.dm.telemetry` + `.dm/telemetry.jsonl`, verified `src/world/dm.js:1405-1407`)
  already proves the ring-buffer-plus-dev-aggregation pattern. A dev script reads the tally at
  session close and appends to a committed count artifact.

### Exact surface — U1

**(a) The tally hook — `src/engine/compiled.js`** (spec generator edits this — hand-authored engine
module, NOT generated). `rollTable(id)` is verified at `src/engine/compiled.js:15-23` as the single
choke point through which *every* automatic compiled-table roll flows (all `rollTable("…")` call
sites across `codex-roll.js`, `region.js`, `urban.js`, `turn.js`, `job-walks.js`, `wiring-a/b.js`,
`gap-wiring.js` — verified by grep). One tally line, inside the function, after the null-guard:

Before (verified verbatim `compiled.js:15-23`, comment block included so the executor edits against
the real file — the increment goes immediately after the `if(!t)return null;` null-guard on line 16):
```js
function rollTable(id){ // -> {id,dice,total,band,text,fragment} or null
  const t=CT()[id];if(!t)return null;
  const dice=t.dice||("d"+t.die),total=rollExpr(dice);
  const row=t.rows.find(r=>total>=r[0]&&total<=r[1])||t.rows[t.rows.length-1];
  // row[6]/row[7] = DM-only Consequence-Ladder tags (legs/pool) — present only on tagged tables (else "").
  // row[8]/row[9] = SKIN-GRANTS.md §1/§1b DM-only tags (grants/motif) — present only on the three Walk
  // Skin tables today (else ""); untagged tables are byte-identical (rollTable's shape unchanged).
  return {id,dice,total,band:row[2],text:row[3],fragment:row[4],cells:row[5]||null,legs:row[6]||"",pool:row[7]||"",
          grants:row[8]||"",motif:row[9]||""};}
```
After (one guarded increment inserted between the null-guard and the `const dice=…` line; degrades to
no-op when `GS` absent, e.g. Oracle-only jsdom harnesses — the rest of the body is unchanged):
```js
function rollTable(id){ // -> {id,dice,total,band,text,fragment} or null
  const t=CT()[id];if(!t)return null;
  try{ if(typeof GS!=="undefined"&&GS){ const c=(GS.tableRolls=GS.tableRolls||{}); c[id]=(c[id]||0)+1; } }catch(_){/* tally never load-bearing on a roll */}
  const dice=t.dice||("d"+t.die),total=rollExpr(dice);
  const row=t.rows.find(r=>total>=r[0]&&total<=r[1])||t.rows[t.rows.length-1];
  // row[6]/row[7] = DM-only Consequence-Ladder tags (legs/pool) — present only on tagged tables (else "").
  // row[8]/row[9] = SKIN-GRANTS.md §1/§1b DM-only tags (grants/motif) — present only on the three Walk
  // Skin tables today (else ""); untagged tables are byte-identical (rollTable's shape unchanged).
  return {id,dice,total,band:row[2],text:row[3],fragment:row[4],cells:row[5]||null,legs:row[6]||"",pool:row[7]||"",
          grants:row[8]||"",motif:row[9]||""};}
```
`GS.tableRolls` is a new transient-state field. Per CLAUDE.md ("New mutable state goes in `GS`") it
belongs in `GS` (`src/state.js`, `var GS`) — no manifest `owns` change needed (it is a field on the
existing `GS`, not a new top-level symbol). The `try/catch` + `typeof GS` guard keeps `rollTable`
byte-behavior-identical for any harness that loads `compiled.js` without `state.js`.

**(b) The flush + committed artifact — `build/gen-roll-counts.py`** (new dev script). Reads
`.dm/telemetry.jsonl` roll rows across accumulated test sessions and writes `data/roll-counts.js`
(owns `ROLL_COUNTS`, a compiled artifact — never hand-edited; regenerate with the command):

```js
/* GENERATED — do not hand-edit. Regenerate: python3 build/gen-roll-counts.py
   Aggregates GS.tableRolls tallies flushed to .dm/roll-counts.jsonl across test sessions.
   Owns ROLL_COUNTS: { tableId: totalRollsAcrossTestSessions }. */
const ROLL_COUNTS = { "npc-role": 214, "npc-race-weighted": 214, /* … */ };
```

**Flush path:** the playtest-rig close step (`GS.dm.telemetry` is already read at close per
FABLE-WINDOW §Playtest — "read it at close") writes the session's `GS.tableRolls` snapshot as one
JSON line to `.dm/roll-counts.jsonl` (append). `build/gen-roll-counts.py` sums all lines by id →
`data/roll-counts.js`. This reuses the exact `.dm/*.jsonl` + dev-aggregation shape already proven by
the telemetry spine. **PROVISIONAL flag for Adam:** whether the flush lives in the
`genesis-clean-close` skill, the playtest-rig close, or a manual dev command is a workflow taste
call — marked PROVISIONAL, does not block U2 (U2 only reads the compiled `ROLL_COUNTS`, agnostic to
how it was filled).

### Acceptance — U1

```
python3 -c "import json,pathlib; print('ok')"   # placeholder; real gate below
```
1. **Tally increments:** in a jsdom harness that loads `state.js` + `compiled.js` + a stub
   `window.GENESIS_TABLES` with one table, call `rollTable("t")` three times; assert
   `GS.tableRolls.t === 3`.
2. **No-op without GS:** load `compiled.js` alone (no `state.js`), call `rollTable("t")`; assert it
   returns the row object and does **not** throw.
3. **Aggregation:** seed `.dm/roll-counts.jsonl` with two lines `{"t":2}` and `{"t":5}`, run
   `python3 build/gen-roll-counts.py`, assert `ROLL_COUNTS.t === 7`.

### Regression — U1 (RED-FIRST, mutation-asserting)

`dev/verify-roll-telemetry.mjs` (new): the mutation assertion is **the count value moved** — call
`rollTable` N times and assert `GS.tableRolls[id] === N` (a specific integer that changed), NOT that
the field merely exists. RED-FIRST: before the hook, `GS.tableRolls` is `undefined` → the assertion
`=== N` throws → red. Also assert `rollTable`'s return object is byte-identical to pre-hook (same
keys/values) so the tally is provably a side-channel, not a behavior change.

---

## U2 — the Table Atlas shelf app (the only user-visible unit)

### DECISION — classic `<script>`, NOT an ES module

The Monster Manual (`ref-bestiary.js`) is an ES module *only because it needs Three.js* (verified:
`import { resolveWholeObject } from "./theater-figures.js"`). The Atlas has **no 3D** — it is DOM +
data. The Wiki (`ref-wiki.js`) is the right model: a **classic script** that reads its data const as
a bare global (`typeof WIKI_INDEX !== "undefined"`, verified `ref-wiki.js:30`) and registers via
`referenceShelfRegister` at top-level (verified `ref-wiki.js:206-211`).

**Consequence for the window-bridge (`src/ui/ref-globals-bridge.js`):** the bridge exists ONLY
because ES modules cannot see classic-script top-level consts (verified from the bridge's own header
— it republishes `BESTIARY` etc. onto `window` for the ES-module Monster Manual). A **classic**
Atlas sees `TABLE_ATLAS_DATA`, `TABLE_USAGE`, `ROLL_COUNTS`, and `GENESIS_TABLES` as bare
identifiers directly — **the bridge does NOT need extending.** DECISION recorded so an executor does
not reflexively touch `ref-globals-bridge.js`. (Guard: *if* a future maintainer converts the Atlas
to an ES module, THEN every global it reads must be republished in `ref-globals-bridge.js` exactly
as `BESTIARY` is — but v1 is classic and does not.)

### Exact surface — U2

**New file `src/ui/ref-atlas.js`** (classic `<script>`, owns nothing new — registers via the
existing `referenceShelfRegister` global; all its internal helpers are file-scoped `function`s;
window-exposed handlers for inline `onclick` mirror `ref-wiki.js:183-185`'s
`window._refWikiSelect` idiom → `window._refAtlasSelect` / `_refAtlasSetFilter` / `_refAtlasSetSort`).

Registration (mirror `ref-wiki.js:206-211` exactly — classic top-level, order 3):
```js
if (typeof referenceShelfRegister === "function") {
  referenceShelfRegister({ id: "atlas", label: "Table Atlas", icon: "\u{1F5FA}", order: 3, mount, teardown });
}
```
`mount(container)` / `teardown(container)` — the `REFERENCE_APPS` contract (verified
`ref-bestiary.js:671-773`, `REFERENCE-SHELF.md` "Lifecycle contract"). No renderer to dispose (no
3D) — `teardown` clears `container.innerHTML` and drops the `window._refAtlas*` handlers. `mount`
builds the nav + list + detail DOM and paints from data. Registration at module top-level is handled
by S1's registration-timing law (re-invokes `renderStart()` if `#panel-start` is active).

**genesis.html** — one `<script>` tag, immediately after the Wiki app's tag (verified ordering:
`ref-wiki.js` is `genesis.html:1274`, `render.js` is `:1275`). Insert `ref-atlas.js` between them so
it registers before the first `renderStart()` that render.js may drive, matching `ref-wiki.js`'s
position:
```html
<script src="src/ui/ref-atlas.js"></script>   <!-- after ref-wiki.js, before render.js -->
```

**manifest.json** — one module entry, mirroring `ui.ref-wiki` (verified: `owns [] · callTimeDeps
["referenceShelfRegister"] · layer null`) plus the data files it call-time-depends on:
```jsonc
{ "id": "ui.ref-atlas", "path": "src/ui/ref-atlas.js", "owns": [],
  "callTimeDeps": ["referenceShelfRegister", "TABLE_USAGE"],
  "desc": "Reference Shelf app #3 — Table Atlas (docs/TABLE-ATLAS.md). Read-only viewer over the compiled table corpus…" }
```
Plus `data.table-usage` (owns `TABLE_USAGE`, like `data.wiki` owns `WIKI_INDEX`) and, once U1 lands,
`data.roll-counts` (owns `ROLL_COUNTS`). Both `data/table-usage.js` and `data/roll-counts.js` get a
`<script src>` tag near `data/wiki.js` (verified `genesis.html:1257`) and a `loadOrder` + `files`
entry so `check-manifest.py` passes. **PROVISIONAL:** whether `ROLL_COUNTS` is a hard `callTimeDep`
or a soft optional — spec says SOFT (Atlas degrades to `—` when absent); manifest lists it as a
best-effort dep note, not a hard require, so a missing artifact never fails the manifest gate.

### Data sources & the join (verified shapes)

Three read-only reads, all bare classic-script globals:

1. **`table-registry.json`** — the catalog. Verified top-level:
   `{generated, source, counts, byCategory, tables}` where `tables` is a 354-entry array of
   `{name, category, sub, die, rows, status, path}` (verified). This is a `.json` file, not a
   `const` — DECISION: the Atlas does **not** fetch it in-browser (CSP/`file://` friction). Instead
   U2 adds it to the build: **`build/gen-table-atlas.py`** (new) reads `table-registry.json` +
   `tables.json` and emits **`data/table-atlas.js`** (owns `TABLE_ATLAS_DATA`), the pre-joined
   per-table record the app renders. This keeps the "no raw-JSON parsing in the browser" rule
   (FABLE-DEV-TOOLS §v1-data-seams) and matches the repo's compile-to-const DNA.

2. **`tables.json`** — the compiled rows + band cells. Verified: keyed by compiled table id; each
   value `{dice, die, bell, class, player_facing, voice_critical, domain, rows}`; each row is
   `[lo, hi, band, txt, fragment, cells, legs?, pool?, grants?, motif?]` (verified against
   `compile-tables.py:215` `row=[lo,hi,band,txt,None,cols]` — note the compiler names the text field
   `txt`, not `text`, and `cols` is `row[5]`, not a `fragment`; `fragment`/`row[4]` is emitted as the
   literal `None` at compile time).

   **The band source is NOT simply `row[2]` — this is the load-bearing correction and the single
   most important seam in the histogram.** The compiler only populates `row[2]` (the `band` field)
   when the source table has an explicit **`Band` header column** (`compile-tables.py:189`
   `if 'band' in h: band_col=ci` sets `band_col` only when a header cell contains `band`; otherwise
   `band=""` at `compile-tables.py:206`). For
   the majority of tables there is no `Band` header, so `row[2]` is the empty string `''` and the
   band prefix is carried as the **first content cell**, `row[5][0]` (e.g. `architecture-material`
   rows are `[1,2,'','Grounded — Rough-Hewn Basalt: …',None,['Grounded','Rough-Hewn Basalt: …']]` —
   `row[2]===''`, band `'Grounded'` at `row[5][0]`). **Verified corpus fact (2026-07-06):** of 378
   compiled tables, **311 have at least one empty-string `row[2]`**, and the raw `row[2]`
   distribution is `'' 17245 · Grounded 3582 · Textured 1203 · Strange 678 · Volatile 270 · utility
   151 · combat 96 · Mythic 72 · high-power 49 · reality-breaking 4` plus three split-band cells
   (`Grounded–Textured`, `Strange–Volatile`, `Strange–Mythic`, one each). A histogram built off
   `row[2]` alone would therefore **mis-report the band of 311 of 378 tables** (reading them as
   all-empty).

   **DECISION — the effective-band derivation `bandOf(row)` (build in `gen-table-atlas.py`, the
   canonical rule the whole histogram uses):**
   1. If `row[2]` is a non-empty string → that is the band value (split on `–`/`-` into halves for
      the rare split-band cells).
   2. Else if `row[5]` is a non-empty array AND `row[5][0]` is one of the five canonical bands
      (`Grounded`/`Textured`/`Strange`/`Volatile`/`Mythic`) → that is the band (the un-headered
      spice-table case, e.g. `architecture-material`).
   3. Else → **un-banded**: the row contributes to no band bucket. This is the correct outcome for
      loot rosters, name banks, and matrix tables that carry no spice band at all (verified: applying
      rules 1–2 across the corpus still leaves **17075 rows genuinely un-banded** — they are not
      spice tables and must NOT be forced into a `Grounded` bucket).

3. **`TABLE_USAGE`** (from U0) — the wiring class + consumers, keyed by compiled table id.

**The id join (the one non-obvious seam):** `table-registry.json` entries have **no `id` field**
(verified). `tables.json` and `TABLE_USAGE` are keyed by compiled id. `build/gen-table-atlas.py`
must derive the registry→compiled id the same way the compiler and the audit script do — the audit
script's `id2file` derivation (verified `gen-table-usage-audit.py:14-24`) is the canonical mapping:
for a `type: table` file `id = fm['id']`; for `table-set`, `id = slugify(hint_id(context) or
fm['id'])`. **DECISION:** `gen-table-atlas.py` reuses that exact derivation by importing
`compile-tables.py` internals the same way the audit script does (`gen-table-usage-audit.py:4-11` —
verified working pattern). It does NOT re-implement slugification. Any registry row whose id fails
to resolve is emitted with `wiring: "UNMAPPED"` and a visible flag (never silently dropped).

`TABLE_ATLAS_DATA` per-table record shape:
```js
{ id, name, category, sub, die, rows, status, path,   // from registry (+ derived id)
  domain, tableClass, playerFacing,                    // from tables.json meta (class → tableClass)
  bands: { Grounded, Textured, Strange, Volatile, Mythic, other, unbanded },  // bandOf(row) histogram (NOT raw row[2])
  wiring, consumers }                                  // from TABLE_USAGE (cls → wiring)
```
`rollCount` is NOT baked in — it is looked up live at render from `ROLL_COUNTS[id]` (so the Atlas
reflects the latest committed counts without regenerating `table-atlas.js`), defaulting to `—`.

### Band vocabulary (DECIDED — the histogram buckets)

The histogram is built via `bandOf(row)` (defined in §Data sources item 2 — prefer `row[2]`, else a
canonical `row[5][0]`, else un-banded), NOT off raw `row[2]`. The five canonical spice bands are the
primary buckets. **Verified raw `row[2]` distribution (2026-07-06, all 378 tables):**

```
''(un-banded)  17245   ← the MAJORITY; loot rosters, name banks, matrix tables carry no band
Grounded        3582
Textured        1203
Strange          678
Volatile         270
utility          151   ← non-spice label
combat            96   ← non-spice label
Mythic            72
high-power        49   ← non-spice label
reality-breaking   4   ← non-spice label
Grounded–Textured  1 · Strange–Volatile 1 · Strange–Mythic 1   ← split-band cells (verified rare)
```

Two buckets outside the canonical five:
- **`unbanded`** — the dominant case. Rows where `bandOf(row)` returns nothing (raw `''` at `row[2]`
  with no canonical `row[5][0]`). These render as a light neutral segment labeled `unbanded N`, and
  a table that is *entirely* un-banded is treated as **not a spice table** and is exempt from the
  under-spiced flag (a name bank is not "under-spiced"). This is why the histogram MUST surface the
  un-banded count instead of dropping it — dropping it would make a 300-row loot table look like a
  3-row spice table.
- **`other`** — the non-spice *labels* that appear at `row[2]` on tables that DO use a Band header
  but for a non-spice purpose: exactly `utility`, `combat`, `high-power`, `reality-breaking`
  (verified — these four are the *only* non-canonical labels at index 2). It renders as a neutral
  grey segment labeled with its actual sub-labels on hover, so utility/combat tables are not
  mis-flagged as under-spiced. **Correction (was wrong in a prior draft):** there are **NO
  `Common`/`Uncommon`/`Rare` labels at `row[2]`** — those rarity terms live in the *content cell*
  `row[5][0]` on loot tables (e.g. `Common` appears 80× at `row[5][0]`), never at the band index, so
  they never reach the `bandOf` band buckets and never land in `other`.

Split-band cells (`Strange–Volatile` etc., verified: exactly 3 in the whole corpus) count toward
BOTH halves.

### Nav, sort, filter (exact — FABLE-DEV-TOOLS §v1-shape)

- **Left rail:** categories/subcategories from `table-registry.json` `byCategory` (verified keys:
  `01. World Building / 02. Social / 03. Session Mechanics / 04. Character Genesis / Unsorted`),
  each expandable to its `sub` groups.
- **Main list:** every table — name, id, category, die, row count, status, source `path`, and a
  **wiring-status badge** (WIRED 🔗 / PROCEDURE ▶ / CHAINED ⛓ / ORACLE-ONLY ⚠️ / UNMAPPED, mirroring
  the audit's own glyphs, verified `gen-table-usage-audit.py:116-119`).
- **Per-table roll-count column:** `ROLL_COUNTS[id]` or `—`. Sortable ascending (surfaces cold
  wired-but-never-fired tables — the re-authoring-priority signal from FABLE-DEV-TOOLS §telemetry).
- **Band distribution strip** per table: the labeled mini heat strip, e.g.
  `Grounded 12 · Textured 18 · Strange 14 · Volatile 5 · Mythic 1` (FABLE-DEV-TOOLS ruling: readable
  labeled counts, **never** cryptic initials like "GGG TTT SSS VV M"). Colors match the Band palette
  (realm/spice color grammar, FABLE-DEV-TOOLS §6 — reuse existing tokens, no new palette).
- **Detail panel:** rendered rows from `tables.json` (roll ranges + band + text) so a human can
  judge whether the rows are spicy enough for the stated band — "Do not reduce the atlas to counts
  alone" (FABLE-DEV-TOOLS §v1-shape). Plus the copy bundle (below).
- **Sort by:** spice band (band-weight = which band dominates the strip), roll count, row count,
  die shape, wiring status, category. **Filter by:** category/sub, wiring status, band coverage,
  status (active/archived/stub), free-text over name+id+path.
- **Heatmap dev flag (FABLE-DEV-TOOLS §heatmaps ruling — "authoring review flag, not automated
  truth claim"):** a table is flagged `⚑ under-spiced?` when its band histogram skews Grounded-heavy
  against its stated tier/context (v1 heuristic, PROVISIONAL — see below). The flag is advisory
  wording ("looks under-spiced against current doctrine"), never an assertion.

**PROVISIONAL for Adam (2 items):**
1. The exact under-spiced heuristic (v1 proposal: `totalBandedRows` = the sum of the five canonical
   buckets **excluding `unbanded` and `other`**; flag when `totalBandedRows > 0` AND
   `Grounded / totalBandedRows > 0.70` AND the table is not `player_facing:"reveal"`-neutral
   utility). A wholly un-banded table has `totalBandedRows === 0` and is never flagged. Adam should
   skim/tune the threshold — marked PROVISIONAL; the flag is cosmetic-advisory so a wrong threshold
   is harmless.
2. The `other`-bucket label set (which non-spice band terms are "expected utility" vs. "should have
   been spiced") — Adam skims the list.

### Copy bundle (per table — the Adam→Claude edit-request affordance)

Mirror the Monster Manual's copy-bundle doctrine (FABLE-DEV-TOOLS shared doctrine: "every app has a
copy bundle"). One button copies: `id`, `name`, source `path`, generated artifact (`tables.json`
key), wiring class + consumers, band histogram, roll count, and a suggested edit target
(`Engine/03. _Tables/**` source `.md`, never `tables.json`). This is the exact structured payload
Adam dictates edits against.

### Blind-playable parity (rubric 8 — every visual surface names its prose twin)

| visual surface | prose twin |
|---|---|
| Band distribution heat strip | the labeled text `Grounded 12 · Textured 18 · …` IS the twin — the strip is styling *over* readable text, never image-only (FABLE-DEV-TOOLS explicitly forbids cryptic initials for exactly this reason). |
| Wiring badge (🔗/▶/⛓/⚠️) | each badge carries `aria-label="wired in code"` / `"via procedure"` / `"chained"` / `"Oracle-only — no auto trigger"` / `"unmapped"` (the audit's own phrasing, verified). Glyph is decorative; the label is authoritative. |
| Roll-count column | a plain number or `—`, screen-reader-read as `"fired N times in test sessions"` / `"no roll data"`. |
| Under-spiced flag ⚑ | `aria-label="advisory: band distribution looks under-spiced against current doctrine"`. |
| The whole app | shell ARIA/focus-trap inherited from the Reference Shelf (verified `REFERENCE-SHELF.md` — `role="dialog" aria-modal="true"`, Esc-close, focus trap); the Atlas list is a `role="list"`, each row a focusable `role="listitem"` with a full aria-label, mirroring `ref-bestiary.js:343`'s card pattern. A screen-reader user reaches every table's name, wiring, band counts, roll count, and rows as text. |

### Acceptance — U2

```
python3 build/gen-table-atlas.py
python3 build/check-manifest.py
node dev/verify-table-atlas.mjs
```
Expected:
1. `gen-table-atlas.py` prints `wrote data/table-atlas.js` and
   `Object.keys(TABLE_ATLAS_DATA).length === <the registry active-table count>` — assert against the
   registry's own `counts.active` (verified today **318**), NOT a hardcoded literal.
2. `check-manifest.py` → **OK** (0 orphans, 0 drift; the three new files + `ref-atlas.js` all
   registered).
3. `verify-table-atlas.mjs` green (jsdom, loads real `genesis.html` module order per CLAUDE.md
   headless-test convention).

### Regression — U2 (RED-FIRST, mutation-asserting)

`dev/verify-table-atlas.mjs` (new). Every assertion checks a **value that moved**, not a label:
1. **Band histogram is real, not a stub — and covers BOTH band-source paths.** This is the finding
   the prior draft got wrong, so both paths get a mutation assert:
   - **Path B (band in `row[5][0]`, `row[2]` empty — the un-headered spice-table case).** Pick
     `architecture-material` (verified 2026-07-06: **12 rows, every `row[2]===''`**, band carried at
     `row[5][0]` = **8 Grounded / 3 Textured / 1 Strange**). Assert
     `TABLE_ATLAS_DATA["architecture-material"].bands.Grounded === 8`,
     `.bands.Textured === 3`, `.bands.Strange === 1`, `.bands.Volatile === 0`, `.bands.Mythic === 0`.
     A naive `row[2]`-only histogram would report `unbanded === 12` and every band `0` — that WRONG
     value is the RED this test kills.
   - **Path A (band in `row[2]`, populated Band header).** Pick `place-traits` (verified: 100 rows,
     all bands at `row[2]`, **66 Grounded / 20 Textured / 9 Strange / 4 Volatile / 1 Mythic**).
     Assert `TABLE_ATLAS_DATA["place-traits"].bands.Grounded === 66` and `.bands.Mythic === 1`.
   - A stub returning `{}` fails both — that is the red.
2. **Wiring joins through:** assert a known-WIRED table (e.g. `npc-role`) shows
   `wiring === "WIRED"` and `consumers.code` contains `codex-roll.js` (join from `TABLE_USAGE`
   proven live, not a placeholder).
3. **Roll-count soft-degrade:** with no `ROLL_COUNTS` global, assert the row renders `—` and does
   NOT throw; with `ROLL_COUNTS={"npc-role":7}` set, assert the rendered `npc-role` row shows `7`
   (the value moved from `—` to `7`).
4. **Expand proof (Reference Shelf acceptance bar):** register the Atlas and assert the shelf shows
   THREE buttons (Monster Manual, Wiki, Table Atlas) with **zero edits to `reference-shelf.js`** —
   proving the framework held (REFERENCE-SHELF.md "expand proof").
5. **Sort mutation:** sort by roll-count ascending; assert the first row's count `<=` the last row's
   (order actually changed, not just re-labeled).

---

## Don't-touch list (generated files — spec generators edit ONLY)

- `tables.json` / `tables.js` — regenerate via `python3 "Engine/00. _System/compile-tables.py"
  --emit`; the Atlas READS them, never writes.
- `data/bestiary.js` · `data/realm-bestiary.js` · `data/class-progression.js` · `data/wiki.js` —
  generated; untouched by this spec.
- `data/table-usage.js` · `data/roll-counts.js` · `data/table-atlas.js` — **new** generated
  artifacts; hand-editing them is forbidden the instant they exist. Only their generators
  (`gen-table-usage-audit.py`, `gen-roll-counts.py`, `gen-table-atlas.py`) edit them.
- `src/ui/ref-globals-bridge.js` — **do not extend** for the Atlas (classic script sees globals
  directly; see U2 §DECISION). Only touch it if the Atlas is ever converted to an ES module.
- `docs/TABLE-USAGE-AUDIT.md` — generated; U0 keeps emitting it unchanged alongside the new data file.

Spec generators this spec DOES edit (all hand-authored, non-generated): `src/engine/compiled.js`
(the tally hook), `build/gen-table-usage-audit.py` (the `_gen_data()` add), `genesis.html`,
`manifest.json`, and the three new source files (`src/ui/ref-atlas.js`, `build/gen-roll-counts.py`,
`build/gen-table-atlas.py`) + the four new verify harnesses.

## Enumerated edge cases with rulings

1. **`ROLL_COUNTS` absent (U1 not yet landed):** Atlas renders every roll-count cell as `—`; no
   throw. RULING: soft dep; U2 ships useful without U1.
2. **Table in registry but not in `tables.json` (id fails to resolve):** emit with `wiring:
   "UNMAPPED"`, `bands` all-zero, and a visible `⚑ unmapped` flag. RULING: never silently drop a
   registry row.
3. **Table in `tables.json` but not in registry:** the registry is the catalog spine; such tables
   appear via the `tables.json` pass with `category: "Unsorted"` (mirroring the registry's own
   `Unsorted` bucket, verified) — never hidden.
4. **Split-band cell (`Strange–Volatile`):** counts toward both halves of the histogram. RULING:
   verified rare (3 occurrences); dual-count is honest.
5. **Non-spice band label at `row[2]` (`utility`/`combat`/`high-power`/`reality-breaking` — the four
   verified non-canonical index-2 labels):** goes to the `other` bucket, grey segment, hover shows
   the actual label — NOT flagged under-spiced. Rarity terms like `Common`/`Rare` are NOT index-2
   labels (they live at `row[5][0]` content) so they never reach a band bucket at all. RULING:
   loot/utility tables are not spice tables; do not penalize them.
   **Un-banded rows (`bandOf` returns nothing — the 17k-row majority):** counted in the `unbanded`
   bucket, and a wholly un-banded table is exempt from the under-spiced flag entirely. RULING: a name
   bank or loot roster is not "under-spiced"; only tables with ≥1 canonical band are candidates.
6. **Archived / stub table (`status`):** shown, greyed, with a status chip; filterable out. RULING:
   the Atlas is the authoring dashboard — archived tables are legitimate content to survey.
7. **A table fires but is `surfacedToPlayer:false` (plumbing-only roll):** the roll count still
   increments (the tally is at `rollTable`, agnostic to surfacing). RULING: "fires in play" = the
   engine rolled it; the player-visible split is a later telemetry field (FABLE-DEV-TOOLS §telemetry
   schema `surfacedToPlayer`), not a v1 gate.
8. **jsdom harness with no `GS`:** `rollTable` tally is a guarded no-op (verified guard in U1
   surface); Oracle-only verify harnesses stay byte-green.
9. **Two unwired tables cross-linking each other read as ⛓ CHAINED:** inherited caveat from the
   audit generator (verified, `gen-table-usage-audit.py:127` documents it). RULING: the Atlas
   surfaces the audit's classification verbatim — it does not "improve" the wiring heuristic in v1;
   that caveat is shown in the detail panel so Adam is not misled.

## v2 / out of scope (fenced, not built)

- **In-browser writability** — the dream endpoint (FABLE-DEV-TOOLS §v2). NOT v1. Writeback requires:
  writes only to `Engine/03. _Tables/**/*.md`, pipeline regeneration, table-lint, and a diff-before-
  apply. Fenced until source-ownership rules are "boringly explicit" (Adam's bar).
- **`build/lint-tables.py` inline warnings** — surfacing lint errors in the Atlas is a fast-follow
  (FABLE-DEV-TOOLS candidate build order step 4), not v1.
- **Player-visible vs plumbing-only roll split, fires-per-hour, last-fired, top-callers** — the
  richer telemetry fields (FABLE-DEV-TOOLS §telemetry schema). v1 ships **total roll count only**
  (Adam's single hard requirement).

---

## GUARDRAIL — NPC Library (app #4; NOT specced here)

Scope fence only (full spec is a later Fable unit). When it is specced, it MUST:
- **Read-only v1**, reading `Asset Library/NPCs/**/*.md` + any compiled NPC records — never the
  in-play `w.codex` NPC instances (those are world state, not the asset bench).
- **Preserve the four-way distinction** (FABLE-DEV-TOOLS §NPC): NPC *asset* (reusable template) vs
  NPC *instance* (this world's person) vs NPC *generator row* (table material) vs *promoted PC*.
  Never blend them into one record.
- **Writeback precondition:** editing NPCs already in play is OUT; v1 edits the *bench* only. Any
  editor writes to NPC *source* files via template, never to a live world blob.
- Reuse the Reference Shelf registration contract (`referenceShelfRegister`, order 4) and the copy-
  bundle + blind-playable doctrine unchanged.

## GUARDRAIL — Town Builder (app #5; NOT specced here)

- **Node/walk graph views FIRST** (the graph already exists); legible full-town geometry is later
  and MUST keep a prose twin (searchable locations, adjacency, travel cost).
- **Gameplay-object first:** every generated town needs visible decisions, pressure, resources, and
  consequence paths — "not a beautiful town with no gameplay handles" (FABLE-DEV-TOOLS).
- **Writeback precondition:** any external town-gen scaffolding is admissible ONLY if its output
  converts into Genesis-owned graph/location/building data, never a purely visual map.

## GUARDRAIL — Building Builder (app #6; NOT specced here)

- Works from `Asset Library/Buildings` + the urban/dungeon table families; produces readable
  exterior + interior zones + one immediate problem + one hidden truth + provenance.
- **Writeback precondition:** promotion of a generated building into a reusable asset OR a town
  instance is v2; v1 assembles + displays only, read-only, with source provenance visible.

---

## Registry updates (one-line edits Fable applies to shared docs)

- **docs/DESIGN.md registry:** add `TABLE-ATLAS — Reference Shelf app #3 (read-only table-corpus
  dashboard: wiring + band strips + roll-count telemetry). SPEC-LOCKED 2026-07-06, build DEFERRED
  (post-Fable). Deps: U0 table-usage split → U1 roll-count seam → U2 atlas app.`
- **docs/NEXT-STEPS.md:** add under the deferred/post-Fable dev-tools queue: `Table Atlas (docs/
  TABLE-ATLAS.md) — U0 gen-table-usage data split · U1 GS.tableRolls tally + gen-roll-counts · U2
  src/ui/ref-atlas.js shelf app. First of the four dev tools (Atlas → NPC Library → Town Builder →
  Building Builder).`
- **docs/README.md index:** add `TABLE-ATLAS.md — type: system-spec — Reference Shelf app #3; the
  read-only Table Atlas + its two data-seam units (table-usage split, roll-count telemetry).`
