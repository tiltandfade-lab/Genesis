# Genesis Map Vision Quest — Session Record

Date: 2026-07-12

## Repository safety status

No repository files were edited during this brainstorming session. Existing Genesis files were inspected read-only for architecture references. All generated images, briefs, and this record are contained in this desktop folder:

`/Users/adamstephenson/Desktop/map-vision-quest/`

## Vision explored

Genesis needs a coherent map language across scales while preserving its node-based, dice-driven, lazy architecture:

- world atlas;
- regional travel map;
- town overview;
- city atlas;
- district street map;
- wilderness site map;
- dungeon macro-map;
- building/interior map;
- layered and vertical maps;
- tactical combat handoff;
- state-changing maps;
- fog of war, purchased maps, rumors, and breach geography.

The unifying rule is:

> Every scale of place gets a map, but only the scale required by the current decision is generated.

## Core technical principle

Maps are projections of authoritative state, not a second geography system.

The engine should generate a plain serializable map plan from existing nodes, edges, dice rolls, terrain, walk segments, districts, dimensions, footprints, pressure, and access conditions. Three.js should render that plan using shared low-poly kits, instancing, simple lines/ribbons, procedural materials, and restrained lighting.

Existing architecture identified:

- `src/engine/hexmap.js`: deterministic lazy hex terrain, axial coordinates, node pinning, and route geometry.
- `docs/SPATIAL-MODEL.md`: node-graph cognition plus lazy hex substrate.
- `src/engine/walk.js`: urban walk nodes, exits, topology, rolled lighting, and encounter structure.
- `src/engine/dungeon-walk.js` / `src/engine/wild-walk.js`: dungeon and wilderness graph/scene sources.
- `src/engine/place-spatialize.js`: deterministic graph-to-cell-grid spatialization, topology layouts, corridors, and reachability verification.
- `docs/URBAN-FABRIC.md`: lazy district minting, soft buildings, contact locking, and tier-based district counts.
- `src/ui/theater-boot.js`: Three.js scene assembly, camera, fog, lighting, disposal, and interior presentation.
- `src/ui/theater-room-mesh.js`: pure room-shell compiler and geometry assembly seam.
- `src/ui/theater-materials.js`: deterministic procedural canvas textures.
- `src/ui/theater-shot.js`: camera/shot planning.
- `src/engine/breach.js` and `docs/BREACH.md`: breach dispatch, fray shift, sealed/unstable/stable persistence, stable map doors, and physics lenses.
- `src/world/render.js`: current map visibility and soft frontier rendering.

## Map concepts

### World and region

Use `hexmap.js` for lazy terrain and the existing node graph for places and routes. Show only the explored substrate, discovered nodes, and authorized claims. Regions can be projected around a focus node without becoming a hex-by-hex crawl.

### Town and city

Settlement tier determines district count. A seeded topology places districts around anchors; edges become roads, gates, bridges, stairs, or canals. Ordinary buildings are repeated instanced silhouettes. Typed buildings remain soft until approach; the active building expands through existing interior systems.

### District

Urban walk segments become street/scene nodes. Existing urban topology and walk semantics should feed a persistent district map rather than creating an unrelated city system.

### Wilderness site

Biome, tactical-terrain footprints, dimensions, obstacles, landmarks, hazards, and exits create a local site graph. The active site hands off to the existing 4×3 battlemap rules described in `docs/BATTLEMAP.md`.

### Dungeon and vertical maps

Render existing dungeon graphs as macro rooms, corridors, levels, faction territories, and vertical connectors. Entering a branch expands it through `spatializePlan`. Towers, sewers, undercities, cliffs, and layered cities use stacked graph groups rather than full bespoke 3D architecture.

### State-changing maps

A gate, bridge, district, shortcut, faction territory, or breach connection changes through recorded state deltas. Never reroll unrelated geometry when the world changes.

## Fog of war and knowledge

The current `mapVisibleIds` logic in `src/world/render.js` is intentionally broad: current node, seen nodes, soft rumors, setting/origin nodes, and known gazetteer names. Future map mechanics should distinguish world truth from player knowledge and map claims.

Recommended knowledge states:

- `unmapped`: no meaningful information;
- `rumored`: a possible destination or direction;
- `mapped-claim`: shown by a purchased or inherited map;
- `seen`: visually encountered;
- `visited`: physically entered;
- `surveyed`: deliberately measured or reliably mapped;
- `canon`: engine truth, not necessarily fully revealed to the player.

A map is a knowledge artifact, not a world-authoring command. Buying a map creates claims with provenance and confidence. It does not automatically create a hard world node.

