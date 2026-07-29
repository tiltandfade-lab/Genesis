# Building family sample tables and deterministic taste rolls

date: 2026-07-28
status: TASTE PACKET — seven founder-ruled families plus one proposed Market/Exchange family; sample d6/d4 tranches, not final d20 corpus or live runtime output
source: `TABLE-SAMPLES.json`
rerun: `node dev/roll-building-family-samples.mjs`

## How to judge this packet

For each family, decide:

1. Does every chassis row belong to every program in the family?
2. Does the program arrangement make the building recognizable before scene or Spice?
3. Does the scene create immediate play without asking the DM to repair the building?
4. Does Spice intensify a real program surface rather than replace the program?
5. Does the realm realization materially change practice, technology, labor, and space?
6. Should any family split, merge, or change its flavor before the tables expand?

The sampler selects four deterministic receipts per family using Grounded/Frontier,
Textured/Chrome, Strange/Gloom, and Volatile/Frontier profiles. Multi-program
families rotate programs; singleton families exercise all four profiles.

## BF-PUBLIC-SERVICE — Public Service / Hospitality

A legible public arrival meets recognition or payment, an occupied customer area, a service edge, controlled support space, and truthful egress.

**Family forbids:**

- No chassis row decides that the place serves drink, bathing, or gambling.
- No private or back-of-house route becomes public merely to solve a scene.

### Chassis taste tranche (d6)

| d6 | id | scale | requires | sample relationship |
| --- | --- | --- | --- | --- |
| 1 | PS-CH-01 | small-to-medium | ordinary context | Broad street room with a long service edge; preparation and secure storage sit behind it, with a separate delivery door. |
| 2 | PS-CH-02 | medium | ordinary context | Covered arcade opens into a customer courtyard; two reservable side rooms share a screened service range and rear staff passage. |
| 3 | PS-CH-03 | small-to-medium | ordinary context | Corner frontage feeds two connected public rooms around a central recognition desk; service rooms and a narrow staff stair occupy the inner corner. |
| 4 | PS-CH-04 | medium | ordinary context | Long hall divided into a lively front bay and quieter rear bay; payment sits between them, while support runs along one side wall. |
| 5 | PS-CH-05 | medium-to-large | ordinary context | Split-level venue with the main public floor above a lower service range; an overlook and separate staff stair keep both levels legible. |
| 6 | PS-CH-06 | small-hosted | ordinary context | Public pavilion inside a larger host building; it owns a staffed service enclosure and secure store but receives one utility from a named shared provider. |

### Operating-state taste tranche (d4)

| d4 | id | sample state |
| --- | --- | --- |
| 1 | PS-ST-01 | Ordinary service: staffing, supplies, and customer capacity are balanced. |
| 2 | PS-ST-02 | Rush or backlog: the customer floor is full and one service station has become the bottleneck. |
| 3 | PS-ST-03 | Partial operation: one room is closed for repair, cleaning, shortage, or a failed utility. |
| 4 | PS-ST-04 | Reserved use: a private booking or protected clientele controls part of the public floor without erasing ordinary egress. |

### Tavern program layer

Invariants: hospitality · drink or food service · responsible host · social floor · payment or patronage · service and supply

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | TV-AR-01 | all family chassis | Drinkhouse with a public bar, small cold store or cellar, simple food preparation, and no lodging. |
| 2 | TV-AR-02 | all family chassis | Mealhouse with visible kitchen pass, communal tables, a smaller drinking edge, and timed sittings. |
| 3 | TV-AR-03 | chassis PS-CH-02, PS-CH-03, PS-CH-05 | Road inn with common room below, guest rooms above or around a court, stable or transport provider, and night access rules. |
| 4 | TV-AR-04 | all family chassis | Member-backed hostelry whose public room remains open while one reservable room and a credit ledger serve regulars. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | TV-SC-01 | A delayed drink delivery has the keeper deciding which regulars still receive their usual order. |
| 2 | TV-SC-02 | Two travelers need the last bed, and each claims a different local promise gives them priority. |
| 3 | TV-SC-03 | A meal is leaving the kitchen while its intended table quietly abandons the room. |
| 4 | TV-SC-04 | A tab is being settled with information, but the named person has just entered through the other door. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | TV-SP-G | The house ledger shows one patron has been paying another patron's tab for months. | credit and relationships |
| Textured | TV-SP-T | One table is always kept laid for a party whose reservation predates the current keeper. | seating and house custom |
| Strange | TV-SP-S | A drink poured from one marked tap tastes like the last place the customer truly considered home. | one service fixture |
| Volatile | TV-SP-V | Every unpaid promise spoken over the bar becomes audible to its creditor at closing time. | credit and closing routine |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Inn / Alehouse | Hearth, casks, cellar or cool store, kitchen smoke, stable or road supply, host-led etiquette. |
| chrome | Noodle Bar / Listening House | Ventilated cookline, refrigeration, compact counter service, booked booths, delivery access, powered light and sound. |
| gloom | Diner / Roadhouse | Grill line, coffee and bottle storage, booths and counter, back lot delivery, jukebox or radio custom, late-shift staffing. |

### Bathhouse program layer

Invariants: arrival and payment/custom · changing · washing or heat service · clean/used flow · water and waste · privacy and safety

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | BH-AR-01 | all family chassis | Sequential bath with changing, wash room, hot room, cooling edge, and a staffed linen point. |
| 2 | BH-AR-02 | all family chassis | Communal washhouse with timed bathing, laundry service, heated water store, and family/private screens. |
| 3 | BH-AR-03 | all family chassis | Steam house with one shared hot chamber, cold rinse, rest room, and tightly controlled fuel and ventilation. |
| 4 | BH-AR-04 | chassis PS-CH-02, PS-CH-03, PS-CH-05 | Appointment bath with several small rooms supplied from one service spine and a shared recovery lounge. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | BH-SC-01 | The hot-water queue is slipping, and the keeper must choose between a promised group and ordinary customers. |
| 2 | BH-SC-02 | A missing garment has halted one changing area while attendants compare tags and baskets. |
| 3 | BH-SC-03 | A patron refuses to leave the cooling room until someone hears a private accusation. |
| 4 | BH-SC-04 | A drain inspection has exposed a concealed bundle that clearly entered from inside the bathing circuit. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | BH-SP-G | The linen tally proves someone has been using the closed room after hours. | laundry and access |
| Textured | BH-SP-T | One basin remains warm after the furnace is banked, but only while the room is occupied. | one water fixture |
| Strange | BH-SP-S | Steam briefly reveals old scars that the bather no longer carries. | steam chamber perception |
| Volatile | BH-SP-V | Water released from the final drain carries one spoken secret into every connected basin. | drainage and privacy |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Bathhouse / Washhouse | Boiler or furnace, cisterns, tubs and hot rooms, linen labor, fuel delivery, yard drainage. |
| chrome | Spa / Capsule Bath | Pumped water, heat exchangers, lockers, filtered wet zones, booking system, maintenance corridors. |
| gloom | Public Baths / Sauna | Boiler room, tiled wet rooms, lockers and towels, practical ventilation, posted hours, municipal or private keeper. |

### Gambling Den program layer

Invariants: recognized stakes · game floor · bank or settlement · oversight · cash or debt security · exit and dispute response

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | GD-AR-01 | all family chassis | Open low-stakes hall with several visible tables, a central cash box, and one floor watcher. |
| 2 | GD-AR-02 | all family chassis | Public front room feeds screened high-stakes tables whose entry and settlement are separately controlled. |
| 3 | GD-AR-03 | all family chassis | Betting house with posted events or contests, ticket/tally counter, result board, and payout window. |
| 4 | GD-AR-04 | all family chassis | Club game room where membership, credit, food and drink service, and private arbitration carry more weight than cash at the table. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | GD-SC-01 | A disputed final hand has frozen one table while the house checks the deck and the debt book. |
| 2 | GD-SC-02 | A regular wants their credit extended before a backer arrives to revoke it. |
| 3 | GD-SC-03 | The result board contradicts the sealed tally held behind the counter. |
| 4 | GD-SC-04 | A winner cannot collect because the person authorized to open the reserve has vanished through the staff route. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | GD-SP-G | One dealer has been rounding every disputed stake in favor of the same quiet patron. | settlement and trust |
| Textured | GD-SP-T | A retired game table still records wagers in its scarred surface when coins touch it. | one table and records |
| Strange | GD-SP-S | One set of dice lands honestly but whispers the result a heartbeat before it stops. | one gaming implement |
| Volatile | GD-SP-V | A debt accepted at the private table transfers the debtor's luck to the house until repayment. | credit and consequence |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Gaming House | Dice, cards or boards, strongbox, handwritten credit, visible house watcher, food/drink from owned or named provider. |
| chrome | Betting Lounge / Game Club | Electronic or projected odds, identity-controlled accounts, surveillance, cashier cage, private rooms and service access. |
| gloom | Card Room / Betting Parlor | Tables and booths, chalk or lit result board, cash window, back-office book, floor manager and parking/alley access. |

### Deterministic sample rolls

#### BF-PUBLIC-SERVICE-01 — Tavern — grounded-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-PUBLIC-SERVICE/tavern/grounded-frontier/0` → `1002213948`

Context tags: ordinary

- Chassis: **PS-CH-04** — Long hall divided into a lively front bay and quieter rear bay; payment sits between them, while support runs along one side wall.
- Arrangement: **TV-AR-01** — Drinkhouse with a public bar, small cold store or cellar, simple food preparation, and no lodging.
- State: **PS-ST-03** — Partial operation: one room is closed for repair, cleaning, shortage, or a failed utility.
- Scene: **TV-SC-01** — A delayed drink delivery has the keeper deciding which regulars still receive their usual order.
- Spice: **Grounded / TV-SP-G** — The house ledger shows one patron has been paying another patron's tab for months.
- Realm: **frontier / Inn / Alehouse** — Hearth, casks, cellar or cool store, kitchen smoke, stable or road supply, host-led etiquette.

#### BF-PUBLIC-SERVICE-02 — Bathhouse — textured-chrome

Seed: `BUILDING-FAMILY-TASTE/BF-PUBLIC-SERVICE/bathhouse/textured-chrome/1` → `1678829952`

Context tags: ordinary

- Chassis: **PS-CH-03** — Corner frontage feeds two connected public rooms around a central recognition desk; service rooms and a narrow staff stair occupy the inner corner.
- Arrangement: **BH-AR-03** — Steam house with one shared hot chamber, cold rinse, rest room, and tightly controlled fuel and ventilation.
- State: **PS-ST-02** — Rush or backlog: the customer floor is full and one service station has become the bottleneck.
- Scene: **BH-SC-03** — A patron refuses to leave the cooling room until someone hears a private accusation.
- Spice: **Textured / BH-SP-T** — One basin remains warm after the furnace is banked, but only while the room is occupied.
- Realm: **chrome / Spa / Capsule Bath** — Pumped water, heat exchangers, lockers, filtered wet zones, booking system, maintenance corridors.

#### BF-PUBLIC-SERVICE-03 — Gambling Den — strange-gloom

Seed: `BUILDING-FAMILY-TASTE/BF-PUBLIC-SERVICE/gambling-den/strange-gloom/2` → `2491682252`

Context tags: ordinary

