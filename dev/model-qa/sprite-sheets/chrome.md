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

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

**Palette law (2026-07-09)** — SPRITE-PALETTE P1–P5: Chrome keeps its base identity — dark
gunmetal/asphalt chassis and shadow as the canvas, with cyan as the anchor rim-light — but the
corpus-wide "neon-magenta rim light" habit named in the style block above retires under P5: magenta
IS the chroma-key background color, so no figure may carry it as a rim light, visor glow, hair-rig,
or paint accent going forward. In its place Chrome runs P3's hyper-neon-everywhere law: every figure
carries emissive neon on its lights, visor, hair, tubing, or signage-glow — never left a flat dark
shape — drawn from a five-family accent menu: **neon cyan** (the realm's signature anchor),
**electric lime** (coolant leaks, targeting reticles, sickly bio-splice glow), **acid orange**
(warning strobes, welding sparks, gang-paint accents), **laser red** (scan-lines, targeting lasers,
alarm wash), and **ultraviolet/violet** (blacklight tattoo-ink, cortex-implant glow, high-end corp
tech). Sheet-level rule: across any 25-cell sheet, at least 4 of these hue families must appear as
deliberate emissive accents, and no two adjacent cells may read as the same duo — vary which
neon(s) light which figure. Dark chassis/asphalt is the canvas every figure sits on, never the whole
read — a cell that reads as gunmetal-and-shadow with no neon accent fails this law. Anti-key clause
(P5, binding everywhere): no hot magenta / neon pink on any figure — #FF00FF-adjacent hues fight the
chroma key; violets/UV fine, hot pinks go desaturated or shift violet.

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

## NPC batches (150 total, 6 sheets)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population also includes visible synthetic/heavily-augmented variety (see the final entries below) alongside an ethnically varied baseline-human majority — not everyone in this realm is flesh.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/6

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

### NPC sheet 2/6

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
20. **Full-conversion synth — a synthetic body wearing a human face, passes until it doesn't**
21. **Chrome-grafted courier — heavy augmentation, more visible metal than skin at this point**
22. **Unmodified holdout — dark-skinned, deliberately un-augmented, distrusts anyone with a chrome arm**
23. **Vat-grown replicant — technically not born, still clocks in for the same shift as everyone else**
24. **Multi-ethnic street doctor — patches up whoever can pay, chrome or flesh**
25. **First-gen synth elder — one of the oldest models still running, treated like furniture by the corp**

---

### NPC sheet 3/6

1. **Dark-skinned network splicer — routes data around corp firewalls for a living**
2. **Elderly analog holdout — refuses every implant, runs the last paper archive in the sprawl**
3. **Broad-shouldered dockyard loader, heavily augmented — half his body is replacement parts**
4. **Young synth-rights organizer — fighting for a legal status that doesn't exist yet**
5. **Grey-haired corp retiree — pension paid in obsolete hardware upgrades**
6. **One-eyed black-market optics dealer — sells the good cybereyes, no questions**
7. **Freckled teenage code-runner — too young for the job, too good to turn away**
8. **Heavyset noodle-cart owner — feeds half the block, hears everything**
9. **Dark-skinned mega-tower janitor — cleans up after people who don't see her**
10. **Pale, sleep-deprived night-shift trader — lives on stims and market spikes**
11. **Short, sharp-eyed pawnshop fixer — moves stolen chrome parts fast**
12. **Elderly first-generation cyborg — one of the originals, treated like a museum piece**
13. **Sunburnt rooftop farmer — grows real vegetables above the smog line**
14. **Mixed-heritage precinct clerk — files the reports no one reads**
15. **Lean, twitchy stim-runner — delivers the good stuff, avoids the corp patrols**
16. **Stout mechanic, dark-skinned — keeps the district's drones flying past their warranty**
17. **Grey-haired retired enforcer — traded the badge for a noodle stand, mostly at peace**
18. **Young twin synth-techs — build and repair the district's cheap labor bots**
19. **Broad, augmented bouncer — the club's only real security**
20. **Elderly blind data-diver — navigates the net by feel alone**
21. **Dark-skinned, heavily scarred smuggler captain — moves cargo the corps pretend not to see**
22. **Small, quick-handed chip forger — makes fake IDs that actually pass**
23. **Weathered rooftop pigeon-keeper — an analog hobby in a digital slum**
24. **Augmented street medic — patches gunshot wounds off the books**
25. **Tall, gaunt corp compliance officer — enforces rules even he thinks are pointless**


**Underworld-factions addendum (additive, 2026-07-09):** Chrome's genre touchstone is urban gang-turf drama + street-level mutant vigilantes + corporate cyborg law enforcement (tonal inspiration only — every faction/character below is an ORIGINAL design; none reproduces a specific existing franchise character, costume, or named gang). The 75 entries below add ten distinct rival street gangs (five ranked members each, each gang with its own uniform gimmick/identity so they read as visually distinct factions on the sheet), a set of original animal-mutant street vigilantes, a set of original corporate-cyborg enforcers, and ten independent underworld figures who work across every gang's turf.

### NPC sheet 4/6

1. **Glass-Tooth Wreckers (broken-mirror-shard vests that catch the neon in jagged flashes) — Leader — mirror shards forming a crude crown across the shoulders**
2. **Glass-Tooth Wreckers (broken-mirror-shard vests that catch the neon in jagged flashes) — Enforcer — carries a shard-studded bat, grins with a chipped tooth**
3. **Glass-Tooth Wreckers (broken-mirror-shard vests that catch the neon in jagged flashes) — Lookout — perched rooftop-side, signals with flashes of reflected light**
4. **Glass-Tooth Wreckers (broken-mirror-shard vests that catch the neon in jagged flashes) — Newest recruit — vest still bare, earning shards one fight at a time**
5. **Glass-Tooth Wreckers (broken-mirror-shard vests that catch the neon in jagged flashes) — Gang medic — patches wounds with salvaged glass-free bandaging, ironically gentle**
6. **Voltage Howlers (jury-rigged neon face-paint that pulses with the wearer's heartbeat) — Leader — face-paint pulses brightest of the whole crew**
7. **Voltage Howlers (jury-rigged neon face-paint that pulses with the wearer's heartbeat) — Enforcer — rigged gauntlets spark on contact**
8. **Voltage Howlers (jury-rigged neon face-paint that pulses with the wearer's heartbeat) — Lookout — face-paint dimmed to near-invisible for night watch**
9. **Voltage Howlers (jury-rigged neon face-paint that pulses with the wearer's heartbeat) — Newest recruit — paint job uneven, still learning the wiring**
10. **Voltage Howlers (jury-rigged neon face-paint that pulses with the wearer's heartbeat) — Gang mechanic — keeps everyone's face-rig from shorting out**
11. **Chain-Yard Reapers (motorcycle-chain bandolier harnesses) — Leader — chains doubled, weighted, worn like a sash of rank**
12. **Chain-Yard Reapers (motorcycle-chain bandolier harnesses) — Enforcer — swings a length of chain like it's an extension of the arm**
13. **Chain-Yard Reapers (motorcycle-chain bandolier harnesses) — Lookout — thin chain-mesh veil, watches the rail-yard entrances**
14. **Chain-Yard Reapers (motorcycle-chain bandolier harnesses) — Newest recruit — one chain earned, nine to go**
15. **Chain-Yard Reapers (motorcycle-chain bandolier harnesses) — Gang scavenger — strips scrap chain off wrecked cars for the whole crew**
16. **Static Vultures (feathered scrap-metal shoulder rigs, a scavenger gang) — Leader — the largest scrap-feather mantle in the crew**
17. **Static Vultures (feathered scrap-metal shoulder rigs, a scavenger gang) — Enforcer — sharpened scrap talons riveted over the knuckles**
18. **Static Vultures (feathered scrap-metal shoulder rigs, a scavenger gang) — Lookout — perches literally on rooftops, watches for salvage and rivals alike**
19. **Static Vultures (feathered scrap-metal shoulder rigs, a scavenger gang) — Newest recruit — half-built rig, still scavenging for the rest of it**
20. **Static Vultures (feathered scrap-metal shoulder rigs, a scavenger gang) — Gang trader — barters salvage rights with the other gangs**
21. **Rust Choir (welded pipe-organ percussion rigs strapped to the back) — Leader — conducts the crew's rhythm mid-fight, sets the pace of the brawl**
22. **Rust Choir (welded pipe-organ percussion rigs strapped to the back) — Enforcer — swings a length of tuned pipe like a club that also rings**
23. **Rust Choir (welded pipe-organ percussion rigs strapped to the back) — Lookout — taps a single low note to signal trouble**
24. **Rust Choir (welded pipe-organ percussion rigs strapped to the back) — Newest recruit — rig still off-key, hasn't found the crew's rhythm yet**
25. **Rust Choir (welded pipe-organ percussion rigs strapped to the back) — Gang tuner — the only one who can actually fix the welded instruments**

### NPC sheet 5/6

1. **Neon Widows (an all-female enforcer collective, glowing web-circuit tattoos) — Leader — circuit-web tattoos run brightest down the spine**
2. **Neon Widows (an all-female enforcer collective, glowing web-circuit tattoos) — Enforcer — knuckle-wrap wiring sparks on impact**
3. **Neon Widows (an all-female enforcer collective, glowing web-circuit tattoos) — Lookout — tattoo dimmed deliberately, blends into shadow**
4. **Neon Widows (an all-female enforcer collective, glowing web-circuit tattoos) — Newest recruit — tattoo half-finished, still healing**
5. **Neon Widows (an all-female enforcer collective, glowing web-circuit tattoos) — Gang informant — trades secrets as often as she trades blows**
6. **Copperhead Runners (copper-wire dreadlocks, the fastest couriers in the sprawl) — Leader — the longest, oldest copper dreadlocks in the crew**
7. **Copperhead Runners (copper-wire dreadlocks, the fastest couriers in the sprawl) — Enforcer — protects the runners' routes, rarely runs himself**
8. **Copperhead Runners (copper-wire dreadlocks, the fastest couriers in the sprawl) — Lookout — perched at a route's midpoint, relays timing**
9. **Copperhead Runners (copper-wire dreadlocks, the fastest couriers in the sprawl) — Newest recruit — dreadlocks still short, still proving the speed**
10. **Copperhead Runners (copper-wire dreadlocks, the fastest couriers in the sprawl) — Gang cartographer — the only one who actually knows every route by heart**
11. **Grid Wolves (wolf-pelt-and-scrap hybrid coats, claim the transit tunnels) — Leader — the pelt-coat with the most scrap-plate reinforcement**
12. **Grid Wolves (wolf-pelt-and-scrap hybrid coats, claim the transit tunnels) — Enforcer — patrols the tunnel claim line, turns back trespassers**
13. **Grid Wolves (wolf-pelt-and-scrap hybrid coats, claim the transit tunnels) — Lookout — crouches at a tunnel mouth, listens more than watches**
14. **Grid Wolves (wolf-pelt-and-scrap hybrid coats, claim the transit tunnels) — Newest recruit — coat still mostly pelt, hasn't earned the plating yet**
15. **Grid Wolves (wolf-pelt-and-scrap hybrid coats, claim the transit tunnels) — Gang tracker — reads foot-traffic patterns through the whole transit system**
16. **Chrome Locusts (swarm-tactics gang, insectoid scrap-plate shoulder armor) — Leader — the plating fans out like wings when he raises his arms**
17. **Chrome Locusts (swarm-tactics gang, insectoid scrap-plate shoulder armor) — Enforcer — swarm-tactics drilled hard, never fights alone**
18. **Chrome Locusts (swarm-tactics gang, insectoid scrap-plate shoulder armor) — Lookout — clicks a signal through the plating, mimics real insect calls**
19. **Chrome Locusts (swarm-tactics gang, insectoid scrap-plate shoulder armor) — Newest recruit — plating still bare metal, hasn't been etched yet**
20. **Chrome Locusts (swarm-tactics gang, insectoid scrap-plate shoulder armor) — Gang armorer — etches the swarm markings onto every new recruit's plate**
21. **Foundry Kings (heavy work-apron armor, run the black-market smelters) — Leader — apron scorched black from years at the forge**
22. **Foundry Kings (heavy work-apron armor, run the black-market smelters) — Enforcer — carries an actual smith's hammer as a weapon, and uses it as one**
23. **Foundry Kings (heavy work-apron armor, run the black-market smelters) — Lookout — watches the foundry's loading dock for corp inspectors**
24. **Foundry Kings (heavy work-apron armor, run the black-market smelters) — Newest recruit — apron still clean, hasn't earned a single scorch mark**
25. **Foundry Kings (heavy work-apron armor, run the black-market smelters) — Gang smelter — melts down whatever the other nine gangs bring in**

### NPC sheet 6/6

1. **Sewer-bred alligator-mutant vigilante — self-taught street fighter, protects the tunnel-dwellers who feed him**
2. **Rat-mutant scout — silent, fast, trades information for scraps, trusted by no one and everyone**
3. **Mutant opossum medic — plays dead as a defense reflex, best field medic in the undercity anyway**
4. **Mutant raccoon tech-scavenger — nimble-fingered, strips corp tech faster than security can react**
5. **Mutant pigeon courier — flies message routes no drone dares take**
6. **Elder mutant vigilante, retired — trained the current generation, mostly just watches now**
7. **Mutant stray-dog pack leader — leads a loose found-family of enhanced strays, fiercely protective**
8. **Bio-engineered defender, lab-escapee — enhanced reflexes, still learning what 'team' means**
9. **Corporate peacekeeper unit, chrome-plated riot armor — what's left of the original officer is mostly voice now**
10. **Prototype directive-bound enforcer — follows orders over judgment, unsettling to everyone who remembers him before**
11. **Decommissioned enforcer chassis, gone rogue — still patrols a beat no one assigned him anymore**
12. **Corp compliance cyborg — enforces policy with the same blank tone for a parking violation or a riot**
13. **Riot-frame test pilot — barely more human than the frame she wears**
14. **Salvaged enforcer-parts dealer — sells decommissioned peacekeeper components, no questions asked**
15. **Street-legal bounty cyborg — licensed, barely, chases contracts the peacekeepers won't touch**
16. **Turf-neutral fixer — brokers ceasefires between gangs when it's profitable**
17. **Underground doctor, no questions asked — patches up whichever gang pays first**
18. **Weapons smuggler — moves gear between all ten gangs equally, trusted for exactly that reason**
19. **Rooftop bookie — takes bets on gang skirmishes like they're sporting events**
20. **Graffiti-tagger territory-marker — the actual reason everyone knows whose turf is whose**
21. **Retired gang legend, now bartender — every gang still buys him a drink out of respect**
22. **Independent scrap baron — owns the yard all ten gangs have to buy from eventually**
23. **Corp informant embedded in the gangs — reports up, feeds the gangs just enough to stay useful**
24. **Street preacher of the old machine-cult — preaches to whichever gang will listen that week**
25. **Orphaned kid, gang-adjacent — too young to join, runs errands for whoever's kindest that day**

## Domestic animal batches (50 total, 2 sheets)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic living pose** — alert, mid-stride, grooming, watching — never
stiff/taxidermied. **No scene props, furniture, pens, or background objects of any kind** — no
fences, feed troughs, leashes-as-set-dressing, etc.; the animal itself only, isolated against the
plain magenta background. Rendered in this realm's art style (see the style block above).

### Domestic animal sheet 1/2

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
11. **Domestic animal — The realm-beast (a scavenging drone-pet, chassis dented, still answers to a whistle)**
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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background. Per the Palette law block above, magenta rim-light retires — light these in the neon-cyan / electric-lime / acid-orange / laser-red / ultraviolet accent menu instead, ≥4 hue families across the sheet.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic living pose** — alert, mid-stride, grooming, watching — never
stiff/taxidermied. **No scene props, furniture, pens, or background objects of any kind** — no
fences, feed troughs, leashes-as-set-dressing, etc.; the animal itself only, isolated against the
plain magenta background. Rendered in this realm's art style (see the style block above). Per P6
(realm-true fauna), this second sheet is Chrome-native: gene-mod, robotic, and feral-urban
companions — no repeats of sheet 1/2's base roster.

### Domestic animal sheet 2/2

1. **Domestic animal — Companion-Bot, Puppy-Chassis — vat-built puppy-analog, servo-fur twitches like the real thing, never grows past the mold.**
2. **Domestic animal — Lap-Drone — palm-sized hovering pet-bot, chirps and nuzzles in for a charge.**
3. **Domestic animal — Splice-Finch — gene-mod songbird, feathers threaded with a faint circuit pattern.**
4. **Domestic animal — Guard-Mite — thumb-sized drone-insect kept as a cheap apartment alarm.**
5. **Domestic animal — Vat-Koi — lab-grown ornamental fish, circles its tank on a magnetic fin, no pump needed.**
6. **Domestic animal — Coolant Newt — tank-kept amphibian bred to feed on stray current, glows faint blue when full.**
7. **Domestic animal — Owl-Unit (Companion Model) — miniature owl-shaped bot, patrols the apartment after dark on silent rotors.**
8. **Domestic animal — Pocket Cockatiel, Synthesized Call — gene-mod bird bred for a looped, non-natural song.**
9. **Domestic animal — Domesticated Roach — pet-mod cockroach that grooms loose wiring, oddly beloved by mechanics.**
10. **Domestic animal — Bonded Hamster — wheel-run pet whose wheel trickle-charges a night-light.**
11. **Domestic animal — Chrome-Scaled Iguana — gene-mod lizard kept for its faint metallic sheen.**
12. **Domestic animal — Companion Eel — a single tame eel that lights the tank when it recognizes its owner's step.**
13. **Domestic animal — Pocket Marmoset — gene-mod micro-primate, popular high-rise pet, mimics its owner's gestures.**
14. **Domestic animal — Static-Cling Chinchilla — a soft-furred pet whose coat crackles faintly with stray charge.**
15. **Domestic animal — Wall-Trained Gecko — bred to patrol apartment walls for real pests.**
16. **Domestic animal — Vat-Quail Chick — lab-grown quail-analog, imprints on the first face it sees.**
17. **Domestic animal — Servo-Tortoise — a slow, armored pet-bot popular with shut-ins, never needs feeding.**
18. **Domestic animal — Bootleg Chrome-Claw Gerbil — cheap back-alley pet-mod, claws plated for "style."**
19. **Domestic animal — Corp-Subscription Companion — a leased pet-bot, animal-shaped, repossessed if payments lapse.**
20. **Domestic animal — Retrofitted Guard-Chassis (Terrier-Class) — an aging robotic guard-pet with a bolted-on hip brace.**
21. **Domestic animal — Bonded Vole, Lab-Imprinted — a lab rodent imprinted on one owner, rides a shoulder everywhere.**
22. **Domestic animal — Micro-Breed Guinea Pig — gene-mod teacup breed, popular balcony pet.**
23. **Domestic animal — Chrome Mockingbird-Unit, Pre-Loaded — a mechanical bird sold pre-loaded with a hundred tunes.**
24. **Domestic animal — Splice-Axolotl — a gene-mod amphibian kept for its permanently juvenile, faintly glowing gills.**
25. **Domestic animal — Imprint-Kit (Fresh Companion-Bot) — a juvenile pet-bot fresh off the line, hasn't learned its name yet.**


---

## Wild animal batches (50 total, 2 sheets)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale).
gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

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

### Wild animal sheet 1/2

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
11. **Wild animal — The realm-beast (a storm-drain mutant, radiation-thick fur, territorial over a stretch of tunnel)**
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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale).
gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background. Per the Palette law block above, magenta rim-light retires — light these in the neon-cyan / electric-lime / acid-orange / laser-red / ultraviolet accent menu instead, ≥4 hue families across the sheet.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic wild-living pose** — alert, stalking, grazing, mid-flight,
territorial — never stiff/taxidermied, never tame-looking (these are wilderness creatures, not
pets). **No scene props, furniture, dens, or background objects of any kind** — no burrows,
nests-as-set-dressing, foliage clusters, etc.; the animal itself only, isolated against the plain
magenta background. Per P6 (realm-true fauna), this second sheet is Chrome-native: feral-urban
escapees and gene-mod/robotic ferals roaming outside anyone's ownership — no repeats of sheet
1/2's base roster.

### Wild animal sheet 2/2

1. **Wild animal — Feral Splice-Coyote — escaped gene-lab canid, prowls the rail yards in a loose pack**
2. **Wild animal — Rogue Maintenance-Bot, Territorial — an abandoned utility bot that's claimed a block as its own**
3. **Wild animal — Chrome-Backed Gull — scavenger bird with a fused metal wing-brace, thrives on rooftop trash**
4. **Wild animal — Feral Sentry-Pack, Decommissioned — abandoned security-bots hunting together on old patrol logic**
5. **Wild animal — Rooftop Tarantula, Gene-Swelled — lab-escapee spider-analog grown past natural size**
6. **Wild animal — Storm-Drain Mantis — an oversized gene-mod insect ambushing from flooded runoff grates**
7. **Wild animal — Corroded Junction Beetle — a beetle-analog that's learned to nest in dead transformer housings**
8. **Wild animal — Skybridge Starling Murmuration, Mutated — a flock with a faint chrome sheen threading the feathers**
9. **Wild animal — Alley Raccoon, Wire-Fingered — an urban scavenger whose paws have fused with stray filament**
10. **Wild animal — Feral Splice-Possum — a lab-escapee that plays dead with unsettling mechanical precision**
11. **Wild animal — Scrapyard Skunk, Chrome-Striped — a real skunk whose stripe has picked up a faint metallic glint**
12. **Wild animal — Rust-Molt Chameleon — a gene-mod reptile that shifts color to match scrap-metal instead of foliage**
13. **Wild animal — Feral Signal-Moth Cloud — escaped lab moths clustering on broadcast towers, drawn to the hum**
14. **Wild animal — Grid-Nesting Magpie — a bird that's built its nest entirely from scavenged wire and bottle caps**
15. **Wild animal — Storm-Runoff Crayfish, Overgrown — a bottom-feeder grown too large in the warm runoff water**
16. **Wild animal — Feral Combat-Chassis, Decommissioned — an old military bot running loose, still drilled on lockdown routines**
17. **Wild animal — Rooftop Centipede Swarm, Gene-Mod — an oversized colony nesting in the gaps between panels**
18. **Wild animal — Alley Armadillo, Plated — a real armadillo whose natural plating reads as chrome under sodium light**
19. **Wild animal — Junction-Box Scorpion — a gene-mod arachnid drawn to the warmth of live wiring**
20. **Wild animal — Feral Macaw, Escaped Pet-Stock — a loud, brilliant bird gone wild off a smuggler's crashed shipment**
21. **Wild animal — Feral Splice-Slug, Overgrown — a gene-mod detritivore leaving a faint conductive slime trail**
22. **Wild animal — Rooftop Dragonfly Swarm, Chrome-Winged — an oversized gene-mod insect hunting drone-scale prey**
23. **Wild animal — Feral Splice-Piranha, Storm Drain — a lab-escapee fish that's colonized the flood tunnels**
24. **Wild animal — Corroded Firefly Cloud — bioluminescent insects pulsing in sync with nearby power surges**
25. **Wild animal — Scrapyard Millipede, Oversized — a gene-mod detritivore stripping insulation off buried cable**

---

## Dungeon animal batches (50 total, 2 sheets)

**Lore note:** per `docs/ANIMAL-SOCIAL.md` §1, the dungeon environment band is animal-population
near-zero — "each one is a signal," not ambient wildlife. Every entry below is either a
domestic/wild animal that ended up somewhere it shouldn't be, or a creature that has adapted to
permanent dark — never a "generic cave critter."

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale).
gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic pose for its situation** — wary, cornered, feral, startled,
adapted-to-dark — never a relaxed/domestic pose (even the lost pets down here read as changed by
the place). **No scene props, furniture, cages-as-set-dressing, or background objects of any
kind** — the animal itself only, isolated against the plain magenta background.

### Dungeon animal sheet 1/2

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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale).
gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background. Per the Palette law block above, magenta rim-light retires — light these in the neon-cyan / electric-lime / acid-orange / laser-red / ultraviolet accent menu instead, ≥4 hue families across the sheet.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic pose for its situation** — wary, cornered, feral, startled,
adapted-to-dark — never a relaxed/domestic pose (even the lost pets down here read as changed by
the place). **No scene props, furniture, cages-as-set-dressing, or background objects of any
kind** — the animal itself only, isolated against the plain magenta background. Per P6 (realm-true
fauna) and the dungeon lore note above (near-zero population, each one a signal), this second sheet
is Chrome-native: derelict maintenance-bots and pale gene-mod invertebrates that have adapted to
permanent dark — no repeats of sheet 1/2's base roster.

### Dungeon animal sheet 2/2

1. **Dungeon animal — Derelict Maintenance-Mite — a thumb-sized repair-bot still patrolling a route no one owns**
2. **Dungeon animal — Reactor-Warmed Isopod Colony — pale gene-mod crustaceans nesting near a leaking coolant line**
3. **Dungeon animal — Blind Vault Silverfish Swarm — a colony thriving on old paper archives no one's opened in years**
4. **Dungeon animal — Corroded Janitor-Chassis, Inert-ish — a service-bot shell still twitching on backup power**
5. **Dungeon animal — Sub-Level Companion-Bot, Lost — someone's pet-bot that wandered into the maintenance shafts and stayed**
6. **Dungeon animal — Dead-Channel Music-Unit — an abandoned mechanical bird-bot left behind in a monitoring post, still singing**
7. **Dungeon animal — Blind Cave Leech, Overgrown — a gene-mod bloodfeeder grown pale and huge in the total dark**
8. **Dungeon animal — Ash-Grey Tick Colony — a swarm that's adapted to feed on stray current instead of blood**
9. **Dungeon animal — Junction-Nest Earwig Swarm — insects nesting inside a dead server rack's ventilation gaps**
10. **Dungeon animal — Forgotten Sentry-Shell, Motion-Lit — an inert robotic guard-shape, sensor light still blinking**
11. **Dungeon animal — Sump-Pit Pillbug Colony, Oversized — a colony grown too large in the flooded lowest level**
12. **Dungeon animal — Static-Fed Springtail Swarm — tiny gene-mod insects that graze on residual charge in dead conduits**
13. **Dungeon animal — The Last Patrol-Unit — an owl-shaped maintenance-bot still walking a route that no longer exists**
14. **Dungeon animal — Blind Vault Cicada, Silent — a cicada-analog that's lost its call across generations of total dark**
15. **Dungeon animal — Abandoned Companion-Chassis, Twitching — a leased pet-bot repossession crew never came to collect**
16. **Dungeon animal — Coolant-Line Snail Colony — slow gene-mod mollusks grazing the residue off old pipe seals**
17. **Dungeon animal — Sub-Basement Woodlouse Swarm, Radiant — a colony that's picked up a faint glow from the leak above it**
18. **Dungeon animal — Reactor-Adjacent Flea Colony — gene-mod parasites drawn to the last warm-blooded thing that passed through**
19. **Dungeon animal — Deep-Vault Planarian, Regenerating — a flatworm-analog that won't stay dead, keeps rebuilding from scraps**
20. **Dungeon animal — Void-Adjacent Companion-Bot, Wrong — a pet-bot that wandered too near a breach seal, runs different code now**
21. **Dungeon animal — Sub-Level Aphid Swarm, Dormant — gene-mod insects gone still near a cold reactor vent**
22. **Dungeon animal — Blind Tunnel Companion-Drone, Discarded — a child's pet-bot abandoned down here, still mimics passing footsteps**
23. **Dungeon animal — Deep-Sump Catfish, Blind — a genuine bottom-feeder gone pale and eyeless in the flooded sub-basement**
24. **Dungeon animal — Trapped Signal-Chassis, Looping — a courier-bot stuck replaying its last delivery route forever**
25. **Dungeon animal — An ordinary bot, deliberately unremarkable — janitor-class or pet-class, doesn't matter; its presence this deep IS the signal, let the scene decide what it means**

---

## Kid batches (20 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime, high value contrast so each silhouette reads instantly against a dark background.

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

Appended additions from `docs/REALM-KEY-EXPANSION-ROSTER.md` (Adam's rulings folded). Same
style block and mechanical instructions as the monster sheets above. Gang crews are NOT
repeated here (NPC sheets 4–6 already carry the 10 factions at 5 sprites each).

### Expansion sheet E1 (5×5 grid, 25 cells)

1. **Neon Salamander Brother — the Eldest** — mutant salamander in a wrapped training sash, neon skin-stripes, mid-kata, calm
2. **Neon Salamander Brother — the Hothead** — brighter stripes, mid-flying-kick, mouth open mid-yell
3. **Neon Salamander Brother — the Quiet One** — dimmest glow, half-turned, staff planted, watching
4. **The Beaver in the Gi** — broad mutant beaver in a worn martial-arts gi, mid-stance, tail as the third leg
5. **Loner Snapping-Turtle Mutant** — single gruff turtle mutant, hooded, shell scarred, arms crossed mid-refusal
6. **The Splice Saint** — gaunt benevolent mutant hermit draped in patched robes, palm out in blessing
7. **Rat-King Bruiser** — hulking mutant rat with smaller rats riding its shoulders like a court
8. **Oozed Cockroach Hulk** — chitin-plated roach mutant, one arm regrowing, refuses to fall
9. **Oozed Pigeon Flock** — a wheeling mass of wrong-eyed pigeons sharing one barrel's worth of mind
10. **The Apex Sewer Thing** — vast pale shape half out of a storm drain, the thing even the crews won't name
11. **ED-209-Class Enforcement Mech** — chicken-walker heavy mech, autocannon arms mid-deploy, warning strobe
12. **The Mech's Handler** — corporate suit with a control gauntlet, shouting compliance phrases
13. **Corp Cop Pair** — two chrome-visored corporate officers moving as one unit, batons drawn
14. **Compliance Auditor** — immaculate clerk with a terminal briefcase, freezing an account mid-keystroke
15. **Turnstile Ghost** — translucent commuter forever pushing through a turnstile that never gives
16. **Third-Rail Elemental** — arcing electricity given a crawling body, welded to the track line
17. **The Conductor** — tall uniformed figure with a lantern, punching a ticket that isn't for this line
18. **Punk Kid — Pipe-Swinger** — teenage tough, no colors yet, length of pipe, more scared than mean
19. **Punk Kid — Firecracker** — grinning kid mid-throw, pockets full of black-cat fireworks
20. **Punk Kid — Shoplifter** — hoodie stuffed full, mid-sprint, looking back
21. **Punk Kid — Wannabe Tagger** — spray can raised at a wall already claimed by a real crew
22. **Punk Kid — Skate Rat** — mid-ollie off a curb, deck plastered in stolen stickers
23. **Punk Kid — Mouthy Lookout** — leaning on nothing, two-finger whistle, selling everyone out for five bucks
24. **Punk Kid — Dine-and-Dasher** — vaulting a diner counter with the till's worth of loose bills
25. **Punk Kid — the Kid with the Dog** — scrawny kid, one loyal street mutt, both bristling

## Item batches — from `Engine/03. _Tables/05. Realms/Realm Items - Chrome.md` (50 total, 2 sheets)

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

1. **A cracked transit-cop data-slate** [Grounded] — A cracked transit-cop data-slate, screen dim in one corner, still readable.
2. **A vending-machine ramen brick** [Grounded] — A vending-machine ramen brick, "Flavor: Assorted."
3. **A sewer-mechanic's multi-tool with fourteen settings** [Grounded] — A sewer-mechanic's multi-tool with fourteen settings, two of them unlabeled.
4. **A pair of gecko-grip climbing pads** [Grounded] — A pair of gecko-grip climbing pads, scuffed from scaling transit pylons.
5. **A crew's colors** [Grounded] — A crew's colors — a stitched jacket-patch, the gang it names half of them dead now.
6. **A translator earpiece** [Grounded] — A translator earpiece, battery low, one street-cant pack installed.
7. **A thermal blanket** [Grounded] — A thermal blanket, foil-bright, folds to the size of a deck of cards.
8. **A spool of glow-tape** [Grounded] — A spool of glow-tape, meters of it, adhesive still good.
9. **A charge cable** [Grounded] — A charge cable, universal-fit, frayed at one end.
10. **A packet of anti-nausea gum** [Grounded] — A packet of anti-nausea gum, transit-issue, 1d6+2 sticks.
11. **A wetsuit patch kit** [Grounded] — A wetsuit patch kit, three patches used, two left.
12. **A brass subway token** [Grounded] — A brass subway token, worn smooth, minted for a line that stopped running years ago.
13. **A dead quadrotor drone** [Textured] — A dead quadrotor drone, one arm bent, camera port smashed.
14. **A dead-man alarm fob** [Textured] — A dead-man alarm fob, sewer-crew issue, clip worn bright.
15. **A black-market cortex stimulant** [Textured] — A black-market cortex stimulant, three doses, unlabeled batch number.
16. **A rooftop grapnel winch** [Textured] — A rooftop grapnel winch, palm-sized motor, 50 ft of cable.
17. **A sealed drum of fabricator resin** [Textured] — A sealed drum of fabricator resin, factory bands intact.
18. **A prototype keycard-clone reader** [Textured] — A prototype keycard-clone reader, factory second, one use burned already.
19. **A stolen crowd-control launch harness** [Textured] — A stolen crowd-control launch harness, single-burn, gauge honest.
20. **A signal jammer** [Textured] — A signal jammer, brick-sized, one toggle switch.
21. **A visor readout that flags one figure per crowd as "NON-STANDARD** [Strange] — A visor readout that flags one figure per crowd as "NON-STANDARD."
22. **A service droid** [Strange] — A service droid, knee-high, functional, imprint button blinking.
23. **A salvaged floor panel** [Strange] — A salvaged floor panel, 5 ft square, that stays exactly room temperature forever.
24. **A rebreather cartridge producing air at a purity no known process yiel** [Strange] — A rebreather cartridge producing air at a purity no known process yields.
25. **A courier's case** [Volatile] — A courier's case, locked, a beacon inside pinging steadily.

### Item sheet 2/2 (5×5 grid, 25 cells)

1. **An overclocked power cell** [Volatile] — An overclocked power cell, hot to the touch, casing discolored.
2. **The root credential nobody alive was cleared to hold — roll d4:** [Mythic] — The root credential nobody alive was cleared to hold — roll d4: 1. The original override key to the dead grid-mind still humming beneath a thousand unknowing blocks. 2. The first traffic-control mind ever switched on under `[this settlement]`, still routing every train, signal, and closed gate from a room no current map admits exists — waiting for someone to log in as its original operator. 3. The fabricator prime — the template printer every chop-shop printer was printed BY, dust-sheeted, tray still warm. 4. The founding surveillance eye of `[this settlement]`, the first lens the city ever watched itself through, still recording — and its archive holds one file timestamped in the future.
3. **A spare power-cell casing** [Grounded] — A spare power-cell casing, drained, seals intact.
4. **A window-washer's safety tether** [Grounded] — A window-washer's safety tether, self-retracting, rated for the tower work.
5. **A rack of spray cans** [Grounded] — A rack of spray cans, six colors, one nearly empty and rattling.
6. **A pair of noise-cancelling ear inserts** [Grounded] — A pair of noise-cancelling ear inserts, transit-issue, one slightly louder than the other.
7. **A magnetic tool tray** [Grounded] — A magnetic tool tray, spring-loaded slots, strap re-riveted.
8. **A dockworker's exo-glove** [Grounded] — A dockworker's exo-glove, one size fits most, knuckle servos whirring.
9. **A corp-cop's smart baton** [Textured] — A corp-cop's smart baton, stun-tipped, charge window at two.
10. **A canister of barricade-foam** [Textured] — A canister of barricade-foam, nozzle clean, two charges.
11. **A courier's folding hand-truck** [Textured] — A courier's folding hand-truck, one wheel that hums.
12. **Enchanted** [Textured] — Enchanted — "Overclock Coil" — a wrist unit that runs hot even idle.
13. **Enchanted** [Textured] — Enchanted — "Grip-Sync Gauntlets" — smart-fiber gloves that read your grip before you close your hand.
14. **Enchanted** [Textured] — Enchanted — "Null-Static Cloak" — a shimmer-weave coat that eats ambient radio noise.
15. **Enchanted** [Strange] — Enchanted — "Second-Skin Plating" — subdermal-style armor worn over clothing, not under skin.
16. **Enchanted** [Strange] — Enchanted — "Ghost-Read Visor" — a heads-up display that renders one extra layer nobody else's gear shows.
17. **Enchanted** [Strange] — Enchanted — "Debt-Ledger Chip" — a financial implant reader that reads more than balances.
18. **Enchanted** [Strange] — Enchanted — "Split-Second Boots" — magnetic-sole footwear tuned a fraction faster than physics strictly allows.
19. **Enchanted** [Strange] — Enchanted — "Signal-Ghost Earpiece" — a comm unit that picks up channels that don't exist yet.
20. **Signature** [Strange] — Signature — "Lance Pistol" (frame: hand crossbow; CHARGE item, cells) — a sidearm that fires cohered light.
21. **Signature** [Strange] — Signature — "Falling-Star Visor" (frame: goggles) — a scavenged crash-recorder visor, repurposed.
22. **Signature** [Strange] — Signature — "The Foreman's Override" — a battered transit-foreman's key that shouldn't open half of what it opens.
23. **Signature** [Volatile] — Signature — "The Last Cell" — a fusion core that began arming the moment it was picked up. Seven gauge segments. One goes dark each dawn.
24. **Consumable** [Grounded] — Consumable — A power cell, half-charged, standard rating.
25. **Consumable** [Grounded] — Consumable — A medi-patch, single-use, street-pharmacy stamp still legible.
