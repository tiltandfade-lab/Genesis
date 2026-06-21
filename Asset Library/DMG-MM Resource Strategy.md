---
id: dmg-mm-resource-strategy
type: manual
domain: Misc
status: source
---

# DMG & MM Mining Guide  
> Purpose: Extract structured systems for NPC generation, Adventure scaffolding, and Regional Monster ecology.  
> Scope: RAW 5e stability. No homebrew mechanics. Reskin, do not rewrite.

---

# 📘 Dungeon Master’s Guide — Sections to Mine

## I. NPC Infrastructure (High Priority)

**Chapter 4 – Creating Nonplayer Characters**

Extract:
- NPC Role tables
- Occupations
- Personality traits
- Bonds / Flaws
- Villain Schemes
- Villain Methods
- Villain Weaknesses
- Adventure Hooks by villain type

Implementation Rule:
1. Generate personality and motive from DMG tables.
2. Attach to an existing Monster Manual humanoid stat block.
3. Do NOT create new stat blocks unless absolutely required.

Output Template:
- NPC Name
- Role
- Motivation
- Secret
- Attached Stat Block
- Faction Alignment

---

## II. Adventure Construction (Structural Backbone)

**Chapter 3 – Creating Adventures**

Mine:
- Adventure structure types (Location-based, Event-based, Mystery, etc.)
- Goals
- Complications
- Twists
- Climax patterns

Create:
- Adventure_Shell_Template.md
- Faction_Arc_Template.md

Goal:
Procedural scaffolding that prevents improvisation from becoming chaos.

---

## III. Wilderness & Regional Pressure

**Chapter 5 – Adventure Environments**

Extract:
- Wilderness travel procedure
- Navigation checks
- Foraging rules
- Weather systems
- Random encounter pacing
- Environmental hazards

Use for:
- the Drowned Marsh swamp pressure
- coastal mountains travel
- Resource attrition systems
- Regional danger scaling

---

## IV. Between Adventures (3-Player Stability)

**Chapter 6 – Downtime**

Extract:
- Downtime activity templates
- Lifestyle costs
- Carousing outcomes
- Crafting rules
- Training rules

Purpose:
- Spotlight balance
- Economic stability
- World reactivity
- Off-session structure

---

# 🐉 Monster Manual — Sections to Mine

## I. Humanoid NPC Stat Blocks (Reskin Engine)

Low Tier:
- Bandit
- Bandit Captain
- Cultist
- Cult Fanatic
- Guard
- Noble
- Scout
- Thug
- Acolyte
- Priest

Mid Tier:
- Veteran
- Knight
- Mage
- Assassin

Rule:
Always reskin first.
Never rewrite mechanics unless unavoidable.

---

## II. the Drowned Marsh — Regional Ecology

### Swamp Wildlife
- Giant Frog
- Giant Toad
- Crocodile
- Giant Crocodile
- Constrictor Snake
- Giant Constrictor Snake
- Giant Lizard
- Swarm of Insects
- Giant Centipede
- Giant Spider

### Swamp Threats
- Lizardfolk
- Bullywug
- Will-o'-Wisp
- Shambling Mound

### Undead (Ancient Battlefield Justification)
- Zombie
- Skeleton
- Ghoul
- Wight
- Specter
- Shadow

Create:
Mere_Ecology_Table.md

Organize by:
- CR band
- Day/Night
- Deep swamp vs edge
- Faction influence
- Monster Role (Brute / Skirmisher / Controller / Artillery)

---

## III. coastal mountains — Regional Ecology

### Wildlife
- Wolf
- Dire Wolf
- Bear (Brown / Black)
- Panther
- Giant Goat
- Giant Eagle
- Griffon
- Harpy
- Giant Vulture
- Hippogriff

### Humanoid Threats
- Orc
- Orc War Chief
- Ogre
- Goblin
- Hobgoblin
- Bugbear
- Bandits

### High Threat (Future Tier)
- Wyvern
- Troll
- Stone Giant
- Ettin
- Young Dragon

Create:
Sword_Mountains_Ecology_Table.md

Organize by:
- Elevation band
- CR range
- Pack vs Solo
- Territorial vs Migratory

---

## IV. Monster Behavior & Tactics (Critical Upgrade)

Read the Monster Manual Introduction:
- How monsters think
- How they hunt
- Retreat logic
- Intelligence differences
- Environment preference

Design Rule:
Encounters are ecosystems, not stat blocks.

Upgrade from:
"The wolf attacks."
to:
"The wolves circle, isolate, and drag."

---

# ⚔ Encounter Design Adjustment (3 Players)

Party Size: 3

Guidelines:
- Avoid single-enemy fights unless multiattack or elite.
- 3–5 enemies often smoother than 1 big brute.
- Mix roles:
    - 1 Brute
    - 1 Skirmisher
    - 1 Ranged threat

Action economy > CR guesswork.

---

# 🔧 Implementation Checklist

Immediate Build:
- Leilon_NPC_Generator.md
- Mere_Ecology_Table.md
- Sword_Mountains_Ecology_Table.md
- Adventure_Shell_Template.md

Tag monsters by:
- CR
- Role
- Terrain
- Faction
- Behavior

---

# Design Principle

Mine structure.
Reskin mechanics.
Do not invent new subsystems.
Stability before expansion.