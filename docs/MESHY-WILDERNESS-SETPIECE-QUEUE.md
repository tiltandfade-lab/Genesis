---
type: production-slate
project: Genesis
status: PROPOSED — Fable-directed, drafted 2026-07-26, awaiting Adam; pending integration with the live Meshy Batch-4 work
created: 2026-07-26
updated: 2026-07-26
budget: not allocated — this is a candidate slate, not an authorized spend
reference-root: ../Reference/Meshy-Premium-Month-1/
evidence:
  - intel/walk-census.md
  - intel/walk-census-mapping.json
  - intel/wild-unmapped-cluster.mjs
related:
  - "[[MESHY-PREMIUM-MONTH-1-MODEL-SLATE]]"
  - "[[MESHY-PREMIUM-MONTH-1-BATCH-PRODUCTION-HANDOFF]]"
  - "[[SETTLED-LIFE-SITES-PROGRAM]]"
  - "[[GOLDEN-SITE-CONCEPTING-GUIDELINES]]"
  - "[[ART-DIRECTION-CANON]]"
---

# MESHY WILDERNESS SET-PIECE QUEUE

**PROPOSED. Nothing here is authorized, queued, or budgeted.** This document proposes
families and a next-batch candidate slate for Adam's decision. It **references and does not
modify** [`MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md`](MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md) or
`Reference/Meshy-Premium-Month-1/batch-production-manifest.csv`, and it does not touch the
live Batch-4 production lane. If any family here is adopted, it enters the existing slate
and manifest through that document's own process, not through this one.

Adam, 2026-07-26 (verbatim intent): the wilderness landscape curiosities should go **"in a
modeling queue for our meshy sub."** This is that queue.

## 1. What the evidence actually says

`intel/walk-census.md` rolled 1,050 walks against the built engine. The wilderness arrival
signal is the `wilderness-feature` table (**not** `areaType`, which turned out to be a
clearing shape/dimension string — discovered empirically, §4 caveat 1). Result:

- **539 wilderness arrivals, 255 distinct feature values.**
- **177 (32.8%) map to a golden site; 362 (67.2%) do not.**
- The unmapped 362 instances span **166 distinct values** — no single value exceeds 6
  counts (1.11%).

**One correction to the headline this queue was commissioned under.** The brief said "362
instances, 255 distinct." 255 is the distinct count across the *whole* wilderness table,
mapped and unmapped together. The unmapped subset is **362 instances / 166 distinct**
(verified: `mappedCount 177 + unmappedCount 362 = total 539`; `89 distinct mapped + 166
distinct unmapped = 255 distinct rows`). Every number below uses 362/166.

The census's own reading of the pattern is the thing that makes this a modeling job:

> this table is a **landscape curiosities/monuments generator** (single objects, wrecks,
> natural oddities, illusions) — it is not, and was never meant to be, a generator of the
> twelve buildable golden-site structures.

That is not a coverage failure to be fixed by inventing a thirteenth site. It is 362
rollable *objects* with no bodies. Objects are what Meshy is for.

### Reproducing the clustering

The clusters in §2 come from an explicit head-noun → cluster map, not a keyword heuristic,
so that every one of the 166 distinct rows lands in exactly one bin and the counts add up
to 362 with nothing double-counted:

```
node docs/intel/wild-unmapped-cluster.mjs
```

Output header confirms the partition: `assigned instances 362 assigned distinct 166`.
The cluster assignment is mine, not a founder ruling; the underlying counts are real rolls.

## 2. The twelve clusters — a strict partition of the 362

Nine mesh-eligible clusters, three non-mesh. This is the exact partition; §4's proposed
families draw *across* these clusters, so family-level tallies later in this document are
read-offs, not a second partition.

