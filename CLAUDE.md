# CLAUDE.md — Genesis

Operating contract for any Claude working in this repo (Claude Code **and** the Cowork
`genesis` skill read this). Keep it short and current. Deep detail lives in `docs/` — this
file points there; it doesn't duplicate it.

## What this is

**Genesis** — a standalone single-player TTRPG video game. The player rolls a world into
being; an AI DM narrates; worlds persist forever in the browser. Built *on* the Arcana Engine
but is its own product. **Default context for all of Adam's D&D 5.5e build work** — operate
here unless told otherwise.

**Do NOT touch** the `Shifting Vale/` or `Playtest Sandbox/` vaults (at
`~/Desktop/D&D/Obsidian Files/`) — that's the separate human-DM campaign. Different toolset
entirely. (Genesis was relocated here from that vault on 2026-06-25; they are no longer siblings.)

## Run it

Modular now (`genesis.html` loads `data/*.js` + `src/*.js`), so `file://` won't work —
**double-clicking shows a blank page.** Serve over localhost:

```
cd "<repo>" && python3 -m http.server 5175 --bind 127.0.0.1
# → http://127.0.0.1:5175/genesis.html
```

(`~/Desktop/Launchers/Open Genesis.command` does this + opens Chrome.)

**Running a live DM session needs the BRIDGE, not the plain server above.** `python3 dev/dm-bridge.py` serves
the app *and* the `/turn`/`/response` mailbox routes the DM client calls — the plain `http.server` has neither,
so it'll serve the app fine but every DM turn fails as "bridge unreachable." See `docs/DM-BRIDGE.md`.

## Architecture (read `docs/HANDOFF.md` + `docs/SCALING.md` before editing code)

**Graphics sessions have an additional mandatory authority:** read
`docs/GRAPHICS-CONVERGENCE-CHARTER.md` before planning any theater, diorama, sprite, prop, material,
lighting, camera, VFX, or graphics-toolchain change. It protects the walk/table engine while requiring
measured convergence toward the approved mockups. Do not lower the visual target to close a unit.

- **Classic `<script>` modules sharing global scope — NOT ES modules.** The UI runs on inline
  `onclick="fn()"`, which needs functions global. ES-module migration is deferred (rides in with
  the eventual graphics engine). So: top-level `const`/`function` are intentionally global.
- **`manifest.json` is the index/spine** — every module's `id` / `path` / `owns` (single-source
  symbols) / `callTimeDeps` / `layer`. `loadOrder` = the `<script>` tag order in `genesis.html`.
- **All transient mutable state lives in one container, `GS`** (`src/state.js`, `var GS` so inline
  handlers reach it). The persistent universe `U` has its own accessor layer in `world.state`.
  **New mutable state goes in `GS`.**

## Commands

| do this | command |
|---|---|
| validate modules (run after ANY module edit) | `python3 build/check-manifest.py` |
| recompile tables (after editing Engine table markdown) | `python3 "Engine/00. _System/compile-tables.py" --emit` |
| regenerate the creator spell list | `python3 build/gen-spells-slim.py` |
| roll old CHANGELOG/NEXT-STEPS entries to their archives (run at session close) | `python3 build/archive-docs.py --check` → if over cap, `--emit` |
| run a dev DM session (AI DM over the bridge) | `python3 dev/dm-bridge.py` (serves the app **and** the mailbox); then `/loop` watch `.dm/` as the DM — runbook in `docs/DM-BRIDGE.md` |
| review sprites (tags · heads-line-up scale · pass/fail; writes the overlay directly) | `python3 dev/sprite-review.py` → http://127.0.0.1:5179/ ; "regen registry" in the UI folds rulings into `data/sprite-registry.js` |
| verify the DM bridge | `python3 dev/verify-bridge.py` (transport+contract) · `node dev/verify-dm-events.mjs` (applyEvent runtime, needs jsdom) |
| headless test | jsdom: load the real `genesis.html` with all modules in document order, drive the flow, assert. (`npm i jsdom` in a scratch dir, e.g. `~/.genesis-jsdom`; reinstall per environment.) |

## Git workflow (adopted 2026-06-21)

- **Never commit to `master` directly.** `master` is the stable integration line.
- **One branch per unit of work**, named `type/slug`: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Build + **verify on the branch** (the relevant tests green + `python3 build/check-manifest.py` OK
  after any module edit) before merging.
- Merge back with **`git merge --no-ff`** (every feature returns as one labeled merge commit — easy
  to see and revert a whole feature), then delete the branch.
- **Remote:** private GitHub repo (`origin`). Push the branch and `master`; back up often. A solo
  repo, so "review" = run `/code-review` on the branch diff before merging rather than a human PR.

