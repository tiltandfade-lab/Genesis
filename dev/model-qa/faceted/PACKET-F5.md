# PACKET-F5 — Fantasy Faceted Figure Factory: dragons complete (wyrmlings, adults, ancients, gold family, dragon-kin)

**Authority + laws:** identical to PACKET-F1 (reread its **§0 ART-DIRECTION RULINGS** and chroma
rule before firing — not repeated here) and the compile template in
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8. This packet authors no new law. It finishes
the dragon program F2 opened: every remaining wyrmling, the full adult and ancient tiers, the
**net-new gold family**, and the dragon-kin stragglers. Compile each sheet by copying an F1
Lane-1 prompt and swapping the bracketed identity content from the seed tables below.

**Anchor citation, not regeneration:** `spr-fantasy-adult-black-dragon` is the F1 anchor —
already generated, **excluded from this packet**. Its `candidate-004` (half-furled wings, compact
coil, skull face, no effect plume) is the BINDING LANGUAGE REFERENCE for every dragon here —
match its facet scale, compact support, and restraint. This packet also **retires the old
`gold-dragon-roster` sheet**: the gold family regenerates as individual figures below.

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

Lanes P–S are mutually disjoint — fire all four in parallel Codex windows. No anchor gate
(language locked by F1; the adult-black-dragon anchor governs). If a family returns off-language
(e.g. the ancients drift glamorous, or a metallic goes friendly-cute), hold that family's sheets
only and recalibrate its seed rows; don't block the other lanes.

**Dragon law for every lane here (from the F1 anchor):** wings HALF-FURLED, tail wrapped tight
around the support region, head low and level, compact forward-facing mass. **No breath-weapon
VFX in any source** — the element lives in scale color, etching, and material only. Chromatics
read as predatory horror; metallics read as austere nobility — never friendly-cute.

---

## LANE P — wyrmlings (Medium, mean hatchlings) — 7 calls

Wyrmlings read as MEAN, AWKWARD HATCHLINGS — oversized heads and feet on scrawny bodies, wings
too big, scales still soft-looking — never adorable, never a mascot. F2 Lane B already covered
the **red, white, and silver** wyrmlings — do NOT regenerate those.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-black-dragon-wyrmling | Medium | hatchling black, acid dragon, the skull-like face already forming, forward-swept horn nubs, swamp-slicked hide, vicious for its size. verb: SNAPS-SIDEWAYS. |
| spr-fantasy-blue-dragon-wyrmling | Medium | hatchling blue, lightning dragon, a single brow-horn nub, sand-dusted indigo scales, patient beyond its age. verb: WAITS-COILED. |
| spr-fantasy-green-dragon-wyrmling | Medium | hatchling green, poison dragon, budding neck-frill, sinuous little neck, already sly-eyed. verb: EYES-THE-EXIT. |
| spr-fantasy-brass-dragon-wyrmling | Medium | hatchling brass, metallic desert dragon, the chin-frill plate just forming, head cocked, pushy and talkative — not cute. verb: BUTTS-IN. |
| spr-fantasy-bronze-dragon-wyrmling | Medium | hatchling bronze, metallic sea dragon, crest ridges budding, salt-flecked patina starting, squared little stance. verb: PLANTS-ITSELF. |
| spr-fantasy-copper-dragon-wyrmling | Medium | hatchling copper, metallic trickster, backswept horn nubs, ruddy scales, haunches coiled to bolt. verb: FEINTS. |
| spr-fantasy-gold-dragon-wyrmling | Medium | **NEW — no legacy sprite; splits the retired gold-dragon-roster sheet into individual figures.** hatchling gold, whisker-tendril nubs at the jaw, sail-membrane wings too big for the body, grave little bearing — austere, not sweet. verb: STANDS-SOLEMN. |

**Sheet plan P (Medium = 2 per sheet, same register per sheet):** S1 (chromatics) black-wyrmling
+ blue-wyrmling · S2 (odd chromatic solo) green-wyrmling · S3 (metallics) brass-wyrmling +
bronze-wyrmling · S4 (metallics) copper-wyrmling + gold-wyrmling. Never mix chromatic and
metallic register on one sheet.

## LANE Q — adult tier (Huge solos) — 9 calls

