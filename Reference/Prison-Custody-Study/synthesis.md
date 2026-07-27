# Prison / Custody Study — synthesis

date: 2026-07-25
status: INITIAL DEPTH + CULTURE/DOCTRINE PASS RETURNED — useful, declared gaps remain
authority note: this is an evidence record, not the live implementation contract;
current rules live in `docs/GOLDEN-SITES-CATALOG.md` and
`docs/SITE-6-PRISON-CUSTODY-SPEC.md`

## 1. One-sentence result

A prison/custody site is not a cellblock but a controlled lifecycle: an authority
admits identifiable people and property, separates permissions, sustains a routine,
applies a disposition, and eventually releases, transfers, loses, or is defeated by
them through a place whose services and counterplay are physically committed.

## 2. What the evidence changed

The accepted four-cell civic jail remains a strong first build. The Colonial
Williamsburg gaol directly supports a compact keeper-operated institution combining
keeper space, small separated prisoner rooms, a walled yard, undermining protection,
and household/service dependencies. Historic England likewise records village
lockups as simple one-cell boxes and shows how later prisons accumulated
classification, galleries, reception/property stores, kitchens, workshops,
infirmaries, laundries, and staff housing.

Five corrections follow:

1. **The evidence room is not the universal gear destination.** Confiscated prisoner
   property, crime evidence, contraband, and unattributed items are different custody
   classes. A small jail may secure several classes in one controlled cabinet/closet,
   but the item record must still distinguish owner, custodian, container, state, and
   permissible release. A larger institution promotes prisoner property into an
   intake/reception property store; crime evidence may remain separately secured or
   live at a court/watch/civic provider.
2. **Classification is a spatial load.** Legal status, age, sex, health, risk, debt,
   conviction, or local world-law categories may require separate rooms, children,
   blocks, institutions, or scheduled separation. “Four cells” does not mean four
   interchangeable boxes.
3. **Routine and services are part of containment.** Meals, water, waste, washing,
   health, work, visits, hearings, counts, staff relief, transfer, and emergency
   release create openings and burdens. A sealed cell with no credible service path
   is an illustration, not a functioning site.
4. **One architectural form cannot represent every doctrine.** Keeper-house jail,
   dormitory/ward, radial observation, gallery wing, work-yard, debtor liberty,
   island/perimeter, and adapted-host custody answer different purposes.
5. **The control deck is doctrine-dependent.** A raised landing is still the best
   first visual proof, but it must govern actual relationships. Later cards may use a
   household threshold, central hub, gallery, gate/harbour, work-yard station, or
   ward/winch control.

## 3. Evidence and inference discipline

### Observed

- measured plans/sections and historic building records;
- official site histories and catalogued administrative records;
- adopted standards and current operational policy; and
- accepted Genesis semantics/current implementation evidence.

### Synthesized for Genesis

- the eight operating circuits below;
- doctrine cards as correlated answers;
- property/evidence type separation;
- capture-plan grammar;
- growth-ladder promotion triggers; and
- asset and receipt demands.

### Fantasy adapters

Living ironwood, impossible voids, gravity, portals, sentient wards, and supernatural
containment are licensed by Genesis world facts, not by analogy to historic punishment.
They must preserve the same operating questions and expose their own support, service,
access, failure, and counterplay.

## 4. Relational grammar

### Primary spatial sentence

*A public or transfer threshold receives a person and their possessions; an operator
converts that arrival into a controlled identity and holding, while staff/service routes
maintain the boundary and scheduled movements create both institutional power and
playable openings.*

### Required masses and edges

1. **Authority/public edge** — commission, desk, gate, harbour, court handoff, sponsor,
   or other testable claim.
2. **Intake/transfer edge** — identity, search, commitment, property handoff, and
   assignment.
3. **Custody mass** — cells, ward, pen, cage, liberty boundary, house, block, or
   exceptional holding.
4. **Control relation** — threshold, landing, gallery, hub, station, wall walk,
   harbour, work-yard post, or ward control.
5. **Service edge** — food, water, waste, washing, health, repair, fuel/energy, and
   staff relief.
6. **Disposition edge** — hearing, ransom, work, sentence, transfer, release,
   disappearance, execution, treatment, or world-specific resolution.
