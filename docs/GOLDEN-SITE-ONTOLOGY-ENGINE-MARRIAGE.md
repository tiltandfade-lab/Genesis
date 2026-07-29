---
type: system-contract
created: 2026-07-26
updated: 2026-07-28
status: ACCEPTED DIRECTION — ontology and integration contract; 2026-07-28 adversarial-review redline; implementation unauthorized
owner: story-to-site semantic compilation and Golden Site coverage taxonomy
authority:
  - PROCEDURAL-DUNGEON-ARCHITECTURE-SKETCH.md
  - BATTLEMAP-TOWNTRAY-COMPOSITION.md
  - GOLDEN-SITES-CATALOG.md
  - GOLDEN-SITE-ROLLER-PRESERVATION-LEDGER.md
related:
  - GOLDEN-SITE-CONCEPTING-GUIDELINES.md
  - GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md
  - TAVERN-VENUE-ROUTING-BRIEF.md
  - CODEX-CLAY-LADDER-BRIEF.md
---

# GOLDEN SITE ONTOLOGY / ENGINE MARRIAGE

## Purpose

Genesis does not need twelve isolated level generators. It needs one causal path from
the story engine's world truth to several truthful visual and playable projections.
The twelve Golden Sites are the retained coverage portfolio used to prove that path.
They are not a runtime enum, a replacement for the urban/wilderness/dungeon walks, or
twelve mutually exclusive kinds of place.

This contract answers four questions:

1. what a Golden Site is;
2. how walks, places, host programs, transformations, site plans, and projections fit
   together;
3. when a canonical situation such as layered control becomes spatial; and
4. how common venues such as taverns use the system without becoming stray special
   cases.

The story engine remains the first authority. The visual layer must be broad enough to
answer its requests, but it may not simplify, replace, or secretly reroll them.

## Founder direction captured by this pass

Adam, 2026-07-26:

> “right now we have the urban walk, the wilderness walk, and the dungeon walk, and
> then there are just general gameplay assets that connect the walks which can be all
> manner of generated things from various sources, i would like to corral all of these
> things into coherent systems that aren't depending on rogue or stray bits as much to
> completely fulfil the visual requests of the story engine, but the story engine comes
> first”

> “some large sites should be allowed to have large swaths of land or space that is
> just that, space”

> “some plazas have a huge footprint and all the stalls are crammed into one arcade off
> in the corner”

> “at what threshhold is a map eligible for this layer to activate? and how to we keep
> these kinds of tensions canon in a place that wouldn't likely roll a large map”

These are binding design goals for this contract. Exact schemas, module boundaries,
weights, and numeric capacity thresholds remain implementation work.

## 1. The ruling: a Golden Site is a proof role

A **Golden Site** is a deterministic, provenance-backed integration case retained
because it proves that the shared engine can preserve a difficult family of story
requests through semantic planning, spatial realization, gameplay, and visual
projection.

A Golden Site is therefore:

- an acceptance fixture and coverage obligation;
- a source of reusable host, transform, construction, material, and composition needs;
- a generator family or adversarial case only where that role is genuinely distinct;
- retained from ordinary generation, never selected by a seed-specific branch; and
- allowed to overlap other Golden Sites because the runtime concepts themselves
  compose.

A Golden Site is not:

- the only route by which that kind of place may exist;
- a map-size bucket;
- a walk family;
- a single mesh or authored hero map;
- an exhaustive ontology of every venue players can visit; or
- permission for a renderer to infer story truth from available assets.

The portfolio may keep its familiar numbered names. Runtime data should not need a
`goldenSiteType: 8` field in order to represent layered control.

## 2. Runtime ontology

The following terms are conceptual contracts. Final schema names may differ, but their
authorities must remain separate.

