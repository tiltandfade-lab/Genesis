---
type: generated-report
project: Genesis
status: WAVE-1 GATE-PASSED EVIDENCE
updated: 2026-07-29
generator: dev/golden-vignette-observatory.mjs
---

# Golden Vignette Wave 1 — Demand Observatory Report

The read-only checkpoint contains **12,718**
validated request rows: 12,000 natural-frequency production rolls plus 718
separate stratified cases. The stable corpus fingerprint is
`vgo1-edf8cc39`. The compressed machine rows are
`docs/intel/golden-vignette-wave1-corpus.jsonl.gz`; replay any row with
`node dev/golden-vignette-observatory.mjs --replay <caseId>`.

Production walk rollers, tables, renderer, combat, and world state are unchanged. The audit
temporarily replaces `Math.random` under try/finally and adds no seed parameter to production.
The report authorizes no paid asset generation.

## Natural-frequency checkpoint

| disposition | count | rate |
|---|---:|---:|
| MATERIALIZE_NEW | 8049 | 67.075% |
| DECORATE_LOCAL | 3733 | 31.1083% |
| UNRESOLVED | 218 | 1.8167% |

The 4,000 wilderness requests are declared as 1,600 raw frontier, 1,200 travel, and 1,200 job
entries. Natural-frequency rolls use the current unplaced/baseline production context; baseline,
fray1, fray2, and rim are exercised through the real current fray function in the separate
stratified corpus.

Top shared host demand:

| owner | requests |
|---|---:|
| UrbanFabric | 4000 |
| LocalFeature | 3083 |
| UrbanInstitutionHost | 1210 |
| InfrastructureWorksHost | 1002 |
| FuneraryMortuaryHost | 840 |
| NaturalCavernHost | 809 |
| HeroFeature | 650 |
| DefenseFortificationHost | 611 |
| ServiceInfrastructureHost | 525 |
| WorkshopProductionHost | 520 |
| HospitalityEntertainmentVenue | 413 |
| MarketExchangeHost | 393 |

Unresolved demand:

| reason | requests |
|---|---:|
| AMBIGUOUS_DISPOSITION | 218 |

All 2,212,402 observed natural-corpus leaf facts are
present in source provenance with an explicit treatment. Required roles yield
63,471 proxy-only semantic asset demands.

## Stratified coverage

The 718 cases cover all live urban and dungeon primary
types, 303 wilderness feature rows,
300 wilderness shape rows,
10 biomes, four fray tiers, all entry paths,
all six dispositions, all 26 current shared
owners, five persistence sequences, explicit failure states, and the Tavern/Guard selectors.
Stratified counts are not blended into natural-frequency percentages.

## Before-state comparison

The old 1,050-call unseeded census remains the before-state. Because its samples cannot be replayed,
the deltas below are descriptive sampling comparisons; unchanged production source plus retained
walk regressions are the no-silent-change gate.

| distribution | largest absolute delta |
|---|---:|
| urbanPrimaryType | 2.995 pp |
| dungeonPrimaryType | 2.425 pp |
| wildernessArrivalShape | 2.225 pp |
| urbanThreat | 2.255 pp |
| dungeonThreat | 5.455 pp |
| urbanEncounter | 3.7675 pp |
| dungeonEncounter | 2.355 pp |
| wildernessEncounter | 2.175 pp |

## Founder-review flags

These are decision packets, not permission for automatic table or compiler changes. The
machine report retains their structured evidence, options, and starting recommendations.

### GS-W1-Q01 — Combined Prison / Asylum primary type

**Priority:** `BLOCKING_BEFORE_CUSTODY_COMPILATION` · **natural requests:** 218

**Evidence:** `{"sourceValues":["Prison / Asylum"],"dispositions":[{"key":"UNRESOLVED","count":218}],"unresolvedReasons":["AMBIGUOUS_DISPOSITION"]}`

**Current behavior:** Leaves the request UNRESOLVED; chooses neither CustodyHost nor an institutional/medical host.

**Decision needed:** Whether the source row should split, gain a secondary purpose/doctrine roll, or route through a shared institution chassis with distinct custody and care programs.

Options:

  - Split Prison and Asylum into separate source rows.
  - Keep the combined row but add a required purpose/doctrine discriminator.
  - Adopt one shared institutional chassis while retaining separate operating circuits and presentation.

**Codex starting recommendation:** Keep it unresolved until we review the actual prison/custody and institution plans together; prefer an explicit purpose discriminator over a silent 50/50 adapter coin flip.

