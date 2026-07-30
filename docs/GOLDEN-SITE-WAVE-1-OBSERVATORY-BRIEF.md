---
type: implementation-brief
project: Genesis
status: GATE W1 PASSED 2026-07-29
created: 2026-07-29
updated: 2026-07-29
owner: Vignette Request Adapter and Demand Observatory
authority:
  - GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md
  - GOLDEN-SITE-VIGNETTE-CONTRACTS.md
before_state:
  - intel/walk-census.md
  - intel/walk-census-tally.json
  - intel/walk-census-mapping.json
---

# GOLDEN SITE WAVE 1 — DEMAND OBSERVATORY AND SEMANTIC BOUNDARY

## 0. Outcome

Wave 1 builds the read-only front door to the Procedural Vignette Synthesizer. It
observes what current game paths ask for, normalizes those requests without changing
their truth, assigns a materialization disposition, and counts unresolved semantic and
asset demand.

It does not generate terrain, buildings, new assets, or improved walk content. Its
success condition is honest, deterministic demand—not prettier output.

## 1. Before-state ruling

The retained 2026-07-26 census contains 1,050 independent unseeded calls:

- 450 frontier calls: 150 each urban, dungeon, and wilderness;
- 300 travel calls, all wilderness through the current travel path;
- 300 job calls: 108 urban, 103 dungeon, and 89 wilderness.

It found real demand but cannot replay exact samples. Its direct Golden-number mapping
also overstates the portfolio as runtime taxonomy. Wave 1 retains the counts, replaces
the classifier with host/transform/local-feature/narrative dispositions, and introduces
explicit seed namespaces in the **audit harness only**. Production rollers remain
unchanged in this wave.

Repository verification:

```sh
node dev/verify-walk-census-baseline.mjs
```

## 2. Deliverables

### 2.1 Deterministic audit harness

Build one harness that:

1. replaces `Math.random` only within an isolated audit execution;
2. derives named seeds from `{ corpusVersion, requestFamily, caseId, sampleIndex }`;
3. loads the same production roller paths used by current verification;
4. creates fresh disposable worlds unless a corpus case explicitly tests persistence;
5. records source outputs before normalization;
6. restores global random state after each run; and
7. emits a stable corpus fingerprint and per-request replay command.

No production API may learn a seed parameter merely to satisfy the audit.

### 2.2 Read-only adapters

Adapters are required for:

- raw urban, dungeon, and wilderness frontier walks;
- travel;
- jobs;
- capture/captured start;
- return/continuation;
- ordinary venue/building escalation; and
- already-persisted sites/frontiers.

Each adapter emits `VignetteRequestV1`, validates required fields, fingerprints the
result, and retains missing or ambiguous values explicitly. It may annotate existing
prose with a typed hint only when the classification is a direct, lossless reading.

### 2.3 Disposition classifier

Every request receives one of the six frozen dispositions:

`MATERIALIZE_NEW`, `CONTINUE_EXISTING`, `TRANSFORM_EXISTING`, `DECORATE_LOCAL`,
`NARRATIVE_ONLY`, or `UNRESOLVED`.

The classifier selects shared runtime owners, never Golden Site numbers. Initial
ordinary homes are fixed by `intel/golden-site-engine-coverage.json`:

- entertainment/hospitality → Hospitality/Entertainment Venue plus Urban Fabric;
- harbor/quay/ferry → Service Infrastructure plus Water-Edge Substrate;
- low ward → Urban Fabric plus Operating/Maintenance state;
- infrastructure hub → Infrastructure Works;
- crypt/mortuary → Funerary/Mortuary Host;
- wilderness curiosities → Local Feature, Hero Feature, Substrate feature, or
  Narrative Only.

### 2.4 Demand ledgers

Produce:

- request-family and disposition counts;
- host, transform, substrate, scale, encounter-purpose, and active-window demand;
- unresolved reason counts with source examples;
- `SemanticAssetDemandV1` counts by noun family and required role;
- candidate engine/Meshy/sprite/material lanes as **analysis only**;
- source-field preservation and adapter-completeness measures;
- distribution deltas against the retained 1,050-call before-state; and
- a compact human report with links to the machine corpus and replay ids.

No paid asset generation is authorized by this report.

## 3. Corpus

### 3.1 Natural-frequency checkpoint

Run 12,000 deterministic requests per checkpoint:

| family | count | purpose |
|---|---:|---|
| urban | 4,000 | current natural district, threat, encounter, and venue frequency |
| dungeon | 4,000 | current overall type, room/route, threat, encounter, and transform frequency |
| wilderness | 4,000 | frontier, travel, job, local-feature, substrate, and narrative-only frequency |

The 4,000 wilderness cases are split across raw frontier, travel, and job in declared
proportions; the report shows both weighted natural results and unweighted family
results.

### 3.2 Stratified coverage corpus

Separately exercise:

- every live urban and dungeon primary type;
- every live walk encounter branch;
- all wilderness feature rows, biome/shape bands, and available fray tiers;
- every travel and job entry path;
- capture, return, continuation, and venue escalation states;
- all six dispositions;
- every current host/transform/substrate/scale owner;
- missing-data and incompatible-data cases; and
- Tavern/Guard selectors from `intel/golden-vignette-wave0-fixtures.json`.

