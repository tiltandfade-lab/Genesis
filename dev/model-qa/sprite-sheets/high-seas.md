---
type: scratch
status: experimental
created: 2026-07-09
realm: high-seas
---

# Sprite Batch Prompts — High Seas (age of sail, salt and debt to the crew)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the High Seas realm bestiary (118 monsters) plus a
themed NPC roster (44 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). sun-faded teal-and-driftwood palette, salt-spray dither texture, hard bright rim light off water, weathered rope/canvas/barnacle textures, one high-value wet-glint accent per sprite.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (118 total, 5 sheets)

### Monster sheet 1/5

1. **Press-Ganged Deckhand** — Unwilling conscript swinging a cutlass under threat
2. **Bilge Rat Swarm** — Chittering vermin tide pouring from the hold
3. **Rope-Scar Cutthroat** — Cutlass-and-flintlock buccaneer swarming the rail
4. **Chum-Slick Reef Shark** — Blood-trail shark circling a wounded hull
5. **Waterlogged Deckwalker** — Drowned crewman shambling back up the chain
6. **Rattling Bone-Crew Deckhand** — Cutlass-armed skeleton still standing its watch
7. **Fin-Toothed Raider** — Fish-fanged sea-devil boarding from below
8. **Kraken-Spawn Squidling** — Trench-spawned tentacle-beast dragging sailors under
9. **Gull-Eyed Wreck Harpy** — Rock-nesting harpy luring ships onto reefs
10. **Debt-Marked Bosun** — Ledger-keeping enforcer collecting the crew's debts
11. **Deep-Fang Sea-Devil Priest** — Sea-devil war-priest chanting a raiding pack to frenzy
12. **Quartermaster of the Broken Articles** — Shadow-captain running the ship by fear alone
13. **Chain-Dragging Drowned Sailor** — Anchor-chained revenant press-ganging the living
14. **Mutinous First Mate** — Blade-drawn mate who murdered his way to command
15. **Fogbank Siren** — Fog-shrouded siren-witch bartering safe passage
16. **Lantern-Eyed Ghost Captain** — Translucent captain still haunting his own quarterdeck
17. **Riptide Elemental** — Living riptide dragging a wreck's leftovers under
18. **Deep-Baron of the Drowning Grounds** — Reef-ruling sea-devil warlord commanding raid packs
19. **Plague-Hulk Zombie Crew** — Fused mass of drowned dead still crewing the hulk
20. **Storm-Caller of the Drowned Choir** — Voice-traded witch who calls storms on command
21. **The Admiral of Nowhere** — Undead fleet-admiral commanding a century-scuttled navy
22. **The Keelbreaker** — Many-headed sea-brute older than the shipping lanes
23. **The Ghost Ship Herself** — Self-sailing derelict crewed by its own drowned dead
24. **The Fathom-Crowned Leviathan** — The keel-sunk horror sailors swear by and dread
25. **The Horizon's Own Reckoning** — Storm-fire captain who sailed past the edge of the charts

### Monster sheet 2/5

