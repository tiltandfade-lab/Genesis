---
type: scratch
status: experimental
created: 2026-07-09
realm: ash
---

# Sprite Batch Prompts — Ash (post-apocalyptic, the world already ended once)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Ash realm bestiary (118 monsters) plus a
themed NPC roster (43 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): bleached-bone and rust-orange palette over ash-grey ground, heavy dither/grain for a scorched-air haze, cracked/scarred skin or plating textures, one ember-glow high-value accent per sprite.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (118 total, 5 sheets)

### Monster sheet 1/5

1. **Rustfall Ghoul** — radiation-mad wretch scavenging rubble on hunger reflex
2. **Scrap-Hound** — mutant feral dog pack hunting the broken highway
3. **Rat-King's Swarm** — boiling mutant rat carpet nesting in dead-town pipes
4. **Warband Ganger** — spiked-jacket raider grunt running a warband's front line
5. **Bomb-Cult Zealot** — ordnance-strapped zealot singing the mushroom-cloud hymn
6. **Geiger Wretch** — glowing irradiated corpse that never stopped ticking
7. **Blistered Stalker** — hairless mutant hound drawn to a running engine
8. **Chem-Huffer** — stim-shaking raider swinging a pipe with pure rage
9. **Cracked Sentry-Bot** — dying pre-Fall security drone patrolling a dead route
10. **Fuel-Cult Firestarter** — promethium-doused cult officer preaching detonation as sacrament
11. **Mutant Behemoth Hog** — fallout-swollen boar that charges convoys tusks-first
12. **Irradiated Ghast** — faster hungrier ghoul cooked past rot by fallout
13. **Warband Enforcer** — raider muscle enforcing the warband's chain of debt
14. **Chitin-Plated Feral** — half-beast mutant grown a cracked chitin hide
15. **Power-Rig Brute** — raider bolted into a scavenged hydraulic exo-rig
16. **Diesel Golem** — patchwork engine-block war-machine lurching on stolen fuel
17. **Last-Light Keeper** — settlement champion fighting to keep the generator alive
18. **Fallout Stalker** — silent radiation-zone apex hunter
19. **Convoy Warlord** — road-baron ruling a raider convoy by ambush and fear
20. **Vault Revenant** — ageless bunker-dweller returned furious the seal broke
21. **Apex Ferox** — ash-pelted apex predator that hunts raiders for sport
22. **War-Rig Juggernaut** — warlord's mobile fortress rolling on a dozen dead trucks
23. **The Long Count** — dead soldier still counting down a mission long over
24. **The Last Warlord** — raider-general who unified the wasteland under one law
25. **The Half-Life** — gargantuan hot-zone leviathan that surfaces when ground glows

### Monster sheet 2/5

1. **Cinder Rat** — Radiation-swollen scavenger rat gnawing wire for copper
2. **Slag Crow** — Glass-feathered scavenger bird circling collapse sites
3. **Barrens Jackal** — Pack scavenger trailing raiders for the leftovers
4. **Fallout Toad** — Chem-bloated toad whose croak curdles nearby water
5. **Wasteland Scrapper** — Warband lookout with a jury-rigged pipe rifle
6. **Ration Raider** — Desperate raider who kills for canned goods and water
7. **Bonepicker Ghoul** — Radiation-twisted corpse that still remembers running
8. **Static Zealot** — Cultist who worships the static hum as divine voice
9. **Wire-Fanged Cur** — Scrap-hound fitted with crude barbed-wire fangs
10. **Blister-Skin Drifter** — Weeping-rot shambler that spreads contact contamination
11. **Powder-Keg Runner** — Bomb-cult runner who sprints in with a strapped satchel
12. **Rust-Eaten Sentry** — Corroded security automaton walking a dead patrol route
13. **Chem-Slick Viper** — Runoff-mutated viper whose venom keeps wounds open
14. **Grit-Locust Cloud** — Mutant locust swarm stripping crops and flesh alike
15. **Carrion Beetle Swarm** — Fist-sized beetle swarm drawn to fresh ash-flat kills
16. **Tanker Ganger** — Fuel-convoy enforcer quick to violence over short tribute
17. **Scab-Plate Scavver** — Scrap-armored raider wearing plates looted off corpses
18. **Detonator Cultist** — Bomb-cultist wired with a warhead trigger, waiting
19. **Growth-Warped Boar** — Tumor-ridden giant boar charging anything that moves
20. **Half-Life Skeleton** — Fallout-glassed bones animated by residual radiation
21. **Corroded Watcher** — Drone-husk sentinel still logging intruders no one reads
22. **Ash-Choked Hound** — Feral scrap-hound pup, quick, starving, unpredictable
23. **Firebrand Initiate** — Nervous bomb-cult convert still willing to light fuses
24. **Mange-Back Mutt** — Mangy hairless mutt hunting collapsed subway tunnels
25. **Warband Trapper** — Trap-setter who lines roads before the warband arrives

