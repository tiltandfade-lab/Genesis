---
type: scratch
status: experimental
created: 2026-07-09
realm: bright-kingdom
---

# Sprite Batch Prompts — Bright Kingdom (Nintendo-80s cartoon, power-ups you eat, teeth under the candy)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Bright Kingdom realm bestiary (121 monsters) plus a
themed NPC roster (43 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration) — this IS one of Genesis's intentionally cartoony realms, so chunky rounded shapes and exaggerated proportions are correct here. saturated cotton-candy-pink and mint palette, clean bold outlines, chunky rounded shapes like an 8-bit mascot, bright rim light — but with one unsettling detail (sharp teeth, too-wide eyes) per sprite that reads even in silhouette.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (121 total, 5 sheets)

### Monster sheet 1/5

1. **Wind-Up Soldier** — clockwork toy soldier, keeps marching until unwound
2. **Plush Ripper** — cuddly stuffed animal hiding a mouthful of hooks
3. **Candy-Cane Golem** — hard-candy construct, sweet shell hides razor shards
4. **Jack-in-the-Box Stalker** — boxed ambusher springs out mid-tune, already too close
5. **Laughing-Mask Swarm** — swarm of grinning masks that clatter, snap, giggle
6. **Balloon-Skin Grub** — squeaking balloon-hide grub that deflates when popped
7. **Carnival Tout** — grinning barker who herds marks toward the big tent
8. **Static-Charge Kitten** — sparking fey kitten, a pet that shocks you dead
9. **Marching Peanut** — grinning peanut-soldier in an endless parade conga line
10. **Piñata Brute** — paper-hide brute that bursts into candy shrapnel
11. **Carousel Nightmare** — carved carousel horse torn free, circling for blood
12. **Sugar-Rush Harlequin** — jittering harlequin brawler, hopped up on rock candy
13. **Bubblegum Ooze** — pink bubblegum ooze, engulfs and dissolves you slowly
14. **Claw-Machine Horror** — arcade claw-machine on legs, rigged to never miss
15. **Funhouse Double** — mirror-warped double wearing your own stretched face
16. **Ferris-Wheel Horror** — rolling wheel-boned horror, its gaze turns you to stone
17. **Cotton-Candy Wraith** — sugar-sweet drifting haze that feeds on happy memories
18. **Arcade Sentinel** — glitching screen-boss, bolts skip you straight to wounded
19. **Mascot-Suit Puppeteer** — hollow mascot suit worn by tendrils wearing your smile
20. **Firework Effigy** — living fireworks display, still building to a finale
21. **The Ringmaster** — top-hatted ringmaster who commands the whole show
22. **The Overwound Nutcracker** — giant nutcracker soldier, jaw snaps clean through bone
23. **Vending-Machine Colossus** — coin-slot golem, dispenses violence for your last coin
24. **The Birthday King** — crowned rigger of the game no one is meant to win
25. **The Grinning Prize** — top-shelf plush titan, a dozen button-eyes snap open

### Monster sheet 2/5

