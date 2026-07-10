# DRESSING-GEN — high-seas dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `high-seas-flora-dg-01.png` — 20 cards, 5x4 — high-seas flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: drowned age-of-sail realm — brine, barnacle crust, kelp rot, weathered rope and teal spectral glow.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/high-seas-style-ref.png's grain and palette discipline exactly.
Palette: muted brine palette with rich teal/brass accents.
Subjects, one per cell, left to right then top to bottom:
1. thick kelp tangle draped over a barnacled beam
2. barnacle crust cluster climbing a mooring post
3. drifting seagrass tuft rooted in wet planking
4. brine-eaten coral lump, teal-glowing at the fractures
5. rotted rope vine coiled and slick with algae
6. pale anemone bloom pulsing faint teal in tidewater
7. barnacled driftwood snag half-buried in wet sand
8. dense mussel shell clump crusting a hull plank
9. pale spectral seaweed drifting despite no current
10. salt-hardy crabgrass ringing a shallow tidepool
11. broken mast stump entirely crusted in barnacle growth
12. drift-weed tangled in a rotted fishing net
13. brine-slick moss coating a lower deck plank
14. teal-glowing coral branch jutting from a wrecked hull
15. salt-bleached sea oat tuft bending in the brine wind
16. kelp strand arching between two mooring posts
17. tidepool faintly lit by drifting bioluminescent plankton
18. brine-rotted lily-pad-like algae mat afloat in a bilge pool
19. ALT of 'thick kelp tangle draped over a barnacled beam' — different shape/growth/wear, same kind
20. ALT of 'barnacle crust cluster climbing a mooring post' — different shape/growth/wear, same kind
```

## `high-seas-clutter-dg-02.png` — 16 cards, 4x4 — high-seas clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: drowned age-of-sail realm — brine, barnacle crust, kelp rot, weathered rope and teal spectral glow.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/high-seas-style-ref.png's grain and palette discipline exactly.
Palette: muted brine palette with rich teal/brass accents.
Subjects, one per cell, left to right then top to bottom:
1. cracked brass compass, needle spinning loose in brine fog
2. rotted rope coil, fibers unraveling to green slime
3. broken ship's wheel, half its spokes snapped off
4. brine-soaked cargo barrel, staves bowed and weeping salt
5. heavy anchor chain heap, links crusted in rust and barnacle
6. cracked ship lantern, glass shattered, teal glow still faint
7. torn fishing net tangled around a broken cleat
8. waterlogged chest, lock rusted solid, lid swollen shut
9. rusted grappling hook still trailing a snapped line
10. splintered hull plank torn loose, edges soft with rot
11. cracked ship-in-a-bottle, tiny sails moldering inside
12. fallen crow's nest debris, wicker basket half-collapsed
13. faint teal bioluminescent stain pooled in a deck seam
14. tattered sailcloth draped and dripping brine
15. ALT of 'cracked brass compass, needle spinning loose in brine fog' — different shape/growth/wear, same kind
16. ALT of 'rotted rope coil, fibers unraveling to green slime' — different shape/growth/wear, same kind
```

## `high-seas-objects-dg-03.png` — 25 cards, 5x5 — high-seas interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: drowned age-of-sail realm — brine, barnacle crust, kelp rot, weathered rope and teal spectral glow.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/high-seas-style-ref.png's grain and palette discipline exactly.
Palette: muted brine palette with rich teal/brass accents.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — in the realm's own material language
2. door, ajar state — in the realm's own material language
3. door, open state — in the realm's own material language
4. door, broken state — in the realm's own material language
5. chest, closed state — barnacled sea-chest.
6. chest, open state — barnacled sea-chest.
7. chest, looted state — barnacled sea-chest.
8. lever, left state — in the realm's own material language
9. lever, right state — in the realm's own material language
10. shrine, dormant state — in the realm's own material language
11. shrine, lit state — in the realm's own material language
12. campfire, unlit state — in the realm's own material language
13. campfire, lit state — in the realm's own material language
14. campfire, dead state — in the realm's own material language
15. trap, hidden state — in the realm's own material language
16. trap, sprung state — in the realm's own material language
17. portal, sealed state — in the realm's own material language
18. portal, active state — in the realm's own material language
19. container, intact state — brine-crusted barrel
20. container, cracked state — brine-crusted barrel
21. container, broken state — brine-crusted barrel
22. ALT of 'door, shut state — in the realm's own material language' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — in the realm's own material language' — different shape/growth/wear, same kind
24. ALT of 'door, open state — in the realm's own material language' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — in the realm's own material language' — different shape/growth/wear, same kind
```
