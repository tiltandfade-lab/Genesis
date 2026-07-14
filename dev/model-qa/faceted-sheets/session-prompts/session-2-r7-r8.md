You are a sprite-generation worker for the Genesis faceted art program. Your batch:
R7 fiends & celestials (16 sheets) + R8 aberrations & monstrosities (30 sheets). Everything you need is pasted below — do NOT read repo files for subjects;
this prompt is the complete, authoritative source. You have image generation; use it
for every sheet.

Rules — these are the whole job:
1. For each sheet section IN ORDER: submit ONE image-generation call consisting of the
   PASTE BLOCK below with [N] and [N x 887] filled in from that sheet's header, followed
   by that sheet's numbered cell list. Nothing added, nothing substituted, no subjects
   invented. EXCEPTION for sheets whose ids start with fx-: use the effects contract
   noted in the sheet's own section instead of the magenta figure block (hybrid
   faceted+glow, single-frame, black/alpha key); shared-*-decal sheets stay magenta-key
   top-down.
2. Create a fresh directory named r7r8-returns/ before the first call. It must start
   EMPTY — if it already contains files, STOP and report that instead of generating.
   Save each result IMMEDIATELY as r7r8-returns/raw-figures/<first-cell-id>-candidate-001.png.
3. After each save, RE-OPEN the saved file and verify: correct cell count, all four
   corners #FF00FF (for magenta sheets), no figure touching any image edge, every tail
   ends in exactly ONE tip, wyverns bipedal, correct limb counts — AND the tone gates:
   realistic horror dark-fantasy, naturalistic slightly-elongated proportions; if a figure
   reads chibi, cute, bright-saturated, or cartoon-MMO, it is OFF-MODEL: re-roll once,
   then mark FAILED. Do NOT substitute a different subject and do NOT rename another
   file to fill the slot.
4. Append one JSON row per call to r7r8-returns/provenance/r7r8-generation-calls.json:
   {"file": "...", "callId": "...", "cells": ["..."]} — written at save time, not
   reconstructed later.
5. Do NOT run any git commands. Files on disk plus the provenance JSON are your entire
   deliverable; committing happens elsewhere.
6. Your final report is only trusted if it matches the directory exactly. Report:
   sheets attempted, sheets saved, sheets FAILED (with reasons), and the full filename
   list. "Generated 20, saved 17, 3 failed" is a good report. A report claiming more
   than the directory holds will be treated as fabricated — the last run's reports were
   audited file-by-file and the fabrications were found.

=== PASTE BLOCK (use in every call, fill [N] and [N x 887]) ===

> Render a character sprite sheet as a single image: a horizontal strip of **[N] equal vertical
> cells**, total canvas **[N×887]×1774** (each cell 887×1774, a 4:8 portrait). Solid flat magenta
> **#FF00FF** background in every cell — no gradient, no vignette, no scene, no pedestal or base,
> no cast shadow on the ground, no washed-out pink and no darkened purple: pure #FF00FF to the
> corners. One figure per cell, hard invisible cell boundaries, nothing crossing between cells,
> no shared props. Each figure **fully inside its cell with clear margin on all four sides — the
> complete body, head to toe, weapon tips and wingtips and tail included; nothing may touch or
> clip the image edge.** Consistent scale across cells (heads line up); orthographic-leaning 3/4
> view; every figure in an expressive mid-action pose that captures its essence — mid-lunge,
> mid-cast, braced, snarling — never a T-pose or idle stand.
>
> Art style: **crisp, hard-edged TRIANGULATED low-poly faceting** — the entire surface of every
> figure reads as flat triangular planes, like a faceted 3D sculpture; painterly texture and
> material detail live ON the facet planes, never dissolving them. No smooth organic rendering,
> no photoreal, no pixel-art, no soft/mushy half-faceting — if a face, hair, or fabric area goes
> smooth, the render is off-model.
>
> Tone is **realistic horror dark-fantasy**: grim, weathered, unsettling; muted desaturated
> palette of earth, bone, ash, rust, and shadow with at most one controlled accent color per
> figure — never bright saturated hero-fantasy colors. Proportions are **naturalistic and
> slightly elongated** — adult head-to-body ratio around 1:7 to 1:8, lean gaunt silhouettes,
> long limbs and fingers; monsters read as disturbing and anatomically plausible, not cute or
> heroic. HARD NEGATIVE GATES (any of these is an automatic off-model reject): no chibi or
> oversized heads, no stubby limbs, no oversized cartoon weapons or pauldrons, no
> stylized-MMO/action-RPG cartoon look (nothing resembling World of Warcraft, Torchlight,
> Hearthstone, Fortnite, or mobile-game art), no cute/juvenile/big-eyed faces, no candy
> saturation, no thick outlines, no glossy toy-plastic sheen. Do not imitate any specific
> commercial game's promotional art style either — this is its own grounded horror-naturalism
> expressed through the faceted geometry.
>
> Anatomy is strict: **exactly one tail with exactly one tip** on any tailed creature — no
> forked, mirrored, doubled, or floating tail segments; correct limb counts (wyverns are BIPEDAL
> — two legs plus wings; nagas have no arms; no fifth leg, no third wing); tails and wings
> connect to the body at one continuous, plausible joint. The figures, left to right:
> **[numbered cell list from the batch doc]**