- Chassis: **PS-CH-02** — Covered arcade opens into a customer courtyard; two reservable side rooms share a screened service range and rear staff passage.
- Arrangement: **GD-AR-02** — Public front room feeds screened high-stakes tables whose entry and settlement are separately controlled.
- State: **PS-ST-04** — Reserved use: a private booking or protected clientele controls part of the public floor without erasing ordinary egress.
- Scene: **GD-SC-03** — The result board contradicts the sealed tally held behind the counter.
- Spice: **Strange / GD-SP-S** — One set of dice lands honestly but whispers the result a heartbeat before it stops.
- Realm: **gloom / Card Room / Betting Parlor** — Tables and booths, chalk or lit result board, cash window, back-office book, floor manager and parking/alley access.

#### BF-PUBLIC-SERVICE-04 — Tavern — volatile-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-PUBLIC-SERVICE/tavern/volatile-frontier/3` → `2164505027`

Context tags: `licensed-world-adapter`

- Chassis: **PS-CH-04** — Long hall divided into a lively front bay and quieter rear bay; payment sits between them, while support runs along one side wall.
- Arrangement: **TV-AR-01** — Drinkhouse with a public bar, small cold store or cellar, simple food preparation, and no lodging.
- State: **PS-ST-03** — Partial operation: one room is closed for repair, cleaning, shortage, or a failed utility.
- Scene: **TV-SC-04** — A tab is being settled with information, but the named person has just entered through the other door.
- Spice: **Volatile / TV-SP-V** — Every unpaid promise spoken over the bar becomes audible to its creditor at closing time.
- Realm: **frontier / Inn / Alehouse** — Hearth, casks, cellar or cool store, kitchen smoke, stable or road supply, host-led etiquette.

## BF-CIVIC-AUTHORITY — Civic / Authority

A public, member, or duty threshold reaches recognized authority, decision or assembly space, records, a controlled inner zone, and staff circulation.

**Family forbids:**

- No family row supplies involuntary custody as its primary program.
- Secure rooms remain subordinate to the selected civic program.

### Chassis taste tranche (d6)

| d6 | id | scale | requires | sample relationship |
| --- | --- | --- | --- | --- |
| 1 | CA-CH-01 | small | ordinary context | Public counter and waiting bay lead to one decision chamber; records and staff work occupy a controlled rear strip. |
| 2 | CA-CH-02 | small-to-medium | ordinary context | Member or petitioner hall faces a raised authority position; two side rooms support consultation, records, or duty work. |
| 3 | CA-CH-03 | medium | ordinary context | Gated court or muster yard leads to a duty room, secure issue store, and command office with a separate staff entrance. |
| 4 | CA-CH-04 | medium | ordinary context | Arcaded public hall separates clerk or recognition desk, formal chamber, private consultation, and a fire-secure record room. |
| 5 | CA-CH-05 | medium-to-large | ordinary context | A configurable central floor supports assembly or drill; perimeter offices, issue rooms, and records open from a controlled circulation ring. |
| 6 | CA-CH-06 | medium | ordinary context | Two-storey civic house places public business below and committee, command, or deliberation above; staff and records use a rear stair. |

### Operating-state taste tranche (d4)

| d4 | id | sample state |
| --- | --- | --- |
| 1 | CA-ST-01 | Ordinary session: public business and staff work follow the posted order. |
| 2 | CA-ST-02 | Handoff: one duty group is replacing another and authority, keys, records, or pending cases are being acknowledged. |
| 3 | CA-ST-03 | Overload: petitioners, members, cases, patrol needs, or records exceed the normal public capacity. |
| 4 | CA-ST-04 | Emergency authority: the public floor remains legible, but one controlled room has become a temporary command or deliberation center. |

### Guildhall program layer

Invariants: member recognition · collective authority · business or standards · dues/contracts/records · assembly · officers or stewards

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | GH-AR-01 | all family chassis | Trade guild with dues desk, contract hall, sample or standard display, officers' room, and archive. |
| 2 | GH-AR-02 | all family chassis | Craft guild with member hall, examination bench, shared tools or patterns, stores, and masters' chamber. |
| 3 | GH-AR-03 | all family chassis | Carriers' or labor hall with hiring board, muster floor, relief fund desk, meeting room, and equipment issue. |
| 4 | GH-AR-04 | all family chassis | Merchant association with public arbitration hours, members' exchange floor, private committees, and bonded records. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | GH-SC-01 | A candidate's examination piece passes every visible standard but bears a prohibited maker's mark. |
| 2 | GH-SC-02 | Two officers claim authority to sign the same contract before the next caravan departs. |
| 3 | GH-SC-03 | The hiring board lists a crew that insists it never accepted the job. |
| 4 | GH-SC-04 | A relief payment is due, but the member's status was changed during the night. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | GH-SP-G | The dues ledger contains a perfectly regular payment from a member everyone remembers burying. | membership records |
| Textured | GH-SP-T | One old standard rejects work made with a technique the current masters cannot identify. | examination and standards |
| Strange | GH-SP-S | The hall's master pattern subtly alters itself after every unanimous vote. | collective decision record |
| Volatile | GH-SP-V | Any contract sealed in the officers' room compels the guild's building—not its members—to enforce one clause. | contracts and site behavior |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Guildhall / Company Hall | Member marks, samples, contract tables, muster space, physical ledgers, shared stores and officer keys. |
| chrome | Trade Consortium / Labor Exchange | Credential gates, fabrication standards, data archive, booking floor, committee suites and controlled equipment issue. |
| gloom | Union Hall / Business Association | Meeting floor, hiring board, records office, sample cases, benefit desk, committee rooms and practical back entrance. |

### Garrison program layer

Invariants: duty command · muster · arms or equipment control · patrol/readiness · rest and relief · public or strategic response

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | GA-AR-01 | all family chassis | Town watch station with report desk, muster room, equipment issue, captain's office, and short-rest bunks. |
| 2 | GA-AR-02 | all family chassis | Gate garrison with gate control, guardroom, armory, relief room, wall or road access, and alarm station. |
| 3 | GA-AR-03 | chassis CA-CH-03, CA-CH-05 | Barracks company with parade or drill court, squad rooms, mess provider, stores, command, and sentry circuit. |
| 4 | GA-AR-04 | chassis CA-CH-01, CA-CH-03, CA-CH-05 | Rapid-response post with ready room, vehicle or mount edge, equipment racks, briefing wall, and maintenance supply. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | GA-SC-01 | An outgoing patrol refuses to surrender one issued weapon because its replacement crew is incomplete. |
| 2 | GA-SC-02 | A public report contradicts the watch log and the named patrol has not returned to answer it. |
| 3 | GA-SC-03 | The alarm test has revealed that one post receives the signal too late. |
| 4 | GA-SC-04 | A relief crew arrives early carrying orders signed by an authority the commander cannot verify. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | GA-SP-G | The equipment ledger shows one shield or protective rig has been issued continuously for years without return. | issue and accountability |
| Textured | GA-SP-T | One alarm station signals a threat category omitted from every current drill. | alarm and doctrine |
| Strange | GA-SP-S | The muster marks briefly include any absent guard who is in immediate danger. | muster information |
| Volatile | GA-SP-V | Weapons drawn from one rack cannot be turned against the authority named at the last shift handoff. | armory permission |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Watch House / Barracks | Muster yard, arms chest or armory, patrol board, bunks, stable or road access, bells and relief watch. |
| chrome | Security Precinct / Response Hub | Dispatch wall, controlled equipment lockers, ready bays, surveillance feeds, decontamination or maintenance support. |
| gloom | Sheriff's Office / Armory | Report counter, squad room, evidence handoff to external custody, gun or gear cage, motor pool or back lot, radio dispatch. |

### Court program layer

Invariants: recognized adjudicator · parties or petitioners · hearing/decision · record · private deliberation or consultation · enforceable outcome route

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | CT-AR-01 | all family chassis | Single-magistrate court with clerk desk, waiting, hearing room, consultation room, secure records, and bailiff station. |
| 2 | CT-AR-02 | all family chassis | Arbitration hall with several small hearing rooms, shared filing desk, mediators' workroom, and public settlement board. |
| 3 | CT-AR-03 | all family chassis | Circuit court occupying a configurable hall on hearing days and returning records to a traveling or external archive. |
| 4 | CT-AR-04 | all family chassis | Claims and notary court with public counter, document examination, short hearings, payment, and registered issue/appeal route. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | CT-SC-01 | Two filed copies of the same order differ by one name, and both bear valid marks. |
| 2 | CT-SC-02 | A hearing cannot begin because the person responsible for interpreting one party's testimony has withdrawn. |
| 3 | CT-SC-03 | A settlement has been reached in private, but the public record would expose a different dispute. |
| 4 | CT-SC-04 | The bailiff has received enforcement instructions before the adjudicator announces a decision. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | CT-SP-G | The appeals register shows one case was reopened under a deadline that does not exist in current rules. | procedure and record |
| Textured | CT-SP-T | A sealed deliberation room carries sound outward only when the speakers agree. | privacy and consensus |
| Strange | CT-SP-S | One witness chair grows noticeably heavier with each statement the speaker believes false. | testimony fixture |
| Volatile | CT-SP-V | A formally entered judgment changes one physical threshold in the building until appealed or fulfilled. | judgment and access |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Magistrate's Court / Hall of Law | Clerk and petition desk, hearing chamber, seals and ledgers, bailiff route, public notice, nearby external holding if required. |
| chrome | Arbitration Floor / Tribunal | Identity check, recorded hearing rooms, evidence display, secure files, private deliberation, service and enforcement handoff. |
| gloom | County Court / Municipal Hearing Office | Clerk counter, courtroom or hearing room, records vault, judge or examiner chamber, sheriff adjacency without prison ownership. |

### Deterministic sample rolls

#### BF-CIVIC-AUTHORITY-01 — Guildhall — grounded-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-CIVIC-AUTHORITY/guildhall/grounded-frontier/0` → `770284955`

Context tags: ordinary

- Chassis: **CA-CH-06** — Two-storey civic house places public business below and committee, command, or deliberation above; staff and records use a rear stair.
- Arrangement: **GH-AR-04** — Merchant association with public arbitration hours, members' exchange floor, private committees, and bonded records.
- State: **CA-ST-03** — Overload: petitioners, members, cases, patrol needs, or records exceed the normal public capacity.
- Scene: **GH-SC-03** — The hiring board lists a crew that insists it never accepted the job.
- Spice: **Grounded / GH-SP-G** — The dues ledger contains a perfectly regular payment from a member everyone remembers burying.
- Realm: **frontier / Guildhall / Company Hall** — Member marks, samples, contract tables, muster space, physical ledgers, shared stores and officer keys.

#### BF-CIVIC-AUTHORITY-02 — Garrison — textured-chrome

Seed: `BUILDING-FAMILY-TASTE/BF-CIVIC-AUTHORITY/garrison/textured-chrome/1` → `1795920353`

Context tags: ordinary

- Chassis: **CA-CH-05** — A configurable central floor supports assembly or drill; perimeter offices, issue rooms, and records open from a controlled circulation ring.
- Arrangement: **GA-AR-03** — Barracks company with parade or drill court, squad rooms, mess provider, stores, command, and sentry circuit.
- State: **CA-ST-01** — Ordinary session: public business and staff work follow the posted order.
- Scene: **GA-SC-02** — A public report contradicts the watch log and the named patrol has not returned to answer it.
- Spice: **Textured / GA-SP-T** — One alarm station signals a threat category omitted from every current drill.
- Realm: **chrome / Security Precinct / Response Hub** — Dispatch wall, controlled equipment lockers, ready bays, surveillance feeds, decontamination or maintenance support.

#### BF-CIVIC-AUTHORITY-03 — Court — strange-gloom

