---
type: system-spec
created: 2026-07-26
updated: 2026-07-28
status: ACCEPTED DIRECTION — founder-ruled seven-family core; proposed eighth Market/Exchange taste sampler returned for founder disposition; live implementation deferred
owner: typed building generation
authority:
  - GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md
  - GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md
  - URBAN-FABRIC.md
evidence:
  - ../Reference/Building-Type-Roll-Study/
  - ../Reference/Tavern-Study/
related:
  - TAVERN-VENUE-ROUTING-BRIEF.md
  - SITE-6-PRISON-CUSTODY-SPEC.md
  - SITE-10-URBAN-INSTITUTION-SPEC.md
---

# BUILDING PROGRAM TABLE FAMILIES

## Direct answer

Typed buildings must not draw their primary interior from the flat general
`building-interior` d300.

The 42-roll audit proved that the existing stack is mechanically additive but
semantically unconstrained. A Manor can become a letter-writing shop or private
hospital; an Apothecary can become a printer's basement; a Garrison can become a
mast-maker or apothecary. Same-seed realm mirrors preserve the identical interior
under every realm label.

Adam's 2026-07-26 ruling replaces the earlier gate-first proposal:

> Building program constrains the interior. Typed generation may use separate tables
> for coherent building families and smaller layered dice. Tables may remain shared
> only where the relationship actually makes spatial and operational sense.

The new typed path is:

```text
committed building program
  → compatible family chassis
  → program-specific operating arrangement
  → current state and scene
  → context-biased, family/program-specific Spice
  → realm/culture realization
  → derived operator, cast, capacity, and details
  → validation and receipt
```

The general d300 remains a valuable untyped discovery table and authored source
library. It is no longer the primary typed-building layout selector.

## 1. Why a filter over the d300 is insufficient

A filter would prevent a Smithy from selecting a dispensary, but it would not create
the missing layered composition:

- only four d300 rows literally describe smithy/metalwork;
- only three describe prison/custody;
- several current types have similarly thin literal pools;
- realm labels do not alter spaces, technology, labor, or practices;
- a d300 row's occupant does not reconcile with the proprietor or ambient cast;
- the band cannot be requested from context and is not exposed in the returned payload;
  and
- repeatedly rejecting rows hides a weak generator behind retries.

The walks work because their layers have jobs. A skin, area, elevation, feature,
dressing, atmosphere, and light result each modifies a compatible surface. Typed
buildings need the same discipline.

## 2. Family map

Share a table only where the programs can honestly consume the same spatial
relationship.

| family | current programs | shared spatial grammar |
|---|---|---|
| `BF-PUBLIC-SERVICE` | Tavern, Bathhouse, Gambling Den | public arrival, recognition/payment, guest/customer area, service edge, controlled back/service route, egress |
| `BF-CIVIC-AUTHORITY` | Guildhall, Garrison, Court | public or member threshold, recognized authority, decision/assembly space, records, controlled interior, staff route |
| `BF-HOUSEHOLD-ESTATE` | Manor | household authority, reception, private life, service circulation, property/records, guests/dependents |
| `BF-RITUAL-INSTITUTION` | Temple | public/participant threshold, ritual focus, officiant/support, offerings/records, restricted sacred/service space |
| `BF-LOGISTICS` | Warehouse, Dock-House | receiving/dispatch edge, goods handling, storage, counting/records, staff control, vehicle/route relationship |
| `BF-SHOP-WORKSHOP` | Smithy, Apothecary, General Store, Arcanist | customer edge, transaction, stock, work/preparation where present, secure material, delivery/waste, operator position |
| `BF-CUSTODY` | Prison/Custody | authority claim, intake and property handoff, classification, holding assembly, control, service, routine, disposition, release/transfer, emergency and counterplay |
| `BF-MARKET-EXCHANGE` **(PROPOSED ADDENDUM)** | Market Hall, Exchange / Cloth Hall | public trading ground, stall/bay allocation, goods inspection and measure, price/record authority, market schedule, closure, delivery edge, and optional upper program |

