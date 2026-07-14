You are a sprite-generation worker for the Genesis faceted art program. Your batch:
R3 menagerie REMAINDER (49 identities; 56 already harvested to /Volumes/Genesis/faceted-harvest-2026-07-14), all 22 sheets. Everything you need is pasted below — do NOT read repo files for subjects;
this prompt is the complete, authoritative source. You have image generation; use it
for every sheet.

Rules — these are the whole job:
1. For each sheet section IN ORDER: submit ONE image-generation call consisting of the
   PASTE BLOCK below with [N] and [N x 887] filled in from that sheet's header, followed
   by that sheet's numbered cell list. Nothing added, nothing substituted, no subjects
   invented. EXCEPTION for sheets whose ids start with fx-: use the effects contract
   noted in the sheet's own section instead of the magenta figure block (hybrid
   faceted+glow, single-frame, black/alpha key); shared-*-decal sheets stay magenta-key
   top-down.
2. Create a fresh directory named r3c-returns/ before the first call. It must start
   EMPTY — if it already contains files, STOP and report that instead of generating.
   Save each result IMMEDIATELY as r3c-returns/raw-figures/<first-cell-id>-candidate-001.png.
3. After each save, RE-OPEN the saved file and verify: correct cell count, all four
   corners #FF00FF (for magenta sheets), no figure touching any image edge, every tail
   ends in exactly ONE tip, wyverns bipedal, correct limb counts — AND the tone gates:
   realistic horror dark-fantasy, naturalistic slightly-elongated proportions; if a figure
   reads chibi, cute, bright-saturated, or cartoon-MMO, it is OFF-MODEL: re-roll once,
   then mark FAILED. Do NOT substitute a different subject and do NOT rename another
   file to fill the slot.
4. Append one JSON row per call to r3c-returns/provenance/r3c-generation-calls.json:
   {"file": "...", "callId": "...", "cells": ["..."]} — written at save time, not
   reconstructed later.
5. Do NOT run any git commands. Files on disk plus the provenance JSON are your entire
   deliverable; committing happens elsewhere.
6. Your final report is only trusted if it matches the directory exactly. Report:
   sheets attempted, sheets saved, sheets FAILED (with reasons), and the full filename
   list. "Generated 20, saved 17, 3 failed" is a good report. A report claiming more
   than the directory holds will be treated as fabricated — the last run's reports were
   audited file-by-file and the fabrications were found.

=== PASTE BLOCK (use in every call, fill [N] and [N x 887]) ===

> Render a character sprite sheet as a single image: a horizontal strip of **[N] equal vertical
> cells**, total canvas **[N×887]×1774** (each cell 887×1774, a 4:8 portrait). Solid flat magenta
> **#FF00FF** background in every cell — no gradient, no vignette, no scene, no pedestal or base,
> no cast shadow on the ground, no washed-out pink and no darkened purple: pure #FF00FF to the
> corners. One figure per cell, hard invisible cell boundaries, nothing crossing between cells,
> no shared props. Each figure **fully inside its cell with clear margin on all four sides — the
> complete body, head to toe, weapon tips and wingtips and tail included; nothing may touch or
> clip the image edge.** Consistent scale across cells (heads line up); orthographic-leaning 3/4
> view; every figure in an expressive mid-action pose that captures its essence — mid-lunge,
> mid-cast, braced, snarling — never a T-pose or idle stand.
>
> Art style: **crisp, hard-edged TRIANGULATED low-poly faceting** — the entire surface of every
> figure reads as flat triangular planes, like a faceted 3D sculpture; painterly texture and
> material detail live ON the facet planes, never dissolving them. No smooth organic rendering,
> no photoreal, no pixel-art, no soft/mushy half-faceting — if a face, hair, or fabric area goes
> smooth, the render is off-model.
>
> Tone is **realistic horror dark-fantasy**: grim, weathered, unsettling; muted desaturated
> palette of earth, bone, ash, rust, and shadow with at most one controlled accent color per
> figure — never bright saturated hero-fantasy colors. Proportions are **naturalistic and
> slightly elongated** — adult head-to-body ratio around 1:7 to 1:8, lean gaunt silhouettes,
> long limbs and fingers; monsters read as disturbing and anatomically plausible, not cute or
> heroic. HARD NEGATIVE GATES (any of these is an automatic off-model reject): no chibi or
> oversized heads, no stubby limbs, no oversized cartoon weapons or pauldrons, no
> stylized-MMO/action-RPG cartoon look (nothing resembling World of Warcraft, Torchlight,
> Hearthstone, Fortnite, or mobile-game art), no cute/juvenile/big-eyed faces, no candy
> saturation, no thick outlines, no glossy toy-plastic sheen. Do not imitate any specific
> commercial game's promotional art style either — this is its own grounded horror-naturalism
> expressed through the faceted geometry.
>
> Anatomy is strict: **exactly one tail with exactly one tip** on any tailed creature — no
> forked, mirrored, doubled, or floating tail segments; correct limb counts (wyverns are BIPEDAL
> — two legs plus wings; nagas have no arms; no fifth leg, no third wing); tails and wings
> connect to the body at one continuous, plausible joint. The figures, left to right:
> **[numbered cell list from the batch doc]**

