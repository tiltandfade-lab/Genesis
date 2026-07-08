---
type: runbook
project: Genesis
status: working-procedure
consumer: Adam + his craft-session Claude (assists; never bulk-rewrites without row-by-row involvement)
created: 2026-07-07
related:
  - "[[TABLE-ROW-CONTRACT]]"
  - "[[SPICE-RAISE]]"
  - "[[TABLE-REAUTHORING-PREP]]"
  - "[[CORPUS-INTENSITY-MAP]]"
  - "GPT-5.5-advice-for-Claude/ROW-ANATOMIES.md"
  - "GPT-5.5-advice-for-Claude/ROUND-2-CLAUDE-TABLE-CONTRACT-ADVICE.md"
---

# CRAFT-PASS-RUNBOOK — how Adam works the table re-authoring pass

The re-authoring pass is a **hands-on, whole-corpus pass: every runtime row up-to-par, plus an
EXPLOSIVE high-band tail wherever the class permits** (feedback-genesis-reauthoring-definition).
This is the working procedure — one table at a time, in a parallel branch, gated by the lint.
Keep `ROW-ANATOMIES.md` open on the second monitor; it is the voice reference the whole time.

The lint is the *measuring instrument and the worklist* — it never writes the row and never
judges prose. The craft is Adam's; a craft-session Claude assists row-by-row.

---

## 1. The session loop (7 steps per table)

**Step 1 — Pick a table from the worklist.**
```
python3 build/lint-tables.py --warn-only
```
Read the summary line first: `errors: N (new: N, baselined: N) | warnings: N`. The queue is the
two WARN families:
- **`family-missing`** (58 findings across 27 tagged files) — a runtime table opted into a family
  but is missing a required column-role (`band`, `pressure`, `ignored`, etc.). Each line is
  `file:line (id) [family-missing] family 'X' missing required role 'Y'`. **This is the ordered
  function-gap punch list.** One table = its cluster of `family-missing` lines (e.g. NPC Hook = 3:
  band + pressure + ignored).
- **`stale-distribution`** (20 files) — a preamble still re-teaches the pre-2026-07-06
  66/20/9/4/1 worldview. Reword during the craft edit; do NOT re-author rows for the old play
  frequency (§3).