1. **Salt-Cracked Deck Sweeper** — Low-rank deckhand enforcer, no say in the voyage
2. **Powder Monkey Turned Cutthroat** — Former powder-boy now knife-quick and patience-thin
3. **Barnacle-Crusted Beachcomber** — Wreck-looting beachcomber, quick to rob the living
4. **Marooned Castaway** — Island-marooned mutineer's scapegoat, come back wrong
5. **Gull-Picked Corpse Crab** — Scavenging tideline crab drawn to the recently dead
6. **Chain-Rattling Bilge Zombie** — Drowned bilge-worker who never noticed the sinking
7. **Wreck-Wood Skeleton** — Reef-floor skeleton reassembled by tide-logic
8. **Grog-Mad Deckhand** — Becalmed sailor gone rum-mad and swinging
9. **Coral-Fanged Moray Swarm** — Territorial eel-knot nesting inside a breached hull
10. **Flying-Fish Strafer Flock** — Oversized gliding fish-flock that shreds exposed skin
11. **Bilge-Bloated Corpse Floater** — Bloated floating corpse that only moves when approached
12. **Rope-and-Rum Buccaneer** — Fair-weather buccaneer who renegotiates loyalty mid-fight
13. **Tide-Warped Sahuagin Scout** — Sea-devil scout that tests hulls before the pod attacks
14. **Driftwood Effigy Watcher** — Wreck-spar effigy that patrols the reef it was built to ward
15. **Reef-Crawling Giant Crab** — Wreck-territorial crab that clamps and never releases
16. **Fogbound Lookout Wraith** — Dead lookout still calling sightings to a vanished crew
17. **Anchor-Chain Ghoul** — Chain-tangled ghoul dragging fathoms of rusted iron
18. **Kraken-Spawn Tentacle Horror** — Small deep-thing juvenile that boards and strikes throats
19. **Sea-Devil Net-Thrower** — Sahuagin netter that drags swimmers under first
20. **Salvage-Diver Ghoul** — Drowned salvager-ghoul that won't surface without its box
21. **Hardtack Cannibal Crewman** — Lifeboat survivor turned desperate, quiet cannibal
22. **Shrieking Storm Petrel Swarm** — Storm-heralding bird swarm that screeches the ship's name
23. **Barrel-Bomb Mutineer** — Mutineer wielding a lit powder keg as leverage
24. **Wreck-Grown Rust Louse Swarm** — Hull-nesting vermin that rusts weapons to flakes
25. **Doldrums-Drunk Deserter** — Starvation-mad deserter, dangerous to would-be rescuers

### Monster sheet 3/5

1. **Barnacle Golem** — Reef-grown armor golem woken by a scuttled hull
2. **Sea-Devil Priest's Acolyte** — Junior sea-devil chanter half a beat behind the priest
3. **Debt-Marked Purser** — Ship's purser running two ledgers, one true and one lie
4. **Reef-Devil Trapper** — Sea-devil that lures hulls onto reefs with false lanterns
5. **Hollow-Eyed Lantern Ghost** — Drowned signalman's ghost-light, warning and luring both
6. **Rope-Trick Rigging Spider** — Rigging-nesting spider that snares sail-climbers with silk
7. **Rock-Skulking Bilge Ooze** — Bilgewater ooze that corrodes hull-plate and boot leather alike
8. **Quartermaster's Shakedown Man** — Articles-enforcer who finds loopholes when it profits him
9. **Coral Golem Guardian** — Patient coral colossus guarding a sunken treasure gallery
10. **Storm-Wracked Harpy Matriarch** — Wreck-nesting harpy matriarch that sings ships to their ruin
11. **Bone-Naga of the Drowned Vault** — Ancient bone-naga coiled around a sunken vault's treasure
12. **Fen-Tide Merrow Raider** — Skiff-overturning merrow raider, plunder is an afterthought
13. **Wreck-Diver Doppelganger** — Shape-stealing killer that answers to its last victim's name
14. **Rigging-Runner Assassin** — Above-boarding assassin who drops garrote-first onto helmsmen
15. **Brine-Cursed Werebear Bosun** — Cursed bosun who becomes a bear-thing under full moon
16. **Powder-Keg Berserker Boarder** — First-wave boarding-axe berserker screaming a death-oath
17. **Fogbank Siren's Herald** — Fog-wreathed hag singing harmony to lure ships ashore
18. **Sunken Chapel Revenant** — Drowned chaplain still preaching from a sunken pulpit
19. **Drowned Choir Cantor** — Storm-hymn cantor who calls weather nobody sane wants
20. **Iron-Hulled Corsair Captain** — Three-ship corsair captain, sinker of every bounty-navy sent
21. **Reef Titan Anemone** — Anemone colony that mimics drowning victims to lure rescuers
22. **Gale-Bound Air Elemental Squallwright** — Bottled storm-elemental shaken loose in the worst weather
23. **Drowned Duelist Wraith** — Duel-drowned officer's ghost, still gripping his rapier
24. **Sahuagin War-Priestess** — Tide-timing sea-devil priestess who calls the surge to war
25. **Boarding-Pike Skeleton Crew** — Disciplined drowned skeleton unit, still holds formation

