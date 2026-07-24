---
type: scratch
status: experimental
created: 2026-07-09
realm: frontier
---

# Sprite Batch Prompts — Frontier (Western, a line nobody enforces)

> **Production-format authority (2026-07-24):** The packet grammar demonstrated here is the
> preferred grammar for new sprite production. Use [`PRODUCTION-FORMAT.md`](PRODUCTION-FORMAT.md)
> for current grid, cell-aspect, canvas, QA, and receipt fields. Any `5×5` / `25 cells` value
> below is historical batch data, not a universal default.

**Roster/content status: working, not canon.** This
file batches EVERY creature in the Frontier realm bestiary (121 monsters) plus a
themed NPC roster (43 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). sun-bleached sepia-and-rust palette, dusty film-grain texture, hard midday rim light casting long low-value shadows, weathered leather/canvas/tin textures with visible wear.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (121 total, 5 sheets)

### Monster sheet 1/5

1. **Dust-Broke Drifter** — Desperate gun-for-hire, breaks and runs when losing
2. **Line-Rider** — Rank-and-file outlaw muscle, brave only in packs
3. **Coyote-Thing** — Wrong-shaped coyote pack, laughs instead of howling
4. **Scarecrow Sentinel** — Field scarecrow that only moves when unwatched
5. **Claim-Jumper** — Armed squatter on a forged land deed
6. **Company Enforcer** — Railroad-payroll thug who calls debt-collection business
7. **Buzzard-Kin** — Torso-sized vulture that circles the living early
8. **Dust Devil** — Living dust-funnel that scours riders off horseback
9. **Debt-Collector Ghoul** — Ledger-keeping ghoul who thinks the debt transfers
10. **Gunslinger's Shade** — Ghostly quick-draw reliving the duel he lost
11. **Iron Horse Wreck-Golem** — Salvaged locomotive-iron golem guarding a dead spur line
12. **Bounty Board Regular** — Wanted-poster gunfighter, unhurried and always faster
13. **Card-Sharp Killer** — Cheating gambler who kills the man who calls him
14. **Rustler Pack Boss** — Cattle-rustling gang boss, quick to shoot and blame
15. **Sidewinder Broodmother** — Wagon-length rattler with a half-mile brood
16. **Marshal's Ghost** — Murdered lawman still walking his dusk patrol
17. **Cattle-Baron's Enforcer** — Baron's undefeated duelist, fights over land and water
18. **Boneyard Preacher** — Buried-alive preacher whose sermon still convicts
19. **Stampede-Cursed Longhorn** — Feral cursed bull leading a stampede that never ends
20. **Vault-Keeper Wight** — Dead bank owner still guarding his strongbox
21. **Noon-Duel Gunfighter** — Undefeated noon-draw gunfighter the whole town fears
22. **Rail Baron's War-Machine** — Armored rail-car war-machine muscling a dead man's right-of-way
23. **Draw-at-Noon Revenant** — Duel-killed revenant returning every noon to draw again
24. **The Last Honest Marshal** — Undying lawman whose fused badge still holds the line
25. **The Noon Reckoning** — Towering fiend that embodies every blood-ended noon duel

### Monster sheet 2/5