| cluster | family of thing | instances | distinct | % of 362 |
|---|---|---:|---:|---:|
| **W3** | Giant discarded object (oversized mundane) | 72 | 34 | 19.9% |
| **W5** | Natural rock + impact formation | 62 | 23 | 17.1% |
| **W1** | Megalith / pillar / marker stone | 51 | 25 | 14.1% |
| **X1** | *NON-MESH* — illusion / levitation / field anomaly | 35 | 14 | 9.7% |
| **W4** | Remains, bones, and funerary furniture | 26 | 11 | 7.2% |
| **W2** | Carved figure (statue, idol, relief) | 26 | 16 | 7.2% |
| **W8** | Ruined built fragment + minor infrastructure | 24 | 11 | 6.6% |
| **W7** | Vegetation / fungal barrier + petrified tree | 24 | 11 | 6.6% |
| **W6** | Water feature (contained) | 15 | 6 | 4.1% |
| **X2** | *NON-MESH* — ground-material + field state | 13 | 7 | 3.6% |
| **W9** | Wreck, vehicle, and mechanism | 13 | 7 | 3.6% |
| **X3** | *NON-MESH* — living / animate | 1 | 1 | 0.3% |

**Mesh-eligible: 313 instances / 144 distinct (86.5%). Non-mesh remainder: 49 instances /
22 distinct (13.5%).**

Two facts worth pulling out before the families:

1. **The single largest cluster is not natural.** W3 — oversized abandoned *human* objects,
   the giant anchor and the grandfather clock and the plush carpet in the dirt — is 19.9%
   of the unmapped table, ahead of natural rock. This table's dominant register is *the
   uncanny left-behind object*, not geology. That is a strong art-direction signal and it
   changes what the batch should buy.
2. **Three of the top four clusters are single upright objects** (W3, W1, W2 = 41.2%
   combined). Single uprights are the best possible Meshy subject: one isolated object, one
   orthographic three-quarter view, broad construction-aligned planes, readable silhouette
   — the reference-image contract in the Month-1 slate §1 describes them almost exactly.

## 3. The honest non-mesh remainder

**49 instances / 22 distinct values (13.5% of the unmapped table) must not be bought as
meshes.** Each needs a different pipeline. Listing them explicitly is the point of this
section — a batch that quietly tries to model an illusion wastes generations and produces
a lie.

### X1 — illusion, levitation, and field anomaly · 35 instances / 14 distinct

`Floating Weapon` 4 · `Ghost Ship` 4 · `Singing Crystals` 4 · `Eldritch Crystal` 3 ·
`Shadow-Weave Patch` 3 · `Silent Zone` 3 · `Anti-Gravity Zone` 2 · `Bleeding Stone` 2 ·
`Floating Crystal` 2 · `Floating Earth Mote` 2 · `Spectral Flames` 2 · `Wild Magic Zone` 2 ·
`Floating Water Globe` 1 · `Time-Locked Debris` 1

**Why not meshable.** In every one of these, the *object* is trivial and the *behaviour* is
the entire content. A floating longsword is a longsword — we do not need a Meshy generation
for a longsword; we need a hover transform, a rotation, and a shadow that lands on the
ground beneath it. A Ghost Ship is explicitly "an illusion of a ship that loops a 5-sec
crash" — buying a ship mesh for it would produce a solid ship, which is the opposite of the
rolled fact. `Silent Zone`, `Shadow-Weave Patch`, `Anti-Gravity Zone`, and `Wild Magic Zone`
have no geometry at all.

**Pipeline they need instead.** (a) A **runtime anomaly-effect layer** — hover/orbit/
inversion transforms, a shader-level colour or desaturation volume, particle and emissive
control; the slate's own §4 exclusions already route "decals, stains, moss, cracks, soot,
wetness, or other surface-state masks" away from Meshy for the same reason. (b) A small
library of **ordinary props to be anomalised** — most of X1 attaches its anomaly to a
weapon, a crystal, a stone, or a rock chunk, and Genesis already owns or can cheaply own
all four. (c) Where an anomaly must read as a *place*, it belongs to the lighting and VFX
lane, not to geometry.

**One caveat, flagged not resolved:** `Singing Crystals` (4) and `Eldritch Crystal` (3)
have real crystal bodies and could ride the existing **M017 crystal/strange-mineral growth**
family as a recolor plus emission — 7 of the 35 could be served without a new generation.
That is an integration question for whoever owns M017, not a proposal here.

### X2 — ground-material and field state · 13 instances / 7 distinct

`Geothermal Vent` 3 · `Acidic Seep` 2 · `Cursed Soil` 2 · `Glass Desert` 2 · `Lava Flow` 2 ·
`Mud Flat` 1 · `Spore Cloud` 1