### Monster sheet 3/5

1. **Static-Touched Vermin** — Irradiated centipede whose touch blisters skin for days
2. **Fume Vent Zealot** — Cracked-mask cultist chanting over leaking gas vents
3. **Wreck-Diver** — Salvager who strips wrecks before warlords claim them
4. **Ashfield Widow Spider** — Ash-camouflaged spider whose webs vanish in scorched fields
5. **Grinder-Belt Sentry** — Retrofitted factory automaton swinging grinder arms on flesh
6. **Fuel-Cult Bruiser** — Tithe enforcer swinging rebar for the Fuel Cult
7. **Chem-Vat Horror** — Chemical-vat mutant that crawled out and kept growing
8. **Ash-Widow Broodmother** — Reactor-dome broodmother spawning hundreds each ash-season
9. **Warlord's Duelist** — Warlord's champion dueling for sport and succession
10. **Bloat-Ghast Preacher** — Rotting former prophet still delivering sermons to no one
11. **Convoy Breaker** — Convoy ambusher who cracks axles before guns come out
12. **Warp-Chitin Stalker** — Insect-hybrid mutant armored by decades of chem runoff
13. **Rig-Mounted Turret Hound** — Scrap-hound chassis welded to a swivel autogun
14. **Fume-Choked Ettin** — Two-headed mutant giant arguing over which ruin to loot
15. **Vault-Sealed Revenant** — Bunker-sealed ghost whose scream carries failing air
16. **Warband Chieftain** — Warband chief who climbed to power by outliving rivals
17. **Molten Vat Ooze** — Chemical-waste sludge ooze dissolving anything too close
18. **Rad-Sick Troll** — Regenerating troll locked in stalemate with its own radiation sickness
19. **Piston-Arm Enforcer** — Salvaged hydraulic-press automaton breaking doors and skulls
20. **Ashborn Wyrmling Mutant** — Mutant reptile whose stare cracks flesh like baked clay
21. **Fallout Wight Captain** — Ghoul squad commander who still remembers military drill
22. **Bomb-Cult High Priest** — Fanatic priest praying for a second, holier detonation
23. **Furnace-Bound Salamander** — Blast-furnace-bound elemental lashing at anyone who opens the door
24. **Scrapfield Chimera** — Three-headed radiation-fused mutant, each screaming differently
25. **Diesel Pit Fighter** — Undefeated warlord's pit champion across nine seasons

### Monster sheet 4/5

1. **Wraith of the Fallout Line** — Dead commuters fused into one hungry drifting shape
2. **Junk-Titan Enforcer** — Warlord's gate guardian that nothing has gotten past
3. **Toxin-Blood Oni Raider** — Chem-warped raider brute whose own blood is a weapon
4. **Scrap-Hound Alpha** — Scrap-hound pack alpha with ash-stained frost-white fur
5. **Vault Door Golem** — Animated blast-door guardian of a vault long since emptied
6. **Warlord's Bodyguard** — Silent armored bodyguard loyal only to whoever rules
7. **Contagion Ghast Broodkeeper** — Rot-spreading undead cultivating new ghouls like crops
8. **Detonation Engineer** — Bomb-cult engineer half-mad with reactor-core warhead math
9. **Iron Convoy Behemoth** — War-rig hauler plated with scrap from a dozen dead vehicles
10. **Fallout Hydra Broodhorror** — Hydra whose severed heads regrow ever more mutated
11. **Cinderfall Vampire Warlord** — Undead warlord feeding on survivors of settlements it razes
12. **Bunker-Bred Nightmare Steed** — Cult general's steed scorching ash-fields with every charge
13. **Reactor Wyrm** — Bedrock-burrowing wyrm glowing hot from irradiated feeding
14. **Grand Warlord's Champion** — Undefeated champion who fought a hundred duels for command
15. **Ash-Frost Colossus** — Nuclear-winter mutant with ash-snow-crusted fur and endless hunger
16. **Grid-Fed Iron Sentinel** — Grid-wired automaton drawing endless trickle current
17. **Vaultbreaker Behemoth** — Mutant giant that cracks vault doors bare-handed
18. **Deathwatch Cult Oracle** — Preserved oracle still interpreting a countdown only it hears
19. **Blightborn Roc** — Radiation-grown carrion bird whose shadow panics settlements
20. **Ash Warlord's Marilith Enforcer** — Bound fiend running security for a warlord's court
21. **Devouring Junkyard Kraken** — Tentacled scrapyard-pit mutant born of decades of chemicals
22. **The Countdown Keeper** — Preserved cult figurehead whispering an endless final number
23. **The Warlord Ascendant** — Warlord who united every ash-flat gang through pure fear
24. **The Fallout Titan** — Mountain-sized mutant mistaken for terrain until it moves
25. **The Last Detonation** — Warhead-core chassis built to finish what first bombs started

