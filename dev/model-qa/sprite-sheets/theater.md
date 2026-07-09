---
type: scratch
status: experimental
created: 2026-07-09
realm: theater
---

# Sprite Batch Prompts — Theater (war, any war, unnamed/unflagged (per eraLens))

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Theater realm bestiary (118 monsters) plus a
themed NPC roster (43 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). desaturated olive-and-khaki palette, heavy dither for smoke/haze, hard directional light like a flare or muzzle-flash, worn canvas/leather gear textures, avoid any real-world flag, insignia, or named-conflict iconography (content-safety — keep it era-neutral).

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (118 total, 5 sheets)

### Monster sheet 1/5

1. **Line Infantry Shade** — Rank-and-file trench ghost, holds the line by rote
2. **Wire-Cutter Scout** — Silent night-crawler who counts sentries for something
3. **Whistle-Blown Runner** — Message-runner forever mid-sprint toward the whistle
4. **Duckboard Vermin Swarm** — Fearless rat-swarm that owns the trench floor at night
5. **Mustard Wraith** — Drifting toxic gas-cloud that hunts low ground blind
6. **Barbed Kill-Zone Tangle** — Living wire-tangle that snags then reels men in
7. **Musket-Line Regular** — Volley-fire rifleman lost in permanent powder smoke
8. **Longship Raider** — Beach-charging raider screaming a nameless war-cry
9. **Jungle Ambusher** — Silent canopy-and-mud ambusher, gone before you see him
10. **Siege-Line Sapper** — Tunnel-digger laying the charge that breaches the wall
11. **Barbed-Wire Horror** — Wire-impaled corpse that never fell, still reaching
12. **The Unkillable Sergeant** — NCO who won't stay dead, keeps ordering the charge
13. **Hedgerow Tank-Killer** — Bocage ambusher waiting to drop a war-machine cold
14. **Longship Warlord** — Giant raider-chief armored in three lines' worth of plate
15. **Trench Ghast** — No-man's-land feeder that mimics the whistle to lure prey
16. **Jungle Beast-Handler** — Handler who marches a chained horror as a living breacher
17. **Iron Crawler War-Machine** — Treaded armored hull grinding across the wire alone
18. **Legion Standard-Breaker** — Flag-devoted killer who believes in nothing but the fight
19. **Musket-Line Cavalry Officer** — Officer charging cannon-fire on horseback for the order alone
20. **The Line That Held** — Animate trench-line that simply refuses to yield ground
21. **Longship Draugr-Captain** — Drowned captain still commanding his dead crew ashore
22. **Jungle War-Engine** — Feral jungle war-machine still firing a stale coordinate
23. **Legion Praetor-Revenant** — Dead commander who still drills a legion by discipline alone
24. **The Whistle** — The sound of the order itself, given bone and rank
25. **No-Man's Bloom** — War-soaked ground grown into a thorned, remembering forest

### Monster sheet 2/5

1. **Trench Rat Cloud** — Carrion rats swarming abandoned trenches and packs
2. **Conscript Straggler** — Green conscript, flinches and breaks under fire
3. **Wire-Snagged Corpse** — Barbed-wire corpse still lurching toward the line
4. **Powder Monkey Cutthroat** — Small shipboard runner, finishes off fallen boarders
5. **Musket Skirmisher** — Loose-order skirmisher, fires and vanishes into smoke
6. **Longship Thrall** — Chained oarsman turned axe-fighter at the beachhead
7. **Jungle Leech-Thing** — Canopy leech-creature that drops and drains blood
8. **Siege Camp Looter** — Corpse-looter trailing behind the siege lines
9. **Shell-Shocked Wanderer** — Shell-shocked survivor wandering, immune to fear
10. **Gas-Mask Sentry** — Masked sentry holding post through gas alarms
11. **Draft-Horse Casualty** — Dead draft horse still hauling its rotted harness
12. **Cavalry Lancer** — Mounted lancer charging ahead of modern fire
13. **Musket-Line Drummer Boy** — Drummer keeping march step, breaking his death shatters morale
14. **No-Man's-Land Crawler** — Battlefield ghoul scavenging the unburied at night
15. **Jungle Ambush Sniper** — Canopy-lashed sniper waiting days for one shot
16. **Longship Shieldmaiden** — Flank shield-wall fighter screaming the ship's name
17. **Trench Wire Golem** — Salvaged-armor construct patrolling the wire on its own
18. **Musket Volley Ghost** — Volley-killed rank of soldiers standing in smoke
19. **Jungle War-Dog** — Scent-trained war-dog running point on patrol
20. **Siege Sapper's Mole** — Tunneling beast bred to dig under siege walls
21. **Mustard Fog Sprite** — Living gas-cloud that hunts by coughing sounds
22. **Longship Berserker** — Beach-landing berserker numb to wounds mid-charge
23. **Colonial Trench Medic** — Under-fire medic, priority target to break morale
24. **Jungle Pit-Trap Warden** — Guerrilla warden herding patrols into staked pits
25. **Duckboard Trench Fiend** — Mud-spawned fiend climbing up through duckboards

