---
type: reference
status: gathered 2026-07-09
source: Dungeon Master's Guide (2014), Ch.5 "Dungeons" pp.99-105 + Appendix A "Random Dungeons" pp.290-301
page-index: dev/model-qa/dmg2014-page-index.json (_pdfOffset 0)
---

# DMG 2014 — Dungeons + Random Dungeon Generator (gather)

## What this is

A vision-verified gather from the scanned DMG 2014 (broken OCR layer — every page below was
read as an image, printed page == PDF page, no drift observed). Feeds the Genesis **PLACE-GEN**
spec as raw material for structured interior generation. **Note on fidelity:** table *structure*
(die sizes, exact range bands, all mechanical numbers, DCs, damage) is captured exactly as
printed; row *text* is paraphrased in compact form rather than transcribed word-for-word
(copyright), but every row and range is accounted for — nothing is dropped or truncated. Cited
printed pages in parentheses throughout.

---

# Part 1 — Chapter 5: Building a Dungeon (pp.99–102)

## Compositional logic (p.99, prose summary)

Ch.5 frames dungeon creation as a chain of identity rolls before any map exists:
**Location → Creator → (creator sub-tables: cult / alignment / class) → Purpose → History →
Inhabitants/Factions → Features/Atmosphere.** Each answer constrains the next — the creator
shapes architecture (yuan-ti ramps instead of stairs; beholder-carved smooth walls and vertical
shafts; amphibious builders flooding inner reaches), the purpose shapes room mix, the history
explains the current, often-changed state.

## Dungeon Location (d100, p.99)

| d100 | Location |
|---|---|
| 01–04 | A building inside a city |
| 05–08 | City catacombs/sewers |
| 09–12 | Under a farmhouse |
| 13–16 | Under a graveyard |
| 17–22 | Under a ruined castle |
| 23–26 | Under a ruined city |
| 27–30 | Under a temple |
| 31–34 | In a chasm |
| 35–38 | In a cliff face |
| 39–42 | In a desert |
| 43–46 | In a forest |
| 47–50 | In a glacier |
| 51–54 | In a gorge |
| 55–58 | In a jungle |
| 59–62 | In a mountain pass |
| 63–66 | In a swamp |
| 67–70 | Beneath or atop a mesa |
| 71–74 | In sea caves |
| 75–78 | Across several linked mesas |
| 79–82 | On a mountain peak |
| 83–86 | On a promontory |
| 87–90 | On an island |
| 91–95 | Underwater |
| 96–00 | Roll on the Exotic Location table |

## Exotic Location (d20, p.99)

| d20 | Location |
|---|---|
| 1 | In a tree's branches |
| 2 | Around a geyser |
| 3 | Behind a waterfall |
| 4 | Buried in an avalanche |
| 5 | Buried in a sandstorm |
| 6 | Buried in volcanic ash |
| 7 | Castle/structure sunk in a swamp |
| 8 | Castle/structure at a sinkhole's bottom |
| 9 | Floating on the sea |
| 10 | In a meteorite |
| 11 | On a demiplane or in a pocket dimension |
| 12 | In a zone wrecked by magical catastrophe |
| 13 | On a cloud |
| 14 | In the Feywild |
| 15 | In the Shadowfell |
| 16 | On an island in an underground sea |
| 17 | In a volcano |
| 18 | On a Gargantuan living creature's back |
| 19 | Sealed inside a magical force dome |
| 20 | Inside a *Mordenkainen's magnificent mansion* |

## Dungeon Creator (d20, p.100)

| d20 | Creator |
|---|---|
| 1 | Beholder |
| 2–4 | Cult/religious group (roll Cults and Religious Groups) |
| 5–8 | Dwarves |
| 9 | Elves (incl. drow) |
| 10 | Giants |
| 11 | Hobgoblins |
| 12–15 | Humans (roll NPC Alignment + NPC Class for specifics) |
| 16 | Kuo-toa |
| 17 | Lich |
| 18 | Mind flayers |
| 19 | Yuan-ti |
| 20 | No creator — natural caverns |

## Cults and Religious Groups (d20, p.100)

| d20 | Group |
|---|---|
| 1 | Demon-worshiping cult |
| 2 | Devil-worshiping cult |
| 3–4 | Elemental Air cult |
| 5–6 | Elemental Earth cult |
| 7–8 | Elemental Fire cult |
| 9–10 | Elemental Water cult |
| 11–15 | Worshipers of an evil deity |
| 16–17 | Worshipers of a good deity |
| 18–20 | Worshipers of a neutral deity |

## NPC Alignment (d20, p.100)

| d20 | Alignment |
|---|---|
| 1–2 | Lawful good |
| 3–4 | Neutral good |
| 5–6 | Chaotic good |
| 7–9 | Lawful neutral |
| 10–11 | Neutral |
| 12 | Chaotic neutral |
| 13–15 | Lawful evil |
| 16–18 | Neutral evil |
| 19–20 | Chaotic evil |

## NPC Class (d20, p.101)

| d20 | Class |
|---|---|
| 1 | Barbarian |
| 2 | Bard |
| 3–4 | Cleric |
| 5 | Druid |
| 6–7 | Fighter |
| 8 | Monk |
| 9 | Paladin |
| 10 | Ranger |
| 11–14 | Rogue |
| 15 | Sorcerer |
| 16 | Warlock |
| 17–20 | Wizard |

## Dungeon Purpose (d20, p.101)

| d20 | Purpose |
|---|---|
| 1 | Death trap |
| 2–5 | Lair |
| 6 | Maze |
| 7–9 | Mine |
| 10 | Planar gate |
| 11–14 | Stronghold |
| 15–17 | Temple or shrine |
| 18–19 | Tomb |
| 20 | Treasure vault |

Purpose glosses (p.101, paraphrased): **Death trap** exists to kill intruders — guarding an
insane wizard's hoard or luring adventurers to feed some agenda (e.g. a lich's phylactery).
**Lair** = monster residence, typically ruins or caves. **Maze** deceives/confuses — treasure
gauntlet or a hunting ground for banished prisoners. **Mine** — abandoned mines get infested;
deep miners can break into the Underdark. **Planar gate** — warped by planar energy seeping
through its portal. **Stronghold** — villain base of operations, ruled by a powerful individual
(wizard/vampire/dragon), larger and more complex than a lair. **Temple/Shrine** — consecrated
to a deity or planar entity, run by its worshipers. **Tomb** — magnet for treasure hunters and
bone-hungering monsters. **Treasure vault** — built to protect wealth and magic; heavily
guarded and trapped.

## Dungeon History (d20, p.101)

| d20 | Key event |
|---|---|
| 1–3 | Abandoned by its creators |
| 4 | Abandoned because of plague |
| 5–8 | Conquered by invaders |
| 9–10 | Creators wiped out by raiders |
| 11 | Creators destroyed by something discovered inside the site |
| 12 | Creators destroyed by internal strife |
| 13 | Creators destroyed by magical catastrophe |
| 14–15 | Creators destroyed by natural disaster |
| 16 | Site god-cursed and shunned |
| 17–18 | Original creator still in charge |
| 19 | Overrun by planar creatures |
| 20 | Site of a great miracle |

Old dungeons can stack several history events, each reshaping the site (p.101).

## Dungeon Inhabitants / Factions / Ecology (pp.101–102, prose summary)

- After creators depart, anything moves in; monsters form a **connected ecology** (fungi,
  vermin, scavengers, predators coexisting with intelligent factions via domination,
  negotiation, and bloodshed), not a random-encounter pile (p.101).
