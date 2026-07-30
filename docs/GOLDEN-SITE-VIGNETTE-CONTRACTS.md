---
type: system-contract
project: Genesis
status: WAVE-0 FROZEN FOR WAVE-1 — design boundary, not runtime implementation
created: 2026-07-29
updated: 2026-07-29
owner: Procedural Vignette Synthesizer
authority:
  - GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md
  - GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md
  - BATTLEMAP-TOWNTRAY-COMPOSITION.md
machine_companion: intel/golden-vignette-contract-v1.json
---

# GOLDEN SITE VIGNETTE CONTRACTS

## 0. Freeze ruling

This document freezes the first integration boundary for Waves 1–2 of the unified
Procedural Vignette Synthesizer. It defines the information that must cross the
story-to-space boundary and the evidence that must return. It does **not** freeze a
runtime serialization format, authorize Golden-number branches, or replace the
specialist plans named above.

The four public records are:

1. `VignetteRequest` — licensed story truth and synthesis intent;
2. `VignettePlan` — the selected, committed spatial answer;
3. `SemanticAssetDemand` — a required role that needs a visual/physical realization;
4. `SynthesisReceipt` — lineage, candidates, rejections, repairs, fallbacks, tests.

Wave 1 may add optional diagnostics or adapters. It may not remove a required field,
change its owner, or hide an unresolved value behind prose. A semantic change requires
`schemaVersion: 2` and a migration note.

## 1. Shared laws

- One request may compile into several projections, but only one committed place.
- Golden Site ids label acceptance fixtures; they are never runtime generator cases.
- Source facts are referenced and normalized. The synthesizer does not reroll them.
- Every request receives exactly one materialization disposition.
- Terrain and construction share one elevation datum, support graph, route graph,
  connection graph, and tactical reservation set.
- Natural terrain is a connected field. Local slopes, crests, dips, shoulders, cliffs,
  switchbacks, roots, and erosion may vary by cell, but their edge values and gradients
  must negotiate continuity with their neighbors unless a sourced break is intended.
- Constructed geometry may be chunky, orthogonal, retained, cut, bridged, terraced, or
  deliberately discontinuous. It must record how it meets the natural field.
- Height is budgeted and validated, not globally capped. Camera risk is solved through
  placement, cutaway, occlusion tests, or a smaller active window.
- The selected plan is deterministic from request content, pinned versions, and seed
  chain. Renderer randomness cannot change topology, access, cover, sight, or identity.
- Every required semantic role is materialized, truthfully proxied, explicitly omitted,
  or retained as unresolved demand.
- Combat promotes the committed plan. It cannot regenerate a more convenient arena.

## 2. `VignetteRequestV1`

### 2.1 Required envelope

```text
VignetteRequestV1
  schemaVersion
  requestId
  seedNamespace
  sourceProvenance[]
  worldContext
  walkContext
  siteIdentity
  hostProgram
  operatingModel
  substratePlan
  scaleContract
  transformStack[]
  materializationIntent
  encounterIntent
  actors[]
  knowledge
  budgets
```

| field | required shape and owner |
|---|---|
| `schemaVersion` | integer `1` |
| `requestId` | stable id assigned by the calling story/game path |
| `seedNamespace` | `{ rootSeed, namespace, adapterVersion }`; the synthesizer derives named child seeds |
| `sourceProvenance[]` | `{ sourceRef, factIds[], authority, treatment }`; `treatment` is `HARD_CANON`, `ARRANGEABLE_CANON`, `DERIVED_SUPPORT`, or `OPTIONAL_CONTEXT` |
| `worldContext` | `{ planRef, knownFactIds[], visibleFactIds[], portalRefs[], supportRefs[] }`; absence is represented by empty arrays, never a fabricated context |
| `walkContext` | `{ family, rollRef, activeSegmentRef, approachFacts[], connectionRefs[], returnStateRef }` |
| `siteIdentity` | `{ siteId, persistenceKey, priorPlanRef, frontierRefs[] }`; `siteId` is a world identity, not a Golden number |
| `hostProgram` | `{ owner, family, programRef, requiredRoles[], optionalRoles[] }` |
| `operatingModel` | `{ state, serviceRefs[], permissionRefs[], scheduleRef, claimantRefs[] }` |
| `substratePlan` | `{ family, datumRef, supportMode, requiredFeatures[], forbiddenFeatures[] }` |
| `scaleContract` | `{ bodyEnvelopes[], trafficEnvelope, interactionEnvelope, verticalUnit, presentationExtent }` |
| `transformStack[]` | ordered `{ transformId, owner, phase, sourceRefs[], deltas[] }` |
| `materializationIntent` | `{ disposition, purpose, requiredRoles[], quietSpace, continuationPolicy }` |
| `encounterIntent` | `{ mode, objectiveRefs[], deploymentRefs[], retreatRequired, promotionPolicy }` |
| `actors[]` | `{ actorId, bodyEnvelopeRef, side, arrivalRef, capabilityRefs[] }` |
| `knowledge` | `{ audience, knownFactIds[], concealedFactIds[], revealRules[] }` |
| `budgets` | `{ cells, activeWindows, maxCandidates, maxRepairPasses, geometry, assets, lights, drawCalls, camera }` |

