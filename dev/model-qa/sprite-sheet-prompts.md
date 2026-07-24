---
type: scratch
status: HISTORICAL — roster/style research retained; production formatting superseded 2026-07-24
created: 2026-07-09
---

# Sprite Sheet Prompt Test — 2026-07-09

> **Do not use this as a new production template.** Its obsolete "sprites were retired" claim and
> fixed 5×5 assumption are historical. The live pixel register is `docs/ART-DEPARTMENT.md`; the
> preferred packet grammar derived from the successful realm documents is
> `dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md`.

This was Adam's original test of whether a 2D sprite-sheet lens was worth a second look. Its
realm-style research and returned-art provenance remain useful, but later rulings supersede its
pipeline status and universal numeric format.

**Format:** each sheet is a 5×5 grid of **25 different monsters**, one static expressive-pose
sprite per cell — not an animation cycle, not the same creature 25 times. Creature names +
flavor are pulled straight from `dev/model-qa/realm-bestiary-draft.json` (compiled from
`docs/REALM-BESTIARY-DRAFT.md`), spread across CR tiers (mook → elite → high → apex) so a sheet
shows the realm's whole cast at a glance. Plus a **12th "classic D&D" realm** — generic
Monster-Manual-style fantasy, not tied to any of Genesis's 11 named realms — using open SRD
monster names, for a baseline style comparison.

Pose discipline borrowed from `docs/MODEL-FOUNDRY.md` Law 5: **default to the high-expression
pose** — each creature at its most alive moment (mid-lunge, mid-cast, braced, writhing), never a
neutral T-stance/at-attention. Silhouette (Law 2) and value-contrast (Law 3) carry over too: each
sprite's signature feature must read from a black-shape silhouette alone, with one high-value
zone.

## Shared template

Same skeleton every realm — only the **style block** and **creature list** change:

> 2D pixel-art sprite sheet, 5×5 grid, 25 cells, one distinct static character per cell (NOT the
> same character repeated, NOT an animation sequence), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background
> elements), consistent scale and rendering style across all 25, no drop shadows outside the
> sprite, orthographic side view, each character fully visible from head to toe within its cell
> — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary.
> Every character is posed in an expressive, mid-action stance that captures its essence — mid-
> lunge, mid-cast, braced to strike, snarling, never a neutral T-pose or idle stand. Art style:
> **[realm style block]**. The 25 characters, left-to-right top-to-bottom:
> **[numbered creature list with one-line pose/flavor cue each]**.

---

## 0. Classic D&D — baseline fantasy (control group, not a Genesis realm)

Style block: traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-
adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this
sheet exists purely as a style baseline to compare the 11 Genesis realms against.

25 creatures (SRD open content):
1. Goblin — mid-swing with a jagged shortsword
2. Kobold — flinging a sling stone, crouched
3. Orc — roaring mid-charge, greataxe raised
4. Skeleton — shield raised, sword mid-thrust
5. Zombie — lurching, arms outstretched
6. Giant Rat — baring teeth, mid-scurry
7. Giant Spider — rearing on hind legs, fangs bared
8. Stirge — diving, proboscis extended
9. Gnoll — cackling, spear mid-jab
10. Hobgoblin — disciplined stance, sword mid-parry
11. Bugbear — sneaking, morningstar cocked back
12. Ogre — club raised overhead, mid-roar
13. Ghoul — clawed hands lunging
14. Wight — draining touch reaching out
15. Harpy — mid-dive, talons extended, singing
16. Owlbear — rearing, claws up, beak open
17. Manticore — tail spikes launching mid-flight
18. Gelatinous Cube — engulfing, translucent, a half-dissolved bone visible inside
19. Mimic — chest half-open as a jaw, tongue-lash mid-strike
20. Basilisk — head turning toward camera, petrifying gaze
21. Displacer Beast — tentacles lashing, image-shifted blur
22. Troll — regenerating wound visible, claws raking
23. Wyvern — mid-dive, stinger arced forward
24. Vampire Spawn — mid-lunge, fangs bared, cloak flaring
25. Young Dragon — wings flared, jaws open, roaring

