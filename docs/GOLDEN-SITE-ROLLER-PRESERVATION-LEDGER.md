---
type: design-audit
created: 2026-07-25
updated: 2026-07-29
status: ACTIVE IMPLEMENTATION EVIDENCE — consumed by the current master-plan wave; never standalone build authority
owner: current-roller lineage and retained Golden Site compositions
master_plan: GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md
authority:
  - GOLDEN-SITES-CATALOG.md
scope:
  - existing working specs for Sites 1, 2, 4, 5, 6, 7, and 10
  - shared Golden Site ontology and ordinary venue fixtures
---

# GOLDEN SITE ROLLER-PRESERVATION LEDGER

**Program routing update (2026-07-29):** this ledger is the before-state and
preservation input for `GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md`. It supplies
receipts and retained capabilities to the active wave; it never authorizes a
seed-specific patch or a standalone adapter.

## Purpose

Golden Sites must improve Genesis without narrowing what Genesis can already roll.
This ledger records the current generative ingredients, the compositions worth retaining,
and the exact boundary between:

- behavior that is live in the game now;
- authored material that is present but not wired into the relevant roller;
- interpretation performed by the DM over committed facts; and
- new adapters proposed by a Golden Site spec.

It is implementation evidence subordinate to the Golden Site catalog and accepted
design. Existing behavior does not become permanent merely because it exists. It does,
however, have to be inspected, classified, and either preserved, deliberately superseded,
or named as an honest gap before a site family is implemented.

The governing preservation rule is:

> Preserve the factorized ability to produce the result, not a seed-specific branch that
> reproduces one attractive scene.

The current Golden Seed in a site spec remains a learning fixture. It cannot become the
definition of the family.

## Status vocabulary

Every source named by a Golden Site uses one of these statuses.

| Status | Meaning | What a spec may claim |
|---|---|---|
| `LIVE` | The current player-facing path calls the source and commits or returns its result. | The result is current generator behavior. |
| `LIVE-COMPOSED` | Two or more live axes can be synthesized into one site expression even though no single row names the final scene. | The composition is reachable; the receipt must retain every contributing axis. |
| `AUTHORED-UNWIRED` | The row exists in editable source but the relevant runtime path does not call it. | It is evidence and candidate content, not current behavior. |
| `ORACLE-MANUAL` | The content can be rolled or consulted outside the player-facing path. | It may inform a proposal but cannot be described as a live site roll. |
| `INTERPRETIVE` | The DM names or connects meaning over committed facts without adding mechanical truth. | The prose may vary, but it must cite the facts that licensed it. |
| `TARGET-ADAPTER` | A Golden Site proposes to consume or translate an existing source through a new typed boundary. | It is future work until built and verified. |
| `RETAINED-FIXTURE` | A real or reconstructed receipt is kept as an acceptance case. | New generation must reproduce its capability without checking for its seed or row name. |
| `SUPERSEDED` | An existing behavior is intentionally replaced by an accepted, named contract. | The old behavior stays documented until cutover and migration are complete. |

`AUTHORED-UNWIRED` is not a defect label. It prevents authored possibility from being
mistaken for shipped behavior.

## The preservation boundary

Golden Site generation should consume existing meaning through the ontology in
`GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md`:

1. **World axes** — setting, architecture/material, pressure, taboo, myth, faction,
   nearby places, region, realm, climate, and other persistent context.
2. **Walk/domain context** — urban, wilderness, or dungeon approach, exits, traversal
   facts, and domain continuity.
3. **Site identity and local axes** — persistent identity/lineage plus Place Spine
   archetype, realm skin, building/interior, topology, area/elevation, feature, scene,
   encounter, dressing, and occupancy.
4. **Host program and operating model** — the functional grammar that turns those
   facts into roles, workflows, services, zones, circuits, permissions, routes,
   capacities, objectives, property flows, and mutable states.
5. **Transform stack** — cross-host changes such as dormant, layered control,
   occupation, flooding, damage, repair, repurposing, or breach.
6. **Materialization window and semantic plan** — the smallest honest active slice,
   with stable obligations and precommitted frontiers into latent or external truth.
7. **World-context projection** — portal/support apron, near/mid/far world mass,
   background images, atmosphere, and visible state derived from retained facts.
8. **Site projection** — playable geometry, material roles, dressing, cutaway, light,
   and camera derived from the committed semantic plan.

The host program owns the relationships that make custody, extraction, hospitality, or
route service function. A transform changes that host without replacing it. Neither
walk context, transform, materialization, context, nor site projection rerolls culture,
material, faction, history, or weirdness to force a preferred look.

