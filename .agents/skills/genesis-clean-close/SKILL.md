---
name: genesis-clean-close
description: >-
  Perform the explicit final/evening close for a Genesis work session - the slow end-of-session ritual that keeps the docs and git
  history coherent. It surveys what changed, runs the FULL CI-equivalent gate (check-manifest + the whole
  verify-*.mjs sweep + verify-bridge.py + verify-table-lint.py + playtest-bug-probes.mjs), updates
  CHANGELOG.md + HANDOFF.md + NEXT-STEPS.md together, then commits on a type/slug branch and (with
  confirmation) merges --no-ff to master, pushes, and confirms the GitHub CI run goes green. Use only when Adam
  explicitly says "clean close", "final close", "evening close", "ship/push this", "commit and back up",
  or invokes /genesis-clean-close. Do not use for a fast checkpoint, docs checkpoint, local-only merge,
  or any request that explicitly says no CI or no push. ONLY for the Genesis repo
  (~/Desktop/Work/projects/Genesis); never the Shifting Vale / Playtest Sandbox vault.
---

# Genesis — Clean Close

The discipline this enforces lives in `AGENTS.md` ("Git workflow" + "Disciplines" + "Docs"): **drift is the
enemy.** A session isn't done when the code works — it's done when the three living docs tell the same story
the code does, and the work is committed on a branch and backed up to `origin`. This skill is that closing
ritual so nothing is forgotten between "it works" and "it's landed."

Run the steps in order. Steps 1–4 are local and reversible — do them and keep moving. Steps 5–6 are
outward-facing (merge to the stable line, push to GitHub) — **confirm before each**, because approval to
build is not approval to publish.

## Mode gate - stop if this is only a checkpoint

Before Step 1, classify the request using `CLAUDE.md`/`AGENTS.md` **Commit modes**.

- If Adam asks for a checkpoint, docs capture, local merge, or explicitly says no CI/no push, **do not
  run this skill**. Reuse the current worktree; run proportional checks; commit explicit paths; mark
  `FULL CI PENDING` for the named later owner.
- Use this skill only for the explicit final/evening close. It may close several accumulated checkpoint
  commits with one complete gate.
- Never create a fresh worktree merely to enter this skill. If a genuinely separate lane requires one,
  use `GIT_LFS_SKIP_SMUDGE=1`; a clean close does not require bulk LFS materialization.

## 1 — Survey what changed

- `git status --short` and `git diff --stat` (working tree) — and recall the session's actual work from the
  conversation. You need both: the diff says *what files*, the conversation says *why*.
- Decide the **unit of work** and its branch name `type/slug` — `feat/…`, `fix/…`, `docs/…`, `chore/…`
  (AGENTS.md). One branch = one coherent unit. If the session sprawled across two unrelated things, say so
  and propose splitting; don't smuggle them into one commit.
- Note whether any **module** changed (anything under `src/` or `data/`, or `manifest.json` /
  `genesis.html`). That decides Step 2.

## 2 — Pass the gates (never close on red)

The close gate is **the same gate CI runs, run in FULL** — not just the harnesses for the domain you
touched. **Per-unit re-gating is exactly what let CI rot red for 60+ runs** (2026-07-16): each close ran
only its own domain's verifiers, so failures elsewhere — a shared-const rename that broke sibling
extraction harnesses, a generated-artifact drift, a frozen fixture staled by a later feature — piled up
unseen because no close ever ran the whole sweep. So a Genesis close is not clean until the whole sweep is
green.

- **If any module changed:** `python3 build/check-manifest.py` must print `RESULT: OK`. It fails on orphans,
  drift, an unregistered file, a `loadOrder` entry with no `<script>` tag. A green manifest is the floor.
- **While iterating, run the verifiers whose domain you touched** for fast feedback — social →
  `verify-social.mjs`, codex → `verify-codex.mjs`, event runtime → `verify-dm-events.mjs`, advancement →
  `verify-advancement.mjs`/`verify-levelup.mjs`, prep → `verify-prep*.mjs`. But this is the inner loop, NOT
  the close gate.
