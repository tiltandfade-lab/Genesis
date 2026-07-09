---
type: scratch
status: experimental
created: 2026-07-09
realm: suburb
---

# Sprite Batch Prompts — Suburb (Earthbound / Back to the Future, cheerful-lawn wrongness)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Suburb realm bestiary (120 monsters) plus a
themed NPC roster (45 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). bright manicured-suburbia palette — lawn green, siding beige, porch-light amber — rendered slightly too clean/saturated to feel safe, soft daytime shading that curdles at the edges of each figure, one off-key color note breaking the cheerfulness per sprite.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (120 total, 5 sheets)

### Monster sheet 1/5

1. **Cul-de-Sac Wanderer** — shambling loop-walker, the block's living dead
2. **Porch-Light Moth-Thing** — screen-door lurker begging to be let inside
3. **HOA Enforcer Drone** — flying clipboard drone, petty bureaucratic menace
4. **Sprinkler Ghoul** — irrigation-system ghoul, rises on the same timer nightly
5. **Under-the-Bed Groper** — classic bedroom-dark lurker, waits for lights-out
6. **Overwaving Neighbor** — too-friendly neighbor, watching before you're even awake
7. **Curfew Light Wisp** — streetlamp wisp that herds you home by dusk
8. **Casserole Cultist** — grief-vulture neighbor, dish in hand, headcount ready
9. **Cursed Lawn Sentinel** — grinning gnome, roots the cursed lawn to its post
10. **Vinyl-Sider** — fence-phasing hound, barks on a dead loop
11. **The Family Wearing the Skin** — the too-perfect family, all three wearing the same face
12. **Perpetual Yard-Sale Hag** — folding-table hag selling the missing's belongings
13. **Riding-Mower Revenant** — dead husband still mowing perfect ghost-stripes
14. **The Man Behind the Rubber Mask** — the masked slasher, unhurried and always closing
15. **Book Club Coven** — wine-and-book coven picking next month's victim
16. **Backyard Above-Ground Deep One** — bloated pool-thing, too big for the water it's in
17. **Cheerful Renovation Golem** — stitched-contractor golem, endlessly remodeling the house
18. **The PTA President** — smiling PTA fiend running the block and its secrets
19. **Lawn-Order Enforcer** — covenant-bound guardian, trims anything grown too tall
20. **Master of the Block Party** — shapeshifting host, one small yearly price for paradise
21. **The Substitute Mailman** — undead mailman, on-time deliveries for the dead
22. **Development Overseer** — model-home golem enforcing the original blueprint
23. **The Neighborhood Watch Itself** — the hive-mind of curtain-twitchers, reading through glass
24. **The First Homeowner** — the founder's corpse, landlord of the whole afterlife
25. **The Idea of Sunday** — the unblinking eye dreaming the loop into place

### Monster sheet 2/5

1. **Latchkey Shade** — Small unseen presence that rattles empty houses at dusk
2. **Storm-Drain Grabber** — Whispers from storm drains, lures children with a friendly voice
3. **Rerun Wraith** — Armchair-bound ghost that traps watchers in endless reruns
4. **Chain-Link Fence-Walker** — Skulks along fence-lines just out of direct sight
5. **Popped-Collar Poltergeist** — Restless spirit slamming doors, showing off for no one
6. **Newspaper Route Revenant** — Undead paperboy still riding a route no one ordered
7. **Static-Screen Watcher** — Face surfaces in TV static, watches whoever watches it
8. **Trash Night Ghoul** — Compulsive undead trash-day ritual, drags off what it finds
9. **Garage Sale Ghast** — Undead haggler who trades your belongings for its junk
10. **Split-Level Skulker** — Pack hunter that ambushes through split-level stairwells
11. **Rec-Room Rug Thing** — Shag basement carpet that smothers unwary bare feet
12. **Backyard Above-Ground Pool Thing** — Cloudy backyard pool hides something that surfaces at night
13. **Wrong-Number Screamer** — Phantom prank caller that claims it's already in the house
14. **Cul-de-Sac Bike Gang Ghost** — Ghost bike gang circling forever, daring new kids to join
15. **Aluminum Siding Stalker** — Siding-panel construct that paces you when you don't look
16. **Van with No Windows** — Idling windowless van, door sliding open on its own
17. **Ding-Dong-Ditch Devil** — Gleeful imp that rings and runs, leaves a scorched handprint
18. **Toybox Escapee** — Self-winding toy that patrols under the bed relentlessly
19. **Curbside Furniture Fiend** — Free curbside couch that eats whoever tries to take it
20. **Overgrown Hedge Maze Beast** — Untrimmed hedge maze conceals something living in the gaps
21. **Sun-Bleached Lawn Jockey** — Faded lawn statue that turns to track trespassers
22. **Backyard Above-Ground Deep One Spawn** — Young pool-thing spawn awkwardly hunting on dry lawn
23. **Meter Reader Mimic** — Fake utility worker that always asks to go around back
24. **Skateboard Ramp Wight** — Undead skater endlessly practicing the trick that killed it
25. **Backyard Bug-Zapper Wisp** — Escaped bug-zapper spark that hunts warm bodies at night

