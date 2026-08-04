---
type: implementation-plan
project: Genesis
status: FOUNDER-REQUESTED DRAFT — runtime implementation paused pending review
created: 2026-07-31
owner: Procedural Vignette Synthesizer
serves:
  - GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md
  - GOLDEN-SITE-VIGNETTE-CONTRACTS.md
  - GOLDEN-SITES-CATALOG.md
  - STRUCTURE-KIT-CATALOG.md
  - TERRAIN-PROGRAM.md
first_fixture: Site 1 Guard Post family
---

# GOLDEN SITE SPATIAL COMPILER PLAN

## 0. Decision and scope

Genesis needs one missing intermediate compiler layer between semantic site truth and the existing
terrain/architecture emitters. That layer combines:

- a **landform skeleton** for continuous natural relationships;
- typed **spatial parcels** for macro composition;
- buildable **plots** inside eligible parcels;
- negotiated **earthworks** through which construction cuts, fills, retains, buries, pins, piles, or
  bridges the landform;
- hierarchical **assembly grammar / WFC** for compatible constructed modules; and
- a deterministic **completion and fallback grammar** for legal unresolved boundaries.

This is not a second terrain engine or a separate building engine. It is the missing planning stage
inside the unified Procedural Vignette Synthesizer. Existing terrain fields and architecture forms
remain emission backends. Existing `VignetteRequest`, committed mechanics, stable ids, projections,
and receipts remain authoritative.

The plan is a Wave-2 correction. The current Guard Post proves that responsive terrain, materials,
architecture projection, camera rotation, and deterministic candidate selection are feasible. Its
three changed-seed renders also prove that dimension changes inside one fixed template do **not**
satisfy the required family diversity. No further broad material/beauty pass should precede this
spatial correction.

## 1. Current-state diagnosis

The current `gvsGuardCandidate` owns one fixed 20×22 window, one shoulder height lattice, one road
polyline family, one flank polyline family, one retaining run, and one relative post/deck
arrangement. Seeded changes shift those ingredients and choose among 4×4, 4×6, and 6×4 guardroom
envelopes. Those are legal parameter mutations, but not genuinely different compositions.

What is already useful and should be retained:

- continuous natural terrain field and responsive surface renderer;
- authored terrain operators: control surface, ridge/break, basin/slot, patch, and graded path;
- support and walk graphs;
- bounded candidate, rejection, repair, scoring, and deterministic receipt machinery;
- architecture members, wall runs, real openings, roofs, stairs, support records, miter/cap closure,
  clearance audits, and terrain-embedded footing primitives;
- stable material, condition, culture, light, prop, and sprite projection contracts; and
- one-plan SceneTray/BattleMap identity.

What is missing:

1. no macro landform skeleton selected from the substrate and world facts;
2. no typed parcel partition of that landform;
3. no plot negotiation between a host program and eligible parcels;
4. no compiled subtractive/additive earthwork plan;
5. no actual WFC/constraint-propagation solver choosing compatible construction modules;
6. no scale-aware module eligibility or hierarchical collapse;
7. no governed completion solver for unresolved walls, roofs, foundations, stairs, and terrain joins;
8. no structural-diversity gate strong enough to reject three silhouettes of one template; and
9. no cheap proof ladder that stops before expensive dressed twelve-view renders.

## 2. The spatial hierarchy

The compiler order is binding:

```text
retained world / story / walk facts
  -> VignetteRequest
  -> primary spatial sentence + host obligations
  -> MaterializationWindow
  -> LandformSkeletonPlan
  -> SpatialParcelPlan
  -> BuildPlotPlan
  -> EarthworkPlan
  -> TacticalCompositionPlan reservations
  -> AssemblyChassisPlan
  -> constrained module collapse (WFC)
  -> deterministic completion / bounded fallback
  -> terrain + architecture emission
  -> stable faces, materials, condition, culture, light, props
  -> validation, score, receipt, projection
```

