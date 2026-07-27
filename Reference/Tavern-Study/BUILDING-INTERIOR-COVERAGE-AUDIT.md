# General Building Interior — cross-program coverage audit

date: 2026-07-26  
status: implementation evidence and expansion recommendation; no live changes  
source: `Building Interior.md`, current building kits/callers, prison/custody sources

The deterministic cross-program roll cohort is retained separately in
`../Building-Type-Roll-Study/`. It converts this static coverage diagnosis into 42
integrated before-state receipts plus fourteen same-seed realm mirrors.

## 0. Direct answer

The d300 does not currently serve Tavern, Smithy, Prison, or any other typed program
reliably. Every existing typed building calls the same flat general table:

```text
rollBuilding(type)
  → rollBuildingInterior({ kind:type })
  → unconstrained rollTable("building-interior")
```

`kind` is retained as descriptive framing but does not filter the row.

The source content is not equally deep by program, however:

- Tavern has a relatively broad set of direct interior rows plus dedicated Tavern 2.0
  material.
- Smithy has a valid typed kit and real shop inventory/economy delegation, but only a
  small direct interior family; general workshop rows provide strong adaptation range.
- Prison has only a few direct d300 rows and no `BUILDING_KITS` entry, but it has
  stronger custody/topology sources elsewhere in the engine.

The later 42-roll cohort changed the correction. Shared typed gating alone is
insufficient: typed buildings need coherent family chassis tables and program-specific
operation/current-scene/Spice layers. The d300 remains an untyped source and optional
explicit-transform input, not the typed primary selector.

## 1. What the live typed path actually supports

Current `BUILDING_KITS`:

```text
tavern · temple · guildhall · manor · garrison · court · bathhouse
gambling-den · warehouse · dock-house
smithy · apothecary · general · arcanist
```

All fourteen use the ungated d300 interior. The four shop kinds additionally delegate
to the existing shop economy:

```text
smithy     → makeShop("smith")
apothecary → makeShop("apothecary")
general    → makeShop("general")
arcanist   → makeShop("arcanist")
```

That delegation correctly controls inventory, pricing, and shop identity. It does not
control the physical interior.

There is no `prison`, `jail`, or `custody` building kit. An unknown typed call is
correctly refused rather than invented. Prison/custody currently enters through Place
Spine/realm skins, dungeon or authored urban area rows, capture, and the proposed Site
6 adapter.

## 2. Lexical coverage floor

The following is a reproducible strict-keyword scan across all 300 atomic rows. It is
not the future semantic tag audit: a row can be compatible without naming the program,
and a keyword mention does not prove every obligation. The count is useful as a floor
showing where literal variety is concentrated.

| program or current kit | strict matching rows | band spread | assessment before semantic tagging |
|---|---:|---|---|
| Tavern / lodging | 14 | G8 · T3 · S2 · V1 | strongest dedicated hospitality spread |
| Temple | 20 | G10 · T4 · S3 · V2 · M1 | broad literal and Spice coverage |
| Guildhall | 3 | G2 · T1 | sparse literal pool; compatible halls/offices likely expand it |
| Manor | 12 | G6 · T3 · S1 · V2 | good host breadth |
| Garrison | 1 | G1 | materially sparse in this table; stronger dungeon-area support |
| Court | 11 | G10 · T1 | grounded legal/record breadth; weak high-Spice spread |
| Bathhouse | 4 | G2 · T1 · S1 | small but coherent direct family |
| Gambling den | 2 | G2 | sparse literal pool; tavern/club/back-room reuse possible |
| Warehouse | 19 | G13 · T2 · S3 · V1 | very strong host spread |
| Dock-house | 8 | G7 · V1 | moderate, mostly grounded |
| Smithy / metalwork | 4 | G3 · S1 | small direct family; broad workshop adjacency |
| Apothecary | 11 | G7 · T2 · S2 | good literal/adjacent spread |
| General store | 11 | G8 · T1 · S2 | good retail host spread |
| Arcanist | 3 | G3 | sparse literal naming; many strange hosts may become compatible |
| Prison / custody | 3 | G2 · T1 | too sparse to act as a complete prison generator |

