---
type: scratch
status: experimental
created: 2026-07-09
realm: lost-world
---

# Sprite Batch Prompts — Lost World (saurian court, three strata, under a volcanic mountain-clock)

> **Production-format authority (2026-07-24):** The packet grammar demonstrated here is the
> preferred grammar for new sprite production. Use [`PRODUCTION-FORMAT.md`](PRODUCTION-FORMAT.md)
> for current grid, cell-aspect, canvas, QA, and receipt fields. Any `5×5` / `25 cells` value
> below is historical batch data, not a universal default.

**Roster/content status: working, not canon.** This
file batches EVERY creature in the Lost World realm bestiary (120 monsters) plus a
themed NPC roster (44 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). humid jungle-green-and-ember palette, heavy atmospheric dither for volcanic haze, warm ember rim light against deep shadow strata, scale/hide textures, one glowing high-value accent (ritual paint, ember-lit eyes) per sprite.

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

## NPC batches (74 total, 3 sheets — 1 exact-duplicate entry removed from sheet 3/3 2026-07-09, see SPRITE-TRANSITION T2)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population is explicitly mixed: saurian-folk (scaled, reptilian features, per this realm's own court identity) and humans genuinely coexist here — see the final entries below for saurian-folk examples, not a reskin of the human entries, alongside an ethnically varied human population.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). humid jungle-green-and-ember palette, heavy atmospheric dither for volcanic haze, warm ember rim light against deep shadow strata, scale/hide textures, one glowing high-value accent (ritual paint, ember-lit eyes) per sprite.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/3

1. **Canal-farmer** — Tied to the land and its seasons; the base everyone eats from.
2. **Waste-runner** — Reads the wild and brings in what the settled can't.
3. **Stone-hauler** — Moves the heavy things; sees everything, is asked nothing.
4. **Tomb-delver** — Works the dark and the tight places; patient underground.
5. **Bond-servant** — Invisible to the powerful, and so hears every secret.
6. **Ruin-beggar** — Has nothing, so knows the streets better than anyone.
7. **Relic-tinkerer** — Their tools carry their whole history.
8. **Bronze-caster** — Calloused hands; deals in practical defense.
9. **Dig-camp cook** — Up before dawn; holds the neighborhood's gossip.
10. **Buttress-mason** — Reads every structure out of habit; knows what's load-bearing.
11. **Wrap-weaver** — Notices the cut and quality of everyone's clothes.
12. **Expedition outfitter** — Keeps the means of travel and trade running; eyes on the weather.
13. **Relic-fence** — Information-rich, truth-poor.
14. **Caravanserai-keeper** — Controls the space, not the people in it.
15. **Curse-ward apothecary** — Smells of bitterroot; knows what heals and what doesn't.
16. **Dig-camp physician** — Trusted, and overburdened by it.
17. **Grave-rite keeper** — Maintains the ritual, not the doctrine.
18. **Epic-singer** — Craves the attention; hides the true feeling under it.
19. **Wonder-warden** — Authority-adjacent, with limited real power.
20. **Tomb-raider's muscle** — Loyalty bought with coin, and cynical about it.
21. **Waste-caravan guard** — Wary of the road; values a good pair of boots.
22. **Wasteland raider** — Desperate or cruel; lives outside the law.
23. **Relic-smuggler** — Hides the cargo; speaks only in euphemism.
24. **Tomb-robber** — Eyes every coin-pouch; avoids every eye.
25. **Dead-god zealot behind a digger's face** — Fanatical devotion behind a mundane face.

### NPC sheet 2/3

1. **Cult recruiter preaching the god-king's return** — Charisma aimed at the desperate; sells belonging.
2. **Foreign scholar** — Chose to stay here; the reasons stay unclear.
3. **Ruin-hermit** — Known of, rarely seen.
4. **Acting steward for an heir long dead** — Filling in for someone absent; borrowed authority.
5. **Dig-boss** — Power without a title.
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
20. **Saurian-folk artisan — scaled, reptilian features, lower-strata craftsperson, not court-rank**
21. **Saurian-folk elder — scaled, remembers the mountain-clock's last turn**
22. **Dark-skinned human trader — outsider, tolerated for what they bring**
23. **Saurian-folk temple guard — humanoid build, reptilian face and scale**
24. **Sun-weathered human guide — the only one who'll lead outsiders past the lower strata**
25. **Mixed-heritage court runner — human and saurian both claim relation, belongs fully to neither**