These are authoring families, not runtime site identities. Tavern remains Tavern;
Manor remains Manor. A family table supplies compatible chassis relationships, never a
replacement program noun.

### Programs that need more than the family

- Tavern consumes the HospitalityVenue operating contract.
- Smithy consumes a Workshop/Fabrication profile plus the existing shop economy.
- Apothecary consumes preparation, consultation, storage, safety, and supply rules.
- Warehouse and Dock-House consume actual goods/vehicle/route throughput.
- Manor consumes a household/estate authority and service model.
- Market Hall consumes market/exchange ground-floor obligations and may compose a Civic,
  Logistics, or Exchange upper program without being reclassified as those families.

### Why Market/Exchange should be an eighth family

Site 10's Golden Seed is a Market Hall, and none of the founder-ruled seven families owns its
ground-floor program. `BF-CIVIC-AUTHORITY` can supply a council/court upper room;
`BF-LOGISTICS` can supply storage; neither owns public stall allocation, weights/measures,
market hours, inspection, exchange records, or open trading ground. Treating occasional civic
co-location as identity would recreate the d300 failure at family scale.

The proposed family shares an open-post/arcade trading chassis and permits explicit
compositions:

- **market ground + civic upper** — council chamber, court, guild authority;
- **market ground + logistics upper** — storage, sampling, weighing, dispatch;
- **market ground + exchange upper** — cloth/wool/commodity hall, records and bargaining; or
- **market ground only** — roofed public trading floor.

This is an adversarial-review direction, not a retroactive founder ruling. Its small taste
sampler has returned in `../Reference/Building-Family-Table-Samples/`: six chassis, two
program layers, three explicit Civic/Logistics/Exchange upper-program composition cards, and
four deterministic rolled receipts. Founder disposition remains required before
implementation.

### Why Prison/Custody is a dedicated family

Prison/Custody is not a Civic/Authority sibling with cells added. Site 6 already proves
that custody is a controlled lifecycle: authority admits identifiable people and
property, classifies and assigns them, sustains services and routine, applies a finite
disposition, and eventually releases, transfers, loses, or is defeated by them.

Its family chassis therefore owns:

- authority/public and intake/transfer edges;
- exact prisoner-property, evidence, contraband, and institution-property custody;
- classification and correlated holding assemblies with stable child identities;
- control, access, observation, keys/seals/wards, staff relief, and emergency release;
- food, water, waste, health, repair, movement, count, visit, hearing, and transfer
  routes or real external providers;
- disposition and continuity; and
- precommitted social/legal, routine/procedural, covert/secret, force/disruption, and
  licensed environmental counterplay.

It may borrow a court handoff, garrison checkpoint, logistics route, household host, or
workshop destination as a guest relation. Those systems do not own custody. A
one-room lockup is a legal Rung-A degradation of `BF-CUSTODY`, not permission to route
small prisons back through `BF-CIVIC-AUTHORITY`.

## 3. Layer stack

The exact die sizes are authoring decisions. Prefer d12 or d20 tables with legible,
reviewable responsibilities over a single giant table.

### Layer 0 — committed program, not a roll

The caller commits:

```text
programId
familyId
realm/culture
site/host context
requested scale
current use and any licensed transform
story obligations
world/region Spice context
```

Program invariants are hard constraints. A Manor requires household/estate authority
and service/private relationships. An Apothecary requires preparation/stock/customer
relationships. A Prison requires custody.

### Layer 1 — family chassis, usually d20

One table per family. Rows are neutral compatible relationships, not occupations from
another program.

Example `BF-SHOP-WORKSHOP` chassis:

```text
street counter → rear workroom → secure store → service yard
open work bay + customer edge + side materials room
domestic front room + attached workshop + rear delivery
arcade stall + shared back service + offsite store
corner shop + screened consultation/work alcove + cellar
yard-front workshop + office/counter + covered materials shed
```

The row declares:

```text
requires · provides · capacity band · access shape · service faces
legal program tags · legal arrangement tags · scale tags · realm/host tags
forbidden uses
```

