---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
created: 2026-07-06
related:
  - "[[DM-SEAT]]"
  - "[[EVENT-CONTRACT]]"
  - "[[DIGEST-DIET]]"
  - "[[AUTOMATED-PLAYTEST]]"
  - "[[BATCH3-GUARDRAILS]]"
---

# STATE-HYGIENE-EVAL — the provider bake-off harness, scored on state hygiene

**One sentence:** replay golden turn fixtures through the REAL engine (the bridgeless jsdom
seam) against a candidate DM provider — or against recorded responses with zero model calls —
and score not the prose but the *bookkeeping*: did the events land, did the values MOVE, did
the clock tick, did the codex remember, were the dice honored, was the danger fair.

**Why (GPT §6 + §Outside-The-Seat 3, adopted):** when comparing Claude bridge vs DeepSeek vs
GLM vs any future seat, prose quality is the wrong first axis. The durable contract is
TurnRequest/TurnResponse + typed `events[]` + deterministic mutation. This harness gives Adam
a way to say *"that model felt vivid but leaked state"* with numbers. It is the candidacy gate
for the DM-SEAT GLM bake-off (`docs/DM-SEAT.md` §4) and the anti-blinders instrument for every
seat after it.

**Precedent that BINDS this spec (BATCH3-GUARDRAILS J2, dm-eval):** deterministic checks and
model-graded rubric checks are CLEARLY separated, and **the deterministic half is never
blocked, gated, or averaged-in by rubric grading**. `dev/dm-eval/score.mjs` is the voice/
charter scorer and stays untouched; this harness COMPOSES with it (imports its exported
`scoreFixture`) and owns the state-hygiene half.

**Inference cost declaration (SPEED doctrine):** `--provider recorded`, `--selftest`,
`--write-budgets`, and `dev/verify-state-eval.mjs` make **zero model calls** — CI-safe, $0.
`--provider seat` is dev-only, never CI: ~12 turns/provider ≈ **≤ $0.30/run on GLM-5.2,
≤ $0.70/run on Sonnet-class** (measured envelope: ~15k tok in incl. system prompt, ~400 tok
out, per turn). Budget ceiling per bake-off run: **$1.00**. The optional `--rubric` pass emits
a judge-request file; the judge call is the orchestrator's spend, logged separately.

---

## §0 Verified surface (all refs checked 2026-07-06)

| thing | where | verified fact |
|---|---|---|
| Bridgeless harness | `dev/playtest-bridgeless.mjs` | subcommands `init/digest/apply/roll/playerview/dmstate/patch/advance`; state persists as `{U, gs:{dm,combat,chase}}` in `<dir>/state.json` (`save()`, :89–96); `cmdDigest` prints `{turnId, lane, digestBytes, digest}` (:211–212); `cmdApply` prints `appliedEvents` as **types only** (:231) — per-event results live in the dm-line meta `applied` that `applyResponse` pushes (`src/world/dm.js:489`) |
| Event vocabulary | `src/world/dm.js:1218` | `DM_EVENT_TYPES` (87 types; **no `advance_clock`, no `move_node` yet** — see §6 deps) |
| Sources enum | `src/world/dm.js:1226` | `DM_EVENT_SOURCES = ["detected","declared","player","branch"]`, hard allow-list |
| Payload fold | `src/world/dm.js:1237` (`DM_EVENT_FIELDS`) + `dmFoldPayload` :1325 | aliases folded once; unknown keys warn + one `drift` ledger line, event still applies |
| Envelope validation | `validateEvent` `src/world/dm.js:1348`; `validateTurnResponse` :1361 | structural fail ⇒ event skipped; unknown-but-well-formed type ⇒ `ok:true, unknownType:true` |
| Apply results | `applyEvent` returns `{ok, reason?/untracked?…}`; `applyResponse` (`src/world/dm.js:457`) maps `applied=[{type,res}]` :475 and rides it on the dm log line :489 |
| Digest sections | `dmDigest` `src/world/dm.js:270–374` | top-level keys: `worldId worldName clock location setting pc powers fronts recentLedger gazetteer codex codexRoster minted revealed sessionLean tarot activeWalk combat prepPending levelUp arrivalBrief` (`setting`/`pc.life` founding-turn-only) |
| Byte measure | `jsonBytes` `src/world/dm.js:1389` | compact `JSON.stringify(...).length` — the runner mirrors it with `Buffer.byteLength(JSON.stringify(v))` |
| Telemetry row | `logDmTurn` call in `applyResponse` (`src/world/dm.js:480–485`) → bridge appends verbatim to `.dm/telemetry.jsonl` (`dev/dm-bridge.py:244–251`) | row: `{turnId, worldId, t, session, lane, laneModel, latencyMs, digestBytes, turnBytes, responseBytes, narrationChars, eventCount, eventTypes, mintCount, cost, ok}` |
| Seat proxy | `dev/dm-bridge.py:257` `_do_seat` (:267–) | BUILT: POST `/seat` on `http://127.0.0.1:5175` (env `GENESIS_PORT`), pops `turnId`/`lane`, key-injects, relays SSE, appends `.dm/seat-costs.jsonl` |
| Voice scorer | `dev/dm-eval/score.mjs` | exports `loadFixtures`, `scoreFixture`, `VOICE_ONLY_DIMENSIONS`; dims incl. `narratesFromRolls`, `neverRollsPlayerDice` — **imported read-only here** |
| Mutation-probe idiom | `dev/playtest-bug-probes.mjs:74–81` `applyMutates` | pass = ok-flag AND before≠after — the BUG-01 lesson, reused as this harness's core assertion style |
| Real session states | `dev/playtest-saves/sella-shimmering-maw/` (`state.json`, `state-run2-day2-t6/t9/t10.json`…), `dev/playtest-saves/rennick-fool/` | bridgeless-shape snapshots (`{U,gs}`) with full `dmlog` (role/text/events/rolls per line) — the fixture quarry |
| Digest size law | `docs/DIGEST-DIET.md` §7 (Verification), item 5 "Size regression guard" (:130–131) | the standing regression assertion: a **stress fixture** of 50 codex records + an active walk → digest < 12 KB (this harness re-uses that 12 KB ceiling as its steady-state total budget; see D9) |

