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

**Population diversity (binding) — toon-majority world:** this realm's population is MAJORITY non-human original toon-creatures (animate objects, anthropomorphic animals, storybook-cartoon beings) — humans are a visible MINORITY here, guests/staff in a world that isn't built around them. Roughly 80% of the 75 entries below are toon-creatures, ~20% are human (and those human entries should still vary in ethnicity/age/build across themselves). Every creature design below is original to this prompt set — do not render any recognizable existing character from any franchise; these are generic archetypes in the classic-cartoon-mascot genre, not specific IP.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration) — this IS one of Genesis's intentionally cartoony realms, so chunky rounded shapes and exaggerated proportions are correct here. saturated cotton-candy-pink and mint palette, clean bold outlines, chunky rounded shapes like an 8-bit mascot, bright rim light — but with one unsettling detail (sharp teeth, too-wide eyes) per sprite that reads even in silhouette.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Unlike every other realm's NPC section, this roster is NOT the reskinned 35-archetype NPC Role
Spine (per `NPC-ROLE-REALMS.md`) — Bright-Kingdom's toon-majority population needed original
non-human archetypes the spine's flat human-role labels can't express, so this list is
hand-authored instead.

### NPC sheet 1/3

1. **Animate teacup waiter — hops table to table on a saucer for legs, always resetting a spilled tray**
2. **Mushroom-capped gardener — squat body, wide round cap for a head, tends the sugar-beet patch**
3. **Walking alarm-clock postman — ticking loudly, always three minutes early**
4. **Candy-corn shopkeeper — triangular striped body, sells sweets that double as currency**
5. **Plaid-vested fox tailor — measures customers with a tape that never quite tells the truth**
6. **Round-bellied frog innkeeper — croaks out the nightly specials**
7. **Animate broom sweeper — no visible face, still somehow deeply expressive**
8. **Acorn-capped squirrel banker — counts coins faster than anyone can watch**
9. **Puffball cloud-person mail sorter — drifts a few inches off the ground, always**
10. **Piano-key zebra musician — stripes double as sheet music somehow**
11. **Jelly-bean-jar merchant — body made of stacked jellybeans, restocks himself**
12. **Waddling duck constable — badge too big for his chest, takes the job very seriously**
13. **Star-shaped night-watchman — glows faintly, patrols after the park closes**
14. **Carnivorous flower-person florist — sells bouquets, watches the customers a beat too long**
15. **Animate umbrella doorman — opens for rain or trouble, whichever comes first**
16. **Beanstalk-vine gardener — grows a little taller every scene, never mentions it**
17. **Egg-shaped chef — cracks a hairline more each time he laughs, never actually breaks**
18. **Round hedgehog cobbler — quills double as extra hands for pinning leather**
19. **Bunny-eared candy-striper nurse — the park infirmary's only real professional**
20. **Animate wind-up-key vendor — sells the keys that wind up the wind-up soldiers**
21. **Sunflower-headed farmer — turns to face whichever direction the crowd's headed**
22. **Puppet-jointed marionette librarian — strings visible, moves like she doesn't notice them**
23. **Round raccoon pickpocket, comic not menacing — always gets caught, never minds**
24. **Chubby bee beekeeper — tends the hives that make the park's actual honey**
25. **Animate lollipop crossing-guard — stops traffic with a literal giant sucker sign**

### NPC sheet 2/3

1. **Owl-faced night librarian — reads by moonlight, never needs the lamp**
2. **Penguin-shaped ice-cream vendor — waddles the exact same route every single day**
3. **Animate pocket-watch clockmaker — every gear visible, ticks faintly when he talks**
4. **Cat-eared seamstress — sews costumes for every performer in the park**
5. **Turtle-shelled mailman — slow, reliable, never once late in living memory**
6. **Animate paintbrush portrait artist — bristles for fingers, always mid-stroke**
7. **Round marshmallow baker — a little too warm to the touch, sells s'mores**
8. **Firefly lamplighter — lights the park's lanterns at dusk with no ladder**
9. **Puffin-faced ferry operator — runs the little boat ride, sings off-key sea shanties**
10. **Animate top-hat, a magician's assistant — the hat does most of the actual talking**
11. **Chipmunk-cheeked snack vendor — cheeks somehow hold an entire tray of popcorn**
12. **Round dumpling dim-sum chef — steam constantly rising off his own head**
13. **Butterfly-winged face-painter — dusts glitter off her wings between customers**
14. **Gopher-toothed construction foreman — rebuilds the same ride every season**
15. **Animate scarecrow security guard — straw arms, surprisingly firm grip**
16. **Round pufferfish balloon-seller — puffs up when startled, still smiling**
17. **Fox-eared fortune-cookie vendor — every fortune is oddly, specifically true**
18. **Animate music-box dancer, off-duty — pirouettes even just walking to work**
19. **Badger-faced blacksmith — forges the park's ride parts by hand, old-school**
20. **Round spider seamstress — eight hands, finishes orders twice as fast as anyone**
21. **Animate paper-lantern lamplighter's apprentice — glows a little dimmer, still learning**
22. **Squirrel-tailed accountant — counts the park's take twice, trusts no one, not even himself**
23. **Frog-throated town crier — announces every parade a little too loudly**
24. **Animate sock-puppet street performer — no visible strings, unsettlingly lifelike**
25. **Round hedgehog paperboy — quills hold the rolled-up newspapers**

