# ROOM-SHELL COMPILER — cells → continuous architecture (the map-feel killer)

type: system-spec
status: SPECCED (Opus 4.8, 2026-07-11 — ELEVATED from GRAPHICS-NORTH-STAR Stage C to run right after
the A1/A2 foundation, on Adam's ruling "everything reads as a map that would roll in a walk." The
cell-prism geometry IS the map-feel; this is its direct fix. Implements the directive §4.1 nine-step
compiler. Runs after A1 (needs the active-room keep-set); consumes nothing from A3/A4. Grounded.)

> **Wave 4 authority note (2026-07-22):** this renderer/compiler projects an already-committed aperture. It does not
> decide whether a connection exists, what its endpoints/state/access/knowledge are, or how it mutates. Those
> semantic decisions belong to `procedural-dungeon-direction/wave-04/01-questionnaire-and-triage.md`.

Read with: `docs/GRAPHICS-NORTH-STAR.md`, `docs/STAGE-A.md`, the directive §4.1, target frames
`04-gloom-dungeon` (continuous ruin shell) + `12-gloom-octagon` (polygon shell + tiers).

## The problem (Adam, 2026-07-11)
The dungeon walk rolls a square cell-grid; the engine renders it as-is — **one unit BOX per cell**
(`interiorBuildInstancedMesh`, theater-boot.js ~3197: "a floor tile is an InstancedMesh box"; walls/
pillars/doorframes the same). Even one well-framed room reads as "a cell on a rolled map" because the
geometry is literally the grid. The target frames are continuous architectural shells — you cannot see
the cell origin. **The fix is to compile the active room's cells into continuous surfaces before
rendering, not to render the cells.**

## Scope of THIS unit
- Compile the **active room** (A1's single-room keep-set) into a continuous shell: one triangulated
  floor polygon (per elevation tier), continuous wall STRIPS from boundary segments (not per-cell
  boxes), beveled exposed edges, world-aligned UVs, darker riser side-faces for elevation changes.
- **Works on today's RECTANGULAR cell rooms** — that alone kills most of the map-feel (a rectangular
  room becomes one clean beveled stone shell with continuous texture, not a grid of boxes). The
  compiler accepts an ARBITRARY cell contour, so it is polygon-ready, but authoring true polygon/
  octagon rooms (the plan carrying a real polygon) is a SEPARATE later unit (GRAPHICS-NORTH-STAR C3);
  this unit compiles whatever contour the active room's cells describe.
- **Render-only.** The logical plan/cells are unchanged (mechanics/reachability/placement untouched).
- Keep the current per-cell `interiorBuildInstancedMesh` path behind a diagnostic flag
  (`ITR_ROOM_SHELL`, default ON) so the old render is one flag away during migration.

## The compiler (directive §4.1, nine steps) — new module `src/ui/theater-room-mesh.js`
`compileRoomShell(roomCells, opts)` where `roomCells` = the active room's walkable-cell set + its wall
ring (from `plan.cells` + the A1 keep-set), `opts` carries floorTop/wallHeightBase/tier data + the
texture/material selection the current build already computes.
1. **Contour** — extract the active room's walkable boundary via marching-squares / boundary-edge
   tracing → an ordered ring of grid-edge segments.
2. **Simplify** — merge collinear boundary segments (Douglas-Peucker-style), but PRESERVE door/aperture
   edges as their own segments (never simplify across an aperture).
3. **Floor** — triangulate the floor polygon; a SEPARATE polygon per elevation tier (dais/pit).
4. **Walls** — generate wall strips from the boundary segments (one quad-strip per simplified segment),
   NOT one box per wall cell.
5. **Apertures** — cut/segment wall geometry at door apertures (leave the opening; A1's portal card
   sits in it).
6. **Bevel** — a shallow bevel/chamfer on exposed floor, riser, wall-top, and tray edges (the
   miniature-shell read; also what P-2's/BW2's flush law wants).
7. **Risers** — vertical side faces for every elevation change, in a deliberately DARKER material
   variant (frame 19's dais/pit readability).
8. **World UVs** — world-aligned UVs so texture CONTINUES across adjacent surfaces instead of
   restarting per cell (the single biggest "not a grid" signal after step 4).
9. **Logical map** — keep a hidden cell↔triangle/segment map so placement, hit-testing, path display,
   and terrain mutation still resolve a logical cell to its compiled geometry.

## Architecture (mirror A2's pure-core + thin-THREE split for testability)
- Put the GEOMETRY MATH — contour trace, collinear simplify, polygon triangulation, world-UV
  assignment, cell↔triangle mapping — in **pure, THREE-free functions** (plain-Node testable, like
  theater-shot.js). The module may import THREE only for the thin `THREE.BufferGeometry` assembly from
  the computed vertex/index/uv arrays.
- `compileRoomShell` returns geometry data (positions/indices/uvs/normals per surface class: floor,
  walls, risers) + the logical map; a thin assembler builds the BufferGeometry + materials (reuse the
  current floor/wall material + texture selection — do NOT change materials here; that's Stage E).
- Register `ui.theater-room-mesh` in `manifest.json` + genesis.html (before theater-boot; theater-boot
  imports it) + the check-manifest LAYER.

## Wire-in (theater-boot.js)
At the interior build, when `ITR_ROOM_SHELL` is on, build the active room's floor/wall/riser from
`compileRoomShell(...)` instead of the per-cell `interiorBuildInstancedMesh` floor/wall pass. Pillars,
dressing, lights, standees mount unchanged (they read the logical cell map for positions). Shadows,
the post chain, camera all unchanged. Keep the old path behind the flag.

## Verify
`dev/verify-room-shell.mjs` — PURE part (plain Node): ⊗ RED-FIRST — a rectangular room's contour
traces to the expected simplified ring (4 long segments, not N per-cell edges); a door edge survives
simplification as its own segment; the floor triangulation covers the polygon (area check); world-UVs
are continuous across two adjacent wall segments (shared-edge UV continuity); the cell↔triangle map
resolves every walkable cell to a floor triangle. Determinism: same cells → same geometry.
`dev/verify-room-shell-render.mjs` or a capture (real Chrome): ⊗ wall geometry is O(boundary segments),
NOT O(wall cells) — assert the compiled wall mesh has far fewer primitives than the per-cell count
(the concrete "not per-cell boxes" proof); bevels present; risers darker; texture continuous (sample
across a wall seam — no per-cell restart). Regression: verify-dungeon-interior 287/0, verify-interior-
camera-frustum 14/0, and any placement/hit-test harness that reads cell positions (the logical map
must keep them valid). check-manifest OK.
**Visual gate:** shoot a before/after (per-cell prisms vs compiled shell) of a gloom + a chrome room;
the orchestrator READS them — the room must read as a continuous built shell, not a grid, and the
scene must stop reading as "a map fragment."

## Out of scope (later)
True polygon/octagon room authoring in the plan (C3); PBR shell materials + generated normal/roughness
(Stage E — the compiler just hands its surfaces to today's materials); terrain-change breach geometry
(Stage D, though the logical cell↔triangle map is what makes it possible later); interactable portals
in apertures beyond A1's dark card.

## Order
Launch after A1 lands (needs the active-room keep-set). Independent of A3/A4 (camera/occlusion) and the
lighting-close — but it touches theater-boot's interior build, so serialize its merge against A3/A4
(all touch theater-boot.js). Recommended: compiler → A3 → A4, re-gating the theater surface after each.
Re-shoot after it lands — this is the unit that should visibly move the "reads as a map" needle.