=== YOUR SHEETS, IN ORDER ===

### Sheet R7-01 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-arcanaloth` (Medium) — arcanaloth, jackal-headed contract-mage in fine robes, one sealed contract scroll in hand, ink-stained precision. verb: AMENDS-THE-CONTRACT.
2. `spr-fantasy-cambion` (Medium) — half-fiend cambion, human bearing betrayed by horns and furled leather wings, courtly blade, ambition worn openly. verb: CHARMS-THE-COURT.

### Sheet R7-02 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-chasme` (Large) — fly-demon chasme, droning insect wings folded flat along the back, proboscis face, spindly limbs gathered under it. verb: DRONES-CLOSE.

### Sheet R7-03 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-couatl` (Medium) — couatl, feathered rainbow serpent, coils STACKED TIGHT beneath it (§0), wings furled along the coil, ancient patient gaze. verb: WATCHES-OVER.
2. `spr-fantasy-dretch` (Small) — pot-bellied dretch, slack rubbery hide, stubby claws, miserable resentful hunch. verb: COWERS-FORWARD.

### Sheet R7-04 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-empyrean` (Huge) — empyrean, titan-child of gods, beautiful and terrible, weather-of-mood on its face, one great maul grounded like a scepter. verb: STRIDES-GODBORN.

### Sheet R7-05 — 1 cell (Small)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-empyrean-iota` (Small) — empyrean iota, a knee-high fragment-scion of an empyrean, the same terrible beauty at miniature scale — awe, never cute-mascot. verb: MIRRORS-THE-TITAN.

### Sheet R7-06 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-hezrou` (Large) — toad-demon hezrou, wide gulping maw, spined back, squat gathered crouch, visibly reeking. verb: SQUATS-TO-SPRING.

### Sheet R7-07 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-incubus` (Medium) — incubus, beautiful-and-wrong, furled bat wings, tail wrapped, allure as threat — NO pin-up glamour (rule 7). verb: LEANS-TOO-CLOSE.
2. `spr-fantasy-larva` (Medium) — damned larva, bloated maggot body wearing a human face, dragging itself by soft graspings. verb: SQUIRMS.
3. `spr-fantasy-lemure` (Medium) — lemure, molten-flesh mound with a vaguely human agonized face, limbless, the bottom rank of Hell made literal. verb: OOZES-IN-RANK.
4. `spr-fantasy-manes` (Small) — mindless manes, larval damned-soul demon, doughy split hide, needle teeth, blind clawing. verb: CLAWS-BLIND.

### Sheet R7-08 — 2 cells (Small)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-manes-vaporspawn` (Small) — manes mid-dissolution, body sloughing into faceted vapor planes (material, not a smoke plume), face last to go. verb: COMES-APART.
2. `spr-fantasy-mezzoloth` (Medium) — mezzoloth line-mercenary, insectile chitin plates, four arms with a single trident, soldier's economy of motion. verb: HONORS-THE-FEE.

### Sheet R7-09 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-nalfeshnee` (Large) — bloated boar-ape nalfeshnee, undersized feathered wings furled tight, tusked judicial leer. verb: GLOATS.