Family membership establishes a common legal floor; it does not claim every detailed
arrangement fits every physical expression. A road inn may require a lodging-capable
Public-Service chassis, a production forge may require a bulk/hazard-capable
Shop/Workshop chassis, and a ferry house may require a true vehicle/water loading edge.

The resolver forms the eligible `(program arrangement, family chassis)` pair domain
from explicit `requires`/`provides` and legal-id/tag facts before random selection.
It does not roll an incompatible pair and ask the DM to reconcile it. The receipt
records the eligible pair and the constraints that admitted it.

### Layer 2 — program arrangement, one d12/d20 per building type

This is where Smithy stops being Apothecary and Manor stops being generic residence.

Examples:

```text
manor-arrangement
  resident household with stewarded public reception
  absentee owner with bailiff and records
  multigenerational household with competing private thresholds
  official residence with petition/hearing use
  seasonal estate with reduced permanent staff

apothecary-arrangement
  retail dispensary with rear compounding
  consultation practice with screened waiting
  domestic herbal practice with garden/drying provider
  market counter with licensed offsite laboratory
  clinic-apothecary with treatment and medicine records

smithy-arrangement
  repair smith with customer queue
  production forge with commission book
  armorer with fitting and secure stock
  farrier with yard/animal route
  machine or fabrication shop with powered work bays
```

Each row adds obligations and roles. It cannot delete the program's invariants.

### Layer 3 — operating state, shared within family or program

Possible axes:

- normal service;
- opening/closing or shift change;
- backlog/rush;
- low stock or failed supply;
- inspection, hearing, ceremony, delivery, or private event;
- repair, reduced service, damage, occupation, or dormancy; and
- current transform already committed by story.

Operating state changes furniture position, access, population, sound, light, and
available services without changing the building into another program.

### Layer 4 — current scene/activity, d20 per program or tight family

This supplies what the player walks into:

- named operator/staff activity;
- customers, petitioners, guests, patients, members, guards, prisoners, suppliers, or
  household activity appropriate to program;
- a current transaction, delay, dispute, task, or routine; and
- one hook bound to the actual cast/world.

The operator role is selected from the program's role model. `roleHint` is not treated
as an occupation constraint.

### Layer 5 — program/family Spice, context-biased d20

Spice modifies a valid building; it does not replace it.

The world/walk/region Spice tier selects or biases the allowed band before the row is
drawn. Every row names its band and program surface.

Examples:

```text
Manor
  Grounded: two household account books disagree about one dependent
  Textured: a reception room exists in household records but not the filed plan
  Strange: ancestral portraits answer only questions they could have heard in life
  Volatile: one private threshold recognizes a disputed heir as the owner

Apothecary
  Grounded: a renewable prescription bears a dead physician's signature
  Textured: the cold store remains cold without a visible mechanism
  Strange: remedies consistently treat a different mapped condition than their label
  Volatile: a preparation transfers one symptom into the next person who enters

Smithy
  Grounded: an expensive commission remains uncollected
  Textured: a sealed chimney implies an inaccessible former hearth
  Strange: tools return to their places and continue the dead master's work
  Volatile: metal worked here refuses to cross one threshold while hot

Prison/Custody
  Grounded: one cell can be opened from inside due to a known maintenance fault
  Textured: a custody room is present in records but absent from the public plan
  Strange: one lock recognizes legal disposition rather than its physical key
  Volatile: the holding changes destination at shift change but preserves its prisoners
```

Spice rows carry `requires`, `affects`, `preserves`, and `forbids`. They may not mint an
unbound cult, portal, faction, owner, hidden wing, or person.

### Layer 6 — realm/culture doctrine

Realm is a transformation of technology, material, labor, practice, etiquette, and
spatial emphasis—not just the sign.

Examples:

| program | Frontier | Chrome | Gloom |
|---|---|---|---|
| Smithy | forge, fuel, quench, farrier/armorer | machine shop, power, ventilation, fabrication bays | repair shop, garage/shed, parts, service counter |
| Apothecary | herbs, compounds, consultation, drying/store | unlicensed clinic, cold storage, disposables, diagnostic equipment | drugstore/clinic, prescription counter, stock room, back consultation |
| Manor | landed or mercantile household/estate | penthouse/compound with controlled service access | old family place with household, local claims, service outbuildings |
| Court | magistrate/notary/hearing hall | arbitration floor, corporate/security access, records systems | county courtroom, clerk/records, sheriff adjacency |

