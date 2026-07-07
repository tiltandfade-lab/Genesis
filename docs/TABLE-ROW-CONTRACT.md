---
type: system-spec
project: Genesis
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
created: 2026-07-06
related:
  - "[[TABLE-EDIT-SAFETY]]"
  - "[[SPICE-CURVE]]"
  - "[[SPICE-RULER]]"
  - "[[DESIGN]]"
  - "[[TABLE-REAUTHORING-PREP]]"
source: GPT-5.5-advice-for-Claude/README.md §"Table Row Contract" + §"Table Language Audit" (adopted with rulings below)
---

# TABLE-ROW-CONTRACT — table family schemas + lint

**One sentence:** every runtime table row must be *play-food, not hook-food* — this spec locks
the row test, five family schemas, a `table_family`/`row_contract` frontmatter convention, and
mechanical lint checks (extending the existing `build/lint-tables.py`) wired into the compile
pipeline, plus the Fork-vs-Volatile wording reconciliation.

**What this spec is NOT:** the craft rewrite of weak rows (giving NPC Hook its Seen Now / Wants /
Pressure columns with actual content) is **Adam's hands, out of scope** (per
`feedback-genesis-reauthoring-definition`). This spec builds the *measuring instrument* and the
*worklist*: after this build, `python3 build/lint-tables.py --warn-only` IS the re-authoring
punch list, with exact file/role gaps enumerated.

**Inference cost: zero.** No model call anywhere in this unit (SPEED-DOCTRINE compliant — lint is
pure stdlib Python; the compile gate is a subprocess call).

**Blind-playable parity:** this unit ships no visual surface. All output is plain-text CLI
findings (`file:line` per finding) — inherently screen-reader-native. No prose twin needed; the
lint output *is* prose.

---

## 1. The row test (doctrine, adopted verbatim from GPT §Table Row Contract)

Every runtime table row is graded against six questions:

1. **What is visible now?** (visible-now)
2. **What can the player do?** (can-do)
3. **What does it cost or threaten?** (costs)
4. **What can be gained?** (gains)
5. **What persists if ignored, used, broken, stolen, or survived?** (persists)
6. **Which typed event/state bucket would remember it?** (which-event-remembers)

Rows do not all need every field, but **every runtime row must answer at least two**. A row that
answers only "what would be cool?" is hook-food, not play-food.

**How this is mechanized (ruling — no NLP, no vibes):** the row test is enforced *structurally*,
never semantically. A table answers the questions by *having the family's required columns*
(questions 1–5 map onto column roles, §2) and by *declaring its state bucket* (question 6 maps
onto the new `remembers:` frontmatter field, §3). The lint checks column presence and cell
non-emptiness — it never judges prose quality. Per GPT: "This is safer than trying to lint
'vagueness' by words. The issue is missing function, not specific vocabulary."
**The lint is explicitly NOT a vague-word banlist.** "Someone" is fine inside a concrete row.
Do not add any word-frequency, word-ban, or prose-quality check. Ever.

---

## 2. Family schemas (verbatim from GPT §Table Language Audit)

Five schemas. Column headers are the *recommended authoring shape*; the lint matches by **role
synonym** (§5.3) so existing strong tables conform without renames.

| Family | Schema (authoring shape) |
|---|---|
| `situation` (situation/NPC) | `Band \| Seen Now \| Wants \| Pressure/Clock \| Leverage/Payoff \| If Ignored` |
| `item` | `Band \| Object \| Frame \| Use/Ranks \| Tell \| DM Ripple` |
| `place` | `Band \| Place \| What Is Happening Now \| Local Pressure \| Player Handle \| If Ignored` |
| `journey` (journey/walk) | `Band \| Beat \| Immediate Check/Cost \| Environmental Lens \| Persistent Trace` |
| `rumor` (rumor/hook) | `Band \| Claim \| Concrete Evidence \| Who Benefits \| What Happens Tonight` |

**Required vs recommended roles (ruling).** Required roles are calibrated so the corpus's proven
strong tables (Realm Items `Band|Item|Frame|Ranks|Note`, Chase Complications
`Band|Complication|Env lens`) pass clean — the schema codifies what already works; it does not
invent a stricter bar than the best existing tables meet.

| Family | REQUIRED roles | RECOMMENDED roles (reported only under `--verbose`, never gate) |
|---|---|---|
| `situation` | `band, seen, pressure, ignored` | `wants, payoff` |
| `item` | `band, object, frame, use` | `tell, ripple` |
| `place` | `band, place, now, pressure` | `handle, ignored` |
| `journey` | `band, beat, lens` | `cost, trace` |
| `rumor` | `band, claim, evidence` | `benefits, tonight` |

**Row-test mapping** (so the six questions are visibly covered): visible-now → `seen/object/
place/beat/claim`; can-do → `handle/use/evidence`; costs → `pressure/cost`; gains →
`payoff/use/tonight`; persists → `ignored/trace/ripple`; which-event-remembers → `remembers:`
frontmatter. A table with all its family's required roles + `remembers:` answers ≥2 questions
structurally.

**Family aliases (accepted in frontmatter, resolved before checking):** `npc`→`situation`,
`social`→`situation`, `hook`→`rumor`, `omen`→`rumor`, `walk`→`journey`, `hazard`→`journey`,
`breach`→`journey`. (This honors GPT §3's eight-family list — item/situation/place/journey/
hazard/social/omen/breach — with five underlying schemas.) The seed list below uses canonical
names only.