### Monster sheet 3/5

1. **Video Store Return-Slot Horror** — Rental drop-slot horror that changes whatever it swallows
2. **Arcade Cabinet Haunt** — Ghost of an unbeaten high-scorer, lit inside the cabinet
3. **Mall Food Court Ooze** — Slow food-court ooze that absorbs stragglers after closing
4. **Backyard Trampoline Terror** — Burrowing thing under a trampoline that overbounces kids on purpose
5. **Home Alarm Banshee** — Alarm-triggering wraith whose wail is worse than the siren
6. **The Family Wearing the Skin (Understudy)** — Lesser copycat family-thing, close but not quite convincing
7. **Handyman Who Never Leaves** — Contractor who never finishes the job or leaves the house
8. **The Substitute Teacher** — Roving fiend-teacher whose classes always lose a student
9. **Split-Shift Shapeshifter** — Gas station night clerk with a shift no human works
10. **Riding-Mower Revenant, Deluxe Model** — Upgraded haunted mower that enforces HOA lawn regulations
11. **The Man in the Ice Cream Truck** — Ice-cream-truck fiend whose jingle lures kids away
12. **Backyard Bonfire Cultist Circle** — Neighbor cult burning offerings in a backyard barrel
13. **The Coach Who Never Ages** — Ageless little-league coach spanning two decades unchanged
14. **Skin-Deep Scoutmaster** — Doppelganger scoutmaster who returns from trips one kid short
15. **The Perfect Father Next Door** — Model neighborhood father with a shed nobody mentions
16. **Static-Cling Poltergeist Swarm** — House-wide micro-hauntings that unify into one coordinated threat
17. **Cursed Above-Ground Deep One Broodmother** — Matured pool-horror now spawning across the cul-de-sac
18. **Renovation Golem, Load-Bearing Model** — Drywall-and-lumber golem built from a shortcut renovation curse
19. **The Photo Album Hag** — Photo-collecting hag who edits herself into family albums
20. **The Neighborhood Watch Captain** — All-seeing patrol captain who knows every closed-door secret
21. **Backyard Above-Ground Pool Shark** — Oversized predator circling under a backyard pool's liner
22. **The Ham Radio Operator** — Attic ham-radio operator receiving transmissions from nowhere
23. **The PTA Vice President** — PTA lieutenant gathering names for an unseen master list
24. **Backyard Grill Fire Elemental** — Never-extinguished grill fire that's still hungry to cook
25. **The Cul-de-Sac's Second Family** — Multi-limbed horror that assembles into a fake nuclear family

### Monster sheet 4/5

1. **Lawn-Order Enforcer, Senior Patrol** — Promoted HOA golem whose citations double as curses
2. **The Block Party Ringmaster** — Block-party organizer who plans a yearly disappearance
3. **Attic Insulation Horror** — Attic-dwelling horror slowly widening the crawlspace over decades
4. **Master of the Costume Party** — Costume-party host whose winners are never seen again
5. **The Substitute Mailman's Supervisor** — Route supervisor delivering unsolicited packages to every house
6. **Development Overseer, Phase Two** — Slab-built golem grading a phantom lot off the map
7. **The First HOA Board** — Undead HOA founders still voting on ordinances forever
8. **The Perfect Family, Fully Grown** — Skin-family horror that stopped pretending to be separate people
9. **The Neighborhood Watch, Fully Awake** — Block-wide surveillance horror that has begun to act
10. **The Substitute Principal** — Fill-in principal whose detention slips are binding contracts
11. **Superstore Overnight Stock Horror** — Overnight stocker that spells warnings in the aisle layout
12. **The Cable Guy Who Was Never Scheduled** — Uninvited cable installer who tunes homes to impossible channels
13. **The First Family of the Development** — Founder-family entombed beneath the model home's foundation
14. **The Idea of a Perfect Lawn** — Root-system ideal that prunes any lawn that stands out
15. **The Last Bell of the School Year** — Eternal dismissal bell that never released its final class
16. **The Whole Street, Awake** — Whole cul-de-sac revealed as one house-wearing organism
17. **The Idea of Back-to-School Night** — Annual gymnasium dread wearing everyone's worst self at once
18. **The Development That Was Never Finished** — Bankrupt developer's undying will still building empty lots
19. **Backyard Tetherball Wisp** — Ghost light endlessly circling a broken tetherball pole
20. **Split-Level Basement Ooze** — Basement floor-drain ooze that never receded after a storm
21. **Trick-or-Treat Bag Snatcher** — Halloween sprite that swaps candy for something inedible
22. **The Kid Who Never Came Home** — Ghost child endlessly biking his last-seen route home
23. **Backyard Above-Ground Pool Leech Swarm** — Splintered pool-horror fragments swarming as biting leeches
24. **Little League Bleacher Ghoul** — Undead superfan haunting a closed field's bleachers
25. **Backyard Fireworks Mephit** — Dud-firework mephit hunting for something bigger to ignite

