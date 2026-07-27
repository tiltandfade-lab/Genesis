---
type: routing-brief
created: 2026-07-26
updated: 2026-07-26
status: ACCEPTED DIRECTION — typed family-table architecture founder-ruled; implementation unauthorized
owner: tavern host-program routing
authority:
  - GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md
  - BUILDING-PROGRAM-TABLE-FAMILIES.md
  - URBAN-FABRIC.md
  - BATTLEMAP-TOWNTRAY-COMPOSITION.md
related:
  - GOLDEN-SITES-CATALOG.md
  - GOLDEN-SITES-PROOF-QUEUE.md
  - SITE-2-CAMP-SERVICE-SPEC.md
  - SITE-4-MONASTERY-COMMUNE-SPEC.md
  - SITE-10-URBAN-INSTITUTION-SPEC.md
  - ../Reference/Tavern-Study/
---

# TAVERN VENUE ROUTING BRIEF

## Direct answer

No numbered Golden Site exclusively owns taverns.

A tavern is a first-class **ordinary venue/host program**. Its setting determines which
site family helps express it, and cross-host transforms may change its current state:

| Tavern expression | Primary routing |
|---|---|
| Roadside alehouse, relay inn, travelers' waystation | Tavern program inside Site 2 route-service grammar |
| Town tavern, diner, noodle bar, public house, lodging frontage | Tavern program inside Site 10 urban frontage/fabric |
| Courtyard inn, hostel, guesthouse attached to an institution | Tavern/lodging guest program consuming Site 4 chassis where licensed |
| Tavern with public and covert control systems | Tavern program + Site 8 `LayeredControl` transform |
| Closed, abandoned, burned, or haunted tavern | Tavern program + Site 3 dormant/abandoned transform |
| Tavern room entered from a dungeon-like settlement or undercity | Tavern program reached through dungeon walk; not a new tavern family |

Site 2 therefore does not own every tavern, and Site 10 does not own every tavern.
They provide different host contexts and spatial expressions for the same program.

Because taverns are a likely high-frequency player destination and touch social play,
rumors, rest, lodging, commerce, downtime, encounters, and combat promotion, Genesis
will retain `VENUE-TAVERN-01` as its first **Golden Venue fixture**. This is not Golden
Site 13.

## 1. Current runtime audit

The tavern is not absent from Genesis. The 2026-07-26 audit found:

| Source/path | Status | Current behavior |
|---|---|---|
| Place Spine #2 `Watering-hole` | `LIVE` through `rollPlace` / `placeForRealm` | Drink, food, talk, feud adjacency; roomy site program |
| Place Spine #11 `Lodging` | `LIVE` through `rollPlace` / `placeForRealm` | Beds for strangers and a ledger of passage |
| `data/place-skins.js` | `LIVE` | Realm-skinned labels plus tavern ambient bucket and archetype dressing |
| `data/building-kits.js` `tavern` | `LIVE` through `rollBuilding` | Typed Tavern/Noodle Bar/Diner kit with hospitality function, proprietor hint, lodging economy tie, rumor hook, and name pattern |
| `src/world/urban.js` building lifecycle | `LIVE` | Soft mint on approach; hard lock on contact; rolled proprietor; ambient cast |
| Tavern name | `LIVE` through the kit's `namePattern` | Extracted Tavern 2.0 name content supplies the building name |
| Tavern encounter | `LIVE` through `tavernEncounterRoll` on contact | Chance-gated ambient event |
| Distant Word | `LIVE` on tavern contact | Reuses the existing distant-fact mechanism |
| Carouse / lodging ownership | `LIVE-COMPOSED` | Existing downtime and lodging paths use the tavern as their venue/owner surface |
| General `building-interior` d300 | `LIVE` | Supplies one broad, authored layout/feature/occupant scene seed; the typed tavern caller does not yet constrain compatibility |
| Extracted sensory, foundation, barkeep, and in-media-res tables | `AUTHORED-UNWIRED` for the typed-building contact path unless named above | Compiled source exists, but the current path does not consume every chain |
| Shared tavern composition recipe | `TARGET-ADAPTER` | `BATTLEMAP-TOWNTRAY-COMPOSITION.md` specifies the recipe family; no Golden-grade semantic/spatial venue fixture exists |

