You are a sprite-generation worker for the Genesis faceted art program. Your batch:
RQ quality re-dos, sheets RQ-36 to end. Everything you need is pasted below — do NOT read repo files for subjects;
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
2. Create a fresh directory named rqb-returns/ before the first call. It must start
   EMPTY — if it already contains files, STOP and report that instead of generating.
   Save each result IMMEDIATELY as rqb-returns/raw-figures/<first-cell-id>-candidate-001.png.
3. After each save, RE-OPEN the saved file and verify: correct cell count, all four
   corners #FF00FF (for magenta sheets), no figure touching any image edge, every tail
   ends in exactly ONE tip, wyverns bipedal, correct limb counts — AND the tone gates:
   realistic horror dark-fantasy, naturalistic slightly-elongated proportions; if a figure
   reads chibi, cute, bright-saturated, or cartoon-MMO, it is OFF-MODEL: re-roll once,
   then mark FAILED. Do NOT substitute a different subject and do NOT rename another
   file to fill the slot.
4. Append one JSON row per call to rqb-returns/provenance/rqb-generation-calls.json:
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

### Sheet RQ-36 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-blue-dragon` (Medium) — (no seed row — derive from slug)
2. `spr-fantasy-brass-dragon` (Medium) — (no seed row — derive from slug)

### Sheet RQ-37 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-hill-giant` (Huge) — dull brutal hill giant, patched hides, uprooted-tree club, gut of endless eating. verb: SWINGS-LOW.


## F8 re-dos (15 identities)