---

### NPC sheet 3/3

1. **Dark-skinned jungle guide — the only human who knows the safe paths through the lower strata**
2. **Elderly saurian-folk record-keeper — scaled, remembers three generations of court decree**
3. **Broad-shouldered human quarry worker — hauls temple stone alongside the saurian laborers**
4. **Young saurian-folk apprentice priest — scaled, still learning the mountain-clock's rites**
5. **Grey-haired human herbalist — trusted by both strata for remedies neither fully understands**
6. **One-eyed human trapper — lost the eye to something still down in the lower ruins**
7. **Freckled human child raised in the court — plays with saurian-folk children, doesn't see the difference yet**
8. **Heavyset saurian-folk market vendor — scaled, sells goods from all three strata**
9. **Dark-skinned human court translator — bridges human and saurian-folk speech**
10. **Pale human archivist — catalogues ruins the court would rather forget**
11. **Short, sharp-eyed saurian-folk scout — scaled, fast through the jungle canopy**
12. **Elderly saurian-folk elder — scaled, remembers the mountain-clock's last full turn**
13. **Sunburnt human overseer — manages a work crew that resents him fairly**
14. **Lean, twitchy human tomb-scout — works the lower strata for coin, hates every minute**
15. **Stout saurian-folk cook — scaled, runs the court kitchens with an iron claw**
16. **Grey-haired human retired soldier — one of the few outsiders the court still trusts**
17. **Young saurian-folk twins — scaled, training for temple-guard duty together**
18. **Broad, scarred saurian-folk laborer — scaled, does the heaviest lifting in the quarry**
19. **Elderly blind human oracle — reads the mountain-clock's rumble better than sighted priests**
20. **Dark-skinned, heavily scarred human relic-hunter — brings back what the court won't send its own for**
21. **Small, quick-handed human pickpocket — works the market strata, avoids the temple guard**
22. **Weathered saurian-folk gardener — scaled, tends the terraced court gardens**
23. **Saurian-folk healer's apprentice — scaled, gentle-clawed, still learning**
24. **Tall, gaunt human court accountant — keeps books for a court that barely uses coin**

## Domestic animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). humid jungle-green-and-ember palette, heavy atmospheric dither for volcanic haze, warm ember rim light against deep shadow strata, scale/hide textures, one glowing high-value accent (ritual paint, ember-lit eyes) per sprite.

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
11. **Domestic animal — The realm-beast (a half-tamed saurian runt kept close for its nose, not its temper)**
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
humid jungle-green-and-ember palette, heavy atmospheric dither for volcanic haze, warm ember rim light against deep shadow strata, scale/hide textures, one glowing high-value accent (ritual paint, ember-lit eyes) per sprite.

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
11. **Wild animal — The realm-beast (a territorial pack-hunter saurian that reads as animal until it doesn't)**
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
humid jungle-green-and-ember palette, heavy atmospheric dither for volcanic haze, warm ember rim light against deep shadow strata, scale/hide textures, one glowing high-value accent (ritual paint, ember-lit eyes) per sprite.

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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). humid jungle-green-and-ember palette, heavy atmospheric dither for volcanic haze, warm ember rim light against deep shadow strata, scale/hide textures, one glowing high-value accent (ritual paint, ember-lit eyes) per sprite.

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


## Expansion batches — REALM-KEY-EXPANSION-ROSTER draft, 2026-07-09 (20 total, 1 sheet)

Appended additions from `docs/REALM-KEY-EXPANSION-ROSTER.md` (Adam approved the full map): the
saurian caste ladder as court officers (distinct from the saurian-folk commoners on the NPC
sheets), the human underclass, dino mounts, and the seeded-only Zeal stratum — including Adam's
new ruling: **Zeal adepts, humans who know and understand both magic and technology**. Same
style block and mechanical instructions as above.

### Expansion sheet E1 (4×5 grid, 20 cells)

