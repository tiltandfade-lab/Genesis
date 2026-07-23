# AGENTS.md — Genesis (read this first)

You are working in **Genesis** — a standalone single-player TTRPG video game (roll a world into
being; an AI DM narrates; worlds persist in-browser). This file is the onboarding front door for
**any coding agent** (Codex, etc.). Claude Code reads `CLAUDE.md`; both files carry the same
operating contract — **`CLAUDE.md` is the authoritative, fuller version, so read it.**

## Read these, in order
1. **`CLAUDE.md`** (repo root) — THE operating contract: what this is, how to run it, the commands
   table, git workflow, the parallel-session discipline, disciplines, and gotchas. Read it fully first.
   *(Material-lane sessions: your brief is `docs/CODEX-MATERIAL-BRIEF.md`; the lane's source of
   truth is `docs/MATERIAL-LANE.md`.)*
2. **`docs/HANDOFF.md`** — current state + "Do next"; read at the start of every session to see where
   things stand and what's in flight.
3. **`docs/canon/README.md`** — the canonical front door (2026-07-22): the precedence law and the
   eight routed canon files. **"Where is the current ruling?" starts here, not with a corpus scan** —
   `canon/DOCUMENT-MAP.md` §1 routes every major topic to its single owning doc, and its census
   (§2-5) gives a one-line current/superseded/historical verdict for every design document, so a
   stale spec found by grep can never be mistaken for current truth.
4. **`docs/README.md`** — the full docs index + the `type:` taxonomy (which doc is which).
5. **`docs/ART-DIRECTION-CANON.md`** — MANDATORY before any art/sprite/prop/decal/texture
   generation or review: Adam's verbatim art direction. QUOTE it, never paraphrase it, in every
   generation prompt. Any art ruling Adam gives you in conversation must be appended to that
   file (dated) and committed in the same session — a chat that isn't captured there is lost.
   Deep authority: `docs/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md`; batch mechanics:
   `docs/FACETED-SHEET-TEMPLATE.md`.
6. The specific **`docs/<SPEC>.md`** for your task (specs are `status: SPECCED|BUILT`; execute a
   SPECCED one exactly unless capture evidence exposes a conflict with a canonical roll, a newer
   contract, or the accepted visual target; document the conflict before amending the spec).

## Codex art-direction lane
When Adam assigns Codex the art-direction lane, Codex is not a second implementation narrator for
Claude's work. It is the independent visual-acceptance owner for the graphics engine.

- Treat the accepted mock frames and vision-quest documents as quality targets. Green unit tests prove
  contracts; they do not prove composition, material response, sprite citizenship, or beauty.
- Read the actual walk/table fields that licensed a frame. Graphics remain a projection of canonical
  content: do not invent nouns, discard overloaded rolls, or replace the walk with an authored level.
- Inspect real captures at gameplay scale. Name systemic causes of a weak frame, then prefer renderer,
  projection, asset-contract, camera, light, and material corrections over one-off scene decoration.
- Challenge a `BUILT` visual milestone when its capture gate does not exercise the target it claims to
  unlock. Preserve the useful implementation, amend the acceptance gate, and record the remaining gap.
- Design for a no-human graphics pipeline. Every proposed effect needs a procedural rule, generated-
  asset contract, deterministic binding, fallback, budget, and executable or visual QA gate that an
  agent can reproduce.
- Coordinate shared-file edits through the worktree rules below, but retain independent taste and
  technical judgment. `CLAUDE.md` governs operations; it does not collapse Codex's art review into
  Claude's implementation perspective.

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

## Fast checkpoint vs. final close

- A **fast checkpoint** saves a coherent pause: reuse the current session worktree, run proportional
  checks, stage explicit paths, commit, and optionally merge locally when Adam authorizes it. Explicit
  "no CI/no push" wins. Do not invoke the full clean-close sweep; mark `FULL CI PENDING` for the later
  owner.
- A **final/evening clean close** invokes `genesis-clean-close`: run the full slow gate once, merge,
  push, and confirm GitHub CI.
- Never create a new worktree merely to checkpoint an existing lane. If a genuinely new worktree is
  required, use `GIT_LFS_SKIP_SMUDGE=1`; materialize only task-required LFS assets. Neither checkpoint
  nor final close inherently requires bulk LFS checkout.

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