---

## 1. Chrome — *Warriors / TMNT / RoboCop neon-slum*

Style block: gritty low-poly-PS1-inspired pixel art, chunky dithered shading, neon-magenta and
cyan rim light against dark asphalt tones, servo/chrome plating with visible rivets and grime,
high value contrast so each silhouette reads instantly against a dark background.

25 creatures:
1. Sentinel Eyebot — mid-swivel, red scan-line locking on
2. Corridor Turret — barrel tracking, targeting laser visible
3. Short-Circuited Custodian — arm-tool raised, sparking
4. Larval Splice-Bug — mid-scuttle out of a vent
5. Cargo Mule-Bot — charging forward, front plate lowered
6. Chrome-Ganger Grunt — stun baton swinging
7. Bootleg Splicer — coolant-leaking arm raised, snarling
8. Vent Crawler — latched onto a charge port, draining
9. Riot-Frame Sentry — empty exosuit mid-patrol turn, visor glow
10. Patrol Drone Pair — twin drones banking mid-air
11. Overclocked Enforcer — servo-exoskeleton fist cocked back
12. The Unpaid Technician — clipboard in one hand, clawed reach in the other
13. Chrome-Ganger Boss — rail-pistol raised, mismatched grafts visible
14. Splice-Grafted Brute — stitched arm winding up a haymaker
15. Rogue Custodian AI (Manifested) — mop-arm raised like a weapon
16. Nest-Mother Crawler — rearing, egg-cluster abdomen exposed
17. Signal-Ghost — flickering mid-glitch, reaching through static
18. Cold Logic Cultivator — scalpel raised, clinical stare
19. Breach-Sealed Horror — bursting through a containment seam
20. High-Tier Chassis: Warden Model — cracked-casing frame mid-stride, weapon arm extending
21. The Recompiled Director — corrupted holo-face mid-distortion
22. Vault-Class Autoguardian — heavy shoulder cannon powering up
23. Reactor-Bound Colossus — dozens of sensor-eyes all snapping open
24. THE CENTRAL INTELLIGENCE — building-spanning silhouette fragment, cables like tendrils
25. The Last Battery — cracked core glowing at max overload

## 2. Noir — *modern crime, everyone owes somebody*

Style block: high-contrast black-and-white-leaning palette with one desaturated color accent
(neon-sign red or venetian-blind amber), hard rim lighting like a streetlamp through blinds,
long dramatic shadow shapes, trench-coat silhouettes.

25 creatures:
1. Corner Tail — leaning in a doorway, cigarette glow
2. Torpedo — mid-draw from the coat
3. Warehouse Vermin Swarm — boiling out from under a crate
4. Wet-Ledger Runner — clutching a satchel, glancing back
5. Beat Cop on the Take — palm out for a bribe, badge glinting
6. Overdose Husk — staggering, reaching
7. Made Enforcer — knuckles cracking, jaw set
8. Rooftop Shadow — crouched on a ledge, about to drop
9. Wireman — half-turned, listening device visible
10. Loan Shark's Bruiser — bat resting on shoulder, grinning
11. the Fixer — adjusting cufflinks, unreadable
12. the Femme Fatale — mid-turn, revolver hidden in a clutch
13. The Unsolved (Cold-Case Revenant) — bullet-wound glowing, reaching
14. The Canary — mid-song, microphone in hand
15. Torch — match lit, gasoline can in the other hand
16. The Family's Animal (Wiseguy Werewolf) — mid-transformation, suit tearing
17. The Dirty Detective — badge in one hand, gun in the other
18. The Bench Owns You (Corrupt Judge) — gavel raised like a weapon
19. Sewer Hitman — emerging from a manhole, silenced pistol raised
20. The Don (Crime Boss) — seated, hand raised for silence
21. The Silent Assassin — garrote wire stretched taut
22. The Family's War Machine (Armored Motorcade) — grille-forward, headlights blazing
23. The Underboss — coat open, twin pistols drawn
24. The Vampire Kingpin — fangs bared behind a genteel smile
25. The Case That Isn't Closed — a city skyline warped into a screaming face