7. **Counterplay edges** — social/legal, routine/procedural, covert/secret, force/
   disruption, and licensed environment/realm interactions.

The same doorway may serve multiple edges at Rung A. Promotion separates them only when
capacity, throughput, hazard, dignity, doctrine, or security pressure requires it.

## 5. Eight operating circuits

| circuit | required facts | typical spatial consequences | player levers |
|---|---|---|---|
| authority / record | who may hold; claim/warrant/oath/sponsor; identity; reason; clock; release authority | public notice/desk, register or witness station, court/command/provider relation | prove error, invoke authority, expose corruption, substitute claim, destroy or preserve proof |
| people / classification | stable person ids; capacity; category; assigned child; compatibility/separation | cells/rooms/wards/blocks, scheduled separation, overflow state | switch identity/assignment, ally, protect, provoke reclassification, exploit overflow |
| access / observation | operator; keys/seals/names/rank/wards; sight/ward coverage; handoff | controlled thresholds, landing/gallery/hub, interlock, permission views | deceive, borrow/steal permission, isolate operator, blind control, seize deck |
| property / evidence | exact item ids; class; owner/source; custodian; container/location; seal/state; release rule | intake/search surface, cabinet/closet/store, external provider route | recover, switch, prove, contaminate, transfer, reveal dangerous item, restore identity |
| service / health | food, water, waste, washing, air/heat, bedding, medical, maintenance, staff relief | yard/privy/cistern, hatches, rear route, kitchen/infirmary at scale, suspended service rig | interrupt, bargain, repair, contaminate, overload, follow service route |
| routine / contact | count, meal, yard, work, visit, worship, hearing, bath, medical, transfer | scheduled crossings, yard/work route, visitor barrier, hearing/chapel/workshop | time movement, arrange contact, create discrepancy, hide in flow, trigger delay |
| force / emergency | locks/barriers/support, response, alarm, fire/flood/riot plan, emergency release | breakable surfaces, alarm path, staff route, evacuation gate, support/winch | breach, jam, burn/flood, riot, cut support, force triage, accept persistent damage |
| disposition / continuity | next consequence; release/transfer conditions; aftermath; property return | exit/escort route, court/harbour/road link, release desk/property issue | win release, redirect transfer, escape before clock, leave pursuit/debt/damage behind |

No circuit is satisfied by prose alone. If a service is external, its provider,
delivery edge, access, schedule, and failure state still exist.

## 6. Property and evidence verdict

### Four property classes

1. **Prisoner property** — attributable personal items removed on admission or later
   held for safety/rules.
2. **Crime/case evidence** — items held because a court/watch/investigation claims
   evidentiary value.
3. **Contraband/unauthorized property** — attributed or unattributed items whose
   possession violates the current regime.
4. **Institution property** — issued clothing, bedding, tools, keys, restraints,
   records, and supplies.

The classes may share a secured room only at low volume and when access rules permit.
They may never share identity semantics.

### Small-site realization

`PR-SHAPE-01` uses a staff-only property closet or large secured cabinet reached from
the intake/keeper side, not through the cell room. Each confiscated exact item id gains:

- `propertyClass`;
- `sourceOwnerId`;
- `currentCustodianId`;
- `containerId` and `locationId`;
- `sealOrTagId` when the doctrine uses one;
- `custodyReason`;
- `custodyState`;
- `admissionEventId`;
- `releaseAuthorityId`; and
- identity-preserving return/transfer/disposal events.

Low-volume case evidence may use a distinct locked container in the same secure edge.
When evidence load, hazard, court ownership, or access differs, a dedicated/external
civic provider is required.

### Larger realization

Rung C normally separates admission/search, attributed prisoner property, records, and
case evidence according to throughput. That is a promotion caused by operation, not an
automatic “big prison needs an evidence room” checklist.

## 7. Form families

