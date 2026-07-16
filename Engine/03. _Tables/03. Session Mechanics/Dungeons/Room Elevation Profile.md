---
id: room-elevation-profile
type: table
domain: Session Mechanics / Dungeons
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
---

# Room Elevation Profile — PROVISIONAL (Adam's draft, ELEV-1, 2026-07-15)

Rolled per room at walk time. Steps are 5-ft GRID-LAW quanta. A rolled row the room can't fit
walks down the table to the nearest fitting row (min-dims gate below); the roll stays canonical,
the walk-down is recorded (`degradedFrom`). Door-aperture cells and their inside neighbor always
stay tier 0 regardless of profile.

| d100 | Profile | Elevation Shape | Min Dims Gate |
|:--|:--|:--|:--|
| 01-40 | Flat | No elevation change; every cell sits at tier 0. | none |
| 41-55 | Dais | +1 step platform at the room's centroid; feature/centerpiece anchors on it. | ≥3×3 |
| 56-70 | Sunken center | −1 step depression at the room's centroid. | ≥3×3 |
| 71-80 | Split-level | +1 step across half the room; one stair/ramp cell joins the two halves. | ≥4 cells on an axis |
| 81-90 | Terraced | 2–3 steps of +1 climbing from one edge toward the other. | ≥4 cells on an axis |
| 91-96 | Gallery ring | Perimeter ring at +2, overlooking the center. | ≥5×5 |
| 97-100 | Chasm/shaft | −2..−3 cut through the room; a bridge or edge path crosses it. | ≥4 cells on the crossing axis |
^room-elevation-profile