The live evidence is executable: `node dev/verify-urban-fabric.mjs` passed **33/33** on
2026-07-26, including typed minting, rolled proprietor, soft-to-hard persistence,
Distant Word, Tavern 2.0 table-extraction preservation,
`gen kind:"interior" opts.type:"tavern"`, shop non-regression, and null-safe fallback.
`node dev/verify-place-relabel.mjs` separately passed **15/15**, including complete
Tavern → Noodle Bar / Diner realm relabeling and the no-realm regression.

`URBAN-FABRIC.md` had retained its initial “specced / zero wiring” header after the
implementation landed. This pass corrects that documentation; it does not claim that
the spatial venue compiler is built.

### 1.1 Founder rulings — preserve the d300, constrain typed interiors

Adam's 2026-07-26 direction is explicit: the tavern path appears to have been rebuilt
as a general interior roller; do not throw that technology away. Modify it so callers
can control what they need and increase detail, either through decomposition or gates.

The first response proposed a gated d300 hybrid. The later 42-roll all-building cohort
showed that this was not enough: the pools would remain thin, realm would remain a
label, and the layers would not compose like the walks.

Adam's superseding direction is that building program must constrain the interior.
Separate tables for coherent building families and several smaller layered dice are
preferred where they make semantic sense.

Therefore:

- raw d300 access remains for untyped discovery and explicit adaptive reuse;
- Tavern uses the `BF-PUBLIC-SERVICE` chassis family plus HospitalityVenue-specific
  arrangement, current-scene, and Spice tables;
- family layout rows are shared only with programs that can truthfully use the same
  public/service/back-of-house relationships;
- source Tavern rows may migrate into those tables with their lineage;
- realm/culture changes realization and practice, not merely label; and
- progressively deeper detail resolves the same committed layered result.

The current authority is `BUILDING-PROGRAM-TABLE-FAMILIES.md`.
`INTERIOR-GATING-PROPOSAL.md` is retained only for d300 preservation, explicit
adaptive-reuse receipts, and historical rationale.

## 2. Tavern program contract

A tavern exists to provide some combination of:

- public hospitality and a socially legible front door;
- drink and/or food service;
- proprietor or responsible staff;
- a common social space;
- rumor, news, introductions, and local recognition;
- payment, credit, tabs, barter, or patronage;
- supplies, storage, waste, water, heat, and closing routines; and
- a place where strangers, locals, factions, and trouble can meet.

The following are conditional, not universal:

- overnight lodging and guest records;
- kitchen, cellar, pantry, brewery, stable, yard, privy, bath, stage, gambling, shrine,
  private rooms, meeting rooms, job board, security, or illicit service;
- a separate bar counter;
- alcohol;
- one cultural or historical building form; and
- a medieval-fantasy appearance.

The realm and culture may express the program as an alehouse, teahouse, diner, noodle
bar, roadhouse, boarding house, feast hall, club, canteen, bath-and-meal house, or
another licensed hospitality venue. The program is defined by operating relationships,
not the English word “tavern.”

## 3. Semantic obligations

The smallest semantic tavern plan needs:

1. a public arrival and recognition point;
2. a service relationship between guests and responsible staff;
3. a place to consume, converse, wait, or transact;
4. a supply/waste path, even if abstracted or externally provided;
5. current hours, access, capacity, and service state;
6. attributed proprietor/staff and present cast;
7. one truthful egress; and
8. stable homes for any committed rumor, job, debt, faction claim, guest, property,
   secret, or encounter.

Lodging adds:

- guest sleeping capacity;
- privacy and access rules;
- guest property and payment;
- a service/sanitation path; and
- a record, memory, or responsible witness where the rolled fiction requires one.