### Sheet R7-10 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-night-hag` (Medium) — night hag, gaunt blue-black crone, warty hide, iron talons, heartstone pouch at the belt, dream-eater's smile. verb: RIDES-DREAMS.

### Sheet R7-11 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-nightmare` (Large) — nightmare steed, TRUE equine anatomy, mane and fetlocks of faceted flame as material (no plume), no rider, no tack. verb: PAWS-THE-DARK.
2. `spr-fantasy-nycaloth` (Large) — nycaloth shock-trooper, four-armed gargoyle-green brute, one greataxe, bat wings half-furled for the drop. verb: DROPS-FROM-ABOVE.

### Sheet R7-12 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-oni` (Large) — oni ogre-mage, blue-black hide, small horns, single glaive, a night-prowler's patient cunning. verb: STALKS-THE-EAVES.
2. `spr-fantasy-pegasus` (Large) — pegasus, TRUE equine anatomy (no toy-pony drift), white feathered wings half-furled, unshod, unbridled, wary of mortals. verb: ALIGHTS.

### Sheet R7-13 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-pit-fiend` (Large) — pit fiend tyrant-general, great horns, wings half-furled, tail wrapped around the stance, flame-veined hide as material, one heavy mace. verb: COMMANDS-THE-LEGION.
2. `spr-fantasy-planetar` (Large) — planetar, hairless emerald-skinned warrior-angel, wings half-furled, one greatsword, judgment already decided. verb: EXECUTES-JUDGMENT.

### Sheet R7-14 — 3 cells (Medium)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-rakshasa` (Medium) — rakshasa, tiger-headed noble in rich robes, backward-palmed hands (canon), courtesy that is entirely false. verb: SMILES-FALSE.
2. `spr-fantasy-succubus` (Medium) — succubus, same law as the incubus — seduction read as predation, furled wings, tail wrapped tight, weathered adult menace, zero cheesecake. verb: PROMISES-RUIN.
3. `spr-fantasy-ultroloth` (Medium) — ultroloth overseer, elongated featureless egg-smooth head, twin opalescent eyes the only feature, austere robes, no weapon needed. verb: STARES-THROUGH.

### Sheet R7-15 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-unicorn` (Large) — unicorn, true equine anatomy, single spiral horn, forest-warden severity — a guardian that has killed for its glade, no kitsch. verb: WARDS-THE-GLADE.
2. `spr-fantasy-vrock` (Large) — vulture-demon vrock, filth-mottled feathers, wings half-furled, spore-crusted chest, taloned stance. verb: SCREECHES-DOWN.

### Sheet R7-16 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-yochlol` (Medium) — yochlol handmaiden, melted-wax pillar with a single eye and reaching pseudopods, one flank half-shifted toward a drow silhouette. verb: MELTS-BETWEEN-SHAPES.

### Sheet R8-01 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-abominable-yeti` (Huge) — abominable yeti, glacier-scale white ape, ice-crusted fur, frost breath HELD (no plume — rime as material at the jaw). verb: OWNS-THE-PEAK.

### Sheet R8-02 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-ankheg` (Large) — ankheg, chitinous burrowing mantis-beetle, serrated mandibles, soil-crusted plates, many legs gathered beneath it. verb: ERUPTS-FROM-FURROW.

### Sheet R8-03 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-basilisk` (Medium) — basilisk, heavy eight-legged reptile, dull armored hide, the petrifying gaze carried in dead-flat eyes, legs gathered. verb: TURNS-THE-GAZE.
2. `spr-fantasy-brain-crawler` (Tiny) — disembodied brain scuttling on four clawed legs, glistening cortical folds, legs GATHERED under it. verb: SKITTERS-FOR-A-SKULL.

### Sheet R8-04 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-brazen-gorgon` (Large) — brazen gorgon, the brass furnace-bull, seam-glow between plates as material, heat-warped horns. verb: VENTS-HEAT.
2. `spr-fantasy-bulette` (Large) — bulette land-shark, wedge dorsal fin, interlocked armor plates, stumpy powerful digging legs, blunt-skull ram. verb: BREACHES-EARTH.