Each is a **Huge dragon, 1 per sheet**, compiled from the F1 1D black-dragon prompt shape — copy
that prompt and swap the bracketed identity. Adult-black is EXCLUDED (F1 anchor; cite it, don't
regenerate it). Compact per §0: wings half-furled, tail wrapped tight, head low and level.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-adult-blue-dragon | Huge | chromatic lightning dragon, indigo hide sand-scoured matte, one great frilled brow-horn, ridged brow over deep-set eyes, desert ambusher's stillness. verb: STALKS-LOW. |
| spr-fantasy-adult-green-dragon | Huge | chromatic poison dragon, mottled forest-green, broad crested neck-frill, long sinuous neck held low, half-lidded manipulator's gaze. verb: COILS-TO-LISTEN. |
| spr-fantasy-adult-red-dragon | Huge | chromatic fire dragon, crimson scales charring to black at the edges, tall lyre-spread horns, raised arrogant chest, smoke-stained nostrils (no flame). verb: RISES-TYRANT. |
| spr-fantasy-adult-white-dragon | Huge | chromatic frost dragon, glassy blue-white scales rimed with frost (material, no vapor), knife-thin backswept crest, lean feral build — animal, not clever. verb: HUNCHES-TO-KILL. |
| spr-fantasy-adult-brass-dragon | Huge | metallic desert dragon, warm brass scales gone matte with grit, wide chin-to-crown frill fan, head cocked mid-interrogation — garrulous, never jolly. verb: LEANS-IN. |
| spr-fantasy-adult-bronze-dragon | Huge | metallic sea dragon, bronze-green patinated scales, tall ridged crest ending in curved horns, seafarer's squared confidence. verb: SQUARES-UP. |
| spr-fantasy-adult-copper-dragon | Huge | metallic trickster dragon, ruddy copper scales over stone-hued ridges, backswept horns, jaw set in a knowing line, haunches loaded. verb: SET-TO-SPRING. |
| spr-fantasy-adult-silver-dragon | Huge | metallic dragon, bright silver scales under a smooth frilled ruff, level noble head, clean architectural facets — kind but distant, judging. verb: HOLDS-JUDGMENT. |
| spr-fantasy-adult-gold-dragon | Huge | **NEW — no legacy sprite; splits the retired gold-dragon-roster sheet into individual figures.** metallic gold dragon, whisker-tendrils framing the jaw, great sail-membrane wings half-furled, molten-gold scales worn matte at the edges — regal austerity, a king in exile, never friendly. verb: PRESIDES-STERN. |

**Sheet plan Q (Huge = 1 per sheet):** S1 blue · S2 green · S3 red · S4 white · S5 brass ·
S6 bronze · S7 copper · S8 silver · S9 gold. (adult-black-dragon = F1 anchor — already done; do
not regenerate.)

## LANE R — ancient tier (Gargantuan solos) — 10 calls

**Gargantuan still = 1 per sheet — fill the frame** (mass up to the padding law, never past it;
rule 4 still holds for wingtips and tail). The ancient read is AGE: scarred plate scales like
weathered armor, broken and re-grown horn tips, clouded ancient eyes, immense mass held COMPACT
— an old mountain of a thing, not a spread-eagle pin-up. Same element-as-material law as Lane Q.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-ancient-black-dragon | Gargantuan | ancient acid dragon, the skull-face now fully fleshless at the muzzle, forward-swept horns pitted and acid-etched, hide gone bog-black plate. verb: SURFACES-FROM-ROT. |
| spr-fantasy-ancient-blue-dragon | Gargantuan | ancient lightning dragon, the great brow-horn cracked and re-fused, indigo plate scales sand-blasted pale at the ridges, centuries-patient. verb: OUTWAITS. |
| spr-fantasy-ancient-green-dragon | Gargantuan | ancient poison dragon, neck-frill torn and healed in ragged plates, moss-dark scales, eyes that have out-schemed kingdoms. verb: KNOWS-YOUR-PRICE. |
| spr-fantasy-ancient-red-dragon | Gargantuan | ancient fire dragon, lyre horns snapped at one tip, crimson plate scales scorched black in swathes, chest like a furnace door long cooled shut. verb: DEIGNS-TO-NOTICE. |
| spr-fantasy-ancient-white-dragon | Gargantuan | ancient frost dragon, crest worn to a jagged saw, ice-scarred hide plates, feral mind gone old and mean — a glacier with a grudge. verb: REMEMBERS-PREY. |
| spr-fantasy-ancient-brass-dragon | Gargantuan | ancient metallic desert dragon, chin-frill fan cracked like old leather, brass scales burnished to dull gold at the wear points, talkative menace of an old judge. verb: CROSS-EXAMINES. |
| spr-fantasy-ancient-bronze-dragon | Gargantuan | ancient metallic sea dragon, crest horns barnacle-pitted, patina gone deep green in the scale valleys, a warship of a body held still. verb: HOLDS-THE-HARBOR. |
| spr-fantasy-ancient-copper-dragon | Gargantuan | ancient metallic trickster, backswept horns worn smooth, copper plates verdigrised at the seams, the humor of something that has buried every rival. verb: SMILES-LAST. |
| spr-fantasy-ancient-silver-dragon | Gargantuan | ancient metallic dragon, silver ruff scarred and dented like a veteran's pauldron, facets clean but battle-marked, immense sorrowful dignity. verb: MOURNS-STANDING. |
| spr-fantasy-ancient-gold-dragon | Gargantuan | **NEW — no legacy sprite; splits the retired gold-dragon-roster sheet into individual figures.** ancient gold, jaw-tendrils long as banners, sail-wings patched with age-scars and half-furled, one horn tip broken square — the last emperor of a dead line, austere and terrible. verb: JUDGES-THE-AGE. |