**Why not meshable.** These are *surfaces and volumes of terrain*, not objects. A lava flow
is a material, an emissive, and a movement-cost rule laid over ground the engine already
owns; a mud flat is a friction and difficult-terrain state. Buying a mesh would produce a
static crust that cannot follow the terrain it is supposed to be part of. The Month-1
slate's exclusion list already routes "floors, roads, terrain slabs" and all surface-state
masks away from Meshy.

**Pipeline they need instead.** Terrain material + decal + a movement/hazard rule, owned by
the material lane and the engine's ground authority. `Geothermal Vent` (3) is the one
partial exception — it has a small rock aperture that could ride **M014 pool and channel
rock rim** as a recolor — plus a steam VFX that cannot.

### X3 — living / animate · 1 instance / 1 distinct

`Carnivorous Plant` 1 — "A massive flytrap or mantrap."

**Why not meshable here.** It is a creature with an attack, not scenery. The slate's own
exclusions forbid spending Meshy generations on "characters or creatures already better
represented by canonical standee sprites," and `ART-DEPARTMENT.md` makes pixel sprites the
canon figure register. This is a bestiary entry that happens to be rolled by a terrain
table.

**Pipeline it needs instead.** The creature/standee pipeline, or a bestiary row.

### Also explicitly routed away from Meshy (mesh-eligible geometry, wrong buyer)

These sit inside mesh-eligible clusters but the Month-1 slate §4 already assigns them
elsewhere. Listing them prevents a future batch from re-proposing them.

