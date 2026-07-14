# PACKET-F9 — Fantasy Faceted Figure Factory: beasts — the mundane menagerie, dinosaurs, mounts & swarms (wave 9, wide batch)

**Authority + laws:** identical to PACKET-F1 (reread its **§0 ART-DIRECTION RULINGS** and chroma
rule before firing — not repeated here) and the compile template in
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8. This packet authors no new law. It clears the
whole mundane bestiary — every ordinary animal, dinosaur, mount, and swarm the realm can field —
in one high-volume parallel run.

**Compile each sheet from the §6.8 template** exactly as F1 did — copy any F1 Lane-1 prompt and
swap the bracketed identity from the seed tables below. Category insertion (§6.8): **animals/
beasts** add locomotion + true scale + no anthropomorphism. For every multi-cell sheet append the
standard cell instruction: *"Render [N] SEPARATE figures in [N] equal vertical 4:8 cells, hard
cell boundaries, no overlap, no shared props, one identity per cell, shared ground line per row,
varied poses — no two figures share a stance."*

**No effects in these sources** (§7). Nothing in this packet emits anything — these are flesh,
fur, scale, and feather. The only "material reads" here are natural ones.

## DISCIPLINE (identical across all F-packets; F1 audit lessons baked in)
1. **Filenames:** full slug incl. `spr-fantasy-` prefix; multi-cell sheets join their cell slugs. Candidates numbered **per-slug from 001** (never a lane-global counter — F1 lanes 3–5 collided).
2. **Provenance:** per-lane JSON at `fantasy-pilot/provenance/<lane>-generation-calls.json` (file / callId / cells). Never append to the shared AUDIT.md.
3. **Chroma:** flat uniform magenta **#FF00FF**; the chroma color must never appear IN a figure (F1 shipped a magenta-tinted shoe). No gradient, floor, shadow, or horizon.
4. **Crop:** generous padding — weapon tips, tails, stalks, wingtips, feet WELL inside the frame. Near-edge extremities were F1's most common defect.
5. **Cells:** exactly N figures in N equal vertical 4:8 cells, hard boundaries, no overlap, no shared props, varied poses — no two share a stance. Odd-remainder cells stay pure chroma.
6. **Props:** exactly ONE of each carried item (F1 produced a doubled kite shield).
7. **Faces/finish:** grounded, weathered, adult — no BG3-glamour prettiness (F1 lane-4 drift), no MMO gloss, no candy saturation.
8. **§0 laws:** lanky house bias, girth only when diegetic; COMPACT forward-facing support — wings half-furl, tails/coils wrap tight, legs gather (F1's spider and 3 of 4 dragon candidates failed this); adult register; realistic dark-fantasy horror with a stylized triangulated low-poly twist.
9. **No VFX in sources:** fire/frost/shadow/necrotic glow read as faceted MATERIAL, never a particle plume (F1's flaming-skeleton oversprayed its silhouette).
10. Every output is a candidate — `runtimeAdmitted:false`; save to `fantasy-pilot/raw-figures/`; record every generation call id.
**Sheet economy (§0):** Large/Huge = 1 per sheet · Medium = 2 per sheet · Small/Tiny = 4 per sheet (2×2). Same category and register per sheet; odd remainders ride alone.

## BEAST REGISTER (binds every lane in this packet)

The binding language reference is F1's **scarred-feral-guard-dog anchor, candidate-003**. Every
figure here holds to it:

- **TRUE animal anatomy.** Zero anthropomorphism — no upright shoulders on a quadruped, no
  human-readable expression, **no cartoon eyes**. A cat is a cat, not a mascot.
- **Compact gathered stance — never a wide side-sprawl.** This is the #1 risk for quadrupeds
  (F1's spider failed exactly this): legs gather under the body, tails and coils wrap tight,
  wings half-furl. Forward-facing standee support per §0.
- Weathered, wild, adult register: scars, matted fur, dust — a working bestiary, not a petting
  zoo.

---

## RUN ORDER

Lanes F9-A through F9-I are mutually disjoint — fire as many in parallel as you have Codex
windows. No anchor gate (language locked by F1). If a whole family returns off-language, hold
that family's sheets and recalibrate its seed row; don't block the others.

---

## LANE F9-A — predators (bears, great cats, worgs, pack scavengers) — 10 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-black-bear | Medium | black bear, forest omnivore, small round ears, straight muzzle profile, low heavy shoulder. verb: ROOTS-AND-RISES. |
| spr-fantasy-brown-bear | Large | brown bear, massive shoulder hump, dished face, long pale fore-claws. verb: REARS-TO-WARN. |
| spr-fantasy-polar-bear | Large | polar bear, yellow-white pelt, long low-slung neck, black nose, oar-broad paws. verb: STALKS-THE-ICE. |
| spr-fantasy-lion | Large | male lion, dark-edged mane, tufted tail, scarred muzzle. verb: CLAIMS-THE-KILL. |
| spr-fantasy-tiger | Large | tiger, black stripes over deep rust-orange, white cheek ruff, long low body. verb: SLINKS-LOW. |
| spr-fantasy-panther | Medium | panther, sleek night-black coat with shadowed rosettes, long counterweight tail, haunches gathered. verb: COILS-TO-POUNCE. |
| spr-fantasy-saber-toothed-tiger | Large | saber-toothed tiger, twin down-curved fangs past the chin, bull neck, bobbed tail. verb: PINS-THE-KILL. |
| spr-fantasy-worg | Large | worg, wolf grown wrong and knowing, ragged dark pelt, heavy jaw, intelligent hateful eyes. verb: CIRCLES-IN. |
| spr-fantasy-dire-worg | Huge | dire worg, worg grown to nightmare mass, scar-split muzzle, hackles risen in ridges. verb: DRAGS-DOWN. |
| spr-fantasy-hyena | Medium | spotted hyena, shoulders higher than hips, bone-cracking jaw, mottled coat. verb: LOPES-GRINNING. |
| spr-fantasy-jackal | Small | jackal, lean scavenger, oversized ears, black saddle marking down the back. verb: SKIRTS-THE-CARCASS. |

**Sheet plan:** brown-bear · polar-bear · lion · tiger · saber-toothed-tiger · worg = six Large
solos; dire-worg = Huge solo; panther + hyena = one Medium pair (pursuit predators); black-bear
rides alone (Medium odd remainder); jackal rides alone (Small odd remainder).

## LANE F9-B — hooved & wild grazers — 4 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-boar | Medium | wild boar, bristled ridge-back, yellowed curved tusks, mud-caked flanks. verb: CHARGES-TUSK-FIRST. |
| spr-fantasy-deer | Medium | deer, slim legs, ears turned to a sound, modest antlers. verb: FREEZES-LISTENING. |
| spr-fantasy-elk | Large | bull elk, broad sweeping antler rack (rack WELL inside frame), shaggy neck mane, high withers. verb: HOLDS-THE-RIDGE. |
| spr-fantasy-goat | Medium | wild goat, back-swept ridged horns, ragged beard, narrow sure hooves. verb: BRACES-TO-BUTT. |
| spr-fantasy-camel | Large | camel, single ragged hump, calloused knees, long disdainful head. verb: PLODS-LOADED. |

**Sheet plan:** elk and camel = Large solos; deer + goat = one Medium pair (grazers); boar rides
alone (Medium odd remainder).

## LANE F9-C — mounts & burden — 8 calls

The three horses must read as three different BUILDS, not one horse re-tacked: **warhorse** =
deep chest, heavy hindquarters, barding straps and studded war tack; **riding-horse** = lean
travel build, light saddle, simple tack; **draft-horse** = heavy harness musculature, collar-worn
neck, feathered fetlocks.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-draft-horse | Large | draft horse, heavy harness musculature, feathered fetlocks, thick collar-worn neck, plow harness. verb: LEANS-INTO-THE-LOAD. |
| spr-fantasy-riding-horse | Large | riding horse, lean travel build, light saddle and simple tack, road-dust to the hocks. verb: STANDS-SADDLED. |
| spr-fantasy-warhorse | Large | warhorse, deep chest and heavy hindquarters, barding straps and studded war tack, shod hoof mid-stamp. verb: STAMPS-FOR-BATTLE. |
| spr-fantasy-pony | Medium | pony, short-coupled and shaggy, thick mane, pack-frame scuffs. verb: PLANTS-ALL-FOUR. |
| spr-fantasy-mule | Medium | mule, long ears, loaded pannier baskets, planted immovable stance. verb: BEARS-THE-PANNIERS. |
| spr-fantasy-mastiff | Medium | war mastiff, heavy jowled head, one spiked leather collar, deep chest. verb: HOLDS-THE-LINE. |
| spr-fantasy-elephant | Huge | elephant, worn yellowed tusks, cracked grey hide, trunk half-raised. verb: SHOULDERS-THROUGH. |
| spr-fantasy-mammoth | Huge | mammoth, long inward-curving tusks (tips WELL inside frame), matted russet coat, high domed skull. verb: BREAKS-THE-SNOW. |
| spr-fantasy-rhinoceros | Large | rhinoceros, plated hide folds, lowered nose horn, small suspicious eye. verb: LOWERS-THE-HORN. |

**Sheet plan:** draft-horse · riding-horse · warhorse · rhinoceros = four Large solos; elephant ·
mammoth = two Huge solos; pony + mule = one Medium pair (burden pair); mastiff rides alone
(Medium odd remainder).

## LANE F9-D — small ground & the snake set — 5 calls

Tiny animals are Tiny per the 2024 MM → 4-up 2×2 sheets. The spider is this lane's named risk:
legs GATHER (F1's spider failed the sprawl law).

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-rat | Tiny | rat, greasy brown fur, naked tail curled close, whiskers testing the air. verb: NOSES-THE-GAP. |
| spr-fantasy-cat | Tiny | cat, lean alley mouser, one ragged ear, tail wrapped tight — true feline, no cartoon eyes. verb: WATCHES-UNBLINKING. |
| spr-fantasy-weasel | Tiny | weasel, long low body, quick serpentine neck, russet back over cream belly. verb: THREADS-THE-STONES. |
| spr-fantasy-badger | Tiny | badger, black-and-white striped face, digging fore-claws, low broad body. verb: DIGS-IN. |
| spr-fantasy-frog | Tiny | frog, wet mottled skin, jumping legs bunched beneath, throat sac. verb: SITS-BUNCHED. |
| spr-fantasy-lizard | Tiny | lizard, dry pebbled scales, splayed clinging toes, tail curled around the body. verb: CLINGS-FLAT. |
| spr-fantasy-scorpion | Tiny | scorpion, glossy segmented armor, pincers tucked, stinger arched tight over the back (arch WELL inside frame). verb: ARCHES-THE-STING. |
| spr-fantasy-spider | Tiny | spider, bristled legs gathered tight beneath the body — no wide sprawl — clustered black eyes. verb: HUNCHES-TO-STRIKE. |
| spr-fantasy-venomous-snake | Tiny | venomous snake, coiled tight, wedge head raised, banded scales. verb: COILS-TO-STRIKE. |
| spr-fantasy-flying-snake | Tiny | flying snake, feathered rainbow wings half-furled, slim body in a tight coil. verb: RISES-WINGED. |
| spr-fantasy-giant-venomous-snake | Medium | giant venomous snake, thick coiled body stacked compact, spread hood, long fangs bared. verb: REARS-HOODED. |
| spr-fantasy-constrictor-snake | Large | constrictor snake, heavy muscled coils stacked compact, blunt head riding the top coil. verb: STACKS-ITS-COILS. |

**Sheet plan:** 2×2 rat + cat + weasel + badger (vermin & mousers); 2×2 frog + lizard + scorpion
+ spider (crawlers); 2×2 venomous-snake + flying-snake with the two remainder cells pure chroma;
giant-venomous-snake rides alone (Medium odd remainder); constrictor-snake = Large solo.

## LANE F9-E — birds & flyers — 4 calls

All wings half-furled per §0 — no full spread, wingtips WELL inside frame.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-bat | Tiny | bat, leathery wings half-furled around the body, hooked wing-thumbs, oversized ears. verb: CROUCHES-WINGED. |
| spr-fantasy-raven | Tiny | raven, oil-black plumage, heavy straight beak, head cocked at a glint. verb: EYES-THE-SHINE. |
| spr-fantasy-owl | Tiny | owl, flat facial disc, silent-flight feather fringe, talons gripping. verb: TURNS-ITS-HEAD. |
| spr-fantasy-hawk | Tiny | hawk, barred chest, hooked beak, wings folded tight. verb: MANTLES. |
| spr-fantasy-blood-hawk | Small | blood hawk, red-tinged plumage, oversized dagger beak, pack-hunter glare. verb: SHRIEKS-TO-FLOCK. |
| spr-fantasy-eagle | Small | eagle, hooked beak, heavy gripping talons, wings folded high on the back. verb: GRIPS-THE-PERCH. |
| spr-fantasy-vulture | Medium | vulture, naked wrinkled head, hunched ruff of feathers, patient stoop. verb: WAITS-ON-DEATH. |
| spr-fantasy-axe-beak | Large | axe beak, tall flightless bird, huge wedge-blade beak, powerful runner's legs. verb: RUNS-DOWN. |

**Sheet plan:** 2×2 bat + raven + owl + hawk (Tiny flyers); 2×2 blood-hawk + eagle (Small) with
the two remainder cells pure chroma; vulture rides alone (Medium odd remainder); axe-beak = Large
solo.

## LANE F9-F — aquatic & shoreline — 8 calls

Aquatics render as display standees — body arced or surfacing, fins and flukes WELL inside frame,
compact support per §0.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-crab | Tiny | crab, thick pitted shell, one oversized crusher claw, legs gathered compact. verb: RAISES-THE-CLAW. |
| spr-fantasy-seahorse | Tiny | seahorse, armored ring segments, curled prehensile tail, tube snout. verb: CURLS-UPRIGHT. |
| spr-fantasy-piranha | Tiny | piranha, deep blunt head, underslung razor jaw, silver-red flank. verb: SNAPS. |
| spr-fantasy-octopus | Small | octopus, sac-like mantle, arms gathered in a compact knot beneath, one slit eye. verb: GATHERS-ITS-ARMS. |
| spr-fantasy-reef-shark | Medium | reef shark, slim grey body, black-tipped fins, mouth slightly agape. verb: CRUISES-THE-SHALLOWS. |
| spr-fantasy-hunter-shark | Large | hunter shark, deep-bodied, scarred snout, rows of teeth showing. verb: RISES-TO-BITE. |
| spr-fantasy-killer-whale | Huge | killer whale, black-and-white saddle patches, tall dorsal fin, conical teeth. verb: SURFACES-HUNTING. |
| spr-fantasy-hippopotamus | Large | hippopotamus, barrel body, yawning tusked gape, ears and eyes set high on the skull. verb: GAPES-A-WARNING. |
| spr-fantasy-crocodile | Large | crocodile, armored scute back, long toothed jaw held low, tail curled alongside the body (compact). verb: LIES-IN-WAIT. |
| spr-fantasy-archelon | Huge | archelon, vast ancient sea turtle, leathery ridged shell, hooked beak, paddle flippers tucked. verb: GLIDES-ANCIENT. |
| spr-fantasy-plesiosaurus | Large | plesiosaurus, long neck curved back over the body (compact), four paddle fins, small toothed head. verb: ARCHES-THE-NECK. |

**Sheet plan:** 2×2 crab + seahorse + piranha + octopus (Tiny/Small tidewater set); reef-shark
rides alone (Medium odd remainder); hunter-shark · hippopotamus · crocodile · plesiosaurus = four
Large solos; killer-whale · archelon = two Huge solos.

## LANE F9-G — dinosaurs — 5 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-allosaurus | Large | allosaurus, brow-horn ridges, three-clawed grasping hands, jaw agape. verb: LUNGES-JAWED. |
| spr-fantasy-ankylosaurus | Huge | ankylosaurus, armored plate-and-spike back, low-slung body, bone tail club held tight to the flank. verb: SWINGS-THE-CLUB. |
| spr-fantasy-pteranodon | Medium | pteranodon, long backswept head crest, toothless beak, wing membranes half-furled (compact). verb: FOLDS-TO-LAND. |
| spr-fantasy-triceratops | Huge | triceratops, three horns over a broad bone frill, beaked mouth, planted stance. verb: LOWERS-THE-FRILL. |
| spr-fantasy-tyrannosaurus-rex | Huge | tyrannosaurus rex, massive deep skull, tiny two-fingered arms, tail counterbalanced tight behind. verb: DESCENDS-TO-BITE. |

**Sheet plan:** ankylosaurus · triceratops · tyrannosaurus-rex = three Huge solos; allosaurus =
Large solo; pteranodon rides alone (Medium odd remainder).

## LANE F9-H — primates & odd — 3 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-ape | Medium | ape, heavy knuckle-walking arms, crested skull, barrel chest. verb: KNUCKLES-FORWARD. |
| spr-fantasy-baboon | Small | baboon, dog-like muzzle, bared canines, ragged mantle of fur. verb: BARES-THE-FANGS. |
| spr-fantasy-bog-twisted-giant-rat | Small | bog-twisted giant rat, swamp-warped and patchy-furred, one milky eye, mud-slick naked tail — corrupted register, but still true rat anatomy. verb: HUNCHES-DRIPPING. |

**Sheet plan:** each rides alone — ape (Medium remainder), baboon (Small remainder, mundane
register), bog-twisted-giant-rat (Small remainder, corrupted register — never share its sheet
with a mundane beast).

## LANE F9-I — SWARMS — 6 calls

**SWARM CONTRACT (special to this lane):** one swarm = ONE cell containing a coherent writhing
MASS silhouette of many small bodies — the mass reads as a single compact standee shape, with
individually-readable members at the edges. NOT a scatter of disconnected critters across the
cell. NOT a cloud filling the frame. Medium-equivalent footprint, **2 swarms per sheet**. (Four
of these carry a bestiary size of Large — they still render at the contract's Medium-equivalent
standee footprint; the contract governs this lane's sheet economy.)

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-swarm-of-bats | Large | one writhing mass-silhouette of many bats, dense dark core, wing edges readable at the rim. verb: WHEELS-AS-ONE. |
| spr-fantasy-swarm-of-crawling-claws | Medium | mound of severed animate hands climbing over each other, fingers readable at the edges. verb: CLAMBERS-OVER-ITSELF. |
| spr-fantasy-swarm-of-dretches | Large | huddle of pot-bellied dretch demonlings pressed into one squabbling mass. verb: SQUABBLES-FORWARD. |
| spr-fantasy-swarm-of-insects | Medium | boiling knot of beetles and biting insects, carapace glints readable at the rim. verb: BOILS-OVER. |
| spr-fantasy-swarm-of-larvae | Large | heap of pale human-faced larvae writhing as one mound. verb: WRITHES-PALE. |
| spr-fantasy-swarm-of-lemures | Large | molten heap of half-formed lemure faces and grasping stubs pressed together. verb: OOZES-MOANING. |
| spr-fantasy-swarm-of-piranhas | Medium | churning ball of piranhas, silver flanks and snapping jaws readable at the surface. verb: CHURNS-RED. |
| spr-fantasy-swarm-of-rats | Medium | flowing mound of rats, dense furred core, tails and noses readable at the edges. verb: FLOWS-OVER. |
| spr-fantasy-swarm-of-ravens | Medium | storm-knot of ravens, beaks and wingtips readable at the rim. verb: MOBS. |
| spr-fantasy-swarm-of-stirges | Medium | cluster of stirges — bat-winged blood-drinker horrors — proboscises readable at the edge. verb: DESCENDS-THIRSTY. |
| spr-fantasy-swarm-of-venomous-snakes | Medium | braided mass of snakes in one coiled mound, several raised heads readable at the rim. verb: SEETHES-COILED. |

**Sheet plan (2 swarms per sheet):** bats + ravens (wings) · rats + insects (floor-flow) ·
piranhas + venomous-snakes (wet writhe) · dretches + lemures (fiend heaps) · crawling-claws +
larvae (grave writhe) · stirges ride alone.

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L. Consolidate F9 returns into the canonical pilot tree
with per-lane provenance + a Step-E ledger, exactly like F1.
