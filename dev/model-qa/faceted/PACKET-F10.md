# PACKET-F10 — Fantasy Faceted Figure Factory: nature & the strange — plants, fungi, fey, oozes, elementals, constructs, oddities (wave 10, wide batch)

**Authority + laws:** identical to PACKET-F1 (reread its **§0 ART-DIRECTION RULINGS** and chroma
rule before firing — not repeated here) and the compile template in
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8. This packet authors no new law. It clears the
green-and-strange shelf of the bestiary — walking plants, fungal folk, fey, oozes, genies,
elementals, constructs, and Genesis's own chaos frogs — in one high-volume parallel run.

**Compile each sheet from the §6.8 template** exactly as F1 did — copy any F1 Lane-1 prompt and
swap the bracketed identity from the seed tables below. Category insertion (§6.8): **monsters**
add combat behavior + horror mechanism + support region. For every multi-cell sheet append the
standard cell instruction: *"Render [N] SEPARATE figures in [N] equal vertical 4:8 cells, hard
cell boundaries, no overlap, no shared props, one identity per cell, shared ground line per row,
varied poses — no two figures share a stance."*

**No effects in these sources** (§7). This packet leans hard on element-as-MATERIAL: an efreeti
is brass-and-ember flesh, a magmin is crusted magma with glowing seams, a water weird is faceted
water — none of them emits a particle plume.

