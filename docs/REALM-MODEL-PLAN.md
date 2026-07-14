---
type: system-spec
project: Genesis
status: PLAN 2026-07-08 — the per-realm bespoke-model build plan + kitbash scheme. Successor to
  VISUAL-ASSET-QUEUE (which ranked the 42 flat alias-targets); this doc re-cuts the same backlog
  BY REALM and BY SILHOUETTE FAMILY so each realm's distinct visual language drives the build, and
  designs the base-parts kitbash that collapses the model count. Read-only analysis; no code touched.
created: 2026-07-08
related:
  - "[[VISUAL-ASSET-QUEUE]]"     # the flat 42-target frequency ranking this re-cuts by realm
  - "[[MODEL-GRAMMAR]]"          # §1 parts / §5 channels — the kitbash substrate already exists
  - "[[REALM-MODELS-P3]]"        # the net-new realm-geometry wave that already shipped ~229 rlm- modules
  - "[[REALM-RENDER-STYLE]]"     # the per-realm color-grade + shape register (the OTHER half of "feels distinct")
  - "[[DESIGN-GUIDE]]"           # §II.0b all art is placeholder; swap-cheap manifest seams
source: dev/model-qa cross-ref of data/realm-bestiary.js (1307 realm creatures) against
  src/ui/theater-figures.js (WHOLE_OBJECT_REGISTRY 384 keys + NEAREST_SUB 393 aliases) +
  dev/model-qa/creatures/ (481 authored modules, incl. 229 rlm- + dev/model-qa/parts.js shared kit)
---

# REALM-MODEL-PLAN — build each realm's look, not one model at a time

> **Process:** every realm below is built through the **[[MODELING-PIPELINE]]** (v2, locked 2026-07-08):
> references-first → reference-informed kitbash → 2 taste-gated rounds → GLB seam → in-engine render.
> The metric is a guardrail, not a target; coherence > distinctness > beauty. noir + theater are DONE
> and validated the process (incl. a caught metric-gamed failure). **frontier is next.**

## §0 The situation (what's already true)

The render pipeline has **zero blanks** — every one of the 1307 realm creatures resolves to a
bespoke whole-object model or a `NEAREST_SUB` stand-in. This is a **fidelity + style-divergence**
backlog, not a holes backlog. Two facts reframe the whole build:

1. **The apex tier is already bespoke.** The `REALM-MODELS-P3` wave shipped **229 `rlm-*` modules**
   (all wired into `WHOLE_OBJECT_REGISTRY`) — overwhelmingly the *named boss / apex / signature*
   creatures of each realm (`rlm-the-queen-of-hearts`, `rlm-chrome-ganger-warlord`,
   `rlm-grendel`, `rlm-the-drowned-doge`, …). Of 1307 realm creatures, **734 resolve exact / 573
   still ride a stand-in.**

2. **The 573 stand-ins are the rank-and-file** — the CR 0.125–7 mooks and elites that were authored
   by *reskinning a core stat frame*. They collapse onto a tiny set of generic fantasy figures:
   `warrior-veteran`, `bandit`, `skeleton`, `shadow`, `wight`, `giant-rat`, `cultist`,
   `giant-lizard`, `ice-mephit`, `stone-golem`. **This is exactly where the style breaks**: a 1940s
   noir hitman, a WWI stormtrooper, and a frontier gunslinger *all currently render as the same
   medieval `warrior-veteran`.* The stand-in is mechanically fine and stylistically wrong.

**So the build is not "42 creatures."** It is: per realm, author the handful of *base silhouettes*
that (a) show up most in that realm's stand-in population AND (b) define what the realm is supposed
to look like — then kitbash the realm's rank-and-file off those bases. Adam's framing verbatim: a
Sherman tank in a war realm earns its own model; WWI/WWII/modern infantry are distinct silhouettes;
noir needs detectives and gangsters, not knights.

## §1 The kitbash substrate ALREADY EXISTS — three levels of it

Adam's key insight ("models share mutable base parts; one tuxedo torso mutates into the brute, the
gangster, the maestro") is not a new system to invent. The whole-object authoring layer already
supports it three ways; the plan is to **formalize level 2 into a per-realm base kit.**

