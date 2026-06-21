---
type: readme
branch: Genesis
created: 2026-06-17
updated: 2026-06-17
---

# Genesis

A persistent-universe solo RPG built on the Arcana Engine. Roll a world into being, live in it, let Claude DM. Worlds persist forever — only an explicit "destroy" unmakes one. Separate from and alongside the Shifting Vale campaign.

**Play:** double-click `genesis.html` (any browser, no server, no API credits for the rolling layer).

## Files

- `genesis.html` — the app (now modular; loads `data/*.js` + `src/*.js`, so run it over localhost — see `docs/HANDOFF.md`).
- **`docs/`** — all design docs, specs, and operational notes live here. See `docs/README.md` for the index.
- **`docs/DESIGN.md`** — canonical design doc (vision, locked decisions, solutions, cost model, open threads). **Start here.**
- `docs/GAP-ANALYSIS.md` — what persistence needs that the engine doesn't have yet.
- `table-registry.json` / `.md` — index of active engine tables (die, rows). The design spine. (Stays at root — build artifact, not a doc.)

## One-line status (2026-06-17)

Prototype playable (genesis ritual + persistent universe + gazetteer + fate-respawn + clipboard DM hand-off). Design phase ongoing — oracle "Fragment" layer, generator wiring, and the persistence gap list are scoped but not yet built. No build greenlit. See `docs/DESIGN.md`. *(This status line is stale — current state lives in `docs/HANDOFF.md`.)*
