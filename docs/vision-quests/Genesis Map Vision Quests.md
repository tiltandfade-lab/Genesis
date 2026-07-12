# Genesis — Map Systems Vision Quests

## Purpose

Genesis currently has several strong spatial primitives, but no complete map language across scales. The world has a node graph and lazy hex substrate; dungeons can become spatial floor plans; urban play has procedural walks and planned lazy districts; combat has a local tactical diorama. What is missing is the connective map layer that lets a player understand the scale of a place they have entered.

The goal is not to hand-author beautiful maps. The goal is to render the spatial consequences of the same seeded rolls that already generate the world, walks, districts, buildings, hazards, and encounters.

> Every scale of place gets a map, but only the scale required by the current decision is generated.

## Non-negotiable constraints

- Read the map as a projection of authoritative state, never as a second canon system.
- Prefer seeded dice-driven graphs over authored geometry.
- Generate lazily: world and settlement overviews first; districts, buildings, and sites on approach.
- Preserve node-graph cognition. The AI should receive relevant nodes and edges, not raw map geometry.
- Use one graph-to-layout family wherever possible.
- Let existing rolls provide names, roles, dimensions, hazards, factions, pressure, terrain, and access conditions.
- Never invent bespoke map pieces merely to make a location look complete.
- Re-entering a place must reproduce the same map unless a recorded world-state change modifies it.
- A map exists to support orientation, route choice, discovery, access, danger, and scale—not decoration.

## The map stack

| Scale | Map | Existing foundation | Missing projection |
|---|---|---|---|
| World | World atlas | Node graph + lazy hex substrate | Regions, routes, discovered places, fraying edge |
| Region | Regional travel map | Hex terrain + route geometry | Settlement clusters, crossings, landmarks, pressures |
| Wilderness | Local site map | Wilderness encounter + tactical-terrain footprints | Approach, obstacles, landmarks, exits, danger zones |
| Settlement | Town/city overview | Place tier + urban fabric/district minting | District nodes, gates, roads, landmarks |
| District | Neighborhood map | Urban walk generator + typed buildings | Street grammar, blocks, institutions, faction pressure |
| Interior | Building/dungeon plan | Building kits + dungeon graph spatializer | Shared multi-scale presentation |
| Complex | Dungeon/undercity overview | Dungeon topology graphs | Levels, vertical transitions, territories |
| Combat | Tactical diorama | Dimensions → 4×3 zones | Stable handoff from every local map |

## Shared map contract

Every map should be representable as the same conceptual structure:

```js
{
  scale: "world" | "region" | "settlement" | "district" | "site" | "interior",
  seed,
  nodes: [
    { id, kind, role, position, visibility, pressure, owner }
  ],
  edges: [
    { from, to, kind, travel, elevation, access, visibility }
  ],
  bounds,
  expansion: { generated: [], soft: [], locked: [] }
}
```

The generator rolls, in order:

1. A topology or spatial grammar.
2. Node count and node roles.
3. Edge kinds and access conditions.
4. Deterministic positions from the map seed.
5. Visibility and soft/locked expansion state.
6. Map-specific dressing from existing tables.

The renderer may show an atlas, street plan, layered diagram, or tactical scene. The engine still owns the same nodes, edges, rolls, and state transitions.

## Vision Quest 1 — The City Atlas

### Promise

When the party enters a major city, the city is not represented as one point on the world map. A generated civic skeleton unfolds: districts, major approaches, gates, roads, landmarks, and visible pressures.

### Procedural brief

- Settlement tier determines district count.
- Roll a city topology: radial, grid, riverbank, walled compound, terraced, irregular old city, or layered city.
- Place a central anchor: market, palace, temple, harbor, citadel, civic square, or impossible landmark.
- Place districts as nodes around the anchor.
- Connect districts with major roads, bridges, stairs, canals, or gates.
- Give each district a dominant faction, economic function, pressure, and one landmark.
- Keep buildings soft until approach or explicit generation.

### Scale guidance

City overview maps should communicate relative position and travel burden, not individual street geometry. A city should feel large because it has districts, competing routes, blocked access, and changing pressures—not because it contains hundreds of manually modeled buildings.

### Acceptance test

Two cities with the same tier and seed are identical. Two cities with different seeds visibly differ in structure. Re-entering does not re-roll. Entering a district expands only that district.

## Vision Quest 2 — The District Unfolds