| Concept | Owns | Does not own |
|---|---|---|
| `WorldContext` | Realm, region, climate, factions, pressures, history, architecture/material axis, nearby facts, time and weather | Local geometry or a preferred visual theme |
| `WalkFamily` | The traversal grammar that brought play here: urban, wilderness, or dungeon; segments, approach, exits, and domain continuity | The complete program of every bounded place encountered |
| `SiteIdentity` | Persistent identity, lineage, canonical extent, domain facets, observation hardness, and stable links | Current occupier, one building footprint, or active render window |
| `HostProgram` | What the place does and must support: custody, worship, extraction, hospitality, market exchange, route service, habitation, predation, defense/fortification, and so on | Culture, current crisis, material style, or exact coordinates |
| `OperatingModel` | Required roles, workflows, services, capacities, property flows, schedules, permissions, maintenance, failure modes, and recoveries | Decorative dressing or an arbitrary room list |
| `SubstratePlan` | What supports the host: support/foundation mode, thickness and load where consequential, datum, mobility, anchoring, perimeter, state, and trusted traversal where present | The host's purpose, an automatic ownership relationship, or a universal requirement that all ground be unusual |
| `ScaleContract` | Body/object spans, aperture and route capacities, reach, traversability, reference scale, and the affordance differences that make scale consequential | Creature identity, a fixed three-to-one eligibility threshold, or permission to enlarge the tactical cell |
| `GranularMass` | Shared loose-material terrain behavior: material class, repose/stability, flow trigger, support/burial state, accumulation source, and recovery | Hoard ownership by Site 11, a decorative pile, or one material-specific implementation |
| `TransformStack` | Cross-host canonical changes such as dormant, layered control, siege, flooding, occupation, repurposing, damage, repair, or breach | A replacement host identity or automatic map growth |
| `MaterializationWindow` | The finite active semantic/spatial slice needed for present play, with honest frontiers into latent or external truth | The whole canonical extent of a settlement, institution, wilderness, or living domain |
| `SemanticSitePlan` | Stable zones, functional homes, required relationships, access profiles, capacities, property custody, secrets, fronts, and typed connections | Meshes, camera composition, incidental coordinates, or visual rolls |
| `TacticalCompositionPlan` | One legal arrangement of licensed routes, regions, connectors, reservations, sight relations, objectives, quiet space, and support geometry | New nouns, new secrets, or a substitute story |
| `SurfaceAssemblyPlan` | Structure recipes, surface frames, material roles, sockets, mounts, cutaway and deterministic visual assembly | Mechanics or independent world generation |
| `Projection` | SceneTray, TownTray, BattleMap, DM, and player views of the same committed identity and plan | A second place or combat-only replacement arena |
| `AssetResolver` | The best admitted visual realization for required semantic roles, with declared fallbacks and coverage receipts | Deciding that a convenient model must exist in canon |

`HostProgram` and `OperatingModel` may be stored together in early implementations.
They are separated here because “a tavern” names a program while its actual kitchen,
lodging, stable, staff, service schedule, credit, storage, sanitation, and private-room
obligations vary.

## 3. The engine marriage

The intended authority flow is:

```text
story/world canon + remembered facts
  -> urban | wilderness | dungeon walk context
  -> persistent SiteIdentity
  -> HostProgram + OperatingModel
  -> SubstratePlan + ScaleContract
  -> ordered TransformStack
  -> MaterializationWindow
  -> SemanticSitePlan
  -> SpatialPlanV2 legality
  -> TacticalCompositionPlan
  -> SurfaceAssemblyPlan
  -> AssetResolver
  -> SceneTray | TownTray | BattleMap | DM projection
```

This extends, rather than replaces, the pipelines in
`PROCEDURAL-DUNGEON-ARCHITECTURE-SKETCH.md` and
`BATTLEMAP-TOWNTRAY-COMPOSITION.md`.

### 3.1 Story authority

World and story state own:

- which place exists and why;
- who claims, operates, depends on, opposes, or remembers it;
- what the player has observed or been promised;
- its host program, current use, history, pressures, secrets, and obligations;
- whether control is singular, layered, disputed, absent, or actively violent; and
- what objects, people, routes, evidence, property, and consequences must remain true.

The semantic compiler may reconcile lower-authority alternatives within licensed
bounds. It may not make a story request disappear because the available asset set is
inconvenient.

### 3.2 Walk authority

The three walks remain real, useful traversal families:

- **urban walk** — streets, blocks, districts, public thresholds, institutions, and
  dense social adjacency;
- **wilderness walk** — terrain journey, routes, weather, exposure, landmarks, camps,
  lairs, ruins, and remote bounded sites; and
- **dungeon walk** — rooms, connections, depth, hidden routes, contained hazards, and
  interior chains.

A bounded site is entered from a walk; it does not replace that walk. The same tavern
program may be reached from an urban street, a wilderness road, or a dungeon-like
subterranean settlement. The approach and portal obligations change, while the venue's
identity and committed facts persist.

### 3.3 Semantic compilation

The semantic compiler asks, in order:

1. What canonical identities and facts already exist?
2. Which host program and operating obligations apply?
3. Which substrate and scale facts are consequential in this scene?
4. Which transforms are active, in what causal order?
5. What present action requires materialization?
6. What is the smallest honest semantic window that supports those obligations?
7. Which facts require exact spatial homes now, which remain stable latent commitments,
   and which are presentation only?
8. Can the licensed window support the result?
9. Which legal composition best expresses it while preserving quiet space?

