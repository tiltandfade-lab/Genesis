---
id: cultists
type: creature
domain: Monsters & Enemies
status: source
cr: "1/8"
role: minion
habitat: [urban, ruins, cave, any]
treasure: implements
activity: [any]
faction_fit: [cult]
---

*p. 85 MM 2024*

In a gritty, investigation-forward frontier campaign, cultists are rarely encountered in obvious robes chanting in public. They are the desperate miners, the bitter merchants, and the ambitious local guards who have turned to forbidden, mind-shattering lore to survive or seize power. They operate in secret, infiltrating local infrastructure and using monsters or mindless undead as their heavy muscle.

Here is the modular framework for running cults as an investigative faction, including 2024-compatible stat blocks for the core hierarchy, variant templates to adapt them to specific cosmic patrons, and clue tables for your table prep.

### 1. The Cultist Roster (Base 2024 Stat Blocks)

The rank-and-file cultists are commoners who have been promised power, while the fanatics and hierophants are the charismatic, dangerous leaders who hold the dark knowledge.

**Cultist** _Medium or Small Humanoid, Neutral_

- **Armor Class:** 12
- **Hit Points:** 9 (2d8)
- **Speed:** 30 ft.
- **Initiative:** +1 (11)
- **STR** 11 (+0) | **DEX** 12 (+1) | **CON** 10 (+0) | **INT** 10 (+0) | **WIS** 11 (+0) | **CHA** 10 (+0)
- **Skills:** Deception +2, Religion +2
- **Gear:** Leather Armor, Sickle
- **Senses:** Passive Perception 10
- **Languages:** Common
- **Challenge:** 1/8 (25 XP) | **Proficiency Bonus:** +2

**Actions**

- **Ritual Sickle.** _Melee Attack Roll:_ +3, reach 5 ft. _Hit:_ 3 (1d4 + 1) Slashing damage plus 1 Necrotic damage.

---

**Cultist Fanatic** _Medium or Small Humanoid, Neutral_

- **Armor Class:** 13
- **Hit Points:** 44 (8d8 + 8)
- **Speed:** 30 ft.
- **Initiative:** +2 (12)
- **STR** 11 (+0) | **DEX** 14 (+2) | **CON** 12 (+1) | **INT** 10 (+0) | **WIS** 14 (+2) | **CHA** 13 (+1)
- **Skills:** Deception +3, Persuasion +3, Religion +2
- **Gear:** Holy Symbol, Leather Armor
- **Senses:** Passive Perception 12
- **Languages:** Common
- **Challenge:** 2 (450 XP) | **Proficiency Bonus:** +2

**Actions**

- **Pact Blade.** _Melee Attack Roll:_ +4, reach 5 ft. _Hit:_ 6 (1d8 + 2) Slashing damage plus 7 (2d6) Necrotic damage.
- **Spellcasting.** The cultist casts one of the following spells, using Wisdom as the spellcasting ability (Spell Save DC 12, +4 to hit with spell attacks):
    - _At will:_ `Light`, `Thaumaturgy`
    - _2/day:_ `Command`
    - _1/day:_ `Hold Person`

**Bonus Actions**

- **Spiritual Weapon (2/Day).** The cultist casts the _Spiritual Weapon_ spell, using the same spellcasting ability as Spellcasting.

---

**Cultist Hierophant** _Medium or Small Humanoid, Neutral_ _Hierophants are high priests who lead hundreds of cultists, often establishing hidden lairs in ancient ruins or subterranean vaults to summon their dark patrons._

- **Armor Class:** 16 (Breastplate)
- **Hit Points:** 144 (17d8 + 68)
- **Speed:** 30 ft.
- **Initiative:** +8 (18)
- **STR** 14 (+2) | **DEX** 18 (+4) | **CON** 18 (+4) | **INT** 13 (+1) | **WIS** 16 (+3) | **CHA** 20 (+5)
- **Skills:** Perception +7, Persuasion +9, Religion +5
- **Gear:** Breastplate, Holy Symbol
- **Senses:** Passive Perception 17
- **Languages:** Celestial, Common
- **Challenge:** 10 (5,900 XP) | **Proficiency Bonus:** +4

**Actions**

- **Multiattack.** The cultist makes three attacks, using Pact Blade or Radiant Ray in any combination.
- **Pact Blade.** _Melee Attack Roll:_ +9, reach 5 ft. _Hit:_ 12 (2d6 + 5) Slashing damage plus 18 (4d8) Radiant damage.
- **Radiant Ray.** _Ranged Attack Roll:_ +9, range 120 ft. _Hit:_ 31 (4d12 + 5) Radiant damage.
- **Spellcasting.** The cultist casts one of the following spells, using Charisma as the spellcasting ability (Spell Save DC 17):
    - _At will:_ `Mage Armor` (included in AC), `Thaumaturgy`
    - _1/day each:_ `Jallarzi's Storm of Radiance` (level 7 version), `Mass Suggestion`

### 2. Cult Mutations (The Patrons)

In a modular campaign, you don't need unique stat blocks for every cult. Instead, apply one of these passive traits or reaction abilities to your base Cultists, Fanatics, or Hierophants to instantly re-flavor them to their specific cosmic patron.

- **Aberrant Cultists (The Dragon Below / Great Mother):** These cultists embrace nihilism and madness, seeking to unmake reality or serve mind-thiefs and elder deep-things.
    - _Mutation (Maddening Whispers):_ When the cultist dies, it releases a burst of psychic noise. Enemies within 5 feet take 1d6 Psychic damage.
