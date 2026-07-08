---
type: reference
project: Genesis
status: working reference (2026-07-08) — the exhaustive generic prop/scenery NOUN library the tray
  should be able to stage, the coverage map against what the tables + part-families produce today,
  the gap list, and the table-expansion plan. READ-ONLY scouting artifact — no game code changed.
consumer: table-expansion authoring lane (Engine markdown → recompile) + the prop-model backlog
  (VISUAL-ASSET-QUEUE / REALM-MODELS-P3 / MICRO-PROPS)
created: 2026-07-08
related:
  - "[[reference/TERRAIN-CENSUS-2026-07-07]]"   # the 8-system commercial-terrain survey this taxonomy is calibrated against
  - "[[VISUAL-ASSET-QUEUE]]"                     # the 14 emitted-but-blank prop models + NPC set
  - "[[REALM-MODELS-P3]]"                         # the 32 net-new realm-prop models queued
  - "[[MICRO-PROPS]]"                             # the interactable micro-object wave (specced, unscheduled)
  - "[[DRESSING-WIRING]]"                         # how set-dressing table text reaches the tray
  - "[[TABLETOP-VISION]]"                         # game = a tabletop of miniatures; prop-set = room archetype
---

# PROP-NOUN-LIBRARY — the scene-noun taxonomy, coverage map, and table-expansion plan

**Goal (restated).** Genesis stages physical props on the tray from what the tables roll: feature /
set-dressing / condition text → `THEATER_PROP_KEYWORD_RULES` (src/engine/theater-data.js) →
a *part family* → a bespoke or generic model. Realm props take a shortcut — `data/realm-props.js`
carries an explicit `part` per prop, so they stage directly without keyword matching. The ambition is
a prop vocabulary as broad as a **well-stocked real tabletop terrain collection** (the 8-system
census in `docs/reference/TERRAIN-CENSUS-2026-07-07.md`), so that whatever a scene needs, there is a
generic noun for it. Some props are *unreachable* today because no table rolls the noun.

**Copyright discipline.** Everything below is a **generic, functional object category** — the kind of
piece that appears across many real terrain/scenery kits (market stall, lamppost, barrel,
sarcophagus, shipping container, server rack, jersey barrier). Generic object types are not
copyrightable. No proprietary sculpt, branded product, trademark, or company SKU list is reproduced.
This is a taxonomy of scene nouns, not a clone of any product line.

---

## 0. What existed before this pass (build-on note)

- **`docs/reference/TERRAIN-CENSUS-2026-07-07.md`** — the normative source. Established the
  common-denominator terrain stack (base surface · ground/floor · verticals · circulation · elevation
  · props/dressing · scatter · showpiece · connectors) and the load-bearing doctrine: **prop-set =
  room archetype; ground/edge skin = biome** (interiors are prop-defined, exteriors texture-defined).
  This library reuses that stack as its category spine.
- **`docs/VISUAL-ASSET-QUEUE.md`** — the model backlog. Names the **14 emitted-but-blank prop models**
  (the keyword rules already emit these `part` families but no bespoke model exists, so they stage as
  the plain block): rubble-scatter, basin-block, coffin-slab, chain-drape, cage-frame, gear-cluster,
  vine-tangle, mushroom-cluster, ladder-rungs, furnace-block, tent-canopy, bell-mass, banner-pole,
  tree-bare. Also the 12 already-reachable base props and the NPC humanoid set.
- **`docs/REALM-MODELS-P3.md` / `data/realm-props.js`** — 308 authored realm props across the 11
  realms (17 shared part families + **8 bespoke realm-prop models** built + **32 net-new** queued).
- **`docs/MICRO-PROPS.md`** — a *specced-but-unscheduled* 12-module wave for the interactable-object
  d100 nouns (levers, winch, rope, tools, bucket, sconce, pressure-plate…) that tables already roll
  but no part catches.

This doc is the first single artifact that crosses **the full generic terrain census × the 11
Genesis realms × the core dungeon/urban/wilderness registers** and turns it into a table-side gap
list. It supersedes nothing; it indexes and extends the four above.

---

## 1. What the tables + part-families ALREADY produce (the coverage baseline)

### 1a. The prop part-family vocabulary (26 scenery families)

`THEATER_PROP_KEYWORD_RULES` maps text → one of these `part` families (armor/figure parts like
`helm-crest`, `pauldrons`, `chest-plate`, `robe-skirt`, `shield-slab`, `ember-flecks` are creature
parts, **not** scenery, and are excluded):

