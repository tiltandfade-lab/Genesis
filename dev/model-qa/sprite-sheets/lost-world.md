---
type: scratch
status: experimental
created: 2026-07-09
realm: lost-world
---

# Sprite Batch Prompts — Lost World (saurian court, three strata, under a volcanic mountain-clock)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Lost World realm bestiary (120 monsters) plus a
themed NPC roster (44 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): humid jungle-green-and-ember palette, heavy atmospheric dither for volcanic haze, warm ember rim light against deep shadow strata, scale/hide textures, one glowing high-value accent (ritual paint, ember-lit eyes) per sprite.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (120 total, 5 sheets)

### Monster sheet 1/5

1. **Sand-Choked Sentry** — classic bone guardian, forever walking its post
2. **Glyph-Warded Scarab Swarm** — tomb-curse insect swarm guarding a sealed door
3. **Sun-Fat Ridgeback** — oversized lizard basking among fallen ruins
4. **Linen-Wrapped Shambler** — rot-wrapped shambler retracing a dead ritual
5. **Blind Archive-Gnawer** — blind vermin swarm infesting the buried archive
6. **Cracked Watch-Idol** — animated stone idol stuck on an endless patrol
7. **Vine-Choked Ambusher** — venomous ambush-spider lurking in overgrown ruins
8. **Bone-Orchard Jackal** — scavenger jackal pack circling grave robbers
9. **Curse-Bound Grave Ghoul** — paralyzing ghoul, once a fellow tomb-raider
10. **Snake-Cult Zealot** — fanged serpent-cultist guarding forbidden rites
11. **Wall-Set Spear-Guard** — bandaged vizier still guarding an empty throne
12. **Plinth-Fused Sentinel** — stone temple guardian bound to bar the sanctum
13. **Riddle-Keeper of the Threshold** — riddling sphinx guarding the tomb's final gate
14. **Raptor of the Ruined Plaza** — pack-hunting raptor stalking the ruined plaza
15. **Living Armor-Back** — club-tailed armored dinosaur, unstoppable and slow
16. **Horned Terror of the Sacred Road** — three-horned dinosaur charging trespassers on sight
17. **The Weeping Cistern** — corrosive ooze filling a flooded sacred bath
18. **Marching Colossus of the Processional** — towering stone statue still marching a dead parade
19. **Basalt Gaze of the Garden** — snake-haired guardian posing as garden statuary
20. **Coiled Warden of the Inner Vault** — giant guardian serpent coiled around the vault door
21. **Throne-Ape of the Fallen Grove** — worshipped ape-god ruling the collapsed temple grove
22. **Ever-Marching Automaton King** — golem king still guarding a throne that's empty
23. **Apex Titan-Lizard** — apex tyrant-lizard ruling the collapsed dome
24. **The Unread King** — the mummified god-king, cursed and finally waking
25. **The Standing Monument** — gargantuan stone colossus that never stopped watching

### Monster sheet 2/5

