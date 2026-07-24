---
type: scratch
status: experimental
created: 2026-07-09
realm: ash
---

# Sprite Batch Prompts — Ash (post-apocalyptic, the world already ended once)

> **Production-format authority (2026-07-24):** The packet grammar demonstrated here is the
> preferred grammar for new sprite production. Use [`PRODUCTION-FORMAT.md`](PRODUCTION-FORMAT.md)
> for current grid, cell-aspect, canvas, QA, and receipt fields. Any `5×5` / `25 cells` value
> below is historical batch data, not a universal default.

**Roster/content status: working, not canon.** This
file batches EVERY creature in the Ash realm bestiary (118 monsters) plus a
themed NPC roster (43 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). bleached-bone and rust-orange palette over ash-grey ground, heavy dither/grain for a scorched-air haze, cracked/scarred skin or plating textures, one ember-glow high-value accent per sprite.

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

## NPC batches (75 total, 3 sheets)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population also includes visible fallout-mutation variety (see the final entries below: irradiated, chem-scarred, or born-after-the-fall) alongside an ethnically varied unmutated majority — the wasteland doesn't touch everyone, and it doesn't touch anyone evenly.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). bleached-bone and rust-orange palette over ash-grey ground, heavy dither/grain for a scorched-air haze, cracked/scarred skin or plating textures, one ember-glow high-value accent per sprite.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/3

1. **Dirt-farmer (scorched rows, hydroponic scraps)** — Tied to the land and its seasons; the base everyone eats from.
2. **Waste-hunter** — Reads the wild and brings in what the settled can't.
3. **Convoy hand** — Moves the heavy things; sees everything, is asked nothing.
4. **Ruin-diver** — Works the dark and the tight places; patient underground.
5. **Bonded hand (indentured to a warlord)** — Invisible to the powerful, and so hears every secret.
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

### NPC sheet 2/3

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
19. **Ash-touched elder — grey-cracked skin from decades in the fallout, runs the settlement's water reclaimer**
20. **Rot-marked scavenger — patchy hairless chem-mutation, trusted with the hot zones no one else will enter**
21. **Glow-eyed child — faint bioluminescent eyes from womb-exposure, born after the fall**
22. **Twice-skinned trader — visibly regenerating burn scars that never fully close**
23. **Convoy cook — dark-skinned, sun-weathered, feeds whoever's still standing after a raid**
24. **Silver-locked water-witch — an older woman who reads the cracked earth for the next safe well**
25. **Bone-pale forager — bleached hair and skin, the settlement's best judge of what's safe to eat**

---

### NPC sheet 3/3

1. **Sun-dark caravan scout — reads dust trails like a map**
2. **Elderly bunker-born — never seen open sky before the settlement dug out**
3. **Broad-shouldered wall-crew boss — keeps the palisade standing another season**
4. **Young irradiated runner — patchy hair loss, fast, sent where no one else will go**
5. **Grey-bearded still-master — brews the settlement's only clean water and its only liquor**
6. **One-armed veteran mechanic — lost the arm to a rig, kept working the same day**
7. **Freckled teenage lookout — youngest on the wall rotation, takes it dead serious**
8. **Heavyset grain-hoarder's widow — inherited the stockpile, and the target on her back**
9. **Dark-skinned tunnel-crew forewoman — knows which collapsed streets are still passable**
10. **Pale chem-burned nurse — hands scarred from a lab accident, best medic in three settlements**
11. **Short, wiry scavenge-team leader — sends kids out, never goes herself anymore**
12. **Elderly seed-vault keeper — guards the last real crop stock like scripture**
13. **Sunburnt caravan driver — decades on the road, trusts the mule more than most people**
14. **Mixed-heritage settlement council elder — mediates every dispute, believed by fewer each year**
15. **Lean, hollow-eyed insomniac watchman — hasn't slept right since the last raid**
16. **Stout blacksmith's daughter, dark-skinned — better at the forge than her father was**
17. **Grey-haired storyteller — keeps the memory of before-the-fall alive for the kids**
18. **Young ash-touched twins — one mutated, one not, inseparable regardless**
19. **Broad, sun-weathered wall-gate guard — checks every face twice**
20. **Elderly, half-blind radio operator — still monitors the dead channels out of habit**
21. **Dark-skinned, heavily scarred convoy captain — survived more ambushes than anyone alive**
22. **Small, quick-fingered lock-picker — gets the settlement into every sealed vault it finds**
23. **Weathered dust-farmer, greying — coaxes crops out of soil that shouldn't grow anything**
24. **Mutation-marked healer's apprentice — glowing faint veins, gentle hands anyway**
25. **Tall, gaunt settlement preacher — preaches survival, not salvation**