| # | part family | typical nouns that reach it | model status |
|---|---|---|---|
| 1 | `crate` | barrel, keg, cask, hogshead, urn, jar, vat, cauldron, cistern-lip, sack, bag, sandbag, crate, box, chest, coffer, trunk, cookpot, kettle, iron pot | **bespoke** |
| 2 | `statue-figure` | statue, idol, monument, colossus, effigy, giant hand/skull/ribcage, colossal ruin, statuary garden | **bespoke** |
| 3 | `table-slab` | table, bench, counter, workbench, trestle, anvil-block, grindstone, plank/board bridge, floorboard, mirror | **bespoke** |
| 4 | `throne-seat` | throne, pillory, stocks | **bespoke** |
| 5 | `chain-drape` | chain, manacle, shackle, portcullis-chain | blank |
| 6 | `cage-frame` | cage, gibbet, birdcage | blank |
| 7 | `pillar-broken` / `pillar-intact` | obelisk, standing stone, menhir, monolith, column, pillar, totem-pole; lantern (small); anchor; bridge anchor-points | **bespoke** |
| 8 | `candelabra` | candelabra, brazier-stand, torch-sconce | **bespoke** |
| 9 | `basin-block` | fountain, cistern, trough, font, magical font, basin, stagnant/fouled/algae pool, still water | blank |
| 10 | `web-mass` | web, webbing, web-canopy, cocoon, egg-sac | **bespoke** |
| 11 | `arch-frame` | archway, arch, portcullis, triumphal/rock arch, iron gate, freestanding door-frame | **bespoke** |
| 12 | `coffin-slab` | sarcophagus, coffin, stone bier | blank |
| 13 | `vine-tangle` | bramble, briar, razorvine, thorny, hanging vines, tangled roots | blank |
| 14 | `mushroom-cluster` | mushroom, fungal bloom, puffball, glowing fungus, fungus colony | blank |
| 15 | `well-shaft` | well, sinkhole, mine shaft, deep drain | **bespoke** |
| 16 | `rubble-scatter` | scree, gravel, loose stone, caltrops, bone-pile, skull-pyramid, grate, drain-cover, refuse-pile, crumbled masonry, debris, midden, bone-wall, skulls/bones/ribcage | blank |
| 17 | `ladder-rungs` | ladder, scaffolding, siege-tower ladder | blank |
| 18 | `furnace-block` | furnace, forge, kiln, glassblower | blank |
| 19 | `gear-cluster` | gears, clockwork, winch drum, eldritch machinery | blank |
| 20 | `tent-canopy` | pavilion, lean-to, hunting blind, tent canopy, silk pavilion | blank |
| 21 | `bell-mass` | bell, gong, alarm bell | blank |
| 22 | `banner-pole` | signpost, notice-board, hitching-post, warning-post, weathervane, sundial, tapestry, curtain, banner, pennant | blank |
| 23 | `shrine-block` | shrine, offering-table, sacrificial-stone, dais, plinth, pedestal, altar, bathtub, cradle, small basin | **bespoke** |
| 24 | `cart` | cart, wagon, carriage, palanquin, sedan-chair, handcart, wheelbarrow, small siege-engine, wrecked ship/airship hulk | **bespoke** |
| 25 | `tree-bare` | gibbet-tree, hollow log, fossilized/petrified tree, deadfall log | blank |
| 26 | *(realm bespoke)* | sentry-turret-mount, conveyor-spur, holo-pillar-ad, blast-shutter-frame, shroud-draped-loom, sin-eater's-bowl-stand, charnel-pit, whispering-curtain-row | **8 bespoke** |

**26 families; ~20 render as recognizable geometry (12 base + 8 realm bespoke), 14 are still the
plain block** (the VISUAL-ASSET-QUEUE fidelity backlog — a *model* gap, not a table gap).

### 1b. What the core tables roll (the fantasy-default register)

The dungeon/urban/wilderness Set-Dressing, Feature, and Interactable-Object d100 tables
(`Engine/03. _Tables/03. Session Mechanics/Dungeons/*.md`) are richly stocked in the **fantasy-dungeon
/ medieval-town / temperate-wilderness** register. Verified nouns already rolled and matched:
crates · sacks · shelves · barrels · urns · kegs · plank bridges · rope coils · torch bundles · oil
flasks · lanterns · buckets · spikes/pitons · stone-slab lids · fallen beams · rubble slopes · arches
· pillars · benches · sconces · braziers · candles · chain curtains · iron ring-bolts · grates ·
vents · drains · valve wheels · winch drums · statues · sarcophagi · altars · wells · fountains ·
mushrooms · vines · webs · carts · dead trees · signposts · banners · tents.

### 1c. Realm-register coverage (via `data/realm-props.js`, direct part-mapping)

308 authored props, part distribution: pillar-broken 43 · rubble-scatter 33 · candelabra 26 ·
arch-frame 25 · cart 17 · table-slab 16 · web-mass 15 · crate 15 · basin-block 13 · coffin-slab 12 ·
shrine-block 10 · chain-drape 10 · cage-frame 10 · statue-figure 9 · gear-cluster 9 · throne-seat 8 ·
well-shaft 6. Every realm has a starter furniture/cover vocabulary; the **32 net-new** entries are the
register-defining showpieces (windmill frame, wrecked cruiser, bus skeleton, collapsed overpass,
stasis pod, orrery engine, gutted tank, ziggurat terrace, fossil-rib colonnade, amber resin block…).