Failed files (reason digest):
- `spr-fantasy-blob-of-annihilation-candidate-001.png` — note:content mismatch: two dwarf NPCs, not a blob of annihilation
- `spr-fantasy-deep-brute-spr-fantasy-deep-brute-thonot-candidate-001.png` — note:content mismatch: single gray dragon instead of expected deep-brute two-cell pai
- `spr-fantasy-elder-deep-thing-candidate-001.png` — note:content mismatch: werewolf figure, not an elder deep thing aberration
- `spr-fantasy-grell-spr-fantasy-secret-eye-candidate-001.png` — note:content mismatch: fx-style green crystal burst on black background, no creatures
- `spr-fantasy-hook-horror-candidate-001.png` — note:content mismatch: human gladiator with trident and net, not a hook horror
- `spr-fantasy-mind-thief-spr-fantasy-mind-thief-arcanist-candidate-001.png` — bg-rekey:pale-pink; note:content mismatch: 4-cell sheet of small animals (caged ferret, caged bird, duck,
- `spr-fantasy-piercer-candidate-001.png` — note:content mismatch: harnessed draft horse, not a piercer
- `spr-fantasy-roper-candidate-001.png` — note:content mismatch: 4-cell sheet of small animals (caged canary, rat, axolotl, cri
- `spr-fantasy-umber-hulk-candidate-001.png` — note:content mismatch: six-winged angel figure (apparent duplicate of F7 solar), not 
- `spr-fantasy-void-monk-monk-spr-fantasy-void-monk-psion-candidate-001.png` — note:content mismatch: filename says void-monk figures but sheet shows fish/songbird/
- `spr-fantasy-void-monk-zerth-candidate-001.png` — note:content mismatch: filename says void-monk zerth but image shows two ranger/arche

### Sheet RQ-38 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-blob-of-annihilation` (Gargantuan) — blob of annihilation, a world-eating ooze of event-horizon-black facets studded with half-dissolved relics and bones, fill the frame. verb: UNMAKES.

### Sheet RQ-39 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-deep-brute` (Medium) — shaggy deep brute, matted grey-white fur, long raking claws, knuckled cave-ape hunch. verb: MAULS.
2. `spr-fantasy-deep-brute-thonot` (Medium) — deep-brute thonot, the pack's psychic, fur bristling with a psionic sheen as material, bone fetishes knotted in. verb: BENDS-THE-CAVE.

### Sheet RQ-40 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-elder-deep-thing` (Large) — elder deep thing, the colony's hive-tyrant — a vast exposed brain-mass in a brine slick, trailing tentacles COILED TIGHT beneath it. verb: THINKS-THE-COLONY.

### Sheet RQ-41 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-grell` (Medium) — floating grell, an exposed brain-body with a hooked beak, ten barbed tendrils drawn in under it (compact §0). verb: DESCENDS-SILENT.

### Sheet RQ-42 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-hook-horror` (Large) — hook horror, vulture-beaked head, hook-bladed forelimbs held close to the body, chitin scarred by tunnel walls. verb: CLIMBS-TO-STRIKE.

### Sheet RQ-43 — 3 cells (Medium)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-mind-thief` (Medium) — tentacled skull-faced mind-thief, four facial tentacles held close, mauve hide, high-collared robe, milk-white eyes, psychic poise. verb: PEELS-THE-MIND.
2. `spr-fantasy-mind-thief-arcanist` (Medium) — mind-thief arcanist, same tentacled skull-face, sigil-etched robe, one arcane focus staff. verb: WEAVES-THOUGHT.
3. `spr-fantasy-piercer` (Medium) — piercer, a living stalactite — soft snail-thing sealed in a stone cone, point down, waiting. verb: FALLS-POINT-FIRST.

### Sheet RQ-44 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-roper` (Large) — roper, stalagmite-mimic body, single yellow eye over a toothed maw, sticky strand-tendrils coiled close — NOT strung across the frame. verb: REELS-IN.

### Sheet RQ-45 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-secret-eye` (Medium) — secret-eye, a floating orb-watcher — one great central eye, four eyestalks curled tight to the crown, lesser kin of the eye tyrant. verb: OBSERVES-UNBLINKING.

### Sheet RQ-46 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-umber-hulk` (Large) — umber hulk, beetle-armored burrower, great mandibles, four confusion-gleam eyes (gleam as material), digging claws gathered. verb: BREACHES-THE-WALL.

### Sheet RQ-47 — 3 cells (Medium)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-void-monk-monk` (Medium) — void-monk ascetic, humanoid warped by the void — dark facet planes crawling across skin as material, wrapped robes, open-hand stance. verb: STRIKES-FROM-STILLNESS.
2. `spr-fantasy-void-monk-psion` (Medium) — void-monk psion, void facets sheathing both forearms as material (no shadow plume), robes austere, gaze elsewhere. verb: FOLDS-SPACE.
3. `spr-fantasy-void-monk-zerth` (Medium) — void-monk zerth, the veteran blade-ascetic, one curved sword, void-facet scarring along the sword arm. verb: CUTS-BETWEEN-MOMENTS.


## F9 re-dos (4 identities)

Failed files (reason digest):
- `spr-fantasy-bat-raven-owl-hawk-candidate-001.png` — bg:white
- `spr-fantasy-blood-hawk-eagle-candidate-001.png` — bg-rekey:pale-pink; note:4-cell sheet with only 2 birds; cells 3-4 empty; both figures sit small and low 
- `spr-fantasy-panther-hyena-candidate-001.png` — bg:white
- `spr-fantasy-venomous-snake-flying-snake-candidate-001.png` — anatomy:minor:4-cell sheet with only 2 cells populated: right two cells are empty (both snake ; bg:scene/other

### Sheet RQ-48 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-bat-raven-owl-hawk` (Medium) — (no seed row — derive from slug)
2. `spr-fantasy-blood-hawk-eagle` (Medium) — (no seed row — derive from slug)
3. `spr-fantasy-panther-hyena` (Medium) — (no seed row — derive from slug)
4. `spr-fantasy-venomous-snake-flying-snake` (Medium) — (no seed row — derive from slug)


## F10 re-dos (11 identities)

Failed files (reason digest):
- `spr-fantasy-arch-hag-candidate-001.png` — style-drift:photoreal
- `spr-fantasy-awakened-shrub__spr-fantasy-the-twig-blight-candidate-001.png` — note:4-cell sheet with only top 2 cells populated; bottom 2 cells empty magenta
- `spr-fantasy-bandit-enforcer-candidate-003.png` — style-drift:soft-facet
- `spr-fantasy-bandit-enforcer-candidate-004.png` — style-drift:soft-facet
- `spr-fantasy-homunculus-candidate-001.png` — style-drift:smooth
- `spr-fantasy-myconid-sovereign-candidate-001.png` — style-drift:smooth
- `spr-fantasy-myconid-sprout-candidate-001.png` — style-drift:smooth
- `spr-fantasy-ornate-heraldic-shield-candidate-001.png` — style-drift:smooth; bg:scene/other; note:green chroma background instead of magenta
- `spr-fantasy-ornate-heraldic-shield-candidate-002.png` — style-drift:smooth; bg:scene/other; note:green chroma background instead of magenta
- `spr-fantasy-ornate-heraldic-shield-candidate-003.png` — style-drift:smooth; bg:scene/other; note:green chroma background instead of magenta
- `spr-fantasy-ornate-heraldic-shield-candidate-004.png` — style-drift:smooth; bg:scene/other; note:green chroma background instead of magenta
- `spr-fantasy-pixie__spr-fantasy-pixie-wonderbringer__spr-fantasy-sprite-candidate-001.png` — style-drift:soft-facet; bg-rekey:pale-pink
- …and 1 more (see qa-ledger.json)

### Sheet RQ-49 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-arch-hag` (Large) — arch-hag, paramount crone of the covens, crown of knotted trophy braids, court-robes of stitched bargains. verb: HOLDS-COURT.

### Sheet RQ-50 — 3 cells (Small)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-awakened-shrub` (Small) — awakened shrub, ambulatory bramble-mass on knotted root-feet, leaf-shiver menace. verb: RUSTLES-CLOSER.
2. `spr-fantasy-bandit-enforcer` (Medium) — (no seed row — derive from slug)
3. `spr-fantasy-homunculus` (Tiny) — homunculus, bat-winged clay-flesh servitor, stitched seams, needle teeth. verb: PERCHES-REPORTING.

### Sheet RQ-51 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-myconid-sovereign` (Large) — myconid sovereign, towering crowned cap, hanging fungal veils like court robes. verb: PRESIDES.

### Sheet RQ-52 — 4 cells (Small)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-myconid-sprout` (Small) — myconid sprout, waist-high mushroom-folk child, soft cap, spore-dust pores. verb: DRIFTS-SPORES.
2. `spr-fantasy-pixie` (Tiny) — pixie, sharp alien fey, needle features, dragonfly wings furled tight. verb: REGARDS-COLDLY.
3. `spr-fantasy-pixie-wonderbringer` (Tiny) — pixie wonderbringer, elder pixie, thistle crown, one pouch of dream-dust. verb: BESTOWS-STRANGENESS.
4. `spr-fantasy-sprite` (Tiny) — sprite, tiny armored fey duelist, one thorn-needle rapier, moth wings furled. verb: PRESENTS-THE-THORN.

### Sheet RQ-53 — 1 cell (Small)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-the-twig-blight` (Small) — twig blight, brittle child-sized stick-figure, hooked twig claws, sap-dark eye pits. verb: CREAKS-FORWARD.

### Sheet RQ-54 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-violet-fungus-necrohulk` (Large) — violet fungus necrohulk, corpse-fed fungal mass grown huge, bodies half-digested in the stalk. verb: LOOMS-FESTERING.


## F11 re-dos (8 identities)

Failed files (reason digest):
- `spr-fantasy-commoner-spr-fantasy-noble-candidate-001.png` — bg:white
- `spr-fantasy-mage-spr-fantasy-archmage-candidate-001.png` — bg:white
- `spr-fantasy-ornate-heraldic-shield-candidate-001.png` — style-drift:smooth; bg:scene/other
- `spr-fantasy-ornate-heraldic-shield-candidate-002.png` — style-drift:smooth; bg:scene/other
- `spr-fantasy-ornate-heraldic-shield-candidate-003.png` — style-drift:smooth; bg:scene/other
- `spr-fantasy-ornate-heraldic-shield-candidate-004.png` — style-drift:smooth; bg:scene/other
- `spr-fantasy-priest-acolyte-spr-fantasy-lantern-sage-candidate-001.png` — bg:white
- `spr-fantasy-wereboar-spr-fantasy-werebear-candidate-001.png` — cropped; note:wereboar's hammer haft clipped flat by left image edge

### Sheet RQ-55 — 4 cells (Medium / monster)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-archmage` (Medium / monster) — master wizard, utter unhurried calm, layered formal robes, ornate staff, chained grimoire at the hip — the MASTER half; taller bearing, richer silhouette. verb: NEED-NOT-HURRY.
2. `spr-fantasy-commoner` (Medium / NPC) — ordinary townsperson of a hard world, wary deference, patched wool, hand-sickle at the belt, bundle over one shoulder, restrained standing pose. verb: KEEPS-HEAD-DOWN.
3. `spr-fantasy-lantern-sage` (Medium / NPC) — itinerant scholar-mystic, patient curiosity, hooded lantern hung from a walking staff (lit glow reads as faceted material, §9 — no plume), scroll case, restrained pose. verb: CARRIES-THE-LIGHT.
4. `spr-fantasy-mage` (Medium / monster) — journeyman battle-caster, guarded and hungry to prove it, plain robes, simple staff, component pouch — the APPRENTICE half of the mage/archmage contrast. verb: SHAPES-THE-SPELL.

### Sheet RQ-56 — 4 cells (Medium / NPC)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-noble` (Medium / NPC) — soft-living aristocrat, entitled composure, fur-trimmed cloak, signet ring, thin ceremonial rapier worn never used; well-fed girth is diegetic here (§0). verb: EXPECTS-DEFERENCE.
2. `spr-fantasy-priest-acolyte` (Medium / NPC) — young adult acolyte, earnest and unsure, cold censer, prayer book, plain novice robe, restrained attentive pose. verb: FOLLOWS-THE-RITE.
3. `spr-fantasy-werebear` (Medium / monster) — massive bear-hybrid, shredded shirt on a frame twice too big for it, no weapon — clawed hands, sorrowful rage. verb: MAULS.
4. `spr-fantasy-wereboar` (Medium / monster) — tusked boar-hybrid bursting the seams of farmer's clothes, bristle-backed, maul, blunt fury. verb: GORES-THROUGH.


## F12 re-dos (6 identities)

Failed files (reason digest):
- `spr-fantasy-builder-dragonborn-land-worker-dragonborn-candidate-001.png` — cropped; note:builder's brick tray clipped by left image edge
- `spr-fantasy-dragonborn-ship-s-purser-temple-acolyte-candidate-001.png` — cropped; note:both figures' tails clipped at outer cell edges
- `spr-fantasy-elven-herbalist-elf-sells-cures-and-quietly-a-few-curses-hauler-elf-candidate-001.png` — cropped; bg:white; note:hauler's carry-pole and right crate clipped by right image edge
- `spr-fantasy-gnomish-alchemist-clockmaker-tinkerer-delver-candidate-001.png` — bg:white
- `spr-fantasy-host-goliath-pampered-elite-goliath-candidate-001.png` — style-drift:soft-facet; bg-rekey:pale-pink
- `spr-fantasy-tiefling-fortune-teller-rival-candidate-001.png` — bg:white

### Sheet RQ-57 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-builder-dragonborn-land-worker-dragonborn` (Medium) — (no seed row — derive from slug)
2. `spr-fantasy-dragonborn-ship-s-purser-temple-acolyte` (Medium) — (no seed row — derive from slug)
3. `spr-fantasy-elven-herbalist-elf-sells-cures-and-quietly-a-few-curses-hauler-elf` (Medium) — (no seed row — derive from slug)
4. `spr-fantasy-gnomish-alchemist-clockmaker-tinkerer-delver` (Medium) — (no seed row — derive from slug)

### Sheet RQ-58 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-host-goliath-pampered-elite-goliath` (Medium) — (no seed row — derive from slug)
2. `spr-fantasy-tiefling-fortune-teller-rival` (Medium) — (no seed row — derive from slug)


## F13 re-dos (4 identities)

Failed files (reason digest):
- `spr-fantasy-domestic-animal-goat-goose-peacock-turkey-candidate-001.png` — cropped; bg:white; note:goat clipped by left image edge; turkey tail fan clipped by right image edge
- `spr-fantasy-dungeon-animal-canary-cave-rat-salamander-cricket-candidate-001.png` — cropped; note:birdcage clipped at left image edge; cricket hind leg clipped at right image edg
- `spr-fantasy-wild-animal-a-lynx-kitten-peregrine-falcon-red-fox-kit-watcher-hawk-candidate-001.png` — cropped; bg-rekey:pale-pink; note:lynx kitten tail tip touches top edge; hawk perch rock clipped at bottom edg
- `spr-fantasy-wild-animal-black-bear-mountain-goat-candidate-001.png` — cropped; bg:white; note:mountain goat's rock outcrop clipped at right image edge

### Sheet RQ-59 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-domestic-animal-goat-goose-peacock-turkey` (Medium) — (no seed row — derive from slug)
2. `spr-fantasy-dungeon-animal-canary-cave-rat-salamander-cricket` (Medium) — (no seed row — derive from slug)
3. `spr-fantasy-wild-animal-a-lynx-kitten-peregrine-falcon-red-fox-kit-watcher-hawk` (Medium) — (no seed row — derive from slug)
4. `spr-fantasy-wild-animal-black-bear-mountain-goat` (Medium) — (no seed row — derive from slug)


## F15 re-dos (39 identities)

Failed files (reason digest):
- `spr-pc-dragonborn-barbarian-candidate-001.png` — style-drift:soft-facet
- `spr-pc-dragonborn-bard-candidate-001.png` — style-drift:photoreal
- `spr-pc-dragonborn-druid-candidate-001.png` — style-drift:photoreal
- `spr-pc-dragonborn-paladin-candidate-001.png` — style-drift:photoreal; cropped; note:left figure's sword tip clipped by left edge
- `spr-pc-dragonborn-rogue-candidate-001.png` — style-drift:smooth; cropped; bg-rekey:pale-pink; note:left figure's dagger blade clipped by left edge
- `spr-pc-dragonborn-sorcerer-candidate-001.png` — bg:white
- `spr-pc-dragonborn-wizard-candidate-001.png` — style-drift:photoreal
- `spr-pc-dwarf-barbarian-candidate-001.png` — style-drift:photoreal
- `spr-pc-dwarf-fighter-candidate-001.png` — style-drift:soft-facet
- `spr-pc-goliath-ranger-candidate-001.png` — cropped; bg-rekey:dark-magenta; note:female's sword blade appears clipped at left image edge
- `spr-pc-goliath-wizard-candidate-001.png` — bg:white
- `spr-pc-halfling-barbarian-candidate-001.png` — style-drift:painterly
- …and 27 more (see qa-ledger.json)

### Sheet RQ-60 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-dragonborn-barbarian` (Medium) — (no seed row — derive from slug)
2. `spr-pc-dragonborn-bard` (Medium) — (no seed row — derive from slug)
3. `spr-pc-dragonborn-druid` (Medium) — (no seed row — derive from slug)
4. `spr-pc-dragonborn-paladin` (Medium) — (no seed row — derive from slug)

### Sheet RQ-61 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-dragonborn-rogue` (Medium) — (no seed row — derive from slug)
2. `spr-pc-dragonborn-sorcerer` (Medium) — (no seed row — derive from slug)
3. `spr-pc-dragonborn-wizard` (Medium) — (no seed row — derive from slug)
4. `spr-pc-dwarf-barbarian` (Medium) — (no seed row — derive from slug)

### Sheet RQ-62 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-dwarf-fighter` (Medium) — (no seed row — derive from slug)
2. `spr-pc-goliath-ranger` (Medium) — (no seed row — derive from slug)
3. `spr-pc-goliath-wizard` (Medium) — (no seed row — derive from slug)
4. `spr-pc-halfling-barbarian` (Medium) — (no seed row — derive from slug)

### Sheet RQ-63 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-halfling-bard` (Medium) — (no seed row — derive from slug)
2. `spr-pc-halfling-cleric` (Medium) — (no seed row — derive from slug)
3. `spr-pc-halfling-druid` (Medium) — (no seed row — derive from slug)
4. `spr-pc-halfling-fighter` (Medium) — (no seed row — derive from slug)

### Sheet RQ-64 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-halfling-monk` (Medium) — (no seed row — derive from slug)
2. `spr-pc-halfling-paladin` (Medium) — (no seed row — derive from slug)
3. `spr-pc-halfling-ranger` (Medium) — (no seed row — derive from slug)
4. `spr-pc-halfling-rogue` (Medium) — (no seed row — derive from slug)

### Sheet RQ-65 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-halfling-sorcerer` (Medium) — (no seed row — derive from slug)
2. `spr-pc-halfling-warlock` (Medium) — (no seed row — derive from slug)
3. `spr-pc-halfling-wizard` (Medium) — (no seed row — derive from slug)
4. `spr-pc-orc-cleric` (Medium) — (no seed row — derive from slug)

### Sheet RQ-66 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-orc-monk` (Medium) — (no seed row — derive from slug)
2. `spr-pc-orc-paladin` (Medium) — (no seed row — derive from slug)
3. `spr-pc-orc-ranger` (Medium) — (no seed row — derive from slug)
4. `spr-pc-orc-rogue` (Medium) — (no seed row — derive from slug)

### Sheet RQ-67 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-orc-warlock` (Medium) — (no seed row — derive from slug)
2. `spr-pc-orc-wizard` (Medium) — (no seed row — derive from slug)
3. `spr-pc-tiefling-barbarian` (Medium) — (no seed row — derive from slug)
4. `spr-pc-tiefling-bard` (Medium) — (no seed row — derive from slug)

### Sheet RQ-68 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-tiefling-fighter` (Medium) — (no seed row — derive from slug)
2. `spr-pc-tiefling-monk` (Medium) — (no seed row — derive from slug)
3. `spr-pc-tiefling-paladin` (Medium) — (no seed row — derive from slug)
4. `spr-pc-tiefling-ranger` (Medium) — (no seed row — derive from slug)

### Sheet RQ-69 — 3 cells (Medium)

Canvas 2661×1774, 3 equal vertical 4:8 cells. The figures, left to right:

1. `spr-pc-tiefling-rogue` (Medium) — (no seed row — derive from slug)
2. `spr-pc-tiefling-warlock` (Medium) — (no seed row — derive from slug)
3. `spr-pc-tiefling-wizard` (Medium) — (no seed row — derive from slug)