---

## 3. Frontmatter convention (extends `Engine/01. _Templates/_Table Frontmatter Schema.md`)

Three new **optional** fields on `type: table` / `type: table-set` files:

```yaml
table_family: situation   # situation | item | place | journey | rumor  (+ aliases above)
row_contract: draft       # draft | enforced
remembers: codex          # comma list from: codex | ledger | clock | faction | item | map | walk | none
```

Semantics (all rulings, final):

- **Untagged file (no `table_family`)** → zero family checks run. The corpus is opt-in; nothing
  outside the seed list (§4) changes behavior.
- **`row_contract: draft`** → missing REQUIRED role = **WARN**. This is the worklist state.
- **`row_contract: enforced`** → missing REQUIRED role = **hard ERROR** (fails the lint gate,
  blocks `--emit`). Adam's craft pass flips `draft`→`enforced` per table as he rewrites it —
  the ratchet. `table_family` present with `row_contract` absent → treated as `draft`.
- **`remembers:`** names the state bucket(s) question 6 points at. Missing on a family-tagged
  file → WARN (`draft`) / ERROR (`enforced`). Unknown value → hard ERROR always. All 41 seed
  files get it in this build (§4), so the post-build finding count from this check is **0**.
- These fields are **judgment fields** — `Engine/00. _System/stamp-frontmatter.py` must NOT be
  modified to auto-seed them (it already leaves existing/unknown fields untouched; verified: its
  fill logic only adds its own known fields). The compiler ignores them (verified:
  `compile-tables.py:223-225` reads only `table_class`/`player_facing`/`voice_critical`/`domain`
  from frontmatter) — so **tagging changes zero bytes of `tables.json`** (§11.3 asserts this).
- Update `Engine/01. _Templates/_Table Frontmatter Schema.md`'s Fields table with these three
  rows (copy the semantics above verbatim; mark all three "judgment (optional)").

---

## 4. Seed tagging (the executor applies these 41 tags — mechanical, all decided here)

Every file below gets `table_family:` + `row_contract:` + `remembers:` inserted into its existing
frontmatter block (immediately after the `voice_critical:` line; keep field order stable).
**No table row, header, or preamble is touched by tagging** (the ONLY body edit in this whole
unit is the Chase preamble sentence, §7).

### 4a. `enforced` (already conformant — these prove the ratchet holds; expected findings: 0)

| File | family | remembers |
|---|---|---|
| `Engine/03. _Tables/05. Realms/Realm Items - Ash.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Bright-Kingdom.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Chrome.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Cosmic.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Frontier.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Gloom.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - High-Seas.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Lost-World.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Noir.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Suburb.md` | item | item |
| `Engine/03. _Tables/05. Realms/Realm Items - Theater.md` | item | item |
| `Engine/03. _Tables/03. Session Mechanics/Chase Complications.md` | journey | clock |

### 4b. `draft` (the worklist — expected findings per file are the acceptance table in §11.2)

| File | family | remembers |
|---|---|---|
| `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Hook.md` | situation | codex |
| `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Hook Complication.md` | situation | codex |
| `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Want.md` | situation | codex |
| `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Leverage.md` | situation | codex |
| `Engine/03. _Tables/02. Social/Sentient NPCs/NPC If Ignored.md` | situation | codex,clock |
| `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Useful Knowledge.md` | situation | codex |
| `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Bonus Secret.md` | situation | codex |
| `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Side Quest - Job Board.md` | situation | codex,clock |
| `Engine/03. _Tables/02. Social/Quests & Problems/Quest Complication.md` | situation | clock |
| `Engine/03. _Tables/03. Session Mechanics/Pressure/Urban Pressure.md` | situation | clock |
| `Engine/03. _Tables/03. Session Mechanics/Pressure/In-Building Complications.md` | situation | clock |
| `Engine/03. _Tables/03. Session Mechanics/Tavern/Tavern - In Media Res.md` | situation | codex |
| `Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Problem.md` | situation | walk |
| `Engine/03. _Tables/03. Session Mechanics/Dungeons/Wilderness Problem.md` | situation | walk |
| `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Problem.md` | situation | walk |
| `Engine/03. _Tables/03. Session Mechanics/Travel & Resting/Travel Complication.md` | journey | walk |
| `Engine/03. _Tables/03. Session Mechanics/Travel & Resting/Travel Threat.md` | journey | walk |
| `Engine/03. _Tables/03. Session Mechanics/Travel & Resting/Camp Cooking Complications.md` | journey | clock |
| `Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Rest Complications.md` | journey | clock |
| `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Rest Complications.md` | journey | clock |
| `Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Rumor Intel.md` | rumor | codex |
| `Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Secrets.md` | rumor | codex |
| `Engine/03. _Tables/03. Session Mechanics/Distant Word.md` | rumor | codex |
| `Engine/03. _Tables/03. Session Mechanics/Shrine and Omen.md` | rumor | codex |
| `Engine/03. _Tables/01. World Building/Place Generation/Place Nearby.md` | place | map |
| `Engine/03. _Tables/01. World Building/Place Generation/Place-Secret.md` | place | codex |
| `Engine/03. _Tables/01. World Building/Place Generation/Building Interior.md` | place | codex |
| `Engine/03. _Tables/03. Session Mechanics/Place Drift.md` | place | map |
| `Engine/03. _Tables/03. Session Mechanics/Items & Rewards/Trinket Table.md` | item | item |

