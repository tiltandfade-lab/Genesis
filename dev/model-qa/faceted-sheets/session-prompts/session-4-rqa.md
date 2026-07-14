You are a sprite-generation worker for the Genesis faceted art program. Your batch:
RQ quality re-dos, sheets RQ-01 through RQ-35. Everything you need is pasted below — do NOT read repo files for subjects;
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
2. Create a fresh directory named rqa-returns/ before the first call. It must start
   EMPTY — if it already contains files, STOP and report that instead of generating.
   Save each result IMMEDIATELY as rqa-returns/raw-figures/<first-cell-id>-candidate-001.png.
3. After each save, RE-OPEN the saved file and verify: correct cell count, all four
   corners #FF00FF (for magenta sheets), no figure touching any image edge, every tail
   ends in exactly ONE tip, wyverns bipedal, correct limb counts — AND the tone gates:
   realistic horror dark-fantasy, naturalistic slightly-elongated proportions; if a figure
   reads chibi, cute, bright-saturated, or cartoon-MMO, it is OFF-MODEL: re-roll once,
   then mark FAILED. Do NOT substitute a different subject and do NOT rename another
   file to fill the slot.
4. Append one JSON row per call to rqa-returns/provenance/rqa-generation-calls.json:
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

### Sheet RQ-01 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-kobold-inventor-halfling-orchard-keeper-elderly-halfling-knows-every-tree-in-the-grove-by-name` (Medium) — (no seed row — derive from slug)
2. `spr-fantasy-red-dragon-wyrmling-white-dragon-wyrmling` (Medium) — (no seed row — derive from slug)


## F4 re-dos (50 identities)

Failed files (reason digest):
- `fx-ash-biolumeflash-candidate-001.png` — note:content reads as orange lava/basalt crack, not a biolume flash; possibly swapped
- `fx-ash-toxicburst-alt-candidate-001.png` — note:palette reads fire-orange, not toxic
- `fx-ash-toxicburst-candidate-001.png` — note:palette reads holy-gold, not toxic; horizontal flare streaks touch left/right ed
- `fx-cosmic-sandveil-alt-candidate-001.png` — note:gold star mandala, no sand character
- `fx-cosmic-scarabswirl-candidate-001.png` — style-drift:photoreal; note:creature sprite in fx slot, magenta bg instead of dark fx bg
- `fx-cosmic-sigilbloom-candidate-001.png` — style-drift:photoreal; note:creature sprite in fx slot, magenta bg instead of dark fx bg
- `fx-cosmic-voidrip-candidate-001.png` — style-drift:photoreal; note:creature sprite in fx slot, magenta bg instead of dark fx bg
- `fx-env-debriscloud-candidate-001.png` — note:troll character sprite in fx slot, not an effect
- `fx-env-dustkick-candidate-001.png` — note:verdigris dragon creature sprite in fx slot, not an effect
- `fx-env-emberdrift-candidate-001.png` — note:two-cell orc character sheet in fx slot, not an effect
- `fx-env-frostburst-candidate-001.png` — note:ice dragon creature sprite in fx slot, not an effect
- `fx-env-rippleflash-candidate-001.png` — note:robed patriarch character sprite in fx slot, not an effect
- …and 38 more (see qa-ledger.json)

### Sheet RQ-02 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-ash-biolumeflash` (Medium) — (no seed row — derive from slug)
2. `fx-ash-toxicburst` (Medium) — (no seed row — derive from slug)
3. `fx-ash-toxicburst-alt` (Medium) — (no seed row — derive from slug)
4. `fx-cosmic-sandveil-alt` (Medium) — (no seed row — derive from slug)

### Sheet RQ-03 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-cosmic-scarabswirl` (Medium) — (no seed row — derive from slug)
2. `fx-cosmic-sigilbloom` (Medium) — (no seed row — derive from slug)
3. `fx-cosmic-voidrip` (Medium) — (no seed row — derive from slug)
4. `fx-env-debriscloud` (Medium) — (no seed row — derive from slug)

### Sheet RQ-04 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-env-dustkick` (Medium) — (no seed row — derive from slug)
2. `fx-env-emberdrift` (Medium) — (no seed row — derive from slug)
3. `fx-env-frostburst` (Medium) — (no seed row — derive from slug)
4. `fx-env-rippleflash` (Medium) — (no seed row — derive from slug)

### Sheet RQ-05 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-env-shadowpool` (Medium) — (no seed row — derive from slug)
2. `fx-env-splash` (Medium) — (no seed row — derive from slug)
3. `fx-fantasy-emberrune` (Medium) — (no seed row — derive from slug)
4. `fx-fantasy-featherdrift` (Medium) — (no seed row — derive from slug)