1. **Tin Drummer Boy** — drumming tin toy that locks your heartbeat to its beat
2. **Rag Doll Skulker** — limp rag doll that scuttles the second you look away
3. **Gumdrop Sprite** — sugar-shard pixie giggling above dog-whistle pitch
4. **Squeak-Toy Hound** — rubber toy dog whose bite-squeak gets louder with damage
5. **Confetti Wisp** — glitter-storm elemental made of razor-edged party confetti
6. **Marionette Cutpurse** — string-puppet thief worked by an unseen hand overhead
7. **Pop-Gun Grenadier** — toy-soldier grenadier lobbing shrapnel-cored party favors
8. **Licorice Whip-Vine** — sticky black candy-vine that lashes and constricts
9. **Kite-String Wraith** — paper kite dragging a bone-child on garrote-taut string
10. **Snow-Globe Wisp** — trapped globe-spirit that shakes itself into a blizzard
11. **Puppet-Show Ghoul** — hand-puppet corpse twitching to an absent puppeteer
12. **Ticket-Booth Imp** — toll-imp who brands hands and demands blood admission
13. **Streamer Serpent** — crepe-scaled snake whose sweet venom masks as punch
14. **Popcorn Blight** — kernel-husk plant that bursts in scalding shrapnel steam
15. **Domino Sentinel** — toppling domino construct that chain-falls in a crushing line
16. **Wooden Nutcracker Cadet** — shell-cracking nutcracker jaw that prefers fingers now
17. **Yo-Yo Stringer** — street performer garroting foes with a weighted yo-yo
18. **Fun-Fair Goblin** — rigged carnival-game goblin who charges fingers, not coins
19. **Prize-Claw Scuttler** — detached claw-machine grabber skittering on cable legs
20. **Whack-a-Mole Ambusher** — burrowing mole-toy that pops up to bite, then vanishes
21. **Fortune Machine Familiar** — fortune-teller automaton whose cards come horribly true
22. **Bumper-Car Brawler** — stripped bumper-car chassis that charges and never stops grinning
23. **Peppermint Stalker** — caroling candy-striped goblinoid dragging prey to sugar vats
24. **Merry-Go-Round Foal** — carousel horse torn free of its pole, still bobbing as it tramples
25. **Face-Paint Marauder** — grease-painted brawler laughing through every clubbing swing

### Monster sheet 3/5

1. **Toy-Chest Mimic** — toy-chest mimic whose lid is lined with teeth
2. **Two-Faced Jester** — jester whose two painted faces switch mid-attack, unpredictably
3. **Marionette Master** — puppeteer who yanks strings to animate a squad mid-fight
4. **Whirligig Horror** — spinning rotor-ride whose scythe gondolas scatter red confetti
5. **Sawdust Strongman** — two-headed circus strongman crushing while both heads lie
6. **Balloon-Animal Chimera** — twisted-latex chimera that pops apart and re-knots itself
7. **Cotton-Candy Spinner Witch** — sugar-floss witch whose spun webs harden into glass thread
8. **Painted Pony Revenant** — ghost carousel horse trampling an endless six-foot loop
9. **Rubber-Duck Leviathan** — cheerful bath-toy giant with a jaw unhinging past its grin
10. **Static Shock Clown** — crackling clown discharging balloon-rubbed static arcs
11. **Fun House Mirror-Stalker** — mirror-dweller that stretches your reflection's arm to grab you
12. **Bearded Sideshow Prophet** — tent prophet whose tarot readings land as curses
13. **Cymbal-Monkey Swarm** — clashing wind-up monkey troop that shatters focus and eardrums
14. **Puppet Theater Ghost** — stage-ghost that casts bystanders into its unheard endless play
15. **Shooting-Gallery Marksman** — gallery marksman who swapped tin ducks for screaming real ones
16. **Cackling Music-Box Horror** — ballerina automaton whose backward lullaby ages listeners down
17. **The Understudy Doppel** — mask-cycling mimic wearing the faces of the fair's dead
18. **Pinwheel Djinn** — pinwheel-bound genie whose wishes twist gaudy and cruel
19. **Toy Soldier Colonel** — clockwork colonel drilling a squad of key-wound infantry
20. **Bell-Tower Puppet** — clock-tower automaton whose hourly strike finds softer targets
21. **Rictus Ringleader** — whip-cracking sideshow boss whose grin is stitched shut
22. **Sugar-Spun Basilisk** — candy-eyed basilisk that crystallizes prey into hard candy
23. **Popcorn Machine Golem** — overheated popcorn-machine golem hailing scalding kernels
24. **Wax Figure Doppelganger** — wax-museum figure that melts into a dozen grasping arms
25. **Grand Prize Chimera** — three-headed stuffed-prize chimera, each head still tagged

### Monster sheet 4/5