**Coverage legend used below**
- **✓ COVERED** — a table (or a realm-prop entry) rolls the noun *and* a part family catches it (reachable end-to-end; model may still be blank-block per §1a).
- **◐ TABLE-GAP (part exists)** — a part family would render it, but **no table rolls the noun**. Cheap: pure table-row expansion, no new model.
- **○ MODEL+TABLE GAP** — **no part family exists**. Needs a new model *and* a table row.
- **✕ ATMOSPHERE (not a prop)** — intentionally geometry-less per MODEL-GRAMMAR (mist, smell, sound, temperature, stains, light-only) — tint/FX, never a tray object. Listed for completeness so nobody "fills" it.

---

## 2. THE EXHAUSTIVE GENERIC SCENE-NOUN LIBRARY

Organized by the census terrain-stack categories, crossed with register. A noun's tag is its *best*
coverage across any register (a noun covered in one realm via realm-props but absent from core tables
is noted). Register keys: **DUN** dungeon · **URB** urban/settlement · **WLD** wilderness · plus the
11 realms (FRO frontier · SEA high-seas · GLM gloom · BRK bright-kingdom · COS cosmic · SUB suburb ·
NOI noir · CHR chrome · THR theater · LST lost-world · ASH ash).

### A. Containers & storage
| noun | coverage | note |
|---|---|---|
| barrel · keg · cask · hogshead | ✓ | crate(round) |
| crate · box · packing-crate | ✓ | crate |
| sack · grain-bag · sandbag | ✓ | crate(soft) |
| chest · coffer · strongbox · trunk | ✓ | crate(0.7) |
| urn · amphora · clay jar · pot | ✓ | crate(round) |
| cauldron · vat · cistern-vessel | ✓ | crate(round) |
| **barrel rack / wine rack** | ◐ | tables never roll the *rack* as a unit; crate cluster |
| **crate pallet / cargo pallet** | ◐ | plank rule catches "pallet bridge" only |
| **shipping container** | ○ | chrome/ash/suburb want it; no part (cart at scale is the stand-in) |
| **footlocker / munitions box** | ✓ | crate — but no modern/military table rolls it |
| **wardrobe / cabinet / cupboard** | ○ | no furniture-cabinet part; TerrainCrate-core noun, missing |
| **bookshelf / shelving / stacks** | ○ | "collapsed shelf" rolls but hits no rule → generic; a study/library staple |
| **weapon rack / armor stand** | ○ | no part; barracks/forge staple |

### B. Furniture (interior-identity, the census's #1 scene-identity carrier)
| noun | coverage | note |
|---|---|---|
| table · trestle · workbench · counter | ✓ | table-slab |
| bench · pew · settle | ✓ | table-slab |
| throne · high seat | ✓ | throne-seat |
| altar · offering table · dais · plinth · pedestal | ✓ | shrine-block |
| anvil · grindstone | ✓ | table-slab |
| **chair · stool · seat** | ○ | *the* most common terrain-dressing prop; no chair part (only throne) |
| **bed · cot · bunk · bedroll** | ○ | no bed part; bedroom/barracks/inn staple |
| **desk · writing-table · lectern** | ◐ | table-slab could carry it; no table rolls "desk/lectern" |
| **cabinet · wardrobe · dresser · chest-of-drawers** | ○ | no part |
| **bookshelf · scroll-rack · pigeonhole shelf** | ○ | no part |
| **fireplace · hearth · chimney-breast** | ◐ | furnace-block is the honest nearest; no table rolls "hearth" |
| **bar / bartop** | ✓ | table-slab (frontier "Long Bar") — but only frontier rolls it |
| **wine rack · barrel-stack furniture** | ◐ | crate cluster |
| **loom · spinning wheel · potter's wheel** | ◐/○ | gloom has bespoke shroud-loom; generic loom has no part |
| **orrery · scrying pool · lab bench** | ◐ | cosmic bespoke orrery-engine; scrying-pool → basin-block |

### C. Lighting & fire
| noun | coverage | note |
|---|---|---|
| candelabra · brazier · torch-sconce | ✓ | candelabra |
| candle · candle-stub · taper | ◐ | tables roll "candle stubs" but no rule → generic; micro-prop |
| lantern (hung / hand) | ✓ | pillar-broken(0.25) |
| **wall sconce / cresset** (as object) | ◐ | candelabra catches "torch-sconce"; bare "sconce brackets" falls through |
| **chandelier (hanging)** | ○ | no hanging-light part; hall/cathedral staple |
| **lamppost / street lamp / gas lamp** | ○ | census urban-core noun; no part (pillar stand-in); suburb/noir/chrome all want it |
| **oil lamp / lamp on stand** | ◐ | pillar(0.25) if "lantern"; else generic |
| **fire pit / campfire ring / bonfire** | ◐ | no fire part; furnace-block or rubble-ring stand-in |
| **forge / furnace / kiln / smelter** | ✓ | furnace-block (blank model) |
| **street brazier / burn barrel** | ◐ | candelabra / crate |
| bioluminescence / torch glow (light only) | ✕ | atmosphere — light, not geometry |

