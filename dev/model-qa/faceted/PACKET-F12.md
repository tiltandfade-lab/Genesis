# PACKET-F12 — Fantasy Faceted Figure Factory: civilians & faction role-skins (the town's people)

**Authority + laws:** identical to PACKET-F1 (reread its **§0 ART-DIRECTION RULINGS** and chroma
rule before firing — not repeated here) and the compile template in
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8. This packet authors no new law. Compile each
sheet by copying an F1 Lane-1 prompt and swapping the bracketed identity from the seed tables
below. This is the town: every identity here is **NPC register** — social attitude + occupation +
carried objects + restrained noncombat pose, per §6.8. Nobody in this packet is brandishing
anything. The binding tone is F1 lane 5's guards/blacksmith/healer: grounded working people,
weathered, dignified — ancestry visible but never caricature (this matters most for the orc-blood,
tiefling, and goliath civilians).

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

**Long descriptive slugs:** many rows below carry a full sentence as the slug (e.g.
`human-midwife-elderly-delivered-half-the-village-remembers-all-of-it`). Keep the slug VERBATIM in
filenames and provenance — the sentence IS most of the identity seed. The table's seed column only
adds kit landmarks + the verb; compile the sentence itself into the bracketed identity.

**Role-skin singles** (`feeder-tiefling`, `stand-in-dwarf`, `unofficial-power-elf`, and kin) are
faction/role skins: interpret the role PLAINLY — the feeder keeps people fed; the stand-in is the
one sent to take someone's place; the unofficial power is the one who actually runs things.
Grounded working-life reads, no fantasy-costume clichés.

**§0 girth rulings for this packet:** `magnate-halfling`, `host-goliath`, and
`pampered-elite-goliath` legitimately carry weight — commit to it as diegetic mass. Everyone else
stays on the lanky house bias.

---

## RUN ORDER

Lanes F12-A through F12-H are mutually disjoint — fire as many in parallel as you have Codex
windows. No anchor gate (language locked by F1). If a whole family returns off-language, hold that
family's sheets and recalibrate its seed row; don't block the others.

---

## LANE F12-A — humans (11 identities, 6 sheets)

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-human-midwife-elderly-delivered-half-the-village-remembers-all-of-it | Medium / NPC | the slug sentence is the seed; kit: heavy shawl, birthing satchel, small oil lamp. verb: REMEMBERS-ALL-OF-IT. |
| spr-fantasy-human-midwife-s-apprentice-human-dark-skinned-learning-the-trade-from-her-mother | Medium / NPC | the slug sentence is the seed; kit: linen apron, wash basin, folded clean cloths. verb: LEARNS-THE-TRADE. |
| spr-fantasy-human-miller-dust-covered-counts-every-sack-twice | Medium / NPC | the slug sentence is the seed; kit: flour-dusted apron, notched tally-stick, grain scoop. verb: COUNTS-TWICE. |
| spr-fantasy-human-retired-soldier-one-armed-human-dark-skinned-runs-the-town-s-only-proper-tavern-brawl-rules | Medium / NPC | the slug sentence is the seed; kit: pinned-up empty sleeve, bar rag over the shoulder, old service knife kept sheathed. verb: KEEPS-ORDER. |
| spr-fantasy-human-town-crier-human-announces-news-rumor-and-the-occasional-lie-for-coin | Medium / NPC | the slug sentence is the seed; kit: handbell, notice scroll, loud patch-bright coat. verb: CRIES-THE-NEWS. |
| spr-fantasy-human-wheelwright-human-dark-skinned-third-generation-in-the-same-shop | Medium / NPC | the slug sentence is the seed; kit: spokeshave, unfinished wheel rim leaned at the hip, leather work apron. verb: TRUES-THE-WHEEL. |
| spr-fantasy-healer-human | Medium / NPC | village healer, calm triage manner that has seen everything, herb satchel, wrapped splints, stained but clean apron. verb: TENDS. |
| spr-fantasy-maker-human | Medium / NPC | general craftsman, quiet plain competence, tool roll, work apron, calloused hands turning a half-finished piece. verb: MAKES. |
| spr-fantasy-hidden-fanatic-human | Medium / NPC | outwardly ordinary townsperson, a too-even smile, everyday market basket, plain clothes, a devotional token kept just out of sight. verb: PASSES-FOR-ORDINARY. |
| spr-fantasy-secret-scholar-human | Medium / NPC | shopkeeper by day and scholar by lamplight, guarded curiosity, ink-stained cuffs, locked ledger under the arm, reading spectacles. verb: HIDES-THE-STUDY. |
| spr-fantasy-guilt-stained-vagrant | Medium / NPC | road-worn drifter carrying something unforgiven, flinching eyes that avoid yours, rolled bedding, tin begging bowl. verb: CANNOT-SET-IT-DOWN. |