Strict row references for the two questioned programs:

- Prison/custody: `building-interior#19` gaol, `#78` magistrate's holding
  office, and `#213` gaoler's house.
- Smithy/metalwork: `#11` smithy, `#73` armorer, `#153` coppersmith, and
  `#282` strange rust-preventing armorer.

Tavern's fourteen literal rows amount to only 4.7% of an ungated d300. Smithy's four
amount to 1.3%; Prison's three amount to 1%. Filtering those rows would turn
low-probability hits into tiny repetitive pools. Family chassis and program tables are
the stronger correction.

## 3. Smithy translation

### Existing strengths

- `BUILDING_KITS.smithy` exists.
- It correctly delegates to `SHOP_ARCHETYPES.smith`, which owns weapons, armor,
  shields, inventory, coin, and pricing.
- The d300 contains exact smithy/armorer/coppersmith rows.
- It also contains many potentially compatible workshop hosts: attached domestic
  workshops, tinker's rooms, locksmiths, plumbers, cartwrights, clockmakers, kilns,
  generic workshops, the self-working workshop, and others.
- Dungeon Area Type includes an armory with smithy alcove and a dedicated forge; Urban
  Area Type also contains smithy/forge forms, though those urban rows are not wired
  into `rollUrbanWalk`.

### Missing control

A smithy request does not currently guarantee:

- customer/service edge;
- active work bay and safe hot/tool zone;
- forge, machine, or repair technology appropriate to the realm;
- fuel/power, raw material, quench/cooling, ventilation, waste/slag, and fire control;
- finished work, repair queue, commissions, records, and tool security;
- operator versus apprentice/customer/supplier roles; or
- a layout that can support the stock the shop system already rolled.

### Recommended architecture

Do not create a monolithic Smithy Interior d100.

Use:

```text
Shop/Workshop family chassis table
  + Workshop/Fabrication program profile
  + smith shop stock/economy
  + realm/culture production doctrine
  + current commission/pressure
  + smithy/workshop Spice table
```

The program should admit:

- Frontier smithy/armorer/coppersmith;
- Chrome machine shop or fabrication bay;
- Gloom repair shop, garage-like bay, or small metalworking shed; and
- unusual heatless, cold-metal, living-material, ritual, or self-working production
  only when world/Spice facts license it.

An exact `#11` smithy is a direct pass. `#262`, the self-working workshop, is a
compatible strange host if the program resolves what is being made, material flow,
tool danger, operator responsibility, service edge, and stock. A generic office with
no viable production/provider path should fail.

The smithy therefore needs a Shop/Workshop family layout table and a small
Workshop/Fabrication operation/Spice stack more urgently than it needs new d300 prose.
Reviewed d300 relationships may seed those tables with retained source refs.

## 4. Prison translation

### Existing strengths outside the d300

Prison is already a multi-source program:

- Place Spine Hall-of-law/Threshold/Watch-post plus jailhouse, precinct, and sheriff
  realm expressions;
- d300 gaol, holding office, and gaoler-house seeds;
- Dungeon Area Type cages, holding cells, guardrooms, barracks, armory, and
  `#150` Prison Block;
- authored-but-unwired Urban Area Type `#160` Suspended Cage and `#165` Prison Block;
- capture holding, disposition, confiscation description, and escape-opening sources;
  and
- the Site 6 Prison/Custody semantic grammar, repeated holding assemblies, property
  custody, routine, and outside-in/captured-inside proof contract.

That is stronger than three d300 rows make it appear. It is also why the d300 should
not be asked to generate a whole prison.

### Missing control

The live typed-building layer has no Prison/Custody request route. A single gaol row
also cannot by itself guarantee:

- authority and disposition;
- controlled custody boundary;
- oversight/control position;
- intake, release, transfer, visitation, and emergency routes;
- correlated cells/pens/wards and body capacity;
- staff and prisoner routines;
- property/evidence custody with exact item identity;
- food, water, sanitation, medical, exercise/work, and external providers; or
- precommitted social, procedural, secret/environmental, and forceful escape handles.

### Recommended architecture

Do not add thirty prison descriptions to the d300 and call that Site 6.

Use:

```text
place/capture custody commitment
  + dedicated Prison/Custody family premise and doctrine
  + repeated holding/topology sources
  + property/evidence and routine modules
  + doctrine/current-state transform
```

A future typed `custody` request seam is genuinely missing. Whether it is represented
as a new building kit or a higher-level program request should be decided against the
shared ontology, but it must invoke the dedicated Site 6 family/compiler obligations
rather than merely labeling an interior “Prison” or borrowing Civic/Authority rooms.

The next prison-specific table work should target missing decisions—not duplicate
rooms:

- custody host/rung;
- holding assembly and capacity;
- property/evidence realization;
- oversight/access technology;
- routine/service provider;
- disposition/current state; and
- protected escape/recovery handles.

The evidence room belongs in the property/evidence realization module. At low load it
may be a sealed cabinet or secure closet; at higher load a dedicated room or external
custodian. It should not be a mandatory room name in every d300 gaol.

## 5. Expansion rule for all building programs

Author coherent families first; use d300 tagging to preserve and mine legacy material.

For each first-class program, audit:

1. **Host breadth:** direct and compatible-reuse seeds.
2. **Obligation coverage:** no required relationship depends on one lucky row.
3. **Scale breadth:** service point/room, ordinary building, and complex where the
   program supports them.
4. **State breadth:** active, reduced, occupied, damaged, dormant, or transformed.
5. **Spice breadth:** ordinary plus licensed unusual expressions; not every program
   needs a Mythic row.
6. **Realm/doctrine breadth:** the same literal medieval form cannot carry every realm.
7. **Replay diversity:** seeded changed-context runs do not collapse onto a tiny set of
   repeated fingerprints.

When a gap appears, choose the narrowest repair:

| gap | repair |
|---|---|
| several programs share a real spatial relationship | family chassis table |
| one program needs distinct operation/current scene | program-specific layered tables |
| one conditional obligation lacks realization | targeted obligation/provider table |
| another current table already owns the topology | wire/reconcile that source |
| a useful d300 geometry has the wrong occupation | rewrite it as a neutral family relationship with source lineage |
| a complete d300 row is relevant only after repurposing | require explicit adaptive-reuse transform before drawing it |
| a single program needs many specialized repeated assemblies | keep them in the program compiler, not the general d300 |

This policy predicts:

- **No bulk d300 expansion yet.**
- **Yes** to seven coherent family chassis tables and small per-program layered tables,
  with Prison/Custody dedicated rather than grouped under Civic/Authority.
- **Yes** to a d300 sidecar for untyped preservation, source mining, and explicit
  adaptive reuse—not typed primary selection.
- **Yes** to a Shop/Workshop family plus Workshop/Fabrication profile for Smithy.
- **Yes** to a real Prison/Custody program request and its property/routine/holding
  modules.
- **Likely later review** for Guildhall, Garrison, Gambling Den, Bathhouse, and Arcanist
  after semantic tagging exposes their true compatible pools.

The returned roll cards strengthen that review requirement: the selected three-roll
cohorts for those types mostly landed in unrelated programs, and every same-seed realm
mirror retained the same interior. This is direct evidence that kit labels and the
d300 currently stack mechanically without walk-like semantic/flavor reconciliation.

## 6. Verification note

`node dev/verify-urban-fabric.mjs` passes 33/33 on this tree. It proves that Smithy
delegates to the existing shop system and that typed/untyped building calls preserve
their current shapes. It does not prove program-compatible interior selection.