The stages may negotiate through explicit requests, but they do not reroll one another. A building
may request a cut volume; the earthwork planner can accept, reshape within licensed tolerances,
select another plot, or reject the candidate. The renderer cannot decide to flatten a hill or add a
foundation after commitment.

### 2.1 Landform skeleton

`LandformSkeletonPlanV1` describes relationships before cells or mesh:

```text
LandformSkeletonPlanV1
  id / version / seedRef / sourceRefs[]
  substrateFamily
  datumRefs[]
  nodes[]
    id / role / positionEnvelope / elevationEnvelope / sourceRefs[]
  edges[]
    id / role / from / to / widthEnvelope / gradeEnvelope / continuity
  fields[]
    elevation / drainage / exposure / stability / waterDistance
  breaks[]
    cause / type / side / heightEnvelope / permittedExtent
  continuations[]
  forbiddenRelations[]
```

Nodes and edges express ridge crests, shoulders, drainage lows, canyon axes, shorelines, river
channels, saddles, beach shelves, rock cuts, and approach/exit continuations. The current terrain
operators remain the means by which this skeleton becomes a continuous field.

### 2.2 Spatial parcels

A parcel is a typed polygon, ribbon, boundary band, or volume with semantic and physical obligations.
It is **not** assumed to be rectangular, flat, buildable, or privately owned.

```text
SpatialParcelV1
  parcelId / role / geometryKind
  boundaryRef / elevationPolicy / continuityPolicy
  parentParcelRef? / neighborConstraints[]
  routeRelations[] / waterRelations[] / exposureRelations[]
  buildability
  allowedUses[] / forbiddenUses[]
  quietSpacePolicy
  tacticalPotential[]
  sourceRefs[]
```

Initial geometry kinds:

- `AREA` — shoulder, beach, terrace, quiet field, work yard;
- `RIBBON` — road, river, path, wall/canyon corridor;
- `BAND` — shoreline, cliff edge, wet/dry transition, retaining boundary;
- `VOID` — water, ravine, chasm, excavated court;
- `VOLUME` — buildable earth, buried capacity, cave body, unstable mass; and
- `FRONTIER` — precommitted continuation beyond the active window.

Parcels can overlap when their roles are compatible: a road ribbon can cross a shoulder parcel; a
shoreline band can border both beach and rock-shelf parcels. Overlap does not imply double ownership
of height or mechanics; each field names its authority.

### 2.3 Plots

A plot is a construction opportunity selected inside one or more parcels. It is local to a host
program and includes the volume required to build honestly, not only a flat floor rectangle.

```text
BuildPlotV1
  plotId / hostRole / parcelRefs[]
  boundary / verticalEnvelope / localDatum
  approachSockets[] / continuationSockets[]
  supportCapacity / excavationCapacity / fillCapacity
  daylightFaces[] / buriedFaces[]
  drainageObligations[]
  routeAndClearanceReservations[]
  eligibleChassisFamilies[]
  rejectionReasons[]
```

Plots are proposed in bounded sets and scored. A plot can be entirely above grade, stepped across
several datums, embedded in a slope, suspended, or partially buried. A building does not receive a
free level pad merely because its footprint fits in X/Z.

## 3. Landform coverage

The parcel system must generalize without turning natural forms into WFC blocks.

| Landform | Skeleton authority | Principal parcels | Local WFC responsibility |
|---|---|---|---|
| hillside | fall line, contour family, shoulder/crown, drainage | lower approach, slope, shelf, crown, cut band | retaining transitions, stairs, walls, buildings |
| mountainside | ridge/saddle network, large elevation field, rock breaks | ascent ribbon, scree, cliff bands, ledges, crown, void | supported paths, switchbacks, bridges, constructed anchors |
| canyon | canyon axis, rims, wall fields, drainage floor | floor ribbon, wall bands/volumes, ledges, mouths, crossings | rock-edge modules only where authored; bridges and structures |
| coast | water datum plus continuous shoreline curve/SDF | water void, intertidal band, shore parcel, backshore, cliff/rock shelf | seawalls, docks, stairs, buildings, bounded rock assemblies |
| beach | shoreline SDF, sediment direction, slope to water | wet sand, dry sand, dune/backshore, access ribbon, quiet field | constructed access and sparse authored feature clusters |
| riverbank | channel spline, flow direction, flood datum | water ribbon, bank bands, flood shelf, crossing sockets | bridge, quay, retaining, steps, mill/intake structures |
| marsh/bog | support/stability and water-distance fields | firm islands, soft support, channels, reeds, approaches | piles, boardwalks, rafts, anchored structures |