**Sheet plan (F12-A):** `human-midwife-elderly…`+`human-midwife-s-apprentice…` (mother-line pair) ·
`human-miller…`+`human-wheelwright…` · `human-retired-soldier…`+`human-town-crier…` ·
`healer-human`+`maker-human` · `hidden-fanatic-human`+`secret-scholar-human` ·
`guilt-stained-vagrant` rides alone.

## LANE F12-B — dwarves (8 identities, 4 sheets)

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-dwarven-brewer-the-tavern-s-actual-reason-for-existing | Medium / NPC | the slug sentence is the seed; kit: mash paddle, tapped keg at the knee, stained brewer's apron. verb: POURS. |
| spr-fantasy-dwarven-brewery-heiress-dwarf-runs-the-family-business-better-than-her-father-did | Medium / NPC | the slug sentence is the seed; kit: ledger under one arm, tasting cup, ring of house keys. verb: RUNS-IT-BETTER. |
| spr-fantasy-dwarven-forge-master-three-generations-of-the-same-smithy-soot-in-every-crease | Medium / NPC | the slug sentence is the seed; kit: smith's hammer at rest, scarred leather apron, tongs hooked at the belt. verb: WORKS-THE-ANVIL. |
| spr-fantasy-dwarven-mine-assayer-dwarf-judges-ore-quality-by-weight-and-smell-alone | Medium / NPC | the slug sentence is the seed; kit: hand-scale, raw ore sample held to the nose, chalk-marked ledger. verb: JUDGES-THE-ORE. |
| spr-fantasy-clothier-dwarf | Medium / NPC | tailor-draper, precise professional pride, shears, knotted measuring cord around the neck, bolt of cloth over the shoulder. verb: FITS. |
| spr-fantasy-hired-blade-dwarf | Medium / NPC | off-duty sellsword between contracts, watchful ease, axe sheathed and peace-knotted, coin pouch, travel pack — restrained, not brandishing. verb: WAITS-FOR-WORK. |
| spr-fantasy-stand-in-dwarf | Medium / NPC | the one sent to take someone's place, resigned steadiness, a borrowed coat that doesn't quite fit, another dwarf's papers held carefully. verb: TAKES-THE-PLACE. |
| spr-fantasy-wild-provider-dwarf | Medium / NPC | forager-hunter who keeps the hall fed, weatherproof patience, game bag, coiled snare cords, walking spear carried as a tool. verb: BRINGS-BACK-DINNER. |

**Sheet plan (F12-B):** `dwarven-brewer…`+`dwarven-brewery-heiress…` (family-business pair) ·
`dwarven-forge-master…`+`dwarven-mine-assayer…` · `clothier-dwarf`+`wild-provider-dwarf` ·
`hired-blade-dwarf`+`stand-in-dwarf`.

