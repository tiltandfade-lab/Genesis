> **HISTORICAL COMPLETED/RETURN PACKET — DO NOT RE-RUN AS NEW PRODUCTION.** Its fixed 5×5,
> 25-cell, square-canvas settings record the batch that produced its returns. New sprite packets
> use `dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md` and choose aspect for compatible subject
> groups.

You are an item-sprite generation worker for the Genesis faceted art program. Your
batch: the fantasy realm's full item universe — 375 items (175 SRD mundane + 200 magic) in 15
sheets of 25. These are inventory/loot-card sprites; modest per-item resolution is fine. This
prompt is the complete, authoritative source — do NOT read repo files for subjects.

Rules:
1. For each sheet section IN ORDER: submit ONE image-generation call = the ITEM PASTE BLOCK
   below + that sheet's numbered 25-item list, exactly as printed (VERBATIM LAW — no rewording,
   no substitutions, no invented items).
2. Create a fresh directory dev/model-qa/faceted-sheets/p4items-returns/ before the first call
   (STOP and report if it already contains files). Save each result IMMEDIATELY as
   p4items-returns/raw-items/<mundane|magic>-item-sheet-<N>-candidate-001.png.
3. After each save, RE-OPEN the file and verify: 25 cells, one object per cell, no characters
   or hands, uniform #FF00FF background, no object touching a cell edge, faceted prop register
   (no cute/toy look, no candy saturation). Fail → re-roll once, then mark FAILED. Never
   substitute or rename to fill a slot.
4. Append one JSON row per call to p4items-returns/provenance/p4items-generation-calls.json:
   {"file": "...", "callId": "...", "sheet": "...", "cells": [all 25 item names]} — at save time.
5. No git commands. Files + provenance are the whole deliverable.
6. Final report must match the directory exactly: attempted, saved, FAILED (with reasons), full
   filename list. Overclaiming is treated as fabrication.

=== ITEM PASTE BLOCK (use in every call, verbatim) ===

> Render a game item sprite sheet as a single image: a 5x5 grid, 25 cells, square 2048x2048
> canvas, ONE OBJECT per cell (no characters, no hands, no scene), centered, floating on the
> solid magenta #FF00FF background, consistent relative scale across cells (a coin small in its
> cell, a polearm spanning its cell), full object visible with margin — no cropping, nothing
> touching a cell boundary. Hard invisible cell boundaries, uniform cell size.
>
> Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained
> palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like
> proportions. Material identity comes from color and surface marks. Realistic dark-fantasy
> horror register — muted earth, bone, ash, rust, and shadow tones; believable weight, wear,
> and materials. This is not World of Warcraft, not a mobile game, not a collectible toy.
>
> Mundane items must look convincingly ordinary; magic items get one visible enchantment tell
> scaled to rarity (Common = a glint; Legendary may warp the air) — the tell is an emissive
> glow or distortion and is exempt from faceting, but the object itself stays faceted.
>
> Avoid: fake pixel art, voxel art, micro-triangulation, random polygon noise, chibi or toy
> proportions, candy saturation, glossy plastic, cast shadows, floor plane, scene dressing,
> text, labels, borders, watermarks.

=== YOUR SHEETS, IN ORDER ===

### Mundane item sheet 1/7 (5×5 grid, 25 cells)

1. **Acid** [gear]
2. **Alchemist’s Fire** [gear]
3. **Alchemist’s Supplies** [tool]
4. **Alms Box** [gear]
5. **Antitoxin** [gear]
6. **Arcane Focus (crystal)** [focus]
7. **Arcane Focus (orb)** [focus]
8. **Arcane Focus (quarterstaff)** [focus]
9. **Arcane Focus (rod)** [focus]
10. **Arcane Focus (staff)** [focus]
11. **Arcane Focus (wand)** [focus]
12. **Arrow** [gear]
13. **Backpack** [gear]
14. **Bag Of Sand** [gear]
15. **Ball Bearings** [gear]
16. **Barrel** [gear]
17. **Basket** [gear]
18. **Battleaxe** [weapon]
19. **Bedroll** [gear]
20. **Bell** [gear]
21. **Blanket** [gear]
22. **Block and Tackle** [gear]
23. **Block Of Incense** [gear]
24. **Blowgun** [weapon]
25. **Bolt** [gear]

