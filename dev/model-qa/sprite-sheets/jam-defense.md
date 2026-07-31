---
type: sprite-production-packet
status: READY
formatVersion: 1
realm: fantasy
family: other
sourceRoster: ~/Desktop/Work/projects/srd-td/SPEC.md (moved 2026-07-30; Genesis-side stub at docs/TOWER-DEFENSE-JAM-BRIEF.md)
styleSource: dev/model-qa/sprite-sheets/fantasy.md
manifestPath: PENDING — author dev/sprite-manifests/jam-defense-manifest.json (sheet → ordered slug map) before slicing; slugs are listed per cell below
created: 2026-07-30
---

# Sprite Production Packet — Jam Defense field sprites (animated, 3-frame)

**Scope.** Field-unit sprites for the unit-defense jam game (working title TBD;
spec: `~/Desktop/Work/projects/srd-td/SPEC.md`). 32 subjects — 6 SRD-class defenders,
25 enemies, 1 boss — each as a **3-frame animation run** (walk A / walk B /
attack), 96 cells across 7 sheets. These are small field sprites for units
marching a lane; the existing `assets/sprites/` portrait register is NOT
superseded (it serves as HUD portrait art for the same game).

**Provenance.** Defender roster ruled by Adam 2026-07-30 (SRD classes:
Fighter, Ranger, Rogue, Cleric, Wizard, Druid). Enemy roster from the jam
brief, all verified present in `data/bestiary.js`. Style rides the default
fantasy realm (`fantasy.md`).

## ⚠️ DECLARED FAMILY EXCEPTION — animation frames

The shared mechanical minimum's clause "one distinct static subject per cell,
not animation frames" is **overridden for this packet** (family-specific
exception per PRODUCTION-FORMAT.md, ruled by Adam 2026-07-30 — "we can
probably get animation out of them from a handful of codex sprite sheets").
Replacement clause, restated in full inside every sheet's mechanical block:

> Each subject occupies exactly THREE consecutive cells in row-major order —
> frame 1 **walk A**, frame 2 **walk B**, frame 3 **attack**. The same
> character identity, anatomy, equipment, palette, scale, and baseline must
> repeat EXACTLY across a subject's three cells; only the pose changes.
> A frame run never crosses a row boundary (grids are 3 or 6 columns wide so
> runs stay aligned: 3-column sheets = one subject per row; 6-column sheets =
> two subjects per row, cells 1–3 and 4–6).

Frame pose grammar (applies to every subject unless its cue says otherwise):
- **walk A** — mid-stride, leading leg forward and planted, trailing leg
  lifted, arms in natural counter-swing (weapon carried, not raised).
- **walk B** — the opposite stride: other leg leading, arms counter-swung the
  other way. Must read as the alternate frame of the SAME gait cycle.
- **attack** — the subject's attack action, mid-motion, weapon or effect
  clearly readable in silhouette.
- Flyers substitute wing positions for leg stride: walk A = wings raised,
  walk B = wings lowered/mid-downbeat, attack = strike pose. Floaters
  (specter, shadow) substitute drift: walk A = trailing wisps left, walk B =
  trailing wisps right.

## Slug scheme

`jam-<subject>-walk-a` / `jam-<subject>-walk-b` / `jam-<subject>-attack` —
e.g. `jam-fighter-walk-a`. The manifest lists all 96 slugs in sheet order,
row-major. Sliced output lands in `assets/sprites-jam/` (new directory — do
NOT write into `assets/sprites/`).

## Batch plan

