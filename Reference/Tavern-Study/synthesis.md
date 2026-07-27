# Tavern / Hospitality Venue study — synthesis

date: 2026-07-26  
status: Hospitality synthesis retained; typed interior correction superseded by family-table ruling

## 0. Direct answer

Genesis has enough tavern content to make a memorable scene, but not yet enough
causal structure to make a truthful venue.

The right correction is not a larger Tavern table. It is a shared
**HospitalityVenue** program that reconciles story facts, host context, operating
practice, capacity, cultural doctrine, and spatial obligations. Tavern, diner, noodle
bar, coffeehouse, teahouse, inn, boarding house, meal counter, and route lodge become
expressions of that program where the setting warrants them.

The old content remains valuable as prompts downstream of the new contract. The broad
`building-interior` d300 remains valuable for untyped discovery, lineage, source
mining, and explicit adaptive reuse. The 42-roll successor audit proved it should not
remain the primary typed interior selector; Tavern now consumes a coherent
Public-Service family chassis and Hospitality-specific layered tables.

## 1. Cross-source invariants

The research cohort does not yield one room list. It yields recurring relationships.

### 1.1 A venue has an accountable host

The host may be an owner-operator, tenant, manager, household, institution, community,
guild, faction, concessionaire, or staff collective. The person at the counter is not
automatically the owner.

Required distinction:

```text
property/control owner
  ≠ operating authority
  ≠ shift lead / responsible host
  ≠ service staff
  ≠ supplier
  ≠ lodging witness or keeper of records
```

One person may fill several roles in a tiny venue.

### 1.2 Service mix precedes room names

Possible services:

- prepared food;
- beverage, alcoholic or not;
- lodging;
- animal, vehicle, or cargo support;
- meeting, deliberation, hiring, or news;
- entertainment, gaming, ceremony, or performance;
- bathing, laundry, mail, market, work, or community service; and
- controlled, covert, or illicit exchange when a real claim licenses it.

The service mix determines equipment, staff, schedule, supply, waste, access, and
space. “Bar + common room + kitchen” is one outcome, not the root.

### 1.3 Public, private, and service are relational zones

Even one-room venues need distinguishable relationships:

- arrival/recognition;
- guest/public use;
- service transaction;
- staff or household control;
- supplies and waste;
- private meeting or lodging where present; and
- egress.

These roles may overlap physically. A hatch can be arrival and service; a table can be
counter and communal dining; food can arrive from a licensed external kitchen.

### 1.4 Context chooses the host family

Observed and synthesized host relationships include:

| host relation | strongest evidence | likely Genesis expression |
|---|---|---|
| street counter + rear service | Pompeii thermopolia | meal/drink service point, market or dense urban frontage |
| converted dwelling / domestic public house | Colonial Williamsburg tavern reports | small neighborhood tavern, boarding house, home restaurant |
| street-front hall and yard | English route inn | coaching inn, town inn, civic reuse |
| secure route compound/network | Persian caravanserai | caravan, pilgrimage, trade, or dangerous-route hospitality |
| enclosed cold-climate hall | ICOMOS caravanserai comparison | storm refuge, mountain inn, communal lodge |
| shade/airflow cross-plan without courtyard | ICOMOS Gulf comparison | hot-humid route or port lodging |
| under-infrastructure frontage | Japanese government izakaya profile | Chrome rail/viaduct noodle bar or compact after-shift venue |
| coffee/tea social institution | British Museum, UNESCO ICH, Met | news house, debate room, guest ritual, ceremony, teahouse |
| institution/community service host | Historic England pub guidance | post, library, meeting, market, work, relief, civic service |

The same service mix can inhabit several hosts. The same host can change use over time.

### 1.5 Schedule changes the venue

Breakfast, midday counter service, after-work rush, travelers' arrival, market day,
private feast, night lodging, closing, and staff cleanup produce different:

- crowd size and mix;
- available services;
- furniture state;
- permissions;
- information;
- risks;
- lighting;
- sound; and
- tactical reservations.

“The diner that closes at 9 sharp” is therefore an operating fact, not flavor text.

### 1.6 Capacity is a result

Capacity must be computed from:

- usable guest area and seating/standing practice;
- service throughput and staff;
- beds or sleeping custom;
- event mode;
- access and egress;
- host and climate constraints;
- animals/cargo/vehicles where present; and
- abstracted or external service providers.

