# ROUND 3 — fantasy backfill (relabel-to-art orphans) + monster true-forms

Style reference: dev/model-qa/regen-v3/style-refs/fantasy-style-ref.png — open and study it before the first sheet.

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
4. STYLE: every sheet must match the realm reference's pixel grain, grit, shading and palette discipline exactly.
5. NO BLANK SLOTS: every grid slot listed has a subject (base roles + ALT variants). Draw them all.
6. Never edit any other files.

## `fantasy-backfill-r3-01.png` — 24 sprites, 6 rows x 4 columns — fantasy backfill — roles orphaned by relabel-to-art

```
Create a sprite sheet: a 6 rows x 4 columns grid (portrait cells) of 24 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait (taller than wide, e.g. 1024x1536).
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: classic high-fantasy realm — village and wilderness folk, medieval kit, lived-in cloth and leather.
Style: dense gritty dithered pixel art. Realistic proportions and materials - adult humanoids have legs about half their total height; children are realistically proportioned kids, never chibi. Every character face must have a readable expression at sprite size. Every creature must sell its power and story in one pose: mid-intent stance (snarl, coiled to strike, mid-cast), signature effects where they characterize (drool, sparks, smoke, glow, venom). No mannequin stillness. Touchstone: FFVI-era spritework — maximum character per sprite. Finish: clean-crisp allowed (fantasy tier) but unmistakably pixel art — match dev/model-qa/regen-v3/style-refs/fantasy-style-ref.png. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom. Outline law: selective dark-umber outline on the outer silhouette only.
Palette: rich storybook-medieval color, disciplined but warm.
Subjects, one per cell, left to right then top to bottom:
1. cockatrice regent — crowned rooster-reptile hybrid, wattled head, scaled tail (the TRUE cockatrice form; the old cell drew a dragon)
2. gnomish tinkerer — bearded gnome with clockwork contraptions that mostly work
3. dragonborn temple guard — devout, literal-minded, takes the oath seriously
4. human midwife, elderly — delivered half the village, remembers all of it
5. human miller — dust-covered, counts every sack twice
6. halfling magnate — small folk, big ledgers, bigger debts owed to them
7. tiefling outsider — new in town, watched by everyone, trusts no one yet
8. goliath pampered-elite — soft hands, fine clothes, born uphill of everyone
9. orc recruiter — all promises and handshakes, quota due by winter
10. human secret-scholar — plain clothes, forbidden library under the floorboards
11. tiefling blacksmith's apprentice — still learning, already better than most journeymen
12. elf unofficial-power — no title, yet nothing in town happens without a nod
13. ALT of 'cockatrice regent' — different ancestry/sex take, same role
14. ALT of 'gnomish tinkerer' — different ancestry/sex take, same role
15. ALT of 'dragonborn temple guard' — different ancestry/sex take, same role
16. ALT of 'human midwife, elderly' — different ancestry/sex take, same role
17. ALT of 'human miller' — different ancestry/sex take, same role
18. ALT of 'halfling magnate' — different ancestry/sex take, same role
19. ALT of 'tiefling outsider' — different ancestry/sex take, same role
20. ALT of 'goliath pampered-elite' — different ancestry/sex take, same role
21. ALT of 'orc recruiter' — different ancestry/sex take, same role
22. ALT of 'human secret-scholar' — different ancestry/sex take, same role
23. ALT of 'tiefling blacksmith's apprentice' — different ancestry/sex take, same role
24. ALT of 'elf unofficial-power' — different ancestry/sex take, same role
```

## `fantasy-trueforms-r3-01.png` — 4 sprites, 2 rows x 2 columns — fantasy monster true-forms

```
Create a sprite sheet: a 2 rows x 2 columns grid (big roomy cells) of 4 individual game sprites, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Camera: ground-level eye-level view for every sprite - front, side, or three-quarter angle only. NEVER high-angle, NEVER top-down. For any insect, bug, or tiny creature: worm's-eye ground camera at the creature's OWN eye level, side or three-quarter PROFILE — as if photographed by another bug beside it; if the top of its back is more visible than its side, the angle is wrong. Each subject stands on an implied flat ground line. No floor plane, no ground shadows, no background scenery, no text or labels.
Setting: classic high-fantasy realm — village and wilderness folk, medieval kit, lived-in cloth and leather.
Style: dense gritty dithered pixel art. Realistic proportions and materials - adult humanoids have legs about half their total height; children are realistically proportioned kids, never chibi. Every character face must have a readable expression at sprite size. Every creature must sell its power and story in one pose: mid-intent stance (snarl, coiled to strike, mid-cast), signature effects where they characterize (drool, sparks, smoke, glow, venom). No mannequin stillness. Touchstone: FFVI-era spritework — maximum character per sprite. Finish: clean-crisp allowed but unmistakably pixel art — match dev/model-qa/regen-v3/style-refs/fantasy-style-ref.png. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom. Outline law: selective dark-umber outline on the outer silhouette only.
Palette: rich storybook-medieval color, disciplined but warm.
Subjects, one per cell, left to right then top to bottom:
1. gorgon — the TRUE iron bull, plated metal hide, venting green gas (old cell drew a medusa)
2. grell — floating brain with a beak and trailing barbed tentacles (the TRUE grell form)
3. COLOR ALT of the gorgon — blackened obsidian plating, ember gas
4. COLOR ALT of the grell — pale cave-albino, red-veined
```