| form | custody premise | characteristic relationships | Site 6 use |
|---|---|---|---|
| watchhouse / lockup | short hold by local operator | one room/cell, public keeper threshold, property cabinet, external services | Rung A degradation |
| keeper-house civic jail | named keeper under court/civic claim | attached keeper/public space, few separated rooms/cells, walled yard, household service | Golden Seed doctrine 1 |
| ledger-and-shift jail | process survives staff change | distinct intake/property, numbered children, handoff/count, staff/service edge | Golden Seed doctrine 2 |
| courtyard / bounded liberty | movement allowed inside a claimed boundary | rooms/wards around court or precinct, visitors/trade/account, strong exit boundary | later debt/hostage candidate |
| gallery / parallel wing | repeated classification and supervision | multi-tier cells, galleries, staff/control spine, specialized reception/service | Rung C/D |
| radial observation | separation/observation doctrine | hub, radial wings, isolated movement, high service/control burden | later candidate, not universal |
| congregate work-yard | custody organized around labor movement | accommodation ↔ count/tool ↔ work ↔ return; escort/service loops | Site 6 + Site 5 handoff |
| perimeter / transport | environment or distance carries containment | wall/island/fortress, harbour/gate, supply and transfer, external work route | later landscape host |
| adapted host | house, camp, monastery, fortress, workhouse, ruin changed into custody | original circulation plus explicit custody mutations | cross-site adapter |
| warded exceptional holding | world mechanism replaces some ordinary barriers | operator/energy/support, access, service, emergency release, failure surfaces | licensed fantasy adapter |

One roll chooses a coherent premise and may retain historic layers. It does not combine
radial wings, island exile, debtor liberty, and hanging cells for variety.

## 8. Culture and doctrine verdict

The first comparison pair is now selected in
`culture-doctrine-cards.md`:

- `PR-DOC-01 — Keeper-House Civic Custody`; and
- `PR-DOC-02 — Ledger-and-Shift Civic Custody`.

This replaces the earlier weak “recorded civic versus surety/household” proposal. The
recorded half was under-specified; the surety half lacked enough direct evidence. Social
custody and sponsor/kin relationships remain legal inputs and plan material, but a true
hostage/surety doctrine stays research-needed.

The pair is intentionally organizational rather than ethnic. A culture, realm, legal
tradition, institution, or historical layer may weight either answer. Material and
symbol families then express that answer without pretending the answer is a skin.

## 9. Captured-start and rescue gameplay grammar

Every committed fixture must expose several plans against the same map:

- **Social/legal:** challenge commitment, charge, identity, authority, sponsor, debt,
  classification, treatment, property ownership, or release condition; persuade,
  obligate, expose, substitute, appeal, ransom, bargain, or recruit.
- **Routine/procedural:** exploit meal, water, yard, visit, hearing, count, shift,
  service, work, medical, transfer, property issue, emergency drill, or operator relief.
- **Covert/secret:** use a precommitted service edge, hidden route, loose fixture,
  contraband, relationship, permission mismatch, overlooked maintenance access, or
  incomplete observation.
- **Force/disruption:** break, burn, cut, lift, jam, overwhelm, riot, seize control,
  disable a ward/winch, or exploit fire/flood/attack while accepting response and
  persistent damage.
- **Environmental/realm, when licensed:** survive or redirect void, water, living
  material, gravity, portal, ward energy, creature capability, or weather.

A doctrine changes which targets are cheapest and what failure costs. It may never
delete the plan families by declaring one institution “inescapable.”

## 10. Consequences for `PR-SHAPE-01`

The research supports this deterministic starting sentence:

*A street-facing public/keeper room receives people and property; its controlled inner
threshold rises to a keeper landing overlooking four stable cell fronts and the secure
yard gate; a staff-only property closet sits on the intake side; a rear staff/service
door reaches the walled yard, privy, and cistern/service edge without routing the public
through the cells.*

The exact plan remains a clay hypothesis. The research does not rule:

- which side holds the two cell pairs;
- landing height and stair orientation;
- exact door swing and grille/bar construction;
- whether the cistern contains the seed’s protected discretionary possibility;
- wall thickness, cover, lock/durability, passage width, or standee count; or
- how the cutaway presents deep bars and dark cells.

### Doctrine mutation

- Under `PR-DOC-01`, the keeper room may carry household/service overlap, personal
  keys, appointment evidence, a compact book, and concentrated social/operating power.
