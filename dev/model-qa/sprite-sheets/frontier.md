---
type: scratch
status: experimental
created: 2026-07-09
realm: frontier
---

# Sprite Batch Prompts — Frontier (Western, a line nobody enforces)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
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

## NPC batches (75 total, 3 sheets)

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

1. **Dark-skinned homesteader — claimed land nobody thought would hold, made it hold**
2. **Elderly trading-post keeper — remembers when the town was three buildings**
3. **Broad-shouldered blacksmith — shoes every horse and settles every argument**
4. **Young telegraph operator — knows every secret that comes through the wire**
5. **Grey-haired midwife — delivered half the town, buried the other half**
6. **One-eyed gunsmith — lost the eye to a misfire, still the best shot in the county**
7. **Freckled newspaper boy — sells papers nobody reads twice**
8. **Heavyset saloon owner — hears every confession that comes with a whiskey**
9. **Dark-skinned cattle-drive foreman — runs the herd, and the crew, without raising his voice**
10. **Pale, sleepless night-shift railroad watchman — guards a line nobody's tried to rob in years**
11. **Short, sharp-eyed land surveyor — draws the boundaries everyone disputes later**
12. **Elderly retired marshal — took the badge off, kept the reputation**
13. **Sunburnt wheat farmer — works land that shouldn't grow anything this dry**
14. **Multi-ethnic immigrant rancher — works twice as hard for half the respect**
15. **Lean, twitchy stagecoach driver — outrun more holdups than he'll admit**
16. **Stout general-store owner, dark-skinned — stocks everything, prices fairly, remembers debts**
17. **Grey-haired preacher — the only law in town some Sundays**
18. **Young twin ranch hands — inseparable, unreasonably good with horses**
19. **Broad, scarred bounty-hunter — technically retired, still armed at all times**
20. **Elderly blind fortune-teller passing through — charges a dollar, means every word**
21. **Dark-skinned, heavily scarred trail guide — leads wagon trains through passes no map shows**
22. **Small, quick-handed card sharp — makes an honest living cheating dishonest men**
23. **Weathered well-digger — finds water where the surveyors said there wasn't any**
24. **Frontier doctor, unsentimental — has performed more surgery on a kitchen table than in any clinic**
25. **Tall, gaunt railroad accountant — keeps books for a company that barely tells the truth**

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
11. **Domestic animal — The realm-beast (the war-mule — a scarred pack mule that's been through more gunfights than its owner)**
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

