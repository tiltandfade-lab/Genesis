# §7b Blind-Recognition Report — ROUND 2 (2026-07-03, on master `285f963`)

First formal run of the MODEL-GRAMMAR §7b loop. Two independent blind judges (fresh
agents, vision-only, forbidden from the key) read the round-2 captures: 4 top-100
sheets + the 16-cell pilot. Scored against `key.json` / `pilot-key.json`.
Round-1 baseline for comparison: near-total failure (humanoids = identical black
columns; quadrupeds = planks; colors crushed) — round-1 was never formally judged
because the albedo/assembly bugs made scoring meaningless.

## Pilot scores (Judge A; Judge B mistook the pilot for a sheet-1 duplicate — protocol
note added below)

| Cell | Truth | Read | Verdict |
|---|---|---|---|
| A1 | Wolf | "tan quadruped — beast" | FAMILY |
| A2 | Giant Spider | "plank/board (prop)" | MISS (split — director's read: clear spider; scale-sensitive) |
| A3 | Swarm of Rats | "ring of stones (prop)" | MISS |
| A4 | Gray Ooze | "stepped pyramid (structure)" | MISS |
| B1 | Specter | "translucent red-tinted ghost" | FAMILY-STRONG (best non-humanoid read) |
| B2 | Pseudodragon | "olive quadruped — beast" | FAMILY-partial (beast, not dragon) |
| B3 | Giant Bat | "elongated beast" | MISS (wings didn't read) |
| B4 | Blind Deep-Stalker | "red-topped totem/chest (prop)" | MISS |
| C1–C4 | Skeleton / Zombie / Goblin / Bandit | all "humanoid + color/accent notes" | FAMILY ×4 (zero species) |
| D1 | Ogre | "tall dark bulky — ogre-like" | NEAR-EXACT |
| D2–D4 | PC Fighter / Ranger / Wizard | "humanoid, gold accents" ×3 | FAMILY ×3 (no class read; gold light-wash flattens them) |

**Tally: ~1/16 near-exact · 9/16 family · 6/16 miss.** Species-level naming ≈ 0
across all 116 judged cells on the big sheets too.

## Convergent findings (both judges, independent)

- **WINS:** humanoid-family reads ~100% (was 0 in round-1) · beasts read as beasts ·
  the Specter's translucency reads "ghost" unprompted · Ogre near-named · figures are
  now differentiated by color/gear ("red scarf guy" vs "tan hood guy") — the round-1
  identical-black-columns failure mode is DEAD.
- **THE PROP-MISS CLUSTER (the headline problem):** five creature classes read as
  scenery, confidently — swarms → "campfire stone circle" (both judges, HIGH
  confidence) · oozes → "stepped pyramid/ziggurat" · Deep-Stalker-type aberrations →
  "totem/chest" · bats/winged → "plank/board" · some long quadrupeds → "crate on legs."
- **Humanoid sameness at ~100px:** family always lands, species never — "same guy,
  different scarves; I'd be asking the DM constantly" (Judge B).
- Back-mounted 2H weapons read as "backpacks" — acceptable adjacency; blade
  silhouette (L13) will sharpen it.

## Miss → fix map (the shape wave's priority order, tomorrow)

1. **Wings** (bat→plank): wing silhouette raised + attached membrane wedges (L13) —
   also clears the sheet-wide "plank" reads.
2. **Swarms** (→campfire): 12–20 varied elements, rat-wedge shapes not cubes,
   irregular scatter (queued density pass).
3. **Oozes** (→pyramid): L13 low-blob dome + drip tendrils.
4. **Aberrations** (→totem): L5 one-weird-idea per creature (eyeless head, tentacle
   fringe).
5. **Spider at cell scale**: arc the leg splay above the body line (reference #7).
6. **Humanoid species markers** (L8/L10/L12): skeleton = bone body + skull head +
   ribcage paint · zombie = lurch tilt + wound paint · goblin = 1.6× head + ear fins ·
   bandit = hood + dagger. Motif paint over new geometry.
7. **PC class reads**: palette separation per class + a fill-light floor (the gold
   wash currently flattens all three PCs into "gold humanoid").

## Protocol notes for round 3

Tell judges explicitly the pilot is its own 4×4 set, not a sheet duplicate. Consider
a third judge at the shape-wave gate. Score sheet-cells formally once species-level
reads start landing (cluster-level was sufficient at this stage).
