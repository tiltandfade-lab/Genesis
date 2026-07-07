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
| run a dev DM session (AI DM over the bridge) | `python3 dev/dm-bridge.py` (serves the app **and** the mailbox); then `/loop` watch `.dm/` as the DM — runbook in `docs/DM-BRIDGE.md` |
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
- `docs/DESIGN.md` — the locked-decision registry (the index; specs hold detail).
- `docs/NEXT-STEPS.md` — ordered build plan; "Do next" at the bottom.
- `docs/README.md` — full docs index + the `type:` taxonomy.
- System specs (`type: system-spec`): `NEW-GAME-FLOW`, `CHAR-CREATION`, `SPATIAL-MODEL`,
  `SPICE-CURVE`, `LOOT-REMAP`, `TIER-SCOPE` (the level-10 cap), `ITEMS` (the type/instance split for
  gear — BUILT), and the advancement family `EVENT-CONTRACT` / `ADVANCEMENT` / `DIFFICULTY` / `COMBAT`.

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