### GS-W1-Q02 — Natural Cavern type does not say whether anything claims it

**Priority:** `HIGH_BEFORE_DUNGEON_COMPILATION` · **natural requests:** 809

**Evidence:** `{"distinctLocalFeatures":31,"hostOwners":["NaturalCavernHost"],"examples":["Barricade","Bone Wall","Candelabra","Cold Hearth","Collapsed Bridge","Crumbled Masonry","Deep Fissure","Drainage Grate"]}`

**Current behavior:** Uses NaturalCavernHost only. It no longer invents EcologyClaimHost from the word cavern.

**Decision needed:** What evidence promotes a cavern into an active lair/ecological claim: encounter branch, inhabitants, tracks, operating state, or an explicit site-purpose field.

Options:

  - Keep every cavern as substrate/host only until explicit claimant evidence arrives.
  - Let selected encounter or inhabitant facts add EcologyClaimHost as a layered program.
  - Add a dedicated claimed/unclaimed cavern discriminator upstream.

**Codex starting recommendation:** Use explicit claimant or inhabitant evidence to add the ecology layer; cavern geometry alone should never imply a lair.

### GS-W1-Q03 — Ruined Quarter implies both DormantTransform and dormant operating state

**Priority:** `HIGH_BEFORE_TRANSFORM_COMPILATION` · **natural requests:** 388

**Evidence:** `{"dispositions":[{"key":"MATERIALIZE_NEW","count":388}],"transformOwners":[{"key":"DormantTransform","count":388}],"operatingStates":[{"key":"dormant","count":388}]}`

**Current behavior:** Treats every Ruined Quarter as UrbanFabric plus DormantTransform with operating state dormant.

**Decision needed:** Whether ruined describes physical condition only, failed function, active occupation inside ruins, or a mix requiring a current-use/claimant discriminator.

Options:

  - Keep ruin as a physical transform but do not infer dormant operation.
  - Keep dormancy as the default and add explicit occupied/repurposed overrides.
  - Add a current-use roll that selects dormant, inhabited, reused, contested, or rebuilding.

**Codex starting recommendation:** Separate physical ruin from operating state; a ruined quarter may still be inhabited, controlled, scavenged, or rebuilding.

### GS-W1-Q04 — Civic Center, Temple Ward, and Noble Quarter share one umbrella host

**Priority:** `HIGH_BEFORE_URBAN_COMPILATION` · **natural requests:** 1,210

**Evidence:** `{"sourceCounts":[{"key":"Noble Quarter","count":416},{"key":"Temple Ward","count":412},{"key":"Civic Center","count":382}],"hostOwners":["UrbanInstitutionHost","UrbanFabric"]}`

**Current behavior:** Preserves the three source types as programRef but gives all of them the same generic UrbanInstitutionHost circuit.

**Decision needed:** Which semantic subprograms and operating circuits distinguish civic administration, religious precinct, and noble/residential power without creating three unrelated engines.

Options:

  - One institution chassis with typed civic, sacred, and noble program layers.
  - Route Temple Ward and Noble Quarter to existing sanctuary and estate hosts plus UrbanFabric.
  - Retain the umbrella only for district composition while individual materialization windows select specific venue hosts.

**Codex starting recommendation:** Use UrbanFabric for district continuity, then select typed venue hosts inside bounded windows; do not ask one generic institution circuit to express all three.

### GS-W1-Q05 — Natural walk outputs do not yet license scale, active windows, or encounter mode

**Priority:** `BLOCKING_BEFORE_GEOMETRY_COMPILATION` · **natural requests:** 12,000

**Evidence:** `{"missingScaleOwner":12000,"missingActiveWindowOwner":12000,"missingActiveWindowValue":12000,"unspecifiedEncounterMode":12000,"missingOperatingOwner":11618}`

**Current behavior:** Records the gaps without failing semantic host observation; no default footprint, height, camera window, or tactical mode is invented.

**Decision needed:** Which existing world/walk facts should license compact materialization windows, scale envelopes, and social/exploration/combat modes before Wave 2 emits geometry.

Options:

  - Derive bounded defaults by request family and make every derivation explicit.
  - Add typed metadata to current walk results after census-backed review.
  - Let the Wave-2 compiler propose candidates but refuse commitment until a window/scale owner approves.

**Codex starting recommendation:** Define explicit family-level fallback envelopes for candidate generation, but require source- or owner-backed window commitment before persistence.