Seed: `BUILDING-FAMILY-TASTE/BF-CIVIC-AUTHORITY/court/strange-gloom/2` → `1197664959`

Context tags: ordinary

- Chassis: **CA-CH-01** — Public counter and waiting bay lead to one decision chamber; records and staff work occupy a controlled rear strip.
- Arrangement: **CT-AR-01** — Single-magistrate court with clerk desk, waiting, hearing room, consultation room, secure records, and bailiff station.
- State: **CA-ST-03** — Overload: petitioners, members, cases, patrol needs, or records exceed the normal public capacity.
- Scene: **CT-SC-01** — Two filed copies of the same order differ by one name, and both bear valid marks.
- Spice: **Strange / CT-SP-S** — One witness chair grows noticeably heavier with each statement the speaker believes false.
- Realm: **gloom / County Court / Municipal Hearing Office** — Clerk counter, courtroom or hearing room, records vault, judge or examiner chamber, sheriff adjacency without prison ownership.

#### BF-CIVIC-AUTHORITY-04 — Guildhall — volatile-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-CIVIC-AUTHORITY/guildhall/volatile-frontier/3` → `50815256`

Context tags: `licensed-world-adapter`

- Chassis: **CA-CH-06** — Two-storey civic house places public business below and committee, command, or deliberation above; staff and records use a rear stair.
- Arrangement: **GH-AR-01** — Trade guild with dues desk, contract hall, sample or standard display, officers' room, and archive.
- State: **CA-ST-04** — Emergency authority: the public floor remains legible, but one controlled room has become a temporary command or deliberation center.
- Scene: **GH-SC-04** — A relief payment is due, but the member's status was changed during the night.
- Spice: **Volatile / GH-SP-V** — Any contract sealed in the officers' room compels the guild's building—not its members—to enforce one clause.
- Realm: **frontier / Guildhall / Company Hall** — Member marks, samples, contract tables, muster space, physical ledgers, shared stores and officer keys.

## BF-HOUSEHOLD-ESTATE — Household / Estate

Controlled reception mediates between outside claims and private household life while service circulation, property records, food, sleep, sanitation, dependants, and labor remain credible.

**Family forbids:**

- The Manor cannot be replaced by a shop, hospital, school, or unrelated institution.
- A mixed or former use must be selected explicitly and cannot erase the functioning household.

### Chassis taste tranche (d6)

| d6 | id | scale | requires | sample relationship |
| --- | --- | --- | --- | --- |
| 1 | HE-CH-01 | small-to-medium | ordinary context | Compact urban manor with formal front rooms, private upper household, rear service court, and separate staff stair. |
| 2 | HE-CH-02 | medium-to-large | ordinary context | Courtyard estate with reception and administration on the public side, family rooms on one wing, and kitchens, stores, and staff lodging on another. |
| 3 | HE-CH-03 | medium | ordinary context | Long hall-house with a formal central room, screened service end, private solar or suite, guest chambers, and working yard. |
| 4 | HE-CH-04 | small-footprint | ordinary context | Tower or vertical house with reception below, household rooms above, secure records between them, and service access from a lower side entry. |
| 5 | HE-CH-05 | distributed | ordinary context | Estate lodge facing a managed yard or garden; the main house contains reception and family rooms while detached service buildings supply food, storage, and labor. |
| 6 | HE-CH-06 | medium | ordinary context | Divided household around one formal stair: two private branches share reception, kitchen/service, chapel or quiet room, and estate records but control separate thresholds. |

### Operating-state taste tranche (d4)

| d4 | id | sample state |
| --- | --- | --- |
| 1 | HE-ST-01 | Receiving day: household officers and front rooms are active while private rooms remain controlled. |
| 2 | HE-ST-02 | Private household: ordinary domestic and estate work continues with formal rooms mostly closed. |
| 3 | HE-ST-03 | Understaffed or absent owner: a steward, caretaker, or elder combines several roles and some service spaces are dormant. |
| 4 | HE-ST-04 | Succession or occupation: two claims divide permissions, records, rooms, or staff without changing the building's household identity. |

### Manor program layer

Invariants: household authority · reception · private life · service and labor · property/estate records · food/sleep/sanitation · accountable controller

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | MN-AR-01 | all family chassis | Resident household led by an owner or elder, with a steward handling petitions, accounts, guests, and estate work. |
| 2 | MN-AR-02 | all family chassis | Absentee owner's house where a bailiff and small permanent household maintain property, rents, repairs, and formal reception. |
| 3 | MN-AR-03 | all family chassis | Multigenerational household whose two branches share service and authority rooms but keep separate private thresholds and dependants. |
| 4 | MN-AR-04 | all family chassis | Official residence where household life coexists with scheduled petitions, audiences, or local administration in the front range. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | MN-SC-01 | Two tenants dispute a boundary while the steward discovers that the filed rent roll uses an older property line. |
| 2 | MN-SC-02 | A guest has arrived under a genuine invitation issued by a household member who denies sending it. |
| 3 | MN-SC-03 | The kitchen and stable or transport staff have both been promised the same limited delivery. |
| 4 | MN-SC-04 | A dependant is moving rooms, and every household branch interprets the reassignment as a statement of succession. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | MN-SP-G | Two household account books disagree about the support owed to one dependant. | estate obligations |
| Textured | MN-SP-T | A reception room appears in household inventories but not in the filed plan, although servants describe cleaning it. | records and known space |
| Strange | MN-SP-S | Ancestral portraits answer only questions whose subjects were once discussed within their hearing. | reception memory |
| Volatile | MN-SP-V | One private threshold recognizes a disputed heir as owner and denies the current household head. | private access and succession |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Manor / Estate House | Stewarded reception, household rooms, kitchen and stores, service court, rent or land records, gardens, stable or work providers. |
| chrome | Penthouse / Family Compound | Controlled lobby, formal entertaining floor, private suites, service elevator or corridor, household staff, asset records and building systems. |
| gloom | Old Family Place / Big House | Front parlor and dining room, family bedrooms, kitchen and utility rooms, back stair or porch, property office, yard and local dependants. |

### Deterministic sample rolls

#### BF-HOUSEHOLD-ESTATE-01 — Manor — grounded-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-HOUSEHOLD-ESTATE/manor/grounded-frontier/0` → `940185424`

Context tags: ordinary

- Chassis: **HE-CH-06** — Divided household around one formal stair: two private branches share reception, kitchen/service, chapel or quiet room, and estate records but control separate thresholds.
- Arrangement: **MN-AR-04** — Official residence where household life coexists with scheduled petitions, audiences, or local administration in the front range.
- State: **HE-ST-01** — Receiving day: household officers and front rooms are active while private rooms remain controlled.
- Scene: **MN-SC-04** — A dependant is moving rooms, and every household branch interprets the reassignment as a statement of succession.
- Spice: **Grounded / MN-SP-G** — Two household account books disagree about the support owed to one dependant.
- Realm: **frontier / Manor / Estate House** — Stewarded reception, household rooms, kitchen and stores, service court, rent or land records, gardens, stable or work providers.

#### BF-HOUSEHOLD-ESTATE-02 — Manor — textured-chrome

Seed: `BUILDING-FAMILY-TASTE/BF-HOUSEHOLD-ESTATE/manor/textured-chrome/1` → `3788182681`

Context tags: ordinary

- Chassis: **HE-CH-01** — Compact urban manor with formal front rooms, private upper household, rear service court, and separate staff stair.
- Arrangement: **MN-AR-03** — Multigenerational household whose two branches share service and authority rooms but keep separate private thresholds and dependants.
- State: **HE-ST-02** — Private household: ordinary domestic and estate work continues with formal rooms mostly closed.
- Scene: **MN-SC-01** — Two tenants dispute a boundary while the steward discovers that the filed rent roll uses an older property line.
- Spice: **Textured / MN-SP-T** — A reception room appears in household inventories but not in the filed plan, although servants describe cleaning it.
- Realm: **chrome / Penthouse / Family Compound** — Controlled lobby, formal entertaining floor, private suites, service elevator or corridor, household staff, asset records and building systems.

#### BF-HOUSEHOLD-ESTATE-03 — Manor — strange-gloom

Seed: `BUILDING-FAMILY-TASTE/BF-HOUSEHOLD-ESTATE/manor/strange-gloom/2` → `3841489055`

Context tags: ordinary

- Chassis: **HE-CH-01** — Compact urban manor with formal front rooms, private upper household, rear service court, and separate staff stair.
- Arrangement: **MN-AR-02** — Absentee owner's house where a bailiff and small permanent household maintain property, rents, repairs, and formal reception.
- State: **HE-ST-03** — Understaffed or absent owner: a steward, caretaker, or elder combines several roles and some service spaces are dormant.
- Scene: **MN-SC-03** — The kitchen and stable or transport staff have both been promised the same limited delivery.
- Spice: **Strange / MN-SP-S** — Ancestral portraits answer only questions whose subjects were once discussed within their hearing.
- Realm: **gloom / Old Family Place / Big House** — Front parlor and dining room, family bedrooms, kitchen and utility rooms, back stair or porch, property office, yard and local dependants.

#### BF-HOUSEHOLD-ESTATE-04 — Manor — volatile-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-HOUSEHOLD-ESTATE/manor/volatile-frontier/3` → `4110353391`

Context tags: `licensed-world-adapter`

- Chassis: **HE-CH-03** — Long hall-house with a formal central room, screened service end, private solar or suite, guest chambers, and working yard.
- Arrangement: **MN-AR-03** — Multigenerational household whose two branches share service and authority rooms but keep separate private thresholds and dependants.
- State: **HE-ST-04** — Succession or occupation: two claims divide permissions, records, rooms, or staff without changing the building's household identity.
- Scene: **MN-SC-04** — A dependant is moving rooms, and every household branch interprets the reassignment as a statement of succession.
- Spice: **Volatile / MN-SP-V** — One private threshold recognizes a disputed heir as owner and denies the current household head.
- Realm: **frontier / Manor / Estate House** — Stewarded reception, household rooms, kitchen and stores, service court, rent or land records, gardens, stable or work providers.

## BF-RITUAL-INSTITUTION — Ritual / Institution

A participant threshold establishes conduct and preparation before a ritual focus, while officiant support, offerings or records, restricted space, services, and gathering remain causally connected.

**Family forbids:**

- A shrine prop cannot substitute for active ritual practice and responsible custody.
- Realm symbolism cannot erase participant, officiant, offering, service, or restricted-space relationships.

### Chassis taste tranche (d6)

| d6 | id | scale | requires | sample relationship |
| --- | --- | --- | --- | --- |
| 1 | RI-CH-01 | small-to-medium | ordinary context | Axial threshold and preparation bay lead to a common ritual hall and focused sanctuary; officiant rooms and offering store sit behind the focus. |
| 2 | RI-CH-02 | medium | ordinary context | Open court holds gathering and procession; a roofed ritual chamber, side instruction room, and service range form its protected edge. |
| 3 | RI-CH-03 | medium-to-large | ordinary context | Congregational hall faces a raised or enclosed focus, with side aisles or paths to private counsel, offerings, storage, and officiant circulation. |
| 4 | RI-CH-04 | small | ordinary context | Clustered shrine house links several small focuses through one shared preparation room, keeper station, offering record, and quiet court. |
| 5 | RI-CH-05 | site-linked | ordinary context | A spring, cave, tree, ruin, or other world-owned focus is approached through a managed threshold; shelter, offerings, instruction, and sanitation remain built around it. |
| 6 | RI-CH-06 | medium | ordinary context | Upper public hall and lower restricted chamber share one ritual axis; separate officiant circulation and a service stair preserve access truth. |