### Monster sheet 4/5

1. **Waterlogged Chimeric Hulk-Beast** — Three drowned sailors fused into one furious hulk
2. **Deep-Baron's Shark-Bonded Enforcer** — Sea-devil baron who rides a bonded shark into every raid
3. **Hurricane-Voiced Storm Herald** — Unseen wind-scout that finds a ship's weakest rigging first
4. **Cursed Doubloon Wight-Captain** — Gold-cursed wight-captain who conscripts anyone who takes a coin
5. **Foundered Frigate's Ghast Bosun** — Foundered frigate's undead disciplinarian, punishment unending
6. **Kraken-Spawn Broodguard** — Half-grown deep-thing guarding a brood-nest, already boat-sized
7. **Drowned Fleet Admiral's Ghost** — Ghost admiral commanding an invisible spectral squadron
8. **Reef-Cracker Hydra** — Cave-denned hydra scarred by three failed charting attempts
9. **Boarding-Fiend Bone Devil** — Contracted boarding-fiend, payment terms deliberately vague
10. **Storm-Bound Efreeti Corsair** — Figurehead-bound fire-genie granting speed for an unpaid price
11. **Undertow Terror of the Shoals** — Shoal-burrowing terror that swallows hulls whole from beneath
12. **Pale Fathom Wight-Lord** — Generational wreck-revenant that drags its whole crew back up
13. **Coral Throne Basilisk-Queen** — Reef-throne guardian that petrifies looters of a drowned crown
14. **Death-Knight of the Broken Articles** — Blood-oathed undead enforcer of pirate-code violations
15. **Sunken Archmage of the Drowned Spire** — Two-centuries-drowned archmage still mid-spell in his tower
16. **Nightbringer of the Drowned Fleet** — Shipboard vampire quietly turning a becalmed fleet's crew
17. **The Bilge-Born Horror** — Hold-grown horror that sees through the deck planks above
18. **The Drowned Doge** — Drowned merchant-lord enthroned over the port he sank
19. **The Ninth Wave Herald** — Sentient storm-wave that is the reason the ninth wave is worst
20. **The Deathless Mutiny** — Fused mass of every drowned mutiny, wearing a stolen captain's coat
21. **The Sunken Cathedral's Choir Eternal** — Lich-chaplain still preaching to a two-century-drowned congregation
22. **The Maw That Charts No Course** — Chartless leviathan that swallows convoys from no fixed direction
23. **the Drowned Captain** — undead ship's-master, obsessed and unable to stop commanding
24. **Bosun Wormwood** — rank-and-file cutlass pirate, first over the rail
25. **the Bone Quartermaster** — undead crewman, ledger-obsessed and cutlass-armed

### Monster sheet 5/5

1. **the Kraken** — the mythic apex sea-titan, rarely surfaces, never forgotten
2. **Moby, the White Whale** — the pale, unkillable whale that turns and fights back
3. **a Siren** — reef-perched singer whose song offers exhausted sailors relief
4. **a Siren-Flock Screecher** — young siren, screeches and dives rather than enchants
5. **Scylla** — strait-bound many-headed horror, takes a toll from every passing hull
6. **the Charybdis Maw** — living whirlpool that swallows the strait on a rhythm
7. **the Flying Dutchman's Wheelman** — the cursed ghost-ship itself, animate and hunting for crew
8. **a Dutchman Deckhand** — waterlogged member of the cursed eternal crew
9. **Davy Jones's Chain-Ghoul** — drowned-sailor ghoul climbing up from the seabed locker
10. **the Locker-Warden** — the folkloric seabed afterlife given a keeper, vast and patient
11. **a Sea Hag of the Shoals** — reef-dwelling hag who barters weather for confessions
12. **a Sahuagin Raider** — reef-raiding fish-humanoid, opportunistic wreck-stripper
13. **a Sahuagin Depth-Priest** — deep cult priest who blesses reef-raids with dread invocations
14. **a Merrow Wrecker** — brutish sea-ogre that swarms wrecks for the meal, not the loot
15. **the Bosun's Ghost** — haunting ship's-officer whose whistle warns (or curses) the crew
16. **a Corsair Deckhand** — nimble boarding-raider, cuts lines before the main assault
17. **the Storm-Bound Djinn** — elemental genie fused into a waterspout, capricious and huge
18. **the Wrecking Reef-Wraith** — drowned wrecker's ghost, still luring ships onto the rocks

