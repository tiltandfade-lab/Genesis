# General Building Interior — gated selection and detail proposal

date: 2026-07-26  
status: SUPERSEDED for typed primary selection; retained as d300 preservation/adaptive-reuse research  
successor: `../../docs/BUILDING-PROGRAM-TABLE-FAMILIES.md`

## Supersession notice

The later 42-roll cross-program cohort disproved this document's central typed-path
proposal. Filtering the d300 would reject obvious mismatches, but it would leave thin
program pools and would not create walk-like layering.

Current accepted direction:

- typed buildings use coherent family chassis tables plus program-specific operation,
  current-scene, realm/doctrine, and Spice tables;
- the d300 remains live for untyped building discovery, legacy lineage, source mining,
  and explicitly preselected adaptive reuse; and
- typed generation does not retry the flat d300 until something plausible appears.

The sidecar, receipt, adaptation, and progressive-detail ideas below remain useful for
the d300's reduced role. They are not the current typed-building architecture.

## 0. Historical proposal

Do not replace the general `building-interior` roller with a tavern-only table.
Do not split its four authored columns into four independent random draws.

The current d300 is a strong shared scene-seed source. Its rows deliberately bind:

- a connected-space relationship;
- a notable feature;
- a present person, creature, object, trace, or condition; and
- a spice band.

That row-level coherence is valuable. The problem exposed by the twelve tavern
receipts is that a typed caller currently draws from the whole table without a program
gate and then treats the result as though it were already a complete typed venue.

The proposed correction is:

```text
preserved atomic d300 row
  + audited metadata sidecar
  + typed candidate gate
  + explicit adaptation/provider reconciliation
  + optional post-selection detail decomposition
```

This keeps one versatile interior substrate for taverns, prisons, shops, temples,
homes, workshops, institutions, and untyped exploration.

## 1. Evidence from the source table

`Building Interior.md` is a 300-row Commitment table with the authored fields:

```text
Band
Layout (connected spaces)
Notable Feature
Who/What Is Inside
```

Its current band distribution is:

| band | rows |
|---|---:|
| Grounded | 198 |
| Textured | 60 |
| Strange | 27 |
| Volatile | 12 |
| Mythic | 3 |

Hospitality-compatible material already appears across the breadth of the table,
including:

- `building-interior#5` — taproom;
- `#15` — inn;
- `#51` — barrel cellar below a tavern;
- `#55` — hostelry with private dining;
- `#79` — innkeeper's private rooms;
- `#121` — low-end alehouse;
- `#141` — cellar converted to lodging;
- `#168` — religious guesthouse;
- `#172` — shared lodging;
- `#202` — inn with an unlisted room;
- `#209` — tavern with two cellars;
- `#237` — inn with an audible letting room;
- `#263` — tavern with time-reversing cellar stairs;
- `#273` — inn room with changing furniture; and
- `#292` — inn whose rooms are all occupied.

The same table also provides the warehouse, post office, furrier, bank, mill, temple,
workshop, great hall, chandler, translator, and shopfront results seen in the twelve
receipts. Those are not failed content. They are useful host histories and interior
relationships selected without enough control.

## 2. Preserve the row; index it beside the source

The safest first implementation is an audited sidecar registry keyed by stable row
reference:

```text
building-interior#209
  sourceBand: Textured
  programTags: [hospitality, beverage-service]
  hostTags: [tavern, cellar-complex]
  provides: [public-room, service-edge, storage, private-or-record-space]
  mayProvide: [records, restricted-storage]
  scaleBand: compact-to-moderate
  privacyShape: public-plus-restricted
  adaptationClass: direct
  spice: grounded
```

Minimum proposed metadata:

```text
rowRef
sourceBand
programTags[]
hostTags[]
provides[]
mayProvide[]
forbidsOrContradicts[]
adaptationClass: direct | compatible-reuse | provider-dependent | incompatible
scaleBand
publicPrivateShape
accessShape
lodgingPotential
servicePotential
supplyPotential
sanitationPotential
tacticalAffordances[]
spice
auditState
```

The sidecar must not silently rewrite source text. Automatically proposed tags may
bootstrap the audit, but only reviewed tags may become selection authority.

The first cross-program lexical census and its expansion policy are recorded in
`BUILDING-INTERIOR-COVERAGE-AUDIT.md`. Literal coverage ranges from nineteen Warehouse
rows and twenty Temple-related rows down to four Smithy/metalwork, three
Prison/custody, and one Garrison-related row. Those counts are diagnostic floors, not
semantic compatibility tags.

The full before-state roll evidence is in `../Building-Type-Roll-Study/`: 42 integrated
samples, three visible Spice strata for each live kit, fourteen same-seed realm
mirrors, and the actual Prison/Custody source boundary. Any future gate must produce a
receipted after-state comparison against that cohort.

## 3. Typed selection gate

A typed caller supplies a request profile rather than a decorative `kind` hint:

```text
InteriorRequest
  program
  requiredObligations[]
  preferredHosts[]
  allowedAdaptations[]
  forbiddenContradictions[]
  scaleBand
  spiceTarget
  realm / culture doctrine
  currentState
  materializationWindow
```

The resolver then uses a visible ladder:

1. **Direct program candidate.** The row already provides the required relationship.
2. **Compatible adaptive-reuse candidate.** The row can provide it after named,
   plausible changes.
3. **Provider-dependent candidate.** Missing obligations have real external providers
   and routes inside the committed world/window.
4. **Declared relaxation.** Relax one preferred, non-required constraint and record it.
5. **Typed failure.** Return no valid row and let the caller use its declared semantic
   fallback.

