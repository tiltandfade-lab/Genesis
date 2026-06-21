---
type: design-doc
system: dnd5e
scope: dungeon-generator
status: active
version-current: 4.2
version-target: 5.0
tags:
  - dungeon
  - generator
  - design
  - topology
  - arcana-engine
---

# Dungeon Generator — Design Roadmap

> **Current Release:** v4.2 (2026-04-04) — Loot system rewrite, depth-aware magic item distribution, tier-aware budget aligned to DMG 2024. **Target:** v5.0 — feature parity with Urban + dungeon-native systems.
> This document is the single source of truth for what's been decided, what's been deferred, and why. See also: `Urban Generator — Design Roadmap.md` and `Arcana Engine — Master Design Doc.md`.

---

# I. What v4.2 Has

The dungeon generator is a complete, production-ready system. Key systems already working:

**Graph & Topology**
- 12 topology types with fallback chains
- BFS depth calculation driving loot distribution and room ordering
- Per-room notes + Canvas file with depth-positioned nodes
- Mermaid topology diagram in index note

**Encounter System**
- Weighted encounter type table (Dungeon Encounter Type)
- Full composition system with SLOT_MAP (Low/Mid/Boss CR)
- Discovery branch — Form × Content independent picks (~2,500 combinations)
- Lore branch — Content + Art linked at same table position
- Affinity system — boss and revelation filtered by threat profile tags

**Loot System (v4.2 — most advanced system in the engine)**
- Tier-aware budget (T1/T2) aligned to DMG 2024
- Depth-sorted magic item assignment — boss always gets top rarity, deepest non-boss rooms get next best
- Four rarity tiers: Common, Uncommon, Rare, Very Rare
- All rooms receive coin scaled to tier and depth
- Enemy encounters noted separately (coin + worn gear, no draw from magic budget)

**Room Generation**
- Area type with size preference filtering (small/medium/any per topology)
- Named door connections with type and state per exit
- Feature + Interactable Object per room
- Secret system (Type, Reveal Type, Payoff Size, Tier)

**Setup Identity**
- Dungeon Type, Origin, Skin, Art Motif + Modifier
- Threat Identity with Low/Mid/Boss pools, scale, and signs
- Dungeon Lore + Legend Distortion (myth seed + witness distortion)
- Rest Pressure

---

# II. Gap Analysis — v4.2 vs Urban v3.1

These are features urban v3.1 ships that dungeon v4.2 does not yet have. They are candidates for the next dungeon version.

## Missing Features

**Prep Roster** *(Urban v3.1 — highest priority)*
- NPC Roster — list all Social/Contact encounters with entity type, hook, blank name field
- Creature Roster — group all enemy stat blocks by creature name, show rooms they appear in, blank count column
- Battlemap Prep List — every combat room with scene/area type name and dims

*Note: dungeon equivalent of Battlemap Prep List is simpler than urban — every Enemy room is a potential battlemap, and the Area Type table already provides dims. The data is all there.*

**DM Briefing** *(Urban v3.1)*
- Urban generates a three-paragraph prose briefing (Scene / Situation / Texture) synthesizing the setup rolls into a readable summary
- Dungeon currently has only the setup table — no prose synthesis
- Dungeon briefing would have a different structure: Threat / Lore / Texture rather than Scene / Situation / Texture

**Quick Reference Tables footer** *(Urban v3.1)*
- Wiki-links to all tables used during generation, split into "At the Table" and "Optional Extras"
- Dungeon has 62 tables — needs curation to identify which are most useful mid-session vs. during prep

**Footer version stamp bug**
- Index note footer reads `v4.0` — needs to be updated to `v4.2`

---

# III. Open Design Questions

*These decisions need to be made before committing to the next version. Captured here so they don't get lost.*

## Dungeon Parity vs. Dungeon-Native Features

**Decision needed:** Does the next dungeon version target parity with urban v3.1 (add Prep Roster, DM Briefing, Quick Reference), or does it leapfrog to dungeon-native features that urban would never need?

Arguments for parity first:
- Prep Roster is immediately useful regardless of dungeon-specific additions
- DM Briefing is quick to add and high value
- Clean baseline before adding complexity

Arguments for dungeon-native first:
- The dungeon already exceeds urban in loot and affinity systems — continuing in that direction feels right
- Parity features are well-understood; dungeon-native features need design work that will take longer later

*Likely answer: parity features are fast enough to do alongside dungeon-native design. Not either/or.*

---

## Alert & Reinforcement System

The tables exist (`Dungeon Reinforcements.md`) but the system is not wired into the generator. This is a dungeon-native concept with no urban equivalent.

**Design questions:**
- How does alert propagate? Per-room (each enemy encounter raises alert level) or event-based (specific trigger types raise alert)?
- Does alert affect future room generation (e.g. reinforced encounters at higher alert) or is it purely a DM narrative tool?
- Should the generator pre-assign reinforcement triggers to specific rooms, or leave it as a mid-session roll?
- Alert levels: how many states? Simple (None / Alerted / Lockdown) or granular (0–3 like Heat)?