### Monster sheet 3/5

1. **Machine-Gun Nest Crew** — Two-man gun crew that ends charges outright
2. **Storm-Trooper Breach Squad** — Fast breach specialists clearing trench sections
3. **Longship Skald-Reaver** — Singing raider whose saga-verses embolden the crew
4. **Jungle Pit Viper Ambush** — Treeline ambush snake striking bunched patrols
5. **Cavalry Saber Charge** — Full-gallop saber cavalry betting on the first pass
6. **Field Gun Battery** — Cannon crew fighting as one machine past death
7. **The Wire-Cutter Colossus** — Wire-clipping walker built to open assault lanes
8. **Longship Hull-Breaker** — Raiding-crew brute thrown at hulls and gates
9. **Jungle Beast-Cage Handler** — Handler releasing caged war-beasts on the ambush horn
10. **Gas Cloud Horror** — Sentient, undissipated gas barrage with a will
11. **Trench Raid Bayonet Line** — Silent bayonet line going over the top on the whistle
12. **Musket-Line Artillery Sergeant** — Voice-correcting gun sergeant walking under fire
13. **Siege Tower Crew** — Rolling siege tower crewed under falling arrows
14. **Longship War-Wolf Handler** — Raider running a leashed wolf-pack ahead of the men
15. **Jungle War-Elephant Driver** — Barded war-elephant carrying its driver into chaos
16. **Trench Flame-Lance Team** — Flame-tank team clearing bunkers in one breath
17. **Deserter-Thing** — Executed deserter risen wrong, hunting its executioners
18. **Musket-Line Grenadier** — Fearless grenadier carrying door-opening black powder
19. **Longship Ghost Fleet Crewman** — Century-dead rower still believing the raid continues
20. **Siege Ballista Crew** — Gate-punching war-machine crewed around the clock
21. **Jungle Tiger-Rider Scout** — Trained big-cat rider scouting the canopy trails
22. **Trench Officer's Ghost-Whistle** — Dead officer whose whistle still calls the charge
23. **Musket-Line Field Marshal's Honor Guard** — Standard-guard sworn to die before it falls
24. **Cavalry Death-Rider** — Dead cavalry officer and horse still mid-charge
25. **Longship Berserker-King's Champion** — Bare-chested prow-fighter daring the shore to resist

### Monster sheet 4/5