### Monster sheet 5/5

1. **The Man in the Rubber Mask** — Silent knife-stalker in a rubber mask, cuts the power first
2. **The Neighbor Who Isn't** — A neighbor replaced, wearing the body a little wrong
3. **The Homeowners' Association** — Cul-de-sac conformity cult in matching cardigans
4. **The Thing in the Storm Drain** — Shapeless lurker that surfaces through storm drains after rain
5. **The Thing Under the Bed** — Blind floor-level lurker only real in the dark
6. **Static Bride** — Reanimated stitched-together undead bride, disrupts electronics
7. **The Man Who Sold the House** — Devil-bargain realtor collecting on unread contracts
8. **Medusa of the Mall** — Mythic Gorgon relocated to the dead mall's cosmetics counter
9. **The Kraken in the Deep End** — Ancient sea-legend leviathan squatting in a condemned pool
10. **The Toy That Loves You Back** — Possessed toy that relocates itself to your room at night
11. **The Refrigerator That Remembers** — Cursed kitchen appliance that preserves things unnaturally
12. **The Arcade Cabinet with One More Life** — Haunted arcade cabinet that keeps its high-scorer
13. **The Babysitter's Watcher** — Home-invader who calls from inside the house first
14. **The Cul-de-Sac Werething** — Suburban werewolf-neighbor, folklore lycanthropy in a cul-de-sac
15. **Renfield of Maple Court** — Thrall-servant mook, devoted to something unseen in the house
16. **The Count of the Cul-de-Sac** — Stoker-lineage vampire lord who bought the biggest house in cash
17. **The Skeleton in Every Closet** — Literal skeleton-in-the-closet, one per household
18. **The Lawn Ornament That Turned** — Animated yard-decor ambush predator, still until you're alone
19. **The Debt Collector** — Folkloric collector-of-debts undead, clipboard and windbreaker
20. **The PTA** — Hive-mind swarm of identical, over-informed suburban parents

---

## NPC batches (75 total, 3 sheets)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population is entirely human (no established non-human civilian population in this realm's lore) — the diversity requirement is ethnic/physical variety only.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). bright manicured-suburbia palette — lawn green, siding beige, porch-light amber — rendered slightly too clean/saturated to feel safe, soft daytime shading that curdles at the edges of each figure, one off-key color note breaking the cheerfulness per sprite.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/3

1. **Landscaper** — Tied to the land and its seasons; the base everyone eats from.
2. **Garbage-truck driver** — Moves the heavy things; sees everything, is asked nothing.
3. **Utility repairman** — Works the dark and the tight places; patient underground.
4. **Housekeeper** — Invisible to the powerful, and so hears every secret.
5. **Runaway** — Has nothing, so knows the streets better than anyone.
6. **Craft-fair hobbyist** — Their tools carry their whole history.
7. **Locksmith** — Calloused hands; deals in practical defense.
8. **Donut-shop baker** — Up before dawn; holds the neighborhood's gossip.
9. **Subdivision contractor** — Reads every structure out of habit; knows what's load-bearing.
10. **Mall boutique clerk** — Notices the cut and quality of everyone's clothes.
11. **Gas-station attendant** — Keeps the means of travel and trade running; eyes on the weather.
12. **Realtor** — Information-rich, truth-poor.
13. **Pizza-parlor** — Controls the space, not the people in it.
14. **Drugstore pharmacist** — Smells of bitterroot; knows what heals and what doesn't.
15. **Family physician** — Trusted, and overburdened by it.
16. **Parish minister** — Maintains the ritual, not the doctrine.
17. **Local radio DJ** — Craves the attention; hides the true feeling under it.
18. **Patrol cop** — Authority-adjacent, with limited real power.
19. **Repo man** — Loyalty bought with coin, and cynical about it.
20. **School crossing guard** — Wary of the road; values a good pair of boots.
21. **Joyriding delinquent** — Desperate or cruel; lives outside the law.
22. **Backroom bootleg-tape dealer** — Hides the cargo; speaks only in euphemism.
23. **Shoplifter** — Eyes every coin-pouch; avoids every eye.
24. **Devout neighbor with a locked basement** — Fanatical devotion behind a mundane face.
25. **Door-to-door salesman** — Charisma aimed at the desperate; sells belonging.