- **Death Cultists (Orcus / Vecna / Blood Scion):** Worshipers of undeath who view the living as mere vessels or sacrifices.
    - _Mutation (Word of Orcus - Hierophant Only):_ (Recharge 5-6) As an Action, the Hierophant creates a 15-foot aura. Enemies must succeed on a DC 14 Constitution saving throw or take 2d6+3 Necrotic damage and become _Dazed_ until the end of their next turn. Allied undead in the aura regain 10 Hit Points.
- **Elemental Cultists (Tharizdun / The Elder Elemental Eye):** Obsessed with the destructive power of the elements, these cultists wish to fray the boundaries between the Material Plane and the Elemental Chaos.
    - _Mutation (Elemental Burst):_ Choose Fire, Cold, Lightning, or Bludgeoning (Earth). The cultist gains Resistance to this damage type. When the cultist hits with a melee attack, they can choose to push the target 5 feet away.
- **Fiend Cultists (Demogorgon / Zuggtmoy / Baphomet):** Sworn to demon lords or archdevils, these cultists undergo physical transformations mimicking their masters.
    - _Mutation (Baphomet's Horns):_ The cultist gains the _Labyrinthine Recall_ trait (perfectly recalling any path traveled) and their melee attacks deal an extra 1d6 damage if they move at least 10 feet straight toward a target before hitting it.
    - _Mutation (Zuggtmoy's Spore Burst):_ When the cultist takes melee damage, they can use their Reaction to release toxic spores. The attacker must make a DC 11 Constitution saving throw or become _Poisoned_ until the end of its next turn.

### 3. Investigation & Encounter Scaffolds

#### d6 The Cult's Cover (Social Stealth)

Cultists must survive in civilized areas to recruit and gather resources. _(Roll or choose one to establish how the cult is hiding in plain sight)._

|d6|The Front|Investigation Clue / Integration|
|:--|:--|:--|
|**1**|**The Corrupt Watch Captain**|The local garrison has been subverted. The "cultists" are fully deputized guards using their authority to illegally detain travelers for "questioning" (sacrifices).|
|**2**|**The Smuggler's Ring**|The cult operates under the guise of a spice or weapons smuggling cartel. They use the hidden routes to move chaotic magical artifacts and rare spell components into the city.|
|**3**|**The Debased Miners**|Deep in the local quarries, a crew breached a sealed vault and found an Aberrant idol. They still deliver their ore quotas, but the entire night-shift has stopped speaking and their eyes are completely black.|
|**4**|**The High-Society Gala**|The hierophant is a respected noble. The cult's rituals are disguised as exclusive, invitation-only masquerades where blood is mixed into the wine.|
|**5**|**The Charitable Orphanage**|The cult runs a legitimate soup kitchen or orphanage, using it to indoctrinate the desperate and vulnerable into their ranks with twisted dogma.|
|**6**|**The Abandoned Theater**|The cult meets in the flooded cellars of an old opera house. Locals think it is haunted by a banshee, but the "wailing" is actually the Fanatics chanting their unholy prayers.|

#### d6 The Macabre Signature (Crime Scene Clues)

Cults leave distinct, terrifying markers of their presence that seasoned adventurers can identify.

|d6|Cult Signature|Which Cult it Points To|
|:--|:--|:--|
|**1**|**Missing Heads**|The victims' bodies are intact, but their heads have been cleanly removed to be used in profane necromantic rituals. _(Points to Death/Orcus Cult)_.|
|**2**|**The Labyrinthine Carvings**|The walls of the alley or cavern are etched with dizzying, impossible maze patterns drawn in dried blood. _(Points to Fiend/Baphomet Cult)_.|
|**3**|**The Slime Trail**|The scene smells of rotting fish and chlorine. The victims' bones are partially dissolved, and small globs of dark-blue gel are left behind. _(Points to Aberrant Cult)_.|
|**4**|**The Fungus Bloom**|The corpses are entirely overgrown with rapid-blooming, toxic white mushrooms that puff spores when approached. _(Points to Fiend/Zuggtmoy Cult)_.|
|**5**|**The Scorched Earth**|The victims were burned to cinders, but the wooden furniture around them is completely untouched. _(Points to Elemental Fire Cult)_.|
|**6**|**The Empty Graveyard**|The local cemetery hasn't been robbed; the graves look like they burst open from the _inside_, indicating a mass awakening. _(Points to Death Cult)_.|

#### d4 Escalation (Secondary Monsters)

A cult rarely fights alone. They use their magic to bind monsters to act as guardians or heavy shock troops.

| d4    | Symbiotic Threat               | 2024 Mechanical Synergy                                                                                                                                                                                                    |
| :---- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Swarms of Rats or Insects**  | The cult uses swarms as an alarm system. If a swarm is attacked, the cultists in the next room are alerted and begin casting _Hold Person_ to prepare an ambush.                                                           |
| **2** | **Animated Skeletons/Zombies** | The cultists use mindless undead as living walls. The Hierophant casts _Spirit Guardians_ and stands directly behind the zombie frontline, safely dodging melee attacks.                                                   |
| **3** | **A Bound Elemental or Demon** | The cultists have summoned a Barlgura or an Earth Elemental, but its binding is fragile. If the PCs can break the summoning circle or kill the Fanatic holding the talisman, the monster will attack the cultists instead. |
| **4** | **The Mindless Thrall**        | A powerful local NPC (like the mayor or a veteran warrior) is present, fighting for the cult while visibly dominated by an Aberrant parasite. The PCs must subdue them without killing them.                               |