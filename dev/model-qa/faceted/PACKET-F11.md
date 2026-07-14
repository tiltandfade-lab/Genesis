# PACKET-F11 — Fantasy Faceted Figure Factory: humanoid stat-blocks & monster-folk (the adventuring world's people of violence)

**Authority + laws:** identical to PACKET-F1 (reread its **§0 ART-DIRECTION RULINGS** and chroma
rule before firing — not repeated here) and the compile template in
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8. This packet authors no new law. Compile each
sheet by copying an F1 Lane-1 prompt and swapping the bracketed identity from the seed tables
below. This is the humanoid violence tier: the SRD/MM generic NPC stat-blocks, the entertainers
and pirates who live beside them, the mid-shift lycanthropes, and the monster-folk warbands.

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

**Register tags in the tables (§6.8 category insertion):** **NPC** rows get social attitude +
occupation + carried objects + restrained noncombat pose; **monster** rows add combat behavior on
top of the humanoid identity. Everyone in this packet is a person first — even the monster-register
rows read as people of violence, not creatures.

**§0 girth rulings for this packet:** `noble`, `tough-boss`, and `pirate-admiral` legitimately
carry weight — commit to it as diegetic mass. Everyone else stays on the lanky house bias.

---

## RUN ORDER

Lanes F11-A through F11-E are mutually disjoint — fire as many in parallel as you have Codex
windows. No anchor gate (language locked by F1). If a whole family returns off-language, hold that
family's sheets and recalibrate its seed row; don't block the others.

---

## LANE F11-A — generic stat-blocks core (23 identities, ~12 sheets)

The SRD/MM generic NPCs. Each needs a DISTINCT silhouette — these are the archetypes the player
will see most, so `mage` vs `archmage` must read as apprentice-vs-master contrast at sprite scale,
`warrior-infantry` vs `warrior-veteran` as raw recruit vs grizzled sergeant. All Medium.

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-commoner | Medium / NPC | ordinary townsperson of a hard world, wary deference, patched wool, hand-sickle at the belt, bundle over one shoulder, restrained standing pose. verb: KEEPS-HEAD-DOWN. |
| spr-fantasy-noble | Medium / NPC | soft-living aristocrat, entitled composure, fur-trimmed cloak, signet ring, thin ceremonial rapier worn never used; well-fed girth is diegetic here (§0). verb: EXPECTS-DEFERENCE. |
| spr-fantasy-knight | Medium / monster | professional cavalier in dented full plate, disciplined menace, longsword and kite shield (ONE shield), closed visor up. verb: HOLDS-THE-LINE. |
| spr-fantasy-questing-knight | Medium / monster | errant knight far from any court, road-worn resolve, faded tabard over travel-scarred plate, greatsword across the back, pilgrim tokens. verb: PRESSES-ON. |
| spr-fantasy-mage | Medium / monster | journeyman battle-caster, guarded and hungry to prove it, plain robes, simple staff, component pouch — the APPRENTICE half of the mage/archmage contrast. verb: SHAPES-THE-SPELL. |
| spr-fantasy-archmage | Medium / monster | master wizard, utter unhurried calm, layered formal robes, ornate staff, chained grimoire at the hip — the MASTER half; taller bearing, richer silhouette. verb: NEED-NOT-HURRY. |
| spr-fantasy-priest | Medium / monster | battle-priest, stern conviction, mace, holy symbol raised, chain shirt under vestments. verb: SMITES-THE-UNRIGHTEOUS. |
| spr-fantasy-priest-acolyte | Medium / NPC | young adult acolyte, earnest and unsure, cold censer, prayer book, plain novice robe, restrained attentive pose. verb: FOLLOWS-THE-RITE. |
| spr-fantasy-archpriest | Medium / monster | mitred hierarch, absolute doctrinal authority, crozier-staff, gold-thread vestments, commanding benediction gesture. verb: PRONOUNCES-JUDGMENT. |
| spr-fantasy-archdruid | Medium / monster | wild high druid, authority of old growth, antler-crowned staff, moss-and-lichen robes, bone fetishes. verb: SPEAKS-FOR-THE-WILD. |
| spr-fantasy-druid-circle-warden | Medium / monster | circle guardian, watchful territorial calm, living-wood staff, stone sickle, hide mantle. verb: WARDS-THE-CIRCLE. |
| spr-fantasy-assassin | Medium / monster | contract killer, professional detachment, dark fitted leathers, single dagger, hand crossbow, poison vials at the belt. verb: FINISHES-THE-CONTRACT. |
| spr-fantasy-scout | Medium / monster | wilderness forward-eye, quiet economy of motion, shortbow, quiver, rolled bedkit, mud-toned leathers. verb: RANGES-AHEAD. |
| spr-fantasy-spy | Medium / monster | infiltrator in nondescript town clothes, practiced blandness, concealed dagger, forged papers, nothing memorable about the face on purpose. verb: PASSES-UNNOTICED. |
| spr-fantasy-spy-master | Medium / monster | handler of a web of eyes, fine merchant's coat, cane concealing a blade, sealed correspondence, weighs-everyone gaze. verb: PULLS-THE-THREADS. |
| spr-fantasy-gladiator | Medium / monster | arena showman-killer, scarred bravado, trident, weighted net, single spaulder on the leading arm. verb: PLAYS-TO-THE-CROWD. |
| spr-fantasy-berserker | Medium / monster | wild-eyed raider, no armor worth the name, greataxe, fur wraps, ritual scarring. verb: GIVES-IN-TO-IT. |
| spr-fantasy-berserker-commander | Medium / monster | scar-mapped veteran of the fury, cold banked rage, greataxe, wolf-pelt mantle, trophy rings. verb: AIMS-THE-STORM. |
| spr-fantasy-tough | Medium / monster | street bruiser, casual intimidation, cudgel, brass knuckles, dockside coat. verb: LEANS-IN. |
| spr-fantasy-tough-boss | Medium / monster | heavyset enforcer boss, weight worn as threat (girth diegetic, §0), spiked club, fur collar, heavy rings. verb: OWNS-THE-ROOM. |
| spr-fantasy-warrior-infantry | Medium / monster | rank-and-file soldier, drilled obedience, spear, round shield, mass-issue gambeson — the RECRUIT half of the infantry/veteran contrast. verb: HOLDS-FORMATION. |
| spr-fantasy-warrior-veteran | Medium / monster | grizzled sergeant, seen-everything weariness, notched longsword, many-times-mended half-plate — the VETERAN half; heavier stance, older face. verb: OUTLASTS. |
| spr-fantasy-lantern-sage | Medium / NPC | itinerant scholar-mystic, patient curiosity, hooded lantern hung from a walking staff (lit glow reads as faceted material, §9 — no plume), scroll case, restrained pose. verb: CARRIES-THE-LIGHT. |