---

## NPC batches (75 total, 3 sheets)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population is entirely human (no established non-human civilian population in this realm's lore) — the diversity requirement is ethnic/physical variety only.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). sun-faded teal-and-driftwood palette, salt-spray dither texture, hard bright rim light off water, weathered rope/canvas/barnacle textures, one high-value wet-glint accent per sprite.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/3

1. **Fisherman** — Reads the wild and brings in what the settled can't.
2. **Dockhand** — Moves the heavy things; sees everything, is asked nothing.
3. **Hold-rat** — Works the dark and the tight places; patient underground.
4. **Captain's steward** — Invisible to the powerful, and so hears every secret.
5. **Wharf-beggar** — Has nothing, so knows the streets better than anyone.
6. **Shipwright** — Their tools carry their whole history.
7. **Ship's smith** — Calloused hands; deals in practical defense.
8. **Ship's cook** — Up before dawn; holds the neighborhood's gossip.
9. **Ship's carpenter** — Reads every structure out of habit; knows what's load-bearing.
10. **Sailmaker** — Notices the cut and quality of everyone's clothes.
11. **Ship's chandler** — Keeps the means of travel and trade running; eyes on the weather.
12. **Purser** — Information-rich, truth-poor.
13. **Portside tavern-keeper** — Controls the space, not the people in it.
14. **Herb-woman of the port** — Smells of bitterroot; knows what heals and what doesn't.
15. **Surgeon's mate** — Trusted, and overburdened by it.
16. **Ship's chaplain** — Maintains the ritual, not the doctrine.
17. **Shantyman** — Craves the attention; hides the true feeling under it.
18. **Master-at-arms** — Authority-adjacent, with limited real power.
19. **Cutlass-for-hire** — Loyalty bought with coin, and cynical about it.
20. **Convoy-escort hand** — Wary of the road; values a good pair of boots.
21. **Pirate** — Desperate or cruel; lives outside the law.
22. **Smuggler** — Hides the cargo; speaks only in euphemism.
23. **Ship's rat** — Eyes every coin-pouch; avoids every eye.
24. **Devotee of the drowned god** — Fanatical devotion behind a mundane face.
25. **Press-gang recruiter** — Charisma aimed at the desperate; sells belonging.

### NPC sheet 2/3

1. **Foreign hand signed at the last port** — Chose to stay here; the reasons stay unclear.
2. **The one who never comes above decks** — Known of, rarely seen.
3. **Acting mate (the officer lost)** — Filling in for someone absent; borrowed authority.
4. **Fo'c'sle boss** — Power without a title.
5. **Landsman who never should've shipped out** — Unqualified, unwilling, or both — and in the role anyway.
6. **Passenger of quality** — Wealthy, bored, insulated from real consequence.
7. **Trading-company nabob** — Sees every interaction as a transaction.
8. **Chart-hoarder with a route no captain will buy** — Hoards the secret knowledge; sees others as material.
9. **The stowaway no manifest explains** — Their very presence is the notable thing.
10. **Ship's captain** — Owes the crew as much as they're owed; the ledger is law aboard.
11. **Navigator** — Holds the torn chart everyone needs — and the real route is only in their head.
12. **Press-ganged hand** — Didn't choose the sea; the sea has them now anyway.
13. **Privateer** — A letter of marque, or none — depending on who's asking, and when.
14. **Harbor-master** — Decides which cargo is seen; every manifest is negotiable.
15. **Ship's surgeon** — Saw, needle, and rum; the crew's whole hope below the waterline.
16. **Bosun** — The captain's fist — keeps the crew, and the debt, in line.
17. **Cabin-child** — Sees everything, counts for nothing, and remembers all of it.
18. **Merchant-shipper** — Owns the cargo, never the risk; insures against their own crew.
19. **Shipwreck-survivor** — Washed in from somewhere that sank; knows a way back no one wants.
20. **Dark-skinned ship's cook — feeds the crew, poisons no one, everyone's still suspicious**
21. **Elderly harbor-master — knows every ship that's ever lied about its cargo**
22. **Multi-ethnic press-gang survivor — three ships, three escapes, still sailing**
23. **Young stowaway, not yet caught — will be, eventually**
24. **Weathered lighthouse keeper — the last honest light on this coast**
25. **Foreign-tongued trader — deals in goods no customs house has a name for**