### NPC sheet 3/3

1. **Beetle-shelled roller-rink DJ — shell doubles as a speaker somehow**
2. **Animate gingerbread baker's apprentice — smells faintly of cinnamon at all times**
3. **Bat-winged night-shift janitor — cleans the park after the lights go down**
4. **Round otter lifeguard — the water-ride's actual only qualified rescuer**
5. **Animate kite street-vendor — the kites tug at him like they want to fly off on their own**
6. **Chipmunk twins running the popcorn stand — synchronized, mildly unnerving**
7. **Round frog-faced ticket-taker — croaks out 'one, please' all day long**
8. **Animate wind-chime musician — sways gently even indoors**
9. **Fox-tailed reformed pickpocket, now security — still has the fastest hands in the park**
10. **Round snail mail-cart pusher — slow, but nothing ever gets lost**
11. **Human parade coordinator, dark-skinned — one of the few flesh-and-blood staff, keeps the too-cheerful schedule running**
12. **Elderly human ride mechanic — been fixing rides here since before most of the toons remember**
13. **Human ticket-booth kid, freckled — new hire, still adjusting to coworkers who are literally alive teacups**
14. **Human night-shift security guard — the toons handle most of it, he mostly just watches**
15. **Multi-ethnic human tour guide — explains the park to visitors who don't realize how much of it is actually alive**
16. **Elderly human food vendor — one of the last humans who still cooks by hand instead of somehow being made of the food itself**
17. **Human janitor — cleans up glitter and confetti that never seems to actually run out**
18. **Human maintenance crew lead, dark-skinned — the only one who goes near the rides when they're 'resting'**
19. **Human first-aid station nurse — treats human guests; the toon staff mostly can't be hurt the same way**
20. **Human retired performer — used to be in the park's old human-only sideshow, stayed on as groundskeeper**
21. **Human accountant — audits a park whose currency is sometimes literal candy**
22. **Human new hire, still visibly shaken — first week, still hasn't adjusted to a coworker being a sentient teapot**
23. **Human longtime resident — grew up beside the park, one of a handful of humans who actually live inside its boundary**
24. **Human late-night radio DJ — broadcasts from a booth just outside the gates; half the toons tune in**
25. **Elderly human founder's descendant — technically still owns the deed, mostly lets the park run itself now**

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


## Expansion batches — REALM-KEY-EXPANSION-ROSTER draft, 2026-07-09 (25 total, 1 sheet)

Appended additions from `docs/REALM-KEY-EXPANSION-ROSTER.md` (Adam: bright "could and should be
very weird, especially the NPCs"). The weirdness engine: **game-logic beings who don't know
they're game-logic** — side-scroller rules as folk metaphysics. Entries 1–20 are NPCs (use the
NPC-section pose discipline: mid-task, not combat); 21–25 are teeth-under-the-candy monsters.
Same style block and mechanical instructions as above.

### Expansion sheet E1 (5×5 grid, 25 cells)

