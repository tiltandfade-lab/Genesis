# DRESSING-GEN — noir dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `noir-flora-dg-01.png` — 20 cards, 5x4 — noir flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: rain-slick noir port city — sepia and soot, streetlamp monochrome.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/noir-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: desaturated sepia-grayscale palette.
Subjects, one per cell, left to right then top to bottom:
1. rain-slick weed tuft pushing through a gutter crack
2. dying potted fern in a fire-escape window, sepia-grey
3. alley ivy climbing a soot-stained brick wall
4. struggling street-tree sapling caged in a rusted tree-pit grate
5. wilted flower box hanging off a cracked windowsill
6. rain-fed moss creeping along a drainpipe seam
7. tall weed patch choking a fenced vacant lot
8. vine climbing a rusted fire escape ladder
9. lone curb tree, leaves blackened by exhaust soot
10. sidewalk crack weed cluster growing between paving stones
11. pale mold bloom crawling up a basement stairwell wall
12. dead rooftop garden bed, soil gone hard and cracked
13. forgotten office hanging-plant, browning under fluorescent haze
14. damp alley mushroom cluster sprouting from rotted crates
15. clipped park shrub gone shaggy beside a broken bench
16. shelf fungus growing off a rusted drainpipe joint
17. clipped cemetery hedge visible past a wrought-iron fence
18. smoke-stained ivy blackening as it climbs a tenement wall
19. ALT of 'rain-slick weed tuft pushing through a gutter crack' — different shape/growth/wear, same kind
20. ALT of 'dying potted fern in a fire-escape window, sepia-grey' — different shape/growth/wear, same kind
```

## `noir-clutter-dg-02.png` — 16 cards, 4x4 — noir clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: rain-slick noir port city — sepia and soot, streetlamp monochrome.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/noir-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: desaturated sepia-grayscale palette.
Subjects, one per cell, left to right then top to bottom:
1. rain-soaked newspaper drift pasted flat against the curb
2. broken umbrella skeleton caught in a storm drain
3. scattered cigarette butt pile beneath a streetlamp
4. empty liquor bottle rolled into an alley corner
5. torn crime-scene tape fluttering from a lamppost
6. cracked leather suitcase, contents spilled across the sidewalk
7. fallen shard of a flickering neon marquee letter
8. stack of chipped milk crates outside a service door
9. severed payphone cord dangling from a gutted booth
10. scatter of spent shell casings near a chalk outline
11. rain-soaked fedora crushed flat in the gutter
12. boarded window frame, one plank hanging loose
13. stack of surveillance photographs pinned to a corkboard
14. street-level clutter drift caught in a manhole's steam plume
15. ALT of 'rain-soaked newspaper drift pasted flat against the curb' — different shape/growth/wear, same kind
16. ALT of 'broken umbrella skeleton caught in a storm drain' — different shape/growth/wear, same kind
```

## `noir-objects-dg-03.png` — 25 cards, 5x5 — noir interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: rain-slick noir port city — sepia and soot, streetlamp monochrome.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/noir-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: desaturated sepia-grayscale palette.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — frosted-glass office door.
2. door, ajar state — frosted-glass office door.
3. door, open state — frosted-glass office door.
4. door, broken state — frosted-glass office door.
5. chest, closed state — in the realm's own material language
6. chest, open state — in the realm's own material language
7. chest, looted state — in the realm's own material language
8. lever, left state — in the realm's own material language
9. lever, right state — in the realm's own material language
10. shrine, dormant state — in the realm's own material language
11. shrine, lit state — in the realm's own material language
12. campfire, unlit state — in the realm's own material language
13. campfire, lit state — in the realm's own material language
14. campfire, dead state — in the realm's own material language
15. trap, hidden state — spring-loaded bear trap under debris
16. trap, sprung state — spring-loaded bear trap under debris
17. portal, sealed state — in the realm's own material language
18. portal, active state — in the realm's own material language
19. container, intact state — in the realm's own material language
20. container, cracked state — in the realm's own material language
21. container, broken state — in the realm's own material language
22. ALT of 'door, shut state — frosted-glass office door.' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — frosted-glass office door.' — different shape/growth/wear, same kind
24. ALT of 'door, open state — frosted-glass office door.' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — frosted-glass office door.' — different shape/growth/wear, same kind
```