| sheetId | outputFilename | subjectClass | sizeBand | bodyPlan | subjectCount | gridColumns | gridRows | capacity | cellAspect | aspectStatus | cellWidthPx | cellHeightPx | requestedCanvasWidthPx | requestedCanvasHeightPx | chromaKey | camera | order |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| J1 | jam-sheet-01-defenders.png | pc-class defenders | medium | upright humanoid | 6 | 6 | 3 | 18 | 4:5 | default | 200 | 250 | 1200 | 750 | #FF00FF | 3/4 view facing left, ground-level | left-to-right, then top-to-bottom |
| J2 | jam-sheet-02-rabble.png | enemy rabble | medium | upright humanoid | 8 | 6 | 4 | 24 | 4:5 | default | 200 | 250 | 1200 | 1000 | #FF00FF | 3/4 view facing left, ground-level | left-to-right, then top-to-bottom |
| J3 | jam-sheet-03-elites.png | enemy elites & shades | medium | upright humanoid | 6 | 6 | 3 | 18 | 4:5 | default | 200 | 250 | 1200 | 750 | #FF00FF | 3/4 view facing left, ground-level | left-to-right, then top-to-bottom |
| J4 | jam-sheet-04-beasts.png | enemy beasts | medium-large beasts | long quadruped | 4 | 3 | 4 | 12 | 5:4 | subject-authorized (long quadrupeds → landscape) | 250 | 200 | 750 | 800 | #FF00FF | 3/4 view facing left, ground-level | left-to-right, then top-to-bottom |
| J5 | jam-sheet-05-flyers.png | enemy flyers | small–medium | winged, airborne | 5 | 3 | 5 | 15 | 5:4 | subject-authorized (wing poses → landscape) | 250 | 200 | 750 | 1000 | #FF00FF | 3/4 view facing left, airborne (no ground contact) | left-to-right, then top-to-bottom |
| J6 | jam-sheet-06-ogre.png | enemy large | large | upright humanoid, large | 1 | 3 | 1 | 3 | 4:5 | default (large cell, own sheet per density law) | 300 | 375 | 900 | 375 | #FF00FF | 3/4 view facing left, ground-level | left-to-right |
| J7 | jam-sheet-07-large-winged.png | mini-boss & boss | large | winged quadruped, large | 2 | 3 | 2 | 6 | 5:4 | subject-authorized (winged quadrupeds → landscape) | 375 | 300 | 1125 | 600 | #FF00FF | 3/4 view facing left, ground-level | left-to-right, then top-to-bottom |

No blank slots on any sheet (capacity = subjectCount × 3 everywhere).

---

## `jam-sheet-01-defenders.png` — 6 subjects (18 cells)

Production format:
- sheetId: `J1`
- gridColumns: 6
- gridRows: 3
- capacity: 18
- cellAspect: `4:5`
- aspectStatus: `default`
- aspectReason: ordinary upright humanoids; the character default fits.
- cellWidthPx: 200
- cellHeightPx: 250
- requestedCanvas: `1200 × 750`
- chromaKey: `#FF00FF`
- camera: `3/4 view facing left, ground-level, full body`
- order: left-to-right, then top-to-bottom — TWO subjects per row (cells 1–3 = first subject's frames, cells 4–6 = second subject's frames)

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