1. **Jungle Ambush War-Priest** — Ritual-blessing war-priest wading into the ambush
2. **Siege-Line Trebuchet Golem** — Self-aiming trebuchet that no longer waits for orders
3. **Musket-Line Cannon Golem** — Walking field-gun chassis built to replace dead crews
4. **Trench Wraith of the Wire** — Company-wide death-wraith hunting by muzzle-flash memory
5. **Longship Draugr-Fleet Captain** — Drowned fleet-captain whose sunk ships still answer
6. **Jungle Colossus-Beast** — Tamed prehistoric survivor used as a living ram
7. **Trench Butcher Golem** — Close-quarters clearing machine built for the unstomachable work
8. **Musket-Line Ghost Regiment** — Regiment lost in one charge, still marching in formation
9. **Siege Wall-Breaker Titan** — Ram-wielding siege titan that doesn't stop swinging
10. **Longship Sea-Wyrm Figurehead** — Cursed living figurehead diving from fog onto ships
11. **Jungle War-Machine of Rusted Vines** — Root-swallowed ancient war-engine, still fully armed
12. **The Field Marshal's Undying Aide** — Undying aide delivering the same dead order nightly
13. **Trench Legion Revenant Colonel** — War-denying revenant rallying every nearby corpse
14. **Longship Storm-Caller Reaver** — Storm-bargaining reaver whose weather still owes him
15. **Jungle Chimera-Beast of War** — Warlord-bred chimera leading otherwise unsurvivable charges
16. **Musket-Line Field Marshal-Revenant** — Century-dead marshal still finishing his last order
17. **Trench Colossus of Bone and Wire** — Self-built ossuary titan from an unnamed battle's dead
18. **No-Man's-Land Warlord's Ghost** — General's ghost eternally watching his own fatal order
19. **The Ironclad Reaver-Queen** — Ship-hull-and-captain war-machine that never comes ashore
20. **Legion Undying Praetorian Host** — Never-broken honor-guard formation, undying for centuries
21. **The Gas-King of the Salient** — Sentient gas-cloud amalgam that owns the salient's ground
22. **The Siege That Never Lifted** — Fused siege-line horror still failing to take the city
23. **The Trench Ghost** — shell-shocked revenant infantryman on eternal patrol
24. **The Legion Wall** — lone shield-and-spear legionary, drilled to a fault
25. **The Musket Line** — standing volley-drill musketeer, drilled past reason

### Monster sheet 5/5

1. **The Longship Raider** — axe-and-round-shield sea raider, stranded in the war
2. **The Jungle Scout** — camo-draped recon scout gone half-feral in the green
3. **The Siege Sapper** — tunnel-digging siege engineer, still mining toward a wall
4. **The Berserker** — battle-trance warrior who fights past fear and flesh
5. **The Draugr Captain** — mound-risen undead officer still holding a dead line
6. **The Machine-Gun Nest** — fused gun-and-gunner emplacement, animate and traversing
7. **The Storm-Trooper Cadre** — grenade-and-trench-knife shock infantryman
8. **The Valkyrie** — battlefield psychopomp choosing which dead the war keeps
9. **The Iron Cavalry** — armor-plated war-beast standing in for every era's tank
10. **The Siege Tower** — animate siege-tower, self-propelled toward the wall
11. **The Trench Wight** — revenant trench-officer still blowing the whistle to advance
12. **The War Elephant** — armored siege-beast that shrugs off volleys and keeps coming
13. **The Gorgon Standard** — gorgon-faced standard-bearer, a banner that petrifies stares
14. **The Flying Squadron** — aerial strafing beast standing in for the first air war
15. **The Ironclad Leviathan** — gargantuan warship-beast that dominates the theater's horizon
16. **The War-Wyrm** — chained siege-dragon deployed like a living artillery piece
17. **The Death Knight of No Nation** — undead commander claimed by every faction, loyal to none
18. **The Siege of the World** — war given a body, wearing every era's uniform at once

---

## NPC batches (75 total, 3 sheets)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population is entirely human (no established non-human civilian population in this realm's lore) — the diversity requirement is ethnic/physical variety only, and stays era-neutral per this realm's content-safety rule (no real-world flags/insignia).

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). desaturated olive-and-khaki palette, heavy dither for smoke/haze, hard directional light like a flare or muzzle-flash, worn canvas/leather gear textures, avoid any real-world flag, insignia, or named-conflict iconography (content-safety — keep it era-neutral).

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/3