1. **Saurian Overseer** — scaled taskmaster on a quarry ledge, tally-staff mid-strike, humans beneath notice
2. **Saurian Tithe-Collector** — robed court reptile weighing a warren's grain against a bronze standard
3. **Court Herald** — lean feathered runner mid-stride, verdict-scroll held high, never slowing
4. **Arena Warden** — scarred saurian with a hooked pole-goad, unbarring the pit gate
5. **Saurian Magistrate** — jeweled court judge mid-gavel, one claw open for the transaction, the other pointing at the pit
6. **The Court Prince** — towering crested saurian in ceremonial plate, cloak of office, verdict already decided
7. **Warren Rat-Catcher** — wiry human of the underclass, sling and sack, working the giant footprint's shadow
8. **Collaborator Foreman** — human overseer of humans, court-issued whip, avoiding every eye
9. **Free-Warren Raider** — masked human rebel mid-vault, stolen court bronze in hand
10. **Pit Runner** — lean sprint-dinosaur bred for the arena, mid-stride, harness scars
11. **Saddle-Broken Ceratopsian** — horned mount in court barding, head lowered under saddle
12. **War-Howdah Bull** — massive quadruped with a fighting platform strapped to its back, mid-bellow
13. **Mount-Wrangler of the Low Stables** — human stable-keeper the saurians tolerate because the beasts trust him
14. **The Mountain's Own** — the deep-time apex half-emerged from the volcanic dark, older than the court
15. **Zeal Sentinel Construct** — geometric humming guardian at a sealed door, seeded-stratum glow
16. **The Dreaming Archivist** — robed figure asleep upright, records writing themselves around it
17. **The Pilgrim Who Found the Door** — ragged traveler holding a light that isn't fire, changed
18. **Zeal Adept — Magus-Engineer** — human in layered work-robes, one hand casting, one hand wrenching a humming panel
19. **Zeal Adept — Blade-Scholar** — human duelist mid-guard with a blade that is also an instrument
20. **Zeal Adept Elder** — grey human elder, magic and technology braided in the staff they lean on, unruled

## Item batches — from `Engine/03. _Tables/05. Realms/Realm Items - Lost-World.md` (49 total, 2 sheets)

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

1. **A shard of painted pottery** [Grounded] — A shard of painted pottery, glaze faded, its pattern half a story the court's scholars pretend they cannot read.
2. **A worn token** [Grounded] — A worn token, face rubbed featureless, struck by no power the scaled court will admit ever ruled here.
3. **A chipped stone hand-axe** [Grounded] — A chipped stone hand-axe, polished by generations of mammal grips before it was lost.
4. **A machete** [Grounded] — A machete, jungle-worn, spine notched once per season a forager survived the low country.
5. **A clay tablet** [Grounded] — A clay tablet, cracked, script older than any tongue spoken above or below the scale-line.
6. **A hank of forager's cord** [Grounded] — A hank of forager's cord, waxed, 100 ft, knotted every 10.
7. **A stone lamp** [Grounded] — A stone lamp, oil long evaporated, wick-hole soot-stained, cut by a hand that predates the court. | lantern, hooded
8. **A signal whistle carved from a raptor's wing-bone** [Grounded]
9. **A funerary mask fragment** [Grounded] — A funerary mask fragment, gold leaf mostly flaked away, the face beneath neither mammal nor scaled.
10. **A set of bone dice** [Grounded] — A set of bone dice, worn smooth, symbols instead of pips, from a game the scales never learned.
11. **A stone cylinder-seal that rolls out a repeating pattern in wet clay** [Grounded]
12. **A pot of resin-pitch** [Grounded] — A pot of resin-pitch, sealed, still tacky.
13. **A charcoal rubbing of a wall relief** [Textured] — A charcoal rubbing of a wall relief, taken in an obvious hurry.
14. **A boundary stone** [Textured] — A boundary stone, inscribed, small enough to carry with resentment.
15. **A grapple-ladder of hide and cold-hammered metal** [Textured] — A grapple-ladder of hide and cold-hammered metal, forager-grade, folds to a satchel.
16. **A block-and-tackle set** [Textured] — A block-and-tackle set, pulleys of dark alloy, rope fresh. | block and tackle
17. **A specimen case** [Textured] — A specimen case, cork-lined, latches sound.
18. **A warder's chain** [Textured] — A warder's chain, old metal, links uncorroded.
19. **A firepiston of horn and dark metal** [Textured] — A firepiston of horn and dark metal, drilled by a master who is dust.
20. **A waterskin lined with gold leaf** [Textured] — A waterskin lined with gold leaf, seam stamped with the mark of a power older than the court.
21. **A sundial that casts a shadow at night** [Strange] — A sundial that casts a shadow at night, cut so fine no smith in the valley can copy the gnomon.
22. **A rulers'-game board** [Strange] — A rulers'-game board, obsidian and shell, pieces complete, from before the scales sat any throne.
23. **An hourglass of impossibly clear glass** [Strange] — An hourglass of impossibly clear glass, filled with dust from the ruin it was found in, warm to the touch and very faintly humming.
24. **A guardian's stone eye** [Volatile] — A guardian's stone eye, pried from its socket, heavy as guilt.
25. **A clutch of leathery eggs** [Volatile] — A clutch of leathery eggs, warm, the size of melons. 1d4 of them.

