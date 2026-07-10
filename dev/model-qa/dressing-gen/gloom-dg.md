# DRESSING-GEN — gloom dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `gloom-flora-dg-01.png` — 20 cards, 5x4 — gloom flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: funerary gloom realm — desaturated mourning tones, bone, wilt.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/gloom-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: narrow desaturated grey-brown palette.
Subjects, one per cell, left to right then top to bottom:
1. brittle dead hedge row, leafless and grey-brown
2. withered cattail stand at the edge of a stagnant pool
3. wilted funeral rose bouquet, petals browning at the edge
4. black mourning-vine climbing a cracked headstone
5. pale bone-colored lichen crusting a crypt wall
6. funeral wreath gone to dust, ribbon still faintly legible
7. leafless weeping willow, branches drooping like mourning arms
8. patchy grave turf, unevenly settled over old plots
9. funerary moss creeping over a fallen grave slab
10. black briar patch tangled through an iron cemetery fence
11. dead ivy sheeting, once green now bone-brown and brittle
12. pale nightshade cluster growing between grave rows
13. tree root cracking through a cemetery flagstone
14. tall wither-stalk reed, seed head gone to grey fluff
15. funerary bell-flower cluster, drooping heads chiming faintly
16. pale funerary fungus crust on a rotted coffin plank
17. stunted orchard tree, fruit shriveled black on the bough
18. desaturated grey fern curled tight, never quite unfurled
19. ALT of 'brittle dead hedge row, leafless and grey-brown' — different shape/growth/wear, same kind
20. ALT of 'withered cattail stand at the edge of a stagnant pool' — different shape/growth/wear, same kind
```

## `gloom-clutter-dg-02.png` — 16 cards, 4x4 — gloom clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: funerary gloom realm — desaturated mourning tones, bone, wilt.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/gloom-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: narrow desaturated grey-brown palette.
Subjects, one per cell, left to right then top to bottom:
1. cracked tombstone, epitaph worn past reading
2. toppled funeral bell, clapper silent and rusted
3. small bone pile stacked at a crypt threshold
4. cracked coffin lid propped against a mausoleum wall
5. torn black mourning veil snagged on a fence spike
6. cold pooled wax drip beneath a dead vigil candle
7. gravedigger's shovel left stuck upright in loose earth
8. shattered funerary urn, ashes scattered in the dirt
9. bent iron cemetery fence rail, gap wide enough to slip through
10. heap of desiccated funeral wreaths against a wall
11. rusted grave-lantern, glass long broken, wick cold
12. scatter of bent coffin nails in the loose dirt
13. cracked mausoleum door panel, hinge hanging by one screw
14. torn burial shroud rag caught on a low branch
15. ALT of 'cracked tombstone, epitaph worn past reading' — different shape/growth/wear, same kind
16. ALT of 'toppled funeral bell, clapper silent and rusted' — different shape/growth/wear, same kind
```

## `gloom-objects-dg-03.png` — 25 cards, 5x5 — gloom interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: funerary gloom realm — desaturated mourning tones, bone, wilt.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/gloom-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: narrow desaturated grey-brown palette.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — warped crypt door with iron ring
2. door, ajar state — warped crypt door with iron ring
3. door, open state — warped crypt door with iron ring
4. door, broken state — warped crypt door with iron ring
5. chest, closed state — in the realm's own material language
6. chest, open state — in the realm's own material language
7. chest, looted state — in the realm's own material language
8. lever, left state — in the realm's own material language
9. lever, right state — in the realm's own material language
10. shrine, dormant state — funerary shrine with cold candles
11. shrine, lit state — funerary shrine with cold candles
12. campfire, unlit state — in the realm's own material language
13. campfire, lit state — in the realm's own material language
14. campfire, dead state — in the realm's own material language
15. trap, hidden state — tripwire rigged to a grave marker.
16. trap, sprung state — tripwire rigged to a grave marker.
17. portal, sealed state — mausoleum threshold veil.
18. portal, active state — mausoleum threshold veil.
19. container, intact state — in the realm's own material language
20. container, cracked state — in the realm's own material language
21. container, broken state — in the realm's own material language
22. ALT of 'door, shut state — warped crypt door with iron ring' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — warped crypt door with iron ring' — different shape/growth/wear, same kind
24. ALT of 'door, open state — warped crypt door with iron ring' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — warped crypt door with iron ring' — different shape/growth/wear, same kind
```