1. **Tin-Star Deputy** — Green deputy who follows orders to the letter
2. **Trail-Dust Skinner** — Hide-skinner who sells to whoever's buying
3. **Powder-Monkey Kid** — Underage dynamite-runner, twitchy and dangerous
4. **Rail-Camp Roughneck** — Track-laying laborer who breaks heads for back pay
5. **Sidewinder Snake** — Ordinary rattler, unusually common and agitated
6. **Scrub-Land Jackrabbit Swarm** — Boiling jackrabbit mass that strips land bare
7. **Range Buzzard** — Ordinary vulture that follows the soon-to-be-dead
8. **Prairie Dust-Wolf** — Lean dry-wash wolf that takes livestock in packs
9. **Grave-Dust Crow** — Boneyard raven that talks in a dead man's cadence
10. **Whiskey-Nerve Brawler** — Saloon brawler who fights better drunk
11. **Homestead Scarecrow** — Cursed-field scarecrow variant guarding a homestead
12. **Claim-Office Forger** — Land-deed forger who triple-sells the same plot
13. **Stagecoach Highwayman** — Polite masked highwayman working the coach roads
14. **Company Book-Keeper Wight** — Dead accountant endlessly recounting debts owed
15. **Boothill Skeleton** — Rifle-toting graveyard skeleton in a rotted duster
16. **Dust-Choked Ghoul** — Thirst-crazed ghoul still digging a dry wash
17. **Grave-Dirt Zombie Posse** — Hanged gang risen in formation, horses long gone
18. **Mine-Shaft Crawler** — Blind mine-shaft predator that paralyzes and drags prey
19. **Sun-Blind Prospector Ghast** — Salt-blind prospector ghast that never turns back
20. **Rust-Bitten Rail Golem** — Iron-eating rail-yard scrap creature spitting corrosion
21. **Poker-Table Cheat** — Smooth card-palming cheat, quick with a hideout knife
22. **Sod-House Squatter** — Stubborn dugout squatter, mostly bluff
23. **Territorial Militia Rifle** — Poorly drilled militia rifleman who holds out of stubbornness
24. **Cavalry Deserter** — Cavalry deserter who robs both sides equally
25. **Prickled Cactus-Kin** — Reaching cactus-kin, still until a rider passes close

### Monster sheet 3/5

1. **Alkali Flat Wisp** — Salt-flat wisp luring the thirsty away from water
2. **Bounty-Poster Doppel** — Shapeshifter that impersonates its own bounty poster
3. **Copperhead Nest-Guard** — Territorial oversized copperhead denning a mine entrance
4. **Company Strikebreaker** — Liquor-raged strikebreaker sent to end a picket line
5. **Grave Robber Duo** — Boneyard grave robber, occasionally digs up trouble
6. **Iron-Rail Spike Wraith** — Crushed rail-worker ghost still driving phantom spikes
7. **Prairie Fire Elemental** — Runaway grass fire that took on a will of its own
8. **Sand-Wash Basilisk** — Petrifying desert basilisk denning a gravel-choked wash
9. **Trail-Boss Werewolf** — Cattle-drive boss who hunts differently by moonlight
10. **Bank Job Crew Boss** — Meticulous bank-job planner, never caught at the scene
11. **Whiskey-Runner Smuggler Chief** — Alias-juggling smuggler always ahead of questions
12. **Prospector's Undying Mule** — Overworked mule-skeleton still hauling a dead claim's ore
13. **Ridge-Line Sniper** — Patient half-mile ridge sniper who waits days for one shot
14. **Corral-Breaker Bull** — Fence-breaking mean bull that gores on principle
15. **Blood-Money Bounty Hunter** — Bounty hunter who only ever delivers corpses
16. **Ghost-Town Poltergeist** — Ghost-town spirit still setting up for gone customers
17. **Devil's Canyon Chimera** — Coyote-buzzard-rattler chimera denning an unspoken canyon
18. **Six-Gun Doppelganger** — Face-stealer that cashes in a gunfighter's old grudges
19. **Cursed Silver Vein Xorn** — Ore-eating burrower that ruins or blesses a mining claim
20. **Company Iron Enforcer** — Faceless boiler-plate construct enforcing company disputes
21. **Sand-Ghast Cattle King** — Herd-starving cattle baron risen hungrier than his own stock
22. **Faro Table Devil** — Card-table devil trading winning streaks for souls
23. **Rattlesnake Nest Colossus** — Rock-pile rattlesnake mass that moves as one animal
24. **Frontier Vampire Rancher** — Undead rancher whose herd thins one drained cow at a time
25. **Broken Treaty Warband Leader** — Warband leader avenging a torn-up land treaty

### Monster sheet 4/5