## LANE F12-C — elves (8 identities, 4 sheets)

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-elven-archivist-keeper-of-a-library-older-than-the-town-around-it | Medium / NPC | the slug sentence is the seed; kit: iron key ring, ribbon-marked catalog, shielded reading lamp. verb: KEEPS-THE-STACKS. |
| spr-fantasy-elven-fletcher-every-arrow-leaves-her-stall-true | Medium / NPC | the slug sentence is the seed; kit: fletching knife, bundle of feathers, sheaf of arrow blanks. verb: TRUES-THE-ARROW. |
| spr-fantasy-elven-herbalist-elf-sells-cures-and-quietly-a-few-curses | Medium / NPC | the slug sentence is the seed; kit: hanging herb bundles, stone mortar, one discreet black-corked vial. verb: SELLS-BOTH. |
| spr-fantasy-elven-ranger-s-apprentice-elf-still-learning-to-read-a-trail-properly | Medium / NPC | the slug sentence is the seed; kit: too-new boots, dog-eared journal of tracks, unstrung practice bow slung as luggage. verb: MISREADS-THE-TRAIL. |
| spr-fantasy-elven-scribe-elf-copies-manuscripts-for-the-town-archive-meticulous-to-a-fault | Medium / NPC | the slug sentence is the seed; kit: quill case, pounce pot of drying sand, manuscript board. verb: COPIES-EXACTLY. |
| spr-fantasy-hauler-elf | Medium / NPC | dock-and-warehouse hauler, quiet endurance, carry-yoke across the shoulders, rope sling, cargo hook worn dull. verb: HAULS. |
| spr-fantasy-outfitter-elf | Medium / NPC | expedition outfitter, brisk appraising eye, coiled rope stock, empty pack frame, chalk inventory slate. verb: KITS-THEM-OUT. |
| spr-fantasy-unofficial-power-elf | Medium / NPC | the one who actually runs the town, unhurried certainty, a plain but very good coat, a small ledger everyone fears, no visible office and none needed. verb: DECIDES-QUIETLY. |

**Sheet plan (F12-C):** `elven-archivist…`+`elven-scribe…` (paper pair) ·
`elven-fletcher…`+`elven-ranger-s-apprentice…` · `elven-herbalist…`+`hauler-elf` ·
`outfitter-elf`+`unofficial-power-elf`.

## LANE F12-D — halflings (8 identities, 2 sheets, Small 2×2)

All Small — four per sheet in a 2×2 grid, hard boundaries, varied poses.

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-halfling-farmer-dark-skinned-tends-the-best-soil-in-the-valley | Small / NPC | the slug sentence is the seed; kit: hoe carried easy, seed pouch, wide sun hat. verb: TENDS-THE-BEST-SOIL. |
| spr-fantasy-halfling-innkeeper-knows-every-traveler-s-business-before-they-ve-unpacked | Small / NPC | the slug sentence is the seed; kit: key ring, laden tray, guest book tucked under one arm. verb: ALREADY-KNOWS. |
| spr-fantasy-halfling-messenger-runner-halfling-fastest-feet-in-the-county-mostly-ignored-otherwise | Small / NPC | the slug sentence is the seed; kit: letter satchel, worn-soled running shoes, water skin. verb: RUNS-THE-COUNTY. |
| spr-fantasy-halfling-roadside-chef-halfling-feeds-every-traveler-who-passes-no-exceptions | Small / NPC | the slug sentence is the seed; kit: long ladle, hanging pot on a carry-pole, cloth spice roll. verb: FEEDS-EVERYONE. |
| spr-fantasy-destitute-halfling | Small / NPC | down on everything but dignity, patched blanket worn as a cloak, tin cup, one small bundle holding all that's owned. verb: GETS-BY. |
| spr-fantasy-magnate-halfling | Small / NPC | trade magnate, comfortable weight worn like credit (girth diegetic, §0), fine waistcoat, seal fob on a chain, contract case. verb: OWNS-THE-STREET. |
| spr-fantasy-remedy-maker-halfling | Small / NPC | home apothecary, kindly precision, basket of stoppered remedies, dropper bottle held to the light, stained apron. verb: MIXES-THE-CURE. |
| spr-fantasy-thief-halfling | Small / NPC | light-fingered local, practiced innocence, a coin mid-palm, lockpick hidden in a cuff, deceptively empty-looking bag. verb: LIFTS-IT-LIGHTLY. |

**Sheet plan (F12-D):** two 2×2 sheets — Sheet 1: `halfling-farmer…` / `halfling-innkeeper…` /
`halfling-messenger-runner…` / `halfling-roadside-chef…`. Sheet 2: `destitute-halfling` /
`magnate-halfling` / `remedy-maker-halfling` / `thief-halfling`.

## LANE F12-E — gnomes (7 identities, 2 sheets, Small 2×2)

