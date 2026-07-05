---
name: genesis-clean-close
description: >-
  Close out a Genesis work session cleanly — the end-of-session ritual that keeps the docs and git
  history coherent. It surveys what changed, runs the validation gates (check-manifest + the relevant
  verify-*.mjs harnesses), updates CHANGELOG.md + HANDOFF.md + NEXT-STEPS.md together, then commits on a
  type/slug branch and (with confirmation) merges --no-ff to master and pushes. Use this whenever Adam
  says "clean close", "close out", "wrap up", "land this", "ship it", "finish the session", "update the
  changelog and push", "commit and back up", or invokes /genesis-clean-close — and proactively when a
  Genesis unit of work is verified-green and ready to land. ONLY for the Genesis repo
  (~/Desktop/Work/projects/Genesis); never the Shifting Vale / Playtest Sandbox vault.
---

# Genesis — Clean Close

The discipline this enforces lives in `CLAUDE.md` ("Git workflow" + "Disciplines" + "Docs"): **drift is the
enemy.** A session isn't done when the code works — it's done when the three living docs tell the same story
the code does, and the work is committed on a branch and backed up to `origin`. This skill is that closing
ritual so nothing is forgotten between "it works" and "it's landed."

Run the steps in order. Steps 1–4 are local and reversible — do them and keep moving. Steps 5–6 are
outward-facing (merge to the stable line, push to GitHub) — **confirm before each**, because approval to
build is not approval to publish.

## 1 — Survey what changed

- `git status --short` and `git diff --stat` (working tree) — and recall the session's actual work from the
  conversation. You need both: the diff says *what files*, the conversation says *why*.
- Decide the **unit of work** and its branch name `type/slug` — `feat/…`, `fix/…`, `docs/…`, `chore/…`
  (CLAUDE.md). One branch = one coherent unit. If the session sprawled across two unrelated things, say so
  and propose splitting; don't smuggle them into one commit.
- Note whether any **module** changed (anything under `src/` or `data/`, or `manifest.json` /
  `genesis.html`). That decides Step 2.

## 2 — Pass the gates (never close on red)

- **If any module changed:** `python3 build/check-manifest.py` must print `RESULT: OK`. It fails on orphans,
  drift, an unregistered file, a `loadOrder` entry with no `<script>` tag. Fix registration before
  proceeding — a green manifest is the floor.
- **Run the verifiers whose domain you touched.** Map changed files → harness: e.g. social → `verify-social.mjs`,
  codex → `verify-codex.mjs`, the event runtime → `verify-dm-events.mjs`, advancement/leveling →
  `verify-advancement.mjs`/`verify-levelup.mjs`, prep → `verify-prep*.mjs`. When unsure, run the ones that
  load the full app (`verify-dm-events.mjs`, `verify-social.mjs`) — they catch cross-module breakage. Report
  pass counts.
- **Generated artifacts:** if Engine table markdown changed, recompile (`compile-tables.py --emit`) rather
  than hand-editing `tables.json`/`tables.js` (edit-source → compile-artifact). Never commit a hand-edited
  generated file.
- If a gate is red, **stop and surface it** — a clean close on broken tests is a lie. Fix or get a decision.

## 3 — Update the three living docs (coherently, in one pass)

Update all three so they agree. Convert relative dates to absolute (use today's date). Keep entries terse
and specific — names of the real symbols/files, pass counts, the *why*.

- **`docs/CHANGELOG.md`** — prepend a newest-first dated entry under a `## YYYY-MM-DD — <headline>` heading,
  grouped **Added / Changed / Fixed / Deferred**. If there's already an entry for today, add a
  `## YYYY-MM-DD (later) — …` sibling rather than rewriting the morning's.
- **`docs/HANDOFF.md`** — prepend a new `## ⭐ Latest (YYYY-MM-DD) — <headline> [Claude Code]` section:
  current state, what shipped, verification line, and a **"Do next (pick up here)"** at the end. Demote the
  previous "Latest" by dropping its ⭐ (it stays, just no longer the star). HANDOFF is read-first; it must
  open on *this* session.
- **`docs/NEXT-STEPS.md`** — check off (`☑`) what landed, re-order what's now next, and refresh the
  **"Do next"** at the bottom. This is the ordered build plan; it should never describe finished work as
  pending.
- **Coherence sweep (CLAUDE.md "Disciplines"):** if a *locked decision* changed, update `docs/DESIGN.md`
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

`master` is the stable integration line — **never commit to it directly** (CLAUDE.md). The session's work is
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
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
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

Then report: branch, commit SHA, what was pushed, and the docs you touched — a one-paragraph close so the
next session (or the next Claude) can pick up cold.

## Notes

- **Be a guided ritual, not a runaway.** Show the branch name, the commit message, and the merge/push plan
  before executing the outward-facing steps. Adam may want to tweak the slug or hold at the branch.
- **Don't fabricate a clean close.** If tests are red, a doc is half-updated, or the diff is two unrelated
  things, say so plainly — surfacing it is the job, not papering over it.
- **Scope guard:** this is the Genesis repo only. If `pwd` isn't `~/Desktop/Work/projects/Genesis` (or its
  worktrees), stop — you're in the wrong place.
