# PACKET-F7 — Fantasy Faceted Figure Factory: fiends & celestials (demons, devils, yugoloths, angels)

**Authority + laws:** identical to PACKET-F1 (reread its **§0 ART-DIRECTION RULINGS** and chroma
rule before firing — not repeated here) and the compile template in
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8. This packet authors no new law. Compile each
sheet from the §6.8 template exactly as F1 did — copy any F1 Lane-1 prompt and swap the bracketed
identity from the seed tables below (monsters add combat behavior + horror mechanism + support
region per the §6.8 category insertion).

**Register law for this packet:** fiends and celestials are the two poles of the planes and must
read as such. Demons = chaotic wrongness — anatomy that argues with itself. Devils = hierarchical
order-horror — cruelty with a rank insignia. Yugoloths = mercenary between-fiends, loyal to the
fee. Celestials = awe and severity, never kitsch — an angel should be frightening in its
stillness. All of it stays grounded dark-fantasy per §0; nothing here is a cartoon.

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

Lanes P–T are mutually disjoint — fire as many in parallel as you have Codex windows. No anchor
gate (language locked by F1). If a whole family returns off-language, hold that family's sheets
and recalibrate its seed row; don't block the others.

---

## LANE P — demons (the chaotic pole) — 12 identities

Chaotic wrongness is the register: bodies that look assembled by appetite, not design. Winged
demons keep wings HALF-FURLED and tails WRAPPED (§0 — F1's failures were all sprawl). Flame and
spore read as faceted material, never a plume.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-balor | Huge | balor demon-general, great bat wings half-furled, flame seaming its hide AS FACETED MATERIAL (no plume), whip in one fist, blade in the other — one of each. verb: DECLARES-RUIN. |
| spr-fantasy-chasme | Large | fly-demon chasme, droning insect wings folded flat along the back, proboscis face, spindly limbs gathered under it. verb: DRONES-CLOSE. |
| spr-fantasy-dretch | Small | pot-bellied dretch, slack rubbery hide, stubby claws, miserable resentful hunch. verb: COWERS-FORWARD. |
| spr-fantasy-glabrezu | Large | four-armed glabrezu — two great pincer arms, two humanoid hands — dog-snouted head, a tempter's patient poise. verb: OFFERS-THE-BARGAIN. |
| spr-fantasy-hezrou | Large | toad-demon hezrou, wide gulping maw, spined back, squat gathered crouch, visibly reeking. verb: SQUATS-TO-SPRING. |
| spr-fantasy-manes | Small | mindless manes, larval damned-soul demon, doughy split hide, needle teeth, blind clawing. verb: CLAWS-BLIND. |
| spr-fantasy-manes-vaporspawn | Small | manes mid-dissolution, body sloughing into faceted vapor planes (material, not a smoke plume), face last to go. verb: COMES-APART. |
| spr-fantasy-marilith | Large | six-armed marilith, one blade per hand, serpent lower body COILED COMPACT beneath the torso (§0), a commander's cold poise. verb: CONDUCTS-THE-SLAUGHTER. |
| spr-fantasy-nalfeshnee | Large | bloated boar-ape nalfeshnee, undersized feathered wings furled tight, tusked judicial leer. verb: GLOATS. |
| spr-fantasy-vrock | Large | vulture-demon vrock, filth-mottled feathers, wings half-furled, spore-crusted chest, taloned stance. verb: SCREECHES-DOWN. |
| spr-fantasy-yochlol | Medium | yochlol handmaiden, melted-wax pillar with a single eye and reaching pseudopods, one flank half-shifted toward a drow silhouette. verb: MELTS-BETWEEN-SHAPES. |
| spr-fantasy-larva | Medium | damned larva, bloated maggot body wearing a human face, dragging itself by soft graspings. verb: SQUIRMS. |

**Sheet plan (Lane P):** `balor` Huge solo · Large solos: `chasme`, `glabrezu`, `hezrou`,
`marilith`, `nalfeshnee`, `vrock` · Medium pair: `yochlol`+`larva` (both soul-stuff horrors) ·
one Small 2×2: `dretch`+`manes`+`manes-vaporspawn` + fourth cell pure chroma. 9 sheets.

## LANE Q — devils (the lawful pole) — 3 identities

**Do NOT duplicate F3 Lane F** — barbed/bearded/chain/spined/bone/horned/ice devils plus
imp/quasit are already covered there. This lane fills only the three gaps. Register is
order-horror: cruelty administered, not indulged.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-erinyes | Medium | erinyes battle-devil, dark feathered wings furled, immaculate warplate, single longsword, the bearing of a sentence being read. verb: PASSES-SENTENCE. |
| spr-fantasy-lemure | Medium | lemure, molten-flesh mound with a vaguely human agonized face, limbless, the bottom rank of Hell made literal. verb: OOZES-IN-RANK. |
| spr-fantasy-pit-fiend | Large | pit fiend tyrant-general, great horns, wings half-furled, tail wrapped around the stance, flame-veined hide as material, one heavy mace. verb: COMMANDS-THE-LEGION. |

**Sheet plan (Lane Q):** Medium pair: `erinyes`+`lemure` (top and bottom of the hierarchy, same
devil register) · `pit-fiend` Large solo. 2 sheets.

## LANE R — corrupters & shapeshifters — 7 identities

The social fiends. succubus/incubus carry seductive MENACE without pin-up glamour — rule 7
applies hard here: weathered, adult, predatory stillness, no BG3 prettiness, no cheesecake pose.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-cambion | Medium | half-fiend cambion, human bearing betrayed by horns and furled leather wings, courtly blade, ambition worn openly. verb: CHARMS-THE-COURT. |
| spr-fantasy-incubus | Medium | incubus, beautiful-and-wrong, furled bat wings, tail wrapped, allure as threat — NO pin-up glamour (rule 7). verb: LEANS-TOO-CLOSE. |
| spr-fantasy-succubus | Medium | succubus, same law as the incubus — seduction read as predation, furled wings, tail wrapped tight, weathered adult menace, zero cheesecake. verb: PROMISES-RUIN. |
| spr-fantasy-night-hag | Medium | night hag, gaunt blue-black crone, warty hide, iron talons, heartstone pouch at the belt, dream-eater's smile. verb: RIDES-DREAMS. |
| spr-fantasy-rakshasa | Medium | rakshasa, tiger-headed noble in rich robes, backward-palmed hands (canon), courtesy that is entirely false. verb: SMILES-FALSE. |
| spr-fantasy-oni | Large | oni ogre-mage, blue-black hide, small horns, single glaive, a night-prowler's patient cunning. verb: STALKS-THE-EAVES. |
| spr-fantasy-nightmare | Large | nightmare steed, TRUE equine anatomy, mane and fetlocks of faceted flame as material (no plume), no rider, no tack. verb: PAWS-THE-DARK. |

**Sheet plan (Lane R):** Medium pairs: `incubus`+`succubus` (the natural pair) ·
`cambion`+`rakshasa` (courtly deceivers) · `night-hag` rides alone · Large solos: `oni`,
`nightmare`. 5 sheets.

## LANE S — yugoloths (the mercenary between) — 4 identities

Neither pole: fiends as contractors. Everything about them should read transactional — kept
gear, professional posture, loyalty priced.

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-arcanaloth | Medium | arcanaloth, jackal-headed contract-mage in fine robes, one sealed contract scroll in hand, ink-stained precision. verb: AMENDS-THE-CONTRACT. |
| spr-fantasy-mezzoloth | Medium | mezzoloth line-mercenary, insectile chitin plates, four arms with a single trident, soldier's economy of motion. verb: HONORS-THE-FEE. |
| spr-fantasy-nycaloth | Large | nycaloth shock-trooper, four-armed gargoyle-green brute, one greataxe, bat wings half-furled for the drop. verb: DROPS-FROM-ABOVE. |
| spr-fantasy-ultroloth | Medium | ultroloth overseer, elongated featureless egg-smooth head, twin opalescent eyes the only feature, austere robes, no weapon needed. verb: STARES-THROUGH. |

**Sheet plan (Lane S):** Medium pair: `arcanaloth`+`ultroloth` (the officer caste) · `mezzoloth`
rides alone · `nycaloth` Large solo. 3 sheets.

## LANE T — celestials — 8 identities

Awe and severity, not kitsch. An angel is frightening in its stillness; radiance reads as faceted
material, never a glow VFX. Unicorn and pegasus keep TRUE equine anatomy — any My-Little-Pony
drift is an automatic reject. Couatl coils stacked tight (§0).

| slug | size | seed — verb |
|---|---|---|
| spr-fantasy-couatl | Medium | couatl, feathered rainbow serpent, coils STACKED TIGHT beneath it (§0), wings furled along the coil, ancient patient gaze. verb: WATCHES-OVER. |
| spr-fantasy-deva | Medium | deva messenger-angel, silvered skin, white wings furled, single mace held low, a stillness that unsettles. verb: STANDS-SENTINEL. |
| spr-fantasy-planetar | Large | planetar, hairless emerald-skinned warrior-angel, wings half-furled, one greatsword, judgment already decided. verb: EXECUTES-JUDGMENT. |
| spr-fantasy-solar | Large | solar, the greatest of angels, radiance as faceted material across skin and feather, wings half-furled, one greatsword. verb: PRONOUNCES-DOOM. |
| spr-fantasy-empyrean | Huge | empyrean, titan-child of gods, beautiful and terrible, weather-of-mood on its face, one great maul grounded like a scepter. verb: STRIDES-GODBORN. |
| spr-fantasy-empyrean-iota | Small | empyrean iota, a knee-high fragment-scion of an empyrean, the same terrible beauty at miniature scale — awe, never cute-mascot. verb: MIRRORS-THE-TITAN. |
| spr-fantasy-pegasus | Large | pegasus, TRUE equine anatomy (no toy-pony drift), white feathered wings half-furled, unshod, unbridled, wary of mortals. verb: ALIGHTS. |
| spr-fantasy-unicorn | Large | unicorn, true equine anatomy, single spiral horn, forest-warden severity — a guardian that has killed for its glade, no kitsch. verb: WARDS-THE-GLADE. |

**Sheet plan (Lane T):** Medium pair: `couatl`+`deva` (both celestial watchers; couatl coiled
compact in its cell) · Large solos: `planetar`, `solar`, `pegasus`, `unicorn` · `empyrean` Huge
solo · `empyrean-iota` Small rides alone on a 2×2 (three cells pure chroma). 7 sheets.

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L. Consolidate F7 returns into the canonical pilot tree
with per-lane provenance + a Step-E ledger, exactly like F1.