These obligations may share a small room. A counter can be a table or hatch; supplies
can be offsite when a real provider and route exist; sleeping can be a common loft.
Semantic roles remain distinct even when their physical realization overlaps.

## 4. Scale and transformation ladder

Map size follows obligations and context, not the word tavern.

| Expression | Typical materialization |
|---|---|
| `TV-0 service point` | One counter, table, hatch, fire, cart, or borrowed room; no lodging required |
| `TV-1 common room` | Public room, service edge, proprietor, supplies, egress; social play in one compact window |
| `TV-2 tavern + lodging` | Common room plus guest capacity and one private/service separation |
| `TV-3 inn complex` | Several guest/service zones, yard or stable where licensed, multiple access profiles |
| `TV-4 civic social anchor` | Large hall, several activity knots, cold/ambient population, district or route relationships |

Promotion is not automatic with player level. It occurs when rolled clientele, service
range, lodging, staff, throughput, security, faction, event, or site-host obligations
need the added capacity.

Degradation and repurposing remain legal:

- an inn can lose lodging but remain a common room;
- a common room can become a ration point, meeting hall, refuge, clinic, or occupied
  checkpoint;
- a closed tavern retains architecture, records, debts, residue, and remembered
  relationships;
- a destroyed building does not erase the venue's identity or consequences.

## 5. Layered-control tavern

The smallest Site 8 proof is deliberately compact:

> The proprietor controls the public room and official service. A second claimant
> controls the back room, deliveries, and who receives private introductions.

This can fit in one small tavern:

- public room and back-room threshold;
- two recognition profiles;
- shared fixtures with different permissions;
- a schedule or signal that changes access;
- visible tells and hidden evidence;
- social, stealth, payment, betrayal, exposure, and forceful options; and
- no invented basement or faction wing.

If the story adds enough staff, captives, contraband, meetings, protected guests, or
separate operations that the window cannot support them honestly, the normal semantic
overflow law applies. Expansion requires prelicensed capacity or a real external
provider.

## 6. `VENUE-TAVERN-01` retained fixture

The first Golden Venue fixture should be an ordinary, real-roll tavern reached through
an urban or route-service context. It must prove the same committed venue in:

1. social SceneTray presentation;
2. exploration/interaction presentation;
3. BattleMap promotion after a plausible escalation; and
4. a layered-control variant applied as a transform, not a separate tavern generator.

### Required retained facts

- world/place/realm receipt;
- Watering-hole, Lodging, or typed-building lineage;
- proprietor, staff, ambient cast, and capacity;
- arrival, public, service, supply/waste, private/guest, and egress roles that apply;
- hours, access profiles, recognition, services, payment, and current event;
- all committed rumors, jobs, debts, property, secrets, and claimant facts;
- stable zone, threshold, fixture, object, and actor ids;
- tactical reservations that remain dormant during social play;
- materialization, transform, asset-resolution, and fallback receipts; and
- context-off/on captures with identical venue mechanics.

### Strategic proof

The ordinary fixture must support at least:

- a social plan using staff, patrons, reputation, payment, rumor, or service;
- an access/information plan using timing, private thresholds, observation, or a
  relationship;
- a safe exit or retreat; and
- an honest forceful escalation if the story produces one.

The layered-control version must add at least two viable non-identical resolutions
without requiring a larger map.

### Visual proof

Retain clay, tactical, and dressed captures under the fixed production camera. The
venue should read through:

- entry and public/service organization;
- a small number of strong furniture/fixture masses;
- circulation and quiet floor;
- motivated daylight, hearth, lamp, signage, or other source-backed light;
- present people and their social grouping; and
- realm/culture construction rather than a generic fantasy-tavern backdrop.

Exact assets may fall back to truthful proxies, but the service edge, heat/light source,
private threshold, and any mechanically relevant furniture must not become invisible.

## 7. Proof relationships to the numbered sites

`VENUE-TAVERN-01` is shared evidence:

- **Site 2** proves its route-edge/waystation expression and service frontage;
- **Site 10** proves its urban frontage, public fabric, and ambient/cold-population
  relationship;
- **Site 8** proves the `LayeredControl` transform on a tiny host;
- **Site 3** may later prove dormant transformation over the same committed host; and
- **Site 4** may reuse the lodging/guest obligations for a licensed courtyard inn
  without claiming that every tavern is an institution.

Passing the tavern fixture does not make those sites `CLAY-PROVED`. It proves the common
venue path they consume.

## 8. Explicit non-goals

This brief does not authorize:

- a Tavern-only scene renderer;
- a thirteenth Golden Site;
- a single universal tavern floor plan;
- forced lodging, alcohol, hearth, stable, cellar, or bar in every hospitality venue;
- automatic faction conflict because two groups are present;
- a surprise room or exit added after observation;
- replacement or destructive decomposition of the shared `building-interior` d300;
- use of the flat d300 as the typed Tavern's primary interior selector;
- family-table sharing between programs that do not share spatial obligations;
- replacement of live `rollPlace`, `rollBuilding`, downtime, lodging, or encounter
  paths; or
- implementation changes during the active CL-R3 construction lane.

The next implementation task is not “build every tavern.” It is to compile one live
tavern record into the shared semantic/composition path and retain the result.

## 9. Real-roll and research return

The 2026-07-26 Tavern Study retained twelve deterministic receipts across Frontier,
Chrome, and Gloom:

- seven Watering-hole and five Lodging place contexts;
- four Tavern, four Noodle Bar, and four Diner typed labels;
- a named venue, proprietor record, two to four ambient people, guaranteed NPC hook,
  Distant Word result, and soft→hard lifecycle in every sample; and
- four chance-gated ambient encounters.

The same receipts expose the current control gap precisely:

- only **1/12** ungated typed calls selected an interior explicitly describing a
  tavern;
- **0/12** rolled proprietor occupations identified a hospitality operator;
- all **8/8** Chrome/Gloom names retained the same English-fantasy
  adjective-and-creature naming grammar; and
- place, interior, proprietor occupation, hook, cast, rumor, and Tavern 2.0 depth rolls
  do not currently reconcile into one operating venue.

These are retained baseline failures of typed selection/reconciliation, not grounds
to discard the rolls or the broad interior technology. A former workshop, post office,
great hall, or shopfront can become a compelling adaptive-reuse venue, but only when
an explicit adapter records the former use, physical changes, remaining constraints,
current service model, and providers. The renderer or DM may not silently rename
every unresolved combination “adaptive reuse.”

The cross-tradition research supports **HospitalityVenue** as the underlying host
program. Food, beverage, lodging, meeting, entertainment, news, transport support,
exchange, and community service are composable services. Alcohol, bar, lodging,
courtyard, stable, cellar, kitchen, and stage remain conditional. Culture/doctrine
must change service ritual, seating/sharing, recognition, schedule, payment, labor,
public/private separation, equipment, and spatial priorities—not merely label and
props.

The full evidence and proposed compiler contract live in
`../Reference/Tavern-Study/`, with the cross-program roll proof in
`../Reference/Building-Type-Roll-Study/`. The accepted successor architecture in
`BUILDING-PROGRAM-TABLE-FAMILIES.md` preserves the raw d300 while moving typed Tavern
generation to coherent family and program layers.

### Recommended first retained seed

`TVR-CHROME-04` is the strongest first fixture candidate:

- The Dorsal Market;
- a noodle bar under the rail line;
- source name The Golden Dolphin;
- a self-working former workshop;
- Rose Tosscobble, currently rolled as a laborer/porter/dockhand;
- three ambient people;
- a map-selling urchin at entry; and
- a Distant Word distortion bound to a real bridge-closure fact.

This is a recommendation, not a founder lock. `TVR-GLOOM-01` and
`TVR-FRONTIER-04` are the changed-seed and lodging/adversarial companions proposed by
the research packet.