### Item sheet 2/2 (5×5 grid, 24 cells)

1. **A wonder from the impossible layer beneath the ruins — a make no hand in this world can match — roll d4:** [Mythic] — A wonder from the impossible layer beneath the ruins — a make no hand in this world can match — roll d4: 1. The founding charter of the ones who lived above the weather, intact — the first name they gave the sky, the terms the world was raised under, and a blank line waiting for whoever finishes the founding. 2. A great orrery of `[the region's oldest power]`, still turning in the deepest dark on no axle, grinding toward a single hour its makers arranged to miss. 3. The last living seed of the garden the whole valley was raised around, kept in a vault of glass and gold that has not clouded once. 4. The true history-tablet of `[the region]` — everything that happened, and below the line where the makers' hands stopped, everything that still will; its glyphs rearrange themselves, politely, when read wrong.
2. **A grinding stone** [Grounded] — A grinding stone, hand-sized, worn to a shallow bowl by hands long before the scales.
3. **A worn leather satchel** [Grounded] — A worn leather satchel, ancient stitching, straps brittle.
4. **A carved wooden comb** [Grounded] — A carved wooden comb, remarkably preserved, its motif matching neither mammal nor scaled hand.
5. **A bronze mirror** [Grounded] — A bronze mirror, tarnished nearly black.
6. **A set of stone measuring weights in a system that converts to nothing ** [Grounded] — A set of stone measuring weights in a system that converts to nothing the court or the clans still use.
7. **A stone mace-head** [Grounded] — A stone mace-head, unhafted, heavier than its size suggests.
8. **A forager's field-press herbarium** [Textured] — A forager's field-press herbarium, boards and straps, half full.
9. **A pair of stilt-walkers' poles** [Textured] — A pair of stilt-walkers' poles, forager-modified.
10. **A censer on a chain** [Textured] — A censer on a chain, dark metal, still holding a block of ancient incense.
11. **Enchanted** [Textured] — Enchanted — "The Excavator's Compass" — dark brass, antique-styled, that always points toward the nearest untouched find.
12. **Enchanted** [Textured] — Enchanted — "The Porter's Yoke" — ancient wood, balance perfect.
13. **Enchanted** [Strange] — Enchanted — "The Garden-Keeper's Shears" — dark bronze, green with age, that trim any growth into shapes the wielder pictures.
14. **Enchanted** [Strange] — Enchanted — "The Silent Census" — a stone tablet that fills in missing names in its own ancient script.
15. **Signature** [Strange] — Signature — "The Preserve Turnstile Key" — a key of obsidian and dark metal, ornate, that fits the court's game-gates and nothing the clans built.
16. **Signature** [Strange] — Signature — "The Last Scribe's Stylus" — a stone stylus, ancient, that writes true words about anything it's pointed at.
17. **Signature** [Strange] — Signature — "The Deathless Founder's Circlet" — plain gold, unadorned, that fits any brow it's placed on.
18. **Signature** [Volatile] — Signature — "The Waking Guardian's Core" — a stone heart, cracked, warm, beating once per minute.
19. **Consumable** [Grounded] — Consumable — A preserved fruit, mummified, from an orchard the ones-before kept and no one has found still standing.
20. **Consumable** [Grounded] — Consumable — A pouch of ancient grain, somehow still viable, sealed in wax for an age.
21. **An obsidian court-blade** [Grounded] — An obsidian court-blade, knapped to a molecular edge and lashed to a bone haft — the sunning-lords' own make, not a ruin-find.
22. **A saurian tithe-cutter** [Textured] — A saurian tithe-cutter — a wedge of worked obsidian the court's overseers use to score, split, and portion anything from cane to a carcass to a stubborn lock.
23. **A court passage-token** [Textured] — A court passage-token — a polished scale-scrip disc, glyph-stamped, that says the bearer is *counted*: tolerated stock, not prey, not people.
24. **A rider's rig for something that was never meant to be ridden** [Strange] — A rider's rig for something that was never meant to be ridden — a harness of court obsidian-fittings and forager hide, clearly assembled by someone who intended to survive the attempt.