---

### NPC sheet 3/3

1. **Dark-skinned rigging specialist — fastest hands aloft on the whole ship**
2. **Elderly retired captain, harbor-bound — tells the same three stories, all of them true**
3. **Broad-shouldered ship's carpenter — keeps the hull honest through every storm**
4. **Young powder-monkey, still green — hasn't seen real battle yet**
5. **Grey-bearded navigator — trusts the stars over any chart**
6. **One-eyed bosun — lost the eye to a rope snap, never slowed down**
7. **Freckled cabin boy — smuggled aboard, too useful to put ashore now**
8. **Heavyset ship's cook — feeds forty men on rations meant for twenty**
9. **Dark-skinned harbor merchant — trades in goods no manifest fully explains**
10. **Pale, sleepless night watch — hasn't trusted a calm sea in years**
11. **Short, sharp-eyed customs inspector — takes bribes from everyone equally**
12. **Elderly retired quartermaster — keeps better books than the captain ever did**
13. **Sunburnt fisherman — works waters the navy warns everyone away from**
14. **Mixed-heritage dockside tavern owner — hears every rumor before the harbor-master does**
15. **Lean, twitchy signal-flag operator — reads distant ships faster than anyone**
16. **Stout sailmaker, dark-skinned — patches canvas that's survived three captains**
17. **Grey-haired retired privateer — pardoned, mostly, and still armed**
18. **Young twin deckhands — inseparable, terrible luck, somehow always survive**
19. **Broad, scarred harpooner — the whaling crew's most valuable and most feared hand**
20. **Elderly blind lighthouse keeper — knows the coast by sound and current alone**
21. **Dark-skinned, heavily scarred smuggler captain — outruns the navy more often than not**
22. **Small, quick-handed cutpurse working the docks — takes coin, never blood**
23. **Weathered rope-maker — supplies half the fleet from one small shop**
24. **Ship's surgeon, unsentimental — has amputated more limbs than she can count**
25. **Tall, gaunt customs magistrate — technically incorruptible, practically exhausted**

## Domestic animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). sun-faded teal-and-driftwood palette, salt-spray dither texture, hard bright rim light off water, weathered rope/canvas/barnacle textures, one high-value wet-glint accent per sprite.

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
11. **Domestic animal — The realm-beast (a ship's cat, sea-legged and superstition-proof, worth more than the cargo)**
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
sun-faded teal-and-driftwood palette, salt-spray dither texture, hard bright rim light off water, weathered rope/canvas/barnacle textures, one high-value wet-glint accent per sprite.

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
11. **Wild animal — The realm-beast (a reef-wise gull that reads a coming storm before the glass does)**
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
sun-faded teal-and-driftwood palette, salt-spray dither texture, hard bright rim light off water, weathered rope/canvas/barnacle textures, one high-value wet-glint accent per sprite.

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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). sun-faded teal-and-driftwood palette, salt-spray dither texture, hard bright rim light off water, weathered rope/canvas/barnacle textures, one high-value wet-glint accent per sprite.

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