This is the seam that corrals general gameplay assets. A required hearth, intake desk,
evidence cabinet, well, serving counter, holding cell, private room, or lookout is first
a semantic role with provenance. Geometry and assets realize that role later.

## 4. Semantic capacity, not map-size eligibility

No map-size threshold decides whether a canonical social or political situation exists.
Map size affects **how much of it must be spatialized now**, not whether it is true.

A map is eligible for a transform when its canonical facts satisfy that transform's
semantic predicate. A tiny site may carry intense faction tension. A huge site may have
one claimant and acres of quiet ground.

### 4.1 Capacity test

Before expanding a materialization window, the planner tests whether the current
licensed window can truthfully home:

- required public, private, service, secure, hazardous, and circulation functions;
- distinct current access profiles and schedules;
- attributed people, property, evidence, resources, and objectives;
- required secrets or alternate routes that were committed before observation;
- tactical reservations needed by the current mode; and
- safety, support, visibility, and egress obligations.

Sharing is preferred when compatible. One locked cabinet can hold separately attributed
property and case evidence in a small jail; one tavern room can change claimant by
schedule; one court can carry several social jurisdictions. Semantic identity must not
be collapsed merely because its physical realization is shared.

### 4.2 Overflow law

The planner may enlarge or reveal another part of a site only when:

1. required semantic obligations cannot fit without contradiction or unusable
   circulation;
2. the canonical site has licensed unmaterialized capacity or an established external
   provider;
3. the new area does not contradict observed extent, adjacency, portals, or promises;
4. the frontier or external route was committed before it becomes useful; and
5. the expansion receives stable ids, lineage, and a replayable receipt.

If those conditions fail, the system must share, schedule, externalize through a real
provider, degrade honestly, or refuse the incompatible realization. It may not invent a
helpful cellar, faction wing, evidence annex, or secret exit after the player needs it.

### 4.3 Honest empty space

Large footprints do not create a density quota. Plazas, yards, halls, caves, fields,
industrial floors, and fortress grounds may contain broad quiet regions while activity
clusters into one arcade, service edge, gate, head position, camp center, or occupied
wing.

Quiet space is a planned role. It may carry:

- circulation and sight;
- ceremony, assembly, work clearance, grazing, drainage, or fire separation;
- threat exposure, distance, delay, and retreat;
- a contrast field that makes one active knot legible; or
- simply the truthful scale of the place.

The renderer may not scatter props merely to prove that a large map was used.

### 4.4 Stress contracts are not hidden site generators

Sites 9, 11, and 12 expose cross-cutting contracts the original ontology left implicit.
They remain Golden proofs, but their runtime responsibilities belong to shared concepts:

- **Site 9** proves a Defense/Fortification host under layered control across more than one
  committed `MaterializationWindow`. The host owns gates, walls, stores, barracks, command,
  wall routes, service, and defensive continuity. `LayeredControl` owns claimants,
  attributed ground, recognition, permissions, and fronts. The window system owns stable
  cross-window identity. Site 9 owns no fourth copy of those systems.
- **Site 11** proves a `ScaleContract` across unlike hosts. A large-body aperture, an
  inherited giant-built hall, or anatomy used as terrain may require shared assemblies,
  but Golden number 11 is not their runtime owner.
- **Site 12** proves a `SubstratePlan` and, separately, the case where a cross-host
  transformation changes or destroys the substrate a host depends on. A raft, tidal
  ground, living back, or reactive crust does not become a host program merely because it
  supports one.

The ordinary **Defense/Fortification** host is therefore a real program even when no Site-9
relationship is active. It may be implemented as the large end of Site 1's defense family
or as an unnumbered host family; that implementation choice does not change Site 9's proof
role. A single-garrison fortress remains a fortress. A fortress becomes the Site-9 proof
case only when the scale/window and attributed-ground obligations are both present.

Likewise, `SubstratePlan` facts are orthogonal rather than one promotion ladder. Support
mode, load behavior, mobility, cyclic datum, agency, transformation phase, and ownership
may vary independently. `ScaleContract` eligibility is consequential affordance
difference, not a magic ratio: the first retained proof may choose a visually obvious
Huge-versus-Medium pair without making that ratio universal.

## 5. Layered control as a cross-host transform

Golden Site 8 is retained as the **Layered Control integration case**. It is not a
unique geometry generator.

### 5.1 Eligibility predicate

`LayeredControl` is eligible when canon contains:

1. at least two persistent, simultaneous claims on the same site, program, resource,
   population, route, or schedule; and
2. a consequential difference in at least one control dimension:
   authority, access, recognition, service, custody, property, information, ritual,
   labor, protection, taxation, time, or violence.