### Mundane item sheet 2/7 (5×5 grid, 25 cells)

1. **Book** [gear]
2. **Bottle, Glass** [gear]
3. **Breastplate** [armor]
4. **Brewer’s Supplies** [tool]
5. **Bucket** [gear]
6. **Bullets, Firearm** [gear]
7. **Bullets, Sling** [gear]
8. **Calligrapher’s Supplies** [tool]
9. **Caltrops** [gear]
10. **Candle** [gear]
11. **Carpenter’s Tools** [tool]
12. **Cartographer’s Tools** [tool]
13. **Case, Crossbow Bolt** [gear]
14. **Case, Map or Scroll** [gear]
15. **Censer** [gear]
16. **Chain** [gear]
17. **Chain Mail** [armor]
18. **Chain Shirt** [armor]
19. **Chest** [gear]
20. **Climber’s Kit** [gear]
21. **Clothes, Fine** [gear]
22. **Clothes, Traveler’s** [gear]
23. **Club** [weapon]
24. **Cobbler’s Tools** [tool]
25. **Component Pouch** [gear]

### Mundane item sheet 3/7 (5×5 grid, 25 cells)

1. **Cook’s Utensils** [tool]
2. **Costume** [gear]
3. **Crowbar** [gear]
4. **Dagger** [weapon]
5. **Dart** [weapon]
6. **Disguise Kit** [tool]
7. **Druidic Focus (quarterstaff)** [focus]
8. **Druidic Focus (sprig Of Mistletoe)** [focus]
9. **Druidic Focus (wooden Staff)** [focus]
10. **Druidic Focus (yew Wand)** [focus]
11. **Flail** [weapon]
12. **Flask** [gear]
13. **Forgery Kit** [tool]
14. **Gaming Set** [tool]
15. **Glaive** [weapon]
16. **Glassblower’s Tools** [tool]
17. **Grappling Hook** [gear]
18. **Greataxe** [weapon]
19. **Greatclub** [weapon]
20. **Greatsword** [weapon]
21. **Halberd** [weapon]
22. **Half Plate Armor** [armor]
23. **Hand Crossbow** [weapon]
24. **Handaxe** [weapon]
25. **Healer’s Kit** [gear]

### Mundane item sheet 4/7 (5×5 grid, 25 cells)

1. **Heavy Crossbow** [weapon]
2. **Herbalism Kit** [tool]
3. **Hide Armor** [armor]
4. **Holy Symbol** [focus]
5. **Holy Water** [gear]
6. **Hunting Trap** [gear]
7. **Incense** [gear]
8. **Ink** [gear]
9. **Ink Pen** [gear]
10. **Javelin** [weapon]
11. **Jeweler’s Tools** [tool]
12. **Jug** [gear]
13. **Ladder** [gear]
14. **Lamp** [gear]
15. **Lance** [weapon]
16. **Lantern, Bullseye** [gear]
17. **Lantern, Hooded** [gear]
18. **Leather Armor** [armor]
19. **Leatherworker’s Tools** [tool]
20. **Light Crossbow** [weapon]
21. **Light Hammer** [weapon]
22. **Lock** [gear]
23. **Longbow** [weapon]
24. **Longsword** [weapon]
25. **Mace** [weapon]

### Mundane item sheet 5/7 (5×5 grid, 25 cells)

1. **Magnifying Glass** [gear]
2. **Manacles** [gear]
3. **Map** [gear]
4. **Mason’s Tools** [tool]
5. **Maul** [weapon]
6. **Mess Kit** [gear]
7. **Mirror** [gear]
8. **Morningstar** [weapon]
9. **Musket** [weapon]
10. **Navigator’s Tools** [tool]
11. **Needle** [gear]
12. **Net** [gear]
13. **Oil** [gear]
14. **Padded Armor** [armor]
15. **Painter’s Supplies** [tool]
16. **Paper** [gear]
17. **Parchment** [gear]
18. **Perfume** [gear]
19. **Pike** [weapon]
20. **Pistol** [weapon]
21. **Piton** [gear]
22. **Pitons** [gear]
23. **Plate Armor** [armor]
24. **Poison, Basic** [gear]
25. **Poisoner’s Kit** [tool]