## 3. Ash — *post-apocalyptic, the world already ended once*

Style block: bleached-bone and rust-orange palette over ash-grey ground, heavy dither/grain for
a scorched-air haze, cracked/scarred skin or plating textures, one ember-glow high-value accent
(a wound, an eye, a jury-rigged light) per sprite.

25 creatures:
1. Rustfall Ghoul — clawed hand outstretched, hunched lunge
2. Scrap-Hound — mid-snarl, mangy and lean
3. Rat-King's Swarm — boiling mass, dozens of eyes
4. Warband Ganger — spiked jacket, pipe-club raised
5. Bomb-Cult Zealot — ordnance strapped, arms spread wide
6. Geiger Wretch — glowing wound, shambling reach
7. Blistered Stalker — hairless hound, mid-pounce
8. Chem-Huffer — pipe swinging, eyes wild
9. Cracked Sentry-Bot — dying chassis, one arm-weapon raised
10. Fuel-Cult Firestarter — torch raised, promethium can in hand
11. Mutant Behemoth Hog — tusks lowered, charging
12. Irradiated Ghast — faster ghoul mid-leap, jaw unhinged
13. Warband Enforcer — chain-wrapped fist cocked back
14. Chitin-Plated Feral — cracked hide catching the light, snarling
15. Power-Rig Brute — hydraulic exo-arm winding a punch
16. Diesel Golem — engine-block torso, exhaust flaring
17. Last-Light Keeper — makeshift rifle braced, defending a generator
18. Convoy Warlord — standing atop a truck, weapon raised
19. Vault Revenant — bursting from a shattered blast door
20. Apex Ferox — ash-pelted predator, mid-leap, jaws wide
21. War-Rig Juggernaut — a dozen dead trucks fused, grille roaring
22. The Long Count — dead soldier, rifle still raised on reflex
23. The Last Warlord — banner raised, scarred and roaring
24. The Half-Life — gargantuan surfacing shape, glowing cracks
25. Slag Crow — glass-feathered, wings flared mid-dive

## 4. Suburb — *Earthbound / Back to the Future, cheerful-lawn wrongness*

Style block: bright manicured-suburbia palette — lawn green, siding beige, porch-light amber —
rendered slightly too clean/saturated to feel safe, soft daytime shading that curdles at the
edges of each creature, one off-key color note breaking the cheerfulness per sprite.

25 creatures:
1. Cul-de-Sac Wanderer — mid-shuffle, same loop, blank stare
2. Porch-Light Moth-Thing — pressed against a screen door
3. HOA Enforcer Drone — clipboard raised, hovering
4. Sprinkler Ghoul — bursting up mid-spray
5. Under-the-Bed Groper — arm reaching from beneath a bed-frame silhouette
6. Overwaving Neighbor — waving, too wide a grin
7. Curfew Light Wisp — drifting, herding gesture
8. Casserole Cultist — dish extended, eyes counting heads
9. Cursed Lawn Sentinel — grinning gnome, rooted stance
10. Vinyl-Sider — barking mid-lunge through a fence
11. The Family Wearing the Skin — three identical smiling faces
12. Perpetual Yard-Sale Hag — reaching over a folding table
13. Riding-Mower Revenant — gripping mower handles, mid-stripe
14. The Man Behind the Rubber Mask — knife raised, unhurried stride
15. Book Club Coven — circle of raised hands, candle glow
16. Backyard Above-Ground Deep One — bursting from a pool
17. Cheerful Renovation Golem — nail-gun arm raised, stitched grin
18. The PTA President — clipboard-weapon raised, smiling wide
19. Lawn-Order Enforcer — shears raised like blades
20. Master of the Block Party — arms spread, host's welcome
21. The Substitute Mailman — letter extended, hollow-eyed
22. Development Overseer — blueprint-arm unfurling, enforcing a shape
23. The Neighborhood Watch Itself — dozens of curtain-eyes
24. The First Homeowner — deed in hand, landlord's stance
25. The Idea of Sunday — a single unblinking eye in a cul-de-sac loop