1. **Devil-Wind Salamander** — Heat-mirage serpent that strikes at high noon
2. **Wanted-Dead Wraith Duo** — Hanged outlaw brothers who ambush in tandem
3. **Iron Horse Runaway Engine** — Rail-broken locomotive now running the open desert on legs
4. **Buzzard-Winged Peryton** — Antlered vulture-thing casting its next victim's shadow
5. **Cattle-Baron's Gorgon Bull** — Forged iron bull breathing petrifying dust on trespassers
6. **Territorial Marshal Knight** — Rare honest federal marshal, rare enough to be a target
7. **Salt Flat Mummy King** — Hide-wrapped cattle baron still ruling from beyond death
8. **Devil's Bargain Land Baron** — Deal-making fiend buying ranches with cursed fine print
9. **Company War-Locomotive** — Heavier armored war-locomotive answering a dead order
10. **Ghost Cavalry Column** — Massacred cavalry column still charging on its anniversary
11. **Twelve-Gauge Lich of the Vault** — Bank president-lich fused to the vault he'll never lose
12. **Skinwalker Cavalry Scout** — Shapeshifting scout loyal only to the winning side
13. **Alkali Reaper Naga** — Lakebed naga speaking with every voice the salt swallowed
14. **Boneyard Behir** — Canyon-nesting lightning horror that hates the railroad's noise
15. **Rail Baron's Hydra Freight** — Freight-raised hydra guarding every car with another head
16. **Dead Hand Gunfighter Twins** — Twin gunfighter revenants who died misunderstanding each other
17. **Storm-Called Thunderbird** — Barn-sized storm raptor summoned by drought-broken faith
18. **Iron Baron's War-Golem Prime** — Triple-engine war-colossus built to end every argument
19. **Nightbringer of the Long Drive** — Cattle-drive foreman-fiend who never cared how many died
20. **Crossroads Contract Devil** — Crossroads fiend trading technically-honest desperate deals
21. **The Undertaker Who Never Sleeps** — Ledger-keeping undertaker who digs graves ahead of schedule
22. **The Company That Owns The Land** — Boardroom fiend embodying every stolen claim in the territory
23. **The Drought That Remembers** — Seven-year drought given a body, sterilizing the land it walks
24. **The Vigilance Committee** — Fused lynch-mob horror that can't be talked out of a verdict
25. **The Last Train West** — Unstoppable train-colossus that never lets its passengers off

### Monster sheet 5/5

1. **The Iron-Bound Marshal** — undead lawman who still serves his warrants
2. **Draw-Fast Desperado** — trigger-happy small-time outlaw
3. **The Coach-Line Gang** — stagecoach-robbing bandit crew regular
4. **Hired Iron** — mercenary gun for hire, loyal to coin only
5. **The Bounty Man** — methodical bounty hunter working a name-ledger
6. **The Rail Baron's Enforcer** — railroad company muscle clearing land claims
7. **Old Ruin-Rider** — headless spectral rider haunting the old coach road
8. **Pecos-Sized** — tall-tale frontier giant, cyclone-wrestling scale
9. **Widow Cutter** — blade-focused outlaw lieutenant, spares horses not riders
10. **The Claim-Jumper** — opportunist who steals worked mining claims
11. **Snake-Oil Peddler** — con-artist tonic peddler with real minor hexes
12. **The Vulture Above the Draw** — patient desert scavenger, an omen with wings
13. **Rattler-Kin Swarm** — venomous rattlesnake den swarming an abandoned claim
14. **The Cavalry That Didn't Come Back** — undead cavalry patrol still holding a dead formation
15. **Boothill Ghast** — neglected boothill-grave undead with a grudge
16. **Long Rope, Short Trial** — vigilante mob leader dispensing rough frontier justice
17. **The Dust-Devil Herald** — omen-bearing dust-devil elemental, bad-luck herald
18. **The Ferryman of the Dry Wash** — toll-taking psychopomp haunting a flood-prone desert crossing
19. **The Last Stand of Cutthroat Gulch** — canyon-holding outlaw kingpin, gang loyal past reason
20. **Buzzard Saint** — desert hermit-preacher who claims the land speaks through him
21. **Copperhead Doppelganger** — identity-thief shapeshifter working frontier towns