Possible artifact shape:

```js
{
  type: "map",
  source: "cartographer" | "trader" | "royal-survey" | "rumor" | "breach",
  coverage: "site" | "region" | "settlement",
  accuracy: "low" | "medium" | "high",
  age: "current" | "old" | "ancient",
  claims: [],
  condition: "intact" | "damaged" | "forged"
}
```

Claims can be accurate, incomplete, stale, false, or locally precise but regionally vague. A purchased map can seed a soft frontier and bias procedural generation, but contact/travel must resolve the claim before it becomes canon.

## Breach map mechanics

Existing breach rules provide a clean geography boundary:

- sealed breach: the experience may remain an unverifiable story; do not treat it as ordinary geography;
- unstable breach: preserve a conditional edge whose return is a gamble;
- stable breach: `breachStableDoor` writes a map node/edge flag and makes the breach a revisitable canon connection.

Breach maps may show impossible, obsolete, rearranging, or realm-specific geography. They should carry source/realm/physics/stability metadata and bias entry or discovery without overriding `breachPersistenceRoll`.

## Rendering feasibility rules

- Engine modules remain Three.js-free.
- Use `THREE.InstancedMesh` for repeated buildings, trees, rocks, markers, and tiles.
- Use shared low-poly geometries and palette-keyed materials.
- Use `LineSegments`, thin ribbons, boxes, prisms, cylinders, and simple stacked groups.
- Use procedural textures only where they materially help; reuse `theater-materials.js`.
- Use the existing rolled-light seam and theater fog; keep dynamic lights in the single digits.
- Use HTML/DOM labels and accessible text, never baked text in generated images.
- Keep overview detail coarse; expand only on selection/contact.
- Use emissive material variants, dashed lines, marker opacity, and ghosted positions for claims and uncertainty.

## Proposed future architecture

Possible pure modules:

```text
src/engine/map-plan.js
src/engine/map-topology.js
src/engine/map-projection.js
```

Possible UI seam:

```text
src/ui/theater-map.js
```

Suggested flow:

```text
world truth + knowledge + map artifacts
        ↓
pure map projection / plan
        ↓
Three.js map group
        ↓
selection, expansion, fog, lighting, state overlays
        ↓
walk / travel / breach / combat handoff
```

## Safe brainstorming protocol while Claude is working

### Default mode: read-only ideation

The safest default is to tell Codex:

> “Read-only brainstorming. Do not edit the repo or worktree. Put all notes and generated images in `/Users/adamstephenson/Desktop/map-vision-quest/`.”

In this mode, Codex may inspect existing architecture, generate images, and create desktop documents, but should not:

- edit source files;
- run formatters or migrations;
- install dependencies;
- run commands that write build artifacts into the repo;
- stage, commit, switch branches, or push;
- move files into the repository.

### Keep the production session isolated

If Claude is in a long production or CI repair session:

1. Do not ask Codex to edit the same worktree.
2. Do not ask Codex to create branches or commits for brainstorming.
3. Keep all generated assets and notes in the desktop folder.
4. Use repo inspection only to reference actual architecture.
5. Treat the desktop folder as an inbox of proposals, not an implicit implementation queue.

### Promotion step

When an idea is ready for implementation, start a separate explicit task:

> “Promote only `MAP-VISION-QUEST-IMPLEMENTATION-GUIDE.md` section X into the repo. Inspect current branch state first. Do not touch unrelated Claude changes. Propose files and tests before editing.”

Promotion should be deliberate and scoped to named files or modules. The vision images should generally remain references unless the user explicitly requests an asset import.

### Handoff to Claude

Give Claude:

- the desktop folder path;
- the exact document to read;
- the specific vision quest or section to implement;
- permission boundaries;
- a request to inspect current branch/worktree state before changing anything.

Claude should convert the proposal into a plan, identify conflicts with active work, and implement only after explicit approval.

### Verification before promotion

Before anything enters the repository, require:

- a list of proposed files;
- confirmation that no current worktree changes will be overwritten;
- pure engine tests for determinism and non-mutation;
- renderer disposal/performance checks;
- explicit confirmation that map claims do not become canon accidentally;
- a browser/visual check after the mechanical tests.

## Bottom line

The safest long-running workflow is:

```text
Claude production worktree
        || isolated boundary ||
Codex read-only brainstorming folder
        ↓
vision + technical brief + reference images
        ↓ explicit promotion decision ↓
Claude implementation plan
        ↓ explicit approval ↓
small tested repo change
```

This preserves the speed of quick visual exploration without letting a brainstorming session mutate a live production repair.