## Required lineage receipt

Every retained Golden Site plan must add `rollerLineage` and `sourceRollRefs` to its
existing proof receipt.

`rollerLineage` records the semantic chain:

- world id and seed;
- persistent world fields used by the site;
- place, building, walk, capture, occupation, or host records consumed;
- host-program and operating-model ids and versions;
- ordered transform ids and versions, including realm skin,
  culture/construction profile, current use, layered control, damage, repair, or host
  embedding where applicable;
- materialization-window id, licensed frontiers, active obligations, and any external
  providers consumed;
- fields considered but rejected as incompatible; and
- world-context layers, omissions, false-affordance rejections, and fallbacks; and
- the status-vocabulary value for each source when the plan was committed.

`sourceRollRefs` records the mechanical receipt for each actual roll:

`fieldKey` · `tableId` or Track-A key · `total` · `band` · `row/range` ·
`sourceVersion` · `rollerVersion` · `seedNamespace`.

If a selection is deterministic but not a literal die roll, record its stable source id,
selection key, and resolver version instead of inventing a total.

The current world path already establishes the right direction: `src/world/play.js`
retains the rolled payload verbatim and persists the structural world seed fields. Golden
Sites extend that discipline into local site composition; they do not replace the world
receipt.

## Current source inventory

### World genesis

| Source | Status | Current contribution | Preservation obligation |
|---|---|---|---|
| `data/creation-flow.js` `STAGES` | `LIVE` | Independently orders `master`, `smell`, `sound`, `arch`, `taboo`, two nearby results, `myth`, `faction`, and `pressure`. | Do not collapse structural fields into one authored site package. |
| `data/world-tables.js` `T.master` | `LIVE` | Settlement/world premise across grounded through mythic bands. | A site must accept the setting premise as context, not replace it with its Golden Seed. |
| `data/world-tables.js` `T.arch` | `LIVE` | Construction/material expression, including strange and mythic materials. | Architecture changes construction and interaction expression without changing the site's functional identity. |
| `T.nearby`, `T.faction`, `T.pressure`, `T.taboo`, `T.myth` | `LIVE` | Neighbors, operators, immediate trouble, restrictions, and belief/history. | Site hooks and occupants should consume these when relevant rather than minting parallel facts. |
| `src/world/play.js` world result | `LIVE` | Retains the rolled payload and persistent `world.seed` fields. | Preserve verbatim source facts and add local lineage beside them. |

World-setting rows already cover guard, camp, monastery, mine, lair, institution, and
strange-site expressions. Examples include High-Harrow Gate, Bog-Iron Camp, Pilgrim's
Ascent, the Ivory Pit, the Shimmering Maw, the Dorsal Market, and the Living Tapestry.
These are context axes, not seven bespoke level generators.

### Place and building generation

| Source | Status | Current contribution | Preservation obligation |
|---|---|---|---|
| [Place Spine](<../Engine/03. _Tables/05. Realms/Place Spine.md>) / `place-spine` | `LIVE` through `rollPlace` realm selection | Twenty-four functional archetypes, including Hall-of-law, Workplace, Workshop, Threshold, Crossing, Hideout, Watch-post, Works, and Commons. | Golden Site families should map to one or more compatible archetypes and preserve neighboring compositions. |
| `data/place-skins.js` | `LIVE` through `placeForRealm` | Realm expressions such as jailhouse, precinct house, sheriff's office and two cells, dry-gulch camp, stagecoach relay, signal tower catwalk, water tower platform, and fire lookout. | Realm skin changes expression; it does not own site topology or mechanics. |
| `place-master-setting`, `place-traits`, `place-secret`, optional history | `LIVE` through `rollPlace` | Local setting, character, secret, and history. | The site adapter consumes these or explicitly records why a field did not apply. |
| [Building Interior](<../Engine/03. _Tables/01. World Building/Place Generation/Building Interior.md>) / `building-interior` | `LIVE` through `rollBuildingInterior` | One atomic connected-layout/notable-feature/occupant seed across Grounded through Mythic bands: gaols, inns, holding offices, strongrooms, customs posts, religious lodging/cells, workshops, homes, institutions, and other programs. | Preserve all raw rows for untyped discovery and lineage. Typed buildings move to coherent family/program tables; compatible relationships may migrate with source refs, while whole d300 rows enter typed play only through explicit adaptive reuse. |
| `data/building-kits.js` | `LIVE` where typed building kits are requested | Tavern, temple, guildhall, manor, garrison, court, bathhouse, warehouse, smithy, and other typed kits. | Reuse compatible kits. A prison kit is currently absent and must not be implied to exist. |
| `data/building-kits.js` tavern + `src/world/urban.js` | `LIVE` | Typed realm-labelled tavern, rolled proprietor and ambient cast, soft→hard lifecycle, Distant Word, chance-gated encounter, lodging/carouse composition, and `gen interior` routing. | Preserve this live venue path while adding semantic/spatial compilation; do not replace it with a Golden-only tavern roller. |
| Extracted `Tavern - *` tables | Mixed: name and encounter are `LIVE`; remaining chains are `AUTHORED-UNWIRED` for the typed-building contact path | Tavern foundation, sensory, barkeep, in-media-res, name, and encounter content preserved from Tavern 2.0. | Record table-specific callers. Compiled presence alone does not make every chain live. |