1. **Runaway Roller-Coaster Wyrm** — derailed coaster track turned serpent, cars clacking as teeth
2. **Grand Guignol Actor** — undead stage actor whose prop dagger's blood is now real
3. **Hedge-Maze Minotaur** — topiary-bull minotaur that reshapes the maze to trap guests
4. **The Barker's Voice** — omnipresent barker-voice hiding a tentacled body in speaker horns
5. **Wheel-of-Fortune Oracle** — rigged fortune-wheel witch who collects on every fated spin
6. **Tilt-a-Whirl Horror** — spinning ride-maw that disorients riders while digesting them
7. **Effigy of the Midway** — towering lost-and-found effigy animated by collected grudges
8. **Puppet King's Herald** — herald whose compelling fanfare herds crowds toward danger
9. **Hall of Mirrors Horror** — hive-minded shattered mirror-hall, every shard a coordinated attacker
10. **Grandfather Clock Devourer** — antique clock-golem whose chime ages victims to dust
11. **The Understudy King** — backstage understudy rehearsing to seize the Birthday King's crown
12. **Roulette Devil** — cursed casino-tent devil who collects bets in stolen years
13. **The Grand Carousel Titan** — whole carousel fused into a lurching titan of bobbing wooden limbs
14. **The Confetti Cannon Colossus** — siege-toy cannon launching cheerful bursts of glass confetti
15. **Matriarch of the Sideshow** — ancient sideshow exhibit whose curse feeds on being watched
16. **The Perpetual Winner** — undying champion whose losing challengers become living trophies
17. **The Calliope Behemoth** — steam-organ dragon whose cheerful hymn liquefies listeners' bones
18. **Warden of the Big Top** — vast tent-eye that conscripts failed performers as new attractions
19. **The Sold-Out Show** — eternal demon-headliner whose lights burn brighter per soul billed
20. **The Never-Ending Attraction** — court rival running an endless ride that loops joy into captivity
21. **Marching Band Automaton** — brass-skeleton whose off-key blare shatters concentration
22. **Rubber Ball Bouncer** — grinning rubber ball bouncing faster with every bone-jarring hit
23. **Strongman Hammer Golem** — high-striker golem whose swing is meant for skulls, not bells
24. **Petting-Zoo Horror** — once-gentle petting-zoo animal grown too many teeth
25. **Glow-Stick Wisp** — bobbing glow-stick wisp that lures stragglers off the path

### Monster sheet 5/5

1. **Cake-Topper Golem** — fused bride-groom cake figure, frosting-slick, still smiling
2. **the Playing-Card Guard** — flat card-soldier, obeys any shouted rank
3. **the Tin Soldier's Hollow Cousin** — wind-up soldier, marches until unwound
4. **the March Hare** — tea-mad hare, hostile to clocks and cutlery
5. **a Wicked Witch's Wolf** — storybook wolf, mimics a soft voice before attacking
6. **Geppetto's Runaway Marionette** — lying puppet, nose-hinge lengthens with each lie
7. **the Piper's Rat** — tune-compelled rat, swarms toward any melody
8. **the Mouse King's Sentry** — multi-headed mouse-courtier, argues with itself mid-fight
9. **the Nutcracker Grenadier** — wooden grenadier, jaw-hinge crushing bite
10. **the Cheshire Grin** — fading cat, taunts and phases out mid-combat
11. **the Winged Monkey Raider** — cap-bound flying monkey, resents its own orders
12. **the Goblin Toymaker** — toy-peddling goblin, remote-commands nearby constructs
13. **the Queen of Hearts** — tyrant queen, commands the battlefield instead of fighting it
14. **the Grimm Woodland Witch** — cannibal-witch, lures and force-feeds before the kill
15. **the Wicked Witch of the West** — beast-commanding witch, dissolves rather than dies clean
16. **the Mouse King** — seven-headed rat-king, regenerates through internal rivalry
17. **the Automaton in the Wicker Man's Skin** — straw guardian-construct, patrols a fixed boundary forever
18. **the Wonderland Jabberwock** — nonsense-dragon, telegraphs doom in verse before it strikes
19. **the Tin Woodman, Rusted Wrong** — hollow tin giant, mourns while it swings the axe
20. **the Hamelin Piper** — compulsion piper, turns the battlefield's own mooks against it
21. **the Wonderland Executioner-Court** — card-mob swarm, group-verdict area attacks

---

