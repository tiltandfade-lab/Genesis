---
type: docs-index
branch: Genesis
created: 2026-06-21
---

# Genesis — Docs Index

All Genesis design docs, specs, research, and operational notes live in this folder
(`~/Desktop/Work/projects/Genesis/docs/`). Only `README.md` (the project front door) and
`table-registry.md` (a generated build artifact paired with its `.json`) stay at the repo root.

**Path convention:** file paths written inside these docs (e.g. `genesis.html`, `src/creator/bardo.js`,
`Reference/SRD-Data/spells.json`) are **relative to the Genesis repo root**, not to this `docs/` folder.
References to *other docs* are by name and resolve as siblings here.

## Genres (the `type:` frontmatter taxonomy)

**Decision log** — the registry of locked calls; the index of decisions, detail lives in the specs.

- `DESIGN.md` — every locked decision in a dated table. **Start here.**

**System specs** (`type: system-spec`) — normative "this is how the subsystem works." The buildable contracts.

- `NEW-GAME-FLOW.md` — the bardo / guided new-game passage.
- `CHAR-CREATION.md` — the two-layer character creation system.
- `SPATIAL-MODEL.md` — the lazy hex/node world-geometry model.
- `SPICE-CURVE.md` — the 5-band intensity ladder.
- `LOOT-REMAP.md` — the rarity-axis loot system.
- `TIER-SCOPE.md` — this version caps at **Tier 2 (levels 1–10)**; T3/T4 deferred to the expansion. The cap-enforcement layers + what's deferred-but-inert. (2026-06-26)
- `EVENT-CONTRACT.md` — the typed-event interface between the DM (narration) and the script (state). The spine the advancement/difficulty/combat specs all reference.
- `ADVANCEMENT.md` — the XP economy, thresholds, and rest-gated leveling (BUILT to L10 2026-06-26).
- `DIFFICULTY.md` — *(planned)* how the world calibrates and answers challenge: regional power bands, murder-hobo escalation, threat-signaling.
- `COMBAT.md` — *(planned)* the theater-of-mind / 5.5 combat engine (zone bands, cover from terrain specs).
- `DEATH-AND-REBIRTH.md` — the death loop: the 49-day bardo gap, the 14 vision-rolls against the dead PC's Saga, the corpse/loot decay, class-weighted faction proximity at creation, and the connected-plane (Universe v3) successor model.
- `DM-BRIDGE.md` — the local dev/playtest harness: Claude Code as the AI DM over a file/HTTP bridge (no API tokens), emitting `EVENT-CONTRACT` events the app applies. Makes the integrated loop actually playable in development.
- `CODEX.md` — *(spec draft 2026-06-24)* the relational entity layer: NPCs / Locations / Items / Factions as wikilinked records in `w.codex` (engine rolls the atoms, AI assigns meaning + links); prep casts the codex; the Start/End-Session frame. Born from the Saltrest playtest (the DM invented the whole cast because prep rolls the stage, not the players).

**Research / exploration** — thinking not yet promoted to normative spec.

- `STARTING-STATE-MODELS.md` — starting-state design research.
- `GAP-ANALYSIS.md` — what persistence needs that the engine doesn't have yet.

**Operational** — process and running state.

- `HANDOFF.md` — read first in a new session; orients you and links the rest.
- `NEXT-STEPS.md` — the ordered build plan; "Do next" at the bottom.
- `REAUTHORING-SWEEP-PLAN.md` (`type: build-plan`) — the executable two-lane plan for the table re-authoring sweep: recontext primitives + SRD lenses + creature scrub + monster wiring, split into autonomous-safe (overnight) vs. propose-and-wait (destructive) lanes. Companion to `TABLE-REAUTHORING-PREP.md` (the per-table flavor brief).
- `CORPUS-INTENSITY-MAP.md` (`type: generated-map`) — **generated** by `build/corpus-intensity-map.py`: every table scored for spice ceiling (explosive headroom) + floor (copy-paste/ungraded). The navigation surface for the whole-corpus craft pass. Re-run after edits.
- `REAUTHORING-RUBRIC.md` (`type: rubric`) — the shared standard for the craft pass: the quality floor + the explosive ceiling, benched on the corpus's own best rows, with the per-table working loop. Read with the map.
- `CHANGELOG.md` — dated record of changes, newest first.
- `SCALING.md` — the architecture/scaling audit + the "when to migrate" answer.

**Audit / scan**

- `GENERICIZATION-SCAN.md` — the IP-scrub record.
