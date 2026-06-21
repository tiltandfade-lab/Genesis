---
type: design-doc
branch: Genesis
status: canonical
created: 2026-06-19
related:
  - "[[DESIGN]]"
  - "[[STARTING-STATE-MODELS]]"
  - "[[genesis.html]]"
---

# Genesis — Spatial Model (canonical)

How geography works in Genesis. Extends the locked node-graph decision (`DESIGN.md` 2026-06-18) into a full spatial model: **node-graph cognition on a lazy hex substrate, unbounded fraying plane, travel as a wilderness-encounter series.** Decided with Adam 2026-06-19.

## The thesis it serves — anti-drift (the *why* of the whole app)

Genesis exists because **AI is excellent for one-shots but drifts over long campaigns**, and a player on a two-week binge is hyper-tuned to that drift. The fix is architectural, not a better prompt:

- **The deterministic state layer is authoritative; the AI is the interpreter, never the source of truth.** Facts live in the World State Ledger + node-graph + generators. The AI turns *current* state into prose. It may be forgetful or wrong and the world stays consistent, because canon lives in the state, not the model's context.
- **As much as possible is served by script** — state, geography, generators, rolls, clocks, canon. Default question for any feature: *"can the script own this?"* before *"let the AI handle it."*
- **Re-grounding is cheap, scoped, and constant.** Each beat the app serves the AI a small, relevance-scoped state digest (current node, adjacent nodes, active pressures, who's moving, the last few ledger entries) so it's continuously re-anchored without re-deriving or holding the whole world. Not "query everything" — serve the relevant slice, every beat. (The "hand to DM" clipboard is v1 of this; automatic per-beat injection is the long-term form.)

## Division of labor for space

| Script owns (deterministic, authoritative) | AI owns (interpretation only) |
|---|---|
| Hex terrain (`hash(seed,q,r)` → biome), node coordinates, routes/edges (write-once travel-time + bearing + leagues), the map render, distance, the wilderness-encounter sequence along a route, faction/threat positions as node movements | Narrating a place, a journey's encounters, an arrival — turning the served state into prose. Never holds geography; never the source of a spatial fact |

## The model: nodes on a lazy hex substrate

**Two layers, deliberately separate:**

- **Cognition layer = the node-graph** (built, Track A). Places = nodes; travelled routes = write-once weighted edges; movement is relational (node→node, with an ETA). *This is what the AI reasons in* — "the horde is at the Salt-Garrison, bearing NE, ~5 days out." Tiny, symbolic, cheap. The hex grid is never in the AI's context.
- **Substrate layer = an unbounded hex plane.** Terrain is a deterministic `hash(seed, q, r)` → biome, generated **lazily on approach** (Minecraft chunkgen), **never stored** (the save is seed + canon deltas) and **never loaded into the AI**. It exists to (a) draw a lookable map, (b) give rough geometry/distance, and (c) supply terrain to the encounter generator.
- **Nodes pin to hex coordinates** for rendering; the layout is *fit to the established routes* — **write-once travel-time/bearing canon wins over raw hex-distance**, so the map never argues with established facts (no paradoxes). Terrain decides what a place *looks* like; the node edge decides how far it *is*.

**Not a planet — an unbounded plane.** Simpler (no spherical wrap math) and more on-theme.

**The edge frays.** Coherence decays with distance from the lived-in center: far hexes trend Grounded → Strange → Volatile → Mythic and then break down. This is the **Spice Curve spatialized** — the world is solid where you've lived and dissolves at the unexplored rim. The literal edge *is* "the border of the world thins" (the Mythic external pressure, made a place you can walk toward).

## Travel = scene-to-scene, via the Wilderness Encounter Generator (not a hex-crawl)

Campaigns go scene to scene; the whole design is nodes. So travelling node A → node B is **not** Oregon-Trail tile-crawling — it's a **series of encounters** produced by the existing **Wilderness Encounter Generator** (richer flavor than rolling terrain squares). The hex substrate *feeds* it:

1. Script computes the route across the hex field → the **terrain/biomes it crosses** + the **distance**.
2. Distance scales **how many** encounters; terrain sets the **encounter context** (biome → which tables/flavors fire).
3. The **Wilderness Encounter Generator** produces the journey's encounter series deterministically.
4. The **AI narrates** each encounter as a scene.

So the hexes earn their keep — map picture + terrain input to a curated generator — without imposing hex-crawl play. Script owns the route, terrain, and encounter series; the AI only interprets.

## Persistence

Store the **world seed + canon deltas** (placed nodes, established routes/times, ledger facts). Never store the hex field — it's regenerated from the seed. The world stays a tiny save file, infinite but cheap.

## Revises / status

- **Revises** `DESIGN.md` 2026-06-18 "Spatial/map layer = primitive node-graph" → node-graph **cognition** + lazy hex **substrate** (unbounded fraying plane) + travel = wilderness-encounter series.
- **Built (Track A):** node-graph, travel, write-once edges, clock, primitive circular SVG render.
- **To build (later pass):** the hex substrate (terrain hash + render), node↔hex pinning + route-fitted geographic layout, the route→terrain→Wilderness-Generator→encounter-series wiring, the fraying-edge coherence gradient. Design captured here; not yet built.