**Sheet plan R (Gargantuan = 1 per sheet, fill the frame):** S1 black · S2 blue · S3 green ·
S4 red · S5 white · S6 brass · S7 bronze · S8 copper · S9 silver · S10 gold.

## LANE S — dragon-kin (mixed size) — 10 calls

The relatives, the ridden, and the wrong turns of the bloodline. Dragon law still binds where
anatomy allows (wings half-furl, tails wrap, compact support); beasts here are ANIMALS (wyvern,
behir, dragon-turtle) — no anthropomorphism, no cleverness in the face.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-young-black-dragon | Large | young acid dragon, skull-face forming, forward-swept horns, bog-slick black scales — the F1 adult anchor's language one tier down. verb: RISES-FROM-MURK. |
| spr-fantasy-young-gold-dragon | Large | **NEW — no legacy sprite; splits the retired gold-dragon-roster sheet into individual figures.** young metallic gold, jaw whisker-tendrils grown in, sail-wings half-furled, bright scales not yet worn — earnest severity, never friendly-cute. verb: STANDS-VIGIL. |
| spr-fantasy-juvenile-shadow-dragon | Large | shadow-warped juvenile dragon, scales gone translucent smoke-black, edges dissolving into faceted dark planes (MATERIAL, not a VFX plume), hollow eyes. verb: FADES-FORWARD. |
| spr-fantasy-wyvern | Large | two-legged draconic beast, wings-for-forelimbs half-furled, whip tail wrapped tight ending in a venom stinger, animal-dumb predator's head low. verb: STOOPS. |
| spr-fantasy-ridden-wyvern | Large | the same wyvern anatomy under a war saddle and harness rig — girth straps, chain rein, tack scuffed with use — **NO RIDER** (one identity per cell); the empty saddle is the horror. verb: WAITS-SADDLED. |
| spr-fantasy-half-dragon | Medium | humanoid warrior with a draconic head and scaled hide breaking through at the forearms and neck, soldier's kit, tail wrapped to the leg — a person the blood is slowly winning. verb: HOLDS-FORM. |
| spr-fantasy-faerie-dragon-youth | Tiny | cat-sized young faerie dragon, butterfly-membrane wings folded, iridescent scales (NO magenta — chroma law), tail coiled tight, sharp impish grin — fey mischief, not a mascot. verb: PLOTS-SMALL. |
| spr-fantasy-dracolich | Huge | undead dragon, hide rotted through to exposed bone at the wing-fingers and ribs, pinpoint cold eye-lights (material, no glow plume), wings half-furled skeletal, tail vertebrae wrapped tight. verb: ENDURES-DEATH. |
| spr-fantasy-behir | Huge | serpentine twelve-legged lightning beast, storm-blue plate scales, long body COILED AND STACKED tight per §0 (never a side-sprawl), crocodilian head low. verb: COILS-TO-STRIKE. |
| spr-fantasy-dragon-turtle | Gargantuan | mountainous sea beast, shell like a reefed island, steam-vents at the jaw rendered as rimed material (no vapor plume), flippers gathered under the mass. verb: SURFACES-SLOW. |

**Sheet plan S:** S1 (Large solo) young-black · S2 (Large solo) young-gold · S3 (Large solo)
juvenile-shadow-dragon · S4 (Large solo) wyvern · S5 (Large solo) ridden-wyvern · S6 (odd Medium
solo) half-dragon · S7 (odd Tiny solo) faerie-dragon-youth · S8 (Huge solo) dracolich · S9 (Huge
solo) behir · S10 (Gargantuan solo, fill the frame) dragon-turtle. Never sheet the beasts with
the half-dragon (humanoid register).

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L. Consolidate F5 returns into the canonical pilot tree
with per-lane provenance + a Step-E ledger, exactly like F1. On admission of the gold family,
mark the legacy `gold-dragon-roster` sheet RETIRED in the registry.