### D. Monuments, statuary, standing stones
| noun | coverage | note |
|---|---|---|
| statue · idol · effigy · colossus | ✓ | statue-figure |
| obelisk · monolith · menhir · standing stone · totem-pole | ✓ | pillar |
| monument · memorial stone · war memorial | ✓ | statue-figure |
| statuary garden · giant hand/skull/ribcage · colossal ruin | ✓ | statue-figure(1.8) |
| **fountain-statue / plaza centerpiece** | ✓ | basin-block + statue |
| **gravestone · headstone · grave marker** | ◐ | pillar(small) stand-in; no cemetery table rolls it in core (gloom realm-props do) |
| **wayshrine / roadside cross / cairn** | ✓ | shrine-block / rubble |
| **war totem / claw-scored totem** | ◐ | lost-world net-new totem queued |

### E. Verticals & architecture fragments (freestanding — walls proper are map geometry)
| noun | coverage | note |
|---|---|---|
| pillar · column · support-post (intact/broken) | ✓ | pillar |
| archway · arch · triumphal arch | ✓ | arch-frame |
| portcullis · iron gate | ✓ | arch-frame |
| freestanding door-frame · doorway | ✓ | arch-frame |
| **operable door (as object) · door leaf** | ◐ | census treats the door as a *mechanism* SKU everywhere; Genesis has no door part, arch stands in |
| **bone-wall / skull-mortared wall** | ✓ | rubble-scatter(bone) |
| **rubble wall / dry-stone wall / low wall** | ◐ | rubble-scatter; no table rolls a freestanding low wall |
| **fence · picket · palisade · railing · balustrade** | ○ | census battlefield/village staple; no part; frontier/suburb/lost-world all want it |
| **gate (garden/farm) · turnstile · toll bar** | ◐ | arch-frame / banner-pole |
| **buttress / broken vault-rib** | ◐ | pillar / arch |
| **watchtower / guard post / sentry box** | ○ | no small-structure part; frontier/noir/urban staple (chrome has sentry-turret) |
| **market stall / vendor booth / awning stall** | ○ | *the* urban-market showpiece; no part (tent-canopy nearest); URB/FRO/BRK/SUB want it |

### F. Circulation & elevation
| noun | coverage | note |
|---|---|---|
| ladder · scaffolding | ✓ | ladder-rungs (blank) |
| bridge (rope/stone/collapsed span) | ✓ | pillar anchor-points (visual half) |
| plank / board over a gap | ✓ | table-slab |
| **stairs / steps / stone stair** | ◐ | census: always its own SKU; Genesis has no stair part (ziggurat-terrace net-new is nearest) |
| **catwalk / gantry / walkway** | ○ | chrome/cosmic/sea staple; no part |
| **ramp / gangplank / boarding ramp** | ◐ | table-slab / plank; sea/chrome want it |
| **platform / dais riser / raised tier** | ◐ | shrine-block / lost-world ziggurat-terrace |
| **rope bridge / vine bridge / suspension span** | ✓ | pillar anchors |
| hill / rise / berm (elevation) | ✕/◐ | terrain_change map-flag, not a prop; scatter rock stands on it |

### G. Natural scatter & vegetation
| noun | coverage | note |
|---|---|---|
| rock · boulder · scree · gravel · loose stone | ✓ | rubble-scatter |
| dead tree · bare tree · deadfall log · hollow log | ✓ | tree-bare (blank) |
| petrified / fossilized tree | ✓ | tree-bare(crystal) |
| bramble · briar · thorns · razorvine · hanging vines · tangled roots | ✓ | vine-tangle (blank) |
| mushroom · fungal bloom · puffball · glowing fungus | ✓ | mushroom-cluster (blank) |
| web · webbing · cocoon · egg-sac | ✓ | web-mass |
| **living / leafy tree · sapling · shrub · bush** | ○ | tree-bare is *bare* only; no foliage tree; WLD/BRK/LST/SUB all want a green tree |
| **stump · fallen trunk (as seat/cover)** | ◐ | tree-bare fragment; monster-scenery core noun |
| **reeds · tall grass · cattails · fern clump** | ○ | no part; wilderness/swamp/lost-world scatter |
| **crystal cluster · geode · gem spire** | ○ | cavern/cosmic staple; no part (cosmic floating-shard net-new nearest) |
| **coral / kelp / sea-fan** | ○ | high-seas underwater; no part |
| **cactus · agave · desert brush · tumbleweed** | ◐/○ | frontier tumbleweed net-new queued; cactus has no part |
| **ice formation · icicle column · snowbank** | ○ | no part; ice-cavern/ash-winter register |
| **lily pad · bog tussock · mangrove root** | ◐ | vine-tangle nearest |
| **anthill / termite mound / hive** | ◐ | rubble / mushroom nearest |
| **flower bed · hedge · topiary · planter** | ○ | suburb/bright-kingdom garden staple; no part |

