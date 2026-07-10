# DRESSING-GEN — chrome dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `chrome-flora-dg-01.png` — 20 cards, 5x4 — chrome flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: neon-cyberpunk chrome city — gunmetal machines and street-level cyberpunk figures with hyper-neon emissive accents.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/chrome-style-ref.png's grain and palette discipline exactly.
Palette: rich neon palette against dark metals.
Subjects, one per cell, left to right then top to bottom:
1. rooftop planter box sprouting looping fiber-optic cable-vines
2. chrome-wire bonsai strung with pulsing neon veins
3. holographic fern frond flickering between two color states
4. tuft of thin antenna-wire grass, tips blinking status LEDs
5. solar-panel leaf vine climbing a gutted support strut
6. glowing data-moss patch crawling up a server rack
7. junk-metal tree welded from salvaged pipe and rebar
8. neon-lily cluster in a coolant runoff puddle
9. tangled copper wireweed sprouting from a cracked panel seam
10. bioluminescent light-pod cluster pulsing on a slow timer
11. fiber-optic reed bed, glass-thin and glowing at the tips
12. circuit-board moss, traces still faintly conducting current
13. cable-ivy climbing a dead vending machine like a trellis
14. radiation-warning fern, fronds striped hazard yellow and black
15. dormant micro-drone hive nested like a paper wasp nest
16. dead holo-ad billboard frame overgrown with cable-vine
17. moss thriving in the warm mist of a steam vent
18. fiber-glass coral growth clustered around a coolant leak
19. ALT of 'rooftop planter box sprouting looping fiber-optic cable-vines' — different shape/growth/wear, same kind
20. ALT of 'chrome-wire bonsai strung with pulsing neon veins' — different shape/growth/wear, same kind
```

## `chrome-clutter-dg-02.png` — 16 cards, 4x4 — chrome clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: neon-cyberpunk chrome city — gunmetal machines and street-level cyberpunk figures with hyper-neon emissive accents.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/chrome-style-ref.png's grain and palette discipline exactly.
Palette: rich neon palette against dark metals.
Subjects, one per cell, left to right then top to bottom:
1. shattered wall-mount monitor still looping static
2. loose tangle of severed data cable spilling from a conduit
3. gutted delivery-drone husk, rotors bent flat
4. broken neon tube shard still faintly sparking
5. toppled vending machine, glass front spiderwebbed
6. heap of stripped circuit boards and gold-plated pins
7. bundle of snapped antenna rods leaning in a corner
8. spent battery pack rack, casings swollen and cracked
9. fallen holo-sign fragment, one word still legible
10. dead CCTV eye dangling from a snapped bracket arm
11. glowing coolant stain pooled beneath a cracked pipe joint
12. magnetic-sealed supply crate, seal light blinking dead red
13. bent subway turnstile arm, chrome scratched to bare metal
14. heap of shattered mechanical keyboards, keys scattered
15. ALT of 'shattered wall-mount monitor still looping static' — different shape/growth/wear, same kind
16. ALT of 'loose tangle of severed data cable spilling from a conduit' — different shape/growth/wear, same kind
```

## `chrome-objects-dg-03.png` — 25 cards, 5x5 — chrome interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: neon-cyberpunk chrome city — gunmetal machines and street-level cyberpunk figures with hyper-neon emissive accents.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/chrome-style-ref.png's grain and palette discipline exactly.
Palette: rich neon palette against dark metals.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — hydraulic blast-door panel
2. door, ajar state — hydraulic blast-door panel
3. door, open state — hydraulic blast-door panel
4. door, broken state — hydraulic blast-door panel
5. chest, closed state — in the realm's own material language
6. chest, open state — in the realm's own material language
7. chest, looted state — in the realm's own material language
8. lever, left state — illuminated toggle switch console
9. lever, right state — illuminated toggle switch console
10. shrine, dormant state — in the realm's own material language
11. shrine, lit state — in the realm's own material language
12. campfire, unlit state — in the realm's own material language
13. campfire, lit state — in the realm's own material language
14. campfire, dead state — in the realm's own material language
15. trap, hidden state — floor-panel laser grid
16. trap, sprung state — floor-panel laser grid
17. portal, sealed state — airlock threshold arch
18. portal, active state — airlock threshold arch
19. container, intact state — magnetic-sealed supply crate
20. container, cracked state — magnetic-sealed supply crate
21. container, broken state — magnetic-sealed supply crate
22. ALT of 'door, shut state — hydraulic blast-door panel' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — hydraulic blast-door panel' — different shape/growth/wear, same kind
24. ALT of 'door, open state — hydraulic blast-door panel' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — hydraulic blast-door panel' — different shape/growth/wear, same kind
```