Temporary co-presence alone is not enough. Two groups drinking in one tavern are not
automatically layered control. A proprietor who runs the public room while a gang owns
the back room and controls deliveries is.

### 5.2 Expression ladder

The transform can materialize at the lowest truthful rung:

| Rung | Spatial expression |
|---|---|
| `LC-0 latent` | Canon and schedules only; no added active geometry |
| `LC-1 social` | Same room and fixtures; recognition, permissions, service, testimony, or schedule differs |
| `LC-2 localized` | One threshold, fixture, cabinet, table, workface, shrine, or back room carries the split |
| `LC-3 distributed` | Several zones or routes have different access/claim profiles, but the host remains one coherent site |
| `LC-4 site-wide` | Control shapes circulation, services, staffing, signals, and objectives across the active window |
| `LC-5 open conflict` | Fronts are active; barriers, patrols, hazards, objectives, and tactical state expose the conflict |

Promotion follows canonical events and semantic overflow, not level size. Demotion is
also legal: a resolved faction conflict may leave changed access, scars, schedules, or
memory without preserving a permanent combat layout.

### 5.3 Required transform outputs

The transform contributes deltas rather than a replacement plan:

- claimant and recognition profiles;
- claim targets and affected semantic roles;
- access, schedule, service, custody, and information deltas;
- sparse occupation zones and fronts;
- visible tells, secret evidence, and knowledge gates;
- transition triggers and legal outcomes; and
- any newly required spatial obligations.

The host still owns its purpose. A layered-control tavern must remain capable of
hospitality; a layered-control mine must remain causally related to extraction; a
layered-control prison must still preserve custody and property obligations.

## 6. The twelve-site portfolio after classification

The numbered portfolio remains useful, but its members prove different runtime roles.

| Site | Portfolio role | Primary proof |
|---:|---|---|
| 1 Guard Post | host/program family | route control, threshold, observation, occupied support |
| 2 Camp / Service | host/program family | transient or rooted route service, surface anchoring, permanence ladder |
| 3 Dormant / Abandoned | cross-host transform | absence, residue, failed service, dormant machinery, inherited topology |
| 4 Monastery / Commune | host/program family | communal institution, court, repeated bays, ritual/service hierarchy |
| 5 Mine / Workshop | host/program family | extraction/work circuits, logistics, failure and recovery |
| 6 Prison / Custody | host/program family | custody, intake, property/evidence, control, release and escape |
| 7 Natural Lair | host/program family | ecology/claim, body-scaled access, found or excavated space |
| 8 Layered Control | cross-host transform | two or more persistent control systems over one host |
| 9 Contested Fortress | scale/relationship stress case | Defense/Fortification host + attributed ground + persistent multi-window extent |
| 10 Settlement / Urban Institution | host/program family | public frontage, aggregation, cold population, urban continuity |
| 11 Mixed Scale / Dragon Domain | scale/relational stress case | `ScaleContract`, unlike-body affordances, and local-to-domain continuity |
| 12 Anomalous / Living / Mobile | substrate/terminal-transformation stress case | `SubstratePlan`, unusual support/extent/motion, optional tenure, and terminal substrate transformation |

This classification prevents Sites 3 and 8 from growing rival room grammars while
preserving their value as cross-host proofs. It also prevents Sites 9, 11, and 12 from
becoming disguised generators: each composes a real host with shared window, scale,
substrate, and transform contracts. They remain essential because they stress combinations
the ordinary host proofs do not.

## 7. Ordinary venues and the Golden portfolio

The story engine can request many common programs that do not deserve their own
numbered Golden Site: taverns, shops, shrines, homes, clinics, workshops, guild rooms,
courts, warehouses, bathhouses, and similar venues.

These are **ordinary venue programs**. They use:

- a live Place Spine archetype or typed building kit where available;
- one or more walk contexts;
- the shared host/operating-model compiler;
- the same transform stack;
- a bounded venue recipe in the shared composition compiler; and
- the same surface, asset, camera, and projection contracts.

High-frequency or unusually connective venues receive **retained Golden Venue
fixtures**. A Golden Venue fixture is not a thirteenth Golden Site. It proves that the
ordinary path works between the large portfolio cases.

The first required fixture is `VENUE-TAVERN-01`; its routing and current-source audit
live in `TAVERN-VENUE-ROUTING-BRIEF.md`.

## 8. Semantic asset resolution

Every visual request from a committed plan must enter through a semantic role:

```text
required role + physical envelope + interaction/support needs
  -> admitted exact recipe
  -> compatible generic structure/prop recipe
  -> truthful primitive/proxy
  -> presentation-only omission when mechanically and narratively safe
```