Doctrine changes the realization of already-selected semantic roles. It cannot turn an
Apothecary into a Printer or a Manor into a Hospital.

### Layer 7 — derived population, capacity, and detail

Population is derived from:

- active arrangement and state;
- usable capacity;
- staff/household needs;
- schedule;
- current scene; and
- story-bound people.

The source no longer rolls an unrelated proprietor plus an unrelated authored
occupant. Roles are filled deliberately:

```text
controller/owner
operator/responsible person
staff/household
customer/guest/member/patient/prisoner/etc.
supplier/visitor
```

One person may fill several roles at small scale.

## 4. What happens to the general d300

The d300 is preserved, but its typed authority changes.

### Still valid

- untyped “we enter a building; what is inside?” generation;
- strange discovered buildings whose program is not precommitted;
- source mining for family/program rows with retained provenance;
- explicitly selected adaptive-reuse history after a transform is committed; and
- regression evidence and old-save source lineage.

### No longer valid

- primary interior selection for a precommitted typed building;
- retry-until-compatible typed generation;
- allowing its occupation noun to override the requested program;
- treating a relabel as realm transformation; or
- silently reconciling its source occupant with separately rolled cast.

Existing rows can seed new tables in three ways:

1. **Direct migration.** A true Manor, Tavern, Smithy, Apothecary, Gaol, etc. row is
   adapted into that program/family table with its original source ref.
2. **Relationship extraction.** A useful geometry or feature is rewritten as a neutral
   compatible relationship. The printer's basement window can inspire a
   below-grade/light-well chassis, but “printer” and the printer occupant do not enter
   an Apothecary roll.
3. **Explicit transform.** The whole original row remains atomic only when
   `adaptive-reuse` was selected first and the new program proves every displaced
   obligation.

Typed generation never has to ask the DM to explain an accidental mismatch.

## 5. Manor correction

A Manor roll first establishes a household/estate, not an arbitrary building.

Minimum invariants:

- controlled arrival and recognition;
- public/reception relationship;
- household/private relationship;
- service/labor route and supplies;
- authority/property/records;
- credible sleeping, sanitation, food, and egress at the selected scale; and
- resident, steward, bailiff, caretaker, or other accountable controller.

Example layered result:

```text
program: Manor
family chassis: compact urban house with public front, household upper rooms,
                rear service court, separate staff stair
arrangement: absentee owner; steward conducts estate business
operating state: petition day; front rooms active, private floor restricted
current scene: two tenants dispute a boundary while a clerk searches the rent roll
Spice: ancestral portraits answer only matters discussed in their hearing while alive
realm doctrine: Gloom — The Old Family Place
```

Every layer is about the same manor. A private hospital may appear only as a licensed
service wing/current crisis inside an already valid manor, not as its foundational
layout roll. A letter-writing shop may occupy one frontage only through an explicit
mixed-use or former-use transform.

## 6. Apothecary correction

Minimum invariants:

- customer/recognition edge;
- preparation or real external preparation provider;
- stock and secure/controlled substances;
- consultation/instruction as the service requires;
- water, heat/cold, ventilation, sanitation, and waste appropriate to practice;
- records/payment where present;
- responsible practitioner/assistant; and
- truthful egress.

Example layered result:

```text
program: Apothecary
family chassis: corner shop with front counter, screened consultation alcove,
                rear preparation room, cool cellar, service-yard door
arrangement: prescription dispensary with one visiting physician
operating state: low stock after a delayed delivery
current scene: an assistant prepares a renewal signed before the physician died
Spice: the cold cellar holds temperature without a visible mechanism
realm doctrine: Chrome — Unlicensed Clinic
```

The useful basement/window geometry from a printer row may become a reviewed chassis
relationship. The printer, press, proofing occupation, and printer occupant do not.

## 7. First authoring slate

Do not author all tables at once.

### Proof Pair A — Manor