=== YOUR SHEETS, IN ORDER ===

### Sheet R3-01 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-gnoll-demoniac` (Large) — demon-warped gnoll, distended and clawed. verb: DESECRATES.

### Sheet R3-02 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-gnoll-fang-of-the-beast` (Medium) — frothing demon-touched gnoll champion. verb: FRENZIES.
2. `spr-fantasy-gnoll-pack-lord` (Medium) — bigger scarred gnoll leader, trophy fetishes, flail. verb: DRIVES-THE-PACK.
3. `spr-fantasy-gnoll-warrior` (Medium) — hyena-headed gnoll raider, scavenged spear+hide. verb: HOWL-RUSHES.
4. `spr-fantasy-gray-ooze` (Medium) — slick metallic-grey puddle rearing a strike-tendril. verb: SEEPS.

### Sheet R3-03 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-half-ogre-ogrillon` (Large) — half-ogre brute, more human proportion, scavenged armor, heavy blade. verb: MUSCLES-IN.

### Sheet R3-04 — 3 cells (Medium)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-harpy` (Medium) — winged harpy, filthy feathers, taloned, luring posture. verb: SINGS-TO-LURE.
2. `spr-fantasy-harpy-matriarch` (Medium) — elder harpy, bone ornaments, wings spread-then-furled (keep compact). verb: COMMANDS-THE-FLOCK.
3. `spr-fantasy-hell-hound` (Medium) — hell-hound, char-black hide, ember eyes, ember-lit maw (as material, no flame plume). verb: STALKS-HOT.

### Sheet R3-05 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-horned-devil` (Large) — winged horned devil, forked tail, huge horns, whip-tail barb. verb: TOWERS.
2. `spr-fantasy-ice-devil` (Large) — insectoid ice devil, chitin rimed with frost, spear. verb: ADVANCES-COLD.

### Sheet R3-06 — 1 cell (Small)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-ice-mephit` (Small) — small blue ice mephit, jagged frost wings. verb: HISSES.

### Sheet R3-07 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-iron-golem` (Large) — massive riveted iron golem, temple-idol face. verb: STANDS-IMMOVABLE.

### Sheet R3-08 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-lizardfolk-geomancer` (Medium) — lizardfolk shaman, bone-and-stone totem staff. verb: CALLS-THE-STONE.
2. `spr-fantasy-lizardfolk-sovereign` (Medium) — crocodilian lizardfolk king, trophy crown, heavy blade. verb: RULES-COLD.
3. `spr-fantasy-magma-mephit` (Small) — small cracked-crust magma mephit, glowing seams. verb: SPUTTERS.
4. `spr-fantasy-medusa` (Medium) — serpent-haired medusa, bow, stone-cold stare, coiled lower stance (compact). verb: FIXES-THE-GAZE.

### Sheet R3-09 — 3 cells (Medium)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-merfolk-skirmisher` (Medium) — merfolk fighter, coral spear, kelp harness (upright display pose). verb: DARTS.
2. `spr-fantasy-merfolk-wavebender` (Medium) — merfolk tide-caller, shell focus, flowing gesture. verb: BENDS-THE-TIDE.
3. `spr-fantasy-mimic` (Medium) — treasure chest half-transformed, pseudopod and tongue and teeth. verb: SNAPS-SHUT.

### Sheet R3-10 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-otyugh` (Large) — tentacled dung-beast, three eye-stalk stem, toothed maw. verb: DRAGS-IN.

