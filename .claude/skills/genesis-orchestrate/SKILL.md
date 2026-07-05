---
name: genesis-orchestrate
description: >-
  Run the Genesis multi-unit build pipeline: lock a Sonnet-ready spec, fan out background executor
  subagents over a queue of units (in dependency order, parallel where independent), personally re-gate
  every unit (never trust a subagent's self-reported green), and land each with a --no-ff merge. Use
  this whenever Adam asks to "execute the spec", "run the batch", "build the queue", "fan out the
  work", "orchestrate", hands over several specced units at once, or schedules an overnight/background
  build — and proactively whenever a Genesis build involves more than one unit or any background
  executor. ONLY for the Genesis repo (~/Desktop/Work/projects/Genesis).
---

# Genesis Orchestrate — spec → background-execute → personally re-gate → merge

You are the ORCHESTRATOR. You never write feature code in this role; you write specs, launch
executors, verify their work with your own tool calls, and land merges. The pipeline exists
because it has repeatedly caught executor failures that self-reports hid — treat every step that
feels like ceremony as a scar from a real incident.

## The pipeline at a glance

```
1. SPEC     lock a Sonnet-ready spec (or verify the given one passes the rubric)
2. QUEUE    order units by dependency; stack branches only when a unit builds on another
3. EXECUTE  fan-outs ride the Workflow tool; singletons ride background Agents (see vehicles)
4. RE-GATE  yourself: manifest + the unit's harness + the full sweep + read the actual diff
5. LAND     --no-ff merge per unit; push origin; docs coherence; /genesis-clean-close on close
```

## 1. The spec (the handoff seam)

A unit is executable ONLY against a locked spec (a `docs/*.md` with `status: SPECCED`). The
Sonnet-ready rubric — every item, no exceptions:

1. Exact files + functions to touch, with `file:line` anchors verified against the CURRENT tree
   (grep them yourself before launching — a stale anchor sends the executor hunting).
2. Exact payload/data shapes (never "appropriate fields").
3. Behavior in ordered steps, including guards and failure returns.
4. What is explicitly OUT of scope (executors expand scope when the spec is silent).
5. A verification section: numbered checks, which are RED-FIRST (prove the check fails before
   the code lands), and the regression harness list.
6. Decisions recorded with grounds — the executor must never re-litigate.
7. Mutation-test regression checks for every fix ("fix off → red → fix on → green").

If the spec you're handed fails the rubric, fix the spec first. Specs live on `docs/…` branches
and merge like any unit.

## 2. The queue

- One unit = one branch (`type/slug`), one spec section or one spec.
- Independent units → parallel background executors, each in its OWN git worktree
  (`isolation: "worktree"` on the Agent call) so they can't collide in the working tree.
- Dependent units → a stacked line: branch B off branch A's tip, and say so in B's prompt.
- For a big batch (the 2026-07-03 batch-3 pattern): integrate ALL lines on a temp branch, run
  the FULL gate sweep on that exact tree BEFORE any master merge, then replay the merges onto
  master and verify the final tree byte-identical (`git diff <integration> master` empty).

## 3. Execution vehicles (the 2026-07-05 rate-limit lesson)

**Any fan-out wider than ~3 executors MUST ride the Workflow tool, never loose Agent spawns.**
Workflow's per-run concurrency cap (≈min(16, cores−2); excess queues) is the throttle shield —
the 69-agent Phase-2 run rode it clean, while an orchestrator that spawned ~20 loose Agents
simultaneously tripped server-side rate limiting and lost half its fleet mid-flight.

- Loose background Agents are for SINGLETON units only (one engine unit, one index build).
- A delegated orchestrator (an Opus agent running a sub-pipeline) must ALSO fan out through the
  Workflow tool it has access to — put that instruction in its prompt explicitly.
- **Rate-limit protocol:** "API Error: Server is temporarily limiting requests" is a transient
  throttle, NOT failed content. Retry dead batches at width ≤4 with staggered launches and
  minutes-long backoff on repeat throttles. **The file on disk is the completion truth, never
  the agent's exit status** — re-check which sidecars/branches actually exist and parse before
  re-authoring anything.
- Content fan-outs write SIDECAR files (one per batch, scratchpad) merged by ONE fail-loud
  integrator — never parallel-edit a shared source file. The merge must fail loud on name
  collisions AND on uncovered entries; if two chunk generations coexist, reconcile to one
  canonical generation per domain and log the choice.

## 4. Launching executors (the prompt template)

Each executor prompt must contain, in this order:
- "Read CLAUDE.md first, then read <spec path> — that is your spec, execute it EXACTLY as
  written, all sections. Do not re-litigate its decisions."
- The repo constraints it will otherwise trip on: classic script globals (NOT ES modules);
  transient state in `GS`; events only through `applyEvent`; run
  `python3 build/check-manifest.py` after ANY module edit; jsdom harness bootstrap convention
  (point at a similar `dev/verify-*.mjs` to copy); NEVER run `dev/verify-bridge.py` when a live
  session may be up.
- Branch instructions: "work on `<type/slug>` off <base>; commit there; do NOT merge — the
  orchestrator gates and merges."
- **"Execute this ENTIRE task YOURSELF — do NOT spawn sub-agents, do NOT use the Agent tool"**
  for any leaf-work agent. Leaf agents that delegate produce narrator chains (three deep, each
  "waiting for the work to complete", zero work done — real incident, 2026-07-05, twice).
- Red-first instructions for the ⊗-marked checks.
- The report format: "raw data, not prose — branch + SHAs, files touched, per-check pass/fail,
  which checks you proved red first, full harness output tails, deviations. Do not claim green
  you didn't personally run."

Launch singletons with `Agent` (`subagent_type` default, `model: "sonnet"`,
`run_in_background: true`); fan-outs through `Workflow` (§3). Model discipline: Sonnet executes,
Haiku reviews, Opus only where vision/prose judgment genuinely earns it; the orchestrator itself
never authors content beyond a couple of gold exemplars.

## 5. Babysitting executors (the part Opus tends to skip)

- **A completion notification is not a completion.** Check `git log <branch>` and
  `git status` yourself. Executors have returned early narrating "I'll wait for it to
  complete" having done nothing (real incident, 2026-07-03; and the 2026-07-05 narrator
  chains). 1 tool use + a progress-narration result = nothing happened. The disk is the truth.
