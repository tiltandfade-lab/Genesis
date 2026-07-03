#!/bin/bash
# Genesis promotion ritual — moves the `play` branch (and the Genesis-play worktree that
# serves it on port 5175) forward to a new blessed-stable commit. See docs/RELEASE-CHANNEL.md.
#
# Worlds live in the browser, keyed by ORIGIN. Adam's real universe is http://127.0.0.1:5175 —
# so port 5175 must always serve a STABLE checkout, never whatever `master` happens to be mid-edit.
# This script is the only sanctioned way `play` moves. It is deliberately narrow:
#   · fast-forward only — never rewrites `play` history, never force-moves it backward or sideways
#   · gated on build/check-manifest.py passing on the CANDIDATE tree (not just the current one)
#   · leaves the actual "is this good to ship" call to Adam — it only enforces the mechanical gate
#
# Usage:
#   dev/promote-to-play.sh              # promote to current master HEAD
#   dev/promote-to-play.sh <commit-ish>  # promote to any commit/tag/branch (must be a play descendant)
#
# What it does, in order:
#   1. resolve the candidate commit (arg, default master)
#   2. refuse if candidate is not a fast-forward from play's current tip
#   3. check out the candidate DETACHED in the Genesis-play worktree (never touches the main tree)
#   4. run build/check-manifest.py against that checkout; refuse (and roll the worktree back to
#      play) if it fails
#   5. on success: move `play` itself to the candidate, land the worktree on the branch (not
#      detached), print what moved, remind to restart the play server
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLAY_WT="$ROOT/../Genesis-play"
TARGET="${1:-master}"

echo ""
echo "=========================================="
echo "  Genesis: promote-to-play"
echo "=========================================="
echo ""

cd "$ROOT" || { echo "ERROR: can't cd into repo root ($ROOT)"; exit 1; }

if [ ! -d "$PLAY_WT" ] || [ ! -f "$PLAY_WT/genesis.html" ]; then
  echo "ERROR: Genesis-play worktree not found at:"
  echo "  $PLAY_WT"
  echo "Set it up once with:  git worktree add ../Genesis-play play"
  exit 1
fi

# Resolve the candidate to a concrete commit hash (works for branch names, tags, short SHAs).
CANDIDATE="$(git rev-parse --verify "${TARGET}^{commit}" 2>/dev/null)"
if [ -z "$CANDIDATE" ]; then
  echo "ERROR: '$TARGET' is not a valid commit-ish in this repo."
  exit 1
fi

OLD_PLAY="$(git rev-parse --verify play 2>/dev/null)"
if [ -z "$OLD_PLAY" ]; then
  echo "ERROR: no local 'play' branch found. Create it once with:  git branch play master"
  exit 1
fi

if [ "$CANDIDATE" = "$OLD_PLAY" ]; then
  echo "play is already at $(git rev-parse --short play) — nothing to promote."
  echo "(Candidate '$TARGET' resolves to the same commit.)"
  exit 0
fi

# Fast-forward-only: candidate must be a DESCENDANT of play's current tip. If it isn't, moving
# play there would rewrite or diverge history — refuse rather than guess what Adam wants.
if ! git merge-base --is-ancestor "$OLD_PLAY" "$CANDIDATE"; then
  echo "REFUSED: '$TARGET' ($( git rev-parse --short "$CANDIDATE")) is not a fast-forward from"
  echo "play's current tip ($(git rev-parse --short "$OLD_PLAY"))."
  echo "This script never force-moves play. If you really mean to rewind or replace it,"
  echo "do that by hand and know what you're giving up."
  exit 1
fi

echo "Candidate: $TARGET -> $(git rev-parse --short "$CANDIDATE")"
echo "Checking build/check-manifest.py against that tree (via the Genesis-play worktree)..."
echo ""

# Guard: the play worktree should only ever be on `play`, detached-at-play, or detached-at-a-
# passing-candidate — never mid-edit. If it has local changes, something unexpected touched it
# (it's not meant to be a dev tree); refuse rather than clobber whatever that is.
if [ -n "$(git -C "$PLAY_WT" status --porcelain)" ]; then
  echo "ERROR: Genesis-play worktree has uncommitted changes. It's meant to be promotion-only —"
  echo "investigate before running this again:"
  git -C "$PLAY_WT" status --short
  exit 1
fi

# Step out onto the candidate, detached, so we can validate BEFORE play's ref actually moves.
if ! git -C "$PLAY_WT" checkout --quiet --detach "$CANDIDATE" 2>/tmp/promote-to-play-checkout.err; then
  echo "ERROR: couldn't check out candidate in the Genesis-play worktree:"
  cat /tmp/promote-to-play-checkout.err
  rm -f /tmp/promote-to-play-checkout.err
  exit 1
fi
rm -f /tmp/promote-to-play-checkout.err

if ! python3 "$PLAY_WT/build/check-manifest.py"; then
  echo ""
  echo "REFUSED: build/check-manifest.py failed on $(git rev-parse --short "$CANDIDATE")."
  echo "play was NOT moved. Rolling the Genesis-play worktree back to play ($(git rev-parse --short "$OLD_PLAY"))..."
  git -C "$PLAY_WT" checkout --quiet play
  exit 1
fi

echo ""
echo "check-manifest OK. Promoting play -> $(git rev-parse --short "$CANDIDATE")."

# Move play's ref and land the worktree ON the branch (not detached) in one step.
if ! git -C "$PLAY_WT" checkout --quiet -B play "$CANDIDATE"; then
  echo "ERROR: failed to move the play branch. Worktree may be left detached at the candidate —"
  echo "check 'git -C \"$PLAY_WT\" status' by hand."
  exit 1
fi

echo ""
echo "play moved:"
git log --oneline "${OLD_PLAY}..${CANDIDATE}"
echo ""
echo "  $(git rev-parse --short "$OLD_PLAY") -> $(git rev-parse --short "$CANDIDATE")"
echo ""
echo "Genesis-play worktree ($PLAY_WT) now checked out on play at the new commit."
echo ""
echo "If the play server (dev/serve-play.sh) or the bridge is already running on 5175,"
echo "RESTART IT — a running http.server/bridge process won't pick up the new files on its own."
echo ""