---

## §1 Deliverables (exact files)

New directory `dev/state-eval/` (dev instrument — **NOT in `manifest.json`**; dev/ files are
outside `loadOrder`; `check-manifest.py` must still pass unchanged):

```
dev/state-eval/run.mjs              the replay runner + scorer (the harness core)
dev/state-eval/fixture-seed.mjs     shared synthetic seed-world builder (exported seedWorld())
dev/state-eval/mint-fixture.mjs     fixture minting tool (from real saves / live dirs)
dev/state-eval/budgets.json         committed section-level digest byte budgets (generated once via --write-budgets)
dev/state-eval/fixtures/hx-01 … hx-12 .json   12 golden fixtures (§4)
dev/state-eval/fixtures/nc-13 … nc-16 .json   4 negative controls (§5)
dev/state-eval/baseline-recorded.json          committed recorded-mode baseline (via --write, dm-eval precedent: no timestamp field persisted)
dev/verify-state-eval.mjs           the verify harness (CI-runnable, $0)
```

Edited files (exactly two, worked diffs in §8):

1. `dev/playtest-bridgeless.mjs` — add `--seed` (deterministic RNG) + `appliedResults` in
   `cmdApply` output.
2. `.gitignore` — add line `dev/state-eval/out/` (scorecard artifacts are per-run outputs;
   baselines/budgets are the committed truth).

### Don't-touch list (hard)

- **Generated — spec generator edits, never hand-edits:** `tables.json`, `tables.js`,
  `data/bestiary.js`, `data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js`.
- `dev/dm-eval/**` — imported read-only (voice scorer stays exactly as merged).
- `src/world/dm.js` and every app module — **this unit touches zero app code.** If a dim
  can't be scored without an engine change, that's a FINDING to file, not an edit to make.
- `docs/DM-BRIDGE.md` — never edited by this unit (and never mid-live-session).
- `.dm/` — never write/reset while a live session may be running (the verify-bridge gotcha).
- `manifest.json` — no changes (nothing here is a module).
- `dev/playtest-bug-probes.mjs` — pattern source only; copy the idiom, don't edit the file.

---

## §2 The runner — `dev/state-eval/run.mjs`

### CLI (complete — these 11 flags, no others exist)

```
node dev/state-eval/run.mjs [--provider recorded|seat] [--fixtures <glob-dir>] [--only hx-03]
                            [--base http://127.0.0.1:5175] [--model glm-5.2] [--system docs/SEAT-PROMPT.md]
                            [--selftest] [--write] [--write-budgets] [--rubric]
                            [--merge-rubric <answers.json>] [--json]
```

- `--provider recorded` (DEFAULT): score each fixture's embedded `response`. Zero model calls.
- `--provider seat`: per fixture, POST the assembled OpenAI-compatible body to `<base>/seat`
  (shape: `{turnId, lane, model, stream:true, messages:[{role:"system",content:<system file text>},
  {role:"user",content: JSON.stringify({digest, action, rolls})}]}` — `turnId`/`lane` are popped
  by the bridge, `dev/dm-bridge.py:277–278`). Read the SSE stream, concatenate delta text,
  extract the FIRST balanced `{…}` JSON block (tolerate fences/prose — same rule as DM-SEAT §3.1).
  Parse fail ⇒ ONE corrective retry appending the user message
  `"Reply with ONLY the TurnResponse JSON."`; second fail ⇒ the fixture scores
  `parse:{ok:false,retries:1}` and every deterministic dim = `fail("parse-fail")`.
  Requires the bridge running with `SEAT_BASE_URL`/`SEAT_API_KEY`; if `/seat` returns 503 the
  runner exits 3 with `seat not configured` (never a stack trace).
- `--selftest`: run ONLY `nc-*` fixtures and assert every negative control is CAUGHT (its
  designated dim reports `fail`). Exit 0 iff 4/4 caught.
- `--write`: refresh `baseline-recorded.json` from a recorded-mode run (strip `generatedAt`,
  dm-eval precedent, `dev/dm-eval/score.mjs:215–219`).
- `--write-budgets`: (re)generate `budgets.json` per §3-D9. Intentional, reviewed act — never
  run implicitly.
- `--rubric`: additionally write `out/rubric-request-<stamp>.json` (§3 M-dims). No model call
  from this process, ever.
- `--merge-rubric <answers.json>`: takes ONE required positional path (the judge's answers file,
  the twin of a prior `--rubric` request). Folds the M-dim scores into the target scorecard under
  a top-level `rubric:{}` key and exits — it does NOT re-score any deterministic dim. Arg-parsing:
  the token immediately following `--merge-rubric` is the answers path; missing/unreadable ⇒ exit
  2 with `"--merge-rubric requires a readable answers.json"`. Merge target = the newest
  `out/scorecard-*-<stamp>.json` unless `--only`/`--fixtures` narrow it; the merge MUST NOT write
  into `fixtures[].dims` or `summary.deterministic*` (R6 enforces this). No model call. Mutually
  exclusive with `--provider seat` (merging is a post-run fold, not a run) — passing both ⇒ exit 2.