- **Factions**: single dominant group, or multiple groups competing for resources
  (worked example: orcs vs. hobgoblins in a ruined dwarf citadel, mind flayers manipulating
  from below, a drow cell watching to enslave the survivors). Adventurers can ally with,
  sneak past, or play factions against each other; give faction NPC leaders full ch.4
  personalities and use them to *respond* to the party's arrival (pp.101–102).
- **Ecology**: inhabitants need food/water/air/security; a fresh-water pool becomes a
  logical hub (and ambush spot); if every door is locked/closed, players will rightly ask
  how the carrion crawlers survive (p.102).
- **Encounter difficulty**: don't simply ratchet difficulty with depth (turns into a grind);
  mix easy/hard, simple/complex throughout so tactics vary (p.102).

## Mapping a Dungeon (p.102, prose summary)

Location + creator + purpose + history + inhabitants seed the map. Scale: graph paper,
1 square = 10 ft. (5 ft. or subdivided 10-ft. grid for miniatures). Design points
(p.102): asymmetry beats predictability; think in three dimensions (stairs, ramps,
ledges, balconies, pits); add wear and tear (collapsed passages, quake-opened chasms);
incorporate natural features even in constructed dungeons (an underground stream through
a dwarven stronghold forces bridges and drains); multiple entrances/exits give players
real decisions; secret doors and rooms reward searchers. For a from-scratch random map:
appendix A.

## Dungeon Features (pp.102–105)

**Walls** (p.102): masonry, tool-hewn or water/lava-smoothed rock, wood/composite
above ground; sometimes decorated (murals, frescoes, bas-reliefs) with sconce/bracket
lighting; a few hide secret doors.

