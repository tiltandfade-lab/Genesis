# DRESSING-GEN — lost-world dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `lost-world-flora-dg-01.png` — 20 cards, 5x4 — lost-world flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: prehistoric lost-world jungle — dinosaurs and primeval fauna.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/lost-world-style-ref.png's grain and palette discipline exactly.
Palette: rich naturalist jungle palette.
Subjects, one per cell, left to right then top to bottom:
1. broad-leafed cycad cluster, primeval and waxy-green
2. giant fern frond arching over the path, dripping jungle damp
3. hanging vine curtain thick enough to hide a threshold
4. carnivorous pitcher-pod cluster, lid half-open and glistening
5. moss-swallowed boulder half-sunk in jungle loam
6. massive buttress root fanning out from an unseen canopy giant
7. wild orchid cluster blooming from a rotted log
8. dense bamboo tangle, stalks cracked and leaning
9. dense fern-floor carpet, damp and shadow-dappled
10. strangler vine coiled tight around a dead trunk
11. bioluminescent fungus shelf climbing a rotted trunk
12. swamp reed stand rising from murky primeval water
13. tar-pit scum crust bubbling faint at the edges
14. epiphyte air-plant cluster hanging from a low branch
15. single giant leaf broad enough to shelter under
16. exposed mudroot tangle crossing a jungle trail
17. primeval thornvine hedge, spines the length of a finger
18. abandoned dinosaur egg clutch nest, shells cracked open
19. ALT of 'broad-leafed cycad cluster, primeval and waxy-green' — different shape/growth/wear, same kind
20. ALT of 'giant fern frond arching over the path, dripping jungle damp' — different shape/growth/wear, same kind
```

## `lost-world-clutter-dg-02.png` — 16 cards, 4x4 — lost-world clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: prehistoric lost-world jungle — dinosaurs and primeval fauna.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/lost-world-style-ref.png's grain and palette discipline exactly.
Palette: rich naturalist jungle palette.
Subjects, one per cell, left to right then top to bottom:
1. weathered dinosaur bone pile half-swallowed by fern growth
2. cracked fossil tooth half-buried in jungle mud
3. split explorer supply crate, contents scattered in the ferns
4. snapped rope-bridge plank dangling over a ravine
5. fossilized footprint imprint filled with rainwater
6. half-submerged bones jutting from a tar pit edge
7. giant molted feather caught in the underbrush
8. weathered stone totem, moss-grown and half-swallowed by roots
9. deep mudtrack ruts left by something enormous
10. cracked egg-shell fragment scattered near a nest
11. torn survivor hammock strung between two trunks
12. cold expedition campfire ring, ash scattered by wind
13. deep claw marks raked across a rock face
14. broken hunting spear haft stuck upright in mud
15. ALT of 'weathered dinosaur bone pile half-swallowed by fern growth' — different shape/growth/wear, same kind
16. ALT of 'cracked fossil tooth half-buried in jungle mud' — different shape/growth/wear, same kind
```

## `lost-world-objects-dg-03.png` — 25 cards, 5x5 — lost-world interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: prehistoric lost-world jungle — dinosaurs and primeval fauna.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/lost-world-style-ref.png's grain and palette discipline exactly.
Palette: rich naturalist jungle palette.
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
10. shrine, dormant state — in the realm's own material language
11. shrine, lit state — in the realm's own material language
12. campfire, unlit state — ringed stone fire pit
13. campfire, lit state — ringed stone fire pit
14. campfire, dead state — ringed stone fire pit
15. trap, hidden state — camouflaged pit-trap with stakes
16. trap, sprung state — camouflaged pit-trap with stakes
17. portal, sealed state — in the realm's own material language
18. portal, active state — in the realm's own material language
19. container, intact state — in the realm's own material language
20. container, cracked state — in the realm's own material language
21. container, broken state — in the realm's own material language
22. ALT of 'door, shut state — in the realm's own material language' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — in the realm's own material language' — different shape/growth/wear, same kind
24. ALT of 'door, open state — in the realm's own material language' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — in the realm's own material language' — different shape/growth/wear, same kind
```