## 5. Cosmic — *Egyptian / Hermetic / Enochian — true names, seals, sacred geometry*

Style block: deep indigo-and-gold palette, geometric sacred-symbol linework glowing as the
high-value zone, obsidian-dark base tones so gold sigils read as each silhouette's defining
feature, faint starfield dither in the background.

25 creatures:
1. Static-Born Whelp — coiled, half-formed, twitching
2. Deep-Kin Netcaster — net mid-throw, gilled and hunched
3. Echo-Faced Pilgrim — face mid-reshape, hood back
4. Angle-Wrong Creeper — limbs bent at impossible joints
5. Star-Spat Larva — smothering-lunge pose
6. Choir-Static Wisp — formless, humming distortion lines
7. Shoggoth Spawnling — eye budding mid-formation
8. Vault-Drift Serf — bowing, chains visible
9. Gravel-Star Mite — petrifying gaze, small and coiled
10. Wrong-Angle Watcher — mouth-patch open mid-babble
11. Star-Spawn Grazer — half-phased, grazing stance
12. Tentacled Horror of the Drowned Vault — tentacles fanned wide
13. Length-Wrong Herald — mid-syllable, form stretching
14. Basalt Geometer — arms tracing a warping sigil
15. Star-Drunk Colossus-Kin — towering, starlight dripping off limbs
16. Drowned-Tongue Cantor — mid-chant, mouth glowing
17. Devouring Mass of the Drift — shifting mass mid-engulf
18. Void-Touched Ascetic — eyes covered, hands raised in ritual
19. Between-Star Marauder — knight-raider mid-charge through a seam
20. Choir of the Unbuilt Cathedral — a fused congregation, many arms raised
21. Cartographer of Wrong Angles — unrolling a map that bends light
22. Star-Spawn Bishop — mitred silhouette, sermon-gesture
23. The Waking Eye Beneath — single massive eye opening
24. The Sound With No Source — a voice-shape with no body, sigil where a mouth should be
25. The Wonder That Answers Back — a correct-angled void, reaching back

## 6. Theater — *war, any war, unnamed/unflagged (per eraLens)*

Style block: desaturated olive-and-khaki palette, heavy dither for smoke/haze, hard directional
light like a flare or muzzle-flash, worn canvas/leather gear textures, avoid any real-world
flag, insignia, or named-conflict iconography (content-safety — keep it era-neutral).

25 creatures:
1. Line Infantry Shade — rifle braced, holding the line
2. Wire-Cutter Scout — crouched, cutters mid-snip
3. Whistle-Blown Runner — mid-sprint, message clutched
4. Duckboard Vermin Swarm — pouring across a trench floor
5. Mustard Wraith — drifting low, gas-cloud form
6. Barbed Kill-Zone Tangle — wire coiling to snag
7. Musket-Line Regular — volley-fire stance, smoke wreathed
8. Longship Raider — mid-charge, weapon raised, war-cry
9. Jungle Ambusher — half-hidden in canopy, blade drawn
10. Siege-Line Sapper — charge in hand, low crawl
11. Barbed-Wire Horror — impaled, still reaching forward
12. The Unkillable Sergeant — arm raised, ordering the charge
13. Hedgerow Tank-Killer — braced, weapon aimed low
14. Longship Warlord — plated giant, axe raised
15. Trench Ghast — mimicking a whistle, mouth open wrong
16. Jungle Beast-Handler — chain taut, handling a horror off-frame
17. Iron Crawler War-Machine — treads grinding, gun-arm extended
18. Legion Standard-Breaker — banner in one hand, blade in the other
19. Musket-Line Cavalry Officer — sword raised, charging on horseback
20. The Line That Held — a fused trench-line silhouette, refusing to move
21. Longship Draugr-Captain — drowned, commanding a dead crew
22. Jungle War-Engine — feral machine mid-fire
23. Legion Praetor-Revenant — drilling stance, dead-eyed discipline
24. The Whistle — a bone-and-brass mouth given form, sounding
25. No-Man's Bloom — thorned ground-growth reaching upward

