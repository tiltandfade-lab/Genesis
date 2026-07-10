# DRESSING-GEN — ash dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `ash-flora-dg-01.png` — 20 cards, 5x4 — ash flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: volcanic ash wasteland — basalt hide, ember cracks, rust, toxic biolume.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/ash-style-ref.png's grain and palette discipline exactly.
Palette: grey-ash base with ember orange and toxic green accents.
Subjects, one per cell, left to right then top to bottom:
1. charred tree snag, bark flaked to grey ash rind
2. field of bleached brush skeletons leaning downwind
3. toxic fungal bloom pulsing sick green under ash crust
4. tuft of cinder-grey grass smoldering at the tips
5. irradiated lichen scab crawling up a cracked rock face
6. exposed root system fused into black glassy slag
7. biolume stalk cluster glowing toxic green in the haze
8. blackened thornbramble tangle, spines rimed with ash
9. nettle patch growing straight out of a glowing ember crack
10. basalt-hide bark plate peeling off a dead trunk
11. creeping ash-grey vine strangling a rusted stake
12. split volcanic tree, ember light glowing through the fissure
13. swollen spore pod cluster ready to burst toxic dust
14. sparse dune grass bent flat, coated in fine grey ash
15. cinder fern curling brittle, edges rimmed with ember orange
16. tangled surface root mass fused with rusted rebar
17. single ember-orange flower somehow blooming in the ash
18. toxic green mold sheeting an interior wall crack
19. ALT of 'charred tree snag, bark flaked to grey ash rind' — different shape/growth/wear, same kind
20. ALT of 'field of bleached brush skeletons leaning downwind' — different shape/growth/wear, same kind
```

## `ash-clutter-dg-02.png` — 16 cards, 4x4 — ash clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: volcanic ash wasteland — basalt hide, ember cracks, rust, toxic biolume.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/ash-style-ref.png's grain and palette discipline exactly.
Palette: grey-ash base with ember orange and toxic green accents.
Subjects, one per cell, left to right then top to bottom:
1. corroded hull plate half-buried in drifted ash
2. stripped chassis bones of a burned-out war truck
3. smoldering ember pile still glowing under grey crust
4. cracked gas mask half-swallowed by drifted ash
5. leaning rust-eaten drum, seams weeping toxic sludge
6. torn chainlink fence sagging under a weight of ash
7. charred bone pile stacked at a cairn of warning
8. rusted meat hook chain dangling from a scavenged beam
9. glowing toxic puddle pooled in a crater dent
10. split supply crate, contents long since ash-caked
11. stack of melted tires fused into a black lump
12. bent road sign, paint scoured clean by ash storms
13. basalt-hide skull mounted on a rebar spike
14. cracked vent pipe hissing a thread of ember smoke
15. ALT of 'corroded hull plate half-buried in drifted ash' — different shape/growth/wear, same kind
16. ALT of 'stripped chassis bones of a burned-out war truck' — different shape/growth/wear, same kind
```

## `ash-objects-dg-03.png` — 25 cards, 5x5 — ash interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: volcanic ash wasteland — basalt hide, ember cracks, rust, toxic biolume.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/ash-style-ref.png's grain and palette discipline exactly.
Palette: grey-ash base with ember orange and toxic green accents.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — in the realm's own material language
2. door, ajar state — in the realm's own material language
3. door, open state — in the realm's own material language
4. door, broken state — in the realm's own material language
5. chest, closed state — in the realm's own material language
6. chest, open state — in the realm's own material language
7. chest, looted state — in the realm's own material language
8. lever, left state — rusted rebar pull-bar
9. lever, right state — rusted rebar pull-bar
10. shrine, dormant state — in the realm's own material language
11. shrine, lit state — in the realm's own material language
12. campfire, unlit state — oil-drum burn barrel
13. campfire, lit state — oil-drum burn barrel
14. campfire, dead state — oil-drum burn barrel
15. trap, hidden state — in the realm's own material language
16. trap, sprung state — in the realm's own material language
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