`materializationIntent.disposition` is exactly one of:

- `MATERIALIZE_NEW`
- `CONTINUE_EXISTING`
- `TRANSFORM_EXISTING`
- `DECORATE_LOCAL`
- `NARRATIVE_ONLY`
- `UNRESOLVED`

The disposition classifies the obligation; it does not itself execute it:

- `MATERIALIZE_NEW` means that activation requires committing a new persistent site
  or window. It does not mean “generate a map immediately.”
- `DECORATE_LOCAL` means that a licensed local feature, trace, fixture, encounter, or
  evidence belongs inside the current window. “Decorate” does not mean cosmetic or
  mechanically irrelevant.

The `camera` budget names permitted bearings, pitch/distance envelope, protected
approach silhouettes, and occlusion limits. It does not dictate terrain height.

### 2.2 Adapter obligations

An adapter must:

1. preserve its caller's stable ids and source references;
2. name missing data instead of completing it imaginatively;
3. distinguish a host, transform, local feature, and narrative fact;
4. pass already-persisted geometry through `priorPlanRef` or `frontierRefs`;
5. emit the same normalized request for the same retained input and adapter version;
6. avoid renderer, combat, or Golden-case vocabulary; and
7. retain facts that are not visually licensed in `knowledge` or provenance.

## 3. `VignettePlanV1`

### 3.1 Required envelope

```text
VignettePlanV1
  schemaVersion
  planId
  requestRef
  selectedCandidateId
  semanticSitePlan
  materializationWindow
  spatialPlan
  tacticalCompositionPlan
  surfaceAssemblyPlan
  assetResolutionPlan
  projections[]
  diagnostics
```

| field | required shape and owner |
|---|---|
| `schemaVersion` | integer `1` |
| `planId` | stable committed-plan id; preserved across projections |
| `requestRef` | exact request id plus a content fingerprint |
| `selectedCandidateId` | chosen candidate recorded in the receipt |
| `semanticSitePlan` | roles, capacities, circuits, services, claims, permissions, mutable states, source refs |
| `materializationWindow` | active obligations, boundary, portals, quiet space, protected silhouettes, committed frontiers |
| `spatialPlan` | `SpatialPlanV2` reference or embedded product with stable cells, volumes, support, elevation, boundaries, connections, provenance |
| `tacticalCompositionPlan` | the shared composition product below |
| `surfaceAssemblyPlan` | terrain/structure pieces, join contracts, seams, material roles, condition, light mounts, cutaway |
| `assetResolutionPlan` | every demand id mapped to admitted asset, recipe, proxy, omission, or unresolved debt |
| `projections[]` | `{ projectionId, kind, planRef, precision, visibilityPolicy, cameraRef }` for SceneTray, TownTray, BattleMap, text, or DM digest |
| `diagnostics` | transparent measures; no single opaque “quality” score |

### 3.2 Frozen tactical composition fields

Wave 1 adopts the conceptual shape from `BATTLEMAP-TOWNTRAY-COMPOSITION.md` as its
integration boundary:

```text
TacticalCompositionPlanV1
  id / version / seed / sourceRefs[] / modeFamily
  envelope { cells, boundary, portals, voids }
  regions[] { id, kind, cells, tierRange, tags, sourceRefs }
  surfaces[] { id, layer, cells, tier, supportRef, clearance }
  connectors[] {
    id, fromSurface, toSurface, kind, cells, delta,
    direction, width, capacity, capability, cost, sourceRefs
  }
  routes[] {
    id, kind, fromAnchor, toAnchor, surfaceEdges,
    mobilityClass, materialDifference, sourceRefs
  }
  anchors[] { id, kind, cellOrRegion, facing, sourceRefs }
  reservations[] { id, kind, cells, hardness, sourceRefs }
  placementSlots[] { id, kind, cells, facing, footprint, sourceRefs }
  relaxations[] { rule, reason, before, after, sourceRefs }
  diagnostics
```

`surfaces[].layer` is present from v1 and begins at `0`; stacked traversal remains
future work. Regions may overlap. Routes and connectors refer to surfaces rather than
assuming one traversable height per X/Z cell.

### 3.3 Terrain/structure join contract

Every boundary between natural and constructed form records:

```text
join
  joinId
  naturalSurfaceRefs[]
  constructedMemberRefs[]
  relation
  edgeProfile
  gradeIn / gradeOut
  supportRefs[]
  drainageRefs[]
  traversability
  sourceRefs[]
```

`relation` is `CUT_INTO`, `RESTS_ON`, `RETAINS`, `BRIDGES`, `PINS`, `ABUTS`, or
`BURIES`. A natural discontinuity uses `NATURAL_BREAK` on the terrain field and must
name its cause family. This is the guardrail against isolated random tile slopes,
zipper diagonals, and Minecraft-like terrain chunks.

## 4. `SemanticAssetDemandV1`

Asset demand describes what the plan needs, not which production method should win.
The shared resolver decides between engine geometry, a Meshy donor, sprite extrusion,
material/trim work, an admitted existing asset, or a truthful proxy.

```text
SemanticAssetDemandV1
  schemaVersion
  demandId
  planRef
  sourceFactRefs[]
  semanticRole
  nounFamily
  requiredState
  physicalEnvelope
  supportAndMount
  interactions[]
  tactical
  appearance
  routeConstraints
  priority
  fallbackPolicy
```

Required details:

- `semanticRole` states the plan obligation, such as barrier, watch signal, water
  service, retaining member, door leaf, nest, or public sign.
- `nounFamily` is shared vocabulary, never a filename.
- `requiredState` names operating/dormant/damaged/open/closed or another licensed
  state without asking the material system to invent history.
- `physicalEnvelope` records footprint, height, clearance, orientation, and scale.
- `supportAndMount` records support surface, socket/mount, load, and contact.
- `interactions[]` record actors, verbs, reach, state changes, and stable object ids.
- `tactical` records collision, cover, sight, walkability, hazard, and destructibility.
- `appearance` records realm, culture, construction, material, condition, trim, and
  silhouette constraints.
- `routeConstraints` may permit or forbid production lanes; it may not select a vendor
  or asset id.
- `fallbackPolicy` names the minimum truthful proxy and whether omission is legal.

Whole sites, exact connective architecture, ordinary boxes/furniture, and random
condition variants are not Meshy demands. Geometry that changes collision, cover,
sight, support, mounted practical light, or interaction reach cannot be discharged by
texture alone.

### 4.1 Wave-2 identity and face/material staging

The frozen `SemanticAssetDemandV1` remains the public role demand. Wave 2 derives two
narrow records without changing the four frozen top-level records.

First, before topology, the semantic plan may create a
`SemanticIdentityReservation`:

```text
reservationId / planRef / sourceFactRefs[]
semanticRole / communicationObligation
visibilityPriority / interactionPriority
eligibleProjectionKinds[]
fallbackRequirement
```

It reserves recognition—not a face, material, vendor, asset id, or geometry. Purpose,
claim, service/work trace, creature shaping, condition evidence, operating-state
evidence, objective emphasis, and persistent consequence are legitimate reservation
roles.

Second, after `SurfaceAssemblyPlan` has emitted stable faces, the asset plan may derive
a `SurfaceMaterialDemandCandidateV1`:

```text
demandId / planRef / surfaceRef / faceRef / role
localFrame { origin, normal, tangent, bitangent, boundary, mask }
sourceFactRefs[] / mechanicTruthRefs[]
realm / culture / construction / materialFamily
conditionChannels / texelScale / projectionPolicy
trimReservations[] / decalReservations[] / shallowReliefReservations[]
causeRefs[] / candidateLanes[] / fallbackPolicy
```

The initial shared roles are `WALKABLE_TOP`, `NATURAL_SLOPE`, `CUT_FACE`,
`RETAINING_FACE`, `WALL_FIELD`, `CROWN_COPING`, `JAMB_REVEAL`, `ROOF_DECK`,
`WATERLINE_EDGE`, `UNDERSIDE_SUPPORT`, `MOUNT_FACE`, and `SCENERY_FACE`.

The derived record belongs to `surfaceAssemblyPlan` plus `assetResolutionPlan`; it is
not a fifth public contract and is not yet a saved runtime schema. If it later needs
cross-version persistence, that promotion requires an explicit version and migration.

Required semantic boundaries:

- the live combined `Prison / Asylum` source remains unresolved until an upstream
  purpose discriminator selects custody/confinement or care/treatment (or another
  explicit owner); visual treatment may not guess;
- a pure cavern may receive substrate, exposure, wetness, or geological treatment but
  cannot imply a lair without a claimant/ecology fact;
- an explicit creature lair may reserve creature shaping, abrasion, access, nesting,
  food/waste, and claimant evidence appropriate to the creature; and