`rollPlace` can bias a Place Spine archetype. It does not currently roll the world's
architecture material as part of the local place call. The Golden Site adapter must
receive the persistent world architecture axis explicitly instead of rerolling it.

## Retained composition RC-BUILDING-FAMILY-01

### General interior preservation plus typed family/program layers

Adam's first 2026-07-26 ruling preserved the general interior technology. The later
42-roll cohort then proved that gating it was insufficient for typed programs. Adam's
superseding ruling requires building program to constrain the interior through
separate coherent family tables and smaller layered dice.

The retained composition law is:

```text
committed building program
  + compatible family chassis table
  + program operation/current-scene tables
  + context-biased family/program Spice
  + realm/culture realization
  + derived people/capacity
  + validation and receipt
```

Preservation requirements:

- the raw untyped roller can still reach all 300 source rows;
- untyped d300 layout, feature, and `Who/What Is Inside` remain atomic;
- typed family tables share only real spatial relationships;
- every program owns hard invariants, operation, roles, and compatible Spice;
- useful d300 relationships may migrate into family/program rows with source lineage;
- whole d300 rows enter typed generation only after an explicit adaptive-reuse
  transform; and
- deeper inspection or tactical promotion resolves the same committed layered result.

The accepted architecture is `BUILDING-PROGRAM-TABLE-FAMILIES.md`.
`../Reference/Tavern-Study/INTERIOR-GATING-PROPOSAL.md` is superseded for typed primary
selection but retained for raw-d300/adaptive-reuse receipt ideas.

`../Reference/Building-Type-Roll-Study/` now retains the executable before-state:
three band-stratified rolls for every live building kit, same-seed realm mirrors, and
the actual Prison/Custody multi-source boundary. The receipts show that the current
kit/interior/realm/person layers stack mechanically but do not yet reconcile like the
walk flavor/Spice pipeline. Future family/program proof must compare against these
receipts rather than asserting composition from table inventory.

### Walk and room generation

| Source | Status | Current contribution | Preservation obligation |
|---|---|---|---|
| `walk-skin-dungeon`, `walk-skin-urban`, `walk-skin-wilderness` | `LIVE` through dynamic `rollWalkSkin` dispatch | Pressure, activity, deterioration, control, strangeness, and environmental promises. | A site must pay the selected skin's promise through its own circuits and mutable states. |
| `dungeon-area-type` | `LIVE` through `dwalkArea` | Guardrooms, gatehouses, prison blocks, workshops, shafts, sluices, caves, chasms, suspended platforms, and other room programs. | Preserve the breadth of area families and their dimensions/side effects where compatible. |
| `room-elevation-profile` | `LIVE` through `dwalkElevation` | Flat, dais, sunken, split-level, terraced, gallery, and chasm/shaft profiles with fit fallback. | Elevation remains a rolled spatial fact with its own provenance and legal fallback. |
| `dungeon-feature`, interactables, scene frames, dressing, atmosphere, light | `LIVE` on their relevant walk paths | Local objectives, hazards, props, presentation facts, and hanging-cage results. | Keep source refs at segment/room granularity; dressing cannot rewrite topology. |
| Sixteen urban topologies plus urban setup, scene, encounter, dressing, atmosphere, interactable, light, and background rolls | `LIVE` through `rollUrbanWalk` | The current urban graph and scene bag. | Urban Institutions must adapt this live walk instead of creating an unrelated town generator. |
| [Urban Area Type](<../Engine/03. _Tables/03. Session Mechanics/Dungeons/Urban Area Type.md>) / `urban-area-type` | `AUTHORED-UNWIRED` for `rollUrbanWalk` | Includes Suspended Cage, Prison Block, Catwalk Maze, and many institutional/urban rooms. | Decide deliberately which rows a future site adapter consumes; do not claim `rollUrbanWalk` already rolls them. |

