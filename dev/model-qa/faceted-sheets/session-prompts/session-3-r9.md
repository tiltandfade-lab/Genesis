You are a sprite-generation worker for the Genesis faceted art program. Your batch:
R9 beasts, all 33 sheets. Everything you need is pasted below — do NOT read repo files for subjects;
this prompt is the complete, authoritative source. You have image generation; use it
for every sheet.

Rules — these are the whole job:
1. For each sheet section IN ORDER: submit ONE image-generation call consisting of the
   PASTE BLOCK below with [N] and [N x 887] filled in from that sheet's header, followed
   by that sheet's numbered cell list. The paste block is VERBATIM LAW (STYLE-CANON.md) —
   do not reword, trim, or summarize any sentence of it. Nothing added, nothing
   substituted, no subjects invented. EXCEPTION for sheets whose ids start with fx-:
   use the effects contract noted in the sheet's own section (hybrid faceted+glow,
   single-frame, black/alpha key); shared-*-decal sheets stay magenta-key top-down.
2. Create a fresh directory named r9-returns/ before the first call. It must start
   EMPTY — if it already contains files, STOP and report that instead of generating.
   Save each result IMMEDIATELY as r9-returns/raw-figures/<first-cell-id>-candidate-001.png.
3. After each save, RE-OPEN the saved file and verify: correct cell count, all four
   corners #FF00FF (for magenta sheets), no figure touching an edge, every tail ends in
   exactly ONE tip, correct limb counts — AND the style laws: lanky house bias, COMPACT
   forward-facing support region (a wide sprawling stance is OFF-MODEL), adult register.
   If a figure reads chibi, cute, wide-based, bright-saturated, or cartoon-MMO: re-roll
   once, then mark FAILED. Do NOT substitute a different subject and do NOT rename
   another file to fill the slot.
4. Append one JSON row per call to r9-returns/provenance/r9-generation-calls.json:
   {"file": "...", "callId": "...", "cells": ["..."]} — written at save time, not
   reconstructed later.
5. Do NOT run any git commands. Files on disk plus the provenance JSON are your entire
   deliverable; committing happens elsewhere.
6. Your final report is only trusted if it matches the directory exactly. Report:
   sheets attempted, sheets saved, sheets FAILED (with reasons), and the full filename
   list. A report claiming more than the directory holds will be treated as fabricated —
   the last run's reports were audited file-by-file and the fabrications were found.

=== PASTE BLOCK (VERBATIM LAW — use in every call, fill [N] and [N x 887]) ===

> Render a character sprite sheet as a single image: a horizontal strip of **[N] equal vertical
> cells**, total canvas **[N×887]×1774** (each cell 887×1774, a vertical 4:8 frame). One figure
> per cell, hard invisible cell boundaries, nothing crossing between cells, no shared props.
> Consistent scale across cells (heads line up); no two figures share a stance.
>
> Visual language: mature, restrained, frightening where canonically appropriate — realistic
> dark-fantasy horror with a stylized triangulated low-poly twist. Large-faceted polygonal
> Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned
> triangular planes. Use smaller facets only around face, eyes, joints, and critical equipment
> landmarks. Believable weight, wear, materials, and adult visual seriousness. This is not World
> of Warcraft, not Baldur's Gate 3 cinematic glamour, not an MMO promotional render, a mobile
> game, a collectible toy, or a cartoon mascot. The house silhouette bias is lanky: longer limbs,
> rawboned frames, weight carried in posture not bulk; a heavy body must belong to a life that
> could actually produce one.
>
> Pose/expression: each figure holds a controlled orthographic front-three-quarter figurine pose
> expressing its listed VERB through center of gravity, spine, head angle, gaze, limbs, and
> negative space. Support region: compact, generally forward-facing — never a wide sprawling
> stance; tails wrap tight, wings furl, legs gather. Keep every pose mechanically usable as a
> standee.
>
> Projection/framing: orthographic front-three-quarter, no lens distortion, full body and every
> extremity visible in its cell, shared ground line, generous padding, no crop. No scenery, floor
> plane, cast shadow, contact shadow, atmosphere, spell effect, unrelated prop, text, border,
> label, or watermark. Do not paint a base or shadow into the source.
>
> Backdrop: perfectly flat solid magenta #FF00FF chroma-key background, completely uniform with
> no gradient, texture, reflection, floor, horizon, or lighting variation. Do not use magenta in
> the figure. Crisp separated edges.
>
> Anatomy is strict: exactly one tail with exactly one tip on any tailed creature — no forked,
> mirrored, doubled, or floating tail segments; correct limb counts (wyverns are BIPEDAL — two
> legs plus wings; no fifth leg, no third wing); tails and wings connect to the body at one
> continuous, plausible joint.
>
> Avoid: fake pixel art, voxel art, micro-triangulation, cracked-glass pattern, random polygon
> noise, chibi proportions, cute mascot treatment, rubber anatomy, inflated muscles, oversized
> shoulders, oversized hands/boots/weapons/teeth, candy saturation, glossy plastic, friendly
> monster grin, generic hero pose, theme-park fantasy, sanitized horror, cosplay cleanliness,
> baked rim light, and poster scene.
>
> The figures, left to right: **[numbered cell list from the batch doc]**