### Mundane item sheet 6/7 (5×5 grid, 25 cells)

1. **Pole** [gear]
2. **Pot, Iron** [gear]
3. **Potion of Healing** [gear]
4. **Potter’s Tools** [tool]
5. **Pouch** [gear]
6. **Quarterstaff** [weapon]
7. **Quiver** [gear]
8. **Ram, Portable** [gear]
9. **Rapier** [weapon]
10. **Rations** [gear]
11. **Ring Mail** [armor]
12. **Robe** [gear]
13. **Rope** [gear]
14. **Sack** [gear]
15. **Scale Mail** [armor]
16. **Scimitar** [weapon]
17. **Sealing Wax** [gear]
18. **Shield** [shield]
19. **Shortbow** [weapon]
20. **Shortsword** [weapon]
21. **Shovel** [gear]
22. **Sickle** [weapon]
23. **Signal Whistle** [gear]
24. **Sling** [weapon]
25. **Small Knife** [gear]

### Mundane item sheet 7/7 (5×5 grid, 25 cells)

1. **Smith’s Tools** [tool]
2. **Soap** [gear]
3. **Spear** [weapon]
4. **Spell Scroll (Cantrip)** [gear]
5. **Spell Scroll (Level 1)** [gear]
6. **Spellbook** [gear]
7. **Spikes, Iron** [gear]
8. **Splint Armor** [armor]
9. **Spyglass** [gear]
10. **String** [gear]
11. **Studded Leather Armor** [armor]
12. **Tent** [gear]
13. **Thieves’ Tools** [tool]
14. **Tinderbox** [gear]
15. **Tinker’s Tools** [tool]
16. **Torch** [gear]
17. **Trident** [weapon]
18. **Vestments** [gear]
19. **Vial** [gear]
20. **War Pick** [weapon]
21. **Warhammer** [weapon]
22. **Waterskin** [gear]
23. **Weaver’s Tools** [tool]
24. **Whip** [weapon]
25. **Woodcarver’s Tools** [tool]

### Magic item sheet 1/8 (5×5 grid, 25 cells)

1. **Adamantine Armor** [Uncommon]
2. **Ammunition, +1, +2, or +3** [Uncommon]
3. **Amulet of Health** [Rare]
4. **Amulet of Proof against Detection and Location** [Uncommon]
5. **Amulet of the Planes** [Very Rare]
6. **Animated Shield** [Very Rare]
7. **Apparatus of the Crab** [Legendary]
8. **Armor of Invulnerability** [Legendary]
9. **Armor of Resistance** [Rare]
10. **Armor of Vulnerability** [Rare]
11. **Armor, +1, +2, or +3** [Rare]
12. **Arrow-Catching Shield** [Rare]
13. **Bag of Beans** [Rare]
14. **Bag of Devouring** [Very Rare]
15. **Bag of Holding** [Uncommon]
16. **Bag of Tricks** [Uncommon]
17. **Bead of Force** [Rare]
18. **Bead of Nourishment** [Common]
19. **Belt of Dwarvenkind** [Rare]
20. **Belt of Giant Strength** [Rarity Varies]
21. **Berserker Axe** [Rare]
22. **Boots of Elvenkind** [Uncommon]
23. **Boots of Levitation** [Rare]
24. **Boots of Speed** [Rare]
25. **Boots of Striding and Springing** [Uncommon]

### Magic item sheet 2/8 (5×5 grid, 25 cells)