## DISCIPLINE (identical across all F-packets; F1 audit lessons baked in)
1. **Filenames:** full slug incl. `spr-fantasy-` prefix; multi-cell sheets join their cell slugs. Candidates numbered **per-slug from 001** (never a lane-global counter — F1 lanes 3–5 collided).
2. **Provenance:** per-lane JSON at `fantasy-pilot/provenance/<lane>-generation-calls.json` (file / callId / cells). Never append to the shared AUDIT.md.
3. **Chroma:** flat uniform magenta **#FF00FF**; the chroma color must never appear IN a figure (F1 shipped a magenta-tinted shoe). No gradient, floor, shadow, or horizon.
4. **Crop:** generous padding — weapon tips, tails, stalks, wingtips, feet WELL inside the frame. Near-edge extremities were F1's most common defect.
5. **Cells:** exactly N figures in N equal vertical 4:8 cells, hard boundaries, no overlap, no shared props, varied poses — no two share a stance. Odd-remainder cells stay pure chroma.
6. **Props:** exactly ONE of each carried item (F1 produced a doubled kite shield).
7. **Faces/finish:** grounded, weathered, adult — no BG3-glamour prettiness (F1 lane-4 drift), no MMO gloss, no candy saturation.
8. **§0 laws:** lanky house bias, girth only when diegetic; COMPACT forward-facing support — wings half-furl, tails/coils wrap tight, legs gather (F1's spider and 3 of 4 dragon candidates failed this); adult register; realistic dark-fantasy horror with a stylized triangulated low-poly twist.
9. **No VFX in sources:** fire/frost/shadow/necrotic glow read as faceted MATERIAL, never a particle plume (F1's flaming-skeleton oversprayed its silhouette).
10. Every output is a candidate — `runtimeAdmitted:false`; save to `fantasy-pilot/raw-figures/`; record every generation call id.
**Sheet economy (§0):** Large/Huge = 1 per sheet · Medium = 2 per sheet · Small/Tiny = 4 per sheet (2×2). Same category and register per sheet; odd remainders ride alone.

---

## RUN ORDER

Lanes F10-A through F10-G are mutually disjoint — fire as many in parallel as you have Codex
windows. No anchor gate (language locked by F1). If a whole family returns off-language, hold
that family's sheets and recalibrate its seed row; don't block the others.

---

## LANE F10-A — blights & walking plants — 7 calls

Plant horror: bark, sap, and thorn as faceted material. Runners and boughs held tight to the
body per §0 — no reaching limbs near the frame edge.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-awakened-shrub | Small | awakened shrub, ambulatory bramble-mass on knotted root-feet, leaf-shiver menace. verb: RUSTLES-CLOSER. |
| spr-fantasy-awakened-tree | Huge | awakened tree, ancient groaning trunk, bough arms, dragging root-mass feet. verb: HEAVES-ITS-ROOTS. |
| spr-fantasy-the-needle-blight | Medium | needle blight, gaunt conifer-born humanoid, pelt of dark quill-needles ready to fling. verb: BRISTLES-TO-FLING. |
| spr-fantasy-the-twig-blight | Small | twig blight, brittle child-sized stick-figure, hooked twig claws, sap-dark eye pits. verb: CREAKS-FORWARD. |
| spr-fantasy-the-vine-blight | Medium | vine blight, ropy vine mass in a half-human shape, entangling runners held tight to the body. verb: REACHES-WITH-RUNNERS. |
| spr-fantasy-tree-blight | Huge | tree blight, corrupt tree-hulk, split weeping bark, grasping branch talons. verb: TEARS-FREE. |
| spr-fantasy-gulthias-blight | Gargantuan | gulthias blight, vampiric heartwood colossus grown from the evil tree, blood-sap seams dull red (material, no glow plume), fills the frame. verb: DRINKS-THE-ROOTS. |
| spr-fantasy-treant | Huge | treant, elder tree-shepherd, deep-carved bark face, moss-hung limbs, rooted patience. verb: STANDS-SENTINEL. |
| spr-fantasy-shambling-mound | Large | shambling mound, wet heap of rotting vegetation in a hulking shoulder-shape, no true head. verb: ENGULFS. |

**Sheet plan:** 2×2 awakened-shrub + the-twig-blight with the two remainder cells pure chroma;
the-needle-blight + the-vine-blight = one Medium pair; shambling-mound = Large solo;
awakened-tree · tree-blight · treant = three Huge solos; gulthias-blight = Gargantuan solo (fill
frame).

## LANE F10-B — fungi — 6 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-myconid-sprout | Small | myconid sprout, waist-high mushroom-folk child, soft cap, spore-dust pores. verb: DRIFTS-SPORES. |
| spr-fantasy-myconid-adult | Medium | myconid adult, man-high mushroom-folk, broad gilled cap, placid alien calm. verb: COMMUNES. |
| spr-fantasy-myconid-sovereign | Large | myconid sovereign, towering crowned cap, hanging fungal veils like court robes. verb: PRESIDES. |
| spr-fantasy-myconid-spore-servant | Medium | spore servant, dead humanoid puppeted by fungal threads, cap-growth bursting from the skull. verb: SHUFFLES-PUPPETED. |
| spr-fantasy-shrieker-fungus | Medium | shrieker fungus, bloated sessile mushroom, mouth-like cap folds mid-shriek. verb: SHRIEKS-ROOTED. |
| spr-fantasy-violet-fungus | Medium | violet fungus, purple-capped stalk, four rot-touch tendrils held close to the stem. verb: FLAILS-TO-ROT. |
| spr-fantasy-violet-fungus-necrohulk | Large | violet fungus necrohulk, corpse-fed fungal mass grown huge, bodies half-digested in the stalk. verb: LOOMS-FESTERING. |
| spr-fantasy-gas-spore-fungus | Large | gas spore, floating sphere mimicking a beholder, taut mottled skin, one false eye-spot. verb: DRIFTS-DECEIVING. |

**Sheet plan:** myconid-adult + myconid-spore-servant = one Medium pair (circle and puppet);
shrieker-fungus + violet-fungus = one Medium pair (dungeon stalks); myconid-sprout rides alone
(Small odd remainder); myconid-sovereign · violet-fungus-necrohulk · gas-spore-fungus = three
Large solos.

## LANE F10-C — fey — 4 calls

The hags are three DISTINCT crones — **green** = swamp bargainer, **sea** = drowned horror,
**arch** = paramount of the covens — weathered horror, never Disney witch. Pixie and sprite are
Tiny (4-up): sharp, alien fey, not Tinkerbell.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-dryad | Medium | dryad, bark-grained skin, hair of leaf and branch, weathered guardian grace — no glamour. verb: STEPS-FROM-THE-OAK. |
| spr-fantasy-green-hag | Medium | green hag, swamp bargainer, moss-green warted skin, iron-black nails, bundle of knotted charms. verb: OFFERS-THE-BARGAIN. |
| spr-fantasy-sea-hag | Medium | sea hag, drowned horror, fish-belly pallor, kelp-matted hair, dead milky stare. verb: SURFACES-GRINNING. |
| spr-fantasy-arch-hag | Large | arch-hag, paramount crone of the covens, crown of knotted trophy braids, court-robes of stitched bargains. verb: HOLDS-COURT. |
| spr-fantasy-pixie | Tiny | pixie, sharp alien fey, needle features, dragonfly wings furled tight. verb: REGARDS-COLDLY. |
| spr-fantasy-pixie-wonderbringer | Tiny | pixie wonderbringer, elder pixie, thistle crown, one pouch of dream-dust. verb: BESTOWS-STRANGENESS. |
| spr-fantasy-sprite | Tiny | sprite, tiny armored fey duelist, one thorn-needle rapier, moth wings furled. verb: PRESENTS-THE-THORN. |
| spr-fantasy-blink-dog | Medium | blink dog, lean fey hound, amber knowing eyes, coat edges faintly phase-faceted (material, no VFX). verb: BLINKS-ASIDE. |

**Sheet plan:** green-hag + sea-hag = one Medium pair (coven crones); dryad + blink-dog = one
Medium pair (fey guardians); arch-hag = Large solo (the paramount rides alone); 2×2 pixie +
pixie-wonderbringer + sprite with the one remainder cell pure chroma.

## LANE F10-D — oozes (plus one lodger) — 3 calls

Oozes are glossy TRANSLUCENT facet masses with engulfed debris shadowed inside; compact puddled
support per §0 — the mass pools, it doesn't sprawl to the cell edges.

**Honesty note:** `mire-creeper` is NOT an ooze in `data/bestiary.js` — it's a stirge-pattern
bog blood-drainer (HP 2, fly 40 ft., Blood Drain). It rides in this lane for scheduling only;
seed it true to its stat block, not as a slime.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-black-pudding | Large | black pudding, glossy tar-black translucent facet mass, puddled compact, dissolved hilts and buckles suspended inside. verb: SPREADS-CORROSIVE. |
| spr-fantasy-ochre-jelly | Large | ochre jelly, amber translucent facet mass, shadowed bones engulfed within, one strike-pseudopod raised. verb: SPLITS-AND-SEEPS. |
| spr-fantasy-mire-creeper | Tiny | mire creeper, tiny bog blood-drinker, membranous wings half-furled, needle proboscis, moss-mottled hide. verb: LATCHES-TO-DRAIN. |

**Sheet plan:** black-pudding · ochre-jelly = two Large solos; mire-creeper rides alone (Tiny odd
remainder — never share a sheet with the true oozes).

## LANE F10-E — genies & elementals — 14 calls

Genies are regal elemental NOBILITY, element as material: **dao** = stone-flesh with gem-vein
seams · **djinni** = torso trailing into wind-swirl planes · **efreeti** = brass-and-ember ·
**marid** = tide-flesh. The invisible stalker is a barely-there faceted distortion silhouette
that still reads as a standee.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-dao | Large | dao, stone-flesh genie noble, gem-vein seams, lower body turning into a pedestal of rotating rock (compact). verb: DECREES-IN-STONE. |
| spr-fantasy-djinni | Large | djinni, air genie noble, torso trailing into a wind-swirl of faceted vapor planes, regal jewelry. verb: COMMANDS-THE-WIND. |
| spr-fantasy-efreeti | Large | efreeti, brass-and-ember genie tyrant, ember-seamed skin (material, no plume), one great scimitar. verb: PRONOUNCES-SENTENCE. |
| spr-fantasy-marid | Large | marid, tide-flesh genie noble, wave-crest shoulders, pearl-and-shell regalia. verb: HOLDS-THE-TIDE. |
| spr-fantasy-azer-pyromancer | Medium | azer pyromancer, brass-skinned forged dwarf-folk, beard-crest of shaped brass flame (material), one iron rod. verb: SHAPES-THE-FORGEFIRE. |
| spr-fantasy-azer-sentinel | Medium | azer sentinel, brass forged dwarf-folk guard, one hammer, one tower shield. verb: HOLDS-THE-GATE. |
| spr-fantasy-galeb-duhr | Medium | galeb duhr, living boulder with stubby stone limbs and a craggy half-face. verb: SETTLES-TO-STONE. |
| spr-fantasy-gargoyle | Medium | gargoyle, grey stone fiend-statue, horned, wings half-furled, perched crouch. verb: UNFREEZES. |
| spr-fantasy-invisible-stalker | Large | invisible stalker, a barely-there faceted distortion silhouette — refracted edges only, no fill — yet a readable standee shape. verb: CLOSES-UNSEEN. |
| spr-fantasy-magmin | Small | magmin, small crusted magma imp, glowing seams between hardened plates (material, no plume). verb: CAPERS-SCORCHING. |
| spr-fantasy-salamander | Large | salamander, serpent-lower fire-folk warrior, coils wrapped tight (§0), one barbed spear. verb: COILS-AND-SPEARS. |
| spr-fantasy-salamander-fire-snake | Medium | fire snake, salamander larva, ember-scaled serpent in a tight coil, head raised. verb: RISES-EMBERED. |
| spr-fantasy-salamander-inferno-master | Large | salamander inferno master, elder fire-folk lord, crown of cooled slag, coils stacked compact, one war-glaive. verb: DECLARES-THE-BURN. |
| spr-fantasy-water-weird | Large | water weird, serpent of animate faceted water rearing from a tight coiled base, translucent facets. verb: REARS-FROM-THE-POOL. |
| spr-fantasy-xorn | Medium | xorn, three-armed three-eyed earth glutton, vertical stone maw atop a squat radial body. verb: GRINDS-GEMS. |
| spr-fantasy-elemental-cataclysm | Gargantuan | elemental cataclysm, all four elements fused in one towering faceted storm-body — stone core, wave shoulder, ember seams, wind-plane limbs (all material, no plume), fills the frame. verb: UNMAKES. |

**Sheet plan:** dao · djinni · efreeti · marid = four Large solos (four thrones — never share);
invisible-stalker · salamander · salamander-inferno-master · water-weird = four Large solos;
elemental-cataclysm = Gargantuan solo (fill frame); azer-pyromancer + azer-sentinel = one Medium
pair (forge-folk); galeb-duhr + gargoyle = one Medium pair (animate stone); xorn rides alone
(Medium remainder); salamander-fire-snake rides alone (Medium remainder — its kin are Large);
magmin rides alone (Small odd remainder).

## LANE F10-F — constructs — 3 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-helmed-horror | Medium | helmed horror, animate full plate, black void behind the visor slit, one longsword, deliberate guard stance. verb: EXECUTES-THE-ORDER. |
| spr-fantasy-homunculus | Tiny | homunculus, bat-winged clay-flesh servitor, stitched seams, needle teeth. verb: PERCHES-REPORTING. |
| spr-fantasy-scarecrow | Medium | scarecrow, sackcloth horror, straw bursting at stitched seams, sagging stitched grin, crossbar-hung shoulders. verb: HANGS-THEN-MOVES. |
| spr-fantasy-colossus | Gargantuan | colossus, towering ancient stone construct, temple-relief carvings, masonry missing at one shoulder, fills the frame. verb: AWAKENS-ANCIENT. |

**Sheet plan:** helmed-horror + scarecrow = one Medium pair (made things, dark register);
homunculus rides alone (Tiny odd remainder); colossus = Gargantuan solo (fill frame).

## LANE F10-G — chaos frogs — 4 calls

Custom Genesis monsters — magical frog-beasts whose element shows as faceted MATERIAL hide and
crest, one per color plus death. Sinister-strange, never cute; true frog anatomy under the
element. Sizes per `data/bestiary.js`: blue/green/red are Large, gray/death are Medium.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-blue-chaos-frog | Large | blue chaos-frog, storm-blue faceted hide, crest ridges of crackling crystal (material, no arc VFX), bunched to leap. verb: LEAPS-CRACKLING. |
| spr-fantasy-gray-chaos-frog | Medium | gray chaos-frog, ash-gray faceted hide, dull slate crest spines, unblinking wrong-way gaze. verb: SITS-WRONG. |
| spr-fantasy-green-chaos-frog | Large | green chaos-frog, acid-green faceted hide beaded with etching slime (material), tall serrated crest. verb: DROOLS-ETCHING. |
| spr-fantasy-red-chaos-frog | Large | red chaos-frog, ember-red faceted hide, heat-split crest seams (material, no flame plume), squat searing bulk. verb: BUNCHES-SEARING. |
| spr-fantasy-death-chaos-frog | Medium | death chaos-frog, bone-pale hide over shadow-dark facet hollows, necrotic-black crest (material), grave stillness. verb: WAITS-LIKE-A-GRAVE. |

**Sheet plan:** blue · green · red = three Large solos; gray + death = one Medium pair.

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L. Consolidate F10 returns into the canonical pilot tree
with per-lane provenance + a Step-E ledger, exactly like F1.
