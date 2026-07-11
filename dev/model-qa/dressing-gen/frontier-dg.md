# DRESSING-GEN — frontier dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `frontier-flora-dg-01.png` — 20 cards, 5x4 — frontier flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: wild-west frontier — sun-bleached earth tones, period costume, weathered wood and leather.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/frontier-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: earthy palette, species-true color for animals.
Subjects, one per cell, left to right then top to bottom:
1. tall spined saguaro standing sentinel over sun-bleached earth
2. dry tumbleweed ball caught against a fence line
3. gnarled mesquite scrub, thorned branches low and wide
4. sun-bleached prairie grass tuft bent by dry wind
5. sharp yucca blade cluster jutting from cracked earth
6. withered grapevine curling dead over a fence rail
7. lone cottonwood tree marking a dry creek bed
8. silvery sagebrush clump, low and wind-worn
9. barrel cactus cluster ringed with sun-bleached bone
10. dried corn stalk row leaning against a porch rail
11. pale jimsonweed patch blooming trumpet-white at dusk
12. short buffalo grass mat cropped low by cattle
13. cotton stalk cluster gone to seed, tufts drifting loose
14. sun-bleached driftwood root snarl half-buried in sand
15. desert willow, thin trunk and pale pink blooms
16. Russian thistle patch, spined and sun-cracked
17. towering agave flower spike, once every hundred years
18. tanned hide drape hung to cure over a rail
19. ALT of 'tall spined saguaro standing sentinel over sun-bleached earth' — different shape/growth/wear, same kind
20. ALT of 'dry tumbleweed ball caught against a fence line' — different shape/growth/wear, same kind
```

## `frontier-clutter-dg-02.png` — 16 cards, 4x4 — frontier clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: wild-west frontier — sun-bleached earth tones, period costume, weathered wood and leather.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/frontier-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: earthy palette, species-true color for animals.
Subjects, one per cell, left to right then top to bottom:
1. cracked wagon wheel half-sunk in trail dust
2. scatter of spent brass casings glinting in the dirt
3. frayed hitching rope coiled at a splintered post
4. dented tin canteen, cork stopper long gone
5. cold branding iron leaned against a corral rail
6. weathered wooden grave marker leaning at the roadside
7. dropped saddlebag pile, leather cracked and sun-hardened
8. hanging jerky-drying rack, strips long since eaten
9. single rusted spur half-buried by drifted sand
10. split rain barrel, staves bowed and leaking dry rot
11. leaning hay rick, straw scattered by wind
12. stack of sun-warped fence planks against a wall
13. coiled dry lariat rope hung on a rusted nail
14. splintered target board pocked with old bullet holes
15. ALT of 'cracked wagon wheel half-sunk in trail dust' — different shape/growth/wear, same kind
16. ALT of 'scatter of spent brass casings glinting in the dirt' — different shape/growth/wear, same kind
```

## `frontier-objects-dg-03.png` — 25 cards, 5x5 — frontier interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: wild-west frontier — sun-bleached earth tones, period costume, weathered wood and leather.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/frontier-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: earthy palette, species-true color for animals.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — in the realm's own material language
2. door, ajar state — in the realm's own material language
3. door, open state — in the realm's own material language
4. door, broken state — in the realm's own material language
5. chest, closed state — iron-banded strongbox
6. chest, open state — iron-banded strongbox
7. chest, looted state — iron-banded strongbox
8. lever, left state — in the realm's own material language
9. lever, right state — in the realm's own material language
10. shrine, dormant state — in the realm's own material language
11. shrine, lit state — in the realm's own material language
12. campfire, unlit state — trailside cookfire with spit
13. campfire, lit state — trailside cookfire with spit
14. campfire, dead state — trailside cookfire with spit
15. trap, hidden state — in the realm's own material language
16. trap, sprung state — in the realm's own material language
17. portal, sealed state — in the realm's own material language
18. portal, active state — in the realm's own material language
19. container, intact state — powder keg
20. container, cracked state — powder keg
21. container, broken state — powder keg
22. ALT of 'door, shut state — in the realm's own material language' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — in the realm's own material language' — different shape/growth/wear, same kind
24. ALT of 'door, open state — in the realm's own material language' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — in the realm's own material language' — different shape/growth/wear, same kind
```