1. **Sun-Baked Scrap Raptor** — Small pack raptor darting between ruined stones
2. **Feathered Sickle-Claw** — Feathered raptor slashing with a hooked hind claw
3. **Sickle-Toed Ambush Runner** — Coordinated raptor pair flanking around fallen columns
4. **Withered Grave-Servant** — Shuffling tomb-slave still walking its funeral circuit
5. **Salt-Cured Husk** — Salt-cured husk shambling with brittle relentlessness
6. **Rattling Ossuary Ward** — Wire-bound bones standing eternal watch over bones
7. **Loose-Jointed Tomb Archer** — Bone-guard still loosing arrows down the hall
8. **Dune-Coiled Fang Serpent** — Venomous serpent nesting in a cracked plinth
9. **Constrictor of the Choked Aqueduct** — Heavy serpent squeezing prey against wet stone
10. **Sun-Cult Acolyte** — Robed acolyte chanting to unanswering old gods
11. **Dead-Tongue Initiate** — Initiate half-mad from an extinct liturgical tongue
12. **Scaled Temple-Guard** — Hardened spear-guard sworn to a dead dynasty
13. **Feather-Cloaked Sentinel** — Plumed sentinel marching the crumbling outer wall
14. **Idol-Cracked Jackal** — Scavenger jackal denning beneath a toppled idol
15. **Grave-Wasp Nest Cluster** — Wasp nest swarming from a hollow sarcophagus
16. **Chittering Reliquary Swarm** — Scarab swarm boiling from a cracked reliquary
17. **Rope-Fanged Pit Viper** — Coiled viper hidden in a false-bottomed coffin
18. **Choke-Vine Ambusher** — Creeping vine blight rooted in cracked flagstone
19. **Spore-Choked Idol Fungus** — Idol fungus shrieking to summon every guardian
20. **Loincloth Grave-Robber** — Desperate local looting the same cursed tombs
21. **Whisper-Idol Cultist Fanatic** — Fanatic convinced the silent idols still listen
22. **Broken-Fang Wererat Tomb-Rat** — Cursed looter scurrying tunnels as vermin
23. **Stalking Sand-Ambusher** — Ambusher slipping through heat-mirage to strike
24. **Petrifying Serpent-Crowned Guardian** — Stone-eyed guardian that petrifies with a glance
25. **Vulture-Headed Carrion Priest** — Vulture-masked priest presiding over excarnation rites

### Monster sheet 3/5

1. **Sarcophagus-Bound Wight Steward** — Undead steward still enforcing dead household order
2. **Blazing Ember-Skull Oracle** — Astrologer's burning skull still muttering prophecy
3. **Broken Wing Terror-Bird** — Flightless apex hunter ruling terraced garden ruins
4. **Vault-Sworn Ettin Doorkeeper** — Two-headed brute oath-bound to guard one door
5. **Weretiger Jungle-Stalker** — Cursed hunter prowling the ruin's jungle canopy
6. **Cracked-Idol Gargoyle Watcher** — Stone guardian animated by residual sun-magic
7. **Ash-Grey Ochre Seep** — Corrosive ooze seeping through burial-chamber cracks
8. **Hollow-Coffer Gelatinous Vault** — Cube-shaped ooze absorbing centuries of grave goods
9. **Chain-Bound Barrow Ghast** — Ravenous ghast once serving the king's table
10. **Bandaged Falconry Ghast** — Ghast tending the tomb's mummified hunting birds
11. **Toppled Minotaur Skeleton Guard** — Skeletal labyrinth-guardian still pacing its maze
12. **Grave-Silk Poltergeist** — Poltergeist hurling urns at silence-breakers
13. **Zombie-Herd Elephant Carrier** — Shambling zombie beast still hauling grave-cart chains
14. **Snake-Cult Priest of the Hollow Coil** — Priest whose chants summon serpents from below
15. **Sacrificial Blind Prophet** — Blind prophet claiming to speak for a buried god
16. **Wrapped Gladiator of the Sun Pit** — Undying champion still dueling a vanished crowd
17. **Bog-Sunk Umber Digger** — Tunneling digger whose gaze cracks minds below
18. **Rot-Feathered Bulette Ambusher** — Burrowing ambusher erupting under temple courtyards
19. **Sun-Forged Earth Colossus Fragment** — Animate wall-shard powered by buried sun-forges
20. **Cinder-Font Fire Warden** — Warden guarding the mummy-king's eternal brazier
21. **Rope-Trap Roper of the Deep Shaft** — Stalactite-mimic lurking a deep excavation shaft
22. **Bloated Refuse-Idol Otyugh** — Refuse-fed horror lurking a forgotten temple well
23. **Shambling Garden Overgrowth** — Sentient overgrowth reclaiming a hanging garden
24. **Ashen Vampire-Spawn Handmaiden** — Undead handmaiden still tending an empty throne
25. **Wight-Lord of the Processional Guard** — Undead lord commanding the marching dead guard

### Monster sheet 4/5