**Sheet plan (F11-A):** pair within register. NPC sheets: `commoner`+`noble` ·
`priest-acolyte`+`lantern-sage`. Monster sheets: `knight`+`questing-knight` · `mage`+`archmage`
(the apprentice-master contrast on one sheet) · `priest`+`archpriest` ·
`archdruid`+`druid-circle-warden` · `assassin`+`scout` · `spy`+`spy-master` ·
`berserker`+`berserker-commander` · `tough`+`tough-boss` ·
`warrior-infantry`+`warrior-veteran` · `gladiator` rides alone (odd remainder).

## LANE F11-B — performers (4 identities, 2 sheets)

All NPC register — working entertainers, restrained performance poses, no VFX.

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-performer | Medium / NPC | street busker, hopeful hustle, lute, upturned hat for coins, patched bright clothes. verb: WORKS-THE-CROWD. |
| spr-fantasy-performer-legend | Medium / NPC | aging famous bard, weary grace, masterwork lute, fine but road-worn coat, decades of applause behind the eyes. verb: STILL-HAS-IT. |
| spr-fantasy-performer-maestro | Medium / NPC | imperious conductor-composer, exacting standards, baton, sheaf of scores, formal dress a decade out of fashion. verb: DEMANDS-THE-TEMPO. |
| spr-fantasy-performer-tiefling | Medium / NPC | tiefling stage-mystic, showman's warmth over guardedness, horns ribbon-wrapped for the act, prop deck of cards, stage cape — ancestry visible, never caricature. verb: TAKES-THE-BOW. |

**Sheet plan (F11-B):** `performer`+`performer-legend` · `performer-maestro`+`performer-tiefling`.

## LANE F11-C — pirates (3 identities, 2 sheets)

Monster register — sea-raiders in the violence tier, salt-cured and mean.

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-pirate | Medium / monster | deckhand cutthroat, opportunist's grin, cutlass, coiled boarding rope, bare feet on planking stance. verb: BOARDS-FIRST. |
| spr-fantasy-pirate-captain | Medium / monster | weatherbeaten captain, hard charisma, long salt-stained coat, cutlass, wheel-lock pistol, spyglass at the belt (ONE of each). verb: GIVES-NO-QUARTER. |
| spr-fantasy-pirate-admiral | Medium / monster | corpulent fleet admiral, weight worn as decades of plunder (girth diegetic, §0), braid-heavy coat, ornate saber, chart tube. verb: COMMANDS-THE-FLEET. |

**Sheet plan (F11-C):** `pirate`+`pirate-captain` · `pirate-admiral` rides alone.

## LANE F11-D — lycanthropes (5 identities, 3 sheets)