## NPC batches (75 total, 3 sheets)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population stays human/toylike per its own identity (no separate non-human civilian species here) — the diversity requirement is ethnic/physical variety only.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration) — this IS one of Genesis's intentionally cartoony realms, so chunky rounded shapes and exaggerated proportions are correct here. saturated cotton-candy-pink and mint palette, clean bold outlines, chunky rounded shapes like an 8-bit mascot, bright rim light — but with one unsettling detail (sharp teeth, too-wide eyes) per sprite that reads even in silhouette.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/3

1. **Overworld forager** — Reads the wild and brings in what the settled can't.
2. **Block-pusher** — Moves the heavy things; sees everything, is asked nothing.
3. **Pipe-diver** — Works the dark and the tight places; patient underground.
4. **Wind-up page** — Invisible to the powerful, and so hears every secret.
5. **Out-of-lives drifter** — Has nothing, so knows the streets better than anyone.
6. **Toymaker** — Their tools carry their whole history.
7. **Candy-chef** — Up before dawn; holds the neighborhood's gossip.
8. **Block-mason** — Reads every structure out of habit; knows what's load-bearing.
9. **Mascot-suit tailor** — Notices the cut and quality of everyone's clothes.
10. **Kart-wright** — Keeps the means of travel and trade running; eyes on the weather.
11. **Prize-broker** — Information-rich, truth-poor.
12. **Save-point keeper** — Controls the space, not the people in it.
13. **Heart-container brewer** — Smells of bitterroot; knows what heals and what doesn't.
14. **Extra-life nurse** — Trusted, and overburdened by it.
15. **Checkpoint priest** — Maintains the ritual, not the doctrine.
16. **Sideshow act** — Craves the attention; hides the true feeling under it.
17. **Wind-up soldier** — Authority-adjacent, with limited real power.
18. **Rented mini-boss** — Loyalty bought with coin, and cynical about it.
19. **Gate-guard between worlds** — Wary of the road; values a good pair of boots.
20. **Glitch-goblin** — Desperate or cruel; lives outside the law.
21. **Contraband power-up dealer** — Hides the cargo; speaks only in euphemism.
22. **Coin-snatcher** — Eyes every coin-pouch; avoids every eye.
23. **True-believer in the High Score** — Fanatical devotion behind a mundane face.
24. **Talent-scout for the Game** — Charisma aimed at the desperate; sells belonging.
25. **Glitched-in wanderer** — Chose to stay here; the reasons stay unclear.

### NPC sheet 2/3

1. **Superboss no one's beaten** — Known of, rarely seen.
2. **Understudy mascot** — Filling in for someone absent; borrowed authority.
3. **Backroom high-scorer** — Power without a title.
4. **Miscast sprite** — Unqualified, unwilling, or both — and in the role anyway.
5. **Spoiled prince** — Wealthy, bored, insulated from real consequence.
6. **Arcade tycoon** — Sees every interaction as a transaction.
7. **Manual-keeper** — Hoards the secret knowledge; sees others as material.
8. **The NPC with no dialogue tree** — Their very presence is the notable thing.
9. **Champion-by-the-rules** — Won the game everyone plays; the crown is literal, and heavier than it looks.
10. **Prize-keeper** — Guards the reward that's watching you back; the rules protect it, not you.
11. **Perpetual challenger** — Respawns to try again — cheerfully, endlessly, and a little wrong.
12. **Power-up peddler** — Sells the thing you eat to get strong. The fine print has teeth.
13. **Referee** — Enforces rules a child could recite, with consequences a child shouldn't see.
14. **Mascot / herald** — The too-cheerful face that greets you; the smile never once drops.
15. **Collectible-hoarder** — Needs all of the set — and the last piece is guarded by something.
16. **Level-boss** — Sits at the top of the map, bound by the rules to wait for a challenger.
17. **Fairy-godmother figure** — Grants the boon; the fine print is a fairy-tale kind of cruel.
18. **Reset-warden** — Puts everything back the way it was each morning, and hates when you notice.
19. **Dark-skinned parade coordinator — keeps the too-cheerful schedule running**
20. **Elderly ride operator — been running the same ride since before anyone remembers**
21. **Multi-ethnic mascot performer — inside the suit, could be anyone, that's the point**
22. **Freckled ticket-booth kid — first job, hasn't clocked the wrongness yet**
23. **Tall, broad-shouldered strongman performer — part of the show, off-hours unreadable**
24. **Small, sharp-eyed fortune-teller — the only one who tells the truth, in riddles**
25. **Silver-haired candy-cart vendor — been here longer than the park's official history**