### Sheet RQ-06 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-fantasy-frostshard` (Medium) — (no seed row — derive from slug)
2. `fx-fantasy-holyglow` (Medium) — (no seed row — derive from slug)
3. `fx-fantasy-holyglow-alt` (Medium) — (no seed row — derive from slug)
4. `fx-fantasy-leafburst` (Medium) — (no seed row — derive from slug)

### Sheet RQ-07 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-fantasy-leafburst-alt` (Medium) — (no seed row — derive from slug)
2. `fx-gloom-bonedust` (Medium) — (no seed row — derive from slug)
3. `fx-gloom-vhstear` (Medium) — (no seed row — derive from slug)
4. `fx-gloom-vhstear-alt` (Medium) — (no seed row — derive from slug)

### Sheet RQ-08 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-impact-blunt-star` (Medium) — (no seed row — derive from slug)
2. `fx-impact-crush-shatter` (Medium) — (no seed row — derive from slug)
3. `fx-impact-pierce-glint` (Medium) — (no seed row — derive from slug)
4. `fx-impact-slash-arc` (Medium) — (no seed row — derive from slug)

### Sheet RQ-09 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-impact-slash-heavy` (Medium) — (no seed row — derive from slug)
2. `fx-magic-bolthead` (Medium) — (no seed row — derive from slug)
3. `fx-magic-burstring` (Medium) — (no seed row — derive from slug)
4. `fx-magic-castcircle` (Medium) — (no seed row — derive from slug)

### Sheet RQ-10 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-magic-orbcharge` (Medium) — (no seed row — derive from slug)
2. `fx-magic-sigilflash` (Medium) — (no seed row — derive from slug)
3. `fx-status-bloodspatter` (Medium) — (no seed row — derive from slug)
4. `fx-status-healmotes` (Medium) — (no seed row — derive from slug)

### Sheet RQ-11 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-status-poisonbubble` (Medium) — (no seed row — derive from slug)
2. `fx-status-shieldshimmer` (Medium) — (no seed row — derive from slug)
3. `fx-status-smokepuff` (Medium) — (no seed row — derive from slug)
4. `fx-status-sparkburst` (Medium) — (no seed row — derive from slug)

### Sheet RQ-12 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `fx-status-stunstars` (Medium) — (no seed row — derive from slug)
2. `shared-blood-decal` (Medium) — (no seed row — derive from slug)
3. `shared-cobweb-decal` (Medium) — (no seed row — derive from slug)
4. `shared-crack-decal` (Medium) — (no seed row — derive from slug)

### Sheet RQ-13 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `shared-grime-decal` (Medium) — (no seed row — derive from slug)
2. `shared-moss-decal` (Medium) — (no seed row — derive from slug)
3. `shared-rust-decal` (Medium) — (no seed row — derive from slug)
4. `shared-scorch-decal` (Medium) — (no seed row — derive from slug)

### Sheet RQ-14 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `shared-water-decal` (Medium) — (no seed row — derive from slug)
2. `shared-wear-decal` (Medium) — (no seed row — derive from slug)


## F5 re-dos (18 identities)

Failed files (reason digest):
- `spr-fantasy-adult-blue-dragon-candidate-001.png` — note:pixel-duplicate of F4/shared-blood-decal-candidate-001
- `spr-fantasy-adult-bronze-dragon-candidate-001.png` — style-drift:smooth
- `spr-fantasy-adult-copper-dragon-candidate-001.png` — style-drift:smooth
- `spr-fantasy-adult-gold-dragon-candidate-001.png` — style-drift:smooth; note:pixel-duplicate of F4/shared-grime-decal-candidate-001
- `spr-fantasy-adult-green-dragon-candidate-001.png` — note:pixel-duplicate of F4/shared-crack-decal-candidate-001
- `spr-fantasy-adult-silver-dragon-candidate-001.png` — style-drift:smooth
- `spr-fantasy-adult-white-dragon-candidate-001.png` — note:pixel-duplicate of F4/shared-moss-decal-candidate-001
- `spr-fantasy-ancient-black-dragon-candidate-001.png` — style-drift:photoreal
- `spr-fantasy-ancient-blue-dragon-candidate-001.png` — anatomy:major:tail terminates in two separate tapering tips at bottom-center: left coil ends i
- `spr-fantasy-ancient-green-dragon-candidate-001.png` — style-drift:soft-facet
- `spr-fantasy-ancient-white-dragon-candidate-001.png` — anatomy:major:tail duplicated/mirrored: two separate spiked tail tips converge at bottom cente
- `spr-fantasy-brass-dragon-wyrmling-bronze-dragon-wyrmling-candidate-001.png` — cropped; note:bronze wyrmling's right wing cut off by right image edge (confirmed by border-pi
- …and 6 more (see qa-ledger.json)