- **A stalled/confused executor gets ONE corrective `SendMessage`** (same agent id — its context
  is intact): name what's missing concretely ("no branch exists; execute steps 1–6 yourself,
  no sub-delegation, start with `git checkout -b …`"). If it fails again, take over or relaunch
  fresh — don't loop corrections.
- **Executors die mid-flight** (session limits, throttles, crashes). Their partial state is often
  GOOD: inspect the branch + uncommitted diff before discarding. A dying executor's last
  uncommitted edit has been a legitimate fix worth keeping (real incident, same day).
- **Panel zombies are cosmetic.** Completed agents linger in the side panel as "running" —
  they're parked-resumable, consume zero tokens, and their ids expire on app restart. Don't
  chase them; judge liveness by disk/git state, never by the panel.
- Executors may leave the working tree checked out on their branch — see the checkout law below.

## 6. Re-gating (never trust self-reported green)

**THE CHECKOUT LAW (the 2026-07-05 lost-merge scar): before ANY merge or landing command in the
main tree, run `git branch --show-current` and verify it prints the branch you think you're on.**
A merge run while the tree sat on a stray branch landed invisibly, the stray branch was later
deleted, and a whole landed feature silently vanished from master until a downstream report
caught it (recovered from the object store). Never assume; always print.

**THE STASH LAW (the 2026-07-05 stash-spill scare): run `git stash list` at wave start and before
any `git stash`/`checkout`/`merge` in the main tree.** If it is non-empty, NEVER use a bare
`git stash pop`/`apply` — a bare pop grabs `stash@{0}`, which may be an unrelated long-lived
"safety snapshot." (Real incident: an empty `stash -u` created nothing, so a later bare `pop`
spilled a stale 2026-07-03 snapshot into the tree and blocked the merge with a phantom conflict.)
Always target an explicit `stash@{N}` ref, and prefer a WIP commit or a fresh worktree over the
shared stash stack for anything you mean to keep. Retire a safety-snapshot stash the moment its
content has landed (verify redundancy, then `git stash drop stash@{N}`) — a stash is a worse
archive than a commit/tag and a live trip-hazard on the shared stack.

Run these YOURSELF on the unit branch tip, whatever the executor reported:

```bash
git branch --show-current                            # the checkout law — verify before any merge
python3 build/check-manifest.py                      # after any module edit; must end RESULT: OK
node dev/verify-<unit>.mjs                            # the unit's own harness
for f in dev/verify-*.mjs; do node "$f" >/dev/null 2>&1 || echo "❌ $f"; done   # full sweep by exit code
```

Plus: **read the diff** (`git show --stat`, then the load-bearing hunks). You are the Opus-review
step: check the spec's decisions were honored, no scope creep, no engine-layer purity violations
(engine never touches `w`/`U`/render), comments match repo voice. New-harness units: confirm the
red-first proofs are in the report or reproduce one yourself (stub the fix, watch it fail).
Event-surface changes: also run `node dev/gauntlet-fuzz-events.mjs` (hostile payloads against
new applyEvent cases) and `node dev/gauntlet-monkey.mjs` (0 harness-aborted is the bar). **Visual
units: READ the capture-sheet PNG yourself** — a harness can't judge a silhouette or a color grade.

A test that a correct behavior change breaks is fixed by updating the FIXTURE (red-first,
commented why), never by weakening the behavior. **If a data table lives in two places ("kept in
sync by convention"), that IS the bug** — make one side a stamped pass-through of the other (the
render-profile mirror drifted within hours and shipped a lava-red bright-kingdom, 2026-07-05).

## 7. Landing

Per unit: `git merge --no-ff <branch> -m "Merge <branch> — <what it is>"`, delete the branch.
The merge message names the gates you personally re-ran. **Push master to origin after each
landing batch** (adopted 2026-07-05 — disk-space + backup discipline; local must never be the
only copy). Docs coherence rides the close, not each merge: CHANGELOG + HANDOFF + NEXT-STEPS
together via `/genesis-clean-close`. Commits end with the Co-Authored-By line per CLAUDE.md.

## Budget pre-flight (the overnight lesson)

Before an overnight/long batch: estimate executor count × typical unit cost against the session
limit — the 2026-07-02 rotation died at the token ceiling with both agents mid-task. If the
budget is tight, serialize the queue smallest-first so partial completion is still landable.
