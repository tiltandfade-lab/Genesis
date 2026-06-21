---
type: readme
branch: Genesis
created: 2026-06-17
updated: 2026-06-21
---

# Genesis

A standalone single-player TTRPG video game. You **roll a world into being**, an **AI DM narrates**,
and worlds **persist forever** in the browser — only an explicit "destroy" unmakes one. Built *on*
the Arcana Engine (D&D 5.5e / SRD 5.2.1), but its own product.

The engine does the deterministic mechanical work — rolling, weighting, state — and the AI does only
the DM's interpretive job. The player rolls every die openly; the DM narrates *from* the results and
never fabricates them.

## Run it

It's modular now (`genesis.html` loads `data/*.js` + `src/*.js`), so `file://` won't work —
**double-clicking shows a blank page.** Serve over localhost:

```bash
# plain static server
python3 -m http.server 5175 --bind 127.0.0.1
#  → http://127.0.0.1:5175/genesis.html

# …or the DM Bridge, which serves the app AND the AI-DM mailbox (dev play loop):
python3 dev/dm-bridge.py
#  → http://127.0.0.1:5175/genesis.html   (see docs/DM-BRIDGE.md)
```

## What's here

- **The world genesis ritual** — roll a world skeleton (setting, senses, taboo, myth, a faction web
  + standing pressures as fronts), then explore: new corners roll into being only when you travel there.
- **The character creator ("the bardo")** — a guided spirit-guide passage: soul → sheet (species/class/
  background + open 4d6 scores) → skills / equipment / spells → origin feat → the XGE-style "This Is Your
  Life" backstory chain (which seeds the world with write-once canon).
- **Chat-first play** — the World view is the DM conversation, centered, with a left icon rail
  (Story · Character · Map · Ledger · Gazetteer · Powers) whose panels slide in beside the chat and
  reveal on first relevance. Creation fades into the DM's opening words.
- **The World State Ledger** — one append-only home for all change-over-time: clock, transitions, canon
  facts, spatial routes, faction clocks, life-events. A node-graph map grows where you walk.
- **The DM Bridge** (`dev/`) — a local harness that runs the app and an AI DM (Claude Code) together over
  a mailbox, exchanging a turn/response contract with typed `EVENT-CONTRACT` events the app applies through
  its own mutators. Dev/test only; the shipped DM reuses the same contract via an API call.

## Docs

All design docs and specs live in **`docs/`** (only this README + `table-registry.md` stay at root).

- **`docs/HANDOFF.md`** — read first: current state + what's next.
- **`docs/DESIGN.md`** — the locked-decision registry. Read before any design change.
- **`docs/NEXT-STEPS.md`** — the ordered build plan.
- **`docs/CHANGELOG.md`** — dated change log, newest first.
- **`docs/README.md`** — the full docs index + `type:` taxonomy.
- System specs: `NEW-GAME-FLOW`, `CHAR-CREATION`, `SPATIAL-MODEL`, `SPICE-CURVE`, `LOOT-REMAP`, and the
  advancement family (`EVENT-CONTRACT` / `ADVANCEMENT` / `DIFFICULTY` / `COMBAT`) + `DM-BRIDGE`.

## Working in this repo

`CLAUDE.md` is the operating contract (architecture, commands, disciplines, the git workflow). The short
version: classic `<script>` modules sharing global scope (not ES modules); `manifest.json` is the index —
run `python3 build/check-manifest.py` after any module edit; markdown tables are the editable source,
`tables.json`/`tables.js` are generated (never hand-edit); branch per task and merge with `--no-ff`.

*Private project. Separate from the human-DM Shifting Vale campaign, which lives outside this repo.*
