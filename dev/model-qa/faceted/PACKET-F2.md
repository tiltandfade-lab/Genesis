# PACKET-F2 — Fantasy Faceted Figure Factory: dragons, wolves, orc civilians (wave 2)

**Authority:** identical to PACKET-F1 — `docs/FACETED-SPRITE-ART-MIGRATION.md` +
`dev/model-foundry/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8/§6.9/§7/§9 (banked on
`codex/extruded-prop-pilot`). This packet authors no new law. It continues the
`mass-production-priority.json` queue where F1 stopped: the dragon wave, the lupine family, and
the orc-civilian/warrior roster + a few stragglers. **All §0 ART-DIRECTION RULINGS and the
chroma rule from PACKET-F1 apply verbatim** — reread PACKET-F1 §0 before firing; it is not
repeated here.

**Scope lock:** FANTASY ONLY. One identity per CELL. Every output is a *candidate*
(`runtimeAdmitted:false`). Save returns under
`dev/model-foundry/faceted-regeneration-production/fantasy-pilot/raw-figures/` with the
`<slug>-candidate-NNN.png` naming, and record the generation call id per Step A.

## DISCIPLINE (identical across all F-packets; F1 audit lessons baked in)
1. **Filenames:** full slug incl. `spr-fantasy-` prefix; multi-cell sheets join their cell slugs (e.g. `spr-fantasy-wolf-winter-wolf-candidate-001.png`). Candidates numbered **per-slug from 001** (never a lane-global counter — F1 lanes 3–5 collided).
2. **Provenance:** per-lane JSON at `fantasy-pilot/provenance/<packet>-<lane>-generation-calls.json` (packet prefix mandatory, e.g. `f8-lane-u-…` — bare lane names collide across packets) (file / callId / cells). Never append to the shared AUDIT.md.
3. **Chroma:** flat uniform magenta **#FF00FF**; the chroma color must never appear IN a figure (F1 shipped a magenta-tinted shoe). No gradient, floor, shadow, or horizon.
4. **Crop:** generous padding — weapon tips, tails, stalks, wingtips, feet WELL inside the frame. Near-edge extremities were F1's most common defect.
5. **Cells:** exactly N figures in N equal vertical 4:8 cells, hard boundaries, no overlap, no shared props, varied poses — no two share a stance. Odd-remainder cells stay pure chroma.
6. **Props:** exactly ONE of each carried item (F1 produced a doubled kite shield).
7. **Faces/finish:** grounded, weathered, adult — no BG3-glamour prettiness (F1 lane-4 drift), no MMO gloss, no candy saturation.
8. **§0 laws:** lanky house bias, girth only when diegetic; COMPACT forward-facing support — wings half-furl, tails/coils wrap tight, legs gather (F1's spider and 3 of 4 dragon candidates failed this); adult register; realistic dark-fantasy horror with a stylized triangulated low-poly twist.
9. **No VFX in sources:** fire/frost/shadow read as faceted MATERIAL, never a particle plume (F1's flaming-skeleton oversprayed its silhouette).
10. Every output is a candidate — `runtimeAdmitted:false`; save to `fantasy-pilot/raw-figures/`; record every generation call id.

**Chroma:** magenta **#FF00FF** for all figures in this packet. (No identity here canonically
contains magenta.)

---

## RUN ORDER

Lanes A–D are mutually disjoint (no shared slugs) — fire all four in parallel Codex windows in
one sitting. No anchor gate this wave: the language was already locked by F1's anchor pass, and
these categories (dragons, wolves, orcs) are extensions of anchors F1 already approved
(black-dragon anchor → dragon lane; feral-dog anchor → wolf lane; orc guards/blacksmith from F1
lane 5 → orc-civilian lane). If any dragon returns off-language, hold that sheet only.

**Sheet-economy reminder (§0):** Large/Huge = 1 identity per sheet · Medium = 2 per sheet ·
Small/Tiny = 4 per sheet. Same category+register per sheet. Every cell is a vertical 4:8 frame.
For multi-cell sheets add: "Render [N] SEPARATE figures in [N] equal vertical 4:8 cells, hard
cell boundaries, no overlap, no shared props, one identity per cell, shared ground line per row,
varied poses — no two figures share a stance."

---

## LANE A — young dragons (bosses, Large, 1 per sheet) — 8 calls

> The F1 adult-black-dragon anchor (`candidate-004`, half-furled wings, compact coil, skull face,
> no effect plume) is the LANGUAGE REFERENCE for this whole lane — match its facet scale, compact
> support, and restraint. **No breath-weapon VFX in the source** — a red dragon is not breathing
> fire; the identity is in scale colour, horn architecture, and build, not an effect.

Each is a **Huge/Large dragon, 1 per sheet**, compiled from the §6.8 template exactly like the F1
1D black-dragon prompt — copy that prompt and swap the bracketed identity. Compact per §0 base law:
wings half-furled, tail wrapped tight around the support region, head low and level.

| slug | canonical facts (fill the §6.8 brackets from this) — verb + signature silhouette |
|---|---|
| spr-fantasy-young-red-dragon | chromatic fire dragon, scales deep crimson→black at the edges, tall back-swept horns in a lyre spread, proud raised chest, smoke curling from the nostrils (no flame). Cruel, arrogant. verb: RISES. |
| spr-fantasy-young-blue-dragon | chromatic lightning dragon, indigo hide, a single great frilled brow-horn, sand-scoured scales, ridged brow over deep-set eyes. Patient ambusher. verb: STALKS-LOW. |
| spr-fantasy-young-green-dragon | chromatic poison dragon, mottled forest-green, a broad crested neck-frill, sinuous low serpentine neck, cunning half-lidded eyes. Manipulative. verb: COILS-TO-LISTEN. |
| spr-fantasy-young-white-dragon | chromatic frost dragon, glassy blue-white scales rimed with frost, a knife-thin backswept crest, lean feral build, animal not clever. verb: HUNCHES. |
| spr-fantasy-young-silver-dragon | metallic dragon, bright silver scales with a smooth frilled ruff, noble level head, clean architectural facets. Kind but distant. verb: HOLDS-JUDGMENT. |
| spr-fantasy-young-bronze-dragon | metallic sea dragon, bronze-green patinated scales, tall ridged head-crest ending in curved horns, seafarer's confidence. verb: SQUARES-UP. |
| spr-fantasy-young-brass-dragon | metallic desert dragon, warm brass scales, a single wide chin-to-crown frill fan, talkative posture, head cocked. verb: LEANS-IN. |
| spr-fantasy-young-copper-dragon | metallic trickster dragon, ruddy copper scales, backswept horns and a mischievous jaw, coiled ready-to-spring haunches. verb: SET-TO-BOLT. |

**Sheet plan A:** S1 red · S2 blue · S3 green · S4 white · S5 silver · S6 bronze · S7 brass ·
S8 copper. (ERRATUM fixed 2026-07-13: an earlier draft claimed young-black-dragon was the F1
anchor — F1's anchor is the ADULT black dragon. `spr-fantasy-young-black-dragon` is a distinct
sprite and rides in **PACKET-F5 Lane S** with the other remaining dragon tiers.)

## LANE B — wyrmlings + off-type dragons (mixed size) — 6 calls

Wyrmlings read as young animals — clumsy-cute is the trap; keep them mean/awkward, not adorable.
Sizes vary → sheet-economy varies.

| slug | size / sheet role | canonical facts — verb |
|---|---|---|
| spr-fantasy-red-dragon-wyrmling | Medium | newly-hatched red, oversized head and feet on a scrawny body, crimson scales still soft-looking, defiant. verb: SNARLS-UP. |
| spr-fantasy-white-dragon-wyrmling | Medium | hatchling white, frost-dusted, hunched and feral, snapping. verb: SNAPS. |
| spr-fantasy-silver-dragon-wyrmling | Medium | hatchling silver, bright and alert, wings too big for the body. verb: TESTS-WINGS. |
| spr-fantasy-shadow-dragon | Large | undead/shadow-warped dragon, scales gone translucent smoke-black, edges dissolving into wisps (as MATERIAL, not a VFX plume), hollow eyes. verb: FADES-FORWARD. |
| spr-fantasy-the-pseudodragon | Tiny | cat-sized, wings folded, barbed tail curled, sly intelligent face — a familiar, not a monster. verb: PERCHES. |
| spr-fantasy-the-faerie-dragon | Tiny | butterfly-winged tiny dragon, iridescent scales (NO magenta), coiled tail, impish grin. verb: HOVERS. |

**Sheet plan B:** S1 (2 Medium wyrmlings) red-wyrmling + white-wyrmling · S2 (odd Medium solo)
silver-wyrmling · S3 (Large solo) shadow-dragon · S4 (2 Tiny — pack 2, or 4 if you add filler)
pseudodragon + faerie-dragon. Keep the two Large/Medium sizes off the Tiny sheet.

## LANE C — lupine family (beasts + shifters) — 4 calls

> Language reference: the F1 `scarred-feral-guard-dog` anchor (`candidate-003`) — true canine
> anatomy, compact front-facing stalk, no anthropomorphism. Wolves GATHER under the body (§0 base
> law); no wide side-sheet sprawl.

| slug | size / register | canonical facts — verb |
|---|---|---|
| spr-fantasy-wolf | Medium beast | lean grey timber wolf, winter coat, head low in a stalk, yellow eyes. verb: STALKS. |
| spr-fantasy-dire-wolf | Large beast | massive shaggy dire wolf, heavier jaw and shoulder, scarred muzzle. verb: BEARS-DOWN. |
| spr-fantasy-winter-wolf | Large beast | frost-white winter wolf, ice-blue eyes, breath-frost implied by rimed muzzle (no vapor VFX). verb: PROWLS. |
| spr-fantasy-wild-animal-territory-wolf-holds-a-stretch-of-ground-and-knows-every-crossing-of-it | Medium beast | prime-of-life pack alpha, confident planted stance, ears forward, scars of past fights. verb: OWNS-THE-GROUND. |
| spr-fantasy-wild-animal-a-lone-timber-wolf-pup-not-yet-part-of-any-pack-still-learning-to-hunt | Small beast | half-grown pup, gangly legs, ears too big, uncertain crouch — awkward not cute. verb: LEARNS. |
| spr-fantasy-werewolf | Medium humanoid (shifter) | hybrid werewolf mid-shift, human frame gone wrong with lupine skull and clawed hands, hunched, matted. Horror, not a mascot wolfman. verb: TURNS. |

**Sheet plan C:** S1 (2 Medium beasts) wolf + territory-wolf · S2 (2 Large beasts) dire-wolf +
winter-wolf · S3 (odd Small solo, or pair with filler) timber-wolf-pup · S4 (odd Medium solo)
werewolf. Never sheet beasts with the shifter — werewolf rides alone (humanoid register).

## LANE D — orc civilians, warriors + stragglers (NPC/monster register) — 6 calls

> Language reference: F1 lane 5's orc caravan-guard/blacksmith/healer — grounded working orcs,
> trade-built mass where diegetic, never green cartoon brutes. House bias still lanky; commit to
> girth only for the trades that earn it (farrier, metalworker).

| slug | register | canonical facts — verb |
|---|---|---|
| spr-fantasy-orc-warrior | Medium monster | frontline orc fighter, scavenged plate over hide, notched greataxe, disciplined not frenzied. verb: ADVANCES. |
| spr-fantasy-orc-berserker | Medium monster | stripped-to-the-waist orc berserker, ritual scars and warpaint, twin axes, mid-roar. verb: CHARGES. |
| spr-fantasy-orc-blind-prophet | Medium NPC | elderly orc seer, milk-white eyes, bound rag over the sockets, staff of knotted bone, still. verb: LISTENS-BEYOND. |
| spr-fantasy-rite-keeper-orc | Medium NPC | orc ritual keeper, ash-marked robes over work clothes, censer and tally-cord. verb: KEEPS-THE-RITE. |
| spr-fantasy-recruiter-orc | Medium NPC | orc recruiter, half-armored, open-handed persuasive stance, muster-roll in hand. verb: SIZES-YOU-UP. |
| spr-fantasy-metalworker-orc | Medium NPC | orc smith, heavy trade-built mass (diegetic), scorched apron, tongs and half-forged blade. verb: WORKS-THE-IRON. |
| spr-fantasy-cipher-orc | Medium NPC | orc scribe/codebreaker, ink-stained fingers, spectacle-cord, wax-sealed scroll case. verb: DECODES. |
| spr-fantasy-orcish-stable-hand-orc-gentle-with-horses-terrifying-to-everyone-else | Medium NPC | orc stable-hand, lead-rope and brush, careful gentle hands, easy posture. verb: CALMS. |
| spr-fantasy-orcish-farrier-orc-shoes-every-horse-in-the-valley-feared-and-respected-equally | Medium NPC | orc farrier, trade-built mass (diegetic), hoof-knife and rasp, leather chaps. verb: SETS-THE-SHOE. |
| spr-fantasy-kobold-inventor | Small monster | kobold tinkerer, goggles, satchel of springs and cogs, a half-built trap-toy. verb: TINKERS. |
| spr-fantasy-halfling-orchard-keeper-elderly-halfling-knows-every-tree-in-the-grove-by-name | Small NPC | elderly halfling orchardist, sun-hat, pruning hook, apron of seeds — gentle, weathered. verb: TENDS-THE-GROVE. |

**Sheet plan D:** S1 orc-warrior + orc-berserker (monsters) · S2 orc-blind-prophet + rite-keeper-orc
(NPC) · S3 recruiter-orc + metalworker-orc (NPC) · S4 stable-hand-orc + farrier-orc (NPC) ·
S5 (2×2 smalls remainder — pack with fillers or run as a 2-cell) kobold-inventor + halfling-orchard-keeper
(mixed small register — acceptable as a remainder sheet, or split into two solo Small sheets if
you prefer clean register separation). Keep Medium orcs off the Small sheet.

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L (chroma removal → despill → bounds/anchor/scale →
isolated renders → blind judge → integrated matrix → admission/typed rejection). Generation is
never completion; nothing ships without `in-game-pass`; the legacy sprite stays the fallback
until admission. Consolidate F2 returns exactly like F1: into the canonical pilot tree with
per-lane provenance and a Step-E ledger.

## NOT in this packet (the F3+ long tail — flagged, not scoped)

The on-disk set is **~896 sprites**. After F1+F2 the remainder is still large: **216 PC variants**,
the giants, the full wild/domestic/dungeon animal rosters, kids/townsfolk, swarms, and the rest of
the bestiary (aberrations, fiends, celestials, constructs, oozes, plants, undead beyond the F1
wave). And **EFFECTS/VFX** — spell effects, hit sparks, auras, breath weapons — are a **separate
asset class with no current sprite home** and are explicitly forbidden inside figure sources by
§7. Effects need their own art-direction ruling + prompt contract (transparent/near-black bg, not
magenta chroma; effect-centric framing) before they can be a lane. See the note to Adam.
