---
id: dungeon-loot-outlandish
type: table
domain: Session Mechanics / Dungeons
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
---

#dungeon-loot-outlandish
> **PROVISIONAL — Adam spot-check pending.** Added a single DM-only `Band` column
> (`utility`/`combat`/`high-power`/`reality-breaking`, `BATCH2-GUARDRAILS.md` H2, wave-2b
> maintenance) — every other cell in all 300 rows is byte-untouched. The band is a heuristic
> read of each item's effect text (not narrated to players); it exists so the DM can gauge an
> Outlandish drop's power level at a glance before handing it over.
>
> **PROVISIONAL — Adam spot-check pending.** Added a second DM-only `Realm` column
> (BATCH3-GUARDRAILS.md J2 "outlandish-realms" — the inventory-scan tag pass; docs/BREACH.md
> §2c point 2) mapping every row onto the frozen realm vocabulary in `data/realms.js`
> (frontier/chrome/noir/ash/suburb/cosmic/theater/high-seas/lost-world/gloom/bright-kingdom, or
> `realm-neutral` when a row has no strong home register) — every other cell, including the
> `Band` column, is byte-untouched (diff-audited: 0 cell mismatches). In-breach loot draws
> filter by the active breach's realm (BREACH.md §2c/§2e.3 sourcing supersede); Django-world
> yields six-guns and cursed silver, never the Super Scope. `frontier` landed thin from this
> scan (1 row: the Cowboy's Lasso) — the d300 is a modern-pop-culture grab-bag, not a western
> table by nature; the realm's own d100 table (a later unit) carries its real weight.
>
> **PROVISIONAL — Adam spot-check pending.** Added a third DM-only `Ranks` column (ADAM-REVIEW-1
> §2 THE TIER RULING, locked; `BATCH3-GUARDRAILS.md` J2's outlandish-realms closure: "the
> outlandish-realms unit adds ladders to the d300's high-power + reality-breaking rows") — every
> `high-power` row (49) and every `reality-breaking` row (4) carries a 2–4 rung ladder,
> `Rn(Lm) effect`, each rung an attunement-level prerequisite (active rank = highest rung the
> attuner's level reaches; rides the built attunement machinery, 3-slot cap governs).
> **Reality-breaking rungs floor at L9 ALWAYS** (all 4 rows: Flux Capacitor/Arc Reactor/DeLorean/
> Infinity Gauntlet start their R1 at L9). `utility`/`combat` rows carry no ladder (flat, per
> ADAM-REVIEW-1: "utility/combat = 1–2 rungs or flat" — left flat here; a future craft pass may
> add 2-rung ladders to standout utility/combat rows). Every other cell, including `Band` and
> `Realm`, is byte-untouched (diff-audited: 0 cell mismatches).

|**d300**|**Item Name**|**Origin**|**Effect / Description**|**Band**|**Realm**|**Ranks**|
|---|---|---|---|---|---|---|
|1|**The Red Ball**|_Pokémon_|Throw at a beast; on hit, it is trapped in a pocket dimension.|utility|bright-kingdom||
|2|**Original Game Boy**|_Reality_|Plays a tune; DC 12 WIS save or be _Charmed_ for 1 minute.|high-power|realm-neutral|R1(L1) the tune plays · R2(L5) the DC rises to 15|
|3|**Light-Saber (Hilt)**|_Star Wars_|+5 Finesse weapon; ignores all non-magical AC. Requires power.|combat|chrome||
|4|**Box of Reese’s Pieces**|_Reality_|20 pieces. Eating one grants _Levitate_ (5ft) for 1 minute.|high-power|realm-neutral|R1(L1) 5ft Levitate, 1 min · R2(L4) 10ft, 1 min · R3(L8) 20ft, 10 min|
|5|**Nike Air Jordan 1s**|_Reality_|+10ft movement. Can cast _Jump_ at will on flat ground.|utility|realm-neutral||
|6|**The Big Mac**|_Reality_|Food for 3 days. -5ft movement for 24 hours (lethargy).|utility|realm-neutral||
|7|**DeWalt 20V Drill**|_Reality_|2d10 piercing. Ignores resistance of stone/metal creatures.|combat|realm-neutral||
|8|**R2-D2 (Inactive)**|_Star Wars_|+10 bonus to hacking/disarming magical locks if repaired.|utility|chrome||
|9|**Nokia 3310**|_Reality_|Indestructible. Can be used as a thrown weapon (1d4).|combat|realm-neutral||
|10|**The One Ring (Replica)**|_Reality_|High-quality gold. Does nothing but makes holder paranoid.|utility|lost-world||
|11|**Can of Diet Coke**|_Reality_|Restores 1d4 sanity. Causes loud burping (-5 Stealth).|high-power|realm-neutral|R1(L1) 1d4 sanity, -5 Stealth (burp) · R2(L5) 2d4 sanity, no burp|
|12|**Portal Gun**|_Portal_|Creates two linked portals on flat, white surfaces.|utility|chrome||
|13|**T-60 Power Armor**|_Fallout_|+5 Full Plate (AC 23). Grants 24 STR. Requires Fusion Core.|high-power|ash|R1(L1) AC 20, 20 STR (Fusion Core required) · R2(L6) AC 23, 24 STR · R3(L9) no Core needed, 1/day self-recharge|
|14|**Acoustic Guitar**|_History_|+1d6 HP recovery during short rests if player "knows a song."|utility|theater||
|15|**Polaroid Camera**|_Reality_|Photo reveals the true form of any creature pictured.|high-power|realm-neutral|R1(L1) true form on a photo already taken · R2(L5) true form the instant the shutter clicks|
|16|**Hoverboard**|_BttF II_|40ft hover speed. Fails over water without "power."|utility|chrome||
|17|**Zippo Lighter**|_Reality_|Infinite flame source; lights even in magical wind.|utility|realm-neutral||
|18|**Blue Shell**|_Mario Kart_|Seeks out the creature with the highest HP; 8d10 Force damage.|combat|bright-kingdom||
|19|**M67 Frag Grenade**|_Reality_|Thrown (60ft). 5d6 piercing damage in a 20ft radius.|combat|chrome||
|20|**Starbucks Cup**|_Reality_|Casts _Haste_ for 2 rounds, then _Poisoned_ for 1 hour.|high-power|realm-neutral|R1(L1) Haste 1 round then Poisoned 1 hour · R2(L5) Haste 2 rounds, Poisoned halved|
|21|**Swiss Army Knife**|_Reality_|Advantage on Survival crafting; counts as Thieves' Tools.|high-power|realm-neutral|R1(L1) Thieves' Tools proficiency · R2(L4) advantage on Survival crafting|
|22|**Flux Capacitor**|_BttF_|Bypasses time. Requires a vehicle moving 88mph to activate.|reality-breaking|chrome|R1(L9) works only at 88mph in a moving vehicle · R2(L12) works at any speed above a gallop|
|23|**T-800 Arm**|_Terminator_|Prosthetic. STR becomes 24 for this arm; no sense of touch.|utility|chrome||
|24|**WD-40**|_Reality_|Ends "Restrained" condition on any mechanical object/trap.|combat|realm-neutral||
|25|**M4 Carbine**|_Reality_|2d10 piercing (Range 150/600). Multi-attack (2) per action.|combat|chrome||
|26|**Rubber Duck**|_Reality_|Squeak can be heard through magical _Silence_.|utility|realm-neutral||
|27|**Bop-It**|_Reality_|Must follow commands or take 1d4 psychic damage per round.|combat|realm-neutral||
|28|**Standard Glock 17**|_Reality_|2d8 piercing (Range 100). Requires 9mm ammunition.|combat|chrome||
|29|**Sonic Screwdriver**|_Dr. Who_|Automatically opens any non-wooden lock or latch.|utility|cosmic||
|30|**VHS: Shrek**|_Reality_|+5 Charisma with Ogres or swamp-dwelling creatures.|high-power|realm-neutral|R1(L1) +2 CHA with Ogres/swamp-dwellers · R2(L5) +5 CHA, they mistake you for kin|
|31|**Maglite Flashlight**|_Reality_|60ft cone of bright light. 1d6 bludgeoning as a club.|combat|realm-neutral||
|32|**Bottle of Sriracha**|_Reality_|Target hit by it is _Blinded_ and takes 1d4 fire damage.|combat|realm-neutral||
|33|**The Golden Snitch**|_Harry Potter_|Flying object. If caught, grants +50 XP to the catcher.|high-power|bright-kingdom|R1(L1) +10 XP on the catch · R2(L5) +50 XP, and it remembers you afterward|
|34|**Senzu Bean**|_Dragon Ball_|Fully restores all HP and removes all exhaustion. (1 use).|high-power|bright-kingdom|R1(L1) heals 4d4+4, removes 1 exhaustion level (1 use) · R2(L6) full heal + all exhaustion removed (1 use) · R3(L9) the bean regrows in 7 days instead of consuming|
|35|**Pip-Boy 3000**|_Fallout_|Displays map; tracks HP; +2 to Medicine and Science.|utility|ash||
|36|**Captain America's Shield**|_Marvel_|+3 Shield. Returns to hand when thrown. Resistance to Force.|combat|cosmic||
|37|**Box of 64 Crayola**|_Reality_|Can draw objects that become "real" for 10 seconds.|utility|realm-neutral||
|38|**Thermal Detonator**|_Star Wars_|10d6 Fire/Force damage in a 20ft radius. Vaporizes wood.|combat|chrome||
|39|**iPhone 15 (Dead)**|_Reality_|Mirror-like screen. Can be used to reflect gaze attacks.|combat|realm-neutral||
|40|**Stihl Chainsaw**|_Reality_|4d6 slashing. Double damage to plants/wood. Loud.|combat|realm-neutral||
|41|**Master Chief Mark VI Armor**|_Halo_|+4 Breastplate. Grants 15 Temp HP that regenerates every 2 rounds.|combat|chrome||
|42|**IKEA Allen Wrench**|_Reality_|Can disassemble any wooden furniture in 1 round.|utility|realm-neutral||
|43|**Laser Pointer**|_Reality_|Can distract any feline creature (including Sphinxes).|utility|realm-neutral||
|44|**M32 MGL (Grenade Launcher)**|_Reality_|Fire 6 grenades before reloading. 4d6 damage per hit.|combat|chrome||
|45|**Wilson Volleyball**|_Castaway_|Prevents insanity when alone; grants "Self-Help" guidance.|utility|realm-neutral||
|46|**M2 Flamethrower**|_Reality_|15ft cone. 4d6 fire damage. Targets are set ablaze.|combat|chrome||
|47|**Stun Gun**|_Reality_|Target must succeed DC 15 CON save or be _Stunned_.|combat|chrome||
|48|**Amazon Prime Box**|_Reality_|Contains a random item from the "Common Cache" table.|utility|realm-neutral||
|49|**A Rubik's Cube**|_Reality_|Solving (DC 20 INT) grants the _Identify_ spell on one item.|high-power|realm-neutral|R1(L1) DC 20 INT to Identify one item, 1 use · R2(L6) DC 15, and it never depletes|
|50|**GoPro Camera**|_Reality_|Records 1 hour of "vision." Can be played back in dreams.|high-power|realm-neutral|R1(L1) records 10 minutes of vision · R2(L5) 1 hour, playable in dreams|
|51|**The Neuralyzer**|_MIB_|Erase the last 5 minutes of a target's memory (1/day).|utility|realm-neutral||
|52|**Batarang (Sharp)**|_DC Comics_|1d8 slashing. +2 to hit. Always returns on a miss.|combat|noir||
|53|**Hover-Shoes**|_Sonic_|Can move across gaps up to 10ft without falling.|utility|bright-kingdom||
|54|**Identity Disc**|_Tron_|2d8 Force damage. Can be used to store a single spell.|combat|chrome||
|55|**Microchip**|_Reality_|Grants a construct +2 to all Intelligence checks.|high-power|realm-neutral|R1(L1) +1 INT to a construct you're bonded to · R2(L5) +2 INT to any construct present|
|56|**Flashbang Grenade**|_Reality_|DC 16 CON save or _Blinded_ and _Deafened_ for 1 minute.|combat|chrome||
|57|**Hogwarts Letter**|_Harry Potter_|If read aloud, the reader gains _Prestidigitation_ for 24h.|utility|bright-kingdom||
|58|**Energy Sword**|_Halo_|4d6 Lightning damage. +2 to hit. Power fades after 10 kills.|combat|chrome||
|59|**Lightsaber (Blue)**|_Star Wars_|Ignited: 3d10 radiant damage. Sheds 20ft bright light.|combat|chrome||
|60|**Wilson's Tennis Racket**|_Reality_|Can parry any projectile smaller than a boulder.|utility|realm-neutral||
|61|**Green Lantern Ring**|_DC Comics_|Creates any simple tool out of green light for 1 minute.|utility|noir||
|62|**Plasma Pistol**|_Halo_|2d8 Lightning. Charged shot disables mechanical constructs.|combat|chrome||
|63|**Inception Totem**|_Inception_|Tells you if you are currently under an Illusion or Sleep.|high-power|realm-neutral|R1(L1) tells you if you're Charmed · R2(L5) tells you if you're under Illusion or Sleep, always|
|64|**Ballistic Shield**|_Reality_|+3 Shield. Grants 3/4 cover against ranged attacks.|combat|realm-neutral||
|65|**Duff Beer**|_Simpsons_|Restores 5 HP. You feel +2 stronger and -2 stupider.|high-power|realm-neutral|R1(L1) heals 5 HP, +1/-1 STR/INT for 1 hour · R2(L5) heals 10 HP, +2/-2, no downside duration cap|
|66|**Poké Flute**|_Pokémon_|Instantly wakes any sleeping creature within 60ft.|high-power|bright-kingdom|R1(L1) wakes sleepers within 30ft · R2(L5) 60ft, ignores magical sleep too|
|67|**Master Ball**|_Pokémon_|100% catch rate on any non-boss creature. (1 use).|utility|bright-kingdom||
|68|**Mandalorian Helmet**|_Star Wars_|+2 AC. Integrated thermal vision and 360-degree audio.|utility|chrome||
|69|**Blue Jeans (Levi's)**|_Reality_|+1 AC (Natural). Immune to "Thorn" damage.|combat|realm-neutral||
|70|**Fender Stratocaster**|_Reality_|+5 to Bardic Inspiration; requires an "Amplifier."|high-power|realm-neutral|R1(L1) +2 to Bardic Inspiration (Amplifier required) · R2(L6) +5, and it charges itself overnight|
|71|**The Holy Grail (Monty Python)**|_Movie_|A wooden cup. If filled with ale, summons 1d4 swallows.|high-power|lost-world|R1(L1) summons 1d4 swallows when filled with ale, 1/day · R2(L6) summons on any liquid, 3/day|
|72|**Klingon Bat'leth**|_Star Trek_|2d6 slashing. Advantage on Intimidation.|combat|chrome||
|73|**Phaser (Type II)**|_Star Trek_|Settings: Stun (Paralyze), Kill (4d8 Force), or Disintegrate.|combat|chrome||
|74|**The Death Star Plans**|_Star Wars_|Reveals a critical weakness in any large fortress/castle.|high-power|chrome|R1(L1) reveals a weakness in a Small/Medium structure · R2(L6) any structure, however large|
|75|**Predator Mask**|_Predator_|Grants _See Invisibility_ and heat-signature vision.|high-power|chrome|R1(L1) heat-signature vision 30ft · R2(L5) See Invisibility + heat-vision 60ft|
|76|**Wrist-Mounted Mini-Nuke**|_Fallout_|One-time use. 20d6 Fire/Radiant in a 50ft radius. Lethal.|combat|ash||
|77|**Smoke Grenade**|_Reality_|Creates a 20ft radius of heavy obscuration for 5 minutes.|utility|chrome||
|78|**Jetpack (Friction-based)**|_Reality_|60ft fly speed. Extremely loud. Requires 1 gallon of oil.|high-power|realm-neutral|R1(L1) 60ft fly (1 gallon oil, loud) · R2(L6) 90ft fly, half the fuel cost · R3(L9) silent running, no fuel for 1 min/day|
|79|**Auto-Injector (Stimpak)**|_Fallout_|Bonus action: Regain 4d4+4 HP. Removes limb penalties.|utility|ash||
|80|**The Necronomicon (Fake)**|_Reality_|A prop book. Reading it makes your eyes glow red briefly.|utility|realm-neutral||
|81|**Davy Crockett Launcher**|_History_|Fires a tactical nuke. 15d10 damage. Likely kills the user.|combat|theater||
|82|**A Box of 'Wheaties'**|_Reality_|Eating these gives +2 to Athletics for 1 hour.|utility|realm-neutral||
|83|**Legolas's Hair Gel**|_Movie_|Your hair never gets messy, even in combat. +1 Charisma.|utility|lost-world||
|84|**Freddy Krueger's Glove**|_Horror_|1d4 slashing. Can enter the dreams of a sleeping target.|combat|gloom||
|85|**Jason’s Hockey Mask**|_Horror_|Immunity to _Fear_. -4 to all Persuasion checks.|high-power|gloom|R1(L1) Immune to Fear, -2 Persuasion · R2(L5) -4 Persuasion becomes -1 (the mask learns to smile)|
|86|**Nano-Suit**|_Crysis_|+2 AC. Can spend a charge to gain +10 STR or Invisibility.|high-power|chrome|R1(L1) +1 AC, 1 charge/day (+5 STR or Invisibility 1 min) · R2(L6) +2 AC, 2 charges/day · R3(L9) charges refresh on a short rest|
|87|**Willy Wonka’s Golden Ticket**|_Movie_|Can be traded to any merchant for their most expensive item.|utility|bright-kingdom||
|88|**Cryo Grenade**|_Reality_|4d6 Cold damage. Targets must DC 14 CON or be _Restrained_.|combat|chrome||
|89|**Bane’s Mask**|_DC Comics_|You ignore the effects of 1 level of Exhaustion.|utility|noir||
|90|**Spiderman’s Webshooter**|_Marvel_|Cast _Web_ 3/day. Refillable with "Synthetic Fluid."|utility|chrome||
|91|**The Ruby Slippers**|_Oz_|Click heels 3 times to cast _Word of Recall_ (Home).|high-power|bright-kingdom|R1(L1) Word of Recall 1/week · R2(L6) 1/day|
|92|**A DVD of 'The Matrix'**|_Reality_|Studying the disc grants +2 to Initiative.|utility|realm-neutral||
|93|**A 19th Century Musket**|_History_|1d12 piercing. Takes 2 rounds to reload.|combat|theater||
|94|**A Literal Kitchen Sink**|_Reality_|Thrown weapon (2d10). Always lands on the target.|combat|realm-neutral||
|95|**Wonder Woman’s Lasso**|_DC Comics_|Target grappled by it must tell the truth (DC 18 WIS).|combat|noir||
|96|**The Mystery Machine**|_Scooby-Doo_|A colorful van. Grants advantage on investigating "ghosts."|high-power|realm-neutral|R1(L1) advantage investigating hauntings while inside it · R2(L5) advantage extends to anyone riding along|
|97|**Claymore Mine**|_Reality_|"Front Toward Enemy." 6d10 piercing in a 30ft cone.|combat|realm-neutral||
|98|**Iron Man’s Arc Reactor**|_Marvel_|Infinite power source for any mechanical device.|reality-breaking|chrome|R1(L9) powers one mechanical device indefinitely · R2(L12) powers any number of devices you've touched|
|99|**The DeLorean**|_BttF_|A vehicle that can travel through time. (Requires 1.21GW).|reality-breaking|chrome|R1(L9) time travel, requires 1.21 GW (a lightning strike or equivalent) · R2(L12) requires only a hard sprint|
|100|**The Bible (King James)**|_History_|+2 to Religion checks. Can be used as a shield against demons.|combat|theater||
|101|**Fire Flower**|_Mario_|You can cast _Produce Flame_ for 1 minute; then it wilts.|utility|bright-kingdom||
|102|**Crowbar (Gordon Freeman)**|_Half-Life_|1d8 bludgeoning. Critical hit against "Head-Crabs."|combat|chrome||
|103|**Mjölnir (Paperweight)**|_Marvel_|Too heavy to move unless you have 20 STR.|utility|cosmic||
|104|**Sauron’s Eye (Paperweight)**|_LoTR_|Follows everyone in the room with its gaze. Creepy.|utility|lost-world||
|105|**Night Vision Goggles**|_Reality_|Darkvision 120ft. Sunlight causes the _Blinded_ condition.|combat|chrome||
|106|**Bubble Wrap**|_Reality_|Popping it reduces stress (removes _Frightened_).|utility|realm-neutral||
|107|**A Jar of Pickles**|_Reality_|The juice can be used to wake up unconscious players.|utility|realm-neutral||
|108|**Darth Vader's Helmet**|_Star Wars_|Voice becomes deep; +5 to Intimidation. Hard to see.|high-power|chrome|R1(L1) +2 Intimidation, breathing audible · R2(L5) +5 Intimidation, and the breathing itself unsettles (frightens on a failed save once/encounter)|
|109|**Bulletproof Vest**|_Reality_|Resistance to non-magical piercing damage. AC 14.|combat|chrome||
|110|**The Elder Wand (Plastic)**|_Harry Potter_|Looks real. If used for magic, it snaps immediately.|utility|bright-kingdom||
|111|**Bottle of Febreze**|_Reality_|Removes any "Stinking Cloud" or "Odor" effect instantly.|utility|realm-neutral||
|112|**Electric Toothbrush**|_Reality_|Can be used to vibrate through simple mechanical locks.|utility|realm-neutral||
|113|**The Rosetta Stone**|_History_|Grants the _Comprehend Languages_ spell permanently.|high-power|theater|R1(L1) Comprehend Languages 1/day · R2(L6) permanent, always active|
|114|**A 1TB Flash Drive**|_Reality_|Contains the "entirety of human knowledge." Useless without PC.|utility|realm-neutral||
|115|**A Can of Pringles**|_Reality_|Once you pop, you can't stop (must finish in one sitting).|utility|realm-neutral||
|116|**The 'Easy' Button**|_Staples_|When pressed, it says "That was easy." Does nothing else.|utility|realm-neutral||
|117|**A Slinky**|_Reality_|Can walk down stairs by itself. Provides 1d4 joy.|utility|realm-neutral||
|118|**A Snickers Bar**|_Reality_|Removes "Enraged" or "Berserk" status from a creature.|utility|realm-neutral||
|119|**A Rubik's Snake**|_Reality_|Can be folded into a +1 Dagger for 1 minute.|combat|realm-neutral||
|120|**RPG-7 Rocket Launcher**|_Reality_|8d10 Fire/Force. Range 200ft. Reload takes 1 action.|combat|chrome||
|121|**A Jar of 'Slime'**|_Reality_|Can be thrown to create _Grease_ in a 5ft square.|utility|realm-neutral||
|122|**A Polaroid of the DM**|_Cosmic_|A photo of a person in a room with dice. Very confusing.|utility|cosmic||
|123|**A Box of Tacks**|_Reality_|Deals 1 piercing damage to anyone walking barefoot.|combat|realm-neutral||
|124|**A Super Soaker**|_Reality_|Deals 1d4 "wet" damage. Lethal to Fire Elementals.|combat|realm-neutral||
|125|**A Selfie Stick**|_Reality_|Allows the user to see around corners without exposure.|utility|realm-neutral||
|126|**A Weighted Blanket**|_Reality_|Grants immunity to the _Frightened_ condition while resting.|high-power|realm-neutral|R1(L1) immune to Frightened while resting · R2(L5) immune to Frightened for 1 hour after waking too|
|127|**A Bag of Beef Jerky**|_Reality_|Provides food for 1 day. Salty (requires double water).|utility|realm-neutral||
|128|**A Master Lock**|_Reality_|Cannot be picked by anyone with less than 18 DEX.|utility|realm-neutral||
|129|**Combat Knife (Ka-Bar)**|_Reality_|1d6 piercing. Bonus action to attack if you hit with a primary.|combat|realm-neutral||
|130|**A Bag of Frozen Peas**|_Reality_|Heals 1d4 damage from bruises or blunt force.|combat|realm-neutral||
|131|**A 'Hang In There' Poster**|_Reality_|+1 to all Saving Throws for the party for 1 hour.|utility|realm-neutral||
|132|**A Hand Sanitizer**|_Reality_|Kills 99.9% of bacteria. Grants resistance to Disease.|combat|realm-neutral||
|133|**A Box of Pizza**|_Reality_|Restores 2d8 HP to the entire party. Delicious.|high-power|realm-neutral|R1(L1) heals 1d8 to up to 4 allies · R2(L5) 2d8 to the whole party|
|134|**A Stapler**|_Reality_|Can "fix" two pieces of fabric or paper together forever.|utility|realm-neutral||
|135|**A Roll of Duct Tape**|_Reality_|Can repair any non-magical item. It is "Legendary" tape.|utility|realm-neutral||
|136|**A Pair of Crocs**|_Reality_|+5 to Stealth in water; -5 to Charisma everywhere else.|high-power|realm-neutral|R1(L1) +2 Stealth in water, -2 CHA elsewhere · R2(L5) +5/-5 (the full trade)|
|137|**A Yoga Mat**|_Reality_|Resting on this grants advantage on the next DEX save.|high-power|realm-neutral|R1(L1) advantage on the next DEX save after resting on it · R2(L5) advantage on the next TWO|
|138|**A Bag of Skittles**|_Reality_|Eating one changes your skin color to that color for 1h.|utility|realm-neutral||
|139|**A Bottle of Champagne**|_Reality_|When popped, everyone within 10ft feels "Celebratory."|utility|realm-neutral||
|140|**Tear Gas Canister**|_Reality_|10ft cloud. DC 15 CON or _Blinded_ and _Incapacitated_.|combat|realm-neutral||
|141|**A 'World's Best Boss' Mug**|_The Office_|Grants +1 to Leadership/Persuasion.|utility|realm-neutral||
|142|**A Fidget Cube**|_Reality_|While clicking, you are immune to the _Boredom_ effect.|high-power|realm-neutral|R1(L1) immune to Boredom while clicking · R2(L5) immune to Boredom for 1 hour after|
|143|**A Magic 8-Ball**|_Reality_|Ask a question; has a 50% chance to be a _Divination_.|high-power|realm-neutral|R1(L1) 25% chance of a true Divination per question, 1/day · R2(L6) 50% chance, 3/day|
|144|**A Nintendo Switch**|_Reality_|Battery is at 1%. You have 3 minutes of "Joy."|utility|realm-neutral||
|145|**A Box of LEGOs**|_Reality_|If scattered, deals 5d10 piercing to barefoot enemies.|combat|realm-neutral||
|146|**Desert Eagle .50 AE**|_Reality_|2d12 piercing. Target must DC 12 STR or be pushed 5ft.|combat|realm-neutral||
|147|**Glow Stick**|_Reality_|Bright light for 1 hour. Cannot be extinguished.|utility|realm-neutral||
|148|**A Silly Straw**|_Reality_|Any liquid drunk through this becomes non-poisonous.|utility|realm-neutral||
|149|**A Whoopee Cushion**|_Reality_|Provides advantage on a Performance check for comedy.|high-power|realm-neutral|R1(L1) advantage on one Performance check for comedy, 1/day · R2(L5) 3/day|
|150|**A Snow Globe**|_Reality_|When shaken, it starts snowing in a 10ft radius.|utility|realm-neutral||
|151|**Kevlar Helmet**|_Reality_|Immunity to critical hits from non-magical projectiles.|high-power|chrome|R1(L1) resistance to crits from non-magical projectiles · R2(L6) full immunity|
|152|**A Flashlight (UV)**|_Reality_|Reveals "hidden" fluids or secret messages.|utility|realm-neutral||
|153|**A Bag of Popcorn**|_Reality_|When eaten, you can watch combat as a "spectator."|utility|realm-neutral||
|154|**A Kazoo**|_Reality_|Playing it forces a DC 10 Concentration check on others.|utility|realm-neutral||
|155|**A Stress Ball**|_Reality_|Squeezing it grants +1 to your next attack roll.|combat|realm-neutral||
|156|**A Box of Q-Tips**|_Reality_|Cleans ears; grants +2 to Wisdom (Perception) for 1h.|utility|realm-neutral||
|157|**Tactical Tomahawk**|_Reality_|1d8 slashing (Finesse/Thrown). Can pull shields aside.|combat|realm-neutral||
|158|**A Tape Measure**|_Reality_|Can measure exactly up to 25ft. Very precise.|utility|realm-neutral||
|159|**A Highlighter**|_Reality_|Anything marked with this glows for 24 hours.|utility|realm-neutral||
|160|**A Post-It Note**|_Reality_|Sticks to any surface and never falls off.|utility|realm-neutral||
|161|**A Paper Clip**|_Reality_|Can be used as a makeshift lockpick or wire.|utility|realm-neutral||
|162|**A Rubber Band**|_Reality_|Can be shot to deal 1 damage. Very annoying.|combat|realm-neutral||
|163|**A Bottle of Glue**|_Reality_|Sticks two things together. Requires 1 hour to dry.|utility|realm-neutral||
|164|**A Pair of Safety Goggles**|_Reality_|Immunity to being _Blinded_ by dust or sand.|combat|realm-neutral||
|165|**A Compass (Digital)**|_Reality_|Points to the nearest source of "Electricity."|utility|realm-neutral||
|166|**A Hand Warmer**|_Reality_|Stays warm for 8 hours. One-time use.|utility|realm-neutral||
|167|**C4 Explosive Block**|_Reality_|8d6 damage. Requires a "Detonator" to explode.|combat|chrome||
|168|**A Toaster (No Power)**|_Reality_|A shiny metal box. Can reflect 100% of light.|utility|realm-neutral||
|169|**A Hairbrush**|_Reality_|+1 to Charisma if used before a social encounter.|utility|realm-neutral||
|170|**A Calculator**|_Reality_|Can solve any math problem instantly. No signal needed.|utility|realm-neutral||
|171|**A Wristwatch**|_Reality_|Tells the exact time. Always accurate to the second.|utility|realm-neutral||
|172|**A Jar of Peanut Butter**|_Reality_|Food for 5 days. High protein (+1 STR for 1h).|utility|realm-neutral||
|173|**A Box of Matches**|_Reality_|20 matches. Lights instantly on any rough surface.|utility|realm-neutral||
|174|**A Thermos**|_Reality_|Keeps any liquid at its current temp for 24 hours.|utility|realm-neutral||
|175|**A Plastic Whistle**|_Reality_|Can be heard up to 2 miles away.|utility|realm-neutral||
|176|**A Magnifying Glass**|_Reality_|Can start a fire if the sun is out.|combat|realm-neutral||
|177|**Taser X2**|_Reality_|Ranged (15ft). DC 17 CON or be _Paralyzed_ (1 minute).|combat|chrome||
|178|**A Bottle of Aspirin**|_Reality_|Removes the "Headache" or "Confusion" status.|utility|realm-neutral||
|179|**A Can of WD-40**|_Reality_|Lubricates any hinge; eliminates "Squeaky Door" sounds.|utility|realm-neutral||
|180|**A Travel Pillow**|_Reality_|Resting while sitting up still counts as a Long Rest.|utility|realm-neutral||
|181|**A Solar Calculator**|_Reality_|Works only in direct sunlight.|utility|realm-neutral||
|182|**A Spatula**|_Reality_|Advantage on cooking checks involving flipping.|high-power|realm-neutral|R1(L1) advantage on cooking checks involving flipping · R2(L4) advantage on ALL cooking checks|
|183|**A Roll of Tin Foil**|_Reality_|Can be used to make a hat that blocks _Detect Thoughts_.|utility|realm-neutral||
|184|**A Bag of Ice**|_Reality_|Lasts for 1 hour. Can freeze a 1ft area of water.|utility|realm-neutral||
|185|**A Box of Band-Aids**|_Reality_|Heals 1 HP. Comes in fun patterns.|utility|realm-neutral||
|186|**A Can of Pringles (Empty)**|_Reality_|Can be used as a megaphone or echo-chamber.|utility|realm-neutral||
|187|**A Pair of Sunglasses**|_Reality_|+2 to Intimidation; -2 to Perception in the dark.|utility|realm-neutral||
|188|**A Battery (9V)**|_Reality_|Touching your tongue to it deals 1 lightning damage.|combat|realm-neutral||
|189|**A Bottle of Shampoo**|_Reality_|Makes hair incredibly soft and manageable.|utility|realm-neutral||
|190|**Bear Trap**|_Reality_|1d10 piercing. Target is _Restrained_ (DC 13 STR).|combat|realm-neutral||
|191|**A Bag of Pretzels**|_Reality_|Makes the consumer very thirsty.|utility|realm-neutral||
|192|**A Plastic Bag**|_Reality_|Completely waterproof; can hold 2 gallons.|utility|realm-neutral||
|193|**A Toothbrush**|_Reality_|Cleans any tiny crevice or gear.|utility|realm-neutral||
|194|**A Bar of Soap**|_Reality_|Can make a 5ft area slippery as an action.|utility|realm-neutral||
|195|**A Comb**|_Reality_|Can be used to find static electricity.|utility|realm-neutral||
|196|**A Pack of Gum**|_Reality_|Chewing it grants +1 to Concentration.|utility|realm-neutral||
|197|**A Bag of Marbles**|_Reality_|Scatter to force a DC 12 DEX save or fall _Prone_.|utility|realm-neutral||
|198|**A Box of Tissue**|_Reality_|Helpful for NPCs who are crying.|utility|realm-neutral||
|199|**A Keychain**|_Reality_|Holds up to 10 keys; they never get lost.|utility|realm-neutral||
|200|**A Ballpoint Pen**|_Reality_|Writes upside down and underwater.|utility|realm-neutral||
|201|**The Rosetta Stone**|_History_|Translates any ancient text into a modern tongue.|utility|theater||
|202|**A Spartan Shield**|_History_|+2 Shield. You cannot be pushed back while holding it.|combat|theater||
|203|**A Katana (Masamune)**|_History_|+2 Slashing. Can cut through silk as it falls.|combat|theater||
|204|**Napoleon's Hat**|_History_|+5 to Tactical/War checks; makes you look shorter.|high-power|theater|R1(L1) +2 Tactical/War checks · R2(L5) +5, and allies within 30ft add +1|
|205|**A Roman Gladius**|_History_|+1 Shortsword. Advantage on attacks in formation.|combat|theater||
|206|**A Viking Axe**|_History_|+1 Battleaxe. Can be thrown without penalty.|combat|theater||
|207|**A Piece of the Berlin Wall**|_History_|Grants resistance to Force damage.|combat|theater||
|208|**The Magna Carta**|_History_|Grants the user "Legal Immunity" for one minor crime.|high-power|theater|R1(L1) legal immunity for one minor crime, 1 use · R2(L6) 1 use per year|
|209|**A Samurai Kabuto**|_History_|Immunity to being _Frightened_ from the front.|high-power|theater|R1(L1) immune to Frightened from the front · R2(L5) immune to Frightened from any direction|
|210|**A Pharaoh’s Crook**|_History_|Animals within 30ft are docile to you.|utility|lost-world||
|211|**A Knight’s Gauntlet**|_History_|Your punch deals 1d4 + STR bludgeoning.|combat|theater||
|212|**A Native American Headdress**|_History_|+2 to Wisdom (Medicine) and (Survival).|utility|theater||
|213|**A Pirate’s Cutlass**|_History_|+1 Scimitar. Advantage on Acrobatics on ships.|high-power|high-seas|R1(L1) +1 Scimitar · R2(L5) +2, advantage on Acrobatics on any unstable footing|
|214|**A Cowboy’s Lasso**|_History_|Can grapple targets up to 15ft away.|combat|frontier||
|215|**A Renaissance Lute**|_History_|Music played on this attracts "Nobles."|utility|theater||
|216|**A WWI Trench Knife**|_History_|1d4 piercing + 1d4 bludgeoning (brass knuckles).|combat|theater||
|217|**A Gas Mask**|_History_|Immunity to "Inhaled" poisons or gases.|high-power|theater|R1(L1) immune to inhaled poisons · R2(L4) immune to inhaled poisons AND gases|
|218|**A Civil War Bugle**|_History_|When blown, grants 5 Temp HP to all allies.|high-power|theater|R1(L1) 5 Temp HP to allies within 30ft · R2(L5) 5 Temp HP within 60ft, once/short rest|
|219|**A Shakespearean Script**|_History_|Reading from it grants +5 to Performance.|high-power|theater|R1(L1) +2 Performance while reading from it · R2(L5) +5, memorized lines apply anywhere|
|220|**A Piece of the Titanic**|_History_|A rusted bolt. You are always cold to the touch.|utility|high-seas||
|221|**A Wright Brothers' Propeller**|_History_|If spun, creates a 30ft gust of wind.|utility|chrome||
|222|**An Egyptian Scarab**|_History_|Protects the holder from "Mummy’s Curse."|utility|lost-world||
|223|**A Mongolian Bow**|_History_|Longbow. No penalty for firing while mounted.|combat|theater||
|224|**A Celtic Torc**|_History_|+1 to all Constitution saving throws.|utility|lost-world||
|225|**An Aztec Macuahuitl**|_History_|2d6 slashing. Critical hits cause _Bleeding_.|combat|theater||
|226|**A Zulu Iklwa**|_History_|Spear. Can be used as a bonus action to strike.|combat|theater||
|227|**A Musketeer’s Rapier**|_History_|+1 Rapier. Advantage on Initiative.|high-power|theater|R1(L1) +1 Rapier · R2(L5) +2, advantage on Initiative|
|228|**A Ninja’s Kunai**|_History_|Can be used as a piton or a throwing knife.|combat|theater||
|229|**A Monk’s Staff (Shaolin)**|_History_|+1 Quarterstaff. Can deflect arrows on a DC 15 DEX.|combat|theater||
|230|**A Gladiator’s Trident**|_History_|If you hit a target, you can attempt to trip them.|utility|theater||
|231|**A Tesla Coil (Portable)**|_History_|Deals 3d6 Lightning damage to anything touching it.|combat|chrome||
|232|**Einstein’s Blackboard**|_History_|Looking at it grants +2 to Intelligence for 1 hour.|utility|chrome||
|233|**A Piece of Sputnik**|_History_|A metal ball that beeps. Attracts lightning.|combat|chrome||
|234|**A Moon Rock**|_History_|Gravity is halved within 5ft of this rock.|utility|cosmic||
|235|**A Piece of the Hindenburg**|_History_|Very flammable. Explodes for 4d6 fire if ignited.|combat|theater||
|236|**The Liberty Bell (Mini)**|_History_|When rung, cures the _Deafened_ condition.|high-power|theater|R1(L1) cures Deafened on ring, 1/day · R2(L5) 3/day, and rings itself when needed|
|237|**A Golden Buddha**|_History_|Grants +2 to Wisdom (Insight).|utility|lost-world||
|238|**A Totem Pole**|_History_|Can be planted to protect a 20ft area from spirits.|utility|lost-world||
|239|**A Stone from the Pyramids**|_History_|Weighs 500 lbs. Indestructible.|utility|lost-world||
|240|**A Piece of the Great Wall**|_History_|Grants +1 to AC when taking the Dodge action.|combat|theater||
|241|**A Shrunken Head**|_History_|Can speak 1 word: "Run."|utility|gloom||
|242|**A Witch’s Cauldron**|_History_|Anything cooked in it tastes like "Evil."|utility|gloom||
|243|**A Crystal Skull**|_History_|Can store 1 level of psychic energy.|high-power|gloom|R1(L1) stores 1 level of psychic energy · R2(L6) stores 2 levels, releasable as a shared Guidance|
|244|**A Mammoth Tusk**|_History_|+1 Greatclub. Double damage to structures.|combat|lost-world||
|245|**A Fossilized Egg**|_History_|If kept warm for a year, a dinosaur might hatch.|utility|lost-world||
|246|**A Caveman’s Club**|_History_|1d10 bludgeoning. Very simple.|combat|lost-world||
|247|**A Piece of Amber (with Bug)**|_History_|Contains DNA of a forgotten beast.|utility|lost-world||
|248|**A Mayan Calendar**|_History_|Predicts the exact date of the next eclipse.|utility|lost-world||
|249|**A Greek Amphora**|_History_|Wine inside never turns to vinegar.|utility|high-seas||
|250|**The Spear of Destiny**|_History_|+3 Spear. Deals double damage to Divine beings.|combat|theater||
|251|**Pulse Rifle**|_Aliens_|3d8 piercing. 1d6 grenade launcher alt-fire. Range 200ft.|combat|chrome||
|252|**Mjolnir Powered Armor**|_Halo_|AC 22. Grants _Haste_ as a permanent effect while powered.|high-power|chrome|R1(L1) AC 20, Haste for 1 min/day while powered · R2(L7) AC 22, Haste permanent while powered · R3(L9) Haste persists 1 min after power cuts|
|253|**Gravity Gun**|_Half-Life_|Can pick up and launch objects up to 500lbs.|utility|chrome||
|254|**A Lightsaber (Purple)**|_Star Wars_|Ignited: 3d10 Radiant. Advantage on Charisma saves.|combat|chrome||
|255|**BFG 9000**|_Doom_|20d10 Lightning/Fire in a 100ft line. Vaporizes everything.|combat|chrome||
|256|**T-1000 Liquid Metal**|_Terminator_|A jar of goo. Can form into any simple metal object or weapon.|combat|chrome||
|257|**Fat Man Launcher**|_Fallout_|Catapults a mini-nuke 200ft. God help everyone nearby.|combat|ash||
|258|**Hidden Blade**|_Assassin's Creed_|1d6 piercing. Advantage on attacks against unaware targets.|combat|realm-neutral||
|259|**Needler**|_Halo_|2d4 piercing. After 3 hits, the needles explode for 3d6.|combat|chrome||
|260|**Auto-Shotgun**|_Reality_|4d6 piercing (15ft cone). Multi-attack (3) per action.|combat|chrome||
|261|**A Pikachu Plush**|_Pokémon_|If squeezed, it says "Pika!"|utility|bright-kingdom||
|262|**A Yoda Figure**|_Star Wars_|Says "Help you I can" when pressed.|utility|chrome||
|263|**Combat Stim**|_Reality_|Bonus action: Double movement and +2 AC for 1 minute.|combat|chrome||
|264|**Railgun**|_Quake_|5d10 piercing in a 100ft straight line. Ignores all cover.|combat|chrome||
|265|**A One Ring (Plastic)**|_LoTR_|Makes you feel like you're invisible (you aren't).|high-power|lost-world|R1(L1) you feel invisible (you aren't) · R2(L5) creatures with passive Perception under 15 actually don't notice|
|266|**Kevlar Shield**|_Reality_|+2 Shield. Weighs only 5 lbs.|combat|chrome||
|267|**Cloaking Device**|_Predator_|Invisibility for 1 minute. Moving at half speed keeps it active.|high-power|chrome|R1(L1) invisible 1 min, full speed breaks it · R2(L6) invisible 1 min, half speed keeps it · R3(L9) invisible 3 min, any speed keeps it|
|268|**Auto-Turret**|_Reality_|Deploys to fire 2d8 damage at anything that moves in 30ft.|combat|chrome||
|269|**A Tardis (Model)**|_Dr. Who_|Bigger on the inside (can hold 1 coin).|utility|cosmic||
|270|**A Death Star (Model)**|_Star Wars_|A gray ball.|utility|chrome||
|271|**Riot Armor**|_Reality_|+3 Breastplate. Resistance to Bludgeoning damage.|combat|chrome||
|272|**A Poké Flute (Toy)**|_Pokémon_|Makes a high-pitched squeak.|utility|bright-kingdom||
|273|**M82 Barrett Sniper**|_Reality_|4d12 piercing (Range 1000/2000). Must be prone to fire.|combat|chrome||
|274|**A Dragon Ball (4-Star)**|_Dragon Ball_|A glowing orange ball.|utility|bright-kingdom||
|275|**A Master Ball (Toy)**|_Pokémon_|Doesn't catch anything.|utility|bright-kingdom||
|276|**Incendiary Grenade**|_Reality_|5d6 fire damage. Area burns for 3 rounds.|combat|chrome||
|277|**Flash Drive (Encrypted)**|_Reality_|DC 25 INT to open. Contains coordinates to "The Cache."|utility|realm-neutral||
|278|**A Darth Vader Figure**|_Star Wars_|Breathes heavily.|utility|chrome||
|279|**A Stormtrooper Figure**|_Star Wars_|Cannot hit anything it's thrown at.|utility|chrome||
|280|**Anti-Tank Mine**|_Reality_|10d10 Force damage. Requires 500lbs of pressure to trigger.|combat|realm-neutral||
|281|**Hedgehog Sonic figure**|_Sonic_|It looks fast.|utility|bright-kingdom||
|282|**A Batman Figure**|_DC Comics_|It’s dark and moody.|utility|noir||
|283|**A Superman Figure**|_DC Comics_|It can fly (if you throw it).|utility|noir||
|284|**A Joker Figure**|_DC Comics_|It’s laughing.|utility|noir||
|285|**A Wonder Woman Figure**|_DC Comics_|It has a lasso.|utility|noir||
|286|**A Flash Figure**|_DC Comics_|It looks fast.|utility|noir||
|287|**A Green Lantern Figure**|_DC Comics_|It’s green.|utility|noir||
|288|**A Robin Figure**|_DC Comics_|It’s the sidekick.|utility|noir||
|289|**A Catwoman Figure**|_DC Comics_|It has a whip.|utility|noir||
|290|**A Penguin Figure**|_DC Comics_|It has an umbrella.|utility|noir||
|291|**A Riddler Figure**|_DC Comics_|It has a question mark.|utility|noir||
|292|**A Two-Face Figure**|_DC Comics_|It has a coin.|utility|noir||
|293|**A Bane Figure**|_DC Comics_|It’s big.|utility|noir||
|294|**A Batmobile (Toy)**|_DC Comics_|It’s a black car.|utility|noir||
|295|**A Batwing (Toy)**|_DC Comics_|It’s a black plane.|utility|noir||
|296|**A Batcave (Model)**|_DC Comics_|It’s a dark cave.|utility|noir||
|297|**A Bat-Signal (Toy)**|_DC Comics_|It’s a small light.|utility|noir||
|298|**A Batarang (Toy)**|_DC Comics_|It’s a plastic bat.|utility|noir||
|299|**A Bat-Belt (Toy)**|_DC Comics_|It has many pockets (all empty).|utility|noir||
|300|**The Infinity Gauntlet (Real)**|_Marvel_|Can rewrite reality. (Requires 6 Infinity Gems).|reality-breaking|cosmic|R1(L9) one Infinity Gem's effect, if socketed · R2(L12) two Gems · R3(L15) three Gems, reality bends locally · R4(L18) all six — full reality rewrite, once|
^dungeon-loot-outlandish
