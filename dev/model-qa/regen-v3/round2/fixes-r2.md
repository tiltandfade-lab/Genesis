# ROUND 2 — fixes (style regen + subject misses + optional pose upgrades)

Style references live in dev/model-qa/regen-v3/style-refs/<realm>-style-ref.png — open the matching realm ref before each sheet.

Instructions for the codex agent. Work through every sheet below IN ORDER, unsupervised.

For each sheet:
1. Generate one image using the EXACT prompt in the code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check the result against ALL of these before moving on:
   a. correct sprite count, solid background, no floor planes, no chibi;
   b. eye-level camera — and for INSECTS / BUGS / TINY CREATURES this is the rule you
      always break: the camera sits at the CREATURE'S own eye level, a worm's-eye
      ground camera looking at it in side or three-quarter PROFILE, as if you are
      another bug standing next to it. NEVER looking down at it like something on a
      floor, table, or specimen tray. If you can see the top of its back more than
      its side, it is WRONG — regenerate;
   c. EXPRESSION (the FFVI standard): every figure must be EXPRESSING something,
      energetically — mid-intent pose, face reads, signature effects selling its
      power. A creature staring blankly at the viewer like it's bombing on stage is
      a FAIL even if everything else is perfect;
   d. STYLE matches the realm reference PNG's pixel grain, grit, and palette discipline.
   If any check fails: regenerate the sheet, up to 3 total attempts, keep the best.
3b. NEVER DISCARD A RENDER: save every attempt you generate, including rejected ones,
   as `<filename>-take2.png`, `-take3.png` beside the winner. Rejected takes are
   harvested later as mood/expression variants — they are paid for, keep them.
4. STYLE: before the first sheet, open and study the realm's reference image named in this packet — every sheet must match its pixel grain, grit, shading and palette discipline exactly.
5. Never edit any other files.

## Sheet 1: `lost-world-huge-v3-03-r2.png` — REPLACES lost-world-huge-v3-03.png (came out photoreal, not pixel art)

```
Create a sprite sheet: a 1 row x 2 columns grid (big roomy cells) of 2 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: prehistoric lost-world jungle — dinosaurs and primeval fauna.
Style: clean crisp PIXEL ART with realistic materials — visible pixel grain and outline weight, NOT photorealistic, NOT smooth gradients. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: rich naturalist jungle palette.
Subjects, one per cell, left to right then top to bottom:
1. spinosaurus mid-stride, jaws parted
2. therizinosaurus rearing, scythe claws spread
```

## Sheet 2: `high-seas-fix-v3-24.png` — fixes the silverfish miss on high-seas-tiny-v3-23

```
Create a sprite sheet: a 1 row x 1 column grid (small square cell) of 1 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: square.
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: drowned age-of-sail realm — brine, barnacle crust, kelp rot.
Style: dense grimy dithered pixel art. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: muted brine palette.
Subjects, one per cell, left to right then top to bottom:
1. silverfish trio - three small silvery INSECTS (wingless, carrot-shaped bodies, three tail bristles) scuttling in a loose cluster; these are bugs, not fish and not people
```

## Sheet 3: `frontier-fix-v3-24.png` — fixes the dog-soldier miss on frontier-tribal-enemies-v3-22

```
Create a sprite sheet: a 1 row x 1 column grid (cell taller than wide) of 1 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait (taller than wide).
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: wild-west frontier — native plains warrior, grounded and dignified, period plains-nations visual vocabulary, never caricature.
Style: clean crisp pixel art with realistic materials. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: earthy palette with warpaint reds and blacks.
Subjects, one per cell, left to right then top to bottom:
1. dog-soldier warrior standing his ground: a long sash trails from his shoulder and is STAKED to the earth beside him, coup stick raised - a warrior who has pinned himself to the spot and will not retreat; no dog in this sprite
```

## Sheet 4: `lost-world-fix-v3-15.png` — fixes the missing bell on lost-world-large-v3-05 r1c2

```
Create a sprite sheet: a 1 row x 1 column grid (big roomy cell) of 1 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape or square.
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: prehistoric lost-world jungle.
Style: clean crisp pixel art with realistic materials. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: rich naturalist jungle palette.
Subjects, one per cell, left to right then top to bottom:
1. domesticated crocodile wearing a visible bronze BELL on a woven collar around its neck, standing calmly
```

## Sheet 5: `cosmic-fix-v3-28.png` — fixes the failed Penrose cube on cosmic-large-v3-07 r1c2

```
Create a sprite sheet: a 1 row x 1 column grid (big roomy cell) of 1 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: square.
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: midnight cosmic-Egyptian realm — deep navy traced with gold constellation sigils.
Style: dense gritty dithered pixel art. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: disciplined navy-and-gold.
Subjects, one per cell, left to right then top to bottom:
1. an IMPOSSIBLE Penrose cube - an optical-illusion cube whose beams pass in front of AND behind each other in a way that cannot exist in 3D; gold-edged stone beams, hovering, faint starfield inside
```

## Sheet 6: `ash-large-v3-03-r2.png` — OPTIONAL - replaces ash-large-v3-03 (all four poses static)

```
Create a sprite sheet: a 2 rows x 2 columns grid (cells wider than tall) of 4 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall).
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: volcanic ash wasteland — basalt hide, ember cracks, rust, toxic biolume.
Style: gritty dithered pixel art. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: grey-ash base with ember orange accents.
Subjects, one per cell, left to right then top to bottom:
1. mutant cow mid-bellow, head thrown back
2. pale bison pawing the ground, head lowered to charge
3. pack bison with luggage mid-stride, leaning into the load
4. gas-mask bull tossing its horns
```

## Sheet 7: `ash-large-v3-04-r2.png` — OPTIONAL - replaces ash-large-v3-04 (three poses static)

```
Create a sprite sheet: a 2 rows x 2 columns grid (cells wider than tall) of 4 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall).
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: volcanic ash wasteland — basalt hide, ember cracks, rust, toxic biolume.
Style: gritty dithered pixel art. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: grey-ash base with ember orange accents.
Subjects, one per cell, left to right then top to bottom:
1. shaggy yak shaking ash from its coat
2. harnessed ox straining forward against the yoke
3. slime-dripping cow swinging its head low
4. spined boar rooting, tusks in the dirt
```

## Sheet 8: `fantasy-large-v3-01-r2.png` — OPTIONAL - replaces fantasy-large-v3-01 (all four poses static)

```
Create a sprite sheet: a 2 rows x 2 columns grid (cells wider than tall) of 4 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall).
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: classic high-fantasy realm — naturalist medieval world.
Style: clean crisp pixel art with realistic materials. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: naturalistic palette, species-true colors.
Subjects, one per cell, left to right then top to bottom:
1. water buffalo wallowing forward, dripping
2. camel with saddle mid-stride, head swaying
3. yak lowering its horns, breath steaming
4. wisent bison pawing the ground
```

## Sheet 9: `fantasy-large-v3-02-r2.png` — OPTIONAL - replaces fantasy-large-v3-02 (both poses static)

```
Create a sprite sheet: a 1 row x 2 columns grid (cells wider than tall) of 2 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall).
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: classic high-fantasy realm — naturalist medieval world.
Style: clean crisp pixel art with realistic materials. Match the pixel grain, grit, shading and palette discipline of the realm's established style exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: naturalistic palette, species-true colors.
Subjects, one per cell, left to right then top to bottom:
1. muskox shaking out its coat mid-turn
2. bison mid-charge, dust at its hooves
```