| rows | instances | correct owner | why |
|---|---:|---|---|
| `Crumbling Corner` 4 · `Bisected Tower` 3 · `Overhanging Wall` 2 · `Stone Bridge` 1 · `Aqueduct Span` 1 · `Stone Archery Blind` 2 · `Stepping Stones` 1 | 14 | **procedural geometry** | §4 excludes "walls, wall ends, party walls, corners… floors, roads, terrain slabs, retaining prisms, stairs, ramps, ladders, or landings." A crumbling corner is two wall runs and an end condition — the CL-R3 construction vocabulary already owns it. |
| `Towering Mesa` 5 · `Terraced Slopes` 5 · `Natural Amphitheater` 3 · `Overhanging Cliff` 3 · `Bottomless Crevasse` 3 · `Earthwork Trench` 4 · `Narrow Fissure` 2 · `Chasm with Landbridge` 2 · `Lava Tube` 1 | 28 | **engine terrain / elevation authority** | These are landform, not props. The slate's own donor contract gives the engine "exact terrain hole, elevation authority, walkability" — buying a mesa as a mesh would put a fixed-size object where the engine needs authored height. |
| `Floating Rock Steps` 4 · `Floating Steps` 1 | 5 | **procedural + anomaly layer** | Stone slabs (procedural) plus a hover transform (X1's layer). Neither half is a Meshy purchase. |

**Contested — flagged for Adam, not decided here.** `Natural Arch` (3) and `Coral Brain` (2)
sit exactly on the terrain/prop line. An arch is landform when the player walks under it and
a set-piece when it is a landmark on a small tray. Recommend they be resolved once, as a
rule about scale, rather than per-row.

## 4. Proposed new donor families

Fourteen families, `M076`–`M089`, following the Month-1 slate's conventions exactly: one ID
per family, a plain-English family name plus procedural purpose, and four intentional
variants — **A canonical · B silhouette · C failed · D adapted** — close enough to share
gameplay metadata, materials, sockets, collision policy, and downstream code.

Instance counts are read-offs across the §2 clusters, not a second partition.

### Group H — monuments and uprights

| ID | family and procedural purpose | four Meshy models | inst. |
| --- | --- | --- | ---: |
| **M076** | **Standing-stone group.** Two-to-five raw stone uprights that read as deliberately *placed* rather than geologically fallen, at a scale that anchors a tray without blocking it. Supplies the whole megalith register plus circle segments and trilithons. | A upright menhir pair · B leaning/tilted single with propped neighbour · C fallen and part-buried group · D carved, inscribed, or petroglyph-worked group | 16 |
| **M077** | **Solitary worked column.** One upright shaft with a distinct top condition and a stable base, built so material recolor alone spans stone, metal, obsidian, and chalk without new geometry. The highest-frequency single silhouette in the whole unmapped table. | A tapered stone obelisk · B seamless metal cylinder · C sheared/broken stump with debris · D barb-wrapped, hollowed, or overgrown claimed column | 26 |
| **M078** | **Waymark cairn and boundary marker.** Human-placed navigation and ownership vocabulary — the cheapest cross-site donor in this queue, useful on every walk family and at every golden site. | A shoulder-high stacked cairn · B low fieldstone boundary run · C toppled and scattered cairn · D marked, painted, or offering-laden cairn | 9 |
| **M079** | **Standing carved figure.** Full-height humanoid or beast figure with a plinth socket, authored as a silhouette rather than a portrait so that culture and condition are carried by material and separable attachments. | A standing heroic figure · B kneeling/bowed figure · C eroded, headless, or toppled figure · D chained, defaced, or re-dressed figure | 18 |
| **M080** | **Colossus fragment.** One enormous body part of a statue that was never modelled — head, hand, helm, or torso — half-buried at a scale that makes the tray feel like a detail of somewhere larger. Highest silhouette value per generation in this queue. | A giant head on its side · B open hand or forearm · C shattered torso with rubble · D occupied fragment adapted as shelter or shrine | 10 |

### Group J — the left-behind object (the table's dominant register)

| ID | family and procedural purpose | four Meshy models | inst. |
| --- | --- | --- | ---: |
| **M081** | **Oversized abandoned implement.** A working tool or weapon at ten-to-twenty times human scale, embedded in or resting on the ground so the engine keeps the terrain hole. The rolled register's flagship: giant anchor, giant bear trap, embedded blade. | A ship's anchor on its side · B sprung jaw-trap mechanism · C blade or spear embedded to the hilt · D repurposed as bridge, brace, or shelter | 23 |
| **M082** | **Displaced household furnishing.** An ordinary interior object standing intact and out of place in the open — a tall case clock, a laid carpet runner, a set table, a dressing mirror. **This family pays twice:** it is the largest single behavioural group in the wilderness table *and* it is exactly the prop demand of the domestic/lodging interior in [`SETTLED-LIFE-SITES-PROGRAM.md`](SETTLED-LIFE-SITES-PROGRAM.md) §3.1, where the Month-1 slate has no coverage at all. | A tall case clock · B set table with chairs · C smashed, rotted, or overturned piece · D weathered and reclaimed outdoor version | 29 |
| **M089** | **Oversized vessel and resonant body.** Large hollow forms — cauldron, pitcher, shell, drum, sphere, litter — that read as containers or instruments and can accept contents, damage, and occupancy as separate attachments. | A wide-mouthed cauldron on a stand · B tall tipped pitcher or shell · C burst, torn, or split body · D reoccupied or repurposed body | 15 |

### Group K — remains, custody, and the sea

| ID | family and procedural purpose | four Meshy models | inst. |
| --- | --- | --- | ---: |
| **M083** | **Beached hull.** A boat out of water, sized between a skiff and a small caravel, with separable hull, ribs, mast stub, and rigging points. Serves the wilderness table *and* the harbourfront host program proposed in `SETTLED-LIFE-SITES-PROGRAM.md` §3.2, where nothing currently exists. | A small skiff hull upright on the shore · B overturned larger hull · C burned or broken rib cage of a hull · D salvage-adapted hull used as shelter or store | 6 |
| **M084** | **Gargantuan skeleton landmark.** A creature skeleton at building scale — a ribcage you walk through, a skull half-buried — with restrained readable bones rather than anatomical density, per the adult-horror restraint already ruled for M066. | A ribcage arc forming a route · B half-buried skull · C scattered and collapsed remains · D nested, claimed, or ritual-dressed remains | 6 |
| **M085** | **Funerary furniture.** The grave's built vocabulary: mound and marker, hanging coffin, unlit pyre, ordered skull stack. **Highest cross-site reuse in this queue** — Subterranean Crypt is the single most-rolled dungeon type at 21.3% of all dungeon arrivals, and this family serves it directly. | A dirt mound with a crude marker · B suspended stone coffin · C collapsed, robbed, or scattered grave · D maintained, ritualized, or reused grave | 7 |
| **M086** | **Punishment furniture.** Block, stocks, pillory, and staking post — the street-level custody vocabulary. Serves Site 6 Prison/Custody (which already has a working spec) and Site 10's public frontage as well as the wilderness roll. | A stained execution block with basket · B timber stocks or pillory · C broken, burned, or disused fixture · D occupied, reinforced, or ceremonially dressed fixture | 7 |

### Group L — living and mineralized forms

| ID | family and procedural purpose | four Meshy models | inst. |
| --- | --- | --- | ---: |
| **M087** | **Thorn and thicket barrier.** Route-denial vegetation as a *volume with a strong outer silhouette*, not a strand simulation. Carries the explicit risk flagged on M063: Meshy must be prevented from producing hair-thin geometry, so the reference must present broad braided masses. | A straight impassable bramble run · B arched or tunnelled thicket · C burned or hacked-through gap · D web-bound or cultivated barrier | 14 |
| **M088** | **Arrested-motion mineral form.** Something that should be moving, turned to stone or glass — a petrified waterfall, a glass tree, a frozen geyser. The table's purest wonder register, and a strong cross-realm reskin because the geometry is neutral and the material carries the meaning. | A petrified cascade · B mineralized tree with drooping limbs · C shattered or partly quarried form · D worked, harvested, or emissive form | 9 |

**Families total: 195 instances of the 313 mesh-eligible (62%).**

### 4.1 Already covered — extend, do not re-buy

Roughly 50 further instances are already served by Month-1 families. These need a variant,
a recolor, or a metadata note — **not a new family.** Recorded here so a future batch does
not propose them again.

| rolled rows | inst. | existing family |
|---|---:|---|
| `Lone Boulder` 5 · `Balanced Rock` 4 · `Split Boulder` 3 | 12 | **M001** low cover boulder cluster / **M002** tall cover outcrop |
| `Crystal Geode` 6 · `Crystal Outcropping` 3 | 9 | **M017** crystal or strange-mineral growth |
| `Oasis / Hot Spring` 4 · `Mirror of the Sky` 2 · `Crystal Pool` 1 | 7 | **M014** pool and channel rock rim |
| `Bone Pile` 6 | 6 | **M066** creature bone and larder cluster |
| `Stepped Sinkhole` 2 · `Meteorite Crater (Glowing)` 2 · `Meteoric Crater` 1 | 5 | **M013** sinkhole or shaft rim |
| `Iron Bell` 3 · `Fallen Bell` 2 | 5 | **M052** bell or gong yoke — its C variant is already "cracked/fallen signal" |
| `Mushroom Ring` 3 · `Fungal Bloom` 1 | 4 | **M074** living or mineral cool-light cluster |
| `Stone Well` 2 · `Stone Font` 2 | 4 | **M044** wellhead with lifting gear / **M050** shrine and reliquary plinth |
| `Great Fallen Log` 1 · `Hollow Log` 1 | 2 | **M011** root arch and burrow mouth / **M012** root tunnel rib cluster |
| `Siege Engine` 1 · `Clockwork Wreckage` 1 | 2 | **M060** broken wagon and axle wreck / **M019** chassis parts |

## 5. Proposed next-batch candidate slate — 26 models

**Prioritized by roll frequency × silhouette value on the tabletop × cross-realm
reusability.** Waves `L1`/`L2`/`L3` are new ids chosen not to collide with the manifest's
existing `C0`, `A1`–`A6`, and `V1`–`V6` waves. Status `proposed` is likewise a new value,
distinct from `queued`/`accepted`, so nothing here can be mistaken for admitted queue work.

Shape of the batch, following the Month-1 slate's own gate logic (Gate 3: complete canonical
A models first for breadth; Gate 4: variants in value order):

