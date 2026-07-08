---
type: runbook
project: Genesis
status: ACTIVE — the overnight pre-alpha visual build, night of 2026-07-07 → 08
authority: Adam un-gated the TABLETOP build verbally 2026-07-07 ~11pm ("schedule a massive
  build session for the visuals … running fine on its own for the next several hours").
  This ruling supersedes DIRECTION §4's soak-gate FOR U1–U7 ONLY. Record the supersession
  in DIRECTION.md at close.
boss: Fable planned + launched Wave 1; OPUS is boss from handoff onward. Opus — your FIRST
  action is to invoke the `genesis-orchestrate` skill; its laws bind every step below.
spec: docs/TABLETOP-UNITS.md (SPEC-LOCKED 2026-07-07) + TABLETOP-VISION.md §0 laws / §9 gates
created: 2026-07-07
---

# OVERNIGHT-TABLETOP — the wave runbook

## The one-paragraph brief

Build TABLETOP-UNITS U1–U7 (the V1+V2+shell pre-alpha cut) overnight in five waves of
background executors. Sonnet executes against the locked spec; the boss (Opus) personally
re-gates every unit (never trust self-reported green), lands each wave with `--no-ff`
merges, and pushes master after every landing. The cadence is notification-driven: each
wave rides one background Workflow; its completion notification wakes the boss, who gates,
lands, and fires the next wave. Partial completion is landable — a night that ends after
Wave 3 with master green is a SUCCESS, not a failure.

## Standing laws (condensed — the skill has the full text; these are the scars)

1. **Disk is truth.** A completion notification, an agent's "done", a panel state — none of
   them are evidence. `git log <branch>` + the diff + your own harness runs are.
2. **The checkout law.** `git branch --show-current` before EVERY merge/landing command.
3. **The stash law.** `git stash list` at wave start; never a bare `stash pop`.
4. **Read the diff yourself** — spec honored, no scope creep, engine purity (renderer reads
   state, never writes; no `w`/`U` writes from theater-data/theater-boot), repo voice.
5. **One corrective SendMessage** to a stalled executor, then take over or relaunch. Never
   loop corrections.
6. **Never weaken behavior to green a test.** Fixture updates are red-first + commented.
7. **No model call in the assembly path** — the V1–V5 inference cost is declared ZERO.
8. Executors get "execute ENTIRELY yourself, no sub-agents" — narrator chains are real.
9. **Budget rule:** if the session token budget looks tight mid-night, finish + land the
   current wave, write the morning report, stop clean. Do not start a wave you can't gate.

## Wave 0 — baseline (DONE by Fable at handoff, verify the tail)

- `check-manifest.py` → RESULT: OK (2 pre-existing layer WARNs: data.wiki, ui.ref-wiki).
- Full `dev/verify-*.mjs` sweep launched in background (task `b12dk81av`). **Opus: read its
  output before gating Wave 1.** Any RED lines there are PRE-EXISTING — record them here in
  this doc (edit in place), don't blame executors for them, and don't let new ones in.
- Working tree was clean on master at `git log -1` = post-571dd02; stash list EMPTY.

## The wave table

| wave | units | vehicle | branches (off) | boss gate focus |
|---|---|---|---|---|
| 1 | U1 ∥ U2 (interlocked — land TOGETHER) | Workflow ×2, worktrees | `feat/tabletop-u1-tray`, `feat/tabletop-u2-shell` (master) | U1 byte-gate fixture committed FIRST on its branch; integration tree; Opus-review U1 |
| 2 | U3 | Workflow ×1 | `feat/tabletop-u3-blank-ambient` (master post-W1) | shared-derivation spy check; codex exclusion UNTOUCHED |
| 3 | U4 | Workflow ×1 | `feat/tabletop-u4-tableau` (master post-W2) | attitude-table mutation check; §9.1 purity |
| 4 | U5 ∥ U6 | Workflow ×2, worktrees | `feat/tabletop-u5-overlays`, `feat/tabletop-u6-reconfigure` (master post-W3) | integration tree (both touch theater-data/render); mount-once spy; §9.10 dedup; Opus-review U6 |
| 5 | U7 harness pack | Workflow ×1 | `feat/tabletop-u7-harness` (master post-W4) | run the mutation matrix YOURSELF; pack green on the integrated tree |
| close | — | boss inline | — | `/genesis-clean-close` + DIRECTION.md supersession note + morning report + push |

**Deviation (Fable's call, flagged for Adam):** the spec's closing note asks the orchestrator
to schedule the ES-module migration "WITH U1/U2 or immediately after, before U3+". DEFERRED
to a morning session with Adam instead: the migration rewrites file structure and would
invalidate the verified `file:line` anchors that U3–U6's spec sections depend on, mid-run,
unattended. Anchor drift is the exact stale-spec failure mode the pipeline exists to prevent.
U3–U6 do not functionally require ES modules. Adam ratifies or reverses this at breakfast.

## Landing procedure — Wave 1 and Wave 4 (two-branch integration)

```bash
git branch --show-current          # must print master
git stash list                     # must be empty / known
git checkout -b integration/tabletop-w<N> master
git merge --no-ff feat/<branch-A> && git merge --no-ff feat/<branch-B>
# resolve conflicts here (U1+U2 both touch render.js — expected, small, known seams;
# U5+U6 both touch theater-data.js — same). Resolve per the spec text, commit.
python3 build/check-manifest.py                                      # RESULT: OK
for f in dev/verify-*.mjs; do node "$f" >/dev/null 2>&1 || echo "RED $f"; done
# gates green on THIS tree → replay onto master:
git checkout master && git merge --no-ff integration/tabletop-w<N> -m "Merge tabletop wave <N> — <units>; gates personally re-run: check-manifest + full sweep + <unit harnesses>"
git diff integration/tabletop-w<N> master --stat   # MUST be empty
git branch -d integration/tabletop-w<N> feat/<A> feat/<B> && git push origin master
```

Single-unit waves: same, minus the integration branch — gate on the branch tip, then
`--no-ff` merge to master, push. Event-surface changes (U5's trace write, U6): also run
`node dev/gauntlet-fuzz-events.mjs` + `node dev/gauntlet-monkey.mjs` (0 harness-aborted).

## Wave workflow template (Opus: reuse for W2–W5, swap the prompts in)

```js
export const meta = {
  name: 'tabletop-wave-N',
  description: 'Tabletop pre-alpha wave N — <units>',
  phases: [{ title: 'Execute' }],
}
const REPORT_SCHEMA = { type:'object', required:['branch','headSha','filesTouched','checks','deviations','redFirstProofs'], properties:{
  branch:{type:'string'}, headSha:{type:'string'}, filesTouched:{type:'array',items:{type:'string'}},
  checks:{type:'array',items:{type:'object',required:['name','pass','outputTail'],properties:{name:{type:'string'},pass:{type:'boolean'},outputTail:{type:'string'}}}},
  redFirstProofs:{type:'array',items:{type:'string'}}, deviations:{type:'array',items:{type:'string'}} }}
const results = await parallel(PROMPTS.map(p => () =>
  agent(p.text, { label: p.label, isolation: 'worktree', model: 'sonnet', effort: p.effort, schema: REPORT_SCHEMA })))
return results
```

## Executor prompts — VERBATIM (the frontier work is already done; do not re-derive)

Every prompt below already carries the constraint block. Paste as-is into `p.text`.

### Shared constraint block (already inlined in each prompt below)

> Read CLAUDE.md first, then read docs/TABLETOP-UNITS.md and docs/TABLETOP-VISION.md §0+§9 —
> unit <N> of TABLETOP-UNITS is your spec; execute it EXACTLY as written, every clause of its
> Locked contract / Seams / Acceptance sections. Do not re-litigate its decisions.
> Repo constraints: classic `<script>` globals, NOT ES modules (top-level const/function are
> intentionally global); the theater ES-module family (genesis.html:1392-1412) stays
> module-tagged, boot LAST. New mutable UI state goes in `GS` only; persistent facts only via
> events through `applyEvent`. Run `python3 build/check-manifest.py` after ANY module edit and
> register any new file in manifest.json. `tables.json`/`tables.js`/`data/*` are generated —
> never hand-edit. jsdom harness convention: copy the bootstrap of a similar `dev/verify-*.mjs`
> (real genesis.html, all modules in document order). NEVER run `dev/verify-bridge.py`.
> Branch: create `<branch>` off master in YOUR worktree; commit there with clear messages
> ending in the Co-Authored-By line per CLAUDE.md; do NOT merge — the orchestrator gates and
> merges. Execute this ENTIRE task YOURSELF — do NOT spawn sub-agents, do NOT use the Agent
> tool. Acceptance checks marked as mutation/red-first: prove each fails before the code lands
> (commit the failing proof note in your report). Report raw data, not prose: branch + head
> SHA, files touched, per-check pass/fail with harness output tails, which checks you proved
> red first, every deviation. Do not claim green you didn't personally run.

### U1 — `feat/tabletop-u1-tray` (effort: high)

Constraint block above, then:
> Your unit: **U1 · trayFrom + the Standing Table** (TABLETOP-UNITS.md §U1).
> STEP ZERO before any other edit: build the combat byte-gate — a jsdom fixture that captures
> `theaterBoardFrom(segment, scene, opts)` output for a representative fixture segment+scene
> on the UNTOUCHED tree, commit it, and make it the first acceptance check (deep-equal after
> your refactor). Then implement `trayFrom(source, scene, opts)` in src/engine/theater-data.js
> per the locked contract (source kinds segment/interior/idle; same board return shape,
> theater-data.js:948-969 unchanged), make `theaterBoardFrom` the one-line wrapper, and edit
> the four render.js seams + the boot readiness flag exactly as listed (spec seams 1–5).
> Acceptance (a)–(d) + both mutation checks, all in a jsdom harness you leave as
> `dev/verify-tabletop-u1.mjs` (U7 will absorb it later; keep it standalone-green now).

### U2 — `feat/tabletop-u2-shell` (effort: medium)

Constraint block, then:
> Your unit: **U2 · The 3-column shell + ARIA contract** (TABLETOP-UNITS.md §U2). Implement
> the mainHtml default-stage branch, the rail stage-toggle on `GS.stageCollapsed`, the CSS
> reuse of the battle-stage block, and the FULL locked ARIA list — especially: `.stage-prose`
> MUST move OUTSIDE the aria-hidden stage wrap (render it as the feed column's live sibling),
> and the dice overlay alignment rect retargets to the FEED column. Acceptance (a)–(c) + the
> §9.11 mutation check (wrap .stage-prose back inside the hidden subtree → harness FAILS).
> Leave your harness as `dev/verify-tabletop-u2.mjs`. NOTE: U1 is being built in parallel on
> another branch; you are both off the same master base and both touch render.js:342-355
> territory — stay strictly inside YOUR seams; the orchestrator resolves the integration.
> Also run `node dev/verify-in-session-ui.mjs` — if your shell edits legitimately break its
> assertions, update that harness's assertions in the SAME commit with a red-first comment
> (validators preserve the job, never mechanical green).

### U3 — `feat/tabletop-u3-blank-ambient` (effort: medium)

Constraint block, then:
> Your unit: **U3 · Blank-piece fallback + ambient presence** (TABLETOP-UNITS.md §U3). Three
> locked contracts: (1) `blank:figure`/`blank:prop` registry entries + the extended
> `resolveWholeObject` chain (never-null for figure/prop; cuboid stays the load-failure path
> ONLY); (2) `ambientPresence` on both digest surfaces (dm.js:133 sibling of cast, dm.js:437
> node scenes) computed from the exact untouchedAmbient set (codex.js:415) — the exclusion
> itself UNTOUCHED, you summarize what it hides; texture = place-tier stock phrase, no names;
> (3) ONE exported derivation function in codex.js consumed by BOTH the digest and (later U4)
> the stage. Acceptance §9.6 both directions + §9.3 + both mutation checks — including the
> call-identity spy (the two consumers must call the SAME function; assert identity, not just
> values). Harness: `dev/verify-tabletop-u3.mjs`.

### U4 — `feat/tabletop-u4-tableau` (effort: medium)

Constraint block, then:
> Your unit: **U4 · Cast tableau + arrangement grammar** (TABLETOP-UNITS.md §U4). Implement
> `castFrom(w, source)` (unit shape of theaterUnitsFrom, theater-data.js:1485,1519-1523) and
> PURE `arrangeTableau(units, arrangement)` with the five arrangements and the MECHANICAL
> selection rules exactly as locked (shop→shopfront, >1 contacted→ring, 1→facing-pair,
> walking→march, else vignette). Attitude→distance+facing is ONE numeric table in
> theater-data, no per-NPC logic. Sources exactly as listed (pc ref, prepEligibleCompanion-
> Creatures prep.js:107-114, codexHereNowIds rule 1, U3's shared derivation → blank:figure —
> U3 is already on master; call ITS exported function, do not re-derive). Combat path
> untouched. Acceptance + the hostile-row mutation check. Harness: `dev/verify-tabletop-u4.mjs`.

### U5 — `feat/tabletop-u5-overlays` (effort: medium)

Constraint block, then:
> Your unit: **U5 · Overlay lanes** (TABLETOP-UNITS.md §U5). (1) `overlaysFrom(source)` as a
> keyword-rule table over dressing.condition / footing / signOfPassage.name ONLY — never atmo,
> never DM prose; ≤4 flat overlay registry shapes (crack-web, standing-water, moss-patch,
> drag-marks); unmatched → NO overlay, blankness is legal, no generic fallback. (2) Traces:
> on combat_end write `overlay.traces`/`removed` through the EXISTING walk_update overlay
> path (prep.js:493-509) — no new event types, no new store; trayFrom reads traces and stages
> toppled corpse poses; corpse is the DEFAULT disposition, absence only via removed.
> Acceptance: the walk-away-walk-back re-derivation (corpses persist, encounter does NOT
> re-stage alive), obliteration → removed, the cracked-condition vs pooled-water-atmo pair
> (§9.4 sibling), + the dressing.text mutation check. Event-surface change: also run
> gauntlet-fuzz-events + gauntlet-monkey. Harness: `dev/verify-tabletop-u5.mjs`. NOTE: U6
> runs in parallel off the same base and also edits theater-data.js/render.js — stay strictly
> inside YOUR seams.

### U6 — `feat/tabletop-u6-reconfigure` (effort: high)

Constraint block, then:
> Your unit: **U6 · Combat reconfigure/relax + tray persistence** (TABLETOP-UNITS.md §U6).
> combat_start switches unit source castFrom→theaterUnitsFrom + passes cm.scene into trayFrom
> (lanes/cover on) with NO remount and NO retire; combat_end reverses + triggers U5's trace
> write (U5 is in flight in parallel — code against its LOCKED contract shape
> `overlay.traces=[{kind:"corpse",ref,zone}]`/`removed`, and mark any integration seam you
> can't finish in your report deviations). Implement the §9.10 dedup law in the board-build
> merge (theater-data.js:~830-902): when scene present, a prop whose source text also matched
> a cover zone gets the cover tag on the EXISTING recipe — each noun staged ONCE. Acceptance:
> the full live-fixture flow with the Theater.mount called-ONCE spy across walk→combat→relax,
> the §9.10 piece-count-1 mutation fixture, and the serialize/reload/re-derive §9.1 tray-hash
> check including traces. Harness: `dev/verify-tabletop-u6.mjs`.

### U7 — `feat/tabletop-u7-harness` (effort: high)

Constraint block, then:
> Your unit: **U7 · The harness pack** (TABLETOP-UNITS.md §U7). Build `dev/verify-tabletop.mjs`
> asserting ALL 11 TABLETOP-VISION §9 gates as named checks with their mutation twins,
> absorbing/superseding the per-unit `dev/verify-tabletop-u*.mjs` harnesses (fold their checks
> in; then DELETE the per-unit files in the same commit so the sweep has one owner — record
> this in your report). Include the §9.8 perf budget (warm trayFrom+setBoard ≤250ms/frame,
> builders-preloaded readiness flag asserted first). Document the mutation matrix in the
> harness header and run it once, capturing each seeded-mutation failure. Must run green on
> the CURRENT master (the integrated U1–U6 tree). Also leave verify-in-session-ui.mjs green.

## Failure protocol

- Executor stalls/narrates: ONE SendMessage naming the concrete gap → else relaunch fresh
  (its partial branch may still be good — inspect before discarding).
- Rate-limit errors are throttles, not failed content: retry at width ≤2 with backoff; the
  branch on disk is the completion truth.
- A wave that fails its gate twice: PARK it (leave the branch, document in the report),
  do NOT merge, do NOT weaken a check. If later waves depend on it, stop the queue and
  write the report — a short green night beats a long red one.
- U1's byte-gate is the load-bearing check of the whole night: if combat parity breaks and
  the executor can't restore it, the night STOPS at Wave 1. Combat regression is not landable.

## Morning close (boss, after Wave 5 or wherever the night ends)

1. `/genesis-clean-close` — CHANGELOG + HANDOFF + NEXT-STEPS together; final push.
2. DIRECTION.md: record the soak-gate supersession (Adam's 2026-07-07 verbal un-gate).
3. Write `docs/OVERNIGHT-REPORT-2026-07-08.md`: waves landed (merge SHAs), gates personally
   re-run per wave, red-first proofs seen, deviations (include the ES-module deferral),
   parked items, pre-existing sweep REDs if any, and **Adam's checklist**, which MUST include:
   visual QA in a real browser (harnesses can't judge a silhouette or a color grade — serve
   localhost:5175, walk a segment, enter combat, collapse the stage, screen-reader pass per
   BLIND-PLAYABLE), the ES-module-migration ruling, and the U1/U6/U7 Opus-review diffs to skim.