## Domestic animal batches (25 total, 1 sheet)

**Ash-realm lore note (adopted, not just a render fix):** a first test render put a glowing
ember accent on every single animal, and some of them read great — like the creature itself
carries a live coal under the skin or behind the eye, a mark of the world that already ended
once. That's now a real, optional trait of Ash-realm fauna: **roughly 1 in 4–5 animals** carries
a visible ember-glow (an eye, a crack in the hide, a spot on the chest) — not all 25, and never
as a floating disconnected orb bolted on like jewelry; it must read as coming FROM the animal
(glowing under thin skin, an ember-lit eye, light leaking from a scar) not sitting ON it. Adam
is also generating a fully non-ember pass of this same sheet to compare side by side — this
prompt is the "some carry the ember" version.

Style block, adjusted for animals: Pixel-art sprite rendering (visible pixel grid, retro
game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded
and true-to-tone even rendered at pixel scale). bleached-bone and rust-orange palette over ash-grey ground,
heavy dither/grain for a scorched-air haze. **Every animal, ember or not, gets the same degree
of wear**: matted/singed fur or feathers, ash-dust caked in the coat, visible rib or bone
structure where the fur has thinned, cracked or scarred skin at the extremities (paws, muzzle,
ears) — the ash-realm identity is carried by TEXTURE across all 25 first, with the ember as a
rare bonus detail on a few, never the main event and never uniform across the sheet.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic living pose** — alert, mid-stride, grooming, watching — never
stiff/taxidermied. **No scene props, furniture, pens, or background objects of any kind** — no
fences, feed troughs, leashes-as-set-dressing, etc.; the animal itself only, isolated against the
plain magenta background. Rendered in this realm's art style (see the style block above).

### Domestic animal sheet 1/1

1. **Domestic animal — Loyal dog — bonded to one person, reads their mood before they do.**
2. **Domestic animal — Working beast (a single ox) — earns its feed, patient, and spooks true.**
3. **Domestic animal — Barn cat — owns the place, tolerates the people, hunts the dark corners.**
4. **Domestic animal — Stray — belongs to no one and everyone; the street's own alarm bell.**
5. **Domestic animal — A single goose from the flock — loud, territorial, first to mark a stranger.**
6. **Domestic animal — A single sheep from the herd — moves with the others, and its lone reluctance to follow is the tell.**
7. **Domestic animal — Bird kept close (a single hawk) — carries, watches, and remembers a face.**
8. **Domestic animal — Vermin-catcher (a single ferret) — goes gladly where people won't.**
9. **Domestic animal — Old animal — past its working years, half-blind, and still the first to growl at the wrong thing.**
10. **Domestic animal — Half-tamed wild thing — comes to the window, never the hand; trusts one child and no one else.**
11. **Domestic animal — The realm-beast (a rad-scarred mongrel, patchy-coated, fiercely loyal past reason)**
12. **Domestic animal — The town's own animal — the one everyone knows by name; its fate is the town's mood made visible.**
13. **Domestic animal — A single rabbit — twitchy, kept for the table or kept as a pet, never sure which.**
14. **Domestic animal — A single pony — smaller and calmer than the war-mule, a child's first mount.**
15. **Domestic animal — A single duck — waddling, unbothered, first to notice a stranger at the water's edge.**
16. **Domestic animal — A single turkey — puffed up and loud, more guard animal than anyone admits.**
17. **Domestic animal — A single caged songbird — kept for the sound of it, restless behind the wire.**
18. **Domestic animal — A single turtle — slow-kept yard animal, older than most of the household.**
19. **Domestic animal — A single pig — smarter than it's given credit for, rooting at the fence line.**
20. **Domestic animal — A single goat — headstrong, climbs what it shouldn't, eats what it shouldn't.**
21. **Domestic animal — A single donkey — stubborn, sure-footed, outlives every horse on the property.**
22. **Domestic animal — A single peacock — kept for show, screams like something's wrong when nothing is.**
23. **Domestic animal — A single hunting hound — lean, nose-down, bred for the chase and bored without it.**
24. **Domestic animal — A single kitten — too young to have earned the barn cat's independence yet.**
25. **Domestic animal — A single caged ferret-kit — young, hyperactive, still learning the vermin-catcher's trade.**