- **Level 0 — `dev/probe-lib.js` primitives** (`V, quad, tube, stack, ring, stitch, capFan`). Every
  one of the 481 modules composes from these. Universal, too low to be "a torso."
- **Level 1 — `dev/model-qa/parts.js` shared kit** (already used by ~20 modules: the NPC family +
  skeleton/wight/zombie). Exports the real kitbash primitives: `humanoidRig()`, `BASE_P` (base
  palette), `buildHead()`, `buildHood()`, `buildTorso(bands)`, `buildArmToGrip()`, `buildDagger()`,
  `buildBase()` (the size-law disc). **This is the tuxedo-torso mechanism, already shipped** — it
  just has one register (generic medieval) and one realm's worth of callers.
- **Level 2 — the copy-and-reskin doctrine** (`var-veteran.js`: *"COPIES humanoid.js: tunic swapped
  to oxblood, hair greyed, scars added, same sword, same stance — twenty years later. Everything
  else identical."*). Loose today (fork a file, swap a palette). **Formalizing this into a per-realm
  `rlm-<realm>-kit.js` that exports the realm's base torso/head/weapon builders is the entire
  leverage play** — variant modules become ~15 lines: `import` the kit, pick a torso, attach a
  head + kit module, swap the palette channel.
- **Level 3 — `MODEL_RECIPES` + channels** (`data/model-recipes.js`, `MODEL-GRAMMAR §5`). The
  data-driven recipe engine *already encodes this philosophy* — "an Ash goblin and a Noir goblin are
  ONE recipe under different light." But the **live render path is whole-object** (theater-figures →
  theater-boot), not the recipe engine, because the recipe/parts path had the floating-part bug
  class that whole-object authoring killed. So: **realize the kitbash in the whole-object builders
  (level 2 formalized), and let the per-realm palette do the channel job by hand-swap.** Do not
  re-litigate the recipe path for this backlog.

**Mechanism recommendation:** for each realm, author one `dev/model-qa/creatures/rlm-<realm>-kit.js`
(exports: 1–3 base torsos, 2–4 heads/headgear, a weapon/kit set, and any realm-wide overlay such as
a "pallid/skeletal" channel). Every rank-and-file variant imports the kit. This turns ~50 stand-ins
per realm into ~10–14 part builders + thin variant files, and it doubles as the future artist's
brief (§II.0b) — the kit IS the realm's model bible.

## §2 Per-realm plans

Each realm below gives: the **distinct-style thesis**, the **base-parts kit** to build, the biggest
**stand-in clusters to retire** (creature count → current stand-in), and the **leverage** (kit parts
→ figures covered). Clusters are the aliased-creature families from the cross-ref; counts are live
creatures sharing that stand-in.

Legend: a cluster line reads `stand-in ×N` = N realm creatures currently rendering as that core model.

---

### noir — HIGHEST divergence-per-model. BUILD FIRST.
**Thesis.** 1940s crime picture. Suited men, hats, cigarettes, sedans, rain-hard shadow. The core
`warrior-veteran`/`bandit` stand-in (a medieval swordsman) is maximally wrong here, and the realm's
stand-in population is *unusually tightly clustered* — a single tuxedo/overcoat torso covers most of
it. Bonus absurdity to fix: the mob's "Armored Motorcade" and "Smuggling Ship" render as
`stone-golem` (a fantasy statue) — noir needs a **vehicle** base, not a golem.

**Base kit (`rlm-noir-kit.js`, ~13 parts).**
- Torsos: **suited-man** (double-breasted, drop-shoulder), **overcoat/trench** overtorso,
  **gown/dame** torso (femme fatale).
- Heads/headgear: **fedora**, **slicked-bare**, **cloche/waved-hair**.
- Kit modules: **pistol-hand**, **tommy-gun**, **cigarette**, **briefcase/ledger**, **blade**.
- Overlay: **pallid channel** (gaunt jaw + grey wash) — reuses one head for the vampire/ghoul apex line.
- Vehicles: **sedan-slab**, **boat-hull**.