- `RUIN` is physical condition only. Occupancy, dormancy, operation, claim, and
  maintenance remain independent source facts.

Assetforge routes the derived demands through its shared quarantine/proof/receipt
envelope. It may wrap Material Maker, ground, palette, trim, decal, atlas, sprite
extrusion, and other canonical specialists. It may not create parallel authorities.

## 5. `SynthesisReceiptV1`

```text
SynthesisReceiptV1
  schemaVersion
  receiptId
  requestRef / planRef
  engineVersions
  seedChain[]
  sourceLineage[]
  candidates[]
  selectedCandidateId
  hardRejections[]
  scoring
  repairs[]
  relaxations[]
  assetDecisions[]
  omissions[]
  unresolved[]
  validation
  performance
  evidence[]
  fingerprints
```

The receipt must make the answer auditable:

- `seedChain[]` names every deterministic substream and its derivation.
- `sourceLineage[]` records roller/source reference, adapter, treatment, and consumed
  output ids.
- `candidates[]` records topology family, hard-pass state, measures, score components,
  and rejection ids; failed candidates are evidence, not discarded noise.
- `hardRejections[]` names the exact truth, access, support, collision, camera,
  knowledge, or budget rule.
- `scoring` exposes separate components for route choice, tactical tension,
  composition hierarchy, quiet space, identity, four-bearing legibility, continuity,
  and asset cost.
- `repairs[]` and `relaxations[]` name legal operators with before/after values.
- `assetDecisions[]` maps every demand to asset, recipe, proxy, or omission plus why.
- `validation` retains semantic, spatial, tactical, camera, persistence, save/load,
  and projection results.
- `evidence[]` links captures, playtests, battle simulations, census runs, and logs.
- `fingerprints` cover request, committed plan, mechanics plan, asset resolution, and
  each projection.

No `qualityScore` may substitute for the component measures. Any fallback that changes
a canonical role, access, objective, or persistent state is a failed candidate rather
than a successful degradation.

## 6. Exact Wave-0 negative controls

The retained selectors live in `intel/golden-vignette-wave0-fixtures.json`.

| id | input or mutation | required result |
|---|---|---|
| `NC-GOLDEN-BRANCH` | runtime behavior switches on Golden Site number | reject build/design |
| `NC-RANDOM-TILE-TERRAIN` | independently sampled tile slopes and heights | continuity validator rejects |
| `NC-DIAGONAL-ZIPPER` | alternating diagonal split creates a zipper ridge | seam/normal validator rejects |
| `NC-HEIGHT-CAP` | terrain is globally clamped to one storey or five feet | budget/feature validator rejects |
| `NC-CAMERA-MUTATES-PLAN` | camera bearing changes topology or access | replay/fingerprint validator rejects |
| `NC-COMBAT-REGENERATES` | BattleMap promotion changes committed geometry | identity/fingerprint validator rejects |
| `NC-MISSING-REQUIRED-ROLE` | asset fallback omits barrier, light, service edge, or another required role | asset validator rejects |
| `NC-WHOLE-SITE-DONOR` | a generated donor mesh replaces exact connective site geometry | resolver rejects |
| `NC-RANDOM-CONDITION` | renderer adds damage/grime without a causal state | provenance validator rejects |
| `NC-FALSE-CONTEXT-ROUTE` | context dressing implies an uncommitted approach or portal | affordance validator rejects |
| `NC-TRANSFORM-REPLACES-HOST` | dormant or layered-control transform erases the host circuit | semantic validator rejects |
| `NC-SPRAWLING-WINDOW` | solver expands the board instead of using a frontier | materialization validator rejects |

## 7. First retained selectors

- Small semantic fixture: `VENUE-TAVERN-01`, hero receipt `TVR-CHROME-04`, with
  `TVR-GLOOM-01` as changed seed and `TVR-FRONTIER-04` as lodging/adversarial
  companion.
- First visual/tactical fixture: `GP-SHAPE-01 — Shoulder Overlook Through-Road`.
- Guard context fixture: `CTX-GP-19 — High-Harrow Gate + Bone & Sinew`.
- Guard changed-shape seeds and hostile shoulder/camera envelope are required Wave-2
  outputs. They do not yet exist and are deliberately recorded as `PLANNED`, not
  assigned invented receipt ids.

## 8. Versioning and admission

The machine companion records required top-level fields and enum values. Wave 1 earns
runtime admission only when:

1. a validator rejects missing required fields and unknown enum values;
2. every adapter produces a deterministic request fingerprint;
3. every request receives a disposition and unresolved reasons remain countable;
4. no renderer, projection, or combat system owns semantic completion;
5. prior saved records can be wrapped through an explicit v0 adapter; and
6. the Tavern and Guard selectors can be loaded without a Golden-number conditional.
