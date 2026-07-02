---
type: system-spec
status: specced 2026-07-01 night — build-ready STRUCTURE (day-3/4, after COMBAT-TRACKER merges); ART waits on the STYLE-PROBES hybrid verdict (§II.0a discipline: no throwaway work either way).
created: 2026-07-01
related:
  - "[[COMBAT-TRACKER]]"
  - "[[MONSTER-TACTICS]]"
  - "[[COMBAT]]"
  - "[[STYLE-PROBES]]"
  - "[[REGIONS-NAMES]]"
  - "[[DESIGN-GUIDE]]"
---

# The Battlemap — 12 zones, spoken moves, an honest diorama

## §0. Adam's forks (2026-07-01)

| Fork | Call |
| --- | --- |
| Model | **B — the 12-zone model.** Position = band × lateral lane (`Melee/Near/Far/Distant` × `left/center/right`). The script owns positions; the diorama renders TRUTH, never decoration. Not a grid, not BG3 — FFT's legibility at theater-of-mind's speed. |
| Flanking | **Mechanized, one rule:** a melee attack with an ally in the target's zone = advantage. Script-checkable both directions (pack tactics becomes real; so does getting surrounded). No facing math, ever. |
| Input | **Verbal, with tap-sugar.** The player SPEAKS ("I circle left, put the boulder between us"); tapping a zone merely TYPES the words into the input ("I move to near-left") for the player to edit/send. Text is the medium; the open-handoff rule survives untouched. |

## §1. The model (extends `GS.combat`, minimally)

- Every combatant gains `lane: "L"|"C"|"R"` beside its `band` (PC starts `C`; foes placed by the
  encounter's composition — ambushers off-lane, hordes spread).
- **Movement:** 1 zone per move (band-step OR lane-step; diagonal = one move), 2 with Dash.
  The existing opportunity-attack rule (leaving the Melee band) is UNTOUCHED; lane moves within
  a band never provoke.
- **Terrain to zones:** at `combatStart`, the encounter's rolled terrain/cover features
  (wilderness-tactical-terrain, dungeon scene tags — already on the encounter object) are
  PLACED onto zones by the script (deterministic from the encounter roll). Cover is now "the
  rocks at near-left," mechanically: attacks crossing/into that zone take the existing cover
  modifiers.
- **AoE geometry (honest at last):** line = one lane across N bands · burst = one zone +
  orthogonal neighbors · cone = one zone + the two zones flanking it one band farther. The DM
  declares the shape; the script lists who's caught (no more freehand "it catches all of you").
- **The flank rule:** in `resolveAttack` (reconcile symbol), melee attack gains advantage when
  ≥1 non-incapacitated ally of the attacker occupies the TARGET's zone. Symmetric — monsters
  get it too (MONSTER-TACTICS' flank proposals now have a real payoff).

## §2. Parsing spoken moves

- New event **`move_zone {payload:{who, band?, lane?}}`** — the DM (or tactics engine/autoplay
  for foes) emits it; the script VALIDATES legality (≤ allowed zone-steps this turn; OA fires
  automatically on melee-band exit) and rejects illegal moves `{ok:false, reason}` — the DM
  narrates motion, the script owns the board.
- Player-side: their declared movement rides the normal turn text; the DM emits the matching
  `move_zone` (runbook line: never move the player without their words — the tap-sugar exists
  so the words are easy).

## §3. The render (evolves tonight's tracker panel — same panel, one more axis)

- The COMBAT-TRACKER band lanes become a **4×3 isometric platform grid** (CSS 3D transforms —
  DOM, inline-handler-compatible, no canvas, no module migration). Each zone: a flat-shaded
  tile; chips become standees at their zone; terrain features render as labeled markers v1.
- **Zone tap** inserts the movement phrase into the action input (never sends).
- **Style-gate:** v1 is flat-shaded CSS (asset-light). Post-probe, the low-poly tile sets drop
  in — **the REGION layer supplies the palette/biome tileset** (REGIONS-NAMES vector), standee
  art per creature type. The stage is built; the scenery arrives when the style verdict does.
- All COMBAT-TRACKER invariants carry forward verbatim: no foe HP/AC anywhere in the DOM;
  ally numbers open; death pips; round header.

## §4. Build + verify (day-3/4)

1. `lane` on combatants + placement at `combatStart` + terrain-to-zone placement.
2. `move_zone` validation + OA wiring + the flank rule in the attack path.
3. AoE zone-set helpers (`aoeZones(shape, origin, dir)`).
4. Panel: the 4×3 grid + standees + markers + tap-sugar.
5. Tactics-engine awareness: `proposeTactic` flank/ambush proposals target real zones.
6. Frontier prose: the DM movement register (§2 runbook line) + AoE declaration protocol.
7. `dev/verify-battlemap.mjs` (≥9/0): placement determinism from a fixture encounter · legal/
   illegal `move_zone` (2-zone move without Dash rejected) · OA fires on melee-band exit, not
   lane moves (mutation check: fire on lane moves, harness fails) · flank advantage exactly when
   an ally shares the target's zone, symmetric · AoE zone sets per shape · cover modifies
   crossing attacks · tap inserts text and never sends · foe HP/AC still absent from DOM ·
   regression: `verify-combat` + `verify-combat-tracker` counts unchanged.

## §5. Acceptance (felt)

A fight reads like a diorama and plays like a conversation: you SAY the move, the board obeys
the dice, the wolves visibly circle to your flanks and the advantage they get is the one the
rule computed. When the low-poly art lands, Genesis has its FFT moment — and not one rule will
need to change for it.