### 4c. Deliberately NOT tagged in v1 (rulings, so no executor re-litigates)

- **Walk Skin / Walk Breach / Walk Nightmare ×9** — they already carry a *stronger*,
  compile-enforced contract (Grants/Motif emitted at `row[8]/row[9]` via the tid gate at
  `compile-tables.py:185`). Tagging them `journey` would misdescribe lens tables as beat tables.
  A future `skin` family can be added when a second lens-table family exists; not now.
- **Plot Item / Plot Lock** — pointer tables (doer/pointer doctrine, ADAM-REVIEW-2). Their
  contract (`what it is / why it matters / what it opens`) is its own shape and already strong;
  forcing `item.frame` onto pointers would be dishonest. Left for the craft pass.
- Everything else in the corpus — untagged, unaffected, zero new findings.

**Worked before→after (tagging site, representative — same mechanical edit ×41):**

`Engine/03. _Tables/02. Social/Sentient NPCs/NPC Hook.md` lines 1–9, before:

```yaml
---
id: npc-hook
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
---
```

after:

```yaml
---
id: npc-hook
type: table
domain: Social / Sentient NPCs
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
table_family: situation
row_contract: draft
remembers: codex
---
```

---

## 5. Lint implementation — extend `build/lint-tables.py` (checks 6–10 + baseline ratchet)

The existing linter (361 lines, checks 1–5: coverage, band-monotonic, dups, ragged rows, empty
band cells) stays byte-for-byte in behavior for untagged files — **all five existing checks are
untouched**. The MIRROR-NOT-STRICTER rule (its header comment) continues to bind: family checks
gate only files that opted in via frontmatter, so nothing the compiler accepts is newly rejected
unless its own frontmatter demanded it.

### 5.1 New CLI surface

- Default run (`python3 build/lint-tables.py`): all checks 1–10, **baseline-aware** (§5.6) —
  exit 1 only on hard ERRORs *not* in `build/lint-baseline.json`.
- `--warn-only`: unchanged semantics — always exit 0, print everything.
- `--no-baseline`: ignore the baseline file (every hard ERROR gates). For audits.
- `--update-baseline`: rewrite `build/lint-baseline.json` from the current ERROR set, print the
  fingerprints written, exit 0. (Run deliberately, never in CI/compile.)
- `--verbose`: additionally print RECOMMENDED-role gaps (never counted in the summary line, never
  gate).

### 5.2 `Finding` class extension

Add two fields so fingerprints are stable across line drift:

```python
class Finding:
    def __init__(self, sev, rel, line, tid, msg, check="", span=""):
        self.sev, self.rel, self.line, self.tid, self.msg = sev, rel, line, tid, msg
        self.check, self.span = check, span
    @property
    def fingerprint(self):
        return f"{self.rel}|{self.tid}|{self.check}|{self.span}"
```

Every existing `Finding(...)` call site gains `check=`/`span=` kwargs with these stable ids
(update all of them; the message strings stay identical):

| Existing check | `check` id | `span` |
|---|---|---|
| overlapping ranges | `coverage-overlap` | first ≤3 overlap values, comma-joined (e.g. `"5"`) |
| coverage gap | `coverage-gap` | first ≤3 missing values, comma-joined (e.g. `"7"`) |
| starts-high | `starts-high` | `str(amin)` |
| band regression, isolated dip | `band-dip` | the printed roll span (e.g. `"26-27"`, `"38"`) |
| band regression, sustained reset | `band-reset` | the printed roll span |
| empty Band cell | `empty-band` | `str(lo)` |
| ragged row | `ragged-row` | `str(lo)` |
| duplicate row | `dup-row` | `str(lo)` |

### 5.3 Role synonym table + matcher (new module-level constants — copy verbatim)