The flat ungated d300 remains legal for an untyped “enter a building” request. It is
not the final selection policy for a typed Tavern, prison, temple, or workshop.

Selection should weight all compatible candidates rather than always choosing the
most literal label. That preserves surprise: a former workshop can still beat a direct
tavern row when its adaptation is strong and fully paid for.

## 4. Hospitality gate

For `HospitalityVenueProfile`, the minimum hard obligations are:

- arrival/recognition;
- a guest-facing service relationship;
- a place to consume, converse, wait, or transact;
- a responsible host;
- supply/waste provision;
- current hours, access, and capacity;
- truthful egress; and
- any conditional lodging, property, privacy, sanitation, record, or cargo obligation
  actually requested by the story.

A candidate does not need to contain a bar, hearth, kitchen, cellar, stable, or bed
unless the selected service mix requires it.

### Direct example — `TVR-FRONTIER-04`

`building-interior#209`, the tavern with two cellars, passes the direct program gate.
Its correspondence archive commits property, records, and a restricted threshold that
the venue compiler must preserve. A lodging context still has to prove where and how
guests sleep; the word “tavern” alone does not satisfy lodging.

### Compatible-reuse example — `TVR-CHROME-04`

The self-working workshop may pass as a noodle bar under the rail line if the adapter
records:

- former and current use;
- which moving tools remain and who controls or avoids them;
- the service edge and guest-safe area;
- preparation, water, heat, supply, waste, and sanitation providers;
- staff responsibility and current shift;
- constrained capacity and egress; and
- the rolled workshop occupant as a persistent actor/object fact rather than dropped
  prose.

The unusual feature becomes a durable venue constraint and story engine, not a reason
to discard the row.

### Provider-dependent or rejected example — `TVR-CHROME-01`

A street banking deposit office can support a tiny counter-service adaptation if a
credible operating history and providers satisfy the obligations. It cannot become a
complete capsule flophouse merely because the typed label says so. Lodging requires a
precommitted host expansion or real external sleeping provider; otherwise the
candidate fails that request.

## 5. Decompose only after selection

Decomposition is useful as progressive disclosure, not as a replacement lottery.

After one atomic row is selected and committed, translate it into semantic atoms:

```text
selected row
  → zones and overlaps
  → thresholds and access
  → retained feature/fixture
  → present actor/object/trace
  → program obligations already provided
  → missing obligations and named providers
  → tactical reservations
```

The original row text and `rowRef` remain attached to the derived atoms.

Detail levels:

| request depth | added resolution |
|---|---|
| quick | atomic row, host relation, responsible person, active service/current beat |
| linger | public/service/private/supply roles, capacity, staff, schedule, providers |
| investigate | ownership, records, objects, evidence, claims, maintenance, concealment |
| escalate | exact connectors, egress, cover, hazards, reservations, BattleMap promotion |

Increasing detail must not reroll the source interior, delete its notable feature, or
replace its present occupant. It resolves implications of the same committed seed.

## 6. Receipt contract

Every gated call should return:

```text
InteriorResolutionReceipt
  requestId
  sourceTableId: building-interior
  candidateRowRefs[]
  selectedRowRef
  sourceRowVerbatim
  gateClass
  requiredObligations[]
  providedBySource[]
  providedByAdaptation[]
  externalProviders[]
  rejectedCandidates[{rowRef, reasons[]}]
  relaxations[]
  derivedAtomIds[]
  seed / rng lineage
```

This receipt makes “adaptive reuse” inspectable and replayable. It also shows whether
a typed failure came from the table, the metadata, the world context, or an
overconstrained program request.

## 7. Integration seams

The current `rollBuilding` call passes:

```js
rollBuildingInterior({ kind: type })
```

`kind` does not constrain selection. The existing `opts.type` branch is not a drop-in
fix because it delegates through typed building generation and would recurse if
naively substituted here.

A future implementation should therefore introduce a pure candidate/resolution seam
beside the existing raw roller, conceptually:

```text
rollBuildingInterior(rng)                  // preserved raw/untyped call
resolveBuildingInterior(request, rng)      // new gated typed call
decomposeInterior(resolution, detailDepth) // optional progressive detail
```

Names are illustrative. The important boundary is that the shared source stays
general while typed callers receive constrained, receipted resolution.

The resolver must also promote the row's `Who/What Is Inside` field into codex or
object lineage. The current building approach separately rolls proprietor and ambient
cast, so the source occupant can otherwise become orphan prose.

## 8. Tests before live wiring

1. Raw untyped calls still reach all 300 rows with unchanged band and row provenance.
2. Row selection remains atomic; no test independently remixes the four source fields.
3. A direct hospitality row passes without an adaptation fiction.
4. A workshop reuse passes only with every required provider and constraint recorded.
5. A bank-office flophouse request fails or overflows honestly when lodging is absent.
6. Grounded, Textured, Strange, Volatile, and Mythic hospitality-compatible candidates
   remain reachable when the request permits their spice.
7. Rejected candidates and relaxation steps replay under the same seed.
8. The source occupant/feature survive codex minting and detail escalation.
9. Tavern, prison, shop, temple, and untyped-building callers all use the same resolver
   without caller-specific source tables.
10. The twelve Tavern Study receipts remain unchanged as the ungated baseline.

## 9. Non-goals

This proposal does not authorize:

- editing or deleting the d300 source rows;
- a duplicate tavern interior table;
- NLP-generated tags becoming canon without review;
- automatic acceptance of every adaptive-reuse story;
- adding surprise rooms or providers after player observation;
- rerolling contradictions away after contact; or
- live engine changes during the active CL-R3 lane.