## 7. High-Seas — *age of sail, salt and debt to the crew*

Style block: sun-faded teal-and-driftwood palette, salt-spray dither texture, hard bright rim
light off water, weathered rope/canvas/barnacle textures, one high-value wet-glint accent per
sprite.

25 creatures:
1. Press-Ganged Deckhand — cutlass raised under duress
2. Bilge Rat Swarm — pouring from the hold
3. Rope-Scar Cutthroat — cutlass mid-swing, boarding stance
4. Chum-Slick Reef Shark — breaching, jaws wide
5. Waterlogged Deckwalker — dripping, shambling up a chain
6. Rattling Bone-Crew Deckhand — skeleton at attention-turned-strike
7. Fin-Toothed Raider — bursting up from below the rail
8. Kraken-Spawn Squidling — tentacles lashing out
9. Gull-Eyed Wreck Harpy — diving, talons out, luring cry
10. Debt-Marked Bosun — ledger in one hand, whip in the other
11. Deep-Fang Sea-Devil Priest — chanting, trident raised
12. Quartermaster of the Broken Articles — pistol drawn, cold stare
13. Chain-Dragging Drowned Sailor — anchor-chain trailing, reaching
14. Mutinous First Mate — blade mid-swing, bloodied
15. Fogbank Siren — arms open, fog swirling
16. Lantern-Eyed Ghost Captain — translucent, lantern raised
17. Riptide Elemental — a wave given a grasping shape
18. Deep-Baron of the Drowning Grounds — trident raised, commanding a raid
19. Plague-Hulk Zombie Crew — fused mass, dozens of arms
20. Storm-Caller of the Drowned Choir — arms raised, calling down a storm
21. The Admiral of Nowhere — saluting a ghost fleet
22. The Keelbreaker — many heads rearing from the deep
23. The Ghost Ship Herself — a hull given a screaming figurehead face
24. The Fathom-Crowned Leviathan — breaching, crown of coral and bone
25. The Horizon's Own Reckoning — storm-wreathed captain, blade raised to the sky

## 8. Lost-World — *saurian court, three strata, under a volcanic mountain-clock*

Style block: humid jungle-green-and-ember palette, heavy atmospheric dither for volcanic haze,
warm ember rim light against deep shadow strata, scale/hide textures, one glowing high-value
accent (ritual paint, ember-lit eyes) per sprite.

25 creatures:
1. Sand-Choked Sentry — spear braced, endless patrol stance
2. Glyph-Warded Scarab Swarm — boiling out of a cracked seal
3. Sun-Fat Ridgeback — basking lizard, head snapping up
4. Linen-Wrapped Shambler — arms out, retracing a ritual
5. Blind Archive-Gnawer — swarming, sightless and fast
6. Cracked Watch-Idol — stone fist raised mid-patrol
7. Vine-Choked Ambusher — dropping from cover, fangs bared
8. Bone-Orchard Jackal — circling, low growl
9. Curse-Bound Grave Ghoul — paralytic claw extended
10. Snake-Cult Zealot — fangs bared, ritual dagger raised
11. Wall-Set Spear-Guard — bandaged, spear thrust forward
12. Plinth-Fused Sentinel — stone guardian, arm bound to a sanctum wall
13. Riddle-Keeper of the Threshold — sphinx mid-riddle, wings flared
14. Raptor of the Ruined Plaza — pack-hunter, mid-pounce
15. Living Armor-Back — club-tail swinging
16. Horned Terror of the Sacred Road — three horns lowered, charging
17. The Weeping Cistern — corrosive ooze rising from a bath
18. Marching Colossus of the Processional — stone giant mid-march
19. Basalt Gaze of the Garden — snake-haired, posed as a statue about to turn
20. Coiled Warden of the Inner Vault — massive serpent coiled to strike
21. Throne-Ape of the Fallen Grove — enthroned, fist raised
22. Ever-Marching Automaton King — golem king, crown askew
23. Apex Titan-Lizard — jaws wide, ruling stance
24. The Unread King — mummified, waking mid-rise
25. The Standing Monument — colossal stone figure, eyes just opening

