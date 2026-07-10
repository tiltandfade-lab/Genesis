# DUNGEON-GRAPH — marrying the walk topologies to a spatial floor-plan engine

type: system-spec
status: PROVISIONAL (Adam design session 2026-07-10 — rulings captured, build not authorized)

The walk technology already generates dungeon STRUCTURE as graphs — the Dungeon
Procedure v4.2 Generator (`Engine/01. _Templates/Dungeon Procedure v4.2 Generator.md`)
builds 12 named topologies (The Spine / Branch / Cascade / Ruin / Loop / Hub /
Stronghold / Figure-8 / Convergence / Onion / Web / Labyrinth Fragment), each with
min-segment counts and fallback degradation. The threejs-procedural-dungeon study
(2026-07-10) showed the missing half: a **spatializer** that turns a section graph
into a walkable cell-grid floor plan. This spec is the marriage.

## Rulings captured 2026-07-10 (Adam)

1. **TRUE-SCALE RENDER LAW.** Creatures render at true scale — feet/5.5 vs a human,
   per `corpus-sizing.json`/`v3-sizing.json` (`scaleVsHuman`). No engine does this;
   dragon size must not get lost. The old compressed tabletop scale (overlay `scale`)
   is deprecated as a *target*; it survives only as a fallback view where a scene
   physically can't hold true scale. Massive creatures are a progression payoff —
   players should eventually walk into rooms that contain something 6× their height.
2. **EPIC-SPACE RULE (place-gen adjustment).** If an epic monster rolls, the space
   must hold it: room/cell footprints derive from the rolled inhabitants' size bands
   (gargantuan ⇒ its chamber ≥ its footprint + fighting room; titanic ⇒ open-air or
   vault-scale). Place-gen gains a size budget input from the encounter roll.
3. **DRAGON GUISES (codify).** Dragon-grade entities can wear human form (or inhabit
   humans). Mechanically: one codex entity, multiple bound sprites — a `guiseOf` link
   between a true-form sprite and a humanoid sprite. Extends SPRITE-TAGS binding law:
   binding an entity binds its whole guise set; revealing the true form is a scene
   beat, not a new NPC. (Which entities get guises: dragons ruled; candidates beyond
   dragons await Adam.)
4. **DISTANCE = DIFFICULTY (adopted).** Depth-from-entrance is the difficulty dial —
   old-school, roguelike-wave-compatible. Shallow dives exit safely; going deep means
   packing hardy. Danger, loot quality, and light all key off graph depth.
5. **LIVING DUNGEON ECOSYSTEMS (direction).** With the creature/NPC corpus at scale,
   dungeon inhabitants become an ecosystem: factions by depth band, predator/prey
   chains from the realm bestiary, restock/drift between visits. Design lane opened,
   not specced.
6. **SET-PIECE POSTURE.** Most places are NEVER authored — the engine's job is
   beautiful procedural places. Set pieces need a smarter placement algorithm before
   they're used (wisely and beautifully, not sprinkled). Candidate lane: authored
   set-piece SHELLS built in Blender (Adam has new Claude+Blender environment
   tutorials; the parked Blender MCP lane is the tooling), dropped into generated
   frames at graph-chosen anchor rooms.

## Topology compatibility (v4.2 graphs × the spatializer)

The repo's pipeline is: scatter rooms → separate → **[Delaunay+MST to invent edges]**
→ carve corridors → rasterize to cell grid → BFS verify → decorate. For Genesis we
**delete the bracketed stage** — v4.2's topology builders already emit the edges; the
spatializer only *embeds* a given graph in 2D and carves it. That makes the two
systems compatible by construction: both speak nodes-and-edges.

| v4.2 topology | 2D embedding | notes |
|---|---|---|
| Spine, Cascade, Branch, Ruin | trivial | chains/trees always embed flat |
| Loop, Figure-8, Stronghold | easy | planar cycles; keep the loop visually round so it READS as a loop |
| Hub (wheel-and-spoke) | easy | radial layout seed — hub room center, spokes out |
| Convergence, Onion | moderate | Onion wants concentric ring layout; Convergence wants shared-terminus fan |
| Web, Labyrinth Fragment | hardest | may produce crossing edges; planarize or route the crossing as a bridge/undercroft (verticality as a feature, not a bug) |

Per-topology **layout seeds** (radial for Hub, concentric for Onion, linear-drift for
Spine…) replace the repo's random disc scatter, so the shape the walk-roller chose
stays legible in the rendered floor plan.

## Integration plan (build units, NOT yet authorized)

Core, built once (classic scripts, no ESM, per repo law):
- **U1 spatializer** — `src/engine/place-spatialize.js`: v4.2 graph + GRID-LAW dims →
  cell grid (FLOOR/WALL/DOOR), topology layout seeds, room separation, L-corridor
  carving, BFS reachability verify (reroll on fail, never patch). Pure data; no three.js.
- **U2 semantics pass** — depth-from-entrance per room; walk-beat → room binding
  (critical path = walk spine, dead-end pockets = optional beats); EPIC-SPACE budget;
  distance=difficulty bands feeding encounter/loot/light.
- **U3 render tie-in** — tray `interior` source kind (already spec'd in PLACE-GEN §D):
  InstancedMesh-per-tile-kind in theater-boot, existing `nearestify()` billboards,
  TRUE-SCALE sprite sizing from `scaleVsHuman`.
- **U4 walk binding** — walk segments map to rooms; the existing walk-consumption loop
  is unchanged (segment enter == room enter); `walk_complete` untouched.

Per ecosystem/realm, each a thin skin over the core:
- **tile kit** (floor/wall/door surfaces in realm finish) — data + a few textures;
- **inhabitant binding** (realm bestiary by depth band + faction seeds for the living
  ecosystem);
- **dressing profile** (REALM_PROPS by room role/depth).
Cost shape: the CORE is ~4 Sonnet build units (one orchestrated wave). Each ecosystem
after that is roughly one unit of data authoring — the long pole is ART (architecture
shell props were the #1 gap in PLACE-ASSET-QUEUE), not code.

## Open for Adam

1. Guise scope — dragons only, or a guise-capable class of entities (fey, fiends,
   cosmic arcana)?
2. True-scale fallback — when a titanic creature meets an interior, does the room
   scale up (EPIC-SPACE), the encounter re-roll, or the creature stay outside?
3. Set-piece Blender lane — revive the parked Blender MCP pipeline for environment
   shells? (Adam's new tutorial series is the trigger.)
4. Build authorization for U1–U4.
