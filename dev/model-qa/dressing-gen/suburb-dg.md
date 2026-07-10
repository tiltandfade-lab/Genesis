# DRESSING-GEN — suburb dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `suburb-flora-dg-01.png` — 20 cards, 5x4 — suburb flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: uncanny modern suburbia — groomed surfaces hiding menace.
Style: the realm's own stylized register, internally consistent.
Palette: bright suburban palette, muted for feral subjects.
Subjects, one per cell, left to right then top to bottom:
1. perfectly groomed hedge trimmed into an unsettling smiling shape
2. suspiciously perfect lawn patch, too green, too even
3. manicured rosebush, one bloom weeping something not quite sap
4. topiary shaped like a friendly animal, eyes trimmed a bit too sharp
5. cheerful mailbox flower bed, symmetrical to an unnatural degree
6. ivy climbing a white picket fence, growth strangely deliberate
7. sturdy oak branch with a rope swing, bark scratched deep
8. astroturf patch peeking through where real grass gave up
9. identical twin flowerbeds flanking a garage door
10. browning ornamental pine, needles falling in a perfect circle
11. feral vine growth swallowing an abandoned garden shed
12. xeriscaped cactus garden, gravel raked into unnervingly neat lines
13. hanging porch basket, flowers wilted despite daily watering
14. overgrown vegetable patch, produce swollen wrong-shaped
15. grass patch caught mid-mist under a stuck sprinkler head
16. identical street tree, one of a perfectly spaced row
17. weed cluster cracking through a driveway seam
18. synthetic cobweb decoration with something actually living in it
19. ALT of 'perfectly groomed hedge trimmed into an unsettling smiling shape' — different shape/growth/wear, same kind
20. ALT of 'suspiciously perfect lawn patch, too green, too even' — different shape/growth/wear, same kind
```

## `suburb-clutter-dg-02.png` — 16 cards, 4x4 — suburb clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: uncanny modern suburbia — groomed surfaces hiding menace.
Style: the realm's own stylized register, internally consistent.
Palette: bright suburban palette, muted for feral subjects.
Subjects, one per cell, left to right then top to bottom:
1. tipped curbside trash cans, lids scattered across the lawn
2. child's bike abandoned mid-driveway, kickstand never used
3. folding lawn chair collapsed in the grass, one leg bent
4. cracked garden gnome, painted smile chipped to a grimace
5. rusted driveway basketball hoop, net long gone
6. spilled recycling bin, bottles rolled across the curb
7. cold backyard grill, lid ajar, ash gone stale
8. threadbare welcome mat, letters worn past reading
9. folding garage-sale table, items still price-tagged and untouched
10. tangled string of holiday lights still half-lit off-season
11. scatter of plastic yard toys, faded by seasons of sun
12. stack of unclaimed newspapers piling on a porch step
13. snapped white picket fence rail, splinters facing the street
14. garden hose tangled loose off its wall-mounted reel
15. ALT of 'tipped curbside trash cans, lids scattered across the lawn' — different shape/growth/wear, same kind
16. ALT of 'child's bike abandoned mid-driveway, kickstand never used' — different shape/growth/wear, same kind
```

## `suburb-objects-dg-03.png` — 25 cards, 5x5 — suburb interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: uncanny modern suburbia — groomed surfaces hiding menace.
Style: the realm's own stylized register, internally consistent.
Palette: bright suburban palette, muted for feral subjects.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — in the realm's own material language
2. door, ajar state — in the realm's own material language
3. door, open state — in the realm's own material language
4. door, broken state — in the realm's own material language
5. chest, closed state — in the realm's own material language
6. chest, open state — in the realm's own material language
7. chest, looted state — in the realm's own material language
8. lever, left state — in the realm's own material language
9. lever, right state — in the realm's own material language
10. shrine, dormant state — backyard garden shrine gone strange
11. shrine, lit state — backyard garden shrine gone strange
12. campfire, unlit state — in the realm's own material language
13. campfire, lit state — in the realm's own material language
14. campfire, dead state — in the realm's own material language
15. trap, hidden state — in the realm's own material language
16. trap, sprung state — in the realm's own material language
17. portal, sealed state — in the realm's own material language
18. portal, active state — in the realm's own material language
19. container, intact state — curbside recycling bin.
20. container, cracked state — curbside recycling bin.
21. container, broken state — curbside recycling bin.
22. ALT of 'door, shut state — in the realm's own material language' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — in the realm's own material language' — different shape/growth/wear, same kind
24. ALT of 'door, open state — in the realm's own material language' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — in the realm's own material language' — different shape/growth/wear, same kind
```