The table-usage index is evidence, not the final call-graph authority. Dynamic walk-skin
dispatch and Track-A world tables are live even where a generated usage report does not
show an ordinary compiled-table consumer.

### Capture and custody

| Source | Status | Current contribution | Preservation obligation |
|---|---|---|---|
| `src/world/capture.js` holding choices | `LIVE`, under-receipted | Captor, holding form including a hanging cage, confiscation description, and escape opening. | Preserve capture as a real re-entry path and add deterministic source lineage. |
| Capture confiscation record | `LIVE` as narrative/state description; incomplete as item custody | Records where gear supposedly went. | Move exact item instances through the canonical `item_changed` event/custody contract before claiming recoverable property is implemented. |
| Capture escape openings | `LIVE`, under-receipted | Sympathetic guard, loose bar, shift change, nearby prisoner, or missed tool. | Translate into precommitted social, procedural, secret, and physical opportunities; never invent a secret route after play begins. |

Capture currently uses unseeded picks and stores no complete roll lineage. It also records
confiscation without performing the item mutation required by `EVENT-CONTRACT.md`. Both
are implementation gaps, not permission for a site spec to drop capture support.

## Retained composition RC-PRISON-01

### Suspended living-ironwood solitary cell

Adam's play result was a solitary wooden crate-like cell, grown into shape and suspended
over a void.

The current ingredients establish this as a legitimate `LIVE-COMPOSED` Golden Beat:

| Contributing fact | Source | Status |
|---|---|---|
| A settlement suspended by chains over a fused-glass crater | `T.master`: **The Shimmering Maw** | `LIVE` |
| Hardwood still growing, with leaves sprouting from the eaves | `T.arch`: **Living Ironwood** | `LIVE` |
| A hanging cage as the captor's holding form | `src/world/capture.js` | `LIVE` |
| One committed holding node focused on the prisoner | capture application plus DM interpretation | `LIVE` + `INTERPRETIVE` |
| `Suspended Cage — room hangs from chains over a void` | `urban-area-type` row 160 | `AUTHORED-UNWIRED` on the urban-walk route |

The exact last-play receipt is not checked in, so this is a reconstructed composition,
not a claim that row 160 fired. The retained fixture must say that plainly.

What Site 6 must preserve is the composition law:

`custody grammar` + `world setting` + `construction material` + `holding form` +
`occupant/current state` = one playable prison expression.

It must not check for `The Shimmering Maw`, `Living Ironwood`, a particular roll total,
or Adam's seed. Changed inputs should be able to produce materially different but
functionally valid results such as an iron toll-keep cage, flooded quarry pit,
root-cellar gaol, growing coral chamber, or sentient-silk holding.

## Site preservation records

### Site 1 — Guard Post

**Existing source families:** Threshold, Crossing, Watch-post, Hall-of-law, garrison,
gatehouse, bridge, checkpoint, signal/watch structures; High-Harrow Gate, the Free-City
of Tolls, the Salt-Flat Garrison; Hollowed Bridge, Signal Cairn, Copper-Roof Gatehouse;
Iron-Strap, Toll-Pylon, and Hearth-Watch faction expressions.

**Preserve:**

- controlled transition or observation as functional identity;
- small and large expressions across road, bridge, pass, wall, platform, and urban edge;
- terrain/culture/material/faction as independent axes; and
- current gate, checkpoint, lookout, and strange-material compositions.

**Fixture minimum:** retain one bridge or palisade result, one urban/realm checkpoint,
and one unusual-material or unusual-setting expression alongside `GP-SHAPE-01`.

**Golden Seed posture:** `GP-SHAPE-01` proves one shoulder-overlook relationship. It is
not the default topology for every Threshold or Watch-post.

### Site 2 — Camp / Service

**Existing source families:** Bog-Iron Camp, Lode-Rush Sprawl, Refugee Quarter, Ice-Road
and seasonal settlements, Drover's Rest, Charcoal Burner's Ring, dry-gulch camp, wagon
yard, and stagecoach relay.

**Preserve:**

- temporary, semi-permanent, rooted-service, industrial, refugee, winter, and boom forms;
- route-adjacent service without automatically becoming a checkpoint;
- camp-to-town growth and departure traces; and
- hosted camps that borrow another site's ground without rewriting the host.