Ignore the `dup-row` noise on Race/Influence tables (die-collapse, not craft) and the 3 baselined
In-Building band-dips (Adam's taste call, deliberately un-fixed).

**Step 2 — CLASSIFY BEFORE WRITING.** The classification question comes first, always. Ask
TABLE-ROW-CONTRACT §2 / ROUND-2 workflow Q1: *does this table create direct play content the DM
or player experiences?*
- **Yes** → it's a runtime family: `situation | item | place | journey | rumor`. Proceed.
- **No** → it's exempt (lens / pointer / result / grammar / contract). **Do not tag it, do not
  invent columns to make the linter happy.** Validate the system it feeds instead. (Walk Skin,
  Plot Item/Lock are the standing exempt examples — never touch their family status.)

**Step 3 — Author against the family anatomy**, with ROW-ANATOMIES open. Run every row through
the six-question row test — a runtime row must answer **at least two**:
> 1. What is visible now?  2. What can the player do?  3. What does it cost or threaten?
> 4. What can be gained?  5. What persists if ignored, used, broken, stolen, or survived?
> 6. Which state bucket remembers it?

Match the family schema (authoring shape; lint matches by role synonym, so strong existing tables
don't need renames):
- `situation`: `Band | Seen Now | Wants | Pressure/Clock | Leverage/Payoff | If Ignored`
- `item`: `Band | Object | Frame | Use/Ranks | Tell | DM Ripple`
- `place`: `Band | Place | What Is Happening Now | Local Pressure | Player Handle | If Ignored`
- `journey`: `Band | Beat | Immediate Check/Cost | Environmental Lens | Persistent Trace`
- `rumor`: `Band | Claim | Concrete Evidence | Who Benefits | What Happens Tonight`

Confirm `remembers:` in the frontmatter names a **real** bucket the row actually touches
(`codex | ledger | clock | faction | item | map | walk | none`) — not an aspirational one.

**Step 4 — Recompile.**
```
python3 "Engine/00. _System/compile-tables.py" --emit
```
The lint gate runs **inside** the compiler on `--emit` and REFUSES to write on any *new* hard
error. The **baseline ratchet**: pre-existing debt in `build/lint-baseline.json` (the 3 band-dips)
never blocks; any hard error *you introduce* aborts the compile with nothing written. Under
`row_contract: draft` a missing role is only a WARN — it will not block. It becomes a blocking
hard ERROR only once you flip that table to `enforced` (§4, last step per table). Commit source +
`tables.json` + `tables.js` together (they're regenerated, never hand-edited).

**Step 5 — Verify.** The harness that reads table *content/structure* is
`python3 dev/verify-table-lint.py` (the lint regression net — run it after any lint-facing edit).
The compiled artifact is exercised by the headless jsdom flow (loads real `genesis.html`, drives
the Oracle/generators off `tables.js`) and the Oracle tab in-browser. For a pure content edit,
`recompile-clean + verify-table-lint green` is the gate; `check-manifest.py` isn't required
(no module changed) but is harmless.

**Step 6 — Flip the ratchet (only when the table is actually done).** Change
`row_contract: draft` → `enforced` on that one table, recompile once more to confirm it passes its
own gate. **Never batch-flip.** `enforced` is the per-table graduation stamp.

**Step 7 — Commit** (see §2).

---

## 2. Git discipline for a PARALLEL craft session

- **One table (or one tight cluster — e.g. the seven NPC-* situation tables) per branch:**
  `feat/craft-<table-slug>`.
- Work in the session's **own worktree** (never in Adam's live checkout — an integration wave may
  be landing there).
- **Commit + push the BRANCH.** A pushed branch is a complete, safe stopping point. Do **not**
  merge to master while an integration wave is mid-flight — the orchestrator's `--no-ff` landings
  serialize; land only when the line is clear (or hand the branch to the orchestrator).
- **Content only.** A craft session NEVER edits `src/`, `dev/`, `build/`, `manifest.json`, or
  `genesis.html`. If a table edit seems to need a code change, stop and raise it — that's a
  separate unit, not craft.

---

## 3. Band honesty under the spicy world

The **band-first roll layer** (SPICE-RAISE) picks the band from the region tier's weights, *then*
a row within it. So **row FREQUENCY is no longer the row's job** — layout share only controls
within-band variety. Each row's only obligation is to be **honestly its band**:

| Band | Meaning |
|---|---|
| Grounded | Mundane, concrete, human pressure. Never filler. |
| Textured | The world tilts; something is off but nameable. |
| Strange | Uncanny and consequential; reality tilts. |
| Volatile | Local reality strains; consequences escalate. |
| Mythic | Reality breaks or becomes world-marking; ledger-worthy. |

- **Grounded is not filler** — scarcity, law, debt, weather, injury, jealousy, witnesses,
  deadlines, custody, bargains, blocked routes, material stakes. A Grounded row that produces no
  play failed its band.
- **High bands = reframe / clock / cost / concrete cosmic image / state change the world
  remembers — NEVER just louder adjectives.** "Ancient sword, mysterious power" is not Mythic; it
  is beige with a costume.
- Where the class permits Mythic, seed the **EXPLOSIVE tail** — use the Hungering-Stone
  effect-pool standard (player rolls the effect from a captured pool) where a Mythic result needs
  a mechanical body, not just a sentence.
- Keep every band *represented* (the old 66/20/9/4/1 survives only as an authoring-coverage
  floor), but never re-author a row to hit an old play-frequency target, and scrub any preamble
  that still teaches the conservative distribution (that's the `stale-distribution` line).

---

## 4. The don't-list

- **Anti-over-ratchet (verbatim, CLAUDE.md):** *"Validators preserve the thing's job — never
  satisfy one mechanically. Once a gate exists (table lint, check-manifest, the drift guard,
  state-hygiene, rubric checks), the temptation is to make the artifact pass rather than keep it
  true: don't tag an exempt table with a row family, rename a column to appease a role matcher, or
  inflate a budget to green a scorecard. An untagged/exempt/red state that tells the truth beats a
  green that lies. If a validator and the thing's real job conflict, fix or scope the validator."*
  Renaming a column to appease the role matcher is **fake compliance** — do not do it.
- **Never hand-edit `tables.json` / `tables.js`** — regenerate via the compile command only.
- **`row_contract: draft` stays until the table has actually been crafted.** Flipping to
  `enforced` is the LAST step *per table* (§1 step 6) — never a batch flip across the worklist.
- **Adam's hand-authored tables + monster custom d10 tables are his.** This runbook IS the
  hands-on pass — a craft-session Claude assists and drafts row candidates, but never bulk-rewrites
  a table without Adam's row-by-row involvement. Propose + archive before any destructive edit.
- **Do not force an exempt table into a family** to "finish the migration." Lens / pointer /
  result / grammar / contract tables stay exempt until their own mini-family earns its lint
  (TABLE-ROW-CONTRACT Appendix). `lens` (walk skins) is first in line — but only when Adam's pass
  reaches it, not before.

---

## 5. End-of-table review checklist

Before flipping to `enforced`, ask (adapted from ROUND-2's practical checklist):
- [ ] Did the row keep its **original job** (the table still does what the generator calls it for)?
- [ ] Was the family chosen because the table **fits**, not to appease the linter?
- [ ] Does `remembers:` name a **real** state bucket the rows actually touch?
- [ ] Does **Grounded still produce play**, or did it slide into filler?
- [ ] Do the **high bands create real consequence** (reframe/clock/cost/state change), not louder
      adjectives?
- [ ] Any exempt sibling left honestly **exempt**, not force-tagged?
- [ ] No word-ban / prose-vibe scoring crept in; the change is structural + craft, not appeasement.

---

## 6. Starter queue — the first five tables

The **NPC Hook cluster is the flagship weak set** (corpus analysis: NPC atoms feed the Fragment
oracle — the 6–10 word line the player actually sees — and drag the world to beige). All are
`situation`-family, each missing the same three roles (`band`, `pressure`, `ignored`), verified
against the current `--warn-only` output. Do them as one branch (`feat/craft-npc-situation`),
top-down:

| # | Table | family | `family-missing` findings |
|---|---|---|---|
| 1 | `NPC Hook` | situation | 3 (band, pressure, ignored) |
| 2 | `NPC Want` | situation | 3 (band, pressure, ignored) |
| 3 | `NPC Leverage` | situation | 3 (band, pressure, ignored) |
| 4 | `NPC If Ignored` | situation | 3 (band, pressure, ignored) |
| 5 | `NPC Hook Complication` | situation | 3 (band, pressure, ignored) |

Why these five first: highest-leverage (they compose into every generated NPC), a single coherent
family so the anatomy is fresh across all five, and they set the situation-family voice model the
rest of the social corpus follows. `NPC Useful Knowledge` and `NPC Bonus Secret` (also 3 each)
are the natural next two on the same branch.

**Kin-tension thread (2026-07-08):** when crafting the remaining NPC-* tables, pull from
`docs/CRAFT-SHELF.md` — Adam-ruled kin-tension candidates (Elder-Scrolls-style racial pressure,
kin-agnostic by convention) waiting for slots; NPC Hook Complication is the natural first home.