Monster register. Hybrid MID-SHIFT forms exactly like F2's werewolf: a human frame gone wrong —
clothes splitting, joints bending against their design, horror not mascot. No cute animal-people.

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-jackalwere | Medium / monster | lean jackal-headed deceiver caught mid-shift, human traveler's clothes hanging wrong on the new frame, scimitar, liar's poise curdling. verb: DROPS-THE-MASK. |
| spr-fantasy-wererat | Medium / monster | hunched rat-hybrid, mangy patchy fur through torn shirt, shortsword held low, wrong-jointed crouch. verb: SKITTERS-LOW. |
| spr-fantasy-wereboar | Medium / monster | tusked boar-hybrid bursting the seams of farmer's clothes, bristle-backed, maul, blunt fury. verb: GORES-THROUGH. |
| spr-fantasy-werebear | Medium / monster | massive bear-hybrid, shredded shirt on a frame twice too big for it, no weapon — clawed hands, sorrowful rage. verb: MAULS. |
| spr-fantasy-weretiger | Medium / monster | striped tiger-hybrid in torn finery, predatory patience, claws flexing, human eyes in the wrong face. verb: STALKS-UPRIGHT. |

**Sheet plan (F11-D):** `jackalwere`+`wererat` (lean skulkers) · `wereboar`+`werebear` (heavy
bruisers) · `weretiger` rides alone.

## LANE F11-E — monster-folk (13 identities, 7 sheets)

Monster register, all Medium. Family notes: **aarakocra** are true avian anatomy — feathered
bird-folk, wings HALF-FURLED per §0 compact-support law, never spread. **Thri-kreen** are
four-armed mantis-folk — chitin, compound eyes, alien stillness. **Fish-folk** are clammy
goggle-eyed deep cultists — pale, wet-sheened, wrong. **Astral raiders** are gaunt yellow-green
raiders in baroque ornate armor — describe, don't name; no IP terms in any prompt.

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-aarakocra-skirmisher | Medium / monster | bird-folk raider, true avian anatomy, wings half-furled tight to the back (§0), javelin, talon-footed ready stance. verb: STRIKES-AND-LIFTS. |
| spr-fantasy-aarakocra-aeromancer | Medium / monster | bird-folk wind-caller, ruffled ritual plumage, fetish-strung staff, wings furled, storm-reading gaze. verb: CALLS-THE-GALE. |
| spr-fantasy-bullywug-warrior | Medium / monster | squat frog-folk soldier, croaking belligerence, mud-crusted hide armor, crude spear, wide wet stance kept compact. verb: HOP-LUNGES. |
| spr-fantasy-bullywug-bog-sage-mud-lord | Medium / monster | bloated frog-folk mystic-chief, swamp-court pomposity, reed-and-bone crown, mud-caked staff, throat-sac swelling. verb: HOLDS-COURT-IN-MUD. |
| spr-fantasy-thri-kreen-marauder | Medium / monster | four-armed mantis-folk raider, alien pack-hunter economy, chitin plates, hooked polearm in the upper pair, throwing wedge in a lower hand (ONE of each). verb: CLOSES-IN-SILENCE. |
| spr-fantasy-thri-kreen-psion | Medium / monster | four-armed mantis-folk mystic, unnerving stillness, no weapon — faceted focus-crystal held in the upper pair, lower arms folded. verb: PRESSES-THE-MIND. |
| spr-fantasy-fish-folk | Medium / monster | clammy deep-cultist fish-folk, pale goggle eyes, wet-sheened skin, crude bone-barbed spear, hunched dripping stance. verb: SURFACES-HUNGRY. |
| spr-fantasy-fish-folk-whip | Medium / monster | lash-bearing fish-folk overseer-priest, fanatic zeal, barbed whip, shell fetishes, driving the lesser faithful. verb: DRIVES-THE-FAITHFUL. |
| spr-fantasy-fish-folk-monitor | Medium / monster | fish-folk martial enforcer, no weapon — open-handed pincering stance, harness of lashed shells, disciplinarian's calm. verb: PINIONS. |
| spr-fantasy-fish-folk-archpriest | Medium / monster | barnacle-crusted fish-folk high priest, mad certainty, idol-topped staff, ray-fin crown, votive shell strings. verb: INVOKES-THE-DEEP. |
| spr-fantasy-astral-raider-warrior | Medium / monster | gaunt yellow-green raider, contemptuous poise, baroque filigreed armor, serrated greatsword. verb: RAIDS-BETWEEN-WORLDS. |
| spr-fantasy-astral-raider-knight | Medium / monster | elite gaunt raider knight, executioner's ceremony, high-crested baroque plate, ornate silver greatsword. verb: EXECUTES. |
| spr-fantasy-astral-raider-dracomancer | Medium / monster | gaunt raider dragon-binder, cold sorcerous authority, scale-etched robes over baroque half-armor, dragon-fang staff. verb: BINDS-THE-WYRM. |

**Sheet plan (F11-E):** `aarakocra-skirmisher`+`aarakocra-aeromancer` ·
`bullywug-warrior`+`bullywug-bog-sage-mud-lord` · `thri-kreen-marauder`+`thri-kreen-psion` ·
`fish-folk`+`fish-folk-whip` · `fish-folk-monitor`+`fish-folk-archpriest` ·
`astral-raider-warrior`+`astral-raider-knight` · `astral-raider-dracomancer` rides alone.

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L. Consolidate F11 returns into the canonical pilot tree
with per-lane provenance + a Step-E ledger, exactly like F1.
