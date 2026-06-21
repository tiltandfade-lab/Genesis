# CLAUDE.md — Genesis

Operating contract for any Claude working in this repo (Claude Code **and** the Cowork
`genesis` skill read this). Keep it short and current. Deep detail lives in `docs/` — this
file points there; it doesn't duplicate it.

## What this is

**Genesis** — a standalone single-player TTRPG video game. The player rolls a world into
being; an AI DM narrates; worlds persist forever in the browser. Built *on* the Arcana Engine
but is its own product. **Default context for all of Adam's D&D 5.5e build work** — operate
here unless told otherwise.

**Do NOT touch** `../Shifting Vale/` or `../Playtest Sandbox/` — that's the separate human-DM
campaign. Different toolset entirely.

## Run it

Modular now (`genesis.html` loads `data/*.js` + `src/*.js`), so `file://` won't work —
**double-clicking shows a blank page.** Serve over localhost:

```
cd "<repo>" && python3 -m http.server 5175 --bind 127.0.0.1
# → http://127.0.0.1:5175/genesis.html
```

(`~/Desktop/Launchers/Open Genesis.command` does this + opens Chrome.)

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

## Disciplines (non-negotiable)

- **Edit-source → compile-artifact.** Markdown tables are the editable source of truth; `tables.json`
  / `tables.js` are *generated* — never hand-edit them. The engine does deterministic mechanical work
  (rolling/state); the AI does only the DM's interpretive job.
- **Run `check-manifest.py` after every module edit** and register new files in `manifest.json`
  (it fails on orphans, drift, a `loadOrder` entry with no `<script>` tag, missing paths).
- **Read the actual files before claiming a gap** — the engine keeps superseded versions; auditing
  a stale file produces false "missing" reports.
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
  `SPICE-CURVE`, `LOOT-REMAP`, and the advancement family `EVENT-CONTRACT` / `ADVANCEMENT` /
  `DIFFICULTY` / `COMBAT`.

## Gotchas

- **Scanned MM/DMG/PHB PDFs have broken OCR** — vision-read stat blocks; never trust their text
  layer for numbers. The **SRD 5.2.1 has a clean text layer** → that's the source for
  `Reference/SRD-Data/`. (PDFs are git-ignored: large + copyrighted.)
- **`genesis.html` runs on INLINE table data** — it does not yet read `tables.json` at large; the
  Oracle tab reads compiled `tables.js`. Wiring the rituals off compiled data is Track B.
- **`tables.json`/`tables.js` are committed but generated** — never hand-edit; regenerate with the
  compile command above (edit the Engine markdown source, then recompile).
- **Levels 1–20 advancement data now exists** — `data/class-progression.js` (generated by
  `build/gen-class-progression.py`; owns `CLASS_PROGRESSION`) holds PB / features (full SRD text) /
  spell numbers / resource scalers for all 12 base classes. Never hand-edit — regenerate. The L1
  creator data is still `data/srd-creator.js`. Next in the advancement track is the **XP threshold
  curve**, then leveling plumbing; see `docs/ADVANCEMENT.md` + `docs/NEXT-STEPS.md`.