The resolver records:

- requested semantic role and source fact;
- selected asset or procedural recipe;
- compatibility checks;
- fallback used;
- whether collision, cover, sight, support, light, or interaction was affected; and
- unresolved coverage debt.

No gameplay subsystem may spawn an unregistered visual noun directly into a tray.
Likewise, a missing model must not delete the bar, cell, threshold, evidence store,
hearth, well, machinery, or person that canon requires.

## 9. Projection and identity continuity

SceneTray, TownTray, and BattleMap are precision and presentation modes over one place.
Stable site, zone, threshold, surface, object, and actor ids survive promotion.

- Social play may use coarse regions and scheduled claim profiles.
- Exploration may materialize more zones while respecting committed frontiers.
- Combat may promote actors and reservations to exact cells.
- Cutaway may omit roofs or overhead boundaries visually without deleting them.
- Background/context projection may explain portals and surrounding world without
  adding traversable cells or false affordances.

Combat does not regenerate the tavern, prison, market, or monastery into a convenient
arena. It activates the legal tactical reading already supported by the same plan.

## 10. CL-R3 non-overlap and handoff

The concurrent CL-R3 pass is the **construction provider**, not semantic authority.
This ontology pass is docs-only and does not change CL-R3's active files or contracts.

CL-R3 owns and proves neutral-clay:

- runs, corners, ends, openings, tiers, risers, connectors, and blockers;
- generic grid/socket/piece/access contracts; and
- measurable construction behavior and negative controls.

This contract owns:

- why a host or transform requires those pieces;
- which semantic roles, capacities, access profiles, and relationships must be
  realized; and
- how one committed plan reaches several projections.

No changes from this pass are authorized in:

- `src/engine/clay-room.js`;
- `src/ui/theater-clay-room.js`;
- `dev/verify-clay-room.mjs`;
- `docs/DIRECTION.md`;
- `STRUCTURE-KIT-CATALOG.md`;
- `CLAYROOM-RESET-LADDER.md`; or
- renderer and manifest files owned by the active CL-R3 lane.

Before implementation, reconcile the finished CL-R3 construction product against the
semantic obligations here. The semantic compiler consumes admitted construction
capabilities; it does not retroactively redefine the CL-R3 proof.

## 11. Acceptance tests for the marriage

The ontology/engine marriage is not proven until retained fixtures demonstrate:

1. one host program reached from each walk family without becoming three unrelated
   site generators;
2. one transform applied to at least three unlike hosts with no host-specific transform
   branch;
3. a tiny layered-control venue whose tension remains real without map expansion;
4. a large site with broad quiet space and one dense activity knot;
5. semantic overflow that legally expands a precommitted materialization frontier;
6. the same venue promoted SceneTray → BattleMap without changed identity or geometry;
7. missing exact assets degrading through the resolver without losing semantic truth;
8. context-off/on views preserving mechanics, ids, portals, and knowledge;
9. deterministic replay with `rollerLineage`, `sourceRollRefs`, transform receipts,
   materialization receipts, and fallback receipts; and
10. a Defense/Fortification host replayed as one claimant and as a Site-9 multi-window
    composition without changing its host identity;
11. one `ScaleContract` changing route/aperture affordances on two unlike hosts without a
    Site-11-specific plan branch;
12. one `SubstratePlan` supporting two unlike hosts, plus one Becoming/Intrusion delta that
    changes substrate state without becoming a second host generator; and
13. no seed-, row-, culture-, host-, or Golden-number-specific patch.

`VENUE-TAVERN-01` is the first small-venue proof for items 2, 3, 6, and 7. Site 8 does
not earn its portfolio gate from a tavern alone; it must also prove the transform on at
least two unlike hosts.

## 12. Implementation order

This contract authorizes no implementation. When its lane opens, the smallest coherent
order is:

1. normalize existing world/place/walk/building provenance into one read-only semantic
   request;
2. introduce explicit `HostProgram`, `SubstratePlan`, `ScaleContract`, `TransformStack`,
   and `MaterializationWindow` boundaries without replacing live rollers;
3. compile one existing tavern record into a minimal semantic venue plan;
4. mount that plan on the shared composition compiler and preserve identity through
   SceneTray/BattleMap;
5. add `LayeredControl` as a delta over the same tavern;
6. repeat the transform on Prison and Mine or another unlike host;
7. prove legal overflow and honest empty space; and
8. only then generalize schemas and migrate additional venue programs.

The Golden portfolio remains the acceptance harness around this work. The story engine
remains the source of infinite variety.
