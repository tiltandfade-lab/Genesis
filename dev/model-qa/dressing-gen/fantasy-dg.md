# DRESSING-GEN — fantasy dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `fantasy-flora-dg-01.png` — 20 cards, 5x4 — fantasy flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: classic high-fantasy realm — naturalist medieval world.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/fantasy-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: naturalistic palette, species-true colors.
Subjects, one per cell, left to right then top to bottom:
1. broad naturalist oak, bark deep and roots knuckled above soil
2. common woodland fern cluster, dew-heavy fronds
3. climbing ivy sheeting a stone wall in true green
4. fairy-ring mushroom cluster at the base of a stump
5. dense naturalist bramble hedge, thorned and impassable
6. wildflower patch in honest meadow colors
7. weeping willow drape hanging low over still water
8. moss-capped boulder, green thick on the shaded face
9. cattail reed stand at a marsh's edge
10. grape-vine lattice trained up a wooden trellis
11. purple thistle cluster growing between cobblestone cracks
12. hanging dried-herb bundle, rosemary and sage tied at the stem
13. single oversized red-capped toadstool, white-spotted
14. slender birch sapling cluster, bark peeling white-grey
15. exposed tree-root archway grown over an old footpath
16. lily pad cluster afloat on a still pond edge
17. wild honeycomb nook built into a hollow trunk
18. clipped naturalist hedgerow marking an old garden bound
19. ALT of 'broad naturalist oak, bark deep and roots knuckled above soil' — different shape/growth/wear, same kind
20. ALT of 'common woodland fern cluster, dew-heavy fronds' — different shape/growth/wear, same kind
```

## `fantasy-clutter-dg-02.png` — 16 cards, 4x4 — fantasy clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: classic high-fantasy realm — naturalist medieval world.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/fantasy-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: naturalistic palette, species-true colors.
Subjects, one per cell, left to right then top to bottom:
1. stacked cordwood pile, axe still buried in the top log
2. cracked wagon wheel leaned against a fence post
3. loose scattered hay drift near a barn threshold
4. broken clay pottery shards, once a water urn
5. abandoned iron plow, half-swallowed by weeds
6. empty iron lantern hook swinging from a porch beam
7. kindling stack beside a cold stone hearth
8. tattered heraldic banner, colors faded past recognition
9. cracked wooden shield fragment stuck upright in mud
10. collapsed dry-stone wall section, mossed at the break
11. empty cask, hoops rusted, standing lidless
12. tangled fishing net and tackle heap on a dock plank
13. row of guttered candle stubs on a stone sill
14. tipped wheelbarrow, one wheel gone, spilled soil around it
15. ALT of 'stacked cordwood pile, axe still buried in the top log' — different shape/growth/wear, same kind
16. ALT of 'cracked wagon wheel leaned against a fence post' — different shape/growth/wear, same kind
```

## `fantasy-objects-dg-03.png` — 25 cards, 5x5 — fantasy interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: classic high-fantasy realm — naturalist medieval world.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/fantasy-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: naturalistic palette, species-true colors.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — banded oak plank door
2. door, ajar state — banded oak plank door
3. door, open state — banded oak plank door
4. door, broken state — banded oak plank door
5. chest, closed state — in the realm's own material language
6. chest, open state — in the realm's own material language
7. chest, looted state — in the realm's own material language
8. lever, left state — in the realm's own material language
9. lever, right state — in the realm's own material language
10. shrine, dormant state — mossy stone altar with offering bowl
11. shrine, lit state — mossy stone altar with offering bowl
12. campfire, unlit state — in the realm's own material language
13. campfire, lit state — in the realm's own material language
14. campfire, dead state — in the realm's own material language
15. trap, hidden state — in the realm's own material language
16. trap, sprung state — in the realm's own material language
17. portal, sealed state — in the realm's own material language
18. portal, active state — in the realm's own material language
19. container, intact state — in the realm's own material language
20. container, cracked state — in the realm's own material language
21. container, broken state — in the realm's own material language
22. ALT of 'door, shut state — banded oak plank door' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — banded oak plank door' — different shape/growth/wear, same kind
24. ALT of 'door, open state — banded oak plank door' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — banded oak plank door' — different shape/growth/wear, same kind
```
