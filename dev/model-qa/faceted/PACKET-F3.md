# PACKET-F3 — Fantasy Faceted Figure Factory: the menagerie (wave 3, wide batch)

**Authority + laws:** identical to PACKET-F1 (reread its **§0 ART-DIRECTION RULINGS** and chroma
rule before firing — not repeated here) and the compile template in
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8. This packet authors no new law. It pushes
past the priority queue (F1+F2) into the broad bestiary for a high-volume parallel run.

## DISCIPLINE (identical across all F-packets; F1 audit lessons baked in)
1. **Filenames:** full slug incl. `spr-fantasy-` prefix; multi-cell sheets join their cell slugs. Candidates numbered **per-slug from 001** (never a lane-global counter — F1 lanes 3–5 collided).
2. **Provenance:** per-lane JSON at `fantasy-pilot/provenance/<packet>-<lane>-generation-calls.json` (packet prefix mandatory, e.g. `f8-lane-u-…` — bare lane names collide across packets) (file / callId / cells). Never append to the shared AUDIT.md.
3. **Chroma:** flat uniform magenta **#FF00FF**; the chroma color must never appear IN a figure (F1 shipped a magenta-tinted shoe). No gradient, floor, shadow, or horizon.
4. **Crop:** generous padding — weapon tips, tails, stalks, wingtips, feet WELL inside the frame. Near-edge extremities were F1's most common defect.
5. **Cells:** exactly N figures in N equal vertical 4:8 cells, hard boundaries, no overlap, no shared props, varied poses — no two share a stance. Odd-remainder cells stay pure chroma.
6. **Props:** exactly ONE of each carried item (F1 produced a doubled kite shield).
7. **Faces/finish:** grounded, weathered, adult — no BG3-glamour prettiness (F1 lane-4 drift), no MMO gloss, no candy saturation.
8. **§0 laws:** lanky house bias, girth only when diegetic; COMPACT forward-facing support — wings half-furl, tails/coils wrap tight, legs gather (F1's spider and 3 of 4 dragon candidates failed this); adult register; realistic dark-fantasy horror with a stylized triangulated low-poly twist.
9. **No VFX in sources:** fire/frost/shadow read as faceted MATERIAL, never a particle plume (F1's flaming-skeleton oversprayed its silhouette).
10. Every output is a candidate — `runtimeAdmitted:false`; save to `fantasy-pilot/raw-figures/`; record every generation call id.

**Compile each sheet from the §6.8 template** exactly as F1 did — copy any F1 Lane-1 prompt and
swap the bracketed identity from the seed tables below. Category insertion (§6.8): **monsters**
add combat behavior + horror mechanism + support region; **NPCs** add social attitude + occupation
+ carried objects + restrained pose; **animals/beasts** add locomotion + true scale + no
anthropomorphism.

**Packer's judgment on sheets, bounded by the §0 sheet-economy law** (given the size tag in each
row): **Huge/Large = 1 per sheet** · **Medium = 2 per sheet** · **Small/Tiny = 4 per sheet
(2×2)**. Same category+register per sheet — never mix a beast with an NPC, a fiend with a
construct, a Large solo with Smalls. Odd remainders ride alone rather than cross categories. For
every multi-cell sheet append the standard cell instruction: *"Render [N] SEPARATE figures in [N]
equal vertical 4:8 cells, hard cell boundaries, no overlap, no shared props, one identity per
cell, shared ground line per row, varied poses — no two figures share a stance."*

**No effects in these sources** (§7). A fire elemental is *made of* faceted flame as material;
it is not emitting a VFX plume. A flameskull's fire is its identity, not a particle system.

---

## RUN ORDER

Lanes E–K are mutually disjoint — fire as many in parallel as you have Codex windows. No anchor
gate (language locked by F1). If a whole family returns off-language, hold that family's sheets
and recalibrate its seed row; don't block the others.

---

## LANE E — true giants (Huge/Large solos) — ~12 calls

Compile each from the F1 1D black-dragon prompt shape (Huge solo, compact support, believable
mass, no effect). Mass is diegetic here by definition — commit to it, but keep it grounded weight,
not cartoon bulk.

| slug | size | seed — verb + signature |
|---|---|---|
| spr-fantasy-hill-giant | Huge | dull brutal hill giant, patched hides, uprooted-tree club, gut of endless eating. verb: SWINGS-LOW. |
| spr-fantasy-stone-giant | Huge | ascetic grey stone giant, lean and carved-looking, smooth river-stone in hand. verb: MEASURES-THE-THROW. |
| spr-fantasy-frost-giant | Huge | frost giant raider, blue-white skin, ice-crusted braids, great notched axe. verb: BEARS-DOWN. |
| spr-fantasy-fire-giant | Huge | fire giant smith-warrior, coal-black skin, ember-lit beard, blackened plate, warhammer. verb: STANDS-HEAVY. |
| spr-fantasy-cloud-giant | Huge | aloof cloud giant noble, fine cloudsilk over pale skin, morningstar, chin high. verb: LOOKS-DOWN. |
| spr-fantasy-storm-giant | Huge | storm giant, violet-pale skin, sea-green hair, greatsword, still and immense. verb: HOLDS-THE-HORIZON. |
| spr-fantasy-ettin | Large | two-headed ettin, mismatched filthy heads arguing, two crude weapons. verb: LURCHES. |
| spr-fantasy-ogre | Large | classic dull ogre, hide kilt, spiked club, slack jaw. verb: CLUBS. |
| spr-fantasy-half-ogre-ogrillon | Large | half-ogre brute, more human proportion, scavenged armor, heavy blade. verb: MUSCLES-IN. |
| spr-fantasy-troll | Large | rangy green troll, rubbery hide, long claws, regenerating wounds, hunched lope. verb: RENDS. |
| spr-fantasy-cyclops-oracle | Huge | one-eyed cyclops seer, milk-clouded great eye, bone charms, staff. verb: FORESEES. |
| spr-fantasy-cyclops-sentry | Huge | cyclops guard, boulder in one fist, crude spear, watching. verb: GUARDS-THE-PASS. |

## LANE F — devils & fiends — ~10 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-barbed-devil | Medium | barbed devil, body of hooked spines, wary crouch. verb: BRISTLES. |
| spr-fantasy-bearded-devil | Medium | bearded devil, wriggling tendril-beard, glaive, saw-toothed. verb: LUNGES. |
| spr-fantasy-chain-devil | Medium | chain devil wrapped in animate barbed chains, faceless. verb: LASHES. |
| spr-fantasy-spined-devil | Small | small winged spined devil, tail-spikes ready to throw. verb: DARTS. |
| spr-fantasy-bone-devil | Large | gaunt insectile bone devil, hooked stinger tail, hollow grin. verb: LOOMS. |
| spr-fantasy-horned-devil | Large | winged horned devil, forked tail, huge horns, whip-tail barb. verb: TOWERS. |
| spr-fantasy-ice-devil | Large | insectoid ice devil, chitin rimed with frost, spear. verb: ADVANCES-COLD. |
| spr-fantasy-imp | Tiny | tiny red imp, bat wings, barbed tail, sly. verb: FLITS. |
| spr-fantasy-quasit | Tiny | tiny chaotic quasit, warty green, needle claws. verb: SKITTERS. |
| spr-fantasy-hell-hound | Medium | hell-hound, char-black hide, ember eyes, ember-lit maw (as material, no flame plume). verb: STALKS-HOT. |

## LANE G — elementals, mephits & constructs — ~16 calls

Elementals are made OF their element as faceted material (no VFX). Constructs read as built objects
with weight.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-air-elemental | Large | coalesced whirl of faceted air/dust, humanoid-ish column. verb: SPIRALS. |
| spr-fantasy-earth-elemental | Large | lumbering mass of faceted rock and soil, fists like boulders. verb: HEAVES. |
| spr-fantasy-fire-elemental | Large | figure of faceted flame-planes, no smoke plume, roiling upward form. verb: RAGES. |
| spr-fantasy-water-elemental | Large | curling faceted wave given a torso and reaching arms. verb: SURGES. |
| spr-fantasy-dust-mephit | Small | small grey dusty mephit, ragged wings. verb: SNEERS. |
| spr-fantasy-ice-mephit | Small | small blue ice mephit, jagged frost wings. verb: HISSES. |
| spr-fantasy-magma-mephit | Small | small cracked-crust magma mephit, glowing seams. verb: SPUTTERS. |
| spr-fantasy-smoke-mephit | Small | small smoky mephit, half-dissolving edges (material). verb: CURLS. |
| spr-fantasy-steam-mephit | Small | small scalding steam mephit, wet gleam. verb: SPITS. |
| spr-fantasy-clay-golem | Large | crude wet-clay humanoid, fingermark surface, ritual sigil on brow. verb: TRUDGES. |
| spr-fantasy-flesh-golem | Large | stitched flesh golem, mismatched grey limbs, bolt-scars. verb: SHAMBLES. |
| spr-fantasy-iron-golem | Large | massive riveted iron golem, temple-idol face. verb: STANDS-IMMOVABLE. |
| spr-fantasy-stone-golem | Large | carved stone golem, archaic armor relief, blank eyes. verb: STEPS-DOWN. |
| spr-fantasy-animated-armor | Medium | empty suit of plate standing on its own, visor black. verb: GUARDS. |
| spr-fantasy-animated-flying-sword | Small | a single longsword hovering point-down, no wielder. verb: HOVERS-READY. |
| spr-fantasy-animated-rug-of-smothering | Large | a thick rug reared up like a manta, edges rippling. verb: RISES-TO-SMOTHER. |
| spr-fantasy-clockwork-law-construct-monodrone | Small | one-eyed single-wing modron sphere-drone. verb: TICKS. |
| spr-fantasy-clockwork-law-construct-duodrone | Small | boxy two-armed modron drone. verb: SORTS. |
| spr-fantasy-clockwork-law-construct-tridrone | Medium | three-sided pyramidal modron drone. verb: ENFORCES. |

## LANE H — aberrations & oozes — ~9 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-gibbering-mouther | Medium | writhing mound of mouths and eyes, low and spreading (keep support compact per §0). verb: GIBBERS. |
| spr-fantasy-cloaker | Large | manta-like living cloak, underside of teeth, tail-hook. verb: ENFOLDS. |
| spr-fantasy-otyugh | Large | tentacled dung-beast, three eye-stalk stem, toothed maw. verb: DRAGS-IN. |
| spr-fantasy-rust-monster | Medium | armored insect, feather-antennae, tail-paddle, scuttling. verb: CORRODES. |
| spr-fantasy-mimic | Medium | treasure chest half-transformed, pseudopod and tongue and teeth. verb: SNAPS-SHUT. |
| spr-fantasy-gelatinous-cube | Large | transparent faceted cube of ooze, suspended debris/bones inside. verb: CREEPS. |
| spr-fantasy-gray-ooze | Medium | slick metallic-grey puddle rearing a strike-tendril. verb: SEEPS. |
| spr-fantasy-psychic-gray-ooze | Medium | grey ooze with a faint psionic sheen, warped surface. verb: PROBES. |
| spr-fantasy-flameskull | Tiny | floating skull wreathed in its own faceted green flame (identity, not VFX). verb: DRIFTS-ALIGHT. |

## LANE I — humanoid monster-folk — ~22 calls

All Medium unless noted; pair 2 per sheet within a family/register.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-gnoll-warrior | Medium | hyena-headed gnoll raider, scavenged spear+hide. verb: HOWL-RUSHES. |
| spr-fantasy-gnoll-pack-lord | Medium | bigger scarred gnoll leader, trophy fetishes, flail. verb: DRIVES-THE-PACK. |
| spr-fantasy-gnoll-fang-of-the-beast | Medium | frothing demon-touched gnoll champion. verb: FRENZIES. |
| spr-fantasy-gnoll-demoniac | Large | demon-warped gnoll, distended and clawed. verb: DESECRATES. |
| spr-fantasy-bugbear-warrior | Medium | rangy hairy bugbear, morningstar, hunched ambush build. verb: AMBUSHES. |
| spr-fantasy-bugbear-stalker | Medium | quiet bugbear stalker, dark wraps, blade low. verb: CREEPS. |
| spr-fantasy-bugbear-stalker-strangler | Medium | bugbear strangler, garrote-cord taut. verb: THROTTLES. |
| spr-fantasy-lizardfolk-geomancer | Medium | lizardfolk shaman, bone-and-stone totem staff. verb: CALLS-THE-STONE. |
| spr-fantasy-lizardfolk-sovereign | Medium | crocodilian lizardfolk king, trophy crown, heavy blade. verb: RULES-COLD. |
| spr-fantasy-sahuagin-warrior | Medium | shark-toothed sea devil, trident, finned. verb: SPEARS. |
| spr-fantasy-sahuagin-priest | Medium | sahuagin priest, coral fetishes, clawed benediction. verb: INVOKES. |
| spr-fantasy-sahuagin-baron | Large | huge four-armed sahuagin baron, twin tridents. verb: COMMANDS-THE-DEEP. |
| spr-fantasy-merfolk-skirmisher | Medium | merfolk fighter, coral spear, kelp harness (upright display pose). verb: DARTS. |
| spr-fantasy-merfolk-wavebender | Medium | merfolk tide-caller, shell focus, flowing gesture. verb: BENDS-THE-TIDE. |
| spr-fantasy-troglodyte | Medium | stooped cave troglodyte, crest, stone club, reeking. verb: SKULKS. |
| spr-fantasy-doppelganger | Medium | blank grey shapeshifter caught mid-form, featureless face. verb: BECOMES. |
| spr-fantasy-medusa | Medium | serpent-haired medusa, bow, stone-cold stare, coiled lower stance (compact). verb: FIXES-THE-GAZE. |
| spr-fantasy-harpy | Medium | winged harpy, filthy feathers, taloned, luring posture. verb: SINGS-TO-LURE. |
| spr-fantasy-harpy-matriarch | Medium | elder harpy, bone ornaments, wings spread-then-furled (keep compact). verb: COMMANDS-THE-FLOCK. |
| spr-fantasy-centaur-trooper | Large | centaur soldier, longbow, disciplined stance. verb: WHEELS-AND-LOOSES. |
| spr-fantasy-centaur-warden | Large | centaur guardian, spear+shield, watchful. verb: WARDS. |
| spr-fantasy-satyr | Medium | goat-legged satyr, panpipes, sly stance. verb: PLAYS-A-TRICK. |
| spr-fantasy-satyr-revelmaster | Medium | flamboyant satyr revel-leader, wine and pipes. verb: LEADS-THE-REVEL. |

## LANE J — yuan-ti, vampires & sphinxes — ~14 calls

Mixed registers/sizes — keep each family on its own sheets.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-yuan-ti-infiltrator | Medium | near-human yuan-ti spy, faint scales, hooded robe hiding serpent traits. verb: PASSES-UNSEEN. |
| spr-fantasy-yuan-ti-malison-type-1 | Medium | yuan-ti with a serpent HEAD on a human body, scimitar. verb: HISSES-COMMAND. |
| spr-fantasy-yuan-ti-malison-type-2 | Medium | yuan-ti with serpent ARMS instead of hands, bow. verb: CONSTRICTS. |
| spr-fantasy-yuan-ti-malison-type-3 | Medium | yuan-ti with a serpent lower body instead of legs (compact coil, §0). verb: COILS-UP. |
| spr-fantasy-yuan-ti-abomination | Large | full serpent-bodied yuan-ti abomination, hooded cobra crown, bow. verb: TOWERS-AND-SWAYS. |
| spr-fantasy-vampire | Medium | aristocratic vampire, pale, immaculate dark finery, quiet menace. verb: APPRAISES-PREY. |
| spr-fantasy-vampire-spawn | Medium | feral fledgling vampire, bloodstained, crouched. verb: HUNGERS. |
| spr-fantasy-vampire-familiar | Medium | thrall familiar, human servant marked by fang-scars, watchful. verb: SERVES. |
| spr-fantasy-vampire-nightbringer | Medium | elite warrior-vampire, dark armor, curved blade. verb: DESCENDS. |
| spr-fantasy-vampire-umbral-lord | Medium | shadow-wreathed vampire lord, edges bleeding to dark (material). verb: COMMANDS-NIGHT. |
| spr-fantasy-sphinx-of-lore | Large | gynosphinx, lioness body + human face, feathered wings furled (compact). verb: POSES-THE-RIDDLE. |
| spr-fantasy-sphinx-of-secrets | Large | secretive gynosphinx, veiled gaze, wings tucked. verb: WITHHOLDS. |
| spr-fantasy-sphinx-of-valor | Large | androsphinx, maned lion body, wings furled, roaring resolve. verb: JUDGES. |
| spr-fantasy-sphinx-of-wonder | Tiny | tiny cat-sized winged sphinx-kitten, curious (awe not cute-mascot). verb: WONDERS. |

## LANE K — giant beasts (the giant-animal set) — ~28 calls

True beasts, true canonical anatomy, no anthropomorphism, compact forward-facing support (§0
base law — legs gather, no wide sprawl; the giant-spider especially). Size varies per animal.

(`spr-fantasy-giant-wolf-spider` is F1 lane 5 — do not regenerate; its Step-E HOLD calls for a
tighter legs-gathered regen, handled at F1 follow-up, not here.)

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-giant-rat | S | dog-sized rat, mangy patchy hide, naked tail wrapped close. verb: SWARMS-BOLD. |
| spr-fantasy-giant-bat | L | wolf-sized bat, wings furled tight (§0), ears vast, fang underbite. verb: DROPS-FROM-DARK. |
| spr-fantasy-giant-spider | L | horse-sized web-spider, legs GATHERED under the body (F1 lesson), pale joint bands. verb: DESCENDS-SILENT. |
| spr-fantasy-giant-boar | L | cart-sized boar, tusks like plow blades, bristle ridge. verb: GORES-THROUGH. |
| spr-fantasy-giant-crab | L | man-sized crab, one oversized crusher claw held close, barnacled shell. verb: CLAMPS. |
| spr-fantasy-giant-frog | M | dog-sized frog, wet mottled hide, throat sac half-swelled. verb: GULPS-WHOLE. |
| spr-fantasy-giant-toad | L | pony-sized toad, warted hide, heavy squat mass. verb: SWALLOWS. |
| spr-fantasy-giant-centipede | M | arm-thick centipede coiled compact (§0), lacquered segments, venom forcipules. verb: RIPPLES-FORWARD. |
| spr-fantasy-giant-scorpion | L | horse-sized scorpion, claws in, stinger arched over the back (inside frame, rule 4). verb: PINS-THEN-STINGS. |
| spr-fantasy-giant-wasp | M | dog-sized wasp, wings folded flat, stinger sheathed, oil-sheen chitin. verb: HARRIES. |
| spr-fantasy-giant-weasel | M | hound-sized weasel, low serpentine body, blood-tipped muzzle. verb: SLIPS-AND-BITES. |
| spr-fantasy-giant-lizard | L | horse-sized lizard, splayed climb-ready claws gathered under (§0), dewlap. verb: CLINGS-ANYWHERE. |
| spr-fantasy-giant-owl | L | man-tall owl, wings furled like a cloak, dish face locked on viewer. verb: REGARDS. |
| spr-fantasy-giant-elk | H | tree-tall elk, cathedral antler spread kept inside frame (rule 4), dignified. verb: BARS-THE-ROAD. |
| spr-fantasy-giant-vulture | M | man-sized vulture, bare boiled-looking neck, hunched fold of wings. verb: WAITS-ON-DEATH. |
| spr-fantasy-giant-eagle | L | rider-sized eagle, wings furled, hooked beak, talons planted. verb: MEASURES-THE-DIVE. |
| spr-fantasy-giant-constrictor-snake | H | tree-thick serpent, coils stacked in a compact tower (§0), head risen from center. verb: ENCIRCLES. |
| spr-fantasy-giant-ape | H | house-tall ape, knuckle-planted stance, silver-scarred back. verb: BEATS-THE-GROUND. |
| spr-fantasy-giant-badger | M | boar-sized badger, digging claws, striped war-mask face. verb: UNEARTHS. |
| spr-fantasy-giant-goat | M | horse-sized goat, ram-curl horns, cliff-scarred hide. verb: RAMS. |
| spr-fantasy-giant-crocodile | H | wagon-long crocodile, tail curled alongside (§0), armored scute rows. verb: DEATH-ROLLS. |
| spr-fantasy-giant-shark | H | boat-sized shark, mid-glide arc as its standee pose, scarred gill flank. verb: CIRCLES-BENEATH. |
| spr-fantasy-giant-octopus | L | man-sized octopus, arms coiled under in a compact crown (§0), one appraising eye. verb: ENVELOPS. |
| spr-fantasy-giant-squid | H | ship-menace squid, tentacles gathered to a tapered column (§0), hooked clubs tucked. verb: DRAGS-UNDER. |
| spr-fantasy-giant-seahorse | L | rider-sized seahorse, armored ring segments, tail coiled to a tight anchor curl. verb: HOLDS-CURRENT. |
| spr-fantasy-giant-axe-beak | L | horse-tall flightless bird, cleaver beak, runner's legs. verb: RUNS-DOWN. |
| spr-fantasy-giant-hyena | M | pony-sized hyena, sloped back, bone-cracking jaw agape. verb: LAUGHS-CLOSING. |
| spr-fantasy-giant-fire-beetle | S | dog-sized beetle, glowing thorax glands as faceted MATERIAL (rule 9, no glow VFX). verb: TRUNDLES-LIT. |

Pair by size per the economy; keep aquatic vs land grouping sensible on a sheet.

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L. Consolidate F3 returns into the canonical pilot tree
with per-lane provenance + a Step-E ledger, exactly like F1.

## Still NOT scoped (the true long tail)

- **216 PC variants** (`spr-pc-*`): every ancestry × 12 classes × 2 sexes. A big, mechanical lane
  family of its own — best run as a dedicated packet with a tight PC master prompt (loadout + class
  cues + neutral-ready pose, §6.8 PC insertion).
- **Descriptive realm-animal NPCs** (`spr-fantasy-{wild,dungeon,domestic}-animal-…`, ~76): the
  flavored one-off animals with sentence-long slugs.
- **Townsfolk / kids** (`spr-fantasy-kid-*`, ~20) and remaining civilian NPCs.
- **EFFECTS / VFX** — still needs its own art-direction ruling + non-magenta contract before it can
  be a lane. Flagged for Adam.