### Operating-state taste tranche (d4)

| d4 | id | sample state |
| --- | --- | --- |
| 1 | RI-ST-01 | Ordinary observance: the focus, officiant support, and public threshold operate on their normal cadence. |
| 2 | RI-ST-02 | Preparation: staff and participants are arranging a rite, teaching, offering, or procession not yet begun. |
| 3 | RI-ST-03 | Festival or crisis attendance: gathering exceeds ordinary interior capacity and uses the approach or court. |
| 4 | RI-ST-04 | Mourning, interdiction, or repair: the main focus is restricted while a smaller valid practice continues elsewhere in the site. |

### Temple program layer

Invariants: recognized practice · participant threshold · ritual focus · officiant or keeper · offerings/records · restricted/support space · service and gathering

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | TP-AR-01 | all family chassis | Congregational temple with scheduled common observance, teaching or counsel, offerings, and an officiant household or staff. |
| 2 | TP-AR-02 | all family chassis | Pilgrimage temple whose approach, reception, offering custody, rest, and crowd cadence matter as much as the inner focus. |
| 3 | TP-AR-03 | all family chassis | Healing or intercession temple with waiting, examination or counsel, ritual treatment, recovery, records, and sanitation. |
| 4 | TP-AR-04 | all family chassis | Keeper shrine serving several household, ancestor, civic, or road observances through a shared threshold and small support range. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | TP-SC-01 | An offering has been correctly received but attributed to the wrong petitioner in the public record. |
| 2 | TP-SC-02 | The officiant must decide whether an arriving group may join a rite whose preparation rules they could not have followed. |
| 3 | TP-SC-03 | A healing petitioner asks that the result be recorded under someone else's name. |
| 4 | TP-SC-04 | A maintenance worker has found a message inside a ritual fixture that is not supposed to open. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | TP-SP-G | The offering record shows one donor has quietly supported two publicly opposed observances. | offerings and relationships |
| Textured | TP-SP-T | One threshold retains the scent, dust, or condensation of the last procession long after cleaning. | ritual approach |
| Strange | TP-SP-S | The ritual focus answers one repeated gesture differently when performed by someone under an unspoken obligation. | ritual response |
| Volatile | TP-SP-V | An accepted offering transfers its attached vow to the next person who removes it without authority. | offering custody |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Temple / Shrine House | Processional or public threshold, altar or world focus, offerings, lamps and fuel, keeper rooms, instruction, charity or healing provider. |
| chrome | Sanctum / Reflection Clinic | Controlled quiet threshold, immersive or technical focus, scheduled sessions, secure offerings/data, counselors or officiants, life-safety systems. |
| gloom | Church / Roadside Chapel / Healing Mission | Vestibule, sanctuary or meeting hall, office and counsel room, donation records, kitchen or aid provider, practical maintenance and community schedule. |

### Deterministic sample rolls

#### BF-RITUAL-INSTITUTION-01 — Temple — grounded-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-RITUAL-INSTITUTION/temple/grounded-frontier/0` → `3833422758`

Context tags: ordinary

- Chassis: **RI-CH-04** — Clustered shrine house links several small focuses through one shared preparation room, keeper station, offering record, and quiet court.
- Arrangement: **TP-AR-04** — Keeper shrine serving several household, ancestor, civic, or road observances through a shared threshold and small support range.
- State: **RI-ST-02** — Preparation: staff and participants are arranging a rite, teaching, offering, or procession not yet begun.
- Scene: **TP-SC-01** — An offering has been correctly received but attributed to the wrong petitioner in the public record.
- Spice: **Grounded / TP-SP-G** — The offering record shows one donor has quietly supported two publicly opposed observances.
- Realm: **frontier / Temple / Shrine House** — Processional or public threshold, altar or world focus, offerings, lamps and fuel, keeper rooms, instruction, charity or healing provider.

#### BF-RITUAL-INSTITUTION-02 — Temple — textured-chrome

Seed: `BUILDING-FAMILY-TASTE/BF-RITUAL-INSTITUTION/temple/textured-chrome/1` → `4064725619`

Context tags: ordinary

- Chassis: **RI-CH-04** — Clustered shrine house links several small focuses through one shared preparation room, keeper station, offering record, and quiet court.
- Arrangement: **TP-AR-03** — Healing or intercession temple with waiting, examination or counsel, ritual treatment, recovery, records, and sanitation.
- State: **RI-ST-04** — Mourning, interdiction, or repair: the main focus is restricted while a smaller valid practice continues elsewhere in the site.
- Scene: **TP-SC-03** — A healing petitioner asks that the result be recorded under someone else's name.
- Spice: **Textured / TP-SP-T** — One threshold retains the scent, dust, or condensation of the last procession long after cleaning.
- Realm: **chrome / Sanctum / Reflection Clinic** — Controlled quiet threshold, immersive or technical focus, scheduled sessions, secure offerings/data, counselors or officiants, life-safety systems.

#### BF-RITUAL-INSTITUTION-03 — Temple — strange-gloom

Seed: `BUILDING-FAMILY-TASTE/BF-RITUAL-INSTITUTION/temple/strange-gloom/2` → `2205817193`

Context tags: ordinary

- Chassis: **RI-CH-02** — Open court holds gathering and procession; a roofed ritual chamber, side instruction room, and service range form its protected edge.
- Arrangement: **TP-AR-03** — Healing or intercession temple with waiting, examination or counsel, ritual treatment, recovery, records, and sanitation.
- State: **RI-ST-04** — Mourning, interdiction, or repair: the main focus is restricted while a smaller valid practice continues elsewhere in the site.
- Scene: **TP-SC-02** — The officiant must decide whether an arriving group may join a rite whose preparation rules they could not have followed.
- Spice: **Strange / TP-SP-S** — The ritual focus answers one repeated gesture differently when performed by someone under an unspoken obligation.
- Realm: **gloom / Church / Roadside Chapel / Healing Mission** — Vestibule, sanctuary or meeting hall, office and counsel room, donation records, kitchen or aid provider, practical maintenance and community schedule.

#### BF-RITUAL-INSTITUTION-04 — Temple — volatile-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-RITUAL-INSTITUTION/temple/volatile-frontier/3` → `3081063825`

Context tags: `licensed-world-adapter`

- Chassis: **RI-CH-06** — Upper public hall and lower restricted chamber share one ritual axis; separate officiant circulation and a service stair preserve access truth.
- Arrangement: **TP-AR-02** — Pilgrimage temple whose approach, reception, offering custody, rest, and crowd cadence matter as much as the inner focus.
- State: **RI-ST-02** — Preparation: staff and participants are arranging a rite, teaching, offering, or procession not yet begun.
- Scene: **TP-SC-03** — A healing petitioner asks that the result be recorded under someone else's name.
- Spice: **Volatile / TP-SP-V** — An accepted offering transfers its attached vow to the next person who removes it without authority.
- Realm: **frontier / Temple / Shrine House** — Processional or public threshold, altar or world focus, offerings, lamps and fuel, keeper rooms, instruction, charity or healing provider.

## BF-LOGISTICS — Logistics

A receiving edge converts arriving goods into identified, handled, stored, counted, and dispatched loads through staff-controlled routes connected to real vehicles or carriers.

**Family forbids:**

- Storage cannot be an inert pile without ownership, route, handling, and dispatch truth.
- A dock relationship requires actual water, vehicle, loading, or transfer facts.

### Chassis taste tranche (d6)

| d6 | id | scale | requires | sample relationship |
| --- | --- | --- | --- | --- |
| 1 | LG-CH-01 | small-to-medium | ordinary context | Street receiving doors open to inspection and sorting; storage bays fill the rear while a separate dispatch lane reaches the opposite side. |
| 2 | LG-CH-02 | medium-to-large | ordinary context | Vehicle yard fronts covered loading sheds and deep storage; counting office and secure goods room overlook the shared handling court. |
| 3 | LG-CH-03 | vertical | ordinary context | Tall store uses a hoist or lift beside stacked floors; receiving, weighing, and dispatch remain separated at ground level. |
| 4 | LG-CH-04 | medium | ordinary context | A long transit shed has numbered temporary bays, cross-aisles, a tally station, and direct loading edges on both long sides. |
| 5 | LG-CH-05 | small | ordinary context | Secure compact store combines intake, weighing, and dispatch at one controlled desk while dangerous or valuable goods occupy separated cells. |
| 6 | LG-CH-06 | host-edge | ordinary context | Waterside or vehicle-side house bridges a public paperwork front to a restricted loading platform, with manifests, gear, short-term storage, and staff rest behind. |

### Operating-state taste tranche (d4)

| d4 | id | sample state |
| --- | --- | --- |
| 1 | LG-ST-01 | Normal throughput: arriving, stored, and departing loads fit the handling and record capacity. |
| 2 | LG-ST-02 | Arrival surge: one carrier has delivered early and sorting or temporary storage is consuming a route. |
| 3 | LG-ST-03 | Inventory discrepancy: physical goods, seals, ownership, or manifest totals do not reconcile. |
| 4 | LG-ST-04 | Hazard or access loss: weather, damage, contamination, labor dispute, tide, or vehicle failure has closed one handling edge. |

### Warehouse program layer

Invariants: receiving · identified goods · handling · storage · count/ownership · dispatch · staff and vehicle route

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | WH-AR-01 | all family chassis | Merchant warehouse with long-term owned bays, sample or inspection bench, counting office, and scheduled customer dispatch. |
| 2 | WH-AR-02 | all family chassis | Bonded store where seals, customs or authority, secure cages, and release orders control movement. |
| 3 | WH-AR-03 | all family chassis | Transit warehouse with numbered short-stay bays, cross-docking, rapid tally, and little long-term storage. |
| 4 | WH-AR-04 | all family chassis | Special-condition store whose cool, dry, ventilated, guarded, or hazardous bays create distinct handling and failure rules. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | WH-SC-01 | A sealed load occupies the correct bay but the seal belongs to a different owner. |
| 2 | WH-SC-02 | Workers refuse to move one crate because its recorded weight changes between stations. |
| 3 | WH-SC-03 | A customer arrives with a valid release order for goods already staged for someone else. |
| 4 | WH-SC-04 | A roof or utility failure is forcing a rapid choice about which goods receive the remaining protected space. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | WH-SP-G | One numbered bay has been paid for continuously although no employee remembers seeing it occupied. | rent and records |
| Textured | WH-SP-T | Dust settles everywhere except along a handling route absent from the current floor plan. | route history |
| Strange | WH-SP-S | Goods placed in one bay acquire the smell and temperature of their intended destination. | one storage bay |
| Volatile | WH-SP-V | Any load left after its release date begins replacing nearby labels with its own destination. | identification and delay |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Warehouse / Storehouse | Cart court, loading doors, hoist, timber racks, seals and ledgers, watchman, roof and damp control. |
| chrome | Freight Depot / Secure Storage | Loading bays, lifts, tracked units, climate or hazard zones, scanners, dispatch office and controlled vehicle circulation. |
| gloom | Warehouse / Distribution Shed | Truck dock or rail siding, pallets and shelves, receiving office, cages, inventory sheets, forklifts or hand gear, roof and utility risk. |

### Dock-House program layer