### GS-W1-Q06 — Wilderness named features sometimes promote from local decoration to a full host

**Priority:** `HIGH_BEFORE_WILDERNESS_COMPILATION` · **natural requests:** 267

**Evidence:** `{"hostCounts":[{"key":"ServiceInfrastructureHost","count":96},{"key":"DefenseRouteControlHost","count":45},{"key":"EcologyClaimHost","count":31},{"key":"CommunalInstitutionHost","count":28},{"key":"DefenseFortificationHost","count":23},{"key":"ExtractionWorkHost","count":22},{"key":"TransientServiceHost","count":22}],"examples":["Abandoned Campsite: Tattered tents and cold firepit.","Aqueduct Pillar: Massive stone support for a ruined water bridge.","Aqueduct Span: A 30' section of raised waterway.","Broken Stone Bridge: Center span has collapsed.","Buried Shrine: Roof flush with the ground level.","Caravan Wreckage: Three smashed wagons in a circle.","Collapsed Gatehouse: Two ruined stumps of towers.","Collapsed Mine Cart: Spilled load of coal/ore.","Collapsed Mine Shaft: Timber-shored hole in the earth.","Domed Shrine: Small gazebo-like structure.","Elemental Shrine: Altar radiating extreme cold/heat.","Giant Bird Nest: Woven from timber and ship masts."]}`

**Current behavior:** Exact named camps, shrines, claimed lairs, mines, forts, constructed crossings, and similar functional features become MATERIALIZE_NEW; other curiosities remain DECORATE_LOCAL.

**Decision needed:** What minimum functional circuit turns an isolated named object or ruin fragment into a site rather than a terrain feature.

Options:

  - Name-based promotion as currently observed.
  - Require at least two functional roles or an encounter objective.
  - Keep isolated remnants local and promote only when route, service, claimant, or persistence facts agree.

**Codex starting recommendation:** Require a functional circuit or encounter objective; an isolated bridge span, wall fragment, or abandoned prop should not become a whole site from its noun alone.

### GS-W1-Q07 — Mapped urban and dungeon observations default to new materialization

**Priority:** `HIGH_BEFORE_MATERIALIZATION_CADENCE` · **natural requests:** 7,782

**Evidence:** `{"urban":4000,"dungeon":3782,"shareOfAllNatural":64.85}`

**Current behavior:** Without prior identity, every recognized urban/dungeon primary type is demand for MATERIALIZE_NEW.

**Decision needed:** Whether a walk observation itself requests a vignette, or whether current scene, encounter purpose, player focus, and active-window budget must separately authorize materialization.

Options:

  - Materialize every recognized urban/dungeon arrival.
  - Record all demand but materialize only the current active window.
  - Use encounter/player-focus thresholds while retaining narrative-only observations.

**Codex starting recommendation:** Keep the demand count, but gate actual compilation through one bounded active window selected by scene focus and encounter purpose.

### GS-W1-Q08 — The first semantic-role vocabulary exposes almost no identity or surface demand

**Priority:** `MEDIUM_BEFORE_ASSET_ADMISSION` · **natural requests:** 12,000

**Evidence:** `{"totalSemanticAssetDemands":63471,"candidateLaneCounts":[{"key":"ENGINE_RECIPE","count":36682},{"key":"EXISTING_OR_MESHY_CANDIDATE","count":25881},{"key":"MESHY_CANDIDATE","count":908}],"spriteExtrusionCandidates":0,"materialCandidates":0}`

**Current behavior:** Counts host-circuit roles and keeps terrain engine-first, but generic roles rarely name signs, heraldry, documents, facade identity, causal materials, trim, wear, or textural state.

**Decision needed:** At what stage identity faces and material/surface demands become required without letting decoration substitute for topology.

Options:

  - Add identity/material roles to every host profile now.
  - Emit them from the Wave-2 semantic plan after topology and operating state are known.
  - Keep them optional until a culture/state source fact explicitly licenses them.

**Codex starting recommendation:** Emit required identity and causal-surface roles from the semantic plan after macro topology passes; do not bulk-generate assets from the current near-zero counts.

## Acceptance state

- deterministic replay and request fingerprints: pass
- source preservation/treatment: pass
- exactly one disposition per request: pass
- unresolved reasons with source examples: pass
- required roles and truthful proxies countable: pass
- Golden-number, renderer, projection, and combat semantic completion: absent
- Tavern and Guard selector hashes: pass