**Fixture minimum:** retain one working/industrial camp, one displaced or refugee camp,
and one semi-permanent road-service expression alongside the borrowed-clearing seed.

**Golden Seed posture:** the borrowed clearing proves route-edge inversion and camp
organization, not a universal size, climate, permanence, or traveler premise.

### Site 4 — Monastery / Commune

**Existing source families:** Pilgrim's Ascent, Wayward Shrine, Archive-Brethren, Shrine,
Seat-of-learning, Lodging, House-of-healing, religious guesthouse/cell rows, cloister,
cliff, and pilgrimage-route expressions.

**Preserve:**

- communal routine, restricted/guest thresholds, learning/worship/work, and service flow;
- level courtyard, cliff-carved, vertical processional, dispersed-house, and hosted forms;
- cell rows as lodging or discipline without claiming custody-site ownership; and
- material/culture/terrain changes that alter construction rather than only palette.

**Fixture minimum:** retain one cliff-carved or strongly vertical result and one
distributed/guest-house result alongside the wrapped-court seed.

**Golden Seed posture:** the level wrapped court proves communal organization and
repetition. Site 6 owns involuntary custody; Site 4 may host cells only under its own
communal/guest/discipline facts.

### Site 5 — Mine / Workshop

**Existing source families:** Bog-Iron Camp, Ivory Pit, Copper-Vein Hamlet, Lode-Rush
Sprawl, Saltpeter Works, Quarry-Penance, Rust-Creek Smelter, Weeping Quarry, Hanging
Crane, Miller's Leat; Workplace, Workshop, Works, Storehouse; shaft, sluice, forge,
catwalk, excavation, and machinery.

**Preserve:**

- the source-to-processing-to-export chain;
- drift mine, vertical quarry, boomtown, penal works, mill/workshop, flooded and failed
  machinery, and high-spice material expressions;
- labor/ownership/shift and maintenance facts as mechanical circuits; and
- host relationships between extraction, settlement, workshop, storage, and transport.

**Fixture minimum:** retain one vertical quarry/shaft expression, one workshop/mill
expression, and one failed, flooded, penal, or strange-material expression alongside
the strained drift mine.

**Golden Seed posture:** the flooded lower branch proves interacting production and
hazard circuits; it does not define every Mine/Workshop as an underground drift.

### Site 7 — Natural Lair

**Existing source families:** Ironwood Shell, Bioluminescent Grove, Salt-Lick Flats,
Witch-Hazel Copse, cave/cavern/ledge/fissure/shaft/pool rooms, wilderness and dungeon
skins, organic or creature-dug voids, and adopted ruins.

**Preserve:**

- natural, organic, dug, grown, collapsed, flooded, and adopted forms;
- small dens through massive lairs;
- ecology, occupant body, claimed resource, travel, escape, and sensory facts; and
- worked intrusions only when host/history or occupant adaptation licenses them.

**Fixture minimum:** retain one non-karst organic/grown result, one vertical or flooded
result, and one adopted-worked or unusually large expression alongside the walk-in
karst seed.

**Golden Seed posture:** walk-in karst proves a readable mouth, claimed floor, deck, and
short exit. It is not the Natural Lair family.

### Site 10 — Urban Institution

**Existing source families:** Market, Commons, Gathering-place, Threshold, Hall-of-law;
Cattle-Market Plaza, Canal-Knot, Dorsal Market, Ash-Plaza, Fracture Market, Shimmering
Maw; the live urban topologies, setup rolls, scene frames, districts, and typed buildings.

**Preserve:**

- streets and institutions as one urban fabric rather than separate level generators;
- market, toll, water, fire, household, vertical, authority, schedule, and history states;
- strange urban premises without flattening them into a palette; and
- current urban walk topology, segment, encounter, dressing, and skin receipts.

**Fixture minimum:** retain one non-market civic/service institution, one vertical or
water-bound urban expression, and one strange setting/material expression alongside the
market-hall slice.

**Adapter warning:** `urban-area-type` is `AUTHORED-UNWIRED` for `rollUrbanWalk`.
The Urban Institution spec must name a `TARGET-ADAPTER` before consuming those rows and
must not create a parallel urban graph that discards the live walk.

**Golden Seed posture:** the market-hall slice proves street/frontage/vertical/time
relationships. It is neither the universal institution nor a replacement town generator.

### Site 6 — Prison / Custody