Attendance then rolls within current capacity and schedule. It never determines space
retroactively.

### 1.7 Hospitality is also information and power

Coffeehouses, teahouses, inns, taverns, caravanserais, and community pubs can mediate
news, status, law, exclusion, ceremony, credit, hiring, protest, meetings, and
cross-cultural contact. These are operating relationships, not an automatic faction
overlay.

Layered control becomes legal when two claims touch different venue surfaces:

- property versus operation;
- public room versus deliveries;
- day shift versus night function;
- official service versus private introductions;
- host household versus creditor;
- permit authority versus community custom; or
- lodging register versus guest privacy.

## 2. Proposed semantic contract

The proposed engine output is one `HospitalityVenueProfile`. Names are illustrative;
the contract, not this spelling, is the decision.

```text
HospitalityVenueProfile
  identity
    venueId, persistent siteId, hostSiteId
    realm, region, cultures
    sourceRollRefs, rollerLineage
    state: active | reduced | private-event | closed | occupied | dormant

  host
    relation: street-counter | converted-house | hall | courtyard-route
              | enclosed-route | arcade | under-infrastructure
              | institutional-guest | mobile/borrowed
    fabric, access faces, licensed overflow/providers

  interior
    selected building-interior row and verbatim source
    gate class, adaptation, retained feature and occupant
    derived zones/thresholds and external providers

  operation
    controller, operator, responsibleHost
    staff/household roles
    services[]
    schedule and current service state
    payment, credit, price, permit, records
    supply/water/heat/waste/sanitation/laundry routes

  public
    clientele mix, regularity/transience
    recognition and etiquette
    current attendance and capacity
    social functions and current beat

  obligations
    semantic zones and thresholds
    lodging/privacy/property if present
    animal/cargo/vehicle support if present
    egress and safety

  claims
    faction/control/debt/ownership/access claims
    bound rumors, facts, evidence, objects, jobs, secrets

  presentation
    realm/culture doctrine cards
    sensory consequences
    materialization window
    tactical reservations
    asset/fallback receipts
```

Nothing here requires a large map. A street counter can satisfy the contract through
one public edge, one service edge, one rear provider, one responsible host, and one
exit.

## 3. Generation order

The research supports this order:

1. **Bind story intent.** Is the player seeking food, lodging, news, a person, a
   meeting, work, rest, concealment, or merely “a tavern”?
2. **Resolve place and host context.** Retain the real Watering-hole/Lodging/place
   roll, route/street relationship, host site, realm, culture, and current state.
3. **Choose service mix and social function.** Alcohol and lodging remain optional.
4. **Resolve operator model and claims.** Establish property, operation, responsible
   host, staff/household, permits, debts, and competing control.
5. **Resolve schedule/current mode.** This sets active services and attendance band.
6. **Apply culture/doctrine cards.** Change etiquette, ordering, sharing, seating,
   privacy, recognition, vessels, payment, time, labor, and spatial priorities.
7. **Derive obligations and providers.** Public/service/private, supply/waste,
   sanitation, lodging, cargo, property, records, and egress.
8. **Roll a compatible Public-Service chassis and Hospitality arrangement.** Use
   family/program current-scene and contextual Spice layers. A whole d300 row enters
   only after an explicit adaptive-reuse transform and must state what changed and
   where displaced obligations went.
9. **Compute capacity, then attendance.**
10. **Bind people and current action.** Assign real operator/staff roles; cast patrons;
    bind Distant Word/current event to codex and ledger.
11. **Materialize the requested window.** SceneTray first where possible; retain
    dormant tactical reservations; promote without changing ids.
12. **Validate and report fallback.** Reject or relax impossible combinations
    explicitly.

Tavern 2.0's progressive disclosure can wrap this order:

- **quick:** steps 1–6 plus responsible host and current beat;
- **linger:** obligations, recipe, capacity, attendance;
- **investigate:** claims, property, records, evidence, supply, private thresholds;
- **escalate:** tactical reservations and BattleMap promotion.

## 4. Culture/doctrine cards

Culture cards must not be direct labels for real peoples. They are evidence-backed
institutional answers that a fictional culture may weight and combine.

Each card should alter at least:

```text
host preference
service ritual
seating/standing/sharing practice
public/private relationship
recognition and guest etiquette
schedule
operator/household pattern
supply/equipment
payment/credit/custom
social function
sensory consequences
```