---

## Wild animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale).
bleached-bone and rust-orange palette over ash-grey ground, heavy dither/grain for a scorched-air haze, cracked/scarred skin or plating textures, one ember-glow high-value accent per sprite.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic wild-living pose** — alert, stalking, grazing, mid-flight,
territorial — never stiff/taxidermied, never tame-looking (these are wilderness creatures, not
pets). **No scene props, furniture, dens, or background objects of any kind** — no burrows,
nests-as-set-dressing, foliage clusters, etc.; the animal itself only, isolated against the plain
magenta background. Sourced from the game's own `wild-animal-kind` table (`Engine/03. _Tables/02.
Social/Sentient NPCs/Wild Animal Kind.md`) plus additional single-animal variety to fill the
sheet; entry 11 (the realm-beast) uses this realm's real skin from `data/animal-realm-skins.js`.

### Wild animal sheet 1/1

1. **Wild animal — Territory wolf — holds a stretch of ground and knows every crossing of it**
2. **Wild animal — A single deer from the herd — moves with the herd, reads the wind before the ranger does**
3. **Wild animal — Watcher-hawk — sees the whole valley from height and forgets nothing it circled**
4. **Wild animal — River otter — knows the water's moods better than any map**
5. **Wild animal — Burrowing badger — knows what the earth carries underneath**
6. **Wild animal — Ambush lynx — solitary, patient, and the reason the trail went quiet**
7. **Wild animal — A single vulture from the carrion flock — first to know when something has died nearby**
8. **Wild animal — A single goose from the migrant flock — passes through and carries news of where it's been**
9. **Wild animal — Old solitary boar — scarred, wary, and gives ground to no one**
10. **Wild animal — Half-wild fringe fox — drawn to the edge of camps, curious and never quite trusting**
11. **Wild animal — The realm-beast (a hardened dust-wolf, ribs showing, that has learned exactly where the fallout is safe)**
12. **Wild animal — The elder of the wood — the beast every other animal on the node defers to**
13. **Wild animal — A single elk — grazes the tree line at dawn, gone before full light**
14. **Wild animal — A lone timber-wolf pup — not yet part of any pack, still learning to hunt**
15. **Wild animal — A red fox kit — curious, unafraid, too young to know better**
16. **Wild animal — A great owl — silent wingbeats, watches more than it hunts**
17. **Wild animal — A wild boar sow — tusks lowered, protective of ground she doesn't even own yet**
18. **Wild animal — A mountain goat — sure-footed on a ledge no predator bothers to follow**
19. **Wild animal — A black bear — foraging, unbothered, dangerous only if pressed**
20. **Wild animal — A heron — stalks the shallows on legs too thin to look that patient**
21. **Wild animal — A wild turkey tom — displaying, loud, oblivious to anything hunting it**
22. **Wild animal — A bull elk — antlers full-grown, the season's rut making it reckless**
23. **Wild animal — A badger — low, broad, digging with total disregard for anything nearby**
24. **Wild animal — A peregrine falcon — stooping mid-hunt, faster than anything else in the sky**
25. **Wild animal — A lynx kitten — spotted coat, play-stalking something that isn't there yet**

---

## Dungeon animal batches (25 total, 1 sheet)

**Lore note:** per `docs/ANIMAL-SOCIAL.md` §1, the dungeon environment band is animal-population
near-zero — "each one is a signal," not ambient wildlife. Every entry below is either a
domestic/wild animal that ended up somewhere it shouldn't be, or a creature that has adapted to
permanent dark — never a "generic cave critter."

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale).
bleached-bone and rust-orange palette over ash-grey ground, heavy dither/grain for a scorched-air haze, cracked/scarred skin or plating textures, one ember-glow high-value accent per sprite.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic pose for its situation** — wary, cornered, feral, startled,
adapted-to-dark — never a relaxed/domestic pose (even the lost pets down here read as changed by
the place). **No scene props, furniture, cages-as-set-dressing, or background objects of any
kind** — the animal itself only, isolated against the plain magenta background.

### Dungeon animal sheet 1/1

1. **Dungeon animal — Feral vermin-catcher — once someone's ferret or terrier, now lives wild in the tunnels, still killing rats out of habit**
2. **Dungeon animal — Blind cave rat — pale, sightless, thrives in total dark, first sign something's been dug through**
3. **Dungeon animal — Tunnel bat colony straggler — a single bat that never rejoined the swarm, clings alone near a cracked vent**
4. **Dungeon animal — Half-tamed thing — comes to a lantern's light, never a hand, feeds on what the dungeon leaves behind**
5. **Dungeon animal — Lost hunting hound — a noble's dog that wandered too far in and never found the way back out**
6. **Dungeon animal — Cave-adapted spider — pale, eyeless, spins webs across passages nobody's walked in years**
7. **Dungeon animal — Wrong-place goat — a farm animal that fell through a sinkhole and somehow survived down here**
8. **Dungeon animal — Glow-moss grazer — a small rodent whose fur has picked up a faint luminescence from what it eats**
9. **Dungeon animal — Echo-startled bird — a single bird trapped in the upper galleries, flies at every footstep**
10. **Dungeon animal — Scarred guard-dog gone feral — once trained to patrol these halls, now answers to no one**
11. **Dungeon animal — Blind salamander — pale, slow, the kind of thing that shouldn't have a reason to be this deep**
12. **Dungeon animal — Starving stray — a cat or dog that followed someone in and got left behind**
13. **Dungeon animal — Unnervingly large lone rat — alone, watching, doesn't scatter like the others**
14. **Dungeon animal — Tunnel-adapted snake — pale-scaled, sluggish in the cold, strikes only when cornered**
15. **Dungeon animal — Chained beast, escaped its post — a working animal that slipped its old restraint, still wears the collar**
16. **Dungeon animal — Nest-robbing crow — one bird that's learned the dungeon's side passages better than most explorers**
17. **Dungeon animal — Deep-well fish, stranded — flopping in a puddle far from any real water source**
18. **Dungeon animal — Sole survivor packhorse — the last of a caravan's animals, malnourished, still saddled**
19. **Dungeon animal — Cave cricket, oversized — chirping alone in the dark, first warning of the swarm nearby**
20. **Dungeon animal — Feral falconry bird — a hawk that escaped its jesses generations ago, now hunts the tunnels' vermin**
21. **Dungeon animal — Wrongly-still lizard — motionless so long it's mistaken for a carving, until it isn't**
22. **Dungeon animal — Abandoned mine canary — a small bird in a rusted cage, somehow still alive, still singing**
23. **Dungeon animal — Tunnel-blind mole — huge clawed forepaws, displaces more earth than it should be able to**
24. **Dungeon animal — Trapped messenger pigeon — still carries a note no one living will ever read**
25. **Dungeon animal — An ordinary animal, deliberately unremarkable — domestic or wild, doesn't matter; its presence this deep IS the signal, let the scene decide what it means**

---

## Kid batches (20 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). bleached-bone and rust-orange palette over ash-grey ground, heavy dither/grain for a scorched-air haze, cracked/scarred skin or plating textures, one ember-glow high-value accent per sprite.

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


## Expansion batches — REALM-KEY-EXPANSION-ROSTER draft, 2026-07-09 (15 total, 1 sheet)

Appended additions from `docs/REALM-KEY-EXPANSION-ROSTER.md` (Adam's rulings folded): the
supermutant analog ladder (**the overgrown** — made, not born; somebody's still making them),
the ghoul analog split into lucid/feral lanes (**the withered**), and **the Cindermarked** —
the faction born from this sheet set's own glowing-ember accent (Adam: a faction of NPCs who
found a magic stone). Existing ghoul/mutant entries on sheets 1–5 are NOT repeated. Same style
block and mechanical instructions as above.

### Expansion sheet E1 (3×5 grid, 15 cells)

1. **Overgrown Brute** — slab-muscled made-mutant, surgical seams still visible, car-door shield
2. **Overgrown Pack-Leader** — smarter overgrown with a salvaged rebreather, directing two others by fist-signs
3. **Overgrown Siege-Breaker** — the biggest of the made, carrying a lamppost like a bat, mid-swing
4. **The Overgrown Warlord** — armored in welded road signs, standing on a wreck, made-mark branded proud
5. **The Maker's Apprentice** — hooded surgeon of the vats, tools of the making on a bandolier, recruiting
6. **Lucid Withered Lore-Keeper** — skin gone to parchment, pre-fall memories intact, mid-story with a salvaged book
7. **Lucid Withered Trader** — withered merchant with a cart-harness, prices fair, face frightening
8. **Feral Withered Runner** — sprinting hollow-eyed husk, all hunger, mid-leap off rubble
9. **The Glow-Called** — feral withered lit faintly green, drawn moth-like toward a reactor's warmth
10. **Cindermarked Shard-Bearer** — ragged wanderer, ember-glow shining through the skin of one clenched fist
11. **Cindermarked Ember-Speaker** — faction priest, shard set in a neck-torc, warmth-halo in the ash-cold
12. **Cindermarked Pilgrim** — traveler following a shard's pull like a compass, footprints steaming
13. **Cindermarked Warden** — faction guard whose shard-arm glows to the elbow, ash flaking off the skin it's spending
14. **The First Kindled** — the faction's founder, more ember than flesh now, radiant and burning down
15. **The Ember-Stone Reliquary** — the mother-stone on its carried litter, bearers aging visibly around it

### Expansion sheet E2 (1×3 grid, 3 cells) — Adam's 2026-07-09 approval-pass additions

Adam confirmed the Cindermarked run as a **cult** — three cult-role additions to E1's roster.

1. **Cindermarked Recruiter** — warm-palmed missionary offering a cold traveler a shard's heat, first taste free
2. **Cindermarked Initiate** — new convert mid-branding, pressing the shard to their own sternum, rapture and terror both
3. **The Apostate** — hollow-cheeked ex-cultist who cut the shard out, bandaged chest, forever cold now

## Item batches — from `Engine/03. _Tables/05. Realms/Realm Items - Ash.md` (50 total, 2 sheets)

Loot-table items as sprites (Adam 2026-07-09): inventory icons / item-get card art / FFT-style
post-combat loot screens — presentation TBD, the asset bank comes first. Derived from the realm
item table (edit the TABLE, then regenerate this section); band noted per cell as a value cue.

**Item template (replaces the character template for these sheets):** 5×5 grid, 25 cells, ONE
OBJECT per cell (no characters, no hands, no scene), centered, floating on the solid magenta
(#FF00FF) background, consistent relative scale (a coin small in its cell, a rifle spanning
its cell), full object visible with margin — no cropping. Same realm style block as above.
Each object needs one instantly readable silhouette and one high-value focal detail; higher-band
items (Strange/Volatile/Mythic) may glow, distort, or break physics visibly — Grounded items
must look convincingly mundane.

### Item sheet 1/2 (5×5 grid, 25 cells)

1. **A shopping cart** [Grounded] — A shopping cart, one wheel seized, bed lined with flattened cardboard.
2. **A roll of duct tape** [Grounded] — A roll of duct tape, half spent, edges gone furry.
3. **A scavenger's crowbar** [Grounded] — A scavenger's crowbar, notched from prying more than doors.
4. **A can of preserved meat** [Grounded] — A can of preserved meat, label long gone, dents suggesting it's survived worse than storage.
5. **A gas mask** [Grounded] — A gas mask, seals sound, one sealed filter left in the pouch.
6. **A patched-together bicycle** [Grounded] — A patched-together bicycle, one gear missing, chain held with wire.
7. **A water purification tablet strip** [Grounded] — A water purification tablet strip, four tablets left.
8. **A salvaged hand-crank flashlight** [Grounded] — A salvaged hand-crank flashlight, dim, casing cracked.
9. **A jar of bottle caps** [Grounded] — A jar of bottle caps, sorted by color.
10. **A pair of heavy work gloves** [Grounded] — A pair of heavy work gloves, palms gone shiny.
11. **A stapled pharmacy bag** [Grounded] — A stapled pharmacy bag, someone else's name, 1d3 doses inside.
12. **A water jug patched with tape in three different colors** [Grounded]
13. **A hazmat suit** [Textured] — A hazmat suit, patched at one knee.
14. **A sealed case of pre-collapse whiskey** [Textured] — A sealed case of pre-collapse whiskey, twelve bottles, excelsior packing intact.
15. **A fire axe** [Textured] — A fire axe, red paint chipped to primer.
16. **A pre-collapse toolbox** [Textured] — A pre-collapse toolbox, complete, drawers that still glide.
17. **A roll of military camouflage netting** [Textured] — A roll of military camouflage netting, one scorched corner.
18. **A megaphone** [Textured] — A megaphone, dented bell, battery contact bent back into service.
19. **A water-purifier straw** [Textured] — A water-purifier straw, filter counter reading 30 days.
20. **A trader's counterfeit scrip** [Textured] — A trader's counterfeit scrip, well-made, one denomination short of undetectable.
21. **A vending-machine service key** [Strange] — A vending-machine service key, stamped SERVICE — REGION 7.
22. **"The Last Working Thing"** [Strange] — "The Last Working Thing" — an unbranded multi-tool from a dead town, every hinge still true.
23. **A wind-up music box** [Strange] — A wind-up music box, brass drum, crank worn bright.
24. **A traffic light** [Strange] — A traffic light, salvaged whole, cycling patiently wherever it's hung and powered.
25. **A camp stove built** [Volatile] — A camp stove built, expertly, around an unexploded artillery shell.

### Item sheet 2/2 (5×5 grid, 25 cells)

1. **A caged canary** [Volatile] — A caged canary, alive, glossy, fed by someone until very recently.
2. **The thing the survivors kept — roll d4:** [Mythic] — The thing the survivors kept — roll d4: 1. The last working seed vault on the continent, door open for the first time in a generation, every strain inside viable. 2. The reactor heart — a sealed fuel core, still warm, still whole, from the plant that powered the whole region once. 3. The emergency broadcast console, intact, dust-sheeted, and the mic is live. 4. The unbroken water-oath of `[the region's fallen power]`, sworn over the last clean well before the collapse — the pipes still answer anyone who speaks the old words right.
3. **A patchwork tarp** [Grounded] — A patchwork tarp, waxed, stitched from four different pre-collapse fabrics.
4. **A hand-wound pocket watch** [Grounded] — A hand-wound pocket watch, accurate to a few minutes a day if you remember it.
5. **A siphon hose with the technique taped to it in faded marker** [Grounded]
6. **A jury-rigged solar charger** [Grounded] — A jury-rigged solar charger, three panels, one cracked.
7. **A settlement doctor's suture kit** [Grounded] — A settlement doctor's suture kit, half-used, needle dulled.
8. **A tire-iron** [Grounded] — A tire-iron, bent slightly from use as more than a tool.
9. **A pre-collapse police vest** [Textured] — A pre-collapse police vest, ceramic plates intact, straps re-sewn.
10. **A bundle of road flares** [Textured] — A bundle of road flares, eleven, wax seals unbroken.
11. **A child's wagon** [Textured] — A child's wagon, steel-bodied, all four wheels true.
12. **Enchanted** [Textured] — Enchanted — "Everclean Filter" — a scavenged water filter that never clogs.
13. **Enchanted** [Textured] — Enchanted — "The Steadfast Jacket" — patched leather that's stopped more than weather.
14. **Enchanted** [Textured] — Enchanted — "Long-Haul Boots" — cracked leather, resoled twice, never a third.
15. **Enchanted** [Strange] — Enchanted — "Two-Hundred-Year Batteries" — a four-pack, heavy for their size, still shrink-wrapped.
16. **Enchanted** [Strange] — Enchanted — "The Bottomless Jerry Can" — dented, olive-drab, heavier at dawn.
17. **Enchanted** [Strange] — Enchanted — "The Scrapwright's Magnet" — a horseshoe magnet on a knotted rope.
18. **Enchanted** [Strange] — Enchanted — "Salvager's Third Eye" — a welder's lens, cracked, mounted on a headband.
19. **Enchanted** [Strange] — Enchanted — "The Cold Box" — a lunch cooler, humming faintly, latch polished by use.
20. **Signature** [Strange] — Signature — "The Saw" (frame: greataxe; fuel; LOUD) — a chainsaw-bar weapon, fuel-fed, deafening.
21. **Signature** [Strange] — Signature — "Clicking Amulet" — a battered pendant with a needle that never sits still.
22. **Signature** [Strange] — Signature — "The Last Broadcast" — a hand-crank radio that picks up one station, always, everywhere.
23. **Signature** [Volatile] — Signature — "The Dead Man's Switch" — a wrist-strap rig wired to a sealed satchel charge. Armed is the only state it's ever been found in.
24. **Consumable** [Grounded] — Consumable — A jerry can of scavenged fuel, three-quarters full, smells wrong but burns fine.
25. **Consumable** [Grounded] — Consumable — A strip of pre-collapse antibiotics, foil-backed, two doses intact.