### Sheet R8-05 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-bulette-pup` (Medium) — bulette pup, half-grown land-shark, oversized fin it hasn't grown into, already all appetite — mean, not cute. verb: TEST-BITES.

### Sheet R8-06 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-carrion-crawler` (Large) — carrion crawler, segmented centipede body, crown of paralytic face-tentacles held close, many legs GATHERED under it. verb: TASTES-THE-DEAD.
2. `spr-fantasy-chimera` (Large) — chimera — lion body, goat and dragon heads flanking the lion's, dragon wings half-furled, three appetites in one frame. verb: STRIKES-THREE-WAYS.

### Sheet R8-07 — 4 cells (Small)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-cockatrice` (Small) — cockatrice, rooster-lizard hybrid, bat wings tucked, serpent tail wrapped, the petrifying peck. verb: PECKS-TO-STONE.
2. `spr-fantasy-cockatrice-regent` (Medium) — (no seed row — describe from the identity slug)
3. `spr-fantasy-darkmantle` (Small) — darkmantle, stalactite-mimic mantle of stony hide, tentacle fringe pulled in, built to drop and smother. verb: DROPS-TO-SMOTHER.
4. `spr-fantasy-death-dog` (Medium) — death dog, two-headed hairless hound, mange-raw hide, both heads low and flanking, the diseased bite implied. verb: FLANKS-ITSELF.

### Sheet R8-08 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-displacer-beast` (Large) — displacer beast, six-legged panther, two barbed shoulder-tentacles wrapped along the flanks, legs gathered, edges that read subtly offset. verb: IS-NOT-WHERE-IT-IS.
2. `spr-fantasy-drider` (Large) — drider, drow torso rising from a spider body, ALL EIGHT LEGS GATHERED UNDER IT (the F1 spider failure — hard gate), one sword. verb: DESCENDS-THE-WEB.

### Sheet R8-09 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-ettercap` (Medium) — ettercap, hunched spider-herder, distended venom jaws, hooked spinneret-clawed hands, legs-and-limbs gathered crouch. verb: TENDS-THE-SNARE.

### Sheet R8-10 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-fomorian` (Huge) — fomorian, curse-warped giant, grotesquely asymmetric limbs, one enormous malign eye, a dragged greatclub. verb: LEVELS-THE-EYE.

### Sheet R8-11 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-gorgon` (Large) — gorgon, iron-plated bull, overlapping metal scales, petrifying breath HELD (no gas plume — a material shimmer at the nostrils at most), head low. verb: LOWERS-THE-HORNS.
2. `spr-fantasy-greater-mimic` (Large) — greater mimic, a whole doorway-and-wall corner caught mid-transformation — timber grain and stonework sloughing into toothed maw and pseudopods, one structure, one identity. verb: HAS-ALWAYS-BEEN-THE-ROOM.

### Sheet R8-12 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-grick` (Medium) — grick, rubbery worm body, four barbed tentacles ringing a snapping beak, coiled compact against cave stone. verb: UNCOILS-TO-SNATCH.

### Sheet R8-13 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-grick-ancient` (Large) — grick ancient, the scarred elder of the warren, thicker mottled coils STACKED TIGHT, beak chipped by decades. verb: GUARDS-THE-WARREN.
2. `spr-fantasy-griffon` (Large) — griffon, eagle fore and lion hind, TRUE animal anatomy in both halves, wings half-furled, talons planted. verb: STOOPS.

### Sheet R8-14 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-hippogriff` (Large) — hippogriff, eagle fore and horse hind, true anatomy, wings half-furled, wary half-wild bearing. verb: REARS-SHY.

### Sheet R8-15 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-hydra` (Huge) — hydra, five serpent heads on necks drawn IN over the body (compact §0 — no starburst of necks), swamp-slick hide, stump-scars promising more. verb: STRIKES-FIVEFOLD.

### Sheet R8-16 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-kraken` (Gargantuan) — kraken, abyssal cephalopod god-beast, armored barnacled mantle, arms COILED TIGHT beneath it, one great lidded eye, fill the frame. verb: RISES-BENEATH-THE-FLEET.