### NPC sheet 2/3

1. **New family on the block** — Chose to stay here; the reasons stay unclear.
2. **Shut-in at the end of the cul-de-sac** — Known of, rarely seen.
3. **Substitute teacher** — Filling in for someone absent; borrowed authority.
4. **PTA president** — Power without a title.
5. **Reluctant Little League coach** — Unqualified, unwilling, or both — and in the role anyway.
6. **Country-club parents** — Wealthy, bored, insulated from real consequence.
7. **Subdivision developer** — Sees every interaction as a transaction.
8. **Ham-radio conspiracy buff** — Hoards the secret knowledge; sees others as material.
9. **The kid nobody remembers enrolling** — Their very presence is the notable thing.
10. **HOA committee-member** — Enforces the standards; smiles harder the more you contradict them.
11. **Too-friendly neighbor** — Waves too fast, knows your schedule, means well — allegedly.
12. **The model family** — Too perfect; something in that household keeps very regular hours.
13. **Block captain** — Organizes the watch, the potluck, and the reporting. Especially the reporting.
14. **Garage inventor** — The block's harmless genius, allegedly; the garage hums at odd hours.
15. **Arcade king** — Rules the mall cabinets; the high score is his whole identity.
16. **Video-store clerk** — Knows every tape, every late fee, and what gets rented after dark.
17. **Homecoming royalty** — Peaks this year, letterman and all — and some part of them knows it.
18. **The bully** — The wrongness with a letterman jacket and a car that's too nice.
19. **Diner waitress** — The town's real hub; refills the coffee and dispenses the verdict.
20. **Mall security** — A uniform, a flashlight, and expansive delusions of jurisdiction.
21. **Dark-skinned block-association president — the actual power on the street, not the HOA**
22. **Elderly widower, untouched by the wrongness — the only one who says it out loud**
23. **Multi-ethnic PTA newcomer — hasn't learned the unwritten rules yet**
24. **Teen paperboy — sees the neighborhood at hours no adult does**
25. **Retired schoolteacher — remembers every kid on the block, including the ones who 'moved away'**

---

### NPC sheet 3/3

1. **Dark-skinned block-watch volunteer — patrols at hours that don't add up**
2. **Elderly widow, untouched by the wrongness — the only one who says it out loud**
3. **Broad-shouldered high school football coach — everyone trusts him, no one knows why**
4. **Young newspaper delivery kid — sees the neighborhood at hours no adult does**
5. **Grey-haired retired mailman — knows every house's real schedule**
6. **One-eyed hardware store owner — sells everything, asks nothing about what it's for**
7. **Freckled kid on a bike — first to spot when something's off on the block**
8. **Heavyset school crossing guard — has stood that corner longer than most houses have existed**
9. **Dark-skinned real estate agent — sells houses that turn over a little too often**
10. **Pale, sleepless night-shift nurse living two doors down — sees the neighborhood differently**
11. **Short, sharp-eyed neighborhood gossip — knows everyone's business before they do**
12. **Elderly retired scoutmaster — still runs troop meetings nobody remembers signing up for**
13. **Sunburnt landscaper — mows every lawn on the block, notices what's buried underneath**
14. **Multi-ethnic new family, still settling in — hasn't learned the unwritten rules yet**
15. **Lean, twitchy insomniac homeowner — hasn't slept right since he moved in**
16. **Stout diner-style café owner, dark-skinned — the block's actual town square**
17. **Grey-haired retired police officer — took the badge off, kept the instincts**
18. **Young twin siblings on the same street — inseparable, oddly synchronized**
19. **Broad, cheerful HOA volunteer — smiles a little too hard at every meeting**
20. **Elderly blind piano teacher — every kid on the block takes lessons, none remember why**
21. **Dark-skinned, retired contractor — built half the houses on this street, avoids a few of them now**
22. **Small, quick kid who's always outside after dark — parents never seem to notice**
23. **Weathered groundskeeper at the community pool — closes it early some nights, no explanation**
24. **Late-shift convenience store clerk — sees who's really awake at 3am**
25. **Tall, gaunt insurance adjuster — assesses damage on houses that shouldn't have any**