1. **Boots of the Winterlands** [Uncommon]
2. **Bowl of Commanding Water Elementals** [Rare]
3. **Bracers of Archery** [Uncommon]
4. **Bracers of Defense** [Rare]
5. **Brazier of Commanding Fire Elementals** [Rare]
6. **Brooch of Shielding** [Uncommon]
7. **Broom of Flying** [Uncommon]
8. **Candle of Invocation** [Very Rare]
9. **Cape of the Mountebank** [Rare]
10. **Carpet of Flying** [Very Rare]
11. **Censer of Controlling Air Elementals** [Rare]
12. **Chime of Opening** [Rare]
13. **Circlet of Blasting** [Uncommon]
14. **Cloak of Arachnida** [Very Rare]
15. **Cloak of Displacement** [Rare]
16. **Cloak of Elvenkind** [Uncommon]
17. **Cloak of Protection** [Uncommon]
18. **Cloak of the Bat** [Rare]
19. **Cloak of the Manta Ray** [Uncommon]
20. **Crystal Ball** [Very Rare]
21. **Crystal Ball of Mind Reading** [Legendary]
22. **Crystal Ball of Telepathy** [Legendary]
23. **Crystal Ball of True Seeing** [Legendary]
24. **Cube of Force** [Rare]
25. **Dagger of Venom** [Rare]

### Magic item sheet 3/8 (5×5 grid, 25 cells)

1. **Dancing Sword** [Very Rare]
2. **Decanter of Endless Water** [Uncommon]
3. **Deck of Illusions** [Uncommon]
4. **Defender** [Legendary]
5. **Demon Armor** [Very Rare]
6. **Dimensional Shackles** [Rare]
7. **Dragon Scale Mail** [Very Rare]
8. **Dragon Slayer** [Rare]
9. **Dust of Disappearance** [Uncommon]
10. **Dust of Dryness** [Uncommon]
11. **Dust of Sneezing and Choking** [Uncommon]
12. **Dwarven Plate** [Very Rare]
13. **Efficient Quiver** [Uncommon]
14. **Efreeti Bottle** [Very Rare]
15. **Elemental Gem** [Uncommon]
16. **health**
17. **Elven Chain** [Rare]
18. **Energy Bow** [Very Rare]
19. **Eversmoking Bottle** [Uncommon]
20. **Eyes of Charming** [Uncommon]
21. **Eyes of Minute Seeing** [Uncommon]
22. **Eyes of the Eagle** [Uncommon]
23. **Feather Token** [Rarity Varies]
24. **Folding Boat** [Rare]
25. **Gauntlets of Ogre Power** [Uncommon]

### Magic item sheet 4/8 (5×5 grid, 25 cells)

1. **Giant Slayer** [Rare]
2. **Glamoured Studded Leather** [Rare]
3. **Gloves of Missile Snaring** [Uncommon]
4. **Gloves of Swimming and Climbing** [Uncommon]
5. **Gloves of Thievery** [Uncommon]
6. **Goggles of Night** [Uncommon]
7. **Handy Haversack** [Rare]
8. **Hat of Disguise** [Uncommon]
9. **Hat of Many Spells** [Very Rare]
10. **Headband of Intellect** [Uncommon]
11. **Helm of Comprehending Languages** [Uncommon]
12. **Helm of Telepathy** [Uncommon]
13. **Horn of Blasting** [Rare]
14. **Horn of Valhalla** [Rare]
15. **Horseshoes of a Zephyr** [Very Rare]
16. **Horseshoes of Speed** [Rare]
17. **Immovable Rod** [Uncommon]
18. **Instant Fortress** [Rare]
19. **Ioun Stone** [Rarity Varies]
20. **Iron Bands** [Rare]
21. **Iron Flask** [Legendary]
22. **Javelin of Lightning** [Uncommon]
23. **Lantern of Revealing** [Uncommon]
24. **Luck Blade** [Legendary]
25. **Mace of Smiting** [Rare]

### Magic item sheet 5/8 (5×5 grid, 25 cells)

1. **Mantle of Spell Resistance** [Rare]
2. **Manual of Bodily Health** [Very Rare]
3. **Manual of Gainful Exercise** [Very Rare]
4. **Manual of Golems** [Very Rare]
5. **Manual of Quickness of Action** [Very Rare]
6. **Marvelous Pigments** [Very Rare]
7. **Mirror of Life Trapping** [Very Rare]
8. **Mithral Armor** [Uncommon]
9. **Mysterious Deck** [Legendary]
10. **Necklace of Adaptation** [Uncommon]
11. **Necklace of Fireballs** [Rare]
12. **Necklace of Prayer Beads** [Rare]
13. **Nine Lives Stealer** [Very Rare]
14. **etherealness**
15. **sharpness**
16. **slipperiness**
17. **Pearl of Power** [Uncommon]
18. **Periapt of Health** [Uncommon]
19. **Periapt of Proof against Poison** [Rare]
20. **Periapt of Wound Closure** [Uncommon]
21. **love**
22. **Pipes of Haunting** [Uncommon]
23. **Pipes of the Sewers** [Uncommon]
24. **Plate Armor of Etherealness** [Legendary]
25. **Portable Hole** [Rare]

