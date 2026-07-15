# PACKET-F6 — Fantasy Faceted Figure Factory: undead completion (ghosts, ghouls, liches, revenants)

**Authority + laws:** identical to PACKET-F1 (reread its **§0 ART-DIRECTION RULINGS** and chroma
rule before firing — not repeated here) and the compile template in
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8. This packet authors no new law. It closes
out the undead roster: the incorporeal file, the hungry corporeal dead, the grave-lords, and the
revenants. Compile each sheet by copying an F1 Lane-1 prompt and swapping the bracketed identity
content from the seed tables below.

**Register lock for the whole packet:** undead HORROR — restraint over gore. The horror
MECHANISM does the work, never splatter: F1's undead-knight ("discipline outlived the man") is
the model. Every seed row below names its mechanism; keep it legible in the silhouette.

## DISCIPLINE (identical across all F-packets; F1 audit lessons baked in)
1. **Filenames:** full slug incl. `spr-fantasy-` prefix; multi-cell sheets join their cell slugs. Candidates numbered **per-slug from 001** (never a lane-global counter — F1 lanes 3–5 collided).
2. **Provenance:** per-lane JSON at `fantasy-pilot/provenance/<packet>-<lane>-generation-calls.json` (packet prefix mandatory, e.g. `f8-lane-u-…` — bare lane names collide across packets) (file / callId / cells). Never append to the shared AUDIT.md.
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

Lanes T–W are mutually disjoint — fire all four in parallel Codex windows. No anchor gate
(language locked by F1; the F1 undead-knight anchor governs the register). If a family returns
off-language (the classic failures: incorporeals rendered as glow VFX, ghouls drifting into gore
splatter), hold that family's sheets only and recalibrate its seed rows; don't block the others.

**Incorporeal law (Lane U especially):** translucency and darkness are faceted MATERIAL PLANES —
a ghost is *made of* translucent facets the way F3's fire elemental is made of flame-planes —
never an emission glow, never a particle wisp. Every incorporeal still needs a READABLE
SILHOUETTE and a compact support region for standee use: the shroud gathers to a base, it does
not dissolve past the figure's own footprint.

---

## LANE T — the hungry corporeal dead (ghoul family + drowned) — 7 calls

All Medium. Grave-eaters and water-dead. Mechanism family: appetite that outlived the person,
and water that never gave the body back. Restraint: gauntness and wrongness of pose, not gore.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-ghoul | Medium | gaunt crouched grave-eater, joints bent past comfort, long tongue, black claws, soil-caked shroud rags; the horror is the patience of its hunger. verb: FEEDS-LOW. |
| spr-fantasy-ghast | Medium | elevated ghoul standing UPRIGHT among crouchers — carrion stench implied by flinch-worthy grime, a commander's bearing grafted onto a feeder's frame. verb: COMMANDS-THE-HUNGER. |
| spr-fantasy-ghast-base | Medium | the baseline ghast pattern stripped of elite kit — upright, gaunt, grave-grey hide, unadorned; the reference silhouette for the family. verb: REEKS-FORWARD. |
| spr-fantasy-ghast-gravecaller-spellstitched-elite | Medium | spellstitched elite ghast, ritual sigils sutured INTO the hide in stitched seams (material, no glow), grave-fetish cords, a caller's raised claw — it summons what it buried. verb: CALLS-THE-GRAVES. |
| spr-fantasy-lacedon-sodden-ghoul | Medium | aquatic ghoul, bloated and kelp-hung, webbed claws, waterline stain across the whole figure; it waits under jetties. verb: SURFACES. |
| spr-fantasy-drowned-husk | Medium | waterlogged corpse walking, swollen taut skin gone river-grey, sodden clothes plastered flat, slow and inevitable. verb: WADES-OUT. |
| spr-fantasy-clawed-drowner | Medium | leaner river-dead thing built to DRAG — overlong arms, hooked claws, weed-tangled; the mechanism is the grip that pulls waders under. verb: DRAGS-UNDER. |

**Sheet plan T (Medium = 2 per sheet, family pairs):** S1 ghoul + ghast · S2 ghast-base +
ghast-gravecaller-spellstitched-elite · S3 lacedon-sodden-ghoul + drowned-husk · S4 (odd Medium
solo) clawed-drowner.

## LANE U — the incorporeal file — 9 calls