### H. Rubble, debris, decay
| noun | coverage | note |
|---|---|---|
| rubble · debris · crumbled masonry · refuse pile · midden | ✓ | rubble-scatter |
| bone pile · skull pyramid · calcified bones · skulls · ribcage | ✓ | rubble-scatter(bone) |
| **wreckage field (ship/vehicle/machine)** | ◐ | cart(scale) for the hull; a separate debris scatter uses rubble |
| **ash drift / soot bank / burn scar** | ◐ | ash realm ashfall-drift net-new; core has no ash prop |
| **scrap heap / junk pile / salvage mound** | ✓ | rubble-scatter — but no chrome/ash table rolls "scrap heap" |
| **collapsed masonry column / toppled statue** | ✓ | pillar(broken) / statue(broken) |
| corpse pile / charnel remains | ◐/✓ | gloom charnel-pit bespoke; core → rubble(bone) |

### I. Water features
| noun | coverage | note |
|---|---|---|
| fountain · cistern · font · basin · trough | ✓ | basin-block |
| stagnant / fouled / algae pool · still water | ✓ | basin-block |
| well · deep shaft · sinkhole · mine shaft | ✓ | well-shaft |
| scrying pool · reflecting pool | ✓ | basin-block |
| **water trough (livestock)** | ✓ | basin-block (frontier) |
| **aqueduct channel / sluice / mill race** | ◐ | basin-block / drain-rubble |
| **water tank / cistern tower / rain barrel** | ✓ | crate / basin |
| puddle / seep / drip (surface only) | ✕ | atmosphere — wet-tint, not a prop |
| **dock piling / mooring post / bollard** | ◐ | pillar(small); high-seas/noir waterfront |
| **rowboat / dinghy / coracle (grounded)** | ○ | no boat part; cart is the stand-in; SEA/WLD/LST want it |

### J. Signage, hanging & soft goods
| noun | coverage | note |
|---|---|---|
| signpost · notice-board · warning-post · hitching-post | ✓ | banner-pole |
| banner · pennant · standard | ✓ | banner-pole |
| tapestry · curtain · beaded curtain · hanging hides | ✓ | banner-pole(drape) |
| weathervane · sundial | ✓ | banner-pole |
| chain · manacle · shackle | ✓ | chain-drape |
| cage · gibbet · birdcage | ✓ | cage-frame |
| **flag on pole / windsock** | ✓ | banner-pole |
| **rug · mat · carpet (floor)** | ◐ | table-slab(flat) nearest; micro-prop hanging-softs |
| **net · fishing net · hanging net** | ◐ | web-mass nearest; SEA staple, no table rolls it |
| **washing line / drying rack / clothesline** | ◐ | banner-pole(drape) |
| **awning / market canopy / shade sail** | ◐ | tent-canopy |
| **street sign / shop sign / hanging shingle** | ✓ | banner-pole — no urban table rolls a *shop sign* specifically |
| **billboard / poster board / hoarding** | ○/◐ | chrome holo-pillar-ad bespoke; static billboard has no part |

### K. Traps, mechanisms & interactables (MICRO-PROPS territory)
| noun | coverage | note |
|---|---|---|
| gears · clockwork · winch drum · eldritch machinery | ✓ | gear-cluster (blank) |
| grate · drain-cover · sewer-grate | ✓ | rubble-scatter(flat) |
| bell · gong · alarm bell | ✓ | bell-mass (blank) |
| valve wheel · pull-chain (as chain) | ◐ | chain-drape for chains; valve → **no rule** |
| **lever · crank · pull-bar** | ◐ | MICRO-PROPS lever-set; no rule/part today |
| **winch / pulley / counterweight** | ✓/◐ | gear-cluster catches "winch drum"; bare pulley falls through |
| **rope coil · rope ladder · grappling hook** | ◐ | tables roll "coil of rope"; **no rule** → generic (MICRO-PROPS rope-kit) |
| **bucket · trough · basin (small)** | ◐ | basin catches "basin"; bare "bucket" → **no rule** (MICRO-PROPS) |
| **tools: hammer, wedge, shovel, pick, spikes/pitons** | ◐ | rolled constantly, **no rule** → generic (MICRO-PROPS tool-set) |
| **pressure plate · turning tile · carved dial** | ◐ | MICRO-PROPS pressure-plate; floor-flush, no part |
| **trapdoor ring · hinged grate · vent cover** | ◐ | MICRO-PROPS trapdoor-ring |
| **door hardware: bar, wedge, bolt, hinge-pin, chain-lock** | ◐ | MICRO-PROPS door-hardware |
| **tripwire · bell-on-string · snare** | ◐ | MICRO-PROPS bell-line; thin-geometry risk |
| **cistern lid · pipe spout · small sluice-gate** | ◐ | MICRO-PROPS cistern-lid |

### L. Vehicles & conveyances
| noun | coverage | note |
|---|---|---|
| cart · wagon · carriage · handcart · wheelbarrow | ✓ | cart |
| palanquin · sedan chair | ✓ | cart |
| small siege engine · wrecked ship/airship hulk | ✓ | cart(scale) |
| **buckboard / stagecoach / chuckwagon** | ✓ | cart (frontier) |
| **rowboat / dinghy / raft / longboat (grounded)** | ○ | no boat part; SEA/LST/WLD |
| **automobile / truck / bus (wreck or parked)** | ○ | suburb/noir/chrome/ash; ash bus-skeleton + cruiser net-new queued; no generic car part |
| **motorcycle / bicycle / rickshaw** | ○ | no part |
| **spacecraft pod / drop-ship / drone** | ○ | cosmic/chrome; stasis-pod net-new nearest |
| **train car / minecart / tram** | ◐ | cart(scale); LST/chrome |
| **tank / armored hull / artillery piece** | ◐ | ash gutted-tank + field-artillery net-new queued |