## 9. Gloom — *the town that made a deal / Derry*

Style block: muted desaturated palette — sickly yellow streetlight against blue-grey dusk, soft
grain/dither texture, one unnervingly saturated warm accent color per creature (the wrongness
marker), otherwise low-contrast murky background.

25 creatures:
1. Threshold Rat — fleeing, glancing back in fear
2. Guttered Wick — drifting corpse-light, trailing a stolen shadow
3. Grinning Poppet — mid-lurch, fixed too-wide grin
4. Pallid Newcomer — walking its old route, blank-eyed
5. Bone-Rattle Skeleton — reassembled, jerky mid-stride
6. Zealous Initiate — robed, mid-chant, eyes rolled back
7. Static Reflection — mirrored double, a half-second delayed
8. Rot-Handed Ghoul — paralytic bite mid-lunge
9. Moonshackled Cur — half-wolf, mid-snarl
10. Household Poltergeist — furniture mid-throw
11. Cellar Warden — door held shut, key in a clawed hand
12. Full-Moon Shepherd — wolf-faced neighbor, mid-transformation
13. Hollow-Robed Zealot — self-mummified, preaching gesture
14. Possessed Vessel — blinking wrong, head tilted too far
15. The Slow Reflection — ghost one step behind, reaching to catch up
16. Grief-Fed Banshee — wailing, mouth wide, veil trailing
17. Coven Matriarch — arms raised, trading a stolen soul
18. Marrow Revenant — unerring stare locked on one target
19. Candlewax Doppelganger — melting face mid-copy
20. Congregation Made Flesh — a dozen fused bodies, one prayer-gesture
21. Warden of the Cellar Door — bound to a doorway, reaching through it
22. Bell-Tolling Revenant — bell raised, mid-toll
23. The Second Face in the Glass — a mirror-figure stepping out
24. The Uninvited — knocking, patient and still
25. The Possession at the Root — a fused congregation burned into one shape

## 10. Bright-Kingdom — *Nintendo-80s cartoon, power-ups you eat, teeth under the candy*

Style block: saturated cotton-candy-pink and mint palette, clean bold outlines, chunky rounded
shapes like an 8-bit mascot, bright rim light — but with one unsettling detail (sharp teeth,
too-wide eyes) per sprite that reads even in silhouette.

25 creatures:
1. Wind-Up Soldier — mid-march, key still turning
2. Plush Ripper — mid-pounce, mouth open wide
3. Candy-Cane Golem — arm raised, shell cracking to show shards
4. Jack-in-the-Box Stalker — springing out, already too close
5. Laughing-Mask Swarm — masks mid-snap, clattering
6. Balloon-Skin Grub — puffed up, squeaking mid-lunge
7. Carnival Tout — arm out, herding gesture, too-wide grin
8. Static-Charge Kitten — arched back, sparking
9. Marching Peanut — grinning, mid-conga-step
10. Piñata Brute — arms raised, candy shrapnel bursting
11. Carousel Nightmare — rearing, carved mane flying
12. Sugar-Rush Harlequin — mid-cartwheel-strike, jittering
13. Bubblegum Ooze — engulfing lunge, translucent pink
14. Claw-Machine Horror — claw arm descending
15. Funhouse Double — mirror-warped, wearing a stretched smile
16. Ferris-Wheel Horror — wheel-boned, rolling toward camera
17. Cotton-Candy Wraith — drifting haze, reaching for a memory
18. Arcade Sentinel — screen-face glitching, bolt mid-fire
19. Mascot-Suit Puppeteer — hollow suit, tendrils bursting the seams
20. Firework Effigy — building to a finale, sparks trailing
21. The Ringmaster — top hat tipped, whip mid-crack
22. The Overwound Nutcracker — jaw snapping down
23. Vending-Machine Colossus — coin slot glowing, fist extending
24. The Birthday King — crowned, party-favor weapon raised
25. The Grinning Prize — plush titan, a dozen button-eyes snapping open