- Under `PR-DOC-02`, the same obligation set separates a clearer waiting/intake-search
  strip, attributed property containers, count/handoff station, role-bound access, and
  a staff/service route that preserves operation across a shift change.

The pair need not have identical footprints. It must preserve the same capacity,
required plan families, and gameplay envelope without special-case geometry.

## 11. Growth ladder after research

1. **Component preflight:** cell fronts, doors/grilles, lock/force, landing/rail,
   property containers, hatches, privy/cistern, access views, item receipts.
2. **Rung B proof:** `PR-SHAPE-01` under `PR-DOC-01`, with exact outside/captured
   replays and all plan families.
3. **Doctrine comparison:** compile matched `PR-DOC-02`; reject palette/paper-only
   distinction.
4. **Rung A degradation:** flatten the deck to keeper threshold; combine functions
   while retaining identity, property, service, disposition, and counterplay.
5. **Rung C promotion:** add classification/throughput, separate reception/property/
   service, staff relief, and repeated wing only where load requires.
6. **Retained fantasy composition:** compile `RC-PRISON-01` through
   `PR-DOC-09`-style warded exceptional facts, with honest support/access/services.
7. **Later doctrine promotion:** separate-observation, work-yard, perimeter/transport,
   debt/liberty, hostage/surety, quarantine, and others only after their own gates.

This sequence places the first culture/doctrine comparison before the hardest
suspended proof because it tests whether the base generator separates doctrine from
material. The suspended fixture remains retained; its exact slot may change if component
learning demands it.

## 12. Provisional dimensions and body translation

Historical measurements are evidence about relationships and change, not mandatory
game dimensions:

- the Williamsburg report’s 20×30-ft clear building, two 10-ft prisoner rooms, and
  20-ft yard support a compact combined institution;
- the Fluvanna HABS drawings supply plan, section, door, and window measurement leads;
- the Charles Street set supplies larger-wing/gallery comparison; and
- Fremantle’s original 4×7-ft cells and later wall removal evidence punitive
  constraint, crowding/adaptation, and changing standards—not a target.

Genesis starts from the existing 5-ft cell and 2.5-ft height increment, then clay-tests:
small/medium/large bodies, escort pairs, door use, passing/turning, landing occupation,
yard capacity, staff/service movement, emergency evacuation, camera legibility,
breakable surfaces, and suspended support. No candidate may shrink bodies or hide
unusable space behind historical precedent.

## 13. Asset and surface demand

### Structural / mechanical

Cell-front family · secure door/grille/ward variants · lock/hinge/bar/mesh truth ·
keeper threshold · raised landing/stair/rail · gallery/crosswalk · interlock/sally-port ·
walled yard subdivision · intake/search surface · staff-only property cabinet/closet/
store · attributed container/seal/tag socket · visitor barrier · meal/count/service
hatch · privy/waste/water/cistern · restraint/anchor · alarm/emergency release ·
suspended support/gangway/winch.

### Material / light

Institutional and household masonry/timber/plaster · metal/rope/chain · stockade
earth/plank · paving · water/waste · bedding/canvas · licensed living/ward material ·
daylight at public/yard edges · operator-owned task light · dark unstaffed cells with
renderer readability but no fictional fill lamp.

### Marks / props

Commission/authority · charge/commitment · child number/name · property owner/container/
seal · count/handoff · schedule · visitor/release/transfer · repair/escape · sanitation/
cleaning · contraband · scratched messages · keys/seals/books · meal/water/medical/
repair/emergency tools.

Props and marks may communicate a real state. They cannot fake a missing route, lock,
container, support, service, or access rule.

## 14. Gaps that keep the research gate `PARTIAL`

- no direct tactical-map prison cohort;
- measured non-European small-jail plans remain thin and the NDL visual lead is not
  translated here;
- hostage/surety, quarantine, religious-penance, and broader non-carceral custody
  traditions need dedicated direct evidence;
- no honest measured analogue for suspended living-ironwood custody;
- no fixed-camera, darkness, cutaway, body, escort, evacuation, or force clay result;
- no balance evidence for the plan families and disposition clock;
- exact kit dimensions, weights, locks, durability, and route capacities remain open;
- capture still lacks the canonical exact-item removal/return implementation; and
- no linked source image is licensed as shipping art.