### Sheet R3-11 — 3 cells (Medium)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-psychic-gray-ooze` (Medium) — grey ooze with a faint psionic sheen, warped surface. verb: PROBES.
2. `spr-fantasy-quasit` (Tiny) — tiny chaotic quasit, warty green, needle claws. verb: SKITTERS.
3. `spr-fantasy-rust-monster` (Medium) — armored insect, feather-antennae, tail-paddle, scuttling. verb: CORRODES.

### Sheet R3-12 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-sahuagin-baron` (Large) — huge four-armed sahuagin baron, twin tridents. verb: COMMANDS-THE-DEEP.

### Sheet R3-13 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-sahuagin-priest` (Medium) — sahuagin priest, coral fetishes, clawed benediction. verb: INVOKES.
2. `spr-fantasy-sahuagin-warrior` (Medium) — shark-toothed sea devil, trident, finned. verb: SPEARS.
3. `spr-fantasy-satyr` (Medium) — goat-legged satyr, panpipes, sly stance. verb: PLAYS-A-TRICK.
4. `spr-fantasy-satyr-revelmaster` (Medium) — flamboyant satyr revel-leader, wine and pipes. verb: LEADS-THE-REVEL.

### Sheet R3-14 — 1 cell (Small)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-smoke-mephit` (Small) — small smoky mephit, half-dissolving edges (material). verb: CURLS.

### Sheet R3-15 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-sphinx-of-lore` (Large) — gynosphinx, lioness body + human face, feathered wings furled (compact). verb: POSES-THE-RIDDLE.
2. `spr-fantasy-sphinx-of-secrets` (Large) — secretive gynosphinx, veiled gaze, wings tucked. verb: WITHHOLDS.

### Sheet R3-16 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-sphinx-of-valor` (Large) — androsphinx, maned lion body, wings furled, roaring resolve. verb: JUDGES.

### Sheet R3-17 — 3 cells (Tiny)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-sphinx-of-wonder` (Tiny) — tiny cat-sized winged sphinx-kitten, curious (awe not cute-mascot). verb: WONDERS.
2. `spr-fantasy-spined-devil` (Small) — small winged spined devil, tail-spikes ready to throw. verb: DARTS.
3. `spr-fantasy-steam-mephit` (Small) — small scalding steam mephit, wet gleam. verb: SPITS.

### Sheet R3-18 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-stone-golem` (Large) — carved stone golem, archaic armor relief, blank eyes. verb: STEPS-DOWN.

### Sheet R3-19 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-troglodyte` (Medium) — stooped cave troglodyte, crest, stone club, reeking. verb: SKULKS.
2. `spr-fantasy-vampire` (Medium) — aristocratic vampire, pale, immaculate dark finery, quiet menace. verb: APPRAISES-PREY.
3. `spr-fantasy-vampire-familiar` (Medium) — thrall familiar, human servant marked by fang-scars, watchful. verb: SERVES.
4. `spr-fantasy-vampire-nightbringer` (Medium) — elite warrior-vampire, dark armor, curved blade. verb: DESCENDS.

### Sheet R3-20 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-vampire-spawn` (Medium) — feral fledgling vampire, bloodstained, crouched. verb: HUNGERS.
2. `spr-fantasy-vampire-umbral-lord` (Medium) — shadow-wreathed vampire lord, edges bleeding to dark (material). verb: COMMANDS-NIGHT.

### Sheet R3-21 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-water-elemental` (Large) — curling faceted wave given a torso and reaching arms. verb: SURGES.
2. `spr-fantasy-yuan-ti-abomination` (Large) — full serpent-bodied yuan-ti abomination, hooded cobra crown, bow. verb: TOWERS-AND-SWAYS.

### Sheet R3-22 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-yuan-ti-infiltrator` (Medium) — near-human yuan-ti spy, faint scales, hooded robe hiding serpent traits. verb: PASSES-UNSEEN.
2. `spr-fantasy-yuan-ti-malison-type-1` (Medium) — yuan-ti with a serpent HEAD on a human body, scimitar. verb: HISSES-COMMAND.
3. `spr-fantasy-yuan-ti-malison-type-2` (Medium) — yuan-ti with serpent ARMS instead of hands, bow. verb: CONSTRICTS.
4. `spr-fantasy-yuan-ti-malison-type-3` (Medium) — yuan-ti with a serpent lower body instead of legs (compact coil, §0). verb: COILS-UP.
