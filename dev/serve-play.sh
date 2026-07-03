#!/bin/bash
# Serves the Genesis-play worktree on port 5175 — the PLAY channel. See docs/RELEASE-CHANNEL.md.
#
# Worlds live in the browser, keyed by ORIGIN, and Adam's real universe is http://127.0.0.1:5175 —
# so 5175 must always serve a STABLE checkout (the `play` branch via the Genesis-play worktree),
# never whatever the dev tree happens to be mid-edit. Dev work serves on 5177 instead
# (dev/serve-dev.sh conceptually — in practice `python3 -m http.server 5177` from the main repo,
# or the bridge on a dev port; see docs/RELEASE-CHANNEL.md).
#
# The dm-bridge (dev/dm-bridge.py) ALSO serves the app on 5175 by default when Adam is running a
# live DM session — the bridge IS a play-channel server in that case (it serves the same static
# files plus the turn/response mailbox). So: if something is already answering on 5175, this
# script does NOT try to bind a second listener — it checks whether that's the bridge and, if so,
# says so and exits cleanly. Only starts its own plain http.server if the port is truly free.
set -u

GEN_PLAY="$HOME/Desktop/Work/projects/Genesis-play"
PORT=5175
URL="http://127.0.0.1:${PORT}/genesis.html"
LOG="/tmp/genesis-play.log"

echo ""
echo "=========================================="
echo "  Genesis: serve-play (port ${PORT})"
echo "=========================================="
echo ""

if [ ! -f "$GEN_PLAY/genesis.html" ]; then
  echo "ERROR: Genesis-play worktree not found at:"
  echo "  $GEN_PLAY/genesis.html"
  echo "Set it up once from the main repo with:"
  echo "  git worktree add ../Genesis-play play"
  exit 1
fi

# Something already listening on 5175? Figure out whether it's the dm-bridge (which also serves
# the app + the turn/response mailbox — a live DM session IS a valid way to play) before deciding
# what to do. /dm/health is a bridge-only route (dev/dm-bridge.py) a plain http.server 404s on.
if curl -s -o /dev/null -m 2 "http://127.0.0.1:${PORT}/genesis.html"; then
  if curl -s -o /dev/null -m 2 -w "%{http_code}" "http://127.0.0.1:${PORT}/dm/health" | grep -q "^200$"; then
    echo "The dm-bridge is already up on port ${PORT} — play through the bridge, no second"
    echo "server needed. Open ${URL} in your browser."
    exit 0
  fi
  echo "Something is already serving port ${PORT} (not the dm-bridge)."
  echo "If that's a stale dev server or another app, stop it first — this script refuses to"
  echo "bind a second listener on the play port."
  echo "(If it's actually a healthy plain play server from a previous run of this script,"
  echo "you're already good to go: ${URL})"
  exit 0
fi

echo "Port ${PORT} is free. Starting a static server for Genesis-play..."
nohup python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$GEN_PLAY" > "$LOG" 2>&1 &
SRV_PID=$!
echo "Server starting (PID $SRV_PID). Logs: $LOG"
echo -n "Waiting for server"

for i in $(seq 1 30); do
  if curl -s -o /dev/null -m 1 "http://127.0.0.1:${PORT}/genesis.html"; then
    echo " ready."
    break
  fi
  echo -n "."
  sleep 1
done

if ! curl -s -o /dev/null -m 2 "http://127.0.0.1:${PORT}/genesis.html"; then
  echo ""
  echo "ERROR: server didn't come up within 30 seconds. Check the log: $LOG"
  exit 1
fi

echo ""
echo "Genesis-play serving at ${URL}"
echo "(branch: $(git -C "$GEN_PLAY" branch --show-current), commit: $(git -C "$GEN_PLAY" rev-parse --short HEAD))"
echo ""