Invariants: water/vehicle edge · arrival and departure control · manifest or booking · loading labor/gear · short storage · weather/tide/route knowledge · public and restricted access

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | DH-AR-01 | chassis LG-CH-02, LG-CH-04, LG-CH-06 | Harbormaster or quay office with public berth desk, tide and arrival board, restricted platform access, signal gear, and incident records. |
| 2 | DH-AR-02 | chassis LG-CH-02, LG-CH-04, LG-CH-06 | Stevedore dispatch house with hiring/muster, gear issue, gang assignment, tally, and direct loading-platform route. |
| 3 | DH-AR-03 | chassis LG-CH-02, LG-CH-04, LG-CH-05, LG-CH-06 | Customs or bonded dock-house with declaration counter, inspection, seal store, temporary hold, and release to vessel or road. |
| 4 | DH-AR-04 | chassis LG-CH-02, LG-CH-04, LG-CH-06 | Ferry or packet house with ticket/booking, waiting, baggage, crew room, timetable, and controlled gangway or vehicle ramp. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | DH-SC-01 | Two vessels or carriers claim the same berth under different valid schedules. |
| 2 | DH-SC-02 | A labor gang has assembled, but its gear was issued to a crew that never appeared. |
| 3 | DH-SC-03 | An arriving passenger's baggage bears a cargo seal and is being diverted to inspection. |
| 4 | DH-SC-04 | The weather or tide board has changed while the instrument or observer responsible still reports the earlier reading. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | DH-SP-G | The berth book reserves one arrival every week for a carrier no current worker has seen. | schedule and berth |
| Textured | DH-SP-T | One length of platform remains wet or frost-marked regardless of tide and weather. | one loading edge |
| Strange | DH-SP-S | The arrival board posts one vessel or vehicle a day before any message announces it. | route knowledge |
| Volatile | DH-SP-V | A cargo accepted under the wrong destination begins pulling its carrier toward that destination when departure starts. | manifest and movement |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Harbor House / Quay Office | Tide board, berth book, signal mast, cranes or tackle, gang muster, bonded shed and boat/cart access. |
| chrome | Port Control / Freight Interface | Traffic display, berth locks, cargo screening, powered lifts, secure holds, crew access, weather and system redundancy. |
| gloom | Dock Office / Ferry Terminal | Ticket or manifest counter, radio room, waiting, baggage and freight shed, gangway controls, back-lot loading and storm procedure. |

### Deterministic sample rolls

#### BF-LOGISTICS-01 — Warehouse — grounded-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-LOGISTICS/warehouse/grounded-frontier/0` → `2326900717`

Context tags: ordinary

- Chassis: **LG-CH-02** — Vehicle yard fronts covered loading sheds and deep storage; counting office and secure goods room overlook the shared handling court.
- Arrangement: **WH-AR-01** — Merchant warehouse with long-term owned bays, sample or inspection bench, counting office, and scheduled customer dispatch.
- State: **LG-ST-02** — Arrival surge: one carrier has delivered early and sorting or temporary storage is consuming a route.
- Scene: **WH-SC-01** — A sealed load occupies the correct bay but the seal belongs to a different owner.
- Spice: **Grounded / WH-SP-G** — One numbered bay has been paid for continuously although no employee remembers seeing it occupied.
- Realm: **frontier / Warehouse / Storehouse** — Cart court, loading doors, hoist, timber racks, seals and ledgers, watchman, roof and damp control.

#### BF-LOGISTICS-02 — Dock-House — textured-chrome

Seed: `BUILDING-FAMILY-TASTE/BF-LOGISTICS/dock-house/textured-chrome/1` → `3893452909`

Context tags: ordinary

- Chassis: **LG-CH-02** — Vehicle yard fronts covered loading sheds and deep storage; counting office and secure goods room overlook the shared handling court.
- Arrangement: **DH-AR-01** — Harbormaster or quay office with public berth desk, tide and arrival board, restricted platform access, signal gear, and incident records.
- State: **LG-ST-01** — Normal throughput: arriving, stored, and departing loads fit the handling and record capacity.
- Scene: **DH-SC-03** — An arriving passenger's baggage bears a cargo seal and is being diverted to inspection.
- Spice: **Textured / DH-SP-T** — One length of platform remains wet or frost-marked regardless of tide and weather.
- Realm: **chrome / Port Control / Freight Interface** — Traffic display, berth locks, cargo screening, powered lifts, secure holds, crew access, weather and system redundancy.

#### BF-LOGISTICS-03 — Warehouse — strange-gloom

Seed: `BUILDING-FAMILY-TASTE/BF-LOGISTICS/warehouse/strange-gloom/2` → `4000156554`

Context tags: ordinary

- Chassis: **LG-CH-04** — A long transit shed has numbered temporary bays, cross-aisles, a tally station, and direct loading edges on both long sides.
- Arrangement: **WH-AR-02** — Bonded store where seals, customs or authority, secure cages, and release orders control movement.
- State: **LG-ST-01** — Normal throughput: arriving, stored, and departing loads fit the handling and record capacity.
- Scene: **WH-SC-03** — A customer arrives with a valid release order for goods already staged for someone else.
- Spice: **Strange / WH-SP-S** — Goods placed in one bay acquire the smell and temperature of their intended destination.
- Realm: **gloom / Warehouse / Distribution Shed** — Truck dock or rail siding, pallets and shelves, receiving office, cages, inventory sheets, forklifts or hand gear, roof and utility risk.

#### BF-LOGISTICS-04 — Dock-House — volatile-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-LOGISTICS/dock-house/volatile-frontier/3` → `1166724371`

Context tags: `licensed-world-adapter`

- Chassis: **LG-CH-06** — Waterside or vehicle-side house bridges a public paperwork front to a restricted loading platform, with manifests, gear, short-term storage, and staff rest behind.
- Arrangement: **DH-AR-01** — Harbormaster or quay office with public berth desk, tide and arrival board, restricted platform access, signal gear, and incident records.
- State: **LG-ST-04** — Hazard or access loss: weather, damage, contamination, labor dispute, tide, or vehicle failure has closed one handling edge.
- Scene: **DH-SC-03** — An arriving passenger's baggage bears a cargo seal and is being diverted to inspection.
- Spice: **Volatile / DH-SP-V** — A cargo accepted under the wrong destination begins pulling its carrier toward that destination when departure starts.
- Realm: **frontier / Harbor House / Quay Office** — Tide board, berth book, signal mast, cranes or tackle, gang muster, bonded shed and boat/cart access.

## BF-SHOP-WORKSHOP — Shop / Workshop

A customer or commission edge connects to transaction, stock, work or preparation where required, secure material, utilities and waste, operator position, and delivery.

**Family forbids:**

- A family chassis is occupation-neutral; printer, smith, apothecary, or other source occupants never migrate with geometry.
- Each program must supply its own work, safety, storage, and professional-service obligations.

### Chassis taste tranche (d6)

| d6 | id | scale | requires | sample relationship |
| --- | --- | --- | --- | --- |
| 1 | SW-CH-01 | small-to-medium | ordinary context | Street counter leads to a rear workroom, secure store, and service yard with delivery and waste access. |
| 2 | SW-CH-02 | medium | ordinary context | Open work bay faces a customer edge; materials occupy a side room while office, valuables, and records sit behind the operator. |
| 3 | SW-CH-03 | small-live-work | ordinary context | Domestic front room serves customers beside an attached workshop; a rear delivery passage separates supplies and waste from household access. |
| 4 | SW-CH-04 | small-hosted | ordinary context | Arcade stall owns a lockable counter and demonstration surface while a shared back passage reaches a dedicated store or offsite workshop. |
| 5 | SW-CH-05 | small-to-medium | ordinary context | Corner shop combines two display fronts, a screened consultation or fitting alcove, rear work/preparation, and a cool or secure cellar. |
| 6 | SW-CH-06 | medium-to-large | ordinary context | Yard-front workshop places noisy, hot, bulky, or hazardous work in a covered bay; office/counter, material shed, and delivery gate stay separately controllable. |

### Operating-state taste tranche (d4)

| d4 | id | sample state |
| --- | --- | --- |
| 1 | SW-ST-01 | Ordinary trade: work, stock, customer service, utilities, and delivery are balanced. |
| 2 | SW-ST-02 | Demand backlog: customer orders, consultations, preparations, repairs, or commissions exceed the current operator's time or safe capacity. |
| 3 | SW-ST-03 | Supply shortage: one controlled material or external provider is delaying otherwise valid work. |
| 4 | SW-ST-04 | Inspection or repair: one work surface, utility, safety control, or storage zone is unavailable and changes service. |

### Smithy program layer

Invariants: metalwork service · heat/power · work and quench/cooling · material stock · tool and commission custody · ventilation/fire safety · delivery

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | SM-AR-01 | all family chassis | Repair smith with public commission desk, general forge, quench, parts stock, and an active queue of ordinary tools and fittings. |
| 2 | SM-AR-02 | chassis SW-CH-02, SW-CH-06 | Production forge with repeated work stations, fuel and bar stock, finishing bench, quality check, and dispatch for contracted batches. |
| 3 | SM-AR-03 | all family chassis | Armorer with fitting space, secure finished stock, heatwork separated from customers, and records for issued or commissioned protection. |
| 4 | SM-AR-04 | chassis SW-CH-01, SW-CH-02, SW-CH-06 | Farrier or vehicle smith with yard access, animal or chassis restraint, hoof/wheel fittings, forge, and safe waiting edge. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | SM-SC-01 | An expensive commission is complete, but the person named to collect it denies ordering it. |
| 2 | SM-SC-02 | A cracked tool from a local crew reveals the same flaw in several pieces from one material batch. |
| 3 | SM-SC-03 | The quench or cooling system has been reserved for urgent work that has not yet arrived. |
| 4 | SM-SC-04 | A customer demands a repair while refusing to surrender the damaged object's concealed attachment. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | SM-SP-G | An expensive commission remains uncollected while storage fees quietly exceed its final payment. | commission custody |
| Textured | SM-SP-T | A sealed chimney or power duct implies an inaccessible former hearth or work bay. | workshop history and ventilation |
| Strange | SM-SP-S | Tools return to their assigned places and continue the last motion taught by a dead master. | tool behavior |
| Volatile | SM-SP-V | Metal worked here refuses to cross one named threshold while hot. | heatwork and circulation |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Smithy / Forge | Forge and fuel, bellows or draft, anvil and benches, quench, bar/scrap stock, yard delivery, sparks and fire control. |
| chrome | Fabrication Shop / Machine Bay | Powered tools, welding or thermal work, ventilation, parts racks, inspection, secure commissions and loading bay. |
| gloom | Repair Garage / Metal Shop | Service counter, work bays, torch or welder, parts cage, fluids and waste, lift or yard, job tickets and practical fire safety. |

### Apothecary program layer