```python
# docs/TABLE-ROW-CONTRACT.md §2/§5.3 — role → accepted header spellings (lowercased, **-stripped,
# whitespace-collapsed, EXACT cell match; NOT substring, except the existing 'band' rule).
# Extending a synonym list is allowed; narrowing one is a spec change.
ROLE_SYNONYMS = {
 "band":   ["band"],   # matched by the existing substring rule ('band' in h), kept as-is
 "seen":   ["seen now","hook","complication","result","event","situation","building","outcome",
            "obstacle","obstacle type / creature",'the obstacle / "lock"',
            'the obstacle / "lock" (barrier)',"job offered (in the npc's voice)","core want",
            "leverage point","useful knowledge or secret","the secret"],
 "wants":  ["wants","core want","want"],
 "pressure":["pressure/clock","pressure","clock","urgency","play effect",
            "narrative & tactical impact","solving the problem (checks)","complication"],
 "payoff": ["leverage/payoff","payoff","leverage","reward","potential reward / outcome",
            "immediate payoff"],
 "ignored":["if ignored","ignored","outcome"],
 "object": ["object","item","the object","trinket","object sitting on a table, shelf, or bar"],
 "frame":  ["frame"],
 "use":    ["use/ranks","ranks","use","uses","effect"],
 "tell":   ["tell"],
 "ripple": ["dm ripple","ripple","note"],
 "place":  ["place","layout (connected spaces)","result","hidden mistake"],
 "now":    ["what is happening now","now","who / what is inside","description","what it touches"],
 "handle": ["player handle","handle","notable feature"],
 "beat":   ["beat","complication","complication type","result","encounter profile"],
 "cost":   ["immediate check/cost","check/cost","cost","immediate consequence",
            "narrative & tactical impact","tactical behavior / benefit"],
 "lens":   ["environmental lens","env lens","lens","environmental tell",
            "env lens (wild / dungeon / urban)","signs of presence"],
 "trace":  ["persistent trace","trace"],
 "claim":  ["claim","rumor / intel","clue / secret","word","shrine or omen"],
 "evidence":["concrete evidence","evidence","check required","detail",
            "lens (how the telling garbles the bound fact)"],
 "benefits":["who benefits","benefits","kind"],
 "tonight":["what happens tonight","tonight","myth/taboo binding","immediate payoff"],
}
FAMILY_ROLES = {
 "situation": {"required": ["band","seen","pressure","ignored"], "recommended": ["wants","payoff"]},
 "item":      {"required": ["band","object","frame","use"],      "recommended": ["tell","ripple"]},
 "place":     {"required": ["band","place","now","pressure"],    "recommended": ["handle","ignored"]},
 "journey":   {"required": ["band","beat","lens"],               "recommended": ["cost","trace"]},
 "rumor":     {"required": ["band","claim","evidence"],          "recommended": ["benefits","tonight"]},
}
FAMILY_ALIASES = {"npc":"situation","social":"situation","hook":"rumor","omen":"rumor",
                  "walk":"journey","hazard":"journey","breach":"journey"}
REMEMBERS_ENUM = {"codex","ledger","clock","faction","item","map","walk","none"}
```

**Matching algorithm (single-claim, deterministic):** normalize each header cell with the
existing `CELL()` then `.lower()` and collapse internal whitespace runs to one space. Walk roles
in the order listed in `FAMILY_ROLES[fam]["required"]` then `["recommended"]`; for each role,
scan header columns left→right, skipping column 0 (the die index) and any column already claimed
by an earlier role; the first cell exactly equal to a synonym claims that column. `band` uses the
existing `'band' in h` substring rule (mirror of `compile-tables.py:189`). One column can satisfy
only one role.

### 5.4 New per-block checks (run inside `lint_file`, after the existing checks, only when the
file's frontmatter carries `table_family`)

- **CHECK 6 `family-unknown`** — `table_family` value (after alias resolution) not in
  `FAMILY_ROLES`, or `remembers` present with any token not in `REMEMBERS_ENUM`, or
  `row_contract` present and not `draft`/`enforced` → **hard ERROR always** (a typo'd tag is a
  spec bug, not a style note). File-level, emitted once per file.
- **CHECK 7 `family-missing`** — for each dice block (`parse_block` returns non-None) in a
  family-tagged file: each REQUIRED role with no claimed column → one finding per missing role.
  Severity: WARN (`draft`) / ERROR (`enforced`). `span` = the role name. RECOMMENDED-role gaps
  print only under `--verbose` and are never counted.
- **CHECK 8 `family-nondice`** — family-tagged file where NO block parses as a dice table
  (lookup matrices) → single WARN; family checks skipped. (None of the 41 seeds trips this.)
- **CHECK 9 `inert-column`** — for each CLAIMED role column (excluding `band`) in a block with
  ≥10 data rows: if ≥90% of its cells are empty → WARN. `span` = role name. Threshold ruling:
  90%/10-row floor exists so Realm Items' legitimately-sparse `Ranks` column (empty on mundane
  rows by design) stays clean — verified 0 findings corpus-wide today; the check exists to catch
  a column that is *pure decoration*.
- **CHECK 10a `class-mismatch`** — runs on EVERY `table`/`table-set` file (not only tagged ones)
  that has a recognizable Band column with cleanly-parsing canonical band words (reuse CHECK 2's
  gating): if the body's max band rank exceeds the `table_class` ceiling (`Spark`→Textured(1),
  `Fork`→Strange(2), `Commitment`→Mythic(4), per SPICE-CURVE §4) → WARN naming the fix
  direction: *"body reaches {band}; promote table_class to {needed}, never delete or
  narrate-down rows (TABLE-ROW-CONTRACT §7)"*. `span` = the max band word. Expected corpus
  count after §7's promotions: **0**.
- **CHECK 10b `stale-distribution`** — file-level, every `table`/`table-set` file: preamble/body
  text matching `re.search(r"66[\s>*]*Grounded", text, re.I)` (wrap- and blockquote-tolerant —
  the old 66/20/9/4/1 worldview being re-taught, GPT §Table Language Audit format-issue 1) →
  WARN: *"re-teaches the pre-2026-07-06 conservative distribution; reword during the spice
  re-band / craft pass"*. `span` = `"66"`. Expected corpus count: **20** (list in §11.2b).
  The scrub itself is OUT OF SCOPE here (owned by the spice-baseline unit + Adam's craft pass);
  this check is only the ledger.

### 5.5 Row-level inert-row check — deliberately NOT built (ruling)

A per-row "≥2 non-empty function cells" check is only meaningful once a table HAS ≥2 function
columns; on today's single-column tables it would emit one warning per row (~100 per weak table,
thousands corpus-wide) and bury the signal. The missing-column finding already carries the same
information at file grain. Revisit only after the craft pass lands multi-column rewrites.