### Magic item sheet 6/8 (5×5 grid, 25 cells)

1. **animal friendship**
2. **clairvoyance**
3. **climbing**
4. **diminution**
5. **flying**
6. **gaseous form**
7. **giant strength**
8. **growth**
9. **heroism**
10. **invisibility**
11. **invulnerability**
12. **longevity**
13. **mind reading**
14. **resistance**
15. **speed**
16. **vitality**
17. **water breathing**
18. **Quarterstaff of the Acrobat** [Very Rare]
19. **Ring of Djinni Summoning** [Legendary]
20. **Ring of Feather Falling** [Rare]
21. **Ring of Free Action** [Rare]
22. **Ring of Invisibility** [Legendary]
23. **Ring of Jumping** [Uncommon]
24. **Ring of Mind Shielding** [Uncommon]
25. **Ring of Protection** [Rare]

### Magic item sheet 7/8 (5×5 grid, 25 cells)

1. **Ring of Regeneration** [Very Rare]
2. **Ring of Resistance** [Rare]
3. **Ring of Spell Storing** [Rare]
4. **Ring of Spell Turning** [Legendary]
5. **Ring of Swimming** [Uncommon]
6. **Ring of Telekinesis** [Very Rare]
7. **Ring of Three Wishes** [Legendary]
8. **Ring of Warmth** [Uncommon]
9. **Ring of Water Walking** [Uncommon]
10. **Ring of X-ray Vision** [Rare]
11. **Robe of Eyes** [Rare]
12. **Robe of Stars** [Very Rare]
13. **Robe of the Archmagi** [Legendary]
14. **Robe of Useful Items** [Uncommon]
15. **Rod of Absorption** [Very Rare]
16. **Rod of Alertness** [Very Rare]
17. **Rod of Rulership** [Rare]
18. **Rod of Security** [Very Rare]
19. **Rope of Climbing** [Uncommon]
20. **Rope of Entanglement** [Rare]
21. **Scimitar of Speed** [Very Rare]
22. **Sending Stones** [Uncommon]
23. **Sentinel Shield** [Uncommon]
24. **Shield of Missile Attraction** [Rare]
25. **Shield of the Cavalier** [Very Rare]

### Magic item sheet 8/8 (5×5 grid, 25 cells)

1. **Shield, +1, +2, or +3** [Uncommon]
2. **Slippers of Spider Climbing** [Uncommon]
3. **Sovereign Glue** [Legendary]
4. **Spell Scroll** [Rarity Varies]
5. **Spellguard Shield** [Very Rare]
6. **Sphere of Annihilation** [Legendary]
7. **Staff of the Python** [Uncommon]
8. **Stone of Controlling Earth Elementals** [Rare]
9. **Stone of Good Luck (Luckstone)** [Uncommon]
10. **Sword of Life Stealing** [Rare]
11. **Sword of Sharpness** [Very Rare]
12. **Talisman of the Sphere** [Legendary]
13. **Tome of Clear Thought** [Very Rare]
14. **Tome of Leadership and Influence** [Very Rare]
15. **Tome of Understanding** [Very Rare]
16. **Universal Solvent** [Legendary]
17. **Vicious Weapon** [Rare]
18. **Vorpal Sword** [Legendary]
19. **Wand of the War Mage, +1, +2, or +3** [Uncommon]
20. **Weapon of Warning** [Uncommon]
21. **Weapon, +1, +2, or +3** [Uncommon]
22. **Well of Many Worlds** [Legendary]
23. **Wind Fan** [Uncommon]
24. **Winged Boots** [Uncommon]
25. **Wings of Flying** [Rare]