## Item batches — from `Engine/03. _Tables/05. Realms/Realm Items - Lost-World.md` (54 total, 3 sheets)

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

### Item sheet 1/3 (5×5 grid, 25 cells)

1. **A shard of painted pottery** [Grounded] — A shard of painted pottery, glaze faded, its pattern half a story the court's scholars pretend they cannot read.
2. **A worn token** [Grounded] — A worn token, face rubbed featureless, struck by no power the scaled court will admit ever ruled here.
3. **A chipped stone hand-axe** [Grounded] — A chipped stone hand-axe, polished by generations of mammal grips before it was lost.
4. **A machete** [Grounded] — A machete, jungle-worn, spine notched once per season a forager survived the low country.
5. **A clay tablet** [Grounded] — A clay tablet, cracked, script older than any tongue spoken above or below the scale-line.
6. **A hank of forager's cord** [Grounded] — A hank of forager's cord, waxed, 100 ft, knotted every 10.
7. **A stone lamp** [Grounded] — A stone lamp, oil long evaporated, wick-hole soot-stained, cut by a hand that predates the court.
8. **A signal whistle carved from a raptor's wing-bone** [Grounded]
9. **A funerary mask fragment** [Grounded] — A funerary mask fragment, gold leaf mostly flaked away, the face beneath neither mammal nor scaled.
10. **A set of bone dice** [Grounded] — A set of bone dice, worn smooth, symbols instead of pips, from a game the scales never learned.
11. **A stone cylinder-seal that rolls out a repeating pattern in wet clay** [Grounded]
12. **A pot of resin-pitch** [Grounded] — A pot of resin-pitch, sealed, still tacky.
13. **A charcoal rubbing of a wall relief** [Textured] — A charcoal rubbing of a wall relief, taken in an obvious hurry.
14. **A boundary stone** [Textured] — A boundary stone, inscribed, small enough to carry with resentment.
15. **A grapple-ladder of hide and cold-hammered metal** [Textured] — A grapple-ladder of hide and cold-hammered metal, forager-grade, folds to a satchel.
16. **A block-and-tackle set** [Textured] — A block-and-tackle set, pulleys of dark alloy, rope fresh.
17. **A specimen case** [Textured] — A specimen case, cork-lined, latches sound.
18. **A warder's chain** [Textured] — A warder's chain, old metal, links uncorroded.
19. **A firepiston of horn and dark metal** [Textured] — A firepiston of horn and dark metal, drilled by a master who is dust.
20. **A waterskin lined with gold leaf** [Textured] — A waterskin lined with gold leaf, seam stamped with the mark of a power older than the court.
21. **"The Gardener's Gloves"** [Strange] — "The Gardener's Gloves" — cracked leather, seams sprouting green.
22. **A sundial that casts a shadow at night** [Strange] — A sundial that casts a shadow at night, cut so fine no smith in the valley can copy the gnomon.
23. **A rulers'-game board** [Strange] — A rulers'-game board, obsidian and shell, pieces complete, from before the scales sat any throne.
24. **An hourglass of impossibly clear glass** [Strange] — An hourglass of impossibly clear glass, filled with dust from the ruin it was found in, warm to the touch and very faintly humming.
25. **A guardian's stone eye** [Volatile] — A guardian's stone eye, pried from its socket, heavy as guilt.

### Item sheet 2/3 (5×5 grid, 25 cells)