**Stand-ins to retire.** `warrior-veteran ×15` (underboss, assassin, torch, hitmen, cigarette girl,
wheelman) · `bandit ×9` (kingpin, don, fixer, corrupt judge, torpedo boss) · `skeleton ×5` (the
undead crime-lord line — suited + pallid overlay) · `shadow ×4` (cold-case revenants) · `cultist ×3`
(house mage / consigliere — suit) · `ghoul ×3` (icebox ghoul — suit + pallid) · `giant-rat ×2`
(wererat crew) · `stone-golem ×2` → **vehicles** · plus singles (ogre shakedown-man, guard coroner,
hobgoblin torch, werewolf, wight).
**Leverage: ~13 parts → ~45 of 50 figures (~3.5×).**

---

### theater — Adam's explicit case. Era-lensed soldiers + war machines. BUILD SECOND.
**Thesis.** War across every era, all wearing the wrong uniform right now: `warrior-veteran` renders
a WWI stormtrooper, a musket-line sergeant, a jungle scout, and a Roman legionary *identically.*
Adam named this exactly. One **soldier torso** + swappable **era-kit** is the whole realm. Plus the
literal war-machine asks: the tank (`gorgon` stand-in), the war-elephant (`mammoth`), the warship
(`roc`), the biplane (`griffon`).

**Base kit (`rlm-theater-kit.js`, ~11 parts).**
- Torso: one **infantry torso** (upright, kitted).
- Era-kits (headgear + coat + primary weapon, swapped as a unit): **trench** (Brodie/Stahlhelm +
  greatcoat + bolt-rifle), **legion** (lorica + scutum + gladius), **musket** (tricorn + coat +
  musket), **longship** (round shield + axe), **jungle** (boonie/camo + carbine), **siege-sapper**
  (mattock + fascine).
- Overlay: **trench-revenant** channel (mud + bone) — the undead-officer line.
- War-machines: **tank-hull**, **warship-slab**, **war-elephant** (or biplane-beast).

**Stand-ins to retire.** `warrior-veteran ×9` (era officers/skirmishers) · `wight ×6` (undying
praetorian/trench-wight officers — trench-revenant overlay) · `orc-warrior ×3` (musket/longship
rank) · `bandit ×2` (sapper/scout) · `stone-golem ×2` (siege colossus, iron cavalry → tank-hull) ·
`wyvern ×2` (ironclad → warship, flying squadron → biplane) · `needle-blight ×2` (gas clouds —
prop-ish) · singles (guard legion-wall, animated-armor siege-tower, owlbear war-elephant, giant-
lizard gorgon-standard, ogre apex).
**Leverage: ~11 parts → ~30 of 34 figures (~2.7×), and it is the highest-*recognition* payoff —
era silhouettes read instantly.**

---