All Small — 2×2 sheets; the odd-remainder cell on sheet 2 stays pure chroma (discipline #5).

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-gnomish-alchemist-s-assistant-gnome-mixes-potions-that-mostly-don-t-explode | Small / NPC | the slug sentence is the seed; kit: scorched gloves, rack of stoppered vials, singed notebook. verb: STEADIES-THE-VIAL. |
| spr-fantasy-gnomish-clockmaker-gnome-every-clock-in-town-keeps-slightly-different-time-on-purpose | Small / NPC | the slug sentence is the seed; kit: jeweler's loupe, tiny screwdriver, pocket spilling gears. verb: KEEPS-ITS-OWN-TIME. |
| spr-fantasy-gnomish-tinkerer-clockwork-contraptions-that-mostly-work | Small / NPC | the slug sentence is the seed; kit: half-built contraption under one arm, wrench, sprung parts in every pocket. verb: TINKERS. |
| spr-fantasy-delver-gnome | Small / NPC | tunnel prospector, dust-caked and methodical, candle-lantern helm (glow as faceted material, §9), hand pick, rope coil. verb: DELVES. |
| spr-fantasy-misfit-gnome | Small / NPC | doesn't fit the town's shape and has stopped apologizing for it, defiant oddness, mismatched clothes, one strange beloved keepsake. verb: STAYS-ANYWAY. |
| spr-fantasy-outlaw-gnome | Small / NPC | quietly wanted somewhere else, brim pulled low, travel cloak, unmarked bag, a folded notice kept close. verb: KEEPS-MOVING. |
| spr-fantasy-trader-gnome | Small / NPC | pack-peddler, chatty appraisal, sample case open on a strap, hand-scale, heavy coin belt. verb: DEALS. |

**Sheet plan (F12-E):** Sheet 1 (2×2): `gnomish-alchemist-s-assistant…` / `gnomish-clockmaker…` /
`gnomish-tinkerer…` / `delver-gnome`. Sheet 2 (2×2, one cell pure chroma): `misfit-gnome` /
`outlaw-gnome` / `trader-gnome` / — .

## LANE F12-F — tieflings (7 identities, 4 sheets)

Ancestry visible but never caricature — horns and skin tone are facts of the person, not the
costume. These are townsfolk who happen to be tieflings.

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-tiefling-blacksmith-s-apprentice-still-learning-already-better-than-most-journeymen | Medium / NPC | the slug sentence is the seed; kit: forge tongs, heavy work apron, burn-scarred forearms; horns tied back with a leather cord. verb: OUTWORKS-THEM. |
| spr-fantasy-tiefling-fortune-teller-half-the-town-swears-by-her-half-crosses-the-street | Medium / NPC | the slug sentence is the seed; kit: worn card deck mid-shuffle, folding table drape, coin bowl. verb: READS-THE-CARDS. |
| spr-fantasy-tiefling-fortune-teller-s-rival-tiefling-claims-to-be-the-real-seer-in-town | Medium / NPC | the slug sentence is the seed; kit: crystal sphere in a carry-sling, sheaf of handbills claiming the truth, better coat than the rival's. verb: CLAIMS-THE-GIFT. |
| spr-fantasy-tiefling-street-performer-tiefling-half-the-crowd-is-there-for-the-trick-half-for-the-horror | Medium / NPC | the slug sentence is the seed; kit: cased juggling knives, small stage mat rolled under one arm, collection hat. verb: HOLDS-THE-CROWD. |
| spr-fantasy-tiefling-tavern-owner-tiefling-runs-the-friendliest-bar-in-a-town-that-fears-her-kind | Medium / NPC | the slug sentence is the seed; kit: bar towel over the shoulder, keg keys, chalk price slate. verb: KEEPS-IT-FRIENDLY. |
| spr-fantasy-feeder-tiefling | Medium / NPC | keeps people fed — soup-line cook, tired warmth, oversized ladle, bread basket, stack of mismatched bowls. verb: FEEDS-THE-LINE. |
| spr-fantasy-outsider-tiefling | Medium / NPC | the newcomer the town never quite lets in, guarded politeness, travel pack still packed, a letter of introduction gone soft from handling. verb: WAITS-AT-THE-EDGE. |

**Sheet plan (F12-F):** `tiefling-fortune-teller…`+`tiefling-fortune-teller-s-rival…` (the rivalry
on one sheet — contrast the kits) · `tiefling-blacksmith-s-apprentice…`+`tiefling-street-performer…`
· `tiefling-tavern-owner…`+`feeder-tiefling` · `outsider-tiefling` rides alone.

## LANE F12-G — goliaths (7 identities, 4 sheets)

Big frames doing ordinary work — the scale reads in the kit (a crate carried alone, a stool sized
up), never in cartoon bulk.

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-goliath-bridge-toll-keeper-goliath-collects-the-fee-stops-the-trouble-rarely-needs-to-try-hard | Medium / NPC | the slug sentence is the seed; kit: toll box, tally chalk, a stool built to his scale. verb: COLLECTS-CALMLY. |
| spr-fantasy-goliath-dockworker-goliath-moves-cargo-alone-that-takes-four-other-men | Medium / NPC | the slug sentence is the seed; kit: shoulder-borne crate, cargo hook, worn dock gloves. verb: CARRIES-IT-ALONE. |
| spr-fantasy-goliath-quarry-foreman-the-only-one-strong-enough-to-reset-a-slipped-cart-alone | Medium / NPC | the slug sentence is the seed; kit: long pry bar, foreman's whistle, dust-caked work ledger. verb: RESETS-THE-CART. |
| spr-fantasy-host-goliath | Medium / NPC | feast-hall host, expansive practiced welcome, weight worn as hospitality (girth diegetic, §0), serving platter, guest list, broad embroidered sash. verb: WELCOMES-LARGE. |
| spr-fantasy-pampered-elite-goliath | Medium / NPC | soft-living elite, weight worn as proof of never lifting (girth diegetic, §0), silks too fine for the weather, folding fan, small summoning bell. verb: RINGS-FOR-SOMEONE. |
| spr-fantasy-servant-goliath | Medium / NPC | household servant, careful smallness in an enormous frame, laundry basket, polishing cloth, downcast practiced quiet. verb: MAKES-HIMSELF-SMALL. |
| spr-fantasy-smuggler-goliath | Medium / NPC | moves what shouldn't move, easy deniability, false-bottom crate under one arm, coiled cargo strap, weatherproof dockside coat. verb: MOVES-IT-QUIETLY. |

**Sheet plan (F12-G):** `goliath-bridge-toll-keeper…`+`goliath-dockworker…` ·
`goliath-quarry-foreman…`+`servant-goliath` · `host-goliath`+`pampered-elite-goliath` (the two
diegetic-girth reads on one sheet — hospitality vs indolence) · `smuggler-goliath` rides alone.

## LANE F12-H — dragonborn (5 identities, 3 sheets)

| slug | size / register | seed — verb |
|---|---|---|
| spr-fantasy-dragonborn-ship-s-purser-dragonborn-keeps-the-manifest-honest-mostly | Medium / NPC | the slug sentence is the seed; kit: manifest ledger, ink stamp, strongbox key on a neck chain. verb: KEEPS-IT-HONEST-MOSTLY. |
| spr-fantasy-dragonborn-temple-acolyte-young-dragonborn-devout-earnest-still-memorizing-the-rites | Medium / NPC | the slug sentence is the seed; kit: prayer beads, rite scroll, cold unlit censer — adult register per §0, young means junior not childlike. verb: MEMORIZES-THE-RITES. |
| spr-fantasy-builder-dragonborn | Medium / NPC | mason-carpenter, patient methodical strength, plumb line, wooden mallet, hod of brick set at the feet. verb: BUILDS. |
| spr-fantasy-land-worker-dragonborn | Medium / NPC | field laborer, weather-set calm, scythe shouldered as a tool, seed sack, mud to the knees. verb: WORKS-THE-LAND. |
| spr-fantasy-recluse-dragonborn | Medium / NPC | hermit at the town's edge, wary courtesy, walking staff, bundle of firewood, a single door key on a leather thong. verb: KEEPS-TO-HIMSELF. |

**Sheet plan (F12-H):** `dragonborn-ship-s-purser…`+`dragonborn-temple-acolyte…` ·
`builder-dragonborn`+`land-worker-dragonborn` · `recluse-dragonborn` rides alone.

---

## After the returns

Same pipeline as PACKET-F1 §9 Steps E–L. Consolidate F12 returns into the canonical pilot tree
with per-lane provenance + a Step-E ledger, exactly like F1.