Shorelines specifically use a continuous curve or signed-distance field. Water, intertidal, wet,
dry, dune, cliff, and backshore states derive from distance, exposure, sediment, and elevation.
WFC must never determine the macro coastline cell by cell. It may solve compatible local rock,
seawall, dock, stair, and building assemblies after the shoreline exists.

## 4. Earthwork negotiation

`EarthworkPlanV1` makes construction additive and subtractive to the same landmass.

```text
EarthworkPlanV1
  planId / plotRef / terrainPlanRef / chassisRequestRef
  operations[]
    opId / type / boundaryOrVolume / datum / tolerances
    sourceRefs[] / supportRefs[] / drainageRefs[]
  exposedFaces[] / buriedFaces[]
  spoilDestinations[]
  retainingDemands[] / foundationDemands[]
  routeChanges[] / tacticalConsequences[]
  volumeBalance / stabilityReport / drainageReport
  preFieldFingerprint / postFieldFingerprint
```

Initial operations:

- `CUT` — remove earth for a basement, road cut, sunken court, foundation, or doorway;
- `FILL` — add supported mass for a pad, ramp, terrace, or widened road;
- `RETAIN` — preserve a discontinuity with a truthful loaded face and footing;
- `BURY` / `EMBED` — allow named building faces or volumes to remain inside earth;
- `DAYLIGHT` — expose a buried storey on selected downhill faces;
- `STEP_FOUNDATION` — create several supported bearing datums instead of one flat pad;
- `BRIDGE` — cross a void while preserving it;
- `PILE` / `PIN` — transfer loads to stable support through weak or steep substrate;
- `BENCH` — cut-and-fill a narrow terrain shelf while preserving surrounding slope; and
- `DRAIN` — add a causal runoff route, culvert, sump, or weep path.

Rules:

1. Every operation names its cause and owner.
2. Cut/fill tolerances are licensed by plot and host facts, never renderer convenience.
3. Exposed cut faces become real surface demands; buried faces do not receive exterior material.
4. Cut material has a spoil destination or an explicit off-window provider.
5. Retaining construction names the mass it retains and how it bears.
6. Excavated construction must drain or explicitly fail for a sourced reason.
7. Earthwork may change tactics only before the plan is committed; after commitment every
   projection uses the same result.
8. A material or skirt cannot counterfeit terrain contact or burial.

## 5. Hierarchical construction grammar

Pure WFC operates only after macro parcels, plots, routes, datums, and earthworks exist.

### 5.1 Three collapse scales

1. **Chassis selection** — choose a taste-reviewed program assembly such as compact watchtower,
   embedded hillside post, road lodge, gatehouse, wall-and-watchroom, bridge checkpoint, or small
   compound. This is bounded constraint selection, not fine-tile WFC.
2. **Assembly collapse** — solve room/bay adjacency, vertical cores, lookout placement, roof family,
   threshold relationship, and foundation modes inside the plot.
3. **Piece collapse** — solve walls, corners, terminals, openings, roof edges, stairs, landings,
   retaining transitions, cutaway caps, and cultural expression sockets.

Fine decorative modules are not allowed to rescue a failed chassis or assembly collapse.

### 5.2 Socket contract

The existing six-face socket registry becomes `ConstructionSocketV2` rather than being replaced:

```text
ConstructionSocketV2
  socketId / face / profile / dimensionalClass
  localFrame / mateClasses[] / forbiddenMateClasses[]
  supportMode / loadPathClass
  interiorExteriorPolarity
  datumClass / gradeTolerance
  routeClass / clearanceEnvelope / accessClass
  wallThicknessClass / roofPitchClass
  materialAndCultureCompatibility[]
  programRoleCompatibility[]
  scaleEligibility[]
  conditionEligibility[]
  closurePriority / fallbackClasses[]
```

Sockets express construction truth, not only matching labels. Two wall modules do not mate when
their heights match but their support, thickness, interior polarity, or route clearance conflicts.

### 5.3 Module ownership

The library is layered:

- **universal core** — foundations, wall runs, corners, caps, floors, openings, roofs, stairs,
  supports, terrain transitions, and cutaway closures;
- **vernacular families** — military masonry, dressed institutional, timber, domestic/town,
  excavated, makeshift/scavenged, monumental, giant-legacy, aquatic/mobile;
- **culture profiles** — coherent compatible choices for construction, corners, openings, roofs,
  repair, signifiers, and material roles; and
- **Golden Site signature kits** — small program-specific buys that teach the shared engine new
  vocabulary.

Golden Sites do not receive isolated generators. Site 1 contributes controlled barriers, lookout
and signal assemblies, defensive parapets, road-facing shutters, retained-slope joins, and embedded
guardroom chassis. Site 9 can reuse and enlarge the military kit. Other sites inherit universal and
vernacular parts while contributing their own program signatures.

### 5.4 Scale eligibility

Every chassis, assembly, and piece declares permitted scale classes and cost:

- `MICRO` — tiny local fixture or shelter;
- `SMALL` — guard post, dwelling, isolated shop;
- `MEDIUM` — inn, court range, workshop, small compound;
- `LARGE` — monastery wing, gatehouse, civic hall, fortress slice;
- `MONUMENTAL` — grand interior precinct or major institutional corner;
- `GIANT_LEGACY` — civilization-scale inherited structure.

Large modules cannot roll in small windows merely because sockets match. Large sites do not become
larger acreages by default: they may materialize one grand slice with real continuations.

## 6. Deterministic WFC, completion, and fallback

The solver is a bounded deterministic constraint solver:

1. derive domains from chassis, plot, program, culture, scale, and earthwork facts;
2. choose the lowest-entropy unresolved assembly/socket using stable tie-breaking;
3. select candidates from a named child seed;
4. propagate dimensional, support, route, roof, material, and adjacency constraints;
5. backtrack within a fixed budget;
6. invoke named completion operators for legal residual boundaries;
7. validate the complete support/access/camera/tactical product; and
8. reject or degrade through a recorded fallback ladder.

The completion grammar may use:

- variable-length quiet wall/floor/roof fields;
- matched miter corners and junctions;
- four-polygon terminal caps;
- roof ridge, hip, valley, eave, and flashing closures;
- gable/shed infill;
- foundation wedges, stepped footings, and terrain-contact transitions;
- direct stair seams, landings, and support cheeks;
- retaining returns and rock/soil end transitions; and
- cutaway section caps.

It may not:

- insert a floating platform to connect incompatible stairs;
- fill a blocked route;
- add an unsupported room or storey;
- conceal an unclosed roof/wall seam with trim;
- flatten terrain without an earthwork receipt;
- bridge a void without support and route truth; or
- silently omit a required program role.

Fallback order is `retry collapse -> alternate compatible assembly -> simpler chassis -> truthful
proxy/minimum host -> typed rejection`. Every step is receipted. Autofill is never an unbounded save.

## 7. Guard Post migration and first proof family

The first implementation migrates Site 1 without deleting the retained current fixture. The current
template becomes a `LEGACY_GP_SHOULDER_OVERLOOK_V1` comparison fixture until the new planner passes.

### 7.1 Required first three compositions

All three preserve: one operating externally supplied post, a real entering/exiting controlled
route, occupied support, observation, a barrier/threshold, legal retreat, and at least one tactical
alternative.