1. **Requisitioned farmer** — Tied to the land and its seasons; the base everyone eats from.
2. **Scout** — Reads the wild and brings in what the settled can't.
3. **Ammunition-bearer** — Moves the heavy things; sees everything, is asked nothing.
4. **Sapper** — Works the dark and the tight places; patient underground.
5. **Officer's orderly / batman** — Invisible to the powerful, and so hears every secret.
6. **Refugee** — Has nothing, so knows the streets better than anyone.
7. **Field-artificer** — Their tools carry their whole history.
8. **Armorer** — Calloused hands; deals in practical defense.
9. **Cook** — Up before dawn; holds the neighborhood's gossip.
10. **Field engineer** — Reads every structure out of habit; knows what's load-bearing.
11. **Kit-mender** — Notices the cut and quality of everyone's clothes.
12. **Farrier** — Keeps the means of travel and trade running; eyes on the weather.
13. **Sutler (camp merchant)** — Information-rich, truth-poor.
14. **Canteen-keeper** — Controls the space, not the people in it.
15. **Camp bonesetter** — Smells of bitterroot; knows what heals and what doesn't.
16. **Surgeon (the rear hospital)** — Trusted, and overburdened by it.
17. **Chaplain** — Maintains the ritual, not the doctrine.
18. **Camp entertainer** — Craves the attention; hides the true feeling under it.
19. **Provost-sergeant** — Authority-adjacent, with limited real power.
20. **Mercenary** — Loyalty bought with coin, and cynical about it.
21. **Picket** — Wary of the road; values a good pair of boots.
22. **Marauder** — Desperate or cruel; lives outside the law.
23. **Contraband-runner** — Hides the cargo; speaks only in euphemism.
24. **Looter** — Eyes every coin-pouch; avoids every eye.
25. **Zealot-soldier** — Fanatical devotion behind a mundane face.

### NPC sheet 2/3

1. **Press-gang** — Charisma aimed at the desperate; sells belonging.
2. **Foreign auxiliary from afar** — Chose to stay here; the reasons stay unclear.
3. **Shell-shocked hermit behind the lines** — Known of, rarely seen.
4. **Field-promoted corporal (borrowed command)** — Filling in for someone absent; borrowed authority.
5. **Trench boss** — Power without a title.
6. **Conscript who should never have been called** — Unqualified, unwilling, or both — and in the role anyway.
7. **Well-connected staff cornet** — Wealthy, bored, insulated from real consequence.
8. **War contractor** — Sees every interaction as a transaction.
9. **Cryptographer** — Hoards the secret knowledge; sees others as material.
10. **The one no uniform explains** — Their very presence is the notable thing.
11. **Officer** — Orders the line held; loved or hated, and rarely wrong about both.
12. **Field-medic** — Patches what the line breaks; ran out of the good supplies weeks ago.
13. **Quartermaster** — Controls what everyone needs, and skims what nobody counts.
14. **Runner** — Carries the message under fire; knows what the officers won't say aloud.
15. **Deserter** — Walked away from the line; now every uniform is a threat.
16. **War-orphan / camp-follower** — The war's dependents; survive in its margins, move when it moves.
17. **The captured** — Belongs to no side now — and is leverage to every side.
18. **Veteran, missing a piece** — Came home from a war no one names, and it followed them back.
19. **Dark-skinned field medic — keeps more of the unit alive than the officers do**
20. **Elderly quartermaster — has outlasted three commanding officers**
21. **Multi-ethnic supply-line driver — the actual reason the front doesn't starve**
22. **Young enlisted cook — feeds the unit on whatever's left**
23. **Grey-haired chaplain — runs out of comforting things to say, keeps saying them anyway**
24. **Foreign-tongued translator — trusted by neither side, needed by both**
25. **Career NCO, unnamed rank — the one everyone actually listens to**

---

### NPC sheet 3/3

1. **Dark-skinned combat photographer — documents what the official reports leave out**
2. **Elderly retired general, advisory only — still gives orders nobody's obligated to follow**
3. **Broad-shouldered logistics sergeant — keeps the whole operation fed and moving**
4. **Young enlisted radio operator — relays messages faster than command can react to them**
5. **Grey-haired field priest — has run out of comforting things to say, keeps saying them**
6. **One-eyed veteran scout — lost the eye two campaigns ago, still sees more than most**
7. **Freckled runner, underage and unofficial — carries messages nobody else will risk**
8. **Heavyset mess-hall cook — feeds the unit on whatever's left, always finds something**
9. **Dark-skinned unit medic — keeps more people alive than the officers give her credit for**
10. **Pale, sleepless night-watch sentry — hasn't trusted a quiet perimeter in months**
11. **Short, sharp-eyed supply clerk — knows exactly what's missing and who took it**
12. **Elderly retired quartermaster — has outlasted three commanding officers**
13. **Sunburnt field engineer — builds and destroys bridges on the same day**
14. **Multi-ethnic translator — trusted by neither side, needed by both**
15. **Lean, twitchy demolitions specialist — steady hands, unsteady everything else**
16. **Stout mess sergeant, dark-skinned — runs the kitchen tent like a second command post**
17. **Grey-haired career NCO, unnamed rank — the one everyone actually listens to**
18. **Young twin conscripts — enlisted together, refuse every assignment that splits them up**
19. **Broad, scarred veteran infantryman — the unit's actual institutional memory**
20. **Elderly blind veteran, non-combat role — advises on terrain from memory alone**
21. **Dark-skinned, heavily scarred field commander — earned every stripe the hard way**
22. **Small, quick-handed courier — moves messages faster than any radio line**
23. **Weathered field chaplain's assistant — handles the paperwork of grief**
24. **Combat nurse, unsentimental — has stopped counting the wounded she's treated**
25. **Tall, gaunt intelligence officer — knows more than she's allowed to say**

