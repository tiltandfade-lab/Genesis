---
type: scratch
status: experimental
created: 2026-07-09
realm: pc-characters
---

# Sprite Batch Prompts — Player Characters (every race x class x gender)

> **Production-format authority (2026-07-24):** The packet grammar demonstrated here is the
> preferred grammar for new sprite production. Use [`PRODUCTION-FORMAT.md`](PRODUCTION-FORMAT.md)
> for current grid, cell-aspect, canvas, QA, and receipt fields. Any `5×5` / `25 cells` value
> below is historical batch data, not a universal default. New character cells default to
> `4:5` width:height unless the subject needs another declared ratio.

**Roster/content status: working, not canon.** Every
combination of the game's 9 playable species (`data/species-backgrounds.js`) x 12 classes
(`data/class-progression.js`) x 2 genders = **216 PC variants**, batched into
25-per-sheet ChatGPT prompts. This is the character-creator roster, not a monster/NPC set — use
it to test a consistent player-character look before touching realm-specific creature style.

Species: Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human, Orc, Tiefling.
Classes: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard.

Style block: clean painterly fantasy character-portrait style turned pixel-sprite, warm parchment-adjacent palette, medium value contrast, class-appropriate gear/armor readable in silhouette — matches the `fantasy.md` default-world style so PCs and monsters share one visual language.

Shared mechanical instructions (same as the master template): 5x5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale
across all 25, orthographic side view, each character fully visible from head to toe within its
cell -- no cropping at the top, bottom, or sides, the complete body must fit inside the cell
boundary. **Every character in an expressive, mid-action pose that captures its essence** --
mid-lunge, mid-cast, braced, snarling -- never a neutral T-pose or idle stand. Pose direction
per class (species carries the racial silhouette; gender is a body-type/dress read, not a pose
change):

- **Barbarian**: mid-rage, greataxe raised overhead, roaring
- **Bard**: mid-performance, instrument in hand, a spell shimmering off the music
- **Cleric**: channeling divine energy, holy symbol raised, radiant light at the hand
- **Druid**: mid-shapeshift or spellcasting, wild energy crackling around raised hands
- **Fighter**: braced combat stance, weapon mid-swing, shield up
- **Monk**: mid-flying-kick or braced martial-arts stance, fists wrapped, focused
- **Paladin**: sword raised in an oath-gesture, holy light along the blade
- **Ranger**: bow drawn full-pull, aiming, a hunting companion implied at the flank
- **Rogue**: crouched mid-strike from stealth, dual daggers, sly grin
- **Sorcerer**: wild arcane energy erupting from open palms, hair/robe caught in the surge
- **Warlock**: eldritch energy coiling from an outstretched hand, patron's mark glowing
- **Wizard**: mid-spellcast, spellbook in one hand, arcane sigil forming at the other

---

## PC batches (216 total, 9 sheets)

### PC sheet 1/9

1. **Dragonborn Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring
2. **Dragonborn Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring
3. **Dragonborn Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music
4. **Dragonborn Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music
5. **Dragonborn Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand
6. **Dragonborn Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand
7. **Dragonborn Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
8. **Dragonborn Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
9. **Dragonborn Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
10. **Dragonborn Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
11. **Dragonborn Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
12. **Dragonborn Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
13. **Dragonborn Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
14. **Dragonborn Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
15. **Dragonborn Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
16. **Dragonborn Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
17. **Dragonborn Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
18. **Dragonborn Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
19. **Dragonborn Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
20. **Dragonborn Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
21. **Dragonborn Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
22. **Dragonborn Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
23. **Dragonborn Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
24. **Dragonborn Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
25. **Dwarf Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring

### PC sheet 2/9

1. **Dwarf Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring
2. **Dwarf Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music
3. **Dwarf Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music
4. **Dwarf Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand
5. **Dwarf Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand
6. **Dwarf Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
7. **Dwarf Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
8. **Dwarf Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
9. **Dwarf Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
10. **Dwarf Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
11. **Dwarf Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
12. **Dwarf Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
13. **Dwarf Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
14. **Dwarf Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
15. **Dwarf Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
16. **Dwarf Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
17. **Dwarf Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
18. **Dwarf Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
19. **Dwarf Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
20. **Dwarf Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
21. **Dwarf Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
22. **Dwarf Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
23. **Dwarf Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
24. **Elf Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring
25. **Elf Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring

### PC sheet 3/9

1. **Elf Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music
2. **Elf Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music
3. **Elf Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand
4. **Elf Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand
5. **Elf Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
6. **Elf Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
7. **Elf Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
8. **Elf Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
9. **Elf Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
10. **Elf Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
11. **Elf Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
12. **Elf Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
13. **Elf Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
14. **Elf Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
15. **Elf Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
16. **Elf Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
17. **Elf Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
18. **Elf Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
19. **Elf Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
20. **Elf Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
21. **Elf Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
22. **Elf Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
23. **Gnome Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring
24. **Gnome Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring
25. **Gnome Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music

### PC sheet 4/9