---

## NPC batches (71 total, 3 sheets — 4 exact-duplicate entries removed from sheet 3/3 2026-07-09, see SPRITE-TRANSITION T2)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population is entirely human (no established non-human civilian population in this realm's lore) — the diversity requirement is ethnic/physical variety only.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). sun-bleached sepia-and-rust palette, dusty film-grain texture, hard midday rim light casting long low-value shadows, weathered leather/canvas/tin textures with visible wear.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/3

1. **Farmer** — Tied to the land and its seasons; the base everyone eats from.
2. **Hunter** — Reads the wild and brings in what the settled can't.
3. **Laborer** — Moves the heavy things; sees everything, is asked nothing.
4. **Miner** — Works the dark and the tight places; patient underground.
5. **Servant** — Invisible to the powerful, and so hears every secret.
6. **Beggar** — Has nothing, so knows the streets better than anyone.
7. **Crafter** — Their tools carry their whole history.
8. **Blacksmith** — Calloused hands; deals in practical defense.
9. **Baker** — Up before dawn; holds the neighborhood's gossip.
10. **Mason** — Reads every structure out of habit; knows what's load-bearing.
11. **Tailor** — Notices the cut and quality of everyone's clothes.
12. **Wheelwright** — Keeps the means of travel and trade running; eyes on the weather.
13. **Merchant** — Information-rich, truth-poor.
14. **Innkeeper** — Controls the space, not the people in it.
15. **Herbalist** — Smells of bitterroot; knows what heals and what doesn't.
16. **Physician** — Trusted, and overburdened by it.
17. **Preacher** — Maintains the ritual, not the doctrine.
18. **Bard** — Craves the attention; hides the true feeling under it.
19. **Town Guard** — Authority-adjacent, with limited real power.
20. **Sellsword** — Loyalty bought with coin, and cynical about it.
21. **Caravan Guard** — Wary of the road; values a good pair of boots.
22. **Bandit** — Desperate or cruel; lives outside the law.
23. **Smuggler** — Hides the cargo; speaks only in euphemism.
24. **Cutpurse** — Eyes every coin-pouch; avoids every eye.
25. **Hidden Zealot** — Fanatical devotion behind a mundane face.

### NPC sheet 2/3

1. **Cult Recruiter** — Charisma aimed at the desperate; sells belonging.
2. **Foreign Settler** — Chose to stay here; the reasons stay unclear.
3. **Hermit** — Known of, rarely seen.
4. **Acting Deputy** — Filling in for someone absent; borrowed authority.
5. **Town Boss** — Power without a title.
6. **Reluctant Officeholder** — Unqualified, unwilling, or both — and in the role anyway.
7. **Landed Gentry** — Wealthy, bored, insulated from real consequence.
8. **Land Baron** — Sees every interaction as a transaction.
9. **Hedge-Scholar** — Hoards the secret knowledge; sees others as material.
10. **Stranger (the notable presence)** — Their very presence is the notable thing.
11. **Marshal / lawman** — The last honest law for a hundred miles; the badge means a little less each year.
12. **Gunslinger-for-hire** — Reputation is the whole résumé — and someone always rides in to test it.
13. **Homesteader** — Staked a claim the map won't recognize yet, and will die on it.
14. **Company / railroad agent** — Buying the future out from under everyone, politely, with papers.
15. **Prospector** — One strike from rich, ten years from broke, and can't stop.
16. **Circuit judge** — The law itself, in town three days a month, gone before the appeals.
17. **Cattle baron** — Owns the range, and the water rights everyone else has to cross.
18. **Wanted outlaw** — A face on a poster, worth more dead — and starting to believe it.
19. **Dark-skinned homesteader — claimed land nobody thought would hold, made it hold**
20. **Elderly trading-post keeper — remembers when the town was three buildings**
21. **Multi-ethnic railhand crew boss — laid the track everyone else profits from**
22. **Young telegraph operator — knows every secret that comes through the wire**
23. **Weathered midwife — delivered half the town, buried the other half**
24. **Foreign-tongued immigrant rancher — works twice as hard for half the respect**
25. **Grey-haired preacher — the only law in town some Sundays**