=== YOUR SHEETS, IN ORDER ===

### Sheet R9-01 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-allosaurus` (Large) — allosaurus, brow-horn ridges, three-clawed grasping hands, jaw agape. verb: LUNGES-JAWED.

### Sheet R9-02 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-ankylosaurus` (Huge) — ankylosaurus, armored plate-and-spike back, low-slung body, bone tail club held tight to the flank. verb: SWINGS-THE-CLUB.

### Sheet R9-03 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-axe-beak` (Large) — axe beak, tall flightless bird, huge wedge-blade beak, powerful runner's legs. verb: RUNS-DOWN.

### Sheet R9-04 — 4 cells (Tiny)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-badger` (Tiny) — badger, black-and-white striped face, digging fore-claws, low broad body. verb: DIGS-IN.
2. `spr-fantasy-bat` (Tiny) — bat, leathery wings half-furled around the body, hooked wing-thumbs, oversized ears. verb: CROUCHES-WINGED.
3. `spr-fantasy-black-bear` (Medium) — black bear, forest omnivore, small round ears, straight muzzle profile, low heavy shoulder. verb: ROOTS-AND-RISES.
4. `spr-fantasy-blood-hawk` (Small) — blood hawk, red-tinged plumage, oversized dagger beak, pack-hunter glare. verb: SHRIEKS-TO-FLOCK.

### Sheet R9-05 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-brown-bear` (Large) — brown bear, massive shoulder hump, dished face, long pale fore-claws. verb: REARS-TO-WARN.

### Sheet R9-06 — 1 cell (Tiny)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-cat` (Tiny) — cat, lean alley mouser, one ragged ear, tail wrapped tight — true feline, no cartoon eyes. verb: WATCHES-UNBLINKING.

### Sheet R9-07 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-dire-worg` (Huge) — dire worg, worg grown to nightmare mass, scar-split muzzle, hackles risen in ridges. verb: DRAGS-DOWN.

### Sheet R9-08 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-draft-horse` (Large) — draft horse, heavy harness musculature, feathered fetlocks, thick collar-worn neck, plow harness. verb: LEANS-INTO-THE-LOAD.

### Sheet R9-09 — 1 cell (Small)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-eagle` (Small) — eagle, hooked beak, heavy gripping talons, wings folded high on the back. verb: GRIPS-THE-PERCH.

### Sheet R9-10 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-elephant` (Huge) — elephant, worn yellowed tusks, cracked grey hide, trunk half-raised. verb: SHOULDERS-THROUGH.

### Sheet R9-11 — 4 cells (Tiny)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-flying-snake` (Tiny) — flying snake, feathered rainbow wings half-furled, slim body in a tight coil. verb: RISES-WINGED.
2. `spr-fantasy-goat` (Medium) — wild goat, back-swept ridged horns, ragged beard, narrow sure hooves. verb: BRACES-TO-BUTT.
3. `spr-fantasy-hawk` (Tiny) — hawk, barred chest, hooked beak, wings folded tight. verb: MANTLES.
4. `spr-fantasy-hyena` (Medium) — spotted hyena, shoulders higher than hips, bone-cracking jaw, mottled coat. verb: LOPES-GRINNING.

### Sheet R9-12 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-lion` (Large) — male lion, dark-edged mane, tufted tail, scarred muzzle. verb: CLAIMS-THE-KILL.

### Sheet R9-13 — 1 cell (Tiny)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-lizard` (Tiny) — lizard, dry pebbled scales, splayed clinging toes, tail curled around the body. verb: CLINGS-FLAT.

### Sheet R9-14 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-mammoth` (Huge) — mammoth, long inward-curving tusks (tips WELL inside frame), matted russet coat, high domed skull. verb: BREAKS-THE-SNOW.

### Sheet R9-15 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-mastiff` (Medium) — war mastiff, heavy jowled head, one spiked leather collar, deep chest. verb: HOLDS-THE-LINE.
2. `spr-fantasy-mule` (Medium) — mule, long ears, loaded pannier baskets, planted immovable stance. verb: BEARS-THE-PANNIERS.
3. `spr-fantasy-octopus` (Small) — octopus, sac-like mantle, arms gathered in a compact knot beneath, one slit eye. verb: GATHERS-ITS-ARMS.
4. `spr-fantasy-owl` (Tiny) — owl, flat facial disc, silent-flight feather fringe, talons gripping. verb: TURNS-ITS-HEAD.

### Sheet R9-16 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-panther` (Medium) — panther, sleek night-black coat with shadowed rosettes, long counterweight tail, haunches gathered. verb: COILS-TO-POUNCE.
2. `spr-fantasy-piranha` (Tiny) — piranha, deep blunt head, underslung razor jaw, silver-red flank. verb: SNAPS.

