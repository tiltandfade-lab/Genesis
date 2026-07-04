# BESTIARY-COVERAGE — the model program to close the monster gap

```
type: system-spec
status: SPECCED (manifest locked 2026-07-04; Adam greenlit closing the gap. The NEW-BODY list
§2 is HIS judgment gate — he rules which bodies build before any wave runs. Alias batch §6
(35 safe entries) LANDED same day on feat/bestiary-alias-batch.)
consumer: orchestrator (waves) + Adam (the new-body gate)
```

## §1 The audit (verified against data/bestiary.js + src/ui/theater-figures.js)

510 bestiary entries · 129 covered (51 bespoke bodies + 78 aliases) · **381 uncovered** (cuboid
fallback). The Tier-2 cap (v1 = CR ≤10, character levels 1–10, docs/TIER-SCOPE.md) splits it:

| | count | disposition |
|---|---|---|
| CR ≤10 | **312** | BUILD PRIORITY — rolls in v1 |
| CR 11+ | **69** | DEFERRED — authored-but-inert (T3/T4), do not queue |

Within the 312: **~54 NEW-BODY candidates → 13–16 real bodies after demotions · ~150 variants ·
~108 aliases.** The real spend decision is the new-body count. Doctrine (Adam): one bespoke
body per silhouette family; everything else a variant (recolor / rescale via the size law / one
feature / pose) or a pure alias. Variants are cheap — create liberally.

## §2 NEW BODIES — the judgment gate (Adam rules which build)

Ordered by leverage (CR≤10 creatures each unlocks as its own bespoke + its variant fan).

| # | body | unlocks | silhouette | rec |
|---|---|---|---|---|
| 1 | **mon-stocky-quadruped** (brown-bear) | ~20 | heavy-shouldered four-legger | **BUILD** — latent gap; the doctrine's "bears/apes/boars = variant of a stocky-quadruped" presumes a body that doesn't exist yet. Highest leverage. |
| 2 | **mon-winged-fiend** (vrock) | ~22 | upright demon/devil biped, membrane wings, horns, tail | **BUILD** — the whole lesser demon/devil roster |
| 3 | **mon-winged-beast** (griffon) | ~14 | quadruped/avian + shoulder wings + beak/maw | **BUILD** — griffon/manticore/chimera/peryton |
| 4 | **mon-bird** (eagle) | ~13 | small raptor: wings, beak, tail fan | **BUILD** — CR 0–1 wilderness fodder |
| 5 | **mon-serpent** (spirit-naga) | ~11 | rearing hooded serpent; yuan-ti add human torso | **BUILD** — naga/yuan-ti/salamander |
| 6 | **mon-ghost** (ghost) | ~9 | translucent hovering torso trailing to vapor | **BUILD** — the incorporeal-undead read |
| 7 | **mon-fey-humanoid** (satyr) | ~9 | slight humanoid + one signature (goat legs/wings/antlers) | **BUILD** — satyr/dryad/pixie/sprite |
| 8 | **mon-segmented-crawler** (carrion-crawler) | ~8 | long low multi-segment body, many legs, raised fore | **BUILD** — crawler/grick/ankheg/scorpion |
| 9 | **mon-fungus** (myconid-adult) | ~9 | cap-headed stalk humanoid | **BUILD** — myconids/violet-fungus/shriekers |
| 10 | **mon-amphibian** (giant-frog) | ~7 | squat wide-mouth toad, big hind legs | **BUILD** — frogs/toads/bullywugs |
| 11 | **mon-burrower** (bulette) | ~4 | armored humpbacked digger, plated shell | **BUILD** — bulette/umber-hulk/xorn |
| 12 | **mon-cephalopod** (giant-octopus) | ~5 | bulbous mantle + radiating tentacles | **BUILD** — octopi/squid/grell/otyugh/roper |
| 13 | **mon-shark** (hunter-shark) | ~4 | streamlined finned predator | **BUILD** — the aquatic-combat read; no substitute |
| 14 | **mon-hag** (green-hag) | ~3 | hunched crone, long limbs, hooked nose, shawl | **BUILD (rec)** — iconic, un-substitutable, rolls constantly low-tier |
| 15 | **mon-treant** (treant) | ~3 | huge bipedal tree: trunk, branch arms, canopy | **BUILD** — big un-substitutable read |
| 16 | **mon-mephit** (dust-mephit) | ~5 | tiny winged imp-demon, element-tinted | **BUILD** — already the Adam-flagged mephit rebuild |
| — | mon-centaur | ~2 | horse body + humanoid torso | **DEMOTE → variant** of warhorse (torso graft) |
| — | mon-golem-flesh | ~4 | stitched/hollow hulk | **DEMOTE → variant** of ogre/stone-golem |
| — | mon-medusa | ~2 | snake-hair humanoid | **DEMOTE → variant** of noble + snake-hair |
| — | mon-yeti | ~3 | shaggy white ape-brute | **DEMOTE → variant** of troll (recolor shaggy) |