### frontier — gunhands, boothill undead, cattle, the iron horse. BUILD THIRD.
**Thesis.** Spaghetti-western. `bandit`/`warrior-veteran` (medieval) should be **duster-and-revolver
gunhands**; the boothill undead should be **skeletal cowboys**, not generic skeletons; the cattle
stampede renders as `owlbear`; the ghost coach-rider and rail enforcers want an **iron-horse / rail-
golem** (Adam's Sherman-analog for this realm). 56% stand-in — the biggest *urgent* population after
high-seas.

**Base kit (`rlm-frontier-kit.js`, ~13 parts).**
- Torso: **gunhand** (vest + duster + gunbelt).
- Heads: **cowboy-hat**, **bandana-bare**, **bowler/lawman**.
- Kit: **revolver-hand**, **rifle**, **lasso**, **badge/duster-tail**.
- Overlay: **boothill channel** (sun-bleached skeletal + hat) — the undead cowboy line.
- Beast bases: **longhorn/cattle**, **buzzard + scarecrow-effigy**, **rattler-coil**.
- Machine: **iron-horse / rail-golem**.

**Stand-ins to retire.** `bandit ×11` + `warrior-veteran ×11` (the 22-strong gunhand block) ·
`harpy ×5` (buzzards + scarecrows) · `giant-lizard ×5` (doppelgangers/basilisk/rust-golem — mixed;
kit covers the humanoid doppels) · `giant-constrictor-snake ×4` (rattlers) · `skeleton ×4` +
`wight ×3` + `ghoul ×3` (boothill overlay) · `shadow ×3` (gunslinger shades) · `guard ×3` (militia)
· `earth-elemental ×3` (dust-devils — prop-ish) · `owlbear ×2` (longhorn/bull) · `wyvern ×2`
(peryton/buzzard-kin) · singles incl. `warhorse` (headless ruin-rider) + `stone-golem` (gorgon bull
→ could reuse cattle) + `animated-armor` (company iron enforcer → rail-golem).
**Leverage: ~13 parts → ~55 of 68 figures (~4.2×).**

---

### high-seas — LARGEST stand-in count (73). Sailors, sea-priests, the drowned. BUILD FOURTH.
**Thesis.** Age of sail. The pirates literally render as **giant rats** today (`pirate` /
`pirate-captain` aren't in the registry, so they sub to `giant-rat`). `warrior-veteran` should be a
**pikeman/boarder**, `cultist` a **sea-priest**, the ghost crew **drowned skeletons**, the storm
elementals a **waterspout/djinn**. Tight nautical clustering, highest raw volume — best pure-coverage
target.

**Base kit (`rlm-high-seas-kit.js`, ~13 parts).**
- Torsos: **sailor/pirate** (coat + sash), **sea-devil/sahuagin** (finned), **sea-priest robe**.
- Heads: **tricorn**, **bandana-bare**, **fish-maw** (for the sahuagin/deep line).
- Kit: **cutlass**, **flintlock**, **boarding-pike**, **net**.
- Overlay: **drowned channel** (barnacle + waterlogged bone) — the ghost-crew/wight line.
- Sea-beasts/elementals: **shark/crab**, **waterspout/storm-elemental**.

**Stand-ins to retire.** `warrior-veteran ×11` (boarders/bosuns) · `cultist ×10` (sea-priests,
sirens, archmage) · `giant-rat ×6` (the pirates!) · `skeleton ×6` + `wight ×5` + `shadow ×3` +
`ghoul ×3` (drowned overlay) · `earth-elemental ×5` (charybdis/djinn/marid → waterspout) ·
`bandit ×4` (castaways/quartermasters) · `harpy ×4` (sirens/petrels) · `wolf ×3` (sharks/crabs) ·
`ogre ×3` (sea-ogres/sahuagin-baron → sea-devil torso) · singles (zombie deckhand, giant-constrictor
bone-naga, bugbear rigging-assassin, young-red-dragon → white whale reuses a sea-beast).
**Leverage: ~13 parts → ~60 of 73 figures (~4.6×) — the single largest figure count retired.**

---

### chrome — synths, drones, mechs, AI cores. (Partly done — ganger family shipped.)
**Thesis.** Clean hard surfaces / cheap miracles under grime. Already the *best-covered heavy realm*
(31% stand-in) because the `rlm-chrome-ganger-*` family + drone/synth bespokes landed. What remains:
`stone-golem ×7` standing in for **AI-cores / warden-mechs** (fantasy statue → wrong), `giant-rat ×5`
for **splice-swarms/bugs**, `mimic ×4` for **maintenance drones**, `warrior-veteran ×3` for **synths**.

**Base kit (`rlm-chrome-kit.js`, ~8 parts).** **synth-chassis** torso · **drone-body** (hovering) ·
**mech/warden-hull** (the stone-golem retarget) · **splice-bug** body · **AI-core** monolith ·
plus 3 kit/head swaps (visor-head, arc-baton, servitor-arm). Reuses the shipped ganger torso.
**Stand-ins to retire.** `stone-golem ×7` → mech-hull/AI-core · `giant-rat ×5` → splice-bug/swarm ·
`mimic ×4` → drone-body · `harpy ×3` (nurse/custodian synths) · `warrior-veteran ×3` → synth ·
`shadow ×3` (signal-ghosts — glitch channel) · `animated-armor ×2` · singles.
**Leverage: ~8 parts → ~30 of 37 figures (~3.75×).**

---

### cosmic — cultists, star-spawn, ooze, swarms. (Ooze/cultist read OK — mid priority.)
**Thesis.** Lovecraft/weird. Divergence is *partial*: `gray-ooze ×11` (protoplasmic drift-things)
and `cultist ×5` (drowned-court cantors) already read roughly on-genre, so they're low-urgency. The
wrong ones are `warrior-veteran ×6` (star-spawn marauders → should be aberrant, not knights) and the
swarms.
**Base kit (`rlm-cosmic-kit.js`, ~10 parts).** **star-spawn/marauder** torso (wrong-jointed) ·
**deep-cult robe** · **ooze-mass** (upgrade the 11) · **swarm-cloud** (the `giant-bat ×6` byakhee/
nightgaunt fliers) · **tentacle/pallid-mask head** overlay · **static-wisp** (ice-mephit ×4).
**Stand-ins to retire.** `gray-ooze ×11` · `giant-bat ×6` · `warrior-veteran ×6` · `cultist ×5` ·
`ice-mephit ×4` · `skeleton ×4` · `harpy ×3` · `giant-spider ×3` · `wight ×3` · plus singles.
**Leverage: ~10 parts → ~45 of 63 figures (~4.5×), but sequence AFTER the high-divergence realms.**

---

### suburb — 1980s Americana horror. Distinct but scattered (prop-heavy).
**Thesis.** Amblin/E.T.-era grounded-mundane-turned-wrong (LOCKED register). Much of the stand-in
population is **objects, not figures**: `ice-mephit ×6` = bug-zapper/fireworks wisps, `mimic` = arcade
cabinet, `animated-armor ×2` = lawn-order drones, `needle-blight` = perfect-lawn. So the kit is half
**civilian-figure**, half **cursed-object props**.
**Base kit (`rlm-suburb-kit.js`, ~12 parts).** **replaced-neighbor/civilian** torso (cardigan, mask-
overlay for the pod-people) · **latchkey-kid** small torso · **suburban-undead** overlay (mailman/HOA
ghosts, `skeleton ×7`+`wight ×5`) · **suburban-fiend** (`ogre ×5` block-party masters) · object-props:
**appliance**, **toy/doll**, **lawn-ornament**, **arcade-cabinet**, **wisp/spark**.
**Stand-ins to retire.** `skeleton ×7` · `ice-mephit ×6` · `giant-lizard ×5` (skin-wearers) ·
`ogre ×5` · `wight ×5` · `shadow ×4` · `wolf ×3` · `gray-ooze ×3` · `giant-rat ×3` · plus singles.
**Leverage: ~12 parts → ~40 of 59 figures (~3.3×). Coordinate with REALM-RENDER-STYLE's softFade
faded-photo grade — half of "feels like suburb" is the color, not the mesh.**

---

### bright-kingdom — toybox / storybook. (Semi-covered by constructs.)
**Thesis.** Super-saturated candy-over-teeth. Semi-on-genre already: `animated-armor` (nutcracker/
card guards) and `cockatrice` (balloon-animals) read as toys. The wrong ones: `ice-mephit ×7`
(sprites/imps), `stone-golem ×7` (vending-machine/clock colossi → toy-golem, not fantasy statue),
`giant-lizard ×5` (funhouse doubles).
**Base kit (`rlm-bright-kit.js`, ~10 parts).** **wind-up/tin-soldier** torso · **playing-card** flat
body · **plush/ragdoll** body · **toy-golem hull** (the stone-golem retarget) · **fairy/imp** small
· **fairground-prop** (carousel/machine). Reuses shipped clockwork-drone bodies.
**Stand-ins to retire.** `ice-mephit ×7` · `stone-golem ×7` · `harpy ×6` · `giant-lizard ×5` ·
`animated-armor ×4` · `cultist ×4` (witches) · `mimic ×3` · `giant-rat ×3` · `needle-blight ×3` ·
`hill-giant ×3` · `skeleton ×3` · plus singles.
**Leverage: ~10 parts → ~45 of 68 figures (~4.5×). Depends heavily on the chunky/super-sat render
grade to sell "toybox."**

---

### gloom — Gothic horror. HIGH count (79) but LOWEST divergence urgency. Deprioritize.
**Thesis.** The trap of the ranking: gloom has the most stand-ins (66%), but its stand-ins are
`shadow ×15`, `skeleton ×14`, `wight ×11` — and the **core skeleton/wight/shadow already read as
Gothic undead.** A fantasy skeleton is a perfectly good Gothic skeleton. So the *count* is huge but
the *per-figure style gain* is the smallest of any realm. Build the kit for polish/variety, not to
fix a wrongness.
**Base kit (`rlm-gloom-kit.js`, ~6 parts).** **shrouded-revenant** torso · **skeletal** torso (Victorian
dress overlay) · **wraith/drifting-mass** · **hag/witch** · **gothic-fiend** (`ogre ×3` possessions) ·
**candle/wick-wisp**. Mostly *overlays* on existing undead bases.
**Stand-ins to retire.** `shadow ×15` · `skeleton ×14` · `wight ×11` · `giant-lizard ×4` ·
`giant-rat ×4` · `ghoul ×4` · `ogre ×3` · `cultist ×3` · `stone-golem ×3` · plus singles.
**Leverage: ~6 parts → ~40 of 79 figures (~6.6× — the highest ratio), BUT lowest urgency. Do it when
you want variety, not distinctness. The REALM-RENDER-STYLE hardEdge/sickly-green grade carries most
of gloom's "feel" for free.**

---

### lost-world — antiquity + dinosaurs. Mostly bespoke already (18% stand-in).
**Thesis.** Nearly done — the dinos/myth-figures got bespoke `rlm-` builds. Remainder is thin.
**Base kit (~6 parts).** **theropod** base (allosaur/raptor variants, `giant-lizard ×7`) ·
**ceratopsian** (`giant-rat ×2` triceratops) · **mummy** overlay (`wight ×3`) · **cyclops** (`hill-
giant ×2`) · **ape** · **naga**.
**Stand-ins to retire.** `giant-lizard ×7` · `wight ×3` · `giant-rat ×2` · `hill-giant ×2` · singles.
**Leverage: ~6 parts → ~18 of 22 figures (~3×). Low total — a cleanup wave.**

---

### ash — post-apocalypse. SMALLEST remainder (16%). Mostly bespoke.
**Thesis.** Best-covered realm — the mutants/wreck-dwellers already have `rlm-` builds. Trivial tail.
**Base kit (~5 parts).** **mutant-hound** (`wolf ×5`) · **mutant-boar** (`warhorse ×3`) · **irradiated
-undead** overlay (`wight ×3`) · **raider** torso (`warrior-veteran ×2`, reuse a frontier/theater
gunhand) · **cinder-vermin**.
**Stand-ins to retire.** `wolf ×5` · `warhorse ×3` · `wight ×3` · `warrior-veteran ×2` · singles.
**Leverage: ~5 parts → ~16 of 20 figures (~3.2×). A finishing wave.**

---

## §3 Cross-realm build order (coverage-per-model × style-urgency)

Ranked by **(figures retired per kit-part) × (how wrong the current stand-in looks)**, with Adam's
named priorities (noir figure-language, era-soldiers, the tank) front-loaded. Two columns that pull
apart: raw count vs. divergence. The order resolves them toward *distinctness first, volume second.*

| # | Realm | Stand-ins | Kit parts | Figures retired | Style urgency | Why here |
|---|---|---|---|---|---|---|
| 1 | **noir** | 50 | ~13 | ~45 | ★★★★★ | tightest cluster (one tuxedo torso), most-wrong stand-in, vehicles; Adam's named realm |
| 2 | **theater** | 34 | ~11 | ~30 | ★★★★★ | Adam's explicit era-soldier + tank case; highest recognition payoff |
| 3 | **frontier** | 68 | ~13 | ~55 | ★★★★☆ | 22-strong gunhand block + boothill + iron-horse; high count AND wrong |
| 4 | **high-seas** | 73 | ~13 | ~60 | ★★★★☆ | largest raw retirement; pirates literally render as rats |
| 5 | **chrome** | 37 | ~8 | ~30 | ★★★★☆ | AI-cores as statues is wrong; but ganger base already shipped (cheap) |
| 6 | **cosmic** | 63 | ~10 | ~45 | ★★★☆☆ | big count but ooze/cultist already read on-genre |
| 7 | **suburb** | 59 | ~12 | ~40 | ★★★☆☆ | distinct but prop-heavy + scattered; render-grade does half the work |
| 8 | **bright-kingdom** | 68 | ~10 | ~45 | ★★★☆☆ | semi-covered by constructs; leans on the chunky/super-sat grade |
| 9 | **gloom** | 79 | ~6 | ~40 | ★★☆☆☆ | highest count, LOWEST urgency — core undead already reads Gothic |
| 10 | **lost-world** | 22 | ~6 | ~18 | ★★☆☆☆ | mostly bespoke; thin cleanup |
| 11 | **ash** | 20 | ~5 | ~16 | ★☆☆☆☆ | best-covered; finishing wave |

**Sequencing notes.**
- **1–4 are the "make the realms look like themselves" core.** Build noir → theater → frontier →
  high-seas and the four most-visibly-broken realms become bespoke. These four alone retire
  ~190 stand-ins with ~50 kit parts.
- **5 (chrome) is a cheap jump-in** any time — the ganger base is done, so its kit is the smallest.
- **9 (gloom) is the ranking's honesty check:** do not let its 79 count pull it forward. Per the
  disciplines note, a big number that doesn't fix a wrongness is a worse buy than a small one that
  does. Pair it with the render-grade instead.
- **Every realm pairs with `REALM-RENDER-STYLE`.** Half of "feels distinct" is the per-realm
  saturation/tint/shape grade, which is nearly free (per-realm constants, no new geometry). For the
  low-urgency realms (gloom/suburb/bright-kingdom) the grade is the *higher-leverage* half — land it
  first and the mesh backlog shrinks.

## §4 The math — kitbash vs. naive

- **Naive (one model per remaining stand-in):** **573 bespoke builds.**
- **Kitbash (per-realm base kits + thin variant files):** the sum of the §2 kit sizes is
  **~107 base-part/module builds** (noir 13 · theater 11 · frontier 13 · high-seas 13 · chrome 8 ·
  cosmic 10 · suburb 12 · bright-kingdom 10 · gloom 6 · lost-world 6 · ash 5), plus a small residue
  of genuinely un-kitbashable one-offs (~15–25, many of which the `rlm-` apex wave already shipped).
  **Call it ~110–130 builds to retire all 573 stand-ins.**
- **Leverage: roughly 4.5–5× fewer models** (~78% reduction). The variant *files* still exist (each
  creature keeps its own thin module for its palette/kit combo), but the **authored geometry** — the
  expensive part — collapses from 573 to ~120.
- This is *on top of* the 229 `rlm-` apex modules already shipped, so the realm roster's total
  authored-geometry cost lands near **~350 base builds** for the whole 1307-creature realm layer,
  versus **~800+** if every non-core creature got its own from-scratch model.

## §5 Recommended first action

Author **`rlm-noir-kit.js`** (the ~13-part tuxedo/overcoat/gown + hats + kit + pallid overlay +
sedan/boat set) and re-cut noir's ~10 biggest stand-in clusters as thin variants importing it. It is
the highest coverage-per-part, the most-visibly-wrong realm, one of Adam's explicitly named looks,
and it proves the `rlm-<realm>-kit.js` pattern end-to-end (formalizing `dev/model-qa/parts.js` from
"one generic kit" to "one kit per realm register"). Gate it exactly like REALM-MODELS-P3 §3: a kit
lands, its variants land, `check-manifest` + `verify-theater-figures` green, and a render sheet is
read against the noir register before merge. Then theater, frontier, high-seas — and the four
worst-broken realms are bespoke.

## §6 Open calls for Adam

1. **Confirm the order** — distinctness-first (noir/theater/frontier/high-seas) vs. volume-first
   (would put gloom/high-seas/frontier up top). This plan recommends distinctness-first.
2. **Kit granularity** — one `rlm-<realm>-kit.js` per realm (recommended), or a shared cross-realm
   `humanoid-kit` with per-realm register presets (fewer files, less per-realm control)?
3. **gloom** — build its mesh kit now for variety, or park it behind the render-grade and spend the
   time on the wrong-looking realms? (Recommend park.)
4. **Vehicles/props** (noir sedans, theater tanks, chrome AI-cores, suburb appliances) — treat as
   `prop:`-keyed models in the same kit, or a separate machine/prop wave? They break the humanoid
   size-law disc, so they may want their own small addendum.