- **Before you land, run the FULL CI-equivalent sweep — every gate CI runs, over ALL harnesses.** CI is
  jsdom-only and deliberately has NO puppeteer-core and NO Pillow, so its dep-aware loop SKIPs the render/
  paint harnesses. **You must reproduce that dep-skip set locally or you'll misread the result:** the
  harnesses resolve `jsdom` via `$JSDOM_HOME` but resolve `puppeteer-core` via a hardcoded
  `$HOME/.genesis-jsdom` — which CI lacks but your machine HAS, so a plain local run RUNS the ~18 render
  harnesses CI skips (slow, and their pixel-diffs flake as false reds), hiding the true failing set. Run the
  sweep with a **fake empty `$HOME`** so the puppeteer require throws and the loop SKIPs it exactly as CI
  does, plus a real `JSDOM_HOME`:

  ```bash
  python3 build/check-manifest.py                        # RESULT: OK

  REAL_JSDOM="$HOME/.genesis-jsdom"; FAKE=/tmp/genesis-fakehome; mkdir -p "$FAKE"
  HOME="$FAKE" JSDOM_HOME="$REAL_JSDOM" bash -c '
    reds=0
    for f in dev/verify-*.mjs; do
      out=$(node "$f" 2>&1) && continue
      echo "$out" | grep -qE "puppeteer-core|No module named .PIL.|fast-check not resolvable" \
        && echo "  dep-skip $f" || { echo "  RED $f"; reds=1; }
    done
    exit $reds
  ' && echo "verify-*.mjs GREEN (only dep-skips)" || echo "verify-*.mjs has REAL reds — do not close"

  python3 dev/verify-bridge.py                           # DM bridge transport + contract
  python3 dev/verify-table-lint.py                       # table linter self-test
  JSDOM_HOME="$REAL_JSDOM" node dev/playtest-bug-probes.mjs   # running regression list
  ```

  The close gate is **zero REAL reds** — dep-skips are expected (they're the render/paint harnesses CI also
  skips; ~18 of them). A harness that fails for any OTHER reason blocks the close.
- **Diagnose each real red: regression vs staled fixture.** A frozen snapshot / git-show reference / size
  budget that a *legitimate later feature* has staled is not a regression — re-baseline it **RED-first with
  a why-comment** (prove the drift is exactly the intended change), and keep the harness's mutation/RED proof
  load-bearing. **Never weaken the assertion to go green** (AGENTS.md "Validators preserve the thing's job").
- **Generated artifacts:** if Engine table markdown changed, recompile (`compile-tables.py --emit`); if a
  drift harness (`verify-table-usage-data`, `verify-dm-contract`, `verify-wiki`, …) is red, **regenerate from
  source** (`gen-table-usage-audit.py`, `gen-dm-contract.py --emit`, …), never hand-edit the artifact.
  Running harnesses churns dev artifacts (gauntlet/geometry reports, `*-shots/*.png`, `assets/dressing`
  paintings) — revert that churn before staging; stage explicit paths, never `git add -A`.
- If any gate is red, **stop and surface it** — a clean close on broken tests is a lie. Fix or get a decision.

## 3 — Update the three living docs (coherently, in one pass)