**Six highest-leverage** (stocky-quadruped, winged-fiend, winged-beast, bird, serpent, ghost)
unlock ~76 CR≤10 creatures — over half the build set. **After the four demotions the real
new-body count is 16** (13 if Adam also cuts the low-count hag/treant/shark to variants — his call).

## §3 Flagged ambiguous calls (recommendation each)

- **roper** → variant of a pillar prop + tentacle graft (fall back to gray-ooze), NOT a body.
- **otyugh** → variant of segmented-crawler. **cloaker** → variant of cephalopod (vs. own manta read).
- **mind-flayer / mind-thief** → variant of humanoid + tentacle-face, UNLESS Adam wants the iconic body.
- **elephant** → variant of stocky-quadruped (trunk read may want own body — his call).
- **xorn** → variant of burrower despite odd radial symmetry.

## §4 Wave plan (CR-weighted, ~8–12 pieces each; lowest-CR/highest-frequency first)

1. **Low-CR beasts & birds** — stocky-quadruped + bird + amphibian → bears/apes/boars/big-cats +
   raptors + frogs. ~11 new pieces, ~40 creatures. **Highest leverage in the program.**
2. **Low-CR fey/fungi/mephits** — fey-humanoid + fungus + mephit. ~10 pieces, ~22 creatures.
3. **Crawlers & burrowers** — segmented-crawler + burrower + cephalopod. ~11 pieces, ~24 creatures.
4. **Winged monsters** — winged-beast + winged-fiend. ~10 pieces, ~36 creatures. Second-highest leverage.
5. **Serpents & ghosts** — serpent + ghost + hag + shark. ~12 pieces, ~30 creatures.
6. **Big bodies** — treant + centaur (if body) + the flagged graft calls. ~6–8 pieces, ~10 creatures.
7. **Variant/alias sweep** — after the 6 body waves land + Adam approves the family sheets, ONE
   executor runs the ~150 variants (recolor/rescale/feature off the now-existing bodies) + the
   remaining wave-gated aliases in a single mechanical pass. No per-creature taste gate.

## §5 Deferred (CR 11+, 69 creatures — authored-but-inert)

Almost all are variants of Wave-1–6 bodies at greater scale/palette, so they cost near-zero when
T3/T4 un-caps. Net genuine FUTURE new bodies: **~2** (beholder — floating sphere + eyestalks;
tarrasque — Gargantuan). Breakdown: 28 adult/ancient dragons (→young-red-dragon palette+size),
11 archdevils/demon lords (→winged-fiend), 6 greater giants (→hill-giant), 7 greater undead
(→existing undead + glow), 3 celestials (→humanoid+wings), 4 genies (→humanoid+element), 6
greater aberrations, ~4 misc capstones (roc/remorhaz/behir/purple-worm → bird/crawler scaled).

## §6 Alias batch — 35 LANDED + 3 waiting

**LANDED** (feat/bestiary-alias-batch, targets verified to exist, 38/38 harness): flameskull→skeleton,
crawling-claw/brain-crawler/crab→giant-spider, drowned-husk/larva→zombie, cat/bog-twisted-giant-rat/
seahorse→giant-rat, mastiff/hell-hound→wolf, giant-hyena→worg, mule/pony/nightmare→warhorse,
mire-creeper/darkmantle→giant-bat, gibbering-mouther/secret-eye/piercer/ochre-jelly/
animated-rug-of-smothering→gray-ooze, basilisk/lizard→giant-lizard, animated-flying-sword→mimic,
invisible-stalker→fire-elemental, water-weird→giant-constrictor-snake, clawed-drowner→ghoul,
tough→bandit, warrior-infantry→guard, vampire-familiar→noble, guilt-stained-vagrant→commoner,
helmed-horror→animated-armor, sphinx-of-wonder→young-red-dragon, awakened-shrub→needle-blight.

**WAITING on unbuilt bodies:** will-o-wisp→ghost (Wave 5), piranha→hunter-shark (Wave 5),
lantern-sage→sprite (Wave 2) — land when each body completes. Each creature that aliases to a NEW
body lands as that wave's body completes.

## §7 Full per-creature classification

The exhaustive CR≤10 classification (every id → bucket → target body → what-changes, grouped by
silhouette family) lives in the manifest analysis record. The variant fans per body are enumerated
there; §2's "unlocks" counts are their totals. When a body wave is authored, its executor pulls
the family's variant list from that record. The load-bearing decisions — which bodies build, the
demotions, the ambiguous calls — are captured in §2–§3 above; those are what Adam gates.