**Doors** (p.103): plain or carved/engraved. *Stuck doors* — Strength check to open
(DC per ch.8). *Locked doors* — pick with Dexterity check (thieves' tools + proficiency),
force with Strength, smash with damage, or *knock*. *Barred doors* — like locked but no
lock to pick; from the barred side, lifting the bar is an action. (p.103)

**Secret doors** (pp.103–104): blend into the wall; faint cracks/scuff marks betray them.
Detect passively via passive Wisdom (Perception) or actively with a Wisdom (Perception)
check; once found, Intelligence (Investigation) may be needed to work the opening
mechanism; breaking one down = treat as a locked door of the wall's material.

**Concealed doors** (p.104): normal doors hidden by mundane means (tapestry, plaster,
rug over a trapdoor). Normally no check — looking in the right place reveals them;
passive Perception can notice disturbed coverings.

**Portcullises** (p.104): vertical wood/iron bars; blocks passage while letting guards
watch and shoot/cast through. Winching up/down = an action; lifting or bending the bars
without the winch = Strength check (DC by size/weight per ch.8).

**Darkness and light** (pp.104–105): darkness is the default underground; inhabited
dungeons may be lit (even darkvision races use fire for warmth/cooking/defense). Light
gives you short sight but announces you from far away — bright light in total darkness
is visible for miles; dungeon light sources (phosphorescent fungi, glowing portals)
likewise draw adventurers.

**Air quality** (p.105): enclosed, little airflow; stifling, oppressive, odor-holding.

**Sounds** (p.105): enclosed geography channels sound — a creaking door echoes hundreds
of feet; forge-hammers or battle-din reverberate through the whole complex; denizens use
sound to locate prey and go on alert at party noise.

## Dungeon Hazards (p.105)

General rules: no check to spot an unhidden hazard; hazards that mimic something benign
(slime, mold) identify with an Intelligence (Nature) check (DC per ch.8). Severity: treat
as a trap and compare damage to level via the Damage Severity by Level table (ch.8 / later
in ch.5).

- **Brown mold** (p.105): feeds on warmth; a patch covers 10 ft. square; frigid within
  30 ft. Moving within 5 ft. for the first time on a turn or starting a turn there:
  DC 12 Con save, 22 (4d10) cold damage (half on success). Immune to fire; fire within
  5 ft. makes it instantly expand into a new 10-ft. square centered on the fire source.
  Cold damage destroys a patch instantly.
- **Green slime** (p.105): acid that devours flesh, organic material, and metal; bright
  green/wet/sticky patches on walls, floors, ceilings; a patch covers 5 ft. square,
  blindsight 30 ft., drops from above when it senses movement below (aware creature:
  DC 10 Dex save to avoid; otherwise unavoidable). Contact: 5 (1d10) acid, repeating at
  the start of each turn until scraped off or destroyed. Vs. wood or metal: 11 (2d10)
  acid per round; nonmagical wood/metal scraping tools are destroyed. Destroyed by
  sunlight, disease-curing effects, or cold/fire/radiant damage.
- **Webs** (p.105): giant-spider webs across passages and pit bottoms; difficult terrain.
  First entry on a turn or starting a turn there: DC 12 Dex save or restrained; escape
  with DC 12 Strength (Athletics) or Dexterity (Acrobatics) as an action. Each 10-ft.
  cube: AC 10, 15 hp, vulnerable to fire, immune to bludgeoning/piercing/psychic.
- **Yellow mold** (p.105): 5-ft.-square patch in dark places; touching it ejects a spore
  cloud filling a 10-ft. cube from the mold. Creatures inside: DC 15 Con save or
  11 (2d10) poison damage + poisoned 1 minute; while poisoned, 5 (1d10) poison at the
  start of each turn, repeat save at end of each turn to end. Sunlight or any fire
  damage destroys a patch.

---

# Part 2 — Appendix A: Random Dungeons (pp.290–301)

## Compositional logic — how the generator chains (p.290, prose summary)

The tables work **iteratively**: roll a **Starting Area** → pick one of its doors/passages
as the dungeon entrance → for each remaining passage/door leading away, roll on the
appropriate table (**Passage** table per passage; **Beyond a Door** per door/secret door).
Passages each extend 10 ft. past the starting area before the first Passage check. Every
result spawns the next roll — passages, doors, chambers, stairs — until the map fills.
Constrain growth via the graph paper itself: curtail anything that would leave the page
(dead-end it, turn it, shrink the chamber) or declare edge-leaving passages to be extra
entrances, and unmapped stairs/shafts to lead to levels you don't plan to build. When a
chamber appears: roll **Chamber** (size) → **Chamber Exits** (count, by normal/large
column) → per exit, **Exit Location** + **Exit Type**. Then stock via the **Stocking a
Dungeon** section: **Chamber Purpose** (by dungeon type) → **Current Chamber State** →
**Chamber Contents** → hazards/obstacles/traps/tricks/treasure sub-tables + **Dungeon
Dressing**.

## Starting Area (d10, p.290)

| d10 | Configuration |
|---|---|
| 1 | Square 20×20 ft.; passage on each wall |
| 2 | Square 20×20 ft.; doors on two walls, passage on a third |
| 3 | Square 40×40 ft.; doors on three walls |
| 4 | Rectangle 80×20 ft., pillar row down the middle; two passages off each long wall, door on each short wall |
| 5 | Rectangle 20×40 ft.; passage on each wall |
| 6 | Circle 40 ft. diameter; one passage each cardinal direction |
| 7 | Circle 40 ft. diameter; one passage each cardinal direction; central well (may drop to a lower level) |
| 8 | Square 20×20 ft.; doors on two walls, passage on the third, secret door on the fourth |
| 9 | Passage, 10 ft. wide; T intersection |
| 10 | Passage, 10 ft. wide; four-way intersection |

## Passage (d20, p.290)

Roll repeatedly, extending every open passage until it hits a door or chamber (p.290).

| d20 | Detail |
|---|---|
| 1–2 | Straight 30 ft., no doors or side passages |
| 3 | Straight 20 ft., door right, then 10 ft. more ahead |
| 4 | Straight 20 ft., door left, then 10 ft. more ahead |
| 5 | Straight 20 ft.; ends in a door |
| 6–7 | Straight 20 ft., side passage right, then 10 ft. more ahead |
| 8–9 | Straight 20 ft., side passage left, then 10 ft. more ahead |
| 10 | Straight 20 ft., dead end; 10% chance of a secret door |
| 11–12 | Straight 20 ft., then turns left and continues 10 ft. |
| 13–14 | Straight 20 ft., then turns right and continues 10 ft. |
| 15–19 | Chamber (roll on the Chamber table) |
| 20 | Stairs\* (roll on the Stairs table) |

\* Stairs presume a multilevel dungeon; if single-level, reroll, use the stairs as an
alternate entrance, or swap in another feature (p.290).

## Passage Width (d12/d20, p.290)

New passage: roll for width. Branch off another passage: **d12**. Off a chamber: **d20**,
but width must be at least 5 ft. smaller than the chamber's longest dimension (p.290).

| d12/d20 | Width |
|---|---|
| 1–2 | 5 ft. |
| 3–12 | 10 ft. |
| 13–14 | 20 ft. |
| 15–16 | 30 ft. |
| 17 | 40 ft., central pillar row |
| 18 | 40 ft., double pillar row |
| 19 | 40 ft. wide, 20 ft. high |
| 20 | 40 ft. wide, 20 ft. high, gallery 10 ft. above floor giving access to the level above |

## Door Type (d20, p.291)

When a table indicates a door: roll Door Type, then Beyond a Door for the far side. Barred
doors — you decide which side the bar is on; unlocked doors can still be stuck (p.291).

| d20 | Door type |
|---|---|
| 1–10 | Wooden |
| 11–12 | Wooden, barred or locked |
| 13 | Stone |
| 14 | Stone, barred or locked |
| 15 | Iron |
| 16 | Iron, barred or locked |
| 17 | Portcullis |
| 18 | Portcullis, locked in place |
| 19 | Secret door |
| 20 | Secret door, barred or locked |

## Beyond a Door (d20, p.291)

| d20 | Feature |
|---|---|
| 1–2 | Passage 10 ft., then a T intersection running 10 ft. right and left |
| 3–8 | Passage 20 ft. straight ahead |
| 9–18 | Chamber (roll on the Chamber table) |
| 19 | Stairs (roll on the Stairs table) |
| 20 | False door with trap |

## Chamber (d20, p.291)

| d20 | Chamber | Exits column |
|---|---|---|
| 1–2 | Square 20×20 ft. | normal |
| 3–4 | Square 30×30 ft. | normal |
| 5–6 | Square 40×40 ft. | normal |
| 7–9 | Rectangle 20×30 ft. | normal |
| 10–12 | Rectangle 30×40 ft. | normal |
| 13–14 | Rectangle 40×50 ft. | large |
| 15 | Rectangle 50×80 ft. | large |
| 16 | Circle 30 ft. diameter | normal |
| 17 | Circle 50 ft. diameter | large |
| 18 | Octagon 40×40 ft. | large |
| 19 | Octagon 60×60 ft. | large |
| 20 | Trapezoid roughly 40×60 ft. | large |

## Chamber Exits (d20, p.291)

| d20 | Normal chamber | Large chamber |
|---|---|---|
| 1–3 | 0 | 0 |
| 4–5 | 0 | 1 |
| 6–8 | 1 | 1 |
| 9–11 | 1 | 2 |
| 12–13 | 2 | 2 |
| 14–15 | 2 | 3 |
| 16–17 | 3 | 3 |
| 18 | 3 | 4 |
| 19 | 4 | 5 |
| 20 | 4 | 6 |

## Exit Location (d20, p.291)

| d20 | Location |
|---|---|
| 1–7 | Wall opposite the entrance |
| 8–12 | Wall left of the entrance |
| 13–17 | Wall right of the entrance |
| 18–20 | Same wall as the entrance |

## Exit Type (d20, p.291)

| d20 | Type |
|---|---|
| 1–10 | Door (roll on Door Type) |
| 11–20 | Corridor, 10 ft. long |

## Stairs (d20, p.291)

"Stairs" covers any vertical connector — ramps, chimneys, open shafts, elevators, ladders.
Inter-level spacing is up to you; 30 ft. works for most dungeons (p.291).

| d20 | Stairs |
|---|---|
| 1–4 | Down one level to a chamber |
| 5–8 | Down one level to a 20-ft. passage |
| 9 | Down two levels to a chamber |
| 10 | Down two levels to a 20-ft. passage |
| 11 | Down three levels to a chamber |
| 12 | Down three levels to a 20-ft. passage |
| 13 | Up one level to a chamber |
| 14 | Up one level to a 20-ft. passage |
| 15 | Up to a dead end |
| 16 | Down to a dead end |
| 17 | Chimney up one level to a 20-ft. passage |
| 18 | Chimney up two levels to a 20-ft. passage |
| 19 | Shaft (with or without elevator) down one level to a chamber |
| 20 | Shaft (with or without elevator) up one level to a chamber and down one level to a chamber |

## Connecting Areas (p.292, prose summary)

When the map is done, add doors between adjacent-but-unconnected chambers/passages — more
routes, more player options. For multilevel dungeons, make sure stairs/pits/vertical
passages line up between levels; on graph paper, overlay a new page, mark the shared
vertical features, and map the new level from them.

## Stocking a Dungeon (p.292, prose summary)

Layout is half the job; then decide challenges and rewards. You don't need every detail —
a monster list, a treasure list, and one or two key elements per area suffice. Any
reasonably large space should hold interesting sights, sounds, objects, and creatures.
**Chamber Purpose**: each dungeon type from ch.5's Dungeon Purpose has its own purpose
table; the General Dungeon Chambers table covers hybrid dungeons or mixing things up.
Warning: pure random stocking yields incongruities (a tiny room "temple" next to a huge
"storage" hall) — enjoy rationalizing them or just change them, and hand-author a few key
rooms (p.292).

## Chamber purpose tables by dungeon type

### Dungeon: Death Trap (d20, p.292)

| d20 | Purpose |
|---|---|
| 1 | Antechamber / spectator waiting room |
| 2–8 | Guardroom fortified against intruders |
| 9–11 | Treasure vault behind a locked or secret door (75% trapped) |
| 12–14 | Puzzle room — solve it to bypass a trap or monster |
| 15–19 | Trap built to kill or capture |
| 20 | Observation room for guards/spectators watching the dungeon |

### Dungeon: Lair (d20, p.293)

| d20 | Purpose |
|---|---|
| 1 | Armory (weapons + armor) |
| 2 | Audience chamber for receiving guests |
| 3 | Banquet room for celebrations |
| 4 | Barracks for the lair's defenders |
| 5 | Bedroom for leaders |
| 6 | Chapel where inhabitants worship |
| 7 | Cistern/well for drinking water |
| 8–9 | Guardroom defending the lair |
| 10 | Kennel — pets or guard beasts |
| 11 | Kitchen (storage + preparation) |
| 12 | Pen/prison for captives |
| 13–14 | Storage, mostly nonperishables |
| 15 | Throne room where leaders hold court |
| 16 | Torture chamber |
| 17 | Training and exercise room |
| 18 | Trophy room or museum |
| 19 | Latrine or bath |
| 20 | Workshop for making weapons, armor, tools, goods |

### Dungeon: Maze (d20, p.293)

| d20 | Purpose |
|---|---|
| 1 | Conjuring room for summoning maze guardians |
| 2–5 | Guardroom for patrolling sentinels |
| 6–10 | Lair for guard beasts patrolling the maze |
| 11 | Pen/prison behind a secret door — captives condemned to the maze |
| 12 | Shrine to a god or other entity |
| 13–14 | Storage: food + maintenance tools for the maze's keepers |
| 15–18 | Trap to confound or kill those sent into the maze |
| 19 | Drinking-water well |
| 20 | Workshop for repairing doors, torch sconces, other furnishings |

### Dungeon: Mine (d20, p.293)

| d20 | Purpose |
|---|---|
| 1–2 | Miners' barracks |
| 3 | Supervisor/manager's bedroom |
| 4 | Chapel to a patron deity of miners, earth, or protection |
| 5 | Cistern for the miners' water |
| 6–7 | Guardroom |
| 8 | Kitchen feeding workers |
| 9 | Laboratory testing strange extracted minerals |
| 10–15 | Lode where metal ore is mined (75% chance depleted) |
| 16 | Mine supervisor's office |
| 17 | Smithy for tool repair |
| 18–19 | Storage for tools and equipment |
| 20 | Strong room/vault holding ore awaiting surface transport |

### Dungeon: Planar Gate (d100, p.293)

| d100 | Purpose |
|---|---|
| 01–03 | Decorated foyer/antechamber |
| 04–08 | Armory of the portal's guardians |
| 09–10 | Audience chamber for visitors |
| 11–19 | Barracks of the portal's guards |
| 20–23 | Bedroom for high-ranking members of the guardian order |
| 24–30 | Chapel to deity/deities tied to the portal and its defenders |
| 31–35 | Cistern (fresh water) |
| 36–38 | Classroom for initiates studying the portal's secrets |
| 39 | Conjuring room — summoning creatures that investigate/defend the portal |
| 40–41 | Crypt of those who died guarding the portal |
| 42–47 | Dining room |
| 48–50 | Divination room probing the portal and related events |
| 51–55 | Dormitory for visitors and guards |
| 56–57 | Entry room/vestibule |
| 58–59 | Gallery of trophies and portal-related objects |
| 60–67 | Guardroom watching over the portal |
| 68–72 | Kitchen |
| 73–77 | Laboratory for portal experiments and emergent creatures |
| 78–80 | Library on the portal's history |
| 81–85 | Pen/prison for captives or portal-emergent creatures |
| 86–87 | Planar junction where a gate to another plane once stood (25% still active) |
| 88–90 | Storage |
| 91 | Strong room/vault — portal-linked treasures or funds paying the guardians |
| 92–93 | Study |
| 94 | Torture chamber for questioning portal-crossers and would-be sneaks |
| 95–98 | Latrine or bath |
| 99–00 | Workshop building the tools/gear for portal study |

### Dungeon: Stronghold (d100, p.294)

| d100 | Purpose |
|---|---|
| 01–02 | Antechamber for waiting visitors |
| 03–05 | Armory of high-quality gear incl. light siege weapons (ballistas) |
| 06 | Audience chamber — the master receives visitors |
| 07 | Aviary or zoo of exotic creatures |
| 08–11 | Banquet room for celebrations and hosting |
| 12–15 | Barracks for elite guards |
| 16 | Bath with marble floor and luxurious fittings |
| 17 | Bedroom for the master or important guests |
| 18 | Chapel to the master's deity |
| 19–21 | Cistern (drinking water) |
| 22–25 | Dining room for intimate/informal meals |
| 26 | Dressing room with many wardrobes |
| 27–29 | Gallery of expensive art and trophies |
| 30–32 | Game room for entertaining visitors |
| 33–50 | Guardroom |
| 51 | Kennel — protective monsters or trained animals |
| 52–57 | Kitchen built for exotic food at scale |
| 58–61 | Library with an extensive rare-book collection |
| 62 | Lounge for entertaining guests |
| 63–70 | Pantry, incl. wine/spirits cellar |
| 71–74 | Sitting room for family and intimates |
| 75–78 | Stable |
| 79–86 | Storage of mundane goods and supplies |
| 87 | Strong room/vault for treasures (75% hidden behind a secret door) |
| 88–92 | Study with writing desk |
| 93 | Throne room, elaborately decorated |
| 94–96 | Waiting room where lesser guests wait for an audience |
| 97–98 | Latrine or bath |
| 99–00 | Crypt of the stronghold's master or another notable |

### Dungeon: Temple or Shrine (d100, p.294)

| d100 | Purpose |
|---|---|
| 01–03 | Armory: weapons, armor, battle banners, pennants |
| 04–05 | Audience chamber — priests receive commoners/low-rank visitors |
| 06–07 | Banquet room for celebrations and holy days |
| 08–10 | Barracks for the temple's military arm or hired guards |
| 11–14 | Cells for quiet contemplation by the faithful |
| 15–24 | Central temple built for rituals |
| 25–28 | Chapel to a lesser deity associated with the temple's major deity |
| 29–31 | Classroom training initiates and priests |
| 32–34 | Conjuring room, specially sanctified, for summoning extraplanar creatures |
| 35–40 | Crypt of a high priest or similar — hidden, heavily guarded by creatures and traps |
| 41–42 | Dining room (large) for servants and lesser priests |
| 43 | Dining room (small) for the high priests |
| 44–46 | Divination room — runes + soothsaying implements |
| 47–50 | Dormitory for lesser priests/students |
| 51–56 | Guardroom |
| 57 | Kennel for the deity's associated animals or monsters |
| 58–60 | Kitchen (evil temple: may disturbingly resemble a torture chamber) |
| 61–65 | Library, well stocked with religious treatises |
| 66–68 | Prison for captured enemies (good/neutral temples) or sacrifices (evil) |
| 69–73 | Robing room of ceremonial outfits and items |
| 74 | Stable for riding horses, temple mounts, or visiting messengers/caravans |
| 75–79 | Storage of mundane supplies |
| 80 | Strong room/vault of relics and ceremonial items, heavily trapped |
| 81–82 | Torture chamber — inquisitions (lawful good/neutral) or sheer joy of pain (evil) |
| 83–89 | Trophy room of art celebrating mythic figures and events |
| 90 | Latrine or bath |
| 91–94 | Drinking-water well, defendable under attack/siege |
| 95–00 | Workshop repairing/creating weapons, religious items, tools |

### Dungeon: Tomb (d20, p.295)

| d20 | Purpose |
|---|---|
| 1 | Antechamber for mourners paying respects or preparing burial rites |
| 2–3 | Chapel to death-watching, resting-place-protecting deities |
| 4–8 | Crypt for lesser burials |
| 9 | Divination room for rituals contacting the dead for guidance |
| 10 | False crypt (trapped) to kill or capture thieves |
| 11 | Gallery of the deceased's deeds — trophies, statues, paintings |
| 12 | Grand crypt of a noble, high priest, or other notable |
| 13–14 | Guardroom, usually manned by undead, constructs, or other non-eating guardians |
| 15 | Robing room where priests prepare for burial rituals |
| 16–17 | Storage of tomb-maintenance and body-preparation tools |
| 18 | Tomb of the wealthiest/most important, protected by secret doors and traps |
| 19–20 | Embalming workshop |

### Dungeon: Treasure Vault (d20, p.295)

| d20 | Purpose |
|---|---|
| 1 | Antechamber for visiting dignitaries |
| 2 | Armory of mundane and magic gear used by the vault's guards |
| 3–4 | Barracks for guards |
| 5 | Cistern (fresh water) |
| 6–9 | Guardroom against intruders |
| 10 | Kennel of trained guard beasts |
| 11 | Kitchen feeding the guards |
| 12 | Watch room letting guards observe approaching visitors |
| 13 | Prison for captured intruders |
| 14–15 | Strong room/vault — the hidden treasure itself, locked or secret door only |
| 16 | Torture chamber for extracting information from captured intruders |
| 17–20 | Trap or trick designed to kill or capture intruders |

### General Dungeon Chambers (d100, p.295)

| d100 | Purpose | | d100 | Purpose |
|---|---|---|---|---|
| 01 | Antechamber | | 53–54 | Laboratory |
| 02–03 | Armory | | 55–57 | Library |
| 04 | Audience chamber | | 58–59 | Lounge |
| 05 | Aviary | | 60 | Meditation chamber |
| 06–07 | Banquet room | | 61 | Observatory |
| 08–10 | Barracks | | 62 | Office |
| 11 | Bath or latrine | | 63–64 | Pantry |
| 12 | Bedroom | | 65–66 | Pen or prison |
| 13 | Bestiary | | 67–68 | Reception room |
| 14–16 | Cell | | 69–70 | Refectory |
| 17 | Chantry | | 71 | Robing room |
| 18 | Chapel | | 72 | Salon |
| 19–20 | Cistern | | 73–74 | Shrine |
| 21 | Classroom | | 75–76 | Sitting room |
| 22 | Closet | | 77–78 | Smithy |
| 23–24 | Conjuring room | | 79 | Stable |
| 25–26 | Court | | 80–81 | Storage room |
| 27–29 | Crypt | | 82–83 | Strong room or vault |
| 30–31 | Dining room | | 84–85 | Study |
| 32–33 | Divination room | | 86–88 | Temple |
| 34 | Dormitory | | 89–90 | Throne room |
| 35 | Dressing room | | 91 | Torture chamber |
| 36 | Entry room or vestibule | | 92–93 | Training/exercise room |
| 37–38 | Gallery | | 94–95 | Trophy room or museum |
| 39–40 | Game room | | 96 | Waiting room |
| 41–43 | Guardroom | | 97 | Nursery or schoolroom |
| 44–45 | Hall | | 98 | Well |
| 46–47 | Hall, great | | 99–00 | Workshop |
| 48–49 | Hallway | | | |
| 50 | Kennel | | | |
| 51–52 | Kitchen | | | |

## Current Chamber State (d20, p.295)

For dungeons with tumultuous histories; otherwise a room still serving its intended
purpose is intact (p.295).

| d20 | Features |
|---|---|
| 1–3 | Rubble; ceiling partially collapsed |
| 4–5 | Holes; floor partially collapsed |
| 6–7 | Ashes; contents mostly burned |
| 8–9 | Used as a campsite |
| 10–11 | Pool of water; original contents water-damaged |
| 12–16 | Furniture wrecked but still present |
| 17–18 | Converted to another use (roll General Dungeon Chambers) |
| 19 | Stripped bare |
| 20 | Pristine, in original state |

## Dungeon Chamber Contents (d100, p.296)

Prose (p.296): "dominant inhabitant" = the creature controlling the area; pets/allies are
subservient to it. "Random creatures" = scavengers/nuisances passing through (carrion
crawlers, dire rats, gelatinous cubes, rust monsters). Also layer in Dungeon Dressing.

| d100 | Contents |
|---|---|
| 01–08 | Monster (dominant inhabitant) |
| 09–15 | Monster (dominant inhabitant) with treasure |
| 16–27 | Monster (pet or allied creature) |
| 28–33 | Monster (pet or allied creature) guarding treasure |
| 34–42 | Monster (random creature) |
| 43–50 | Monster (random creature) with treasure |
| 51–58 | Dungeon hazard (see Random Dungeon Hazards) with incidental treasure |
| 59–63 | Obstacle (see Random Obstacles) |
| 64–73 | Trap (see Random Traps) |
| 74–76 | Trap (see Random Traps) protecting treasure |
| 77–80 | Trick (see Random Tricks) |
| 81–88 | Empty room |
| 89–94 | Empty room with dungeon hazard |
| 95–00 | Empty room with treasure |

## Monsters and Motivations (p.296, prose summary)

Encounter creation per ch.3; vary difficulty for tension. A powerful creature met early
(a slumbering ancient red dragon on level one) sets tone and forces wits over force. Not
all monsters are hostile — consider relationships to neighbors and attitude toward
adventurers (a hungry beast can be appeased with food). Motivation can apply to a whole
multi-chamber group, or subgroups can hold conflicting goals.

### Monster Motivation (d20, p.296)

| d20 | Goal |
|---|---|
| 1–2 | Find a sanctuary |
| 3–5 | Conquer the dungeon |
| 6–8 | Seek an item within the dungeon |
| 9–11 | Slay a rival |
| 12–13 | Hide from enemies |
| 14–15 | Recover from a battle |
| 16–17 | Avoid danger |
| 18–20 | Seek wealth |

## Dungeon Hazards (d20, p.296)

Hazards are rare in inhabited areas (monsters clear or avoid them). Shriekers and violet
fungi are in the *Monster Manual*; the rest are in ch.5 (p.296).

| d20 | Hazard |
|---|---|
| 1–3 | Brown mold |
| 4–8 | Green slime |
| 9–10 | Shrieker |
| 11–15 | Spiderwebs |
| 16–17 | Violet fungus |
| 18–20 | Yellow mold |

## Random Obstacles (d20, pp.296–297)

Prose (p.296): obstacles block progress — but one faction's obstacle is another's
highway (a flooded chamber blocks most parties, not water-breathers). Obstacles can span
multiple rooms: a chasm through several passages, wind from a magic altar stirring the
air for hundreds of feet.

| d20 | Obstacle |
|---|---|
| 1 | Antilife aura, radius 1d10 × 10 ft.; inside it, living creatures can't regain hit points |
| 2 | Battering winds: speed halved, disadvantage on ranged attack rolls |
| 3 | *Blade barrier* blocking the passage |
| 4–8 | Cave-in |
| 9–12 | Chasm 1d4 × 10 ft. wide, 2d6 × 10 ft. deep, possibly linking to other levels |
| 13–14 | Flooding leaves 2d10 ft. of standing water; add nearby upward-sloping passages, raised floors, or rising stairs to contain it |
| 15 | Lava flow through the area (50% chance of a stone bridge across) |
| 16 | Overgrown mushrooms blocking passage, must be hacked through (25% chance a mold/fungus hazard hides among them) |
| 17 | Poisonous gas — 1d6 poison damage per minute of exposure |
| 18 | *Reverse gravity* effect pulling creatures to the ceiling |
| 19 | *Wall of fire* blocking the passage |
| 20 | *Wall of force* blocking the passage |

## Random Traps (p.297)

Procedure (p.297): use ch.5's sample traps or these tables. Roll **Trap Effects** +
**Trap Trigger** to define the trap, then **Trap Damage Severity** for deadliness
(severity detail in ch.5).

### Trap Trigger (d6, p.297)

| d6 | Trigger |
|---|---|
| 1 | Stepped on (floor, stairs) |
| 2 | Moved through (doorway, hallway) |
| 3 | Touched (doorknob, statue) |
| 4 | Opened (door, treasure chest) |
| 5 | Looked at (mural, arcane symbol) |
| 6 | Moved (cart, stone block) |

### Trap Damage Severity (d6, p.297)

| d6 | Severity |
|---|---|
| 1–2 | Setback |
| 3–5 | Dangerous |
| 6 | Deadly |

### Trap Effects (d100, p.297)

| d100 | Effect |
|---|---|
| 01–04 | *Magic missiles* fired from a statue or object |
| 05–07 | Staircase collapses into a ramp dumping characters into a pit at the bottom |
| 08–10 | Ceiling block falls, or the whole ceiling collapses |
| 11–12 | Ceiling lowers slowly in a locked room |
| 13–14 | Chute opens in the floor |
| 15–16 | Clanging noise summons nearby monsters |
| 17–19 | Touching an object triggers a *disintegrate* spell |
| 20–23 | Door or other object coated in contact poison |
| 24–27 | Fire jets from wall, floor, or object |
| 28–30 | Touching an object triggers a *flesh to stone* spell |
| 31–33 | Floor collapses — or is an illusion |
| 34–36 | Gas vent: blinding, acidic, obscuring, paralyzing, poisonous, or sleep-inducing |
| 37–39 | Electrified floor tiles |
| 40–43 | *Glyph of warding* |
| 44–46 | Huge wheeled statue rolls down the corridor |
| 47–49 | *Lightning bolt* from wall or object |
| 50–52 | Locked room floods with water or acid |
| 53–56 | Darts fire from an opened chest |
| 57–59 | Weapon, armor suit, or rug animates and attacks (Animated Objects, *MM*) |
| 60–62 | Pendulum — bladed or maul-weighted — swinging across the room/hall |
| 63–67 | Hidden pit opens underfoot (25% chance a black pudding or gelatinous cube fills the bottom) |
| 68–70 | Hidden pit flooding with acid or fire |
| 71–73 | Locking pit flooding with water |
| 74–77 | Scything blade from wall or object |
| 78–81 | Spring-out spears (possibly poisoned) |
| 82–84 | Brittle stairs collapsing over spikes |
| 85–88 | *Thunderwave* knocking characters into a pit or spikes |
| 89–91 | Steel or stone jaws restraining a character |
| 92–94 | Stone block smashing across the hallway |
| 95–97 | *Symbol* |
| 98–00 | Walls sliding together |

## Random Tricks (pp.297–298)

Prose (p.297): tricks are quirkier and less deadly than traps — creator leftovers or
manifestations of the dungeon's ambient magic. Roll the **object** the trick sits on,
then the **effect**. Some are permanent and undispellable; others are temporary or
neutralized by *dispel magic* — DM's call.

### Trick Objects (d20, p.298)

| d20 | Object | | d20 | Object |
|---|---|---|---|---|
| 1 | Book | | 12 | Pool of water |
| 2 | Brain preserved in a jar | | 13 | Runes engraved on wall or floor |
| 3 | Burning fire | | 14 | Skull |
| 4 | Cracked gem | | 15 | Sphere of magical energy |
| 5 | Door | | 16 | Statue |
| 6 | Fresco | | 17 | Stone obelisk |
| 7 | Furniture | | 18 | Suit of armor |
| 8 | Glass sculpture | | 19 | Tapestry or rug |
| 9 | Mushroom field | | 20 | Target dummy |
| 10 | Painting | | | |
| 11 | Plant or tree | | | |

### Tricks (d100, p.298)

| d100 | Trick effect |
|---|---|
| 01–03 | Ages whoever touches the object first |
| 04–06 | The touched object animates — or animates nearby objects |
| 07–10 | Poses three skill-testing questions (all three right → a reward appears) |
| 11–13 | Bestows resistance or vulnerability |
| 14–16 | Touch changes a character's alignment, personality, size, appearance, or sex |
| 17–19 | Transmutes one substance to another (gold→lead, metal→brittle crystal) |
| 20–22 | Creates a force field |
| 23–26 | Creates an illusion |
| 27–29 | Suppresses magic items for a time |
| 30–32 | Enlarges or reduces characters |
| 33–35 | *Magic mouth* speaking a riddle |
| 36–38 | *Confusion* (all creatures within 10 ft.) |
| 39–41 | Gives directions — true or false |
| 42–44 | Grants a wish |
| 45–47 | Flies about, evading touch |
| 48–50 | Casts *geas* on the characters |
| 51–53 | Increases, reduces, negates, or reverses gravity |
| 54–56 | Induces greed |
| 57–59 | Contains an imprisoned creature |
| 60–62 | Locks or unlocks exits |
| 63–65 | Offers a game of chance promising a reward or valuable information |
| 66–68 | Helps or harms particular creature types |
| 69–71 | Casts *polymorph* on the characters (1 hour) |
| 72–75 | Presents a puzzle or riddle |
| 76–78 | Prevents movement |
| 79–81 | Releases coins, false coins, gems, false gems, a magic item, or a map |
| 82–84 | Releases, summons, or turns into a monster |
| 85–87 | Casts *suggestion* on the characters |
| 88–90 | Wails loudly when touched |
| 91–93 | Talks — normal speech, nonsense, poetry/rhymes, singing, spellcasting, or screaming |
| 94–97 | Teleports characters elsewhere |
| 98–00 | Swaps two or more characters' minds |

## Random Treasures / Empty Rooms (p.298, prose summary)

**Treasures**: use ch.7 "Treasure" tables per area. **Empty rooms**: a godsend for short
rests or barricading for a long rest; a searched "empty" room can reward with a secret
compartment — a prior inhabitant's journal, a map to another dungeon, some other discovery.

## Dungeon Dressing (pp.298–301)

Prose (p.298): miscellaneous items/points of interest establishing atmosphere, giving
clues to creators and history, seeding tricks and traps, encouraging exploration.
Standard procedure: roll once each on **Noises**, **Air**, and **Odors**; roll the other
dressing tables as often as you like, or hand-pick furnishings.

### Noises (d100, p.298)

| d100 | Effect | | d100 | Effect |
|---|---|---|---|---|
| 01–05 | Bang or slam | | 49 | Jingling |
| 06 | Bellowing | | 50–53 | Knocking |
| 07 | Buzzing | | 54–55 | Laughter |
| 08–10 | Chanting | | 56–57 | Moaning |
| 11 | Chiming | | 58–60 | Murmuring |
| 12 | Chirping | | 61–62 | Music |
| 13 | Clanking | | 63 | Rattling |
| 14 | Clashing | | 64 | Ringing |
| 15 | Clicking | | 65–68 | Rustling |
| 16 | Coughing | | 69–72 | Scratching or scrabbling |
| 17–18 | Creaking | | 73–74 | Screaming |
| 19 | Drumming | | 75–77 | Scuttling |
| 20–23 | Footsteps ahead | | 78 | Shuffling |
| 24–26 | Footsteps approaching | | 79–80 | Slithering |
| 27–29 | Footsteps behind | | 81 | Snapping |
| 30–31 | Footsteps receding | | 82 | Sneezing |
| 32–33 | Footsteps to the side | | 83 | Sobbing |
| 34–35 | Giggling (faint) | | 84 | Splashing |
| 36 | Gong | | 85 | Splintering |
| 37–39 | Grating | | 86–87 | Squeaking |
| 40–41 | Groaning | | 88 | Squealing |
| 42 | Grunting | | 89–90 | Tapping |
| 43–44 | Hissing | | 91–92 | Thud |
| 45 | Horn or trumpet sounding | | 93–94 | Thumping |
| 46 | Howling | | 95 | Tinkling |
| 47–48 | Humming | | 96 | Twanging |
| | | | 97 | Whining |
| | | | 98 | Whispering |
| | | | 99–00 | Whistling |

### Air (d100, p.299)

| d100 | Effect |
|---|---|
| 01–60 | Clear and damp |
| 61–70 | Clear and drafty |
| 71–80 | Clear but cold |
| 81–83 | Foggy or misty and cold |
| 84–85 | Clear, mist covering the floor |
| 86–90 | Clear and warm |
| 91–93 | Hazy and humid |
| 94–96 | Smoky or steamy |
| 97–98 | Clear, smoke covering the ceiling |
| 99–00 | Clear and windy |

### Odors (d100, p.299)

| d100 | Effect | | d100 | Effect |
|---|---|---|---|---|
| 01–03 | Acrid | | 58–61 | Metallic |
| 04–05 | Chlorine | | 62–65 | Ozone |
| 06–39 | Dank or moldy | | 66–70 | Putrid |
| 40–49 | Earthy | | 71–75 | Rotting vegetation |
| 50–57 | Manure | | 76–77 | Salty and wet |
| | | | 78–82 | Smoky |
| | | | 83–89 | Stale |
| | | | 90–95 | Sulfurous |
| | | | 96–00 | Urine |

### General Features (d100, p.299)

Debris/detail items, one per row, exact ranges as printed:

| d100 | Item | | d100 | Item |
|---|---|---|---|---|
| 01 | Arrow, broken | | 53–55 | Guano |
| 02–04 | Ashes | | 56 | Hair or fur |
| 05–06 | Bones | | 57 | Hammer head, cracked |
| 07 | Bottle, broken | | 58 | Helmet, badly dented |
| 08 | Chain, corroded | | 59 | Iron bar, bent and rusted |
| 09 | Club, splintered | | 60 | Javelin head, blunt |
| 10–19 | Cobwebs | | 61 | Leather boot |
| 20 | Coin, copper | | 62–64 | Leaves and twigs |
| 21–22 | Cracks, ceiling | | 65–68 | Mold (common) |
| 23–24 | Cracks, floor | | 69 | Pick handle |
| 25–26 | Cracks, wall | | 70 | Pole, broken (5 ft. long) |
| 27 | Dagger hilt | | 71 | Pottery shards |
| 28–29 | Damp ceiling | | 72–73 | Rags |
| 30–33 | Dampness, wall | | 74 | Rope, rotten |
| 34 | Dried blood | | 75–76 | Rubble and dirt |
| 35–41 | Dripping blood | | 77 | Sack, torn |
| 42–44 | Dung | | 78–80 | Slime (harmless) |
| 45–49 | Dust | | 81 | Spike, rusted |
| 50 | Flask, cracked | | 82–83 | Sticks |
| 51 | Food scraps | | 84 | Stones, small |
| 52 | Fungi (common) | | 85 | Straw |
| | | | 86 | Sword blade, broken |
| | | | 87 | Teeth or fangs, scattered |
| | | | 88 | Torch stub |
| | | | 89 | Wall scratchings |
| | | | 90–91 | Water, large puddle |
| | | | 92–93 | Water, small puddle |
| | | | 94–95 | Water, trickle |
| | | | 96 | Wax blob (candle stub) |
| | | | 97 | Wax drippings |
| | | | 98–00 | Wood pieces, rotting |

### General Furnishings and Appointments (d100, p.299)

| d100 | Item | | d100 | Item |
|---|---|---|---|---|
| 01 | Altar | | 50 | Hogshead (large cask, 65 gal.) |
| 02 | Armchair | | 51 | Idol (large) |
| 03 | Armoire | | 52 | Keg (small barrel, 20 gal.) |
| 04 | Arras or curtain | | 53 | Loom |
| 05 | Bag | | 54 | Mat |
| 06 | Barrel (40 gal.) | | 55 | Mattress |
| 07–08 | Bed | | 56 | Pail |
| 09 | Bench | | 57 | Painting |
| 10 | Blanket | | 58–60 | Pallet |
| 11 | Box (large) | | 61 | Pedestal |
| 12 | Brazier and charcoal | | 62–64 | Pegs |
| 13 | Bucket | | 65 | Pillow |
| 14 | Buffet cabinet | | 66 | Pipe (large cask, 105 gal.) |
| 15 | Bunks | | 67 | Quilt |
| 16 | Butt (huge cask, 125 gal.) | | 68–70 | Rug (small or medium) |
| 17 | Cabinet | | 71 | Rushes |
| 18 | Candelabrum | | 72 | Sack |
| 19 | Carpet (large) | | 73 | Sconce |
| 20 | Cask (40 gal.) | | 74 | Screen |
| 21 | Chandelier | | 75 | Sheet |
| 22 | Charcoal | | 76–77 | Shelf |
| 23–24 | Chair, plain | | 78 | Shrine |
| 25 | Chair, padded | | 79 | Sideboard |
| 26 | Chair, padded, or divan | | 80 | Sofa |
| 27 | Chest, large | | 81 | Staff, normal |
| 28 | Chest, medium | | 82 | Stand |
| 29 | Chest of drawers | | 83 | Statue |
| 30 | Closet (wardrobe) | | 84 | Stool, high |
| 31 | Coal | | 85 | Stool, normal |
| 32–33 | Couch | | 86 | Table, large |
| 34 | Crate | | 87 | Table, long |
| 35 | Cresset | | 88 | Table, low |
| 36 | Cupboard | | 89 | Table, round |
| 37 | Cushion | | 90 | Table, small |
| 38 | Dais | | 91 | Table, trestle |
| 39 | Desk | | 92 | Tapestry |
| 40–42 | Fireplace and wood | | 93 | Throne |
| 43 | Fireplace with mantle | | 94 | Trunk |
| 44 | Firkin (small cask, 10 gal.) | | 95 | Tub |
| 45 | Fountain | | 96 | Tun (huge cask, 250 gal.) |
| 46 | Fresco | | 97 | Urn |
| 47 | Grindstone | | 98 | Wall basin and font |
| 48 | Hamper | | 99 | Wood billets |
| 49 | Hassock | | 00 | Workbench |

### Religious Articles and Furnishings (d100, p.300)

| d100 | Item | | d100 | Item |
|---|---|---|---|---|
| 01–05 | Altar | | 54 | Lectern |
| 06–08 | Bells | | 55 | Mosaic |
| 09–11 | Brazier | | 56–58 | Offertory container |
| 12 | Candelabra | | 59 | Paintings or frescoes |
| 13–14 | Candles | | 60–61 | Pews |
| 15 | Candlesticks | | 62 | Pipes, musical |
| 16 | Cassocks | | 63 | Prayer rug |
| 17 | Chimes | | 64 | Pulpit |
| 18–19 | Cloth, altar | | 65 | Rail |
| 20–23 | Columns or pillars | | 66–69 | Robes |
| 24 | Curtain or tapestry | | 70–71 | Screen |
| 25 | Drum | | 72–76 | Shrine |
| 26–27 | Font | | 77 | Side chairs |
| 28–29 | Gong | | 78–79 | Stand |
| 30–35 | Holy or unholy symbol | | 80–82 | Statue |
| 36–37 | Holy or unholy writings | | 83 | Throne |
| 38–43 | Idol | | 84–85 | Thurible |
| 44–48 | Incense burner | | 86–90 | Tripod |
| 49 | Kneeling bench | | 91–97 | Vestments |
| 50–53 | Lamp | | 98–99 | Votive light |
| | | | 00 | Whistle |

### Mage Furnishings (d100, p.300)

| d100 | Item | | d100 | Item |
|---|---|---|---|---|
| 01–03 | Alembic | | 54 | Magic circle |
| 04–05 | Balance and weights | | 55 | Mortar and pestle |
| 06–09 | Beaker | | 56 | Pan |
| 10 | Bellows | | 57–58 | Parchment |
| 11–14 | Book | | 59 | Pentacle |
| 15–16 | Bottle | | 60 | Pentagram |
| 17 | Bowl | | 61 | Pipe, smoking |
| 18 | Box | | 62 | Pot |
| 19–22 | Brazier | | 63 | Prism |
| 23 | Cage | | 64–65 | Quill |
| 24 | Candle | | 66–68 | Retort |
| 25–26 | Candlestick | | 69 | Rod, mixing or stirring |
| 27–28 | Cauldron | | 70–72 | Scroll |
| 29–30 | Chalk | | 73 | Sexton |
| 31–32 | Crucible | | 74–75 | Skull |
| 33 | Crystal ball | | 76 | Spatula |
| 34 | Decanter | | 77 | Spoon, measuring |
| 35 | Desk | | 78 | Stand |
| 36 | Dish | | 79 | Stool |
| 37–40 | Flask or jar | | 80 | Stuffed animal |
| 41 | Funnel | | 81 | Tank (container) |
| 42 | Furnace | | 82 | Tongs |
| 43–44 | Herbs | | 83 | Tripod |
| 45 | Horn | | 84 | Tube (container) |
| 46–47 | Hourglass | | 85–86 | Tube (piping) |
| 48–49 | Jug | | 87 | Tweezers |
| 50 | Kettle | | 88–90 | Vial |
| 51 | Ladle | | 91 | Water clock |
| 52 | Lamp or lantern | | 92 | Wire |
| 53 | Lens (concave or convex) | | 93–00 | Workbench |

### Utensils and Personal Items (d100, p.300)

| d100 | Item | | d100 | Item |
|---|---|---|---|---|
| 01 | Awl | | 47–48 | Mirror |
| 02 | Bandages | | 49 | Needle(s) |
| 03 | Basin | | 50 | Oil, cooking |
| 04–05 | Basket | | 51 | Oil, fuel |
| 06–07 | Book | | 52 | Oil, scented |
| 08–09 | Bottle | | 53 | Pan |
| 10 | Bowl | | 54–55 | Parchment |
| 11 | Box | | 56 | Pipe, musical |
| 12–13 | Brush | | 57 | Pipe, smoking |
| 14 | Candle | | 58 | Plate, platter, or saucer |
| 15 | Candle snuffer | | 59 | Pot |
| 16 | Candlestick | | 60–61 | Pouch |
| 17 | Cane or walking stick | | 62 | Powder puff |
| 18 | Case | | 63 | Quill |
| 19 | Casket (small) | | 64 | Razor |
| 20–21 | Coffer | | 65 | Rope |
| 22 | Cologne or perfume | | 66 | Salve or unguent |
| 23 | Comb | | 67–68 | Scroll |
| 24 | Cup | | 69 | Shaker |
| 25 | Decanter | | 70 | Sifter or strainer |
| 26–27 | Dish | | 71–72 | Soap |
| 28 | Ear spoon | | 73 | Spigot |
| 29 | Ewer | | 74 | Spoon |
| 30 | Flagon, mug, or tankard | | 75 | Stopper |
| 31–32 | Flask or jar | | 76–77 | Statuette or figurine |
| 33 | Food | | 78–79 | Thread |
| 34 | Fork | | 80–82 | Tinderbox (with flint and steel) |
| 35 | Grater | | 83 | Towel |
| 36 | Grinder | | 84 | Tray |
| 37 | Horn, drinking | | 85 | Trivet or tripod |
| 38 | Hourglass | | 86 | Tureen |
| 39 | Jug or pitcher | | 87–88 | Twine |
| 40 | Kettle | | 89 | Vase |
| 41 | Key | | 91–92 | Vial |
| 42 | Knife | | 93 | Washcloth |
| 43 | Knucklebones or dice | | 94 | Whetstone |
| 44 | Ladle | | 95–96 | Wig |
| 45–46 | Lamp or lantern | | 97–98 | Wool |
| | | | 99–00 | Yarn |

(Note: as printed, the right column jumps 89 → 91 at "Vase"/"Vial" — the scan shows
89 Vase, 91–92 Vial; 90's assignment is ambiguous in the image.)

### Container Contents (d100, p.301)

| d100 | Item | | d100 | Item |
|---|---|---|---|---|
| 01–03 | Ash | | 60–61 | Lumps, unidentifiable |
| 04–06 | Bark | | 62–64 | Oil |
| 07–09 | Bodily organs | | 65–68 | Paste |
| 10–14 | Bones | | 69–71 | Pellets |
| 15–17 | Cinders | | 72–84 | Powder |
| 18–22 | Crystals | | 85–86 | Semiliquid suspension |
| 23–26 | Dust | | 87–88 | Skin or hide |
| 27–28 | Fibers | | 89–90 | Spheres (metal, stone, or wood) |
| 29–31 | Gelatin | | 91–92 | Splinters |
| 32–35 | Grains | | 93–94 | Stalks |
| 36–38 | Grease | | 95–97 | Strands |
| 39–41 | Husks | | 98–00 | Strips |
| 42–46 | Leaves | | | |
| 47–54 | Liquid, thin | | | |
| 55–59 | Liquid, viscous | | | |

### Books, Scrolls, and Tomes (d100, p.301)

| d100 | Contents | | d100 | Contents |
|---|---|---|---|---|
| 01–02 | Account records | | 63–64 | Novel |
| 03–04 | Alchemist's notebook | | 65 | Painting |
| 05–06 | Almanac | | 66–67 | Poetry |
| 07–08 | Bestiary | | 68–69 | Prayer book |
| 09–11 | Biography | | 70 | Property deed |
| 12–14 | Book of heraldry | | 71–74 | Recipe book or cookbook |
| 15 | Book of myths | | 75 | Record of a criminal trial |
| 16 | Book of pressed flowers | | 76 | Royal proclamation |
| 17 | Calendar | | 77–78 | Sheet music |
| 18–22 | Catalog | | 79 | Spellbook |
| 23–24 | Contract | | 80 | Text on armor making |
| 25–27 | Diary | | 81–82 | Text on astrology |
| 28–29 | Dictionary | | 83–84 | Text on brewing |
| 30–32 | Doodles or sketches | | 85–86 | Text on exotic flora or fauna |
| 33 | Forged document | | 87–88 | Text on herbalism |
| 34 | Grammar workbook | | 89–90 | Text on local flora |
| 35–36 | Heretical text | | 91–92 | Text on mathematics |
| 37–41 | Historical text | | 93 | Text on masonry |
| 42–43 | Last will and testament | | 94 | Text on medicine |
| 44–45 | Legal code | | 95 | Theological text |
| 46–53 | Letter | | 96 | Tome of forbidden lore |
| 54 | Lunatic's ravings | | 97–99 | Travelogue for an exotic land |
| 55 | Magic tricks (not a spellbook) | | 00 | Travelogue of the planes |
| 56 | Magic scroll | | | |
| 57–59 | Map or atlas | | | |
| 60 | Memoir | | | |
| 61–62 | Navigational chart or star chart | | | |

---

## Gather notes

- Printed page == PDF page throughout; no drift.
- p.103 is the sample "Catacombs" map plate (1 square = 10 ft.) plus the Doors/Secret
  Doors prose; no tables on it.
- One legibility gap: Utensils and Personal Items (p.300) — the 90 slot is ambiguous
  in the scan (89 Vase, then 91–92 Vial); flagged inline.
- Chapter 5's "Dungeon Features" has no standalone atmosphere die-tables — atmosphere
  rolling lives in Appendix A's Dungeon Dressing (Noises/Air/Odors).
- Row text throughout is faithfully condensed, not verbatim; all dice, ranges,
  percentages, dimensions, DCs, and damage values are exact as printed.