## Parallel sessions (worktree-per-session — adopted 2026-07-08)

Adam routinely runs **two+ Claude sessions at once** (e.g. an NPC/engine session and a models
session). The one rule that makes that safe:

> **One session = one git worktree = one branch. `master` is the only shared surface. Never run two
> sessions in the same working tree** (the repo root included — treat root as nobody's agent
> workspace).

Worktrees isolate the *working tree*, so live file-stomping becomes impossible; collisions can then
only happen at merge-to-master, which is git's ordinary 3-way merge, not a surprise dirty file.

- **Spin a session:** `git worktree add ../Genesis-<lane> -b <lane>/<slug>` (e.g. `../Genesis-npc`,
  `../Genesis-models`), and run that session there. Prune with `git worktree remove` when done.
  `~/Desktop/Launchers/New Genesis Worktree.command` scaffolds one.
- **Ownership lanes** (declare who owns what so merges rarely touch the same files):
  models/graphics → `dev/model-qa/`, `src/ui/theater-*`, `data/realm-{props,surfaces,bestiary}`,
  model docs; NPC/engine/tables → `Engine/03. _Tables/`, `src/engine/codex-roll*`, `src/world/`,
  `tables.*`, NPC docs. Cross-lane edits are the flagged exception.
- **Never `git add -A` in a shared/root tree** — stage explicit paths (`git add <file> …`). A blanket
  add sweeps in the *other* lane's dirty files (the 2026-07-08 `humanoid.obj` slip).
- **Generated artifacts are never hand-merged** — `tables.js`, `data/table-{usage,atlas}.js`,
  `dm-contract.json`, `data/npc-role-skins.js`, and the `dev/gauntlet-*` reports. Don't commit them
  on a feature branch; **regenerate from source at the master merge**. Running test harnesses
  (gauntlets, compile) in a tree writes these — do it in your own worktree, and revert the report
  churn before staging.
- **Shared narrative docs** (`DESIGN` / `NEXT-STEPS` / `CHANGELOG` / `HANDOFF`) are the worst
  collision surface (both sessions append at close). Either write dated per-session sub-sections, or
  **defer all doc-registration to a single serialized integration close** after both sessions' code
  has landed. A spec that touches only *new* files (unique paths) never collides — prefer that.
- **Serialize master merges:** `git fetch && git merge origin/master` to get current, merge your
  branch `--no-ff`, push immediately. One session lands at a time.

## Disciplines (non-negotiable)

- **Edit-source → compile-artifact.** Markdown tables are the editable source of truth; `tables.json`
  / `tables.js` are *generated* — never hand-edit them. The engine does deterministic mechanical work
  (rolling/state); the AI does only the DM's interpretive job.
- **Run `check-manifest.py` after every module edit** and register new files in `manifest.json`
  (it fails on orphans, drift, a `loadOrder` entry with no `<script>` tag, missing paths).
- **Read the actual files before claiming a gap** — the engine keeps superseded versions; auditing
  a stale file produces false "missing" reports.
- **Validators preserve the thing's job — never satisfy one mechanically.** (2026-07-07, GPT
  round-2.) Once a gate exists (table lint, check-manifest, the drift guard, state-hygiene,
  rubric checks), the temptation is to make the artifact *pass* rather than keep it *true*: don't
  tag an exempt table with a row family, rename a column to appease a role matcher, or inflate a
  budget to green a scorecard. An untagged/exempt/red state that tells the truth beats a green
  that lies. If a validator and the thing's real job conflict, fix or scope the validator.
- **Normalization lives at the contract boundary, not in handlers.** Payload repair (aliases,
  numeric coercion, future type coercions) happens ONCE in `dmFoldPayload`/the `DM_EVENT_FIELDS`
  registry — never per-handler. A handler that hand-rolls its own coercion is a bug shape
  (the HQ2-1 class), even when its output is correct today.
- **Keep systems coherent in the same change:** when architecture/design changes, update
  `docs/DESIGN.md` (the decision registry) + `docs/NEXT-STEPS.md` + the Cowork auto-memory together.
  Drift is the enemy.
- **Adam's hand-authored tables + monster custom d10 tables are his** — propose + archive before any
  destructive edit; stat-fixes touch mechanics only.
- **DM-agency rules in play:** never roll the player's dice, never decide the PC's actions, the DM
  exerts will only through NPCs.

## Docs (all in `docs/`; only `README.md` + `table-registry.md` stay at repo root)

- `docs/HANDOFF.md` — read first; current state + what's next.
- **Graphics governing authority:** `docs/GRAPHICS-CONVERGENCE-CHARTER.md` — protected core, visual
  compiler boundaries, mockup requirements, convergence ladder, open-source adoption law, and the
  required Claude graphics-session protocol.