1. **The Shopkeeper Who Is a Door** — an ornate door with a counter-hatch mid-transaction; nobody has seen the shop
2. **The Key Who Is a Person** — small brass-headed being, teeth-for-feet, proudly knows exactly one lock
3. **The Extra-Life Vendor** — beaming merchant holding up a glowing 1-up, price tag conspicuously blank
4. **The Continue-Screen Attendant** — patient robed usher holding a number card reading 9, mid-countdown
5. **Warp-Pipe Toll Troll** — squat collector seated atop a green pipe, palm out, exact change only
6. **The Princess Who Rescues Herself** — crowned figure climbing out her own tower window, rope of bedsheets, done waiting
7. **Glitch-Child** — kid rendered half-in-wrong-tiles, one arm scrambled, mid-clip through a wall edge
8. **The Out-of-Bounds Man** — weathered hermit standing on nothing past the level's edge, pointing at the seam
9. **Minus-World Exile** — returned traveler, colors slightly inverted, townsfolk politely not noticing
10. **Tutorial Ghost** — translucent guide mid-gesture at an arrow only it can see, cannot stop explaining
11. **Save-Point Hermit** — serene elder seated in a ring of soft light, remembering every version of you
12. **The Speedrunner** — local mid-motion-blur, feet not touching the ground, clipping a corner that should be solid
13. **Coin-Block Farmer** — overalls, anvil arms, mid-punch under a floating block, coins fountaining
14. **Invisible-Wall Mason** — trowel raised against empty air, building what everyone bumps into
15. **Boss-Door Herald** — trumpeter in livery before a huge skull-lock door, announcing, deeply tired
16. **The Unlicensed Power-Up Dealer** — trench-coated toad-thing, coat lined with mushrooms of dubious provenance
17. **The Credits Choir** — three robed singers mid-note, a scroll of finishers' names spooling from the choirbook
18. **The High-Score King** — throne of stacked arcade tokens, three-letter crown reading AAA, sneering
19. **A Chest That Eats (Politely)** — locked chest mid-curtsy, napkin tucked in its lid, tongue as a red carpet
20. **The Moon with the Face** — the low moon itself, grinning too wide, visibly closer than yesterday
21. **Gumdrop Hound** — candy-bright pack hunter, sugar-shell hide, teeth entirely real
22. **Piranha-Planter** — snapping flower in a cheerful terracotta pot it drags with it
23. **Spike-Shell Bruiser** — round jolly-faced bruiser whose shell is all spikes, mid-shoulder-charge
24. **The False King** — jeweled decoy monarch mid-taunt, crown slipping, "your quarry is elsewhere"
25. **The Kill-Screen** — the place where the world runs out, rendered as a creature of torn tiles and static

## Item batches — from `Engine/03. _Tables/05. Realms/Realm Items - Bright-Kingdom.md` (55 total, 3 sheets)

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

1. **A wrapped hard candy** [Grounded] — A wrapped hard candy, bright red, flavor unclear from the wrapper alone.
2. **A party favor whistle** [Grounded] — A party favor whistle, paper unfurl-tongue attached.
3. **A small plush toy** [Grounded] — A small plush toy, stitched smile a little too wide.
4. **A paper crown from the Kingdom's birthday package** [Grounded] — A paper crown from the Kingdom's birthday package, grease-spotted, one size fits all.
5. **A coloring book** [Grounded] — A coloring book, half-filled-in, crayon strictly inside the lines except for one page.
6. **A party balloon** [Grounded] — A party balloon, inflated, that hasn't sagged despite clearly being days old.
7. **A wind-up toy soldier** [Grounded] — A wind-up toy soldier, key still turnable, marches in a neat circle when wound.
8. **A scratch-and-sniff sticker sheet** [Grounded] — A scratch-and-sniff sticker sheet, half used.
9. **A pinwheel** [Grounded] — A pinwheel, tin blades, spins even in perfectly still air.
10. **A prize claw-machine token** [Grounded] — A prize claw-machine token, brass-colored, good for one try.
11. **A jump rope** [Grounded] — A jump rope, striped, handles worn smooth.
12. **A "World's Best" ribbon** [Grounded] — A "World's Best" ribbon, blue, pinned crooked, category left blank.
13. **Consumable** [Textured] — Consumable — A mushroom gummy, red-capped, white-spotted. The wrapper just says SUPER.
14. **Consumable** [Textured] — Consumable — A star drop, gold, humming faintly through the wrapper.
15. **Consumable** [Textured] — Consumable — A pocket ball, red and white, weighted exactly right for throwing.
16. **Consumable** [Textured] — Consumable — A pepper lolly, red-striped, warning label peeling.
17. **Consumable** [Textured] — Consumable — A packet of BLAST BERRY popping crystals.
18. **A bag of steel jacks** [Textured] — A bag of steel jacks, bouncing ball included.
19. **A yo-yo** [Textured] — A yo-yo, tournament-grade, string unfrayed.
20. **A strip of five ride tickets** [Textured] — A strip of five ride tickets, the old kind — "ADMIT ONE, ANY ATTRACTION."
21. **"The 1-UP"** [Strange] — "The 1-UP" — a mushroom of painted rubber, warm, heavier than it looks.
22. **A hobby horse** [Strange] — A hobby horse, stick-mounted, mane inexplicably real.
23. **A funhouse mirror panel** [Strange] — A funhouse mirror panel, salvaged, that shows the viewer as exactly one inch taller.
24. **A cotton candy machine** [Strange] — A cotton candy machine, cart-mounted, that spins sugar into the shape of whatever the buyer is currently thinking about.
25. **A mascot costume head** [Volatile] — A mascot costume head, empty, smiling.