Invariants: customer recognition · consultation/instruction · preparation or real provider · stock and controlled substances · water/heat/cold/ventilation · sanitation/waste · responsible practitioner

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | AP-AR-01 | all family chassis | Retail dispensary with front counter, screened advice, rear compounding, ordinary stock, controlled cabinet, and delivery record. |
| 2 | AP-AR-02 | all family chassis | Consultation practice with waiting, private examination or counsel, small preparation room, medicine store, wash point, and patient notes. |
| 3 | AP-AR-03 | all family chassis | Domestic herbal practice with customer room, drying and preparation, garden or supplier relation, cool store, and household boundary. |
| 4 | AP-AR-04 | all family chassis | Clinic-apothecary with triage counter, treatment room, dispensary, cold or secure stock, sanitation, and separate clinical waste. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | AP-SC-01 | An assistant is preparing a renewal signed before the physician or authorizing practitioner died. |
| 2 | AP-SC-02 | Two remedies with similar labels require opposite storage, and one has been returned to the wrong shelf. |
| 3 | AP-SC-03 | A supplier offers the missing ingredient only if the practitioner accepts an unrecorded substitute batch. |
| 4 | AP-SC-04 | A patient reports a side effect that matches another customer's formula rather than their own. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | AP-SP-G | A renewable prescription bears the signature of a practitioner known to be dead. | authorization and records |
| Textured | AP-SP-T | The cold store remains cold without a visible mechanism, but its temperature log is otherwise ordinary. | stock storage |
| Strange | AP-SP-S | Several remedies consistently treat a different mapped condition than the wording on their labels. | diagnosis and labels |
| Volatile | AP-SP-V | One preparation transfers a symptom into the next person who enters the consultation alcove. | treatment and room use |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Apothecary / Herbalist | Herbs and compounds, drying or supplier route, scales and preparation, water and heat, cool/secure stock, consultation and waste. |
| chrome | Unlicensed Clinic / Med Shop | Waiting and diagnostic surface, cold storage, sterile preparation, disposables, locked drugs, ventilation and clinical waste. |
| gloom | Drugstore / Back Clinic | Prescription counter, shelves and stockroom, back consultation, refrigerator, sink and sanitation, controlled cabinet, delivery and records. |

### General Store program layer

Invariants: broad ordinary stock · display and request · transaction · back stock · delivery · inventory and credit · responsible shopkeeper

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | GS-AR-01 | all family chassis | Counter store with dense shelves, requested goods behind the keeper, back stock, bulk delivery, and household credit book. |
| 2 | GS-AR-02 | all family chassis | Open browse shop with visible ordinary goods, staffed counter, secure valuables, packing bench, and rear receiving. |
| 3 | GS-AR-03 | all family chassis | Supply depot serving travelers or crews through prepacked kits, bulk staples, special orders, and a loading yard. |
| 4 | GS-AR-04 | all family chassis | Village store and post or message counter sharing one public room while parcels, stock, accounts, and private correspondence remain separated. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | GS-SC-01 | The last unit of an ordinary necessity has been promised to two customers under different forms of credit. |
| 2 | GS-SC-02 | A special order arrived correctly addressed but contains the standard goods for another climate or region. |
| 3 | GS-SC-03 | A supplier's invoice proves several shelf prices are now below replacement cost. |
| 4 | GS-SC-04 | A returned kit is complete except for one cheap item whose absence makes the rest unsafe to use. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | GS-SP-G | The credit book carries a household that no longer exists, yet someone keeps making exact payments. | credit and customer identity |
| Textured | GS-SP-T | One shelf is always stocked in the order customers will request its goods that day. | display and demand |
| Strange | GS-SP-S | A sealed travel kit contains one modest item appropriate to the buyer's next serious delay. | one stocked kit |
| Volatile | GS-SP-V | Goods purchased on credit begin wearing the marks of the lender's household until the debt is settled. | credit and ownership |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | General Store / Provisioner | Counter and shelves, bulk bins, rope and tools, back stock, delivery yard, handwritten orders and household credit. |
| chrome | Supply Kiosk / Utility Mart | Modular goods, locked technical stock, pickup counter, inventory system, parcel lockers, loading or courier edge. |
| gloom | Hardware and Grocery / Corner Store | Aisles and counter, stockroom, cooler or utility goods, loading alley, layaway or account book, local parcel service. |

### Arcanist's Shop program layer

Invariants: specialist consultation · components or bounded works · demonstration/verification · hazard and access control · secure stock · records/provenance · responsible practitioner

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | AR-AR-01 | all family chassis | Component shop with consultation counter, ordinary reagents, locked rare stock, verification bench, and controlled disposal. |
| 2 | AR-AR-02 | all family chassis | Scroll, pattern, or encoded-work dealer with reading desk, copying or activation room, secure archive, and provenance records. |
| 3 | AR-AR-03 | all family chassis | Commission workshop with customer interview, isolated fabrication cell, test surface, material store, and collection protocol. |
| 4 | AR-AR-04 | all family chassis | Appraisal and ward service with intake quarantine, diagnostic bench, consultation, secure hold, and return or escalation route. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | AR-SC-01 | A component passes every test but its provenance belongs to a batch recorded as destroyed. |
| 2 | AR-SC-02 | A customer wants an appraisal without allowing the object to cross the shop's intake boundary. |
| 3 | AR-SC-03 | A completed commission responds correctly to the wrong authorized user. |
| 4 | AR-SC-04 | The disposal container is full because one harmless residue refuses to become inert. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | AR-SP-G | A rare component's provenance record names a perfectly ordinary supplier who denies ever handling it. | stock provenance |
| Textured | AR-SP-T | The demonstration surface retains a faint diagram of the last failed test until a successful one replaces it. | verification history |
| Strange | AR-SP-S | One locked drawer opens only when the requester accurately states what they will not use its contents for. | secure stock permission |
| Volatile | AR-SP-V | Any unreceipted component leaving the shop causes its storage condition to manifest around the carrier. | stock custody and theft |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Arcanist / Charmwright | Component drawers, consultation, inscribed or worked bench, locked cabinet, test circle or safe surface, provenance and disposal. |
| chrome | Esoteric Tech / Black Clinic | Controlled components, diagnostic instruments, isolated work cell, access logs, shielding or ventilation, hazardous waste and secure pickup. |
| gloom | Occult Supply / Repair Office | Front counter, reference files, back workroom, locked case, test bench, practical containment, alley delivery and discreet appointments. |

### Deterministic sample rolls

#### BF-SHOP-WORKSHOP-01 — Smithy — grounded-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-SHOP-WORKSHOP/smithy/grounded-frontier/0` → `3724269599`

Context tags: ordinary

- Chassis: **SW-CH-01** — Street counter leads to a rear workroom, secure store, and service yard with delivery and waste access.
- Arrangement: **SM-AR-04** — Farrier or vehicle smith with yard access, animal or chassis restraint, hoof/wheel fittings, forge, and safe waiting edge.
- State: **SW-ST-02** — Demand backlog: customer orders, consultations, preparations, repairs, or commissions exceed the current operator's time or safe capacity.
- Scene: **SM-SC-03** — The quench or cooling system has been reserved for urgent work that has not yet arrived.
- Spice: **Grounded / SM-SP-G** — An expensive commission remains uncollected while storage fees quietly exceed its final payment.
- Realm: **frontier / Smithy / Forge** — Forge and fuel, bellows or draft, anvil and benches, quench, bar/scrap stock, yard delivery, sparks and fire control.

#### BF-SHOP-WORKSHOP-02 — Apothecary — textured-chrome

Seed: `BUILDING-FAMILY-TASTE/BF-SHOP-WORKSHOP/apothecary/textured-chrome/1` → `322684468`

Context tags: ordinary

- Chassis: **SW-CH-03** — Domestic front room serves customers beside an attached workshop; a rear delivery passage separates supplies and waste from household access.
- Arrangement: **AP-AR-01** — Retail dispensary with front counter, screened advice, rear compounding, ordinary stock, controlled cabinet, and delivery record.
- State: **SW-ST-02** — Demand backlog: customer orders, consultations, preparations, repairs, or commissions exceed the current operator's time or safe capacity.
- Scene: **AP-SC-03** — A supplier offers the missing ingredient only if the practitioner accepts an unrecorded substitute batch.
- Spice: **Textured / AP-SP-T** — The cold store remains cold without a visible mechanism, but its temperature log is otherwise ordinary.
- Realm: **chrome / Unlicensed Clinic / Med Shop** — Waiting and diagnostic surface, cold storage, sterile preparation, disposables, locked drugs, ventilation and clinical waste.

#### BF-SHOP-WORKSHOP-03 — General Store — strange-gloom

Seed: `BUILDING-FAMILY-TASTE/BF-SHOP-WORKSHOP/general/strange-gloom/2` → `1107788976`

Context tags: ordinary

- Chassis: **SW-CH-04** — Arcade stall owns a lockable counter and demonstration surface while a shared back passage reaches a dedicated store or offsite workshop.
- Arrangement: **GS-AR-01** — Counter store with dense shelves, requested goods behind the keeper, back stock, bulk delivery, and household credit book.
- State: **SW-ST-01** — Ordinary trade: work, stock, customer service, utilities, and delivery are balanced.
- Scene: **GS-SC-04** — A returned kit is complete except for one cheap item whose absence makes the rest unsafe to use.
- Spice: **Strange / GS-SP-S** — A sealed travel kit contains one modest item appropriate to the buyer's next serious delay.
- Realm: **gloom / Hardware and Grocery / Corner Store** — Aisles and counter, stockroom, cooler or utility goods, loading alley, layaway or account book, local parcel service.

#### BF-SHOP-WORKSHOP-04 — Arcanist's Shop — volatile-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-SHOP-WORKSHOP/arcanist/volatile-frontier/3` → `3698137799`

Context tags: `licensed-world-adapter`

- Chassis: **SW-CH-03** — Domestic front room serves customers beside an attached workshop; a rear delivery passage separates supplies and waste from household access.
- Arrangement: **AR-AR-01** — Component shop with consultation counter, ordinary reagents, locked rare stock, verification bench, and controlled disposal.
- State: **SW-ST-02** — Demand backlog: customer orders, consultations, preparations, repairs, or commissions exceed the current operator's time or safe capacity.
- Scene: **AR-SC-01** — A component passes every test but its provenance belongs to a batch recorded as destroyed.
- Spice: **Volatile / AR-SP-V** — Any unreceipted component leaving the shop causes its storage condition to manifest around the carrier.
- Realm: **frontier / Arcanist / Charmwright** — Component drawers, consultation, inscribed or worked bench, locked cabinet, test circle or safe surface, provenance and disposal.

## BF-MARKET-EXCHANGE — Market / Exchange (proposed eighth family)

A publicly legible trading ground allocates pitches or bays, admits goods and buyers on a schedule, exposes inspection and common measure, records price or obligation, supports delivery and clearing, and closes without erasing ownership or access truth.

**Family forbids:**

- No civic chamber, warehouse, or row of unrelated shops may replace the trading-ground program merely because it shares the building.
- Stalls, samples, standards, and goods are assigned operating surfaces, not undifferentiated market dressing.
- An optional upper program must declare its own Civic, Logistics, or Exchange obligations while the ground-floor market remains independently legible.

### Chassis taste tranche (d6)

| d6 | id | scale | requires | sample relationship |
| --- | --- | --- | --- | --- |
| 1 | ME-CH-01 | small-to-medium | ordinary context | Open-post market house: a roofed rectangular trading floor is divided by repeated structural bays, with open cross-access, an authority-and-measure position, and loading or clearing at one short end. |
| 2 | ME-CH-02 | medium | ordinary context | Pier-and-arch hall: a heavier open arcade encloses a durable market floor, with perimeter pitch lines, two public approaches, a lockable standards room, and a service edge. |
| 3 | ME-CH-03 | medium-to-large | ordinary context | Long exchange hall: a broad central aisle separates parallel trading bays while an inspection rail, clerk position, sample hold, and end loading doors keep bargaining distinct from bulk movement. |
| 4 | ME-CH-04 | distributed | ordinary context | Court-and-arcade market: permanent covered bays line one or more sides of an open court, with a common measure point, removable fair pitches, drainage, and several closure gates. |
| 5 | ME-CH-05 | medium-to-large | ordinary context | Two-level market house: an open trading ground and lockable count room sit below an external or controlled stair to a separately accountable upper program; delivery and public circulation do not pass through that upper room. |
| 6 | ME-CH-06 | large-regional | ordinary context | Deep cloth-hall lattice: repeated arcaded or post bays flank a continuous inspection-and-display route, with folding or sample tables, secure standards and records, side delivery courts, and an upper storage or bargaining range. |

