# DRESSING-GEN — theater dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `theater-flora-dg-01.png` — 20 cards, 5x4 — theater flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: endless-war theater realm — WWI trench grime, mud, rust, gas-haze, war-torn cloth.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/theater-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: narrow mud-olive palette with drab military tones.
Subjects, one per cell, left to right then top to bottom:
1. weed cluster clawing up from the lip of a shell crater
2. tree stump blasted to splinters, one green shoot defiantly growing
3. reed clump rooted in a flooded trench bottom
4. stubborn vine growth tangled through rusted barbed wire
5. low scrub brush wilting under a lingering gas-haze
6. shattered orchard row, trunks snapped mid-height by shellfire
7. moss creeping up the damp side of a sandbag wall
8. reed tuft ringing a waterlogged shell-hole puddle
9. hardy thistle patch surviving in churned no-man's-land mud
10. mold patch creeping along a damp dugout timber wall
11. tufted grass clinging to a crumbling crater rim
12. stray ivy growth threading through a torn camouflage net
13. single poppy cluster blooming red against the mud-olive field
14. charred treeline remnant, bark stripped clean by shrapnel
15. pale fungus shelf growing off a rotted trench support beam
16. bramble tangle grown wild through a collapsed wire fence
17. sparse scrub grass patch surviving on a churned mudflat
18. lichen growth creeping along a cold rusted gas pipe
19. ALT of 'weed cluster clawing up from the lip of a shell crater' — different shape/growth/wear, same kind
20. ALT of 'tree stump blasted to splinters, one green shoot defiantly growing' — different shape/growth/wear, same kind
```

## `theater-clutter-dg-02.png` — 16 cards, 4x4 — theater clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: endless-war theater realm — WWI trench grime, mud, rust, gas-haze, war-torn cloth.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/theater-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: narrow mud-olive palette with drab military tones.
Subjects, one per cell, left to right then top to bottom:
1. dented steel helmet left upturned in the mud
2. split sandbag, sand spilling from a shrapnel tear
3. tangled coil of rusted barbed wire half-buried in mud
4. discarded gas mask, lens cracked, straps snapped
5. pile of spent artillery shell casings stacked at a gun pit
6. single dog tag half-pressed into churned mud
7. splintered ammunition crate, contents long since looted
8. cracked field radio, dial frozen, cord frayed
9. broken wooden trench ladder, one rung snapped clean through
10. tattered regimental banner half-buried in mud
11. pile of discarded mud-caked boots at a dugout entrance
12. abandoned canvas stretcher, poles bent and stained
13. debris scatter ringing a fresh shell crater
14. twisted section of wire-fence entanglement, rusted solid
15. ALT of 'dented steel helmet left upturned in the mud' — different shape/growth/wear, same kind
16. ALT of 'split sandbag, sand spilling from a shrapnel tear' — different shape/growth/wear, same kind
```

## `theater-objects-dg-03.png` — 25 cards, 5x5 — theater interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: endless-war theater realm — WWI trench grime, mud, rust, gas-haze, war-torn cloth.
Style: dense pixel art, realistic materials, grimy dense-dithered finish — match dev/model-qa/regen-v3/style-refs/theater-style-ref.png's grain and palette discipline exactly. CLEAN-SHAPES LAW: large flat value planes carry every form; dither only in shadow regions and edges, never mid-tones; silhouette first. The sheet must read clean at 50% zoom.
Palette: narrow mud-olive palette with drab military tones.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — in the realm's own material language
2. door, ajar state — in the realm's own material language
3. door, open state — in the realm's own material language
4. door, broken state — in the realm's own material language
5. chest, closed state — in the realm's own material language
6. chest, open state — in the realm's own material language
7. chest, looted state — in the realm's own material language
8. lever, left state — trench-gun elevation lever
9. lever, right state — trench-gun elevation lever
10. shrine, dormant state — in the realm's own material language
11. shrine, lit state — in the realm's own material language
12. campfire, unlit state — trench brazier fire.
13. campfire, lit state — trench brazier fire.
14. campfire, dead state — trench brazier fire.
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