---

### NPC sheet 3/3

1. **Broad-shouldered blacksmith — shoes every horse and settles every argument**
2. **Grey-haired midwife — delivered half the town, buried the other half**
3. **One-eyed gunsmith — lost the eye to a misfire, still the best shot in the county**
4. **Freckled newspaper boy — sells papers nobody reads twice**
5. **Heavyset saloon owner — hears every confession that comes with a whiskey**
6. **Dark-skinned cattle-drive foreman — runs the herd, and the crew, without raising his voice**
7. **Pale, sleepless night-shift railroad watchman — guards a line nobody's tried to rob in years**
8. **Short, sharp-eyed land surveyor — draws the boundaries everyone disputes later**
9. **Elderly retired marshal — took the badge off, kept the reputation**
10. **Sunburnt wheat farmer — works land that shouldn't grow anything this dry**
11. **Multi-ethnic immigrant rancher — works twice as hard for half the respect**
12. **Lean, twitchy stagecoach driver — outrun more holdups than he'll admit**
13. **Stout general-store owner, dark-skinned — stocks everything, prices fairly, remembers debts**
14. **Young twin ranch hands — inseparable, unreasonably good with horses**
15. **Broad, scarred bounty-hunter — technically retired, still armed at all times**
16. **Elderly blind fortune-teller passing through — charges a dollar, means every word**
17. **Dark-skinned, heavily scarred trail guide — leads wagon trains through passes no map shows**
18. **Small, quick-handed card sharp — makes an honest living cheating dishonest men**
19. **Weathered well-digger — finds water where the surveyors said there wasn't any**
20. **Frontier doctor, unsentimental — has performed more surgery on a kitchen table than in any clinic**
21. **Tall, gaunt railroad accountant — keeps books for a company that barely tells the truth**