## Domestic animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). desaturated olive-and-khaki palette, heavy dither for smoke/haze, hard directional light like a flare or muzzle-flash, worn canvas/leather gear textures, avoid any real-world flag, insignia, or named-conflict iconography (content-safety — keep it era-neutral).

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
11. **Domestic animal — The realm-beast (a war-mule, unfazed by artillery, carries what the quartermaster can't)**
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
desaturated olive-and-khaki palette, heavy dither for smoke/haze, hard directional light like a flare or muzzle-flash, worn canvas/leather gear textures, avoid any real-world flag, insignia, or named-conflict iconography (content-safety — keep it era-neutral).

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
11. **Wild animal — The realm-beast (a battlefield crow, thick in numbers where the fighting was worst)**
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
desaturated olive-and-khaki palette, heavy dither for smoke/haze, hard directional light like a flare or muzzle-flash, worn canvas/leather gear textures, avoid any real-world flag, insignia, or named-conflict iconography (content-safety — keep it era-neutral).

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

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). desaturated olive-and-khaki palette, heavy dither for smoke/haze, hard directional light like a flare or muzzle-flash, worn canvas/leather gear textures, avoid any real-world flag, insignia, or named-conflict iconography (content-safety — keep it era-neutral).

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


## Item batches — from `Engine/03. _Tables/05. Realms/Realm Items - Theater.md` (50 total, 2 sheets)

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

1. **A soldier's letter home** [Grounded] — A soldier's letter home, unsent, folded and refolded until the creases are soft as cloth.
2. **A tin ration box** [Grounded] — A tin ration box, dented, lid held shut with wire.
3. **An entrenching tool** [Grounded] — An entrenching tool, short-handled, blade nicked from digging more than it was built for.
4. **A canteen** [Grounded] — A canteen, dented, engraved with initials not matching whoever's currently carrying it.
5. **A field dressing kit** [Grounded] — A field dressing kit, half-used, bandages yellowed with age but intact.
6. **A deck of cards** [Grounded] — A deck of cards, worn soft, one card short.
7. **A compass** [Grounded] — A compass, service-issue, needle steady and true.
8. **A whistle** [Grounded] — A whistle, brass, worn smooth at the mouthpiece.
9. **A pocket-sized prayer book** [Grounded] — A pocket-sized prayer book, water-stained, spine cracked to a well-worn page.
10. **A pair of worn boots** [Grounded] — A pair of worn boots, resoled at least twice by a field cobbler's careful hand.
11. **A signal mirror** [Grounded] — A signal mirror, cracked, still catches the sun well enough to be seen for miles.
12. **A folding trench periscope** [Grounded] — A folding trench periscope, mirrors true.
13. **A field stove** [Textured] — A field stove, trench-pattern, burns anything.
14. **A deserter's forged discharge papers** [Textured] — A deserter's forged discharge papers, well-made, one detail slightly wrong.
15. **A stretcher** [Textured] — A stretcher, rolled, poles sound.
16. **A camouflage cape** [Textured] — A camouflage cape, local-pattern, mud-proofed.
17. **A sealed ration of real coffee** [Textured] — A sealed ration of real coffee — or this era's equivalent. Three brews.
18. **A gas-cape and hood** [Textured] — A gas-cape and hood, sealed in waxed paper.
19. **A truce flag** [Textured] — A truce flag, plain, on a stripped pole.
20. **A pair of trench waders** [Textured] — A pair of trench waders, patched, tall as regret.
21. **A field telephone that connects to a line that was cut months ago** [Strange]
22. **A duckboard section that never sinks** [Strange]
23. **A drummer's drum** [Strange] — A drummer's drum, hide unbroken, sticks tied on.
24. **A sniper's ghillie veil** [Strange] — A sniper's ghillie veil — or this era's face of it: leaf-cloak, wolf-cape.
25. **A signal rocket** [Volatile] — A signal rocket, red, in a waxed tube.