### M. Small structures & set-pieces (the census "showpiece" tier)
| noun | coverage | note |
|---|---|---|
| shrine · wayshrine · sacrificial stone | ✓ | shrine-block |
| tent · pavilion · lean-to · hunting blind | ✓ | tent-canopy (blank) |
| **hut / shack / shed / outhouse** | ○ | no small-building part; frontier/wilderness/ash |
| **market stall / vendor booth** | ○ | see §E; urban showpiece, no part |
| **well-house / windmill / watermill** | ◐ | frontier windmill-frame net-new; watermill none |
| **guard post / watchtower / palisade gate** | ○ | see §E |
| **gallows / gibbet-tree / pillory** | ✓ | throne-seat(pillory) / tree-bare / cage |
| **forge-shed / smithy / kiln-house** | ✓ | furnace-block |
| **campsite / base camp tent / bedroll ring** | ◐ | lost-world base-camp-tent net-new; tent-canopy |
| **dais / stage / platform (theater)** | ◐ | shrine-block / table-slab |
| **cocoon nest / bramble nest / clutch egg** | ◐ | lost-world nest + clutch-egg net-new; web-mass |

### N. Register-defining nouns per realm (via realm-props + the net-new queue)

Each realm's identity nouns. **✓** = a realm-prop entry exists; **net-new** = queued model;
**○** = suggested addition this pass flags as missing.

- **FRO frontier** — long bar ✓ · hitching rail ✓ · water trough ✓ · buckboard ✓ · tumbleweed (net-new) · windmill frame (net-new) · prospector's sluice (net-new) · **○ saloon batwing doors · corral fence · water tower · gallows platform · wanted-poster board**
- **SEA high-seas** — (cover via web/crate/cart/pillar) · **○ rowboat · ship's wheel · cannon · capstan · mooring bollard · fishing net · crate cargo stack · barrel raft · gangplank · crow's-nest mast**
- **GLM gloom** — shroud-draped loom (bespoke) · sin-eater's bowl stand (bespoke) · charnel pit (bespoke) · whispering curtain row (bespoke) · coffin-slab props ✓ · **○ gravestone · iron cemetery fence · funeral bier · candle-forest · hanging cocoons**
- **BRK bright-kingdom** — arch/throne/statue props ✓ · **○ tournament pavilion · heraldic banner rank · topiary/hedge · flower planter · fountain-statue · reliquary altar · market stall**
- **COS cosmic** — floating shard (net-new) · impossible stair (net-new) · stasis pod (net-new) · orrery engine (net-new) · **○ console bank · antenna array · crystal spire · portal ring · gravity plate**
- **SUB suburb** — (modern default) · **○ lamppost · mailbox · fire hydrant · park bench · picket fence · dumpster · bus stop shelter · playground frame · parked sedan · vending machine · trash can · utility pole**
- **NOI noir** — **○ street lamp (gas) · newspaper stand · phone booth · trash-can fire · fire-escape ladder · parked coupe · barber pole · diner counter · brick alley dumpster**
- **CHR chrome** — sentry-turret mount (bespoke) · conveyor spur (bespoke) · holo-pillar ad (bespoke) · blast-shutter frame (bespoke) · **○ server rack · neon sign · vending kiosk · cable conduit bundle · jersey barrier · surveillance drone dock · dumpster (rusted)**
- **THR theater / surreal** — (arch/curtain/statue props) · **○ proscenium arch · stage flat/backdrop · trap-door stage · giant prop object (oversized chair/mask) · footlight row · rigging/fly-line**
- **LST lost-world / prehistoric** — ziggurat terrace (net-new) · fossil rib colonnade (net-new) · wyrmling clutch egg (net-new) · amber resin block (net-new) · calcified lava vent (net-new) · claw-scored totem (net-new) · bramble nest (net-new) · base-camp tent (net-new) · **○ tar pit · bone midden · jungle liana curtain · standing megalith circle**
- **ASH ash / post-apoc** — wrecked cruiser (net-new) · bus skeleton (net-new) · collapsed overpass (net-new) · melted playground (net-new) · ashfall drift (net-new) · **○ jersey barrier · burn barrel · rebar tangle · gutted vending machine · sandbag emplacement · collapsed billboard · shopping-cart husk**

### O. Intentional non-props (do NOT try to model — flagged so nobody "fills the gap")
Mist · fog · smoke · steam · smell/stench · sound/echo · temperature · wind · ground stain · blood
smear · scorch mark · water sheen · darkness/shadow-play · magical glow · weather (rain/snow/ashfall
as *effect*) · whole-room architecture · maze/labyrinth layout · biome ground texture. These are
tint/FX/map-flags per MODEL-GRAMMAR §class-(d)/(e); a keyword rule for any of them would be a spec
violation.