### Sheet R9-17 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-polar-bear` (Large) — polar bear, yellow-white pelt, long low-slung neck, black nose, oar-broad paws. verb: STALKS-THE-ICE.

### Sheet R9-18 — 3 cells (Medium)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-pony` (Medium) — pony, short-coupled and shaggy, thick mane, pack-frame scuffs. verb: PLANTS-ALL-FOUR.
2. `spr-fantasy-pteranodon` (Medium) — pteranodon, long backswept head crest, toothless beak, wing membranes half-furled (compact). verb: FOLDS-TO-LAND.
3. `spr-fantasy-raven` (Tiny) — raven, oil-black plumage, heavy straight beak, head cocked at a glint. verb: EYES-THE-SHINE.

### Sheet R9-19 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-rhinoceros` (Large) — rhinoceros, plated hide folds, lowered nose horn, small suspicious eye. verb: LOWERS-THE-HORN.
2. `spr-fantasy-riding-horse` (Large) — riding horse, lean travel build, light saddle and simple tack, road-dust to the hocks. verb: STANDS-SADDLED.

### Sheet R9-20 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-saber-toothed-tiger` (Large) — saber-toothed tiger, twin down-curved fangs past the chin, bull neck, bobbed tail. verb: PINS-THE-KILL.

### Sheet R9-21 — 3 cells (Tiny)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-scorpion` (Tiny) — scorpion, glossy segmented armor, pincers tucked, stinger arched tight over the back (arch WELL inside frame). verb: ARCHES-THE-STING.
2. `spr-fantasy-seahorse` (Tiny) — seahorse, armored ring segments, curled prehensile tail, tube snout. verb: CURLS-UPRIGHT.
3. `spr-fantasy-spider` (Tiny) — spider, bristled legs gathered tight beneath the body — no wide sprawl — clustered black eyes. verb: HUNCHES-TO-STRIKE.

### Sheet R9-22 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-swarm-of-bats` (Large) — one writhing mass-silhouette of many bats, dense dark core, wing edges readable at the rim. verb: WHEELS-AS-ONE.

### Sheet R9-23 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-swarm-of-crawling-claws` (Medium) — mound of severed animate hands climbing over each other, fingers readable at the edges. verb: CLAMBERS-OVER-ITSELF.

### Sheet R9-24 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-swarm-of-dretches` (Large) — huddle of pot-bellied dretch demonlings pressed into one squabbling mass. verb: SQUABBLES-FORWARD.

### Sheet R9-25 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-swarm-of-insects` (Medium) — boiling knot of beetles and biting insects, carapace glints readable at the rim. verb: BOILS-OVER.

### Sheet R9-26 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-swarm-of-larvae` (Large) — heap of pale human-faced larvae writhing as one mound. verb: WRITHES-PALE.
2. `spr-fantasy-swarm-of-lemures` (Large) — molten heap of half-formed lemure faces and grasping stubs pressed together. verb: OOZES-MOANING.

### Sheet R9-27 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-swarm-of-piranhas` (Medium) — churning ball of piranhas, silver flanks and snapping jaws readable at the surface. verb: CHURNS-RED.
2. `spr-fantasy-swarm-of-rats` (Medium) — flowing mound of rats, dense furred core, tails and noses readable at the edges. verb: FLOWS-OVER.
3. `spr-fantasy-swarm-of-ravens` (Medium) — storm-knot of ravens, beaks and wingtips readable at the rim. verb: MOBS.
4. `spr-fantasy-swarm-of-stirges` (Medium) — cluster of stirges — bat-winged blood-drinker horrors — proboscises readable at the edge. verb: DESCENDS-THIRSTY.

### Sheet R9-28 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-swarm-of-venomous-snakes` (Medium) — braided mass of snakes in one coiled mound, several raised heads readable at the rim. verb: SEETHES-COILED.

### Sheet R9-29 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-tiger` (Large) — tiger, black stripes over deep rust-orange, white cheek ruff, long low body. verb: SLINKS-LOW.

### Sheet R9-30 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-triceratops` (Huge) — triceratops, three horns over a broad bone frill, beaked mouth, planted stance. verb: LOWERS-THE-FRILL.

### Sheet R9-31 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-tyrannosaurus-rex` (Huge) — tyrannosaurus rex, massive deep skull, tiny two-fingered arms, tail counterbalanced tight behind. verb: DESCENDS-TO-BITE.

### Sheet R9-32 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-vulture` (Medium) — vulture, naked wrinkled head, hunched ruff of feathers, patient stoop. verb: WAITS-ON-DEATH.
2. `spr-fantasy-weasel` (Tiny) — weasel, long low body, quick serpentine neck, russet back over cream belly. verb: THREADS-THE-STONES.

### Sheet R9-33 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-worg` (Large) — worg, wolf grown wrong and knowing, ragged dark pelt, heavy jaw, intelligent hateful eyes. verb: CIRCLES-IN.