- `--json`: machine output only (the scorecard JSON to stdout).

### Per-fixture flow (both providers)

1. `mkdtemp` under the scratchpad → write `fixture.state` verbatim as `state.json`
   (bridgeless shape `{U, gs}`).
2. **Digest:** `node dev/playtest-bridgeless.mjs digest --dir D --seed <fixture.seed>
   --action <fixture.turn.action> [--rolls <json>]` → capture `{turnId, lane, digestBytes, digest}`.
   Measure §3-D9 section bytes off `digest` here.
3. **Response:** recorded → `fixture.response`; seat → the `/seat` call above (the digest from
   step 2 rides the user message — the provider sees exactly what the real seat would see).
4. **Before-snapshot:** read `D/state.json` (post-digest — the player line is logged, nothing
   else mutated).
5. **Apply:** `node dev/playtest-bridgeless.mjs apply --dir D --seed <fixture.seed>
   --response @<tmpfile>` → capture `{ok, contractErrors, appliedEvents, appliedResults,
   rollRequest, pc, location, clock, ledgerTail}`.
6. **After-snapshot:** read `D/state.json` again. All dim predicates (§3) run over
   `{before, after, digest, response, applyOut}`.
7. Delete the temp dir.

Determinism: the `--seed` flag (§8.1) makes every RNG draw inside `boot()` reproducible
(mulberry32 over `win.Math.random`), so a fixture's recorded-mode score is byte-stable
run-over-run. `fixture.seed` is a required integer field; default in `mint-fixture` = 1.

### State-diff helpers (exact semantics)

`pathGet(state, path)` resolves dotted paths against the AFTER (or BEFORE) snapshot with these
roots (complete set): `pc.` → the last `status:"living"` character's `sheet` (plus `pc.status`,
`pc.name` off the character); `clock.` → `w.clock`; `world.` → `w` (e.g. `world.currentNodeId`);
`codex:<id>.` → `codexOf(w).records[<id>]` equivalent — since the runner reads raw JSON:
`w.codex.records[<id>]`; `faction:<name>.` → the faction object matched by `name`;
`gs.` → the snapshot's top-level `gs` object (the bridgeless shape is `{U, gs}`; e.g.
`gs.combat` resolves to the whole combat object, which is JSON `null` after `combat_end` — this
is the root hx-04 uses, §4); `ledger` → `w.ledger`. A `gs.`-rooted path that hits a `null` key
returns `null` (so `{op:"equals", value:null}` holds), never throws. Ops (complete enum):
`equals`, `movedFrom` (any change),
`increasedBy`, `decreasedBy`, `containsText` (substring over `JSON.stringify(value)`),
`lengthGrewBy`. Every op reports `{before, after}` in the scorecard — **the assertion is
always that the VALUE MOVED, never that a label was present** (BUG-01 law).

---

## §3 The scorecard dimensions

### Deterministic dims (D1–D9) — these are the gate; rubric NEVER touches them

**D1 `required-events-landed`** — for each entry in `expect.requiredEvents`
(`{type, assert:{path,op,value}}`): the response carried an event of `type` **AND**
`appliedResults` for it has `res.ok===true` without `untracked` **AND** the assert's value
moved as declared between before/after snapshots. Event present but value stationary ⇒
`fail("label-without-mutation — BUG-01 class")`. Event absent ⇒ `fail("required event missing")`.

**D2 `no-impossible-events`** — over ALL response events:
- `contractErrors` from `validateTurnResponse` must be `[]` (structural).
- every `appliedResults[i].res.ok !== false` — any engine refusal (`invalid-envelope`,
  `no-record:*`, `id-collision`, `no-pc`, …) ⇒ fail with the reason verbatim. Ruling: an
  `id-collision` refusal IS a hygiene failure (the provider hallucinated a duplicate mint)
  even though the engine defended correctly.
- every `res.untracked !== true` — an event that landed nowhere is an impossible event that
  merely failed politely.
- `expect.forbiddenEvents` (type list): none present, AND their would-be state slices did not
  move (e.g. a forbidden `xp_granted` also asserts `pc.xp` stationary — it's a no-op event,
  `docs/TIER-SCOPE.md`, but the *attempt* is the hygiene finding).
- **Unknown types do NOT fail D2** (forward-compatible contract, `validateEvent` law) but are
  counted; run-level `summary.vocabDrift = true` when unknown-type count / fixture count > 1.

**D3 `clock-fidelity`** — skipped when `expect.clock` absent OR the response carries a
`rollRequest` (mid-beat: fiction hasn't resolved; same rule as `applyResponse`'s
`sceneDelivered`, `src/world/dm.js:497`). Otherwise: `Δ = (after.day*1440+after.min) −
(before.day*1440+before.min)` must satisfy `minMinutes ≤ Δ ≤ maxMinutes`.
**Contract dependency:** where `expect.clock.requiresAdvanceClock:true` and
`DM_EVENT_TYPES` (read at runtime from the booted window via a `dmstate`-style probe — the
runner greps the `digest` step's window? No: the runner reads `src/world/dm.js` text for
`"advance_clock"` membership in the `DM_EVENT_TYPES` literal, a one-line `includes` check)
does not yet contain `advance_clock`, the dim reports `pending-contract` — excluded from the
pass/fail denominator, counted in `summary.pendingContract`. The DETECTED-FIRST HYBRID ruling
(2026-07-06) means mechanical ticks score immediately once the clock hotfix lands; hand-wave
fixtures un-pend themselves the day `advance_clock` enters the vocabulary. No spec edit needed
here on that day — the fixtures are already written for it.