### Monster sheet 5/5

1. **The Glass Sea Wyrm** — Ancient leviathan swimming the vitrified glass flats
2. **Chittergaunt** — pack-hunting mutant scavenger, calls its litter
3. **Rustfang** — scrap-fused mutant guard-dog
4. **Waste Raider** — road-gang footsoldier, fights in packs
5. **Cult Acolyte, Bomb-Struck** — warhead-relic zealot, suicidal devotion
6. **Bleached Ghoul** — radiation-sick feral scavenger, not truly undead-lore
7. **Junk Crawler** — debris-heap creature that devours metal
8. **Warlord's Enforcer** — warlord's chain-wielding enforcer
9. **Rad-Hulk** — hulking overgrown mutant brute
10. **Scrap Colossus** — welded-together walking scrap machine
11. **Chem-Baron** — drug-and-fuel kingpin warlord
12. **The Sermon-Bearer** — doomsday high-priest awaiting the next blast
13. **Ashfield Titan** — hauler-built industrial war-walker
14. **Glasslands Broodmother** — apex matriarch of the mutant bloodline
15. **Deadman's Warlord** — apex convoy-king, rules through fuel scarcity
16. **The Last Sermon** — apex doomsday-prophet guarding a live warhead
17. **Half-Life** — apex fallout-horror, decades-deep radiation exposure
18. **The Foundry Made Flesh** — factory-fused apex war-machine

---

## NPC batches (43 total, 2 sheets)

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/2

1. **Dirt-farmer (scorched rows, hydroponic scraps)** — Tied to the land and its seasons; the base everyone eats from.
2. **Waste-hunter** — Reads the wild and brings in what the settled can't.
3. **Convoy hand** — Moves the heavy things; sees everything, is asked nothing.
4. **Ruin-diver or Vault-delver** — Works the dark and the tight places; patient underground.
5. **Bonded hand (indentured to a warlord or hoarder)** — Invisible to the powerful, and so hears every secret.
6. **The Starving** — Has nothing, so knows the streets better than anyone.
7. **Salvage-tinker** — Their tools carry their whole history.
8. **Scrap-smith** — Calloused hands; deals in practical defense.
9. **Ration-cook** — Up before dawn; holds the neighborhood's gossip.
10. **Wall-raiser** — Reads every structure out of habit; knows what's load-bearing.
11. **Rag-mender** — Notices the cut and quality of everyone's clothes.
12. **Rig-mechanic** — Keeps the means of travel and trade running; eyes on the weather.
13. **Barter-runner** — Information-rich, truth-poor.
14. **Waystation-keeper** — Controls the space, not the people in it.
15. **Herb-scrounger** — Smells of bitterroot; knows what heals and what doesn't.
16. **Settlement medic** — Trusted, and overburdened by it.
17. **Keeper of the old rites** — Maintains the ritual, not the doctrine.
18. **Waste-bard** — Craves the attention; hides the true feeling under it.
19. **Warlord's enforcer** — Authority-adjacent, with limited real power.
20. **Gun-for-hire** — Loyalty bought with coin, and cynical about it.
21. **Convoy escort** — Wary of the road; values a good pair of boots.
22. **Raider** — Desperate or cruel; lives outside the law.
23. **Black-market runner** — Hides the cargo; speaks only in euphemism.
24. **Camp-rat** — Eyes every coin-pouch; avoids every eye.
25. **Believer in plain clothes** — Fanatical devotion behind a mundane face.

### NPC sheet 2/2