1. **Sky-Talon Wyvern of the Ziggurat** — Wyvern roosting atop the tallest step-pyramid
2. **Idol-Warped Chimera of Three Gods** — Grafted horror built from three patron-beast idols
3. **Eight-Legged Web-Warden of the Vault** — Half-cursed drider webbing shut the treasure vault
4. **Storm-Song Satyr Revelmaster of Ruins** — Fey revelmaster luring travelers to ruin-feasts
5. **Hollow-Throated Vrock Carrion-Caller** — Summoned scavenger-demon guarding forbidden grave-magic
6. **Serpent-Sworn Lamia of the Oasis Court** — Charming oasis fiend feeding on stolen years
7. **Basalt-Skinned Gorgon of the Sun Gate** — Bull construct petrifying intruders at the sun gate
8. **Nine-Serpent Basalt Hydra Spawn** — Cistern hydra whose heads regrow when severed
9. **Petrified Roc of the High Terraces** — Colossal roc nesting on the crumbling terrace
10. **Fossil-Chained Behir of the Under-Passage** — Lightning serpent-beast patrolling flooded passages
11. **Dune-Sunk Purple Devourer** — Colossal worm tunneling beneath the whole valley
12. **Efreeti Bound to the Eternal Forge-Idol** — Bound efreeti stoking the temple's idol forge
13. **Cyclops Oracle of the Buried Eye** — Blinded giant seer reading omens in ruined stone
14. **Marble-Veined Storm Giant Excavator** — Giant quarry-guard who once cut the temple's stones
15. **Death-Cultist Herald of the Buried Sun** — Cultist preaching the sun is entombed, awaiting blood rite
16. **Archpriest of the Dead Liturgy** — Last living speaker of the temple's dead liturgy
17. **Bone-Crowned Death Knight of the Ziggurat** — Entombed general commanding a legion long gone
18. **Vault-Sealed Naga of the Bone Archive** — Serpent-sage guarding the archive of the dead's names
19. **Frost-Cracked Abominable Cave-Beast** — Anomalous cold-beast denning in a frost-slick cave
20. **Rakshasa Vizier of the Broken Court** — Fiendish vizier still whispering from the throne's shadow
21. **The Undying Ape-Colossus of the Sacred Grove** — Titanic ape-idol punishing desecrators of the grove
22. **Dragon-Turtle of the Drowned Necropolis** — Shelled leviathan wearing a swallowed necropolis
23. **The First Priest-King, Undying** — Founder-king's jeweled skull still dreaming empire
24. **Emperor Wyrm of the Sunken Ziggurat** — Serpent-dragon bound in death to its own ziggurat
25. **The Ever-Watching Sphinx of Final Judgment** — Threshold sphinx judging souls by riddle or blade

### Monster sheet 5/5

1. **Medusa** — snake-haired gaze-petrify guardian of a forbidden shrine
2. **the Minotaur** — bull-headed labyrinth-warden, gores anything that gets turned around
3. **the Hydra** — regenerating many-headed swamp apex predator
4. **the Cyclops** — one-eyed shepherd-giant sentry, brutal in close quarters
5. **the Oracle Cyclops** — blind seer-giant, prophetic elite variant of the sentry
6. **the Chimera** — lion/goat/serpent composite, breathes fire mid-roar
7. **the Harpy** — filth-winged bird-woman raider, hunts in screaming flocks
8. **the Harpy Matriarch** — harpy brood-leader, coordinates the swarm's dive attacks
9. **the Sphinx-Warden** — riddling lion-bodied guardian barring a sealed passage
10. **Anubis's Jackal-Priest** — jackal-masked tomb-priest, judges intruders before it fights them
11. **the Mummy** — bandage-wrapped rot-cursed guardian of a sealed tomb
12. **Gilgamesh's Shade** — legendary king's undying shade, apex melee boss
13. **Humbaba** — monstrous forest-guardian giant, terrifying roar attack
14. **Grendel** — iron-immune marsh-raider, hunts camps at night
15. **Grendel's Mother** — underwater ambush-avenger, drags foes into her mere
16. **Raptor Pack-Hunter** — quick feathered pack-hunter, always comes in threes
17. **Pteranodon Screecher** — cliff-nesting flying scavenger, snatches and flees
18. **Allosaurus** — mid-sized ambush predator, fast and relentless
19. **Triceratops** — armored horned grazer, devastating charge when cornered
20. **Tyrannosaurus Rex** — the valley's apex predator, ends most fights in one bite