### Item sheet 2/3 (5×5 grid, 25 cells)

1. **A birthday cake** [Volatile] — A birthday cake, boxed, candles pre-lit inside the box.
2. **The first wonder the park was built to imitate — roll d4:** [Mythic] — The first wonder the park was built to imitate — roll d4: 1. The original Wishing Coin, minted the day the Kingdom was founded — every fountain since has been quietly imitating it. 2. The Founder's own golden ticket, punched exactly once — every turnstile still knows it on sight. 3. The very first prize ever won here, kept behind glass the child never came back for. 4. The Founder's recipe card for the very first treat sold here — every sweet-cart since has been baking a fainter copy.
3. **A stuffed rabbit** [Grounded] — A stuffed rabbit, ears slightly asymmetric from a factory quirk.
4. **A snow globe** [Grounded] — A snow globe, plastic, depicting the Kingdom's main gate under gentle fake snow.
5. **A "Fun Pass" wristband** [Grounded] — A "Fun Pass" wristband, paper, one day's admission already used.
6. **A bag of stale popcorn** [Grounded] — A bag of stale popcorn, mostly kernels.
7. **A pair of novelty sunglasses** [Grounded] — A pair of novelty sunglasses, star-shaped lenses.
8. **A foam finger** [Grounded] — A foam finger, "#1," slightly deflated.
9. **A squeaky mallet** [Textured] — A squeaky mallet, carnival-prize size, handle taped.
10. **A ring-toss set** [Textured] — A ring-toss set, park-official, rings suspiciously fair.
11. **A bundle of sparklers** [Textured] — A bundle of sparklers, two dozen, fuses dry.
12. **Enchanted** [Textured] — Enchanted — "The Lucky Penny Locket" — a coin-shaped charm on a cheap chain.
13. **Enchanted** [Textured] — Enchanted — "The Merry-Go-Round Medallion" — brass, warm, shaped like a carousel horse.
14. **Enchanted** [Textured] — Enchanted — "The Funhouse Slippers" — mismatched, one striped, one polka-dotted.
15. **Enchanted** [Strange] — Enchanted — "The Cotton Candy Cloud" — a puff of spun sugar that never melts, never shrinks.
16. **Enchanted** [Strange] — Enchanted — "The Prize Wheel Spinner" — a small handheld wheel, brightly painted, that always lands on something useful.
17. **Enchanted** [Strange] — Enchanted — "The Story-Time Storybook" — a picture book that reads a little differently to everyone who opens it.
18. **Enchanted** [Strange] — Enchanted — "The Fun-House Goggles" — plastic-rimmed, lenses swirled with color.
19. **Enchanted** [Strange] — Enchanted — "The Wishing Well Bucket" — small, tin, that always comes up with something when lowered.
20. **Signature** [Strange] — Signature — *the Jordans* (canonical, ADAM-REVIEW-1) — Nike Air Jordan 1s, immaculate, never scuffed no matter the terrain.
21. **Signature** [Strange] — Signature — "Lunch Pail of Holding" (frame: bag-of-holding-lite) — a metal lunch pail, cheerful sticker design, dented at the corners.
22. **Signature** [Strange] — Signature — "The Fanfare Trumpet" — a toy trumpet that plays a real, triumphant note when it matters.
23. **Signature** [Volatile] — Signature — "The Overwound King" — a wind-up toy king, fist-sized, its key turning on its own, one notch per hour.
24. **Consumable** [Grounded] — Consumable — A "Power Berry," bright purple, single bite.
25. **Consumable** [Grounded] — Consumable — A "Fizzy Pop," ice-cold can, unfamiliar brand.

### Item sheet 3/3 (1×5 grid, 5 cells)

1. **Signature** [Mythic] — Signature — "The Hero's Edge" — a plain, perfectly balanced longsword, the blade every other sword in the Kingdom is secretly modeled on.
2. **Enchanted** [Strange] — Enchanted — "The Homing Wing" — a curved wooden boomerang painted like a bird, grip worn smooth.
3. **Consumable** [Textured] — Consumable — A sack of BANG BLOSSOMS — round black bombs with cartoon fuses, each drawn with a little grinning face.
4. **Enchanted** [Strange] — Enchanted — "The Long Reach" — a fist-sized spring-loaded launcher, clawed head, chain that spools out farther than the housing could possibly hold.
5. **Consumable** [Strange] — Consumable — A glass bottle, cork sealed with wax, a single winged spark drowsing inside.