Working spec: `SITE-6-PRISON-CUSTODY-SPEC.md`. This record remains the implementation-
evidence input to that design contract. Research/doctrine support:
`../Reference/Prison-Custody-Study/`.

**Existing source families:** Hall-of-law, jailhouse, precinct house, sheriff's office
and cells, gaol, holding office, court/garrison interiors, prison blocks, cages,
capture re-entry, and the accepted small-jail/city-prison obligation model in the
procedural-dungeon wave records.

**Preserve:**

- outside-in infiltration/visit and inside-out captured starts on the same committed map;
- hamlet jail through repeated city-prison custody;
- intake, observation/control, sanitation/support, records, property custody, staff
  circulation, visitation/interview where scaled, and credible external dependencies;
- social, procedural, secret, environmental, and force exits whose facts are committed
  before the player acts;
- exact confiscated item instances and causal recovery; and
- distinct prisoner-property, crime/case-evidence, contraband, and institution-property
  records even when low volume shares a secure realization;
- doctrine as correlated authority/organization/access/property/routine/service/failure
  answers, including the selected Keeper-House versus Ledger-and-Shift proof pair, not
  a palette or named-mesh selector; and
- repeated cells whose variation comes from occupancy, condition, marks, sound,
  contraband, relationship, and discovery rather than arbitrary topology noise.

**Fixture minimum:** RC-PRISON-01, one small civic jail, one large repeated-custody
institution, and one degraded/repurposed prison. Each committed plan is replayed from an
outside arrival and a captured start.

**Evidence/property scale:** low-volume custody may place attributed prisoner property
and case evidence in distinct containers within one locked cabinet/closet when capacity,
hazard, ownership, and access permit. Larger throughput promotes intake/reception
property storage; case evidence may separate into a dedicated room or real external
court/watch/civic store. Every external store needs a provider, guarded route, reliable
access, and release authority. Shared space never collapses item class or identity.

## Cross-site acceptance law

Before a Golden Site reaches implementation:

1. list every current source it intends to consume;
2. mark every source with the status vocabulary above;
3. retain at least one real current roll or reconstructed composition;
4. prove two changed-seed descendants and one adversarial case;
5. show that retained results pass through the ordinary host/transform/materialization
   path without seed, row-name, culture-id, material-id, Golden-number, or
   capture-specific branches;
6. preserve existing world, place, walk, and building receipts rather than replacing them
   with one opaque site seed;
7. record every relaxation, rejected candidate, and fallback;
8. demonstrate that changing material, realm, culture, occupancy, condition, or current
   use does not silently change the site's functional identity;
9. demonstrate that changing site family does not discard valid world context; and
10. show that context-on and context-off captures retain identical mechanics, ids,
    portals, and knowledge while the rolled setting remains visually legible; and
11. declare any intentional supersession and its migration/cutover owner.

The retained set is an acceptance portfolio, not a frequency target. It proves reachability
and composability; distribution remains owned by the source tables and future tuning.

## Known implementation gaps

These gaps are recorded here so the working specs do not overstate them:

1. **Capture provenance:** capture picks need a seeded or otherwise replayable receipt
   with source ids and selected results.
2. **Property custody:** capture must move exact item instances through the canonical item
   event/custody path; its current confiscation string is insufficient.
3. **Urban area adapter:** `rollUrbanWalk` does not currently consume
   `urban-area-type`. Site 10 and Site 6 must agree on a deliberate adapter boundary if
   either needs those rows.
4. **Architecture handoff:** `rollPlace` does not itself consume the persistent world
   architecture roll. The site invocation must pass that axis explicitly.
5. **Typed prison kit:** the current building-kit registry has court and garrison but no
   prison/jail kit.
6. **Checked-in prison receipt:** RC-PRISON-01 is reconstructed from live ingredients
   because the exact playthrough save is unavailable.
7. **World-context projection:** no `WorldContextProjectionPlan`, context-card/plate
   manifest, portal-continuation validator, or real-roll background consumer exists.
   The current renderer owns graded fog/void and lighting, not rolled surrounding world
   geometry. See `GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md`.
8. **Shared host/transform boundary:** live place, building, and walk sources do not yet
   compile through explicit `HostProgram`, `TransformStack`, and
   `MaterializationWindow` products.
9. **Tavern spatial fixture:** the typed tavern is live, but `VENUE-TAVERN-01` has no
   retained semantic plan, shared TacticalCompositionPlan, SceneTray→BattleMap identity
   proof, or layered-control transform fixture.

None of these gaps authorizes one-off content. They define the smallest honest seams a
future implementation must close.