### 5.6 Baseline ratchet — `build/lint-baseline.json` (new file, checked in)

```json
{
  "version": 1,
  "generated": "2026-07-06",
  "note": "Known pre-existing hard ERRORs. Lint fails only on ERRORs NOT listed here. Regenerate deliberately with --update-baseline; shrinking this file is progress, growing it needs a reason in the commit message.",
  "errors": [
    "Engine/03. _Tables/03. Session Mechanics/Pressure/In-Building Complications.md|in-building-complications|band-dip|26-27",
    "Engine/03. _Tables/03. Session Mechanics/Pressure/In-Building Complications.md|in-building-complications|band-dip|35-36",
    "Engine/03. _Tables/03. Session Mechanics/Pressure/In-Building Complications.md|in-building-complications|band-dip|38"
  ]
}
```

Semantics: after collecting findings, partition ERRORs into `new` (fingerprint not in baseline)
and `baselined` (present). Baselined ERRORs print as `[ERROR*]` with a `(baselined)` suffix and
do NOT trigger exit 1. Baseline entries matching no current finding print one WARN each
(`check` id `stale-baseline`): *"baseline entry no longer fires — run --update-baseline"*.
The summary line becomes:
`LINT — files scanned: N | tables/blocks checked: N | errors: N (new: N, baselined: N) | warnings: N`.
The 3 entries above are the In-Building band dips — Adam-skim material (band re-ordering is a
taste call), deliberately NOT fixed by this unit.

### 5.7 Worked before→after (lint code, the two load-bearing sites)

**Site A — `build/lint-tables.py:335` (summary/exit block), before:**

```python
    errors = [x for x in findings if x.sev == "ERROR"]
    warns = [x for x in findings if x.sev == "WARN"]
    ...
    if errors and not WARN_ONLY:
```

**after (shape, exact strings per §5.6):**

```python
    errors = [x for x in findings if x.sev == "ERROR"]
    warns = [x for x in findings if x.sev == "WARN"]
    baseline = load_baseline()          # set of fingerprint strings, or empty set if file absent
    new_errors = [x for x in errors if x.fingerprint not in baseline]
    ...
    if new_errors and not WARN_ONLY:
```

**Site B — `build/lint-tables.py:281` region (after CHECK 5 inside the block loop): insert
CHECKs 7/9 there; CHECKs 6/8/10a/10b sit at file level in `lint_file` after the `fm.get('type')`
gate.** Each new finding must pass `check=`/`span=` per §5.4.

---

## 6. Compile-pipeline wiring — `Engine/00. _System/compile-tables.py`

Insert a lint gate directly after the safety-gate block (after line 61, `sys.exit(1)`), before
any table parsing:

**Before (lines 54–62):**

```python
_SAFETY_HITS=safety_scan()
if _SAFETY_HITS:
    ...
    sys.exit(1)
```

**After — append this block below it:**

```python
# ---- table-row-contract lint gate (docs/TABLE-ROW-CONTRACT.md §6) — EMIT only.
# Baseline-aware: build/lint-tables.py exits 1 only on NEW hard errors (build/lint-baseline.json).
# REPORT mode stays gate-free so dev/verify-table-lint.py's compiler shim is unaffected.
if EMIT:
    import subprocess
    _lint=subprocess.run([sys.executable, os.path.join(BASE,"build","lint-tables.py")],
                         capture_output=True, text=True)
    if _lint.returncode!=0:
        print(_lint.stdout)
        print("="*80)
        print("LINT GATE FAILED — new hard error(s) above. Compile ABORTED, nothing written.")
        print("(Pre-existing baselined errors never block; see build/lint-baseline.json.)")
        print("="*80)
        sys.exit(1)
```

Ruling: gate on `--emit` only (report mode = free inspection, matching the safety gate's spirit
of "no artifact written past a failed gate"). `dev/verify-table-lint.py`'s compiler shim never
passes `--emit` (verified: `sys.argv = [COMPILER_PATH]` at `verify-table-lint.py:103`), so all
nine existing harness assertions are structurally unaffected.

Also update `docs/TABLE-EDIT-SAFETY.md` §"The workflow" step 2's parenthetical to mention the
family checks + baseline (one sentence), and CLAUDE.md is NOT touched (the compile command is
unchanged).

---

## 7. Fork-vs-Volatile wording reconciliation — **RULED: let the hot rows live**