### Item sheet 2/2 (5×5 grid, 25 cells)

1. **A live carrier pigeon in a wicker cage** [Volatile] — A live carrier pigeon in a wicker cage, message capsule empty.
2. **The relic every side that's fought here has left behind — roll d4:** [Mythic] — The relic every side that's fought here has left behind — roll d4: 1. The single armistice bell, cast from melted weapons off every side that's ever fought here, that hasn't rung in a generation because nobody's agreed it's earned yet. 2. The roll of the dead of `[the region]`, kept unbroken across every side and era, every name in the hand of the era that fell — with a blank final column the keepers swear ends the fighting the day it's allowed to stay empty. 3. The field-standard of `[the region's fallen power]` — the colors that flew over the last army to think it had won here for good — kept, patched, never quite surrendered. 4. The last letter home of `[a name from the local name-culture]`, a soldier of no side the living agree on, that says plainly what the whole war was actually for — sealed, undelivered, passed from trembling hand to trembling hand.
3. **A mess kit** [Grounded] — A mess kit, dented tin, fork tines slightly bent from prying open more than food.
4. **A spare set of buttons** [Grounded] — A spare set of buttons, brass, polished bright despite everything else looking field-worn.
5. **A trench candle** [Grounded] — A trench candle, short, burns slower than it should for its size.
6. **A sewing kit** [Grounded] — A sewing kit, small, needles rusted but thread intact.
7. **A worn photograph** [Grounded] — A worn photograph, creased through the middle from a shirt pocket over someone's heart.
8. **A trench club** [Grounded] — A trench club, improvised, wrapped leather over a weighted iron head.
9. **A field promotion order** [Textured] — A field promotion order, signed in haste, the name line blank.
10. **A bugle** [Textured] — A bugle, dented, valves true.
11. **A quartermaster's stamp** [Textured] — A quartermaster's stamp, brass, handle worn to the grip of one patient hand.
12. **Enchanted** [Textured] — Enchanted — "The Steady Hand" — a service sidearm, worn smooth at the grip.
13. **Enchanted** [Textured] — Enchanted — "The Watchman's Coat" — a field coat, patched, that keeps its wearer warmer than the fabric should allow.
14. **Enchanted** [Textured] — Enchanted — "The Marcher's Boots" — resoled leather that never quite blisters.
15. **Enchanted** [Strange] — Enchanted — "The Truce Whistle" — brass, plain, that sounds different depending on who's listening.
16. **Enchanted** [Strange] — Enchanted — "The Correspondent's Lens" — a monocle, cracked, that sees past the smoke.
17. **Enchanted** [Strange] — Enchanted — "The Quartermaster's Ledger" — a service ledger that always balances, eventually.
18. **Enchanted** [Strange] — Enchanted — "The Medic's Kit, Unending" — a field medical satchel that's never quite empty.
19. **Enchanted** [Strange] — Enchanted — "The Sentry's Watch" — a pocket watch that runs perfectly, and knows when it matters.
20. **Signature** [Strange] — Signature — "The Long Watch's Rifle" — a service long-arm, worn smooth from a thousand shoulders.
21. **Signature** [Strange] — Signature — "The Faded Standard" — a war banner, faded past recognition of which side it once belonged to.
22. **Signature** [Strange] — Signature — "The Armistice Pen" — a simple fountain pen that's signed more endings than any single hand could remember.
23. **Signature** [Volatile] — Signature — "The Last Charge's Horn" — a battered bugle that sounds ITSELF the moment allies begin to rout.
24. **Consumable** [Grounded] — Consumable — A field ration tin, standard issue, unopened.
25. **Consumable** [Grounded] — Consumable — A field dressing packet, sealed, gauze and antiseptic.