Update all three so they agree. Convert relative dates to absolute (use today's date). Keep entries terse
and specific — names of the real symbols/files, pass counts, the *why*.

- **`docs/CHANGELOG.md`** — prepend a newest-first dated entry under a `## YYYY-MM-DD — <headline>` heading,
  grouped **Added / Changed / Fixed / Deferred**. If there's already an entry for today, add a
  `## YYYY-MM-DD (later) — …` sibling rather than rewriting the morning's.
- **`docs/HANDOFF.md`** — prepend a new `## ⭐ Latest (YYYY-MM-DD) — <headline> [Codex]` section:
  current state, what shipped, verification line, and a **"Do next (pick up here)"** at the end. Demote the
  previous "Latest" by dropping its ⭐ (it stays, just no longer the star). HANDOFF is read-first; it must
  open on *this* session.
- **`docs/NEXT-STEPS.md`** — check off (`☑`) what landed, re-order what's now next, and refresh the
  **"Do next"** at the bottom. This is the ordered build plan; it should never describe finished work as
  pending.
- **Coherence sweep (AGENTS.md "Disciplines"):** if a *locked decision* changed, update `docs/DESIGN.md`
  (the decision registry) too. If a system spec's status changed (a phase built), tick it in that spec.
  Mention any IP/scope debt you're carrying forward so it isn't lost.
- **Wiki / ARCHITECTURE sweep (added 2026-07-05):** if the session **added a new system, retired one, or
  materially changed how one works**, update its entry in `docs/ARCHITECTURE.md` (the 47-system map that
  is the in-game Wiki's source of truth) in the same close — a new system gets a new `### entry` under its
  `## layer`; a changed one gets its "How it works" line refreshed. Then recompile the Wiki data
  (`python3 build/gen-wiki.py` → `data/wiki.js`, once that generator exists) so the in-game Wiki reflects
  reality — edit-source→compile, never hand-edit `data/wiki.js`. A pure bug-fix or content/data change that
  doesn't alter a system's *description* needs no ARCHITECTURE edit; use judgment. Drift between the code
  and the map is the same enemy as drift in the three living docs.
- **Memory:** if something non-obvious about the project's direction changed, note it for the auto-memory
  (the `MEMORY.md` index + a memory file) — but only durable facts, not this session's mechanics.

## 4 — Commit on a branch (never on master)

`master` is the stable integration line — **never commit to it directly** (AGENTS.md). The session's work is
in the working tree; branch first so it lands as one labeled unit.

**THE STASH LAW (the 2026-07-05 scare):** before any `git stash`/`git checkout`/`git merge` here, run
`git stash list`. If it is **non-empty**, NEVER use a bare `git stash pop`/`git stash apply` — a bare pop
grabs `stash@{0}`, which may be an unrelated long-lived "safety snapshot" (a real incident: an empty
`stash -u` created nothing, then a later bare `pop` spilled a stale 2026-07-03 snapshot into the tree and
blocked the merge). Always target an explicit ref (`git stash pop stash@{N}`), and prefer a WIP commit or a
worktree over the shared stash stack for anything you mean to keep. A long-lived safety-snapshot stash is a
worse archive than a commit/tag — **retire it the moment its content has landed** (verify redundancy, then
`git stash drop stash@{N}`).

```
git checkout -b <type/slug>        # carries the uncommitted working tree onto the branch
git add -A
git commit                          # message: a tight headline + a short body of what/why
```

Commit message: a real summary (`feat(social): wire Phase 3 events + Phase 4 surfacing + review fixes`),
a few body lines on what changed and why, and **end with**:

```
Co-Authored-By: Codex Opus 4.8 <noreply@anthropic.com>
```

## 5 — Merge to master (confirm first)

Per the workflow, a feature returns as **one `--no-ff` merge** (easy to see and revert a whole feature),
then the branch is deleted. This writes to the stable line — **ask before doing it.** Offer the option to
run `/code-review` on the branch diff first (solo repo → that's the "review" gate).

```
git checkout master
git merge --no-ff <type/slug>       # one labeled merge commit per feature
git branch -d <type/slug>
```

If Adam wants to keep the work on the branch for review, **stop here** — committed + pushed-as-branch is a
perfectly clean stopping point. Don't merge unprompted.

## 6 — Push / back up (confirm first)

Back up to `origin` (the private GitHub repo) — outward-facing, so confirm. Push whatever lines exist:

```
git push -u origin <type/slug>      # if staying on the branch
git push origin master              # after a merge
```

**Confirm the real CI run goes green — the close is NOT done until it does.** The push to `master` (or the
branch's PR) triggers `.github/workflows/ci.yml`. A local sweep can pass while CI fails on an environment
difference, so watch the actual run and wait for its conclusion:

```
gh run list --branch master --limit 1 --json databaseId,headSha,status,conclusion   # find this push's run
gh run view <id>                    # poll until status: completed
gh run view <id> --log-failed       # if it failed: which step/harness, then fix forward
```

A **green conclusion is the real close.** If CI is red, that is not a clean close — surface the failing
harness, fix it (a follow-up commit — even a docs-only one should also come back green), and re-confirm.
Do not report "landed + green" until you have *seen the run succeed*.

Then report: branch, commit SHA, the CI run id + its green conclusion, what was pushed, and the docs you
touched — a one-paragraph close so the next session (or the next Codex) can pick up cold.

## Notes

- **Be a guided ritual, not a runaway.** Show the branch name, the commit message, and the merge/push plan
  before executing the outward-facing steps. Adam may want to tweak the slug or hold at the branch.
- **Don't fabricate a clean close.** If tests are red, a doc is half-updated, or the diff is two unrelated
  things, say so plainly — surfacing it is the job, not papering over it.
- **Scope guard:** this is the Genesis repo only. If `pwd` isn't `~/Desktop/Work/projects/Genesis` (or its
  worktrees), stop — you're in the wrong place.