---

## NPC batches (44 total, 2 sheets)

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/2

1. **Canal-farmer or Terrace-tender** — Tied to the land and its seasons; the base everyone eats from.
2. **Waste-runner or Ruin-hunter** — Reads the wild and brings in what the settled can't.
3. **Stone-hauler or Relic-porter** — Moves the heavy things; sees everything, is asked nothing.
4. **Tomb-delver or Vault-breaker** — Works the dark and the tight places; patient underground.
5. **Bond-servant or Tomb-house attendant** — Invisible to the powerful, and so hears every secret.
6. **Ruin-beggar or Camp-follower** — Has nothing, so knows the streets better than anyone.
7. **Relic-tinkerer or Old-craft apprentice** — Their tools carry their whole history.
8. **Bronze-caster or Old-alloy smith** — Calloused hands; deals in practical defense.
9. **Dig-camp cook** — Up before dawn; holds the neighborhood's gossip.
10. **Buttress-mason or Shoring-carpenter** — Reads every structure out of habit; knows what's load-bearing.
11. **Wrap-weaver or Shroud-maker** — Notices the cut and quality of everyone's clothes.
12. **Expedition outfitter or Camel-master** — Keeps the means of travel and trade running; eyes on the weather.
13. **Relic-fence or Antiquities broker** — Information-rich, truth-poor.
14. **Caravanserai-keeper or Dig-camp quartermaster** — Controls the space, not the people in it.
15. **Curse-ward apothecary or Herb-woman** — Smells of bitterroot; knows what heals and what doesn't.
16. **Dig-camp physician** — Trusted, and overburdened by it.
17. **Grave-rite keeper** — Maintains the ritual, not the doctrine.
18. **Epic-singer or Lorekeeper-bard** — Craves the attention; hides the true feeling under it.
19. **Wonder-warden or Site militiaman** — Authority-adjacent, with limited real power.
20. **Tomb-raider's muscle** — Loyalty bought with coin, and cynical about it.
21. **Waste-caravan guard** — Wary of the road; values a good pair of boots.
22. **Wasteland raider** — Desperate or cruel; lives outside the law.
23. **Relic-smuggler** — Hides the cargo; speaks only in euphemism.
24. **Tomb-robber** — Eyes every coin-pouch; avoids every eye.
25. **Dead-god zealot behind a digger's face** — Fanatical devotion behind a mundane face.

### NPC sheet 2/2

1. **Cult recruiter preaching the god-king's return** — Charisma aimed at the desperate; sells belonging.
2. **Foreign scholar or Far-realm pilgrim** — Chose to stay here; the reasons stay unclear.
3. **Ruin-hermit** — Known of, rarely seen.
4. **Acting steward for an heir long dead** — Filling in for someone absent; borrowed authority.
5. **Dig-boss or Camp strongman** — Power without a title.
6. **Reluctant tomb-guide** — Unqualified, unwilling, or both — and in the role anyway.
7. **Antiquities baron** — Sees every interaction as a transaction.
8. **Forbidden archivist** — Hoards the secret knowledge; sees others as material.
9. **The one who remembers the world before the fall** — Their very presence is the notable thing.
10. **Ruin-reader** — The last who can read the dead tongue; the monument speaks only to them.
11. **Tomb-guardian** — A bloodline still keeping a watch no one remembers assigning.
12. **Relic-hunter** — Plunders the wonder for coin — one curse at a time.
13. **Last-of-the-line** — The final heir of a people the sand swallowed; carries the whole memory.
14. **Oracle-keeper** — Tends a voice that outlived its god and still, unhelpfully, answers.
15. **God-king's heir** — Claims a throne no one alive is left to recognize — and means it.
16. **Caretaker-construct** — The builders' servant, still on duty, still following the last instruction.
17. **Expedition-guide** — Leads outsiders in. Doesn't always lead the same number out.
18. **Keeper-of-the-flame** — Tends a rite whose meaning is lost but whose lapse is deeply feared.
19. **Awakened sleeper** — Roused out of the old age into this one; entirely, dangerously out of time.