---

## 3. GAP ANALYSIS — the table-expansion targets

Filtering the library to nouns **not currently rolled by any table** (the ◐ and ○ rows), sorted by
how much scene-breadth they unlock.

### 3a. ◐ TABLE-GAPS — a part already exists, only a table row (and sometimes a keyword rule) is missing
*Cheapest wins: pure markdown authoring, no new model.*

1. **The MICRO-PROPS interactable cluster** — lever, crank, valve wheel, rope coil, bucket, tool sets
   (hammer/wedge/shovel/pick/spikes), pulley, pressure-plate, trapdoor-ring, door hardware, tripwire,
   cistern-lid. Tables **already roll many of these** (dungeon/urban/wilderness Interactable-Object
   d100s), but no keyword rule catches them → generic block. **This is the single biggest reachability
   gap**: the nouns exist in the tables, the parts are specced (MICRO-PROPS 12 modules), only the
   keyword rules + models are unbuilt.
2. **Furniture the census calls core but Genesis under-rolls** — chair/stool (route to a new small
   seat part or throne-seat at scale), desk/lectern (table-slab), fireplace/hearth (furnace-block),
   bed/cot (needs a part — see 3b), cabinet/bookshelf (needs a part — 3b).
3. **Cemetery/funeral nouns** — gravestone, headstone, grave marker, bier, cairn → pillar/shrine/rubble
   already render them; core tables don't roll them outside the gloom realm.
4. **Waterfront nouns** — mooring post/bollard, dock piling, aqueduct/sluice → pillar/basin already fit.
5. **Scrap/ash debris** — scrap heap, junk pile, salvage mound, burn scar → rubble-scatter fits; no
   chrome/ash/suburb table rolls them.
6. **Soft goods** — rug/mat, net, clothesline, awning, shop sign → banner-pole/tent-canopy/web-mass fit.
7. **Elevation** — ramp, platform, catwalk-as-plank, stump-seat → table-slab/shrine-block/tree-bare fit.

### 3b. ○ MODEL+TABLE GAPS — no part family exists (needs a new model *and* a table row)
*Ranked by cross-register frequency — how many registers want it.*

| new prop model | wanted by | census pedigree |
|---|---|---|
| **chair / stool / seat** | every interior register | the #1 dressing prop in every kit; Genesis only has thrones |
| **bed / cot / bunk / bedroll** | DUN, URB, FRO, SUB, NOI, all inns/barracks | TerrainCrate-core |
| **fence / railing / palisade / picket / balustrade** | WLD, FRO, SUB, BRK, LST, ASH | battlefield/village staple |
| **market stall / vendor booth / awning stall** | URB, FRO, BRK, SUB | urban showpiece |
| **cabinet / wardrobe / dresser / bookshelf / shelving** | DUN, URB, study/library/shop | study/library staple |
| **lamppost / street lamp / gas lamp** | URB, SUB, NOI, CHR | urban-core noun |
| **living / leafy tree · bush · shrub · hedge** | WLD, BRK, SUB, LST | tree-bare is bare-only |
| **small structure: hut / shack / shed / guard post / watchtower / sentry box** | WLD, FRO, URB, NOI | showpiece tier |
| **generic wheeled vehicle: car / truck / bus / wagon-modern** | SUB, NOI, CHR, ASH | ash net-news cover only wrecks |
| **boat / rowboat / dinghy / raft** | SEA, WLD, LST | no watercraft part at all |
| **crystal cluster / geode / gem spire** | cavern-DUN, COS, ice | cavern staple |
| **reeds / tall grass / fern / cattails / cactus** | WLD, LST, swamp, desert | vegetation scatter |
| **fire pit / campfire / brazier-fire / burn barrel** | WLD, FRO, ASH, camps | fire as object |
| **chandelier / hanging light** | halls, cathedrals, BRK | no hanging-light |
| **stairs / steps (freestanding)** | DUN, URB, all | census: always its own SKU |
| **jersey barrier / concrete barrier / sandbag emplacement** | CHR, ASH, NOI | modern-military terrain |
| **server rack / console bank / machine cabinet** | CHR, COS | sci-fi facility |
| **coral / kelp / sea scatter** | SEA underwater | — |
| **ice formation / icicle / snowbank** | ice-cavern, ASH-winter | — |
| **billboard / hoarding / poster board (static)** | URB, NOI, CHR, ASH | chrome holo-ad is animated-only |

### 3c. The biggest gaps in one line each
1. **Interactables are rolled but unreachable** (MICRO-PROPS unbuilt) — highest-leverage, nouns already in the tables.
2. **No chair, no bed, no fence, no shelf, no market stall** — the five most common real-terrain dressing pieces, all absent as parts.
3. **The modern/sci-fi registers (SUB/NOI/CHR/ASH) are showpiece-only** — bespoke net-news exist but the everyday street furniture (lamppost, hydrant, dumpster, bench, barrier, server rack) has no generic noun.
4. **No living tree / green vegetation** — tree-bare is bare-only; wilderness and garden registers can't stage a leafy tree, bush, hedge, reeds, or cactus.
5. **No watercraft** — high-seas and river wilderness can't stage a boat except as a cart stand-in.