Stratified results are never blended into natural-frequency percentages.

### 3.3 Persistence cases

Retain small stateful sequences:

1. discover → materialize → leave → return;
2. discover → transform → return;
3. social venue → combat promotion → aftermath → return;
4. captured start → custody state → property return;
5. active window → committed frontier → continued window.

Wave 1 adapts and validates these states; it does not synthesize new geometry.

## 4. Counts and diagnostics

Every request row records:

- corpus/case/sample id and replay seed namespace;
- raw roll fingerprint;
- adapter and contract version;
- source provenance count and treatment;
- disposition and confidence basis;
- selected shared owner ids;
- unresolved reason codes;
- semantic asset demands and permitted omission status;
- prior site/frontier ids when present;
- request fingerprint; and
- verifier results.

Required unresolved reason vocabulary begins with:

- `MISSING_HOST_PROGRAM`
- `MISSING_OPERATING_MODEL`
- `MISSING_SUBSTRATE`
- `MISSING_SCALE_RELATION`
- `MISSING_SOURCE_PROVENANCE`
- `AMBIGUOUS_DISPOSITION`
- `UNSUPPORTED_TRANSFORM`
- `UNSUPPORTED_LOCAL_FEATURE`
- `UNSUPPORTED_REQUIRED_ROLE`
- `INCOMPATIBLE_PERSISTED_STATE`
- `KNOWLEDGE_BOUNDARY_CONFLICT`
- `BUDGET_UNREPRESENTABLE`

The report shows raw counts and rates. “Mapped to a Golden Site” is retired.

## 5. Verification cadence

### Every implementation change

- contract/enum validation;
- same-seed replay and fingerprint equality;
- source-field preservation;
- focused current walk verifier;
- negative controls relevant to the changed code;
- manifest and documentation gates.

### Every checkpoint

- full 12,000-request natural corpus;
- stratified corpus;
- before-state distribution comparison;
- save/load and walk consumption/dealing verification;
- one ordinary arrival → decision → leave/return play flow;
- one PC-versus-enemy battle simulation on unchanged production geometry; and
- Tavern/Guard selector load and provenance verification.

The battle run is a regression sentinel in Wave 1, not yet evidence that synthesized
terrain works in combat.

## 6. Acceptance gates

Wave 1 passes only when:

1. identical corpus/version/seed inputs produce byte-equivalent request records;
2. all source facts survive or receive an explicit nonvisual/omitted treatment;
3. every request has exactly one disposition;
4. every `UNRESOLVED` record has at least one reason code and source example;
5. no request is classified by Golden number;
6. every required semantic asset role is countable even when no asset exists;
7. renderer, projection, and combat code remain outside semantic completion;
8. current production walk distributions have not been silently changed;
9. current walk, save/load, game-flow, and combat baselines remain green; and
10. the Tavern and Guard selectors load with stable source hashes.

## 7. Explicit negative controls

Wave 1 must prove:

- a wilderness balanced rock becomes a local feature rather than a new site;
- a bridge-closure rumor is not projected as a visible bridge unless licensed;
- an infrastructure hub does not become a mine solely because both use tunnels;
- a crypt is not transformed into “abandoned” when an operating mortuary host is
  licensed;
- layered control does not replace its host;
- a missing host remains unresolved rather than “generic fantasy building”;
- a renderer cannot add an approach or complete a missing role;
- changed camera bearing cannot change request or plan identity; and
- same seed plus changed source fact changes the request fingerprint.

## 8. Handoff to Wave 2

Wave 2 receives:

- a validated `VignetteRequestV1` adapter surface;
- a demand-weighted host/transform/substrate backlog;
- a proxy-only semantic asset-demand ledger;
- replayable Tavern and Guard request fixtures;
- an unresolved-demand list with no hidden default completions; and
- green production walk/game/combat baselines.

Only then does the first bounded candidate/score/repair compiler begin.

## 9. Gate W1 close — PASS (2026-07-29)

Wave 1 closed with 12,718 validated deterministic rows: 12,000 natural-frequency
requests and 718 separate stratified cases. The stable corpus fingerprint is
`vgo1-edf8cc39`; all 2,212,402 natural source leaf facts have explicit treatments,
63,471 required semantic roles are countable through truthful proxy-only demands,
and all six dispositions occur in the stratified corpus.

The natural checkpoint leaves 218 combined `Prison / Asylum` dungeon requests
explicitly unresolved as `AMBIGUOUS_DISPOSITION`. It does not invent a custody,
institutional, or generic-building answer. Production walk sources, renderer, combat,
tables, and world state are unchanged.

Evidence and exact regression results:
`intel/golden-vignette-wave1-verification.md`. Generated reports:
`intel/golden-vignette-wave1-report.md` and
`intel/golden-vignette-wave1-report.json`. Machine rows:
`intel/golden-vignette-wave1-corpus.jsonl.gz`.