### Operating-state taste tranche (d4)

| d4 | id | sample state |
| --- | --- | --- |
| 1 | ME-ST-01 | Opening and allocation: officials, keepers, or elected traders assign pitches, check rights, set out standards, and separate deliveries from the arriving public. |
| 2 | ME-ST-02 | Full trade: bargaining, inspection, weighing, payment, replenishment, and crowd movement compete for the same legible bays and aisles. |
| 3 | ME-ST-03 | Clearing and closure: portable pitches are struck, unsold goods are attributed and removed or secured, accounts close, refuse leaves, and public routes reopen. |
| 4 | ME-ST-04 | Assay or dispute session: one standard, lot, allocation, price, or right to trade is under public examination while the rest of the market continues around it. |

### Guest upper-program composition proofs

These cards test co-location without transferring ownership of the trading ground.

| id | guest family | guest program | legal host chassis | composition contract |
| --- | --- | --- | --- | --- |
| ME-GC-01 | BF-CIVIC-AUTHORITY | Council chamber or Court | ME-CH-05 | The market ground keeps its own pitches, measure, schedule, delivery, closure, and authority. A separately reached upper council chamber or court consumes Civic/Authority threshold, decision, staff, and records obligations without commandeering the trading floor. |
| ME-GC-02 | BF-LOGISTICS | Attributed storage, sampling, or dispatch | ME-CH-05, ME-CH-06 | Upper or side storage receives named lots from the market's delivery edge through a controlled goods route. Logistics owns custody, handling, count, and dispatch; the public floor still owns allocation, inspection, price, and market hours. |
| ME-GC-03 | BF-MARKET-EXCHANGE | Exchange / Cloth Hall upper range | ME-CH-05, ME-CH-06 | An upper bargaining, sample, or record hall relates registered contracts and lots to the market below through attributed stairs and goods routes. It extends the family but does not make the public ground optional. |

### Market Hall program layer

Invariants: public trading ground · pitch or bay allocation · goods arrival and clearing · common measure or inspection · price/payment practice · market schedule and closure · accountable market authority

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | MH-AR-01 | all family chassis | Daily provisions market with assigned food and household-goods bays, a common scale, early delivery, public trading hours, wash-down, and same-day clearing. |
| 2 | MH-AR-02 | all family chassis | Periodic town market whose permanent hall stores standards and allocation records while removable pitches and carts expand onto an adjoining court on market day. |
| 3 | MH-AR-03 | all family chassis | Mixed market with several licensed permanent counters at the sheltered edge and numbered temporary pitches on the central floor, all sharing inspection and closure rules. |
| 4 | MH-AR-04 | all family chassis | Wholesale-first hall where bulk lots are inspected and priced before dawn, then broken into smaller public sales while separate delivery and buyer routes remain active. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | MH-SC-01 | Two traders hold valid-looking allocations for the same numbered pitch, and opening cannot finish until the authority record is reconciled. |
| 2 | MH-SC-02 | The common scale is accurate, but a legal local weight now differs from the standard stamped into several prepaid deliveries. |
| 3 | MH-SC-03 | A late cart blocks the clearing route while its perishable load is owed to buyers already waiting at three different bays. |
| 4 | MH-SC-04 | An order closes one category of trade at midday, leaving goods, deposits, and promised collection times that still belong to named people. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | MH-SP-G | Old pitch marks beneath the current numbering prove one narrow bay was quietly removed from the allocation book. | allocation and floor history |
| Textured | MH-SP-T | A suspended balance rings at a distinct pitch whenever a weighed lot contains goods from two declared origins. | inspection and provenance |
| Strange | MH-SP-S | At the opening call, each numbered bay casts the shadow of the goods contractually promised there, including one promise no trader admits making. | allocation and obligation |
| Volatile | MH-SP-V | A licensed market bell shifts one complete, attributed pitch between two approved trading grounds at closure; goods, keeper, records, routes, and claims move together. | market location and closure |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Market House / Covered Market | Timber posts or stone arcades shelter numbered pitches, common beam and stamped weights, clerk or reeve, cart edge, wash-down and a bell-governed market day. |
| chrome | Wholesale Concourse / Regulated Market | Modular vendor bays, booking and identity gates, calibrated inspection stations, live price boards, cold or secure services, freight edge and timed public access. |
| gloom | Municipal Market Shed / Produce Hall | Painted stall numbers, concrete or iron bays, scale office, cash and account counter, loading alley, drains and refuse route, shutters and posted market hours. |

### Exchange / Cloth Hall program layer

Invariants: commodity or contract identity · inspection and sample relationship · bargaining or price publication · standards and records · secure lot/sample custody · bulk delivery relationship · accountable exchange authority

Layer meaning: operating arrangement

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | EX-AR-01 | all family chassis | Cloth hall with long merchant bays, daylight inspection, measuring and folding tables, stamped quality records, secure samples, and bulk bales entering from side courts. |
| 2 | EX-AR-02 | all family chassis | Commodity exchange where samples and lot records reach a bargaining floor while the physical bulk remains in attributed stores connected to a timed delivery edge. |
| 3 | EX-AR-03 | all family chassis | Merchants' exchange with posted prices, agent benches, private bargaining recesses, contract registration, settlement, and an arbitration room reached without crossing secure records. |
| 4 | EX-AR-04 | all family chassis | Seasonal fair hall whose permanent standards, clerk, sample store, and dispute process support a changing licensed commodity and temporary merchant roster. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | EX-SC-01 | A sealed sample passes inspection, but the attributed bulk lot arriving at the side court carries a different handling mark. |
| 2 | EX-SC-02 | Two recognized standards produce different grades for the same cloth, and both authorities have buyers waiting on the result. |
| 3 | EX-SC-03 | The posted price changed during a delayed message interval, leaving matched contracts that are legal under different recorded minutes. |
| 4 | EX-SC-04 | A registered merchant has vanished after assigning both a sample and a delivery obligation to different agents with valid seals. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | EX-SP-G | A retired assay stamp appears on one current lot record and on no physical bale yet admitted to the hall. | standards and provenance |
| Textured | EX-SP-T | The north inspection light reveals repairs and substitutions that disappear under every lamp used elsewhere in the hall. | inspection surface |
| Strange | EX-SP-S | A retained sample changes scent and temperature to match the present storage condition of its attributed bulk lot. | sample-to-lot relationship |
| Volatile | EX-SP-V | When a contract is publicly settled, its attributed lot acquires the hall's mark wherever it physically rests; forged settlement can therefore move both title and danger. | record, title, and remote lot |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Cloth Hall / Wool Exchange | Long arcaded hall, cloth or sample bays, daylight tables, beam and measures, guild or town clerk, sealed records, bale court and upper store or bargaining room. |
| chrome | Commodity Exchange / Clearing Hall | Credentialed trading floor, certified sample lab, market data and bid surfaces, contract clearing, bonded custody, freight-system links and controlled records. |
| gloom | Produce Exchange / Merchants' Hall | Inspection tables under high windows, chalk price board or ticker, agent rail, sample cages, stamped tickets, warehouse and rail or truck transfer, arbitration office. |

### Deterministic sample rolls

#### BF-MARKET-EXCHANGE-01 — Market Hall — grounded-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-MARKET-EXCHANGE/market-hall/grounded-frontier/0` → `1890023939`

Context tags: ordinary

- Chassis: **ME-CH-04** — Court-and-arcade market: permanent covered bays line one or more sides of an open court, with a common measure point, removable fair pitches, drainage, and several closure gates.
- Arrangement: **MH-AR-01** — Daily provisions market with assigned food and household-goods bays, a common scale, early delivery, public trading hours, wash-down, and same-day clearing.
- State: **ME-ST-03** — Clearing and closure: portable pitches are struck, unsold goods are attributed and removed or secured, accounts close, refuse leaves, and public routes reopen.
- Scene: **MH-SC-02** — The common scale is accurate, but a legal local weight now differs from the standard stamped into several prepaid deliveries.
- Spice: **Grounded / MH-SP-G** — Old pitch marks beneath the current numbering prove one narrow bay was quietly removed from the allocation book.
- Realm: **frontier / Market House / Covered Market** — Timber posts or stone arcades shelter numbered pitches, common beam and stamped weights, clerk or reeve, cart edge, wash-down and a bell-governed market day.

#### BF-MARKET-EXCHANGE-02 — Exchange / Cloth Hall — textured-chrome

Seed: `BUILDING-FAMILY-TASTE/BF-MARKET-EXCHANGE/exchange-cloth-hall/textured-chrome/1` → `3435509390`

Context tags: ordinary

- Chassis: **ME-CH-04** — Court-and-arcade market: permanent covered bays line one or more sides of an open court, with a common measure point, removable fair pitches, drainage, and several closure gates.
- Arrangement: **EX-AR-04** — Seasonal fair hall whose permanent standards, clerk, sample store, and dispute process support a changing licensed commodity and temporary merchant roster.
- State: **ME-ST-01** — Opening and allocation: officials, keepers, or elected traders assign pitches, check rights, set out standards, and separate deliveries from the arriving public.
- Scene: **EX-SC-01** — A sealed sample passes inspection, but the attributed bulk lot arriving at the side court carries a different handling mark.
- Spice: **Textured / EX-SP-T** — The north inspection light reveals repairs and substitutions that disappear under every lamp used elsewhere in the hall.
- Realm: **chrome / Commodity Exchange / Clearing Hall** — Credentialed trading floor, certified sample lab, market data and bid surfaces, contract clearing, bonded custody, freight-system links and controlled records.

#### BF-MARKET-EXCHANGE-03 — Market Hall — strange-gloom

Seed: `BUILDING-FAMILY-TASTE/BF-MARKET-EXCHANGE/market-hall/strange-gloom/2` → `893695740`

Context tags: ordinary

- Chassis: **ME-CH-02** — Pier-and-arch hall: a heavier open arcade encloses a durable market floor, with perimeter pitch lines, two public approaches, a lockable standards room, and a service edge.
- Arrangement: **MH-AR-04** — Wholesale-first hall where bulk lots are inspected and priced before dawn, then broken into smaller public sales while separate delivery and buyer routes remain active.
- State: **ME-ST-04** — Assay or dispute session: one standard, lot, allocation, price, or right to trade is under public examination while the rest of the market continues around it.
- Scene: **MH-SC-02** — The common scale is accurate, but a legal local weight now differs from the standard stamped into several prepaid deliveries.
- Spice: **Strange / MH-SP-S** — At the opening call, each numbered bay casts the shadow of the goods contractually promised there, including one promise no trader admits making.
- Realm: **gloom / Municipal Market Shed / Produce Hall** — Painted stall numbers, concrete or iron bays, scale office, cash and account counter, loading alley, drains and refuse route, shutters and posted market hours.

#### BF-MARKET-EXCHANGE-04 — Exchange / Cloth Hall — volatile-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-MARKET-EXCHANGE/exchange-cloth-hall/volatile-frontier/3` → `3885835280`

Context tags: `licensed-world-adapter`

