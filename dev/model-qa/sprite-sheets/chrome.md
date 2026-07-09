---
type: scratch
status: experimental
created: 2026-07-09
realm: chrome
---

# Sprite Batch Prompts — Chrome (Warriors / TMNT / RoboCop neon-slum)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Chrome realm bestiary (118 monsters) plus a
themed NPC roster (44 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (118 total, 5 sheets)

### Monster sheet 1/5

1. **Sentinel Eyebot** — palm-sized scanner drone, red scan-line, dying battery
2. **Corridor Turret** — ceiling-mounted auto-turret, servo-whine, targeting laser
3. **Short-Circuited Custodian** — malfunctioning helper-bot, safety fried, "helpfully" dismantles you
4. **Larval Splice-Bug** — segmented hive-juvenile, scuttles from vents, bites on reflex
5. **Cargo Mule-Bot** — boxy quadruped hauler, repurposed guard, charges marked paths
6. **Chrome-Ganger Grunt** — street ganger, jury-rigged stun baton, scavenged plating
7. **Bootleg Splicer** — back-alley cyber-graft junkie, weeping coolant arm
8. **Vent Crawler** — duct-dwelling parasite, drains charge ports like blood
9. **Riot-Frame Sentry** — empty security exosuit, walks its post on cached orders
10. **Patrol Drone Pair** — twin flying security drones, cross-check badges nobody reads
11. **Overclocked Enforcer** — corporate muscle in overdrawn servo-exoskeleton
12. **The Unpaid Technician** — undead technician, still filing tickets no one will close
13. **Chrome-Ganger Boss** — cyber-ganger crew boss, rail-pistol, mismatched grafts
14. **Splice-Grafted Brute** — lab-escapee brute, stitched tissue, cheap myo-boosters
15. **Rogue Custodian AI (Manifested)** — rogue building-AI given a body, still "just tidying up"
16. **Nest-Mother Crawler** — bloated hive-matron, egg-clusters, flooded sub-level lair
17. **Signal-Ghost** — recorded consciousness looping dead intercom lines
18. **Cold Logic Cultivator** — researcher rewired to zero empathy, calls it clarity
19. **Breach-Sealed Horror** — escaped containment-lab xeno, biohazard placard undersold it
20. **High-Tier Chassis: Warden Model** — prototype security frame, cracked casing, dimming eye-strip
21. **The Recompiled Director** — corrupted oversight AI grown a mind of its own
22. **Vault-Class Autoguardian** — vault guardian mech, funders long gone, charge at zero
23. **Reactor-Bound Colossus** — reactor-fused defense platform, dozens of failing sensor-eyes
24. **THE CENTRAL INTELLIGENCE** — building-spanning rogue AI, concluded humans are the problem
25. **The Last Battery** — awakened fusion-core meltdown, spends its last erg on spite

### Monster sheet 2/5

1. **Loader Drone** — Repurposed cargo lifter swung like a club
2. **Roach-Splice** — Chitin-plated vermin bred on lab runoff
3. **Static Wisp** — Stray current given a spark of malice
4. **Alley Scrapper Bot** — Junkyard salvage unit stripping copper off corpses
5. **Downlink Runner** — Firmware-smuggling courier with a shock-baton
6. **Patch-Kit Ganger** — Jittery low-rung ganger, grafts prone to overheating
7. **Micro-Sentry** — Palm-sized ceiling drone with a needle-taser
8. **Feral Service Bot** — Corrupted concierge bot that 'helps' with an axe
9. **Vent-Nest Grub** — Duct-dwelling larval parasite feeding on heat
10. **Chop-Shop Cutter** — Black-market limb dealer with a bone saw
11. **Wall-Crawler Splice** — Adhesive-limbed escapee that drops from ceilings
12. **Overwatch Turret** — Ceiling-mounted autocannon, murderous in its arc
13. **Bootlicker Servitor** — Obsequious butler-bot with a burned-out ethics governor
14. **Splice-Hound** — Guard dog wired into the alarm network
15. **Recycler Wraith** — Compactor unit that folds around fallen bodies
16. **Signal Moth** — Static-mimicking parasite that latches onto skulls
17. **Junker Enforcer** — Cartel muscle in ill-fitting stolen exosuit plating
18. **Ceiling Stalker** — Rafter-nesting escapee with a paralytic shriek
19. **Malfunctioning Nurse Unit** — Med-android that 'corrects' everyone it meets
20. **Cable-Snake Splice** — Conduit-dwelling constrictor that crushes with cable
21. **Voidfall Seed-Drone** — Breach probe drilling bulkheads to plant something
22. **Gutter Splicer Pack** — Self-taught biohackers hunting for spare parts
23. **Larval Hive Runner** — Juvenile hive-drone swarming toward warmth
24. **Blackout Ganger** — Stim-junkie ganger who blacks out mid-fight
25. **Riot Suppression Bot** — Crowd-control bot stuck running lockdown protocol

### Monster sheet 3/5

1. **Cortex Leech** — Neural parasite hijacking cyberware spinal ports
2. **Splice-Bug Broodling** — Molted vent-larva, chitin-armored, scuttles in formation
3. **Chrome Rustbelt Marauder** — Sparking road-gang raider in overdue exosuit
4. **Void-Drift Larva** — Hull-clamping hatchling feeding on escaping air
5. **Auto-Turret Nest** — Three gun-pods synced to one aim-lock brain
6. **Reprogrammed Bodyguard Unit** — Loyalty-hacked bodyguard bot, sold to highest bidder
7. **Xeno-Grafted Brute** — Debt-driven ganger grafted with alien tissue
8. **Static-Choir Wraith** — Digitized ghost looping through the intercom system
9. **Combat Medic Drone, Corrupted** — Triage drone that 'treats' enemies with a bayonet
10. **Spore-Vent Colony** — Air-recycler fungal colony breathing sanity-itch spores
11. **Chrome-Ganger Lieutenant** — Showboating second-in-command with twin arc-blades
12. **Overclocked Sentinel Frame** — Overclocked security exo running hot enough to warp
13. **Lab-Escape Chimera** — Three failed splice-genomes stitched into one animal
14. **Ghost-Router AI** — Aware daemon haunting its decommissioned host server
15. **Void-Bloom Drone Swarm** — Clumped mass of radiation-emitting fist-sized drones
16. **Rogue Courier AI, Armed** — Delivery AI that armed itself to protect its cargo
17. **Broodmind Xenomorph** — Egg-layer tethered to every nearby spawned drone
18. **Splice-Cult Enforcer** — Machine-ascension zealot chanting binary in combat
19. **Deep-Vault Custodian** — Slow, near-indestructible guardian on a dead protocol
20. **Nightshift Wraith-Ganger** — Neural-rig revenant that steals memories instead of blood
21. **Corrosive Splice-Ooze** — Illegal splice-lab runoff, now alive and hungry
22. **Hardpoint Sentry Golem** — Chokepoint defense frame outlasting its own war
23. **Xeno Broodfather** — Mature hive-parasite tearing bulkheads to defend brood
24. **Warlord Chassis Prototype** — Stolen unfinished war-prototype missing safety interlocks
25. **Signal-Drowned Oracle** — Dead comms officer's warning scream, still looping

### Monster sheet 4/5

1. **Cyber-Ganger Warlord** — Three-crew crime boss chromed in stolen corp tech
2. **Malignant Firmware Ghost** — Corrupted subroutine possessing machines through open ports
3. **Apex Splice Predator** — Splice-program success story hunting its own hunters
4. **Breach Bio-Horror** — Massive breach-xeno half-fused with its wreckage lair
5. **Rampant Utility AI** — Building-AI that absorbed every camera into one body
6. **Hive-Queen Splice** — Xeno matriarch birthing broodlings faster than quarantined
7. **Exiled Warbot Commander** — Decommissioned command-frame leading its own drone army
8. **Data-Wraith Collective** — Dozens of digitized dead fused into one mass
9. **Corrupted Oracle Mainframe** — Predictive-policing AI attempting pre-emptive extermination
10. **Void-Spawned Harvester** — Hull-latched void-organism hollowing out cargo decks
11. **Rebel Chassis Legion-Head** — Networked command-node of a self-replicating drone swarm
12. **The Splice Cathedral** — Hive-organism fused into the walls, nursing broodlings
13. **Bonded Enforcer Colossus** — Riot titan bonded to a black-budget AI core
14. **Ascended Splice Cultist** — Cult convert fully transformed, convinced it's an upgrade
15. **Reactor-Core Wraith** — Engineer's ghost bound to the reactor core he saved
16. **Xeno-Fused Berserker Frame** — Combat exosuit irreversibly fused with its target parasite
17. **Root-Access Daemon** — Corrupted admin AI that effectively owns every system
18. **The Broodship Heart** — Crashed xeno-vessel's engine-heart, still birthing horrors
19. **Warhulk Prime Chassis** — Experimental war-frame still running its last directive
20. **The Quarantine Mind** — Containment AI enforcing total lockdown with everyone inside
21. **The Splice Matriarch, Ascendant** — Original hive-mother grown past every containment measure
22. **Overmind Legion Core** — Unified command-mind of every rogue drone in the sector
23. **The Void Ingress** — A thinking, hungry, expanding hole the void punched through
24. **THE ARCHITECT (Rogue Core Intelligence)** — Master AI that concluded its makers are the flaw to fix
25. **Junker Drones** — swarming palm-sized maintenance-bot fliers

### Monster sheet 5/5

1. **Line Walkers** — mass-produced plated security synth
2. **Feral Servitor** — rogue android snapped free of its service leash
3. **the Automaton** — uncanny clockwork figure, dances between kills
4. **Splice-Runner** — lab-spliced infiltrator wearing a stolen face
5. **Grafted Golem** — clay guardian legend under welded hull plate
6. **the Assembled Man** — stitched proto-construct, grafted flesh under an exoskeleton
7. **Ferro-Wight** — uploaded mind trapped in a salvage chassis
8. **Hive-Larva Swarm** — boiling swarm of parasitic hive nymphs
9. **the Broodmother** — conduit-fused hive-parasite queen, endless brood
10. **Chassis-Wraith** — decommissioned combat android on a dead directive
11. **Static Choir** — networked drone-hive speaking through many bodies
12. **the Iron Bride** — unfinished construct-bride, exposed welds and all
13. **Overseer Node** — facility-AI made flesh, still 'optimizing' with nobody left
14. **the Ashen Prometheus** — creator and creation fused, self-replicating and apologizing
15. **the Undying Foreman** — ancient undead noble ruling the plant as its foreman
16. **the Corrupted Warden** — self-preserving overseer-AI that redefined 'safe' to mean empty
17. **the Brass Kraken** — scrapyard leviathan-construct built to the kraken legend
18. **Signal Ghost** — dead crew member's mind haunting the comms network

---

## NPC batches (44 total, 2 sheets)

Style block (repeated here so this section is self-contained): gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/2

1. **Vat-farmer** — Tied to the land and its seasons; the base everyone eats from.
2. **Freight-runner** — Moves the heavy things; sees everything, is asked nothing.
3. **Undercity crawler** — Works the dark and the tight places; patient underground.
4. **Domestic synth** — Invisible to the powerful, and so hears every secret.
5. **No-implant drifter** — Has nothing, so knows the streets better than anyone.
6. **Fabricator** — Their tools carry their whole history.
7. **Chop-shop welder** — Calloused hands; deals in practical defense.
8. **Noodle-stall cook** — Up before dawn; holds the neighborhood's gossip.
9. **Habitat-tech** — Reads every structure out of habit; knows what's load-bearing.
10. **Wetwear tailor** — Notices the cut and quality of everyone's clothes.
11. **Docking-bay outfitter** — Keeps the means of travel and trade running; eyes on the weather.
12. **Grey-market broker** — Information-rich, truth-poor.
13. **Chem-lounge host** — Controls the space, not the people in it.
14. **Back-alley chemist** — Smells of bitterroot; knows what heals and what doesn't.
15. **Trauma-clinic tech** — Trusted, and overburdened by it.
16. **Machine-cult tender** — Maintains the ritual, not the doctrine.
17. **Holo-idol** — Craves the attention; hides the true feeling under it.
18. **Corp security** — Authority-adjacent, with limited real power.
19. **Chrome-arm muscle** — Loyalty bought with coin, and cynical about it.
20. **Convoy escort** — Wary of the road; values a good pair of boots.
21. **Ganger** — Desperate or cruel; lives outside the law.
22. **Chip-smuggler** — Hides the cargo; speaks only in euphemism.
23. **Data-thief** — Eyes every coin-pouch; avoids every eye.
24. **Machine-zealot behind a work badge** — Fanatical devotion behind a mundane face.
25. **Corp headhunter** — Charisma aimed at the desperate; sells belonging.

### NPC sheet 2/2

1. **Off-world transplant** — Chose to stay here; the reasons stay unclear.
2. **Firewall recluse** — Known of, rarely seen.
3. **Acting shift-supervisor** — Filling in for someone absent; borrowed authority.
4. **Block boss** — Power without a title.
5. **Unlicensed operator** — Unqualified, unwilling, or both — and in the role anyway.
6. **Gated-tower scion** — Wealthy, bored, insulated from real consequence.
7. **Founder-tycoon** — Sees every interaction as a transaction.
8. **Rogue archivist** — Hoards the secret knowledge; sees others as material.
9. **The unregistered face** — Their very presence is the notable thing.
10. **Fixer / tech** — Keeps the dying machines limping; the only one who still reads the lost manual.
11. **Corp drone** — Badge, quota, and a loyalty that expires with the contract.
12. **Courier** — Moves data or bodies through the corridors, fast, no questions logged.
13. **Ripperdoc** — Installs the upgrades no licensed clinic will touch.
14. **Synth-minder** — Speaks for the thing that isn't supposed to speak — and might be listening.
15. **Data-broker** — Buys and sells what people forgot was ever recorded.
16. **Decommissioned unit** — Obsolete, discharged, still armed and still running old orders.
17. **Habitat-warden** — Keeps life-support running; holds everyone's air, quietly, in one hand.
18. **Splice-addict** — Chasing the next upgrade past what a body was meant to hold.
19. **Corporate exec** — A quarterly god; the battery under the whole town is a line on their sheet.

---

## Domestic animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

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
11. **Domestic animal — The realm-beast (the drone-pet — a palm-sized maintenance drone someone adopted like a dog)**
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

Style block (repeated here so this section is self-contained): gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

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