Shared mechanical instructions: 6-column × 3-row grid, 18 cells, uniform cell boundaries, no subject crossing a boundary. ANIMATION-FRAME EXCEPTION IN FORCE: each subject occupies exactly three consecutive cells in row-major order — frame 1 walk A (mid-stride, leading leg planted, arms in counter-swing, weapon carried), frame 2 walk B (opposite stride of the same gait), frame 3 attack (the subject's attack action, mid-motion). The same character identity, anatomy, equipment, palette, scale, and baseline must repeat exactly across a subject's three cells; only the pose changes. Frame runs never cross a row boundary: cells 1–3 of each row are one subject, cells 4–6 the next. Complete subject inside each cell with padding — no cropped feet, head, weapon, or limb. Full-body, ground-level, 3/4 view facing left. Expressive, characterful poses — never a neutral mannequin. Flat magenta #FF00FF background: no scenery, floor plane, labels, borders, watermark, background shadow, haze, or key-color contamination. Consistent scale and shared ground baseline across all six subjects. Apply the Style block above exactly.

Subjects, in row-major order (three cells each):

1–3. **Fighter** (`jam-fighter-*`) — human fighter in full chain mail with heater shield and longsword; sturdy build, closed helm with visor up. walk A / walk B: marching stride, shield forward, sword low at side. attack: braced combat stance, sword mid-swing overhead, shield up.
4–6. **Ranger** (`jam-ranger-*`) — human ranger in studded leather, hooded cloak, longbow in hand, quiver at hip. walk A / walk B: alert stride, bow carried low. attack: bow drawn to full pull, aiming left, arrow nocked.
7–9. **Rogue** (`jam-rogue-*`) — slight human rogue in dark leather armor, dual daggers, half-mask, low crouched posture even at walk. walk A / walk B: prowling low stride, daggers reversed-grip. attack: mid-lunge stab from stealth, both daggers striking, coat flaring.
10–12. **Cleric** (`jam-cleric-*`) — human cleric in chain shirt over robes, round shield on back, mace in one hand, holy symbol raised in the other. walk A / walk B: steady stride, mace at side, faint radiance at the holy symbol. attack: holy symbol thrust forward, burst of radiant light at the hand, mace raised.
13–15. **Wizard** (`jam-wizard-*`) — elderly human wizard in layered robes, pointed hat, quarterstaff arcane focus, spellbook chained at belt. walk A / walk B: robe-swishing stride, staff as walking stick. attack: mid-spellcast, staff raised, arcane sigil forming at the free hand, robe caught in the surge.
16–18. **Druid** (`jam-druid-*`) — wild-haired druid in leather and hide with leaf-and-antler motifs, sickle at belt, gnarled staff wrapped in living vine. walk A / walk B: grounded stride, staff planted alternately. attack: staff raised with vines lashing outward from it, wild green energy crackling.

---

## `jam-sheet-02-rabble.png` — 8 subjects (24 cells)

Production format:
- sheetId: `J2`
- gridColumns: 6
- gridRows: 4
- capacity: 24
- cellAspect: `4:5`
- aspectStatus: `default`
- aspectReason: upright humanoid enemies; the character default fits.
- cellWidthPx: 200
- cellHeightPx: 250
- requestedCanvas: `1200 × 1000`
- chromaKey: `#FF00FF`
- camera: `3/4 view facing left, ground-level, full body`
- order: left-to-right, then top-to-bottom — TWO subjects per row (cells 1–3 and 4–6)

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

Shared mechanical instructions: 6-column × 4-row grid, 24 cells, uniform cell boundaries, no subject crossing a boundary. ANIMATION-FRAME EXCEPTION IN FORCE: each subject occupies exactly three consecutive cells in row-major order — frame 1 walk A (mid-stride, leading leg planted, arms in counter-swing, weapon carried), frame 2 walk B (opposite stride of the same gait), frame 3 attack (the subject's attack action, mid-motion). The same character identity, anatomy, equipment, palette, scale, and baseline must repeat exactly across a subject's three cells; only the pose changes. Frame runs never cross a row boundary: cells 1–3 of each row are one subject, cells 4–6 the next. Complete subject inside each cell with padding — no cropped feet, head, weapon, or limb. Full-body, ground-level, 3/4 view facing left. Expressive, characterful poses — never a neutral mannequin. Flat magenta #FF00FF background: no scenery, floor plane, labels, borders, watermark, background shadow, haze, or key-color contamination. Consistent scale and shared ground baseline across all eight subjects (kobold and goblins read smaller than the human-sized bandit at the same baseline). Apply the Style block above exactly.

Subjects, in row-major order (three cells each):

1–3. **Kobold** (`jam-kobold-*`) — small reptilian humanoid, rust-red scales, ragged loincloth, crude spear. walk: scurrying stride, spear couched. attack: darting spear-thrust, snarling.
4–6. **Bandit** (`jam-bandit-*`) — scruffy human in patched leather, kerchief over face, scimitar. walk: swaggering stride. attack: wild scimitar slash.
7–9. **Goblin Minion** (`jam-goblin-minion-*`) — scrawny green goblin, oversized rusty dagger, no armor. walk: skittering hunched stride. attack: frantic overhead stab.
10–12. **Goblin Warrior** (`jam-goblin-warrior-*`) — wiry goblin in scrap-leather with small shield and shortsword. walk: crouched advance behind shield. attack: shield-braced sword jab.
13–15. **Goblin Boss** (`jam-goblin-boss-*`) — fat goblin in looted chain shirt with feathered cap and notched blade, bossy sneer. walk: strutting stride. attack: commanding blade sweep, mouth open mid-bellow.
16–18. **Skeleton** (`jam-skeleton-*`) — animated human skeleton, remnant armor scraps, shortsword and worn shield. walk: jerky marching stride. attack: rattling sword chop.
19–21. **Zombie** (`jam-zombie-*`) — shambling corpse, grave-tattered clothes, gray-green flesh. walk: lurching drag-step, arms slack. attack: both arms lunging forward, mouth agape.
22–24. **Ghoul** (`jam-ghoul-*`) — gaunt hairless ghoul, long claws, hunched predatory frame. walk: loping low stride, knuckles near ground. attack: pouncing double-claw rake.

---

## `jam-sheet-03-elites.png` — 6 subjects (18 cells)

Production format:
- sheetId: `J3`
- gridColumns: 6
- gridRows: 3
- capacity: 18
- cellAspect: `4:5`
- aspectStatus: `default`
- aspectReason: upright humanoid enemies (specter and shadow float but hold an upright humanoid silhouette).
- cellWidthPx: 200
- cellHeightPx: 250
- requestedCanvas: `1200 × 750`
- chromaKey: `#FF00FF`
- camera: `3/4 view facing left, ground-level, full body`
- order: left-to-right, then top-to-bottom — TWO subjects per row (cells 1–3 and 4–6)

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

Shared mechanical instructions: 6-column × 3-row grid, 18 cells, uniform cell boundaries, no subject crossing a boundary. ANIMATION-FRAME EXCEPTION IN FORCE: each subject occupies exactly three consecutive cells in row-major order — frame 1 walk A, frame 2 walk B (opposite stride of the same gait), frame 3 attack (mid-motion). Floaters (shadow, specter) substitute drift for stride: walk A = wisps trailing left, walk B = wisps trailing right. The same character identity, anatomy, equipment, palette, scale, and baseline must repeat exactly across a subject's three cells; only the pose changes. Frame runs never cross a row boundary: cells 1–3 of each row are one subject, cells 4–6 the next. Complete subject inside each cell with padding — no cropped feet, head, weapon, or limb. Full-body, ground-level, 3/4 view facing left. Expressive, characterful poses — never a neutral mannequin. Flat magenta #FF00FF background: no scenery, floor plane, labels, borders, watermark, background shadow, haze, or key-color contamination. Consistent scale and shared ground baseline across all six subjects. Apply the Style block above exactly.

Subjects, in row-major order (three cells each):

1–3. **Shadow** (`jam-shadow-*`) — humanoid silhouette of living darkness, edges smoking into wisps, faint pale eyes. drift A / drift B: gliding low above ground, wisps trailing. attack: surging forward, darkness flaring wide, claws of shadow extended.
4–6. **Specter** (`jam-specter-*`) — translucent hovering ghost, ragged burial shroud trailing to nothing below the waist, hollow glowing eyes. drift A / drift B: hovering sway. attack: wailing lunge, both spectral hands thrust forward.
7–9. **Knight** (`jam-knight-*`) — enemy knight in full plate with closed great helm, tower shield, arming sword, dark surcoat. walk: heavy armored march. attack: shield-wall advance with sword thrust over the shield rim.
10–12. **Werewolf** (`jam-werewolf-*`) — hybrid-form werewolf, torn clothing remnants, hunched muscular frame, bared fangs. walk: bestial two-legged lope. attack: savage double-claw slash, jaws wide.
13–15. **Wight** (`jam-wight-*`) — dread undead warrior, desiccated flesh, cold blue eyes, ancient longsword and rusted mail. walk: implacable measured march. attack: two-handed life-draining sword strike, blue energy at the blade.
16–18. **Mummy** (`jam-mummy-*`) — bandage-wrapped mummy trailing loose wrappings, dust seeping from joints. walk: stiff shuffling stride, one arm extended. attack: rotting fist swing, wrappings whipping.

---

## `jam-sheet-04-beasts.png` — 4 subjects (12 cells)

Production format:
- sheetId: `J4`
- gridColumns: 3
- gridRows: 4
- capacity: 12
- cellAspect: `5:4`
- aspectStatus: `subject-authorized`
- aspectReason: long quadrupeds and a wide-legged spider — landscape cells fit the body plan; a 4:5 portrait cell would crop the body length.
- cellWidthPx: 250
- cellHeightPx: 200
- requestedCanvas: `750 × 800`
- chromaKey: `#FF00FF`
- camera: `3/4 view facing left, ground-level, full body`
- order: left-to-right, then top-to-bottom — ONE subject per row (cells 1–3)

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

Shared mechanical instructions: 3-column × 4-row grid, 12 cells, uniform cell boundaries, no subject crossing a boundary. ANIMATION-FRAME EXCEPTION IN FORCE: each subject occupies exactly one full row of three cells — frame 1 walk A (quadruped gait, diagonal leg pair forward), frame 2 walk B (opposite diagonal pair forward; the spider alternates leg groups), frame 3 attack (mid-motion strike). The same creature identity, anatomy, palette, scale, and baseline must repeat exactly across a subject's three cells; only the pose changes. Complete subject inside each cell with padding — no cropped legs, tail, or snout. Full-body, ground-level, 3/4 view facing left. Expressive poses — never a static taxidermy stance. Flat magenta #FF00FF background: no scenery, floor plane, labels, borders, watermark, background shadow, haze, or key-color contamination. Consistent scale and shared ground baseline across the four subjects (giant rat smallest, dire wolf largest). Apply the Style block above exactly.

Subjects, one per row (three cells each):

1–3. **Giant Rat** (`jam-giant-rat-*`) — dog-sized rat, mangy brown fur, naked tail, yellow teeth. walk: scuttling trot. attack: rearing bite, incisors bared.
4–6. **Wolf** (`jam-wolf-*`) — lean gray wolf, hackles raised. walk: stalking trot, head low. attack: leaping bite, forepaws off the ground.
7–9. **Giant Spider** (`jam-giant-spider-*`) — horse-sized spider, bristled dark legs, clustered eyes glinting. walk A / walk B: alternating leg-group skitter. attack: front legs raised high, fangs spread, ready to strike.
10–12. **Dire Wolf** (`jam-dire-wolf-*`) — massive black-furred wolf, scarred muzzle, shoulder taller than a man's waist. walk: heavy predatory stride. attack: lunging savage bite, jaws wide.

---

## `jam-sheet-05-flyers.png` — 5 subjects (15 cells)

Production format:
- sheetId: `J5`
- gridColumns: 3
- gridRows: 5
- capacity: 15
- cellAspect: `5:4`
- aspectStatus: `subject-authorized`
- aspectReason: spread wings count toward the silhouette — landscape cells fit the wingspan.
- cellWidthPx: 250
- cellHeightPx: 200
- requestedCanvas: `750 × 1000`
- chromaKey: `#FF00FF`
- camera: `3/4 view facing left, airborne — no ground contact, no ground shadow`
- order: left-to-right, then top-to-bottom — ONE subject per row (cells 1–3)

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

Shared mechanical instructions: 3-column × 5-row grid, 15 cells, uniform cell boundaries, no subject crossing a boundary. ANIMATION-FRAME EXCEPTION IN FORCE: each subject occupies exactly one full row of three cells — flyers substitute wingbeat for stride: frame 1 fly A (wings raised at top of upbeat), frame 2 fly B (wings mid-downbeat, lowered), frame 3 attack (mid-motion strike). The same creature identity, anatomy, palette, scale, and altitude must repeat exactly across a subject's three cells; only the pose changes. Complete subject inside each cell with padding — no cropped wingtips, tail, or talons. Airborne 3/4 view facing left; no ground contact, no ground shadow. Expressive poses. Flat magenta #FF00FF background: no scenery, labels, borders, watermark, haze, or key-color contamination. Consistent scale across the five subjects (bat smallest, gargoyle largest). Apply the Style block above exactly.

Subjects, one per row (three cells each):

1–3. **Bat** (`jam-bat-*`) — small brown bat. fly A / fly B: wingbeat cycle. attack: diving screech, mouth open.
4–6. **Stirge** (`jam-stirge-*`) — cat-sized mosquito-bat hybrid, four wings, rigid proboscis. fly A / fly B: buzzing wingbeat. attack: diving with proboscis leveled like a lance.
7–9. **Imp** (`jam-imp-*`) — small red-skinned devil, barbed tail, leathery wings, wicked grin. fly A / fly B: lazy wingbeat, arms crossed. attack: tail-sting whip forward, claws spread.
10–12. **Harpy** (`jam-harpy-*`) — vulture-winged hag, taloned feet, wild hair. fly A / fly B: heavy wingbeat. attack: talons-first dive, mouth open mid-shriek.
13–15. **Gargoyle** (`jam-gargoyle-*`) — stone-skinned winged fiend, horned, cracked gray hide. fly A / fly B: ponderous stone wingbeat. attack: plunging double-claw strike.

---

## `jam-sheet-06-ogre.png` — 1 subject (3 cells)

Production format:
- sheetId: `J6`
- gridColumns: 3
- gridRows: 1
- capacity: 3
- cellAspect: `4:5`
- aspectStatus: `default`
- aspectReason: upright humanoid; large size band gets its own sheet (density law), larger cells preserve detail.
- cellWidthPx: 300
- cellHeightPx: 375
- requestedCanvas: `900 × 375`
- chromaKey: `#FF00FF`
- camera: `3/4 view facing left, ground-level, full body`
- order: left-to-right — ONE subject, three frames

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

Shared mechanical instructions: 3-column × 1-row grid, 3 cells, uniform cell boundaries, no subject crossing a boundary. ANIMATION-FRAME EXCEPTION IN FORCE: the single subject occupies all three cells — frame 1 walk A (mid-stride), frame 2 walk B (opposite stride of the same gait), frame 3 attack (mid-motion). The same creature identity, anatomy, equipment, palette, and scale must repeat exactly across the three cells; only the pose changes. Complete subject inside each cell with padding — no cropped head, feet, or club. Full-body, ground-level, 3/4 view facing left. Expressive poses. Flat magenta #FF00FF background: no scenery, floor plane, labels, borders, watermark, background shadow, haze, or key-color contamination. Apply the Style block above exactly.

Subjects:

1–3. **Ogre** (`jam-ogre-*`) — hulking ogre, pot belly, filthy hides, massive greatclub over one shoulder. walk: ground-shaking stride, club shouldered. attack: two-handed overhead club smash, mid-swing.

---

## `jam-sheet-07-large-winged.png` — 2 subjects (6 cells)

Production format:
- sheetId: `J7`
- gridColumns: 3
- gridRows: 2
- capacity: 6
- cellAspect: `5:4`
- aspectStatus: `subject-authorized`
- aspectReason: large winged quadrupeds — body length plus wings need landscape cells; large size band, own sheet per density law.
- cellWidthPx: 375
- cellHeightPx: 300
- requestedCanvas: `1125 × 600`
- chromaKey: `#FF00FF`
- camera: `3/4 view facing left, ground-level, full body`
- order: left-to-right, then top-to-bottom — ONE subject per row (cells 1–3)

Style block: Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). traditional Monster Manual fantasy illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading, medium value contrast, no genre-bending — this is Genesis's actual default/unreskinned fantasy world, the baseline every other realm departs from.

Shared mechanical instructions: 3-column × 2-row grid, 6 cells, uniform cell boundaries, no subject crossing a boundary. ANIMATION-FRAME EXCEPTION IN FORCE: each subject occupies one full row of three cells — frame 1 walk A (quadruped stride, wings folded), frame 2 walk B (opposite diagonal stride, wings folded), frame 3 attack (mid-motion, wings flared). The same creature identity, anatomy, palette, scale, and baseline must repeat exactly across a subject's three cells; only the pose changes. Complete subject inside each cell with padding — no cropped wings, heads, tails, or paws. Full-body, ground-level, 3/4 view facing left. Expressive poses. Flat magenta #FF00FF background: no scenery, floor plane, labels, borders, watermark, background shadow, haze, or key-color contamination. Consistent scale between the two subjects (chimera slightly larger). Apply the Style block above exactly.

Subjects, one per row (three cells each):

1–3. **Manticore** (`jam-manticore-*`) — lion-bodied beast with bat wings, spiked tail, and a leering human-like face. walk: prowling stride, tail arched. attack: tail whipped forward mid-spike-volley, wings flared.
4–6. **Chimera** (`jam-chimera-*`) — three-headed monster: lion's head roaring, goat's head butting, dragon's head breathing a gout of flame; lion body, dragon wings, serpentine tail. walk: heavy prowling stride, heads scanning. attack: all three heads striking at once — dragon head breathing fire — wings flared wide.

---

## Generation, inspection, and save rules

1. Read only one sheet's self-contained section plus the style authority
   (`fantasy.md`). Submit one generation call with the exact prompt — no
   paraphrase, no substitution, no reordering.
2. Save immediately as `dev/sprite-sheets/incoming/<outputFilename>`.
3. Re-open and inspect: dimensions, cell count, row-major identity, aspect,
   camera, complete silhouettes, chroma purity, style — AND the frame
   contract: does each subject's identity hold exactly across its three
   cells? Do walk A / walk B read as the two frames of one gait? A subject
   whose equipment, palette, or scale drifts between frames FAILS.
4. One regeneration per failure, repeating the violated clause exactly.
   Record honestly — generated does not mean passed.
5. Slice with `build/slice-sprites.py <incoming png> --expect <capacity>`
   against `dev/sprite-manifests/jam-defense-manifest.json` (author the
   manifest before the first slice; slugs above, sheet order, row-major).
   Output dir: `assets/sprites-jam/`. Always run `--review` and eyeball the
   contact sheet — a slug misassignment here means the wrong FRAME plays,
   which is worse than wrong art.

## Output receipt

| sheetId | outputPath | requestedCanvas | actualCanvas | requestedCellAspect | requestedCellDimensions | actualDerivedCellDimensions | aspectStatus | generationCallId | subjectCountExpected | subjectCountObserved | inspection | failureReasons | regenerationCount |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| J1 | | 1200 × 750 | | 4:5 | 200 × 250 | | default | | 6 | | | | |
| J2 | | 1200 × 1000 | | 4:5 | 200 × 250 | | default | | 8 | | | | |
| J3 | | 1200 × 750 | | 4:5 | 200 × 250 | | default | | 6 | | | | |
| J4 | | 750 × 800 | | 5:4 | 250 × 200 | | subject-authorized | | 4 | | | | |
| J5 | | 750 × 1000 | | 5:4 | 250 × 200 | | subject-authorized | | 5 | | | | |
| J6 | | 900 × 375 | | 4:5 | 300 × 375 | | default | | 1 | | | | |
| J7 | | 1125 × 600 | | 5:4 | 375 × 300 | | subject-authorized | | 2 | | | | |