## Domestic animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). sun-bleached sepia-and-rust palette, dusty film-grain texture, hard midday rim light casting long low-value shadows, weathered leather/canvas/tin textures with visible wear.

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
11. **Domestic animal — The realm-beast (a rangy cow-dog or a one-eyed mule that's outlived three owners)**
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
sun-bleached sepia-and-rust palette, dusty film-grain texture, hard midday rim light casting long low-value shadows, weathered leather/canvas/tin textures with visible wear.

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
11. **Wild animal — The realm-beast (a lone coyote that trots the ridgeline at dusk like it's checking fences)**
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
sun-bleached sepia-and-rust palette, dusty film-grain texture, hard midday rim light casting long low-value shadows, weathered leather/canvas/tin textures with visible wear.

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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). sun-bleached sepia-and-rust palette, dusty film-grain texture, hard midday rim light casting long low-value shadows, weathered leather/canvas/tin textures with visible wear.

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


## Item batches — from `Engine/03. _Tables/05. Realms/Realm Items - Frontier.md` (45 total, 2 sheets)

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

1. **A trail cook's battered coffee pot** [Grounded] — A trail cook's battered coffee pot, dented from a hundred campfires. | pot, iron
2. **A deck of dog-eared playing cards** [Grounded] — A deck of dog-eared playing cards, one corner chewed by a mule. | gaming set
3. **A hand-tooled leather gun belt** [Grounded] — A hand-tooled leather gun belt, oiled soft from years of wear. | leather armor
4. **A tin star** [Grounded] — A tin star, unofficial — cut from a can, pinned crooked.
5. **A bedroll rated for hard ground and colder nights than the label admit** [Grounded] — A bedroll rated for hard ground and colder nights than the label admits.
6. **A trail map** [Grounded] — A trail map, hand-drawn, three towns behind on its own information.
7. **A box of percussion caps and a full powder flask** [Grounded] — A box of percussion caps and a full powder flask. | bullets, firearm
8. **A tobacco tin** [Grounded] — A tobacco tin, dented, half full, smells like better days.
9. **A canteen that never quite loses the taste of the last thing it carrie** [Grounded] — A canteen that never quite loses the taste of the last thing it carried.
10. **A saddle-worn Bible** [Grounded] — A saddle-worn Bible, spine cracked to Psalms.
11. **A spare set of horseshoes** [Grounded] — A spare set of horseshoes, cold-forged, a little uneven.
12. **Forty feet of good rope** [Grounded] — Forty feet of good rope, tallow-waxed against rot.
13. **A marshal's badge pulled off a body nobody's claimed** [Textured]
14. **A deed to a claim that's either played out or hasn't been found yet** [Textured] — A deed to a claim that's either played out or hasn't been found yet — the seller wasn't specific.
15. **A stagecoach strongbox** [Textured] — A stagecoach strongbox, locked, iron-banded, heavier than it looks.
16. **A folding shovel** [Textured] — A folding shovel, army surplus, edge honed past regulation.
17. **A gambler's vest with seven hidden pockets** [Textured]
18. **A gambler's marked deck** [Textured] — A gambler's marked deck, the marks subtle enough to survive one honest inspection. | gaming set
19. **A rustler's running iron** [Textured] — A rustler's running iron, filed to change any brand into any other.
20. **A pair of batwing saloon doors** [Textured] — A pair of batwing saloon doors, salvaged, hinges included.
21. **A compass that points** [Strange] — A compass that points, without fail, toward the nearest unmarked grave.
22. **A branding iron that leaves a mark shaped like a symbol no rancher in ** [Strange] — A branding iron that leaves a mark shaped like a symbol no rancher in three counties claims.
23. **A lariat coiled from gray horsehair** [Strange] — A lariat coiled from gray horsehair, lighter than it should be.
24. **A poker chip from a casino nobody can place** [Strange] — A poker chip from a casino nobody can place, heavy as a double eagle.
25. **A crate of sweating dynamite** [Volatile] — A crate of sweating dynamite, twelve sticks, beads glistening on the paper.

### Item sheet 2/2 (4×5 grid, 20 cells)

1. **A wild stallion** [Volatile] — A wild stallion, saddled, reins warm in your hand. Nobody broke him. He disagrees with the saddle.
2. **The thing the territory was settled by — roll d4:** [Mythic] — The thing the territory was settled by — roll d4: 1. The unfired bullet — the last round of the war that named this territory, casing blank, waiting for a name. 2. The homestead patent, blank, bearing the territorial seal — the last one ever printed, never filed. 3. The golden spike from the railroad that was never finished — the line stopped where the money did. 4. The marshal's commission, counter-signed by the territory itself, sworn to no town in particular.
3. **A pair of leather chaps** [Grounded] — A pair of leather chaps, scarred from a decade of mesquite and barbed wire. | leather armor
4. **A prospector's pan** [Grounded] — A prospector's pan, dented, gold-flecked from wishful thinking more than luck.
5. **A hitching post's iron ring** [Grounded] — A hitching post's iron ring, pried loose, still bearing rope-groove scars.
6. **A duster coat** [Grounded] — A duster coat, sand-colored, weatherproofed with a recipe the tailor won't share.
7. **A tin of hardtack biscuits that could double as masonry** [Grounded]
8. **A cattle-drive foreman's tally whip** [Grounded] — A cattle-drive foreman's tally whip, more noise than sting.
9. **A spyglass with a cracked eyepiece and a scratch that sits exactly on ** [Textured] — A spyglass with a cracked eyepiece and a scratch that sits exactly on the horizon.
10. **A farrier's full kit in a roll** [Textured] — A farrier's full kit in a roll, tools worn to fit one grip. | smith's tools
11. **A stove-in guitar with one true string left** [Textured]
12. **Enchanted** [Textured] — Enchanted — "Six-Gun of the Fair Draw" — a revolver that seems to know it's being watched.
13. **Enchanted** [Textured] — Enchanted — "The Marshal's Coat" — a long duster with a star sewn faintly into the lining.
14. **Enchanted** [Textured] — Enchanted — "Dead Man's Hand" — a poker hand, framed, that never leaves your coat pocket.
15. **Enchanted** [Strange] — Enchanted — "The Undertaker's Tape Measure" — cloth tape, weighted ends, folds itself.
16. **Enchanted** [Strange] — Enchanted — "The Claim-Jumper's Pick" — a mining pick that hums faintly near anything worth digging up.
17. **Signature** [Strange] — Signature — "The Last Honest Badge" — tin, hand-cut, worn soft at the edges, no department stamped anywhere on it.
18. **Signature** [Volatile] — Signature — "The Debt Collector" — a coiled bullwhip, black leather, that never quite finishes uncoiling.
19. **Consumable** [Grounded] — Consumable — A box of "Long-Nine" cartridges, hand-loaded, smelling faintly of sulfur and something sweeter.
20. **Consumable** [Grounded] — Consumable — A tin of "Snake-Oil" salve, three fingers left, label mostly worn away.

## Item batches — from `Engine/03. _Tables/05. Realms/Realm Items - Frontier.md` (50 total, 2 sheets)

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

1. **A trail cook's battered coffee pot** [Grounded] — A trail cook's battered coffee pot, dented from a hundred campfires.
2. **A deck of dog-eared playing cards** [Grounded] — A deck of dog-eared playing cards, one corner chewed by a mule.
3. **A hand-tooled leather gun belt** [Grounded] — A hand-tooled leather gun belt, oiled soft from years of wear.
4. **A tin star** [Grounded] — A tin star, unofficial — cut from a can, pinned crooked.
5. **A bedroll rated for hard ground and colder nights than the label admit** [Grounded] — A bedroll rated for hard ground and colder nights than the label admits.
6. **A trail map** [Grounded] — A trail map, hand-drawn, three towns behind on its own information.
7. **A box of percussion caps and a full powder flask** [Grounded]
8. **A tobacco tin** [Grounded] — A tobacco tin, dented, half full, smells like better days.
9. **A canteen that never quite loses the taste of the last thing it carrie** [Grounded] — A canteen that never quite loses the taste of the last thing it carried.
10. **A saddle-worn Bible** [Grounded] — A saddle-worn Bible, spine cracked to Psalms.
11. **A spare set of horseshoes** [Grounded] — A spare set of horseshoes, cold-forged, a little uneven.
12. **Forty feet of good rope** [Grounded] — Forty feet of good rope, tallow-waxed against rot.
13. **A marshal's badge pulled off a body nobody's claimed** [Textured]
14. **A deed to a claim that's either played out or hasn't been found yet** [Textured] — A deed to a claim that's either played out or hasn't been found yet — the seller wasn't specific.
15. **A stagecoach strongbox** [Textured] — A stagecoach strongbox, locked, iron-banded, heavier than it looks.
16. **A folding shovel** [Textured] — A folding shovel, army surplus, edge honed past regulation.
17. **A gambler's vest with seven hidden pockets** [Textured]
18. **A gambler's marked deck** [Textured] — A gambler's marked deck, the marks subtle enough to survive one honest inspection.
19. **A rustler's running iron** [Textured] — A rustler's running iron, filed to change any brand into any other.
20. **A pair of batwing saloon doors** [Textured] — A pair of batwing saloon doors, salvaged, hinges included.
21. **A compass that points** [Strange] — A compass that points, without fail, toward the nearest unmarked grave.
22. **A branding iron that leaves a mark shaped like a symbol no rancher in ** [Strange] — A branding iron that leaves a mark shaped like a symbol no rancher in three counties claims.
23. **A lariat coiled from gray horsehair** [Strange] — A lariat coiled from gray horsehair, lighter than it should be.
24. **A poker chip from a casino nobody can place** [Strange] — A poker chip from a casino nobody can place, heavy as a double eagle.
25. **A crate of sweating dynamite** [Volatile] — A crate of sweating dynamite, twelve sticks, beads glistening on the paper.

### Item sheet 2/2 (5×5 grid, 25 cells)

1. **A wild stallion** [Volatile] — A wild stallion, saddled, reins warm in your hand. Nobody broke him. He disagrees with the saddle.
2. **The thing the territory was settled by — roll d4:** [Mythic] — The thing the territory was settled by — roll d4: 1. The unfired bullet — the last round of the war that named this territory, casing blank, waiting for a name. 2. The homestead patent, blank, bearing the territorial seal — the last one ever printed, never filed. 3. The golden spike from the railroad that was never finished — the line stopped where the money did. 4. The marshal's commission, counter-signed by the territory itself, sworn to no town in particular.
3. **A pair of leather chaps** [Grounded] — A pair of leather chaps, scarred from a decade of mesquite and barbed wire.
4. **A prospector's pan** [Grounded] — A prospector's pan, dented, gold-flecked from wishful thinking more than luck.
5. **A hitching post's iron ring** [Grounded] — A hitching post's iron ring, pried loose, still bearing rope-groove scars.
6. **A duster coat** [Grounded] — A duster coat, sand-colored, weatherproofed with a recipe the tailor won't share.
7. **A tin of hardtack biscuits that could double as masonry** [Grounded]
8. **A cattle-drive foreman's tally whip** [Grounded] — A cattle-drive foreman's tally whip, more noise than sting.
9. **A spyglass with a cracked eyepiece and a scratch that sits exactly on ** [Textured] — A spyglass with a cracked eyepiece and a scratch that sits exactly on the horizon.
10. **A farrier's full kit in a roll** [Textured] — A farrier's full kit in a roll, tools worn to fit one grip.
11. **A stove-in guitar with one true string left** [Textured]
12. **Enchanted** [Textured] — Enchanted — "Six-Gun of the Fair Draw" — a revolver that seems to know it's being watched.
13. **Enchanted** [Textured] — Enchanted — "The Widowmaker's Vest" — a leather vest, bullet-scarred, that's stopped more rounds than it should have.
14. **Enchanted** [Textured] — Enchanted — "Boothill Boots" — spurs fused to the leather, jingling even when you're standing still.
15. **Enchanted** [Textured] — Enchanted — "The Marshal's Coat" — a long duster with a star sewn faintly into the lining.
16. **Enchanted** [Textured] — Enchanted — "Dead Man's Hand" — a poker hand, framed, that never leaves your coat pocket.
17. **Enchanted** [Strange] — Enchanted — "The Undertaker's Tape Measure" — cloth tape, weighted ends, folds itself.
18. **Enchanted** [Strange] — Enchanted — "Sundown Spectacles" — smoked glass in a tin frame, bent to fit a face that wasn't yours.
19. **Enchanted** [Strange] — Enchanted — "The Claim-Jumper's Pick" — a mining pick that hums faintly near anything worth digging up.
20. **Signature** [Strange] — Signature — "Peacemaker, Blued" (frame: hand crossbow) — a revolver blued to near-black, balanced like it was made for one hand in particular.
21. **Signature** [Strange] — Signature — "Trail-Iron Shoes" (wondrous) — horseshoes cast from rail-iron, warm to the touch even in snow.
22. **Signature** [Strange] — Signature — "The Last Honest Badge" — tin, hand-cut, worn soft at the edges, no department stamped anywhere on it.
23. **Signature** [Volatile] — Signature — "The Debt Collector" — a coiled bullwhip, black leather, that never quite finishes uncoiling.
24. **Consumable** [Grounded] — Consumable — A box of "Long-Nine" cartridges, hand-loaded, smelling faintly of sulfur and something sweeter.
25. **Consumable** [Grounded] — Consumable — A tin of "Snake-Oil" salve, three fingers left, label mostly worn away.