| composition | terrain/parcel sentence | building/earthwork sentence | distinct tactical promise |
|---|---|---|---|
| embedded shoulder post | road climbs below a steep shoulder and a compact crown | cut a guardroom into the hill; bury uphill walls; daylight a lower road-facing storey; retain and drain the cut | upper threshold versus lower service access; roof/crown observation |
| inside-bend road lodge | road bends around a broad shoulder with a working apron inside the turn | bench and partly fill a lodge/yard; stepped foundations and loaded outside retaining run | direct controlled bend versus longer outside-slope flank |
| rock-cut gate and gallery | road passes through a natural narrowing between rock and retained earth | minimal guardroom abuts the cut; threshold/gate spans the narrowing; lookout gallery pins into higher rock | chokepoint, climb/ledge counterplay, and signal position separated vertically |

Later families may add an outside-shoulder tower, bridge checkpoint, wall-and-watchroom, or small
compound, but they do not delay proving the first three.

### 7.2 Diversity gate

Changed seeds must differ categorically. A pair passes only when at least four of these axes differ:

1. route topology/profile — straight, bend, switchback, split/merge, rock-cut;
2. shoulder handedness and post side;
3. post-to-route relation — overlook, abut, straddle, embed;
4. chassis family;
5. earthwork signature — cut, fill, stepped, bridged/pinned;
6. lookout position and vertical access;
7. retaining/yard composition; and
8. deployment, flank, objective, or retreat geometry.

Footprint dimensions, roof pitch, props, culture, condition, and palette do not count toward the
four-axis minimum. At least one pair must differ in route topology and at least one must differ in
earthwork signature. The engine records the categorical signature in every receipt.

### 7.3 Guard Post proof order

1. JSON/diagram parcel and earthwork receipts for the three compositions.
2. Neutral top-down/debug overlays showing skeleton, parcels, plots, routes, cuts/fills, and support.
3. One neutral-clay production bearing per composition.
4. Gameplay simulation and deterministic replay.
5. Four bearings only for compositions passing 1–4.
6. Culture/material/condition/light only after the family passes neutral clay.
7. Final changed-seed dressed census and battle promotion.

## 8. Generalization stress proofs

Guard Post alone cannot prove that parcels are not renamed guard-post zones.

After the first three Guard compositions:

### Stress A — natural canyon/shore pair

- one canyon with continuous floor, walls, ledges, rim continuations, and a crossing opportunity;
- one coast with continuous shoreline SDF, water/intertidal/dry bands, rock or beach transition,
  and no construction required; and
- the same parcel schema must represent both without rectangular subdivision or WFC coast tiles.

### Stress B — unlike construction host

Use one nonmilitary Golden request—preferably Camp/Service or Mine/Workshop—to prove that:

- universal plots and earthworks survive another host;
- site-specific Guard pieces do not leak into it;
- a second signature kit can reuse universal/vernacular sockets; and
- the solver remains one engine with no Golden-number conditional.

## 9. Implementation waves

### Spatial Wave P0 — contracts and retained before-state

Deliver:

- this plan and schema fixtures;
- retained current Guard plan/render fingerprints;
- exact diversity and negative-control gates;
- no runtime visual changes.

Gate: existing W2 mechanics/determinism tests remain green; plan introduces no competing owner.

### Spatial Wave P1 — skeleton and parcels

Deliver:

- `landform-skeleton.js` and `spatial-parcels.js` pure planners;
- polygon/ribbon/band/void/volume/frontier parcel representation;
- adjacency, overlap, coverage, quiet-space, and frontier validators;
- hillside, canyon, and shoreline schema fixtures;
- projection to existing terrain operators without WFC.

Gate: continuous terrain, route continuations, no unowned cells/volumes, deterministic replay, and
three categorically distinct parcel plans before rendered beauty.

### Spatial Wave P2 — plots and earthworks

Deliver:

- bounded plot proposal/scoring;
- `EarthworkPlanV1` and CUT/FILL/RETAIN/BURY/DAYLIGHT/STEP/DRAIN minimum operators;
- terrain-field application and pre/post fingerprints;
- foundation/support/drainage join output;
- embedded Guard Post proof in neutral clay.

Gate: building visibly intersects and transforms the hill; no floating wall, fake foundation skirt,
unowned cut face, trapped drainage, or mechanics drift.

### Spatial Wave P3 — hierarchical assembly/WFC kernel

Deliver:

- chassis/assembly/piece registries;
- `ConstructionSocketV2` compatibility;
- deterministic entropy selection, propagation, bounded backtracking, and receipts;
- completion grammar for walls, roofs, foundations, stairs, and terrain transitions;
- scale eligibility and cost budgets;
- one negative fixture per prohibited autofill behavior.

Gate: three unlike neutral buildings assemble without open corners, roof gaps, stair clipping,
unsupported spans, blocked circulation, or renderer-authored repairs.

### Spatial Wave P4 — Guard Post family migration

Deliver:

- three required compositions through the ordinary planner;
- categorical diversity receipts;
- legal tactics and deterministic replays;
- one-bearing neutral clay gate, then four-bearing family proof;
- legacy template retained as comparison, not silently overwritten.

Gate: family passes the diversity rule and all existing Guard identity/mechanics obligations.

### Spatial Wave P5 — natural and cross-host generalization

Deliver:

- canyon and shore stress fixtures;
- second host/signature-kit proof;
- no site-id, seed, terrain-family, or capture special branches.

Gate: shared schemas and solvers pass unlike substrates and hosts.

### Spatial Wave P6 — visual systems return

Only now reapply:

- authored 32 px/ft materials and module-scale texture features;
- culture profiles;
- causal grime/growth/repair;
- light, props, sprite extrusion, and faction/world-truth signifiers; and
- FFT/TS visual rubric and final battle tests.

Gate: visual systems strengthen already-distinct neutral forms and do not become the source of
family diversity.

## 10. Proposed source layout

No file is created until its wave begins; these names establish ownership:

```text
src/engine/landform-skeleton.js
src/engine/spatial-parcels.js
src/engine/build-plots.js
src/engine/earthworks.js
src/engine/construction-sockets.js
src/engine/assembly-grammar.js
src/engine/wfc-solver.js
src/engine/spatial-compiler.js

data/spatial/landform-families.js
data/spatial/construction-chassis.js
data/spatial/construction-modules.js
data/spatial/golden-signature-kits.js

dev/verify-landform-parcels.mjs
dev/verify-build-plots-earthworks.mjs
dev/verify-construction-wfc.mjs
dev/verify-guard-family-diversity.mjs
dev/verify-spatial-compiler-generalization.mjs
```

`vignette-synthesizer.js` orchestrates these modules. `terrain-field.js` and
`architecture-forms.js` emit the selected products; neither becomes the semantic planner.

## 11. Render- and usage-budget law

The previous pass spent expensive full-family renders before macro diversity was proven. Future
work uses this evidence ladder:

| gate | evidence | maximum routine captures |
|---|---|---:|
| schema | JSON fixtures and verifier output | 0 |
| macro composition | top-down parcel/route/earthwork diagrams | 0–1 composite |
| neutral form | one production bearing per candidate | 3 |
| camera admission | four bearings for selected survivors only | 4 per survivor |
| material admission | one hero bearing plus one adversarial bearing | 2 per system |
| final family | full changed-seed/four-bearing census | once per promotion candidate |

Full beauty, culture, night, party, and material sheets are promotion evidence, not debugging loops.
Failed gates return to the narrowest causal layer. No material work proceeds while a macro-form or
neutral-clay failure remains.

## 12. Negative controls

The implementation must detect and reject:

- `NC-PARCEL-RECT-GRID` — parcels degraded into independent rectangular lots or cells;
- `NC-WFC-NATURAL-MACRO` — WFC used to invent the coastline, hillside, or canyon cell by cell;
- `NC-PLOT-FREE-FLATPAD` — a building receives a flat pad without a sourced earthwork;
- `NC-FAKE-BURIAL` — exterior walls merely overlap terrain visually without buried/exposed truth;
- `NC-AUTOFILL-ROUTE` — completion blocks or invents a route;
- `NC-AUTOFILL-SUPPORT` — completion creates floating/unsupported geometry;
- `NC-SOCKET-MACRO-AUTHORITY` — local module adjacency invents the site's primary sentence;
- `NC-SCALE-LEAK` — a large/monumental module appears in an ineligible small site;
- `NC-GOLDEN-GENERATOR` — a Golden Site id selects core algorithms;
- `NC-SEED-PATCH` — one accepted seed receives unique coordinates or repair geometry;
- `NC-RENDERER-EARTHWORK` — renderer changes terrain, support, topology, or openings; and
- `NC-DIVERSITY-BY-DRESSING` — palette, props, materials, or roof color satisfy mutation tests.

## 13. Completion criteria

This spatial correction is complete only when current repository evidence proves:

1. three categorically distinct legal Guard Post compositions;
2. one is genuinely embedded/subtractive to a hillside;
3. parcel/skeleton representation covers canyon and shore without WFC macro tiling;
4. one unlike host reuses the same plot, earthwork, and socket machinery;
5. WFC assemblies close supports, walls, roofs, stairs, routes, and terrain joins through bounded
   completion or typed fallback;
6. scale eligibility prevents inappropriate large modules while permitting monumental slices;
7. deterministic replay, stable ids, SceneTray/BattleMap identity, tactics, and four bearings pass;
8. no site/seed/culture/capture branch enters core planning;
9. renderer ownership remains projection-only; and
10. dressed FFT/TS-quality review is performed only on the structurally admitted family.

Until these are true, the current Guard Post remains useful terrain/material/renderer research, but
not a proven procedural family.

## Founder rulings — 2026-07-31 (Adam, in-session; evidence transferred)

Grounded in the 38-source method sweep, the 6,000-walk measured-demand and exact/MC
axis-space analysis, and the battle-first discussion of the same session. The source documents
now live in the Strangedeep packet routed by `docs/FFT-TS-RESEARCH-EXTERNAL.md`.

1. **P3 reframed — RULED.** The §5–§6 assembly layer is a bounded deterministic
   constraint solver over authored chassis with an authored completion grammar. The WFC
   framing is dropped (ancestry, not architecture): no shipped or published system lets
   WFC carry program obligations, and the piece layer adds zero categorical distinctness
   by §7.2's own definition. Piece-level deterministic collapse is retained for
   specificity and return recognition, never as a diversity source.
2. **Dealing memory — RULED.** The §7.2 categorical-signature receipt is promoted from a
   census check to a campaign-state dealing constraint: per-family memory of dealt
   signatures; new candidates must pass the diversity gate against the family's dealt
   set. Sizing per the math: ~6 chassis per high-frequency host, ~60–90 dealt
   compositions of library depth. Memoryless rolling is rejected as unable to meet
   replayability at any chassis count.
3. **Codex chassis throughput probe — GO.** Per docs/research/
   CODEX-CHASSIS-THROUGHPUT-PROBE.md: validator harness first, then the ten-chassis
   authoring probe; decision rule as written there.
4. **Tactical promise gate — GO, and the compiler order is battle-first.** The engine's
   goal is the fun of the best tactics games, not architectural verisimilitude (Adam:
   accuracy to "Roman guard post" is not the objective). The tactical skeleton is the
   SPINE — rolled from the walk digest before plots and assembly; earthworks and
   architecture are the justification pass. Fun becomes a measured gate:
   the transferred tactical-promise gate (FFT-corpus bands over eight tactical metrics,
   red-first against the legacy template; see `docs/FFT-TS-RESEARCH-EXTERNAL.md`). §2's
   compiler order is amended accordingly:
   TacticalCompositionPlan moves ahead of BuildPlotPlan as a first-class planning stage.
