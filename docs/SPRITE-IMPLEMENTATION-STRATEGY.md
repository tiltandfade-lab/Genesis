---
type: system-spec
project: Genesis
status: LANDED 2026-07-12 — first engine seam
---

# Sprite implementation strategy

Every image-backed asset carries a categorical geometry strategy. The strategy is an engine
contract, not a filename convention, and is generated from the dressing manifest's semantic role.

| Strategy | Geometry | Use |
|---|---|---|
| `billboard` | Upright camera-facing polygon | Flora, floor clutter, focal cards, creatures, NPCs |
| `extruded-card` | Shallow wall-locked prism with art on the front face | Wall-hangs, signs, screens, paintings |
| `full-3d-prop` | Furniture/prop volume channel | Blockers, cover, and large objects with occupancy |
| `decal` | Flat surface-attached polygon | Blood, cracks, stains, tracks, breach residue |
| `layered-fx` | Transparent polygon layers | Spells, smoke, sparks, and realm transitions |

The current dressing generator emits the first three strategies. `wall-hang` maps to
`extruded-card`, `blocker` maps to `full-3d-prop`, and all other dressing roles map to `billboard`.
The runtime keeps a total-function fallback for legacy/projected entries.

Floors remain polygon meshes with procedural or authored materials; they are not sprite cards.
Creature sprites remain upright billboards and are size-scaled independently from dressing cards.