### Sheet R8-17 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-lamia` (Large) — lamia, noble human torso on a lion body, gilded ornaments gone tarnished, the false-oasis welcome. verb: BECKONS-TO-THE-OASIS.
2. `spr-fantasy-manticore` (Large) — manticore, lion body, disturbingly human-ish face, bat wings furled, tail-spikes HELD in the tail (none launched). verb: CIRCLES-TALKING.

### Sheet R8-18 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-merrow` (Large) — merrow, ogre-scale sea-brute, scaled hide and fin-crests, one harpoon, drowned-sailor trophies. verb: DRAGS-UNDER.
2. `spr-fantasy-minotaur-of-the-horned-king` (Large) — minotaur of the Horned King, bull-headed brute, one greataxe, labyrinth-cult brands seared into the hide. verb: RUNS-THE-MAZE.

### Sheet R8-19 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-ogre-howdah` (Large) — ogre howdah, an ogre carrying a crude wooden howdah platform lashed to its back — the structure empty, NO passengers (one identity per cell). verb: CARRIES-THE-TOWER.
2. `spr-fantasy-owlbear` (Large) — owlbear, hooked owl head and feathered fore on a bear's mass, raking claws, the famous bad temper. verb: SCREECH-CHARGES.

### Sheet R8-20 — 2 cells (Small)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-owlbear-cub` (Small) — owlbear cub, downy and already armed — hook beak, needle claws, no fear yet — MEAN, not cute. verb: SNAPS-AT-HANDS.
2. `spr-fantasy-peryton` (Medium) — peryton, antlered stag head on a raptor's winged body, wings half-furled, the heart-hunger in its stare. verb: HUNGERS-FOR-HEARTS.

### Sheet R8-21 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-phase-spider` (Large) — phase spider, pale spider with edges dissolving into offset facet planes (material, not blur), ALL LEGS GATHERED UNDER THE BODY (F1 failure — hard gate). verb: BLINKS-CLOSER.

### Sheet R8-22 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-primeval-owlbear` (Medium) — (no seed row — describe from the identity slug)

### Sheet R8-23 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-purple-worm` (Gargantuan) — purple worm, tunnel-scale annelid, tooth-ringed gullet, stinger tail, body COILED TIGHT so the mass fills the frame compactly. verb: SWALLOWS-WHOLE.

### Sheet R8-24 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-remorhaz` (Huge) — remorhaz, arctic centipede-wyrm, heat-glowing back plates as material, many legs gathered, head reared but drawn over the body. verb: MELTS-THE-ICE.

### Sheet R8-25 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-roc` (Gargantuan) — roc, mountain-scale eagle, TRUE raptor anatomy, wings HALF-FURLED to fit the frame, talons that take oxen. verb: EYES-THE-HERD.

### Sheet R8-26 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-spirit-naga` (Large) — spirit naga, great serpent with a fanged human-ish face, coils STACKED COMPACT, the patience of something that always comes back. verb: PROMISES-RETURN.

### Sheet R8-27 — 1 cell (Small)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-stirge` (Small) — stirge, bat-mosquito bloodsucker, needle proboscis, membranous wings tucked, four gripping legs — mean, not cute. verb: LATCHES.

### Sheet R8-28 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-tarrasque` (Gargantuan) — tarrasque, the apex armored engine of ruin, horned reflective carapace, tail WRAPPED around the stance, upright bulk filling the frame. verb: ENDS-KINGDOMS.

### Sheet R8-29 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-troll-amalgam` (Medium) — (no seed row — describe from the identity slug)
2. `spr-fantasy-troll-limb` (Small) — troll limb, a single severed troll arm regenerating alone — dragging itself on its fingers, a raw bud of new growth at the stump. verb: CRAWLS-TO-REJOIN.

### Sheet R8-30 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-undead-eye-tyrant` (Large) — undead eye tyrant, the rotted orb of a dead tyrant still dreaming — EMPTY central socket, ghost-lit stalks (glow as material), exposed bone plates. verb: DREAMS-DEAD.
2. `spr-fantasy-yeti` (Large) — yeti, white-furred mountain ape, hunched against wind, long claws, the chilling gaze carried in ice-pale eyes. verb: APPEARS-IN-THE-WHITEOUT.
