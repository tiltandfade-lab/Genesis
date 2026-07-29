# Building family table samples

date: 2026-07-28
status: TASTE PACKET RETURNED — seven founder-ruled sample families plus proposed
Market/Exchange eighth family and deterministic rolls; founder taste calls open; not live
runtime data

## What this packet is

This packet turns the accepted direction in
`../../docs/BUILDING-PROGRAM-TABLE-FAMILIES.md` into small, readable table tranches
before any family expands to final d12/d20 authoring.

It contains:

- `TABLE-SAMPLES.json` — hand-authored d6 chassis, d4 operating-state, per-program d4
  arrangement/current-scene/Spice, and three-realm realization samples;
- `ROLL-RECEIPTS.json` — 32 deterministic layered receipts, four per family;
- `TABLE-AND-ROLL-CARDS.md` — the same source tables and rolls in founder-review form;
  and
- `../../dev/roll-building-family-samples.mjs` — pure deterministic sampler and source
  validator.

The seven founder-ruled families are:

1. `BF-PUBLIC-SERVICE`;
2. `BF-CIVIC-AUTHORITY`;
3. `BF-HOUSEHOLD-ESTATE`;
4. `BF-RITUAL-INSTITUTION`;
5. `BF-LOGISTICS`;
6. `BF-SHOP-WORKSHOP`; and
7. `BF-CUSTODY`.

The adversarial pass adds an eighth **proposed** family for taste:

8. `BF-MARKET-EXCHANGE` — Market Hall and Exchange / Cloth Hall.

This eighth tranche answers the Site-10 evidence gap. It does not promote the family into the
founder-ruled core or authorize live compilation.

Prison/Custody is intentionally separate. Its sample rows are a thin taste projection
of the much deeper lifecycle in `../../docs/SITE-6-PRISON-CUSTODY-SPEC.md`; they do not
replace that compiler contract.

## What was run

```bash
node dev/roll-building-family-samples.mjs
node dev/roll-building-family-samples.mjs --check
```

The sampler validates eight unique families, all fourteen live building programs plus
Prison/Custody and the two proposed Market/Exchange programs, four Spice bands per program,
all three realm realizations, the dedicated custody boundary, the Market/Exchange membership
boundary, and three explicit Civic/Logistics/Exchange upper-program composition cards. It
then composes:

```text
family chassis
  → program arrangement or custody doctrine
  → family operating state
  → program current scene
  → requested program Spice band
  → program realm realization
```

It does not call the live d300, seed-search for a compatible occupation, or alter live
engine state.

## Taste calls requested

Review `TABLE-AND-ROLL-CARDS.md` for:

1. **family membership** — can every listed program honestly consume every chassis?
2. **chassis taste** — are the spatial relationships too generic, too prescriptive, or
   at the right level?
3. **program taste** — does arrangement make the requested building obvious before
   scene and Spice?
4. **scene taste** — do scenes create playable pressure without dictating resolution?
5. **Spice taste** — does each row intensify a valid surface at the right band?
6. **realm taste** — do Frontier, Chrome, and Gloom change operating realization
   rather than merely vocabulary?
7. **custody depth** — do the thin sample rows correctly point into Site 6 without
   flattening it?
8. **Market/Exchange boundary** — do Market Hall and Exchange / Cloth Hall genuinely share
   all six chassis, and do Civic/Logistics upper programs remain explicit guest compositions
   rather than silently taking over the trading ground?

Every generated receipt deliberately retains
`programIdentityReadableBeforeDmInterpretation: "taste-call-required"`. A sampler pass
proves composition and determinism; it does not make the taste decision.