### Promise

Selecting a district expands it into a persistent neighborhood map. The player learns the city by moving through a generated street grammar.

### Procedural brief

- Choose a street grammar from the district type and seed.
- Roll major streets, side lanes, public anchors, typed buildings, one shortcut, and one contested or inaccessible route.
- Use existing urban scene frames and building kits for semantic content.
- Let urban walks traverse this graph rather than float independently of it.
- Let faction pressure alter access, patrols, crowds, closures, and encounter bias.

### Important boundary

The district map is not a prebuilt collection of interiors. It is a persistent orientation layer. Buildings become detailed only when the player approaches them.

## Vision Quest 3 — The Road Has a Shape

### Promise

Travel across a region reveals more than an arrow from node A to node B. The player can see the regional shape: terrain, crossings, settlements, landmarks, and routes that have not yet been taken.

### Procedural brief

- Cluster nearby nodes around an established route or important settlement.
- Roll regional terrain identity and density.
- Add 1d4+1 nearby places, 1d3 major routes, and 1d4 minor routes or crossings.
- Use the wilderness generator for journey scenes; use the map for orientation and choice.
- Render unexplored terrain lazily from the existing hex substrate.

### Design rule

Do not turn the region into an Oregon-Trail tile crawl. The regional map is a decision surface for route, rumor, risk, and destination choice.

## Vision Quest 4 — Wilderness Sites Have Shape

### Promise

A forest clearing, mountain pass, ruined road, river ford, monster territory, or strange landmark can become a memorable local map without a hand-authored set piece.

### Procedural brief

Roll a small local feature graph:

- approach;
- obstacle or crossing;
- landmark;
- cover/concealment;
- danger or hazard zone;
- escape or alternate route.

Use wilderness tactical-terrain rows, rolled footprints, terrain biome, hazards, encounter type, and dimensions as inputs. Expand only when the party investigates, camps, fights, or must navigate the site.

## Vision Quest 5 — The Dungeon Has a Horizon

### Promise

Large dungeons, mines, ruins, towers, sewers, and undercities can show their broader structure before the party enters every room.

### Procedural brief

- Render the existing dungeon graph at a macro scale.
- Group rooms into levels, territories, or pressure domains.
- Show vertical transitions, blocked branches, faction boundaries, and known/unknown routes.
- Expand the current branch into the existing spatialized floor plan.
- Preserve the existing room dimensions and combat handoff.

The same principle should support “below the city,” “above the tower,” and “inside the mountain” without introducing a special handcrafted map type.

## Vision Quest 6 — Places Have Depth

### Promise

Vertical and nested places feel spatially coherent: towers, cliffs, terraces, bridges, sewers, floating districts, buried cities, and layered ruins.

### Procedural brief

Represent verticality as graph semantics first:

- destination;
- elevation band;
- travel cost;
- access condition;
- hazard;
- visibility.

The renderer can stack layers or show a side elevation. The engine does not need full 3D pathfinding or a new rules system.

## Vision Quest 7 — The Map Changes Because the World Changes

### Promise

Maps are not static illustrations. A closed gate, conquered district, collapsed tunnel, spreading faction, burned market, or opened bridge changes the map through recorded state.

### Procedural brief

Maps should react only to authoritative events:

- edge access changes;
- node visibility changes;
- ownership or pressure changes;
- route travel-time changes;
- destruction or construction;
- revealed secrets;
- new vertical connections.

Do not re-roll the map to create drama. Apply deltas to the original deterministic map.

## Recommended build order

1. Define a shared scale-aware map record and visibility rules.
2. Build the settlement overview renderer from existing district minting.
3. Add city/town topology rolls and persistent district positions.
4. Bind urban walks to district street graphs.
5. Add regional overview projection on top of the existing node/hex substrate.
6. Add wilderness site graphs from existing footprints and terrain rows.
7. Add dungeon macro-map and vertical-layer projection.
8. Add state-driven map deltas and map-to-combat handoff.

## Final test for every map idea

Ask:

1. What player decision does this map improve?
2. Which existing dice rolls provide its structure?
3. Can the map be rebuilt deterministically from seed plus canon deltas?
4. Does it expand lazily at the moment of need?
5. Does the AI need only a small node/edge digest rather than the map itself?

If the answer to those questions is no, the idea is probably a scene illustration or authored content—not a Genesis map system.