### Sheet RQ-15 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-adult-blue-dragon` (Huge) — chromatic lightning dragon, indigo hide sand-scoured matte, one great frilled brow-horn, ridged brow over deep-set eyes, desert ambusher's stillness. verb: STALKS-LOW.

### Sheet RQ-16 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-adult-bronze-dragon` (Huge) — metallic sea dragon, bronze-green patinated scales, tall ridged crest ending in curved horns, seafarer's squared confidence. verb: SQUARES-UP.

### Sheet RQ-17 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-adult-copper-dragon` (Huge) — metallic trickster dragon, ruddy copper scales over stone-hued ridges, backswept horns, jaw set in a knowing line, haunches loaded. verb: SET-TO-SPRING.

### Sheet RQ-18 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-adult-gold-dragon` (Huge) — **NEW — no legacy sprite; splits the retired gold-dragon-roster sheet into individual figures.** metallic gold dragon, whisker-tendrils framing the jaw, great sail-membrane wings half-furled, molten-gold scales worn matte at the edges — regal austerity, a king in exile, never friendly. verb: PRESIDES-STERN.

### Sheet RQ-19 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-adult-green-dragon` (Huge) — chromatic poison dragon, mottled forest-green, broad crested neck-frill, long sinuous neck held low, half-lidded manipulator's gaze. verb: COILS-TO-LISTEN.

### Sheet RQ-20 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-adult-silver-dragon` (Huge) — metallic dragon, bright silver scales under a smooth frilled ruff, level noble head, clean architectural facets — kind but distant, judging. verb: HOLDS-JUDGMENT.

### Sheet RQ-21 — 1 cell (Huge)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-adult-white-dragon` (Huge) — chromatic frost dragon, glassy blue-white scales rimed with frost (material, no vapor), knife-thin backswept crest, lean feral build — animal, not clever. verb: HUNCHES-TO-KILL.

### Sheet RQ-22 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-ancient-black-dragon` (Gargantuan) — ancient acid dragon, the skull-face now fully fleshless at the muzzle, forward-swept horns pitted and acid-etched, hide gone bog-black plate. verb: SURFACES-FROM-ROT.

### Sheet RQ-23 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-ancient-blue-dragon` (Gargantuan) — ancient lightning dragon, the great brow-horn cracked and re-fused, indigo plate scales sand-blasted pale at the ridges, centuries-patient. verb: OUTWAITS.

### Sheet RQ-24 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-ancient-green-dragon` (Gargantuan) — ancient poison dragon, neck-frill torn and healed in ragged plates, moss-dark scales, eyes that have out-schemed kingdoms. verb: KNOWS-YOUR-PRICE.

### Sheet RQ-25 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-ancient-white-dragon` (Gargantuan) — ancient frost dragon, crest worn to a jagged saw, ice-scarred hide plates, feral mind gone old and mean — a glacier with a grudge. verb: REMEMBERS-PREY.

### Sheet RQ-26 — 2 cells (Medium)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-brass-dragon-wyrmling-bronze-dragon-wyrmling` (Medium) — (no seed row — derive from slug)
2. `spr-fantasy-copper-dragon-wyrmling-gold-dragon-wyrmling` (Medium) — (no seed row — derive from slug)

### Sheet RQ-27 — 1 cell (Gargantuan)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-dragon-turtle` (Gargantuan) — mountainous sea beast, shell like a reefed island, steam-vents at the jaw rendered as rimed material (no vapor plume), flippers gathered under the mass. verb: SURFACES-SLOW.

### Sheet RQ-28 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-half-dragon` (Medium) — humanoid warrior with a draconic head and scaled hide breaking through at the forearms and neck, soldier's kit, tail wrapped to the leg — a person the blood is slowly winning. verb: HOLDS-FORM.

### Sheet RQ-29 — 2 cells (Large)

Canvas 1774×1774, 2 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-ridden-wyvern` (Large) — the same wyvern anatomy under a war saddle and harness rig — girth straps, chain rein, tack scuffed with use — **NO RIDER** (one identity per cell); the empty saddle is the horror. verb: WAITS-SADDLED.
2. `spr-fantasy-wyvern` (Large) — two-legged draconic beast, wings-for-forelimbs half-furled, whip tail wrapped tight ending in a venom stinger, animal-dumb predator's head low. verb: STOOPS.

### Sheet RQ-30 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-young-black-dragon` (Large) — young acid dragon, skull-face forming, forward-swept horns, bog-slick black scales — the F1 adult anchor's language one tier down. verb: RISES-FROM-MURK.


## F6 re-dos (14 identities)

