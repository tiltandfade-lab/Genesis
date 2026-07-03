---
type: system-spec
branch: Genesis
status: implemented (v1)
created: 2026-07-03
---

# Genesis — Release Channels (Play vs. Dev)

**The problem:** Genesis worlds live in the browser's IndexedDB, keyed by **origin**
(`http://127.0.0.1:5175`, port and all). There's no separate "database" to point at a different
build — the origin *is* the universe. If the dev tree (mid-edit, sometimes red) serves on the
same port Adam's real save data lives at, an in-progress change can corrupt or desync a universe
he cares about. So the fix isn't code-level save-versioning — it's **never let the actively-
changing tree answer on the universe's port.**

## The two channels

| channel | port | serves | branch | worktree |
|---|---|---|---|---|
| **Play** | **5175** | a *blessed-stable* checkout only | `play` | `~/Desktop/Work/projects/Genesis-play` |
| **Dev**  | **5177** | whatever's being actively built | `master` / feature branches | the main repo tree |

**5175 is fixed and sacred** — it's where Adam's real universe already lives (`Open Genesis.command`
has served it there since before this split). Play inherits that port; Dev moves to 5177 instead
of the other way around, so nothing already saved has to migrate.

The **`dm-bridge` is also a valid play-channel server** when Adam's running a live DM session — it
serves the same static app (plus the turn/response mailbox) on whatever tree it's launched from.
`dev/serve-play.sh` detects a running bridge via its `/dm/health` route and defers to it rather
than fighting it for the port.

## What "blessed" means

A commit is safe to promote to `play` when: **(1)** `python3 build/check-manifest.py` passes on
it — mechanically enforced, `dev/promote-to-play.sh` refuses otherwise — and **(2)** it's been
through an actual played session (bridge or otherwise) with no P1s. (1) is the automated floor;
(2) is Adam's judgment call, not automatable — the script doesn't and can't check it.

## The promote ritual

```
dev/promote-to-play.sh              # promote play -> current master HEAD
dev/promote-to-play.sh <commit-ish>  # promote play -> any commit/tag/branch
```

Fast-forward only (refuses if the candidate isn't a descendant of `play`'s current tip — it never
rewrites or force-moves `play`). Gates on `check-manifest.py` against the *candidate* tree (checked
out detached in the `Genesis-play` worktree for validation, so the main tree is never touched).
On success it moves `play`, lands `Genesis-play` on the branch at the new commit, and prints the
one-line `old..new` log of what moved. **Restart the play server afterward** — a running
`http.server`/bridge process doesn't pick up new files from an already-open directory handle on
its own.

## Serving each channel

```
dev/serve-play.sh                                  # Play: Genesis-play worktree on 5175
python3 -m http.server 5177 --bind 127.0.0.1        # Dev: main repo tree on 5177
GENESIS_PORT=5177 python3 dev/dm-bridge.py           # Dev: bridge (app + mailbox) on 5177
```

`dev/dm-bridge.py` reads its port from the `GENESIS_PORT` env var (default 5175) — so a dev
bridge session never has to collide with Play; just set `GENESIS_PORT=5177` (or any free port)
before launching it. No code change needed, no separate dev-bridge script required.

**Launchers:** `~/Desktop/Launchers/Open Genesis (Play).command` opens Play on 5175 (the
`Genesis-play` worktree). The original `Open Genesis.command` still opens the dev tree on 5175 —
it predates this split and hasn't been re-pointed to 5177 yet; treat it as the dev launcher until
it is.

## Why not just branch-check-out in place?

Because port 5175 must never go dark or serve half-a-tree while the checkout underneath it
changes. A dedicated worktree means Play has its own working directory on disk at all times —
promoting never involves a `git checkout` that could race an open browser tab mid-request.