1. **Gnome Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music
2. **Gnome Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand
3. **Gnome Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand
4. **Gnome Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
5. **Gnome Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
6. **Gnome Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
7. **Gnome Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
8. **Gnome Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
9. **Gnome Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
10. **Gnome Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
11. **Gnome Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
12. **Gnome Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
13. **Gnome Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
14. **Gnome Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
15. **Gnome Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
16. **Gnome Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
17. **Gnome Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
18. **Gnome Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
19. **Gnome Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
20. **Gnome Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
21. **Gnome Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
22. **Goliath Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring
23. **Goliath Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring
24. **Goliath Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music
25. **Goliath Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music

### PC sheet 5/9

1. **Goliath Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand
2. **Goliath Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand
3. **Goliath Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
4. **Goliath Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
5. **Goliath Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
6. **Goliath Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
7. **Goliath Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
8. **Goliath Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
9. **Goliath Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
10. **Goliath Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
11. **Goliath Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
12. **Goliath Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
13. **Goliath Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
14. **Goliath Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
15. **Goliath Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
16. **Goliath Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
17. **Goliath Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
18. **Goliath Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
19. **Goliath Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
20. **Goliath Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
21. **Halfling Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring
22. **Halfling Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring
23. **Halfling Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music
24. **Halfling Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music
25. **Halfling Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand

### PC sheet 6/9

1. **Halfling Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand
2. **Halfling Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
3. **Halfling Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
4. **Halfling Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
5. **Halfling Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
6. **Halfling Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
7. **Halfling Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
8. **Halfling Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
9. **Halfling Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
10. **Halfling Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
11. **Halfling Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
12. **Halfling Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
13. **Halfling Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
14. **Halfling Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
15. **Halfling Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
16. **Halfling Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
17. **Halfling Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
18. **Halfling Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
19. **Halfling Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
20. **Human Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring
21. **Human Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring
22. **Human Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music
23. **Human Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music
24. **Human Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand
25. **Human Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand

### PC sheet 7/9

1. **Human Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
2. **Human Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
3. **Human Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
4. **Human Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
5. **Human Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
6. **Human Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
7. **Human Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
8. **Human Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
9. **Human Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
10. **Human Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
11. **Human Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
12. **Human Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
13. **Human Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
14. **Human Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
15. **Human Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
16. **Human Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
17. **Human Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
18. **Human Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
19. **Orc Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring
20. **Orc Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring
21. **Orc Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music
22. **Orc Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music
23. **Orc Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand
24. **Orc Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand
25. **Orc Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands

### PC sheet 8/9

1. **Orc Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
2. **Orc Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
3. **Orc Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
4. **Orc Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
5. **Orc Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
6. **Orc Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
7. **Orc Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
8. **Orc Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
9. **Orc Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
10. **Orc Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
11. **Orc Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
12. **Orc Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
13. **Orc Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
14. **Orc Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
15. **Orc Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
16. **Orc Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
17. **Orc Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
18. **Tiefling Barbarian (Male)** -- mid-rage, greataxe raised overhead, roaring
19. **Tiefling Barbarian (Female)** -- mid-rage, greataxe raised overhead, roaring
20. **Tiefling Bard (Male)** -- mid-performance, instrument in hand, a spell shimmering off the music
21. **Tiefling Bard (Female)** -- mid-performance, instrument in hand, a spell shimmering off the music
22. **Tiefling Cleric (Male)** -- channeling divine energy, holy symbol raised, radiant light at the hand
23. **Tiefling Cleric (Female)** -- channeling divine energy, holy symbol raised, radiant light at the hand
24. **Tiefling Druid (Male)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands
25. **Tiefling Druid (Female)** -- mid-shapeshift or spellcasting, wild energy crackling around raised hands

### PC sheet 9/9

1. **Tiefling Fighter (Male)** -- braced combat stance, weapon mid-swing, shield up
2. **Tiefling Fighter (Female)** -- braced combat stance, weapon mid-swing, shield up
3. **Tiefling Monk (Male)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
4. **Tiefling Monk (Female)** -- mid-flying-kick or braced martial-arts stance, fists wrapped, focused
5. **Tiefling Paladin (Male)** -- sword raised in an oath-gesture, holy light along the blade
6. **Tiefling Paladin (Female)** -- sword raised in an oath-gesture, holy light along the blade
7. **Tiefling Ranger (Male)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
8. **Tiefling Ranger (Female)** -- bow drawn full-pull, aiming, a hunting companion implied at the flank
9. **Tiefling Rogue (Male)** -- crouched mid-strike from stealth, dual daggers, sly grin
10. **Tiefling Rogue (Female)** -- crouched mid-strike from stealth, dual daggers, sly grin
11. **Tiefling Sorcerer (Male)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
12. **Tiefling Sorcerer (Female)** -- wild arcane energy erupting from open palms, hair/robe caught in the surge
13. **Tiefling Warlock (Male)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
14. **Tiefling Warlock (Female)** -- eldritch energy coiling from an outstretched hand, patron's mark glowing
15. **Tiefling Wizard (Male)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
16. **Tiefling Wizard (Female)** -- mid-spellcast, spellbook in one hand, arcane sigil forming at the other