---

### NPC sheet 3/3

1. **Dark-skinned parade coordinator — keeps the too-cheerful schedule running**
2. **Elderly ride operator — been running the same ride since before anyone remembers**
3. **Broad-shouldered strongman act — part of the show, off-hours unreadable**
4. **Young ticket-booth kid, freckled — first job, hasn't clocked the wrongness yet**
5. **Grey-haired candy-cart vendor — been here longer than the park's official history**
6. **One-eyed carousel mechanic — lost the eye fixing a horse that shouldn't move on its own**
7. **Small, sharp-eyed fortune-teller — the only one who tells the truth, in riddles**
8. **Heavyset funhouse mirror attendant — laughs at the same jokes every single day**
9. **Dark-skinned face-painter — paints the same smile on every kid, some come back changed**
10. **Pale, sleepless night-shift park janitor — cleans up things the day shift doesn't ask about**
11. **Short, quick-handed prize-booth operator — the games are rigged, everyone half-knows it**
12. **Elderly retired mascot performer — won't say which suit, won't say why not**
13. **Sunburnt cotton-candy vendor — sells the same sugar-pink cloud to three generations now**
14. **Multi-ethnic new hire, still cheerful — hasn't been here long enough to be tired yet**
15. **Lean, twitchy roller-coaster operator — checks the harnesses twice, still nervous**
16. **Stout balloon-animal vendor, dark-skinned — makes shapes kids swear move on their own**
17. **Grey-haired retired ringmaster — stepped back from the spotlight, still commands a room**
18. **Young twin performers — synchronized, a little too synchronized**
19. **Broad, painted-smile security guard — the park's only real muscle, always grinning**
20. **Elderly blind arcade attendant — somehow always knows who's cheating**
21. **Dark-skinned, face-paint-scarred stunt performer — does the tricks the mascots can't**
22. **Small, quick-handed pickpocket working the crowds — the one dishonest thing in a dishonest place**
23. **Weathered groundskeeper — tends a garden of topiaries that are never quite the same shape twice**
24. **Park nurse, unnervingly calm — treats injuries the rides shouldn't cause**
25. **Tall, gaunt park accountant — the only person here who never smiles**

## Domestic animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration) — this IS one of Genesis's intentionally cartoony realms, so chunky rounded shapes and exaggerated proportions are correct here. saturated cotton-candy-pink and mint palette, clean bold outlines, chunky rounded shapes like an 8-bit mascot, bright rim light — but with one unsettling detail (sharp teeth, too-wide eyes) per sprite that reads even in silhouette.

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
11. **Domestic animal — The realm-beast (a raven that's a shade too clever, keeps a running tally no one taught it)**
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
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration — this IS one of Genesis's intentionally cartoony realms, so chunky rounded shapes and exaggerated proportions are correct here).
saturated cotton-candy-pink and mint palette, clean bold outlines, chunky rounded shapes like an 8-bit mascot, bright rim light — but with one unsettling detail (sharp teeth, too-wide eyes) per sprite that reads even in silhouette.

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
11. **Wild animal — The realm-beast (a luminous-eyed fox that seems to know the shortest path before you do)**
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
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration — this IS one of Genesis's intentionally cartoony realms, so chunky rounded shapes and exaggerated proportions are correct here).
saturated cotton-candy-pink and mint palette, clean bold outlines, chunky rounded shapes like an 8-bit mascot, bright rim light — but with one unsettling detail (sharp teeth, too-wide eyes) per sprite that reads even in silhouette.

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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration) — this IS one of Genesis's intentionally cartoony realms, so chunky rounded shapes and exaggerated proportions are correct here. saturated cotton-candy-pink and mint palette, clean bold outlines, chunky rounded shapes like an 8-bit mascot, bright rim light — but with one unsettling detail (sharp teeth, too-wide eyes) per sprite that reads even in silhouette.

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