- **L1 — 12 models.** A **and** C for the six highest-scoring families. C rather than B
  because this table's rolled register is overwhelmingly *weathered, broken, and
  left-behind* — the failed state is not an edge case here, it is the common case.
- **L2 — 8 models.** A only, for breadth across the remaining eight families.
- **L3 — 6 models.** B and D variants on the families L1 proves out.

| pri | wave | status | jobId | modelId | var | category | family | variantSubject | targetPolys | freq | silhouette | reuse | score |
|---:|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|
| 1 | L1 | proposed | M082-A | M082 | A | trace | Displaced household furnishing | tall case clock | 900 | 29 | high | very high | 1 |
| 2 | L1 | proposed | M082-C | M082 | C | trace | Displaced household furnishing | smashed, rotted, or overturned piece | 900 | 29 | high | very high | 2 |
| 3 | L1 | proposed | M077-A | M077 | A | natural | Solitary worked column | tapered stone obelisk | 700 | 26 | very high | very high | 3 |
| 4 | L1 | proposed | M077-C | M077 | C | natural | Solitary worked column | sheared stump with debris | 700 | 26 | very high | very high | 4 |
| 5 | L1 | proposed | M081-A | M081 | A | trace | Oversized abandoned implement | ship's anchor on its side | 900 | 23 | very high | high | 5 |
| 6 | L1 | proposed | M081-C | M081 | C | trace | Oversized abandoned implement | blade embedded to the hilt | 900 | 23 | very high | high | 6 |
| 7 | L1 | proposed | M079-A | M079 | A | civic | Standing carved figure | standing heroic figure | 1,200 | 18 | high | very high | 7 |
| 8 | L1 | proposed | M079-C | M079 | C | civic | Standing carved figure | eroded, headless, toppled figure | 1,200 | 18 | high | very high | 8 |
| 9 | L1 | proposed | M076-A | M076 | A | natural | Standing-stone group | upright menhir pair | 1,200 | 16 | high | very high | 9 |
| 10 | L1 | proposed | M076-C | M076 | C | natural | Standing-stone group | fallen, part-buried group | 1,200 | 16 | high | very high | 10 |
| 11 | L1 | proposed | M080-A | M080 | A | civic | Colossus fragment | giant head on its side | 1,400 | 10 | highest | high | 11 |
| 12 | L1 | proposed | M080-C | M080 | C | civic | Colossus fragment | shattered torso with rubble | 1,400 | 10 | highest | high | 12 |
| 13 | L2 | proposed | M089-A | M089 | A | civic | Oversized vessel and resonant body | wide-mouthed cauldron on a stand | 900 | 15 | med-high | high | 13 |
| 14 | L2 | proposed | M087-A | M087 | A | natural | Thorn and thicket barrier | straight impassable bramble run | 1,500 | 14 | medium | very high | 14 |
| 15 | L2 | proposed | M085-A | M085 | A | trace | Funerary furniture | dirt mound with crude marker | 900 | 7 | medium | **highest** | 15 |
| 16 | L2 | proposed | M078-A | M078 | A | civic | Waymark cairn and boundary marker | shoulder-high stacked cairn | 800 | 9 | medium | very high | 16 |
| 17 | L2 | proposed | M088-A | M088 | A | natural | Arrested-motion mineral form | petrified cascade | 1,600 | 9 | high | medium | 17 |
| 18 | L2 | proposed | M086-A | M086 | A | defensive | Punishment furniture | stained execution block with basket | 700 | 7 | medium | high | 18 |
| 19 | L2 | proposed | M083-A | M083 | A | transport | Beached hull | small skiff hull upright on shore | 2,000 | 6 | very high | high | 19 |
| 20 | L2 | proposed | M084-A | M084 | A | trace | Gargantuan skeleton landmark | ribcage arc forming a route | 1,800 | 6 | very high | med-high | 20 |
| 21 | L3 | proposed | M082-B | M082 | B | trace | Displaced household furnishing | set table with chairs | 900 | 29 | high | very high | 21 |
| 22 | L3 | proposed | M082-D | M082 | D | trace | Displaced household furnishing | weathered reclaimed outdoor version | 900 | 29 | high | very high | 22 |
| 23 | L3 | proposed | M077-B | M077 | B | natural | Solitary worked column | seamless metal cylinder | 700 | 26 | very high | very high | 23 |
| 24 | L3 | proposed | M081-B | M081 | B | trace | Oversized abandoned implement | sprung jaw-trap mechanism | 900 | 23 | very high | high | 24 |
| 25 | L3 | proposed | M079-B | M079 | B | civic | Standing carved figure | kneeling/bowed figure | 1,200 | 18 | high | very high | 25 |
| 26 | L3 | proposed | M083-C | M083 | C | transport | Beached hull | burned or broken rib cage of a hull | 2,000 | 6 | very high | high | 26 |