1. **Warlord's press-gang boss** — Charisma aimed at the desperate; sells belonging.
2. **Wastelander from beyond the map** — Chose to stay here; the reasons stay unclear.
3. **Bunker hermit** — Known of, rarely seen.
4. **Acting boss (the old one didn't come back)** — Filling in for someone absent; borrowed authority.
5. **Settlement fixer** — Power without a title.
6. **Conscript who never should've held the rifle** — Unqualified, unwilling, or both — and in the role anyway.
7. **Archive-keeper** — Hoards the secret knowledge; sees others as material.
8. **The one who remembers before** — Their very presence is the notable thing.
9. **Scavenger** — Reads a dead town for the one thing left in it that still works.
10. **Warlord** — Owns the water, the fuel, or the guns — and that's the whole law now.
11. **Vault-hoarder** — Sits on a stockpile everyone else has decided is theirs by right.
12. **Waste-healer** — Trades clean water for wounds; knows which sickness is the new kind.
13. **Cult-of-the-before** — Worships the world that ended; keeps a dead machine as its shrine.
14. **Water-baron** — Holds the one clean source, and rations it out like a small god.
15. **Radio-voice** — Broadcasts into the waste; the only thing every survivor still shares.
16. **Marked-by-the-end** — Changed by what happened — feared, and quietly indispensable.
17. **Convoy-runner** — Moves goods between dead towns, armored, paranoid, and usually right to be.
18. **Reclaimer** — Trying to restart one dead thing — a pump, a field, a school — against all sense.

---

## Domestic animal batches (12 total, 1 sheet)

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic living pose** — alert, mid-stride, grooming, watching — never
stiff/taxidermied. **No scene props, furniture, pens, or background objects of any kind** — no
fences, feed troughs, leashes-as-set-dressing, etc.; the animal itself only, isolated against the
plain magenta background. Rendered in this realm's art style (see the style block above).

### Domestic animal sheet 1/1

1. **Domestic animal — Loyal dog — bonded to one person, reads their mood before they do.**
2. **Domestic animal — Working beast — ox, mule, or plough-horse; earns its feed, patient, and spooks true.**
3. **Domestic animal — Barn cat — owns the place, tolerates the people, hunts the dark corners.**
4. **Domestic animal — Stray — belongs to no one and everyone; the street's own alarm bell.**
5. **Domestic animal — Fowl or flock — geese, hens, guineas; loud, territorial, first to mark a stranger.**
6. **Domestic animal — Herd animal — sheep, goats, cattle; moves as one, and the one it *won't* follow is the tell.**
7. **Domestic animal — Bird kept close — hawk, pigeon, or raven; carries, watches, and remembers a face.**
8. **Domestic animal — Vermin-catcher — ferret, terrier, or rat-snake; goes gladly where people won't.**
9. **Domestic animal — Old animal — past its working years, half-blind, and still the first to growl at the wrong thing.**
10. **Domestic animal — Half-tamed wild thing — comes to the window, never the hand; trusts one child and no one else.**
11. **Domestic animal — The realm-beast — [reskin slot] the drone-pet, the war-mule, the too-clever shade, the rad-mongrel.**
12. **Domestic animal — The town's own animal — the one everyone knows by name; its fate is the town's mood made visible.**


---

## Kid batches (20 total, 1 sheet)

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each kid fully visible from head to toe within its cell — no cropping.
**Every kid in a candid, characterful pose** — mid-play, mid-chase, peeking around a corner,
caught in the act of the thing they want — never a neutral T-pose or idle stand, and never
combat/violent poses. **No scene props, furniture, or background objects of any kind** — no
toys-as-set-dressing, benches, carts, etc.; the child itself only, isolated against the plain
magenta background. Rendered in this realm's art style (see the style block above); ages read as
children, not teens or adults.

### Kid sheet 1/1

1. **Kid — wants: Find the dog that didn't come home.**
2. **Kid — wants: Put it back before anyone notices it was gone.**
3. **Kid — wants: Be believed by one grown-up — just one — about the thing they saw.**
4. **Kid — wants: Stay up late enough to catch the thing that comes at night.**
5. **Kid — wants: Get back what was taken from them — and it's the object the whole plot turns on.**
6. **Kid — wants: Keep the secret they swore to keep, even now that it's gone wrong.**
7. **Kid — wants: Win back the friend who stopped coming around.**
8. **Kid — wants: Prove they're not a baby by going where they're forbidden to go.**
9. **Kid — wants: Keep the pretty thing they found — which someone dangerous is tearing the town apart to recover.**
10. **Kid — wants: Feed the thing in the woods that's been kind to them.**
11. **Kid — wants: Not have to go home tonight.**
12. **Kid — wants: Find out what the grown-ups whisper about behind the shut door.**
13. **Kid — wants: Get their small hoard back from whoever confiscated it.**
14. **Kid — wants: Slip a message to the one person the family has forbidden them to see.**
15. **Kid — wants: Be chosen — for the errand, the team, the trust — for once.**
16. **Kid — wants: Keep the little one from finding out the bad thing that happened.**
17. **Kid — wants: Trade the strange coin they found for something they actually want.**
18. **Kid — wants: See the locked place opened, just once, just to know.**
19. **Kid — wants: Make their parent laugh the old way, the way from before.**
20. **Kid — wants: Warn someone — and not one adult will slow down long enough to hear it.**