- Chassis: **ME-CH-04** — Court-and-arcade market: permanent covered bays line one or more sides of an open court, with a common measure point, removable fair pitches, drainage, and several closure gates.
- Arrangement: **EX-AR-03** — Merchants' exchange with posted prices, agent benches, private bargaining recesses, contract registration, settlement, and an arbitration room reached without crossing secure records.
- State: **ME-ST-02** — Full trade: bargaining, inspection, weighing, payment, replenishment, and crowd movement compete for the same legible bays and aisles.
- Scene: **EX-SC-04** — A registered merchant has vanished after assigning both a sample and a delivery obligation to different agents with valid seals.
- Spice: **Volatile / EX-SP-V** — When a contract is publicly settled, its attributed lot acquires the hall's mark wherever it physically rests; forged settlement can therefore move both title and danger.
- Realm: **frontier / Cloth Hall / Wool Exchange** — Long arcaded hall, cloth or sample bays, daylight tables, beam and measures, guild or town clerk, sealed records, bale court and upper store or bargaining room.

## BF-CUSTODY — Prison / Custody

An authority receives identifiable people and property, classifies and assigns them to controlled holding, sustains service and routine, applies a disposition, and exposes precommitted routes to release, transfer, escape, rescue, force, failure, and aftermath.

**Family forbids:**

- No civic room list, cellblock label, or security skin substitutes for the eight custody circuits.
- No generated prison may require narrator mercy or one impossible check as its only exit.
- Prisoner property, case evidence, contraband, and institution property retain distinct identities even when they share a secure realization.

### Chassis taste tranche (d6)

| d6 | id | scale | requires | sample relationship |
| --- | --- | --- | --- | --- |
| 1 | CU-CH-01 | rung-a | ordinary context | Rung-A watchhouse: public keeper threshold, one controlled holding room or cell, staff-side property cabinet, external service route, and explicit release or transfer. |
| 2 | CU-CH-02 | rung-b | ordinary context | Keeper-house civic jail: street-facing keeper room, controlled inner threshold, short cell bank, raised landing, walled yard, intake-side property closet, and rear household/service access. |
| 3 | CU-CH-03 | rung-b-to-c | ordinary context | Ledger-and-shift jail: waiting and intake-search, staff-only attributed property, numbered holding children, count/handoff station, control landing, yard, and separate staff/service route. |
| 4 | CU-CH-04 | specialized | ordinary context | Bounded-liberty court: controlled outer gate surrounds rooms or wards, supervised common movement, visitor/account edge, services, and a strong release/re-arrest boundary. |
| 5 | CU-CH-05 | rung-c | ordinary context | Gallery wing: reception and classification feed repeated cells along an observed gallery, with staff spine, service hatches, yard or work route, property store, and emergency release. |
| 6 | CU-CH-06 | licensed-exceptional | licensed-world-adapter | Warded exceptional holding: one or more cells depend on a visible support, energy, name, living material, gravity, or suspension system with operator access, service rig, property destination, emergency release, and honest failure surfaces. |

### Operating-state taste tranche (d4)

| d4 | id | sample state |
| --- | --- | --- |
| 1 | CU-ST-01 | Routine custody: count, meals or service, visits or hearings, staff relief, and disposition proceed on their committed cadence. |
| 2 | CU-ST-02 | Admission or transfer surge: intake, search, classification, property, and assignment are under visible load. |
| 3 | CU-ST-03 | Overcapacity or restricted movement: classification and services are strained, but the compiler retains truthful routes and consequences. |
| 4 | CU-ST-04 | Partial containment failure: one force, permission, service, or control layer is damaged or desynchronized and alert has changed access. |

### Prison / Custody program layer

Invariants: authority/record · people/classification · access/observation · property/evidence · service/health · routine/contact · force/emergency · disposition/continuity

Layer meaning: custody doctrine / operating model

**Arrangement taste tranche (d4)**

| d4 | id | eligibility | sample arrangement |
| --- | --- | --- | --- |
| 1 | CU-AR-01 | chassis CU-CH-01, CU-CH-02 | Keeper-House Civic Custody: authority and several circuits concentrate in a named keeper and attached household while cells, property, yard, and service remain explicit. |
| 2 | CU-AR-02 | chassis CU-CH-02, CU-CH-03, CU-CH-04, CU-CH-05 | Ledger-and-Shift Civic Custody: numbered people and holdings, signed commitment/release, attributed property, count/handoff, and role-bound access survive staff change. |
| 3 | CU-AR-03 | chassis CU-CH-01 | Short-Hold Watchhouse: one operator combines intake, oversight, record, and release while a single holding, property cabinet, and external services preserve the complete lifecycle. |
| 4 | CU-AR-04 | chassis CU-CH-06; context licensed-world-adapter | Warded Exceptional Custody: a licensed world mechanism replaces some ordinary barriers but retains operator, support, service, property, disposition, emergency release, and all plan families. |

**Current-scene taste tranche (d4)**

| d4 | id | sample scene |
| --- | --- | --- |
| 1 | CU-SC-01 | The count is correct, but one held person is assigned to the wrong stable holding child and the reason matters before the next movement. |
| 2 | CU-SC-02 | A valid release or transfer order has arrived while the attributed property container cannot be reconciled with its receipt. |
| 3 | CU-SC-03 | A meal, water, waste, medical, repair, or operator-relief provider has missed its cadence, opening one route while worsening another condition. |
| 4 | CU-SC-04 | The disposition clock advances at the next handoff, but the authority record, keeper testimony, and prisoner's identity do not agree. |

**Spice taste tranche (band-selected d4 prototype)**

| band | id | sample Spice | surface |
| --- | --- | --- | --- |
| Grounded | CU-SP-G | One cell can be opened from inside because of a known maintenance fault scheduled for repair after the next transfer. | force surface and routine |
| Textured | CU-SP-T | A custody room exists in current records but is absent from the public plan; staff route references prove it is not invented on discovery. | knowledge and recorded topology |
| Strange | CU-SP-S | One lock recognizes legal disposition rather than its physical key, creating both a lawful route and a falsification target. | permission and release |
| Volatile | CU-SP-V | At shift change one holding changes physical destination while preserving its occupants, support demands, property links, and failure surfaces. | holding location and handoff |

**Realm-doctrine taste tranche**

| realm | venue label | material operating realization |
| --- | --- | --- |
| frontier | Gaol / Stockade / Keeper-House Jail | Commission or court claim, keeper or shift, cells/pen/yard, keys and records, property cabinet/store, household or civic services, road transfer and finite disposition. |
| chrome | Detention / Processing Unit | Identity and intake search, controlled property, modular or specialized holdings, access systems, surveillance, service and medical routes, shift handoff, emergency release. |
| gloom | County Jail / Lockup | Booking desk, holding cells or short block, property bags and evidence handoff, control booth or keeper station, meal and medical provider, court/road transfer and release desk. |

### Deterministic sample rolls

#### BF-CUSTODY-01 — Prison / Custody — grounded-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-CUSTODY/prison-custody/grounded-frontier/0` → `206926155`

Context tags: ordinary

- Chassis: **CU-CH-01** — Rung-A watchhouse: public keeper threshold, one controlled holding room or cell, staff-side property cabinet, external service route, and explicit release or transfer.
- Arrangement: **CU-AR-03** — Short-Hold Watchhouse: one operator combines intake, oversight, record, and release while a single holding, property cabinet, and external services preserve the complete lifecycle.
- State: **CU-ST-01** — Routine custody: count, meals or service, visits or hearings, staff relief, and disposition proceed on their committed cadence.
- Scene: **CU-SC-03** — A meal, water, waste, medical, repair, or operator-relief provider has missed its cadence, opening one route while worsening another condition.
- Spice: **Grounded / CU-SP-G** — One cell can be opened from inside because of a known maintenance fault scheduled for repair after the next transfer.
- Realm: **frontier / Gaol / Stockade / Keeper-House Jail** — Commission or court claim, keeper or shift, cells/pen/yard, keys and records, property cabinet/store, household or civic services, road transfer and finite disposition.

#### BF-CUSTODY-02 — Prison / Custody — textured-chrome

Seed: `BUILDING-FAMILY-TASTE/BF-CUSTODY/prison-custody/textured-chrome/1` → `3303125366`

Context tags: ordinary

- Chassis: **CU-CH-03** — Ledger-and-shift jail: waiting and intake-search, staff-only attributed property, numbered holding children, count/handoff station, control landing, yard, and separate staff/service route.
- Arrangement: **CU-AR-02** — Ledger-and-Shift Civic Custody: numbered people and holdings, signed commitment/release, attributed property, count/handoff, and role-bound access survive staff change.
- State: **CU-ST-02** — Admission or transfer surge: intake, search, classification, property, and assignment are under visible load.
- Scene: **CU-SC-03** — A meal, water, waste, medical, repair, or operator-relief provider has missed its cadence, opening one route while worsening another condition.
- Spice: **Textured / CU-SP-T** — A custody room exists in current records but is absent from the public plan; staff route references prove it is not invented on discovery.
- Realm: **chrome / Detention / Processing Unit** — Identity and intake search, controlled property, modular or specialized holdings, access systems, surveillance, service and medical routes, shift handoff, emergency release.

#### BF-CUSTODY-03 — Prison / Custody — strange-gloom

Seed: `BUILDING-FAMILY-TASTE/BF-CUSTODY/prison-custody/strange-gloom/2` → `3375518276`

Context tags: ordinary

- Chassis: **CU-CH-01** — Rung-A watchhouse: public keeper threshold, one controlled holding room or cell, staff-side property cabinet, external service route, and explicit release or transfer.
- Arrangement: **CU-AR-01** — Keeper-House Civic Custody: authority and several circuits concentrate in a named keeper and attached household while cells, property, yard, and service remain explicit.
- State: **CU-ST-03** — Overcapacity or restricted movement: classification and services are strained, but the compiler retains truthful routes and consequences.
- Scene: **CU-SC-04** — The disposition clock advances at the next handoff, but the authority record, keeper testimony, and prisoner's identity do not agree.
- Spice: **Strange / CU-SP-S** — One lock recognizes legal disposition rather than its physical key, creating both a lawful route and a falsification target.
- Realm: **gloom / County Jail / Lockup** — Booking desk, holding cells or short block, property bags and evidence handoff, control booth or keeper station, meal and medical provider, court/road transfer and release desk.

#### BF-CUSTODY-04 — Prison / Custody — volatile-frontier

Seed: `BUILDING-FAMILY-TASTE/BF-CUSTODY/prison-custody/volatile-frontier/3` → `63548360`

Context tags: `licensed-world-adapter`

- Chassis: **CU-CH-06** — Warded exceptional holding: one or more cells depend on a visible support, energy, name, living material, gravity, or suspension system with operator access, service rig, property destination, emergency release, and honest failure surfaces.
- Arrangement: **CU-AR-04** — Warded Exceptional Custody: a licensed world mechanism replaces some ordinary barriers but retains operator, support, service, property, disposition, emergency release, and all plan families.
- State: **CU-ST-02** — Admission or transfer surge: intake, search, classification, property, and assignment are under visible load.
- Scene: **CU-SC-03** — A meal, water, waste, medical, repair, or operator-relief provider has missed its cadence, opening one route while worsening another condition.
- Spice: **Volatile / CU-SP-V** — At shift change one holding changes physical destination while preserving its occupants, support demands, property links, and failure surfaces.
- Realm: **frontier / Gaol / Stockade / Keeper-House Jail** — Commission or court claim, keeper or shift, cells/pen/yard, keys and records, property cabinet/store, household or civic services, road transfer and finite disposition.

## Sampler verdict

The sample architecture composes without using the general d300 or retrying an
incompatible occupation. This is not yet a taste acceptance or runtime proof.
Every `programIdentityReadableBeforeDmInterpretation` field deliberately remains
`taste-call-required` until the founder reviews the rows and rolled combinations.