**26 models across 14 families.** Polygon targets follow the Month-1 slate's asset-class
table (small fixture 300–700 · ordinary prop or cluster 700–1,500 · large formation
1,500–3,000) and are first targets only — raise a count only when the fixed game camera
proves a missing contour matters.

### 5.1 If this slate is adopted, the manifest rows it becomes

The existing manifest carries these columns, in this order — the adoption pass would fill
them per row, and the fields below the table's own coverage are what the Terra/reference
lane and the Adam/Meshy lane each owe per the Month-1 handoff:

```text
priority · wave · status · jobId · modelId · variant · category · family ·
variantSubject · purpose · targetPolygons · referenceImage · canonicalIncoming ·
canonicalProcessed · donorOwns · engineOwns · expectedProceduralReplacements ·
acceptanceFocus · meshyPrompt
```

The two fields that need the most care for *this* queue specifically:

- **`donorOwns`** — for landscape set-pieces this is the authored silhouette, its few major
  masses, real openings and ledges, and construction-scale fracture or growth planes. It is
  **not** the ground the object sits in.
- **`engineOwns`** — exact terrain hole, elevation authority, walkability, collision
  resolution, and any anomaly behaviour. Every row in this queue that came from a rolled
  *anomaly* keeps its behaviour on the engine side; only the body is bought.

