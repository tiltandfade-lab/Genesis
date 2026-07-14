---
type: design-doc
system: dnd5e
scope: engine-wide
status: active
tags:
  - arcana-engine
  - design
  - product
  - web-app
---

# Arcana Engine — Master Design Doc

> **What this is:** The top-level design document for the Arcana Engine as a whole. Covers shared architecture, product vision, and web app strategy. Generator-specific design lives in the individual roadmaps.
>
> - Generator details → `Urban Generator — Design Roadmap.md`
> - Generator details → `Dungeon Generator — Design Roadmap.md`
> - Web app product → `Arcana Engine Web — Product Design.md`

---

## I. What the Arcana Engine Is

A procedural adventure generation system for D&D 5.5e. It produces **sketches** — coherent adventure shapes a DM can react to, reshape, and run. Not scripts. Not maps. Sketches.

The engine lives in an Obsidian vault and runs via Templater JS. It has no AI, no API calls, no per-generation costs. Everything is weighted random logic operating on hand-built tables. The intelligence is in the design of the tables and the topology system, not a language model.

**Current generators:**
| Generator | Current Version | Status |
|:----------|:---------------|:-------|
| Urban Procedure | v3.1 | Released — Prep Roster added |
| Dungeon Procedure | v4.2 | Released — Loot system rewrite |

---

## II. Shared Architecture

Both generators use the same core pattern:

```
1. USER INPUT      → Name, segment/room count, tier, topology
2. GRAPH BUILD     → Topology-specific node graph with structural labels
3. BFS ORDERING    → Depth calculation drives ordering, loot, pacing
4. NOTE GENERATION → Per-node: encounter, dressing, optional extras
5. INDEX ASSEMBLY  → Setup table, topology diagram, rosters, full scan
6. CANVAS OUTPUT   → Obsidian Canvas JSON, rooms/segments positioned by depth
```

**Shared utility functions** (identical or near-identical across generators):
- `readTable()` — parses pipe-delimited markdown tables
- `pick()` — random row selection with column extraction
- `pickFromPool()` — splits slash-delimited creature pools
- `rnd()` — single random array pick
- `weightedPick()` — weighted random from parallel weights/labels arrays
- `buildGraph()` / `bfsGraph()` — graph construction and traversal
- `safeFileName()` — strips illegal filename characters

**Shared design principles:**
- **Sketch philosophy** — output is a starting point, not a finished product. Every generator note has DM-fill blanks.
- **Spice Curve** — weighted probability curve on all tables. Low numbers = standard/usable. High numbers = volatile/mythic. DM internalizes once, works everywhere.
- **Pen-and-paper constraint** — every system must ultimately translate to physical dice. No computational logic that can't be replicated at a table.
- **Tier awareness** — all generators support T1 (Levels 1–5) and T2 (Levels 5–10). Different creature pools, magic availability, and encounter complexity per tier.

---

## III. Versioning Convention

Generators version independently. Urban is on a 3.x branch; Dungeon is on a 4.x branch. Version numbers reflect the generator's own maturity, not a shared system version.

A **major version** (x.0) signals a structural change to generation architecture (e.g. graph-first topology in Dungeon v4.0, feature-complete in Urban v3.0).

A **minor version** (x.x) signals a new capability layer added to the generator (e.g. Urban v3.1 Prep Roster, Dungeon v4.2 loot rewrite).

When the web app ships, generators will have a separate web version track.

---

## IV. Product Vision — Web App

**See `Arcana Engine Web — Product Design.md` for full detail.**

The goal is a browser-based version of the engine with no setup friction. DM opens a tab, fills four fields, gets a runnable adventure sketch. Freemium model.

**Key facts:**
- No AI, no per-generation API costs. Unit economics are excellent at scale.
- Core JS logic ports cleanly — Obsidian APIs are a thin wrapper over pure functions.
- Freemium gate: free tier uses reduced tables (Standard/Unusual bands only), T1 only, limited topologies, capped segments. Paid tier unlocks everything.
- Single product ("Arcana Engine") — Urban and Dungeon are generators within it, not separate products. Subscribers get all generators and all future generators.
- Launch sequence: Urban first (cleaner, further along in web-readiness), Dungeon as first major update. Each new generator added to the subscription is a retention event for existing subscribers.

**One product, not many** — this is the key strategic decision. A DM who runs both urban adventures and dungeon crawls (most DMs) should have one subscription that covers both. Separate products create upsell friction and split the audience.

---

## V. Open Engine-Wide Questions

*Decisions that affect both generators and need to be made before the web app port.*

**Shared systems:**
- [ ] **Name Bank** — both generators need NPC names. Should this be a shared pool per Environment Skin family (Urban + Dungeon skins grouped by cultural register), or generator-specific pools? Shared pools reduce content maintenance; generator-specific pools can be more thematically precise.
- [ ] **Encounter Mix Summary** — identical feature for both generators. Implement as a shared utility function that counts encounter types and renders the summary line. Should be coordinated rather than implemented twice independently.

**Web app architecture:**
- [ ] **Table format** — markdown tables (current) vs. JSON (web-native). Conversion is a one-time cost; JSON is faster to parse client-side and easier to bundle. Decision needed before web port begins.
- [ ] **Free tier table bundles** — how are reduced tables maintained? Options: (a) separate reduced JSON files maintained manually, (b) single full JSON with a tier flag per entry that the app filters client-side, (c) server-side filtering at request time. Option (b) is most maintainable — add a `tier: "free"/"paid"` field to table entries.
- [x] **Canvas replacement (decided 2026-04-12)** — Obsidian Canvas is replaced by **Dagre + SVG + React**. Dagre handles graph layout (node positioning, edge routing) from topology data; SVG renders rooms and corridors as React components. Dungeon generator renders rooms as proportionally-scaled rectangles with door-type markers. Urban generator renders segments as uniform nodes. Shared layout engine, generator-specific visual styling. Full technical design in `Arcana Engine Web — Product Design.md` §VI-A.

**Future generators:**
- [ ] What comes after Urban and Dungeon? Candidates: Wilderness/Overland, Naval/Sea, Political Court, Siege. Each would follow the same generator architecture and live under the same subscription.
- [ ] Should future generators wait for the web app, or continue to be developed vault-first and ported later?

---

## VI. Generator Status Snapshot

### Urban Procedure v3.1
**Roadmap target:** v3.5 (Pen-and-Paper Derivation)

| Version | Feature | Status |
|:--------|:--------|:-------|
| v3.0 | Feature-complete. Scene Frame d400, Optional extras, tier-aware magic | ✅ Released |
| v3.1 | Prep Roster (NPC, Creature, Battlemap) | ✅ Released |
| v3.2 | DM Prep Tools (Encounter Mix, Name Bank, Reward Summary) | 🔲 Designed |
| v3.3 | Play-Informed Calibration | 🔲 Pending play data |
| v3.4 | Campaign Integration | 🔲 Planned |
| v3.5 | Pen-and-Paper Derivation | 🔲 Planned |

### Dungeon Procedure v4.2
**Roadmap target:** v5.0

| Version | Feature | Status |
|:--------|:--------|:-------|
| v4.0 | Graph-first topology, all 12 topologies, Canvas output | ✅ Released |
| v4.1 | Discovery × Lore branches, Scene d36 | ✅ Released |
| v4.2 | Loot system rewrite, depth-aware distribution, DMG 2024 budget | ✅ Released |
| v5.0 | Prep Roster, DM Briefing, Alert system, Secret Web (scope TBD) | 🔲 Design phase |

---

*Master design document for Arcana Engine v0.25.*
*Updated: 2026-04-12*