Initial cards suggested by the research:

### `HV-DOC-01 — Street-Counter Meal Service`

- public edge is the street;
- compact counter and hot/cold storage;
- rear preparation and sanitation/provider path;
- short dwell time, high throughput;
- no common hall or lodging required.

### `HV-DOC-02 — Domestic Public House`

- converted house with subtle exterior tell;
- operator household and service labor share the premises;
- public and private rooms differ by access and furnishing;
- small capacity, credit/recognition strong;
- lodging conditional.

### `HV-DOC-03 — Route Compound Hospitality`

- water, security, animals/cargo, arrival control, and traveler rest dominate;
- guest mix changes nightly;
- courtyard is one climate-dependent recipe, not the card itself;
- external cistern/market/settlement providers remain legal and explicit.

### `HV-DOC-04 — Beverage House / News Room`

- preparation and service etiquette are primary;
- news, debate, ritual, or relationship-building is a core social function;
- authority may monitor or restrict gathering;
- alcohol absent by default.

### `HV-DOC-05 — Shared-Dish After-Shift House`

- evening rush and group ordering;
- close tables, shared dishes, specials, repeat customers;
- supply freshness and staff communication visible;
- under-infrastructure or dense frontage hosts weighted, not required.

### `HV-DOC-06 — Community Service House`

- hospitality venue adds meeting, post, market, library, work, relief, or another
  local need;
- service may occupy only one time band or one part of the host;
- community ownership and commercial viability can produce layered control.

These cards are proposals. A later culture pass must test combination, dominance, and
stereotype resistance before they become table content.

## 5. Layout recipe correction

Tavern 2.0's layouts should become recipes with prerequisites and outputs.

Example:

```text
recipe: street-counter/rear-service
requires:
  public street face
  prepared food or beverage service
provides:
  arrivalRecognition
  publicConsumeOrWait
  serviceTransaction
  rearPreparation
  supplyWasteRoute
  sanitationProvider
  egress
forbids:
  implicit lodging
  implicit secret room
capacity:
  derived from counter length, waiting area, staff, schedule
```

Legacy recipes map as follows:

- Standard, Courtyard, Waystation, Long Hall, Showhouse, and Innkeeper's Pride can
  become conditional recipe seeds.
- Speak-easy, Shady Deal, Front, Guildhall, Safehouse, Underground, and Cloister
  require an actual claim/transform and precommitted hidden topology.
- Labyrinth and Sprawling Estate should not be flat random outcomes; they are
  promotion-scale hosts requiring obligations and budget.
- Fight Pit, High-Roller, Resort, and Maestro are service/event programs applied to
  compatible hosts, not generic tavern shapes.

## 6. General interior preservation and typed family control

The twelve receipts should not be read as eleven bad interior rolls. Warehouse, post
office, furrier, bank, mill, temple, workshop, great hall, chandler, translator, and
shopfront are exactly the kind of broad host history a general procedural interior
system should produce.

The 42-roll successor cohort showed that the earlier gate-first correction would
still leave thin typed pools. The accepted architecture is:

```text
committed Tavern/Hospitality program
  → Public-Service family chassis
  → Hospitality arrangement/current scene
  → contextual Hospitality Spice
  → realm/culture realization
  → derived people/capacity/detail
```

Untyped building exploration may still roll across all 300 atomic rows. Reviewed d300
relationships may seed the family/program tables with lineage. A whole row enters
typed generation only after adaptive reuse is selected first.

Once selected, the row can be decomposed progressively:

- **quick:** retain the atomic scene seed and current host/service beat;
- **linger:** resolve public/service/private/supply roles, staff, capacity, schedule,
  and providers;
- **investigate:** resolve ownership, objects, records, evidence, claims, and
  maintenance;
- **escalate:** resolve exact connectors, egress, hazards, cover, and tactical
  reservations.

Depth never rerolls the committed layered building. Current typed authority is
`../../docs/BUILDING-PROGRAM-TABLE-FAMILIES.md`.
`INTERIOR-GATING-PROPOSAL.md` is retained for historical and adaptive-reuse receipt
ideas only.

## 7. Adaptive reuse law

The real rolls show that adaptive reuse is necessary, but it cannot be an excuse.

A generic interior may be retained only if the adapter records:

1. the former use;
2. the current hospitality service mix;
3. which old fixtures remain active, dormant, or misleading;
4. what physical changes made hospitality possible;
5. where every missing service obligation is provided;
6. what constraints the old host imposes; and
7. which story atoms the adaptation preserves.