Translucency/darkness as faceted MATERIAL planes per the run-order law. Readable silhouette,
compact support, shroud gathers to the footprint. No glow VFX, no particle wisps, no emission.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-ghost | Medium | translucent dead soul in era-marked clothing rendered as pale facet-planes, face intact and sorrowful; the horror is recognition — someone specific. verb: LINGERS. |
| spr-fantasy-specter | Medium | malice-warped soul, gaunter and sharper-edged than a ghost, features stretched by rage, reaching. verb: PASSES-THROUGH. |
| spr-fantasy-wraith | Medium | ragged hooded void given shape, darkness as layered black facet-planes, a void where the face was, shroud-tatters gathered tight to the base. verb: DESCENDS-DARK. |
| spr-fantasy-banshee | Medium | elven spirit worn to grief, hair and burial shroud streaming then GATHERING back to the support, mouth open mid-keen (no sound VFX, the pose carries it). verb: KEENS. |
| spr-fantasy-poltergeist | Medium | fury barely holding a form — a half-formed translucent figure, air bent into fractured facet-planes around it, one hurled household object caught mid-lift (its single prop). verb: HURLS-UNSEEN. |
| spr-fantasy-shadow | Medium | flat darkness peeled off a wall into a standing figure, edges knife-thin, feet still fused to its own dark pool (the compact support). verb: SLIDES-FLAT. |
| spr-fantasy-greater-shadow | Medium | the shadow pattern deepened — taller, denser black planes, clawed hands defined, a predator that learned shape. verb: PEELS-FROM-DARK. |
| spr-fantasy-swamp-shadow | Medium | shadow steeped in bog-dark, edges dripping in faceted runnels back to its pool, wet-black planes with a green-dark cast. verb: POOLS-UP. |
| spr-fantasy-will-o-wisp | Tiny | a pale cold flame-orb as faceted material (identity, not VFX — the flameskull rule), a faint skull-hint in the core planes; it exists to lure. verb: LURES. |

**Sheet plan U:** S1 ghost + specter · S2 wraith + banshee · S3 poltergeist + swamp-shadow ·
S4 shadow + greater-shadow · S5 (odd Tiny solo) will-o-wisp. Keep the shadow sub-family paired
with itself; the Tiny never rides a Medium sheet.

## LANE V — grave-lords (liches, mummies, barrow-kings, death knights) — 9 calls

The command tier of the dead. Mechanism family: office, oath, and dynasty outliving the flesh.
The F1 undead-knight ("discipline outlived the man") is the direct model for the knights here.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-lich | Medium | desiccated arch-mage, once-fine robes maintained with terrible neatness, jeweled phylactery-focus in one hand (single prop), pinpoint eye-lights as material; the horror is the intact intellect. verb: PRESIDES. |
| spr-fantasy-demilich | Tiny | a hovering gem-socketed skull, all that ambition kept — gold-set soul-gems for eyes, a halo of bone-dust motes rendered as faceted debris (material, no glow). verb: HOVERS-HOLLOW. |
| spr-fantasy-mummy | Medium | bandage-wrapped dead, wrappings rotted to brown at the extremities, dust in every seam, one arm reaching in a slow curse. verb: ADVANCES-SLOW. |
| spr-fantasy-mummy-lord | Medium | regal mummy in funerary regalia — gold death-mask half-slipped, crook and flail crossed (one of each, single props), fine wrappings kept white by servants long dead. verb: DECREES. |
| spr-fantasy-wight | Medium | barrow warrior, ancient pattern-welded sword and corroded mail worn correctly, cold command in the dead face; it still keeps its watch. verb: MARCHES-COLD. |
| spr-fantasy-wight-lord | Medium | barrow king, tarnished crown seated firm, finer ancient panoply, cloak of a dynasty nobody remembers; it still expects fealty. verb: RAISES-THE-BARROW. |
| spr-fantasy-death-knight | Medium | fallen paladin in scorched full plate maintained by pure will — VETERAN kit: matched, complete, immaculate under the char; longsword grounded before it. Discipline outlived the man. verb: HOLDS-THE-LINE. |
| spr-fantasy-death-knight-aspirant | Medium | the aspirant to that damnation — kit tells the contrast: mismatched incomplete plate, unblooded blade, the oath half-sworn and the flesh half-gone. verb: SWEARS-DOWN. |
| spr-fantasy-bone-naga | Large | skeletal serpent of a dead yuan-ti mage, vertebral column COILED AND STACKED tight per §0 base law (never a side-sprawl), hooded skull reared from the coil crown. verb: REARS-COILED. |

**Sheet plan V:** S1 mummy + mummy-lord · S2 wight + wight-lord · S3 death-knight +
death-knight-aspirant · S4 (odd Medium solo — the register is too singular to pair) lich ·
S5 (odd Tiny solo) demilich · S6 (Large solo) bone-naga.

## LANE W — revenants + remnants — 3 calls

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-graveyard-revenant | Medium | corpse risen for a named vengeance, grave-soil still on the burial suit, fixed unblinking stare; the horror is that it knows exactly who. verb: RETURNS. |
| spr-fantasy-haunting-revenant | Medium | the revenant that follows — travel-worn burial clothes, a keepsake of its target clutched (single prop), posture of mid-stride pursuit that never rests. verb: FOLLOWS. |
| spr-fantasy-crawling-claw | Tiny | a severed animate hand, wrist stump bound in dried leather, fingers as legs mid-scuttle — small, wrong, and quick. verb: SCUTTLES. |

**Sheet plan W:** S1 graveyard-revenant + haunting-revenant · S2 (odd Tiny solo) crawling-claw.

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L. Consolidate F6 returns into the canonical pilot tree
with per-lane provenance + a Step-E ledger, exactly like F1.