## Domestic animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). bright manicured-suburbia palette — lawn green, siding beige, porch-light amber — rendered slightly too clean/saturated to feel safe, soft daytime shading that curdles at the edges of each figure, one off-key color note breaking the cheerfulness per sprite.

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
11. **Domestic animal — The realm-beast (a golden retriever that barks at 3am for reasons no one else can see)**
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
bright manicured-suburbia palette — lawn green, siding beige, porch-light amber — rendered slightly too clean/saturated to feel safe, soft daytime shading that curdles at the edges of each figure, one off-key color note breaking the cheerfulness per sprite.

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
11. **Wild animal — The realm-beast (a too-still deer that grazes the cul-de-sac median and never startles)**
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
bright manicured-suburbia palette — lawn green, siding beige, porch-light amber — rendered slightly too clean/saturated to feel safe, soft daytime shading that curdles at the edges of each figure, one off-key color note breaking the cheerfulness per sprite.

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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). bright manicured-suburbia palette — lawn green, siding beige, porch-light amber — rendered slightly too clean/saturated to feel safe, soft daytime shading that curdles at the edges of each figure, one off-key color note breaking the cheerfulness per sprite.

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


## Expansion batches — REALM-KEY-EXPANSION-ROSTER draft, 2026-07-09 (25 total, 1 sheet)

Appended additions from `docs/REALM-KEY-EXPANSION-ROSTER.md` (Adam's rulings folded): the BTTF
strand (Biff-shaped bully set, generational), the Earthbound strand (frantic taxi, dog-and-snake,
fab five, starmen, Mr. Saturn analog, psychic kid), and the Amblin lane (gremlin realm-bleed
pair, the visitor, the little fixers). HOA entries NOT repeated (already on the monster/NPC
sheets above). Same style block and mechanical instructions as above.

### Expansion sheet E1 (5×5 grid, 25 cells)

1. **The Bully (Kid Era)** — letterman-jacket teen mid-shove, fist raised, knuckles fresh from a locker
2. **The Bully's Toady** — smaller kid laughing before the joke lands, pointing wherever the bully points
3. **The Bully's Muscle** — big slow lieutenant cracking knuckles, waiting to be told
4. **The Bully (Dad Era)** — same face at 40, supervisor's short-sleeve shirt, jabbing a finger
5. **The Bully (Grandpa Era)** — same face at 70, cane raised mid-rant from a porch
6. **The Frantic Taxi** — checkered cab up on two wheels mid-turn, no driver, meter running wild
7. **The Runaway Dog** — scrappy loose mutt mid-lunge, leash still attached and whipping
8. **The Garden Snake** — coiled hose-sized snake in the flowerbed, more indignant than deadly
9. **The Fab Five — Pompadour Leader** — snapping fingers mid-strut, jacket collar up
10. **The Fab Five — the Twins** — two matched toughs mid-synchronized-step, combs out like knives
11. **The Fab Five — the Backline** — two more in choreography, one mid-spin, one clapping the beat
12. **The Psychic Kid** — striped-shirt kid in a baseball cap, hand to temple, air rippling
13. **Starman Analog** — chrome-skinned visitor in an almost-right suit, teleport static around its feet
14. **Starman Elite** — taller, gold-chromed, one arm raised mid-psychic-flash
15. **Mr. Saturn Analog Villager** — round little being, all nose and eyebrows, one hair with a bow, mid-bounce
16. **Possessed Lawn Flamingo Flock** — five plastic flamingos mid-stalk, heads rotated wrong
17. **Runaway RC-Car Swarm** — a dozen toy cars swarming like piranha, antennas whipping
18. **The Door-to-Door Salesman** — too-wide grin, foot literally in a door frame he carries with him
19. **The Van at 1:15 AM** — panel van circling, headlights off, door sliding open mid-roll
20. **The Garage Experiment** — a hedge-trimmer/vacuum/something gone sapient, trailing its inventor's extension cord
21. **The Gremlin (Cute Mode)** — big-eared fuzzball begging adorably, midnight rules not yet broken
22. **The Gremlin (Turned)** — the same creature post-rules-broken, spined and cackling, gloom-band wrongness accent
23. **The Visitor in the Shed** — small wrinkled being among garden tools, finger-light glowing, hiding
24. **The Little Fixers** — palm-sized machine helpers nesting in an eave, one soldering mid-flight
25. **The Prom-Night Thing** — the thing the school rumor is actually about, corsage still pinned to it
