# AGENTS.md — Genesis (read this first)

You are working in **Genesis** — a standalone single-player TTRPG video game (roll a world into
being; an AI DM narrates; worlds persist in-browser). This file is the onboarding front door for
**any coding agent** (Codex, etc.). Claude Code reads `CLAUDE.md`; both files carry the same
operating contract — **`CLAUDE.md` is the authoritative, fuller version, so read it.**

## Read these, in order
1. **`CLAUDE.md`** (repo root) — THE operating contract: what this is, how to run it, the commands
   table, git workflow, the parallel-session discipline, disciplines, and gotchas. Read it fully first.
2. **`docs/HANDOFF.md`** — current state + "Do next"; read at the start of every session to see where
   things stand and what's in flight.
3. **`docs/README.md`** — the full docs index + the `type:` taxonomy (which doc is which).
4. The specific **`docs/<SPEC>.md`** for your task (specs are `status: SPECCED|BUILT`; execute a
   SPECCED one exactly, don't re-litigate its decisions).

## Run it (never `file://` — it's modular)
Serve over localhost, then open `http://127.0.0.1:5175/genesis.html`:
```
cd "<repo>" && python3 -m http.server 5175 --bind 127.0.0.1
```
A live AI-DM session needs the **bridge** instead (`python3 dev/dm-bridge.py`) — see `docs/DM-BRIDGE.md`.

## Validate after ANY module edit (non-negotiable)
```
python3 build/check-manifest.py     # must end "RESULT: OK"
```
Then run the `dev/verify-*.mjs` harness for the surface you touched (jsdom; render/puppeteer harnesses
auto-skip without Chrome). Never hand-edit generated artifacts (`tables.js`/`tables.json`, `data/*.js`
that say GENERATED) — regenerate from source (`build/*.py`, the Engine markdown).

## THE ONE RULE THAT KEEPS MULTIPLE AGENTS SAFE (read CLAUDE.md "Parallel sessions")
Adam runs 2+ agent sessions at once. **One session = one git worktree = one branch. `master` is the
only shared surface.**
- **Never run a session in the shared root working tree, and never leave uncommitted code in it** —
  spin your own worktree: `git worktree add ../Genesis-<lane> -b <lane>/<slug>`.
- **Never `git add -A`** in a shared tree — stage explicit paths only (`git add <file> …`).
- **Serialize master merges:** `git fetch && git merge origin/master`, then merge your branch
  `--no-ff`, then push immediately. One session lands at a time.
- Commit your work when you pause — dangling uncommitted edits in root block the other session's merges.

## The docs map (all in `docs/`)
- `HANDOFF.md` — current state (read first) · `DESIGN.md` — the locked-decision registry ·
  `NEXT-STEPS.md` — the ordered build plan · `ARCHITECTURE.md` — the system map (the in-game Wiki
  source) · `README.md` — the index. System specs are `type: system-spec`.

## Lanes (so two agents don't collide)
Rough ownership (CLAUDE.md has the full list): **graphics/models** → `src/ui/theater-*`,
`src/engine/place-*`, `dev/model-qa/`, sprite/dressing pipeline; **engine/tables/NPC** →
`Engine/03. _Tables/`, `src/world/`, `src/engine/codex-roll*`. Cross-lane edits to the same file are
the flagged exception — coordinate + serialize.

**Do NOT touch** `~/Desktop/D&D/Obsidian Files/Shifting Vale/` or `Playtest Sandbox/` — a separate
human-DM campaign, out of scope for Genesis.