## 11. Frontier — *Western, a line nobody enforces*

Style block: sun-bleached sepia-and-rust palette, dusty film-grain texture, hard midday rim
light casting long low-value shadows, weathered leather/canvas/tin textures with visible wear.

25 creatures:
1. Dust-Broke Drifter — trembling draw, about to break and run
2. Line-Rider — rifle braced, brave only because of the pack behind
3. Coyote-Thing — wrong-jointed, mid-cackle
4. Scarecrow Sentinel — twitching upright, unnaturally still otherwise
5. Claim-Jumper — rifle leveled over a forged deed
6. Company Enforcer — collection notice in one hand, club in the other
7. Buzzard-Kin — wings spread, circling low
8. Dust Devil — funnel mid-scour, debris caught in it
9. Debt-Collector Ghoul — ledger raised, clawed reach
10. Gunslinger's Shade — mid-quickdraw, reliving the duel
11. Iron Horse Wreck-Golem — salvaged-iron bulk, arm-piston raised
12. Bounty Board Regular — unhurried draw, poster-flat stare
13. Card-Sharp Killer — cards fanning into a knife-throw
14. Rustler Pack Boss — lasso mid-swing, shouting orders
15. Sidewinder Broodmother — coiled, half-a-mile of brood behind her
16. Marshal's Ghost — translucent, badge glinting, gun raised
17. Cattle-Baron's Enforcer — twin pistols drawn, duelist's stance
18. Boneyard Preacher — bible raised like a weapon, buried-alive eyes
19. Stampede-Cursed Longhorn — horns lowered, charging
20. Vault-Keeper Wight — clutching a strongbox, guarding stare
21. Noon-Duel Gunfighter — hand hovering at the hip, sun overhead
22. Rail Baron's War-Machine — armored car-frame, gun-barrel extending
23. Draw-at-Noon Revenant — drawing again, endlessly, at high noon
24. The Last Honest Marshal — badge fused to the chest, standing the line
25. The Noon Reckoning — towering fiend, shadow shaped like a gallows

---

## Suggested test order

Start with **Classic D&D, Chrome, and Bright-Kingdom** — the control baseline plus two maximally
distinct genre palettes — to check whether ChatGPT can actually hold 25 distinct, consistently-
scaled, non-repeating characters in one 5×5 sheet before committing to all 12. If the model
starts repeating poses/silhouettes or drifting scale across the grid, tighten the template (e.g.
split into two 5×3 half-sheets) before burning more generations on the rest.

## Full-coverage batches (every monster + a themed NPC roster, per realm)

Once the style/layout is validated above, `dev/model-qa/sprite-sheets/` has the complete set:
**every creature in each realm's bestiary** (not just the 25 samples above) plus **a realm-
themed NPC roster** pulled from the game's own 35-archetype NPC Role Spine + each realm's
skin/adds, both batched into 25-per-sheet prompts using the same shared template and style
blocks as this file — **including a 12th `fantasy.md` for Genesis's actual default,
unreskinned world** (the base 510-entry Monster Manual bestiary + the raw unmodified NPC Role
Spine, no genre reskin — distinct from the "Classic D&D" hand-picked sample list above this
line, which was just a small control group). 76 monster sheets + 24 NPC sheets across all 12
realms — see [`sprite-sheets/INDEX.md`](sprite-sheets/INDEX.md) for the full link list and sheet
counts.

Pose cues in the full-coverage batches are auto-derived from the bestiary's own flavor/summary
text (monsters) and the role spine's note field (NPCs) — not hand-authored per character at
that scale. If a specific sheet needs bespoke poses (worth it for apex/boss-tier creatures or a
realm's signature NPCs), do that pass by hand on just that sheet before generating it.