If it cannot answer these, the interior is incompatible and must be rejected before
canon contact.

This law makes `TVR-CHROME-04` viable as a noodle bar in a self-working former
workshop, while preventing the engine from silently calling a bank office a complete
inn.

## 8. Story binding

The venue should use existing story-engine surfaces:

- `rollPlace` owns place identity, trait, calamity, secret, history, realm, and host
  context;
- codex owns people, objects, ownership, claims, relationships, and persistence;
- ledger/Distant Word owns reportable world facts and distortion;
- downtime owns carouse/rest intent;
- economy owns price, stock, debt, lodging, and services where applicable;
- transforms own layered control, occupation, dormancy, damage, or event state;
- the semantic compiler owns obligations and capacity;
- composition owns layout;
- projection owns background/context only.

The venue generator should not mint a lord, sewer, guild, cult, portal, or hidden room
merely because a detail table mentions one. It may request an existing compatible
entity or create a clearly attributed soft proposal through the normal story path.

## 9. First retained proof slate

### Recommended hero — `TVR-CHROME-04`

Keep unchanged:

- place: The Dorsal Market;
- host premise: noodle bar under the rail line;
- source venue name: The Golden Dolphin;
- former/self-working workshop interior;
- Rose Tosscobble and her rolled soul/hook;
- three ambient people;
- map-selling urchin action;
- Distant Word bridge fact and distortion;
- all source row refs and seed.

Compiler questions to prove:

- Is Rose operator, shift lead, worker-owner, or the assigned public face?
- What service fits the rail/workshop context?
- How do the returning tools constrain service and become evidence or risk?
- Where do food, water, heat, waste, and sanitation go?
- What does the bar's public name become under a Chrome culture doctrine, while the
  original source name remains in provenance?
- Who controls deliveries or private introductions in the layered variant?
- What tactical objects are reserved before the social scene escalates?

### Changed seed — `TVR-GLOOM-01`

Tests:

- strict closing schedule;
- diner service in a speaking-portrait great hall;
- ambient attendance lower than the hall's possible capacity;
- portrait knowledge and proprietor's unrelated personal hook;
- adaptive reuse versus institution/household host.

### Lodging/adversarial seed — `TVR-FRONTIER-04`

Tests:

- boarding-house obligations;
- committed correspondence archive in a second cellar;
- public/private/service/property access;
- poor condition versus upper-class dining-club depth roll;
- escape, evidence, and layered control without inventing new topology.

The compiled-unwired depth rolls are pressure inputs, not automatically committed
facts. The proof must show which survive reconciliation and why.

## 10. Implementation sequence after CL-R3

1. Freeze the twelve receipts as regression fixtures.
2. Freeze the general d300 row text and row-level combinations for untyped/legacy use.
3. Author the Public-Service family chassis table.
4. Author Tavern/Hospitality arrangement, current-scene, and Spice tables.
5. Add a pure `HospitalityVenueProfile` compiler beside, not inside, the renderer.
6. Translate one receipt only: `TVR-CHROME-04`.
7. Build the minimum host-compatible recipe and capacity calculation.
8. Bind operator/staff/source-scene roles without changing rolled identities.
9. Bind Distant Word and current action to real cast.
10. Materialize SceneTray/social view.
11. Apply compact layered control with no added room.
12. Promote the same ids to BattleMap.
13. Run Gloom and Frontier companion receipts through the same layered compiler.
14. Only then extract/refactor deeper Tavern 2.0 tables.

No live engine or CL-R3 file was changed by this study.

## 11. Declared gaps

- No Public-Service family table, Hospitality arrangement/current-scene/Spice stack,
  venue profile, compiler, layout recipe registry, culture cards, or capacity model is
  implemented.
- The research is not a complete global hospitality taxonomy.
- Operator role semantics need reconciliation with existing NPC role/class systems.
- Food ecology, dietary law, intoxication, accessibility, children/families, worker
  safety, and harm-sensitive content need dedicated passes.
- Modern fire/egress/accessibility standards were not researched as universal
  historical rules; Genesis still needs legible safe gameplay circulation.
- No direct FFT tavern map exists in the current audited corpus.
- No fixed-camera clay/tactical/dressed venue proof exists.
- The selected hero is a recommendation, not a founder lock.
