---
name: genesis-playtest-rig
description: >-
  Run the complete Genesis DM-bridge playtest rig in ONE session using background tasks: the bridge
  server in the background, the DM turn loop in-session (two-call protocol, lane obedience), plus the
  complaints catcher and the hotfix lane that used to need separate manual sessions. Use this whenever
  Adam says "let's playtest", "start the bridge", "run a live session", "DM for me", "bridge up",
  "playtest with combat", or wants any live bridge-run play — and proactively when a build lands that
  the docs say "gets felt in a live playtest". ONLY for the Genesis repo
  (~/Desktop/Work/projects/Genesis); for the Shifting Vale human campaign use arcana-playtest instead.
---

# Genesis Playtest Rig — bridge + DM + complaints + hotfixes, one session

Adam used to run three manual sessions (bridge, complaints catcher, hotfixes). This skill is the
one-session replacement: background tasks for the machinery, your foreground turns for the DM
seat. Read `docs/DM-BRIDGE.md` (the runbook — it is the authority; this skill is the checklist
that gets you into it) before your first turn.

## 0. Pre-flight (every time, ~1 minute)

```bash
lsof -nP -iTCP:5175 -sTCP:LISTEN            # anything on 5175?
curl -s -m 3 http://127.0.0.1:5175/state | head -c 80
```
- JSON back → a REAL bridge is already up; reuse it. HTML/error back → it's the plain
  `http.server` (the AGENTS.md gotcha — serves the app, eats every DM turn as "bridge
  unreachable"): kill it, start the real bridge.
- Start the bridge as a BACKGROUND task (never foreground — it blocks your turn loop):
  `python3 dev/dm-bridge.py` via Bash with `run_in_background: true`.
- `rm -f dev/.playtest-stop` (a leftover stop sentinel silently kills DM loops).
- **NEVER run `dev/verify-bridge.py` or `python3 -m http.server 5175` while a session is live**
  — verify-bridge resets the `.dm/` mailbox and eats pending turns (memory:
  genesis-bridge-playtest-gotcha).
- **Browser caching bites:** the python server sends no cache headers, so Chrome serves STALE
  JS after merges. Have Adam hard-reload (`cmd+shift+r`) — a plain reload is not enough. A
  mid-fight reload drops `GS.combat` by design (re-declare `combat_start` with survivors if the
  fight still matters).
- Budget pre-flight: a long session at ~2 calls/turn × expected turns vs the session limit —
  the 2026-07-02 overnight died at the ceiling mid-session.

## 1. The DM seat (you, foreground) — the two-call turn law

Every tool call you make is a ~10–15s round trip the player feels. The runbook's TWO-CALL
protocol is LAW (`docs/DM-BRIDGE.md` §two-call):

1. **Call 1 — WAIT + READ, one Bash command:** a foreground blocking until-loop on (new
   `.dm/turn-*.json` OR `dev/.playtest-stop`), timeout 600000ms; the SAME command cats the new
   turn file. Never end your turn "waiting" — an idle DM is a dead DM (twice proven).
2. **Compose in your head.** Zero intermediate calls. The full TurnResponse JSON exists before
   you touch the shell again.
3. **Call 2 — WRITE, one Bash command:** heredoc the response file + append the scribe line +
   append to the processed list.

Obey the turn's `lane` stamp: `fast` → compose lean (or delegate to a sonnet subagent per the
runbook); `deep` → full attention. Upgrade-only override. DM-agency laws hold absolutely: never
roll the player's dice (rollRequest instead), quote player dialogue verbatim, no 3-option
coaching, NPCs are your only hands. In combat, read `digest.combat` every turn — morale verdicts
are BINDING, tactic proposals advisory; the runbook's "Running a fight" section has the round
protocol.

## 2. The complaints catcher (background, replaces manual session #2)

Adam fires complaints mid-play (tagged 🔧 mechanical · 🎨 narrative · 📏 calibration · 🐞 bug ·
💡 system-idea). Capture WITHOUT disturbing play:

- Keep `docs/PLAYTEST-COMPLAINTS.md` on the `playtest/complaints` branch in its own worktree
  (`git worktree add ../genesis-complaints playtest/complaints` if absent) — the pattern exists
  precisely so logging never touches the live tree the bridge serves.
- When a complaint arrives in chat, append it there in the same turn you answer (one entry:
  timestamp, tag, verbatim complaint, your read, disposition). Newest at top. Commit on that
  branch at session end; triage rows point complaints at their target doc/spec/memory.

## 3. The hotfix lane (background, replaces manual session #3)

A 🐞 that blocks play gets fixed DURING the session — with discipline, because the bridge serves
the live working tree:

- Spawn a background executor (Agent, `model: "sonnet"`, `run_in_background: true`,
  `isolation: "worktree"`) with a tight brief: the bug, the repro, the ONE file scope, "commit
  on `fix/<slug>`, do not merge."
- You keep DMing while it works. When it reports: re-gate yourself (manifest + the relevant
  harness — NOT verify-bridge), merge `--no-ff` to master, then cherry-pick INTO the live tree
  only between turns, and tell Adam to hard-reload. If the fix can wait for session end, let it
  (a mid-session live-tree change risks the running game; the 2026-06-30 stash-discipline
  incident is the cautionary tale).
- State surgery on the running game (reconciling a sheet the narration contradicted) goes
  through `applyEvent` in the browser console or a DM event — never hand-edit localStorage.

## 4. Session close

1. Touch `dev/.playtest-stop` (stops any DM loop cleanly).
2. Scribe + findings: append the session's findings file (`dev/playtest-findings-<slug>.md`,
   SD-numbered, the shakedown file is the format model).
3. Commit the complaints branch; land any parked hotfixes.
4. `/genesis-clean-close` for the docs/merge ritual. Leave the bridge running ONLY if Adam says
   he'll keep playing; otherwise kill the background task.
5. Playtest learnings that changed how you DM → the auto-memory (feedback-dm-* pattern), not
   just the findings file.