- Graphics research/tool execution: `docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` — pinned candidates,
  measured compatibility results, adoption/defer/reject rulings, and multi-agent execution gates.
- Graphics vision implementation note: `ui-sketches/mock-frames/vq-battle-scenes/CLAUDE-IMPLEMENTATION-HANDOFF.md`
  — the no-human-production bridge from the 20 VQ battle frames to the current theater engine.
- Walk-native graphics contract: `ui-sketches/mock-frames/vq-battle-scenes/WALK-NATIVE-DIORAMA-CONTRACT.md`
- Walk-wide card dealing, empty-room staging, lore spines, and secret networks: `docs/WALK-CARD-DEALING.md`
  — the walk segment stays canonical; dioramas are field-provenanced visual projections.
- `docs/DESIGN.md` — the locked-decision registry (the index; specs hold detail).
- `docs/NEXT-STEPS.md` — ordered build plan; "Do next" at the bottom.
- `docs/README.md` — full docs index + the `type:` taxonomy.
- System specs (`type: system-spec`): `NEW-GAME-FLOW`, `CHAR-CREATION`, `SPATIAL-MODEL`,
  `SPICE-CURVE`, `LOOT-REMAP`, `TIER-SCOPE` (the level-10 cap), `ITEMS` (the type/instance split for
  gear — BUILT), and the advancement family `EVENT-CONTRACT` / `ADVANCEMENT` / `DIFFICULTY` / `COMBAT`.

## Token discipline (session-start reading)

A single Read of a generated data file can cost a session millions of tokens — `tables.js` alone
is 7.3 MB (~2M tokens). `.claude/settings.json` hard-denies Read on the worst offenders
(tables.js/json, the bestiary/flavor/atlas data files, gauntlet reports, playtest-save states,
vendor/). Rules:

- **Never Read a generated artifact to "understand" it** — read the *source* (Engine markdown,
  build/gen-*.py) or `manifest.json`'s `owns` list. If you need a value out of one, `grep -m` it.
- **Orientation = HANDOFF.md + the specific spec you're working** — not DESIGN.md (134 KB) end-to-end
  (grep the spec name, read that section).
- **Sweeps go to Explore subagents**, and even they grep — never Read a whole big file.
- **CHANGELOG.md + NEXT-STEPS.md auto-archive** (Adam's ruling 2026-07-09): CHANGELOG keeps the
  newest 25 entries, NEXT-STEPS at most 4 dated `## Do next` blocks; older ones roll to
  `*-ARCHIVE.md` siblings. At session close run `python3 build/archive-docs.py --check` — if it
  complains, `--emit`. Archives are read-only history; never hand-edit or append to them directly.

## Gotchas

- **Scanned MM/DMG/PHB PDFs have broken OCR** — vision-read stat blocks; never trust their text
  layer for numbers. The **SRD 5.2.1 has a clean text layer** → that's the source for
  `Reference/SRD-Data/`. (PDFs are git-ignored: large + copyrighted.)
  **Persistent page indexes: `dev/model-qa/{mm,dmg,phb,tashas,xgte}-page-index.json`** (entry →
  printed page, integer `_pdfOffset` = PDF−printed; MM carries a `byBestiaryId` cross-map, PHB a
  spell cross-map vs SRD-Data, DMG a magic-item cross-map, Tasha's the sidekick-section detail,
  XGtE the name-table sub-pages) — jump straight to vision-reads; never re-derive a ToC.
- **`genesis.html` runs on INLINE table data** — it does not yet read `tables.json` at large; the
  Oracle tab reads compiled `tables.js`. Wiring the rituals off compiled data is Track B.
- **`tables.json`/`tables.js` are committed but generated** — never hand-edit; regenerate with the
  compile command above (edit the Engine markdown source, then recompile).
- **Levels 1–20 advancement data exists** — `data/class-progression.js` (generated by
  `build/gen-class-progression.py`; owns `CLASS_PROGRESSION`) holds PB / features (full SRD text) /
  spell numbers / resource scalers for all 12 base classes. Never hand-edit — regenerate. The L1
  creator data is still `data/srd-creator.js`.
- **THIS VERSION CAPS AT TIER 2 (levels 1–10) — see `docs/TIER-SCOPE.md`.** Leveling 1→10 is BUILT
  (`src/engine/advancement.js`: XP economy + `applyLevelUp`; the rest-gate is `passTime`). `LEVEL_CEILING`
  is the single un-cap point for the future T3/T4 expansion. T3/T4 loot/threat/CLASS_PROGRESSION L11–20
  are authored-but-inert (deferred); don't wire them. Interpretive level-up picks (spells/ASI/subclass)
  are DM-narrated in v1 (the in-app picker is a queued fast-follow).