---

## 4. TABLE-EXPANSION PLAN

**Discipline:** edit the **Engine markdown source** tables, then recompile
(`python3 "Engine/00. _System/compile-tables.py" --emit`) and re-run `python3 build/check-manifest.py`.
`tables.json` / `tables.js` are **generated — never hand-edit**. `data/realm-props.js` is generated
from `dev/model-qa/realm-props.json` — edit the JSON, re-run `python3 build/gen-realm-props.py`.
Prop *models* are a separate lane (VISUAL-ASSET-QUEUE / REALM-MODELS-P3 / MICRO-PROPS) — a table row
that names a noun with a not-yet-built part **still stages** (falls back to the generic block), so the
table expansion can land *ahead of* the models with no hole.

### Wave 1 — Reachability first (no new models; pure rules + existing parts). **Biggest bang.**
Land the **MICRO-PROPS keyword rules** so the interactable nouns the tables *already roll* stop
resolving to the generic block. Add ~12 `THEATER_PROP_KEYWORD_RULES` entries mapping lever/crank/
valve/rope/bucket/tools/pulley/pressure-plate/trapdoor/door-hardware/tripwire/cistern-lid onto the
nearest existing parts (or the MICRO-PROPS modules as they build). *No table edits needed — the rows
exist.* This is the highest-value, lowest-cost move: it makes the current corpus render what it
already says. (Rules-only change to a hand-authored engine module — not a generated file.)

### Wave 2 — Fill the core registers with the ◐ nouns (existing parts, +rows).
Add rows to the **core Set-Dressing + Feature tables** for nouns that a part already renders but no
table rolls:
- **Dungeon Set Dressing / Dungeon Feature** (+~8 rows): desk/lectern, bookshelf(collapsed — route to a
  shelf part when built, table-slab meanwhile), fireplace/hearth, bier, cairn, rug/mat, iron cage,
  scrap heap.
- **Urban Set Dressing / Urban Feature** (+~10 rows): mooring post/bollard, dock piling, shop sign,
  hanging shingle, awning, clothesline, aqueduct/sluice, gravestone/headstone, planter, hitching post.
- **Wilderness Set Dressing / Wilderness Feature** (+~8 rows): stump-seat, fallen trunk, cairn, fire pit,
  reed clump(→ vine-tangle meanwhile), dead-tree deadfall, boulder cluster, mooring/ford post.
Each is one prose row in the register's existing d100; ~26 rows total, all rendering on day one.

### Wave 3 — Realm register breadth (edit `realm-props.json`, +entries, mostly existing parts).
For each of the 11 realms, add the **○ everyday-furniture nouns** flagged in §2N onto existing parts
(fence→pillar-cluster, lamppost→pillar, stall→tent-canopy, bench→table-slab, planter→basin, barrier→
crate, server-rack→crate/gear) — ~5–8 per realm, ~70 entries. Prioritize the **modern registers
(SUB/NOI/CHR/ASH)**, which are currently showpiece-only: they need the everyday street furniture most.
These stage immediately via existing parts and upgrade to bespoke models later.

### Wave 4 — New-model queue additions (the ○ MODEL+TABLE gaps → REALM-MODELS-P3 / a new prop wave).
Queue the §3b parts, top-down by cross-register frequency. First five unlock the most scenes:
**chair · bed · fence/railing · market stall · shelf/cabinet.** Then living-tree/foliage, small
structures (hut/guard post), generic vehicle, boat, crystal cluster, fire pit, chandelier, and the
modern-terrain set (lamppost, jersey barrier, server rack, billboard). Each new part gets: a model
module (dev/model-qa) + a `theater-figures.js` registry entry + `THEATER_PROP_KEYWORD_RULES` rows +
table rows (Waves 2–3 rows re-pointed off their stand-in part). This is the long tail; none blocks
Waves 1–3.

### Sequencing rationale
Waves 1–2 need **zero new models** — they make the *existing* corpus render more of what it already
rolls, and add cheap rows on existing parts. Wave 3 broadens the realms on existing parts. Wave 4 is
the model-build backlog, already tracked in VISUAL-ASSET-QUEUE / REALM-MODELS-P3 / MICRO-PROPS — this
doc's contribution is the **prioritized ○-list in §3b** and the confirmation that every table row can
land ahead of its model with no hole (the generic-block fallback is the safety net).

---

## 5. Totals (see report)

- **Generic scene nouns catalogued:** ~200 across §2 A–N (plus the §2O non-prop exclusions).
- **Reachable end-to-end today (✓):** ~95 nouns, via 26 part families (20 with bespoke models, 14 blank-block).
- **◐ table-gaps (part exists, no table rolls it):** ~45 nouns — cheap table/rule wins.
- **○ model+table gaps (no part at all):** ~35 noun-families — the new-model queue.
- **✕ intentional non-props:** ~18, flagged so they are never "filled."