Author:

1. `building-family-household-estate-layout` d20;
2. `building-manor-arrangement` d20;
3. `building-manor-current-scene` d20; and
4. `building-manor-spice` d20 with explicit bands.

Run at least:

- 20 ordinary rolls;
- 8 changed-realm mirrors;
- 8 high-Spice rolls; and
- 4 adversarial small/large/current-state combinations.

Reject any result that does not read as a functioning Manor before the DM interprets
it.

### Proof Pair B — Apothecary

Author:

1. `building-family-shop-workshop-layout` d20;
2. `building-apothecary-arrangement` d20;
3. `building-apothecary-current-scene` d20; and
4. `building-apothecary-spice` d20.

Reuse the existing Apothecary shop stock/economy. Prove Frontier Apothecary, Chrome
Unlicensed Clinic, and Gloom Drugstore as materially different realizations of the same
program.

### Then expand the shared family

Once Shop/Workshop passes Apothecary:

1. add Smithy/Workshop operation and Spice;
2. add General Store operation and Spice;
3. add Arcanist operation and Spice; and
4. prove no sibling program inherits another sibling's occupation or safety model.

Then author the Public-Service/Hospitality, Civic/Authority, Logistics, and
Ritual-Institution stacks against their retained before-state receipts.

### Dedicated Custody track

Prison/Custody does not wait for or inherit the Civic/Authority table. Its eventual
table/compiler work is governed by `SITE-6-PRISON-CUSTODY-SPEC.md`:

1. `building-family-custody-premise` chooses a coherent custody form and rung;
2. custody doctrine correlates authority, organization, access, property, service,
   routine, force, and failure;
3. capacity/load expands obligations into combined, dedicated, distributed, or real
   external realizations;
4. repeated holding children are derived from one parent assembly;
5. disposition, property lifecycle, and counterplay are committed before entry; and
6. realm/material adapters transform the retained operating model without deleting
   mundane support, service, failure, or release truth.

The first matched proof remains `PR-DOC-01 — Keeper-House Civic Custody` against
`PR-DOC-02 — Ledger-and-Shift Civic Custody`, followed by Rung-A degradation, Rung-C
promotion, and the retained suspended living-ironwood solitary fixture.

### Returned family taste sampler

`../Reference/Building-Family-Table-Samples/` contains deliberately small sample
tranches for the founder-ruled seven families, every current program, and the proposed eighth
Market/Exchange family, plus deterministic rolled receipts. The sampler enforces explicit
arrangement/chassis compatibility, context-only rows such as licensed exceptional custody,
and three legal upper-program composition cards. They are taste evidence, not final d20
authoring or live compilation.

## 8. Acceptance tests

For every typed program:

1. **Identity:** 100/100 rolls read as the requested building before DM interpretation.
2. **Obligations:** every hard program relationship is provided or has a real
   receipted external provider.
3. **Layer ownership:** no table overwrites another layer's noun.
4. **Spice:** every unusual result intensifies a valid program surface.
5. **Realm:** same semantic seed changes technology/practice/realization, not just label.
6. **People:** controller, operator, staff, visitors, and source scene roles reconcile.
7. **Capacity:** population follows the selected layout/operation/state.
8. **Progressive detail:** inspection resolves the same committed building.
9. **Changed seeds:** output does not collapse to one canonical plan.
10. **Before/after:** replay the 42-roll cohort and report selection/rejection,
    preserved atoms, and why the new result is valid.

The DM may interpret motives and consequences. The DM must not have to repair the
building program.

## 9. Implementation boundary

This document changes the accepted generation direction. The seven-family sample
tables and their pure deterministic sampler are authorized evidence. It does not
authorize live table compilation or caller changes during the active CL-R3 lane.

The proposed eighth Market/Exchange addendum remains a specification correction only. Its
taste sampler has returned; it is not authorized for live compilation until founder
disposition.

The first implementation unit after serialization is the Manor/Apothecary authoring
pair. Prison/Custody follows its dedicated Site 6 proof ladder rather than that generic
implementation unit. Do not begin by editing all fourteen kits or rewriting the d300.