### 5.2 Integration constraints (binding on any adoption)

1. **Do not disturb Batch-4.** The live production lane owns the manifest. These rows enter
   through the Month-1 handoff's own process, after Batch-4's waves settle — never as an
   in-flight insertion.
2. **The Month-1 admission rule applies unchanged.** A Meshy result is a donor, not a
   production asset, until it has stable world dimensions, bottom-centered origin, named
   separable parts, a collision proxy, declared footprint/height/cover/walkability/mounting
   class, normalized materials, allowed scaling axes, sockets, locally-derived LODs,
   clay-room and fixed-camera proof, and a full provenance record.
3. **The two-failure stop rule applies.** Stop paid generation for a family when two
   attempts fail for the same structural reason; return its slots to the highest-value
   successful families. `M087` (thorn barrier) is the family most likely to trip this, and
   the reason is already known and named — thin-strand geometry.
4. **`M082` and `M083` should be scheduled with the settled-life program, not against it.**
   Both serve a proposed host program (`SETTLED-LIFE-SITES-PROGRAM.md` §3.1 domestic,
   §3.2 harbourfront) whose research pass has not started. If that program's build order is
   adopted, these two families get sharper reference briefs by waiting for it — and if it
   is not adopted, they still stand on their wilderness roll counts alone.
5. **Nothing here changes the twelve-site portfolio.** These are props. The census's own
   verdict is that the wilderness feature table was never a site generator; buying it
   bodies does not make it one.

## 6. What this queue does not answer

Stated plainly, per the honesty bar the sibling studies set:

- **The scenery-versus-usable question is open**, and it sets the per-model cost. It is
  founder question 4 in `SETTLED-LIFE-SITES-PROGRAM.md` §7. A scenery-grade batch buys
  silhouette and a collision proxy; a usable-grade batch buys sockets, cover values, and
  climbability at several times the cleanup. This slate is costed at scenery grade.
- **The clustering is mine, not a ruling.** 362 real rolled instances, 166 real distinct
  values, one explicit reproducible assignment — but reasonable people would move
  `Basalt Columns`, `Natural Arch`, `Coral Brain`, and the whole `Offering Table` /
  `Circular Dais` boundary. The counts are exact; the bins are a proposal.
- **The census's wilderness numbers come from unseeded `Math.random()`** across 539
  arrivals. Re-running reproduces the *shape* of the distribution, not the exact counts
  (`intel/walk-census.md` §4 caveat 7). Family priorities built on 20+ instances are safe;
  the 6-instance families at the bottom of L2 are within noise of each other and their
  order should not be defended.
- **No reference images exist for any row here.** The Terra lane's per-row reference-image
  work is unstarted, and the Month-1 rule stands: one row creates one reference image,
  variants never share a canvas.