1. **A clutch of leathery eggs** [Volatile] — A clutch of leathery eggs, warm, the size of melons. 1d4 of them.
2. **A wonder from the impossible layer beneath the ruins — a make no hand in this world can match — roll d4:** [Mythic] — A wonder from the impossible layer beneath the ruins — a make no hand in this world can match — roll d4: 1. The founding charter of the ones who lived above the weather, intact — the first name they gave the sky, the terms the world was raised under, and a blank line waiting for whoever finishes the founding. 2. A great orrery of `[the region's oldest power]`, still turning in the deepest dark on no axle, grinding toward a single hour its makers arranged to miss. 3. The last living seed of the garden the whole valley was raised around, kept in a vault of glass and gold that has not clouded once. 4. The true history-tablet of `[the region]` — everything that happened, and below the line where the makers' hands stopped, everything that still will; its glyphs rearrange themselves, politely, when read wrong.
3. **A grinding stone** [Grounded] — A grinding stone, hand-sized, worn to a shallow bowl by hands long before the scales.
4. **A worn leather satchel** [Grounded] — A worn leather satchel, ancient stitching, straps brittle.
5. **A carved wooden comb** [Grounded] — A carved wooden comb, remarkably preserved, its motif matching neither mammal nor scaled hand.
6. **A bronze mirror** [Grounded] — A bronze mirror, tarnished nearly black.
7. **A set of stone measuring weights in a system that converts to nothing ** [Grounded] — A set of stone measuring weights in a system that converts to nothing the court or the clans still use.
8. **A stone mace-head** [Grounded] — A stone mace-head, unhafted, heavier than its size suggests.
9. **A forager's field-press herbarium** [Textured] — A forager's field-press herbarium, boards and straps, half full.
10. **A pair of stilt-walkers' poles** [Textured] — A pair of stilt-walkers' poles, forager-modified.
11. **A censer on a chain** [Textured] — A censer on a chain, dark metal, still holding a block of ancient incense.
12. **Enchanted** [Textured] — Enchanted — "The Excavator's Compass" — dark brass, antique-styled, that always points toward the nearest untouched find.
13. **Enchanted** [Textured] — Enchanted — "The Porter's Yoke" — ancient wood, balance perfect.
14. **Enchanted** [Textured] — Enchanted — "The Wanderer's Sandals" — ancient leather, resoled countless times.
15. **Enchanted** [Strange] — Enchanted — "The Reader's Lens" — a cracked magnifying lens, ground by hands that were not working from any bench in this world.
16. **Enchanted** [Strange] — Enchanted — "The Warden's Seal" — a stone signet ring, worn smooth, that opens doors the world forgot how to build.
17. **Enchanted** [Strange] — Enchanted — "The Garden-Keeper's Shears" — dark bronze, green with age, that trim any growth into shapes the wielder pictures.
18. **Enchanted** [Strange] — Enchanted — "The Founder's Lamp" — clay, ancient, that burns without fuel near anything the ones-before held sacred.
19. **Enchanted** [Strange] — Enchanted — "The Silent Census" — a stone tablet that fills in missing names in its own ancient script.
20. **Signature** [Strange] — Signature — "The Preserve Turnstile Key" — a key of obsidian and dark metal, ornate, that fits the court's game-gates and nothing the clans built.
21. **Signature** [Strange] — Signature — "The Last Scribe's Stylus" — a stone stylus, ancient, that writes true words about anything it's pointed at.
22. **Signature** [Strange] — Signature — "The Deathless Founder's Circlet" — plain gold, unadorned, that fits any brow it's placed on.
23. **Signature** [Volatile] — Signature — "The Waking Guardian's Core" — a stone heart, cracked, warm, beating once per minute.
24. **Consumable** [Grounded] — Consumable — A preserved fruit, mummified, from an orchard the ones-before kept and no one has found still standing.
25. **Consumable** [Grounded] — Consumable — A pouch of ancient grain, somehow still viable, sealed in wax for an age.

### Item sheet 3/3 (1×5 grid, 4 cells)

1. **An obsidian court-blade** [Grounded] — An obsidian court-blade, knapped to a molecular edge and lashed to a bone haft — the sunning-lords' own make, not a ruin-find.
2. **A saurian tithe-cutter** [Textured] — A saurian tithe-cutter — a wedge of worked obsidian the court's overseers use to score, split, and portion anything from cane to a carcass to a stubborn lock.
3. **A court passage-token** [Textured] — A court passage-token — a polished scale-scrip disc, glyph-stamped, that says the bearer is *counted*: tolerated stock, not prey, not people.
4. **A rider's rig for something that was never meant to be ridden** [Strange] — A rider's rig for something that was never meant to be ridden — a harness of court obsidian-fittings and forager hide, clearly assembled by someone who intended to survive the attempt.
