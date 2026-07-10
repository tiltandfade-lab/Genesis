# GIT-LFS migration runbook — one-shot, do at a QUIET moment

type: runbook
status: READY (Adam ruled LFS a priority 2026-07-10; do NOT run mid-wave)

## Why

`.git` is ~1.8 GB and grows with every sheet wave — git keeps every historical version
of every PNG forever. LFS stores pointers in git and blobs out-of-band; locally you keep
only checked-out generations (`git lfs prune` drops the rest). Fixes the growth curve;
does NOT shrink the working tree (checked-out PNGs stay real files).

## Preconditions (ALL must hold — this rewrites every commit)

1. Every branch merged or intentionally parked AND pushed (`git branch -a` reviewed).
2. Exactly ONE session worktree + the repo root (`git worktree list`).
3. No live servers/sessions against the repo (sprite-review, dm-bridge OFF).
4. A same-day backup push of ALL branches to origin (`git push origin --all --tags`).
5. GitHub LFS data pack purchased ($5/mo, 50 GB) — the free 1 GB tier is too small
   for ui-sketches alone. Settings → Billing → Git LFS Data.

## The migration (~1 hour, mostly waiting)

```bash
brew install git-lfs && git lfs install

cd ~/Desktop/Work/projects/Genesis
git worktree remove .claude/worktrees/<session>   # down to root only, temporarily
git push origin --all --tags                       # backup FIRST

# rewrite history: all committed PNGs (+zips) become LFS pointers everywhere
git lfs migrate import --everything \
  --include="ui-sketches/sprite-sheets/*.png,assets/sprites/*.png,dev/sprite-sheets/**/*.png,dev/model-qa/**/*.png,dev/battle-gate/**/*.png"

git push origin --all --force                      # rewritten history replaces origin
git reflog expire --expire=now --all && git gc --prune=now --aggressive   # reclaim local
git lfs prune                                      # drop un-checked-out blobs
```

Then re-cut the session worktree from the new history. Old clones elsewhere (if any)
must be re-cloned, not pulled.

## After

- New sheets auto-track via `.gitattributes` (the migrate writes it — COMMIT it).
- `git lfs prune` occasionally (or `git config lfs.pruneoffsetdays 7`).
- Expected local effect: `.git` shrinks to a few hundred MB and stays flat;
  laptop only ever holds the current sprite generation + pointers.

## Who runs it

Claude runs it end-to-end with Adam present (the force-push + billing step are the two
Adam-confirm gates). Est. disk needed DURING migration: ~2× .git (temporary) — check
`df -h` first, want ≥5 GB free.