*The Heat system in urban is a good reference point — it works because it's simple, has clear states, and the DM understands what each state means at the table. Alert should aim for the same clarity.*

---

## Wandering Monster Tracker

Dungeon crawls have a classic wandering monster mechanic (typically a d6 roll every X turns). The generator doesn't currently output anything related to this.

**Design questions:**
- Should the generator produce a wandering monster table customized to the threat identity?
- Format: a small d6 or d8 table listing possible encounters, drawn from the threat pools?
- Does the wandering monster table interact with alert level (higher alert = worse encounters)?
- Or is this better left as a manual DM tool and out of scope for the generator?

---

## Secret System Integration

The generator rolls Secret Type, Reveal Type, Payoff Size, and Tier per room — but secrets are currently output as flat text in each room note. They aren't collected or summarized.

**Design questions:**
- Should secrets be collected into a **Secret Web** in the index note — a summary of all dungeon secrets, their locations, and their reveal conditions? This is the dungeon equivalent of the NPC Roster.
- A Secret Web helps the DM track which secrets the players have and haven't found, and which rooms to emphasize during narration.
- Implementation: identical pattern to Prep Roster — collect during generation loop, render as a table in the index note.

---

## Room-to-Room Narrative Flow

Urban has topology-aware segment labels (Opening, Lead, Hub, etc.) that give each segment a narrative role. Dungeon has topology types but rooms within a dungeon don't carry equivalent narrative labels.

**Design questions:**
- Should dungeon rooms have narrative labels derived from their topology position and BFS depth? (e.g. Entry, Transition, Depth Room, Boss Antechamber, Boss Chamber)
- Or is the loot depth system already implicitly doing this job (shallow rooms = low stakes, deep rooms = high stakes)?
- Risk: over-labeling dungeon rooms may conflict with the "sketch" philosophy — DMs should be able to use rooms however the fiction demands.

---

## Web App — Dungeon Map Renderer (decided 2026-04-12)

The web app will render dungeon rooms as a top-down SVG map using **Dagre + SVG + React**. Dagre positions rooms from the topology graph; SVG draws proportionally-scaled room rectangles with door-type markers on connections. Visual style is architectural/vector outlines — no textures, no tile-based rendering. Full technical design lives in `Arcana Engine Web — Product Design.md` §VI-A.

**Implication for vault generator:** The data the web renderer needs (room dims, topology edges, door types, encounter types, BFS depth) already exists in v4.2's generation output. No changes to the vault generator are needed to support the web map. The renderer consumes the same data objects the Obsidian Canvas builder currently uses.

**Implication for Room-to-Room Narrative Flow question:** The renderer will visually encode encounter type and BFS depth through icon markers and vertical position. This may reduce the need for explicit narrative labels — the map itself communicates pacing. Worth revisiting once the renderer prototype exists.

---

## v5.0 Scope

*To be defined after the above design questions are resolved. Likely contents:*

- [ ] Prep Roster (NPC Roster, Creature Roster, Battlemap Prep List)
- [ ] DM Briefing prose section
- [ ] Quick Reference Tables footer
- [ ] Footer version stamp fix (v4.0 → current)
- [ ] Alert & Reinforcement system (design TBD above)
- [ ] Secret Web in index note
- [ ] Wandering Monster table (decision TBD above)
- [ ] Dungeon-native encounter mix summary
- [ ] Name Bank (shared system with Urban — same skin-family pools)

---

# IV. Version History

## v4.2 — Loot System Rewrite (2026-03-30)
- Tier-aware loot budget aligned to DMG 2024 (T1/T2)
- Depth-sorted magic item assignment — deepest rooms first, boss always top rarity
- Four rarity tiers: Common, Uncommon, Rare, Very Rare
- All rooms receive coin scaled to tier and depth
- Enemy loot noted separately (coin + worn gear, no budget draw)
- Old Legendary/Outlandish tiers archived

## v4.1 — Discovery & Lore (2026-03-30)
- Discovery branch: Form × Content independent picks (~2,500 combinations)
- Lore branch: Content + Art linked at same table row position
- Scene d36 with 7 registers
- Rebalanced encounter type weights

## v4.0 — Graph-First Topology (2026-03-29)
- Full graph-first generation replacing sequential room building
- All 12 topology types with fallback chains
- Rooms generated as individual notes
- Canvas file with BFS-depth-positioned rooms and topology edges
- Two-pass generation (graph → population)

## v3.x — Pre-Graph Era
- Sequential room generation
- Basic encounter and loot tables
- Single-file output

---

*Design document for Arcana Engine v0.25 — Dungeon Generator branch.*
*Current: v4.2 (released 2026-04-04) · Target: v5.0*
