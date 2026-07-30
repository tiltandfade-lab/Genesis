---
type: verification-record
project: Genesis
status: GATE W1 PASSED
created: 2026-07-29
updated: 2026-07-29
owner: Vignette Request Adapter and Demand Observatory
authority:
  - ../GOLDEN-SITE-WAVE-1-OBSERVATORY-BRIEF.md
  - ../GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md
artifacts:
  - golden-vignette-wave1-report.md
  - golden-vignette-wave1-report.json
  - golden-vignette-wave1-corpus.jsonl.gz
---

# Golden Vignette Wave 1 — Gate Verification

## Outcome

**Gate W1 passes.** Wave 1 adds a read-only `VignetteRequestV1` observatory, all
required entry-path adapters, a six-disposition classifier, proxy-only
`SemanticAssetDemandV1` accounting, deterministic audit seeding, and a replayable
natural plus stratified corpus. It does not synthesize terrain or structures and does
not change production walk content, tables, renderer, combat, or world state.

Implementation:

- `src/engine/vignette-observatory.js`
- `dev/golden-vignette-observatory.mjs`
- `dev/verify-vignette-observatory.mjs`
- `manifest.json` and `genesis.html` module registration

## Corpus evidence

`node dev/golden-vignette-observatory.mjs --emit` produced:

- **12,718 validated rows**: 12,000 natural-frequency requests plus 718 separate
  stratified cases;
- stable corpus fingerprint **`vgo1-edf8cc39`**;
- 4,000 urban, 4,000 dungeon, and 4,000 wilderness natural requests;
- wilderness split into 1,600 frontier, 1,200 travel, and 1,200 job requests;
- **2,212,402 / 2,212,402** natural source leaf facts retained with explicit
  treatments;
- **63,471** proxy-only semantic asset demands;
- all live urban/dungeon types, encounter branches, 303 wilderness feature rows,
  300 wilderness shape rows, ten biomes, four real fray tiers, eight entry paths,
  six dispositions, 26 current shared owners, five persistence sequences, explicit
  failure cases, and the retained Tavern/Guard selectors in stratified coverage.

The machine rows live in `golden-vignette-wave1-corpus.jsonl.gz`; the compact reports
are `golden-vignette-wave1-report.md` and
`golden-vignette-wave1-report.json`. Any retained case replays with:

```sh
node dev/golden-vignette-observatory.mjs --replay <caseId>
```

Natural dispositions:

| disposition | count | rate |
|---|---:|---:|
| `MATERIALIZE_NEW` | 8,049 | 67.0750% |
| `DECORATE_LOCAL` | 3,733 | 31.1083% |
| `UNRESOLVED` | 218 | 1.8167% |
| `NARRATIVE_ONLY` | 0 | 0% |

The 218 unresolved records are all the live combined dungeon type
`Prison / Asylum`. The adapter records `AMBIGUOUS_DISPOSITION` with a source example
instead of silently choosing `CustodyHost`, an institution, or a generic fantasy
building. This is demand evidence for a later source-table/metadata decision, not a
Wave-1 failure.

The natural corpus contains no narrative-only requests after classifier QA. Previously
counted rows were visible physical features—whispering stones, brimstone pillars,
cursed soil, silent zones, and visible illusions—whose descriptive sensory words
must not erase their spatial existence. Narrative-only remains covered by explicit
stratified cases and the bridge-rumor negative control.

## Classifier QA and founder-review surface

Before the gate closed, cohort review found and fixed false substring evidence:
`spinning` no longer matches `inn`, `wooden` no longer matches `den`, descriptive
`holding` no longer creates custody, `towering` no longer creates a fortification, and
`bioluminescent` no longer creates a mine. Classification now examines the named
wilderness feature rather than arbitrary words in its flavor. Harborfront directly
earns water-edge substrate, Underworks earns subterranean substrate, Low Ward records
operating/maintenance ownership, an unclaimed Natural Cavern does not invent an
ecological claimant, and natural terrain stays engine-first rather than defaulting to
Meshy.

The generated JSON and Markdown reports retain eight open founder-review packets with
exact counts, current behavior, alternatives, downstream decision boundaries, and a
starting recommendation:

1. `GS-W1-Q01` — combined Prison / Asylum;
2. `GS-W1-Q02` — evidence required to promote a cavern into a claimed lair;
3. `GS-W1-Q03` — physical ruin versus dormant/occupied operating state;
4. `GS-W1-Q04` — Civic, Temple, and Noble districts sharing one institution umbrella;
5. `GS-W1-Q05` — missing scale, active-window, and encounter-mode licenses;
6. `GS-W1-Q06` — when a wilderness feature becomes a full host;
7. `GS-W1-Q07` — observation demand versus actual materialization cadence; and
8. `GS-W1-Q08` — near-zero identity-face and causal-surface demand in the first role
   vocabulary.

These flags do not authorize automatic table changes. They are the agenda for
founder discussion before the affected Wave-2 compiler boundary commits an answer.

## Contract and negative-control evidence

`node dev/verify-vignette-observatory.mjs` passes **72 / 72** checks, including:

- audit-only random replacement restores `Math.random` after success and throw;
- same inputs replay identically while changed source truth changes identity;
- every raw source leaf is counted, treated, and preserved without source mutation;
- all eight adapters validate and retain wrapper provenance;
- all six dispositions and all required nested record shapes validate;
- balanced rock stays a local feature and bridge rumor stays narrative-only;
- infrastructure hub does not become a mine;
- an operating crypt does not become abandoned;
- layered control preserves its host;
- a missing host remains unresolved with a source example;
- renderer roles, camera bearing, and Golden ids cannot complete semantics;
- explicit source-required roles remain countable as truthful proxies; and
- retained Tavern and Guard selectors load with stable source hashes.

`node dev/golden-vignette-observatory.mjs --check` byte-compares regenerated reports
and compressed machine rows. Direct corpus inspection confirms all 12,718 rows parse,
all rows have passing validators, and all six dispositions occur in stratified
coverage.

## Production regression evidence

The retained production sentinels pass:

- walk core **2,802 / 2,802**; travel **28 / 28**; jobs **41 / 41**; consumption
  **37 / 37**; binding **100 / 100**; card projection **29 / 29**; stamped provenance
  **34 / 34**; scene **32 / 32**; retained census partition **1,050 / 1,050**;
- combat core **63 / 63**; actions **38 / 38**; cells **13 / 13**; lifecycle
  **69 / 69**; tracker **31 / 31**; exact-room combat promotion **65 / 65**;
- capture **21 / 21**; seam **29 / 29**; DM events **70 / 70**; storage **49 / 49**;
  migrations **18 / 18**; durability **50 / 50**;
- terrain features **61 / 61**; terrain expression **80 / 80**; expression R2
  **53 / 53**; terrain bench **77 / 77**; Stage-C terrain **60 / 60**; Clayroom
  **272 / 272**; and
- manifest ownership/load order reports `RESULT: OK`.

The battle sentinel includes a PC plus wolf, skeleton, and rat and preserves exact
room identity. The durability sentinel includes export → wipe → import deep equality,
migration, and travel-walk persistence.

A disposable game-flow sentinel with seed `20260729` created Human Fighter Mira,
arrived at `The Iron-Strap Bridge`, retained the player's study-before-committing
decision, produced an 8,453-byte narration-only digest, left for
`Wave One Lookout`, returned to the same bridge, and passed all seven identity,
transcript, time, and return checks.

The Wave-1 change set has no diff in:

```text
src/engine/walk.js
src/engine/dungeon-walk.js
src/engine/wild-walk.js
src/world/play.js
src/world/job-walks.js
src/world/capture.js
tables.js
```

## Inherited warnings and debt

- Current walk checks still print their known null-safe missing-table diagnostics.
- Combat checks still report the inherited `crit_outcome` payload-drift warnings and
  historical old-light fixture skip; live assertions pass.
- `dev/gauntlet-6-persistence.mjs` was not part of the retained Wave-0 baseline and is
  independently stale: its scratch environment lacks `fake-indexeddb`, and its old
  round-trip allowlist rejects the current additive `sheet.hitDice` migration.
  Wave 1 does not touch migrations or state. The current retained storage, migration,
  durability, and exact game-flow gates above are green; the older gauntlet remains
  explicit harness debt rather than being reported as a Wave-1 pass.

## Gate disposition and Wave 2 handoff

All ten Gate-W1 conditions are satisfied. Wave 2 may consume the validated read-only
request surface, demand-weighted owner/role ledgers, replayable Tavern and Guard
fixtures, and unresolved-demand list. The next authorized product cut is the bounded
proxy-first candidate/score/repair compiler for the Tavern identity microfixture and
Guard Post shoulder-overlook visual/tactical fixture.