**D4 `location-fidelity`** — skipped when `expect.location` absent or response has a
`rollRequest`. Assert `after` current node's `name === expect.location.endNodeName`
(node looked up via `w.map.nodes[w.currentNodeId]`). Plus the **teleport guard** (always on,
every fixture): if `world.currentNodeId` changed between snapshots but `appliedResults`
contains no event of a movement-capable type (today: none can move the PC — BUG-05; future:
`move_node`/`travel_arrive`), ⇒ `fail("teleport — location moved with no movement event")`.

**D5 `codex-persistence`** — each `expect.codex` entry (`{id, path, op, value}`) evaluated
over `w.codex.records[id]`. This is BUG-06c/11/12's dimension: notes append, gifts remember,
established records survive re-mints untouched.

**D6 `rolls-honored`** — active when `fixture.turn.rolls` is non-empty:
- the response's `rollRequest`, if any, must not re-ask a skill named in
  `expect.rolls.reAskForbidden` (the carried roll was already answered).
- ONE adapter call into the voice scorer builds the whole D6 voice half. **The call MUST pass
  `resolvedBranch` through** — `detectHonorsBindingMechanics` reads `fx.resolvedBranch` and
  early-returns `{clean:true, skipped:true}` when it is absent (`dev/dm-eval/score.mjs:132`), so
  a call that omits it makes the branch check a silent no-op. Author it exactly:
  `scoreFixture({id: fixture.id, kind: fixture.kind, turn:{rolls: fixture.turn.rolls},
  response:{narration: response.narration}, resolvedBranch: fixture.resolvedBranch})`
  (import `scoreFixture` from `dev/dm-eval/score.mjs`). From the returned `results`:
  - `results.narratesFromRolls.clean` and `results.neverRollsPlayerDice.clean` must both be
    `true` (always evaluated — these don't depend on `resolvedBranch`).
  - `results.honorsBindingMechanics`: when `fixture.resolvedBranch` is a non-null object, its
    `.clean` must be `true` (narration `.trim()` === `resolvedBranch.branchText.trim()`,
    `score.mjs:133`); when `fixture.resolvedBranch` is `null` the detector returns
    `{clean:true, skipped:true}` and D6 records the branch sub-check as `skip`, not a pass.
  (Margin law context: degrees of failure are MARGIN-based with a tight −1..−2 near-miss band —
  fixtures hx-02's roll totals are chosen so the deterministic contradiction check is
  unambiguous.)

**D7 `danger-telegraphed`** — active only on fixtures with `expect.telegraph.lethal:true`.
Deterministic predicate: `expect.telegraph.evidenceRegex` (authored per fixture) must match
the concatenation of (a) every `role:"dm"` line text in `before.U.…dmlog` and (b)
`JSON.stringify(digest)` (fronts/arrivalBrief/activeWalk carry the engine's telegraphs).
Fail message: `"lethal commitment without a prior telegraph — CAL-1 requires the warning
BEFORE the save, not narration after it"`. When the Scene Risk Contract build lands
(approved 2026-07-06; sibling spec), fixtures gain `expect.telegraph.sceneRisk:true` asserting
a non-null `telegraph` field in the digest's risk block — additive, no runner change (it's a
`containsText` op on the digest).

**D8 `owner-persistence`** — each `expect.owner` entry, same op grammar as D5 but rooted at
`pc.` / `codex:<id>.`: gold/xp/inventory land on the LIVING PC (`pc.gold increasedBy 25`,
`pc.inventory lengthGrewBy 1`), gift memory lands on the named NPC
(`codex:<id>.gifts lengthGrewBy 1`). A reward that exists only in narration ⇒ fail
(`"vanished reward — narrated but not persisted to any owner"`).

**D9 `digest-byte-budget`** — provider-independent engine regression, measured at step 2 on
every fixture, reported once per run under `summary.budget`:
- per-section: `Buffer.byteLength(JSON.stringify(section))` for each top-level `dmDigest` key
  (§0 list; `null` sections count 4 bytes) must be ≤ `budgets.json.sections[key]`.
- totals: founding-class fixtures (`kind:"founding"`) ≤ `budgets.json.totalFounding` (32768);
  all others ≤ `budgets.json.totalSteady` (**12288 — the 12 KB ceiling from the DIGEST-DIET §7
  Verification list item 5 "Size regression guard" (a 50-record + active-walk stress fixture, not
  a steady-state measurement), re-used here as this harness's steady-total budget; not tunable
  here — if a golden's total exceeds it, that is a red finding to file against the digest, never
  a budget to inflate**).
- `--write-budgets` generation rule (run once at build, commit the file): for each section,
  ceiling = `roundUpTo128(max-observed-across-the-12-goldens × 1.25)`; totals as above.
  ⚠ PROVISIONAL (taste): the 1.25 headroom factor — recommended default 1.25; Adam may retune;
  everything else in D9 is law.

### Model-graded dims (M1–M2) — separated, optional, NEVER gate

`--rubric` writes `out/rubric-request-<stamp>.json`: per fixture
`{id, narration, digestExcerpt:{location, arrivalBrief, activeWalk, fronts}, questions:[M1,M2]}`.
- **M1 `location-prose-match`** — "does the narration place the player where the state says
  they are?" (the prose half of D4).
- **M2 `telegraph-prose`** — "was the danger *fairly readable in the fiction* before
  commitment?" (the prose half of D7).
Voice/charter quality is explicitly NOT scored here — that is `dev/dm-eval`'s jurisdiction
(its `VOICE_ONLY_DIMENSIONS` note is the model). The orchestrator runs the judge (frontier),
then `run.mjs --merge-rubric <answers.json>` folds scores into the artifact under a top-level
`rubric:{}` key. `summary.deterministicPass/Fail` are computed before the merge and the merge
function MUST NOT write into `fixtures[].dims` or `summary.deterministic*` (regression check
R6 enforces this).

---

## §4 The 12 golden fixtures (enumerated — the executor authors these, no design latitude)

Fixture JSON shape (complete):

```json
{
  "id": "hx-03-combat-hit",
  "kind": "combat",                    // founding|check|combat|travel|rest|social|codex|clock|loot|lethal|lull
  "seed": 3,                           // RNG seed for --seed (fixture number)
  "source": {                          // provenance — REAL rows first, always cited
    "session": "sella-shimmering-maw",
    "stateFile": "dev/playtest-saves/sella-shimmering-maw/state-run2-day2-t6.json",
    "dmlogIndex": 41,                  // the real turn this action/response was lifted from
    "telemetryTurnId": "t-…|null",     // matching .dm/telemetry.jsonl row when one exists
    "kind": "real|synthetic"           // synthetic allowed ONLY via the §4 fallback rule
  },
  "state": { "U": {…}, "gs": {…} },    // embedded bridgeless snapshot (self-contained fixture)
  "turn": { "action": "…verbatim player line…", "rolls": [] },
  "response": { "narration": "…", "events": [...], "rollRequest": null, "ask": null, "gen": null },
  "resolvedBranch": null,
  "expect": { … §3 grammar … }
}
```

**Sourcing procedure (deterministic):** for each fixture below, search the named source
file's `dmlog` for the FIRST dm-line matching the stated predicate; `state` = the snapshot
file named (or, where the predicate row sits mid-file, the nearest earlier committed snapshot);
`turn.action` = the player line immediately preceding it, verbatim (verbatim-player-dialogue
law); `response` = that dm-line's `{text → narration, events}`. **Fallback rule:** if no row
matches the predicate, build the state synthetically via `fixture-seed.mjs` (its `seedWorld()`
copies the shape of `dev/playtest-bug-probes.mjs:47–66` exactly — same world skeleton, same
L1 Fighter sheet), author a minimal in-register turn/response, and stamp
`source.kind:"synthetic"` — a fallback is NEVER a blocker and never a question back to the
orchestrator. Expected mix: most of hx-02…hx-10 exist in the Sella/Rennick saves; hx-11 may
go synthetic (no breach soak recorded yet).

| id | kind | source predicate (first dm-line where…) | expect (the load-bearing entries) |
|---|---|---|---|
| hx-01-founding | founding | the FOUNDING turn: `state` = a fresh `init` output (mint via `playtest-bridgeless init` with brief `{species:"Human",class:"Fighter",background:"Soldier",worldName:"Hygiene Hold"}`, seed 1); response = sella's opening dm-line verbatim | D2; D9 founding class (`setting` + `pc.life` present exactly once) |
| hx-02-check-carried | check | `meta.rolls` non-empty on the preceding player line | D6 (`reAskForbidden:[<that skill>]`), D2 |
| hx-03-combat-hit | combat | `events[]` includes `hp_changed` with negative delta | D1 `hp_changed` assert `pc.hpCur decreasedBy <delta>`; D2 |
| hx-04-combat-end | combat | `events[]` includes `combat_end` | D1 `combat_end` assert `{path:"gs.combat", op:"equals", value:null}` on AFTER (`combat_end` nulls the WHOLE object — `GS.combat=null`, `src/world/dm.js:1599` — so `gs.combat.active` is a null-deref; assert the object itself, per the note below); D8 `pc.xp increasedBy` when the real row granted XP via `encounter_resolved`; D2 |
| hx-05-travel-arrival | travel | `events[]` includes `discovery` with `makeNode:true` | D1 `discovery` assert `world.map.nodes lengthGrewBy 1`; D4 teleport guard; D3 `{minMinutes:10, maxMinutes:480, requiresAdvanceClock:true}` → pending-contract today, live the day the clock unit lands |
| hx-06-rest | rest | `events[]` includes `rest` | D1 `rest` assert a spent resource restored (`pc.resources… movedFrom`); D3 `{minMinutes:60, maxMinutes:600, requiresAdvanceClock:true}` |
| hx-07-social-gift | social | `events[]` includes `gift` | D5+D8 `codex:<target>.gifts lengthGrewBy 1` (BUG-12's dimension); D2 |
| hx-08-codex-note | codex | `events[]` includes `codex_update` with a `note` | D5 `codex:<id>.dm.notes containsText <note substring>` (BUG-06c's dimension) |
| hx-09-clock-front | clock | `events[]` includes `clock_advanced` | D1 `clock_advanced` assert `faction:<name>.clock.filled increasedBy <delta>` (BUG-10 round-trip: payload uses the digest's own `clockId`); D2 |
| hx-10-loot-claim | loot | `events[]` includes `item_changed` with `add` or `gold` | D8 `pc.inventory lengthGrewBy` / `pc.gold increasedBy`; D2 |
| hx-11-lethal-telegraph | lethal | `events[]` includes `combat_start` AND a prior dm-line matches `/bod(y|ies)|bone|blood|warn|sign|track|corpse/i` — else synthetic | D7 `{lethal:true, evidenceRegex:"bod(y|ies)|bone|blood|warn|sign|track|corpse"}`; D2 |
| hx-12-lull | lull | `events` empty or ledger-only on a quiet turn | D2 with `forbiddenEvents:["xp_granted","hp_changed","level_applied"]`; D9 steady class |

(hx-04 note — exact root and the null-deref ruling: combat lives at `gs.combat` in the
bridgeless snapshot, and `combat_end` disposes the **whole object** in one assignment
(`GS.combat=null`, `src/world/dm.js:1599`), so `combat.active` no longer exists after the event.
The assert therefore targets the object itself, NOT the (now-absent) `.active` field:
`{path:"gs.combat", op:"equals", value:null}` on AFTER. This is the single implementation — the
table row and this note agree verbatim; there is no `gs.combat.active` path anywhere in the
fixture. The `gs.` root is part of §2's `pathGet` grammar (added there — see §2 root list): `gs.`
→ the snapshot's `gs` object, with `pathGet` returning `null` for `gs.combat` when the key holds
JSON `null` (equality to `value:null` holds). That root exists for this fixture and any future
combat fixture; it is part of the op grammar, not an edge case.)

---

## §5 The 4 negative controls (red-first is structural here)

Each `nc-*` fixture embeds a response that a lazy scorer would wave through; `--selftest`
asserts its designated dim FAILS. All four use `fixture-seed.mjs` synthetic states (controls
must be minimal and self-evident).

| id | designated dim | the trap |
|---|---|---|
| nc-13-impossible | D2 | response events: `{type:"clock_advanced", source:"declared", payload:{clockId:"no-such-clock", delta:1}}` (lands `untracked`) + `{type:"hp_changed", source:"guessed", payload:{delta:-2}}` (invalid source, envelope-rejected). Both must be caught; the guessed-source event must ALSO leave `pc.hpCur` stationary (asserted) |
| nc-14-label-only | D1 | `expect.requiredEvents:[{type:"hp_changed", assert:{path:"pc.hpCur", op:"decreasedBy", value:3}}]`; response carries `hp_changed` with `payload:{delta:0}` — the label is present, the value never moves. THE BUG-01 lesson, made a permanent tripwire |
| nc-15-roll-defied | D6 | `turn.rolls:[{label:"Athletics", total:3, natural:1}]`; narration `"You clear the wall perfectly, without a hitch."` + `rollRequest:{skill:"Athletics"}` — contradicts the die AND re-asks it |
| nc-16-vanished-reward | D8 | narration `"He presses twenty-five gold into your hand."`, `events:[]`; `expect.owner:[{path:"pc.gold", op:"increasedBy", value:25}]` — the classic narrated-but-never-persisted reward |

---

## §6 Dependencies & sequencing (build queue)

1. **Buildable NOW (post-freeze):** everything in §1 — no app-code dependency. D3 hand-wave
   fixtures self-report `pending-contract` until the BUG-02/`advance_clock` clock unit
   (DETECTED-FIRST HYBRID ruling, S4 in `docs/FABLE-WINDOW-2026-07-06.md`) merges; the day it
   does, hx-05/hx-06's D3 goes live with zero edits here.
2. **Seat mode** needs only env (`SEAT_BASE_URL`/`SEAT_API_KEY`) — `/seat` is already built.
   `--system` defaults to `docs/SEAT-PROMPT.md`; until that frontier unit exists the flag is
   REQUIRED for seat mode and the runner exits 3 with `"--system required (SEAT-PROMPT.md not
   yet authored)"` if the default path is missing.
3. **Scene Risk Contract** (approved tonight, sibling spec): additive `expect.telegraph.sceneRisk`
   op later; no runner change.
4. **Consumes:** `dev/playtest-bridgeless.mjs` (transport), `dev/dm-eval/score.mjs` (D6 import),
   `dev/playtest-saves/*` (fixture quarry), `.dm/telemetry.jsonl` (provenance stamps).
5. **Consumed by:** `docs/DM-SEAT.md` §4 — new gate 3b (registry update below): a provider
   advances to the voice gate only at deterministic-fail = 0 over hx-01…hx-12.
   ⚠ PROVISIONAL (taste, recommended default): candidacy threshold = **0 deterministic fails,
   ≤ 2 pending-contract, vocabDrift false**. Adam may soften to "≤ 1 fail with a written
   waiver" — default stands until he says so.

---

## §7 Acceptance (commands + expected numbers — run from repo root)

| # | command | expected |
|---|---|---|
| A1 | `node dev/state-eval/run.mjs --provider recorded` | exit 0; final line exactly: `state-hygiene: 12/12 fixtures scored · deterministic 12 pass / 0 fail · pending-contract 2 · negative controls not run (use --selftest) · budget OK` (pending-contract = hx-05 + hx-06 D3, until the clock unit merges — then `pending-contract 0`) |
| A2 | `node dev/state-eval/run.mjs --selftest` | exit 0; line: `negative controls: 4/4 caught` |
| A3 | `node dev/verify-state-eval.mjs` | exit 0; `PASS state-eval: fixtures 16/16 loadable · goldens 12 · controls 4 · budgets.json sections 20/20 + 2 totals · baseline shape OK · selftest 4/4 · R-checks 6/6` |
| A4 | `node dev/state-eval/run.mjs --provider recorded --write` then `git diff --stat dev/state-eval/baseline-recorded.json` | second run of `--write` produces **zero diff** (determinism proof — the `--seed` flag working) |
| A5 | `python3 build/check-manifest.py` | OK, unchanged (no module edits) |
| A6 | `node dev/playtest-bug-probes.mjs` | prior probe statuses PRESERVED verbatim (this unit touches the bridgeless harness — prove no behavior drift) |
| A7 | (seat mode, dev-only, orchestrator-run when a bake-off is called) `SEAT_… env + bridge up: node dev/state-eval/run.mjs --provider seat --model glm-5.2 --system docs/SEAT-PROMPT.md` | exit 0; scorecard pair written to `dev/state-eval/out/`; `.dm/seat-costs.jsonl` grew by 12 rows; run cost printed and ≤ $1.00 |

`budgets.json` section count = 20: §0 lists 21 top-level `dmDigest` keys; `worldId`+`worldName`
collapse into one budgeted section `worldMeta` (measured together), the other 19 keys budget
1:1 — so every digest byte is inside exactly one of 20 budgeted sections.

### Regression checks (each RED-FIRST, each a MUTATION assertion)

Build order law: for R1–R4 the executor first writes the fixture/self-test, runs it against a
scorer stub that returns `pass` for everything, SHOWS the red output in the unit log, then
implements the dim and shows green. R5–R6 are shown red by temporarily applying the described
mutation, then reverting.

- **R1** (D1): `nc-14` red under a presence-only D1 (event-type-in-list check) — the log must
  show it PASSING the stub (the bug) then FAILING the real dim with
  `label-without-mutation`, with `before.pc.hpCur === after.pc.hpCur` printed (value did not
  move — that's the assertion, not the label).
- **R2** (D2): `nc-13` red-first same way; final output must print the engine's own reasons
  (`untracked`, `source must be one of…`) captured from `appliedResults`, not re-derived.
- **R3** (D6): `nc-15` red-first; green output cites both halves (contradiction + re-ask).
- **R4** (D8): `nc-16` red-first; green output prints `pc.gold 15→15 (expected 15→40)` style
  before/after values.
- **R5** (D9): mutate `budgets.json` `sections.recentLedger` down to `1` → A1 must fail with
  the measured value printed (`recentLedger 612 > 1`); restore → green. (Asserts budgets are
  actually read, and that the failure message carries the moved value.)
- **R6** (rubric isolation): craft `answers.json` marking every M-dim `fail`, run
  `--merge-rubric` → `summary.deterministicPass` byte-identical before/after merge (diff the
  two artifacts; zero diff outside the `rubric` key). The J2 separation, mechanically enforced.

---

## §8 Worked before→after (every changed site)

### 8.1 `dev/playtest-bridgeless.mjs` — `--seed`

Before (`boot`, lines 62–64 + the fetch stub at :72):

```js
function boot(state) {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
```

After (signature unchanged — `boot` reads the module-scope `args`, which is assigned before
any `cmd*` runs; insert immediately after the existing `win.fetch = …` line at :72):

```js
  // STATE-HYGIENE-EVAL §2: deterministic replays. --seed <int> swaps the window's RNG for
  // mulberry32(seed) so a fixture scores byte-identically run-over-run. Absent = live RNG,
  // exactly as before (playtest sessions keep real dice).
  if (args && args.seed != null) {
    let s = (parseInt(args.seed, 10) >>> 0) || 1;
    win.Math.random = () => { s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
```

### 8.2 `dev/playtest-bridgeless.mjs` — `cmdApply` surfaces per-event results

Before (:230–232):

```js
  out({
    ok: contract.ok, contractErrors: contract.errors,
    appliedEvents: (resp.events || []).map(e => e.type),
```

After:

```js
  // STATE-HYGIENE-EVAL §3-D2: applyResponse rides applied=[{type,res}] on the dm log line
  // (src/world/dm.js:489) — surface it so the scorer reads the ENGINE's verdicts, never re-derives.
  const lastDm = (w.dmlog || []).filter(l => l.role === "dm").slice(-1)[0] || {};
  out({
    ok: contract.ok, contractErrors: contract.errors,
    appliedEvents: (resp.events || []).map(e => e.type),
    appliedResults: lastDm.applied || [],
```

(Note for the executor: the harness's dm-line meta lands via the REAL `pushDmLog` here — the
bridgeless harness loads production `src/world/dm.js`, whose `applyResponse` passes
`{events, applied, …}` as meta. If `lastDm.applied` proves absent at build time, that is a
stop-and-flag finding against this spec's §0 table, not a thing to silently work around.)

### 8.3 `.gitignore`

Before: (no `state-eval` line). After: append `dev/state-eval/out/`.

### 8.4 New files

`run.mjs` / `mint-fixture.mjs` / `fixture-seed.mjs` / fixtures / `verify-state-eval.mjs` are
new — "before" is absence; their contracts are §§2–5 and the scorecard artifact shape below.
`mint-fixture.mjs` CLI (complete):
`node dev/state-eval/mint-fixture.mjs --state <snapshot.json> --dmlog-index <n> --id <hx-NN-slug> --kind <kind> --seed <n> [--out dev/state-eval/fixtures/]`
— refuses (exit 2, `"no living PC in snapshot"`) when the snapshot's last character isn't
`status:"living"`; emits the fixture with `expect:{}` stubbed for the executor to fill per §4;
stamps `source.telemetryTurnId` by matching the dm-line's `turnId` against
`.dm/telemetry.jsonl` when that file exists (read-only, safe during live play).

### Scorecard artifact (exact shape, both files per run)

`dev/state-eval/out/scorecard-<provider>-<YYYYMMDD[-n]>.json` (`-n` suffix on same-day reruns):

```json
{
  "provider": "recorded" | "seat:glm-5.2",
  "generatedAt": "ISO",
  "fixtures": [{ "id": "hx-03-combat-hit", "kind": "combat", "lane": "fast|deep|unknown",
    "parse": { "ok": true, "retries": 0 },
    "dims": { "D1": { "status": "pass|fail|skip|pending-contract", "why": "…", "moved": [{ "path": "pc.hpCur", "before": 9, "after": 6 }] }, "…": {} },
    "unknownTypes": [], "digestBytes": 9012 }],
  "summary": { "deterministicPass": 12, "deterministicFail": 0, "skipped": 7, "pendingContract": 2,
    "vocabDrift": false, "negativeControlsCaught": null,
    "budget": { "ok": true, "worst": { "section": "codex", "bytes": 5120, "ceiling": 6144 } },
    "cost": { "usd": 0, "estimated": true } },
  "rubric": null
}
```

`…-<stamp>.md` twin: a plain-prose table of the same content (per fixture: one line per
non-skip dim, before→after values inline). **Blind-playable parity note:** this unit adds NO
app/visual surface — the scorecard is born prose (md + json); nothing in `genesis.html`
changes, so no in-app prose twin is owed.

---

## §9 Edge cases (enumerated, ruled)

1. **Provider returns prose with no JSON block** → after the one retry, all D-dims
   `fail("parse-fail")`; the fixture still appears in the artifact (a provider that can't
   speak the contract scores zero, it doesn't vanish).
2. **Response with `rollRequest`** → D3/D4 skip (mid-beat law, §3); D1/D2/D5–D8 still score.
3. **Unknown event types** → never a D2 fail; counted; `vocabDrift` at >1/turn average (§3-D2).
4. **Events referencing a same-turn `gen[]` handle** → they score exactly as the engine treats
   them (`genApply` runs AFTER events in `applyResponse`, `src/world/dm.js:516–518` — so such
   an event lands `untracked` and D2 fails). Ruling: that IS the contract; mints ride the NEXT
   turn's spotlight. The fixture set contains no gen turns in v1; a provider volunteering one
   pays the contract's own price.
5. **Dead/absent PC in a snapshot** → `mint-fixture` refuses at mint time (§8.4); if a
   provider KILLS the PC mid-fixture (hp_changed overkill), `pc.` paths resolve against the
   same (now non-living) last character — ruling: D-dims still score against that character;
   `pc.status` change is reported in `moved` but is not itself a failure.
6. **`--only` with an nc-id outside `--selftest`** → runs it and REPORTS the designated dim's
   fail as `caught:true` rather than counting it in deterministicFail (controls never pollute
   provider numbers).
7. **Seat mode with the bridge down** → connection refused ⇒ exit 3, one boring line; never
   touches `.dm/` state. `--provider recorded` never contacts the network at all.
8. **Two providers, same day** → `-2`, `-3` filename suffixes (§8.4).
9. **Telemetry row missing for a real-sourced fixture** → `source.telemetryTurnId: null`;
   provenance still names file + dmlog index. Never a failure.
10. **A fixture's real response predates a since-fixed contract bug** (e.g. an old
    `payload.faction` alias) → score it against TODAY's engine verbatim; aliases fold
    (ROOT-B), so it passes — correct: the engine grew tolerant, the fixture proves it stays so.
11. **`--write-budgets` when a section measures 0 across all goldens** (e.g. `combat` with no
    active fight in any golden but hx-03/04 — they have one; hypothetical) → floor every
    ceiling at 256 bytes so a later legitimate first-use isn't an instant red.
12. **jsdom missing** → same behavior as the sibling harnesses: the `createRequire` throws;
    runner catches and prints the CLAUDE.md headless-test install line, exit 4.

---

## §10 Executor sizing & gate notes (for the orchestrator)

- **Size M** (one dev subtree + 2 surgical edits + 16 fixtures; zero app modules). Reasoning
  effort: med. The fixture-sourcing pass over the saves is the slow half; the scorer is
  mechanical off this spec.
- Gate personally: A1–A6 re-run by the gater; R1–R6 red-first evidence demanded in the unit
  log (never trust self-reported green); A7 deferred until a bake-off is actually called.
- Inference delta: **$0 standing** (recorded/selftest/verify/CI); ≤ $1.00 per provider
  bake-off run, dev-only, orchestrator-triggered.

## Registry updates

*(Fable applies these; this doc never edits shared docs.)*

- **`docs/DESIGN.md`** — add to the 2026-07-06 locked-decisions table:
  `STATE-HYGIENE-EVAL — provider bake-off scored on state hygiene (9 deterministic dims incl. digest section-budgets; rubric separated per BATCH3-GUARDRAILS J2, never gating); recorded mode $0/CI-safe; candidacy gate for DM-SEAT §4. Spec: STATE-HYGIENE-EVAL.md. Build DEFERRED (freeze).`
- **`docs/NEXT-STEPS.md`** — add build-queue item (after the S1–S5 window queue):
  `STATE-HYGIENE-EVAL (M, Sonnet, med effort) — dev/state-eval harness; no app-code deps; D3 hand-wave fixtures self-unblock when the BUG-02/advance_clock unit merges; feeds the DM-SEAT GLM bake-off.`
- **`docs/README.md`** — under System specs add:
  `- \`STATE-HYGIENE-EVAL.md\` — the provider eval harness: golden-turn replay through the real engine, scored on state hygiene (events land, values move, clock ticks, codex remembers); the DM-SEAT bake-off gate. (2026-07-06)`
- **`docs/DM-SEAT.md`** — in §4, insert gate **3b** after the replay gate:
  `3b. **State-hygiene gate:** node dev/state-eval/run.mjs --provider seat over the 12 goldens → deterministic fail = 0 (≤2 pending-contract, vocabDrift false) before the voice gate runs. Spec: STATE-HYGIENE-EVAL.md.`
- **`docs/PLAYTEST-BUGS.md`** — note under BUG-01: `nc-14 in dev/state-eval is the permanent label-without-mutation tripwire (STATE-HYGIENE-EVAL §5).`
- **Superseded docs:** none (dev/dm-eval remains the voice scorer; AUTOMATED-PLAYTEST remains the live-loop spec — this harness is the replay/eval third leg).
