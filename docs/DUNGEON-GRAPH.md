# DUNGEON-GRAPH — marrying the walk topologies to a volumetric floor-plan engine

type: system-spec
status: SPECCED (Adam authorized BUILD ORDER 2026-07-10 PM — U1→U2→(U3∥U4); squeeze = geometry + a roll/DM hand-wave, no sprite; static figurines stand, but turn-based MECHANICAL REPOSITIONING of pieces as time passes is desired in-scene; end-of-day goal: battle scenes rendering in real dungeon rooms + loop testing)

## Verified anchors (orchestrator, 2026-07-10 PM — current tree)

- `src/engine/dungeon-walk.js:16` `DUNGEON_TOPOLOGIES` · `:477` `rollDungeonWalk`
- walk segment shape (id/num/label/isFinale/depth/exits[]/light): built in
  `src/engine/walk.js:593-625`; stored via `pn.segments` (`src/world/prep.js:670`)
- tray render seam: `src/world/render.js:543` (`trayFrom(...)` + `window.Theater.setBoard`)
- combat cell dims seam: `src/world/dm.js:2056` (exact geometry passed to combatStart as cellDims)
- billboards: `src/ui/theater-boot.js:2507` `buildSpriteBillboard`, `:3489` `nearestify`
- theater palettes/env: `src/engine/theater-data.js` (`THEATER_ENV_PALETTE` etc.)

## Why this is cheap: the graph already exists at runtime

The walk technology IS the dungeon graph. `src/engine/dungeon-walk.js` (owns
`rollDungeonWalk`, `DUNGEON_TOPOLOGIES` — the Dungeon Procedure v4.2 port) rolls one of
12 topologies (Spine/Branch/Cascade/Ruin/Loop/Hub/Stronghold/Figure-8/Convergence/
Onion/Web/Labyrinth-Fragment), and the walk store keeps the WHOLE graph: each segment is
`{ id, num, label, isFinale, depth, exits:[{targetId, num, label, isFinale}], light, … }`
— segments are nodes, exits are edges, `depth` is BFS-from-entry. Nothing needs
extracting; the spatializer consumes `walk.segments` as-is.

What's missing is the SPATIALIZER (graph → walkable cell-grid floor plan) and a
VOLUMETRIC interior renderer. The threejs-procedural-dungeon study (2026-07-10, MIT)
supplies both patterns; we delete its edge-invention stage (Delaunay+MST) because our
edges are authored by the topology roll.

## Laws (Adam 2026-07-10)

1. **TRUE-SCALE RENDER LAW.** Creatures render at `scaleVsHuman` (feet/5.5) true scale.
   Dragon size is a progression payoff. The old compressed tabletop scale is a legacy
   fallback view only.
2. **SCALE-DOMAIN RULE** (supersedes the draft "epic-space rule"). A room that merely
   fits its monster is a prison. When a large+ resident rolls, the dungeon scales AROUND
   it: the connected subgraph the creature inhabits (its **scale domain** — lair chamber
   + the corridors/rooms it patrols) is built at that creature's scale (door heights,
   corridor widths, ceiling implied by wall height). Human-scale and creature-scale
   domains join at explicit transition rooms (the squeeze, the great gate, the collapsed
   gallery). An apex resident of gargantuan+ may scale the ENTIRE dungeon.
3. **DISTANCE = DIFFICULTY.** Depth-from-entrance (`segment.depth`, already computed)
   drives danger, loot quality, and light. Dive shallow and exit safely, or pack hardy
   and go deep. Old-school honored: this game serves the dungeons AND the dragons —
   dungeon-crawl discipline is a first-class register, not improv garnish.
