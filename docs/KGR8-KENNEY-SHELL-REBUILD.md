---
type: system-spec
project: Genesis
status: SPECCED — demolition landed 2026-07-17; shell rebuild next
created: 2026-07-17
consumer: Fable orchestrator + leaf executors; Adam's frame read is the only visual acceptance
depends_on: KENNEY-GRAPHICS-REPAIR-OPERATION (§15 acceptance law), DESIGN 2026-07-17 evening rulings
scope: dungeon interior shells rebuilt from Kenney modules; door law; room-shape constraint; void law
---

# KGR-8 — THE KENNEY SHELL REBUILD

## 0. Why this operation exists

A week of units polished contracts inside a frame that structurally forbade the picture Adam asked
for. The root conflict, named at last: **the any-polygon room-shape system and the square-module
Kenney kit are incompatible.** KS-3 tried to serve both by mixing kit modules with prism remainders
(sawtooth garbage); the repair operation responded by locking Kenney structure out entirely (old
D6), which guaranteed every frame stayed prism rooms with Kenney sprinkles. Adam's 2026-07-17
evening rulings (DESIGN.md) resolve the conflict by constraint, not compromise. The prism shell is
**condemned for dungeon interiors** — do not renovate it; replace it.

## 1. The four rulings (locked)

1. **All-Kenney shells.** Dungeon walls and floors build entirely from kit modules on the cell
   grid at quarter-turn orientations. **Whole-room claims only — a room is 100% kit or it does not
   use the kit at all. Mixing kit and prism pieces in one room is forbidden** (the KS-3 lesson).
2. **Rectilinear rooms only** while kit shells prove. Rooms compose from grid cells (rect, L, T,
   U). The spatializer constrains dungeon room shapes accordingly; octagon/diagonal shapes park
   until a kit technique for them exists. (Wilderness/settlement trays unaffected.)
3. **The door law.** A door is a flat leaf in the wall plane: 5 ft (1-cell) and 10 ft (2-cell)
   variants, plus a portcullis leaf (kit `gate-metal-bars` leaf geometry) in both widths. Zero
   proud surround — no gatehouse module, no jamb posts, no header band, no corbel arches, nothing
   above the wall line, nothing jutting into the room.
4. **Clean void beyond the active room.** Nothing renders past the active room's walls. Doorways
   read as dark openings (the portal card, which follows its wall's camera cutaway).

## 2. Demolition — LANDED 2026-07-17 (same evening, on the Ivory Pit fixture)

- Kit gatehouse door mount retired (`KIT_DOORS_ENABLED=false`; the `gate-door` asset is a wall
  module, not a door — mounting it inside our aperture double-framed every doorway).
- Jamb/header/arch-corbel doorframe prisms deleted. They also never received the camera-side
  parapet cutaway, so on near walls they stood full height in front of the lens — the "foyer
  column blocking the camera."
- Blocker nouns no longer render as generic untextured furniture prisms (the black slabs); they
  fall through to their own sprite art. Truthful 3D arrives per-noun via the registry only.
- Darkness portals now follow their wall's parapet cutaway (naked black monoliths on cut walls
  become knee-high dark stubs).
- Door leaf carries the sprite emissive readability floor (was rendering near-black).

Evidence: `dev/battle-gate/kgr7-walk-truth/kgr7-kgr8-demolition.png` vs `kgr7-after.png`, same
restored world.

## 3. The rebuild (next unit — the real work)

1. **Module census + calibration.** From `kenney-modular-dungeon-kit` (4.0→2.0, locked) and
   `kenney-mini-dungeon` (1.0→2.0, locked): wall, wall-corner, wall-opening/doorway, floor tiles
   and floor variations. Structural placement stays `{cell, orientationIndex 0..3}` (D3). Admit
   through the existing workbench/calibration/registry discipline — the KGR infrastructure is the
   toolchain this rebuild runs on (it was never wasted; it was aimed at the wrong target).
2. **Room compiler v2:** for each rectilinear room, emit a kit-module plan — floor tiles over the
   cell set, wall runs from wall modules, corners from corner modules, apertures from
   doorway/opening modules. Deterministic off the plan. If any cell of a room cannot be covered by
   an admitted module, the WHOLE room falls back to the prism shell (whole-room law) and the miss
   is logged loudly — coverage gaps drive the next calibration tranche, never mixing.
3. **Doors on the new shell:** aperture module + flat leaf (wood 5/10 ft, portcullis 5/10 ft).
   Leaf hinge behavior unchanged (the KGR-1 transform repair still owns detach math).
4. **Base/plinth:** the under-slab follows the floor silhouette exactly (the bounding-box slab
   under L-shaped trays dies with the prism compiler).
5. **Elevation reading:** the Chasm-Room pit and raised tiers render from kit layer/stairs pieces
   where admitted; until then a pit reads as depth (darkness gradient), never a bare hollow box.
6. **One camera-visibility authority:** a single helper decides "is this wall camera-side" for
   walls, portals, wall-hangs, wall-mounts, and wall-noun placement (today the engine's compass
   preference and the render's diagonal band can disagree — P2-D).
7. **Texture/variation pass rides the kit:** module variation (cracked/mossy floor variants, wall
   details) comes from the kit's own variant pieces, seeded per cell — this is where "the floors
   and walls are just the same boring texture" gets fixed, with assets, not shaders.

## 4. Acceptance

The Ivory Pit fixture (`kgr7-world-state.json`) re-rendered under the new shell, plus one freshly
rolled world, both through `capture-kgr7-walk-truth.mjs`. The gate is Adam reading the frames:
rooms that look like the kit built them, doors that are just doors, nothing between the camera and
the room, nothing floating, nothing hollow. Machine gates prove contracts only (§15 law).

## 5. Out of scope

Combat, elevation mechanics, non-dungeon environments, catalog bulk admission, outline/post
stacks, and any reroll/rewrite of canonical walk facts (unchanged law).