Failed files (reason digest):
- `spr-fantasy-bone-naga-candidate-001.png` — anatomy:major:four arms: extra smaller skeletal arm pair emerging at waist below the main pair; note:humanoid 
- `spr-fantasy-crawling-claw-candidate-001.png` — style-drift:soft-facet; bg:white
- `spr-fantasy-death-knight-spr-fantasy-death-knight-aspirant-candidate-001.png` — style-drift:painterly; bg:white
- `spr-fantasy-graveyard-revenant-spr-fantasy-haunting-revenant-candidate-001.png` — style-drift:photoreal; bg:scene/other
- `spr-fantasy-mummy-spr-fantasy-mummy-lord-candidate-001.png` — style-drift:photoreal
- `spr-fantasy-poltergeist-spr-fantasy-swamp-shadow-candidate-001.png` — bg:scene/other
- `spr-fantasy-shadow-spr-fantasy-greater-shadow-candidate-001.png` — bg:white
- `spr-fantasy-wight-spr-fantasy-wight-lord-candidate-001.png` — style-drift:photoreal

### Sheet RQ-31 — 1 cell (Large)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-bone-naga` (Large) — skeletal serpent of a dead yuan-ti mage, vertebral column COILED AND STACKED tight per §0 base law (never a side-sprawl), hooded skull reared from the coil crown. verb: REARS-COILED.

### Sheet RQ-32 — 4 cells (Tiny)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-crawling-claw` (Tiny) — a severed animate hand, wrist stump bound in dried leather, fingers as legs mid-scuttle — small, wrong, and quick. verb: SCUTTLES.
2. `spr-fantasy-death-knight` (Medium) — fallen paladin in scorched full plate maintained by pure will — VETERAN kit: matched, complete, immaculate under the char; longsword grounded before it. Discipline outlived the man. verb: HOLDS-THE-LINE.
3. `spr-fantasy-death-knight-aspirant` (Medium) — the aspirant to that damnation — kit tells the contrast: mismatched incomplete plate, unblooded blade, the oath half-sworn and the flesh half-gone. verb: SWEARS-DOWN.
4. `spr-fantasy-graveyard-revenant` (Medium) — corpse risen for a named vengeance, grave-soil still on the burial suit, fixed unblinking stare; the horror is that it knows exactly who. verb: RETURNS.

### Sheet RQ-33 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-greater-shadow` (Medium) — the shadow pattern deepened — taller, denser black planes, clawed hands defined, a predator that learned shape. verb: PEELS-FROM-DARK.
2. `spr-fantasy-haunting-revenant` (Medium) — the revenant that follows — travel-worn burial clothes, a keepsake of its target clutched (single prop), posture of mid-stride pursuit that never rests. verb: FOLLOWS.
3. `spr-fantasy-mummy` (Medium) — bandage-wrapped dead, wrappings rotted to brown at the extremities, dust in every seam, one arm reaching in a slow curse. verb: ADVANCES-SLOW.
4. `spr-fantasy-mummy-lord` (Medium) — regal mummy in funerary regalia — gold death-mask half-slipped, crook and flail crossed (one of each, single props), fine wrappings kept white by servants long dead. verb: DECREES.

### Sheet RQ-34 — 4 cells (Medium)

Canvas 3548×1774, 4 equal vertical 4:8 cells. The figures, left to right:

1. `spr-fantasy-poltergeist` (Medium) — fury barely holding a form — a half-formed translucent figure, air bent into fractured facet-planes around it, one hurled household object caught mid-lift (its single prop). verb: HURLS-UNSEEN.
2. `spr-fantasy-shadow` (Medium) — flat darkness peeled off a wall into a standing figure, edges knife-thin, feet still fused to its own dark pool (the compact support). verb: SLIDES-FLAT.
3. `spr-fantasy-swamp-shadow` (Medium) — shadow steeped in bog-dark, edges dripping in faceted runnels back to its pool, wet-black planes with a green-dark cast. verb: POOLS-UP.
4. `spr-fantasy-wight` (Medium) — barrow warrior, ancient pattern-welded sword and corroded mail worn correctly, cold command in the dead face; it still keeps its watch. verb: MARCHES-COLD.

### Sheet RQ-35 — 1 cell (Medium)

Canvas 887×1774, 1 equal vertical 4:8 cells. The figure, left to right:

1. `spr-fantasy-wight-lord` (Medium) — barrow king, tarnished crown seated firm, finer ancient panoply, cloak of a dynasty nobody remembers; it still expects fealty. verb: RAISES-THE-BARROW.


## F7 re-dos (3 identities)

Failed files (reason digest):
- `spr-fantasy-blue-dragon-candidate-001.png` — anatomy:major:tail duplicated/mirrored: coil from the left ends in a smooth tapered tip and co
- `spr-fantasy-brass-dragon-candidate-001.png` — anatomy:major:two tail tips: left coil ends in an upcurved hook point at lower left, second bl
- `spr-fantasy-hill-giant-candidate-001.png` — style-drift:photoreal