4. **VOLUMETRIC WALL LAW.** Interior architecture is real low-poly PRISM geometry —
   instanced boxes with height for walls, slabs for floors, real pillars — never
   textured flat planes. Volume is why the reference module reads well: prism faces
   catch light differently per side. PS1 grammar preserved: low poly counts,
   `nearestify()`d textures, quantized vertex-color lighting, fog. (This upgrades the
   engine's current billboard/flat-face habit — walls get thickness.)
5. **PROCEDURAL-FIRST.** Most places are never authored. Set pieces wait for a smarter
   placement algorithm; the Blender shell lane is FAR-FUTURE (parked). Near-term render
   beauty comes from better three.js technique (see U3 study card), not new DCC lanes.
6. **ADDITIVE RECOVERY (codex).** Sheets lost to codex session limits are recoverable
   from the session chat — codex can re-save already-rendered images. Recovered art
   enters through the standard §10b additive fold: worst case quarantined, best case
   bonus mood/expression variants.

## Shared data shape (new)

`SpatialPlan` — output of U1, input of U3/U4 (attached to the walk's prep-node overlay,
same home as `pn.segments`):

```
{ seed, topology, cellW, cellD,                    // GRID LAW: 1 cell = 5 ft
  cells: Uint8Array (VOID|FLOOR|WALL|DOOR|WATER),  // row-major cellW×cellD
  rooms: [{ segNum, segId, x, y, w, d,             // cell-space rect (or ellipse flag)
            depth, isFinale, role,                 // role from beat binding (U2)
            scaleDomain }],                        // 1.0 human | creature scaleVsHuman
  corridors: [{ fromSeg, toSeg, cells, width }],
  doors: [{ x, y, betweenSegs, heightScale }],
  domains: [{ scale, segNums, transitions:[doorIdx] }] }
```

## Build units (Sonnet-executable; branch per house rules; red-first in the jsdom harness)

**U1 — spatializer.** New `src/engine/place-spatialize.js` (classic script, register in
manifest.json; owns `spatializePlan`, `SPATIAL_CELL`). Input: `walk.segments` +
topology name + GRID-LAW dims per room size class. Deterministic from a seed derived
from the walk id (NO Date.now/Math.random un-seeded — replay law). Stages: per-topology
layout seed (Hub radial, Onion concentric rings, Spine linear-drift, Loop ring,
Web planarize-or-bridge — a crossing edge becomes a bridge/undercroft flag, verticality
is a feature) → room rect placement → AABB separation → corridor carve along EXITS ONLY
→ rasterize → BFS reachability verify from the entry segment → on fail, mutate seed and
reroll (≤5) then exit honest-fail (no hand-patched plans, ever).
*Acceptance:* all 12 topologies × sizes 3/6/12 segments produce verified plans, zero
unreachable floor cells, 100 seeds each; Hub renders radially (spoke angle spread
asserted); Web crossings emit bridge flags, never overlaps. *Red-first:* feed a Loop
graph, assert today there is no spatial plan surface at all.

**U2 — semantics + scale domains.** Extend the spatializer output: bind walk beats to
rooms (critical path entry→finale = the walk spine; dead-end pockets host optional
beats — HOOK-WALKS §4's parked branch-node idea gets its honest home HERE, as rooms you
can see and skip); difficulty bands from `depth` (encounter CR budget, loot tier, light
level); SCALE DOMAINS from rolled residents (law 2: domain subgraph at creature scale,
transition doors marked, apex-gargantuan+ may scale everything).
*Acceptance:* a rolled gargantuan resident yields ≥1 domain with scale ≥4.0 whose
chamber + patrol corridors all pass the fit test (room dims ≥ creature footprint +
2 cells fighting room); depth bands monotone non-decreasing along the critical path.
*Red-first:* roll a dragon lair today, assert the room footprint can't hold the sprite
at true scale.

**U3 — volumetric interior renderer.** Extend theater (`src/ui/theater-boot.js` lane):
new tray source kind `interior` (the PLACE-GEN §D unit-7 branch) consuming SpatialPlan.
One `THREE.InstancedMesh` per tile kind (floor slab, wall prism, doorframe, pillar) —
per-instance transform + vertex color; wall height × the room's `scaleDomain`; realm
tile-kit data object (floor/wall/trim textures from realm surfaces, fog color/density,
palette) per realm; sprites stay `nearestify()`d billboards at TRUE SCALE
(`scaleVsHuman`), colliding correctly with the plan's walls.
*Render-quality study card (one unit of R&D, timeboxed):* baked vertex AO (darken
wall-floor seams — the reference repo's biggest "looks good" trick), quantized/banded
lighting for the PS1 read, fog-as-palette (realm fog color pulls the whole frame
coherent), texel-density discipline (one texture scale across kit pieces). Deliver as
side-by-side screenshots for Adam's taste gate.
*Acceptance:* screenshot gate — a Hub dungeon at chrome + a Spine crypt at gloom read
as VOLUMES (Adam eyeballs); draw calls ≤ 1 per tile kind + 1 per sprite; 60fps at 80
rooms on the dev machine. *Red-first:* today `trayFrom` has no `interior` kind (grep).

**U4 — walk binding.** Room-enter == segment-enter: the EXISTING walk consumption loop
drives movement (WALK-CONSUMPTION unchanged — the cursor moves segment to segment; the
camera/party token moves room to room). `walk_complete` fires exactly as today. Combat
zone grids derive from the room's cells (the place-gen combat-from-cells seam already
landed). WIRING LAW: acceptance greps must show PRODUCTION callers (the tray render
path and the walk consumption path), not test harnesses.
*Acceptance:* a live dungeon walk consumed segment-by-segment moves the rendered party
through the plan; completing the finale room fires the standard `walk_complete`;
byte-gate on the walk store shape (no schema drift).
*Red-first:* consuming a dungeon walk today renders no interior.

**U5 (deferred, design lane) — living ecosystem.** Factions by depth band, predator/
prey from realm bestiary, restock/drift between visits. Not specced here; the corpus
(2,500+ tagged creatures) and the casting system are the enabling assets.

Unit order: U1 → U2 → (U3 ∥ U4) → U5 later. Mutation test: break the BFS verifier so it
always passes and confirm U1's acceptance catches an unreachable-room plan.

## Sprite-side dependency

True-scale render needs `scaleVsHuman` live in `data/sprite-registry.js` — that's the
pending fold of `corpus-sizing.json` + `v3-sizing.json` (regenerate, never hand-edit;
HANDOFF item 2). GUISE (docs/GUISE.md) rides the same fold.

## Open for Adam (red-pen surface)

1. U3 study card taste gate — which reference look wins (banded-light PS1 vs the repo's
   painted-miniature glow, adapted)?
2. Scale-domain transitions — squeeze rooms as player-visible fiction (crawl on hands
   and knees into the great hall) or pure geometry?
3. Build authorization + ordering vs the sprite-lane merge and round-3 codex wave.
