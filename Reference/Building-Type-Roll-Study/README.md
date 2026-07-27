# Building Type Roll Study

Status: **DETERMINISTIC BEFORE-STATE RETURNED — current typed layers are not reconciled**
Date: 2026-07-26

This packet answers whether the live general interior roller currently serves every
typed building through walk-like flavor and Spice composition.

It does not.

## Contents

- `ROLL-STACK-CARDS.md` — readable cards for three retained rolls from each of the
  fourteen live building kits, plus the real Prison/Custody source boundary.
- `ROLL-RECEIPTS.json` — complete machine-readable receipts: 42 integrated building
  samples, fourteen same-seed realm mirrors, and deterministic custody-source samples.
- `../../dev/capture-building-type-study.mjs` — reproducible full-app jsdom harness.

## What was actually rolled

Each current building type receives:

- one Grounded sample;
- one Textured sample; and
- one Strange, Volatile, or Mythic sample.

The audit harness finds deterministic seeds whose unchanged raw d300 roll lands in
those bands. This reveals the existing range; it is not a product feature. The current
typed caller cannot request a Spice band or a compatible program row.

Every integrated receipt runs:

```text
rollBuilding(type)
  → buildingApproach(type)
  → buildingContact
```

and retains:

- typed kit and realm label;
- function, proprietor hint, patron/economy/hook lanes;
- atomic `building-interior` row reference, band, layout, feature, and source occupant;
- delegated shop stock where present;
- rolled proprietor and ambient cast;
- contact behavior and canon-lock state; and
- deterministic seed/search provenance.

## Principal findings

1. All fourteen current building kits use one ungated d300 call.
2. The d300's source band is the only building-interior Spice signal.
3. Typed callers cannot select or bias program compatibility or Spice.
4. Same-seed Frontier/Chrome/Gloom mirrors retained the identical interior for all
   fourteen types. Realm currently changes the kit label, not the interior.
5. Source occupant, rolled proprietor, and ambient cast are separate draws with no
   reconciliation.
6. Tavern alone adds contact depth through Distant Word and a chance encounter.
7. Smithy, Apothecary, General, and Arcanist correctly delegate stock/economy to their
   existing shop archetypes. That is the clearest genuinely composed layer.
8. `rollBuilding("prison")` returns `unknown-type`. Prison/Custody remains a multi-source
   composition target using capture, general interiors, dungeon areas, authored urban
   areas, and the unbuilt Site 6 compiler.

## Before/after proof requirement

These receipts must remain unchanged as the before-state cohort.

Any family/program table implementation should replay the same request contexts and
prove:

- which family chassis, program arrangement, current scene, and Spice rows stacked;
- which legacy source relationships were migrated or explicitly adapted;
- how realm/culture and contextual Spice changed selection and realization;
- how source occupant, operator, staff, and ambient cast were reconciled;
- how required program obligations and external providers were satisfied;
- which source facts survived progressive detail; and
- that changed seeds retain breadth rather than collapsing into one canonical layout.

No gate, adapter, table row, or live engine behavior was changed by this study.

The first small after-direction taste packet now lives in
`../Building-Family-Table-Samples/`. It is not a live before/after engine proof: it
authors d6/d4 sample tranches and runs a pure deterministic layered sampler so family
membership, program identity, Spice, realm, and compatibility can receive founder
taste calls before final tables are expanded.