Per Adam 2026-07-06 (spice adoption: "Spice Ruler = labeling discipline, not distribution
cowardice") and the GPT format-issue 2 fork ("either cap the table honestly or let the hot rows
be live"): **the rows stay live; the LABEL moves up to match the body.** The fix direction for
any `class-mismatch` finding is always *promote `table_class`*, never delete rows, never keep
"narrate them down" language. Narrate-down clauses are struck wherever found.

Three promotions in this build (the complete current `class-mismatch` set, verified by prototype
run 2026-07-06):

**7a. `Engine/03. _Tables/03. Session Mechanics/Chase Complications.md`**

- Line 6, before: `table_class: Fork` → after: `table_class: Commitment`
- Preamble lines 20–22, before (one wrapped sentence):

> `; Fork's own permitted spice ceiling stops at Strange per `[[SPICE-CURVE]]` §4 — the Volatile/Mythic rows below are share-holders only, and the DM narrates them down to their nearest Strange-equivalent beat if one lands live.`

- after (replace that clause, from the `;` through `lands live.`, with):

> `; Commitment ceiling — the Volatile/Mythic rows are LIVE: when one lands, it happens as written (Adam 2026-07-06, TABLE-ROW-CONTRACT §7 — let the hot rows live).`

- The `(66 Grounded · 20 Textured · …)` recital in the same blockquote **stays** — it factually
  describes the current body and is the spice re-band unit's to change; CHECK 10b keeps it on
  the ledger. No row is touched.

**7b. `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Loot - Valuables.md`**
line 6, before: `table_class: Fork` → after: `table_class: Commitment`. Nothing else.

**7c. `Engine/03. _Tables/03. Session Mechanics/Pressure/In-Building Complications.md`**
line 6, before: `table_class: Fork` → after: `table_class: Commitment`. Nothing else (its 3
band-dip ERRORs stay baselined, §5.6 — band re-ordering is Adam's).

`table_class` IS emitted into the artifact (`compile-tables.py:223` `"class":fm.get('table_class',"")`),
so after these edits the executor MUST recompile (`python3 "Engine/00. _System/compile-tables.py"
--emit`) and commit source + `tables.json` + `tables.js` together. Acceptance §11.3 pins the diff
to exactly these three `class` values.

Runtime impact check (verified): no `src/` code branches on the compiled `class` field today
(grep over `src/` for table-class readers comes back empty; `combat-actions.js:68`'s `sh.class`
is the character class, unrelated). The promotions are label-only at runtime.

---

## 8. Edge cases (enumerated rulings)

1. **`table-set` with multiple dice blocks + one `table_family`** — the family applies to EVERY
   dice block in the file. (All 41 seeds are single-dice-block files; verified by prototype —
   41 files → 41 blocks.)
2. **Unknown `table_family` / `row_contract` / `remembers` value** — hard ERROR always, even
   under `draft` (CHECK 6). `--warn-only` still prints it but exits 0.
3. **Aliased family values** — resolved silently; the finding text shows the canonical family.
4. **Two roles whose synonym lists share a spelling** (e.g. `"complication"` in both `seen` and
   `pressure`, `"result"` in `seen`/`place`/`beat`, `"outcome"` in `seen`/`ignored`,
   `"immediate payoff"` in `payoff`/`tonight`) — resolved by the single-claim ordering of §5.3:
   required-role list order, columns left→right, first match claims. Deterministic; the §11.2
   expectation table is the oracle for every seed file.
5. **`band` role on an un-banded table** (NPC Hook et al.) — reported as a normal
   `family-missing` finding for role `band`; CHECK 2 (monotonicity) continues to no-op exactly
   as today when no Band column exists.
6. **Family-tagged file with no dice block** — CHECK 8 WARN, all other family checks skip.
7. **Special tids (`dungeon-lore*`, `*modifier*`)** — keep skipping CHECKs 1–2 as today; family
   checks WOULD apply if such a file were tagged (none are seeded — do not tag them).
8. **`--warn-only` vs `enforced`** — enforced-mode ERRORs print as ERRORs but exit 0 under
   `--warn-only` (report-only mode never hides, only un-gates — same contract as today).
9. **Baseline file absent** — `load_baseline()` returns the empty set; every ERROR gates
   (pre-baseline behavior). Baseline file malformed JSON — print one ERROR
   (`check` id `baseline-corrupt`) and treat as absent (fail-closed).
10. **Ragged row shorter than a claimed role column** — the role cell counts as empty for
    CHECK 9 (guard `ci < len(cells)`, mirroring the compiler's tolerance); never a crash.
11. **A future table tagged `enforced` that then loses a column in a hand-edit** — lint hard-fails
    and the compile gate refuses `--emit`: the ratchet working as intended. The error message
    must name the missing role AND the family schema line from §2 so the fix is copy-pasteable.
12. **Frontmatter field ordering** — parser is order-independent (`fm_and_body` regex); the
    §4 insertion-point rule exists only for diff hygiene.

---

## 9. Regression checks — extend `dev/verify-table-lint.py` (fixtures 10–17)

All follow the existing harness pattern (real linter exec'd via the ROOTS shim, synthetic
fixtures, per-fixture isolated dirs). **RED-FIRST proof, run ONCE before implementing:** run
fixtures 10–17 against the UN-modified `build/lint-tables.py` — assertions 10–15 and 17 must
FAIL (the new checks don't exist yet: finding counts stay 0, exit codes stay 0) and only then
implement. Record the red run's output in the build branch's commit message. Every assertion
below is a MUTATION assertion (a value must MOVE, not merely a label appear — the BUG-01 lesson).

- **Fixture 10 (draft worklist):** `table_family: situation` + `row_contract: draft` +
  `remembers: codex`, body `| d6 | Hook |` (rows 1–6). Assert: warnings count for the dir moves
  0 → **3** (`family-missing` × band/pressure/ignored), exit 0, and the findings name all three
  roles. RED: un-modified lint reports `warnings: 0` here.
- **Fixture 11 (enforced gate):** same body, `row_contract: enforced`. Assert: exit code moves
  0 → **1**, errors count 0 → 3. RED: exit 0.
- **Fixture 12 (conformant enforced):** `table_family: item`, `row_contract: enforced`,
  `remembers: item`, header `| d6 | Band | Item | Frame | Ranks | Note |`, 6 clean ascending-band
  rows. Assert: errors 0 AND warnings 0 AND exit 0 (the Realm-Items shape passes enforced).
- **Fixture 13 (class-mismatch):** untagged-family table, `table_class: Fork`, Band column
  reaching Mythic. Assert: warnings 0 → **1**, finding contains `promote table_class` and
  `Commitment`, exit 0. RED: 0 warnings.
- **Fixture 14 (stale-distribution):** clean table whose preamble blockquote contains
  `(66\n> Grounded · 20 Textured)` split across lines exactly like Chase. Assert: warnings
  0 → **1** with check id `stale-distribution` (the wrap-tolerant regex is the point). RED: 0.
- **Fixture 15 (unknown tag):** `table_family: vibes`. Assert: exit 0 → **1**, error text names
  the accepted values. RED: exit 0.
- **Fixture 16 (baseline ratchet):** gap fixture (reuse fixture 1's body) + a fixture-local
  baseline containing its fingerprint (shim gains a `BASELINE_PATH` patch the same way it
  patches `ROOTS` — patch the `load_baseline()` path constant). Assert BOTH directions:
  (a) with the fingerprint present, exit moves 1 → **0** and stdout contains `(baselined)`;
  (b) add a SECOND gap table to the same dir, not in baseline → exit returns to **1** and the
  summary shows `new: 1, baselined: 1`. (Mutation: the exit code and the new/baselined split
  both move.)
- **Fixture 17 (compile gate present):** assert `Engine/00. _System/compile-tables.py` source
  contains the literal `LINT GATE FAILED` block AND that REPORT mode (shim, no `--emit`) on
  fixture 12's dir still exits 0 with no lint subprocess side effects (stdout free of
  `LINT GATE`). Plus real-corpus assertion in §11.4.

Also keep all 9 existing assertions green — they are the mirror-not-stricter regression net.

---

## 10. Don't-touch list

- **Generated — never hand-edit:** `tables.json`, `tables.js` (regenerate via the compile
  command only), `data/bestiary.js`, `data/realm-bestiary.js`, `data/class-progression.js`,
  `data/wiki.js`, `data/items.js`'s generated blocks. The ONLY generated-artifact change this
  unit produces is the 3-value `class` diff of §11.3, produced by recompiling.
- **Table BODIES:** zero row/header edits anywhere. The single body edit in this unit is the
  Chase preamble clause (§7a) — preamble prose, not a row.
- **`Engine/00. _System/stamp-frontmatter.py`** — unchanged (judgment fields are never
  auto-seeded).
- **`build/safety-denylist.json`** — unchanged; the new lint is NOT a word banlist (§1) and must
  not grow one.
- **Existing lint checks 1–5 logic** — behavior-identical for untagged files (only the
  `Finding` signature + summary/exit plumbing changes around them).
- **`src/`, `manifest.json`, `genesis.html`** — untouched (no JS modules change;
  `check-manifest.py` not required, but harmless to run).
- **`docs/DM-BRIDGE.md` / live-session surfaces** — untouched (standing rule).
- Walk Skin/Breach/Nightmare ×9, Plot Item, Plot Lock — explicitly not tagged (§4c).

## 11. Acceptance (commands + expected numbers — post-build, on the branch)

**11.1 Harness:** `python3 dev/verify-table-lint.py` → **all assertions pass, 0 failed**
(9 existing + the new fixture-10..17 set; the exact new-assertion count follows §9's sub-asserts —
every listed sub-assert must appear in the output as `ok`). RED-FIRST transcript for 10–17
captured before implementation (§9).

**11.2 Corpus run:** `python3 build/lint-tables.py --warn-only` → summary line exactly:

```
WARN-ONLY — files scanned: 819 | tables/blocks checked: 298 | errors: 3 (new: 0, baselined: 3) | warnings: 979
```

Warnings decompose as **901 pre-existing + 58 `family-missing` + 20 `stale-distribution` + 0
`class-mismatch` + 0 `inert-column` + 0 `remembers`-related** (prototype-verified 2026-07-06 on
this exact corpus). If any component differs, STOP and reconcile against the expectation tables
below before proceeding — a drifted count means either the corpus moved under you (re-run the
prototype) or a §5.3 synonym was transcribed wrong.

Per-file `family-missing` expectation (58 findings; roles per §5.3 matcher):

| File (basename) | missing roles |
|---|---|
| NPC Hook / NPC Hook Complication / NPC Want / NPC Leverage / NPC If Ignored / NPC Useful Knowledge / NPC Bonus Secret | band, pressure, ignored (×7 files = 21) |
| NPC Side Quest - Job Board | pressure, ignored (2) |
| Quest Complication | band, ignored (2) |
| Urban Pressure | pressure, ignored (2) |
| In-Building Complications | ignored (1) |
| Tavern - In Media Res | band, pressure, ignored (3) |
| Urban Problem | band, ignored (2) |
| Wilderness Problem / Dungeon Problem | band, pressure, ignored (×2 = 6) |
| Travel Complication / Travel Threat | band (×2 = 2) |
| Camp Cooking Complications | band, lens (2) |
| Urban Rest Complications / Dungeon Rest Complications | band, lens (×2 = 4) |
| Urban Rumor Intel | band, evidence (2) |
| Urban Secrets | band (1) |
| Distant Word / Shrine and Omen | — (0; conformant as-is) |
| Place Nearby | now, pressure (2) |
| Place-Secret | pressure (1) |
| Building Interior | pressure (1) |
| Place Drift | pressure (1) |
| Trinket Table | band, frame, use (3) |
| Chase Complications + 11 Realm Items (enforced) | — (0 — MUST stay zero; any finding here fails the build) |

**11.2b** `stale-distribution` fires on exactly these 20 files: Art Depiction, Myth Becomes
Geography, Myth Costs, Place History, Place Relevancy, Place Ruler Status, Region Identity,
Starting State - Opening Bundle, Chase Complications, Distant Word, Downtime Ledger, Festival
and Holy Days, NPC Life Event, Place Drift, In-Building Complications, Urban Pressure, Shrine
and Omen, Walk Skin - Dungeon, Walk Skin - Urban, Walk Skin - Wilderness.

**11.3 Artifact diff:** `python3 "Engine/00. _System/compile-tables.py" --emit` exits **0**
(lint gate passes on baseline), then:

```
python3 - <<'EOF'
import json, subprocess
old = json.loads(subprocess.run(["git","show","HEAD:tables.json"],capture_output=True,text=True).stdout)
new = json.load(open("tables.json"))
diff = [k for k in new if json.dumps(old.get(k),sort_keys=True)!=json.dumps(new[k],sort_keys=True)]
print(sorted(diff))
EOF
```

→ prints exactly `['chase-complications', 'dungeon-loot-valuables', 'in-building-complications']`,
and for each, the only changed field is `"class": "Fork"` → `"Commitment"` (spot-assert
`new[k]["rows"] == old[k]["rows"]` for all three).

**11.4 Compile gate live:** temporarily append a gap row fingerprint-less error… no — do NOT
mutate real corpus files to test the gate. The gate's negative path is covered by fixture 16
(lint exit 1 on a new error) + fixture 17 (gate code present + REPORT mode unaffected); the
positive path by 11.3's clean `--emit`. Ruling: no real-corpus sabotage tests, ever.

**11.5 Zero-regression checks:** `python3 build/check-manifest.py` → OK (nothing registered
changes, but run it per discipline). `python3 dev/verify-table-lint.py` per 11.1.

## 12. PROVISIONAL flags for Adam (skim list)

- **P1 — the three `table_class` promotions (§7)**: label-follows-body per tonight's ruling;
  Dungeon Loot - Valuables is still craft-pass PROVISIONAL overall. Recommended default:
  accept all three.
- **P2 — seed `remembers:` assignments (§4)**: mechanical best-guesses at each table's state
  bucket; they gate nothing until `enforced`. Recommended default: accept, correct opportunistically
  during the craft pass.
- **P3 — required-role calibration (§2)**: `journey` requires `lens` but not `cost`; `situation`
  requires `pressure`+`ignored` but not `wants`. Calibrated so today's strong tables pass and
  the worklist targets real function gaps. Recommended default: accept; tightening later is a
  one-line `FAMILY_ROLES` edit + re-baseline of expected counts.

## 13. Executor sizing + queue notes

- **Size M** — one Python file extended (+~150 lines), one compiler gate block, one new JSON
  baseline, 41 mechanical frontmatter tags, 3 one-word promotions + 1 preamble clause, 8 new
  harness fixtures, 1 template-doc update, recompile. No JS, no manifest, no UI.
- **Dependencies:** none on other S-specs. **Sequencing note:** the spice re-band unit (if
  queued) edits the same 20 `stale-distribution` preambles later — run THIS unit first (it only
  reads them), and that unit's acceptance must expect the `stale-distribution` count to DROP
  from 20 as it scrubs.
- Branch: `feat/table-row-contract`; verify on branch; `git merge --no-ff`.

---

## Registry updates (Fable applies; this spec does NOT)

- `docs/DESIGN.md` — add decision row: **"2026-07-06 · Table Row Contract locked — five family
  schemas + `table_family`/`row_contract`/`remembers` frontmatter + family lint with baseline
  ratchet wired into `--emit`; Fork-vs-Volatile RULED let-the-hot-rows-live (labels promote,
  rows never narrate down). Spec: docs/TABLE-ROW-CONTRACT.md. Build deferred."**
- `docs/NEXT-STEPS.md` — queue entry under the deferred post-Fable builds: **"TABLE-ROW-CONTRACT
  build (size M, zero inference): lint checks 6–10 + baseline + compile gate + 41 seed tags + 3
  class promotions — spec locked 2026-07-06."**
- `docs/README.md` — index line under system specs: **"`TABLE-ROW-CONTRACT.md` — table family
  schemas + row test + family lint/baseline; spec-locked (2026-07-06), build deferred. Extends
  TABLE-EDIT-SAFETY.md."**
- `docs/TABLE-EDIT-SAFETY.md` — add one pointer line in §"The workflow" step 2: lint now also
  carries family/row-contract checks + the baseline ratchet per `TABLE-ROW-CONTRACT.md` (edit
  lands WITH the build, not now — noted here so Fable tracks the pairing).
- `docs/TABLE-REAUTHORING-PREP.md` — add pointer: the post-build `lint-tables.py --warn-only`
  family-missing output IS the per-table function-gap worklist for Adam's craft pass (§11.2
  table). No content superseded.
- No doc is superseded; `GPT-5.5-advice-for-Claude/README.md` §Table Row Contract + §Table
  Language Audit are now ADOPTED-AS-SPECCED via this file.
