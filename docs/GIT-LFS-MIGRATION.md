# GIT-LFS migration runbook — one-shot, do at a QUIET moment

type: runbook
status: READY (Adam ruled LFS a priority 2026-07-10; do NOT run mid-wave)
updated: 2026-07-17 — GitHub retired LFS data packs; billing facts + sizes refreshed;
this migration now also serves THE COME-HOME DIRECTIVE (DESIGN.md 2026-07-17: repo returns
to the internal SSD; ≤2 worktrees law). Paths below predate the /Volumes/Genesis move —
substitute /Volumes/Genesis/Genesis for the dead Desktop path.

## Why

`.git` is ~6.1 GB as of 2026-07-17 (was 1.8 GB on 2026-07-10 — capture waves) and grows with
every sheet wave — git keeps every historical version of every PNG forever. LFS stores
pointers in git and blobs out-of-band; locally you keep only checked-out generations
(`git lfs prune` drops the rest). Fixes the growth curve; does NOT shrink the working tree
(checked-out PNGs stay real files; working tree ≈ 18 GB).

## Preconditions (ALL must hold — this rewrites every commit)

1. Every branch merged or intentionally parked AND pushed (`git branch -a` reviewed).
2. Exactly ONE session worktree + the repo root (`git worktree list`) — this is now also
   standing law (≤2 active worktrees, DESIGN.md 2026-07-17).
3. No live servers/sessions against the repo (sprite-review, dm-bridge OFF).
4. A same-day backup push of ALL branches to origin (`git push origin --all --tags`).
5. ~~GitHub LFS data pack ($5/mo)~~ **STALE — data packs retired.** GitHub LFS is now
   metered: every plan (Free and Pro identically) includes **10 GiB storage + 10 GiB/month
   bandwidth free**, overage billed per-GiB (pennies; see GitHub's pricing calculator).
   Our LFS store will likely start inside the free 10 GiB — expect $0; nothing to buy in
   advance. GitHub Pro ($4/mo) adds NO LFS quota — do not buy it for this. The remaining
   Adam-confirm gate is the force-push only (+ a billing-overage OK if the store ever
   crosses 10 GiB).

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
