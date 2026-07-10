# DRESSING-GEN — cosmic dressing (flora + clutter + interactive objects)

Instructions for the codex agent. Work through every sheet IN ORDER, unsupervised.

1. Generate one image per sheet using the EXACT prompt in its code block. Do not improvise, reorder, or substitute subjects.
2. Save the PNG at `ui-sketches/sprite-sheets/<filename>` using the exact filename in the heading.
3. Check each result: correct card count, solid background, every card a SINGLE self-contained scenery object (no scenes, no ground planes, no cast shadows on the background), silhouettes strong and readable, style matches the realm reference. If a check fails: regenerate, up to 3 total attempts, keep the best.
4. NEVER DISCARD A RENDER: save rejected attempts as `<filename>-take2.png` etc.
5. NO BLANK SLOTS: alt cells listed at the end of each roster are required subjects.
6. Never edit any other files.

## `cosmic-flora-dg-01.png` — 20 cards, 5x4 — cosmic flora cards

```
Create a sprite sheet: a 5 rows x 4 columns grid of 20 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: portrait.
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: midnight cosmic-Egyptian realm — deep navy bodies traced with gold constellation sigils, eldritch star-flesh.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/cosmic-style-ref.png's grain and palette discipline exactly.
Palette: disciplined navy-and-gold with rich accent color where the subject earns it.
Subjects, one per cell, left to right then top to bottom:
1. star-flesh bloom pulsing faint gold beneath navy skin
2. constellation-sigil vine tracing gold lines up a column
3. black lotus afloat in still navy water, gold-veined petals
4. obsidian-glass reed bed chiming faintly in unseen wind
5. eldritch coral growth branching in impossible angles
6. dusk-navy grass tuft, each blade tipped with a gold star
7. astral moss glowing in slow constellation pulses
8. scarab-carapace vine, gold shells clicking softly along the stem
9. void-black fern, fronds edged in razor gold thread
10. dying-sun fruit cluster, husk cracked to reveal molten gold
11. funerary ivy climbing a cracked sarcophagus lid
12. nebula-hued thornbramble, colors shifting like distant gas clouds
13. hourglass-shaped flower, sand trickling instead of pollen
14. black basalt palm frond frozen mid-sway, dusted gold
15. glyph-patterned lichen crawling a crypt wall, glowing faint gold
16. crown-shaped thorn cluster, once a pharaoh's garden hedge
17. loose starweed drift, seeds glinting like scattered sequins
18. ankh-shaped vine growth wound tight around a broken column
19. ALT of 'star-flesh bloom pulsing faint gold beneath navy skin' — different shape/growth/wear, same kind
20. ALT of 'constellation-sigil vine tracing gold lines up a column' — different shape/growth/wear, same kind
```

## `cosmic-clutter-dg-02.png` — 16 cards, 4x4 — cosmic clutter cards

```
Create a sprite sheet: a 4 rows x 4 columns grid of 16 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: midnight cosmic-Egyptian realm — deep navy bodies traced with gold constellation sigils, eldritch star-flesh.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/cosmic-style-ref.png's grain and palette discipline exactly.
Palette: disciplined navy-and-gold with rich accent color where the subject earns it.
Subjects, one per cell, left to right then top to bottom:
1. cracked canopic urn, gold leaf peeling from navy clay
2. drift of scattered gold coins bearing star-sigil faces
3. collapsed castle-brick rubble pile, star-mortar still glowing at seams
4. unraveled mummy-wrap trailing from a toppled sarcophagus
5. shattered stone tablet, half its glyphs worn to dust
6. overturned incense censer, gold smoke still drifting up
7. bent judgment-scale, one pan still swinging slow
8. fallen obelisk chunk, its sigil face still faintly warm
9. heap of cracked canopic jars, one still faintly ticking
10. gold chain-mail veil torn and draped across a rail
11. shattered star-map disc, half its constellations scratched out
12. broken throne-arm fragment, carved into a coiled serpent
13. brazier soot ring, ash still faintly luminous gold
14. drift of star-sand piled against a crypt threshold
15. ALT of 'cracked canopic urn, gold leaf peeling from navy clay' — different shape/growth/wear, same kind
16. ALT of 'drift of scattered gold coins bearing star-sigil faces' — different shape/growth/wear, same kind
```

## `cosmic-objects-dg-03.png` — 25 cards, 5x5 — cosmic interactive objects (state sets — draw the SAME object per archetype across its states)

```
Create a sprite sheet: a 5 rows x 5 columns grid of 25 individual game SCENERY CARDS, evenly spaced, on a solid #FF00FF magenta background filling every non-subject pixel. Canvas orientation: landscape (wider than tall, e.g. 1536x1024).
Construction: each cell is ONE self-contained SCENERY CARD — a small clustered assembly (2-5 elements bundled: a stand of stalks, a heap of crates, a clutch of mushrooms), painted from a slight three-quarter angle so a hint of the top facet shows, standing upright as a flat cutout. NO ground plane, NO background scene, NO cast shadow and NO contact shadow in the art — the engine grounds, lights, and shadows every card itself. Strong readable silhouette that holds up at tabletop distance; light-emitting subjects (lamps, glowing growth) painted self-illuminated with a visible glow core.
Setting: midnight cosmic-Egyptian realm — deep navy bodies traced with gold constellation sigils, eldritch star-flesh.
Style: dense pixel art, realistic materials, clean-crisp pixel finish — match dev/model-qa/regen-v3/style-refs/cosmic-style-ref.png's grain and palette discipline exactly.
Palette: disciplined navy-and-gold with rich accent color where the subject earns it.
Subjects, one per cell, left to right then top to bottom:
1. door, shut state — in the realm's own material language
2. door, ajar state — in the realm's own material language
3. door, open state — in the realm's own material language
4. door, broken state — in the realm's own material language
5. chest, closed state — gold sarcophagus-lidded coffer
6. chest, open state — gold sarcophagus-lidded coffer
7. chest, looted state — gold sarcophagus-lidded coffer
8. lever, left state — sigil-carved stone lever.
9. lever, right state — sigil-carved stone lever.
10. shrine, dormant state — star-sigil altar.
11. shrine, lit state — star-sigil altar.
12. campfire, unlit state — in the realm's own material language
13. campfire, lit state — in the realm's own material language
14. campfire, dead state — in the realm's own material language
15. trap, hidden state — in the realm's own material language
16. trap, sprung state — in the realm's own material language
17. portal, sealed state — star-sigil gateway ring
18. portal, active state — star-sigil gateway ring
19. container, intact state — in the realm's own material language
20. container, cracked state — in the realm's own material language
21. container, broken state — in the realm's own material language
22. ALT of 'door, shut state — in the realm's own material language' — different shape/growth/wear, same kind
23. ALT of 'door, ajar state — in the realm's own material language' — different shape/growth/wear, same kind
24. ALT of 'door, open state — in the realm's own material language' — different shape/growth/wear, same kind
25. ALT of 'door, broken state — in the realm's own material language' — different shape/growth/wear, same kind
```
