---
type: system-spec
status: BUILT 12-zone mechanics / SUPERSESSION REVIEW OPEN (the band×lane model below landed in `combat.js`, `combat-actions.js`, and `dm.js`; procedural-redesign Wave 10 section 11.6 is now evaluating exact `SpatialPlan` cells as battle authority. Preserve this model as current implementation and candidate fallback until Adam explicitly rules; do not extend it by convenience while the review is open.)
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
- **THE ROLLED ROOM IS THE MAP (Adam's grounding rule, 2026-07-01 late):** the walk rollers
  already roll REAL geometry — honor it, never invent over it:
  - **Extent from `dims`:** parse the segment's rolled dimensions (`"40' x 60'"`,
    `"50' x 120' irregular"`, `"15' x 50' gradual descent"` — tolerant parser, first two numbers
    win) → the zone grid DERIVES from them: **the 4×3 is the CEILING, not the shape.** Depth
    axis: 1 band per ~25 ft (a 20'×20' cell room = Melee+Near only; the 120' cavern opens all
    four). Width axis: 1 lane per ~20 ft, max 3. Unparseable/absent dims (open wilderness) =
    the full 4×3. A cramped room genuinely FEELS cramped — nowhere to be Distant.
  - **Features by footprint:** `wilderness-tactical-terrain` rows carry an explicit
    **Map Footprint column** + 2024-RAW impact (Half/Three-Quarters cover, difficult terrain,
    Lightly/Heavily Obscured, choke, squeeze) — parse footprint → zone occupancy (15'×15' ≈ one
    zone; 5'×5' = an in-zone obstacle marker granting its cover; "L-Shape"/choke = a lane
    blocker between zones). Dungeon `feature.dims` + area sub-features ("raised central dais…
    balcony at 12 ft") place the same way.
  - **ELEVATION is real (the FFT soul — and the tables already roll it):** dais/balcony/perch/
    terraces set a zone `elev` flag; melee from higher elevation vs lower = advantage (the
    terraced-steps rule generalized, one rule); perches take their rolled climb DC.
  - **Traps/hazards** (`dungeon-hazard`, wilderness hazards) anchor to a zone HIDDEN — rendered
    only once spotted/triggered (the DM holds placement via `dm`; the reveal is play).
  - Placement is DETERMINISTIC from the segment's rolls (seeded by segment id) — re-entering a
    room rebuilds the same board.
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

## §3b. Roller tweaks — help the rollers make better battlemaps (Adam's offer)

The wilderness tactical-terrain table is the EXEMPLAR (footprint + RAW impact per row — written
for this). Light normalization pass elsewhere, tagging-not-rewriting: **a `Map Footprint` column**
on the dungeon feature/hazard tables and urban scene frames where rows lack parseable geometry
(DM-only column, compiler carries it — the Legs/Pool precedent); area-type dims stay as-is (they
parse). Rows that gain footprints gain map presence; rows without stay narrative-only — graceful,
no row is ever blocked on the pass. This is a follow-up craft/tag unit, not a §4 blocker.

## §4. Build + verify (day-3/4)

1. `lane` on combatants + placement at `combatStart` + terrain-to-zone placement.
2. `move_zone` validation + OA wiring + the flank rule in the attack path.
3. AoE zone-set helpers (`aoeZones(shape, origin, dir)`).
4. Panel: the 4×3 grid + standees + markers + tap-sugar.
5. Tactics-engine awareness: `proposeTactic` flank/ambush proposals target real zones.
6. Frontier prose: the DM movement register (§2 runbook line) + AoE declaration protocol.
7. `dev/verify-battlemap.mjs` (≥12/0): placement determinism from a fixture encounter (same
   segment id → same board twice) · **dims parsing: "40' x 60'" → 2 bands × 3 lanes; a 20'×20'
   cell → Melee+Near × 1 lane; "50' x 120' irregular" parses; absent dims → full 4×3 (mutation
   check: break the dims derivation, harness fails)** · footprint → zone occupancy (15'×15' one
   zone; 5'×5' in-zone marker; choke = lane blocker) · elevation flag grants melee advantage
   downhill only · hidden trap zones absent from player DOM until revealed · legal/illegal
   `move_zone` (2-zone move without Dash rejected) · OA fires on melee-band exit, not lane moves
   (mutation check) · flank advantage exactly when an ally shares the target's zone, symmetric ·
   AoE zone sets per shape · cover modifies crossing attacks · tap inserts text and never sends ·
   foe HP/AC still absent from DOM · regression: `verify-combat` + `verify-combat-tracker`
   counts unchanged.

## §5. Acceptance (felt)

A fight reads like a diorama and plays like a conversation: you SAY the move, the board obeys
the dice, the wolves visibly circle to your flanks and the advantage they get is the one the
rule computed. When the low-poly art lands, Genesis has its FFT moment — and not one rule will
need to change for it.
